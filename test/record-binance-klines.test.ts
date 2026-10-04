// test/record-binance-klines.test.ts -- lot SERIES-BINANCE (2026-10-01): the Binance kline recorder scripts/record-binance-klines.mjs,
// run in-process against a loopback server that imitates GET /api/v3/klines (H-2 of the G1 journal: startTime <= openTime <= endTime,
// ascending, at most limit rows), through an injected fetch that only rewrites https://api.binance.com to that server and refuses any
// other URL. The global fetch is a tripwire for the whole file, and the child processes only start a copy of the recorder with no argument
// (a usage stop) or import it, behind a dead loopback proxy that the recorder refuses anyway: no test reaches the network, even under a
// mutant. The loopback server speaks HTTPS with a CA built here, trusted for this process alone and restored after the file (a recording
// stops on a 200 whose connection showed no certificate: BINANCE-PRE153-1 corrections, D-6), or plain HTTP where a test asks for it; the
// TLS tests sign their own leaves with that same CA. Each test names, on the line above it, the production mutation that reddens it
// (scripts/red-proof.mjs convention); every
// outcome is compared by assert. Outputs live under the OS temp directory, outside any git tree, removed after the file.
import { after, test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, generateKeyPairSync, type KeyObject, sign, X509Certificate } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { type ClientRequest, createServer, type IncomingHttpHeaders, type IncomingMessage, request as httpRequest,
  type ServerResponse } from "node:http";
import { type Agent, createServer as createTlsServer, type RequestOptions } from "node:https";
import { createRequire, syncBuiltinESMExports } from "node:module";
import { tmpdir } from "node:os";
import { delimiter, join, resolve, sep } from "node:path";
import { getCACertificates, type SecureVersion, setDefaultCACertificates, type TLSSocket } from "node:tls";
import { fileURLToPath, pathToFileURL } from "node:url";
import { CSV_COLUMNS, expectedCount, LIMIT, main, MAX_PAGES, parseArgs, parseTime, PAUSE_MS, RecorderStop, run, STOPS, SYMBOLS }
  from "../scripts/record-binance-klines.mjs";
import type { RecorderIo, SeriesManifest, SeriesManifestRead, SeriesManifestV1 } from "../scripts/record-binance-klines.mjs";
import * as recorder from "../scripts/record-binance-klines.mjs"; // INTERVALS read as a property: the base, without it, still loads
import { listen } from "./helpers/loopback.ts";

type Row = [number, string, string, string, string, string, number, string, number, string, string, string];
type FetchLike = (url: string, options: RequestOptions) => ClientRequest; // shaped as https.request (lot BINANCE-PRE35-1)
interface Reply { status: number; headers?: Record<string, string>; body?: string; cut?: boolean; part?: string; hold?: boolean }
/** The TLS side of a loopback endpoint (lot BINANCE-PRE35-1): its leaf (the file's endpoint leaf by default), the CAs trusted while it
 *  runs (the file's one CA by default) and the highest TLS version it speaks. */
interface TlsPlan { leaf?: Issued; trust?: readonly Issued[]; maxVersion?: SecureVersion; trustLate?: boolean }
interface Endpoint { base: string; urls: string[]; headers: IncomingHttpHeaders[]; reused: (boolean | null)[]; close: () => Promise<void> }
interface Calls { urls: string[]; inits: RequestOptions[] }
interface Recording { code: string; out: string; calls: Calls; sleeps: number[]; served: string[]; headers: IncomingHttpHeaders[];
  reused: (boolean | null)[] }
interface Plan extends TlsPlan { script?: ReadonlyMap<number, Reply>; perPage?: number; symbol?: string; interval?: string; io?: RecorderIo;
  out?: string; plain?: boolean }
/** What a line of requests.jsonl names of the connection that served it (lot BINANCE-PRE153-1, D-3). */
interface Peer { leaf_sha256: string; issuer_sha256: string | null; resumed: boolean }
interface Logged { url: string; status: number; bytes: number; sha256: string | null; file: string | null; tls: Peer | null;
  headers: Record<string, string | null> }
interface MissingDoc { symbol: string; interval: string; start: string; end_exclusive: string; count: number;
  missing: { open_time_ms: number; open_time_utc: string }[] }

globalThis.fetch = (): Promise<Response> => Promise.reject(new Error("tripwire: these tests never call the global fetch"));
// F-3 of the G2 of #115: the default transport is https.request, a tripwire too, synced into the ESM bindings (the recorder's among
// them); only via sends, through the original captured here; a test may set its own spy and put this tripwire back; restored after the file
const HTTPS = createRequire(import.meta.url)("node:https") as typeof import("node:https"), realHttpsRequest = HTTPS.request;
HTTPS.request = (): never => { throw new Error("tripwire: these tests never call https.request"); };
syncBuiltinESMExports();
after(() => { HTTPS.request = realHttpsRequest; syncBuiltinESMExports(); });
// m-1 of the review of BINANCE-PRE153-1: the children start from this environment, so none prints a warning on stderr (Node 22 warns
// UNDICI-EHPA under NODE_USE_ENV_PROXY), which the junction test compares whole
process.env.NODE_NO_WARNINGS = "1";
const ORIGIN = "https://api.binance.com", LF = String.fromCharCode(10), T0 = Date.UTC(2025, 0, 1);
const STEP_MS = 900_000, HOUR_MS = 3_600_000, FOUR_HOURS_MS = 14_400_000; // the closed list's durations, written here, never imported
const ROOT = mkdtempSync(join(tmpdir(), "binance-klines-"));
after(() => { rmSync(ROOT, { recursive: true, force: true, maxRetries: 3 }); });
const RECORDER = fileURLToPath(new URL("../scripts/record-binance-klines.mjs", import.meta.url)); // copied under ROOT, never run in place
let made = 0;
/** A path that does not exist yet, under the temp root. */
const fresh = (): string => join(ROOT, `out-${String(++made)}`);
const at = (i: number): number => T0 + i * STEP_MS;
const iso = (ms: number): string => new Date(ms).toISOString().replace(".000Z", "Z");
const sha = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const row = (t: number, close = "1.50000000", step = STEP_MS): Row =>
  [t, "1.00000000", "2.00000000", "0.50000000", close, "10.00000000", t + step - 1, "15.00000000", 7, "4.00000000", "6.00000000", "0"];
const series = (n: number, skip: readonly number[] = []): Row[] =>
  Array.from({ length: n }, (_, i) => i).filter((i) => !skip.includes(i)).map((i) => row(at(i)));
const page = (ix: readonly number[]): Reply => ({ status: 200, body: JSON.stringify(ix.map((i) => row(at(i)))) });
// Readers of the outputs are total: an absent file reads "", null, {} or no bytes, so a missing output fails an assertion, never an ENOENT.
const text = (out: string, name: string): string => (existsSync(join(out, name)) ? readFileSync(join(out, name), "utf8") : "");
const bytes = (path: string): Buffer => (existsSync(path) ? readFileSync(path) : Buffer.alloc(0));
const jsonOf = (out: string, name: string): unknown => (existsSync(join(out, name)) ? JSON.parse(text(out, name)) as unknown : null);
const manifestOf = (out: string): SeriesManifest => (jsonOf(out, "manifest.json") ?? {}) as SeriesManifest;
const rawNames = (out: string): string[] => (existsSync(join(out, "raw")) ? readdirSync(join(out, "raw")).sort() : []);
/** Every line of requests.jsonl, an answer's arrival line included (BINANCE-PRE153-1 corrections, D-4: its status, headers and
 *  certificates as it arrives, then that line again once its body is read); none when the file is absent (an assertion then names the
 *  run's code, never an ENOENT). */
const linesOf = (out: string): Partial<Logged>[] => (existsSync(join(out, "requests.jsonl"))
  ? text(out, "requests.jsonl").split(LF).filter((l) => l !== "").map((l) => JSON.parse(l) as Partial<Logged>) : []);
/** requests.jsonl, one entry per answer whose body was read: the line that completes it, with its bytes, sha256 and file. */
const logOf = (out: string): Logged[] => linesOf(out).filter((l): l is Logged => "sha256" in l);
/** Files of --out beyond the provenance logs (raw/, requests.jsonl): none after a named stop. */
const normalized = (out: string): string[] => (existsSync(out) ? readdirSync(out).filter((n) => n !== "raw" && n !== "requests.jsonl") : []);
const rawCount = (out: string): number => (existsSync(join(out, "raw")) ? readdirSync(join(out, "raw")).length : 0);
/** A file of a replay's source made a directory: present, unreadable (BINANCE-PRE153-1 corrections, D-2: mutants G12 and G18). */
const asDir = (file: string) => (dir: string): void => { mkdirSync(join(dir, file)); };
const offline = (calls: Calls): FetchLike => (url, options) => { calls.urls.push(url); calls.inits.push(options); throw new Error("offline"); };

/** The one CA of this file, built on first use (BINANCE-PRE153-1 corrections, D-6: a recording stops on a 200 whose connection showed no
 *  certificate, so the loopback endpoint serves HTTPS): it signs the endpoint's leaf and the TLS tests' leaves. Each endpoint trusts it
 *  (or the CAs its test names) for this process alone; the default trust is restored after the file. Two CAs of one name: measured by
 *  binance_klines_logs_the_true_issuer_of_two_cas_of_one_name. */
let fileCa: Issued | null = null, endpointLeaf: Issued | null = null;
const caOf = (): Issued => (fileCa ??= issue(7));
const TRUSTED = getCACertificates("default");
after(() => { setDefaultCACertificates(TRUSTED); });

/** The loopback endpoint, HTTPS unless `plain`: request n gets `script` n when given (status, headers and body, the head of a body then
 *  a cut, or a cut connection), else the rows that its query selects, as H-2 says the real endpoint does. Each request URL and its
 *  headers are kept, in order. */
async function endpoint(rows: readonly Row[], script: ReadonlyMap<number, Reply> = new Map(), perPage = LIMIT, plain = false,
  tls: TlsPlan = {}): Promise<Endpoint> {
  const urls: string[] = [], headers: IncomingHttpHeaders[] = [], reused: (boolean | null)[] = [];
  const handle = (req: IncomingMessage, res: ServerResponse): void => {
    const n = urls.length, url = req.url ?? "/", fixed = script.get(n);
    urls.push(url);
    headers.push(req.headers);
    reused.push((req.socket as Partial<TLSSocket>).isSessionReused?.() ?? null); // the server's view of each connection (BINANCE-PRE35-1)
    if (fixed?.cut === true) { req.socket.destroy(); return; }
    if (fixed?.part !== undefined) { // its status, its headers and the head of a longer body, then the connection is cut (D-4)
      res.writeHead(fixed.status, { ...fixed.headers, "content-length": "4096" });
      res.write(fixed.part, () => { if (fixed.hold !== true) setTimeout(() => { req.socket.destroy(); }, 20); }); // hold: never ends
      return;
    }
    if (fixed !== undefined) { res.writeHead(fixed.status, fixed.headers ?? {}).end(fixed.body ?? ""); return; }
    const q = new URL(url, "http://127.0.0.1").searchParams, from = Number(q.get("startTime")), to = Number(q.get("endTime"));
    const rowsOut = rows.filter((r) => r[0] >= from && r[0] <= to).slice(0, Math.min(Number(q.get("limit")), perPage));
    res.writeHead(200, { "content-type": "application/json", "x-mbx-used-weight-1m": String(2 * (n + 1)) }).end(JSON.stringify(rowsOut));
  };
  const leaf = tls.leaf ?? (endpointLeaf ??= issue(8, caOf()));
  const trust = (): void => { setDefaultCACertificates((tls.trust ?? [caOf()]).map((ca) => new X509Certificate(ca.der).toString())); };
  if (tls.trustLate !== true) trust(); // the trust first, then the server; trustLate: the other order (S1 of the G2 of #115, F-1)
  const server = plain ? createServer(handle) : createTlsServer({ key: leaf.key.export({ type: "pkcs8", format: "pem" }),
    cert: new X509Certificate(leaf.der).toString(), maxVersion: tls.maxVersion ?? "TLSv1.3" }, handle);
  if (tls.trustLate === true) trust();
  const port = await listen(server);
  const close = (): Promise<void> => new Promise<void>((done) => { server.closeAllConnections(); server.close(() => { done(); }); });
  return { base: `${plain ? "http" : "https"}://127.0.0.1:${String(port)}`, urls, headers, reused, close };
}

/** The injected fetch, shaped as https.request: the recorder's URL rewritten from https://api.binance.com to the loopback server, its
 *  options untouched (its own agent, so the TLS discipline acts on a real request); over plain HTTP, the agent left out (an HTTPS agent
 *  cannot carry it); any other URL is refused, never sent. */
function via(ep: Endpoint, calls: Calls): FetchLike {
  return (url, options) => {
    calls.urls.push(url);
    calls.inits.push(options);
    if (!url.startsWith(`${ORIGIN}/api/v3/klines?`)) throw new Error(`refused ${url}`);
    const to = `${ep.base}${url.slice(ORIGIN.length)}`;
    const req = ep.base.startsWith("http:") ? httpRequest(to, { ...options, agent: undefined }) : realHttpsRequest(to, options);
    // an error of a request that its caller never handles (the base's recorder never ends it) cannot end this process; the recorder's
    // own listener still fires
    return req.on("error", () => undefined);
  };
}

/** "ok", or the code of the RecorderStop: a mutant that throws anything else reddens by assertion, not by a crash. */
async function outcome(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return "ok";
  } catch (e) {
    return e instanceof RecorderStop ? e.code : `not a stop: ${e instanceof Error ? e.message : "unknown"}`;
  }
}

