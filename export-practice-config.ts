#!/usr/bin/env tsx

/**
 * Export practice configuration from Karabiner setup
 * Generates:
 * - practice-config.json (for use by training tools)
 * - monkeytype-wordlists/ (custom wordlists for MonkeyType)
 */

import fs from "node:fs";
import path from "node:path";

// HRM Configuration from my-index.ts
const HRM_CONFIG = {
  left: {
    a: "gui",
    s: "alt",
    d: "ctrl",
    f: "shift",
  },
  right: {
    j: "shift",
    k: "ctrl",
    l: "alt",
    ";": "gui",
  },
} as const;

// Symbol layers (from commented code in my-index.ts)
const SYMBOL_LAYERS = {
  hyper_g: {
    activator: "g",
    mode: "sticky",
    mappings: {
      j: "(",
      k: ")",
      u: "[",
      i: "]",
      m: "{",
      ",": "}",
    },
  },
  duo_space_g: {
    activator: ["spacebar", "g"],
    mode: "chord",
    mappings: {
      j: "(",
      k: ")",
      u: "[",
      i: "]",
      h: "{",
      l: "}",
      n: "<",
      m: ">",
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
      "-": "_",
      "=": "+",
    },
  },
  numbers_v_m: {
    activator: ["v", "m"],
    mode: "chord",
    mappings: {
      h: "0",
      m: "1",
      ",": "2",
      ".": "3",
      j: "4",
      k: "5",
      l: "6",
      u: "7",
      i: "8",
      o: "9",
    },
  },
} as const;

// Timing configuration from my-index.ts
const TIMING_CONFIG = {
  to_if_alone_timeout_milliseconds: 300,
  to_if_held_down_threshold_milliseconds: 200,
  to_delayed_action_delay_milliseconds: 200,
  simultaneous_threshold_milliseconds: 45,
} as const;

interface PracticeConfig {
  version: string;
  homeRowMods: typeof HRM_CONFIG;
  symbolLayers: typeof SYMBOL_LAYERS;
  timing: typeof TIMING_CONFIG;
  metadata: {
    generated: string;
    source: string;
    description: string;
  };
}

/**
 * Generate practice configuration JSON
 */
function generatePracticeConfig(): PracticeConfig {
  return {
    version: "1.0.0",
    homeRowMods: HRM_CONFIG,
    symbolLayers: SYMBOL_LAYERS,
    timing: TIMING_CONFIG,
    metadata: {
      generated: new Date().toISOString(),
      source: "my-index.ts",
      description: "HRM (GACS) + Symbol Layers configuration for typing practice",
    },
  };
}

/**
 * Generate MonkeyType custom wordlist
 */
interface WordlistOptions {
  name: string;
  description: string;
  words: string[];
}

function generateMonkeyTypeWordlist(options: WordlistOptions): string {
  return JSON.stringify(
    {
      name: options.name,
      groups: [
        [0, 100], // All words have equal weight
      ],
      words: options.words,
    },
    null,
    2,
  );
}

/**
 * Get all HRM keys
 */
function getHRMKeys(): string[] {
  return [
    ...Object.keys(HRM_CONFIG.left),
    ...Object.keys(HRM_CONFIG.right).map((k) => (k === ";" ? ";" : k)),
  ];
}

/**
 * Check if word contains consecutive HRM keys (high conflict risk)
 */
function hasConsecutiveHRMKeys(word: string): boolean {
  const hrmKeys = new Set(getHRMKeys());
  for (let i = 0; i < word.length - 1; i++) {
    if (hrmKeys.has(word[i]) && hrmKeys.has(word[i + 1])) {
      return true;
    }
  }
  return false;
}

/**
 * Count HRM keys in word
 */
function countHRMKeys(word: string): number {
  const hrmKeys = new Set(getHRMKeys());
  return word.split("").filter((c) => hrmKeys.has(c)).length;
}

/**
 * Generate wordlists for different practice scenarios
 */
