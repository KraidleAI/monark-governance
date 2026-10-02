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
// issuer public API (an HTTP GET witness, 1b-0 C-7), all resolved LABELS (0 cost, counted). The two cash-leg data sources stay
// FORMED items (request caps land at their trigger, never guessed). This is the SOLE reader of a paid endpoint key
// (HELIUS_API_KEY, CHAINSTACK_ETH_URL / CHAINSTACK_SOLANA_URL) and the SOLE fetch site.
// DRAND-RELAY-GET-1a (ADR-RPC-GUARD-DRAND-1): + the two drand relays, keyless HTTP GET witnesses, one host and ONE closed path each.
import type { OperatorLabel, Transport, OperatorClass } from "./client.ts";
import { heliusCredits, heliusSettle, chainstackRu } from "./tariff.ts";
import { TransportError, RpcError } from "./errors.ts";
import { closedHint } from "./classify.ts";

/** Cycle caps live in ONE place (decisions 112/115). Helius in CREDITS; Chainstack in RU. */
export const HELIUS_CYCLE_CAP_CREDITS = 8_000_000;
export const CHAINSTACK_CYCLE_CAP_RU = 16_000_000;
/** RPC-GUARD-HELIUS-HOST-1 (ADR-RPC-GUARD-RECONCILE-1 D-3): the CLOSED list of exact hosts the helius key may travel to (production,
 *  apps/bell/ops/launch-q6.sh:45), never a domain suffix; tests use the reserved `.invalid` TLD (RFC 6761 6.4, FAITS-RFC6761-INVALID-1). */
const HELIUS_ADMITTED_HOSTS: readonly string[] = ["mainnet.helius-rpc.com"];
/** D-3: the first BELL_SOLANA_RPC element parsed ONCE, returned iff https without userinfo, query, fragment or port, with a lower-case
 *  hostname in HELIUS_ADMITTED_HOSTS or ending with `.invalid` (free path). Never throws nor echoes; the key is set on THIS checked record. */
function admittedHeliusUrl(base: string): URL | undefined {
  let u: URL;
  try { u = new URL(base); } catch { return undefined; }
  if (u.protocol !== "https:" || u.username !== "" || u.password !== "" || u.search !== "" || u.hash !== "" || u.port !== "") return undefined;
  const host = u.hostname.toLowerCase();
  return HELIUS_ADMITTED_HOSTS.includes(host) || host.endsWith(".invalid") ? u : undefined;
}

/** Default per-attempt transport timeout (C-5): an AbortController fires at this deadline so a hung endpoint cannot
 *  wedge a course. Tests inject a tiny value; the live default matches the recorder's record.ts:83 (30 s). It bounds the
 *  response head; for a bounded-body client (TransportOpts below) the SAME deadline bounds the head AND the body. */
export const DEFAULT_TIMEOUT_MS = 30_000;
/** RPC-GUARD-BODY-TIMEOUT-1 (D-3): the byte cap of a bounded body, 8 MiB (precedent scripts/probe-narabi.mjs l.62-63; the Dojo
 *  getProgramAccounts answer measured 674 641 bytes for 1 144 accounts, docs/dojo/FAITS-probe-12-2026-09-27.md). NOT in index.ts. */
export const DEFAULT_MAX_BODY_BYTES = 8 * 1024 * 1024;

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
export interface TransportOpts {
  readonly timeoutMs?: number;
  readonly network?: NetworkLabel;
  readonly onTransportError?: (op: string, errorName: string, code: number | undefined) => void;
  /** RPC-GUARD-BODY-TIMEOUT-1 (D-3, Q-1 opt-in): the body is BOUNDED iff boundBody === true or maxBodyBytes is set. A bounded
   *  attempt holds ONE deadline (timeoutMs, head AND body) and a byte cap (maxBodyBytes, default DEFAULT_MAX_BODY_BYTES): 2xx =>
   *  AbortError (code = the status received) or BodyTooLarge, its reservation kept; non-2xx => HttpError, empty detail. Unset:
   *  the legacy read, unchanged (the deadline bounds the head only, no cap). maxBodyBytes: a safe integer >= 1, before any lock. */
  readonly boundBody?: true;
  readonly maxBodyBytes?: number;
}

/** GARDE-HELIUS-1b-0 (C-7 beta): the xStocks issuer public API host (a KEYLESS HTTP GET witness). The label
 *  `xstocks-issuer` resolves ONLY this host; assertHostAllowed is STRUCTURAL (label -> one host, a pathAndQuery can
 *  never escape it). Calque of apps/bell/src/universe.ts:36 ISSUER_HOST (PLI / CONF-SRC-4). */
