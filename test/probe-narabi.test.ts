// test/probe-narabi.test.ts — non-LLM oracle for the EXTERNAL Narabi probe (ADR-NARABI-OPS-1 -1b-i:
// DETECTION). Runs at the REPO ROOT under `node --test` (test/*.test.ts glob), NOT under apps/sentinel/test
// (that tree is exported package-style and would drag the built-ins-only .mjs import into the public CI). It
// imports the probe's pure functions (typed via scripts/probe-narabi.d.mts) and DRIVES the real .mjs as a
// SUBPROCESS (the only way to observe the real process exit code), plus the REAL sentinel producer run.ts for
// the Chainstack pipe (CA-11 durci). No network: a fetch stub / a node:http loopback server / `--file`.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync, spawn } from "node:child_process";
import { hashedFields, lineHashOf as sentinelLineHashOf } from "../apps/sentinel/src/timeline.ts";
import type { TimelineLine } from "../apps/sentinel/src/timeline.ts";
import { providerOf as rpcProviderOf } from "../apps/sentinel/src/rpc.ts";
import {
  providerOf, chainstackPresent, hashedFieldsOf, lineHashOf as probeLineHashOf,
  urlTransportAllowed, isLoopbackHost, DEADLINE_UTC_MINUTES, DEFAULT_TIMEOUT_MS, DEFAULT_RETRIES, SCHEMA,
} from "../scripts/probe-narabi.mjs";
import type { NarabiState } from "../scripts/probe-narabi.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..");
const PROBE_MJS = join(REPO, "scripts", "probe-narabi.mjs");
const RUN_TS = join(REPO, "apps", "sentinel", "src", "run.ts");
const FIXTURE = join(REPO, "apps", "sentinel", "test", "fixtures", "narabi-timeline-2026-09-19.jsonl");

let scratch: string | null = null;
let uniq = 0;
function scratchDir(): string {
  scratch ??= mkdtempSync(join(tmpdir(), "narabi-probe-"));
  return scratch;
}
// This suite cleans up its OWN mkdtemp (the very leak L-4 fixes in sentinel-retry.test.ts): no narabi-probe-* left.
after(() => {
  if (scratch !== null) rmSync(scratch, { recursive: true, force: true });
});

interface ProbeRun { status: number; stdout: string; state: NarabiState }
/** Spawn the REAL probe .mjs and return its exit code + the narabi.json it wrote (which it ALWAYS writes). */
function runProbe(args: readonly string[], env: Record<string, string> = {}): ProbeRun {
  const out = join(scratchDir(), `narabi-${String(uniq++)}.json`);
  const r = spawnSync(process.execPath, [PROBE_MJS, "--out", out, ...args], {
    cwd: REPO, env: { ...process.env, ...env }, encoding: "utf8", timeout: 60_000,
  });
  assert.ok(existsSync(out), `the probe must ALWAYS write narabi.json (stdout=${JSON.stringify(r.stdout)} stderr=${JSON.stringify(r.stderr)})`);
  const state = JSON.parse(readFileSync(out, "utf8")) as NarabiState;
  return { status: r.status ?? -1, stdout: r.stdout ?? "", state };
}

/** ASYNC variant, needed only when the probe connects back to an http server IN THIS process: a synchronous
 *  spawnSync would freeze the parent event loop and deadlock (the server could not accept the child). */
async function runProbeAsync(args: readonly string[], env: Record<string, string> = {}): Promise<ProbeRun> {
  const out = join(scratchDir(), `narabi-${String(uniq++)}.json`);
  const child = spawn(process.execPath, [PROBE_MJS, "--out", out, ...args], { cwd: REPO, env: { ...process.env, ...env } });
  const status = await new Promise<number>((resolve) => { child.on("close", (code) => resolve(code ?? -1)); });
  assert.ok(existsSync(out), "the probe must ALWAYS write narabi.json");
  const state = JSON.parse(readFileSync(out, "utf8")) as NarabiState;
  return { status, stdout: "", state };
}

const midnight = (d: string): number => Math.floor(Date.parse(d + "T00:00:00Z") / 1000);

