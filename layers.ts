import { complexModifications } from "karabiner.ts";
import { parameters, rules } from "./config.ts";

const LAYER_VAR_PREFIXES = ["duo-layer-", "layer-"];

export type LayerMapping = {
  from: string;
  to: string;
};

export type Layer = {
  id: string;
  description: string;
  kind: "chord" | "modTap";
  triggerKeys: string[];
  threshold: number;
  keyDownOrder: string;
  mappings: LayerMapping[];
};

export type Conflict = {
  layer: string;
  severity: "error" | "warning";
  message: string;
};

// biome-ignore lint/suspicious/noExplicitAny: karabiner.ts emits loosely typed JSON
type Json = any;

const GLYPHS: Record<string, string> = {
  close_bracket: "]",
  comma: ",",
  delete_forward: "⌦",
  delete_or_backspace: "⌫",
  display_brightness_decrement: "🔅",
  display_brightness_increment: "🔆",
  down_arrow: "↓",
  end: "End",
  equal_sign: "=",
  fastforward: "⏭",
  home: "Home",
  hyphen: "-",
  launchpad: "Launchpad",
  left_arrow: "←",
  left_command: "⌘",
  left_control: "⌃",
  left_option: "⌥",
  left_shift: "⇧",
  mission_control: "Mission Control",
  mute: "🔇",
  open_bracket: "[",
  page_down: "PgDn",
  page_up: "PgUp",
  period: ".",
  play_or_pause: "⏯",
  quote: "'",
  return_or_enter: "⏎",
  rewind: "⏮",
  right_arrow: "→",
  right_command: "⌘",
  right_control: "⌃",
  right_option: "⌥",
  right_shift: "⇧",
  semicolon: ";",
  slash: "/",
  spacebar: "␣",
  up_arrow: "↑",
  volume_decrement: "🔉",
  volume_increment: "🔊",
};

// Shifted output reads better as the symbol it produces than as "⇧4".
const SHIFTED: Record<string, string> = {
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "0": ")",
  comma: "<",
  period: ">",
  hyphen: "_",
  equal_sign: "+",
  open_bracket: "{",
  close_bracket: "}",
  slash: "?",
  semicolon: ":",
  quote: '"',
};

const MOD_GLYPHS: Record<string, string> = {
  left_command: "⌘",
  left_control: "⌃",
  left_option: "⌥",
  left_shift: "⇧",
  right_command: "⌘",
  right_control: "⌃",
  right_option: "⌥",
  right_shift: "⇧",
};

function glyph(keyCode: string): string {
  return GLYPHS[keyCode] ?? keyCode;
}

function describeToEvent(event: Json): string {
  if (event.pointing_button) return `mouse ${event.pointing_button}`;
  if (event.mouse_key) return "mouse move";
  if (event.consumer_key_code) return glyph(event.consumer_key_code);
  if (!event.key_code) return "";

  const mods: string[] = event.modifiers ?? [];
  const isShiftOnly =
    mods.length === 1 && mods[0] !== undefined && mods[0].endsWith("shift");
  const shifted = SHIFTED[event.key_code];
  if (isShiftOnly && shifted) return shifted;

  const prefix = mods.map((m) => MOD_GLYPHS[m] ?? m).join("");
  return prefix + glyph(event.key_code);
}

function describeTo(to: Json[] | undefined): string {
  if (!to) return "";
  return to.map(describeToEvent).filter(Boolean).join(" ");
}

function isLayerVarName(name: string | undefined): boolean {
  return name !== undefined && LAYER_VAR_PREFIXES.some((p) => name.startsWith(p));
}

function layerVariable(manipulator: Json): string | undefined {
  const condition = (manipulator.conditions ?? []).find(
    (c: Json) => c.type === "variable_if" && isLayerVarName(c.name),
  );
  return condition?.name;
}

function buildProfile(source: Json[] = rules): Json {
  return complexModifications(source, parameters);
}

