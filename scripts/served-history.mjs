// scripts/served-history.mjs -- the writer of the served history, format kata-served-history-v1: one canonical JSON line per pair
// (deployment, served kata class), appended to apps/harness/data/kata/served/served-history.json once a deployment's check is green.
// Node 24, no dependency.
//
//   node scripts/served-history.mjs --release-dir <contract-1.1.0-tables-YYYY-MM-DD> --merge-commit <sha> --ca <deploy check record>
//                                   --probe <retire-probe-v1 record> [--probe <record> ...] [--root <dir>]
//
// A line carries one class and its table. Each deployment writes a line for EVERY kata class served after it, not only the classes it
// serves anew (24 lines for the first kata release, 28 for the second). The rules are the trunk's, imported, never rewritten:
// - served set (scripts/spec-policy-tables.mjs): the version directories of versionDirs (a dated one names a real day), release_dir the
//   last dated one and a directory; each kata table (cell_key_rule kata-bucket) of a dated directory is served from the directory that
//   servedTableDirs maps its class to (the last that holds it; two that hold the same bytes are refused). That set must be the classes
//   pinned in COMMITTED_TABLES of the served module PINS (main reads it, else pins_unreadable; a test gives another module).
// - probe: each served class has exactly one retire-probe-v1 record, and no record names another table. A record must be one that a real
//   cycle of scripts/retire-instants.mjs takes for T_g (instant: accepted, status 200, an https api off the loopback, an authorized TLS,
//   its Host), with a real UTC second for received_at and an instant of it for received_at_ms, made against the api of the deploy check
//   record (the origin of its url, that host for api_host); its table is the served file of its class, a table of that class, and its
//   policy_table_sha256 that file's sha256 (read, never typed in); probe_record_sha256 is the sha256 of the record's bytes.
// - t_e is T_e of retire-instants: the committer date, to the second, of a merge commit of two parents, named by 40 hex (checked before
//   git) that git reads as its own id (an annotated tag is refused), with no inherited GIT_* variable; it is on the first-parent history
//   of the HEAD of the tree (the trunk) and brings spec/<release_dir> (there, absent from its first parent). t_f is T_f: the checked_at,
//   cut to the second, of a deploy check record that verify-harness rates green with its CHECK_NAMES; ca_record_sha256 is the sha256 of
//   its bytes. t_e <= t_f, and each record is received at its checked_at or later, to the millisecond.
// The file is a JSON array, one line per element, sorted by (t_e, task_class); the lines already there must be its canonical writing
// under the same closed fields (each field a string of its form; t_e and t_f real UTC seconds); a (release_dir, task_class) pair is
// written once, and the lines of a release_dir share merge_commit, t_e, t_f and ca_record_sha256. Written through writeAtomic of
// scripts/verify-harness.mjs. Exit 0 written; 1 refused (code first); 2 usage.
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { instant } from "./retire-instants.mjs";
import { canonicalJson, validDate } from "./spec-publish.mjs";
import { servedTableDirs, VERSION_DIR, versionDirs } from "./spec-policy-tables.mjs";
import { writeAtomic } from "./verify-harness.mjs";

export const FORMAT = "kata-served-history-v1", HISTORY_REL = "apps/harness/data/kata/served/served-history.json";
export const FIELDS = ["format", "release_dir", "task_class", "policy_table_sha256", "probe_record_sha256", "merge_commit", "t_e", "t_f", "ca_record_sha256"];
/** The served module that pins the committed kata tables (COMMITTED_TABLES), added by the committed table loader. */
export const PINS = new URL("../apps/harness/src/policy-committed-pins.ts", import.meta.url).href;
export class HistoryError extends Error {
  constructor(code, detail) { super(`${code}: ${detail}`); this.code = code; }
}
const no = (code, detail) => { throw new HistoryError(code, detail); };
const via = (code, f) => { const fail = (e) => no(code, e instanceof Error ? e.message : String(e)); try { const r = f(); return r instanceof Promise ? r.catch(fail) : r; } catch (e) { return fail(e); } };
const sha = (b) => createHash("sha256").update(b).digest("hex");
const HEX = /^[0-9a-f]{64}$/, SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, DIR = /^contract-1\.1\.0-tables-\d{4}-\d{2}-\d{2}$/, COMMON = ["merge_commit", "t_e", "t_f", "ca_record_sha256"];
const str = (v, re) => typeof v === "string" && re.test(v);
/** A real UTC second, as scripts/retire-latency.mjs l.46-47 reads one: a day that exists, an hour of it. */
const real = (s) => { const t = str(s, SECOND) ? Date.parse(s) : NaN; return Number.isFinite(t) && new Date(t).toISOString() === s.replace("Z", ".000Z"); };
const parse = (bytes, what) => { try { return JSON.parse(Buffer.from(bytes).toString("utf8")); } catch { return no("input_invalid", `${what} is not JSON`); } };

