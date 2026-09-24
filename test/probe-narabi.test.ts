// test/probe-narabi.test.ts — non-LLM oracle for the EXTERNAL Narabi probe + ALERT (ADR-NARABI-OPS-1
// -1b-ii-a). Runs at the REPO ROOT under `node --test` (test/*.test.ts glob), NOT under apps/sentinel/test
// (that tree is exported package-style and would drag the built-ins-only .mjs import into the public CI). It
// imports the probe's pure functions (typed via scripts/probe-narabi.d.mts) and DRIVES the real .mjs as a
// SUBPROCESS (the only way to observe the real process exit code), plus the REAL sentinel producer run.ts for
// the Chainstack pipe (CA-11 durci). No real network: a fetch stub / node:http + node:net loopback fakes / `--file`.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync, existsSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import net from "node:net";
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
  encodeData, composeMail, smtpTransportPlan, sanitizeField, readPriorState, isEmailish, MAX_SMTP_DEADLINE_MS,
  sendSmtp, smtpDeadlineMs, DEFAULT_SMTP_DEADLINE_MS, STATE_TIMEOUT_MS, STATE_RETRIES, parseTimeline,
} from "../scripts/probe-narabi.mjs";
import type { NarabiState } from "../scripts/probe-narabi.mjs";
import { NARABI_SNAPSHOT } from "../apps/site/lib/narabi-snapshot.ts";

const SELF = fileURLToPath(import.meta.url);
// C-B-6: NO test may send a REAL mail. Every child spawned here gets an env with all SMTP_*/ALERT_* PURGED
// (a SMTP_PASS in the orchestrator's User-scope env, allowed by C-11, must never reach a child). This is the
// ONLY place that spreads the parent env — g2_no_test_can_send_real_mail pins that (exactly one such spread below).
const childEnv = (extra: Record<string, string> = {}): Record<string, string> => {
  const e: Record<string, string> = { ...process.env } as Record<string, string>;
  for (const k of Object.keys(e)) if (/^(SMTP_|ALERT_)/.test(k)) delete e[k];
  return { ...e, TZ: TZ_EAST, ...extra };
};

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
    cwd: REPO, env: childEnv(env), encoding: "utf8", timeout: 60_000,
  });
  assert.ok(existsSync(out), `the probe must ALWAYS write narabi.json (stdout=${JSON.stringify(r.stdout)} stderr=${JSON.stringify(r.stderr)})`);
  const state = JSON.parse(readFileSync(out, "utf8")) as NarabiState;
  return { status: r.status ?? -1, stdout: r.stdout ?? "", stderr: r.stderr ?? "", state };
}

/** ASYNC variant, needed only when the probe connects back to an http server IN THIS process: a synchronous
 *  spawnSync would freeze the parent event loop and deadlock (the server could not accept the child). */
