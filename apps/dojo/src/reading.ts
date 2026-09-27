// MONARK Dojo -- PR-2-1 (ADR-DOJO-PR-2 D-1 l.106): pure decoders with named refusals, the pair concordance of the mint, Pool,
// wrapped-SOL and Pyth pieces, the per-account quorum on the two whole enumeration responses, the composition by address (C-9)
// and the reading prices. No network, no clock, no I/O. A pair is the two responses of one call, a and b (null = operator fault).
// Q-1 (ADR dated line after D-1 l.114): PR-2-2 passes both responses of every piece to readingRecord, concorded here by the
// `key` each decoder returns; the enumeration is compared account by account (mere D-4 l.196). The mint check is a declared calque of
// the form of apps/bell/src/supply.ts:62-77, written fail-closed (a missing field is a refusal, never a default). The refusals
// below are the collector's (precedent day_not_ended, ADR D-1 l.113), never codes of the verifier (mere D-10 l.260: none added).
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { addressReading, base58Decode, ownerClass, readingPrice, type Decimal, type Fraction, type OwnerClass } from "../scripts/dojo-core.mjs";

export const DOJO_READING_REFUSALS = Object.freeze(["enumeration_malformed", "enumeration_unparsed", "enumeration_foreign",
  "enumeration_state", "enumeration_value", "mint_malformed", "mint_program", "mint_decimals", "mint_authority", "mint_extensions",
  "pool_malformed", "pool_owner", "pool_length", "pool_discriminant", "pool_mints", "pool_vault", "pool_reserves_negative",
  "wsol_malformed", "pyth_malformed", "pyth_owner", "pyth_length", "pyth_discriminant", "pyth_partial", "pyth_feed", "pyth_price",
  "pyth_exponent"] as const);
export type Refusal = (typeof DOJO_READING_REFUSALS)[number];
export type Decoded<T> = { readonly ok: true; readonly value: T } | { readonly ok: false; readonly refusal: Refusal };

const TOKEN_2022 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"; // ADR D-2 l.122
const ACCOUNT_STATES: readonly unknown[] = ["initialized", "frozen"]; // ADR D-2 l.124
const MINT_EXTENSIONS: readonly unknown[] = ["metadataPointer", "tokenMetadata"]; // ADR section 4 l.228; DOJO-MINT-EXTENSIONS-1 l.299
const WSOL_MINT = "So11111111111111111111111111111111111111112"; // ADR D-4 l.141
const POOL_PROGRAM = "pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA"; // ADR D-4 l.141
const POOL_DISCRIMINANT = "f19a6d0411b16dbc"; // ADR D-4 l.141
const PYTH_OWNER = "rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ"; // ADR D-3 l.132
const PYTH_DISCRIMINANT = "22f123639d7ef4cd"; // ADR D-3 l.132
const PYTH_LENGTH = 134; // ADR D-3 l.132
const SOL_USD_FEED = "ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"; // ADR D-3 l.132

type Json = Readonly<Record<string, unknown>>;
const obj = (x: unknown): Json | null => (x !== null && typeof x === "object" && !Array.isArray(x) ? (x as Json) : null);
const dec = (x: unknown): x is string => typeof x === "string" && /^(0|[1-9][0-9]*)$/.test(x);
const no = <T>(refusal: Refusal): Decoded<T> => ({ ok: false, refusal });
function bytes32(x: unknown): Buffer | null {
  if (typeof x !== "string" || x.length > 44) return null;
  try { const b = Buffer.from(base58Decode(x)); return b.length === 32 ? b : null; } catch { return null; }
}
function slotOf(r: Json | null): number | null {
  const s = obj(r?.context)?.slot;
  return typeof s === "number" && Number.isSafeInteger(s) && s >= 0 ? s : null;
}
function base64Of(v: Json | null): Buffer | null {
  const d = v?.data;
  return Array.isArray(d) && d.length === 2 && d[1] === "base64" && typeof d[0] === "string" ? Buffer.from(d[0], "base64") : null;
}
/** Little-endian two's complement integer of n bytes at offset o (unsigned when `signed` is false). */
function intAt(d: Buffer, o: number, n: number, signed: boolean): bigint {
  let v = 0n;
  for (let k = o + n - 1; k >= o; k--) v = (v << 8n) | BigInt(d[k] as number);
  return signed && v >= 1n << BigInt(8 * n - 1) ? v - (1n << BigInt(8 * n)) : v;
}
/** Byte order of the base58 strings, the order of dojo-verify.mjs:99 (mere D-7: lines sorted by address in byte order). */
export const byteOrder = (x: string, y: string): number => Buffer.compare(Buffer.from(x), Buffer.from(y));