/** One in-process recording over [start, end) against the loopback endpoint: clean environment, no flag, pauses recorded. */
async function record(rows: readonly Row[], start: number, end: number, plan: Plan = {}): Promise<Recording> {
  const ep = await endpoint(rows, plan.script, plan.perPage, plan.plain, plan), calls: Calls = { urls: [], inits: [] }, sleeps: number[] = [];
  const out = plan.out ?? fresh(), symbol = plan.symbol ?? "BTCUSDT";
  const sleep = (ms: number): Promise<void> => { sleeps.push(ms); return Promise.resolve(); };
  const io: RecorderIo = { fetch: via(ep, calls), sleep, env: {}, execArgv: [], ...plan.io };
  try {
    const code = await outcome(run(["--symbol", symbol, "--interval", plan.interval ?? "15m", "--start", iso(start), "--end", iso(end), "--out", out], io));
    return { code, out, calls, sleeps, served: ep.urls, headers: ep.headers, reused: ep.reused };
  } finally {
    await ep.close();
  }
}

// killer: scripts/record-binance-klines.mjs:221 CONST "${ctx.end - 1}" -> "${ctx.end}"
test("binance_klines_pages_a_full_page_then_a_partial_one", async () => {
  const n = LIMIT + 7, r = await record(series(n), at(0), at(n));
  assert.equal(r.code, "ok");
  const q = (s: number): string =>
    `${ORIGIN}/api/v3/klines?symbol=BTCUSDT&interval=15m&startTime=${String(s)}&endTime=${String(at(n) - 1)}&limit=1000`;
  assert.deepEqual(r.calls.urls, [q(at(0)), q(at(LIMIT))], "cursor = last openTime + 15 min, endTime = end - 1 ms, limit 1000, one host");
  assert.deepEqual([r.sleeps, PAUSE_MS >= 500], [[PAUSE_MS], true], "one pause of at least 500 ms between two requests, none before");
  assert.deepEqual(r.calls.inits.map((i) => [i.headers, i.method, i.agent !== undefined && i.agent === r.calls.inits[0]?.agent,
    i.signal instanceof AbortSignal]), [[undefined, undefined, true, true], [undefined, undefined, true, true]], "its own agent, no header");
  assert.deepEqual(r.headers.map((h) => [h.authorization, h["x-mbx-apikey"], h.cookie]), [[undefined, undefined, undefined],
    [undefined, undefined, undefined]], "no authentication header reaches the endpoint");
  const m = manifestOf(r.out), csv = text(r.out, "BTCUSDT-15m.csv").split(LF);
  assert.deepEqual([m.mode, m.platform, m.symbol, m.expected, m.rows, m.missing, m.pages, m.duplicates_removed, m.redistributable],
    ["record", "binance", "BTCUSDT", n, n, 0, 2, 0, false]);
  assert.deepEqual([m.first_open_time, m.last_open_time, m.start, m.end_exclusive], [iso(at(0)), iso(at(n - 1)), iso(at(0)), iso(at(n))]);
  assert.deepEqual([csv[0], csv[1], csv.length, csv.at(-1)], [CSV_COLUMNS.join(","), `${iso(at(0))},${String(at(0))},1.00000000,2.00000000,`
    + `0.50000000,1.50000000,10.00000000,${String(at(1) - 1)},15.00000000,7,4.00000000,6.00000000`, n + 2, ""]);
  const raws = rawNames(r.out);
  assert.deepEqual(raws, [`BTCUSDT-${String(at(0))}.json`, `BTCUSDT-${String(at(LIMIT))}.json`]);
  assert.deepEqual(logOf(r.out).map((l) => [l.url, l.status, l.bytes, l.sha256, l.headers["x-mbx-used-weight-1m"]]), raws.map((f, i) => {
    const b = bytes(join(r.out, "raw", f));
    return [r.calls.urls[i], 200, b.length, sha(b), String(2 * (i + 1))];
  }), "requests.jsonl: URL, status, bytes and sha256 of each raw page, weight header");
  const sums = text(r.out, "SHA256SUMS").split(LF).filter((l) => l !== "").map((l): [string, string, string] => [l.slice(0, 64), l.slice(64, 66), l.slice(66)]);
  assert.deepEqual(sums.map((s) => s[2]), ["BTCUSDT-15m.csv", "manifest.json", "missing.json", ...raws.map((f) => `raw/${f}`), "requests.jsonl"]);
  for (const [h, gap, name] of sums) assert.deepEqual([gap, h], ["  ", sha(bytes(join(r.out, name)))], `SHA256SUMS line of ${name}`);
  assert.equal(m.csv_sha256, sha(text(r.out, "BTCUSDT-15m.csv")));
});

// killer: scripts/record-binance-klines.mjs:326 COR "!rows.has(t)" -> "rows.has(t)"
test("binance_klines_removes_an_identical_duplicate_and_declares_gaps", async () => {
  // page 1 skips at(4); page 2 repeats at(5) byte for byte (an overlap); page 3 is the endpoint's; page 4 is empty (a tail gap)
  const r = await record(series(10, [4]), at(0), at(12), { script: new Map([[0, page([0, 1, 2, 3, 5])], [1, page([5, 6, 7])]]) });
  assert.equal(r.code, "ok");
  assert.deepEqual(r.calls.urls.map((u) => new URL(u).searchParams.get("startTime")), [at(0), at(6), at(8), at(10)].map(String));
  const m = manifestOf(r.out), csv = text(r.out, "BTCUSDT-15m.csv").split(LF).slice(1, -1);
  assert.deepEqual([m.expected, m.rows, m.missing, m.duplicates_removed, m.pages], [12, 9, 3, 1, 4]);
  assert.deepEqual(csv.map((l) => Number(l.split(",")[1])), [0, 1, 2, 3, 5, 6, 7, 8, 9].map(at), "ascending, the duplicate once");
  const declared: MissingDoc = { symbol: "BTCUSDT", interval: "15m", start: iso(at(0)), end_exclusive: iso(at(12)), count: 3,
    missing: [4, 10, 11].map((i) => ({ open_time_ms: at(i), open_time_utc: iso(at(i)) })) };
  assert.deepEqual(jsonOf(r.out, "missing.json"), declared, "every absent grid slot declared, none filled");
});

// killer: scripts/record-binance-klines.mjs:309 ROR "JSON.stringify(kept) === JSON.stringify(k)" -> "JSON.stringify(kept) !== JSON.stringify(k)"
test("binance_klines_refuses_a_conflicting_duplicate", async () => {
  const conflict = { status: 200, body: JSON.stringify([row(at(2), "9.99000000"), row(at(3))]) };
  const r = await record(series(4), at(0), at(4), { script: new Map([[0, page([0, 1, 2])], [1, conflict]]) });
  assert.deepEqual([r.code, r.served.length, rawCount(r.out), logOf(r.out).length, normalized(r.out)], ["duplicate_conflict", 2, 2, 2, []]);
});

// killer: scripts/record-binance-klines.mjs:250 CONST "status >= 300 && status < 400" -> "status >= 300 && status < 300"
test("binance_klines_stops_on_http_refusals", async () => {
  const cases: [Reply, string, string | null][] = [
    [{ status: 429, headers: { "retry-after": "30" } }, "rate_limited", "30"],
    [{ status: 418, headers: { "retry-after": "120" } }, "ip_banned", "120"],
    [{ status: 451, body: JSON.stringify({ code: 0, msg: "Service unavailable from a restricted location" }) }, "restricted_location", null],
    [{ status: 500 }, "server_error", null],
    [{ status: 503 }, "server_error", null],
    [{ status: 302, headers: { location: "/elsewhere" } }, "redirect_refused", null],
    [{ status: 404 }, "http_status", null],
    [{ status: 400, body: JSON.stringify({ code: -1121, msg: "Invalid symbol." }) }, "http_status", null],
    [{ status: 204 }, "http_status", null], // a null body, read as empty (BINANCE-PRE153-1 corrections, D-2: mutant G03)
  ];
  for (const [reply, code, retryAfter] of cases) {
    const r = await record(series(4), at(0), at(4), { script: new Map([[0, reply]]) }), log = logOf(r.out), kept = `errors/BTCUSDT-${String(at(0))}.json`;
    // D-2 of lot BINANCE-PRE153-1 (SERIES-ERROR-BODY-1): the body is kept under raw/errors/, its sha256 and its file in its line, then the stop
    assert.deepEqual([r.code, r.served.length, log.length, log[0]?.status, log[0]?.headers["retry-after"], rawNames(r.out), bytes(join(r.out, "raw", kept)),
      log[0]?.sha256, log[0]?.file, normalized(r.out)], [code, 1, 1, reply.status, retryAfter, ["errors"], Buffer.from(reply.body ?? ""),
      sha(reply.body ?? ""), `raw/${kept}`, []], `status ${String(reply.status)}: one request, logged, its body kept, never retried, nothing normalized`);
    assert.ok(STOPS.includes(code), code);
  }
  const cut = await record(series(4), at(0), at(4), { script: new Map([[0, { status: 0, cut: true }]]) });
  assert.deepEqual([cut.code, cut.served.length, existsSync(join(cut.out, "requests.jsonl")), normalized(cut.out)], ["network_error", 1, false, []]);
});

// killer: scripts/record-binance-klines.mjs:290 SDL "k[6] < k[0] || k[6] > k[0] + ctx.step - 1" -> ""
test("binance_klines_stops_on_bad_bodies_and_candles", async () => {
  const json = (v: unknown): Reply => ({ status: 200, body: JSON.stringify(v) });
  const base = row(at(1)), off = at(1) + 60_000, late = row(at(2)), early = row(at(1)), numeric: unknown[] = [...base];
  const tradesText: unknown[] = [...base], negative: unknown[] = [...base], exponent: unknown[] = [...base], lastNumber: unknown[] = [...base];
  const before = row(at(1)), atOpen = row(at(2));
  late[6] = at(3);
  early[6] = at(2) - 2;
  before[6] = at(1) - 1;
  atOpen[6] = at(2); // closed at its open, the shortest truncation (BTCUSDT 2017-09-06 16:00Z, 1h and 4h, rebuilt by the G1)
  numeric[4] = 1.5;
  tradesText[8] = "7";
  negative[8] = -1;
  exponent[5] = "1e-8";
  lastNumber[11] = 0;
  const cases: [ReadonlyMap<number, Reply>, string, number][] = [
    [new Map([[0, { status: 200, body: "<html>blocked</html>" }]]), "body_not_json", 1],
    [new Map([[0, json({ code: -1121, msg: "Invalid symbol." })]]), "body_not_klines", 1],
    [new Map([[0, json([base.slice(0, 11)])]]), "row_shape", 1],
    [new Map([[0, json([numeric])]]), "row_shape", 1],
    [new Map([[0, json([tradesText])]]), "row_shape", 1],
    [new Map([[0, json([[...base, "0"]])]]), "row_shape", 1],
    [new Map([[0, json([negative])]]), "row_shape", 1],
    [new Map([[0, json([exponent])]]), "row_shape", 1],
    [new Map([[0, json([lastNumber])]]), "row_shape", 1],
    [new Map([[0, json([[off, ...base.slice(1, 6), off + STEP_MS - 1, ...base.slice(7)]])]]), "off_grid", 1],
    [new Map([[0, json([row(at(-1))])]]), "out_of_range", 1],
    [new Map([[0, json([row(at(4))])]]), "out_of_range", 1],
    [new Map([[0, json([late])]]), "close_out_of_slot", 1], [new Map([[0, json([before])]]), "close_out_of_slot", 1],
    [new Map([[0, page([0, 1])], [1, page([0, 1])]]), "cursor_not_advancing", 2],
  ];
  for (const [script, code, pages] of cases) {
    const r = await record(series(4), at(0), at(4), { script });
    assert.deepEqual([r.code, r.served.length, rawCount(r.out), normalized(r.out)], [code, pages, pages, []], `${code}: raw kept, nothing normalized`);
    assert.ok(STOPS.includes(code), code);
  }
  // a close 1 ms after its slot (late) or 1 ms before its open (before) stops the grid (D-3 of the corrections); a close in its slot
  // short of open + 15 min - 1 ms, by 1 ms (early) or down to the open itself (atOpen), stops nothing: kept and listed as received
  const kept = await record(series(4), at(0), at(4), { script: new Map([[0, json([row(at(0)), early, atOpen, row(at(3))])]]) });
  assert.deepEqual([kept.code, manifestOf(kept.out).rows, manifestOf(kept.out).irregular_close], ["ok", 4,
    [{ open_time_ms: at(1), close_time_ms: at(2) - 2 }, { open_time_ms: at(2), close_time_ms: at(2) }]]);
});

// killer: scripts/record-binance-klines.mjs:298 ROR "pages === MAX_PAGES" -> "pages > MAX_PAGES"
test("binance_klines_stops_after_one_hundred_pages", async () => {
  const r = await record(series(150), at(0), at(150), { perPage: 1 });
  assert.deepEqual([r.code, MAX_PAGES, r.served.length, r.sleeps.length, rawCount(r.out), normalized(r.out)], ["too_many_pages", 100, 100, 99, 100, []]);
});

