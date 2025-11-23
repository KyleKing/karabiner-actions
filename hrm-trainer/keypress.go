package main

import (
	"time"
)

// KeyPress represents a single key press with timing information
type KeyPress struct {
	Key       rune
	PressTime time.Time
	Duration  time.Duration
	IsHRM     bool
	Modifier  string // The modifier this key represents if IsHRM
}

// KeyPressResult indicates the result of a key press
type KeyPressResult struct {
	KeyPress
	Status        string // "good", "warning", "modifier_activated"
	Message       string
	WasAccidental bool // True if modifier was accidentally activated
}

// EvaluateKeyPress analyzes a key press and provides feedback
func EvaluateKeyPress(kp KeyPress, config *PracticeConfig) KeyPressResult {
	result := KeyPressResult{
		KeyPress: kp,
	}

	if !kp.IsHRM {
		result.Status = "good"
		result.Message = "Regular key"
		return result
	}

	threshold := time.Duration(config.Timing.ToIfHeldDownThresholdMS) * time.Millisecond
	warningZone := threshold - 20*time.Millisecond // 20ms before threshold

	if kp.Duration >= threshold {
		result.Status = "modifier_activated"
		result.Message = "⚠️ Modifier activated"
		result.WasAccidental = true
	} else if kp.Duration >= warningZone {
		result.Status = "warning"
		result.Message = "⚠ Close to modifier threshold"
	} else {
		result.Status = "good"
		result.Message = "✓ Clean tap"
	}

	return result
}

// CalculateTimingStats computes statistics from a series of key presses
func CalculateTimingStats(presses []KeyPress) TimingStats {
	if len(presses) == 0 {
		return TimingStats{}
	}

	var total, hrmTotal time.Duration
	var hrmCount, accidentalMods int
	minDuration := presses[0].Duration
	maxDuration := presses[0].Duration

	for _, kp := range presses {
		total += kp.Duration
		if kp.Duration < minDuration {
			minDuration = kp.Duration
		}
		if kp.Duration > maxDuration {
			maxDuration = kp.Duration
		}

		if kp.IsHRM {
			hrmTotal += kp.Duration
			hrmCount++
		}
	}

	stats := TimingStats{
		TotalPresses:     len(presses),
		AverageDuration:  total / time.Duration(len(presses)),
		MinDuration:      minDuration,
		MaxDuration:      maxDuration,
		HRMPresses:       hrmCount,
		AccidentalMods:   accidentalMods,
	}

	if hrmCount > 0 {
		stats.HRMAverageDuration = hrmTotal / time.Duration(hrmCount)
	}

	return stats
}

// TimingStats holds statistics about key press timing
type TimingStats struct {
	TotalPresses        int
	AverageDuration     time.Duration
	HRMAverageDuration  time.Duration
	MinDuration         time.Duration
	MaxDuration         time.Duration
	HRMPresses          int
	AccidentalMods      int
	AccuracyPercentage  float64
}
