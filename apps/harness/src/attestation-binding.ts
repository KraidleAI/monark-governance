/**
 * Harness — the committed attestation-binding table (ADR-M017 D2(i)(ii)).
 *
 * P1 DECLARES — it never VERIFIES — the consistency between a caller-carried `AttestedPrice.subject`
 * and the served `task_class`. The subject is the exact URL string the Shogen witness attested (e.g.
 * the Binance BTCUSDT ticker, fixtures/h5-e2e-trace.json:292); the rule is EXACT string membership in
 * a static, committed table, TOTAL over the FOUR served classes (ADR-M017 D2(i), C'-2; ADR-U4b D5):
 *   - btc-dir-15m             -> [ the Binance BTCUSDT ticker URL of the committed h5 fixture ]
 *   - stable-run-velocity-24h -> [] (Narabi attests flows, not prices; any attested is inconsistent, declared)
 *   - cascade-liquidable-24h  -> [] (a fixture class with no subject URL; any attested is inconsistent, declared)
 *   - liquidation-eligible-coverage -> [] (the book is not an attested price feed; any attested is inconsistent, declared — ADR-U4b D5)
 * A class OUTSIDE the table is a BYO / free class: `attested` is not accepted for it in P1 (an item
 * formed, ADR-M017 D2(i)). No bytes are recomputed, no verifier is executed here (that is offline / the
 * Shogen verifier); "no temporal binding in P1" — `observed_at` is not compared.
 *
 * This module sits at `src/` (NOT `src/tools/`, so the K-8 side-effect scan of the tools stays
 * meaningful): it does NO I/O and imports nothing from the tools — pure data + one pure predicate,
 * consumed by the gate guard (gate.ts:runGate). The class-name keys mirror the frozen served
 * identifiers gate.ts TASK_* ; a Map (not a plain object) keeps a caller-controlled printable-ASCII
 * `task_class` (e.g. "__proto__"/"constructor") from ever resolving to a prototype member.
 */

/** The exact URL string the committed h5 Shogen witness attested (fixtures/h5-e2e-trace.json:292). */
export const BINANCE_BTCUSDT_TICKER_URL = "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT";

/**
 * Committed subject-binding table, TOTAL over the FOUR served task classes (ADR-M017 D2(i), C'-2; ADR-U4b
 * D5). A key PRESENT with `[]` is DISTINCT from a key ABSENT: the two feed the two distinct fail-closed
 * messages below (a "returns [] by default" mutant collapses them and reddens test (2) on the TEXT). The
 * `liquidation-eligible-coverage` class is PRESENT with `[]` (the book is not an attested price feed), so
 * any caller-carried `attested` on it fails closed with the "not consistent" text (mutant (j): drop the
 * line ⇒ the class falls to the "not accepted for BYO" text ⇒ u4b_attested_not_accepted_for_liq_class reds).
 */
export const ATTESTATION_BINDING: ReadonlyMap<string, readonly string[]> = new Map<string, readonly string[]>([
  ["btc-dir-15m", [BINANCE_BTCUSDT_TICKER_URL]],
  ["stable-run-velocity-24h", []],
  ["cascade-liquidable-24h", []],
  ["liquidation-eligible-coverage", []],
]);

/**
 * Declared consistency between an attestation subject and the served task class (ADR-M017 D2(i)(ii)).
 * PURE. Returns `undefined` when the subject is declared-consistent with the class (exact membership),
 * else the fail-closed tool-error MESSAGE (the caller — gate.ts — raises it as a HarnessToolError => 400,
 * http.ts TOOL_ERROR_NAMES). The two texts are DISTINCT and both name the subject AND the class:
 *   - class NOT in the table (BYO / free) -> "attested is not accepted for BYO classes in P1: ..."
 *   - class in the table, subject absent  -> "attested.subject is not consistent with task_class: ..."
 * The TEXT (not the 400 alone) is what test (2) asserts, so the "table returns [] by default" mutant
 * (which would answer "not consistent" for a BYO class instead of "not accepted") reddens.
 */
export function checkAttestedConsistency(taskClass: string, subject: string): string | undefined {
  const subjects = ATTESTATION_BINDING.get(taskClass);
  if (subjects === undefined) {
    return `attested is not accepted for BYO classes in P1: task_class '${taskClass}' has no committed attestation subject (subject '${subject}')`;
  }
  if (!subjects.includes(subject)) {
    return `attested.subject is not consistent with task_class: subject '${subject}' is not a committed attestation subject for task_class '${taskClass}'`;
  }
  return undefined;
}
