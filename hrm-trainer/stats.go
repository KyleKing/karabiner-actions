package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"
)

// PerKeyStats tracks statistics for a specific key
type PerKeyStats struct {
	Key                rune
	TotalPresses       int
	AccidentalMods     int
	AverageDuration    time.Duration
	MinDuration        time.Duration
	MaxDuration        time.Duration
	Durations          []time.Duration
	IsHRM              bool
	Modifier           string
}

// KeyStatistics manages per-key statistics
type KeyStatistics struct {
	Stats map[rune]*PerKeyStats
}

// NewKeyStatistics creates a new key statistics tracker
func NewKeyStatistics() *KeyStatistics {
	return &KeyStatistics{
		Stats: make(map[rune]*PerKeyStats),
	}
}

// RecordKeyPress records a key press in the statistics
func (ks *KeyStatistics) RecordKeyPress(kp KeyPress, wasAccidental bool) {
	stats, exists := ks.Stats[kp.Key]
	if !exists {
		stats = &PerKeyStats{
			Key:       kp.Key,
			IsHRM:     kp.IsHRM,
			Modifier:  kp.Modifier,
			Durations: make([]time.Duration, 0),
		}
		ks.Stats[kp.Key] = stats
	}

	stats.TotalPresses++
	if wasAccidental {
		stats.AccidentalMods++
	}

	stats.Durations = append(stats.Durations, kp.Duration)

	// Update min/max
	if stats.MinDuration == 0 || kp.Duration < stats.MinDuration {
		stats.MinDuration = kp.Duration
	}
	if kp.Duration > stats.MaxDuration {
		stats.MaxDuration = kp.Duration
	}

	// Recalculate average
	var total time.Duration
	for _, d := range stats.Durations {
		total += d
	}
	stats.AverageDuration = total / time.Duration(len(stats.Durations))
}

// GetAccuracyPercentage returns the accuracy percentage for a key
func (pks *PerKeyStats) GetAccuracyPercentage() float64 {
	if pks.TotalPresses == 0 {
		return 0
	}
	return float64(pks.TotalPresses-pks.AccidentalMods) / float64(pks.TotalPresses) * 100
}

// GetRating returns a rating (1-5) for the key performance
func (pks *PerKeyStats) GetRating() int {
	accuracy := pks.GetAccuracyPercentage()
	if accuracy >= 95 {
		return 5
	} else if accuracy >= 85 {
		return 4
	} else if accuracy >= 75 {
		return 3
	} else if accuracy >= 60 {
		return 2
	}
	return 1
}

// GetProblemKeys returns keys sorted by problem severity
func (ks *KeyStatistics) GetProblemKeys(threshold int) []*PerKeyStats {
	problems := make([]*PerKeyStats, 0)

	for _, stats := range ks.Stats {
		if stats.IsHRM && stats.TotalPresses >= threshold {
			problems = append(problems, stats)
		}
	}

	// Sort by accuracy (worst first)
	sort.Slice(problems, func(i, j int) bool {
		return problems[i].GetAccuracyPercentage() < problems[j].GetAccuracyPercentage()
	})

	return problems
}

// GetTopKeys returns the most frequently pressed keys
func (ks *KeyStatistics) GetTopKeys(limit int) []*PerKeyStats {
	all := make([]*PerKeyStats, 0, len(ks.Stats))
	for _, stats := range ks.Stats {
		all = append(all, stats)
	}

	sort.Slice(all, func(i, j int) bool {
		return all[i].TotalPresses > all[j].TotalPresses
	})

	if len(all) > limit {
		return all[:limit]
	}
	return all
}

// GenerateProblemDrill generates practice text focusing on problem keys
func (ks *KeyStatistics) GenerateProblemDrill(config *PracticeConfig, wordlists map[string]*MonkeyTypeWordlist) string {
	problems := ks.GetProblemKeys(10)
	if len(problems) == 0 {
		return "No problem keys detected yet - keep practicing!"
	}

	// Get problem key runes
	problemRunes := make(map[rune]bool)
	for _, p := range problems {
		if len(problemRunes) >= 3 { // Focus on top 3 problem keys
			break
		}
		problemRunes[p.Key] = true
	}

	// Find words containing problem keys
	drillWords := make([]string, 0)

	// Try to use wordlists first
	if len(wordlists) > 0 {
		for _, wordlist := range wordlists {
			for _, word := range wordlist.Words {
				hasProblems := false
				for _, ch := range word {
					if problemRunes[ch] {
						hasProblems = true
						break
					}
				}
				if hasProblems && len(drillWords) < 20 {
					drillWords = append(drillWords, word)
				}
			}
			if len(drillWords) >= 20 {
				break
			}
		}
	}

	// Fallback to simple combinations if no wordlists
	if len(drillWords) == 0 {
		for key := range problemRunes {
			drillWords = append(drillWords, string(key)+string(key)+string(key))
		}
	}

	// Create drill text
	drill := "Focus: "
	for key := range problemRunes {
		stats := ks.Stats[key]
		drill += fmt.Sprintf("'%s'(%s %.0f%%) ", string(key), stats.Modifier, stats.GetAccuracyPercentage())
	}
	drill += "\n\nPractice: "
	for i, word := range drillWords {
		if i > 0 {
			drill += " "
		}
		drill += word
		if i >= 15 {
			break
		}
	}

	return drill
}

