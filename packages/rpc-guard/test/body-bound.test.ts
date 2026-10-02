// RPC-GUARD-BODY-TIMEOUT-1 (C-BT of docs/G0-lot-rpcguard-first.md, D-3; orchestrator ruling Q-1 = opt-in): a client that asks for a
// bounded body (TransportOpts.boundBody, or a maxBodyBytes cap) holds ONE deadline per attempt over the head AND the body, and a byte
// cap; a client that does not ask keeps the legacy read (Bell, the Narabi sentinel). Both paths are pinned here, through the REAL
// openGuardedClient; globalThis.fetch answers a stream this file drives, which IGNORES the abort signal: only the transport's own
// race can end the read. No network: a socket or a name resolution throws (traps armed at import). The internal exports of
// transport.ts are read from its module namespace and a stalled call is raced against a delay, so a tree without the construction
// reds by an assertion, never by a missing export nor by a hang.
import { test } from "node:test";
import assert from "node:assert/strict";
import dns from "node:dns";
import net from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { openGuardedClient, TransportError, type CycleLedgerEntry, type RunLimits, type TransportOpts } from "@monark/rpc-guard";
import * as transport from "../src/transport.ts";
import { FAKE_HELIUS_ENV, HELIUS, tmp } from "./harness.ts";

net.Socket.prototype.connect = function trap(): never { throw new Error("body-bound: a socket was opened"); };
dns.lookup = ((): never => { throw new Error("body-bound: a name was resolved"); }) as never;

const NL = String.fromCharCode(10), enc = new TextEncoder(), CHUNK = 64 * 1024, TIMEOUT = 100;
const GTFA = "getTransactionsForAddress", PAGE: readonly unknown[] = ["addr", { limit: 100 }]; // a page of 100 reserves 10 credits
const LIMITS: RunLimits = { maxCalls: 10, runCaps: { helius: 1_000_000 }, methodCaps: { [GTFA]: 10 }, cycleFloor: { helius: 0 } };
type Hook = Array<[string, string, number | undefined]>;

/** The outcome of `p`, or "pending" when it did not settle within `ms` (a stall reds by an assertion, never by a hang). */
async function within(p: Promise<unknown>, ms: number): Promise<unknown> {
  let to: NodeJS.Timeout | undefined;
  try { return await Promise.race([p, new Promise<"pending">((r) => { to = setTimeout(() => { r("pending"); }, ms); })]); }
  finally { clearTimeout(to); }
}
/** Start ONE guarded gTFA call on its own cycle, fetch answering `answer`: `done` settles to the value or the error thrown. */
function start(dir: string, cycle: string, opts: TransportOpts, answer: Response): { done: Promise<unknown>; hook: Hook } {
  const realFetch = globalThis.fetch, hook: Hook = [];
  globalThis.fetch = () => Promise.resolve(answer);
  try { // fetch is called synchronously inside call(): restoring it in this finally is safe
    const onTransportError = (op: string, name: string, code: number | undefined): void => { hook.push([op, name, code]); };
    const c = openGuardedClient(FAKE_HELIUS_ENV, LIMITS, dir, { helius: cycle }, { timeoutMs: TIMEOUT, ...opts, onTransportError });
    return { done: c.call(HELIUS, GTFA, PAGE).catch((e: unknown) => e), hook };
  } finally { globalThis.fetch = realFetch; }
}
const ledgerOf = (dir: string, cycle: string): Array<[string, number]> => {
  const p = join(dir, cycle, "helius.jsonl");
  const es = existsSync(p) ? readFileSync(p, "utf8").split(NL).filter(Boolean).map((l) => JSON.parse(l) as CycleLedgerEntry) : [];
  return es.map((e) => [e.outcome, e.credits_derived]);
};
/** No endpoint byte (the fake key, the host, a URL) in a raised message. */
const scrubbed = (e: unknown): boolean => e instanceof Error && !/FAKEKEY|example|api-key|https?:/i.test(e.message);
/** A body this file drives: `first` at once, then nothing until release(rest) closes it; cancelled() tells the reader's cancel. */
function heldBody(first: string): { body: ReadableStream<Uint8Array>; release: (rest: string) => void; cancelled: () => boolean } {
  let release: (rest: string) => void = () => undefined, cancelled = false, closed = false;
  const body = new ReadableStream<Uint8Array>({
    start(c) { c.enqueue(enc.encode(first)); release = (rest) => { if (!cancelled && !closed) { closed = true; c.enqueue(enc.encode(rest)); c.close(); } }; },
    cancel() { cancelled = true; },
  });
  return { body, release: (rest) => { release(rest); }, cancelled: () => cancelled };
}
/** A body of EXACTLY `size` bytes pulled on demand in 64 KiB chunks, never materialized: the JSON of result 1 padded with blanks. */
function pulledBody(size: number): { body: ReadableStream<Uint8Array>; pulled: () => number; cancelled: () => boolean } {
  const head = enc.encode('{"result":1}');
  let sent = 0, cancelled = false;
  const body = new ReadableStream<Uint8Array>({
    pull(c) {
      if (sent >= size) { c.close(); return; }
      const b = new Uint8Array(Math.min(CHUNK, size - sent)).fill(32);
      if (sent === 0) b.set(head.subarray(0, b.length));
      sent += b.length;
      c.enqueue(b);
    },
    cancel() { cancelled = true; },
  }, { highWaterMark: 0 });
  return { body, pulled: () => sent, cancelled: () => cancelled };
}

