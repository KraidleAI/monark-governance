/**
 * Harness - served hardening, lot CM-2b (chantier moteur; audit P3 points S-12, S-1 and E-7).
 * Oracle: docs/adr/ADR-CM-chantier-moteur-audit-P3.md section 5 B-5, B-2 (narrowed by the amendment "nuit, 2") and B-7;
 * plan docs/G0-lot-cm-2b.md. btc-dir-15m is retired (a named 400, the name still reserved against BYO); the committed
 * USDe key imposes its calibration's alpha 0.1 and nMin 50 (F-7 rows, liq unchanged); the USDe served text states that
 * each band edge is the nearest double of yhat -/+ qhat (at most half an ulp of the edge away), the band unchanged.
 * New names are read through a dynamic import or literals, so the base loads this file and reddens by assertion.
 * Each test names its killer on the line above it.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import type { Prediction } from "@monark/contracts";
import { splitQuantile } from "@monark/hikae";
import { runGate, HarnessToolError, GATE_TOOL_DESCRIPTION, STABLE_RUN_COMMITTED_SENTENCE, type HarnessParams } from "../src/tools/gate.ts";
import { handleJsonMirror } from "../src/http.ts";
import { createHarnessHandler } from "../src/server.ts";
import { USDE_STABLE_RUN_CALIB, USDE_STABLE_RUN_PREDICTOR_ID } from "../src/calibration.ts";
import { HARNESS_TOOLS } from "../src/tools/registry.ts";
import { runAttest } from "../src/tools/attest.ts";
import { ATTESTATION_BINDING, BINANCE_BTCUSDT_TICKER_URL } from "../src/attestation-binding.ts";
import { readFileSync } from "node:fs";

const PARAMS: HarnessParams = { remainingBudget: 0.1, bFloor: 0, tau: 1, tauInterval: 1, alpha: 0.1, nMin: 50, intent: 0, tool: "perps_order_preview", clockOpen: true };
const AT = "2026-09-04T00:00:00Z";
const USDE = "stable-run-velocity-24h";
const LIQ = "liquidation-eligible-coverage";
const RETIRED_MESSAGE =
  "task_class 'btc-dir-15m' is retired (ADR 0005, decided 2026-09-30): it is no longer served; the name stays reserved against BYO";

function pred(taskClass: string, yhat: string | number, predictorId: string): Prediction {
  return { schema_version: "1.0.0", task_class: taskClass, yhat, predictor_id: predictorId, produced_at: AT };
}

function refused(fn: () => unknown, at: string): { code: unknown; message: string } {
  try {
    fn();
  } catch (e) {
    assert.ok(e instanceof HarnessToolError, `${at}: a HarnessToolError, got ${String(e)}`);
    return { code: (e as { code?: unknown }).code, message: e.message };
  }
  assert.fail(`${at}: expected a named refusal (400), the gate decided`);
}

type Obj = Record<string, unknown>;
async function mcpGate(args: Obj): Promise<Obj> {
  const res = await createHarnessHandler().fetch(
    new Request("http://mcp.monarkgate.tech/", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "gate", arguments: args } }),
    }),
  );
  const raw = await res.text();
  const data = raw.split(/\r?\n/).find((l) => l.startsWith("data:"));
  const reply = JSON.parse(data === undefined ? raw : data.slice("data:".length).trim()) as { result?: Obj };
  assert.ok(reply.result !== undefined, "a tools/call result");
  return reply.result;
}

async function http(body: unknown): Promise<{ status: number; text: string }> {
  const res = await handleJsonMirror(new Request("http://api.monarkgate.tech/gate", { method: "POST", body: JSON.stringify(body) }));
  return { status: res.status, text: await res.text() };
}

// Test R-1 (F2P, B-5): btc-dir-15m without BYO is a 400 task_class_retired (direct, HTTP, MCP); its BYO refusals are
// unchanged byte for byte; the known: list and the description no longer serve it.
// killer: apps/harness/src/tools/gate.ts:927 SDL "throw new HarnessToolError(BTC_DIR_RETIRED_MESSAGE, \"task_class_retired\");" -> ""
test("btc_dir_is_retired_with_a_named_400", async () => {
  const btc = pred("btc-dir-15m", "up", "internal:momentum-4c");
  for (const p of [PARAMS, { ...PARAMS, alpha: 0.0464, intent: "up" }]) {
    const r = refused(() => runGate(btc, p), "btc-dir direct");
    assert.equal(r.code, "task_class_retired", "code task_class_retired");
    assert.equal(r.message, RETIRED_MESSAGE, "the retirement message names ADR 0005");
  }
  const h = await http({ prediction: btc, params: PARAMS });
  assert.equal(h.status, 400, "HTTP 400");
  assert.equal(h.text, JSON.stringify({ error: "tool_error", operation: "gate", message: RETIRED_MESSAGE, code: "task_class_retired" }), "HTTP body");
  const m = await mcpGate({ prediction: btc, params: PARAMS });
  assert.equal(m["isError"], true, "MCP tool error");
  assert.deepEqual(m["content"], [{ type: "text", text: RETIRED_MESSAGE }], "MCP text");
  assert.deepEqual(m["_meta"], { "monarkgate.tech/error_code": "task_class_retired" }, "MCP code");

  // The name stays reserved against BYO: the exact guard keeps its message byte for byte, the look-alike guard holds.
  const cal = { ...PARAMS, nMin: 5, calibration: { scores: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], mode: "interval" as const } };
  const exact = refused(() => runGate(pred("btc-dir-15m", 0, "caller:model"), cal), "BYO on btc-dir");
  assert.equal(exact.code, "byo_overrides_committed");
  assert.equal(exact.message, "calibration must not override the committed (task_class, predictor_id) 'btc-dir-15m' / 'caller:model': use a caller-owned key for BYO (ADR-M007 D7, ADR-M008 A6)");
  assert.equal(refused(() => runGate(pred("BTC-DIR-15M", 0, "caller:model"), cal), "look-alike").code, "byo_lookalike_committed");

  const unknown = refused(() => runGate(pred("nope-class", 1, "x"), PARAMS), "unknown class");
  assert.equal(unknown.message, "unknown task_class 'nope-class' (known: cascade-liquidable-24h, stable-run-velocity-24h, liquidation-eligible-coverage; or supply params.calibration for BYO)");
  assert.ok(!GATE_TOOL_DESCRIPTION.includes("HIKAE S2a instrument"), "the description no longer serves the synthetic btc-dir calibration");
  assert.ok(GATE_TOOL_DESCRIPTION.includes("The class 'btc-dir-15m' is retired and answers a named refusal."), "it names the retirement");
});

// Test R-2 (F2P, B-2): the committed USDe key imposes alpha 0.1 and nMin 50 (named 400s, strict equality); its other
// keys, tau and tauInterval stay the caller's; liq's messages are unchanged; the F-7 rows are data.
// killer: apps/harness/src/class-policy.ts:27 CONST "alpha: 0.1, nMin: 50" -> "alpha: 0.1, nMin: 51"
test("usde_committed_key_imposes_alpha_and_nmin", async () => {
  const usde = pred(USDE, 0.0001, USDE_STABLE_RUN_PREDICTOR_ID);
  const a = refused(() => runGate(usde, { ...PARAMS, alpha: 0.5 }), "USDe alpha 0.5");
  assert.equal(a.code, "policy_alpha_mismatch");
  assert.equal(a.message, `task_class '${USDE}' with predictor_id '${USDE_STABLE_RUN_PREDICTOR_ID}' requires params.alpha = 0.1 (server-imposed for the committed key), got 0.5`);
  const n = refused(() => runGate(usde, { ...PARAMS, nMin: 51 }), "USDe nMin 51");
  assert.equal(n.code, "policy_nmin_mismatch");
  assert.equal(n.message, `task_class '${USDE}' with predictor_id '${USDE_STABLE_RUN_PREDICTOR_ID}' requires params.nMin = 50 (server-imposed for the committed key), got 51`);
  assert.equal(refused(() => runGate(usde, { ...PARAMS, alpha: 0.10000000000000002 }), "USDe alpha + 1 ulp").code, "policy_alpha_mismatch", "strict equality");
  // Order (G0, liq order kept): alpha is checked before nMin, for liq and for USDe.
  assert.equal(refused(() => runGate(usde, { ...PARAMS, alpha: 0.5, nMin: 51 }), "USDe both wrong").code, "policy_alpha_mismatch", "USDe: alpha first");
  assert.equal(refused(() => runGate(pred(LIQ, 5000, "x"), { ...PARAMS, alpha: 0.1, nMin: 50, intent: 1 }), "liq both wrong").code, "policy_alpha_mismatch", "liq: alpha first");
  const h = await http({ prediction: usde, params: { ...PARAMS, alpha: 0.5 } });
  assert.equal(h.status, 400, "HTTP 400");
  assert.match(h.text, /"code":"policy_alpha_mismatch"/, "HTTP code");

  // Imposed values decide; tau and tauInterval stay the caller's (interval class).
  assert.equal(runGate(usde, PARAMS).verdict.reason, "covered", "alpha 0.1, nMin 50: covered");
  assert.equal(runGate(usde, { ...PARAMS, tau: 7, tauInterval: 1e-9 }).action, "defer", "a narrow caller tauInterval defers");
  // Other USDe-class keys keep the caller's values (under_calib).
  assert.equal(runGate(pred(USDE, 0.0001, "other:population"), { ...PARAMS, alpha: 0.5, nMin: 7 }).verdict.reason, "under_calib", "other key: caller's alpha");
  // liq unchanged, message byte for byte.
  assert.equal(
    refused(() => runGate(pred(LIQ, 5000, "x"), { ...PARAMS, alpha: 0.1, nMin: 100, intent: 1 }), "liq alpha").message,
    "task_class 'liquidation-eligible-coverage' requires params.alpha = 0.01 (server-imposed for the committed class), got 0.1",
  );
  // The F-7 rows (a data module under src/, no clock, no I/O).
  const mod = (await import("../src/class-policy.ts").catch(() => undefined)) as { CLASS_POLICY?: unknown } | undefined;
  assert.deepEqual(mod?.CLASS_POLICY, [
    { taskClass: LIQ, predictorId: null, alpha: 0.01, nMin: 100 },
    { taskClass: USDE, predictorId: USDE_STABLE_RUN_PREDICTOR_ID, alpha: 0.1, nMin: 50 },
  ], "the F-7 rows");
});

/** A double as an exact integer multiple of 2^-1074, and its ulp in the same unit. */
function scaled(x: number): { n: bigint; ulp: bigint } {
  const bits = new BigUint64Array(new Float64Array([x]).buffer)[0] ?? 0n;
  const neg = bits >> 63n === 1n;
  const e = (bits >> 52n) & 0x7ffn;
  const f = bits & ((1n << 52n) - 1n);
  const m = e === 0n ? f : f | (1n << 52n);
  const shift = e === 0n ? 0n : e - 1n;
  const n = m << shift;
  return { n: neg ? -n : n, ulp: e === 0n ? 1n : 1n << (e - 1n) };
}

