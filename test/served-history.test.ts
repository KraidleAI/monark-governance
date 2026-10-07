// test/served-history.test.ts -- the writer of the served history (scripts/served-history.mjs, format kata-served-history-v1): one closed
// line per (deployment, kata class), whose table digest is read from that class's retire-probe-v1 record; a marginal table has no line.
// Offline: every root is a copy under the OS temp directory, built from the committed tables of spec/contract-1.1.0/policy/. The records
// are in their producers' writing: a probe record is judge() of scripts/retire-probe.mjs and a line feed, as its --out writes it; a deploy
// check record is the writing of scripts/verify-harness.mjs (JSON.stringify(record, null, 2) and a line feed), see below. Each test names
// on the line above it the production mutation that reddens it (scripts/red-proof.mjs).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { call, judge } from "../scripts/retire-probe.mjs";
import { canonicalJson } from "../scripts/spec-publish.mjs";
import { checkLine, compose, FIELDS, HISTORY_REL, main, mergeInstant, PINS, render } from "../scripts/served-history.mjs";
import type { HistoryLine } from "../scripts/served-history.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url)), DIR = "contract-1.1.0-tables-2026-10-05", D2 = "contract-1.1.0-tables-2026-11-02";
const LIQ = "liquidation-eligible-coverage", KATA = ["btc-dir-1h", "eth-range-4h"], TMP = mkdtempSync(join(tmpdir(), "served-history-"));
after(() => rmSync(TMP, { recursive: true, force: true }));
const sha = (b: string | Uint8Array): string => createHash("sha256").update(b).digest("hex");
const committed = (c: string): Buffer => readFileSync(join(ROOT, "spec", "contract-1.1.0", "policy", `${c}.json`));
const changed = (c: string): Buffer => Buffer.concat([committed(c), Buffer.from("\n")]); // a later table of the class: other bytes
// The deploy check records. The composition test reads a real one: the trial record that verify-harness wrote against the deployed api
// (test/fixtures/ca-trial-18.json, byte for byte; MONARK e6d5517). The other tests take its fields with a green check per name of the
// CHECK_NAMES of the base branch, so that a change of that list reddens the composition test only. Instants count from its checked_at.
const { CHECK_NAMES } = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as { CHECK_NAMES: readonly string[] };
const TRIAL = readFileSync(join(ROOT, "test", "fixtures", "ca-trial-18.json")), REC = { ...(JSON.parse(TRIAL.toString("utf8")) as { url: string; checked_at: string; tls: object }),
  checks: CHECK_NAMES.map((name) => ({ name, ok: true, status: 200, sha256: sha(name), detail: "ok" })) };
/** The UTC second s seconds after T_f, the checked_at of the record cut to the second. */
const at = (s: number): string => new Date(Math.floor(Date.parse(REC.checked_at) / 1000) * 1000 + s * 1000).toISOString().replace(".000Z", "Z");
const TE = at(-3600), TF = at(0), DAY = 86_400;
let n = 0;
/** A root whose version directories hold the given files (name -> the class whose committed bytes it gets, or its bytes); DIR by default. */
function rootOf(files: Record<string, string | Buffer>, more: Record<string, Record<string, string | Buffer>> = {}): string {
  const r = join(TMP, `r${++n}`);
  for (const [d, fs] of Object.entries({ [DIR]: files, ...more })) {
    mkdirSync(join(r, "spec", d, "policy"), { recursive: true });
    for (const [name, c] of Object.entries(fs)) writeFileSync(join(r, "spec", d, "policy", `${name}.json`), typeof c === "string" ? committed(c) : c);
  }
  return r;
}
type Rec = { name: string; bytes: Buffer };
/** The record that retire-probe --out writes for class c (its table file `bytes` in directory d) answered s seconds after checked_at with
 *  the file's digest, from https://api.monarkgate.tech over an authorized TLS; then `over` changes fields of it. */
