// UKEMI (ADR-U1 D4/D6 + hardening 2026-09-19) — LIVE recorder CLI (off-tool, NOT run in CI; a run-guarded main).
// Builds the quorum-2 pool over the measured keyless providers, gates B <= finalized (D7: the finalized tag only,
// never the mutable head), records the full book, and writes the live G1 artifact (book + digest + provenance)
// OUTSIDE the repo. The committed fixture is the reduced subset; the full book at B is this live artifact
// (ADR-U1 D9). Provenance (endpoints, timing, calls, ukemi_sha, per-provider rpc errors) is OUTSIDE the digest.
// GARDE-HELIUS-2b-ii migration: EVERY RPC endpoint (paid AND keyless) is reached ONLY through @monark/rpc-guard
// (meter + durable per-operator cycle ledger + lock). record.ts reads NO endpoint key; the operators come from an
// EXPLICIT --operators list; retry is at the CALLER only (transient transport faults, never a revert/4xx/budget); a
// secret-free per-provider journal is built from the transport's TYPED errors (never a raw body). Usage:
//   node apps/sentinel/src/ukemi/record.ts --cluster susde-usde --block <B> --from-block <F> \
//        --operators drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack \
//        --ledger-dir <DIR> --cycle <ID> --floor <RU> --max-ru <RU> --max-calls <N> \
//        --method-caps eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000 --out /tmp/u1a-hard/book.json
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync, appendFileSync, existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { join, dirname } from "node:path";
import { tmpdir } from "node:os";
import type { RpcCall } from "../rpc.ts";
import { makeUkemiPool, makePoliteGate, operatorOf, BudgetExceededError, type UkemiReader } from "./rpc2.ts";
// GARDE-HELIUS-2b-ii migration: the recorder reaches every RPC endpoint (paid AND keyless) ONLY through the single
// budgeted client. record.ts reads NO endpoint key: deps.env is passed AS-IS to openGuardedClient (the transport is
// the sole key reader). The pool speaks LABELS (not URLs); the transport resolves label -> private URL internally.
import { openGuardedClient, runCli, ETH_CALL_KEYLESS_LABELS, GET_LOGS_KEYLESS_LABELS, TransportError, type RunLimits, type OperatorLabel, type BudgetedClient } from "@monark/rpc-guard";
import { recordBook, AbiMismatchError } from "./book.ts";
import { clusterById, POOL, POOL_ADDRESSES_PROVIDER, ORACLE, type Cluster } from "./clusters.ts";
import { SEL, TRANSFER_TOPIC0, wordAddr, wordAt, decAddress, decUint, decodeAddressArray, decodeReserveData, decodeUserConfig, transferRecipients } from "./abi.ts";
import { makeResumeReader, assertResumeHoldersMatch, parseResumeLines, holdersDigestOf, type CacheLine, type ResumeReader } from "./resume.ts";
// UKEMI-CONC-1: the bounded window (--concurrency) and the per-account read plans it prefetches (the consumers below stay unchanged).
import { parseConcurrency, type PoolReport } from "./pool.ts";
import { prefetchFilterReads, prefetchBookReads } from "./prefetch.ts";

// D-label (RULED = `chainstack`, decision 121): the paid leg's operator label IS `chainstack` (the operator, unique
// per account; the network is the `network` attribute). `archive-env` / `ARCHIVE_ENV_LABEL` / `operatorLabel` are
// REMOVED (no consumer breaks: M-17). `scrubUrls` / `applyExcludeOperators` are REMOVED too: the transport now
// expurgates every raised message (record.ts holds no raw body to scrub), and `--operators` (an explicit include
// list) replaces `--exclude-operator` (not listing an operator IS excluding it).

/** A structured, secret-free record of one provider's JSON-RPC / transport error (hardening, ADR-U1 D3/D9).
 *  `provider` is the REGISTRABLE DOMAIN (never the full URL, which could carry a key); `code`/`data` are present
 *  only for a typed JSON-RPC error, `http` only for a non-2xx response. Collected into the run artifact (D9,
 *  never committed) so a run's real per-provider error shapes are auditable against isRpcRevert / isBareRevert.
 *  UKEMI-REVERT-1: `data` is the CLOSED indicator of the validated revert data (revertDataIndicator), written on EVERY
 *  JSON-RPC error entry - never the data bytes (the pre-lot journal carried the validated hex and OMITTED the field when
 *  absent, which left the REVERT-PAID-1 diag blind to the data form). */
export interface RpcErrorRecord { provider: string; method: string; http?: number; code?: number; message: string; data?: "absent" | "0x" | number; }

