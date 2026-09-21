// POOL-RPC-1a (ADR-POOL-RPC-1) — acceptance oracles CA-1..CA-8 for the RPC-pool revision (decision 106: −Blast
// −Llama +Pocket; decision 102: Tenderly kept + Pocket added to getLogs, L-5 green; C-2: {nodies,pocket} = ONE
// operator). Each guard has a byte-exact mutant in the G1 rendu (M-1..M-9). No network: every read is an injected
// `call`/stub. CA-6 (publishedEndpoints verbatim + redacted Chainstack) stays covered by the EXISTING
// sentinel_never_prints_endpoint_url + no_secret_in_repo (unchanged, green); CA-9 (Bell) lives in apps/bell/test.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeRpcPool, PUBLIC_ENDPOINTS, providerOf, TRANSFER_TOPIC, QuorumDisagreementError, type RpcCall } from "../src/rpc.ts";
import { makeUkemiPool, operatorOf, isResultLimit, isPlanLimited, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, NoQuorumError, RpcError, type LogEntry } from "../src/ukemi/rpc2.ts";

const has = (pool: readonly string[], needle: string): boolean => pool.some((u) => u.includes(needle));

// ── CA-1 — PUBLIC_ENDPOINTS (sentinel SERVED): −Llama −Blast +Pocket, still ≥ 2 distinct providers (M-1/M-2) ──
test("pool_rpc_1a_ca1_public_endpoints_membership — llamarpc AND blastapi removed, pocket added, 7 hosts, ≥ 2 distinct providers (CA-1; M-1/M-2/M-8)", () => {
  assert.ok(!has(PUBLIC_ENDPOINTS, "llamarpc"), "eth.llamarpc.com is removed (decision 106; M-2 reds)");
  assert.ok(!has(PUBLIC_ENDPOINTS, "blastapi"), "eth-mainnet.public.blastapi.io is removed (decision 106; M-1 reds)");
  assert.ok(has(PUBLIC_ENDPOINTS, "eth.api.pocket.network"), "https://eth.api.pocket.network is added");
  assert.equal(PUBLIC_ENDPOINTS.length, 7, "the pool is 7 (publicnode×2, drpc, mevblocker, 1rpc, blxrbdn, pocket)");
  assert.ok(new Set(PUBLIC_ENDPOINTS.map(providerOf)).size >= 2, "≥ 2 distinct providers remain (M-8 reds)");
});

// ── CA-2 — pocket identity: providerOf ⇒ pocket.network; operatorOf collapses {nodies, pocket} to `pocket` (M-3) ─
test("pool_rpc_1a_ca2_pocket_operator_identity — providerOf pocket.network; operatorOf(pocket) == operatorOf(nodies) == 'pocket'; others untouched (CA-2; M-3)", () => {
  assert.equal(providerOf("https://eth.api.pocket.network"), "pocket.network");
  assert.equal(operatorOf("https://eth.api.pocket.network"), "pocket", "pocket.network ⇒ operator 'pocket' (M-3 reds)");
  assert.equal(operatorOf("https://eth-pokt.nodies.app"), "pocket", "the nodies POKT gateway is the SAME operator (C-2)");
  assert.equal(operatorOf("https://eth.api.pocket.network"), operatorOf("https://eth-pokt.nodies.app"), "{nodies, pocket} collapse to one operator");
  assert.equal(operatorOf("https://eth.drpc.org"), "drpc.org", "a non-Pocket domain is its own operator (no over-collapse)");
  assert.equal(operatorOf("https://rpc.mevblocker.io"), "mevblocker.io");
});

// ── CA-3 — never alone: pocket alone AND the {nodies,pocket} pair fail closed; pocket + a distinct op succeeds (M-4/M-4b) ─
test("pool_rpc_1a_ca3_pocket_never_alone — pocket alone and {nodies,pocket} both no-quorum; pocket + drpc succeeds (CA-3; M-4/M-4b)", async () => {
  const value: RpcCall = () => Promise.resolve("0x64");
  const POCKET = "https://eth.api.pocket.network", NODIES = "https://eth-pokt.nodies.app", DRPC = "https://eth.drpc.org";
  const mk = (eps: string[]): ReturnType<typeof makeUkemiPool> => makeUkemiPool({ call: value, ethCallProviders: eps, getLogsProviders: eps, minIntervalMs: 0 });
  await assert.rejects(() => mk([POCKET]).ethCall("0xabc", "0xdef", 100), NoQuorumError, "pocket alone ⇒ no quorum (needs 2 distinct operators; M-4 reds)");
  await assert.rejects(() => mk([NODIES, POCKET]).ethCall("0xabc", "0xdef", 100), NoQuorumError, "{nodies, pocket} = ONE operator (C-2) ⇒ no quorum (M-4b reds)");
  assert.equal(await mk([POCKET, DRPC]).ethCall("0xabc", "0xdef", 100), "0x64", "pocket + a DISTINCT operator (drpc) ⇒ quorum");
  // finalized() collapses by operatorOf too (plan C-2 "Idem finalized()"): a VALID block from both nodies+pocket still
  // yields ONE operator ⇒ no quorum. (Uses a block-shaped stub so distinctness — not a decode failure — is the cause.)
  const block: RpcCall = () => Promise.resolve({ hash: "0x" + "11".repeat(32), number: "0x1", timestamp: "0x1" });
  const finPool = makeUkemiPool({ call: block, ethCallProviders: [NODIES, POCKET], getLogsProviders: [NODIES, POCKET], minIntervalMs: 0 });
  await assert.rejects(() => finPool.finalized(), NoQuorumError, "finalized() ALSO collapses {nodies,pocket} to one operator ⇒ no quorum (C-2 finalized; M-4c)");
});

