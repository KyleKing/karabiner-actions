import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { parameters } from "./config.ts";
import { BROWSER_CODE_TO_KEY, KEYBOARD_LAYOUT } from "./keyboard-layout.ts";
import {
  type Conflict,
  extractHomeRowMods,
  extractLayers,
  findConflicts,
} from "./layers.ts";

const OUT = "docs/keyboard.html";

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

function renderUsage(layers: ReturnType<typeof extractLayers>): string {
  const rows = layers
    .map((l) => {
      const chord = l.triggerKeys
        .map((k) => (k === "spacebar" ? "␣" : k.toUpperCase()))
        .join(" → ");
      return `<tr><td><kbd>${escapeHtml(chord)}</kbd></td><td>${escapeHtml(l.description)}</td></tr>`;
    })
    .join("");
  return `<table class="usage">
    <thead><tr><th>Chord</th><th>Layer</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
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
    `<button class="tab active" data-layer="base">Base</button>`,
    ...layers.map(
      (l) =>
        `<button class="tab" data-layer="${l.id}">${escapeHtml(l.description)}<span class="chord">${l.triggerKeys.map((k) => (k === "spacebar" ? "␣" : k.toUpperCase())).join(" → ")}</span></button>`,
    ),
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
  .usage { border-collapse: collapse; margin: .5rem 0 1.5rem; font-size: .85rem; }
  .usage th, .usage td { text-align: left; padding: .3rem .9rem .3rem 0; border-bottom: 1px solid var(--line); }
  .usage th { color: var(--muted); font-weight: 600; }
  kbd { font: inherit; font-family: ui-monospace, SFMono-Regular, monospace; font-size: .85em;
        border: 1px solid var(--line); border-bottom-width: 2px; border-radius: 4px; padding: 0 .3em; }
</style>
<div class="wrap">
  <h1>Karabiner Layers</h1>
  <p class="sub">Generated from <code>config.ts</code>. Every layer opens on spacebar first, then the trigger key, within ${profileThreshold}ms. Hold both keys down together; releasing the trigger key ends the layer.</p>
  ${renderConflicts(conflicts)}
  ${renderUsage(layers)}
  <div class="tabs" id="tabs">${tabs}</div>
  <div class="board">${renderKeyboard()}</div>
  <p class="hint">Click a tab to pin a layer, or hold the real chord (<kbd>␣</kbd> then the trigger key) to preview it. Home row mods stay badged in the top-right of each key on every layer.</p>
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
  if (spaceAt === -1) return null;
  for (const layer of DATA.layers) {
    const [first, ...rest] = layer.triggerKeys;
    if (first !== "spacebar") continue;
    const positions = rest.map((k) => order.indexOf(k));
    if (positions.every((i) => i > spaceAt)) return layer.id;
  }
  return null;
}

addEventListener("keydown", (event) => {
  const key = keyOf(event);
  if (!key) return;
  if (key === "spacebar") event.preventDefault();
  held.add(key);
  cells.get(key)?.classList.add("live");
  const next = chordLayer();
  if (next && next !== preview) {
    preview = next;
    paint(preview);
  }
});

addEventListener("keyup", (event) => {
  const key = keyOf(event);
  if (!key) return;
  held.delete(key);
  cells.get(key)?.classList.remove("live");
  if (preview && !chordLayer()) {
    preview = null;
    paint(pinned);
  }
});

addEventListener("blur", () => {
  held.clear();
  for (const el of cells.values()) el.classList.remove("live");
  preview = null;
  paint(pinned);
});

paint(pinned);
</script>
`;
}

const html = buildPage();
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`Wrote ${OUT}`);
