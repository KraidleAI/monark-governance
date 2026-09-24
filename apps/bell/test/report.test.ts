// MONARK Bell — non-LLM report generator oracle (ADR-T1aii-D1-bis C-14). Pure aggregation from synthetic
// per-pool digests (no network): by-regime Cong Table 4 stats, constat rendering, and a byte-mutant.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { aggregate, renderMarkdown, findStateFiles, assertNoCloseLike } from "../scripts/bell-report.mjs";
import { collect } from "../src/collect.ts";

const d1 = { digest: { gaps: [
  { symbol: "TSLAx", session: "weekend", regime: "weekend", vwap: "1", gT: "0.06", volumeBase: "1", n: 1, exceed1: 1, exceed2: 1, exceed5: 1 },
  { symbol: "TSLAx", session: "weekend", regime: "weekend", vwap: "1", gT: "0.001", volumeBase: "1", n: 1, exceed1: 0, exceed2: 0, exceed5: 0 },
  { symbol: "TSLAx", session: "weekend", regime: "weekend", vwap: "1", volumeBase: "1", n: 1, abstain: "rebase_unverified" },
], residuals: { rebase_unverified: 1, no_close_ref: 0 } } };
const d2 = { digest: { gaps: [
  { symbol: "SPYx", session: "overnight-weekday", regime: "overnight-weekday", vwap: "1", gT: "0.02", volumeBase: "1", n: 1, exceed1: 1, exceed2: 0, exceed5: 0 },
  { symbol: "SPYx", session: "regular", regime: null, vwap: "1", gT: "0.9", volumeBase: "1", n: 1, exceed1: 1, exceed2: 1, exceed5: 1 },
], residuals: { rebase_unverified: 0, no_close_ref: 1 } } };

test("bell_report_aggregates_by_regime_constat", () => {
  const agg = aggregate([d1, d2]);
  assert.deepEqual(agg.byRegime.weekend, { sessions: 3, withGt: 2, exceed1: 1, exceed5: 1, abstain: 1 });
  assert.deepEqual(agg.byRegime["overnight-weekday"], { sessions: 1, withGt: 1, exceed1: 1, exceed5: 0, abstain: 0 });
  assert.equal(agg.byRegime.holiday?.sessions, 0);
  // the intraday `regular` session (regime null) is NOT bucketed (Cong = off-hours regimes only)
  const total = (agg.byRegime.weekend?.sessions ?? 0) + (agg.byRegime["overnight-weekday"]?.sessions ?? 0) + (agg.byRegime.holiday?.sessions ?? 0);
  assert.equal(total, 4);
  assert.equal(agg.residuals.rebase_unverified, 1);
  assert.equal(agg.residuals.no_close_ref, 1);
  // render is a CONSTAT with units + script sha; Cong column is a procurement item, never fabricated
  const md = renderMarkdown(agg, { scriptSha: "deadbeefdeadbeef", d9: "F:/tmp/bell-course-b1", month: "2026-09" });
  assert.match(md, /CONSTAT, not a verdict/);
  assert.match(md, /bell-report\.mjs.*sha256/);
  assert.match(md, /log-return/); // g_t unit stated
  assert.match(md, /T-3 procurement — not fabricated/);
  assert.ok(!/✅|❌|\bPASS\b|\bFAIL\b/.test(md), "a constat never emits a pass/fail verdict");
  // mutant: a digest with exceed5=1 aggregates differently from one with exceed5=0 (the exceedance is load-bearing)
  const withEx = { digest: { gaps: [{ symbol: "T", session: "weekend", regime: "weekend", vwap: "1", gT: "0.06", volumeBase: "1", n: 1, exceed1: 1, exceed2: 1, exceed5: 1 }], residuals: {} } };
  const noEx = { digest: { gaps: [{ symbol: "T", session: "weekend", regime: "weekend", vwap: "1", gT: "0.06", volumeBase: "1", n: 1, exceed1: 1, exceed2: 1, exceed5: 0 }], residuals: {} } };
  assert.notEqual(aggregate([withEx]).byRegime.weekend?.exceed5, aggregate([noEx]).byRegime.weekend?.exceed5);
});

