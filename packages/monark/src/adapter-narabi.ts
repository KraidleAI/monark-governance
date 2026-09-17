// packages/monark/src/adapter-narabi.ts — the Narabi AttestedFlow -> Prediction adapter (ADR-M008 D4).
//
// PURE: derives the redemption VELOCITY from a VERIFIED `AttestedFlow` and emits the frozen `Prediction`
// (a velocity FORECAST), wrapped in the K-1 envelope (label + provenance live OUTSIDE the frozen,
// additionalProperties:false contract, exactly like adapter-shogen.ts). Our own code, no npm dependency.
//
// The velocity is NEVER carried pre-computed in the contract (the emitted-meaning gap, ADR-M008 D2): it
// is RECALCULABLE here from the raw counts + block range. The forecast rule is a DECLARED, NAMED baseline
// (persistence: v̂_{t,t+h} = v_t) — honest for F1; a sourced model supersedes it per-class (D7bis). No peg
// score, no p(run), no advice: a flow is measured under coverage, never scored.
//
// K-8: this module lives in packages/monark/src (NOT apps/harness/src/tools), so it may hash. It reads NO
// network / fs / env / current clock — `produced_at` is DERIVED from the CARRIED `observed_at.instant`
// (a pure transformation of carried data), nothing else.
import { createHash } from "node:crypto";
import {
  assertClosedAttestedFlow,
  assertClosedPrediction,
  assertNoForbiddenKey,
  serializeAttestedFlow,
  ATTESTED_FLOW_RESIDUALS,
} from "@monark/contracts";
import type { AttestedFlow, Prediction, CoverageReason } from "@monark/contracts";

/** The frozen contract version (ADR-M001) — a constant, never carried by the inputs. */
const SCHEMA_VERSION = "1.0.0";

/** The committed task_class for the Narabi velocity forecast (ADR-M008 D4). "24h" = the forecast horizon h. */
export const NARABI_TASK_CLASS = "stable-run-velocity-24h";

/**
 * The F1 baseline forecaster: PERSISTENCE — v̂_{t,t+h} = v_t (this window's measured velocity). DECLARED
 * and honest; the nonconformity pair for F2 is (v̂, v realized next window). A sourced model per-class
 * (D7bis) supersedes it with its OWN formula segment.
 * v2 (2026-09-16, advisor-defi + investor ruling): v_t is now the fraction of the OPENING stock (was the
 * closing-supply odds) — the definition changed, so the segment bumped for auditability.
 *
 * This is the FORMULA-VERSION segment only. The committed-calibration KEY (ADR-M008 Amendement bis) is
 * `<formula>@<chain>/<token>` — the naked formula on its own matches NO committed key ⇒ under_calib.
 */
export const NARABI_FORMULA = "narabi:persistence-v2";

/** Reject the frozen `label_schema` separator '|' in a key segment (B-3: a '|' would forge a false schema). */
function assertNoPipe(segment: string, where: string): void {
  if (segment.includes("|")) {
    throw new Error(`narabiPredictorId: '|' is forbidden in the ${where} segment (B-3): ${segment}`);
  }
}

/**
 * Derive the committed-calibration KEY `predictor_id = <formula>@<chain>/<token>` from the ATTESTED
 * population fields (ADR-M008 Amendement bis, advisor option (i')): `chain` (CAIP-2) + `subject` (the
 * canonical token, convention A4). Canonicalized: lowercased (hex, ADR-M001 C5); '|' rejected (B-3). The
 * SAME function is used by the adapter (which EMITS the id) and by the harness calibration registry (which
 * MATCHES it) — no duplicated registry, no issuer→family map. A naked formula, another token, or another
 * chain yields a DIFFERENT key ⇒ the gate abstains `under_calib` (isolation of population on the wire, C-10).
 */
export function narabiPredictorId(chain: string, subject: string): string {
  assertNoPipe(chain, "chain");
  assertNoPipe(subject, "token");
  return `${NARABI_FORMULA}@${chain.toLowerCase()}/${subject.toLowerCase()}`;
}

/** The K-1 honesty label (ADR-M008 D5). Lives on the envelope, NEVER inside the frozen contract. */
export const NARABI_LABEL =
  "measured redemption flow; velocity forecast conformalized under coverage; not a peg score, not advice";

/** Velocity unit = fraction of the OPENING supply redeemed per HOUR (homogeneous across window sizes, D4). */
const WINDOW_HOURS: Record<AttestedFlow["window"], number> = { "1h": 1, "24h": 24 };

