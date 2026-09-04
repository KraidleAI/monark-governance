/**
 * Closed-contract enforcement (ADR-M001 D7 / C8) — the PRIMARY guard.
 *
 * Mirrors Shogen's decoder, which REFUSES an unknown key (`CleInconnue`) rather
 * than ignoring it. Each object shape declares its exact allowed keys; any key
 * outside the set is refused. This subsumes the forbidden-key list (a forbidden
 * key is, by construction, not an allowed key); the recursive FORBIDDEN_KEYS
 * check in forbidden-keys.ts is defense in depth.
 *
 * The allowed-key sets are kept provably in sync with ../../schemas/*.json
 * (additionalProperties:false) by contracts.test.ts.
 */

export const ALLOWED_KEYS = {
  attestedPrice: [
    "schema_version", "subject", "attestor", "residual", "transport",
    "utterance", "observed_at", "octets_recalcules", "verifier_revision", "sens_emis_digest",
  ],
  attestor: ["identity", "key"],
  utterance: ["hash", "bytes"],
  observedAt: ["clock", "instant"],
  prediction: ["schema_version", "task_class", "yhat", "predictor_id", "produced_at", "features_digest"],
  coverageVerdict: [
    "schema_version", "task_class", "method", "alpha", "n_calib", "region",
    "qhat", "abstain", "reason", "residual", "scores", "calib_digest", "produced_at",
  ],
  regionSet: ["kind", "labels", "label_schema"],
  regionInterval: ["kind", "lo", "hi"],
  gateDecision: [
    "schema_version", "action", "allow", "tool", "intent",
    "verdict", "remaining_budget", "reason",
  ],
} as const;

function asObject(value: unknown, where: string): Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`MONARK closed-check: expected an object at ${where}, got ${describe(value)}.`);
  }
  return value as Record<string, unknown>;
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}

function assertOnlyKeys(obj: Record<string, unknown>, allowed: readonly string[], where: string): void {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) {
      throw new Error(`MONARK unknown key '${key}' in ${where} — closed contract (CleInconnue-style, ADR-M001 C8).`);
    }
  }
}

export function assertClosedAttestedPrice(value: unknown): void {
  const v = asObject(value, "AttestedPrice");
  assertOnlyKeys(v, ALLOWED_KEYS.attestedPrice, "AttestedPrice");
  const attestor = v["attestor"];
  if (Array.isArray(attestor)) {
    attestor.forEach((a, i) => assertOnlyKeys(asObject(a, `AttestedPrice.attestor[${i}]`), ALLOWED_KEYS.attestor, `AttestedPrice.attestor[${i}]`));
  }
  if (v["utterance"] !== undefined) assertOnlyKeys(asObject(v["utterance"], "AttestedPrice.utterance"), ALLOWED_KEYS.utterance, "AttestedPrice.utterance");
  if (v["observed_at"] !== undefined) assertOnlyKeys(asObject(v["observed_at"], "AttestedPrice.observed_at"), ALLOWED_KEYS.observedAt, "AttestedPrice.observed_at");
}

export function assertClosedPrediction(value: unknown): void {
  assertOnlyKeys(asObject(value, "Prediction"), ALLOWED_KEYS.prediction, "Prediction");
}

export function assertClosedCoverageVerdict(value: unknown): void {
  const v = asObject(value, "CoverageVerdict");
  assertOnlyKeys(v, ALLOWED_KEYS.coverageVerdict, "CoverageVerdict");
  const region = v["region"];
  if (region !== undefined) {
    const r = asObject(region, "CoverageVerdict.region");
    const kind = r["kind"];
    if (kind === "set") assertOnlyKeys(r, ALLOWED_KEYS.regionSet, "CoverageVerdict.region(set)");
    else if (kind === "interval") assertOnlyKeys(r, ALLOWED_KEYS.regionInterval, "CoverageVerdict.region(interval)");
    else throw new Error(`MONARK closed-check: unknown region kind '${String(kind)}' in CoverageVerdict.region.`);
  }
}

export function assertClosedGateDecision(value: unknown): void {
  const v = asObject(value, "GateDecision");
  assertOnlyKeys(v, ALLOWED_KEYS.gateDecision, "GateDecision");
  if (v["verdict"] !== undefined) assertClosedCoverageVerdict(v["verdict"]);
}
