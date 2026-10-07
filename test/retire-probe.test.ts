// test/retire-probe.test.ts -- item RETIRE-PROBE-1 (lot RH-1; docs/G0-lot-retire-latency-rehearsal-1.md section 8): the probe of T_g.
// Offline: the transport is the served gate in process (runGate with the probed table), or the default transport wired() on a real
// local listener (node:http on 127.0.0.1, an ephemeral port) that routes by isJsonMirrorHost of the server, as the server does, to the
// JSON mirror of the served files or to the served gate of the test's table; a few api.<mode>.test hosts alter the answer (a status, a
// cell, a reason, a body cut or dripping). The clock and the sleep are the test's. The probe is loaded on demand, so the base (no probe)
// reddens by assertion. The line above each test names the mutation that reddens it (scripts/red-proof.mjs convention).
import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { canonicalJson, type CanonicalValue, type PolicyTable, type Prediction } from "@monark/contracts";
import { runGate, SERVED_POLICY_TABLES, toolErrorCode, type HarnessParams } from "../apps/harness/src/tools/gate.ts";
import { handleJsonMirror } from "../apps/harness/src/http.ts";
import { isJsonMirrorHost } from "../apps/harness/src/server.ts";
import { listen as bindLoopback } from "./helpers/loopback.ts";
import { policyTableSha256 } from "../apps/harness/src/policy-table-file.ts";

type Probe = typeof import("../scripts/retire-probe.mjs");
const ROOT = join(import.meta.dirname, "..");
const H = 3_600_000, G = Date.parse("2027-01-04T09:00:00Z"), KEY = "kata:vote4@venue/BTCUSDT/1h";
async function load(): Promise<Probe> {
  try {
    return await import("../scripts/retire-probe.mjs");
  } catch (e) {
    return assert.fail(`scripts/retire-probe.mjs loads: ${e instanceof Error ? e.message : String(e)}`);
  }
}
/** The table file of a served class holding these rows, as the writer writes it (canonical, so its sha256 is the served digest). */
function file(taskClass: string, rows: object[]): Buffer {
  const t = SERVED_POLICY_TABLES.find((x) => x.task_class === taskClass)?.table ?? assert.fail(taskClass);
  return Buffer.from(canonicalJson({ ...t, rows } as unknown as CanonicalValue), "utf8");
}
const row = (cell: string, status: string, over: object = {}): object => ({ cell_key: `${KEY}/${cell}`, current: true, status, thresholds: null, calib_support: null, statement: "per-calibration", alpha: "0.01", n: 300, scores_sha256: "ab".repeat(32), qhat: 1.5, ...over });
/** The served gate in process, serving `served` for its class, at the clock given: the 400s of the kata path included. */
const gate = (served: Buffer, clock: () => number, seen: string[] = []) => (url: string, body: string, host: string): Promise<{ status: number; text: string }> => {
  seen.push(`${url} ${host}`);
  const table = JSON.parse(served.toString("utf8")) as PolicyTable, { prediction, params } = JSON.parse(body) as { prediction: Prediction; params: HarnessParams };
  try {
    const d = runGate(prediction, params, undefined, { nowMs: clock(), policyTables: [{ task_class: table.class.task_class, table, policy_table_sha256: policyTableSha256(table) }] });
    return Promise.resolve({ status: 200, text: JSON.stringify({ structuredContent: d }) });
  } catch (e) {
    return Promise.resolve({ status: 400, text: JSON.stringify({ code: toolErrorCode(e) }) });
  }
};