export const XSTOCKS_ISSUER_HOST = "api.xstocks.fi";

/** DRAND-RELAY-GET-1a (ADR-RPC-GUARD-DRAND-1 D-1): the two KEYLESS drand relay labels, dot-free (the BARE_LABEL vocabulary of
 *  Bell), each resolving ONE host (the xstocks-issuer motif). Only the labels are public (index.ts); this table stays here. */
const DRAND_RELAY_HOSTS: ReadonlyMap<string, string> = new Map([["drand-pl", "api.drand.sh"], ["drand-cf", "drand.cloudflare.com"]]);
export const DRAND_RELAY_LABELS: readonly string[] = [...DRAND_RELAY_HOSTS.keys()];
/** The quicknet chain hash, PINNED (docs/dojo/FAITS-drand-relays-terms-2026-09-27.md l.21, l.26): a chain rotation is an
 *  amendment of the lot, never a read by the guard. NOT exported by index.ts. */
export const DRAND_QUICKNET_HASH = "52db9ba70e0cc0f6eaf7803dd07447a1f5477735fd3f661792ba94600c84e971";
/** The ONE admitted drand request: a v1 round (>= 1, at most 16 digits) of the pinned chain, matched on the RAW pathAndQuery
 *  BEFORE any URL resolution, so no query, fragment, dot segment, backslash or blank survives a URL normalization. */
export const DRAND_ROUND_PATH = new RegExp(`^/${DRAND_QUICKNET_HASH}/public/[1-9][0-9]{0,15}$`);

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

/** RPC-GUARD-BODY-TIMEOUT-1 (D-3 (b)): a bounded read gives the decoded body, or the NAME of the stop that ended it. */
export type BodyRead = { readonly text: string } | { readonly stop: string };
/** Read `res.body` under the attempt's deadline `due` (epoch ms) and a byte cap. Each read() races the abort event of the attempt's
 *  signal (never trusting fetch to end the stream); bytes are counted per chunk; a stop cancels the reader and aborts the attempt,
 *  neither awaited, their rejections caught. The stop is NAMED before the abort: AbortError (the deadline), BodyTooLarge (over the
 *  cap), else the read error's name, never its message. TextDecoder (utf-8, BOM removed, U+FFFD): held equal to Response.text()
 *  by a differential test, never assumed. Internal: NOT exported by index.ts. */
export async function readBoundedBody(res: Response, ctl: AbortController, maxBytes: number, due: number): Promise<BodyRead> {
  if (res.body === null) return { text: "" };
  const reader = (res.body as ReadableStream<Uint8Array>).getReader(), dec = new TextDecoder(); // Response types its body untyped
  let onAbort = (): void => undefined;
  const aborted = new Promise<"abort">((resolve) => { onAbort = () => { resolve("abort"); }; });
  ctl.signal.addEventListener("abort", onAbort);
  const timer = setTimeout(() => { ctl.abort(); }, Math.max(0, due - Date.now())); // the body part of the attempt's ONE deadline
  const stop = (name: string): BodyRead => { reader.cancel().catch(() => undefined); ctl.abort(); return { stop: name }; };
  let bytes = 0, text = "";
  try {
    for (;;) {
      if (ctl.signal.aborted) return stop("AbortError");
      const r = await Promise.race([reader.read(), aborted]).catch((e: unknown) => ({ failed: e }));
      if (r === "abort") return stop("AbortError");
      if ("failed" in r) return stop(ctl.signal.aborted ? "AbortError" : r.failed instanceof Error ? r.failed.name : "NetworkError");
      if (r.done) return { text: text + dec.decode() };
      bytes += r.value.byteLength;
      if (bytes > maxBytes) return stop("BodyTooLarge");
      text += dec.decode(r.value, { stream: true });
    }
  } finally { clearTimeout(timer); ctl.signal.removeEventListener("abort", onAbort); }
}

export interface Resolved {
  readonly classes: Readonly<Record<string, OperatorClass>>;
  readonly transport: Transport;
  /** D-3: label -> why its endpoint was REFUSED (a fixed reason, never the url); openGuardedClient raises it before any lock. */
  readonly refused: Readonly<Record<string, string>>;
}

/** Resolve paid endpoints from `env` INTERNALLY: returns the LABELS + metering classes; the URLs stay captured
 *  privately inside `transport`. INTERNAL (not exported by index.ts) - reachable publicly only via openGuardedClient. */
