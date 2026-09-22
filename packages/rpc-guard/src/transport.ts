// MONARK rpc-guard - THE SOLE allowlisted module. This is the ONE place that (a) reads a paid endpoint key from the
// environment and (b) performs a network fetch. Every other module speaks LABELS. The CI grep (T4) allowlists EXACTLY
// this file. The default transport resolves an operator LABEL -> its private URL INTERNALLY and never returns/
// serializes the URL. KEY HYGIENE (C-V-3): a fetch failure (e.g. an unparseable URL) throws a TypeError whose MESSAGE
// and `.input` carry the URL+key; we NEVER propagate it - we throw a FRESH Error carrying only `label + error name`,
// scrubbed. `resolveOperators`/`makeClient`/`InMemorySink` are NOT public (index.ts): the sole public paid path is
// openGuardedClient (meter + commit + durable ledger + lock), so no public symbol reaches fetch without a ledger line.
//
// Scope: Helius (credits, cycle cap 8 M - decision 112) + Chainstack (RU, cycle cap 16 M - decision 115, second
// paid operator, GARDE-HELIUS-2; ONE operator per ACCOUNT across networks - decision 121, opts.network picks
// CHAINSTACK_ETH_URL | CHAINSTACK_SOLANA_URL) + the keyless witnesses: the Solana-Foundation public RPC, the free ETH
// quorum providers the Ukemi recorder uses today as URLs (drpc/mevblocker/nodies/pocket/tenderly), and the xStocks
// issuer public API (an HTTP GET witness, 1b-0 C-7), all resolved LABELS (0 cost, counted). Databento and Polygon stay
// FORMED items (request caps land at their trigger, never guessed). This is the SOLE reader of a paid endpoint key
// (HELIUS_API_KEY, CHAINSTACK_ETH_URL / CHAINSTACK_SOLANA_URL) and the SOLE fetch site.
import type { OperatorLabel, Transport, OperatorClass } from "./client.ts";
import { heliusCredits, chainstackRu } from "./tariff.ts";
import { TransportError, RpcError } from "./errors.ts";
import { closedHint } from "./classify.ts";

/** Cycle caps live in ONE place (decisions 112/115). Helius in CREDITS; Chainstack in RU. */
export const HELIUS_CYCLE_CAP_CREDITS = 8_000_000;
export const CHAINSTACK_CYCLE_CAP_RU = 16_000_000;

/** Default per-attempt transport timeout (C-5): an AbortController fires at this deadline so a hung endpoint cannot
 *  wedge a course. Tests inject a tiny value; the live default matches the recorder's record.ts:83 (30 s). */
export const DEFAULT_TIMEOUT_MS = 30_000;

/** D6 C-1(c-bis): the DECLARED upper bound on a reprised revert `.data` (in hex characters). Revert data is bounded by
 *  its form (an ABI-encoded reason / custom-error selector), never a free-text channel; anything longer is dropped. */
export const MAX_REVERT_DATA_HEX = 4096;

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

/** GARDE-HELIUS-1b-0 (C-5 / decision 121): the network a MULTI-NETWORK operator (chainstack) resolves for THIS
 *  course. `chainstack` is ONE operator per ACCOUNT (one 16 M RU cap across networks); opts.network picks
 *  CHAINSTACK_<network>_URL and stamps the ledger `network` attribute. ABSENT => "ethereum-mainnet" (the pre-121
 *  default: the Ukemi recorder passes no network and MUST keep resolving CHAINSTACK_ETH_URL byte-identically). A
 *  Solana course passes "solana-mainnet" EXPLICITLY (fail-closed BEFORE any lock if CHAINSTACK_SOLANA_URL is absent). */
export type NetworkLabel = "ethereum-mainnet" | "solana-mainnet";

/** Transport options threaded from openGuardedClient (C-5). `onTransportError` is the injected error hook: it is
 *  called with the operator LABEL + the error NAME + the CODE (HTTP status or JSON-RPC code, undefined for a bare
 *  network fault), NEVER the URL (the 5%-rule monitor of the recorder re-binds ITS OWN sink onto this in 2b). */
export interface TransportOpts { readonly timeoutMs?: number; readonly network?: NetworkLabel; readonly onTransportError?: (op: string, errorName: string, code: number | undefined) => void; }

