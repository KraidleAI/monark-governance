// MONARK Bell — L-2 multiplier-trajectory scan (ADR-T1aii D1-quater, lot -b3a). Enumerates a mint's history
// under quorum-2, decodes the 43/0 (Initialize) and 43/1 (UpdateMultiplier) instructions into a chronological
// event stream, and checks it against the CURRENT state (C-3 oracle). The bodies stage's CHEAP path (Helius
// getTransactionsForAddress `full`) is C-V-2-gated (gTfA credit/page is NOT FOUND in the docs — orchestrator
// Usage-dashboard measurement, RESSOURCES-HELIUS l.12) — so the LIVE race is a formed consultation; this module
// uses the standard-RPC getTransaction path (1 credit [lu], quorum-able), and is fully offline-testable via the
// injected `call`. NEVER prints a url/key (providerOf/operatorOf only, C-10).
//
// C-2 (encoding): `encoding: "json"` — instruction `data` is base58 (raw bytes), NEVER `jsonParsed` (which
// re-serialises the f64 to decimal, pitfall F-4). Filter: programId == Token-2022 AND data[0]==43 AND
// data[1] in {0,1} AND the instruction's mint account (index 0, instruction.rs) == THIS mint (the shared
// authority S7vYFF batches several xStocks in one tx — a mint-blind filter would cross-contaminate). Applied to
// top-level instructions AND meta.innerInstructions (CPI). Order = (slot, in-tx position); blockTime null =>
// fail-closed; two 43/x from different signatures in the SAME slot => order undecidable => fail-closed.
import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { providerOf } from "../../sentinel/src/rpc.ts";
import { operatorOf } from "./operators.ts";
import { signaturesUntil, MAX_TX_VERSION, type JsonRpcCall, type SigInfo } from "./rpc.ts";
import { signaturesSetKey, statusOf, BudgetExceededError, type TransportFault } from "./quorum.ts";
import { XSTOCKS } from "./pools.ts";
import { decodeUpdateMultiplier, decodeInitialize, decodeStateConfig, replayTriplet,
  type MultiplierEvent } from "./rebase-trajectory.ts";

const asObj = (x: unknown): Record<string, unknown> => (x && typeof x === "object" ? (x as Record<string, unknown>) : {});
const asArr = (x: unknown): unknown[] => (Array.isArray(x) ? x : []);
export const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"; // owner of the fixture mint (first-hand)

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
/** base58 (Bitcoin alphabet, as Solana `encoding:"json"` returns instruction data) -> raw bytes. bigint-exact;
 *  leading '1' chars are leading zero bytes. Node has no built-in base58 (C-2 needs the raw bytes). */
export function base58Decode(s: string): Uint8Array {
  let x = 0n;
  for (const ch of s) { const i = B58.indexOf(ch); if (i < 0) throw new Error("bell scan: bad base58 char"); x = x * 58n + BigInt(i); }
  const bytes: number[] = [];
  while (x > 0n) { bytes.unshift(Number(x & 0xffn)); x >>= 8n; }
  for (let k = 0; k < s.length && s[k] === "1"; k++) bytes.unshift(0);
  return new Uint8Array(bytes);
}

/** Full ordered account key list of a (v0/json) tx: static ++ loaded writable ++ loaded readonly (calque of
 *  rpc.ts accountKeysOf; json static keys are bare strings, not {pubkey}). Resolves an instruction account index.
 *  Exported for the L-1 SetAuthority scanner (rebase-crosscheck.ts), which resolves the target mint (account 0)
 *  and the current authority (account 1) of a SetAuthority instruction (source instruction.rs:183-194). */
export function keysOfJson(tx: Record<string, unknown>): string[] {
  const msg = asObj(asObj(tx.transaction).message);
  const stat = asArr(msg.accountKeys).map((k) => (typeof k === "string" ? k : String(asObj(k).pubkey)));
  const loaded = asObj(asObj(tx.meta).loadedAddresses);
  return [...stat, ...asArr(loaded.writable).map(String), ...asArr(loaded.readonly).map(String)];
}

/** The instructions of a (v0/json) tx in EXECUTION order: each top-level instruction immediately followed by its
 *  CPIs (its innerInstructions group, keyed by `index`) — NOT all-top-level-then-all-inner (else a same-target
 *  instruction that appears both top-level and in a CPI would mis-order, C-2). An inner group with an out-of-range
 *  index is appended, never dropped (fail-closed). Exported so the L-1 SetAuthority scanner (rebase-crosscheck.ts)
 *  walks the SAME CPI-aware list as eventsFromTx — one source, no drift (checkpoint-1 C-9: inner instructions/CPI). */