async function runProbeAsync(args: readonly string[], env: Record<string, string> = {}): Promise<ProbeRun> {
  const out = join(scratchDir(), `narabi-${String(uniq++)}.json`);
  const child = spawn(process.execPath, [PROBE_MJS, "--out", out, ...args], { cwd: REPO, env: childEnv(env) });
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
      // Q10 / C-B-6: with SMTP_*/ALERT_* purged, an unhealthy verdict tries to alert and records smtp_unconfigured
      // (no send, no deepEqual on the whole state); a healthy verdict leaves alert_error null. schema is now 2.
      assert.equal(r.state.alert_error, c.status === "unhealthy" ? "smtp_unconfigured" : null, `[TZ=${TZ}] ${c.now}: alert_error (Q10)`);
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
  const ok = (result) => Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({ jsonrpc: "2.0", id: 1, result }), text: () => Promise.resolve(JSON.stringify({ jsonrpc: "2.0", id: 1, result })) });
  const fail = (status) => Promise.resolve({ ok: false, status, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("{}") });
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
  const env = childEnv({
    STUB_FIXTURE: FIXTURE,
    STUB_FIN_BLOCK: String((l3?.to_block ?? 0) + 5), STUB_FIN_TS: String(midnight("2026-09-20") + 3600),
  });
  // NARABI-OPS-1d: the URL ALONE no longer opens the leg — the guarded leg needs the non-secret cycle config
  // (CHAINSTACK_CYCLE_ID/ORIGIN) + a pre-existing ledger parent (C-8). A real key/config in the orchestrator's
  // shell must never enter the child. `chain` is already an ORIGIN (scheme+host, no path) => providerOf chainstack.com.
  for (const k of ["CHAINSTACK_ETH_URL", "CHAINSTACK_CYCLE_ID", "CHAINSTACK_ETH_ORIGIN", "CHAINSTACK_CYCLE_FLOOR"]) delete env[k];
  if (setChainstack !== undefined) {
    env.CHAINSTACK_ETH_URL = setChainstack;
    env.CHAINSTACK_ETH_ORIGIN = setChainstack;
    env.CHAINSTACK_CYCLE_ID = "chainstack-probe-test";
    mkdirSync(join(stateDir, "ledger"), { recursive: true }); // C-8: the ledger parent must pre-exist (RUNBOOK install -d)
  }
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
  // -1b-ii-b: the probe now does a 2nd GET of the DERIVED /narabi/state.json (digest cross-check). Serve a
  // matching state.json (digest === the last line's digest_T) so that GET succeeds and the verdict stays
  // healthy; it is NOT counted in okHits, so `okHits - beforeHits === 1` still pins the N4 killer (retries=0 ->
  // exactly one TIMELINE GET). If deriveStateUrl is mutated, GET2 falls into the else branch and okHits reddens too.
  const okLastDigestT = (JSON.parse(body.replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim()).at(-1) ?? "{}") as { digest_T: string }).digest_T;
  const okServer = createServer((req, res) => {
    if (req.url === "/narabi/state.json") { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ digest: okLastDigestT })); return; }
    okHits++; res.writeHead(200, { "content-type": "application/jsonl" }); res.end(body);
  });
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
test("probe_timer_multiple_shots — the timer declares >= 3 post-deadline OnCalendar shots (Persistent kept); the service uses a dedicated user, a REQUIRED env file (no leading '-', -1b-ii-a), and a bounded TimeoutStartSec (C-13; C-6; C-8)", () => {
  const timer = readFileSync(join(REPO, "deploy", "monark-probe.timer"), "utf8");
  const shots = [...timer.matchAll(/^OnCalendar=.*?(\d{2}):(\d{2}):\d{2}\s+UTC\s*$/gm)];
  assert.ok(shots.length >= 3, `>= 3 OnCalendar shots (got ${String(shots.length)})`);
  const first = shots[0];
  assert.ok(first && Number(first[1] ?? "0") * 60 + Number(first[2] ?? "0") >= DEADLINE_UTC_MINUTES, "the first shot is >= DEADLINE");
  assert.match(timer, /^Persistent=true$/m, "Persistent=true kept (boot catch-up)");
  assert.match(timer, /^Unit=monark-probe\.service$/m, "the timer drives monark-probe.service");

  const svc = readFileSync(join(REPO, "deploy", "monark-probe.service"), "utf8");
  // -1b-ii-a (C-8): the leading '-' is REMOVED — the ALERT probe MUST have its SMTP config, so a missing env file
  // fails the start LOUDLY (kills the mutant that keeps the '-' and lets the probe run mute without a secret).
  assert.match(svc, /^EnvironmentFile=\/etc\/monark\/probe\.env$/m, "REQUIRED EnvironmentFile (NO leading '-', -1b-ii-a needs the SMTP secret)");
  assert.doesNotMatch(svc, /^EnvironmentFile=-/m, "the '-' (optional) prefix is gone in -1b-ii-a");
  assert.match(svc, /^User=probe$/m, "dedicated probe user");
  assert.match(svc, /^ReadWritePaths=\/var\/lib\/monark-probe$/m, "the state dir is the only writable path");
  assert.match(svc, /^ProtectSystem=strict$/m, "ProtectSystem=strict");
  const to = /^TimeoutStartSec=(\d+)$/m.exec(svc);
  assert.ok(to, "TimeoutStartSec is set (C-6 per-start backstop)");
  const worstCaseSec = Math.ceil((DEFAULT_TIMEOUT_MS * (DEFAULT_RETRIES + 1)) / 1000);
  assert.ok(Number(to[1] ?? "0") >= worstCaseSec, `TimeoutStartSec (${to[1] ?? "?"}) must be >= code worst-case ${String(worstCaseSec)}s`);
  // C-G2-7 + C-B-2 + C-G2-1 + C-G2-3 (merge -a x -b): the env-tunable bounds are HARD-CAPPED, and TimeoutStartSec
  // STRICTLY exceeds the CAPPED COMBINED worst case = GET1 (timeout x (retries+1)) + GET2 (STATE_TIMEOUT_MS x
  // (STATE_RETRIES+1), the -1b-ii-b state.json cross-check) + the SINGLE wall-clock SMTP deadline (MAX_SMTP_DEADLINE_MS
  // — ONE timer for connect+handshake+conversation, x1, NOT two per-phase deadlines) + start margin: 50 + 10 + 30 + 10
  // = 100 s < 120, so a mis-set probe.env never kills the probe mid-write (item d of the -a x -b merge, C-G2-3).
  const worstCappedSec = Math.ceil((MAX_TIMEOUT_MS * (MAX_RETRIES + 1) + STATE_TIMEOUT_MS * (STATE_RETRIES + 1) + MAX_SMTP_DEADLINE_MS + START_MARGIN_MS) / 1000);
  assert.ok(Number(to[1] ?? "0") > worstCappedSec, `TimeoutStartSec (${to[1] ?? "?"}) must strictly exceed the CAPPED GET + single-deadline SMTP worst-case ${String(worstCappedSec)}s`);
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
    const r = spawnSync(process.execPath, [PROBE_MJS, "--out", out, "--file", FIXTURE, "--now", "2026-09-20T10:35Z"], { cwd: REPO, env: childEnv(), encoding: "utf8", timeout: 60_000 });
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
    cwd: REPO, env: childEnv(), encoding: "utf8", timeout: 60_000,
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

// ════════════════════════════════════════════════════════════════════════════════════════════════════════
// -1b-ii-a — ALERT: SMTP client, anti-storm state machine, secret hygiene, injection, TLS. ALL offline: a fake
// SMTP server is a node:net LOOPBACK plaintext server (SMTP_TLS=none is admitted on loopback only), so no real
// mail can ever leave and no cert is ever needed (C-B-6/C-B-8). Every child runs under childEnv() (secrets purged).
// ════════════════════════════════════════════════════════════════════════════════════════════════════════
interface FakeCap { commands: string[]; auth: string[]; mailFrom: string | null; rcptTo: string[]; data: string; connections: number; delivered: number }
interface FakeOpts {
  announce?: string[]; authCode?: number; authFailFirst?: number; echoAuthOn535?: boolean; closeAfterAuth?: boolean;
  drip?: boolean; silentAfterData?: boolean; neverGreet?: boolean; flood?: boolean; fragmentAuthFinalLine?: boolean;
}
interface FakeSmtp { port: number; cap: FakeCap; close: () => Promise<void> }

async function startFakeSmtp(opts: FakeOpts = {}): Promise<FakeSmtp> {
  const cap: FakeCap = { commands: [], auth: [], mailFrom: null, rcptTo: [], data: "", connections: 0, delivered: 0 };
  const announce = opts.announce ?? ["PLAIN", "LOGIN"];
  const server = net.createServer((sock) => {
    cap.connections++;
    // C-G2-2: the probe sends a TCP RST when it destroys the socket on a timeout / byte-bound / recovery path, so
    // the fake side's socket emits an 'error' (ECONNRESET); with NO listener node throws it uncaught and flakes the
    // test process (measured 3/8 isolated, 1/6 in file by the reviewer). Swallow it — the assertions read `cap`.
    sock.on("error", () => { /* peer RST after we're done capturing — intentionally ignored (C-G2-2) */ });
    const w = (s: string): void => { try { sock.write(s); } catch { /* client gone */ } };
    if (opts.drip) { const t = setInterval(() => { w("250-drip\r\n"); }, 20); sock.on("close", () => { clearInterval(t); }); return; }
    if (opts.flood) { w("250-x\r\n".repeat(10000)); return; } // C-G2-4: > 64 KiB, no final "NNN " line, then silent -> the total-byte bound must cut it off
    if (opts.neverGreet) return; // accept the socket, send nothing -> the probe's greeting read hits the global deadline
    w("220 fake ESMTP\r\n");
    let buf = "", dataBuf = "", inData = false, awaitUser = false, awaitPass = false;
    const finishAuth = (): void => {
      const code = (opts.authFailFirst !== undefined && cap.connections <= opts.authFailFirst) ? 535 : (opts.authCode ?? 235);
      if (code === 235) { w("235 ok\r\n"); return; }
      w(`535 auth failed${opts.echoAuthOn535 === true ? " " + cap.auth.join(" ") : ""}\r\n`);
      if (opts.closeAfterAuth === true) { try { sock.destroy(); } catch { /* closing */ } }
    };
    sock.on("data", (chunk: Buffer) => {
      if (inData) {
        dataBuf += chunk.toString();
        const end = dataBuf.indexOf("\r\n.\r\n");
        if (end >= 0) { cap.data = dataBuf.slice(0, end); inData = false; if (opts.silentAfterData !== true) { cap.delivered++; w("250 queued\r\n"); } }
        return;
      }
      buf += chunk.toString();
      let nl = buf.indexOf("\r\n");
      while (nl >= 0) {
        const line = buf.slice(0, nl); buf = buf.slice(nl + 2); cap.commands.push(line);
        const up = line.toUpperCase();
        if (awaitUser) { cap.auth.push(line); awaitUser = false; awaitPass = true; w("334 UGFzc3dvcmQ6\r\n"); }
        else if (awaitPass) { cap.auth.push(line); awaitPass = false; finishAuth(); }
        else if (up.startsWith("EHLO")) {
          // C-G2-6: AUTH on the FINAL "250 " line, split mid-token across two TCP segments (60 ms apart). A reader
          // that resolves a reply on the trailing INCOMPLETE line reads "250 AUT" -> no AUTH mech -> smtp_auth_failed.
          if (opts.fragmentAuthFinalLine) { w("250-fake\r\n250 AUT"); setTimeout(() => { w("H PLAIN\r\n"); }, 60); }
          else w(`250-fake\r\n250-AUTH ${announce.join(" ")}\r\n250 PIPELINING\r\n`); // AUTH on a CONTINUATION line -> a mono-line parser misses it (M-ii-11)
        }
        else if (up.startsWith("AUTH PLAIN")) { cap.auth.push(line.slice("AUTH PLAIN".length).trim()); finishAuth(); }
        else if (up.startsWith("AUTH LOGIN")) { awaitUser = true; w("334 VXNlcm5hbWU6\r\n"); }
        else if (up.startsWith("MAIL FROM")) { cap.mailFrom = line; w("250 ok\r\n"); }
        else if (up.startsWith("RCPT TO")) { cap.rcptTo.push(line); w("250 ok\r\n"); }
        else if (up === "DATA") { inData = true; w("354 go\r\n"); }
        else if (up === "QUIT") { w("221 bye\r\n"); try { sock.end(); } catch { /* closing */ } }
        else { w("250 ok\r\n"); }
        nl = buf.indexOf("\r\n");
      }
    });
  });
  await new Promise<void>((r) => { server.listen(0, "127.0.0.1", () => { r(); }); });
  const port = (server.address() as { port: number }).port;
  return { port, cap, close: () => new Promise<void>((r) => { server.close(() => { r(); }); }) };
}

const SMTP_PASS_VALUE = "s3cr3t-PONY-cell-42";
/** SMTP env pointing the probe at a loopback fake (plaintext, admitted on loopback only). */
const smtpEnv = (port: number, extra: Record<string, string> = {}): Record<string, string> => ({
  SMTP_HOST: "127.0.0.1", SMTP_PORT: String(port), SMTP_TLS: "none",
  SMTP_USER: "narabialerts@monarkgate.tech", SMTP_PASS: SMTP_PASS_VALUE,
  ALERT_FROM: "narabialerts@monarkgate.tech", ALERT_TO: "narabialerts@monarkgate.tech", ...extra,
});
/** Spawn the real probe at a FIXED out (state persists across shots) and capture stdout/stderr. killMs>0 SIGKILLs a
 *  hung child (bounds the M-ii-16 mutant, which under a drip server would never terminate on its own). */
async function runProbeAt(out: string, args: readonly string[], env: Record<string, string> = {}, killMs = 0): Promise<ProbeRun & { killed: boolean }> {
  const child = spawn(process.execPath, [PROBE_MJS, "--out", out, ...args], { cwd: REPO, env: childEnv(env) });
  let stdout = "", stderr = "", killed = false;
  child.stdout?.on("data", (d: Buffer) => { stdout += d.toString(); });
  child.stderr?.on("data", (d: Buffer) => { stderr += d.toString(); });
  const killer = killMs > 0 ? setTimeout(() => { killed = true; try { child.kill("SIGKILL"); } catch { /* gone */ } }, killMs) : null;
  const status = await new Promise<number>((resolve) => { child.on("close", (code) => { resolve(code ?? -1); }); });
  if (killer) clearTimeout(killer);
  const state = (existsSync(out) ? JSON.parse(readFileSync(out, "utf8")) : null) as NarabiState;
  return { status, stdout, stderr, state, killed };
}
const freshOut = (): string => join(scratchDir(), `narabi-${String(uniq++)}.json`);
// The fixture's last line is 2026-09-19. All the state machine is DRIVEN BY STATE, so --now may move freely in time.
const LAG_NOW = "2026-09-21T10:35Z";       // after 10:30 on 09-21 -> expected 09-20 -> lag -> unhealthy
const LAG_MID = "2026-09-21T12:35Z";       // a second same-UTC-day shot, still unhealthy
const LAG_PM = "2026-09-21T16:35Z";        // a third same-UTC-day shot, still unhealthy
const LAG_NEXT_DAY = "2026-09-22T10:35Z";  // 09-22 -> expected 09-21 -> lag 2 -> unhealthy, a NEW UTC day
const HEALTHY_NOW = "2026-09-20T10:35Z";   // expected 09-19 == last -> healthy
const HEALTHY_SAME_DAY = "2026-09-21T00:15Z"; // BEFORE 10:30 on 09-21 -> expected 09-19 -> healthy, SAME UTC day as LAG_NOW

// ── CA-11 durci: the WHOLE alert pipe EXECUTES from the real fixture -> real narabi.json -> a captured mail ──
test("probe_alert_composition_from_fixture — the real probe reads the fixture, writes narabi.json, and on the ->unhealthy transition connects to a loopback SMTP fake that captures MAIL/RCPT/DATA carrying ALERT_TO + reason; a same-UTC-day re-run sends NO new mail; a state-driven recovery sends ONE 'recovered' mail then falls silent (CA-11; C-2/C-B-7)", async () => {
  const fake = await startFakeSmtp();
  try {
    const out = freshOut();
    const r1 = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port));
    assert.equal(r1.state.status, "unhealthy", "the fixture lags at LAG_NOW");
    assert.equal(r1.state.alert_error, null, "the alert was delivered (no alert_error)");
    assert.equal(r1.state.alerted, true, "alerted latches only AFTER the 250");
    assert.equal(r1.state.last_alert_day, "2026-09-21", "last_alert_day is the UTC day");
    assert.equal(r1.status, 1, "unhealthy exits 1");
    assert.equal(fake.cap.delivered, 1, "exactly one mail delivered");
    assert.equal(fake.cap.rcptTo.length, 1, "exactly one recipient");
    assert.match(fake.cap.rcptTo[0] ?? "", /narabialerts@monarkgate\.tech/, "RCPT TO carries ALERT_TO");
    assert.match(fake.cap.mailFrom ?? "", /narabialerts@monarkgate\.tech/, "MAIL FROM carries ALERT_FROM");
    assert.match(fake.cap.data, /reason: lag/, "the DATA body carries the reason");
    assert.match(fake.cap.data, /condition: alert/, "the first mail is an alert");
    const r2 = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_PM], smtpEnv(fake.port));
    assert.equal(r2.state.alerted, true, "still alerted");
    assert.equal(fake.cap.delivered, 1, "a same-UTC-day re-run sends NO new mail (anti-storm)");
    const r3 = await runProbeAt(out, ["--file", FIXTURE, "--now", HEALTHY_NOW], smtpEnv(fake.port));
    assert.equal(r3.state.status, "healthy", "recovered surface");
    assert.equal(r3.state.alerted, false, "recovery clears alerted");
    assert.equal(r3.state.last_alert_day, null, "recovery clears last_alert_day");
    assert.equal(r3.state.alert_error, null, "recovery mail delivered");
    assert.equal(r3.status, 0, "a healthy recovery exits 0");
    assert.equal(fake.cap.delivered, 2, "recovery sends exactly one more mail");
    assert.match(fake.cap.data, /condition: recovered/, "the last mail is the recovery");
    const r4 = await runProbeAt(out, ["--file", FIXTURE, "--now", HEALTHY_NOW], smtpEnv(fake.port));
    assert.equal(r4.state.alerted, false, "still cleared");
    assert.equal(fake.cap.delivered, 2, "a healthy, non-alerted run sends nothing");
  } finally { await fake.close(); }
});

