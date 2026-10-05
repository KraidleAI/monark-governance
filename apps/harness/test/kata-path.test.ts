/**
 * The pure kata path of 1.1.0, not served (lot CM-4b-a; docs/G0-lot-cm-4b.md; spec sections 9 and 11; delegated decision
 * CM-4b C-1 to C-11): request contract, shared key grammar with the import guard, cell lookup and verdict fields, served
 * tables built in process, threshold agreement in the guard, the served graph and the thrower ratchet. Tables come from
 * the seeded synthetic registry of block B1, passed through guardKataTable. Each test names its killer above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, TOOL_ERROR_CODES, type ClassEntry, type PolicyRow, type PolicyTable, type Prediction } from "@monark/contracts";
import { UKEMI_LIQ_COMMITTED } from "../src/calibration.ts";
import { assertKataRequest, kataPath, kataVerdictFields, servedPolicyTables, type ServedTableTexts } from "../src/kata-path.ts";
import { kataClassEntries } from "../src/policy-classes.ts";
import { guardKataRow, guardKataTable, type GuardPins } from "../src/policy-guard.ts";
import { projectCell, readRegistry } from "../src/policy-projection.ts";
import { buildPolicyTable } from "../src/policy-table-file.ts";
import { toolErrorCode, type HarnessParams } from "../src/tools/gate.ts";
import * as gate from "../src/tools/gate.ts";
import { codeLines } from "./helpers/code-lines.ts";
import { syntheticRegistry } from "./helpers/synthetic-registry.ts";

const SYN = syntheticRegistry();
const PINS: GuardPins = {
  registryFile: "synthetic.json", registrySha256: SYN.sha256, generator: "synthetic-generator", verifiers: ["verifier-b", "synthetic-generator"],
  attestation: () => ({ verifier: "verifier-b", report_sha256: "cd".repeat(32) }), text: (rule) => `text of ${rule}`,
};
const entry = (name: string): ClassEntry => kataClassEntries((c) => `class text of ${c}`).find((e) => e.task_class === name) ?? assert.fail(name);
type Cell = Record<string, unknown> & { thresholds: { t1: string; t2: string } | null };
/** The guarded table of a class, from the synthetic registry, optionally edited (then re-pinned). */
function table(name: string, edit?: (cells: Cell[]) => void): PolicyTable {
  const reg = structuredClone(SYN.registry) as { rows: Cell[] };
  edit?.(reg.rows);
  const bytes = edit === undefined ? SYN.bytes : new TextEncoder().encode(JSON.stringify(reg));
  const pins = { ...PINS, registrySha256: createHash("sha256").update(bytes).digest("hex") };
  const t = buildPolicyTable(entry(name), readRegistry(bytes).filter((c) => c.taskClass === name).map((c) => projectCell(c, pins)).filter((r) => r !== null));
  guardKataTable(t, bytes, pins, entry(name));
  return t;
}
const pidOf = (t: PolicyTable): string => (t.rows[0]?.cell_key ?? assert.fail("no row")).replace(/\/[^/]+$/, "");
const DIR = table("btc-dir-1h");
const BAND = table("btc-range-4h");
const P: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.45, nMin: 6, intent: "up", tool: "perps_order_preview", clockOpen: true };
const PB: HarnessParams = { ...P, alpha: 0.01, nMin: 299, intent: 0.01 };
const pr = (t: PolicyTable, yhat: string | number, at = "2026-10-04T04:00:00Z", over: Partial<Prediction> = {}): Prediction =>
  ({ schema_version: "1.0.0", task_class: t.class.task_class, yhat, predictor_id: over.predictor_id ?? pidOf(t), produced_at: at, features_digest: "ab".repeat(32), ...over });
const bare = (p: Prediction): Prediction => {
  const q = { ...p };
  delete q.features_digest;
  return q;
};
/** "ok" or the code of the refusal. */
const code = (fn: () => unknown): string => {
  try {
    fn();
    return "ok";
  } catch (e) {
    return String(toolErrorCode(e) ?? e);
  }
};
const req = (t: PolicyTable, p: Prediction, params = t.class.region_rule === "sign-set" ? P : PB, nowMs?: number): string => code(() => assertKataRequest(p, params, t.class, nowMs));
const sha = (s: string): string => createHash("sha256").update(s).digest("hex");
const next = (x: number, d: 1 | -1): number => {
  const v = new DataView(new ArrayBuffer(8));
  v.setFloat64(0, x);
  v.setBigUint64(0, v.getBigUint64(0) + BigInt(d));
  return v.getFloat64(0);
};

