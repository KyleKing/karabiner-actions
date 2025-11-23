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
	}

	return ""
}

func (m Model) viewMenu() string {
	var b strings.Builder

	b.WriteString(titleStyle.Render("🎹 HRM Typing Trainer"))
	b.WriteString("\n\n")
	b.WriteString("Practice typing with your Home Row Mods configuration\n\n")

	b.WriteString(menuItemStyle.Render("1. ") + "Timing Calibration - Measure your tap/hold speeds\n")
	b.WriteString(menuItemStyle.Render("2. ") + "HRM Practice - Practice with home row mod keys\n")
	b.WriteString(menuItemStyle.Render("3. ") + "Layer Practice - Practice symbol layers\n")
	b.WriteString(menuItemStyle.Render("4. ") + "Wordlist Practice - Practice with MonkeyType wordlists\n")
	b.WriteString(menuItemStyle.Render("5. ") + "View Statistics - See your progress\n")
	b.WriteString("\n")
	b.WriteString(menuItemStyle.Render("h. ") + "Toggle hints\n")
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
