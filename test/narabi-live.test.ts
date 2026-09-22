// test/narabi-live.test.ts — non-LLM oracle for the /narabi board (lot F-site-10, ADR-M012 D4). Runs at the
// REPO ROOT under `node --test` (the apps/site test glob is not in `npm test`; this mirrors site-honesty.test.ts).
// It imports the PURE logic (apps/site/lib/narabi-live.ts) and the committed snapshot, and re-derives the bound
// from the sentinel's own formula (apps/sentinel/src/timeline.ts), so a drift between page and sentinel reds.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { NARABI_SNAPSHOT } from "../apps/site/lib/narabi-snapshot.ts";
import {
  parseState,
  parseTimeline,
  loadNarabi,
  firstReadingLabel,
  SERIES_MIN_STEPS,
  D8_SENTENCE,
  WHY_SEVEN,
  TRACKER_ADAPTS,
  NO_COVERAGE_MEASURED,
  STATUS_IS_A_WORD,
  HERO_DEK,
  WINDOWS_LEDE,
  DRIFT_THRESHOLD,
  CALM_WINDOW,
  BOUND_TARGET,
  NARABI_ROUTE,
} from "../apps/site/lib/narabi-live.ts";
import type { NarabiState, TimelineLine } from "../apps/site/lib/narabi-live.ts";
import { GLOSSARY } from "../apps/site/lib/narabi-copy.ts";
import { FLEET_AGENTS } from "../apps/site/lib/fleet.ts";
import {
  boundThm1,
  projectedBoundT,
  DELTA_TARGET,
  TRACKER_PARAMS,
  DRIFT_THRESHOLD as SENTINEL_DRIFT,
  CALM_WINDOW as SENTINEL_CALM,
} from "../apps/sentinel/src/timeline.ts";
import { scanText as scanNumericText } from "../apps/site/test/honesty-lint.ts";

const ROOT = join(import.meta.dirname, "..");
// sha256 of the files monarkgate.tech/narabi/{state.json,timeline.jsonl} served when captured (2026-09-19, T=1 series).
const STATE_SHA = "86c33c4251bef4b307688c7b8386d74137136cf7ba2d91687ee42ad06e06b96b";
const TIMELINE_SHA = "4b17d0b812e47e34a8d0d9fed47c153a8b471e6e53787b55bc4c574a6de0ea5b";

const sha256 = (s: string): string => createHash("sha256").update(s, "utf8").digest("hex");
const readComponent = (): string => readFileSync(join(ROOT, "apps", "site", "components", "narabi", "narabi-live.tsx"), "utf8");

test("narabi_live_parses_real_state_shape — the committed snapshot is byte-exact and the real published shape (ADR-M012 D4)", () => {
  // Provenance: the committed bytes hash to what the live endpoint served. Mutant: flip a byte in
  // apps/site/lib/narabi-snapshot.ts stateJson/timelineJsonl -> the sha assertions red.
  assert.equal(sha256(NARABI_SNAPSHOT.stateJson), STATE_SHA, "state.json bytes must match the published file");
  assert.equal(sha256(NARABI_SNAPSHOT.timelineJsonl), TIMELINE_SHA, "timeline.jsonl bytes must match the published file");
  assert.equal(NARABI_SNAPSHOT.stateSha256, STATE_SHA);
  assert.equal(NARABI_SNAPSHOT.timelineSha256, TIMELINE_SHA);

  const state = parseState(NARABI_SNAPSHOT.stateJson);
  assert.equal(typeof state.tracker.q, "number");
  assert.equal(typeof state.tracker.t, "number");
  assert.equal(typeof state.tracker.q1, "number");
  for (const p of ["alpha", "c", "eps", "t0", "B"] as const) {
    assert.equal(typeof state.tracker.params[p], "number", `params.${p} must be a number`);
  }
  assert.equal(typeof state.digest, "string");
  assert.equal(state.digest.length, 64, "digest is a sha256 hex");
  assert.equal(typeof state.projected_bound_leq_target_T, "number");
  assert.equal(typeof state.replay_q, "number");

  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  assert.ok(lines.length >= 1, "at least the J0 window is published");
  const first = lines[0];
  assert.ok(first, "first timeline line present");
  assert.equal(typeof first.day, "string");
  assert.equal(typeof first.T, "number");
  assert.ok(["evaluable", "non_evaluable", "clipped"].includes(first.pair_status), "pair_status is a known word");
  assert.equal(first.line_hash.length, 64, "line_hash is a sha256 hex");
});