/** UKEMI-REVERT-1: the FORM of a JSON-RPC error's validated `.data`, never its bytes: "absent" (no validated data reached
 *  the recorder - absent on the wire OR dropped by the transport's validateRevertData: indistinguishable here, declared
 *  residual), "0x" (the empty data of a bare revert), or the hex LENGTH in characters including "0x" (bounded by the
 *  transport's MAX_REVERT_DATA_HEX). Pure. */
function revertDataIndicator(d: string | undefined): "absent" | "0x" | number {
  return d === undefined ? "absent" : d === "0x" ? "0x" : d.length;
}

/** sha256 of a text after CRLF→LF normalization (the prereg is compared LF-normalized: A-2/`--prereg-sha`). */
export function lfSha256(text: string): string {
  return createHash("sha256").update(text.replace(/\r\n/g, "\n"), "utf8").digest("hex");
}

/** Belt-and-suspenders URL strip for the durable diagnostic journal (Q-C/C-R-b7, calque @monark/rpc-guard
 *  transport.ts:47 scrubUrls). The transport ALREADY expurgates every raised message (see the file header:
 *  record.ts holds no raw body to scrub), and rpc_errors carry only the registrable domain + closed hint; this
 *  guarantees `<out>.diag.json` carries 0 URL even for a non-transport throw. Reads NO env (record.ts reads no key). */