// ── C-1: the 31-field hash order is faithful to timeline.ts — proven on a 31-distinct-value synthetic line ──
test("probe_hashed_fields_order_equals_sentinel — the probe's 31-field order == timeline.ts hashedFields on a synthetic line with 31 pairwise-distinct values; the committed lines are the second oracle (C-1)", () => {
  const V = (name: string): string => `__${name}__`;
  const synth = {
    day: V("day"), from_block: V("from_block"), to_block: V("to_block"), burns: V("burns"),
    mints: V("mints"), supply_close: V("supply_close"), s_open: V("s_open"), c1_ok: V("c1_ok"),
    utterance_hash: V("utterance_hash"), attested_flow_sha256: V("attested_flow_sha256"), v: V("v"),
    regime: { floor: V("regime.floor"), stress: V("regime.stress") }, pair_status: V("pair_status"),
    s_raw: V("s_raw"), s: V("s"), E_tracker: V("E_tracker"), q_before: V("q_before"), eta: V("eta"),
    q_after: V("q_after"), T: V("T"), mean_E_tracker: V("mean_E_tracker"), bound_thm1: V("bound_thm1"),
    digest_T: V("digest_T"), E_static: V("E_static"), t_deg: V("t_deg"), sum_E_static: V("sum_E_static"),
    B_t: V("B_t"), rolling90_calm_miss: V("rolling90_calm_miss"), drift_flag: V("drift_flag"),
    prev_line_hash: V("prev_line_hash"),
    line_hash: V("line_hash"), endpoints: [V("endpoints")], node_version: V("node_version"), sentinel_sha: V("sentinel_sha"),
  } as unknown as TimelineLine;

  const sentinelFields = hashedFields(synth);
  const probeFields = hashedFieldsOf(synth);
  assert.equal(sentinelFields.length, 31, "hashedFields must have exactly 31 entries");
  assert.equal(new Set(sentinelFields).size, 31, "the synthetic values are pairwise-distinct (a permutation reds the deepEqual)");
  // Order-sensitive equality: swapping ANY two fields (e.g. s_raw<->s, c1_ok<->regime.floor) reds here.
  assert.deepEqual(probeFields, sentinelFields, "the probe's 31-field order must equal timeline.ts hashedFields field-for-field");
  assert.equal(probeLineHashOf(synth), sentinelLineHashOf(synth), "the probe recomputes the same line_hash on the synthetic line");

  // Second oracle: the committed published lines recompute byte-for-byte (fixture C-7).
  const lines = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).map((l) => JSON.parse(l) as TimelineLine);
  assert.equal(lines.length, 3, "the fixture carries three real lines");
  for (const l of lines) {
    assert.equal(probeLineHashOf(l), l.line_hash, `committed line ${l.day} recomputes its published line_hash`);
    assert.equal(probeLineHashOf(l), sentinelLineHashOf(l), `and equals timeline.ts lineHashOf for ${l.day}`);
  }
});

// ── C-12 / inherited item i: chainstack_present by PROVIDER membership (never positional), duplicate is faithful ─
test("probe_provider_of_matches_sentinel — the duplicated providerOf equals apps/sentinel/src/rpc.ts on chainstack.com AND p2pify.com; chainstack_present is by provider membership, never a positional endpoints[8] (C-12; inherited item i)", () => {
  const chain = "https://ethereum-mainnet.core.chainstack.com";
  const p2pify = "https://nd-52-1-2.p2pify.com";
  const pub = "https://eth.drpc.org";
  for (const u of [chain, p2pify, pub, "https://ethereum.publicnode.com"]) {
    assert.equal(providerOf(u), rpcProviderOf(u), `providerOf(${u}) must equal the sentinel's duplicate`);
  }
  assert.equal(providerOf(chain), "chainstack.com");
  assert.equal(providerOf(p2pify), "p2pify.com", "a *.p2pify.com host collapses to p2pify.com (inherited item i)");
  // Present when the operator is ANYWHERE in the list — including NOT at index 8 (kills the positional mutant).
  assert.equal(chainstackPresent([pub, chain]), true, "chainstack at index 1 is detected (never endpoints[8])");
  assert.equal(chainstackPresent([pub, p2pify]), true, "a p2pify origin is detected too (inherited item i)");
  const eightPublic = [
    "https://ethereum-rpc.publicnode.com", "https://eth.llamarpc.com", "https://eth.drpc.org",
    "https://rpc.mevblocker.io", "https://eth-mainnet.public.blastapi.io", "https://1rpc.io/eth",
    "https://ethereum.publicnode.com", "https://eth.rpc.blxrbdn.com",
  ];
  assert.equal(chainstackPresent(eightPublic), false, "the 8 free endpoints alone -> no chainstack");
});

