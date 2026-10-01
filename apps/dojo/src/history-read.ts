// MONARK Dojo -- PR-2b-1 (ADR-DOJO-PR-2B D-14 l.516, section 4 l.557-570): pure reading of the retroactive history. Merge of the two
// signature indexes (D-4 l.296-309), reading key and body quorum (D-5 l.310-329, D-6 l.331-344), per-account chaining (D-8 (iii)
// l.367), supply moves per transaction (D-8 (i) l.365, transaction part) and the checks (iv) to (vii) (l.368-371). No network, no
// clock, no I/O. The two operators are "a" and "b", never named. Every stop throws DojoHistoryStop: the seven collector stops of D-11
// l.425 that this PR raises, plus three PROPOSED names for stops D-5/D-6 leave unnamed (index_inconsistent, owner_unknown,
// read_malformed; journal questions). None is a verifier code (mere D-10: 45 codes, none added). Consumer: PR-2b-2 (history-build.ts).
import { createHash } from "node:crypto";
import { canonical } from "../../bell/scripts/bell-chain.mjs";

export const DOJO_HISTORY_STOPS = Object.freeze(["creation_mismatch", "chain_break", "supply_mismatch", "no_quorum_unbounded",
  "instruction_not_allowed", "day_not_monotone", "bound_exceeded", "index_inconsistent", "owner_unknown", "read_malformed"] as const);
export type HistoryStop = (typeof DOJO_HISTORY_STOPS)[number];
export class DojoHistoryStop extends Error {
  readonly code: HistoryStop;
  readonly detail: string;
  constructor(code: HistoryStop, detail: string) { super(`dojo/history: ${code}: ${detail}`); this.code = code; this.detail = detail; }
}
const stop = (code: HistoryStop, detail: string): never => { throw new DojoHistoryStop(code, detail); };

const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"; // ADR-DOJO-PR-2 D-2 l.124; mere l.207 (apps/bell/src/pools.ts:69)
/** Creation (SIG0), ADR-DOJO-PR-2B section 1.2 l.74 (derived.json R2), D-8 (iv) l.368: 6 decimals, one mintTo of 10^15 base units. */
export const DOJO_HISTORY_CREATION = Object.freeze({ signature: "2rgTPbFoaXnx4w9J1SxqFLSZoFu7yBNcQBR3hkHqZkyR4EpnUo2TuWAYUuCgr3G6LMpB3Yw4fya3iCkSZqH86uoU",
  slot: 445903343, blockTime: 1789049406, decimals: 6, supply: "1000000000000000" });
/** Closed list of D-8 (vi) l.370: the types seen in the probe bodies (R-c, R-d) and those named by H-3 or the mere ADR; then the five of HISTORY-INS
 *  (2026-10-01): initializeAccount and approve, seen near the mint in phase B of the provisional run, and their neighbours initializeAccount2,
 *  approveChecked and revoke; LAST, the three of HISTORY-INS-2: withdrawExcessLamports, seen near it in phase C, amountToUiAmount, uiAmountToAmount.
 *  None enters the supply (SUPPLY_TYPES) or gives a balance (pre/postTokenBalances only); the owner fallback of chainAccounts reads initializeAccount* only. */
export const DOJO_HISTORY_INSTRUCTIONS = Object.freeze(["initializeMetadataPointer", "initializeMint2", "getAccountDataSize",
  "initializeImmutableOwner", "initializeAccount3", "initializeTokenMetadata", "updateTokenMetadataAuthority", "mintTo", "setAuthority",
  "transferChecked", "transfer", "closeAccount", "burn", "burnChecked", "mintToChecked",
  "initializeAccount", "initializeAccount2", "approve", "approveChecked", "revoke", "withdrawExcessLamports", "amountToUiAmount", "uiAmountToAmount"] as const);
const SUPPLY_TYPES: readonly unknown[] = ["mintTo", "mintToChecked", "burn", "burnChecked"]; // D-5 l.319-320
const DAY = 86400; // D-3 l.229: day(t) = floor(blockTime(t) / 86 400)
const UNPARSED = "unparsed"; // an unparsed Token-2022 instruction on the mint: its type is unknown, (vi) refuses it (D-8 l.370)