/** GARDE-HELIUS-1b-0 (C-7 beta): the xStocks issuer public API host (a KEYLESS HTTP GET witness). The label
 *  `xstocks-issuer` resolves ONLY this host; assertHostAllowed is STRUCTURAL (label -> one host, a pathAndQuery can
 *  never escape it). Calque of apps/bell/src/universe.ts:36 ISSUER_HOST (PLI / CONF-SRC-4). */
export const XSTOCKS_ISSUER_HOST = "api.xstocks.fi";

/** Parse a Retry-After header (delta-seconds or an HTTP-date) to ms, bounded by capMs (never a negative wait). Pure;
 *  calque of apps/bell/src/universe.ts:103 retryAfterMs. Returns undefined for an absent/unparseable header (C-3b). */
export function parseRetryAfterMs(header: string | null | undefined, nowMs: number = Date.now(), capMs = 60_000): number | undefined {
  if (header == null) return undefined;
  const s = header.trim();
  if (/^\d+$/.test(s)) return Math.min(Number(s) * 1000, capMs);
  const d = Date.parse(s);
  if (!Number.isNaN(d)) return Math.min(Math.max(0, d - nowMs), capMs);
  return undefined;
}

export interface Resolved {
  readonly classes: Readonly<Record<string, OperatorClass>>;
  readonly transport: Transport;
}

/** Resolve paid endpoints from `env` INTERNALLY: returns the LABELS + metering classes; the URLs stay captured
 *  privately inside `transport`. INTERNAL (not exported by index.ts) - reachable publicly only via openGuardedClient. */
