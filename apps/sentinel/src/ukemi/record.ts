// UKEMI (ADR-U1 D4/D6 + hardening 2026-09-19) — LIVE recorder CLI (off-tool, NOT run in CI; a run-guarded main).
// Builds the quorum-2 pool over the measured keyless providers, gates B <= finalized (D7: the finalized tag only,
// never the mutable head), records the full book, and writes the live G1 artifact (book + digest + provenance)
// OUTSIDE the repo. The committed fixture is the reduced subset; the full book at B is this live artifact
// (ADR-U1 D9). Provenance (endpoints, timing, calls, ukemi_sha, per-provider rpc errors) is OUTSIDE the digest.
// Hardening (this lot, replacing the uncommitted G1 §5b wrapper): a BOUNDED transient retry on HTTP 429/5xx and
// network/timeout faults (never infinite), a structured secret-free per-provider error log, and an enumeration
// floor / politeness / retry budget all exposed on the CLI. Usage:
//   node apps/sentinel/src/ukemi/record.ts --cluster susde-usde --block <B> --from-block <F> \
//        --min-interval-ms 350 --retries 3 --backoff-ms 500 --out F:/tmp/u1a-hard/book.json
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import { providerOf, type RpcCall } from "../rpc.ts";
import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, RpcError, BudgetExceededError, operatorOf, type UkemiReader } from "./rpc2.ts";
import { recordBook, AbiMismatchError } from "./book.ts";
import { clusterById, POOL, POOL_ADDRESSES_PROVIDER, ORACLE, type Cluster } from "./clusters.ts";
import { SEL, TRANSFER_TOPIC0, wordAddr, wordAt, decAddress, decUint, decodeAddressArray, decodeReserveData, decodeUserConfig, transferRecipients } from "./abi.ts";
import { makeResumeReader, assertResumeHoldersMatch, parseResumeLines, holdersDigestOf, type CacheLine, type ResumeReader } from "./resume.ts";

/** The env-injected archive operator's PUBLISHED label (U-4a A-1 / C-5). `CHAINSTACK_ETH_URL` is added as an extra
 *  quorum leg (env, never printed); every published/provenance mention is this generic label — NOT its providerOf
 *  domain and NEVER the URL (which carries the key) — matching U-3's `meta.providers` convention (PROVENANCE-u3:46:
 *  the archive-env leg is present only when the env var is set, so the committed fixture stays env-independent). */
export const ARCHIVE_ENV_LABEL = "archive-env";

/** Strip every http(s) URL from a string (U-4a A-1 hygiene, MAST secret-leak): a leaked key always rides inside a
 *  URL (path or `?api-key=`), and a provider that echoes the request URL in a 4xx body would otherwise surface it
 *  in `rpc_errors[].message` (record.ts pre-U4 folded the body verbatim). Range-cap phrases carry no URL, so
 *  `isResultLimit` / `isPlanLimited` still classify correctly on the scrubbed text. `never_prints_endpoint_url`. */
