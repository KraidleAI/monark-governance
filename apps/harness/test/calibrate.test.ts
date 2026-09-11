/**
 * Harness — calibrate (BYO split-conformal) tests (ADR-M007 D2/D3/D4/D5/B-3/B-7, §3 criteria).
 * Each test is killed by >= 1 named mutant. Fully typed: no `any`, no unsafe access — the file stays at
 * the lint ratchet ceiling.
 *
 * ANTI-CIRCULARITY (§3): the split-conformal oracle is HAND-ROLLED — the expected q̂ is written in
 * literally from a by-hand computation, NEVER derived from the production `splitQuantile`/`sort`. So a
 * mutant in `splitQuantile` (or in `runCalibrate`'s wiring of it) reddens against an independent number.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { calibDigest } from "@monark/contracts";
import { compilePatterns, scanText } from "../../../scripts/grep-forbidden.mjs";
import {
  runCalibrate,
  calibrateHonestyText,
  CalibrateToolError,
  CALIBRATE_MAX_N,
  CALIBRATE_LABEL,
  CALIBRATE_TOOL_NAME,
  CALIBRATE_TOOL_DESCRIPTION,
  type CalibrateInput,
} from "../src/tools/calibrate.ts";
import {
  CALIBRATE_INPUT_SCHEMA,
  CALIBRATE_OUTPUT_SCHEMA,
  calibrateOutputStandardSchema,
  type Json,
} from "../src/schema-projection.ts";

const VOCAB_PATH = fileURLToPath(new URL("../../../vocab-banned.json", import.meta.url));

interface VocabRule { re: string; why: string; }
interface VocabConfig { banned: VocabRule[]; scan: { harness: { banned: VocabRule[] } }; }

function asObj(node: Json | undefined, where: string): { [k: string]: Json } {
  if (node === null || node === undefined || typeof node !== "object" || Array.isArray(node)) {
    throw new Error(`expected object at ${where}`);
  }
  return node;
}

// Test — HAND-ROLLED split-conformal oracle (§3, anti-circularity). n=9, α=0.2, nMin=5:
//   p = ⌈(n+1)(1−α)⌉ = ⌈10 · 0.8⌉ = ⌈8⌉ = 8, and q̂ = the p-th SMALLEST score.
// The scores are 0.1..0.9 (given SHUFFLED so a "return scores[7] unsorted" mutant would give 0.4, not
// 0.8); sorted ascending they are 0.1,0.2,…,0.9, so the 8-th smallest is 0.8 — WRITTEN IN BY HAND.
// Mutants: p→p+1 (off-by-one) ⇒ q̂=0.9; a clamp-to-max ⇒ 0.9; dropping the (n+1) correction (p=⌈9·0.8⌉=8
// here, so choose the ties elsewhere) — all diverge from the hand value 0.8.
test("calibrate_hand_rolled_split_conformal_oracle", () => {
  const scores = [0.5, 0.1, 0.9, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6]; // n=9, shuffled on purpose
  const r = runCalibrate({ scores, alpha: 0.2, nMin: 5 });
  assert.equal(r.qhat, 0.8, "q̂ = the 8-th smallest score (p=⌈10·0.8⌉=8) — hand-computed, not via prod sort");
  assert.equal(r.reason, null, "a covered result carries reason:null");
  assert.equal(r.method, "split", "the method is split");
  assert.equal(r.n, 9, "n echoes the score count");
  assert.equal(r.alpha, 0.2, "alpha is echoed");
  assert.equal(typeof r.label, "string", "the K-1 label rides in the output (carrier 3/3)");
});

// Test — B-7: `set_digest` IS `calibDigest(scores)` (imported, never re-implemented), and the whole
// result is deterministic AND permutation-invariant (calibDigest sorts; splitQuantile sorts). Mutant:
// re-implement the digest in calibrate.ts (or hash the unsorted bytes) ⇒ the equality/permutation reds.
test("calibrate_set_digest_is_calibDigest_and_deterministic", () => {
  const scores = [0.5, 0.1, 0.9, 0.3, 0.7, 0.2, 0.8, 0.4, 0.6];
  const shuffled = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  const a = runCalibrate({ scores, alpha: 0.2, nMin: 5 });
  const b = runCalibrate({ scores, alpha: 0.2, nMin: 5 });
  const c = runCalibrate({ scores: shuffled, alpha: 0.2, nMin: 5 });

  // B-7 — the digest equals the imported calibDigest of the SAME scores (proves reuse, closes the C2 audit).
  assert.equal(a.set_digest, calibDigest(scores), "set_digest === calibDigest(scores) (B-7 reuse)");
  assert.match(a.set_digest, /^[0-9a-f]{64}$/, "set_digest is 64 lowercase hex");
  // Determinism — same input ⇒ same q̂ and digest.
  assert.equal(a.qhat, b.qhat, "same input ⇒ same q̂");
  assert.equal(a.set_digest, b.set_digest, "same input ⇒ same set_digest");
  // Permutation-invariance — a shuffle of the SAME multiset ⇒ same q̂ and same digest (both sort).
  assert.equal(c.qhat, a.qhat, "a permutation of the scores yields the same q̂");
  assert.equal(c.set_digest, a.set_digest, "a permutation of the scores yields the same set_digest");
});

// Test — QUANTILE-INFINITE fail-closed (§3): p>n ⇒ under_calib, q̂:null, NEVER a clamped score. n=5,
// α=0.05, nMin=1: p=⌈6·0.95⌉=⌈5.7⌉=6 > 5 ⇒ under_calib. nMin=1 ≤ n, so this isolates the p>n branch
// (not n<nMin). Also cover n<nMin. Mutant: return the max score instead of null ⇒ the null assertions red.
test("calibrate_fails_closed_on_insufficient_calibration", () => {
  // p > n (the "quantile at +inf" case): never a silently clamped q̂.
  const pOverN = runCalibrate({ scores: [0.2, 0.4, 0.6, 0.8, 1.0], alpha: 0.05, nMin: 1 });
  assert.equal(pOverN.qhat, null, "p>n ⇒ q̂ is null (NEVER clamped to the max score)");
  assert.equal(pOverN.reason, "under_calib", "p>n ⇒ reason under_calib");
  assert.equal(pOverN.n, 5, "n is still echoed on the fail-closed path");
  assert.match(pOverN.set_digest, /^[0-9a-f]{64}$/, "a digest is still emitted on the fail-closed path");

  // n < nMin: also fail-closed under_calib.
  const underMin = runCalibrate({ scores: [0.1, 0.2, 0.3], alpha: 0.1, nMin: 50 });
  assert.equal(underMin.qhat, null, "n<nMin ⇒ q̂ is null");
  assert.equal(underMin.reason, "under_calib", "n<nMin ⇒ reason under_calib");
});

// Test — MUTANT OF CAP (§3): n > CALIBRATE_MAX_N ⇒ CalibrateToolError (the belt-and-suspenders backstop
// behind the schema maxItems, exercised on a DIRECT in-process call). The HTTP boundary path (n>cap ⇒
// 400, α∉(0,1) ⇒ 400 tool_error) is in http.test.ts. Mutants: remove the `n > CALIBRATE_MAX_N` guard ⇒
// (a) stops throwing; a `>=`-for-`>` slip ⇒ n==cap starts throwing (killed by the boundary case below).
test("calibrate_rejects_over_the_score_cap", () => {
  assert.equal(CALIBRATE_MAX_N, 10000, "the score cap is 10000 (ADR-M007 D2)");
  const over: CalibrateInput = { scores: new Array<number>(CALIBRATE_MAX_N + 1).fill(0), alpha: 0.1, nMin: 5 };
  assert.throws(() => runCalibrate(over), CalibrateToolError, "n > cap ⇒ a tool error, never a silent output");
  // boundary: exactly the cap is accepted (kills a `>=`-for-`>` mutant and a wrong cap value).
  const atCap: CalibrateInput = { scores: new Array<number>(CALIBRATE_MAX_N).fill(0.5), alpha: 0.1, nMin: 1 };
  assert.doesNotThrow(() => runCalibrate(atCap), "n == cap is accepted (upper bound, not exclusive)");
});

// Test — FAIL-CLOSED on bad params (D4): α∉(0,1), a non-finite score, and a bad nMin are each a tool
// error, never a silent output. The non-finite score MUST fail BEFORE calibDigest (D4), so the message
// is the tool's, not calibDigest's bare Error. Mutant: validate α with `>=0 && <=1` (accepting 0/1) ⇒
// the α=1 / α=0 cases red; move the finiteness check AFTER calibDigest ⇒ the message assertion reds.
test("calibrate_fails_closed_on_bad_params", () => {
  const base = { scores: [0.1, 0.2, 0.3, 0.4, 0.5], nMin: 3 };
  assert.throws(() => runCalibrate({ ...base, alpha: 0 }), CalibrateToolError, "α=0 is out of the open interval");
  assert.throws(() => runCalibrate({ ...base, alpha: 1 }), CalibrateToolError, "α=1 is out of the open interval");
  assert.throws(() => runCalibrate({ ...base, alpha: 1.5 }), CalibrateToolError, "α>1 is refused");
  assert.throws(() => runCalibrate({ ...base, alpha: Number.NaN }), CalibrateToolError, "α NaN is refused");
  // nMin (belt-and-suspenders beyond D4's literal list, gate.ts:90 motif): non-integer / < 1 ⇒ tool error.
  assert.throws(() => runCalibrate({ ...base, alpha: 0.1, nMin: 0 }), CalibrateToolError, "nMin < 1 is refused");
  assert.throws(() => runCalibrate({ ...base, alpha: 0.1, nMin: 2.5 }), CalibrateToolError, "non-integer nMin is refused");
  // a non-finite score ⇒ a CalibrateToolError with the TOOL's message (validated before calibDigest, D4).
  assert.throws(
    () => runCalibrate({ scores: [0.1, Number.POSITIVE_INFINITY, 0.3], alpha: 0.1, nMin: 1 }),
    (e: unknown) => e instanceof CalibrateToolError && /scores\[1\]/.test(e.message),
    "a non-finite score is a tool error naming the index, thrown before calibDigest",
  );
});

// Test — M-5 (ADR-M007 D3): BOTH output shapes validate against the projected output schema. `reason`
// is IN the schema and `qhat` is nullable, so the FAIL-CLOSED shape (qhat:null, reason:"under_calib")
// survives `additionalProperties:false` — the SDK validates structuredContent on the way out, and this
// is the reviewer's first question. This test ALSO proves `fromJsonSchema` compiled the `const:"split"`
// and `type:["number","null"]` keywords (else this import-time build would have thrown). Mutant: drop
// `reason` from CALIBRATE_OUTPUT_SCHEMA.required (or its `properties`) ⇒ the closed schema rejects the
// fail-closed shape here.
test("calibrate_both_output_shapes_validate_against_the_projected_schema", async () => {
  const covered = runCalibrate({ scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], alpha: 0.1, nMin: 5 });
  assert.equal(typeof covered.qhat, "number", "the covered shape carries a numeric q̂ (non-vacuity)");
  const okValidated = await calibrateOutputStandardSchema["~standard"].validate(covered);
  assert.equal(okValidated.issues, undefined, "the covered output validates against the closed schema");

  const failClosed = runCalibrate({ scores: [0.1, 0.2, 0.3], alpha: 0.1, nMin: 50 });
  assert.equal(failClosed.qhat, null, "the fail-closed shape carries a null q̂ (non-vacuity)");
  const failValidated = await calibrateOutputStandardSchema["~standard"].validate(failClosed);
  assert.equal(failValidated.issues, undefined, "the fail-closed output (qhat:null, reason:under_calib) validates too (M-5)");
});

// Test — the projected schemas match ADR-M007 D2/D3 shapes exactly (non-frozen, declared in
// schema-projection.ts, never in schemas/). Mutant: drop `reason` from required (M-5) or make `qhat`
// non-nullable ⇒ red.
test("calibrate_schema_shapes_match_the_adr", () => {
  // INPUT (D2): closed, requires scores/alpha/nMin, scores capped by maxItems.
  assert.equal(CALIBRATE_INPUT_SCHEMA["additionalProperties"], false, "input is a closed envelope");
  assert.deepEqual(CALIBRATE_INPUT_SCHEMA["required"], ["scores", "alpha", "nMin"], "input requires scores, alpha, nMin");
  const inProps = asObj(CALIBRATE_INPUT_SCHEMA["properties"], "input.properties");
  assert.equal(asObj(inProps["scores"], "input.scores")["maxItems"], CALIBRATE_MAX_N, "scores is capped by maxItems at the boundary");

  // OUTPUT (D3): closed, requires the 7 fields (reason IN the schema = M-5), qhat nullable.
  assert.equal(CALIBRATE_OUTPUT_SCHEMA["additionalProperties"], false, "output is a closed envelope");
  assert.deepEqual(
    CALIBRATE_OUTPUT_SCHEMA["required"],
    ["qhat", "n", "alpha", "method", "set_digest", "label", "reason"],
    "output requires the 7 D3 fields (reason present, M-5)",
  );
  const outProps = asObj(CALIBRATE_OUTPUT_SCHEMA["properties"], "output.properties");
  assert.deepEqual(asObj(outProps["qhat"], "output.qhat")["type"], ["number", "null"], "qhat is nullable (M-5)");
  assert.deepEqual(asObj(outProps["reason"], "output.reason")["type"], ["string", "null"], "reason is nullable");
  assert.equal(asObj(outProps["method"], "output.method")["const"], "split", "method is the const split");
  assert.equal(asObj(outProps["set_digest"], "output.set_digest")["pattern"], "^[0-9a-f]{64}$", "set_digest is a 64-hex string");
});

// Test — HONESTY (B-3 non-vacuity, §3): the harness vocab gate polices the overclaim verbs
// NEGATION-AWARE. All THREE honesty carriers (description, MCP content text, and the RUNTIME output
// label) are green; a naked surclaim in any carrier-shaped text reddens; and the honest negations that
// already live in the tree stay green (no false red). Mutant: inject "guarantees coverage" into
// CALIBRATE_LABEL ⇒ (a) the carrier scans red; delete the guarantee/probative/predicts pattern ⇒ (b) the
// surclaim scans go green.
test("calibrate_honesty_carriers_pass_the_negation_aware_vocab_gate", () => {
  const cfg = JSON.parse(readFileSync(VOCAB_PATH, "utf8")) as VocabConfig;
  const patterns = [...compilePatterns(cfg.banned), ...compilePatterns(cfg.scan.harness.banned)];

  // Non-vacuity of the config: the harness scope actually bans the three overclaim verbs (B-3).
  const hasBan = (needle: RegExp): boolean => cfg.scan.harness.banned.some((r) => needle.test(r.re));
  assert.ok(hasBan(/guarantee/), "harness scope bans a guarantee surclaim (B-3)");
  assert.ok(hasBan(/probative/), "harness scope bans a probative surclaim (B-3)");
  assert.ok(hasBan(/predicts/), "harness scope bans a predicts surclaim (B-3)");

  // (a) all THREE honesty carriers are green — including the RUNTIME output label (carrier 3/3), which
  // the source file walk never sees.
  const runtime = runCalibrate({ scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], alpha: 0.1, nMin: 5 });
  assert.deepEqual(scanText(CALIBRATE_TOOL_DESCRIPTION, patterns), [], "carrier 1/3 (description) is vocab-clean");
  assert.deepEqual(scanText(calibrateHonestyText(), patterns), [], "carrier 2/3 (MCP content) is vocab-clean");
  assert.deepEqual(scanText(runtime.label, patterns), [], "carrier 3/3 (runtime output label) is vocab-clean");
  assert.equal(runtime.label, CALIBRATE_LABEL, "the runtime label IS the declared K-1 label");

  // (b) a naked surclaim in ANY carrier-shaped text reddens (the gate is non-vacuous).
  assert.ok(scanText("this tool guarantees coverage for your model", patterns).length >= 1, "naked 'guarantees' reddens");
  assert.ok(scanText("the supplied scores are probative of correctness", patterns).length >= 1, "naked 'probative' reddens");
  assert.ok(scanText("MONARK predicts the next price move", patterns).length >= 1, "naked 'predicts' reddens");

  // (c) NO FALSE RED — the honest negations already in the tree (and the trace) stay green.
  assert.deepEqual(scanText("no guarantee, no score", patterns), [], "'no guarantee' stays green (cascade/attest honesty)");
  assert.deepEqual(scanText("the witness is demonstrative, not probative", patterns), [], "'not probative' stays green (schema-projection:208)");
  assert.deepEqual(scanText("it makes NO probative or call-time claim", patterns), [], "'no probative' stays green (attest:28)");
  assert.deepEqual(scanText("asserted by attest_makes_no_probative_claim", patterns), [], "'no_probative' identifier stays green (attest:30)");
  assert.deepEqual(scanText("declared synthetic, not a measured predictor", patterns), [], "'predictor' stays green (only 'predicts' is banned)");
});

// Test — the tool NAME is the expected literal (a stray rename would drift the registry/route set).
test("calibrate_tool_name_is_calibrate", () => {
  assert.equal(CALIBRATE_TOOL_NAME, "calibrate", "the tool name is 'calibrate'");
});
