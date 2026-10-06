// MONARK Dojo -- PR-2-1 (ADR-DOJO-PR-2 D-1 l.107, D-7 l.175-177, D-8 l.183): the closed forms dojo-reading-v1 (one reading) and
// dojo-day-bundle-v1 (the day), their writer (canonical bytes of Bell's canonical, sorted keys, LF; no clock: the end of the day is
// checked against an explicit `now`) and their reader (closed keys, forms, canonical bytes, and, given the records and the eve
// entry, their sha256 and the recomputation of the composed fields). No operator label and no secret: pairs are a and b, the kept
// enumerations are sorted by context slot; the seed g_d is written only after the end of the reading day (M-Q5). Consumers: PR-2-2
// (--reading, --close-day), PR-3a (publish/, TU-1c), PR-2b (readings/ of the first day read, TU-1h).
import { createHash } from "node:crypto";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { beaconRound, dayMinimum, readInstants, type Decimal, type Fraction } from "../scripts/dojo-core.mjs";
import { accountStatuses, byteOrder, checkMint, composeAddresses, concord, decodeEnumeration, decodeMint, decodePool, decodePyth,
  decodeWsol, persistentNoQuorum, poolPrice, solUsd, DOJO_READING_REFUSALS, type AddressReads, type Cause, type Enumeration, type Eve,
  type Pair, type Refusal } from "./reading.ts";

/** Refusals of the writer and the reader (collector refusals, outside the verifier's list; day_not_ended: ADR D-1 l.113). */
export const DOJO_BUNDLE_REFUSALS = Object.freeze(["day_not_ended", "bundle_input_malformed", "record_malformed", "bundle_malformed",
  "bundle_records_mismatch"] as const);
/** Reasons of an abstained day: beacon_unavailable (ADR D-5 l.153); mint_changed and mint_unchecked (ADR D-7, Q-4 dated line). */
export const DOJO_DAY_REASONS = Object.freeze(["beacon_unavailable", "mint_changed", "mint_unchecked"] as const);
type Code = (typeof DOJO_BUNDLE_REFUSALS)[number];
export class DojoBundleError extends Error {
  readonly code: Code;
  readonly detail: string;
  constructor(code: Code, detail: string) { super(`dojo/bundle: ${code}: ${detail}`); this.code = code; this.detail = detail; }
}
const fail = (code: Code, detail: string): never => { throw new DojoBundleError(code, detail); };

/** The published read (ADR D-8 l.183, closed keys). */
export interface Read { readonly instant: string; readonly read_at: string | null; readonly slot_min: number | null; readonly slot_max: number | null;
  readonly accounts_concordant: number; readonly accounts_no_quorum: number; readonly pool_price: Fraction | null; readonly usd_per_sol: Fraction | null;
  readonly usd_per_sol_publish_time: number | null }
export interface ReadingRecord { readonly schema: "dojo-reading-v1"; readonly day: string; readonly i: number; readonly read: Read;
  readonly enumerations: readonly Enumeration[]; readonly mint: { readonly slots: readonly number[]; readonly value: unknown } | null;
  readonly pool: { readonly slots: readonly number[]; readonly virtual_quote_reserves: Decimal; readonly quote_slots: readonly number[]; readonly quote_amount: Decimal } | null;
  readonly pyth: { readonly slots: readonly number[]; readonly price: Decimal; readonly exponent: number; readonly conf: Decimal; readonly publish_time: number } | null;
  readonly faults: { readonly enumeration: number; readonly mint: number; readonly pool: number; readonly wsol: number; readonly pyth: number };
  readonly no_quorum_accounts: readonly { readonly account: string; readonly cause: Cause }[] }
/** Anchor fields a reading needs (mere D-8; read_rule of ADR D-5 l.151). */
export interface ReadingAnchor { readonly mint: string; readonly pool: string; readonly pool_quote_vault: string; readonly sol_usd_max_age_s: number }
/** One reading: a pair per piece (null member = fault); mint null when not read at this reading; read_at null for a missed reading,
 *  every pair empty: its known accounts carry cause missed and it counts no fault (Q-6, ADR D-7 dated line). */
export interface ReadingInput { readonly day: string; readonly i: number; readonly instant: number; readonly read_at: string | null;
  readonly enumeration: Pair; readonly mint: Pair | null; readonly pool: Pair; readonly wsol: Pair; readonly pyth: Pair; readonly eve: Eve;
  readonly anchor: ReadingAnchor }

