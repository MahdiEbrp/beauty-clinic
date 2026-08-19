#!/usr/bin/env node
/**
 * Fails when any .ts/.tsx file exceeds MAX_LINES lines.
 * Keeps the codebase readable and each module focused.
 *
 * Usage: node scripts/check-file-lengths.mjs [--max 300]
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const maxArg = process.argv.indexOf("--max");
const MAX_LINES =
  maxArg !== -1 && process.argv[maxArg + 1]
    ? Number(process.argv[maxArg + 1])
    : 300;

const EXCLUDED = new Set([
  "node_modules",
  ".next",
  "dist",
  ".git",
  "coverage",
]);

function collectTsFiles(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (EXCLUDED.has(entry)) continue;
    const stats = statSync(full);
    if (stats.isDirectory()) {
      collectTsFiles(full, files);
    } else if (/\.(ts|tsx)$/.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

const files = collectTsFiles(root);
const violations = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n").length;
  if (lines > MAX_LINES) {
    violations.push({ file: relative(root, file), lines });
  }
}

if (violations.length > 0) {
  console.error(
    `Found ${violations.length} file(s) with more than ${MAX_LINES} lines:`,
  );
  for (const { file, lines } of violations.sort((a, b) => b.lines - a.lines)) {
    console.error(`  ${lines} lines  ${file}`);
  }
  console.error(
    "\nPlease split oversized files into smaller, focused modules.",
  );
  process.exit(1);
}

console.log(`OK: all .ts/.tsx files are at most ${MAX_LINES} lines.`);
