#!/usr/bin/env tsx
/**
 * Generates visual documentation for Karabiner keyboard layers
 */

interface KeyMapping {
  key: string;
  output: string;
  description?: string;
}

interface Layer {
  name: string;
  trigger: string;
  mappings: KeyMapping[];
}

// Define keyboard layout for visualization
const KEYBOARD_LAYOUT = {
  row1: ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  row2: ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";"],
  row3: ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  special: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "hyphen", "equal_sign"],
};

// Symbol mapping for display
const SYMBOL_MAP: Record<string, string> = {
  "1|left_shift": "!",
  "2|left_shift": "@",
  "3|left_shift": "#",
  "4|left_shift": "$",
  "5|left_shift": "%",
  "6|left_shift": "^",
  "7|left_shift": "&",
  "8|left_shift": "*",
  "9|left_shift": "(",
  "0|left_shift": ")",
  "open_bracket|left_shift": "{",
  "close_bracket|left_shift": "}",
  "[": "[",
  "]": "]",
  "comma|left_shift": "<",
  "period|left_shift": ">",
  "hyphen|left_shift": "_",
  "equal_sign|left_shift": "+",
  hyphen: "-",
  equal_sign: "=",
};

function getSymbol(output: string, modifiers: string[] = []): string {
  const key = modifiers.length > 0 ? `${output}|${modifiers[0]}` : output;
  return SYMBOL_MAP[key] || output;
}

function generateKeyboardRow(keys: string[], mappings: Map<string, string>): string {
  const keyStrings = keys.map((key) => {
    const output = mappings.get(key) || key;
    const displayKey = key.length === 1 ? key.toUpperCase() : key.substring(0, 3);
    const displayOutput = output.length <= 3 ? output : output.substring(0, 3);

    if (output === key) {
      return `[${displayKey.padEnd(7)}]`;
    }
    return `[${displayKey}→${displayOutput.padEnd(3)}]`;
  });

  return `  ${keyStrings.join(" ")}`;
}

function generateLayerVisualization(layer: Layer): string {
  let output = `## ${layer.name}\n\n`;
  output += `**Trigger:** ${layer.trigger}\n\n`;

  // Create mapping lookup
  const mappingLookup = new Map<string, string>();
  for (const mapping of layer.mappings) {
    mappingLookup.set(mapping.key, mapping.output);
  }

  output += "```\n";
  output += generateKeyboardRow(KEYBOARD_LAYOUT.row1, mappingLookup) + "\n";
  output += generateKeyboardRow(KEYBOARD_LAYOUT.row2, mappingLookup) + "\n";
  output += generateKeyboardRow(KEYBOARD_LAYOUT.row3, mappingLookup) + "\n";
  output += "```\n\n";

  // Add mapping table
  if (layer.mappings.length > 0) {
    output += "| Key | Output | Description |\n";
    output += "|-----|--------|-------------|\n";
    for (const mapping of layer.mappings) {
      const keyDisplay = mapping.key.toUpperCase();
      const desc = mapping.description || "";
      output += `| ${keyDisplay} | ${mapping.output} | ${desc} |\n`;
    }
    output += "\n";
  }

  return output;
}

function generateHomeRowModsDoc(): string {
  let output = `## Home Row Mods (GACS Layout)\n\n`;
  output += `**Trigger:** Hold home row keys\n\n`;
  output += `Home Row Mods allow you to use home row keys as modifiers when held, while still functioning as regular keys when tapped.\n\n`;

  output += `### Left Hand\n\n`;
  output += `| Key | Tap | Hold |\n`;
  output += `|-----|-----|------|\n`;
  output += `| A | a | ⌘ Command (GUI) |\n`;
  output += `| S | s | ⌥ Option (Alt) |\n`;
  output += `| D | d | ⌃ Control |\n`;
  output += `| F | f | ⇧ Shift |\n\n`;

  output += `### Right Hand\n\n`;
  output += `| Key | Tap | Hold |\n`;
  output += `|-----|-----|------|\n`;
  output += `| J | j | ⇧ Shift |\n`;
  output += `| K | k | ⌃ Control |\n`;
  output += `| L | l | ⌥ Option (Alt) |\n`;
  output += `| ; | ; | ⌘ Command (GUI) |\n\n`;

  output += `### Timing Configuration\n\n`;
  output += `- **to_if_alone_timeout**: 300ms (default 1000ms)\n`;
  output += `- **to_if_held_down_threshold**: 200ms (default 500ms)\n`;
  output += `- **to_delayed_action_delay**: 200ms (default 500ms)\n`;
  output += `- **simultaneous_threshold**: 45ms (default 50ms)\n\n`;

  return output;
}

