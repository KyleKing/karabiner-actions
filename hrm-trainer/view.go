package main

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/lipgloss"
)

// Styles
var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("205")).
			MarginBottom(1)

	menuItemStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("86"))

	hrmKeyStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("203"))

	goodStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("42"))

	warningStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("214"))

	errorStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("196"))

	infoStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("86"))

	progressBarStyle = lipgloss.NewStyle().
				Border(lipgloss.RoundedBorder()).
				BorderForeground(lipgloss.Color("63")).
				Padding(0, 1)

	layerActiveStyle = lipgloss.NewStyle().
				Background(lipgloss.Color("63")).
				Foreground(lipgloss.Color("230")).
				Bold(true).
				Padding(0, 1)

	layerInactiveStyle = lipgloss.NewStyle().
				Foreground(lipgloss.Color("240")).
				Padding(0, 1)
)

// View renders the current state
func (m Model) View() string {
	if m.quitting {
		return "Thanks for practicing! 👋\n"
	}

	switch m.mode {
	case ModeMenu:
		return m.viewMenu()
	case ModeTimingCalibration:
		return m.viewTimingCalibration()
	case ModeHRMPractice:
		return m.viewHRMPractice()
	case ModeLayerPractice:
		return m.viewLayerPractice()
	case ModeWordlistSelect:
		return m.viewWordlistSelect()
	case ModeWordlistPractice:
		return m.viewWordlistPractice()
	case ModeStats:
		return m.viewStats()
	case ModePerKeyStats:
		return m.viewPerKeyStats()
	case ModeThresholdTuning:
		return m.viewThresholdTuning()
	case ModeLayerActivation:
		return m.viewLayerActivation()
	case ModeChordPractice:
		return m.viewChordPractice()
	case ModeSessionHistory:
		return m.viewSessionHistory()
	}

	return ""
}

func (m Model) viewMenu() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("🎹 HRM Typing Trainer"))
	b.WriteString("\n\n")
	b.WriteString("Practice typing with your Home Row Mods configuration\n\n")

	b.WriteString("Basic Practice:\n")
	b.WriteString(menuItemStyle.Render("  1. ") + "Timing Calibration - Measure your tap/hold speeds\n")
	b.WriteString(menuItemStyle.Render("  2. ") + "HRM Practice - Practice with home row mod keys\n")
	b.WriteString(menuItemStyle.Render("  3. ") + "Layer Practice - Practice symbol layers\n")
	b.WriteString(menuItemStyle.Render("  4. ") + "Wordlist Practice - Practice with MonkeyType wordlists\n")
	b.WriteString("\n")
	b.WriteString("Advanced Tools:\n")
	b.WriteString(menuItemStyle.Render("  5. ") + "View Statistics - Overall timing stats\n")
	b.WriteString(menuItemStyle.Render("  6. ") + "Per-Key Stats & Heatmap - Problem key analysis\n")
	b.WriteString(menuItemStyle.Render("  7. ") + "Threshold Tuning - Find your optimal threshold\n")
	b.WriteString(menuItemStyle.Render("  8. ") + "Layer Activation - Practice layer chords\n")
	b.WriteString(menuItemStyle.Render("  9. ") + "Chord Practice - Practice simultaneous keys\n")
	b.WriteString(menuItemStyle.Render("  0. ") + "Session History - View your progress over time\n")
	b.WriteString("\n")
	b.WriteString(menuItemStyle.Render("  h. ") + "Toggle hints | ")
	b.WriteString(menuItemStyle.Render("q. ") + "Quit\n")

	if m.config != nil {
		b.WriteString("\n")
		b.WriteString(infoStyle.Render("Configuration loaded:") + "\n")
		b.WriteString(fmt.Sprintf("  HRM Keys: %s\n", strings.Join(m.config.GetAllHRMKeys(), ", ")))
		b.WriteString(fmt.Sprintf("  Tap threshold: %dms\n", m.config.Timing.ToIfHeldDownThresholdMS))
		b.WriteString(fmt.Sprintf("  Symbol layers: %d configured\n", len(m.config.SymbolLayers)))
	}

	return b.String()
}