const sha = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const bytesOf = (v: unknown): string => `${canonical(v)}\n`;
const iso = (s: number): string => new Date(s * 1000).toISOString();
const secondsOf = (s: string): number | null => { const t = Date.parse(s); return Number.isFinite(t) && new Date(t).toISOString() === s ? t / 1000 : null; };
const dayStart = (d: string): number | null => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? secondsOf(`${d}T00:00:00.000Z`) : null);
const empty = (p: Pair | null): boolean => p === null || (p.a === null && p.b === null);

/** One reading's record (ADR D-7 l.175, l.177): the two enumeration responses decoded and compared account by account; mint, Pool,
 *  wrapped SOL and Pyth concorded as pairs (identical bytes, or (amount, owner)); the published read of D-8 l.183. */
export function readingRecord(x: ReadingInput): ReadingRecord {
  const at = x.read_at === null ? null : secondsOf(x.read_at);
  if (dayStart(x.day) === null || !Number.isSafeInteger(x.i) || x.i < 1 || !Number.isSafeInteger(x.instant) || (x.read_at !== null && at === null)
    || (at === null && ![x.enumeration, x.mint, x.pool, x.wsol, x.pyth].every(empty))) fail("bundle_input_malformed", "reading");
  const decoded = [x.enumeration.a, x.enumeration.b].map((r) => (r === null ? null : decodeEnumeration(r, x.anchor.mint)));
  const accepted = decoded.flatMap((d) => (d !== null && d.ok ? [d.value] : [])).sort((p, q) => p.context_slot - q.context_slot);
  const statuses = accountStatuses(accepted, x.eve);
  const mint = x.mint === null ? null : concord(x.mint, decodeMint);
  const pool = concord(x.pool, (r) => decodePool(r, x.anchor.mint, x.anchor.pool_quote_vault)), wsol = concord(x.wsol, (r) => decodeWsol(r, x.anchor.pool));
  const pyth = concord(x.pyth, decodePyth);
  const sigma = at === null ? { usd_per_sol: null, publish_time: null } : solUsd(pyth.value, x.instant, at, x.anchor.sol_usd_max_age_s);
  const slots = [...accepted.map((e) => e.context_slot), ...(mint?.slots ?? []), ...pool.slots, ...wsol.slots, ...pyth.slots];
  const noQuorum = statuses.flatMap((s) => (s.cause === null ? [] : [{ account: s.account, cause: at === null ? "missed" as const : s.cause }]));
  const p = pool.value, w = wsol.value, y = pyth.value;
  return { schema: "dojo-reading-v1", day: x.day, i: x.i,
    read: { instant: iso(x.instant), read_at: x.read_at, slot_min: slots.length > 0 ? Math.min(...slots) : null,
      slot_max: slots.length > 0 ? Math.max(...slots) : null, accounts_concordant: statuses.length - noQuorum.length,
      accounts_no_quorum: noQuorum.length, pool_price: poolPrice(p, w, statuses), usd_per_sol: sigma.usd_per_sol, usd_per_sol_publish_time: sigma.publish_time },
    enumerations: accepted, mint: mint?.value ? { slots: mint.slots, value: mint.value.value } : null,
    pool: p !== null && w !== null ? { slots: pool.slots, virtual_quote_reserves: p.virtual_quote_reserves, quote_slots: wsol.slots, quote_amount: w.amount } : null,
    pyth: y === null ? null : { slots: pyth.slots, price: y.price, exponent: y.exponent, conf: y.conf, publish_time: y.publish_time },
    faults: at === null ? { enumeration: 0, mint: 0, pool: 0, wsol: 0, pyth: 0 } : { enumeration: 2 - accepted.length, mint: mint?.faults ?? 0, pool: pool.faults, wsol: wsol.faults, pyth: pyth.faults },
    no_quorum_accounts: noQuorum };
}
export const recordBytes = (r: ReadingRecord): string => bytesOf(r);

export interface Beacon { readonly round: number; readonly signature: string }
export interface DayBundle { readonly schema: "dojo-day-bundle-v1"; readonly day: string; readonly status: "counted" | "abstained";
  readonly reason: (typeof DOJO_DAY_REASONS)[number] | null; readonly mint: string; readonly program: string; readonly decimals: number;
  readonly k_reads: number; readonly seed: string; readonly beacon: Beacon | null; readonly reads: readonly Read[];
  readonly addresses: readonly AddressReads[] | null; readonly pool_price_daily: Fraction | null; readonly usd_per_sol_daily: Fraction | null;
  readonly mint_check: "ok" | Refusal | null; readonly accounts_no_quorum_persistent: readonly { readonly account: string }[] | null;
  readonly records_sha256: readonly string[]; readonly eve_sha256: string }
