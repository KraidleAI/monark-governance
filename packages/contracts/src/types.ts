/**
 * MONARK — frozen interface contracts (TS binding).
 * Source of truth: ../../schemas/*.json (language-neutral). ADR-M001.
 *
 * Discipline (ADR-M001 D7, fleet invariant): NO truth/confidence field anywhere.
 * Shogen 03 §0 (no verite, no confidence score, no "validated") ∪ Grok hac-cp.ts:77
 * (no p_correct/confidence/hallucination*). Enforced in code: closed-check.ts + forbidden-keys.ts.
 *
 * These are pure types (erased at runtime by Node type-stripping); the closed
 * enums are derived from the single runtime source in enums.ts.
 */

import type { CoverageReason, GateAction, Method, AttestedFlowResidual } from "./enums.ts";

/** Lowercase hex, even length (e.g. an ed25519 key). */
export type Hex = string;
/** 64 lowercase hex chars = 32 bytes (a SHA-256 digest / pinned hash). */
export type Hex32 = string;
/** Semantic version "x.y.z". */
export type SemVer = string;
/** ISO-8601 date-time. */
export type IsoDateTime = string;

export interface Attestor {
  identity: string;
  key: Hex;
}

/**
 * A VERIFIED Shogen testimony (emitted only after Ok(Verdict)) — ADR-M001 D3.
 * The price NUMBER is deliberately NOT here (Shogen's "sens emis" hole,
 * ADR-0015 pt 17bis): a HIKAE-side adapter interprets `utterance.bytes` into a
 * number, optionally anchoring to `sens_emis_digest`.
 */
export interface AttestedPrice {
  schema_version: SemVer;
  /** Canonical designation of the source queried (Shogen 03 §1). */
  subject: string;
  /** ≥1 attestor, no exact duplicate. */
  attestor: Attestor[];
  /**
   * `Verdict.residus`: named transport-assumption ids (testimony's, in order,
   * then the delegation residual). NEVER aggregated into a single level (03 §2).
   * NOT "diversity residuals".
   */
  residual: string[];
  /** Attestation-mechanism id (opaque). */
  transport: string;
  utterance: {
    /** SHA-256 of the exact bytes — ALWAYS carried (ADR-0005 rule 1). */
    hash: Hex32;
    /** Exact bytes, when class policy retains them (ADR-0005 rule 2). */
    bytes?: Hex;
  };
  observed_at: {
    /** Identity of the transport's clock (never Shogen's). */
    clock: string;
    /** Timestamp in seconds, carried data (the core reads no clock). */
    instant: number;
  };
  /** Whether the hash was recomputed over carried bytes (Verdict). Mandatory (C2). */
  octets_recalcules: boolean;
  /** Revision of the binary that ran the delegated verification (provenance). */
  verifier_revision: string;
  /**
   * Digest of the emitted meaning — the datum that lets HIKAE's byte→price
   * adapter bind its interpretation to the emitted sense (C3). Declared by the
   * companion's Constat, not cross-checked by the Shogen core.
   */
  sens_emis_digest?: Hex32;
}

/**
 * A VERIFIED redemption-flow observation — the THIRD typed attestation of the fleet (Narabi,
 * ADR-M008 D2), parallel to AttestedPrice. The RAW counts are carried (as decimal-string uint256, so
 * no JS-number precision is lost) together with the `[from_block, to_block]` range that makes them
 * recalculable against `eth_getLogs`; the VELOCITY is NOT here — a HIKAE adapter derives it (the same
 * emitted-meaning gap as AttestedPrice's price number). No peg_score/p_depeg/confidence/nav, no
 * price/mid: a flow is measured under coverage, never scored.
 */
