package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
)

// MonkeyTypeWordlist represents a MonkeyType custom wordlist
type MonkeyTypeWordlist struct {
	Name   string    `json:"name"`
	Groups [][]int   `json:"groups"`
	Words  []string  `json:"words"`
}

// LoadWordlist loads a MonkeyType wordlist from a JSON file
func LoadWordlist(path string) (*MonkeyTypeWordlist, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var wordlist MonkeyTypeWordlist
	if err := json.Unmarshal(data, &wordlist); err != nil {
		return nil, err
	}

	return &wordlist, nil
}

// LoadAllWordlists loads all wordlists from a directory
func LoadAllWordlists(dir string) (map[string]*MonkeyTypeWordlist, error) {
	wordlists := make(map[string]*MonkeyTypeWordlist)

	entries, err := os.ReadDir(dir)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		if entry.IsDir() || !strings.HasSuffix(entry.Name(), ".json") {
			continue
		}

		path := filepath.Join(dir, entry.Name())
		wordlist, err := LoadWordlist(path)
		if err != nil {
			continue // Skip invalid files
		}

		// Use filename (without .json) as key
		key := strings.TrimSuffix(entry.Name(), ".json")
		wordlists[key] = wordlist
	}

	return wordlists, nil
}

// GeneratePracticeText generates practice text from a wordlist
func (w *MonkeyTypeWordlist) GeneratePracticeText(wordCount int) string {
	if len(w.Words) == 0 {
		return ""
	}

	words := make([]string, wordCount)
	for i := 0; i < wordCount; i++ {
		words[i] = w.Words[rand.Intn(len(w.Words))]
	}

	return strings.Join(words, " ")
}

// GetWordlistNames returns a sorted list of wordlist names
func GetWordlistNames(wordlists map[string]*MonkeyTypeWordlist) []string {
	names := make([]string, 0, len(wordlists))
	for key := range wordlists {
		names = append(names, key)
	}
	return names
}

// GetWordlistDisplay returns a display name for a wordlist
func (w *MonkeyTypeWordlist) GetDisplayName() string {
	if w.Name != "" {
		return w.Name
	}
	return "Unnamed Wordlist"
}

// GetWordlistInfo returns info about a wordlist
func (w *MonkeyTypeWordlist) GetWordlistInfo() string {
	return fmt.Sprintf("%s (%d words)", w.GetDisplayName(), len(w.Words))
}

// WordlistStats returns statistics about a wordlist
func (w *MonkeyTypeWordlist) WordlistStats(config *PracticeConfig) WordlistStatistics {
	stats := WordlistStatistics{
		TotalWords: len(w.Words),
	}

	for _, word := range w.Words {
		hrmCount := 0
		consecutive := false

		runes := []rune(word)
		for i, ch := range runes {
			if config.IsHRMKey(ch) {
				hrmCount++
				if i > 0 && config.IsHRMKey(runes[i-1]) {
					consecutive = true
				}
			}
		}

		if hrmCount > 0 {
			stats.HRMWords++
		}
		if consecutive {
			stats.ConsecutiveHRMWords++
		}
		if hrmCount > stats.MaxHRMKeys {
			stats.MaxHRMKeys = hrmCount
		}
	}

	if stats.TotalWords > 0 {
		stats.HRMPercentage = float64(stats.HRMWords) / float64(stats.TotalWords) * 100
	}

	return stats
}

// WordlistStatistics holds statistics about a wordlist
type WordlistStatistics struct {
	TotalWords          int
	HRMWords            int
	ConsecutiveHRMWords int
	MaxHRMKeys          int
	HRMPercentage       float64
}

// GetDifficultyRating returns a difficulty rating (1-5) based on HRM content
func (s WordlistStatistics) GetDifficultyRating() int {
	if s.HRMPercentage < 20 {
		return 1 // Easy
	} else if s.HRMPercentage < 40 {
		return 2 // Medium-easy
	} else if s.HRMPercentage < 60 {
		return 3 // Medium
	} else if s.HRMPercentage < 80 {
		return 4 // Medium-hard
	}
	return 5 // Hard
}

// GetDifficultyLabel returns a text label for difficulty
func (s WordlistStatistics) GetDifficultyLabel() string {
	switch s.GetDifficultyRating() {
	case 1:
		return "⭐ Easy"
	case 2:
		return "⭐⭐ Medium-Easy"
	case 3:
		return "⭐⭐⭐ Medium"
	case 4:
		return "⭐⭐⭐⭐ Hard"
	case 5:
		return "⭐⭐⭐⭐⭐ Very Hard"
	}
	return "Unknown"
}