const probe = (c: string, o: { d?: string; bytes?: Buffer; s?: number; over?: Record<string, unknown> } = {}): Rec => {
  const asked = call(o.bytes ?? committed(c), `kata:p@v/BTCUSDT/1h/${c.includes("-dir-") ? "up" : "b0"}`, 0), verdict = { cell_key: asked.cell, policy_table_sha256: asked.expected, reason: "under_calib" };
  const { record } = judge({ status: 200, text: JSON.stringify({ structuredContent: { verdict } }), tls_authorized: true }, asked, Date.parse(REC.checked_at) + (o.s ?? 3600) * 1000, { table: `spec/${o.d ?? DIR}/policy/${c}.json`, api: "https://api.monarkgate.tech", apiHost: "api.monarkgate.tech" });
  return { name: `${c}.probe.json`, bytes: Buffer.from(`${JSON.stringify({ ...record, ...o.over })}\n`) };
};
const caOf = (over: Record<string, unknown> = {}): Buffer => Buffer.from(`${JSON.stringify({ ...REC, ...over }, null, 2)}\n`);
const both = (more: Record<string, Record<string, string | Buffer>> = {}): string => rootOf({ "btc-dir-1h": "btc-dir-1h", "eth-range-4h": "eth-range-4h", [LIQ]: LIQ }, more);
type Run = { root?: string; probes?: Rec[]; caBytes?: Buffer; tE?: string; pinned?: string[] };
const run = (o: Run = {}): HistoryLine[] =>
  compose({ root: o.root ?? both(), releaseDir: DIR, mergeCommit: "a".repeat(40), tE: o.tE ?? TE, caBytes: o.caBytes ?? caOf(), probes: o.probes ?? KATA.map((c) => probe(c)), pinned: o.pinned ?? KATA });
const code = (c: string, message = "") => (e: Error & { code?: string }): boolean => e.code === c && e.message.includes(message);

// The composition test: the probe records as retire-probe writes them, and the trial deploy check record as verify-harness wrote it.
// killer: scripts/served-history.mjs:86 CONST "probe_record_sha256: sha(bytes)" -> "probe_record_sha256: sha(JSON.stringify(probe))"
test("served_history_line_is_closed_and_read_from_a_verdict", () => {
  const probes = KATA.map((c) => probe(c)), lines = run({ probes, caBytes: TRIAL });
  assert.equal(sha(TRIAL), "28aaa41bcf1ed53aac70a218bb43dd607ad4695f580e4b45cad3e9675d21b48d", "premise: the trial record, byte for byte");
  assert.deepEqual(lines, KATA.map((c, i) => ({ format: "kata-served-history-v1", release_dir: DIR, task_class: c, policy_table_sha256: sha(committed(c)),
    probe_record_sha256: sha(probes[i]!.bytes), merge_commit: "a".repeat(40), t_e: TE, t_f: TF, ca_record_sha256: sha(TRIAL) })), "one line per kata class, none for the marginal table; t_f cut to the second");
  assert.deepEqual(lines.map((l) => Object.keys(l).sort()), lines.map(() => [...FIELDS].sort()), "the closed field set");
  const text = render(null, lines);
  assert.equal(text, `[\n${lines.map((l) => canonicalJson(l)).join(",\n")}\n]\n`, "a JSON array, one canonical line per element");
  assert.deepEqual(JSON.parse(text), lines);
});

