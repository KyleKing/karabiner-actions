# HRM Typing Trainer

A terminal-based typing practice tool designed specifically for Home Row Mods (HRM) keyboard configurations.

Built with Go and [Bubbletea](https://github.com/charmbracelet/bubbletea).

## Features

- **Timing Calibration** - Measure your natural tap and hold speeds to optimize HRM thresholds
- **Visual Feedback** - Real-time progress bar showing key press duration vs. modifier threshold
- **HRM Practice** - Practice typing with visual warnings for HRM keys
- **Layer Practice** - Practice symbol layers with layer state visualization
- **Statistics** - Track your progress, accuracy, and identify problem keys
- **Configurable** - Loads configuration from your Karabiner setup

## Prerequisites

1. Go 1.21 or later
2. Generated practice configuration (run `npm run export` from parent directory)

## Installation

```bash
# Build the application
go build -o hrm-trainer .

# Run
./hrm-trainer
```

## Usage

### Main Menu

- **1** - Timing Calibration
- **2** - HRM Practice
- **3** - Layer Practice
- **4** - View Statistics
- **h** - Toggle hints
- **q** - Quit (or return to menu from other modes)

### Timing Calibration

Measures your natural typing speeds:

**Phase 1**: Tap any key quickly 10 times (normal typing)
**Phase 2**: Hold any key 10 times (like activating a modifier)
**Phase 3**: View results and recommendations

The tool will compare your speeds to your configured threshold and suggest adjustments if needed.

### HRM Practice

Practice typing text with visual feedback for HRM keys:

- HRM keys are highlighted in red
- Current position shown with a down arrow
- Real-time timing bar shows key press duration
- Hints show which modifier each HRM key represents
- Warnings when approaching modifier threshold

### Layer Practice

Practice typing text that uses symbol layers:

- Layer state visualization at top
- Symbol characters in practice text
- Same timing feedback as HRM practice

### Visual Feedback

#### Progress Bar

Shows real-time key press duration:

```
Press duration: 145ms / 200ms
╭──────────────────────────────────╮
│ ██████████████████░░░░░░░░░░░░░  │
╰──────────────────────────────────╮

Colors:
- Green: Safe (<180ms)
- Yellow: Warning zone (180-200ms)
- Red: Modifier activated (>200ms)
```

#### Key Press Results

After each key:

```
✓ good 'a' - 123ms - Clean tap
⚠ warning 'f' - 187ms - Close to modifier threshold
⚠️ modifier_activated 'd' - 215ms - Modifier activated
```

## Configuration

The tool loads `practice-config.json` from either:
- `../practice-output/practice-config.json` (default)
- `./practice-config.json` (fallback)

Generate this file by running `npm run export` from the parent `karabiner-actions` directory.

## Architecture

- **config.go** - Load and parse practice configuration
- **keypress.go** - Key press tracking and evaluation
- **model.go** - Bubbletea model (application state)
- **view.go** - Rendering and UI components
- **main.go** - Entry point

## How It Works

### Key Press Timing

Since terminal input doesn't provide raw key press/release events, the tool uses a hybrid approach:

1. **Key Press**: Captured via Bubbletea's `tea.KeyMsg`
2. **Duration Measurement**: Uses tick updates (100ms intervals) to measure elapsed time
3. **Auto-finalize**: Automatically finalizes key presses after:
   - 500ms (practice modes)
   - 2s (calibration mode)

This provides reasonable approximation of key hold duration for training purposes.

### HRM Detection

The tool knows which keys are HRM keys based on your configuration:

```json
{
  "homeRowMods": {
    "left": {
      "a": "gui",
      "s": "alt",
      "d": "ctrl",
      "f": "shift"
    },
    "right": {
      "j": "shift",
      "k": "ctrl",
      "l": "alt",
      ";": "gui"
    }
  }
}
```

### Timing Thresholds

Evaluates key presses based on your configured threshold:

- **Good**: Duration < (threshold - 20ms)
- **Warning**: Duration between (threshold - 20ms) and threshold
- **Modifier Activated**: Duration >= threshold

Default threshold from config: 200ms

## Future Enhancements

- [ ] Import MonkeyType wordlists
- [ ] Practice sessions with WPM calculation
- [ ] Export statistics to JSON
- [ ] Configurable practice texts
- [ ] Layer activation tracking
- [ ] Per-key statistics
- [ ] Custom color schemes

## Tips

1. **Start with calibration** to establish your baseline
2. **Use hints initially** to learn which keys are HRM
3. **Disable hints** once comfortable for realistic practice
4. **Check statistics** regularly to track improvement
5. **Focus on problem keys** identified in stats

## Troubleshooting

**Config not found**:
```bash
cd .. && npm run export
```

**Keys not registering**:
- Make sure terminal has focus
- Try different terminal emulator if issues persist

**Progress bar not updating**:
- This is expected for very quick taps (<100ms)
- Duration is still measured and recorded correctly

## License

MIT
