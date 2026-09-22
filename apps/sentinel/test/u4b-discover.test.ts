// U-4b-1b-0 (decision 128 Q-D) — u4b-discover: (1) keyless-only refusal of a PAID operator (chainstack AND helius),
// PURE so the "paid operator accepted" mutant reds without a round-trip (B-1); (2) the §DISC discovery over a log
// FIXTURE through the REAL guarded keyless pool (ONLY globalThis.fetch stubbed, D-3), producing a DETERMINISTIC brut
// (canonical sort + sha256) — the fixture logs are delivered OUT OF ORDER so the sort is load-bearing (mutant "sort
// removed" reds). NO network (fetch stubbed), NO key (keyless env {}). Ledger OUTSIDE the repo, released in the finally.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runDiscover, assertKeylessOperators, KEYLESS_LABELS } from "../../../scripts/census/u4b/u4b-discover.mjs";
import { LIQ_TOPIC, decodeLiquidationCall, clusterWethLiquidations, canon, sha256Hex, type RawLog } from "../../../scripts/census/u4b/liquidation-logs.mjs";
import { wordAddr, topicAddr } from "../src/ukemi/abi.ts";

const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const SUSDE = "0x9d39a5de30e57443bff2a8307a4256c8797a3497"; // non-WETH collateral => excluded from clusters
const DEBT = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const U1 = "0x1111111111111111111111111111111111111111";
const U2 = "0x2222222222222222222222222222222222222222";
const U3 = "0x3333333333333333333333333333333333333333";
const LIQR = "0x4444444444444444444444444444444444444444";
const word = (n: bigint): string => n.toString(16).padStart(64, "0");
const liqLog = (block: number, logIndex: number, collateral: string, user: string): RawLog => ({
  blockNumber: "0x" + block.toString(16), logIndex: "0x" + logIndex.toString(16),
  transactionHash: "0x" + (block * 100 + logIndex).toString(16).padStart(64, "0"),
  topics: [LIQ_TOPIC, topicAddr(collateral), topicAddr(DEBT), topicAddr(user)],
  data: "0x" + word(1_000n) + word(2_000n) + wordAddr(LIQR) + word(0n),
});

async function withFetch(stub: (input: string | URL, init?: RequestInit) => Promise<Response>, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch;
  globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = real; }
}
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });

// (1) keyless-only: a PAID operator (chainstack AND helius, named) is refused fail-closed — PURE (no network).
test("u4b_discover_refuses_a_paid_operator_keyless_only", () => {
  assert.throws(() => assertKeylessOperators(["drpc.org", "chainstack"]), /KEYLESS-ONLY|not a keyless/, "a PAID chainstack in --operators is refused fail-closed (mutant 'paid accepted' reds)");
  assert.throws(() => assertKeylessOperators(["drpc.org", "helius"]), /KEYLESS-ONLY|not a keyless/, "a PAID helius in --operators is refused fail-closed");
  // O-1 (G2): case/space variants of a paid label AND an UNKNOWN paid label are refused too — the guard is a WHITELIST
  // (only KEYLESS_LABELS pass), NOT a blacklist of {chainstack,helius}. Kills the "whitelist->blacklist" mutant M8,
  // which would let a case variant ('Chainstack') or an unknown paid label ('alchemy') through.
  for (const variant of ["Chainstack", "CHAINSTACK", " chainstack", "Helius", "alchemy"]) {
    assert.throws(() => assertKeylessOperators(["drpc.org", variant]), /KEYLESS-ONLY|not a keyless/, `a paid/unknown label '${variant}' (case/space variant or unknown) is refused fail-closed (whitelist, not a {chainstack,helius} blacklist)`);
  }
  assert.throws(() => assertKeylessOperators([]), /--operators .* is required/, "an empty --operators is refused");
  assert.deepEqual([...assertKeylessOperators(["drpc.org", "mevblocker.io", "tenderly.co", "pocket.network"])], ["drpc.org", "mevblocker.io", "tenderly.co", "pocket.network"], "a keyless-only include list is accepted");
  assert.ok(!KEYLESS_LABELS.includes("chainstack") && !KEYLESS_LABELS.includes("helius"), "no paid label is a keyless witness");
});