// Test R-3 (F2P, B-7): the USDe served text states the half-ulp edge; on a grid of yhat each served edge is the nearest
// double of the exact yhat -/+ qhat (|edge - exact| <= ulp(edge)/2, exact rational in BigInt); the band and the
// decisions are byte-identical to the base (replay digest measured at f3b330c).
// killer: apps/harness/src/tools/gate.ts:129 CONST "half a unit in the last place" -> "one unit in the last place"
test("usde_band_edges_within_half_ulp_stated_and_band_unchanged", () => {
  const clause =
    "each band edge is yhat - qhat or yhat + qhat rounded to the nearest double, so it can differ from the exact edge " +
    "by up to half a unit in the last place of that edge; the band is not widened for it";
  assert.ok(STABLE_RUN_COMMITTED_SENTENCE.includes(clause), "the USDe served text states the half-ulp edge");
  assert.ok(GATE_TOOL_DESCRIPTION.includes(clause), "the description states it too");

  const split = splitQuantile(USDE_STABLE_RUN_CALIB, 0.1, 50);
  assert.ok(!("reason" in split), "alpha 0.1 calibrates");
  const q = scaled(split.qhat).n;
  const grid = [0, 1e-12, 1e-6, 0.0000416, 0.0001, 0.00123, -0.0003, 0.1, 1, 12345.678, 3e-4, 7.5e-5];
  let checked = 0;
  for (const yhat of grid) {
    const d = runGate(pred(USDE, yhat, USDE_STABLE_RUN_PREDICTOR_ID), PARAMS);
    const r = d.verdict.region;
    assert.ok(r.kind === "interval", `${String(yhat)}: an interval band`);
    const y = scaled(yhat).n;
    for (const [edge, exact] of [[r.lo, y - q], [r.hi, y + q]] as const) {
      const s = scaled(edge);
      const gap = s.n - exact;
      assert.ok(2n * (gap < 0n ? -gap : gap) <= s.ulp, `${String(yhat)}: edge ${String(edge)} within half an ulp of the exact edge`);
      checked++;
    }
  }
  assert.equal(checked, 2 * grid.length, "every edge checked");
  const replay = grid.map((yhat) => JSON.stringify(runGate(pred(USDE, yhat, USDE_STABLE_RUN_PREDICTOR_ID), { ...PARAMS, tool: "t" }))).join("\n");
  assert.equal(createHash("sha256").update(replay).digest("hex"), "06caef6b3e9e4756ae98a6f0793df02c35059c29f74bb0c868cdf29997214258", "decisions byte-identical to the base");
});

