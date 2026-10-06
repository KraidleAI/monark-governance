// MONARK Dojo -- BATCH-NEAR (G1 of 2026-10-02; item DOJO-HISTORY-BATCH-NEAR-1, dated line of the targeted G2 of HISTORY-INS-2, ADR-DOJO-PR-2B
// l.1035-1043): the near rule of readBody (history-read.ts l.112, l.116) reads every depth of a parsed instruction's info, arrays and
// objects alike, and nothing else changes. A parsed batch (agave parse_token.rs l.769-809: info = {instructions: [...]}) that wraps an
// instruction naming the mint or one of its accounts is kept once, under its own type, outside the closed list of D-8 (vi), so (vi) stops
// instruction_not_allowed (closed by default, no type added); an instruction near at depth two is kept with its type; one with no near
// value at any depth stays ignored; the supply and the mint entries do not move. Each inner instruction of a batch is {type, info}: "type"
// is read in the parser's test (l.2278-2282), "info" is inferred (the struct of every outer `parsed`, absent from the local copy). Every
// body is a SYNTHETIC variant of the fixture C1 (one Token-2022 instruction near the mint: a transferChecked in its inner group), declared
// at its use; expected lists are recoded here, never read from the module. No network.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkInstructions, checkSupply, readBody, type Body } from "../src/history-read.ts";

type Info = Record<string, unknown>;
type Ix = { programId: string; parsed?: { type: string; info: Info; [k: string]: unknown }; accounts?: string[]; data?: string };
type Bal = { accountIndex: number; mint: string; owner?: string; programId: string; uiTokenAmount: { amount: string } };
type Raw = {
  slot: number; blockTime: number | null; transactionIndex?: number;
  transaction: { signatures: string[]; message: { accountKeys: { pubkey: string; source: string }[]; instructions: Ix[] } };
  meta: { err: unknown; preTokenBalances: Bal[]; postTokenBalances: Bal[]; innerInstructions: { index: number; instructions: Ix[] }[] };
};
const dir = new URL("./fixtures/history/", import.meta.url);
const MINT = (JSON.parse(readFileSync(new URL("sources.json", dir), "utf8")) as { mint: string }).mint;
const C1 = JSON.parse(Buffer.from(JSON.parse(readFileSync(new URL("c1.a.json", dir), "utf8")) as string, "hex").toString("utf8")) as Raw;
const T22 = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb", SPL = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"; // Token-2022, classic token
const BMAH = "BMAHydSBcKWYpiEXrGsgPSEJ6XHE4AfNaoLDhz8xTj9T"; // a token account of the mint in C1 (dojo-history-read.test.ts l.35)
const C1_TYPES = ["transferChecked"]; // the types of read(C1).ins (dojo-history-read.test.ts l.192), recoded
const read = (r: Raw): Body => readBody(r, MINT);
const types = (b: Body): string[] => b.ins.map((i) => i.type);
const ix = (type: string, info: Info): Ix => ({ programId: T22, parsed: { type, info } });
/** A parsed batch wrapping `inner`, each {type, info} (SYNTHETIC; the shape of parse_token.rs l.769-809, see the header). */
const batch = (...inner: (readonly [string, Info])[]): Ix => ix("batch", { instructions: inner.map(([type, info]) => ({ type, info })) });
/** C1 with `ixs` appended to its first inner group (SYNTHETIC), in that order. */
const withIx = (...ixs: Ix[]): Raw => {
  const r = structuredClone(C1), g = r.meta.innerInstructions[0];
  if (g) g.instructions.push(...ixs); else r.meta.innerInstructions.push({ index: 0, instructions: ixs });
  return r;
};
/** C1 with `ixs` appended as outer instructions (SYNTHETIC): no inner group carries them. */
const withOuter = (...ixs: Ix[]): Raw => { const r = structuredClone(C1); r.transaction.message.instructions.push(...ixs); return r; };
/** withIx, then the post amount of BMAH on the mint moved by `by` base units (SYNTHETIC): a balance change that no supply move explains. */
const slipped = (by: bigint, ...ixs: Ix[]): Raw => {
  const r = withIx(...ixs), keys = r.transaction.message.accountKeys;
  const e = r.meta.postTokenBalances.find((x) => x.mint === MINT && keys[x.accountIndex]?.pubkey === BMAH);
  if (e === undefined) throw new Error("C1 carries no post entry of BMAH on the mint");
  e.uiTokenAmount.amount = String(BigInt(e.uiTokenAmount.amount) + by);
  return r;
};
/** f stops with `code`; with `type`, the stop names that type (detail "<signature>: <type>", history-read.ts checkInstructions). */
const stopsWith = (f: () => unknown, code: string, type?: string): void => {
  assert.throws(f, (e: unknown) => {
    const x = e as { code?: string; detail?: string };
    return x.code === code && (type === undefined || x.detail?.endsWith(`: ${type}`) === true);
  });
};
/** Inner instructions near the mint of C1 (SYNTHETIC; shapes of parse_token.rs): by the mint, by BMAH, by BMAH as a multisig signer only
 *  (depth two of the inner info); allowed types, a refused one (freezeAccount, the probe of batch-blind.mjs) and a mint. */
