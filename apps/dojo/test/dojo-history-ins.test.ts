// MONARK Dojo -- HISTORY-INS (G1 of 2026-10-01): the closed list of D-8 (vi) (ADR-DOJO-PR-2B l.370) extended by the five types of the
// dated line HISTORY-INS: initializeAccount and approve, seen near the mint in phase B of the provisional run, and initializeAccount2,
// approveChecked and revoke, their neighbours (no balance, no supply). Every body is a SYNTHETIC variant of the fixture C1 or a body built
// here as in dojo-history-read.test.ts, declared at its use; the info shapes follow the reference parser (agave parse_token.rs l.92-127,
// l.180-219, l.388-410; journal G1-lot-history-ins section 1). Expected lists are recoded here, never read from the module. No network.
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
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", RENT = "SysvarRent111111111111111111111111111111111";
const BMAH = "BMAHydSBcKWYpiEXrGsgPSEJ6XHE4AfNaoLDhz8xTj9T"; // a token account of the mint in C1 (dojo-history-read.test.ts l.35)
const read = (r: Raw): Body => readBody(r, MINT);
/** C1 with `ixs` appended to its first inner group (SYNTHETIC), in that order. */
const withIx = (...ixs: Ix[]): Raw => {
  const r = structuredClone(C1), g = r.meta.innerInstructions[0];
  if (g) g.instructions.push(...ixs); else r.meta.innerInstructions.push({ index: 0, instructions: ixs });
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
/** The five types of HISTORY-INS, each near the mint of C1 (by its mint, or by BMAH as source): shapes of parse_token.rs, recoded. */
const ADDED: readonly (readonly [string, Record<string, unknown>])[] = [
  ["initializeAccount", { account: "N1", mint: MINT, owner: "O4", rentSysvar: RENT }],
  ["initializeAccount2", { account: "N1", mint: MINT, owner: "O4", rentSysvar: RENT }],
  ["approve", { source: BMAH, delegate: "D9", owner: "O4", amount: "5" }],
  ["approveChecked", { source: BMAH, mint: MINT, delegate: "D9", owner: "O4",
    tokenAmount: { amount: "5", decimals: 6, uiAmount: 0.000005, uiAmountString: "0.000005" } }],
  ["revoke", { source: BMAH, owner: "O4" }],
];
const BEFORE = ["initializeMetadataPointer", "initializeMint2", "getAccountDataSize", "initializeImmutableOwner", "initializeAccount3",
  "initializeTokenMetadata", "updateTokenMetadataAuthority", "mintTo", "setAuthority", "transferChecked", "transfer", "closeAccount", "burn",
  "burnChecked", "mintToChecked"]; // D-8 (vi) l.370, recoded
const INS2 = ["withdrawExcessLamports", "amountToUiAmount", "uiAmountToAmount"]; // HISTORY-INS-2 (dojo-history-ins2.test.ts), recoded

// killer: apps/dojo/src/history-read.ts:31 CONST "initializeAccount2" -> "initializeAccount9"
test("dojo_history_ins_added_types_pass_near_the_mint", () => {
  const c1 = read(C1);
  for (const [type, info] of ADDED) {
    const b = read(withIx({ programId: T22, parsed: { type, info } }));
    assert.ok(b.ins.some((i) => i.type === type), `${type} is read as an instruction on the mint`); // near (readBody), so the case is not vacuous
    assert.doesNotThrow(() => { checkInstructions(b); }, `${type} passes (vi)`);
    assert.deepEqual([b.supply, b.mint], [c1.supply, c1.mint], `${type} moves neither the supply nor an entry of the mint`);
    assert.doesNotThrow(() => { checkSupply(b); }, `${type}: (i) of the transaction holds`);
  }
  // owner fallback (D-5 l.329): an entry without owner takes info.owner of the initializeAccount or initializeAccount2 that creates it;
  // the owner that an approve, an approveChecked or a revoke names never feeds it (owner_unknown, as with no instruction at all)
  for (const type of ["initializeAccount", "initializeAccount2"]) {
    const init: Ix = { programId: T22, parsed: { type, info: { account: "C", mint: MINT, owner: "O4", rentSysvar: RENT } } };
    assert.deepEqual(state([mk(7, 20, [["C", null, null, "9"]], [init]), mk(8, 21, [["C", null, "9", "4"]])]), ["C=4/O4"], type);
  }
  for (const [type, info] of ADDED.filter(([t]) => !t.startsWith("initializeAccount"))) {
    const named: Ix = { programId: T22, parsed: { type, info: { ...info, source: "C", owner: "O4" } } };
    assert.ok(mk(7, 20, [["C", null, null, "9"]], [named]).ins.some((i) => i.type === type), type);
    stopsWith(() => chainAccounts([mk(7, 20, [["C", null, null, "9"]], [named])], []), "owner_unknown");
  }
});

// killer: apps/dojo/src/history-read.ts:206 SDL "for (const i of tx.ins)" -> ""
test("dojo_history_ins_unknown_and_unparsed_still_stop", () => {
  // PIN (decision "no other type"): the 15 types of D-8 (vi) l.370, the five of HISTORY-INS and the three of HISTORY-INS-2, recoded; never unparsed
  assert.deepEqual([...DOJO_HISTORY_INSTRUCTIONS].sort(), [...BEFORE, ...ADDED.map(([t]) => t), ...INS2].sort());
  assert.equal((DOJO_HISTORY_INSTRUCTIONS as readonly string[]).includes("unparsed"), false);
  // refused: Token-2022 types left out (one moves balances), names that extend an added type (an exact match, never a prefix), and an
  // unparsed instruction on a mint account; each stops alone, and AFTER an added type: the stop then names it, the added type passed (vi)
  const left = ["thawAccount", "freezeAccount", "transferCheckedWithFee", "initializeAccount4", "approveAll", "revoked"];
  const refused: [string, Ix][] = left.map((t): [string, Ix] => [t, { programId: T22, parsed: { type: t, info: { account: BMAH, mint: MINT } } }]);
  refused.push(["unparsed", { programId: T22, accounts: [BMAH], data: "3Bxs4h24hBtQy9rw" }]);
  for (const [name, ix] of refused) {
    stopsWith(() => { checkInstructions(read(withIx(ix))); }, "instruction_not_allowed", name);
    for (const [type, info] of ADDED) {
      stopsWith(() => { checkInstructions(read(withIx({ programId: T22, parsed: { type, info } }, ix))); }, "instruction_not_allowed", name);
    }
  }
});