// killer: apps/harness/src/kata-path.ts:46 CONST "at % (cls.h_ms ?? NaN)" -> "at % 3_600_000"
test("kata_grid_on_string_fields", () => {
  const D4 = table("btc-dir-4h");
  for (const at of ["2026-10-04T04:00:00Z", "2026-10-04T05:00:00Z", "2026-10-04T04:00:00.000Z", "2026-10-04T09:00:00+05:00"]) assert.equal(req(DIR, pr(DIR, 0.5, at)), "ok", at);
  for (const at of ["2026-10-04T04:00:00.0004Z", "2026-10-04T04:00:01Z", "2026-10-04T04:30:00Z", "2026-10-04T23:59:60Z", "2026-10-04T04:00:00+05:30"]) assert.equal(req(DIR, pr(DIR, 0.5, at)), "produced_at_off_grid", at);
  assert.equal(req(D4, pr(D4, 0.5, "2026-10-04T04:00:00Z")), "ok");
  assert.equal(req(D4, pr(D4, 0.5, "2026-10-04T09:30:00+05:30")), "ok", "offset applied: 04:00Z");
  assert.equal(req(D4, pr(D4, 0.5, "2026-10-04T05:00:00Z")), "produced_at_off_grid");
  // C-1 condition 5: the grid runs before the yhat type, the key and the domain.
  assert.equal(req(D4, pr(D4, "up", "2026-10-04T05:00:00Z", { predictor_id: "x" })), "produced_at_off_grid");
  assert.equal(req(DIR, pr(DIR, 0.5, "2026-10-04T04:00:00")), "produced_at_invalid");
});

// killer: apps/harness/src/kata-path.ts:47 ROR "nowMs - at > PRODUCED_AT_FUTURE_TOLERANCE_MS" -> "nowMs - at >= PRODUCED_AT_FUTURE_TOLERANCE_MS"
test("kata_stale_bound_is_300_s", () => {
  const t = Date.parse("2026-10-04T04:00:00Z");
  assert.equal(req(DIR, pr(DIR, 0.5), P, t + 300_000), "ok");
  assert.equal(req(DIR, pr(DIR, 0.5), P, t + 300_001), "produced_at_stale");
  assert.equal(req(DIR, pr(DIR, 0.5), P, t - 3_600_000), "ok", "the future check is runGate's (B-4)");
  assert.equal(req(DIR, pr(DIR, 0.5)), "ok", "no clock: no lateness check");
  assert.equal(req(DIR, pr(DIR, "up", undefined, { predictor_id: "x" }), P, t + 300_001), "produced_at_stale", "lateness before type and key");
});

