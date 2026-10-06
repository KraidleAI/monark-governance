// MONARK Dojo -- PR-2-1 oracle (ADR-DOJO-PR-2 section 4, PR-2-1, l.228-230): seeds, beacon round and instants, decoders, pair
// concordance, the per-account quorum and the composition by address, reading prices, the reading record and the day bundle.
// Inputs are the reduced verbatim fixtures of fixtures/collect/ (provenance.json); every variant is SYNTHETIC, derived here and
// declared at its use. Expected values are recoded here (SHA-256 chain, instant formula, round rule, i128, gcd, minima), never read
// from the module under test. No network, no clock: instants, read times and `now` are explicit numbers.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { base58Decode, beaconRound, daySeed, readInstants, seedAnchor } from "../scripts/dojo-core.mjs";
import { DOJO_VERIFY_REFUSALS } from "../scripts/dojo-verify.mjs";
import { OPERATOR_OF_DOMAIN } from "../../bell/src/operators.ts";
import { canonical } from "../../bell/scripts/bell-chain.mjs";
import { DOJO_READING_REFUSALS, accountStatuses, checkMint, composeAddresses, concord, decodeEnumeration, decodePool, decodePyth,
  decodeWsol, poolPrice, solUsd, type Enumeration, type Eve, type Pair } from "../src/reading.ts";
import { DOJO_BUNDLE_REFUSALS, readDayBundle, readRecord, readingRecord, recordBytes, writeDayBundle, type ReadingRecord } from "../src/bundle.ts";

type Info = { owner: string; mint: string; state: string; tokenAmount: { amount: string; decimals: number } };
type Entry = { pubkey: string; account: { data: { program: string; parsed: { type: string; info: Info } } | [string, string] } };
type Enum = { context: { slot: number }; value: Entry[] };
type Parsed = { program: string; parsed: { type: string; info: Record<string, unknown> } };
type Acc = { context: { slot: number }; value: { owner: string; data: [string, string] | Parsed } };
const text = (f: string): string => readFileSync(new URL(`./fixtures/collect/${f}`, import.meta.url), "utf8");
const E = JSON.parse(text("enumeration.json")) as { a: Enum; b: Enum };
const A = JSON.parse(text("accounts.json")) as Record<"mint" | "pool" | "wsol" | "pyth", { a: Acc; b: Acc }>;
const sha = (...p: (string | Uint8Array)[]): Buffer => { const h = createHash("sha256"); for (const x of p) h.update(x); return h.digest(); };
const H = (hex: string, k: number): string => { let b: Buffer = Buffer.from(hex, "hex"); for (let i = 0; i < k; i++) b = sha(b); return b.toString("hex"); };
const gcd = (a: bigint, b: bigint): bigint => (b === 0n ? a : gcd(b, a % b));
const red = (n: bigint, d: bigint): [string, string] => [String(n / gcd(n, d)), String(d / gcd(n, d))];
const byBytes = (x: string, y: string): number => Buffer.compare(Buffer.from(x), Buffer.from(y));
const infoOf = (e: Entry | undefined): Info => { assert.ok(e !== undefined && !Array.isArray(e.account.data)); return e.account.data.parsed.info; };
const entry = (acc: string): Info => infoOf(E.a.value.find((e) => e.pubkey === acc));
const ACC = E.a.value.map((e) => e.pubkey);
const MINT = infoOf(E.a.value[0]).mint;
const [H1, H2, BASE, VAULT_LOCK, S165, TARGET] = ["3tdLHroLvoiQp4HUqcjrMuWX8mzfdGXXrZsWjxNF4HWi", "7uZBAQotsji94fwLMzRv4sGfNM5sdxDfJFyx5C3WaQUJ",
  "MeQMg7r7smskfnq4xPmUPRSbFXUzqgJjDMBzvCoYkzd", "AD76kHYYXA25wMdSPvQAuiARG33DfNsqF1A1qBJUw4nr", "7YsyQEvZud2m4dhR1xqeoXMFZGHcn3GeT6CnaZH8kpj8",
  "CM72MTLXt8M7BwBMHUrecYQakH8xDmWJhqkZ6T2J1hiW"] as const; // provenance.json "reduction"