// ── C5 (CA-11 durci, MERGED tuyau -a x -b): a stale /narabi/state.json digest (from -1b-ii-b's cross-check)
// DRIVES the -1b-ii-a SMTP alert. The WHOLE merged pipe EXECUTES from the real snapshot: real probe, URL mode
// (GET1 timeline + DERIVED GET2 state.json), a VALID-but-STALE state.digest -> state_mismatch -> unhealthy ->
// ONE captured loopback mail carrying `reason: state_mismatch`, exit 1. No pre-merge test crossed the -b
// detection into the -a alert (the -b state test has no SMTP; the -a composition test only drove `lag`). ──
test("probe_state_mismatch_drives_smtp_alert_merged — the merged detection+alert pipe: a real URL-mode probe over the snapshot with a stale /narabi/state.json cross-checks to state_mismatch (-1b-ii-b) and that unhealthy verdict drives EXACTLY ONE captured SMTP alert (-1b-ii-a) whose DATA body carries reason: state_mismatch; the -a state machine latches (alerted, last_alert_day), exit 1, delivered === 1 (C5, CA-11 durci of the a x b merge)", async () => {
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const lines = parseTimeline(tl);
  const firstLine = lines.at(0);
  assert.ok(firstLine, "the snapshot timeline has a first line");
  // a REAL digest of the WRONG day (mirror probe-narabi-state.test.ts:91): a VALID but STALE state.json body.
  const staleState = JSON.stringify({ ...JSON.parse(NARABI_SNAPSHOT.stateJson) as Record<string, unknown>, digest: firstLine.digest_T });
  const NOW = "2026-09-19T10:35Z"; // last day 2026-09-18 present after 10:30 => NOT lagging: the state verdict is isolated
  const http = createServer((req, res) => {
    if (req.url === "/narabi/timeline.jsonl") { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl); return; }
    if (req.url === "/narabi/state.json") { res.writeHead(200, { "content-type": "application/json" }); res.end(staleState); return; }
    res.writeHead(404); res.end();
  });
  await new Promise<void>((r) => { http.listen(0, "127.0.0.1", () => { r(); }); });
  const httpPort = (http.address() as { port: number }).port;
  const fake = await startFakeSmtp();
  try {
    const out = freshOut();
    const r = await runProbeAt(out, ["--url", `http://127.0.0.1:${String(httpPort)}/narabi/timeline.jsonl`, "--now", NOW], smtpEnv(fake.port));
    // DETECTION (-1b-ii-b): the DERIVED GET2 mismatched -> state_mismatch, checked, unhealthy, exit 1.
    assert.equal(r.state.reason, "state_mismatch", "the stale DERIVED state.json cross-checks to state_mismatch (-1b-ii-b)");
    assert.equal(r.state.state_checked, true, "the digest WAS compared (checked, differs)");
    assert.equal(r.state.status, "unhealthy", "state_mismatch is unhealthy");
    assert.equal(r.status, 1, "unhealthy exits 1");
    // ALERT (-1b-ii-a): the -b verdict DROVE the state machine AND exactly one captured mail carrying the -b reason.
    assert.equal(r.state.alerted, true, "the -a state machine latched alerted AFTER the 250 (it consumed the -b verdict)");
    assert.equal(r.state.alert_error, null, "the alert was delivered (no alert_error)");
    assert.equal(r.state.last_alert_day, "2026-09-19", "last_alert_day is the UTC day of --now");
    assert.equal(fake.cap.delivered, 1, "EXACTLY one mail delivered on the state_mismatch (kills a maybeAlert that skips state_*)");
    assert.equal(fake.cap.rcptTo.length, 1, "exactly one recipient");
    assert.match(fake.cap.data, /condition: alert/, "the first mail is an alert");
    assert.match(fake.cap.data, /reason: state_mismatch/, "the DATA body carries the -1b-ii-b reason (kills a composeMail that drops state_*)");
    assert.doesNotMatch(r.stderr, /FATAL/, "the connector ran clean (no FATAL)");
  } finally {
    await fake.close();
    http.closeAllConnections();
    await new Promise<void>((r) => { http.close(() => { r(); }); });
  }
});

