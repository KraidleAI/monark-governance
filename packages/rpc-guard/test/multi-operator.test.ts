// GARDE-HELIUS-2 multi-operator core (C-2 + D3). A SECOND paid operator (chainstack, RU) alongside helius (credits):
// per-operator priors/units/floors/caps, an operator SUBSET on openGuardedClient (a Ukemi course never locks helius),
// an ATOMIC multi-lock with rollback, the prior FROZEN AFTER the lock, and the transport timeout/abort/error hook.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, appendFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { openGuardedClient, BudgetExceededError, TransportError, ETH_CALL_KEYLESS_LABELS, GET_LOGS_KEYLESS_LABELS, isResultLimit } from "@monark/rpc-guard";
import { makeClient, type OperatorClass, type RunLimits, type OperatorLabel } from "../src/client.ts";
import { ensureCycleDir, openOperatorLedger } from "../src/ledger.ts";
import { acquireLock, releaseLock, LockHeldError } from "../src/lock.ts";
import { chainstackRu, heliusCredits } from "../src/tariff.ts";
import { tmp, OK } from "./harness.ts";

const HELIUS = "helius" as OperatorLabel, CHAINSTACK = "chainstack" as OperatorLabel, DRPC = "drpc.org" as OperatorLabel;
const ENV_BOTH = { BELL_SOLANA_RPC: "https://example.invalid/HELIUS", HELIUS_API_KEY: "FAKEKEY-9z9z9z", CHAINSTACK_ETH_URL: "https://example.invalid/CHAINSTACK" };
const okFetch = (): Promise<Response> => Promise.resolve(new Response(JSON.stringify({ result: 1 }), { status: 200, headers: { "content-type": "application/json" } }));

test("two_paid_operators_keep_separate_priors_and_units", async () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    // C-V-1: through the PUBLIC path, so the FLOOR passed to `openOperatorLedger` in guarded.ts is under test (not just
    // assertLimits). DISTINCT discriminating floors against the FIXED caps (helius 8M, chainstack 16M): helius floor
    // 7_999_990 => the 2nd gTfA (10 cr) trips the cycle cap (1 transport); chainstack floor 15_999_990 => the 6th
    // eth_call (2 RU) trips it (5 transports = 10 RU). A SHARED floor (mutant "first operator's floor for all") breaks
    // one side: helius's floor on chainstack over-refuses, or chainstack's on helius under-refuses.
    const limits: RunLimits = { maxCalls: 100, runCaps: { helius: 1_000_000_000, chainstack: 1_000_000_000 }, methodCaps: { getTransactionsForAddress: 100, eth_call: 100 }, cycleFloor: { helius: 7_999_990, chainstack: 15_999_990 } };
    const client = openGuardedClient(ENV_BOTH, limits, dir, { helius: "cyc", chainstack: "cyc" });
    await client.call(HELIUS, "getTransactionsForAddress", ["m"]);                                                                   // 7999990 + 0 + 10 = 8000000 <= 8M => ok
    await assert.rejects(client.call(HELIUS, "getTransactionsForAddress", ["m"]), (e: unknown) => e instanceof BudgetExceededError);  // 7999990 + 10 + 10 > 8M
    for (let i = 0; i < 5; i++) await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]);                                              // 15999990 + 2i + 2; 5th = 16000000 (inclusive cap) => ok
    await assert.rejects(client.call(CHAINSTACK, "eth_call", [{}, "0x1"]), (e: unknown) => e instanceof BudgetExceededError);         // 15999990 + 10 + 2 > 16M
    // spent PER OPERATOR in the op's unit - credits (10) and RU (5 x 2 = 10) are NEVER summed (mutant "units merged" reds).
    assert.deepEqual(client.spent().byOperator, { helius: 10, chainstack: 10 });
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("paid_operator_requires_cycle_cap", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "cap");
    const mk = (op: string, cls: OperatorClass) => () => makeClient(
      { operators: { [op]: cls }, limits: { maxCalls: 10, runCaps: { [op]: 100 }, methodCaps: { eth_call: 1 }, cycleFloor: { [op]: 0 } } },
      new Map([[op, openOperatorLedger(cd, op, 0)]]), { transport: OK });
    // decision 115: EVERY paid operator (credits OR ru) must carry a cycle cap, else fail-closed at construction.
    assert.throws(mk("chainstack", { unit: "ru", credits: chainstackRu }), BudgetExceededError, "chainstack (ru) without a cycle cap");
    assert.throws(mk("helius", { unit: "credits", credits: heliusCredits }), BudgetExceededError, "helius (credits) without a cycle cap");
    assert.doesNotThrow(mk("chainstack", { unit: "ru", credits: chainstackRu, cycleCap: 16_000_000 }), "chainstack WITH a cap constructs");
  } finally { cleanup(); }
});