test("narabi_live_bound_formula_matches_timeline_ts — the printed horizon + constants equal the sentinel formula (ABB Thm 1)", () => {
  const state = parseState(NARABI_SNAPSHOT.stateJson);
  const T = state.projected_bound_leq_target_T;
  // The published horizon equals projectedBoundT(delta_target), recomputed from apps/sentinel/src/timeline.ts,
  // and is the exact crossing bound(T) <= target < bound(T-1). Mutant: edit the snapshot's projected T -> red.
  assert.equal(projectedBoundT(DELTA_TARGET), T, "state.json projected T must equal the sentinel formula output");
  assert.ok(boundThm1(T) <= DELTA_TARGET, "the bound at T is at or below the target");
  assert.ok(boundThm1(T - 1) > DELTA_TARGET, "the bound at T-1 is still above the target");

  // The page constants equal the sentinel's pre-registered constants (no silent divergence between surfaces).
  assert.equal(BOUND_TARGET, DELTA_TARGET, "BOUND_TARGET must equal the sentinel DELTA_TARGET");
  assert.equal(DRIFT_THRESHOLD, SENTINEL_DRIFT, "DRIFT_THRESHOLD must equal the sentinel value");
  assert.equal(CALM_WINDOW, SENTINEL_CALM, "CALM_WINDOW must equal the sentinel value");
  // The params the page reads (c = B = 1/24, eps) are the pre-registered ones.
  assert.equal(state.tracker.params.c, TRACKER_PARAMS.c, "c is the pre-registered param");
  assert.equal(state.tracker.params.B, TRACKER_PARAMS.B, "B is the pre-registered param");
  assert.equal(state.tracker.params.eps, TRACKER_PARAMS.eps, "eps is the pre-registered param");
  // The page prints "c = B ="; make that equality load-bearing. Mutant: a state with c != B reds here.
  assert.equal(state.tracker.params.c, state.tracker.params.B, "the page prints 'c = B' — c must equal B");
});

test("narabi_live_t_geq_7_explanation_present — the T>=7 rationale renders, digit-free, as a JSX child", () => {
  const noExempt = new Set<string>();
  // (a) the rationale carries its meaning: seven steps = one week of verifiable replay before a series.
  for (const needle of ["seven", "one week", "series", "replay", "recompute"]) {
    assert.ok(WHY_SEVEN.toLowerCase().includes(needle), `WHY_SEVEN must mention "${needle}"`);
  }
  assert.match(TRACKER_ADAPTS, /tracker adapts/i);
  assert.match(TRACKER_ADAPTS, /gate does not yet/i);
  assert.match(NO_COVERAGE_MEASURED, /no coverage is measured/i);

  // (b) DIGIT-FREE: the spelled-out copy carries no rendered numeric literal. Mutant: put a digit in any of
  // these consts -> scanNumericText reds it.
  const digitFree: Record<string, string> = {
    WHY_SEVEN,
    TRACKER_ADAPTS,
    NO_COVERAGE_MEASURED,
    STATUS_IS_A_WORD,
    HERO_DEK,
    WINDOWS_LEDE,
  };
  for (const [name, copy] of Object.entries(digitFree)) {
    assert.deepEqual(scanNumericText(copy, noExempt), [], `${name} must be digit-free`);
  }

  // (c) CARRIER: each const is actually rendered as a JSX child {ID} in the component (never dead copy),
  // mirroring the ci-gates carrier checks. Mutant: delete the {WHY_SEVEN} render -> red.
  const comp = readComponent();
  for (const id of ["WHY_SEVEN", "TRACKER_ADAPTS", "NO_COVERAGE_MEASURED", "STATUS_IS_A_WORD"]) {
    assert.ok(comp.includes("{" + id + "}"), `${id} must render as a JSX child {${id}} in narabi-live.tsx`);
  }
});

