// apps/site/lib/narabi-live.ts — the read-only logic of the Narabi sentinel page, as pure, typed
// TypeScript.
//
// DUAL-COMPILE (mirrors lib/fleet.ts L9-16): this module is compiled by TWO programs — the root test program
// (moduleResolution "nodenext", lib "esnext", NO dom) and the Next bundler ("bundler", dom). So it is
// SELF-CONTAINED: no relative import (none type-checks under both), no `@/` alias, no `node:` builtin, and no
// reference to `fetch`/`window`/`document`/`crypto` (the caller injects `fetchFile` and `sha256Hex`). The client
// component wires the browser fetcher and Web Crypto in; `test/narabi-live.test.ts` injects fakes and node:crypto.
//
// HONESTY (test 44): NOTHING here renders. Every number the page shows is a property read of the
// parsed state/timeline, a value recomputed here from those files, or a derivation whose assumption is printed
// next to it (the honesty lint scans only JSX rendered positions, so a `{state.tracker.q}` read is never a
// literal). The digit-bearing copy that DOES render — the frozen D8 sentence (carries "2024"/"24h") — is a const
// read `{D8_SENTENCE}`, the one declared exception; every other copy const is digit-free
// (proven by test/narabi-live.test.ts). The schedule and gate facts come from apps/site/data/narabi-served.json and
// the first paint from apps/site/data/narabi-capture.json, both read at build through a manifest-checked loader.
//
// PROVIDERS: a published line carries the URL of every RPC endpoint in the sentinel's read pool.
// Those URLs name data providers and never reach a rendered position: `parseTimeline` PROJECTS each line to its
// endpoint COUNT and drops the list, and `loadNarabi` keeps no served body (it checks the byte prefix at read time and
// keeps only the yes/no), so neither the page, the server-rendered payload nor the browser's state holds one.

/* ─────────────────────────── routes (single source, used by page/fleet/header/test) ─────────────────── */

// The Next page lives on the BARE path. Caddy serves `handle_path /narabi/*` (deploy/Caddyfile.monark-
// narabi.snippet) to the sentinel's static files; the Caddy path matcher `/narabi/*` matches `/narabi/…`
// (so /narabi/state.json + /narabi/timeline.jsonl are served) but NOT the bare `/narabi`, which therefore
// falls through to `reverse_proxy localhost:3000` and reaches Next. Measured against the Caddy docs (path
// matchers): "`/foo/*` will not match `/foo`"; "Path matching is an exact match by default." A `/narabi/live`
// route would be WORSE — it is under `/narabi/*` and the file_server would 404 it. See test 6.
export const NARABI_ROUTE = "/narabi";
export const STATE_PATH = "/narabi/state.json";
export const TIMELINE_PATH = "/narabi/timeline.jsonl";

/* ─────────────────────────── pre-registered constants ────────────────────────────────────────────────── */

// Kept identical to apps/sentinel/src/timeline.ts (DRIFT_THRESHOLD / CALM_WINDOW / DELTA_TARGET); the root
// test asserts the identity, so a drift between page and sentinel reds rather than silently mis-states.
export const DRIFT_THRESHOLD = 0.4; // r_t >= 0.40 opens an ADR (never an automatic switch)
export const CALM_WINDOW = 90; // the drift criterion is evaluable after 90 calm pairs
export const BOUND_TARGET = 0.1; // delta_target = alpha (the printed bound is compared to this)
export const SERIES_MIN_STEPS = 7; // seven daily steps = one week, before we speak of a series (policy, not data)

/* ─────────────────────────── published shapes (state.json / timeline.jsonl) ─────────────────────────── */

export interface TrackerParams {
  alpha: number;
  c: number;
  eps: number;
  t0: number;
  B: number;
}

export interface TrackerState {
  q: number;
  t: number;
  q1: number;
  params: TrackerParams;
}

export interface NarabiState {
  tracker: TrackerState;
  digest: string;
  projected_bound_leq_target_T: number;
  replay_q: number;
}

export interface Regime {
  floor: boolean;
  stress: boolean;
}

export type PairStatus = "evaluable" | "non_evaluable" | "clipped";
export type Miss = 0 | 1;

/** One published timeline line as SERVED (apps/sentinel/src/timeline.ts TimelineLine, all 34 fields). */
export interface PublishedLine {
  day: string;
  from_block: number;
  to_block: number;
  burns: string;
  mints: string;
  supply_close: string;
  s_open: string;
  c1_ok: boolean;
  utterance_hash: string;
  attested_flow_sha256: string;
  v: number | null;
  regime: Regime;
  pair_status: PairStatus;
  s_raw: number | null;
  s: number | null;
  E_tracker: Miss | null;
  q_before: number;
  eta: number | null;
  q_after: number;
  T: number;
  mean_E_tracker: number | null;
  bound_thm1: number | null;
  digest_T: string;
  E_static: Miss | null;
  t_deg: number;
  sum_E_static: number;
  B_t: number;
  rolling90_calm_miss: number | null;
  drift_flag: boolean;
  prev_line_hash: string;
  line_hash: string;
  endpoints: readonly string[];
  node_version: string;
  sentinel_sha: string;
}

/** The line the site keeps: every served field EXCEPT the endpoint URLs, of which only the count survives (null when a
 *  line carries no list: the page then prints a dash, never an invented zero). */
export type TimelineLine = Omit<PublishedLine, "endpoints"> & { endpoints_count: number | null };

/** The committed capture of the two published files (apps/site/data/narabi-capture.json, read at build by
 *  lib/narabi-capture-load.ts): state.json as served, the timeline as served with each line's endpoint URL list
 *  replaced by its count, and the sha256 + length of the timeline AS SERVED at capture. */
