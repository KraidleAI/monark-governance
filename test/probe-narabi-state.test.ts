// test/probe-narabi-state.test.ts — non-LLM oracle for sub-lot NARABI-OPS-1b-ii-b (DETECTION hardening): the
// /narabi/state.json digest cross-check (2nd bounded GET, default basename derivation), the GET retry-count
// killer, and the monark-sentinel start backstop. A NEW file, kept OFF test/probe-narabi.test.ts (which the
// sibling sub-lot -1b-ii-a edits in parallel), so the second merge stays simple. Runs at the repo root under
// `node --test`. No network: node:http loopback servers, `--file`, `--state-file`, and pure evaluate() calls.
// Every subprocess gets an EXPLICIT env with SMTP_*/ALERT_*/PROBE_* PURGED (C-B-6) so no ambient var leaks in.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import {
  evaluate, deriveStateUrl, parseTimeline,
  DEADLINE_UTC_MINUTES, MAX_TIMEOUT_MS, MAX_MAX_BYTES, MAX_RETRIES, START_MARGIN_MS,
  STATE_MAX_BYTES, STATE_TIMEOUT_MS, STATE_RETRIES,
} from "../scripts/probe-narabi.mjs";
import type { NarabiState, StateCheck } from "../scripts/probe-narabi.mjs";
import { loadNarabiCapture } from "../apps/site/lib/narabi-capture-load.ts";
import { listen } from "./helpers/loopback.ts";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO = join(HERE, "..");
const PROBE_MJS = join(REPO, "scripts", "probe-narabi.mjs");
const DEPLOY = join(REPO, "deploy");
// The storefront's committed capture of the two served files, read through its manifest-checked loader.
const NARABI_SNAPSHOT = loadNarabiCapture(REPO);
// The committed capture (apps/site/data/narabi-capture.json) is RE-CAPTURED as the sentinel publishes, so its last
// published day D is READ here, never typed: SNAP_NOW = D+1 just after the deadline (D present => not lagging, which
// isolates the state verdict) and SNAP_LAG = D+2 after the deadline (D+1 missing => lag_days > 0). A routine re-capture
// therefore never flips these verdicts (it used to be the literal 2026-09-19T10:35Z / 2026-09-25T12:00Z pair, true
// only for the T=1 capture of 2026-09-19).
const SNAP_LAST_DAY: string = parseTimeline(NARABI_SNAPSHOT.timelineJsonl).at(-1)?.day ?? "";
const snapDayPlus = (n: number): string => new Date(Date.parse(SNAP_LAST_DAY + "T00:00:00Z") + n * 86_400_000).toISOString().slice(0, 10);
const SNAP_NOW = `${snapDayPlus(1)}T10:35Z`;
const SNAP_LAG = `${snapDayPlus(2)}T12:00Z`;
const TZ_EAST = "Etc/GMT-11"; // a non-UTC child TZ; toISOString stays UTC, so verdicts are TZ-invariant here

// RUN_DURATION_D_SEC — the publishing run's wall clock, MEASURED by the orchestrator (I do not estimate D),
// committed here as a named constant with its provenance (C-NB-5, C-G2-5). D = 25.481 s (publishing run of
// 2026-09-21, start 00:47:55 UTC, exit 00:48:20 UTC on the VPS site), rounded UP to the whole second => 26.
// Provenance is anchored on the JOURNAL CONTENT, not a line NUMBER (C-G2-5: a line inserted BEFORE it must not
// silently re-point the reference): docs/JOURNAL-PROVENANCE.md carries the substring
//   "mesure D = 25,481 s (run publiant 00:47:55→00:48:20 UTC"   (G7 lot NARABI-OPS-1b-i, merge 9b178f3).
// Locate it by CONTENT:  grep -n "mesure D = 25,481 s" docs/JOURNAL-PROVENANCE.md   (as of 2026-09-21 it is
// on line 310; that is a convenience, not the anchor). SECONDARY check — that line's sha256, LF-normalized,
// without a trailing newline, is 2d3158b2865e640cebe05ffb8a220cd7194f315809235bcbb9051eca925f9388 (the CONTENT
// above is primary; the number and the sha are secondary and may drift as the JOURNAL grows).
const RUN_DURATION_D_SEC = 26;

// EXPLICIT env with the mail/probe knobs PURGED (C-B-6): a SMTP_PASS / PROBE_URL in the orchestrator's ambient
// User-scope env must never reach a child. A FILTER (not a from-scratch env) keeps SystemRoot/PATH so node
// still starts on Windows; explicit per-call overrides win over the purged base.
function purgedEnv(explicit: Record<string, string> = {}): Record<string, string> {
  const base = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => !/^(SMTP_|ALERT_|PROBE_)/i.test(k)),
  ) as Record<string, string>;
  return { ...base, TZ: TZ_EAST, ...explicit };
}