func (m Model) viewTimingCalibration() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("⏱️  Timing Calibration"))
	b.WriteString("\n\n")

	switch m.calibrationPhase {
	case 0:
		b.WriteString("Phase 1: Normal Taps\n")
		b.WriteString("Tap any key quickly, as you would during normal typing.\n")
		b.WriteString(fmt.Sprintf("Progress: %d/10 presses\n\n", len(m.calibrationPresses)))

		if len(m.calibrationPresses) > 0 {
			recent := m.calibrationPresses[len(m.calibrationPresses)-1]
			b.WriteString(fmt.Sprintf("Last press: %s - %.0fms\n", string(recent.Key), recent.Duration.Milliseconds()))
		}

	case 1:
		b.WriteString("Phase 2: Modifier Holds\n")
		b.WriteString("Hold any key as if activating a modifier (comfortable hold).\n")
		b.WriteString(fmt.Sprintf("Progress: %d/10 presses\n\n", len(m.calibrationPresses)))

		if len(m.calibrationPresses) > 0 {
			recent := m.calibrationPresses[len(m.calibrationPresses)-1]
			b.WriteString(fmt.Sprintf("Last hold: %s - %.0fms\n", string(recent.Key), recent.Duration.Milliseconds()))
		}

	case 2:
		b.WriteString("📊 Calibration Results\n\n")
		b.WriteString(m.renderTimingStats(m.stats))
		b.WriteString("\n\n")

		threshold := m.config.Timing.ToIfHeldDownThresholdMS
		avgTap := m.stats.AverageDuration.Milliseconds()

		b.WriteString("Recommendations:\n")
		if avgTap > int64(threshold)*8/10 {
			b.WriteString(warningStyle.Render(fmt.Sprintf(
				"⚠️ Your average tap (%.0fms) is close to threshold (%dms)\n",
				avgTap, threshold)))
			b.WriteString(fmt.Sprintf("   Consider increasing threshold to %dms\n", avgTap*12/10))
		} else {
			b.WriteString(goodStyle.Render(fmt.Sprintf(
				"✓ Good gap between tap (%.0fms) and threshold (%dms)\n",
				avgTap, threshold)))
		}
	}

	if m.currentKeyPress != nil {
		b.WriteString("\n")
		b.WriteString(m.renderProgressBar())
	}

	b.WriteString("\n\n")
	b.WriteString(infoStyle.Render("Press 'q' to return to menu"))

	return b.String()
}

func (m Model) viewHRMPractice() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("🏋️ HRM Practice"))
	b.WriteString("\n\n")

	// Show target text with current position
	b.WriteString("Type the following:\n\n")
	for i, ch := range m.targetText {
		if i == m.currentPos {
			b.WriteString(warningStyle.Render("▼"))
		}

		style := lipgloss.NewStyle()
		if i < m.currentPos {
			style = style.Foreground(lipgloss.Color("240"))
		} else if m.config.IsHRMKey(ch) {
			style = hrmKeyStyle
		}

		b.WriteString(style.Render(string(ch)))
	}
	b.WriteString("\n\n")

	// Show current key press timing
	if m.currentKeyPress != nil {
		b.WriteString(m.renderProgressBar())
		b.WriteString("\n")
	}

	// Show last result
	if m.lastResult != nil {
		b.WriteString(m.renderKeyPressResult(*m.lastResult))
		b.WriteString("\n")
	}

	// Show hints if enabled
	if m.showHints && m.currentPos < len(m.targetText) {
		nextKey := rune(m.targetText[m.currentPos])
		if m.config.IsHRMKey(nextKey) {
			mod := m.config.GetModifier(nextKey)
			b.WriteString("\n")
			b.WriteString(hrmKeyStyle.Render(fmt.Sprintf(
				"💡 Next key '%s' is HRM (%s) - tap quickly!",
				string(nextKey), mod)))
			b.WriteString("\n")
		}
	}

	// Show stats
	b.WriteString(fmt.Sprintf("\nProgress: %d/%d | Errors: %d\n",
		m.currentPos, len(m.targetText), m.errors))

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("Press 'h' to toggle hints | 'q' for menu"))

	return b.String()
}