export interface NarabiSnapshot {
  readonly capturedAt: string;
  readonly source: string;
  readonly stateJson: string;
  readonly timelineJsonl: string;
  readonly stateSha256: string;
  readonly timelineSha256: string;
  readonly served: { readonly timelineSha256: string; readonly timelineChars: number };
}

/** What the browser needs to test "the live timeline extends the timeline served at capture, byte for byte": the
 *  served timeline's length, its sha256 and the capture day (never any bytes). */
export interface CaptureRef {
  readonly capturedAt: string;
  readonly timelineChars: number;
  readonly timelineSha256: string;
}

export type SourceKind = "live" | "capture";

export interface NarabiData {
  state: NarabiState;
  lines: TimelineLine[];
  sourceKind: SourceKind;
  source: string;
  /** ISO instant of the live read; null while the page shows the committed capture. */
  readAt: string | null;
  /** Last-Modified of each served file, as an ISO instant (null when absent or unparseable, or in capture mode). */
  publishedAt: { state: string | null; timeline: string | null };
  /** Why the live read failed (capture mode after a failed attempt); null otherwise. */
  liveError: string | null;
  /** Live only: whether the timeline served now starts, byte for byte, with the timeline served at capture. Computed
   *  when the files are read (the served body, which carries the endpoint URLs, is not kept); null on the capture. */
  extendsCapture: boolean | null;
}

/* ─────────────────────────── parsing (typed, so the root test never touches `any`) ──────────────────── */

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

export function parseState(text: string): NarabiState {
  const v = JSON.parse(text) as unknown;
  if (!isRecord(v) || !isRecord(v.tracker) || !isRecord(v.tracker.params) || typeof v.digest !== "string") {
    throw new Error("state.json is not the published tracker state shape");
  }
  return v as unknown as NarabiState;
}

/** Drop the endpoint URLs, keep their count (the page may say how many, never which). A line of the committed
 *  capture already carries only the count (endpoints_count) and passes through. A line with no list, or a count that
 *  is not a whole number, keeps null: the page prints a dash rather than an invented zero. */
export function projectLine(p: PublishedLine | TimelineLine): TimelineLine {
  if ("endpoints" in p) {
    const { endpoints, ...rest } = p;
    return { ...rest, endpoints_count: Array.isArray(endpoints) ? endpoints.length : null };
  }
  const n = (p as { endpoints_count?: unknown }).endpoints_count;
  return { ...p, endpoints_count: typeof n === "number" && Number.isInteger(n) && n >= 0 ? n : null };
}

export function parseTimeline(text: string): TimelineLine[] {
  const out: TimelineLine[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.length === 0) continue;
    const v = JSON.parse(line) as unknown;
    if (!isRecord(v) || typeof v.day !== "string" || typeof v.line_hash !== "string" || !isRecord(v.regime)) {
      throw new Error("timeline.jsonl carries a line that is not the published line shape");
    }
    out.push(projectLine(v as unknown as PublishedLine | TimelineLine));
  }
  return out;
}

/* ─────────────────────────── loader: committed capture first, then the same-origin live files ───────── */

export const LIVE_SOURCE = "published files, served read-only at /narabi/ (same origin)";

export function captureSource(capturedAt: string, liveError: string | null): string {
  return liveError === null
    ? `committed capture of the published files, taken ${capturedAt}; the files as served now are read once this page runs in a browser`
    : `committed capture of the published files, taken ${capturedAt} (the same-origin read of the files as served now failed)`;
}

/** The capture as page data (server side, at build): parsed and projected, so no endpoint URL is serialised. */
export function captureData(snap: NarabiSnapshot): NarabiData {
  return {
    state: parseState(snap.stateJson),
    lines: parseTimeline(snap.timelineJsonl),
    sourceKind: "capture",
    source: captureSource(snap.capturedAt, null),
    readAt: null,
    publishedAt: { state: null, timeline: null },
    liveError: null,
    extendsCapture: null,
  };
}

export function captureRef(snap: NarabiSnapshot): CaptureRef {
  return { capturedAt: snap.capturedAt, timelineChars: snap.served.timelineChars, timelineSha256: snap.served.timelineSha256 };
}

/** A served file as read: its body and its Last-Modified header (null when the server sent none). */
export interface FetchedFile {
  text: string;
  lastModified: string | null;
}