export function flattenInstructions(tx: unknown): unknown[] {
  const t = asObj(tx);
  const topLevel = asArr(asObj(asObj(t.transaction).message).instructions);
  const groups = asArr(asObj(t.meta).innerInstructions).map(asObj);
  const all: unknown[] = [];
  for (let i = 0; i < topLevel.length; i++) { all.push(topLevel[i]); for (const g of groups) if (Number(g.index) === i) all.push(...asArr(g.instructions)); }
  for (const g of groups) if (!(Number(g.index) >= 0 && Number(g.index) < topLevel.length)) all.push(...asArr(g.instructions));
  return all;
}

/** Decode the 43/0 and 43/1 ScaledUiAmount instructions of ONE json-encoded tx that act on `mint` (account 0),
 *  each top-level instruction then its CPIs, in execution order. Returns null (fail-closed) if blockTime is null. Pure. */
export function eventsFromTx(sig: string, slot: number, blockTimeSec: number | null, tx: unknown, mint: string): MultiplierEvent[] | null {
  if (blockTimeSec == null) return null; // C-2: blockTime null => fail-closed (caller marks incomplete)
  const t = asObj(tx);
  const keys = keysOfJson(t);
  const all = flattenInstructions(t);
  const out: MultiplierEvent[] = [];
  let pos = 0;
  for (const ixRaw of all) {
    const ix = asObj(ixRaw);
    const pid = keys[Number(ix.programIdIndex)];
    const accts = asArr(ix.accounts).map(Number);
    const data = typeof ix.data === "string" ? base58Decode(ix.data) : new Uint8Array();
    const a0 = accts[0];
    const ixMint = a0 !== undefined ? keys[a0] : undefined; // instruction.rs: account 0 = the mint
    if (pid === TOKEN_2022_PROGRAM && data.length >= 2 && data[0] === 43 && ixMint === mint) {
      if (data[1] === 1) {
        const u = decodeUpdateMultiplier(data);
        if (u) out.push({ kind: "update", multiplier: String(u.multiplier), multiplierBitsHex: u.multiplierBitsHex, effectiveTimestampSec: u.effectiveTimestampSec, blockTimeSec, slot, instructionIndex: pos, signature: sig });
      } else if (data[1] === 0) {
        const i = decodeInitialize(data);
        if (i) out.push({ kind: "initialize", multiplier: String(i.multiplier), multiplierBitsHex: i.multiplierBitsHex, effectiveTimestampSec: 0, blockTimeSec, slot, instructionIndex: pos, signature: sig });
      }
    }
    pos += 1;
  }
  return out;
}

export interface ScanResult {
  readonly events: MultiplierEvent[];
  readonly complete: boolean;
  readonly oracleSlot: number;
  readonly finalStateOk: boolean;
  readonly signatureCount: number;
  readonly reason?: string;
}

/** The first two DISTINCT operators (by operatorOf) among the providers, or null if fewer than two. Exported
 *  for the L-3 authority producer (rebase-produce.ts), which pins the same two-operator quorum. */
export function firstTwoDistinctOps(providers: readonly string[]): readonly [string, string] | null {
  const byOp = new Map<string, string>();
  for (const u of providers) { const op = operatorOf(u); if (!byOp.has(op)) byOp.set(op, u); if (byOp.size === 2) break; }
  const two = [...byOp.values()];
  return two.length === 2 && two[0] !== undefined && two[1] !== undefined ? [two[0], two[1]] : null;
}

/** Read the CURRENT ScaledUiAmountConfig state on BOTH operators (base64 => bit-exact, C-3). The two must concord
 *  on the triplet bits (else no_quorum). Returns S = MIN(slotA, slotB) (settled below both heads) + the triplet
 *  bits, or null on quorum failure. BudgetExceededError re-thrown (C-11). */