// ── C-2: the alert is NEVER lost — a failed send retries next shot; alerted latches only after the 250 (M-ii-1) ──
test("probe_alert_retries_until_delivered — a fake that rejects AUTH on the first connection then accepts sends EXACTLY ONE mail across two shots; alerted latches only after the 250, so the failed first shot retries (C-2; M-ii-1)", async () => {
  const fake = await startFakeSmtp({ authFailFirst: 1 });
  try {
    const out = freshOut();
    const r1 = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port));
    assert.equal(r1.state.alert_error, "smtp_auth_failed", "first shot: AUTH rejected");
    assert.equal(r1.state.alerted, false, "a failed send keeps alerted:false (kills M-ii-1: alerted set before 250)");
    assert.equal(fake.cap.delivered, 0, "no mail delivered on the failed shot");
    assert.equal(r1.status, 1, "a failed send exits 1");
    const r2 = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_MID], smtpEnv(fake.port));
    assert.equal(r2.state.alert_error, null, "second shot: delivered");
    assert.equal(r2.state.alerted, true, "alerted now latched");
    assert.equal(fake.cap.delivered, 1, "EXACTLY one mail across the two shots");
  } finally { await fake.close(); }
});

// ── E-3 + C-B-7: one mail per UTC day of sustained outage; the FLAP (down/up/down same day) is a new incident each ──
test("probe_alert_daily_reminder_once_per_utc_day — three same-UTC-day shots of a sustained outage send ONE mail, a new UTC day still down sends ONE reminder; a FLAP (down/up/down within one UTC day) sends THREE mails (the true bound is <=1 per shot, not <=2/day) (E-3; C-B-7; M-ii-8)", async () => {
  const fake = await startFakeSmtp();
  try {
    const out = freshOut();
    await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port));
    assert.equal(fake.cap.delivered, 1, "first detection: 1 mail");
    await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_MID], smtpEnv(fake.port));
    await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_PM], smtpEnv(fake.port));
    assert.equal(fake.cap.delivered, 1, "two more same-day shots: still 1 (kills 'reminder every shot')");
    const rNext = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NEXT_DAY], smtpEnv(fake.port));
    assert.equal(rNext.state.last_alert_day, "2026-09-22", "the reminder advances last_alert_day");
    assert.equal(fake.cap.delivered, 2, "a NEW UTC day still down: exactly 1 reminder (kills 'no reminder')");
  } finally { await fake.close(); }
  // FLAP: down (alert) -> up (recovery) -> down (a NEW alert) within a single UTC day = 3 mails.
  const flap = await startFakeSmtp();
  try {
    const out = freshOut();
    await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(flap.port));        // down -> alert
    await runProbeAt(out, ["--file", FIXTURE, "--now", HEALTHY_SAME_DAY], smtpEnv(flap.port)); // up -> recovery (same UTC day)
    await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_PM], smtpEnv(flap.port));          // down -> a new alert
    assert.equal(flap.cap.delivered, 3, "a flap in one UTC day is 3 mails (the flap is a new incident, C-B-7)");
  } finally { await flap.close(); }
});

// ── C-3: a reason change while staying unhealthy the same UTC day sends NO new mail (M-ii-2) ──
test("probe_alert_reason_change_same_day_no_mail — an unhealthy reason changing from lag to chain_broken within the same UTC day sends NO second mail (C-3; M-ii-2)", async () => {
  const raw = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  const mid = JSON.parse(raw[1] ?? "{}") as TimelineLine;
  const broken = join(scratchDir(), "reason-change-broken.jsonl");
  writeFileSync(broken, [raw[0] ?? "", JSON.stringify({ ...mid, mints: "9" + String(mid.mints) }), raw[2] ?? ""].join("\n") + "\n");
  const fake = await startFakeSmtp();
  try {
    const out = freshOut();
    const r1 = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port));
    assert.equal(r1.state.reason, "lag", "first: lag");
    assert.equal(fake.cap.delivered, 1, "1 mail on first detection");
    const r2 = await runProbeAt(out, ["--file", broken, "--now", LAG_PM], smtpEnv(fake.port));
    assert.equal(r2.state.reason, "chain_broken", "reason changed to chain_broken");
    assert.equal(r2.state.alerted, true, "still alerted");
    assert.equal(fake.cap.delivered, 1, "a same-day reason change sends NO new mail (kills M-ii-2)");
  } finally { await fake.close(); }
});

// ── C-B-1: the SMTP secret (raw + the REAL wire AUTH tokens) never reaches stdout/stderr/narabi.json (M-ii-3/15) ──
test("probe_secret_never_printed — a fake that echoes the AUTH payload in a 535 and closes mid-AUTH: the tokens REALLY captured on the wire (PLAIN token, both LOGIN tokens) plus the raw password are ALL absent from stdout/stderr/narabi.json; alert_error is the closed-set code, never the server line (C-B-1; M-ii-3/M-ii-15)", async () => {
  for (const announce of [["PLAIN"], ["LOGIN"]]) {
    const fake = await startFakeSmtp({ announce, authFailFirst: 99, echoAuthOn535: true, closeAfterAuth: true });
    try {
      const out = freshOut();
      const r = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port));
      assert.equal(r.state.alert_error, "smtp_auth_failed", `${announce[0] ?? ""}: 535 -> smtp_auth_failed (a closed-set code, NOT the raw server line)`);
      assert.ok(fake.cap.auth.length >= 1, "the fake captured the real AUTH token(s) on the wire");
      const fileText = readFileSync(out, "utf8");
      const secrets = [...fake.cap.auth, SMTP_PASS_VALUE, Buffer.from(SMTP_PASS_VALUE).toString("base64")];
      for (const tok of secrets) {
        assert.ok(tok.length > 0 && !r.stdout.includes(tok), `secret must be absent from stdout (${announce[0] ?? ""})`);
        assert.ok(!r.stderr.includes(tok), `secret must be absent from stderr (${announce[0] ?? ""})`);
        assert.ok(!fileText.includes(tok), `secret must be absent from narabi.json (${announce[0] ?? ""})`);
      }
    } finally { await fake.close(); }
  }
});

// ── C-B-2: a SINGLE global deadline gives up on a drip server / a server silent after DATA (M-ii-16) ──
test("probe_smtp_global_deadline — a drip server (250- forever) and a server silent after DATA both end as smtp_timeout with narabi.json written and exit 1, WITHIN the bound (a single global deadline, not a per-read inactivity timer that a drip keeps resetting) (C-B-2; M-ii-16)", async () => {
  const drip = await startFakeSmtp({ drip: true });
  try {
    const out = freshOut();
    const r = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(drip.port, { SMTP_DEADLINE_MS: "500" }), 8000);
    assert.equal(r.killed, false, "the global deadline ended the run (M-ii-16 inactivity-only would hang under the drip and be SIGKILLed)");
    assert.equal(r.state.alert_error, "smtp_timeout", "a drip server is smtp_timeout");
    assert.equal(r.status, 1, "smtp_timeout exits 1");
  } finally { await drip.close(); }
  const silent = await startFakeSmtp({ silentAfterData: true });
  try {
    const out = freshOut();
    const r = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(silent.port, { SMTP_DEADLINE_MS: "500" }), 8000);
    assert.equal(r.state.alert_error, "smtp_timeout", "a server silent after DATA is smtp_timeout");
    assert.equal(existsSync(out), true, "narabi.json written on timeout");
    assert.equal(r.status, 1);
  } finally { await silent.close(); }
});