/** The local listener: the table it serves and its clock are set by each test (node:test runs the tests of a file in order). */
const listen: { served: Buffer; at: number; url: string } = { served: Buffer.alloc(0), at: G + 1000, url: "" };
const TMP = mkdtempSync(join(tmpdir(), "retire-probe-"));
async function answer(req: IncomingMessage, body: Buffer, res: ServerResponse): Promise<void> {
  const host = req.headers.host ?? "", request = new Request(`http://${host}${req.url ?? "/"}`, { method: req.method ?? "GET", ...(req.method === "POST" ? { body } : {}) });
  const send = (status: number, text: string): void => { res.writeHead(status, { "content-type": "application/json" }).end(text); };
  if (!isJsonMirrorHost(request)) { send(421, JSON.stringify({ error: "not the api host" })); return; }
  const mode = host.split(".")[1] ?? "";
  if (mode === "mirror") { const r = await handleJsonMirror(request, () => listen.at); send(r.status, await r.text()); return; }
  if (mode === "truncate") { res.writeHead(200, { "content-type": "application/json", "content-length": "1000" }); res.write('{"structuredContent":', () => { res.socket?.destroy(); }); return; }
  if (mode === "drip") { res.writeHead(200, { "content-type": "application/json", "content-length": "1000" }); const i = setInterval(() => { res.write(" "); }, 20); res.on("close", () => { clearInterval(i); }); return; }
  const r = await gate(listen.served, () => listen.at)("", body.toString("utf8"), host), out = JSON.parse(r.text) as { structuredContent?: { verdict: Record<string, unknown> } };
  const v = out.structuredContent?.verdict;
  if (v !== undefined && mode === "othercell") v["cell_key"] = `${KEY}/b9`;
  if (v !== undefined && mode === "undercalib") v["reason"] = "under_calib";
  send(mode === "status500" ? 500 : r.status, JSON.stringify(out));
}
const server = createServer((req, res) => { const chunks: Buffer[] = []; req.on("data", (c: Buffer) => { chunks.push(c); }).on("end", () => { void answer(req, Buffer.concat(chunks), res); }); });
before(async () => { listen.url = `http://127.0.0.1:${String(await bindLoopback(server))}`; }); // a drawn port on 127.0.0.1, test/helpers/loopback.ts
after(() => { server.closeAllConnections(); server.close(); rmSync(TMP, { recursive: true, force: true, maxRetries: 3 }); });
const tablePath = (name: string, bytes: Buffer): string => { const f = join(TMP, name); writeFileSync(f, bytes); return f; };

// reddened by: a call sent outside the window of ±300 s around its grid instant (kata-path.ts l.47 stale, tools/gate.ts l.885 future),
// a wait not bounded by --max-wait, or a call sent to another path or Host
// killer: scripts/retire-probe.mjs:40 CONST "nowMs - g <= MARGIN_MS" -> "nowMs - g <= 2 * MARGIN_MS"
test("retire_probe_waits_for_the_grid_window_and_calls_inside_it", async () => {
  const p = await load(), served = file("btc-range-1h", [row("b0", "region")]);
  assert.deepEqual([p.plan(G + 240_000, H), p.plan(G + 240_001, H), p.plan(G - 240_000, H)],
    [{ producedAtMs: G, waitMs: 0 }, { producedAtMs: G + H, waitMs: H - 480_001 }, { producedAtMs: G, waitMs: 0 }], "the window is the grid instant ± MARGIN_MS");
  let now = G + 301_000;
  const slept: number[] = [], seen: string[] = [];
  const r = await p.probe({ tableBytes: served, cell: `${KEY}/b0`, api: "http://127.0.0.1:3001/", apiHost: "api.monarkgate.tech", clock: () => now, sleep: (ms) => { slept.push(ms); now += ms; return Promise.resolve(); }, transport: gate(served, () => now, seen) });
  assert.deepEqual([slept, r.record.produced_at, r.record.status, r.problem, seen], [[H - 541_000], "2027-01-04T10:00:00Z", 200, null, ["http://127.0.0.1:3001/gate api.monarkgate.tech"]], "301 s after a grid instant, the probe waits for the next window");
  const stale = (await gate(served, () => G + 300_001)("", JSON.stringify(p.call(served, `${KEY}/b0`, G).body), "")).text;
  assert.equal((JSON.parse(stale) as { code: string }).code, "produced_at_stale", "the call it did not send would be refused");
  await assert.rejects(p.probe({ tableBytes: served, cell: `${KEY}/b0`, api: "http://x", clock: () => G + 301_000, maxWaitMs: 60_000, transport: gate(served, Date.now) }), (e: unknown) => (e as { code?: string }).code === "wait_exceeds_max");
});

// reddened by: a scale yhat outside the row's calib_support (out_of_support, kata-path.ts l.93, would hide calib_retired, l.94), or a
// dir lean outside the bucket of its cell
// killer: scripts/retire-probe.mjs:57 CONST "(row.calib_support.min + row.calib_support.max) / 2" -> "1"
test("retire_probe_yhat_lies_in_the_support_so_the_retired_cell_answers_calib_retired", async () => {
  const p = await load(), clock = (): number => G + 1000;
  const scale = file("btc-range-1h", [row("b0", "retired", { calib_support: { min: 2, max: 3 } })]);
  const dir = file("btc-dir-1h", [row("up-b1", "region", { thresholds: { t1: "0.2", t2: "0.6" } }), row("up-b2", "retired", { thresholds: { t1: "0.2", t2: "0.6" } })]);
  const got = await Promise.all([[scale, `${KEY}/b0`], [dir, `${KEY}/up-b2`]].map(async ([t, cell]) => {
    const r = await p.probe({ tableBytes: t as Buffer, cell: cell as string, api: "http://x", clock, transport: gate(t as Buffer, clock) });
    return [r.record.served_cell_key, r.record.reason, r.record.equal, r.problem];
  }));
  assert.deepEqual(got, [[`${KEY}/b0`, "calib_retired", true, null], [`${KEY}/up-b2`, "calib_retired", true, null]], "the retired cell answers calib_retired with the file's digest");
  assert.deepEqual([p.call(scale, `${KEY}/b0`, G).body.prediction.yhat, p.call(dir, `${KEY}/up-b2`, G).body.prediction.yhat], [2.5, 0.6]);
});

