// Generates docs/S2-RAPPORT-fixtures-synth.md + docs/S2-journal-fixtures-synth.tsv from the instrument
// (ADR-M002 D10; G2 Lot H corr. 4). Deterministic: same code + same parameters ⇒ same bytes.
// Usage: node packages/hikae/scripts/s2-report.mjs   (from the workspace root, Node >= 24)
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const { runS2 } = await import(new URL("../src/s2/run.ts", import.meta.url).href);

const out = runS2();
const docs = join(here, "..", "docs");
mkdirSync(docs, { recursive: true });
writeFileSync(join(docs, "S2-RAPPORT-fixtures-synth.md"), out.report, "utf8");
writeFileSync(join(docs, "S2-journal-fixtures-synth.tsv"), out.journal, "utf8");
console.log(`S2 report written — journal ${out.journalLines} lines, sha256 ${out.journalDigest}`);