func (m Model) viewLayerPractice() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("🔤 Layer Practice"))
	b.WriteString("\n\n")

	// Show layer states
	b.WriteString("Layers: ")
	for name := range m.config.SymbolLayers {
		if name == m.activeLayer {
			b.WriteString(layerActiveStyle.Render(name))
		} else {
			b.WriteString(layerInactiveStyle.Render(name))
		}
		b.WriteString(" ")
	}
	b.WriteString("\n\n")

	// Show target text
	b.WriteString("Type the following:\n\n")
	for i, ch := range m.targetText {
		if i == m.currentPos {
			b.WriteString(warningStyle.Render("▼"))
		}

		style := lipgloss.NewStyle()
		if i < m.currentPos {
			style = style.Foreground(lipgloss.Color("240"))
		}

		b.WriteString(style.Render(string(ch)))
	}
	b.WriteString("\n\n")

	if m.currentKeyPress != nil {
		b.WriteString(m.renderProgressBar())
		b.WriteString("\n")
	}

	b.WriteString(fmt.Sprintf("\nProgress: %d/%d | Errors: %d\n",
		m.currentPos, len(m.targetText), m.errors))

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("Press 'q' for menu"))

	return b.String()
}

func (m Model) viewStats() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("📊 Statistics"))
	b.WriteString("\n\n")

	if len(m.keyPresses) == 0 {
		b.WriteString("No data yet. Start practicing to see statistics!\n")
	} else {
		stats := CalculateTimingStats(m.keyPresses)
		b.WriteString(m.renderTimingStats(stats))
	}

	b.WriteString("\n\n")
	b.WriteString(infoStyle.Render("Press 'q' to return to menu"))

	return b.String()
}

func (m Model) renderProgressBar() string {
	if m.currentKeyPress == nil {
		return ""
	}

	duration := m.currentKeyPress.Duration
	threshold := time.Duration(m.config.Timing.ToIfHeldDownThresholdMS) * time.Millisecond
	percent := float64(duration) / float64(threshold)

	if percent > 1.0 {
		percent = 1.0
	}

	var barStyle string
	if duration >= threshold {
		barStyle = errorStyle.Render(m.progress.ViewAs(percent))
	} else if duration >= threshold-20*time.Millisecond {
		barStyle = warningStyle.Render(m.progress.ViewAs(percent))
	} else {
		barStyle = goodStyle.Render(m.progress.ViewAs(percent))
	}

	return fmt.Sprintf("Press duration: %3.0fms / %dms\n%s",
		duration.Milliseconds(),
		m.config.Timing.ToIfHeldDownThresholdMS,
		progressBarStyle.Render(barStyle))
}

func (m Model) renderKeyPressResult(result KeyPressResult) string {
	var style lipgloss.Style
	switch result.Status {
	case "good":
		style = goodStyle
	case "warning":
		style = warningStyle
	case "modifier_activated":
		style = errorStyle
	}

	return fmt.Sprintf("%s '%s' - %.0fms - %s",
		style.Render(result.Status),
		string(result.Key),
		result.Duration.Milliseconds(),
		result.Message)
}

func (m Model) renderTimingStats(stats TimingStats) string {
	var b strings.Builder

	b.WriteString(fmt.Sprintf("Total key presses: %d\n", stats.TotalPresses))
	b.WriteString(fmt.Sprintf("Average duration: %.0fms\n", stats.AverageDuration.Milliseconds()))
	b.WriteString(fmt.Sprintf("Min duration: %.0fms\n", stats.MinDuration.Milliseconds()))
	b.WriteString(fmt.Sprintf("Max duration: %.0fms\n", stats.MaxDuration.Milliseconds()))

	if stats.HRMPresses > 0 {
		b.WriteString("\n")
		b.WriteString(hrmKeyStyle.Render("HRM Key Statistics:") + "\n")
		b.WriteString(fmt.Sprintf("  HRM key presses: %d\n", stats.HRMPresses))
		b.WriteString(fmt.Sprintf("  HRM average: %.0fms\n", stats.HRMAverageDuration.Milliseconds()))
		b.WriteString(fmt.Sprintf("  Accidental modifiers: %d\n", stats.AccidentalMods))
		if stats.HRMPresses > 0 {
			accuracy := float64(stats.HRMPresses-stats.AccidentalMods) / float64(stats.HRMPresses) * 100
			b.WriteString(fmt.Sprintf("  Accuracy: %.1f%%\n", accuracy))
		}
	}

	return b.String()
}

