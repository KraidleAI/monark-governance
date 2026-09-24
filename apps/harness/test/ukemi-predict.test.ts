/**
 * Harness — `ukemi-predict` tool tests (U-5a; decisions 51/123/132; checkpoint-1 C-1/C-3/C-8).
 *
 * The tool is NOT registered in U-5a (the endpoint keeps 4 tools — decisions 51/123; registration is U-5b),
 * so it is exercised by DIRECT calls (`runUkemiPredict`), NOT via the registry route. PUBLIC-surviving: it
 * reads the REDUCED public slice apps/sentinel/test/fixtures/ukemi/u5a/U5a-book-slice.json (six real accounts,
 * one per branch, + all reserves + the full e2 oracle path), so it does NOT depend on the export-excluded big
 * book. The EXACT equality of the producer to the frozen module over the 565 `score_a` rows / 16 096 accounts
 * is the export-excluded oracle (apps/sentinel/test/ukemi-producer-oracle.test.ts). Only globalThis.fetch would
 * be stubbed for a network path; this module opens none (K-8), asserted below.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { fromRealizedBook, isRealizedError } from "@monark/monark";
import type { RealizedBookSlice, RealizedOracleParams, RealizedOracleUpdate, RealizedReserve, RealizedAccount } from "@monark/monark";
import { findForbiddenKey } from "@monark/contracts";
import { runUkemiPredict, UkemiPredictToolError, UKEMI_PREDICT_LABEL, ukemiPredictHonestyText, UKEMI_PREDICT_TOOL_DESCRIPTION } from "../src/tools/ukemi-predict.ts";
import { ukemiPredictInputStandardSchema } from "../src/schema-projection.ts";
import { runGate, TASK_LIQ_ELIGIBLE, LIQ_ALPHA, LIQ_NMIN, type HarnessParams } from "../src/tools/gate.ts";
import { UKEMI_LIQ_PREDICTOR_BASE } from "../src/calibration.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const FIXTURE = join(HERE, "..", "..", "sentinel", "test", "fixtures", "ukemi", "u5a", "U5a-book-slice.json");

interface Case {
  readonly label: string;
  readonly account: RealizedAccount;
  readonly expect: { yhat?: string; m_bps?: string | null; pstar?: string | null; strate?: number; refusal?: string };
}
interface FixtureOracle {
  readonly schema: string;
  readonly event_id: string;
  readonly anchor_price: string;
  readonly updates: readonly RealizedOracleUpdate[];
  readonly emode_params: Record<string, { readonly lt: string; readonly bonus: string }>;
  readonly usdt_prices?: Record<string, string>;
}
interface Fixture {
  readonly book_meta: { readonly schema: string; readonly chain_id: string; readonly cluster: string; readonly block: string; readonly book_digest: string };
  readonly reserves: readonly RealizedReserve[];
  readonly oracle: FixtureOracle;
  readonly cases: readonly Case[];
}
const FX = JSON.parse(readFileSync(FIXTURE, "utf8")) as Fixture;
const PRODUCED_AT = "2026-01-01T00:00:00Z";

function caseAt(list: readonly Case[], i: number): Case {
  const c = list[i];
  if (c === undefined) throw new Error(`no case at index ${i}`);
  return c;
}
/** The tool input for ONE case, in the REAL byte form (A-8: the account keeps user_config/eligible_static, the
 *  update lines keep round_id/updated_at, the oracle keeps usdt_prices — none read by the producer). */
function inputFor(c: Case) {
  return {
    book: {
      schema: FX.book_meta.schema,
      chain_id: FX.book_meta.chain_id,
      cluster: FX.book_meta.cluster,
      block: FX.book_meta.block,
      book_digest: FX.book_meta.book_digest,
      reserves: FX.reserves,
      accounts: [c.account],
    },
    oracle: FX.oracle,
    close_factor_version: "3.5.0",
    produced_at: PRODUCED_AT,
  };
}
/** The producer args for the SAME case (A-10: the same bytes into fromRealizedBook). */
function producerArgs(c: Case): { book: RealizedBookSlice; params: RealizedOracleParams } {
  return {
    book: { reserves: FX.reserves, account: c.account },
    params: { anchor_price: FX.oracle.anchor_price, updates: FX.oracle.updates, emode_params: FX.oracle.emode_params },
  };
}
const evalCases = FX.cases.filter((c) => c.expect.refusal === undefined);
const refusalCases = FX.cases.filter((c) => c.expect.refusal !== undefined);