// killer: scripts/record-binance-klines.mjs:167 SDL "if (existsSync(join(dir, " -> ""
test("binance_klines_refuses_an_unusable_output_directory", async () => {
  const full = fresh(), file = fresh(), repo = fresh(), worktree = fresh(), empty = fresh(), link = fresh();
  mkdirSync(full);
  writeFileSync(join(full, "keep.txt"), "kept");
  writeFileSync(file, "a file");
  mkdirSync(join(repo, ".git"), { recursive: true });
  mkdirSync(join(repo, "inner"));
  symlinkSync(join(repo, "inner"), link, "junction"); // a link out of the repository: only its resolved path holds .git
  mkdirSync(worktree);
  writeFileSync(join(worktree, ".git"), "gitdir: elsewhere");
  mkdirSync(empty);
  const cases: [string, string][] = [[full, "out_not_empty"], [file, "out_not_empty"], [join(repo, "deep", "out"), "out_in_git_tree"],
    [join(worktree, "out"), "out_in_git_tree"], [join(link, "out"), "out_in_git_tree"]];
  for (const [out, code] of cases) {
    const r = await record(series(4), at(0), at(4), { out });
    assert.deepEqual([r.code, r.calls.urls.length], [code, 0], `${code}: refused before any request`);
  }
  assert.deepEqual([existsSync(join(repo, "deep")), existsSync(join(worktree, "out")), existsSync(join(repo, "inner", "out")), readdirSync(full)],
    [false, false, false, ["keep.txt"]]);
  const ok = await record(series(4), at(0), at(4), { out: empty });
  assert.deepEqual([ok.code, ok.calls.urls.length], ["ok", 1], "an empty directory outside any git tree is used");
  assert.equal(manifestOf(empty).rows, 4);
});

// killer: scripts/record-binance-klines.mjs:151 CONST "if (names.length > 0)" -> "if (false)"
test("binance_klines_refuses_a_proxy_or_an_unverified_tls", async () => {
  const proxy = "http://127.0.0.1:9";
  const cases: [RecorderIo, string][] = [
    [{ env: { NODE_USE_ENV_PROXY: "1" } }, "proxy_refused"],
    [{ execArgv: ["--use-env-proxy"] }, "proxy_refused"],
    [{ execArgv: ["--use-env-proxy=true"] }, "proxy_refused"],
    [{ env: { NODE_OPTIONS: "--max-old-space-size=64 --use-env-proxy" } }, "proxy_refused"],
    [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "0" } }, "tls_unverified"],
    // D-4 of the corrections, refused closed and never parsed (G2 of COINBASE-USDT-RECORDER-1, F-2: a quoted NODE_OPTIONS and a config
    // file both passed a parsing guard and routed fetch through a proxy): any NODE_OPTIONS, any node flag, any *_PROXY in any case
    [{ env: { NODE_OPTIONS: "\"--use-env-proxy\"" } }, "proxy_refused"], [{ env: { NODE_OPTIONS: "" } }, "proxy_refused"],
    [{ env: { NODE_OPTIONS: "--max-old-space-size=64" } }, "proxy_refused"], [{ env: { node_options: "--use-env-proxy" } }, "proxy_refused"],
    [{ execArgv: ["--experimental-config-file=node.config.json"] }, "proxy_refused"], [{ execArgv: ["--no-warnings"] }, "proxy_refused"],
    [{ env: { HTTPS_PROXY: proxy } }, "proxy_refused"], [{ env: { https_proxy: proxy } }, "proxy_refused"],
    [{ env: { HTTP_PROXY: proxy } }, "proxy_refused"], [{ env: { all_proxy: proxy } }, "proxy_refused"],
    [{ env: { NO_PROXY: "*" } }, "proxy_refused"], [{ env: { NODE_USE_ENV_PROXY: "" } }, "proxy_refused"],
    // D-4 of lot BINANCE-PRE153-1 (SERIES-ENV-ALLOWLIST-1): a closed list of admitted names, any case; every other name stops, a name
    // that only contains an admitted one or a refused one included; NODE_TLS_REJECT_UNAUTHORIZED=0 keeps its own stop (above); the code
    // (BINANCE-PRE153-1 corrections, D-5): env_refused, unless a proxy variable or a node flag is there too (proxy_refused)
    [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "1", PATH: "/usr/bin", PROXY: proxy, HTTPS_PROXY_NOTE: "x" } }, "env_refused"],
    [{ env: { NODE_TLS_REJECT_UNAUTHORIZED: "1" } }, "env_refused"], [{ env: { TMP: "/tmp" } }, "env_refused"],
    [{ env: { HOME: "/home" } }, "env_refused"], [{ env: { PATHEXT: ".EXE" } }, "env_refused"],
    [{ env: { MY_TEMP: "/tmp" } }, "env_refused"], [{ env: { SYSTEMROOT_X: "x" } }, "env_refused"],
    [{ env: { PATHEXT: ".EXE", HTTPS_PROXY: proxy } }, "proxy_refused"], [{ env: { PATHEXT: ".EXE" }, execArgv: ["--no-warnings"] }, "proxy_refused"],
    [{ env: { HOMEDRIVE: "C:", HOMEPATH: resolve("/h"), LOGONSERVER: "x", MSYSTEM: "MINGW64", PATH: resolve("/usr/bin"), SYSTEMDRIVE: "C:",
      SystemRoot: resolve("/W"), TEMP: resolve("/tmp"), USERDOMAIN: "x", USERNAME: "x", USERPROFILE: resolve("/u"), windir: resolve("/W") } },
    "ok"], // the twelve admitted names, their values of the closed form (lot BINANCE-PRE35-1)
  ];
  for (const [io, code] of cases) {
    const r = await record(series(4), at(0), at(4), { io });
    assert.deepEqual([r.code, r.calls.urls.length, existsSync(r.out)], [code, code === "ok" ? 1 : 0, code === "ok"], JSON.stringify(io));
  }
  // the stop names the variables and counts the flags, never a value: a proxy URL may carry a password
  const lines: string[] = [], calls: Calls = { urls: [], inits: [] }, out = fresh();
  const env = { HTTPS_PROXY: "http://user:secret@127.0.0.1:9", NODE_OPTIONS: "--use-env-proxy", PATH: "/usr/bin" };
  const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)), "--out", out];
  const code = await main(argv, { fetch: offline(calls), env, execArgv: ["--no-warnings"], print: (l) => { lines.push(l); } }).catch(() => -1);
  assert.deepEqual([code, lines, calls.urls.length, existsSync(out)], [1, [JSON.stringify({ ok: false, stop: "proxy_refused",
    detail: { variables: ["HTTPS_PROXY", "NODE_OPTIONS"], execArgv_length: 1 } })], 0, false]);
  const named = await main(argv, { fetch: offline(calls), env: { PATHEXT: "a value never printed", COMSPEC: "x" }, execArgv: [],
    print: (l) => { lines.push(l); } }).catch(() => -1);
  assert.deepEqual([named, lines[1], calls.urls.length, existsSync(out)], [1, JSON.stringify({ ok: false, stop: "env_refused",
    detail: { variables: ["COMSPEC", "PATHEXT"], execArgv_length: 0 } }), 0, false], "env_refused names the variables, never a value");
});

// killer: scripts/record-binance-klines.mjs:323 CONST "k[1], k[2]" -> "Number(k[1]), k[2]"
test("binance_klines_keeps_decimal_strings_byte_for_byte", async () => {
  const long = "123456789012345678901234567890.123456789012345678901234567890";
  const odd: Row = [at(0), "0.00000001000", long, "00012.50", "1.10000000", "5", at(1) - 1, "0", 2, "0.000000000000000000000001", "1.0", "0"];
  const body = JSON.stringify([odd]), r = await record([odd], at(0), at(1), { script: new Map([[0, { status: 200, body }]]) });
  assert.equal(r.code, "ok");
  assert.equal(text(r.out, "BTCUSDT-15m.csv").split(LF)[1], [iso(at(0)), String(at(0)), "0.00000001000", long, "00012.50", "1.10000000", "5",
    String(at(1) - 1), "0", "2", "0.000000000000000000000001", "1.0"].join(","), "decimal strings as received, never a float");
  assert.deepEqual(bytes(join(r.out, "raw", `BTCUSDT-${String(at(0))}.json`)), Buffer.from(body), "raw/ holds the bytes as received");
});

// killer: scripts/record-binance-klines.mjs:273 SDL "ctx.used.add(name);" -> ""
test("binance_klines_replays_raw_to_the_same_bytes", async () => {
  const r = await record(series(10, [4]), at(0), at(12), { script: new Map([[0, page([0, 1, 2, 3, 5])], [1, page([5, 6, 7])]]) });
  assert.equal(r.code, "ok");
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], out = fresh(), less = fresh(), more = fresh();
  // the exit code, or -1 when main throws: every outcome is compared by assert; the replay never requests, so no environment guard
  const replay = (from: string, to: string): Promise<number> => main(["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)),
    "--end", iso(at(12)), "--out", to, "--from-raw", from], { fetch: offline(calls), env: { NODE_USE_ENV_PROXY: "1" }, print: (l) => {
    lines.push(l);
  } }).catch(() => -1);
  assert.equal(await replay(r.out, out), 0);
  const m = manifestOf(out), first = manifestOf(r.out);
  assert.deepEqual([text(out, "BTCUSDT-15m.csv"), text(out, "missing.json")], [text(r.out, "BTCUSDT-15m.csv"), text(r.out, "missing.json")]);
  assert.deepEqual([m.mode, m.from_raw, m.csv_sha256, m.rows, m.missing, m.duplicates_removed, m.pages, calls.urls.length, readdirSync(out).sort()],
    ["replay", resolve(r.out), first.csv_sha256, 9, 3, 1, 4, 0, ["BTCUSDT-15m.csv", "SHA256SUMS", "manifest.json", "missing.json"]]);
  // D-1 (d) of lot BINANCE-PRE153-1: the manifest of a replay carries the sha256 of its source's requests.jsonl and SHA256SUMS as read,
  // an anchor sealed with the replay (RECHERCHES, non-blocking point 1); a recording's carries none
  assert.deepEqual([m.from_raw_requests_sha256, m.from_raw_sha256sums_sha256, first.from_raw_requests_sha256, first.from_raw_sha256sums_sha256],
    [sha(bytes(join(r.out, "requests.jsonl"))), sha(bytes(join(r.out, "SHA256SUMS"))), null, null]);
  // a page missing or one more page, beside requests.jsonl (the form of a stopped recording); raw/ alone names no interval and is
  // refused unread (D-1 (b): source_unattested)
  const pages = rawNames(r.out), bare = fresh();
  for (const [dir, keep] of [[less, pages.slice(1)], [more, pages], [bare, pages]] as const) {
    mkdirSync(join(dir, "raw"), { recursive: true });
    for (const f of keep) writeFileSync(join(dir, "raw", f), bytes(join(r.out, "raw", f)));
    if (dir !== bare) writeFileSync(join(dir, "requests.jsonl"), bytes(join(r.out, "requests.jsonl")));
  }
  writeFileSync(join(more, "raw", "BTCUSDT-0.json"), "[]");
  assert.deepEqual([await replay(less, fresh()), await replay(more, fresh()), await replay(bare, fresh()), calls.urls.length], [1, 1, 1, 0]);
  assert.deepEqual(lines.map((l) => (JSON.parse(l) as { ok: boolean; stop?: string }).stop ?? "written"),
    ["written", "raw_page_missing", "raw_page_unused", "source_unattested"], "one JSON line per run: written, then the named stops of the replay");
});