func (m Model) viewWordlistSelect() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("📚 Select Wordlist"))
	b.WriteString("\n\n")

	if len(m.wordlistNames) == 0 {
		b.WriteString(errorStyle.Render("No wordlists found!"))
		b.WriteString("\n\n")
		b.WriteString("Run 'npm run export' from the parent directory to generate wordlists.\n")
	} else {
		b.WriteString("Choose a wordlist for practice:\n\n")

		for i, name := range m.wordlistNames {
			wordlist := m.wordlists[name]
			stats := wordlist.WordlistStats(m.config)

			prefix := "  "
			if i == m.selectedWordlist {
				prefix = warningStyle.Render("▶ ")
			}

			info := fmt.Sprintf("%s%s - %s (%d words, %.0f%% HRM)",
				prefix,
				wordlist.GetDisplayName(),
				stats.GetDifficultyLabel(),
				stats.TotalWords,
				stats.HRMPercentage)

			if i == m.selectedWordlist {
				b.WriteString(hrmKeyStyle.Render(info) + "\n")
			} else {
				b.WriteString(info + "\n")
			}
		}
	}

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("↑/↓ or j/k: navigate | Enter/Space: select | q: back"))

	return b.String()
}

func (m Model) viewWordlistPractice() string {
	var b strings.Builder

	if m.currentWordlist != nil {
		b.WriteString(titleStyle.Render("📝 " + m.currentWordlist.GetDisplayName()))
	} else {
		b.WriteString(titleStyle.Render("📝 Wordlist Practice"))
	}
	b.WriteString("\n\n")

	// Show target text with current position
	b.WriteString("Type the following:\n\n")
	for i, ch := range m.targetText {
		if i == m.currentPos {
			b.WriteString(warningStyle.Render("▼"))
		}

		style := lipgloss.NewStyle()
		if i < m.currentPos {
			style = style.Foreground(lipgloss.Color("240"))
		} else if m.config.IsHRMKey(ch) {
			style = hrmKeyStyle
		}

		b.WriteString(style.Render(string(ch)))
	}
	b.WriteString("\n\n")

	// Show current key press timing
	if m.currentKeyPress != nil {
		b.WriteString(m.renderProgressBar())
		b.WriteString("\n")
	}

	// Show last result
	if m.lastResult != nil {
		b.WriteString(m.renderKeyPressResult(*m.lastResult))
		b.WriteString("\n")
	}

	// Show hints if enabled
	if m.showHints && m.currentPos < len(m.targetText) {
		nextKey := rune(m.targetText[m.currentPos])
		if m.config.IsHRMKey(nextKey) {
			mod := m.config.GetModifier(nextKey)
			b.WriteString("\n")
			b.WriteString(hrmKeyStyle.Render(fmt.Sprintf(
				"💡 Next key '%s' is HRM (%s) - tap quickly!",
				string(nextKey), mod)))
			b.WriteString("\n")
		}
	}

	// Show stats
	elapsed := time.Since(m.startTime)
	wpm := 0.0
	if elapsed.Minutes() > 0 {
		wpm = float64(m.wordsTyped) / elapsed.Minutes()
	}

	b.WriteString(fmt.Sprintf("\nProgress: %d chars | Words: %d | Errors: %d | WPM: %.1f\n",
		m.currentPos, m.wordsTyped, m.errors, wpm))

	if m.statusMessage != "" {
		b.WriteString("\n")
		b.WriteString(goodStyle.Render(m.statusMessage) + "\n")
	}

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("Press 'h' to toggle hints | 'q' for menu"))

	return b.String()
}

