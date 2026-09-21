// MONARK rpc-guard - THE SOLE allowlisted module. This is the ONE place that (a) reads a paid endpoint key from the
// environment and (b) performs a network fetch. Every other module speaks LABELS. The CI grep (T4) allowlists EXACTLY
// this file. The default transport resolves an operator LABEL -> its private URL INTERNALLY and never returns/
// serializes the URL. KEY HYGIENE (C-V-3): a fetch failure (e.g. an unparseable URL) throws a TypeError whose MESSAGE
// and `.input` carry the URL+key; we NEVER propagate it - we throw a FRESH Error carrying only `label + error name`,
// scrubbed. `resolveOperators`/`makeClient`/`InMemorySink` are NOT public (index.ts): the sole public paid path is
// openGuardedClient (meter + commit + durable ledger + lock), so no public symbol reaches fetch without a ledger line.
//
// Scope: Helius (credits, cycle cap 8 M - decision 112) + Chainstack (RU, cycle cap 16 M - decision 115, second
// paid operator, GARDE-HELIUS-2) + the keyless witnesses: the Solana-Foundation public RPC and the free ETH quorum
// providers the Ukemi recorder uses today as URLs (drpc/mevblocker/nodies/pocket/tenderly), now resolved LABELS
// (0 cost, counted). Databento and Polygon stay FORMED items (request caps land at their trigger, never guessed).
// This is the SOLE reader of a paid endpoint key (HELIUS_API_KEY, CHAINSTACK_ETH_URL) and the SOLE fetch site.
import type { OperatorLabel, Transport, OperatorClass } from "./client.ts";
import { heliusCredits, chainstackRu } from "./tariff.ts";

/** Cycle caps live in ONE place (decisions 112/115). Helius in CREDITS; Chainstack in RU. */
export const HELIUS_CYCLE_CAP_CREDITS = 8_000_000;
export const CHAINSTACK_CYCLE_CAP_RU = 16_000_000;

/** Default per-attempt transport timeout (C-5): an AbortController fires at this deadline so a hung endpoint cannot
 *  wedge a course. Tests inject a tiny value; the live default matches the recorder's record.ts:83 (30 s). */
export const DEFAULT_TIMEOUT_MS = 30_000;

/** Keyless ETH operator LABELS = providerOf domains of the recorder's free quorum URLs, PINNED to the same order as
 *  apps/sentinel/src/ukemi/rpc2.ts ETH_CALL_PROVIDERS / GET_LOGS_PROVIDERS (2b reconstructs the pool from these; the
 *  pinned-order lock test asserts map(providerOf) deep-equals). Labels only - never a URL. Cost 0, counted. */
export const ETH_CALL_KEYLESS_LABELS: readonly string[] = ["drpc.org", "mevblocker.io", "nodies.app", "pocket.network"];
export const GET_LOGS_KEYLESS_LABELS: readonly string[] = ["drpc.org", "mevblocker.io", "tenderly.co", "pocket.network"];
/** The distinct keyless ETH (label -> URL) captures, FIRST-SEEN order across the two pools above (drpc, mevblocker,
 *  nodies, pocket from eth_call; tenderly new from getLogs). The URL stays private inside `transport`. */
const KEYLESS_ETH: ReadonlyArray<readonly [string, string]> = [
  ["drpc.org", "https://eth.drpc.org"],
  ["mevblocker.io", "https://rpc.mevblocker.io"],
  ["nodies.app", "https://eth-pokt.nodies.app"],
  ["pocket.network", "https://eth.api.pocket.network"],
  ["tenderly.co", "https://mainnet.gateway.tenderly.co"],
];

/** Strip every http(s) URL from a string (calque apps/sentinel/src/ukemi/record.ts:33 scrubUrls, MAST secret-leak). */
export const scrubUrls = (s: string): string => s.replace(/https?:\/\/[^\s"'\\]+/gi, "<url>");

/** Transport options threaded from openGuardedClient (C-5). `onTransportError` is the injected error hook: it is
 *  called with the operator LABEL + the error NAME only, NEVER the URL (the 5%-rule monitor re-binds onto it in 2b). */
export interface TransportOpts { readonly timeoutMs?: number; readonly onTransportError?: (op: string, errorName: string) => void; }

export interface Resolved {
  readonly classes: Readonly<Record<string, OperatorClass>>;
  readonly transport: Transport;
}

/** Resolve paid endpoints from `env` INTERNALLY: returns the LABELS + metering classes; the URLs stay captured
 *  privately inside `transport`. INTERNAL (not exported by index.ts) - reachable publicly only via openGuardedClient. */
export function resolveOperators(env: Record<string, string | undefined>, opts: TransportOpts = {}): Resolved {
  const urls = new Map<string, string>();
  const classes: Record<string, OperatorClass> = {};

  const solana = (env.BELL_SOLANA_RPC ?? "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const heliusBase = solana[0];
  if (heliusBase !== undefined) {
    const key = env.HELIUS_API_KEY;
    urls.set("helius", key ? `${heliusBase}?api-key=${key}` : heliusBase);
    classes["helius"] = { unit: "credits", credits: heliusCredits, cycleCap: HELIUS_CYCLE_CAP_CREDITS };
  }
  // Chainstack: the SECOND paid operator (RU). The key lives ONLY here (env.CHAINSTACK_ETH_URL, allowlisted file).
  const chainstackUrl = env.CHAINSTACK_ETH_URL;
  if (chainstackUrl !== undefined && chainstackUrl.length > 0) {
    urls.set("chainstack", chainstackUrl);
    classes["chainstack"] = { unit: "ru", credits: chainstackRu, cycleCap: CHAINSTACK_CYCLE_CAP_RU };
  }
  // keyless witness (Solana Foundation public RPC) - traced for completeness, never capped (0 credits, Q5).
  urls.set("solana-foundation", "https://api.mainnet-beta.solana.com");
  classes["solana-foundation"] = { unit: "keyless" };
  // keyless ETH operators (the recorder's free quorum) - resolved LABELS, 0 cost, counted (2b consumes them).
  for (const [label, url] of KEYLESS_ETH) { urls.set(label, url); classes[label] = { unit: "keyless" }; }

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const onErr = opts.onTransportError;
  const fail = (op: string, e: unknown): never => {
    const name = e instanceof Error ? e.name : "Error";
    if (onErr) onErr(op, name); // label + error NAME only, never the URL (secret-leak MAST)
    // NEVER surface the fetch error's message or `.input` (they carry the url+key); a FRESH error, label + name only.
    throw new Error(scrubUrls(`rpc-guard: transport error for operator '${op}' (${name})`));
  };
  const transport: Transport = async (op, method, params) => {
    const url = urls.get(op);
    if (url === undefined) throw new Error(`rpc-guard: no endpoint for operator '${op}' (fail-closed)`);
    const ctl = new AbortController();
    const to = setTimeout(() => { ctl.abort(); }, timeoutMs); // C-5: bound a hung endpoint; cleared on every exit path
    let res: Response;
    try {
      res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    } catch (e) { return fail(op, e); } finally { clearTimeout(to); }
    if (!res.ok) throw new Error(`rpc-guard: HTTP ${String(res.status)} for operator '${op}'`); // sanitized: no url/key
    try { return (await res.json() as { result?: unknown }).result; } catch (e) { return fail(op, e); }
  };

  return { classes, transport };
}

/** The labels a resolved env exposes - LABELS only, never a URL. INTERNAL (used by openGuardedClient + tests). */
export function operatorLabels(env: Record<string, string | undefined>): readonly OperatorLabel[] {
  return Object.keys(resolveOperators(env).classes) as OperatorLabel[];
}
