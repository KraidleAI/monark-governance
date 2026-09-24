// UKEMI-REVERT-1 (incident REVERT-PAID-1, 2026-09-23): the ADDITIVE bare-revert classifier `isBareRevert` (classify.ts),
// driven THROUGH the real transport (resolveOperators is internal; globalThis.fetch stubbed and always restored), in the
// wire form MEASURED by the G1 probe of 2026-09-23 (description() of the GHO oracle source at block 23414968): drpc.org
// AND chainstack both answered {code: 3, message: "execution reverted"} with NO `data` key. The other hypothesis ("0x")
// is exercised too. Proves: (1) the measured form is BARE for the keyless operator AND for BOTH paid units (chainstack =
// "ru", helius = "credits": paid-ness comes from the unit, never from a label, B-1); (2) `isRpcRevert` is UNCHANGED (a
// paid bare revert stays false - R-A - while `isBareRevert` names it); (3) the closed criterion: code 3 / -32000 only, no
// validated data, and on the KEYLESS side no reason text (on the PAID side the closed hint cannot carry a reason, D6).
// Named mutants (mutants.mjs, A-11): "paid-ness by label", "R-A removed from isRpcRevert", "keyless reason accepted",
// "data check dropped", "code guard dropped".
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveOperators } from "../src/transport.ts";
import { RpcError, TransportError } from "../src/errors.ts";
import type { OperatorLabel } from "../src/client.ts";
import { isBareRevert, isRpcRevert, closedHint } from "@monark/rpc-guard";

const CS_ENV = { CHAINSTACK_ETH_URL: "https://cs-node.example.invalid/FAKEKEY-CS-PATH-4r4r4r4r" };
const HELIUS_ENV = { BELL_SOLANA_RPC: "https://sol.example.invalid", HELIUS_API_KEY: "FAKEKEY-HELIUS-5t5t5t5t" };

/** Drive ONE call of `op` through the resolved transport with a stubbed fetch; return the thrown error (or undefined). */
async function raiseVia(env: Record<string, string | undefined>, op: string, body: unknown, status = 200): Promise<unknown> {
  const realFetch = globalThis.fetch;
  globalThis.fetch = () => Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } }));
  try {
    const { transport } = resolveOperators(env);
    return await transport(op as OperatorLabel, "eth_call", [{}, "0x1"]).then(() => undefined, (e: unknown) => e);
  } finally { globalThis.fetch = realFetch; }
}
/** A JSON-RPC error body in the REAL envelope (A-8): {jsonrpc, id, error:{code, message[, data]}}. */
const rpcErrBody = (code: number, message: string, data?: string): unknown => ({ jsonrpc: "2.0", id: 1, error: { code, message, ...(data !== undefined ? { data } : {}) } });
const MEASURED = rpcErrBody(3, "execution reverted");     // the G1 probe wire form (no data key), both operators
const EMPTY_0X = rpcErrBody(3, "execution reverted", "0x"); // the other hypothesis (a keyless GHO V-4 measurement)
const OPERATORS: ReadonlyArray<readonly [string, Record<string, string>, string]> = [
  ["drpc.org", {}, "keyless"], ["chainstack", CS_ENV, "ru"], ["helius", HELIUS_ENV, "credits"],
];

// (1)+(2) B-1: the measured form (and "0x") is bare for the keyless operator AND for BOTH paid units; isRpcRevert keeps
// R-A (true for keyless, false for a paid bare revert). Kills "paid-ness by label" (op === "chainstack" as the paid test
// => helius falls to the keyless text rule, its preamble message is not "execution reverted" => false) and "R-A removed
// from isRpcRevert" (a paid bare revert becomes true).
test("bare_revert_measured_wire_form_is_bare_for_keyless_and_both_paid_units", async () => {
  for (const body of [MEASURED, EMPTY_0X]) {
    for (const [op, env, unit] of OPERATORS) {
      const e = await raiseVia(env, op, body);
      assert.ok(e instanceof RpcError, `${op}: the JSON-RPC error path throws the canonical RpcError`);
      assert.equal(e.unit, unit, `${op}: unit ${unit} set at the transport`);
      assert.equal(e.code, 3);
      assert.equal(isBareRevert(e), true, `${op} (${unit}): the measured bare revert IS bare (data ${JSON.stringify(e.data)})`);
      assert.equal(isRpcRevert(e), unit === "keyless", `${op}: isRpcRevert UNCHANGED - true for keyless, false for a paid bare revert (R-A)`);
    }
  }
  // The paid detail is exactly the closed hint of the bare text (D6): the only paid text a bare revert can yield.
  const cs = await raiseVia(CS_ENV, "chainstack", MEASURED);
  assert.ok(cs instanceof RpcError && cs.detail === closedHint("execution reverted") && cs.detail === "execution reverted, revert", "paid detail = closedHint('execution reverted')");
  assert.equal(cs.data, undefined, "the measured paid form carries NO validated data");
});

