// test/narabi-live.test.ts — non-LLM oracle for the /narabi board (lot F-site-10, ADR-M012 D4). Runs at the
// REPO ROOT under `node --test` (the apps/site test glob is not in `npm test`; this mirrors site-honesty.test.ts).
// It imports the PURE logic (apps/site/lib/narabi-live.ts), the two committed records the page reads at build
// (apps/site/data/narabi-capture.json and narabi-served.json, through the same manifest-checked loaders as `next build`)
// and the build-time calibration loader, and binds every value the page states to its PRODUCER: the sentinel's own code
// (apps/sentinel/src/timeline.ts), the tracker (packages/hikae), the harness calibration + served gate description,
// the probe (scripts/probe-narabi.mjs) and the systemd units (deploy/). A drift between page and producer reds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { loadNarabiCapture, NARABI_CAPTURE_REL } from "../apps/site/lib/narabi-capture-load.ts";
import * as narabiLive from "../apps/site/lib/narabi-live.ts";
import {
  parseState,
  parseTimeline,
  loadNarabi,
  captureData,
  captureRef,
  captureAfterFailure,
  firstReadingLabel,
  compact18,
  regimeWord,
  isCalmRegime,
  calmPairCount,
  driftStatus,
  lagStatus,
  lagView,
  liveWord,
  codeVersions,
  codeVersionLabel,
  parameterSegments,
  projectedBoundDate,
  endpointPoolLabel,
  staticMissLabel,
  trackerMissLabel,
  sentinelBudgetLabel,
  boundThm1 as pageBoundThm1,
  trackerStepSize as pageStepSize,
  replayTracker,
  replayCheck,
  steppedScores,
  hashedFields as pageHashedFields,
  lineHashOf as pageLineHashOf,
  verifyChain,
  trackerDigestOf,
  c1Check,
  extendsCapture,
  checkIntegrity,
  recomputeRecipe,
  SERIES_MIN_STEPS,
  D8_SENTENCE,
  WHY_SEVEN,
  TRACKER_ADAPTS,
  NO_COVERAGE_MEASURED,
  STATUS_IS_A_WORD,
  HERO_DEK,
  WINDOWS_LEDE,
  DRIFT_LEDE,
  RECOMPUTE_LEDE,
  TRAJECTORY_LEDE,
  STATIC_MISS_FRAMING,
  TRACKER_MISS_FRAMING,
  SENTINEL_BUDGET_FRAMING,
  INTEGRITY_LEDE_BUILD,
  INTEGRITY_LEDE_BUILD_ONLY,
  INTEGRITY_LEDE_PENDING,
  INTEGRITY_LEDE_FAILED,
  INTEGRITY_LEDE_CAPTURE_UNREAD,
  INTEGRITY_LEDE_CAPTURE_FAILED,
  INTEGRITY_LEDE_LIVE,
  integrityLedeFor,
  stateAgreesWithLastLine,
  REREAD_DELAY_MS,
  QUORUM_CLAUSE,
  NOSCRIPT_NOTE,
  HASHES_SUMMARY,
  DRIFT_THRESHOLD,
  CALM_WINDOW,
  BOUND_TARGET,
  NARABI_ROUTE,
} from "../apps/site/lib/narabi-live.ts";
import type { NarabiState, TimelineLine, NarabiData, PublishSchedule, FetchedFile, CaptureRef } from "../apps/site/lib/narabi-live.ts";
import {
  LEVELS,
  WINDOW_STEPS,
  GATE_BODY_BEFORE,
  GATE_BODY_AFTER,
  GATE_NOTES,
  gateBody,
  NOT_LIST,
  GLOSSARY,
  FLEET_PLACE,
  VERIFY_HINT,
} from "../apps/site/lib/narabi-copy.ts";
import { loadNarabiServed, NARABI_SERVED_REL } from "../apps/site/lib/narabi-served-load.ts";
import { loadNarabiCalibration, CALIB_SCORES_REL, CALIB_PROVENANCE_REL } from "../apps/site/lib/narabi-calib-load.ts";
import { scoresSha256 } from "../packages/contracts/src/index.ts";
import { MEASURED_CLASS_CLAUSES, MEASURED_CLASS_RESERVE } from "../apps/site/lib/how-copy.ts";
import { FLEET_AGENTS } from "../apps/site/lib/fleet.ts";
import {
  boundThm1,
  projectedBoundT,
  isCalm,
  S_FLOOR,
  hashedFields as sentinelHashedFields,
  lineHashOf as sentinelLineHashOf,
  DELTA_TARGET,
  TRACKER_PARAMS,
  DRIFT_THRESHOLD as SENTINEL_DRIFT,
  CALM_WINDOW as SENTINEL_CALM,
} from "../apps/sentinel/src/timeline.ts";
import type { TimelineLine as SentinelLine } from "../apps/sentinel/src/timeline.ts";
import { PUBLIC_ENDPOINTS, makeRpcPool, QuorumDisagreementError } from "../apps/sentinel/src/rpc.ts";
import { trackerReplay, trackerDigest, trackerStepSize } from "../packages/hikae/src/index.ts";
import {
  USDE_STABLE_RUN_CALIB,
  USDE_STABLE_RUN_SCORES_SHA256_PINNED,
  USDE_STABLE_RUN_TASK_CLASS,
  USDE_STABLE_RUN_PREDICTOR_ID,
} from "../apps/harness/src/calibration.ts";
import { GATE_TOOL_DESCRIPTION, STABLE_RUN_COMMITTED_CORE } from "../apps/harness/src/tools/gate.ts";
import { buildOpenApi } from "../apps/harness/src/openapi.ts";
import { DEADLINE_UTC, expectedLastDay, dayDiff, CHAINSTACK_PROVIDERS } from "../scripts/probe-narabi.mjs";
import { scanText as scanNumericText } from "../apps/site/test/honesty-lint.ts";

const ROOT = join(import.meta.dirname, "..");
const SITE = join(ROOT, "apps", "site");
// The two committed records the page reads at build, through the SAME manifest-checked loaders: a tampered or unlisted
// file throws here exactly as it reds `next build` (narabi_committed_records_fail_closed).
const NARABI_SNAPSHOT = loadNarabiCapture(ROOT);
const NARABI_SERVED = loadNarabiServed(ROOT);

const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const nodeSha: (bytes: Uint8Array) => Promise<string> = (bytes) => Promise.resolve(createHash("sha256").update(bytes).digest("hex"));
const readComponent = (): string => readFileSync(join(SITE, "components", "narabi", "narabi-live.tsx"), "utf8");
const readPage = (): string => readFileSync(join(SITE, "app", "narabi", "page.tsx"), "utf8");
const noExempt = new Set<string>();

/** The capture's stored lines, parsed WITHOUT the site parser (as served, each endpoint URL list replaced by its
 *  count), for the producer oracles. */
function rawLines(): TimelineLine[] {
  return NARABI_SNAPSHOT.timelineJsonl
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as TimelineLine);
}
/** A capture reference built from the STORED timeline text, to exercise the byte-prefix function itself. */
const storedRef = (): CaptureRef => ({
  capturedAt: NARABI_SNAPSHOT.capturedAt,
  timelineChars: NARABI_SNAPSHOT.timelineJsonl.length,
  timelineSha256: NARABI_SNAPSHOT.timelineSha256,
});
/** Provider labels: the closed site list (decision 159) + every registrable domain of the sentinel's committed pool +
 *  the keyed operator's domains the probe recognises + the pool members the published lines have carried. */
function providerLabels(): Set<string> {
  const set = new Set(["databento", "massive", "polygon", "helius", "chainstack", "tenderly", "drpc", "p2pify", "llamarpc", "blastapi"]);
  for (const e of PUBLIC_ENDPOINTS) {
    const host = new URL(e).hostname.toLowerCase().split(".");
    const label = host[host.length - 2];
    if (label !== undefined) set.add(label);
  }
  for (const d of CHAINSTACK_PROVIDERS) set.add(d.split(".")[0] ?? d);
  return set;
}
const lastOf = <T,>(xs: readonly T[]): T => {
  const v = xs[xs.length - 1];
  assert.ok(v !== undefined, "non-empty list");
  return v;
};
const SCHEDULE: PublishSchedule = {
  on_calendar_utc: NARABI_SERVED.sentinel_timer.on_calendar_utc,
  randomized_delay_s: NARABI_SERVED.sentinel_timer.randomized_delay_s,
  deadline_utc: NARABI_SERVED.probe.deadline_utc,
};
/** No real wait in a test: the re-read delay is injected. */
const noWait = (): Promise<void> => Promise.resolve();
/** A fake same-origin reader serving the given state and timeline bodies. */
const serving = (stateText: string, timelineText: string, lastModified: string | null = null) =>
  (url: string): Promise<FetchedFile> => Promise.resolve({ text: url.endsWith("state.json") ? stateText : timelineText, lastModified });

test("narabi_live_parses_real_state_shape — the committed capture is the served files (state as served, each timeline line's endpoint URL list replaced by its count) and the real published shape (ADR-M012 D4)", () => {
  // Provenance: the stored bodies hash to the sha256 recorded at capture (state.json = what monarkgate.tech served; the
  // timeline = its projection). Mutant: flip a byte of state_json/timeline_jsonl in apps/site/data/narabi-capture.json ->
  // the loader throws on the manifest; re-hash the manifest -> it throws on the recorded sha256 (and the chain test reds).
  assert.equal(sha256(NARABI_SNAPSHOT.stateJson), NARABI_SNAPSHOT.stateSha256, "state.json bytes must hash to the recorded sha256");
  assert.equal(sha256(NARABI_SNAPSHOT.timelineJsonl), NARABI_SNAPSHOT.timelineSha256, "timeline.jsonl bytes must hash to the recorded sha256");
  assert.match(NARABI_SNAPSHOT.capturedAt, /^\d{4}-\d{2}-\d{2}$/, "the capture carries its UTC day");
  // The timeline AS SERVED at capture is recorded by sha256 + length (the stored copy drops the endpoint URLs), and the
  // capture it replaced recorded a strictly shorter served prefix (append-only; checked fail-closed when capturing, and
  // re-checked by every browser against the live file through captureRef).
  assert.match(NARABI_SNAPSHOT.served.timelineSha256, /^[0-9a-f]{64}$/, "the served timeline sha256 is recorded");
  assert.ok(NARABI_SNAPSHOT.served.timelineChars > NARABI_SNAPSHOT.timelineJsonl.length, "the served timeline is longer than the stored one (it carried the URLs)");
  const prev = NARABI_SNAPSHOT.previousCapture;
  assert.ok(prev.capturedAt < NARABI_SNAPSHOT.capturedAt, "the previous capture is older");
  assert.ok(prev.servedTimelineChars < NARABI_SNAPSHOT.served.timelineChars, "the previous served timeline is a strictly shorter prefix");
  assert.deepEqual(
    captureRef(NARABI_SNAPSHOT),
    { capturedAt: NARABI_SNAPSHOT.capturedAt, timelineChars: NARABI_SNAPSHOT.served.timelineChars, timelineSha256: NARABI_SNAPSHOT.served.timelineSha256 },
    "the browser compares the live file with the timeline AS SERVED, never with the stored copy",
  );
  // The committed source carries no URL and no provider name (decision 159; prerequisite of a provider-name vocab gate
  // on the site scope). Mutant: re-capture byte-exact (URLs kept) -> red.
  assert.ok(!NARABI_SNAPSHOT.timelineJsonl.includes("://"), "the stored timeline carries no URL");
  for (const label of providerLabels()) {
    assert.ok(!NARABI_SNAPSHOT.timelineJsonl.toLowerCase().includes(label), `the stored timeline names no provider (${label})`);
  }

  const state = parseState(NARABI_SNAPSHOT.stateJson);
  assert.equal(typeof state.tracker.q, "number");
  assert.equal(typeof state.tracker.t, "number");
  assert.equal(typeof state.tracker.q1, "number");
  for (const p of ["alpha", "c", "eps", "t0", "B"] as const) {
    assert.equal(typeof state.tracker.params[p], "number", `params.${p} must be a number`);
  }
  assert.equal(state.digest.length, 64, "digest is a sha256 hex");
  assert.equal(typeof state.projected_bound_leq_target_T, "number");
  assert.equal(typeof state.replay_q, "number");

  // Every served field is typed as the site reads it; the projection keeps all but the endpoint URLs.
  const raw = rawLines();
  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  assert.ok(lines.length >= 2, "at least the J0 window and one evaluable pair are published");
  assert.equal(lines.length, raw.length, "one parsed line per published line");
  const KEYS = [
    "day", "from_block", "to_block", "burns", "mints", "supply_close", "s_open", "c1_ok", "utterance_hash",
    "attested_flow_sha256", "v", "regime", "pair_status", "s_raw", "s", "E_tracker", "q_before", "eta", "q_after", "T",
    "mean_E_tracker", "bound_thm1", "digest_T", "E_static", "t_deg", "sum_E_static", "B_t", "rolling90_calm_miss",
    "drift_flag", "prev_line_hash", "line_hash", "endpoints_count", "node_version", "sentinel_sha",
  ];
  raw.forEach((r, i) => {
    assert.deepEqual(Object.keys(r).sort(), [...KEYS].sort(), `line ${String(i)} carries exactly the published fields`);
    const p = lines[i];
    assert.ok(p, "parsed line present");
    assert.ok(!("endpoints" in p), "the parsed line never keeps the endpoint URLs");
    assert.equal(p.endpoints_count, r.endpoints_count, "only the endpoint COUNT survives");
    assert.ok(p.endpoints_count !== null && Number.isInteger(p.endpoints_count) && p.endpoints_count >= 2, "a pool of at least two endpoints (the quorum needs two providers)");
    assert.ok(["evaluable", "non_evaluable", "clipped"].includes(p.pair_status), "pair_status is a known word");
    assert.equal(p.line_hash.length, 64, "line_hash is a sha256 hex");
  });
  // T is read, never typed: the tracker stepped once per line that carries a score.
  assert.equal(state.tracker.t, steppedScores(lines).length, "state.tracker.t = number of stepped lines");
  assert.equal(state.tracker.t, lastOf(lines).T, "state.tracker.t = the last line's T");
});