test("run_caps_are_per_operator_at_the_meter", async () => {
  // C-V-4: the run-cost cap is per OPERATOR at the METER (not just spent()). helius spends 50 credits under a high cap;
  // a chainstack run cap of 4 RU then admits EXACTLY 2 eth_call (2 x 2), the 3rd refused - helius's spend never
  // consumes chainstack's cap (mutant "run caps summed across operators" refuses the FIRST chainstack call).
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "cyc");
    const ops = { helius: { unit: "credits", credits: heliusCredits, cycleCap: 8_000_000 } as OperatorClass, chainstack: { unit: "ru", credits: chainstackRu, cycleCap: 16_000_000 } as OperatorClass };
    const limits: RunLimits = { maxCalls: 100, runCaps: { helius: 1000, chainstack: 4 }, methodCaps: { getTransactionsForAddress: 100, eth_call: 100 }, cycleFloor: { helius: 0, chainstack: 0 } };
    const client = makeClient({ operators: ops, limits }, new Map([["helius", openOperatorLedger(cd, "helius", 0)], ["chainstack", openOperatorLedger(cd, "chainstack", 0)]]), { transport: OK });
    for (let i = 0; i < 5; i++) await client.call(HELIUS, "getTransactionsForAddress", ["m"]); // 50 credits on helius (high cap)
    await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]);                                     // chainstack 0+2 <= 4 (mutant: 50+2 > 4 refuses)
    await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]);                                     // chainstack 2+2 = 4 <= 4 => ok
    await assert.rejects(client.call(CHAINSTACK, "eth_call", [{}, "0x1"]), (e: unknown) => e instanceof BudgetExceededError); // 4+2 > 4 => run_credits
    assert.deepEqual(client.spent().byOperator, { helius: 50, chainstack: 4 });
  } finally { cleanup(); }
});

test("ledger_stamps_tariff_version_per_operator", () => {
  // C-V-4: a chainstack ledger line carries "chainstack-...", a helius line "helius-..." (mutant "constant version" reds).
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "cyc");
    const h = openOperatorLedger(cd, "helius", 0); h.appendChained("attempted", { "helius|getTransaction": 1 }, 1);
    const c = openOperatorLedger(cd, "chainstack", 0); c.appendChained("attempted", { "chainstack|eth_call": 1 }, 2);
    const hv = h.entries()[0]!.tariff_version, cv = c.entries()[0]!.tariff_version;
    assert.notEqual(hv, cv, "tariff_version is PER OPERATOR (mutant: one constant for all)");
    assert.match(hv, /^helius-/); assert.match(cv, /^chainstack-/);
  } finally { cleanup(); }
});

test("keyless_operator_is_locked_when_requested", () => {
  // ruling (h): a keyless operator now has a CHAINED ledger; two unlocked writers fork it. So EVERY requested operator
  // is locked, keyless included (mutant "keyless never locked" reds here). Convention: cycles[keyless] = the paying
  // operator's cycle of the course.
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    const cd = ensureCycleDir(dir, "cyc");
    openGuardedClient(ENV_BOTH, { maxCalls: 100, runCaps: { chainstack: 1000 }, methodCaps: { eth_call: 100 }, cycleFloor: { chainstack: 0 } }, dir, { chainstack: "cyc", "drpc.org": "cyc" });
    assert.ok(existsSync(join(cd, "drpc.org.lock")), "a requested KEYLESS operator is locked (chained ledger integrity)");
    assert.ok(existsSync(join(cd, "chainstack.lock")), "the paid operator is locked too");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("keyless_method_attempts_never_spend_a_paid_method_cap", async () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1000 }, methodCaps: { eth_call: 1 }, cycleFloor: { chainstack: 0 } };
    const client = openGuardedClient(ENV_BOTH, limits, dir, { chainstack: "cyc", "drpc.org": "cyc" });
    // FIVE keyless eth_call (cost 0). They must NOT consume chainstack's per-method cap: the counter is keyed by
    // (op, method), so `drpc.org|eth_call` is separate from `chainstack|eth_call` (mutant: one global counter).
    for (let i = 0; i < 5; i++) await client.call(DRPC, "eth_call", [{}, "0x1"]);
    // the FIRST paid chainstack eth_call must still pass (cap 1). The global-counter mutant refuses it (5 >= 1).
    await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]);
    assert.equal(client.spent().byOperator.chainstack, 2, "one paid eth_call = 2 RU; the keyless calls stayed at 0 cost");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("unrequested_operator_is_never_locked", () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = okFetch;
  try {
    const cd = ensureCycleDir(dir, "cyc");
    // env resolves BOTH helius and chainstack, but the course requests ONLY chainstack (a Ukemi course).
    const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1000 }, methodCaps: { eth_call: 100 }, cycleFloor: { chainstack: 0 } };
    const client = openGuardedClient(ENV_BOTH, limits, dir, { chainstack: "cyc" });
    assert.deepEqual(client.operators().map(String), ["chainstack"], "ONLY the requested operator is opened (mutant: subset ignored)");
    assert.ok(existsSync(join(cd, "chainstack.lock")), "the requested operator IS locked");
    assert.ok(!existsSync(join(cd, "helius.lock")), "the UNREQUESTED helius is never locked (mutant: locks all resolved)");
    assert.ok(!existsSync(join(cd, "helius.jsonl")), "the UNREQUESTED helius is never even opened");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

