// MONARK Dojo -- PR-2b-1 oracles (ADR-DOJO-PR-2B section 4 l.557-570): index merge, reading key and admission, supply moves per
// transaction, chaining, closed instruction list, creation and days. Inputs are the reduced fixtures of fixtures/history/ (sources.json:
// probe files, sha256, rule; one hexadecimal line each); every variant is SYNTHETIC, derived here and declared at its use. Expected sets,
// sums and days are recoded here from the fixture JSON, never read from the module under test. No network, no clock.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { DOJO_VERIFY_REFUSALS } from "../scripts/dojo-verify.mjs";
import { DOJO_HISTORY_STOPS, FAULT, admit, chainAccounts, checkBounds, checkCreation, checkDays, checkInstructions, checkSupply, dayOf,
  mergeIndexes, readBody, readKey, type Body, type NoQuorum } from "../src/history-read.ts";

type Bal = { accountIndex: number; mint: string; owner?: string; programId: string; uiTokenAmount: { amount: string } };
type Ix = { programId: string; parsed?: { type: string; info: Record<string, unknown> }; accounts?: string[]; data?: string };
type Raw = { slot: number; blockTime: number | null; transactionIndex?: number; transaction: { signatures: string[]; message: { accountKeys: { pubkey: string; source: string }[]; instructions: Ix[] } };
  meta: { err: unknown; preTokenBalances: Bal[]; postTokenBalances: Bal[]; innerInstructions: { index: number; instructions: Ix[] }[] } };
type Entry = { signature: string; slot: number; err: unknown; blockTime: number | null; confirmationStatus: string };
const dir = new URL("./fixtures/history/", import.meta.url);
const SRC = JSON.parse(readFileSync(new URL("sources.json", dir), "utf8")) as { mint: string; fixtures: Record<string, { member: string | null; sha256: string; key?: string }> };
const text = (name: string): string => Buffer.from(JSON.parse(readFileSync(new URL(name, dir), "utf8")) as string, "hex").toString("utf8");
const fx = <T>(name: string): T => JSON.parse(text(name)) as T;
const MINT = SRC.mint, T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const EXPECT = fx<{ sig0: string; slot: number; blockTime: number; smid: { signature: string; blockTime: number } }>("probe3-expect.json");
const body = (name: string): Raw => fx<Raw>(name);
const read = (r: Raw): Body => readBody(r, MINT);
const copy = <T>(x: T): T => structuredClone(x);
const stops = (f: () => unknown, code: string): void => { assert.throws(f, (e: unknown) => (e as { code?: string }).code === code); };
const admitted = (x: ReturnType<typeof admit>): Body => { assert.equal(x.kind, "admitted"); return (x as { tx: Body }).tx; };
const acctOf = (r: Raw, b: Bal): string => r.transaction.message.accountKeys[b.accountIndex]?.pubkey ?? "";
const post = (r: Raw, acc: string): Bal => { const b = r.meta.postTokenBalances.find((x) => x.mint === MINT && acctOf(r, x) === acc); assert.ok(b); return b; };
const inner = (r: Raw, ix: Ix): void => { const g = r.meta.innerInstructions[0]; if (g) g.instructions.push(ix); else r.meta.innerInstructions.push({ index: 0, instructions: [ix] }); };
const signed = (r: Raw, s: string): Raw => { const c = copy(r); c.transaction.signatures[0] = s; return c; };
const SYN = (n: number): string => "S".repeat(80) + "abcdefghij"[n % 10] + "abcdefghij"[Math.floor(n / 10) % 10]; // synthetic signatures
const [C1, C2, SIG0A, SIG0B] = [body("c1.a.json"), body("c2.a.json"), body("sig0.a.json"), body("sig0.b.json")];
const BMAH = "BMAHydSBcKWYpiEXrGsgPSEJ6XHE4AfNaoLDhz8xTj9T", MEQM = "MeQMg7r7smskfnq4xPmUPRSbFXUzqgJjDMBzvCoYkzd"; // C1 destination, source (ADR l.638)

