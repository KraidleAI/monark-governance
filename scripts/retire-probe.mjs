// scripts/retire-probe.mjs -- RETIRE-PROBE-1 (ENGINE-ROW-RETIRE-PATH-1, lot RH-1; docs/G0-lot-retire-latency-rehearsal-1.md section 8): the
// probe of T_g, the first served verdict that carries the policy_table_sha256 of a new table version. Node 24, no dependency.
//
//   node scripts/retire-probe.mjs --api <url> --table <spec/<dir>/policy/<task_class>.json> --cell <cell_key> [--api-host <name>]
//                                 [--max-wait <seconds>] [--timeout <ms>] [--out <file>]
//
// The call comes from the table file alone: its class (task_class, alpha, n_min, h_ms; tau at the cap of a dir class) and the cell. A
// dir cell takes a lean in its bucket (the thresholds of the first current row of its side, as apps/harness/src/kata-path.ts l.73-75); a
// scale cell takes the middle of its row's calib_support, since out_of_support (kata-path.ts l.93) is tested before calib_retired (l.94).
// The expected digest is the sha256 of the file (scripts/spec-policy-tables.mjs l.10-11). A kata call is accepted with a produced_at on
// the grid of the horizon, at most 300 s before the server clock (kata-path.ts l.47, produced_at_stale) and at most 300 s after it
// (apps/harness/src/tools/gate.ts l.885, produced_at_future): the probe waits until its clock is within MARGIN_MS of a grid instant (at
// most --max-wait, default 4 h), then makes ONE call, POST <api>/gate with Host <api-host> (default: the --api host), bounded as a whole
// by --timeout (default 10 000 ms: headers and body, as scripts/verify-harness.mjs). Stdout: the closed record retire-probe-v1 of the
// verdict received, with the probe's own verdict (ok, problem), the table file, the api and its Host; received_at is the UTC second it
// arrived (T_g), the clock reading of the call plus a monotonic delta (a wall clock stepped back between the two never reorders them).
// --out <file> writes the record through a temporary file and a rename (writeAtomic of scripts/verify-harness.mjs: no shell redirection,
// which PowerShell 5.1 writes in UTF-16) when it is accepted, <file>.refused when it is not. Exit 0 iff the verdict is a 200 of the cell
// asked, with the expected digest and, on a retired row, calib_retired; 1 refused by code (table_invalid, cell_invalid, wait_exceeds_max,
// window_missed, transport_failed, not_served, cell_mismatch, digest_mismatch, reason_mismatch); 2 usage. Clock, monotonic clock, sleep
// and transport are parameters of probe(); the tests serve the gate on a local listener, never the network.
import { createHash } from "node:crypto";
import { readFileSync, rmSync } from "node:fs";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { writeAtomic } from "./verify-harness.mjs";

export const FORMAT = "retire-probe-v1", MARGIN_MS = 240_000, MAX_WAIT_MS = 4 * 3_600_000;
export class ProbeError extends Error {
  constructor(code, detail) { super(`${code}: ${detail}`); this.code = code; }
}
const no = (code, detail) => { throw new ProbeError(code, detail); };
const second = (ms) => new Date(Math.floor(ms / 1000) * 1000).toISOString().replace(".000Z", "Z");

/** plan(nowMs, hMs) -> {producedAtMs, waitMs}: the grid instant to call for, and the wait until the clock is within MARGIN_MS of it. */
export function plan(nowMs, hMs) {
  const g = Math.floor(nowMs / hMs) * hMs;
  return nowMs - g <= MARGIN_MS ? { producedAtMs: g, waitMs: 0 } : { producedAtMs: g + hMs, waitMs: Math.max(0, g + hMs - MARGIN_MS - nowMs) };
}