// ── CA-4 — ETH_CALL_PROVIDERS: −Blast +Pocket (4 URL / 3 operators); a Pocket quorum reproduces the U-4a book value (M-5) ─
test("pool_rpc_1a_ca4_eth_call_pool_and_book_value — 4 URL / 3 operators, no blast; pocket+drpc quorum returns getAssetPrice(WETH)@23545087 = 434687000000 (CA-4; M-5)", async () => {
  assert.ok(!has(ETH_CALL_PROVIDERS, "blastapi"), "blast removed from eth_call (M-5 reds)");
  assert.ok(has(ETH_CALL_PROVIDERS, "eth.api.pocket.network"), "pocket added to eth_call");
  assert.equal(ETH_CALL_PROVIDERS.length, 4, "4 URLs: drpc, mevblocker, nodies, pocket");
  assert.equal(new Set(ETH_CALL_PROVIDERS.map(operatorOf)).size, 3, "3 DISTINCT operators ({nodies,pocket}=1)");
  const BOOK_WORD = "0x" + "0".repeat(54) + "65355d3dc0"; // U-4a book price_base_8dec, hex→dec verified
  const call: RpcCall = (_u, method) => (method === "eth_call" ? Promise.resolve(BOOK_WORD) : Promise.reject(new Error("x")));
  const pool = makeUkemiPool({ call, ethCallProviders: ["https://eth.api.pocket.network", "https://eth.drpc.org"], getLogsProviders: ["https://eth.api.pocket.network", "https://eth.drpc.org"], minIntervalMs: 0 });
  const v = await pool.ethCall("0x0000000000000000000000000000000000000001", "0xabcd", 23545087);
  assert.equal(v, BOOK_WORD, "the pocket quorum returns the book word byte-for-byte");
  assert.equal(BigInt(v), 434687000000n, "= 434687000000 (byte-identical to the committed U-4a book, fact 3/CA-4)");
});

// ── CA-5 — 1RPC is in the low-volume sentinel pool but ABSENT from the heavy eth_call / getLogs pools (M-6) ──
test("pool_rpc_1a_ca5_1rpc_out_of_heavy_pools — 1rpc.io present in PUBLIC_ENDPOINTS, absent from ETH_CALL/GET_LOGS (CA-5; M-6)", () => {
  assert.ok(has(PUBLIC_ENDPOINTS, "1rpc.io"), "1rpc stays in the low-volume sentinel pool (L-6)");
  assert.ok(!has(ETH_CALL_PROVIDERS, "1rpc"), "1rpc is NOT in the heavy eth_call pool (M-6 reds)");
  assert.ok(!has(GET_LOGS_PROVIDERS, "1rpc"), "1rpc is NOT in the heavy getLogs pool");
});

// ── CA-7 — GET_LOGS_PROVIDERS: Tenderly KEPT (decision 102) + Pocket added (L-5 green) = 4 distinct operators ──
test("pool_rpc_1a_ca7_get_logs_pool — tenderly kept AND pocket added; 4 distinct operators (CA-7; decision 102 + L-5)", () => {
  assert.ok(has(GET_LOGS_PROVIDERS, "tenderly"), "tenderly is KEPT (decision 102; the 'exclude tenderly' G0-source line is caduc)");
  assert.ok(has(GET_LOGS_PROVIDERS, "eth.api.pocket.network"), "pocket added to getLogs (L-5 archive getLogs green)");
  assert.equal(GET_LOGS_PROVIDERS.length, 4, "drpc, mevblocker, tenderly, pocket");
  assert.equal(new Set(GET_LOGS_PROVIDERS.map(operatorOf)).size, 4, "4 DISTINCT operators (no collapse — no nodies here)");
});

