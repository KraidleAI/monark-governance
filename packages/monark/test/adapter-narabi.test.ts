// packages/monark/test/adapter-narabi.test.ts — ADR-M008 D4/D5 (Narabi F1).
//
// Exercises `fromAttestedFlow` on hand-built AttestedFlow inputs. ANTI-CIRCULARITY: the derived velocity
// is confronted with an INDEPENDENT hand computation (burns/supply/Δ), never with the adapter's own
// arithmetic; the emitted Prediction is validated against the FROZEN schema (ajv), not the TS mirror.
// Tests:
//   - narabi_flow_maps_to_a_closed_prediction    : output.prediction |= prediction.schema.json (ajv).
//   - narabi_velocity_recomputable_by_hand        : v_t = burns/(supply·Δ), per-hour, independent oracle.
//   - narabi_window_scales_velocity_per_hour      : 1h vs 24h differ by exactly 24x (unit is per-hour).
//   - narabi_is_deterministic                     : same input twice => byte-identical output.
//   - narabi_fails_closed                         : supply=0, bad block range, unknown key/window/residual, out-of-range instant.
//   - narabi_maps_the_run_regime                  : burns > CLOSING supply is a valid severity signal, NOT a refusal (C-1).
//   - narabi_instant_boundary_...                 : the last 4-digit-year instant maps to a schema-valid produced_at (R-DELTA-1).
//   - narabi_output_carries_honesty_label         : the K-1 label (an overclaim reddens the label check).
//   - narabi_adapter_is_pure_no_io_no_clock       : K-8 mirror — no fs/net/child_process/fetch/env/clock.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  fromAttestedFlow,
  isNarabiError,
  NARABI_TASK_CLASS,
  NARABI_PREDICTOR_ID,
  NARABI_LABEL,
} from "../src/adapter-narabi.ts";
import type { NarabiOutput } from "../src/adapter-narabi.ts";
import type { AttestedFlow } from "@monark/contracts";
import type { Ajv2020 as Ajv2020Instance, Options, SchemaObject, ValidateFunction } from "ajv/dist/2020.js";
import type { FormatsPlugin } from "ajv-formats";

type Ajv2020Ctor = new (opts?: Options) => Ajv2020Instance;
const SCHEMAS = fileURLToPath(new URL("../../../schemas", import.meta.url));
const require = createRequire(import.meta.url);
const ajvExport = require("ajv/dist/2020") as { default?: Ajv2020Ctor };
const Ajv2020: Ajv2020Ctor = ajvExport.default ?? (ajvExport as unknown as Ajv2020Ctor);
const addFormatsExport = require("ajv-formats") as { default?: FormatsPlugin };
const addFormats: FormatsPlugin = addFormatsExport.default ?? (addFormatsExport as unknown as FormatsPlugin);

function loadSchema(name: string): SchemaObject {
  return JSON.parse(readFileSync(join(SCHEMAS, name), "utf8")) as SchemaObject;
}
const ajv = new Ajv2020({ allErrors: true, strict: true, allowUnionTypes: true });
addFormats(ajv);
const validatePrediction: ValidateFunction = ajv.compile(loadSchema("prediction.schema.json"));

const HASH = "b".repeat(64);
const INSTANT = 1_756_000_000;

/** A valid AttestedFlow; overrides merge shallowly (flow is replaced wholesale when provided). */
function flow(over: Partial<AttestedFlow> = {}, flowOver: Partial<AttestedFlow["flow"]> = {}): AttestedFlow {
  return {
    schema_version: "1.0.0",
    subject: "msUSD",
    attestor: [{ identity: "issuer-por", key: "deadbeef" }],
    source: { chain: "ethereum", issuer: "0x00000000000000000000000000000000000000aa" },
    window: "24h",
    flow: {
      burns: "1000000000000000000000", // 1_000 * 1e18
      mints: "0",
      supply: "1000000000000000000000000", // 1_000_000 * 1e18
      from_block: 20_000_000,
      to_block: 20_007_200,
      ...flowOver,
    },
    residual: ["ap_capacity_unknown"],
    transport: "rpc+por",
    utterance: { hash: HASH },
    observed_at: { clock: "transport", instant: INSTANT },
    octets_recalcules: true,
    verifier_revision: "narabi-adapter@abc123",
    ...over,
  };
}

