// SENTINEL — off-tool daily job (ADR-M012, K-8): the harness never imports this; this never imports apps/harness/src/tools.
//
// NARABI-OPS-1d: the migration of the residual-118 PAID Chainstack leg under @monark/rpc-guard (route alpha,
// decision 118; ledger-per-cycle + cap-per-account decision 121). These tests exercise the composition run.ts
// wires: openChainstackLeg -> the guarded client -> makeDispatchCall (paid label -> guard, public URL -> keyless
// fetch) -> makeRpcPool. Two seams: IN-PROCESS (openGuardedClient with a factice env + a globalThis.fetch stub,
// deterministic) proves the guard contract on the migrated path; SUBPROCESS (the REAL run.ts driven with a fetch
// stub, motif sentinel-retry.test.ts) proves run.ts's wiring end-to-end (CA-11 branchement) — no network, keys
// factices on .test/.example hosts, paid keys DELETED from the child env.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync, spawn } from "node:child_process";
import { openGuardedClient, verifyCycleLedger, BudgetExceededError, TransportError } from "@monark/rpc-guard";
import type { RunLimits, CycleLedgerEntry } from "@monark/rpc-guard";
import { makeRpcPool, PUBLIC_ENDPOINTS, providerOf } from "../src/rpc.ts";
import { KEYLESS_TIMEOUT_MS } from "../src/keyless-transport.ts";
import { CHAINSTACK_LABEL, CHAINSTACK_MAX_CALLS, CHAINSTACK_RUN_CAP_RU, CHAINSTACK_METHOD_CAPS, makeDispatchCall, classifyGuardOpenError } from "../src/run.ts";
import type { TimelineLine } from "../src/timeline.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..", "..", "..");
const RUN_TS = join(HERE, "..", "src", "run.ts");
const FIXTURE = join(HERE, "fixtures", "narabi-timeline-2026-09-19.jsonl");

// Factice, no committed-secret shape: the URL host is `.test` (never dialed for real; the stub intercepts fetch),
// the "key" path carries the DO_NOT_PUBLISH marker; the published ORIGIN is a real-looking chainstack.com host
// with NO path/key (so providerOf -> chainstack.com, what the Bell probe reads). CYCLE mirrors a monthly cycle id.
const FAKE_URL = "https://rpc.example.test/DO_NOT_PUBLISH_chainkey";
const ORIGIN = "https://ethereum-mainnet.core.chainstack.com";
const CYCLE = "chainstack-test-2026-09";
const SECRET_MARK = "DO_NOT_PUBLISH_chainkey";
const LIMITS: RunLimits = { maxCalls: CHAINSTACK_MAX_CALLS, runCaps: { chainstack: CHAINSTACK_RUN_CAP_RU }, methodCaps: CHAINSTACK_METHOD_CAPS, cycleFloor: { chainstack: 0 } };

const midnight = (d: string): number => Math.floor(Date.parse(d + "T00:00:00Z") / 1000);

let scratch: string | null = null;
function scratchDir(): string { scratch ??= mkdtempSync(join(tmpdir(), "narabi-guard-")); return scratch; }
function freshLedgerDir(): string { const d = mkdtempSync(join(scratchDir(), "ledger-")); return d; }
after(() => {
  assert.notEqual(scratch, null, "the suite allocated a scratch dir (non-vacuous cleanup)");
  if (scratch !== null) { rmSync(scratch, { recursive: true, force: true }); assert.equal(existsSync(scratch), false, "the scratch dir is removed after the suite (no mkdtemp leak)"); }
});

function readLedger(ledgerDir: string, cycle: string): CycleLedgerEntry[] {
  const p = join(ledgerDir, cycle, "chainstack.jsonl");
  if (!existsSync(p)) return [];
  return readFileSync(p, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l) as CycleLedgerEntry);
}

// A minimal Response double carrying BOTH json() (keylessCall reads res.json()) and text() (the guard transport
// reads res.text() then JSON.parse) so ONE stub serves both legs. headers.get() answers the retry-after probe.
interface Resp { ok: boolean; status: number; headers: { get: (h: string) => string | null }; json: () => Promise<unknown>; text: () => Promise<string> }
function mkResp(status: number, payload: unknown, retryAfter?: string): Resp {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  return { ok: status >= 200 && status < 300, status, headers: { get: (h) => (h.toLowerCase() === "retry-after" ? retryAfter ?? null : null) }, json: () => Promise.resolve(payload), text: () => Promise.resolve(body) };
}
const okEnvelope = (result: unknown): Resp => mkResp(200, { jsonrpc: "2.0", id: 1, result }); // A-8: the real success FORM