export async function pinOracleState(call: JsonRpcCall, ops: readonly [string, string], mint: string, faults: TransportFault[]): Promise<{ S: number; mulBits: string; newBits: string; effTs: number; auth: string | null } | null> {
  const read = async (u: string): Promise<{ slot: number; st: ReturnType<typeof decodeStateConfig> }> => {
    const r = asObj(await call(u, "getAccountInfo", [mint, { encoding: "base64" }]));
    const st = decodeStateConfig(scaledUiConfigBytes(Buffer.from(String(asArr(asObj(r.value).data)[0]), "base64")));
    return { slot: Number(asObj(r.context).slot), st };
  };
  let a: Awaited<ReturnType<typeof read>>, b: Awaited<ReturnType<typeof read>>;
  try { a = await read(ops[0]); } catch (e) { if (e instanceof BudgetExceededError) throw e; faults.push({ provider: providerOf(ops[0]), status: statusOf(e) }); return null; }
  try { b = await read(ops[1]); } catch (e) { if (e instanceof BudgetExceededError) throw e; faults.push({ provider: providerOf(ops[1]), status: statusOf(e) }); return null; }
  const key = (x: typeof a): string => x.st.multiplierBitsHex + "|" + x.st.newMultiplierBitsHex + "|" + String(x.st.effectiveTimestampSec);
  if (key(a) !== key(b)) return null; // providers disagree on the current state => no_quorum
  return { S: Math.min(a.slot, b.slot), mulBits: a.st.multiplierBitsHex, newBits: a.st.newMultiplierBitsHex, effTs: a.st.effectiveTimestampSec, auth: a.st.authority };
}

/** The Token-2022 mint account layout prepends a base (82) + TLV header before each extension state. This helper
 *  is a SEAM: given the full account bytes, return the 56-byte ScaledUiAmountConfig slice. Live wiring locates
 *  the TLV (type=25) offset; the offline oracle passes the exact 56-byte state, so it is the identity there. The
 *  full TLV walk is a formed item (E-7) — the scan's C-3 oracle is what proves the located bytes are right. */
export function scaledUiConfigBytes(accountData: Uint8Array): Uint8Array {
  return accountData.length === 56 ? accountData : locateScaledUiTlv(accountData);
}
function locateScaledUiTlv(data: Uint8Array): Uint8Array {
  // Token-2022: base mint = 82 bytes, then account_type (1) at 165, then TLV entries {type u16 little-endian, len u16 little-endian,
  // value}. ScaledUiAmount TLV type = 25 (extension/mod.rs). Walk from 166.
  let off = 166;
  while (off + 4 <= data.length) {
    const type = (data[off] ?? 0) | ((data[off + 1] ?? 0) << 8);
    const len = (data[off + 2] ?? 0) | ((data[off + 3] ?? 0) << 8);
    const start = off + 4;
    if (type === 25) return data.slice(start, start + 56);
    off = start + len;
  }
  throw new Error("bell scan: ScaledUiAmount TLV (type 25) not found in mint account");
}

/** Enumerate signatures on BOTH operators and concord over the SETTLED BAND [bandLo, S] both fully cover. A count
 *  cap (`maxPages`) leaves a ragged deep end that differs between two live reads seconds apart — comparing only
 *  the band (bandLo = the shallower of the two deepest slots) removes that artifact (measured -b3a). `reachedGenesis`
 *  is decided on the RAW (pre-`slot<=S`-filter) enumeration length: a full maxPages*1000 list means the cap was hit
 *  (the address's FIRST signature was NOT reached) — it is an ENUMERATION fact (the probe fetches no bodies, so it
 *  does not by itself prove a 43/0 Initialize was decoded; that is finalStateOk's job downstream). Returns the band
 *  sigs (op A), bandLo, the band's deepest blockTime (verifiability), reached-genesis, and band-set concordance;
 *  null on transport failure. Budget re-thrown. */
