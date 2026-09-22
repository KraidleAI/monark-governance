// U-4b-1b-2 — the PARAMETERISED D_e prober (u4-oracle-path.mjs) IN-PROCESS composition (A-8): run(argv, deps) with only
// globalThis.fetch stubbed, feeding REAL-FORM JSON-RPC hex bodies (the shape the node returns), on a SYNTHETIC
// episode-selection.json. Proves the prober decodes `resolved === body`, reads B0/B_last from the episode (NOT an e2
// default), verifies selection_sha256 (0 fetch on mismatch), and OMITS usdt when --usdt-blocks is absent. Pure helpers
// (emode-from-book, usdt-from-deficit) are covered too. NO network, keyless env {}.
// Lot U-4b-1b-4 (R-I / R-H, cp-1 C-1/C-4/C-5): the stub HONOURS fromBlock/toBlock; the pre-B0 anchor lookback (last event
// <= B0, widening, cap exhausted => exit 3 and no raw) and the helper on the REAL e2 labels are proven here, and the
// prober raw is fed to the FROZEN reducer (child process) whose embedded scorer consumes the anchor + the USDT block.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { run, parseEpisodeFile, emodeCategoriesFromBook, usdtBlocksFromLabelerDeficit, preB0Windows, pickPreB0Anchor, PRE_B0_FIRST_DEPTH, DEFAULT_PRE_B0_MAX_WINDOWS, EXIT_PRE_B0_ANCHOR_STOP } from "../../../scripts/census/u4-oracle-path.mjs";
import { canon, sha256Hex } from "../../../scripts/census/u4-guard.mjs";
import { computeScoresU4b, type U4bBook, type U4bOracle, type U4bU3Line } from "../../../scripts/census/u4b/u4b-scores.mjs";
import { SEL, wordAddr, ANSWER_UPDATED_TOPIC0 } from "../src/ukemi/abi.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PREREG_U4B = createHash("sha256").update(readFileSync(join(ROOT, "docs", "PLAN-u4b-prereg.md"), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const AGG = "0x" + "a".repeat(40);
const B0 = 23_600_000, BLAST = 23_607_199; // a FRESH (non-e2) episode window
const word = (n: bigint): string => n.toString(16).padStart(64, "0");

/** Real-form AnswerUpdated logs (price = topics[1] int256, roundId topics[2], updatedAt = data word). */
interface Ev { block: number; price: bigint; logIndex: number; round: bigint }
const mkLog = (e: Ev): { address: string; blockNumber: string; logIndex: string; transactionHash: string; topics: string[]; data: string } =>
  ({ address: AGG, blockNumber: "0x" + e.block.toString(16), logIndex: "0x" + e.logIndex.toString(16), transactionHash: "0x" + "0".repeat(64), topics: [ANSWER_UPDATED_TOPIC0, "0x" + word(e.price), "0x" + word(e.round)], data: "0x" + word(1_700_000_000n) });
const UPDATES: Ev[] = [{ block: B0 + 100, price: 200_000_000_000n, logIndex: 0, round: 1n }, { block: B0 + 200, price: 199_000_000_000n, logIndex: 1, round: 2n }, { block: B0 + 300, price: 201_000_000_000n, logIndex: 2, round: 3n }];
/** The pre-B0 event the anchor lookback must find (window 1 = [B0 - 9990, B0]). */
const PRE_B0: Ev = { block: B0 - 50, price: 198_500_000_000n, logIndex: 3, round: 0n };
const U3 = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "ukemi", "u3");
const U4B = join(dirname(fileURLToPath(import.meta.url)), "fixtures", "ukemi", "u4b");

const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
const rpcRevert = (): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, error: { code: 3, message: "execution reverted", data: "0x" } }), { status: 200, headers: { "content-type": "application/json" } });

/** Stub answering with REAL-FORM hex bodies. Counts fetches. cat 8 reverts (concordant revert => emode_raw['8'].error).
 *  eth_getLogs returns ONLY the events inside [fromBlock, toBlock] (cp-1 C-5) and logs every requested range. */