// ── C-G2-1: a SINGLE wall-clock deadline covers connect + handshake + conversation (one timer, cleared in finally) ──
test("probe_smtp_single_wall_clock_deadline_covers_whole_exchange — sendSmtp arms EXACTLY ONE timer (injected clock) for the WHOLE exchange; firing it DURING the conversation (past a real loopback connect + EHLO + AUTH) yields smtp_timeout and it is cleared in finally — no 2nd per-phase timer, no residual handle (C-G2-1)", async () => {
  const timers: { cb: () => void; ms: number; cleared: boolean }[] = [];
  const NOW = 1_000_000, DEADLINE = 40_000;
  const clock = {
    now: () => NOW,
    setTimeout: (cb: () => void, ms: number) => { const t = { cb, ms, cleared: false }; timers.push(t); return t; },
    clearTimeout: (t: unknown) => { if (t) (t as { cleared: boolean }).cleared = true; },
  };
  let gotAuth = false;
  const server = net.createServer((sock) => {
    sock.on("error", () => { /* peer RST on destroy (C-G2-2) */ });
    sock.write("220 fake ESMTP\r\n");
    let b = "";
    sock.on("data", (d: Buffer) => {
      b += d.toString(); let nl = b.indexOf("\r\n");
      while (nl >= 0) {
        const line = b.slice(0, nl); b = b.slice(nl + 2);
        if (line.toUpperCase().startsWith("EHLO")) sock.write("250-fake\r\n250 AUTH PLAIN\r\n");
        else if (line.toUpperCase().startsWith("AUTH")) gotAuth = true; // then SILENT -> only the deadline can end it
        nl = b.indexOf("\r\n");
      }
    });
  });
  await new Promise<void>((r) => { server.listen(0, "127.0.0.1", () => { r(); }); });
  const p = sendSmtp({ host: "127.0.0.1", port: (server.address() as { port: number }).port, tls: "none", user: "u@x.tld", pass: "p", from: "u@x.tld", to: "u@x.tld", message: "x\n", deadlineMs: DEADLINE, clock });
  p.catch(() => { /* settled below via the timer; never an unhandled rejection */ });
  try {
    const t0 = Date.now();
    while (!gotAuth && Date.now() - t0 < 4000) await new Promise((r) => setTimeout(r, 10));
    assert.equal(gotAuth, true, "the client got past connect and into the conversation (sent AUTH)");
    assert.equal(timers.length, 1, "EXACTLY ONE timer for the whole exchange (kills a reintroduced separate connect timer)");
    assert.equal(timers[0]?.ms, DEADLINE, "the one timer is armed for the FULL deadline (connect+handshake+conversation)");
    assert.equal(timers[0]?.cleared, false, "not cleared while the exchange is in flight");
    timers[0]?.cb(); // fire the SINGLE deadline DURING the conversation phase
    assert.deepEqual(await p, { ok: false, error: "smtp_timeout" }, "the one wall-clock deadline ends the CONVERSATION as smtp_timeout");
    assert.equal(timers[0]?.cleared, true, "cleared in finally — no residual handle (kills the not-cleared mutant)");
  } finally {
    for (const t of timers) if (!t.cleared) t.cb();
    await new Promise<void>((r) => { server.close(() => { r(); }); });
  }
});

// ── C-G2-1: the connect/handshake phase is bounded by the SAME single deadline (a silent handshake gives up ~1x) ──
test("probe_smtp_connect_deadline_bounds_handshake — a server that accepts TCP but never completes the implicit-TLS handshake is given up on as smtp_timeout within ~one deadline, narabi.json written, exit 1, NOT SIGKILLed (C-G2-1)", async () => {
  // The server-side socket is PAUSED (no 'data' listener) so it never notices the child's disconnect; capture and
  // destroy it in finally, else server.close() would wait for a connection the child already dropped.
  let srvSock: net.Socket | undefined;
  const server = net.createServer((sock) => { srvSock = sock; sock.on("error", () => { /* silent: no ServerHello */ }); });
  await new Promise<void>((r) => { server.listen(0, "127.0.0.1", () => { r(); }); });
  try {
    const port = (server.address() as { port: number }).port, DEADLINE = 700, t0 = Date.now();
    const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(port, { SMTP_TLS: "implicit", SMTP_DEADLINE_MS: String(DEADLINE) }), 8000);
    const elapsed = Date.now() - t0;
    assert.equal(r.killed, false, "bounded by the single deadline, not SIGKILLed (connect-deadline-removed -> hang -> SIGKILL)");
    assert.equal(r.state.alert_error, "smtp_timeout", "a silent handshake is smtp_timeout");
    assert.equal(r.status, 1, "exit 1");
    assert.ok(elapsed < DEADLINE + 4000, `bounded within ~one deadline + child startup (elapsed=${String(elapsed)}ms)`);
  } finally { srvSock?.destroy(); await new Promise<void>((r) => { server.close(() => { r(); }); }); }
});

// ── C-G2-1: after a SUCCESSFUL send the child exits promptly — the single timer is cleared, no residual handle ──
test("probe_smtp_no_residual_timer_handle — with a 30 s SMTP_DEADLINE_MS a successful send still lets the child EXIT PROMPTLY: the single deadline timer is cleared in finally (a not-cleared timer would keep the process alive to 30 s) (C-G2-1)", async () => {
  const fake = await startFakeSmtp();
  try {
    const t0 = Date.now();
    const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port, { SMTP_DEADLINE_MS: "30000" }), 20000);
    const elapsed = Date.now() - t0;
    assert.equal(r.state.alerted, true, "the mail was delivered — this is the SUCCESS path being timed");
    assert.equal(r.state.alert_error, null, "delivered, no error");
    assert.equal(r.killed, false, "not SIGKILLed");
    assert.ok(elapsed < 8000, `child exited well before the 30 s deadline (elapsed=${String(elapsed)}ms) — timer cleared (mutant: not cleared -> lives to 30 s -> SIGKILL)`);
  } finally { await fake.close(); }
});

// ── C-G2-4: the total-byte bound cuts off a flood > SMTP_MAX_BYTES fast, before the deadline ──
test("probe_smtp_byte_bound_stops_flood — a fake that floods > 64 KiB of never-terminating response is cut off as smtp_timeout FAST via the total-byte bound, well before the 20 s deadline, not SIGKILLed (C-G2-4)", async () => {
  const fake = await startFakeSmtp({ flood: true });
  try {
    const t0 = Date.now();
    const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port, { SMTP_DEADLINE_MS: "20000" }), 8000);
    const elapsed = Date.now() - t0;
    assert.equal(r.killed, false, "the byte bound stopped it (mutant: bound removed -> awaits the 20 s deadline > killMs -> SIGKILL -> killed:true)");
    assert.equal(r.state.alert_error, "smtp_timeout", "flooding past SMTP_MAX_BYTES is smtp_timeout");
    assert.equal(r.status, 1, "exit 1");
    assert.ok(elapsed < 8000, `stopped by the byte bound well before the deadline (elapsed=${String(elapsed)}ms)`);
  } finally { await fake.close(); }
});

// ── C-G2-5: smtpDeadlineMs clamps SMTP_DEADLINE_MS to its ceiling and falls back to the default otherwise ──
test("probe_smtp_deadline_ms_is_capped — smtpDeadlineMs clamps an over-MAX SMTP_DEADLINE_MS DOWN to MAX_SMTP_DEADLINE_MS, passes a valid value, and defaults on absent/blank/zero/negative/non-numeric (C-G2-5)", () => {
  assert.equal(smtpDeadlineMs({ SMTP_DEADLINE_MS: String(MAX_SMTP_DEADLINE_MS * 100) }), MAX_SMTP_DEADLINE_MS, "an over-MAX value clamps DOWN to MAX (kills the cap-removed mutant)");
  assert.equal(smtpDeadlineMs({ SMTP_DEADLINE_MS: "5000" }), 5000, "a valid value passes through");
  assert.equal(smtpDeadlineMs({}), DEFAULT_SMTP_DEADLINE_MS, "absent -> default");
  for (const bad of ["", "  ", "0", "-1", "abc"]) assert.equal(smtpDeadlineMs({ SMTP_DEADLINE_MS: bad }), DEFAULT_SMTP_DEADLINE_MS, `blank/zero/negative/NaN -> default: ${JSON.stringify(bad)}`);
});