export interface DayInput { readonly day: string; readonly seed: string; readonly beacon: Beacon | null;
  readonly read_rule: { readonly read_offset_s: number; readonly read_tolerance_s: number; readonly beacon_genesis_time: number; readonly beacon_period: number };
  readonly k_reads: number; readonly mint: string; readonly program: string; readonly decimals: number;
  readonly records: readonly ReadingRecord[]; readonly eve: Eve }

// The composed fields (ADR D-7 l.176-178): the mint checked at the first reading that carries a concordant value (E-5 l.93), else
// abstained; pi_d and sigma_d = minima of the reads (mere D-17 l.299, l.301; M-Q9); persistent disagreements over the K readings
// (M-Q22); null when abstained.
function composed(records: readonly ReadingRecord[], eve: Eve, decimals: number, k: number, beacon: boolean) {
  const first = records.find((r) => r.mint !== null);
  const mint_check: "ok" | Refusal | null = first?.mint ? (checkMint(first.mint.value, decimals) ?? "ok") : null;
  const reason: (typeof DOJO_DAY_REASONS)[number] | null = !beacon ? "beacon_unavailable" : mint_check === null ? "mint_unchecked" : mint_check !== "ok" ? "mint_changed" : null;
  if (reason !== null) return { status: "abstained" as const, reason, mint_check, addresses: null, pool_price_daily: null, usd_per_sol_daily: null,
    accounts_no_quorum_persistent: null };
  return { status: "counted" as const, reason, mint_check, addresses: composeAddresses(records.map((r) => r.enumerations), eve),
    pool_price_daily: dayMinimum(records.map((r) => r.read.pool_price)), usd_per_sol_daily: dayMinimum(records.map((r) => r.read.usd_per_sol)),
    accounts_no_quorum_persistent: persistentNoQuorum(records.map((r) => r.no_quorum_accounts), k) };
}

/** The day bundle and its canonical bytes. Refuses (day_not_ended) before the end of the reading day, max_i t_i + read_tolerance_s,
 *  or T_{d+1} for a day without beacon (ADR D-1 l.113, M-Q5); recomputes r_d and the K instants (D-5) and requires the records'. */
export function writeDayBundle(x: DayInput, now: number): { bundle: DayBundle; bytes: string } {
  const t = dayStart(x.day), rr = x.read_rule;
  if (t === null || !/^[0-9a-f]{64}$/.test(x.seed)) return fail("bundle_input_malformed", "day or seed");
  let end = t + 86_400;
  if (x.beacon === null) {
    if (x.records.length !== 0) fail("bundle_input_malformed", "records without beacon");
  } else {
    if (x.beacon.round !== beaconRound(t, rr.beacon_genesis_time, rr.beacon_period)) fail("bundle_input_malformed", "beacon.round");
    const instants = readInstants(x.seed, x.beacon.signature, x.k_reads, t, rr.read_offset_s);
    if (x.records.length !== x.k_reads || x.records.some((r, j) => r.day !== x.day || r.i !== j + 1 || r.read.instant !== iso(instants[j] ?? -1))) {
      fail("bundle_input_malformed", "records");
    }
    end = Math.max(...instants) + rr.read_tolerance_s;
  }
  if (!Number.isSafeInteger(now) || now < end) fail("day_not_ended", "now");
  const bundle: DayBundle = { schema: "dojo-day-bundle-v1", day: x.day, mint: x.mint, program: x.program, decimals: x.decimals,
    k_reads: x.k_reads, seed: x.seed, beacon: x.beacon, reads: x.records.map((r) => r.read),
    ...composed(x.records, x.eve, x.decimals, x.k_reads, x.beacon !== null),
    records_sha256: x.records.map((r) => sha(recordBytes(r))), eve_sha256: sha(bytesOf(x.eve)) };
  return { bundle, bytes: bytesOf(bundle) };
}

// ---- reader ------------------------------------------------------------------------------------------------------------------

type J = Readonly<Record<string, unknown>>;
const closed = (o: unknown, keys: readonly string[]): o is J => o !== null && typeof o === "object" && !Array.isArray(o)
  && Object.keys(o).length === keys.length && keys.every((k) => Object.hasOwn(o, k));
