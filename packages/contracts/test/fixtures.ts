import type { AttestedPrice, Prediction, CoverageVerdict, GateDecision } from "../src/index.ts";
import { calibDigest } from "../src/index.ts";

const HASH = "a".repeat(64);

export function validAttestedPrice(): AttestedPrice {
  return {
    schema_version: "1.0.0",
    subject: "pyth:BTC/USD",
    attestor: [{ identity: "pyth-hermes", key: "deadbeef" }],
    residual: ["assume:tls-notary", "assume:delegation"],
    transport: "tlsnotary",
    utterance: { hash: HASH },
    observed_at: { clock: "transport", instant: 1_756_000_000 },
    octets_recalcules: true,
    verifier_revision: "shogen-verifier@abc123",
  };
}

export function validPrediction(): Prediction {
  return {
    schema_version: "1.0.0",
    task_class: "btc-dir-15m",
    yhat: "up",
    predictor_id: "internal:baseline",
    produced_at: "2026-09-04T06:00:00Z",
  };
}

export function validVerdictSet(): CoverageVerdict {
  const scores = [0, 0, 1, 0, 1];
  return {
    schema_version: "1.0.0",
    task_class: "btc-dir-15m",
    method: "hac-cp",
    alpha: 0.1,
    n_calib: 5,
    region: { kind: "set", labels: ["up"], label_schema: "up|down" },
    qhat: 1,
    abstain: false,
    reason: "covered",
    residual: ["assume:tls-notary"],
    scores,
    calib_digest: calibDigest(scores),
    produced_at: "2026-09-04T06:00:00Z",
  };
}

export function validVerdictInterval(): CoverageVerdict {
  const scores = [0.2, 0.5, 0.1, 0.9];
  return {
    schema_version: "1.0.0",
    task_class: "cascade-var",
    method: "hac-cp",
    alpha: 0.1,
    n_calib: 4,
    region: { kind: "interval", lo: -0.03, hi: 0.03 },
    qhat: 0.9,
    abstain: false,
    reason: "covered",
    residual: [],
    calib_digest: calibDigest(scores),
    produced_at: "2026-09-04T06:00:00Z",
  };
}

export function validGateDecision(): GateDecision {
  return {
    schema_version: "1.0.0",
    action: "commit",
    allow: true,
    tool: "perps_order",
    intent: "up",
    verdict: validVerdictSet(),
    remaining_budget: 0.42,
    reason: "covered",
  };
}