// ── C-G2-6: the reader resolves a reply only on a COMPLETE line (a fragmented "250 AUT"+"H PLAIN" must not resolve early) ──
test("probe_smtp_reply_needs_complete_line — a fake that fragments the EHLO reply mid-token on the FINAL '250 ' line still delivers exactly one mail: the reader waits for the complete line before parsing the AUTH mechanism (C-G2-6)", async () => {
  const fake = await startFakeSmtp({ fragmentAuthFinalLine: true });
  try {
    const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port), 8000);
    assert.equal(r.state.alert_error, null, "the fragmented '250 AUT'+'H PLAIN' resolves to AUTH PLAIN and delivers (mutant: resolve on the incomplete line -> mech '250 AUT' -> no AUTH -> smtp_auth_failed)");
    assert.equal(r.state.alerted, true, "alerted after the 250");
    assert.equal(fake.cap.delivered, 1, "exactly one mail");
  } finally { await fake.close(); }
});

// ── C-B-3: the remote `day` is CR/LF-sanitized before it reaches the body (the only free remote field) (M-ii-5) ──
test("probe_smtp_injection_crlf_sanitized — a CRLF+dot+RCPT payload carried in the remote `day` produces exactly ONE message and ONE recipient with NO injected command; the sanitized value stays on the single last_day line (C-B-3; M-ii-5)", async () => {
  // the sanitizer itself: CR/LF (and any 8-bit) are stripped, printable ASCII kept, so the field cannot break a line.
  assert.equal(sanitizeField("2026-09-19\r\n.\r\nRCPT TO:<x>"), "2026-09-19.RCPT TO:<x>", "sanitizeField strips CR/LF, keeps printable ASCII");
  const raw = readFileSync(FIXTURE, "utf8").replace(/\r\n/g, "\n").split("\n").filter((x) => x.trim());
  const last = JSON.parse(raw[raw.length - 1] ?? "{}") as TimelineLine;
  const evil = { ...last, day: "2026-09-19\r\n.\r\nRCPT TO:<evil@narabi-probe.invalid>" }; // breaks the chain, but last_day is still copied (fact 19)
  const injFile = join(scratchDir(), "inject-day.jsonl");
  writeFileSync(injFile, [...raw.slice(0, -1), JSON.stringify(evil)].join("\n") + "\n");
  const fake = await startFakeSmtp();
  try {
    const out = freshOut();
    const r = await runProbeAt(out, ["--file", injFile, "--now", LAG_NOW], smtpEnv(fake.port));
    assert.equal(r.state.reason, "chain_broken", "the tampered day breaks the chain");
    assert.equal(fake.cap.delivered, 1, "exactly one message");
    assert.equal(fake.cap.rcptTo.length, 1, "exactly one recipient — no injected RCPT command");
    assert.match(fake.cap.data, /^last_day: [^\r\n]*RCPT TO/m, "the injected text stayed on the single sanitized last_day line (kills M-ii-5: sanitize removed splits it onto its own line)");
  } finally { await fake.close(); }
});

// ── C-B-4: the DATA encoder dot-stuffs and normalizes CRLF (pure) (M-ii-17) ──
test("probe_smtp_dot_stuffing — the exported DATA encoder CRLF-normalizes, dot-stuffs a line starting with '.', dot-stuffs a lone '.', and appends the terminator (C-B-4; M-ii-17)", () => {
  const enc = encodeData("normal line\n.leading\n.\nafter");
  assert.ok(enc.endsWith("\r\n.\r\n"), "terminated by the DATA end sequence");
  assert.match(enc, /^normal line\r\n/, "normal line unchanged, CRLF");
  assert.match(enc, /\r\n\.\.leading\r\n/, "a line starting with '.' is dot-stuffed to '..' (kills M-ii-17)");
  assert.match(enc, /\r\n\.\.\r\n/, "a lone '.' line is dot-stuffed to '..'");
  assert.ok(!/[^\r]\n/.test(enc), "every LF is preceded by CR (no bare LF)");
});

// ── C-NB-8: mail headers are well-formed with a deterministic Date; ALERT_TO/FROM form is validated ──
test("probe_smtp_headers_wellformed — composeMail emits From/To/constant Subject/deterministic UTC Date/Message-ID/MIME-Version/Content-Type and a blank line before the body; isEmailish validates address form (C-NB-8)", () => {
  const { subject, message } = composeMail({
    from: "a@x.tld", to: "b@y.tld", nowIso: "2026-09-21T10:35:00.000Z", kind: "alert", status: "unhealthy",
    reason: "lag", last_day: "2026-09-19", lag_days: 1, chainstack_present: true, provider: "chainstack.com", checked_at: "2026-09-21T10:35:00.000Z",
  });
  assert.equal(subject, "[MONARK] Narabi external probe notice", "constant subject (C-7)");
  assert.match(message, /^From: a@x\.tld$/m);
  assert.match(message, /^To: b@y\.tld$/m);
  assert.match(message, /^Subject: \[MONARK\] Narabi external probe notice$/m);
  assert.match(message, /^Date: \w{3}, 21 Sep 2026 10:35:00 \+0000$/m, "deterministic UTC Date under nowIso");
  assert.match(message, /^Message-ID: <probe-\d+-[0-9a-f]{12}@x\.tld>$/m);
  assert.match(message, /^MIME-Version: 1\.0$/m);
  assert.match(message, /^Content-Type: text\/plain; charset=us-ascii$/m);
  assert.match(message, /\n\nMONARK Narabi external probe\n/, "a blank line separates headers from body");
  assert.match(message, /^reason: lag$/m, "the body carries the reason");
  for (const good of ["a@b.co", "narabialerts@monarkgate.tech"]) assert.equal(isEmailish(good), true, `valid: ${good}`);
  // C-G2-3: CR/LF must never pass isEmailish (envelope-injection guard on ALERT_TO/ALERT_FROM). The realistic payload
  // "a@b.c\r\nRCPT TO:<x>" is already rejected by its space/<>; the CLEAN-tail "a@b.c\r\nx" / "a@b.c\nx" are what red
  // the `\s`->literal-space mutant of isEmailish (mjs:429), which would otherwise let a bare \r\n through.
  for (const bad of ["no-at", "a@b", "a b@c.d", "", "a@@b.c", "a@b.c\r\nRCPT TO:<x>", "a@b.c\r\nx", "a@b.c\nx"]) assert.equal(isEmailish(bad), false, `invalid: ${JSON.stringify(bad)}`);
});

// ── C-B-8: implicit TLS to a plaintext server fails WITHOUT ever speaking EHLO/AUTH in the clear (M-ii-19) ──
test("probe_smtp_implicit_tls_never_speaks_plaintext — SMTP_TLS=implicit to a node:net cleartext server fails the handshake (smtp_tls_failed) and the server receives the binary ClientHello but NEVER 'EHLO' or 'AUTH' in the clear (C-B-8; M-ii-19)", async () => {
  let received = "";
  // A cleartext greeting makes the client's TLS layer reject the first record fast (ERR_SSL_WRONG_VERSION_NUMBER),
  // so the handshake FAILS instead of hanging; the client's ClientHello is still recorded first (measured spike).
  const server = net.createServer((s) => { s.on("error", () => { /* peer RST on TLS-fail destroy — ignored (C-G2-2) */ }); s.write("220 fake plaintext\r\n"); s.on("data", (d: Buffer) => { received += d.toString("latin1"); }); });
  await new Promise<void>((r) => { server.listen(0, "127.0.0.1", () => { r(); }); });
  try {
    const port = (server.address() as { port: number }).port;
    const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(port, { SMTP_TLS: "implicit", SMTP_DEADLINE_MS: "800" }), 8000);
    assert.equal(r.state.alert_error, "smtp_tls_failed", "implicit TLS to a plaintext server fails the handshake");
    assert.equal(r.status, 1);
    assert.ok(received.length > 0, "the server did receive the TLS ClientHello bytes (a real attempt happened)");
    assert.ok(!received.includes("EHLO"), "the probe NEVER sent EHLO in the clear (kills 'net.connect everywhere' / 'EHLO before TLS')");
    assert.ok(!received.includes("AUTH"), "the probe NEVER sent AUTH in the clear");
  } finally { await new Promise<void>((r) => { server.close(() => { r(); }); }); }
});

