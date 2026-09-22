// Lot U-4b-1b-4 (R-G) - probe (d) u4b-probe-cutoff.mjs IN-PROCESS (A-8): only globalThis.fetch stubbed, REAL-FORM bodies (aggregator()
// = one ABI address word; CutoffTimeSet data = one ABI uint32 word, topics[0] = the locally computed keccak, cited). ADDENDUM 2026-09-22
// section 1 rule GO iff c_fresh == c_e2; composition probe -> file -> control C-12 (exit 0 GO / 3 STOP). NO network, empty env.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { runProbe, cutoffAt, decide, decodeCutoffEvents, CUTOFF_TIME_SET_TOPIC0, EXPECTED_AGGREGATOR, AGGREGATOR_CREATION_BLOCK, E2_B0, DEPLOY_VALUE, EXIT_STOP } from "../../../scripts/census/u4b/u4b-probe-cutoff.mjs";
import { parseEpisodeFile } from "../../../scripts/census/u4-oracle-path.mjs";
import { canon, sha256Hex } from "../../../scripts/census/u4-guard.mjs";
import { SEL, wordAddr, keccak256 } from "../src/ukemi/abi.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const PROBE = join(ROOT, "scripts", "census", "u4b", "u4b-probe-cutoff.mjs");
const B0 = 23_600_000, BLAST = 23_607_199; // a FRESH (non-e2) episode, B_fresh = B0
const CREATION_TX = "0xa5cc47df0e4b210893456e0cc1e03fa342889066365483a509b2fbd550f4f146"; // FAITS 2026-09-22 (creation tx)
const OPS = "drpc.org,mevblocker.io";
/** The control C-12 of the runbook delta (verbatim): exit 0 iff the file's decided field is GO under the pre-registered rule. */
const C12 = 'const r = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")); console.log(JSON.stringify({ verdict: r.verdict, reason: r.reason, c_fresh: r.c_fresh, c_e2: r.c_e2, deploy_value: r.deploy_value, aggregator: r.aggregator, range: r.range, n_events: r.events.length, calls: r.calls, selection_sha256: r.selection_sha256 })); process.exit(r.verdict === "GO" && r.rule === "c_fresh == c_e2" && r.c_fresh !== null && r.c_fresh === r.c_e2 ? 0 : 3);';

interface Cut { block: number; logIndex: number; value: bigint; tx: string; data?: string }
const word = (n: bigint): string => n.toString(16).padStart(64, "0");
const cutLog = (c: Cut): { address: string; blockNumber: string; logIndex: string; transactionHash: string; topics: string[]; data: string } =>
  ({ address: EXPECTED_AGGREGATOR, blockNumber: "0x" + c.block.toString(16), logIndex: "0x" + c.logIndex.toString(16), transactionHash: c.tx, topics: [CUTOFF_TIME_SET_TOPIC0], data: c.data ?? "0x" + word(c.value) });
const DEPLOY: Cut = { block: AGGREGATOR_CREATION_BLOCK, logIndex: 5, value: 30n, tx: CREATION_TX };
const jrpc = (result: unknown): Response => new Response(JSON.stringify({ jsonrpc: "2.0", id: 1, result }), { status: 200, headers: { "content-type": "application/json" } });

/** Real-form stub: aggregator() -> `agg`; eth_getLogs(CutoffTimeSet) -> ONLY the events inside [fromBlock, toBlock] (every
 *  requested range recorded); a URL containing `failHost` answers HTTP 500. Counts fetches. */
