// LOT U-4b-1b-1 (ruling QF-2) — non-LLM oracles for the PARAMETRISED labeler scripts/census/u3-realized.mjs.
// The PURE reducer is unchanged (byte-identical slice, condition (i-a)); these tests exercise ONLY the LIVE
// section's parametrisation and the security fix (no env key at module scope). Governance-only (root test/, not
// exported), like test/u3-realized.test.ts. Named mutants (F:\tmp\u4b1b1\mutants.mjs):
//   u4b_labels_replay                      <- defaults altered / reducer sort removed
//   u4b_labels_replay_synthetic_realform   <- window shifted (cluster filter)
//   u3_rawlogs_sha_mismatch_refused        <- rawlogs-sha check removed
//   u3_paid_archive_operator_refused...    <- isPaidOperator narrowed to a single label (helius slips)
//   u3_labeler_reads_no_env_at_module...   <- a process.env probe reintroduced
// A-8 (real-form bodies): the stub returns real JSON-RPC envelopes { jsonrpc, id, result } where result is a HEX
// string (eth_call), an OBJECT (eth_getBlockByNumber) and a BARE ARRAY (eth_getLogs); a GREEN run proves each is
// unwrapped correctly (oracle cross-check passes on the hex, the window resolves on the objects, the deficit amount
// equals the bare-array log's data). D-3: only globalThis.fetch is stubbed, never a fake client.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, copyFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { parseArgs, main, EVENTS, RAWLOGS_SHA, reduceU3, canonicalJsonl } from "../scripts/census/u3-realized.mjs";
import { keccak256, SEL, wordAddr, topicAddr } from "../apps/sentinel/src/ukemi/abi.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const FIX = join(HERE, "..", "apps", "sentinel", "test", "fixtures", "ukemi", "u3");
const LABELER = join(HERE, "..", "scripts", "census", "u3-realized.mjs");

// public, pinned constants (hardcoded so a mutant on the labeler's own copy is caught here, not masked).
const ORACLE_PINNED = "0x54586bE62E3c3580375aE3723C145253060Ca0C2";
const POOL = "0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2";
const DEFICIT_TOPIC = "0x2bccfb3fad376d59d7accf970515eb77b2f27b082c90ed0fb15583dd5a942699";
const SEL_BASE_UNIT = keccak256("BASE_CURRENCY_UNIT()").slice(0, 10);
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USER = "0x1111111111111111111111111111111111111111";
const LIQ = "0x2222222222222222222222222222222222222222";
const TX = "0x" + "ab".repeat(32);
const COMMITTED_META_KEYS = ["base_currency_unit", "chain_id", "events", "generated", "kind", "model", "oracle", "pool", "prereg_sha", "providers", "rawlogs_sha"];
const B4D93590 = "b4d93590f07b21017abe8ec2d980dee1f258a968395eb32497e6f9543b6f3923";
const D0F4AA1E = "d0f4aa1e23a3eaed6375dca4e6564b7123dfc9ed9b303c1cb7de84dbdae1a996";

const readJsonl = (p: string): Array<Record<string, unknown>> =>
  readFileSync(p, "utf8").split("\n").filter((l) => l.trim().length > 0).map((l) => JSON.parse(l) as Record<string, unknown>);
const shaBufOf = (p: string): string => createHash("sha256").update(readFileSync(p)).digest("hex");
const lfShaOf = (text: string): string => createHash("sha256").update(text.replace(/\r\n/g, "\n"), "utf8").digest("hex");

interface RpcReq { jsonrpc: string; id: number; method: string; params: unknown[]; }
const okResp = (id: number, result: unknown): Response =>
  ({ ok: true, status: 200, json: () => Promise.resolve({ jsonrpc: "2.0", id, result }) } as unknown as Response);
const failResp = (): Response => ({ ok: false, status: 500, json: () => Promise.resolve({}) } as unknown as Response);

