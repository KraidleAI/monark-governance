// scripts/repin-served.mjs — rewrite the typed pins of the served-harness files in test/harness-served.test.ts (PINNED)
// from the committed files (lot T0-TOOLING-1). SOURCE-REPO tool (not exported); run after a harness sync, at T0 after the
// promotion, before the one re-pin commit:  node scripts/repin-served.mjs [--check]
//
// The pins stay TYPED on purpose: the syncs now write the site manifest themselves, so the manifest check alone would let a
// re-sync change a served file without any test edit; a typed pin makes every change of these bytes a reviewed test diff.
// This tool only computes them: each listed file present under the root, its CRLF->LF sha256 (the manifest's rule); the
// pending snapshot is pinned while it exists and its line goes with it. --check writes nothing and exits 1 when a pin is stale.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const PIN_TEST_REL = "test/harness-served.test.ts";
export const PINNED_FILES = Object.freeze(["apps/site/data/harness-served.json", "apps/site/data/harness-pending.json", "fixtures/byo-demo-trace.json", "fixtures/h5-e2e-trace.json"]);
const OPEN = "const PINNED: Record<string, string> = {\n";

/** The pins of `root`: each listed file that exists, to its CRLF->LF sha256, in the list's order (pure read). */
export function pinsOf(root) {
  const lf = (rel) => readFileSync(join(root, rel), "utf8").replace(/\r\n/g, "\n");
  return Object.fromEntries(PINNED_FILES.filter((rel) => existsSync(join(root, rel))).map((rel) => [rel, createHash("sha256").update(lf(rel), "utf8").digest("hex")]));
}

/** The test text with its PINNED block rewritten to `pins`, no other byte touched; throws unless the block occurs once. */
export function repinText(text, pins) {
  const lf = text.replace(/\r\n/g, "\n"), at = lf.indexOf(OPEN), end = lf.indexOf("\n};\n", at);
  if (at < 0 || lf.indexOf(OPEN, at + 1) >= 0 || end < 0) throw new Error(`${PIN_TEST_REL} must carry exactly one PINNED block`);
  const body = Object.entries(pins).map(([rel, sha]) => `  ${JSON.stringify(rel)}: ${JSON.stringify(sha)},`).join("\n");
  return `${lf.slice(0, at + OPEN.length)}${body}${lf.slice(end)}`;
}

function main() {
  const file = join(ROOT, PIN_TEST_REL), text = readFileSync(file, "utf8"), next = repinText(text, pinsOf(ROOT));
  if (next === text) return console.log(`repin-served: ${PIN_TEST_REL} pins are current; nothing written.`);
  if (process.argv.includes("--check")) {
    console.error(`repin-served --check: the pins of ${PIN_TEST_REL} are stale; run node scripts/repin-served.mjs`);
    process.exitCode = 1;
    return;
  }
  writeFileSync(file, next);
  console.log(`repin-served OK — ${PIN_TEST_REL} PINNED rewritten (${Object.keys(pinsOf(ROOT)).join(", ")}); commit it with the synced data.`);
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