function makeStub(o: { events: readonly Cut[]; agg?: string; failHost?: string; ranges?: Array<[number, number]>; counter?: { n: number } }): (input: string | URL, init?: RequestInit) => Promise<Response> {
  return (input, init) => {
    if (o.counter) o.counter.n++;
    if (o.failHost !== undefined && String(input).includes(o.failHost)) return Promise.resolve(new Response("upstream 500", { status: 500 }));
    const req = JSON.parse(typeof init?.body === "string" ? init.body : "{}") as { method: string; params: unknown[] };
    if (req.method === "eth_call" && String((req.params[0] as { data: string }).data).slice(0, 10) === SEL.aggregator) return Promise.resolve(jrpc("0x" + wordAddr(o.agg ?? EXPECTED_AGGREGATOR)));
    if (req.method === "eth_getLogs") {
      const q = req.params[0] as { topics?: string[]; fromBlock: string; toBlock: string };
      if (String((q.topics ?? [])[0] ?? "").toLowerCase() !== CUTOFF_TIME_SET_TOPIC0) return Promise.resolve(jrpc([]));
      const lo = parseInt(q.fromBlock, 16), hi = parseInt(q.toBlock, 16);
      o.ranges?.push([lo, hi]);
      return Promise.resolve(jrpc(o.events.filter((e) => e.block >= lo && e.block <= hi).map(cutLog)));
    }
    return Promise.resolve(jrpc(null));
  };
}
async function withFetch(stub: (i: string | URL, init?: RequestInit) => Promise<Response>, body: () => Promise<void>): Promise<void> {
  const real = globalThis.fetch; globalThis.fetch = stub as typeof globalThis.fetch;
  try { await body(); } finally { globalThis.fetch = real; }
}
function writeEpisode(dir: string, b0 = B0): string {
  const payload = { schema: "ukemi-u4b-episode-selection/1", episode: { id: "weth-fresh", B_first: b0 + 1, B_last: b0 + BLAST - B0, B0: b0, n_distinct: 77, collateral: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" } };
  const p = join(dir, "episode-selection.json");
  writeFileSync(p, JSON.stringify({ ...payload, version_check: "pending", selection_sha256: sha256Hex(canon(payload)) }, null, 2));
  return p;
}
function scratch(): { dir: string; ep: string; out: string; args: (extra?: string[]) => string[] } {
  const dir = mkdtempSync(join(tmpdir(), "u4bpc-"));
  mkdirSync(join(dir, "ledger"));
  const ep = writeEpisode(dir), out = join(dir, "probe");
  return { dir, ep, out, args: (extra = []) => ["--episode-file", ep, "--operators", OPS, "--ledger-dir", join(dir, "ledger"), "--cycle", "u4bpc", "--max-calls", "1200", "--method-caps", '{"eth_call":1200,"eth_getLogs":1200}', "--min-interval-ms", "0", "--out", out, ...extra] };
}
interface Report { schema: string; selection_sha256: string; b_fresh: number; aggregator: string | null; range: [number, number]; events: Array<{ block: number; log_index: number; tx_hash: string; cutoff_time: number }>; c_fresh: number | null; c_e2: number | null; deploy_value: number; rule: string; verdict: string; reason: string | null; calls: number; operators: string[]; checked_at_utc: string }
const readReport = (p: string): Report => JSON.parse(readFileSync(p, "utf8")) as Report;
/** Run C-12 as the orchestrator would (child process); returns its exit status. */
function c12(outPath: string): number {
  try { execFileSync(process.execPath, ["-e", C12, outPath], { stdio: ["ignore", "pipe", "pipe"] }); return 0; } catch (e) { return (e as { status?: number }).status ?? -1; }
}
const byFrom = (a: [number, number], b: [number, number]): number => a[0] - b[0];

// ============================================================================================================
// (1) GO: equal values (only the constructor event) - real-form bodies, the whole range read in <= 9990 pieces, C-12 exit 0.
// ============================================================================================================
test("u4b_probe_cutoff_go_when_equal_real_form_logs_full_range_and_C12_exit_0", async () => {
  const s = scratch();
  try {
    assert.equal(CUTOFF_TIME_SET_TOPIC0, "0xb24a681ce3399a408a89fd0c2b59dfc24bdad592b1c7ec7671cf060596c1c4d1", "topic0 = keccak256(CutoffTimeSet(uint32)), computed locally 2026-09-22 with abi.ts keccak (cited)");
    assert.equal(CUTOFF_TIME_SET_TOPIC0, keccak256("CutoffTimeSet(uint32)"), "the constant IS the self-tested keccak of the event signature");
    const ranges: Array<[number, number]> = [];
    let r: { status: number; verdict: string; outPath: string } | undefined;
    await withFetch(makeStub({ events: [DEPLOY], ranges }), async () => { r = await runProbe(s.args(), { env: {}, now: () => 1_700_000_000_000 }); });
    assert.equal(r!.status, 0, "GO => exit 0");
    assert.equal(r!.outPath, join(s.out, `cutoff-${B0}.json`), "output = <out>/cutoff-<B_fresh>.json");
    const rep = readReport(r!.outPath);
    assert.deepEqual({ verdict: rep.verdict, reason: rep.reason, c_fresh: rep.c_fresh, c_e2: rep.c_e2, deploy_value: rep.deploy_value, rule: rep.rule, aggregator: rep.aggregator, b_fresh: rep.b_fresh },
      { verdict: "GO", reason: null, c_fresh: 30, c_e2: 30, deploy_value: DEPLOY_VALUE, rule: "c_fresh == c_e2", aggregator: EXPECTED_AGGREGATOR, b_fresh: B0 }, "decided fields (resolved === body)");
    assert.deepEqual(rep.events, [{ block: AGGREGATOR_CREATION_BLOCK, log_index: 5, tx_hash: CREATION_TX, cutoff_time: 30 }], "the constructor CutoffTimeSet decoded from its 32-byte word");
    assert.deepEqual(rep.range, [AGGREGATOR_CREATION_BLOCK, B0], "one scan [creation, B_fresh] (B_fresh > 23545087)");
    assert.equal(rep.selection_sha256, (JSON.parse(readFileSync(s.ep, "utf8")) as { selection_sha256: string }).selection_sha256, "bound to the episode by its selection_sha256");
    assert.deepEqual(rep.operators, ["drpc.org", "mevblocker.io"], "keyless operators recorded");
    const pieces = [...new Map(ranges.map((x) => [x.join(","), x])).values()].sort(byFrom);
    assert.equal(pieces[0]![0], AGGREGATOR_CREATION_BLOCK, "the scan STARTS at the creation block (a truncated start would miss the constructor event)");
    assert.equal(pieces[pieces.length - 1]![1], B0, "the scan ENDS at B_fresh");
    assert.ok(pieces.every((p, i) => p[1] - p[0] + 1 <= 9990 && (i === 0 || p[0] === pieces[i - 1]![1] + 1)), "contiguous pieces of <= 9990 blocks");
    assert.equal(rep.calls, 2 + 2 * pieces.length, "calls = aggregator() quorum-2 + every piece quorum-2 (all metered)");
    assert.equal(c12(r!.outPath), 0, "control C-12 on the file => exit 0");
  } finally { rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (2) STOP: a setCutoffTime AFTER e2 changes the value => c_fresh != c_e2 => STOP (exit 3), values reported, C-12 exit 3.
// ============================================================================================================
test("u4b_probe_cutoff_stop_when_the_cutoff_changed_after_e2", async () => {
  const s = scratch();
  try {
    const later: Cut = { block: 23_560_000, logIndex: 0, value: 45n, tx: "0x" + "b".repeat(64) };
    let r: { status: number; verdict: string; outPath: string } | undefined;
    await withFetch(makeStub({ events: [later, DEPLOY] }), async () => { r = await runProbe(s.args(), { env: {}, now: () => 1 }); });
    assert.equal(r!.status, EXIT_STOP, "inequality => STOP, exit 3 (never a GO on inequality)");
    const rep = readReport(r!.outPath);
    assert.deepEqual({ verdict: rep.verdict, reason: rep.reason, c_fresh: rep.c_fresh, c_e2: rep.c_e2 }, { verdict: "STOP", reason: "cutoff_changed", c_fresh: 45, c_e2: 30 }, "both values reported");
    assert.deepEqual(rep.events.map((e) => [e.block, e.cutoff_time]), [[AGGREGATOR_CREATION_BLOCK, 30], [23_560_000, 45]], "events sorted by (block, logIndex)");
    assert.equal(c12(r!.outPath), 3, "control C-12 => exit 3");
    // D-n (ADDENDUM section 4(d)): an episode BEFORE e2 (B_fresh 23000000 < 23545087) - the scan still reaches 23545087, so a
    // change between B_fresh and e2 is seen (a scan stopped at B_fresh would read c_e2 on a truncated prefix => a FALSE GO).
    writeEpisode(s.dir, 23_000_000);
    await withFetch(makeStub({ events: [{ block: 23_300_000, logIndex: 0, value: 45n, tx: "0x" + "c".repeat(64) }, DEPLOY] }), async () => { r = await runProbe(s.args(), { env: {}, now: () => 1 }); });
    const e = readReport(r!.outPath);
    assert.deepEqual({ status: r!.status, range: e.range, c_fresh: e.c_fresh, c_e2: e.c_e2, verdict: e.verdict }, { status: EXIT_STOP, range: [AGGREGATOR_CREATION_BLOCK, E2_B0], c_fresh: 30, c_e2: 45, verdict: "STOP" }, "B_fresh < 23545087: scan extended to 23545087");
  } finally { rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (3) PURE: the value in force is the LAST event at or below the block; the rule; malformed real-form events refused.
// ============================================================================================================
test("u4b_probe_cutoff_value_in_force_is_the_last_event_at_or_below_the_block", () => {
  const ev = decodeCutoffEvents([
    cutLog({ block: 24_000_000, logIndex: 0, value: 60n, tx: "0x" + "6".repeat(64) }), cutLog({ block: 23_000_000, logIndex: 5, value: 41n, tx: "0x" + "5".repeat(64) }),
    cutLog({ block: E2_B0, logIndex: 1, value: 50n, tx: "0x" + "4".repeat(64) }), cutLog({ block: 23_000_000, logIndex: 0, value: 40n, tx: "0x" + "3".repeat(64) }), cutLog(DEPLOY),
  ]);
  assert.deepEqual(ev.map((e) => e.cutoff_time), [30, 40, 41, 50, 60], "sorted by (block, logIndex)");
  assert.equal(cutoffAt(ev, E2_B0), 50, "an event AT the block is in force (<=)");
  assert.equal(cutoffAt(ev, E2_B0 - 1), 41, "the LAST event (block, logIndex) at or below - never the first");
  assert.equal(cutoffAt(ev, AGGREGATOR_CREATION_BLOCK - 1), null, "before deployment: no value");
  assert.equal(decide(30, 30), "GO");
  assert.equal(decide(30, 45), "STOP", "inequality => STOP");
  assert.equal(decide(null, 30), "STOP", "a missing value => STOP");
  assert.throws(() => decodeCutoffEvents([cutLog({ ...DEPLOY, data: "0x" })]), /not ONE 32-byte word/, "an EMPTY 0x data is refused by name");
  assert.throws(() => decodeCutoffEvents([cutLog({ ...DEPLOY, data: "0x" + "1".repeat(64) })]), /exceeds uint32/, "a word beyond uint32 is refused");
  assert.throws(() => decodeCutoffEvents([{ ...cutLog(DEPLOY), topics: ["0x" + "0".repeat(64)] }]), /topic0 != CutoffTimeSet/, "a foreign topic0 is refused");
});

// ============================================================================================================
// (4) STOP without a scan: aggregator()@B_fresh != 0x7c7fdfca... (phase change) => 0 getLogs, exit 3.
// ============================================================================================================
test("u4b_probe_cutoff_stop_on_aggregator_mismatch_with_0_getlogs", async () => {
  const s = scratch();
  try {
    const ranges: Array<[number, number]> = [];
    let r: { status: number; verdict: string; outPath: string } | undefined;
    await withFetch(makeStub({ events: [DEPLOY], agg: "0x" + "9".repeat(40), ranges }), async () => { r = await runProbe(s.args(), { env: {}, now: () => 1 }); });
    const rep = readReport(r!.outPath);
    assert.equal(r!.status, EXIT_STOP, "exit 3");
    assert.deepEqual({ verdict: rep.verdict, reason: rep.reason, aggregator: rep.aggregator, c_fresh: rep.c_fresh }, { verdict: "STOP", reason: "aggregator_mismatch", aggregator: "0x" + "9".repeat(40), c_fresh: null }, "the resolved aggregator is asserted, never assumed");
    assert.equal(ranges.length, 0, "no scan on a foreign aggregator");
  } finally { rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (5) STOP on an incomplete scan: quorum missing (one of the two operators down) and an EMPTY 0x event word (A-8).
// ============================================================================================================
test("u4b_probe_cutoff_stop_when_quorum_missing_or_event_word_empty", async () => {
  const s = scratch();
  const realErr = process.stderr.write.bind(process.stderr);
  const errs: string[] = [];
  try {
    process.stderr.write = (x: string | Uint8Array): boolean => { errs.push(String(x)); return true; };
    let r: { status: number; verdict: string; outPath: string } | undefined;
    try {
      await withFetch(makeStub({ events: [DEPLOY], failHost: "mevblocker" }), async () => { r = await runProbe(s.args(), { env: {}, now: () => 1 }); });
      assert.equal(r!.status, EXIT_STOP, "quorum missing => STOP");
      assert.equal(readReport(r!.outPath).reason, "read_failed:NoQuorumError", "named reason (class of the refusal, closed vocabulary)");
      await withFetch(makeStub({ events: [{ ...DEPLOY, data: "0x" }] }), async () => { r = await runProbe(s.args(), { env: {}, now: () => 1 }); });
    } finally { process.stderr.write = realErr; }
    const rep = readReport(r!.outPath);
    assert.equal(r!.status, EXIT_STOP, "an empty 0x event word => STOP");
    assert.deepEqual({ verdict: rep.verdict, reason: rep.reason, c_fresh: rep.c_fresh, c_e2: rep.c_e2 }, { verdict: "STOP", reason: "read_failed:ProbeError", c_fresh: null, c_e2: null }, "never a value from a malformed word");
    assert.ok(errs.some((e) => /not ONE 32-byte word/.test(e)), "the refusal is named on stderr");
    assert.deepEqual(readdirSync(join(s.dir, "ledger", "u4bpc")).filter((f) => f.endsWith(".lock")), [], "every lock released after a STOP");
  } finally { process.stderr.write = realErr; rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (6) C-6: the probe NEVER writes episode-selection.json - the prober's own selection_sha256 check still accepts the file.
// ============================================================================================================
test("u4b_probe_cutoff_never_writes_the_selection_and_the_prober_still_accepts_it", async () => {
  const s = scratch();
  try {
    const before = readFileSync(s.ep, "utf8");
    await withFetch(makeStub({ events: [DEPLOY] }), async () => { await runProbe(s.args(), { env: {}, now: () => 1 }); });
    assert.equal(readFileSync(s.ep, "utf8"), before, "episode-selection.json byte-identical");
    assert.equal(parseEpisodeFile(s.ep).B0, B0, "the prober's selection_sha256 verification still passes (0 refusal at step 5)");
  } finally { rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (7) Refusals BEFORE any fetch: free block / target, paid or single operator, --out in the repo, tampered episode.
// ============================================================================================================
test("u4b_probe_cutoff_refuses_before_any_fetch", async () => {
  const s = scratch();
  try {
    const counter = { n: 0 };
    const bad = (a: string[]): string[] => { const x = s.args(); for (let i = 0; i < a.length; i += 2) { const j = x.indexOf(a[i]!); if (j >= 0) x.splice(j, 2, a[i]!, a[i + 1]!); else x.push(a[i]!, a[i + 1]!); } return x; };
    await withFetch(makeStub({ events: [DEPLOY], counter }), async () => {
      const deps = { env: {}, now: () => 1 };
      await assert.rejects(runProbe(bad(["--block", "23600000"]), deps), /--block is refused/, "a free --block is refused");
      await assert.rejects(runProbe(bad(["--target", EXPECTED_AGGREGATOR]), deps), /--target is refused/, "a --target is refused (resolved by aggregator())");
      await assert.rejects(runProbe(bad(["--operators", "chainstack,drpc.org"]), deps), /KEYLESS-ONLY/, "a paid operator (chainstack) is refused");
      await assert.rejects(runProbe(bad(["--operators", "helius,drpc.org"]), deps), /KEYLESS-ONLY/, "a paid operator (helius) is refused");
      await assert.rejects(runProbe(bad(["--operators", "nodies.app,pocket.network"]), deps), /2 DISTINCT/, "two gateways of ONE operator are refused");
      await assert.rejects(runProbe(bad(["--out", join(ROOT, "apps", "sentinel", "test", "fixtures", "ukemi", "probe")]), deps), /under the repo/, "--out under the repo (fixtures) is refused");
      const f = JSON.parse(readFileSync(s.ep, "utf8")) as { episode: { B0: number } };
      f.episode.B0 += 1;
      writeFileSync(s.ep, JSON.stringify(f));
      await assert.rejects(runProbe(s.args(), deps), /selection_sha256 mismatch/, "a tampered episode file is refused");
    });
    assert.equal(counter.n, 0, "0 fetch on every refusal");
  } finally { rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (7a) CONSIGNE C-2: a budget refusal ends the scan as a NAMED STOP and is never retried (1 refused ledger line, 0 extra fetch).
// ============================================================================================================
test("u4b_probe_cutoff_budget_refusal_is_not_retried_and_is_a_named_stop", async () => {
  const s = scratch();
  try {
    const counter = { n: 0 };
    const a = s.args();
    a[a.indexOf("--max-calls") + 1] = "3"; // aggregator() = 2 calls, 1st getLogs piece = 1 call, the 4th call is refused
    let r: { status: number; verdict: string; outPath: string } | undefined;
    await withFetch(makeStub({ events: [DEPLOY], counter }), async () => { r = await runProbe(a, { env: {}, now: () => 1 }); });
    assert.equal(r!.status, EXIT_STOP, "budget exhausted mid-scan => STOP (incomplete scan), exit 3");
    assert.equal(readReport(r!.outPath).reason, "budget_stop", "named reason");
    assert.equal(counter.n, 3, "the refused call does 0 fetch and is not retried");
    const cyc = join(s.dir, "ledger", "u4bpc");
    const refused = readdirSync(cyc).filter((f) => f.endsWith(".jsonl")).flatMap((f) => readFileSync(join(cyc, f), "utf8").split(/\r?\n/).filter((l) => l.includes('"refused"')));
    assert.equal(refused.length, 1, "exactly ONE refused ledger line");
  } finally { rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (7b) The CLI (the runbook command) maps the verdict to its EXIT CODE: 0 on GO, 3 on STOP (never 0 on a STOP - the OBS-2
// defect of --check-version is not reproduced). Child process under a fetch-stub preload (no network).
// ============================================================================================================
const PRELOAD = [
  "const MODE = process.env.U4PC_MODE; const w = (n) => BigInt(n).toString(16).padStart(64, '0');",
  "const EV = [{ b: 22076041, v: 30 }].concat(MODE === 'stop' ? [{ b: 23560000, v: 45 }] : []);",
  "const ok = (r) => new Response(JSON.stringify({ jsonrpc: '2.0', id: 1, result: r }), { status: 200, headers: { 'content-type': 'application/json' } });",
  "globalThis.fetch = async (_u, init) => { const { method, params } = JSON.parse(init.body);",
  "  if (method === 'eth_call') return ok('0x' + '0'.repeat(24) + '7c7fdfca295a787ded12bb5c1a49a8d2cc20e3f8');",
  "  if (method === 'eth_getLogs') { const lo = parseInt(params[0].fromBlock, 16), hi = parseInt(params[0].toBlock, 16);",
  "    return ok(EV.filter((e) => e.b >= lo && e.b <= hi).map((e) => ({ blockNumber: '0x' + e.b.toString(16), logIndex: '0x0', transactionHash: '0x' + '0'.repeat(64), topics: ['" + CUTOFF_TIME_SET_TOPIC0 + "'], data: '0x' + w(e.v) }))); }",
  "  return ok(null); };",
].join("\n");
test("u4b_probe_cutoff_cli_exit_code_is_0_on_GO_and_3_on_STOP", () => {
  const s = scratch();
  try {
    const pre = join(s.dir, "preload.mjs");
    writeFileSync(pre, PRELOAD);
    const cli = (mode: string): number => {
      try { execFileSync(process.execPath, ["--import", pathToFileURL(pre).href, PROBE, ...s.args()], { cwd: ROOT, env: { ...process.env, U4PC_MODE: mode }, stdio: ["ignore", "pipe", "pipe"] }); return 0; } catch (e) { return (e as { status?: number }).status ?? -1; }
    };
    assert.equal(cli("go"), 0, "CLI on GO => exit 0");
    assert.equal(cli("stop"), EXIT_STOP, "CLI on STOP => exit 3");
    assert.equal(readReport(join(s.out, `cutoff-${B0}.json`)).verdict, "STOP", "the CLI wrote the STOP file it exited on");
  } finally { rmSync(s.dir, { recursive: true, force: true }); }
});

// ============================================================================================================
// (8) B-5 (CONSIGNE): the probe script carries no network primitive, no env read, no paid-key name; its imports are CLOSED.
// ============================================================================================================
test("u4b_probe_cutoff_script_is_keyless_clean_and_imports_closed", () => {
  const FORBIDDEN = [/\bfetch\s*\(/, /node:https?/, /\bundici\b/, /\bchild_process\b/, /process\.env/, /\b(CHAINSTACK_[A-Z0-9_]+|HELIUS_API_KEY|BELL_SOLANA_RPC|POLYGON_API_KEY|DATABENTO_API_KEY)\b/];
  const scan = (text: string): string[] => text.split(/\r?\n/).flatMap((l, i) => FORBIDDEN.filter((re) => re.test(l)).map((re) => `${String(i + 1)}:${re.source}`));
  const src = readFileSync(PROBE, "utf8");
  assert.ok(src.split("\n").length > 50, "the scanned file is the real probe (non-vacuous scope)");
  assert.deepEqual(scan(src), [], "no fetch/http/undici/child_process/process.env/paid-key name in the probe");
  assert.equal(scan(src + "\nconst x = await fetch(u);\n").length, 1, "the scanner is live (an injected fetch( is caught)");
  const ALLOWED = new Set(["node:fs", "node:url", "node:path", "../../../apps/sentinel/src/ukemi/rpc2.ts", "../../../apps/sentinel/src/ukemi/abi.ts", "../u4-guard.mjs", "../u4-oracle-path.mjs", "./u4b-discover.mjs"]);
  const specs = [...src.matchAll(/\bfrom\s*["'`]([^"'`]+)["'`]/g)].map((m) => m[1]!);
  assert.ok(specs.length >= 6, "import scan non-vacuous");
  for (const sp of specs) assert.ok(ALLOWED.has(sp), `import '${sp}' is not in the closed set`);
});
