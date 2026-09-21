// GARDE-HELIUS-2b (D6 + C-1..C-5): the transport error surface. For a PAID operator a raised error carries ONLY a
// CLOSED-vocabulary hint of the body (never a raw byte); the JSON-RPC path throws the CANONICAL RpcError with a
// VALIDATED hex `.data`; a NonJsonBody carries no hint at all; a keyless operator surfaces its redacted body (and a
// keyless revert exposes its scrubbed message WITHOUT the preamble, so two keyless providers concord). The vocabulary
// is single-source (classify.ts): `predicate(hint) === predicate(body)` for isResultLimit / isPlanLimited / isRevertText.
// The transport is driven directly (resolveOperators is internal); globalThis.fetch is stubbed and always restored.
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveOperators, MAX_REVERT_DATA_HEX } from "../src/transport.ts";
import { RpcError, TransportError } from "../src/errors.ts";
import type { OperatorLabel } from "../src/client.ts";
// Imported from the PUBLIC surface (rpc2.ts consumes them the same way across the package boundary, C-4).
import { isResultLimit, isPlanLimited, isRevertText, isRpcRevert, closedHint, ERROR_HINT_TOKENS } from "@monark/rpc-guard";

const HOST = "cs-node.example.invalid";
const PKEY = "FAKEKEY-CS-PATH-9z9z9z9z"; // the Chainstack key = a non-trivial PATH SEGMENT of CHAINSTACK_ETH_URL
const CS_ENV = { CHAINSTACK_ETH_URL: `https://${HOST}/${PKEY}` };

/** Drive ONE call of `op` through the resolved transport with a stubbed fetch; return the thrown error (or undefined). */
async function raiseVia(env: Record<string, string | undefined>, op: string, fetchStub: typeof globalThis.fetch): Promise<unknown> {
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetchStub;
  try {
    const { transport } = resolveOperators(env);
    return await transport(op as OperatorLabel, "eth_call", [{}, "0x1"]).then(() => undefined, (e: unknown) => e);
  } finally { globalThis.fetch = realFetch; }
}
const httpResp = (body: string, status: number): Response => new Response(body, { status });
const jsonResp = (o: unknown, status = 200): Response => new Response(JSON.stringify(o), { status, headers: { "content-type": "application/json" } });
const msgOf = (e: unknown): string => (e instanceof Error ? e.message : String(e));

// C-5: the hint is the SORTED, DEDUPLICATED set of CANONICAL tokens (literals from the vocabulary, never a body
// substring). Present twice in the body => once in the hint; no token => "".
test("closed_hint_is_sorted_deduplicated_canonical_tokens", () => {
  assert.equal(closedHint("ranges over 10000 blocks; 10000 again; ranges over twice"), "10000, ranges over", "sorted + deduplicated canonical literals");
  assert.equal(closedHint("Execution REVERTED: overflow"), "execution reverted, revert", "case-insensitive match, canonical lower-case literals");
  assert.equal(closedHint("header not found"), "", "a body with no vocabulary token yields an empty hint");
  for (const tok of closedHint("query returned more than 10000 results and free plan").split(", ")) {
    assert.ok(ERROR_HINT_TOKENS.includes(tok), `every hint token '${tok}' is a vocabulary literal (never a body substring)`);
  }
  const sorted = closedHint("free plan; too large; block range; 10000");
  assert.deepEqual(sorted.split(", "), [...sorted.split(", ")].sort(), "the hint is sorted");
});