function adapt(f: AttestedFlow): NarabiOutput {
  const out = fromAttestedFlow(f);
  assert.ok(!isNarabiError(out), `fromAttestedFlow unexpectedly refused: ${JSON.stringify(out)}`);
  return out;
}

test("narabi_flow_maps_to_a_closed_prediction (frozen schema, ajv)", () => {
  const out = adapt(flow());
  assert.equal(validatePrediction(out.prediction), true, JSON.stringify(validatePrediction.errors));
  assert.equal(out.prediction.task_class, NARABI_TASK_CLASS);
  assert.equal(out.prediction.predictor_id, NARABI_PREDICTOR_ID);
  assert.equal(typeof out.prediction.yhat, "number");
  // features_digest binds the Prediction to the exact flow observation (F2 replay anchor, validateur #8).
  assert.equal(out.prediction.features_digest, HASH);
  // produced_at is DERIVED from the carried instant — round-trips back to it (deterministic, no clock read).
  assert.equal(Math.round(new Date(out.prediction.produced_at).getTime() / 1000), INSTANT);
});

test("narabi_velocity_recomputable_by_hand (anti-circularity)", () => {
  // burns = 1_000 tokens, supply = 1_000_000 tokens, window = 24h.
  // ratio = 1_000 / 1_000_000 = 0.001 ; per-hour = 0.001 / 24.
  const expectedPerHour = 0.001 / 24;
  const out = adapt(flow());
  assert.ok(Math.abs(out.provenance.velocity_per_hour - expectedPerHour) < 1e-15);
  assert.equal(out.prediction.yhat, out.provenance.velocity_per_hour); // persistence: v̂ = v_t
});

test("narabi_window_scales_velocity_per_hour (unit is per-hour, homogeneous)", () => {
  const h24 = adapt(flow({ window: "24h" }));
  const h1 = adapt(flow({ window: "1h" }));
  // Same raw counts, but a 1h window is 24x the per-hour velocity of a 24h window.
  assert.ok(Math.abs(h1.provenance.velocity_per_hour - h24.provenance.velocity_per_hour * 24) < 1e-15);
});

test("narabi_is_deterministic (same input => byte-identical output)", () => {
  assert.deepEqual(adapt(flow()), adapt(flow()));
});

test("narabi_fails_closed with a named reason (never a partial Prediction)", () => {
  const zeroSupply = fromAttestedFlow(flow({}, { supply: "0" }));
  assert.ok(isNarabiError(zeroSupply) && zeroSupply.reason === "non_evaluable");

  const badRange = fromAttestedFlow(flow({}, { from_block: 20_007_200, to_block: 20_000_000 }));
  assert.ok(isNarabiError(badRange) && badRange.reason === "binding_broken");

  // An unknown top-level key is rejected by the closed-contract guard (fail-closed). (The forbidden-key
  // rejection specifically is covered by the contracts forbidden-keys test, which enumerates them.)
  const unknownKey = fromAttestedFlow({ ...flow(), foo: 1 } as unknown as AttestedFlow);
  assert.ok(isNarabiError(unknownKey) && unknownKey.reason === "binding_broken");

  // VALUE guards (G2 R1): an out-of-enum window would otherwise yield WINDOW_HOURS[w]=undefined ⇒ a NaN
  // forecast serialized as null (an INVALID Prediction), not a refusal. Must fail-closed.
  const badWindow = fromAttestedFlow({ ...flow(), window: "7d" } as unknown as AttestedFlow);
  assert.ok(isNarabiError(badWindow) && badWindow.reason === "binding_broken", "an out-of-enum window must be binding_broken, not a NaN-yhat success");

  // An out-of-enum residual must be a NAMED refusal, never accepted silently (ADR-M008 D3).
  const badResidual = fromAttestedFlow({ ...flow(), residual: ["bogus_residual"] } as unknown as AttestedFlow);
  assert.ok(isNarabiError(badResidual) && badResidual.reason === "binding_broken", "an out-of-enum residual must be binding_broken (D3, never silent)");

  // C-2 / R-DELTA-1: instant is bounded on the SCHEMA-valid range (produced_at is RFC-3339, 4-digit year),
  // not merely the Date-representable range. (a) an instant past the Date limit would THROW without the
  // guard; (b) an instant in [year 10000, Date limit] returns a schema-INVALID produced_at as SUCCESS
  // without the tighter bound (the R-DELTA-1 hole). Both must be NAMED refusals.
  const throwInstant = fromAttestedFlow(flow({ observed_at: { clock: "transport", instant: 10_000_000_000_000 } }));
  assert.ok(isNarabiError(throwInstant) && throwInstant.reason === "binding_broken", "an instant past the Date limit must be binding_broken, never an uncaught throw");
  const year10000 = fromAttestedFlow(flow({ observed_at: { clock: "transport", instant: 300_000_000_000 } }));
  assert.ok(isNarabiError(year10000) && year10000.reason === "binding_broken", "an instant giving a >4-digit year must be binding_broken (produced_at would be schema-invalid)");
});