/** An HTTP-date (Last-Modified) as an ISO instant; null when absent or unparseable. */
export function httpDateToIso(v: string | null): string | null {
  if (isNil(v)) return null;
  const t = Date.parse(v);
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

export interface LoadOptions {
  /** Injected so this module never references the DOM `fetch`. Returns the body and Last-Modified, or throws. */
  fetchFile: (url: string) => Promise<FetchedFile>;
  /** The timeline served at capture (length + sha256): the served body is checked against it when it is read. */
  capture: CaptureRef;
  /** The hasher (Web Crypto in the browser, node:crypto in the test). */
  sha256Hex: Sha256Hex;
  statePath?: string;
  timelinePath?: string;
  now?: Date;
  /** The wait before the one re-read (injected by the test; a timer otherwise). */
  sleep?: (ms: number) => Promise<void>;
}

/** The sentinel copies timeline.jsonl, then state.json, into the served directory one after the other (neither copy is
 *  atomic), so a read that lands during the daily publication can see a torn last line, or pair one day's state with
 *  another day's timeline. When the first read fails or state.json's digest is not the last line's digest_T, the page
 *  waits this long and reads both files ONCE more; only that second read's result is reported. */
export const REREAD_DELAY_MS = 1500;

const timerSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Whether state.json's digest is the last published line's digest_T. */
export function stateAgreesWithLastLine(state: NarabiState, lines: readonly TimelineLine[]): boolean {
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  return last !== undefined && state.digest === last.digest_T;
}

/** Read the two files as served now. Throws on ANY failure; the caller keeps the committed capture and SAYS SO. The
 *  timeline body is checked against the capture's served prefix here, then dropped: only the yes/no is kept. */
export async function loadNarabi(opts: LoadOptions): Promise<NarabiData> {
  const statePath = opts.statePath ?? STATE_PATH;
  const timelinePath = opts.timelinePath ?? TIMELINE_PATH;
  const attempt = async (): Promise<{ stateFile: FetchedFile; timelineFile: FetchedFile; state: NarabiState; lines: TimelineLine[] }> => {
    const [stateFile, timelineFile] = await Promise.all([opts.fetchFile(statePath), opts.fetchFile(timelinePath)]);
    return { stateFile, timelineFile, state: parseState(stateFile.text), lines: parseTimeline(timelineFile.text) };
  };
  let got = await attempt().catch(() => null);
  if (got === null || !stateAgreesWithLastLine(got.state, got.lines)) {
    await (opts.sleep ?? timerSleep)(REREAD_DELAY_MS);
    got = await attempt();
  }
  return {
    state: got.state,
    lines: got.lines,
    sourceKind: "live",
    source: LIVE_SOURCE,
    readAt: (opts.now ?? new Date()).toISOString(),
    publishedAt: { state: httpDateToIso(got.stateFile.lastModified), timeline: httpDateToIso(got.timelineFile.lastModified) },
    liveError: null,
    extendsCapture: await extendsCapture(got.timelineFile.text, opts.capture, opts.sha256Hex),
  };
}

/** The data the page shows after a failed live read: the capture it already had, with the failure SAID. */
export function captureAfterFailure(initial: NarabiData, capturedAt: string, err: unknown): NarabiData {
  const liveError = err instanceof Error ? err.message : String(err);
  return { ...initial, sourceKind: "capture", source: captureSource(capturedAt, liveError), liveError };
}

/* ─────────────────────────── formatting helpers (facts only; a zero is a fact) ──────────────────────── */

export function isNil(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

function groupThousands(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const WEI_PER_UNIT = 10n ** 18n; // USDe has 18 decimals
const COMPACT_SCALES: ReadonlyArray<readonly [bigint, string]> = [
  [10n ** 9n, " B"],
  [10n ** 6n, " M"],
  [10n ** 3n, " k"],
];

/** Hundredths of `wei / (WEI_PER_UNIT * scale)`, rounded half-up, as "I.FF". Exact integer maths, no float. */
function hundredthsLabel(wei: bigint, scale: bigint): string {
  const denom = WEI_PER_UNIT * scale;
  const h = (wei * 100n + denom / 2n) / denom;
  const frac = (h % 100n).toString().padStart(2, "0");
  return `${(h / 100n).toString()}.${frac}`;
}

/** 18-decimal integer string -> compact human units, ROUNDED HALF-UP (never truncated). Exact BigInt maths. */
export function compact18(str: string | null): string {
  if (isNil(str)) return "—";
  const s = String(str);
  if (!/^\d+$/.test(s)) return s; // not an unsigned integer: printed as served
  const wei = BigInt(s);
  if (wei === 0n) return "0"; // a zero is a fact, printed as 0
  if (wei < WEI_PER_UNIT) return "<1";
  for (let i = 0; i < COMPACT_SCALES.length; i++) {
    const entry = COMPACT_SCALES[i];
    if (entry === undefined) continue;
    const [scale, suffix] = entry;
    if (wei >= WEI_PER_UNIT * scale) {
      const label = hundredthsLabel(wei, scale);
      // Rounding can carry to the next unit (999.995 M -> 1.00 B): re-express on the larger scale.
      const larger = i > 0 ? COMPACT_SCALES[i - 1] : undefined;
      if (larger !== undefined && label.startsWith("1000.")) return hundredthsLabel(wei, larger[0]) + larger[1];
      return label + suffix;
    }
  }
  const whole = (wei + WEI_PER_UNIT / 2n) / WEI_PER_UNIT;
  const top = COMPACT_SCALES[COMPACT_SCALES.length - 1];
  if (top !== undefined && whole >= top[0]) return hundredthsLabel(wei, top[0]) + top[1];
  return groupThousands(whole.toString());
}

export function sci(v: number | null, sig = 4): string {
  if (isNil(v)) return "—";
  return v.toExponential(sig);
}

export function fixed(v: number | null, d = 3): string {
  if (isNil(v)) return "—";
  return v.toFixed(d);
}

/** A plain number as JavaScript prints it: 0.1 -> "0.1", 1789 -> "1789". */
export function fmtNum(v: number | null): string {
  if (isNil(v)) return "—";
  return String(v);
}

/** An ISO instant as "YYYY-MM-DD HH:MM:SS UTC" for the register lines. Built here (not in the render path) so
 *  the component does no string arithmetic in a rendered position. */
export function readAtLabel(iso: string | null): string {
  if (isNil(iso)) return "—";
  return iso.replace("T", " ").slice(0, 19) + " UTC";
}

/** Derive "1/n" from a value that is the reciprocal of an integer (c = B = 0.0416… -> "1/24"). No literal. */
export function unitFraction(v: number | null): string {
  if (isNil(v) || !(v > 0)) return fmtNum(v);
  const inv = 1 / v;
  const rounded = Math.round(inv);
  if (rounded > 0 && Math.abs(inv - rounded) < 1e-6) return "1/" + String(rounded);
  return fmtNum(v);
}

export function shortHash(h: string | null, n = 8): string {
  if (isNil(h)) return "—";
  const s = String(h);
  return s.length > 2 * n + 1 ? s.slice(0, n) + "…" + s.slice(-n) : s;
}

/** Calm = the opening stock clears the committed floor AND burns stay under one percent of it — the sentinel's
 *  own definition (apps/sentinel/src/timeline.ts isCalm), read from the two published regime flags. */
export function isCalmRegime(r: Regime | null): boolean {
  return !isNil(r) && r.floor && !r.stress;
}

export function regimeWord(r: Regime | null): string {
  if (isNil(r)) return "—";
  if (r.stress && !r.floor) return "stress, below floor";
  if (r.stress) return "stress";
  if (!r.floor) return "below floor";
  return "calm";
}

export function pairWord(p: string | null): string {
  if (isNil(p)) return "—";
  return String(p).replace(/_/g, " ");
}

/** A published 0/1 miss as a word: a miss is named, a hit is a dash, a non-evaluable window is empty. */
export function missWord(e: Miss | null): string {
  if (isNil(e)) return "";
  return e === 1 ? "miss" : "—";
}

/** When the sentinel clipped a score into [0, B], the raw score it clipped from (s_raw); empty otherwise. */
export function clippedNote(l: TimelineLine): string {
  if (isNil(l.s_raw) || l.s_raw === l.s) return "";
  return ` (clipped from ${sci(l.s_raw, 4)})`;
}

export function c1Word(ok: boolean | null): string {
  if (isNil(ok)) return "—";
  return ok ? "holds" : "fails";
}

/* ─────────────────────────── the tracker, ported so this browser can recompute it ───────────────────── */
// Byte-for-byte ports of packages/hikae/src/tracker.ts (trackerStepSize, trackerStep via l2-monitor imocpStep,
// trackerReplay) and apps/sentinel/src/timeline.ts (boundThm1). test/narabi-live.test.ts pins each port against
// the producer on the committed capture, so a drift between page and producer reds.

export function trackerStepSize(t: number, params: TrackerParams): number {
  const base = t + 1 + params.t0;
  return params.c * base ** (-1 / 2 - params.eps);
}

/** ABB Theorem 1 long-run bound at T live steps: (B + η₁)/(T·η_T). */
export function boundThm1(T: number, params: TrackerParams): number {
  const eta1 = trackerStepSize(0, params);
  const etaT = trackerStepSize(T - 1, params);
  return (params.B + eta1) / (T * etaT);
}

/** Replay the tracker from (q1, params, scores) in order: q_{t+1} = q_t − η_t·(α − 1{s_t > q_t}). */
export function replayTracker(q1: number, params: TrackerParams, scores: readonly number[]): { q: number; t: number } {
  let q = q1;
  let t = 0;
  for (const s of scores) {
    const eta = trackerStepSize(t, params);
    const E = s > q ? 1 : 0;
    q = q - eta * (params.alpha - E);
    t = t + 1;
  }
  return { q, t };
}

/** The scores the tracker stepped on, in order: the published `s` of every line that stepped. */
export function steppedScores(lines: readonly TimelineLine[]): number[] {
  const out: number[] = [];
  for (const l of lines) if (!isNil(l.s)) out.push(l.s);
  return out;
}

export interface ReplayCheck {
  recomputed: string;
  published: string;
  same: boolean;
  text: string;
}

/** Recompute q from q₁, the params and the published s column, and compare with state.json at the printed digits. */
export function replayCheck(state: NarabiState, lines: readonly TimelineLine[]): ReplayCheck {
  const r = replayTracker(state.tracker.q1, state.tracker.params, steppedScores(lines));
  const recomputed = sci(r.q, 6);
  const published = sci(state.replay_q, 6);
  const same = recomputed === published && r.t === state.tracker.t;
  const text = same
    ? `${recomputed}, the same as the published replay_q to the printed digits, over T = ${String(r.t)} steps`
    : `${recomputed} over ${String(r.t)} steps, NOT the published replay_q ${published} (T = ${String(state.tracker.t)})`;
  return { recomputed, published, same, text };
}

/* ─────────────────────────── derivations, each carrying its assumption ──────────────────────────────── */

export function addDays(isoDay: string, n: number): string {
  const d = new Date(isoDay + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export interface ProjectedBound {
  T: number | null;
  date: string | null;
  assumption: string;
}

export function projectedBoundDate(state: NarabiState, lines: readonly TimelineLine[]): ProjectedBound {
  const T = state.projected_bound_leq_target_T;
  if (isNil(T)) return { T: null, date: null, assumption: "no projection published" };
  // The tracker steps only on a pair (evaluable or clipped); the first published window was not evaluable (no prior
  // velocity), and a pair needs two consecutive windows, so the real first step lands later than J0 + 1.
  let firstStep: string | null = null;
  for (const l of lines) {
    if (!isNil(l.s)) {
      firstStep = l.day;
      break;
    }
  }
  const j0 = lines.length > 0 ? lines[0] : undefined;
  const anchor = firstStep ?? (j0 ? addDays(j0.day, 1) : null);
  const assumption = firstStep
    ? `assumes one stepped pair per calendar day from the first tracker step (${firstStep}), under the published parameters; a change of c or ε would open a new parameter segment and move the printed bound to the arbitrary-step theorem of the same paper.`
    : `assumes one stepped pair per calendar day from the day after J0; the first window was not evaluable and a pair needs two consecutive windows, so any further non-evaluable window pushes this later.`;
  return { T, date: anchor ? addDays(anchor, T - 1) : null, assumption };
}

// The hero pill copy. PURE and read-only. The status word is "built": it follows
// the frozen fleet register (test/narabi-live.test.ts asserts this prefix equals FLEET_AGENTS' Narabi status),
// never the mockup's "shipped". Before the series is readable (t < SERIES_MIN_STEPS) the pill
// says which step of the week we are on: N is state.tracker.t, the number of stepped pairs (evaluable or clipped) —
// never "day N", since the first published window was not evaluable (the tracker steps only on a pair). At or past the
// horizon it says how many daily windows have been published (N = lines.length). The week length is
// SERIES_MIN_STEPS, its SINGLE source — there is no separate WINDOW_BEFORE_FIRST_READING constant.
// The server renders this label from the committed capture (declared as such); the browser then re-renders it
// from the live files.
export function firstReadingLabel(state: NarabiState, lines: readonly TimelineLine[]): string {
  const t = state.tracker.t;
  if (t < SERIES_MIN_STEPS) {
    return `built · step ${String(t)} of ${String(SERIES_MIN_STEPS)} before first reading`;
  }
  return `built · ${String(lines.length)} windows published`;
}

export interface DriftStatus {
  value: number | null;
  threshold: number;
  window: number;
  n: number;
  evaluable: boolean;
  fired: boolean;
  text: string;
}

/** Calm pairs as the sentinel counts them (apps/sentinel/src/timeline.ts step: a pair that STEPPED — evaluable or
 *  clipped — whose previous window AND own window are both calm). */
export function calmPairCount(lines: readonly TimelineLine[]): number {
  let n = 0;
  for (let i = 1; i < lines.length; i++) {
    const cur = lines[i];
    const prev = lines[i - 1];
    if (cur === undefined || prev === undefined) continue;
    if (cur.pair_status !== "non_evaluable" && isCalmRegime(prev.regime) && isCalmRegime(cur.regime)) n++;
  }
  return n;
}

export function driftStatus(lines: readonly TimelineLine[]): DriftStatus {
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  const n = Math.min(calmPairCount(lines), CALM_WINDOW);
  const value = last ? last.rolling90_calm_miss : null;
  const evaluable = n >= CALM_WINDOW && !isNil(value);
  const text = evaluable
    ? `${fixed(value, 3)} against ${fixed(DRIFT_THRESHOLD, 2)}`
    : `${String(n)} of ${String(CALM_WINDOW)} calm pairs — evaluable after the window fills`;
  return { value, threshold: DRIFT_THRESHOLD, window: CALM_WINDOW, n, evaluable, fired: last ? last.drift_flag : false, text };
}

/** The sentinel's publication schedule and the external probe's freshness deadline (apps/site/data/narabi-served.json,
 *  read at build by lib/narabi-served-load.ts). */
export interface PublishSchedule {
  readonly on_calendar_utc: readonly string[];
  readonly randomized_delay_s: number;
  readonly deadline_utc: string;
}

export interface LagStatus {
  late: number;
  text: string;
}

const DAY_MS = 86_400_000;

/** A window for day D closes at the end of its UTC day and is published during D+1 (first slot, retries); it
 *  counts as late only after the external probe's deadline on D+1 — the SAME criterion as the probe's
 *  expectedLastDay (scripts/probe-narabi.mjs), pinned by test/narabi-live.test.ts. Live data only. */
export function lagStatus(lines: readonly TimelineLine[], now: Date, sched: PublishSchedule): LagStatus {
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  if (!last) return { late: 0, text: "no window published" };
  const next = addDays(last.day, 1);
  const publishDay = addDays(last.day, 2);
  const due = new Date(`${publishDay}T${sched.deadline_utc}:00Z`);
  const first = sched.on_calendar_utc[0] ?? "—";
  const lastSlot = sched.on_calendar_utc[sched.on_calendar_utc.length - 1] ?? "—";
  const minutes = String(Math.round(sched.randomized_delay_s / 60));
  if (now.getTime() < due.getTime()) {
    return {
      late: 0,
      text: `none; the ${next} window is due on ${publishDay}, after it closes: publication runs from ${first} UTC with retries until ${lastSlot} UTC (each plus up to ${minutes} minutes), and the window counts as late after ${sched.deadline_utc} UTC`,
    };
  }
  const late = Math.floor((now.getTime() - due.getTime()) / DAY_MS) + 1;
  return {
    late,
    text: `${String(late)} window${late > 1 ? "s" : ""} behind (last published ${last.day}; the ${next} window was due by ${sched.deadline_utc} UTC on ${publishDay})`,
  };
}

/** The register's lag line. Only the live files say whether a window is late: on the committed capture the lag
 *  is UNKNOWN (a capture is old by construction; its age is never attributed to the sentinel). */
export function lagView(data: NarabiData, sched: PublishSchedule): { lag: LagStatus | null; text: string } {
  if (data.sourceKind === "live" && data.readAt !== null) {
    const lag = lagStatus(data.lines, new Date(data.readAt), sched);
    return { lag, text: lag.text };
  }
  return { lag: null, text: data.liveError === null ? "unknown until the files as served now are read" : "unknown (the served files could not be read)" };
}

/** The header word: what the page can actually say about the sensor, derived from what it read. Freshness is all it
 *  can see: no window late by the probe's deadline. It never claims the process is running. */
export function liveWord(data: NarabiData, lag: LagStatus | null): string {
  if (data.sourceKind !== "live") return data.liveError === null ? "reading the served files" : "served files unreadable";
  if (lag !== null && lag.late > 0) return `${String(lag.late)} window${lag.late > 1 ? "s" : ""} behind`;
  return "on schedule (no window late)";
}

/* ─────────────────────────── code versions vs tracker parameter segments ─────────────────────────────── */

export interface CodeVersion {
  from: string;
  to: string;
  count: number;
  sentinel_sha: string;
  node_version: string;
}

/** A run of lines written by an unchanged (sentinel_sha, node_version). NOT a parameter segment: a new build
 *  does not change the tracker parameters (see parameterSegments). */
export function codeVersions(lines: readonly TimelineLine[]): CodeVersion[] {
  const runs: CodeVersion[] = [];
  for (const l of lines) {
    const cur = runs.length > 0 ? runs[runs.length - 1] : undefined;
    if (cur && cur.sentinel_sha === l.sentinel_sha && cur.node_version === l.node_version) {
      cur.to = l.day;
      cur.count++;
    } else {
      runs.push({ from: l.day, to: l.day, count: 1, sentinel_sha: l.sentinel_sha, node_version: l.node_version });
    }
  }
  return runs;
}

export function codeVersionLabel(v: CodeVersion): string {
  return `${v.from} → ${v.to} · sentinel ${shortHash(v.sentinel_sha, 6)} · node ${v.node_version}`;
}

/** Equality at a fixed number of significant digits (a port run on another engine may differ in the last ulp). */
function sameToDigits(a: number, b: number, digits: number): boolean {
  return a.toPrecision(digits) === b.toPrecision(digits);
}

export interface ParameterSegments {
  one: boolean | null;
  text: string;
}

/** Tracker parameter segments (after J0 a change of c or ε opens a new segment and the bound
 *  leaves Theorem 1). Derived: if every published bound_thm1 equals the Theorem 1 bound under the published
 *  parameters, the whole timeline is ONE segment. */
export function parameterSegments(state: NarabiState, lines: readonly TimelineLine[]): ParameterSegments {
  let checked = 0;
  for (const l of lines) {
    if (isNil(l.bound_thm1)) continue;
    checked++;
    if (!sameToDigits(l.bound_thm1, boundThm1(l.T, state.tracker.params), 12)) {
      return { one: false, text: `more than one: the bound published for ${l.day} is not the long-run bound under the published parameters` };
    }
  }
  if (checked === 0) return { one: null, text: "no stepped pair yet" };
  return { one: true, text: "one: every published bound equals the long-run bound under the published parameters" };
}

/* ─────────────────────────── served facts the page states, framed ───────────────────────────────────── */

/** The endpoint pool of a line, said as a count. The URLs are never kept (see projectLine). The quorum clause is the
 *  sentinel's own rule for the burns, mints and supply reads (apps/sentinel/src/rpc.ts quorumTwo), bound by test. */
export const QUORUM_CLAUSE = "each burns, mints and supply read needs two distinct providers that agree";

export function endpointPoolLabel(l: TimelineLine | undefined): string {
  if (!l || isNil(l.endpoints_count)) return "—";
  return `${String(l.endpoints_count)} RPC endpoints in the read pool; ${QUORUM_CLAUSE}`;
}

export function staticMissLabel(l: TimelineLine | undefined): string {
  if (!l) return "—";
  return `${String(l.sum_E_static)} of ${String(l.T)} stepped pairs`;
}

export function trackerMissLabel(l: TimelineLine | undefined): string {
  if (!l || isNil(l.mean_E_tracker)) return "—";
  return `${fixed(l.mean_E_tracker, 4)} over T = ${String(l.T)}`;
}

export function sentinelBudgetLabel(l: TimelineLine | undefined): string {
  if (!l) return "—";
  return `${fmtNum(l.B_t)} with t_deg = ${String(l.t_deg)} labels arrived`;
}

export interface Page {
  rows: TimelineLine[];
  page: number;
  pages: number;
  total: number;
  from: number;
  to: number;
  /** Pre-built display strings so the component never does arithmetic in a rendered position. */
  rangeLabel: string;
  pageLabel: string;
}

/** Local pagination, most-recent-first. Page 0 = newest. */
export function paginate(lines: readonly TimelineLine[], pageSize = 90, page = 0): Page {
  const total = lines.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const clamped = Math.min(Math.max(0, page), pages - 1);
  const end = total - clamped * pageSize;
  const start = Math.max(0, end - pageSize);
  const from = start + 1;
  return {
    rows: lines.slice(start, end).reverse(),
    page: clamped,
    pages,
    total,
    from,
    to: end,
    rangeLabel: `rows ${String(from)}–${String(end)} of ${String(total)}`,
    pageLabel: `page ${String(clamped + 1)} of ${String(pages)}`,
  };
}

/** The recompute recipe (facts -> attestation -> tracker replay -> hash chain), built as text so the block
 *  numbers and hashes render through a single `{recipe}` read, never as literals. The replay line prints the
 *  value RECOMPUTED here from the s column, next to the published one. */
export function recomputeRecipe(state: NarabiState, lines: readonly TimelineLine[]): string {
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  const day = last ? last.day : "?";
  const fromBlock = last ? String(last.from_block) : "?";
  const toBlock = last ? String(last.to_block) : "?";
  const burns = last ? last.burns : "?";
  const mints = last ? last.mints : "?";
  const supply = last ? last.supply_close : "?";
  const flowSha = last ? last.attested_flow_sha256 : "?";
  const prevHash = last ? last.prev_line_hash : "?";
  const lineHash = last ? last.line_hash : "?";
  const replay = replayCheck(state, lines);
  return [
    `# facts — window ${day}`,
    `eth_getLogs address=USDe topics=[Transfer] fromBlock=${fromBlock} toBlock=${toBlock}`,
    `  burns = sum(Transfer to the zero address)   -> ${burns}`,
    `  mints = sum(Transfer from the zero address) -> ${mints}`,
    `totalSupply at the close block                 -> ${supply}`,
    `# attestation`,
    `sha256(AttestedFlow bytes)                     -> ${flowSha}`,
    `# tracker replay (recomputed in this page from q1, params and the s column)`,
    `trackerReplay(q1, params, timeline.s) -> q = ${replay.recomputed}`,
    `state.json replay_q (published)       -> q = ${replay.published}`,
    `# hash chain`,
    `prev_line_hash -> ${prevHash}`,
    `line_hash      -> ${lineHash}`,
  ].join("\n");
}

/* ─────────────────────────── integrity, recomputed in the reader's browser ─────────────────────────── */
// "A rewrite is detectable" is only true if someone checks. The page checks, with the hasher the caller injects
// (Web Crypto in the browser, node:crypto in the test): the per-line hash chain (the sentinel's 31-field order,
// apps/sentinel/src/timeline.ts hashedFields — pinned by test), state.json against the last line, the tracker
// digest recomputed from q₁, params and the s column, the C1 identity in exact integers, and — on the files as served
// now only — that the served timeline extends, byte for byte, the one served at capture (answered by loadNarabi).

export type Sha256Hex = (bytes: Uint8Array) => Promise<string>;

/** The hashed projection (fact+score+state+prev), in the sentinel's fixed order. */
export function hashedFields(l: TimelineLine): unknown[] {
  return [
    l.day, l.from_block, l.to_block, l.burns, l.mints, l.supply_close, l.s_open, l.c1_ok,
    l.utterance_hash, l.attested_flow_sha256, l.v, l.regime.floor, l.regime.stress, l.pair_status,
    l.s_raw, l.s, l.E_tracker, l.q_before, l.eta, l.q_after, l.T, l.mean_E_tracker, l.bound_thm1,
    l.digest_T, l.E_static, l.t_deg, l.sum_E_static, l.B_t, l.rolling90_calm_miss, l.drift_flag, l.prev_line_hash,
  ];
}

export function lineHashOf(l: TimelineLine, sha256Hex: Sha256Hex): Promise<string> {
  return sha256Hex(new TextEncoder().encode(JSON.stringify(hashedFields(l))));
}

export const GENESIS = "GENESIS";

export interface ChainCheck {
  ok: boolean;
  links: number;
  brokenAt: string | null;
}

export async function verifyChain(lines: readonly TimelineLine[], sha256Hex: Sha256Hex): Promise<ChainCheck> {
  let prev = GENESIS;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l === undefined) continue;
    if (l.prev_line_hash !== prev) return { ok: false, links: i, brokenAt: l.day };
    if ((await lineHashOf(l, sha256Hex)) !== l.line_hash) return { ok: false, links: i, brokenAt: l.day };
    prev = l.line_hash;
  }
  return { ok: true, links: lines.length, brokenAt: null };
}

/** hikae trackerDigest: sha256 over f64be(alpha, c, eps, t0, B, q1, s_1..s_T), scores in order, −0 as +0. */
export function trackerDigestOf(q1: number, params: TrackerParams, scores: readonly number[], sha256Hex: Sha256Hex): Promise<string> {
  const values = [params.alpha, params.c, params.eps, params.t0, params.B, q1, ...scores];
  const bytes = new Uint8Array(values.length * 8);
  const view = new DataView(bytes.buffer);
  values.forEach((v, i) => {
    view.setFloat64(i * 8, v === 0 ? 0 : v, false);
  });
  return sha256Hex(bytes);
}

export interface C1Check {
  holds: number;
  total: number;
  failDays: string[];
}

/** C1 identity recomputed in exact integers: opening supply = closing supply + burns − mints, on every line. */
export function c1Check(lines: readonly TimelineLine[]): C1Check {
  const failDays: string[] = [];
  let holds = 0;
  for (const l of lines) {
    let ok = false;
    try {
      ok = BigInt(l.s_open) === BigInt(l.supply_close) + BigInt(l.burns) - BigInt(l.mints) && l.c1_ok;
    } catch {
      ok = false;
    }
    if (ok) holds++;
    else failDays.push(l.day);
  }
  return { holds, total: lines.length, failDays };
}

export function c1Label(c: C1Check): string {
  if (c.total === 0) return "—";
  if (c.failDays.length === 0) return `holds on all ${String(c.total)} windows (recomputed here in exact integers)`;
  return `fails on ${c.failDays.join(", ")}`;
}

/** Whether the live timeline body starts with the committed capture, byte for byte (sha256 of the prefix). */
export async function extendsCapture(liveText: string, capture: CaptureRef, sha256Hex: Sha256Hex): Promise<boolean> {
  if (liveText.length < capture.timelineChars) return false;
  const prefix = liveText.slice(0, capture.timelineChars);
  return (await sha256Hex(new TextEncoder().encode(prefix))) === capture.timelineSha256;
}

export interface Integrity {
  chain: ChainCheck;
  stateAgreesWithLastLine: boolean;
  digestRecomputed: boolean;
  extendsCapture: boolean | null;
}

export async function checkIntegrity(data: NarabiData, sha256Hex: Sha256Hex): Promise<Integrity> {
  const chain = await verifyChain(data.lines, sha256Hex);
  const digest = await trackerDigestOf(data.state.tracker.q1, data.state.tracker.params, steppedScores(data.lines), sha256Hex);
  return {
    chain,
    stateAgreesWithLastLine: stateAgreesWithLastLine(data.state, data.lines),
    digestRecomputed: digest === data.state.digest,
    extendsCapture: data.sourceKind === "live" ? data.extendsCapture : null,
  };
}

/** Where a set of integrity results comes from, relative to the data the board shows. */
export interface IntegrityProvenance {
  /** The results were computed on exactly the data shown (false while a recompute is pending or after it failed). */
  onShownData: boolean;
  /** Computed when the page was built, or in the reader's browser. */
  where: "build" | "browser";
  /** The browser could not recompute them (its error is printed next to the checks). */
  failed: boolean;
}

/** The integrity lede: says, in every state the page reaches, what the checks below were computed on and by whom —
 *  never more. On the committed capture it never claims the files were read; on the files as served now it names what
 *  still comes from this page (the byte-prefix reference and the checking code). */
export function integrityLedeFor(p: IntegrityProvenance, data: NarabiData): string {
  if (!p.onShownData) return p.failed ? INTEGRITY_LEDE_FAILED : INTEGRITY_LEDE_PENDING;
  // Results on the data shown and a failure: only the build's results on the capture can be shown (the browser's
  // recompute of that same data is the one that failed).
  if (p.where === "build") return p.failed ? INTEGRITY_LEDE_BUILD_ONLY : INTEGRITY_LEDE_BUILD;
  if (data.sourceKind === "live") return INTEGRITY_LEDE_LIVE;
  return data.liveError === null ? INTEGRITY_LEDE_CAPTURE_UNREAD : INTEGRITY_LEDE_CAPTURE_FAILED;
}

export function chainLabel(c: ChainCheck): string {
  return c.ok ? `${String(c.links)} links intact` : `broken at ${c.brokenAt ?? "?"} (after ${String(c.links)} intact links)`;
}

export function yesNo(v: boolean | null, whenNull: string): string {
  if (isNil(v)) return whenNull;
  return v ? "yes" : "no";
}

/* ─────────────────────────── copy (frozen D8 verbatim + digit-free framings) ────────────────────────── */

// The single public Narabi sentence, BYTE-IDENTICAL to test/ci-gates.test.ts `D8_SENTENCE`
// and to the README block. Rendered as a const read `{D8_SENTENCE}`, so its "2024"/"24h" are never a
// rendered literal. test/narabi-live.test.ts reconstructs the ci-gates copy and asserts byte-equality.
export const D8_SENTENCE =
  "Narabi runs an adaptive quantile tracker (Angelopoulos–Barber–Bates 2024, decaying step) on the attested " +
  "daily USDe redemption flow: its state moves each 24h window from the realized outcome, and the full " +
  "timeline is published so anyone can replay it. What it carries is a deterministic long-run bound that " +
  "tightens as windows accumulate, printed daily with T, not a per-window coverage, not a probability; the " +
  "gate's committed calibration does not depend on the tracker state. Until the pre-registered drift " +
  "criterion fires and an ADR says otherwise, the gate's region is still the committed static calibration: " +
  "the tracker adapts, the gate does not yet.";

// The "why T ≥ 7" rationale — DIGIT-FREE (numbers are spelled), proven by test 3. It explains that seven
// published steps is one week of verifiable replay before we speak of a series.
export const WHY_SEVEN =
  "T is read from the published state, never typed here. We will not speak of this as a series until it has run for seven daily " +
  "steps — one week of a published timeline that anyone can recompute and replay from the two static files, " +
  "before we point to it. Seven steps is a week, nothing stronger: no trend is claimed, and no coverage is " +
  "measured.";

// The closing framing (digit-free). The tracker moves each window; the committed gate region does not, until
// the pre-registered drift criterion fires and an ADR says so.
export const TRACKER_ADAPTS = "The tracker adapts; the gate does not yet.";
export const NO_COVERAGE_MEASURED = "No coverage is measured — the printed bound is a long-run quantity, not a per-window coverage and not a probability.";
export const STATUS_IS_A_WORD = "Status is a word, not a colour. Fields not yet evaluable are printed as — with the word that says why.";

// The long-run bound, in clean notation (no ASCII digit, so it renders as literal text). The constants
// c = B, ε and the horizon T are read from state.json params / projected_bound_leq_target_T at render time.
export const BOUND_FORMULA = "(B + η₁)/(T·η_T)";

// Section titles + ledes (digit-free structural copy).
export const HERO_DEK =
  "One daily UTC window per line: attested, published, replayable, pre-registered, bounded. Two static files, nothing else.";
export const WINDOWS_LEDE =
  "One row per daily UTC window, most recent first. Zeros are facts. A field not yet evaluable is a — with its status word. Amounts are rounded half-up to the unit shown; the exact integers are in the file.";
export const DRIFT_LEDE = "What a drift triggers is the opening of an ADR, never an automatic change of the committed gate region.";
export const RECOMPUTE_LEDE = "The hash chain makes a rewrite detectable, never certified. The only check of the facts is the on-chain recompute.";

// Framings that MUST sit next to the served values they qualify (test: co-present in the component).
export const TRAJECTORY_LEDE =
  "Each stepped pair, read from the published lines: the score s, whether it exceeded the committed q₁ (static miss) and the tracker's own threshold (tracker miss), the threshold before and after the step, the step size η and the long-run bound.";
export const STATIC_MISS_FRAMING =
  "A static miss is a pair whose score exceeded q₁, the committed region the gate reads. The pre-registered drift criterion below is the rolling rate of static misses over calm pairs, evaluable only once its window fills; a count this small says nothing about coverage.";
export const TRACKER_MISS_FRAMING =
  "Share of tracker misses so far, over T steps: a realized frequency on a handful of steps, not a coverage and not a probability.";
export const SENTINEL_BUDGET_FRAMING =
  "The sentinel's informational static budget (field B_t), computed from the static misses whose labels have arrived (t_deg). It is neither the budget a gate caller carries nor the MONARK authorization budget of the token page; a negative value is printed as it is.";
export const INTEGRITY_LEDE_BUILD =
  "Recomputed when this page was built, on its committed capture; a browser that runs the page recomputes all of it again, first on that capture, then on the files as served now.";
export const INTEGRITY_LEDE_BUILD_ONLY =
  "Recomputed when this page was built, on its committed capture; this browser could not recompute it, for the reason printed below.";
export const INTEGRITY_LEDE_PENDING = "Being recomputed in this browser on the data shown above.";
export const INTEGRITY_LEDE_FAILED = "Not recomputed in this browser; the reason is printed below.";
export const INTEGRITY_LEDE_CAPTURE_UNREAD =
  "Recomputed in this browser on this page's committed capture; the files as served now have not been read yet.";
export const INTEGRITY_LEDE_CAPTURE_FAILED =
  "Recomputed in this browser on this page's committed capture: reading the files as served now failed, so nothing here comes from them.";
export const INTEGRITY_LEDE_LIVE =
  "Recomputed in this browser from the two files it read. The byte-prefix reference and the checking code come from this page; the recipe above lets anyone rerun the checks without it.";
export const NOSCRIPT_NOTE =
  "Scripts are off: this page shows its committed capture of the published files, checked when the page was built. The files as served now are read, and every check re-run, only in a browser that runs the page.";
export const HASHES_SUMMARY = "Hashes per window (utterance, AttestedFlow, tracker digest, chain)";
