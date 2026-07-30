import {
  duoLayer,
  ifVar,
  layer,
  map,
  mapSimultaneous,
  rule,
  toConsumerKey,
  toKey,
  toSetVar,
  withModifier,
} from "karabiner.ts";

const L_GUI = "a";
const L_ALT = "s";
const L_CTRL = "d";
const L_SHIFT = "f";

const R_SHIFT = "j";
const R_CTRL = "k";
const R_ALT = "l";
const R_GUI = ";";

const KEY_DOWN_ORDER = "insensitive"; // strict is recommended if issues

// Layer triggers. Both duoLayer chords and the MEDIA_LAYER mod-tap are matched
// before the Home Row Mods rule, so a trigger sharing a mod key (a s d f j k l
// ;) shadows that modifier whenever the layer lands first. Pick letters that
// are also rare at the start of a word, since a duoLayer chord is
// spacebar-then-letter.
const NAV_LAYER = "g";
const MEDIA_LAYER = "m"; // mod-tap: hold alone, no spacebar chord
const NUMPAD_LAYER = "n";
const SYMBOL_LAYER = "v";

// Every spacebar duoLayer withholds the spacebar keypress until this window
// closes, so it must track basic.simultaneous_threshold_milliseconds below.
// Without it karabiner.ts bakes in duo_layer.threshold_milliseconds (200).
// 60ms is a modest raise off Karabiner's and QMK's own 50ms combo-term
// defaults (see README research section); going much higher risks matching
// ordinary "space, letter" prose typing as a chord.
const DUO_THRESHOLD = 60;

// Only spacebar-first opens a layer, so a word ending in a trigger letter
// followed by a space still types normally.
const DUO_OPTIONS = { key_down_order: "strict" } as const;

export const HOME_ROW_MODS: Record<string, string> = {
  [L_GUI]: "left_command",
  [L_ALT]: "left_option",
  [L_CTRL]: "left_control",
  [L_SHIFT]: "left_shift",
  [R_SHIFT]: "right_shift",
  [R_CTRL]: "right_control",
  [R_ALT]: "right_option",
  [R_GUI]: "right_command",
};

export const DUO_LAYER_TRIGGER_KEYS = [
  NAV_LAYER,
  MEDIA_LAYER,
  NUMPAD_LAYER,
  SYMBOL_LAYER,
];

export const duoLayerThreshold = DUO_THRESHOLD;

