// MONARK Bell — L-2 offline oracle for the multiplier-trajectory scan (ADR-T1aii D1-quater, lot -b3a). The
// injected `call` returns hand-built RPC shapes (getAccountInfo base64 state, getSignaturesForAddress pages,
// getTransaction encoding:"json" bodies with base58 data) — no network. Two distinct operators (helius,
// chainstack) concord. Named mutants: budget swallowed => red; maxSupportedTransactionVersion 0 => red.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scanMultiplierEvents, base58Decode, TOKEN_2022_PROGRAM } from "../src/rebase-scan.ts";
import { f64BitsHexLE } from "../src/rebase-trajectory.ts";
import { MAX_TX_VERSION } from "../src/rpc.ts";
import { operatorOf } from "../src/operators.ts";
import { BudgetExceededError, type JsonRpcCall, type TransportFault } from "../src/quorum.ts";

const PROVIDERS = ["https://mainnet.helius-rpc.com", "https://sol.core.chainstack.com"]; // operators helius, chainstack
const MINT = "MintZZ111111111111111111111111111111111111", OTHER = "OtherMint22222222222222222222222222222222", AUTH = "Auth33333333333333333333333333333333333333";

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function b58enc(bytes: Uint8Array): string {
  let x = 0n; for (const b of bytes) x = x * 256n + BigInt(b);
  let s = ""; while (x > 0n) { s = B58[Number(x % 58n)] + s; x /= 58n; }
  for (const b of bytes) { if (b === 0) s = "1" + s; else break; }
  return s || "1";
}
function updBytes(m: number, effTs: number): Uint8Array {
  const b = new Uint8Array(18); b[0] = 43; b[1] = 1; const dv = new DataView(b.buffer); dv.setFloat64(2, m, true); dv.setBigInt64(10, BigInt(effTs), true); return b;
}
function initBytes(m: number): Uint8Array { const b = new Uint8Array(42); b[0] = 43; b[1] = 0; new DataView(b.buffer).setFloat64(34, m, true); return b; }
function stateBytes(mult: number, effTs: number, newMult: number): Uint8Array {
  const b = new Uint8Array(56); const dv = new DataView(b.buffer); dv.setFloat64(32, mult, true); dv.setBigInt64(40, BigInt(effTs), true); dv.setFloat64(48, newMult, true); return b;
}
// A json-encoded tx: accountKeys [MINT, AUTH, T22, OTHER]; each instruction {programIdIndex, accounts, data:b58}.
function jsonTx(slot: number, blockTime: number | null, instrs: Array<{ accts: number[]; data: Uint8Array }>, inner: Array<{ accts: number[]; data: Uint8Array }> = []): unknown {
  const mk = (i: { accts: number[]; data: Uint8Array }) => ({ programIdIndex: 2, accounts: i.accts, data: b58enc(i.data) });
  return { slot, blockTime, transaction: { message: { accountKeys: [MINT, AUTH, TOKEN_2022_PROGRAM, OTHER], instructions: instrs.map(mk) } },
    meta: { innerInstructions: inner.length ? [{ index: 0, instructions: inner.map(mk) }] : [] } };
}