const OWNER = (acc: string): string => entry(acc).owner;
const POOL = (A.wsol.a.value.data as Parsed).parsed.info.owner as string;
const QUOTE_VAULT = "6KLxyVpYwMGyQJHsvWqFpRk1crEQ79sG3Wi3C1SkZbTW"; // pool_quote_token_account (ADR section 1.3), checked on the bytes below
const ANCHOR = { mint: MINT, pool: POOL, pool_quote_vault: QUOTE_VAULT, sol_usd_max_age_s: 165 }; // 165 s: ADR D-3 l.132, decision 248
const T = 1790467200, GENESIS = 1692803367, PERIOD = 3; // 2026-09-27T00:00Z (date -u -d @1790467200); quicknet (report l.156, FAITS PR-2 l.55)
const BETA = "b75c69d0b72a5d906e854e808ba7e2accb1542ac355ae486d591aa9d43765482e26cd02df835d3546d23c4b13e0dfc92"; // report l.159: its FORM only
const RULE = { read_offset_s: 900, read_tolerance_s: 600, beacon_genesis_time: GENESIS, beacon_period: PERIOD }; // ADR D-5 l.149, l.151
const SECRET = sha("SYNTHETIC dojo collect secret").toString("hex"), SEED = daySeed(SECRET, 30, 3);
const NO_EVE: Eve = { addresses: [], accounts: [] };
const edit = (r: Enum, acc: string, f: ((i: Info) => void) | null): Enum => {
  const c = structuredClone(r), j = c.value.findIndex((e) => e.pubkey === acc);
  if (f === null) c.value.splice(j, 1); else f(infoOf(c.value[j]));
  return c;
};
const both = <X>(f: (r: X) => X, p: { a: X; b: X }): Pair => ({ a: f(p.a), b: f(p.b) });
const same = (x: unknown): Pair => ({ a: x, b: x });
const dec = (r: unknown): Enumeration => { const d = decodeEnumeration(r, MINT); assert.ok(d.ok, JSON.stringify(d)); return d.value; };
const byAddress = (l: readonly { address: string; reads: readonly (string | null)[] }[] | null, a: string) => l?.find((x) => x.address === a)?.reads;
const b64 = (r: Acc): Buffer => Buffer.from((r.value.data as [string, string])[0], "base64");
const withBytes = (r: Acc, f: (b: Buffer) => Buffer): Acc => { const c = structuredClone(r); c.value.data = [f(b64(r)).toString("base64"), "base64"]; return c; };
const put = (c: Buffer, o: number, n: number, v: bigint): void => { // SYNTHETIC bytes: little-endian two's complement, recoded
  let x = v < 0n ? v + (1n << BigInt(8 * n)) : v;
  for (let k = 0; k < n; k++) { c[o + k] = Number(x & 255n); x >>= 8n; }
};
const at = (b: Buffer, o: number, n: number): bigint => { let v = 0n; for (let k = o + n - 1; k >= o; k--) v = (v << 8n) | BigInt(b[k] as number); return v >= 1n << BigInt(8 * n - 1) ? v - (1n << BigInt(8 * n)) : v; };
const setByte = (r: Acc, o: number, v: number): Acc => withBytes(r, (b) => { const c = Buffer.from(b); c[o] = v; return c; });
const pythAt = (t: number, price?: bigint): Acc => withBytes(A.pyth.a, (b) => { // SYNTHETIC publish_time (and price)
  const c = Buffer.from(b); put(c, 93, 8, BigInt(t)); if (price !== undefined) put(c, 73, 8, price); return c;
});
const wsolOf = (amount: string): Acc => { const c = structuredClone(A.wsol.a); ((c.value.data as Parsed).parsed.info.tokenAmount as { amount: string }).amount = amount; return c; };
const INST = readInstants(SEED, BETA, 4, T, 900);
const iso = (s: number): string => new Date(s * 1000).toISOString();
type Over = { enumeration?: Pair; mint?: Pair | null; pool?: Pair; wsol?: Pair; pyth?: Pair; eve?: Eve };
function rec(i: number, o: Over = {}): ReadingRecord {
  const t = INST[i - 1] as number;
  return readingRecord({ day: "2026-09-27", i, instant: t, read_at: iso(t + 10), enumeration: o.enumeration ?? E,
    mint: o.mint === undefined ? (i === 1 ? A.mint : null) : o.mint, pool: o.pool ?? A.pool, wsol: o.wsol ?? A.wsol,
    pyth: o.pyth ?? same(pythAt(t - 10)), eve: o.eve ?? NO_EVE, anchor: ANCHOR });
}
const END = Math.max(...INST) + 600;
const day = (records: readonly ReadingRecord[], eve: Eve = NO_EVE, now = END) => writeDayBundle({ day: "2026-09-27", seed: SEED,
  beacon: { round: 32554612, signature: BETA }, read_rule: RULE, k_reads: 4, mint: MINT, program: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  decimals: 6, records, eve }, now);
const codeOf = (f: () => unknown): string | undefined => { try { f(); return "none"; } catch (e) { return (e as { code?: string }).code; } };

