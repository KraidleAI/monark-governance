// scripts/spec-policy-tables.mjs -- writer of the governance sources of the contract-1.1.0 version of the public spec repository (lot
// SPEC-1-1-0-RELEASE). Node 24, no dependency beyond this repository.
//
//   node scripts/spec-policy-tables.mjs --write | --check [--root <dir>]
//
// It derives, never by hand, the files that scripts/spec-publish-inputs.json pins under spec/contract-1.1.0/:
// - policy/<task_class>.json: the canonical writing of each table the harness serves (SERVED_POLICY_TABLES of tools/gate.ts, the value
//   the service builds at load, not a second build), so the file's sha256 is the served policy_table_sha256; no final LF;
// - schemas/<name>.schema.json: the frozen schemas/<name>.schema.json under a closed list of exact replacements (the public $id, and the
//   internal references of a description); each replacement must match exactly once, everything else is kept byte for byte.
// --check compares the files under <root> (this repository by default) and exits 1 on any difference, missing or extra file; --write
// writes them. It reads no clock and no network, and writes only under <root>/spec/contract-1.1.0/.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson } from "./spec-publish.mjs";

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const OUT_DIR = "spec/contract-1.1.0";
export const SCHEMA_NAMES = Object.freeze(["prediction", "coverage-verdict", "gate-decision", "policy-row", "tool-error"]);
export const publicId = (name) => `https://github.com/KraidleAI/monark-kata-spec/blob/main/schemas/${name}.schema.json`;
const EDITS = Object.freeze({
  prediction: [[" ADR-M001 Decision 6.", ""]],
  "coverage-verdict": [[" ADR-M001 Decision 4.", ""]],
  "gate-decision": [[", NEVER a yield (ADR-CERT-MONARK). ADR-M001 Decision 5.", ", never a return paid to anyone."]],
});

/** schemaCopy(name, text) -> the published copy of a frozen schema; throws when a replacement does not match exactly once. */
export function schemaCopy(name, text) {
  const edits = [[`"$id": "https://monark.local/schemas/${name}.schema.json"`, `"$id": "${publicId(name)}"`], ...(EDITS[name] ?? [])];
  return edits.reduce((t, [before, after]) => {
    if (t.split(before).length !== 2) throw new Error(`spec-policy-tables: ${name}: "${before}" does not occur exactly once`);
    return t.replace(before, () => after);
  }, text);
}

/** expectedFiles(root) -> [{path, text}] under OUT_DIR, sorted by path: the 5 schema copies and one table file per served class. */
export async function expectedFiles(root = REPO_ROOT) {
  const { SERVED_POLICY_TABLES } = await import("../apps/harness/src/tools/gate.ts");
  const schemas = SCHEMA_NAMES.map((n) => ({ path: `${OUT_DIR}/schemas/${n}.schema.json`, text: schemaCopy(n, readFileSync(join(root, "schemas", `${n}.schema.json`), "utf8")) }));
  const tables = SERVED_POLICY_TABLES.map((t) => ({ path: `${OUT_DIR}/policy/${t.task_class}.json`, text: canonicalJson(t.table) }));
  return [...schemas, ...tables].sort((a, b) => (a.path < b.path ? -1 : 1));
}

const listed = (root, sub) => (existsSync(join(root, OUT_DIR, sub)) ? readdirSync(join(root, OUT_DIR, sub)).map((n) => `${OUT_DIR}/${sub}/${n}`) : []);

/** differences(root, files) -> ["differ|missing|extra <path>"]: empty iff <root> holds exactly these files with these bytes. */
export function differences(root, files) {
  const want = new Set(files.map((f) => f.path)), out = [];
  for (const f of files) {
    const p = join(root, f.path);
    if (!existsSync(p)) out.push(`missing ${f.path}`);
    else if (!readFileSync(p).equals(Buffer.from(f.text, "utf8"))) out.push(`differ ${f.path}`);
  }
  for (const p of [...listed(root, "schemas"), ...listed(root, "policy")]) if (!want.has(p)) out.push(`extra ${p}`);
  return out;
}

export async function main(argv) {
  const [mode, flag, dir] = argv;
  if (!["--write", "--check"].includes(mode) || (flag !== undefined && (flag !== "--root" || dir === undefined)) || argv.length > 3) {
    console.error("usage: spec-policy-tables.mjs --write | --check [--root <dir>]");
    return 2;
  }
  const root = dir === undefined ? REPO_ROOT : resolve(dir), files = await expectedFiles(root);
  if (mode === "--write") for (const f of files) { mkdirSync(dirname(join(root, f.path)), { recursive: true }); writeFileSync(join(root, f.path), f.text); }
  const diff = differences(root, files);
  for (const d of diff) console.log(d);
  console.log(`spec-policy-tables ${diff.length === 0 ? "OK" : "DIFFERENT"}: ${files.length} file(s) under ${OUT_DIR}`);
  return diff.length === 0 ? 0 : 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = await main(process.argv.slice(2));
