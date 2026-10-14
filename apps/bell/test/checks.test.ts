// MONARK Bell -- the blocking controls of a run before its deposit (apps/bell/src/checks.ts, lot 2a-iii of BELL-COLLECT-TIMER-1 part 2).
// Inputs are REAL runMain outputs (helpers/bell-served.ts, the bell-served-e2e fixtures: a weekend session whose reference day 2026-08-14 has
// no close in the stub => no_close_ref, one on 2026-09-18 => gT matched; July ADV unserved => no_adv) and JSON-mutated copies of them. The
// operator's tool apps/bell/ops/q6-controls.mjs (unchanged) runs as a child with --now, the test clock: its C00 and C01 lines (course only)
// and its pinned window of C02 are out of the comparison, so is C13 (the cycle ledger of a course); its exit code is never read (--now is a C00 FAIL).
// The comparison clock is T_PUBLISH, past every reference-close gate of the corpus: there, C14 strict (pending = 0) and the tool's C14 (which
// tolerates a no_close_ref not yet publishable) must agree. Before a gate they differ by design: that divergence is the first test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { bellSha, canonical } from "../src/digest.ts";
import { earliestPublishUtc, etWallClockToUtcMs, SIP_ETH_STATUS } from "../src/sessions.ts";
import { ADV_SIP_ETH_RULING, checkRun, type ChecksInput, type ControlId, type RunFiles } from "../src/checks.ts";
import { REPO, T_PUBLISH, readJson, runMainInto, tmp, type Obj } from "./helpers/bell-served.ts";

const CONTROLS = join(dirname(fileURLToPath(import.meta.url)), "..", "ops", "q6-controls.mjs");
const GATE_0814 = earliestPublishUtc("2026-08-14"); // the gate of the no_close_ref session: 16:00 ET + 24 h
const base = tmp("bell-checks-"), good = join(base, "good"), faulted = join(base, "faulted");
mkdirSync(join(base, "w1")); mkdirSync(join(base, "w2"));
await runMainInto(good, join(base, "w1"));
await runMainInto(faulted, join(base, "w2"), { databentoGet: () => Promise.reject(new Error("HTTP 400")) });

