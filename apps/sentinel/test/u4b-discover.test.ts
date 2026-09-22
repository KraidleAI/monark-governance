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
import { LIQ_TOPIC, decodeLiquidationCall, canon, sha256Hex, type RawLog } from "../../../scripts/census/u4b/liquidation-logs.mjs";
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
    let res: { brutSha: string; nLogs: number; nClusters: number } | undefined;
    await withFetch(stub, async () => {
      res = await runDiscover(["--from-block", String(FROM), "--to-block", String(TO), "--event-id", "weth-fixture", "--out", out, "--operators", "drpc.org,mevblocker.io,tenderly.co,pocket.network", "--ledger-dir", ledgerDir, "--cycle", "u4b0-test", "--max-calls", "100000", "--min-interval-ms", "0"], { env: {}, now: () => 1_700_000_000_000 });
    });
    const output = JSON.parse(readFileSync(out, "utf8")) as { provenance: { brut_sha256: string }; brut: { records: Array<{ block: number; logIndex: number }> }; clusters: Array<{ b_first: number; b_last: number; b0: number; n_members: number; n_distinct_liquidated: number }> };
    // deterministic sort: records ascending by (block, logIndex) — the non-WETH log (B+3000) is INCLUDED in the brut
    // (all decoded LiquidationCall logs), only EXCLUDED from clusters. Mutant 'sort removed' => stub order => this reds.
    assert.deepEqual(output.brut.records.map((r) => [r.block, r.logIndex]), [[B, 0], [B + 10, 3], [B + 3000, 2], [B + 5000, 1]], "brut records canonically sorted (mutant 'sort removed' reds)");
    // the deterministic brut sha, recomputed INDEPENDENTLY from the expected sorted records (D-2 recomputed vector).
    const expectedRecords = fixtureLogs.map(decodeLiquidationCall).sort((a, b) => a.block - b.block || a.logIndex - b.logIndex);
    const expectedSha = sha256Hex(canon({ schema: "ukemi-u4b-discover/1", event_id: "weth-fixture", pool: "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2", liq_topic: LIQ_TOPIC, from_block: FROM, to_block: TO, n_logs: 4, records: expectedRecords }));
    assert.equal(output.provenance.brut_sha256, expectedSha, "brut_sha256 == sha256 of the canonical sorted brut");
    assert.equal(res!.brutSha, expectedSha, "runDiscover returns the same brut sha it wrote");
    // clustering by the window rule (ts=block*12 => B_last = B+7199): the 3 WETH logs cluster, the non-WETH is excluded.
    assert.equal(output.clusters.length, 1, "one WETH cluster (all 3 WETH logs within the 24h window)");
    assert.deepEqual({ b_first: output.clusters[0]!.b_first, b_last: output.clusters[0]!.b_last, b0: output.clusters[0]!.b0, n_members: output.clusters[0]!.n_members, n_distinct: output.clusters[0]!.n_distinct_liquidated }, { b_first: B, b_last: B + 7199, b0: B - 1, n_members: 3, n_distinct: 2 }, "cluster window B_last=firstBlockAtOrAfter(ts+86400)-1; non-WETH excluded; U1 twice + U2 => 2 distinct");
    assert.ok(!existsSync(join(ledgerDir, "u4b0-test", "chainstack.jsonl")), "no chainstack ledger (keyless-only course)");
  } finally { rmSync(out, { force: true }); rmSync(ledgerDir, { recursive: true, force: true }); }
});
