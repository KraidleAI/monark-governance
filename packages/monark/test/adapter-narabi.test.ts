// packages/monark/test/adapter-narabi.test.ts — ADR-M008 D4/D5 (Narabi F1).
//
// Exercises `fromAttestedFlow` on hand-built AttestedFlow inputs. ANTI-CIRCULARITY: the derived velocity
// is confronted with an INDEPENDENT hand computation — v_t = burns/(S_open·Δ) with S_open = close + burns
// − mints (start-supply, D4) — never with the adapter's own arithmetic; the emitted Prediction is
// validated against the FROZEN schema (ajv), not the TS mirror.
// Tests:
//   - narabi_flow_maps_to_a_closed_prediction    : output.prediction |= prediction.schema.json (ajv).
//   - narabi_velocity_recomputable_by_hand        : v_t = burns/(S_open·Δ), per-hour, independent oracle (pins start-supply).
//   - narabi_window_scales_velocity_per_hour      : 1h vs 24h differ by exactly 24x (unit is per-hour).
//   - narabi_is_deterministic                     : same input twice => byte-identical output.
//   - narabi_fails_closed                         : full-drain maps (v=1/Δ), S_open<=0 non_evaluable, bad range/key/window/residual/instant.
//   - narabi_maps_a_drain_below_burns_as_a_fraction : burns>close = a proper fraction of the opening stock (start-supply), not the odds.
//   - narabi_churn_ratio_above_1_is_mapped_not_rejected : mints>close pushes f>1 (churn), mapped, never rejected.
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
  NARABI_FORMULA,
  narabiPredictorId,
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
  // predictor_id is the committed-calibration KEY `<formula>@<chain>/<token>` (ADR-M008 Amendement bis):
  // the attested population (source.chain + subject) copied verbatim, canonicalized, into the key.
  assert.equal(out.prediction.predictor_id, narabiPredictorId("ethereum", "msUSD"));
  assert.equal(out.prediction.predictor_id, "narabi:persistence-v2@ethereum/msusd");
  assert.ok(out.prediction.predictor_id.startsWith(`${NARABI_FORMULA}@`), "the key keeps the formula segment then appends the population");
  assert.equal(typeof out.prediction.yhat, "number");
  // features_digest binds the Prediction to the exact flow observation (F2 replay anchor, validateur #8).
  assert.equal(out.prediction.features_digest, HASH);
  // produced_at is DERIVED from the carried instant — round-trips back to it (deterministic, no clock read).
  assert.equal(Math.round(new Date(out.prediction.produced_at).getTime() / 1000), INSTANT);
});

// Test — the shared KEY function (ADR-M008 Amendement bis): canonicalizes (lowercases hex, C5), keeps the
// formula segment, and rejects the frozen label separator '|' (B-3). The adapter and the harness registry
// derive the key by THIS one function (no duplicated registry). The USDe mainnet key is exact.
test("narabi_predictor_id_key_is_canonical_and_pipe_free (ADR-M008 Amendement bis, A4)", () => {
  // Mixed-case hex on the wire → lowercased in the key (canonical, C5).
  assert.equal(
    narabiPredictorId("eip155:1", "erc20:0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"),
    "narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
    "the USDe mainnet key canonicalizes hex to lowercase",
  );
  // chain is PART of the key: same token, another chain ⇒ a different key (L2 OFT lock-and-mint = another law).
  assert.notEqual(
    narabiPredictorId("eip155:1", "erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3"),
    narabiPredictorId("eip155:8453", "erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3"),
    "the chain segment is load-bearing (mainnet != L2)",
  );
  // B-3: a '|' in either segment would forge a false label_schema ⇒ rejected.
  assert.throws(() => narabiPredictorId("eip155:1", "erc20:0xdead|beef"), /forbidden/i);
  assert.throws(() => narabiPredictorId("eip|155", "erc20:0xdead"), /forbidden/i);
});