// ── C-4: the UTC deadline grid, lag_days>0 STRICT, reboot-no-false-alarm, DEADLINE pinned at 10:30 ───────────
test("probe_narabi_detects_lag — the UTC deadline grid sets expected_last_day; lag_days>0 STRICT is unhealthy (exit 1); a reboot before 10:30 and lag_days<0 mornings stay healthy; DEADLINE pinned at 10:30 (C-4)", () => {
  interface Case { now: string; status: "healthy" | "unhealthy"; reason: string | null; lag: number; exit: number; note: string }
  const cases: Case[] = [
    { now: "2026-09-20T10:35Z", status: "healthy", reason: null, lag: 0, exit: 0, note: "after deadline, J-1 present" },
    { now: "2026-09-21T10:35Z", status: "unhealthy", reason: "lag", lag: 1, exit: 1, note: "after deadline, J-1 missing" },
    { now: "2026-09-21T00:15Z", status: "healthy", reason: null, lag: 0, exit: 0, note: "reboot before deadline -> no false alarm (kills grid-removed)" },
    { now: "2026-09-21T09:45Z", status: "healthy", reason: null, lag: 0, exit: 0, note: "09:45Z healthy; local 10:45 kills heure-locale + local-complet" },
    { now: "2026-09-20T23:30Z", status: "healthy", reason: null, lag: 0, exit: 0, note: "23:30Z healthy; local date 09-21 kills date-locale" },
    { now: "2026-09-21T10:29Z", status: "healthy", reason: null, lag: 0, exit: 0, note: "10:29Z still healthy (pins DEADLINE lower)" },
    { now: "2026-09-21T10:30Z", status: "unhealthy", reason: "lag", lag: 1, exit: 1, note: "10:30Z lag (pins DEADLINE)" },
    { now: "2026-09-20T05:00Z", status: "healthy", reason: null, lag: -1, exit: 0, note: "lag_days=-1 normal morning (kills lag!==0)" },
  ];
  for (const c of cases) {
    const r = runProbe(["--file", FIXTURE, "--now", c.now]);
    assert.equal(r.state.status, c.status, `${c.now}: status (${c.note})`);
    assert.equal(r.state.reason, c.reason, `${c.now}: reason (${c.note})`);
    assert.equal(r.state.lag_days, c.lag, `${c.now}: lag_days (${c.note})`);
    assert.equal(r.status, c.exit, `${c.now}: exit code (${c.note})`);
    assert.equal(r.state.last_day, "2026-09-19", `${c.now}: last_day is the fixture's last`);
    assert.equal(r.state.chain_ok, true, `${c.now}: the fixture chain is intact`);
    assert.equal(r.state.schema, SCHEMA, `${c.now}: schema is versioned`);
  }
});

// ── C-4 timer coherence: every OnCalendar shot fires at/after DEADLINE, in UTC ───────────────────────────────
test("probe_timer_oncalendar_ge_deadline — every OnCalendar shot fires at/after the probe's DEADLINE constant, and is an explicit UTC time (C-4 timer coherence)", () => {
  const timer = readFileSync(join(REPO, "deploy", "monark-probe.timer"), "utf8");
  const shots = [...timer.matchAll(/^OnCalendar=.*?(\d{2}):(\d{2}):\d{2}\s+UTC\s*$/gm)];
  assert.ok(shots.length >= 1, "the timer declares at least one OnCalendar shot");
  for (const m of shots) {
    const minutes = Number(m[1] ?? "0") * 60 + Number(m[2] ?? "0");
    assert.ok(minutes >= DEADLINE_UTC_MINUTES, `OnCalendar ${m[1] ?? "?"}:${m[2] ?? "?"} UTC must be >= DEADLINE ${String(DEADLINE_UTC_MINUTES)} min`);
  }
  for (const m of timer.matchAll(/^OnCalendar=.*$/gm)) {
    const line = m[0] ?? "";
    assert.match(line, /\sUTC\s*$/, `every OnCalendar must be explicit UTC: ${line}`);
  }
});