/**
 * Fixed-point scale for burns/S_open. The fraction is ≤ 1 in the normal regime (burns ≤ opening stock),
 * so `burns·10^12/S_open < 2^53` and the Number narrowing is EXACT; intra-window churn (mints > close)
 * can push it above 1 (attributable to the carried `mints`, never a rejection) but it stays finite for
 * any uint256. A ratio below 1e-12 truncates to 0 (negligible for run detection). NOT a general exactness claim.
 */
const RATIO_SCALE = 1_000_000_000_000n;

/**
 * Max `observed_at.instant` (Unix seconds) the frozen `Prediction.produced_at` (format: date-time,
 * RFC-3339, 4-digit year) can carry: the last second of year 9999. Beyond it `toISOString()` emits the
 * `+0YYYYY` extended form ajv rejects (G2-delta R-DELTA-1). Verified: 253_402_300_799 → "9999-12-31T23:59:59Z".
 */
const MAX_INSTANT_SECONDS = 253_402_300_799;

/**
 * Reasons the adapter can refuse — a NON-attestation COMPUTATION fault ⇒ frozen COVERAGE_REASONS literals
 * ONLY (ADR-M008 D3, validateur #9). An attestation fault (attestor silence/termination) is a RESIDUAL on
 * the AttestedFlow, not an adapter error: it rides in `flow.residual`, never here.
 */
export type NarabiAdapterErrorReason = Extract<CoverageReason, "non_evaluable" | "binding_broken">;

/** Provenance of one adapted output (K-1) — recomputable from the inputs. */
export interface NarabiProvenance {
  readonly source_flow_sha256: string;
  readonly window: AttestedFlow["window"];
  readonly from_block: number;
  readonly to_block: number;
  /** The per-hour velocity the forecast is built on, recomputed here from the raw counts. */
  readonly velocity_per_hour: number;
}

/** The K-1 envelope: only `prediction` is a frozen contract; `provenance`/`label` live OUTSIDE it. */
export interface NarabiOutput {
  readonly prediction: Prediction;
  readonly provenance: NarabiProvenance;
  readonly label: string;
}

/** A named, fail-closed refusal. Never a default, never a partial `Prediction`. */
export interface NarabiError {
  readonly error: true;
  readonly reason: NarabiAdapterErrorReason;
  readonly message: string;
}

/** True iff a `fromAttestedFlow` result is the refusal branch. */
export function isNarabiError(x: unknown): x is NarabiError {
  return typeof x === "object" && x !== null && (x as { error?: unknown }).error === true;
}

function fail(reason: NarabiAdapterErrorReason, message: string): NarabiError {
  return { error: true, reason, message };
}

const DECIMAL = /^[0-9]+$/;