/** A globalThis.fetch stub returning REAL-FORM JSON-RPC bodies for the minimal synthetic episode. eth_call bodies
 *  other than getPriceOracle / BASE_CURRENCY_UNIT fail (=> no_quorum => the row abstains on base amounts), as does
 *  the receipt (=> no xfers). Timestamps make firstBlockAtOrAfter resolve B_last = B_first. */
function makeStub(): { fetch: typeof fetch; calls: () => number } {
  let n = 0;
  const T = 1_700_000_000;
  const hashOf = (b: number): string => "0x" + b.toString(16).padStart(64, "0");
  const respond = (req: RpcReq): Response => {
    const id = req.id;
    if (req.method === "eth_getBlockByNumber") {
      if (req.params[0] === "finalized") return okResp(id, { number: "0x3e8" });
      const blk = parseInt(String(req.params[0]), 16);
      return okResp(id, { number: String(req.params[0]), hash: hashOf(blk), timestamp: "0x" + (blk <= 1000 ? T : T + 86401).toString(16) });
    }
    if (req.method === "eth_call") {
      const sel = String((req.params[0] as { data: string }).data).slice(0, 10);
      if (sel === SEL.getPriceOracle) return okResp(id, "0x" + wordAddr(ORACLE_PINNED)); // hex string (A-8)
      if (sel === SEL_BASE_UNIT) return okResp(id, "0x" + (100_000_000).toString(16).padStart(64, "0"));
      return failResp(); // getReserveData / getAssetPrice / getSourceOfAsset / description => abstain
    }
    if (req.method === "eth_getStorageAt") return okResp(id, "0x" + wordAddr("0x3333333333333333333333333333333333333333"));
    if (req.method === "eth_getLogs") {
      const topics = (req.params[0] as { topics: Array<string | null> }).topics;
      if (topics[0] === DEFICIT_TOPIC) {
        return okResp(id, [{ address: POOL, topics: [DEFICIT_TOPIC, topicAddr(USER), topicAddr(USDC)], data: "0x" + (123456).toString(16).padStart(64, "0"), blockNumber: "0x3e8", logIndex: "0x0", transactionHash: TX }]); // BARE ARRAY (A-8)
      }
      return okResp(id, []);
    }
    if (req.method === "eth_getTransactionReceipt") return failResp();
    throw new Error(`unexpected RPC method in stub: ${req.method}`);
  };
  const fetchStub = ((_url: string, init?: { body?: string }): Promise<Response> => {
    n += 1;
    return Promise.resolve(respond(JSON.parse(String(init?.body ?? "{}")) as RpcReq));
  }) as unknown as typeof fetch;
  return { fetch: fetchStub, calls: () => n };
}

