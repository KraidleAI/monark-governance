// MONARK Bell — off-tool collector entrypoint (ADR-B0 D7 O-5, ADR-T1aii D1 lot -a). Env-driven CLI, NEVER
// run in CI (a run-guarded main). The CORE `collect()` is pure: it takes already-read inputs (fills, closes,
// ADV, mint readouts, halt rows — quorum decided by the reader) and returns the digest, state.json body,
// chained timeline, provenance and journal. CI drives it offline on fixtures; the same core runs live.
//
// KEY HYGIENE (C-10, MAST secret-leak): the journal and provenance carry `providerOf` ONLY — never a URL
// (a Helius URL holds ?api-key=<uuid>). The default network call throws `HTTP <status>` with NO url, and the
// quorum records transport faults as {provider,status} (quorum.ts). record.ts:22 / rpc2.ts:136 fold the url
// / the message; NEITHER is reproduced. CA-11: outputs are written OUTSIDE the git tree (--out, default
// F:/tmp/bell-out; main asserts --out is not under the repo root), so nothing is published until T-1b.
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve, relative, isAbsolute } from "node:path";
import { XSTOCKS, POOLS, type PoolRef } from "./pools.ts";
import { classifySession } from "./sessions.ts";
import { sessionGap, exceeds, vwapDecimal, fixed, GAP_PRECISION } from "./gap.ts";
import { rowsFromCsv, haltDelta, census, haltsSince, type HaltRow } from "./halts.ts";
import { buildDigest, bellSha, assertNoClose, canonical, provenance as makeProvenance,
  type GapEntry, type Provenance } from "./digest.ts";
import { newResidualCounts, RESIDUAL_CODES, type Residual, type ResidualCounts } from "./residuals.ts";
import { poolVolumeBase, consolidatedAdv, volumeToAdvRatio } from "./volume.ts";
import { readMintToken2022, porStatus, wrapperStatus, type MintReadout } from "./supply.ts";
import { quorum2, signaturesSetKey, statusOf, NoQuorumError, QuorumDisagreementError,
  SolRpcError, type JsonRpcCall, type TransportFault } from "./quorum.ts";
import { signaturesUntil, extractPoolSwap, MAX_TX_VERSION, solanaEndpoints, type SigInfo, type SwapFill } from "./rpc.ts";
import { providerOf } from "../../sentinel/src/rpc.ts";
import { liveEthSwaps } from "./ethereum.ts";

type Json = null | boolean | number | string | Json[] | { [k: string]: Json };

/** All the per-symbol data the reader gathered (quorum already decided). The core computes facts + residues. */
export interface SymbolInput {
  readonly symbol: string;
  readonly chain: "solana" | "ethereum";
  readonly baseDec: number;
  readonly quoteDec: number;
  readonly fills: readonly SwapFill[];
  readonly fillsResidues: readonly Residual[]; // no_quorum / quorum_sampled from the reader
  readonly quorumCoverage?: number; // sampled-body coverage rate (published with quorum_sampled)
  readonly closeRefBySession: Readonly<Record<string, number>>; // sessionDateET -> close (read, never stored)
  readonly advDailyVolumes: readonly number[]; // prior-month daily share volumes ([2nd] Polygon)
  readonly mint?: MintReadout; // Token-2022 readout (iv)
  readonly porRelayed?: { readonly value: string; readonly updatedAtSec: number };
}
export interface CollectInput {
  readonly symbols: readonly SymbolInput[];
  readonly haltRows: readonly HaltRow[];
  readonly window: { readonly fromUtcMs: number; readonly toUtcMs: number };
  readonly nowSec: number;
  readonly staleBoundSec: number;
  readonly generatedAt: string; // provenance only (not hashed)
  readonly faults?: readonly TransportFault[]; // transport faults for the journal (providerOf only)
  readonly providers?: readonly string[]; // provider DOMAINS (providerOf), never urls
}
export interface CollectResult {
  readonly bellSha: string;
  readonly digest: Json;
  readonly state: Json;
  readonly timeline: Json[];
  readonly provenance: Provenance;
  readonly journal: Json;
}

const GENESIS = "0".repeat(64);
/** Append-only chain (Narabi motif M012 D4, unsigned at T-1a-ii): each line carries prev_line_hash = sha256
 *  of the canonical previous line. Tamper-evident; the Ed25519 signature is a T-1b fact (D8). */