// ---- pairs (ADR D-3 l.131, D-4 l.141-145; mere D-4 l.194-197) ---------------------------------------------------------------

/** The two responses of one call; null = an operator fault (transport, delay, JSON-RPC error). */
export interface Pair { readonly a: unknown; readonly b: unknown }
export interface Piece<T> { readonly value: T | null; readonly slots: readonly number[]; readonly faults: number }
type Keyed = { readonly slot: number; readonly key: string };

/** A piece is concordant iff both responses decode and their keys are equal; a refused or missing response is a fault. `slots`
 *  holds the context slots of the decoded responses (they enter slot_min and slot_max, ADR D-4 l.145). */
export function concord<T extends Keyed>(p: Pair, decode: (r: unknown) => Decoded<T>): Piece<T> {
  const got = [p.a, p.b].map((r) => (r === null ? null : decode(r))).map((d) => (d !== null && d.ok ? d.value : null));
  const [x, y] = got;
  const slots = got.filter((d): d is T => d !== null).map((d) => d.slot);
  return { value: x !== null && x !== undefined && y !== null && y !== undefined && x.key === y.key ? x : null, slots, faults: 2 - slots.length };
}

// ---- enumeration (ADR D-2 l.122-127) ------------------------------------------------------------------------------------------

export type Row = readonly [account: string, owner: string, amount: Decimal];
export interface Enumeration { readonly context_slot: number; readonly accounts: readonly Row[] }

/** One getProgramAccounts result {context: {slot}, value: [{pubkey, account}]} in jsonParsed. Any entry outside spl-token-2022
 *  (base64 fallback when no parser is found), not an account, of another mint, in a state outside {initialized, frozen}, with a
 *  non-decimal amount or an undecodable owner refuses the WHOLE response (D-2 l.124, M-Q13). Rows sorted by account bytes. */
export function decodeEnumeration(result: unknown, mint: string): Decoded<Enumeration> {
  const r = obj(result), slot = slotOf(r), value = r?.value;
  if (slot === null || !Array.isArray(value)) return no("enumeration_malformed");
  const rows: Row[] = [];
  const seen = new Set<string>();
  for (const e of value as unknown[]) {
    const entry = obj(e), pubkey = entry?.pubkey, data = obj(obj(entry?.account)?.data);
    if (typeof pubkey !== "string" || bytes32(pubkey) === null || seen.has(pubkey)) return no("enumeration_malformed");
    if (data?.program !== "spl-token-2022") return no("enumeration_unparsed");
    const parsed = obj(data.parsed), info = obj(parsed?.info), owner = info?.owner, amount = obj(info?.tokenAmount)?.amount;
    if (parsed?.type !== "account" || info?.mint !== mint) return no("enumeration_foreign");
    if (!ACCOUNT_STATES.includes(info.state)) return no("enumeration_state");
    if (!dec(amount) || typeof owner !== "string" || bytes32(owner) === null) return no("enumeration_value");
    seen.add(pubkey);
    rows.push([pubkey, owner, amount]);
  }
  return { ok: true, value: { context_slot: slot, accounts: rows.sort((x, y) => byteOrder(x[0], y[0])) } };
}

// ---- per-account quorum and composition by address (mere D-4 l.196; ADR D-2 l.125, D-7 l.177-178) -------------------------