let scratch: string | null = null;
let uniq = 0;
function scratchDir(): string {
  scratch ??= mkdtempSync(join(tmpdir(), "narabi-state-"));
  return scratch;
}
// Clean up this suite's OWN mkdtemp (no narabi-state-* left behind).
after(() => { if (scratch !== null) rmSync(scratch, { recursive: true, force: true }); });

interface ProbeRun { status: number; state: NarabiState }
/** Spawn the REAL probe .mjs (the only way to observe the real exit code) and return its exit + the narabi.json
 *  it ALWAYS writes. env is EXPLICIT and purged (C-B-6). Async because the probe connects back to a server in
 *  this process (a synchronous spawn would deadlock the event loop). */
async function runProbeAsync(args: readonly string[], explicit: Record<string, string> = {}): Promise<ProbeRun> {
  const out = join(scratchDir(), `narabi-${String(uniq++)}.json`);
  const child = spawn(process.execPath, [PROBE_MJS, "--out", out, ...args], { cwd: REPO, env: purgedEnv(explicit) });
  const status = await new Promise<number>((resolve) => { child.on("close", (code) => resolve(code ?? -1)); });
  assert.ok(existsSync(out), "the probe must ALWAYS write narabi.json");
  return { status, state: JSON.parse(readFileSync(out, "utf8")) as NarabiState };
}

function close(server: Server): Promise<void> {
  server.closeAllConnections();
  return new Promise((resolve) => server.close(() => resolve()));
}

// ── item 2 / C-B-12: 2nd GET of state.json (DERIVED path), digest cross-check vs the last line's digest_T ─────
test("probe_state_digest_cross_check — the probe does a 2nd bounded GET of state.json DERIVED by basename replacement (ONE loopback server, NO PROBE_STATE_URL; C-B-12) and cross-checks state.digest against the last line's digest_T: the coherent snapshot => healthy; a state.json of another day => state_mismatch; --file without --state-file => state_checked:false; an injected --state-file is checked (item 2; kills M-ii-9)", async () => {
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const lines = parseTimeline(tl);
  const lastLine = lines.at(-1);
  assert.ok(lastLine, "the snapshot timeline has a last line");
  const firstLine = lines.at(0);
  assert.ok(firstLine, "the snapshot timeline has a first line");
  const coherentState = NARABI_SNAPSHOT.stateJson;
  // a REAL digest of the WRONG day: the 2026-09-17 line's digest_T (not a random hex) — a valid but stale state.
  const trafiquedState = JSON.stringify({ ...JSON.parse(coherentState) as Record<string, unknown>, digest: firstLine.digest_T });
  const NOW = SNAP_NOW; // the capture's last day present after the deadline => not lagging; isolates the state verdict

  assert.equal(deriveStateUrl("http://127.0.0.1:8080/narabi/timeline.jsonl"), "http://127.0.0.1:8080/narabi/state.json", "basename derivation");
  assert.equal(lastLine.digest_T, (JSON.parse(coherentState) as { digest: string }).digest, "oracle: the coherent state's digest IS the last line's digest_T");

  const serve = (stateBody: string): Server => createServer((req, res) => {
    if (req.url === "/narabi/timeline.jsonl") { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl); return; }
    if (req.url === "/narabi/state.json") { res.writeHead(200, { "content-type": "application/json" }); res.end(stateBody); return; }
    res.writeHead(404); res.end();
  });

  // (a) coherent: derived GET2 matches -> healthy.
  const okServer = serve(coherentState);
  const okPort = await listen(okServer);
  try {
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(okPort)}/narabi/timeline.jsonl`, "--now", NOW]);
    assert.equal(r.state.status, "healthy", "coherent state.digest === last.digest_T (DERIVED path, no PROBE_STATE_URL) -> healthy");
    assert.equal(r.state.reason, null, "no reason");
    assert.equal(r.state.state_checked, true, "the cross-check ran and matched");
    assert.equal(r.status, 0, "exit 0");
  } finally { await close(okServer); }

  // (b) a state.json of another day -> state_mismatch (kills M-ii-9: cross-check skipped -> healthy).
  const badServer = serve(trafiquedState);
  const badPort = await listen(badServer);
  try {
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(badPort)}/narabi/timeline.jsonl`, "--now", NOW]);
    assert.equal(r.state.reason, "state_mismatch", "a state.json of another day -> state_mismatch (M-ii-9)");
    assert.equal(r.state.status, "unhealthy", "unhealthy");
    assert.equal(r.state.state_checked, true, "checked (compared, differs)");
    assert.equal(r.status, 1, "state_mismatch exits 1");
  } finally { await close(badServer); }

  // (c) --file mode WITHOUT --state-file -> no cross-check, state_checked:false, still healthy (offline).
  const tlFile = join(scratchDir(), "snap-timeline.jsonl");
  writeFileSync(tlFile, tl);
  const rNoState = await runProbeAsync(["--file", tlFile, "--now", NOW]);
  assert.equal(rNoState.state.state_checked, false, "--file without --state-file -> no cross-check (the 8 inherited --file sub-cases stay green)");
  assert.equal(rNoState.state.status, "healthy", "and healthy");

  // (d) --file mode WITH --state-file -> the injected state.json is cross-checked (coherent healthy; wrong day mismatch).
  const okStateFile = join(scratchDir(), "snap-state-ok.json");
  writeFileSync(okStateFile, coherentState);
  const rInjOk = await runProbeAsync(["--file", tlFile, "--state-file", okStateFile, "--now", NOW]);
  assert.equal(rInjOk.state.state_checked, true, "--state-file injected and compared");
  assert.equal(rInjOk.state.status, "healthy", "coherent injected state -> healthy");
  const badStateFile = join(scratchDir(), "snap-state-bad.json");
  writeFileSync(badStateFile, trafiquedState);
  const rInjBad = await runProbeAsync(["--file", tlFile, "--state-file", badStateFile, "--now", NOW]);
  assert.equal(rInjBad.state.reason, "state_mismatch", "an injected state.json of another day -> state_mismatch");
  assert.equal(rInjBad.status, 1, "exit 1");

  // (e) an oversize --state-file is refused (bounded like --file, C-G2-8): a COHERENT but too-large state.json
  // is NOT read -> state_unreachable (kills the size-check-removed mutant: without the bound it reads it and,
  // since the digest matches, would go healthy).
  const bigStateFile = join(scratchDir(), "snap-state-big.json");
  writeFileSync(bigStateFile, JSON.stringify({ ...JSON.parse(coherentState) as Record<string, unknown>, pad: "x".repeat(STATE_MAX_BYTES) }));
  const rBig = await runProbeAsync(["--file", tlFile, "--state-file", bigStateFile, "--now", NOW]);
  assert.equal(rBig.state.reason, "state_unreachable", "an oversize --state-file is refused (not read whole) -> state_unreachable");
  assert.equal(rBig.state.state_checked, false, "not checked (over the byte cap)");
});