func (m Model) viewPerKeyStats() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("📊 Per-Key Statistics & Heatmap"))
	b.WriteString("\n\n")

	if len(m.keyStats.Stats) == 0 {
		b.WriteString("No key presses recorded yet. Start practicing to see per-key statistics!\n")
	} else {
		// Show heatmap
		b.WriteString("Key Performance Heatmap:\n\n")
		
		// Get HRM keys in order
		hrmKeys := []rune{'a', 's', 'd', 'f', 'j', 'k', 'l', ';'}
		
		for _, key := range hrmKeys {
			stats, exists := m.keyStats.Stats[key]
			if !exists {
				b.WriteString(fmt.Sprintf("  %s: no data\n", string(key)))
				continue
			}

			// Rating visualization
			rating := stats.GetRating()
			stars := strings.Repeat("⭐", rating) + strings.Repeat("☆", 5-rating)
			
			// Color based on accuracy
			acc := stats.GetAccuracyPercentage()
			var style lipgloss.Style
			if acc >= 90 {
				style = goodStyle
			} else if acc >= 75 {
				style = warningStyle
			} else {
				style = errorStyle
			}

			info := fmt.Sprintf("  '%s' (%s): %d presses | %.0f%% acc | avg %.0fms %s",
				string(key),
				stats.Modifier,
				stats.TotalPresses,
				acc,
				stats.AverageDuration.Milliseconds(),
				stars)
			
			b.WriteString(style.Render(info) + "\n")
		}

		// Show problem keys
		problems := m.keyStats.GetProblemKeys(5)
		if len(problems) > 0 {
			b.WriteString("\n")
			b.WriteString(errorStyle.Render("⚠️  Problem Keys (need practice):") + "\n")
			for i, p := range problems {
				if i >= 3 {
					break
				}
				b.WriteString(fmt.Sprintf("  %d. '%s' (%s) - %.0f%% accuracy, %d accidental mods\n",
					i+1, string(p.Key), p.Modifier, p.GetAccuracyPercentage(), p.AccidentalMods))
			}

			// Generate drill
			b.WriteString("\n")
			b.WriteString(goodStyle.Render("💪 Recommended Drill:") + "\n")
			drill := m.keyStats.GenerateProblemDrill(m.config, m.wordlists)
			b.WriteString(drill + "\n")
		}

		// Top keys by volume
		b.WriteString("\n")
		b.WriteString(infoStyle.Render("Most Used Keys:") + "\n")
		topKeys := m.keyStats.GetTopKeys(5)
		for i, k := range topKeys {
			b.WriteString(fmt.Sprintf("  %d. '%s' - %d presses\n", i+1, string(k.Key), k.TotalPresses))
		}
	}

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("Press 'q' to return to menu"))

	return b.String()
}