test("u5_tool_predicts_each_branch_from_real_slice", () => {
  assert.ok(evalCases.length >= 4 && refusalCases.length >= 2, "the reduced slice covers crossing / e-mode / no-crossing / refusal branches");
  for (const c of evalCases) {
    const out = runUkemiPredict(inputFor(c));
    assert.equal(out.prediction.task_class, TASK_LIQ_ELIGIBLE, `${c.label}: task class`);
    assert.equal(out.prediction.yhat, Number(c.expect.yhat), `${c.label}: yhat`);
    assert.equal(out.provenance.m_bps, c.expect.m_bps ?? null, `${c.label}: m_bps`);
    assert.equal(out.provenance.pstar, c.expect.pstar ?? null, `${c.label}: pstar`);
    assert.equal(out.provenance.strate, c.expect.strate, `${c.label}: strate (derived harness-side via ukemi-strata)`);
  }
});

test("u5_tool_output_equals_fromRealizedBook_same_bytes", () => {
  // A-10 binding: the SERVED yhat EQUALS fromRealizedBook on the SAME bytes (not just "reads the right source").
  // Mutant "yhat altered after calculation" (runUkemiPredict returns Number(result.yhat)+1) reddens THIS test.
  for (const c of evalCases) {
    const { book, params } = producerArgs(c);
    const direct = fromRealizedBook(book, params);
    assert.ok(!isRealizedError(direct), `${c.label}: producer ok`);
    if (isRealizedError(direct)) continue;
    const out = runUkemiPredict(inputFor(c));
    assert.equal(out.prediction.yhat, Number(direct.yhat), `${c.label}: served yhat == fromRealizedBook yhat`);
    assert.equal(out.provenance.m_bps, direct.m_bps, `${c.label}: served m_bps == producer m_bps`);
    assert.equal(out.provenance.pstar, direct.pstar, `${c.label}: served pstar == producer pstar`);
  }
});

test("u5_producer_predicts_then_gate_abstains_under_calib", () => {
  // Branchement at HEAD (checkpoint-1 C-3): the produced Prediction is gate-consumable; the liq registry is
  // EMPTY, so the gate abstains under_calib (n_calib 0) for EVERY yhat. The "yhat varied => decision varies"
  // (non-vacuity) assertion is a FORMED item with trigger = the -2b registry merge (rejoined in U-5b).
  const params: HarnessParams = {
    remainingBudget: 1000, bFloor: 0, tau: 0, tauInterval: 0,
    alpha: LIQ_ALPHA, nMin: LIQ_NMIN, intent: null, tool: "ukemi-predict", clockOpen: true,
  };
  for (const c of evalCases) {
    const out = runUkemiPredict(inputFor(c));
    const decision = runGate(out.prediction, params);
    assert.equal(decision.reason, "under_calib", `${c.label}: empty liq registry ⇒ under_calib`);
    assert.equal(decision.verdict.reason, "under_calib", `${c.label}: verdict under_calib`);
    assert.equal(decision.verdict.n_calib, 0, `${c.label}: n_calib 0 (no committed scores)`);
  }
});

test("u5_tool_refuses_named_400", () => {
  const good = inputFor(caseAt(evalCases, 0));
  const throwsUkemi = (bad: unknown, why: string) => {
    assert.throws(() => runUkemiPredict(bad), (e: unknown) => e instanceof UkemiPredictToolError, why);
  };
  throwsUkemi({ ...good, close_factor_version: "3.7.0" }, "close_factor_version != 3.5.0 fails closed");
  throwsUkemi({ ...good, book: { ...good.book, schema: "ukemi-book/2" } }, "book.schema wrong");
  throwsUkemi({ ...good, oracle: { ...good.oracle, schema: "x" } }, "oracle.schema wrong");
  throwsUkemi({ ...good, book: { ...good.book, accounts: [caseAt(evalCases, 0).account, caseAt(evalCases, 1).account] } }, "accounts.length != 1");
  throwsUkemi({ ...good, book: { ...good.book, book_digest: "not-hex" } }, "book_digest not 64-hex");
  throwsUkemi({ ...good, produced_at: "yesterday" }, "produced_at not RFC3339");
  // producer-level refusals surfaced as 400.
  for (const c of refusalCases) {
    assert.throws(
      () => runUkemiPredict(inputFor(c)),
      (e: unknown) => e instanceof UkemiPredictToolError && e.message.includes(c.expect.refusal ?? ""),
      `${c.label}: ${String(c.expect.refusal)}`,
    );
  }
});

