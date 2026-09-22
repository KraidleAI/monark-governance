// MONARK rpc-guard - GARDE-HELIUS-1b-0 (D-8 / C-3c): the CLOSED table of the Solana methods a Bell course SENDS, plus a
// CONSTRUCTION-time coverage check so a --method-caps table that forgets one of them fail-closes BEFORE any course opens
// (never only at the first call). Bell (universe/collect, migrated at 1b-i/1b-ii) sends EXACTLY these four on Solana
// [measured, G0 M4]: getAccountInfo (universe -iii-a1), and getSignaturesForAddress + getTransaction +
// getTransactionsForAddress (collect). getTransactionsForAddress is the HELIUS-1 archival gTfA (10 credits on Helius,
// routed Helius-only) and is listed with the LOWEST cap by the course. The package's assertLimits already REFUSES a paid
// method absent from --method-caps at CALL time (client.ts, method_cap_unlisted); this adds the BUILD-time guarantee that
// every method a course WILL send is capped, so a forgotten method is a construction throw, not a mid-course refusal.
export const BELL_SOLANA_METHODS: readonly string[] = [
  "getSignaturesForAddress", "getTransaction", "getAccountInfo", "getTransactionsForAddress",
];

/** Throw (fail-closed, at construction) unless `methodCaps` lists a positive cap for EVERY method in `methods`. Generic
 *  (a future course passes its own closed set); Bell passes BELL_SOLANA_METHODS. A method with no cap, a non-number cap,
 *  or a cap <= 0 counts as UNCOVERED (a 0 cap would refuse every call - the same fail-open-by-omission this guards). */
export function assertMethodCapsCover(methodCaps: Readonly<Record<string, number>>, methods: readonly string[], label = "course"): void {
  const missing = methods.filter((m) => { const c = methodCaps[m]; return typeof c !== "number" || !(c > 0); });
  if (missing.length > 0) throw new Error(`rpc-guard: --method-caps for '${label}' is missing a cap (> 0) for called method(s) [${missing.join(",")}] (fail-closed, C-3c)`);
}
