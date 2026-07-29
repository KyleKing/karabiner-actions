# Karabiner Actions

Home Row Mods (HRM) are adapted from: <https://github.com/Erlendms/karabiner-actions>. Implemented as GACS, but easily configurable for other orders

The layers were inspired by: <https://getreuer.info/posts/keyboards/symbol-layer/index.html#a-reasonable-default>

Keyboard practice is with <https://monkeytype.com> using *Quote* and *Python* to practice with symbols

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

All layers trigger on spacebar first, then the layer key, within a 45ms window:

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
