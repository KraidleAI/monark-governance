// INSTRUMENT REPLAY - ADR-M012 item (l): the post-J0 replay of the labelled instrument section (D6) over the eleven
// months 2025-10-16 -> J0, then the published days, written to instrument.json with its OWN digest, never into
// state.json. A separate CLI entry (it mirrors instrument.ts); run.ts never imports it; the official tracker is
// untouched. Offline, no key: it reads the committed series (its last window is the seed), a gap timeline (the
// sentinel's own line format, acquired apart, under go) and the published live timeline, refolds every window
// through the attest/step engine of the daily job, and fails closed on the first defect: a line that is not JSON,
// whose line_hash does not recompute, or that the engine does not reproduce; a C1 failure; a live timeline that
// does not open on the pre-registered J0 anchor (ADR-M014); an overlap that disagrees; a day, block or supply
// that does not follow the previous window. --out is required, never under a `public` directory without
// --publish, never named state.json or timeline.jsonl, never an input (compared case-folded on win32). All guards
// run BEFORE the only write.
// K-8: the harness never imports this; this never imports apps/harness/src/tools.
import { readFileSync, writeFileSync, realpathSync } from "node:fs";
import { createHash } from "node:crypto";
import { basename, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { trackerInit, trackerStep } from "@monark/hikae";
import type { Miscover, TrackerParams } from "@monark/hikae";
import { initState, step, lineHashOf, stateSummary, TRACKER_PARAMS } from "./timeline.ts";
import type { SentinelState, TimelineLine } from "./timeline.ts";
import { attest } from "./flow.ts";
import type { WindowFacts } from "./flow.ts";
import { CUSUM_P0, CUSUM_P1, PERM_SEED, DEFAULT_PERMS, EPS_INSTRUMENT, EDET_ANCHOR_LINE_HASH, assertOutPathAllowed, cusumDiagnostic, replayEntry, factsOf } from "./instrument.ts";
import type { Series, InstrumentCusum, InstrumentReplay } from "./instrument.ts";

/** The D6 label: the section is published labelled and never carried into the live state. */
export const INSTRUMENT_LABEL = "instrument, not the official tracker";

/** The public sentence of item (l), carried as `note`. Literature sources: the three M012-h procurement fiches
 *  only (Lorden 1971 pp. 1897-1898 for the form, which it presents as Page's 1954 procedure, its ref. [6]; p. 1900
 *  for the i.i.d. proof; Vovk 2012 Prop. 1 p. 477 for
 *  exchangeability; Shin, Ramdas and Rinaldo 2022: no permutation anywhere). No sequential claim is made
 *  (ADR-M012 amendment (h)). */
export const INSTRUMENT_NOTE = "Instrument, not the official tracker: tracker replays at alternative parameters, and a one-sided CUSUM in the form Page (1954) introduced and Lorden (1971) presents, on the static misses, assessed by a permutation test of exchangeability as Vovk (2012) defines it. A third way, outside Lorden's i.i.d. theory and the e-detectors of Shin, Ramdas and Rinaldo (2022); no bound is claimed.";

const CALM_LABEL = "replay block CUSUM (retrospective permutation diagnostic over the closed block, not a sequential reading; ADR-M014 D4): E_static over calm pairs";
const ALL_LABEL = "replay block CUSUM (retrospective permutation diagnostic over the closed block, not a sequential reading; ADR-M014 D4): E_static over all evaluable pairs";
const REPLAY_PROV = { endpoints: [] as readonly string[], node_version: "instrument-replay", sentinel_sha: "0".repeat(64) };
const sha256 = (b: Buffer | string): string => createHash("sha256").update(b).digest("hex");
const nextDay = (day: string): string => new Date(Date.parse(day + "T00:00:00Z") + 86_400_000).toISOString().slice(0, 10);

/** One window of the replay block (the per-window statistics published in `series`). */
export interface ReplayWindow {
  readonly day: string;
  readonly pair_status: TimelineLine["pair_status"];
  readonly calm_pair: boolean;
  readonly v: number | null;
  readonly s: number | null;
  readonly E_static: Miscover | null;
  readonly q_c: number | null;
  readonly q_eps: number | null;
  readonly cusum_calm: number;
  readonly cusum_all: number;
}

/** instrument.json: a CLOSED key set. `digest` = sha256 of JSON.stringify of every key before it (so not of
 *  `digest` nor `generated_at`): anyone re-running the CLI on the same inputs gets the same digest. */
export interface InstrumentReplayDoc {
  readonly label: string;
  readonly note: string;
  readonly params: {
    readonly alpha: number; readonly B: number; readonly q1: number; readonly eps_instrument: number;
    readonly cusum_p0: number; readonly cusum_p1: number; readonly perm_seed: number; readonly perms: number;
    readonly seed_day: string; readonly seed_series_sha256: string; readonly j0: string; readonly last_day: string;
  };
  readonly series: readonly ReplayWindow[];
  readonly replays: readonly InstrumentReplay[];
  readonly permutation: { readonly calm: InstrumentCusum; readonly all_evaluable: InstrumentCusum };
  readonly timeline_sha256: string;
  readonly gap_sha256: string;
  readonly state_digest: string;
  readonly digest: string;
  readonly generated_at: string;
}

/** Parse a sentinel timeline (JSONL). Throws on an empty file or on a line that is not JSON. */
export function parseTimeline(text: string, what: string): TimelineLine[] {
  const raw = text.replace(/\r\n/g, "\n").split("\n").filter((l) => l.trim() !== "");
  if (raw.length === 0) throw new Error(`instrument-replay: ${what} is empty.`);
  return raw.map((l, i) => {
    try { return JSON.parse(l) as TimelineLine; } catch { throw new Error(`instrument-replay: ${what} line ${String(i + 1)} is not JSON.`); }
  });
}

function factsFromLine(l: TimelineLine): WindowFacts {
  return { day: l.day, fromBlock: l.from_block, toBlock: l.to_block, burns: BigInt(l.burns), mints: BigInt(l.mints), supplyClose: BigInt(l.supply_close), supplyOpen: BigInt(l.s_open) };
}

/** Verify a published timeline: each line_hash recomputes from its own fields, C1 holds, and the engine refolded
 *  from GENESIS reproduces every published line. Returns its facts and the refolded state. Throws on a defect. */
export function verifyTimeline(lines: readonly TimelineLine[], what: string): { facts: WindowFacts[]; state: SentinelState } {
  let state = initState();
  const facts: WindowFacts[] = [];
  lines.forEach((l, i) => {
    try {
      if (lineHashOf(l) !== l.line_hash) throw new Error("its line_hash does not recompute");
      const f = factsFromLine(l);
      const r = attest(f);
      if (r.status === "c1_fail") throw new Error("C1 fails");
      const out = step(state, f, r, REPLAY_PROV);
      if (out.line.line_hash !== l.line_hash) throw new Error("the engine does not reproduce it");
      state = out.state;
      facts.push(f);
    } catch (e) {
      throw new Error(`instrument-replay: ${what} line ${String(i + 1)}: ${(e as Error).message}.`);
    }
  });
  return { facts, state };
}

const sameFacts = (a: WindowFacts, b: WindowFacts): boolean =>
  a.day === b.day && a.fromBlock === b.fromBlock && a.toBlock === b.toBlock && a.burns === b.burns &&
  a.mints === b.mints && a.supplyClose === b.supplyClose && a.supplyOpen === b.supplyOpen;

/** The replay block: the seed, the gap strictly before J0, then the live days. A gap window on the seed day or on
 *  a live day must carry the SAME facts (two reads at finality agree) and is dropped; then every window must follow
 *  the previous one by day, by block (from = previous to + 1) and by supply (open = previous close). */
export function mergeBlock(seed: WindowFacts, gap: readonly WindowFacts[], live: readonly WindowFacts[]): WindowFacts[] {
  const j0 = live[0]!.day;
  const liveByDay = new Map(live.map((f) => [f.day, f]));
  const out: WindowFacts[] = [seed];
  for (const f of gap) {
    if (f.day !== seed.day && f.day < j0) { out.push(f); continue; }
    const twin = f.day === seed.day ? seed : liveByDay.get(f.day);
    if (twin !== undefined && !sameFacts(f, twin)) {
      throw new Error(`instrument-replay: the gap and the ${f.day === seed.day ? "seed" : "live timeline"} disagree on ${f.day}.`);
    }
  }
  out.push(...live);
  for (let i = 1; i < out.length; i++) {
    const a = out[i - 1]!, b = out[i]!;
    if (b.day !== nextDay(a.day)) throw new Error(`instrument-replay: day ${b.day} does not follow ${a.day} (no missing day is allowed).`);
    if (b.fromBlock !== a.toBlock + 1) throw new Error(`instrument-replay: block gap before ${b.day} (from ${String(b.fromBlock)} after to ${String(a.toBlock)}).`);
    if (b.supplyOpen !== a.supplyClose) throw new Error(`instrument-replay: supply break before ${b.day} (open differs from the previous close).`);
  }
  return out;
}

/** Fold the block through the engine and build the published statistics (PURE: no filesystem, no clock). */
export function buildReplay(block: readonly WindowFacts[], perms: number, seed: number): { q1: number; series: ReplayWindow[]; replays: InstrumentReplay[]; permutation: InstrumentReplayDoc["permutation"] } {
  let state = initState();
  const q1 = state.tracker.q1;
  const pc: TrackerParams = { ...TRACKER_PARAMS, c: q1 };
  const pe: TrackerParams = { ...TRACKER_PARAMS, eps: EPS_INSTRUMENT };
  let tc = trackerInit(q1, pc), te = trackerInit(q1, pe);
  const up = Math.log(CUSUM_P1 / CUSUM_P0), down = Math.log((1 - CUSUM_P1) / (1 - CUSUM_P0));
  let cuCalm = 0, cuAll = 0;
  const series: ReplayWindow[] = [];
  for (const f of block) {
    const r = attest(f);
    if (r.status === "c1_fail") throw new Error(`instrument-replay: window ${f.day} fails C1.`);
    const calmBefore = state.calmMiss.length;
    const out = step(state, f, r, REPLAY_PROV);
    state = out.state;
    const calmPair = state.calmMiss.length > calmBefore;
    const { s, E_static } = out.line;
    let qc: number | null = null, qe: number | null = null;
    if (s !== null && E_static !== null) {
      tc = trackerStep(tc, s).state;
      te = trackerStep(te, s).state;
      qc = tc.q; qe = te.q;
      cuAll = Math.max(0, cuAll + (E_static === 1 ? up : down));
      if (calmPair) cuCalm = Math.max(0, cuCalm + (E_static === 1 ? up : down));
    }
    series.push({ day: f.day, pair_status: out.line.pair_status, calm_pair: calmPair, v: out.line.v, s, E_static, q_c: qc, q_eps: qe, cusum_calm: cuCalm, cusum_all: cuAll });
  }
  const replays = [replayEntry("c=q_hat", pc, q1, state.scores), replayEntry("eps=0.01", pe, q1, state.scores)];
  const permutation = {
    calm: cusumDiagnostic(CALM_LABEL, state.calmMiss, CUSUM_P0, CUSUM_P1, perms, seed),
    all_evaluable: cusumDiagnostic(ALL_LABEL, state.eStatic, CUSUM_P0, CUSUM_P1, perms, seed),
  };
  return { q1, series, replays, permutation };
}

/** A numeric flag is read RAW: a missing or empty value, or any form other than `re`, is NaN and refused below
 *  (never Number(null) = Number("") = 0 taken as a value). */
const rawInt = (v: string | null, re: RegExp): number => (v !== null && re.test(v) ? Number(v) : Number.NaN);

/** The comparison key of a path: its real path when it exists (a symlink is followed), else its resolved path; on
 *  win32 (NTFS, case-insensitive: the orchestrator's machine, RUNBOOK section 7 (3)) the SYSTEM's final path
 *  (realpathSync.native: an 8.3 short name such as STATE~1.JSO resolves to its long name, Q-C-2), case-folded, so
 *  STATE.JSON is state.json and another spelling of an input is that input. A trailing dot or space is NOT an alias
 *  under Node (it opens paths in the \\?\ namespace: "state.json." is a distinct file, measured 2026-09-27). */
export function pathKey(p: string, platform: string = process.platform): string {
  let r = resolve(p);
  try { r = (platform === "win32" ? realpathSync.native : realpathSync)(r); } catch { /* not there yet (the --out file): its resolved path */ }
  return platform === "win32" ? r.toLowerCase() : r;
}

interface ReplayArgs { out: string | null; gap: string | null; timeline: string | null; series: string | null; perms: number; seed: number; publish: boolean; }

function parseReplayArgs(argv: readonly string[]): ReplayArgs {
  const a: ReplayArgs = { out: null, gap: null, timeline: null, series: null, perms: DEFAULT_PERMS, seed: PERM_SEED, publish: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1] ?? null;
    if (k === "--publish") { a.publish = true; continue; }
    if (k === "--out") a.out = v;
    else if (k === "--gap") a.gap = v;
    else if (k === "--timeline") a.timeline = v;
    else if (k === "--series") a.series = v;
    else if (k === "--perms") a.perms = rawInt(v, /^[1-9]\d*$/);
    else if (k === "--seed") a.seed = rawInt(v, /^-?\d+$/);
    else throw new Error(`instrument-replay: unknown argument ${String(k)}.`);
    i++;
  }
  return a;
}

