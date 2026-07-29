export type KeyCap = {
  code: string;
  label: string;
  width?: number;
};

// ANSI 60%. `code` must match the key_code karabiner.ts emits, since the
// rendered layers are keyed off it.
export const KEYBOARD_LAYOUT: KeyCap[][] = [
  [
    { code: "grave_accent_and_tilde", label: "`" },
    { code: "1", label: "1" },
    { code: "2", label: "2" },
    { code: "3", label: "3" },
    { code: "4", label: "4" },
    { code: "5", label: "5" },
    { code: "6", label: "6" },
    { code: "7", label: "7" },
    { code: "8", label: "8" },
    { code: "9", label: "9" },
    { code: "0", label: "0" },
    { code: "hyphen", label: "-" },
    { code: "equal_sign", label: "=" },
    { code: "delete_or_backspace", label: "⌫", width: 2 },
  ],
  [
    { code: "tab", label: "⇥", width: 1.5 },
    { code: "q", label: "Q" },
    { code: "w", label: "W" },
    { code: "e", label: "E" },
    { code: "r", label: "R" },
    { code: "t", label: "T" },
    { code: "y", label: "Y" },
    { code: "u", label: "U" },
    { code: "i", label: "I" },
    { code: "o", label: "O" },
    { code: "p", label: "P" },
    { code: "open_bracket", label: "[" },
    { code: "close_bracket", label: "]" },
    { code: "backslash", label: "\\", width: 1.5 },
  ],
  [
    { code: "caps_lock", label: "⇪", width: 1.75 },
    { code: "a", label: "A" },
    { code: "s", label: "S" },
    { code: "d", label: "D" },
    { code: "f", label: "F" },
    { code: "g", label: "G" },
    { code: "h", label: "H" },
    { code: "j", label: "J" },
    { code: "k", label: "K" },
    { code: "l", label: "L" },
    { code: "semicolon", label: ";" },
    { code: "quote", label: "'" },
    { code: "return_or_enter", label: "⏎", width: 2.25 },
  ],
  [
    { code: "left_shift", label: "⇧", width: 2.25 },
    { code: "z", label: "Z" },
    { code: "x", label: "X" },
    { code: "c", label: "C" },
    { code: "v", label: "V" },
    { code: "b", label: "B" },
    { code: "n", label: "N" },
    { code: "m", label: "M" },
    { code: "comma", label: "," },
    { code: "period", label: "." },
    { code: "slash", label: "/" },
    { code: "right_shift", label: "⇧", width: 2.75 },
  ],
  [
    { code: "left_control", label: "⌃", width: 1.25 },
    { code: "left_option", label: "⌥", width: 1.25 },
    { code: "left_command", label: "⌘", width: 1.25 },
    { code: "spacebar", label: "", width: 6.25 },
    { code: "right_command", label: "⌘", width: 1.25 },
    { code: "right_option", label: "⌥", width: 1.25 },
  ],
];

// Browser KeyboardEvent.code values that map onto karabiner key_codes, so the
// page can follow along when the real chord is pressed.
export const BROWSER_CODE_TO_KEY: Record<string, string> = {
  Space: "spacebar",
  Semicolon: "semicolon",
  Quote: "quote",
  Comma: "comma",
  Period: "period",
  Slash: "slash",
  Minus: "hyphen",
  Equal: "equal_sign",
  BracketLeft: "open_bracket",
  BracketRight: "close_bracket",
  Backslash: "backslash",
  Backquote: "grave_accent_and_tilde",
  Backspace: "delete_or_backspace",
  Enter: "return_or_enter",
  Tab: "tab",
  CapsLock: "caps_lock",
};