// ── IN-PROCESS: the guard contract on the migrated path ──────────────────────────────────────────────────────
test("sentinel_chainstack_leg_writes_ledger_line_before_fetch — client.call write-aheads a chained ledger line (network:ethereum-mainnet) to disk BEFORE the transport fetch fires; makeDispatchCall routes the paid LABEL to the guard, so a mutant that fetches raw (no ledger) reds (CA-11; decision 121; C-4)", async () => {
  const ledgerDir = freshLedgerDir();
  const ledgerPath = join(ledgerDir, CYCLE, "chainstack.jsonl");
  const savedFetch = globalThis.fetch;
  let linesSeenByFetch = -1;
  try {
    globalThis.fetch = ((_url: string, init: { body: string }) => {
      linesSeenByFetch = existsSync(ledgerPath) ? readFileSync(ledgerPath, "utf8").trim().split("\n").filter(Boolean).length : 0;
      const { method } = JSON.parse(init.body) as { method: string };
      return Promise.resolve(okEnvelope(method === "eth_call" ? "0x64" : { number: "0x10", timestamp: "0x20" }));
    }) as unknown as typeof fetch;
    const client = openGuardedClient({ CHAINSTACK_ETH_URL: FAKE_URL }, LIMITS, ledgerDir, { chainstack: CYCLE }, { network: "ethereum-mainnet", timeoutMs: KEYLESS_TIMEOUT_MS });
    const call = makeDispatchCall(client);
    const out = await call(CHAINSTACK_LABEL, "eth_call", [{ to: "0x0", data: "0x18160ddd" }, "0x10"]);
    assert.equal(out, "0x64", "the guarded transport resolves the real-form result verbatim");
    assert.equal(linesSeenByFetch, 1, "the write-ahead ledger line was ON DISK before the transport fetch fired (guard C-4)");
    const lines = readLedger(ledgerDir, CYCLE);
    assert.equal(lines.length, 1, "exactly one attempted line");
    assert.equal(lines[0]!.outcome, "attempted");
    assert.equal(lines[0]!.network, "ethereum-mainnet", "the chainstack line carries the network attribute (decision 121)");
    assert.equal(lines[0]!.by_op_method["chainstack|eth_call"], 1, "the attempt is keyed by (op, method)");
    verifyCycleLedger(lines);
  } finally { globalThis.fetch = savedFetch; }
});

test("sentinel_chainstack_leg_consumes_real_form_bodies — A-8 (C-3 full list): the guarded leg is fed bodies in the FORM the RPC endpoint really produces — {jsonrpc,id,result} success resolves the result verbatim; {error:{code,message}} at HTTP 200 THROWS (never resolves undefined); HTTP 429 + Retry-After throws a TransportError carrying retryAfterMs (the CALLER honors the backoff); HTTP 403 throws with NO retryAfterMs (structurally never retried)", async () => {
  const ledgerDir = freshLedgerDir();
  const savedFetch = globalThis.fetch;
  try {
    const client = openGuardedClient({ CHAINSTACK_ETH_URL: FAKE_URL }, LIMITS, ledgerDir, { chainstack: CYCLE }, { network: "ethereum-mainnet", timeoutMs: KEYLESS_TIMEOUT_MS });
    const call = makeDispatchCall(client);
    const p = [{ to: "0x0", data: "0x0" }, "0x1"];
    globalThis.fetch = (() => Promise.resolve(okEnvelope("0x2a"))) as unknown as typeof fetch;
    assert.equal(await call(CHAINSTACK_LABEL, "eth_call", p), "0x2a", "a success envelope resolves result");
    globalThis.fetch = (() => Promise.resolve(mkResp(200, { jsonrpc: "2.0", id: 1, error: { code: -32000, message: "execution reverted" } }))) as unknown as typeof fetch;
    await assert.rejects(() => call(CHAINSTACK_LABEL, "eth_call", p), /rpc-guard|RpcError|reverted|code/i, "a JSON-RPC error at HTTP 200 throws (never resolves undefined)");
    globalThis.fetch = (() => Promise.resolve(mkResp(429, "rate limited", "2"))) as unknown as typeof fetch;
    await assert.rejects(() => call(CHAINSTACK_LABEL, "eth_call", p), (e: unknown) => { assert.ok(e instanceof TransportError && e.code === 429 && e.retryAfterMs === 2000, `429 => TransportError code 429 + retryAfterMs 2000; got ${String(e)}`); return true; }, "HTTP 429 + Retry-After carries retryAfterMs");
    globalThis.fetch = (() => Promise.resolve(mkResp(403, "forbidden"))) as unknown as typeof fetch;
    await assert.rejects(() => call(CHAINSTACK_LABEL, "eth_call", p), (e: unknown) => { assert.ok(e instanceof TransportError && e.code === 403 && e.retryAfterMs === undefined, `403 => TransportError code 403 + NO retryAfterMs; got ${String(e)}`); return true; }, "HTTP 403 is never retried (no retryAfterMs, by construction)");
  } finally { globalThis.fetch = savedFetch; }
});