// ── C-9: the FULL chain is recomputed — a tampered MIDDLE line is caught, not only the last ──────────────────
test("probe_recomputes_full_chain — a tampered MIDDLE line (not only the last) is caught as chain_broken (C-9)", () => {
  const raw = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  assert.equal(raw.length, 3, "three lines");

  // (a) intact fixture -> chain_ok + healthy after deadline.
  const okFile = join(scratchDir(), "chain-ok.jsonl");
  writeFileSync(okFile, raw.join("\n") + "\n");
  const rOk = runProbe(["--file", okFile, "--now", "2026-09-20T10:35Z"]);
  assert.equal(rOk.state.chain_ok, true, "intact chain");
  assert.equal(rOk.state.status, "healthy", "and healthy");

  // (b) tamper a HASHED field of the MIDDLE line (2026-09-18) in scratch: its recomputed line_hash diverges,
  //     while its stored line_hash and the next line's prev_line_hash are untouched — so ONLY a full recompute
  //     catches it (mutant: recompute the last line only -> this reds).
  const mid = JSON.parse(raw[1] ?? "{}") as TimelineLine;
  const tampered = { ...mid, mints: "1" + mid.mints };
  const badFile = join(scratchDir(), "chain-mid-tampered.jsonl");
  writeFileSync(badFile, [raw[0] ?? "", JSON.stringify(tampered), raw[2] ?? ""].join("\n") + "\n");
  const rBad = runProbe(["--file", badFile, "--now", "2026-09-20T10:35Z"]);
  assert.equal(rBad.state.chain_ok, false, "a middle-line tamper breaks the chain");
  assert.equal(rBad.state.reason, "chain_broken", "reason chain_broken (outranks lag)");
  assert.equal(rBad.status, 1, "chain_broken exits 1");
});