// ── item 2 / Q4: a failed 2nd GET is state_unreachable, and a state fault OUTRANKS lag (precedence, M-ii-22) ──
test("probe_state_unreachable_precedence — a failed 2nd GET is state_unreachable (Q4), and a state fault OUTRANKS a lagging surface while a broken chain outranks the state fault: pure evaluate() pins chain_broken > state_unreachable > state_mismatch > lag (M-ii-22); a subprocess with a 404 state.json on a lagging surface records state_unreachable, never lag (CA-11 durci: the 404 case)", async () => {
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const lines = parseTimeline(tl);
  const firstLine = lines.at(0);
  assert.ok(firstLine, "the snapshot timeline has a first line");
  const wrongDayDigest = firstLine.digest_T;
  const LAG = SNAP_LAG; // one due day past the capture's last day => lag_days > 0, so a lag-first mutant surfaces lag

  // (a) PURE evaluate() precedence ladder (no I/O), on the real snapshot lines + synthetic stateCheck inputs.
  const ev = (stateCheck: StateCheck | undefined): NarabiState => evaluate({ text: tl, nowIso: LAG, reachable: true, stateCheck });
  assert.equal(ev({ ok: false }).reason, "state_unreachable", "state_unreachable outranks lag (M-ii-22)");
  assert.equal(ev({ ok: true, digest: wrongDayDigest }).reason, "state_mismatch", "state_mismatch outranks lag");
  assert.equal(ev(undefined).reason, "lag", "with no cross-check the verdict is lag (the ladder is state>lag, not state-always)");
  // chain_broken outranks any state fault: tamper the last line's hashed field so its line_hash recompute diverges.
  const tampered = lines.map((l, i) => (i === lines.length - 1 ? { ...l, mints: "9" + l.mints } : l));
  const brokenText = tampered.map((l) => JSON.stringify(l)).join("\n");
  assert.equal(evaluate({ text: brokenText, nowIso: LAG, reachable: true, stateCheck: { ok: false } }).reason, "chain_broken", "chain_broken outranks state_unreachable");

  // (b) SUBPROCESS, CA-11 durci: real snapshot timeline 200, derived state.json 404 -> state_unreachable, not lag.
  const server = createServer((req, res) => {
    if (req.url === "/narabi/timeline.jsonl") { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl); return; }
    res.writeHead(404); res.end(); // /narabi/state.json (and anything else) 404s
  });
  const port = await listen(server);
  try {
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(port)}/narabi/timeline.jsonl`, "--now", LAG]);
    assert.equal(r.state.reason, "state_unreachable", "a 404 on the derived state.json -> state_unreachable, NOT lag (Q4)");
    assert.equal(r.state.state_checked, false, "not checked (no comparable digest)");
    assert.equal(r.state.status, "unhealthy", "unhealthy");
    assert.equal(r.status, 1, "state_unreachable exits 1");
  } finally { await close(server); }
});

// ── item 4: the GET loop makes EXACTLY retries+1 attempts on a failing surface (kills attempt <= retries+1) ──
test("probe_get_retries_exactly_n_plus_one — the GET loop makes EXACTLY retries+1 attempts on a failing surface: a server that resets exactly retries+1 connections then WOULD serve yields unreachable at hits === retries+1 (real), never healthy at hits === retries+2 (kills M-ii-10, attempt <= retries+1); pinned at PROBE_RETRIES=0 AND =2; a closed port is unreachable (item 4)", async () => {
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const NOW = SNAP_NOW; // the capture's last day present after the deadline => not lagging; isolates the state verdict
  // Resets the first `failCount` connections (the probe retries each), then WOULD serve a healthy surface.
  const makeFlaky = (failCount: number): { server: Server; hits: () => number } => {
    let hits = 0;
    const server = createServer((req, res) => {
      hits++;
      if (hits <= failCount) { req.socket.destroy(); return; } // a connection reset -> the probe retries
      if (req.url === "/narabi/state.json") { res.writeHead(200, { "content-type": "application/json" }); res.end(NARABI_SNAPSHOT.stateJson); return; }
      res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl);
    });
    return { server, hits: () => hits };
  };

  for (const retries of [0, 2]) {
    const { server, hits } = makeFlaky(retries + 1); // fail exactly retries+1 times
    const port = await listen(server);
    try {
      const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(port)}/narabi/timeline.jsonl`, "--now", NOW], { PROBE_RETRIES: String(retries) });
      assert.equal(r.state.reason, "unreachable", `PROBE_RETRIES=${String(retries)}: the real code gives up after retries+1 attempts (a mutant reaches the serve on attempt retries+2 -> healthy)`);
      assert.equal(r.state.status, "unhealthy", "unhealthy");
      assert.equal(r.status, 1, "unreachable exits 1");
      assert.equal(hits(), retries + 1, `EXACTLY retries+1 (${String(retries + 1)}) GET attempts reached the server (the mutant makes retries+2 = ${String(retries + 2)}, then a 3rd for state.json)`);
    } finally { await close(server); }
  }

  // A closed port: connection refused on every attempt -> unreachable (no server accepts).
  const dead = createServer(() => { /* never used */ });
  const deadPort = await listen(dead);
  await close(dead); // free the port so the probe hits ECONNREFUSED
  const rDead = await runProbeAsync(["--url", `http://127.0.0.1:${String(deadPort)}/narabi/timeline.jsonl`, "--now", NOW], { PROBE_RETRIES: "0" });
  assert.equal(rDead.state.reason, "unreachable", "a closed port is unreachable");
  assert.equal(rDead.state.reachable, false, "no dial succeeded");
  assert.equal(rDead.status, 1, "exit 1");
});

