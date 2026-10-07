// scripts/served-history.mjs -- the writer of the served history, format kata-served-history-v1: one canonical JSON line per pair
// (deployment, served kata class), appended to apps/harness/data/kata/served/served-history.json once a deployment's check is green.
// Node 24, no dependency.
//
//   node scripts/served-history.mjs --release-dir <contract-1.1.0-tables-YYYY-MM-DD> --merge-commit <sha> --ca <deploy check record>
//                                   --probe <retire-probe-v1 record> [--probe <record> ...] [--root <dir>]
//
// A line carries one class and its table. Each deployment writes a line for EVERY kata class served after it, not only the classes it
// serves anew (24 lines for the first kata release, 28 for the second): the classes served after release_dir are the kata tables
// (cell_key_rule kata-bucket) of the dated directories spec/contract-1.1.0-tables-<date>/ up to release_dir, each class at the last such
// directory that holds it. task_class and policy_table_sha256 are read from the class's retire-probe-v1 record (an accepted verdict: ok,
// equal, no problem), never typed in; probe_record_sha256 is the sha256 of that record's bytes. The record's table is the served file
// of its class, spec/<that directory>/policy/<task_class>.json, a table of that class whose sha256 is the digest served. Every served
// kata class has exactly one record, and no record names another table. A marginal table has no probe and no line, so a deployment
// after which no kata table is served writes nothing (refused, no_kata_table). t_e is the commit instant of
// the merge commit (git, UTC second; a commit with two parents or more); t_f is the checked_at of the deploy check record, green on
// every check with an authorized TLS on both hosts, and ca_record_sha256 is the sha256 of its bytes. The file is a JSON array, one
// line per element, sorted by (t_e, task_class); the lines already there must be its canonical writing under the same closed fields,
// and a (release_dir, task_class) pair already written is refused. Exit 0 written; 1 refused (code first); 2 usage.
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { canonicalJson } from "./spec-publish.mjs";

export const FORMAT = "kata-served-history-v1", HISTORY_REL = "apps/harness/data/kata/served/served-history.json";
export const FIELDS = ["format", "release_dir", "task_class", "policy_table_sha256", "probe_record_sha256", "merge_commit", "t_e", "t_f", "ca_record_sha256"];
export class HistoryError extends Error {
  constructor(code, detail) { super(`${code}: ${detail}`); this.code = code; }
}
const no = (code, detail) => { throw new HistoryError(code, detail); };
const sha = (b) => createHash("sha256").update(b).digest("hex");
const HEX = /^[0-9a-f]{64}$/, INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, DIR = /^contract-1\.1\.0-tables-\d{4}-\d{2}-\d{2}$/;
const parse = (bytes, what) => { try { return JSON.parse(Buffer.from(bytes).toString("utf8")); } catch { return no("input_invalid", `${what} is not JSON`); } };

/** checkLine(l) -> l when it is a closed kata-served-history-v1 line (one class, as a string); else refused, line_invalid. */
export function checkLine(l) {
  const keys = l !== null && typeof l === "object" && !Array.isArray(l) ? Object.keys(l).sort() : [];
  if (keys.join() !== [...FIELDS].sort().join()) no("line_invalid", `fields ${JSON.stringify(keys)} are not the closed set`);
  const good = l.format === FORMAT && DIR.test(l.release_dir) && typeof l.task_class === "string" && /^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.task_class)
    && [l.policy_table_sha256, l.probe_record_sha256, l.ca_record_sha256].every((h) => HEX.test(h)) && /^[0-9a-f]{40}$/.test(l.merge_commit)
    && INSTANT.test(l.t_e) && INSTANT.test(l.t_f) && Date.parse(l.t_e) <= Date.parse(l.t_f);
  return good ? l : no("line_invalid", `${JSON.stringify(l)} is not a kata-served-history-v1 line`);
}

