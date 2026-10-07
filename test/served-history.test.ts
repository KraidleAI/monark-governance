// test/served-history.test.ts -- the writer of the served history (scripts/served-history.mjs, format kata-served-history-v1): one closed
// line per (deployment, kata class), whose table digest is read from that class's retire-probe-v1 record; a marginal table has no line.
// Offline: every root is a copy under the OS temp directory, built from the committed tables of spec/contract-1.1.0/policy/; the probe
// and deploy check records are synthetic, with the fields the writer reads. Each test names on the line above it the production mutation
// that reddens it (scripts/red-proof.mjs).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson } from "../scripts/spec-publish.mjs";
import { compose, FIELDS, HISTORY_REL, main, render } from "../scripts/served-history.mjs";
import type { HistoryLine } from "../scripts/served-history.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url)), DIR = "contract-1.1.0-tables-2026-10-20", TE = "2026-10-20T08:00:00Z";
const LIQ = "liquidation-eligible-coverage", KATA = ["btc-dir-1h", "eth-range-4h"], TMP = mkdtempSync(join(tmpdir(), "served-history-"));
after(() => rmSync(TMP, { recursive: true, force: true }));
const sha = (b: string | Uint8Array): string => createHash("sha256").update(b).digest("hex");
const committed = (c: string): Buffer => readFileSync(join(ROOT, "spec", "contract-1.1.0", "policy", `${c}.json`));
let n = 0;
/** A root whose dated directories hold the given files (name -> class whose committed bytes it gets); DIR by default. */
function rootOf(files: Record<string, string>, more: Record<string, Record<string, string>> = {}): string {
  const r = join(TMP, `r${++n}`);
  for (const [d, fs] of Object.entries({ [DIR]: files, ...more })) {
    mkdirSync(join(r, "spec", d, "policy"), { recursive: true });
    for (const [name, c] of Object.entries(fs)) writeFileSync(join(r, "spec", d, "policy", `${name}.json`), committed(c));
  }
  return r;
}
const probe = (c: string, over: Record<string, unknown> = {}): { name: string; bytes: Buffer } => ({ name: `${c}.probe.json`, bytes: Buffer.from(JSON.stringify({
  format: "retire-probe-v1", task_class: c, table: `spec/${DIR}/policy/${c}.json`, received_at: "2026-10-20T09:00:00Z", ok: true, equal: true, problem: null,
  policy_table_sha256: sha(committed(c)), policy_row_sha256: "f".repeat(64), ...over })) });
const caOf = (over: Record<string, unknown> = {}): Buffer => Buffer.from(JSON.stringify({ checked_at: "2026-10-20T08:30:00.000Z", checks: [{ name: "health", ok: true }], tls: { authorized: true }, tls_mcp: { authorized: true }, ...over }));
const both = (): string => rootOf({ "btc-dir-1h": "btc-dir-1h", "eth-range-4h": "eth-range-4h", [LIQ]: LIQ });
const run = (o: { root?: string; probes?: { name: string; bytes: Buffer }[]; caBytes?: Buffer; tE?: string } = {}): HistoryLine[] =>
  compose({ root: o.root ?? both(), releaseDir: DIR, mergeCommit: "a".repeat(40), tE: o.tE ?? TE, caBytes: o.caBytes ?? caOf(), probes: o.probes ?? KATA.map((c) => probe(c)) });

// killer: scripts/served-history.mjs:64 CONST "probe.policy_table_sha256, probe_record_sha256" -> "probe.policy_row_sha256, probe_record_sha256"
test("served_history_line_is_closed_and_read_from_a_verdict", () => {
  const probes = KATA.map((c) => probe(c)), ca = caOf(), lines = run({ probes, caBytes: ca });
  assert.deepEqual(lines, KATA.map((c, i) => ({ format: "kata-served-history-v1", release_dir: DIR, task_class: c, policy_table_sha256: sha(committed(c)),
    probe_record_sha256: sha(probes[i]!.bytes), merge_commit: "a".repeat(40), t_e: TE, t_f: "2026-10-20T08:30:00.000Z", ca_record_sha256: sha(ca) })), "one line per kata class, none for the marginal table");
  assert.deepEqual(lines.map((l) => Object.keys(l).sort()), lines.map(() => [...FIELDS].sort()), "the closed field set");
  const text = render(null, lines);
  assert.equal(text, `[\n${lines.map((l) => canonicalJson(l)).join(",\n")}\n]\n`, "a JSON array, one canonical line per element");
  assert.deepEqual(JSON.parse(text), lines);
});