export interface AttestedFlow {
  schema_version: SemVer;
  /** The asset / wrapper whose redemption flow is observed (e.g. "msUSD"). */
  subject: string;
  /** >=1 attestor, no exact duplicate — the issuer / proof-of-reserve attestor. */
  attestor: Attestor[];
  /** Where the flow is read: the chain and the token issuer. */
  source: { chain: string; issuer: string };
  /** The observation window the raw counts are summed over. */
  window: "1h" | "24h";
  /**
   * RAW flow counts as decimal-string uint256 (adapter parses with BigInt): `supply` at window CLOSE,
   * `burns`/`mints` SUMMED over the window, plus the block range so a third party can recompute them
   * from `eth_getLogs`. NOT a pre-computed ratio (the velocity is the adapter's, recalculable).
   */
  flow: { burns: string; mints: string; supply: string; from_block: number; to_block: number };
  /** Standing assumptions, CLOSED enum (>=1), in emitted order, never aggregated. NOT scores. */
  residual: AttestedFlowResidual[];
  /** Attestation-mechanism id (opaque), e.g. the RPC + proof-of-reserve transport. */
  transport: string;
  utterance: {
    /** SHA-256 of the exact canonical payload (on-chain logs + endpoint body) — ALWAYS carried. */
    hash: Hex32;
    /** Exact bytes, when class policy retains them. */
    bytes?: Hex;
  };
  observed_at: {
    /** Identity of the transport's clock (never MONARK's). */
    clock: string;
    /** Timestamp in seconds, carried data (the core reads no clock). */
    instant: number;
  };
  /** Whether the counts were recomputed over the carried block range. Mandatory. */
  octets_recalcules: boolean;
  /** Revision of the binary that ran the delegated verification (provenance). */
  verifier_revision: string;
}

/** The upstream predictor HIKAE conformalizes — the 4th contract (ADR-M001 D6). */
export interface Prediction {
  schema_version: SemVer;
  task_class: string;
  /** Label (classification) or point (regression). */
  yhat: string | number;
  /** Venue/model, e.g. "usepod:<id>" | "internal:<name>". No UsePod is lifted. */
  predictor_id: string;
  produced_at: IsoDateTime;
  features_digest?: Hex32;
}

export type { CoverageReason, GateAction, Method, AttestedFlowResidual } from "./enums.ts";

/**
 * The prediction region — POLYMORPHIC (ADR-M001 D4/#2). `set` = classification
 * (btc-dir, pm-yesno); `interval` = regression (cascade-VaR UKEMI). Freezing
 * Grok's set-only form would have locked UKEMI out at Phase 2.
 */
export type PredictionRegion =
  | { kind: "set"; labels: string[]; label_schema: string }
  | { kind: "interval"; lo: number; hi: number };

/** HIKAE coverage verdict. NO p_correct. `alpha` = TARGET coverage, not a correctness probability. */
export interface CoverageVerdict {
  schema_version: SemVer;
  task_class: string;
  method: Method;
  alpha: number;
  n_calib: number;
  region: PredictionRegion;
  /** Conformal quantile, or null when under_calib. */
  qhat: number | null;
  abstain: boolean;
  reason: CoverageReason;
  /** Inherited from AttestedPrice.residual (traceability). */
  residual: string[];
  /** Optional payload; recalculability is by-reference via calib_digest (C5, mirrors ADR-0005). */
  scores?: number[];
  calib_digest: Hex32;
  produced_at: IsoDateTime;
}

/** HIKAE L3 decision, consumed by UKEMI + the Hermes middleware (ADR-M001 D5). */
export interface GateDecision {
  schema_version: SemVer;
  action: GateAction;
  allow: boolean;
  tool: string;
  /** string (classification) | number (regression) | null — mirrors Prediction.yhat (C6). */
  intent: string | number | null;
  verdict: CoverageVerdict;
  /**
   * B_t — remaining conformal AUTHORIZATION capacity, an attribute of MONARK
   * (ADR-CERT-MONARK). Depletable, settled by arrived labels. NEVER a return/Sharpe.
   */
  remaining_budget: number;
  reason: CoverageReason;
}