test("dojo_collect_instants_follow_the_seed_chain", () => {
  assert.equal(seedAnchor(SECRET, 30), H(SECRET, 30));
  for (let j = 1; j <= 30; j++) {
    assert.equal(daySeed(SECRET, 30, j), H(SECRET, 30 - j));
    assert.equal(H(daySeed(SECRET, 30, j), j), seedAnchor(SECRET, 30), "H^j(g_j) = the anchor (mere D-4 l.191)");
  }
  for (const j of [0, 31]) assert.throws(() => daySeed(SECRET, 30, j));
  const oracle = (seed: string, beta: string): number[] => [1, 2, 3, 4].map((i) => T + 900 + Number(BigInt(`0x${sha(Buffer.from(seed, "hex"),
    "dojo-read", Uint8Array.of(i), Buffer.from(beta, "hex")).toString("hex")}`) % 85_500n)).sort((x, y) => x - y);
  assert.deepEqual(INST, oracle(SEED, BETA), "t_i = T_d + O + (SHA-256(g_d || dojo-read || byte(i) || beta) mod (86 400 - O)) (ADR D-5 l.149)");
  assert.ok(INST.every((t) => t >= T + 900 && t < T + 86_400), "offset O = 900 s");
  assert.notDeepEqual(readInstants(SEED, `${BETA.slice(0, 94)}00`, 4, T, 900), INST, "beta enters the draw (M-B1)");
  let n = 0, dup = BETA; // SYNTHETIC betas: the first counter whose four raw values collide
  while (new Set(oracle(SEED, dup)).size === 4) dup = `b7${(++n).toString(16).padStart(94, "0")}`;
  assert.deepEqual(readInstants(SEED, dup, 4, T, 900), oracle(SEED, dup), "duplicates kept: two consecutive readings");
  for (const bad of [`37${BETA.slice(2)}`, `f7${BETA.slice(2)}`, BETA.slice(2), BETA.toUpperCase()]) assert.throws(() => readInstants(SEED, bad, 4, T, 900));
  assert.throws(() => readInstants(SEED, BETA, 4, T + 1, 900), "a day start is a UTC midnight");
});

test("dojo_beacon_round_is_the_first_round_of_the_day", () => {
  assert.equal(beaconRound(T, GENESIS, PERIOD), 32554612, "2026-09-27 (ADR section 1.4 l.68)");
  assert.equal(beaconRound(T + 86_400, GENESIS, PERIOD), 32554612 + 28_800);
  const at = (g: number, p: number, r: number): number => g + (r - 1) * p; // time of round r (report l.84)
  for (const [g, p] of [[GENESIS, PERIOD], [GENESIS + 1, PERIOD], [GENESIS + 2, 7], [1_700_000_001, 30], [T, 3]] as const) {
    const r = beaconRound(T, g, p); // SYNTHETIC genesis and periods: midnight not aligned on a round (M-B2)
    assert.ok(at(g, p, r) >= T && (r === 1 || at(g, p, r - 1) < T), `first round at or after T_d: genesis ${g}, period ${p}`);
  }
  assert.throws(() => beaconRound(T, T + 1, 3));
  assert.throws(() => beaconRound(T + 1, GENESIS, PERIOD));
});

test("dojo_collect_reads_quorum_per_account", () => {
  const ea = dec(E.a), eb = dec(E.b);
  assert.deepEqual(ea.accounts.map((r) => r[0]), [...ACC].sort(byBytes));
  for (const s of accountStatuses([ea, eb], NO_EVE)) {
    const x = entry(s.account), y = infoOf(E.b.value.find((e) => e.pubkey === s.account));
    assert.deepEqual([s.amount, s.cause], [x.tokenAmount.amount, null]);
    assert.deepEqual([x.owner, x.tokenAmount.amount], [y.owner, y.tokenAmount.amount], "the fixture pair is concordant");
  }
  const own = OWNER(H1), two = (r: Enum) => edit(r, TARGET, (i) => { i.owner = own; }); // SYNTHETIC: H1's owner holds two accounts
  const sum = String(BigInt(entry(H1).tokenAmount.amount) + BigInt(entry(TARGET).tokenAmount.amount));
  assert.deepEqual(byAddress(composeAddresses([[dec(two(E.a)), dec(two(E.b))]], NO_EVE), own), [sum], "two concordant accounts: their sum (C-9)");
  const lower = edit(two(E.b), TARGET, (i) => { i.tokenAmount.amount = "1"; });
  assert.deepEqual(byAddress(composeAddresses([[dec(two(E.a)), dec(lower)]], NO_EVE), own), [null], "disagreement: no quorum, never a fall (M-Q2, M-Q10)");
  assert.deepEqual(byAddress(composeAddresses([[dec(two(E.a)), dec(edit(two(E.b), TARGET, null))]], NO_EVE), own), [null], "in one response only (M-Q1)");
  const moved = edit(E.b, H2, (i) => { i.owner = own; }); // SYNTHETIC: same amount, another owner
  assert.deepEqual(accountStatuses([ea, dec(moved)], NO_EVE).find((s) => s.account === H2)?.cause, "disagreement");
  assert.deepEqual(accountStatuses([dec(two(E.a)), dec(lower)], NO_EVE).find((s) => s.account === TARGET)?.cause, "disagreement");
  assert.equal(rec(1, { enumeration: { a: E.a, b: null } }).read.accounts_concordant, 0, "one operator is never a quorum (M-Q1)");
});