function generateCapsLockDoc(): string {
  let output = `## Caps Lock / Escape\n\n`;
  output += `**Trigger:** Physical Caps Lock key\n\n`;
  output += `- **Tap Caps Lock:** Escape\n`;
  output += `- **Hold Both Shifts:** Toggle Caps Lock\n`;
  output += `- **CAPS + Hold F or J:** Temporary lowercase (Shift inverts CAPS)\n\n`;

  return output;
}

// Main documentation generation
function generateDocs(): string {
  let doc = `# Karabiner Configuration - Keyboard Layers\n\n`;
  doc += `This document provides a visual reference for all keyboard layers and mappings.\n\n`;
  doc += `---\n\n`;

  // Add Caps Lock / Escape
  doc += generateCapsLockDoc();

  // Add Home Row Mods
  doc += generateHomeRowModsDoc();

  // Add Active Productivity Layers
  doc += `---\n\n`;
  doc += `## Active Layers\n\n`;
  doc += `The following layers are currently active and ready to use. All use dual-key triggers to avoid accidental activation.\n\n`;

  // Navigation Layer
  const navigationLayer: Layer = {
    name: "Navigation Layer (Vim-style)",
    trigger: "Hold Spacebar + D simultaneously",
    mappings: [
      { key: "h", output: "←", description: "Move left" },
      { key: "j", output: "↓", description: "Move down" },
      { key: "k", output: "↑", description: "Move up" },
      { key: "l", output: "→", description: "Move right" },
      { key: "u", output: "PgUp", description: "Page up" },
      { key: "i", output: "PgDn", description: "Page down" },
      { key: "n", output: "Home", description: "Start of line" },
      { key: "m", output: "End", description: "End of line" },
      { key: "y", output: "⌥←", description: "Previous word" },
      { key: "o", output: "⌥→", description: "Next word" },
      { key: "x", output: "Del", description: "Delete forward" },
      { key: ";", output: "⇧→", description: "Select right" },
      { key: "a", output: "⇧←", description: "Select left" },
    ],
  };
  doc += generateLayerVisualization(navigationLayer);
  doc += `> **💡 TIP:** This is the most useful layer for reducing hand movement! Practice HJKL navigation in your editor.\n\n`;

  // Function Keys Layer
  const functionKeysLayer: Layer = {
    name: "Function Keys Layer",
    trigger: "Hold Spacebar + F simultaneously",
    mappings: [
      { key: "1", output: "F1" },
      { key: "2", output: "F2" },
      { key: "3", output: "F3" },
      { key: "4", output: "F4" },
      { key: "5", output: "F5" },
      { key: "6", output: "F6" },
      { key: "7", output: "F7" },
      { key: "8", output: "F8" },
      { key: "9", output: "F9" },
      { key: "0", output: "F10" },
      { key: "hyphen", output: "F11" },
      { key: "equal_sign", output: "F12" },
      { key: "r", output: "F5", description: "Quick refresh" },
      { key: "d", output: "F12", description: "Quick dev tools" },
    ],
  };
  doc += generateLayerVisualization(functionKeysLayer);
  doc += `> **💡 TIP:** Great for debugging (F8: step over, F9: breakpoint, F10: step into)\n\n`;

  // Media Controls Layer
  const mediaLayer: Layer = {
    name: "Media & System Control Layer",
    trigger: "Hold Spacebar + M simultaneously",
    mappings: [
      { key: "h", output: "🔉", description: "Volume down" },
      { key: "l", output: "🔊", description: "Volume up" },
      { key: "j", output: "🔇", description: "Mute" },
      { key: "u", output: "🔅", description: "Brightness down" },
      { key: "o", output: "🔆", description: "Brightness up" },
      { key: "n", output: "⏮", description: "Previous track" },
      { key: ",", output: "⏯", description: "Play/Pause" },
      { key: ".", output: "⏭", description: "Next track" },
      { key: "k", output: "Mission", description: "Mission Control" },
      { key: "i", output: "Launchpad", description: "Launchpad" },
      { key: "q", output: "🔒", description: "Lock screen" },
    ],
  };
  doc += generateLayerVisualization(mediaLayer);
  doc += `> **💡 TIP:** Control volume and brightness without leaving the keyboard!\n\n`;

  // Numpad Layer
  const numpadLayer: Layer = {
    name: "Numpad Layer (Right-hand)",
    trigger: "Hold Spacebar + N simultaneously",
    mappings: [
      { key: "u", output: "7" },
      { key: "i", output: "8" },
      { key: "o", output: "9" },
      { key: "j", output: "4" },
      { key: "k", output: "5" },
      { key: "l", output: "6" },
      { key: "m", output: "1" },
      { key: ",", output: "2" },
      { key: ".", output: "3" },
      { key: "h", output: "0" },
      { key: "spacebar", output: "0", description: "Thumb zero" },
      { key: "p", output: "+", description: "Plus" },
      { key: ";", output: "-", description: "Minus" },
      { key: "'", output: "*", description: "Multiply" },
      { key: "/", output: "/", description: "Divide" },
    ],
  };
  doc += generateLayerVisualization(numpadLayer);
  doc += `> **💡 TIP:** Perfect for spreadsheets and data entry on laptops without numpads!\n\n`;

  // Mouse Control Layer (commented)
  doc += `### Mouse Control Layer (Disabled)\n\n`;
  doc += `**Trigger:** Hold Spacebar + C simultaneously\n\n`;
  doc += `This advanced layer provides keyboard-based mouse control. It's disabled by default.\n\n`;
  doc += `To enable: Uncomment the layer in \`my-index.ts\` (around line 241)\n\n`;
  doc += `> **⚠️ WARNING:** Requires "Manipulate pointer" permission in System Preferences > Security & Privacy > Accessibility\n\n`;

  doc += `---\n\n`;

  // Add commented symbol layers as examples
  doc += `## Commented Out / Experimental Layers\n\n`;
  doc += `The following layers are currently disabled but available for experimentation:\n\n`;

  // Symbol Hyper Layer
  const symbolHyperLayer: Layer = {
    name: "Symbol Hyper Layer (Disabled)",
    trigger: "Hold G key (hyperLayer)",
    mappings: [
      { key: "j", output: "(", description: "Left parenthesis" },
      { key: "k", output: ")", description: "Right parenthesis" },
      { key: "u", output: "[", description: "Left square bracket" },
      { key: "i", output: "]", description: "Right square bracket" },
      { key: "m", output: "{", description: "Left curly brace" },
      { key: ",", output: "}", description: "Right curly brace" },
    ],
  };
  doc += generateLayerVisualization(symbolHyperLayer);

  // Symbol Duo Layer
  const symbolDuoLayer: Layer = {
    name: "Symbol Chord Layer (Disabled)",
    trigger: "Hold Spacebar + G simultaneously",
    mappings: [
      { key: "j", output: "(", description: "Left parenthesis" },
      { key: "k", output: ")", description: "Right parenthesis" },
      { key: "u", output: "[", description: "Left square bracket" },
      { key: "i", output: "]", description: "Right square bracket" },
      { key: "h", output: "{", description: "Left curly brace" },
      { key: "l", output: "}", description: "Right curly brace" },
      { key: "n", output: "<", description: "Left angle bracket" },
      { key: "m", output: ">", description: "Right angle bracket" },
      { key: "1", output: "!", description: "Exclamation mark" },
      { key: "2", output: "@", description: "At symbol" },
      { key: "3", output: "#", description: "Hash/pound" },
      { key: "4", output: "$", description: "Dollar sign" },
      { key: "5", output: "%", description: "Percent" },
      { key: "6", output: "^", description: "Caret" },
      { key: "7", output: "&", description: "Ampersand" },
      { key: "8", output: "*", description: "Asterisk" },
      { key: "9", output: "(", description: "Open parenthesis" },
      { key: "0", output: ")", description: "Close parenthesis" },
      { key: "hyphen", output: "_", description: "Underscore" },
      { key: "equal_sign", output: "+", description: "Plus" },
    ],
  };
  doc += generateLayerVisualization(symbolDuoLayer);

  // Numbers Layer
  const numbersLayer: Layer = {
    name: "Numbers Layer (Disabled)",
    trigger: "Hold V + M simultaneously",
    mappings: [
      { key: "h", output: "0" },
      { key: "m", output: "1" },
      { key: ",", output: "2" },
      { key: ".", output: "3" },
      { key: "j", output: "4" },
      { key: "k", output: "5" },
      { key: "l", output: "6" },
      { key: "u", output: "7" },
      { key: "i", output: "8" },
      { key: "o", output: "9" },
    ],
  };
  doc += generateLayerVisualization(numbersLayer);

  doc += `---\n\n`;
  doc += `*Generated automatically by generate-docs.ts*\n`;

  return doc;
}

// Generate and write documentation
const documentation = generateDocs();
console.log(documentation);