test("u5_label_serves_the_five_elements", () => {
  // checkpoint-1 C-8: English ASCII label carrying the five elements (mutant removes one => red).
  const L = UKEMI_PREDICT_LABEL;
  for (const piece of ["Aave v3.5.0", "first crossing", "held at p0", "any other event", "NOT re-verified"]) {
    assert.ok(L.includes(piece), `label must carry: ${piece}`);
  }
  assert.ok(/^[\x20-\x7e]+$/.test(L), "label is printable ASCII (lang:gate)");
  assert.ok(/never a probability/.test(L) && /no guarantee/.test(L), "no probability / no guarantee claim (vocab-exempt form)");
  assert.equal(findForbiddenKey({ label: L }), null, "label carries no forbidden key");
});

test("u5_served_phrases_have_no_surclaim", () => {
  // A-9 (checkpoint-2 C-1): the SERVED honesty phrases carry NO probative surclaim (the harness vocab gate is
  // blind to these in a tool constant). Mutant `a9-label-injection` reddens this; exempt spans stripped first.
  const noSurclaim = (s: string, where: string): void => {
    const stripped = s.replace(/never a probability/g, "").replace(/re-verified/g, "");
    assert.ok(!stripped.includes("interval"), `${where}: no 'interval'`);
    assert.ok(!/\bverified\b/.test(stripped), `${where}: no naked 'verified'`);
    assert.ok(!stripped.includes("%"), `${where}: no '%'`);
    assert.ok(!/\bprobabilit/.test(stripped), `${where}: no 'probability' outside 'never a probability'`);
  };
  noSurclaim(UKEMI_PREDICT_LABEL, "label");
  noSurclaim(ukemiPredictHonestyText(), "honestyText");
  noSurclaim(UKEMI_PREDICT_TOOL_DESCRIPTION, "toolDescription");
});

test("u5_tool_refuses_yhat_over_safe_integer", () => {
  // C-4: a synthetic mono-WETH slice whose yhat (~1.818e16 = min(D_r, CA)) exceeds 2^53 => UkemiPredictToolError
  // (never a lossy served region, C-9). Mutant `safe-integer-guard-removed` reddens this.
  const W = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", AW = "0x" + "a1".repeat(20), VW = "0x" + "d1".repeat(20), C = "0x" + "c0".repeat(20), AC = "0x" + "a2".repeat(20), VC = "0x" + "d2".repeat(20);
  const R = (asset: string, atoken: string, vt: string, decimals: string, lt: string, bo: string, ec: string, p: string) => ({ asset, atoken, variable_debt_token: vt, decimals, liquidation_threshold_bps: lt, liquidation_bonus_bps: bo, reserve_emode_category: ec, price_base_8dec: p });
  const big = {
    book: { schema: "ukemi-book/1", block: 1, book_digest: "a".repeat(64), reserves: [R(W, AW, VW, "18", "8000", "11000", "1", "10000000000"), R(C, AC, VC, "6", "8500", "10500", "0", "100000000")],
      accounts: [{ address: "0x" + "1".repeat(40), emode: "0", balances: [{ token: AW, amount: "2000000000000000000000000" }, { token: VC, amount: "200000000000000" }], total_collateral_base: "20000000000000000", total_debt_base: "20000000000000000", current_liquidation_threshold_bps: "8000", hf_onchain: "900000000000000000" }] },
    oracle: { schema: "ukemi-u4b-oracle/1", event_id: "synthetic", anchor_price: "10000000000", updates: [], emode_params: {} }, close_factor_version: "3.5.0", produced_at: "2026-01-01T00:00:00Z",
  };
  assert.throws(() => runUkemiPredict(big), (e: unknown) => e instanceof UkemiPredictToolError && /safe integer/i.test(e.message), "yhat > 2^53 => UkemiPredictToolError");
});