/** compose({root, releaseDir, mergeCommit, tE, caBytes, probes}) -> the new lines, one per kata class served after releaseDir. */
export function compose({ root, releaseDir, mergeCommit, tE, caBytes, probes }) {
  if (!DIR.test(releaseDir) || !existsSync(join(root, "spec", releaseDir))) no("input_invalid", `release directory ${JSON.stringify(releaseDir)}`);
  const ca = parse(caBytes, "the deploy check record"), served = new Map();
  if (!(Array.isArray(ca?.checks) && ca.checks.length > 0 && ca.checks.every((c) => c?.ok === true) && ca.tls?.authorized === true && ca.tls_mcp?.authorized === true)) no("ca_not_green", "a check is red or a TLS is not authorized");
  for (const d of readdirSync(join(root, "spec")).filter((x) => DIR.test(x) && x <= releaseDir).sort()) {
    const policy = join(root, "spec", d, "policy");
    for (const f of existsSync(policy) ? readdirSync(policy).filter((x) => x.endsWith(".json")) : []) if (parse(readFileSync(join(policy, f)), f)?.class?.cell_key_rule === "kata-bucket") served.set(f.slice(0, -5), d);
  }
  if (served.size === 0) no("no_kata_table", `no kata table is served after ${releaseDir}: no line`);
  const lines = probes.map(({ bytes, name }) => {
    const probe = parse(bytes, name), cls = String(probe?.task_class), rel = `spec/${String(served.get(cls))}/policy/${cls}.json`;
    if (probe?.format !== "retire-probe-v1" || probe.ok !== true || probe.equal !== true || probe.problem !== null) no("probe_not_accepted", `${name} is not an accepted retire-probe-v1 verdict`);
    if (String(probe.table).replaceAll("\\", "/").replace(/^\.\//, "") !== rel || !served.has(cls)) no("probe_other_table", `${name} probed ${String(probe.table)}, not a kata table served after ${releaseDir}`);
    const table = readFileSync(join(root, rel));
    if (parse(table, rel).class.task_class !== cls) no("probe_other_class", `${name} is a ${cls} record, ${rel} holds another class`);
    if (sha(table) !== probe.policy_table_sha256) no("digest_mismatch", `${name} served ${String(probe.policy_table_sha256)}, ${rel} is ${sha(table)}`);
    if (!(Date.parse(probe.received_at) >= Date.parse(tE))) no("probe_before_merge", `${name} was received before the merge commit`);
    return checkLine({ format: FORMAT, release_dir: releaseDir, task_class: cls, policy_table_sha256: probe.policy_table_sha256, probe_record_sha256: sha(bytes),
      merge_commit: mergeCommit, t_e: tE, t_f: ca.checked_at, ca_record_sha256: sha(caBytes) });
  });
  const missing = [...served.keys()].filter((c) => lines.filter((l) => l.task_class === c).length !== 1);
  return missing.length === 0 ? lines : no("class_not_once", `served kata classes without exactly one record: ${missing.join(", ")}`);
}

/** render(existing, lines) -> the new file text: existing (bytes or null) re-read, the lines added, sorted by (t_e, task_class). */
export function render(existing, lines) {
  const order = (a, b) => (a.t_e === b.t_e ? (a.task_class < b.task_class ? -1 : a.task_class > b.task_class ? 1 : 0) : a.t_e < b.t_e ? -1 : 1);
  const text = (all) => `[\n${[...all].sort(order).map(canonicalJson).join(",\n")}\n]\n`, old = existing === null ? [] : parse(existing, HISTORY_REL);
  if ((!Array.isArray(old) || old.length === 0) ? existing !== null : text(old.map(checkLine)) !== Buffer.from(existing).toString("utf8")) no("history_invalid", `${HISTORY_REL} is not its canonical writing`);
  const twice = lines.find((l) => old.some((o) => o.release_dir === l.release_dir && o.task_class === l.task_class));
  return twice ? no("pair_written", `${twice.release_dir} ${twice.task_class} is already in the history`) : text([...old, ...lines]);
}

/** mergeInstant(root, sha) -> the UTC second of the merge commit sha (two parents or more), read from git; checkLine takes a full sha only. */
export function mergeInstant(root, commit) {
  const [, at, ...parents] = execFileSync("git", ["-C", root, "show", "-s", "--format=%H %ct %P", `${commit}^{commit}`], { encoding: "utf8" }).trim().split(" ");
  if (parents.length < 2) no("not_a_merge", `${commit} is not a merge commit`);
  return new Date(Number(at) * 1000).toISOString().replace(".000Z", "Z");
}

export function main(argv) {
  const a = { root: ".", probe: [] };
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i]?.replace(/^--/, ""), v = argv[i + 1];
    if (!["root", "release-dir", "merge-commit", "ca", "probe"].includes(k ?? "") || v === undefined) { console.error(`usage: ${argv[i]} (see the header of scripts/served-history.mjs)`); return 2; }
    if (k === "probe") a.probe.push(v); else a[k] = v;
  }
  if (!a["release-dir"] || !a["merge-commit"] || !a.ca || a.probe.length === 0) { console.error("usage: --release-dir, --merge-commit, --ca and --probe are required"); return 2; }
  try {
    const lines = compose({ root: a.root, releaseDir: a["release-dir"], mergeCommit: a["merge-commit"], tE: mergeInstant(a.root, a["merge-commit"]), caBytes: readFileSync(a.ca), probes: a.probe.map((p) => ({ name: p, bytes: readFileSync(p) })) });
    const out = join(a.root, HISTORY_REL), text = render(existsSync(out) ? readFileSync(out) : null, lines);
    mkdirSync(dirname(out), { recursive: true }); writeFileSync(`${out}.tmp`, text); renameSync(`${out}.tmp`, out);
    console.log(`served-history OK: ${lines.length} line(s) for ${a["release-dir"]} -> ${HISTORY_REL}`);
    return 0;
  } catch (e) {
    console.error(`served-history refused: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

if (import.meta.main !== false) process.exitCode = main(process.argv.slice(2)); // as scripts/retire-latency.mjs: a launch runs main, an import none