test("dojo_history_quorum_on_signatures_and_balances", () => {
  // stop names: the D-11 collector stops (l.425) raised here, disjoint from the 45 verifier codes of mere D-10
  for (const s of ["creation_mismatch", "chain_break", "supply_mismatch", "no_quorum_unbounded", "instruction_not_allowed", "day_not_monotone", "bound_exceeded"]) assert.ok((DOJO_HISTORY_STOPS as readonly string[]).includes(s));
  assert.equal(DOJO_HISTORY_STOPS.filter((s) => DOJO_VERIFY_REFUSALS.includes(s)).length, 0);
  const page = fx<{ data: Raw[]; paginationToken: string }>("sig0.a-page.json");
  assert.equal(page.paginationToken, `${EXPECT.slot}:342`); // "slot:rank" (R-a)
  // the two operators (and the full page vs the single body, R-b) give the same key; C2 reaches the mint by a lookup table only (R7)
  assert.equal(readKey(read(SIG0A), true), readKey(read(SIG0B), true));
  assert.equal(readKey(read(page.data[0] as Raw), true), readKey(read(SIG0B), true));
  assert.ok(C2.meta.postTokenBalances.some((b) => b.mint === MINT && C2.transaction.message.accountKeys[b.accountIndex]?.source === "lookupTable"));
  assert.deepEqual(read(C2).mint.map((e) => e.account).sort(), [MEQM, MEQM, "3aFvVduD6u5GyTj2TZrUSkNU3PcnB4EcMEW8bc768vi7", "3aFvVduD6u5GyTj2TZrUSkNU3PcnB4EcMEW8bc768vi7"].sort());
  // index merge on the probe pages: equal sets, no contested; R ordered by (slot, signature); F = the err entries (recoded)
  for (const [x, y] of [["mint-head.a.json", "mint-head.b.json"], ["mint-tail.a.json", "mint-tail.b.json"], ["acct-MeQM.a.json", "acct-MeQM.b.json"]] as const) {
    const [pa, pb] = [fx<Entry[]>(x), fx<Entry[]>(y)], m = mergeIndexes(pa, pb, Number.MAX_SAFE_INTEGER);
    const ord = [...pa].sort((p, q) => p.slot - q.slot || (p.signature < q.signature ? -1 : 1));
    assert.deepEqual([m.contested, m.read, m.failed], [[], ord.filter((e) => e.err === null).map((e) => e.signature), ord.filter((e) => e.err !== null).map((e) => e.signature)]);
  }
  // contestation (D-4 l.304), synthetic on the tail pages: listed by one index only, blockTime differs, status not finalized
  const [ta, tb] = [fx<Entry[]>("mint-tail.a.json"), fx<Entry[]>("mint-tail.b.json")];
  const [e0, e1, e2] = [ta[0], ta[1], ta[2]] as [Entry, Entry, Entry];
  const tb2 = copy(tb).filter((e) => e.signature !== e0.signature).map((e) => (e.signature === e1.signature ? { ...e, blockTime: (e.blockTime ?? 0) + 1 }
    : e.signature === e2.signature ? { ...e, confirmationStatus: "confirmed" } : e));
  const m = mergeIndexes(ta, tb2, Number.MAX_SAFE_INTEGER);
  assert.deepEqual([...m.contested].sort(), [e0.signature, e1.signature, e2.signature].sort());
  for (const s of m.contested) assert.ok(m.read.includes(s)); // read at both operators (M-Y8)
  assert.deepEqual(mergeIndexes(ta.map((e) => (e.signature === e2.signature ? { ...e, confirmationStatus: "confirmed" } : e)), tb, Number.MAX_SAFE_INTEGER).contested, [e2.signature]);
  const at0 = ta.filter((e) => e.slot === EXPECT.slot && e.err === null).map((e) => e.signature).sort(); // SIG0 shares its slot (recoded)
  assert.ok(at0.length > 1 && at0.includes(EXPECT.sig0));
  assert.deepEqual([mergeIndexes(ta, tb, EXPECT.slot).read, mergeIndexes(ta, tb, EXPECT.slot - 1).read], [at0, []]); // S_CUT: slot <= S_CUT only
  stops(() => mergeIndexes([...ta, e0], tb, EXPECT.slot), "index_inconsistent");
  // admission (D-5, D-6): same key, err null => admitted with the rank; the rank of one body only leaves the key and the rank
  assert.equal(admitted(admit(EXPECT.sig0, SIG0A, SIG0B, MINT)).rank, 342);
  const norank = copy(SIG0B); delete norank.transactionIndex;
  assert.equal(admitted(admit(EXPECT.sig0, SIG0A, norank, MINT)).rank, null);
  // different key on a modified copy: owner, amount, rank (present in both), supply instruction
  const c1 = C1.transaction.signatures[0] ?? "";
  const own = copy(C1); post(own, BMAH).owner = MEQM;
  const amt = copy(C1); post(amt, BMAH).uiTokenAmount.amount = "1";
  const rnk = copy(C1); rnk.transactionIndex = 1695;
  const er = copy(C1); er.meta.err = { InstructionError: [0, { Custom: 1 }] };
  const pre = copy(C1); (pre.meta.preTokenBalances.find((x) => x.mint === MINT && acctOf(pre, x) === BMAH) as Bal).uiTokenAmount.amount = "1";
  const sup = copy(SIG0B); for (const g of sup.meta.innerInstructions) for (const i of g.instructions) if (i.parsed?.type === "mintTo") i.parsed.info.amount = "999";
  for (const v of [own, amt, rnk, er, pre]) { assert.notEqual(readKey(read(v), true), readKey(read(C1), true)); assert.equal(admit(c1, C1, v, MINT).kind, "no_quorum"); }
  assert.notEqual(readKey(read(sup), true), readKey(read(SIG0B), true));
  const nq = admit(c1, C1, own, MINT) as NoQuorum; // union of the owners named by the two bodies (D-6 l.335)
  assert.deepEqual(nq.touched.filter((t) => t.account === BMAH).map((t) => t.owner).sort(), [post(C1, BMAH).owner, MEQM].sort());
  // one body only (fault or null): never admitted (M-Y1); accounts of the read body marked
  for (const [x, y] of [[C1, FAULT], [FAULT, C1], [C1, null], [null, C1], [C1, signed(C1, SYN(1))]] as const) {
    const r = admit(c1, x, y, MINT); assert.equal(r.kind, "no_quorum");
    assert.deepEqual(r.touched.map((t) => t.account), [BMAH, MEQM]);
  }
  stops(() => admit(c1, null, null, MINT), "index_inconsistent");
  stops(() => admit(c1, FAULT, FAULT, MINT), "no_quorum_unbounded");
  stops(() => admit(c1, FAULT, null, MINT), "no_quorum_unbounded");
  stops(() => admit(EXPECT.sig0, SIG0A, FAULT, MINT), "supply_mismatch"); // a mint or burn without quorum (D-6 l.335-336)
  // (vii) bounds, an explicit input: at the bound passes, one more stops
  const counts = { read: 2000, contested: 3, noQuorum: 1, unordered: 0, failedMoving: 0 }, bounds = { contested: [3, 2000] as const, noQuorum: 1, unordered: 0, failedMoving: 0 };
  checkBounds(counts, bounds);
  for (const k of ["contested", "noQuorum", "unordered", "failedMoving"] as const) stops(() => checkBounds({ ...counts, [k]: counts[k] + 1 }, bounds), "bound_exceeded");
  stops(() => checkBounds(counts, { contested: [3, 2000], noQuorum: 1, unordered: 0 } as never), "read_malformed");
  stops(() => checkBounds({ ...counts, noQuorum: Number.NaN }, bounds), "read_malformed");
  stops(() => checkBounds(counts, { noQuorum: 1, unordered: 0, failedMoving: 0 } as never), "read_malformed");
  assert.deepEqual(readdirSync(dir).filter((f) => f.endsWith(".json") && f !== "sources.json").sort(), Object.keys(SRC.fixtures).sort());
  for (const [n, f] of Object.entries(SRC.fixtures)) assert.ok(n === "probe3-expect.json" ? f.member === null : /^[ab]$/.test(f.member ?? "") && new RegExp(`\\.${f.member ?? ""}(-page)?\\.json$`).test(n), n);
  // fixtures: decoded text equals the pinned sha256; the key of each reduced body equals the key recorded on the RAW body (FM-2.4)
  for (const [name, f] of Object.entries(SRC.fixtures)) assert.equal(createHash("sha256").update(text(name)).digest("hex"), f.sha256, name);
  for (const [n, raw] of [["sig0.b.json", SIG0B], ["sig0.a.json", SIG0A], ["c1.a.json", C1], ["c2.a.json", C2], ["c1.b.json", body("c1.b.json")],
    ["c2.b.json", body("c2.b.json")], ["sig0.a-page.json", page.data[0] as Raw]] as const) assert.equal(readKey(read(raw), true), SRC.fixtures[n]?.key, n);
});

