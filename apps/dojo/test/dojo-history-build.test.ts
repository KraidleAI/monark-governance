// MONARK Dojo -- PR-2b-2 oracles (ADR-DOJO-PR-2B section 4 l.573-582): reconstruction of the history, day values, windows without
// quorum, the rule inside a slot, supply per day, the enumeration check, lines and the bundle. Inputs: the SIG0 pair of fixtures/history/
// (admitted by PR-2b-1's admit) and SYNTHETIC events declared at their use: raw bodies recoded here and admitted by admit(), and the reading
// records of the first day read written by PR-2's writer (readingRecord, recordBytes), never by hand (C-29). Expected day values are
// recoded here from the event lists (minimum of the start of the day and of the balances after each transaction; grid of M-H1 recoded),
// never read from the module under test. No network, no clock.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { assertNoCloseLike, canonical } from "../../bell/scripts/bell-chain.mjs";
import { OPERATOR_OF_DOMAIN } from "../../bell/src/operators.ts";
import { ownerClass, rootOf, stepLots } from "../scripts/dojo-core.mjs";
import { DOJO_VERIFY_REFUSALS } from "../scripts/dojo-verify.mjs";
import { readingRecord, recordBytes } from "../src/bundle.ts";
import { admit, dayOf, type Body, type NoQuorum } from "../src/history-read.ts";
import { DOJO_HISTORY_BUILD_STOPS, DOJO_HISTORY_FIRST_DAY, buildHistory, historyBundle, type HistoryBuild } from "../src/history-build.ts";

const dir = new URL("./fixtures/history/", import.meta.url);
const hexFx = (name: string): unknown => JSON.parse(Buffer.from(JSON.parse(readFileSync(new URL(name, dir), "utf8")) as string, "hex").toString("utf8"));
const MINT = (JSON.parse(readFileSync(new URL("sources.json", dir), "utf8")) as { mint: string }).mint;
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const EXPECT = hexFx("probe3-expect.json") as { sig0: string; slot: number; blockTime: number };
const sha = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const b58 = (b: Buffer): string => { let n = BigInt(`0x${b.toString("hex")}`), s = ""; for (; n > 0n; n /= 58n) s = `${B58[Number(n % 58n)] ?? ""}${s}`; for (const x of b) { if (x !== 0) break; s = `1${s}`; } return s; };
/** SYNTHETIC 32-byte addresses; an owner is drawn on the curve (holder) or off it (program) by PR-1a's ownerClass. */
const key = (label: string, klass?: "holder" | "program"): string => {
  for (let i = 0; ; i++) { const k = b58(createHash("sha256").update(`${label}/${i}`).digest()); if (klass === undefined || ownerClass(k) === klass) return k; }
};
let seq = 0;
const SIG = (): string => { let n = ++seq, s = ""; for (let i = 0; i < 8; i++, n = Math.floor(n / 58)) s = `${B58[n % 58] ?? ""}${s}`; return `${"S".repeat(80)}${s}`; };
const at = (d: number, s = 3600): number => Date.UTC(2026, 8, 9 + d) / 1000 + s; // day 1 = 2026-09-10 (mere D-18), recoded
const dn = (d: number): string => new Date(Date.UTC(2026, 8, 9 + d)).toISOString().slice(0, 10);
const code = (f: () => unknown): string | undefined => { try { f(); return undefined; } catch (e) { return (e as { code?: string }).code; } };

// SYNTHETIC raw getTransaction bodies (jsonParsed form read by readBody): mint entries [account, pre, post, owner, post owner?] (null =
// absent entry), Token-2022 supply instructions on the mint; admitted by admit() on two identical sides unless a test says otherwise.
type Mv = readonly [account: string, pre: string | null, post: string | null, owner: string, postOwner?: string];
type Raw = Record<string, unknown>;
const raw = (slot: number, bt: number | null, rank: number | null, mv: readonly Mv[], supply: readonly (readonly [string, string])[] = [], sig = SIG()): Raw => {
  const keys = [...new Set(mv.map((m) => m[0]))];
  const bal = (post: boolean): unknown[] => mv.flatMap(([a, p, q, o, o2]) => { const v = post ? q : p; return v === null ? []
    : [{ accountIndex: keys.indexOf(a), mint: MINT, owner: post ? (o2 ?? o) : o, programId: T22, uiTokenAmount: { amount: v } }]; });
  return { slot, blockTime: bt, ...(rank === null ? {} : { transactionIndex: rank }), meta: { err: null, preTokenBalances: bal(false), postTokenBalances: bal(true), innerInstructions: [] },
    transaction: { signatures: [sig], message: { accountKeys: keys.map((pubkey) => ({ pubkey, source: "transaction" })),
      instructions: supply.map(([type, amount]) => ({ programId: T22, parsed: { type, info: { mint: MINT, amount } } })) } } };
};
const sigOf = (r: Raw): string => (r.transaction as { signatures: string[] }).signatures[0] ?? "";
const ok = (a: Raw, b: Raw = a): Body => { const x = admit(sigOf(a), a, b, MINT); assert.equal(x.kind, "admitted"); return (x as { tx: Body }).tx; };
const tx = (...p: Parameters<typeof raw>): Body => ok(raw(...p));
/** A read without quorum: the two sides of one signature differ (D-6 table, first row). */
const nq = (slot: number, bt: number | null, a: readonly Mv[], b: readonly Mv[]): NoQuorum => {
  const s = SIG(), x = admit(s, raw(slot, bt, 1, a, [], s), raw(slot, bt, 1, b, [], s), MINT);
  assert.ok(x.kind === "no_quorum");
  return x;
};

