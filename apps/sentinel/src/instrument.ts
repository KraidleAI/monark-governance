// INSTRUMENT — replays and diagnostics; never carried into the live state (ADR-M012 D6).
//
// A LABELLED off-state section: alternative-parameter tracker replays (c = q̂, ε = 0.01) and a CUSUM of
// Page on E_static with a permutation control. It is produced by a SEPARATE CLI entry
// (`node apps/sentinel/src/instrument.ts --out <file>`), written as a plain `{instrument: {...}}` JSON
// object, and is NEVER carried into state.json nor read by run.ts's live path (ADR-M012 D6). Each replay
// carries its OWN digest (`trackerDigest` with its own params), distinct from the live state digest for
// the same scores — the difference is the parameters, not the data. Offline: it folds the committed,
// sha-pinned series fixture through the same flow/timeline helpers the live job uses; no network, no key.
// K-8: the harness never imports this; this never imports apps/harness/src/tools.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { trackerReplay, trackerDigest, mulberry32 } from "@monark/hikae";
import type { TrackerParams, Miscover } from "@monark/hikae";
import { initState, step, projectedBoundT, DELTA_TARGET } from "./timeline.ts";
import type { SentinelState } from "./timeline.ts";
import { attest } from "./flow.ts";
import type { WindowFacts } from "./flow.ts";
import { EDET, DISQUALIFIED_P0, gridFor, runEDetector } from "./edetector.ts";

/** Pre-registered instrument constants (ADR-M012 D6, advisor-defi §0). */
export const CUSUM_P0 = 0.125;
export const CUSUM_P1 = 0.25;
export const PERM_SEED = 20260917;
export const DEFAULT_PERMS = 1000;
export const EPS_INSTRUMENT = 0.01;

/** Pre-registration anchor (ADR-M014 D1): the chain published when the design was frozen, and the M014-a
 *  commit that carries this text. `preregistration_commit` is the anchor (a date is not one). */
export const EDET_PREREGISTERED_AT = "2026-09-18";
export const EDET_PREREGISTRATION_COMMIT = "9d67302";
export const EDET_ANCHOR_LINE_HASH = "09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82";

/** One Page-CUSUM tracked from a Bernoulli sequence: increments log(p1/p0) on a miss, log((1-p1)/(1-p0))
 *  on a hit, floored at 0 (Page's one-sided CUSUM). Returns the MAX of the running sum (the statistic). */
export function pageCusumMax(sequence: readonly Miscover[], p0: number, p1: number): number {
  const up = Math.log(p1 / p0);
  const down = Math.log((1 - p1) / (1 - p0));
  let running = 0;
  let max = 0;
  for (const e of sequence) {
    running = Math.max(0, running + (e === 1 ? up : down));
    if (running > max) max = running;
  }
  return max;
}

/** A tracker replay under alternative params, with its own digest (distinct from the live state digest). */
export interface InstrumentReplay {
  readonly label: string;
  readonly params: TrackerParams;
  readonly q: number;
  readonly T: number;
  readonly digest: string;
}

/** The permutation control for a CUSUM statistic (deterministic mulberry32 shuffle, ADR-M012 D6). */
export interface InstrumentPermutation {
  readonly seed: number;
  readonly perms: number;
  readonly exceed: number;
  /** (1 + #{permuted stat >= observed}) / (N + 1) — the exact permutation p-value (<= 1/(N+1) when 0). */
  readonly p_value: number;
}

/** One CUSUM diagnostic over an E_static sequence, with its permutation control. */
export interface InstrumentCusum {
  readonly label: string;
  readonly p0: number;
  readonly p1: number;
  readonly statistic: number;
  readonly n: number;
  readonly misses: number;
  readonly permutation: InstrumentPermutation;
}