function makeStub(counter: { n: number }, events: readonly Ev[] = [PRE_B0, ...UPDATES], ranges: Array<[number, number]> = []): (input: string | URL, init?: RequestInit) => Promise<Response> {
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
    if (req.method === "eth_getLogs") {
      const q = req.params[0] as { topics?: string[]; fromBlock: string; toBlock: string };
      if (String((q.topics ?? [])[0] ?? "").toLowerCase() !== ANSWER_UPDATED_TOPIC0.toLowerCase()) return Promise.resolve(jrpc([]));
      const lo = parseInt(q.fromBlock, 16), hi = parseInt(q.toBlock, 16);
      ranges.push([lo, hi]);
      return Promise.resolve(jrpc(events.filter((e) => e.block >= lo && e.block <= hi).map(mkLog)));
    }
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
    const epBytes = readFileSync(ep, "utf8");
    const counter = { n: 0 };
    let res: { status: number; rawPath?: string } | undefined;
    await withFetch(makeStub(counter), async () => {
      res = await run(baseArgs(dir, ep, ["--usdt-blocks", "23601000,23602000", "--emode-categories", "1,2,8"]), { env: {}, now: () => 1_700_000_000_000 });
    });
    assert.equal(res!.status, 0, "run exits 0");
    assert.ok(counter.n > 0, "the prober actually fetched (real client, only fetch stubbed)");
    const raw = JSON.parse(readFileSync(res!.rawPath!, "utf8")) as { p_min: string; p_max: string; n_updates: number; usdt_prices: Record<string, string>; emode_raw: Record<string, unknown>; pre_b0_anchor: unknown; provenance: { episode_id: string; selection_sha256: string; pre_b0_anchor_window: unknown; params: { b0: number; b_last: number; feed_proxy_source: string; usdt_blocks_status: string; usdt_blocks: number[]; pre_b0_max_windows: number } } };
    // R-I (A-8): resolved === body for the pre-B0 event; the episode file is untouched (selection_sha256 unchanged).
    assert.deepEqual(raw.pre_b0_anchor, { price: "198500000000", block: B0 - 50, log_index: 3, round_id: "0" }, "pre_b0_anchor = the stubbed pre-B0 AnswerUpdated (cp-1 C-4 form)");
    assert.deepEqual(raw.provenance.pre_b0_anchor_window, { from: B0 - PRE_B0_FIRST_DEPTH, to: B0, windows_tried: 1, calls: 4 }, "window 1 [B0-9990, B0] = 2 getLogs pieces (<= 9990 blocks) x quorum-2");
    assert.equal(raw.provenance.params.pre_b0_max_windows, DEFAULT_PRE_B0_MAX_WINDOWS, "the named default cap (ADDENDUM section 2: 6)");
    assert.equal(readFileSync(ep, "utf8"), epBytes, "episode-selection.json is byte-identical after the run");
    assert.equal(raw.provenance.selection_sha256, (JSON.parse(epBytes) as { selection_sha256: string }).selection_sha256, "provenance carries the UNCHANGED selection_sha256");
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
  const logsB0 = [{ address: AGG, block: B0 - 10, price: 200_500_000_000n, i: 0 }, { address: AGG, block: B0 + 100, price: 200_000_000_000n, i: 0 }, { address: AGG, block: B0 + 200, price: 201_000_000_000n, i: 1 }];
  const logsLast = [{ address: AGG2, block: B0 + 250, price: 199_000_000_000n, i: 0 }];
  const mkLogPh = (l: { address: string; block: number; price: bigint; i: number }) => ({ address: l.address, blockNumber: "0x" + l.block.toString(16), logIndex: "0x" + l.i.toString(16), transactionHash: "0x" + "0".repeat(64), topics: [ANSWER_UPDATED_TOPIC0, "0x" + word(l.price), "0x" + word(1n)], data: "0x" + word(1_700_000_000n) });
  const stub = (_i: string | URL, init?: RequestInit): Promise<Response> => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_call") { const p = req.params as [{ data: string }, string]; if (p[0].data.slice(0, 10) === SEL.aggregator) return Promise.resolve(jrpc("0x" + wordAddr(parseInt(p[1], 16) <= B0 ? AGG : AGG2))); if (p[0].data.slice(0, 10) === SEL.getEModeCategoryData) return Promise.resolve(jrpc("0x" + "00".repeat(160))); return Promise.resolve(jrpc("0x" + word(0n))); }
    if (req.method === "eth_getLogs") { const q = req.params[0] as { address: string; fromBlock: string; toBlock: string }; const addr = q.address.toLowerCase(); const lo = parseInt(q.fromBlock, 16), hi = parseInt(q.toBlock, 16); const src = addr === AGG.toLowerCase() ? logsB0 : addr === AGG2.toLowerCase() ? logsLast : []; return Promise.resolve(jrpc(src.filter((l) => l.block >= lo && l.block <= hi).map(mkLogPh))); }
    return Promise.resolve(jrpc(null));
  };
  try {
    const ep = writeEpisode(dir);
    let res: { status: number; rawPath?: string } | undefined;
    await withFetch(stub, async () => { res = await run(baseArgs(dir, ep, ["--emode-categories", "1"]), { env: {}, now: () => 1_700_000_000_000 }); });
    const raw = JSON.parse(readFileSync(res!.rawPath!, "utf8")) as { n_updates: number; p_min: string; p_max: string; aggregator: { phase_change: boolean } };
    assert.equal(raw.aggregator.phase_change, true, "aggregator@B0 != aggregator@B_last => phase change");
    assert.equal(raw.n_updates, 3, "the 2 logs of aggB0 UNION the 1 log of aggLast (mutant 'aggs=[aggB0]' => 2 => reds); the pre-B0 anchor stays out");
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
    // (the synthetic kind:"deficit" helper vector is REMOVED here - lot U-4b-1b-4, cp-1 C-1(ii): that is the U3-inputs
    // line form, never what the scorer reads; the helper is now proven on the REAL e2 labels in the test below.)
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (5) R-H (cp-1 C-1(ii)): the helper on the REAL e2 labels == the blocks the FROZEN scorer reads; the cell digests are
// unchanged with usdt_prices reduced to the required blocks; a NON-USDT deficit_base_no_price line is refused.
// ============================================================================================================
function loadE2(): { book: U4bBook; oracle: U4bOracle; u3: U4bU3Line[] } {
  const lines = (p: string): unknown[] => readFileSync(p, "utf8").split(/\r?\n/).filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as unknown);
  const o = lines(join(U4B, "U4b-oracle-path-e2.jsonl")) as Array<{ kind: string; price: string; event_id: string; emode_params: Record<string, { lt: string; bonus: string }>; usdt_prices: Record<string, string>; block: number; log_index: number }>;
  const anchor = o.find((l) => l.kind === "anchor"), meta = o.find((l) => l.kind === "meta");
  if (anchor === undefined || meta === undefined) throw new Error("e2 oracle fixture: anchor/meta missing");
  const book = JSON.parse(readFileSync(join(U4B, "U4b-book-23545087.json"), "utf8")) as U4bBook;
  return { book, oracle: { event_id: meta.event_id, anchor_price: anchor.price, updates: o.filter((l) => l.kind === "update"), emode_params: meta.emode_params, usdt_prices: meta.usdt_prices }, u3: lines(join(U3, "U3-realized.jsonl")) as U4bU3Line[] };
}
const byNum = (a: number, b: number): number => a - b;