// ── C-B-8: TLS options are pinned and routing is correct (pure; no connection) (M-ii-7/12/4) ──
test("probe_smtp_tls_options_pinned — implicit -> tls connector with {minVersion TLSv1.2, rejectUnauthorized:true, servername}; SMTP_TLS=none off-loopback -> refuse WITHOUT a connection; none on loopback -> net (C-B-8; M-ii-7/12/4)", () => {
  assert.deepEqual(smtpTransportPlan("smtp.hostinger.tld", "implicit"), { connector: "tls", options: { minVersion: "TLSv1.2", rejectUnauthorized: true, servername: "smtp.hostinger.tld" } });
  assert.deepEqual(smtpTransportPlan("smtp.hostinger.tld", "none"), { connector: "refuse", error: "smtp_unconfigured" }, "plaintext off-loopback is refused (kills M-ii-4)");
  assert.deepEqual(smtpTransportPlan("127.0.0.1", "none"), { connector: "net" }, "plaintext on loopback literal is admitted (the test wire)");
  assert.deepEqual(smtpTransportPlan("localhost", "none"), { connector: "net" }, "plaintext on localhost is admitted");
});

// ── C-B-8: SMTP_TLS=none off-loopback is refused BEFORE any connection, using a .invalid host (zero packets) ──
test("probe_smtp_refuses_plaintext_off_loopback — SMTP_TLS=none with a non-loopback (.invalid) host is refused as smtp_unconfigured with NO connection; a guard-removed mutant would DNS-fail to smtp_unreachable instead (C-B-8; M-ii-4)", async () => {
  const env = { SMTP_HOST: "narabi-smtp.invalid", SMTP_PORT: "465", SMTP_TLS: "none", SMTP_USER: "u@x.tld", SMTP_PASS: "p", ALERT_FROM: "u@x.tld", ALERT_TO: "u@x.tld" };
  const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], env);
  assert.equal(r.state.alert_error, "smtp_unconfigured", "off-loopback plaintext is refused with no dial (kills M-ii-4: guard removed -> smtp_unreachable via DNS)");
  assert.equal(r.status, 1);
});

// ── fact 16: AUTH PLAIN and AUTH LOGIN are both negotiated from the EHLO announcement (M-ii-11) ──
test("probe_smtp_auth_plain_and_login — the probe authenticates with whichever single mechanism the EHLO announces (PLAIN or LOGIN, on a continuation line) and delivers exactly one mail; a mono-line EHLO parser would miss the mechanism (fact 16; M-ii-11)", async () => {
  for (const mech of ["PLAIN", "LOGIN"]) {
    const fake = await startFakeSmtp({ announce: [mech] });
    try {
      const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port));
      assert.equal(r.state.alert_error, null, `${mech}: negotiated and delivered (kills M-ii-11: mono-line parser misses AUTH -> smtp_auth_failed)`);
      assert.equal(r.state.alerted, true, `${mech}: alerted`);
      assert.equal(fake.cap.delivered, 1, `${mech}: exactly one mail`);
      assert.ok(fake.cap.commands.some((c) => c.toUpperCase().startsWith(`AUTH ${mech}`)), `used AUTH ${mech}`);
    } finally { await fake.close(); }
  }
});

// ── C-8: a missing / malformed SMTP config is NOISY (smtp_unconfigured, exit 1), never silently skipped (M-ii-6) ──
test("probe_smtp_unconfigured_is_noisy — an unhealthy verdict with no SMTP config, or a malformed ALERT_TO, records smtp_unconfigured and exits 1 (never a silent skip) (C-8; C-NB-8; M-ii-6)", async () => {
  const r1 = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW]); // childEnv purges all SMTP_*/ALERT_*
  assert.equal(r1.state.alert_error, "smtp_unconfigured", "no config -> smtp_unconfigured (kills M-ii-6: silent skip)");
  assert.equal(r1.state.alerted, false, "unconfigured never latches alerted");
  assert.equal(r1.status, 1, "noisy: exit 1");
  const r2 = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], { SMTP_HOST: "127.0.0.1", SMTP_PORT: "2525", SMTP_TLS: "none", SMTP_USER: "u@x.tld", SMTP_PASS: "p", ALERT_FROM: "u@x.tld", ALERT_TO: "not-an-email" });
  assert.equal(r2.state.alert_error, "smtp_unconfigured", "a malformed ALERT_TO is smtp_unconfigured (C-NB-8)");
});

// ── C-3 (SMTP transport): a closed SMTP port is smtp_unreachable; a server that never greets is smtp_timeout ──
test("probe_smtp_unreachable_closed_port_and_timeout — a closed loopback SMTP port yields smtp_unreachable; a server that accepts but never greets yields smtp_timeout; both exit 1 (C-3 SMTP)", async () => {
  const tmp = net.createServer(); await new Promise<void>((r) => { tmp.listen(0, "127.0.0.1", () => { r(); }); });
  const closed = (tmp.address() as { port: number }).port; await new Promise<void>((r) => { tmp.close(() => { r(); }); });
  const r1 = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(closed));
  assert.equal(r1.state.alert_error, "smtp_unreachable", "a closed SMTP port is smtp_unreachable");
  assert.equal(r1.status, 1);
  const fake = await startFakeSmtp({ neverGreet: true });
  try {
    const r2 = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port, { SMTP_DEADLINE_MS: "500" }), 8000);
    assert.equal(r2.state.alert_error, "smtp_timeout", "a server that never greets is smtp_timeout");
    assert.equal(r2.status, 1);
  } finally { await fake.close(); }
});

// ── C-B-5: an absent / corrupt / schema-1 / inconsistent prior state bootstraps to alerted:false, no crash (M-ii-18) ──
test("probe_reads_missing_or_corrupt_state_as_bootstrap — readPriorState bootstraps to alerted:false on absent/corrupt/inconsistent/unknown-schema states and reads a valid schema-2 state; a corrupt prior does not crash the probe (C-B-5; M-ii-18)", async () => {
  const dir = mkdtempSync(join(scratchDir(), "prior-"));
  const p = join(dir, "narabi.json");
  assert.deepEqual(readPriorState(p), { alerted: false, last_alert_day: null }, "absent -> bootstrap");
  writeFileSync(p, "{not json"); assert.deepEqual(readPriorState(p), { alerted: false, last_alert_day: null }, "corrupt JSON -> bootstrap");
  writeFileSync(p, JSON.stringify({ schema: 2, alerted: true, last_alert_day: null })); assert.deepEqual(readPriorState(p), { alerted: false, last_alert_day: null }, "alerted:true with day:null is inconsistent -> bootstrap");
  writeFileSync(p, JSON.stringify({ schema: 99, alerted: true, last_alert_day: "2026-09-21" })); assert.deepEqual(readPriorState(p), { alerted: false, last_alert_day: null }, "unknown schema > 2 -> bootstrap");
  writeFileSync(p, JSON.stringify({ schema: 2, alerted: true, last_alert_day: "2026-09-21" })); assert.deepEqual(readPriorState(p), { alerted: true, last_alert_day: "2026-09-21" }, "a valid schema-2 state is read");
  // end-to-end: a corrupt prior does not crash the probe (M-ii-18)
  const out = freshOut(); writeFileSync(out, "{corrupt");
  const r = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW]);
  assert.equal(existsSync(out), true, "narabi.json still written despite a corrupt prior (kills M-ii-18)");
  assert.equal(r.state.alerted, false, "corrupt prior -> bootstrap alerted:false");
  assert.equal(r.state.alert_error, "smtp_unconfigured", "still decided to alert on the bootstrap");
  assert.doesNotMatch(r.stderr, /FATAL/, "no crash on a corrupt prior state");
});

// ── Doute-4 (checkpoint-2 -1b-i): a schema-1 state left by a deployed -1b-i is read without crash, rewritten schema 2 ──
test("probe_reads_schema1_state_without_crash — a schema-1 narabi.json (a deployed -1b-i format: KNOWN, neither absent nor corrupt) is read as bootstrap alerted:false without crash and rewritten as schema 2 (Doute-4)", async () => {
  const out = freshOut();
  writeFileSync(out, JSON.stringify({ schema: 1, checked_at: "2026-09-20T10:30:00.000Z", last_day: "2026-09-19", lag_days: 0, chain_ok: true, reachable: true, chainstack_present: false, provider: null, status: "healthy", reason: null, publish_latency: 0 }));
  const r = await runProbeAt(out, ["--file", FIXTURE, "--now", HEALTHY_NOW]); // healthy -> no send
  assert.equal(r.status, 0, "read without crash, healthy exits 0");
  assert.equal(r.state.schema, 2, "rewritten as schema 2");
  assert.equal(r.state.alerted, false, "bootstrap alerted:false from a schema-1 prior");
  assert.doesNotMatch(r.stderr, /FATAL/, "no crash on a schema-1 prior");
});