// The first day read, written by PR-2's writer (TU-1h): reading 1 carries one enumeration (the other side faulted), reading 2 both (a at
// its slot, b at its slot): (ii) must use reading 2.
type Row = readonly [account: string, owner: string, amount: string];
type Resp = readonly [slot: number, rows: readonly Row[]];
const gpa = ([slot, rows]: Resp): unknown => ({ context: { slot }, value: rows.map(([pubkey, owner, amount]) => ({ pubkey, account: { data: { program: "spl-token-2022",
  parsed: { type: "account", info: { mint: MINT, owner, state: "initialized", tokenAmount: { amount, decimals: 6 } } } } } })) });
const NONE = { a: null, b: null };
const ANCHOR = { mint: MINT, pool: key("pool"), pool_quote_vault: key("vault"), sol_usd_max_age_s: 165 };
const first = (day: number, a: Resp, b: Resp = a): string[] => [1, 2].map((i) => recordBytes(readingRecord({ day: dn(day), i, instant: at(day, 900 * i),
  read_at: new Date(at(day, 900 * i + 5) * 1000).toISOString(), enumeration: i === 1 ? { a: gpa(a), b: null } : { a: gpa(a), b: gpa(b) }, mint: null,
  pool: NONE, wsol: NONE, pyth: NONE, eve: { addresses: [], accounts: [] }, anchor: ANCHOR })));
const build = (txs: readonly Body[], records: readonly string[], noQuorum: readonly NoQuorum[] = []): HistoryBuild => buildHistory({ txs, noQuorum, records });
type Line = { address: string; class: string; day: string; day_value: string | null };
const parse = (h: HistoryBuild): Line[] => h.lines.map((l) => JSON.parse(l) as Line);
/** The published values of an address, day 1 to D_LAST: its day_value, or "-" when it has no line. */
const path = (h: HistoryBuild, a: string): (string | null)[] => {
  const L = parse(h), n = (Date.parse(`${h.history_last_day}T00:00:00Z`) - Date.UTC(2026, 8, 10)) / 86_400_000 + 1;
  return Array.from({ length: n }, (_, i) => { const l = L.find((x) => x.address === a && x.day === dn(i + 1)); return l === undefined ? "-" : l.day_value; });
};
const byBytes = (x: string, y: string): number => Buffer.compare(Buffer.from(x), Buffer.from(y));
const mintZ = (Z: string, P: string, amount = "1000"): Body => tx(100, at(1), 1, [[Z, null, amount, P]], [["mintTo", amount]]);

// SYNTHETIC world: a mint to a program-owned reserve Z, two buys, a move between the two accounts of H1, an owner change of X2 (H1 -> H2),
// a burn and close of X1; first day read = day 7, D_LAST = day 6.
const [P, H1, H2, H3] = [key("P", "program"), key("H1", "holder"), key("H2", "holder"), key("H3", "holder")];
const [Z, X1, X2, Y] = ["Z", "X1", "X2", "Y"].map((l) => key(`acc-${l}`)) as [string, string, string, string];
const world = (): Body[] => [mintZ(Z, P),
  tx(200, at(2), 1, [[Z, "1000", "700", P], [X1, null, "300", H1]]),
  tx(201, at(2, 7200), 1, [[Z, "700", "500", P], [Y, null, "200", H2]]),
  tx(300, at(3), 1, [[X1, "300", "200", H1], [X2, null, "100", H1]]),
  tx(400, at(4), 1, [[X2, "100", "100", H1, H2]]),
  tx(500, at(5), 1, [[X1, "200", null, H1]], [["burn", "200"]])];
const WORLD_ROWS: Row[] = [[Z, P, "500"], [X2, H2, "100"], [Y, H2, "200"]];
const worldHistory = (): HistoryBuild => build(world(), first(7, [700, WORLD_ROWS]));