async function enumerateBand(call: JsonRpcCall, ops: readonly [string, string], mint: string, S: number, maxPages: number, faults: TransportFault[]): Promise<{ sigs: SigInfo[]; bandLo: number; deepestBlockTime: number | null; reachedGenesis: boolean; concord: boolean } | null> {
  let rawA: SigInfo[], rawB: SigInfo[];
  try { rawA = await signaturesUntil(call, ops[0], mint, 0, { maxPages }); } catch (e) { if (e instanceof BudgetExceededError) throw e; faults.push({ provider: providerOf(ops[0]), status: statusOf(e) }); return null; }
  try { rawB = await signaturesUntil(call, ops[1], mint, 0, { maxPages }); } catch (e) { if (e instanceof BudgetExceededError) throw e; faults.push({ provider: providerOf(ops[1]), status: statusOf(e) }); return null; }
  // Genesis (address's first signature) reached iff the RAW enumeration ended on a short page (< maxPages*1000).
  const reachedGenesis = rawA.length < maxPages * 1000 && rawB.length < maxPages * 1000;
  const sigsA = rawA.filter((s) => s.slot <= S), sigsB = rawB.filter((s) => s.slot <= S);
  const deepest = (l: SigInfo[]): number => (l.length ? Math.min(...l.map((s) => s.slot)) : S + 1);
  const bandLo = Math.max(deepest(sigsA), deepest(sigsB));
  const inBand = (s: SigInfo): boolean => s.slot >= bandLo && s.slot <= S;
  const bandA = sigsA.filter(inBand), bandB = sigsB.filter(inBand);
  const concord = signaturesSetKey(bandA.map((s) => s.signature)) === signaturesSetKey(bandB.map((s) => s.signature));
  const bts = bandA.map((s) => s.blockTime).filter((t): t is number => t != null);
  const deepestBlockTime = bts.length ? Math.min(...bts) : null;
  return { sigs: bandA, bandLo, deepestBlockTime, reachedGenesis, concord };
}

/** C-4(iii) quorum key of a candidate body = its DECODED events (sig|slot|mint|f64 bits|effTs|kind), never the raw
 *  JSON (incidental fields diverge between operators). Exported for the L-3 authority producer (rebase-produce.ts). */
export function bodyEventKey(mint: string, evs: readonly MultiplierEvent[]): string {
  return evs.map((e) => `${e.signature}|${String(e.slot)}|${mint}|${e.multiplierBitsHex}|${String(e.effectiveTimestampSec)}|${e.kind}`).join(";");
}

/** Scan ONE mint's multiplier trajectory (offline via injected `call`). Pins the oracle slot S on BOTH operators
 *  (min slot), concords signatures over the settled band, fetches bodies on operator A (getTransaction, encoding
 *  json, MAX_TX_VERSION reused — C-5), and RE-READS every 43/x candidate on operator B keyed on the DECODED event
 *  (C-4(iii) body quorum). Verifies the replay reproduces the read state (C-3). Any completeness failure =>
 *  complete=false + a reason (caller => rebase_unverified). BudgetExceededError RE-THROWN (C-11). */
export async function scanMultiplierEvents(call: JsonRpcCall, providers: readonly string[], mint: string,
  opts: { readonly maxPages?: number }, faults: TransportFault[]): Promise<ScanResult> {
  const ops = firstTwoDistinctOps(providers);
  if (ops === null) return { events: [], complete: false, oracleSlot: 0, finalStateOk: false, signatureCount: 0, reason: "no_quorum" };
  const oracle = await pinOracleState(call, ops, mint, faults);
  if (oracle === null) return { events: [], complete: false, oracleSlot: 0, finalStateOk: false, signatureCount: 0, reason: "no_quorum_state" };
  const S = oracle.S;
  const band = await enumerateBand(call, ops, mint, S, opts.maxPages ?? 5000, faults);
  if (band === null) return { events: [], complete: false, oracleSlot: S, finalStateOk: false, signatureCount: 0, reason: "no_quorum_sigs" };
  const events: MultiplierEvent[] = [];
  let blockTimeNull = false, bodyQuorumFail = false;
  for (const s of band.sigs) {
    if (s.err != null) continue;
    const txA = asObj(await call(ops[0], "getTransaction", [s.signature, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "json" }]));
    const evA = eventsFromTx(s.signature, Number(txA.slot), typeof txA.blockTime === "number" ? txA.blockTime : null, txA, mint);
    if (evA === null) { blockTimeNull = true; continue; }
    if (evA.length === 0) continue; // not a 43/x-for-this-mint tx
    // C-4(iii): quorum-2 on the DECODED EVENT — re-read the candidate on operator B.
    const txB = asObj(await call(ops[1], "getTransaction", [s.signature, { maxSupportedTransactionVersion: MAX_TX_VERSION, encoding: "json" }]));
    const evB = eventsFromTx(s.signature, Number(txB.slot), typeof txB.blockTime === "number" ? txB.blockTime : null, txB, mint);
    if (evB === null || bodyEventKey(mint, evA) !== bodyEventKey(mint, evB)) { bodyQuorumFail = true; continue; }
    events.push(...evA);
  }
  events.sort((a, b) => a.slot - b.slot || a.instructionIndex - b.instructionIndex);
  const sameSlotAmbiguous = ((): boolean => {
    for (let i = 1; i < events.length; i++) { const a = events[i], b = events[i - 1]; if (a && b && a.slot === b.slot && a.signature !== b.signature) return true; }
    return false;
  })();
  const trip = replayTriplet(events, Number.MAX_SAFE_INTEGER); // events already bounded to slot<=S by the band
  const finalStateOk = trip !== null && trip.multiplierBitsHex === oracle.mulBits && trip.newMultiplierBitsHex === oracle.newBits && trip.effectiveTimestampSec === oracle.effTs;
  const complete = band.concord && band.reachedGenesis && !blockTimeNull && !sameSlotAmbiguous && !bodyQuorumFail && finalStateOk;
  const reason = !band.concord ? "signature_band_divergence" : !band.reachedGenesis ? "capped_not_at_genesis"
    : bodyQuorumFail ? "body_quorum" : blockTimeNull ? "block_time_null" : sameSlotAmbiguous ? "same_slot_order_undecidable"
    : !finalStateOk ? "state_oracle_divergence" : undefined;
  return { events, complete, oracleSlot: S, finalStateOk, signatureCount: band.sigs.length, ...(reason !== undefined ? { reason } : {}) };
}