const int = (n: unknown): n is number => typeof n === "number" && Number.isSafeInteger(n) && n >= 0;
const decimal = (s: unknown): s is string => typeof s === "string" && /^(0|[1-9][0-9]*)$/.test(s);
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));
const frac = (f: unknown): boolean => f === null || (Array.isArray(f) && f.length === 2 && decimal(f[0]) && decimal(f[1]) && f[1] !== "0"
  && gcd(BigInt(f[0]), BigInt(f[1])) === 1n); // reduced (ADR D-8 l.183)
const hex = (s: unknown, n: number): boolean => typeof s === "string" && s.length === n && /^[0-9a-f]+$/.test(s);
const slots = (l: unknown): boolean => Array.isArray(l) && l.length <= 2 && l.every(int);
const sortedBy = <T>(l: readonly T[], k: (x: T) => string): boolean => l.every((x, j) => j === 0 || byteOrder(k(l[j - 1] as T), k(x)) < 0);
const READ = ["instant", "read_at", "slot_min", "slot_max", "accounts_concordant", "accounts_no_quorum", "pool_price", "usd_per_sol", "usd_per_sol_publish_time"];
const readOk = (r: unknown): boolean => closed(r, READ) && typeof r.instant === "string" && secondsOf(r.instant) !== null
  && (r.read_at === null || (typeof r.read_at === "string" && secondsOf(r.read_at) !== null))
  && [r.slot_min, r.slot_max, r.usd_per_sol_publish_time].every((s) => s === null || int(s))
  && int(r.accounts_concordant) && int(r.accounts_no_quorum) && frac(r.pool_price) && frac(r.usd_per_sol);
function parse(text: string, code: "record_malformed" | "bundle_malformed"): unknown {
  try { return JSON.parse(text) as unknown; } catch { return fail(code, "json"); }
}
const rowsOk = (e: unknown): boolean => closed(e, ["context_slot", "accounts"]) && int(e.context_slot) && Array.isArray(e.accounts)
  && e.accounts.every((a) => Array.isArray(a) && a.length === 3 && typeof a[0] === "string" && typeof a[1] === "string" && decimal(a[2]))
  && sortedBy(e.accounts as string[][], (a) => a[0] ?? "");

/** Reads one dojo-reading-v1 record (closed keys at every level; canonical bytes required; reduced fractions). A missed reading
 *  (read_at null) carries cause missed only and no fault; a reading made carries disagreement or fault only (Q-6). */
export function readRecord(text: string): ReadingRecord {
  const r = parse(text, "record_malformed");
  const ok = closed(r, ["schema", "day", "i", "read", "enumerations", "mint", "pool", "pyth", "faults", "no_quorum_accounts"])
    && r.schema === "dojo-reading-v1" && typeof r.day === "string" && dayStart(r.day) !== null && int(r.i) && r.i >= 1 && readOk(r.read)
    && Array.isArray(r.enumerations) && r.enumerations.length <= 2 && r.enumerations.every(rowsOk)
    && (r.mint === null || (closed(r.mint, ["slots", "value"]) && slots(r.mint.slots) && typeof r.mint.value === "object" && r.mint.value !== null))
    && (r.pool === null || (closed(r.pool, ["slots", "virtual_quote_reserves", "quote_slots", "quote_amount"]) && slots(r.pool.slots)
      && decimal(r.pool.virtual_quote_reserves) && slots(r.pool.quote_slots) && decimal(r.pool.quote_amount)))
    && (r.pyth === null || (closed(r.pyth, ["slots", "price", "exponent", "conf", "publish_time"]) && slots(r.pyth.slots) && decimal(r.pyth.price)
      && typeof r.pyth.exponent === "number" && Number.isSafeInteger(r.pyth.exponent) && decimal(r.pyth.conf) && int(r.pyth.publish_time)))
    && closed(r.faults, ["enumeration", "mint", "pool", "wsol", "pyth"]) && Object.values(r.faults).every((f) => int(f) && f <= 2 && ((r.read as J).read_at !== null || f === 0))
    && Array.isArray(r.no_quorum_accounts) && r.no_quorum_accounts.every((x) => closed(x, ["account", "cause"]) && typeof x.account === "string"
      && ((r.read as J).read_at === null ? x.cause === "missed" : x.cause === "disagreement" || x.cause === "fault")) && sortedBy(r.no_quorum_accounts as { account: string }[], (x) => x.account)
    && ((r.read as J).read_at !== null || (r.enumerations.length === 0 && r.mint === null && r.pool === null && r.pyth === null // DOJO-READER-MISSED-FORM-1 (PR-2-2)
      && ["slot_min", "slot_max", "pool_price", "usd_per_sol", "usd_per_sol_publish_time"].every((f) => (r.read as J)[f] === null)));
  if (!ok || bytesOf(r) !== text) fail("record_malformed", "form");
  return r as ReadingRecord;
}