func (m Model) viewThresholdTuning() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("🎛️  Threshold Tuning"))
	b.WriteString("\n\n")

	b.WriteString(fmt.Sprintf("Current config threshold: %dms\n", m.config.Timing.ToIfHeldDownThresholdMS))
	b.WriteString("Test different thresholds to find your optimal setting.\n\n")

	// Show threshold options
	b.WriteString("Select threshold (←/→ to change):\n")
	for i, threshold := range m.testThresholds {
		prefix := "  "
		suffix := ""
		if i == m.selectedThreshold {
			prefix = warningStyle.Render("▶ ")
			suffix = " ← testing"
		}

		// Show results if tested
		result := ""
		if res, ok := m.thresholdResults[threshold]; ok && res.Presses > 0 {
			accidentalPct := float64(res.AccidentalMods) / float64(res.Presses) * 100
			var style lipgloss.Style
			if accidentalPct < 10 {
				style = goodStyle
			} else if accidentalPct < 20 {
				style = warningStyle
			} else {
				style = errorStyle
			}
			result = style.Render(fmt.Sprintf(" | %d presses, %.0f%% accidental, avg %.0fms",
				res.Presses, accidentalPct, res.AverageTiming.Milliseconds()))
		}

		b.WriteString(fmt.Sprintf("%s%dms%s%s\n", prefix, threshold, suffix, result))
	}

	b.WriteString("\n")
	b.WriteString("Type the text below to test the selected threshold:\n\n")

	// Show practice text
	for i, ch := range m.targetText {
		if i == m.currentPos {
			b.WriteString(warningStyle.Render("▼"))
		}

		style := lipgloss.NewStyle()
		if i < m.currentPos {
			style = style.Foreground(lipgloss.Color("240"))
		} else if m.config.IsHRMKey(ch) {
			style = hrmKeyStyle
		}

		b.WriteString(style.Render(string(ch)))
	}
	b.WriteString("\n\n")

	// Show current key press timing
	if m.currentKeyPress != nil {
		b.WriteString(m.renderProgressBar())
		b.WriteString("\n")
	}

	// Show last result
	if m.lastResult != nil {
		b.WriteString(m.renderKeyPressResult(*m.lastResult))
		b.WriteString("\n")
	}

	// Recommendation
	if len(m.thresholdResults) >= 3 {
		b.WriteString("\n")
		b.WriteString(goodStyle.Render("📊 Recommendation:") + "\n")
		
		// Find threshold with best accuracy
		var bestThreshold int
		var bestAccuracy float64 = -1
		for threshold, res := range m.thresholdResults {
			if res.Presses < 10 {
				continue // Need more data
			}
			acc := float64(res.Presses-res.AccidentalMods) / float64(res.Presses) * 100
			if acc > bestAccuracy {
				bestAccuracy = acc
				bestThreshold = threshold
			}
		}

		if bestAccuracy > 0 {
			b.WriteString(fmt.Sprintf("  Best threshold: %dms (%.0f%% accuracy)\n", bestThreshold, bestAccuracy))
			if bestThreshold != m.config.Timing.ToIfHeldDownThresholdMS {
				b.WriteString(fmt.Sprintf("  Consider changing from %dms → %dms in config\n",
					m.config.Timing.ToIfHeldDownThresholdMS, bestThreshold))
			}
		}
	}

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("←/→: change threshold | q: menu"))

	return b.String()
}

func (m Model) viewLayerActivation() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("🔤 Layer Activation Practice"))
	b.WriteString("\n\n")

	b.WriteString("Practice activating symbol layers with proper timing.\n")
	b.WriteString(fmt.Sprintf("Simultaneous threshold: %dms\n\n", m.config.Timing.SimultaneousThresholdMS))

	// Show available layers
	b.WriteString("Symbol Layers:\n")
	for name, layer := range m.config.SymbolLayers {
		activator := ""
		switch v := layer.Activator.(type) {
		case string:
			activator = v
		case []interface{}:
			keys := make([]string, len(v))
			for i, k := range v {
				keys[i] = fmt.Sprintf("%v", k)
			}
			activator = strings.Join(keys, "+")
		}

		b.WriteString(fmt.Sprintf("  • %s: %s (mode: %s)\n", name, activator, layer.Mode))
	}

	b.WriteString("\n")
	b.WriteString("Practice coming soon! This will help you:\n")
	b.WriteString("  • Activate layers with proper chord timing\n")
	b.WriteString("  • Practice layer + key combinations\n")
	b.WriteString("  • Build muscle memory for symbol access\n")

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("Press 'q' to return to menu"))

	return b.String()
}