const sha = (s: string): string => createHash("sha256").update(s).digest("hex");

/** L-2 --rebase-scan CLI (invoked by collect main()). Runs the SIGNATURE PROBE (both operators, signatures only,
 *  ~1 credit/page [lu]) per wanted mint, pins the oracle slot (min across operators), concords over the settled
 *  band, and writes an out-of-repo probe + a BUDGET for both body methods. STOPS before the bodies stage: the
 *  cheap gTfA path is C-V-2-gated (gTfA credit/page NOT FOUND) — the race is a formed consultation. Domains +
 *  counts only (never a url/key). */
export async function runRebaseScanCli(call: JsonRpcCall, providers: readonly string[], wanted: readonly string[],
  fromSec: number, toSec: number, out: string, opts: { readonly maxPages?: number }, callsUsed: () => number, maxCalls: number, faults: TransportFault[]): Promise<void> {
  mkdirSync(out, { recursive: true });
  const perMint: Record<string, unknown> = {};
  const ops = firstTwoDistinctOps(providers);
  for (const tok of XSTOCKS.filter((t) => wanted.includes(t.symbol))) {
    if (ops === null) { perMint[tok.symbol] = { error: "no_quorum" }; continue; }
    const oracle = await pinOracleState(call, ops, tok.address, faults);
    if (oracle === null) { perMint[tok.symbol] = { error: "no_quorum_state" }; continue; }
    const band = await enumerateBand(call, ops, tok.address, oracle.S, opts.maxPages ?? 5000, faults);
    if (band === null) { perMint[tok.symbol] = { error: "no_quorum_sigs" }; continue; }
    const inWin = band.sigs.filter((s) => s.blockTime != null && s.blockTime >= fromSec && s.blockTime <= toSec).length;
    const N = band.sigs.length, pages = Math.ceil(N / 1000);
    perMint[tok.symbol] = { band_signatures: N, signatures_in_window: inWin, pages, oracle_slot: oracle.S, band_lo_slot: band.bandLo,
      band_deepest_blocktime: band.deepestBlockTime, band_concord: band.concord, reached_genesis: band.reachedGenesis,
      budget_getTransaction_credits_quorum2: N * 2, budget_gtfa_pages: pages,
      budget_gtfa_credits: "UNKNOWN (C-V-2: gTfA credit/page NOT FOUND — orchestrator Usage dashboard)" };
  }
  const report = { generated_at: new Date().toISOString(), providers: providers.map(providerOf), operators: [...new Set(providers.map(operatorOf))],
    window: { fromSec, toSec }, calls_used: callsUsed(), max_calls: maxCalls, per_mint: perMint,
    bodies_stage: "DEFERRED — C-V-2 (gTfA credit/page) is an orchestrator Usage-dashboard measurement; the trajectory race is a formed consultation (see PLI)" };
  const body = JSON.stringify(report, null, 2);
  const path = resolve(out, "rebase-probe.json");
  writeFileSync(path, body);
  process.stdout.write(`bell/rebase-scan probe sha=${sha(body)} operators=${report.operators.join(",")} calls=${String(callsUsed())}/${String(maxCalls)} out=${path}\n`);
}