test("dojo_address_without_account_reads_zero", () => {
  const own = OWNER(TARGET), closed = (r: Enum) => edit(r, TARGET, null); // SYNTHETIC: TARGET closed, known the eve
  const eve: Eve = { addresses: [own], accounts: [[TARGET, own]] };
  const days = composeAddresses([[dec(closed(E.a)), dec(closed(E.b))], [dec(closed(E.a)), dec(closed(E.b))], [dec(E.a), dec(E.b)]], eve);
  const amount = entry(TARGET).tokenAmount.amount;
  assert.deepEqual(byAddress(days, own), ["0", "0", amount], "a concordant absence reads 0 (C-1, M-Q7)");
  const st = accountStatuses([dec(closed(E.a)), dec(closed(E.b))], eve).find((s) => s.account === TARGET);
  assert.deepEqual([st?.amount, st?.cause], ["0", null]);
  const first: Eve = { addresses: [own], accounts: [] }; // the first day read: addresses of the history only
  assert.deepEqual(byAddress(composeAddresses([[dec(closed(E.a)), dec(closed(E.b))]], first), own), ["0"]);
  const buyer = composeAddresses([[dec(closed(E.a)), dec(closed(E.b))], [dec(E.a), dec(E.b)]], NO_EVE); // SYNTHETIC: bought at reading 2
  assert.deepEqual(byAddress(buyer, own), ["0", amount], "no account before its purchase reads 0 (seventh pli (d), M-Q16)");
  const faulted = composeAddresses([[dec(E.b)], [dec(closed(E.a)), dec(closed(E.b))]], eve);
  assert.deepEqual(byAddress(faulted, own), [null, "0"], "one response missing: null, never 0");
  const b = day([rec(1, { enumeration: both(closed, E), eve }), rec(2, { eve }), rec(3, { eve }), rec(4, { eve })], eve).bundle;
  assert.deepEqual(byAddress(b.addresses, own), ["0", amount, amount, amount], "the bundle carries the 0, the day value is 0");
});

test("dojo_collect_abstains_on_mint_change", () => {
  const m = A.mint.a.value, d = infoOf(E.a.value[0]).tokenAmount.decimals;
  assert.equal(checkMint(m, d), null);
  assert.equal(checkMint(A.mint.b.value, d), null);
  const v = (f: (info: Record<string, unknown>, r: Acc["value"]) => void): Acc => { const c = structuredClone(A.mint.a); f((c.value.data as Parsed).parsed.info, c.value); return c; };
  const ext = (info: Record<string, unknown>) => info.extensions as { extension: string }[];
  const cases: [Acc, string][] = [ // SYNTHETIC variants of the verbatim mint
    [v((i) => { ext(i).push({ extension: "permanentDelegate" }); }), "mint_extensions"], [v((i) => { ext(i).pop(); }), "mint_extensions"],
    [v((i) => { const e = ext(i); e[1] = e[0] as { extension: string }; }), "mint_extensions"], [v((i) => { i.decimals = d + 1; }), "mint_decimals"],
    [v((i) => { i.freezeAuthority = POOL; }), "mint_authority"], [v((i) => { i.mintAuthority = POOL; }), "mint_authority"],
    [v((_, r) => { r.owner = POOL; }), "mint_program"], [v((i) => { delete i.extensions; }), "mint_malformed"]];
  for (const [c, want] of cases) assert.equal(checkMint(c.value, d), want);
  const changed = day([rec(1, { mint: same(cases[0]?.[0]) }), rec(2), rec(3), rec(4)]).bundle;
  assert.deepEqual([changed.status, changed.reason, changed.mint_check, changed.addresses], ["abstained", "mint_changed", "mint_extensions", null], "M-Q4");
  const split = day([rec(1, { mint: { a: A.mint.a, b: cases[0]?.[0] } }), rec(2, { mint: A.mint }), rec(3), rec(4)]).bundle;
  assert.deepEqual([split.status, split.mint_check], ["counted", "ok"], "checked at the first reading with a concordant mint (E-5)");
  const later = day([rec(1), rec(2, { mint: same(cases[0]?.[0]) }), rec(3), rec(4)]).bundle; // SYNTHETIC: reading 2 changed
  assert.deepEqual([later.status, later.mint_check], ["counted", "ok"], "checked once, at the first concordant reading (E-5)");
  const none = day([rec(1, { mint: { a: A.mint.a, b: null } }), rec(2), rec(3), rec(4)]).bundle;
  assert.deepEqual([none.status, none.reason], ["abstained", "mint_unchecked"]);
});

