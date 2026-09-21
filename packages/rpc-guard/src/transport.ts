// MONARK rpc-guard - THE SOLE allowlisted module. This is the ONE place that (a) reads a paid endpoint key from the
// environment and (b) performs a network fetch. Every other module speaks LABELS. The CI grep (T4) allowlists EXACTLY
// this file. The default transport resolves an operator LABEL -> its private URL INTERNALLY and never returns/
// serializes the URL. KEY HYGIENE (C-V-3): a fetch failure (e.g. an unparseable URL) throws a TypeError whose MESSAGE
// and `.input` carry the URL+key; we NEVER propagate it - we throw a FRESH Error carrying only `label + error name`,
// scrubbed. `resolveOperators`/`makeClient`/`InMemorySink` are NOT public (index.ts): the sole public paid path is
// openGuardedClient (meter + commit + durable ledger + lock), so no public symbol reaches fetch without a ledger line.
//
// 1a scope: Helius (credits, cycle cap 8 M - decision 112) + the keyless Solana-Foundation witness (0 credits).
// Chainstack (RU cap 16 M - decision 115, RU/method to-calibrate), Databento and Polygon are FORMED items: their env
// wiring + request/RU caps land at their trigger (course-1 calibration / 1b migration), never guessed here.
import type { OperatorLabel, Transport, OperatorClass } from "./client.ts";
import { heliusCredits } from "./tariff.ts";

/** Cycle caps live in ONE place (decisions 112/115). Helius in CREDITS; Chainstack in RU (applied from course 2). */
export const HELIUS_CYCLE_CAP_CREDITS = 8_000_000;
export const CHAINSTACK_CYCLE_CAP_RU = 16_000_000;

/** Strip every http(s) URL from a string (calque apps/sentinel/src/ukemi/record.ts:33 scrubUrls, MAST secret-leak). */
export const scrubUrls = (s: string): string => s.replace(/https?:\/\/[^\s"'\\]+/gi, "<url>");

export interface Resolved {
  readonly classes: Readonly<Record<string, OperatorClass>>;
  readonly transport: Transport;
}

/** Resolve paid endpoints from `env` INTERNALLY: returns the LABELS + metering classes; the URLs stay captured
 *  privately inside `transport`. INTERNAL (not exported by index.ts) - reachable publicly only via openGuardedClient. */
export function resolveOperators(env: Record<string, string | undefined>): Resolved {
  const urls = new Map<string, string>();
  const classes: Record<string, OperatorClass> = {};

  const solana = (env.BELL_SOLANA_RPC ?? "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const heliusBase = solana[0];
  if (heliusBase !== undefined) {
    const key = env.HELIUS_API_KEY;
    urls.set("helius", key ? `${heliusBase}?api-key=${key}` : heliusBase);
    classes["helius"] = { unit: "credits", credits: heliusCredits, cycleCap: HELIUS_CYCLE_CAP_CREDITS };
  }
  // keyless witness (Solana Foundation public RPC) - traced for completeness, never capped/locked (0 credits, Q5).
  urls.set("solana-foundation", "https://api.mainnet-beta.solana.com");
  classes["solana-foundation"] = { unit: "keyless" };

  const fail = (op: string, e: unknown): never => {
    // NEVER surface the fetch error's message or `.input` (they carry the url+key); a FRESH error, label + name only.
    throw new Error(scrubUrls(`rpc-guard: transport error for operator '${op}' (${e instanceof Error ? e.name : "Error"})`));
  };
  const transport: Transport = async (op, method, params) => {
    const url = urls.get(op);
    if (url === undefined) throw new Error(`rpc-guard: no endpoint for operator '${op}' (fail-closed)`);
    let res: Response;
    try {
      res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
    } catch (e) { return fail(op, e); }
    if (!res.ok) throw new Error(`rpc-guard: HTTP ${String(res.status)} for operator '${op}'`); // sanitized: no url/key
    try { return (await res.json() as { result?: unknown }).result; } catch (e) { return fail(op, e); }
  };

  return { classes, transport };
}

/** The labels a resolved env exposes - LABELS only, never a URL. INTERNAL (used by openGuardedClient + tests). */
export function operatorLabels(env: Record<string, string | undefined>): readonly OperatorLabel[] {
  return Object.keys(resolveOperators(env).classes) as OperatorLabel[];
}