test("dojo_history_rebuilds_balances_from_transactions", () => {
  // probe fixture: SIG0 admitted by both sides; the curve account holds 10^15 from day 1 (a program address, mere D-6)
  const [a, b] = [hexFx("sig0.a.json") as Raw, hexFx("sig0.b.json") as Raw], sig0 = ok(a, b), e = sig0.mint[0];
  assert.ok(e !== undefined && e.owner !== null && sig0.blockTime !== null);
  assert.equal(dayOf(sig0.blockTime), DOJO_HISTORY_FIRST_DAY, "day 1 = the day of SIG0");
  const h0 = build([sig0], first(3, [EXPECT.slot + 10, [[e.account, e.owner, e.amount]]]));
  assert.deepEqual(parse(h0), [{ address: e.owner, class: "program", day: "2026-09-11", day_value: "1000000000000000" }], "day 1 = 0: no line; the bonding curve is off the curve");
  assert.deepEqual(h0.eve, { addresses: [e.owner], accounts: [] });
  // synthetic world, recoded minima (start of the day and after each transaction):
  // P: d1 min(0, 1000) = 0; d2 min(1000, 700, 500) = 500; then 500. H1: d2 bought (0); d3 min(300, 300) (move between its two accounts);
  // d4 min(300, 200) (owner change of X2); d5 min(200, 0) = 0 (burn and close: a closed account is 0, mere C-1), exit line; d6 no line.
  // H2: d2 bought (0); d3 200; d4 min(200, 300); d5 300; d6 300.
  const want = [[2, P, "500"], [3, P, "500"], [3, H1, "300"], [3, H2, "200"], [4, P, "500"], [4, H1, "200"], [4, H2, "200"],
    [5, P, "500"], [5, H1, "0"], [5, H2, "300"], [6, P, "500"], [6, H2, "300"]] as const;
  const h = worldHistory();
  assert.deepEqual(parse(h), [...want].sort((p, q) => p[0] - q[0] || byBytes(p[1], q[1]))
    .map(([d, o, v]) => ({ address: o, class: o === P ? "program" : "holder", day: dn(d), day_value: v })));
  assert.deepEqual([h.token_accounts, h.addresses, h.transactions_admitted, h.missing_address_days], [4, 3, 6, 0]);
  assert.equal(build([...world()].reverse(), first(7, [700, WORLD_ROWS])).bytes, h.bytes, "the input order changes no byte (D-3 determinism)");
});

test("dojo_history_day_value_is_the_day_minimum", () => {
  // SYNTHETIC: H buys on day 2, sells 60 and rebuys 80 on day 3, buys, sells all and rebuys on day 4, round trip on day 5.
  const H = key("H-min", "holder"), A = key("acc-A");
  const h = build([mintZ(Z, P),
    tx(200, at(2), 1, [[Z, "1000", "900", P], [A, null, "100", H]]),
    tx(300, at(3), 1, [[A, "100", "40", H], [Z, "900", "960", P]]), tx(301, at(3, 7200), 1, [[Z, "960", "880", P], [A, "40", "120", H]]),
    tx(400, at(4), 1, [[Z, "880", "850", P], [A, "120", "150", H]]), tx(401, at(4, 7200), 1, [[A, "150", "0", H], [Z, "850", "1000", P]]),
    tx(402, at(4, 9000), 1, [[Z, "1000", "950", P], [A, "0", "50", H]]),
    tx(500, at(5), 1, [[Z, "950", "940", P], [A, "50", "60", H]]), tx(501, at(5, 7200), 1, [[A, "60", "50", H], [Z, "940", "950", P]])],
  first(6, [600, [[Z, P, "950"], [A, H, "50"]]]));
  // (E2) day 1 = 0; (E1) the buy day is worth the balance before (0); (E3) a drop of a few hours counts (min 40, not 120 at the end,
  // not 100 at the start); d4 min(120, 150, 0, 50) = 0; (E4) d5 round trip min(50, 60, 50) = 50
  assert.deepEqual(path(h, H), ["-", "-", "40", "0", "50"]);
  assert.deepEqual(path(h, P), ["-", "900", "880", "850", "940"]);
  // (E1) the lot of the day-2 buy is born on day 3 (stepLots of PR-1a over the published series)
  let lots: [string, number][] = [];
  const s = path(h, H).map((v) => (v === "-" ? "0" : v));
  s.forEach((v, i) => { lots = stepLots(lots, i + 1, v); if (i === 2) assert.deepEqual(lots, [["40", 3]]); });
  assert.deepEqual(lots, [["50", 5]]);
});

test("dojo_history_supply_check_holds_each_day", () => {
  // SYNTHETIC: A of H is read without quorum on day 3; the next admitted transaction on A (day 4) reveals its balance
  const H = key("H-sup", "holder"), A = key("acc-S");
  const base = [mintZ(Z, P), tx(200, at(2), 1, [[Z, "1000", "900", P], [A, null, "100", H]])];
  const hole = (): NoQuorum => nq(300, at(3), [[A, "100", "100", H]], [[A, "100", "99", H]]);
  const close = (pre: string, post: string): Body => tx(400, at(4), 1, [[A, pre, post, H], [Z, "900", "910", P]]);
  // the window hides nothing: days 3 and 4 are null for H, every evaluable day balances
  const h = build([...base, close("100", "90")], first(6, [600, [[Z, P, "910"], [A, H, "90"]]]), [hole()]);
  assert.deepEqual(path(h, H), ["-", "-", null, null, "90"]);
  // the window hides a mint of 500 (an unparsed instruction the D-6 supply stop cannot see, Q-6 dated line): the enumeration agrees
  // with the reconstruction, the supply of the day of the closing transaction does not
  const hid = (): HistoryBuild => build([...base, close("600", "590")], first(6, [600, [[Z, P, "910"], [A, H, "590"]]]), [hole()]);
  assert.equal(code(hid), "supply_mismatch");
  assert.throws(hid, /2026-09-13: balances 1500, supply 1000/);
  // D_LAST must be evaluable: a window open at the end of day 5 (closed on the first day read) stops
  const late = (): HistoryBuild => build([...base, tx(550, at(6), 1, [[A, "100", "90", H], [Z, "900", "910", P]])], first(6, [600, [[Z, P, "910"], [A, H, "90"]]]),
    [nq(500, at(5), [[A, "100", "100", H]], [[A, "100", "98", H]])]);
  assert.equal(code(late), "supply_mismatch");
  assert.throws(late, /not evaluable/);
});