// ── item 3 / C-NB-5: monark-sentinel start backstop, inter-unit UTC coherence (both bounds) ──────────────────
test("probe_sentinel_timeoutstartsec_inter_unit_coherence — monark-sentinel.service TimeoutStartSec (T_s) satisfies BOTH UTC bounds: HIGH so (last sentinel slot + RandomizedDelaySec + T_s) <= the probe DEADLINE (kills M-ii-13), LOW so T_s >= max(300, 3*RUN_DURATION_D_SEC) (kills M-ii-14, T_s < 3D), and equals the pre-registered formula max(300, ceil(3*D/60)*60) (item 3; C-NB-5)", () => {
  const svc = readFileSync(join(DEPLOY, "monark-sentinel.service"), "utf8");
  const timer = readFileSync(join(DEPLOY, "monark-sentinel.timer"), "utf8");
  const tsMatch = /^TimeoutStartSec=(\d+)$/m.exec(svc);
  assert.ok(tsMatch, "monark-sentinel.service pins TimeoutStartSec in whole seconds");
  const Ts = Number(tsMatch[1] ?? "0");
  const slots = [...timer.matchAll(/^OnCalendar=.*?(\d{2}):(\d{2}):\d{2}\s+UTC\s*$/gm)].map((m) => Number(m[1] ?? "0") * 60 + Number(m[2] ?? "0"));
  assert.ok(slots.length >= 1, "the timer declares UTC OnCalendar slots");
  const lastSlotMin = Math.max(...slots);
  const jitterMatch = /^RandomizedDelaySec=(\d+)$/m.exec(timer);
  assert.ok(jitterMatch, "the timer pins RandomizedDelaySec");
  const jitterSec = Number(jitterMatch[1] ?? "0");

  // HIGH bound (M-ii-13): the worst start instant must not cross the probe's freshness deadline (all UTC).
  const worstStartSec = lastSlotMin * 60 + jitterSec + Ts;
  assert.ok(worstStartSec <= DEADLINE_UTC_MINUTES * 60,
    `worst start ${String(worstStartSec)}s (last slot ${String(lastSlotMin)}min + jitter ${String(jitterSec)}s + T_s ${String(Ts)}s) must be <= DEADLINE ${String(DEADLINE_UTC_MINUTES * 60)}s (M-ii-13)`);

  // LOW bound (M-ii-14): T_s must be at least the pre-registered floor max(300, 3*D).
  const lowBound = Math.max(300, 3 * RUN_DURATION_D_SEC);
  assert.ok(Ts >= lowBound, `T_s ${String(Ts)} must be >= max(300, 3*D=${String(3 * RUN_DURATION_D_SEC)}) = ${String(lowBound)} (M-ii-14: T_s < 3D reds)`);

  // and equals the pre-registered formula exactly (pins both directions).
  const formula = Math.max(300, Math.ceil((3 * RUN_DURATION_D_SEC) / 60) * 60);
  assert.equal(Ts, formula, `T_s must equal the pre-registered formula max(300, ceil(3*D/60)*60) = ${String(formula)}`);
});