test("dojo_history_excludes_failed_before_bodies", () => {
  const [pa, pb] = [fx<Entry[]>("acct-6tW6.a.json"), fx<Entry[]>("acct-6tW6.b.json")];
  const failed = pa.filter((e) => e.err !== null).map((e) => e.signature);
  assert.ok(failed.length > 1);
  const m = mergeIndexes(pa, pb, Number.MAX_SAFE_INTEGER);
  assert.deepEqual([...m.failed].sort(), [...failed].sort()); // F: concordant failures, excluded before any body is read
  for (const s of failed) assert.ok(!m.read.includes(s)); // F is never requested (M-Y10 a)
  // a failure listed by one index only, or failed at one and successful at the other, is contested and read at both (M-Y10 b)
  const [f0, f1] = failed as [string, string];
  const pb2 = pb.filter((e) => e.signature !== f0).map((e) => (e.signature === f1 ? { ...e, err: null } : e));
  const m2 = mergeIndexes(pa, pb2, Number.MAX_SAFE_INTEGER);
  for (const s of [f0, f1]) { assert.ok(m2.contested.includes(s) && m2.read.includes(s)); assert.ok(!m2.failed.includes(s)); }
  // a concordant failure in the bodies: excluded, counted, with its move of the mint for the (vii) count (Q-6)
  const e1 = copy(C1), e2 = copy(C1); e1.meta.err = e2.meta.err = { InstructionError: [2, { Custom: 6005 }] };
  assert.deepEqual(admit(C1.transaction.signatures[0] ?? "", e1, e2, MINT), { kind: "failed", moves: true });
  for (const b of [...e1.meta.postTokenBalances]) { const p = e1.meta.preTokenBalances.find((x) => x.accountIndex === b.accountIndex); if (p) b.uiTokenAmount.amount = p.uiTokenAmount.amount; }
  assert.deepEqual(admit(C1.transaction.signatures[0] ?? "", e1, copy(e1), MINT), { kind: "failed", moves: false });
});