export const rules = [
  // Configure easier-to-use Escape from CAPS Lock
  rule(`Physical Escape; Virtual CAPS LOCK`).manipulators([
    map("caps_lock").to("escape"),
    withModifier("optionalAny")([
      map("caps_lock").condition(ifVar("caps_lock_state", 0)).to("escape"),
      map("caps_lock")
        .condition(ifVar("caps_lock_state", 1))
        .to(toSetVar("caps_lock_state", 0))
        .to("caps_lock"),
      map("escape")
        .condition(ifVar("caps_lock_state", 1))
        .to(toSetVar("caps_lock_state", 0))
        .to("caps_lock"),
      map("-").condition(ifVar("caps_lock_state", 1)).to("-", ["left_shift"]),
      map(";").condition(ifVar("caps_lock_state", 1)).to(";", ["left_shift"]),
    ]),
    // Add alternate CAPS Lock
    mapSimultaneous([L_SHIFT, R_SHIFT])
      .to(toSetVar("caps_lock_state", 1))
      .to("caps_lock"),
  ]),

  // ============================================================================
  // ACTIVE LAYERS - Productivity & Navigation
  // ============================================================================
  //
  // USAGE TIP: These layers are designed to keep your hands on the home row
  // and reduce reaching for arrows, function keys, and media controls.
  //
  // All layers use dual-key triggers to avoid accidental activation while typing.
  // Adjust triggers via the *_LAYER constants above if you hit conflicts.

  // ============================================================================
  // Navigation Layer - Vim-style arrows and navigation
  // ============================================================================
  // TRIGGER: Hold Spacebar, then G
  //
  // This is the MOST USEFUL layer for programmers and writers. It eliminates
  // the need to move your right hand to the arrow cluster.
  //
  // WHY SPACEBAR + G?
  // - Spacebar is easy to reach with either thumb
  // - G is a left-index stretch, so it costs no home row mod
  // - Leaves the right hand free for HJKL navigation
  //
  // TIP: Practice in your editor first. The muscle memory builds quickly!
  duoLayer("spacebar", NAV_LAYER)
    .threshold(DUO_THRESHOLD)
    .options(DUO_OPTIONS)
    .description("Navigation Layer (Vim-style)")
    .manipulators([
      // Arrow keys - Vim style (most important mappings)
      map("h").to("left_arrow"), // Move left
      map("j").to("down_arrow"), // Move down
      map("k").to("up_arrow"), // Move up
      map("l").to("right_arrow"), // Move right

      // Page navigation
      map("u").to("page_up"), // Page up (think "up" in the alphabet)
      map("i").to("page_down"), // Page down (next to u)

      // Line navigation
      map("n").to("home"), // Start of line (think "nice and early")
      map("m").to("end"), // End of line (next to n)

      // Word jumping (with Option modifier for macOS)
      map("y").to("left_arrow", ["left_option"]), // Previous word
      map("o").to("right_arrow", ["left_option"]), // Next word

      // Deletion (commonly used with navigation)
      map("x").to("delete_forward"), // Delete character forward
      map("delete_or_backspace").to("delete_or_backspace"), // Keep backspace working

      // Selection shortcuts (with Shift)
      map("semicolon").to("right_arrow", ["left_shift"]), // Select right
      map("a").to("left_arrow", ["left_shift"]), // Select left
    ]),

  // ============================================================================
  // Function Keys Layer - F1-F12 without reaching (DISABLED)
  // ============================================================================
  // Disabled because F is left Shift and is the most common word-initial letter
  // of the candidate triggers, so it is the trigger most likely to eat a mod.
  // To try it, add a const alongside the other *_LAYER triggers and uncomment.
  //
  // duoLayer("spacebar", FUNCTION_LAYER)
  //   .threshold(DUO_THRESHOLD)
  //   .options(DUO_OPTIONS)
  //   .description("Function Keys Layer")
  //   .manipulators([
  //     map("1").to("f1"),
  //     map("2").to("f2"),
  //     map("3").to("f3"),
  //     map("4").to("f4"),
  //     map("5").to("f5"),
  //     map("6").to("f6"),
  //     map("7").to("f7"),
  //     map("8").to("f8"),
  //     map("9").to("f9"),
  //     map("0").to("f10"),
  //     map("hyphen").to("f11"),
  //     map("equal_sign").to("f12"),
  //     map("r").to("f5"), // Refresh (common in browsers/IDEs)
  //     map("d").to("f12"), // Developer tools (common browser shortcut)
  //   ]),

  // ============================================================================
  // Media & System Control Layer
  // ============================================================================
  // TRIGGER: Hold M alone (no spacebar). Tap M types "m" as normal.
  //
  // WHY MOD-TAP INSTEAD OF A SPACEBAR CHORD?
  // Chording spacebar+M requires both keydowns to land within DUO_THRESHOLD of
  // each other, which is hard to hit deliberately (see README research section).
  // A mod-tap needs no synchronization between two keys: holding M past
  // basic.to_if_held_down_threshold_milliseconds is the only condition.
  //
  // WHY THIS LAYER?
  // - No need to reach for dedicated media keys
  // - Control volume/brightness without looking
  // - Works on any keyboard (even those without media keys)
  //
  // TIP: The layout mirrors common media key positions (left for volume, right for brightness)
  layer(MEDIA_LAYER)
    .description("Media & System Control Layer")
    .manipulators([
      // Volume control (left side - easy to remember)
      map("h").to("volume_decrement"), // Volume down
      map("l").to("volume_increment"), // Volume up
      map("j").to("mute"), // Mute/unmute

      // Brightness control (right side). Karabiner's key_code for brightness is
      // unreliable on many Macs; consumer_key_code is the form that actually works.
      map("u").to(toConsumerKey("display_brightness_decrement")), // Brightness down
      map("o").to(toConsumerKey("display_brightness_increment")), // Brightness up

      // Playback controls (bottom row - like media buttons)
      map("n").to("rewind"), // Previous track
      map("comma").to("play_or_pause"), // Play/Pause (center position)
      map("period").to("fastforward"), // Next track

      // System controls
      map("k").to("mission_control"), // macOS Mission Control
      map("i").to("launchpad"), // macOS Launchpad

      // Lock screen (Security)
      map("q").to("q", ["left_control", "left_command"]), // Cmd+Ctrl+Q locks screen on macOS
    ]),

  // ============================================================================
  // Numpad Layer - Right-hand number pad
  // ============================================================================
  // TRIGGER: Hold Spacebar, then N
  //
  // WHY THIS LAYER?
  // - Laptops don't have numpads
  // - Useful for data entry, calculations
  // - Right-hand keeps natural numpad position
  //
  // LAYOUT MIMICS STANDARD NUMPAD:
  //   7 8 9
  //   4 5 6
  //   1 2 3
  //     0
  //
  // TIP: Great for spreadsheet work or quick calculations
  duoLayer("spacebar", NUMPAD_LAYER)
    .threshold(DUO_THRESHOLD)
    .options(DUO_OPTIONS)
    .description("Numpad Layer (Right-hand)")
    .manipulators([
      // Top row - 7, 8, 9
      map("u").to("7"),
      map("i").to("8"),
      map("o").to("9"),

      // Middle row - 4, 5, 6
      map("j").to("4"),
      map("k").to("5"),
      map("l").to("6"),

      // Bottom row - 1, 2, 3
      map("m").to("1"),
      map("comma").to("2"),
      map("period").to("3"),

      // Zero and operators
      map("spacebar").to("0"), // Space becomes 0 (easy thumb access)
      map("h").to("0"), // Alternative 0 position

      // Math operators (left hand stays free)
      map("p").to("equal_sign", ["left_shift"]), // Plus +
      map("semicolon").to("hyphen"), // Minus -
      map("quote").to("8", ["left_shift"]), // Multiply *
      map("slash").to("slash"), // Divide /
      map("return_or_enter").to("return_or_enter"), // Enter for calculations
    ]),

  // ============================================================================
  // Mouse Control Layer (OPTIONAL - Advanced)
  // ============================================================================
  // TRIGGER: Hold Spacebar + C simultaneously
  //
  // WHY THIS LAYER?
  // - Control mouse without taking hands off keyboard
  // - Useful for presentations or when mouse is unavailable
  // - Accessibility feature
  //
  // WARNING: Mouse control requires Karabiner's "Manipulate pointer" permission
  // Enable in: System Preferences > Security & Privacy > Accessibility
  //
  // TIP: This is advanced - you may want to disable if not needed
  // Comment out this entire layer if you don't use mouse keyboard control
  //
  // DISABLED BY DEFAULT - Uncomment to enable:
  // duoLayer("spacebar", "c")
  //   .description("Mouse Control Layer")
  //   .manipulators([
  //     // Mouse movement (Vim-style)
  //     map("h").to({ mouse_key: { x: -1536 } }), // Move left
  //     map("j").to({ mouse_key: { y: 1536 } }), // Move down
  //     map("k").to({ mouse_key: { y: -1536 } }), // Move up
  //     map("l").to({ mouse_key: { x: 1536 } }), // Move right
  //
  //     // Fast movement (with shift modifier)
  //     map("u").to({ mouse_key: { x: -3072 } }), // Fast left
  //     map("i").to({ mouse_key: { y: -3072 } }), // Fast up
  //     map("o").to({ mouse_key: { x: 3072 } }), // Fast right
  //     map("m").to({ mouse_key: { y: 3072 } }), // Fast down
  //
  //     // Mouse clicks
  //     map("f").to({ pointing_button: "button1" }), // Left click
  //     map("d").to({ pointing_button: "button2" }), // Right click
  //     map("s").to({ pointing_button: "button3" }), // Middle click
  //
  //     // Scroll wheel
  //     map("y").to({ mouse_key: { vertical_wheel: -32 } }), // Scroll up
  //     map("n").to({ mouse_key: { vertical_wheel: 32 } }), // Scroll down
  //   ]),

  // ============================================================================
  // CAPS Lock Enhancement - Temporary Lowercase
  // ============================================================================
  // FEATURE: When CAPS LOCK is active, hold any Home Row Mod key for lowercase
  //
  // WHY THIS WORKS:
  // Your Home Row Mods already include Shift on F and J.
  // When CAPS is on, holding Shift inverts to lowercase (standard behavior).
  //
  // USAGE:
  // 1. Activate CAPS LOCK (press both Shift keys simultaneously)
  // 2. To type ONE lowercase letter: Hold F or J while typing the letter
  // 3. To type MULTIPLE lowercase: Hold F or J and type multiple letters
  //
  // EXAMPLE:
  // - CAPS on, type "hello" → HELLO
  // - CAPS on, hold F, type "h" → H (wait, that's uppercase)
  // - Actually: CAPS + Shift = lowercase (this is standard keyboard behavior!)
  //
  // TIP: This is already built into your Home Row Mods! No code needed.
  // Just hold F (left shift) or J (right shift) when CAPS is active.

  // ============================================================================
  // COMMENTED OUT / EXPERIMENTAL LAYERS
  // ============================================================================
  // The following layers are disabled but available for experimentation.
  // Uncomment and modify as needed.

  // Number and Symbol Layer - Optimized for programming
  // Trigger: Hold Spacebar + V simultaneously, then press any key below
  // Works on both laptop and external keyboards
  duoLayer("spacebar", SYMBOL_LAYER)
    .threshold(DUO_THRESHOLD)
    .options(DUO_OPTIONS)
    .description("Number & Symbol Layer (Space+V)")
    .manipulators([
      // Numbers on top row (1-0)
      map("q").to("1"),
      map("w").to("2"),
      map("e").to("3"),
      map("r").to("4"),
      map("t").to("5"),
      map("y").to("6"),
      map("u").to("7"),
      map("i").to("8"),
      map("o").to("9"),
      map("p").to("0"),

      // Shifted numbers on home row for symbols (!, @, #, $, %, ^, &, *, (, ))
      map("a").to("1", ["left_shift"]), // !
      map("s").to("2", ["left_shift"]), // @
      map("d").to("3", ["left_shift"]), // #
      map("f").to("4", ["left_shift"]), // $
      map("g").to("5", ["left_shift"]), // %
      map("h").to("6", ["left_shift"]), // ^
      map("j").to("7", ["left_shift"]), // &
      map("k").to("8", ["left_shift"]), // *
      map("l").to("9", ["left_shift"]), // (
      map(";").to("0", ["left_shift"]), // )

      // Brackets and braces on bottom row (easy to reach)
      map("z").to("open_bracket", ["left_shift"]), // {
      map("x").to("["), // [
      map("c").to("9", ["left_shift"]), // (
      map("v").to("comma", ["left_shift"]), // <
      map("b").to("period", ["left_shift"]), // >
      map("n").to("0", ["left_shift"]), // )
      map("m").to("]"), // ]
      map(",").to("close_bracket", ["left_shift"]), // }

      // Common operators
      map(".").to("equal_sign"), // =
      map("/").to("equal_sign", ["left_shift"]), // +
      map("hyphen").to("hyphen"), // -
      map("equal_sign").to("hyphen", ["left_shift"]), // _
    ]),

  // Home row mods
  rule(
    `Home Row Mods (GUI: ${L_GUI}, Ctrl: ${L_CTRL}, Alt: ${L_ALT}, Shift: ${L_SHIFT})`,
  ).manipulators([
    //
    // Four - left hand
    mapSimultaneous([L_SHIFT, L_CTRL, L_ALT, L_GUI]).toIfHeldDown("left_shift", [
      "left_control",
      "left_option",
      "left_command",
    ]),
    //
    // Three - left hand
    mapSimultaneous([L_SHIFT, L_CTRL, L_ALT]).toIfHeldDown("left_shift", [
      "left_control",
      "left_option",
      "left_command",
    ]),
    mapSimultaneous([L_SHIFT, L_ALT, L_GUI]).toIfHeldDown("left_shift", [
      "left_option",
      "left_command",
    ]),
    mapSimultaneous([L_CTRL, L_ALT, L_GUI]).toIfHeldDown("left_control", [
      "left_option",
      "left_command",
    ]),
    //
    // Two - left hand
    mapSimultaneous([L_SHIFT, L_CTRL], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_SHIFT)
      .toIfAlone(L_CTRL)
      .toIfHeldDown("left_shift", "left_control"),
    mapSimultaneous([L_CTRL, L_SHIFT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_CTRL)
      .toIfAlone(L_SHIFT)
      .toIfHeldDown("left_shift", "left_control"),
    mapSimultaneous([L_SHIFT, L_ALT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_SHIFT)
      .toIfAlone(L_ALT)
      .toIfHeldDown("left_shift", "left_option"),
    mapSimultaneous([L_ALT, L_SHIFT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_ALT)
      .toIfAlone(L_SHIFT)
      .toIfHeldDown("left_shift", "left_option"),
    mapSimultaneous([L_SHIFT, L_GUI], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_SHIFT)
      .toIfAlone(L_GUI)
      .toIfHeldDown("left_shift", "left_command"),
    mapSimultaneous([L_GUI, L_SHIFT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_GUI)
      .toIfAlone(L_SHIFT)
      .toIfHeldDown("left_shift", "left_command"),
    mapSimultaneous([L_CTRL, L_ALT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_CTRL)
      .toIfAlone(L_ALT)
      .toIfHeldDown("left_control", "left_option"),
    mapSimultaneous([L_ALT, L_CTRL], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_ALT)
      .toIfAlone(L_CTRL)
      .toIfHeldDown("left_control", "left_option"),
    mapSimultaneous([L_CTRL, L_GUI], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_CTRL)
      .toIfAlone(L_GUI)
      .toIfHeldDown("left_control", "left_command"),
    mapSimultaneous([L_GUI, L_CTRL], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_GUI)
      .toIfAlone(L_CTRL)
      .toIfHeldDown("left_control", "left_command"),
    mapSimultaneous([L_ALT, L_GUI], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_ALT)
      .toIfAlone(L_GUI)
      .toIfHeldDown("left_option", "left_command"),
    mapSimultaneous([L_GUI, L_ALT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(L_GUI)
      .toIfAlone(L_ALT)
      .toIfHeldDown("left_option", "left_command"),
    //
    // One - left hand
    map(L_SHIFT)
      .toIfAlone(L_SHIFT, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(L_SHIFT))
      .toIfHeldDown("left_shift", {}, { halt: true }),
    map(L_CTRL)
      .toIfAlone(L_CTRL, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(L_CTRL))
      .toIfHeldDown("left_control", {}, { halt: true }),
    map(L_ALT)
      .toIfAlone(L_ALT, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(L_ALT))
      .toIfHeldDown("left_option", {}, { halt: true }),
    map(L_GUI)
      .toIfAlone(L_GUI, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(L_GUI, {}, { halt: true }))
      .toIfHeldDown("left_command", {}, { halt: true }),
    //
    //
    // Four - right hand
    mapSimultaneous([R_GUI, R_ALT, R_CTRL, R_SHIFT]).toIfHeldDown("right_shift", [
      "right_control",
      "right_option",
      "right_command",
    ]),
    //
    // Three - right hand
    mapSimultaneous([R_SHIFT, R_CTRL, R_ALT]).toIfHeldDown("right_shift", [
      "right_control",
      "right_option",
    ]),
    mapSimultaneous([R_SHIFT, R_ALT, R_GUI]).toIfHeldDown("right_shift", [
      "right_option",
      "right_command",
    ]),
    mapSimultaneous([R_CTRL, R_ALT, R_GUI]).toIfHeldDown("right_control", [
      "right_option",
      "right_command",
    ]),
    //
    // Two - right hand
    mapSimultaneous([R_SHIFT, R_CTRL], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_SHIFT)
      .toIfAlone(R_CTRL)
      .toIfHeldDown("right_shift", "right_control"),
    mapSimultaneous([R_CTRL, R_SHIFT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_CTRL)
      .toIfAlone(R_SHIFT)
      .toIfHeldDown("right_shift", "right_control"),
    mapSimultaneous([R_SHIFT, R_ALT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_SHIFT)
      .toIfAlone(R_ALT)
      .toIfHeldDown("right_shift", "right_option"),
    mapSimultaneous([R_ALT, R_SHIFT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_ALT)
      .toIfAlone(R_SHIFT)
      .toIfHeldDown("right_shift", "right_option"),
    mapSimultaneous([R_SHIFT, R_GUI], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_SHIFT)
      .toIfAlone(R_GUI)
      .toIfHeldDown("right_shift", "right_command"),
    mapSimultaneous([R_GUI, R_SHIFT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_GUI)
      .toIfAlone(R_SHIFT)
      .toIfHeldDown("right_shift", "right_command"),
    mapSimultaneous([R_CTRL, R_ALT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_CTRL)
      .toIfAlone(R_ALT)
      .toIfHeldDown("right_control", "right_option"),
    mapSimultaneous([R_ALT, R_CTRL], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_ALT)
      .toIfAlone(R_CTRL)
      .toIfHeldDown("right_control", "right_option"),
    mapSimultaneous([R_CTRL, R_GUI], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_CTRL)
      .toIfAlone(R_GUI)
      .toIfHeldDown("right_control", "right_command"),
    mapSimultaneous([R_GUI, R_CTRL], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_GUI)
      .toIfAlone(R_CTRL)
      .toIfHeldDown("right_control", "right_command"),
    mapSimultaneous([R_ALT, R_GUI], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_ALT)
      .toIfAlone(R_GUI)
      .toIfHeldDown("right_option", "right_command"),
    mapSimultaneous([R_GUI, R_ALT], { key_down_order: KEY_DOWN_ORDER })
      .toIfAlone(R_GUI)
      .toIfAlone(R_ALT)
      .toIfHeldDown("right_option", "right_command"),
    //
    // One - right hand
    map(R_SHIFT)
      .toIfAlone(R_SHIFT, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(R_SHIFT))
      .toIfHeldDown("right_shift", {}, { halt: true }),
    map(R_CTRL)
      .toIfAlone(R_CTRL, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(R_CTRL))
      .toIfHeldDown("right_control", {}, { halt: true }),
    map(R_ALT)
      .toIfAlone(R_ALT, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(R_ALT))
      .toIfHeldDown("right_option", {}, { halt: true }),
    map(R_GUI)
      .toIfAlone(R_GUI, {}, { halt: true })
      .toDelayedAction(toKey("vk_none"), toKey(R_GUI))
      .toIfHeldDown("right_command", {}, { halt: true }),
  ]),
];

export const parameters = {
  "basic.to_if_alone_timeout_milliseconds": 300, // Default 1000
  "basic.to_if_held_down_threshold_milliseconds": 200, // Default 500
  "basic.to_delayed_action_delay_milliseconds": 200, // Default 500
  "basic.simultaneous_threshold_milliseconds": 60, // Default 50
};