// killer: scripts/record-binance-klines.mjs:138 CONST "(end - start) / INTERVALS[interval]" -> "(end - start) / INTERVALS[interval] + 1"
test("binance_klines_expects_70080_candles_on_the_founder_range", async () => {
  const start = parseTime("2024-10-01T00:00:00Z"), end = parseTime("2026-10-01T00:00:00Z");
  assert.deepEqual([expectedCount(start, end), (end - start) / 86_400_000, SYMBOLS], [70_080, 730, ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"]]);
  for (const symbol of SYMBOLS) {
    const a = parseArgs(["--symbol", symbol, "--interval", "15m", "--start", "2024-10-01T00:00Z", "--end", "2026-10-01T00:00:00Z", "--out", "x"]);
    assert.deepEqual([a.symbol, expectedCount(a.start, a.end)], [symbol, 70_080], `${symbol}: same endpoint, same range, 70 080 expected`);
  }
  const rows = Array.from({ length: 70_080 }, (_, i) => row(start + i * STEP_MS));
  const r = await record(rows, start, end, { symbol: "SOLUSDT", io: { now: () => end } }); // an end equal to now is a closed candle
  assert.equal(r.code, "ok");
  const m = manifestOf(r.out);
  assert.deepEqual([m.symbol, m.expected, m.rows, m.missing, m.pages, r.sleeps.length], ["SOLUSDT", 70_080, 70_080, 0, 71, 70]);
  assert.deepEqual([m.first_open_time, m.last_open_time, text(r.out, "SOLUSDT-15m.csv").split(LF).length], ["2024-10-01T00:00:00Z",
    "2026-09-30T23:45:00Z", 70_082]);
});

// killer: scripts/record-binance-klines.mjs:131 SDL "!Object.hasOwn(INTERVALS, interval)" -> ""
test("binance_klines_refuses_bad_arguments", async () => {
  const base = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", "2025-01-01T00:00Z", "--end", "2025-01-01T01:00Z"];
  const swap = (flag: string, value: string): string[] => base.map((v, i) => (base[i - 1] === flag ? value : v));
  const cases: [string[], string][] = [
    [swap("--symbol", "XRPUSDT"), "bad_symbol"], [swap("--symbol", "btcusdt"), "bad_symbol"], [swap("--interval", "4h"), "bad_time"],
    [swap("--interval", "30m"), "bad_interval"], [swap("--interval", "1d"), "bad_interval"], [swap("--interval", ""), "bad_interval"],
    [swap("--interval", "constructor"), "bad_interval"], // a key of the prototype of INTERVALS is not in the closed list
    [swap("--start", "2025-01-01T00:00:30Z"), "bad_time"], [swap("--start", "2025-01-01T00:05Z"), "bad_time"],
    [swap("--start", "2024-12-31T24:00Z"), "bad_time"], [swap("--end", "2025-02-30T00:00Z"), "bad_time"], // parsed leniently: round trip
    [swap("--start", "2025-01-01 00:00Z"), "bad_time"], [[...base, "--from-raw", "--x"], "usage"],
    [swap("--end", "2025-01-01T00:00Z"), "bad_time"], [swap("--end", "2099-01-01T00:00Z"), "end_in_future"],
    [[...base, "--limit", "5"], "usage"], [[...base, "--symbol", "ETHUSDT"], "usage"],
  ];
  for (const [argv, code] of cases) {
    const out = fresh(), calls: Calls = { urls: [], inits: [] };
    const got = await outcome(run([...argv, "--out", out], { fetch: offline(calls), env: {}, execArgv: [] }));
    assert.deepEqual([got, calls.urls.length, existsSync(out)], [code, 0, false], argv.join(" "));
  }
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], print = (l: string): void => { lines.push(l); };
  const noOut = await outcome(run(base, { fetch: offline(calls) })), noValue = await outcome(run([...base, "--out"], { fetch: offline(calls) }));
  assert.deepEqual([noOut, noValue], ["usage", "usage"], "--out absent, then without a value");
  assert.deepEqual([await main([...swap("--symbol", "XRPUSDT"), "--out", fresh()], { fetch: offline(calls), print }), await main(base, { print })], [1, 2]);
  assert.deepEqual([lines.map((l) => (JSON.parse(l) as { stop?: string }).stop), calls.urls.length], [["bad_symbol", "usage"], 0]);
  assert.deepEqual([recorder.INTERVALS, Object.isFrozen(recorder.INTERVALS)], [{ "15m": 900_000, "1h": 3_600_000, "4h": 14_400_000 }, true],
    "the closed list: each name with its duration in ms, frozen");
});

const FOUNDER = [Date.UTC(2024, 9, 1), Date.UTC(2026, 9, 1)] as const; // 2024-10-01 to 2026-10-01 excluded: 730 days
const ALLOWED = ["15m", "1h", "4h"]; // the closed list as a bad_interval stop names it
/** The URL of one request of the recorder. */
const klinesUrl = (symbol: string, interval: string, from: number, end: number): string =>
  `${ORIGIN}/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${String(from)}&endTime=${String(end - 1)}&limit=1000`;
/** One answer whose single candle is k. */
const served = (k: Row): ReadonlyMap<number, Reply> => new Map([[0, { status: 200, body: JSON.stringify([k]) }]]);

/** The line that main prints on stderr for a named stop. */
const stopLine = (stop: string, detail: Record<string, unknown>): string => JSON.stringify({ ok: false, stop, detail });
/** parseTime at its default interval: the time in ms, or the code of its stop. */
const timeOf = (text: string): number | string => {
  try { return parseTime(text); } catch (e) { return e instanceof RecorderStop ? e.code : "not a stop"; }
};

/** What main prints for BTCUSDT on 2025-01-01 from `from` to `to` (HH:MM UTC), fresh --out, offline fetch; and its request count. */
async function printed(interval: string, from: string, to: string): Promise<[string, number]> {
  const calls: Calls = { urls: [], inits: [] }, lines: string[] = [], day = (hm: string): string => `2025-01-01T${hm}Z`;
  const argv = ["--symbol", "BTCUSDT", "--interval", interval, "--start", day(from), "--end", day(to), "--out", fresh()];
  await main(argv, { fetch: offline(calls), env: {}, execArgv: [], print: (l) => { lines.push(l); } }).catch(() => -1);
  return [lines.join(LF), calls.urls.length];
}

/** Every candle of the founder range at one interval, served by the loopback endpoint; the open times read back from the CSV. */
async function founderRun(symbol: string, interval: string, step: number): Promise<{ r: Recording; m: SeriesManifest; opens: number[] }> {
  const [start, end] = FOUNDER, rows = Array.from({ length: (end - start) / step }, (_, i) => row(start + i * step, "1.50000000", step));
  const r = await record(rows, start, end, { symbol, interval, io: { now: () => end } });
  const opens = text(r.out, `${symbol}-${interval}.csv`).split(LF).slice(1, -1).map((l) => Number(l.split(",")[1]));
  return { r, m: manifestOf(r.out), opens };
}

/** A replay of `from` under `interval` over the founder range into a fresh --out: its code and that --out (offline fetch). */
async function replayed(from: string, symbol: string, interval: string): Promise<[string, string]> {
  const [start, end] = FOUNDER, out = fresh(), calls: Calls = { urls: [], inits: [] };
  const argv = ["--symbol", symbol, "--interval", interval, "--start", iso(start), "--end", iso(end), "--out", out, "--from-raw", from];
  return [await outcome(run(argv, { fetch: offline(calls), now: () => end })), out];
}

// killer: scripts/record-binance-klines.mjs:313 CONST "+ ctx.step" -> "+ 900_000"
test("binance_klines_records_17520_hourly_candles_aligned_on_the_hour", async () => {
  const [start, end] = FOUNDER, { r, m, opens } = await founderRun("ETHUSDT", "1h", HOUR_MS);
  assert.equal(r.code, "ok");
  assert.deepEqual([m.interval, m.csv, m.expected, m.rows, m.missing, m.pages, r.sleeps.length, expectedCount(start, end, "1h")],
    ["1h", "ETHUSDT-1h.csv", 17_520, 17_520, 0, 18, 17, 17_520]);
  assert.deepEqual([m.first_open_time, m.last_open_time, opens.length, opens.every((t, i) => t === start + i * HOUR_MS)],
    ["2024-10-01T00:00:00Z", "2026-09-30T23:00:00Z", 17_520, true], "every open on the hour, ascending, none skipped");
  assert.deepEqual(r.calls.urls.slice(0, 2), [start, start + LIMIT * HOUR_MS].map((s) => klinesUrl("ETHUSDT", "1h", s, end)));
  assert.deepEqual(jsonOf(r.out, "missing.json"), { symbol: "ETHUSDT", interval: "1h", start: iso(start), end_exclusive: iso(end), count: 0,
    missing: [] });
  // off the hour: a candle served at 00:15 stops, one with a 15-minute close is kept and listed; --start or --end off the hour and names
  // outside the closed list are refused before any request, with the exact line that main prints (the 15-minute grid keeps its words)
  const quarter = await record([], T0, T0 + 4 * HOUR_MS, { interval: "1h", script: served(row(T0 + STEP_MS, "1.50000000", HOUR_MS)) });
  const short = await record([], T0, T0 + 4 * HOUR_MS, { interval: "1h", script: served(row(T0)) });
  assert.deepEqual([quarter.code, short.code, manifestOf(short.out).irregular_close, timeOf("2025-01-01T00:15Z")],
    ["off_grid", "ok", [{ open_time_ms: T0, close_time_ms: T0 + STEP_MS - 1 }], T0 + STEP_MS], "parseTime: 15m by default");
  assert.deepEqual([await printed("1h", "00:15", "02:00"), await printed("1h", "00:00", "00:45"), await printed("15m", "00:05", "02:00"),
    await printed("1H", "00:00", "02:00"), await printed("60m", "00:00", "02:00")], [
    [stopLine("bad_time", { value: "2025-01-01T00:15Z", why: "not on the 60-minute grid" }), 0],
    [stopLine("bad_time", { value: "2025-01-01T00:45Z", why: "not on the 60-minute grid" }), 0],
    [stopLine("bad_time", { value: "2025-01-01T00:05Z", why: "not on the 15-minute grid" }), 0],
    [stopLine("bad_interval", { value: "1H", allowed: ALLOWED }), 0], [stopLine("bad_interval", { value: "60m", allowed: ALLOWED }), 0]]);
  // raw/ names no interval, the manifest of the recording does: the replay under 1h gives the same CSV bytes; under 15m or 4h it is
  // refused before anything is written (interval_mismatch, D-2 of the corrections)
  const [same, sameOut] = await replayed(r.out, "ETHUSDT", "1h"), [as15m, out15m] = await replayed(r.out, "ETHUSDT", "15m");
  const [as4h, out4h] = await replayed(r.out, "ETHUSDT", "4h");
  assert.deepEqual([same, text(sameOut, "ETHUSDT-1h.csv") === text(r.out, "ETHUSDT-1h.csv"), as15m, as4h, existsSync(out15m), existsSync(out4h)],
    ["ok", true, "interval_mismatch", "interval_mismatch", false, false]);
});

// killer: scripts/record-binance-klines.mjs:288 CONST "k[0] % ctx.step" -> "k[0] % 900_000"
test("binance_klines_records_4380_four_hour_candles_aligned_on_the_utc_day", async () => {
  const [start, end] = FOUNDER, { r, m, opens } = await founderRun("BNBUSDT", "4h", FOUR_HOURS_MS);
  assert.equal(r.code, "ok");
  assert.deepEqual([m.interval, m.csv, m.expected, m.rows, m.missing, m.pages, r.sleeps.length, expectedCount(start, end, "4h")],
    ["4h", "BNBUSDT-4h.csv", 4_380, 4_380, 0, 5, 4, 4_380]);
  assert.deepEqual([m.first_open_time, m.last_open_time, opens.length, opens.every((t, i) => t === start + i * FOUR_HOURS_MS)],
    ["2024-10-01T00:00:00Z", "2026-09-30T20:00:00Z", 4_380, true], "opens at 00, 04, 08, 12, 16 and 20 UTC, ascending, none skipped");
  assert.deepEqual(r.calls.urls.slice(0, 2), [start, start + LIMIT * FOUR_HOURS_MS].map((s) => klinesUrl("BNBUSDT", "4h", s, end)));
  // a gap declared on the 4-hour grid; a candle served at 01:00 stops, one with a 1-hour close is kept and listed; --start or --end off
  // the grid; other names
  const slot = (i: number): number => T0 + i * FOUR_HOURS_MS;
  const gap = await record([0, 1, 3, 4, 5].map((i) => row(slot(i), "1.50000000", FOUR_HOURS_MS)), slot(0), slot(6), { interval: "4h" });
  const late = await record([], slot(0), slot(2), { interval: "4h", script: served(row(T0 + HOUR_MS, "1.50000000", FOUR_HOURS_MS)) });
  const short = await record([], slot(0), slot(2), { interval: "4h", script: served(row(T0, "1.50000000", HOUR_MS)) });
  assert.deepEqual([gap.code, (jsonOf(gap.out, "missing.json") as MissingDoc | null)?.missing, late.code, short.code,
    manifestOf(short.out).irregular_close], ["ok", [{ open_time_ms: slot(2), open_time_utc: "2025-01-01T08:00:00Z" }], "off_grid", "ok",
    [{ open_time_ms: T0, close_time_ms: T0 + HOUR_MS - 1 }]]);
  assert.deepEqual([await printed("4h", "02:00", "08:00"), await printed("4h", "00:00", "06:00"), await printed("4H", "00:00", "08:00"),
    await printed("240m", "00:00", "08:00")], [[stopLine("bad_time", { value: "2025-01-01T02:00Z", why: "not on the 240-minute grid" }), 0],
    [stopLine("bad_time", { value: "2025-01-01T06:00Z", why: "not on the 240-minute grid" }), 0],
    [stopLine("bad_interval", { value: "4H", allowed: ALLOWED }), 0], [stopLine("bad_interval", { value: "240m", allowed: ALLOWED }), 0]]);
});

const CUT_MS = 581_646; // the halt of 2023-03-24 closed the 12:30Z candle 9 min 41.646 s after its open (rule 8 of RECHERCHES ADR 0006)
/** That halt on the 15-minute grid from T0: trades at slots 0 and 1, 0 trades from slot 2 on, slot 6 cut at CUT_MS (0 trades), slots 7
 *  to 11 absent, trades again from slot 12 to 15; `patch` edits a candle after that, by slot. */
const halt = (patch: (k: Row, i: number) => void = () => undefined): Row[] => [0, 1, 2, 3, 4, 5, 6, 12, 13, 14, 15].map((i) => {
  const k = row(at(i));
  if (i >= 2 && i <= 6) k[8] = 0;
  if (i === 6) k[6] = at(6) + CUT_MS;
  patch(k, i);
  return k;
});

// killer: scripts/record-binance-klines.mjs:335 ROR "k[6] !== k[0] + ctx.step - 1" -> "k[6] === k[0] + ctx.step - 1"
test("binance_klines_keeps_a_truncated_candle_as_received_and_lists_it", async () => {
  const r = await record(halt((k, i) => { if (i === 13) k[6] = at(13) + 60_000; }), at(0), at(16)); // slot 13 cut after 1 min, 7 trades
  assert.equal(r.code, "ok");
  const m = manifestOf(r.out), csv = text(r.out, "BTCUSDT-15m.csv").split(LF);
  assert.deepEqual([m.expected, m.rows, m.missing, m.irregular_close, m.zero_trade], [16, 11, 5, [{ open_time_ms: at(6), close_time_ms: at(6) + CUT_MS },
    { open_time_ms: at(13), close_time_ms: at(13) + 60_000 }], [2, 3, 4, 5, 6].map(at)],
    "kept and counted as rows, listed ascending with the closes as received; the cut slot 13 trades, so it is no zero_trade candle");
  assert.equal(csv[7], [iso(at(6)), String(at(6)), "1.00000000", "2.00000000", "0.50000000", "1.50000000", "10.00000000",
    String(at(6) + CUT_MS), "15.00000000", "0", "4.00000000", "6.00000000"].join(","), "the CSV line as received, never repaired");
  assert.deepEqual((jsonOf(r.out, "missing.json") as MissingDoc | null)?.missing.map((x) => x.open_time_ms), [7, 8, 9, 10, 11].map(at),
    "completeness reads missing.json alone: the cut candle is present, the five after it are absent");
});

// killer: scripts/record-binance-klines.mjs:336 ROR "k[8] === 0" -> "k[8] !== 0"
test("binance_klines_lists_the_zero_trade_candles_through_the_truncated_one", async () => {
  const r = await record(halt((k, i) => { if (i === 14) k[8] = 0; }), at(0), at(16)); // slot 14: 0 trades, a regular close, alone
  assert.equal(r.code, "ok");
  const trades = text(r.out, "BTCUSDT-15m.csv").split(LF).slice(1, -1).map((l) => l.split(",")[9]);
  assert.deepEqual([manifestOf(r.out).zero_trade, trades], [[2, 3, 4, 5, 6, 14].map(at), ["7", "7", "0", "0", "0", "0", "0", "7", "7", "0", "7"]],
    "every candle with 0 trades, ascending: the run from slot 2 through the cut slot 6 (rule 8 bis), then slot 14; slots 1 and 12 trade");
});

// killer: scripts/record-binance-klines.mjs:336 COR "k[8] === 0" -> "k[8] === 0 || k[6] !== k[0] + ctx.step - 1"
test("binance_klines_ends_the_zero_trade_run_at_a_truncated_candle_with_trades", async () => {
  // rule 8 bis (RECHERCHES ADR 0006, addendum 4, section 5): a truncated candle with trades closes the zero_trade run, so E is its close
  // + 1 ms downstream; it is listed in irregular_close and never in zero_trade (D-1 of the corrections, G2 F-1: mutant M1 survived)
  const r = await record(halt((k, i) => { if (i === 6) k[8] = 3; }), at(0), at(16)); // the cut slot 6 trades
  assert.equal(r.code, "ok");
  const m = manifestOf(r.out), trades = text(r.out, "BTCUSDT-15m.csv").split(LF).slice(1, -1).map((l) => l.split(",")[9]);
  assert.deepEqual([m.zero_trade, m.irregular_close, trades[6]], [[2, 3, 4, 5].map(at), [{ open_time_ms: at(6), close_time_ms: at(6) + CUT_MS }],
    "3"], "the run is slots 2 to 5; the cut slot 6 ends it: listed with its close as received, its trades as received, not a zero_trade candle");
});

// killer: scripts/record-binance-klines.mjs:289 SDL "k[0] < ctx.start || k[0] >= ctx.end" -> ""
test("binance_klines_keeps_every_grid_stop_behind_an_irregular_close", async () => {
  const json = (v: unknown): Reply => ({ status: 200, body: JSON.stringify(v) }), cut = row(at(1)), other = row(at(1)), next = row(at(2));
  cut[6] = at(1) + CUT_MS;
  other[6] = at(1) + CUT_MS + 1; // the same open time with another close: a conflicting duplicate
  const off = at(2) + 60_000, offGrid = [off, ...next.slice(1, 6), off + STEP_MS - 1, ...next.slice(7)];
  const hourly = row(at(2), "1.50000000", HOUR_MS); // a 1-hour close on the 15-minute grid: after its slot (D-3 of the corrections)
  const cases: [ReadonlyMap<number, Reply>, string, number][] = [
    [new Map([[0, json([row(at(0)), cut, offGrid])]]), "off_grid", 1],
    [new Map([[0, json([row(at(0)), cut, row(at(4))])]]), "out_of_range", 1],
    [new Map([[0, json([row(at(0)), cut, hourly])]]), "close_out_of_slot", 1],
    [new Map([[0, json([cut, next.slice(0, 11)])]]), "row_shape", 1],
    [new Map([[0, json([row(at(0)), cut])], [1, json([other, next])]]), "duplicate_conflict", 2],
    [new Map([[0, json([row(at(0)), cut])], [1, json([row(at(0)), cut])]]), "cursor_not_advancing", 2],
  ];
  for (const [script, code, pages] of cases) {
    const r = await record(series(4), at(0), at(4), { script });
    assert.deepEqual([r.code, r.served.length, rawCount(r.out), normalized(r.out)], [code, pages, pages, []],
      `${code} after a cut candle: raw kept, nothing normalized`);
  }
  assert.deepEqual([...cases.map((c) => c[1]), "interval_mismatch", "close_time"].map((c) => STOPS.includes(c)),
    [true, true, true, true, true, true, true, false], "the closed list keeps the grid stops, names the replay's, no longer close_time");
});

// killer: scripts/record-binance-klines.mjs:354 CONST "zero_trade: lists.zeroTrade" -> "zero_trade: []"
test("binance_klines_replays_cut_and_zero_trade_candles_to_the_same_bytes", async () => {
  const r = await record(halt(), at(0), at(16), { perPage: 4 }), clean = await record(series(4), at(0), at(4));
  assert.deepEqual([r.code, clean.code], ["ok", "ok"]);
  const calls: Calls = { urls: [], inits: [] };
  const replay = async (from: string, end: number): Promise<[number, string]> => {
    const out = fresh(), argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(end), "--out", out, "--from-raw", from];
    return [await main(argv, { fetch: offline(calls), print: () => undefined }).catch(() => -1), out];
  };
  const [[code, out], [cleanCode, cleanOut]] = [await replay(r.out, at(16)), await replay(clean.out, at(4))];
  const files = (dir: string): Buffer[] => ["BTCUSDT-15m.csv", "missing.json"].map((n) => bytes(join(dir, n)));
  const lists = (dir: string): unknown[] => [manifestOf(dir).irregular_close, manifestOf(dir).zero_trade];
  assert.deepEqual([code, cleanCode, calls.urls.length, manifestOf(out).mode, manifestOf(out).pages], [0, 0, 0, "replay", 3]);
  assert.deepEqual([files(out), files(cleanOut)], [files(r.out), files(clean.out)], "CSV and missing.json byte for byte, along 3 pages");
  const halted = [[{ open_time_ms: at(6), close_time_ms: at(6) + CUT_MS }], [2, 3, 4, 5, 6].map(at)];
  assert.deepEqual([lists(r.out), lists(out), lists(clean.out), lists(cleanOut)], [halted, halted, [[], []], [[], []]],
    "the same lists in the recording and in its replay; present and empty when nothing is irregular");
});