// reddened by: a verdict of another table taken for the awaited one, or T_g not the UTC second the verdict arrived
// killer: scripts/retire-probe.mjs:71 CONST "!equal ?" -> "false ?"
test("retire_probe_refuses_a_verdict_of_the_old_table_and_records_T_g", async () => {
  const p = await load(), now = G + 61_999, dated = file("btc-range-1h", [row("b0", "retired", { calib_support: { min: 2, max: 3 } })]), old = file("btc-range-1h", []);
  const r = await p.probe({ tableBytes: dated, cell: `${KEY}/b0`, api: "http://x", clock: () => now, monotonic: () => 0, transport: gate(old, () => now) });
  assert.deepEqual([r.record.received_at, r.record.received_at_ms, r.record.equal, r.problem?.[0]], ["2027-01-04T09:01:01Z", "2027-01-04T09:01:01.999Z", false, "digest_mismatch"]);
  const ok = await p.probe({ tableBytes: dated, cell: `${KEY}/b0`, api: "http://x", clock: () => now, monotonic: () => 0, transport: gate(dated, () => now) });
  assert.deepEqual([ok.record.format, ok.record.received_at, ok.record.equal, ok.problem], ["retire-probe-v1", "2027-01-04T09:01:01Z", true, null]);
});

// reddened by: a call the served JSON mirror refuses (its input schema, the kata contract), or a refusal of the probe that the RUNBOOK
// does not cite
// killer: scripts/retire-probe.mjs:58 CONST "features_digest: \"0\".repeat(64)" -> "features_digest: \"0\".repeat(63)"
test("retire_probe_reads_the_served_file_through_the_json_mirror", async () => {
  const p = await load(), table = readFileSync(join(ROOT, "spec", "contract-1.1.0", "policy", "btc-range-1h.json"));
  listen.at = G + 2000;
  const asked = p.call(table, `${KEY}/b0`, G), res = await p.wired(`${listen.url}/gate`, JSON.stringify(asked.body), "api.mirror.test");
  assert.ok(!("error" in res), "the listener answers");
  const r = p.judge(res, asked, G + 2000);
  assert.deepEqual([r.record.status, r.record.reason, r.record.equal, r.problem], [200, "under_calib", true, null], "the served file's digest, through the mirror on the wire");
  const runbook = readFileSync(join(ROOT, "docs", "RUNBOOK-harness.md"), "utf8"), source = readFileSync(join(ROOT, "scripts", "retire-probe.mjs"), "utf8");
  const codes = new Set([...source.matchAll(/(?:no\(|ProbeError\(|\[)"([a-z]+_[a-z_]+)", /g)].map((m) => m[1] ?? ""));
  assert.deepEqual([...codes].filter((c) => !runbook.includes(`\`${c}\``)), [], "the RUNBOOK cites every refusal of the probe");
  assert.ok(codes.size >= 9 && runbook.includes("node scripts/retire-probe.mjs --api <url> --table"), "the RUNBOOK runs the probe");
  assert.equal(await p.main([]), 2, "usage exits 2");
});

// reddened by: a call that does not reach the api host through the default transport (no Host header, so the server's route is the MCP
// one), or a record without its own verdict and provenance, or an accepted record not written by --out
// killer: scripts/retire-probe.mjs:89 CONST "host: hostHeader, " -> ""
test("retire_probe_calls_the_gate_through_the_default_transport", async () => {
  const p = await load(), served = file("btc-range-1h", [row("b0", "region")]), path = tablePath("region.json", served), out = join(TMP, "probe.json");
  [listen.served, listen.at] = [served, G + 1000];
  const r = await p.probe({ tableBytes: served, cell: `${KEY}/b0`, api: listen.url, apiHost: "api.gate.test", table: path, clock: () => G + 1000 });
  assert.deepEqual([r.problem, r.record.ok, r.record.problem, r.record.status, r.record.api, r.record.api_host, r.record.table], [null, true, null, 200, listen.url, "api.gate.test", path], "the default transport reaches the api route");
  const code = await p.main(["--api", listen.url, "--api-host", "api.gate.test", "--table", path, "--cell", `${KEY}/b0`, "--out", out], { clock: () => G + 1000 });
  const written = JSON.parse(readFileSync(out, "utf8")) as { ok: boolean; table: string };
  assert.deepEqual([code, written.ok, written.table, existsSync(`${out}.refused`)], [0, true, path, false], "--out writes the accepted record, no shell redirection");
});

// reddened by: a verdict served off a 200, of another cell, or a retired cell answered otherwise than calib_retired at the right digest,
// taken for the awaited one; or a refused record written where an accepted one goes
// killer: scripts/retire-probe.mjs:69 CONST "status !== 200 || " -> ""
test("retire_probe_refuses_a_served_verdict_off_its_status_cell_or_reason", async () => {
  const p = await load(), served = file("btc-range-1h", [row("b0", "retired", { calib_support: { min: 2, max: 3 } })]), path = tablePath("retired.json", served);
  [listen.served, listen.at] = [served, G + 1000];
  const got: unknown[] = [];
  for (const mode of ["status500", "othercell", "undercalib"]) {
    const r = await p.probe({ tableBytes: served, cell: `${KEY}/b0`, api: listen.url, apiHost: `api.${mode}.test`, clock: () => G + 1000 });
    const out = join(TMP, `${mode}.json`), code = await p.main(["--api", listen.url, "--api-host", `api.${mode}.test`, "--table", path, "--cell", `${KEY}/b0`, "--out", out], { clock: () => G + 1000 });
    got.push([r.problem?.[0], r.record.ok, r.record.problem, r.record.equal, code, existsSync(out), existsSync(`${out}.refused`)]);
  }
  assert.deepEqual(got, [["not_served", false, "not_served", true, 1, false, true], ["cell_mismatch", false, "cell_mismatch", true, 1, false, true], ["reason_mismatch", false, "reason_mismatch", true, 1, false, true]],
    "each is refused by its code, its record says so, and --out writes it beside the accepted path only");
});

// reddened by: a body cut before its Content-Length, or one that drips under the idle timeout, left without an end (the CLI would exit 13
// on an unsettled await, with no refusal named)
// killer: scripts/retire-probe.mjs:92 CONST "res.on(\"error\", (e) => { done({ error: res.complete ? e.message : \"truncated\" }); }).on(\"close\", () => { if (!res.complete) done({ error: \"truncated\" }); });" -> "res.on(\"error\", () => undefined);"
test("retire_probe_ends_on_a_truncated_or_dripping_body", async () => {
  const p = await load(), served = file("btc-range-1h", [row("b0", "region")]), path = tablePath("cut.json", served), t0 = Date.now();
  const cut = await p.wired(`${listen.url}/gate`, "{}", "api.truncate.test", 2000), drip = await p.wired(`${listen.url}/gate`, "{}", "api.drip.test", 300);
  assert.deepEqual([cut, drip], [{ error: "truncated" }, { error: "timeout" }], "a cut body is truncated; a dripping body ends on the total deadline");
  assert.ok(Date.now() - t0 < 1900, "the drip is bounded by the total deadline, not the idle one");
  assert.equal(await p.main(["--api", listen.url, "--api-host", "api.truncate.test", "--table", path, "--cell", `${KEY}/b0`, "--timeout", "2000"], { clock: () => G + 1000 }), 1, "exit 1, transport_failed");
});

// reddened by: a total deadline longer than --timeout (the drip outlives the value asked; the RUNBOOK says "bounded as a whole by
// `--timeout`"), or shorter than it
// killer: scripts/retire-probe.mjs:94 CONST "}, timeoutMs);" -> "}, 4 * timeoutMs);"
test("retire_probe_bounds_the_exchange_by_the_timeout_value", async () => {
  const p = await load(), t0 = performance.now(), drip = await p.wired(`${listen.url}/gate`, "{}", "api.drip.test", 300), spent = performance.now() - t0;
  assert.deepEqual(drip, { error: "timeout" }, "a dripping body ends on the total deadline");
  assert.ok(spent >= 290 && spent < 600, `a dripping body ends at --timeout (300 ms), under twice the value: ${String(Math.round(spent))} ms`);
});

// reddened by: a stale <out>.refused left beside an accepted record (two files that disagree on the verdict), or a record written by
// a refusal before any verdict, which has none
// killer: scripts/retire-probe.mjs:138 CONST "if (a.out !== undefined && problem === null) rmSync" -> "if (false) rmSync"
test("retire_probe_removes_a_stale_refusal_and_writes_nothing_before_a_verdict", async () => {
  const p = await load(), served = file("btc-range-1h", [row("b0", "region")]), path = tablePath("stale.json", served), out = join(TMP, "stale-probe.json");
  [listen.served, listen.at] = [served, G + 1000];
  const run = (host: string, o: string): Promise<number> => p.main(["--api", listen.url, "--api-host", host, "--table", path, "--cell", `${KEY}/b0`, "--out", o, "--timeout", "2000"], { clock: () => G + 1000 });
  const refused = await run("api.status500.test", out), before = [existsSync(out), existsSync(`${out}.refused`)];
  const accepted = await run("api.gate.test", out);
  assert.deepEqual([refused, before, accepted, existsSync(out), existsSync(`${out}.refused`)], [1, [false, true], 0, true, false], "an accepted record removes the stale refusal beside it");
  const early = join(TMP, "early.json"), cut = await run("api.truncate.test", early);
  assert.deepEqual([cut, existsSync(early), existsSync(`${early}.refused`)], [1, false, false], "a refusal before any verdict (transport_failed) writes nothing");
  assert.ok(readFileSync(join(ROOT, "docs", "RUNBOOK-harness.md"), "utf8").replace(/\s+/g, " ").includes("a refusal before any verdict (`table_invalid`, `cell_invalid`, `wait_exceeds_max`, `window_missed`, `transport_failed`) writes nothing"), "the RUNBOOK says so");
});

// reddened by: a --timeout of 0 or over 2147483647 ms taken (a timer clamps it to 1 ms, read as a refusal of the transport) instead of a
// usage error, exit 2, as scripts/verify-harness.mjs
// killer: scripts/retire-probe.mjs:124 CONST "Number(a.timeout) > 2147483647" -> "Number(a.timeout) > 2147483648"
test("retire_probe_timeout_is_a_positive_integer_of_milliseconds_at_most_2_31_minus_1", async () => {
  const p = await load(), args = ["--api", "http://127.0.0.1:1", "--table", "x.json", "--cell", `${KEY}/b0`, "--timeout"];
  assert.deepEqual(await Promise.all(["0", "2147483648"].map((t) => p.main([...args, t]))), [2, 2], "0 and 2^31 are usage errors, exit 2");
  assert.equal(p.parseArgs([...args, "2147483647"]).timeout, "2147483647", "2^31 - 1 is taken");
  assert.throws(() => p.parseArgs([...args, "0"]), /positive integer of milliseconds, at most 2147483647/, "the bound is the one of verify-harness");
});

// reddened by: received_at read on a second reading of the wall clock (a step back between the call and the answer would put T_g before
// produced_at)
// killer: scripts/retire-probe.mjs:110 CONST "t0 + Math.max(0, monotonic() - m0)" -> "clock()"
test("retire_probe_takes_received_at_from_the_reading_of_the_call", async () => {
  const p = await load(), served = file("btc-range-1h", [row("b0", "region")]), wall = [G + 1000, G + 1000], mono = [10, 260];
  const r = await p.probe({ tableBytes: served, cell: `${KEY}/b0`, api: "http://x", clock: () => wall.shift() ?? G - H, monotonic: () => mono.shift() ?? 0, transport: gate(served, () => G + 1000) });
  assert.deepEqual([r.problem, r.record.produced_at, r.record.received_at_ms], [null, "2027-01-04T09:00:00Z", "2027-01-04T09:00:01.250Z"], "the reading of the call plus the monotonic delta");
});

// reddened by: a cell with no current row in the table taken as asked (a mistyped key is served under_calib and skipped the check)
// killer: scripts/retire-probe.mjs:103 CONST "if (row === null) no(" -> "if (false) no("
test("retire_probe_refuses_a_cell_with_no_current_row", async () => {
  const p = await load(), served = file("btc-range-1h", [row("b0", "retired", { calib_support: { min: 2, max: 3 } })]), typo = "kata:vote5@venue/BTCUSDT/1h/b0";
  await assert.rejects(p.probe({ tableBytes: served, cell: typo, api: "http://x", clock: () => G + 1000, transport: gate(served, () => G + 1000) }), (e: unknown) => (e as { code?: string }).code === "cell_invalid");
});
