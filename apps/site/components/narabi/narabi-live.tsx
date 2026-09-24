"use client";

// apps/site/components/narabi/narabi-live.tsx — the /narabi board, in the existing storefront tokens
// (globals.css, dark/light). Read-only. First paint = the committed capture the server passes in (declared as such);
// the browser then reads the two same-origin static files and re-renders, or keeps the capture and SAYS the read
// failed. Every number is a read of the parsed data, of the committed served-facts record, or a value recomputed
// here from them (never a literal); the only digit-bearing copy is the frozen D8 sentence, rendered as the const
// `{D8_SENTENCE}`. No endpoint URL is ever held here: the parser keeps only their count, and the loader keeps no
// served body.

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  loadNarabi,
  captureAfterFailure,
  checkIntegrity,
  integrityLedeFor,
  compact18,
  sci,
  fixed,
  fmtNum,
  readAtLabel,
  unitFraction,
  shortHash,
  regimeWord,
  pairWord,
  missWord,
  clippedNote,
  c1Word,
  isNil,
  firstReadingLabel,
  projectedBoundDate,
  driftStatus,
  lagView,
  liveWord,
  codeVersions,
  codeVersionLabel,
  parameterSegments,
  endpointPoolLabel,
  staticMissLabel,
  trackerMissLabel,
  sentinelBudgetLabel,
  c1Check,
  c1Label,
  chainLabel,
  yesNo,
  paginate,
  recomputeRecipe,
  replayCheck,
  DRIFT_THRESHOLD,
  CALM_WINDOW,
  D8_SENTENCE,
  WHY_SEVEN,
  TRACKER_ADAPTS,
  NO_COVERAGE_MEASURED,
  STATUS_IS_A_WORD,
  BOUND_FORMULA,
  HERO_DEK,
  WINDOWS_LEDE,
  DRIFT_LEDE,
  RECOMPUTE_LEDE,
  TRAJECTORY_LEDE,
  STATIC_MISS_FRAMING,
  TRACKER_MISS_FRAMING,
  SENTINEL_BUDGET_FRAMING,
  NOSCRIPT_NOTE,
  HASHES_SUMMARY,
  STATE_PATH,
  TIMELINE_PATH,
} from "@/lib/narabi-live";
import type { CaptureRef, FetchedFile, Integrity, NarabiData, PublishSchedule } from "@/lib/narabi-live";
import type { NarabiServed } from "@/lib/narabi-served-load";
import { NarabiMark } from "@/components/marks/narabi-mark";
import { LEVELS, WINDOW_STEPS, GATE_NOTES, gateBody, NOT_LIST, GLOSSARY, FLEET_PLACE, VERIFY_HINT } from "@/lib/narabi-copy";

