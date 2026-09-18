// apps/site/lib/narabi-snapshot.ts — byte-exact committed capture of the Narabi sentinel published
// files (ADR-M012 D4), pulled from https://monarkgate.tech/narabi/ on 2026-09-18. Used ONLY as the
// dev/test fallback when the same-origin fetch of /narabi/state.json + /narabi/timeline.jsonl fails
// (localhost has no Caddy file_server); the page shows a declared "snapshot" badge, never a silent
// substitution. The sha256 of each string equals that of the published file (test/narabi-live.test.ts
// re-hashes them), so this capture is verifiable against monarkgate.tech. Pure data: no import, no React.

export interface NarabiSnapshotBytes {
  readonly capturedAt: string;
  readonly source: string;
  readonly stateJson: string;
  readonly timelineJsonl: string;
  readonly stateSha256: string;
  readonly timelineSha256: string;
}

export const NARABI_SNAPSHOT: NarabiSnapshotBytes = {
  capturedAt: "2026-09-18",
  source: "https://monarkgate.tech/narabi/",
  stateJson: "{\n  \"tracker\": {\n    \"q\": 0.00013119228083333334,\n    \"t\": 0,\n    \"q1\": 0.00013119228083333334,\n    \"params\": {\n      \"alpha\": 0.1,\n      \"c\": 0.041666666666666664,\n      \"eps\": 0.1,\n      \"t0\": 0,\n      \"B\": 0.041666666666666664\n    }\n  },\n  \"digest\": \"48d40651eb2e69c38d43c58ebf47eb1e656560606a70a957e9929ae0e70c275a\",\n  \"projected_bound_leq_target_T\": 1789,\n  \"replay_q\": 0.00013119228083333334\n}\n",
  timelineJsonl: "{\"day\":\"2026-09-17\",\"from_block\":25993482,\"to_block\":26000650,\"burns\":\"7248378739600000000000000\",\"mints\":\"17695946655200000000000000\",\"supply_close\":\"4740020686554655133523503861\",\"s_open\":\"4729573118639055133523503861\",\"c1_ok\":true,\"utterance_hash\":\"8767c2ae0126dfa7d1cb2aa4df33475fa8d911021e8288364e7e2833a5e4d3d6\",\"attested_flow_sha256\":\"6ec873c92751d23ed8046a9087e44fb2410bcdd1ca57b0987b86a8f9d0603388\",\"v\":0.0000638568795,\"regime\":{\"floor\":true,\"stress\":false},\"pair_status\":\"non_evaluable\",\"s_raw\":null,\"s\":null,\"E_tracker\":null,\"q_before\":0.00013119228083333334,\"eta\":null,\"q_after\":0.00013119228083333334,\"T\":0,\"mean_E_tracker\":null,\"bound_thm1\":null,\"digest_T\":\"48d40651eb2e69c38d43c58ebf47eb1e656560606a70a957e9929ae0e70c275a\",\"E_static\":null,\"t_deg\":0,\"sum_E_static\":0,\"B_t\":0.1,\"rolling90_calm_miss\":null,\"drift_flag\":false,\"prev_line_hash\":\"GENESIS\",\"line_hash\":\"09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82\",\"endpoints\":[\"https://ethereum-rpc.publicnode.com\",\"https://eth.llamarpc.com\",\"https://eth.drpc.org\",\"https://rpc.mevblocker.io\",\"https://eth-mainnet.public.blastapi.io\",\"https://1rpc.io/eth\",\"https://ethereum.publicnode.com\",\"https://eth.rpc.blxrbdn.com\"],\"node_version\":\"v24.21.0\",\"sentinel_sha\":\"b5a0ed333b54e1113e7c17612e820b880a8aae7edabe359ec27149dddbf81092\"}\n",
  stateSha256: "7abd7ab40c47599589683f6a857974c49636114f104bd93f68b4961aafdecf2d",
  timelineSha256: "1803f5128ae59e77cf8553b54a5ce5f9740903b9f63d259e951bcad4c73e2ad5",
};
