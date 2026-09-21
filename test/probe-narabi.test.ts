// test/probe-narabi.test.ts — non-LLM oracle for the EXTERNAL Narabi probe (ADR-NARABI-OPS-1 -1b-i:
// DETECTION). Runs at the REPO ROOT under `node --test` (test/*.test.ts glob), NOT under apps/sentinel/test
// (that tree is exported package-style and would drag the built-ins-only .mjs import into the public CI). It
// imports the probe's pure functions (typed via scripts/probe-narabi.d.mts) and DRIVES the real .mjs as a
// SUBPROCESS (the only way to observe the real process exit code), plus the REAL sentinel producer run.ts for
// the Chainstack pipe (CA-11 durci). No network: a fetch stub / a node:http loopback server / `--file`.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync, readdirSync } from "node:fs";
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
  urlTransportAllowed, isLoopbackHost, fetchTimeline, DEADLINE_UTC, DEADLINE_UTC_MINUTES,
  DEFAULT_TIMEOUT_MS, DEFAULT_MAX_BYTES, DEFAULT_RETRIES, MAX_TIMEOUT_MS, MAX_MAX_BYTES, MAX_RETRIES,
  START_MARGIN_MS, transportBounds, SCHEMA, evaluate,
} from "../scripts/probe-narabi.mjs";
import type { NarabiState } from "../scripts/probe-narabi.mjs";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..");
const PROBE_MJS = join(REPO, "scripts", "probe-narabi.mjs");
const RUN_TS = join(REPO, "apps", "sentinel", "src", "run.ts");
const FIXTURE = join(REPO, "apps", "sentinel", "test", "fixtures", "narabi-timeline-2026-09-19.jsonl");

// The child probe runs under a NON-UTC zone fixed in its OWN env (overridable per case) so the local-hour (M4)
// and local-date (M10) mutants die even when the parent is a UTC CI. toISOString stays UTC, so every verdict is
// unchanged (TZ-invariant). POSIX Etc/GMT sign is inverted: Etc/GMT-11 = UTC+11 (east), Etc/GMT+11 = UTC-11
// (west); both roll the calendar day for the grid cases (C-G2-2).
const TZ_EAST = "Etc/GMT-11";
const TZ_WEST = "Etc/GMT+11";

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

interface ProbeRun { status: number; stdout: string; stderr: string; state: NarabiState }
/** Spawn the REAL probe .mjs and return its exit code + the narabi.json it wrote (which it ALWAYS writes). The
 *  child TZ is fixed NON-UTC (TZ_EAST unless overridden) so the local-time mutants die on a UTC CI (C-G2-2). */
function runProbe(args: readonly string[], env: Record<string, string> = {}): ProbeRun {
  const out = join(scratchDir(), `narabi-${String(uniq++)}.json`);
  const r = spawnSync(process.execPath, [PROBE_MJS, "--out", out, ...args], {
    cwd: REPO, env: { ...process.env, TZ: TZ_EAST, ...env }, encoding: "utf8", timeout: 60_000,
  });
  assert.ok(existsSync(out), `the probe must ALWAYS write narabi.json (stdout=${JSON.stringify(r.stdout)} stderr=${JSON.stringify(r.stderr)})`);
  const state = JSON.parse(readFileSync(out, "utf8")) as NarabiState;
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "", state };
}

/** ASYNC variant, needed only when the probe connects back to an http server IN THIS process: a synchronous
 *  spawnSync would freeze the parent event loop and deadlock (the server could not accept the child). */