test("dojo_history_supply_moves_match_instructions", () => {
  const sig0 = admitted(admit(EXPECT.sig0, SIG0A, SIG0B, MINT));
  // recoded: sum over the mint entries of (post - pre) in the raw SIG0 fixture = 10^15, the amount of its one mintTo
  const sum = (bs: Bal[]): bigint => bs.filter((b) => b.mint === MINT).reduce((s, b) => s + BigInt(b.uiTokenAmount.amount), 0n);
  assert.equal(sum(SIG0B.meta.postTokenBalances) - sum(SIG0B.meta.preTokenBalances), 10n ** 15n);
  assert.deepEqual(sig0.supply, [{ type: "mintTo", amount: String(10n ** 15n) }]);
  checkSupply(sig0); checkSupply(read(C1)); checkSupply(read(C2));
  // synthetic burns on C1: BMAH post lowered by the burned amount passes; any other amount stops
  const burn = (type: "burn" | "burnChecked", n: string, lower: bigint): Raw => {
    const r = copy(C1), b = post(r, BMAH);
    inner(r, { programId: T22, parsed: { type, info: type === "burn" ? { account: BMAH, mint: MINT, amount: n } : { account: BMAH, mint: MINT, tokenAmount: { amount: n } } } });
    b.uiTokenAmount.amount = String(BigInt(b.uiTokenAmount.amount) - lower);
    return r;
  };
  checkSupply(read(burn("burn", "5", 5n))); checkSupply(read(burn("burnChecked", "7", 7n)));
  stops(() => checkSupply(read(burn("burnChecked", "7", 6n))), "supply_mismatch");
  stops(() => checkSupply(read(burn("burn", "5", 0n))), "supply_mismatch");
  // a mint after SIG0 (mint authority removed at creation, R-d) stops even when the balances match it
  const late = copy(C1); inner(late, { programId: T22, parsed: { type: "mintToChecked", info: { account: BMAH, mint: MINT, tokenAmount: { amount: "3" } } } });
  post(late, BMAH).uiTokenAmount.amount = String(BigInt(post(late, BMAH).uiTokenAmount.amount) + 3n);
  stops(() => checkSupply(read(late)), "supply_mismatch");
});