// ── C-NB-7: monark-probe.service covers the SECOND GET (RSS for two bodies + worst-case timeout) ─────────────
test("probe_state_get_rss_and_worstcase_bounds — monark-probe.service covers the state cross-check GET: MemoryMax >= 13 x (MAX_MAX_BYTES + STATE_MAX_BYTES) (two bodies possibly in flight, C-NB-7), and TimeoutStartSec strictly exceeds the GET1+GET2 capped worst case + margin, so a state_unreachable can never come from the unit killing the probe mid-check (+GET2, L-3b, satisfied by assertion not edit)", () => {
  const svc = readFileSync(join(DEPLOY, "monark-probe.service"), "utf8");
  const mem = /^MemoryMax=(\d+)M$/m.exec(svc);
  assert.ok(mem, "monark-probe.service pins MemoryMax in MiB");
  assert.ok(Number(mem[1] ?? "0") * 1024 * 1024 >= 13 * (MAX_MAX_BYTES + STATE_MAX_BYTES),
    `MemoryMax (${String(mem[1] ?? "?")}M) must be >= 13 x (MAX_MAX_BYTES + STATE_MAX_BYTES) = ${String(13 * (MAX_MAX_BYTES + STATE_MAX_BYTES))} bytes (kills the STATE_MAX_BYTES-raised mutant; C-NB-7)`);
  const to = /^TimeoutStartSec=(\d+)$/m.exec(svc);
  assert.ok(to, "monark-probe.service pins TimeoutStartSec");
  const worstSec = Math.ceil((MAX_TIMEOUT_MS * (MAX_RETRIES + 1) + STATE_TIMEOUT_MS * (STATE_RETRIES + 1) + START_MARGIN_MS) / 1000);
  assert.ok(Number(to[1] ?? "0") > worstSec,
    `TimeoutStartSec (${String(to[1] ?? "?")}) must strictly exceed the GET1+GET2 capped worst case ${String(worstSec)}s (a mis-set env can never get the probe killed mid state-check)`);
});

// ── PLI G2 mutant-killers (N-G2-1/2/3): three gaps the G2 reviewer's adversarial mutants SURVIVED on the frozen
// suite (the delivered code is correct; these pin the missing teeth so a future regressive edit reds). ──────────