export function resolveOperators(env: Record<string, string | undefined>, opts: TransportOpts = {}): Resolved {
  const urls = new Map<string, string>();
  const classes: Record<string, OperatorClass> = {};
  // GARDE-HELIUS-1b-0 (C-7 beta): operators whose transport is an HTTP GET (method="GET", params=[pathAndQuery]) rather
  // than a JSON-RPC POST. Keyless, one admitted host each; assertHostAllowed is STRUCTURAL (in the transport below).
  const getOps = new Set<string>();

  const solana = (env.BELL_SOLANA_RPC ?? "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const heliusBase = solana[0];
  if (heliusBase !== undefined) {
    const key = env.HELIUS_API_KEY;
    urls.set("helius", key ? `${heliusBase}?api-key=${key}` : heliusBase);
    classes["helius"] = { unit: "credits", credits: heliusCredits, cycleCap: HELIUS_CYCLE_CAP_CREDITS };
  }
  // Chainstack: the SECOND paid operator (RU), ONE operator PER ACCOUNT (decision 121). The key lives ONLY here.
  // opts.network resolves CHAINSTACK_<network>_URL: "solana-mainnet" => CHAINSTACK_SOLANA_URL (a Bell Solana course),
  // else CHAINSTACK_ETH_URL (the pre-121 default: the Ukemi recorder passes no network). A requested-but-unresolved
  // chainstack throws in openGuardedClient BEFORE any lock. The account cap (16 M RU) is SHARED across networks; the
  // network is a ledger ATTRIBUTE (guarded.ts stamps it), NEVER a second operator/cap.
  const network: NetworkLabel = opts.network ?? "ethereum-mainnet";
  const chainstackUrl = network === "solana-mainnet" ? env.CHAINSTACK_SOLANA_URL : env.CHAINSTACK_ETH_URL;
  if (chainstackUrl !== undefined && chainstackUrl.length > 0) {
    urls.set("chainstack", chainstackUrl);
    classes["chainstack"] = { unit: "ru", credits: chainstackRu, cycleCap: CHAINSTACK_CYCLE_CAP_RU };
  }
  // keyless witness (Solana Foundation public RPC) - traced for completeness, never capped (0 credits, Q5). C-2: the
  // ADMITTED host is api.mainnet.solana.com (PLI / CONF-SRC-5), NEVER api.mainnet-beta.solana.com (EXCLUDED host).
  urls.set("solana-foundation", "https://api.mainnet.solana.com");
  classes["solana-foundation"] = { unit: "keyless" };
  // keyless ETH operators (the recorder's free quorum) - resolved LABELS, 0 cost, counted (2b consumes them).
  for (const [label, url] of KEYLESS_ETH) { urls.set(label, url); classes[label] = { unit: "keyless" }; }
  // GARDE-HELIUS-1b-0 (C-7 beta): the xStocks issuer public API - a KEYLESS HTTP GET witness (0 cost, counted). The label
  // resolves ONLY the admitted host; the transport GETs method="GET", params=[pathAndQuery], with a STRUCTURAL
  // assertHostAllowed (the pathAndQuery can never escape to another host). Migrated by Bell universe at 1b-i.
  urls.set("xstocks-issuer", `https://${XSTOCKS_ISSUER_HOST}`);
  classes["xstocks-issuer"] = { unit: "keyless" };
  getOps.add("xstocks-issuer");

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const onErr = opts.onTransportError;
  // D6 (GARDE-HELIUS-2b): for a PAID operator, the raised message reprises ONLY a CLOSED-vocabulary hint of the body
  // (closedHint, classify.ts) - never a raw body byte - so a server-transformed key (C-GD-2, base64/hex) or a key
  // split by a blank CANNOT appear (a key is not a member of a fixed set of English phrases). For a KEYLESS operator
  // (no secret in its URL) the redacted body is reprised (the free-quorum diagnosis needs it). `redact` stays in place
  // (defense in depth + keyless) and its target enumeration is REUSED to check a revert `.data` (C-1(c-bis)).
  // C-R-1: a 401 body can echo `host/KEY` SCHEME-LESS, and the Chainstack key is a PATH SEGMENT of CHAINSTACK_ETH_URL.
  // Path tokens that are STRUCTURAL, never a secret (so "non-trivial" is structural, not a length guess): a key is any
  // OTHER path segment, of any length. A server body may echo a secret in a different CASE, PERCENT-encoded, or inside
  // JSON escaping - so we build ONE case-insensitive regex over every form (raw + encodeURIComponent + JSON-escaped).
  const TRIVIAL_SEG = new Set(["v1", "v2", "v3", "rpc", "eth", "api", "ws", "wss", "http", "https", "mainnet", "core", "node"]);
  // The secret FORMS of an operator's URL - the SINGLE enumeration used BOTH to redact a keyless body AND (C-1(c-bis))
  // to check a revert `.data`. Returns undefined FAIL-CLOSED for an absent or unparseable url (the caller then drops
  // the body / the data - we cannot prove the key is absent). Every form is >= 3 chars (a shorter target over-redacts).
  const secretTargets = (op: string): string[] | undefined => {
    const url = urls.get(op);
    if (url === undefined) return undefined;
    let u: URL;
    try { u = new URL(url); } catch { return undefined; } // FAIL-CLOSED: an unparseable operator url
    const targets = new Set<string>([url, u.host, u.hostname, u.host + u.pathname, u.hostname + u.pathname]);
    for (const seg of u.pathname.split("/")) if (seg.length > 0 && !TRIVIAL_SEG.has(seg.toLowerCase())) { targets.add(seg); targets.add(encodeURIComponent(seg)); } // the key
    for (const v of u.searchParams.values()) if (v.length > 0) { targets.add(v); targets.add(encodeURIComponent(v)); } // api-key etc.
    if (u.username.length > 0) { targets.add(u.username); targets.add(encodeURIComponent(u.username)); } // C-GD-1: userinfo class (user:key@host)
    if (u.password.length > 0) { targets.add(u.password); targets.add(encodeURIComponent(u.password)); }
    for (const t of [...targets]) targets.add(JSON.stringify(t).slice(1, -1)); // the JSON-escaped form (a real body is JSON)
    return [...targets].filter((t) => t.length >= 3);
  };
  const redact = (op: string, detail: string): string => {
    if (detail === "") return "";
    const targets = secretTargets(op);
    if (targets === undefined) return ""; // FAIL-CLOSED: no parseable url => the body is NOT reprised
    const escaped = targets.sort((a, b) => b.length - a.length).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const out = scrubUrls(detail);
    return escaped.length === 0 ? out : out.replace(new RegExp(escaped.join("|"), "gi"), "<redacted>");
  };
  // C-1(c-bis): a revert `.data` is reprised only when it is BOUNDED HEX (never a free-text channel) that does not
  // ITSELF carry the key's UTF-8 hex (yet another C-GD-2 form). Non-hex, over-long, key-carrying, or (fail-closed) an
  // unparseable operator url => dropped (undefined). Same targets as redact, so the checks can never disagree.
  const validateRevertData = (op: string, raw: unknown): string | undefined => {
    if (typeof raw !== "string" || !/^0x[0-9a-fA-F]*$/.test(raw) || raw.length > MAX_REVERT_DATA_HEX) return undefined;
    const targets = secretTargets(op);
    if (targets === undefined) return undefined; // FAIL-CLOSED: cannot prove the key is absent
    const low = raw.toLowerCase();
    for (const t of targets) if (low.includes(Buffer.from(t, "utf8").toString("hex").toLowerCase())) return undefined;
    return raw;
  };
  // D6: the DETAIL a raised error is allowed to carry (never the raw body). PAID => the closed-vocabulary hint ONLY;
  // NonJsonBody => NOTHING, paid AND keyless (C-2: an HTML page carrying "result" must not trip a range split); KEYLESS
  // (non-NonJson) => the redacted body, collapsed + truncated (C-R-3: redact the RAW body first, then collapse).
  const detailOf = (op: string, name: string, rawDetail: string, paid: boolean): string =>
    name === "NonJsonBody" ? "" : paid ? closedHint(rawDetail) : redact(op, rawDetail).replace(/\s+/g, " ").trim().slice(0, 160);
  const raise = (op: string, name: string, code: number | undefined, rawDetail: string, rawData?: unknown, retryAfterMs?: number): never => {
    if (onErr) onErr(op, name, code); // the hook gets label + error NAME + CODE only, never the URL or the body
    const unit = classes[op]?.unit ?? "keyless";
    const paid = unit !== "keyless";
    const detail = detailOf(op, name, rawDetail, paid);
    const data = name === "RpcError" ? validateRevertData(op, rawData) : undefined;
    // C-1(c): a KEYLESS RpcError exposes its SCRUBBED message WITHOUT the operator-label preamble, so two keyless
    // providers' reverts can concord on the message (revertKey). Every other case: preamble + code + the closed detail.
    let message: string;
    if (name === "RpcError" && !paid) {
      message = scrubUrls(detail !== "" ? detail : "rpc error");
    } else {
      const codeStr = code !== undefined ? ` (code ${String(code)})` : "";
      const detailStr = detail !== "" ? `: ${detail}` : "";
      message = scrubUrls(`rpc-guard: ${name} for operator '${op}'${codeStr}${detailStr}`);
    }
    if (name === "RpcError") throw new RpcError(op, message, code ?? 0, detail, unit, data);
    throw new TransportError(op, message, name, code, detail, unit, undefined, retryAfterMs);
  };
  // C-7 beta: STRUCTURAL host allow for a GET operator - the label resolves ONE admitted host; the request URL is the
  // pathAndQuery RESOLVED against that host, and its host MUST equal the admitted host (a protocol-relative "//evil"
  // or an absolute "https://evil" pathAndQuery => a different host => throw). https only, no userinfo. No URL leaks.
  const resolveGetUrl = (op: string, base: string, params: readonly unknown[]): string => {
    const pathAndQuery = typeof params[0] === "string" ? params[0] : "";
    const admitted = new URL(base);
    let u: URL;
    try { u = new URL(pathAndQuery, base); } catch { throw new Error(`rpc-guard: request path for operator '${op}' is not resolvable (fail-closed)`); }
    if (u.protocol !== "https:" || u.hostname.toLowerCase() !== admitted.hostname.toLowerCase()) throw new Error(`rpc-guard: request host for operator '${op}' is off the admitted host (fail-closed, structural, C-7)`);
    if (u.username !== "" || u.password !== "") throw new Error(`rpc-guard: request url for operator '${op}' carries userinfo (fail-closed)`);
    return u.toString();
  };
  const transport: Transport = async (op, method, params) => {
    const url = urls.get(op);
    if (url === undefined) throw new Error(`rpc-guard: no endpoint for operator '${op}' (fail-closed)`);
    const isGet = getOps.has(op);
    const target = isGet ? resolveGetUrl(op, url, params) : url;
    const ctl = new AbortController();
    const to = setTimeout(() => { ctl.abort(); }, timeoutMs); // C-5: bound a hung endpoint; cleared on every exit path
    let res: Response;
    try {
      // D-9a: redirect:"manual" so a 3xx is NEVER followed - the allowlist guards only the INITIAL host, and for the
      // POST the request BODY must never reach a redirected (off-host) endpoint. A GET operator sends method="GET",
      // params=[pathAndQuery] (no body); every other operator is a JSON-RPC POST (unchanged shape).
      res = isGet
        ? await fetch(target, { method: "GET", headers: { accept: "application/json" }, redirect: "manual", signal: ctl.signal })
        : await fetch(target, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), redirect: "manual", signal: ctl.signal });
    } catch (e) {
      // (1) network / timeout / abort: NEVER surface e.message or e.input (they carry the url+key) - name only.
      return raise(op, e instanceof Error ? e.name : "NetworkError", undefined, "");
    } finally { clearTimeout(to); }
    // (2a) D-9a: a 3xx under redirect:"manual" is a HARD STOP (never followed). Typed name "RedirectBlocked" + the
    //      status; the body is never read nor forwarded. The caller maps it to a fatal stop (RedirectBlockedError, 1b-i).
    if (res.status >= 300 && res.status < 400) return raise(op, "RedirectBlocked", res.status, "");
    if (!res.ok) {
      // (2b) HTTP non-ok: keep a CLOSED-vocabulary hint of the body (paid) so getLogsVia can still split a too-large
      //     range on an HTTP 400; the hook gets the status. C-3b: parse Retry-After (ms) so the CALLER can honour a
      //     429/503 backoff. C-2 (1b-0 fold): a FATAL 403 is NEVER retried, so it STRUCTURALLY carries no retryAfterMs
      //     (the explicit `res.status === 403` guard, never the incidence of a header-less test 403). Raw body never leaves.
      const body = await res.text().catch(() => "");
      return raise(op, "HttpError", res.status, body, undefined, res.status === 403 ? undefined : parseRetryAfterMs(res.headers.get("retry-after")));
    }
    const text = await res.text();
    // (3) non-JSON body (a mis-routed HTML error page): a typed fault, not a silent value; NO hint at all (C-2). Both a
    //     GET operator and a JSON-RPC POST parse here; only the SHAPE past this point differs (a GET body IS the payload).
    let parsed: unknown;
    try { parsed = JSON.parse(text) as unknown; } catch { return raise(op, "NonJsonBody", res.status, text); }
    // (3-bis) GARDE-HELIUS-1b-0 (C-1, fold): a GET operator (xstocks-issuer) is NOT JSON-RPC - its 200 body IS the
    //     payload ({assets:[...]} or a BARE ARRAY, never a `result` envelope), consumed VERBATIM by Bell's
    //     pageAssets/foldPage (apps/bell/src/universe.ts:477-493, which reads array | {data|assets|items|results}).
    //     Return it AS-IS: NO `.result` unwrap and NO JSON-RPC `error` control - either would resolve `undefined` on
    //     EVERY real issuer body => pageAssets([]) => a page-0 end anchor => a SILENT empty universe (fail-open).
    if (isGet) return parsed;
    const json = parsed as { result?: unknown; error?: { code?: number; message?: string; data?: unknown } | null };
    // (4) JSON-RPC error at HTTP 200: MUST throw the canonical RpcError (never resolve `undefined`, which two errored
    //     providers would read as concordant); carries the JSON-RPC code + the VALIDATED revert data (C-1(a)/(c)).
    if (json.error !== undefined && json.error !== null) return raise(op, "RpcError", json.error.code ?? 0, json.error.message ?? "rpc error", json.error.data);
    return json.result;
  };

  return { classes, transport };
}

/** The labels a resolved env exposes - LABELS only, never a URL. INTERNAL (used by openGuardedClient + tests). */
export function operatorLabels(env: Record<string, string | undefined>): readonly OperatorLabel[] {
  return Object.keys(resolveOperators(env).classes) as OperatorLabel[];
}