test("bell_report_finds_per_pool_state_files", () => {
  const root = mkdtempSync(join(tmpdir(), "bell-d9-"));
  const pools: Array<[string, unknown]> = [["TSLAx", d1], ["SPYx", d2]];
  for (const [pool, body] of pools) {
    mkdirSync(join(root, pool), { recursive: true });
    writeFileSync(join(root, pool, "state.json"), JSON.stringify(body));
  }
  const files = findStateFiles(root);
  assert.equal(files.length, 2, "one state.json per pool subdir found recursively");
  assert.ok(files.every((f) => f.endsWith("state.json")));
});

// ---- C-G2-4: the report REFUSES to aggregate a state carrying a numeric close/ADV (ADR-T1aii C-7 garde rapport) --
test("bell_report_input_close_guard", () => {
  assert.doesNotThrow(() => aggregate([d1, d2])); // clean states aggregate
  // a numeric close smuggled into a gap => aggregate() throws (mutant: neutralize the guard => this stops throwing)
  const withClose = { digest: { gaps: [{ symbol: "T", session: "weekend", regime: "weekend", vwap: "1", gT: "0.06", volumeBase: "1", n: 1, exceed1: 1, exceed2: 1, exceed5: 1, closeRef: 123.45 }], residuals: {} } };
  assert.throws(() => aggregate([withClose]), /close/i);
  // an ADV value anywhere in the state => refused
  const withAdv = { digest: { gaps: [], residuals: {} }, adv: 1_000_000 };
  assert.throws(() => aggregate([withAdv]), /adv|close/i);
  // the guard is exported and directly exercisable (a Polygon prev-close key reddens too)
  assert.throws(() => { assertNoCloseLike({ prev: 123.46 }); }, /prev|close/i);
  // a non-numeric close_source string does NOT redden (decision 41: the provider is NAMED, never a value)
  assert.doesNotThrow(() => { assertNoCloseLike({ close_source: "massive-starter-internal" }); });
});

// ---- BELL-ADV-1: every state.json now COUNTS no_adv / no_multiplier. The report (a real consumer of state.json) must
// ---- aggregate that counter (it is not a leaked ADV) and still refuse a numeric adv; its CLOSE_KEY duplicate stays
// ---- byte-equal to digest.ts. Composition: a state produced by the REAL collect() -> aggregate(). Mutant: the report's
// ---- `(?<!no_)adv` lookbehind removed => aggregate() throws on every state => red.
test("bell_report_accepts_named_adv_residuals_in_sync", () => {
  const f = { signature: "r1", blockTimeUtcMs: Date.UTC(2025, 8, 13, 15, 0, 0), baseDelta: 100_000_000n, quoteDelta: -365_000_000n };
  const r = collect({ symbols: [{ symbol: "TSLAx", chain: "solana", baseDec: 8, quoteDec: 6, fills: [f], fillsResidues: [], closeRefBySession: {}, advDailyVolumes: [] }],
    haltRows: [], window: { fromUtcMs: 0, toUtcMs: 0 }, nowSec: 1_800_000_000, staleBoundSec: 93600, generatedAt: "t" });
  const state = JSON.parse(JSON.stringify(r.state)) as unknown; // the written state.json body
  const agg = aggregate([state, state]);
  assert.equal(agg.residuals.no_adv, 2, "no mint and no bar => each state counts no_adv once; the report sums the counter");
  assert.equal(agg.residuals.no_multiplier, 2);
  assert.throws(() => aggregate([{ digest: { gaps: [], residuals: { no_adv: 1 } }, adv: 1_000_000 }]), /adv/, "a numeric adv is still refused");
  assert.throws(() => { assertNoCloseLike({ adv_shares: 5 }); }, /adv/);
  assert.doesNotThrow(() => { assertNoCloseLike({ adv_period: { year: 2025, month: 8 } }); });
  const here = dirname(fileURLToPath(import.meta.url));
  const lit = (rel: string): string | undefined => /const CLOSE_KEY = (\/.+\/i);/.exec(readFileSync(join(here, rel), "utf8"))?.[1];
  const src = lit("../src/digest.ts");
  assert.ok(src?.includes("(?<!no_)adv"), "digest.ts exempts the no_adv counter");
  assert.equal(lit("../scripts/bell-report.mjs"), src, "the report's CLOSE_KEY is byte-equal to digest.ts (declared duplicate)");
});
