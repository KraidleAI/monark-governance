// test/l2-rest.test.ts -- lot P1-b1 of ADR-L2-CAPTURE-1 (plan docs/G0-partie-l2-p1.md section 8.2; lot plan docs/G0-lot-l2-p1-b1.md):
// the REST client of the L2 recorder against the loopback fake place of P1-a1, through its injected fetch (the global fetch and
// WebSocket are tripwires). The module is loaded by a dynamic import that each test asserts, so the base, which has no scripts/l2/,
// reddens by assertion. Each test names, on the line above it, the mutation of scripts/l2/rest.mjs that reddens it. Synthetic data only.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { channel } from "node:diagnostics_channel";
import { existsSync, mkdtempSync, readdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startPlace, trap, viaFetch, type Place, type Reply } from "./l2-fake-place.ts";
import type * as Rest from "../scripts/l2/rest.mjs";

trap();
const places: Place[] = [];
after(async () => { for (const p of places) await p.stop(); });
const T0 = 1_760_000_000_000_000; // a synthetic wall clock in microseconds

async function load(): Promise<typeof Rest> {
  const m = await import("../scripts/l2/rest.mjs").catch(() => null);
  return m ?? assert.fail("scripts/l2/rest.mjs is absent");
}

/** A client on a fresh place answering `script(path)`; the clock is `clock.us`, moved by the test. */
async function rig(script: (path: string) => Reply): Promise<{ R: typeof Rest; c: Rest.RestClient; place: Place; out: string; clock: { us: number } }> {
  const R = await load();
  const place = await startPlace(() => undefined, script);
  places.push(place);
  const out = mkdtempSync(join(tmpdir(), "l2-rest-")), clock = { us: T0 };
  const c = R.createRest({ fetch: viaFetch(place, [R.ORIGIN]), nowUs: () => clock.us, out });
  return { R, c, place, out, clock };
}
const lines = (out: string): Rest.RequestLine[] =>
  readFileSync(join(out, "requests.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rest.RequestLine);
async function code(p: Promise<unknown>): Promise<string> {
  try { await p; } catch (e) { return String((e as { code?: unknown }).code); }
  return "answered";
}

// killer: scripts/l2/rest.mjs:21 CONST "weight: 250" -> "weight: 251"
test("l2_rest_logged_and_kept_before_read", async () => {
  const depth = Buffer.from("{\"lastUpdateId\":7,\"x\":[[\"0.10\",\"1.000\"]]}\n"), bad = Buffer.from("not json {");
  const { R, c, place, out } = await rig((p) => (p.startsWith("/api/v3/depth") ? { status: 200, body: depth, headers: { "x-mbx-used-weight-1m": "250" } }
    : { status: 200, body: bad }));
  const a = await c.request("depth", "BTCUSDT");
  assert.ok(a.body.equals(depth));
  assert.ok(readFileSync(join(out, a.kept)).equals(depth), "the 200 body is kept as received");
  assert.match(a.kept, /^rest\/BTCUSDT\/BTCUSDT-depth-\d{8}T\d{9}Z\.json$/);
  const l = lines(out)[0];
  assert.deepEqual([l?.kind, l?.weight, l?.status, l?.bytes, l?.sha256, l?.kept, l?.headers["x-mbx-used-weight-1m"], l?.tls_peer_sha256],
    ["depth", 250, 200, depth.length, createHash("sha256").update(depth).digest("hex"), a.kept, "250", null]);
  assert.equal(place.calls[0], "/api/v3/depth?symbol=BTCUSDT&limit=5000");
  // exchangeInfo and time: paths and weights; a body that is not JSON is kept before the parse stops.
  const e = await c.request("exchangeInfo", "ETHUSDT");
  assert.ok(readFileSync(join(out, e.kept)).equals(bad));
  assert.equal(await code(Promise.resolve().then(() => R.exchangeInfoFacts(e.body))), "body_not_json");
  await c.request("time", null);
  assert.deepEqual(place.calls.slice(1), ["/api/v3/exchangeInfo?symbol=ETHUSDT", "/api/v3/time"]);
  assert.deepEqual(lines(out).map((x) => [x.kind, x.weight]), [["depth", 250], ["exchangeInfo", 20], ["time", 1]]);
  assert.deepEqual([R.TIMEOUT_MS, R.DEPTH_LIMIT, R.BODY_MAX], [30_000, 5000, 8_388_608]);
  c.close();
});

// killer: scripts/l2/rest.mjs:113 CONST "status === 429 || status === 418" -> "status === 429"
test("l2_rest_429_418_suspend_until_retry_after", async () => {
  for (const [status, stopCode, retry, waitS] of [[429, "rate_limited", "7", 7], [418, "ip_banned", "120", 120], [429, "rate_limited", undefined, 60]] as const) {
    let next: Reply = { status, body: "{\"code\":-1003}", ...(retry === undefined ? {} : { headers: { "retry-after": retry } }) };
    const { c, place, out, clock } = await rig(() => next);
    assert.equal(await code(c.request("depth", "SOLUSDT")), stopCode);
    assert.deepEqual(readdirSync(join(out, "rest", "errors")).map((n) => n.endsWith(`-${String(status)}.json`)), [true], "error body kept");
    assert.equal(c.suspendedUntilUs, T0 + waitS * 1_000_000);
    clock.us = T0 + waitS * 1_000_000 - 1;
    assert.equal(await code(c.request("time", null)), "suspended");
    assert.equal(place.calls.length, 1, "no request while suspended");
    clock.us = T0 + waitS * 1_000_000;
    next = { status: 200, body: "{\"serverTime\":1}" };
    assert.equal(await code(c.request("time", null)), "answered");
    assert.equal(place.calls.length, 2);
    c.close();
  }
});

// killer: scripts/l2/rest.mjs:118 CONST "state.stopped = true; " -> ""
test("l2_rest_451_stops_all", async () => {
  const { c, place, out, clock } = await rig(() => ({ status: 451, body: "{\"code\":0,\"msg\":\"restricted\"}" }));
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
});

// killer: scripts/l2/rest.mjs:68 ROR "n > BODY_MAX" -> "n >= BODY_MAX"
test("l2_rest_body_bound_named", async () => {
  let size = 8_388_608;
  const { c, out } = await rig(() => ({ status: 200, body: Buffer.alloc(size, 0x20) }));
  const a = await c.request("depth", "BTCUSDT");
  assert.equal(a.body.length, 8_388_608, "a body of exactly the bound is kept");
  size += 1;
  assert.equal(await code(c.request("depth", "BTCUSDT")), "body_too_large");
  const l = lines(out)[1];
  assert.deepEqual([l?.bytes, l?.kept, l?.sha256], [8_388_609, null, null], "logged, nothing kept");
  assert.equal(readdirSync(join(out, "rest", "BTCUSDT")).length, 1);
  c.close();
});

// killer: scripts/l2/rest.mjs:51 CONST "u.protocol !== \"https:\" || " -> ""
test("l2_rest_host_and_redirect_refused", async () => {
  const { R, c, place, out } = await rig(() => ({ status: 302, headers: { location: "https://elsewhere.example/x" } }));
  for (const url of ["http://api.binance.com/api/v3/time", "https://api.binance.com.evil.example/x", "https://api.binance.com:8443/x",
    "https://fapi.binance.com/fapi/v1/time", "not a url"]) {
    assert.throws(() => R.guardUrl(url), (e: unknown) => (e as { code?: string }).code === "host_refused", url);
  }
  assert.equal(R.guardUrl(R.urlOf("time", null)), "https://api.binance.com/api/v3/time");
  assert.equal(await code(c.request("time", null)), "redirect_refused");
  assert.deepEqual(place.calls, ["/api/v3/time"], "the redirect is not followed");
  assert.equal(lines(out)[0]?.status, 302);
  assert.equal(existsSync(join(out, "rest", "errors")), true);
  c.close();
});

// killer: scripts/l2/rest.mjs:136 CONST "replace(/0+$/, \"\")" -> "replace(/0$/, \"\")"
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
    doc("0.01", [{ ...limits[0], intervalNum: 5 }]), Buffer.from("{\"symbols\":[]}")]) {
    assert.throws(() => R.exchangeInfoFacts(bad), (e: unknown) => (e as { code?: string }).code === "exchange_info_shape", bad.toString());
  }
});