// (2) the §DISC discovery over a log fixture: deterministic brut (sorted, sha256) + WETH clustering by the window rule.
test("u4b_discover_over_a_log_fixture_is_deterministic", async () => {
  // TO - FROM = 20 000 > chunk 9990 => getLogsRange traverses 3 chunks (exercise the chunk loop + concat + dedup; the
  // 4 fixture logs all fall in chunk 1, chunks 2/3 return empty => the concatenation/dedup path runs, order preserved).
  const B = 23_600_000, FROM = B, TO = B + 20_000;
  // Delivered OUT OF ORDER (B+5000 first) so the canonical sort in decodeAndSort is load-bearing (mutant 'sort removed').
  const fixtureLogs = [liqLog(B + 5000, 1, WETH, U1), liqLog(B, 0, WETH, U1), liqLog(B + 3000, 2, SUSDE, U3), liqLog(B + 10, 3, WETH, U2)];
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    void input;
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_getLogs") {
      const p = (req.params as Array<{ fromBlock: string; toBlock: string }>)[0]!;
      const from = parseInt(p.fromBlock, 16), to = parseInt(p.toBlock, 16);
      return Promise.resolve(jrpc(fixtureLogs.filter((l) => { const b = parseInt(l.blockNumber, 16); return b >= from && b <= to; })));
    }
    if (req.method === "eth_getBlockByNumber") {
      const blk = String(req.params[0]);
      const n = parseInt(blk, 16);
      return Promise.resolve(jrpc({ hash: "0x" + n.toString(16).padStart(64, "0"), number: blk, timestamp: "0x" + (n * 12).toString(16) }));
    }
    return Promise.resolve(jrpc(null));
  };
  const ledgerDir = mkdtempSync(join(tmpdir(), "u4b0-disc-")); // OUTSIDE the repo, pre-exists (CA-11)
  const out = join(tmpdir(), `u4b0-disc-out-${String(process.pid)}-${String(Date.now())}.json`);
  try {
    let res: { brutSha: string; nLogs: number; nClusters: number | null; clusterError: string | null } | undefined;
    await withFetch(stub, async () => {
      res = await runDiscover(["--from-block", String(FROM), "--to-block", String(TO), "--event-id", "weth-fixture", "--out", out, "--operators", "drpc.org,mevblocker.io,tenderly.co,pocket.network", "--block-operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledgerDir, "--cycle", "u4b0-test", "--max-calls", "100000", "--min-interval-ms", "0"], { env: {}, now: () => 1_700_000_000_000 });
    });
    const output = JSON.parse(readFileSync(out, "utf8")) as { provenance: { brut_sha256: string }; brut: { records: Array<{ block: number; logIndex: number }>; block_ts: Record<string, number> }; clusters: Array<{ b_first: number; b_last: number; b0: number; n_members: number; n_distinct_liquidated: number }> };
    // deterministic sort: records ascending by (block, logIndex) — the non-WETH log (B+3000) is INCLUDED in the brut
    // (all decoded LiquidationCall logs), only EXCLUDED from clusters. Mutant 'sort removed' => stub order => this reds.
    assert.deepEqual(output.brut.records.map((r) => [r.block, r.logIndex]), [[B, 0], [B + 10, 3], [B + 3000, 2], [B + 5000, 1]], "brut records canonically sorted (mutant 'sort removed' reds)");
    // schema v2: block_ts carries every eth_getBlockByNumber the witness read (stub ts = block*12), covered by brut_sha256.
    assert.ok(Object.keys(output.brut.block_ts).length >= 2, "brut.block_ts is populated from the witness blockAt reads (v2)");
    assert.equal(output.brut.block_ts[String(B)], B * 12, "block_ts carries the real ts of B_first (stub ts = block*12)");
    // the deterministic brut sha, recomputed INDEPENDENTLY (D-2): expected records + block_ts captured by re-running the
    // SAME pure clustering with the SAME tsOf (block*12) the discover pool served — same binary searches => same blocks.
    const expectedRecords = fixtureLogs.map(decodeLiquidationCall).sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
    const capturedTs: Record<string, number> = {};
    await clusterWethLiquidations(expectedRecords, (b) => { capturedTs[String(b)] = b * 12; return b * 12; });
    const expectedSha = sha256Hex(canon({ schema: "ukemi-u4b-discover/2", phase: "complete", event_id: "weth-fixture", pool: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2", liq_topic: LIQ_TOPIC, from_block: FROM, to_block: TO, n_logs: 4, records: expectedRecords, block_ts: capturedTs }));
    assert.equal(output.provenance.brut_sha256, expectedSha, "brut_sha256 == sha256 of the canonical sorted brut (phase complete + records + block_ts, v2)");
    assert.deepEqual(output.brut.block_ts, capturedTs, "brut.block_ts == the independently recomputed block->ts map");
    assert.equal(res!.brutSha, expectedSha, "runDiscover returns the same brut sha it wrote");
    // clustering by the window rule (ts=block*12 => B_last = B+7199): the 3 WETH logs cluster, the non-WETH is excluded.
    assert.equal(output.clusters.length, 1, "one WETH cluster (all 3 WETH logs within the 24h window)");
    assert.deepEqual({ b_first: output.clusters[0]!.b_first, b_last: output.clusters[0]!.b_last, b0: output.clusters[0]!.b0, n_members: output.clusters[0]!.n_members, n_distinct: output.clusters[0]!.n_distinct_liquidated }, { b_first: B, b_last: B + 7199, b0: B - 1, n_members: 3, n_distinct: 2 }, "cluster window B_last=firstBlockAtOrAfter(ts+86400)-1; non-WETH excluded; U1 twice + U2 => 2 distinct");
    assert.ok(!existsSync(join(ledgerDir, "u4b0-test", "chainstack.jsonl")), "no chainstack ledger (keyless-only course)");
  } finally { rmSync(out, { force: true }); rmSync(ledgerDir, { recursive: true, force: true }); }
});

// (3) WITNESS FAILURE (C-1/C-2 — the 2026-09-22 course FATAL): getLogs SUCCEEDS but blockAt (eth_getBlockByNumber) fails
// on every block-operator (pruned headers) => the BRUT (records + brut_sha256 + block_ts) is STILL written, clusters=null
// + cluster_error, exit 0. The real course lost ~650 keyless getLogs to a blockAt quorum throw; this proves it cannot recur.
test("u4b_discover_writes_the_brut_even_when_the_witness_clustering_fails", async () => {
  const B = 23_600_000, FROM = B, TO = B + 100;
  const fixtureLogs = [liqLog(B, 0, WETH, U1), liqLog(B + 10, 1, WETH, U2)];
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    void input;
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_getLogs") {
      const p = (req.params as Array<{ fromBlock: string; toBlock: string }>)[0]!;
      const from = parseInt(p.fromBlock, 16), to = parseInt(p.toBlock, 16);
      return Promise.resolve(jrpc(fixtureLogs.filter((l) => { const b = parseInt(l.blockNumber, 16); return b >= from && b <= to; })));
    }
    // pruned header on EVERY block-operator: HTTP 400 (not transient => not retried => benched => blockAt no_quorum).
    if (req.method === "eth_getBlockByNumber") return Promise.resolve(new Response("old data not available due to pruning", { status: 400 }));
    return Promise.resolve(jrpc(null));
  };
  const ledgerDir = mkdtempSync(join(tmpdir(), "u4b0-wfail-"));
  const out = join(tmpdir(), `u4b0-wfail-out-${String(process.pid)}-${String(Date.now())}.json`);
  try {
    let res: { brutSha: string; nLogs: number; nClusters: number | null; clusterError: string | null } | undefined;
    await withFetch(stub, async () => {
      res = await runDiscover(["--from-block", String(FROM), "--to-block", String(TO), "--event-id", "weth-wfail", "--out", out, "--operators", "drpc.org,mevblocker.io,tenderly.co,pocket.network", "--block-operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledgerDir, "--cycle", "u4b0-wfail", "--max-calls", "100000", "--min-interval-ms", "0"], { env: {}, now: () => 1_700_000_000_000 });
    });
    // the BRUT IS WRITTEN even though the witness threw — mutant 'brut written after clustering' (write moved inside the
    // witness try) leaves NO file here => this reds.
    assert.ok(existsSync(out), "the brut file is written even when the witness clustering fails (records are the piece, §5b)");
    const output = JSON.parse(readFileSync(out, "utf8")) as { provenance: { brut_sha256: string; n_clusters: number | null; cluster_error: string | null }; brut: { records: unknown[]; block_ts: Record<string, number> }; clusters: unknown; cluster_error: string | null };
    assert.equal(output.brut.records.length, 2, "the decoded getLogs records are preserved in the brut");
    assert.ok(/^[0-9a-f]{64}$/.test(output.provenance.brut_sha256), "brut_sha256 is present and well-formed");
    assert.equal(output.clusters, null, "clusters is null on a witness fault (consultative)");
    assert.equal(output.provenance.n_clusters, null, "provenance.n_clusters is null on a witness fault");
    assert.match(String(output.cluster_error), /quorum|providers|pruning/i, "cluster_error carries the witness fault reason");
    assert.ok(!/https?:\/\//i.test(String(output.cluster_error)), "cluster_error is URL-scrubbed (no endpoint URL, A-7/D6)");
    assert.equal(res!.nClusters, null, "runDiscover returns nClusters=null on a witness fault");
    assert.equal(res!.brutSha, output.provenance.brut_sha256, "runDiscover returns the brut sha it wrote");
  } finally { rmSync(out, { force: true }); rmSync(ledgerDir, { recursive: true, force: true }); }
});

// (4) C-V-3 DURABILITY: a hard kill DURING the ts probes (simulated via deps.afterGetLogs throwing, before the witness)
// leaves the getlogs-only brut on disk with records + a VALID sha — the ~650 getLogs are never lost. Mutant "no
// pre-witness write" (emit('getlogs-only',…) removed) => the file is absent when the kill fires => this reds.
test("u4b_discover_getlogs_only_brut_is_durable_before_the_witness", async () => {
  const B = 23_600_000, FROM = B, TO = B + 100;
  const fixtureLogs = [liqLog(B, 0, WETH, U1), liqLog(B + 10, 1, WETH, U2)];
  const stub = (input: string | URL, init?: RequestInit): Promise<Response> => {
    void input;
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_getLogs") { const p = (req.params as Array<{ fromBlock: string; toBlock: string }>)[0]!; const f = parseInt(p.fromBlock, 16), t = parseInt(p.toBlock, 16); return Promise.resolve(jrpc(fixtureLogs.filter((l) => { const b = parseInt(l.blockNumber, 16); return b >= f && b <= t; }))); }
    if (req.method === "eth_getBlockByNumber") { const n = parseInt(String(req.params[0]), 16); return Promise.resolve(jrpc({ hash: "0x" + n.toString(16).padStart(64, "0"), number: String(req.params[0]), timestamp: "0x" + (n * 12).toString(16) })); }
    return Promise.resolve(jrpc(null));
  };
  const ledgerDir = mkdtempSync(join(tmpdir(), "u4b0-dur-"));
  const out = join(tmpdir(), `u4b0-dur-out-${String(process.pid)}-${String(Date.now())}.json`);
  try {
    await assert.rejects(withFetch(stub, async () => {
      await runDiscover(["--from-block", String(FROM), "--to-block", String(TO), "--event-id", "weth-dur", "--out", out, "--operators", "drpc.org,mevblocker.io,tenderly.co,pocket.network", "--block-operators", "drpc.org,mevblocker.io,tenderly.co", "--ledger-dir", ledgerDir, "--cycle", "u4b0-dur", "--max-calls", "100000", "--min-interval-ms", "0"], { env: {}, now: () => 1_700_000_000_000, afterGetLogs: () => { throw new Error("simulated hard kill during ts probes"); } });
    }), /simulated hard kill/, "the kill propagates (uncaught, outside the witness try)");
    assert.ok(existsSync(out), "the getlogs-only brut is ALREADY on disk before the witness (records durable, C-V-3)");
    const o = JSON.parse(readFileSync(out, "utf8")) as { provenance: { brut_sha256: string; brut_phase: string }; brut: { phase: string; records: unknown[]; block_ts: Record<string, number> } };
    assert.equal(o.brut.phase, "getlogs-only", "the durable brut carries phase=getlogs-only");
    assert.equal(o.provenance.brut_phase, "getlogs-only", "provenance mirrors the write phase");
    assert.equal(o.brut.records.length, 2, "the ~650-getLogs analogue (2 records) is preserved before any blockAt");
    assert.deepEqual(o.brut.block_ts, {}, "block_ts is empty in the getlogs-only phase");
    assert.equal(o.provenance.brut_sha256, sha256Hex(canon(o.brut)), "the getlogs-only brut_sha256 is VALID over its own content");
  } finally { rmSync(out, { force: true }); rmSync(ledgerDir, { recursive: true, force: true }); }
});

// (5) H-2 (G2-M8): fewer than 2 DISTINCT --block-operators (by operatorOf) is refused fail-closed BEFORE any fetch —
// the blockAt quorum-2 guard. Mutant "quorum-2 blockAt guard removed" => no refusal => this reds.
test("u4b_discover_refuses_fewer_than_2_distinct_block_operators", async () => {
  const ledgerDir = mkdtempSync(join(tmpdir(), "u4b0-h2-"));
  const out = join(tmpdir(), `u4b0-h2-out-${String(process.pid)}-${String(Date.now())}.json`);
  const rejectAll = (): Promise<Response> => Promise.reject(new Error("no fetch expected: the block-operator guard is pre-flight"));
  const base = (blockOps: string): string[] => ["--from-block", "100", "--to-block", "200", "--event-id", "h2", "--out", out, "--operators", "drpc.org,mevblocker.io,tenderly.co,pocket.network", "--block-operators", blockOps, "--ledger-dir", ledgerDir, "--cycle", "u4b0-h2", "--max-calls", "10", "--min-interval-ms", "0"];
  try {
    await assert.rejects(withFetch(rejectAll, async () => { await runDiscover(base("drpc.org"), { env: {}, now: () => 1_700_000_000_000 }); }), /eth_getBlockByNumber quorum-2 needs >= 2.*--block-operators/, "a single --block-operator is refused (G2-M8 reds)");
    await assert.rejects(withFetch(rejectAll, async () => { await runDiscover(base("nodies.app,pocket.network"), { env: {}, now: () => 1_700_000_000_000 }); }), /quorum-2 needs >= 2/, "nodies.app + pocket.network collapse to ONE operator (operatorOf) => refused");
    assert.ok(!existsSync(out), "no brut is written when the guard refuses (pre-flight, 0 fetch)");
  } finally { rmSync(out, { force: true }); rmSync(ledgerDir, { recursive: true, force: true }); }
});