function generateWordlists() {
  // Common English words for filtering
  const commonWords = [
    // HRM-heavy words (good for practice)
    "ask",
    "flask",
    "fall",
    "falls",
    "fast",
    "last",
    "ласт",
    "safe",
    "salad",
    "salsa",
    "sad",
    "fads",
    "lads",
    "lass",
    "jazz",
    "jass",
    "jail",
    "jell",
    "ask",
    "asks",
    "flask",
    "flasks",
    "glad",
    "gals",
    "kale",
    "lake",
    "sake",
    "shake",
    "sleds",
    "slacks",
    "slash",
    "jaded",
    "faked",
    "asked",
    "Alaska",
    // Minimal HRM (good for avoiding conflicts)
    "the",
    "and",
    "for",
    "are",
    "but",
    "not",
    "you",
    "with",
    "have",
    "this",
    "that",
    "from",
    "they",
    "been",
    "have",
    "their",
    "would",
    "there",
    "could",
    "other",
    "which",
    "about",
    "these",
    "time",
    "very",
    "when",
    "come",
    "here",
    "just",
    "know",
    "take",
    "them",
    "see",
    "him",
    "two",
    "more",
    "write",
    "go",
    "way",
    "been",
    "who",
    "did",
    "many",
    "number",
    "code",
    "word",
    "made",
    "idea",
    "free",
    "after",
    "jump",
    "july",
    "june",
    "debug",
    "merge",
    "query",
    "remove",
    "update",
    "create",
    "delete",
    "verify",
    "oxygen",
    "python",
    "memory",
    "vector",
    "byte",
    "crypto",
    "proxy",
    "review",
  ];

  // 1. HRM-Heavy Practice (high conflict words)
  const hrmHeavy = commonWords
    .filter((w) => countHRMKeys(w) >= 3 || hasConsecutiveHRMKeys(w))
    .sort((a, b) => countHRMKeys(b) - countHRMKeys(a))
    .slice(0, 100);

  // 2. HRM-Light Practice (minimal conflicts)
  const hrmLight = commonWords
    .filter((w) => countHRMKeys(w) <= 2 && !hasConsecutiveHRMKeys(w))
    .slice(0, 100);

  // 3. Consecutive HRM Practice (most challenging)
  const hrmConsecutive = commonWords
    .filter((w) => hasConsecutiveHRMKeys(w))
    .slice(0, 50);

  // 4. Symbol practice (Python/code snippets)
  const symbolPractice = [
    "def func(args):",
    "array[index]",
    "obj['key']",
    "{x: 1, y: 2}",
    "if (condition) {",
    "for item in list:",
    "lambda x: x + 1",
    "dict[key] = value",
    "tuple = (1, 2, 3)",
    "set = {1, 2, 3}",
    "fn(a, b, c)",
    "class Name:",
    "return [x, y]",
    "import {module}",
    "const obj = {};",
    "(async () => {})",
    "arr.map((x) => x)",
    "obj?.property",
    "spread = [...arr]",
    "destructure = {a, b}",
  ];

  return {
    hrmHeavy: {
      name: "HRM Heavy",
      description: "Words with many home row mod keys - practice quick taps",
      words: hrmHeavy,
    },
    hrmLight: {
      name: "HRM Light",
      description: "Words with few HRM keys - safe practice",
      words: hrmLight,
    },
    hrmConsecutive: {
      name: "HRM Consecutive",
      description: "Words with consecutive HRM keys - most challenging",
      words: hrmConsecutive,
    },
    symbolPractice: {
      name: "Symbol Layer Practice",
      description: "Code snippets for practicing symbol layers",
      words: symbolPractice,
    },
  };
}

/**
 * Generate common HRM shortcuts for practice
 */
function generateShortcutsList() {
  return {
    name: "HRM Shortcuts",
    description: "Common keyboard shortcuts using Home Row Mods",
    shortcuts: [
      { keys: ["gui", "c"], description: "Copy", hrm: "semicolon+c or a+c" },
      { keys: ["gui", "v"], description: "Paste", hrm: "semicolon+v or a+v" },
      { keys: ["gui", "x"], description: "Cut", hrm: "semicolon+x or a+x" },
      { keys: ["gui", "z"], description: "Undo", hrm: "semicolon+z or a+z" },
      { keys: ["gui", "shift", "z"], description: "Redo", hrm: "semicolon+f+z" },
      { keys: ["gui", "s"], description: "Save", hrm: "semicolon+s (conflict!)" },
      { keys: ["ctrl", "c"], description: "Cancel", hrm: "d+c or k+c" },
      { keys: ["alt", "tab"], description: "Switch app", hrm: "s+tab or l+tab" },
    ],
  };
}

/**
 * Main export function
 */