test("dojo_enumeration_refuses_an_unparsed_response", () => {
  const unparsed = structuredClone(E.a); // SYNTHETIC: the parser's base64 fallback on one entry
  (unparsed.value[2] as Entry).account.data = ["AAAA", "base64"];
  const cases: [Enum, string][] = [[unparsed, "enumeration_unparsed"], [edit(E.a, H2, (i) => { i.mint = POOL; }), "enumeration_foreign"],
    [edit(E.a, H2, (i) => { i.state = "uninitialized"; }), "enumeration_state"], [edit(E.a, H2, (i) => { i.tokenAmount.amount = "1.5"; }), "enumeration_value"],
    [edit(E.a, H2, (i) => { i.owner = "0OIl"; }), "enumeration_value"], [{ ...E.a, value: [...E.a.value, E.a.value[0] as Entry] }, "enumeration_malformed"]];
  for (const [r, want] of cases) assert.deepEqual(decodeEnumeration(r, MINT), { ok: false, refusal: want });
  assert.ok(decodeEnumeration(edit(E.a, H2, (i) => { i.state = "frozen"; }), MINT).ok, "frozen is a state of an account (D-2 l.124)");
  const eve: Eve = { addresses: [OWNER(H1)], accounts: [[S165, OWNER(S165)], ["11111111111111111111111111111112", OWNER(H2)]] };
  const r = rec(1, { enumeration: { a: unparsed, b: E.b }, eve }); // M-Q20: a refused response is never an empty enumeration
  assert.deepEqual([r.read.accounts_no_quorum, r.read.accounts_concordant, r.faults.enumeration], [ACC.length + 1, 0, 1],
    "known accounts: the accepted response and the eve (C-V-3)");
  assert.ok(r.no_quorum_accounts.every((x) => x.cause === "fault") && r.enumerations.length === 1);
  assert.deepEqual(readRecord(recordBytes(r)), r, "no_quorum_accounts sorted, eve accounts included (D-7)");
  assert.equal(codeOf(() => readRecord(recordBytes({ ...r, no_quorum_accounts: [...r.no_quorum_accounts].reverse() }))), "record_malformed");
  const b = day([r, rec(2, { eve }), rec(3, { eve }), rec(4, { eve })], eve).bundle;
  assert.ok((b.addresses ?? []).every((x) => x.reads[0] === null), "no account is written 0 at the refused reading");
  assert.equal(new Set([...DOJO_READING_REFUSALS, ...DOJO_BUNDLE_REFUSALS]).size, DOJO_READING_REFUSALS.length + DOJO_BUNDLE_REFUSALS.length);
  assert.ok([...DOJO_READING_REFUSALS, ...DOJO_BUNDLE_REFUSALS].every((c) => !DOJO_VERIFY_REFUSALS.includes(c)), "no verifier code added (mere D-10 l.260)");
});

test("dojo_pool_reserve_adds_virtual_quote_reserves", () => {
  const bytes = b64(A.pool.a);
  assert.ok(bytes.subarray(171, 203).equals(Buffer.from(base58Decode(QUOTE_VAULT))) && b64(A.pool.b).equals(bytes));
  let vqr = 0n; // i128 little-endian at 245..260, recoded
  for (let k = 260; k >= 245; k--) vqr = (vqr << 8n) | BigInt(bytes[k] as number);
  if (vqr >= 1n << 127n) vqr -= 1n << 128n;
  const wsolAmount = BigInt(((A.wsol.a.value.data as Parsed).parsed.info.tokenAmount as { amount: string }).amount);
  const rS = wsolAmount + vqr, rM = BigInt(entry(BASE).tokenAmount.amount);
  assert.equal(rS, 161_206_676_086n, "143 622 170 095 + 17 584 505 991 (ADR section 1.3)");
  assert.deepEqual(rec(1).read.pool_price, red(rS, rM), "r_S counts virtual_quote_reserves (M-Q12)");
  assert.deepEqual(rec(1).pool, { slots: [A.pool.a.context.slot, A.pool.b.context.slot], virtual_quote_reserves: String(vqr),
    quote_slots: [A.wsol.a.context.slot, A.wsol.b.context.slot], quote_amount: String(wsolAmount) });
  const moreVqr = withBytes(A.pool.b, (b) => { const c = Buffer.from(b); c[245] = ((c[245] as number) + 1) % 256; return c; }); // SYNTHETIC
  for (const o of [{ pool: { a: A.pool.a, b: null } }, { pool: { a: A.pool.a, b: moreVqr } }, { wsol: { a: A.wsol.a, b: null } },
    { wsol: { a: A.wsol.a, b: wsolOf("1") } }, { enumeration: { a: E.a, b: edit(E.b, BASE, (i) => { i.tokenAmount.amount = "1"; }) } }]) {
    assert.equal(rec(1, o).read.pool_price, null, `a reserve of one operator only (M-Q8): ${Object.keys(o)[0] ?? ""}`);
  }
  assert.equal(rec(1, { wsol: { a: A.wsol.a, b: null } }).faults.wsol, 1);
  assert.deepEqual(rec(1, { wsol: same(wsolOf(String(2n * rM - vqr))) }).read.pool_price, ["2", "1"], "SYNTHETIC r_S = 2 r_M: reduced (D-8)");
  const wsolVar = (f: (d: Parsed) => void): Acc => { const c = structuredClone(A.wsol.a); f(c.value.data as Parsed); return c; }; // SYNTHETIC
  for (const w of [wsolVar((d) => { d.parsed.info.isNative = false; }), wsolVar((d) => { d.program = "spl-token-2022"; })]) {
    assert.deepEqual(decodeWsol(w, POOL), { ok: false, refusal: "wsol_malformed" }, "native, classic token program (D-4 l.143)");
  }
  const cut = (n: number) => decodePool(withBytes(A.pool.a, (b) => b.subarray(0, n)), MINT, QUOTE_VAULT);
  for (const [n, want] of [[271, String(vqr)], [261, String(vqr)], [245, "0"], [203, "0"]] as const) {
    const p = cut(n);
    assert.equal(p.ok ? p.value.virtual_quote_reserves : p.refusal, want, `length ${n}`);
  }
  for (const n of [260, 246, 202]) assert.deepEqual(cut(n), { ok: false, refusal: "pool_length" });
  for (const [r, want] of [[setByte(A.pool.a, 260, 0xff), "pool_reserves_negative"], [setByte(A.pool.a, 0, 0), "pool_discriminant"],
    [setByte(A.pool.a, 50, 0), "pool_mints"], [setByte(A.pool.a, 90, 0), "pool_mints"], [setByte(A.pool.a, 180, 0), "pool_vault"]] as const) {
    assert.deepEqual(decodePool(r, MINT, QUOTE_VAULT), { ok: false, refusal: want });
  }
  const foreign = structuredClone(A.pool.a); foreign.value.owner = POOL;
  assert.deepEqual(decodePool(foreign, MINT, QUOTE_VAULT), { ok: false, refusal: "pool_owner" });
  assert.deepEqual(decodeWsol(A.wsol.a, MINT), { ok: false, refusal: "wsol_malformed" });
  const p = concord(A.pool, (x) => decodePool(x, MINT, QUOTE_VAULT)).value;
  assert.equal(poolPrice(p, null, accountStatuses([dec(E.a), dec(E.b)], NO_EVE)), null);
});