test("multi_lock_acquire_is_atomic_with_rollback", () => {
  const { dir, cleanup } = tmp();
  try {
    const cd = ensureCycleDir(dir, "cyc");
    // BI-PROCESS: a real child process (node --eval, type-stripping the .ts import) acquires the `helius` lock and
    // exits; the lock is file existence, so it persists. execFileSync blocks until the child exits => deterministic.
    const lockUrl = new URL("../src/lock.ts", import.meta.url).href;
    const childCode = `const { acquireLock } = await import(${JSON.stringify(lockUrl)}); acquireLock(${JSON.stringify(cd)}, "helius");`;
    execFileSync(process.execPath, ["--eval", childCode], { stdio: "pipe" });
    assert.ok(existsSync(join(cd, "helius.lock")), "the child (process 2) holds the helius lock");
    // The parent requests {chainstack, helius}: locks acquire in SORTED order, so chainstack (1st) succeeds and helius
    // (2nd, held by the child) throws. The k-1 already-held lock (chainstack) MUST be rolled back, and 0 transport runs.
    let threw: unknown;
    const limits: RunLimits = { maxCalls: 100, runCaps: { helius: 1000, chainstack: 1000 }, methodCaps: { eth_call: 100, getTransaction: 100 }, cycleFloor: { helius: 0, chainstack: 0 } };
    try { openGuardedClient(ENV_BOTH, limits, dir, { chainstack: "cyc", helius: "cyc" }); } catch (e) { threw = e; }
    assert.ok(threw instanceof LockHeldError, "the k-th lock (helius) fails => LockHeldError, not a client");
    assert.ok(!existsSync(join(cd, "chainstack.lock")), "ATOMIC rollback: the k-1 lock (chainstack) was released (mutant: rollback removed => it persists)");
    assert.ok(existsSync(join(cd, "helius.lock")), "the child's helius lock is untouched by the rollback");
  } finally { cleanup(); }
});

test("prior_is_frozen_after_lock", () => {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  try {
    const cd = ensureCycleDir(dir, "cyc");
    const ledgerPath = join(cd, "chainstack.jsonl"), headPath = join(cd, "chainstack.head");
    const ENV = { CHAINSTACK_ETH_URL: "https://example.invalid/CS" };
    const limits: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1_000_000 }, methodCaps: { eth_call: 100 }, cycleFloor: { chainstack: 0 } };
    // A writer W holds the lock and leaves a MALFORMED partial line on disk (a crash mid-append). This is the
    // DETERMINISTIC barrier (no cross-process race): the sole public path must hit the held lock BEFORE it reads the
    // file. Correct => LockHeldError. The mutant "open the ledger before acquiring the lock" reads the malformed file
    // and throws /malformed/ instead - so the prior would be frozen from a stale/partial read.
    acquireLock(cd, "chainstack");
    appendFileSync(ledgerPath, "{ partial not-json\n");
    assert.throws(() => openGuardedClient(ENV, limits, dir, { chainstack: "cyc" }),
      (e: unknown) => e instanceof LockHeldError && !/malformed/i.test(String(e)), "open must be gated by the lock");
    // W repairs (fresh ledger), commits a VALID prior of 2 RU UNDER its lock, then releases.
    rmSync(ledgerPath, { force: true }); rmSync(headPath, { force: true });
    openOperatorLedger(cd, "chainstack", 0).appendChained("attempted", { "chainstack|eth_call": 1 }, 2);
    releaseLock(cd, "chainstack");
    // The on-disk prior now reflects W's committed 2 RU; the public path, opening the ledger UNDER the lock, sees it.
    assert.equal(openOperatorLedger(cd, "chainstack", 0).priorAtOpen(), 2, "the frozen prior includes the writer's committed 2 RU");
    globalThis.fetch = okFetch;
    const client = openGuardedClient(ENV, limits, dir, { chainstack: "cyc" });
    assert.deepEqual(client.operators().map(String), ["chainstack"], "the public path acquires once the lock is free");
  } finally { globalThis.fetch = realFetch; cleanup(); }
});