function main() {
  const outputDir = path.join(__dirname, "practice-output");
  const monkeyTypeDir = path.join(outputDir, "monkeytype-wordlists");

  // Create output directories
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(monkeyTypeDir, { recursive: true });

  console.log("🎹 Generating practice configuration...\n");

  // 1. Generate practice-config.json
  const practiceConfig = generatePracticeConfig();
  const configPath = path.join(outputDir, "practice-config.json");
  fs.writeFileSync(configPath, JSON.stringify(practiceConfig, null, 2));
  console.log(`✅ Generated practice-config.json`);
  console.log(`   Location: ${configPath}`);
  console.log(`   HRM Keys: ${getHRMKeys().join(", ")}`);
  console.log(`   Timing threshold: ${TIMING_CONFIG.to_if_held_down_threshold_milliseconds}ms\n`);

  // 2. Generate MonkeyType wordlists
  const wordlists = generateWordlists();

  for (const [key, list] of Object.entries(wordlists)) {
    const filename = `${key.replace(/([A-Z])/g, "-$1").toLowerCase()}.json`;
    const filepath = path.join(monkeyTypeDir, filename);
    fs.writeFileSync(filepath, generateMonkeyTypeWordlist(list));
    console.log(`✅ Generated ${list.name} (${list.words.length} words)`);
    console.log(`   Location: ${filepath}`);
  }

  // 3. Generate shortcuts reference
  const shortcuts = generateShortcutsList();
  const shortcutsPath = path.join(outputDir, "hrm-shortcuts.json");
  fs.writeFileSync(shortcutsPath, JSON.stringify(shortcuts, null, 2));
  console.log(`\n✅ Generated HRM shortcuts reference`);
  console.log(`   Location: ${shortcutsPath}`);

  // 4. Generate README
  const readme = `# Typing Practice Configuration

Generated from karabiner-actions configuration on ${new Date().toISOString()}

## Files

### practice-config.json
Complete configuration for HRM training tools. Contains:
- Home Row Mods layout (GACS)
- Symbol layer mappings
- Timing thresholds
- Metadata

### MonkeyType Wordlists

Import these into MonkeyType for targeted practice:

1. **hrm-heavy.json** - Words with many HRM keys (${wordlists.hrmHeavy.words.length} words)
   - Focus: Quick, light taps to avoid modifier activation
   - Examples: ${wordlists.hrmHeavy.words.slice(0, 5).join(", ")}

2. **hrm-light.json** - Words with few HRM keys (${wordlists.hrmLight.words.length} words)
   - Focus: Safe practice without HRM conflicts
   - Examples: ${wordlists.hrmLight.words.slice(0, 5).join(", ")}

3. **hrm-consecutive.json** - Words with consecutive HRM keys (${wordlists.hrmConsecutive.words.length} words)
   - Focus: Most challenging - consecutive home row keys
   - Examples: ${wordlists.hrmConsecutive.words.slice(0, 5).join(", ")}

4. **symbol-practice.json** - Code snippets for symbol layer practice (${wordlists.symbolPractice.words.length} items)
   - Focus: Practice symbol layers with real code patterns
   - Examples: ${wordlists.symbolPractice.words.slice(0, 3).join(", ")}

## How to Use with MonkeyType

1. Go to https://monkeytype.com
2. Click settings (gear icon)
3. Scroll to "Custom" section
4. Click "Import" and upload the JSON files from monkeytype-wordlists/
5. Select the custom wordlist in the test mode dropdown

## HRM Configuration Summary

**Home Row Mods (GACS):**
- Left hand: A (GUI), S (Alt), D (Ctrl), F (Shift)
- Right hand: J (Shift), K (Ctrl), L (Alt), ; (GUI)

**Timing:**
- Tap threshold: ${TIMING_CONFIG.to_if_held_down_threshold_milliseconds}ms (hold longer = modifier)
- Alone timeout: ${TIMING_CONFIG.to_if_alone_timeout_milliseconds}ms
- Target: <${TIMING_CONFIG.to_if_held_down_threshold_milliseconds * 0.9}ms for safe taps

**Symbol Layers (experimental):**
- Hyper G: Sticky leader mode
- Duo Space+G: Chord activation
- Numbers V+M: Homerow numpad

See practice-config.json for complete details.
`;

  const readmePath = path.join(outputDir, "README.md");
  fs.writeFileSync(readmePath, readme);
  console.log(`\n✅ Generated README.md`);
  console.log(`   Location: ${readmePath}`);

  console.log("\n🎉 Done! Practice configuration exported to:", outputDir);
  console.log("\n📝 Next steps:");
  console.log("   1. Import wordlists into MonkeyType");
  console.log("   2. Use practice-config.json with the Go training tool");
  console.log("   3. Practice HRM-heavy words to build muscle memory");
}

main();
