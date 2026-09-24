// U-4b-1b-2 (checkpoint-2 C-V-2/C-V-4) — the COMMITTED real chain: runDiscover (real guarded keyless pool, only
// globalThis.fetch stubbed) -> runSelect, and the --fill-ts resolution of an e2-adjacent missing-ts (CA-11 durci). This
// is the committable form of the validator's cp2-harness/chain.test.ts: (a) far from e2 the chain succeeds 0-fetch in the
// selector; (b) a WETH cluster whose 24h window straddles the e2 upper bound makes the offline selector REFUSE by name,
// then --fill-ts (keyless quorum-2) writes block-ts-extra.json and runSelect --block-ts-extra SUCCEEDS (0 fetch).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { runDiscover } from "../../../scripts/census/u4b/u4b-discover.mjs";
import { runSelect, runFillTs, runCheckVersion, SelectError, IMPL_V350 } from "../../../scripts/census/u4b/u4b-select-episode.mjs";
import { run as runProber } from "../../../scripts/census/u4-oracle-path.mjs";
import { LIQ_TOPIC, WETH, type RawLog } from "../../../scripts/census/u4b/liquidation-logs.mjs";
import { parseArgs } from "../../../scripts/census/u3-realized.mjs";
import { wordAddr, topicAddr, SEL, ANSWER_UPDATED_TOPIC0 } from "../src/ukemi/abi.ts";

const ROOT = join(import.meta.dirname, "..", "..", "..");
const DEBT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const LIQR = "0x4444444444444444444444444444444444444444";
const E2_HI = 23557060;
const PREREG_LF = createHash("sha256").update(readFileSync(join(ROOT, "docs", "PLAN-u4b-prereg.md"), "utf8").replace(/\r\n/g, "\n"), "utf8").digest("hex");
const word = (n: bigint): string => n.toString(16).padStart(64, "0");
const user = (i: number): string => "0x" + i.toString(16).padStart(40, "0");
const liqLog = (block: number, logIndex: number, u: string): RawLog => ({
  blockNumber: "0x" + block.toString(16), logIndex: "0x" + logIndex.toString(16),
  transactionHash: "0x" + (block * 100 + logIndex).toString(16).padStart(64, "0"),
  topics: [LIQ_TOPIC, topicAddr(WETH), topicAddr(DEBT), topicAddr(u)],
  data: "0x" + word(1_000n) + word(2_000n) + wordAddr(LIQR) + word(0n),
});
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });
// getLogs -> logs in range; getBlockByNumber -> ts = block*12 (linear, so B_last = B_first + 7199).
function chainStub(logs: RawLog[]): (i: string | URL, init?: RequestInit) => Promise<Response> {
  return (_i, init) => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_getLogs") { const p = (req.params as Array<{ fromBlock: string; toBlock: string }>)[0]!; const f = parseInt(p.fromBlock, 16), t = parseInt(p.toBlock, 16); return Promise.resolve(jrpc(logs.filter((l) => { const b = parseInt(l.blockNumber, 16); return b >= f && b <= t; }))); }
    if (req.method === "eth_getBlockByNumber") { const n = parseInt(String(req.params[0]), 16); return Promise.resolve(jrpc({ hash: "0x" + n.toString(16).padStart(64, "0"), number: String(req.params[0]), timestamp: "0x" + (n * 12).toString(16) })); }
    return Promise.resolve(jrpc(null));
  };
}
const OFFLINE = (): Promise<Response> => Promise.reject(new Error("selector must be OFFLINE (0 fetch)"));