type Json = Readonly<Record<string, unknown>>;
const obj = (x: unknown): Json | null => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Json) : null);
const list = (x: unknown): readonly unknown[] | null => (Array.isArray(x) ? (x as unknown[]) : null);
const dec = (x: unknown): x is string => typeof x === "string" && /^(0|[1-9][0-9]*)$/.test(x);
const nat = (x: unknown): x is number => typeof x === "number" && Number.isSafeInteger(x) && x >= 0;
const isSig = (x: unknown): x is string => typeof x === "string" && /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(x);
const byStr = (x: string, y: string): number => (x < y ? -1 : x > y ? 1 : 0);
const sha256 = (s: string): string => createHash("sha256").update(s).digest("hex");
/** UTC day AAAA-MM-JJ of a block time (D-3 l.229); the only source of a day is blockTime (M-Y6). */
export const dayOf = (blockTime: number): string => new Date(Math.floor(blockTime / DAY) * DAY * 1000).toISOString().slice(0, 10);

// ---- index (D-4 l.296-309) ----------------------------------------------------------------------------------------------------

export interface IndexEntry { readonly signature: string; readonly slot: number; readonly blockTime: number | null; readonly failed: boolean; readonly finalized: boolean }
/** One operator's index: the concatenated getSignaturesForAddress pages, newest first. transactionIndex is not read (D-4 l.307). */
export function readIndex(pages: unknown): IndexEntry[] {
  const seen = new Set<string>();
  return (list(pages) ?? stop("read_malformed", "index")).map((x) => {
    const e = obj(x), bt = e?.blockTime;
    if (e === null || !isSig(e.signature) || !nat(e.slot) || !(bt === null || nat(bt)) || !("err" in e)) return stop("read_malformed", "index entry");
    if (seen.has(e.signature)) stop("index_inconsistent", `listed twice: ${e.signature}`);
    seen.add(e.signature);
    return { signature: e.signature, slot: e.slot, blockTime: bt, failed: e.err !== null, finalized: e.confirmationStatus === "finalized" };
  });
}
/** fusion(I_a, I_b, S_CUT) of D-4: `read` = R (concordant successes, then contested), sorted by (slot, signature), is what the
 *  collector reads at both operators; `failed` = F (concordant failures, never read, mere D-18); `contested` counts X. */
export interface Merged { readonly read: readonly string[]; readonly failed: readonly string[]; readonly contested: readonly string[] }
export function mergeIndexes(a: unknown, b: unknown, sCut: number): Merged {
  const [ia, ib] = [a, b].map((p) => new Map(readIndex(p).map((e) => [e.signature, e] as const)));
  if (ia === undefined || ib === undefined || !nat(sCut)) return stop("read_malformed", "merge input");
  const rows: { s: string; slot: number; kind: "read" | "failed" | "contested" }[] = [];
  for (const s of new Set([...ia.keys(), ...ib.keys()])) {
    const x = ia.get(s), y = ib.get(s), slot = Math.min(x?.slot ?? Infinity, y?.slot ?? Infinity);
    if (slot > sCut) continue;
    const same = x !== undefined && y !== undefined && x.slot === y.slot && x.blockTime === y.blockTime && x.failed === y.failed && x.finalized && y.finalized; // D-4 l.302-304
    rows.push({ s, slot, kind: !same ? "contested" : x.failed ? "failed" : "read" });
  }
  rows.sort((p, q) => p.slot - q.slot || byStr(p.s, q.s));
  const of = (...k: string[]): string[] => rows.filter((r) => k.includes(r.kind)).map((r) => r.s);
  return { read: of("read", "contested"), failed: of("failed"), contested: of("contested") };
}

// ---- bodies and the reading key (D-5 l.310-329) ---------------------------------------------------------------------------------

export interface MintEntry { readonly account: string; readonly side: "pre" | "post"; readonly owner: string | null; readonly amount: string; readonly program: string | null }
export interface Ins { readonly type: string; readonly info: Json }
export interface Supply { readonly type: string; readonly amount: string }
/** The fields of one getTransaction (or full-page) body that the history reads. `ins` = the Token-2022 instructions, outer and
 *  inner, in position order, that name the mint or one of its accounts of this body; `supply` = their mint/burn moves on the mint. */