const BUNDLE = ["schema", "day", "status", "reason", "mint", "program", "decimals", "k_reads", "seed", "beacon", "reads", "addresses",
  "pool_price_daily", "usd_per_sol_daily", "mint_check", "accounts_no_quorum_persistent", "records_sha256", "eve_sha256"];

/** Reads one dojo-day-bundle-v1 (closed keys, forms, sorted lists, canonical bytes). With `check`, also the sha256 of the K records
 *  and of the eve entry, and the recomputation of every composed field from them (bundle_records_mismatch). */
export function readDayBundle(text: string, check?: { records: readonly string[]; eve: Eve }): DayBundle {
  const b = parse(text, "bundle_malformed");
  const k = closed(b, BUNDLE) ? b.k_reads : -1, reads = closed(b, BUNDLE) && Array.isArray(b.reads) ? b.reads : [];
  const addrOk = (a: unknown) => closed(a, ["address", "class", "reads"]) && typeof a.address === "string" && (a.class === "holder" || a.class === "program")
    && Array.isArray(a.reads) && a.reads.length === k && a.reads.every((v) => v === null || decimal(v));
  const ok = closed(b, BUNDLE) && b.schema === "dojo-day-bundle-v1" && typeof b.day === "string" && dayStart(b.day) !== null
    && (b.status === "counted" ? b.reason === null : b.status === "abstained" && (DOJO_DAY_REASONS as readonly unknown[]).includes(b.reason))
    && typeof b.mint === "string" && typeof b.program === "string" && int(b.decimals) && int(k) && k >= 1 && hex(b.seed, 64)
    && (b.beacon === null ? reads.length === 0 && b.reason === "beacon_unavailable"
      : closed(b.beacon, ["round", "signature"]) && int(b.beacon.round) && hex(b.beacon.signature, 96) && reads.length === k)
    && reads.every(readOk) && frac(b.pool_price_daily) && frac(b.usd_per_sol_daily)
    && (b.mint_check === null || b.mint_check === "ok" || (DOJO_READING_REFUSALS as readonly unknown[]).includes(b.mint_check))
    && (b.status === "abstained" ? b.addresses === null && b.accounts_no_quorum_persistent === null && b.pool_price_daily === null && b.usd_per_sol_daily === null
      : Array.isArray(b.addresses) && b.addresses.every(addrOk) && sortedBy(b.addresses as { address: string }[], (a) => a.address)
        && Array.isArray(b.accounts_no_quorum_persistent) && b.accounts_no_quorum_persistent.every((a) => closed(a, ["account"]) && typeof a.account === "string")
        && sortedBy(b.accounts_no_quorum_persistent as { account: string }[], (a) => a.account))
    && Array.isArray(b.records_sha256) && b.records_sha256.length === reads.length && b.records_sha256.every((h) => hex(h, 64)) && hex(b.eve_sha256, 64);
  if (!ok || bytesOf(b) !== text) fail("bundle_malformed", "form");
  const bundle = b as DayBundle;
  if (check !== undefined) {
    const recs = check.records.map(readRecord);
    const same = check.records.length === bundle.records_sha256.length && check.records.every((t, j) => sha(t) === bundle.records_sha256[j])
      && sha(bytesOf(check.eve)) === bundle.eve_sha256 && canonical(recs.map((r) => r.read)) === canonical(bundle.reads)
      && canonical(composed(recs, check.eve, bundle.decimals, bundle.k_reads, bundle.beacon !== null))
        === canonical({ status: bundle.status, reason: bundle.reason, mint_check: bundle.mint_check, addresses: bundle.addresses,
          pool_price_daily: bundle.pool_price_daily, usd_per_sol_daily: bundle.usd_per_sol_daily,
          accounts_no_quorum_persistent: bundle.accounts_no_quorum_persistent });
    if (!same) fail("bundle_records_mismatch", "records");
  }
  return bundle;
}
