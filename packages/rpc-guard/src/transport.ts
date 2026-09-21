// MONARK rpc-guard - THE SOLE allowlisted module. This is the ONE place that (a) reads a paid endpoint key from
// the environment and (b) performs a network fetch. Every other module speaks LABELS. The CI grep (T4) allowlists
// EXACTLY this file: `fetch(`, `node:http(s)`, `undici`, `child_process`, and `env.<paid-key>` are permitted here
// and NOWHERE else in the declared scope. The default transport resolves an operator LABEL -> its private URL
// INTERNALLY and never returns/serializes the URL (key hygiene, calque record.ts:29-41 scrubUrls).
//
// 1a scope: Helius (credits, cycle cap 8 M - decision 112) + the keyless Solana-Foundation witness (0 credits).
// Chainstack (RU cap 16 M - decision 115, RU/method [to be calibrated]), Databento and Polygon are FORMED items: their
// env wiring + request/RU caps land at their trigger (course-1 calibration / 1b migration), never guessed here.
import type { OperatorLabel, Transport, OperatorClass, ClientConfig, RunLimits } from "./client.ts";
import { heliusCredits } from "./tariff.ts";

/** Cycle caps live in ONE place (decisions 112/115). Helius in CREDITS; Chainstack in RU (applied from course 2). */
export const HELIUS_CYCLE_CAP_CREDITS = 8_000_000;
export const CHAINSTACK_CYCLE_CAP_RU = 16_000_000;

export interface Resolved {
  /** label -> metering class (NO URL). Handed to makeClient's ClientConfig.operators. */
  readonly classes: Readonly<Record<string, OperatorClass>>;
  /** the default transport: receives a LABEL, resolves it to a private URL internally, fetches. */
  readonly transport: Transport;
}

/** Resolve the paid endpoints from `env` INTERNALLY. Returns the LABELS + their metering classes; the URLs stay
 *  captured privately inside `transport`. `resolveConfig` folds this into a ClientConfig with the caller's limits. */
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
  // keyless witness (Solana Foundation public RPC) - traced for completeness, never capped (0 credits, ruling Q5).
  urls.set("solana-foundation", "https://api.mainnet-beta.solana.com");
  classes["solana-foundation"] = { unit: "keyless" };

  const transport: Transport = async (op, method, params) => {
    const url = urls.get(op);
    if (url === undefined) throw new Error(`rpc-guard: no endpoint for operator '${op}' (fail-closed)`);
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)}`); // sanitized: never the url/key (calque quorum statusOf)
    return (await res.json() as { result?: unknown }).result;
  };

  return { classes, transport };
}

/** Fold resolved operators + the course limits into a ClientConfig (URLs stay private in the transport). */
export function resolveConfig(env: Record<string, string | undefined>, limits: RunLimits): { config: ClientConfig; transport: Transport } {
  const { classes, transport } = resolveOperators(env);
  return { config: { operators: classes, limits }, transport };
}

/** The labels a resolved env exposes - LABELS only, never a URL (helper for callers/tests). */
export function operatorLabels(env: Record<string, string | undefined>): readonly OperatorLabel[] {
  return Object.keys(resolveOperators(env).classes) as OperatorLabel[];
}
