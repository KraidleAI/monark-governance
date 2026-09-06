// scripts/lint-ratchet.mjs — RATCHET for deferred typing debt in the test files.
// ADR-M003 addendum D9 ter §3 (2026-09-06). Lot V DEVOPS, MONARK Phase 2.
//
// D9 ter §3 sets the 6 no-unsafe-*/no-explicit-any rules to `off` on **/*.test.ts and test/**
// (JSON fixtures handled as `any`). Without a guard, this debt could grow silently.
// This ratchet RE-ENABLES these 6 rules AS ERRORS on the tests only (via overrideConfig, applied
// AFTER eslint.config.mjs — so it is the exact inverse of the `off` block), COUNTS the violations, and
// FAILS (exit 1) if the count exceeds the committed ceiling `lint-ratchet.json`.
//
//   - Single source of the 6 rules = lint-ratchet.json `rules` (shared with eslint.config.mjs).
//   - Fail-closed: non-integer/absent ceiling, empty `rules`, or a fatal/rule-less message (broken
//     parse, broken config) => exit 1. Without this, a broken config would yield 0 messages -> "0/92" ->
//     false green (decorative gate). The counter is reliable ONLY if the run is healthy.
//   - CI job g4 = `npm run lint && npm run lint:ratchet` (the general-purpose lint first).
//
// Formed pending (D9 ter §3): type the fixtures (parse + typed ajv validation), one lot per package
// (S, I, K), target ceiling 0 before checkpoint 2 of Phase 3. Any decrease lowers the ceiling.
import { ESLint } from "eslint";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const ratchetPath = join(root, "lint-ratchet.json");

let ratchet;
try {
  ratchet = JSON.parse(readFileSync(ratchetPath, "utf8"));
} catch (e) {
  console.error(`::error:: lint-ratchet: cannot read/parse lint-ratchet.json (${e.message}). Fail-closed.`);
  process.exit(1);
}

// Fail-closed validation of the ceiling and the rule list.
if (!Number.isInteger(ratchet.ceiling) || ratchet.ceiling < 0) {
  console.error(`::error:: lint-ratchet: invalid ceiling (ceiling=${JSON.stringify(ratchet.ceiling)}); integer >= 0 required. Fail-closed.`);
  process.exit(1);
}
if (!Array.isArray(ratchet.rules) || ratchet.rules.length === 0) {
  console.error("::error:: lint-ratchet: `rules` missing or empty in lint-ratchet.json. Fail-closed.");
  process.exit(1);
}

const tracked = new Set(ratchet.rules);
const reenable = Object.fromEntries(ratchet.rules.map((r) => [r, "error"]));

// overrideConfig is merged AFTER eslint.config.mjs -> for the tests, `error` wins over the base `off`.
const eslint = new ESLint({
  cwd: root,
  overrideConfig: [
    {
      files: ["**/*.test.ts", "test/**"],
      rules: reenable,
    },
  ],
});

const results = await eslint.lintFiles(["."]);

let count = 0;
let fatal = 0;
for (const res of results) {
  for (const m of res.messages) {
    // Fail-closed: fatal error (parse) or rule-less message => the run is not healthy, count unreliable.
    if (m.fatal || m.ruleId == null) {
      fatal++;
      const rel = res.filePath.replace(root, "").replace(/^[\\/]/, "");
      console.error(`::error:: lint-ratchet: fatal/rule-less message at ${rel}:${m.line ?? "?"} — ${m.message}`);
      continue;
    }
    if (tracked.has(m.ruleId)) count++;
  }
}

if (fatal > 0) {
  console.error(`::error:: lint-ratchet: ${fatal} fatal/rule-less message(s) — broken parse or config, count NOT reliable. Fail-closed (exit 1).`);
  process.exit(1);
}

const ceiling = ratchet.ceiling;
console.log(`lint-ratchet: ${count}/${ceiling} (deferred-typing violations in the tests / committed ceiling, measured_on ${ratchet.measured_on})`);

if (count > ceiling) {
  console.error(`::error:: lint-ratchet FAILED: ${count} > ceiling ${ceiling}. New typing debt in the tests blocked (D9 ter S3). Type the fixtures (parse + ajv) instead of adding \`any\`.`);
  process.exit(1);
}
if (count < ceiling) {
  console.log(`lint-ratchet: NOTE — count (${count}) < ceiling (${ceiling}): the debt has decreased; lower the ceiling to ${count} and commit lint-ratchet.json (D9 ter S3, "any decrease lowers the ceiling").`);
}
process.exit(0);
