import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parameters } from "./config.ts";
import { BROWSER_CODE_TO_KEY, KEYBOARD_LAYOUT } from "./keyboard-layout.ts";
import {
  type Conflict,
  extractHomeRowMods,
  extractLayers,
  findConflicts,
  type Layer,
} from "./layers.ts";

const OUT = "docs/keyboard.html";

// Real words picked to maximize the chance of exposing a false trigger:
// chord layers key off the last letter (a word starting with it, after a
// space, is the exact risk case layers.ts's own conflict checker flags), and
// the mod-tap layer keys off a letter immediately followed by one of its
// mapped action keys (the exact rollover scenario .delay() guards against).
const CHORD_RISK_WORDS: Record<string, string[]> = {
  g: ["give", "get"],
  n: ["next", "note"],
  v: ["very", "voice"],
};
const MOD_TAP_RISK_WORDS: Record<string, string[]> = {
  m: ["much", "moment"],
};

function riskWords(layer: Layer): string[] {
  return layer.kind === "chord"
    ? (CHORD_RISK_WORDS[layer.triggerKeys.at(-1) ?? ""] ?? [])
    : (MOD_TAP_RISK_WORDS[layer.triggerKeys[0] ?? ""] ?? []);
}

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c] as string,
  );

function renderConflicts(conflicts: Conflict[]): string {
  const errors = conflicts.filter((c) => c.severity === "error");
  if (conflicts.length === 0) {
    return `<div class="banner ok">No conflicts detected.</div>`;
  }
  const items = conflicts
    .map(
      (c) =>
        `<li class="${c.severity}"><strong>${escapeHtml(c.layer)}</strong>${escapeHtml(c.message)}</li>`,
    )
    .join("");
  const heading = errors.length
    ? `${errors.length} conflict${errors.length === 1 ? "" : "s"} that will affect typing`
    : `No conflicts. ${conflicts.length} note${conflicts.length === 1 ? "" : "s"} on rule ordering.`;
  return `<details class="banner ${errors.length ? "bad" : "warn"}" ${errors.length ? "open" : ""}>
      <summary>${escapeHtml(heading)}</summary>
      <ul class="conflicts">${items}</ul>
    </details>`;
}

function renderPractice(layers: Layer[]): string {
  const rows = layers
    .map((l) => {
      const words = riskWords(l);
      if (words.length === 0) return "";
      const target =
        l.kind === "chord"
          ? `gap between ${l.triggerKeys.map((k) => (k === "spacebar" ? "␣" : k.toUpperCase())).join(" and ")} &le; ${l.threshold}ms`
          : `hold ${l.triggerKeys[0]?.toUpperCase()} &ge; ${l.threshold}ms`;
      const inputs = words
        .map((w) => {
          const label = l.kind === "chord" ? `␣ then ${w}` : w;
          return `<span class="test-row">
            <span class="test-word">${label}</span>
            <input class="test-input" type="text" data-word="${w}" data-layer="${l.id}" data-kind="${l.kind}" data-threshold="${l.threshold}" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
            <span class="test-status"></span>
          </span>`;
        })
        .join("");
      const holdBar =
        l.kind === "modTap"
          ? `<div class="hold-bar-wrap">
              <label class="hold-toggle"><input type="checkbox" class="hold-toggle-input" checked> show target zone while holding (always shown after release)</label>
              <div class="hold-bar" data-layer="${l.id}">
                <div class="hold-zone"></div>
                <div class="hold-fill"></div>
              </div>
              <span class="hold-result"></span>
            </div>`
          : "";
      return `<div class="practice-row">
        <div class="practice-head">
          <strong>${escapeHtml(l.description)}</strong>
          <span class="practice-target">${target}</span>
          <span class="practice-readout" data-layer="${l.id}"></span>
        </div>
        ${holdBar}
        <div class="practice-words">${inputs}</div>
      </div>`;
    })
    .join("");
  if (!rows) return "";
  return `<section class="practice">
    <h2>Timing practice</h2>
    <p class="hint">Type each word at normal speed, not deliberately slow. For a chord layer, press Space right before it, same as in real prose. A mismatch below means this layer misfired mid-word (or the chord didn't land), not a typo.</p>
    ${rows}
  </section>`;
}