test("u4b_usdt_blocks_helper_on_real_e2_labels_is_what_the_frozen_scorer_reads", () => {
  const realized = readFileSync(join(U3, "U3-realized.jsonl"), "utf8"), inputs = readFileSync(join(U3, "U3-inputs.jsonl"), "utf8");
  const r = usdtBlocksFromLabelerDeficit(realized, inputs);
  assert.deepEqual(r.required, [23550406], "required = first_block of the e2 deficit_base_no_price USDT line (scorer predicate)");
  assert.deepEqual(r.optional, [23550879], "optional = the USDT DeficitCreated block of the SAME user (costed; never read by the scorer)");
  const { book, oracle, u3 } = loadE2();
  assert.deepEqual(r.blocks, Object.keys(oracle.usdt_prices ?? {}).map(Number).sort(byNum), "required + optional = exactly the usdt_prices keys of the committed e2 oracle fixture");
  assert.deepEqual(usdtBlocksFromLabelerDeficit(realized).optional, [], "no U3-inputs => no optional block");
  const read = new Set<string>();
  const spy = new Proxy({ ...(oracle.usdt_prices ?? {}) }, { get: (t, k): unknown => { if (typeof k === "string") read.add(k); return Reflect.get(t, k) as unknown; } });
  computeScoresU4b(book, { ...oracle, usdt_prices: spy }, u3);
  assert.deepEqual([...read].map(Number).sort(byNum), r.required, "the frozen scorer reads EXACTLY the required blocks (observed, not assumed)");
  const only = Object.fromEntries(r.required.map((b) => [String(b), (oracle.usdt_prices ?? {})[String(b)] ?? ""]));
  const s = computeScoresU4b(book, { ...oracle, usdt_prices: only }, u3);
  assert.equal(s.cellA.calib_digest, "2feb4ab057613925c9ed77dbec4f186044375b223d5ea520df3ec82d63524720", "cell A e2 digest unchanged with usdt_prices reduced to the required blocks");
  assert.equal(s.cellB.calib_digest, "07bb8e3b1f35a95f5679f013133cc3e87540e01177279ccfe9ec6f4f8dfb8b0f", "cell B e2 digest unchanged");
  assert.equal(s.census.deficit_lines_priced_from_usdt, 1, "the one e2 USDT deficit line is priced from the required block");
  const nonUsdt = realized.split(/\r?\n/).map((l) => (l.includes("deficit_base_no_price") ? l.replace(USDT, "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48") : l)).join("\n");
  assert.throws(() => usdtBlocksFromLabelerDeficit(nonUsdt), /NON-USDT debt asset/, "a NON-USDT deficit_base_no_price line (real form, asset swapped) is refused by name");
});