export interface Body {
  readonly signature: string; readonly slot: number; readonly blockTime: number | null; readonly rank: number | null; readonly err: unknown;
  readonly mint: readonly MintEntry[]; readonly ins: readonly Ins[]; readonly supply: readonly Supply[];
}
export function readBody(raw: unknown, mint: string): Body {
  const r = obj(raw), meta = obj(r?.meta), tx = obj(r?.transaction), msg = obj(tx?.message), signature = list(tx?.signatures)?.[0];
  const ak = list(msg?.accountKeys), outer = list(msg?.instructions), groups = list(meta?.innerInstructions ?? []);
  if (r === null || meta === null || !isSig(signature) || !nat(r.slot) || !("err" in meta) || ak === null || outer === null || groups === null) return stop("read_malformed", "body");
  const orphan = (g: unknown): boolean => { const i = obj(g)?.index; return !nat(i) || i >= outer.length || list(obj(g)?.instructions) === null; };
  if (groups.some(orphan)) stop("read_malformed", "inner instructions"); // no inner instruction is ever skipped silently
  // D-5 l.325: jsonParsed lists the lookup-table keys (source "lookupTable"); otherwise static keys then meta.loadedAddresses (probe-3.mjs:179-189)
  const keys = ak.map((k) => (typeof k === "string" ? k : obj(k)?.pubkey));
  const loaded = obj(meta.loadedAddresses);
  const full = ak.some((k) => obj(k)?.source === "lookupTable") || loaded === null ? keys : [...keys, ...(list(loaded.writable) ?? []), ...(list(loaded.readonly) ?? [])];
  const entries: MintEntry[] = [];
  for (const side of ["pre", "post"] as const) {
    for (const x of list(meta[`${side}TokenBalances`]) ?? stop("read_malformed", `${side}TokenBalances`)) {
      const e = obj(x);
      if (e === null || e.mint !== mint) continue; // other mints are ignored (R-c)
      const account = nat(e.accountIndex) ? full[e.accountIndex] : undefined, amount = obj(e.uiTokenAmount)?.amount;
      if (typeof account !== "string" || !dec(amount)) return stop("read_malformed", "token balance");
      entries.push({ account, side, owner: typeof e.owner === "string" ? e.owner : null, amount, program: typeof e.programId === "string" ? e.programId : null });
    }
  }
  entries.sort((p, q) => byStr(p.side, q.side) || byStr(p.account, q.account));
  const near = new Set<unknown>([mint, ...entries.map((e) => e.account)]);
  const ins: Ins[] = [];
  const visit = (x: unknown): void => {
    const o = obj(x), p = obj(o?.parsed), info = obj(p?.info);
    if (o?.programId !== TOKEN_2022) return;
    if (p !== null && typeof p.type === "string" && info !== null) { if (Object.values(info).some((v) => near.has(v))) ins.push({ type: p.type, info }); }
    else if ((list(o.accounts) ?? [mint]).some((v) => near.has(v))) ins.push({ type: UNPARSED, info: {} }); // accounts unknown => on the mint
  };
  outer.forEach((x, i) => { visit(x); for (const g of groups) if (obj(g)?.index === i) for (const y of list(obj(g)?.instructions) ?? []) visit(y); });
  const supply = ins.filter((i) => SUPPLY_TYPES.includes(i.type) && i.info.mint === mint).map((i) => {
    const amount = i.type.endsWith("Checked") ? obj(i.info.tokenAmount)?.amount : i.info.amount; // FAITS-pr1a-lectures L-10 (parse_token.rs)
    return dec(amount) ? { type: i.type, amount } : stop("read_malformed", `${i.type} amount`);
  });
  const bt = r.blockTime, rank = r.transactionIndex;
  return { signature, slot: r.slot, blockTime: nat(bt) ? bt : null, rank: nat(rank) ? rank : null, err: meta.err, mint: entries, ins, supply };
}
/** sha256(canonical(key)) of D-5 l.313-322; the rank enters only when both bodies carry it (D-5 l.315, l.327). */
export function readKey(b: Body, withRank: boolean): string {
  const types = [...new Set(b.ins.map((i) => i.type))].sort(byStr);
  const key = { signature: b.signature, slot: b.slot, blockTime: b.blockTime, err: b.err, mint: b.mint, supply: b.supply, types };
  return sha256(canonical(withRank ? { ...key, rank: b.rank } : key));
}

