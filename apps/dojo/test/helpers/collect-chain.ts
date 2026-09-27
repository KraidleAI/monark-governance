// MONARK Dojo -- PR-2-2 simulated chain (ADR-DOJO-PR-2 section 3, step 1): globalThis.fetch is replaced before any course, so the
// REAL openGuardedClient (write-ahead ledger, locks, caps) runs over a temporary ledger; the guard resolves helius from the env to a
// `.invalid` host and the public host to its fixed host, and this stub answers both without any socket or name resolution (traps
// armed at import: a socket or a lookup throws). The two beacon relays are the injected RunDeps.relays (item DRAND-RELAY-GET-1). Responses are built from the verbatim fixtures of
// fixtures/collect/ (provenance.json); every change of the world (rows, amounts per operator, mint, beta) is SYNTHETIC and declared.
import { createHash } from "node:crypto";
import dns from "node:dns";
import net from "node:net";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { TransportError } from "@monark/rpc-guard";

net.Socket.prototype.connect = function trap(): never { throw new Error("collect-chain: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("collect-chain: a name was resolved"); }) as never;

type Json = Record<string, unknown>;
const fixture = (f: string): Json => JSON.parse(readFileSync(new URL(`../fixtures/collect/${f}`, import.meta.url), "utf8")) as Json;
const E = fixture("enumeration.json") as { a: { context: Json; value: Json[] }; b: { context: Json; value: Json[] } };
const A = fixture("accounts.json") as Record<"mint" | "pool" | "wsol" | "pyth", { a: { context: Json; value: Json }; b: { context: Json; value: Json } }>;
const infoOf = (e: Json): Json => ((e.account as Json).data as Json & { parsed: { info: Json } }).parsed.info;
export const HELIUS_HOST = "helius.dojo.invalid";
export const ENV = { BELL_SOLANA_RPC: `https://${HELIUS_HOST}`, HELIUS_CYCLE_ID: "cyc", HELIUS_CYCLE_FLOOR: "0" };
const OPS: Readonly<Record<string, string>> = { [HELIUS_HOST]: "helius", "api.mainnet.solana.com": "solana-foundation" };
export const MINT = infoOf(E.a.value[0] as Json).mint as string;
export const POOL = (((A.wsol.a.value.data as Json).parsed as Json).info as Json).owner as string;
export const QUOTE_VAULT = "6KLxyVpYwMGyQJHsvWqFpRk1crEQ79sG3Wi3C1SkZbTW"; // pool_quote_token_account (ADR section 1.3 l.56)
export const PYTH = "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE"; // ADR D-3 l.134
/** A row [account, owner, amount at a, amount at b]; null = absent at that operator. The default world is the fixture's six rows. */
export type Row = [account: string, owner: string, a: string | null, b: string | null];
export const ROWS: Row[] = E.a.value.map((e) => { const i = infoOf(e), amt = (i.tokenAmount as Json).amount as string; return [e.pubkey as string, i.owner as string, amt, amt]; });
export interface Req { op: string; method: string; params: unknown[] }
export interface Sim { reqs: Req[]; nowMs: number; rows: Row[]; mint: string; beta: string | null; override: ((r: Req) => Response | undefined) | null }
/** The clock at each chain request (C-G2-5). */
export const stampOf = new WeakMap<Req, number>();
export const sim: Sim = { reqs: [], nowMs: 0, rows: ROWS, mint: MINT, beta: null, override: null };

const json = (v: unknown, status = 200, headers: Record<string, string> = {}): Response => new Response(JSON.stringify(v), { status, headers: { "content-type": "application/json", ...headers } });
const rpc = (result: unknown): Response => json({ jsonrpc: "2.0", id: 1, result });
function enumeration(side: "a" | "b"): unknown {
  const value = sim.rows.flatMap(([account, owner, ...amts]) => {
    const amount = amts[side === "a" ? 0 : 1];
    if (amount === null || amount === undefined) return [];
    const e = structuredClone(E.a.value.find((x) => x.pubkey === account) ?? E.a.value[1]) as Json, i = infoOf(e);
    Object.assign(e, { pubkey: account });
    Object.assign(i, { owner, mint: sim.mint });
    (i.tokenAmount as Json).amount = amount;
    return [e];
  });
  return { context: E[side].context, value };
}
function account(side: "a" | "b", address: string): unknown {
  const key = address === MINT ? "mint" : address === POOL ? "pool" : address === QUOTE_VAULT ? "wsol" : address === PYTH ? "pyth" : null;
  if (key === null) return { context: A.mint[side].context, value: null };
  const r = structuredClone(A[key][side]);
  if (key === "pyth") { // SYNTHETIC publish_time: 41 s before the read (ADR section 1.4 l.67), little-endian i64 at byte 93
    const d = r.value.data as [string, string], b = Buffer.from(d[0], "base64");
    let x = BigInt(Math.floor(sim.nowMs / 1000) - 41);
    for (let k = 0; k < 8; k++) { b[93 + k] = Number(x & 255n); x >>= 8n; }
    r.value.data = [b.toString("base64"), "base64"];
  }
  return r;
}
/** beta of the relays: {round, randomness = SHA-256(beta), signature} (ADR D-5 dated line C-V-3; the v1 form measured on two relays, FAITS drand). */
const relay = (round: number): Response => (sim.beta === null ? json({ error: "not found" }, 404)
  : json({ round, randomness: createHash("sha256").update(Buffer.from(sim.beta, "hex")).digest("hex"), signature: sim.beta }));

globalThis.fetch = ((input: string | URL, init?: RequestInit): Promise<Response> => {
  const u = new URL(String(input)), op = OPS[u.hostname];
  if (op === undefined) throw new Error(`collect-chain: unknown host ${u.hostname}`);
  const body = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
  const req: Req = { op, method: body.method, params: body.params };
  sim.reqs.push(req);
  stampOf.set(req, sim.nowMs);
  const over = sim.override?.(req);
  if (over !== undefined) return Promise.resolve(over);
  const side = op === "helius" ? "a" : "b";
  return Promise.resolve(rpc(req.method === "getProgramAccounts" ? enumeration(side) : account(side, String(req.params[0]))));
}) as typeof globalThis.fetch;
/** The two injected relays (RunDeps.relays): a non-2xx answer throws the guard's TransportError, as the guard's transport would. */
export const relays = [1, 2].map((n) => async (path: string): Promise<unknown> => {
  const req: Req = { op: `relay-${String(n)}`, method: "GET", params: [path] };
  sim.reqs.push(req);
  const res = sim.override?.(req) ?? relay(Number(path.split("/").pop()));
  if (!res.ok) throw new TransportError(req.op, "relay", "HttpError", res.status);
  return res.json();
});

/** The temporary roots of stateOf, removed by the test's after(). */
export const roots: string[] = [];
/** A state root outside the repo (TEMP on F:) with its ledger/, and the mint, seed and anchor files. */
export function stateOf(anchor: unknown, secret: string, mint = MINT): { state: string; mint: string; seed: string; anchor: string } {
  const root = mkdtempSync(join(tmpdir(), "dojo-collect-")), f = { state: join(root, "state"), mint: join(root, "mint.txt"), seed: join(root, "seed"), anchor: join(root, "anchor.json") };
  roots.push(root);
  mkdirSync(join(f.state, "ledger"), { recursive: true });
  writeFileSync(f.mint, `${mint}\n`);
  writeFileSync(f.seed, `${secret}\n`);
  writeFileSync(f.anchor, JSON.stringify(anchor));
  return f;
}