function renderKeyboard(): string {
  const rows = KEYBOARD_LAYOUT.map((row) => {
    const caps = row
      .map((cap) => {
        const style = cap.width ? ` style="flex:${cap.width}"` : "";
        return `<div class="key" data-code="${cap.code}"${style}>
          <span class="legend">${escapeHtml(cap.label)}</span>
          <span class="mod"></span>
          <span class="out"></span>
        </div>`;
      })
      .join("");
    return `<div class="row">${caps}</div>`;
  }).join("");
  return `<div class="keyboard" id="keyboard">${rows}</div>`;
}

function buildPage(): string {
  const layers = extractLayers();
  const homeRowMods = extractHomeRowMods();
  const conflicts = findConflicts(layers, homeRowMods);
  const profileThreshold = parameters["basic.simultaneous_threshold_milliseconds"];

  const data = {
    layers,
    homeRowMods,
    browserCodes: BROWSER_CODE_TO_KEY,
  };

  const tabs = [
    `<button type="button" class="tab active" data-layer="base">Base</button>`,
    ...layers.map((l) => {
      const chord =
        l.kind === "chord"
          ? l.triggerKeys
              .map((k) => (k === "spacebar" ? "␣" : k.toUpperCase()))
              .join(" → ")
          : `hold ${l.triggerKeys[0]?.toUpperCase()}`;
      return `<button type="button" class="tab" data-layer="${l.id}">${escapeHtml(l.description)}<span class="chord">${chord}</span></button>`;
    }),
  ].join("");

  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Karabiner Layers</title>
<style>
  :root {
    color-scheme: light dark;
    --bg: #fbfbfd; --panel: #fff; --ink: #1c1c1f; --muted: #6b6b76;
    --line: #dcdce4; --cap: #f4f4f8; --accent: #3b5bdb; --accent-ink: #fff;
    --ok: #2b8a3e; --warn: #b45309; --bad: #c92a2a; --out: #1864ab;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #131317; --panel: #1b1b21; --ink: #ececf0; --muted: #9a9aa8;
      --line: #33333f; --cap: #24242c; --accent: #748ffc; --accent-ink: #131317;
      --ok: #69db7c; --warn: #fcc419; --bad: #ff8787; --out: #74c0fc;
    }
  }
  :root[data-theme="light"] {
    --bg: #fbfbfd; --panel: #fff; --ink: #1c1c1f; --muted: #6b6b76;
    --line: #dcdce4; --cap: #f4f4f8; --accent: #3b5bdb; --accent-ink: #fff;
    --ok: #2b8a3e; --warn: #b45309; --bad: #c92a2a; --out: #1864ab;
  }
  :root[data-theme="dark"] {
    --bg: #131317; --panel: #1b1b21; --ink: #ececf0; --muted: #9a9aa8;
    --line: #33333f; --cap: #24242c; --accent: #748ffc; --accent-ink: #131317;
    --ok: #69db7c; --warn: #fcc419; --bad: #ff8787; --out: #74c0fc;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 2rem 1.25rem 4rem; background: var(--bg); color: var(--ink);
    font: 15px/1.55 ui-sans-serif, -apple-system, "SF Pro Text", system-ui, sans-serif;
  }
  .wrap { max-width: 1080px; margin: 0 auto; }
  h1 { font-size: 1.5rem; margin: 0 0 .25rem; letter-spacing: -.01em; }
  .sub { color: var(--muted); margin: 0 0 1.5rem; }
  .banner { border: 1px solid var(--line); border-radius: 10px; padding: .7rem .9rem; margin-bottom: 1.5rem; background: var(--panel); }
  .banner.ok { color: var(--ok); border-color: color-mix(in srgb, var(--ok) 40%, var(--line)); }
  .banner.warn summary { color: var(--ok); }
  .banner.bad summary { color: var(--bad); }
  .banner summary { cursor: pointer; font-weight: 600; }
  .conflicts { margin: .75rem 0 0; padding-left: 1.1rem; }
  .conflicts li { margin-bottom: .5rem; color: var(--muted); }
  .conflicts li strong { display: block; color: var(--ink); font-weight: 600; }
  .conflicts li.error strong::after { content: " · error"; color: var(--bad); font-weight: 500; }
  .conflicts li.warning strong::after { content: " · note"; color: var(--warn); font-weight: 500; }
  .tabs { display: flex; flex-wrap: wrap; gap: .4rem; margin-bottom: 1.1rem; }
  .tab {
    font: inherit; font-size: .85rem; cursor: pointer; border: 1px solid var(--line);
    background: var(--panel); color: var(--ink); border-radius: 8px; padding: .4rem .7rem;
    display: flex; flex-direction: column; gap: .1rem; text-align: left; line-height: 1.25;
  }
  .tab .chord { font-size: .72rem; color: var(--muted); font-family: ui-monospace, SFMono-Regular, monospace; }
  .tab.active { background: var(--accent); color: var(--accent-ink); border-color: var(--accent); }
  .tab.active .chord { color: inherit; opacity: .8; }
  .board { overflow-x: auto; }
  .keyboard {
    background: var(--panel); border: 1px solid var(--line); border-radius: 12px;
    padding: .55rem; display: flex; flex-direction: column; gap: .3rem;
    min-width: 720px; max-width: 860px; margin: 0 auto;
  }
  .row { display: flex; gap: .3rem; }
  /* Fixed height, not aspect-ratio: wide caps like the 6.25u spacebar would
     otherwise stretch their whole row. */
  .key {
    flex: 1; position: relative; height: 54px; border: 1px solid var(--line);
    border-radius: 6px; background: var(--cap); display: flex; align-items: center;
    justify-content: center; min-width: 0; overflow: hidden;
  }
  .key .legend { position: absolute; top: 2px; left: 5px; font-size: .7rem; font-weight: 600; color: var(--muted); }
  .key .mod { position: absolute; top: 2px; right: 5px; font-size: .8rem; font-weight: 700; color: var(--accent); }
  .key .out {
    font-size: 1.05rem; font-weight: 700; color: var(--out); text-align: center;
    padding: .5rem .15rem 0; line-height: 1.12; max-width: 100%; overflow: hidden;
  }
  .key .out[data-len="medium"] { font-size: .78rem; }
  .key .out[data-len="long"] { font-size: .6rem; letter-spacing: -.01em; overflow-wrap: anywhere; }
  /* On the base layer the printed letter is the content, so it moves out of the
     corner and into the middle of the cap. */
  .keyboard.base .key .legend {
    position: static; font-size: 1.05rem; font-weight: 600; color: var(--ink);
  }
  .key.mapped { background: color-mix(in srgb, var(--out) 14%, var(--cap)); border-color: color-mix(in srgb, var(--out) 35%, var(--line)); }
  .key.unmapped { opacity: .5; }
  .key.unmapped .legend { color: var(--muted); }
  .key.trigger { background: color-mix(in srgb, var(--accent) 22%, var(--cap)); border-color: var(--accent); }
  .key.trigger .legend { color: var(--accent); }
  .key.live { box-shadow: 0 0 0 2px var(--accent) inset; }
  .hint { color: var(--muted); font-size: .85rem; margin-top: 1rem; }
  .howto { margin: 0 0 1.5rem; padding-left: 1.3rem; }
  .howto li { margin-bottom: .3rem; }
  kbd { font: inherit; font-family: ui-monospace, SFMono-Regular, monospace; font-size: .85em;
        border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 4px; padding: 0 .3em; }
  .practice { margin-top: 2rem; }
  .practice h2 { font-size: 1.05rem; margin: 0 0 .4rem; }
  .practice-row { border: 1px solid var(--line); border-radius: 10px; padding: .6rem .8rem; margin-bottom: .6rem; background: var(--panel); }
  .practice-head { display: flex; flex-wrap: wrap; align-items: baseline; gap: .5rem; margin-bottom: .4rem; }
  .practice-target { color: var(--muted); font-size: .8rem; }
  .practice-readout { font-size: .8rem; font-weight: 600; font-family: ui-monospace, SFMono-Regular, monospace; }
  .practice-readout.ok { color: var(--ok); }
  .practice-readout.bad { color: var(--bad); }
  .practice-words { display: flex; flex-wrap: wrap; gap: .8rem; align-items: center; }
  .test-row { display: inline-flex; align-items: center; gap: .4rem; }
  .test-word { font-family: ui-monospace, SFMono-Regular, monospace; color: var(--muted); }
  .test-input { font: inherit; border: 1px solid var(--line); border-radius: 6px; padding: .2rem .4rem; width: 6rem; background: var(--bg); color: var(--ink); }
  .test-status { font-size: .78rem; }
  .test-status.ok { color: var(--ok); }
  .test-status.bad { color: var(--bad); }
  .hold-bar-wrap { margin-bottom: .6rem; }
  .hold-toggle { display: flex; align-items: center; gap: .35rem; font-size: .78rem; color: var(--muted); margin-bottom: .35rem; cursor: pointer; }
  .hold-bar { position: relative; height: 16px; border-radius: 8px; background: var(--cap); border: 1px solid var(--line); overflow: hidden; }
  .hold-zone { position: absolute; top: 0; bottom: 0; left: 50%; right: 0; background: color-mix(in srgb, var(--ok) 25%, transparent); border-left: 2px dashed color-mix(in srgb, var(--ok) 60%, var(--line)); }
  .hold-bar.zone-hidden .hold-zone { visibility: hidden; }
  .hold-fill { position: absolute; top: 0; bottom: 0; left: 0; width: 0%; background: var(--accent); }
  .hold-fill.in-zone { background: var(--ok); }
  .hold-result { display: block; margin-top: .35rem; font-size: .8rem; font-weight: 600; min-height: 1.1em; }
  .hold-result.ok { color: var(--ok); }
  .hold-result.bad { color: var(--bad); }