/** The pre-registered e-detector section (ADR-M014). Scalars only; never carried into state.json (D6). */
export interface EDetectorSection {
  readonly note: string;
  readonly p0: number;
  readonly q_l: number;
  readonly q_u: number;
  readonly alpha_arl: number;
  readonly k: number;
  readonly start_after_day: string;
  readonly threshold_log: number;
  readonly preregistered_at: string;
  readonly preregistration_commit: string;
  readonly anchor_line_hash: string;
  /** In-sample design check at p0 = 0.30: max log e-SR/e-CUSUM, no crossing (label "design check, no bound"). */
  readonly design_check: {
    readonly label: string;
    readonly p0: number;
    readonly n: number;
    readonly max_logM_sr: number;
    readonly max_logM_cu: number;
    readonly crossed: number | null;
  };
  /** The disqualified class p0 = 0.125 (ADR-M014 D6/C-2): it crosses in-sample, so it excludes the reference. */
  readonly disqualified_class: {
    readonly p0: number;
    readonly first_crossing_index: number | null;
    readonly first_crossing_day: string | null;
    readonly note: string;
  };
}

/** The full instrument section (ADR-M012 D6) — LABELLED, never carried into the live state. */
export interface Instrument {
  readonly note: string;
  readonly scores_n: number;
  readonly q1: number;
  /** The live state digest over the SAME scores (official params) — each replay digest differs from it. */
  readonly live_state_digest: string;
  readonly replays: readonly InstrumentReplay[];
  /** Pre-J0 CUSUM (ADR-M014 D4): retrospective permutation diagnostic on the committed calm pairs. */
  readonly cusum: InstrumentCusum;
  /** Pre-J0 CUSUM (ADR-M014 D4): the same, declared over ALL evaluable pairs (the full stepped stream). */
  readonly cusum_all_evaluable: InstrumentCusum;
  /** Cross-check (ADR-M012 D6): T at which the ε = 0.01 bound reaches δ_target (published: 453). */
  readonly eps01_projected_bound_leq_target_T: number;
  /** Pre-registered e-detector (ADR-M014): design artefact, evidence never a trigger (D2). */
  readonly edetector: EDetectorSection;
}

/** Build one alternative-parameter replay entry with its own digest (never carried). */
function replayEntry(label: string, params: TrackerParams, q1: number, scores: readonly number[]): InstrumentReplay {
  return { label, params, q: trackerReplay(q1, params, scores).q, T: scores.length, digest: trackerDigest(q1, params, scores) };
}

/** Page CUSUM statistic + a deterministic permutation control over `sequence` (mulberry32, ADR-M012 D6). */
function cusumDiagnostic(label: string, sequence: readonly Miscover[], p0: number, p1: number, perms: number, seed: number): InstrumentCusum {
  const statistic = pageCusumMax(sequence, p0, p1);
  const rnd = mulberry32(seed);
  const shuffled: Miscover[] = [...sequence];
  let exceed = 0;
  for (let k = 0; k < perms; k++) {
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      const tmp = shuffled[i]!;
      shuffled[i] = shuffled[j]!;
      shuffled[j] = tmp;
    }
    if (pageCusumMax(shuffled, p0, p1) >= statistic) exceed++;
  }
  const misses = sequence.reduce<number>((acc, e) => acc + e, 0);
  return { label, p0, p1, statistic, n: sequence.length, misses, permutation: { seed, perms, exceed, p_value: (1 + exceed) / (perms + 1) } };
}

/** Labels for the pre-J0 CUSUM diagnostics (ADR-M014 D4): retrospective, withdrawn from sequential reading. */
const PREJ0_CUSUM_LABEL = "pre-J0 CUSUM (retrospective permutation diagnostic, withdrawn from sequential reading; ADR-M014 D4): E_static over calm pairs";
const PREJ0_CUSUM_ALL_LABEL = "pre-J0 CUSUM (retrospective permutation diagnostic; ADR-M014 D4): E_static over all evaluable pairs";

/**
 * Build the pre-registered e-detector section (ADR-M014) from the calm-pair misses and their closing-window
 * days. PURE. The design check runs at p0 = 0.30 (bound-carrying class); the disqualified class runs at
 * p0 = 0.125 (crosses in-sample). `calmPairDays[i]` is the closing-window day of calm pair `i` (0-based);
 * it MUST align 1:1 with `calmMiss`. Scalars only — the per-step arrays never leave the run.
 */