/** call(tableBytes, cell, producedAtMs) -> {body, cell, expected, row, hMs}: the gate body, the file's sha256, the cell's current row or null. */
export function call(tableBytes, cell, producedAtMs) {
  let t = null;
  try { t = JSON.parse(Buffer.from(tableBytes).toString("utf8")); } catch (e) { no("table_invalid", `not JSON: ${e instanceof Error ? e.message : String(e)}`); }
  const cls = t?.class;
  if (cls?.cell_key_rule !== "kata-bucket" || !Number.isInteger(cls.h_ms) || !Array.isArray(t.rows)) no("table_invalid", "not the table file of a kata class");
  const dir = cls.region_rule === "sign-set", m = /^(kata:\S+)\/(b0|up|down|(up|down)-b([123]))$/.exec(String(cell));
  if (m === null || dir === (m[2] === "b0")) no("cell_invalid", `${JSON.stringify(cell)} is no cell of ${cls.task_class}: <key>/${dir ? "up|down[-b1|-b2|-b3]" : "b0"}`);
  const current = t.rows.filter((r) => r.current), row = current.find((r) => r.cell_key === cell) ?? null, side = m[3] ?? m[2];
  let yhat = 1;
  if (dir) {
    const thr = current.find((r) => r.cell_key.startsWith(`${m[1]}/${side}-`))?.thresholds ?? null;
    if ((thr === null) !== (m[4] === undefined)) no("cell_invalid", `${cell}: its side ${thr === null ? "has no thresholds, so no bucket" : "has thresholds, so a bucket"}`);
    yhat = (side === "up" ? 1 : -1) * (thr === null ? 0.5 : [Number(thr.t1), Number(thr.t2), 1][Number(m[4]) - 1]);
  } else if (row?.calib_support) yhat = (row.calib_support.min + row.calib_support.max) / 2;
  const prediction = { schema_version: "1.1.0", task_class: cls.task_class, yhat, predictor_id: m[1], produced_at: second(producedAtMs), features_digest: "0".repeat(64) };
  const params = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: Number(cls.alpha), nMin: cls.n_min, intent: dir ? side : 0.01, tool: "perps_order_preview", clockOpen: true };
  return { body: { prediction, params }, cell, expected: createHash("sha256").update(tableBytes).digest("hex"), row, hMs: cls.h_ms };
}

/** judge(response, asked, receivedMs, where) -> {record, problem}: the closed record, which carries the probe's verdict (ok, and the code
 *  of the problem or null), and why it is not the verdict awaited (null when it is). */
export function judge({ status, text }, { body, cell, expected, row }, receivedMs, { table = null, api = null, apiHost = null } = {}) {
  let v = null;
  try { v = JSON.parse(text)?.structuredContent?.verdict ?? null; } catch { v = null; }
  const p = body.prediction, equal = v?.policy_table_sha256 === expected;
  const problem = status !== 200 || v === null ? ["not_served", `status ${String(status)}: ${String(text).slice(0, 300)}`]
    : v.cell_key !== cell ? ["cell_mismatch", `served ${String(v.cell_key)}, asked ${cell}`]
      : !equal ? ["digest_mismatch", `served ${String(v.policy_table_sha256)}, the file is ${expected}`]
        : row?.status === "retired" && v.reason !== "calib_retired" ? ["reason_mismatch", `the retired cell answered ${String(v.reason)}, not calib_retired`] : null;
  const record = {
    format: FORMAT, task_class: p.task_class, cell_key: cell, table, api, api_host: apiHost, produced_at: p.produced_at, received_at: second(receivedMs),
    received_at_ms: new Date(receivedMs).toISOString(), status, served_cell_key: v?.cell_key ?? null, reason: v?.reason ?? null,
    policy_table_sha256: v?.policy_table_sha256 ?? null, policy_row_sha256: v?.policy_row_sha256 ?? null, expected_sha256: expected, equal,
    ok: problem === null, problem: problem?.[0] ?? null,
  };
  return { record, problem };
}

/** The default transport: one HTTP(S) POST with an explicit Host (fetch forbids it), as scripts/verify-harness.mjs; never throws. It
 *  always ends: timeoutMs bounds the whole exchange (a body that drips stays bounded), and a body cut before its end is "truncated". */
export function wired(url, body, hostHeader, timeoutMs = 10_000) {
  return new Promise((resolve) => {
    let total;
    const done = (r) => { clearTimeout(total); resolve(r); }, u = new URL(url), https = u.protocol === "https:";
    const req = (https ? httpsRequest : httpRequest)({ hostname: u.hostname, port: u.port || (https ? 443 : 80), path: u.pathname, method: "POST", timeout: timeoutMs, ...(https ? { servername: u.hostname } : {}),
      headers: { host: hostHeader, "content-type": "application/json", "content-length": Buffer.byteLength(body) } }, (res) => {
      let raw = "";
      res.setEncoding("utf8").on("data", (c) => { raw += c; }).on("end", () => { done({ status: res.statusCode ?? 0, text: raw }); });
      res.on("error", (e) => { done({ error: res.complete ? e.message : "truncated" }); }).on("close", () => { if (!res.complete) done({ error: "truncated" }); });
    });
    total = setTimeout(() => { req.destroy(new Error("timeout")); done({ error: "timeout" }); }, timeoutMs);
    req.on("error", (e) => { done({ error: e.message }); }).on("timeout", () => { req.destroy(new Error("timeout")); });
    req.end(body);
  });
}