// ============================================================================================================
// (6) R-I pure pieces: the receding windows of the ADDENDUM (section 2) and the LAST event at or below the window top.
// ============================================================================================================
test("u4b_pre_b0_windows_recede_disjoint_and_the_anchor_is_the_last_event_at_or_below_B0", () => {
  assert.equal(PRE_B0_FIRST_DEPTH, 9990, "initial depth 9990 (ADDENDUM section 2)");
  assert.equal(DEFAULT_PRE_B0_MAX_WINDOWS, 6, "cap = 6 windows (ADDENDUM section 2)");
  assert.equal(EXIT_PRE_B0_ANCHOR_STOP, 3, "named STOP status");
  assert.deepEqual(preB0Windows(1_000_000, 6), [[990010, 1000000], [980020, 990009], [960040, 980019], [920080, 960039], [840160, 920079], [680320, 840159]], "depth x2 per window, only the NEW part fetched, newest first");
  assert.deepEqual(preB0Windows(15_000, 6), [[5010, 15000], [0, 5009]], "clamped at block 0 (then stops)");
  const logs = [{ block: B0 - 3000, price: 1n, logIndex: 0, round: 7n }, { block: B0 - 50, price: 2n, logIndex: 1, round: 8n }, { block: B0 - 50, price: 3n, logIndex: 4, round: 9n }, { block: B0 + 100, price: 4n, logIndex: 0, round: 10n }].map(mkLog);
  assert.deepEqual(pickPreB0Anchor(logs, B0 - 9990, B0), { price: "3", block: B0 - 50, log_index: 4, round_id: "9" }, "the LAST (block, logIndex) <= B0 - never the first, never the event above B0");
  assert.equal(pickPreB0Anchor([mkLog({ block: B0 + 100, price: 4n, logIndex: 0, round: 1n })], B0 - 9990, B0), null, "an event of [B0, B_last] is never the anchor (a range-ignoring node is filtered)");
});