test("narabi_live_d8_byte_identical — D8_SENTENCE equals test/ci-gates.test.ts byte for byte (ADR-M012 D8)", () => {
  const ci = readFileSync(join(ROOT, "test", "ci-gates.test.ts"), "utf8");
  const start = ci.indexOf("const D8_SENTENCE =");
  assert.ok(start >= 0, "ci-gates.test.ts must declare const D8_SENTENCE");
  // The sentence itself contains semicolons, so anchor the end on the next statement (`const MUTANTS`).
  const end = ci.indexOf("const MUTANTS", start);
  assert.ok(end > start, "`const MUTANTS` must follow the D8_SENTENCE declaration in ci-gates.test.ts");
  // Reconstruct from its double-quoted segments (segments carry only apostrophes, so "([^"]*)" is exact).
  const segs = ci.slice(start, end).match(/"([^"]*)"/g);
  assert.ok(segs, "D8_SENTENCE must be one or more quoted string segments");
  const reconstructed = segs.map((s) => s.slice(1, -1)).join("");
  // Mutant: alter one byte of narabi-live's D8_SENTENCE -> this equality reds.
  assert.equal(D8_SENTENCE, reconstructed, "narabi-live D8_SENTENCE must be byte-identical to the ci-gates copy");
  assert.ok(readComponent().includes("{D8_SENTENCE}"), "the D8 sentence must render as {D8_SENTENCE}");
});

test("narabi_live_snapshot_badge_when_fetch_fails — a failed same-origin read falls back to the snapshot, DECLARED", async () => {
  const at = new Date("2026-09-18T04:00:00Z");
  const failing = (url: string): Promise<string> => Promise.reject(new Error("read blocked " + url));
  const snap = await loadNarabi({ fetchText: failing, snapshot: NARABI_SNAPSHOT, now: at });
  assert.equal(snap.sourceKind, "snapshot", "a failed fetch must fall back to the committed snapshot");
  assert.match(snap.source, /snapshot/i, "the source line must SAY it is a snapshot (never a silent substitution)");
  assert.ok(snap.source.includes(NARABI_SNAPSHOT.capturedAt), "the snapshot source line carries the capture date");
  assert.ok(snap.liveError !== null && snap.liveError.length > 0, "the live read error is recorded");
  assert.ok(snap.lines.length >= 1, "snapshot timeline still parses");
  assert.equal(typeof snap.state.projected_bound_leq_target_T, "number", "snapshot state still parses");

  // A working same-origin read yields the live source, no snapshot badge. Mutant: force the snapshot branch
  // always -> `good.sourceKind` reds here.
  const live = (url: string): Promise<string> =>
    Promise.resolve(url.endsWith("state.json") ? NARABI_SNAPSHOT.stateJson : NARABI_SNAPSHOT.timelineJsonl);
  const good = await loadNarabi({ fetchText: live, snapshot: NARABI_SNAPSHOT, now: at });
  assert.equal(good.sourceKind, "live", "a successful fetch is labelled live");
  assert.equal(good.liveError, null, "no live error on success");
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
    if (m.endsWith("/*")) return r.startsWith(m.slice(0, -1)); // "/narabi/*" -> prefix "/narabi/"
    if (m.endsWith("*")) return r.startsWith(m.slice(0, -1));
    return r === m;
  };

  // The chosen page route falls THROUGH the file_server to reverse_proxy localhost:3000 (Next).
  for (const m of matchers) {
    assert.equal(shadowed(NARABI_ROUTE, m), false, `${NARABI_ROUTE} must not be shadowed by ${m}`);
  }
  // Positive controls: the published static files ARE under the matcher (Caddy serves them).
  assert.ok(matchers.some((m) => shadowed("/narabi/state.json", m)), "Caddy must serve /narabi/state.json");
  assert.ok(matchers.some((m) => shadowed("/narabi/timeline.jsonl", m)), "Caddy must serve /narabi/timeline.jsonl");
  // Why /narabi/live was rejected: it IS under the matcher, so the file_server would 404 it (mutant target).
  assert.equal(shadowed("/narabi/live", "/narabi/*"), true, "a /narabi/live route would be shadowed by the file_server");
});

