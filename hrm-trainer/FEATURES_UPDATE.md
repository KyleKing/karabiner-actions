# New Advanced Features Added

## 1. Per-Key Statistics & Heatmap (Mode 6)

**What it does:**
- Tracks statistics for each individual key
- Shows performance heatmap for all HRM keys
- Identifies problem keys automatically
- Generates custom practice drills for your weak spots

**Display includes:**
- Star rating (1-5 ⭐) for each key
- Accuracy percentage
- Average duration
- Total presses and accidental modifier activations
- Color-coded: Green (>90%), Yellow (75-90%), Red (<75%)

**Auto-generated drills:**
- Focuses on your top 3 problem keys
- Pulls words from MonkeyType wordlists containing those keys
- Customized practice text based on YOUR weaknesses

**Example output:**
```
Key Performance Heatmap:

  'a' (gui): 847 presses | 88% acc | avg 156ms ⭐⭐⭐⭐☆
  's' (alt): 923 presses | 92% acc | avg 142ms ⭐⭐⭐⭐⭐
  'd' (ctrl): 1047 presses | 69% acc | avg 218ms ⭐⭐☆☆☆  ← Problem!
  
⚠️  Problem Keys (need practice):
  1. 'd' (ctrl) - 69% accuracy, 324 accidental mods
  2. 'f' (shift) - 81% accuracy, 140 accidental mods
  
💪 Recommended Drill:
Focus: 'd'(ctrl 69%) 'f'(shift 81%)
Practice: made code idea decode android updateード
```

## 2. Live Threshold Tuning (Mode 7)

**What it does:**
- Test different thresholds in real-time
- Compare results across multiple thresholds
- Get data-driven recommendations for optimal threshold

**Test thresholds:**
- 150ms, 180ms, 200ms (your current), 220ms, 250ms, 300ms
- Switch between them with ←/→ arrow keys
- Practice same text with each threshold
- See immediate comparison

**Shows for each threshold:**
- Number of presses tested
- Percentage of accidental modifier activations
- Average timing
- Color-coded results

**Recommendation engine:**
- Analyzes all tested thresholds
- Finds best accuracy
- Suggests optimal threshold for YOUR typing style

**Example output:**
```
Current config threshold: 200ms

Select threshold (←/→ to change):
  150ms | 45 presses, 31% accidental, avg 187ms
  180ms | 52 presses, 18% accidental, avg 165ms
▶ 200ms ← testing | 98 presses, 12% accidental, avg 171ms
  220ms | 73 presses, 5% accidental, avg 168ms
  250ms | 34 presses, 2% accidental, avg 165ms

📊 Recommendation:
  Best threshold: 220ms (95% accuracy)
  Consider changing from 200ms → 220ms in config
```

## 3. Session Tracking & History (Mode 0)

**What it does:**
- Automatically saves every practice session
- Stored in `~/.hrm-trainer/sessions.json`
- Tracks up to 100 recent sessions
- Shows trends over time

**Tracked per session:**
- Date and time
- Practice mode used
- Duration
- WPM (words per minute)
- Overall accuracy
- Total key presses and errors
- Average HRM timing
- Problem keys identified
- Per-key statistics

**Trend analysis:**
- WPM improvement/decline
- Accuracy changes
- HRM timing optimization
- Identifies if you're improving

**Example output:**
```
📈 Session History

Showing last 10 sessions:

  2025-11-23 14:30 | Wordlist Practice
    Duration: 8m34s | WPM: 67.3 | Accuracy: 94%
    Presses: 1,247 | Errors: 73 | Avg HRM: 165ms
    Problem keys: d, f

  2025-11-23 13:15 | HRM Practice
    Duration: 5m12s | WPM: 52.1 | Accuracy: 87%
    Presses: 892 | Errors: 116 | Avg HRM: 183ms
    Problem keys: d, f, k

📊 Trends (last 5 sessions):
  WPM: improving (+15.2)
  Accuracy: improving (+7.3%)
  HRM Timing: improving (-18ms)  ← Getting faster!
```

## 4. Layer Activation Practice (Mode 8)

