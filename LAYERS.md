# Karabiner Configuration - Keyboard Layers

This document provides a visual reference for all keyboard layers and mappings.

---

## Caps Lock / Escape

**Trigger:** Physical Caps Lock key

- **Tap Caps Lock:** Escape
- **Hold Both Shifts:** Toggle Caps Lock

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

## Commented Out Layers

The following layers are currently disabled but available for activation:

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