test("dojo_sol_usd_needs_a_full_fresh_feed", () => {
  const b = b64(A.pyth.a), price = at(b, 73, 8), publish = Number(at(b, 93, 8));
  assert.deepEqual([price, Number(at(b, 89, 4)), publish], [12_163_640_373n, -8, 1_790_476_108], "FAITS probe-12 P2-c, recoded offsets");
  const p = decodePyth(A.pyth.a);
  assert.ok(p.ok && b64(A.pyth.b).equals(b));
  assert.deepEqual(solUsd(p.value, publish + 100, publish + 200, 165), { usd_per_sol: red(price, 10n ** 8n), publish_time: publish });
  assert.equal(solUsd(p.value, publish + 165, publish + 200, 165).publish_time, publish, "165 s at most (ADR D-3 l.132)");
  assert.deepEqual(solUsd(p.value, publish + 166, publish + 200, 165), { usd_per_sol: null, publish_time: null }, "stale (M-Q14)");
  assert.equal(solUsd(p.value, publish - 10, publish - 1, 165).usd_per_sol, null, "published after the read");
  const foreign = structuredClone(A.pyth.a); foreign.value.owner = POOL;
  for (const [r, want] of [[setByte(A.pyth.a, 40, 0), "pyth_partial"], [foreign, "pyth_owner"], [setByte(A.pyth.a, 50, 0), "pyth_feed"],
    [setByte(A.pyth.a, 0, 0), "pyth_discriminant"], [withBytes(A.pyth.a, (x) => x.subarray(0, 133)), "pyth_length"], [pythAt(publish, 0n), "pyth_price"],
    [withBytes(A.pyth.a, (x) => { const c = Buffer.from(x); put(c, 89, 4, 1n); return c; }), "pyth_exponent"]] as const) {
    assert.deepEqual(decodePyth(r), { ok: false, refusal: want });
  }
  const t = INST[0] as number;
  assert.deepEqual(rec(1).read.usd_per_sol, red(price, 10n ** 8n));
  for (const [x, why] of [[setByte(pythAt(t - 10), 40, 0), "Partial (M-Q14)"], [pythAt(t - 166), "stale (M-Q14)"],
    [setByte(pythAt(t - 10), 50, 0), "another feed (M-Q15)"], [{ ...foreign, value: { ...foreign.value, data: pythAt(t - 10).value.data } }, "another owner (M-Q15)"]] as const) {
    assert.deepEqual([rec(1, { pyth: same(x) }).read.usd_per_sol, rec(1, { pyth: same(x) }).read.usd_per_sol_publish_time], [null, null], why);
  }
  assert.equal(rec(1, { pyth: { a: pythAt(t - 10), b: pythAt(t - 11) } }).read.usd_per_sol, null, "bytes differ: no quorum");
  const s = rec(1, { pyth: { a: { ...pythAt(t - 10), context: { slot: 1 } }, b: { ...pythAt(t - 10), context: { slot: 2 ** 40 } } } }).read; // SYNTHETIC slots
  assert.deepEqual([s.slot_min, s.slot_max, s.usd_per_sol], [1, 2 ** 40, red(price, 10n ** 8n)], "the Pyth slots enter slot_min and slot_max");
});