export function scrubUrls(s: string): string {
  return s.replace(/https?:\/\/[^\s"'\\]+/gi, "<url>");
}

/** Map a live URL to its PUBLISHED operator label: the env archive leg → `archive-env`, every other → its
 *  providerOf domain (a bare host, never a key). The one place URLs become labels for provenance/journal. */
export function operatorLabel(url: string, archiveEnvUrl: string | undefined): string {
  return archiveEnvUrl !== undefined && url === archiveEnvUrl ? ARCHIVE_ENV_LABEL : providerOf(url);
}

/** Drop from a provider pool every URL whose operator is in `excluded` — matched by BOTH its providerOf domain
 *  (`mevblocker.io`) AND its published label (`archive-env`) so either name excludes it (U-4a D-5: a MEASURED
 *  degraded operator is removed, quorum-2 kept by the survivors). Empty `excluded` ⇒ the pool unchanged. */
export function applyExcludeOperators(providers: readonly string[], excluded: readonly string[], archiveEnvUrl: string | undefined): string[] {
  if (excluded.length === 0) return [...providers];
  return providers.filter((u) => !excluded.includes(providerOf(u)) && !excluded.includes(operatorLabel(u, archiveEnvUrl)));
}

/** A structured, secret-free record of one provider's JSON-RPC / transport error (hardening, ADR-U1 D3/D9).
 *  `provider` is the REGISTRABLE DOMAIN (never the full URL, which could carry a key); `code`/`data` are present
 *  only for a typed JSON-RPC error, `http` only for a non-2xx response. Collected into the run artifact (D9,
 *  never committed) so a run's real per-provider error shapes are auditable against isRpcRevert. */
export interface RpcErrorRecord { provider: string; method: string; http?: number; code?: number; message: string; data?: string; }

export interface DefaultCallOpts {
  retries?: number | undefined;   // bounded transient retries (HTTP 429/5xx, network/timeout). Total attempts = retries+1. NEVER infinite.
  backoffMs?: number | undefined; // base backoff; wait = min(backoffMs * 2**attempt, backoffCapMs) (pass 0 in tests).
  backoffCapMs?: number | undefined; // upper bound on ONE backoff wait (default 8000ms) so 2**attempt cannot explode.
  timeoutMs?: number | undefined; // per-attempt abort (default 30s).
  onRpcError?: ((rec: RpcErrorRecord) => void) | undefined; // structured per-provider error sink.
}

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

/** Exponential backoff for one retry attempt, upper-bounded so a large attempt count cannot produce an unbounded
 *  wait: min(backoffMs * 2**attempt, capMs). Pure and exported so the ceiling is asserted directly (V-1(c)). */
export function backoffDelay(attempt: number, backoffMs: number, capMs: number): number {
  return Math.min(backoffMs * 2 ** attempt, capMs);
}

/** Build a JSON-RPC round-trip (fetch) with BOUNDED transient retry and a structured error sink. Classification
 *  is unchanged from the raw path: a JSON-RPC `{error:{code,message,data}}` becomes a typed RpcError (the quorum
 *  then tells an EVM revert from a transport fault); a non-2xx / network / timeout is a transport Error. A typed
 *  RpcError is the node's deterministic answer and is NEVER retried; a HTTP 429/5xx or a network/timeout fault is
 *  transient and retried up to `retries` times with exponential backoff, then thrown (the quorum benches it). A
 *  non-2xx body is surfaced in the thrown message so getLogsVia can split a range-too-large HTTP 400. */
export function makeDefaultCall(opts: DefaultCallOpts = {}): RpcCall {
  const maxRetries = Math.max(0, opts.retries ?? 0);
  const backoffMs = opts.backoffMs ?? 500;
  const backoffCapMs = opts.backoffCapMs ?? 8000;
  const timeoutMs = opts.timeoutMs ?? 30_000;
  const onErr = opts.onRpcError;
  return async (url, method, params) => {
    const prov = providerOf(url);
    for (let attempt = 0; ; attempt++) {
      const ctl = new AbortController();
      const to = setTimeout(() => { ctl.abort(); }, timeoutMs);
      let res: Response;
      try {
        res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
      } catch (e) {
        clearTimeout(to);
        const message = scrubUrls(e instanceof Error ? e.message : String(e)); // no URL/key in the journal or throw
        if (onErr) onErr({ provider: prov, method, message }); // network / timeout — transport, retryable
        if (attempt < maxRetries) { await sleep(backoffDelay(attempt, backoffMs, backoffCapMs)); continue; }
        throw new Error(message);
      }
      clearTimeout(to);
      if (!res.ok) {
        const body = scrubUrls((await res.text().catch(() => "")).replace(/\s+/g, " ").trim().slice(0, 160)); // scrub any echoed endpoint URL/key
        if (onErr) onErr({ provider: prov, method, http: res.status, message: body });
        if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) { await sleep(backoffDelay(attempt, backoffMs, backoffCapMs)); continue; }
        // Body surfaced so getLogsVia can split a range-too-large HTTP 400; a 4xx other than 429 is not retried.
        throw new Error(`HTTP ${String(res.status)} ${prov}${body ? `: ${body}` : ""}`);
      }
      type JsonRpcResponse = { result?: unknown; error?: { code?: number; message?: string; data?: unknown } };
      const bodyText = await res.text();
      let json: JsonRpcResponse;
      try {
        json = JSON.parse(bodyText) as JsonRpcResponse;
      } catch {
        const snippet = scrubUrls(bodyText.replace(/\s+/g, " ").trim().slice(0, 160));
        if (onErr) onErr({ provider: prov, method, http: 200, message: `non-JSON body: ${snippet}` });
        // A non-JSON body from a JSON-RPC endpoint is a mis-route (wrong host / HTML error page), not a transient:
        // retrying the same URL returns the same body, so throw (the quorum benches it). The body stays in the
        // journal entry ONLY — keeping it out of the thrown message so it cannot trip isResultLimit downstream (V-1(d)).
        throw new Error(`HTTP 200 non-JSON ${prov}`);
      }
      if (json.error) {
        const data = typeof json.error.data === "string" ? json.error.data : undefined;
        const emsg = scrubUrls(json.error.message ?? "rpc error"); // defensive: a node error message never carries our key, but scrub anyway
        if (onErr) onErr({ provider: prov, method, code: json.error.code ?? 0, message: emsg, ...(data !== undefined ? { data } : {}) });
        // A typed JSON-RPC error (EVM revert / method / server error) is deterministic ⇒ classified by the quorum, NOT retried.
        throw new RpcError(emsg, json.error.code ?? 0, data);
      }
      return json.result;
    }
  };
}

/** The raw default round-trip (no retry): the fetch → RpcError | transport-Error classification path only. Tests
 *  drive THIS instance directly; the live recorder builds a HARDENED instance via makeDefaultCall({retries,...}). */
export const defaultCall: RpcCall = makeDefaultCall();

/** C-5 fail-closed RPC budget (calque Bell collect.ts:228 / quorum.ts:24). Wraps a call so that after `maxCalls`
 *  network calls every further call REJECTS with BudgetExceededError — fatal, re-thrown FIRST by the three rpc2
 *  guards (quorum2 / getLogsVia / finalized), so it is never benched into a no_quorum, split as a range-cap, or
 *  swallowed. Counts the TOTAL and a per-operator breakdown (by operatorLabel, so the orchestrator can confront the
 *  Chainstack dashboard). Pure/injectable: tests drive it offline; resume-cache HITS never reach it (no budget). */
export function makeBudgetedCall(maxCalls: number, inner: RpcCall, archiveEnvUrl?: string): { call: RpcCall; total: () => number; byOperator: () => Record<string, number>; byMethod: () => Record<string, number> } {
  let n = 0;
  const per: Record<string, number> = {};
  const perMethod: Record<string, number> = {};
  const call: RpcCall = (u, m, p) => {
    if (n >= maxCalls) return Promise.reject(new BudgetExceededError(`ukemi/record: --max-calls budget exceeded (C-5 fail-closed)`));
    n += 1;
    const label = operatorLabel(u, archiveEnvUrl);
    per[label] = (per[label] ?? 0) + 1;
    perMethod[m] = (perMethod[m] ?? 0) + 1;
    return inner(u, m, p);
  };
  return { call, total: () => n, byOperator: () => ({ ...per }), byMethod: () => ({ ...perMethod }) };
}

/** sha256 of a text after CRLF→LF normalization (the prereg is compared LF-normalized: A-2/`--prereg-sha`). */
export function lfSha256(text: string): string {
  return createHash("sha256").update(text.replace(/\r\n/g, "\n"), "utf8").digest("hex");
}

/** Live progress of a filter pass, mutated in place so a BudgetExceededError stop can still report what was seen. */
export interface FilterProgress { holders: number; config_read: number; n_at_risk_config: number; }
/** The result of a filter-only pass (config-passing count = an UPPER bound of recordBook's final at_risk). */
export interface FilterResult { holders: number; holders_digest: string; n_at_risk_config: number; excluded_collateral_off: number; excluded_no_debt: number; }

/** The config-filter PREFIX of recordBook (U-4a two-stage go, D-3): enumerate the cluster's aToken holders, then
 *  read `getUserConfiguration` for each and COUNT the config-passing at-risk (cluster collateral bit ON ∧ has
 *  debt) — with NO per-account read (no balanceOf / getUserAccountData / getUserEMode). It MEASURES nAtRisk before
 *  the ~9×nAtRisk per-account course; shared through the SAME reader, its enumeration and getUserConfiguration
 *  reads are cached so the course HITs them (0 budget). `n_at_risk_config` does NOT apply the balanceOf>0
 *  exclusion, so it EQUALS recordBook.counts.at_risk + excluded_zero_balance (an upper bound; drift-guarded by
 *  test). It reuses abi decoders + clusters constants only — book.ts is NOT touched (PIN 034fbff9 intact). */
export async function enumerateAndCountAtRisk(cluster: Cluster, block: number, reader: UkemiReader, opts: { fromBlock?: number | undefined } = {}, progress?: FilterProgress, onTick?: () => void): Promise<FilterResult> {
  const oracle = decAddress(wordAt(await reader.ethCall(POOL_ADDRESSES_PROVIDER, SEL.getPriceOracle, block), 0));
  if (oracle.toLowerCase() !== ORACLE.toLowerCase()) throw new AbiMismatchError(`oracle drift @${String(block)}: ${oracle} != ${ORACLE.toLowerCase()}`);
  const reservesList = decodeAddressArray(await reader.ethCall(POOL, SEL.getReservesList, block));
  const clusterIdx: number[] = [];
  const holderSet = new Set<string>();
  for (const c of cluster.collaterals) {
    const i = reservesList.indexOf(c.asset.toLowerCase());
    if (i < 0) throw new AbiMismatchError(`cluster collateral ${c.asset} not in getReservesList @${String(block)}`);
    clusterIdx.push(i);
    const rd = decodeReserveData(await reader.ethCall(POOL, SEL.getReserveData + wordAddr(c.asset), block));
    if (rd.aToken.toLowerCase() !== c.aToken.toLowerCase()) throw new AbiMismatchError(`aToken drift @${String(block)}: ${rd.aToken} != pinned ${c.aToken.toLowerCase()}`);
    const fromBlock = opts.fromBlock !== undefined ? Math.max(c.reserveInitBlock, opts.fromBlock) : c.reserveInitBlock;
    const logs = await reader.getLogsRange(c.aToken, [TRANSFER_TOPIC0], fromBlock, block);
    for (const r of transferRecipients(logs)) holderSet.add(r);
  }
  const { holders, holders_digest } = holdersDigestOf(holderSet); // drops zero addr, sorts, sha256 — same as book.ts
  if (progress) progress.holders = holders.length;
  let atRisk = 0, excCollOff = 0, excNoDebt = 0;
  for (const h of holders) {
    const config = decUint(await reader.ethCall(POOL, SEL.getUserConfiguration + wordAddr(h), block));
    const { collateral, borrow } = decodeUserConfig(config, reservesList.length);
    if (progress) {
      progress.config_read += 1;
      // Operational heartbeat via onTick (gated ⇒ silent in tests): a multi-hour filter pass must be observable,
      // its partial nAtRisk AND per-operator call/error tallies visible (D-4 5%-rule monitoring) before it ends.
      if (onTick !== undefined && progress.config_read % 2000 === 0) onTick();
    }
    if (!clusterIdx.some((i) => collateral.includes(i))) { excCollOff += 1; continue; }
    if (borrow.length === 0) { excNoDebt += 1; continue; }
    atRisk += 1;
    if (progress) progress.n_at_risk_config = atRisk;
  }
  return { holders: holders.length, holders_digest, n_at_risk_config: atRisk, excluded_collateral_off: excCollOff, excluded_no_debt: excNoDebt };
}

/** sha256 over the recorder sources ukemi/**.ts (the build witness, ADR-U1 D2/C-6). OUTSIDE the digest. */
export function ukemiSha(dir: string): string {
  const files = readdirSync(dir).filter((f) => f.endsWith(".ts")).sort();
  const h = createHash("sha256");
  for (const f of files) h.update(f + "\0").update(readFileSync(join(dir, f)));
  return h.digest("hex");
}

/** The recorder CLI shape. `block`/`fromBlock` optional; enumeration floor, politeness and the bounded retry
 *  budget are all exposed (ADR-U1 D4 hardening — this is the committed successor to the G1 §5b wrapper). */
export interface UkemiArgs {
  cluster: string;
  block: number | undefined;
  fromBlock: number | undefined;
  minIntervalMs: number;
  retries: number;
  backoffMs: number;
  backoffCapMs: number;
  out: string | undefined;
  maxCalls: number | undefined; // C-5 fail-closed budget; REQUIRED (> 0) in main, undefined only pre-check
  resume: string | undefined;   // C-5 resume/inputs cache path (JSONL request→result, OUTSIDE the repo)
  preregSha: string | undefined; // A-2: the sha256 LF of docs/PLAN-u4-prereg.md, verified before any read
  filterOnly: boolean;          // D-3 two-stage go: stop after getUserConfiguration×quorum, report nAtRisk, no per-account read
  slowOperators: string[];      // D-4: providerOf domains throttled to slowIntervalMs (a misbehaving operator raised alone)
  slowIntervalMs: number;       // D-4: interval for slowOperators (default 200)
  excludeOperators: string[];   // D-5: providerOf domains / labels dropped from the pool (a measured-degraded operator; quorum-2 kept by survivors)
  concordanceOut: string | undefined; // L-4: path for the per-operator-pair concordance jsonl; undefined ⇒ hook NO-OP (book_digest byte-identical)
}

/** Parse the recorder CLI. Non-negative integers only for the numeric flags (fail-closed on a bad value). */
export function parseUkemiArgs(argv: readonly string[]): UkemiArgs {
  const arg = (k: string): string | undefined => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; };
  const argAll = (k: string): string[] => { const out: string[] = []; for (let i = 0; i < argv.length; i++) { if (argv[i] === k && argv[i + 1] !== undefined) out.push(argv[i + 1] as string); } return out; };
  const optInt = (k: string): number | undefined => {
    const v = arg(k); if (v === undefined) return undefined;
    const n = Number(v); if (!Number.isInteger(n) || n < 0) throw new Error(`ukemi/record: ${k} must be a non-negative integer, got '${v}'`);
    return n;
  };
  const reqInt = (k: string, d: number): number => optInt(k) ?? d;
  return {
    cluster: arg("--cluster") ?? "weth",
    block: optInt("--block"),
    fromBlock: optInt("--from-block"),
    minIntervalMs: reqInt("--min-interval-ms", 200),
    retries: reqInt("--retries", 2),
    backoffMs: reqInt("--backoff-ms", 500),
    backoffCapMs: reqInt("--backoff-cap-ms", 8000),
    out: arg("--out"),
    maxCalls: optInt("--max-calls"),
    resume: arg("--resume"),
    preregSha: arg("--prereg-sha"),
    filterOnly: argv.includes("--filter-only"),
    slowOperators: argAll("--slow-operator"),
    slowIntervalMs: reqInt("--slow-interval-ms", 200),
    excludeOperators: argAll("--exclude-operator"),
    concordanceOut: arg("--concordance-out"),
  };
}

