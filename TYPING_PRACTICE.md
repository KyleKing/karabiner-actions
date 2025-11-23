# Typing Practice Tools for Home Row Mods

This repository now includes tools to help you practice and refine your typing with your specific Home Row Mods (HRM) keyboard configuration.

## Overview

Your Karabiner configuration implements aggressive Home Row Mods (GACS layout) with a 200ms threshold. This creates specific training challenges:

- **Timing is critical** - Keys held >200ms activate modifiers instead of typing the letter
- **Conflict words** - Common words like "ask", "sad", "flask" contain multiple HRM keys
- **Limited margin** - With 200ms threshold, you need <180ms taps for safety
- **Cross-hand coordination** - Shortcuts require precise timing between hands

## What Was Implemented

### 1. MonkeyType Configuration Exporter (`export-practice-config.ts`)

Exports your Karabiner configuration into practice-ready formats:

**Generated Files:**
- `practice-config.json` - Complete HRM configuration (used by training tool)
- `monkeytype-wordlists/*.json` - Custom wordlists for MonkeyType
  - `hrm-heavy.json` - Words with many HRM keys (training mode)
  - `hrm-light.json` - Words with few HRM keys (safe practice)
  - `hrm-consecutive.json` - Words with consecutive HRM keys (hardest)
  - `symbol-practice.json` - Code snippets for symbol layer practice
- `hrm-shortcuts.json` - Common shortcuts using HRM keys
- `README.md` - Documentation and usage guide

**Run the exporter:**
```bash
npm run export
```

### 2. HRM Typing Trainer (`hrm-trainer/`)

A terminal-based practice tool built with Go and Bubbletea that provides:

#### Features

**🎯 Timing Calibration**
- Measures your natural tap speed (Phase 1: 10 quick taps)
- Measures your comfortable hold duration (Phase 2: 10 holds)
- Compares to your 200ms threshold
- Recommends threshold adjustments if needed

**🏋️ HRM Practice Mode**
- Practice with real text
- HRM keys highlighted in red
- Visual hint bar shows key press duration in real-time
- Color-coded feedback:
  - Green: Safe tap (<180ms)
  - Yellow: Warning zone (180-200ms)
  - Red: Modifier activated (>200ms)
- Optional hints show next key's modifier mapping

**🔤 Layer Practice Mode**
- Practice symbol layers (experimental layers in your config)
- Visual layer state indicator
- Same timing feedback as HRM mode

**📚 Wordlist Practice Mode**
- Practice with MonkeyType wordlists
- Choose difficulty by HRM percentage
- Continuous practice (auto-generates more text)
- WPM tracking
- Difficulty ratings based on HRM content

**📊 Statistics**
- Total key presses and duration averages
- HRM-specific statistics
- Accidental modifier activations
- Accuracy percentage

#### Visual Feedback Example

```
Type the following:

▼the quick brown fox
  ^-- Current position

Press duration: 145ms / 200ms
╭──────────────────────────────────╮
│ ██████████████████░░░░░░░░░░░░░  │  <-- Progress bar (green)
╰──────────────────────────────────╮

✓ good 'a' - 123ms - Clean tap

💡 Next key 's' is HRM (alt) - tap quickly!
```

#### Installation & Usage

```bash
# Build the trainer
cd hrm-trainer
go build -o hrm-trainer .

# Run
./hrm-trainer

# Or from parent directory
cd hrm-trainer && ./hrm-trainer
```

**Main Menu:**
1. Timing Calibration - Measure your speeds
2. HRM Practice - Practice with basic text
3. Layer Practice - Practice symbol layers
4. Wordlist Practice - Practice with MonkeyType wordlists
5. View Statistics - See your progress

**Controls:**
- `h` - Toggle hints on/off
- `q` - Return to menu (or quit from menu)
- `↑/↓` or `j/k` - Navigate wordlist selection

## How to Use These Tools

### Recommended Practice Flow

**Week 1: Calibration & Baseline**
1. Run timing calibration to measure your current speeds
2. Note if threshold adjustment is recommended
3. Start with HRM Light wordlist (minimal conflicts)
4. Focus on clean taps, don't worry about speed

**Week 2-3: Build Muscle Memory**
1. Practice HRM Heavy wordlist (more challenging)
2. Pay attention to timing feedback
3. Identify problem keys in statistics
4. Practice specific problem words

**Week 4+: Advanced Practice**
1. HRM Consecutive wordlist (hardest)
2. Symbol layer practice (for code)
3. Disable hints for realistic practice
4. Track WPM improvement

### Using with MonkeyType

**Import Custom Wordlists:**
1. Go to https://monkeytype.com
2. Open Settings → Custom section
3. Click "Import" and upload JSON files from `practice-output/monkeytype-wordlists/`
4. Select the custom wordlist in test mode dropdown

