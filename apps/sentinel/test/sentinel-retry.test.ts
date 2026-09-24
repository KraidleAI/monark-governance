// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// Lot NARABI-OPS-1 (L-4 / C-6 / C-1 / C-4): the OFFLINE replay of the 2026-09-20 ops incident on the REAL
// `main` (a oneshot that exited 0 on a `no_quorum` stop and lost a day of publication). This is decision 46's
// oracle — the whole pipeline is rehearsed locally BEFORE any deploy — and the ADR-EC E2 non-LLM integration
// test for the sentinel retry. It drives `apps/sentinel/src/run.ts` as a SUBPROCESS (the only way to observe
// the real `process.exitCode`), with `fetch` replaced by a method-aware stub (`node --import`) DERIVED from the
// committed capture `fixtures/narabi-timeline-2026-09-19.jsonl` (C-7) — no network. The stub is written to an
// OS-temp dir at test time (never committed: no `.mjs` may live under fixtures, series_pinned condition c).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";
import { makeRpcPool, providerOf, redactEndpoint, publishedEndpoints, poolEndpoints, PUBLIC_ENDPOINTS } from "../src/rpc.ts";
import { lineHashOf } from "../src/timeline.ts";
import type { TimelineLine } from "../src/timeline.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const RUN_TS = join(HERE, "..", "src", "run.ts");
const FIXTURE = join(HERE, "fixtures", "narabi-timeline-2026-09-19.jsonl");

// A scheme-less "secret" path used ONLY in tests: it contains no committed-secret shape (no `chainstack.com/`
// + 32 hex, no `wss://`, no api-key context), so `no_secret_in_repo` stays green; its presence in any run
// output would be the leak the mutant introduces.
const FAKE_KEY_URL = "https://rpc.example.test/DO_NOT_PUBLISH_secretpath";
const SECRET_MARK = "DO_NOT_PUBLISH_secretpath";

const midnight = (d: string): number => Math.floor(Date.parse(d + "T00:00:00Z") / 1000);

interface FixLine {
  day: string; from_block: number; to_block: number;
  burns: string; mints: string; supply_close: string; s_open: string;
  line_hash: string; prev_line_hash: string; digest_T: string; T: number; endpoints: string[];
}
function fixtureLines(): FixLine[] {
  return readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l) as FixLine);
}

// The method-aware fetch stub (built from the fixture at run time). eth_getBlockByNumber (finalized + a
// per-block monotone ts oracle anchored on the 09-18/09-19 boundaries) and eth_getLogs always answer; eth_call
// (totalSupply) fails per `STUB_FAIL_ETH_CALL_FROM` ("all", or a block number >= which it 403s) — so ONLY the
// value read fails, `finalized()` still succeeds and L-1 is actually exercised (C-6, method-aware).
const STUB_SRC = `
import { readFileSync } from "node:fs";
const lines = readFileSync(process.env.STUB_FIXTURE, "utf8").replace(/\\r\\n/g, "\\n").split("\\n").filter((x) => x.trim()).map((l) => JSON.parse(l));
const byDay = new Map(lines.map((l) => [l.day, l]));
const W = ["2026-09-18", "2026-09-19"].map((d) => byDay.get(d)).filter(Boolean);
const midnight = (d) => Math.floor(new Date(d + "T00:00:00Z").getTime() / 1000);
const w18 = byDay.get("2026-09-18"), w19 = byDay.get("2026-09-19");
const anchors = [[w18.from_block, midnight("2026-09-18")], [w19.from_block, midnight("2026-09-19")], [w19.to_block + 1, midnight("2026-09-20")]];
function tsOf(b) {
  if (b <= anchors[0][0]) { const [b0, t0] = anchors[0], [b1, t1] = anchors[1]; return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); }
  for (let i = 0; i < anchors.length - 1; i++) { const [b0, t0] = anchors[i], [b1, t1] = anchors[i + 1]; if (b <= b1) return Math.round(t0 + (b - b0) * (t1 - t0) / (b1 - b0)); }
  const [b0, t0] = anchors[anchors.length - 2], [b1, t1] = anchors[anchors.length - 1]; return Math.round(t1 + (b - b1) * (t1 - t0) / (b1 - b0));
}
const hex = (n) => "0x" + BigInt(n).toString(16);
const ZERO = "0x" + "0".repeat(64), ONE = "0x" + "1".repeat(64);
const byFrom = new Map(W.map((w) => [w.from_block, w]));
const supply = new Map();
for (const w of W) { supply.set(w.to_block, BigInt(w.supply_close)); supply.set(w.from_block - 1, BigInt(w.s_open)); }
const FAIL = process.env.STUB_FAIL_ETH_CALL_FROM;
const failEthCall = (block) => FAIL === undefined ? false : (FAIL === "all" ? true : block >= Number(FAIL));
globalThis.fetch = (url, init) => {
  const { method, params } = JSON.parse(init.body);
  const ok = (result) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ jsonrpc: "2.0", id: 1, result }) });
  const fail = (status) => Promise.resolve({ ok: false, status, json: () => Promise.resolve({}) });
  if (method === "eth_getBlockByNumber") {
    const tag = params[0];
    if (tag === "finalized") return ok({ number: hex(Number(process.env.STUB_FIN_BLOCK)), timestamp: hex(Number(process.env.STUB_FIN_TS)) });
    const b = parseInt(tag, 16); return ok({ number: hex(b), timestamp: hex(tsOf(b)) });
  }
  if (method === "eth_getLogs") {
    const from = parseInt(params[0].fromBlock, 16); const w = byFrom.get(from); if (!w) return ok([]);
    return ok([{ topics: [ZERO, ONE, ZERO], data: hex(BigInt(w.burns)) }, { topics: [ZERO, ZERO, ONE], data: hex(BigInt(w.mints)) }]);
  }
  if (method === "eth_call") {
    const block = parseInt(params[1], 16); if (failEthCall(block)) return fail(403);
    const s = supply.get(block); if (s === undefined) return fail(500); return ok(hex(s));
  }
  return fail(400);
};
`;