// N-G2-3 (robustness, the most useful): the URL-mode 2nd GET must BIND maxBytes = STATE_MAX_BYTES at the call
// site. Mien#2 pins the CONSTANT (via probe_state_get_rss_and_worstcase_bounds); this pins the RUNTIME BINDING —
// that probe() actually passes STATE_MAX_BYTES to the state GET. Dropping it lets GET2 read up to MAX_MAX_BYTES
// (8 MiB), so the two-body RSS could exceed MemoryMax=128M (OOM). Killer: serve a COHERENT-digest state.json of
// STATE_MAX_BYTES+overhead bytes -> the bounded real GET2 refuses it too_large -> state_unreachable; a mutant
// GET2 without the cap reads it whole and, since the digest matches, would go HEALTHY.
test("probe_state_get2_binds_state_max_bytes — the URL-mode state cross-check GET passes maxBytes:STATE_MAX_BYTES, so an oversize (but coherent-digest) state.json is refused too_large -> state_unreachable, never read whole (kills N-G2-3: a GET2 without the maxBytes binding reads up to MAX_MAX_BYTES and, the digest matching, goes healthy — an RSS/OOM hazard on the two-body path)", async () => {
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const NOW = SNAP_NOW; // the capture's last day present after the deadline => not lagging; isolates the state verdict
  const coherent = JSON.parse(NARABI_SNAPSHOT.stateJson) as Record<string, unknown>;
  // valid JSON, COHERENT digest (so a mutant reading it whole matches -> healthy, not state_mismatch), padded
  // just over STATE_MAX_BYTES so the bounded real GET2 refuses it too_large before parsing.
  const oversize = JSON.stringify({ ...coherent, pad: "x".repeat(STATE_MAX_BYTES) });
  assert.ok(Buffer.byteLength(oversize, "utf8") > STATE_MAX_BYTES, "the served state.json exceeds STATE_MAX_BYTES");
  const server = createServer((req, res) => {
    if (req.url === "/narabi/timeline.jsonl") { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl); return; }
    if (req.url === "/narabi/state.json") { res.writeHead(200, { "content-type": "application/json" }); res.end(oversize); return; }
    res.writeHead(404); res.end();
  });
  const port = await listen(server);
  try {
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(port)}/narabi/timeline.jsonl`, "--now", NOW]);
    assert.equal(r.state.reason, "state_unreachable", "oversize state.json refused too_large by the bounded GET2 -> state_unreachable (mutant without the cap reads it whole, digest matches -> healthy)");
    assert.equal(r.state.state_checked, false, "not checked (over the STATE_MAX_BYTES cap)");
    assert.equal(r.state.status, "unhealthy", "unhealthy");
    assert.equal(r.status, 1, "state_unreachable exits 1");
  } finally { await close(server); }
});

// N-G2-1: the state.json digest MUST be a string; a numeric digest is not comparable -> state_unreachable (NOT
// state_mismatch). stateDigestOf gates on `typeof d === "string"`; a mutant relaxing it to `d != null` accepts
// 123, compares it to the hex digest_T, and mis-classifies as state_mismatch/state_checked:true.
test("probe_state_digest_must_be_string — a numeric (non-string) state.json digest yields no comparable digest -> state_unreachable, state_checked:false (kills N-G2-1: a type guard relaxed to `d != null` accepts 123 and mis-reports state_mismatch)", async () => {
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const NOW = SNAP_NOW; // the capture's last day present after the deadline => not lagging; isolates the state verdict
  const numericDigest = JSON.stringify({ ...JSON.parse(NARABI_SNAPSHOT.stateJson) as Record<string, unknown>, digest: 123 });
  const server = createServer((req, res) => {
    if (req.url === "/narabi/timeline.jsonl") { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl); return; }
    if (req.url === "/narabi/state.json") { res.writeHead(200, { "content-type": "application/json" }); res.end(numericDigest); return; }
    res.writeHead(404); res.end();
  });
  const port = await listen(server);
  try {
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(port)}/narabi/timeline.jsonl`, "--now", NOW]);
    assert.equal(r.state.reason, "state_unreachable", "a non-string digest is not comparable -> state_unreachable (mutant `d != null` -> state_mismatch)");
    assert.equal(r.state.state_checked, false, "not checked (no comparable STRING digest was obtained)");
    assert.equal(r.state.status, "unhealthy", "unhealthy");
    assert.equal(r.status, 1, "state_unreachable exits 1");
  } finally { await close(server); }
});

