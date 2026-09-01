import { readFileSync } from "fs";
import { execSync } from "child_process";

// Load translation files
const en = JSON.parse(readFileSync("messages/en.json", "utf-8"));
const fa = JSON.parse(readFileSync("messages/fa.json", "utf-8"));

// Flatten a nested JSON into dot-notation keys
function flattenKeys(obj: Record<string, any>, prefix = ""): Set<string> {
  const keys = new Set<string>();
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      for (const inner of flattenKeys(v, path)) keys.add(inner);
    } else {
      keys.add(path);
    }
  }
  return keys;
}

const enKeys = flattenKeys(en);
const faKeys = flattenKeys(fa);

// Keys in en but not fa, or fa but not en
const inEnNotFa = [...enKeys].filter((k) => !faKeys.has(k));
const inFaNotEn = [...faKeys].filter((k) => !enKeys.has(k));

// Find all t("...") and t('...') calls in the codebase
const rgOutput = execSync(
  `rg -n "t\\([\"']([a-zA-Z][a-zA-Z0-9]*(?:\\.[a-zA-Z][a-zA-Z0-9]*)*)[\"']" --type ts --type js -g '!node_modules' -g '!*.d.ts' -g '!scripts/find-missing-translations.mts'`,
  { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
);

// Also find useTranslations("namespace") to map files to namespaces
const nsOutput = execSync(
  `rg -n "useTranslations\\([\"']([a-zA-Z]+)[\"']\\)" --type ts --type js -g '!node_modules' -g '!*.d.ts'`,
  { encoding: "utf-8", maxBuffer: 10 * 1024 * 1024 }
);

// Build file -> namespace mapping
const fileToNs = new Map<string, string>();
for (const line of nsOutput.split("\n")) {
  const m = line.match(/^([^:]+):\d+:.*useTranslations\(["']([^"']+)["']\)/);
  if (m) {
    fileToNs.set(m[1], m[2]);
  }
}

// Parse all t() calls with their file and line
interface Usage {
  file: string;
  line: number;
  key: string;
  fullMatch: string;
}

const usages: Usage[] = [];
for (const line of rgOutput.split("\n")) {
  // Match: file:line: ...t("key")...
  // Also handle t(`template.${var}`) - skip dynamic keys
  const fileLineMatch = line.match(/^([^:]+):(\d+):/);
  if (!fileLineMatch) continue;
  const [, file, lineNum] = fileLineMatch;

  // Find all t("...") or t('...') calls in the line
  const keyRegex = /t\(["']([a-zA-Z][a-zA-Z0-9]*(?:\.[a-zA-Z][a-zA-Z0-9]*)*)["']\)/g;
  let match;
  while ((match = keyRegex.exec(line)) !== null) {
    usages.push({
      file,
      line: parseInt(lineNum),
      key: match[1],
      fullMatch: match[0],
    });
  }
}

// Resolve keys: if the t() call uses a namespace prefix, strip it to get the relative key
// Then check if the full key (namespace.relative) exists in the JSON
const allKeys = new Set<string>();
const missingKeys: { key: string; fullKey: string; file: string; line: number; missingIn: string[] }[] = [];

for (const usage of usages) {
  const ns = fileToNs.get(usage.file);

  // Determine the full key to look up
  let fullKey: string;
  if (ns) {
    // If the key already starts with the namespace, use as-is
    if (usage.key.startsWith(ns + ".")) {
      fullKey = usage.key;
    } else {
      fullKey = `${ns}.${usage.key}`;
    }
  } else {
    fullKey = usage.key;
  }

  allKeys.add(fullKey);

  const inEn = enKeys.has(fullKey);
  const inFa = faKeys.has(fullKey);

  if (!inEn || !inFa) {
    const missingIn: string[] = [];
    if (!inEn) missingIn.push("en");
    if (!inFa) missingIn.push("fa");
    missingKeys.push({ key: usage.key, fullKey, file: usage.file, line: usage.line, missingIn });
  }
}

// Report
console.log("=== TRANSLATION KEY AUDIT ===\n");
console.log(`Total unique keys in code: ${allKeys.size}`);
console.log(`Total keys in en.json: ${enKeys.size}`);
console.log(`Total keys in fa.json: ${faKeys.size}`);
console.log(`Keys in en.json but not fa.json: ${inEnNotFa.length}`);
console.log(`Keys in fa.json but not en.json: ${inFaNotEn.length}`);
console.log(`Keys used in code but missing from JSON: ${missingKeys.length}\n`);

if (inEnNotFa.length > 0) {
  console.log("--- Keys in en.json but NOT in fa.json ---");
  for (const k of inEnNotFa) console.log(`  ${k}`);
  console.log();
}

if (inFaNotEn.length > 0) {
  console.log("--- Keys in fa.json but NOT in en.json ---");
  for (const k of inFaNotEn) console.log(`  ${k}`);
  console.log();
}

if (missingKeys.length > 0) {
  console.log("--- Keys used in code but MISSING from JSON files ---");
  // Group by fullKey for cleaner output
  const grouped = new Map<string, typeof missingKeys>();
  for (const m of missingKeys) {
    const existing = grouped.get(m.fullKey) || [];
    existing.push(m);
    grouped.set(m.fullKey, existing);
  }

  // Sort by key
  const sorted = [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  for (const [fullKey, entries] of sorted) {
    const missingIn = entries[0].missingIn.join(" and ");
    console.log(`  ${fullKey}  [missing from: ${missingIn}]`);
    for (const e of entries) {
      console.log(`    -> ${e.file}:${e.line}`);
    }
  }
}