/** probe(o) -> {record, problem}: waits for the grid window, makes one call, judges it. Throws a ProbeError before any verdict. */
export async function probe({ tableBytes, cell, api, apiHost, table = null, maxWaitMs = MAX_WAIT_MS, clock = Date.now, monotonic = () => performance.now(), sleep = (ms) => new Promise((r) => { setTimeout(r, ms); }), transport = wired }) {
  const { hMs, row } = call(tableBytes, cell, 0), first = plan(clock(), hMs);
  if (row === null) no("cell_invalid", `${cell} has no current row in the table file: a mistyped key would be served under_calib and pass for the cell asked`);
  if (first.waitMs > maxWaitMs) no("wait_exceeds_max", `the next grid window opens in ${String(first.waitMs)} ms, over --max-wait ${String(maxWaitMs)} ms`);
  if (first.waitMs > 0) await sleep(first.waitMs);
  const t0 = clock(), m0 = monotonic(), now = plan(t0, hMs), host = apiHost ?? new URL(api).host;
  if (now.waitMs > 0) no("window_missed", "the clock is out of the grid window after the wait");
  const asked = call(tableBytes, cell, now.producedAtMs), res = await transport(`${api.replace(/\/+$/, "")}/gate`, JSON.stringify(asked.body), host);
  if (res.error !== undefined) no("transport_failed", res.error);
  return judge(res, asked, t0 + Math.max(0, monotonic() - m0), { table, api, apiHost: host });
}

const OPTIONS = { "--api": "api", "--api-host": "apiHost", "--table": "table", "--cell": "cell", "--max-wait": "maxWait", "--timeout": "timeout", "--out": "out" };
export function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i += 2) {
    const k = OPTIONS[argv[i]], v = argv[i + 1];
    if (k === undefined || Object.hasOwn(a, k) || v === undefined || v === "") throw new Error(`unknown, repeated or empty option ${String(argv[i])}`);
    a[k] = v;
  }
  if (!a.api || !a.table || !a.cell) throw new Error("--api <url> --table <file> --cell <cell_key> are required");
  if (!/^https?:$/.test(URL.canParse(a.api) ? new URL(a.api).protocol : "")) throw new Error("--api needs an http(s) URL");
  for (const k of ["maxWait", "timeout"]) if (a[k] !== undefined && !/^\d+$/.test(a[k])) throw new Error(`--${k === "maxWait" ? "max-wait" : "timeout"} needs an integer`);
  return a;
}

export async function main(argv, io = {}) {
  let a;
  try { a = parseArgs(argv); } catch (e) { console.error(`usage: retire-probe.mjs --api <url> --table <file> --cell <cell_key> [--api-host <name>] [--max-wait <s>] [--timeout <ms>] [--out <file>] (${e.message})`); return 2; }
  try {
    let tableBytes;
    try { tableBytes = readFileSync(a.table); } catch (e) { throw new ProbeError("table_invalid", e instanceof Error ? e.message : String(e)); }
    const timeout = a.timeout === undefined ? undefined : Number(a.timeout), transport = (u, b, h) => wired(u, b, h, timeout);
    const { record, problem } = await probe({ tableBytes, cell: a.cell, api: a.api, apiHost: a.apiHost, table: a.table, maxWaitMs: a.maxWait === undefined ? MAX_WAIT_MS : Number(a.maxWait) * 1000, transport, ...io });
    console.log(JSON.stringify(record)); // its ok and problem say whether it is accepted: a refused record is printed as refused
    if (a.out !== undefined) writeAtomic(problem === null ? a.out : `${a.out}.refused`, `${JSON.stringify(record)}\n`);
    if (a.out !== undefined && problem === null) rmSync(`${a.out}.refused`, { force: true }); // no stale refusal beside an accepted record
    if (problem !== null) throw new ProbeError(...problem);
    console.error(`retire-probe OK: ${record.task_class} ${record.cell_key} served ${record.reason} with ${record.expected_sha256} at ${record.received_at}`);
    return 0;
  } catch (e) {
    console.error(`retire-probe REFUSED: ${e instanceof Error ? e.message : String(e)}`);
    return 1;
  }
}

if (import.meta.main !== false) process.exitCode = await main(process.argv.slice(2)); // as scripts/retire-latency.mjs: an import runs nothing