test("narabi_live_bound_formula_matches_timeline_ts — the printed horizon, the ported bound and every published bound equal the sentinel formula (ABB Thm 1)", () => {
  const state = parseState(NARABI_SNAPSHOT.stateJson);
  const T = state.projected_bound_leq_target_T;
  assert.equal(projectedBoundT(DELTA_TARGET), T, "state.json projected T must equal the sentinel formula output");
  assert.ok(boundThm1(T) <= DELTA_TARGET, "the bound at T is at or below the target");
  assert.ok(boundThm1(T - 1) > DELTA_TARGET, "the bound at T-1 is still above the target");
  assert.equal(BOUND_TARGET, DELTA_TARGET, "BOUND_TARGET must equal the sentinel DELTA_TARGET");
  assert.equal(DRIFT_THRESHOLD, SENTINEL_DRIFT, "DRIFT_THRESHOLD must equal the sentinel value");
  assert.equal(CALM_WINDOW, SENTINEL_CALM, "CALM_WINDOW must equal the sentinel value");
  assert.equal(state.tracker.params.c, TRACKER_PARAMS.c, "c is the pre-registered param");
  assert.equal(state.tracker.params.B, TRACKER_PARAMS.B, "B is the pre-registered param");
  assert.equal(state.tracker.params.eps, TRACKER_PARAMS.eps, "eps is the pre-registered param");
  assert.equal(state.tracker.params.c, state.tracker.params.B, "the page prints 'c = B' — c must equal B");
  // The page's PORTS equal the producers bit for bit (same engine): step size and bound, over the whole horizon.
  for (let t = 0; t < T + 5; t++) {
    assert.equal(pageStepSize(t, state.tracker.params), trackerStepSize(t, TRACKER_PARAMS), `trackerStepSize port at t=${String(t)}`);
    if (t >= 1) assert.equal(pageBoundThm1(t, state.tracker.params), boundThm1(t), `boundThm1 port at T=${String(t)}`);
  }
  // Every PUBLISHED bound_thm1 is the Theorem 1 bound at its T (served data, not a typed value).
  for (const l of parseTimeline(NARABI_SNAPSHOT.timelineJsonl)) {
    if (l.bound_thm1 === null) continue;
    assert.equal(l.bound_thm1, boundThm1(l.T), `published bound_thm1 of ${l.day} equals the sentinel formula`);
  }
});

test("narabi_live_t_geq_7_explanation_present — the T>=7 rationale renders, digit-free, as a JSX child; every framing const is digit-free and rendered", () => {
  for (const needle of ["seven", "one week", "series", "replay", "recompute"]) {
    assert.ok(WHY_SEVEN.toLowerCase().includes(needle), `WHY_SEVEN must mention "${needle}"`);
  }
  assert.match(TRACKER_ADAPTS, /tracker adapts/i);
  assert.match(TRACKER_ADAPTS, /gate does not yet/i);
  assert.match(NO_COVERAGE_MEASURED, /no coverage is measured/i);
  const digitFree: Record<string, string> = {
    WHY_SEVEN, TRACKER_ADAPTS, NO_COVERAGE_MEASURED, STATUS_IS_A_WORD, HERO_DEK, WINDOWS_LEDE, DRIFT_LEDE, RECOMPUTE_LEDE,
    TRAJECTORY_LEDE, STATIC_MISS_FRAMING, TRACKER_MISS_FRAMING, SENTINEL_BUDGET_FRAMING, INTEGRITY_LEDE_BUILD, INTEGRITY_LEDE_BUILD_ONLY, INTEGRITY_LEDE_PENDING,
    INTEGRITY_LEDE_FAILED, INTEGRITY_LEDE_CAPTURE_UNREAD, INTEGRITY_LEDE_CAPTURE_FAILED, INTEGRITY_LEDE_LIVE, NOSCRIPT_NOTE, HASHES_SUMMARY,
  };
  for (const [name, copy] of Object.entries(digitFree)) {
    assert.deepEqual(scanNumericText(copy, noExempt), [], `${name} must be digit-free`);
  }
  // CARRIER: each const is actually rendered in the component (never dead copy). Mutant: delete one -> red.
  const comp = readComponent();
  for (const id of ["WHY_SEVEN", "TRACKER_ADAPTS", "NO_COVERAGE_MEASURED", "STATUS_IS_A_WORD", "HERO_DEK", "HASHES_SUMMARY", "NOSCRIPT_NOTE", "integrityLede"]) {
    assert.ok(comp.includes("{" + id + "}"), `${id} must render as a JSX child {${id}} in narabi-live.tsx`);
  }
  for (const id of ["WINDOWS_LEDE", "DRIFT_LEDE", "RECOMPUTE_LEDE", "TRAJECTORY_LEDE"]) {
    assert.ok(comp.includes("lede={" + id + "}"), `${id} must render as a card lede`);
  }
  // The integrity lede is the pure integrityLedeFor over what the component knows (were the checks computed on the data
  // shown, where, did they fail); its behaviour in every state is pinned by narabi_integrity_lede_says_what_was_checked.
  // A reader without scripts is told the page shows the capture only.
  assert.ok(
    comp.includes("integrityLedeFor({ onShownData: checked.on === data, where: checked.where, failed: integrityError !== null }, data)"),
    "the integrity lede is integrityLedeFor over the shown data, where the checks ran and whether they failed",
  );
  assert.ok(/<noscript>\s*<p[^>]*>\{NOSCRIPT_NOTE\}<\/p>\s*<\/noscript>/.test(comp), "the no-script note renders inside <noscript>");
  assert.ok(readPage().includes("checkIntegrity(initial, buildSha256)"), "the server recomputes the capture checks at build");
});

test("narabi_live_d8_byte_identical — D8_SENTENCE equals test/ci-gates.test.ts byte for byte (ADR-M012 D8)", () => {
  const ci = readFileSync(join(ROOT, "test", "ci-gates.test.ts"), "utf8");
  const start = ci.indexOf("const D8_SENTENCE =");
  assert.ok(start >= 0, "ci-gates.test.ts must declare const D8_SENTENCE");
  const end = ci.indexOf("const MUTANTS", start);
  assert.ok(end > start, "`const MUTANTS` must follow the D8_SENTENCE declaration in ci-gates.test.ts");
  const segs = ci.slice(start, end).match(/"([^"]*)"/g);
  assert.ok(segs, "D8_SENTENCE must be one or more quoted string segments");
  const reconstructed = segs.map((s) => s.slice(1, -1)).join("");
  assert.equal(D8_SENTENCE, reconstructed, "narabi-live D8_SENTENCE must be byte-identical to the ci-gates copy");
  assert.ok(readComponent().includes("{D8_SENTENCE}"), "the D8 sentence must render as {D8_SENTENCE}");
});

test("narabi_live_snapshot_badge_when_fetch_fails — a failed live read keeps the committed capture, DECLARED; a good one reads Last-Modified", async () => {
  const initial = captureData(NARABI_SNAPSHOT);
  assert.equal(initial.sourceKind, "capture", "first paint is the committed capture");
  assert.ok(initial.source.includes(NARABI_SNAPSHOT.capturedAt), "the capture source line carries the capture day");
  assert.match(initial.source, /committed capture/i, "the source SAYS it is the committed capture");

  const failing = (url: string): Promise<FetchedFile> => Promise.reject(new Error("read blocked " + url));
  await assert.rejects(
    loadNarabi({ fetchFile: failing, capture: captureRef(NARABI_SNAPSHOT), sha256Hex: nodeSha, sleep: noWait }),
    /read blocked/,
    "loadNarabi throws (after its one re-read); the caller keeps the capture",
  );
  const after = captureAfterFailure(initial, NARABI_SNAPSHOT.capturedAt, new Error("read blocked"));
  assert.equal(after.sourceKind, "capture");
  assert.match(after.source, /failed/i, "after a failed read the source line says so (never a silent substitution)");
  assert.equal(after.liveError, "read blocked", "the live read error is recorded");

  // A working same-origin read yields the live source and the Last-Modified instants. Mutant: drop the header read
  // in loadNarabi -> publishedAt null -> red.
  const at = new Date("2026-09-24T01:45:05Z");
  const LM = "Thu, 24 Sep 2026 00:52:37 GMT";
  const good = (url: string): Promise<FetchedFile> =>
    Promise.resolve({ text: url.endsWith("state.json") ? NARABI_SNAPSHOT.stateJson : NARABI_SNAPSHOT.timelineJsonl, lastModified: LM });
  const live = await loadNarabi({ fetchFile: good, now: at, capture: captureRef(NARABI_SNAPSHOT), sha256Hex: nodeSha, sleep: noWait });
  assert.equal(live.sourceKind, "live", "a successful fetch is labelled live");
  assert.equal(live.liveError, null, "no live error on success");
  assert.equal(live.readAt, at.toISOString(), "the read instant is recorded");
  assert.equal(live.publishedAt.timeline, new Date(Date.parse(LM)).toISOString(), "published at = the served Last-Modified");
  assert.equal(live.publishedAt.state, new Date(Date.parse(LM)).toISOString());
  const noHeader = await loadNarabi({
    fetchFile: (u) => good(u).then((f) => ({ ...f, lastModified: null })),
    now: at,
    capture: captureRef(NARABI_SNAPSHOT),
    sha256Hex: nodeSha,
    sleep: noWait,
  });
  assert.equal(noHeader.publishedAt.timeline, null, "no header -> no invented instant");
  const comp = readComponent();
  assert.ok(comp.includes('res.headers.get("last-modified")'), "the browser fetcher reads the Last-Modified header");
  assert.ok(comp.includes('k="published at"'), "the register renders the published-at fact");
});