test("u5_tool_output_is_closed_and_block_and_digest_echoed", () => {
  const out = runUkemiPredict(inputFor(caseAt(evalCases, 0)));
  // Closed Prediction: exactly the 6 frozen keys (assertClosedPrediction runs in the tool; re-check the set).
  assert.deepEqual(
    Object.keys(out.prediction).sort(),
    ["features_digest", "predictor_id", "produced_at", "schema_version", "task_class", "yhat"],
    "prediction is the closed frozen contract",
  );
  assert.equal(findForbiddenKey(out), null, "envelope carries no forbidden key at any depth");
  // block in the output (G0 §2.5); features_digest is the ECHO of the caller-carried book_digest.
  assert.equal(out.provenance.block, Number(FX.book_meta.block), "provenance.block === book.block (as integer)");
  assert.equal(out.prediction.features_digest, FX.book_meta.book_digest, "features_digest echoes book_digest");
  assert.equal(out.provenance.book_digest, FX.book_meta.book_digest, "provenance.book_digest echoes book_digest");
  assert.equal(out.provenance.close_factor_version, "3.5.0", "protocol version served in provenance");
  // C-6: the served predictor_id is BOUND to the derived stratum (kills `predictor-id-not-bound`; gate re-derives it).
  assert.equal(out.prediction.predictor_id, `${UKEMI_LIQ_PREDICTOR_BASE}/s${String(out.provenance.strate)}`, "predictor_id === base/s{strate}");
});

test("u5_input_schema_accepts_the_real_form", async () => {
  // A-8: the REAL byte form (account with user_config/eligible_static, updates with round_id/updated_at, oracle
  // with usdt_prices) validates against the declared input schema. Mutant: drop an A-8 optional key from the
  // schema (schema-projection) => the real form is rejected => red.
  const real = inputFor(caseAt(evalCases, 0));
  const res = await ukemiPredictInputStandardSchema["~standard"].validate(real);
  assert.equal(res.issues, undefined, `real-form input must validate: ${JSON.stringify(res.issues)}`);
  // sanity: the real account DOES carry the A-8 optional keys (else the test would be vacuous).
  const acct = caseAt(evalCases, 0).account;
  assert.ok("user_config" in acct && "eligible_static" in acct, "the real account carries user_config/eligible_static (A-8 non-vacuous)");
  // H-G2-1: the update lines and the oracle carry the A-8 optional keys too (else the schema check is vacuous).
  assert.ok(FX.oracle.updates.length === 140 && FX.oracle.updates.every((u) => "round_id" in u && "updated_at" in u), "all 140 updates carry round_id/updated_at (A-8 non-vacuous)");
  assert.ok(FX.oracle.usdt_prices !== undefined, "the oracle carries usdt_prices (A-8 non-vacuous)");
});

test("u5_tool_is_k8_pure", () => {
  // K-8: the tool does NO I/O. `mcp_tools_have_no_side_effects` (registry.test.ts) scans EVERY src/tools/**.ts
  // (ukemi-predict.ts included, even unregistered) with these SAME import-form regexes; re-asserted here so the
  // file self-documents K-8. Import-form (quoted) / call-form / write-form, so the K-8 comment mentions do NOT
  // false-positive. Mutant: an `import "node:fs"` (or a fetch call) in the tool reddens both this and the scan.
  const src = readFileSync(join(HERE, "..", "src", "tools", "ukemi-predict.ts"), "utf8");
  const forbidden: RegExp[] = [/["']node:fs["']/, /["']node:net["']/, /["']node:child_process["']/, /\bfetch\s*\(/, /\bprocess\.env(?:\.[A-Za-z_]\w*|\[[^\]]+\])\s*=(?!=)/];
  for (const re of forbidden) assert.ok(!re.test(src), `ukemi-predict.ts must not match ${String(re)} (K-8)`);
});