/** Run the parametrised labeler over a minimal synthetic episode with the fetch stub; return the parsed artifacts. */
async function runSynthetic(extraArgs: string[] = []): Promise<{ realized: Array<Record<string, unknown>>; deficit: Array<Record<string, unknown>>; meta: Record<string, unknown>; calls: number }> {
  const dir = mkdtempSync(join(tmpdir(), "u3-param-"));
  const rawlogsPath = join(dir, "A-rawlogs.jsonl");
  const rawRow = { block: 1000, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1000000", liquidatedCollateralAmount: "500000000000000000", receiveAToken: false, tx: TX };
  writeFileSync(rawlogsPath, JSON.stringify(rawRow) + "\n");
  const preregText = "# synthetic prereg (u4b-1b-1 test)\n";
  const preregPath = join(dir, "prereg.md");
  writeFileSync(preregPath, preregText);
  const eventsPath = join(dir, "events.json");
  writeFileSync(eventsPath, JSON.stringify([{ id: "syn-weth", collateral: WETH, clusterLo: 1000, clusterHi: 1000, preV33: false }]));
  const outDir = join(dir, "out");
  const stub = makeStub();
  const realFetch = globalThis.fetch;
  globalThis.fetch = stub.fetch;
  try {
    await main({ env: {}, argv: [
      "--events", eventsPath, "--rawlogs", rawlogsPath, "--rawlogs-sha", shaBufOf(rawlogsPath),
      "--prereg-file", preregPath, "--prereg-sha", lfShaOf(preregText), "--out", outDir, "--raws-dir", join(dir, "raws"),
      "--max-calls", "100000", "--min-interval-ms", "0", ...extraArgs,
    ] });
  } finally { globalThis.fetch = realFetch; }
  const realized = readJsonl(join(outDir, "U3-realized.jsonl"));
  const deficit = readJsonl(join(outDir, "U3-deficit.jsonl"));
  const meta = readJsonl(join(outDir, "U3-inputs.jsonl"))[0]!;
  rmSync(dir, { recursive: true, force: true });
  return { realized, deficit, meta, calls: stub.calls() };
}

// -- (2a) default config = the pinned e2 values, AND the reducer is byte-identical (sha b4d93590). --
test("u4b_labels_replay", () => {
  const EXPECT_EVENTS = [
    { id: "e1-2025-02-21-susde", collateral: "0x9d39a5de30e57443bff2a8307a4256c8797a3497", clusterLo: 21895671, clusterHi: 21895693, preV33: true },
    { id: "e2-2025-10-10-weth", collateral: WETH, clusterLo: 23545088, clusterHi: 23557060, preV33: false },
    { id: "e3-2026-01-19-susde", collateral: "0x9d39a5de30e57443bff2a8307a4256c8797a3497", clusterLo: 24266439, clusterHi: 24266439, preV33: false },
  ];
  // parseArgs([]) must default to the e2 spec — compared to a LITERAL (not the mutable constant), so mutating
  // EVENTS/RAWLOGS_SHA in the labeler reddens this test (non-vacuous).
  assert.deepEqual(parseArgs([]).events, EXPECT_EVENTS, "default --events != the pinned e2 episode set");
  assert.equal(parseArgs([]).rawlogsSha, D0F4AA1E, "default --rawlogs-sha != the pinned e2 value");
  assert.deepEqual(EVENTS, EXPECT_EVENTS, "exported EVENTS drifted from the pinned e2 set");
  assert.equal(RAWLOGS_SHA, D0F4AA1E, "exported RAWLOGS_SHA drifted from the pinned e2 value");
  // reducer byte-identity: the committed inputs reduce to the pinned U3-realized.jsonl.
  const inputs = readJsonl(join(FIX, "U3-inputs.jsonl"));
  const out = reduceU3(inputs) as { realized: unknown[] };
  const realizedText = readFileSync(join(FIX, "U3-realized.jsonl"), "utf8").replace(/\r\n/g, "\n");
  assert.equal(canonicalJsonl(out.realized), realizedText, "reduceU3(U3-inputs) != committed U3-realized.jsonl");
  assert.equal(lfShaOf(realizedText), B4D93590, "committed U3-realized.jsonl LF sha drifted from the pin");
});

// -- (2b) --events synthetic episode on a real-form rawlogs fixture (A-8) => expected labels. --
test("u4b_labels_replay_synthetic_realform", async () => {
  const { realized, deficit, meta } = await runSynthetic();
  assert.equal(realized.length, 1, "one in-window call => one realized row");
  const r = realized[0]!;
  assert.equal(r.event_id, "syn-weth");
  assert.equal(r.user, USER);
  assert.equal(r.debt_asset, USDC);
  assert.equal(r.collateral_asset, WETH);
  assert.equal(r.n_calls, 1);
  assert.equal(r.first_block, 1000);
  assert.equal(r.last_block, 1000, "B_last must resolve to B_first via the eth_getBlockByNumber (object) bodies");
  assert.equal(r.repayment_native, "1000000", "repayment_native = the rawlogs debtToCover");
  assert.equal(r.seized_native, "500000000000000000", "seized_native = the rawlogs liquidatedCollateralAmount");
  assert.equal(r.repayment_base, null, "prices abstained (getAssetPrice no_quorum) => base is null");
  assert.equal(r.seized_base, null);
  assert.equal(r.deficit_native, "123456", "deficit_native = the BARE-ARRAY DeficitCreated log data (A-8 array unwrap)");
  assert.ok(Array.isArray(r.residual) && (r.residual).includes("deficit"), "the joined deficit is recorded");
  // deficit output row reflects the bare-array log.
  assert.equal(deficit.length, 1);
  assert.equal(deficit[0]!.amount, "123456");
  assert.equal(deficit[0]!.kind, "in_event");
  assert.equal(deficit[0]!.user, USER);
  // hex-string unwrap (eth_call): a wrong unwrap would fail the ORACLE_PINNED cross-check inside main().
  assert.equal(meta.oracle, ORACLE_PINNED.toLowerCase(), "oracle resolved from the hex eth_call body");
  assert.equal(meta.base_currency_unit, "100000000", "base unit resolved from the hex eth_call body");
  // byte-identity guard: a default run keeps EXACTLY the pinned 11 meta keys (no conditional field leaks).
  assert.deepEqual(Object.keys(meta).sort(), COMMITTED_META_KEYS, "default meta key set drifted from the pin");
});

// -- (2b bis) optional provenance fields are CONDITIONAL (advisor point 2: no unconditional new meta field). --
test("u3_optional_meta_fields_are_conditional", async () => {
  const { meta } = await runSynthetic(["--episode-tag", "syn-tag"]);
  assert.equal(meta.episode_tag, "syn-tag", "--episode-tag must be recorded when given");
  assert.deepEqual(Object.keys(meta).sort(), [...COMMITTED_META_KEYS, "episode_tag"].sort(), "--episode-tag adds exactly one key; archive fields never leak on a keyless run");
  assert.equal(meta.archive_operator, undefined);
  assert.equal(meta.allow_paid, undefined);
});

// -- (2c) a wrong --rawlogs-sha refuses BEFORE any fetch. --
test("u3_rawlogs_sha_mismatch_refused", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u3-sha-"));
  const rawlogsPath = join(dir, "A-rawlogs.jsonl");
  writeFileSync(rawlogsPath, JSON.stringify({ block: 1, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1", liquidatedCollateralAmount: "1", receiveAToken: false, tx: TX }) + "\n");
  const preregText = "# p\n"; const preregPath = join(dir, "prereg.md"); writeFileSync(preregPath, preregText);
  const stub = makeStub(); const realFetch = globalThis.fetch; globalThis.fetch = stub.fetch;
  try {
    await assert.rejects(
      main({ env: {}, argv: ["--rawlogs", rawlogsPath, "--rawlogs-sha", "0".repeat(64), "--prereg-file", preregPath, "--prereg-sha", lfShaOf(preregText), "--out", join(dir, "o"), "--raws-dir", join(dir, "r"), "--max-calls", "10", "--min-interval-ms", "0"] }),
      /sha256 .* != expected/,
      "a rawlogs-sha mismatch must throw",
    );
  } finally { globalThis.fetch = realFetch; }
  assert.equal(stub.calls(), 0, "a rawlogs-sha mismatch must refuse BEFORE any network fetch");
  rmSync(dir, { recursive: true, force: true });
});

// -- (2d) a PAID --archive-operator (chainstack AND helius) refuses fail-closed without --allow-paid, 0 fetch. --
test("u3_paid_archive_operator_refused_without_allow_paid", async () => {
  for (const label of ["chainstack", "helius", "Chainstack", "HELIUS"]) { // case variants (C-3) redden M7 (exact-list isPaidOperator)
    const dir = mkdtempSync(join(tmpdir(), "u3-paid-"));
    const rawlogsPath = join(dir, "A-rawlogs.jsonl");
    writeFileSync(rawlogsPath, JSON.stringify({ block: 1, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1", liquidatedCollateralAmount: "1", receiveAToken: false, tx: TX }) + "\n");
    const preregText = "# p\n"; const preregPath = join(dir, "prereg.md"); writeFileSync(preregPath, preregText);
    const stub = makeStub(); const realFetch = globalThis.fetch; globalThis.fetch = stub.fetch;
    try {
      await assert.rejects(
        // env carries the (fake, .invalid) key to prove the refusal is BY POLICY, not by an absent key.
        main({ env: { CHAINSTACK_ETH_URL: "https://chainstack.example.invalid/k", BELL_SOLANA_RPC: "https://sol.example.invalid", HELIUS_API_KEY: "fake" }, argv: ["--rawlogs", rawlogsPath, "--rawlogs-sha", shaBufOf(rawlogsPath), "--prereg-file", preregPath, "--prereg-sha", lfShaOf(preregText), "--out", join(dir, "o"), "--raws-dir", join(dir, "r"), "--max-calls", "10", "--min-interval-ms", "0", "--archive-operator", label] }),
        /refused fail-closed without --allow-paid/,
        `paid operator '${label}' must be refused without --allow-paid (this reddens the isPaidOperator single-label mutant)`,
      );
    } finally { globalThis.fetch = realFetch; }
    assert.equal(stub.calls(), 0, `paid operator '${label}' must be refused with 0 fetch`);
    rmSync(dir, { recursive: true, force: true });
  }
});

// -- (2e) the labeler probes NO env at module scope: process.env appears once (the deps.env injection). --
test("u3_labeler_reads_no_env_at_module_scope", () => {
  const src = readFileSync(LABELER, "utf8");
  const envHits = src.match(/process\.env/g) ?? [];
  assert.equal(envHits.length, 1, "process.env must appear EXACTLY once (the deps.env injection at the isMain entry)");
  assert.match(src, /main\(\{ env: process\.env, argv: process\.argv\.slice\(2\) \}\)/, "the sole process.env use must be the deps.env injection");
  assert.equal((src.match(/\benv\.(CHAINSTACK|HELIUS|POLYGON|DATABENTO|U3_MIN_INTERVAL_MS)/g) ?? []).length, 0, "no direct paid-key / interval env probe in the labeler");
});

// ============================================================================================
// CHECKPOINT-2 PLI (2026-09-22) - C-1..C-7. Redden survivor mutants M7/M9/M10/M11/M12 + "default --out
// reintroduced" + "1rpc.io admitted". Harness: F:\tmp\u4b1b1\mutants.mjs.
// ============================================================================================

// -- (C-1) composition from the REAL e2 artifact THROUGH main() (CA-11 durci). SKIPS NAMED where the out-of-repo
//    artifacts are absent (A-rawlogs.jsonl is gitignored; the pinned raws live out of repo). --
const REAL_RAWLOGS = join(HERE, "..", "docs", "census-2026-09-18", "data", "A-rawlogs.jsonl");
const REAL_RAWS_PIN = "F:\\PRODUITS\\etude-2026-09-20\\u3-raws-clean\\u3-reads.jsonl";
const REAL_PREREG = join(HERE, "..", "docs", "PLAN-u3-prereg.md");
const FINALIZED_BLOCK = 26015906; // the course's finalized block = getPriceOracle/BASE_CURRENCY_UNIT cache key (raws 0afaf605)
test("u4b_labels_replay_via_main_real_artifact", { skip: (existsSync(REAL_RAWLOGS) && existsSync(REAL_RAWS_PIN)) ? false : "real e2 artifacts absent (A-rawlogs.jsonl gitignored / u3-raws-clean out of repo)" }, async () => {
  const dir = mkdtempSync(join(tmpdir(), "u3-e2-"));
  try {
    const rawsDir = join(dir, "raws"); mkdirSync(rawsDir, { recursive: true });
    copyFileSync(REAL_RAWS_PIN, join(rawsDir, "u3-reads.jsonl")); // APPEND to the COPY, never the pin
    const preregSha = lfShaOf(readFileSync(REAL_PREREG, "utf8"));
    const outDir = join(dir, "out");
    let n = 0; const realFetch = globalThis.fetch;
    globalThis.fetch = ((_u: string, init?: { body?: string }): Promise<Response> => {
      n += 1;
      const req = JSON.parse(String(init?.body ?? "{}")) as RpcReq;
      if (req.method === "eth_getBlockByNumber" && req.params[0] === "finalized") return Promise.resolve(okResp(req.id, { number: "0x" + FINALIZED_BLOCK.toString(16) }));
      return Promise.resolve(failResp()); // anything else MUST be a cache hit; a real fetch => cache miss => the run fails
    }) as unknown as typeof fetch;
    try {
      // --rawlogs-sha and --events DEFAULT (= the e2 values); real rawlogs + copy of the pinned raws => pure cache replay.
      await main({ env: {}, argv: ["--rawlogs", REAL_RAWLOGS, "--prereg-file", REAL_PREREG, "--prereg-sha", preregSha, "--out", outDir, "--raws-dir", rawsDir, "--max-calls", "100000", "--min-interval-ms", "0"] });
    } finally { globalThis.fetch = realFetch; }
    const realizedText = readFileSync(join(outDir, "U3-realized.jsonl"), "utf8").replace(/\r\n/g, "\n");
    assert.equal(lfShaOf(realizedText), B4D93590, "main() over the REAL A-rawlogs + pinned raws must reproduce U3-realized.jsonl byte-identically");
    assert.equal(n, 2, "only the two finalized reads hit the network; every other read is a cache hit");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// -- (C-2) --operators filters the pool (M9) and a pool < 2 operators refuses with 0 fetch (M12). --
test("u3_operators_filter_and_quorum_floor", async () => {
  const req = await runSynthetic(["--operators", "drpc.org,mevblocker.io,pocket.network"]);
  const providers = req.meta.providers as string[];
  assert.deepEqual([...providers].sort(), ["drpc.org", "mevblocker.io", "pocket.network"], "meta.providers must equal the requested --operators set");
  assert.ok(!providers.includes("1rpc.io"), "1rpc.io must never appear");
  const dir = mkdtempSync(join(tmpdir(), "u3-quorum-"));
  const rawlogsPath = join(dir, "A-rawlogs.jsonl");
  writeFileSync(rawlogsPath, JSON.stringify({ block: 1, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1", liquidatedCollateralAmount: "1", receiveAToken: false, tx: TX }) + "\n");
  const preregText = "# p\n"; const preregPath = join(dir, "prereg.md"); writeFileSync(preregPath, preregText);
  const stub = makeStub(); const realFetch = globalThis.fetch; globalThis.fetch = stub.fetch;
  try {
    await assert.rejects(
      main({ env: {}, argv: ["--rawlogs", rawlogsPath, "--rawlogs-sha", shaBufOf(rawlogsPath), "--prereg-file", preregPath, "--prereg-sha", lfShaOf(preregText), "--out", join(dir, "o"), "--raws-dir", join(dir, "r"), "--max-calls", "10", "--min-interval-ms", "0", "--operators", "nobody.invalid"] }),
      /fewer than 2 quorum legs/,
      "an --operators set matching < 2 providers must refuse fail-closed",
    );
  } finally { globalThis.fetch = realFetch; }
  assert.equal(stub.calls(), 0, "the quorum-floor refusal must happen with 0 fetch");
  rmSync(dir, { recursive: true, force: true });
});

// -- (C-7) 1rpc.io is EXCLUDED from the default pool AND refused when named in --operators ("1rpc.io admitted"). --
test("u3_default_pool_excludes_1rpc_and_refuses_naming_it", async () => {
  const def = await runSynthetic();
  assert.ok(!(def.meta.providers as string[]).includes("1rpc.io"), "the DEFAULT keyless pool must exclude 1rpc.io (POOL-RPC-1a L-6)");
  const dir = mkdtempSync(join(tmpdir(), "u3-1rpc-"));
  const rawlogsPath = join(dir, "A-rawlogs.jsonl");
  writeFileSync(rawlogsPath, JSON.stringify({ block: 1, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1", liquidatedCollateralAmount: "1", receiveAToken: false, tx: TX }) + "\n");
  const preregText = "# p\n"; const preregPath = join(dir, "prereg.md"); writeFileSync(preregPath, preregText);
  const stub = makeStub(); const realFetch = globalThis.fetch; globalThis.fetch = stub.fetch;
  try {
    await assert.rejects(
      main({ env: {}, argv: ["--rawlogs", rawlogsPath, "--rawlogs-sha", shaBufOf(rawlogsPath), "--prereg-file", preregPath, "--prereg-sha", lfShaOf(preregText), "--out", join(dir, "o"), "--raws-dir", join(dir, "r"), "--max-calls", "10", "--min-interval-ms", "0", "--operators", "1rpc.io,drpc.org"] }),
      /EXCLUDED operator/,
      "an --operators naming 1rpc.io must refuse fail-closed",
    );
  } finally { globalThis.fetch = realFetch; }
  assert.equal(stub.calls(), 0, "the excluded-operator refusal must happen with 0 fetch");
  rmSync(dir, { recursive: true, force: true });
});

// -- (C-5) a wrong --prereg-sha refuses BEFORE any fetch (M11). --
test("u3_prereg_sha_mismatch_refused", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u3-prereg-"));
  const rawlogsPath = join(dir, "A-rawlogs.jsonl");
  writeFileSync(rawlogsPath, JSON.stringify({ block: 1, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1", liquidatedCollateralAmount: "1", receiveAToken: false, tx: TX }) + "\n");
  const preregText = "# p\n"; const preregPath = join(dir, "prereg.md"); writeFileSync(preregPath, preregText);
  const stub = makeStub(); const realFetch = globalThis.fetch; globalThis.fetch = stub.fetch;
  try {
    await assert.rejects(
      main({ env: {}, argv: ["--rawlogs", rawlogsPath, "--rawlogs-sha", shaBufOf(rawlogsPath), "--prereg-file", preregPath, "--prereg-sha", "0".repeat(64), "--out", join(dir, "o"), "--raws-dir", join(dir, "r"), "--max-calls", "10", "--min-interval-ms", "0"] }),
      /!= computed LF sha/,
      "a wrong --prereg-sha must throw (C-10)",
    );
  } finally { globalThis.fetch = realFetch; }
  assert.equal(stub.calls(), 0, "a prereg-sha mismatch must refuse BEFORE any network fetch");
  rmSync(dir, { recursive: true, force: true });
});

// -- (C-6) --out and --raws-dir are REQUIRED and refused under apps/sentinel/test/fixtures/ ("default --out reintroduced"). --
test("u3_out_and_rawsdir_required_out_of_fixtures", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u3-out-"));
  const rawlogsPath = join(dir, "A-rawlogs.jsonl");
  writeFileSync(rawlogsPath, JSON.stringify({ block: 1, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1", liquidatedCollateralAmount: "1", receiveAToken: false, tx: TX }) + "\n");
  const preregText = "# p\n"; const preregPath = join(dir, "prereg.md"); writeFileSync(preregPath, preregText);
  const base = ["--rawlogs", rawlogsPath, "--rawlogs-sha", shaBufOf(rawlogsPath), "--prereg-file", preregPath, "--prereg-sha", lfShaOf(preregText), "--max-calls", "10", "--min-interval-ms", "0"];
  const FIX_OUT = join(FIX, "clobber"); // under apps/sentinel/test/fixtures/
  const stub = makeStub(); const realFetch = globalThis.fetch; globalThis.fetch = stub.fetch;
  try {
    await assert.rejects(main({ env: {}, argv: [...base, "--raws-dir", join(dir, "r")] }), /--out .* is required/, "no --out must be refused (default would clobber the pinned series)");
    await assert.rejects(main({ env: {}, argv: [...base, "--out", join(dir, "o")] }), /--raws-dir .* is required/, "no --raws-dir must be refused");
    await assert.rejects(main({ env: {}, argv: [...base, "--out", FIX_OUT, "--raws-dir", join(dir, "r")] }), /resolves under apps\/sentinel\/test\/fixtures\/; refused fail-closed/, "--out under fixtures must be refused");
    await assert.rejects(main({ env: {}, argv: [...base, "--out", join(dir, "o"), "--raws-dir", join(FIX, "raws")] }), /resolves under apps\/sentinel\/test\/fixtures\/; refused fail-closed/, "--raws-dir under fixtures must be refused");
  } finally { globalThis.fetch = realFetch; }
  assert.equal(stub.calls(), 0, "all --out/--raws-dir refusals must happen with 0 fetch");
  rmSync(dir, { recursive: true, force: true });
});

// -- (C-4) the PAID archive leg is WIRED offline with --allow-paid: meta.archive_operator/allow_paid written (M10). --
test("u3_paid_archive_operator_wired_with_allow_paid", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u3-arch-"));
  try {
    const rawlogsPath = join(dir, "A-rawlogs.jsonl");
    writeFileSync(rawlogsPath, JSON.stringify({ block: 1000, logIndex: 0, collateral: WETH, debt: USDC, user: USER, liquidator: LIQ, debtToCover: "1000000", liquidatedCollateralAmount: "500000000000000000", receiveAToken: false, tx: TX }) + "\n");
    const preregText = "# synthetic prereg (paid)\n"; const preregPath = join(dir, "prereg.md"); writeFileSync(preregPath, preregText);
    const eventsPath = join(dir, "events.json");
    writeFileSync(eventsPath, JSON.stringify([{ id: "syn-weth", collateral: WETH, clusterLo: 1000, clusterHi: 1000, preV33: false }]));
    const ledgerDir = join(dir, "ledger"); mkdirSync(ledgerDir, { recursive: true }); // out of repo, pre-exists (CA-11)
    const outDir = join(dir, "out");
    const stub = makeStub(); const realFetch = globalThis.fetch; globalThis.fetch = stub.fetch;
    try {
      await main({
        env: { CHAINSTACK_ETH_URL: "https://chainstack.example.invalid/key" }, // resolved ONLY inside rpc-guard; never fetched (stubbed)
        argv: ["--events", eventsPath, "--rawlogs", rawlogsPath, "--rawlogs-sha", shaBufOf(rawlogsPath), "--prereg-file", preregPath, "--prereg-sha", lfShaOf(preregText), "--out", outDir, "--raws-dir", join(dir, "raws"), "--max-calls", "100000", "--min-interval-ms", "0", "--archive-operator", "chainstack", "--allow-paid", "--ledger-dir", ledgerDir, "--cycle", "cp2-c4", "--floor", "0", "--max-ru", "16000000", "--method-caps", '{"eth_call":100000,"eth_getBlockByNumber":100000,"eth_getStorageAt":100000,"eth_getLogs":100000,"eth_getTransactionReceipt":100000}'],
      });
    } finally { globalThis.fetch = realFetch; }
    const meta = readJsonl(join(outDir, "U3-inputs.jsonl"))[0]!;
    assert.equal(meta.archive_operator, "chainstack", "meta.archive_operator must record the paid leg");
    assert.equal(meta.allow_paid, true, "meta.allow_paid must be true (written to provenance)");
    assert.ok((meta.providers as string[]).includes("chainstack"), "chainstack must be a resolved operator on the quorum");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
