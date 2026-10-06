// MONARK Dojo -- HISTORY-INS-2 (G1 of 2026-10-01): the closed list of D-8 (vi) (ADR-DOJO-PR-2B l.370) extended by the three types of the
// dated line HISTORY-INS-2: withdrawExcessLamports, seen near the mint in phase C of the provisional run (five times, each by its source, a
// token account of the mint), and amountToUiAmount and uiAmountToAmount, its neighbours with no balance and no supply move; reallocate is
// left out (its shape is not readable in the local copy of the reference parser). Every body is a SYNTHETIC variant of the fixture C1 or a
// body built here as in dojo-history-ins.test.ts, declared at its use; the info shapes follow the reference parser (agave parse_token.rs
// l.495-514, l.636-655, l.937-961; journal G1-lot-history-ins-2 section 1). Expected lists are recoded here, never read from the module.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { DOJO_HISTORY_INSTRUCTIONS, chainAccounts, checkInstructions, checkSupply, readBody, type Body } from "../src/history-read.ts";

type Ix = { programId: string; parsed?: { type: string; info: Record<string, unknown> }; accounts?: string[]; data?: string };
type Bal = { accountIndex: number; mint: string; owner?: string; programId: string; uiTokenAmount: { amount: string } };
type Raw = {
  slot: number; blockTime: number | null; transactionIndex?: number;
  transaction: { signatures: string[]; message: { accountKeys: { pubkey: string; source: string }[]; instructions: Ix[] } };
  meta: { err: unknown; preTokenBalances: Bal[]; postTokenBalances: Bal[]; innerInstructions: { index: number; instructions: Ix[] }[] };
};
type Row = [account: string, owner: string | null, pre: string | null, post: string | null];
const dir = new URL("./fixtures/history/", import.meta.url);
const MINT = (JSON.parse(readFileSync(new URL("sources.json", dir), "utf8")) as { mint: string }).mint;
const C1 = JSON.parse(Buffer.from(JSON.parse(readFileSync(new URL("c1.a.json", dir), "utf8")) as string, "hex").toString("utf8")) as Raw;
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";
const BMAH = "BMAHydSBcKWYpiEXrGsgPSEJ6XHE4AfNaoLDhz8xTj9T"; // a token account of the mint in C1 (dojo-history-read.test.ts l.35)
const read = (r: Raw): Body => readBody(r, MINT);
const ix = (type: string, info: Record<string, unknown>): Ix => ({ programId: T22, parsed: { type, info } });
/** C1 with `ixs` appended to its first inner group (SYNTHETIC), in that order. */
const withIx = (...ixs: Ix[]): Raw => {
  const r = structuredClone(C1), g = r.meta.innerInstructions[0];
  if (g) g.instructions.push(...ixs); else r.meta.innerInstructions.push({ index: 0, instructions: ixs });
  return r;
};
/** withIx, then the post amount of BMAH on the mint moved by `by` base units (SYNTHETIC): a balance change that no supply move explains. */
const slipped = (by: bigint, ...ixs: Ix[]): Raw => {
  const r = withIx(...ixs), keys = r.transaction.message.accountKeys;
  const e = r.meta.postTokenBalances.find((x) => x.mint === MINT && keys[x.accountIndex]?.pubkey === BMAH);
  if (e === undefined) throw new Error("C1 carries no post entry of BMAH on the mint");
  e.uiTokenAmount.amount = String(BigInt(e.uiTokenAmount.amount) + by);
  return r;
};
const SYN = (n: number): string => "S".repeat(80) + "abcdefghij"[n % 10] + "abcdefghij"[Math.floor(n / 10) % 10]; // synthetic signatures
/** A SYNTHETIC body of one slot: rows [account, owner, pre, post] of the mint (null = absent from that side), `ixs` as outer instructions. */
const mk = (n: number, slot: number, rows: Row[], ixs: Ix[] = []): Body => {
  const bal = (i: number, owner: string | null, amount: string): Bal => ({ accountIndex: i, mint: MINT, programId: T22, uiTokenAmount: { amount },
    ...(owner === null ? {} : { owner }) });
  return read({ slot, blockTime: 1789100000 + slot, transactionIndex: 0,
    transaction: { signatures: [SYN(n)], message: { accountKeys: rows.map(([a]) => ({ pubkey: a, source: "transaction" })), instructions: ixs } },
    meta: { err: null, innerInstructions: [], preTokenBalances: rows.flatMap(([, o, p], i) => (p === null ? [] : [bal(i, o, p)])),
      postTokenBalances: rows.flatMap(([, o, , q], i) => (q === null ? [] : [bal(i, o, q)])) } });
};
const state = (txs: Body[]): string[] => [...chainAccounts(txs, [])].map(([a, s]) => `${a}=${s.amount}/${s.owner ?? "-"}`);
/** f stops with `code`; with `type`, the stop names that type (detail "<signature>: <type>", history-read.ts checkInstructions). */
const stopsWith = (f: () => unknown, code: string, type?: string): void => {
  assert.throws(f, (e: unknown) => {
    const x = e as { code?: string; detail?: string };
    return x.code === code && (type === undefined || x.detail?.endsWith(`: ${type}`) === true);
  });
};
/** The three types of HISTORY-INS-2, each near the mint of C1: shapes of parse_token.rs, recoded. withdrawExcessLamports comes near by its
 *  source, the token account BMAH (as the five seen in phase C), then by the mint itself, then with a multisig authority (parse_signers). */
