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

    // Symbol Layer
    rule(`Symbol Layer Remapping`).manipulators([
      map("right_command").toHyper(),
    ]),
    hyperLayer("g")
      .description("Symbol Layer")
      .leaderMode({
        sticky: true,
        escape: [
          "caps_lock",
          "escape",
          "return_or_enter",
          "right_command",
          "spacebar",
        ],
      })
      // .notification() // Recommended
      .manipulators([map("q").to("1"), map("w").to("9")]),

    // Numbers Layer
    duoLayer("v", "m").manipulators([
      map("h").to(0),
      map("m").to(1),
      map(",").to(2),
      map(".").to(3),
      map("j").to(4),
      map("k").to(5),
      map("l").to(6),
      map("u").to(7),
      map("i").to(8),
      map("o").to(9),
    ]),

    // Home row mods
    rule(
      `Home Row Mods (GUI: ${L_GUI}, Ctrl: ${L_CTRL}, Alt: ${L_ALT}, Shift: ${L_SHIFT})`,
    ).manipulators([
      //
      // Four - left hand
      mapSimultaneous([L_SHIFT, L_CTRL, L_ALT, L_GUI], {}).toIfHeldDown(
        "left_shift",
        ["l_command_option_control"],
      ),
      //
      // Three - left hand
      mapSimultaneous([L_SHIFT, L_CTRL, L_ALT]).toIfHeldDown("left_shift", [
        "l_option_control",
      ]),
      mapSimultaneous([L_SHIFT, L_ALT, L_GUI]).toIfHeldDown("left_shift", [
        "l_command_option",
      ]),
      mapSimultaneous([L_CTRL, L_ALT, L_GUI]).toIfHeldDown("left_control", [
        "l_command_option",
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
        ["right_command_option_control"],
      ),
      //
      // Three - right hand
      mapSimultaneous([R_SHIFT, R_CTRL, R_ALT]).toIfHeldDown("right_shift", [
        "right_option_control",
      ]),
      mapSimultaneous([R_SHIFT, R_ALT, R_GUI]).toIfHeldDown("right_shift", [
        "right_command_option",
      ]),
      mapSimultaneous([R_CTRL, R_ALT, R_GUI]).toIfHeldDown("right_control", [
        "right_command_option",
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
    "basic.to_if_held_down_threshold_milliseconds": 130, // Default 500
    "basic.to_delayed_action_delay_milliseconds": 200, // Default 500
    "basic.simultaneous_threshold_milliseconds": 45, // Default 50
  },
);
