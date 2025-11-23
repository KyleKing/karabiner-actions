package main

import (
	"time"

	"github.com/charmbracelet/bubbles/progress"
	tea "github.com/charmbracelet/bubbletea"
)

// Mode represents the current mode of the application
type Mode int

const (
	ModeMenu Mode = iota
	ModeTimingCalibration
	ModeHRMPractice
	ModeLayerPractice
	ModeWordlistSelect
	ModeWordlistPractice
	ModeStats
)

// Model is the main Bubbletea model
type Model struct {
	config          *PracticeConfig
	mode            Mode
	keyPresses      []KeyPress
	currentKeyPress *KeyPress
	lastResult      *KeyPressResult
	stats           TimingStats
	progress        progress.Model
	width           int
	height          int

	// Timing calibration state
	calibrationPhase  int // 0=tap, 1=hold, 2=results
	calibrationPresses []KeyPress

	// Practice state
	targetText      string
	currentPos      int
	errors          int
	startTime       time.Time
	wordsTyped      int

	// Layer state
	activeLayer     string
	layerActivatedAt time.Time

	// Wordlist state
	wordlists         map[string]*MonkeyTypeWordlist
	wordlistNames     []string
	selectedWordlist  int
	currentWordlist   *MonkeyTypeWordlist

	// UI state
	showHints       bool
	statusMessage   string
	quitting        bool
}

// tickMsg is sent on every tick for animations
type tickMsg time.Time

// keyPressMsg is sent when a key press is complete
type keyPressMsg KeyPress

// NewModel creates a new model with the given config
func NewModel(config *PracticeConfig, wordlists map[string]*MonkeyTypeWordlist) Model {
	prog := progress.New(
		progress.WithDefaultGradient(),
		progress.WithoutPercentage(),
	)

	return Model{
		config:        config,
		mode:          ModeMenu,
		keyPresses:    make([]KeyPress, 0),
		progress:      prog,
		showHints:     true,
		width:         80,
		height:        24,
		wordlists:     wordlists,
		wordlistNames: GetWordlistNames(wordlists),
	}
}

// Init initializes the model
func (m Model) Init() tea.Cmd {
	return tea.Batch(
		tickCmd(),
		waitForKeyPress(m.config),
	)
}

// tickCmd sends a tick message every 100ms for animations
func tickCmd() tea.Cmd {
	return tea.Tick(100*time.Millisecond, func(t time.Time) tea.Msg {
		return tickMsg(t)
	})
}

// Update handles messages and updates the model
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.KeyMsg:
		// Handle control keys
		switch msg.String() {
		case "ctrl+c", "q":
			if m.mode == ModeMenu {
				m.quitting = true
				return m, tea.Quit
			}
			// Return to menu from other modes
			m.mode = ModeMenu
			m.currentKeyPress = nil
			return m, nil
		case "1":
			if m.mode == ModeMenu {
				m.mode = ModeTimingCalibration
				m.calibrationPhase = 0
				m.calibrationPresses = make([]KeyPress, 0)
				m.statusMessage = "Tap any key quickly (like normal typing). Press 10 times."
			}
		case "2":
			if m.mode == ModeMenu {
				m.mode = ModeHRMPractice
				m.targetText = "the quick brown fox jumps over the lazy dog"
				m.currentPos = 0
				m.errors = 0
				m.startTime = time.Now()
			}
		case "3":
			if m.mode == ModeMenu {
				m.mode = ModeLayerPractice
				m.targetText = "array[index] = {key: value}"
				m.currentPos = 0
				m.errors = 0
				m.startTime = time.Now()
			}
		case "4":
			if m.mode == ModeMenu {
				if len(m.wordlists) > 0 {
					m.mode = ModeWordlistSelect
					m.selectedWordlist = 0
				} else {
					m.statusMessage = "No wordlists found. Run 'npm run export' first."
				}
			}
		case "5":
			if m.mode == ModeMenu {
				m.mode = ModeStats
				m.stats = CalculateTimingStats(m.keyPresses)
			}
		case "h":
			m.showHints = !m.showHints
		case "up", "k":
			if m.mode == ModeWordlistSelect && m.selectedWordlist > 0 {
				m.selectedWordlist--
			}
		case "down", "j":
			if m.mode == ModeWordlistSelect && m.selectedWordlist < len(m.wordlistNames)-1 {
				m.selectedWordlist++
			}
		case "enter", " ":
			if m.mode == ModeWordlistSelect && len(m.wordlistNames) > 0 {
				// Start practice with selected wordlist
				wordlistKey := m.wordlistNames[m.selectedWordlist]
				m.currentWordlist = m.wordlists[wordlistKey]
				m.targetText = m.currentWordlist.GeneratePracticeText(20)
				m.currentPos = 0
				m.errors = 0
				m.wordsTyped = 0
				m.startTime = time.Now()
				m.mode = ModeWordlistPractice
			}
		default:
			// Handle regular key presses
			if m.mode != ModeMenu && m.mode != ModeWordlistSelect {
				m.handleKeyPress(msg)
			}
		}

	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
		m.progress.Width = msg.Width - 4

	case tickMsg:
		// Update progress bar if currently pressing a key
		if m.currentKeyPress != nil {
			duration := time.Since(m.currentKeyPress.PressTime)
			m.currentKeyPress.Duration = duration

			// Auto-finalize after a reasonable time (simulates key release)
			if m.mode == ModeTimingCalibration {
				// In calibration mode, wait longer to allow measuring holds
				if duration > 2*time.Second {
					m.finalizeKeyPress()
				}
			} else {
				// In other modes, finalize quickly
				if duration > 500*time.Millisecond {
					m.finalizeKeyPress()
				}
			}
		}
		return m, tickCmd()
	}

	return m, nil
}