// killer: scripts/record-binance-klines.mjs:186 SDL "named !== args.interval" -> ""
test("binance_klines_refuses_a_replay_under_another_interval", async () => {
  // D-2 of the corrections (G2 F-2): the 1h page of the G2 probe, one candle at T0 closing at T0 + 1 h - 1 ms, replayed under 15m with
  // --end cut at T0 + 15 min wrote 1 row and exited 0. Recorded, its manifest names 1h: interval_mismatch. D-1 of lot BINANCE-PRE153-1
  // (REPLAY-INTERVAL-BIND-1): raw/ alone (the probe's copy), or beside SHA256SUMS alone, names no interval: refused unread (b,
  // source_unattested); the requests that requests.jsonl logged name the interval of a stopped recording (raw/ and requests.jsonl, the
  // form of the 118): a 1h candle closed within its first 15 minutes passed every grid check under 15m (Q-CORR-2), a forged line naming
  // 1h among 15m ones and an unreadable log name another or none (a, interval_mismatch); under its own interval, written
  const hourly = await record([], T0, T0 + HOUR_MS, { interval: "1h", script: served(row(T0, "1.50000000", HOUR_MS)) });
  const quarters = await record(series(8), at(0), at(8)); // 15-minute candles, the first on the hour
  const early = await record([], T0, T0 + HOUR_MS, { interval: "1h", script: served(row(T0)) }); // a 1h candle closed at T0 + 15 min - 1 ms
  const rawOnly = (from: string, files: readonly string[] = [], edit: (dir: string) => void = () => undefined): string => { // raw/, these files
    const dir = fresh();
    mkdirSync(join(dir, "raw"), { recursive: true });
    for (const f of [...rawNames(from).map((n) => `raw/${n}`), ...files]) writeFileSync(join(dir, f), bytes(join(from, f)));
    edit(dir);
    return dir;
  };
  // an unreadable manifest beside SHA256SUMS (a manifest with neither requests.jsonl nor SHA256SUMS is refused unread: corrections, D-1)
  const unreadable = rawOnly(quarters.out, ["SHA256SUMS"]), calls: Calls = { urls: [], inits: [] }, log = ["requests.jsonl"];
  writeFileSync(join(unreadable, "manifest.json"), "{");
  const forged = (dir: string): void => { // one more line, naming 1h, of status 500 (it attests no page)
    const line = JSON.stringify({ url: klinesUrl("BTCUSDT", "1h", at(0), at(8)), status: 500 });
    writeFileSync(join(dir, "requests.jsonl"), text(dir, "requests.jsonl") + line + LF);
  };
  const broken = (dir: string): void => { writeFileSync(join(dir, "requests.jsonl"), `{${LF}`); };
  const replay = async (from: string, interval: string, start: number, end: number): Promise<[string, boolean]> => {
    const out = fresh(), argv = ["--symbol", "BTCUSDT", "--interval", interval, "--start", iso(start), "--end", iso(end), "--out", out, "--from-raw", from];
    return [await outcome(run(argv, { fetch: offline(calls) })), existsSync(out)];
  };
  assert.deepEqual([hourly.code, quarters.code, early.code], ["ok", "ok", "ok"]);
  assert.deepEqual([await replay(hourly.out, "15m", T0, T0 + STEP_MS), await replay(rawOnly(hourly.out), "15m", T0, T0 + STEP_MS),
    await replay(quarters.out, "1h", at(0), at(8)), await replay(rawOnly(quarters.out), "1h", at(0), at(8)),
    await replay(unreadable, "15m", at(0), at(8)), await replay(hourly.out, "1h", T0, T0 + HOUR_MS), calls.urls.length],
  [["interval_mismatch", false], ["source_unattested", false], ["interval_mismatch", false], ["source_unattested", false],
    ["interval_mismatch", false], ["ok", true], 0], "refused before anything is written, never a request; under its own interval, written");
  assert.deepEqual([await replay(rawOnly(early.out, log), "15m", T0, T0 + STEP_MS), await replay(rawOnly(quarters.out, log, forged), "15m", at(0), at(8)),
    await replay(rawOnly(quarters.out, ["manifest.json", ...log], forged), "15m", at(0), at(8)),
    await replay(rawOnly(quarters.out, log, broken), "15m", at(0), at(8)), await replay(rawOnly(quarters.out, ["SHA256SUMS"]), "15m", at(0), at(8)),
    await replay(rawOnly(quarters.out, log), "15m", at(0), at(8)), await replay(rawOnly(early.out, log), "1h", T0, T0 + HOUR_MS), calls.urls.length],
  [["interval_mismatch", false], ["interval_mismatch", false], ["interval_mismatch", false], ["interval_mismatch", false], ["source_unattested", false],
    ["ok", true], ["ok", true], 0], "a stopped recording replays under the interval its requests name, beside a manifest too, and only under it");
  // BINANCE-PRE153-1 corrections, D-2 (G2-BNPRE-2: mutant G12 survived; probe P3, E1): a requests.jsonl that is a directory, beside a
  // manifest naming the right interval, names no interval (D-1 (a) of lot BINANCE-PRE153-1)
  assert.deepEqual([await replay(rawOnly(quarters.out, ["manifest.json"], asDir("requests.jsonl")), "15m", at(0), at(8)), calls.urls.length],
    [["interval_mismatch", false], 0]);
});

// killer: scripts/record-binance-klines.mjs:74 CONST "|WINDIR)$/i" -> "|WINDIR|NODE_USE_SYSTEM_CA)$/i"
test("binance_klines_refuses_a_trust_anchor_taken_from_the_environment", async () => {
  // D-1 of the second round (G2C-1): NODE_USE_SYSTEM_CA was measured set to 1 on this host, whose system store holds two interception
  // roots; it and the other variables that add or swap a TLS trust anchor are refused by NAME, whatever the value, in any case, before
  // any request; the stop names the variables, never a value: env_refused, or proxy_refused beside a proxy variable (BINANCE-PRE153-1
  // corrections, D-5)
  const anchors = ["NODE_USE_SYSTEM_CA", "NODE_EXTRA_CA_CERTS", "SSL_CERT_FILE", "SSL_CERT_DIR", "OPENSSL_CONF"];
  const cases: [Record<string, string>, string, string[]][] = [...anchors.map((n): [Record<string, string>, string, string[]] =>
    [{ [n]: "1", PATH: "/usr/bin" }, "env_refused", [n]]),
    [{ node_use_system_ca: "" }, "env_refused", ["node_use_system_ca"]], [{ Node_Extra_Ca_Certs: "x" }, "env_refused", ["Node_Extra_Ca_Certs"]],
    [{ SSL_CERT_DIR: "/etc/ssl/certs", OPENSSL_CONF: "C:/secret/openssl.cnf", HTTPS_PROXY: "http://user:secret@127.0.0.1:9" }, "proxy_refused",
      ["HTTPS_PROXY", "OPENSSL_CONF", "SSL_CERT_DIR"]],
    // D-2 of the third round (G2RR2-5): any name that starts with OPENSSL_, in any case; the four named in node.exe passed the second round
    [{ OPENSSL_CONF_INCLUDE: "1", OPENSSL_MODULES: "1", OPENSSL_ENGINES: "1", OPENSSL_ia32cap: "1", OPENSSL_CONFIG: "y", openssl_trace: "1" },
      "env_refused", ["OPENSSL_CONFIG", "OPENSSL_CONF_INCLUDE", "OPENSSL_ENGINES", "OPENSSL_MODULES", "OPENSSL_ia32cap", "openssl_trace"]]];
  for (const [env, stopped, variables] of cases) {
    const lines: string[] = [], calls: Calls = { urls: [], inits: [] }, out = fresh();
    const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)), "--out", out];
    const code = await main(argv, { fetch: offline(calls), env, execArgv: [], print: (l) => { lines.push(l); } }).catch(() => -1);
    assert.deepEqual([code, lines, calls.urls.length, existsSync(out)], [1, [stopLine(stopped, { variables, execArgv_length: 0 })], 0,
      false], JSON.stringify(env));
  }
  // a name that only contains one of them, OPENSSL_ past its start, OPENSSL with no underscore: none sets an anchor, and none is admitted
  // either (D-4 of lot BINANCE-PRE153-1, SERIES-ENV-ALLOWLIST-1): the list of refused names of the third round let them run; refused now
  const near = await record(series(4), at(0), at(4), { io: { env: { NODE_USE_SYSTEM_CA_NOTE: "1", MY_SSL_CERT_FILE: "x", MY_OPENSSL_CONF: "y",
    OPENSSL: "z" } } });
  assert.deepEqual([near.code, near.calls.urls.length, existsSync(near.out)], ["env_refused", 0, false]);
});

