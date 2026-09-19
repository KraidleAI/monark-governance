// UKEMI (ADR-U1 D1, Q1) — committed cluster registry: Aave v3 core Ethereum, the two U-1a clusters.
//
// Every address is [lu] on-chain (bgd-labs address-book + census A + the M-1/M-2b measures) and the aToken /
// ReserveInitialized start block are RESOLVED ON-CHAIN and PINNED here (getLogs ReserveInitialized topic1=asset
// on the PoolConfigurator → topic2 = aToken; block = the log's block). The recorder still reads reserve params
// live via getReservesList()+getReserveData(asset)@B (never a hard-coded historical address, ADR-U1 D1) and
// cross-checks the resolved aToken against the pinned one (mismatch ⇒ abi_mismatch, fail-closed). The oracle is
// resolved live via PoolAddressesProvider.getPriceOracle() and cross-checked against ORACLE below.

export const CHAIN_ID = "1"; // eip155:1 (eth_chainId @23545087 = 0x1, [lu])
export const POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";                 // census A §1 ✓
export const POOL_ADDRESSES_PROVIDER = "0x2f39d218133AFaB8F2B819B1066c7E434Ad94E9e"; // census A §1 ✓
export const POOL_CONFIGURATOR = "0x64b761d848206f447fe2dd461b0c635ec39ebb27";    // census A §1 ✓ (ReserveInitialized emitter)
export const ORACLE = "0x54586bE62E3c3580375aE3723C145253060Ca0C2";              // AaveOracle via getPriceOracle() @B ✓ (M-2b)

/** One collateral leg of a cluster: its ERC-20, its aToken, and the block its reserve was initialised. */
export interface ClusterCollateral {
  readonly asset: string;
  readonly aToken: string;          // ReserveInitialized topic2, resolved on-chain and pinned
  readonly reserveInitBlock: number; // ReserveInitialized block, resolved on-chain and pinned
}

export interface Cluster {
  readonly id: string;
  readonly collaterals: readonly ClusterCollateral[];
}

/** WETH cluster (2025-10-10/11 event). aEthWETH + init block resolved on-chain (tx 0xbe53b1…35d). */
export const CLUSTER_WETH: Cluster = {
  id: "weth",
  collaterals: [
    { asset: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", aToken: "0x4d5f47fa6a74757f35c14fd3a6ef8e3c9bc514e8", reserveInitBlock: 16496792 },
  ],
};

/** sUSDe/USDe cluster (2025-02-21 event). aEthsUSDe (tx 0x8d3393…1261) + aEthUSDe (tx 0x28c874…269f5),
 *  init blocks = census A §1 listings, aTokens resolved on-chain. */
export const CLUSTER_SUSDE_USDE: Cluster = {
  id: "susde-usde",
  collaterals: [
    { asset: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497", aToken: "0x4579a27af00a62c0eb156349f31b345c08386419", reserveInitBlock: 20184634 },
    { asset: "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3", aToken: "0x4f5923fc5fd4a93352581b38b7cd26943012decf", reserveInitBlock: 20033499 },
  ],
};

export const CLUSTERS: readonly Cluster[] = [CLUSTER_WETH, CLUSTER_SUSDE_USDE];

export function clusterById(id: string): Cluster {
  const c = CLUSTERS.find((x) => x.id === id);
  if (!c) throw new Error(`ukemi/clusters: unknown cluster '${id}' (declared: ${CLUSTERS.map((x) => x.id).join(", ")})`);
  return c;
}