// Test R-4 (F2P, B-5; moved from gate.test.ts gate_attested_concordant_files_residual, ADR-M017 D2(iii)/D4(3)): the
// committed Binance witness is concordant with btc-dir-15m only; since the class is retired, a concordant attested
// passes the consistency guard (no attested_inconsistent) and meets the retirement (400 task_class_retired), through the
// registry run(). No served class has a committed subject, so the residual seam is not reached on the served surface
// (dormant chain, ADR-CM amendment "nuit, 3"). The witness pin stays; the registry still threads env.attested.
// killer: apps/harness/src/tools/gate.ts:927 CONST "\"task_class_retired\"" -> "\"task_class_unknown\""
test("attested_concordant_meets_the_btc_dir_retirement", () => {
  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(gateTool, "the gate tool is registered");
  const price = runAttest().price;
  assert.equal(price.subject, BINANCE_BTCUSDT_TICKER_URL, "the committed witness subject is the Binance BTCUSDT URL");
  assert.deepEqual(price.residual, ["A(notary-neutrality)", "A(self-attestation)", "A(transport-check-delegated)"], "the committed witness residual");
  const btc = pred("btc-dir-15m", "up", "internal:momentum-4c");
  for (const env of [{ prediction: btc, params: PARAMS, attested: price }, { prediction: btc, params: PARAMS }]) {
    assert.throws(
      () => gateTool.run(env),
      (e: unknown) => e instanceof HarnessToolError && (e as { code?: unknown }).code === "task_class_retired",
      "btc-dir-15m, with or without a concordant attested, is retired",
    );
  }
  // The registry still threads env.attested into runGate (a run() that dropped it would decide here): the same witness
  // on the USDe key, whose class has no committed subject, is a 400 attested_inconsistent.
  assert.throws(
    () => gateTool.run({ prediction: pred(USDE, 0.0001, USDE_STABLE_RUN_PREDICTOR_ID), params: PARAMS, attested: price }),
    (e: unknown) => e instanceof HarnessToolError && (e as { code?: unknown }).code === "attested_inconsistent",
    "a discordant attested through the registry run() is a 400 attested_inconsistent",
  );
});