test("bell_rebase_scan_replays_fixture_bit_identical — decode 43/0+43/1, mint-match + CPI, replay = read state (C-3)", () => {
  // Init m=1.0 @slot10/bt1000; scheduled update m=1.5 effTs=1500 @slot20/bt2000 (effTs<bt => folds). A 43/1 for
  // ANOTHER mint (shared-authority batch) rides in the same tx and MUST be ignored; a genuine 43/1 in a CPI
  // (innerInstructions) MUST be picked up. Final state: mult=1.5, new=1.5, effTs=1500.
  const S = 25;
  const bodies: Record<string, unknown> = {
    initSig: jsonTx(10, 1000, [{ accts: [0, 1], data: initBytes(1.0) }]),
    updSig: jsonTx(20, 2000, [{ accts: [3, 1], data: updBytes(9.9, 0) }], [{ accts: [0, 1], data: updBytes(1.5, 1500) }]), // top-level = OTHER (ignored); CPI = our mint
  };
  const sigs = [{ signature: "updSig", slot: 20, blockTime: 2000, err: null }, { signature: "initSig", slot: 10, blockTime: 1000, err: null }];
  const call: JsonRpcCall = (_u, method, params) => {
    if (method === "getAccountInfo") return Promise.resolve({ context: { slot: S }, value: { data: [Buffer.from(stateBytes(1.5, 1500, 1.5)).toString("base64"), "base64"] } });
    if (method === "getSignaturesForAddress") return Promise.resolve(sigs);
    if (method === "getTransaction") return Promise.resolve(bodies[String((params as unknown[])[0])]);
    throw new Error("unexpected method " + method);
  };
  return scanMultiplierEvents(call, PROVIDERS, MINT, {}, []).then((res) => {
    assert.equal(res.complete, true, res.reason ?? "complete");
    assert.equal(res.finalStateOk, true, "replay reproduces the read triplet (C-3)");
    assert.equal(res.events.length, 2, "init + the mint's update only (OTHER-mint 43/1 excluded)");
    assert.equal(res.events[0]!.kind, "initialize");
    assert.equal(res.events[1]!.kind, "update");
    assert.equal(res.events[1]!.multiplierBitsHex, f64BitsHexLE(1.5));
    assert.equal(res.oracleSlot, S);
  });
});

test("bell_rebase_scan_state_divergence_is_unverified — a replay that misses an event fails the C-3 oracle", () => {
  // The read state says mult=2.0 but the scanned bodies only carry init m=1.0 (a dropped update). C-3 must catch
  // the divergence => complete=false, never an adjustment of the replay to match the state (MAST: fit-to-fixture).
  const call: JsonRpcCall = (_u, method, params) => {
    if (method === "getAccountInfo") return Promise.resolve({ context: { slot: 25 }, value: { data: [Buffer.from(stateBytes(2.0, 0, 2.0)).toString("base64"), "base64"] } });
    if (method === "getSignaturesForAddress") return Promise.resolve([{ signature: "initSig", slot: 10, blockTime: 1000, err: null }]);
    if (method === "getTransaction") { void params; return Promise.resolve(jsonTx(10, 1000, [{ accts: [0, 1], data: initBytes(1.0) }])); }
    throw new Error("unexpected " + method);
  };
  return scanMultiplierEvents(call, PROVIDERS, MINT, {}, []).then((res) => {
    assert.equal(res.finalStateOk, false);
    assert.equal(res.complete, false);
    assert.equal(res.reason, "state_oracle_divergence");
  });
});

test("bell_rebase_scan_budget_fail_closed — BudgetExceededError is RE-THROWN, never swallowed (C-11)", async () => {
  const call: JsonRpcCall = () => Promise.reject(new BudgetExceededError("budget"));
  await assert.rejects(scanMultiplierEvents(call, PROVIDERS, MINT, {}, []), BudgetExceededError); // mutant: catch+swallow => resolves => reds
});

test("bell_rebase_scan_tx_version_1 — bodies reuse MAX_TX_VERSION (>=1), captured on the call params (C-5)", () => {
  const seen: unknown[] = [];
  const call: JsonRpcCall = (_u, method, params) => {
    if (method === "getAccountInfo") return Promise.resolve({ context: { slot: 25 }, value: { data: [Buffer.from(stateBytes(1.0, 0, 1.0)).toString("base64"), "base64"] } });
    if (method === "getSignaturesForAddress") return Promise.resolve([{ signature: "initSig", slot: 10, blockTime: 1000, err: null }]);
    if (method === "getTransaction") { seen.push(params); return Promise.resolve(jsonTx(10, 1000, [{ accts: [0, 1], data: initBytes(1.0) }])); }
    throw new Error("unexpected " + method);
  };
  return scanMultiplierEvents(call, PROVIDERS, MINT, {}, [] as TransportFault[]).then(() => {
    assert.ok(seen.length >= 1, "at least one body fetched");
    const opts = (seen[0] as unknown[])[1] as { maxSupportedTransactionVersion: number; encoding: string };
    assert.equal(opts.maxSupportedTransactionVersion, MAX_TX_VERSION, "reuses MAX_TX_VERSION (no regression)");
    assert.ok(opts.maxSupportedTransactionVersion >= 1, "must be >= 1 (tx v1 active since ~2026-09-15); mutant 0 => reds");
    assert.equal(opts.encoding, "json", "C-2: json (base58 data), never jsonParsed");
  });
});

