/**
 * Fleet invariant (ADR-M001 D7 / C8) — DEFENSE IN DEPTH behind the closed schemas.
 * Union of two primary-source disciplines:
 *   - Shogen 03 §0 (temoignage_canonique.rs L15-19): no truth field, no confidence
 *     score, no "validated".
 *   - Grok hac-cp.ts:77: p_correct, confidence, hallucination_score, hallucination.
 * The check is RECURSIVE (mirrors Grok's `hasForbiddenKey`, NOT the root-only
 * `serializeVerdict`): a forbidden key at ANY depth is refused.
 * Kept in sync with ../../schemas/forbidden-keys.json by contracts.test.ts.
 */
export const FORBIDDEN_KEYS: readonly string[] = [
  "p_correct",
  "confidence",
  "hallucination",
  "hallucination_score",
  "truth",
  "verite",
  "validated",
  "valide",
  "certainty",
  "trust",
  "score_de_confiance",
  "verdict_de_verite",
  // Narabi / AttestedFlow surface (ADR-M008 D5): a redemption flow is measured under coverage, never
  // scored. These keys are never legitimate anywhere in the fleet ⇒ banned globally. (NOTE: `price`/`mid`
  // are NOT here — they are legitimate on the `attest` envelope; they are banned on AttestedFlow by its
  // closed schema alone.)
  "peg_score",
  "p_depeg",
  "nav",
] as const;

const FORBIDDEN = new Set<string>(FORBIDDEN_KEYS);

/** Returns the JSON path of the first forbidden key found (any depth), else null. */
export function findForbiddenKey(value: unknown, path = "$"): string | null {
  if (Array.isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const hit = findForbiddenKey(value[i], `${path}[${i}]`);
      if (hit !== null) return hit;
    }
    return null;
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const key of Object.keys(obj)) {
      if (FORBIDDEN.has(key)) return `${path}.${key}`;
      const hit = findForbiddenKey(obj[key], `${path}.${key}`);
      if (hit !== null) return hit;
    }
  }
  return null;
}

/** Throws if any forbidden key appears at any depth. */
export function assertNoForbiddenKey(value: unknown): void {
  const hit = findForbiddenKey(value);
  if (hit !== null) {
    throw new Error(
      `MONARK forbidden key at ${hit} — fleet invariant, no truth/confidence field (ADR-M001 D7).`,
    );
  }
}