</style>
<div class="wrap">
  <h1>Karabiner Layers</h1>
  <p class="sub">Generated from <code>config.ts</code>.</p>
  <p><strong>Chord layers</strong> (Navigation, Numpad, Number &amp; Symbols):</p>
  <ol class="howto">
    <li>Press and <strong>hold</strong> Spacebar.</li>
    <li>Within ${profileThreshold}ms, while still holding Spacebar, press and <strong>hold</strong> the layer's trigger key (e.g. <kbd>G</kbd> for Navigation). The layer stays active only as long as both are held.</li>
    <li>Still holding both, tap a mapped key to run its action, e.g. <kbd>H</kbd> for left arrow.</li>
    <li>Release the trigger key (or Spacebar) to close the layer.</li>
  </ol>
  <p><strong>Mod-tap layers</strong> (Media):</p>
  <ol class="howto">
    <li>Press and <strong>hold</strong> <kbd>M</kbd> alone. No Spacebar needed. Tapping <kbd>M</kbd> quickly still just types "m".</li>
    <li>Once held past the hold threshold, the layer is active for as long as <kbd>M</kbd> stays down.</li>
    <li>Still holding <kbd>M</kbd>, tap a mapped key to run its action, e.g. <kbd>J</kbd> to mute.</li>
    <li>Release <kbd>M</kbd> to close the layer.</li>
  </ol>
  ${renderConflicts(conflicts)}
  <div class="tabs" id="tabs">${tabs}</div>
  <div class="board">${renderKeyboard()}</div>
  <p class="hint">Click a tab to pin a layer, or hold the real chord/key to preview it live: <kbd>␣</kbd> then the trigger key for a chord layer, or just the trigger key alone for a mod-tap layer. Home row mods stay badged in the top-right of each key on every layer.</p>
  ${renderPractice(layers)}
