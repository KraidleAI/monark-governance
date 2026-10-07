// test/retire-probe.test.ts -- item RETIRE-PROBE-1 (lot RH-1; docs/G0-lot-retire-latency-rehearsal-1.md section 8): the probe of T_g.
// Offline: the transport is the served gate in process (runGate with the probed table, or the JSON mirror for a served file), the clock
// and the sleep are the test's. The probe is loaded on demand, so the base (no probe) reddens by assertion. The line above each test
// names the mutation that reddens it (scripts/red-proof.mjs convention).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { canonicalJson, type CanonicalValue, type PolicyTable, type Prediction } from "@monark/contracts";
import { runGate, SERVED_POLICY_TABLES, toolErrorCode, type HarnessParams } from "../apps/harness/src/tools/gate.ts";
import { handleJsonMirror } from "../apps/harness/src/http.ts";
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

// reddened by: a call sent outside the window of ±300 s around its grid instant (kata-path.ts l.47 stale, tools/gate.ts l.885 future),
// a wait not bounded by --max-wait, or a call sent to another path or Host
// killer: scripts/retire-probe.mjs:33 CONST "nowMs - g <= MARGIN_MS" -> "nowMs - g <= 2 * MARGIN_MS"
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
// killer: scripts/retire-probe.mjs:50 CONST "(row.calib_support.min + row.calib_support.max) / 2" -> "1"
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
// killer: scripts/retire-probe.mjs:67 CONST "!record.equal ?" -> "false ?"
test("retire_probe_refuses_a_verdict_of_the_old_table_and_records_T_g", async () => {
  const p = await load(), now = G + 61_999, dated = file("btc-range-1h", [row("b0", "retired", { calib_support: { min: 2, max: 3 } })]), old = file("btc-range-1h", []);
  const r = await p.probe({ tableBytes: dated, cell: `${KEY}/b0`, api: "http://x", clock: () => now, transport: gate(old, () => now) });
  assert.deepEqual([r.record.received_at, r.record.received_at_ms, r.record.equal, r.problem?.[0]], ["2027-01-04T09:01:01Z", "2027-01-04T09:01:01.999Z", false, "digest_mismatch"]);
  const ok = await p.probe({ tableBytes: dated, cell: `${KEY}/b0`, api: "http://x", clock: () => now, transport: gate(dated, () => now) });
  assert.deepEqual([ok.record.format, ok.record.received_at, ok.record.equal, ok.problem], ["retire-probe-v1", "2027-01-04T09:01:01Z", true, null]);
});

// reddened by: a call the served JSON mirror refuses (its input schema, the kata contract), or a refusal of the probe that the RUNBOOK
// does not cite
// killer: scripts/retire-probe.mjs:51 CONST "features_digest: \"0\".repeat(64)" -> "features_digest: \"0\".repeat(63)"
test("retire_probe_reads_the_served_file_through_the_json_mirror", async () => {
  const p = await load(), clock = (): number => G + 2000;
  const table = readFileSync(join(ROOT, "spec", "contract-1.1.0", "policy", "btc-range-1h.json"));
  const mirror = async (url: string, body: string, host: string): Promise<{ status: number; text: string }> => {
    const res = await handleJsonMirror(new Request(`http://${host}${new URL(url).pathname}`, { method: "POST", body }), clock);
    return { status: res.status, text: await res.text() };
  };
  const r = await p.probe({ tableBytes: table, cell: `${KEY}/b0`, api: "http://127.0.0.1:3001", apiHost: "api.monarkgate.tech", clock, transport: mirror });
  assert.deepEqual([r.record.status, r.record.reason, r.record.equal, r.problem], [200, "under_calib", true, null], "the served file's digest, through the mirror");
  const runbook = readFileSync(join(ROOT, "docs", "RUNBOOK-harness.md"), "utf8"), source = readFileSync(join(ROOT, "scripts", "retire-probe.mjs"), "utf8");
  const codes = new Set([...source.matchAll(/(?:no\(|ProbeError\(|\[)"([a-z]+_[a-z_]+)", /g)].map((m) => m[1] ?? ""));
  assert.deepEqual([...codes].filter((c) => !runbook.includes(`\`${c}\``)), [], "the RUNBOOK cites every refusal of the probe");
  assert.ok(codes.size >= 9 && runbook.includes("node scripts/retire-probe.mjs --api <url> --table"), "the RUNBOOK runs the probe");
  assert.equal(await p.main([]), 2, "usage exits 2");
});
