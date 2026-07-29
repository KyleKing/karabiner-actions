import assert from "node:assert/strict";
import { test } from "node:test";
import { duoLayer, map } from "karabiner.ts";
import { parameters } from "./config.ts";
import { KEYBOARD_LAYOUT } from "./keyboard-layout.ts";
import {
  extractHomeRowMods,
  extractLayers,
  findConflicts,
  type Layer,
} from "./layers.ts";

const layers = extractLayers();
const homeRowMods = extractHomeRowMods();
const profileThreshold = parameters["basic.simultaneous_threshold_milliseconds"] ?? 0;

const layer = (overrides: Partial<Layer> = {}): Layer => ({
  id: "duo-layer-spacebar-g",
  description: "Test Layer",
  triggerKeys: ["spacebar", "g"],
  threshold: 45,
  keyDownOrder: "strict",
  mappings: [{ from: "h", to: "←" }],
  ...overrides,
});

test("extracts every duoLayer and nothing else", () => {
  assert.deepEqual(
    layers.map((l) => l.description),
    [
      "Navigation Layer (Vim-style)",
      "Media & System Control Layer",
      "Numpad Layer (Right-hand)",
      "Number & Symbol Layer (Space+V)",
    ],
  );
});

test("the caps lock shift chord is not mistaken for a layer", () => {
  assert.equal(
    layers.some((l) => l.description.includes("CAPS")),
    false,
  );
});

test("home row mods are GACS on both hands", () => {
  assert.deepEqual(homeRowMods, {
    a: "left_command",
    s: "left_option",
    d: "left_control",
    f: "left_shift",
    j: "right_shift",
    k: "right_control",
    l: "right_option",
    semicolon: "right_command",
  });
});

test("no layer trigger sits on a home row mod key", () => {
  for (const l of layers) {
    for (const key of l.triggerKeys) {
      assert.equal(
        homeRowMods[key],
        undefined,
        `${l.description} triggers on "${key}", which is the ${homeRowMods[key]} mod`,
      );
    }
  }
});

test("every trigger is spacebar-first and strict", () => {
  for (const l of layers) {
    assert.equal(l.triggerKeys[0], "spacebar", l.description);
    assert.equal(l.keyDownOrder, "strict", l.description);
  }
});

test("no trigger window exceeds the profile threshold", () => {
  for (const l of layers) {
    assert.ok(
      l.threshold <= profileThreshold,
      `${l.description} is ${l.threshold}ms against a ${profileThreshold}ms profile threshold`,
    );
  }
});

test("triggers are unique", () => {
  const signatures = layers.map((l) => l.triggerKeys.join("+"));
  assert.equal(new Set(signatures).size, signatures.length);
});

test("mappings render as glyphs, not raw key codes", () => {
  const nav = layers.find((l) => l.description.startsWith("Navigation"));
  assert.ok(nav);
  const outputs = new Map(nav.mappings.map((m) => [m.from, m.to]));
  assert.equal(outputs.get("h"), "←");
  assert.equal(outputs.get("j"), "↓");
  assert.equal(outputs.get("y"), "⌥←");
  assert.equal(outputs.get("u"), "PgUp");
});

test("shifted number output renders as its symbol", () => {
  const symbols = layers.find((l) => l.description.startsWith("Number"));
  assert.ok(symbols);
  const outputs = new Map(symbols.mappings.map((m) => [m.from, m.to]));
  assert.equal(outputs.get("a"), "!");
  assert.equal(outputs.get("l"), "(");
  assert.equal(outputs.get("z"), "{");
});

test("the keyboard layout covers every key the config maps", () => {
  const rendered = new Set(KEYBOARD_LAYOUT.flat().map((cap) => cap.code));
  const used = new Set<string>(Object.keys(homeRowMods));
  for (const l of layers) {
    for (const m of l.mappings) used.add(m.from);
    for (const k of l.triggerKeys) used.add(k);
  }
  const missing = [...used].filter((k) => !rendered.has(k));
  assert.deepEqual(missing, []);
});

test("the current config has no error-level conflicts", () => {
  const errors = findConflicts(layers, homeRowMods).filter(
    (c) => c.severity === "error",
  );
  assert.deepEqual(
    errors.map((c) => `${c.layer}: ${c.message}`),
    [],
  );
});

test("a trigger on a home row mod key is an error", () => {
  const found = findConflicts([layer({ triggerKeys: ["spacebar", "f"] })], homeRowMods);
  assert.ok(
    found.some((c) => c.severity === "error" && c.message.includes("home row")),
  );
});

test("an insensitive key_down_order is an error", () => {
  const found = findConflicts([layer({ keyDownOrder: "insensitive" })], homeRowMods);
  assert.ok(
    found.some((c) => c.severity === "error" && c.message.includes("key_down_order")),
  );
});

test("karabiner.ts's 200ms duoLayer default is an error", () => {
  const found = findConflicts([layer({ threshold: 200 })], homeRowMods);
  assert.ok(
    found.some((c) => c.severity === "error" && c.message.includes("200ms against")),
  );
});

test("two layers sharing a trigger is an error", () => {
  const found = findConflicts(
    [
      layer({ description: "First" }),
      layer({ description: "Second", id: "duo-layer-spacebar-g2" }),
    ],
    homeRowMods,
  );
  assert.ok(
    found.some((c) => c.severity === "error" && c.message.includes("already claimed")),
  );
});

// An unconfigured duoLayer is the shape that made typing unusable: karabiner.ts
// bakes in duo_layer.threshold_milliseconds (200) and emits no key_down_order,
// so the chord matches in either order and withholds every spacebar press.
test("an unconfigured duoLayer is caught", () => {
  const bare = [
    duoLayer("spacebar", "d")
      .description("Bare Navigation")
      .manipulators([map("h").to("left_arrow")]),
  ];

  const [found] = extractLayers(bare);
  assert.ok(found);
  assert.equal(found.threshold, 200);
  assert.equal(found.keyDownOrder, "insensitive");

  const messages = findConflicts([found], homeRowMods)
    .filter((c) => c.severity === "error")
    .map((c) => c.message);
  assert.equal(messages.length, 3);
  assert.ok(messages.some((m) => m.includes("home row mod")));
  assert.ok(messages.some((m) => m.includes("key_down_order")));
  assert.ok(messages.some((m) => m.includes("200ms against")));
});