test("narabi_live_route_not_shadowed_by_caddy — /narabi reaches Next; the static files are served by Caddy", () => {
  const snippet = readFileSync(join(ROOT, "deploy", "Caddyfile.monark-narabi.snippet"), "utf8");
  const matchers = [...snippet.matchAll(/handle_path\s+(\S+)/g)]
    .map((m) => m[1])
    .filter((s): s is string => s !== undefined);
  assert.ok(matchers.length >= 1, "the snippet must declare at least one handle_path matcher");
  // Caddy path-matcher semantics (caddyserver.com/docs/caddyfile/matchers, path — read 2026-09-18 [lu]):
  // "`/foo/*` will not match `/foo`"; "Path matching is an exact match by default"; matches are case-insensitive.
  const shadowed = (route: string, matcher: string): boolean => {
    const r = route.toLowerCase();
    const m = matcher.toLowerCase();
    if (m.endsWith("/*")) return r.startsWith(m.slice(0, -1));
    if (m.endsWith("*")) return r.startsWith(m.slice(0, -1));
    return r === m;
  };
  for (const m of matchers) {
    assert.equal(shadowed(NARABI_ROUTE, m), false, `${NARABI_ROUTE} must not be shadowed by ${m}`);
  }
  assert.ok(matchers.some((m) => shadowed("/narabi/state.json", m)), "Caddy must serve /narabi/state.json");
  assert.ok(matchers.some((m) => shadowed("/narabi/timeline.jsonl", m)), "Caddy must serve /narabi/timeline.jsonl");
  assert.equal(shadowed("/narabi/live", "/narabi/*"), true, "a /narabi/live route would be shadowed by the file_server");
});

test("narabi_first_reading_label_reads_committed_t — the hero pill reads N from the committed state (ruling C-3/C-5/Q-8b)", () => {
  const base = parseState(NARABI_SNAPSHOT.stateJson);
  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  const narabi = FLEET_AGENTS.find((a) => a.name === "Narabi");
  assert.ok(narabi, "the fleet register must carry a Narabi agent");
  const statusWord = narabi.status;
  assert.equal(statusWord, "built", "Narabi is built in the frozen register (D-51/D-123)");

  const at = (t: number): NarabiState => ({ ...base, tracker: { ...base.tracker, t } });
  const first = lines[0];
  assert.ok(first, "the committed timeline has at least one window");
  const nineWindows: TimelineLine[] = Array.from({ length: 9 }, () => first);
  const stepLabel = (t: number): string => `${statusWord} · step ${String(t)} of ${String(SERIES_MIN_STEPS)} before first reading`;
  const publishedLabel = (n: number): string => `${statusWord} · ${String(n)} windows published`;

  // The committed capture's own label, N READ from its bytes (whichever side of the horizon it sits on).
  const t = base.tracker.t;
  assert.equal(firstReadingLabel(base, lines), t < SERIES_MIN_STEPS ? stepLabel(t) : publishedLabel(lines.length), "the capture's pill reads t and lines.length");
  assert.equal(firstReadingLabel(at(1), lines), stepLabel(1), "t=1: step 1 of 7");
  assert.equal(firstReadingLabel(at(6), lines), stepLabel(6), "t=6: step 6 of 7 (a typed literal N would red here)");
  assert.equal(firstReadingLabel(at(SERIES_MIN_STEPS), lines), publishedLabel(lines.length), "t=7: switches to N windows published (N = lines.length)");
  assert.equal(firstReadingLabel(at(SERIES_MIN_STEPS), nineWindows), publishedLabel(9), "t=7: N follows lines.length, not a typed literal");
  assert.equal(firstReadingLabel(at(SERIES_MIN_STEPS + 1), lines), publishedLabel(lines.length), "past the horizon stays on the published-windows label");
  for (const s of [base, at(6), at(SERIES_MIN_STEPS)]) {
    const label = firstReadingLabel(s, lines);
    assert.equal(label.split(" · ")[0], statusWord, "the pill status word must equal the frozen fleet register status (Q-8b)");
    assert.ok(!/shipped/i.test(label), "the pill never says 'shipped' (ruling Q-8b)");
    assert.ok(!/\bday\s+\d/i.test(label), "the pill never says 'day N' (M-15: the first published window was not evaluable)");
  }
  assert.ok(readComponent().includes("{firstReadingLabel("), "narabi-live.tsx must render {firstReadingLabel(state, lines)} in the hero");
});

test("narabi_first_reading_label_single_source_of_seven — the week length is SERIES_MIN_STEPS alone (ruling C-5, M-17)", () => {
  const src = readFileSync(join(SITE, "lib", "narabi-live.ts"), "utf8");
  const start = src.indexOf("export function firstReadingLabel");
  assert.ok(start >= 0, "narabi-live.ts must export firstReadingLabel");
  const nextExport = src.indexOf("\nexport ", start + 1);
  const body = nextExport > start ? src.slice(start, nextExport) : src.slice(start);
  assert.ok(body.includes("SERIES_MIN_STEPS"), "firstReadingLabel must derive the week length from SERIES_MIN_STEPS");
  assert.ok(!/\b7\b/.test(body), "firstReadingLabel must not hard-code the digit 7 (single source, C-5)");
  const sevenConsts = src.match(/\bconst\s+[A-Za-z_$][\w$]*\s*=\s*7\b/g) ?? [];
  assert.deepEqual(sevenConsts, ["const SERIES_MIN_STEPS = 7"], "exactly one const is bound to 7: SERIES_MIN_STEPS");
  assert.equal((src.match(/\bconst\s+WINDOW_BEFORE_FIRST_READING\b/g) ?? []).length, 0, "no WINDOW_BEFORE_FIRST_READING duplicate constant (C-5, M-17)");
});

test("narabi_glossary_under_calib_generic_digit_free — the glossary defines under_calib, generic + digit-free (ruling C-11, M-23)", () => {
  const entry = GLOSSARY.find((g) => g.term === "under_calib");
  assert.ok(entry, "GLOSSARY must define under_calib");
  assert.deepEqual(scanNumericText(entry.def, noExempt), [], "the under_calib def must be digit-free");
  assert.ok(!/stratum/i.test(entry.def), "the under_calib def must be generic, never the Ukemi 'stratum' vocabulary");
  assert.ok(/calib/i.test(entry.def), "the def must speak of calibration");
  assert.ok(/abstain|withheld|withhold|no region|serving no/i.test(entry.def), "the def must state the withheld/abstained region");
  assert.ok(readComponent().includes("{g.def}"), "narabi-live.tsx must render each glossary def as {g.def}");
});