export function chainTimeline(records: readonly Json[]): Json[] {
  const out: Json[] = [];
  let prev = GENESIS;
  for (const r of records) {
    const line: { [k: string]: Json } = { ...(r as { [k: string]: Json }), prev_line_hash: prev };
    assertNoClose(line);
    out.push(line);
    prev = createHash("sha256").update(canonical(line)).digest("hex");
  }
  return out;
}

/** Volume of fills in human base units as a fixed-precision decimal (mirrors gap.ts sessionGap.volumeBase). */
function volumeBaseDecimal(fills: readonly SwapFill[], baseDec: number): string {
  const total = poolVolumeBase(fills);
  return fixed((total * 10n ** BigInt(GAP_PRECISION)) / 10n ** BigInt(baseDec), GAP_PRECISION);
}

/** The pure core (ADR-T1aii D1 lot -a). Deterministic: same inputs ⇒ bit-identical bellSha (replay oracle). */
export function collect(input: CollectInput): CollectResult {
  const counts: ResidualCounts = newResidualCounts();
  const bump = (r: Residual): void => { counts[r] += 1; };

  const gapEntries: GapEntry[] = [];
  const volumeEntries: Json[] = [];
  const supplyEntries: Json[] = [];
  const porEntries: Json[] = [];
  const wrapperEntries: Json[] = [];
  const timelineRecords: Json[] = [];

  for (const s of input.symbols) {
    for (const r of s.fillsResidues) bump(r);

    // (i) session gap per session group. Groups are built from the fills, so each has >= 1 fill; a symbol
    // with no fills (and no no_quorum reason) is a no_fill_in_window abstention for the whole window.
    const groups = new Map<string, { session: string; regime: string | null; anchor: string; fills: SwapFill[] }>();
    for (const f of s.fills) {
      const cls = classifySession(f.blockTimeUtcMs);
      const key = `${cls.session}|${cls.regime ?? "null"}|${cls.sessionDateET}`;
      const g = groups.get(key) ?? { session: cls.session, regime: cls.regime, anchor: cls.sessionDateET, fills: [] };
      g.fills.push(f);
      groups.set(key, g);
    }
    if (s.fills.length === 0 && !s.fillsResidues.includes("no_quorum")) bump("no_fill_in_window");

    const symGaps: GapEntry[] = [];
    for (const g of [...groups.values()].sort((a, b) => a.anchor.localeCompare(b.anchor) || a.session.localeCompare(b.session))) {
      const close = g.anchor in s.closeRefBySession ? s.closeRefBySession[g.anchor] : undefined;
      if (close === undefined || close <= 0) {
        bump("no_close_ref"); // V-7: volume present but no reference close — abstain, carry vwap, never a fake gap
        symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: vwapDecimal(g.fills, s.baseDec, s.quoteDec),
          volumeBase: volumeBaseDecimal(g.fills, s.baseDec), n: g.fills.length, abstain: "no_close_ref" });
        continue;
      }
      const gap = sessionGap(g.fills, close, s.baseDec, s.quoteDec);
      if ("abstain" in gap) { bump(gap.abstain); symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: gap.vwap, volumeBase: gap.volumeBase, n: gap.n, abstain: gap.abstain }); continue; }
      symGaps.push({ symbol: s.symbol, session: g.session, regime: g.regime, vwap: gap.vwap, gT: gap.gT, volumeBase: gap.volumeBase, n: gap.n,
        exceed1: exceeds(gap.gT, 1) ? 1 : 0, exceed2: exceeds(gap.gT, 2) ? 1 : 0, exceed5: exceeds(gap.gT, 5) ? 1 : 0 });
    }
    gapEntries.push(...symGaps);

    // (iii) volume vs consolidated ADV — ratio only, ADV never carried (C-6). multiplier != 1 ⇒ unit residue.
    const volumeBaseUnits = poolVolumeBase(s.fills);
    const adv = consolidatedAdv(s.advDailyVolumes);
    const multiplier = s.mint?.multiplier ?? "1";
    let multiplierUnit = Number(multiplier) !== 1;
    if (adv > 0 && s.fills.length > 0) {
      const rr = volumeToAdvRatio(volumeBaseUnits, s.baseDec, adv, multiplier);
      multiplierUnit = multiplierUnit || rr.multiplier_unit;
      volumeEntries.push({ symbol: s.symbol, vol_ratio: rr.vol_ratio, multiplier_unit: multiplierUnit });
    } else {
      volumeEntries.push({ symbol: s.symbol, ratio_computed: false, multiplier_unit: multiplierUnit });
    }
    if (multiplierUnit) bump("multiplier_unit");

    // (iv) supply readout (paused/permanentDelegate read-and-logged, not rendered — T-1b/T-2), PoR, wrappers.
    if (s.mint) {
      supplyEntries.push({ symbol: s.symbol, supply: s.mint.supply, decimals: s.mint.decimals, multiplier: s.mint.multiplier,
        paused: s.mint.paused, permanent_delegate: s.mint.permanentDelegate });
    }
    const por = porStatus(s.symbol, input.nowSec, input.staleBoundSec, s.porRelayed);
    if (por.kind === "unavailable") { bump("por_unavailable"); porEntries.push({ symbol: s.symbol, kind: por.kind, method: por.source.method, note: por.source.note }); }
    else if (por.kind === "stale") { bump("por_stale"); porEntries.push({ symbol: s.symbol, kind: por.kind, age_sec: por.ageSec, method: por.source.method }); }
    else { porEntries.push({ symbol: s.symbol, kind: por.kind, statement: por.statement, method: por.source.method }); }
    const wr = wrapperStatus(s.symbol);
    if (wr.residue) bump(wr.residue);
    wrapperEntries.push({ symbol: s.symbol, contracts: [...wr.contracts], residue: wr.residue ?? "none" });

    // one timeline record per symbol (append-only chain, chained below).
    const cov = s.quorumCoverage;
    timelineRecords.push({ symbol: s.symbol, chain: s.chain, n_fills: s.fills.length, sessions: symGaps.length,
      ...(cov !== undefined ? { quorum_coverage: cov } : {}) });
  }

  // Halt residues (ii): position, recensed n = 0 (empty fills), residues folded into the counter (never silent).
  for (const row of input.haltRows) for (const r of haltDelta(row, []).residues) bump(r);
  const cen = census(input.haltRows);
  const haltCensus: Json = { total: cen.total, empty_resume: cen.emptyResume };

  const digest = buildDigest(gapEntries, haltCensus, {
    residuals: counts as unknown as Json, volume: volumeEntries, supply: supplyEntries, por: porEntries, wrapper: wrapperEntries,
  });
  const bellShaHex = bellSha(digest);

  const providers = [...(input.providers ?? [])];
  const faults = [...(input.faults ?? [])] as unknown as Json;
  const prov = makeProvenance(digest, { generated_at: input.generatedAt },
    { providers, quorum: 2, faults }, input.generatedAt);

  const state: Json = { schema: "bell-state-v1", bell_sha: bellShaHex,
    window: { from_utc_ms: input.window.fromUtcMs, to_utc_ms: input.window.toUtcMs }, residuals: counts as unknown as Json, digest };
  const timeline = chainTimeline(timelineRecords);
  const journal: Json = { generated_at: input.generatedAt, providers, quorum: 2, faults,
    residual_total: RESIDUAL_CODES.reduce((a, c) => a + counts[c], 0) };

  return { bellSha: bellShaHex, digest, state, timeline, provenance: prov, journal };
}