test("sentinel_chainstack_caps_cover_the_g0_m7_stress_bound — the pinned caps NEVER refuse at the G0 M-7 borne haute (~322 attempts, all-on-chainstack: a STRESS bound, NOT this lot's measurement — the REAL per-day count is measured in the e2e below): 322 guarded calls ledger 0 'refused', each per-method count under its cap, run RU under the run cap", async () => {
  const ledgerDir = freshLedgerDir();
  const savedFetch = globalThis.fetch;
  try {
    globalThis.fetch = (() => Promise.resolve(okEnvelope("0x1"))) as unknown as typeof fetch;
    const client = openGuardedClient({ CHAINSTACK_ETH_URL: FAKE_URL }, LIMITS, ledgerDir, { chainstack: CYCLE }, { network: "ethereum-mainnet", timeoutMs: KEYLESS_TIMEOUT_MS });
    const call = makeDispatchCall(client);
    const methods = ["eth_getBlockByNumber", "eth_getLogs", "eth_call"];
    const WORST = 322; // G0 M-7 borne haute (stress bound, not measured here)
    for (let i = 0; i < WORST; i++) await call(CHAINSTACK_LABEL, methods[i % 3]!, []);
    const lines = readLedger(ledgerDir, CYCLE);
    const attempted = lines.filter((l) => l.outcome === "attempted");
    assert.ok(attempted.length >= WORST, `>= ${String(WORST)} attempts ledgered (non-vacuous), got ${String(attempted.length)}`);
    assert.equal(lines.filter((l) => l.outcome === "refused").length, 0, "the pinned caps NEVER refuse at the measured worst case (M-7)");
    const perMethod: Record<string, number> = {};
    let ru = 0;
    for (const l of attempted) { const key = Object.keys(l.by_op_method)[0]!; const m = key.split("|")[1]!; perMethod[m] = (perMethod[m] ?? 0) + 1; ru += l.credits_derived; }
    for (const m of methods) assert.ok((perMethod[m] ?? 0) <= CHAINSTACK_METHOD_CAPS[m]!, `${m} count ${String(perMethod[m])} <= method cap ${String(CHAINSTACK_METHOD_CAPS[m])}`);
    assert.ok(ru <= CHAINSTACK_RUN_CAP_RU, `run RU ${String(ru)} <= run cap ${String(CHAINSTACK_RUN_CAP_RU)}`);
    assert.ok(ru > 0 && WORST <= CHAINSTACK_MAX_CALLS, "the worst case is below the run-wide attempt cap (non-vacuous)");
  } finally { globalThis.fetch = savedFetch; }
});

test("chainstack_refusal_degrades_to_keyless_quorum_not_stopped_day — a guarded REFUSAL (BudgetExceededError, a cap touched mid-run) throws from the dispatcher; makeRpcPool benches the chainstack leg like any endpoint and the value read completes on the keyless quorum — the day is NOT stopped (D-caps)", async () => {
  let chainstackTried = false;
  const call = (url: string, method: string): Promise<unknown> => {
    if (url === CHAINSTACK_LABEL) { chainstackTried = true; return Promise.reject(new BudgetExceededError("rpc-guard: cycle_cap (fail-closed)")); }
    return Promise.resolve(method === "eth_call" ? "0x64" : { number: "0x1", timestamp: "0x2" });
  };
  const pool = makeRpcPool({ endpoints: [CHAINSTACK_LABEL, "stub://b", "stub://c"], call });
  const supply = await pool.supplyAt(1); // quorumTwo eth_call: chainstack refuses (benched), b+c agree
  assert.equal(supply, 100n, "the value read completes on the keyless quorum despite the chainstack cap refusal");
  assert.equal(chainstackTried, true, "chainstack WAS attempted (non-vacuous) and benched, not silently skipped");
});

