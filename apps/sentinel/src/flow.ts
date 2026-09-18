// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// Builds the AttestedFlow the DEPLOYED adapter consumes, byte-for-byte like scripts/record-usde-calib.mjs
// (A3 utterance hash over {address,fromBlock,toBlock,topics}; same subject/issuer/attestor/residual), with
// ONE declared change (ADR-M012 D9): `observed_at.instant` is the window's CLOSE midnight (D+1), where the
// recorder used the OPEN midnight — so `produced_at` names the outcome instant. Velocity and the A3 hash
// are unaffected; only `attested_flow_sha256` shifts from any recorder value (declared here, not hidden).
//
// C1 identity is verified fail-closed BEFORE trusting a window (ADR-M008 D4, adapter-narabi.ts:184):
// totalSupply(from_block-1) must equal supply_close + burns - mints, or the window is `c1_fail` and is
// kept OUT of the timeline (test `sentinel_c1_fail_closed`). The velocity itself is the adapter's (1e12).
import { createHash } from "node:crypto";
import { serializeAttestedFlow } from "@monark/contracts";
import type { AttestedFlow } from "@monark/contracts";
import { fromAttestedFlow, isNarabiError } from "@monark/monark";
import { USDE_TOKEN, TRANSFER_TOPIC } from "./rpc.ts";
import { midnightOf } from "./windows.ts";

const SUBJECT = "erc20:0x4c9EDD5852cd905f086C759E8383e09bff1E68B3"; // A4 canonical token
const CHAIN = "eip155:1";                                          // A4 CAIP-2
const ISSUER = "0xe3490297a08d6fc8da46edb7b6142e4f461b62d3";       // EthenaMinting V2 (A4)

/** Raw window facts read from the pool (bigint counts + supplies), keyed by the OPEN day D. */
export interface WindowFacts {
  readonly day: string;
  readonly fromBlock: number;
  readonly toBlock: number;
  readonly burns: bigint;
  readonly mints: bigint;
  readonly supplyClose: bigint; // totalSupply(toBlock)
  readonly supplyOpen: bigint;  // totalSupply(fromBlock - 1) — the C1 witness
}

/** Outcome of attesting one window. `c1_fail` is out-of-timeline; the other two are written lines. */
export type AttestResult =
  | { readonly status: "c1_fail"; readonly sOpenRecompute: bigint }
  | { readonly status: "non_evaluable"; readonly reason: string; readonly flow: AttestedFlow; readonly flowSha256: string; readonly sOpen: bigint }
  | { readonly status: "evaluable"; readonly flow: AttestedFlow; readonly flowSha256: string; readonly velocity: number; readonly sOpen: bigint };

/** A3 canonical payload -> utterance.hash. Velocity-independent, identical to the recorder. */
export function utteranceHash(fromBlock: number, toBlock: number): string {
  return createHash("sha256")
    .update(JSON.stringify({ address: USDE_TOKEN.toLowerCase(), fromBlock, toBlock, topics: [TRANSFER_TOPIC] }), "utf8")
    .digest("hex");
}

/** The AttestedFlow for a window; `observed_at.instant` = CLOSE midnight (D9). Pure. */
export function buildAttestedFlow(w: WindowFacts): AttestedFlow {
  return {
    schema_version: "1.0.0",
    subject: SUBJECT,
    attestor: [{ identity: "ethena-por", key: "deadbeef" }],
    source: { chain: CHAIN, issuer: ISSUER },
    window: "24h",
    flow: { burns: w.burns.toString(), mints: w.mints.toString(), supply: w.supplyClose.toString(), from_block: w.fromBlock, to_block: w.toBlock },
    residual: ["ap_capacity_unknown"],
    transport: "rpc+eth_getLogs",
    utterance: { hash: utteranceHash(w.fromBlock, w.toBlock) },
    observed_at: { clock: "utc-midnight", instant: midnightOf(w.day) + 86_400 },
    octets_recalcules: true,
    verifier_revision: "narabi-adapter@f2b",
  };
}

/** Verify C1 fail-closed, then run the deployed adapter. No network, no clock. */
export function attest(w: WindowFacts): AttestResult {
  const sOpenRecompute = w.supplyClose + w.burns - w.mints;
  if (sOpenRecompute !== w.supplyOpen) return { status: "c1_fail", sOpenRecompute };
  const flow = buildAttestedFlow(w);
  const flowSha256 = createHash("sha256").update(serializeAttestedFlow(flow), "utf8").digest("hex");
  const out = fromAttestedFlow(flow);
  if (isNarabiError(out)) return { status: "non_evaluable", reason: out.reason, flow, flowSha256, sOpen: sOpenRecompute };
  return { status: "evaluable", flow, flowSha256, velocity: out.provenance.velocity_per_hour, sOpen: sOpenRecompute };
}