test("narabi_first_reading_label_reads_committed_t — the hero pill reads N from the committed state (ruling C-3/C-5/Q-8b)", () => {
  const base = parseState(NARABI_SNAPSHOT.stateJson);
  const lines = parseTimeline(NARABI_SNAPSHOT.timelineJsonl);
  // The committed snapshot IS the T=1 series (tracker.t = 1, two published windows). N is READ from these bytes.
  assert.equal(base.tracker.t, 1, "the committed snapshot is the T=1 series (N is read, not typed)");
  assert.equal(lines.length, 2, "the committed snapshot publishes two daily windows");

  // Q-8b: the status WORD follows the FROZEN fleet register ("built"), never the mockup's "shipped". The pure
  // module cannot import fleet.ts (dual-compile), so the root test binds the pill prefix to the register here.
  const narabi = FLEET_AGENTS.find((a) => a.name === "Narabi");
  assert.ok(narabi, "the fleet register must carry a Narabi agent");
  const statusWord = narabi.status; // "built" (fleet_register_built_set_is_frozen)
  assert.equal(statusWord, "built", "Narabi is built in the frozen register (D-51/D-123)");

  // Fully-typed synthetic states (no `any`): override tracker.t only. Two timeline lengths prove the
  // published-branch N is lines.length, not a typed literal.
  const at = (t: number): NarabiState => ({ ...base, tracker: { ...base.tracker, t } });
  const first = lines[0];
  assert.ok(first, "the committed timeline has at least one window");
  const nineWindows: TimelineLine[] = Array.from({ length: 9 }, () => first);

  const stepLabel = (t: number): string =>
    `${statusWord} · step ${String(t)} of ${String(SERIES_MIN_STEPS)} before first reading`;
  const publishedLabel = (n: number): string => `${statusWord} · ${String(n)} windows published`;

  // t < SERIES_MIN_STEPS: "built · step N of 7 before first reading"; N = tracker.t, read from the state.
  assert.equal(firstReadingLabel(base, lines), stepLabel(1), "t=1 (committed): step 1 of 7, N read from the snapshot");
  assert.equal(firstReadingLabel(at(6), lines), stepLabel(6), "t=6: step 6 of 7 (a typed literal N would red here)");
  // Boundary at EXACTLY SERIES_MIN_STEPS switches to the published-windows label — never a false "of 7" at T=7.
  assert.equal(firstReadingLabel(at(SERIES_MIN_STEPS), lines), publishedLabel(2), "t=7: switches to N windows published (N = lines.length)");
  assert.equal(firstReadingLabel(at(SERIES_MIN_STEPS), nineWindows), publishedLabel(9), "t=7: N follows lines.length, not a typed literal");
  assert.equal(firstReadingLabel(at(SERIES_MIN_STEPS + 1), lines), publishedLabel(2), "past the horizon stays on the published-windows label");

  // The pill status word equals the frozen register value, and is "built", never "shipped"/"day N".
  for (const s of [base, at(6), at(SERIES_MIN_STEPS)]) {
    const label = firstReadingLabel(s, lines);
    assert.equal(label.split(" · ")[0], statusWord, "the pill status word must equal the frozen fleet register status (Q-8b)");
    assert.ok(!/shipped/i.test(label), "the pill never says 'shipped' (ruling Q-8b)");
    assert.ok(!/\bday\s+\d/i.test(label), "the pill never says 'day N' (M-15: the first published window was not evaluable)");
  }

  // CARRIER: the component renders the pill as {firstReadingLabel(...)} (never dead copy). Mutant: delete it -> red.
  assert.ok(readComponent().includes("{firstReadingLabel("), "narabi-live.tsx must render {firstReadingLabel(state, lines)} in the hero");
});

