// apps/site/lib/narabi-snapshot.ts — byte-exact committed capture of the Narabi sentinel published
// files (ADR-M012 D4), pulled from https://monarkgate.tech/narabi/ on 2026-09-19 (the T=1 series: the
// 2026-09-18 window appended to the 2026-09-17 genesis; re-captured for the ADR-M018 D4 lot, E10, replacing
// the T=0 capture of 2026-09-18). Used ONLY as the dev/test fallback when the same-origin fetch of
// /narabi/state.json + /narabi/timeline.jsonl fails (localhost has no Caddy file_server); the page shows a
// declared "snapshot" badge, never a silent substitution. The sha256 of each string equals that of the
// published file (test/narabi-live.test.ts re-hashes them), so this capture is verifiable against
// monarkgate.tech. Pure data: no import, no React.

export interface NarabiSnapshotBytes {
  readonly capturedAt: string;
  readonly source: string;
  readonly stateJson: string;
  readonly timelineJsonl: string;
  readonly stateSha256: string;
  readonly timelineSha256: string;
}

export const NARABI_SNAPSHOT: NarabiSnapshotBytes = {
  capturedAt: "2026-09-19",
  source: "https://monarkgate.tech/narabi/",
  stateJson: "{\n  \"tracker\": {\n    \"q\": -0.004035474385833333,\n    \"t\": 1,\n    \"q1\": 0.00013119228083333334,\n    \"params\": {\n      \"alpha\": 0.1,\n      \"c\": 0.041666666666666664,\n      \"eps\": 0.1,\n      \"t0\": 0,\n      \"B\": 0.041666666666666664\n    }\n  },\n  \"digest\": \"9b5f89fdd49c69e059ea50f94cdd6c00ace0ab93b95f61d01b6b59323735d633\",\n  \"projected_bound_leq_target_T\": 1789,\n  \"replay_q\": -0.004035474385833333\n}\n",
  timelineJsonl: "{\"day\":\"2026-09-17\",\"from_block\":25993482,\"to_block\":26000650,\"burns\":\"7248378739600000000000000\",\"mints\":\"17695946655200000000000000\",\"supply_close\":\"4740020686554655133523503861\",\"s_open\":\"4729573118639055133523503861\",\"c1_ok\":true,\"utterance_hash\":\"8767c2ae0126dfa7d1cb2aa4df33475fa8d911021e8288364e7e2833a5e4d3d6\",\"attested_flow_sha256\":\"6ec873c92751d23ed8046a9087e44fb2410bcdd1ca57b0987b86a8f9d0603388\",\"v\":0.0000638568795,\"regime\":{\"floor\":true,\"stress\":false},\"pair_status\":\"non_evaluable\",\"s_raw\":null,\"s\":null,\"E_tracker\":null,\"q_before\":0.00013119228083333334,\"eta\":null,\"q_after\":0.00013119228083333334,\"T\":0,\"mean_E_tracker\":null,\"bound_thm1\":null,\"digest_T\":\"48d40651eb2e69c38d43c58ebf47eb1e656560606a70a957e9929ae0e70c275a\",\"E_static\":null,\"t_deg\":0,\"sum_E_static\":0,\"B_t\":0.1,\"rolling90_calm_miss\":null,\"drift_flag\":false,\"prev_line_hash\":\"GENESIS\",\"line_hash\":\"09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82\",\"endpoints\":[\"https://ethereum-rpc.publicnode.com\",\"https://eth.llamarpc.com\",\"https://eth.drpc.org\",\"https://rpc.mevblocker.io\",\"https://eth-mainnet.public.blastapi.io\",\"https://1rpc.io/eth\",\"https://ethereum.publicnode.com\",\"https://eth.rpc.blxrbdn.com\"],\"node_version\":\"v24.21.0\",\"sentinel_sha\":\"b5a0ed333b54e1113e7c17612e820b880a8aae7edabe359ec27149dddbf81092\"}\n{\"day\":\"2026-09-18\",\"from_block\":26000651,\"to_block\":26007835,\"burns\":\"8556055570200000000000000\",\"mints\":\"76195312945090000000000000\",\"supply_close\":\"4807659943929545133523503861\",\"s_open\":\"4740020686554655133523503861\",\"c1_ok\":true,\"utterance_hash\":\"907195b0900713828b7c16b2099e232d9ea6aaeadf3ef3e58f704077f883e422\",\"attested_flow_sha256\":\"3692fa483df18537f7d667f65d68dd4ba66bac99dd6785407ff5cdb68bcfd130\",\"v\":0.00007521113070833333,\"regime\":{\"floor\":true,\"stress\":false},\"pair_status\":\"evaluable\",\"s_raw\":0.000011354251208333323,\"s\":0.000011354251208333323,\"E_tracker\":0,\"q_before\":0.00013119228083333334,\"eta\":0.041666666666666664,\"q_after\":-0.004035474385833333,\"T\":1,\"mean_E_tracker\":0,\"bound_thm1\":2,\"digest_T\":\"9b5f89fdd49c69e059ea50f94cdd6c00ace0ab93b95f61d01b6b59323735d633\",\"E_static\":0,\"t_deg\":0,\"sum_E_static\":0,\"B_t\":0.1,\"rolling90_calm_miss\":null,\"drift_flag\":false,\"prev_line_hash\":\"09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82\",\"line_hash\":\"ec4ce67e716e89811cb1707b28b7cfed96e8fa35ce4d54c178eb30aa83deec0a\",\"endpoints\":[\"https://ethereum-rpc.publicnode.com\",\"https://eth.llamarpc.com\",\"https://eth.drpc.org\",\"https://rpc.mevblocker.io\",\"https://eth-mainnet.public.blastapi.io\",\"https://1rpc.io/eth\",\"https://ethereum.publicnode.com\",\"https://eth.rpc.blxrbdn.com\"],\"node_version\":\"v24.21.0\",\"sentinel_sha\":\"a87e86f8a192bfcd087a846c93c712d641089e3828fc3ce970a4c4db5d5353f5\"}\n",
  stateSha256: "86c33c4251bef4b307688c7b8386d74137136cf7ba2d91687ee42ad06e06b96b",
  timelineSha256: "4b17d0b812e47e34a8d0d9fed47c153a8b471e6e53787b55bc4c574a6de0ea5b",
};