const stripUrls = (s: string): string => s.replace(/https?:\/\/[^\s"'\\]+/gi, "<url>");

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
export async function enumerateAndCountAtRisk(cluster: Cluster, block: number, reader: UkemiReader, opts: { fromBlock?: number | undefined; heartbeatEvery?: number | undefined } = {}, progress?: FilterProgress, onTick?: () => void): Promise<FilterResult> {
  // UKEMI-HEARTBEAT-1: `opts.heartbeatEvery` (default 2000) is the onTick period in config reads; a value that is not
  // an integer >= 1 is refused BEFORE any read (a `% 0` would silently mute the heartbeat - the fault this item fixes).
  const every = opts.heartbeatEvery ?? 2000;
  if (!Number.isInteger(every) || every < 1) throw new Error(`ukemi/record: heartbeatEvery must be an integer >= 1, got ${String(every)} (UKEMI-HEARTBEAT-1, fail-closed)`);
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
      if (onTick !== undefined && progress.config_read % every === 0) onTick();
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
  preregSha: string | undefined; // A-2: the sha256 LF of the prereg file (--prereg-file), verified before any read
  preregFile: string;            // A-2/Q-A (decision 128): the prereg the course is BOUND to (default docs/PLAN-u4b-prereg.md)
  labelerSha: string | undefined; // Q-B (decision 128): the sha256 LF of scripts/census/u3-realized.mjs (the frozen U-3 labeler)
  noPreregBinding: boolean;      // Q-A ruling 2026-09-22 (CHANTIERS.md:677): EXPLICITLY lift the by-code --prereg-sha/--labeler-sha requirement for a non-U-4b generic use (U-1/susde); recorded prereg_binding:"none"
  filterOnly: boolean;          // D-3 two-stage go: stop after getUserConfiguration×quorum, report nAtRisk, no per-account read
  slowOperators: string[];      // D-4: operator labels throttled to slowIntervalMs (a misbehaving operator raised alone)
  slowIntervalMs: number;       // D-4: interval for slowOperators (default 200)
  operators: string[];          // C-1: the EXPLICIT operator include list (labels). Not listing an operator EXCLUDES it (replaces --exclude-operator).
  ledgerDir: string | undefined; // C-1(b) REQUIRED: the durable per-operator cycle ledger root (must pre-exist).
  cycle: string | undefined;     // C-1(b) REQUIRED: ONE cycle id for EVERY requested operator (keyless included - closes D-keyless-cycle).
  floor: number | undefined;     // C-1(b) REQUIRED: the chainstack cycle floor (RU read at the dashboard before the course).
  maxRu: number | undefined;     // C-1(b) REQUIRED: the chainstack run cost cap (RU).
  methodCaps: Record<string, number> | undefined; // C-1(b) REQUIRED: per-method attempt caps parsed from `k=v,k=v`.
  concordanceOut: string | undefined; // L-4: path for the per-operator-pair concordance jsonl; undefined ⇒ hook NO-OP (book_digest byte-identical)
  heartbeatEvery: number;        // UKEMI-HEARTBEAT-1: filter-pass stderr heartbeat period in config reads (default 2000, >= 1); stderr ONLY, never written into the JSON
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
  // --method-caps "eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000" => Record; fail-closed on a bad entry.
  const parseMethodCaps = (v: string | undefined): Record<string, number> | undefined => {
    if (v === undefined) return undefined;
    const out: Record<string, number> = {};
    for (const pair of v.split(",")) {
      const t = pair.trim(); if (t === "") continue;
      const eq = t.indexOf("="); const k = eq >= 0 ? t.slice(0, eq).trim() : ""; const n = Number(eq >= 0 ? t.slice(eq + 1).trim() : "");
      if (k === "" || !Number.isInteger(n) || n < 0) throw new Error(`ukemi/record: --method-caps entry must be 'method=<non-negative int>', got '${t}'`);
      out[k] = n;
    }
    return out;
  };
  // UKEMI-HEARTBEAT-1 (C-1(b): an optional CLI argument, no env): 0 is refused here, pre-flight (optInt admits 0).
  const heartbeatEvery = reqInt("--heartbeat-every", 2000);
  if (heartbeatEvery < 1) throw new Error(`ukemi/record: --heartbeat-every must be >= 1, got '${String(heartbeatEvery)}' (UKEMI-HEARTBEAT-1, fail-closed)`);
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
    preregFile: arg("--prereg-file") ?? "docs/PLAN-u4b-prereg.md",
    labelerSha: arg("--labeler-sha"),
    noPreregBinding: argv.includes("--no-prereg-binding"),
    filterOnly: argv.includes("--filter-only"),
    slowOperators: argAll("--slow-operator"),
    slowIntervalMs: reqInt("--slow-interval-ms", 200),
    operators: (arg("--operators") ?? "").split(",").map((s) => s.trim()).filter((s) => s.length > 0),
    ledgerDir: arg("--ledger-dir"),
    cycle: arg("--cycle"),
    floor: optInt("--floor"),
    maxRu: optInt("--max-ru"),
    methodCaps: parseMethodCaps(arg("--method-caps")),
    concordanceOut: arg("--concordance-out"),
    heartbeatEvery,
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
export interface RecorderDeps { readonly env: NodeJS.ProcessEnv; readonly now: () => number; readonly sleep?: (ms: number) => Promise<void>; }
/** The real wait of the caller's in-place retry (UKEMI-RETRY-3: tests inject `sleep` and never actually wait). */
const defaultSleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
/** The live dependencies: the real process env, clock and sleep. Tests pass a frozen env + fixed clock (+ a recording sleep). */
export const realDeps: RecorderDeps = { env: process.env, now: () => Date.now(), sleep: defaultSleep };

/** UKEMI-RETRY-3: the in-place retry wait (ms) after failed attempt `attempt` = `backoffMs * 2^attempt` FLOORED by the
 *  parsed Retry-After when usable (defined, finite, > 0; transport parseRetryAfterMs, <= 60 s, never on a 403), then CAPPED
 *  by `backoffCapMs` (a longer Retry-After is truncated - declared). Else the pre-RETRY-3 `min(backoff, cap)`. Pure. */
export function retryWaitMs(attempt: number, backoffMs: number, backoffCapMs: number, retryAfterMs: number | undefined): number {
  const backoff = backoffMs * 2 ** attempt;
  const floored = retryAfterMs !== undefined && Number.isFinite(retryAfterMs) && retryAfterMs > 0 ? Math.max(retryAfterMs, backoff) : backoff;
  return Math.min(floored, backoffCapMs);
}

/** L-4: fold one live concordance observation into the per-operator-PAIR tally (sorted key). `opA`/`opB` are already
 *  operator labels (operatorOf, from quorum2 - never a URL, C-1); the paid leg's label is `chainstack` (D-label).
 *  Mutates `agg`. */
function tallyConcordance(agg: Map<string, { concordant: number; discordant: number }>, opA: string, opB: string, concordant: boolean): void {
  const pair = [opA, opB].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0)).join("|");
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
  const concurrency = parseConcurrency(argv); // UKEMI-CONC-1: default 1 = the sequential recorder; a bad value is a PRE-FLIGHT refusal
  const cluster = clusterById(args.cluster);
  const here = dirname(fileURLToPath(import.meta.url));
  const root = join(here, "..", "..", "..", "..");
  // Q-C/C-R-b7: the durable diagnostic journal path — <out>.diag.json (or a tmp default when --out is absent). Fixed
  // here so EVERY failure path in the try/catch below can persist the diagnosis (never lost to a console-only report).
  const diagPath = (args.out ?? join(tmpdir(), `ukemi-${cluster.id}-${String(deps.now())}`)) + ".diag.json";

  // C-1(b): the SIX run inputs are REQUIRED WITHOUT condition (a keyless-only run passes them too; assertLimits only
  // enforces a cap for a PAID operator that is actually requested - client.ts). record.ts reads NO env for operator
  // selection (C-1): deps.env is passed AS-IS to openGuardedClient, whose transport is the sole endpoint-key reader.
  const ledgerDir = args.ledgerDir;
  if (ledgerDir === undefined) throw new Error("ukemi/record: --ledger-dir is required (C-1(b); the durable per-operator cycle ledger root, must pre-exist)");
  const cycle = args.cycle;
  if (cycle === undefined) throw new Error("ukemi/record: --cycle is required (C-1(b); ONE cycle id for every requested operator, keyless included)");
  const floor = args.floor;
  if (floor === undefined) throw new Error("ukemi/record: --floor is required (C-1(b); the chainstack cycle floor in RU, read at the dashboard before the course)");
  const maxRu = args.maxRu;
  if (maxRu === undefined) throw new Error("ukemi/record: --max-ru is required (C-1(b); the chainstack run cost cap in RU)");
  const methodCaps = args.methodCaps;
  if (methodCaps === undefined || Object.keys(methodCaps).length === 0) throw new Error("ukemi/record: --method-caps is required and non-empty (C-1(b); e.g. eth_call=300000,eth_getLogs=300000,eth_getBlockByNumber=300000)");
  const maxCalls = args.maxCalls;
  if (maxCalls === undefined) throw new Error("ukemi/record: --max-calls is required (C-5 fail-closed RPC budget; e.g. --max-calls 300000)");
  if (!(maxCalls > 0)) throw new Error("ukemi/record: --max-calls must be > 0 (C-5 fail-closed budget)");

  // A-2 / Q-A (decision 128 + escalation ruling 2026-09-22, CHANTIERS.md:677): the course is BOUND to the prereg
  // (--prereg-file, default docs/PLAN-u4b-prereg.md) — proof the U-4b prereg was committed and unchanged BEFORE the
  // course (else U4b-H* would be post hoc). Pre-decision-128 this compared to docs/PLAN-u4-prereg.md (the U-4 LIVRE
  // prereg), so the ADR-U4b D4 sentence "the script refuses without --prereg-sha == sha of THIS file" was FALSE.
  // RULING (escalation resolved): once the bound --prereg-file EXISTS on disk, --prereg-sha AND --labeler-sha are
  // REQUIRED BY CODE — a missing flag is a PRE-FLIGHT refusal (0 client call, 0 ledger, no diag: thrown before the
  // try below). --no-prereg-binding EXPLICITLY lifts this for a non-U-4b generic use (U-1/susde), recorded
  // prereg_binding:"none" in the provenance (the U-4b prereg -1b forbids --no-prereg-binding for the weth course).
  // It only lifts the REQUIREMENT: a --prereg-sha/--labeler-sha that IS supplied is still verified below. When the
  // prereg file does NOT exist (a repo without it), the flags stay optional (a supplied --prereg-sha with a missing
  // file is still a NAMED refusal). A missing prereg file is a NAMED refusal, never an ENOENT.
  const preregPath = join(root, args.preregFile);
  const preregBound = existsSync(preregPath) && !args.noPreregBinding;
  const preregBinding = preregBound ? args.preregFile : "none";
  if (preregBound && args.preregSha === undefined) throw new Error(`ukemi/record: --prereg-sha is required because ${args.preregFile} exists on disk (Q-A ruling 2026-09-22: the weth U-4b course is bound to the prereg by code; pass --no-prereg-binding for a non-U-4b use)`);
  if (preregBound && args.labelerSha === undefined) throw new Error(`ukemi/record: --labeler-sha is required because ${args.preregFile} exists on disk (Q-A ruling 2026-09-22: the weth U-4b course is bound to the prereg by code; pass --no-prereg-binding for a non-U-4b use)`);
  if (args.preregSha !== undefined) {
    if (!existsSync(preregPath)) throw new Error(`ukemi/record: --prereg-file ${args.preregFile} does not exist (A-2/Q-A; commit the prereg first)`);
    const actual = lfSha256(readFileSync(preregPath, "utf8"));
    if (actual !== args.preregSha) throw new Error(`ukemi/record: --prereg-sha ${args.preregSha} != ${args.preregFile} LF sha ${actual} (A-2; commit the prereg first)`);
  }
  // Q-B (decision 128): a supplied --labeler-sha MUST equal the sha256 LF of scripts/census/u3-realized.mjs (the
  // frozen U-3 labeler that re-derives the fresh Y labels). The label convention is frozen BEFORE the course (§Y);
  // a post-course labeler edit would make the labels post-hoc and non-servable. Written into the provenance below.
  if (args.labelerSha !== undefined) {
    const labelerPath = join(root, "scripts", "census", "u3-realized.mjs");
    if (!existsSync(labelerPath)) throw new Error(`ukemi/record: scripts/census/u3-realized.mjs does not exist (Q-B; the labeler must be present)`);
    const actual = lfSha256(readFileSync(labelerPath, "utf8"));
    if (actual !== args.labelerSha) throw new Error(`ukemi/record: --labeler-sha ${args.labelerSha} != scripts/census/u3-realized.mjs LF sha ${actual} (Q-B; freeze the labeler first)`);
  }

  // C-1: the operators are an EXPLICIT include list (labels); NOT listing an operator EXCLUDES it (replaces
  // --exclude-operator). Fail-closed on a label unknown to the recorder's ETH pools.
  const KNOWN_ETH_LABELS = new Set<string>([...ETH_CALL_KEYLESS_LABELS, ...GET_LOGS_KEYLESS_LABELS, "chainstack"]);
  if (args.operators.length === 0) throw new Error("ukemi/record: --operators <label,...> is required (C-1; e.g. drpc.org,mevblocker.io,nodies.app,pocket.network,tenderly.co,chainstack)");
  for (const l of args.operators) if (!KNOWN_ETH_LABELS.has(l)) throw new Error(`ukemi/record: unknown operator '${l}' (not one of ${[...KNOWN_ETH_LABELS].join(", ")}), fail-closed`);
  const requested = new Set(args.operators);

  // Build the pool provider lists from LABELS: the keyless operators in PINNED order that were requested, then
  // chainstack APPENDED LAST (so the keyless quorum forms first and chainstack is drawn only on a bench - minimises
  // RU). The transport resolves each label -> its private URL internally; record.ts never holds a URL.
  const csRequested = requested.has("chainstack");
  const ethCallProviders = [...ETH_CALL_KEYLESS_LABELS.filter((l) => requested.has(l)), ...(csRequested ? ["chainstack"] : [])];
  const getLogsProviders = [...GET_LOGS_KEYLESS_LABELS.filter((l) => requested.has(l)), ...(csRequested ? ["chainstack"] : [])];
  const distinct = (labels: readonly string[]): number => new Set(labels.map((u) => operatorOf(u))).size; // C-2: by OPERATOR ({nodies,pocket}=1)
  if (distinct(ethCallProviders) < 2) throw new Error(`ukemi/record: eth_call quorum-2 needs >= 2 distinct operators in --operators (${String(distinct(ethCallProviders))} left)`);
  if (distinct(getLogsProviders) < 2) throw new Error(`ukemi/record: eth_getLogs quorum-2 needs >= 2 distinct operators in --operators (${String(distinct(getLogsProviders))} left)`);

  // C-1: ONE --cycle for EVERY requested operator (keyless included - closes D-keyless-cycle). runCaps/cycleFloor are
  // keyed by chainstack only (assertLimits checks a paid operator ONLY when requested); maxCalls is unit-agnostic.
  const limits: RunLimits = { maxCalls, runCaps: { chainstack: maxRu }, methodCaps, cycleFloor: { chainstack: floor } };
  const cycles = Object.fromEntries(args.operators.map((l) => [l, cycle]));

  const rpcErrors: RpcErrorRecord[] = [];
  const errByOp: Record<string, number> = {}; // D-4: per-operator error tally for the 5%-rule monitor (fed by the transport hook)
  const concordance = new Map<string, { concordant: number; discordant: number }>();
  // Attempt tally for PROVENANCE (calls/byOperator/byMethod) - NON-gating. The UNIT spend is client.spent().byOperator
  // (RU for chainstack, 0 for keyless); this tally is a call COUNT, incremented per attempt (R retries => R+1).
  const tally = { total: 0, byOperator: {} as Record<string, number>, byMethod: {} as Record<string, number> };
  const budgeted = { total: (): number => tally.total, byOperator: (): Record<string, number> => ({ ...tally.byOperator }), byMethod: (): Record<string, number> => ({ ...tally.byMethod }) };
  // Live progress (mutated by the filter pass) so a BudgetExceededError stop can still report what was seen (D-3).
  const progress: FilterProgress = { holders: 0, config_read: 0, n_at_risk_config: 0 };
  const poolReport: PoolReport = { suppressed: [] }; // UKEMI-CONC-1: errors seen while the window drained after its first error (diag)
  let client: BudgetedClient | undefined;
  try {
    // The SOLE paid path: open the guarded client (real transport; deps.env passed AS-IS - record.ts reads no key).
    // Locks + per-operator durable ledgers are acquired here; the transport error hook feeds the 5%-rule monitor.
    client = openGuardedClient(deps.env, limits, ledgerDir, cycles, { onTransportError: (op) => { errByOp[op] = (errByOp[op] ?? 0) + 1; } });
    const c = client;
    // UKEMI-CONC-1: ONE per-operator politeness gate, shared by the pool (every first attempt) and the retry below (every
    // attempt > 0), so "<= 1 call per minIntervalMs per operator" holds for retries too, whatever --concurrency.
    const gate = makePoliteGate(args.minIntervalMs, args.slowOperators, args.slowIntervalMs);

    // The `call` shim: route a LABEL -> client.call (meter + write-ahead ledger line + one transport attempt). Retry
    // is AT THE CALLER ONLY (C-4/C-6(iii)): a transient TRANSPORT fault (Abort/network/408/429/>=500, AND a NonJsonBody
    // at 200/408/429/>=500 - UKEMI-RETRY-1/-2, calque BELL-RETRY-1) is retried; an RpcError, a NonJsonBody at 2xx!=200,
    // another 4xx (getLogsVia needs the 400 THROWN to split), and the budget stop are NEVER retried. R retries => R+1
    // client.call => R+1 write-ahead ledger lines. The rpc_errors journal is built HERE from the TYPED TransportError
    // by e.name (C-5): never a raw body - e.detail is the closed hint (paid) / redacted (keyless), and (UKEMI-REVERT-1) the
    // FORM of e.data ("absent" | "0x" | hex length), never its bytes. Chainstack HTTP 400 => http:400, never code:400; a
    // NonJsonBody => "non-json <code>".
    const call: RpcCall = async (label, method, params) => {
      const op = label;
      for (let attempt = 0; ; attempt++) {
        tally.total += 1;
        tally.byOperator[op] = (tally.byOperator[op] ?? 0) + 1;
        tally.byMethod[method] = (tally.byMethod[method] ?? 0) + 1;
        try {
          return await (attempt === 0 ? c.call(op as OperatorLabel, method, params) : gate(op, () => c.call(op as OperatorLabel, method, params))); // UKEMI-CONC-1: a retry re-enters the gate
        } catch (e) {
          if (e instanceof BudgetExceededError) throw e; // fatal FIRST - never retried, never journaled as a transport fault
          if (e instanceof TransportError) {
            rpcErrors.push(
              e.name === "HttpError"
                ? { provider: op, method, message: e.detail, ...(e.code !== undefined ? { http: e.code } : {}) }
                : e.name === "RpcError"
                  ? { provider: op, method, message: e.detail !== "" ? e.detail : "rpc error", ...(e.code !== undefined ? { code: e.code } : {}), data: revertDataIndicator(e.data) } // UKEMI-REVERT-1: form only, never the bytes
                  : e.name === "NonJsonBody"
                    ? { provider: op, method, message: "non-json " + String(e.code ?? "?") } // UKEMI-RETRY-1: diag label; no http (RpcErrorRecord: http only for a non-2xx; a NonJsonBody is a 2xx)
                    : { provider: op, method, message: e.detail !== "" ? e.detail : e.name },
            );
            // UKEMI-RETRY-1 (calque BELL-RETRY-1 quorum.ts:isTransient): a NonJsonBody (HTTP 200 + non-JSON body, a
            // gateway HTML page) is TRANSIENT at code 200/429/>=500, so a provider blip is retried in place instead of
            // benching the leg (a bench that, once enough keyless legs bench, draws the paid leg and can STOP on
            // NoQuorum). 2xx!=200 (201/204) and 4xx not in {408,429} stay FATAL. The 408/429/>=500 arms are DEFENSIVE: via
            // this transport a NonJsonBody only ever carries a 2xx (transport.ts:229 !ok->HttpError, :228 3xx, :241 parse).
            // UKEMI-RETRY-2: HTTP 408 (drpc "Request timeout on the free plan", essai 4 STOP 2026-09-23) is retried in place,
            // never benched at once (2-operator eth_call pool: one bench = NoQuorum). UKEMI-RETRY-3: wait = retryWaitMs.
            const transient = e.name === "AbortError" || e.name === "TypeError" || e.name === "NetworkError"
              || (e.name === "NonJsonBody" && e.code !== undefined && (e.code === 200 || e.code === 408 || e.code === 429 || e.code >= 500))
              || (e.name === "HttpError" && e.code !== undefined && (e.code === 408 || e.code === 429 || e.code >= 500));
            if (transient && attempt < args.retries) { await (deps.sleep ?? defaultSleep)(retryWaitMs(attempt, args.backoffMs, args.backoffCapMs, e.retryAfterMs)); continue; }
          }
          throw e;
        }
      }
    };

    // L-4: the concordance sink is wired ONLY when --concordance-out is given (else onQuorum is undefined => NO-OP =>
    // book_digest byte-identical). The aggregate is per operator PAIR; it is flushed in the finally below (M-7c).
    const onQuorum = args.concordanceOut !== undefined
      ? (_label: string, opA: string, opB: string, concordant: boolean): void => { tallyConcordance(concordance, opA, opB, concordant); }
      : undefined;
    const basePool = makeUkemiPool({ call, ethCallProviders, getLogsProviders, minIntervalMs: args.minIntervalMs, slowOperators: args.slowOperators, slowIntervalMs: args.slowIntervalMs, onQuorum, gate });

    // C-5 resume/inputs cache (JSONL request->result, OUTSIDE the repo). Fresh => write the meta line; append every
    // MISS (a hit costs no budget => no client.call => 0 RU). After the record, a cached holders line that disagrees => abstention.
    let reader: UkemiReader = basePool;
    let resumeReader: ResumeReader | undefined;
    const opLabels = (labels: readonly string[]): string[] => { const s = [...labels]; return s.filter((v, i) => s.indexOf(v) === i); };
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
    // UKEMI-CONC-1: the prefetch needs a MEMOIZING reader; without --resume, an in-RAM memo (no file, no holders line).
    if (concurrency > 1 && resumeReader === undefined) reader = makeResumeReader(basePool, [], () => undefined);

    const fin = await reader.finalized();
    const block = args.block ?? fin.block;
    if (block > fin.block) throw new Error(`ukemi/record: B=${String(block)} > finalized ${String(fin.block)} (look-ahead forbidden, ADR-U1 D7)`);
    // UKEMI-CONC-1: the prefetch heartbeat (n > 1): cumulative holders done / config-passing seen / per-operator calls+errors.
    const tickFor = (pass: string): (() => void) => {
      const t0 = Date.now();
      return () => {
        const perOp = Object.entries(budgeted.byOperator()).map(([k, v]) => `${k}:${String(v)}`).join(","), perErr = Object.entries(errByOp).map(([k, v]) => `${k}:${String(v)}`).join(",");
        process.stderr.write(`  ..prefetch pass=${pass} holders_done=${String(progress.config_read)}/${String(progress.holders)} n_at_risk_config=${String(progress.n_at_risk_config)} rate=${(progress.config_read / Math.max((Date.now() - t0) / 1000, 0.001)).toFixed(2)}/s concurrency=${String(concurrency)} calls={${perOp}} errors={${perErr}} t=${new Date(deps.now()).toISOString()}\n`);
      };
    };

    // D-3 STAGE 1 — filter-only: measure nAtRisk (config filter, no per-account read); cache config reads for the course.
    if (args.filterOnly) {
      const t0 = Date.now();
      // UKEMI-CONC-1 (n > 1): warm every holder's config read through the window, then the UNCHANGED pass below replays
      // from the cache (its own counters restart at 0: the prefetch's are only for a stop's diag and the heartbeat).
      if (concurrency > 1) { await prefetchFilterReads(cluster, block, reader, { fromBlock: args.fromBlock, concurrency, progress, onTick: tickFor("filter"), every: args.heartbeatEvery, report: poolReport }); progress.config_read = 0; progress.n_at_risk_config = 0; }
      const onTick = (): void => {
        const t = (Date.now() - t0) / 1000;
        const perOp = Object.entries(budgeted.byOperator()).map(([k, v]) => `${k}:${String(v)}`).join(",");
        const perErr = Object.entries(errByOp).map(([k, v]) => `${k}:${String(v)}`).join(",");
        // UKEMI-HEARTBEAT-1: same line (cumulative tallies) + the wall-clock t=<ISO> (deps.now); stderr ONLY - never stdout/JSON.
        process.stderr.write(`  ..filter config_read=${String(progress.config_read)}/${String(progress.holders)} n_at_risk_config=${String(progress.n_at_risk_config)} rate=${(progress.config_read / Math.max(t, 0.001)).toFixed(2)}/s calls={${perOp}} errors={${perErr}} t=${new Date(deps.now()).toISOString()}\n`);
      };
      const fr = await enumerateAndCountAtRisk(cluster, block, reader, { fromBlock: args.fromBlock, heartbeatEvery: args.heartbeatEvery }, progress, onTick);
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
        params: { cluster: cluster.id, block, from_block: args.fromBlock ?? null, min_interval_ms: args.minIntervalMs, slow_operators: args.slowOperators, slow_interval_ms: args.slowIntervalMs, retries: args.retries, backoff_ms: args.backoffMs, backoff_cap_ms: args.backoffCapMs, max_calls: args.maxCalls, prereg_sha: args.preregSha ?? null, prereg_file: args.preregFile, prereg_binding: preregBinding, labeler_sha: args.labelerSha ?? null, resume: args.resume !== undefined, filter_only: true },
        calls: budgeted.total(), calls_by_operator: budgeted.byOperator(), calls_by_method: budgeted.byMethod(), errors_by_operator: errByOp, spent_by_operator: c.spent().byOperator, seconds, finalized_block: fin.block, ukemi_sha: ukemiSha(here),
        holders: fr.holders, holders_digest: fr.holders_digest, n_at_risk_config: fr.n_at_risk_config,
        excluded: { collateral_off: fr.excluded_collateral_off, no_debt: fr.excluded_no_debt }, projection_remaining_calls: 9 * fr.n_at_risk_config,
        concurrency, // UKEMI-CONC-1: provenance only (the counts above are the unchanged pass's, identical for every n)
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
    // UKEMI-CONC-1 (n > 1): warm recordBook's per-holder read plan through the window; the UNCHANGED recordBook (book.ts
    // not touched) then replays from the cache - book / book_digest / hf_findings order byte-identical by construction.
    if (concurrency > 1) await prefetchBookReads(cluster, block, reader, { fromBlock: args.fromBlock, concurrency, progress, onTick: tickFor("book"), every: args.heartbeatEvery, report: poolReport });
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
      params: { cluster: cluster.id, block, from_block: args.fromBlock ?? null, min_interval_ms: args.minIntervalMs, retries: args.retries, backoff_ms: args.backoffMs, backoff_cap_ms: args.backoffCapMs, max_calls: args.maxCalls, prereg_sha: args.preregSha ?? null, prereg_file: args.preregFile, prereg_binding: preregBinding, labeler_sha: args.labelerSha ?? null, resume: args.resume !== undefined },
      calls: budgeted.total(), calls_by_operator: budgeted.byOperator(), calls_by_method: budgeted.byMethod(), errors_by_operator: errByOp, spent_by_operator: c.spent().byOperator, seconds, finalized_block: fin.block, ukemi_sha: ukemiSha(here),
      counts: res.counts, holders_digest: res.holders_digest, book_digest: res.book_digest,
      hf_findings: res.hf_findings, timeline: res.timeline,
      concurrency, // UKEMI-CONC-1: provenance only, OUTSIDE the book / book_digest (identical for every n)
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
    // Q-C / C-R-b7 (decision 128): a FAILED course must never lose its diagnosis. Persist a DURABLE diagnostic journal
    // <out>.diag.json on EVERY failure path (BudgetExceededError, TransportError, RpcError, NoQuorumError, ABI, any
    // other) BEFORE the exit/rethrow below — the JSON of provenance carrying rpc_errors was previously written ONLY on
    // the success paths (:371/:400), so a non-budget throw lost rpc_errors/errByOp/tally (the C-R-b7 gap). Secret-free
    // by construction (the transport scrubs every raised message; rpc_errors hold only the registrable domain + closed
    // hint; the tally is counts) + a belt-and-suspenders URL strip. A write failure is consigned, NEVER masks e.
    try {
      // Prefer the SPECIFIC fault name when set (a TransportError carries e.name = HttpError/AbortError/RpcError…),
      // else the constructor name (BudgetExceededError does not override .name, so e.name is the generic "Error";
      // e.constructor.name identifies it — the established pattern, u4-oracle-path.mjs:123).
      const errName = e instanceof Error ? (e.name !== "" && e.name !== "Error" ? e.name : e.constructor.name) : "unknown";
      const diag = {
        ts: new Date(deps.now()).toISOString(),
        error: { name: errName, message: stripUrls(e instanceof Error ? e.message : String(e)) },
        calls_total: budgeted.total(),
        by_operator_method: { by_operator: budgeted.byOperator(), by_method: budgeted.byMethod() },
        rpc_errors: rpcErrors,
        errors_by_operator: errByOp,
        n_at_risk_seen: progress.n_at_risk_config,
        prereg_sha: args.preregSha ?? null,
        labeler_sha: args.labelerSha ?? null,
        ukemi_sha: ukemiSha(here),
        ...(concurrency > 1 ? { pool: { concurrency, suppressed: poolReport.suppressed.map((s) => ({ name: s.name, message: stripUrls(s.message) })) } } : {}), // UKEMI-CONC-1
      };
      writeFileSync(diagPath, JSON.stringify(diag, null, 2));
    } catch (werr) {
      process.stderr.write(`ukemi/record: FAILED to write diagnostic journal ${diagPath} (${werr instanceof Error ? werr.name : "error"}); diagnosis on stderr only\n`);
    }
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
    // Release the N per-operator locks openGuardedClient acquired (keyless included, even on a BudgetExceededError
    // stop) via the SERVED `unlock` (a chained `unlocked` line + lock-file removal). Only if the client was built:
    // if openGuardedClient threw, its own rollback already released any partial locks (guard, else we'd mask it). A
    // HARD crash (SIGKILL) instead leaves the locks held - fail-closed, detectable; the runbook then does N `unlock`
    // before `reconcile` (ADR). `readSnapshot` is unused by unlock. GARDE-HELIUS-1b0-E ripple (decision 121): unlock
    // each operator with ITS OWN cycle `cycles[op]`, NEVER the single `cycle` scalar, so a course locking >= 2
    // operators on distinct cycle-ids releases each under its own cycle. `op` comes from client.operators() =
    // Object.keys(cycles), so cycles[op] is always present (non-null asserted; throwing here would mask the outcome).
    if (client !== undefined) {
      for (const op of client.operators()) {
        runCli(["unlock", "--cycle", cycles[String(op)]!, "--op", String(op), "--reason", "ukemi/record: course end (finally, N unlock)"], { ledgerDir, floor, readSnapshot: () => { throw new Error("ukemi/record: readSnapshot is not used by unlock"); } });
      }
    }
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
