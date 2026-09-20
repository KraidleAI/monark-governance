// MONARK Bell — non-LLM report generator oracle (ADR-T1aii-D1-bis C-14). Pure aggregation from synthetic
// per-pool digests (no network): by-regime Cong Table 4 stats, constat rendering, and a byte-mutant.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { aggregate, renderMarkdown, findStateFiles } from "../scripts/bell-report.mjs";

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