// SYNTHETIC: H holds A (100) and B (50); A is read without quorum on day 3, one side naming H3 as its owner; the next admitted
// transaction on A is on day 5.
const HW = key("H-win", "holder"), AW = key("acc-WA"), BW = key("acc-WB");
const windowTxs = (): Body[] => [mintZ(Z, P), tx(200, at(2), 1, [[Z, "1000", "900", P], [AW, null, "100", HW]]),
  tx(201, at(2, 7200), 1, [[Z, "900", "850", P], [BW, null, "50", HW]]), tx(500, at(5), 1, [[AW, "100", "80", HW], [Z, "850", "870", P]])];
const windowHole = (): NoQuorum => nq(300, at(3), [[AW, "100", "100", HW]], [[AW, "100", "100", H3]]);
const WINDOW_ROWS: Row[] = [[Z, P, "870"], [AW, HW, "80"], [BW, HW, "50"]];

test("dojo_history_no_quorum_span_until_next_quorum_read", () => {
  const h = build(windowTxs(), first(7, [700, WINDOW_ROWS]), [windowHole()]);
  // inclusive from the day of the read without quorum to the day of the next admitted one (M-Y11); the whole address, its account B
  // outside the window included (mere C-9, M-Y12); the owner named by one body too (D-6 l.342); Z is outside the window
  assert.deepEqual(path(h, HW), ["-", "-", null, null, null, "130"]);
  assert.deepEqual(path(h, H3), ["-", "-", null, null, null, "-"]);
  assert.deepEqual(path(h, P), ["-", "850", "850", "850", "850", "870"]);
  assert.equal(h.missing_address_days, 6);
  // a window still open at the enumeration: no admitted transaction on B after its read without quorum (D-6 l.343)
  const openB = nq(650, at(6), [[BW, "50", "50", HW]], [[BW, "50", "49", HW]]);
  assert.equal(code(() => build(windowTxs(), first(7, [700, WINDOW_ROWS]), [windowHole(), openB])), "no_quorum_unbounded");
  // a window closed after one enumeration response (E = 660 inside [650, 680)): (ii) is not verifiable at 660
  const txs = [...windowTxs(), tx(680, at(7), 1, [[AW, "80", "70", HW], [Z, "870", "880", P]])];
  const rows680: Row[] = [[Z, P, "880"], [AW, HW, "70"], [BW, HW, "50"]];
  assert.equal(code(() => build(txs, first(7, [660, WINDOW_ROWS], [700, rows680]), [nq(650, at(6), [[AW, "80", "80", HW]], [[AW, "80", "81", HW]])])), "no_quorum_unbounded");
  assert.doesNotThrow(() => build(txs, first(7, [660, WINDOW_ROWS], [700, rows680]), [windowHole()]));
  // no day read for the read without quorum (no blockTime in either body): the window cannot be placed
  assert.equal(code(() => build(windowTxs(), first(7, [700, WINDOW_ROWS]), [nq(300, null, [[AW, "100", "100", HW]], [[AW, "100", "100", H3]])])), "no_quorum_unbounded");
  // SYNTHETIC scenarios of the G2 (C-G2-1, C-G2-2): O holds A (100 from day 2); A is read without quorum on day 3; expected paths recoded.
  const [O, Q, Q2, O3] = ["sO", "sQ", "sQ2", "sO3"].map((l) => key(l, "holder")) as [string, string, string, string], [A, B] = [key("acc-sA"), key("acc-sB")];
  const hold = (): Body[] => [mintZ(Z, P), tx(150, at(1, 7200), 1, [[Z, "1000", "900", P], [A, null, "100", O]])];
  // S1: an admitted transaction on A shares the slot of the read without quorum (its order is unknown): it does not close the window
  const s1 = build([...hold(), tx(300, at(3), 2, [[A, "100", "90", O], [Z, "900", "910", P]]), tx(500, at(5), 1, [[A, "90", "80", O], [Z, "910", "920", P]])],
    first(7, [700, [[Z, P, "920"], [A, O, "80"]]]), [nq(300, at(3), [[A, "90", "90", O]], [[A, "90", "91", O]])]);
  assert.deepEqual(path(s1, O), ["-", "100", null, null, null, "80"]);
  // S7: the bodies name Q only and empty A; the closing transaction re-creates A for O3 (no pre entry): the last admitted owner O is null
  // over the window, Z (touched by the bodies) too; O3 owns A from the close on: null on day 5 only (D-3 l.290)
  const s7 = build([...hold(), tx(500, at(5), 1, [[A, null, "50", O3], [Z, "1000", "950", P]])], first(7, [700, [[Z, P, "950"], [A, O3, "50"]]]),
    [nq(300, at(3), [[A, "100", "100", Q], [Z, "900", "900", P]], [[A, "100", "0", Q], [Z, "900", "1000", P]])]);
  assert.deepEqual([path(s7, O), path(s7, O3), path(s7, Q), path(s7, P)], [["-", "100", null, null, null, "0"], ["-", "-", "-", "-", null, "50"],
    ["-", "-", null, null, null, "-"], ["-", "900", null, null, null, "950"]]);
  // S3': Q2 sells all of B on day 4, inside the window of A; the closing slot (day 5) gives A to Q2, who then sells 10 in the same slot:
  // Q2 owns A only from the close, so its day-4 sale is published (line 0, the lot leaves) and only day 5 is null (D-3 l.290, D-7 l.356)
  const s3 = build([...hold(), tx(160, at(1, 7300), 1, [[Z, "900", "800", P], [B, null, "100", Q2]]), tx(400, at(4), 1, [[B, "100", "0", Q2], [Z, "800", "900", P]]),
    tx(500, at(5), 1, [[A, "100", "100", O, Q2]]), tx(500, at(5), 2, [[A, "100", "90", Q2], [Z, "900", "910", P]])],
  first(7, [700, [[Z, P, "910"], [A, Q2, "90"], [B, Q2, "0"]]]), [nq(300, at(3), [[A, "100", "100", O]], [[A, "100", "99", O]])]);
  assert.deepEqual([path(s3, Q2), path(s3, O)], [["-", "100", "100", "0", null, "90"], ["-", "100", null, null, null, "0"]]);
  let lots: [string, number][] = [];
  path(s3, Q2).forEach((v, i) => { if (v !== "-") lots = stepLots(lots, i + 1, v); if (i === 3) assert.deepEqual(lots, []); });
  assert.deepEqual(lots, [["90", 6]], "the lot of day 2 left on day 4, a new one is born on day 6");
  // S8: the closing transaction reveals A held by Q2 (moved inside the window): its pre side is null over the whole window (D-6 l.342)
  const s8 = build([...hold(), tx(160, at(1, 7300), 1, [[Z, "900", "800", P], [B, null, "100", Q2]]), tx(400, at(4), 1, [[B, "100", "0", Q2], [Z, "800", "900", P]]),
    tx(500, at(5), 1, [[A, "100", "100", Q2]])], first(7, [700, [[Z, P, "900"], [A, Q2, "100"]]]), [nq(300, at(3), [[A, "100", "100", O]], [[A, "100", "99", O]])]);
  assert.deepEqual(path(s8, Q2), ["-", "100", null, null, null, "100"]);
  // S6: two bodies without quorum: one blockTime per slot, whatever the quorum ((v), dated line D-8); at two slots, the window starts on
  // the earliest day read (D-6 l.341)
  const two = (slot: number, d: number): NoQuorum[] => {
    const s = SIG(), x = admit(s, raw(300, at(3), 1, [[A, "100", "100", O]], [], s), raw(slot, at(d), 1, [[A, "100", "100", O]], [], s), MINT);
    assert.ok(x.kind === "no_quorum");
    return [x];
  };
  const s6 = (n: NoQuorum[]): HistoryBuild => build([...hold(), tx(500, at(5), 1, [[A, "100", "80", O], [Z, "900", "920", P]])], first(7, [700, [[Z, P, "920"], [A, O, "80"]]]), n);
  assert.equal(code(() => s6(two(300, 4))), "day_not_monotone");
  assert.deepEqual(path(s6(two(400, 4)), O), ["-", "100", null, null, null, "80"]);
});