// N-G2-2: the PROBE_STATE_URL override (addendum §2 / G0 C-B-12: env override, default = basename derivation) is
// HONORED in place of the derived URL AND is subject to the SAME transport guard as GET1 (fetchTimeline ->
// urlTransportAllowed, defense in depth :250). Proof in ONE assertion: point the override at http://127.1:<port>
// — WHATWG normalizes the host to 127.0.0.1 so u.hostname passes isLoopbackHost, but rawUrlHost returns "127.1"
// which fails the 4-octet loopback regex, so the guard REFUSES it (insecure_url) BEFORE any dial. Real: the
// loopback server records EXACTLY ONE hit (GET1 only; the state GET never dialed) -> state_unreachable. A mutant
// ignoring the override (deriveStateUrl(url) only) derives the CANONICAL loopback state.json, hits the server a
// 2nd time, matches -> healthy. The single hit proves BOTH "refusal without request" and "same guard as GET1".
test("probe_state_url_override_honored_and_guarded — the PROBE_STATE_URL override is used AND transport-guarded like GET1: a refused override (http://127.1, normalized host but rawUrlHost-refused) yields state_unreachable with EXACTLY one loopback hit (GET1 only, no state dial) (kills N-G2-2: a mutant ignoring the override derives the canonical state.json, hits a 2nd time, and goes healthy)", async () => {
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const NOW = SNAP_NOW; // the capture's last day present after the deadline => not lagging; isolates the state verdict
  let hits = 0;
  const server = createServer((req, res) => {
    hits++;
    if (req.url === "/narabi/state.json") { res.writeHead(200, { "content-type": "application/json" }); res.end(NARABI_SNAPSHOT.stateJson); return; }
    res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl);
  });
  const port = await listen(server);
  try {
    const r = await runProbeAsync(
      ["--url", `http://127.0.0.1:${String(port)}/narabi/timeline.jsonl`, "--now", NOW],
      { PROBE_STATE_URL: `http://127.1:${String(port)}/narabi/state.json` }, // same host, a form -1b-i's guard refuses -> no dial
    );
    assert.equal(r.state.reason, "state_unreachable", "a refused PROBE_STATE_URL override -> state_unreachable (the override IS honored and IS transport-guarded like GET1)");
    assert.equal(r.state.state_checked, false, "not checked (the override was refused before any dial)");
    assert.equal(hits, 1, "EXACTLY one loopback hit: GET1 (timeline); the state GET was refused WITHOUT a request (a mutant ignoring the override derives the canonical URL and hits a 2nd time -> healthy)");
    assert.equal(r.status, 1, "state_unreachable exits 1");
  } finally { await close(server); }
});

// ── C-G2D-3 (G2-delta mutants R & T): the URL-mode 2nd GET binds ALL THREE of its transport bounds at the call
// site (probe-narabi.mjs:412: { timeoutMs: STATE_TIMEOUT_MS, maxBytes: STATE_MAX_BYTES, retries: STATE_RETRIES }).
// N-G2-3 above pins the maxBytes binding; the G2-delta reviewer found the retries and timeout bindings still
// SURVIVED (dropping either lets GET2 fall back to the env-tunable transportBounds, defeating the env-INDEPENDENCE
// the FIXED STATE_* values exist to guarantee — the worst-case-bounds assertion models the fixed values, so a
// runtime drift to a widened env is invisible to it). These two killers red exactly those two drops. ─────────────