const ADDED: readonly (readonly [string, Record<string, unknown>])[] = [
  ["withdrawExcessLamports", { source: BMAH, destination: "D9", authority: "O4" }],
  ["withdrawExcessLamports", { source: MINT, destination: "D9", authority: "O4" }],
  ["withdrawExcessLamports", { source: BMAH, destination: "D9", multisigAuthority: "M5", signers: ["S1", "S2"] }],
  ["amountToUiAmount", { mint: MINT, amount: "4242" }],
  ["uiAmountToAmount", { mint: MINT, uiAmount: "42.42" }],
];
const TYPES = ["withdrawExcessLamports", "amountToUiAmount", "uiAmountToAmount"]; // HISTORY-INS-2, recoded
const BEFORE = ["initializeMetadataPointer", "initializeMint2", "getAccountDataSize", "initializeImmutableOwner", "initializeAccount3",
  "initializeTokenMetadata", "updateTokenMetadataAuthority", "mintTo", "setAuthority", "transferChecked", "transfer", "closeAccount", "burn",
  "burnChecked", "mintToChecked"]; // D-8 (vi) l.370, recoded
const INS = ["initializeAccount", "initializeAccount2", "approve", "approveChecked", "revoke"]; // HISTORY-INS, recoded

// killer: apps/dojo/src/history-read.ts:31 CONST "withdrawExcessLamports" -> "withdrawExcessLamportz"
test("dojo_history_ins2_added_types_pass_near_the_mint", () => {
  const c1 = read(C1);
  for (const [type, info] of ADDED) {
    const b = read(withIx(ix(type, info)));
    assert.ok(b.ins.some((i) => i.type === type), `${type} is read as an instruction on the mint`); // near (readBody): not vacuous
    assert.doesNotThrow(() => { checkInstructions(b); }, `${type} passes (vi)`);
    assert.deepEqual([b.supply, b.mint], [c1.supply, c1.mint], `${type} moves neither the supply nor an entry of the mint`);
    assert.doesNotThrow(() => { checkSupply(b); }, `${type}: (i) of the transaction holds`);
  }
  const all = read(withIx(...ADDED.map(([type, info]) => ix(type, info))));
  assert.equal(all.ins.filter((i) => TYPES.includes(i.type)).length, ADDED.length, "the five shapes together are read");
  assert.doesNotThrow(() => { checkInstructions(all); }, "the five shapes together pass (vi)");
  // a balance slipped under an added type is no supply move: (i) of the transaction stops, for a hidden burn and a hidden mint alike
  for (const [type, info] of ADDED) {
    for (const by of [-5n, 5n]) stopsWith(() => { checkSupply(read(slipped(by, ix(type, info)))); }, "supply_mismatch");
  }
  // owner fallback (D-5 l.329): fed by an initializeAccount* only. initializeAccount3 feeds it (the case is not vacuous); a SYNTHETIC
  // superset of each added shape, naming the account and an owner, never does (owner_unknown, as with no instruction at all)
  assert.deepEqual(state([mk(7, 20, [["C", null, null, "9"]], [ix("initializeAccount3", { account: "C", mint: MINT, owner: "O4" })])]), ["C=9/O4"]);
  for (const [type, info] of ADDED) {
    const b = mk(7, 20, [["C", null, null, "9"]], [ix(type, { ...info, account: "C", owner: "O4" })]);
    assert.ok(b.ins.some((i) => i.type === type), `${type} is read as an instruction on C`);
    stopsWith(() => chainAccounts([b], []), "owner_unknown");
  }
});

// killer: apps/dojo/src/history-read.ts:206 ROR ".includes(i.type)" -> ".some((t) => i.type.startsWith(t))"
test("dojo_history_ins2_unknown_freeze_and_unparsed_still_stop", () => {
  // PIN (decision "no other type"): the 15 types of D-8 (vi) l.370, the five of HISTORY-INS and the three of HISTORY-INS-2, recoded;
  // never unparsed, never reallocate (its shape is not readable in the local copy of the parser: journal section 3)
  assert.deepEqual([...DOJO_HISTORY_INSTRUCTIONS].sort(), [...BEFORE, ...INS, ...TYPES].sort());
  for (const t of ["unparsed", "reallocate"]) assert.equal((DOJO_HISTORY_INSTRUCTIONS as readonly string[]).includes(t), false, t);
  // refused: an unknown name, freezeAccount (the refused probe of the collector test), reallocate (left out), unwrapLamports (a lamport
  // neighbour, not decided), names that extend an added type (an exact match, never a prefix), and an unparsed instruction on a mint
  // account; each stops alone, and AFTER each added shape: the stop then names it, the added type having passed (vi)
  const left = ["someUnknownType", "freezeAccount", "reallocate", "unwrapLamports", "withdrawExcessLamports2", "amountToUiAmountAll",
    "uiAmountToAmounts"];
  const refused: [string, Ix][] = left.map((t): [string, Ix] => [t, ix(t, { account: BMAH, mint: MINT })]);
  refused.push(["unparsed", { programId: T22, accounts: [BMAH], data: "3Bxs4h24hBtQy9rw" }]);
  for (const [name, bad] of refused) {
    stopsWith(() => { checkInstructions(read(withIx(bad))); }, "instruction_not_allowed", name);
    for (const [type, info] of ADDED) stopsWith(() => { checkInstructions(read(withIx(ix(type, info), bad))); }, "instruction_not_allowed", name);
  }
});