test("dojo_history_chain_break_stops", () => {
  // synthetic bodies: rows [account, owner, pre, post] (null = absent from the side); rank null = no transactionIndex
  const mk = (n: number, slot: number, rank: number | null, rows: [string, string | null, string | null, string | null][], ixs: Ix[] = []): Body => {
    const bal = (i: number, owner: string | null, amount: string): Bal => ({ accountIndex: i, mint: MINT, programId: T22, uiTokenAmount: { amount }, ...(owner === null ? {} : { owner }) });
    const r: Raw = { slot, blockTime: 1789100000 + slot, transaction: { signatures: [SYN(n)], message: { accountKeys: rows.map(([a]) => ({ pubkey: a, source: "transaction" })), instructions: ixs } },
      meta: { err: null, innerInstructions: [], preTokenBalances: rows.flatMap(([, o, p], i) => (p === null ? [] : [bal(i, o, p)])), postTokenBalances: rows.flatMap(([, o, , q], i) => (q === null ? [] : [bal(i, o, q)])) } };
    if (rank !== null) r.transactionIndex = rank;
    return read(r);
  };
  const state = (txs: Body[], nq: NoQuorum[] = []): string[] => [...chainAccounts(txs, nq)].map(([a, s]) => `${a}=${s.amount}/${s.owner ?? "-"}`);
  const t1 = mk(1, 10, 1, [["A", "O1", null, "100"]]), t2 = mk(2, 11, 0, [["A", "O1", "100", "40"], ["B", "O2", null, "60"]]);
  assert.deepEqual(state([t2, t1]), ["A=40/O1", "B=60/O2"]);
  const gap = mk(2, 11, 0, [["A", "O1", "90", "30"]]);
  stops(() => chainAccounts([t1, gap], []), "chain_break"); // a hole between two admitted transactions (M-Y13)
  stops(() => chainAccounts([t1, mk(2, 11, 0, [["A", "O9", "100", "40"]])], []), "chain_break"); // owner included
  const [r1, r2] = [mk(2, 11, 0, [["A", "O1", "100", "40"]]), mk(3, 11, 0, [["A", "O1", "40", "10"]])];
  for (const g of [[t1, r1, r2], [t1, r2, r1]]) stops(() => chainAccounts(g, []), "read_malformed"); // equal ranks in an ordered slot: no input order decides
  const hole: NoQuorum = { kind: "no_quorum", signature: SYN(9), slots: [10], blockTimes: [], touched: [{ account: "A", owner: "O1" }] };
  assert.deepEqual(state([t1, gap], [hole]), ["A=30/O1"]); // a window without quorum between the two frees the chain (D-6)
  stops(() => chainAccounts([t1, gap], [{ ...hole, slots: [9] }]), "chain_break"); // a hole before the previous transaction frees nothing
  stops(() => chainAccounts([t1, gap], [{ ...hole, touched: [{ account: "B", owner: "O2" }] }]), "chain_break"); // nor a hole of another account
  stops(() => chainAccounts([t1, mk(2, 12, 0, [["A", "O1", "90", "80"]]), mk(3, 12, 1, [["A", "O1", "70", "60"]])], [{ ...hole, slots: [11] }]), "chain_break"); // it frees the next pre only
  assert.deepEqual(state([t1, mk(3, 12, 1, [["A", "O1", "50", "20"]]), mk(2, 12, 0, [["A", "O1", "100", "50"]])]), ["A=20/O1"]); // rank order, not input order
  assert.deepEqual(state([t1, mk(3, 12, 0, [["A", "O1", "100", null]])]), ["A=0/-"]); // closed: 0
  // closed then re-created by another owner (0 in between, owner free)
  assert.deepEqual(state([t1, mk(3, 12, 0, [["A", "O1", "100", null]]), mk(4, 13, 0, [["A", "O3", null, "5"]])]), ["A=5/O3"]);
  // unordered slot (one admitted transaction without rank): an order that chains exists, in any input order; none => stop
  const u1 = mk(5, 14, null, [["A", "O1", "40", "70"]]), u2 = mk(6, 14, 3, [["A", "O1", "70", "10"]]);
  assert.deepEqual(state([t1, t2, u2, u1]), ["A=10/O1", "B=60/O2"]);
  stops(() => chainAccounts([t1, t2, u2, mk(5, 14, null, [["A", "O1", "50", "70"]])], []), "chain_break");
  assert.deepEqual(state([t1, u2, u1], [{ ...hole, slots: [13] }]), ["A=10/O1"]); // after a window, the trail of an unordered slot starts free
  // owner absent from both bodies: from the initializeAccount3 of the transaction, then from the last admitted owner, else stop
  const init: Ix = { programId: T22, parsed: { type: "initializeAccount3", info: { account: "C", mint: MINT, owner: "O4" } } };
  assert.deepEqual(state([mk(7, 20, 0, [["C", null, null, "9"]], [init]), mk(8, 21, 0, [["C", null, "9", "4"]])]), ["C=4/O4"]);
  stops(() => chainAccounts([mk(7, 20, 0, [["C", null, null, "9"]])], []), "owner_unknown");
});

