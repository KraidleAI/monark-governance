// MONARK Dojo -- PR-2b-3 simulated chain (ADR-DOJO-PR-2B section 4, "Chaine simulee"; section 3 step 1): globalThis.fetch is replaced
// before any course, so the REAL openGuardedClient (write-ahead ledger, locks, caps) runs over a temporary ledger; the guard resolves
// both operators from the env to `.invalid` hosts and this stub answers them without any socket or name resolution (traps armed at
// import). A fixed-seed congruential generator draws a history of the mint after SIG0 in the reduced form of fixtures/history/ (the
// SIG0 body and index entry are the fixtures, verbatim); the transfers, failures, slots, ranks and amounts are SYNTHETIC. The two
// operators are "a" and "b" (D-3 OPS), never named here. Served: getSignaturesForAddress (limit, before, newest first),
// getTransaction and, at a only, getTransactionsForAddress (full, asc, limit, paginationToken "slot:rank"). Injected defects: a
// signature dropped from one index or from the pages, a body that differs at b, any response replaced by `sim.override`. PR-2b-4
// extends it: the index of each token account (the transactions that name it, failures included); opt-in events (a transfer without the
// mint, seen only in the two accounts' indexes, to a new account; an account closed by closeAccount; days of blockTime), the default world
// unchanged to the byte; the truth balances after each transaction (the tests' oracle); the first day read, written by PR-2's writer
// (readingRecord, writeDayBundle, closeLayout: never built by hand, C-29). None of these imports reaches the guard.
import { createHash } from "node:crypto";
import dns from "node:dns";
import net from "node:net";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { canonical } from "../../../bell/scripts/bell-chain.mjs";
import { readingRecord, recordBytes, writeDayBundle } from "../../src/bundle.ts";
import { closeLayout } from "../../src/layout.ts";
import { READ_RULE, betaOf, dateOf, instantsOf, roundOf } from "./dojo-fixture.ts";