// killer: apps/harness/src/policy-classes.ts:42 CONST "m[4] === h" -> "m[4] !== \"\""
test("kata_key_grammar", () => {
  const key = (k: string, t = DIR): string => req(t, pr(t, 0.5, undefined, { predictor_id: k }));
  const pid = pidOf(DIR);
  assert.equal(key(pid), "ok");
  const [kata, venue] = /^kata:([^@]+)@([^/]+)\//.exec(pid)?.slice(1) ?? assert.fail(pid);
  const ok = [`kata:${"a".repeat(64)}@${venue}/BTCUSDT/1h`, `kata:${kata}@${"v-1".repeat(21)}x/BTCUSDT/1h`, `kata:${kata}@${venue}/BTC${"X".repeat(17)}/1h`, `kata:new-kata-v9@other-venue/BTCUSD/1h`];
  for (const k of ok) assert.equal(key(k), "ok", k);
  const bad = [
    `${pid}/up-b1`, pid.replace("/1h", "/4h"), pid.replace("BTCUSDT", "ETHUSDT"), pid.replace("kata:", ""), pid.replace("kata:", "KATA:"), pid.replace("BTCUSDT", "btcusdt"),
    `kata:@${venue}/BTCUSDT/1h`, `kata:${kata}@/BTCUSDT/1h`, `kata:${"a".repeat(65)}@${venue}/BTCUSDT/1h`, `kata:${kata}@${"v".repeat(65)}/BTCUSDT/1h`, `kata:${kata}@${venue}/BTC${"X".repeat(18)}/1h`, `kata:${kata}@${venue}/B/1h`,
    `kata:${kata}-@${venue}/BTCUSDT/1h`, `kata:${kata}@${venue}/BTCUSDT/1h `, `kata:${kata}@${venue}/BTCUSDT`,
  ];
  for (const k of bad) assert.equal(key(k), "kata_key_invalid", k);
  // C-5 condition 2: a prefix ambiguity passes the grammar and answers under_calib (no row for the key).
  const eth = table("eth-dir-1h");
  const ethfi = pidOf(eth).replace("ETHUSDT", "ETHFIUSDT");
  assert.equal(key(ethfi, eth), "ok");
  assert.equal(kataPath(pr(eth, 0.5, undefined, { predictor_id: ethfi }), P, eth).reason, "under_calib");
});

