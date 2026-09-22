// U-4b-1b-2 — the PARAMETERISED D_e prober (u4-oracle-path.mjs) IN-PROCESS composition (A-8): run(argv, deps) with only
// globalThis.fetch stubbed, feeding REAL-FORM JSON-RPC hex bodies (the shape the node returns), on a SYNTHETIC
// episode-selection.json. Proves the prober decodes `resolved === body`, reads B0/B_last from the episode (NOT an e2
// default), verifies selection_sha256 (0 fetch on mismatch), and OMITS usdt when --usdt-blocks is absent. Pure helpers
// (emode-from-book, usdt-from-deficit) are covered too. NO network, keyless env {}.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { run, parseEpisodeFile, emodeCategoriesFromBook, usdtBlocksFromLabelerDeficit } from "../../../scripts/census/u4-oracle-path.mjs";
import { canon, sha256Hex } from "../../../scripts/census/u4-guard.mjs";
import { SEL, wordAddr, ANSWER_UPDATED_TOPIC0 } from "../src/ukemi/abi.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PREREG_U4B = createHash("sha256").update(readFileSync(join(ROOT, "docs", "PLAN-u4b-prereg.md"), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const AGG = "0x" + "a".repeat(40);
const B0 = 23_600_000, BLAST = 23_607_199; // a FRESH (non-e2) episode window
const word = (n: bigint): string => n.toString(16).padStart(64, "0");

/** Real-form AnswerUpdated logs (price = topics[1] int256, roundId topics[2], updatedAt = data word). */
const UPDATES = [{ block: B0 + 100, price: 200_000_000_000n }, { block: B0 + 200, price: 199_000_000_000n }, { block: B0 + 300, price: 201_000_000_000n }];
const answerLogs = UPDATES.map((u, i) => ({ address: AGG, blockNumber: "0x" + u.block.toString(16), logIndex: "0x" + i.toString(16), transactionHash: "0x" + "0".repeat(64), topics: [ANSWER_UPDATED_TOPIC0, "0x" + word(u.price), "0x" + word(BigInt(i + 1))], data: "0x" + word(1_700_000_000n) }));

const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
const rpcRevert = (): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted", data: "0x" } }), { status: 200, headers: { "content-type": "application/json" } });

/** Stub answering with REAL-FORM hex bodies. Counts fetches. cat 8 reverts (concordant revert => emode_raw['8'].error). */
function makeStub(counter: { n: number }): (input: string | URL, init?: RequestInit) => Promise<Response> {
  return (_input, init) => {
    counter.n++;
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_call") {
      const data = String((req.params[0] as { data: string }).data), sel = data.slice(0, 10);
      if (sel === SEL.aggregator) return Promise.resolve(jrpc("0x" + wordAddr(AGG)));
      if (sel === SEL.getAssetPrice) return Promise.resolve(jrpc("0x" + word(100_000_000n))); // USDT price 1e8
      if (sel === SEL.getEModeCategoryData) { const cat = BigInt("0x" + data.slice(-64)); return cat === 8n ? Promise.resolve(rpcRevert()) : Promise.resolve(jrpc("0x" + "00".repeat(160))); }
      return Promise.resolve(jrpc("0x" + word(0n)));
    }
    if (req.method === "eth_getLogs") { const t0 = String(((req.params[0] as { topics?: string[] }).topics ?? [])[0] ?? ""); return Promise.resolve(jrpc(t0.toLowerCase() === ANSWER_UPDATED_TOPIC0.toLowerCase() ? answerLogs : [])); }
    if (req.method === "eth_getBlockByNumber") return Promise.resolve(jrpc({ hash: "0x" + "0".repeat(64), number: "0x1", timestamp: "0x1" }));
    return Promise.resolve(jrpc(null));
  };
}
async function withFetch(stub: (i: string | URL, init?: RequestInit) => Promise<Response>, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch; globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = real; }
}