test("dojo_day_prices_are_the_minimum_of_concordant_readings", () => {
  const q = ["300000000000", "100000000000", "200000000000"], px = [13_000_000_000n, 12_000_000_000n, 14_000_000_000n]; // SYNTHETIC
  const at = (i: number) => (INST[i] as number) - 10;
  const b = day([rec(1, { wsol: same(wsolOf(q[0] as string)), pyth: same(pythAt(at(0), px[0])) }), rec(2, { wsol: same(wsolOf(q[1] as string)), pyth: same(pythAt(at(1), px[1])) }),
    rec(3, { wsol: same(wsolOf(q[2] as string)), pyth: same(pythAt(at(2), px[2])) }), rec(4, { enumeration: { a: E.a, b: edit(E.b, BASE, null) }, pyth: same(pythAt(T)) })]).bundle;
  const vqr = 17_584_505_991n, rM = BigInt(entry(BASE).tokenAmount.amount);
  assert.deepEqual(b.pool_price_daily, red(100_000_000_000n + vqr, rM), "pi_d = smallest concordant reading price (M-Q9)");
  assert.deepEqual(b.usd_per_sol_daily, red(12_000_000_000n, 10n ** 8n), "sigma_d = smallest fresh reading (M-Q9)");
  assert.deepEqual([b.reads[3]?.pool_price, b.reads[3]?.usd_per_sol], [null, null], "reading 4: base account without quorum, stale feed");
});