test("dojo_history_instruction_allowlist_stops", () => {
  const sig0 = admitted(admit(EXPECT.sig0, SIG0A, SIG0B, MINT));
  assert.deepEqual([...new Set(sig0.ins.map((i) => i.type))].sort(), ["getAccountDataSize", "initializeAccount3", "initializeImmutableOwner", "initializeMetadataPointer",
    "initializeMint2", "initializeTokenMetadata", "mintTo", "setAuthority", "updateTokenMetadataAuthority"]); // R-c, R-d; the launch-program instruction is not Token-2022
  checkInstructions(sig0); checkInstructions(read(C1)); checkInstructions(read(C2));
  // Token-2022 program filtered by programId: the classic token program also shows program "spl-token" (C1, C2)
  assert.deepEqual(read(C1).ins.map((i) => i.type), ["transferChecked"]);
  const none = copy(C1); (none.meta as { innerInstructions: unknown }).innerInstructions = null;
  assert.deepEqual(read(none).ins, []); // innerInstructions null = no inner instruction (dated line)
  const off = copy(C1); inner(off, { programId: T22, parsed: { type: "freezeAccount", info: { account: BMAH, mint: MINT } } });
  stops(() => checkInstructions(read(off)), "instruction_not_allowed"); // a type outside the closed list (M-Y19)
  const raw = copy(C1); inner(raw, { programId: T22, accounts: [BMAH], data: "3Bxs4h24hBtQy9rw" });
  stops(() => checkInstructions(read(raw)), "instruction_not_allowed"); // an unparsed Token-2022 instruction on a mint account
  const bare = copy(C1); inner(bare, { programId: T22, data: "3Bxs4h24hBtQy9rw" });
  stops(() => checkInstructions(read(bare)), "instruction_not_allowed"); // accounts unknown: on the mint (fail-closed)
  const far = copy(C1); inner(far, { programId: T22, accounts: ["So11111111111111111111111111111111111111112"], data: "3Bxs4h24hBtQy9rw" });
  checkInstructions(read(far)); // an unparsed Token-2022 instruction on no account of the mint is not an instruction on the mint
  const orphan = copy(C1); orphan.meta.innerInstructions.push({ index: C1.transaction.message.instructions.length, instructions: [] });
  stops(() => read(orphan), "read_malformed"); // an inner group that no outer instruction carries is never skipped silently
});