// killer: scripts/record-binance-klines.mjs:334 CONST "times.map((t) => rows.get(t))" -> "[...rows.values()]"
test("binance_klines_lists_ascending_from_a_page_out_of_order", async () => {
  // D-2 of the second round (G2C-3, mutant X11 survived): H-2 says the endpoint answers in ascending order and checkRow does not require
  // it; both lists follow the open times (D-1 of the corrections), never the order of a page
  const candle = (i: number, trades: number, cut: boolean): Row => {
    const k = row(at(i));
    k[8] = trades;
    if (cut) k[6] = at(i) + CUT_MS;
    return k;
  };
  const body = JSON.stringify([candle(2, 0, true), candle(0, 0, false), candle(1, 7, true), candle(3, 7, false)]); // ends at(3): one page
  const r = await record([], at(0), at(4), { script: new Map([[0, { status: 200, body }]]) }), m = manifestOf(r.out);
  assert.deepEqual([r.code, m.rows, m.irregular_close, m.zero_trade], ["ok", 4, [{ open_time_ms: at(1), close_time_ms: at(1) + CUT_MS },
    { open_time_ms: at(2), close_time_ms: at(2) + CUT_MS }], [0, 2].map(at)], "ascending, whatever the order of the page");
});

// killer: scripts/record-binance-klines.mjs:276 CONST "pages.get(name) !== got" -> "false"
test("binance_klines_refuses_a_replay_of_an_altered_raw_page", async () => {
  // D-3 of the second round (G2C-4): a stopped recording keeps neither manifest nor SHA256SUMS, only requests.jsonl, which logged the
  // sha256 of each page as received; a sealed one also lists raw/ in SHA256SUMS. A replay reads each page against both, each file when
  // present, and refuses an altered page, or one that a present file does not attest (raw_page_altered), before anything is written
  const rec = await record(series(8), at(0), at(8), { perPage: 4 }), names = rawNames(rec.out), csv = text(rec.out, "BTCUSDT-15m.csv");
  const one = `raw/${names[0] ?? ""}`, two = `raw/${names[1] ?? ""}`, calls: Calls = { urls: [], inits: [] };
  /** A source made of these files of the recording, then edited. */
  const source = (files: readonly string[], edit: (dir: string) => void = () => undefined): string => {
    const dir = fresh();
    mkdirSync(join(dir, "raw"), { recursive: true });
    for (const f of files) writeFileSync(join(dir, f), bytes(join(rec.out, f)));
    edit(dir);
    return dir;
  };
  const rewrite = (dir: string, file: string, change: (body: string) => string): void => {
    writeFileSync(join(dir, file), change(readFileSync(join(dir, file), "utf8")));
  };
  const lines = (keep: (line: string) => boolean) => (body: string): string => body.split(LF).filter(keep).join(LF);
  const alter = (dir: string): void => { rewrite(dir, two, (b) => b.replace("1.50000000", "1.50000001")); }; // still klines on the grid
  const unlogged = (dir: string): void => { rewrite(dir, "requests.jsonl", lines((l) => !l.includes(`startTime=${String(at(0))}&`))); };
  const unsummed = (dir: string): void => { rewrite(dir, "SHA256SUMS", lines((l) => !l.endsWith(one))); };
  const unreadable = (file: string) => (dir: string): void => { writeFileSync(join(dir, file), `{${LF}`); };
  const twice = (dir: string): void => { // page two logged twice, first with another digest: two digests attest nothing
    rewrite(dir, "requests.jsonl", (b) => JSON.stringify({ ...logOf(rec.out)[1], sha256: "0".repeat(64) }) + LF + b);
  };
  const sealedV1 = (dir: string): void => { // a manifest of the recorder 48aa58b3: neither list, never computed (D-4 of the second round)
    const m: SeriesManifestV1 = { ...manifestOf(rec.out), schema: "monark.series.binance.v1" }; // its schema too (lot BINANCE-V2-1)
    delete m.irregular_close;
    delete m.zero_trade;
    writeFileSync(join(dir, "manifest.json"), JSON.stringify(m, null, 2) + LF);
  };
  const argvOf = (from: string, out: string): string[] =>
    ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(8)), "--out", out, "--from-raw", from];
  const replay = async (from: string): Promise<[string, boolean, string]> => {
    const out = fresh();
    return [await outcome(run(argvOf(from, out), { fetch: offline(calls) })), existsSync(out), text(out, "BTCUSDT-15m.csv")];
  };
  const whole = [one, two, "requests.jsonl", "SHA256SUMS", "manifest.json", "BTCUSDT-15m.csv", "missing.json"], log = [one, two, "requests.jsonl"];
  // a sealed folder without its log: its manifest names the interval (raw/ beside SHA256SUMS alone names none, D-1 (b) of lot
  // BINANCE-PRE153-1); an unreadable requests.jsonl names no interval and stops first (D-1 (a)), an unreadable SHA256SUMS attests no page
  const sums = [one, two, "SHA256SUMS", "manifest.json"], refused: [string, boolean, string] = ["raw_page_altered", false, ""];
  assert.deepEqual([rec.code, await replay(source(whole)), await replay(source(log, sealedV1))], ["ok", ["ok", true, csv], ["ok", true, csv]],
    "the whole recording, and its pages with their log beside a manifest without the two lists: every page attested, the same CSV");
  assert.deepEqual([await replay(source(whole, alter)), await replay(source(log, alter)), await replay(source(sums, alter)),
    await replay(source(log, unlogged)), await replay(source(sums, unsummed)), await replay(source(sums, unreadable("SHA256SUMS"))),
    await replay(source(log, twice)), await replay(source(log, unreadable("requests.jsonl"))),
    await replay(source([...log, "manifest.json"], asDir("SHA256SUMS"))), calls.urls.length], // a directory (corrections, D-2: mutant G18)
  [refused, refused, refused, refused, refused, refused, refused, ["interval_mismatch", false, ""], refused, 0],
  "altered, or not attested by a present file: refused, nothing written");
  // the stop names the page and both digests: of the bytes read, and the one requests.jsonl logged for that page
  const printed: string[] = [], from = source(log, alter);
  await main(argvOf(from, fresh()), { fetch: offline(calls), print: (l) => { printed.push(l); } }).catch(() => -1);
  assert.deepEqual(printed, [stopLine("raw_page_altered", { page: join(resolve(from), two), sha256: sha(bytes(join(from, two))),
    attested_by: "requests.jsonl", attested: logOf(rec.out)[1]?.sha256 ?? null })]);
  // D-1 of the third round (G2RR2-1: mutants R1, R2, R3, R5 and R6 survived): each present file attests the page on its own. The page
  // altered and its digest re-hashed in ONE file: refused by the other file; a page logged twice: refused, the true digest first too; a
  // folder sealed from a replay (form A of G2RR2-2: the replay's CSV, manifest.json, missing.json and SHA256SUMS beside raw/ and
  // requests.jsonl): its SHA256SUMS has no raw/ line and attests no page, refused (closed reading, Q-CORR2-1)
  const recorded = sha(bytes(join(rec.out, two))), rep = fresh();
  const rehashed = (file: string) => (dir: string): void => { alter(dir); rewrite(dir, file, (b) => b.replace(recorded, sha(bytes(join(dir, two))))); };
  const trueFirst = (dir: string): void => { // page two logged twice, the true digest first
    rewrite(dir, "requests.jsonl", (b) => b + JSON.stringify({ ...logOf(rec.out)[1], sha256: "0".repeat(64) }) + LF);
  };
  const formA = (dir: string): void => { // the four files of a replay of the whole recording, beside raw/ and requests.jsonl
    for (const f of ["BTCUSDT-15m.csv", "SHA256SUMS", "manifest.json", "missing.json"]) writeFileSync(join(dir, f), bytes(join(rep, f)));
  };
  /** A replay of `from`: its code, the file that refused, the digest that file attests, and whether --out was made. */
  const refusal = async (from: string): Promise<[string, unknown, unknown, boolean]> => {
    const out = fresh();
    try {
      await run(argvOf(from, out), { fetch: offline(calls) });
      return ["ok", null, null, existsSync(out)];
    } catch (e) {
      return e instanceof RecorderStop ? [e.code, e.detail.attested_by, e.detail.attested, existsSync(out)] : ["not a stop", null, null, existsSync(out)];
    }
  };
  assert.equal(await outcome(run(argvOf(source(whole), rep), { fetch: offline(calls) })), "ok", "the replay whose four files make form A");
  assert.deepEqual([await refusal(source(whole, rehashed("requests.jsonl"))), await refusal(source(whole, rehashed("SHA256SUMS"))),
    await refusal(source(log, trueFirst)), await refusal(source(log, formA)), calls.urls.length],
  [["raw_page_altered", "SHA256SUMS", recorded, false], ["raw_page_altered", "requests.jsonl", recorded, false],
    ["raw_page_altered", "requests.jsonl", null, false], ["raw_page_altered", "SHA256SUMS", null, false], 0],
  "each present file attests the page on its own; two digests attest nothing, the true one first too; a replay's SHA256SUMS attests no page");
  // the manifest this recorder writes names monark.series.binance.v2 (lot BINANCE-V2-1, D-1) and carries both lists (D-4 of the second
  // round: required there, optional in SeriesManifestV1)
  const own = manifestOf(rec.out);
  assert.deepEqual([own.schema, own.irregular_close.length, own.zero_trade.length, own.rows], ["monark.series.binance.v2", 0, 0, 8]);
});

// killer: scripts/record-binance-klines.mjs:403 CONST "realpathSync(argv1) === realpathSync(SCRIPT)" -> "resolve(argv1) === resolve(SCRIPT)"
test("binance_klines_runs_its_command_line_through_a_junction", () => {
  // D-5 of the second round (F-4 of the G2 of the history detector, same pattern): through a directory junction node runs the module at
  // its real path while argv[1] keeps the junction, so a guard on resolved paths ran nothing and exited 0 in silence. A copy of the
  // recorder behind a junction, both under ROOT, run with no argument: a usage stop, its one line on stderr, exit 2. Imported by a node
  // whose argv[1] names no file (the guard cannot resolve it): nothing runs
  const dir = fresh(), link = fresh(), copy = join(dir, "record-binance-klines.mjs");
  mkdirSync(dir);
  copyFileSync(RECORDER, copy);
  symlinkSync(dir, link, "junction");
  const env: Record<string, string | undefined> = { ...process.env, HTTPS_PROXY: "http://127.0.0.1:9", NODE_USE_ENV_PROXY: "1" };
  delete env.NODE_TEST_CONTEXT; // the child is no test runner
  const child = (args: string[]): [number | null, string, string] => {
    const r = spawnSync(process.execPath, args, { env, encoding: "utf8", timeout: 60_000 });
    return [r.status, r.stdout, r.stderr];
  };
  assert.deepEqual([child([join(link, "record-binance-klines.mjs")]), child(["--input-type=module", "-e",
    `await import(${JSON.stringify(pathToFileURL(copy).href)});`, "no-such-file"])], [[2, "", stopLine("usage", { absent: ["symbol", "interval",
    "start", "end", "out"] }) + LF], [0, "", ""]], "through the junction, the usage stop; imported, nothing");
});