type Canon = Parameters<typeof canonical>[0];
const att = (k: string): Obj => ({ outcome: "attempted", by_op_method: { [k]: 1 }, credits_derived: 1 });
const LEDGER = { lines: { helius: [att("helius|getSignaturesForAddress"), att("helius|getTransaction"), { outcome: "unlocked" }] }, maxPages: 20000 };
const filesOf = (dir: string): RunFiles => ({ state: readJson(join(dir, "state.json")), journal: readJson(join(dir, "journal.json")), provenance: readJson(join(dir, "provenance.json")),
  timeline: readFileSync(join(dir, "timeline.jsonl"), "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as Obj) });
const inputOf = (run: RunFiles, over: Partial<ChecksInput> = {}): ChecksInput => ({ run, window: (run.state as Obj).window as ChecksInput["window"], ledger: LEDGER,
  nowMs: T_PUBLISH, sipStatus: SIP_ETH_STATUS, advRuling: ADV_SIP_ETH_RULING, ...over });
const codes = (input: ChecksInput, id: ControlId): string[] => checkRun(input).refusals.filter((r) => r.control === id).map((r) => r.code);
interface Parts { state: Obj; journal: Obj; provenance: Obj; timeline: Obj[] }
const dig = (p: Parts): Obj => p.state.digest as Obj;
const residual = (p: Parts, k: string, v: number): void => { (p.state.residuals as Obj)[k] = v; (dig(p).residuals as Obj)[k] = v; };
const filled = (p: Parts): Obj => (dig(p).gaps as Obj[]).find((g) => "gT" in g) ?? {};
/** A copy of run `from` mutated by `mutate`, bell_sha re-sealed in state and provenance unless `reseal` is false (C02 then reds). */
function variant(from: string, name: string, mutate: (p: Parts) => void, reseal = true): string {
  const d = join(base, name);
  cpSync(from, d, { recursive: true });
  const f = filesOf(d), p: Parts = { state: f.state as Obj, journal: f.journal as Obj, provenance: f.provenance as Obj, timeline: f.timeline as Obj[] };
  mutate(p);
  if (reseal) { p.state.bell_sha = bellSha(p.state.digest as Canon); p.provenance.bellSha = p.state.bell_sha; }
  for (const [n, o] of [["state.json", p.state], ["journal.json", p.journal], ["provenance.json", p.provenance]] as const) writeFileSync(join(d, n), JSON.stringify(o, null, 2));
  writeFileSync(join(d, "timeline.jsonl"), p.timeline.map((l) => JSON.stringify(l) + "\n").join(""));
  return d;
}
/** The run with its no_close_ref session (2026-08-14) removed and no_adv cleared: every compared control passes. */
const clean = variant(good, "clean", (p) => {
  dig(p).gaps = (dig(p).gaps as Obj[]).filter((g) => g.abstain !== "no_close_ref");
  dig(p).volume = (dig(p).volume as Obj[]).filter((v) => v.session_date_et !== "2026-08-14");
  residual(p, "no_close_ref", 0); residual(p, "no_adv", 0);
});
/** q6-controls.mjs on `dir` at `nowMs`: its stdout lines (the exec tree is this worktree, the log an absent file). */
function q6(dir: string, nowMs: number): string[] {
  const r = spawnSync(process.execPath, [CONTROLS, "--mint", "TSLAx", "--mode", "W3", "--variant", "fast", "--out", dir, "--exec-tree", REPO,
    "--log", join(base, "absent.log"), "--now", String(nowMs)], { encoding: "utf8" });
  assert.match(r.stdout, /\nRESULT \d+ FAIL\n$/, `q6-controls ran to its end on ${dir}: ${r.stderr}`);
  return r.stdout.split("\n");
}

// killer: apps/bell/src/checks.ts:108 COR "gap.abstain === \"no_close_ref\")" -> "gap.abstain === \"no_close_ref\" && epu <= input.nowMs)"
test("bell_checks_c14_strict_refuses_pending_session", () => {
  const before = GATE_0814 - 1; // the 2026-08-14 session is pending: its reference close is not yet publishable
  const tool = q6(good, before).filter((l) => l.includes(" Q6-C14 "));
  assert.deepEqual(tool.map((l) => l.slice(0, 12)), ["PASS Q6-C14 "], "the operator's tool tolerates the pending session (q6-controls.mjs:216)");
  assert.match(tool[0] ?? "", /1 no_close_ref not yet publishable/);
  const v = checkRun(inputOf(filesOf(good), { nowMs: before }));
  assert.deepEqual(v.refusals.filter((r) => r.control === "C14").map((r) => [r.code, /pending until \d+/.test(r.why)]), [["close_ref_missing", true]]);
  assert.equal(v.ok, false, "C14 strict: pending = 0, the deposit is refused");
  assert.deepEqual(codes(inputOf(filesOf(clean), { nowMs: before }), "C14"), [], "the same clock without the abstention: C14 passes");
});

// killer: apps/bell/src/checks.ts:108 SDL "\"close_ref_missing\"" -> ""
test("bell_checks_close_ref_missing_refuses_handoff", () => {
  const v = checkRun(inputOf(filesOf(good)));
  assert.deepEqual(v.refusals.filter((r) => r.control === "C14").map((r) => r.code), ["close_ref_missing"], "the gate has passed and the close is missing");
  assert.match(v.refusals.find((r) => r.code === "close_ref_missing")?.why ?? "", /^weekend\|2026-08-14 \(ref 2026-08-14\): publishable since \d+/);
  assert.equal(v.ok, false, "no deposit: the next tick retries the unit");
  assert.deepEqual(codes(inputOf(filesOf(faulted)), "C14"), ["close_ref_missing", "close_ref_missing"], "no close read: both sessions refused by name");
  const ok = checkRun(inputOf(filesOf(clean)));
  assert.deepEqual([ok.ok, ok.refusals], [true, []], "every control passes once the close is read");
});

// killer: apps/bell/src/checks.ts:80 CONST "CASH.includes(f.provider)" -> "false"
test("bell_checks_agree_with_q6_controls_on_runmain_and_synthetic_runs", () => {
  const COMPARED = ["C03", "C04", "C05", "C09", "C12", "C14"] as const;
  const fault = (provider: string) => (p: Parts): void => { p.journal.faults = [{ provider, status: "HTTP 400" }]; };
  const chained = (p: Parts): void => { const l0 = p.timeline[0] ?? {}; p.timeline.push({ ...l0, prev_line_hash: createHash("sha256").update(canonical(l0 as Canon), "utf8").digest("hex") }); };
  const corpus: Array<[string, string]> = [["runmain", good], ["runmain-cash-fault", faulted], ["clean", clean],
    ...([["no_multiplier", 1], ["rebase_unverified", 1], ["no_adv", 1], ["no_quorum", 2], ["no_fill_in_window", 1]] as const).map(([k, n]): [string, string] =>
      [k, variant(clean, k, (p) => { residual(p, k, n); })]),
    ["no_adv-absent", variant(clean, "noadv-absent", (p) => { Reflect.deleteProperty(p.state.residuals as Obj, "no_adv"); })],
    ...["cash-close", "cash-crosscheck", "adv-bars", "x.example", "helius"].map((f): [string, string] => [`fault-${f}`, variant(clean, `fault-${f}`, fault(f))]),
    ["chain-2", variant(clean, "chain2", chained)],
    ["chain-broken", variant(clean, "chain-broken", (p) => { chained(p); const l1 = p.timeline[1]; if (l1) l1.prev_line_hash = "f".repeat(64); })],
    ["chain-head", variant(clean, "chain-head", (p) => { const l0 = p.timeline[0]; if (l0) l0.prev_line_hash = "1".repeat(64); })],
    ["join", variant(clean, "join", (p) => { const v0 = (dig(p).volume as Obj[])[0]; if (v0) v0.n = 99; })],
    ["volume-extra", variant(clean, "volx", (p) => { const vs = dig(p).volume as Obj[]; vs.push({ ...vs[0] }); })],
    ["mismatch", variant(clean, "mm", (p) => { const g = filled(p); for (const k of ["gT", "earliest_publish_utc"]) Reflect.deleteProperty(g, k); g.abstain = "cash_cross_mismatch"; residual(p, "cash_cross_mismatch", 1); })],
    ["mismatch-residual", variant(clean, "mmr", (p) => { residual(p, "cash_cross_mismatch", 1); })],
    ["unavailable", variant(clean, "unav", (p) => { filled(p).cash_cross = "unavailable"; })],
    ["cross-absent", variant(clean, "noxc", (p) => { Reflect.deleteProperty(filled(p), "cash_cross"); })],
    ["unavailable-residual", variant(clean, "unavr", (p) => { residual(p, "cash_cross_unavailable", 1); })],
    ["epu", variant(clean, "epu", (p) => { const g = filled(p); g.earliest_publish_utc = Number(g.earliest_publish_utc) + 1; })],
    ["gT-number", variant(clean, "gtnum", (p) => { const g = filled(p); g.gT = Number(g.gT); })]];
  const seen = new Map<string, Set<boolean>>(), c14: Record<string, string[]> = {};
  for (const [name, dir] of corpus) {
    const lines = q6(dir, T_PUBLISH), v = checkRun(inputOf(filesOf(dir)));
    for (const id of COMPARED) {
      const mine = lines.filter((l) => l.includes(` Q6-${id} `));
      assert.ok(mine.length > 0, `${name}: the tool printed ${id}`);
      const toolFails = mine.some((l) => l.startsWith("FAIL ")), refused = v.refusals.some((r) => r.control === id);
      assert.equal(refused, toolFails, `${name} ${id}: checks.ts ${refused ? "refuses" : "passes"}, q6-controls ${mine.join(" || ")}`);
      if (!toolFails && id === "C14") assert.match(mine.join(""), / 0 no_close_ref not yet publishable/, `${name}: compared outside the pending zone`);
      seen.set(id, (seen.get(id) ?? new Set()).add(refused));
    }
    assert.deepEqual(codes(inputOf(filesOf(dir)), "C02"), [], `${name}: re-sealed, C02 passes`);
    c14[name] = codes(inputOf(filesOf(dir)), "C14");
  }
  for (const id of COMPARED) assert.equal(seen.get(id)?.size, 2, `${id} is seen refused and passed (non-vacuity)`);
  const S = "stop_cash_cross_mismatch", N = "cash_cross_not_matched", G = "gate_not_bound", U = "session_join_unproven"; // each C14 refusal by its name
  assert.deepEqual([c14.runmain, c14.mismatch, c14["mismatch-residual"], c14.unavailable, c14["cross-absent"], c14["unavailable-residual"], c14.epu, c14["gT-number"], c14.join,
    c14["volume-extra"]], [["close_ref_missing"], [S, S], [S], [N], [N], [N], [G], [G], [U], [U]]);
  // checks only: C02 and C13 are ported but out of the comparison (the tool pins a course window and reads a course's cycle ledger)
  const run = filesOf(clean), at = (o: Partial<ChecksInput>, id: ControlId): string[] => codes(inputOf(run, o), id);
  assert.deepEqual(codes(inputOf(filesOf(variant(clean, "schema", (p) => { p.state.schema = "bell-state-v0"; }))), "C02"), ["run_schema_unknown"]);
  assert.deepEqual(at({ window: { from_utc_ms: 0, to_utc_ms: (run.state as Obj & { window: { to_utc_ms: number } }).window.to_utc_ms } }, "C02"), ["run_window_not_the_unit"]);
  assert.deepEqual(codes(inputOf(filesOf(variant(clean, "unsealed", (p) => { residual(p, "no_adv", 3); }, false))), "C02"), ["bell_sha_mismatch"]);
  assert.deepEqual(codes(inputOf(filesOf(variant(clean, "prov", (p) => { p.provenance.bellSha = "0".repeat(64); }, false))), "C02"), ["bell_sha_mismatch"]);
  const L = (lines: Obj[], maxPages = 20000): ChecksInput["ledger"] => ({ lines: { helius: lines, chainstack: [att("chainstack|getTransaction")] }, maxPages });
  const gsfa = Array.from({ length: 3 }, () => att("helius|getSignaturesForAddress"));
  assert.deepEqual(at({ ledger: L(gsfa, 4) }, "C13"), []);
  assert.deepEqual(at({ ledger: L(gsfa, 3) }, "C13"), ["enumeration_at_page_cap"]);
  assert.deepEqual(at({ ledger: L([{ outcome: "refused" }, { outcome: "unlocked" }, ...gsfa, { outcome: "unlocked" }], 4) }, "C13"), [], "a refusal of an earlier run is outside this run's segment");
  assert.deepEqual(at({ ledger: L([{ outcome: "unlocked" }, ...gsfa, { outcome: "refused" }, { outcome: "unlocked" }], 4) }, "C13"), ["ledger_refused_attempt"]);
  assert.deepEqual(at({ ledger: L([...gsfa, { outcome: "unlocked" }, { outcome: "refused" }], 4) }, "C13"), [], "a line after the last unlocked one is not this run's");
  assert.deepEqual(at({ ledger: { lines: {}, maxPages: 1 } }, "C13"), ["ledger_missing"]);
});

// killer: apps/bell/src/checks.ts:117 COR "&&" -> "||"
test("bell_checks_refuse_adv_period_across_the_sip_switch_without_ruling", () => {
  assert.deepEqual([ADV_SIP_ETH_RULING, SIP_ETH_STATUS], [null, "announced"], "the ruling is not written, the switch is announced");
  const run = filesOf(clean), withSession = (d: string): RunFiles => {
    const s = structuredClone(run.state) as Obj, v0 = ((s.digest as Obj).volume as Obj[])[0];
    if (v0) v0.session_date_et = d;
    return { ...run, state: s };
  };
  const RULING = "ADV-SIP-ETH-1 (dated line)", grid = [[null, "announced"], [null, "confirmed"], [RULING, "announced"], [RULING, "confirmed"]] as const;
  const adv = (r: RunFiles, [advRuling, sipStatus]: (typeof grid)[number], o: Partial<ChecksInput> = {}): string[] => codes(inputOf(r, { advRuling, sipStatus, ...o }), "ADV");
  for (const g of grid) {
    assert.deepEqual(adv(run, g), [], `a 2026-09 run: no ADV day of the extended regime (${String(g)})`);
    assert.deepEqual(adv(withSession("2026-12-31"), g), [], "a December 2026 session averages November: before the switch");
    assert.deepEqual(adv(withSession("2025-01-06"), g), ["adv_month_unread"], "an ADV month outside the calendar is never guessed");
  }
  const jan = withSession("2027-01-05"); // its ADV month, December 2026, holds 2026-12-07, the first trade date of the extended regime
  assert.deepEqual(grid.map((g) => adv(jan, g)), [["adv_regime_unruled"], ["adv_regime_unruled"], ["adv_regime_unruled"], []]);
  const unitJan = { from_utc_ms: etWallClockToUtcMs(2027, 1, 5, 4, 0, 0), to_utc_ms: etWallClockToUtcMs(2027, 1, 6, 4, 0, 0) - 1 };
  assert.deepEqual(adv(run, grid[0], { window: unitJan }), ["adv_regime_unruled"], "the unit's own anchor, even with no fill of it");
  assert.deepEqual(codes(inputOf(jan), "ADV"), ["adv_regime_unruled"], "under the committed constants (the exported ruling and status) the deposit is refused");
});
