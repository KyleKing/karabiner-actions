# Karabiner Configuration - Keyboard Layers

This document provides a visual reference for all keyboard layers and mappings.

---

## Caps Lock / Escape

**Trigger:** Physical Caps Lock key

- **Tap Caps Lock:** Escape
- **Hold Both Shifts:** Toggle Caps Lock
- **CAPS + Hold F or J:** Temporary lowercase (Shift inverts CAPS)

## Home Row Mods (GACS Layout)

**Trigger:** Hold home row keys

Home Row Mods allow you to use home row keys as modifiers when held, while still functioning as regular keys when tapped.

### Left Hand

| Key | Tap | Hold |
|-----|-----|------|
| A | a | ⌘ Command (GUI) |
| S | s | ⌥ Option (Alt) |
| D | d | ⌃ Control |
| F | f | ⇧ Shift |

### Right Hand

| Key | Tap | Hold |
|-----|-----|------|
| J | j | ⇧ Shift |
| K | k | ⌃ Control |
| L | l | ⌥ Option (Alt) |
| ; | ; | ⌘ Command (GUI) |

### Timing Configuration

- **to_if_alone_timeout**: 300ms (default 1000ms)
- **to_if_held_down_threshold**: 200ms (default 500ms)
- **to_delayed_action_delay**: 200ms (default 500ms)
- **simultaneous_threshold**: 45ms (default 50ms)

---

## Active Layers

The following layers are currently active and ready to use. All use dual-key triggers to avoid accidental activation.

## Navigation Layer (Vim-style)

**Trigger:** Hold Spacebar + D simultaneously

```
  [Q      ] [W      ] [E      ] [R      ] [T      ] [Y→⌥← ] [U→PgU] [I→PgD] [O→⌥→ ] [P      ]
  [A→⇧← ] [S      ] [D      ] [F      ] [G      ] [H→←  ] [J→↓  ] [K→↑  ] [L→→  ] [;→⇧→ ]
  [Z      ] [X→Del] [C      ] [V      ] [B      ] [N→Hom] [M→End] [,      ] [.      ] [/      ]
```

| Key | Output | Description |
|-----|--------|-------------|
| H | ← | Move left |
| J | ↓ | Move down |
| K | ↑ | Move up |
| L | → | Move right |
| U | PgUp | Page up |
| I | PgDn | Page down |
| N | Home | Start of line |
| M | End | End of line |
| Y | ⌥← | Previous word |
| O | ⌥→ | Next word |
| X | Del | Delete forward |
| ; | ⇧→ | Select right |
| A | ⇧← | Select left |

> **💡 TIP:** This is the most useful layer for reducing hand movement! Practice HJKL navigation in your editor.

## Function Keys Layer

**Trigger:** Hold Spacebar + F simultaneously

```
  [Q      ] [W      ] [E      ] [R→F5 ] [T      ] [Y      ] [U      ] [I      ] [O      ] [P      ]
  [A      ] [S      ] [D→F12] [F      ] [G      ] [H      ] [J      ] [K      ] [L      ] [;      ]
  [Z      ] [X      ] [C      ] [V      ] [B      ] [N      ] [M      ] [,      ] [.      ] [/      ]
```

| Key | Output | Description |
|-----|--------|-------------|
| 1 | F1 |  |
| 2 | F2 |  |
| 3 | F3 |  |
| 4 | F4 |  |
| 5 | F5 |  |
| 6 | F6 |  |
| 7 | F7 |  |
| 8 | F8 |  |
| 9 | F9 |  |
| 0 | F10 |  |
| HYPHEN | F11 |  |
| EQUAL_SIGN | F12 |  |
| R | F5 | Quick refresh |
| D | F12 | Quick dev tools |

> **💡 TIP:** Great for debugging (F8: step over, F9: breakpoint, F10: step into)

## Media & System Control Layer

**Trigger:** Hold Spacebar + M simultaneously

```
  [Q→🔒 ] [W      ] [E      ] [R      ] [T      ] [Y      ] [U→🔅 ] [I→Lau] [O→🔆 ] [P      ]
  [A      ] [S      ] [D      ] [F      ] [G      ] [H→🔉 ] [J→🔇 ] [K→Mis] [L→🔊 ] [;      ]
  [Z      ] [X      ] [C      ] [V      ] [B      ] [N→⏮  ] [M      ] [,→⏯  ] [.→⏭  ] [/      ]
```

| Key | Output | Description |
|-----|--------|-------------|
| H | 🔉 | Volume down |
| L | 🔊 | Volume up |
| J | 🔇 | Mute |
| U | 🔅 | Brightness down |
| O | 🔆 | Brightness up |
| N | ⏮ | Previous track |
| , | ⏯ | Play/Pause |
| . | ⏭ | Next track |
| K | Mission | Mission Control |
| I | Launchpad | Launchpad |
| Q | 🔒 | Lock screen |