function buildEDetector(calmMiss: readonly Miscover[], calmPairDays: readonly string[]): EDetectorSection {
  if (calmPairDays.length !== calmMiss.length) {
    throw new Error(`buildEDetector: calmPairDays (${String(calmPairDays.length)}) must align with calmMiss (${String(calmMiss.length)}).`);
  }
  const design = runEDetector(calmMiss, EDET.p0, gridFor(EDET.p0));
  const disq = runEDetector(calmMiss, DISQUALIFIED_P0, gridFor(DISQUALIFIED_P0));
  const idx = disq.crossed_sr;
  return {
    note: "e-detector (SRR 2022, ADR-M014): design artefact on the committed calm pairs; cited as evidence, never a trigger (D2); not carried into state.json (D6). The bound is on the average run length against the worst member of the class, not a delay and not a rate.",
    p0: EDET.p0,
    q_l: EDET.qL,
    q_u: EDET.qU,
    alpha_arl: EDET.alphaArl,
    k: EDET.K,
    start_after_day: EDET.startAfterDay,
    threshold_log: Math.log(1 / EDET.alphaArl),
    preregistered_at: EDET_PREREGISTERED_AT,
    preregistration_commit: EDET_PREREGISTRATION_COMMIT,
    anchor_line_hash: EDET_ANCHOR_LINE_HASH,
    design_check: {
      label: "design check, no bound",
      p0: EDET.p0,
      n: design.n,
      max_logM_sr: design.max_logM_sr,
      max_logM_cu: design.max_logM_cu,
      crossed: design.crossed_sr,
    },
    disqualified_class: {
      p0: DISQUALIFIED_P0,
      first_crossing_index: idx,
      first_crossing_day: idx === null ? null : calmPairDays[idx]!,
      note: "p0 = 0.125 crosses log(1/alpha_arl) in-sample: the class does not contain the calm reference, so it is inapt (ADR-M014 D6, C-2).",
    },
  };
}

/**
 * Build the instrument section from a folded sentinel state (PURE — no filesystem, no network). The two
 * replays run on `state.scores` (the exact evaluable-pair stream the LIVE tracker sees — D2: every
 * evaluable pair; a calm-filtered replay would fabricate a regime); the pre-J0 CUSUM runs on
 * `state.calmMiss` (the calm population, advisor-defi §0). The e-detector section (ADR-M014) needs the
 * calm-pair closing-window days (`opts.calmPairDays`) to label the disqualified-class crossing. Each replay's
 * digest is distinct from `live_state_digest` (same scores, different params).
 */
export function buildInstrument(state: SentinelState, opts: { perms?: number; seed?: number; calmPairDays: readonly string[] }): Instrument {
  const perms = opts.perms ?? DEFAULT_PERMS;
  const seed = opts.seed ?? PERM_SEED;
  const q1 = state.tracker.q1;
  const scores = state.scores;
  const official = state.tracker.params;
  return {
    note: "INSTRUMENT (ADR-M012 D6): replays and diagnostics published labelled; NEVER carried into state.json.",
    scores_n: scores.length,
    q1,
    live_state_digest: trackerDigest(q1, official, scores),
    replays: [
      replayEntry("c=q_hat", { ...official, c: q1 }, q1, scores),
      replayEntry("eps=0.01", { ...official, eps: EPS_INSTRUMENT }, q1, scores),
    ],
    cusum: cusumDiagnostic(PREJ0_CUSUM_LABEL, state.calmMiss, CUSUM_P0, CUSUM_P1, perms, seed),
    cusum_all_evaluable: cusumDiagnostic(PREJ0_CUSUM_ALL_LABEL, state.eStatic, CUSUM_P0, CUSUM_P1, perms, seed),
    eps01_projected_bound_leq_target_T: projectedBoundT(DELTA_TARGET, { ...official, eps: EPS_INSTRUMENT }),
    edetector: buildEDetector(state.calmMiss, opts.calmPairDays),
  };
}

// ── CLI fold (the committed series fixture) — used only by the CLI entry, never by the live job ─────────
interface SeriesWindow {
  readonly day: string; readonly fromBlock: number; readonly toBlock: number;
  readonly burns: string; readonly mints: string; readonly supplyClose: string; readonly supplyOpen: string;
  readonly v_t_per_hr: number | null; readonly error?: string;
}
interface Series { readonly windows: readonly SeriesWindow[]; }

const INSTRUMENT_PROV: { endpoints: readonly string[]; node_version: string; sentinel_sha: string } = {
  endpoints: [], node_version: "instrument", sentinel_sha: "0".repeat(64),
};