/** Write a synthetic episode-selection.json with a VALID selection_sha256 (same canon/sha256Hex the prober verifies). */
function writeEpisode(dir: string, over: Record<string, unknown> = {}): string {
  const payload = { schema: "ukemi-u4b-episode-selection/1", episode: { id: "weth-fresh", B_first: B0 + 1, B_last: BLAST, B0, n_distinct: 77, collateral: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" }, ...over };
  const file = { ...payload, version_check: "pending", selection_sha256: sha256Hex(canon(payload)) };
  const p = join(dir, "episode-selection.json");
  writeFileSync(p, JSON.stringify(file, null, 2));
  return p;
}
function baseArgs(dir: string, ep: string, extra: string[]): string[] {
  return ["--episode-file", ep, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_U4B, "--raws-dir", join(dir, "raws"),
    "--ledger-dir", join(dir, "ledger"), "--cycle", "u4bop", "--floor", "0", "--max-ru", "1000000", "--max-calls", "9999",
    "--method-caps", '{"eth_call":100000,"eth_getLogs":100000}', "--min-interval-ms", "0", ...extra];
}

// ============================================================================================================
// (1) A-8 composition: real-form bodies => decoded raws; B0/B_last from the episode (mutant 'B0 hardcoded' reds).
// ============================================================================================================
test("u4b_oracle_path_composes_real_form_bodies_and_reads_episode_bornes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-"));
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(dir, "ledger"), { recursive: true });
  try {
    const ep = writeEpisode(dir);
    const counter = { n: 0 };
    let res: { status: number; rawPath?: string } | undefined;
    await withFetch(makeStub(counter), async () => {
      res = await run(baseArgs(dir, ep, ["--usdt-blocks", "23601000,23602000", "--emode-categories", "1,2,8"]), { env: {}, now: () => 1_700_000_000_000 });
    });
    assert.equal(res!.status, 0, "run exits 0");
    assert.ok(counter.n > 0, "the prober actually fetched (real client, only fetch stubbed)");
    const raw = JSON.parse(readFileSync(res!.rawPath!, "utf8")) as { p_min: string; p_max: string; n_updates: number; usdt_prices: Record<string, string>; emode_raw: Record<string, unknown>; provenance: { episode_id: string; selection_sha256: string; params: { b0: number; b_last: number; feed_proxy_source: string; usdt_blocks_status: string; usdt_blocks: number[] } } };
    // A-8: resolved === body - the decoded values equal the stubbed real-form inputs.
    assert.equal(raw.n_updates, 3, "3 AnswerUpdated logs decoded from the real-form array body");
    assert.equal(raw.p_min, "199000000000", "p_min = min decoded price (topics[1] int256)");
    assert.equal(raw.p_max, "201000000000", "p_max = max decoded price");
    assert.deepEqual(raw.usdt_prices, { "23601000": "100000000", "23602000": "100000000" }, "usdt_prices decoded from getAssetPrice(USDT) real-form word");
    assert.equal((raw.emode_raw["8"] as { error?: string }).error, "ConcordantRevertError", "e-mode 8 concordant revert recognised (real-form rpc error)");
    assert.equal(typeof raw.emode_raw["1"], "string", "e-mode 1 raw hex stored");
    // the D_e bornes came from the EPISODE, not an e2 default (mutant 'B0=23545087 hardcoded reintroduced' reds).
    assert.equal(raw.provenance.params.b0, B0, "b0 == episode.B0 (parameterised)");
    assert.equal(raw.provenance.params.b_last, BLAST, "b_last == episode.B_last");
    assert.notEqual(raw.provenance.params.b0, 23545087, "b0 is NOT the e2 conception default");
    assert.equal(raw.provenance.params.feed_proxy_source, "default §DISC:28", "feed_proxy default documented in provenance");
    assert.equal(raw.provenance.episode_id, "weth-fresh", "episode_id in provenance");
    assert.equal(raw.provenance.selection_sha256.length, 64, "selection_sha256 in provenance");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (2) --usdt-blocks ABSENT => usdt_prices {} + usdt_blocks_status 'omitted' (C-7; mutant 'always provided' reds).
// ============================================================================================================
test("u4b_oracle_path_omits_usdt_when_flag_absent", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-om-"));
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(dir, "ledger"), { recursive: true });
  try {
    const ep = writeEpisode(dir);
    let res: { status: number; rawPath?: string } | undefined;
    await withFetch(makeStub({ n: 0 }), async () => {
      res = await run(baseArgs(dir, ep, ["--emode-categories", "1,2"]), { env: {}, now: () => 1_700_000_000_000 });
    });
    const raw = JSON.parse(readFileSync(res!.rawPath!, "utf8")) as { usdt_prices: Record<string, string>; provenance: { params: { usdt_blocks_status: string; usdt_blocks: number[] } } };
    assert.deepEqual(raw.usdt_prices, {}, "no usdt_prices when --usdt-blocks absent");
    assert.equal(raw.provenance.params.usdt_blocks_status, "omitted", "usdt_blocks_status = omitted (C-7)");
    assert.deepEqual(raw.provenance.params.usdt_blocks, [], "usdt_blocks = [] when omitted");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (3) fail-closed: tampered selection_sha256 => refuse 0 fetch; both emode sources absent => fail-closed.
// ============================================================================================================
test("u4b_oracle_path_refuses_a_tampered_selection_sha_with_zero_fetch", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-tam-"));
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(dir, "ledger"), { recursive: true });
  try {
    const ep = writeEpisode(dir);
    const f = JSON.parse(readFileSync(ep, "utf8")) as { episode: { B0: number } };
    f.episode.B0 = f.episode.B0 + 1; // tamper the sha'd payload
    writeFileSync(ep, JSON.stringify(f));
    const counter = { n: 0 };
    await withFetch(makeStub(counter), async () => {
      await assert.rejects(run(baseArgs(dir, ep, ["--emode-categories", "1"]), { env: {}, now: () => 1_700_000_000_000 }), /selection_sha256 mismatch/, "a tampered episode-selection.json is refused");
    });
    assert.equal(counter.n, 0, "the sha refusal does 0 fetch (fail-closed pre-flight)");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("u4b_oracle_path_fail_closed_when_no_emode_source", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-em-"));
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(dir, "ledger"), { recursive: true });
  try {
    const ep = writeEpisode(dir);
    await assert.rejects(run(baseArgs(dir, ep, []), { env: {}, now: () => 1_700_000_000_000 }), /--emode-categories .* or --book .* required/, "neither --emode-categories nor --book => fail-closed (e2 EMODE default GONE)");
    await assert.rejects(run(["--episode-file", ep, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_U4B, "--emode-categories", "1", "--ledger-dir", join(dir, "ledger"), "--cycle", "x", "--floor", "0", "--max-ru", "1", "--max-calls", "1", "--method-caps", "{}"], { env: {}, now: () => 1 }), /--raws-dir/, "missing --raws-dir => named fail-closed (no e2 default)");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (3b) V-M9 real guard: on a PHASE CHANGE (aggregator@B0 != aggregator@B_last) the prober UNIONS the AnswerUpdated logs
// of BOTH aggregators. Mutant "aggs = [aggB0]" (union collapsed) drops the second aggregator's logs => n_updates reds.
// ============================================================================================================
test("u4b_oracle_path_unions_both_aggregators_on_phase_change", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-ph-"));
  const { mkdirSync } = await import("node:fs");
  mkdirSync(join(dir, "ledger"), { recursive: true });
  const AGG2 = "0x" + "b".repeat(40);
  const logsB0 = [{ address: AGG, block: B0 + 100, price: 200_000_000_000n, i: 0 }, { address: AGG, block: B0 + 200, price: 201_000_000_000n, i: 1 }];
  const logsLast = [{ address: AGG2, block: B0 + 250, price: 199_000_000_000n, i: 0 }];
  const mkLog = (l: { address: string; block: number; price: bigint; i: number }) => ({ address: l.address, blockNumber: "0x" + l.block.toString(16), logIndex: "0x" + l.i.toString(16), transactionHash: "0x" + "0".repeat(64), topics: [ANSWER_UPDATED_TOPIC0, "0x" + word(l.price), "0x" + word(1n)], data: "0x" + word(1_700_000_000n) });
  const stub = (_i: string | URL, init?: RequestInit): Promise<Response> => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_call") { const p = req.params as [{ data: string }, string]; if (p[0].data.slice(0, 10) === SEL.aggregator) return Promise.resolve(jrpc("0x" + wordAddr(parseInt(p[1], 16) <= B0 ? AGG : AGG2))); if (p[0].data.slice(0, 10) === SEL.getEModeCategoryData) return Promise.resolve(jrpc("0x" + "00".repeat(160))); return Promise.resolve(jrpc("0x" + word(0n))); }
    if (req.method === "eth_getLogs") { const addr = String((req.params[0] as { address: string }).address).toLowerCase(); const src = addr === AGG.toLowerCase() ? logsB0 : addr === AGG2.toLowerCase() ? logsLast : []; return Promise.resolve(jrpc(src.map(mkLog))); }
    return Promise.resolve(jrpc(null));
  };
  try {
    const ep = writeEpisode(dir);
    let res: { status: number; rawPath?: string } | undefined;
    await withFetch(stub, async () => { res = await run(baseArgs(dir, ep, ["--emode-categories", "1"]), { env: {}, now: () => 1_700_000_000_000 }); });
    const raw = JSON.parse(readFileSync(res!.rawPath!, "utf8")) as { n_updates: number; p_min: string; p_max: string; aggregator: { phase_change: boolean } };
    assert.equal(raw.aggregator.phase_change, true, "aggregator@B0 != aggregator@B_last => phase change");
    assert.equal(raw.n_updates, 3, "the 2 logs of aggB0 UNION the 1 log of aggLast (mutant 'aggs=[aggB0]' => 2 => reds)");
    assert.equal(raw.p_min, "199000000000", "p_min includes the second aggregator's log");
    assert.equal(raw.p_max, "201000000000", "p_max from the first aggregator");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (4) parseEpisodeFile + pure helpers (emode-from-book, usdt-from-deficit) — C-7 documented derivations.
// ============================================================================================================
test("u4b_oracle_path_pure_helpers", () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-h-"));
  try {
    const ep = writeEpisode(dir);
    const parsed = parseEpisodeFile(ep);
    assert.equal(parsed.B0, B0, "parseEpisodeFile returns episode.B0");
    assert.equal(parsed.bLast, BLAST, "parseEpisodeFile returns episode.B_last");
    // emode from a recorder book (accounts[].emode) — distinct nonzero, sorted.
    const book = { accounts: [{ emode: "0" }, { emode: "3" }, { emode: "1" }, { emode: "3" }, { emode: "0" }] };
    assert.deepEqual(emodeCategoriesFromBook(book), [1, 3], "distinct nonzero e-mode categories from the book, sorted");
    // usdt blocks from the labeler U3-deficit.jsonl (debt_asset == USDT), sorted distinct.
    const deficit = [
      JSON.stringify({ kind: "deficit", block: 23602000, debt_asset: USDT }),
      JSON.stringify({ kind: "deficit", block: 23601000, debt_asset: USDT }),
      JSON.stringify({ kind: "deficit", block: 23601000, debt_asset: USDT }),
      JSON.stringify({ kind: "deficit", block: 23603000, debt_asset: "0xdead" }),
    ].join("\n");
    assert.deepEqual(usdtBlocksFromLabelerDeficit(deficit), [23601000, 23602000], "USDT deficit blocks derived, sorted distinct (non-USDT dropped)");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