// R (retries binding): pin PROBE_RETRIES=0 (so a mutant GET2 rebinding to env does ONE attempt) and reset the FIRST
// state.json attempt then serve a coherent body. The real GET2 (retries:STATE_RETRIES=1 => 2 attempts, env-INDEP.)
// rides its fixed retry and reads the body on the 2nd try -> healthy; a mutant (retries<-env 0 => 1 attempt) gives
// up on the reset -> state_unreachable. Attempt count observed by a hit counter (deterministic, no timing).
test("probe_state_get2_binds_state_retries — the URL-mode state cross-check GET passes retries:STATE_RETRIES, so it makes EXACTLY STATE_RETRIES+1 attempts INDEPENDENT of PROBE_RETRIES: with PROBE_RETRIES=0 a state.json that resets its first attempt then serves is still reached on the 2nd try -> healthy (kills the mutant dropping the retries binding: GET2 falls back to env 0 -> 1 attempt -> gives up on the reset -> state_unreachable)", async () => {
  assert.ok(0 < STATE_RETRIES, "premise: STATE_RETRIES is a real retry budget (>0), so a first-attempt reset is survivable and the count differs from PROBE_RETRIES=0");
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const NOW = SNAP_NOW; // the capture's last day present after the deadline => not lagging; isolates the state verdict
  let stateHits = 0;
  const server = createServer((req, res) => {
    if (req.url === "/narabi/timeline.jsonl") { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl); return; }
    if (req.url === "/narabi/state.json") {
      stateHits++;
      if (stateHits === 1) { req.socket.destroy(); return; } // reset the FIRST state attempt -> the probe retries
      res.writeHead(200, { "content-type": "application/json" }); res.end(NARABI_SNAPSHOT.stateJson); return;
    }
    res.writeHead(404); res.end();
  });
  const port = await listen(server);
  try {
    // PROBE_RETRIES=0 makes a mutant GET2 (retries<-env) do ONE attempt; the real GET2 keeps STATE_RETRIES=1 => 2.
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(port)}/narabi/timeline.jsonl`, "--now", NOW], { PROBE_RETRIES: "0" });
    assert.equal(r.state.reason, null, "the real GET2 survives the first-attempt reset via its FIXED retry (a mutant with 1 attempt gives up -> state_unreachable)");
    assert.equal(r.state.status, "healthy", "coherent state read on the retried attempt -> healthy");
    assert.equal(r.state.state_checked, true, "the cross-check ran and matched on the 2nd attempt");
    assert.equal(stateHits, STATE_RETRIES + 1, `EXACTLY STATE_RETRIES+1 (${String(STATE_RETRIES + 1)}) state.json attempts, INDEPENDENT of PROBE_RETRIES=0 (a mutant binding to env makes ${String(0 + 1)})`);
    assert.equal(r.status, 0, "exit 0");
  } finally { await close(server); }
});

// T (timeout binding): pin PROBE_TIMEOUT_MS below STATE_TIMEOUT_MS and serve state.json after a delay BETWEEN the
// two. The real GET2 (timeoutMs:STATE_TIMEOUT_MS=5000, env-INDEP.) waits and reads the body -> healthy; a mutant
// (timeout<-env, shorter) aborts before the body arrives -> state_unreachable. Timing, with a ~2 s margin on each
// side; the REAL path (the one that runs in the suite) serves ONE state request with no abort. res.on("close")
// cancels any pending serve if the client aborts (the mutant path), so no write-after-abort.
const ENV_TIMEOUT_MS = 1000;       // GET2's env fallback under the mutant — strictly below STATE_TIMEOUT_MS
const STATE_SERVE_DELAY_MS = 3000; // ENV_TIMEOUT_MS < DELAY < STATE_TIMEOUT_MS: real waits it out, mutant aborts first
test("probe_state_get2_binds_state_timeout — the URL-mode state cross-check GET passes timeoutMs:STATE_TIMEOUT_MS, so its deadline is INDEPENDENT of PROBE_TIMEOUT_MS: with PROBE_TIMEOUT_MS below STATE_TIMEOUT_MS and a state.json served after a delay between the two, the real GET2 waits its fixed 5 s and reads the body -> healthy (kills the mutant dropping the timeoutMs binding: GET2 falls back to the shorter env timeout, aborts before the body -> state_unreachable)", async () => {
  assert.ok(ENV_TIMEOUT_MS < STATE_SERVE_DELAY_MS && STATE_SERVE_DELAY_MS < STATE_TIMEOUT_MS,
    `premise: env ${String(ENV_TIMEOUT_MS)}ms < serve delay ${String(STATE_SERVE_DELAY_MS)}ms < STATE_TIMEOUT_MS ${String(STATE_TIMEOUT_MS)}ms (real waits, mutant aborts)`);
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const NOW = SNAP_NOW; // the capture's last day present after the deadline => not lagging; isolates the state verdict
  const server = createServer((req, res) => {
    if (req.url === "/narabi/timeline.jsonl") { res.writeHead(200, { "content-type": "application/jsonl" }); res.end(tl); return; }
    if (req.url === "/narabi/state.json") {
      const timer = setTimeout(() => { res.writeHead(200, { "content-type": "application/json" }); res.end(NARABI_SNAPSHOT.stateJson); }, STATE_SERVE_DELAY_MS);
      res.on("close", () => { clearTimeout(timer); }); // client aborted (a mutant's shorter timeout) -> cancel the pending serve, no write-after-abort
      return;
    }
    res.writeHead(404); res.end();
  });
  const port = await listen(server);
  try {
    // PROBE_TIMEOUT_MS reaches ONLY a mutant GET2 (the real GET2 keeps STATE_TIMEOUT_MS); GET1 serves instantly regardless.
    const r = await runProbeAsync(["--url", `http://127.0.0.1:${String(port)}/narabi/timeline.jsonl`, "--now", NOW], { PROBE_TIMEOUT_MS: String(ENV_TIMEOUT_MS) });
    assert.equal(r.state.reason, null, "the real GET2 waits its FIXED STATE_TIMEOUT_MS and reads the delayed body (a mutant aborts at the shorter env timeout -> state_unreachable)");
    assert.equal(r.state.status, "healthy", "coherent state read within STATE_TIMEOUT_MS -> healthy");
    assert.equal(r.state.state_checked, true, "the cross-check ran and matched");
    assert.equal(r.status, 0, "exit 0");
  } finally { await close(server); }
});
