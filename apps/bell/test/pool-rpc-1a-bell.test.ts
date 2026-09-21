// POOL-RPC-1a CA-9 (ADR-POOL-RPC-1, C-1) — Bell's Ethereum leg is a REAL consumer of GET_LOGS_PROVIDERS (the G0
// source forgot it): apps/bell/src/ethereum.ts liveEthSwaps passes it to makeUkemiPool as ethCall AND getLogs
// providers. This proves the tuyau by injection: the DEFAULT resolves GET_LOGS_PROVIDERS; an injected 2-distinct-
// operator pool serves the TSLAon fills; and the injected {nodies,pocket} pair fails closed (inherits C-2). No net.
import { test } from "node:test";
import assert from "node:assert/strict";
import { liveEthSwaps, UNISWAP_V3_SWAP_TOPIC } from "../src/ethereum.ts";
import { POOLS } from "../src/pools.ts";
import { operatorOf, GET_LOGS_PROVIDERS, NoQuorumError } from "../../sentinel/src/ukemi/rpc2.ts";
import type { RpcCall } from "../../sentinel/src/rpc.ts";

const POOL = POOLS.find((p) => p.chain === "ethereum")!; // TSLAon/USDC (Uniswap v3), the leg C-1 surfaced
const word = (n: bigint): string => n.toString(16).padStart(64, "0");
const SWAP = { blockNumber: "0x1", logIndex: "0x0", transactionHash: "0x" + "aa".repeat(32), topics: [UNISWAP_V3_SWAP_TOPIC], data: "0x" + word(1_000_000n) + word(2_000_000n) };

// CA-9 (resolution) — liveEthSwaps with NO getLogsProviders resolves GET_LOGS_PROVIDERS and forms a ≥2-operator quorum.
test("bell_pool_rpc_1a_ca9_default_resolves_get_logs_providers — the Ethereum leg defaults to GET_LOGS_PROVIDERS (≥ 2 distinct operators) (CA-9; C-1)", async () => {
  const seen: string[] = [];
  const call: RpcCall = (url, method) => {
    seen.push(url);
    if (method === "eth_getLogs") return Promise.resolve([]);
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  const fills = await liveEthSwaps(POOL, 1, 100, { call }); // no getLogsProviders ⇒ default resolution
  assert.equal(fills.length, 0, "an empty window yields no fills");
  const opsSeen = new Set(seen.map(operatorOf));
  assert.ok(opsSeen.size >= 2, "the default pool formed a quorum of ≥ 2 distinct operators");
  const allowed = new Set(GET_LOGS_PROVIDERS.map(operatorOf));
  assert.ok([...opsSeen].every((op) => allowed.has(op)), "every operator hit resolves to GET_LOGS_PROVIDERS (the tuyau C-1)");
});

// CA-9 (injection) — an injected 2-distinct-operator pool SERVES the TSLAon swap as a fill.
test("bell_pool_rpc_1a_ca9_injected_pool_serves_fills — opts.getLogsProviders (2 distinct operators) serves the swap fill (CA-9; C-1)", async () => {
  const inj: RpcCall = (_url, method) => {
    if (method === "eth_getLogs") return Promise.resolve([SWAP]);
    if (method === "eth_getBlockByNumber") return Promise.resolve({ hash: "0x" + "11".repeat(32), number: "0x1", timestamp: "0x66000000" });
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  const fills = await liveEthSwaps(POOL, 1, 100, { call: inj, getLogsProviders: ["https://eth.drpc.org", "https://rpc.mevblocker.io"] });
  assert.equal(fills.length, 1, "the injected 2-operator pool served the swap as one fill");
  assert.equal(fills[0]!.signature, SWAP.transactionHash, "the fill carries the swap's tx hash (dedup key)");
});

// CA-9 (never alone, inherits C-2) — the injected {nodies, pocket} pair = ONE operator ⇒ no quorum for Bell's leg.
test("bell_pool_rpc_1a_ca9_nodies_pocket_pair_no_quorum — {nodies, pocket} injected = one operator ⇒ the Ethereum leg fails closed (CA-9; C-2)", async () => {
  const inj: RpcCall = (_url, method) => (method === "eth_getLogs" ? Promise.resolve([SWAP]) : Promise.reject(new Error("x")));
  await assert.rejects(() => liveEthSwaps(POOL, 1, 100, { call: inj, getLogsProviders: ["https://eth-pokt.nodies.app", "https://eth.api.pocket.network"] }), NoQuorumError, "{nodies, pocket} = ONE operator (C-2) ⇒ no quorum, fail-closed");
});

// CA-9 (resilience, decision 102 margin — C-G2-3) — with the DEFAULT 4-operator GET_LOGS_PROVIDERS, a drpc transport
// fault is benched and the window is STILL served by mevblocker + tenderly. A default reduced to [drpc, mevblocker]
// (M-C7) leaves only mevblocker after drpc benches ⇒ NoQuorum ⇒ this reds. Proves Tenderly's kept margin (decision 102).
test("bell_pool_rpc_1a_ca9_survives_drpc_bench — default pool: a drpc fault is benched, tenderly carries the quorum, the window is served (CA-9; C-G2-3)", async () => {
  const seen: string[] = [];
  const inj: RpcCall = (url, method) => {
    seen.push(url);
    if (url.includes("drpc")) return Promise.reject(new Error("HTTP 503 transport")); // drpc benched
    if (method === "eth_getLogs") return Promise.resolve([SWAP]);
    if (method === "eth_getBlockByNumber") return Promise.resolve({ hash: "0x" + "11".repeat(32), number: "0x1", timestamp: "0x66000000" });
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  const fills = await liveEthSwaps(POOL, 1, 100, { call: inj }); // DEFAULT resolution = GET_LOGS_PROVIDERS (4 operators)
  assert.equal(fills.length, 1, "the window is served despite drpc benching (mevblocker + tenderly form the quorum)");
  const ops = new Set(seen.map(operatorOf));
  assert.ok(seen.some((u) => u.includes("drpc")), "drpc was attempted (then benched on its transport fault)");
  assert.ok(ops.has("tenderly.co"), "tenderly.co carried the getLogs quorum after drpc benched (decision 102 margin; a [drpc,mevblocker]-only default ⇒ NoQuorum ⇒ reds)");
});