// killer: apps/harness/src/policy-guard.ts:51 CONST "r.task_class) === undefined" -> "r.task_class) !== null"
test("kata_key_predicate_is_shared_with_the_guard", () => {
  const row = DIR.rows[0] ?? assert.fail("no row");
  const keys = [pidOf(DIR), pidOf(DIR).replace("BTCUSDT", `BTC${"X".repeat(17)}`), pidOf(DIR).replace("BTCUSDT", `BTC${"X".repeat(18)}`), pidOf(DIR).replace("BTCUSDT", "B"),
    pidOf(DIR).replace(/kata:[^@]+@/, `kata:${"k".repeat(65)}@`), pidOf(DIR).replace(/@[^/]+\//, "@Binance/"), pidOf(DIR).replace(/kata:[^@]+@/, "kata:a--b@"), pidOf(DIR).replace(/@[^/]+\//, `@${"v".repeat(65)}/`)];
  for (const k of keys) {
    const [, kata_id = "", venue = "", symbol = ""] = /^kata:([^@]*)@([^/]*)\/([^/]*)\//.exec(k) ?? [];
    const forged: PolicyRow = { ...row, kata_id, venue, symbol, cell_key: `${k}/${String(row.bucket)}`, source: { ...row.source, trial_id: [row.task_class, kata_id, venue, symbol, row.horizon, "CALIB"].join("|") } };
    const guard = code(() => guardKataRow(forged, DIR.class, PINS));
    assert.equal(guard === "ok", req(DIR, pr(DIR, 0.5, undefined, { predictor_id: k })) === "ok", `${k}: guard ${guard}`);
  }
});

// killer: apps/harness/src/kata-path.ts:59 ROR "y <= 1" -> "y <= 2"
test("kata_yhat_domain_and_zero_lean", () => {
  for (const y of [1, -1, 0.5, 0, -0]) assert.equal(req(DIR, pr(DIR, y)), "ok", String(y));
  for (const y of [1 + 2 ** -52, -1 - 2 ** -52, 1.5, NaN, Infinity, -Infinity]) assert.equal(req(DIR, pr(DIR, y)), "kata_yhat_domain", String(y));
  for (const y of [5e-324, 1e300]) assert.equal(req(BAND, pr(BAND, y)), "ok", String(y));
  for (const y of [0, -0, -1, Infinity, NaN]) assert.equal(req(BAND, pr(BAND, y)), "kata_yhat_domain", String(y));
  assert.equal(req(DIR, pr(DIR, "0.5")), "yhat_type_mismatch");
  // C-7: a lean of 0 looks up no row; its key is the predictor_id.
  for (const y of [0, -0]) {
    assert.deepEqual(kataPath(pr(DIR, y), P, DIR), {
      method: "risk-control", alpha: 0.45, n_calib: 0, region: null, qhat: null, qhat_unit: "score", scale: null, abstain: true, reason: "non_evaluable",
      scores_sha256: sha("[]"), cell_key: pidOf(DIR), policy_row_sha256: null, policy_table_sha256: sha(canonicalJson(DIR)),
    });
  }
});

// killer: apps/harness/src/kata-path.ts:102 SDL "assertKataRequest(p, params, table.class, nowMs);" -> ""
test("kata_zero_lean_answers_after_every_400", () => {
  const zero = (params: HarnessParams, over: Partial<Prediction> = {}, at?: string): string => code(() => kataPath(pr(DIR, 0, at, over), params, DIR));
  assert.equal(zero(P), "ok");
  assert.equal(zero({ ...P, alpha: 0.46 }), "policy_alpha_mismatch");
  assert.equal(zero({ ...P, nMin: 7 }), "policy_nmin_mismatch");
  assert.equal(zero({ ...P, tau: 1.5 }), "policy_tau_cap");
  assert.equal(zero(P, { predictor_id: `${pidOf(DIR)}/up-b1` }), "kata_key_invalid");
  assert.equal(code(() => kataPath(bare(pr(DIR, 0)), P, DIR)), "features_digest_required");
  assert.equal(zero(P, {}, "2026-10-04T04:00:01Z"), "produced_at_off_grid");
});

// killer: apps/harness/src/kata-path.ts:60 SDL "if (params.alpha !== Number(cls.alpha)) refuse(" -> ""
test("kata_imposed_params_without_row", () => {
  const served = servedPolicyTables({ classText: (c) => `class text of ${c}`, marginal: () => ({ registry_file: "r", registry_sha256: "ab".repeat(32), generator: "g", text: "t" }) });
  const empty = served.find((s) => s.task_class === "btc-dir-1h")?.table ?? assert.fail("no table");
  const band = served.find((s) => s.task_class === "btc-range-4h")?.table ?? assert.fail("no table");
  assert.equal(empty.rows.length, 0);
  const call = (t: PolicyTable, params: HarnessParams): string => code(() => kataPath(pr(t, 0.5, undefined, { predictor_id: pidOf(t === empty ? DIR : BAND) }), params, t));
  assert.equal(call(empty, { ...P, alpha: 0.46 }), "policy_alpha_mismatch");
  assert.equal(call(empty, { ...P, nMin: 7 }), "policy_nmin_mismatch");
  assert.equal(call(empty, P), "ok");
  assert.equal(call(band, { ...PB, alpha: 0.45, nMin: 6 }), "policy_alpha_mismatch");
  assert.equal(call(band, { ...PB, nMin: 300 }), "policy_nmin_mismatch");
  assert.equal(call(band, PB), "ok");
});

// killer: apps/harness/src/kata-path.ts:62 CONST "!(params.tau <= KATA_DIR_TAU_CAP)" -> "!(params.tau <= 2)"
test("kata_tau_cap_on_set_classes", () => {
  assert.equal(req(DIR, pr(DIR, 0.5), { ...P, tau: 1 }), "ok");
  assert.equal(req(DIR, pr(DIR, 0.5), { ...P, tau: 0 }), "ok");
  assert.equal(req(DIR, pr(DIR, 0.5), { ...P, tau: 1.5 }), "policy_tau_cap");
  assert.equal(req(DIR, pr(DIR, 0.5), { ...P, tau: 2 }), "policy_tau_cap");
  assert.equal(req(DIR, pr(DIR, 0.5), { ...P, tau: NaN }), "policy_tau_cap", "a tau that is not <= 1 is refused on the direct call too");
  assert.equal(req(BAND, pr(BAND, 0.01), { ...PB, tau: 5 }), "ok");
});

// killer: apps/harness/src/kata-path.ts:56 SDL "if (p.features_digest === undefined) refuse(" -> ""
test("kata_features_digest_required", () => {
  assert.equal(req(DIR, bare(pr(DIR, 0.5))), "features_digest_required");
  assert.equal(req(BAND, bare(pr(BAND, 0.01))), "features_digest_required");
  // C-11: presence only on the pure path; the 64-hex form stays with the input schema at the entry points.
  assert.equal(req(DIR, { ...pr(DIR, 0.5), features_digest: "x" }), "ok");
});

// killer: apps/harness/src/kata-path.ts:75 ROR "m <= Number(thr.t1)" -> "m < Number(thr.t1)"
test("kata_bucket_edges_compare_the_double", () => {
  // C-6: 0.1 and 0.2 are shortest round-trip writings whose doubles lie above their decimals.
  const t = table("btc-dir-1h", (cells) => {
    for (const c of cells) if (c.taskClass === "btc-dir-1h" && c.thresholds !== null && String(c.key).includes("/up-")) c.thresholds = { t1: "0.1", t2: "0.2" };
  });
  const keyOf = (m: number): string => kataVerdictFields(t, pr(t, m), 1).cell_key.slice(pidOf(t).length);
  assert.deepEqual([0.05, 0.1, next(0.1, 1), 0.2, next(0.2, 1), 1].map(keyOf), ["/up-b1", "/up-b1", "/up-b2", "/up-b2", "/up-b3", "/up-b3"]);
  const down = t.rows.find((r) => r.side === "down")?.thresholds ?? assert.fail("no down side");
  assert.deepEqual([Number(down.t1), next(Number(down.t1), 1), Number(down.t2), next(Number(down.t2), 1)].map((m) => keyOf(-m)), ["/down-b1", "/down-b2", "/down-b2", "/down-b3"]);
  // C-8 condition 1: the thresholds come from the first current row of the side (b1), whatever the other rows say.
  const odd = { ...t, rows: t.rows.map((r) => (r.bucket === "up-b2" || r.bucket === "up-b3" ? { ...r, thresholds: { t1: "0.9", t2: "0.95" } } : r)) };
  assert.equal(kataVerdictFields(odd, pr(t, 0.15), 1).cell_key.slice(pidOf(t).length), "/up-b2");
  // A side without thresholds has no row (L-1): the key stops at the side, under_calib.
  const e4 = table("eth-dir-4h");
  assert.deepEqual(Object.entries(kataVerdictFields(e4, pr(e4, -0.5), 1)).filter(([k]) => ["cell_key", "reason", "policy_row_sha256", "n_calib"].includes(k)), [["n_calib", 0], ["reason", "under_calib"], ["cell_key", `${pidOf(e4)}/down`], ["policy_row_sha256", null]]);
});

// killer: apps/harness/src/kata-path.ts:81 CONST "current.find((r) => r.cell_key === key)" -> "table.rows.find((r) => r.cell_key === key)"
test("kata_lookup_reads_current_rows_only", () => {
  // Spec section 11 point 4: a replaced row (current false) sorts before its replacement (same cell_key, lower calib_attempt);
  // neither its thresholds nor the row itself are read. Hand-built table, not guarded.
  const b1 = DIR.rows.find((r) => r.bucket === "up-b1") ?? assert.fail("no up-b1 row");
  const old: PolicyRow = { ...b1, current: false, calib_attempt: b1.calib_attempt - 1 || 1, thresholds: { t1: "0.01", t2: "0.02" }, n: b1.n + 1 };
  const mixed = { ...DIR, rows: DIR.rows.flatMap((r) => (r === b1 ? [old, r] : [r])) };
  const v = kataVerdictFields(mixed, pr(DIR, Number(b1.thresholds?.t1) / 2), 1);
  assert.deepEqual([v.cell_key, v.policy_row_sha256, v.n_calib], [b1.cell_key, sha(canonicalJson(b1)), b1.n]);
});

// killer: apps/harness/src/kata-path.ts:78 CONST "sha256Canonical([])" -> "sha256Canonical([0])"
test("kata_no_row_verdict_fields", () => {
  // Spec section 11 point 4, recomputed field by field on the served (empty) tables: direction and scale.
  const served = servedPolicyTables({ classText: (c) => `class text of ${c}`, marginal: () => ({ registry_file: "r", registry_sha256: "ab".repeat(32), generator: "g", text: "t" }) });
  for (const [name, y, params, from] of [["btc-dir-1h", 0.3, P, DIR], ["btc-dir-1h", -0.3, P, DIR], ["btc-range-4h", 0.02, PB, BAND]] as const) {
    const t = served.find((s) => s.task_class === name)?.table ?? assert.fail(name);
    const dir = name.includes("-dir-");
    const p = pr(t, y, undefined, { predictor_id: pidOf(from) });
    assert.deepEqual(kataPath(p, params, t), {
      method: t.class.method, alpha: Number(t.class.alpha), n_calib: 0, region: null, qhat: null, qhat_unit: t.class.qhat_unit, scale: dir ? null : y, abstain: true, reason: "under_calib",
      scores_sha256: sha("[]"), cell_key: dir ? `${p.predictor_id}/${y > 0 ? "up" : "down"}` : `${p.predictor_id}/b0`, policy_row_sha256: null, policy_table_sha256: sha(canonicalJson(t)),
    }, `${name} ${String(y)}`);
  }
});

// killer: apps/harness/src/kata-path.ts:87 CONST "qhat: 1, abstain: true, reason: calib" -> "qhat: 1, abstain: false, reason: calib"
test("kata_row_statuses_map_to_regions", () => {
  const lean = (r: PolicyRow): number => {
    const [t1, t2] = [Number(r.thresholds?.t1), Number(r.thresholds?.t2)];
    const m = r.bucket?.endsWith("b1") ? t1 / 2 : r.bucket?.endsWith("b2") ? (t1 + t2) / 2 : (t2 + 1) / 2;
    return r.side === "up" ? m : -m;
  };
  const dirTables = ["btc", "eth", "bnb", "sol"].flatMap((s) => ["1h", "4h"].map((h) => table(`${s}-dir-${h}`)));
  const seen = new Set<string>();
  for (const t of dirTables) for (const r of t.rows) {
    const v = kataVerdictFields(t, pr(t, lean(r), undefined, { predictor_id: pidOf(t) }), 1);
    assert.equal(v.cell_key, r.cell_key);
    assert.deepEqual([v.policy_row_sha256, v.n_calib, v.alpha, v.scores_sha256, v.method], [sha(canonicalJson(r)), r.n, 0.45, r.scores_sha256, "risk-control"]);
    const want = r.status === "region" ? [[r.side], 0, false, "covered"] : r.status === "under_calib" ? [null, null, true, "under_calib"] : [["up", "down"], 1, true, `calib_${r.status}`];
    assert.deepEqual([v.region?.kind === "set" ? v.region.labels : v.region, v.qhat, v.abstain, v.reason], want, r.cell_key);
    seen.add(r.status);
  }
  assert.deepEqual([...seen].sort(), ["region", "silence", "under_calib", "vetoed"]);
  // A served {side} with tau 0 follows the served set rule (|C| > tau): set_too_large.
  const rt = dirTables.find((t) => t.rows.some((r) => r.status === "region")) ?? assert.fail("no region row");
  const reg = rt.rows.find((r) => r.status === "region") ?? assert.fail("no region row");
  const v0 = kataVerdictFields(rt, pr(rt, lean(reg)), 0);
  assert.deepEqual([v0.abstain, v0.reason], [true, "set_too_large"]);
  // retired (report-and-retire, after deployment): {up, down}, qhat 1, calib_retired; abstain on every calib_* reason (C-4, pure form).
  const ret = { ...rt, rows: rt.rows.map((r) => (r === reg ? { ...r, status: "retired" as const, status_reason: "retired: live:1", retire: { cause: "live:1", k_test: 9, n_test: 9, u_test: "1" } } : r)) };
  assert.deepEqual(Object.values(kataVerdictFields(ret, pr(rt, lean(reg)), 1)).slice(3, 9), [{ kind: "set", labels: ["up", "down"], label_schema: "up|down" }, 1, "score", null, true, "calib_retired"]);
  // Band rows: [0, h*] inside the support (bounds included), out_of_support outside, calib_* and under_calib give no region.
  const bands = ["btc", "eth", "bnb", "sol"].flatMap((s) => ["range", "mae-down", "mae-up"].flatMap((f) => ["1h", "4h"].map((h) => table(`${s}-${f}-${h}`))));
  const kinds = new Set<string>();
  for (const t of bands) for (const r of t.rows) {
    const s = r.calib_support ?? assert.fail("no support");
    for (const y of [s.min, s.max, (s.min + s.max) / 2]) {
      const v = kataVerdictFields(t, pr(t, y, undefined, { predictor_id: pidOf(t) }), 1);
      assert.deepEqual([v.cell_key, v.scale, v.qhat_unit, v.policy_row_sha256], [`${pidOf(t)}/b0`, y, "scale", sha(canonicalJson(r))]);
      if (r.status === "region") {
        const band = v.region?.kind === "interval" ? v.region : assert.fail("no band");
        assert.ok(band.hi / y <= (r.qhat ?? NaN) && next(band.hi, 1) / y > (r.qhat ?? NaN), "h* is the largest double with fl(h / sigma) <= qhat");
        assert.deepEqual([band.lo, v.qhat, v.abstain, v.reason], [0, r.qhat, false, "covered"]);
      } else assert.deepEqual([v.region, v.qhat, v.abstain, v.reason], [null, null, true, r.status === "under_calib" ? "under_calib" : `calib_${r.status}`]);
      kinds.add(`${r.status}:${v.reason}`);
    }
    for (const y of [next(s.min, -1), next(s.max, 1)]) assert.deepEqual([kataVerdictFields(t, pr(t, y, undefined, { predictor_id: pidOf(t) }), 1).reason], ["out_of_support"]);
  }
  assert.ok(kinds.has("region:covered") && kinds.has("silence:calib_silence"), [...kinds].join());
});

// killer: apps/harness/src/policy-served.ts:23 CONST "[liq, LIQ_POLICY, \"ascending\"]" -> "[liq, LIQ_POLICY, \"time\"]"
test("kata_served_tables_digests", () => {
  const texts: ServedTableTexts = { classText: (c) => `class text of ${c}`, marginal: () => ({ registry_file: "calibration.ts", registry_sha256: "ab".repeat(32), generator: "recorder", text: "row text" }) };
  const served = servedPolicyTables(texts);
  const names = served.map((s) => s.task_class);
  assert.equal(served.length, 35);
  assert.deepEqual(names, [...names].sort());
  assert.deepEqual(served.map((s) => s.table.rows.length).reduce((a, n) => a + n, 0), 1 + UKEMI_LIQ_COMMITTED.length);
  for (const s of served) {
    assert.equal(s.policy_table_sha256, sha(canonicalJson(s.table)));
    assert.equal(s.table.rows.length > 0, s.task_class === "stable-run-velocity-24h" || s.task_class === "liquidation-eligible-coverage", s.task_class);
  }
  assert.deepEqual(servedPolicyTables(texts), served, "deterministic");
  // Block D (ADR-CM dated line (11), founder's go Q-D1): the pin follows the REAL served tables, published = served. The
  // 35 [class, policy_table_sha256] pairs of SERVED_POLICY_TABLES, digested; the per-class values are in
  // docs/G0-bloc-d-2-empreintes.md (Z-3 line of block D).
  const real = (gate as Record<string, unknown>)["SERVED_POLICY_TABLES"] as readonly { task_class: string; policy_table_sha256: string }[] | undefined;
  assert.ok(real !== undefined, "gate.ts serves SERVED_POLICY_TABLES");
  assert.equal(real.length, 35);
  assert.equal(sha(canonicalJson(real.map((s) => [s.task_class, s.policy_table_sha256]))), "8da5dd421260d96e4b3dafa48733185b377df64261480aa92cdbeec9b462d2eb");
  assert.equal(real.find((s) => s.task_class === "btc-dir-1h")?.policy_table_sha256, "c04ae2921430968857350fd2fa663d0931f92c1a9bfeb595a7d341d3a02cc6e1", "btc-dir-1h, empty, its class text");
  // Spec section 10: the table of one class does not depend on another class.
  const moved = servedPolicyTables({ ...texts, classText: (c) => (c === "eth-range-1h" ? "other text" : texts.classText(c)) });
  assert.deepEqual(served.filter((s, i) => s.policy_table_sha256 !== moved[i]?.policy_table_sha256).map((s) => s.task_class), ["eth-range-1h"]);
});

// killer: apps/harness/src/policy-guard.ts:124 SDL "want(new Set(rs.map((r) => r.bucket)).size === 3" -> ""
test("guard_thresholds_agree_per_side", () => {
  const refused = (edit: (cells: Cell[]) => void): string => code(() => table("sol-dir-1h", edit));
  const upB2 = (c: Cell): boolean => c.taskClass === "sol-dir-1h" && String(c.key).endsWith("/up-b2");
  assert.equal(refused(() => undefined), "ok");
  assert.match(refused((cells) => cells.filter(upB2).forEach((c) => (c.thresholds = { t1: "0.11", t2: "0.5" }))), /side .*thresholds that differ.*\(C-8\)/);
  assert.match(refused((cells) => cells.filter(upB2).forEach((c) => (c.thresholds = { t1: c.thresholds?.t1 ?? "", t2: "0.69" }))), /side .*thresholds that differ.*\(C-8\)/, "t2 alone");
  const dropped = refused((cells) => cells.splice(cells.findIndex(upB2), 1));
  assert.match(dropped, /without its three buckets/);
});

const SRC = join(dirname(fileURLToPath(import.meta.url)), "..", "src");
/** The served import graph: the modules reached by a relative import from the entry points and the tools. */
function servedModules(): Set<string> {
  const seen = new Set<string>();
  const walk = (file: string): void => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const m of readFileSync(file, "utf8").matchAll(/(?:from|import)\s*\(?\s*"(\.{1,2}\/[^"]+)"/g)) walk(join(dirname(file), m[1] as string));
  };
  for (const f of ["server.ts", "http.ts", "openapi.ts", "schema-projection.ts", ...readdirSync(join(SRC, "tools")).map((t) => `tools/${t}`)]) walk(join(SRC, f));
  return seen;
}

// Block D (lot D-2): tools/gate.ts imports the kata path, so kata-path.ts and policy-classes.ts are served; the import
// guard (policy-guard.ts) stays outside the served graph.
// killer: apps/harness/src/tools/gate.ts:62 CONST "\"../kata-path.ts\";" -> "\"../kata-path.ts?served\";"
test("kata_path_is_served", () => {
  const seen = servedModules();
  assert.ok(seen.size > 6 && seen.has(join(SRC, "tools/gate.ts")));
  for (const f of ["kata-path.ts", "policy-classes.ts", "policy-served.ts"]) assert.ok(seen.has(join(SRC, f)), `${f} is served`);
  assert.ok(!seen.has(join(SRC, "policy-guard.ts")), "policy-guard.ts is not served");
});

/** C-3 (delegated decision CM-4b): the codes with no served thrower yet, exact; none since block D (lot D-2), whose served
 *  kata path throws the 6 kata codes together. */
const PENDING: readonly string[] = [];

// killer: apps/harness/src/tools/gate.ts:966 CONST "\"task_class_retired\"" -> "\"task_class_unknown\""
test("every_listed_code_has_a_served_thrower_or_is_pending", () => {
  // Static: a code has a thrower when its literal is in a served module (default codes of the other tools included);
  // output_invalid has its 500 path. The G7 of the last lot of block D adds the dynamic form (a served request per code).
  const text = [...servedModules()].map((f) => codeLines(readFileSync(f, "utf8"))).join("\n");
  const unthrown = TOOL_ERROR_CODES.filter((c) => c !== "output_invalid" && !text.includes(`"${c}"`));
  assert.deepEqual(unthrown, PENDING);
  assert.ok(servedModules().has(join(SRC, "kata-path.ts")) && readFileSync(join(SRC, "kata-path.ts"), "utf8").includes("\"kata_key_invalid\""), "the kata codes are thrown in the served graph");
});

// killer: apps/harness/test/helpers/code-lines.ts:5 CONST "!COMMENT_LINE.test(l)" -> "true"
test("thrower_ratchet_ignores_comment_lines", () => {
  // G2 m-4: a literal in a comment line is no thrower; a trailing comment on a code line stays (the code before it counts).
  const lines = ['throw new E("a");', '// "b"', '  /* "c"', '   * "d"', '   */', '  x("e"); // "f"'];
  assert.equal(codeLines(lines.join("\n")), [lines[0], lines[5]].join("\n"));
});