/** Entry of the eve (ADR D-7 l.178, TU-1p; Q-2 dated line): the addresses of bundle d-1 and the union of the (account, owner) of
 *  the accepted enumerations of its K records, bound by eve_sha256; the first day read carries the history's addresses only. */
export interface Eve { readonly addresses: readonly string[]; readonly accounts: readonly (readonly [account: string, owner: string])[] }
export type Cause = "disagreement" | "fault" | "missed";
export interface AccountStatus { readonly account: string; readonly owners: readonly string[]; readonly amount: Decimal | null; readonly cause: Cause | null }

/** Status of every account known at one reading, from the ACCEPTED enumeration responses (0 to 2) and the accounts of the eve.
 *  Two accepted: (account, owner, amount) equal in both => concordant; absent from both while known the eve => concordant "0"
 *  (C-1, M-Q7); in one only (M-Q1) or different (M-Q2) => no quorum, cause "disagreement". Fewer than two accepted (a refused
 *  response or an operator fault): every known account is without quorum, cause "fault", never absent (D-2 l.125, M-Q20). */
export function accountStatuses(accepted: readonly Enumeration[], eve: Eve): AccountStatus[] {
  const [a, b] = accepted.map((e) => new Map(e.accounts.map((r) => [r[0], r])));
  const eveOwner = new Map(eve.accounts.map((x) => [x[0], x[1]]));
  const known = [...new Set([...(a?.keys() ?? []), ...(b?.keys() ?? []), ...eveOwner.keys()])].sort(byteOrder);
  return known.map((account) => {
    const x = a?.get(account), y = b?.get(account), was = eveOwner.get(account);
    const owners = [...new Set([x?.[1], y?.[1], was].filter((o): o is string => o !== undefined))].sort(byteOrder);
    if (a === undefined || b === undefined) return { account, owners, amount: null, cause: "fault" };
    if (x === undefined && y === undefined) return { account, owners, amount: "0", cause: null };
    if (x !== undefined && y !== undefined && x[1] === y[1] && x[2] === y[2]) return { account, owners: [x[1]], amount: x[2], cause: null };
    return { account, owners, amount: null, cause: "disagreement" };
  });
}

export interface AddressReads { readonly address: string; readonly class: OwnerClass; readonly reads: readonly (Decimal | null)[] }

/** The K composed readings of every address of the day (eve addresses, eve owners and every owner seen), sorted by address. A
 *  reading with fewer than two accepted responses is null for every address; otherwise an address reads the sum of its accounts
 *  when each is concordant, null when one is not (C-9, M-Q10), and "0" when it has no account (seventh pli (d), M-Q16). */
export function composeAddresses(readings: readonly (readonly Enumeration[])[], eve: Eve): AddressReads[] {
  const statuses = readings.map((acc) => accountStatuses(acc, eve));
  const all = new Set([...eve.addresses, ...eve.accounts.map((x) => x[1])]);
  for (const ss of statuses) for (const s of ss) for (const o of s.owners) all.add(o);
  return [...all].sort(byteOrder).map((address) => ({ address, class: ownerClass(address), reads: statuses.map((ss, i) =>
    (readings[i]?.length ?? 0) < 2 ? null : addressReading(ss.filter((s) => s.owners.includes(address)).map((s) => s.amount))) }));
}

/** Accounts without quorum by disagreement at EACH of the K readings of the day (ADR D-7 l.177; checkpoint-1 verdict point (5),
 *  l.394: disagreements only), sorted, as {account}; M-Q22. */
export function persistentNoQuorum(perReading: readonly (readonly { account: string; cause: Cause }[])[], k: number): { account: string }[] {
  if (perReading.length !== k || k === 0) return [];
  const sets = perReading.map((l) => new Set(l.filter((x) => x.cause === "disagreement").map((x) => x.account)));
  return [...(sets[0] ?? [])].filter((a) => sets.every((s) => s.has(a))).sort(byteOrder).map((account) => ({ account }));
}