// ── CA-8 — the concordance hook is a PURE side effect (no book byte moves) and receives OPERATORS, never a URL (M-7/M-7b) ─
test("pool_rpc_1a_ca8_hook_pure_sideeffect_operators_only — a sink changes NO outcome; it gets operatorOf labels, never a URL; a disagreement still throws with a sink (CA-8; M-7/M-7b)", async () => {
  const NODIES = "https://eth-pokt.nodies.app", DRPC = "https://eth.drpc.org", MEV = "https://rpc.mevblocker.io";
  const value: RpcCall = () => Promise.resolve("0x64");
  const events: Array<[string, string, string, boolean]> = [];
  const noSink = makeUkemiPool({ call: value, ethCallProviders: [NODIES, DRPC], getLogsProviders: [NODIES, DRPC], minIntervalMs: 0 });
  const withSink = makeUkemiPool({ call: value, ethCallProviders: [NODIES, DRPC], getLogsProviders: [NODIES, DRPC], minIntervalMs: 0, onQuorum: (l, a, b, c) => events.push([l, a, b, c]) });
  assert.equal(await noSink.ethCall("0xabc", "0xdef", 100), await withSink.ethCall("0xabc", "0xdef", 100), "the returned value is byte-identical with and without the sink (M-7 reds if the outcome depends on the sink)");
  assert.equal(events.length, 1, "the sink fired once for the one quorum");
  const [label, opA, opB, concordant] = events[0]!;
  assert.equal(label, "eth_call");
  assert.deepEqual([opA, opB].sort(), ["drpc.org", "pocket"], "operators only — nodies collapses to pocket (C-2)");
  assert.ok(![opA, opB].some((s) => s.includes("://") || s.includes("http") || s.includes("nodies")), "the sink NEVER receives a URL (M-7b reds)");
  assert.equal(concordant, true, "0x64 == 0x64 ⇒ concordant");
  // A disagreement fails closed EVEN with a sink attached, and the sink saw concordant=false BEFORE the throw.
  const disc: boolean[] = [];
  let n = 0;
  const split: RpcCall = () => Promise.resolve(n++ === 0 ? "0x64" : "0x65");
  const discPool = makeUkemiPool({ call: split, ethCallProviders: [DRPC, MEV], getLogsProviders: [DRPC, MEV], minIntervalMs: 0, onQuorum: (_l, _a, _b, c) => disc.push(c) });
  await assert.rejects(() => discPool.ethCall("0xabc", "0xdef", 100), QuorumDisagreementError, "a disagreement fails closed even with a sink attached");
  assert.deepEqual(disc, [false], "the sink recorded the DISCORDANCE, fired between the no-quorum guard and the disagreement throw");
});

// ── L-5 regex — the measured Pocket / dRPC caps classify correctly (rpc2.ts:56/61); isPlanLimited takes precedence ──
test("pool_rpc_1a_isresultlimit_matches_l5_caps — Pocket 5000/10000 split, dRPC free-plan benches (isResultLimit AND isPlanLimited, precedence)", () => {
  const POCKET_5000 = "query block range exceeds server limit, narrow your filter: 5000";
  const POCKET_10000 = "query exceeds max block range 10000";
  const DRPC_FREE = "ranges over 10000 blocks are not supported on free plan";
  assert.ok(isResultLimit(POCKET_5000), "Pocket 5000-cap ⇒ split ('block range exceeds' / 'narrow your filter')");
  assert.ok(isResultLimit(POCKET_10000), "Pocket 10000-cap ⇒ split ('max block range' / 10000)");
  assert.ok(!isPlanLimited(POCKET_5000) && !isPlanLimited(POCKET_10000), "the Pocket caps are RANGE caps, not plan caps ⇒ split, not bench");
  assert.ok(isResultLimit(DRPC_FREE), "dRPC free-plan message matches isResultLimit too (10000 / ranges over)");
  assert.ok(isPlanLimited(DRPC_FREE), "but isPlanLimited ALSO matches ⇒ getLogsVia benches drpc FIRST, never splits a plan cap (L-5: refuses even 2000 blocks)");
});

