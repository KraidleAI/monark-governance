// test/l2-rest.test.ts -- lot P1-b1 of ADR-L2-CAPTURE-1 (plan docs/G0-partie-l2-p1.md section 8.2; lot plan docs/G0-lot-l2-p1-b1.md):
// the REST client of the L2 recorder against the loopback fake place of P1-a1, through its injected fetch (the global fetch and
// WebSocket are tripwires). The module is loaded by a dynamic import that each test asserts, so the base, which has no scripts/l2/,
// reddens by assertion. Each test names, on the line above it, the mutation of scripts/l2/rest.mjs that reddens it. Synthetic data only.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { channel } from "node:diagnostics_channel";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startPlace, trap, viaFetch, type Place, type Reply } from "./l2-fake-place.ts";
import type * as Rest from "../scripts/l2/rest.mjs";

trap();
const places: Place[] = [], outs: string[] = [], tmp = (): string => { const d = mkdtempSync(join(tmpdir(), "l2-rest-")); outs.push(d); return d; };
after(async () => { for (const p of places) await p.stop(); for (const d of outs) rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); });
const T0 = 1_760_000_000_000_000; // a synthetic wall clock in microseconds

async function load(): Promise<typeof Rest> {
  const m = await import("../scripts/l2/rest.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/rest.mjs is absent");
}

/** A client on a fresh place answering `script(path)`; each clock read returns `clock.us` then adds `clock.step` (sent != received);
 *  `inits` spies on the fetch init of every request. */