// killer: scripts/served-history.mjs:51 ROR "x <= releaseDir" -> "x === releaseDir"
test("served_history_writes_every_class_served_after_the_deployment", () => {
  const D2 = "contract-1.1.0-tables-2026-11-02", r = rootOf({ "btc-dir-1h": "btc-dir-1h", "eth-range-4h": "eth-range-4h", [LIQ]: LIQ },
    { [D2]: { "btc-dir-1h": "btc-dir-1h", "sol-dir-1h": "sol-dir-1h" }, "contract-1.1.0-tables-2026-12-01": { "bnb-dir-1h": "bnb-dir-1h" }, "contract-1.1.0": { "bnb-range-1h": "bnb-range-1h" } });
  const at = (c: string, d: string): string => `spec/${d}/policy/${c}.json`, tE = "2026-11-02T08:00:00Z";
  const second = (probes: { name: string; bytes: Buffer }[]): HistoryLine[] => compose({ root: r, releaseDir: D2, mergeCommit: "b".repeat(40), tE, caBytes: caOf({ checked_at: "2026-11-02T08:30:00.000Z" }), probes });
  const good = (): { name: string; bytes: Buffer }[] => [probe("btc-dir-1h", { table: at("btc-dir-1h", D2), received_at: "2026-11-02T09:00:00Z" }),
    probe("eth-range-4h", { received_at: "2026-11-02T09:00:00Z" }), probe("sol-dir-1h", { table: at("sol-dir-1h", D2), received_at: "2026-11-02T09:00:00Z" })];
  let lines: HistoryLine[] = [];
  assert.doesNotThrow(() => { lines = second(good()); }, "a class carried from an earlier dated directory is still served");
  assert.deepEqual(lines.map((l) => [l.release_dir, l.task_class]), [[D2, "btc-dir-1h"], [D2, "eth-range-4h"], [D2, "sol-dir-1h"]], "a line for every class served after the deployment, none for a later or undated directory");
  assert.throws(() => compose({ root: r, releaseDir: "contract-1.1.0-tables-2026-11-03", mergeCommit: "b".repeat(40), tE, caBytes: caOf(), probes: good() }), (e: Error & { code?: string }) => e.code === "input_invalid", "a release directory that is not there");
  const refused = (code: string, probes: { name: string; bytes: Buffer }[]): void => { assert.throws(() => second(probes), (e: Error & { code?: string }) => e.code === code, code); };
  refused("class_not_once", good().slice(0, 2));
  refused("probe_other_table", [good()[0]!, probe("eth-range-4h", { table: at("eth-range-4h", D2), received_at: "2026-11-02T09:00:00Z" }), good()[2]!]);
  refused("probe_other_table", [probe("btc-dir-1h", { received_at: "2026-11-02T09:00:00Z" }), ...good().slice(1)]);
  refused("probe_other_table", [...good(), probe("bnb-dir-1h", { table: at("bnb-dir-1h", "contract-1.1.0-tables-2026-12-01"), received_at: "2026-11-02T09:00:00Z" })]);
});

// killer: scripts/served-history.mjs:58 COR "probe.ok !== true || " -> ""
test("served_history_refuses_each_departure", () => {
  const refused = (code: string, o: Parameters<typeof run>[0]): void => { assert.throws(() => run(o), (e: Error & { code?: string }) => e.code === code, code); };
  refused("probe_not_accepted", { probes: [probe("btc-dir-1h", { ok: false }), probe("eth-range-4h")] });
  refused("probe_not_accepted", { probes: [probe("btc-dir-1h", { problem: "digest_mismatch" }), probe("eth-range-4h")] });
  refused("probe_not_accepted", { probes: [probe("btc-dir-1h", { equal: false }), probe("eth-range-4h")] });
  refused("probe_other_table", { probes: [probe("btc-dir-1h", { table: `spec/${DIR}/policy/eth-range-4h.json` }), probe("eth-range-4h")] });
  refused("probe_other_table", { probes: [...KATA.map((c) => probe(c)), probe(LIQ)] });
  refused("probe_other_class", { root: rootOf({ "btc-dir-1h": "btc-dir-1h", "eth-range-4h": "btc-dir-4h" }), probes: [probe("btc-dir-1h"), probe("eth-range-4h", { policy_table_sha256: sha(committed("btc-dir-4h")) })] });
  refused("digest_mismatch", { probes: [probe("btc-dir-1h", { policy_table_sha256: sha(committed("btc-dir-4h")) }), probe("eth-range-4h")] });
  refused("probe_before_merge", { probes: KATA.map((c) => probe(c)), tE: "2026-10-20T09:00:01Z" });
  refused("class_not_once", { probes: [probe("btc-dir-1h")] });
  refused("class_not_once", { probes: [...KATA.map((c) => probe(c)), probe("btc-dir-1h")] });
  refused("ca_not_green", { caBytes: caOf({ checks: [{ name: "health", ok: true }, { name: "gate_kata_call", ok: false }] }) });
  refused("ca_not_green", { caBytes: caOf({ tls_mcp: { authorized: false } }) });
  refused("line_invalid", { caBytes: caOf({ checked_at: "2026-10-20T07:59:59.000Z" }) });
  refused("no_kata_table", { root: rootOf({ [LIQ]: LIQ }), probes: [probe(LIQ)] });
});