test("dojo_history_intra_slot_rule_is_superadditive", () => {
  // SYNTHETIC: H holds X (100); on day 3 one slot holds a sell of X (100 -> 0) and a buy on Y (0 -> 100)
  const H = key("H-slot", "holder"), X = key("acc-SX"), YS = key("acc-SY");
  const run = (sell: Raw, buy: Raw, buyB = buy): string | null => {
    const h = build([mintZ(Z, P), tx(200, at(2), 1, [[Z, "1000", "900", P], [X, null, "100", H]]), ok(sell), ok(buy, buyB)],
      first(5, [500, [[Z, P, "900"], [X, H, "0"], [YS, H, "100"]]]));
    const v = path(h, H)[2];
    return v === "-" ? "0" : (v ?? "missing"); // no line on day 3: 0, no pile the day before (bought on day 2)
  };
  const sellFirst = (rs: number | null, rb: number | null): [Raw, Raw] => [raw(300, at(3), rs, [[X, "100", "0", H], [Z, "900", "1000", P]]),
    raw(300, at(3), rb, [[YS, null, "100", H], [Z, "1000", "900", P]])];
  const buyFirst = (rs: number | null, rb: number | null): [Raw, Raw] => [raw(300, at(3), rs, [[X, "100", "0", H], [Z, "800", "900", P]]),
    raw(300, at(3), rb, [[YS, null, "100", H], [Z, "900", "800", P]])];
  // ordered slot: the exact balances in rank order (path 100, 0, 100 or 100, 200, 100)
  assert.equal(run(...sellFirst(1, 2)), "0");
  assert.equal(run(...buyFirst(2, 1)), "100");
  // the buy carries its rank on one side only: admit drops it (never one operator's rank, M-Y14), the slot is unordered and every
  // address gets L_s = 100 + min(-100, 0) + min(+100, 0) = 0, below the true minimum 100 of the real order
  const [s1, b1] = buyFirst(5, 1), b1b = structuredClone(b1);
  delete b1b.transactionIndex;
  assert.equal(run(s1, b1, b1b), "0");
  // grid recoded (motif M-H1): one slot of three transactions moving X and Y (in {-1, 0, +1} each) against Z, from X0, Y0 in {0, 1};
  // the real order is the list order, balances never negative. X and Y held by one address O (combined) or by O1 and O2 (split).
  const [O, O1, O2] = [key("O", "holder"), key("O1", "holder"), key("O2", "holder")], [GX, GY] = [key("acc-GX"), key("acc-GY")];
  const D = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, 1], [1, -1], [1, 1], [-1, -1]] as const;
  let valid = 0, checked = 0, stopped = 0, perAddressViolations = 0;
  for (const [x0, y0] of [[0, 0], [0, 1], [1, 0], [1, 1]] as const) {
    for (let i = 0; i < 512; i++) {
      const mv = [D[i % 8], D[(i >> 3) % 8], D[(i >> 6) % 8]] as (readonly [number, number])[];
      const xs: number[] = [x0], ys: number[] = [y0];
      for (const [dx, dy] of mv) { xs.push((xs.at(-1) ?? 0) + dx); ys.push((ys.at(-1) ?? 0) + dy); }
      if ([...xs, ...ys].some((v) => v < 0)) continue;
      valid++;
      const L = (b0: number, ds: number[]): number => b0 + ds.reduce((s, d) => s + Math.min(d, 0), 0); // L_s recoded
      const lo = L(x0 + y0, mv.map(([dx, dy]) => dx + dy)), lx = L(x0, mv.map(([dx]) => dx)), ly = L(y0, mv.map(([, dy]) => dy));
      const tx0 = Math.min(...xs), ty0 = Math.min(...ys), to = Math.min(...xs.map((x, j) => x + (ys[j] ?? 0)));
      const value = (split: boolean): { o: number; o1: number; o2: number } | string => {
        const [ox, oy] = split ? [O1, O2] : [O, O];
        let z = 100 - x0 - y0;
        const body: Body[] = [mintZ(Z, P, "100")];
        const d2: Mv[] = [[Z, "100", String(z), P], ...(x0 > 0 ? [[GX, null, String(x0), ox] as const] : []), ...(y0 > 0 ? [[GY, null, String(y0), oy] as const] : [])];
        if (x0 + y0 > 0) body.push(tx(200, at(2), 1, d2));
        mv.forEach(([dx, dy], j) => {
          const m: Mv[] = [[Z, String(z), String(z - dx - dy), P]];
          if (dx !== 0) m.push([GX, String(xs[j]), String(xs[j + 1]), ox]);
          if (dy !== 0) m.push([GY, String(ys[j]), String(ys[j + 1]), oy]);
          z -= dx + dy;
          body.push(tx(300, at(3), null, m)); // one slot, one blockTime (v)
        });
        const touched = (v0: number, deltas: number[]): boolean => v0 > 0 || deltas.some((d) => d !== 0);
        const rows: Row[] = [[Z, P, String(z)], ...(touched(x0, mv.map(([dx]) => dx)) ? [[GX, ox, String(xs[3])] as const] : []),
          ...(touched(y0, mv.map(([, dy]) => dy)) ? [[GY, oy, String(ys[3])] as const] : [])];
        try {
          const h = build(body, first(5, [500, rows])), m = (a: string): number => { const v = path(h, a)[2]; return v === "-" || v === undefined ? 0 : Number(v); };
          return { o: m(O), o1: m(O1), o2: m(O2) };
        } catch (e) { return (e as { code?: string }).code ?? "error"; }
      };
      const [c, s] = [value(false), value(true)];
      const neg = (split: boolean): boolean => (split ? (mv.some(([dx]) => dx !== 0) && lx < 0) || (mv.some(([, dy]) => dy !== 0) && ly < 0) : lo < 0);
      for (const [r, split] of [[c, false], [s, true]] as const) if (typeof r === "string") { assert.equal(r, "bound_exceeded", `${x0} ${y0} ${JSON.stringify(mv)} ${String(split)}`); assert.ok(neg(split)); stopped++; } else assert.ok(!neg(split));
      if (typeof c === "string" || typeof s === "string") continue;
      checked++;
      assert.ok(c.o >= s.o1 + s.o2, `superadditive: ${x0} ${y0} ${JSON.stringify(mv)}`);
      assert.ok(c.o <= to && s.o1 <= tx0 && s.o2 <= ty0, `never above the true minimum: ${x0} ${y0} ${JSON.stringify(mv)}`);
      if (tx0 + ty0 > lo) perAddressViolations++; // the parts at their exact minimum would exceed the combined bound; this grid is the
      // restriction of M-H1 to starting balances <= 1 without a null transaction (M-H1: 899 over 3 721; here 90 over the 423 built)
    }
  }
  assert.deepEqual([valid, checked, stopped, perAddressViolations], [789, 423, 494, 90], "counts of the grid (recounted by the G2 without the module)");
});