/** Is THIS module the process entry point (record.ts run directly, not imported)? Compares the canonical file URL
 *  of argv1 to import.meta.url. pathToFileURL percent-encodes and emits the three-slash file:/// form on ALL
 *  platforms; the pre-e8bcfe4 string form (`"file://" + argv1.replace(/\\/g,"/")`) produced a two-slash URL on
 *  Windows (silent CLI no-op, measured 2026-09-19) AND never percent-encodes a path with a space on POSIX, so it
 *  was cross-platform wrong (V-1(a), probes/o1-crossplatform.mjs). Undefined argv1 (no script arg) ⇒ false. */
export function isMainModule(argv1: string | undefined, metaUrl: string): boolean {
  return argv1 !== undefined && pathToFileURL(argv1).href === metaUrl;
}

/** Injected dependencies for `runRecorder` (the extracted CLI body, C-3): the process env (Chainstack leg) and a
 *  clock. `exit` is NOT injected — runRecorder RETURNS an exit code so its `finally` (the concordance flush) always
 *  runs (process.exit would kill the finally); the thin `main` wrapper maps the code to process.exit. Declared
 *  deviation from the plan's literal "deps = env/now/exit" (R-21), chosen so a disagreement/budget stop still flushes. */
export interface RecorderDeps { readonly env: NodeJS.ProcessEnv; readonly now: () => number; }
/** The live dependencies: the real process env and clock. Tests pass a frozen env + fixed clock. */
export const realDeps: RecorderDeps = { env: process.env, now: () => Date.now() };