// ── Pocket ≤ 5000 split (rpc2 getLogsVia): a Pocket stub rejecting > 5000 blocks is split so every SERVED request holds ≤ 5000 ─
test("pool_rpc_1a_pocket_getlogs_split_holds_5000 — the 7168-block recent window forces Pocket into ≥ 2 sub-requests, each ≤ 5000 (L-5)", async () => {
  const POCKET = "https://eth.api.pocket.network", MEV = "https://rpc.mevblocker.io";
  const served: number[] = [];
  const log = (nn: number): LogEntry => ({ blockNumber: "0x" + nn.toString(16), logIndex: "0x0", transactionHash: "0x" + nn.toString(16).padStart(64, "0"), topics: ["0xtopic"], data: "0x" });
  const call: RpcCall = (url, method, params) => {
    if (method !== "eth_getLogs") return Promise.reject(new Error("unexpected"));
    const p = (params as ReadonlyArray<{ fromBlock: string; toBlock: string }>)[0]!;
    const from = parseInt(p.fromBlock, 16), to = parseInt(p.toBlock, 16), span = to - from + 1;
    if (url.includes("pocket")) {
      if (span > 5000) return Promise.reject(new RpcError("pocket.network", "query block range exceeds server limit, narrow your filter: 5000", -32602));
      served.push(span);
    }
    return Promise.resolve(from <= 1_000_000 && 1_000_000 <= to ? [log(1_000_000)] : []); // one burn, whatever the chunking
  };
  const pool = makeUkemiPool({ call, ethCallProviders: [POCKET, MEV], getLogsProviders: [POCKET, MEV], minIntervalMs: 0 });
  const logs = await pool.getLogsRange("0xabc", ["0xtopic"], 1_000_000, 1_007_167); // 7168 blocks
  assert.equal(logs.length, 1, "the window is served (one burn) after Pocket split its range; quorum concords with mevblocker");
  assert.ok(served.length >= 2, "the 7168-block window forced Pocket into ≥ 2 sub-requests (the 7168 request was rejected)");
  assert.ok(Math.max(...served) <= 5000, `every request Pocket SERVED holds ≤ 5000 blocks (max ${String(Math.max(...served))})`);
});

// ── L-1 — the UNCHANGED sentinel anchor (rpc.ts) already splits Pocket's 5000-cap: windowFlow over the recent window succeeds ─
test("pool_rpc_1a_l1_pocket_through_unchanged_anchor — makeRpcPool windowFlow over 7168 blocks succeeds with a Pocket 5000-cap, no rpc.ts logic edit (L-1)", async () => {
  const POCKET = "https://eth.api.pocket.network", MEV = "https://rpc.mevblocker.io";
  const burn = { topics: [TRANSFER_TOPIC, "0x" + "1".repeat(64), "0x" + "0".repeat(64)], data: "0x64" }; // burn of 100
  const served: number[] = [];
  const call: RpcCall = (url, method, params) => {
    if (method === "eth_getBlockByNumber") return Promise.resolve({ number: "0x2710", timestamp: "0x66000000" });
    if (method !== "eth_getLogs") return Promise.reject(new Error("unexpected"));
    const p = (params as ReadonlyArray<{ fromBlock: string; toBlock: string }>)[0]!;
    const from = parseInt(p.fromBlock, 16), to = parseInt(p.toBlock, 16), span = to - from + 1;
    if (url.includes("pocket")) {
      if (span > 5000) return Promise.reject(new Error("query block range exceeds server limit, narrow your filter: 5000")); // rpc.ts:86 'block range' matches ⇒ split
      served.push(span);
    }
    return Promise.resolve(from <= 1_000_000 && 1_000_000 <= to ? [burn] : []);
  };
  const pool = makeRpcPool({ call, endpoints: [POCKET, MEV] });
  assert.deepEqual(await pool.windowFlow(1_000_000, 1_007_167), { burns: 100n, mints: 0n }, "windowFlow over the 7168-block recent window succeeds (Pocket split by the unchanged anchor, concords with mevblocker)");
  assert.ok(served.length >= 2 && Math.max(...served) <= 5000, `Pocket was split into ≤ 5000-block sub-requests by rpc.ts (max ${String(Math.max(...served))})`);
});

// ── C-G2-2 — the EXACT order of the two Ukemi provider lists is load-bearing (C-6: quorum2 has no round-robin, so
// the order fixes the default pair and the U-4b load distribution) ⇒ pin it byte-for-byte. A reorder (even of the
// two Pocket-operator URLs, behaviourally immaterial) reds here, so a silent reshuffle can never land unreviewed. ─
test("pool_rpc_1a_provider_order_is_pinned — ETH_CALL_PROVIDERS and GET_LOGS_PROVIDERS hold the exact plan order (C-6; a swap reds — C-G2-2)", () => {
  assert.deepEqual(ETH_CALL_PROVIDERS, ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-pokt.nodies.app", "https://eth.api.pocket.network"],
    "eth_call: the proven providers lead (drpc, mevblocker), then the two Pocket-operator URLs (nodies, pocket) — swap reds (M-C6a)");
  assert.deepEqual(GET_LOGS_PROVIDERS, ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://mainnet.gateway.tenderly.co", "https://eth.api.pocket.network"],
    "getLogs: drpc, mevblocker, tenderly (kept, decision 102), pocket (trails) — swap reds (M-C6b)");
});