net.Socket.prototype.connect = function trap(): never { throw new Error("history-chain: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("history-chain: a name was resolved"); }) as never;

type Json = Record<string, unknown>;
const dir = new URL("../fixtures/history/", import.meta.url);
const hexFx = (name: string): Json => JSON.parse(Buffer.from(JSON.parse(readFileSync(new URL(name, dir), "utf8")) as string, "hex").toString("utf8")) as Json;
export const MINT = (JSON.parse(readFileSync(new URL("sources.json", dir), "utf8")) as { mint: string }).mint;
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const SIG0_BODY = hexFx("sig0.a.json"), SIG0_ENTRY = (hexFx("mint-tail.a.json") as unknown as Json[]).at(-1) as Json;
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const b58 = (b: Buffer): string => { // standard base58: one "1" per leading zero byte (PR-2b-4: else 1 key in 256 decodes to 31 bytes)
  let n = BigInt(`0x${b.toString("hex")}`), s = ""; for (; n > 0n; n /= 58n) s = `${B58[Number(n % 58n)] ?? ""}${s}`;
  return "1".repeat(Math.max(0, b.findIndex((x) => x !== 0))) + s;
};
export const key = (label: string): string => b58(createHash("sha256").update(label).digest());
export const HOSTS = { a: "a.history.invalid", b: "b.history.invalid" } as const;

export interface Tx { readonly sig: string; readonly slot: number; readonly rank: number; readonly failed: boolean; body: Json; readonly entry: Json;
  readonly mintless?: boolean; readonly truth: ReadonlyMap<string, readonly [owner: string, amount: bigint]> }
export interface Req { op: "a" | "b"; method: string; params: unknown[] }
export interface Sim { txs: Tx[]; reqs: Req[]; nowMs: number; tick: number; drop: { a: Set<string>; b: Set<string> }; pageDrop: Set<string>; diverge: Set<string>;
  override: ((r: Req) => unknown) | null }

/** A world: SIG0 (fixtures), then n SYNTHETIC transactions; every `every`-th succeeds (a transfer of the mint), the others fail (pre = post).
 *  Opt-in (PR-2b-4): `gap`, the widest step of blockTime in seconds (90 by default); at a successful index of `mintless`, a transfer without
 *  the mint to a new account; of `close`, the whole balance moved and the source account closed. The default draw is unchanged. */
export function world(n: number, every = 10, seed = 7, o: { gap?: number; mintless?: readonly number[]; close?: readonly number[] } = {}): Tx[] {
  let x = seed, slot = SIG0_ENTRY.slot as number, bt = SIG0_ENTRY.blockTime as number, rank = SIG0_ENTRY.transactionIndex as number;
  const rnd = (): number => (x = (x * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const first = ((SIG0_BODY.meta as Json).postTokenBalances as Json[])[0] as Json, keys0 = (SIG0_BODY.transaction as { message: { accountKeys: Json[] } }).message.accountKeys;
  const bal = new Map<string, [owner: string, amount: bigint]>([[keys0[first.accountIndex as number]?.pubkey as string, [first.owner as string, BigInt((first.uiTokenAmount as Json).amount as string)]]]);
  const out: Tx[] = [{ sig: SIG0_ENTRY.signature as string, slot, rank, failed: false, body: SIG0_BODY, entry: SIG0_ENTRY, truth: new Map(bal) }];
  for (let i = 1; i <= n; i++) {
    if (rnd() < 0.2) rank += 1; else { slot += 1 + Math.floor(rnd() * 3); bt += 1 + Math.floor(rnd() * (o.gap ?? 90)); rank = Math.floor(rnd() * 400); }
    const sig = `Hs${b58(createHash("sha256").update(`sig/${String(i)}`).digest()).padStart(86, "1")}`, failed = i % every !== 0;
    const funded = [...bal].filter(([, [, v]]) => v > 0n), from = funded[Math.floor(rnd() * funded.length)] as [string, [string, bigint]];
    const pick = [...bal.keys()][Math.floor(rnd() * bal.size)] as string, drawn = rnd() < 0.5 || pick === from[0] ? key(`acct/${String(i)}`) : pick;
    const hidden = !failed && o.mintless?.includes(i) === true, shut = !failed && o.close?.includes(i) === true;
    const to = hidden ? key(`hidden/${String(i)}`) : drawn;
    const owner = bal.get(to)?.[0] ?? key(`owner/${String(i)}`), amt = failed ? 0n : shut ? from[1][1] : 1n + (BigInt(Math.floor(rnd() * 1e6)) % from[1][1]);
    const pre = [[from[0], from[1][0], from[1][1]], [to, owner, bal.get(to)?.[1] ?? null]] as const;
    if (!failed) { bal.set(from[0], [from[1][0], from[1][1] - amt]); bal.set(to, [owner, (bal.get(to)?.[1] ?? 0n) + amt]); }
    if (shut) bal.delete(from[0]); // closed by closeAccount: absent from the post balances (mere C-1: 0)
    const move = hidden ? { type: "transfer", info: { source: from[0], destination: to, authority: from[1][0], amount: String(amt) } } // no mint
      : { type: "transferChecked", info: { mint: MINT, source: from[0], destination: to, authority: from[1][0], tokenAmount: { amount: String(amt) } } };
    const ins = [move, ...(shut ? [{ type: "closeAccount", info: { account: from[0], destination: from[1][0], owner: from[1][0] } }] : [])];
    const accounts = [from[0], to], side = (post: boolean): Json[] => accounts.flatMap((a, j) => {
      const v = post ? bal.get(a)?.[1] : pre[j]?.[2]; return v === null || v === undefined ? [] : [{ accountIndex: j, mint: MINT, owner: post ? bal.get(a)?.[0] : pre[j]?.[1], programId: T22, uiTokenAmount: { amount: String(v) } }];
    });
    const err = failed ? { InstructionError: [0, { Custom: 1 }] } : null;
    const body = { slot, blockTime: bt, transactionIndex: rank, version: 0, meta: { err, preTokenBalances: side(false), postTokenBalances: failed ? side(false) : side(true), innerInstructions: [] },
      transaction: { signatures: [sig], message: { accountKeys: accounts.map((pubkey) => ({ pubkey, source: "transaction" })),
        instructions: ins.map((parsed) => ({ programId: T22, parsed })) } } };
    const entry = { blockTime: bt, confirmationStatus: "finalized", err, memo: null, signature: sig, slot, transactionIndex: rank };
    out.push({ sig, slot, rank, failed, body, entry, ...(hidden ? { mintless: true } : {}), truth: new Map(bal) });
  }
  return out;
}

export const sim: Sim = { txs: [], reqs: [], nowMs: 0, tick: 0, drop: { a: new Set(), b: new Set() }, pageDrop: new Set(), diverge: new Set(), override: null };
const pos = (t: Tx): number => t.slot * 1e4 + t.rank;
const keysOf = (t: Tx): string[] => (t.body.transaction as { message: { accountKeys: { pubkey: string }[] } }).message.accountKeys.map((k) => k.pubkey);
function serve(r: Req): unknown {
  const [arg, o = {}] = r.params as [string, Json | undefined];
  if (r.method === "getSignaturesForAddress") { // the mint's index never lists a transfer without the mint; an account's lists what names it
    const list = sim.txs.filter((t) => !sim.drop[r.op].has(t.sig) && (arg === MINT ? t.mintless !== true : keysOf(t).includes(arg)))
      .sort((p, q) => pos(q) - pos(p));
    const from = o.before === undefined ? 0 : list.findIndex((t) => t.sig === o.before) + 1;
    return list.slice(from, from + (o.limit as number)).map((t) => structuredClone(t.entry));
  }
  if (r.method === "getTransaction") {
    const t = sim.txs.find((y) => y.sig === arg), b = t === undefined ? null : structuredClone(t.body);
    if (b !== null && r.op === "b" && sim.diverge.has(arg)) (((b.meta as Json).postTokenBalances as Json[])[0]?.uiTokenAmount as Json).amount = "1";
    return b;
  }
  if (r.method === "getTransactionsForAddress" && r.op === "a") {
    const [s, k] = typeof o.paginationToken === "string" ? o.paginationToken.split(":").map(Number) : [-1, -1];
    const all = sim.txs.filter((t) => !sim.pageDrop.has(t.sig) && t.mintless !== true && pos(t) > (s ?? 0) * 1e4 + (k ?? 0)).sort((p, q) => pos(p) - pos(q));
    const page = all.slice(0, o.limit as number), last = page.at(-1);
    return { data: page.map((t) => structuredClone(t.body)), paginationToken: page.length === o.limit && last !== undefined ? `${String(last.slot)}:${String(last.rank)}` : null };
  }
  return undefined;
}
globalThis.fetch = ((input: string | URL, init?: RequestInit): Promise<Response> => {
  const host = new URL(String(input)).hostname, op = host === HOSTS.a ? "a" : host === HOSTS.b ? "b" : null;
  if (op === null) throw new Error(`history-chain: unknown host ${host}`);
  const body = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] }, req: Req = { op, method: body.method, params: body.params };
  sim.reqs.push(req);
  sim.nowMs += sim.tick;
  const over = sim.override?.(req), result = over !== undefined ? over : serve(req);
  if (result instanceof Response) return Promise.resolve(result);
  const out = result === undefined ? { jsonrpc: "2.0", id: 1, error: { code: -32601, message: "method not found" } } : { jsonrpc: "2.0", id: 1, result };
  return Promise.resolve(new Response(JSON.stringify(out), { status: 200, headers: { "content-type": "application/json" } }));
}) as typeof globalThis.fetch;

/** The truth at slot s (PR-2b-4's oracle): [account, owner, amount] of each account with a positive balance after the last transaction of
 *  slot <= s; an enumeration lists these only (an absent account is 0, mere C-1). */
export const rowsAt = (s: number): [string, string, string][] =>
  [...(sim.txs.filter((t) => t.slot <= s).at(-1)?.truth ?? new Map<string, readonly [string, bigint]>())]
    .filter(([, [, v]]) => v > 0n).map(([a, [w, v]]): [string, string, string] => [a, w, String(v)]);
/** The first day read (B1R, TU-1h), day number `day` since 1970-01-01, closed in PR-2's layout under `dir` by PR-2's writer: four readings at
 *  the instants of the fixture's beacon (dojo-fixture.ts), the first with one enumeration at slot `slot` from both operators, three missed;
 *  an empty eve; the mint not read (the day abstains, mint_unchecked: a form PR-2 writes). Returns `dir`. */
export function firstReadDay(dir: string, day: number, slot: number, rows: readonly (readonly [string, string, string])[]): string {
  const seed = createHash("sha256").update(`history-chain first read ${String(day)}`).digest("hex"), beta = betaOf(day), at = instantsOf(day, seed, beta);
  const gpa = { context: { slot }, value: rows.map(([pubkey, owner, amount]) => ({ pubkey, account: { data: { program: "spl-token-2022",
    parsed: { type: "account", info: { mint: MINT, owner, state: "initialized", tokenAmount: { amount, decimals: 6 } } } } } })) };
  const none = { a: null, b: null }, eve = { addresses: [], accounts: [] };
  const anchor = { mint: MINT, pool: key("pool"), pool_quote_vault: key("vault"), sol_usd_max_age_s: 165 };
  const records = at.map((t, j) => readingRecord({ day: dateOf(day), i: j + 1, instant: t, read_at: j === 0 ? new Date((t + 5) * 1000).toISOString() : null,
    enumeration: j === 0 ? { a: gpa, b: gpa } : none, mint: null, pool: none, wsol: none, pyth: none, eve, anchor }));
  const { bytes } = writeDayBundle({ day: dateOf(day), seed, beacon: { round: roundOf(day), signature: beta }, read_rule: READ_RULE, k_reads: 4, mint: MINT,
    program: T22, decimals: 6, records, eve }, (day + 2) * 86400);
  mkdirSync(join(dir, "readings"), { recursive: true });
  writeFileSync(join(dir, "eve.json"), `${canonical(eve)}\n`);
  records.forEach((r, j) => { writeFileSync(join(dir, "readings", `${String(j + 1)}.json`), recordBytes(r)); });
  closeLayout(dir, [], 4, bytes);
  return dir;
}