test("narabi_icon_static_public_local — the /narabi favicon is a static public asset, adaptive, loads nothing remote (ruling D-2)", () => {
  const svg = readFileSync(join(SITE, "public", "icons", "narabi.svg"), "utf8");
  assert.match(svg, /@media\s*\(prefers-color-scheme/i, "the favicon must be adaptive (@media prefers-color-scheme)");
  assert.ok(!/url\(\s*["']?https?:/i.test(svg), "no CSS url(http…) load");
  assert.ok(!/@import/i.test(svg), "no @import");
  assert.ok(!/<image\b/i.test(svg), "no <image> raster load");
  assert.ok(!/(?:href|src|xlink:href)\s*=\s*["']?https?:/i.test(svg), "no remote href/src/xlink:href");
  const httpHits = svg.match(/https?:\/\/[^"'\s>]+/g) ?? [];
  assert.deepEqual(httpHits, ["http://www.w3.org/2000/svg"], "the only URI is the SVG xmlns namespace, not a remote load");
});

test("narabi_icon_declared_not_under_narabi_path — the /narabi favicon is declared as a public path OUTSIDE /narabi/* (ruling D-2)", () => {
  const shadowed = (route: string, matcher: string): boolean => {
    const r = route.toLowerCase();
    const m = matcher.toLowerCase();
    if (m.endsWith("/*")) return r.startsWith(m.slice(0, -1));
    if (m.endsWith("*")) return r.startsWith(m.slice(0, -1));
    return r === m;
  };
  assert.ok(!existsSync(join(SITE, "app", "narabi", "icon.svg")), "app/narabi/icon.svg must be removed (it would be shadowed at /narabi/icon.svg)");
  const page = readPage();
  const iconsAt = page.indexOf("icons:");
  assert.ok(iconsAt >= 0, "the /narabi metadata must declare icons");
  const hrefMatch = page.slice(iconsAt).match(/["']([^"']*\.svg)["']/);
  assert.ok(hrefMatch, "the /narabi metadata icons must declare an .svg href");
  const href = hrefMatch[1];
  assert.ok(href, "the icons href capture is non-empty");
  assert.equal(href, "/icons/narabi.svg", "the declared favicon is the static public path /icons/narabi.svg");
  assert.equal(shadowed(href, "/narabi/*"), false, "the favicon path must NOT be under /narabi/* (Caddy would 404 it)");
  assert.ok(existsSync(join(SITE, "public", href.replace(/^\//, ""))), `the declared favicon must exist as a public asset (${href})`);
});

// ── decision 159: no data-provider name, no endpoint URL, on any surface the board builds ──────────────────────
test("narabi_live_renders_no_endpoint_url — the parser drops the endpoint URLs; nothing the board, its server props or the browser's state carry names a provider", async () => {
  const raw = rawLines();
  const providers = providerLabels();
  assert.ok(providers.size > 10, "the sentinel's committed pool extends the closed provider list (false green otherwise)");
  const leaks = (s: string): string[] => {
    const low = s.toLowerCase();
    const hits = [...providers].filter((p) => new RegExp(`\\b${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(low));
    if (low.includes("://")) hits.push("://");
    return hits;
  };

  const data = captureData(NARABI_SNAPSHOT);
  const state = data.state;
  const lines = data.lines;
  // (a) The server props (what Next serialises into the HTML/RSC payload) carry no URL and no provider name.
  assert.deepEqual(leaks(JSON.stringify(data)), [], "captureData (the server props) must carry no endpoint URL or provider name");
  assert.deepEqual(leaks(JSON.stringify(captureRef(NARABI_SNAPSHOT))), [], "captureRef carries only length, sha256 and day");
  // (b) Every register string the lib builds.
  const built: string[] = [
    endpointPoolLabel(lastOf(lines)),
    ...codeVersions(lines).map(codeVersionLabel),
    lagStatus(lines, new Date("2026-09-30T12:00:00Z"), SCHEDULE).text,
    lagStatus(lines, new Date("2026-09-24T02:00:00Z"), SCHEDULE).text,
    lagView(data, SCHEDULE).text,
    liveWord(data, null),
    recomputeRecipe(state, lines),
    data.source,
  ];
  for (const s of built) assert.deepEqual(leaks(s), [], `a register string names a provider or a URL: ${s}`);
  assert.equal(endpointPoolLabel(lastOf(lines)), `${String(lastOf(raw).endpoints_count)} RPC endpoints in the read pool; ${QUORUM_CLAUSE}`, "the pool is said as a count read from the file");
  // A LIVE served line carries the URL list: the parser keeps only its length. Mutant: keep `endpoints` -> red.
  const liveLine = JSON.stringify({ ...lastOf(raw), endpoints_count: undefined, endpoints: [...PUBLIC_ENDPOINTS] });
  const parsedLive = parseTimeline(liveLine);
  assert.equal(parsedLive.length, 1);
  assert.ok(parsedLive[0] && !("endpoints" in parsedLive[0]), "a served line loses its URL list at parse time");
  assert.equal(parsedLive[0]?.endpoints_count, PUBLIC_ENDPOINTS.length, "and keeps its count");
  assert.deepEqual(leaks(JSON.stringify(parsedLive)), [], "nothing of a parsed live line names a provider");
  // A line with no endpoint list, or a malformed one, keeps null and the register prints a dash — never an invented 0
  // under "every read needs two providers" (mutant: default the count to 0 -> red).
  const bare: Record<string, unknown> = { ...lastOf(raw) };
  delete bare.endpoints_count;
  const noList = parseTimeline(JSON.stringify(bare))[0];
  assert.equal(noList?.endpoints_count, null, "a line with no endpoint list keeps null");
  assert.equal(endpointPoolLabel(noList), "—", "and the register prints a dash");
  assert.equal(parseTimeline(JSON.stringify({ ...bare, endpoints: "not a list" }))[0]?.endpoints_count, null, "a malformed list keeps null");
  // The browser's state holds no served body: loadNarabi answers the byte-prefix question when it reads and keeps only
  // the yes/no. Mutant: keep the timeline body in NarabiData -> the URLs reach the client state -> red.
  const servedBody = raw.map((r) => JSON.stringify({ ...r, endpoints_count: undefined, endpoints: [...PUBLIC_ENDPOINTS] })).join("\n") + "\n";
  assert.ok(servedBody.includes("://"), "premise: the served body carries the URLs");
  const liveRead = await loadNarabi({ fetchFile: serving(NARABI_SNAPSHOT.stateJson, servedBody), capture: captureRef(NARABI_SNAPSHOT), sha256Hex: nodeSha, sleep: noWait });
  assert.deepEqual(leaks(JSON.stringify(liveRead)), [], "the data loadNarabi returns (the browser's state) carries no URL and no provider name");
  assert.ok(!("timelineText" in liveRead), "no served body is kept");
  // (c) The union helper is gone and the component never reads the list. Mutant: reintroduce endpointsUnion
  // (in the lib or the component) -> red.
  assert.ok(!("endpointsUnion" in narabiLive), "lib/narabi-live.ts must not export endpointsUnion");
  const comp = readComponent();
  assert.ok(!comp.includes("endpointsUnion"), "the component must not call endpointsUnion");
  assert.ok(!/\.endpoints\b(?!_count)/.test(comp), "the component must not read a line's endpoints list");
  assert.ok(comp.includes("{endpointPoolLabel(") || comp.includes("v={endpointPoolLabel("), "the register renders the pool as a count");
  // (d) The capture stays on the server: the client component imports no loader (a type import is erased), it only
  // gets the parsed props.
  assert.ok(!/narabi-capture-load|narabi-calib-load|narabi-served-load/.test(comp.replace(/^import type[^;]*;$/gm, "")), "the client component imports no loader (a type import is erased)");
  assert.ok(/loadNarabiCapture\(/.test(readPage()), "the server page reads the capture through its loader");
});

// ── the gate card: size + digest derived at build, class + key bound to the served description ────────────────
// killer: apps/site/lib/harness-served-load.ts:192 CONST "!existsSync(join(root, HARNESS_PENDING_REL))" -> "true"
test("narabi_gate_facts_read_from_committed_sources — n_calib and scores_sha256 are derived from the sha-pinned fixture; class and key equal the served gate description", async () => {
  const calib = loadNarabiCalibration(ROOT);
  assert.equal(calib.nCalib, USDE_STABLE_RUN_CALIB.length, "n_calib = the harness's committed calibration length");
  // Contract 1.1.0 (Q-M6): the page shows the digest the served verdict carries, scores_sha256 in the committed order, never the
  // 1.0.0 sorted digest; the loader keeps no field of that name.
  assert.equal("calibDigest" in calib, false, "the loader no longer derives the 1.0.0 sorted digest");
  assert.equal(calib.scoresSha256, USDE_STABLE_RUN_SCORES_SHA256_PINNED, "scores_sha256 = the harness's pinned wire digest");
  assert.notEqual(calib.scoresSha256, scoresSha256([...USDE_STABLE_RUN_CALIB].sort((a, b) => a - b)), "the committed order, not the sorted one");
  // The port equals the producer of the contract on the committed scores and on the −0/+0 and order edge cases.
  const port = (await import("../apps/site/lib/narabi-calib-load.ts") as Record<string, unknown>).scoresSha256Of;
  assert.equal(typeof port, "function", "the loader exports its scores_sha256 port");
  const portOf = port as (xs: readonly number[]) => string;
  for (const xs of [USDE_STABLE_RUN_CALIB, [0, -0], [-0, 0], [1, 0], [3, 1, 2], [1e-9, 5e-7], [1e21, 1e-7]]) {
    assert.equal(portOf(xs), scoresSha256(xs), `scores_sha256 port = producer on ${JSON.stringify(xs).slice(0, 40)}`);
  }
  // Fail-closed: a tampered fixture or a missing pin reds the build (loader throws).
  const tmp = mkdtempSync(join(tmpdir(), "narabi-calib-"));
  try {
    mkdirSync(join(tmp, "fixtures"), { recursive: true });
    const scores = readFileSync(join(ROOT, CALIB_SCORES_REL), "utf8");
    const prov = readFileSync(join(ROOT, CALIB_PROVENANCE_REL), "utf8");
    writeFileSync(join(tmp, CALIB_SCORES_REL), scores.replace(/^\[0,/, "[1,"));
    writeFileSync(join(tmp, CALIB_PROVENANCE_REL), prov);
    assert.throws(() => loadNarabiCalibration(tmp), /sha256 mismatch/, "a tampered score fixture must throw");
    writeFileSync(join(tmp, CALIB_SCORES_REL), scores);
    writeFileSync(join(tmp, CALIB_PROVENANCE_REL), prov.split("\n").filter((l) => !l.includes("`" + CALIB_SCORES_REL + "`")).join("\n"));
    assert.throws(() => loadNarabiCalibration(tmp), /no sha256 pin/, "a missing provenance pin must throw");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  // Class + key: equal to the harness's committed key AND present in the SERVED description. The served
  // /openapi.json is the generator's compact JSON: its sha256 equals the value the committed deployment conformity
  // record holds for the served document (docs/deploy-CA-harness.json, check "openapi"); while a pending snapshot exists
  // (SERVED-PENDING-1, time (i) to (ii) of a block that changes a served surface), the in-process sha256 it carries instead.
  assert.equal(NARABI_SERVED.gate.task_class, USDE_STABLE_RUN_TASK_CLASS, "task_class = the committed calibration class");
  assert.equal(NARABI_SERVED.gate.predictor_id, USDE_STABLE_RUN_PREDICTOR_ID, "predictor_id = the committed calibration key");
  assert.ok(GATE_TOOL_DESCRIPTION.includes(`For '${NARABI_SERVED.gate.task_class}'`), "the served gate description names the class");
  assert.ok(GATE_TOOL_DESCRIPTION.includes(`(key ${NARABI_SERVED.gate.predictor_id})`), "the served gate description names the key");
  const { loadHarnessPending } = await import("../apps/site/lib/harness-served-load.ts");
  assert.equal(typeof loadHarnessPending, "function", "the openapi check follows the pending snapshot when one exists");
  const pending = loadHarnessPending(ROOT);
  const openapi = JSON.stringify(buildOpenApi());
  const ca = JSON.parse(readFileSync(join(ROOT, "docs", "deploy-CA-harness.json"), "utf8")) as { checks: { name: string; sha256: string }[] };
  const servedOpenapi = ca.checks.find((c) => c.name === "openapi");
  assert.ok(servedOpenapi, "the deployment conformity record carries the served openapi check");
  if (pending === null) assert.equal(sha256(openapi), servedOpenapi.sha256, "the committed generator reproduces the served /openapi.json byte for byte (CA record)");
  else assert.equal(sha256(openapi), pending.openapi_sha256, "the committed generator reproduces the pending snapshot's /openapi.json (the served one is older until time (ii))");
  assert.ok(openapi.includes(NARABI_SERVED.gate.task_class) && openapi.includes(NARABI_SERVED.gate.predictor_id), "the served document carries class and key");
  assert.equal(NARABI_SERVED.gate.openapi_sha256, servedOpenapi.sha256, "the committed record was read from the served document the deployment record pins");

  // Copy: digit-free everywhere (the size is spliced, never typed). Mutant: type "613" back into narabi-copy -> red.
  const copyStrings: string[] = [
    GATE_BODY_BEFORE, GATE_BODY_AFTER, ...Object.values(GATE_NOTES), FLEET_PLACE, VERIFY_HINT, ...NOT_LIST, ...WINDOW_STEPS,
    ...LEVELS.flatMap((l) => [l.name, l.claim, l.detail]), ...GLOSSARY.map((g) => g.def),
  ];
  for (const s of copyStrings) assert.deepEqual(scanNumericText(s, noExempt), [], `narabi-copy string carries a digit: ${s}`);
  assert.equal(gateBody(String(calib.nCalib)), `${GATE_BODY_BEFORE} ${String(calib.nCalib)} ${GATE_BODY_AFTER}`, "the lede splices the derived size");
  // CARRIERS: the component renders the served/derived values, never a literal.
  const comp = readComponent();
  for (const carrier of ["v={served.gate.task_class}", "v={served.gate.predictor_id}", "v={String(calibration.nCalib)}", "v={shortHash(calibration.scoresSha256, 8)}", "lede={gateBody(String(calibration.nCalib))}"]) {
    assert.ok(comp.includes(carrier), `the gate card must render ${carrier}`);
  }
  assert.ok(/loadNarabiCalibration\(/.test(readPage()), "the server page derives the calibration at build");
  assert.ok(/loadNarabiServed\(/.test(readPage()), "the server page reads the served facts through their loader");
});

// ── E_static / sum_E_static, mean_E_tracker, B_t: shown, read, and framed ──────────────────────────────────────
test("narabi_static_misses_read_and_framed — static misses, tracker-miss share and the sentinel budget are read from the last line and rendered WITH their framing", () => {
  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  const last = lastOf(lines);
  const rawLast = lastOf(rawLines());
  assert.equal(staticMissLabel(last), `${String(rawLast.sum_E_static)} of ${String(rawLast.T)} stepped pairs`, "static misses read from the served line");
  // T counts every STEPPED pair, clipped ones included (apps/sentinel/src/timeline.ts step: didStep, pair_status
  // "clipped" when s_raw > B), so the page never calls them all evaluable (mutant: 'evaluable pairs' -> red).
  assert.ok(!/evaluable pairs/.test(staticMissLabel(last)), "never 'N of T evaluable pairs'");
  assert.match(GLOSSARY.find((g) => g.term === "T")?.def ?? "", /evaluable or clipped/, "the glossary's T counts clipped pairs too");
  assert.ok(readComponent().includes('note="pairs stepped so far, evaluable or clipped"'), "the T fact says the same");
  assert.equal(trackerMissLabel(last), `${(rawLast.mean_E_tracker ?? Number.NaN).toFixed(4)} over T = ${String(rawLast.T)}`, "tracker-miss share read from the served line");
  assert.equal(sentinelBudgetLabel(last), `${String(rawLast.B_t)} with t_deg = ${String(rawLast.t_deg)} labels arrived`, "B_t and t_deg read from the served line");
  // A negative B_t is printed as it is (mutant: clamp to 0 -> red).
  assert.equal(sentinelBudgetLabel({ ...last, B_t: -0.1, t_deg: 5 }), "-0.1 with t_deg = 5 labels arrived");
  // Framings carry their meaning.
  assert.match(STATIC_MISS_FRAMING, /q₁/);
  assert.match(STATIC_MISS_FRAMING, /says nothing about coverage/);
  assert.match(TRACKER_MISS_FRAMING, /not a coverage and not a probability/);
  assert.match(SENTINEL_BUDGET_FRAMING, /neither the budget a gate caller carries nor the MONARK authorization budget/);
  // CO-PRESENCE: each value renders in the SAME Fact as its framing (mutant: drop the note -> red).
  const comp = readComponent();
  assert.ok(/<Fact k="static misses so far" v=\{staticMissLabel\(last\)\} note=\{STATIC_MISS_FRAMING\}/.test(comp), "static misses + framing co-present");
  assert.ok(/<Fact k="share of tracker misses so far" v=\{trackerMissLabel\(last\)\} note=\{TRACKER_MISS_FRAMING\}/.test(comp), "tracker-miss share + framing co-present");
  assert.ok(/<Fact k="sentinel's informational static budget \(field B_t\)" v=\{sentinelBudgetLabel\(last\)\} note=\{SENTINEL_BUDGET_FRAMING\}/.test(comp), "B_t + distinct label + framing co-present");
  // Per-row words for the two misses (E_static, E_tracker) and the served columns s, q before/after, η, bound.
  for (const carrier of ["{missWord(l.E_static)}", "{missWord(l.E_tracker)}", "{sci(l.s, 4)}", "{sci(l.q_before, 4)}", "{sci(l.eta, 4)}", "{sci(l.q_after, 4)}", "{fixed(l.bound_thm1, 4)}", "{clippedNote(l)}"]) {
    assert.ok(comp.includes(carrier), `the trajectory table must render ${carrier}`);
  }
  for (const carrier of ["{compact18(l.s_open)}", "{c1Word(l.c1_ok)}", "{fmtNum(l.T)}"]) {
    assert.ok(comp.includes(carrier), `the windows table must render ${carrier}`);
  }
  for (const carrier of ["{shortHash(l.utterance_hash, 6)}", "{shortHash(l.attested_flow_sha256, 6)}", "{shortHash(l.digest_T, 6)}", "{shortHash(l.prev_line_hash, 6)}", "{shortHash(l.line_hash, 6)}"]) {
    assert.ok(comp.includes(carrier), `the hashes row must render ${carrier}`);
  }
});

test("narabi_tracker_state_carriers — every Tracker-state / bound fact renders as a read of state.json, never a literal", () => {
  // Mutant: replace any read below by a typed value (e.g. v="1.372794e-2") -> the carrier is gone -> red.
  const comp = readComponent();
  for (const carrier of [
    "v={sci(state.tracker.q, 6)}",
    "v={sci(state.tracker.q1, 6)}",
    "v={fmtNum(state.tracker.t)}",
    "{fmtNum(state.projected_bound_leq_target_T)}",
    "{unitFraction(params.c)}",
    "{fmtNum(params.eps)}",
    "{fmtNum(params.alpha)}",
    "v={shortHash(state.digest, 8)}",
    "v={boundValue}",
    "v={paramList}",
    "v={replay.text}",
    "v={c1Label(c1)}",
  ]) {
    assert.ok(comp.includes(carrier), `the board must render ${carrier}`);
  }
  // The rendered bound is the LAST line's served bound_thm1 (not recomputed, not typed).
  assert.ok(comp.includes("fixed(last.bound_thm1, 4)"), "bound_thm1 is read from the last served line");
});

test("narabi_sentinel_budget_never_on_token —/token imports nothing Narabi; the timeline's B_t lives on /narabi only, under its distinct label", () => {
  const tokenFiles = [join(SITE, "app", "token", "page.tsx"), ...readdirSync(join(SITE, "components", "token")).map((f) => join(SITE, "components", "token", f))];
  for (const f of tokenFiles) {
    const src = readFileSync(f, "utf8");
    assert.ok(!/narabi/i.test(src), `${f} must not import or mention the Narabi surface (the timeline's B_t is not the token's)`);
  }
  assert.ok(!/k="B_t"/.test(readComponent()), "the component never labels the sentinel field with the bare token-page name B_t");
});

test("narabi_compact18_rounds_half_up — burns/mints/supply are rounded half-up in exact integers, never truncated", () => {
  // Oracle values = served lines of the capture (by day) + hand-checked half-up results; a truncating mutant prints
  // 8.55 M / 17.59 M / 7.24 M / 4.80 B and reds.
  const byDay = new Map(rawLines().map((r) => [r.day, r]));
  const d18 = byDay.get("2026-09-18");
  const d21 = byDay.get("2026-09-21");
  const d17 = byDay.get("2026-09-17");
  assert.ok(d18 && d21 && d17, "the capture carries the 2026-09-17, -18 and -21 windows");
  assert.equal(compact18(d18.burns), "8.56 M", "8 556 055.57 USDe -> 8.56 M");
  assert.equal(compact18(d21.burns), "17.60 M", "17 598 518.97 USDe -> 17.60 M");
  assert.equal(compact18(d17.burns), "7.25 M", "7 248 378.74 USDe -> 7.25 M");
  assert.equal(compact18(d18.supply_close), "4.81 B", "4 807 659 943.93 USDe -> 4.81 B");
  assert.equal(compact18("0"), "0", "a zero is a fact");
  assert.equal(compact18("1"), "<1", "under one unit");
  assert.equal(compact18("999400000000000000000"), "999", "999.4 -> 999");
  assert.equal(compact18("999500000000000000000"), "1.00 k", "999.5 rounds up into the next unit");
  assert.equal(compact18("999995000" + "0".repeat(18)), "1.00 B", "999.995 M carries to 1.00 B");
  assert.equal(compact18(null), "—");
});

test("narabi_regime_word_and_drift_count_match_sentinel — calm = floor AND not stress; the calm-pair count is the sentinel's (prev calm AND calm, stepped)", () => {
  assert.equal(regimeWord({ floor: true, stress: false }), "calm");
  assert.equal(regimeWord({ floor: false, stress: false }), "below floor", "a window under the floor is never called calm");
  assert.equal(regimeWord({ floor: true, stress: true }), "stress");
  assert.equal(regimeWord({ floor: false, stress: true }), "stress, below floor");
  // isCalmRegime over the published flags == the sentinel's isCalm over the integers it derived them from.
  const cases: Array<[bigint, bigint]> = [[S_FLOOR, 0n], [S_FLOOR - 1n, 0n], [S_FLOOR * 100n, S_FLOOR], [S_FLOOR * 100n, S_FLOOR - 1n], [0n, 0n], [S_FLOOR * 3n, S_FLOOR]];
  for (const [sOpen, burns] of cases) {
    const floor = sOpen >= S_FLOOR;
    const stress = !(sOpen > 0n && burns * 100n < sOpen); // apps/sentinel/src/timeline.ts step()
    assert.equal(isCalmRegime({ floor, stress }), isCalm(sOpen, burns), `calm(${String(sOpen)}, ${String(burns)})`);
  }
  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  const expected = lines.filter((l, i) => i > 0 && l.pair_status !== "non_evaluable" && isCalmRegime(l.regime) && isCalmRegime(lines[i - 1]?.regime ?? null)).length;
  assert.equal(calmPairCount(lines), expected, "the capture's calm pairs");
  assert.equal(driftStatus(lines).n, Math.min(expected, CALM_WINDOW));
  // Mutants the old count (evaluable && !stress) would miss: a below-floor window, a stress->calm pair, a clipped pair.
  const k = lines.findIndex((l, i) => i > 1 && l.pair_status === "evaluable");
  assert.ok(k > 1, "a stepped line with a stepped predecessor exists");
  const cur = lines[k];
  const prev = lines[k - 1];
  assert.ok(cur && prev);
  const below = lines.map((l, i) => (i === k ? { ...l, regime: { floor: false, stress: false } } : l));
  assert.ok(calmPairCount(below) < calmPairCount(lines), "a below-floor window removes its pairs (the old count kept it)");
  const stressPrev = lines.map((l, i) => (i === k - 1 ? { ...l, regime: { floor: true, stress: true } } : l));
  assert.ok(calmPairCount(stressPrev) < calmPairCount(lines), "a stress->calm pair is not a calm pair");
  const clipped = lines.map((l, i) => (i === k ? { ...l, pair_status: "clipped" as const } : l));
  assert.equal(calmPairCount(clipped), calmPairCount(lines), "a clipped pair that stepped still counts (the sentinel appends it)");
  assert.equal(regimeWord(lastOf(lines).regime), "calm");
  assert.ok(readComponent().includes("{regimeWord(l.regime)}"), "the windows table renders the regime word");
});

test("narabi_code_versions_are_not_parameter_segments — sentinel builds are code versions; the parameter segment is derived from the published bounds", () => {
  const state = parseState(NARABI_SNAPSHOT.stateJson);
  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  const versions = codeVersions(lines);
  let runs = 0;
  lines.forEach((l, i) => {
    const p = lines[i - 1];
    if (!p || p.sentinel_sha !== l.sentinel_sha || p.node_version !== l.node_version) runs++;
  });
  assert.equal(versions.length, runs, "one code version per run of unchanged (sentinel_sha, node_version)");
  const seg = parameterSegments(state, lines);
  assert.equal(seg.one, true, "every published bound equals Theorem 1 under the published params: ONE parameter segment");
  assert.match(seg.text, /^one/);
  // Mutant: a bound published under other parameters -> not one segment, and the day is named.
  const target = lines.find((l) => l.bound_thm1 !== null);
  assert.ok(target, "a line with a bound exists");
  const altered = lines.map((l) => (l === target ? { ...l, bound_thm1: (l.bound_thm1 ?? 0) * 1.01 } : l));
  const seg2 = parameterSegments(state, altered);
  assert.equal(seg2.one, false);
  assert.ok(seg2.text.includes(target.day), "the mismatching day is named");
  const comp = readComponent();
  assert.ok(!/a segment is a run of unchanged parameters/i.test(comp), "the code-version run is never called a parameter segment");
  assert.ok(comp.includes('k="code versions (sentinel · node)"'), "the register labels code versions as such");
  assert.ok(comp.includes('k="tracker parameter segments" v={segs.text}'), "the derived parameter-segment fact renders");
  assert.ok(GLOSSARY.some((g) => g.term === "code version") && GLOSSARY.some((g) => g.term === "parameter segment"), "the glossary defines both");
  assert.ok(!GLOSSARY.some((g) => g.term === "segment"), "no ambiguous bare 'segment' entry");
  const pb = projectedBoundDate(state, lines);
  assert.ok(!/Thm 2/.test(pb.assumption) && /parameter segment/.test(pb.assumption), "the projection assumption speaks of a parameter segment");
});

// ── integrity: the page recomputes what the sentinel hashed, with the sentinel's own order ──────────────────────
test("narabi_integrity_recomputed_matches_sentinel — chain, state digest, tracker digest, replay and C1 recompute equal the producers; a tampered middle line reds", async () => {
  // Field order: the page's 31 hashed fields equal the sentinel's on a line with 31 pairwise-distinct values.
  const V = (name: string): string => `__${name}__`;
  const synthRaw = {
    day: V("day"), from_block: V("from_block"), to_block: V("to_block"), burns: V("burns"), mints: V("mints"),
    supply_close: V("supply_close"), s_open: V("s_open"), c1_ok: V("c1_ok"), utterance_hash: V("utterance_hash"),
    attested_flow_sha256: V("attested_flow_sha256"), v: V("v"), regime: { floor: V("regime.floor"), stress: V("regime.stress") },
    pair_status: V("pair_status"), s_raw: V("s_raw"), s: V("s"), E_tracker: V("E_tracker"), q_before: V("q_before"),
    eta: V("eta"), q_after: V("q_after"), T: V("T"), mean_E_tracker: V("mean_E_tracker"), bound_thm1: V("bound_thm1"),
    digest_T: V("digest_T"), E_static: V("E_static"), t_deg: V("t_deg"), sum_E_static: V("sum_E_static"), B_t: V("B_t"),
    rolling90_calm_miss: V("rolling90_calm_miss"), drift_flag: V("drift_flag"), prev_line_hash: V("prev_line_hash"),
    line_hash: V("line_hash"), endpoints: [V("endpoints")], node_version: V("node_version"), sentinel_sha: V("sentinel_sha"),
  };
  const sentinelFields = sentinelHashedFields(synthRaw as unknown as SentinelLine);
  const pageFields = pageHashedFields(parseTimeline(JSON.stringify(synthRaw))[0] as TimelineLine);
  assert.equal(new Set(sentinelFields).size, 31, "31 pairwise-distinct values");
  assert.deepEqual(pageFields, sentinelFields, "the page's hashed-field order equals timeline.ts hashedFields");

  const state = parseState(NARABI_SNAPSHOT.stateJson);
  const raw = rawLines();
  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const r = raw[i];
    assert.ok(l && r);
    const h = await pageLineHashOf(l, nodeSha);
    assert.equal(h, r.line_hash, `line ${l.day} recomputes its published line_hash`);
    assert.equal(h, sentinelLineHashOf(r as unknown as SentinelLine), `and equals timeline.ts lineHashOf for ${l.day}`);
  }
  const chain = await verifyChain(lines, nodeSha);
  assert.deepEqual(chain, { ok: true, links: lines.length, brokenAt: null }, "the committed chain is intact from GENESIS");
  // Mutant: alter a hashed field of a MIDDLE line -> broken at that day.
  const mid = Math.floor(lines.length / 2);
  const midLine = lines[mid];
  assert.ok(midLine);
  const tampered = lines.map((l, i) => (i === mid ? { ...l, burns: l.burns + "0" } : l));
  const broken = await verifyChain(tampered, nodeSha);
  assert.equal(broken.ok, false);
  assert.equal(broken.brokenAt, midLine.day, "the break is located at the altered line");
  const badGenesis = lines.map((l, i) => (i === 0 ? { ...l, prev_line_hash: "0".repeat(64) } : l));
  assert.equal((await verifyChain(badGenesis, nodeSha)).ok, false, "the first line must chain from GENESIS");

  // Tracker digest recomputed from q₁, params and the s column = state.digest = last digest_T = hikae trackerDigest.
  const scores = steppedScores(lines);
  const digest = await trackerDigestOf(state.tracker.q1, state.tracker.params, scores, nodeSha);
  assert.equal(digest, trackerDigest(state.tracker.q1, state.tracker.params, scores), "trackerDigest port = hikae");
  assert.equal(digest, state.digest, "= state.json digest");
  assert.equal(digest, lastOf(lines).digest_T, "= the last line's digest_T");
  // Replay port = hikae trackerReplay (bit for bit on this engine) = the published replay_q and q.
  const mine = replayTracker(state.tracker.q1, state.tracker.params, scores);
  const theirs = trackerReplay(state.tracker.q1, state.tracker.params, scores);
  assert.equal(mine.q, theirs.q, "replay port = hikae trackerReplay");
  assert.equal(mine.t, theirs.t);
  assert.equal(mine.q, state.replay_q, "= the published replay_q");
  assert.equal(mine.q, state.tracker.q, "= the published tracker q");
  assert.equal(replayCheck(state, lines).same, true);
  assert.equal(replayCheck({ ...state, replay_q: state.replay_q * 2 }, lines).same, false, "a different published replay_q is reported");
  // C1 in exact integers.
  assert.deepEqual(c1Check(lines), { holds: lines.length, total: lines.length, failDays: [] }, "the supply identity holds on every captured window");
  const c1bad = lines.map((l, i) => (i === mid ? { ...l, s_open: (BigInt(l.s_open) + 1n).toString() } : l));
  assert.deepEqual(c1Check(c1bad).failDays, [midLine.day], "an off-by-one opening supply is caught on its day");

  // Byte-prefix against the capture: live = capture + one more line -> true; a changed byte in the prefix -> false.
  const ref = storedRef(); // the byte-prefix FUNCTION, exercised on the stored text (the served bytes are not in the repo)
  const more = NARABI_SNAPSHOT.timelineJsonl + '{"day":"next"}\n';
  assert.equal(await extendsCapture(more, ref, nodeSha), true, "an appended timeline extends the capture");
  assert.equal(await extendsCapture(NARABI_SNAPSHOT.timelineJsonl.replace('"burns":"', '"burns":"1'), ref, nodeSha), false, "a rewritten byte does not");
  assert.equal(await extendsCapture(NARABI_SNAPSHOT.timelineJsonl.slice(0, 10), ref, nodeSha), false, "a shorter timeline does not");
  // The REAL reference is the timeline AS SERVED: the stored copy (URLs dropped) does not pass as the served bytes.
  assert.equal(await extendsCapture(NARABI_SNAPSHOT.timelineJsonl, captureRef(NARABI_SNAPSHOT), nodeSha), false, "the stored copy is not the served bytes");
  // checkIntegrity composes all of it; on the capture itself the prefix check is not applicable.
  const onCapture = await checkIntegrity(captureData(NARABI_SNAPSHOT), nodeSha);
  assert.deepEqual(onCapture, { chain: { ok: true, links: lines.length, brokenAt: null }, stateAgreesWithLastLine: true, digestRecomputed: true, extendsCapture: null });
  // On the files as served now, the byte-prefix answer is the one loadNarabi computed when it read them.
  const appended = NARABI_SNAPSHOT.timelineJsonl + JSON.stringify({ ...lastOf(raw), day: "next" }) + "\n";
  const extended = await loadNarabi({ fetchFile: serving(NARABI_SNAPSHOT.stateJson, appended), capture: ref, sha256Hex: nodeSha, sleep: noWait });
  assert.equal(extended.extendsCapture, true, "a served timeline that appends to the capture extends it");
  assert.equal((await checkIntegrity(extended, nodeSha)).extendsCapture, true, "and checkIntegrity reports it on the served files");
  const rewritten = await loadNarabi({ fetchFile: serving(NARABI_SNAPSHOT.stateJson, NARABI_SNAPSHOT.timelineJsonl.replace('"burns":"', '"burns":"1')), capture: ref, sha256Hex: nodeSha, sleep: noWait });
  assert.equal((await checkIntegrity(rewritten, nodeSha)).extendsCapture, false, "a rewritten byte is reported");
  const liveData: NarabiData = { ...captureData(NARABI_SNAPSHOT), sourceKind: "live", extendsCapture: true };
  assert.equal((await checkIntegrity({ ...liveData, sourceKind: "capture" }, nodeSha)).extendsCapture, null, "never on the capture");
  const comp = readComponent();
  assert.ok(comp.includes("checkIntegrity(data, webSha256)"), "the component recomputes integrity with Web Crypto");
  assert.ok(comp.includes("loadNarabi({ fetchFile: browserFetchFile, capture, sha256Hex: webSha256 })"), "the browser read checks the byte prefix against the capture with Web Crypto");
  assert.ok(comp.includes('crypto.subtle.digest("SHA-256"'), "the browser hasher is Web Crypto SHA-256");
});

// ── lag: the page's "late" is the external probe's criterion, and the schedule is the units' ────────────────────
test("narabi_lag_matches_probe_deadline — the served schedule equals the systemd units and the probe; late iff the probe says lag", () => {
  assert.equal(NARABI_SERVED.probe.deadline_utc, DEADLINE_UTC, "the page's deadline is the probe's DEADLINE_UTC");
  const slots = (unit: string): string[] =>
    [...readFileSync(join(ROOT, "deploy", unit), "utf8").matchAll(/^OnCalendar=\*-\*-\* (\d{2}:\d{2}):00 UTC\s*$/gm)].map((m) => m[1] ?? "");
  assert.deepEqual([...NARABI_SERVED.sentinel_timer.on_calendar_utc], slots("monark-sentinel.timer"), "sentinel slots = the timer unit's OnCalendar lines");
  const delay = /^RandomizedDelaySec=(\d+)\s*$/m.exec(readFileSync(join(ROOT, "deploy", "monark-sentinel.timer"), "utf8"))?.[1];
  assert.equal(String(NARABI_SERVED.sentinel_timer.randomized_delay_s), delay, "randomized delay = the timer unit's RandomizedDelaySec");
  assert.deepEqual([...NARABI_SERVED.probe.shots_utc], slots("monark-probe.timer"), "probe shots = the probe timer unit's OnCalendar lines");

  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  const D = lastOf(lines).day;
  const publishDay = new Date(Date.parse(D + "T00:00:00Z") + 2 * 86_400_000).toISOString().slice(0, 10);
  const due = Date.parse(`${publishDay}T${DEADLINE_UTC}:00Z`);
  assert.equal(lagStatus(lines, new Date(due - 60_000), SCHEDULE).late, 0, "one minute before the deadline: not late");
  assert.equal(lagStatus(lines, new Date(due + 60_000), SCHEDULE).late, 1, "one minute after: one window behind");
  // Equality with the probe over four days, every thirty minutes (mutant: a 02:00 grace -> red at 03:00Z).
  for (let ms = due - 2 * 86_400_000; ms <= due + 2 * 86_400_000; ms += 30 * 60_000) {
    const nowIso = new Date(ms).toISOString();
    const probeLag = Math.max(0, dayDiff(D, expectedLastDay(nowIso)));
    assert.equal(lagStatus(lines, new Date(ms), SCHEDULE).late, probeLag, `page late = probe lag at ${nowIso}`);
  }
  const text = lagStatus(lines, new Date(due - 60_000), SCHEDULE).text;
  assert.match(text, /is due on/, "a window not yet published is said as due, never as published");
  assert.ok(!/is published on/.test(text), "never 'is published on' for a future publication");
  for (const hhmm of [...NARABI_SERVED.sentinel_timer.on_calendar_utc.slice(0, 1), DEADLINE_UTC]) {
    assert.ok(text.includes(hhmm), `the on-time lag line states ${hhmm} (read from the served schedule)`);
  }
  assert.ok(!/monark-sentinel\.timer/.test(text), "the lag line never names an internal file");
  assert.ok(!/readFileSync|deploy/.test(readPage()), "the page no longer reads the systemd units at build (absent from the export)");
});

test("narabi_live_snapshot_lag_not_attributed — on the committed capture the lag is unknown and the header never claims a running sensor", () => {
  const initial = captureData(NARABI_SNAPSHOT);
  const v0 = lagView(initial, SCHEDULE);
  assert.equal(v0.lag, null, "no lag is computed on the capture");
  assert.match(v0.text, /^unknown/, "the capture's age is never attributed to the sentinel");
  assert.equal(liveWord(initial, null), "reading the served files");
  const failed = captureAfterFailure(initial, NARABI_SNAPSHOT.capturedAt, new Error("x"));
  assert.match(lagView(failed, SCHEDULE).text, /unknown \(the served files could not be read\)/);
  assert.equal(liveWord(failed, null), "served files unreadable", "a failed read never claims a schedule");
  // Live and late: the header says how far behind; live and on time: sensor running.
  const live: NarabiData = { ...initial, sourceKind: "live", readAt: "2026-10-05T12:00:00.000Z" };
  const lateView = lagView(live, SCHEDULE);
  assert.ok(lateView.lag !== null && lateView.lag.late > 0);
  assert.match(liveWord(live, lateView.lag), /behind$/);
  const onTime: NarabiData = { ...initial, sourceKind: "live", readAt: `${lastOf(initial.lines).day}T23:00:00.000Z` };
  // Freshness is all the page can see: "no window late", never a claim that the process runs (mutant: "sensor running").
  assert.equal(liveWord(onTime, lagView(onTime, SCHEDULE).lag), "on schedule (no window late)");
  assert.ok(!/sensor running/.test(readFileSync(join(SITE, "lib", "narabi-live.ts"), "utf8")), "the lib never builds 'sensor running'");
  const comp = readComponent();
  assert.ok(comp.includes("{liveWord(data, lag)}"), "the header word is derived, not a literal");
  assert.ok(!/sensor running/.test(comp), "the component never types 'sensor running'");
  assert.ok(!/Today T =/.test(comp), "no 'Today T =' on a capture: T carries its source");
});

// ── /how carries the served per-class reserve; the copy claims align with what is served ────────────────────────
test("narabi_how_reserve_extracts_served_clause — /how 'What is not' carries the measured class's reserve, clause by clause from the served description", () => {
  for (const c of MEASURED_CLASS_CLAUSES) {
    assert.ok(STABLE_RUN_COMMITTED_CORE.includes(c), `clause "${c}" is an extract of the served description`);
    assert.ok(MEASURED_CLASS_RESERVE.includes(c), `clause "${c}" is carried by the rendered reserve`);
  }
  assert.deepEqual(scanNumericText(MEASURED_CLASS_RESERVE, noExempt), [], "the reserve is digit-free");
  const how = readFileSync(join(SITE, "app", "how", "page.tsx"), "utf8");
  assert.ok(how.includes("{MEASURED_CLASS_RESERVE}"), "/how renders the reserve");
  assert.ok(how.includes("href={NARABI_ROUTE}"), "/how links the Narabi page next to it");
});

test("narabi_copy_claims_aligned — Published / fleet place / panel / verify hint say what is actually served", () => {
  const published = LEVELS.find((l) => l.name === "Published");
  assert.ok(published);
  assert.match(published.claim, /state file is replaced each day/, "state.json is replaced, not appended");
  assert.ok(!/never rewritten\.$/.test(published.claim.split(";")[1] ?? ""), "only the timeline is 'never rewritten'");
  assert.ok(!/\bfeeds\b/.test(FLEET_PLACE), "the daily timeline does not feed the gate");
  assert.match(FLEET_PLACE, /not read by the gate/);
  assert.match(VERIFY_HINT, /AttestedFlow documents are not served/);
  // "guarantee" is a banned claim on the storefront; the copy says what checks the facts instead.
  for (const t of [published.detail, RECOMPUTE_LEDE]) {
    assert.ok(!/guarant/i.test(t), "no guarantor/guarantee wording");
    assert.match(t, /only check of the facts is the (?:on-chain )?recompute/);
  }
  // The published line carries the endpoint pool itself; the page shows only its size (never "the size of its pool").
  const append = WINDOW_STEPS[WINDOW_STEPS.length - 1] ?? "";
  assert.match(append, /its RPC endpoint pool \(this page shows only its size\)/);
  const panel = readFileSync(join(SITE, "components", "narabi-panel.tsx"), "utf8");
  assert.ok(!/attested flow and\s+its timeline are served as plain files/i.test(panel), "the panel no longer claims the attested flow is served");
  assert.ok(!/over HTTP and MCP through the <code>gate<\/code> tool at/.test(panel), "the panel no longer puts HTTP on the MCP host");
  assert.match(panel.replace(/\s+/g, " "), /AttestedFlow documents themselves are not served/);
  assert.ok(!/sha256/.test(panel), "no digit-bearing hash name in the panel's JSX text");
});

// ── the integrity lede: what the checks ran on, in every state the page reaches ─────────────────────────────────
test("narabi_integrity_lede_says_what_was_checked — the lede names what the checks ran on and by whom, in every state the page reaches (build, capture before the read, capture after a failed read, served files, pending, failed recompute)", () => {
  const cap = captureData(NARABI_SNAPSHOT);
  const failedRead = captureAfterFailure(cap, NARABI_SNAPSHOT.capturedAt, new Error("HTTP 503 /narabi/state.json"));
  const live: NarabiData = { ...cap, sourceKind: "live", readAt: "2026-09-24T03:00:00.000Z", extendsCapture: true };
  const at = (onShownData: boolean, where: "build" | "browser", failed = false) => ({ onShownData, where, failed });
  // The component's sequence, state by state (NarabiLive: checked = {on, where}; data; integrityError):
  // 1. first paint — checks computed at build on the capture.
  assert.equal(integrityLedeFor(at(true, "build"), cap), INTEGRITY_LEDE_BUILD);
  // 2. the browser recomputed on the capture before the served files arrived: it never says it read them (the old
  //    lede said "from the files it read" here).
  assert.equal(integrityLedeFor(at(true, "browser"), cap), INTEGRITY_LEDE_CAPTURE_UNREAD);
  // 3. the served files arrived; the results on screen still belong to the capture: pending.
  assert.equal(integrityLedeFor(at(false, "browser"), live), INTEGRITY_LEDE_PENDING);
  assert.equal(integrityLedeFor(at(false, "build"), live), INTEGRITY_LEDE_PENDING);
  // 4. recomputed on the served files: says what still comes from this page.
  assert.equal(integrityLedeFor(at(true, "browser"), live), INTEGRITY_LEDE_LIVE);
  // 5. the read failed: the board shows the capture again, pending, then recomputed on it — and says the read failed.
  assert.equal(integrityLedeFor(at(false, "browser"), failedRead), INTEGRITY_LEDE_PENDING);
  assert.equal(integrityLedeFor(at(true, "browser"), failedRead), INTEGRITY_LEDE_CAPTURE_FAILED);
  // 6. the recompute itself failed (its error is printed next to the checks): nothing shown belongs to the data, or
  //    only the build's results on the capture do (the browser's recompute of that same capture is what failed).
  assert.equal(integrityLedeFor(at(false, "browser", true), live), INTEGRITY_LEDE_FAILED);
  assert.equal(integrityLedeFor(at(false, "browser", true), cap), INTEGRITY_LEDE_FAILED);
  assert.equal(integrityLedeFor(at(true, "build", true), cap), INTEGRITY_LEDE_BUILD_ONLY);
  // Content: no over-claim anywhere; each capture state says it is the capture; the served-files state names what
  // comes from the page (the byte-prefix reference and the checking code). Mutant: the old "nothing here is taken on
  // trust from the page" -> red.
  const all = [INTEGRITY_LEDE_BUILD, INTEGRITY_LEDE_BUILD_ONLY, INTEGRITY_LEDE_PENDING, INTEGRITY_LEDE_FAILED, INTEGRITY_LEDE_CAPTURE_UNREAD, INTEGRITY_LEDE_CAPTURE_FAILED, INTEGRITY_LEDE_LIVE];
  assert.equal(new Set(all).size, all.length, "seven distinct ledes");
  for (const l of all) assert.ok(!/taken on trust|guarant|verified/i.test(l), `no trust over-claim: ${l}`);
  for (const l of [INTEGRITY_LEDE_BUILD, INTEGRITY_LEDE_BUILD_ONLY, INTEGRITY_LEDE_CAPTURE_UNREAD, INTEGRITY_LEDE_CAPTURE_FAILED]) {
    assert.match(l, /committed capture/, "a capture state says it is the capture");
    assert.ok(!/files it read/.test(l), "a capture state never claims the files were read");
  }
  assert.match(INTEGRITY_LEDE_BUILD_ONLY, /could not recompute/);
  assert.match(INTEGRITY_LEDE_CAPTURE_UNREAD, /not been read yet/);
  assert.match(INTEGRITY_LEDE_CAPTURE_FAILED, /failed/);
  assert.match(INTEGRITY_LEDE_LIVE, /files it read/);
  assert.match(INTEGRITY_LEDE_LIVE, /byte-prefix reference and the checking code come from this page/);
});

// ── a read that lands during the daily publication is re-read once ────────────────────────────────────────────────
test("narabi_live_rereads_once_on_a_torn_publication — a read between the sentinel's two copies (state and timeline of different days, or a torn line) is re-read ONCE before anything is reported", async () => {
  const raw = rawLines();
  const tl = NARABI_SNAPSHOT.timelineJsonl;
  const staleTl = raw.slice(0, -1).map((l) => JSON.stringify(l)).join("\n") + "\n"; // the day before: last digest_T != state.digest
  const ref = captureRef(NARABI_SNAPSHOT);
  const waits: number[] = [];
  const sleep = (ms: number): Promise<void> => {
    waits.push(ms);
    return Promise.resolve();
  };
  /** A reader whose n-th timeline read serves bodies[n] (the last one thereafter); it counts the timeline reads. */
  const reader = (bodies: readonly string[]) => {
    let reads = 0;
    const fetchFile = (u: string): Promise<FetchedFile> => {
      if (u.endsWith("state.json")) return Promise.resolve({ text: NARABI_SNAPSHOT.stateJson, lastModified: null });
      const body = bodies[Math.min(reads, bodies.length - 1)] ?? "";
      reads++;
      return Promise.resolve({ text: body, lastModified: null });
    };
    return { fetchFile, reads: () => reads };
  };
  // A torn pair (yesterday's timeline with today's state), then the consistent pair: re-read once, show the second.
  const torn = reader([staleTl, tl]);
  const d = await loadNarabi({ fetchFile: torn.fetchFile, capture: ref, sha256Hex: nodeSha, sleep });
  assert.equal(torn.reads(), 2, "the timeline is read twice");
  assert.deepEqual(waits, [REREAD_DELAY_MS], "one wait of REREAD_DELAY_MS before the re-read");
  assert.equal(stateAgreesWithLastLine(d.state, d.lines), true, "the page shows the consistent second read");
  // A consistent first read is never re-read (mutant: always re-read -> red).
  waits.length = 0;
  const calm = reader([tl]);
  await loadNarabi({ fetchFile: calm.fetchFile, capture: ref, sha256Hex: nodeSha, sleep });
  assert.equal(calm.reads(), 1, "a consistent pair is read once");
  assert.deepEqual(waits, [], "and no wait");
  // A torn last line (the timeline copy caught mid-write) fails to parse: re-read too, then shown.
  const cut = reader([tl.slice(0, tl.length - 40), tl]);
  const d2 = await loadNarabi({ fetchFile: cut.fetchFile, capture: ref, sha256Hex: nodeSha, sleep });
  assert.equal(cut.reads(), 2);
  assert.equal(d2.lines.length, raw.length, "the complete timeline is shown");
  // Still inconsistent after the re-read: the page reports what it read (the integrity check then says "no") — exactly
  // one re-read, never a loop.
  const stuck = reader([staleTl]);
  const d3 = await loadNarabi({ fetchFile: stuck.fetchFile, capture: ref, sha256Hex: nodeSha, sleep });
  assert.equal(stuck.reads(), 2, "exactly one re-read");
  assert.equal((await checkIntegrity(d3, nodeSha)).stateAgreesWithLastLine, false, "a persistent mismatch is reported, not hidden");
  // A first read that fails outright is retried once; a second failure propagates (the caller then keeps the capture).
  let calls = 0;
  const flaky = (u: string): Promise<FetchedFile> => {
    calls++;
    return calls <= 2 ? Promise.reject(new Error("connection reset")) : serving(NARABI_SNAPSHOT.stateJson, tl)(u);
  };
  assert.equal((await loadNarabi({ fetchFile: flaky, capture: ref, sha256Hex: nodeSha, sleep })).sourceKind, "live", "a transient failure is survived");
  // Why: the sentinel copies the timeline, then the state, into the served directory (two copies, neither atomic).
  const run = readFileSync(join(ROOT, "apps", "sentinel", "src", "run.ts"), "utf8");
  const iTl = run.indexOf('copyFileSync(tl, join(pub, "timeline.jsonl"))');
  const iSt = run.indexOf('copyFileSync(join(dir, "state.json"), join(pub, "state.json"))');
  assert.ok(iTl > 0 && iSt > iTl, "the producer publishes the timeline, then the state");
});

// ── the committed capture, bound offline to a committed copy of the served timeline ─────────────────────────────
test("narabi_capture_reprojects_committed_sentinel_fixture — the first stored lines are, byte for byte, the committed sentinel fixture (a byte prefix of the served timeline) with each endpoint list replaced by its count; the previous capture's record is that fixture's first lines", () => {
  const fixtureRel = join("apps", "sentinel", "test", "fixtures", "narabi-timeline-2026-09-19.jsonl");
  const fixture = readFileSync(join(ROOT, fixtureRel), "utf8");
  // The fixture is sha-pinned by its own provenance file (so this oracle cannot drift silently).
  const prov = readFileSync(join(ROOT, "apps", "sentinel", "test", "fixtures", "PROVENANCE-narabi-timeline-2026-09-19.md"), "utf8");
  assert.ok(prov.includes(sha256(fixture)), "the fixture's sha256 is the one its provenance file pins");
  // An INDEPENDENT projection (not the sync tool's): same key order, `endpoints` -> `endpoints_count` = its length.
  const project = (line: string): string =>
    JSON.stringify(
      Object.fromEntries(
        Object.entries(JSON.parse(line) as Record<string, unknown>).map(([k, v]) => (k === "endpoints" ? ["endpoints_count", Array.isArray(v) ? v.length : null] : [k, v])),
      ),
    );
  const fixtureLines = fixture.split("\n").filter((l) => l.trim().length > 0);
  const stored = NARABI_SNAPSHOT.timelineJsonl.split("\n").filter((l) => l.trim().length > 0);
  assert.ok(fixtureLines.length >= 2 && fixtureLines.length <= stored.length, "the fixture covers the first stored lines");
  fixtureLines.forEach((l, i) => {
    // Binds endpoints_count, node_version and sentinel_sha (outside the line hash) of these lines. Mutant: change the
    // count, the Node version or the build sha of one of them in the capture (re-hashed) -> red.
    assert.equal(stored[i], project(l), `stored line ${String(i)} is the projected fixture line, byte for byte`);
  });
  // The previous capture recorded the served timeline of its day: it is exactly the fixture's first lines.
  const prev = NARABI_SNAPSHOT.previousCapture;
  const prefix = fixture.slice(0, prev.servedTimelineChars);
  assert.ok(prefix.endsWith("\n"), "the recorded length ends on a line boundary");
  assert.equal(sha256(prefix), prev.servedTimelineSha256, "previous capture sha256 = the fixture's first lines");
});

// ── the endpoint-pool clause is the sentinel's own quorum rule ────────────────────────────────────────────────────
test("narabi_quorum_clause_bound_to_sentinel_rpc — 'each burns, mints and supply read needs two distinct providers that agree' is apps/sentinel/src/rpc.ts quorumTwo", async () => {
  const hex = (n: bigint): string => "0x" + n.toString(16);
  const pool = (endpoints: string[], supplyOf: (url: string) => bigint) =>
    makeRpcPool({
      endpoints,
      cooldownMs: 0,
      call: (url, method) => {
        if (method === "eth_call") return Promise.resolve(hex(supplyOf(url)));
        if (method === "eth_getLogs") return Promise.resolve([]);
        return Promise.reject(new Error("unexpected " + method));
      },
    });
  // Two endpoints of ONE provider (one registrable domain) are not a quorum, for the supply read and the flow read.
  const oneProvider = pool(["https://a.example.org", "https://b.example.org"], () => 5n);
  await assert.rejects(oneProvider.supplyAt(10), /quorum needs >= 2 live endpoints from 2 providers/);
  await assert.rejects(oneProvider.windowFlow(1, 2), /quorum needs >= 2 live endpoints from 2 providers/);
  // Two providers that disagree: the read fails closed.
  const disagree = pool(["https://a.example.org", "https://b.example.net"], (u) => (u.includes(".org") ? 5n : 6n));
  await assert.rejects(disagree.supplyAt(10), QuorumDisagreementError);
  // Two providers that agree: the value.
  const agree = pool(["https://a.example.org", "https://b.example.net"], () => 7n);
  assert.equal(await agree.supplyAt(10), 7n);
  assert.deepEqual(await agree.windowFlow(1, 2), { burns: 0n, mints: 0n });
  // The clause names exactly the reads the rule covers (the block range is a single read, published for recompute).
  assert.equal(QUORUM_CLAUSE, "each burns, mints and supply read needs two distinct providers that agree");
  assert.ok(readComponent().includes("v={endpointPoolLabel(last)}"), "the register renders the pool label that carries the clause");
});

// ── the two committed records fail closed ─────────────────────────────────────────────────────────────────────────
test("narabi_committed_records_fail_closed — the served-facts record and the capture are manifest-checked, closed-shape, self-consistent; a tamper, an unlisted file, an extra key or a URL in the stored timeline throws", () => {
  const tmp = mkdtempSync(join(tmpdir(), "narabi-records-"));
  try {
    const manifestRel = "apps/site/data/manifest.sha256.json";
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    const manifest = JSON.parse(readFileSync(join(ROOT, manifestRel), "utf8")) as { algorithm: string; files: Record<string, string> };
    const servedRaw = readFileSync(join(ROOT, NARABI_SERVED_REL), "utf8");
    const captureRaw = readFileSync(join(ROOT, NARABI_CAPTURE_REL), "utf8");
    const shaOf = (t: string): string => sha256(t.replace(/\r\n/g, "\n"));
    const write = (sv: string, cp: string, files?: Record<string, string>): void => {
      writeFileSync(join(tmp, NARABI_SERVED_REL), sv);
      writeFileSync(join(tmp, NARABI_CAPTURE_REL), cp);
      const listed = files ?? { ...manifest.files, [NARABI_SERVED_REL]: shaOf(sv), [NARABI_CAPTURE_REL]: shaOf(cp) };
      writeFileSync(join(tmp, manifestRel), JSON.stringify({ ...manifest, files: listed }));
    };
    // Baseline: the committed pair loads to the very values the tests above use.
    write(servedRaw, captureRaw);
    assert.deepEqual(loadNarabiServed(tmp), NARABI_SERVED);
    assert.deepEqual(loadNarabiCapture(tmp), NARABI_SNAPSHOT);
    // Served facts: a tampered byte under the committed manifest -> sha mismatch (the build reds).
    const late = servedRaw.replace('"deadline_utc": "10:30"', '"deadline_utc": "11:30"');
    assert.notEqual(late, servedRaw, "premise: the deadline was rewritten");
    write(late, captureRaw, { ...manifest.files, [NARABI_SERVED_REL]: shaOf(servedRaw), [NARABI_CAPTURE_REL]: shaOf(captureRaw) });
    assert.throws(() => loadNarabiServed(tmp), /sha256 mismatch/);
    // Re-hashed, the closed shape still refuses a deadline that is not the probe's first shot.
    write(late, captureRaw);
    assert.throws(() => loadNarabiServed(tmp), /first shot must be its deadline/);
    // An extra key, a malformed slot, an unlisted file.
    const extra = JSON.stringify({ ...(JSON.parse(servedRaw) as Record<string, unknown>), note: "x" }, null, 2) + "\n";
    write(extra, captureRaw);
    assert.throws(() => loadNarabiServed(tmp), /must carry exactly/);
    const badSlot = servedRaw.replace('"00:30"', '"0:30"');
    write(badSlot, captureRaw);
    assert.throws(() => loadNarabiServed(tmp), /malformed/);
    write(servedRaw, captureRaw, Object.fromEntries(Object.entries({ ...manifest.files, [NARABI_CAPTURE_REL]: shaOf(captureRaw) }).filter(([k]) => k !== NARABI_SERVED_REL)));
    assert.throws(() => loadNarabiServed(tmp), /not listed in the site manifest/);
    // Capture: a URL list back in the stored timeline (everything re-hashed) -> refused.
    const cap = JSON.parse(captureRaw) as Record<string, unknown> & { timeline_jsonl: string; state_json: string };
    const withUrl = cap.timeline_jsonl.replace(/"endpoints_count":\d+/, '"endpoints":["https://rpc.example"]');
    assert.notEqual(withUrl, cap.timeline_jsonl, "premise: a URL list was put back");
    const capUrl = JSON.stringify({ ...cap, timeline_jsonl: withUrl, timeline_sha256: sha256(withUrl) }, null, 2) + "\n";
    write(servedRaw, capUrl);
    assert.throws(() => loadNarabiCapture(tmp), /no URL and no endpoint list/);
    // Capture: a stored body that no longer hashes to its recorded sha256 (manifest re-hashed) -> refused.
    const capDrift = JSON.stringify({ ...cap, state_json: cap.state_json.replace('"t": 6', '"t": 7') }, null, 2) + "\n";
    assert.notEqual(capDrift, captureRaw, "premise: the stored state was altered");
    write(servedRaw, capDrift);
    assert.throws(() => loadNarabiCapture(tmp), /does not hash to state_sha256/);
    // Capture: the previous capture must be older and strictly shorter (append-only).
    const capBack = JSON.stringify({ ...cap, previous_capture: { ...(cap.previous_capture as Record<string, unknown>), served_timeline_chars: 999_999 } }, null, 2) + "\n";
    write(servedRaw, capBack);
    assert.throws(() => loadNarabiCapture(tmp), /strictly shorter prefix/);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  // CARRIERS: the page reads both records through these loaders, the capture module and the typed facts are gone.
  assert.ok(/loadNarabiCapture\(root\)/.test(readPage()) && /loadNarabiServed\(root\)/.test(readPage()), "the page reads both records through their loaders");
  assert.ok(!existsSync(join(SITE, "lib", "narabi-snapshot.ts")) && !existsSync(join(SITE, "lib", "narabi-served.ts")), "no typed-value module remains");
});

// T0-TOOLING-1 (review B-3, c bis): the Narabi sync sets its own manifest entry (canonical form) instead of printing it for a
// hand edit. Replayed on a copy of the committed record: the same facts and read_at give back the committed bytes and entry;
// new facts move the entry to the new file, and the site loader accepts it. No network: the sync's write step only.
// killer: scripts/sync-narabi-served.mjs:146 SDL "  writeFileSync(join(root, MANIFEST_REL), manifest);" -> ""
test("narabi_sync_sets_its_manifest_entry", async () => {
  const sync = (await import(new URL("../scripts/sync-narabi-served.mjs", import.meta.url).href)) as Record<string, unknown>;
  const write = sync["writeNarabiServed"] as ((root: string, facts: unknown, readAt: string) => string) | undefined;
  assert.equal(typeof write, "function", "scripts/sync-narabi-served.mjs exports writeNarabiServed");
  if (write === undefined) return;
  const manifestRel = "apps/site/data/manifest.sha256.json";
  const tmp = mkdtempSync(join(tmpdir(), "narabi-sync-"));
  try {
    mkdirSync(join(tmp, "apps", "site", "data"), { recursive: true });
    for (const rel of [manifestRel, NARABI_SERVED_REL]) writeFileSync(join(tmp, rel), readFileSync(join(ROOT, rel), "utf8"));
    const committed = JSON.parse(readFileSync(join(ROOT, NARABI_SERVED_REL), "utf8")) as { read_at: string; gate: Record<string, unknown>; sentinel_timer: unknown; probe: unknown };
    const facts = { gate: committed.gate, sentinel_timer: committed.sentinel_timer, probe: committed.probe };
    write(tmp, facts, committed.read_at);
    assert.deepEqual([manifestRel, NARABI_SERVED_REL].map((rel) => readFileSync(join(tmp, rel), "utf8")), [manifestRel, NARABI_SERVED_REL].map((rel) => readFileSync(join(ROOT, rel), "utf8")), "the committed facts give back the committed bytes and entry");
    const sha = write(tmp, { ...facts, gate: { ...committed.gate, openapi_sha256: "0".repeat(64) } }, "2026-10-06T12:00:00.000Z");
    const files = (JSON.parse(readFileSync(join(tmp, manifestRel), "utf8")) as { files: Record<string, string> }).files;
    assert.equal(files[NARABI_SERVED_REL], sha256(readFileSync(join(tmp, NARABI_SERVED_REL), "utf8").replace(/\r\n/g, "\n")), "the entry is the new file's CRLF->LF sha256");
    assert.equal(sha, files[NARABI_SERVED_REL]);
    assert.equal(loadNarabiServed(tmp).gate.openapi_sha256, "0".repeat(64), "the site loader accepts the new record");
    // G2 M-5: the "unchanged" path repairs a stale entry (an interrupted or hand-edited manifest), and only then writes.
    const repair = sync["repairNarabiEntry"] as ((root: string) => boolean) | undefined;
    assert.equal(typeof repair, "function", "scripts/sync-narabi-served.mjs exports repairNarabiEntry");
    writeFileSync(join(tmp, manifestRel), readFileSync(join(tmp, manifestRel), "utf8").replace(sha, "1".repeat(64)));
    assert.deepEqual([repair?.(tmp), repair?.(tmp)], [true, false], "a stale entry is set again, once");
    assert.equal(loadNarabiServed(tmp).gate.openapi_sha256, "0".repeat(64), "the loader accepts the repaired manifest");
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
});