// ── C-NB-10: every SMTP failure (incl. a connect failure = a synchronous connector throw path) leaves narabi.json written (M-ii-20) ──
test("probe_smtp_failure_leaves_narabi_written — a 535-rejecting server and a closed port both leave narabi.json WRITTEN with a closed-set alert_error and exit 1, never an uncaught FATAL (C-NB-10; M-ii-20)", async () => {
  const fake = await startFakeSmtp({ authFailFirst: 99 });
  try {
    const out = freshOut();
    const r = await runProbeAt(out, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(fake.port));
    assert.equal(existsSync(out), true, "narabi.json written even when the send fails");
    assert.equal(r.state.alert_error, "smtp_auth_failed");
    assert.equal(r.state.alerted, false, "a failed send keeps alerted:false (retry next shot)");
    assert.equal(r.status, 1);
  } finally { await fake.close(); }
  const tmp = net.createServer(); await new Promise<void>((r) => { tmp.listen(0, "127.0.0.1", () => { r(); }); });
  const closed = (tmp.address() as { port: number }).port; await new Promise<void>((r) => { tmp.close(() => { r(); }); });
  const out2 = freshOut();
  const r2 = await runProbeAt(out2, ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(closed));
  assert.equal(existsSync(out2), true, "narabi.json written on a connect failure (kills M-ii-20: connector throw -> FATAL -> unwritten)");
  assert.equal(r2.state.alert_error, "smtp_unreachable");
  assert.doesNotMatch(r2.stderr, /FATAL/, "the connector error was caught, not a FATAL");
});

// ── fact 12: the composed mail (subject + body) carries none of the forbidden vocab, for EVERY reason ──
test("probe_alert_mail_has_no_forbidden_vocab — the subject and body composed for every reason (and recovery) match none of the mail-vocab list nor the GLOBAL/sentinel banned patterns loaded from vocab-banned.json (fact 12)", () => {
  const vocab = JSON.parse(readFileSync(join(REPO, "vocab-banned.json"), "utf8")) as { banned: { re: string }[]; scan: { sentinel: { banned: { re: string }[] } } };
  const banned = [...vocab.banned, ...vocab.scan.sentinel.banned].map((b) => new RegExp(b.re, "i"));
  const mailVocab = /partner|autonomous|guarantee|verified|score/i; // the mail-specific list (fact 12; 'score' also catches 'scores')
  const reasons: (string | null)[] = ["lag", "chain_broken", "unreachable", "too_large", "insecure_url", "probe_error", "state_mismatch", "state_unreachable"];
  const check = (kind: "alert" | "reminder" | "recovery", reason: string | null): void => {
    const { subject, message } = composeMail({
      from: "a@x.tld", to: "b@y.tld", nowIso: "2026-09-21T10:35:00.000Z", kind, status: kind === "recovery" ? "healthy" : "unhealthy",
      reason, last_day: "2026-09-19", lag_days: 3, chainstack_present: false, provider: "p2pify.com", checked_at: "2026-09-21T10:35:00.000Z",
    });
    const text = subject + "\n" + message;
    assert.doesNotMatch(text, mailVocab, `mail-vocab clean for ${kind}/${String(reason)}`);
    for (const re of banned) assert.ok(!re.test(text), `banned pattern ${re.source} must not match the ${kind}/${String(reason)} mail`);
  };
  for (const reason of reasons) { check("alert", reason); check("reminder", reason); }
  check("recovery", null);
});

// ── C-B-13: an unknown CLI flag FAILS LOUD and writes NO narabi.json (a --state typo must never touch production) (M-ii-21) ──
test("probe_rejects_unknown_flag — an unknown flag (e.g. --state) exits non-zero WITHOUT writing narabi.json; the known flags still work; --state does not exist (C-B-13; M-ii-21)", () => {
  const out = join(scratchDir(), `unknown-flag-${String(uniq++)}.json`);
  const r = spawnSync(process.execPath, [PROBE_MJS, "--out", out, "--state", "x", "--file", FIXTURE, "--now", LAG_NOW], { cwd: REPO, env: childEnv(), encoding: "utf8", timeout: 60_000 });
  assert.notEqual(r.status, 0, "an unknown flag exits non-zero (kills M-ii-21: silently ignored)");
  assert.equal(existsSync(out), false, "NO narabi.json is written on a usage error (a --state typo must not touch production)");
  assert.match(r.stderr, /unknown flag/, "the error names the unknown flag (no secret)");
  // the known flags still parse and run (a healthy run writes narabi.json, exit 0)
  const ok = runProbe(["--file", FIXTURE, "--now", HEALTHY_NOW]);
  assert.equal(ok.status, 0, "the known flags still work");
});

// ── C-B-6 G2 checkpoint: no test can send a real mail — secrets purged + the parent env spread exactly once ──
test("g2_no_test_can_send_real_mail — childEnv strips SMTP_*/ALERT_* even when set on the parent, an explicit loopback override is kept, and this file spreads the parent env in EXACTLY ONE place (childEnv) so no spawn can smuggle a raw parent env past the purge (C-B-6)", () => {
  const saved = { p: process.env.SMTP_PASS, t: process.env.ALERT_TO, h: process.env.SMTP_HOST };
  process.env.SMTP_PASS = "leak"; process.env.ALERT_TO = "leak@x.tld"; process.env.SMTP_HOST = "smtp.real.tld";
  try {
    const e = childEnv();
    for (const k of Object.keys(e)) assert.ok(!/^(SMTP_|ALERT_)/.test(k), `childEnv must strip ${k}`);
    assert.equal(childEnv({ SMTP_HOST: "127.0.0.1" }).SMTP_HOST, "127.0.0.1", "an explicit loopback override is kept");
  } finally {
    for (const [k, v] of [["SMTP_PASS", saved.p], ["ALERT_TO", saved.t], ["SMTP_HOST", saved.h]] as const) {
      if (v === undefined) delete process.env[k]; else process.env[k] = v;
    }
  }
  const src = readFileSync(SELF, "utf8");
  assert.equal((src.match(/\.\.\.process\.env/g) ?? []).length, 1, "the parent env is spread in exactly one place (only inside childEnv)");
});

// ── C-G2D-1: the FAILURE twin of no_residual_timer_handle — a CONNECT failure (a closed port) releases the single
//    deadline timer via the connect-failure catch, which is the ONLY release point on this path (the conversation
//    finally is never reached when the connect rejects), so the child still EXITS PROMPTLY. The pre-existing
//    no_residual_timer_handle only pins the SUCCESS path (finally); this twin closes the gap on the failure path. ──
test("probe_smtp_no_residual_timer_handle_on_connect_failure — the FAILURE twin: with a 30 s SMTP_DEADLINE_MS a CONNECT failure (a closed loopback port -> smtp_unreachable) STILL lets the child EXIT PROMPTLY, because the single deadline timer is cleared in the connect-failure catch — the ONLY release on this path, the conversation finally is never reached; a timer left armed there would keep the process alive to the 30 s deadline (C-G2D-1)", async () => {
  const tmp = net.createServer(); await new Promise<void>((r) => { tmp.listen(0, "127.0.0.1", () => { r(); }); });
  const closed = (tmp.address() as { port: number }).port; await new Promise<void>((r) => { tmp.close(() => { r(); }); });
  const t0 = Date.now();
  const r = await runProbeAt(freshOut(), ["--file", FIXTURE, "--now", LAG_NOW], smtpEnv(closed, { SMTP_DEADLINE_MS: "30000" }), 20000);
  const elapsed = Date.now() - t0;
  assert.equal(r.state.alert_error, "smtp_unreachable", "the closed port fails the connect — this is the FAILURE path being timed (narabi.json is written before any hang)");
  assert.equal(r.state.alerted, false, "a failed send keeps alerted:false (retry next shot)");
  assert.equal(r.killed, false, "not SIGKILLed — the connect-failure catch cleared the single timer (mutant: clearT removed from that catch -> timer stays armed to the 30 s deadline > killMs -> SIGKILL -> killed:true)");
  assert.ok(elapsed < 8000, `child exited well before the 30 s deadline (elapsed=${String(elapsed)}ms) — timer cleared in the connect-failure catch (mutant: not cleared -> lives to 30 s -> SIGKILL)`);
  assert.equal(r.status, 1, "smtp_unreachable exits 1");
});