// killer: scripts/record-binance-klines.mjs:345 CONST "monark.series.binance.v2" -> "monark.series.binance.v1"
test("binance_klines_writes_v2_and_replays_a_sealed_v1_unrefused", async () => {
  // Q-U5 of RECHERCHES (2026-10-03), lot BINANCE-V2-1, D-1: one identifier, one meaning. Every manifest this recorder writes, recording
  // or replay, names monark.series.binance.v2 with both lists; a folder sealed under v1 (recorder 48aa58b3: schema v1, neither list,
  // never computed) is read without refusal and replays to the same CSV and missing.json bytes under v2, its lists computed from raw/,
  // the sealed folder left as it is
  const V1 = "monark.series.binance.v1", V2 = "monark.series.binance.v2", calls: Calls = { urls: [], inits: [] };
  const rec = await record(halt(), at(0), at(16), { perPage: 4 }), sealed = fresh();
  mkdirSync(join(sealed, "raw"), { recursive: true });
  for (const f of [...rawNames(rec.out).map((n) => `raw/${n}`), "requests.jsonl", "SHA256SUMS", "BTCUSDT-15m.csv", "missing.json"]) {
    writeFileSync(join(sealed, f), bytes(join(rec.out, f)));
  }
  const v1: SeriesManifestV1 = { ...manifestOf(rec.out), schema: V1 };
  delete v1.irregular_close;
  delete v1.zero_trade;
  writeFileSync(join(sealed, "manifest.json"), JSON.stringify(v1, null, 2) + LF);
  const before = bytes(join(sealed, "manifest.json")), sums = text(sealed, "SHA256SUMS");
  writeFileSync(join(sealed, "SHA256SUMS"), sums.replace(sha(bytes(join(rec.out, "manifest.json"))), sha(before)));
  const lines = text(sealed, "SHA256SUMS").split(LF).filter((l) => l !== "");
  assert.deepEqual(lines.map((l) => sha(bytes(join(sealed, l.slice(66))))), lines.map((l) => l.slice(0, 64)), "sealed: every SHA256SUMS line holds");
  const replay = async (from: string): Promise<[string, string]> => {
    const out = fresh(), argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(16)), "--out", out, "--from-raw", from];
    return [await outcome(run(argv, { fetch: offline(calls) })), out];
  };
  const [[fromV1, outV1], [fromV2, outV2]] = [await replay(sealed), await replay(rec.out)];
  /** What a reader of manifest.json finds: its schema, its mode, and whether each list is present. */
  const shape = (dir: string): unknown[] => {
    const m = jsonOf(dir, "manifest.json") as SeriesManifestRead | null;
    return [m?.schema, m?.mode, m !== null && "irregular_close" in m, m !== null && "zero_trade" in m];
  };
  assert.deepEqual([rec.code, fromV1, fromV2, calls.urls.length], ["ok", "ok", "ok", 0]);
  assert.deepEqual([shape(rec.out), shape(sealed), shape(outV1), shape(outV2)], [[V2, "record", true, true], [V1, "record", false, false],
    [V2, "replay", true, true], [V2, "replay", true, true]], "written: v2 with both lists, recording and replay alike; read: a v1 unrefused");
  const files = (dir: string): Buffer[] => ["BTCUSDT-15m.csv", "missing.json"].map((n) => bytes(join(dir, n)));
  const lists = (dir: string): unknown[] => [manifestOf(dir).irregular_close, manifestOf(dir).zero_trade];
  assert.deepEqual([files(outV1), files(outV2), lists(outV1), lists(outV2), bytes(join(sealed, "manifest.json"))],
    [files(rec.out), files(rec.out), lists(rec.out), lists(rec.out), before], "same bytes and lists from a v1 or a v2 source; the v1 untouched");
});

// killer: scripts/record-binance-klines.mjs:208 CONST "e.status === 200 && " -> ""
test("binance_klines_refuses_a_page_planted_at_the_cursor_of_a_non_200_answer", async () => {
  // BINANCE-REPLAY-NON200-ATTEST-1 (G2-CTV2-2; mutant R4 of the fusion campaign survived): requests.jsonl logs every answer with the
  // sha256 of its body, and only a 200 attests a page. A recording stopped by a 500 whose body is [] (empty klines, were it read): as
  // written, its stopped cursor has no page; a raw/ page planted there with those very bytes is refused, nothing written, never a request
  const rec = await record(series(8), at(0), at(8), { perPage: 4, script: new Map([[1, { status: 500, body: "[]" }]]) });
  const calls: Calls = { urls: [], inits: [] }, out = fresh();
  const argvOf = (to: string, end = at(8)): string[] => ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(end), "--out",
    to, "--from-raw", rec.out];
  const asWritten = await outcome(run(argvOf(fresh()), { fetch: offline(calls) }));
  const pageOne = await outcome(run(argvOf(fresh(), at(4)), { fetch: offline(calls) })); // a replay that ends at the stopped cursor
  writeFileSync(join(rec.out, "raw", `BTCUSDT-${String(at(4))}.json`), "[]"); // the bytes that requests.jsonl logged for the 500
  const planted = await run(argvOf(out), { fetch: offline(calls) }).then(() => ["ok"], (e: unknown) =>
    (e instanceof RecorderStop ? [e.code, e.detail.attested_by, e.detail.attested] : ["not a stop"]));
  assert.deepEqual([rec.code, logOf(rec.out).map((l) => [l.status, l.sha256 === sha("[]")]), asWritten, planted, existsSync(out), calls.urls.length],
    ["server_error", [[200, false], [500, true]], "raw_page_missing", ["raw_page_altered", "requests.jsonl", null], false, 0]);
  // D-2 of lot BINANCE-PRE153-1: the 500's body was kept under raw/errors/, its file in its line; raw/errors/ holds no page, so a replay
  // that ends before the stopped cursor reads page one and writes
  assert.deepEqual([bytes(join(rec.out, "raw", "errors", `BTCUSDT-${String(at(4))}.json`)), logOf(rec.out)[1]?.file, pageOne],
    [Buffer.from("[]"), `raw/errors/BTCUSDT-${String(at(4))}.json`, "ok"]);
});

/** DER built here for the TLS test (X.509): tag, length (short or long form, below 65 536 bytes), value. */
const tlv = (tag: number, ...parts: Buffer[]): Buffer => {
  const body = Buffer.concat(parts), n = body.length;
  return Buffer.concat([Buffer.from([tag, ...(n < 128 ? [n] : n < 256 ? [0x81, n] : [0x82, n >> 8, n & 255])]), body]);
};
const hex = (h: string): Buffer => Buffer.from(h, "hex");
const ECDSA_SHA256 = tlv(0x30, hex("06082a8648ce3d040302")); // AlgorithmIdentifier ecdsa-with-SHA256 (1.2.840.10045.4.3.2)
const nameOf = (cn: string): Buffer => tlv(0x30, tlv(0x31, tlv(0x30, hex("0603550403"), tlv(0x0c, Buffer.from(cn))))); // commonName
const utcOf = (ms: number): Buffer => tlv(0x17, Buffer.from(`${new Date(ms).toISOString().replace(/[-:T]/g, "").slice(2, 14)}Z`)); // UTCTime
interface Issued { key: KeyObject; der: Buffer }
/** An ECDSA P-256 key and its X.509 v3 certificate, valid from a day before now to a day after: with no `ca`, a CA (basicConstraints,
 *  critical) that signs itself; else a leaf for 127.0.0.1 (subjectAltName IP) that `ca` signs. A real handshake accepts them (journal M-1). */
function issue(serial: number, ca?: Issued): Issued {
  const { publicKey, privateKey } = generateKeyPairSync("ec", { namedCurve: "prime256v1" });
  const ext = ca === undefined ? tlv(0x30, hex("0603551d13"), hex("0101ff"), tlv(0x04, tlv(0x30, hex("0101ff"))))
    : tlv(0x30, hex("0603551d11"), tlv(0x04, tlv(0x30, tlv(0x87, Buffer.from([127, 0, 0, 1])))));
  const tbs = tlv(0x30, hex("a003020102"), tlv(0x02, Buffer.from([serial])), ECDSA_SHA256, nameOf("loopback test ca"),
    tlv(0x30, utcOf(Date.now() - 86_400_000), utcOf(Date.now() + 86_400_000)), nameOf(ca === undefined ? "loopback test ca" : `leaf ${String(serial)}`),
    publicKey.export({ type: "spki", format: "der" }), tlv(0xa3, tlv(0x30, ext)));
  const signature = sign("sha256", tbs, { key: ca?.key ?? privateKey, dsaEncoding: "der" });
  return { key: privateKey, der: tlv(0x30, tbs, ECDSA_SHA256, tlv(0x03, Buffer.from([0]), signature)) };
}

// killer: scripts/record-binance-klines.mjs:98 CONST "maxCachedSessions: 0" -> "maxCachedSessions: 100"
test("binance_klines_never_resumes_a_tls_session", async () => {
  // SERIES-TLS-RESUME-1 (lot BINANCE-PRE35-1; L-1 of BINANCE-PRE153-1, m-2 of its review): the loopback endpoint offers resumption (node's
  // defaults: session tickets, and session ids under TLS 1.2), under TLS 1.2 then 1.3. Four pages, each on its own connection: the server
  // sees no session resumed, and each line names the leaf that authenticated it and its CA (resumed: false). A recorder that kept sessions
  // would resume from page 2, and a resumed connection attests nothing (tls_unattested)
  const got: unknown[] = [];
  for (const maxVersion of ["TLSv1.2", "TLSv1.3"] as const) {
    const r = await record(series(16), at(0), at(16), { perPage: 4, maxVersion });
    got.push([maxVersion, r.code, r.reused, logOf(r.out).map((l) => l.tls)]);
  }
  const peer: Peer = { leaf_sha256: sha(endpointLeaf?.der ?? ""), issuer_sha256: sha(caOf().der), resumed: false };
  assert.deepEqual(got, ["TLSv1.2", "TLSv1.3"].map((v) => [v, "ok", [false, false, false, false], [peer, peer, peer, peer]]));
});

// killer: scripts/record-binance-klines.mjs:108 CONST "signs ? sha256(issuer)" -> "issuer ? sha256(issuer)"
test("binance_klines_logs_the_true_issuer_of_two_cas_of_one_name", async () => {
  // SERIES-TLS-ISSUER-BY-NAME-1 (O-1 of the BINANCE-PRE153-1 corrections; F-1 of the G2 of #115): two CAs of one name ("loopback test
  // ca", no key identifier), each signs a leaf. Each endpoint sets the trust BEFORE its server is created; in that order, trusted in
  // turn, one at a time, each line names its own CA (cases 1-3). S1 of the G2 (case 4): the server is created under the previous trust,
  // then the trust changes; node then names the other CA of that name, which the leaf does not verify under: the line logs no issuer
  // (null; the true CA, were node to name it). Trusted together, trust before server, in either order (cases 5-6): the handshake holds
  // with the true CA, or fails (CERT_SIGNATURE_FAILURE), a network_error before any line. The next endpoint trusts the file's CA again
  const [one, two] = [caOf(), issue(9)], [a, b] = [issue(10, one), issue(11, two)], got: [string, (string | null)[]][] = [];
  const plans: [readonly Issued[], Issued, boolean][] = [[[one], a, false], [[two], b, false], [[one], a, false], [[two], b, true],
    [[one, two], b, false], [[two, one], b, false]];
  for (const [trust, leaf, trustLate] of plans) {
    const r = await record(series(4), at(0), at(4), { leaf, trust, trustLate });
    got.push([r.code, logOf(r.out).map((l) => l.tls?.issuer_sha256 ?? null)]);
  }
  const [x, y] = [sha(one.der), sha(two.der)], together = got.slice(4).map(([code, issuers]) =>
    (code === "ok" ? issuers.length === 1 && issuers[0] === y : code === "network_error" && issuers.length === 0));
  const late = [got[3]?.[0], got[3]?.[1].length, got[3]?.[1].every((i) => i === null || i === y)];
  assert.deepEqual([got.slice(0, 3), late, together], [[["ok", [x]], ["ok", [y]], ["ok", [x]]], ["ok", 1, true], [true, true]]);
});

// killer: scripts/record-binance-klines.mjs:157 SDL "if (unformed.length > 0)" -> ""
test("binance_klines_refuses_an_admitted_name_with_an_unformed_value", async () => {
  // SERIES-ENV-VALUES-1 (lot BINANCE-PRE35-1; L-2 of BINANCE-PRE153-1): the values of the twelve admitted names have a closed form:
  // SYSTEMROOT equals WINDIR (names in any case), HOMEPATH, SYSTEMROOT, TEMP, USERPROFILE and WINDIR are absolute paths, PATH is made of
  // absolute paths (an empty entry, the current directory, included). Else env_refused before any request, naming the variables, never a
  // value; values of the form record
  const [w, v, path] = [resolve(ROOT, "w"), resolve(ROOT, "v"), [resolve(ROOT, "a"), resolve(ROOT, "b")].join(delimiter)];
  const cases: [Record<string, string>, string[]][] = [[{ SystemRoot: w, windir: v, PATH: path }, ["SystemRoot", "windir"]],
    [{ SYSTEMROOT: w, PATH: path }, ["SYSTEMROOT"]], [{ PATH: `${path}${delimiter}bin`, TEMP: "tmp", USERPROFILE: w, HOMEPATH: `.${sep}h` },
      ["HOMEPATH", "PATH", "TEMP"]], [{ Path: `${path}${delimiter}` }, ["Path"]],
    [{ USERPROFILE: "u" }, ["USERPROFILE"]], [{ SystemRoot: "W", windir: "W" }, ["SystemRoot", "windir"]]]; // C-2 of the G2: equal, relative
  const lines: string[] = [], calls: Calls = { urls: [], inits: [] };
  for (const [env] of cases) {
    const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)), "--out", fresh()];
    await main(argv, { fetch: offline(calls), env, execArgv: [], print: (l) => { lines.push(l); } }).catch(() => -1);
  }
  const formed = await record(series(4), at(0), at(4), { io: { env: { SystemRoot: w, windir: w, PATH: path, TEMP: v, USERPROFILE: v,
    HOMEPATH: v } } });
  assert.deepEqual([lines, calls.urls.length, formed.code], [cases.map(([, variables]) => stopLine("env_refused", { variables,
    why: "values outside their closed form" })), 0, "ok"]);
});