// C-V-2: the FOUR transport failure paths each throw a TYPED TransportError carrying the CODE (HTTP status or JSON-RPC
// code), a message SCRUBBED of every URL/key, and call the hook with (op, errorName, code). A JSON-RPC error at HTTP
// 200 MUST throw (never resolve `undefined`, which two errored providers would read as concordant). Drives one paid
// call and returns the thrown error + the hook observations.
const CS_ENV = { CHAINSTACK_ETH_URL: "https://SECRET-KEY-9z9z.example.invalid/rpc" };
const CS_LIMITS: RunLimits = { maxCalls: 100, runCaps: { chainstack: 1000 }, methodCaps: { eth_call: 100 }, cycleFloor: { chainstack: 0 } };
async function driveTransport(fetchStub: typeof globalThis.fetch, timeoutMs = 60, env: Record<string, string | undefined> = CS_ENV): Promise<{ err: unknown; seen: Array<[string, string, number | undefined]> }> {
  const { dir, cleanup } = tmp();
  const realFetch = globalThis.fetch;
  globalThis.fetch = fetchStub;
  const seen: Array<[string, string, number | undefined]> = [];
  try {
    const client = openGuardedClient(env, CS_LIMITS, dir, { chainstack: "cyc" }, { timeoutMs, onTransportError: (op, name, code) => { seen.push([op, name, code]); } });
    let err: unknown;
    try { await client.call(CHAINSTACK, "eth_call", [{}, "0x1"]); } catch (e) { err = e; }
    return { err, seen };
  } finally { globalThis.fetch = realFetch; cleanup(); }
}
const noUrl = (e: unknown): void => { const m = e instanceof Error ? e.message : String(e); assert.doesNotMatch(m, /SECRET-KEY|example\.invalid|api-key/i, `error leaks the endpoint: ${m}`); };

test("transport_error_path_network_abort", async () => {
  // a fetch that hangs until its AbortSignal fires (the 10 ms timeout) then rejects with an AbortError.
  const { err, seen } = await driveTransport((_input, init) => new Promise<Response>((_r, reject) => { init?.signal?.addEventListener("abort", () => { reject(new DOMException("aborted", "AbortError")); }); }), 10);
  assert.ok(err instanceof TransportError && err.name === "AbortError" && err.code === undefined, "network/abort => typed TransportError, no code");
  noUrl(err);
  assert.deepEqual(seen, [["chainstack", "AbortError", undefined]], "hook got (label, error NAME, undefined code), never the URL");
});

test("transport_error_path_http_non_ok_keeps_body", async () => {
  // D6: an HTTP 400 whose body a range-splitter needs (getLogsVia). For a PAID operator the CLOSED-vocabulary hint is
  // reprised (never a raw body byte) and it PRESERVES the range-split signal: isResultLimit still fires, the sorted
  // tokens are carried on `.detail`, and the non-token body words ("blocks are not supported") are dropped.
  const { err, seen } = await driveTransport(() => Promise.resolve(new Response("ranges over 10000 blocks are not supported", { status: 400 })));
  assert.ok(err instanceof TransportError && err.name === "HttpError" && err.code === 400, "HTTP non-ok => typed, code = status");
  const m = err instanceof Error ? err.message : "";
  assert.ok(isResultLimit(m), "the closed hint preserves the range-split signal (a splitter needs it)");
  assert.equal(err.detail, "10000, ranges over", "detail = the sorted closed hint (C-5), never a raw body byte");
  assert.doesNotMatch(m, /blocks are not supported/, "the raw non-token body is NOT reprised (D6: closed vocabulary only)");
  noUrl(err);
  assert.deepEqual(seen, [["chainstack", "HttpError", 400]]);
});