</div>
<script>
const DATA = ${JSON.stringify(data)};
const keyboard = document.getElementById("keyboard");
const tabs = [...document.querySelectorAll(".tab")];
const cells = new Map([...keyboard.querySelectorAll(".key")].map((el) => [el.dataset.code, el]));
const byId = new Map(DATA.layers.map((l) => [l.id, l]));
let pinned = "base";
let preview = null;

function paint(layerId) {
  const layer = byId.get(layerId);
  const outputs = new Map((layer?.mappings ?? []).map((m) => [m.from, m.to]));
  const triggers = new Set(layer?.triggerKeys ?? []);
  for (const [code, el] of cells) {
    const out = outputs.get(code) ?? "";
    const slot = el.querySelector(".out");
    slot.textContent = out;
    slot.dataset.len = out.length <= 2 ? "short" : out.length <= 5 ? "medium" : "long";
    el.querySelector(".mod").textContent = DATA.homeRowMods[code]
      ? { left_command: "⌘", right_command: "⌘", left_control: "⌃", right_control: "⌃",
          left_option: "⌥", right_option: "⌥", left_shift: "⇧", right_shift: "⇧" }[DATA.homeRowMods[code]]
      : "";
    el.classList.toggle("trigger", triggers.has(code));
    el.classList.toggle("mapped", Boolean(out));
    el.classList.toggle("unmapped", Boolean(layer) && !out && !triggers.has(code));
  }
  keyboard.classList.toggle("base", !layer);
  for (const tab of tabs) tab.classList.toggle("active", tab.dataset.layer === layerId);
}

