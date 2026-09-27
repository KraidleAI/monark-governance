// MONARK Dojo -- PR-2b-3 simulated chain (ADR-DOJO-PR-2B section 4, "Chaine simulee"; section 3 step 1): globalThis.fetch is replaced
// before any course, so the REAL openGuardedClient (write-ahead ledger, locks, caps) runs over a temporary ledger; the guard resolves
// both operators from the env to `.invalid` hosts and this stub answers them without any socket or name resolution (traps armed at
// import). A fixed-seed congruential generator draws a history of the mint after SIG0 in the reduced form of fixtures/history/ (the
// SIG0 body and index entry are the fixtures, verbatim); the transfers, failures, slots, ranks and amounts are SYNTHETIC. The two
// operators are "a" and "b" (D-3 OPS), never named here. Served: getSignaturesForAddress (limit, before, newest first),
// getTransaction and, at a only, getTransactionsForAddress (full, asc, limit, paginationToken "slot:rank"). Injected defects: a
// signature dropped from one index or from the pages, a body that differs at b, any response replaced by `sim.override`. PR-2b-4
// extends it (per-account pages, closings, the truth balances as an oracle).
import { createHash } from "node:crypto";
import dns from "node:dns";
import net from "node:net";
import { readFileSync } from "node:fs";

net.Socket.prototype.connect = function trap(): never { throw new Error("history-chain: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("history-chain: a name was resolved"); }) as never;

type Json = Record<string, unknown>;
const dir = new URL("../fixtures/history/", import.meta.url);
const hexFx = (name: string): Json => JSON.parse(Buffer.from(JSON.parse(readFileSync(new URL(name, dir), "utf8")) as string, "hex").toString("utf8")) as Json;
export const MINT = (JSON.parse(readFileSync(new URL("sources.json", dir), "utf8")) as { mint: string }).mint;
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const SIG0_BODY = hexFx("sig0.a.json"), SIG0_ENTRY = (hexFx("mint-tail.a.json") as unknown as Json[]).at(-1) as Json;
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const b58 = (b: Buffer): string => { let n = BigInt(`0x${b.toString("hex")}`), s = ""; for (; n > 0n; n /= 58n) s = `${B58[Number(n % 58n)] ?? ""}${s}`; return s; };
export const key = (label: string): string => b58(createHash("sha256").update(label).digest());
export const HOSTS = { a: "a.history.invalid", b: "b.history.invalid" } as const;

export interface Tx { readonly sig: string; readonly slot: number; readonly rank: number; readonly failed: boolean; body: Json; readonly entry: Json }
export interface Req { op: "a" | "b"; method: string; params: unknown[] }
export interface Sim { txs: Tx[]; reqs: Req[]; nowMs: number; tick: number; drop: { a: Set<string>; b: Set<string> }; pageDrop: Set<string>; diverge: Set<string>;
  override: ((r: Req) => unknown) | null }

/** A world: SIG0 (fixtures), then n SYNTHETIC transactions; every `every`-th succeeds (a transfer of the mint), the others fail (pre = post). */
export function world(n: number, every = 10, seed = 7): Tx[] {
  let x = seed, slot = SIG0_ENTRY.slot as number, bt = SIG0_ENTRY.blockTime as number, rank = SIG0_ENTRY.transactionIndex as number;
  const rnd = (): number => (x = (x * 1103515245 + 12345) % 2 ** 31) / 2 ** 31;
  const first = ((SIG0_BODY.meta as Json).postTokenBalances as Json[])[0] as Json, keys0 = (SIG0_BODY.transaction as { message: { accountKeys: Json[] } }).message.accountKeys;
  const bal = new Map<string, [owner: string, amount: bigint]>([[keys0[first.accountIndex as number]?.pubkey as string, [first.owner as string, BigInt((first.uiTokenAmount as Json).amount as string)]]]);
  const out: Tx[] = [{ sig: SIG0_ENTRY.signature as string, slot, rank, failed: false, body: SIG0_BODY, entry: SIG0_ENTRY }];
  for (let i = 1; i <= n; i++) {
    if (rnd() < 0.2) rank += 1; else { slot += 1 + Math.floor(rnd() * 3); bt += 1 + Math.floor(rnd() * 90); rank = Math.floor(rnd() * 400); }
    const sig = `Hs${b58(createHash("sha256").update(`sig/${String(i)}`).digest()).padStart(86, "1")}`, failed = i % every !== 0;
    const funded = [...bal].filter(([, [, v]]) => v > 0n), from = funded[Math.floor(rnd() * funded.length)] as [string, [string, bigint]];
    const pick = [...bal.keys()][Math.floor(rnd() * bal.size)] as string, to = rnd() < 0.5 || pick === from[0] ? key(`acct/${String(i)}`) : pick;
    const owner = bal.get(to)?.[0] ?? key(`owner/${String(i)}`), amt = failed ? 0n : 1n + (BigInt(Math.floor(rnd() * 1e6)) % from[1][1]);
    const pre = [[from[0], from[1][0], from[1][1]], [to, owner, bal.get(to)?.[1] ?? null]] as const;
    if (!failed) { bal.set(from[0], [from[1][0], from[1][1] - amt]); bal.set(to, [owner, (bal.get(to)?.[1] ?? 0n) + amt]); }
    const accounts = [from[0], to], side = (post: boolean): Json[] => accounts.flatMap((a, j) => {
      const v = post ? bal.get(a)?.[1] : pre[j]?.[2]; return v === null || v === undefined ? [] : [{ accountIndex: j, mint: MINT, owner: post ? bal.get(a)?.[0] : pre[j]?.[1], programId: T22, uiTokenAmount: { amount: String(v) } }];
    });
    const err = failed ? { InstructionError: [0, { Custom: 1 }] } : null;
    const body = { slot, blockTime: bt, transactionIndex: rank, version: 0, meta: { err, preTokenBalances: side(false), postTokenBalances: failed ? side(false) : side(true), innerInstructions: [] },
      transaction: { signatures: [sig], message: { accountKeys: accounts.map((pubkey) => ({ pubkey, source: "transaction" })),
        instructions: [{ programId: T22, parsed: { type: "transferChecked", info: { mint: MINT, source: from[0], destination: to, authority: from[1][0], tokenAmount: { amount: String(amt) } } } }] } } };
    out.push({ sig, slot, rank, failed, body, entry: { blockTime: bt, confirmationStatus: "finalized", err, memo: null, signature: sig, slot, transactionIndex: rank } });
  }
  return out;
}

export const sim: Sim = { txs: [], reqs: [], nowMs: 0, tick: 0, drop: { a: new Set(), b: new Set() }, pageDrop: new Set(), diverge: new Set(), override: null };
const pos = (t: Tx): number => t.slot * 1e4 + t.rank;
function serve(r: Req): unknown {
  const [arg, o = {}] = r.params as [string, Json | undefined];
  if (r.method === "getSignaturesForAddress") {
    const list = arg === MINT ? sim.txs.filter((t) => !sim.drop[r.op].has(t.sig)).sort((p, q) => pos(q) - pos(p)) : [];
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
    const all = sim.txs.filter((t) => !sim.pageDrop.has(t.sig) && pos(t) > (s ?? 0) * 1e4 + (k ?? 0)).sort((p, q) => pos(p) - pos(q));
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