test("transport_error_path_non_json_body", async () => {
  const { err, seen } = await driveTransport(() => Promise.resolve(new Response("<html>502 Bad Gateway</html>", { status: 200 })));
  assert.ok(err instanceof TransportError && err.name === "NonJsonBody" && err.code === 200, "a non-JSON 200 body => typed fault, not a silent value");
  noUrl(err);
  assert.deepEqual(seen, [["chainstack", "NonJsonBody", 200]]);
});

test("transport_error_never_echoes_operator_key", async () => {
  // C-R-1: the Chainstack key is a PATH SEGMENT (and here also a query value) of CHAINSTACK_ETH_URL. A 401 body that
  // echoes it SCHEME-LESS, in MIXED case, or inside JSON must not leak it - scrubUrls (http(s):// only) is not enough.
  const HOST = "cs-node.example.invalid", PKEY = "FAKEKEY-PATH-9z9z9z9z", QKEY = "FAKEKEY-QUERY-8y8y8y8y";
  const env = { CHAINSTACK_ETH_URL: `https://${HOST}/${PKEY}?api-key=${QKEY}` };
  const body = [
    `${HOST}/${PKEY}`,                       // host + path key, scheme-less
    `${HOST.toUpperCase()}/${PKEY}`,         // MIXED (upper) case host
    PKEY, QKEY,                              // path key alone, query key alone
    `https://${HOST}/${PKEY}?api-key=${QKEY}`, // the full URL
    `{"error":"unauthorized ${QKEY}"}`,      // JSON-shaped (a real Chainstack body is JSON)
  ].join(" ; ");
  const { err, seen } = await driveTransport(() => Promise.resolve(new Response(body, { status: 401 })), 60, env);
  assert.ok(err instanceof TransportError && err.code === 401, "typed TransportError, code 401 preserved");
  // C-G-4 / DEV-5: on the PAID path the detail is the closed hint; this body carries NO vocabulary token, so the hint
  // (and thus any key leak) is structurally EMPTY - the doesNotMatch belts below now guard a proven-empty detail.
  assert.equal(err.detail, "", "DEV-5: a paid body with no vocabulary token yields an EMPTY closed hint");
  const msg = err instanceof Error ? err.message : String(err);
  assert.doesNotMatch(msg, /FAKEKEY-PATH|FAKEKEY-QUERY/i, `an operator KEY leaked into the message: ${msg}`);
  assert.doesNotMatch(msg, /cs-node\.example\.invalid/i, `the operator HOST leaked into the message: ${msg}`);
  assert.deepEqual(seen, [["chainstack", "HttpError", 401]], "hook got (label, name, code) only - never the body");
});

test("transport_error_drops_body_when_operator_url_unparseable", async () => {
  // C-R-1 FAIL-CLOSED: if the operator URL is unparseable, the body cannot be redacted, so it is NOT reprised at all
  // (the range-split hint is worth nothing next to a leaked key). Mutant "fail-closed => open" (return scrubUrls) reds.
  const KEY = "FAKEKEY-RAW-7x7x7x";
  const { err } = await driveTransport(() => Promise.resolve(new Response(`401: not-a-url-${KEY} rejected`, { status: 401 })), 60, { CHAINSTACK_ETH_URL: `not-a-url-${KEY}` });
  assert.ok(err instanceof TransportError && err.code === 401);
  assert.equal(err.detail, "", "C-G-4 / DEV-5: paid closed hint is empty (this body has no vocabulary token)");
  assert.doesNotMatch(err instanceof Error ? err.message : String(err), new RegExp(KEY), "an unparseable url must DROP the body, not reprise it raw");
});