// ── C-5 (a): the chainstack pipe is BRANCHED — the REAL run.ts producer emits the line, the probe reads it ────
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
    const block = parseInt(params[1], 16);
    const s = supply.get(block); if (s === undefined) return fail(500); return ok(hex(s));
  }
  return fail(400);
};
`;
function stubUrl(): string {
  const p = join(scratchDir(), "stub-fetch.mjs");
  writeFileSync(p, STUB_SRC);
  return pathToFileURL(p).href;
}
function seedSentinelState(nLines: number): string {
  const dir = mkdtempSync(join(scratchDir(), "state-"));
  const raw = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  writeFileSync(join(dir, "timeline.jsonl"), raw.slice(0, nLines).join("\n") + "\n");
  return dir;
}
function runRealSentinel(stateDir: string, setChainstack: string | undefined): number {
  const l3 = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim())
    .map((l) => JSON.parse(l) as { to_block: number })[2];
  const env: NodeJS.ProcessEnv = {
    ...process.env, STUB_FIXTURE: FIXTURE,
    STUB_FIN_BLOCK: String((l3?.to_block ?? 0) + 5), STUB_FIN_TS: String(midnight("2026-09-20") + 3600),
  };
  delete env.CHAINSTACK_ETH_URL; // a real key in the orchestrator's shell must never enter the child (mirror sentinel-retry:112)
  if (setChainstack !== undefined) env.CHAINSTACK_ETH_URL = setChainstack;
  const r = spawnSync(process.execPath, ["--import", stubUrl(), RUN_TS, "--state", stateDir], { cwd: REPO, env, encoding: "utf8", timeout: 60_000 });
  return r.status ?? -1;
}
test("probe_chainstack_present_from_real_producer_line — the REAL run.ts producer (keyless Chainstack origin) emits a 9-endpoint line; the probe flags chainstack_present=true, false without it (C-5 a; CA-11 durci)", () => {
  const chain = "https://ethereum-mainnet.core.chainstack.com"; // no path => no committed secret (no_secret_in_repo green)

  const dirWith = seedSentinelState(2);
  assert.equal(runRealSentinel(dirWith, chain), 0, "the real sentinel writes 2026-09-19");
  const producedWith = join(dirWith, "timeline.jsonl");
  const rWith = runProbe(["--file", producedWith, "--now", "2026-09-20T10:35Z"]);
  assert.equal(rWith.state.chainstack_present, true, "the probe flags chainstack_present from the REAL producer line");
  assert.equal(rWith.state.provider, "chainstack.com", "the matched provider is chainstack.com");
  assert.equal(rWith.state.chain_ok, true, "the produced chain still recomputes");
  assert.ok(!readFileSync(producedWith, "utf8").includes("chainstack.com/"), "the produced line carries no key-bearing path (C-1)");

  const dirWithout = seedSentinelState(2);
  assert.equal(runRealSentinel(dirWithout, undefined), 0, "the real sentinel writes 2026-09-19 (no chainstack)");
  const rWithout = runProbe(["--file", join(dirWithout, "timeline.jsonl"), "--now", "2026-09-20T10:35Z"]);
  assert.equal(rWithout.state.chainstack_present, false, "no chainstack env -> 8 endpoints -> false");
  assert.equal(rWithout.state.provider, null, "no chainstack provider recorded");
});

// ── C-6: http-on-loopback GET executes; never hangs (bounded timeout+retry); oversize body refused ──────────
test("probe_get_over_loopback_http_executes — an http:// GET on loopback executes and decides; a non-responding server yields unreachable within the timeout (never hangs); an oversize body is refused (C-6)", async () => {
  const body = readFileSync(FIXTURE, "utf8");
  const okServer = createServer((_req, res) => { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(body); });
  await new Promise<void>((resolve) => okServer.listen(0, "127.0.0.1", () => resolve()));
  try {
    const addr = okServer.address() as { port: number };
    const url = `http://127.0.0.1:${String(addr.port)}/narabi/timeline.jsonl`;
    const rOk = await runProbeAsync(["--url", url, "--now", "2026-09-20T10:35Z"]);
    assert.equal(rOk.state.reachable, true, "the loopback http GET executed");
    assert.equal(rOk.state.status, "healthy", "and the served surface is fresh");
    assert.equal(rOk.status, 0, "exit 0");
    // oversize: cap set low via env -> refused as too_large (mutant: cap removed -> parses -> healthy -> red).
    const rBig = await runProbeAsync(["--url", url, "--now", "2026-09-20T10:35Z"], { PROBE_MAX_BYTES: "64" });
    assert.equal(rBig.state.reason, "too_large", "a body over PROBE_MAX_BYTES is refused, not buffered unbounded");
    assert.equal(rBig.status, 1, "too_large exits 1");
  } finally {
    await new Promise<void>((resolve) => okServer.close(() => resolve()));
  }

  const hangServer = createServer(() => { /* accept the socket, never write a response */ });
  await new Promise<void>((resolve) => hangServer.listen(0, "127.0.0.1", () => resolve()));
  try {
    const addr = hangServer.address() as { port: number };
    const url = `http://127.0.0.1:${String(addr.port)}/narabi/timeline.jsonl`;
    const rHang = await runProbeAsync(["--url", url, "--now", "2026-09-20T10:35Z"], { PROBE_TIMEOUT_MS: "300", PROBE_RETRIES: "1" });
    assert.equal(rHang.state.reachable, false, "a non-responding server is unreachable (mutant: timeout removed -> hang -> this test expires -> red)");
    assert.equal(rHang.state.reason, "unreachable", "reason unreachable, bounded");
    assert.equal(rHang.status, 1, "unreachable exits 1");
  } finally {
    hangServer.closeAllConnections();
    await new Promise<void>((resolve) => hangServer.close(() => resolve()));
  }
});