// ---- mint (mere D-4 l.194; ADR section 4 l.228, E-5 l.93) ----------------------------------------------------------------------

export interface MintRead extends Keyed { readonly value: Json }
/** A getAccountInfo(jsonParsed) result of the mint; the key is the canonical JSON of the whole value (quorum on identical data). */
export function decodeMint(result: unknown): Decoded<MintRead> {
  const r = obj(result), slot = slotOf(r), value = obj(r?.value);
  return slot === null || value === null ? no("mint_malformed") : { ok: true, value: { slot, key: canonical(value), value } };
}

/** Control of the mint value: Token-2022 program and parser, the expected decimals, null mint and freeze authorities, and
 *  extensions EXACTLY {metadataPointer, tokenMetadata} (set equality, M-Q4). null = unchanged. */
export function checkMint(value: unknown, decimals: number): Refusal | null {
  const v = obj(value), data = obj(v?.data), parsed = obj(data?.parsed), info = obj(parsed?.info);
  if (v === null || data === null || info === null || parsed?.type !== "mint" || !Array.isArray(info.extensions)) return "mint_malformed";
  if (v.owner !== TOKEN_2022 || data.program !== "spl-token-2022") return "mint_program";
  if (info.decimals !== decimals) return "mint_decimals";
  if (info.mintAuthority !== null || info.freezeAuthority !== null) return "mint_authority";
  const ext = (info.extensions as unknown[]).map((e) => obj(e)?.extension);
  if (ext.length !== MINT_EXTENSIONS.length || new Set(ext).size !== ext.length || !ext.every((e) => MINT_EXTENSIONS.includes(e))) return "mint_extensions";
  return null;
}

// ---- pool (ADR D-4 l.141-145; mere D-17 l.298) ----------------------------------------------------------------------------------

export interface PoolRead extends Keyed { readonly base_account: string; readonly virtual_quote_reserves: Decimal }
export interface WsolRead extends Keyed { readonly amount: Decimal }

/** The Pool account (base64): owner, discriminant, base_mint (43) = mint, quote_mint (75) = wrapped SOL, pool_quote_token_account
 *  (171) = the anchor's pool_quote_vault, length >= 203; virtual_quote_reserves = little-endian i128 at bytes 245..260 when the length is at
 *  least 261, 0 when at most 245, refused from 246 to 260 (truncated) and when negative; bytes past 271 ignored (E-3). The key is
 *  the owner and the bytes (identical bytes, D-4 l.141). */
export function decodePool(result: unknown, mint: string, quoteVault: string): Decoded<PoolRead> {
  const r = obj(result), v = obj(r?.value), slot = slotOf(r), d = base64Of(v), m = bytes32(mint), q = bytes32(quoteVault);
  const w = bytes32(WSOL_MINT) as Buffer;
  if (slot === null || v === null || d === null || m === null || q === null) return no("pool_malformed");
  if (v.owner !== POOL_PROGRAM) return no("pool_owner");
  if (d.length < 203 || (d.length > 245 && d.length < 261)) return no("pool_length");
  if (d.subarray(0, 8).toString("hex") !== POOL_DISCRIMINANT) return no("pool_discriminant");
  if (!d.subarray(43, 75).equals(m) || !d.subarray(75, 107).equals(w)) return no("pool_mints");
  if (!d.subarray(171, 203).equals(q)) return no("pool_vault");
  const vqr = d.length >= 261 ? intAt(d, 245, 16, true) : 0n;
  if (vqr < 0n) return no("pool_reserves_negative");
  const base = Buffer.from(d.subarray(139, 171));
  return { ok: true, value: { slot, key: `${v.owner} ${d.toString("base64")}`, base_account: base.toString("hex"), virtual_quote_reserves: String(vqr) } };
}

/** The pool's wrapped-SOL token account (jsonParsed): spl-token, an account of the wrapped-SOL mint, owned by the pool, native;
 *  key (amount, owner) (D-4 l.143). */