// C-4 / D6 / C-R-3: the vocabulary is SINGLE-SOURCE, so every predicate agrees on the hint and on the body it was built
// from - including the THREE bodies the recorder measured (apps/sentinel/test/pool-rpc-1a.test.ts:101-103, copied
// LITERALLY, never imported: that file registers tests on import). Two Pocket range caps + a dRPC free-plan cap.
test("error_vocabulary_single_source_conformance_hint_equals_body", () => {
  const POCKET_5000 = "query block range exceeds server limit, narrow your filter: 5000";
  const POCKET_10000 = "query exceeds max block range 10000";
  const DRPC_FREE = "ranges over 10000 blocks are not supported on free plan";
  const bodies = [
    "query returned more than 10000 results",                       // range/result cap
    "ranges over 10000 blocks are not supported on free plan",      // plan-limited
    "execution reverted: SafeMath subtraction overflow",            // revert
    "block range is too large, narrow your filter",                 // range cap, two tokens
    "<html><body>502 Bad Gateway: no result here</body></html>",    // an HTML page carrying "result"
    "header not found",                                             // benign, no token
    POCKET_5000, POCKET_10000, DRPC_FREE,                           // the measured recorder caps (rpc2 getLogsVia)
    "Reverted: out of gas",                                         // a BARE revert (no "execution reverted")
  ];
  for (const b of bodies) {
    const h = closedHint(b);
    assert.equal(isResultLimit(h), isResultLimit(b), `isResultLimit drift on '${b}' -> hint '${h}'`);
    assert.equal(isPlanLimited(h), isPlanLimited(b), `isPlanLimited drift on '${b}' -> hint '${h}'`);
    assert.equal(isRevertText(h), isRevertText(b), `isRevertText drift on '${b}' -> hint '${h}'`);
  }
  // C-R-3: the measured Pocket caps SPLIT (isResultLimit), the dRPC free plan BENCHES first (isPlanLimited precedence).
  assert.ok(isResultLimit(POCKET_5000) && isResultLimit(POCKET_10000) && isResultLimit(DRPC_FREE), "the recorder range/plan caps all match isResultLimit");
  assert.ok(isPlanLimited(DRPC_FREE) && !isPlanLimited(POCKET_5000) && !isPlanLimited(POCKET_10000), "only the free-plan cap is plan-limited (bench, not split)");
  // C-R-3: a BARE revert (no "execution reverted") is revert text - the `revert` alternative is load-bearing (reds V12,
  // which drops it). The conformance loop cannot catch this (both hint and body go false under V12, still equal).
  assert.equal(isRevertText("Reverted: out of gas"), true, "a bare revert (no 'execution') is still revert text");
});

// D6: a PAID HTTP 400 body carrying BOTH a vocabulary token AND a fake base64 key surfaces the token, NEVER the key.
test("paid_operator_http_error_reprises_only_the_closed_hint", async () => {
  const B64KEY = "cGF0aC1zZWNyZXQtOXo5ejl6"; // a base64 blob shaped like a server-transformed key
  const err = await raiseVia(CS_ENV, "chainstack", () => Promise.resolve(httpResp(`block range too large ${PKEY} ${B64KEY} ${HOST}`, 400)));
  assert.ok(err instanceof TransportError && err.name === "HttpError" && err.code === 400, "typed HttpError, code 400");
  const m = msgOf(err);
  assert.ok(isResultLimit(m), "the range-split signal survives via the closed hint");
  assert.equal(err.detail, "block range, too large", "detail = the sorted closed hint only");
  assert.doesNotMatch(m, new RegExp(`${PKEY}|${B64KEY}|${HOST}`, "i"), "no key/host/base64-blob byte reaches the message (structurally closed)");
});