// handleKeyPress processes a regular key press
func (m *Model) handleKeyPress(msg tea.KeyMsg) {
	// Start tracking this key press
	if m.currentKeyPress != nil {
		// Finalize the previous key press
		m.finalizeKeyPress()
	}

	// Get the key as a rune
	runes := []rune(msg.String())
	if len(runes) != 1 {
		return // Ignore multi-char keys like "enter", "space", etc. for now
	}

	key := runes[0]

	// Start new key press tracking
	m.currentKeyPress = &KeyPress{
		Key:       key,
		PressTime: time.Now(),
		Duration:  0,
		IsHRM:     m.config.IsHRMKey(key),
		Modifier:  m.config.GetModifier(key),
	}
}

// finalizeKeyPress completes the current key press tracking
func (m *Model) finalizeKeyPress() {
	if m.currentKeyPress == nil {
		return
	}

	// Finalize duration
	m.currentKeyPress.Duration = time.Since(m.currentKeyPress.PressTime)

	// Evaluate the key press
	result := EvaluateKeyPress(*m.currentKeyPress, m.config)
	m.lastResult = &result
	m.keyPresses = append(m.keyPresses, *m.currentKeyPress)

	// Handle different modes
	switch m.mode {
	case ModeTimingCalibration:
		m.calibrationPresses = append(m.calibrationPresses, *m.currentKeyPress)
		if m.calibrationPhase == 0 && len(m.calibrationPresses) >= 10 {
			m.calibrationPhase = 1
			m.calibrationPresses = make([]KeyPress, 0)
			m.statusMessage = "Now hold each key longer (like activating a modifier). Press 10 times."
		} else if m.calibrationPhase == 1 && len(m.calibrationPresses) >= 10 {
			m.calibrationPhase = 2
			m.stats = CalculateTimingStats(m.calibrationPresses)
		}

	case ModeHRMPractice, ModeLayerPractice, ModeWordlistPractice:
		if m.currentPos < len(m.targetText) {
			expected := rune(m.targetText[m.currentPos])
			if m.currentKeyPress.Key == expected {
				m.currentPos++
				// Check if we completed a word (space or end)
				if m.currentKeyPress.Key == ' ' || m.currentPos >= len(m.targetText) {
					m.wordsTyped++
				}
				if m.currentPos >= len(m.targetText) {
					// Generate new text for continuous practice
					if m.mode == ModeWordlistPractice && m.currentWordlist != nil {
						m.targetText += " " + m.currentWordlist.GeneratePracticeText(20)
					}
					m.statusMessage = "Complete! Press 'q' for menu or keep typing to continue practicing."
				}
			} else {
				m.errors++
			}
		}
	}

	m.currentKeyPress = nil
}

// waitForKeyPress waits for a key press and returns it as a message
func waitForKeyPress(config *PracticeConfig) tea.Cmd {
	return func() tea.Msg {
		// Not needed anymore as we handle keys in Update
		return nil
	}
}
