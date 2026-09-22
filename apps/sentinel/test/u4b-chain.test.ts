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
import { runSelect, runFillTs, SelectError } from "../../../scripts/census/u4b/u4b-select-episode.mjs";
import { LIQ_TOPIC, WETH, type RawLog } from "../../../scripts/census/u4b/liquidation-logs.mjs";
import { parseArgs } from "../../../scripts/census/u3-realized.mjs";
import { wordAddr, topicAddr } from "../src/ukemi/abi.ts";

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