// killer: packages/rpc-guard/src/transport.ts:130 SDL "const timer = setTimeout" -> ""
test("rpc_guard_attempt_deadline_bounds_a_body_that_never_ends", async () => {
  const { dir, cleanup } = tmp();
  const held = [heldBody('{"result":'), heldBody("busy"), heldBody('{"result":')];
  try {
    // (1) bounded: a 2xx whose body opens then stalls is cut at the attempt's deadline: AbortError, code = the status received, the
    //     reservation KEPT (an attempted line, no settled line); the hook gets the name and the code, the message no endpoint byte.
    const t0 = Date.now(), a = start(dir, "c-200", { boundBody: true }, new Response(held[0]?.body, { status: 200 }));
    const out = await within(a.done, TIMEOUT + 2000), ms = Date.now() - t0;
    assert.ok(out instanceof TransportError && out.name === "AbortError" && out.code === 200, `the stalled body is cut: ${String(out)}`);
    assert.ok(ms >= TIMEOUT - 30 && scrubbed(out) && held[0]?.cancelled() === true, `at the deadline (${String(ms)} ms), scrubbed, cancelled`);
    assert.deepEqual([a.hook, ledgerOf(dir, "c-200")], [[["helius", "AbortError", 200]], [["attempted", 10]]]);
    // (2) bounded: a 503 with Retry-After whose body never ends => HttpError 503, its retryAfterMs kept, an EMPTY detail; a received
    //     failure settles to 0 (Q-O1 (a) unchanged).
    const busy = new Response(held[1]?.body, { status: 503, headers: { "retry-after": "2" } });
    const err = await within(start(dir, "c-503", { boundBody: true }, busy).done, TIMEOUT + 2000);
    assert.ok(err instanceof TransportError && err.name === "HttpError" && err.code === 503, String(err));
    assert.deepEqual([err.retryAfterMs, err.detail, ledgerOf(dir, "c-503")], [2000, "", [["attempted", 10], ["settled", -10]]]);
    // (3) NOT bounded (no option, the legacy read): the same stalled body is NOT cut by the deadline; it is read to its end.
    const legacy = start(dir, "c-legacy", {}, new Response(held[2]?.body, { status: 200 }));
    assert.equal(await within(legacy.done, 3 * TIMEOUT), "pending", "the legacy read ignores the deadline once the head is in");
    held[2]?.release("1}");
    assert.equal(await within(legacy.done, 2000), 1, "then it reads the body to its end, unchanged");
  } finally { for (const h of held) h.release("1}"); cleanup(); }
});