export function resolveOperators(env: Record<string, string | undefined>, opts: TransportOpts = {}): Resolved {
  const urls = new Map<string, string>();
  const classes: Record<string, OperatorClass> = {};
  const refused: Record<string, string> = {};
  // GARDE-HELIUS-1b-0 (C-7 beta): operators whose transport is an HTTP GET (method="GET", params=[pathAndQuery]) rather
  // than a JSON-RPC POST. Keyless, one admitted host each; assertHostAllowed is STRUCTURAL (in the transport below).
  const getOps = new Set<string>();

  const solana = (env.BELL_SOLANA_RPC ?? "").split(",").map((s) => s.trim()).filter((s) => s.length > 0);
  const heliusBase = solana[0];
  // RPC-GUARD-HELIUS-HOST-1 (D-3): the host is checked BEFORE any key is attached, with or without HELIUS_API_KEY. Refused => helius stays
  // UNRESOLVED (no url, no class), named in `refused`. Admitted => `api-key` set by the URL API (production base: the former string).
  const heliusUrl = heliusBase === undefined ? undefined : admittedHeliusUrl(heliusBase);
  if (heliusBase !== undefined && heliusUrl === undefined) refused["helius"] = "BELL_SOLANA_RPC host not admitted (fail-closed, RPC-GUARD-HELIUS-HOST-1)";
  if (heliusUrl !== undefined) {
    const key = env.HELIUS_API_KEY;
    if (key) heliusUrl.searchParams.set("api-key", key);
    urls.set("helius", heliusUrl.href);
    // D-2: helius reserves heliusCredits(method, params) and settles on the RENDERED count = result.data.length of the value
    // this transport returns (unchanged, heliusSettle).
    classes["helius"] = { unit: "credits", credits: heliusCredits, settle: heliusSettle, cycleCap: HELIUS_CYCLE_CAP_CREDITS };
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
  // DRAND-RELAY-GET-1a (D-1): the two drand relays, KEYLESS HTTP GET witnesses (0 cost, counted), one host each (the motif
  // above); resolveGetUrl closes the path to DRAND_ROUND_PATH (/info, /v2/, latest, another chain: refused).
  for (const [label, host] of DRAND_RELAY_HOSTS) { urls.set(label, `https://${host}`); classes[label] = { unit: "keyless" }; getOps.add(label); }

  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  // RPC-GUARD-BODY-TIMEOUT-1 (Q-1): the cap of a BOUNDED body, undefined for the legacy read; checked here, before any lock (guarded.ts)
  const maxBody = opts.boundBody === true || opts.maxBodyBytes !== undefined ? opts.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES : undefined;
  if (maxBody !== undefined && !(Number.isSafeInteger(maxBody) && maxBody >= 1))
    throw new Error("rpc-guard: maxBodyBytes must be a safe integer >= 1 (fail-closed)");
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
    const escaped = targets.sort((a, b) => b.length - a.length).map((t) => RegExp.escape(t)); // ES2025: each form matches LITERALLY, a '.' is never a wildcard (ADR-CODEQL-ALERTS-1 D2)
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
    // DRAND-RELAY-GET-1a (D-1, D-3 TY-4/TY-5): a drand label admits ONLY DRAND_ROUND_PATH, tested on the RAW string, fail-closed
    // before any fetch; a Bell JSON-RPC call on a drand label (an address, or a non-string params[0] read as "") is refused here.
    if (DRAND_RELAY_HOSTS.has(op) && !DRAND_ROUND_PATH.test(pathAndQuery)) throw new Error(`rpc-guard: request path for operator '${op}' is off the closed drand round path (fail-closed, D-1)`);
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
    const ctl = new AbortController(), due = Date.now() + timeoutMs; // a bounded body reads under the SAME deadline (D-3 (a))
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
      const errRead = maxBody === undefined ? { text: await res.text().catch(() => "") } : await readBoundedBody(res, ctl, maxBody, due);
      const body = "text" in errRead ? errRead.text : ""; // D-3 (c): a stopped error body gives an EMPTY detail, never a partial one
      return raise(op, "HttpError", res.status, body, undefined, res.status === 403 ? undefined : parseRetryAfterMs(res.headers.get("retry-after")));
    }
    const read = maxBody === undefined ? { text: await res.text() } : await readBoundedBody(res, ctl, maxBody, due);
    if (!("text" in read)) return raise(op, read.stop, res.status, ""); // D-3 (c): AbortError or BodyTooLarge, code = the status received
    const text = read.text;
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

  return { classes, transport, refused };
}

/** The labels a resolved env exposes - LABELS only, never a URL. INTERNAL (used by openGuardedClient + tests). */
export function operatorLabels(env: Record<string, string | undefined>): readonly OperatorLabel[] {
  return Object.keys(resolveOperators(env).classes) as OperatorLabel[];
}