// (3) the KEYLESS side decides the reason: "execution reverted: <reason>" (no data) is NOT bare. On the PAID side the
// same body yields the same closed hint (D6) - bare by data alone - which is WHY the quorum needs a keyless witness.
// Kills "keyless reason accepted" (startsWith instead of equality).
test("bare_revert_keyless_reason_text_is_not_bare_paid_hint_cannot_see_it", async () => {
  const withReason = rpcErrBody(3, "execution reverted: Ownable: caller is not the owner");
  const kl = await raiseVia({}, "drpc.org", withReason);
  assert.ok(kl instanceof RpcError && kl.message === "execution reverted: Ownable: caller is not the owner");
  assert.equal(isBareRevert(kl), false, "a keyless revert with a reason text is NOT bare");
  assert.equal(isRpcRevert(kl), true, "it is still a keyless revert (isRpcRevert unchanged)");
  const paid = await raiseVia(CS_ENV, "chainstack", withReason);
  assert.ok(paid instanceof RpcError && paid.detail === "execution reverted, revert", "the paid closed hint drops the reason (D6)");
  assert.equal(isBareRevert(paid), true, "paid side: bare is decided by data ALONE (the reason is invisible under D6)");
  // A reason that DOES carry another vocabulary token changes the closed hint => not bare on the paid side either.
  const tokenReason = await raiseVia(CS_ENV, "chainstack", rpcErrBody(3, "execution reverted: result too large"));
  assert.ok(tokenReason instanceof RpcError && tokenReason.detail !== "execution reverted, revert");
  assert.equal(isBareRevert(tokenReason), false, "a paid hint with an extra vocabulary token is not the bare hint");
});

// (3) a validated NON-EMPTY data is never bare (keyless AND paid): a custom-error revert has message "execution reverted"
// and data = selector (+ args). Kills "data check dropped".
test("bare_revert_requires_absent_or_empty_data", async () => {
  const custom = rpcErrBody(3, "execution reverted", "0xcafebabe");
  for (const [op, env] of OPERATORS) {
    const e = await raiseVia(env, op, custom);
    assert.ok(e instanceof RpcError && e.data === "0xcafebabe", `${op}: validated data carried`);
    assert.equal(isBareRevert(e), false, `${op}: a revert WITH data is never bare`);
    assert.equal(isRpcRevert(e), true, `${op}: a revert with data is a revert (isRpcRevert unchanged)`);
  }
});

// (3) C-4 code guard pinned: only 3 / -32000. A -32602 naming a revert is a param fault (benched), never bare; -32000 is
// bare. A non-RpcError is never bare. Kills "code guard dropped".
test("bare_revert_requires_code_3_or_minus_32000", async () => {
  for (const [op, env] of OPERATORS) {
    const bad = await raiseVia(env, op, rpcErrBody(-32602, "execution reverted"));
    assert.ok(bad instanceof RpcError && bad.code === -32602);
    assert.equal(isBareRevert(bad), false, `${op}: code -32602 is not a revert code => never bare`);
    const node = await raiseVia(env, op, rpcErrBody(-32000, "execution reverted"));
    assert.equal(isBareRevert(node), true, `${op}: code -32000 (node server error for a revert) is bare`);
  }
  const http = await raiseVia(CS_ENV, "chainstack", { error: "execution reverted" }, 500);
  assert.ok(http instanceof TransportError && http.name === "HttpError", "an HTTP fault is a TransportError, not an RpcError");
  assert.equal(isBareRevert(http), false, "an HttpError whose hint names a revert is never bare");
  assert.equal(isBareRevert(new Error("execution reverted")), false, "a plain Error is never bare");
});