/** L-4: fold one live concordance observation into the per-operator-PAIR tally (sorted key). The archive-env leg
 *  is relabelled to ARCHIVE_ENV_LABEL so the Chainstack domain never reaches the file (operators only, never a URL
 *  — C-1). Mutates `agg`. */
function tallyConcordance(agg: Map<string, { concordant: number; discordant: number }>, opA: string, opB: string, concordant: boolean, archiveEnvUrl: string | undefined): void {
  const relabel = (op: string): string => (archiveEnvUrl !== undefined && op === operatorOf(archiveEnvUrl) ? ARCHIVE_ENV_LABEL : op);
  const pair = [relabel(opA), relabel(opB)].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)).join("|");
  const cur = agg.get(pair) ?? { concordant: 0, discordant: 0 };
  if (concordant) cur.concordant += 1; else cur.discordant += 1;
  agg.set(pair, cur);
}

/** L-4: flush the concordance aggregate to `path` as ONE compact jsonl line per pair (N-3). Writes the file EVEN
 *  WHEN EMPTY, so a mis-wired sink (M-7c: flag parsed but onQuorum not passed) yields an empty file the reducer
 *  turns into []. No URL is ever written. */
function flushConcordance(path: string, agg: Map<string, { concordant: number; discordant: number }>, atIso: string): void {
  const lines = [...agg.entries()].map(([pair, t]) => JSON.stringify({ pair, concordant: t.concordant, discordant: t.discordant, at: atIso }));
  writeFileSync(path, lines.length > 0 ? lines.join("\n") + "\n" : "");
}