// ---- Live wiring (network; run-guarded main only, NOT run in CI) -----------------------------------------
const UNDERLYING: Readonly<Record<string, string>> = { TSLAx: "TSLA", SPYx: "SPY", NVDAx: "NVDA", AAPLx: "AAPL", TSLAon: "TSLA" };

/** Default Solana JSON-RPC call: throws SolRpcError (code) on a node error and `HTTP <status>` (NO url) on a
 *  transport fault — the url is opaque here, so no ?api-key can leak into a message (C-10). */
export const bellSolanaCall: JsonRpcCall = async (url, method, params) => {
  const ctl = new AbortController();
  const to = setTimeout(() => { ctl.abort(); }, 30_000);
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }), signal: ctl.signal });
    if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
    const json = (await res.json()) as { result?: unknown; error?: { code?: number; message?: string } };
    if (json.error) throw new SolRpcError(json.error.message ?? "rpc error", json.error.code ?? 0);
    return json.result;
  } finally { clearTimeout(to); }
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));
/** Bounded retry on 429 / 5xx (transport), deterministic backoff, no url in any message. */
async function withRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  let last: unknown;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { last = e; const st = statusOf(e); if (!/HTTP 5|HTTP 429|timeout|transport/.test(st)) throw e; await sleep(400 * (i + 1)); }
  }
  throw last instanceof Error ? last : new Error("retry exhausted");
}