test("dojo_history_matches_first_enumeration", () => {
  // SYNTHETIC: the world, two more transactions on the first day read: slot 680, between the two responses of reading 2, and slot 700 =
  // E_e = S_CUT, counted in the response at 700 (a slot <= E_e, D-8 (ii))
  const txs = [...world(), tx(680, at(7), 1, [[Z, "500", "495", P], [Y, "200", "205", H2]]), tx(700, at(7, 7200), 1, [[Z, "495", "490", P], [Y, "205", "210", H2]])];
  const R700: Row[] = [[Z, P, "490"], [X2, H2, "100"], [Y, H2, "210"]];
  const h = build(txs, first(7, [650, WORLD_ROWS], [700, R700]));
  assert.deepEqual([h.enumeration_slots, h.window_slot_max, h.first_read_day, h.history_last_day], [[650, 700], 700, "2026-09-16", "2026-09-15"]);
  assert.deepEqual(h.lines, worldHistory().lines, "the transactions of the first day read serve (ii) only");
  // each response is checked at its own slot; a closed account absent from e is 0 (X1, mere C-1)
  const bad = (a: readonly Row[], b: readonly Row[]): string | undefined => code(() => build(txs, first(7, [650, a], [700, b])));
  assert.equal(bad(WORLD_ROWS, WORLD_ROWS), "enumeration_mismatch", "the second response, at 700, lags one transaction");
  assert.equal(bad(R700, R700), "enumeration_mismatch", "the first response, at 650, is ahead");
  assert.equal(bad([[Z, P, "500"], [X2, H1, "100"], [Y, H2, "200"]], R700), "enumeration_mismatch", "owners compared");
  assert.equal(bad([...WORLD_ROWS, [key("acc-U"), H3, "0"] as const].sort((p, q) => byBytes(p[0], q[0])), R700), "enumeration_mismatch", "an account unknown to the reconstruction");
  assert.equal(bad([[Z, P, "500"], [X2, H2, "100"]], R700), "enumeration_mismatch", "a held account absent from e");
  assert.equal(bad([...WORLD_ROWS, [X1, H1, "0"] as const].sort((p, q) => byBytes(p[0], q[0])), R700), "enumeration_mismatch", "owners compared at 0 too");
  assert.equal(code(() => build(txs, first(7, [650, WORLD_ROWS], [700, R700]).slice(0, 1))), "enumeration_mismatch", "no reading carries two responses");
  // the build stop is named in D-11 and is none of the 45 verifier codes (mere D-10)
  assert.deepEqual(DOJO_HISTORY_BUILD_STOPS.filter((c) => DOJO_VERIFY_REFUSALS.includes(c)), []);
});

