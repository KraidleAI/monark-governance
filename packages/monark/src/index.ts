/**
 * MONARK — the cross-agent integration ADAPTERS barrel (ADR-M005 D3, ADR-M008 D4).
 *
 * `@monark/monark` publishes a single `.` entry (package.json `exports`); this barrel is where the
 * MONARK integration adapters are exposed to downstream consumers (the harness `attest` and `cascade`
 * paths and `calibrate`, ADR-M005 H3). Two PURE adapters compose REAL upstream artefacts into the
 * frozen contracts (the four frozen contracts are unchanged):
 *   - Shogen  ->  AttestedPrice   (adapter-shogen.ts: canonical-CBOR temoignage + verdict + constat).
 *   - Narabi  ->  Prediction      (adapter-narabi.ts: a redemption-velocity forecast over AttestedFlow).
 *
 * The former single-call composed-gate entry point was RETIRED in P1-b3 (ADR-M017 D2(v), ADR-M019):
 * the served composed path is the `attested` envelope key of the harness `gate` tool (ADR-M017 D2), never
 * a `packages/monark` entry point; the Ukemi cascade prediction reaches that same served `gate` as a
 * caller-carried `prediction` (fixture class, abstains under_calib by construction). See ADR-M003 D4
 * (amended 2026-09-18) and ADR-M005 D3 (supersession declared).
 */

// Adapter surface — re-exported on the barrel for downstream consumers (the harness `attest`
// tool, ADR-M005 H3). `@monark/monark` exposes a single `.` entry (package.json `exports`), so the barrel
// is where the Shogen -> AttestedPrice adapter is published. Additive; the frozen contracts are unchanged.
export { fromShogen, isAdapterError, DEMONSTRATIVE_LABEL, SHOGEN_HEAD_SHA } from "./adapter-shogen.ts";
export type { AdapterOutput, AdapterError, AdapterProvenance, AdapterErrorReason } from "./adapter-shogen.ts";

// Narabi — the AttestedFlow -> Prediction (velocity forecast) adapter (ADR-M008 D4). Additive; the frozen
// contracts are unchanged. The velocity is derived here (recalculable), never carried pre-computed.
export {
  fromAttestedFlow,
  isNarabiError,
  NARABI_TASK_CLASS,
  NARABI_FORMULA,
  narabiPredictorId,
  NARABI_LABEL,
} from "./adapter-narabi.ts";
export type { NarabiOutput, NarabiError, NarabiProvenance, NarabiAdapterErrorReason } from "./adapter-narabi.ts";

// Ukemi — the AttestedBook adapter PAIR (consumer + producer) and the SINGLE canonical-serialization
// definition (ADR-U1b D5/D8). Additive; the frozen contracts are unchanged. The book domain's canonical
// form lives here (imported by apps/sentinel/src/ukemi, no second definition — C-1).
export { fromAttestedBook, toAttestedBook, isBookError, BOOK_LABEL } from "./adapter-book.ts";
export type { BookOutput, BookError, BookProvenance, BookAdapterErrorReason, AttestedBookContext, RecordedBook } from "./adapter-book.ts";
// U-5a — the PURE per-account yhat producer (decision 123/132). Emits {yhat, m_bps, pstar} by the frozen
// close-factor rule; the harness `ukemi-predict` tool builds the K-1 envelope and derives the stratum.
export { fromRealizedBook, isRealizedError } from "./adapter-book.ts";
export type {
  RealizedBookSlice,
  RealizedReserve,
  RealizedBalance,
  RealizedAccount,
  RealizedOracleParams,
  RealizedOracleUpdate,
  RealizedYhat,
  RealizedRefusalReason,
} from "./adapter-book.ts";
export { canonicalStringify, bookDigest, canonicalAttestedBook, attestedBookDigest, NonCanonicalNumberError } from "./book-canonical.ts";
export type { Canon, CanonicalEnvelope } from "./book-canonical.ts";