export function extractLayers(source?: Json[]): Layer[] {
  const built = buildProfile(source);
  const layers: Layer[] = [];

  for (const rule of built.rules as Json[]) {
    const trigger = (rule.manipulators as Json[]).find(
      (m) =>
        isLayerVarName(m.to?.[0]?.set_variable?.name) &&
        (m.from?.simultaneous || (m.from?.key_code && m.to_if_alone)),
    );
    if (!trigger) continue;

    const id = trigger.to[0].set_variable.name;
    const kind: "chord" | "modTap" = trigger.from.simultaneous ? "chord" : "modTap";
    const mappings: LayerMapping[] = [];
    for (const m of rule.manipulators as Json[]) {
      if (layerVariable(m) !== id) continue;
      if (!m.from?.key_code) continue;
      const to = describeTo(m.to);
      if (!to) continue;
      mappings.push({ from: m.from.key_code, to });
    }

    layers.push({
      id,
      description: rule.description,
      kind,
      triggerKeys:
        kind === "chord"
          ? trigger.from.simultaneous.map((k: Json) => k.key_code)
          : [trigger.from.key_code],
      threshold:
        kind === "chord"
          ? (trigger.parameters?.["basic.simultaneous_threshold_milliseconds"] ?? 0)
          : 0,
      keyDownOrder:
        kind === "chord"
          ? (trigger.from.simultaneous_options?.key_down_order ?? "insensitive")
          : "n/a",
      mappings,
    });
  }

  return layers;
}

export function extractHomeRowMods(source?: Json[]): Record<string, string> {
  const built = buildProfile(source);
  const mods: Record<string, string> = {};

  for (const rule of built.rules as Json[]) {
    for (const m of rule.manipulators as Json[]) {
      const key = m.from?.key_code;
      const held = m.to_if_held_down?.[0]?.key_code;
      if (!key || !held) continue;
      if (m.from.simultaneous) continue;
      if (!MOD_GLYPHS[held]) continue;
      mods[key] = held;
    }
  }

  return mods;
}

export function findConflicts(
  layers: Layer[],
  homeRowMods: Record<string, string>,
): Conflict[] {
  const conflicts: Conflict[] = [];
  const profileThreshold = parameters["basic.simultaneous_threshold_milliseconds"];
  const seen = new Map<string, string>();

  for (const layer of layers) {
    for (const key of layer.triggerKeys) {
      const mod = homeRowMods[key];
      if (mod) {
        conflicts.push({
          layer: layer.description,
          severity: "error",
          message: `Trigger key "${key}" is the ${MOD_GLYPHS[mod] ?? mod} home row mod. Layers are matched before the mods rule, so the modifier is shadowed whenever the chord lands first.`,
        });
      }
    }

    if (layer.kind === "chord" && layer.keyDownOrder !== "strict") {
      conflicts.push({
        layer: layer.description,
        severity: "error",
        message: `key_down_order is "${layer.keyDownOrder}", so a word ending in "${layer.triggerKeys.at(-1)}" followed by a space opens this layer. Set key_down_order to "strict".`,
      });
    }

    if (
      layer.kind === "chord" &&
      profileThreshold !== undefined &&
      layer.threshold > profileThreshold
    ) {
      conflicts.push({
        layer: layer.description,
        severity: "error",
        message: `Trigger window is ${layer.threshold}ms against a profile threshold of ${profileThreshold}ms. Every ${glyph(layer.triggerKeys[0] ?? "")} press is withheld for that long.`,
      });
    }

    const signature = layer.triggerKeys.join("+");
    const owner = seen.get(signature);
    if (owner) {
      conflicts.push({
        layer: layer.description,
        severity: "error",
        message: `Trigger ${signature} is already claimed by "${owner}". Only the first rule in the list will ever fire.`,
      });
    } else {
      seen.set(signature, layer.description);
    }

    const shadowed = layer.mappings.filter((m) => homeRowMods[m.from]);
    if (shadowed.length > 0 && layer.mappings.length > 0) {
      const keys = shadowed.map((m) => m.from).join(", ");
      conflicts.push({
        layer: layer.description,
        severity: "warning",
        message: `Maps home row mod keys (${keys}). These work only because this rule is ordered before the mods rule — keep it there.`,
      });
    }
  }

  return conflicts;
}
