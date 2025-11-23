import {
  duoLayer,
  hyperLayer,
  ifVar,
  map,
  mapSimultaneous,
  rule,
  toKey,
  toSetVar,
  withModifier,
  writeToProfile,
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

writeToProfile(
  "Default profile",
  [
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
    // Adjust triggers if you find conflicts with your typing patterns.

    // ============================================================================
    // Navigation Layer - Vim-style arrows and navigation
    // ============================================================================
    // TRIGGER: Hold Spacebar + D simultaneously
    //
    // This is the MOST USEFUL layer for programmers and writers. It eliminates
    // the need to move your right hand to the arrow cluster.
    //
    // WHY SPACEBAR + D?
    // - Spacebar is easy to reach with either thumb
    // - D is on the home row (left hand)
    // - Leaves right hand free for navigation
    // - Different hand for trigger vs navigation reduces conflicts
    //
    // TIP: Practice in your editor first. The muscle memory builds quickly!
    duoLayer("spacebar", "d")
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
    // Function Keys Layer - F1-F12 without reaching
    // ============================================================================
    // TRIGGER: Hold Spacebar + F simultaneously
    //
    // WHY THIS LAYER?
    // - Function keys are far away on most keyboards
    // - Commonly used for debugging (F5-F12), IDE shortcuts, etc.
    // - Laptop keyboards often require Fn key + number (awkward)
    //
    // TIP: Great for IDE debugging - F8 (step over), F9 (breakpoint), F10 (step into)
    duoLayer("spacebar", "f")
      .description("Function Keys Layer")
      .manipulators([
        // F1-F10 on number row
        map("1").to("f1"),
        map("2").to("f2"),
        map("3").to("f3"),
        map("4").to("f4"),
        map("5").to("f5"),
        map("6").to("f6"),
        map("7").to("f7"),
        map("8").to("f8"),
        map("9").to("f9"),
        map("0").to("f10"),

        // F11-F12 on special keys
        map("hyphen").to("f11"), // Next to 0
        map("equal_sign").to("f12"), // Next to hyphen

        // Bonus: Quick access to common function key combos
        map("r").to("f5"), // Refresh (common in browsers/IDEs)
        map("d").to("f12"), // Developer tools (common browser shortcut)
      ]),

    // ============================================================================
    // Media & System Control Layer
    // ============================================================================
    // TRIGGER: Hold Spacebar + M simultaneously
    //
    // WHY THIS LAYER?
    // - No need to reach for dedicated media keys
    // - Control volume/brightness without looking
    // - Works on any keyboard (even those without media keys)
    //
    // TIP: The layout mirrors common media key positions (left for volume, right for brightness)
    duoLayer("spacebar", "m")
      .description("Media & System Control Layer")
      .manipulators([
        // Volume control (left side - easy to remember)
        map("h").to("volume_decrement"), // Volume down
        map("l").to("volume_increment"), // Volume up
        map("j").to("mute"), // Mute/unmute

        // Brightness control (right side)
        map("u").to("display_brightness_decrement"), // Brightness down
        map("o").to("display_brightness_increment"), // Brightness up

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
    // TRIGGER: Hold Spacebar + N simultaneously
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
    duoLayer("spacebar", "n")
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

    // // // Symbol Layer
    // // rule(`Symbol Layer Remapping`).manipulators([
    // //   map("right_command").toHyper(), // Interferes with tab navigation
    // // ]),
    // hyperLayer("g")
    //   .description("Symbol Hyper Layer")
    //   .leaderMode({
    //     sticky: true,
    //     escape: [
    //       "caps_lock",
    //       "escape",
    //       "return_or_enter",
    //       "right_command",
    //       "spacebar",
    //     ],
    //   })
    //   // .notification() // Recommended
    //   .manipulators([
    //     map("j").to("9", ["left_shift"]), // Left parenthesis (
    //     map("k").to("0", ["left_shift"]), // Right parenthesis )
    //     map("u").to("["),
    //     map("i").to("]"),
    //     map("m").to("[", ["left_shift"]), // Left curly {
    //     map(",").to("]", ["left_shift"]), // Right curly }
    //   ]),
    //
    // // Symbol Duo Layer (using spacebar+g combo)
    // duoLayer("spacebar", "g")
    //   .description("Symbol Chord Layer")
    //   .manipulators([
    //     map("j").to("9", ["left_shift"]), // Left parenthesis (
    //     map("k").to("0", ["left_shift"]), // Right parenthesis )
    //     map("u").to("["), // Left square bracket
    //     map("i").to("]"), // Right square bracket
    //     map("h").to("open_bracket", ["left_shift"]), // Left curly {
    //     map("l").to("close_bracket", ["left_shift"]), // Right curly }
    //     map("n").to("comma", ["left_shift"]), // Left angle bracket <
    //     map("m").to("period", ["left_shift"]), // Right angle bracket >
    //     map("1").to("1", ["left_shift"]), // Exclamation mark !
    //     map("2").to("2", ["left_shift"]), // At symbol @
    //     map("3").to("3", ["left_shift"]), // Hash/pound #
    //     map("4").to("4", ["left_shift"]), // Dollar sign $
    //     map("5").to("5", ["left_shift"]), // Percent %
    //     map("6").to("6", ["left_shift"]), // Caret ^
    //     map("7").to("7", ["left_shift"]), // Ampersand &
    //     map("8").to("8", ["left_shift"]), // Asterisk *
    //     map("9").to("9", ["left_shift"]), // Open parenthesis (
    //     map("0").to("0", ["left_shift"]), // Close parenthesis )
    //     map("hyphen").to("hyphen", ["left_shift"]), // Underscore _
    //     map("equal_sign").to("equal_sign", ["left_shift"]), // Plus +
    //   ]),
    //
    // // Parentheses Layer
    // hyperLayer("p")
    //   .description("Parentheses and Brackets Layer")
    //   .leaderMode({
    //     sticky: false, // Non-sticky mode: needs to be held down
    //   })
    //   .manipulators([
    //     map("j").to("9", ["left_shift"]), // Left parenthesis (
    //     map("k").to("0", ["left_shift"]), // Right parenthesis )
    //     map("u").to("["), // Left square bracket [
    //     map("i").to("]"), // Right square bracket ]
    //     map("h").to("open_bracket", ["left_shift"]), // Left curly {
    //     map("l").to("close_bracket", ["left_shift"]), // Right curly }
    //     map("n").to("comma", ["left_shift"]), // Left angle bracket <
    //     map("m").to("period", ["left_shift"]), // Right angle bracket >
    //   ]),
    //
    // // Numbers Layer
    // duoLayer("v", "m").manipulators([
    //   map("h").to(0),
    //   map("m").to(1),
    //   map(",").to(2),
    //   map(".").to(3),
    //   map("j").to(4),
    //   map("k").to(5),
    //   map("l").to(6),
    //   map("u").to(7),
    //   map("i").to(8),
    //   map("o").to(9),
    // ]),

    // Home row mods
    rule(
      `Home Row Mods (GUI: ${L_GUI}, Ctrl: ${L_CTRL}, Alt: ${L_ALT}, Shift: ${L_SHIFT})`,
    ).manipulators([
      //
      // Four - left hand
      mapSimultaneous([L_SHIFT, L_CTRL, L_ALT, L_GUI]).toIfHeldDown(
        "left_shift",
        ["left_control", "left_option", "left_command"],
      ),
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
      mapSimultaneous([R_GUI, R_ALT, R_CTRL, R_SHIFT]).toIfHeldDown(
        "right_shift",
        ["right_control", "right_option", "right_command"],
      ),
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
  ],
  {
    "basic.to_if_alone_timeout_milliseconds": 300, // Default 1000
    "basic.to_if_held_down_threshold_milliseconds": 200, // Default 500
    "basic.to_delayed_action_delay_milliseconds": 200, // Default 500
    "basic.simultaneous_threshold_milliseconds": 45, // Default 50
  },
);