// ── C-6: http off loopback is REFUSED before any dial (pure guard first -> zero packets under the mutant) ────
test("probe_refuses_http_off_loopback — http:// off loopback is refused before any dial (insecure_url); https and http-on-loopback pass; the guard is pure so the mutant variant sends zero packets (C-6)", () => {
  assert.deepEqual(urlTransportAllowed("http://narabi-probe.invalid/narabi/timeline.jsonl"), { ok: false, reason: "insecure_url" }, "http off loopback is refused");
  assert.deepEqual(urlTransportAllowed("http://monarkgate.tech/narabi/timeline.jsonl"), { ok: false, reason: "insecure_url" }, "a real http host is refused");
  assert.deepEqual(urlTransportAllowed("http://127.0.0.1:8080/x"), { ok: true }, "http on 127.0.0.1 is allowed");
  assert.deepEqual(urlTransportAllowed("http://localhost:8080/x"), { ok: true }, "http on localhost is allowed");
  assert.deepEqual(urlTransportAllowed("https://monarkgate.tech/narabi/timeline.jsonl"), { ok: true }, "https anywhere is allowed");
  assert.equal(isLoopbackHost("127.0.0.53"), true, "127/8 is loopback");
  assert.equal(isLoopbackHost("monarkgate.tech"), false, "a real host is not loopback");

  // end-to-end: the host is .invalid (never resolves), so even a guard-removed mutant emits no packet to a real
  // service; the mutant records "unreachable" (DNS failure) instead of "insecure_url", reddening this.
  const r = runProbe(["--url", "http://narabi-probe.invalid/narabi/timeline.jsonl", "--now", "2026-09-20T10:35Z"]);
  assert.equal(r.state.reason, "insecure_url", "refused as insecure_url before any dial");
  assert.equal(r.state.reachable, false, "no dial happened");
  assert.equal(r.status, 1, "insecure_url exits 1");
});

// ── C-13: >= 3 post-deadline shots + Persistent; the service reads an optional env file and bounds its start ──
test("probe_timer_multiple_shots — the timer declares >= 3 post-deadline OnCalendar shots (Persistent kept); the service uses a dedicated user, an optional env file, and a bounded TimeoutStartSec (C-13; C-6)", () => {
  const timer = readFileSync(join(REPO, "deploy", "monark-probe.timer"), "utf8");
  const shots = [...timer.matchAll(/^OnCalendar=.*?(\d{2}):(\d{2}):\d{2}\s+UTC\s*$/gm)];
  assert.ok(shots.length >= 3, `>= 3 OnCalendar shots (got ${String(shots.length)})`);
  const first = shots[0];
  assert.ok(first && Number(first[1] ?? "0") * 60 + Number(first[2] ?? "0") >= DEADLINE_UTC_MINUTES, "the first shot is >= DEADLINE");
  assert.match(timer, /^Persistent=true$/m, "Persistent=true kept (boot catch-up)");
  assert.match(timer, /^Unit=monark-probe\.service$/m, "the timer drives monark-probe.service");

  const svc = readFileSync(join(REPO, "deploy", "monark-probe.service"), "utf8");
  assert.match(svc, /^EnvironmentFile=-\/etc\/monark\/probe\.env$/m, "optional EnvironmentFile (leading '-', -1b-i needs no secret)");
  assert.match(svc, /^User=probe$/m, "dedicated probe user");
  assert.match(svc, /^ReadWritePaths=\/var\/lib\/monark-probe$/m, "the state dir is the only writable path");
  assert.match(svc, /^ProtectSystem=strict$/m, "ProtectSystem=strict");
  const to = /^TimeoutStartSec=(\d+)$/m.exec(svc);
  assert.ok(to, "TimeoutStartSec is set (C-6 per-start backstop)");
  const worstCaseSec = Math.ceil((DEFAULT_TIMEOUT_MS * (DEFAULT_RETRIES + 1)) / 1000);
  assert.ok(Number(to[1] ?? "0") >= worstCaseSec, `TimeoutStartSec (${to[1] ?? "?"}) must be >= code worst-case ${String(worstCaseSec)}s`);
});