// Test — R-DELTA-1 boundary: the LAST schema-valid instant (9999-12-31T23:59:59Z) still MAPS, and its
// produced_at validates against the frozen prediction schema (ajv). Mutant: a bound one second too loose
// ⇒ the emitted produced_at is the "+010000" extended form ⇒ this ajv assertion reds.
test("narabi_instant_boundary_maps_to_schema_valid_produced_at (R-DELTA-1)", () => {
  const out = adapt(flow({ observed_at: { clock: "transport", instant: 253_402_300_799 } }));
  assert.equal(out.prediction.produced_at, "9999-12-31T23:59:59.000Z");
  assert.equal(validatePrediction(out.prediction), true, JSON.stringify(validatePrediction.errors));
});

// Test — C-1: `supply` is the CLOSING supply (D2), so during a run burns can EXCEED it. The adapter must
// MAP this (the severity regime it exists to detect), not reject it as "impossible flow". Mutant: re-add
// the `burns > supply` guard ⇒ this reds (the run window is refused).
test("narabi_maps_the_run_regime_burns_over_closing_supply (C-1)", () => {
  // open 1000, burn 600, mint 0, CLOSE 400 (D2 supply = close). burns(600) > supply_close(400).
  const out = adapt(flow({ window: "24h" }, { burns: "600000000000000000000", mints: "0", supply: "400000000000000000000" }));
  // v_t = burns/(supply_close·Δ) = (600/400)/24 = 1.5/24. Ratio ABOVE 1 is expected, never an error.
  const expected = 1.5 / 24;
  assert.ok(Math.abs(out.provenance.velocity_per_hour - expected) < 1e-12, "the run-regime velocity is burns/closing-supply/Δ (may exceed 1)");
  assert.equal(out.prediction.yhat, out.provenance.velocity_per_hour);
});

test("narabi_output_carries_honesty_label (K-1, 3rd carrier)", () => {
  const out = adapt(flow());
  assert.equal(out.label, NARABI_LABEL);
  assert.match(out.label, /not a peg score/i);
  assert.match(out.label, /not advice/i);
  // No overclaim: never a probability-of-being-right, never a guaranteed/certified claim.
  assert.doesNotMatch(out.label, /probability|guarantee|certified|accurate/i);
});

// Test — the adapter is PURE (validateur correction #7): it lives OUTSIDE the registry.test.ts K-8 scan
// (apps/harness/src/tools), so its no-I/O guarantee gets its OWN oracle. Same motif list as
// registry.test.ts:31-37 (node fs/net/child_process import, fetch, process.env write) PLUS argless clock
// reads (Date.now / new Date()). An argument-ed `new Date(x)` is EXEMPT: a pure transform of the carried
// instant, not a clock read. Mutant: any I/O or a clock read in the adapter ⇒ red.
test("narabi_adapter_is_pure_no_io_no_clock (K-8 mirror)", () => {
  const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../src/adapter-narabi.ts"), "utf8");
  const FORBIDDEN: { re: RegExp; why: string }[] = [
    { re: /["']node:fs["']/, why: "node fs import" },
    { re: /["']node:net["']/, why: "node net import" },
    { re: /["']node:child_process["']/, why: "node child_process import" },
    { re: /\bfetch\s*\(/, why: "fetch call" },
    { re: /\bprocess\.env(?:\.[A-Za-z_]\w*|\[[^\]]+\])\s*=(?!=)/, why: "process.env write" },
    { re: /\bDate\.now\s*\(/, why: "clock read (Date.now)" },
    { re: /\bnew Date\s*\(\s*\)/, why: "clock read (argless new Date)" },
  ];
  for (const { re, why } of FORBIDDEN) {
    assert.ok(!re.test(src), `adapter-narabi.ts must be pure: ${why}`);
  }
});