test("dojo_history_lines_are_canonical_sorted_and_rooted", () => {
  // SYNTHETIC (C-G2-2 (d)): HW holds AW only, AW is closed on day 6, the day after its window: a 0 line is due ("last DEFINED value", D-12 l.463)
  const exit = build([mintZ(Z, P), tx(150, at(1, 7200), 1, [[Z, "1000", "900", P], [AW, null, "100", HW]]),
    tx(500, at(5), 1, [[AW, "100", "100", HW], [Z, "900", "900", P]]), tx(600, at(6), 1, [[AW, "100", null, HW], [Z, "900", "1000", P]])], first(7, [700, [[Z, P, "1000"]]]), [windowHole()]);
  assert.deepEqual(path(exit, HW), ["-", "100", null, null, null, "0"]);
  for (const h of [worldHistory(), build(windowTxs(), first(7, [700, WINDOW_ROWS]), [windowHole()]), exit]) {
    const L = parse(h);
    h.lines.forEach((l, i) => {
      const o = L[i] as Line;
      assert.equal(canonical(o), l);
      assert.deepEqual(Object.keys(o), ["address", "class", "day", "day_value"]);
      assert.equal(o.class, ownerClass(o.address));
      if (i > 0) { const p = L[i - 1] as Line; assert.ok(p.day < o.day || (p.day === o.day && byBytes(p.address, o.address) < 0), "sorted by day, then address bytes"); }
    });
    assert.equal(h.bytes, h.lines.map((l) => `${l}\n`).join(""));
    assert.equal(h.sha256, sha(h.bytes));
    assert.equal(h.root, rootOf(h.lines), "the root of PR-1a");
    // existence rule (D-12 l.463), recoded as the verifier holds the piles: every address with a pile has a line each day, a "0" line
    // only the day its pile empties, null lines kept
    const piles = new Map<string, [string, number][]>();
    for (let d = 1; dn(d) <= h.history_last_day; d++) {
      const today = L.filter((l) => l.day === dn(d));
      for (const [a, lots] of piles) if (lots.length > 0) assert.ok(today.some((l) => l.address === a), `line of ${a} on day ${d}`);
      for (const l of today) {
        if (l.day_value === "0") assert.ok((piles.get(l.address)?.length ?? 0) > 0, "a 0 line only on the exit day");
        piles.set(l.address, stepLots(piles.get(l.address) ?? [], d, l.day_value));
      }
    }
  }
  assert.deepEqual(path(worldHistory(), H1), ["-", "-", "300", "200", "0", "-"], "the exit day has its 0 line, the next day none");
});