test("sentinel_chainstack_leg_uses_20s_timeout — the guarded leg is opened with timeoutMs = KEYLESS_TIMEOUT_MS = 20 s (M-10), NOT the guard's 30 s default; a mutant setting 30_000 (constant) or omitting timeoutMs (run.ts) reds", () => {
  assert.equal(KEYLESS_TIMEOUT_MS, 20_000, "the keyless + guarded leg deadline is 20 s (M-10)");
  const src = readFileSync(RUN_TS, "utf8");
  assert.match(src, /openGuardedClient\([^)]*timeoutMs:\s*KEYLESS_TIMEOUT_MS/, "run.ts opens the guarded leg with timeoutMs: KEYLESS_TIMEOUT_MS");
});

test("sentinel_guard_open_error_classifier_is_a_closed_set — classifyGuardOpenError maps every open failure to the closed chainstack_guard set, never a message (D-degrade)", () => {
  assert.equal(classifyGuardOpenError(new BudgetExceededError("bad caps")), "config_error", "assertLimits (bad caps/floor) => config_error");
  assert.equal(classifyGuardOpenError(new Error("rpc-guard: requested operator 'chainstack' is not resolved from env (fail-closed)")), "unconfigured");
  assert.equal(classifyGuardOpenError(new Error("rpc-guard: operator 'chainstack' is already locked for this cycle (fail-closed, C-9)")), "lock_held");
  assert.equal(classifyGuardOpenError(new Error("rpc-guard: HELIUS_LEDGER_DIR '/x' does not pre-exist (fail-closed, C-8)")), "ledger_error");
  assert.equal(classifyGuardOpenError(new Error("rpc-guard: cycle ledger chain broken (prev mismatch, fail-closed)")), "ledger_error");
  assert.equal(classifyGuardOpenError(new Error("some other thing")), "config_error", "anything unmatched => config_error (fail-safe, still degrades)");
});

// ── SUBPROCESS: the real run.ts wiring, end-to-end (CA-11 branchement) ────────────────────────────────────────
interface FixLine { day: string; from_block: number; to_block: number; burns: string; mints: string; supply_close: string; s_open: string; line_hash: string; }
function fixtureLines(): FixLine[] {
  return readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l) as FixLine);
}
function finVars(l3: FixLine): Record<string, string> { return { STUB_FIN_BLOCK: String(l3.to_block + 5), STUB_FIN_TS: String(midnight("2026-09-20") + 3600) }; }
function seedState(nLines: number): string {
  const dir = mkdtempSync(join(scratchDir(), "state-"));
  const raw = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  writeFileSync(join(dir, "timeline.jsonl"), raw.slice(0, nLines).join("\n") + "\n");
  return dir;
}
// The fixture-driven stub for the subprocess runs. Serves BOTH the keyless legs (res.json) AND the guarded leg
// (res.text). STUB_HEALTHY (comma tokens) => only matching URLs answer, the rest 503 — used to FORCE the guarded
// leg into a degraded-pool quorum (the incident scenario the migration hardens), so it actually ledgers.
const STUB_SRC = `
import { readFileSync } from "node:fs";
const lines = readFileSync(process.env.STUB_FIXTURE, "utf8").replace(/\\r\\n/g, "\\n").split("\\n").filter((x) => x.trim()).map((l) => JSON.parse(l));
const byDay = new Map(lines.map((l) => [l.day, l]));
const W = ["2026-09-18", "2026-09-19"].map((d) => byDay.get(d)).filter(Boolean);
const midnight = (d) => Math.floor(new Date(d + "T00:00:00Z").getTime() / 1000);
const w18 = byDay.get("2026-09-18"), w19 = byDay.get("2026-09-19");
const anchors = [[w18.from_block, midnight("2026-09-18")], [w19.from_block, midnight("2026-09-19")], [w19.to_block + 1, midnight("2026-09-20")]];
function tsOf(b) { if (b <= anchors[0][0]) { const [b0,t0]=anchors[0],[b1,t1]=anchors[1]; return Math.round(t0+(b-b0)*(t1-t0)/(b1-b0)); } for (let i=0;i<anchors.length-1;i++){ const [b0,t0]=anchors[i],[b1,t1]=anchors[i+1]; if (b<=b1) return Math.round(t0+(b-b0)*(t1-t0)/(b1-b0)); } const n=anchors.length,[b0,t0]=anchors[n-2],[b1,t1]=anchors[n-1]; return Math.round(t1+(b-b1)*(t1-t0)/(b1-b0)); }
const hex = (n) => "0x" + BigInt(n).toString(16);
const ZERO = "0x" + "0".repeat(64), ONE = "0x" + "1".repeat(64);
const byFrom = new Map(W.map((w) => [w.from_block, w]));
const supply = new Map();
for (const w of W) { supply.set(w.to_block, BigInt(w.supply_close)); supply.set(w.from_block - 1, BigInt(w.s_open)); }
const healthy = (process.env.STUB_HEALTHY || "").split(",").filter(Boolean);
const isHealthy = (url) => healthy.length === 0 || healthy.some((h) => url.includes(h));
const R = (status, obj) => Promise.resolve({ ok: status >= 200 && status < 300, status, headers: { get: () => null }, json: () => Promise.resolve(obj), text: () => Promise.resolve(JSON.stringify(obj)) });
globalThis.fetch = (url, init) => {
  if (!isHealthy(url)) return Promise.resolve({ ok: false, status: 503, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("degraded") });
  const { method, params } = JSON.parse(init.body);
  const ok = (result) => R(200, { jsonrpc: "2.0", id: 1, result });
  const fail = (status) => Promise.resolve({ ok: false, status, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
  if (method === "eth_getBlockByNumber") { const tag = params[0]; if (tag === "finalized") return ok({ number: hex(Number(process.env.STUB_FIN_BLOCK)), timestamp: hex(Number(process.env.STUB_FIN_TS)) }); const b = parseInt(tag, 16); return ok({ number: hex(b), timestamp: hex(tsOf(b)) }); }
  if (method === "eth_getLogs") { const from = parseInt(params[0].fromBlock, 16); const w = byFrom.get(from); if (!w) return ok([]); return ok([{ topics: [ZERO, ONE, ZERO], data: hex(BigInt(w.burns)) }, { topics: [ZERO, ZERO, ONE], data: hex(BigInt(w.mints)) }]); }
  if (method === "eth_call") { const block = parseInt(params[1], 16); const s = supply.get(block); if (s === undefined) return fail(500); return ok(hex(s)); }
  return fail(400);
};
`;
const HANG_SRC = `globalThis.fetch = () => new Promise(() => {});`;
function writeStub(src: string, name: string): string { const p = join(scratchDir(), name); writeFileSync(p, src); return pathToFileURL(p).href; }