// ---- admission (D-5 l.326, D-6 l.331-338) ----------------------------------------------------------------------------------------

/** A read that failed (transport, delay, JSON-RPC error): distinct from a `null` result (D-6 l.336-338). */
export const FAULT = Symbol("fault");
export interface Touch { readonly account: string; readonly owner: string | null }
export interface NoQuorum { readonly kind: "no_quorum"; readonly signature: string; readonly slots: readonly number[]; readonly blockTimes: readonly number[]; readonly touched: readonly Touch[] }
export type Admission = { readonly kind: "admitted"; readonly tx: Body } | { readonly kind: "failed"; readonly moves: boolean } | NoQuorum;
const amountOf = (b: Body, account: string, side: "pre" | "post"): bigint => BigInt(b.mint.find((e) => e.account === account && e.side === side)?.amount ?? "0");

/** The two getTransaction results of one signature of R, each a raw body, `null` or FAULT. A body that does not decode, or names
 *  another signature, counts as a fault. Same key and err null: admitted; same key and err: concordant failure (excluded; `moves`
 *  feeds the (vii) count of Q-6); otherwise without quorum, its accounts and owners marked (D-6), or a stop. */
export function admit(signature: string, a: unknown, b: unknown, mint: string): Admission {
  const read = (x: unknown): Body | null | typeof FAULT => {
    if (x === null || x === FAULT) return x;
    try { const d = readBody(x, mint); return d.signature === signature ? d : FAULT; } catch (e) { if (e instanceof DojoHistoryStop) return FAULT; throw e; }
  };
  const got = [read(a), read(b)];
  if (got[0] === null && got[1] === null) stop("index_inconsistent", `two null bodies for a listed signature: ${signature}`); // D-6 l.338
  const bodies = got.filter((v): v is Body => v !== null && v !== FAULT);
  const [p, q] = bodies;
  if (p === undefined) return stop("no_quorum_unbounded", `no body, accounts unknown: ${signature}`); // D-6 l.337
  if (q !== undefined) {
    const withRank = p.rank !== null && q.rank !== null;
    if (readKey(p, withRank) === readKey(q, withRank)) {
      if (p.err !== null) return { kind: "failed", moves: p.mint.some((e) => amountOf(p, e.account, "pre") !== amountOf(p, e.account, "post")) };
      return { kind: "admitted", tx: withRank ? p : { ...p, rank: null } };
    }
  }
  if (bodies.some((v) => v.supply.length > 0)) stop("supply_mismatch", `supply instruction without quorum: ${signature}`); // D-6 l.335-336
  const touched = new Map<string, Touch>();
  for (const e of bodies.flatMap((v) => v.mint)) touched.set(`${e.account} ${e.owner ?? ""}`, { account: e.account, owner: e.owner });
  return { kind: "no_quorum", signature, slots: bodies.map((v) => v.slot), blockTimes: bodies.flatMap((v) => (v.blockTime === null ? [] : [v.blockTime])),
    touched: [...touched].sort(([x], [y]) => byStr(x, y)).map(([, t]) => t) };
}

// ---- checks (D-8 l.365-371) --------------------------------------------------------------------------------------------------------

/** (i), transaction part: sum over the mint accounts of (post - pre) = mints - burns of the transaction; a mint after SIG0 is an
 *  inconsistency, the mint authority being removed at creation (R-d). */
export function checkSupply(tx: Body): void {
  const accounts = new Set(tx.mint.map((e) => e.account));
  const delta = [...accounts].reduce((s, a) => s + amountOf(tx, a, "post") - amountOf(tx, a, "pre"), 0n);
  const moved = tx.supply.reduce((s, m) => s + (m.type.startsWith("mintTo") ? BigInt(m.amount) : -BigInt(m.amount)), 0n);
  if (delta !== moved) stop("supply_mismatch", `${tx.signature}: balances move ${delta}, instructions ${moved}`);
  if (tx.signature !== DOJO_HISTORY_CREATION.signature && tx.supply.some((m) => m.type.startsWith("mintTo"))) stop("supply_mismatch", `mint after creation: ${tx.signature}`);
}
/** (iv): SIG0 (slot, blockTime) is the oldest entry of both mint indexes; its admitted body carries initializeMint2 of the mint with 6
 *  decimals and exactly one mintTo of 10^15 (D-3 l.239 phase A, D-8 l.368). */