test("dojo_history_bundle_carries_no_operator_label_and_no_secret", () => {
  // a body beyond S_CUT (slot 720 > 700) is left out of the reconstruction and of transactions_admitted (D-3 phase D)
  const h = build([...world(), tx(720, at(7, 9000), 1, [[Z, "500", "480", P], [Y, "200", "220", H2]])], first(7, [700, WORLD_ROWS]));
  assert.equal(h.bytes, worldHistory().bytes);
  const c = sha("SYNTHETIC collector sources"), e = sha("SYNTHETIC evidence SHA256SUMS");
  const input = { status: "complete" as const, stop_reason: null, build: h, mint: MINT, program: T22, decimals: 6, sig0: EXPECT.sig0, sig0_slot: EXPECT.slot,
    transactions_failed_excluded: 3, collector_sha256: c, evidence_sha256sums_sha256: e };
  const out = historyBundle(input), pub = out.publish;
  assert.ok(pub !== null);
  assert.deepEqual(out.status, { status: "complete", stop_reason: null });
  const hist = `history/${sha(h.bytes)}.jsonl`;
  assert.deepEqual(Object.keys(pub).sort(), ["SHA256SUMS", "eve.json", hist, "manifest.json"].sort());
  assert.equal(pub.SHA256SUMS, ["eve.json", hist, "manifest.json"].sort(byBytes).map((p) => `${sha(pub[p] ?? "")}  ${p}\n`).join(""));
  assert.equal(pub["eve.json"], `${canonical({ addresses: [P, H2].sort(byBytes), accounts: [] })}\n`, "eve of the first day read: the addresses of D_LAST");
  const m = JSON.parse(pub["manifest.json"] ?? "") as Record<string, unknown>;
  assert.equal(pub["manifest.json"], `${canonical(m)}\n`);
  assert.deepEqual(Object.keys(m).sort(), ["schema", "status", "mint", "program", "decimals", "history_first_day", "history_last_day", "sig0", "sig0_slot",
    "window_slot_max", "first_read_day", "enumeration_slots", "history_sha256", "history_lines_count", "history_root", "transactions_admitted",
    "transactions_failed_excluded", "transactions_without_quorum", "token_accounts", "addresses", "missing_address_days", "supply_check", "enumeration_check",
    "chain_check", "collector_sha256", "evidence_sha256sums_sha256"].sort(), "closed keys of D-12 l.466-472");
  assert.deepEqual([m.schema, m.status, m.history_first_day, m.history_last_day, m.history_sha256, m.history_lines_count, m.history_root, m.first_read_day,
    m.window_slot_max, m.enumeration_slots, m.supply_check, m.transactions_admitted], ["dojo-history-bundle-v1", "complete", "2026-09-10", "2026-09-15", sha(h.bytes), 12,
    rootOf(h.lines), "2026-09-16", 700, [700, 700], "pass", 6]);
  assertNoCloseLike(m);
  // no operator label, domain, URL or key form anywhere in publish/
  const all = Object.keys(pub).join("\n") + Object.values(pub).join("");
  for (const [domain, op] of Object.entries(OPERATOR_OF_DOMAIN)) for (const w of [domain, op, domain.split(".")[0] ?? domain]) assert.ok(!all.includes(w), w);
  assert.ok(!/api[-_]?key|https?:|:\/\/|secret|token=/i.test(all));
  // partial => no publish/, even when the caller holds a build (a stop after the build, e.g. the (vii) bounds of the collector)
  assert.deepEqual(historyBundle({ ...input, status: "partial", stop_reason: "bound_exceeded" }), { status: { status: "partial", stop_reason: "bound_exceeded" }, publish: null });
  for (const r of ["enumeration_mismatch", "record_malformed"]) assert.deepEqual(historyBundle({ ...input, status: "partial", stop_reason: r, build: null }).publish, null, r);
  // every manifest input has a closed form: a label, a URL or a key form is refused, never published
  const [url, label] = [`https://mainnet.${Object.keys(OPERATOR_OF_DOMAIN)[0] ?? ""}/?api-key=${[8, 4, 4, 4, 12].map((n) => "0".repeat(n)).join("-")}`, Object.values(OPERATOR_OF_DOMAIN)[0] ?? ""];
  for (const bad of [{ collector_sha256: url }, { evidence_sha256sums_sha256: label }, { mint: label }, { program: url }, { sig0: url }, { decimals: -1 },
    { stop_reason: "bound_exceeded" }, { build: null }]) assert.equal(code(() => historyBundle({ ...input, ...bad })), "read_malformed", JSON.stringify(bad));
  assert.equal(code(() => historyBundle({ ...input, status: "partial", stop_reason: url })), "read_malformed", "a partial reason is a closed name");
});