/** Live Solana fills for a pool with quorum (C-1): the signature SET must concord across 2 providers; bodies
 *  are quorum-sampled every N and fetched single-provider otherwise (deterministic sample; coverage published
 *  with quorum_sampled). Fewer than 2 distinct providers ⇒ no_quorum for the whole symbol. */
async function liveSolanaFills(call: JsonRpcCall, providers: readonly string[], pool: PoolRef, fromSec: number, toSec: number,
  opts: { maxPages: number; bodySample: number }, faults: TransportFault[]): Promise<{ fills: SwapFill[]; residues: Residual[]; coverage: number }> {
  const vault = pool.vaultBase;
  if (vault === undefined) return { fills: [], residues: ["no_quorum"], coverage: 0 };
  let sigList: SigInfo[];
  try {
    // Concord on the WINDOWED set (not the racy live tail): filter each provider's enumeration to
    // [fromSec, toSec] BEFORE hashing, so two providers agree on a settled window (C-1).
    sigList = await quorum2(`sigs:${pool.baseSymbol}`, providers, call,
      (c, u) => signaturesUntil(c, u, vault, fromSec, { maxPages: opts.maxPages })
        .then((list) => list.filter((s) => s.err == null && s.blockTime != null && s.blockTime >= fromSec && s.blockTime <= toSec)),
      (list) => signaturesSetKey(list.map((s) => s.signature)), faults);
  } catch (e) {
    if (e instanceof NoQuorumError || e instanceof QuorumDisagreementError) return { fills: [], residues: ["no_quorum"], coverage: 0 };
    throw e;
  }
  const inWin = sigList.filter((s) => s.err == null && s.blockTime != null && s.blockTime >= fromSec && s.blockTime <= toSec);
  const primary = providers[0] ?? ""; // fastest provider first (Helius 50 req/s) for single-provider bodies
  const fills: SwapFill[] = [];
  const seen = new Set<string>();
  let sampled = 0;
  for (let i = 0; i < inWin.length; i++) {
    const s = inWin[i];
    if (s === undefined || s.blockTime == null || seen.has(s.signature)) continue;
    seen.add(s.signature);
    const bt = s.blockTime;
    const sig = s.signature;
    const bodyParams: readonly unknown[] = [sig, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "jsonParsed" }];
    let fill: SwapFill | null = null;
    try {
      if (opts.bodySample > 0 && i % opts.bodySample === 0) {
        fill = await quorum2(`body:${sig.slice(0, 8)}`, providers, call, (c, u) => c(u, "getTransaction", bodyParams).then((tx) => extractPoolSwap(sig, bt, tx, pool)),
          (f) => (f ? `${String(f.baseDelta)}|${String(f.quoteDelta)}` : "null"), faults);
        sampled++;
      } else {
        fill = extractPoolSwap(sig, bt, await withRetry(() => call(primary, "getTransaction", bodyParams)), pool);
      }
    } catch (e) {
      // a body we could not read (rate/transport) or a quorum miss on a sampled body: SKIP it (a coverage
      // gap, published via quorum_sampled), never fatal. Record the fault (providerOf/status, no url).
      if (!(e instanceof NoQuorumError || e instanceof QuorumDisagreementError)) faults.push({ provider: providerOf(primary), status: statusOf(e) });
      continue;
    }
    if (fill) fills.push(fill);
  }
  const residues: Residual[] = [];
  const coverage = inWin.length ? sampled / inWin.length : 1;
  if (sampled < inWin.length) residues.push("quorum_sampled");
  return { fills, residues, coverage };
}

/** Polygon prev close (read, never stored) + prior-month daily SHARE volumes for a symbol underlying,
 *  keyed to the fills' session anchors. Faults are recorded as {provider,status} (no url/key). */