async function discover(logs: RawLog[], from: number, to: number, dir: string): Promise<string> {
  const ledger = mkdtempSync(join(tmpdir(), "u4bchain-l-"));
  const brutPath = join(dir, "discover.json");
  const real = globalThis.fetch; globalThis.fetch = chainStub(logs) as typeof globalThis.fetch;
  try {
    await runDiscover(["--from-block", String(from), "--to-block", String(to), "--event-id", "chain", "--out", brutPath, "--operators", "drpc.org,mevblocker.io,tenderly.co,pocket.network", "--block-operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledger, "--cycle", "chain", "--max-calls", "100000", "--min-interval-ms", "0"], { env: {}, now: () => 1_700_000_000_000 });
  } finally { globalThis.fetch = real; rmSync(ledger, { recursive: true, force: true }); }
  return brutPath;
}

// (a) far from e2: discover -> select succeeds 0-fetch; winner is the 50-distinct cluster; B0 = B_first - 1.
test("u4b_chain_discover_to_select_far_from_e2", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bchain-a-"));
  try {
    const B = 23_700_000; const logs: RawLog[] = [];
    for (let i = 0; i < 50; i++) logs.push(liqLog(B + i, 0, user(1000 + i)));
    const brutPath = await discover(logs, 23_540_000, 23_800_000, dir);
    const real = globalThis.fetch; globalThis.fetch = OFFLINE;
    try {
      const s = await runSelect(["--discover", brutPath, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(dir, "sel")], { env: {}, now: () => 1 });
      const file = JSON.parse(readFileSync(s.out, "utf8")) as { episode: { B_first: number; B0: number }; n_eligible: number };
      assert.equal(file.episode.B_first, B, "winner B_first is the fresh 50-distinct cluster");
      assert.equal(file.episode.B0, B - 1, "B0 = B_first - 1");
      assert.equal(file.n_eligible, 1, "exactly one eligible cluster");
      // C-V-4: the REAL frozen labeler parser reads the events-<id>.json the chain produced (the committed end-to-end tuyau).
      const ev = parseArgs(["--events", s.eventsOut]).events as Array<{ id: string; collateral: string; clusterLo: number; clusterHi: number; preV33: boolean }>;
      assert.equal(ev.length, 1, "labeler parseArgs accepts the chain's events-<id>.json");
      assert.equal(ev[0]!.collateral, WETH, "parsed collateral is the WETH address");
      assert.equal(ev[0]!.clusterLo, B, "parsed clusterLo == B_first");
      assert.equal(ev[0]!.preV33, false, "parsed preV33 is false (labeler will read DeficitCreated)");
    } finally { globalThis.fetch = real; }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// (b) a cluster whose 24h window straddles the e2 upper bound => the offline selector REFUSES by name; --fill-ts resolves
// the missing blocks into block-ts-extra.json; runSelect --block-ts-extra then SUCCEEDS (0 fetch). This is the C-V-2
// acceptance criterion: the e2-adjacent cul-de-sac now has a guarded resolution path.
test("u4b_chain_e2_adjacent_missing_ts_resolved_by_fill_ts", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bchain-b-"));
  try {
    const logs: RawLog[] = [];
    logs.push(liqLog(E2_HI - 100, 0, user(1)));  // opens a cluster INSIDE e2; its 24h window extends past E2_HI
    logs.push(liqLog(E2_HI + 500, 0, user(2)));  // WETH record just after e2: witness assigns it to the e2-start cluster
    const B = 23_700_000; for (let i = 0; i < 50; i++) logs.push(liqLog(B + i, 0, user(1000 + i)));
    const brutPath = await discover(logs, 23_540_000, 23_800_000, dir);
    // (b.1) OFFLINE selector refuses by name (the e2-excluded re-clustering probes a block the witness never read).
    const real = globalThis.fetch; globalThis.fetch = OFFLINE;
    let refused: unknown = null;
    try { await runSelect(["--discover", brutPath, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(dir, "sel1")], { env: {}, now: () => 1 }); }
    catch (e) { refused = e; }
    finally { globalThis.fetch = real; }
    assert.ok(refused instanceof SelectError && /brut has no ts for block .*--fill-ts/.test(refused.message), "the e2-adjacent re-clustering refuses by name, pointing to --fill-ts");
    // (b.2) --fill-ts (GUARDED keyless quorum-2) fetches EXACTLY the missing blocks -> block-ts-extra.json.
    const ledger = mkdtempSync(join(tmpdir(), "u4bchain-fl-"));
    globalThis.fetch = chainStub(logs) as typeof globalThis.fetch;
    let sidecar: { out: string; nExtra: number } | undefined;
    try {
      sidecar = await runFillTs(["--fill-ts", "--discover", brutPath, "--out", join(dir, "fill"), "--operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledger, "--cycle", "fill", "--max-calls", "100000", "--method-caps", '{"eth_getBlockByNumber":100000}', "--min-interval-ms", "0"], { env: {}, now: () => 1 });
    } finally { globalThis.fetch = real; rmSync(ledger, { recursive: true, force: true }); }
    assert.ok(sidecar.nExtra > 0, "--fill-ts fetched at least one missing block");
    // (b.3) OFFLINE selector with --block-ts-extra SUCCEEDS; winner is the fresh eligible cluster.
    globalThis.fetch = OFFLINE;
    try {
      const s = await runSelect(["--discover", brutPath, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(dir, "sel2"), "--block-ts-extra", sidecar.out], { env: {}, now: () => 1 });
      const file = JSON.parse(readFileSync(s.out, "utf8")) as { episode: { B_first: number }; n_eligible: number; block_ts_extra_sha256: string };
      assert.equal(file.episode.B_first, B, "after --fill-ts the offline selector succeeds; winner is the fresh cluster");
      assert.equal(file.n_eligible, 1, "the e2-adjacent 1-distinct cluster is ineligible; only the fresh cluster qualifies");
      assert.ok(/^[0-9a-f]{64}$/.test(file.block_ts_extra_sha256), "episode-selection.json records block_ts_extra_sha256 (sha-linked chain, C-2)");
    } finally { globalThis.fetch = real; }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (c) CARTO-T1C-5 (ADR-U4b amendment U-4b-1b-4 section 8; cartography temps 1 pair P-U3; G7 ruling CHANTIERS:990 (a)) -
// the course pair selector -> episode-selection.json -> prober, composed from the REAL producers along the path the
// course file really takes (RUNBOOK steps 1 -> 2a -> 2c -> 5): runDiscover (guarded keyless) -> runFillTs (the
// e2-adjacent cluster needs it) -> runSelect --block-ts-extra (OFFLINE, 0 fetch; the sidecar binding then lies INSIDE the
// payload covered by selection_sha256) -> runCheckVersion (step 2c REWRITES the file the prober reads at step 5) -> run()
// of scripts/census/u4-oracle-path.mjs. Only globalThis.fetch is stubbed, with REAL-FORM JSON-RPC bodies (A-8:
// aggregator() and getStorageAt = one 32-byte word; AnswerUpdated = price in topics[1], roundId in topics[2], updatedAt
// in data). Liage (A-10): the prober's b0 / b_last / episode_id / selection_sha256 EQUAL the selector's file (read from
// it, never hard-coded); its D_e getLogs window is the selector's [B0, B_last] to the block (an AnswerUpdated AT B_last is
// counted, one at B_last + 1 is not); the episode file is byte-identical after the prober (it never writes it).
// Mutants (harness F:\tmp\pre5\mutants.mjs; phase "before" = the whole suite with the 0383e5b tests): MC5-1 selector
// sha over JSON.stringify instead of canon (seen only by the prober's own check) and MC5-4 selector sha computed before
// the sidecar binding is added (seen by the first sha verifier of a --block-ts-extra selection) survive the suite
// without this test; MC5-2 prober B_last = B0 + 7199 is red here AND already red on the e2 replay of the prober.
// ============================================================================================================
const AGG = "0x" + "a".repeat(40);
interface AuEvent { block: number; price: bigint; logIndex: number; round: bigint }
const auLog = (e: AuEvent): { address: string; blockNumber: string; logIndex: string; transactionHash: string; topics: string[]; data: string } =>
  ({ address: AGG, blockNumber: "0x" + e.block.toString(16), logIndex: "0x" + e.logIndex.toString(16), transactionHash: "0x" + (e.block * 10 + e.logIndex).toString(16).padStart(64, "0"), topics: [ANSWER_UPDATED_TOPIC0, "0x" + word(e.price), "0x" + word(e.round)], data: "0x" + word(1_700_000_000n) });
/** Prober-side real-form stub: aggregator() -> AGG; getEModeCategoryData -> 5 zero words; eth_getLogs(AnswerUpdated on
 *  AGG) -> ONLY the events inside [fromBlock, toBlock] (every requested range recorded). Anything else answers null. */
function proberStub(events: readonly AuEvent[], ranges: Array<[number, number]>): (i: string | URL, init?: RequestInit) => Promise<Response> {
  return (_i, init) => {
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_call") {
      const sel = String((req.params[0] as { data: string }).data).slice(0, 10);
      if (sel === SEL.aggregator) return Promise.resolve(jrpc("0x" + wordAddr(AGG)));
      if (sel === SEL.getEModeCategoryData) return Promise.resolve(jrpc("0x" + "00".repeat(160)));
      return Promise.resolve(jrpc(null));
    }
    if (req.method === "eth_getLogs") {
      const q = req.params[0] as { address?: string; topics?: string[]; fromBlock: string; toBlock: string };
      if (String(q.address ?? "").toLowerCase() !== AGG || String((q.topics ?? [])[0] ?? "").toLowerCase() !== ANSWER_UPDATED_TOPIC0.toLowerCase()) return Promise.resolve(jrpc([]));
      const lo = parseInt(q.fromBlock, 16), hi = parseInt(q.toBlock, 16);
      ranges.push([lo, hi]);
      return Promise.resolve(jrpc(events.filter((e) => e.block >= lo && e.block <= hi).map(auLog)));
    }
    return Promise.resolve(jrpc(null));
  };
}

test("u4b_chain_select_to_oracle_path", async () => {
  const dir = mkdtempSync(join(tmpdir(), "u4bchain-c-"));
  const ledgerF = mkdtempSync(join(tmpdir(), "u4bchain-lf-")), ledgerV = mkdtempSync(join(tmpdir(), "u4bchain-lv-")), ledgerP = mkdtempSync(join(tmpdir(), "u4bchain-lp-"));
  const real = globalThis.fetch;
  try {
    // 1 - discover (guarded keyless, fetch-stubbed) over an e2-adjacent WETH cluster + the fresh 50-distinct cluster, then
    // --fill-ts (guarded keyless quorum-2) writes the NON-empty sidecar into the selection dir, as the course does.
    const logs: RawLog[] = [liqLog(E2_HI - 100, 0, user(1)), liqLog(E2_HI + 500, 0, user(2))];
    const B = 23_700_000; for (let i = 0; i < 50; i++) logs.push(liqLog(B + i, 0, user(1000 + i)));
    const brutPath = await discover(logs, 23_540_000, 23_800_000, dir);
    globalThis.fetch = chainStub(logs) as typeof globalThis.fetch;
    let fill: Awaited<ReturnType<typeof runFillTs>> | undefined;
    try { fill = await runFillTs(["--fill-ts", "--discover", brutPath, "--out", join(dir, "select"), "--operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledgerF, "--cycle", "chain-f", "--max-calls", "100000", "--method-caps", '{"eth_getBlockByNumber":100000}', "--min-interval-ms", "0"], { env: {}, now: () => 1 }); }
    finally { globalThis.fetch = real; }
    assert.ok(fill.nExtra > 0, "--fill-ts resolved at least one missing block (non-empty sidecar)");
    // 2a - the OFFLINE selector with --block-ts-extra (a fetch here rejects).
    globalThis.fetch = OFFLINE;
    let s: Awaited<ReturnType<typeof runSelect>> | undefined;
    try { s = await runSelect(["--discover", brutPath, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--out", join(dir, "select"), "--block-ts-extra", fill.out], { env: {}, now: () => 1 }); }
    finally { globalThis.fetch = real; }
    const sel0 = readFileSync(s.out, "utf8");
    const f0 = JSON.parse(sel0) as { episode: { id: string; B_first: number; B_last: number; B0: number }; block_ts_extra_file: string; block_ts_extra_sha256: string };
    const ep = f0.episode;
    assert.deepEqual([ep.B_first, ep.B0, ep.id], [B, B - 1, s.episodeId], "the selector picked the 50-distinct cluster; B0 = B_first - 1");
    assert.ok(ep.B_last > ep.B0 + 1, "a non-degenerate [B0, B_last] window");
    assert.deepEqual([f0.block_ts_extra_file, f0.block_ts_extra_sha256], ["block-ts-extra.json", fill.sha], "the sidecar binding lies in the selection payload (course shape)");
    // 2c - --check-version (guarded keyless quorum-2 eth_getStorageAt at B_first) REWRITES the file, selection_sha256 kept.
    const storageBlocks: string[] = [];
    globalThis.fetch = ((_i: string | URL, init?: RequestInit): Promise<Response> => {
      const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
      if (req.method === "eth_getStorageAt") { storageBlocks.push(String(req.params[2])); return Promise.resolve(jrpc("0x" + wordAddr(IMPL_V350))); }
      return Promise.resolve(jrpc(null));
    }) as typeof globalThis.fetch;
    let v: { versionOk: boolean; block: number } | undefined;
    try { v = await runCheckVersion(["--check-version", "--episode-file", s.out, "--operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledgerV, "--cycle", "chain-v", "--max-calls", "9", "--method-caps", '{"eth_getStorageAt":9}'], { env: {}, now: () => 1_700_000_000_000 }); }
    finally { globalThis.fetch = real; }
    assert.deepEqual([v.versionOk, v.block], [true, ep.B_first], "version_ok on v3.5.0, read at episode.B_first");
    assert.ok(storageBlocks.length >= 2 && storageBlocks.every((b) => b === "0x" + ep.B_first.toString(16)), "quorum-2 eth_getStorageAt, every read at B_first");
    const sel1 = readFileSync(s.out, "utf8");
    const f1 = JSON.parse(sel1) as { selection_sha256: string; version_check: { status: string; version_ok: boolean } };
    assert.notEqual(sel1, sel0, "step 2c rewrote the file the prober reads at step 5");
    assert.deepEqual([f1.version_check.status, f1.version_check.version_ok, f1.selection_sha256], ["checked", true, s.selectionSha], "version_check filled, selection_sha256 unchanged");
    // 5 - the prober on the REWRITTEN file: pre-B0 anchor inside window 1, one update inside, one AT B_last, one at B_last + 1.
    const PRE: AuEvent = { block: ep.B0 - 50, price: 198_500_000_000n, logIndex: 3, round: 7n };
    const IN: AuEvent = { block: ep.B0 + 10, price: 200_000_000_000n, logIndex: 0, round: 8n };
    const EDGE: AuEvent = { block: ep.B_last, price: 201_000_000_000n, logIndex: 1, round: 9n };
    const PAST: AuEvent = { block: ep.B_last + 1, price: 150_000_000_000n, logIndex: 0, round: 10n };
    const ranges: Array<[number, number]> = [];
    globalThis.fetch = proberStub([PRE, IN, EDGE, PAST], ranges) as typeof globalThis.fetch;
    let r: { status: number; rawPath?: string } | undefined;
    try {
      r = await runProber(["--episode-file", s.out, "--prereg-file", "docs/PLAN-u4b-prereg.md", "--prereg-sha", PREREG_LF, "--emode-categories", "1",
        "--raws-dir", join(dir, "raws"), "--ledger-dir", ledgerP, "--cycle", "chain-p", "--floor", "0", "--max-ru", "1000000", "--max-calls", "9999",
        "--method-caps", '{"eth_call":100000,"eth_getLogs":100000}', "--min-interval-ms", "0"], { env: {}, now: () => 1_700_000_000_000 });
    } finally { globalThis.fetch = real; }
    assert.equal(r.status, 0, "the prober accepts the selector's (rewritten) file: exit 0");
    const raw = JSON.parse(readFileSync(r.rawPath!, "utf8")) as { n_updates: number; p_min: string; p_max: string; first_update: { block: number } | null; last_update: { block: number } | null; pre_b0_anchor: unknown; provenance: { episode_id: string; selection_sha256: string; params: { b0: number; b_last: number } } };
    assert.deepEqual({ b0: raw.provenance.params.b0, b_last: raw.provenance.params.b_last, episode_id: raw.provenance.episode_id, selection_sha256: raw.provenance.selection_sha256 },
      { b0: ep.B0, b_last: ep.B_last, episode_id: ep.id, selection_sha256: s.selectionSha }, "liage: the prober's bornes, id and sha are the selector's");
    assert.deepEqual(ranges.filter(([, hi]) => hi > ep.B0), [[ep.B0, ep.B_last], [ep.B0, ep.B_last]], "the only reads past B0 are the D_e window = the selector's [B0, B_last] (quorum-2); nothing past B_last");
    assert.deepEqual([raw.n_updates, raw.first_update?.block, raw.last_update?.block, raw.p_min, raw.p_max], [2, IN.block, EDGE.block, "200000000000", "201000000000"], "the update AT B_last is counted, the one at B_last + 1 is not (resolved === body)");
    assert.deepEqual(raw.pre_b0_anchor, { price: "198500000000", block: PRE.block, log_index: 3, round_id: "7" }, "the pre-B0 anchor from window 1 [B0 - 9990, B0]");
    assert.equal(readFileSync(s.out, "utf8"), sel1, "the prober never writes episode-selection.json");
  } finally {
    globalThis.fetch = real;
    for (const d of [dir, ledgerF, ledgerV, ledgerP]) rmSync(d, { recursive: true, force: true });
  }
});