async function browserFetchFile(url: string): Promise<FetchedFile> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${String(res.status)} ${url}`);
  return { text: await res.text(), lastModified: res.headers.get("last-modified") };
}

/** Web Crypto SHA-256 as lowercase hex (the hasher the pure module expects). */
async function webSha256(bytes: Uint8Array): Promise<string> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const digest = await crypto.subtle.digest("SHA-256", copy);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

// `nowrap` (mobile review, point 11): a number cut over two lines reads as two numbers, so numeric facts scroll
// in their cell instead of breaking; digests keep breaking (they are copied, not read). `lines` keeps the
// newlines of a multi-line value.
function Fact({
  k,
  v,
  note,
  mono = true,
  nowrap = false,
  lines = false,
}: {
  k: string;
  v: string;
  note?: string;
  mono?: boolean;
  nowrap?: boolean;
  lines?: boolean;
}) {
  const base = !mono
    ? "mt-0.5 text-sm text-foreground"
    : nowrap
      ? "mt-0.5 overflow-x-auto whitespace-nowrap font-mono text-sm text-foreground"
      : "mt-0.5 break-all font-mono text-sm text-foreground";
  return (
    <div className="border-t border-border py-2 first:border-t-0">
      <dt className="text-xs uppercase tracking-[0.06em] text-muted-foreground">{k}</dt>
      <dd className={lines ? base + " whitespace-pre-line" : base}>{v}</dd>
      {note ? <p className="mt-0.5 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

// Charter C: charter cards + the fixed Narabi accent (var(--narabi)); the page's own
// footer is gone — the site footer carries the four common phrases (footers uniformised).
function Card({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <section className="c-card">
      <h2 className="c-h2">{title}</h2>
      {lede ? <p className="c-muted c-small" style={{ marginTop: -6 }}>{lede}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function NarabiLive({
  initial,
  initialIntegrity,
  capture,
  calibration,
  served,
}: {
  initial: NarabiData;
  initialIntegrity: Integrity;
  capture: CaptureRef;
  calibration: { nCalib: number; calibDigest: string };
  served: NarabiServed;
}) {
  const [data, setData] = useState<NarabiData>(initial);
  const [page, setPage] = useState(0);
  // Each integrity result is tied to the data it was computed on, and says where it was computed.
  const [checked, setChecked] = useState<{ on: NarabiData; value: Integrity; where: "build" | "browser" }>({
    on: initial,
    value: initialIntegrity,
    where: "build",
  });
  const [integrityError, setIntegrityError] = useState<string | null>(null);

  // The read of the files as served now: on success the board re-renders from them; on ANY failure (after the one
  // re-read loadNarabi makes) it keeps the capture it already shows and says the read failed (never a silent
  // substitution).
  useEffect(() => {
    let alive = true;
    loadNarabi({ fetchFile: browserFetchFile, capture, sha256Hex: webSha256 })
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((err: unknown) => {
        if (alive) setData(captureAfterFailure(initial, capture.capturedAt, err));
      });
    return () => {
      alive = false;
    };
  }, [initial, capture]);

  // Integrity: first paint carries the checks recomputed at BUILD on the capture (declared as such); the browser then
  // recomputes them for whatever the board shows (the capture, then the files as served now) and says so, state by
  // state (integrityLedeFor).
  useEffect(() => {
    let alive = true;
    setIntegrityError(null);
    checkIntegrity(data, webSha256)
      .then((r) => {
        if (alive) setChecked({ on: data, value: r, where: "browser" });
      })
      .catch((err: unknown) => {
        if (alive) setIntegrityError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      alive = false;
    };
  }, [data]);

  const { state, lines } = data;
  const params = state.tracker.params;
  const pg = paginate(lines, 90, page);
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  const pb = projectedBoundDate(state, lines);
  const drift = driftStatus(lines);
  const live = data.sourceKind === "live";
  const schedule: PublishSchedule = {
    on_calendar_utc: served.sentinel_timer.on_calendar_utc,
    randomized_delay_s: served.sentinel_timer.randomized_delay_s,
    deadline_utc: served.probe.deadline_utc,
  };
  const { lag, text: lagText } = lagView(data, schedule);
  const versions = codeVersions(lines);
  const segs = parameterSegments(state, lines);
  const recipe = recomputeRecipe(state, lines);
  const replay = replayCheck(state, lines);
  const c1 = c1Check(lines);
  const boundValue = last && !isNil(last.bound_thm1) ? fixed(last.bound_thm1, 4) : "—";
  const paramList = (Object.entries(params) as [string, number][])
    .map(([k, v]) => `${k} = ${fmtNum(v)}`)
    .join("  ·  ");
  const tSource = live ? "read from the published state" : `from the committed capture of ${capture.capturedAt}`;
  const published =
    data.publishedAt.timeline === data.publishedAt.state
      ? readAtLabel(data.publishedAt.timeline)
      : `timeline ${readAtLabel(data.publishedAt.timeline)} · state ${readAtLabel(data.publishedAt.state)}`;
  const pending = integrityError !== null ? `not recomputed in this browser (${integrityError})` : "recomputing in this browser…";
  const integrity: Integrity | null = checked.on === data ? checked.value : null;
  const integrityLede = integrityLedeFor({ onShownData: checked.on === data, where: checked.where, failed: integrityError !== null }, data);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <header className="flex flex-col items-stretch gap-3">
        <div className="flex items-center gap-3">
          <span className="text-foreground">
            <NarabiMark className="size-8" />
          </span>
          <span className="c-label">
            narabi · {liveWord(data, lag)} · <span className="text-foreground">{data.source}</span>
          </span>
        </div>
        {/* Status pill: "built · step N of 7 before first reading" while t < SERIES_MIN_STEPS,
            then "built · N windows published". N is read (never typed); the word "built" follows the frozen
            register. min-w-0 + truncate is the overflow fallback for a narrow viewport. */}
        <span className="c-pill c-pill--shipped min-w-0 max-w-full self-start">
          <span className="min-w-0 truncate">{firstReadingLabel(state, lines)}</span>
        </span>
        <h1 className="c-h1">Narabi — daily</h1>
        <p className="c-lede" style={{ fontSize: 17 }}>{HERO_DEK}</p>
        <noscript>
          <p className="text-sm text-muted-foreground">{NOSCRIPT_NOTE}</p>
        </noscript>
      </header>

      {/* Why seven steps + the printed bound */}
      <Card title="Why seven steps">
        <p className="text-sm text-muted-foreground">
          T = <span className="font-mono text-foreground">{fmtNum(state.tracker.t)}</span>, {tSource}. {WHY_SEVEN}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          The bound printed daily is the Angelopoulos, Barber and Bates long-run quantity{" "}
          <span className="font-mono text-foreground">{BOUND_FORMULA}</span> with c = B ={" "}
          <span className="font-mono text-foreground">{unitFraction(params.c)}</span> and ε ={" "}
          <span className="font-mono text-foreground">{fmtNum(params.eps)}</span>; it stays above the target{" "}
          <span className="font-mono text-foreground">{fmtNum(params.alpha)}</span> until T ={" "}
          <span className="font-mono text-foreground">{fmtNum(state.projected_bound_leq_target_T)}</span>, and we
          say so plainly rather than as a feature.
        </p>
        <p className="mt-3 text-sm text-foreground">
          {TRACKER_ADAPTS} {NO_COVERAGE_MEASURED}
        </p>
      </Card>

      {/* What Narabi is — six levels, condensed (T0 copy, lib/narabi-copy.ts) */}
      <Card title="What Narabi is" lede={FLEET_PLACE}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEVELS.map((lv) => (
            <div key={lv.name} className="rounded-lg border border-border bg-soft p-4">
              <div className="c-label" style={{ color: "var(--narabi)" }}>{lv.name}</div>
              <p className="mt-1 text-sm font-medium text-foreground">{lv.claim}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{lv.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* How a window is built */}
        <Card title="How a window is built" lede="Five steps, every one recomputable from the chain and the two files.">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            {WINDOW_STEPS.map((st) => (
              <li key={st} className="pl-1">{st}</li>
            ))}
          </ol>
        </Card>

        {/* What the gate does with it — class and key from the committed served-facts record, size and digest derived at build */}
        <Card title="What the gate does with it" lede={gateBody(String(calibration.nCalib))}>
          <dl>
            <Fact k="task class" v={served.gate.task_class} note={GATE_NOTES.cls} />
            <Fact k="committed key" v={served.gate.predictor_id} note={GATE_NOTES.key} />
            <Fact k="calibration pairs" v={String(calibration.nCalib)} note={GATE_NOTES.nCalib} />
            <Fact k="calibration digest" v={shortHash(calibration.calibDigest, 8)} note={GATE_NOTES.digest} />
          </dl>
          <p className="mt-3 text-xs text-muted-foreground">{VERIFY_HINT}</p>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Tracker state */}
        <Card title="Tracker state">
          <blockquote className="border-l-2 pl-3 text-sm italic text-muted-foreground" style={{ borderColor: "var(--narabi)" }}>
            {D8_SENTENCE}
          </blockquote>
          <dl className="mt-3">
            <Fact k="q_t" v={sci(state.tracker.q, 6)} note="current threshold of the adaptive quantile tracker" />
            <Fact k="q₁" v={sci(state.tracker.q1, 6)} note="the committed static calibration" />
            <Fact k="T" v={fmtNum(state.tracker.t)} note="pairs stepped so far, evaluable or clipped" />
            <Fact
              k="bound_thm1"
              v={boundValue}
              note="deterministic long-run bound, tightens as T grows; a — means no stepped pair yet"
            />
            <Fact
              k="bound ≤ target, projected"
              v={pb.date ? pb.date : "—"}
              note={pb.assumption}
            />
            <Fact k="tracker parameter segments" v={segs.text} mono={false} />
            <Fact k="params" v={paramList} nowrap />
            <Fact k="digest" v={shortHash(state.digest, 8)} note="the tracker digest: folds q₁, params and every stepped score" />
          </dl>
        </Card>

        {/* Pre-registered drift criterion */}
        <Card title="Pre-registered drift criterion" lede={DRIFT_LEDE}>
          <dl>
            <Fact
              k="criterion"
              v={`rolling calm-miss ≥ ${fixed(DRIFT_THRESHOLD, 2)} over the last ${fmtNum(CALM_WINDOW)} calm pairs`}
            />
            <Fact k="status" v={drift.text} mono={false} />
            <Fact k="fired" v={drift.fired ? "yes — an ADR is opened; no automatic switch" : "no"} mono={false} />
          </dl>
        </Card>
      </div>

      {/* Windows */}
      <Card title="Windows" lede={WINDOWS_LEDE}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1 pr-3 font-medium" scope="col">day</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">T</th>
                <th className="py-1 pr-3 font-medium" scope="col">blocks</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">supply open (USDe)</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">burns (USDe)</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">mints (USDe)</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">supply close (USDe)</th>
                <th className="py-1 pr-3 font-medium" scope="col">supply identity</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">v (per hour)</th>
                <th className="py-1 pr-3 font-medium" scope="col">regime</th>
                <th className="py-1 font-medium" scope="col">pair</th>
              </tr>
            </thead>
            <tbody>
              {pg.rows.map((l) => (
                <tr key={l.line_hash} className="border-b border-border/60 text-foreground">
                  <td className="py-1 pr-3">{l.day}</td>
                  <td className="py-1 pr-3 text-right">{fmtNum(l.T)}</td>
                  <td className="py-1 pr-3">{fmtNum(l.from_block)}–{fmtNum(l.to_block)}</td>
                  <td className="py-1 pr-3 text-right">{compact18(l.s_open)}</td>
                  <td className="py-1 pr-3 text-right">{compact18(l.burns)}</td>
                  <td className="py-1 pr-3 text-right">{compact18(l.mints)}</td>
                  <td className="py-1 pr-3 text-right">{compact18(l.supply_close)}</td>
                  <td className="py-1 pr-3">{c1Word(l.c1_ok)}</td>
                  <td className="py-1 pr-3 text-right">{sci(l.v, 4)}</td>
                  <td className="py-1 pr-3">{regimeWord(l.regime)}</td>
                  <td className="py-1">{pairWord(l.pair_status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <nav className="mt-3 flex items-center gap-3 text-xs text-muted-foreground" aria-label="windows pagination">
          <span className="font-mono">{pg.rangeLabel} · {pg.pageLabel}</span>
          {pg.pages > 1 ? (
            <span className="flex gap-2">
              <button
                type="button"
                className="rounded border border-border px-2 py-0.5 disabled:opacity-40"
                onClick={() => setPage((p) => p - 1)}
                disabled={pg.page === 0}
              >
                newer
              </button>
              <button
                type="button"
                className="rounded border border-border px-2 py-0.5 disabled:opacity-40"
                onClick={() => setPage((p) => p + 1)}
                disabled={pg.page >= pg.pages - 1}
              >
                older
              </button>
            </span>
          ) : null}
        </nav>
        <p className="mt-2 text-xs text-muted-foreground">{STATUS_IS_A_WORD}</p>
      </Card>

      {/* Tracker trajectory — every stepped pair, read from the published lines */}
      <Card title="Tracker trajectory" lede={TRAJECTORY_LEDE}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="py-1 pr-3 font-medium" scope="col">day</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">T</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">s</th>
                <th className="py-1 pr-3 font-medium" scope="col">static miss</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">q before</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">η</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">q after</th>
                <th className="py-1 pr-3 font-medium" scope="col">tracker miss</th>
                <th className="py-1 text-right font-medium" scope="col">long-run bound</th>
              </tr>
            </thead>
            <tbody>
              {pg.rows.map((l) => (
                <tr key={l.line_hash} className="border-b border-border/60 text-foreground">
                  <td className="py-1 pr-3">{l.day}</td>
                  <td className="py-1 pr-3 text-right">{fmtNum(l.T)}</td>
                  <td className="py-1 pr-3 text-right">
                    {sci(l.s, 4)}
                    {clippedNote(l)}
                  </td>
                  <td className="py-1 pr-3">{missWord(l.E_static)}</td>
                  <td className="py-1 pr-3 text-right">{sci(l.q_before, 4)}</td>
                  <td className="py-1 pr-3 text-right">{sci(l.eta, 4)}</td>
                  <td className="py-1 pr-3 text-right">{sci(l.q_after, 4)}</td>
                  <td className="py-1 pr-3">{missWord(l.E_tracker)}</td>
                  <td className="py-1 text-right">{fixed(l.bound_thm1, 4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="mt-3">
          <Fact k="static misses so far" v={staticMissLabel(last)} note={STATIC_MISS_FRAMING} mono={false} />
          <Fact k="share of tracker misses so far" v={trackerMissLabel(last)} note={TRACKER_MISS_FRAMING} mono={false} />
          <Fact k="sentinel's informational static budget (field B_t)" v={sentinelBudgetLabel(last)} note={SENTINEL_BUDGET_FRAMING} mono={false} />
        </dl>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-muted-foreground">{HASHES_SUMMARY}</summary>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full border-collapse text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="py-1 pr-3 font-medium" scope="col">day</th>
                  <th className="py-1 pr-3 font-medium" scope="col">utterance</th>
                  <th className="py-1 pr-3 font-medium" scope="col">AttestedFlow</th>
                  <th className="py-1 pr-3 font-medium" scope="col">digest_T</th>
                  <th className="py-1 pr-3 font-medium" scope="col">prev line</th>
                  <th className="py-1 font-medium" scope="col">line</th>
                </tr>
              </thead>
              <tbody>
                {pg.rows.map((l) => (
                  <tr key={l.line_hash} className="border-b border-border/60 text-foreground">
                    <td className="py-1 pr-3">{l.day}</td>
                    <td className="py-1 pr-3">{shortHash(l.utterance_hash, 6)}</td>
                    <td className="py-1 pr-3">{shortHash(l.attested_flow_sha256, 6)}</td>
                    <td className="py-1 pr-3">{shortHash(l.digest_T, 6)}</td>
                    <td className="py-1 pr-3">{shortHash(l.prev_line_hash, 6)}</td>
                    <td className="py-1">{shortHash(l.line_hash, 6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recompute & diff */}
        <Card title="Recompute & diff" lede={RECOMPUTE_LEDE}>
          <pre className="overflow-x-auto rounded-lg border border-border bg-soft p-3 font-mono text-xs leading-relaxed text-foreground">
            {recipe}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">{integrityLede}</p>
          {integrityError !== null ? <p className="text-xs text-muted-foreground">{pending}</p> : null}
          <dl className="mt-1">
            <Fact k="hash chain" v={integrity ? chainLabel(integrity.chain) : pending} mono={false} />
            <Fact
              k="state.json digest equals the last line's digest_T"
              v={integrity ? yesNo(integrity.stateAgreesWithLastLine, "—") : pending}
              mono={false}
            />
            <Fact
              k="tracker digest recomputed from q₁, params and the s column"
              v={integrity ? (integrity.digestRecomputed ? "equals state.json" : "differs from state.json") : pending}
              mono={false}
            />
            <Fact k="tracker replay recomputed here" v={replay.text} mono={false} />
            <Fact k="supply identity (open = close + burns − mints)" v={c1Label(c1)} mono={false} />
            <Fact
              k={`the timeline served now extends, byte for byte, the one served at the capture of ${capture.capturedAt}`}
              v={integrity ? yesNo(integrity.extendsCapture, "not applicable: this is the capture") : pending}
              mono={false}
            />
          </dl>
          <p className="mt-2 text-xs text-muted-foreground">
            <a className="underline" href={STATE_PATH} download>
              state.json
            </a>{" "}
            ·{" "}
            <a className="underline" href={TIMELINE_PATH} download>
              timeline.jsonl
            </a>{" "}
            · published files, read-only
          </p>
        </Card>

        {/* Operational register */}
        <Card title="Operational register">
          <dl>
            <Fact k="sentinel_sha" v={shortHash(last ? last.sentinel_sha : null, 8)} />
            <Fact k="node_version" v={last ? last.node_version : "—"} />
            <Fact k="endpoints" v={endpointPoolLabel(last)} mono={false} />
            <Fact k="lag" v={lagText} mono={false} />
            <Fact k="published at" v={live ? published : "—"} note="the Last-Modified header of each served file" />
            <Fact
              k="code versions (sentinel · node)"
              v={versions.map(codeVersionLabel).join("\n") || "—"}
              note="a run of lines written by an unchanged sentinel build and Node version; a new build does not change the tracker parameters"
              lines
            />
            <Fact k="source" v={data.source} mono={false} />
            <Fact k="read at" v={readAtLabel(data.readAt)} />
          </dl>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card title="What this is not">
          <ul className="space-y-1.5 text-sm text-foreground">
            {NOT_LIST.map((n) => (
              <li key={n} className="flex gap-2">
                <span aria-hidden className="text-muted-foreground">×</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title="Glossary">
          <dl>
            {GLOSSARY.map((g) => (
              <Fact key={g.term} k={g.term} v={g.def} mono={false} />
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}