test("bell_rebase_scan_body_quorum — C-4(iii): a candidate re-read on op B with different bits => rebase_unverified", () => {
  // Both operators concord on the state + the signature band, but op chainstack's UpdateMultiplier BODY carries
  // different f64 bits than op helius's => the decoded-event key mismatches => body quorum fails. Mutant "skip the
  // op-B re-read" would make this complete=true (op-A alone matches the state) => this test reds it.
  const acct = { context: { slot: 25 }, value: { data: [Buffer.from(stateBytes(1.5, 1500, 1.5)).toString("base64"), "base64"] } };
  const sigs = [{ signature: "updSig", slot: 20, blockTime: 2000, err: null }, { signature: "initSig", slot: 10, blockTime: 1000, err: null }];
  const bodyFor = (op: string, sig: string): unknown => sig === "initSig"
    ? jsonTx(10, 1000, [{ accts: [0, 1], data: initBytes(1.0) }])
    : jsonTx(20, 2000, [{ accts: [0, 1], data: updBytes(op === "helius" ? 1.5 : 9.9, 1500) }]);
  const call: JsonRpcCall = (url, method, params) => {
    if (method === "getAccountInfo") return Promise.resolve(acct);
    if (method === "getSignaturesForAddress") return Promise.resolve(sigs);
    if (method === "getTransaction") return Promise.resolve(bodyFor(operatorOf(url), String((params as unknown[])[0])));
    throw new Error("unexpected " + method);
  };
  return scanMultiplierEvents(call, PROVIDERS, MINT, {}, []).then((res) => {
    assert.equal(res.complete, false);
    assert.equal(res.reason, "body_quorum");
  });
});

test("bell_rebase_scan_band_divergence — a real within-band signature disagreement => rebase_unverified", () => {
  // The two operators return DIFFERENT signatures inside the settled band [bandLo,S] (B vs X at slot 10) => the
  // band-set sha differs => signature_band_divergence (the concordance still catches a genuine disagreement; only
  // the ragged count-capped TAIL is excluded by the band, not real divergence).
  const acct = { context: { slot: 25 }, value: { data: [Buffer.from(stateBytes(1, 0, 1)).toString("base64"), "base64"] } };
  const sigsH = [{ signature: "A", slot: 20, blockTime: 2000, err: null }, { signature: "B", slot: 10, blockTime: 1000, err: null }];
  const sigsC = [{ signature: "A", slot: 20, blockTime: 2000, err: null }, { signature: "X", slot: 10, blockTime: 1000, err: null }];
  const call: JsonRpcCall = (url, method) => {
    if (method === "getAccountInfo") return Promise.resolve(acct);
    if (method === "getSignaturesForAddress") return Promise.resolve(operatorOf(url) === "helius" ? sigsH : sigsC);
    if (method === "getTransaction") return Promise.resolve(jsonTx(10, 1000, [])); // no 43/x
    throw new Error("unexpected " + method);
  };
  return scanMultiplierEvents(call, PROVIDERS, MINT, {}, []).then((res) => {
    assert.equal(res.complete, false);
    assert.equal(res.reason, "signature_band_divergence");
  });
});

test("bell_rebase_scan_base58_decode_roundtrip — the base58 decoder recovers the exact bytes", () => {
  const bytes = updBytes(1.0039, 1781755200);
  assert.deepEqual([...base58Decode(b58enc(bytes))], [...bytes]);
  assert.deepEqual([...base58Decode("1" + b58enc(new Uint8Array([0, 5])))], [0, 0, 5], "leading-zero bytes preserved");
});