async function runProbeAsync(args: readonly string[], env: Record<string, string> = {}): Promise<ProbeRun> {
  const out = join(scratchDir(), `narabi-${String(uniq++)}.json`);
  const child = spawn(process.execPath, [PROBE_MJS, "--out", out, ...args], { cwd: REPO, env: { ...process.env, TZ: TZ_EAST, ...env } });
  const status = await new Promise<number>((resolve) => { child.on("close", (code) => resolve(code ?? -1)); });
  assert.ok(existsSync(out), "the probe must ALWAYS write narabi.json");
  const state = JSON.parse(readFileSync(out, "utf8")) as NarabiState;
  return { status, stdout: "", stderr: "", state };
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
test("probe_narabi_detects_lag — the UTC deadline grid sets expected_last_day; lag_days>0 STRICT is unhealthy (exit 1); a reboot before 10:30 and lag_days<0 mornings stay healthy; DEADLINE pinned at 10:30; every case runs under an east AND a west non-UTC child TZ so the local-hour/local-date mutants die on a UTC CI (C-4; C-G2-2)", () => {
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
  // Run the whole matrix under an east (UTC+11) AND a west (UTC-11) child TZ. The unmutated probe is UTC-strict,
  // so the verdict is identical under both (asserted here); a local-hour/local-date mutant flips under at least
  // one zone, so it dies regardless of the parent (CI) TZ (C-G2-2).
  for (const TZ of [TZ_EAST, TZ_WEST]) {
    for (const c of cases) {
      const r = runProbe(["--file", FIXTURE, "--now", c.now], { TZ });
      assert.equal(r.state.status, c.status, `[TZ=${TZ}] ${c.now}: status (${c.note})`);
      assert.equal(r.state.reason, c.reason, `[TZ=${TZ}] ${c.now}: reason (${c.note})`);
      assert.equal(r.state.lag_days, c.lag, `[TZ=${TZ}] ${c.now}: lag_days (${c.note})`);
      assert.equal(r.status, c.exit, `[TZ=${TZ}] ${c.now}: exit code (${c.note})`);
      assert.equal(r.state.last_day, "2026-09-19", `[TZ=${TZ}] ${c.now}: last_day is the fixture's last`);
      assert.equal(r.state.chain_ok, true, `[TZ=${TZ}] ${c.now}: the fixture chain is intact`);
      assert.equal(r.state.schema, SCHEMA, `[TZ=${TZ}] ${c.now}: schema is versioned`);
    }
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

// ── C-V-2: three evaluate() guards on SYNTHETIC lines (no real record) — prev_line_hash LINK (N1), last-line chainstack (N2), chain_broken > lag (N5) ─
test("probe_evaluate_guards_on_synthetic_lines — evaluate() on synthetic lines pins a broken prev_line_hash LINK as chain_broken (N1), chainstack_present read on the LAST line only (N2), and chain_broken outranking a lagging --now (N5)", () => {
  const EP8 = Array.from({ length: 8 }, (_, i) => `https://e${String(i)}.drpc.org`); // 8 public, no chainstack
  const EP9 = [...EP8, "https://nd.p2pify.com"]; // + the paid Chainstack operator = 9
  const synth = (day: string, prev: string, endpoints: readonly string[]): TimelineLine => {
    const l = { day, mints: "0", regime: {}, prev_line_hash: prev, endpoints } as unknown as TimelineLine;
    return { ...l, line_hash: probeLineHashOf(l) }; };
  const L1 = synth("2026-09-17", "0".repeat(64), EP9); // a 9-endpoint line WITH chainstack, non-last on purpose
  const L2 = synth("2026-09-18", L1.line_hash, EP8);
  const L3 = synth("2026-09-19", L2.line_hash, EP8);
  const L2t = { ...L2, mints: "9999" }; // tamper a HASHED field, keep the stale line_hash
  const NOW = "2026-09-25T12:00:00Z"; // well past L3's day -> lag>0, so an N5 lag-first mutant would surface lag
  const ev = (ls: readonly TimelineLine[]): NarabiState =>
    evaluate({ text: ls.map((l) => JSON.stringify(l)).join("\n"), nowIso: NOW, reachable: true });
  const n1 = ev([L1, L3]); // skips L2 -> L3.prev_line_hash != the preceding line's hash; only the LINK check catches it
  assert.equal(n1.reason, "chain_broken", "N1: a broken prev_line_hash LINK is chain_broken (kills the link-check-removed mutant)");
  assert.equal(n1.chain_ok, false, "chain_ok is false under a broken link");
  const n2 = ev([L1, L2]); // an OLD 9-endpoint line (L1) must NOT mask a degraded last line (L2, 8 endpoints)
  assert.equal(n2.chainstack_present, false, "N2: chainstack_present is the LAST line's only (kills the read-any-line mutant)");
  assert.equal(n2.provider, null, "no chainstack provider recorded from the last line");
  const n5 = ev([L1, L2t, L3]); // tampered MIDDLE line + lagging --now
  assert.equal(n5.reason, "chain_broken", "N5: chain_broken outranks lag (kills the lag-precedence mutant)");
  assert.equal(n5.chain_ok, false, "chain_ok stays false — never a wrongful chain_ok:true under lag");
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
  let okHits = 0;
  const okServer = createServer((_req, res) => { okHits++; res.writeHead(200, { "content-type": "application/jsonl" }); res.end(body); });
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
    // C-V-1: a GOOD server with PROBE_RETRIES=0 still performs EXACTLY ONE GET and decides healthy. Kills N4
    // (attempt <= retries -> attempt < retries): at retries=0 that does ZERO GETs -> permanent unreachable.
    const beforeHits = okHits;
    const rNoRetry = await runProbeAsync(["--url", url, "--now", "2026-09-20T10:35Z"], { PROBE_RETRIES: "0" });
    assert.equal(rNoRetry.state.status, "healthy", "PROBE_RETRIES=0 still fetches once and is healthy (kills N4)");
    assert.equal(rNoRetry.status, 0, "exit 0 on the single successful GET");
    assert.equal(okHits - beforeHits, 1, "EXACTLY one GET reached the server (zero under the N4 mutant)");
  } finally {
    okServer.closeAllConnections(); // C-G2D-1: server-socket hygiene (destroy before close). Does NOT fix the libuv async.c flake (nodejs/node#56645)
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
test("probe_refuses_http_off_loopback — http:// is admitted ONLY on a strict loopback literal; a DNS name merely starting with 127., the numeric shorthands (127.1 / 0x7f.0.0.1 / 2130706433 / 0177.0.0.1) the WHATWG parser normalizes to 127.0.0.1, userinfo, and 0.0.0.0 are all refused before any dial (insecure_url); the guard is pure so zero packets leave (C-6; C-G2-1)", () => {
  // Admitted: https anywhere; http on a canonical loopback literal only.
  for (const u of ["https://monarkgate.tech/narabi/timeline.jsonl", "http://127.0.0.1:8080/x", "http://127.0.0.53/x", "http://localhost:8080/x", "http://[::1]/x"]) {
    assert.deepEqual(urlTransportAllowed(u), { ok: true }, `admitted: ${u}`);
  }
  // Refused BEFORE any dial — a PURE string decision (urlTransportAllowed never resolves or dials), so a real
  // domain here leaks nothing. Covers the G2 bypass 127.<x>.evil.com and the numeric forms u.hostname alone
  // would wave through (they normalize to 127.0.0.1); rawUrlHost catches those.
  for (const u of [
    "http://127.0.0.1.evil.com/x", "http://127.evil.com/x", "http://localhost.evil.com/x",
    "http://127.0.0.1@evil.com/x", "http://user:pass@127.0.0.1/x", "http://0.0.0.0/x", "http://127.1/x",
    "http://0x7f.0.0.1/x", "http://2130706433/x", "http://127.00.0.1/x", "http://0177.0.0.1/x",
    "http://monarkgate.tech/narabi/timeline.jsonl",
  ]) {
    assert.deepEqual(urlTransportAllowed(u), { ok: false, reason: "insecure_url" }, `refused: ${u}`);
  }
  // isLoopbackHost is strict: a canonical dotted-quad in 127/8 IS loopback; a DNS name starting with "127." is
  // NOT (the G2 regex-broadening bug). 127.0.0.53 stays true, so the guard is not over-tightened to 127.0.0.1.
  assert.equal(isLoopbackHost("127.0.0.53"), true, "a canonical dotted-quad in 127/8 is loopback (NOT a DNS name)");
  assert.equal(isLoopbackHost("127.evil.com"), false, "a DNS name starting with 127. is NOT loopback (C-G2-1)");
  assert.equal(isLoopbackHost("127.0.0.1.evil.com"), false, "127.0.0.1.evil.com is NOT loopback (C-G2-1)");
  assert.equal(isLoopbackHost("monarkgate.tech"), false, "a real host is not loopback");
  // C-G2D-1: pin the per-octet byte bound of the exported helper (a -1b-ii caller could hit it directly). 256 in
  // ANY octet is refused (kills N-G2-d, the >255 control removed); a negative octet and a trailing dot are not
  // canonical quads either; the top of 127/8 and the canonical literal ARE loopback (not over-tightened).
  assert.equal(isLoopbackHost("127.0.0.256"), false, "an octet > 255 is not a valid dotted-quad (pins the >255 byte bound; kills N-G2-d)");
  assert.equal(isLoopbackHost("127.256.0.1"), false, "a > 255 octet is refused on ANY position, not only the last");
  assert.equal(isLoopbackHost("127.0.0.-1"), false, "a negative octet is not a canonical dotted-quad");
  assert.equal(isLoopbackHost("127.0.0.1."), false, "a trailing dot is not a canonical dotted-quad");
  assert.equal(isLoopbackHost("127.255.255.255"), true, "the top of 127/8 (255.255.255 tail) IS loopback");
  assert.equal(isLoopbackHost("127.0.0.1"), true, "the canonical loopback literal IS loopback");

  // end-to-end, OFFLINE: both hosts are .invalid (never resolve), so even a guard-removed mutant emits no packet
  // to a real service — the mutant records "unreachable" (DNS failure) instead of "insecure_url", reddening this.
  for (const host of ["narabi-probe.invalid", "127.0.0.1.narabi-probe.invalid"]) {
    const r = runProbe(["--url", `http://${host}/narabi/timeline.jsonl`, "--now", "2026-09-20T10:35Z"]);
    assert.equal(r.state.reason, "insecure_url", `refused as insecure_url before any dial: ${host}`);
    assert.equal(r.state.reachable, false, `no dial happened: ${host}`);
    assert.equal(r.status, 1, `insecure_url exits 1: ${host}`);
  }
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
  // C-G2-7: the env-tunable bounds are HARD-CAPPED, and TimeoutStartSec STRICTLY exceeds the CAPPED worst case
  // (timeout x (retries+1) + start margin), so a mis-set /etc/monark/probe.env can never get the job killed
  // mid-write. The caps are real — a huge env value is clamped to MAX (read against the same unit the timer drives).
  const worstCappedSec = Math.ceil((MAX_TIMEOUT_MS * (MAX_RETRIES + 1) + START_MARGIN_MS) / 1000);
  assert.ok(Number(to[1] ?? "0") > worstCappedSec, `TimeoutStartSec (${to[1] ?? "?"}) must strictly exceed the CAPPED env worst-case ${String(worstCappedSec)}s`);
  assert.equal(transportBounds({ PROBE_TIMEOUT_MS: "99999999" }).timeoutMs, MAX_TIMEOUT_MS, "PROBE_TIMEOUT_MS is hard-capped");
  assert.equal(transportBounds({ PROBE_RETRIES: "99999" }).retries, MAX_RETRIES, "PROBE_RETRIES is hard-capped");
  // C-V-3: the unit's MemoryMax must cover the worst-case RSS when a body fills the byte cap. Measured peak RSS at
  // a cap-sized body is ~100 MiB on the GET path (~13x the 8 MiB cap), so MemoryMax (128 MiB) must be >= 13 x
  // MAX_MAX_BYTES (k derived AT this cap; RSS = base + slope x cap, so k over-bounds at larger caps — re-derive if moved).
  const mem = /^MemoryMax=(\d+)M$/m.exec(svc);
  assert.ok(mem, "the unit pins MemoryMax in MiB");
  assert.ok(Number(mem[1]) * 1024 * 1024 >= 13 * MAX_MAX_BYTES, `MemoryMax (${mem[1] ?? "?"}M) must be >= 13x the byte cap MAX_MAX_BYTES (kills the cap-raised-to-64MiB mutant)`);
});

// ── C-G2-3: an invalid --now still writes narabi.json (probe_error, real timestamp, exit 1), never a FATAL ─────
test("probe_invalid_now_still_writes_narabi_json — an unparseable --now yields a probe_error state written to narabi.json with a real checked_at and exit 1, never a FATAL that leaves the file unwritten (C-G2-3)", () => {
  const r = runProbe(["--file", FIXTURE, "--now", "not-a-date"]); // runProbe asserts narabi.json ALWAYS exists
  assert.equal(r.state.reason, "probe_error", "an invalid --now is probe_error, not a crash");
  assert.equal(r.state.status, "unhealthy", "unhealthy");
  assert.equal(r.status, 1, "exit 1 per contract");
  assert.ok(!Number.isNaN(Date.parse(r.state.checked_at)), "checked_at is a real timestamp (fell back to the clock)");
  assert.doesNotMatch(r.stderr, /FATAL/, "no FATAL on stderr (the write path completed)");
});

// ── C-G2-4: an HTTP redirect is treated as unreachable, never followed off the guarded URL ───────────────────
test("probe_does_not_follow_redirects — a loopback server that answers 302 to another host is treated as unreachable; the redirect target is NEVER dialed (redirect: manual) (C-G2-4)", async () => {
  let targetHit = false;
  const target = createServer((_req, res) => { targetHit = true; res.writeHead(200, { "content-type": "application/jsonl" }); res.end(readFileSync(FIXTURE, "utf8")); });
  await new Promise<void>((resolve) => target.listen(0, "127.0.0.1", () => resolve()));
  const targetPort = (target.address() as { port: number }).port;
  const redirector = createServer((_req, res) => { res.writeHead(302, { location: `http://127.0.0.1:${String(targetPort)}/narabi/timeline.jsonl` }); res.end(); });
  await new Promise<void>((resolve) => redirector.listen(0, "127.0.0.1", () => resolve()));
  try {
    const redirPort = (redirector.address() as { port: number }).port;
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(redirPort)}/narabi/timeline.jsonl`, "--now", "2026-09-20T10:35Z"], { PROBE_RETRIES: "0" });
    assert.equal(r.state.reachable, false, "a redirect is unreachable, not followed (mutant: redirect:manual removed -> followed -> red)");
    assert.equal(r.state.reason, "unreachable", "reason unreachable");
    assert.equal(r.status, 1, "exit 1");
    assert.equal(targetHit, false, "the redirect target was NEVER dialed");
  } finally {
    redirector.closeAllConnections(); target.closeAllConnections();
    await new Promise<void>((resolve) => redirector.close(() => resolve()));
    await new Promise<void>((resolve) => target.close(() => resolve()));
  }
});

// ── C-G2-5: DEADLINE is a single source (minutes derived from the string); publish_latency has an oracle ──────
test("probe_deadline_single_source_and_publish_latency_oracle — DEADLINE_UTC_MINUTES is derived from the single DEADLINE_UTC string, and publish_latency is pinned on known --now instants (0 at the deadline, +300 after, -3600 before) (C-G2-5)", () => {
  const parts = DEADLINE_UTC.split(":");
  assert.equal(DEADLINE_UTC_MINUTES, Number(parts[0]) * 60 + Number(parts[1]), "the minutes constant is DERIVED from the DEADLINE_UTC string (a desync mutant reds here)");
  assert.equal(runProbe(["--file", FIXTURE, "--now", "2026-09-20T10:30:00Z"]).state.publish_latency, 0, "publish_latency is 0 exactly at the deadline");
  assert.equal(runProbe(["--file", FIXTURE, "--now", "2026-09-20T10:35:00Z"]).state.publish_latency, 300, "+300s five minutes after the deadline");
  assert.equal(runProbe(["--file", FIXTURE, "--now", "2026-09-20T09:30:00Z"]).state.publish_latency, -3600, "-3600s one hour before the deadline");
});

// ── C-G2-6: narabi.json is written atomically (temp + rename), including over an existing file ────────────────
test("probe_writes_narabi_json_atomically — the probe writes a temp file then renames it over the target, leaving exactly narabi.json (no .tmp residue) even on a repeated run over an existing file (C-G2-6)", () => {
  const dir = mkdtempSync(join(scratchDir(), "atomic-"));
  const out = join(dir, "narabi.json");
  const run = (): void => {
    const r = spawnSync(process.execPath, [PROBE_MJS, "--out", out, "--file", FIXTURE, "--now", "2026-09-20T10:35Z"], { cwd: REPO, env: { ...process.env, TZ: TZ_EAST }, encoding: "utf8", timeout: 60_000 });
    assert.equal(r.status, 0, "healthy exit");
    assert.deepEqual(readdirSync(dir), ["narabi.json"], "only the final file remains — no .tmp residue (atomic rename)");
    const st = JSON.parse(readFileSync(out, "utf8")) as NarabiState; // complete, parseable JSON
    assert.equal(st.status, "healthy", "the written state is complete and valid");
  };
  run();
  run(); // rewrite over the existing narabi.json (production does this every shot — Windows rename-over-existing)
});

// ── C-G2-8: --file is size-bounded like the GET (an oversize file is refused too_large) ──────────────────────
test("probe_file_input_is_size_bounded — a --file larger than the byte cap is refused too_large (the same bound the GET uses), never read whole (C-G2-8)", () => {
  const r = runProbe(["--file", FIXTURE, "--now", "2026-09-20T10:35Z"], { PROBE_MAX_BYTES: "64" });
  assert.equal(r.state.reason, "too_large", "a --file over PROBE_MAX_BYTES is refused (mutant: size check removed -> parsed -> red)");
  assert.equal(r.state.reachable, false, "not read");
  assert.equal(r.status, 1, "too_large exits 1");
});

// ── C-G2D-2: an I/O fault on temp write/rename cleans the orphan .tmp and best-effort writes a probe_error
// narabi.json (the "ALWAYS written" invariant survives a disk fault), never an uncaught FATAL; temp name = pid +
// crypto random. rename is failed by INJECTION: --import patches fs.renameSync (verified to reach the .mjs import).
const RENAME_FAIL_SRC = `
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const fs = require("node:fs");
fs.renameSync = (from) => { process.stderr.write("TMP=" + String(from) + "\\n"); throw Object.assign(new Error("injected rename EIO"), { code: "EIO" }); };
`;
test("probe_io_fault_cleans_tmp_and_falls_back — a rename I/O fault (injected) leaves NO orphan .tmp, still writes a probe_error narabi.json via a direct fallback, exits 1, never prints a FATAL; the temp name carries pid + 8 random bytes (C-G2D-2)", () => {
  const dir = mkdtempSync(join(scratchDir(), "iofault-"));
  const out = join(dir, "narabi.json");
  const inject = join(scratchDir(), "inject-rename-fail.mjs");
  writeFileSync(inject, RENAME_FAIL_SRC);
  const r = spawnSync(process.execPath, ["--import", pathToFileURL(inject).href, PROBE_MJS, "--out", out, "--file", FIXTURE, "--now", "2026-09-20T10:35Z"], {
    cwd: REPO, env: { ...process.env, TZ: TZ_EAST }, encoding: "utf8", timeout: 60_000,
  });
  assert.ok(existsSync(out), "narabi.json is STILL written (fallback direct write) despite the rename fault");
  const state = JSON.parse(readFileSync(out, "utf8")) as NarabiState;
  assert.equal(state.reason, "probe_error", "the fallback records probe_error");
  assert.equal(state.status, "unhealthy", "unhealthy");
  assert.equal(r.status, 1, "exit 1 per contract");
  assert.deepEqual(readdirSync(dir), ["narabi.json"], "the orphan .tmp was cleaned up — only narabi.json remains (kills the cleanup mutant)");
  assert.doesNotMatch(r.stderr ?? "", /FATAL/, "no uncaught FATAL — the I/O error was caught (kills the fallback mutant)");
  assert.match(r.stderr ?? "", /TMP=.*narabi\.json\.tmp-\d+-[0-9a-f]{16}\r?\n/, "the temp name carries pid + 8 crypto-random bytes (non-collidable between simultaneous shots)");
});

// ── C-G2D-3: env transport bounds — blank/'0'/whitespace/negative/NaN/non-numeric fall back to the DEFAULT (never
// a silent 0), then clamp; PROBE_RETRIES keeps an explicit 0 (a legitimate no-retry choice), only a blank defaults ─
test("probe_env_bounds_fall_back_to_default_not_zero — a blank/'0'/whitespace/negative/NaN/non-numeric PROBE_TIMEOUT_MS/PROBE_MAX_BYTES yields the DEFAULT not 0 (else always-unhealthy); PROBE_RETRIES keeps an explicit 0 but a blank/malformed one defaults; the high clamp still holds (C-G2D-3)", () => {
  for (const bad of ["", "  ", "0", "-5", "abc", "NaN"]) {
    assert.equal(transportBounds({ PROBE_TIMEOUT_MS: bad }).timeoutMs, DEFAULT_TIMEOUT_MS, `PROBE_TIMEOUT_MS=${JSON.stringify(bad)} -> default, never 0`);
    assert.equal(transportBounds({ PROBE_MAX_BYTES: bad }).maxBytes, DEFAULT_MAX_BYTES, `PROBE_MAX_BYTES=${JSON.stringify(bad)} -> default, never 0`);
  }
  // retries: an explicit 0 is a legitimate "no retry" choice (kept); only blank/malformed/negative defaults.
  assert.equal(transportBounds({ PROBE_RETRIES: "0" }).retries, 0, "PROBE_RETRIES=0 is KEPT (no-retry is legitimate, not the always-unhealthy pathology)");
  for (const bad of ["", "  ", "-1", "abc"]) {
    assert.equal(transportBounds({ PROBE_RETRIES: bad }).retries, DEFAULT_RETRIES, `PROBE_RETRIES=${JSON.stringify(bad)} -> default (kills the empty-check mutant)`);
  }
  // a valid value passes through, and the hard MAX clamp still applies on top of the default fallback (C-G2-7).
  assert.equal(transportBounds({ PROBE_TIMEOUT_MS: "1500" }).timeoutMs, 1500, "a valid timeout passes through");
  assert.equal(transportBounds({ PROBE_MAX_BYTES: "999999999" }).maxBytes, MAX_MAX_BYTES, "an over-max maxBytes clamps to MAX");
  assert.equal(transportBounds({ PROBE_RETRIES: "99999" }).retries, MAX_RETRIES, "an over-max retries clamps to MAX");
});

// ── C-G2D-4: fetchTimeline applies urlTransportAllowed ITSELF (a -1b-ii caller reaching it directly cannot bypass
// the loopback guard); an off-loopback http call is refused insecure_url before any dial (.invalid = zero packets) ─
test("probe_fetch_timeline_self_guards_transport — fetchTimeline refuses an off-loopback http URL ITSELF (insecure_url) with no dial, so a future direct caller cannot bypass the guard (C-G2D-4)", async () => {
  const res = await fetchTimeline("http://127.0.0.1.evil.invalid/narabi/timeline.jsonl", { retries: 0 });
  assert.deepEqual(res, { ok: false, reason: "insecure_url" }, "off-loopback http is refused by fetchTimeline itself, before any dial (mutant: self-guard removed -> .invalid DNS attempt -> unreachable -> red)");
});