// killer: scripts/served-history.mjs:73 CONST "dated.flatMap(" -> "[releaseDir].flatMap("
test("served_history_writes_every_class_served_after_the_deployment", () => {
  const NO_DAY = "contract-1.1.0-tables-2026-02-30", tables = { "btc-dir-1h": "btc-dir-1h", "eth-range-4h": "eth-range-4h", [LIQ]: LIQ };
  const r = rootOf(tables, { [D2]: { "btc-dir-1h": changed("btc-dir-1h"), "sol-dir-1h": "sol-dir-1h" }, [NO_DAY]: { "bnb-dir-1h": "bnb-dir-1h" }, "contract-1.1.0": { "bnb-range-1h": "bnb-range-1h" } });
  const second = (probes: Rec[], o: { root?: string; releaseDir?: string } = {}): HistoryLine[] => compose({ root: o.root ?? r, releaseDir: o.releaseDir ?? D2, mergeCommit: "b".repeat(40),
    tE: at(27 * DAY), caBytes: caOf({ checked_at: `${at(27 * DAY + 1800).slice(0, -1)}.278Z` }), probes, pinned: ["btc-dir-1h", "eth-range-4h", "sol-dir-1h"] });
  const s = 27 * DAY + 3600, good = (): Rec[] => [probe("btc-dir-1h", { d: D2, bytes: changed("btc-dir-1h"), s }), probe("eth-range-4h", { s }), probe("sol-dir-1h", { d: D2, s })];
  let lines: HistoryLine[] = [];
  // killer: scripts/served-history.mjs:73 CONST "existsSync(p) ? " -> "true ? "
  const early = join(r, "spec", "contract-1.1.0-tables-2026-10-19", "retire"); mkdirSync(early, { recursive: true }); writeFileSync(join(early, "retire-2026-10-19.json"), "{}\n"); // as --check passes it (its retire list only)
  // killer: scripts/served-history.mjs:73 CONST "f.endsWith(\".json\") && " -> ""
  mkdirSync(join(r, "spec", D2, "policy", "empty")); // an empty subdirectory of policy/, which --check passes too: it lists files only
  assert.doesNotThrow(() => { lines = second(good()); }, "a class carried from an earlier dated directory is still served; a dated directory that holds its retire list only, no policy/, and an empty subdirectory of policy/ are passed over");
  assert.deepEqual(lines.map((l) => [l.release_dir, l.task_class]), [[D2, "btc-dir-1h"], [D2, "eth-range-4h"], [D2, "sol-dir-1h"]], "a line for every class served after the deployment, none for an undated directory or one of no real day");
  const refused = (c: string, probes: Rec[], o: { root?: string; releaseDir?: string } = {}): void => { assert.throws(() => second(probes, o), code(c), c); };
  const file = rootOf(tables);
  writeFileSync(join(file, "spec", D2), "");
  for (const o of [{ releaseDir: "contract-1.1.0-tables-2026-11-03" }, { releaseDir: DIR }, { releaseDir: NO_DAY }, { root: file }, { root: rootOf(tables, { [D2]: { "btc-dir-1h": "btc-dir-1h", "sol-dir-1h": "sol-dir-1h" } }) }]) {
    refused("input_invalid", good(), o); // absent; not the last dated directory; no real day; a file; two directories that publish the same bytes
  }
  refused("class_not_once", good().slice(0, 2));
  refused("probe_other_table", [good()[0]!, probe("eth-range-4h", { d: D2, s }), good()[2]!]);
  refused("probe_other_table", [probe("btc-dir-1h", { s }), ...good().slice(1)]);
  refused("probe_other_table", [...good(), probe("bnb-dir-1h", { d: NO_DAY, s })]);
});