export function checkCreation(indexA: unknown, indexB: unknown, sig0: Body | null, mint: string): void {
  const c = DOJO_HISTORY_CREATION;
  for (const idx of [indexA, indexB]) {
    const e = readIndex(idx).at(-1);
    if (e?.signature !== c.signature || e.slot !== c.slot || e.blockTime !== c.blockTime) stop("creation_mismatch", "oldest index entry");
  }
  if (sig0?.signature !== c.signature || sig0.slot !== c.slot || sig0.err !== null) return stop("creation_mismatch", "creation body");
  if (!sig0.ins.some((i) => i.type === "initializeMint2" && i.info.mint === mint && i.info.decimals === c.decimals)) stop("creation_mismatch", "initializeMint2");
  if (sig0.supply.length !== 1 || sig0.supply[0]?.type !== "mintTo" || sig0.supply[0].amount !== c.supply) stop("creation_mismatch", "creation mint");
}
/** (v): blockTime present, one blockTime per slot, day non-decreasing in slot order (index entries and bodies alike). */
export function checkDays(items: readonly { readonly slot: number; readonly blockTime: number | null }[]): void {
  let prev: { slot: number; blockTime: number } | null = null;
  for (const it of [...items].sort((x, y) => x.slot - y.slot)) {
    const t = it.blockTime;
    if (t === null || !nat(t)) return stop("day_not_monotone", `slot ${it.slot}: no blockTime`);
    if (prev !== null && prev.slot === it.slot && prev.blockTime !== t) stop("day_not_monotone", `slot ${it.slot}: two blockTimes`);
    if (prev !== null && Math.floor(t / DAY) < Math.floor(prev.blockTime / DAY)) stop("day_not_monotone", `slot ${it.slot}: day decreases`);
    prev = { slot: it.slot, blockTime: t };
  }
}
/** (vi): every Token-2022 type on the mint or its accounts is in the closed list; an unparsed one never is. */
export function checkInstructions(tx: Body): void {
  for (const i of tx.ins) if (!(DOJO_HISTORY_INSTRUCTIONS as readonly string[]).includes(i.type)) stop("instruction_not_allowed", `${tx.signature}: ${i.type}`);
}
/** (vii): bounds are an explicit input (declared by the orchestrator's dated line, journal question); X is bounded relative to |R|. */
export interface HistoryCounts { readonly read: number; readonly contested: number; readonly noQuorum: number; readonly unordered: number; readonly failedMoving: number }
export interface HistoryBounds { readonly contested: readonly [numerator: number, denominator: number]; readonly noQuorum: number; readonly unordered: number; readonly failedMoving: number }
export function checkBounds(c: HistoryCounts, b: HistoryBounds): void {
  const [n, d] = list(b.contested) ?? [];
  const K = ["noQuorum", "unordered", "failedMoving"] as const;
  if (!nat(n) || !nat(d) || d === 0 || !K.every((k) => nat(b[k])) || !["read", "contested", ...K].every((k) => nat(c[k as keyof HistoryCounts]))) return stop("read_malformed", "bounds");
  if (c.contested * d > n * c.read) stop("bound_exceeded", `contested ${c.contested} of ${c.read}`);
  for (const k of K) if (c[k] > b[k]) stop("bound_exceeded", `${k} ${c[k]}`);
}

// ---- chaining (D-8 (iii) l.367; D-3 l.270-275) ----------------------------------------------------------------------------------

export interface AccountState { readonly amount: string; readonly owner: string | null }
const vertex = (s: AccountState): string => (s.amount === "0" ? "0" : `${s.amount} ${s.owner ?? ""}`);
/** End of an Euler trail using every edge once from `start` (null: any start after a window without quorum), or null (no order
 *  chains, or the end is ambiguous). Directed multigraph: weakly connected, at most one +1 and one -1 vertex. */
