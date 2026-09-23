// scripts/sync-bell-anchors.mjs — publish the Bell anchors register under /bell/anchors (ruling Q2, decision 146).
// Node 24, zero dependencies. SOURCE-REPO tool (not exported); run by the orchestrator after each anchor commit
// or proof upgrade, BEFORE a storefront upload:  node scripts/sync-bell-anchors.mjs
//
// What it does (and nothing else): reads docs/course-bell/ANCHORS.md (the governance register, French, never
// copied as such: the storefront is English-only and the export refuses its local paths), keeps the REAL lines
// (apps/site/lib/bell-anchors.ts parseAnchorsRegister), and writes into apps/site/public/bell/anchors/:
//   - each line's proof `<name>.ots`, byte-copied from docs/course-bell/ (the latest committed proof);
//   - each line's manifest `<name>`: the committed bytes whose SHA-256 equals the line's manifest digest —
//     docs/course-bell/<name> when it matches, else `git show <commit>:docs/course-bell/<name>` at the commit the
//     line names (a later boundary may have overwritten the file under the same name: measured on the first
//     TSLAx mint_resume, whose proof attests fd7564f5… while the file at HEAD holds 70f577a9…);
//   - anchors.json: the parsed lines, one per row (English keys; no operator note).
// Fail-closed: a manifest whose bytes cannot be matched to its digest, or a missing proof, exits 1 and writes
// nothing. Never a course file (ledger, budget, crosscheck): only manifests, proofs and the rendered table.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SOURCE_DIR = "docs/course-bell";
export const SOURCE_REGISTER = "docs/course-bell/ANCHORS.md";
export const OUT_DIR = "apps/site/public/bell/anchors";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** One JSON row per line, stable key order — a deterministic, reviewable file. */
export function serializeRegister(rows) {
  const keys = ["date_utc", "boundary", "mint", "manifest_sha256", "entry_sha256", "ledger_sha256", "commit", "manifest_file", "proof_file"];
  const lines = rows.map((r) => "    " + JSON.stringify(Object.fromEntries(keys.map((k) => [k, r[k]]))));
  return `{\n  "register": ${JSON.stringify(SOURCE_REGISTER)},\n  "rows": [\n${lines.join(",\n")}\n  ]\n}\n`;
}

async function main() {
  const { parseAnchorsRegister } = await import(pathToFileURL(join(ROOT, "apps", "site", "lib", "bell-anchors.ts")).href);
  const rows = parseAnchorsRegister(readFileSync(join(ROOT, SOURCE_REGISTER), "utf8"));
  if (rows.length === 0) {
    console.error("sync-bell-anchors: FAIL-CLOSED — no real line parsed from the register.");
    process.exit(1);
  }
  const files = new Map(); // served name -> bytes
  for (const r of rows) {
    if (r.proof_file === null || r.manifest_file === null) continue;
    const proofAbs = join(ROOT, SOURCE_DIR, r.proof_file);
    if (!existsSync(proofAbs)) {
      console.error(`sync-bell-anchors: FAIL-CLOSED — proof ${r.proof_file} named by the ${r.date_utc} line is missing.`);
      process.exit(1);
    }
    let manifest = null;
    const headAbs = join(ROOT, SOURCE_DIR, r.manifest_file);
    if (existsSync(headAbs) && sha256(readFileSync(headAbs)) === r.manifest_sha256) manifest = readFileSync(headAbs);
    else {
      const atCommit = execFileSync("git", ["show", `${r.commit}:${SOURCE_DIR}/${r.manifest_file}`], { cwd: ROOT });
      if (sha256(atCommit) === r.manifest_sha256) manifest = atCommit;
    }
    if (manifest === null) {
      console.error(`sync-bell-anchors: FAIL-CLOSED — no committed bytes of ${r.manifest_file} hash to ${r.manifest_sha256} (${r.date_utc}).`);
      process.exit(1);
    }
    files.set(r.manifest_file, manifest);
    files.set(r.proof_file, readFileSync(proofAbs));
  }
  const outAbs = join(ROOT, OUT_DIR);
  mkdirSync(outAbs, { recursive: true });
  for (const name of readdirSync(outAbs)) rmSync(join(outAbs, name)); // the served set is exactly the register's
  for (const [name, bytes] of files) writeFileSync(join(outAbs, name), bytes);
  writeFileSync(join(outAbs, "anchors.json"), serializeRegister(rows));
  const timestamped = rows.filter((r) => r.proof_file !== null).length;
  console.log(`sync-bell-anchors OK — ${String(rows.length)} register lines, ${String(timestamped)} with a proof, ${String(files.size)} files written to ${OUT_DIR}.`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