let scratch: string | null = null;
function stubUrl(): string {
  scratch ??= mkdtempSync(join(tmpdir(), "narabi-retry-"));
  const p = join(scratch, "stub-fetch.mjs");
  writeFileSync(p, STUB_SRC);
  return pathToFileURL(p).href;
}
function seedState(nLines: number): string {
  scratch ??= mkdtempSync(join(tmpdir(), "narabi-retry-"));
  const dir = mkdtempSync(join(scratch, "state-"));
  const raw = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  writeFileSync(join(dir, "timeline.jsonl"), raw.slice(0, nLines).join("\n") + "\n");
  return dir;
}

// L-4 (inherited item ii, G7-lot-narabi-ops-1 :27): this suite's mkdtemp scratch was never cleaned, leaking one
// narabi-retry-* dir under the OS tmp on every run (measured 2026-09-20). Remove it after the suite; the
// non-vacuity assert (scratch WAS allocated) keeps the cleanup from being a silent no-op.
after(() => {
  assert.notEqual(scratch, null, "the suite must have allocated a scratch dir (non-vacuous cleanup)");
  if (scratch !== null) {
    rmSync(scratch, { recursive: true, force: true });
    assert.equal(existsSync(scratch), false, "the scratch dir is removed after the suite (no mkdtemp leak)");
  }
});

interface EndJson { processedDays: string[]; lag: number; stopped: string | null; T: number; chainstack: boolean; chainstack_guard: string; exit_code: number; dryRun: boolean; }
interface RunResult { status: number; stdout: string; end: EndJson; }

/** Spawn the REAL run.ts with the fetch stub. `CHAINSTACK_ETH_URL` is DELETED from the child env (so a real
 *  key in the orchestrator's shell never enters the pool); a scenario sets it back explicitly. Every run's
 *  stdout JSON is parsed and returned, so a run-guard mismatch (no main => no JSON) fails loudly, never a
 *  false green that looks like "nothing due". */
function runSentinel(stateDir: string, vars: Record<string, string>, setChainstack?: string, extraArgs: readonly string[] = []): RunResult {
  const env: NodeJS.ProcessEnv = { ...process.env, STUB_FIXTURE: FIXTURE, ...vars };
  delete env.CHAINSTACK_ETH_URL;
  // NARABI-OPS-1d hygiene: the guarded leg's non-secret cycle keys must not leak in from the orchestrator shell
  // (else a scenario meaning "no leg" could accidentally open one). A scenario sets them back via `vars`.
  for (const k of ["CHAINSTACK_CYCLE_ID", "CHAINSTACK_ETH_ORIGIN", "CHAINSTACK_CYCLE_FLOOR"]) delete env[k];
  if (setChainstack !== undefined) env.CHAINSTACK_ETH_URL = setChainstack;
  const r = spawnSync(process.execPath, ["--import", stubUrl(), RUN_TS, "--state", stateDir, ...extraArgs], { cwd: REPO, env, encoding: "utf8", timeout: 60_000 });
  const stdout = r.stdout ?? "";
  const close = stdout.indexOf("\n}");
  assert.ok(close >= 0, `run.ts printed no end JSON (run-guard mismatch?). stdout=${JSON.stringify(stdout)} stderr=${JSON.stringify(r.stderr)}`);
  const end = JSON.parse(stdout.slice(0, close + 2)) as EndJson;
  return { status: r.status ?? -1, stdout, end };
}