// killer: scripts/served-history.mjs:77 CONST "}, \"real\"));" -> "}, \"rehearsal\"));"
test("served_history_refuses_each_departure", () => {
  const refused = (c: string, o: Run, message = ""): void => { assert.throws(() => run(o), code(c, message), c); };
  const btc = (o: Parameters<typeof probe>[1]): Run => ({ probes: [probe("btc-dir-1h", o), probe("eth-range-4h")] });
  for (const over of [{ ok: false }, { problem: "digest_mismatch" }, { equal: false }, { format: "retire-probe-v2" }, { status: 500 }, { tls_authorized: false },
    { api: "http://127.0.0.1:3001", tls_authorized: null }, { api: "https://localhost" }, { api_host: "" }]) refused("probe_not_accepted", btc({ over }));
  // received_at a real UTC second (unreadable, an offset, no Z, which Date.parse reads in the machine's zone), received_at_ms an instant of
  // that second in the writing of judge() (unreadable, an offset, another second): both are read before any comparison.
  const sec = at(3600), ms = new Date(Date.parse(REC.checked_at) + 3_600_000).toISOString(); // the record's received_at and received_at_ms
  for (const over of [{ received_at: "not a date" }, { received_at: `${sec.slice(0, -1)}+00:00` }, { received_at: sec.slice(0, -1) }, { received_at: at(3599) }, { received_at: at(3601) },
    { received_at_ms: "not a date" }, { received_at_ms: ms.replace("Z", "+00:00") }]) refused("probe_not_accepted", btc({ over }));
  for (const over of [{ api: "https://staging.monarkgate.tech" }, { api_host: "staging.monarkgate.tech" }]) refused("probe_other_host", btc({ over }));
  for (const url of ["https://staging.monarkgate.tech", [REC.url]]) refused("probe_other_host", { caBytes: caOf({ url }) }); // another host; a url not a string
  refused("probe_other_table", btc({ over: { table: `spec/${DIR}/policy/eth-range-4h.json` } }));
  refused("probe_other_table", btc({ over: { table: [`spec/${DIR}/policy/btc-dir-1h.json`] } }));
  // A record of a class that is not served, with its table forged where a lookup of that class lands (spec/undefined/..., and for the
  // inherited key constructor spec/function Object() { [native code] }/...): refused by name; without the served-class check, three lines.
  for (const [c, d] of [["xyz-range-1h", "undefined"], ["constructor", String(Object)]] as const) {
    const bytes = Buffer.from(committed("eth-range-4h").toString("utf8").replaceAll("eth-range-4h", c));
    refused("probe_other_table", { root: both({ [d]: { [c]: bytes } }), probes: [...KATA.map((k) => probe(k)), probe(c, { d, bytes })] });
  }
  refused("probe_other_class", { root: rootOf({ "btc-dir-1h": "btc-dir-1h", "eth-range-4h": "btc-dir-4h" }), probes: [probe("btc-dir-1h"), probe("btc-dir-4h", { over: { task_class: "eth-range-4h", table: `spec/${DIR}/policy/eth-range-4h.json` } })] });
  refused("digest_mismatch", btc({ over: { policy_table_sha256: sha(committed("btc-dir-4h")) } }));
  for (const s of [-1, -0.2]) refused("probe_before_ca", btc({ s })); // a second, then 200 ms, before checked_at
  refused("class_not_once", { probes: [probe("btc-dir-1h")] });
  refused("class_not_once", { probes: [...KATA.map((c) => probe(c)), probe("btc-dir-1h")] });
  for (const over of [{ checks: [] }, { checks: REC.checks.slice(0, 1) }, { checks: [{ ...REC.checks[0], ok: false }, ...REC.checks.slice(1)] }, { tls: { ...REC.tls, authorized: false } },
    { tls_mcp: { ...REC.tls, authorized: false } }, { tls: { host: "127.0.0.1", skipped: true }, tls_mcp: { host: "127.0.0.1", skipped: true } }]) refused("ca_not_green", { caBytes: caOf(over) });
  // killer: scripts/served-history.mjs:71 CONST "Number.isNaN(caMs)" -> "false"
  for (const c of [REC.checked_at.slice(0, -1), REC.checked_at.replace("Z", "+00:00")]) refused("ca_not_green", { caBytes: caOf({ checked_at: c }) }, "toISOString"); // no Z, read in the machine's zone; an offset
  refused("line_invalid", { tE: at(1) });
  refused("served_not_pinned", { pinned: ["btc-dir-1h"] });
  refused("served_not_pinned", { pinned: [...KATA, "sol-dir-1h"] });
  for (const o of [{ tE: TF }, btc({ s: 0 }), btc({ over: { table: `spec\\${DIR}\\policy\\btc-dir-1h.json` } }), btc({ over: { table: `./spec/${DIR}/policy/btc-dir-1h.json` } })]) {
    assert.equal(run(o).length, 2, "t_e = t_f, a record received at T_f, a Windows or a ./ path: taken");
  }
  // Route (b): the liquidation release serves no kata table. retire-probe makes no record of its table, so the writer is not run for it
  // (no record, no line); kata records given on its directory are refused, by name.
  assert.throws(() => call(committed(LIQ), "kata:p@v/BTCUSDT/1h/b0", 0), code("table_invalid"), "premise: no probe record of a marginal table");
  refused("no_kata_table", { root: rootOf({ [LIQ]: LIQ }), probes: [], pinned: [] });
  refused("probe_other_table", { root: rootOf({ [LIQ]: LIQ }), pinned: [] }, "btc-dir-1h.probe.json");
});