// killer: scripts/l2/rest.mjs:150 CONST "Math.floor((sentUs + receivedUs) / 2)" -> "Math.round((sentUs + receivedUs) / 2)"
test("l2_time_offset_logged", async () => {
  const { R, c, out, clock } = await rig(() => ({ status: 200, body: "{\"serverTime\":1760000000123}" }));
  const a = await c.request("time", null);
  clock.us = T0 + 1;
  const e = R.logTimeOffset(out, a.body, T0, T0 + 1); // midpoint T0 + 0.5 us, floored
  assert.deepEqual(e, { event: "clock_offset", sent_us: T0, received_us: T0 + 1, server_time_ms: 1_760_000_000_123,
    offset_us: 1_760_000_000_123_000 - T0, reason: null });
  assert.ok(Number.isSafeInteger(e.offset_us));
  const unsafe = R.logTimeOffset(out, Buffer.from("{\"serverTime\":1760000000123.5}"), T0, T0 + 2);
  assert.deepEqual([unsafe.offset_us, unsafe.server_time_ms, unsafe.reason], [null, null, "server_time_not_safe_integer"]);
  const journal = readFileSync(join(out, "journal.jsonl"), "utf8").trim().split("\n").map((l) => JSON.parse(l) as Rest.ClockOffset);
  assert.deepEqual(journal, [e, unsafe]);
  c.close();
});

// killer: scripts/l2/rest.mjs:81 CONST "cert.fingerprint256" -> "cert.subject"
test("l2_tls_peer_logged_without_address", async () => {
  const connected = channel("undici:client:connected");
  const fake = { connectParams: { hostname: "203.0.113.9", localAddress: "198.51.100.7", port: 443 },
    socket: { remoteAddress: "203.0.113.9", localAddress: "198.51.100.7", getPeerCertificate: () => ({ fingerprint256: "AB:CD:EF", subject: { CN: "x" } }) } };
  let tls = false;
  const { c, out } = await rig(() => { if (tls) connected.publish(fake); return { status: 200, body: "{\"serverTime\":1}" }; });
  await c.request("time", null); // plain loopback: no TLS socket
  tls = true;
  await c.request("time", null); // a test socket carrying a certificate, published while the request runs
  tls = false;
  connected.publish(fake); // outside a request: not attributed
  await c.request("time", null);
  assert.deepEqual(lines(out).map((l) => l.tls_peer_sha256), [null, "AB:CD:EF", null]);
  const written = readFileSync(join(out, "requests.jsonl"), "utf8");
  for (const address of ["203.0.113.9", "198.51.100.7", "127.0.0.1", "localAddress", "remoteAddress"]) assert.ok(!written.includes(address), address);
  c.close();
});