**What it does:**
- Practice activating your experimental symbol layers
- Learn chord timing for layer activation
- Build muscle memory for Spacebar+G, V+M combos

**Shows:**
- All available symbol layers from your config
- Activation keys for each layer
- Mode (sticky/chord)
- Mapped symbols

**Coming features:**
- Step-by-step layer activation practice
- Timing feedback for chord presses
- Practice sequences like: Activate layer → press key → get symbol

**Example output:**
```
Symbol Layers:
  • hyper_g: g (mode: sticky)
  • duo_space_g: spacebar+g (mode: chord)
  • numbers_v_m: v+m (mode: chord)

Practice activating layers with proper timing.
Simultaneous threshold: 45ms
```

## 5. Chord Practice (Mode 9)

**What it does:**
- Practice pressing two keys simultaneously
- Track timing gap between key presses
- Build muscle memory for HRM combinations

**Features:**
- Default practice: d+f (Ctrl+Shift)
- Measures gap between keys
- Success if gap < 45ms (your simultaneous threshold)
- Shows recent attempt history
- Tracks success rate and average gap

**Example output:**
```
Target Chord: d+f (Ctrl+Shift)

Recent Attempts:
  ✓ Gap: 23ms (simultaneous!)
  ⚠ Gap: 67ms (too slow)
  ✓ Gap: 31ms (simultaneous!)
  ✓ Gap: 18ms (simultaneous!)
  ⚠ Gap: 52ms (too slow)

Statistics: 60% success | avg gap: 38ms
```

## How Session Tracking Works

**Automatic saving:**
- Sessions saved when you complete practice and return to menu
- No manual intervention needed
- Persists across app restarts

**File location:**
```
~/.hrm-trainer/sessions.json
```

**Data collected:**
```json
{
  "date": "2025-11-23T14:30:00Z",
  "duration": "514000000000",  // 8m34s in nanoseconds
  "mode": "Wordlist Practice",
  "total_presses": 1247,
  "errors": 73,
  "wpm": 67.3,
  "accuracy": 94.1,
  "avg_hrm_timing": "165000000",  // 165ms in nanoseconds
  "problem_keys": ["d", "f"],
  "per_key_stats": {
    "d": {
      "presses": 142,
      "accidental_mods": 31,
      "avg_duration": "218000000"
    }
  }
}
```

## Integration with Existing Features

All new features work together:

1. **Practice** with any mode (2, 3, 4)
2. **Check per-key stats** (mode 6) to find problem keys
3. **Use threshold tuning** (mode 7) to optimize your config
4. **Review history** (mode 0) to see improvement
5. **Practice chords** (mode 9) for specific key combinations

**Workflow example:**
```
Day 1: Practice → Notice 'd' key causing errors
Day 2: Per-key stats → Confirm 'd' has 69% accuracy
Day 3: Threshold tuning → Test if 220ms helps
Day 4: Update config → Change threshold to 220ms
Day 5: Practice more → 'd' improves to 85%
Week 2: Session history → See overall improvement trend
```

## Updated Menu

```
🎹 HRM Typing Trainer

Basic Practice:
  1. Timing Calibration
  2. HRM Practice
  3. Layer Practice
  4. Wordlist Practice

Advanced Tools:
  5. View Statistics - Overall timing stats
  6. Per-Key Stats & Heatmap - Problem key analysis
  7. Threshold Tuning - Find your optimal threshold
  8. Layer Activation - Practice layer chords
  9. Chord Practice - Practice simultaneous keys
  0. Session History - View your progress over time

  h. Toggle hints | q. Quit
```

## Technical Details

**New files added:**
- `stats.go` - Per-key and session tracking logic

**Modified files:**
- `model.go` - Added new modes and state management
- `view.go` - Added 5 new view functions
- `keypress.go` - Enhanced to support threshold testing

**Data persistence:**
- Sessions: `~/.hrm-trainer/sessions.json`
- Automatically created on first use
- Maintains last 100 sessions

**Memory efficient:**
- Per-key stats stored in memory during session
- Only session summaries persisted to disk
- Old sessions auto-pruned (keeps last 100)
