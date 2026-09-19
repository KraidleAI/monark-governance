import type { AttestedPrice, AttestedFlow, AttestedBook, Prediction, CoverageVerdict, GateDecision } from "../src/index.ts";
import { calibDigest } from "../src/index.ts";

const HASH = "a".repeat(64);

export function validAttestedBook(): AttestedBook {
  return {
    schema_version: "1.0.0",
    subject: "https://monarkgate.tech/ukemi/book/weth/23545087.json",
    chain: "eip155:1",
    protocol: "aave-v3-core",
    cluster: "weth",
    block: { number: 23_545_087, hash: "0x" + "a".repeat(64) },
    book_digest: "a".repeat(64),
    holders_digest: "b".repeat(64),
    oracle_sources: [
      { asset: "0x" + "1".repeat(40), source: "0x" + "2".repeat(40), description: "WETH / USD" },
    ],
    eligible: { n_positions: 3, debt_base: "1421800000000", collateral_base: "1803800000000" },
    providers: [
      { name: "drpc", method: "eth_call", ok: true },
      { name: "mevblocker", method: "getLogs", ok: true },
    ],
    quorum: { required: 2, achieved: 2 },
    abstain: { value: false, reason: null },
    residual: ["no_third_party_verifier", "rpc_quorum_2_keyless"],
    attestor: { kind: "recorder", key: "deadbeef" },
    recorder_revision: "ukemi-recorder@" + "c".repeat(64),
    observed_at: { clock: "block", instant: 1_760_140_800 },
  };
}

export function validAttestedFlow(): AttestedFlow {
  return {
    schema_version: "1.0.0",
    subject: "msUSD",
    attestor: [{ identity: "issuer-por", key: "deadbeef" }],
    source: { chain: "ethereum", issuer: "0x0000000000000000000000000000000000000000" },
    window: "24h",
    flow: {
      burns: "1000000000000000000000",
      mints: "0",
      supply: "50000000000000000000000000",
      from_block: 20000000,
      to_block: 20007200,
    },
    residual: ["ap_capacity_unknown"],
    transport: "rpc+por",
    utterance: { hash: HASH },
    observed_at: { clock: "transport", instant: 1_756_000_000 },
    octets_recalcules: true,
    verifier_revision: "narabi-adapter@abc123",
  };
}

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