// killer: scripts/record-binance-klines.mjs:262 ROR "size > MAX_BODY_BYTES" -> "size >= MAX_BODY_BYTES"
test("binance_klines_reads_a_body_in_a_stream_up_to_its_bound", async () => {
  // D-5 of lot BINANCE-PRE153-1 (SERIES-BODY-BOUND-1): 1 000 candles of the widest row recorded take 186 394 bytes (journal M-5); the
  // bound, 262 144 bytes, is read in a stream. A 200 body of exactly the bound (klines padded with blanks) is read; one byte more stops
  // body_too_large after its line (the count read, no sha256, no file) and keeps nothing; of a body four times the bound, less than twice
  // the bound is read; an error body past the bound stops the same way, its status logged
  const BOUND = 262_144, padded = (size: number): string => { const json = JSON.stringify(series(4)); return json + " ".repeat(size - json.length); };
  assert.equal(recorder.MAX_BODY_BYTES, BOUND, "the bound, written here, never imported");
  const cases: [Reply, string][] = [[{ status: 200, body: padded(BOUND) }, "ok"], [{ status: 200, body: padded(BOUND + 1) }, "body_too_large"],
    [{ status: 200, body: padded(4 * BOUND) }, "body_too_large"], [{ status: 503, body: padded(BOUND + 1) }, "body_too_large"]];
  for (const [reply, code] of cases) {
    const r = await record(series(4), at(0), at(4), { script: new Map([[0, reply]]) }), line = logOf(r.out)[0], read = line?.bytes ?? 0, cut = code !== "ok";
    assert.deepEqual([r.code, line?.status, cut ? read > BOUND && read < 2 * BOUND : read === BOUND, line?.sha256 === null, line?.file === null,
      rawNames(r.out), normalized(r.out).length > 0], [code, reply.status, true, cut, cut, cut ? [] : [`BTCUSDT-${String(at(0))}.json`], !cut],
    `${code}: a body of ${String(reply.body?.length)} bytes`);
  }
});

// killer: scripts/record-binance-klines.mjs:65 CONST "\"source_unattested\", " -> ""
test("binance_klines_names_each_stop_of_the_lot_in_its_closed_list", () => {
  // BINANCE-PRE153-1 corrections, D-2 (G2-BNPRE-2: mutants G01 and G02 survived, no test pinned a code the lot added): the closed list
  // names each stop the lot adds (source_unattested, body_too_large; env_refused and tls_unattested in its corrections) and the one whose
  // meaning it narrows (proxy_refused)
  assert.deepEqual(["source_unattested", "body_too_large", "env_refused", "tls_unattested", "proxy_refused"].map((c) => STOPS.includes(c)),
    [true, true, true, true, true]);
});

// killer: scripts/record-binance-klines.mjs:187 CONST "catch { return null; }" -> "catch { return Buffer.alloc(0); }"
test("binance_klines_anchors_an_absent_sums_as_null", async () => {
  // BINANCE-PRE153-1 corrections, D-2 (G2-BNPRE-2: mutant G17 survived; probe P3, E4): a source made of raw/ and requests.jsonl (the form
  // of the 118) replays; its manifest anchors the requests.jsonl read and names no SHA256SUMS: null, never the digest of nothing (D-1 (d)
  // of lot BINANCE-PRE153-1)
  const rec = await record(series(8), at(0), at(8), { perPage: 4 }), src = fresh(), out = fresh(), calls: Calls = { urls: [], inits: [] };
  mkdirSync(join(src, "raw"), { recursive: true });
  for (const f of [...rawNames(rec.out).map((n) => `raw/${n}`), "requests.jsonl"]) writeFileSync(join(src, f), bytes(join(rec.out, f)));
  const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(8)), "--out", out, "--from-raw", src];
  const code = await outcome(run(argv, { fetch: offline(calls) })), m = manifestOf(out);
  assert.deepEqual([rec.code, code, m.from_raw_requests_sha256, m.from_raw_sha256sums_sha256, calls.urls.length],
    ["ok", "ok", sha(bytes(join(src, "requests.jsonl"))), null, 0]);
});

// killer: scripts/record-binance-klines.mjs:74 CONST "|WINDIR)$/i" -> "|WINDIR|COMSPEC)$/i"
test("binance_klines_refuses_every_other_name_of_the_environment", async () => {
  // BINANCE-PRE153-1 corrections, D-2 (G2-BNPRE-2: mutant G30 survived, the admitted list was pinned by sample only): each name of this
  // process's environment outside the twelve, and names of a Windows shell that the harness may lack, stops a recording before any
  // request: env_refused, or proxy_refused for a proxy variable (D-5 of the corrections); the twelve and that family are written here
  const twelve = /^(HOMEDRIVE|HOMEPATH|LOGONSERVER|MSYSTEM|PATH|SYSTEMDRIVE|SYSTEMROOT|TEMP|USERDOMAIN|USERNAME|USERPROFILE|WINDIR)$/i;
  const proxy = /^(NODE_OPTIONS|NODE_USE_ENV_PROXY)$|_PROXY$/i, calls: Calls = { urls: [], inits: [] }, passed: string[] = [];
  const names = [...new Set([...Object.keys(process.env), "COMSPEC", "PATHEXT", "APPDATA", "LOCALAPPDATA", "PROGRAMDATA", "OS", "TMP", "HOME"])]
    .filter((n) => !twelve.test(n));
  for (const n of names) {
    const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)), "--out", fresh()];
    const code = await outcome(run(argv, { fetch: offline(calls), env: { [n]: "x" }, execArgv: [] }));
    if (code !== (proxy.test(n) ? "proxy_refused" : "env_refused")) passed.push(`${n}: ${code}`);
  }
  assert.deepEqual([names.length > 8, passed, calls.urls.length], [true, [], 0]);
});

// killer: scripts/record-binance-klines.mjs:183 CONST " || !existsSync(at(\"SHA256SUMS\"))" -> ""
test("binance_klines_refuses_a_source_whose_pages_nothing_attests", async () => {
  // BINANCE-PRE153-1 corrections, D-1 (G2-BNPRE-1, probe P1): a manifest names the interval, but neither requests.jsonl nor SHA256SUMS
  // attests a page: a page altered there was replayed, exit 0, the altered value written. Refused before any file is read, nothing written
  const rec = await record(series(8), at(0), at(8), { perPage: 4 }), names = rawNames(rec.out), src = fresh(), out = fresh();
  const two = `raw/${names[1] ?? ""}`, calls: Calls = { urls: [], inits: [] };
  mkdirSync(join(src, "raw"), { recursive: true });
  for (const f of [...names.map((n) => `raw/${n}`), "manifest.json"]) writeFileSync(join(src, f), bytes(join(rec.out, f)));
  writeFileSync(join(src, two), text(src, two).replace("1.50000000", "9.50000000")); // still klines on the grid
  const argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(8)), "--out", out, "--from-raw", src];
  assert.deepEqual([rec.code, names.length, await outcome(run(argv, { fetch: offline(calls) })), existsSync(out), calls.urls.length],
    ["ok", 2, "source_unattested", false, 0]);
});

// killer: scripts/record-binance-klines.mjs:239 SDL "log(line);" -> ""
test("binance_klines_logs_an_answer_as_it_arrives_before_its_body", async () => {
  // BINANCE-PRE153-1 corrections, D-4 (G2-BNPRE-5; probe P3, E6 cut): as the Coinbase recorder, an answer is logged as it arrives, its
  // status, headers and certificates, before its body is read, then that line again with the size, sha256 and file of the body. A body
  // cut after its head leaves its arrival line: a 200 (page two), a 429 with its Retry-After; nothing kept of it, nothing normalized
  const part = `[[${String(at(4))},"1.00000000"`, first = `BTCUSDT-${String(at(0))}.json`;
  const two = await record(series(8), at(0), at(8), { perPage: 4, script: new Map([[1, { status: 200, part }]]) });
  const limited = await record(series(4), at(0), at(4), { script: new Map([[0, { status: 429, headers: { "retry-after": "30" }, part }]]) });
  const [arrival, done, cut] = linesOf(two.out), page = bytes(join(two.out, "raw", first));
  assert.deepEqual([two.code, linesOf(two.out).length, done, [cut?.status, cut?.tls === null, cut !== undefined && "sha256" in cut],
    rawNames(two.out), normalized(two.out)], ["network_error", 3, { ...arrival, bytes: page.length, sha256: sha(page), file: `raw/${first}` },
    [200, false, false], [first], []], "page one: its arrival line, then that line completed; page two: its arrival line alone");
  assert.deepEqual([limited.code, linesOf(limited.out).map((l) => [l.status, l.headers?.["retry-after"], "sha256" in l]), rawNames(limited.out)],
    ["network_error", [[429, "30", false]], []], "a 429 cut after its head: its status and Retry-After kept on its arrival line");
});

// killer: scripts/record-binance-klines.mjs:240 SDL "if (status === 200 && peer === null)" -> ""
test("binance_klines_stops_on_a_200_whose_connection_showed_no_certificate", async () => {
  // BINANCE-PRE153-1 corrections, D-6 (Q-BNPRE-6): over plain HTTP no certificate is seen. A 200 stops (tls_unattested) once its arrival
  // line is logged, tls null, its body never read nor kept (its connection closed); any other status keeps its own stop.
  // The replay is not concerned: an arrival line attests no page, so a page planted at that cursor is refused
  const plain = await record(series(4), at(0), at(4), { plain: true }), lines = linesOf(plain.out), kept = rawNames(plain.out);
  const limited = await record(series(4), at(0), at(4), { plain: true, script: new Map([[0, { status: 429, headers: { "retry-after": "30" } }]]) });
  // a 200 whose body never ends (lot BINANCE-PRE35-1): a recorder that read it would wait for its 30 s timeout; it closes the connection
  const held = await record(series(4), at(0), at(4), { plain: true, script: new Map([[0, { status: 200, part: "[", hold: true }]]) });
  writeFileSync(join(plain.out, "raw", `BTCUSDT-${String(at(0))}.json`), JSON.stringify(series(4))); // planted where nothing was kept
  const calls: Calls = { urls: [], inits: [] }, argv = ["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)),
    "--out", fresh(), "--from-raw", plain.out];
  assert.deepEqual([plain.code, lines.map((l) => [l.status, l.tls, "sha256" in l]), kept, normalized(plain.out), limited.code,
    logOf(limited.out).map((l) => [l.status, l.tls, l.headers["retry-after"]]), held.code, rawNames(held.out),
    await outcome(run(argv, { fetch: offline(calls) })), calls.urls.length],
  ["tls_unattested", [[200, null, false]], [], [], "rate_limited", [[429, null, "30"]], "tls_unattested", [], "raw_page_altered", 0]);
});

// killer: scripts/record-binance-klines.mjs:373 CONST "request(url, options)" -> "request(url)"
test("binance_klines_requests_through_its_own_agent_by_default", async () => {
  // C-1 and n-3 of the G2 of lot BINANCE-PRE35-1: the default transport, no fetch injected. https.request is replaced by a spy that throws
  // (offline), synced into the ESM bindings (refused unless the binding shows it), and AbortSignal.timeout is spied: the recorder hands
  // https.request its URL, its own agent (maxCachedSessions 0, keepAlive false) and the very 30 s signal, then stops network_error.
  // Both restored after
  const https = createRequire(import.meta.url)("node:https") as typeof import("node:https"), timeout = AbortSignal.timeout.bind(AbortSignal);
  const timeoutAsIs = Object.getOwnPropertyDescriptor(AbortSignal, "timeout") ?? {}; // restored as it was, not a bound copy
  const original = https.request, seen: unknown[] = [], signals: [number, AbortSignal][] = [];
  let code = "not run", bound = false;
  try {
    https.request = ((url: string, options: RequestOptions) => {
      const agent = options.agent as Agent;
      seen.push([url, agent.options.maxCachedSessions, agent.options.keepAlive, options.signal === signals[0]?.[1]]);
      throw new Error("offline spy");
    }) as typeof https.request;
    AbortSignal.timeout = (ms: number): AbortSignal => { const s = timeout(ms); signals.push([ms, s]); return s; };
    syncBuiltinESMExports();
    bound = (await import("node:https")).request === https.request;
    if (bound) code = await outcome(run(["--symbol", "BTCUSDT", "--interval", "15m", "--start", iso(at(0)), "--end", iso(at(4)), "--out", fresh()],
      { env: {}, execArgv: [] }));
  } finally {
    https.request = original;
    Object.defineProperty(AbortSignal, "timeout", timeoutAsIs);
    syncBuiltinESMExports();
  }
  const url = `${ORIGIN}/api/v3/klines?symbol=BTCUSDT&interval=15m&startTime=${String(at(0))}&endTime=${String(at(4) - 1)}&limit=1000`;
  assert.deepEqual([bound, code, seen, signals.map(([ms]) => ms)], [true, "network_error", [[url, 0, false, true]], [30_000]]);
});

/** Lot BINANCE-V2-1, D-1 (G2-CTV2-1: the type surface was right but nothing pinned it): the typecheck gate (tsc --noEmit) reads these
 *  types and Node erases them, so nothing here runs. Accepts<T, U> compiles iff U is assignable to T; the line under each @ts-expect-error
 *  must fail to compile, else tsc reports the directive unused. Each line reddens under a mutant of that surface (T1 to T4 of the G2). */
type Accepts<T, U extends T> = U;
export type ManifestTypeChecks = [
  // @ts-expect-error a written manifest never names v1 (T1, T2)
  Accepts<SeriesManifest["schema"], "monark.series.binance.v1">,
  // @ts-expect-error nor v3: one literal, not any string (T1)
  Accepts<SeriesManifest["schema"], "monark.series.binance.v3">,
  // @ts-expect-error a v1, even with both lists, is not what run resolves to (T1, T2)
  Accepts<Awaited<ReturnType<typeof run>>, Required<SeriesManifestV1>>,
  // @ts-expect-error unnarrowed, a read manifest may lack a list (T4)
  Accepts<Pick<SeriesManifest, "zero_trade">, SeriesManifestRead>,
  // @ts-expect-error a v1 never names v2 (T3)
  Accepts<SeriesManifestV1["schema"], "monark.series.binance.v2">,
  Accepts<SeriesManifestRead, SeriesManifestV1>, // a sealed v1 is a read manifest (T4)
];
