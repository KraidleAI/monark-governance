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
// ADR-BELL-OTS-ANCHOR-1 D3 (tuyau P-4): the same for docs/bell-publications/ANCHORS.md into publications.json (parsePublicationAnchors,
// its own `git show` directory), each row bound to its files (bindPublicationAnchor); an empty register or a name served twice fails too.
// ADR-BELL-OTS-PRB D-B3, D-B4: each publication row, timestamped or not, is also bound to lines[] of apps/site/data/bell-served.json
// (v4, read through its hash check: run scripts/sync-bell-served.mjs FIRST) — its seq is a served line, its line_hash and kind are
// that line's, its manifest's files are the ones the line names (bindPublicationRowToLines) — before any write. No link or junction is
// followed: every component, from the repository root, of the registers, proofs, manifests, the two data files and the served
// directory must be a real directory or a regular file (noLinkOnPath), checked before it is read, and before the sweep.
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, rmSync, lstatSync } from "node:fs";
import { join, dirname } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const SOURCE_DIR = "docs/course-bell";
export const SOURCE_REGISTER = "docs/course-bell/ANCHORS.md";
export const OUT_DIR = "apps/site/public/bell/anchors";
export const PUBLICATIONS_DIR = "docs/bell-publications", PUBLICATIONS_REGISTER = "docs/bell-publications/ANCHORS.md";
const PUBLICATION_KEYS = ["date_utc", "seq", "kind", "line_hash", "prefix_sha256", "manifest_sha256", "commit", "manifest_file", "proof_file"];

const DATA_FILES = ["apps/site/data/bell-served.json", "apps/site/data/manifest.sha256.json"];

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

/** Exit 1 unless every component of `rel`, from the repository root, is a real directory (lstat: a symbolic link or a junction is not)
 *  and the last one a regular file, or a real directory when `dir` (which may be absent: the sync creates it under checked parents). */
function noLinkOnPath(rel, dir = false) {
  const parts = rel.split("/");
  for (let i = 1; i <= parts.length; i++) {
    const at = parts.slice(0, i).join("/"), st = lstatSync(join(ROOT, at), { throwIfNoEntry: false }), file = i === parts.length && !dir;
    if (st === undefined && i === parts.length && dir) return;
    if (st === undefined || (file ? !st.isFile() : !st.isDirectory() || st.isSymbolicLink())) {
      console.error(`sync-bell-anchors: FAIL-CLOSED — ${at} is not a real ${file ? "file" : "directory"} (no link or junction is followed); nothing written.`);
      process.exit(1);
    }
  }
}

/** One JSON row per line, stable key order — a deterministic, reviewable file. */
export function serializeRegister(rows, register = SOURCE_REGISTER, keys = ["date_utc", "boundary", "mint", "manifest_sha256", "entry_sha256", "ledger_sha256", "commit", "manifest_file", "proof_file"]) {
  const lines = rows.map((r) => "    " + JSON.stringify(Object.fromEntries(keys.map((k) => [k, r[k]]))));
  return `{\n  "register": ${JSON.stringify(register)},\n  "rows": [\n${lines.join(",\n")}\n  ]\n}\n`;
}

async function main() {
  const { parseAnchorsRegister, parsePublicationAnchors, bindPublicationAnchor, bindPublicationRowToLines, manifestEntries, readOtsProof } = await import(pathToFileURL(join(ROOT, "apps", "site", "lib", "bell-anchors.ts")).href);
  const { loadBellServed } = await import(pathToFileURL(join(ROOT, "apps", "site", "lib", "bell-served-load.ts")).href);
  for (const rel of [SOURCE_REGISTER, PUBLICATIONS_REGISTER, ...DATA_FILES]) noLinkOnPath(rel);
  const { lines } = loadBellServed(ROOT); // the chain the publication rows bind to (v4 lines[], hashed; a v3 file throws)
  const rows = parseAnchorsRegister(readFileSync(join(ROOT, SOURCE_REGISTER), "utf8"));
  const pubs = parsePublicationAnchors(readFileSync(join(ROOT, PUBLICATIONS_REGISTER), "utf8"));
  if (rows.length === 0 || pubs.length === 0) {
    console.error("sync-bell-anchors: FAIL-CLOSED — no real line parsed from a register.");
    process.exit(1);
  }
  const files = new Map(); // served name -> bytes
  for (const [dir, r] of [...rows.map((x) => [SOURCE_DIR, x]), ...pubs.map((x) => [PUBLICATIONS_DIR, x])]) {
    if (dir === PUBLICATIONS_DIR && r.proof_file === null) bindPublicationRowToLines(r, null, lines);
    if (r.proof_file === null || r.manifest_file === null) continue;
    const proofAbs = join(ROOT, dir, r.proof_file);
    if (!existsSync(proofAbs)) {
      console.error(`sync-bell-anchors: FAIL-CLOSED — proof ${r.proof_file} named by the ${r.date_utc} line is missing.`);
      process.exit(1);
    }
    noLinkOnPath(`${dir}/${r.proof_file}`);
    let manifest = null;
    const headAbs = join(ROOT, dir, r.manifest_file), headHere = lstatSync(headAbs, { throwIfNoEntry: false }) !== undefined;
    if (headHere) noLinkOnPath(`${dir}/${r.manifest_file}`);
    if (headHere && sha256(readFileSync(headAbs)) === r.manifest_sha256) manifest = readFileSync(headAbs);
    else {
      const atCommit = execFileSync("git", ["show", `${r.commit}:${dir}/${r.manifest_file}`], { cwd: ROOT });
      if (sha256(atCommit) === r.manifest_sha256) manifest = atCommit;
    }
    if (manifest === null) {
      console.error(`sync-bell-anchors: FAIL-CLOSED — no committed bytes of ${r.manifest_file} hash to ${r.manifest_sha256} (${r.date_utc}).`);
      process.exit(1);
    }
    if (files.has(r.proof_file)) { console.error(`sync-bell-anchors: FAIL-CLOSED — ${r.proof_file} is named by two lines.`); process.exit(1); }
    files.set(r.manifest_file, manifest);
    files.set(r.proof_file, readFileSync(proofAbs));
    if (dir === PUBLICATIONS_DIR) {
      bindPublicationAnchor(r, manifest.toString("utf8"), sha256(manifest), readOtsProof(new Uint8Array(files.get(r.proof_file))));
      bindPublicationRowToLines(r, manifestEntries(manifest.toString("utf8")), lines);
    }
  }
  noLinkOnPath(OUT_DIR, true); // before the sweep: a served directory that is a junction would empty its target
  const outAbs = join(ROOT, OUT_DIR);
  mkdirSync(outAbs, { recursive: true });
  for (const name of readdirSync(outAbs)) rmSync(join(outAbs, name)); // the served set is exactly the registers'
  for (const [name, bytes] of files) writeFileSync(join(outAbs, name), bytes);
  writeFileSync(join(outAbs, "anchors.json"), serializeRegister(rows));
  writeFileSync(join(outAbs, "publications.json"), serializeRegister(pubs, PUBLICATIONS_REGISTER, PUBLICATION_KEYS));
  const timestamped = [...rows, ...pubs].filter((r) => r.proof_file !== null).length;
  console.log(`sync-bell-anchors OK — ${String(rows.length + pubs.length)} register lines, ${String(timestamped)} with a proof, ${String(files.size)} files written to ${OUT_DIR}.`);
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
