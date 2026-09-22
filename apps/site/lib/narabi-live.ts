// apps/site/lib/narabi-live.ts — the read-only client logic for the Narabi sentinel page (ADR-M012 D4),
// ported from the designer's concept B (js/narabi-data.js) as pure, typed TypeScript.
//
// DUAL-COMPILE (mirrors lib/fleet.ts L9-16): this module is compiled by TWO programs — the root test
// program (moduleResolution "nodenext", lib "esnext", NO dom) and the Next bundler ("bundler", dom). So it
// is SELF-CONTAINED: no relative import (none type-checks under both), no `@/` alias, no `node:` builtin,
// and no reference to `fetch`/`window`/`document` (the caller injects `fetchText`). The client component
// wires the snapshot and the browser fetcher in; `test/narabi-live.test.ts` injects a fake fetcher.
//
// HONESTY (ADR-M004 D11 / test 44): NOTHING here renders. Every number the page shows is a property read
// of the parsed state/timeline or a derivation whose assumption is printed next to it (the honesty lint
// scans only JSX rendered positions, so a `{state.tracker.q}` / `{unitFraction(params.c)}` read is never a
// literal). The digit-bearing copy that DOES render — the frozen D8 sentence (carries "2024"/"24h") — is a
// const read `{D8_SENTENCE}`, disclosed in docs/G1-lot-fsite-10.md; every other copy const is digit-free
// (proven by test/narabi-live.test.ts). No number is typed as a rendered literal anywhere.

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

/* ─────────────────────────── pre-registered constants (ADR-M012 D6) ─────────────────────────────────── */

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

// The published timeline line (the subset the page reads; extra fields parse through untouched).
export interface TimelineLine {
  day: string;
  from_block: number;
  to_block: number;
  burns: string;
  mints: string;
  supply_close: string;
  s_open: string;
  v: number | null;
  regime: Regime;
  pair_status: PairStatus;
  s: number | null;
  q_before: number;
  eta: number | null;
  q_after: number;
  T: number;
  bound_thm1: number | null;
  B_t: number;
  digest_T: string;
  rolling90_calm_miss: number | null;
  drift_flag: boolean;
  attested_flow_sha256: string;
  utterance_hash: string;
  prev_line_hash: string;
  line_hash: string;
  endpoints: readonly string[];
  node_version: string;
  sentinel_sha: string;
}

export interface NarabiSnapshot {
  readonly capturedAt: string;
  readonly source: string;
  readonly stateJson: string;
  readonly timelineJsonl: string;
  readonly stateSha256: string;
  readonly timelineSha256: string;
}

export type SourceKind = "live" | "snapshot";

export interface NarabiData {
  state: NarabiState;
  lines: TimelineLine[];
  sourceKind: SourceKind;
  source: string;
  fetchedAt: string;
  liveError: string | null;
}

/* ─────────────────────────── parsing (typed, so the root test never touches `any`) ──────────────────── */

export function parseState(text: string): NarabiState {
  return JSON.parse(text) as NarabiState;
}

export function parseTimeline(text: string): TimelineLine[] {
  const out: TimelineLine[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.length === 0) continue;
    out.push(JSON.parse(line) as TimelineLine);
  }
  return out;
}

/* ─────────────────────────── loader: same-origin live, else the committed snapshot (declared) ───────── */

export const LIVE_SOURCE = "published files, served read-only at /narabi/ (same origin)";

export function snapshotSource(snap: NarabiSnapshot): string {
  return `local snapshot of the published files, captured ${snap.capturedAt} (same-origin read failed)`;
}

export interface LoadOptions {
  /** Injected so this module never references the DOM `fetch`. Returns the response body text or throws. */
  fetchText: (url: string) => Promise<string>;
  snapshot: NarabiSnapshot;
  statePath?: string;
  timelinePath?: string;
  now?: Date;
}