function factsOf(w: SeriesWindow): WindowFacts {
  return { day: w.day, fromBlock: w.fromBlock, toBlock: w.toBlock, burns: BigInt(w.burns), mints: BigInt(w.mints), supplyClose: BigInt(w.supplyClose), supplyOpen: BigInt(w.supplyOpen) };
}

/**
 * Fold the committed series windows through the SAME flow/timeline helpers the live job uses, and record the
 * closing-window day of each calm pair (the day of the window at which `state.calmMiss` grows). The days
 * align 1:1 with `state.calmMiss` and label the e-detector crossing (ADR-M014); `timeline.ts` is off-limits
 * and carries no days, so the alignment is reconstructed here from the real `step`, never re-derived.
 */
export function foldSeriesWithDays(windows: readonly SeriesWindow[]): { state: SentinelState; calmPairDays: string[] } {
  let state = initState();
  const calmPairDays: string[] = [];
  for (const w of windows) {
    if (w.error) continue;
    const facts = factsOf(w);
    const r = attest(facts);
    if (r.status === "c1_fail") throw new Error(`instrument: committed window ${w.day} fails C1 — fixture corrupt`);
    const before = state.calmMiss.length;
    state = step(state, facts, r, INSTRUMENT_PROV).state;
    if (state.calmMiss.length > before) calmPairDays.push(w.day);
  }
  return { state, calmPairDays };
}

/** Fold the committed series windows (state only; the day-aware fold is `foldSeriesWithDays`). */
export function foldSeries(windows: readonly SeriesWindow[]): SentinelState {
  return foldSeriesWithDays(windows).state;
}

/** Refuse an `--out` whose resolved path passes through a directory named exactly `public` (ADR-M012 (l),
 *  C-3): the instrument is a diagnostic file, never served from the public Caddy root. Segment-exact, so
 *  `publicfoo` passes while `./public/x.json` and `/var/lib/.../public/x.json` throw. Pure — writes nothing. */
export function assertOutPathAllowed(out: string): void {
  const segments = resolve(out).split(/[/\\]+/);
  if (segments.some((s) => s === "public")) {
    throw new Error(`instrument: --out must not be under a directory named 'public' (got ${out}).`);
  }
}

interface Args { out: string | null; perms: number; seed: number; series: string | null; }

function parseArgs(argv: readonly string[]): Args {
  let out: string | null = null, perms = DEFAULT_PERMS, seed = PERM_SEED, series: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--out") { out = argv[i + 1] ?? null; i++; }
    else if (a === "--perms") { perms = Number(argv[i + 1]); i++; }
    else if (a === "--seed") { seed = Number(argv[i + 1]); i++; }
    else if (a === "--series") { series = argv[i + 1] ?? null; i++; }
  }
  return { out, perms, seed, series };
}

function main(): void {
  const { out, perms, seed, series } = parseArgs(process.argv.slice(2));
  if (out === null) throw new Error("instrument: --out <file> is required (INSTRUMENT is written by this CLI, never by run.ts).");
  assertOutPathAllowed(out);
  if (!Number.isInteger(perms) || perms < 1) throw new Error(`instrument: --perms must be a positive integer (got ${String(perms)}).`);
  if (!Number.isInteger(seed)) throw new Error(`instrument: --seed must be an integer (got ${String(seed)}).`);
  const seriesPath = series ?? fileURLToPath(new URL("../../../fixtures/usde-calib-series.json", import.meta.url));
  const parsed = JSON.parse(readFileSync(seriesPath, "utf8")) as Series;
  const { state, calmPairDays } = foldSeriesWithDays(parsed.windows);
  const instrument = buildInstrument(state, { perms, seed, calmPairDays });
  writeFileSync(out, JSON.stringify({ instrument }, null, 2) + "\n");
  console.log(`instrument written to ${out} (calm CUSUM=${String(instrument.cusum.statistic)}, p=${String(instrument.cusum.permutation.p_value)}).`);
}

// Run-guard (mirrors run.ts): the CLI runs only when invoked directly, never on import (tests).
if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  try { main(); } catch (e: unknown) { console.error("instrument FATAL", e); process.exitCode = 1; }
}