async function closeAndAdv(underlying: string, polygonKey: string, toUtcMs: number, fills: readonly SwapFill[], faults: TransportFault[]): Promise<{ closeRefBySession: Record<string, number>; advDailyVolumes: number[] }> {
  const closeRefBySession: Record<string, number> = {};
  let advDailyVolumes: number[] = [];
  if (!polygonKey) return { closeRefBySession, advDailyVolumes };
  try {
    const prev = await withRetry(() => polygonGet(`/v2/aggs/ticker/${underlying}/prev?adjusted=false`, polygonKey));
    const close = prev.results?.[0]?.c;
    if (typeof close === "number") for (const f of fills) closeRefBySession[classifySession(f.blockTimeUtcMs).sessionDateET] = close;
    const to = new Date(toUtcMs), from = new Date(toUtcMs - 45 * 86_400_000);
    const fmt = (d: Date): string => d.toISOString().slice(0, 10);
    const bars = await withRetry(() => polygonGet(`/v2/aggs/ticker/${underlying}/range/1/day/${fmt(from)}/${fmt(to)}?adjusted=true&sort=asc&limit=60`, polygonKey));
    advDailyVolumes = (bars.results ?? []).map((r) => r.v ?? 0).filter((v) => v > 0);
  } catch (e) { faults.push({ provider: "polygon.io", status: statusOf(e) }); }
  return { closeRefBySession, advDailyVolumes };
}

/** Polygon prior-month daily SHARE volumes (range/1/day) and prev close — key in the Authorization header,
 *  NEVER in the url (?apiKey). Values are used internally; the ADV is never written to any output (C-6). */
async function polygonGet(pathAndQuery: string, apiKey: string): Promise<{ results?: Array<{ v?: number; c?: number }> }> {
  const res = await fetch(`https://api.polygon.io${pathAndQuery}`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) throw new Error(`HTTP ${String(res.status)}`);
  return (await res.json()) as { results?: Array<{ v?: number; c?: number }> };
}

/** A stable identity key of a mint account for the quorum (supply drifts, so key the fields that do not). */
function mintKey(result: unknown): Json {
  const m = readMintToken2022(result, "");
  return { decimals: m.decimals, multiplier: m.multiplier, permanent_delegate: m.permanentDelegate };
}

function argOf(argv: readonly string[], k: string): string | undefined { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : undefined; }

/** CA-11 guard (pure, wired in main): a bell --out MUST be OUTSIDE the repo tree. win32 path.resolve keeps
 *  the input's drive-letter case, so the old `resolve(out).startsWith(root)` missed `f:\…` vs `F:\…` and wrote
 *  inside (measured, G2 CA-11a). Compare lowercased + path.relative: "" (out === root) or a rel that is neither
 *  ".."-prefixed nor absolute ⇒ under root ⇒ throw. Lowercasing fail-closes a pathological case-sensitive-posix
 *  collision — the safe direction for a CA-11 guard (this runs only in the win32-operator main(), never in CI). */