// killer: scripts/served-history.mjs:76 COR "o.release_dir === l.release_dir && " -> ""
test("served_history_file_is_one_line_per_class_sorted_and_closed", () => {
  const first = run(), text = render(null, first), later = { ...first[0]!, release_dir: "contract-1.1.0-tables-2026-11-02", t_e: "2026-11-02T08:00:00Z", t_f: "2026-11-02T08:30:00.000Z" };
  let next = "";
  assert.doesNotThrow(() => { next = render(Buffer.from(text), [later]); }, "a later deployment of a class is a new pair");
  assert.deepEqual(JSON.parse(next), [...first, later], "a later deployment of a class adds its line after the earlier ones");
  assert.deepEqual((JSON.parse(render(Buffer.from(next), [{ ...later, task_class: "aaa-dir-1h" }])) as HistoryLine[]).map((l) => l.task_class), [...KATA, "aaa-dir-1h", "btc-dir-1h"], "sorted by (t_e, task_class)");
  const refused = (code: string, existing: string, lines: HistoryLine[] = [later]): void => { assert.throws(() => render(Buffer.from(existing), lines), (e: Error & { code?: string }) => e.code === code, code); };
  refused("pair_written", text, [first[1]!]);
  refused("history_invalid", `[\n${[first[1], first[0]].map((l) => canonicalJson(l)).join(",\n")}\n]\n`);
  refused("history_invalid", JSON.stringify(first));
  refused("history_invalid", "[]");
  refused("line_invalid", `[\n${canonicalJson({ ...first[0]!, task_class: [KATA[0]] })}\n]\n`);
  refused("line_invalid", `[\n${canonicalJson({ ...first[0]!, release: DIR })}\n]\n`);
});

// killer: scripts/served-history.mjs:83 ROR "parents.length < 2" -> "parents.length < 1"
test("served_history_cli_reads_t_e_from_the_merge_commit", () => {
  const r = both(), env = { ...process.env, GIT_AUTHOR_DATE: TE, GIT_COMMITTER_DATE: TE };
  const git = (...a: string[]): string => execFileSync("git", ["-C", r, "-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...a], { encoding: "utf8", env }).trim();
  git("init", "-q", "-b", "main"); git("add", "."); git("commit", "-q", "-m", "base"); git("checkout", "-q", "-b", "side"); git("commit", "-q", "--allow-empty", "-m", "side");
  git("checkout", "-q", "main"); git("commit", "-q", "--allow-empty", "-m", "main"); git("merge", "-q", "--no-ff", "-m", "merge", "side");
  const files = KATA.map((c) => { const f = join(TMP, `${c}.${n}.probe.json`); writeFileSync(f, probe(c).bytes); return f; }), ca = join(TMP, `ca.${n}.json`);
  writeFileSync(ca, caOf());
  const args = (commit: string): string[] => ["--root", r, "--release-dir", DIR, "--merge-commit", commit, "--ca", ca, ...files.flatMap((f) => ["--probe", f])];
  assert.equal(main(args(git("rev-parse", "HEAD^1"))), 1, "a commit with one parent is no merge commit");
  assert.equal(main(args(git("rev-parse", "--short", "HEAD"))), 1, "the merge commit is named by its full sha");
  assert.equal(main(args(git("rev-parse", "HEAD"))), 0);
  const out = readFileSync(join(r, HISTORY_REL), "utf8");
  assert.deepEqual((JSON.parse(out) as HistoryLine[]).map((l) => [l.task_class, l.t_e, l.merge_commit]), KATA.map((c) => [c, TE, git("rev-parse", "HEAD")]));
  assert.equal(main(args(git("rev-parse", "HEAD"))), 1, "the same deployment is never written twice");
  assert.equal(readFileSync(join(r, HISTORY_REL), "utf8"), out, "a refusal leaves the file as it was");
});