// Session represents a practice session
type Session struct {
	Date          time.Time              `json:"date"`
	Duration      time.Duration          `json:"duration"`
	Mode          string                 `json:"mode"`
	TotalPresses  int                    `json:"total_presses"`
	Errors        int                    `json:"errors"`
	WPM           float64                `json:"wpm"`
	Accuracy      float64                `json:"accuracy"`
	AvgHRMTiming  time.Duration          `json:"avg_hrm_timing"`
	ProblemKeys   []string               `json:"problem_keys"`
	PerKeyStats   map[string]SessionKeyStats `json:"per_key_stats"`
}

// SessionKeyStats stores simplified per-key stats for sessions
type SessionKeyStats struct {
	Presses       int           `json:"presses"`
	AccidentalMods int          `json:"accidental_mods"`
	AvgDuration   time.Duration `json:"avg_duration"`
}

// SessionHistory manages historical sessions
type SessionHistory struct {
	Sessions []Session `json:"sessions"`
	filepath string
}

// LoadSessionHistory loads session history from disk
func LoadSessionHistory() (*SessionHistory, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil, err
	}

	dir := filepath.Join(homeDir, ".hrm-trainer")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	filepath := filepath.Join(dir, "sessions.json")

	history := &SessionHistory{
		Sessions: make([]Session, 0),
		filepath: filepath,
	}

	// Try to load existing history
	data, err := os.ReadFile(filepath)
	if err != nil {
		if os.IsNotExist(err) {
			return history, nil // New history
		}
		return nil, err
	}

	if err := json.Unmarshal(data, &history.Sessions); err != nil {
		return nil, err
	}

	history.filepath = filepath
	return history, nil
}

// Save saves the session history to disk
func (sh *SessionHistory) Save() error {
	data, err := json.MarshalIndent(sh.Sessions, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(sh.filepath, data, 0644)
}

// AddSession adds a new session to history
func (sh *SessionHistory) AddSession(session Session) error {
	sh.Sessions = append(sh.Sessions, session)

	// Keep only last 100 sessions
	if len(sh.Sessions) > 100 {
		sh.Sessions = sh.Sessions[len(sh.Sessions)-100:]
	}

	return sh.Save()
}

// GetRecentSessions returns the N most recent sessions
func (sh *SessionHistory) GetRecentSessions(n int) []Session {
	if len(sh.Sessions) == 0 {
		return []Session{}
	}

	start := len(sh.Sessions) - n
	if start < 0 {
		start = 0
	}

	return sh.Sessions[start:]
}

// GetSessionsByMode returns sessions filtered by mode
func (sh *SessionHistory) GetSessionsByMode(mode string) []Session {
	filtered := make([]Session, 0)
	for _, s := range sh.Sessions {
		if s.Mode == mode {
			filtered = append(filtered, s)
		}
	}
	return filtered
}

// GetTrend returns the trend for a specific metric over recent sessions
func (sh *SessionHistory) GetTrend(metric string, sessions int) (float64, string) {
	recent := sh.GetRecentSessions(sessions)
	if len(recent) < 2 {
		return 0, "insufficient data"
	}

	var first, last float64

	switch metric {
	case "wpm":
		first = recent[0].WPM
		last = recent[len(recent)-1].WPM
	case "accuracy":
		first = recent[0].Accuracy
		last = recent[len(recent)-1].Accuracy
	case "avg_hrm_timing":
		first = float64(recent[0].AvgHRMTiming.Milliseconds())
		last = float64(recent[len(recent)-1].AvgHRMTiming.Milliseconds())
	default:
		return 0, "unknown metric"
	}

	diff := last - first
	if diff > 0 {
		return diff, "improving"
	} else if diff < 0 {
		return diff, "declining"
	}
	return 0, "stable"
}

// GetKeyImprovement returns improvement data for a specific key
func (sh *SessionHistory) GetKeyImprovement(key string, sessions int) string {
	recent := sh.GetRecentSessions(sessions)
	if len(recent) < 2 {
		return "Need more sessions for trend"
	}

	var firstAvg, lastAvg time.Duration
	var firstAcc, lastAcc float64

	// Get first session stats
	if stats, ok := recent[0].PerKeyStats[key]; ok {
		firstAvg = stats.AvgDuration
		if stats.Presses > 0 {
			firstAcc = float64(stats.Presses-stats.AccidentalMods) / float64(stats.Presses) * 100
		}
	}

	// Get last session stats
	if stats, ok := recent[len(recent)-1].PerKeyStats[key]; ok {
		lastAvg = stats.AvgDuration
		if stats.Presses > 0 {
			lastAcc = float64(stats.Presses-stats.AccidentalMods) / float64(stats.Presses) * 100
		}
	}

	timingDiff := firstAvg - lastAvg
	accDiff := lastAcc - firstAcc

	trend := ""
	if timingDiff > 0 {
		trend += fmt.Sprintf("⬇ %.0fms faster", timingDiff.Milliseconds())
	} else if timingDiff < 0 {
		trend += fmt.Sprintf("⬆ %.0fms slower", -timingDiff.Milliseconds())
	} else {
		trend += "→ same speed"
	}

	trend += " | "

	if accDiff > 0 {
		trend += fmt.Sprintf("⬆ +%.1f%% accuracy", accDiff)
	} else if accDiff < 0 {
		trend += fmt.Sprintf("⬇ %.1f%% accuracy", accDiff)
	} else {
		trend += "→ same accuracy"
	}

	return trend
}