/** The CLI, callable in-process: every guard runs BEFORE any read of the inputs and before the ONLY write
 *  (--out). Returns the written document. */
export function runReplayCli(argv: readonly string[]): InstrumentReplayDoc {
  const a = parseReplayArgs(argv);
  if (a.out === null) throw new Error("instrument-replay: --out <file> is required (instrument.json is written by this CLI, never by run.ts).");
  if (a.timeline === null) throw new Error("instrument-replay: --timeline <live timeline.jsonl> is required.");
  if (a.gap === null) throw new Error("instrument-replay: --gap <gap timeline.jsonl> is required (the eleven months before J0).");
  assertOutPathAllowed(a.out, a.publish);
  const name = basename(pathKey(a.out));
  if (name === "state.json" || name === "timeline.jsonl") throw new Error(`instrument-replay: --out is never ${name} (the live files are never written here).`);
  const seriesPath = a.series ?? fileURLToPath(new URL("../../../fixtures/usde-calib-series.json", import.meta.url));
  for (const p of [a.timeline, a.gap, seriesPath]) {
    if (pathKey(p) === pathKey(a.out)) throw new Error(`instrument-replay: --out must not be an input file (${p}).`);
  }
  if (!Number.isInteger(a.perms) || a.perms < 1) throw new Error("instrument-replay: --perms must be a positive integer written in digits (a missing, empty or other value is refused).");
  if (!Number.isInteger(a.seed)) throw new Error("instrument-replay: --seed must be an integer written in digits (a missing, empty or other value is refused).");
  const liveBytes = readFileSync(a.timeline), gapBytes = readFileSync(a.gap), seriesBytes = readFileSync(seriesPath);
  const liveLines = parseTimeline(liveBytes.toString("utf8"), "--timeline");
  const head = liveLines[0]!;
  if (head.prev_line_hash !== "GENESIS" || head.line_hash !== EDET_ANCHOR_LINE_HASH) {
    throw new Error("instrument-replay: --timeline does not open on the pre-registered J0 anchor (ADR-M014).");
  }
  const live = verifyTimeline(liveLines, "--timeline");
  const gap = verifyTimeline(parseTimeline(gapBytes.toString("utf8"), "--gap"), "--gap");
  const windows = (JSON.parse(seriesBytes.toString("utf8")) as Series).windows;
  const last = windows[windows.length - 1];
  if (last === undefined || last.error !== undefined) throw new Error("instrument-replay: the series has no usable last window (the seed).");
  const block = mergeBlock(factsOf(last), gap.facts, live.facts);
  const built = buildReplay(block, a.perms, a.seed);
  const body = {
    label: INSTRUMENT_LABEL,
    note: INSTRUMENT_NOTE,
    params: {
      alpha: TRACKER_PARAMS.alpha, B: TRACKER_PARAMS.B, q1: built.q1, eps_instrument: EPS_INSTRUMENT,
      cusum_p0: CUSUM_P0, cusum_p1: CUSUM_P1, perm_seed: a.seed, perms: a.perms,
      seed_day: block[0]!.day, seed_series_sha256: sha256(seriesBytes), j0: head.day, last_day: block[block.length - 1]!.day,
    },
    series: built.series,
    replays: built.replays,
    permutation: built.permutation,
    timeline_sha256: sha256(liveBytes),
    gap_sha256: sha256(gapBytes),
    state_digest: stateSummary(live.state).digest,
  };
  const doc: InstrumentReplayDoc = { ...body, digest: sha256(JSON.stringify(body)), generated_at: new Date().toISOString() };
  writeFileSync(a.out, JSON.stringify(doc, null, 2) + "\n");
  return doc;
}

// Run-guard (mirrors instrument.ts): the CLI runs only when invoked directly, never on import (tests).
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try {
    const doc = runReplayCli(process.argv.slice(2));
    console.log(`instrument written: ${String(doc.series.length)} windows ${doc.params.seed_day}..${doc.params.last_day}, digest ${doc.digest}, state_digest ${doc.state_digest}.`);
  } catch (e: unknown) {
    console.error("instrument-replay FATAL", e);
    process.exitCode = 1;
  }
}