test("narabi_velocity_recomputable_by_hand (anti-circularity, start-supply)", () => {
  // burns = 1_000, supply CLOSE = 1_000_000, mints = 0, window = 24h.
  // Start-supply (D4): S_open = close + burns − mints = 1_001_000 ; v = (burns/S_open)/Δ.
  // Independent hand recompute (plain float division) — pins start-supply: close-supply would give
  // 1000/1_000_000/24 ≈ 4.1667e-5, differing by ~4e-8 ≫ tolerance, so a reverted denominator reds here.
  const expectedPerHour = (1_000 / (1_000_000 + 1_000)) / 24;
  const out = adapt(flow());
  assert.ok(Math.abs(out.provenance.velocity_per_hour - expectedPerHour) < 1e-12);
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
  // Start-supply (D4): supply_close=0 with a REAL drain is NOT non_evaluable — it is the STRONGEST signal
  // (f=1, v=1/Δ). close=0, burns=500, mints=0 ⇒ S_open=500 ⇒ ratio=1 ⇒ v=1/24 (24h).
  const fullDrain = adapt(flow({ window: "24h" }, { burns: "500000000000000000000", mints: "0", supply: "0" }));
  assert.ok(Math.abs(fullDrain.provenance.velocity_per_hour - 1 / 24) < 1e-12, "supply_close=0 with a real drain maps to v=1/Δ, not non_evaluable");
  // non_evaluable is now S_open <= 0 (mints >= close + burns): genesis / out-of-class rebasing wrapper.
  const nonPositiveOpen = fromAttestedFlow(flow({}, { supply: "0", burns: "0", mints: "100000000000000000000" }));
  assert.ok(isNarabiError(nonPositiveOpen) && nonPositiveOpen.reason === "non_evaluable", "S_open <= 0 (mints >= close+burns) is non_evaluable");
  // R1 (G2-delta): S_open === 0 EXACTLY is the boundary the `sOpen <= 0` guard adds. A `< 0` mutant would
  // let it through to a 0n/0n BigInt division (uncaught RangeError) — the throw class we claim to exclude.
  const zeroOpen = fromAttestedFlow(flow({}, { supply: "0", burns: "0", mints: "0" }));
  assert.ok(isNarabiError(zeroOpen) && zeroOpen.reason === "non_evaluable", "S_open === 0 (genesis) must be non_evaluable, never a division-by-zero throw");

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

// Test — start-supply (D4): `supply` is the window-CLOSE value, so a run can drain it below `burns`.
// Under start-supply that is a PROPER fraction of the OPENING stock (≤ 1), MAPPED — not the odds >1.
// Mutant: revert to burns/close ⇒ this reds (it would be 1.5/24, not 0.6/24).
test("narabi_maps_a_drain_below_burns_as_a_fraction (D4 start-supply)", () => {
  // burn 600, mint 0, CLOSE 400 ⇒ S_open = 400 + 600 − 0 = 1000 ⇒ f = 600/1000 = 0.6 (of the opening stock).
  const out = adapt(flow({ window: "24h" }, { burns: "600000000000000000000", mints: "0", supply: "400000000000000000000" }));
  const expected = 0.6 / 24;
  assert.ok(Math.abs(out.provenance.velocity_per_hour - expected) < 1e-12, "burns>close is 60% of the OPENING stock (start-supply), not the odds 1.5");
  assert.equal(out.prediction.yhat, out.provenance.velocity_per_hour);
});

// Test — churn: v_t can exceed 1 ONLY via intra-window mint-then-burn (mints > close), attributable to
// the carried `mints`, and it is MAPPED, never a rejection (the C-1 "never reject a drain" invariant
// survives on start-supply). Mutant: a `ratio > 1 ⇒ reject` guard ⇒ this reds.
test("narabi_churn_ratio_above_1_is_mapped_not_rejected (D4)", () => {
  // CLOSE 100, burn 600, mint 500 ⇒ S_open = 100 + 600 − 500 = 200 ⇒ ratio = 600/200 = 3.
  const out = adapt(flow({ window: "24h" }, { burns: "600000000000000000000", mints: "500000000000000000000", supply: "100000000000000000000" }));
  const expected = 3 / 24;
  assert.ok(Math.abs(out.provenance.velocity_per_hour - expected) < 1e-12, "mints>close pushes the fraction above 1 (churn), mapped and attributable to mints");
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