// C-1(a)/(c): the JSON-RPC path throws the CANONICAL RpcError (instanceof BOTH RpcError and TransportError), carrying
// the code and a VALIDATED hex `.data`. A paid revert WITH data is a revert (isRpcRevert true).
test("paid_rpc_error_is_canonical_class_with_validated_data", async () => {
  const DATA = "0x08c379a0" + "00".repeat(4); // an ABI Error(string) selector + padding: valid, non-key hex
  const err = await raiseVia(CS_ENV, "chainstack", () => Promise.resolve(jsonResp({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted", data: DATA } })));
  assert.ok(err instanceof RpcError, "the JSON-RPC path throws the canonical RpcError (C-1(a))");
  assert.ok(err instanceof TransportError, "RpcError IS a TransportError (one classifier for retry/bench)");
  assert.equal(err.code, 3);
  assert.equal(err.data, DATA, "the validated hex revert data is carried (C-1(c), revertKey compares it)");
  assert.equal(err.detail, "execution reverted, revert", "detail = closed hint");
  assert.ok(isRpcRevert(err), "a paid revert WITH data is a revert");
});

// C-1(c): `.data` is reprised ONLY as bounded hex. Non-hex, over-long, or a value carrying the KEY's UTF-8 hex is dropped.
test("revert_data_is_validated_hex_bounded_and_never_the_key", async () => {
  const drive = (data: unknown): Promise<unknown> => raiseVia(CS_ENV, "chainstack", () => Promise.resolve(jsonResp({ jsonrpc: "2.0", id: 1, error: { code: -32000, message: "execution reverted", data } })));
  assert.equal((await drive("not-hex") as RpcError).data, undefined, "non-hex data is dropped (not a free-text channel)");
  assert.equal((await drive("0x" + "a".repeat(MAX_REVERT_DATA_HEX + 2)) as RpcError).data, undefined, "over-long data (> the declared bound) is dropped");
  assert.equal((await drive("0xdeadbeef") as RpcError).data, "0xdeadbeef", "clean bounded hex is kept");
  // c-bis: the hex itself CARRIES the path key's UTF-8 hex => dropped (another C-GD-2 form).
  const keyHex = Buffer.from(PKEY, "utf8").toString("hex");
  assert.equal((await drive("0x" + keyHex + "cafe") as RpcError).data, undefined, "data carrying the key's UTF-8 hex is dropped (c-bis)");
});

// C-1(c): a PAID revert with NO `.data` is BENCHED (isRpcRevert false) - never concorded on a closed hint. A KEYLESS
// revert with no data IS a revert (its scrubbed message is the datum two providers concord on).
test("paid_revert_without_data_is_benched_keyless_revert_is_not", async () => {
  const paid = await raiseVia(CS_ENV, "chainstack", () => Promise.resolve(jsonResp({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted" } })));
  assert.ok(paid instanceof RpcError && paid.data === undefined, "paid revert, no data");
  assert.equal(isRpcRevert(paid), false, "a paid revert with no data is benched (C-1(c))");
  const keyless = await raiseVia({}, "drpc.org", () => Promise.resolve(jsonResp({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted: reason" } })));
  assert.ok(keyless instanceof RpcError && keyless.unit === "keyless", "keyless revert");
  assert.equal(isRpcRevert(keyless), true, "a keyless revert with no data IS a revert (concords on its scrubbed message)");
});

// C-1(c): a KEYLESS RpcError message has NO operator-label preamble, so two keyless providers' reverts can concord.
test("keyless_rpc_error_message_has_no_preamble", async () => {
  const err = await raiseVia({}, "mevblocker.io", () => Promise.resolve(jsonResp({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted: X" } })));
  assert.ok(err instanceof RpcError);
  assert.equal(msgOf(err), "execution reverted: X", "the keyless revert message is the scrubbed body, no 'rpc-guard:' preamble");
  assert.doesNotMatch(msgOf(err), /rpc-guard:|operator/, "no preamble (else two keyless providers never concord)");
});

// C-2: a NonJsonBody carries NO hint at all (paid AND keyless) - an HTML page containing "result" must not trip a
// range split (up to 2^20 calls on a paid operator). detail = "" and isResultLimit(message) is false.
test("non_json_body_emits_no_hint_paid_and_keyless", async () => {
  const html = "<html><body>502: no result found, ranges over 10000</body></html>"; // carries tokens, but it is a mis-route
  for (const [env, op] of [[CS_ENV, "chainstack"], [{}, "drpc.org"]] as const) {
    const err = await raiseVia(env, op, () => Promise.resolve(httpResp(html, 200)));
    assert.ok(err instanceof TransportError && err.name === "NonJsonBody", `${op}: a non-JSON 200 is a typed NonJsonBody`);
    assert.equal(err.detail, "", `${op}: NonJsonBody emits NO hint (C-2)`);
    assert.equal(isResultLimit(msgOf(err)), false, `${op}: the message carries no range-split token (no split on an HTML page)`);
    assert.doesNotMatch(msgOf(err), /ranges over|result/, `${op}: no body token reaches the message`);
  }
});

// A KEYLESS HTTP error surfaces its REDACTED body (its URL has no key), so the free-quorum diagnosis is not blind -
// this keeps `redact` load-bearing (the paid path never uses it; the c-bis data check shares its target enumeration).
test("keyless_http_error_reprises_redacted_body", async () => {
  const err = await raiseVia({}, "drpc.org", () => Promise.resolve(httpResp("ranges over 10000 blocks are not supported on free plan", 400)));
  assert.ok(err instanceof TransportError && err.name === "HttpError" && err.code === 400);
  assert.match(msgOf(err), /ranges over 10000/, "a keyless body IS surfaced (no secret to hide)");
  assert.ok(isPlanLimited(msgOf(err)), "the plan-limit signal survives so getLogsVia benches the provider");
});

// C-5 belt: the fixed preamble + code NEVER contains a vocabulary token, for EVERY resolved operator label x EVERY
// error name x representative codes - so the hint is the SOLE token carrier (a false token would trip a range split).
test("error_preamble_carries_no_vocabulary_token", () => {
  const env = { BELL_SOLANA_RPC: "https://sol.example.invalid", HELIUS_API_KEY: "FAKEKEY-9z", CHAINSTACK_ETH_URL: CS_ENV.CHAINSTACK_ETH_URL };
  const ops = Object.keys(resolveOperators(env).classes);
  assert.ok(ops.length >= 6, "several operators resolved");
  const names = ["AbortError", "TypeError", "NetworkError", "HttpError", "NonJsonBody", "RpcError"];
  const codes: Array<number | undefined> = [undefined, 3, -32000, 400, 401, 429, 500];
  for (const op of ops) for (const name of names) for (const code of codes) {
    const codeStr = code !== undefined ? ` (code ${String(code)})` : "";
    const preamble = `rpc-guard: ${name} for operator '${op}'${codeStr}`;
    assert.equal(closedHint(preamble), "", `preamble carries a vocabulary token: '${preamble}'`);
  }
});

// C-R-1: D6's structural closure must hold for BOTH paid operators (helius credits, chainstack ru), not chainstack alone.
// A helius HTTP 400 whose body carries the API key, ITS base64 form, and a token surfaces ONLY the closed hint. Reds V1
// (paid = op === "chainstack": helius then falls to the keyless redact path, which cannot strip a base64-transformed key).
test("paid_helius_http_error_reprises_only_the_closed_hint", async () => {
  const HKEY = "FAKEKEY-HELIUS-7q7q7q7q", HHOST = "sol.example.invalid";
  const B64 = Buffer.from(HKEY, "utf8").toString("base64"); // the base64 form of the key (a C-GD-2 server transform)
  const env = { BELL_SOLANA_RPC: `https://${HHOST}`, HELIUS_API_KEY: HKEY };
  const err = await raiseVia(env, "helius", () => Promise.resolve(httpResp(`block range too large ${HKEY} ${B64} ${HHOST}`, 400)));
  assert.ok(err instanceof TransportError && err.name === "HttpError" && err.code === 400, "typed HttpError, code 400");
  const m = msgOf(err);
  assert.ok(isResultLimit(m), "the range-split signal survives via the closed hint (helius too)");
  assert.equal(err.detail, "block range, too large", "detail = the sorted closed hint only");
  assert.ok(!m.includes(HKEY) && !m.includes(B64) && !m.includes(HHOST), `no helius key/base64/host byte reaches the message: ${m}`);
});

// C-R-4: redact must see the RAW keyless body, not the collapsed+truncated one. A drpc.org host at char ~150 straddles
// the 160-char truncation; redacting the raw body strips it, truncating FIRST leaks a host prefix. Reds V2 (targets
// removed => scrubUrls-only leaves a scheme-less host) and V3 (truncate before redact => the full host is no longer
// matched). Keyless URLs carry no secret; this pins redact as defense in depth (its target enumeration feeds c-bis).
test("keyless_host_after_truncation_is_redacted_on_the_raw_body", async () => {
  const HHOST = "eth.drpc.org";
  const err = await raiseVia({}, "drpc.org", () => Promise.resolve(httpResp("x".repeat(150) + " " + HHOST, 400)));
  assert.ok(err instanceof TransportError && err.name === "HttpError" && err.code === 400);
  const m = msgOf(err);
  for (let n = HHOST.length; n >= 4; n--) assert.ok(!m.includes(HHOST.slice(0, n)), `a >= 4-char keyless host prefix leaked (n=${String(n)}): ${m}`);
});

// C-G-2: validateRevertData is FAIL-CLOSED on an unparseable operator url - secretTargets returns undefined, so the key
// cannot be proven absent from the data, so the data is dropped. A parseable CS_ENV never exercises this branch. Reds
// MY2. NOTE (measured): this mutation is byte-identical to the validator's V11, so this test reds V11 too. V11 "survived"
// end-to-end only because openGuardedClient throws on the bad url BEFORE the RpcError path; raiseVia stubs fetch and
// reaches validateRevertData. The gap the validator (V11) and the G2 (MY2) both found is closed by one test.
test("revert_data_dropped_when_operator_url_unparseable", async () => {
  const err = await raiseVia({ CHAINSTACK_ETH_URL: "not-a-url-FAKEKEY-9z" }, "chainstack", () => Promise.resolve(jsonResp({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted", data: "0xdeadbeef" } })));
  assert.ok(err instanceof RpcError && err.code === 3, "the JSON-RPC path still throws the canonical RpcError");
  assert.equal(err.data, undefined, "an unparseable operator url DROPS the revert data (fail-closed: the key cannot be proven absent)");
});

// C-R-3: isRpcRevert requires a JSON-RPC code in {3, -32000}. An RpcError with a code OUTSIDE that set is a rate/param
// fault the quorum must bench, NOT a revert - even when its message carries revert text. Reds V9 and MY3 (code guard
// removed => any revert-ish text would concord as a revert).
test("rpc_revert_requires_the_json_rpc_code_3_or_minus_32000", async () => {
  const err = await raiseVia({}, "drpc.org", () => Promise.resolve(jsonResp({ jsonrpc: "2.0", id: 1, error: { code: -32602, message: "execution reverted: bad params" } })));
  assert.ok(err instanceof RpcError && err.code === -32602, "a non-revert-code JSON-RPC error is still a thrown RpcError");
  assert.equal(isRpcRevert(err), false, "isRpcRevert is false for a code outside {3, -32000} despite revert text");
});

// C-G-1: pin C-4 STRUCTURALLY. Every alternative of every classifier regex must be a vocabulary token (ERROR_HINT_TOKENS),
// so a predicate can never recognize a signal the closed hint cannot emit (a drift that splits, or fails to split, a range
// the paid hint disagrees with). The one regex-form alternative, "ranges? over", is covered by its two literal expansions
// ("range over" / "ranges over"), both in the table. Reds MY1 (adds "|block limit" to isResultLimit but not the table).
test("error_vocabulary_regex_alternatives_are_all_hint_tokens", () => {
  const tokens = new Set(ERROR_HINT_TOKENS);
  const regexBody = (fn: (m: string) => boolean): string => { const g = fn.toString().match(/\/([^/]*)\/i/)?.[1]; assert.ok(g, "no case-insensitive regex literal in the predicate source"); return g; };
  const covered = (alt: string): boolean => {
    if (tokens.has(alt)) return true;
    const q = alt.indexOf("?"); // expand a single optional-char quantifier: "ranges? over" -> "range over" | "ranges over"
    if (q > 0) return tokens.has(alt.slice(0, q - 1) + alt.slice(q + 1)) && tokens.has(alt.slice(0, q) + alt.slice(q + 1));
    return false;
  };
  for (const fn of [isResultLimit, isPlanLimited, isRevertText]) {
    for (const alt of regexBody(fn).split("|")) {
      assert.ok(covered(alt), `regex alternative '${alt}' is not a vocabulary token (C-4 drift: the closed hint could not emit it)`);
    }
  }
});