async function rig(script: (path: string) => Reply, R0?: typeof Rest): Promise<{ R: typeof Rest; c: Rest.RestClient; place: Place; out: string;
  clock: { us: number; step: number }; inits: RequestInit[] }> {
  const R = R0 ?? await load();
  const place = await startPlace(() => undefined, script);
  places.push(place);
  const out = tmp(), clock = { us: T0, step: 3 }, inits: RequestInit[] = [], f = viaFetch(place, [R.ORIGIN]);
  const nowUs = (): number => { const t = clock.us; clock.us += clock.step; return t; };
  const c = R.createRest({ fetch: (url, init) => { inits.push(init); return f(url, init); }, nowUs, out });
  return { R, c, place, out, clock, inits };
}
const stopOf = async (p: Promise<unknown>): Promise<{ code: string; text: string }> => {
  try { await p; } catch (e) { return { code: String((e as { code?: unknown }).code), text: `${String(e)} ${JSON.stringify((e as { detail?: unknown }).detail)}` }; }
  return { code: "answered", text: "" };
};
const lines = (out: string): Rest.RequestLine[] =>
  readFileSync(join(out, "requests.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rest.RequestLine);
async function code(p: Promise<unknown>): Promise<string> {
  try { await p; } catch (e) { return String((e as { code?: unknown }).code); }
  return "answered";
}

// killer: scripts/l2/rest.mjs:29 CONST "weight: 250" -> "weight: 251"
test("l2_rest_logged_and_kept_before_read", async () => {
  const depth = Buffer.from("{\"lastUpdateId\":7,\"x\":[[\"0.10\",\"1.000\"]]}\n"), bad = Buffer.from("not json {");
  const { R, c, place, out, inits } = await rig((p) => (p.startsWith("/api/v3/depth") ? { status: 200, body: depth, headers: { "x-mbx-used-weight-1m": "250" } }
    : { status: 200, body: bad }));
  const a = await c.request("depth", "BTCUSDT");
  assert.ok(a.body.equals(depth));
  assert.ok(readFileSync(join(out, a.kept)).equals(depth), "the 200 body is kept as received");
  assert.equal(a.kept, "rest/BTCUSDT/BTCUSDT-depth-20251009T085320000000Z.json");
  // G2 B3: the init is exactly { redirect: "manual", signal } (the 30 s timeout signal, no header).
  assert.deepEqual(Object.keys(inits[0] ?? {}).sort(), ["redirect", "signal"]);
  assert.ok(inits[0]?.signal instanceof AbortSignal && inits[0].redirect === "manual");
  const l = lines(out)[0];
  assert.deepEqual([l?.kind, l?.weight, l?.status, l?.bytes, l?.sha256, l?.kept, l?.headers["x-mbx-used-weight-1m"], l?.tls_peer_sha256, l?.sent_us,
    l?.received_us], ["depth", 250, 200, depth.length, createHash("sha256").update(depth).digest("hex"), a.kept, "250", null, T0, T0 + 3]);
  assert.equal(place.calls[0], "/api/v3/depth?symbol=BTCUSDT&limit=5000");
  // exchangeInfo and time: paths and weights; a body that is not JSON is kept before the parse stops.
  const e = await c.request("exchangeInfo", "ETHUSDT");
  assert.ok(readFileSync(join(out, e.kept)).equals(bad));
  assert.equal(await code(Promise.resolve().then(() => R.exchangeInfoFacts(e.body))), "body_not_json");
  assert.equal((await c.request("time", null)).kept, "rest/ALL/ALL-time-20251009T085320000012Z.json");
  assert.deepEqual(place.calls.slice(1), ["/api/v3/exchangeInfo?symbol=ETHUSDT", "/api/v3/time"]);
  assert.deepEqual(lines(out).map((x) => [x.kind, x.weight]), [["depth", 250], ["exchangeInfo", 20], ["time", 1]]);
  assert.deepEqual([R.TIMEOUT_MS, R.DEPTH_LIMIT, R.BODY_MAX, R.SYMBOLS], [30_000, 5000, 8_388_608, ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]]);
  c.close();
  // C-1 of MONARK: under Windows path rules (relative parts joined by path.win32, the temp root kept), kept stays posix.
  const src = readFileSync(new URL("../scripts/l2/rest.mjs", import.meta.url), "utf8"), from = `import { join } from "node:path";`;
  const shim = String.raw`import { posix, win32 } from "node:path"; const join = (...p) => (p[0].startsWith("/") ? posix.join(...p).replaceAll("\\", "/") : win32.join(...p));`;
  assert.ok(src.includes(from), "the path import is shimmed");
  const { c: w, out: wout } = await rig((p) => ({ status: p.startsWith("/api/v3/depth") ? 200 : 404 }),
    (await import(`data:text/javascript,${encodeURIComponent(src.replace(from, shim))}`)) as typeof Rest);
  await w.request("depth", "BTCUSDT");
  assert.equal(await code(w.request("time", null)), "http_status");
  assert.deepEqual(lines(wout).map((x) => x.kept), ["rest/BTCUSDT/BTCUSDT-depth-20251009T085320000000Z.json", "rest/errors/ALL-time-20251009T085320000006Z-404.json"]);
  w.close();
});

// killer: scripts/l2/rest.mjs:130 CONST "status === 429 || status === 418" -> "status === 429"
test("l2_rest_429_418_suspend_until_retry_after", async () => {
  for (const [status, stopCode, retry, waitS] of [[429, "rate_limited", "7", 7], [418, "ip_banned", "120", 120], [429, "rate_limited", undefined, 60],
    [418, "ip_banned", "259200", 259_200]] as const) {
    let next: Reply = { status, body: "{\"code\":-1003}", ...(retry === undefined ? {} : { headers: { "retry-after": retry } }) };
    const { c, place, out, clock } = await rig(() => next);
    assert.equal(await code(c.request("depth", "SOLUSDT")), stopCode);
    assert.deepEqual(readdirSync(join(out, "rest", "errors")).map((n) => n.endsWith(`-${String(status)}.json`)), [true], "error body kept");
    const h = lines(out)[0]?.headers;
    assert.deepEqual([h?.["retry-after"], typeof h?.date], [retry ?? null, "string"], "retry-after and date logged");
    const until = T0 + 3 + waitS * 1_000_000; // counted from the receive time (sent T0, received T0 + 3)
    assert.equal(c.suspendedUntilUs, until);
    clock.us = until - 1;
    assert.equal(await code(c.request("time", null)), "suspended");
    assert.equal(place.calls.length, 1, "no request while suspended");
    clock.us = until;
    next = { status: 200, body: "{\"serverTime\":1}" };
    assert.equal(await code(c.request("time", null)), "answered");
    assert.equal(place.calls.length, 2);
    c.close();
  }
  // A 418 without a readable Retry-After and any Retry-After above 3 days stop every later request.
  for (const [status, retry, stopCode] of [[418, undefined, "ip_banned_no_retry_after"], [418, "soon", "ip_banned_no_retry_after"],
    [429, "259201", "retry_after_too_long"]] as const) {
    const { c, place } = await rig(() => ({ status, ...(retry === undefined ? {} : { headers: { "retry-after": retry } }) }));
    assert.equal(await code(c.request("depth", "SOLUSDT")), stopCode);
    assert.equal(await code(c.request("time", null)), "stopped");
    assert.equal(place.calls.length, 1);
    c.close();
  }
});

// killer: scripts/l2/rest.mjs:134 CONST "state.stopped = true" -> "state.stopped = false"
test("l2_rest_451_stops_all", async () => {
  const { R, c, place, out, clock } = await rig(() => ({ status: 451, body: "{\"code\":0,\"msg\":\"restricted\"}" }));
  assert.equal(await code(c.request("exchangeInfo", "BNBUSDT")), "restricted_location");
  assert.equal(c.stopped, true);
  clock.us += 86_400_000_000;
  for (const [kind, symbol] of [["depth", "BTCUSDT"], ["exchangeInfo", "BNBUSDT"], ["time", null]] as const) {
    assert.equal(await code(c.request(kind, symbol)), "stopped", kind);
  }
  assert.equal(place.calls.length, 1, "nothing sent after a 451");
  assert.equal(lines(out).length, 1);
  assert.equal(readdirSync(join(out, "rest", "errors")).length, 1);
  c.close();
  // C-2 of MONARK (FM-1.2): the 451 stop and the 429 suspension hold from the status alone, though the body fails, passes the bound or
  // cannot be kept; nothing is sent afterwards.
  for (const [status, fail] of [[451, "read"], [451, "over"], [451, "disk"], [429, "disk"]] as const) {
    let calls = 0;
    const body = fail === "read" ? new ReadableStream({ pull: (ctl) => { ctl.error(new Error("reset")); } }) : fail === "over" ? new Uint8Array(R.BODY_MAX + 1) : "{}";
    const x = R.createRest({ fetch: () => { calls += 1; return Promise.resolve(new Response(body, { status })); }, nowUs: () => T0,
      out: fail === "disk" ? join(out, "absent", "\u0000") : tmp() });
    await code(x.request("depth", "BTCUSDT"));
    assert.deepEqual([x.stopped, await code(x.request("time", null)), calls], [status === 451, status === 451 ? "stopped" : "suspended", 1], `${String(status)} ${fail}`);
    x.close();
  }
});

// killer: scripts/l2/rest.mjs:82 ROR "n > BODY_MAX" -> "n >= BODY_MAX"
test("l2_rest_body_bound_named", async () => {
  let size = 8_388_608;
  const { c, out } = await rig(() => ({ status: 200, body: Buffer.alloc(size, 0x20) }));
  assert.equal(await code(c.request("depth", "BTCUSDT")), "answered", "a body of exactly the bound is answered");
  assert.equal(lines(out)[0]?.bytes, 8_388_608);
  size += 1;
  assert.equal(await code(c.request("depth", "BTCUSDT")), "body_too_large");
  const l = lines(out)[1];
  assert.deepEqual([l?.bytes, l?.kept, l?.sha256], [8_388_609, null, null], "logged, nothing kept");
  assert.equal(readdirSync(join(out, "rest", "BTCUSDT")).length, 1);
  c.close();
});

// killer: scripts/l2/rest.mjs:65 CONST "u.protocol !== \"https:\" || " -> ""
test("l2_rest_host_and_redirect_refused", async () => {
  const { R, c, place, out } = await rig(() => ({ status: 302, headers: { location: "http://127.0.0.1:1/x" } }));
  for (const url of ["http://api.binance.com/api/v3/time", "https://api.binance.com.evil.example/x", "https://api.binance.com:8443/x",
    "https://fapi.binance.com/fapi/v1/time", "not a url"]) {
    assert.throws(() => R.guardUrl(url), (e: unknown) => (e as { code?: string }).code === "host_refused", url);
  }
  assert.equal(R.guardUrl(R.urlOf("time", null)), "https://api.binance.com/api/v3/time");
  const r = await stopOf(c.request("time", null));
  assert.equal(r.code, "redirect_refused");
  assert.ok(!r.text.includes("127.0.0.1") && !readFileSync(join(out, "requests.jsonl"), "utf8").includes("127.0.0.1"), "no address");
  assert.deepEqual(place.calls, ["/api/v3/time"], "the redirect is not followed");
  assert.equal(lines(out)[0]?.status, 302);
  assert.equal(existsSync(join(out, "rest", "errors")), true);
  c.close();
});

// killer: scripts/l2/rest.mjs:170 CONST "replace(/0+$/, \"\")" -> "replace(/0$/, \"\")"
test("l2_exchangeinfo_scale_and_limits", async () => {
  const R = await load();
  const limits = [{ rateLimitType: "REQUEST_WEIGHT", interval: "MINUTE", intervalNum: 1, limit: 6000 },
    { rateLimitType: "RAW_REQUESTS", interval: "MINUTE", intervalNum: 5, limit: 300000 }];
  const doc = (tick: unknown, rl: unknown = limits): Buffer => Buffer.from(JSON.stringify({ rateLimits: rl,
    symbols: [{ symbol: "BTCUSDT", filters: [{ filterType: "LOT_SIZE", stepSize: "0.00001000" }, { filterType: "PRICE_FILTER", tickSize: tick }] }] }));
  for (const [tick, scale] of [["0.01000000", 2], ["1.00000000", 0], ["0.00001000", 5], ["0.10", 1], ["10", 0], ["0.00000001", 8]] as const) {
    const f = R.exchangeInfoFacts(doc(tick));
    assert.deepEqual([f.tickSize, f.scale, f.requestWeightPerMinute], [tick, scale, 6000], tick);
    assert.deepEqual(f.rateLimits, limits);
  }
  for (const bad of [doc(0.01), doc("0.00"), doc("1e-2"), doc("0.01", []), doc("0.01", [{ ...limits[0], limit: "6000" }]),
    doc("0.01", [{ ...limits[0], intervalNum: 5 }]), doc("0.01", [{ ...limits[0], interval: "SECOND" }]), Buffer.from("{\"symbols\":[]}")]) {
    assert.throws(() => R.exchangeInfoFacts(bad), (e: unknown) => (e as { code?: string }).code === "exchange_info_shape", bad.toString());
  }
});

// killer: scripts/l2/rest.mjs:187 CONST "Math.floor((sentUs + receivedUs) / 2)" -> "Math.round((sentUs + receivedUs) / 2)"
test("l2_time_offset_logged", async () => {
  const { R, c, out } = await rig(() => ({ status: 200, body: "{\"serverTime\":1760000000123}" }));
  const a = await c.request("time", null);
  assert.deepEqual([a.sentUs, a.receivedUs], [T0, T0 + 3]);
  const clock = { wallUs: (): number => T0 + 10, monoNs: (): bigint => 5_000_000_000n }; // P1-B1-BIS m-1: the head of P1-a3
  const head = { host_us: T0 + 10, mono_ns: "5000000000", symbol: null, cid: null, event: "clock_offset" };
  const e = R.logTimeOffset(out, a.body, a.sentUs, a.receivedUs, clock); // midpoint T0 + 1.5 us, floored to T0 + 1
  assert.deepEqual(e, { ...head, sent_us: T0, received_us: T0 + 3, server_time_ms: 1_760_000_000_123,
    offset_us: 1_760_000_000_123_000 - (T0 + 1), reason: null });
  assert.ok(Number.isSafeInteger(e.offset_us));
  const unsafe = R.logTimeOffset(out, Buffer.from("{\"serverTime\":1760000000123.5}"), T0, T0 + 2, clock);
  assert.deepEqual([unsafe.offset_us, unsafe.server_time_ms, unsafe.reason], [null, null, "server_time_not_safe_integer"]);
  assert.throws(() => R.logTimeOffset(out, Buffer.from("not json {"), T0, T0 + 2, clock), (x: unknown) => (x as { code?: string }).code === "body_not_json");
  const text = readFileSync(join(out, "journal.jsonl"), "utf8").trim().split("\n");
  assert.ok(text.every((l) => l.startsWith(`{"host_us":${String(T0 + 10)},"mono_ns":"5000000000","symbol":null,"cid":null,"event":"clock_offset",`)), text[0]);
  assert.deepEqual(text.map((l) => JSON.parse(l) as Rest.ClockOffset), [e, unsafe, { ...head, sent_us: T0, received_us: T0 + 2, server_time_ms: null,
    offset_us: null, reason: "body_not_json" }], "one line either way, a body that is not JSON too, written before its stop");
  c.close();
});

// B-2 of the G2 of part P1 (lot P1-B1-BIS): test sockets published on the channel while a request runs (an injected fetch, no
// network). Only a TLS socket whose servername and remote port are those of the place (PEER) is the request's own; any other window
// logs no fingerprint and names why (TLS_NOTES); a socket published outside a request is not attributed; no address is written.
// killer: scripts/l2/rest.mjs:103 CONST "s.servername !== peer.servername || " -> ""
test("l2_tls_peer_logged_without_address", async () => {
  const R = await load(), out = tmp(), connected = channel("undici:client:connected");
  const tls = (servername: string, remotePort: number, cert: object, reused = false): object => ({ servername, remotePort,
    remoteAddress: "203.0.113.9", localAddress: "198.51.100.7", getPeerCertificate: () => cert, isSessionReused: () => reused });
  const own = tls("api.binance.com", 443, { fingerprint256: "AB:CD:EF", subject: { CN: "x" } }), other = { fingerprint256: "12:34" };
  const cases: [object[], string | null, string | null][] = [[[], null, "reused_socket"], [[own], "AB:CD:EF", null],
    [[tls("stream.binance.com", 443, other)], null, "foreign_connection"], [[tls("api.binance.com", 9443, other)], null, "foreign_connection"],
    [[tls("stream.binance.com", 9443, other), own], "AB:CD:EF", null], [[own, own], null, "several_connections"],
    [[tls("api.binance.com", 443, {}, true)], null, "session_resumed"], [[tls("api.binance.com", 443, {})], null, "no_certificate"],
    [[{ servername: "api.binance.com", remotePort: 443, remoteAddress: "203.0.113.9" }], null, "no_tls"]];
  let publish: object[] = [], t = T0;
  const fetch = (): Promise<Response> => {
    for (const socket of publish) connected.publish({ connectParams: { hostname: "203.0.113.9", localAddress: "198.51.100.7", port: 443 }, socket });
    return Promise.resolve(new Response("{\"serverTime\":1}"));
  };
  const c = R.createRest({ fetch, nowUs: () => (t += 1), out });
  for (const [sockets] of cases) { publish = sockets; await c.request("time", null); }
  publish = [];
  connected.publish({ socket: own }); // outside a request: not attributed
  await c.request("time", null);
  assert.deepEqual(lines(out).map((l) => [l.tls_peer_sha256, l.tls_peer_note]), [...cases.map(([, f, n]) => [f, n]), [null, "reused_socket"]]);
  const written = readFileSync(join(out, "requests.jsonl"), "utf8");
  for (const address of ["203.0.113.9", "198.51.100.7", "127.0.0.1", "localAddress", "remoteAddress"]) assert.ok(!written.includes(address), address);
  c.close();
});

// G2 B1, m1, B2, J1, m2, m3: a failure names its code, never an address; a body that fails mid-read is still logged; a symbol outside
// the closed list (or a null one for depth and exchangeInfo) is refused before any request; the requests of a client are chained;
// files are written exclusively and a disk failure is a named stop.
// killer: scripts/l2/rest.mjs:89 CONST "e?.cause?.code ?? " -> "e?.cause?.message ?? "
test("l2_rest_failures_named_without_address_and_symbols_closed", async () => {
  const R = await load();
  const out = tmp(), cause = Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:59999"), { code: "ECONNREFUSED" });
  let t = T0, mode = "refused", calls = 0, release = (): void => undefined;
  const body = (): ReadableStream => {
    let pulls = 0;
    return new ReadableStream({ pull: (ctl) => { if (pulls++ === 0) ctl.enqueue(new Uint8Array([123])); else ctl.error(new Error("reset 127.0.0.1:443")); } });
  };
  const fetch = async (): Promise<Response> => {
    calls += 1;
    if (mode === "refused") throw Object.assign(new TypeError("fetch failed"), { cause });
    if (mode === "midbody") return new Response(body(), { status: 200 });
    if (mode === "held") await new Promise<void>((ok) => { release = ok; });
    return new Response("{\"serverTime\":1}", { status: 200 });
  };
  const c = R.createRest({ fetch, nowUs: () => (t += 1), out });
  const refused = await stopOf(c.request("time", null));
  assert.equal(refused.code, "network_error");
  assert.ok(refused.text.includes("ECONNREFUSED") && !/127\.0\.0\.1|59999/.test(refused.text), refused.text);
  mode = "midbody";
  const mid = await stopOf(c.request("time", null));
  assert.ok(mid.code === "network_error" && !mid.text.includes("127.0.0.1"), mid.text);
  assert.deepEqual(lines(out).map((l) => [l.status, l.bytes, l.kept]), [[200, 1, null]], "a failed body read is still logged");
  for (const [kind, symbol] of [["depth", "../../escaped"], ["depth", "BTCUSDT&limit=1"], ["exchangeInfo", "btcusdt"], ["depth", null],
    ["exchangeInfo", null], ["time", "BTCUSDT"]] as const) {
    assert.equal((await stopOf(c.request(kind, symbol))).code, "bad_symbol", `${kind} ${String(symbol)}`);
  }
  assert.equal(calls, 2, "no fetch for a refused symbol");
  assert.deepEqual(readdirSync(out).sort(), ["requests.jsonl"], "nothing written outside");
  mode = "held";
  const first = c.request("time", null), second = c.request("time", null);
  for (let i = 0; i < 20 && calls < 3; i++) await new Promise((ok) => { setTimeout(ok, 5); });
  await new Promise((ok) => { setTimeout(ok, 20); });
  assert.equal(calls, 3, "the second request waits for the first");
  mode = "ok";
  release();
  await first;
  await second;
  assert.equal(calls, 4);
  const gone = R.createRest({ fetch, nowUs: () => T0, out: join(out, "absent", "\u0000") });
  assert.equal((await stopOf(gone.request("time", null))).code, "disk_error");
  const fixed = R.createRest({ fetch, nowUs: () => T0, out });
  await fixed.request("time", null);
  assert.equal((await stopOf(fixed.request("time", null))).code, "disk_error", "an existing file is never overwritten");
  for (const x of [c, gone, fixed]) x.close();
});

// killer: scripts/l2/rest.mjs:129 CONST "} if (io.signal?.aborted) stop(" -> "} if (false) stop("
test("l2_rest_aborted_writes_nothing", async () => {
  // r-2 of the G2 delta of c5-bis-b (lot c5-bis-c): the loop's signal aborted while a request is in flight: its late answer writes neither
  // requests.jsonl nor rest/, the request stops (stopped); a request asked after it never reaches fetch.
  const R = await load(), out = tmp(), ac = new AbortController(), sent: string[] = [], signals: (AbortSignal | null | undefined)[] = [];
  let answer = (): void => undefined;
  const fetch = (url: string, init: RequestInit): Promise<Response> => { sent.push(url); signals.push(init.signal); return sent.length > 1 ? Promise.resolve(new Response("{}")) : new Promise((r) => { answer = () => { r(new Response("{}")); }; }); };
  const c = R.createRest({ fetch, nowUs: () => T0, out, signal: ac.signal }), a = code(c.request("time", null)), b = code(c.request("depth", "BTCUSDT"));
  await new Promise((r) => setTimeout(r, 5));
  ac.abort();
  answer();
  assert.deepEqual([await a, await b, sent.length, readdirSync(out), signals[0]?.aborted], ["stopped", "stopped", 1, [], true], "the fetch aborted too");
});

/** A fetch that honours its signal (as the embedded client does: an AbortError) and never answers otherwise; the signals it got. */
const abortable = (signals: (AbortSignal | null | undefined)[]) => (_url: string, init: RequestInit): Promise<Response> => new Promise((_, no) => {
  signals.push(init.signal);
  if (init.signal?.aborted) no(init.signal.reason); else init.signal?.addEventListener("abort", () => { no(init.signal?.reason); });
});

// killer: scripts/l2/rest.mjs:125 CONST "if (io.signal?.aborted) stop(\"stopped\", { kind, symbol }); stop(\"network_error\"" -> "stop(\"network_error\""
test("l2_rest_aborted_fetch_named", async () => {
  // m-2 of the G2 of c5-bis-c: a fetch aborted by the loop's signal stops the request as stopped, never network_error.
  const R = await load(), out = tmp(), ac = new AbortController(), c = R.createRest({ fetch: abortable([]), nowUs: () => T0, out, signal: ac.signal });
  const a = code(c.request("time", null));
  await new Promise((r) => setTimeout(r, 5));
  ac.abort();
  assert.deepEqual([await Promise.race([a, new Promise((r) => { setTimeout(() => { r("pending"); }, 1_000); })]), readdirSync(out)], ["stopped", []]);
});

// killer: scripts/l2/rest.mjs:123 CONST "AbortSignal.timeout(TIMEOUT_MS), " -> ""
test("l2_rest_fetch_deadline", async () => {
  // m-3 of the G2 of c5-bis-c: the fetch's signal holds its 30 s deadline beside the loop's: a place that never answers ends at it.
  const R = await load(), out = tmp(), real = AbortSignal.timeout, asked: number[] = [], signals: (AbortSignal | null | undefined)[] = [];
  AbortSignal.timeout = (ms: number): AbortSignal => { asked.push(ms); return AbortSignal.abort(new DOMException("deadline", "TimeoutError")); };
  try {
    const c = R.createRest({ fetch: abortable(signals), nowUs: () => T0, out, signal: new AbortController().signal });
    assert.deepEqual([await code(c.request("time", null)), asked, signals[0]?.aborted], ["network_error", [R.TIMEOUT_MS], true]);
  } finally { AbortSignal.timeout = real; }
});

// killer: scripts/l2/rest.mjs:129 CONST "} if (io.signal?.aborted) stop(" -> "} if (false) stop("
test("l2_rest_aborted_during_body", async () => {
  // m-5 of the G2 of c5-bis-c: the loop's signal aborted while the body is read: nothing written, stopped.
  const R = await load(), out = tmp(), ac = new AbortController();
  let more = (): void => undefined;
  const body = new ReadableStream<Uint8Array>({ start: (ctl) => { ctl.enqueue(new TextEncoder().encode("{")); more = () => { ctl.enqueue(new TextEncoder().encode("}")); ctl.close(); }; } });
  const c = R.createRest({ fetch: () => Promise.resolve(new Response(body)), nowUs: () => T0, out, signal: ac.signal }), a = code(c.request("time", null));
  await new Promise((r) => setTimeout(r, 5));
  ac.abort();
  more();
  assert.deepEqual([await a, readdirSync(out)], ["stopped", []]);
});
