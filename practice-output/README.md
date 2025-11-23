# Typing Practice Configuration

Generated from karabiner-actions configuration on 2025-11-23T07:29:57.016Z

## Files

### practice-config.json
Complete configuration for HRM training tools. Contains:
- Home Row Mods layout (GACS)
- Symbol layer mappings
- Timing thresholds
- Metadata

### MonkeyType Wordlists

Import these into MonkeyType for targeted practice:

1. **hrm-heavy.json** - Words with many HRM keys (40 words)
   - Focus: Quick, light taps to avoid modifier activation
   - Examples: flasks, flask, falls, salad, salsa

2. **hrm-light.json** - Words with few HRM keys (64 words)
   - Focus: Safe practice without HRM conflicts
   - Examples: ласт, the, and, for, are

3. **hrm-consecutive.json** - Words with consecutive HRM keys (40 words)
   - Focus: Most challenging - consecutive home row keys
   - Examples: ask, flask, fall, falls, fast

4. **symbol-practice.json** - Code snippets for symbol layer practice (20 items)
   - Focus: Practice symbol layers with real code patterns
   - Examples: def func(args):, array[index], obj['key']

## How to Use with MonkeyType

1. Go to https://monkeytype.com
2. Click settings (gear icon)
3. Scroll to "Custom" section
4. Click "Import" and upload the JSON files from monkeytype-wordlists/
5. Select the custom wordlist in the test mode dropdown

## HRM Configuration Summary

**Home Row Mods (GACS):**
- Left hand: A (GUI), S (Alt), D (Ctrl), F (Shift)
- Right hand: J (Shift), K (Ctrl), L (Alt), ; (GUI)

**Timing:**
- Tap threshold: 200ms (hold longer = modifier)
- Alone timeout: 300ms
- Target: <180ms for safe taps

**Symbol Layers (experimental):**
- Hyper G: Sticky leader mode
- Duo Space+G: Chord activation
- Numbers V+M: Homerow numpad

See practice-config.json for complete details.