/** The extracted recorder body (C-3): pilotable by the chain test as `runRecorder([...args], deps)`. Returns the
 *  exit code (0 = ok, 2 = budget stop); the `main` wrapper maps it to process.exit AFTER the `finally` concordance
 *  flush has run. A disagreement / other fatal still throws (the wrapper's catch exits 1) — through the finally. */
export async function runRecorder(argv: readonly string[], deps: RecorderDeps): Promise<number> {
  const args = parseUkemiArgs(argv);
  const cluster = clusterById(args.cluster);
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "..", "..", "..", "..");

  // C-5: --max-calls REQUIRED and > 0 (fail-closed budget; calque Bell collect.ts:377-382).
  if (args.maxCalls === undefined) throw new Error("ukemi/record: --max-calls is required (C-5 fail-closed RPC budget; e.g. --max-calls 300000)");
  if (!(args.maxCalls > 0)) throw new Error("ukemi/record: --max-calls must be > 0 (C-5 fail-closed budget)");

  // A-2: a supplied --prereg-sha MUST equal the sha256 LF of docs/PLAN-u4-prereg.md (proof the prereg was
  // committed and unchanged BEFORE the course; else U4-H1 would be post hoc).
  if (args.preregSha !== undefined) {
    const actual = lfSha256(readFileSync(join(root, "docs", "PLAN-u4-prereg.md"), "utf8"));
    if (actual !== args.preregSha) throw new Error(`ukemi/record: --prereg-sha ${args.preregSha} != docs/PLAN-u4-prereg.md LF sha ${actual} (A-2; commit the prereg first)`);
  }

  // Extra quorum leg from the env archive endpoint (never printed), APPENDED LAST so the keyless quorum forms
  // first and Chainstack is pulled only on a bench (minimises RU draw — RU/call undocumented, E-2). Then D-5:
  // drop any --exclude-operator (a MEASURED degraded operator), and fail-closed if quorum-2 can no longer form.
  const archiveEnvUrl = deps.env.CHAINSTACK_ETH_URL;
  const ethCallProviders = applyExcludeOperators(archiveEnvUrl ? [...ETH_CALL_PROVIDERS, archiveEnvUrl] : [...ETH_CALL_PROVIDERS], args.excludeOperators, archiveEnvUrl);
  const getLogsProviders = applyExcludeOperators(archiveEnvUrl ? [...GET_LOGS_PROVIDERS, archiveEnvUrl] : [...GET_LOGS_PROVIDERS], args.excludeOperators, archiveEnvUrl);
  const distinct = (urls: readonly string[]): number => new Set(urls.map((u) => operatorOf(u))).size; // C-2: by OPERATOR ({nodies,pocket}=1)
  if (distinct(ethCallProviders) < 2) throw new Error(`ukemi/record: eth_call quorum-2 needs >= 2 distinct operators after --exclude-operator (${String(distinct(ethCallProviders))} left)`);
  if (distinct(getLogsProviders) < 2) throw new Error(`ukemi/record: eth_getLogs quorum-2 needs >= 2 distinct operators after --exclude-operator (${String(distinct(getLogsProviders))} left)`);

  const rpcErrors: RpcErrorRecord[] = [];
  const errByOp: Record<string, number> = {}; // D-4: per-operator (providerOf domain) error tally for the 5%-rule monitor
  const hardened = makeDefaultCall({ retries: args.retries, backoffMs: args.backoffMs, backoffCapMs: args.backoffCapMs, onRpcError: (r) => { rpcErrors.push(r); errByOp[r.provider] = (errByOp[r.provider] ?? 0) + 1; } });
  const budgeted = makeBudgetedCall(args.maxCalls, hardened, archiveEnvUrl);
  // L-4: the concordance sink is wired ONLY when --concordance-out is given (else onQuorum is undefined ⇒ NO-OP ⇒
  // book_digest byte-identical). The aggregate is per operator PAIR; it is flushed in the finally below (M-7c: a
  // parsed flag whose sink is NOT passed here leaves the aggregate empty ⇒ an empty file ⇒ reducer []).
  const concordance = new Map<string, { concordant: number; discordant: number }>();
  const onQuorum = args.concordanceOut !== undefined
    ? (_label: string, opA: string, opB: string, concordant: boolean): void => { tallyConcordance(concordance, opA, opB, concordant, archiveEnvUrl); }
    : undefined;
  const basePool = makeUkemiPool({ call: budgeted.call, ethCallProviders, getLogsProviders, minIntervalMs: args.minIntervalMs, slowOperators: args.slowOperators, slowIntervalMs: args.slowIntervalMs, onQuorum });

  // C-5 resume/inputs cache (JSONL request→result, OUTSIDE the repo). Fresh ⇒ write the meta line; append every
  // MISS (a hit costs no budget). After the record, a cached holders line that disagrees ⇒ abstention.
  let reader: UkemiReader = basePool;
  let resumeReader: ResumeReader | undefined;
  const opLabels = (urls: readonly string[]): string[] => { const s = urls.map((u) => operatorLabel(u, archiveEnvUrl)); return s.filter((v, i) => s.indexOf(v) === i); };
  if (args.resume !== undefined) {
    const resumePath = args.resume;
    const fresh = !existsSync(resumePath);
    const lines: CacheLine[] = fresh ? [] : parseResumeLines(readFileSync(resumePath, "utf8"));
    if (fresh) {
      const meta: CacheLine = { kind: "meta", schema: "ukemi-u4-inputs/1", model: "claude-opus-4-8[1m]", recorded_at_utc: new Date(deps.now()).toISOString(),
        cluster: cluster.id, block: args.block ?? null, from_block: args.fromBlock ?? null, chain_id: "1",
        providers: [...opLabels(ethCallProviders), ...opLabels(getLogsProviders)].filter((v, i, a) => a.indexOf(v) === i), prereg_sha: args.preregSha ?? null };
      writeFileSync(resumePath, JSON.stringify(meta) + "\n");
    }
    resumeReader = makeResumeReader(basePool, lines, (line) => { appendFileSync(resumePath, JSON.stringify(line) + "\n"); });
    reader = resumeReader;
  }

  // Live progress (mutated by the filter pass) so a BudgetExceededError stop can still report what was seen (D-3).
  const progress: FilterProgress = { holders: 0, config_read: 0, n_at_risk_config: 0 };
  try {
    const fin = await reader.finalized();
    const block = args.block ?? fin.block;
    if (block > fin.block) throw new Error(`ukemi/record: B=${String(block)} > finalized ${String(fin.block)} (look-ahead forbidden, ADR-U1 D7)`);

    // D-3 STAGE 1 — filter-only: measure nAtRisk (config filter, no per-account read); cache config reads for the course.
    if (args.filterOnly) {
      const t0 = Date.now();
      const onTick = (): void => {
        const t = (Date.now() - t0) / 1000;
        const perOp = Object.entries(budgeted.byOperator()).map(([k, v]) => `${k}:${String(v)}`).join(",");
        const perErr = Object.entries(errByOp).map(([k, v]) => `${k}:${String(v)}`).join(",");
        process.stderr.write(`  ..filter config_read=${String(progress.config_read)}/${String(progress.holders)} n_at_risk_config=${String(progress.n_at_risk_config)} rate=${(progress.config_read / Math.max(t, 0.001)).toFixed(2)}/s calls={${perOp}} errors={${perErr}}\n`);
      };
      const fr = await enumerateAndCountAtRisk(cluster, block, reader, { fromBlock: args.fromBlock }, progress, onTick);
      const seconds = (Date.now() - t0) / 1000;
      if (resumeReader !== undefined) {
        assertResumeHoldersMatch(fr.holders_digest, resumeReader);
        if (resumeReader.cachedHoldersDigest() === undefined && args.resume !== undefined) {
          appendFileSync(args.resume, JSON.stringify({ kind: "holders", n: fr.holders, holders_digest: fr.holders_digest } satisfies CacheLine) + "\n");
        }
      }
      const provenance = {
        model: "claude-opus-4-8[1m]", recorded_at_utc: new Date(deps.now()).toISOString(), phase: "filter-only",
        endpoints: { eth_call: opLabels(ethCallProviders), eth_getLogs: opLabels(getLogsProviders) }, quorum: 2,
        params: { cluster: cluster.id, block, from_block: args.fromBlock ?? null, min_interval_ms: args.minIntervalMs, slow_operators: args.slowOperators, slow_interval_ms: args.slowIntervalMs, retries: args.retries, backoff_ms: args.backoffMs, backoff_cap_ms: args.backoffCapMs, max_calls: args.maxCalls, prereg_sha: args.preregSha ?? null, resume: args.resume !== undefined, filter_only: true },
        calls: budgeted.total(), calls_by_operator: budgeted.byOperator(), calls_by_method: budgeted.byMethod(), errors_by_operator: errByOp, excluded_operators: args.excludeOperators, seconds, finalized_block: fin.block, ukemi_sha: ukemiSha(here),
        holders: fr.holders, holders_digest: fr.holders_digest, n_at_risk_config: fr.n_at_risk_config,
        excluded: { collateral_off: fr.excluded_collateral_off, no_debt: fr.excluded_no_debt }, projection_remaining_calls: 9 * fr.n_at_risk_config,
        rpc_error_count: rpcErrors.length, rpc_errors: rpcErrors,
      };
      const out = args.out ?? join(tmpdir(), `ukemi-filter-${cluster.id}-${String(block)}.json`);
      writeFileSync(out, JSON.stringify({ provenance }, null, 2));
      const perOpF = Object.entries(budgeted.byOperator()).map(([k, v]) => `${k}:${String(v)}`).join(",");
      process.stdout.write(`ukemi/record FILTER-ONLY cluster=${cluster.id} B=${String(block)} holders=${String(fr.holders)} n_at_risk_config=${String(fr.n_at_risk_config)} ` +
        `excluded={coll_off:${String(fr.excluded_collateral_off)},no_debt:${String(fr.excluded_no_debt)}}\n` +
        `  calls=${String(budgeted.total())}/${String(args.maxCalls)} by_operator={${perOpF}} projection_remaining=9*${String(fr.n_at_risk_config)}=${String(9 * fr.n_at_risk_config)} seconds=${seconds.toFixed(1)}\n  out=${out}\n`);
      return 0;
    }

    const t0 = Date.now();
    const res = await recordBook(cluster, block, reader, "GENESIS", { fromBlock: args.fromBlock });
    const seconds = (Date.now() - t0) / 1000;

    if (resumeReader !== undefined) {
      assertResumeHoldersMatch(res.holders_digest, resumeReader); // corrupted/tampered enumeration ⇒ abstention (C-5)
      if (resumeReader.cachedHoldersDigest() === undefined && args.resume !== undefined) {
        appendFileSync(args.resume, JSON.stringify({ kind: "holders", n: res.counts.holders, holders_digest: res.holders_digest } satisfies CacheLine) + "\n");
      }
    }

    const provenance = {
      model: "claude-opus-4-8[1m]", recorded_at_utc: new Date(deps.now()).toISOString(),
      endpoints: { eth_call: opLabels(ethCallProviders), eth_getLogs: opLabels(getLogsProviders) }, quorum: 2, // labels only, NEVER a URL (C-5)
      params: { cluster: cluster.id, block, from_block: args.fromBlock ?? null, min_interval_ms: args.minIntervalMs, retries: args.retries, backoff_ms: args.backoffMs, backoff_cap_ms: args.backoffCapMs, max_calls: args.maxCalls, prereg_sha: args.preregSha ?? null, resume: args.resume !== undefined },
      calls: budgeted.total(), calls_by_operator: budgeted.byOperator(), calls_by_method: budgeted.byMethod(), errors_by_operator: errByOp, excluded_operators: args.excludeOperators, seconds, finalized_block: fin.block, ukemi_sha: ukemiSha(here),
      counts: res.counts, holders_digest: res.holders_digest, book_digest: res.book_digest,
      hf_findings: res.hf_findings, timeline: res.timeline,
      rpc_error_count: rpcErrors.length, rpc_errors: rpcErrors,
    };
    const out = args.out ?? join(tmpdir(), `ukemi-book-${cluster.id}-${String(block)}.json`);
    writeFileSync(out, JSON.stringify({ provenance, book: res.book }, null, 2));
    const perOp = Object.entries(budgeted.byOperator()).map(([k, v]) => `${k}:${String(v)}`).join(",");
    process.stdout.write(`ukemi/record cluster=${cluster.id} B=${String(block)} book_digest=${res.book_digest}\n` +
      `  holders=${String(res.counts.holders)} at_risk=${String(res.counts.at_risk)} eligible=${String(res.counts.eligible)} ` +
      `excluded={coll_off:${String(res.counts.excluded_collateral_off)},no_debt:${String(res.counts.excluded_no_debt)},zero_bal:${String(res.counts.excluded_zero_balance)}}\n` +
      `  calls=${String(budgeted.total())}/${String(args.maxCalls)} by_operator={${perOp}} rpc_errors=${String(rpcErrors.length)} seconds=${seconds.toFixed(1)} ukemi_sha=${provenance.ukemi_sha}\n  out=${out}\n`);
    return 0;
  } catch (e) {
    // D-3: a budget stop must never lose information — report what was seen (nAtRisk so far, calls per operator/method).
    if (e instanceof BudgetExceededError) {
      const perOp = Object.entries(budgeted.byOperator()).map(([k, v]) => `${k}:${String(v)}`).join(",");
      const perM = Object.entries(budgeted.byMethod()).map(([k, v]) => `${k}:${String(v)}`).join(",");
      const perErr = Object.entries(errByOp).map(([k, v]) => `${k}:${String(v)}`).join(",");
      process.stderr.write(`BUDGET STOP (${e.message})\n` +
        `  seen: holders=${String(progress.holders)} config_read=${String(progress.config_read)} n_at_risk_config=${String(progress.n_at_risk_config)}\n` +
        `  calls=${String(budgeted.total())}/${String(args.maxCalls ?? 0)} by_operator={${perOp}} by_method={${perM}} errors={${perErr}}\n` +
        `  resume cache preserved; re-run --resume ONLY after a re-budget decision (R-26), never a silent raise.\n`);
      return 2; // NOT process.exit: the finally must flush the concordance first; the wrapper maps 2 → exit(2)
    }
    throw e;
  } finally {
    // L-4: flush the per-pair concordance ALWAYS (success, budget stop, or a disagreement throw), so a run that
    // abstains still leaves the observation it gathered before throwing. No-op when --concordance-out is absent.
    if (args.concordanceOut !== undefined) flushConcordance(args.concordanceOut, concordance, new Date(deps.now()).toISOString());
  }
}

/** Thin wrapper: run the recorder with live deps, then map its exit code to process.exit AFTER the finally flush. */
async function main(): Promise<void> {
  const code = await runRecorder(process.argv.slice(2), realDeps);
  if (code !== 0) process.exit(code);
}

// Run-guard: run main() only when record.ts is the process entry point (see isMainModule — cross-platform, the
// pre-e8bcfe4 string form was a silent no-op on Windows and mis-encoded spaced paths on POSIX).
if (isMainModule(process.argv[1], import.meta.url)) {
  main().catch((e: unknown) => { process.stderr.write(`FATAL ${e instanceof Error ? e.message : String(e)}\n`); process.exit(1); });
}