// Finalized head that makes 2026-09-19's close (midnight 09-20) final but NOT 09-20's — so 09-19 is due and
// 09-20 is lag, exactly the incident morning.
function finVars(l3: FixLine): Record<string, string> {
  return { STUB_FIN_BLOCK: String(l3.to_block + 5), STUB_FIN_TS: String(midnight("2026-09-20") + 3600) };
}

// ── L-4 / C-6: incident replay on the real `main` (no_quorum -> catch-up -> idempotent no-op) ────────────
test("sentinel_retry_replays_incident_and_exit_codes — no_quorum exits 1 (0 lines), catch-up reproduces the published line_hash, re-run is a no-op (L-4 / C-6; ADR-NARABI-OPS-1)", () => {
  const lines = fixtureLines();
  const l2 = lines[1]!, l3 = lines[2]!; // 2026-09-18 (T=1), 2026-09-19 (T=2)
  const dir = seedState(2); // state resumes from 2026-09-18
  const readLast = (): TimelineLine => {
    const ls = readFileSync(join(dir, "timeline.jsonl"), "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
    return JSON.parse(ls[ls.length - 1]!) as TimelineLine;
  };
  const countLines = (d: string): number => readFileSync(join(d, "timeline.jsonl"), "utf8").split("\n").filter((x) => x.trim()).length;

  // (a) run 1 — every eth_call 403s: quorum unreachable, the window fails closed, NOTHING is written, exit 1.
  const r1 = runSentinel(dir, { ...finVars(l3), STUB_FAIL_ETH_CALL_FROM: "all" });
  assert.equal(r1.status, 1, "no_quorum => exit 1 (the oneshot no longer exits 0 on a stopped day)");
  assert.equal(r1.end.exit_code, 1, "end JSON exit_code = 1");
  assert.equal(r1.end.stopped !== null, true, "stopped is set (a fetch/quorum failure)");
  assert.match(r1.end.stopped!, /^fetch_error:2026-09-19:supplyAt:/, "stopped names the day + the quorum failure");
  assert.equal(r1.end.processedDays.length, 0, "0 days processed");
  assert.equal(countLines(dir), 2, "run 1 wrote no line");
  assert.ok(!r1.stdout.includes("://") || !/HTTP \d+ [^ ]*\/[0-9a-f]{8}/.test(r1.stdout), "no key-bearing endpoint path in stdout");

  // (b) run 2 — healthy: 2026-09-19 is caught up. Its line REPRODUCES the published capture byte-for-byte on
  // every hashed field (line_hash), and T advances to 2.
  const r2 = runSentinel(dir, { ...finVars(l3) });
  assert.equal(r2.status, 0, "catch-up => exit 0");
  assert.equal(r2.end.exit_code, 0);
  assert.equal(r2.end.stopped, null, "nothing stopped it");
  assert.deepEqual(r2.end.processedDays, ["2026-09-19"], "exactly the missing day is picked up");
  assert.equal(r2.end.T, 2, "the 2026-09-18 -> 2026-09-19 pair steps T to 2");
  assert.equal(countLines(dir), 3, "run 2 appended one line");
  const written = readLast();
  assert.equal(written.day, "2026-09-19");
  assert.equal(written.prev_line_hash, l2.line_hash, "the new line chains onto the committed 2026-09-18 line");
  assert.equal(written.line_hash, l3.line_hash, "the written line_hash equals the PUBLISHED one (f73c7006…) — full-facts reproduction");
  assert.equal(lineHashOf(written), l3.line_hash, "and it recomputes from its own hashed fields");
  const stateJson = JSON.parse(readFileSync(join(dir, "state.json"), "utf8")) as { digest: string };
  assert.equal(stateJson.digest, l3.digest_T, "state.json digest equals the last line's digest_T (published)");

  // (c) run 3 — same finalized head, 2026-09-19 already written: due is empty, nothing written, exit 0 (the
  // four retry slots are idempotent — a re-run never duplicates a line).
  const r3 = runSentinel(dir, { ...finVars(l3) });
  assert.equal(r3.status, 0, "idempotent re-run => exit 0");
  assert.equal(r3.end.stopped, null);
  assert.deepEqual(r3.end.processedDays, [], "nothing due");
  assert.equal(countLines(dir), 3, "run 3 wrote no new line (idempotent)");

  // (d) partial catch-up — resume from 2026-09-17 with BOTH days finalized, but eth_call fails from the
  // 2026-09-19 window on: 2026-09-18 is WRITTEN, 2026-09-19 stops => one line AND exit 1 (C-6 case b).
  const dir2 = seedState(1); // resume from 2026-09-17
  const rp = runSentinel(dir2, { ...finVars(l3), STUB_FAIL_ETH_CALL_FROM: String(l3.from_block) });
  assert.equal(rp.status, 1, "a stop after a partial write still exits 1");
  assert.equal(rp.end.exit_code, 1);
  assert.deepEqual(rp.end.processedDays, ["2026-09-18"], "the reachable day was written before the stop");
  assert.match(rp.end.stopped!, /^fetch_error:2026-09-19:/, "the stop is on 2026-09-19");
  assert.equal(countLines(dir2), 2, "one line was appended (2026-09-18) despite the later stop");
  assert.equal((readFileSync(join(dir2, "timeline.jsonl"), "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l) as FixLine)[1]!).line_hash, l2.line_hash, "the written 2026-09-18 line reproduces the published hash");

  // (e) --dry-run under a total quorum failure: the run walks the whole fetch path, STOPS, and carries the stop
  // in the PROCESS exit code (not only in the end JSON) while writing NOTHING (OBS-2 / C-V-2). Fresh state dir.
  const dir3 = seedState(2);
  const re = runSentinel(dir3, { ...finVars(l3), STUB_FAIL_ETH_CALL_FROM: "all" }, undefined, ["--dry-run"]);
  assert.equal(re.status, 1, "--dry-run: the PROCESS exit still carries the stop (mutant MD: process.exitCode not set in --dry-run => this reds)");
  assert.equal(re.end.exit_code, 1, "end JSON exit_code = 1 under --dry-run");
  assert.equal(re.end.dryRun, true, "the run reports dryRun");
  assert.match(re.end.stopped!, /^fetch_error:2026-09-19:supplyAt:/, "--dry-run still walked the fetch path to the quorum stop");
  assert.equal(countLines(dir3), 2, "--dry-run appended no line");
  assert.ok(!existsSync(join(dir3, "state.json")) && !existsSync(join(dir3, "public")), "--dry-run left the state dir untouched (no state.json, no public/)");
  assert.match(re.stdout, /--dry-run: nothing written\./, "--dry-run announces it wrote nothing");
});

// ── C-1: the Chainstack endpoint URL (its key in the path) is NEVER printed — error, written line, stdout ──
test("sentinel_never_prints_endpoint_url — an endpoint's key-bearing path never reaches an error, a written line, or stdout (C-1; ADR-NARABI-OPS-1)", () => {
  // (unit) redaction keeps host, drops path/query — and PUBLIC_ENDPOINTS are published UNCHANGED (C-1).
  assert.equal(redactEndpoint(FAKE_KEY_URL), "https://rpc.example.test", "redactEndpoint keeps the origin only");
  assert.ok(!redactEndpoint(FAKE_KEY_URL).includes(SECRET_MARK), "the redacted form carries no path");
  const pub = publishedEndpoints({ CHAINSTACK_ETH_URL: FAKE_KEY_URL });
  assert.deepEqual(pub.slice(0, PUBLIC_ENDPOINTS.length), [...PUBLIC_ENDPOINTS], "the 8 public endpoints are published verbatim");
  assert.equal(pub[pub.length - 1], "https://rpc.example.test", "the Chainstack endpoint is published redacted (host only)");
  assert.ok(!pub.some((e) => e.includes(SECRET_MARK)), "no published endpoint carries the key path (mutant: raw URL => this reds)");
  // poolEndpoints keeps the RAW url (it must dial it); it is redacted only where it is PRINTED/PUBLISHED.
  assert.equal(poolEndpoints({ CHAINSTACK_ETH_URL: FAKE_KEY_URL }).length, PUBLIC_ENDPOINTS.length + 1, "the pool gains the 9th endpoint");

  // (error) a failing endpoint surfaces as `HTTP <status> <origin>`, never the path. Fresh pool (rr=0), so the
  // LAST endpoint tried in the two-provider quorum is index 1 (FAKE_KEY_URL) — that is the one in `(last: …)`.
  const savedFetch = globalThis.fetch;
  try {
    globalThis.fetch = (() => Promise.resolve({ ok: false, status: 403, json: () => Promise.resolve({}) })) as unknown as typeof fetch;
    const pool = makeRpcPool({ endpoints: ["https://b.test", FAKE_KEY_URL] });
    return pool.supplyAt(1).then(
      () => assert.fail("supplyAt must reject when the quorum cannot be reached"),
      (e: unknown) => {
        const msg = (e as Error).message;
        assert.ok(msg.includes("rpc.example.test"), `the error names the host (${msg})`);
        assert.ok(!msg.includes(SECRET_MARK), `the error carries no key path (mutant: raw url in defaultCall => reds): ${msg}`);
      },
    ).finally(() => { globalThis.fetch = savedFetch; });
  } catch (e) {
    globalThis.fetch = savedFetch;
    throw e;
  }
});

// ── C-1 (no leak) + NARABI-OPS-1d (D-degrade): CHAINSTACK_ETH_URL ALONE no longer opens the leg ───────────────
test("sentinel_chainstack_url_alone_degrades_to_keyless — with CHAINSTACK_ETH_URL set but NO cycle config (CHAINSTACK_CYCLE_ID/ORIGIN absent), the guarded leg is unconfigured: the run publishes the 7 keyless endpoints, chainstack=false, chainstack_guard=unconfigured, and the key path never leaks (C-1; NARABI-OPS-1d D-degrade — supersedes the pre-migration 'URL alone flags chainstack + publishes a redacted 8th endpoint')", () => {
  const l3 = fixtureLines()[2]!;
  const dir = seedState(2);
  const r = runSentinel(dir, { ...finVars(l3) }, FAKE_KEY_URL); // sets CHAINSTACK_ETH_URL only (no cycle keys)
  assert.equal(r.status, 0, "the run writes 2026-09-19 on the keyless quorum");
  assert.equal(r.end.chainstack, false, "the URL alone no longer opens the leg (the guard needs the non-secret cycle config)");
  assert.equal(r.end.chainstack_guard, "unconfigured", "no CHAINSTACK_CYCLE_ID/ORIGIN => the guarded leg is unconfigured (D-degrade)");
  assert.ok(!r.stdout.includes(SECRET_MARK), "the key path never appears in stdout (C-1 iii)");
  const tl = readFileSync(join(dir, "timeline.jsonl"), "utf8");
  assert.ok(!tl.includes(SECRET_MARK), "the key path never appears in a written line (C-1 ii)");
  const written = JSON.parse(tl.replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).pop()!) as TimelineLine;
  assert.equal(written.endpoints.length, PUBLIC_ENDPOINTS.length, "a degraded run publishes the 7 public endpoints only (C-6: no origin without an opened leg)");
  assert.equal(written.line_hash, l3.line_hash, "endpoints are outside hashedFields, so line_hash is unchanged");
});

// ── L-3: the Chainstack endpoint is a DISTINCT operator accepted into the quorum ─────────────────────────
test("sentinel_quorum_accepts_chainstack_as_distinct_operator — chainstack.com is its own provider, quorum-eligible with a public endpoint (L-3; ADR-M012 item m)", async () => {
  const chain = "https://ethereum-mainnet.core.chainstack.com"; // no path => no committed secret; a real key lives ONLY in the env
  const pubEp = "https://eth.drpc.org";
  assert.equal(providerOf(chain), "chainstack.com", "the Chainstack host collapses to chainstack.com");
  assert.notEqual(providerOf(chain), providerOf(pubEp), "distinct from a public provider (drpc.org)");
  assert.ok(!PUBLIC_ENDPOINTS.map(providerOf).includes("chainstack.com"), "chainstack.com is not already among the 8 public providers");
  // The env-driven pool gains it as a 9th endpoint / a distinct operator in the rotation.
  const pool9 = poolEndpoints({ CHAINSTACK_ETH_URL: chain });
  assert.equal(new Set(pool9.map(providerOf)).size, new Set(PUBLIC_ENDPOINTS.map(providerOf)).size + 1, "one new distinct provider enters the pool");
  // A quorum of two DISTINCT providers (drpc + chainstack) succeeds; two aliases of ONE would not (item m).
  const call = (url: string, method: string): Promise<unknown> => {
    if (method === "eth_call") return Promise.resolve("0x64"); // 100, both agree
    return Promise.reject(new Error(`unexpected ${method}`));
  };
  const ok = makeRpcPool({ endpoints: [pubEp, chain], call });
  assert.equal(await ok.supplyAt(1), 100n, "drpc + chainstack form a valid two-provider quorum");
});