// killer: scripts/served-history.mjs:99 CONST "o.release_dir === l.release_dir && " -> ""
test("served_history_file_is_one_line_per_class_sorted_and_closed", () => {
  const first = run(), text = render(null, first), later = { ...first[0]!, release_dir: D2, t_e: at(27 * DAY), t_f: at(27 * DAY + 1800) };
  let next = "";
  assert.doesNotThrow(() => { next = render(Buffer.from(text), [later]); }, "a later deployment of a class is a new pair");
  assert.deepEqual(JSON.parse(next), [...first, later], "a later deployment of a class adds its line after the earlier ones");
  assert.deepEqual((JSON.parse(render(Buffer.from(next), [{ ...later, task_class: "aaa-dir-1h" }])) as HistoryLine[]).map((l) => l.task_class), [...KATA, "aaa-dir-1h", "btc-dir-1h"], "sorted by (t_e, task_class)");
  const refused = (c: string, existing: string, lines: HistoryLine[] = [later]): void => { assert.throws(() => render(Buffer.from(existing), lines), code(c), c); };
  const canon = (ls: object[]): string => `[\n${ls.map((l) => canonicalJson(l)).join(",\n")}\n]\n`, l0 = first[0]! as unknown as Record<string, unknown>;
  refused("pair_written", text, [first[1]!]);
  assert.throws(() => render(null, [first[0]!, first[0]!]), code("pair_written"), "a pair twice in the lines given");
  refused("history_invalid", canon([first[1]!, first[0]!]));
  refused("history_invalid", JSON.stringify(first));
  for (const t of ["[]", "{}", "[\n\n]\n"]) refused("history_invalid", t);
  for (const [k, v] of [["t_e", at(-1800)], ["t_f", at(1800)], ["merge_commit", "b".repeat(40)], ["ca_record_sha256", "c".repeat(64)]]) refused("history_invalid", canon([first[0]!, { ...first[1]!, [k!]: v }]));
  for (const k of FIELDS) refused("line_invalid", canon([{ ...l0, [k]: [l0[k]] }])); // each field, a string of its form only
  for (const [k, v] of [["t_e", `${TE.slice(0, -1)}.000Z`], ["t_e", "2026-02-30T00:00:00Z"], ["t_e", "2026-10-05T25:00:00Z"], ["release_dir", "contract-1.1.0-tables-2026-02-30"], ["ca_record_sha256", "c".repeat(63)]]) {
    refused("line_invalid", canon([{ ...l0, [k!]: v }]));
  }
  refused("line_invalid", canon([{ ...l0, release: DIR }]));
  // killer: scripts/served-history.mjs:60 CONST "str(l.release_dir, DIR)" -> "DIR.test(l.release_dir)"
  assert.throws(() => checkLine({ ...l0, release_dir: new String(DIR) }), code("line_invalid"), "a String object is not a string (checkLine is exported: no JSON in between)");
});