// C-2 of MONARK's diff check of CM-2b (founder's decision, 2026-10-04: tell the truth in the description). The only
// committed attestation subject belongs to the retired btc-dir-15m, so every served path refuses a caller-carried
// `attested`; the served description (tools/list and /openapi.json) and the harness README say so. The sentence is a
// literal here so the base loads this file. The table is read too: a served class gaining a subject reddens this test.
// killer: apps/harness/src/attestation-binding.ts:65 CONST "so any `attested` is refused" -> "so any `attested` is accepted"
test("served_description_says_no_served_class_takes_attested", async () => {
  const SENTENCE = "No served class has a committed attestation subject (the retired 'btc-dir-15m' held the only one), so any `attested` is refused.";
  const gateTool = HARNESS_TOOLS.find((t) => t.name === "gate");
  assert.ok(gateTool?.description.includes(SENTENCE), "tools/list serves the sentence");
  const oa = (await (await handleJsonMirror(new Request("http://api.monarkgate.tech/openapi.json"))).json()) as { paths: Record<string, { post: { description: string } }> };
  assert.ok(oa.paths["/gate"]?.post.description.includes(SENTENCE), "/openapi.json serves the sentence");
  assert.equal(GATE_TOOL_DESCRIPTION.split(SENTENCE).length, 2, "the description carries the sentence once");
  const price = runAttest().price;
  const withSubject = [...ATTESTATION_BINDING].filter(([, subjects]) => subjects.length > 0).map(([c]) => c);
  assert.deepEqual(withSubject, ["btc-dir-15m"], "the retired class holds the only committed subject");
  const codes = [...ATTESTATION_BINDING.keys(), "caller-owned-class"].map((c) => {
    const yhat = c === "btc-dir-15m" ? "up" : 0.0001;
    const id = c === USDE ? USDE_STABLE_RUN_PREDICTOR_ID : "caller:model";
    return `${c} ${String(refused(() => runGate(pred(c, yhat, id), PARAMS, price), c).code)}`;
  });
  assert.deepEqual(codes, [
    "btc-dir-15m task_class_retired",
    "stable-run-velocity-24h attested_inconsistent",
    "cascade-liquidable-24h attested_inconsistent",
    "liquidation-eligible-coverage attested_inconsistent",
    "caller-owned-class attested_inconsistent",
  ], "the committed witness is refused on every class");
  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8").replace(/\s+/g, " ");
  assert.ok(readme.includes("No served class has a committed attestation subject (the retired `btc-dir-15m` held the only one), so any `attested` is refused"), "the README says it too");
  assert.ok(!readme.includes("only its `residual` is filed into `verdict.residual`"), "the README no longer presents the residual seam as live");
});