function sha256HexUtf8(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** ISO-8601 from the CARRIED Unix-seconds instant — pure (an argument-ed Date, never the current clock). */
function isoFromInstant(instant: number): string {
  return new Date(instant * 1000).toISOString();
}

/**
 * Projects a VERIFIED `AttestedFlow` into the frozen `Prediction` (a per-hour velocity forecast), wrapped
 * in the K-1 envelope. Pure. Returns a named `NarabiError` on any non-conforming input.
 */
export function fromAttestedFlow(flow: AttestedFlow): NarabiOutput | NarabiError {
  // (1) The input must be a closed, forbidden-key-free AttestedFlow (fail-closed, not a partial).
  try {
    assertClosedAttestedFlow(flow);
    assertNoForbiddenKey(flow);
  } catch (e) {
    return fail("binding_broken", `input is not a closed AttestedFlow: ${(e as Error).message}`);
  }

  const { burns, mints, supply, from_block, to_block } = flow.flow;

  // (2) VALUE guards the closed-check (keys only) does not express (fail-closed, NEVER a partial). The
  //     schema enforces these too, but the adapter re-guards so a caller that skips validation cannot
  //     smuggle a NaN forecast or a silent out-of-enum residual past us (ADR-M008 D3, MAST contrat↔adaptateur).
  if (!(flow.window in WINDOW_HOURS)) {
    return fail("binding_broken", `unknown window '${flow.window}' (expected 1h|24h)`);
  }
  for (const r of flow.residual) {
    if (!(ATTESTED_FLOW_RESIDUALS as readonly string[]).includes(r)) {
      return fail("binding_broken", `residual '${r}' outside the closed enum (ADR-M008 D3)`);
    }
  }
  if (!DECIMAL.test(burns) || !DECIMAL.test(supply) || !DECIMAL.test(mints)) {
    return fail("binding_broken", "flow counts must be decimal-string uint256");
  }
  if (!Number.isInteger(from_block) || !Number.isInteger(to_block) || to_block < from_block) {
    return fail("binding_broken", `invalid block range [${String(from_block)}, ${String(to_block)}]`);
  }
  // observed_at.instant is unbounded above in the schema, but `produced_at` carries `format: date-time`
  // (RFC-3339, a 4-DIGIT year). The bound is therefore the last second of year 9999 (253_402_300_799 s =
  // 9999-12-31T23:59:59Z): beyond it `toISOString()` emits the `+0YYYYY` extended form that ajv REJECTS —
  // and past ~8.64e12 s it throws RangeError outright. Guard on the SCHEMA-valid range (not merely the
  // Date-representable range, G2-delta R-DELTA-1) so a schema-valid but out-of-range instant is a NAMED
  // refusal, never a schema-INVALID Prediction returned as success nor an uncaught throw (R1 class).
  const instant = flow.observed_at.instant;
  if (!Number.isInteger(instant) || instant < 0 || instant > MAX_INSTANT_SECONDS) {
    return fail("binding_broken", `observed_at.instant out of the date-time range [0, ${String(MAX_INSTANT_SECONDS)}]: ${String(instant)}`);
  }
  // v_t is the FRACTION of the OPENING stock redeemed per hour (Diamond–Dybvig), a true fraction — NOT
  // burns/closing-supply (the odds f/(1−f): can exceed 1, endogenous, and mislabelled a "fraction";
  // advisor-defi 2026-09-16, ADR-M008 D4). `supply` on the wire stays the window-CLOSE value (D2); the
  // OPENING supply is recomputed EXACTLY from the carried counts by window conservation
  // (S_close = S_open − burns + mints  ⇒  S_open = S_close + burns − mints), so NO wire field / schema
  // change. The identity totalSupply(from_block−1) == S_close + burns − mints is verified by the OFF-TOOL
  // ingestion (K-8), fail-closed on mismatch — a free on-chain integrity oracle (D4 C1).
  const burnsBig = BigInt(burns);
  const sOpen = BigInt(supply) + burnsBig - BigInt(mints);
  if (sOpen <= 0n) {
    // Genesis window, or a rebasing/negative-rebase wrapper where the conservation identity breaks
    // (out of class, Mondrian) ⇒ velocity undefined. NB: supply_close = 0 with a REAL drain is NOT
    // non_evaluable under start-supply — it is the STRONGEST signal (f = 1, v = 1/Δ).
    return fail("non_evaluable", "opening supply (close + burns − mints) <= 0 — velocity undefined (genesis or out-of-class rebasing wrapper)");
  }

  // (3) v_t = (burns / S_open) / Δ_hours — fraction of the OPENING stock redeemed per hour (D4). Numerator
  // is burns ONLY (not net burns−mints); `mints` enters solely through the exact S_open reconstruction.
  const ratio = Number((burnsBig * RATIO_SCALE) / sOpen) / Number(RATIO_SCALE);
  const velocityPerHour = ratio / WINDOW_HOURS[flow.window];

  // (4) The F1 forecast: PERSISTENCE — v̂_{t,t+h} = v_t (declared baseline; a number yhat, regression).
  const yhat = velocityPerHour;
  if (!Number.isFinite(yhat)) {
    return fail("binding_broken", "velocity forecast is not finite"); // belt-and-suspenders after the guards above
  }

  // (5) The frozen Prediction — the SAME contract HIKAE conformalizes; features_digest binds the flow.
  //     predictor_id is the committed-calibration KEY `<formula>@<chain>/<token>` (ADR-M008 Amendement
  //     bis): the attested population (`source.chain` + `subject`) is copied VERBATIM, canonicalized, into
  //     the key — no issuer→family map here (the registry lives in the harness calibration.ts, option (i')).
  const prediction: Prediction = {
    schema_version: SCHEMA_VERSION,
    task_class: NARABI_TASK_CLASS,
    yhat,
    predictor_id: narabiPredictorId(flow.source.chain, flow.subject),
    produced_at: isoFromInstant(instant),
    features_digest: flow.utterance.hash,
  };

  // (6) Fail-closed on the frozen contract: ONLY `prediction` must pass (label/provenance are outside, K-1).
  try {
    assertClosedPrediction(prediction);
    assertNoForbiddenKey(prediction);
  } catch (e) {
    return fail("binding_broken", `mapped prediction is not a closed Prediction: ${(e as Error).message}`);
  }

  // (7) The K-1 envelope: the content digest binds the input, the block range names the recompute domain.
  return {
    prediction,
    provenance: {
      source_flow_sha256: sha256HexUtf8(serializeAttestedFlow(flow)),
      window: flow.window,
      from_block,
      to_block,
      velocity_per_hour: velocityPerHour,
    },
    label: NARABI_LABEL,
  };
}