// ============================================================================================================
// (7) R-I in the REAL run: found after ONE widening; cap exhausted => exit 3, NO raw, locks released; bad cap refused.
// ============================================================================================================
test("u4b_oracle_path_pre_b0_anchor_found_after_widening", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-wd-"));
  mkdirSync(join(dir, "ledger"), { recursive: true });
  try {
    const deep: Ev = { block: B0 - 15_000, price: 197_000_000_000n, logIndex: 2, round: 5n };
    const ranges: Array<[number, number]> = [];
    let res: { status: number; rawPath?: string } | undefined;
    await withFetch(makeStub({ n: 0 }, [deep, ...UPDATES], ranges), async () => { res = await run(baseArgs(dir, writeEpisode(dir), ["--emode-categories", "1"]), { env: {}, now: () => 1 }); });
    assert.equal(res!.status, 0, "anchor found => exit 0");
    const raw = JSON.parse(readFileSync(res!.rawPath!, "utf8")) as { pre_b0_anchor: unknown; provenance: { pre_b0_anchor_window: { windows_tried: number; from: number } } };
    assert.deepEqual(raw.pre_b0_anchor, { price: "197000000000", block: B0 - 15_000, log_index: 2, round_id: "5" }, "the event of window 2 is the anchor");
    assert.equal(raw.provenance.pre_b0_anchor_window.windows_tried, 2, "found on the FIRST widening (window 2)");
    assert.equal(raw.provenance.pre_b0_anchor_window.from, B0 - 2 * PRE_B0_FIRST_DEPTH, "window 2 reaches depth 19980");
    assert.ok(ranges.some(([lo, hi]) => lo === B0 - 2 * PRE_B0_FIRST_DEPTH && hi === B0 - PRE_B0_FIRST_DEPTH - 1), "window 2 fetched ONLY its new part [B0-19980, B0-9991]");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test("u4b_oracle_path_pre_b0_anchor_cap_exhausted_stops_without_raw", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-ex-"));
  mkdirSync(join(dir, "ledger"), { recursive: true });
  const errs: string[] = [];
  const realErr = process.stderr.write.bind(process.stderr);
  try {
    const ranges: Array<[number, number]> = [];
    let res: { status: number; rawPath?: string } | undefined;
    process.stderr.write = (s: string | Uint8Array): boolean => { errs.push(String(s)); return true; };
    try {
      await withFetch(makeStub({ n: 0 }, UPDATES, ranges), async () => { res = await run(baseArgs(dir, writeEpisode(dir), ["--emode-categories", "1", "--pre-b0-max-windows", "2"]), { env: {}, now: () => 1 }); });
    } finally { process.stderr.write = realErr; }
    assert.equal(res!.status, EXIT_PRE_B0_ANCHOR_STOP, "no AnswerUpdated <= B0 within the cap => named STOP, exit 3 (never the book fallback)");
    assert.equal(res!.rawPath, undefined, "no raw path returned");
    assert.equal(existsSync(join(dir, "raws", "U4-oracle-path-weth-fresh.raw.json")), false, "NO raw written");
    assert.equal(existsSync(join(dir, "raws", "U4-oracle-inputs.jsonl")), false, "NO inputs cache written");
    assert.deepEqual([...new Set(ranges.map((r) => r.join(",")))], [[B0 - PRE_B0_FIRST_DEPTH, B0 - 1], [B0, B0], [B0 - 2 * PRE_B0_FIRST_DEPTH, B0 - PRE_B0_FIRST_DEPTH - 1]].map((r) => r.join(",")), "exactly the 2 capped windows were read (window 1 = 2 pieces of <= 9990 blocks), nothing else, no [B0, B_last] read");
    assert.ok(errs.some((e) => /PRE-B0 ANCHOR STOP/.test(e) && /NO raw written/.test(e)), "the STOP is named on stderr");
    assert.deepEqual(readdirSync(join(dir, "ledger", "u4bop")).filter((f) => f.endsWith(".lock")), [], "every lock released (the finally unlockAll ran)");
  } finally { process.stderr.write = realErr; rmSync(dir, { recursive: true, force: true }); }
});

test("u4b_oracle_path_pre_b0_max_windows_flag_is_refused_unless_positive_integer", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-fl-"));
  mkdirSync(join(dir, "ledger"), { recursive: true });
  try {
    const counter = { n: 0 };
    for (const bad of ["0", "-1", "2.5", "six"]) {
      await withFetch(makeStub(counter), async () => {
        await assert.rejects(run(baseArgs(dir, writeEpisode(dir), ["--emode-categories", "1", "--pre-b0-max-windows", bad]), { env: {}, now: () => 1 }), /--pre-b0-max-windows must be a positive integer/, `--pre-b0-max-windows ${bad} refused`);
      });
    }
    assert.equal(counter.n, 0, "refused before any fetch");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (8) C-1(i) COMPOSITION from the real artefacts: helper (real e2 labels) -> REAL prober run (only fetch stubbed) -> raw ->
// FROZEN u4b-reduce.mjs in a child process -> anchor line source answer_updated_pre_b0 == the stubbed pre-B0 event, and the
// scorer it embeds consumed the anchor (cell anchor_price) and the USDT block (deficit_lines_priced_from_usdt). The book raw
// is the recorder envelope {provenance, book} around the committed e2 reduced book (reserves, 0 accounts): the recorder is
// out of this lot; the ORACLE raw is never hand-built.
// ============================================================================================================
test("u4b_anchor_and_usdt_blocks_compose_prober_to_frozen_reducer_and_scorer", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bop-ch-"));
  mkdirSync(join(dir, "ledger"), { recursive: true });
  try {
    const labels = join(U3, "U3-realized.jsonl");
    const { required } = usdtBlocksFromLabelerDeficit(readFileSync(labels, "utf8"));
    let res: { status: number; rawPath?: string } | undefined;
    await withFetch(makeStub({ n: 0 }), async () => { res = await run(baseArgs(dir, writeEpisode(dir), ["--usdt-blocks", required.join(","), "--emode-categories", "1"]), { env: {}, now: () => 1 }); });
    assert.equal(res!.status, 0, "prober exit 0");
    const book = JSON.parse(readFileSync(join(U4B, "U4b-book-23545087.json"), "utf8")) as U4bBook & { book_digest: string; schema: string; chain_id: number; cluster: string; block: number };
    const bookRaw = join(dir, "book.raw.json");
    writeFileSync(bookRaw, JSON.stringify({ provenance: { book_digest: book.book_digest }, book: { schema: book.schema, chain_id: book.chain_id, cluster: book.cluster, block: book.block, reserves: book.reserves, accounts: [] } }));
    const out = join(dir, "reduce");
    execFileSync(process.execPath, [join(ROOT, "scripts", "census", "u4b", "u4b-reduce.mjs"), "--book-raw", bookRaw, "--oracle-raw", res!.rawPath!, "--labels", labels, "--event-id", "e2-2025-10-10-weth", "--episode-tag", "chain", "--out", out], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"] });
    const first = (p: string): unknown => JSON.parse(readFileSync(p, "utf8").split(/\r?\n/)[0] ?? "null") as unknown;
    assert.deepEqual(first(join(out, "U4b-oracle-path-chain.jsonl")), { kind: "anchor", block: PRE_B0.block, price: PRE_B0.price.toString(), source: "answer_updated_pre_b0" }, "the frozen reducer took the REAL pre-B0 anchor (never the book fallback)");
    const meta = first(join(out, "U4b-scores-chain.jsonl")) as { cell_a: { anchor_price: string }; census: { deficit_lines_priced_from_usdt: number } };
    assert.equal(meta.cell_a.anchor_price, PRE_B0.price.toString(), "the frozen scorer consumed the prober anchor (liage anchor -> anchor_price)");
    assert.equal(meta.census.deficit_lines_priced_from_usdt, 1, "the frozen scorer priced the e2 USDT deficit line from the helper block (no 'no USDT price' throw)");
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
