// test/retire-instants.test.ts -- item RETIRE-INSTANTS-1 (lot RH-1; docs/G0-lot-retire-latency-rehearsal-1.md section 8): the
// retire-latency-v1 entry assembled from its evidence. The readers are injected, except in the test of the committer date, which makes
// a repository in a temporary directory (git -C only, the host's config out). The CA records are rated by scripts/verify-harness.mjs
// itself; the probe records are those scripts/retire-probe.mjs writes. The tool is loaded on demand, so the base (no tool) reddens by
// assertion. The line above each test names the mutation that reddens it (scripts/red-proof.mjs convention).
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { report } from "../scripts/retire-latency.mjs";
import { canonicalJson, type PolicyTable, type Prediction } from "@monark/contracts";
import { runGate, SERVED_POLICY_TABLES, type HarnessParams } from "../apps/harness/src/tools/gate.ts";
import { policyTableSha256 } from "../apps/harness/src/policy-table-file.ts";

type Instants = typeof import("../scripts/retire-instants.mjs");
const TMP = mkdtempSync(join(tmpdir(), "retire-instants-"));
after(() => { rmSync(TMP, { recursive: true, force: true, maxRetries: 3 }); });
const SHA = (c: string): string => c.repeat(40);
async function load(): Promise<Instants> {
  try {
    return await import("../scripts/retire-instants.mjs");
  } catch (e) {
    return assert.fail(`scripts/retire-instants.mjs loads: ${e instanceof Error ? e.message : String(e)}`);
  }
}
const SOURCES = {
  T_a: { commit: SHA("a"), repo: "recherches" }, T_b: { commit: SHA("b"), repo: "gov" }, T_c: { clock: "2027-01-04T11:00:00Z" }, T_d: { clock: "2027-01-04T12:00:00Z" },
  T_e: { commit: SHA("e"), repo: "gov" }, T_f: { ca: "ca.json.local" }, T_g: { probe: "probe.json" },
};
const DATES: Record<string, string> = { [SHA("a")]: `2027-01-04T10:00:00+01:00 ${SHA("9")}`, [SHA("b")]: `2027-01-04T10:30:00Z ${SHA("a")}`, [SHA("e")]: `2027-01-04T15:00:00+02:00 ${SHA("b")} ${SHA("c")}`, [SHA("f")]: `2027-01-04T15:00:00+02:00 ${SHA("b")}` };
/** The 15 checks verify-harness makes, read in its source as test/surfaces-1-1-0.test.ts reads them, all ok. */
const NAMES = ((s: string) => [...s.matchAll(/(?:wiredCheck|httpCheck)\("(\w+)"/g), ...s.matchAll(/\["(gate_\w+_call)", GATE_\w+_BODY,/g)].map((m) => m[1] ?? ""))(readFileSync(join(import.meta.dirname, "..", "scripts", "verify-harness.mjs"), "utf8"));
const ca = (tls: object, names: string[] = NAMES) => ({ checked_at: "2027-01-04T14:00:00.999Z", checks: names.map((name) => ({ name, ok: true })), tls, tls_mcp: tls });
const LOCAL = { host: "127.0.0.1", skipped: true }, AUTHORIZED = { host: "api.example", authorized: true }, REFUSED = { host: "api.example", authorized: false };
const ACCEPTED = { format: "retire-probe-v1", api: "https://203.0.113.7", api_host: "api.monarkgate.tech", received_at: "2027-01-04T15:00:01Z", status: 200, equal: true, ok: true, problem: null };
const FILES: Record<string, unknown> = { "ca.json.local": ca(LOCAL), "ca.json": ca(AUTHORIZED), "probe.json": ACCEPTED };
const io = (files = FILES) => ({ git: (_repo: string, sha: string): string => DATES[sha] ?? assert.fail(sha), read: (f: string): unknown => files[f] ?? assert.fail(f) });
const evidence = (sources: object = SOURCES, cycle = "rehearsal") => ({ format: "retire-evidence-v1", cycle, sources, mention: null });

// reddened by: an instant read from another source than its kind, a commit date or a CA instant not brought to the UTC second, or an
// entry that the report refuses
// killer: scripts/retire-instants.mjs:27 CONST "Math.floor(ms / 1000)" -> "Math.round(ms / 1000)"
test("retire_instants_reads_each_source_into_the_entry", async () => {
  const t = await load(), e = t.entry(evidence(), io());
  assert.deepEqual(e, { format: "retire-latency-v1", cycle: "rehearsal", mention: null, instants: {
    T_a: "2027-01-04T09:00:00Z", T_b: "2027-01-04T10:30:00Z", T_c: "2027-01-04T11:00:00Z", T_d: "2027-01-04T12:00:00Z", T_e: "2027-01-04T13:00:00Z", T_f: "2027-01-04T14:00:00Z", T_g: "2027-01-04T15:00:01Z",
  } });
  assert.equal(report(e).total_ms, 6 * 3_600_000 + 1000, "the report accepts the entry");
  assert.equal(t.entry(evidence({ ...SOURCES, T_a: { clock: "2027-01-01T00:00:00Z" }, T_f: { ca: "ca.json" } }, "real"), io()).instants["T_a"], "2027-01-01T00:00:00Z", "T_a of live:<k> is a clock");
});

// reddened by: the author date read in place of the committer date (a rebase keeps the author date old), or a GIT_* variable obeyed
// killer: scripts/retire-instants.mjs:35 CONST "--format=%cI" -> "--format=%aI"
test("retire_instants_takes_the_committer_date_not_the_author_date", async () => {
  const t = await load(), repo = join(TMP, "repo"), env = { ...Object.fromEntries(Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_"))), GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: "", GIT_AUTHOR_NAME: "F", GIT_AUTHOR_EMAIL: "f@example.invalid", GIT_COMMITTER_NAME: "F", GIT_COMMITTER_EMAIL: "f@example.invalid" };
  const git = (...a: string[]): string => { const r = spawnSync("git", ["-C", TMP, ...a], { encoding: "utf8", env: { ...env, GIT_AUTHOR_DATE: "2026-01-01T00:00:00+02:00", GIT_COMMITTER_DATE: "2027-01-04T10:05:04+02:00" } }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };
  git("init", "-q", "repo");
  writeFileSync(join(repo, "decision.md"), "- 2027-01-04: retire the row\n");
  git("-C", "repo", "add", "decision.md");
  git("-C", "repo", "commit", "-q", "-m", "decision");
  const sha = git("-C", "repo", "rev-parse", "HEAD");
  assert.equal(t.instant("T_a", { commit: sha, repo }), "2027-01-04T08:05:04Z", "the committer date, in UTC");
  assert.throws(() => t.instant("T_a", { commit: SHA("0"), repo }), (e: unknown) => (e as { code?: string }).code === "source_unreadable");
});

// reddened by: a red record (CA not green, probe of another digest) or a source of the wrong kind taken as an instant, or a refusal
// that the RUNBOOK does not cite
// killer: scripts/retire-instants.mjs:68 CONST "r.equal !== true ||" -> ""
test("retire_instants_refuses_unreadable_or_red_sources_by_code", async () => {
  const t = await load(), code = (ev: object, files = FILES): string => { try { t.entry(ev, io(files)); return "ok"; } catch (e) { return String((e as { code?: string }).code); } };
  const noProbe = Object.fromEntries(Object.entries(SOURCES).filter(([k]) => k !== "T_g"));
  assert.deepEqual([
    code({ ...evidence(), extra: 1 }), code(evidence({ ...SOURCES, T_c: { commit: SHA("b"), repo: "gov" } })), code(evidence({ ...SOURCES, T_b: { commit: "abc", repo: "gov" } })),
    code(evidence({ ...SOURCES, T_f: { ca: "missing.json" } })), code(evidence(), { ...FILES, "ca.json.local": { ...ca(LOCAL), checks: NAMES.map((name) => ({ name, ok: name !== "health" })) } }),
    code(evidence(), { ...FILES, "probe.json": { ...ACCEPTED, equal: false } }), code(evidence(noProbe)),
    code(evidence({ ...SOURCES, T_d: { clock: "2027-01-04T10:59:59Z" } })),
  ], ["evidence_invalid", "evidence_invalid", "evidence_invalid", "source_unreadable", "source_not_green", "source_not_green", "instant_missing", "order_not_monotone"]);
  const runbook = readFileSync(join(import.meta.dirname, "..", "docs", "RUNBOOK-harness.md"), "utf8").replace(/\s+/g, " ");
  assert.ok(["evidence_invalid", "source_unreadable", "source_not_green"].every((c) => runbook.includes(`\`${c}\``)) && runbook.includes("node scripts/retire-instants.mjs <evidence.json>"), "the RUNBOOK runs the tool and cites its refusals");
  assert.equal(t.main([]), 2, "usage exits 2");
});

// reddened by: a CA that verify-harness itself rates failed (TLS refused) or local taken in a real cycle, or a CA that lacks some of the
// 15 checks of the green gate, or holds one twice (16 entries), or an entry that is no object (null), taken for T_f
// killer: scripts/retire-instants.mjs:62 CONST "cycle === \"rehearsal\" ? [\"green\", \"local\"] : [\"green\"]" -> "[\"green\", \"local\"]"
test("retire_instants_takes_T_f_from_the_overall_verdict_of_verify_harness", async () => {
  const t = await load(), real = { ...SOURCES, T_a: { clock: "2027-01-01T00:00:00Z" }, T_f: { ca: "ca.json" } };
  const code = (ev: object, files: Record<string, unknown>): string => { try { return t.entry(ev, io({ ...FILES, ...files })).instants["T_f"] ?? "none"; } catch (e) { return String((e as { code?: string }).code); } };
  const { CHECK_NAMES } = (await import(new URL("../scripts/verify-harness.mjs", import.meta.url).href)) as { CHECK_NAMES: readonly string[] };
  assert.deepEqual([NAMES.length, [...CHECK_NAMES].sort()], [15, [...NAMES].sort()], "premise: verify-harness makes 15 checks, and CHECK_NAMES lists them all (a set: a pass makes the retired and future gate calls earlier)");
  assert.deepEqual([
    code(evidence(real, "real"), {}), code(evidence(real, "real"), { "ca.json": ca(REFUSED) }), code(evidence(real, "real"), { "ca.json": ca(LOCAL) }),
    code(evidence(), {}), code(evidence(), { "ca.json.local": ca(LOCAL, NAMES.slice(1)) }), code(evidence(), { "ca.json.local": { checked_at: "2027-01-04T14:00:00Z", checks: [] } }),
    code(evidence(), { "ca.json.local": ca(LOCAL, [...NAMES.slice(1), NAMES[1] ?? ""]) }), code(evidence(), { "ca.json.local": { ...ca(LOCAL), checks: [null, ...ca(LOCAL).checks] } }),
  ], ["2027-01-04T14:00:00Z", "source_not_green", "source_not_green", "2027-01-04T14:00:00Z", "source_not_green", "source_not_green", "source_not_green", "source_not_green"],
  "real: green only; rehearsal: green or local; always the 15 checks, and the TLS blocks read");
});

// reddened by: the record of a probe that the probe itself refused (here a retired cell answered under_calib at the right digest, so
// equal is true) taken for T_g
// killer: scripts/retire-instants.mjs:68 CONST "r.ok !== true || " -> ""
test("retire_instants_refuses_a_probe_record_the_probe_refused", async () => {
  const t = await load(), refused = { ...ACCEPTED, status: 200, equal: true, ok: false, problem: "reason_mismatch" }, forged = { ...ACCEPTED, status: 500 };
  const code = (record: object): string => { try { t.entry(evidence(), io({ ...FILES, "probe.json": record })); return "ok"; } catch (e) { return String((e as { code?: string }).code); } };
  assert.deepEqual([code(ACCEPTED), code(refused), code(forged), code({ ...ACCEPTED, ok: false })], ["ok", "source_not_green", "source_not_green", "source_not_green"], "an accepted 200 only, its ok read even with no problem named");
});

// reddened by: a CA of the 15 checks plus one of them twice (16 entries, all ok) taken for T_f: the length guard alone refuses it, every
// name being present
// killer: scripts/retire-instants.mjs:62 COR "names.length !== CHECK_NAMES.length || " -> ""
test("retire_instants_refuses_a_ca_with_a_check_twice", async () => {
  const t = await load(), code = (names: string[]): string => { try { return t.entry(evidence(), io({ ...FILES, "ca.json.local": ca(LOCAL, names) })).instants["T_f"] ?? "none"; } catch (e) { return String((e as { code?: string }).code); } };
  assert.deepEqual([code(NAMES), code([...NAMES, "health"]), code([...NAMES, "bogus_call"])], ["2027-01-04T14:00:00Z", "source_not_green", "source_not_green"], "the 15 checks, no more");
});

// reddened by: a probe record that names a problem taken for T_g, whatever its ok (the header reads ok true and problem null)
// killer: scripts/retire-instants.mjs:68 CONST "r.problem !== null || " -> ""
test("retire_instants_reads_the_problem_of_the_probe_record", async () => {
  const t = await load(), code = (record: object): string => { try { return t.entry(evidence(), io({ ...FILES, "probe.json": record })).instants["T_g"] ?? "none"; } catch (e) { return String((e as { code?: string }).code); } };
  assert.deepEqual([code(ACCEPTED), code({ ...ACCEPTED, problem: "reason_mismatch" })], ["2027-01-04T15:00:01Z", "source_not_green"], "problem null only");
});

// reddened by: a probe of a local listener (http, or the loopback) taken for T_g in a real or publication cycle, while a local CA is
// refused there (T_f): the rehearsal takes it, as it takes a local CA
// killer: scripts/retire-instants.mjs:71 CONST "cycle !== \"rehearsal\" && " -> "false && "
test("retire_instants_refuses_a_local_probe_outside_a_rehearsal", async () => {
  const t = await load(), real = { ...SOURCES, T_a: { clock: "2027-01-01T00:00:00Z" }, T_f: { ca: "ca.json" } }, publication = { T_c: SOURCES.T_c, T_d: SOURCES.T_d, T_e: SOURCES.T_e, T_f: { ca: "ca.json" }, T_g: SOURCES.T_g };
  const code = (ev: object, record: object): string => { try { return t.entry(ev, io({ ...FILES, "probe.json": record })).instants["T_g"] ?? "none"; } catch (e) { return String((e as { code?: string }).code); } };
  const http = { ...ACCEPTED, api: "http://127.0.0.1:39424", api_host: "api.gate.test" }, loop = { ...ACCEPTED, api: "https://localhost:8443" }, noHost = { ...ACCEPTED, api_host: null };
  assert.deepEqual([code(evidence(real, "real"), ACCEPTED), code(evidence(real, "real"), http), code(evidence(real, "real"), loop), code(evidence(real, "real"), noHost), code(evidence(publication, "publication"), http)],
    ["2027-01-04T15:00:01Z", "source_not_green", "source_not_green", "source_not_green", "source_not_green"], "real and publication: an https api off the loopback, with its Host");
  assert.equal(code(evidence(), http), "2027-01-04T15:00:01Z", "a rehearsal takes a local probe");
});

/** The served gate in process for one table, as test/retire-probe.test.ts serves it. */
const gate = (served: Buffer, nowMs: number) => (_url: string, body: string): Promise<{ status: number; text: string }> => {
  const table = JSON.parse(served.toString("utf8")) as PolicyTable, { prediction, params } = JSON.parse(body) as { prediction: Prediction; params: HarnessParams };
  const d = runGate(prediction, params, undefined, { nowMs, policyTables: [{ task_class: table.class.task_class, table, policy_table_sha256: policyTableSha256(table) }] });
  return Promise.resolve({ status: 200, text: JSON.stringify({ structuredContent: d }) });
};

// reddened by: a record written by the probe that the tool does not read as the probe wrote it (an accepted one refused, or a refused
// one taken)
// killer: scripts/retire-probe.mjs:84 CONST "ok: problem === null," -> "ok: problem !== null,"
test("retire_instants_composes_with_the_record_of_the_probe", async () => {
  const t = await load(), p = await import("../scripts/retire-probe.mjs"), at = Date.parse("2027-01-04T15:00:01Z");
  const base = SERVED_POLICY_TABLES.find((x) => x.task_class === "btc-range-1h")?.table ?? assert.fail("btc-range-1h");
  const retired = { cell_key: "kata:vote4@venue/BTCUSDT/1h/b0", current: true, status: "retired", thresholds: null, calib_support: { min: 2, max: 3 }, statement: "per-calibration", alpha: "0.01", n: 300, scores_sha256: "ab".repeat(32), qhat: 1.5 };
  const served = Buffer.from(canonicalJson({ ...base, rows: [retired] }), "utf8"), old = Buffer.from(canonicalJson({ ...base, rows: [] }), "utf8");
  const [good, bad] = await Promise.all([served, old].map((s) => p.probe({ tableBytes: served, cell: retired.cell_key, api: "http://x", clock: () => at, monotonic: () => 0, transport: gate(s, at) })));
  const g = (record: unknown): string => { try { return t.entry(evidence(), io({ ...FILES, "probe.json": JSON.parse(JSON.stringify(record)) as unknown })).instants["T_g"] ?? "none"; } catch (e) { return String((e as { code?: string }).code); } };
  assert.deepEqual([good?.problem, bad?.problem?.[0], g(good?.record), g(bad?.record)], [null, "digest_mismatch", "2027-01-04T15:00:01Z", "source_not_green"], "the probe's record, as written, read back");
});

// reddened by: a T_a clock that is not the close of a quarter (an adr: trigger is a commit), a T_e that is not a merge commit, or a git
// that does not start read through an undefined stderr (a TypeError in place of its cause)
// killer: scripts/retire-instants.mjs:55 CONST "if (name === \"T_e\" && parents.length !== 2) no(" -> "if (false) no("
test("retire_instants_checks_the_kind_of_T_a_and_T_e", async () => {
  const t = await load(), code = (sources: object, cycle = "real"): string => { try { t.entry(evidence(sources, cycle), io()); return "ok"; } catch (e) { return String((e as { code?: string }).code); } };
  const live = { ...SOURCES, T_a: { clock: "2027-01-01T00:00:00Z" }, T_f: { ca: "ca.json" } };
  assert.deepEqual([code(live), code({ ...live, T_a: { clock: "2027-01-04T09:00:00Z" } }), code({ ...live, T_a: { clock: "2026-10-01T00:00:00Z" } }), code({ ...live, T_e: { commit: SHA("f"), repo: "gov" } })],
    ["ok", "evidence_invalid", "evidence_invalid", "evidence_invalid"], "T_a a quarter close (k >= 1), T_e two parents");
  const path = process.env["PATH"];
  try {
    process.env["PATH"] = "";
    assert.throws(() => t.committerDate(".", SHA("a")), (e: unknown) => e instanceof Error && !(e instanceof TypeError) && /ENOENT/.test(e.message), "a git that does not start names its cause");
  } finally { process.env["PATH"] = path; }
});