function trailEnd(edges: readonly (readonly [string, string])[], start: string | null): string | null {
  const up = new Map<string, string>(), deg = new Map<string, number>();
  const root = (v: string): string => { const p = up.get(v) ?? v; return p === v ? v : root(p); };
  for (const [u, v] of edges) {
    for (const w of [u, v]) if (!up.has(w)) up.set(w, w);
    up.set(root(u), root(v));
    deg.set(u, (deg.get(u) ?? 0) + 1); deg.set(v, (deg.get(v) ?? 0) - 1);
  }
  if (new Set([...up.keys()].map(root)).size !== 1) return null;
  const odd = [...deg].filter(([, x]) => x !== 0), src = odd.find(([, x]) => x === 1), dst = odd.find(([, x]) => x === -1);
  if (odd.length === 0) return start !== null && up.has(start) ? start : null;
  if (odd.length !== 2 || src === undefined || dst === undefined) return null;
  return start === null || src[0] === start ? dst[0] : null;
}
/** (iii): for each account, pre(t) = post of the previous admitted transaction (0 before the first), owner included, in (slot, rank)
 *  order; a slot where some admitted transaction has no rank is unordered and needs one order that chains (Euler trail). A window
 *  without quorum on the account (a NoQuorum of a slot between the two, bounds included) frees the next pre (D-6). A missing owner
 *  comes from an initializeAccount* of the transaction, then from the last admitted owner, else stops (D-5 l.329). Two admitted
 *  transactions of one ordered slot with the same rank stop (read_malformed): their order would depend on the input. */
export function chainAccounts(txs: readonly Body[], noQuorum: readonly NoQuorum[]): Map<string, AccountState> {
  const unordered = new Set(txs.filter((t) => t.rank === null).map((t) => t.slot));
  const ranked = txs.filter((t) => !unordered.has(t.slot)).map((t) => `${t.slot}:${t.rank ?? ""}`);
  if (new Set(ranked).size !== ranked.length) stop("read_malformed", "equal ranks in an ordered slot"); // D-3 determinism: no input order decides
  const holes = new Map<string, number[]>();
  for (const n of noQuorum) for (const t of n.touched) holes.set(t.account, [...(holes.get(t.account) ?? []), ...n.slots]);
  const accounts = [...new Set(txs.flatMap((t) => t.mint.map((e) => e.account)))].sort(byStr);
  const out = new Map<string, AccountState>();
  for (const acc of accounts) {
    let st: AccountState = { amount: "0", owner: null }, last = -1;
    const side = (t: Body, s: "pre" | "post", prev: AccountState): AccountState => {
      const e = t.mint.find((x) => x.account === acc && x.side === s);
      if (e === undefined || e.amount === "0") return { amount: "0", owner: e?.owner ?? null };
      const init = t.ins.find((i) => i.type.startsWith("initializeAccount") && i.info.account === acc)?.info.owner;
      const owner = e.owner ?? (s === "post" && typeof init === "string" ? init : prev.owner);
      return owner === null ? stop("owner_unknown", `${acc} in ${t.signature}`) : { amount: e.amount, owner };
    };
    const mine = txs.filter((t) => t.mint.some((e) => e.account === acc));
    for (const slot of [...new Set(mine.map((t) => t.slot))].sort((x, y) => x - y)) {
      const group = mine.filter((t) => t.slot === slot).sort((x, y) => (x.rank ?? 0) - (y.rank ?? 0));
      let free = (holes.get(acc) ?? []).some((h) => h >= last && h <= slot);
      if (!unordered.has(slot)) {
        for (const t of group) {
          const pre = side(t, "pre", st);
          if (!free && vertex(pre) !== vertex(st)) stop("chain_break", `${acc} at ${t.signature}`);
          st = side(t, "post", pre); free = false;
        }
      } else {
        const states = new Map<string, AccountState>([[vertex(st), st]]);
        const edges = group.map((t) => { const pre = side(t, "pre", st), post = side(t, "post", pre); states.set(vertex(pre), pre); states.set(vertex(post), post); return [vertex(pre), vertex(post)] as const; });
        const end = trailEnd(edges, free ? null : vertex(st));
        st = (end === null ? undefined : states.get(end)) ?? stop("chain_break", `${acc}: no order chains slot ${slot}`);
      }
      last = slot;
    }
    out.set(acc, st);
  }
  return out;
}