const WRAPPED: readonly (readonly [string, Info])[] = [
  ["burn", { account: BMAH, mint: MINT, authority: "O4", amount: "5" }],
  ["transferChecked", { source: BMAH, mint: MINT, destination: "D9", authority: "O4", tokenAmount: { amount: "5", decimals: 6 } }],
  ["freezeAccount", { account: BMAH, mint: MINT, freezeAuthority: "F1" }],
  ["mintTo", { mint: MINT, account: "N1", mintAuthority: "A1", amount: "7" }],
  ["burn", { account: BMAH, mint: "M0", authority: "O4", amount: "5" }],
  ["approve", { source: "X1", delegate: "D9", multisigOwner: "M5", signers: ["S1", BMAH] }],
];

// killer: apps/dojo/src/history-read.ts:112 CONST "list(v)" -> "null"
test("dojo_history_batch_near_the_mint_stops_instruction_not_allowed", () => {
  const c1 = read(C1);
  for (const w of WRAPPED) {
    for (const [where, r] of [["inner", withIx(batch(w))], ["outer", withOuter(batch(w))]] as const) {
      const b = read(r), at = `${w[0]} (${where})`;
      assert.deepEqual(b.ins.slice(C1_TYPES.length), [{ type: "batch", info: { instructions: [{ type: w[0], info: w[1] }] } }], `${at}: one entry`);
      assert.deepEqual(types(b), [...C1_TYPES, "batch"], `${at}: the batch is read once, under its own type, never unpacked`);
      stopsWith(() => { checkInstructions(b); }, "instruction_not_allowed", "batch");
      assert.deepEqual([b.supply, b.mint], [c1.supply, c1.mint], `${at}: neither the supply nor an entry of the mint moves`);
      assert.doesNotThrow(() => { checkSupply(b); }, `${at}: (i) of the transaction holds`);
    }
  }
  // all of them in one batch, after an allowed instruction near the mint: the batch is read once and the stop names it
  const all = read(withIx(ix("approve", { source: BMAH, delegate: "D9", owner: "O4", amount: "5" }), batch(...WRAPPED)));
  assert.deepEqual(types(all), [...C1_TYPES, "approve", "batch"]);
  stopsWith(() => { checkInstructions(all); }, "instruction_not_allowed", "batch");
  // the three cases of batch-blind.mjs (G1 of HISTORY-INS-2, out 814d895e...), where (vi) passed: a burn of 5 of BMAH under a batch with
  // the post amount of BMAH moved by -5 (and here +5, a hidden mint) or unchanged, and a freezeAccount of BMAH under a batch. (vi) now
  // stops each, naming the batch; (i) still stops a moved balance
  const burn: readonly [string, Info] = ["burn", { account: BMAH, mint: MINT, amount: "5", authority: "O4" }];
  for (const by of [-5n, 5n]) {
    const hidden = read(slipped(by, batch(burn)));
    stopsWith(() => { checkSupply(hidden); }, "supply_mismatch");
    stopsWith(() => { checkInstructions(hidden); }, "instruction_not_allowed", "batch");
  }
  stopsWith(() => { checkInstructions(read(withIx(batch(burn)))); }, "instruction_not_allowed", "batch");
  const freeze = batch(["freezeAccount", { account: BMAH, mint: MINT, freezeAuthority: "F1" }]);
  stopsWith(() => { checkInstructions(read(withIx(freeze))); }, "instruction_not_allowed", "batch");
});

/** Instructions whose info names the mint or BMAH only below its first level (SYNTHETIC), [type, info, allowed by (vi)]: in a nested
 *  object (depth two), in an array (depth two: a multisig signer, as parse_signers renders it), then at depths three and four. */
const DEEP: readonly (readonly [string, Info, boolean])[] = [
  ["approve", { source: "X1", delegate: "D9", owner: "O4", amount: "5", extra: { account: BMAH } }, true],
  ["freezeAccount", { account: "X1", mint: "M0", freezeAuthority: "F1", extra: { mint: MINT } }, false],
  ["burn", { account: "X1", mint: "M0", amount: "5", multisigAuthority: "M5", signers: ["S1", BMAH] }, true],
  ["transfer", { source: "X1", destination: "X2", authority: "O4", amount: "5", extra: [{ account: BMAH }] }, true],
  ["setAuthority", { account: "X1", authorityType: "accountOwner", newAuthority: "O5", authority: "O4", extra: { a: [{ b: MINT }] } }, true],
];