// killer: scripts/served-history.mjs:110 CONST "--format=%H %cI %P" -> "--format=%H %aI %P"
test("served_history_cli_reads_t_e_from_the_merge_commit", async (t) => {
  const said = t.mock.method(console, "error", () => undefined), last = (): string => String(said.mock.calls.at(-1)?.arguments[0]);
  const r = both(), clean = Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_"))); // no inherited GIT_* variable
  let dates = { GIT_AUTHOR_DATE: at(-5400), GIT_COMMITTER_DATE: TE };
  const git = (...a: string[]): string => execFileSync("git", ["-C", r, "-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...a], { encoding: "utf8", env: { ...clean, ...dates } }).trim();
  const merge = (branch: string, paths: string[]): string => {
    git("checkout", "-q", "-b", branch, "main");
    if (paths.length > 0) git("add", ...paths);
    git("commit", "-q", "--allow-empty", "-m", branch); git("checkout", "-q", "main"); git("commit", "-q", "--allow-empty", "-m", `before ${branch}`); git("merge", "-q", "--no-ff", "-m", branch, branch);
    return git("rev-parse", "HEAD");
  };
  git("init", "-q", "-b", "main"); git("commit", "-q", "--allow-empty", "-m", "base");
  const m0 = merge("early", []);
  git("checkout", "-q", "-b", "inner", "main"); git("add", "spec"); git("commit", "-q", "-m", "inner"); // spec/DIR comes to side by a merge,
  git("checkout", "-q", "-b", "side", "main"); git("merge", "-q", "--no-ff", "-m", "inner", "inner"); // reachable from main by a second parent only
  const sideMerge = git("rev-parse", "HEAD");
  git("checkout", "-q", "main"); git("commit", "-q", "--allow-empty", "-m", "before side"); git("merge", "-q", "--no-ff", "-m", "side", "side");
  const m1 = git("rev-parse", "HEAD");
  git("tag", "-a", "-m", "t", "t", m1);
  git("checkout", "-q", "--detach", `${m1}^1`); git("merge", "-q", "--no-ff", "-m", "test merge", "side"); // as a test merge: on no branch
  const offTrunk = git("rev-parse", "HEAD");
  for (const b of ["o1", "o2"]) { git("checkout", "-q", "-b", b, "main"); git("commit", "-q", "--allow-empty", "-m", b); }
  git("checkout", "-q", "main"); git("merge", "-q", "--no-ff", "-m", "octopus", "o1", "o2");
  const octopus = git("rev-parse", "HEAD"), refusedAs = (c: string, commit: string, message = ""): void => { assert.throws(() => mergeInstant(r, commit, DIR), code(c, message), `${c} ${commit}`); };
  refusedAs("not_a_merge", git("rev-parse", `${m1}^1`));
  refusedAs("not_a_merge", "--no-such-option", "40 hex");
  refusedAs("not_a_merge", git("rev-parse", "--short", m1), "40 hex");
  refusedAs("not_a_merge", git("rev-parse", "t"), "not the id of a commit");
  refusedAs("not_a_merge", octopus, "3 parent(s)");
  refusedAs("merge_not_release", m0); // an earlier merge: spec/DIR is not in it
  for (const off of [offTrunk, sideMerge]) refusedAs("merge_not_on_trunk", off);
  process.env.GIT_DIR = join(TMP, "nowhere"); // an inherited GIT_* variable, a hook's say: never passed on to git
  try { assert.equal(mergeInstant(r, m1, DIR), TE, "t_e is the committer date of the merge commit, not its author date"); } finally { delete process.env.GIT_DIR; }
  const record = (name: string, bytes: string | Buffer): string => { const f = join(TMP, `${n}-${name}`); writeFileSync(f, bytes); return f; };
  const pins = (cs: string[]): { pins: string } => ({ pins: pathToFileURL(record(`pins${cs.length}.mjs`, `export const COMMITTED_TABLES = ${JSON.stringify(Object.fromEntries(cs.map((c) => [c, sha(c)])))};\n`)).href });
  const ca = record("ca.json", caOf()), files = KATA.map((c) => record(`${c}.json`, probe(c).bytes));
  const args = (commit: string, dir = DIR, check = ca, probes = files): string[] => ["--root", r, "--release-dir", dir, "--merge-commit", commit, "--ca", check, ...probes.flatMap((f) => ["--probe", f])];
  assert.equal(PINS, pathToFileURL(join(ROOT, "apps", "harness", "src", "policy-committed-pins.ts")).href, "the pins are those of the served module");
  assert.equal(await main(args(m1)), 1);
  assert.match(last(), existsSync(fileURLToPath(PINS)) ? /^served-history refused: served_not_pinned:/ : /^served-history refused: pins_unreadable:/, "the served module's pins by default: unreadable until the loader lands, then none of these classes");
  // killer: scripts/served-history.mjs:123 CONST "argv[i] === `--${o}`" -> "argv[i]?.replace(/^--/, \"\") === o"
  // killer: scripts/served-history.mjs:124 CONST "Object.hasOwn(a, k) || " -> ""
  // killer: scripts/served-history.mjs:124 CONST " || v === \"\"" -> ""
  for (const argv of [args(m1).slice(0, 8), [...args(m1), "--probe"], ["--bogus", "x", ...args(m1)], args(m1).map((x) => x.replace(/^--/, "")), [...args(m1), "--ca", ca],
    [...args(m1), "--probe", ""]]) assert.equal(await main(argv), 2, `usage: ${argv.slice(-2).join(" ")}`); // no record; a flag without its value; an unknown flag; names without --; --ca twice; an empty value
  assert.equal(await main(args(m1), pins(KATA)), 0);
  const out = readFileSync(join(r, HISTORY_REL), "utf8");
  assert.deepEqual((JSON.parse(out) as HistoryLine[]).map((l) => [l.task_class, l.t_e, l.merge_commit]), KATA.map((c) => [c, TE, m1]));
  assert.equal(await main(args(m1), pins(KATA)), 1, "the same deployment is never written twice");
  assert.equal(readFileSync(join(r, HISTORY_REL), "utf8"), out, "a refusal leaves the file as it was");
  // A second deployment, written over the file: D2 serves sol-dir-1h anew and carries the two classes of DIR.
  mkdirSync(join(r, "spec", D2, "policy"), { recursive: true });
  writeFileSync(join(r, "spec", D2, "policy", "sol-dir-1h.json"), committed("sol-dir-1h"));
  dates = { GIT_AUTHOR_DATE: at(27 * DAY - 5400), GIT_COMMITTER_DATE: at(27 * DAY) };
  const m2 = merge("side2", ["spec"]), s = 27 * DAY + 3600;
  refusedAs("merge_not_release", m2); // spec/DIR is in its first parent already
  const later = [probe("btc-dir-1h", { s }), probe("eth-range-4h", { s }), probe("sol-dir-1h", { d: D2, s })].map((p, i) => record(`later${i}.json`, p.bytes));
  // killer: scripts/served-history.mjs:133 CONST "writeAtomic(out, text)" -> "(await import(\"node:fs\")).writeFileSync(out, text)"
  const ino = statSync(join(r, HISTORY_REL), { bigint: true }).ino; // the file the first deployment wrote
  assert.equal(await main(args(m2, D2, record("ca2.json", caOf({ checked_at: `${at(27 * DAY + 1800).slice(0, -1)}.278Z` })), later), pins([...KATA, "sol-dir-1h"])), 0);
  assert.notEqual(statSync(join(r, HISTORY_REL), { bigint: true }).ino, ino, "the file is replaced by a rename (writeAtomic), never written in place");
  assert.deepEqual((JSON.parse(readFileSync(join(r, HISTORY_REL), "utf8")) as HistoryLine[]).map((l) => [l.release_dir, l.task_class, l.t_e]),
    [...KATA.map((c) => [DIR, c, TE]), ...[...KATA, "sol-dir-1h"].map((c) => [D2, c, at(27 * DAY)])], "the second deployment's lines follow the first's");
});