> **💡 TIP:** Control volume and brightness without leaving the keyboard!

## Numpad Layer (Right-hand)

**Trigger:** Hold Spacebar + N simultaneously

```
  [Q      ] [W      ] [E      ] [R      ] [T      ] [Y      ] [U→7  ] [I→8  ] [O→9  ] [P→+  ]
  [A      ] [S      ] [D      ] [F      ] [G      ] [H→0  ] [J→4  ] [K→5  ] [L→6  ] [;→-  ]
  [Z      ] [X      ] [C      ] [V      ] [B      ] [N      ] [M→1  ] [,→2  ] [.→3  ] [/      ]
```

| Key | Output | Description |
|-----|--------|-------------|
| U | 7 |  |
| I | 8 |  |
| O | 9 |  |
| J | 4 |  |
| K | 5 |  |
| L | 6 |  |
| M | 1 |  |
| , | 2 |  |
| . | 3 |  |
| H | 0 |  |
| SPACEBAR | 0 | Thumb zero |
| P | + | Plus |
| ; | - | Minus |
| ' | * | Multiply |
| / | / | Divide |

> **💡 TIP:** Perfect for spreadsheets and data entry on laptops without numpads!

### Mouse Control Layer (Disabled)

**Trigger:** Hold Spacebar + C simultaneously

This advanced layer provides keyboard-based mouse control. It's disabled by default.

To enable: Uncomment the layer in `my-index.ts` (around line 241)

> **⚠️ WARNING:** Requires "Manipulate pointer" permission in System Preferences > Security & Privacy > Accessibility

---

## Commented Out / Experimental Layers

The following layers are currently disabled but available for experimentation:

## Symbol Hyper Layer (Disabled)

**Trigger:** Hold G key (hyperLayer)

```
  [Q      ] [W      ] [E      ] [R      ] [T      ] [Y      ] [U→[  ] [I→]  ] [O      ] [P      ]
  [A      ] [S      ] [D      ] [F      ] [G      ] [H      ] [J→(  ] [K→)  ] [L      ] [;      ]
  [Z      ] [X      ] [C      ] [V      ] [B      ] [N      ] [M→{  ] [,→}  ] [.      ] [/      ]
```

| Key | Output | Description |
|-----|--------|-------------|
| J | ( | Left parenthesis |
| K | ) | Right parenthesis |
| U | [ | Left square bracket |
| I | ] | Right square bracket |
| M | { | Left curly brace |
| , | } | Right curly brace |

## Symbol Chord Layer (Disabled)

**Trigger:** Hold Spacebar + G simultaneously

```
  [Q      ] [W      ] [E      ] [R      ] [T      ] [Y      ] [U→[  ] [I→]  ] [O      ] [P      ]
  [A      ] [S      ] [D      ] [F      ] [G      ] [H→{  ] [J→(  ] [K→)  ] [L→}  ] [;      ]
  [Z      ] [X      ] [C      ] [V      ] [B      ] [N→<  ] [M→>  ] [,      ] [.      ] [/      ]
```

| Key | Output | Description |
|-----|--------|-------------|
| J | ( | Left parenthesis |
| K | ) | Right parenthesis |
| U | [ | Left square bracket |
| I | ] | Right square bracket |
| H | { | Left curly brace |
| L | } | Right curly brace |
| N | < | Left angle bracket |
| M | > | Right angle bracket |
| 1 | ! | Exclamation mark |
| 2 | @ | At symbol |
| 3 | # | Hash/pound |
| 4 | $ | Dollar sign |
| 5 | % | Percent |
| 6 | ^ | Caret |
| 7 | & | Ampersand |
| 8 | * | Asterisk |
| 9 | ( | Open parenthesis |
| 0 | ) | Close parenthesis |
| HYPHEN | _ | Underscore |
| EQUAL_SIGN | + | Plus |

## Numbers Layer (Disabled)

**Trigger:** Hold V + M simultaneously

```
  [Q      ] [W      ] [E      ] [R      ] [T      ] [Y      ] [U→7  ] [I→8  ] [O→9  ] [P      ]
  [A      ] [S      ] [D      ] [F      ] [G      ] [H→0  ] [J→4  ] [K→5  ] [L→6  ] [;      ]
  [Z      ] [X      ] [C      ] [V      ] [B      ] [N      ] [M→1  ] [,→2  ] [.→3  ] [/      ]
```

| Key | Output | Description |
|-----|--------|-------------|
| H | 0 |  |
| M | 1 |  |
| , | 2 |  |
| . | 3 |  |
| J | 4 |  |
| K | 5 |  |
| L | 6 |  |
| U | 7 |  |
| I | 8 |  |
| O | 9 |  |

---

*Generated automatically by generate-docs.ts*