export function assertOutsideRepo(out: string, repoRoot: string): void {
  const root = resolve(repoRoot).toLowerCase();
  const rel = relative(root, resolve(out).toLowerCase());
  if (rel === "" || (!rel.startsWith("..") && !isAbsolute(rel))) {
    throw new Error("bell/collect: --out is under the repo root (CA-11: outputs must be OUTSIDE the tree)");
  }
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const out = argOf(argv, "--out") ?? "F:/tmp/bell-out";
  const repoRoot = resolve(fileURLToPath(new URL("../../../", import.meta.url)));
  assertOutsideRepo(out, repoRoot);
  const toUtcMs = Number(argOf(argv, "--to-utc") ?? Date.now());
  const windowDays = Number(argOf(argv, "--window-days") ?? 3);
  const fromUtcMs = Number(argOf(argv, "--from-utc") ?? toUtcMs - windowDays * 86_400_000);
  const wanted = (argOf(argv, "--pools") ?? "TSLAx").split(",").map((x) => x.trim()).filter(Boolean);
  const maxPages = Number(argOf(argv, "--max-pages") ?? 3);
  const bodySample = Number(argOf(argv, "--body-sample") ?? 5);
  const minInterval = Number(argOf(argv, "--min-interval") ?? 250);

  const solProviders = solanaEndpoints();
  const polygonKey = process.env.POLYGON_API_KEY ?? "";
  const faults: TransportFault[] = [];
  let calls = 0;
  const call: JsonRpcCall = async (u, m, p) => { calls++; if (minInterval > 0) await sleep(minInterval); return bellSolanaCall(u, m, p); };
  const providerDomains = [...new Set(solProviders.map(providerOf))];

  const symbols: SymbolInput[] = [];
  for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) {
    const pool = POOLS.find((pp) => pp.baseSymbol === tok.symbol && pp.chain === "solana");
    if (!pool) continue;
    const solved = await liveSolanaFills(call, solProviders, pool, Math.floor(fromUtcMs / 1000), Math.floor(toUtcMs / 1000), { maxPages, bodySample }, faults);
    let mint: MintReadout | undefined;
    const mintResidues: Residual[] = [];
    try {
      const res = await quorum2(`mint:${tok.symbol}`, solProviders, call, (c, u) => c(u, "getAccountInfo", [tok.address, { encoding: "jsonParsed" }]), (r) => canonical(mintKey(r)), faults);
      mint = readMintToken2022(res, tok.symbol);
    } catch (e) { if (e instanceof NoQuorumError || e instanceof QuorumDisagreementError) mintResidues.push("no_quorum"); else throw e; }
    const { closeRefBySession, advDailyVolumes } = await closeAndAdv(UNDERLYING[tok.symbol] ?? tok.symbol, polygonKey, toUtcMs, solved.fills, faults);
    symbols.push({ symbol: tok.symbol, chain: "solana", baseDec: tok.decimals, quoteDec: 6, fills: solved.fills,
      fillsResidues: [...solved.residues, ...mintResidues], quorumCoverage: solved.coverage, closeRefBySession, advDailyVolumes, ...(mint ? { mint } : {}) });
  }

  // Ethereum leg (ADR-T1aii D1): Uniswap v3 TSLAon/USDC swaps via makeUkemiPool.getLogsRange (quorum-2),
  // behind --eth with an explicit block range (eth getLogs is block-ranged). Skipped (declared) otherwise.
  const ethFrom = Number(argOf(argv, "--eth-from-block") ?? 0), ethTo = Number(argOf(argv, "--eth-to-block") ?? 0);
  if (argv.includes("--eth") && wanted.includes("TSLAon") && ethFrom > 0 && ethTo >= ethFrom) {
    const ethPool = POOLS.find((pp) => pp.chain === "ethereum" && pp.baseSymbol === "TSLAon");
    if (ethPool) {
      try {
        const ethFills = await liveEthSwaps(ethPool, ethFrom, ethTo);
        const { closeRefBySession, advDailyVolumes } = await closeAndAdv("TSLA", polygonKey, toUtcMs, ethFills, faults);
        symbols.push({ symbol: "TSLAon", chain: "ethereum", baseDec: 18, quoteDec: 6, fills: ethFills, fillsResidues: [], closeRefBySession, advDailyVolumes });
      } catch (e) { faults.push({ provider: "ethereum", status: statusOf(e) }); }
    }
  }

  const csvPath = process.env.BELL_HALTS_CSV;
  const haltRows: HaltRow[] = csvPath ? haltsSince(rowsFromCsv(readFileSync(csvPath, "utf8")), Object.values(UNDERLYING), new Date(fromUtcMs).toISOString().slice(0, 10)) : [];
  const result = collect({ symbols, haltRows, window: { fromUtcMs, toUtcMs }, nowSec: Math.floor(Date.now() / 1000), staleBoundSec: 26 * 3600, generatedAt: new Date().toISOString(), faults, providers: providerDomains });

  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, "state.json"), JSON.stringify(result.state, null, 2));
  writeFileSync(resolve(out, "timeline.jsonl"), result.timeline.map((l) => JSON.stringify(l)).join("\n") + "\n");
  writeFileSync(resolve(out, "journal.json"), JSON.stringify(result.journal, null, 2));
  process.stdout.write(`bell/collect bell_sha=${result.bellSha} symbols=${String(symbols.length)} calls=${String(calls)} providers=${providerDomains.join(",")} out=${out}\n`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e: unknown) => { process.stderr.write(`FATAL ${e instanceof Error ? statusOf(e) : "error"}\n`); process.exit(1); });
}