**Recommended Settings:**
- Mode: Custom wordlist
- Time: 60 seconds (for WPM tracking)
- Language: Select your imported wordlist
- Difficulty progression:
  1. HRM Light → build confidence
  2. HRM Heavy → improve HRM accuracy
  3. HRM Consecutive → master tough sequences
  4. Symbol Practice → code/symbol proficiency

### Understanding the Timing

**Your Config:**
- Tap threshold: 200ms
- Alone timeout: 300ms
- Simultaneous threshold: 45ms

**Timing Zones:**
- **Safe zone**: <180ms - Clean taps, no risk
- **Warning zone**: 180-200ms - Approaching threshold
- **Modifier zone**: >200ms - Modifier activated

**Target:**
- Average tap: <150ms (safe margin)
- Problem keys: >180ms (needs practice)
- Danger keys: >200ms (causing errors)

## Configuration Details

Your HRM setup (from `my-index.ts`):

**Left Hand:**
- `a` = GUI (Command)
- `s` = Alt (Option)
- `d` = Ctrl
- `f` = Shift

**Right Hand:**
- `j` = Shift
- `k` = Ctrl
- `l` = Alt (Option)
- `;` = GUI (Command)

**Symbol Layers (currently disabled in config):**
1. **Hyper G** - Sticky leader mode
2. **Duo Space+G** - Chord for symbols
3. **Numbers V+M** - Home row numpad

The training tool supports all three layers and can help you test them before enabling in your actual config.

## Advanced: Tuning Your Threshold

Based on calibration results, you might want to adjust thresholds in `my-index.ts`:

```typescript
{
  "basic.to_if_held_down_threshold_milliseconds": 200,  // Increase if too sensitive
  "basic.to_if_alone_timeout_milliseconds": 300,       // Increase if missing taps
}
```

**Guidelines:**
- If accidental modifiers >15%: Increase threshold by 20-50ms
- If missing taps >10%: Increase alone timeout
- If too slow to activate: Decrease threshold by 10-20ms

## Future Enhancements

Potential additions to the training tool:

- [ ] Per-key statistics and heatmaps
- [ ] Practice sessions with targets (X minutes, Y words)
- [ ] Export statistics to JSON/CSV
- [ ] Layer activation tracking
- [ ] Chord timing practice
- [ ] Integration with typing.io for code practice
- [ ] Custom practice text from files
- [ ] Replay mode for reviewing mistakes

## Architecture

**TypeScript (Export Tool):**
- `export-practice-config.ts` - Main exporter
- Generates MonkeyType-compatible JSON
- Creates reusable practice-config.json

**Go (Training Tool):**
- `main.go` - Entry point
- `config.go` - Config loader
- `keypress.go` - Timing analysis
- `wordlist.go` - MonkeyType wordlist support
- `model.go` - Bubbletea state management
- `view.go` - UI rendering

## Resources

**Inspirations:**
- [tui-typer-tutor](https://github.com/KyleKing/tui-typer-tutor) - Terminal typing tutor
- [typing-practice](https://climech.github.io/typing-practice) - Web-based practice
- [MonkeyType](https://monkeytype.com) - Feature-rich typing test
- [Pascal Getreuer's Symbol Layer](https://getreuer.info/posts/keyboards/symbol-layer/index.html) - Symbol layer design

**Your Methodology:**
- Current: MonkeyType with Quote and Python modes
- New: Custom wordlists + dedicated training tool
- Focus: HRM timing accuracy, not just WPM

## Questions?

**"Should I use the trainer or MonkeyType?"**
- Both! Trainer for timing feedback, MonkeyType for WPM tracking

**"Can I practice without the wordlists?"**
- Yes, modes 1-3 work without wordlists. Only mode 4 needs them.

**"My threshold is too aggressive (200ms), should I change it?"**
- Try calibration first. If average tap >160ms, consider increasing threshold.

**"The progress bar doesn't show for quick taps?"**
- Normal! The bar updates every 100ms. Very fast taps (<100ms) might not show.
- Duration is still measured and recorded correctly.

**"Can I use this with other HRM layouts (GACS, CAGS, etc.)?"**
- Yes! Edit `practice-config.json` to match your layout.

## Summary

You now have:
1. ✅ MonkeyType custom wordlists tailored to your HRM layout
2. ✅ Dedicated training tool with real-time timing feedback
3. ✅ Calibration tool to optimize your thresholds
4. ✅ Statistics tracking to identify problem keys
5. ✅ Visual hints for learning layer mappings

**Next steps:**
1. Run `npm run export` to generate configs
2. Build and run `hrm-trainer`
3. Start with timing calibration
4. Practice with wordlists
5. Track your improvement!

Happy typing! 🎹