export function decodeWsol(result: unknown, pool: string): Decoded<WsolRead> {
  const r = obj(result), slot = slotOf(r), data = obj(obj(r?.value)?.data), parsed = obj(data?.parsed), info = obj(parsed?.info);
  const amount = obj(info?.tokenAmount)?.amount;
  if (slot === null || data?.program !== "spl-token" || parsed?.type !== "account" || info?.mint !== WSOL_MINT || info.owner !== pool
    || info.isNative !== true || !dec(amount)) return no("wsol_malformed");
  return { ok: true, value: { slot, key: `${amount} ${pool}`, amount } };
}

/** Pool price of a reading [r_S, r_M] (D-4 l.144, M-Q12): r_S = concordant wrapped-SOL amount + virtual_quote_reserves of the
 *  concordant Pool; r_M = the CONCORDANT amount of the pool's base account in the same reading's enumeration (M-Q8); null when a
 *  piece is missing or not concordant, or when r_M = 0. */
export function poolPrice(pool: PoolRead | null, wsol: WsolRead | null, statuses: readonly AccountStatus[]): Fraction | null {
  if (pool === null || wsol === null) return null;
  const base = statuses.find((s) => bytes32(s.account)?.toString("hex") === pool.base_account);
  if (base === undefined || base.amount === null) return null;
  return readingPrice(String(BigInt(wsol.amount) + BigInt(pool.virtual_quote_reserves)), base.amount);
}

// ---- SOL/USD (ADR D-3 l.131-133; mere D-17 l.301) -----------------------------------------------------------------------------

export interface PythRead extends Keyed { readonly price: Decimal; readonly exponent: number; readonly conf: Decimal; readonly publish_time: number }

/** PriceUpdateV2 (base64): owner the receiver, 134 bytes, discriminant, variant Full (byte 40 = 1; Partial refused, M-Q14),
 *  feed_id at 41 (M-Q15), price i64 at 73 > 0, conf u64 at 81, exponent i32 at 89 <= 0, publish_time i64 at 93; key = owner and
 *  bytes (identical bytes, D-3 l.131). */
export function decodePyth(result: unknown): Decoded<PythRead> {
  const r = obj(result), v = obj(r?.value), slot = slotOf(r), d = base64Of(v);
  if (slot === null || v === null || d === null) return no("pyth_malformed");
  if (v.owner !== PYTH_OWNER) return no("pyth_owner");
  if (d.length !== PYTH_LENGTH) return no("pyth_length");
  if (d.subarray(0, 8).toString("hex") !== PYTH_DISCRIMINANT) return no("pyth_discriminant");
  if (d[40] !== 1) return no("pyth_partial");
  if (d.subarray(41, 73).toString("hex") !== SOL_USD_FEED) return no("pyth_feed");
  const price = intAt(d, 73, 8, true), exponent = Number(intAt(d, 89, 4, true));
  if (price <= 0n) return no("pyth_price");
  if (exponent > 0) return no("pyth_exponent");
  return { ok: true, value: { slot, key: `${v.owner} ${d.toString("base64")}`, price: String(price), exponent, conf: String(intAt(d, 81, 8, false)),
    publish_time: Number(intAt(d, 93, 8, true)) } };
}

/** sigma of a reading = price x 10^exponent, exact; kept only when instant - maxAge <= publish_time <= read_at (seconds; D-3
 *  l.132, 165 s = sol_usd_max_age_s, decision 248), else both null (M-Q14). */
export function solUsd(pyth: PythRead | null, instant: number, readAt: number, maxAge: number): { usd_per_sol: Fraction | null; publish_time: number | null } {
  if (pyth === null || pyth.publish_time < instant - maxAge || pyth.publish_time > readAt) return { usd_per_sol: null, publish_time: null };
  return { usd_per_sol: readingPrice(pyth.price, String(10n ** BigInt(-pyth.exponent))), publish_time: pyth.publish_time };
}
