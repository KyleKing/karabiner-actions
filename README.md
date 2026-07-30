# Karabiner Actions

Home Row Mods (HRM) are adapted from: <https://github.com/Erlendms/karabiner-actions>. Implemented as GACS, but easily configurable for other orders

The layers were inspired by: <https://getreuer.info/posts/keyboards/symbol-layer/index.html#a-reasonable-default>

Keyboard practice is with <https://monkeytype.com> using *Quote* and *Python* to practice with symbols

## Research: chord ergonomics and timing

The `duoLayer` triggers require spacebar-then-letter within a tight window, which
is a genuine rolling chord rather than a hold-then-tap. A few sources on the
tradeoff between window size (false triggers vs. missed triggers) and on
alternative activation patterns:

- [Combos | QMK Firmware](https://docs.qmk.fm/features/combo) sets `COMBO_TERM`
  to 50ms by default and recommends "set `COMBO_TERM` as low as possible while
  still allowing consistent activation" — the window should shrink toward the
  false-trigger boundary, not grow toward comfort.
- [`from.simultaneous_options` | Karabiner-Elements](https://karabiner-elements.pqrs.org/docs/json/complex-modifications-manipulator-definition/from/simultaneous-options/)
  documents Karabiner's own default for `basic.simultaneous_threshold_milliseconds`
  as 50ms, which this project's 45ms already sits at or below.
- [Key rollover](https://en.wikipedia.org/wiki/Key_rollover) covers why fast
  typing can misfire nested-key combos, and why the standard mitigation is
  dropping the offending combo rather than widening its term.
- [A reasonable default](https://getreuer.info/posts/keyboards/symbol-layer/index.html#a-reasonable-default)
  doesn't cover activation timing directly; its own example (ShelZuuz's layout)
  uses "layer-tap keys on the base layer, placed symmetrically on the home row
  ring finger keys" — a hold-based dual-role key, not a two-key chord race.
  That's the pattern to reach for if raising the threshold stops being enough:
  make the trigger letter itself dual-role (tap for the letter, hold for the
  layer), which removes the spacebar synchronization entirely instead of
  loosening it.

## Quick Start

```sh
# Install Node (alternatively with brew, asdf, nvm, apt-get, etc.)
mise install

# Install dependencies
npm install

# Apply changes from config
npm run build

# Regenerate the keyboard diagram at docs/keyboard.html
npm run docs

# Check the config for layer conflicts
npm test
```

## Features

### Active Layers

All layers trigger on spacebar first, then the layer key, within a 60ms window:

- **Navigation Layer** (`Space → G`): Vim-style HJKL navigation, page up/down, home/end, word jumping
- **Media Controls** (`Space → M`): Volume, brightness, playback controls
- **Numpad** (`Space → N`): Right-hand numpad layout for data entry
- **Number & Symbols** (`Space → V`): Number row on QWERTY, shifted symbols on the home row
- **Function Keys** and **Mouse Control**: _disabled_ - uncomment in `my-index.ts` to try them

Two constraints keep layers from interfering with typing. Triggers avoid the home row mod keys (`a s d f j k l ;`), because a duoLayer is matched before the Home Row Mods rule and would shadow that modifier. And the trigger window tracks `basic.simultaneous_threshold_milliseconds` rather than karabiner.ts's 200ms default, since every spacebar duoLayer withholds the spacebar keypress until that window closes.

### Home Row Mods (GACS Layout)

- **Left Hand**: A (⌘), S (⌥), D (⌃), F (⇧)
- **Right Hand**: J (⇧), K (⌃), L (⌥), ; (⌘)
- Tap for letter, hold for modifier

### Other Features

- **Caps Lock → Escape** (tap) | **Both Shifts → Caps Lock** (hold)
- **CAPS Lock + F/J**: Temporary lowercase (Shift inverts CAPS)

## Documentation

`npm run docs` writes [docs/keyboard.html](./docs/keyboard.html), a keyboard diagram built by reading the compiled Karabiner rules rather than a hand-maintained copy of them, so it cannot drift from the config. Open it directly in a browser.

Click a tab to pin a layer, or hold the real chord (spacebar, then the trigger key) and the diagram follows along. Home row mods stay badged on every layer.

The page also reports conflicts that Karabiner itself will not warn about: a trigger sitting on a home row mod key, a non-strict `key_down_order`, a trigger window wider than the profile threshold, and two layers claiming the same chord. `npm test` asserts the same rules, so CI fails rather than shipping a config that breaks typing.

### Layout

- `config.ts` — the rules and profile parameters, imported by everything else
- `my-index.ts` — writes the profile (`npm run build`)
- `layers.ts` — reads the compiled rules back out and finds conflicts
- `generate-docs.ts` / `keyboard-layout.ts` — render the diagram