test("dojo_history_creation_and_day_monotonicity", () => {
  const [ta, tb] = [fx<Entry[]>("mint-tail.a.json"), fx<Entry[]>("mint-tail.b.json")];
  const sig0 = admitted(admit(EXPECT.sig0, SIG0A, SIG0B, MINT));
  assert.deepEqual([ta.at(-1)?.signature, ta.at(-1)?.slot, ta.at(-1)?.blockTime], [EXPECT.sig0, EXPECT.slot, EXPECT.blockTime]); // derived.json R2
  assert.deepEqual(fx<unknown[]>("mint-before-sig0.b.json"), []); // nothing before SIG0 (R3)
  checkCreation(ta, tb, sig0, MINT);
  stops(() => checkCreation(ta.slice(0, -1), tb, sig0, MINT), "creation_mismatch");
  stops(() => checkCreation(ta, tb, null, MINT), "creation_mismatch");
  stops(() => checkCreation(ta, tb, sig0, "So11111111111111111111111111111111111111112"), "creation_mismatch");
  stops(() => checkCreation(ta, tb.slice(0, -1), sig0, MINT), "creation_mismatch");
  stops(() => checkCreation([...ta.slice(0, -1), { ...(ta.at(-1) as Entry), blockTime: EXPECT.blockTime + 1 }], tb, sig0, MINT), "creation_mismatch");
  const m999 = copy(SIG0B); for (const g of m999.meta.innerInstructions) for (const i of g.instructions) if (i.parsed?.type === "mintTo") i.parsed.info.amount = "999";
  stops(() => checkCreation(ta, tb, read(m999), MINT), "creation_mismatch");
  const dec9 = copy(SIG0B); for (const g of dec9.meta.innerInstructions) for (const i of g.instructions) if (i.parsed?.type === "initializeMint2") i.parsed.info.decimals = 9;
  stops(() => checkCreation(ta, tb, read(dec9), MINT), "creation_mismatch");
  // days come from blockTime only (M-Y6): SIG0 on 2026-09-10; C2 (= SMID) 4 s after 2026-09-14T00:00Z, recoded with Date.UTC
  assert.equal(dayOf(EXPECT.blockTime), "2026-09-10");
  assert.equal(EXPECT.smid.signature, C2.transaction.signatures[0]);
  assert.equal((C2.blockTime ?? 0) - Date.UTC(2026, 8, 14) / 1000, 4);
  assert.equal(dayOf(C2.blockTime ?? 0), "2026-09-14");
  assert.equal(dayOf(Date.UTC(2026, 8, 14) / 1000 - 1), "2026-09-13");
  checkDays(ta); checkDays(fx<Entry[]>("mint-head.a.json")); checkDays([read(C2), read(C1), sig0]);
  const [x, y] = [ta[0], ta[1]] as [Entry, Entry];
  stops(() => checkDays([{ ...x, blockTime: null }]), "day_not_monotone");
  stops(() => checkDays([x, { ...x, signature: y.signature, blockTime: (x.blockTime ?? 0) + 1 }]), "day_not_monotone"); // two blockTimes in one slot
  stops(() => checkDays([{ slot: 100, blockTime: Date.UTC(2026, 8, 14) / 1000 }, { slot: 101, blockTime: Date.UTC(2026, 8, 14) / 1000 - 1 }]), "day_not_monotone");
  checkDays([{ slot: 100, blockTime: Date.UTC(2026, 8, 14) / 1000 + 5 }, { slot: 101, blockTime: Date.UTC(2026, 8, 14) / 1000 + 1 }]); // blockTime falls, day does not (D-8 (v))
});