// killer: packages/rpc-guard/src/transport.ts:141 ROR "bytes > maxBytes" -> "bytes >= maxBytes"
test("rpc_guard_body_cap_refuses_a_giant_body_by_name", async () => {
  assert.equal(transport.DEFAULT_MAX_BODY_BYTES, 8 * 1024 * 1024, "the default cap is 8 MiB");
  const { dir, cleanup } = tmp();
  try {
    const CAP = 3 * CHUNK + 5;
    // (1) exactly the cap: read and parsed.
    assert.equal(await within(start(dir, "c-exact", { maxBodyBytes: CAP }, new Response(pulledBody(CAP).body)).done, 5000), 1);
    // (2) the cap + 1: BodyTooLarge, code 200, its source cancelled, at most one chunk pulled past the cap, the reservation kept.
    const over = pulledBody(CAP + 1), o = start(dir, "c-over", { maxBodyBytes: CAP }, new Response(over.body));
    const err = await within(o.done, 5000);
    assert.ok(err instanceof TransportError && err.name === "BodyTooLarge" && err.code === 200 && scrubbed(err), String(err));
    assert.deepEqual([over.cancelled(), over.pulled() <= CAP + CHUNK, o.hook, ledgerOf(dir, "c-over")],
      [true, true, [["helius", "BodyTooLarge", 200]], [["attempted", 10]]]);
    // (3) a giant ERROR body: HttpError with its status and an EMPTY detail, never a partial body; its source cancelled.
    const giant = pulledBody(4 * CAP);
    const g = await within(start(dir, "c-500", { maxBodyBytes: CAP }, new Response(giant.body, { status: 500 })).done, 5000);
    assert.ok(g instanceof TransportError && g.name === "HttpError" && g.code === 500 && g.detail === "" && giant.cancelled(), String(g));
    // (4) boundBody alone takes the 8 MiB default: one byte over it is BodyTooLarge.
    const big = new Response(pulledBody(transport.DEFAULT_MAX_BODY_BYTES + 1).body);
    const d = await within(start(dir, "c-default", { boundBody: true }, big).done, 30_000);
    assert.ok(d instanceof TransportError && d.name === "BodyTooLarge", String(d));
    // (5) NOT bounded (no option): a body over the default is read and parsed, as before (Bell, the Narabi sentinel: unchanged).
    const legacy = new Response(pulledBody(transport.DEFAULT_MAX_BODY_BYTES + CHUNK).body);
    assert.equal(await within(start(dir, "c-legacy", {}, legacy).done, 30_000), 1);
    // (6) an invalid cap is refused by name BEFORE any lock: no cycle dir.
    for (const bad of [0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY]) {
      const open = (): unknown => openGuardedClient(FAKE_HELIUS_ENV, LIMITS, dir, { helius: "c-bad" }, { maxBodyBytes: bad });
      assert.throws(open, /maxBodyBytes must be a safe integer >= 1/, String(bad));
    }
    assert.equal(existsSync(join(dir, "c-bad")), false, "refused before any lock");
  } finally { cleanup(); }
});

// killer: packages/rpc-guard/src/transport.ts:142 CONST "dec.decode(r.value, { stream: true })" -> "dec.decode(r.value)"
test("rpc_guard_bounded_read_decodes_like_response_text", async () => {
  // The differential oracle is Response.text() (the platform's UTF-8 decode), never the reader under test.
  const read = transport.readBoundedBody;
  assert.equal(typeof read, "function", "the bounded reader is a function of transport.ts");
  const bytes = (...xs: number[]): Uint8Array => Uint8Array.from(xs);
  const mixed = enc.encode(`a${String.fromCodePoint(0xe9, 0x20ac, 0x1f600)}z`); // characters of 1, 2, 3 and 4 bytes
  const cases: Array<[string, Uint8Array[] | null]> = [
    ["a null body", null], ["an empty body", []], ["a leading BOM", [bytes(0xef, 0xbb, 0xbf, 0x7b, 0x7d)]],
    ["a BOM cut in two", [bytes(0xef), bytes(0xbb, 0xbf, 0x41)]], ["a 3-byte character cut in two", [bytes(0x22, 0xe2, 0x82), bytes(0xac, 0x22)]],
    ["invalid UTF-8", [bytes(0x61, 0xff, 0xfe, 0x62, 0xc3)]], ["one byte per chunk", [...mixed].map((b) => bytes(b))],
  ];
  for (const [name, chunks] of cases) {
    const want = await new Response(chunks === null ? null : Buffer.concat(chunks)).text();
    const body = chunks === null ? null : new ReadableStream<Uint8Array>({ start(c) { for (const x of chunks) c.enqueue(x); c.close(); } });
    assert.deepEqual(await read(new Response(body), new AbortController(), 1 << 20, Date.now() + 60_000), { text: want }, name);
  }
});