test("dojo_bundle_carries_no_operator_label_and_no_secret", () => {
  const recs = [rec(1), rec(2), rec(3), rec(4)], out = day(recs);
  const all = out.bytes + recs.map(recordBytes).join("") + ["enumeration.json", "accounts.json", "provenance.json"].map(text).join("");
  for (const [domain, op] of Object.entries(OPERATOR_OF_DOMAIN)) for (const w of [domain, op, domain.split(".")[0] as string]) assert.ok(!all.includes(w), w);
  assert.ok(!/api[-_]?key|apiVersion|foundation/i.test(all));
  assert.ok(!all.includes(SECRET) && [0, 1, 2, 4, 5].every((j) => !all.includes(H(SECRET, 30 - j))), "only g_d is revealed");
  assert.equal(out.bundle.seed, H(SECRET, 27));
  assert.equal(codeOf(() => day(recs, NO_EVE, END - 1)), "day_not_ended", "seed and instants never written before the end of the reading day (M-Q5)");
  const abst = (now: number) => writeDayBundle({ day: "2026-09-27", seed: SEED, beacon: null, read_rule: RULE, k_reads: 4, mint: MINT,
    program: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", decimals: 6, records: [], eve: NO_EVE }, now).bundle;
  assert.deepEqual([abst(T + 86_400).status, abst(T + 86_400).reason, abst(T + 86_400).reads], ["abstained", "beacon_unavailable", []]);
  assert.equal(codeOf(() => abst(T + 86_399)), "day_not_ended", "a day without beacon ends at T_{d+1}");
  assert.equal(codeOf(() => writeDayBundle({ day: "2026-09-27", seed: SEED, beacon: { round: 32554613, signature: BETA }, read_rule: RULE, k_reads: 4,
    mint: MINT, program: "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", decimals: 6, records: recs, eve: NO_EVE }, END)), "bundle_input_malformed", "r_d + 1 (M-B2)");
});

test("dojo_bundle_round_trips_through_its_reader", () => {
  const eve: Eve = { addresses: [OWNER(H1)], accounts: [[TARGET, OWNER(TARGET)], [VAULT_LOCK, OWNER(VAULT_LOCK)]] };
  const recs = [rec(1, { eve }), rec(2, { eve, enumeration: { a: null, b: E.b } }), rec(3, { eve }), rec(4, { eve })], texts = recs.map(recordBytes);
  const out = day(recs, eve);
  assert.deepEqual(readDayBundle(out.bytes, { records: texts, eve }), out.bundle);
  assert.equal(`${JSON.stringify(JSON.parse(out.bytes))}\n`.length, out.bytes.length);
  recs.forEach((r, j) => assert.deepEqual(readRecord(texts[j] as string), r));
  assert.equal(out.bundle.records_sha256[1], sha(texts[1] as string).toString("hex"));
  assert.deepEqual(byAddress(out.bundle.addresses, OWNER(H1))?.[1], null, "reading 2 faulted");
  const obj = JSON.parse(out.bytes) as Record<string, unknown>;
  assert.equal(codeOf(() => readDayBundle(`${JSON.stringify({ ...obj, extra: 1 })}\n`)), "bundle_malformed");
  const canon = (o: unknown): string => `${canonical(o)}\n`, r0 = JSON.parse(texts[0] as string) as Record<string, unknown>;
  for (const [f, t, code] of [[readDayBundle, obj, "bundle_malformed"], [readRecord, r0, "record_malformed"]] as const) {
    assert.equal(codeOf(() => f(canon({ ...t, extra: 1 }))), code, "an extra key in canonical bytes (closed keys, D-7)");
    assert.equal(codeOf(() => f(`${JSON.stringify(t, null, 1)}\n`)), code, "the exact keys in bytes not canonical (D-7)");
  }
  assert.equal(codeOf(() => readDayBundle(canon({ ...obj, pool_price_daily: ["2", "2"] }))), "bundle_malformed", "a fraction not reduced (D-8)");
  assert.equal(codeOf(() => readRecord(canon({ ...r0, read: { ...(r0.read as object), usd_per_sol: ["10", "10"] } }))), "record_malformed");
  assert.equal(codeOf(() => readDayBundle(out.bytes.replace("\"counted\"", "\"abstained\""))), "bundle_malformed");
  assert.equal(codeOf(() => readRecord(texts[0]?.replace("\"schema\"", "\"extra\":1,\"schema\"") ?? "")), "record_malformed");
  const lie = out.bytes.replace(`"${String(byAddress(out.bundle.addresses, OWNER(H1))?.[0])}"`, "\"1\"");
  assert.notEqual(lie, out.bytes);
  assert.equal(codeOf(() => readDayBundle(lie, { records: texts, eve })), "bundle_records_mismatch");
  assert.equal(codeOf(() => readDayBundle(out.bytes, { records: texts, eve: NO_EVE })), "bundle_records_mismatch");
  assert.equal(codeOf(() => readDayBundle(out.bytes, { records: [texts[1] as string, ...texts.slice(1)], eve })), "bundle_records_mismatch");
});

test("dojo_bundle_counts_accounts_without_quorum_at_every_read", () => {
  const x = (r: Enum) => edit(r, H2, (i) => { i.tokenAmount.amount = "7"; }), y = (r: Enum) => edit(r, S165, (i) => { i.tokenAmount.amount = "9"; }); // SYNTHETIC
  const xy: Pair = { a: E.a, b: y(x(E.b)) };
  const recs = [rec(1, { enumeration: xy }), rec(2, { enumeration: xy }), rec(3, { enumeration: xy }), rec(4, { enumeration: { a: E.a, b: x(E.b) } })];
  assert.deepEqual(recs[0]?.no_quorum_accounts, [H2, S165].sort(byBytes).map((account) => ({ account, cause: "disagreement" })));
  assert.deepEqual(recs.map((r) => r.read.accounts_no_quorum), [2, 2, 2, 1]);
  assert.deepEqual(day(recs).bundle.accounts_no_quorum_persistent, [{ account: H2 }], "at each of the K readings (M-Q22)");
  const late = [rec(1, { enumeration: { a: E.a, b: y(E.b) } }), rec(2, { enumeration: xy }), rec(3, { enumeration: xy }), rec(4, { enumeration: xy })];
  assert.deepEqual(day(late).bundle.accounts_no_quorum_persistent, [{ account: S165 }], "reading 1 counts too (M-Q22)");
  const fault = [rec(1, { enumeration: { a: E.a, b: x(E.b) } }), rec(2, { enumeration: { a: E.a, b: x(E.b) } }), rec(3, { enumeration: { a: E.a, b: x(E.b) } }),
    rec(4, { enumeration: { a: null, b: E.b } })];
  assert.deepEqual(fault[3]?.no_quorum_accounts.map((n) => n.cause), ACC.map(() => "fault"));
  assert.deepEqual(day(fault).bundle.accounts_no_quorum_persistent, [], "a fault is not a disagreement (checkpoint-1 verdict (5))");
  const N = { a: null, b: null }, M = { day: "2026-09-27", i: 4, instant: INST[3] as number, read_at: null, mint: null, pool: N, wsol: N, pyth: N, anchor: ANCHOR };
  const miss = readingRecord({ ...M, enumeration: N, eve: { addresses: [], accounts: [[H2, OWNER(H2)]] } }); // SYNTHETIC: a reading not made
  assert.deepEqual([miss.no_quorum_accounts, Object.values(miss.faults)], [[{ account: H2, cause: "missed" }], [0, 0, 0, 0, 0]], "missed, never an operator fault (M-Q23)");
  assert.deepEqual(readRecord(recordBytes(miss)), miss);
  for (const bad of [recordBytes(miss).replace("\"missed\"", "\"fault\""), recordBytes({ ...miss, faults: { ...miss.faults, pool: 2 } }),
    recordBytes(recs[0]).replaceAll("\"disagreement\"", "\"missed\"")]) assert.equal(codeOf(() => readRecord(bad)), "record_malformed", "cause and read_at tied (M-Q23)");
  assert.equal(codeOf(() => readingRecord({ ...M, enumeration: E, eve: NO_EVE })), "bundle_input_malformed", "a missed reading carries no response");
});