// killer: apps/dojo/src/history-read.ts:112 CONST "Object.values(obj(v) ?? {})" -> "[]"
test("dojo_history_instruction_near_at_depth_two_is_kept_with_its_type", () => {
  const c1 = read(C1);
  for (const [type, info, allowed] of DEEP) {
    const b = read(withIx(ix(type, info)));
    assert.deepEqual(b.ins.slice(C1_TYPES.length), [{ type, info }], `${type}: kept once, with its own type and info`);
    assert.deepEqual(types(b), [...C1_TYPES, type], `${type}: after the instruction of C1`);
    // the burn names another mint at depth one: it moves no supply (only info.mint === mint does); no entry of the mint moves either
    assert.deepEqual([b.supply, b.mint], [c1.supply, c1.mint], `${type}: neither the supply nor an entry of the mint moves`);
    assert.doesNotThrow(() => { checkSupply(b); }, `${type}: (i) of the transaction holds`);
    if (allowed) assert.doesNotThrow(() => { checkInstructions(b); }, `${type} passes (vi)`);
    else stopsWith(() => { checkInstructions(b); }, "instruction_not_allowed", type);
  }
  // all of them together, in that order, after the instruction of C1: each is read, the stop names the refused one
  const all = read(withIx(...DEEP.map(([type, info]) => ix(type, info))));
  assert.deepEqual(types(all), [...C1_TYPES, ...DEEP.map(([type]) => type)]);
  stopsWith(() => { checkInstructions(all); }, "instruction_not_allowed", "freezeAccount");
});

/** Leaves of every kind around `x` at depth five of the info (SYNTHETIC): extra[0].f[0][0]. */
const leaves = (x: string): Info => ({ source: "X1", owner: "O4", extra: [{ a: null, b: [], c: {}, d: 0, e: false, f: [[x]] }] });
/** TWINS (SYNTHETIC), [name, kept, ignored]: the same shape with a near value (kept: the decision) and without one (ignored, as at the
 *  base). Without: the mint and BMAH swapped for other addresses; as KEYS only (a key is never a value); inside longer strings (equality,
 *  never inclusion); beside the info (in parsed, in the instruction's accounts: only info is read); no string leaf; another program. */
const TWINS: readonly (readonly [string, Ix, Ix])[] = [
  ["depth five", ix("freezeAccount", leaves(BMAH)), ix("freezeAccount", leaves("F4"))],
  ["the mint at depth five", ix("approve", leaves(MINT)), ix("approve", leaves("F4"))],
  ["a batch", batch(["burn", { account: BMAH, mint: "M0", amount: "5" }]), batch(["burn", { account: "X1", mint: "M0", amount: "5" }])],
  ["keys", ix("freezeAccount", { account: "X1", extra: { x: MINT } }), ix("freezeAccount", { account: "X1", extra: { [MINT]: "x" }, [BMAH]: 1 })],
  ["longer strings", ix("freezeAccount", { account: "X1", extra: [BMAH] }),
    ix("freezeAccount", { account: `${BMAH}1`, extra: [`1${MINT}`, MINT.slice(1), BMAH.toLowerCase(), `${MINT} ${BMAH}`] })],
  ["beside the info", ix("freezeAccount", { account: "X1", note: BMAH }),
    { programId: T22, parsed: { type: "freezeAccount", info: { account: "X1" }, note: BMAH }, accounts: [BMAH, MINT] }],
  ["no string leaf", ix("freezeAccount", { a: [[], {}, null, 0, false, [[[BMAH]]]] }),
    ix("freezeAccount", { a: [[], {}, null, 0, false, [[[]]]], b: { c: { d: {} } } })],
  ["another program", batch(["burn", { account: BMAH, mint: MINT, amount: "5" }]),
    { programId: SPL, parsed: { type: "batch", info: { instructions: [{ type: "burn", info: { account: BMAH, mint: MINT, amount: "5" } }] } } }],
];

// killer: apps/dojo/src/history-read.ts:112 CONST "near.has(v)" -> "true"
test("dojo_history_instruction_with_no_near_value_stays_ignored", () => {
  for (const [name, kept, ignored] of TWINS) {
    assert.deepEqual(types(read(withIx(kept))), [...C1_TYPES, kept.parsed?.type], `${name}: the near twin is kept (not vacuous)`);
    const b = read(withIx(ignored));
    assert.deepEqual(types(b), C1_TYPES, `${name}: no near value, ignored`);
    assert.doesNotThrow(() => { checkInstructions(b); }, `${name}: ignored, so (vi) passes even for a refused type`);
  }
  // all the ignored twins together, inner then outer: still only the instruction of C1
  const far = TWINS.map(([, , ignored]) => ignored);
  assert.deepEqual(types(read(withIx(...far))), C1_TYPES);
  assert.deepEqual(types(read(withOuter(...far))), C1_TYPES);
});
