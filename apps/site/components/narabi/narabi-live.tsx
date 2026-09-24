"use client";

// apps/site/components/narabi/narabi-live.tsx — the /narabi board (ADR-M012 D4), rendering the designer's
// concept B in the existing storefront tokens (globals.css, dark/light), NOT the concept's own palette.
// Read-only: it fetches the two same-origin static files and, when that fails (dev/test), falls back to the
// committed snapshot with a DECLARED badge. Every number is a read of the parsed data (never a literal); the
// only digit-bearing copy is the frozen D8 sentence, rendered as the const `{D8_SENTENCE}`.

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { NARABI_SNAPSHOT } from "@/lib/narabi-snapshot";
import {
  loadNarabi,
  compact18,
  sci,
  fixed,
  fmtNum,
  readAtLabel,
  unitFraction,
  shortHash,
  regimeWord,
  pairWord,
  isNil,
  firstReadingLabel,
  projectedBoundDate,
  driftStatus,
  lagStatus,
  segments,
  endpointsUnion,
  paginate,
  recomputeRecipe,
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
  STATE_PATH,
  TIMELINE_PATH,
} from "@/lib/narabi-live";
import type { NarabiData } from "@/lib/narabi-live";
import { NarabiMark } from "@/components/marks/narabi-mark";
import { LEVELS, WINDOW_STEPS, GATE, NOT_LIST, GLOSSARY, FLEET_PLACE, VERIFY_HINT } from "@/lib/narabi-copy";