/** Read the live files; on ANY failure fall back to the committed snapshot and SAY SO (never silent). */
export async function loadNarabi(opts: LoadOptions): Promise<NarabiData> {
  const statePath = opts.statePath ?? STATE_PATH;
  const timelinePath = opts.timelinePath ?? TIMELINE_PATH;
  const fetchedAt = (opts.now ?? new Date()).toISOString();
  try {
    const [stateText, timelineText] = await Promise.all([opts.fetchText(statePath), opts.fetchText(timelinePath)]);
    return {
      state: parseState(stateText),
      lines: parseTimeline(timelineText),
      sourceKind: "live",
      source: LIVE_SOURCE,
      fetchedAt,
      liveError: null,
    };
  } catch (err) {
    const liveError = err instanceof Error ? err.message : String(err);
    return {
      state: parseState(opts.snapshot.stateJson),
      lines: parseTimeline(opts.snapshot.timelineJsonl),
      sourceKind: "snapshot",
      source: snapshotSource(opts.snapshot),
      fetchedAt,
      liveError,
    };
  }
}

/* ─────────────────────────── formatting helpers (facts only; a zero is a fact) ──────────────────────── */

export function isNil(v: unknown): v is null | undefined {
  return v === null || v === undefined;
}

function groupThousands(intStr: string): string {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** 18-decimal integer string -> compact human units (USDe has 18 decimals). Exact integer maths, no float. */
export function compact18(str: string | null): string {
  if (isNil(str)) return "—";
  const s = String(str);
  const digits = s.length - 18;
  if (digits <= 0) return /[1-9]/.test(s) ? "<1" : "0"; // a zero is a fact, printed as 0
  const intPart = s.slice(0, digits);
  if (intPart.length > 9) {
    return Number(intPart.slice(0, intPart.length - 9) + "." + intPart.slice(intPart.length - 9, intPart.length - 7)).toFixed(2) + " B";
  }
  if (intPart.length > 6) {
    return Number(intPart.slice(0, intPart.length - 6) + "." + intPart.slice(intPart.length - 6, intPart.length - 4)).toFixed(2) + " M";
  }
  if (intPart.length > 3) {
    return Number(intPart.slice(0, intPart.length - 3) + "." + intPart.slice(intPart.length - 3, intPart.length - 1)).toFixed(2) + " k";
  }
  return groupThousands(intPart);
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

/** An ISO instant as "YYYY-MM-DD HH:MM:SS UTC" for the register "read at" line. Built here (not in the
 *  render path) so the component does no string arithmetic in a rendered position. */
export function readAtLabel(iso: string): string {
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

export function regimeWord(r: Regime | null): string {
  if (isNil(r)) return "—";
  return r.stress ? "stress" : "calm";
}

export function pairWord(p: string | null): string {
  if (isNil(p)) return "—";
  return String(p).replace(/_/g, " ");
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

export function projectedBoundDate(state: NarabiState, lines: TimelineLine[]): ProjectedBound {
  const T = state.projected_bound_leq_target_T;
  if (isNil(T)) return { T: null, date: null, assumption: "no projection published" };
  // The tracker only steps on evaluable pairs; the first published window was not evaluable (no prior
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
    ? `assumes one evaluable pair per calendar day from the first tracker step (${firstStep}); a parameter change opens a new segment and changes the bound (Thm 2).`
    : `assumes one evaluable pair per calendar day from the day after J0; the first window was not evaluable and a pair needs two consecutive windows, so any further non-evaluable window pushes this later (Thm 2 on a parameter change).`;
  return { T, date: anchor ? addDays(anchor, T - 1) : null, assumption };
}

// The hero pill copy (ADR-M012 D4, ruling C-3). PURE and read-only. The status word is "built": it follows
// the frozen fleet register (test/narabi-live.test.ts asserts this prefix equals FLEET_AGENTS' Narabi status,
// ruling Q-8b), never the mockup's "shipped". Before the series is readable (t < SERIES_MIN_STEPS) the pill
// says which step of the week we are on: N is state.tracker.t, a stepped evaluable pair — never "day N", since
// the first published window was not evaluable (the tracker steps only on an evaluable pair). At or past the
// horizon it says how many daily windows have been published (N = lines.length). The week length is
// SERIES_MIN_STEPS, its SINGLE source — there is no separate WINDOW_BEFORE_FIRST_READING constant (ruling C-5).
// Because /narabi is a client component, this label's N never reaches the built HTML (the server shell renders
// "reading the published files…"); the non-LLM floor is this pure function plus the rendered carrier, and the
// full DOM composition is the investor visual walk (named residual, ruling C-7).
export function firstReadingLabel(state: NarabiState, lines: TimelineLine[]): string {
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

export function driftStatus(lines: TimelineLine[]): DriftStatus {
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  let calmPairs = 0;
  for (const l of lines) {
    if (l.pair_status === "evaluable" && !l.regime.stress) calmPairs++;
  }
  const n = Math.min(calmPairs, CALM_WINDOW);
  const value = last ? last.rolling90_calm_miss : null;
  const evaluable = n >= CALM_WINDOW && !isNil(value);
  const text = evaluable
    ? `${fixed(value, 3)} against ${fixed(DRIFT_THRESHOLD, 2)}`
    : `${String(n)} of ${String(CALM_WINDOW)} calm pairs — evaluable after the window fills`;
  return { value, threshold: DRIFT_THRESHOLD, window: CALM_WINDOW, n, evaluable, fired: last ? last.drift_flag : false, text };
}

export interface LagStatus {
  late: number;
  text: string;
}

/** A window for day D closes at D+1 00:00Z; the timer publishes after the finality margin, with a grace
 *  margin before a window is called late. `dueClock` is the human schedule read from the timer unit. */
export function lagStatus(lines: TimelineLine[], now: Date, dueClock: string, graceHours = 2): LagStatus {
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  if (!last) return { late: 0, text: "no window published" };
  const nextDue = new Date(addDays(last.day, 2) + "T00:00:00Z");
  nextDue.setUTCHours(graceHours, 0, 0, 0);
  if (now < nextDue) {
    return { late: 0, text: `none; the next window (${addDays(last.day, 1)}) is published the day after it closes, around ${dueClock}` };
  }
  const late = Math.floor((now.getTime() - nextDue.getTime()) / 86_400_000) + 1;
  return { late, text: `${String(late)} window${late > 1 ? "s" : ""} behind (last published ${last.day})` };
}

export interface Segment {
  from: string;
  to: string;
  count: number;
  sentinel_sha: string;
  node_version: string;
}

/** A segment = a run of unchanged (sentinel_sha, node_version); any change opens a new one (Thm 2). */
export function segments(lines: TimelineLine[]): Segment[] {
  const segs: Segment[] = [];
  for (const l of lines) {
    const cur = segs.length > 0 ? segs[segs.length - 1] : undefined;
    if (cur && cur.sentinel_sha === l.sentinel_sha && cur.node_version === l.node_version) {
      cur.to = l.day;
      cur.count++;
    } else {
      segs.push({ from: l.day, to: l.day, count: 1, sentinel_sha: l.sentinel_sha, node_version: l.node_version });
    }
  }
  return segs;
}

export function endpointsUnion(lines: TimelineLine[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const l of lines) {
    for (const e of l.endpoints) {
      if (!seen.has(e)) {
        seen.add(e);
        out.push(e);
      }
    }
  }
  return out;
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
export function paginate(lines: TimelineLine[], pageSize = 90, page = 0): Page {
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
 *  numbers and hashes render through a single `{recipe}` read, never as literals. */
export function recomputeRecipe(state: NarabiState, lines: TimelineLine[]): string {
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
  return [
    `# facts — window ${day}`,
    `eth_getLogs address=USDe topics=[Transfer] fromBlock=${fromBlock} toBlock=${toBlock}`,
    `  burns = sum(Transfer to the zero address)   -> ${burns}`,
    `  mints = sum(Transfer from the zero address) -> ${mints}`,
    `totalSupply at the close block                 -> ${supply}`,
    `# attestation`,
    `sha256(AttestedFlow bytes)                     -> ${flowSha}`,
    `# tracker replay`,
    `trackerReplay(q1, params, timeline.s) -> q = ${sci(state.replay_q, 6)}`,
    `# hash chain`,
    `prev_line_hash -> ${prevHash}`,
    `line_hash      -> ${lineHash}`,
  ].join("\n");
}

/* ─────────────────────────── copy (frozen D8 verbatim + digit-free framings) ────────────────────────── */

// The single public Narabi sentence (ADR-M012 D8), BYTE-IDENTICAL to test/ci-gates.test.ts `D8_SENTENCE`
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
  "One row per daily UTC window, most recent first. Zeros are facts. A field not yet evaluable is a — with its status word.";
export const DRIFT_LEDE = "What a drift triggers is the opening of an ADR, never an automatic change of the committed gate region.";
export const RECOMPUTE_LEDE = "The hash chain makes a rewrite detectable, never certified. The only guarantor of the facts is the on-chain recompute.";