test("transport_error_key_straddling_truncation_never_leaks", async () => {
  // C-R-3: redact must see the RAW body, not the collapsed+truncated one, or a key crossing the 160th char leaks its
  // prefix. The key starts at ~char 151 and straddles the 160-char truncation - on BOTH paths (HTTP non-ok, non-JSON).
  const KEY = "FAKEKEY-STRADDLE-0123456789", HOST = "cs-node.example.invalid";
  const env = { CHAINSTACK_ETH_URL: `https://${HOST}/${KEY}` };
  const body = "x".repeat(150) + " " + KEY;
  const noPrefix = (msg: string): void => { for (let n = KEY.length; n >= 4; n--) assert.ok(!msg.includes(KEY.slice(0, n)), `a >= 4-char prefix of the key leaked (n=${String(n)}): ${msg}`); };
  const a = await driveTransport(() => Promise.resolve(new Response(body, { status: 400 })), 60, env); // path A: HTTP non-ok
  assert.ok(a.err instanceof TransportError && a.err.code === 400 && a.err.name === "HttpError");
  assert.equal(a.err.detail, "", "C-G-4 / DEV-5: paid HttpError closed hint is empty (no vocabulary token)");
  noPrefix(a.err instanceof Error ? a.err.message : "");
  const b = await driveTransport(() => Promise.resolve(new Response(body, { status: 200 })), 60, env); // path B: non-JSON at 200
  assert.ok(b.err instanceof TransportError && b.err.name === "NonJsonBody");
  assert.equal(b.err.detail, "", "C-G-4 / C-2: NonJsonBody emits no hint at all");
  noPrefix(b.err instanceof Error ? b.err.message : "");
});

test("transport_error_never_echoes_operator_userinfo", async () => {
  // C-GD-1: cover the userinfo class - if CHAINSTACK_ETH_URL carries user:key@host, a body echoing the credentials must not leak.
  const USER = "csuser", PASS = "FAKEKEY-USERINFO-5w5w5w";
  const env = { CHAINSTACK_ETH_URL: `https://${USER}:${PASS}@cs-node.example.invalid/rpc` };
  const body = `401 unauthorized for ${USER}:${PASS} ; pass=${PASS}`;
  const { err } = await driveTransport(() => Promise.resolve(new Response(body, { status: 401 })), 60, env);
  assert.ok(err instanceof TransportError && err.code === 401);
  assert.equal(err.detail, "", "C-G-4 / DEV-5: paid closed hint is empty (this userinfo body has no vocabulary token)");
  assert.doesNotMatch(err instanceof Error ? err.message : "", /FAKEKEY-USERINFO/i, "the userinfo password (the operator key) leaked");
});

test("transport_error_path_json_rpc_error_never_resolves_undefined", async () => {
  // THE 1a bug: a JSON-RPC error at HTTP 200 used to return `.result` = undefined (two errored providers "concordant").
  const body = JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: -32000, message: "execution reverted" } });
  const { err, seen } = await driveTransport(() => Promise.resolve(new Response(body, { status: 200, headers: { "content-type": "application/json" } })));
  assert.ok(err instanceof TransportError, "a JSON-RPC error MUST throw, never resolve undefined");
  assert.ok(err instanceof TransportError && err.name === "RpcError" && err.code === -32000, "carries the JSON-RPC code (a downstream quorum tells a revert from a fault)");
  assert.match(err instanceof Error ? err.message : "", /execution reverted/);
  noUrl(err);
  assert.deepEqual(seen, [["chainstack", "RpcError", -32000]]);
});

test("keyless_eth_labels_pinned_to_recorder_order", async (t) => {
  // LOCK the exported keyless ETH label lists to the recorder's PINNED provider order (rpc2.ts). A non-literal
  // dynamic import (the ledger-format-lock precedent) keeps the public-export typecheck green and SKIPs when
  // apps/sentinel is absent (public tree); in the repo CI a drift on either side reds.
  const rpc2Rel = "../../../apps/sentinel/src/ukemi/rpc2.ts", rpcRel = "../../../apps/sentinel/src/rpc.ts";
  if (!existsSync(new URL(rpc2Rel, import.meta.url))) { t.skip("apps/sentinel absent (public export tree); the lock runs in the repo CI"); return; }
  const spec2: string = rpc2Rel, spec1: string = rpcRel; // non-literal => tsc leaves them unresolved
  const rpc2 = (await import(spec2)) as { ETH_CALL_PROVIDERS: readonly string[]; GET_LOGS_PROVIDERS: readonly string[] };
  const rpc = (await import(spec1)) as { providerOf: (u: string) => string };
  assert.deepEqual(rpc2.ETH_CALL_PROVIDERS.map(rpc.providerOf), [...ETH_CALL_KEYLESS_LABELS], "eth_call keyless labels drifted from the recorder order");
  assert.deepEqual(rpc2.GET_LOGS_PROVIDERS.map(rpc.providerOf), [...GET_LOGS_KEYLESS_LABELS], "getLogs keyless labels drifted from the recorder order");
});