async function browserFetchText(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${String(res.status)} ${url}`);
  return res.text();
}

// `nowrap` (designer mobile point 11): a number cut over two lines reads as two numbers, so numeric facts scroll
// in their cell instead of breaking; digests keep breaking (they are copied, not read).
function Fact({ k, v, note, mono = true, nowrap = false }: { k: string; v: string; note?: string; mono?: boolean; nowrap?: boolean }) {
  const ddClass = !mono
    ? "mt-0.5 text-sm text-foreground"
    : nowrap
      ? "mt-0.5 overflow-x-auto whitespace-nowrap font-mono text-sm text-foreground"
      : "mt-0.5 break-all font-mono text-sm text-foreground";
  return (
    <div className="border-t border-border py-2 first:border-t-0">
      <dt className="text-xs uppercase tracking-[0.06em] text-muted-foreground">{k}</dt>
      <dd className={ddClass}>{v}</dd>
      {note ? <p className="mt-0.5 text-xs text-muted-foreground">{note}</p> : null}
    </div>
  );
}

// Charter C (decision 145): charter cards + the fixed Narabi accent (var(--narabi), decision 120); the page's own
// footer is gone — the site footer carries the four common phrases (ruling Q5, footers uniformised).
function Card({ title, lede, children }: { title: string; lede?: string; children: ReactNode }) {
  return (
    <section className="c-card">
      <h2 className="c-h2">{title}</h2>
      {lede ? <p className="c-muted c-small" style={{ marginTop: -6 }}>{lede}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function NarabiLive({ publishSchedule }: { publishSchedule: string }) {
  const [data, setData] = useState<NarabiData | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    let alive = true;
    void loadNarabi({ fetchText: browserFetchText, snapshot: NARABI_SNAPSHOT }).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <p className="font-mono text-sm text-muted-foreground" aria-live="polite">
        reading the published files…
      </p>
    );
  }

  const { state, lines } = data;
  const params = state.tracker.params;
  const pg = paginate(lines, 90, page);
  const last = lines.length > 0 ? lines[lines.length - 1] : undefined;
  const pb = projectedBoundDate(state, lines);
  const drift = driftStatus(lines);
  const lag = lagStatus(lines, new Date(data.fetchedAt), publishSchedule);
  const segs = segments(lines);
  const recipe = recomputeRecipe(state, lines);
  const boundValue = last && !isNil(last.bound_thm1) ? fixed(last.bound_thm1, 4) : "—";
  const paramList = (Object.entries(params) as [string, number][])
    .map(([k, v]) => `${k} = ${fmtNum(v)}`)
    .join("  ·  ");

  return (
    <div className="flex flex-col gap-8">
      {/* Hero */}
      <header className="flex flex-col items-stretch gap-3">
        <div className="flex items-center gap-3">
          <span className="text-foreground">
            <NarabiMark className="size-8" />
          </span>
          <span className="c-label">
            narabi · sensor running · <span className="text-foreground">{data.source}</span>
          </span>
        </div>
        {/* Status pill (ruling C-3): "built · step N of 7 before first reading" while t < SERIES_MIN_STEPS,
            then "built · N windows published". N is read (never typed); the word "built" follows the frozen
            register. min-w-0 + truncate is the overflow fallback for a narrow viewport. */}
        <span className="c-pill c-pill--shipped min-w-0 max-w-full self-start">
          <span className="min-w-0 truncate">{firstReadingLabel(state, lines)}</span>
        </span>
        <h1 className="c-h1">Narabi — daily</h1>
        <p className="c-lede" style={{ fontSize: 17 }}>{HERO_DEK}</p>
      </header>

      {/* Why seven steps + the printed bound */}
      <Card title="Why seven steps">
        <p className="text-sm text-muted-foreground">
          Today T = <span className="font-mono text-foreground">{fmtNum(state.tracker.t)}</span>. {WHY_SEVEN}
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

        {/* What the gate does with it */}
        <Card title="What the gate does with it" lede={GATE.body}>
          <dl>
            <Fact k="task class" v={GATE.cls} />
            <Fact k="committed key" v={GATE.key} />
            <Fact k="calibration pairs" v={GATE.nCalib} note="calm calibration pairs behind q₁; measured, order-independent digest" />
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
            <Fact k="T" v={fmtNum(state.tracker.t)} note="evaluable pairs stepped so far" />
            <Fact
              k="bound_thm1"
              v={boundValue}
              note="deterministic long-run bound, tightens as T grows; a — means no evaluable pair yet"
            />
            <Fact
              k="bound ≤ target, projected"
              v={pb.date ? pb.date : "—"}
              note={pb.assumption}
            />
            <Fact k="params" v={paramList} nowrap />
            <Fact k="digest" v={shortHash(state.digest, 8)} note="folds q₁, params and every stepped score" />
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
                <th className="py-1 pr-3 font-medium" scope="col">blocks</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">burns (USDe)</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">mints (USDe)</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">supply close (USDe)</th>
                <th className="py-1 pr-3 text-right font-medium" scope="col">v</th>
                <th className="py-1 pr-3 font-medium" scope="col">regime</th>
                <th className="py-1 font-medium" scope="col">pair</th>
              </tr>
            </thead>
            <tbody>
              {pg.rows.map((l) => (
                <tr key={l.line_hash} className="border-b border-border/60 text-foreground">
                  <td className="py-1 pr-3">{l.day}</td>
                  <td className="py-1 pr-3">{fmtNum(l.from_block)}–{fmtNum(l.to_block)}</td>
                  <td className="py-1 pr-3 text-right">{compact18(l.burns)}</td>
                  <td className="py-1 pr-3 text-right">{compact18(l.mints)}</td>
                  <td className="py-1 pr-3 text-right">{compact18(l.supply_close)}</td>
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

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recompute & diff */}
        <Card title="Recompute & diff" lede={RECOMPUTE_LEDE}>
          <pre className="overflow-x-auto rounded-lg border border-border bg-soft p-3 font-mono text-xs leading-relaxed text-foreground">
            {recipe}
          </pre>
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
            <Fact k="endpoints" v={endpointsUnion(lines).join("\n") || "—"} />
            <Fact k="lag" v={lag.text} mono={false} />
            <Fact
              k="segments"
              v={
                segs
                  .map((s) => `${s.from} → ${s.to} · sentinel ${shortHash(s.sentinel_sha, 6)} · node ${s.node_version}`)
                  .join("\n") || "—"
              }
              note="a segment is a run of unchanged parameters; any change opens a new one"
            />
            <Fact k="source" v={data.source} mono={false} />
            <Fact k="read at" v={readAtLabel(data.fetchedAt)} />
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