interface EndJson { processedDays: string[]; stopped: string | null; chainstack: boolean; chainstack_guard: string; exit_code: number; }
function guardEnv(dir: string, vars: Record<string, string>, opts: { url?: boolean; cycle?: boolean; origin?: boolean } = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, STUB_FIXTURE: FIXTURE };
  for (const k of ["CHAINSTACK_ETH_URL", "CHAINSTACK_CYCLE_ID", "CHAINSTACK_ETH_ORIGIN", "CHAINSTACK_CYCLE_FLOOR"]) delete env[k];
  for (const k of Object.keys(env)) if (k.startsWith("MONARK_SENTINEL_")) delete env[k];
  if (opts.url !== false) env.CHAINSTACK_ETH_URL = FAKE_URL;
  if (opts.cycle !== false) env.CHAINSTACK_CYCLE_ID = CYCLE;
  if (opts.origin !== false) env.CHAINSTACK_ETH_ORIGIN = ORIGIN;
  Object.assign(env, { MONARK_SENTINEL_DIR: dir }, vars);
  return env;
}
function runGuardedSync(dir: string, vars: Record<string, string>, opts?: { url?: boolean; cycle?: boolean; origin?: boolean }): { status: number; stdout: string; end: EndJson } {
  const r = spawnSync(process.execPath, ["--import", writeStub(STUB_SRC, "stub.mjs"), RUN_TS, "--state", dir], { cwd: REPO, env: guardEnv(dir, vars, opts), encoding: "utf8", timeout: 60_000 });
  const stdout = r.stdout ?? "";
  const close = stdout.indexOf("\n}");
  assert.ok(close >= 0, `run.ts printed no end JSON. stdout=${JSON.stringify(stdout)} stderr=${JSON.stringify(r.stderr)}`);
  return { status: r.status ?? -1, stdout, end: JSON.parse(stdout.slice(0, close + 2)) as EndJson };
}
function lastLine(dir: string): TimelineLine {
  const ls = readFileSync(join(dir, "timeline.jsonl"), "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  return JSON.parse(ls[ls.length - 1]!) as TimelineLine;
}

test("sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock — the REAL run.ts opens the leg, drives the degraded-pool quorum through the guard (attempted lines stamped network:ethereum-mainnet), publishes the chainstack.com ORIGIN as the 8th endpoint (C-6), reproduces the published line_hash (M-11), releases the cycle lock at exit (unlocked line, no .lock), and never leaks the key (CA-11 branchement)", () => {
  const l3 = fixtureLines()[2]!;
  const dir = seedState(2);
  const ledgerDir = join(dir, "ledger");
  mkdirSync(ledgerDir, { recursive: true }); // C-8: the RUNBOOK pre-creates the parent (install -d); never auto-created
  // Force the guarded leg into the quorum: fail every keyless but pocket, so the 2-provider quorum is pocket +
  // chainstack (the incident scenario the migration hardens) — the guard therefore actually ledgers attempts.
  const r = runGuardedSync(dir, { ...finVars(l3), STUB_HEALTHY: "pocket.network,rpc.example.test" });
  assert.equal(r.status, 0, "the guarded run writes 2026-09-19 on the pocket+chainstack quorum");
  assert.equal(r.end.chainstack, true, "the leg opened => chainstack=true (branchement)");
  assert.equal(r.end.chainstack_guard, "ok", "chainstack_guard=ok");
  const written = lastLine(dir);
  assert.equal(written.line_hash, l3.line_hash, "line_hash is UNCHANGED by the migration (M-11: endpoints/provenance outside the hash)");
  assert.equal(written.endpoints.length, PUBLIC_ENDPOINTS.length + 1, "the published line lists the origin as the 8th endpoint");
  assert.equal(providerOf(written.endpoints[written.endpoints.length - 1]!), "chainstack.com", "the published origin's provider is chainstack.com (C-6: what the Bell probe reads)");
  assert.ok(!r.stdout.includes(SECRET_MARK) && !JSON.stringify(written).includes(SECRET_MARK), "the key path never leaks to stdout or the written line (C-1)");
  const led = readLedger(ledgerDir, CYCLE);
  verifyCycleLedger(led);
  assert.ok(led.some((l) => l.outcome === "attempted" && l.network === "ethereum-mainnet"), "the chainstack ledger carries attempted lines stamped network:ethereum-mainnet (decision 121) — the leg is actually METERED via the real run.ts");
  // MEASURED (G1, decision D-caps: the G1 measures the real count and pins the caps, never guessed): the per-method
  // chainstack attempts on THIS one degraded-pool day (chainstack forced into every quorum). Each is > 0 and <= its
  // pinned cap — the caps are sized to this real count (G1.md: eth_getBlockByNumber 19, eth_getLogs 1, eth_call 2 = 22 / 44 RU).
  const attempted = led.filter((l) => l.outcome === "attempted");
  assert.ok(attempted.length > 0, "the guarded leg was actually metered on the degraded-pool day (non-vacuous)");
  const perMethod: Record<string, number> = {};
  for (const l of attempted) { const m = Object.keys(l.by_op_method)[0]!.split("|")[1]!; perMethod[m] = (perMethod[m] ?? 0) + 1; }
  for (const [m, n] of Object.entries(perMethod)) assert.ok(n > 0 && n <= (CHAINSTACK_METHOD_CAPS[m] ?? 0), `measured chainstack ${m}=${String(n)} is within its pinned method cap ${String(CHAINSTACK_METHOD_CAPS[m])}`);
  assert.ok(led.some((l) => l.outcome === "unlocked"), "the cycle lock was released via the served unlock in the finally (D-lock i) — a chained unlocked line");
  assert.equal(existsSync(join(ledgerDir, CYCLE, "chainstack.lock")), false, "no .lock remains after a clean exit (D-lock i)");
});

test("sentinel_guard_open_failure_degrades_to_keyless_and_publishes — with the cycle config present but the ledger PARENT absent (C-8), openChainstackLeg fails to open: run.ts degrades to the 7 keyless endpoints, publishes NO origin (C-6), chainstack=false, chainstack_guard=ledger_error, exit 0 — a mutant removing the try/catch would FATAL the whole run (D-degrade)", () => {
  const l3 = fixtureLines()[2]!;
  const dir = seedState(2); // NOTE: no mkdir of dir/ledger => ensureCycleDir throws "does not pre-exist" => ledger_error
  const r = runGuardedSync(dir, { ...finVars(l3) });
  assert.equal(r.status, 0, "a guard-open failure NEVER FATALs the run; it degrades and publishes (ADR-NARABI-OPS-1 D3)");
  assert.equal(r.end.chainstack, false, "the leg did not open => chainstack=false");
  assert.equal(r.end.chainstack_guard, "ledger_error", "the missing ledger parent (C-8) classifies as ledger_error, not a crash");
  const written = lastLine(dir);
  assert.equal(written.endpoints.length, PUBLIC_ENDPOINTS.length, "a degraded run publishes the 7 public endpoints only (C-6: no origin without an opened leg)");
  assert.ok(!written.endpoints.some((e) => providerOf(e) === "chainstack.com"), "no chainstack.com origin is published when the leg failed to open (C-6 mutant reds here)");
});

test("sentinel_chainstack_floor_malformed_is_config_error — with the cycle + origin present but CHAINSTACK_CYCLE_FLOOR malformed (for each of 'abc' NaN, '-3' negative, '12.5' float), chainstackFloorFromEnv throws INSIDE openChainstackLeg's try BEFORE openGuardedClient, so the real run.ts degrades: chainstack_guard=config_error, chainstack=false, exit 0, the 7 keyless endpoints only, and NO .lock / NO ledger line is written (the throw precedes any metering). A mutant dropping the non-negative-integer floor regex lets a NEGATIVE '-3' and a float '12.5' pass assertLimits (finite, <= cap) so the leg opens 'ok' — reddening every value except 'abc' (NaN is still caught by assertLimits). C-V-3 / C-G2-2", () => {
  const l3 = fixtureLines()[2]!;
  for (const f of ["abc", "-3", "12.5"]) {
    const dir = seedState(2);
    const ledgerDir = join(dir, "ledger");
    // Parent pre-exists (C-8): the real code throws on the floor BEFORE using it, but the MUTANT reaches
    // openGuardedClient, so the parent must exist for the mutant to open 'ok' and expose that '-3' passed assertLimits.
    mkdirSync(ledgerDir, { recursive: true });
    const r = runGuardedSync(dir, { ...finVars(l3), CHAINSTACK_CYCLE_FLOOR: f });
    assert.equal(r.status, 0, `floor ${JSON.stringify(f)}: a malformed floor NEVER FATALs the run; it degrades (D-degrade)`);
    assert.equal(r.end.chainstack, false, `floor ${JSON.stringify(f)}: the leg did not open => chainstack=false`);
    assert.equal(r.end.chainstack_guard, "config_error", `floor ${JSON.stringify(f)}: a malformed floor => chainstack_guard=config_error (got ${r.end.chainstack_guard}: a dropped regex opens the leg 'ok' on a float/negative)`);
    const written = lastLine(dir);
    assert.equal(written.endpoints.length, PUBLIC_ENDPOINTS.length, `floor ${JSON.stringify(f)}: a degraded run publishes the 7 public endpoints only (no origin)`);
    assert.ok(!written.endpoints.some((e) => providerOf(e) === "chainstack.com"), `floor ${JSON.stringify(f)}: no chainstack.com origin when the leg did not open`);
    assert.equal(readLedger(ledgerDir, CYCLE).length, 0, `floor ${JSON.stringify(f)}: the floor throw precedes openGuardedClient => NO ledger line (no metering)`);
    assert.equal(existsSync(join(ledgerDir, CYCLE, "chainstack.lock")), false, `floor ${JSON.stringify(f)}: no lock is acquired when the floor is rejected before open`);
  }
});

test("sentinel_chainstack_origin_absent_is_unconfigured — with CHAINSTACK_CYCLE_ID present but CHAINSTACK_ETH_ORIGIN absent (guardEnv origin:false), openChainstackLeg returns unconfigured BEFORE opening (the origin is the Bell probe's provenance, required to SERVE the leg): the real run.ts degrades to the 7 keyless endpoints, chainstack=false, chainstack_guard=unconfigured, exit 0, and every published endpoint is a non-empty string (NO null/undefined). A mutant dropping the 'origin === undefined' half of the guard opens the leg 'ok' and publishes undefined as the 8th endpoint (a null in the served line) — reddening here (A-10 output binding). C-V-2 / C-G2-2", () => {
  const l3 = fixtureLines()[2]!;
  const dir = seedState(2);
  const ledgerDir = join(dir, "ledger");
  // Parent pre-exists (C-8): the real code returns unconfigured BEFORE using it, but the MUTANT opens the leg and
  // must be able to publish the null origin — that is the served-output regression this test binds (A-10).
  mkdirSync(ledgerDir, { recursive: true });
  const r = runGuardedSync(dir, { ...finVars(l3) }, { origin: false });
  assert.equal(r.status, 0, "an absent origin degrades, never FATALs (D-degrade)");
  assert.equal(r.end.chainstack, false, "the leg did not open => chainstack=false");
  assert.equal(r.end.chainstack_guard, "unconfigured", `an absent origin => chainstack_guard=unconfigured (got ${r.end.chainstack_guard}: a dropped origin-half opens the leg 'ok')`);
  const written = lastLine(dir);
  assert.equal(written.endpoints.length, PUBLIC_ENDPOINTS.length, "a degraded run publishes the 7 public endpoints only");
  assert.ok(written.endpoints.every((e) => typeof e === "string" && e.length > 0), "every published endpoint is a non-empty string — NO null/undefined 8th endpoint (the mutant publishes undefined here)");
  assert.ok(!written.endpoints.some((e) => providerOf(e) === "chainstack.com"), "no chainstack.com origin is published when the leg did not open");
});

test("sentinel_run_re_acquires_lock_after_clean_exit — because run 1 released the cycle lock (finally), run 2 opens the leg again (no LockHeldError): both runs are chainstack_guard=ok. A mutant dropping the finally release makes run 2 read lock_held and reds (D-lock i)", () => {
  const l3 = fixtureLines()[2]!;
  const dir = seedState(2);
  mkdirSync(join(dir, "ledger"), { recursive: true });
  const r1 = runGuardedSync(dir, { ...finVars(l3), STUB_HEALTHY: "pocket.network,rpc.example.test" });
  assert.equal(r1.end.chainstack_guard, "ok", "run 1 opened the leg");
  // run 2 on the SAME cycle/ledger: it must re-acquire (run 1 unlocked). The state now has 2026-09-19, so nothing
  // is due, but openChainstackLeg still opens+locks+unlocks — chainstack_guard reflects the (re)acquisition.
  const r2 = runGuardedSync(dir, { ...finVars(l3), STUB_HEALTHY: "pocket.network,rpc.example.test" });
  assert.equal(r2.end.chainstack_guard, "ok", "run 2 RE-ACQUIRED the lock (run 1's finally released it); a held lock would be lock_held");
  const led = readLedger(join(dir, "ledger"), CYCLE);
  assert.equal(led.filter((l) => l.outcome === "unlocked").length, 2, "two runs => two chained unlocked lines");
  assert.equal(existsSync(join(dir, "ledger", CYCLE, "chainstack.lock")), false, "no .lock remains after the second clean exit");
});

test("sentinel_run_releases_chainstack_lock_on_sigterm — a SIGTERM (a TimeoutStartSec kill) fires run.ts's handler, which runs the served unlock synchronously and exits, so the cycle lock is released even on a kill. WIN32 SKIP is declared + NON-vacuous: on non-win32 (CI ubuntu-latest) the body RUNS; on win32 process.kill is a hard kill with no handler and the RUNBOOK unlock covers a SIGKILL (C-7)", { skip: process.platform === "win32" ? "win32: process.kill is a hard kill (no SIGTERM handler); RUNBOOK unlock covers a SIGKILL (C-7)" : false }, async () => {
  const l3 = fixtureLines()[2]!;
  const dir = seedState(2);
  const ledgerDir = join(dir, "ledger");
  mkdirSync(ledgerDir, { recursive: true });
  const lockPath = join(ledgerDir, CYCLE, "chainstack.lock");
  // HANG every fetch so the run blocks holding the lock (acquired at openGuardedClient, BEFORE any fetch).
  const child = spawn(process.execPath, ["--import", writeStub(HANG_SRC, "hang.mjs"), RUN_TS, "--state", dir], { cwd: REPO, env: guardEnv(dir, { ...finVars(l3) }), stdio: "ignore" });
  const exited = new Promise<number | null>((res) => child.on("exit", (code) => { res(code); }));
  try {
    const t0 = Date.now();
    while (!existsSync(lockPath) && Date.now() - t0 < 20_000 && child.exitCode === null) await new Promise((r) => setTimeout(r, 100));
    assert.ok(existsSync(lockPath), "the cycle lock is acquired at start-up (before any fetch)");
    child.kill("SIGTERM");
    const code = await exited;
    assert.notEqual(code, null, "the child exited after SIGTERM (the handler ran then process.exit)");
    assert.equal(existsSync(lockPath), false, "the SIGTERM handler released the cycle lock — no .lock remains (D-lock i)");
    assert.ok(readLedger(ledgerDir, CYCLE).some((l) => l.outcome === "unlocked"), "an unlocked line was chained by the served unlock in the SIGTERM handler");
  } finally { if (child.exitCode === null) child.kill("SIGKILL"); }
});