for (const tab of tabs) {
  tab.addEventListener("click", () => {
    pinned = tab.dataset.layer;
    preview = null;
    paint(pinned);
  });
}

const held = new Set();

function keyOf(event) {
  return DATA.browserCodes[event.code]
    ?? (event.code.startsWith("Key") ? event.code.slice(3).toLowerCase() : null)
    ?? (event.code.startsWith("Digit") ? event.code.slice(5) : null);
}

// Spacebar must go down before the trigger key, mirroring key_down_order
// "strict". A Set keeps insertion order, and keyup deletes, so a re-pressed key
// lands at the end where it belongs.
function chordLayer() {
  const order = [...held];
  const spaceAt = order.indexOf("spacebar");
  for (const layer of DATA.layers) {
    if (layer.kind === "modTap") {
      if (held.has(layer.triggerKeys[0])) return layer.id;
      continue;
    }
    if (spaceAt === -1) continue;
    const [first, ...rest] = layer.triggerKeys;
    if (first !== "spacebar") continue;
    const positions = rest.map((k) => order.indexOf(k));
    if (positions.every((i) => i > spaceAt)) return layer.id;
  }
  return null;
}

// Raw physical keydown timestamps, so the practice readouts can show real
// gap/hold durations instead of just whether a layer matched.
const downAt = new Map();

// Every chord gap ever computed, with a timestamp, so the typing test can
// tell "space was just pressed before this word" from "space was pressed a
// while ago for something else."
const chordGapCache = new Map();
const CHORD_GAP_MAX_AGE_MS = 1500;

function practiceReadout(layerId) {
  return document.querySelector('.practice-readout[data-layer="' + layerId + '"]');
}

function holdBarFor(layerId) {
  return document.querySelector('.hold-bar[data-layer="' + layerId + '"]');
}

function updateChordPractice(layer) {
  const [first, ...rest] = layer.triggerKeys;
  const t0 = downAt.get(first);
  const t1 = downAt.get(rest[0]);
  if (t0 === undefined || t1 === undefined || t1 < t0) return;
  const gap = Math.round(t1 - t0);
  chordGapCache.set(layer.id, { gap, at: performance.now() });
  const el = practiceReadout(layer.id);
  if (el) {
    el.textContent = "last gap: " + gap + "ms";
    el.className = "practice-readout " + (gap <= layer.threshold ? "ok" : "bad");
  }
}

function updateModTapPractice(layer) {
  const t0 = downAt.get(layer.triggerKeys[0]);
  if (t0 === undefined) return;
  const heldMs = Math.round(performance.now() - t0);
  const ok = heldMs >= layer.threshold;
  const el = practiceReadout(layer.id);
  if (el) {
    el.textContent = "held: " + heldMs + "ms";
    el.className = "practice-readout " + (ok ? "ok" : "bad");
  }
  const bar = holdBarFor(layer.id);
  if (bar) {
    const pct = Math.min(100, (heldMs / (layer.threshold * 2)) * 100);
    const fill = bar.querySelector(".hold-fill");
    fill.style.width = pct + "%";
    fill.className = "hold-fill " + (ok ? "in-zone" : "");
  }
}

function resetHoldBar(layer) {
  const bar = holdBarFor(layer.id);
  if (!bar) return;
  const wrap = bar.closest(".hold-bar-wrap");
  const checkbox = wrap.querySelector(".hold-toggle-input");
  bar.classList.toggle("zone-hidden", !checkbox.checked);
  const fill = bar.querySelector(".hold-fill");
  fill.style.width = "0%";
  fill.className = "hold-fill";
  const result = wrap.querySelector(".hold-result");
  result.textContent = "";
  result.className = "hold-result";
}