func (m Model) viewChordPractice() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("⌨️  Chord Practice"))
	b.WriteString("\n\n")

	b.WriteString("Practice simultaneous key presses (chords).\n")
	b.WriteString(fmt.Sprintf("Target threshold: %dms between keys\n\n", m.config.Timing.SimultaneousThresholdMS))

	// Show target chord
	chordStr := ""
	for i, key := range m.chordTarget {
		if i > 0 {
			chordStr += "+"
		}
		chordStr += string(key)
		if m.config.IsHRMKey(key) {
			chordStr += fmt.Sprintf("(%s)", m.config.GetModifier(key))
		}
	}
	b.WriteString(fmt.Sprintf("Target Chord: %s\n\n", chordStr))

	b.WriteString("Press both keys simultaneously!\n\n")

	// Show recent results
	if len(m.chordResults) > 0 {
		b.WriteString("Recent Attempts:\n")
		for i := len(m.chordResults) - 1; i >= 0 && i >= len(m.chordResults)-5; i-- {
			result := m.chordResults[i]
			var style lipgloss.Style
			if result.WithinThreshold {
				style = goodStyle
			} else {
				style = warningStyle
			}

			status := "✓"
			if !result.WithinThreshold {
				status = "⚠"
			}

			b.WriteString(style.Render(fmt.Sprintf("  %s Gap: %.0fms", status, result.MaxGap.Milliseconds())))
			if result.WithinThreshold {
				b.WriteString(goodStyle.Render(" (simultaneous!)"))
			} else {
				b.WriteString(warningStyle.Render(" (too slow)"))
			}
			b.WriteString("\n")
		}

		// Stats
		successCount := 0
		var totalGap time.Duration
		for _, r := range m.chordResults {
			if r.WithinThreshold {
				successCount++
			}
			totalGap += r.MaxGap
		}
		
		avgGap := totalGap / time.Duration(len(m.chordResults))
		successRate := float64(successCount) / float64(len(m.chordResults)) * 100

		b.WriteString("\n")
		b.WriteString(fmt.Sprintf("Statistics: %.0f%% success | avg gap: %.0fms\n",
			successRate, avgGap.Milliseconds()))
	}

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("Press 'q' to return to menu"))

	return b.String()
}

func (m Model) viewSessionHistory() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("📈 Session History"))
	b.WriteString("\n\n")

	if len(m.sessionHistory.Sessions) == 0 {
		b.WriteString("No sessions recorded yet.\n")
		b.WriteString("Complete a practice session to see history!\n")
	} else {
		recent := m.sessionHistory.GetRecentSessions(10)
		
		b.WriteString(fmt.Sprintf("Showing last %d sessions:\n\n", len(recent)))

		for i := len(recent) - 1; i >= 0; i-- {
			s := recent[i]
			date := s.Date.Format("2006-01-02 15:04")
			
			b.WriteString(fmt.Sprintf("  %s | %s\n", date, s.Mode))
			b.WriteString(fmt.Sprintf("    Duration: %v | WPM: %.1f | Accuracy: %.0f%%\n",
				s.Duration.Round(time.Second), s.WPM, s.Accuracy))
			b.WriteString(fmt.Sprintf("    Presses: %d | Errors: %d | Avg HRM: %.0fms\n",
				s.TotalPresses, s.Errors, s.AvgHRMTiming.Milliseconds()))
			
			if len(s.ProblemKeys) > 0 {
				b.WriteString(fmt.Sprintf("    Problem keys: %s\n", strings.Join(s.ProblemKeys, ", ")))
			}
			b.WriteString("\n")
		}

		// Show trends
		if len(recent) >= 5 {
			b.WriteString(goodStyle.Render("📊 Trends (last 5 sessions):") + "\n")
			
			wpmDiff, wpmTrend := m.sessionHistory.GetTrend("wpm", 5)
			accDiff, accTrend := m.sessionHistory.GetTrend("accuracy", 5)
			timingDiff, timingTrend := m.sessionHistory.GetTrend("avg_hrm_timing", 5)

			b.WriteString(fmt.Sprintf("  WPM: %s (%.1f)\n", wpmTrend, wpmDiff))
			b.WriteString(fmt.Sprintf("  Accuracy: %s (%.1f%%)\n", accTrend, accDiff))
			b.WriteString(fmt.Sprintf("  HRM Timing: %s (%.0fms)\n", timingTrend, timingDiff))
		}
	}

	b.WriteString("\n")
	b.WriteString(infoStyle.Render("Press 'q' to return to menu"))

	return b.String()
}