test("narabi_first_reading_label_single_source_of_seven — the week length is SERIES_MIN_STEPS alone (ruling C-5, M-17)", () => {
  const src = readFileSync(join(ROOT, "apps", "site", "lib", "narabi-live.ts"), "utf8");
  // Extract the firstReadingLabel function (signature -> next top-level export); the docstring above is excluded.
  const start = src.indexOf("export function firstReadingLabel");
  assert.ok(start >= 0, "narabi-live.ts must export firstReadingLabel");
  const nextExport = src.indexOf("\nexport ", start + 1);
  const body = nextExport > start ? src.slice(start, nextExport) : src.slice(start);
  // (a) the "7" is READ from SERIES_MIN_STEPS; (b) no bare digit 7 hard-coded in the label.
  assert.ok(body.includes("SERIES_MIN_STEPS"), "firstReadingLabel must derive the week length from SERIES_MIN_STEPS");
  assert.ok(!/\b7\b/.test(body), "firstReadingLabel must not hard-code the digit 7 (single source, C-5)");
  // (c) SERIES_MIN_STEPS is the ONLY constant in the file bound to 7 — no duplicate week-length constant.
  const sevenConsts = src.match(/\bconst\s+[A-Za-z_$][\w$]*\s*=\s*7\b/g) ?? [];
  assert.deepEqual(sevenConsts, ["const SERIES_MIN_STEPS = 7"], "exactly one const is bound to 7: SERIES_MIN_STEPS");
  // No duplicate week-length CONSTANT (a comment mentioning the forbidden name, as this file does, is fine).
  assert.equal((src.match(/\bconst\s+WINDOW_BEFORE_FIRST_READING\b/g) ?? []).length, 0, "no WINDOW_BEFORE_FIRST_READING duplicate constant (C-5, M-17)");
});

test("narabi_glossary_under_calib_generic_digit_free — the glossary defines under_calib, generic + digit-free (ruling C-11, M-23)", () => {
  const entry = GLOSSARY.find((g) => g.term === "under_calib");
  assert.ok(entry, "GLOSSARY must define under_calib (it lived in the copy but was missing from the glossary — M-23)");
  // Digit-free: the same numeric scanner behind root test 44. Mutant: put a digit in the def -> red.
  assert.deepEqual(scanNumericText(entry.def, new Set<string>()), [], "the under_calib def must be digit-free");
  // Generic English, NOT the Ukemi "stratum" vocabulary (C-11: the word lives generically on the Narabi page).
  assert.ok(!/stratum/i.test(entry.def), "the under_calib def must be generic, never the Ukemi 'stratum' vocabulary");
  assert.ok(/calib/i.test(entry.def), "the def must speak of calibration");
  assert.ok(/abstain|withheld|withhold|no region|serving no/i.test(entry.def), "the def must state the withheld/abstained region");
  // CARRIER: every glossary def renders as {g.def} in the component (a Fact value). Mutant: stop rendering -> red.
  assert.ok(readComponent().includes("{g.def}"), "narabi-live.tsx must render each glossary def as {g.def}");
});

test("narabi_icon_svg_local_no_remote_url — the per-route favicon is local + adaptive, loads nothing remote (ruling Q-3b)", () => {
  const svg = readFileSync(join(ROOT, "apps", "site", "app", "narabi", "icon.svg"), "utf8");
  // Adaptive dark/light via prefers-color-scheme (never a second file, never a script).
  assert.match(svg, /@media\s*\(prefers-color-scheme/i, "the favicon must be adaptive (@media prefers-color-scheme)");
  // 0 URL LOADED: no remote stylesheet/image/font. Mutant "favicon distant": inject a remote resource -> red.
  assert.ok(!/url\(\s*["']?https?:/i.test(svg), "no CSS url(http…) load");
  assert.ok(!/@import/i.test(svg), "no @import");
  assert.ok(!/<image\b/i.test(svg), "no <image> raster load");
  assert.ok(!/(?:href|src|xlink:href)\s*=\s*["']?https?:/i.test(svg), "no remote href/src/xlink:href");
  // The ONLY http(s) URI is the SVG xmlns namespace (a declaration, not a load).
  const httpHits = svg.match(/https?:\/\/[^"'\s>]+/g) ?? [];
  assert.deepEqual(httpHits, ["http://www.w3.org/2000/svg"], "the only URI is the SVG xmlns namespace, not a remote load");
});