function finalizeHoldBar(layer) {
  const bar = holdBarFor(layer.id);
  if (!bar) return;
  const t0 = downAt.get(layer.triggerKeys[0]);
  if (t0 === undefined) return;
  const heldMs = Math.round(performance.now() - t0);
  const ok = heldMs >= layer.threshold;
  bar.classList.remove("zone-hidden");
  const result = bar.closest(".hold-bar-wrap").querySelector(".hold-result");
  result.textContent = ok
    ? "released after " + heldMs + "ms - inside the zone"
    : "released after " + heldMs + "ms - too early (need " + layer.threshold + "ms+)";
  result.className = "hold-result " + (ok ? "ok" : "bad");
}

for (const wrap of document.querySelectorAll(".hold-bar-wrap")) {
  const checkbox = wrap.querySelector(".hold-toggle-input");
  const bar = wrap.querySelector(".hold-bar");
  checkbox.addEventListener("change", () => {
    bar.classList.toggle("zone-hidden", !checkbox.checked);
  });
}

// Chord gaps are decided at the moment the second key lands, but a mod-tap
// hold has to be shown live while the key is still down, hence the rAF loop.
function tickPractice() {
  for (const layer of DATA.layers) {
    if (layer.kind === "modTap" && held.has(layer.triggerKeys[0])) {
      updateModTapPractice(layer);
    }
  }
  requestAnimationFrame(tickPractice);
}
requestAnimationFrame(tickPractice);

addEventListener("keydown", (event) => {
  const key = keyOf(event);
  if (!key) return;
  if (key === "spacebar") event.preventDefault();
  const alreadyHeld = held.has(key);
  held.add(key);
  if (!downAt.has(key)) downAt.set(key, event.timeStamp);
  cells.get(key)?.classList.add("live");
  const next = chordLayer();
  if (next && next !== preview) {
    preview = next;
    paint(preview);
  }
  for (const layer of DATA.layers) {
    if (layer.kind === "chord") updateChordPractice(layer);
    if (layer.kind === "modTap" && layer.triggerKeys[0] === key && !alreadyHeld) resetHoldBar(layer);
  }
});

addEventListener("keyup", (event) => {
  const key = keyOf(event);
  if (!key) return;
  for (const layer of DATA.layers) {
    if (layer.kind === "modTap" && layer.triggerKeys[0] === key) finalizeHoldBar(layer);
  }
  held.delete(key);
  downAt.delete(key);
  cells.get(key)?.classList.remove("live");
  if (preview && !chordLayer()) {
    preview = null;
    paint(pinned);
  }
});

addEventListener("blur", () => {
  held.clear();
  downAt.clear();
  for (const el of cells.values()) el.classList.remove("live");
  preview = null;
  paint(pinned);
});

for (const input of document.querySelectorAll(".test-input")) {
  const word = input.dataset.word;
  const kind = input.dataset.kind;
  const threshold = Number(input.dataset.threshold);
  const layerId = input.dataset.layer;
  const status = input.nextElementSibling;
  let timer = null;
  let capturedGap = null;

  const finalize = () => {
    const typed = input.value.toLowerCase();
    if (typed.length === 0) {
      status.textContent = "";
      status.className = "test-status";
      return;
    }
    if (typed !== word) {
      status.textContent = 'misfire? typed "' + input.value + '", expected "' + word + '"';
      status.className = "test-status bad";
      return;
    }
    if (kind === "chord") {
      if (capturedGap === null) {
        status.textContent = "no chord detected - press Space right before " + word;
        status.className = "test-status bad";
      } else if (capturedGap > threshold) {
        status.textContent = "chord too slow: gap " + capturedGap + "ms (target ≤ " + threshold + "ms)";
        status.className = "test-status bad";
      } else {
        status.textContent = "ok, gap " + capturedGap + "ms";
        status.className = "test-status ok";
      }
      return;
    }
    status.textContent = "ok, no misfire";
    status.className = "test-status ok";
  };

  input.addEventListener("focus", () => {
    input.value = "";
    capturedGap = null;
    status.textContent = "";
    status.className = "test-status";
  });
  input.addEventListener("input", () => {
    if (kind === "chord" && input.value.length === 1) {
      const cached = chordGapCache.get(layerId);
      capturedGap =
        cached && performance.now() - cached.at < CHORD_GAP_MAX_AGE_MS ? cached.gap : null;
    }
    clearTimeout(timer);
    if (input.value.length >= word.length) finalize();
    else timer = setTimeout(finalize, 900);
  });
  input.addEventListener("blur", finalize);
}

paint(pinned);
</script>
`;
}

const html = buildPage();
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`Wrote ${OUT}`);
