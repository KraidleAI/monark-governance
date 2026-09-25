/**
 * Harness -- the branchement proof of the liquidation-eligible-coverage class on the COMMITTED registry (phase -2b of
 * u4b_gate_serves_region_from_real_artifact; ADR-U4b tuyau "region servie" built iff this test is green on a FRESH
 * registry; ADR-U4b-2b D1/D7 and section 4; checkpoint-1 C-3 + delta D-1/D-3/D-8). It sources the REAL committed fresh
 * scores series of the sentinel and maps EVERY `score_a` row DETERMINISTICALLY (yhat = Number(row.yhat); predictor_id =
 * the series' cell-A key), no object hand-built, then drives the SERVED path both ways: the `gate` descriptor of
 * HARNESS_TOOLS (`run`) AND the HTTP/JSON mirror (`handleJsonMirror`, POST /gate).
 *   - a row of the committed stratum s0 gets the conformal UPPER BOUND [0, yhat + qhat_0], with qhat_0, n_calib and the
 *     C5 digest RECOMPUTED here from the series' own s0 rows (never typed, never read from the registry under test);
 *   - a row of an uncommitted stratum (s1..s3) abstains under_calib with n_calib 0;
 *   - the SERVER-derived key is observable: a yhat of s0 with a client key naming s1 is still bounded by qhat_0, and a
 *     yhat of s1 with a client key naming s0 still abstains (the client key is ignored for this class).
 * Mutants killed here: (b) key taken from the caller, (l) base different from the fresh literal, (n') symmetric region
 * served by liqEligibleVerdict, (pool) the pooled cell served as s0 (digest and n_calib), registry emptied.
 * This file reads an export-excluded sentinel series (scripts/export-exclude-data.json), so it is itself listed in
 * scripts/export-exclude-tests.json (guard (a) of test/export-hygiene.test.ts). No network.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { assertClosedGateDecision, calibDigest } from "@monark/contracts";
import type { Prediction, GateDecision } from "@monark/contracts";
import { TASK_LIQ_ELIGIBLE, LIQ_ALPHA, LIQ_NMIN, LIQ_COMMITTED_SENTENCE, LIQ_EMPTY_REGISTRY_SENTENCE, type HarnessParams } from "../src/tools/gate.ts";
import { HARNESS_TOOLS, type GateEnvelope } from "../src/tools/registry.ts";
import { handleJsonMirror } from "../src/http.ts";
import { strateOf } from "../src/ukemi-strata.ts";

const FIXTURE = fileURLToPath(new URL("../../sentinel/test/fixtures/ukemi/u4b/U4b-scores-weth-2025-09-22.jsonl", import.meta.url));

interface MetaLine { kind: "meta"; cell_a: { predictor_id: string } }
interface ScoreARow { kind: "score_a"; yhat: string; strate: number; score: string }
type Line = MetaLine | ScoreARow | { kind: string };

function jsonl(path: string): Line[] {
  return readFileSync(path, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as Line);
}

const LIQ_PARAMS: HarnessParams = {
  remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: LIQ_ALPHA, nMin: LIQ_NMIN,
  intent: 1, tool: "perps_order_preview", clockOpen: true,
};

const GATE_TOOL = HARNESS_TOOLS.find((t) => t.name === "gate");
if (GATE_TOOL === undefined) throw new Error("gate tool missing from HARNESS_TOOLS");

function pred(yhat: number, predictorId: string): Prediction {
  return { schema_version: "1.0.0", task_class: TASK_LIQ_ELIGIBLE, yhat, predictor_id: predictorId, produced_at: "2026-09-04T00:00:00Z" };
}

/** The expected served verdict of the committed stratum, recomputed from the series (split conformal, alpha = 1/100). */
interface Committed { qhat: number; n: number; digest: string }
function committedFromSeries(rows: readonly ScoreARow[]): Committed {
  const scores = rows.filter((r) => r.strate === 0).map((r) => BigInt(r.score)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const n = scores.length;
  const p = Math.ceil(((n + 1) * 99) / 100); // rank ceil((n+1)(1 - alpha)), alpha = LIQ_ALPHA = 1/100 (asserted below)
  const q = scores[p - 1];
  if (q === undefined) throw new Error("the committed stratum has fewer points than its conformal rank");
  return { qhat: Number(q), n, digest: calibDigest(scores.map(Number)) };
}

function assertBounded(d: GateDecision, yhat: number, c: Committed, where: string): void {
  assertClosedGateDecision(d);
  assert.equal(d.verdict.reason, "covered", `${where}: the committed stratum is covered`);
  assert.equal(d.verdict.region.kind, "interval", `${where}: the wire kind stays interval (frozen contract)`);
  if (d.verdict.region.kind !== "interval") return;
  assert.equal(d.verdict.region.lo, 0, `${where}: lower edge 0 (upper bound, never symmetric)`);
  assert.equal(d.verdict.region.hi, yhat + c.qhat, `${where}: upper edge yhat + qhat_0`);
  assert.equal(d.verdict.qhat, c.qhat, `${where}: the served q-hat is the series' conformal q-hat of s0`);
  assert.equal(d.verdict.n_calib, c.n, `${where}: n_calib is the series' s0 size`);
  assert.equal(d.verdict.calib_digest, c.digest, `${where}: calib_digest is the C5 of the series' s0 scores`);
}
function assertAbstains(d: GateDecision, where: string): void {
  assertClosedGateDecision(d);
  assert.equal(d.action, "abstain", `${where}: abstains`);
  assert.equal(d.verdict.reason, "under_calib", `${where}: under_calib`);
  assert.equal(d.verdict.n_calib, 0, `${where}: n_calib 0 (nothing committed for this stratum)`);
}

async function mirror(env: GateEnvelope): Promise<{ status: number; decision: GateDecision; text: string }> {
  const res = await handleJsonMirror(
    new Request("http://api.monarkgate.tech/gate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(env) }),
  );
  const body = (await res.json()) as { structuredContent?: unknown; content?: Array<{ text?: string }> };
  return { status: res.status, decision: body.structuredContent as GateDecision, text: body.content?.[0]?.text ?? "" };
}

test("u4b_gate_serves_region_from_real_artifact", async () => {
  assert.equal(LIQ_ALPHA, 1 / 100, "the class alpha is 1/100 (the rank below uses it exactly)");
  const lines = jsonl(FIXTURE);
  const meta = lines.find((l): l is MetaLine => l.kind === "meta");
  if (meta === undefined) throw new Error("fixture has no meta line");
  const base = meta.cell_a.predictor_id;
  assert.ok(typeof base === "string" && base.length > 0, "meta.cell_a.predictor_id is a non-empty committed key");
  const rows = lines.filter((l): l is ScoreARow => l.kind === "score_a");
  const c = committedFromSeries(rows);

  // Non-vacuity: every class-A row, many distinct yhat values in the committed stratum, and the other strata present.
  const s0 = rows.filter((r) => r.strate === 0);
  assert.ok(rows.length >= 200, `the fresh series has many score_a rows (found ${String(rows.length)}; measured 205)`);
  assert.ok(new Set(s0.map((r) => r.yhat)).size >= 150, "the s0 yhat values are varied (anti-vacuity; measured 166 distinct)");
  assert.ok(rows.some((r) => r.strate > 0), "rows of uncommitted strata are present");
  assert.ok(c.qhat > 0 && c.n >= LIQ_NMIN, "the committed stratum has a positive q-hat at n >= nMin");

  // DETERMINISTIC mapping over ALL rows via the `gate` descriptor `run` (client key = the series' cell-A base).
  for (const row of rows) {
    const yhat = Number(row.yhat);
    assert.ok(Number.isSafeInteger(yhat) && yhat >= 0, `row yhat ${row.yhat} is a non-negative safe integer (base 8-dec)`);
    assert.equal(strateOf(yhat), row.strate, `served strateOf(${row.yhat}) == the series stratum`);
    const { structured, text } = GATE_TOOL.run({ prediction: pred(yhat, base), params: LIQ_PARAMS } satisfies GateEnvelope);
    const d = structured as unknown as GateDecision;
    if (row.strate === 0) assertBounded(d, yhat, c, `run yhat=${row.yhat}`);
    else assertAbstains(d, `run yhat=${row.yhat} (s${String(row.strate)})`);
    assert.ok(text.includes(LIQ_COMMITTED_SENTENCE) && !text.includes(LIQ_EMPTY_REGISTRY_SENTENCE), "the content text is the committed class text");
  }

  // The SERVER derives the key from yhat: the client key is ignored (observable only on a committed registry).
  const a = s0[0];
  const b = rows.find((r) => r.strate === 1);
  if (a === undefined || b === undefined) throw new Error("the series lacks an s0 or an s1 row");
  const ya = Number(a.yhat), yb = Number(b.yhat);
  const runAt = (y: number, key: string): GateDecision => GATE_TOOL.run({ prediction: pred(y, key), params: LIQ_PARAMS }).structured as unknown as GateDecision;
  assertBounded(runAt(ya, `${base}/s1`), ya, c, "s0 yhat with a client key naming s1");
  assertAbstains(runAt(yb, `${base}/s0`), "s1 yhat with a client key naming s0");

  // The SAME served class over the HTTP/JSON mirror (POST /gate): a real second surface on the same registry.
  const ma = await mirror({ prediction: pred(ya, `${base}/s1`), params: LIQ_PARAMS });
  assert.equal(ma.status, 200, "POST /gate answers 200 for a committed stratum");
  assertBounded(ma.decision, ya, c, "mirror s0 yhat");
  assert.ok(ma.text.includes(LIQ_COMMITTED_SENTENCE), "the mirror content carries the committed class text");
  const mb = await mirror({ prediction: pred(yb, `${base}/s0`), params: LIQ_PARAMS });
  assert.equal(mb.status, 200, "POST /gate answers 200 (a decision, not a 400) for an uncommitted stratum");
  assertAbstains(mb.decision, "mirror s1 yhat");
});