/** checkLine(l) -> l when it is a closed kata-served-history-v1 line (one class, each field a string of its form); else line_invalid. */
export function checkLine(l) {
  const keys = l !== null && typeof l === "object" && !Array.isArray(l) ? Object.keys(l).sort() : [];
  if (keys.join() !== [...FIELDS].sort().join()) no("line_invalid", `fields ${JSON.stringify(keys)} are not the closed set`);
  const good = l.format === FORMAT && str(l.release_dir, DIR) && validDate(l.release_dir.slice(-10)) && str(l.task_class, /^[a-z0-9]+(-[a-z0-9]+)*$/)
    && [l.policy_table_sha256, l.probe_record_sha256, l.ca_record_sha256].every((h) => str(h, HEX)) && str(l.merge_commit, /^[0-9a-f]{40}$/)
    && real(l.t_e) && real(l.t_f) && Date.parse(l.t_e) <= Date.parse(l.t_f);
  return good ? l : no("line_invalid", `${JSON.stringify(l)} is not a kata-served-history-v1 line`);
}

/** compose({root, releaseDir, mergeCommit, tE, caBytes, probes, pinned}) -> the new lines, one per kata class served after releaseDir. */
export function compose({ root, releaseDir, mergeCommit, tE, caBytes, probes, pinned }) {
  const dated = versionDirs(root).filter((d) => d !== VERSION_DIR);
  if (dated.at(-1) !== releaseDir || statSync(join(root, "spec", String(releaseDir)), { throwIfNoEntry: false })?.isDirectory() !== true) no("input_invalid", `release directory ${JSON.stringify(releaseDir)}: not the last dated directory of the tree, or not a directory`);
  const ca = parse(caBytes, "the deploy check record"), tF = via("ca_not_green", () => instant("T_f", { ca: "the deploy check record" }, { read: () => ca }, "real"));
  const api = URL.canParse(ca.url) ? new URL(ca.url) : null; // the api that the record checked: the probes' api
  const kata = dated.flatMap((d) => { const p = join(root, "spec", d, "policy"); return existsSync(p) ? readdirSync(p).filter((f) => f.endsWith(".json") && parse(readFileSync(join(p, f)), f)?.class?.cell_key_rule === "kata-bucket") : []; });
  const served = via("input_invalid", () => servedTableDirs(root, kata.map((f) => ({ task_class: f.slice(0, -5) }))));
  const lines = probes.map(({ bytes, name }) => {
    const probe = parse(bytes, name), cls = probe?.task_class, rel = `spec/${served[cls]}/policy/${cls}.json`;
    via("probe_not_accepted", () => instant("T_g", { probe: name }, { read: () => probe }, "real"));
    const sec = Date.parse(probe.received_at), ms = Date.parse(probe.received_at_ms); // the second of T_g, and the probe's reading of it
    if (!real(probe.received_at) || !(ms >= sec && ms < sec + 1000)) no("probe_not_accepted", `${name}: received_at is no real UTC second, or received_at_ms no instant of it`);
    if (new URL(probe.api).origin !== api?.origin || probe.api_host !== api?.host) no("probe_other_host", `${name} probed ${String(probe.api)} (Host ${String(probe.api_host)}), not the api ${String(ca.url)} of the deploy check record`);
    if (!Object.hasOwn(served, cls) || typeof probe.table !== "string" || probe.table.replaceAll("\\", "/").replace(/^\.\//, "") !== rel) no("probe_other_table", `${name} probed ${String(probe.table)}, not a kata table served after ${releaseDir}`);
    const table = readFileSync(join(root, rel));
    if (parse(table, rel)?.class?.task_class !== cls) no("probe_other_class", `${name} is a ${String(cls)} record, ${rel} holds another class`);
    if (sha(table) !== probe.policy_table_sha256) no("digest_mismatch", `${name} served ${String(probe.policy_table_sha256)}, ${rel} is ${sha(table)}`);
    if (!(ms >= Date.parse(ca.checked_at))) no("probe_before_ca", `${name} was received at ${String(probe.received_at_ms)}, before the deploy check record (${String(ca.checked_at)})`);
    return checkLine({ format: FORMAT, release_dir: releaseDir, task_class: cls, policy_table_sha256: probe.policy_table_sha256, probe_record_sha256: sha(bytes),
      merge_commit: mergeCommit, t_e: tE, t_f: tF, ca_record_sha256: sha(caBytes) });
  });
  const classes = Object.keys(served).sort(), missing = classes.filter((c) => lines.filter((l) => l.task_class === c).length !== 1);
  if (missing.length > 0) no("class_not_once", `served kata classes without exactly one record: ${missing.join(", ")}`);
  if (classes.join() !== [...pinned].sort().join()) no("served_not_pinned", `served after ${releaseDir}: ${classes.join(", ") || "none"}; pinned in COMMITTED_TABLES: ${[...pinned].sort().join(", ") || "none"}`);
  return lines.length > 0 ? lines : no("no_kata_table", `no kata table is served after ${releaseDir} and no record is given: no line`);
}

/** render(existing, lines) -> the new file text: existing (bytes or null) re-read, the lines added, sorted by (t_e, task_class). */
export function render(existing, lines) {
  const order = (a, b) => (a.t_e === b.t_e ? (a.task_class < b.task_class ? -1 : a.task_class > b.task_class ? 1 : 0) : a.t_e < b.t_e ? -1 : 1);
  const text = (all) => `[\n${[...all].sort(order).map(canonicalJson).join(",\n")}\n]\n`, old = existing === null ? [] : parse(existing, HISTORY_REL);
  const clash = (all) => all.find((l, i) => all.findIndex((o) => o.release_dir === l.release_dir && (o.task_class === l.task_class || COMMON.some((k) => o[k] !== l[k]))) !== i);
  if (existing !== null && (!Array.isArray(old) || old.length === 0 || text(old.map(checkLine)) !== Buffer.from(existing).toString("utf8") || clash(old))) no("history_invalid", `${HISTORY_REL} is not its canonical writing, or a deployment's lines differ`);
  const twice = clash([...old, ...lines]);
  return twice ? no("pair_written", `${twice.release_dir} ${twice.task_class} is already in the history, or its deployment has other common fields`) : text([...old, ...lines]);
}

/** mergeInstant(root, sha, releaseDir) -> T_e, the committer date (UTC second) of the merge commit sha, on the first-parent history of
 *  the HEAD of root, that brings spec/<releaseDir>. */
export function mergeInstant(root, commit, releaseDir) {
  const git = (...a) => spawnSync("git", ["-C", root, ...a], { encoding: "utf8", env: Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_"))) });
  const read = (_repo, id) => {
    const r = git("log", "-1", "--format=%H %cI %P", "--end-of-options", `${id}^{commit}`), [own, ...rest] = String(r.stdout).trim().split(" ");
    if (r.status !== 0 || own !== id) throw new Error(`${id} is not the id of a commit (${String(r.stderr).trim() || `git reads ${String(own)}`})`);
    return rest.join(" ");
  };
  const tE = via("not_a_merge", () => instant("T_e", { commit, repo: root }, { git: read }));
  if (!git("rev-list", "--first-parent", "HEAD").stdout.split("\n").includes(commit)) no("merge_not_on_trunk", `${commit} is not on the first-parent history of the HEAD of ${root}`);
  const has = (rev) => git("cat-file", "-e", "--end-of-options", `${rev}:spec/${releaseDir}`).status === 0;
  return has(commit) && !has(`${commit}^1`) ? tE : no("merge_not_release", `${commit} does not bring spec/${releaseDir} (in it, absent from its first parent)`);
}

export async function main(argv, io = {}) {
  const a = { root: ".", probe: [] };
  for (let i = 0; i < argv.length; i += 2) {
    const k = argv[i]?.replace(/^--/, ""), v = argv[i + 1];
    if (!["root", "release-dir", "merge-commit", "ca", "probe"].includes(k ?? "") || v === undefined) { console.error(`usage: ${argv[i]} (see the header of scripts/served-history.mjs)`); return 2; }
    if (k === "probe") a.probe.push(v); else a[k] = v;
  }
  if (!a["release-dir"] || !a["merge-commit"] || !a.ca || a.probe.length === 0) { console.error("usage: --release-dir, --merge-commit, --ca and --probe are required"); return 2; }
  try {
    const pinned = await via("pins_unreadable", async () => Object.keys((await import(io.pins ?? PINS)).COMMITTED_TABLES)); // absent until the loader lands
    const tE = mergeInstant(a.root, a["merge-commit"], a["release-dir"]);
    const lines = compose({ root: a.root, releaseDir: a["release-dir"], mergeCommit: a["merge-commit"], tE, caBytes: readFileSync(a.ca), probes: a.probe.map((p) => ({ name: p, bytes: readFileSync(p) })), pinned });
    const out = join(a.root, HISTORY_REL), text = render(existsSync(out) ? readFileSync(out) : null, lines);
    mkdirSync(dirname(out), { recursive: true }); writeAtomic(out, text);
    console.log(`served-history OK: ${lines.length} line(s) for ${a["release-dir"]} -> ${HISTORY_REL}`);
    return 0;
  } catch (e) {
    console.error(`served-history refused: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

if (import.meta.main !== false) process.exitCode = await main(process.argv.slice(2)); // as scripts/retire-probe.mjs: a launch runs main, an import none
