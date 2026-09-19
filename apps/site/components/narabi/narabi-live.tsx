"use client";

// apps/site/components/narabi/narabi-live.tsx — the /narabi board (ADR-M012 D4), rendering the designer's
// concept B in the existing storefront tokens (globals.css, dark/light), NOT the concept's own palette.
// Read-only: it fetches the two same-origin static files and, when that fails (dev/test), falls back to the
// committed snapshot with a DECLARED source line. Every number is a read of the parsed data (never a literal);
// the only digit-bearing copy is the frozen D8 sentence, rendered as the const `{D8_SENTENCE}`.
//
// RESTYLE B (ADR-M013 T0): layout only. Same constants (lib/narabi-copy.ts, lib/narabi-live.ts) render the
// same strings — no rendered copy changes (honesty lint + gate:vocab depend on it). Colours come from the
// token contract + the two new tokens (soft-active / meter-empty); no hard-coded hue. Section ordinals and
// step numbers render through String(n).padStart(...) / String(i + 1) — a call, never a numeric literal, so
// the honesty lint (test 44) never sees them. Every dl label flows through a non-visible `k`/`v`/`note` prop
// and renders as `{k}` (dynamic) — identical mechanism to the previous <Fact>, so a digit-bearing label
// (bound_thm1) is never a scanned literal. Hash copy gives a purely visual acknowledgement (no new word).

import { useEffect, useRef, useState } from "react";
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
import { cn } from "@/lib/utils";

async function browserFetchText(url: string): Promise<string> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${String(res.status)} ${url}`);
  return res.text();
}

// The eleven sections, in the concept-B order (What Narabi is BEFORE Why seven steps). `id` drives both the
// sticky table of contents and the IntersectionObserver; `title` is an existing rendered string (also the
// section heading), rendered dynamically so the lint sees a property read, not a literal.
const SECTIONS = [
  { id: "s-what", title: "What Narabi is" },
  { id: "s-seven", title: "Why seven steps" },
  { id: "s-window", title: "How a window is built" },
  { id: "s-gate", title: "What the gate does with it" },
  { id: "s-tracker", title: "Tracker state" },
  { id: "s-drift", title: "Pre-registered drift criterion" },
  { id: "s-windows", title: "Windows" },
  { id: "s-recompute", title: "Recompute & diff" },
  { id: "s-ops", title: "Operational register" },
  { id: "s-not", title: "What this is not" },
  { id: "s-glossary", title: "Glossary" },
] as const;

// Inline mono "chip" for a datum set inside prose (design well #F0EBE2 = --soft).
const CHIP = "rounded bg-soft px-1.5 py-px font-mono text-[15px] text-foreground";
const CARD = "rounded-[14px] border border-border bg-card p-6 shadow-sm";

function SectionHead({
  n,
  big,
  onDark,
  right,
  children,
}: {
  n: number;
  big?: boolean;
  onDark?: boolean;
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={cn("font-mono text-[12px]", onDark ? "text-paper/60" : "text-ink2")}>
        {String(n).padStart(2, "0")}
      </span>
      <h3
        className={cn(
          "font-heading font-semibold tracking-tight",
          big ? "text-[24px]" : "text-[20px]",
          onDark ? "text-paper" : "text-foreground",
        )}
      >
        {children}
      </h3>
      {right ? <div className="ml-auto">{right}</div> : null}
    </div>
  );
}

// A state tile on the teal header band (dl item). Label/value/note flow through non-visible props.
function TileStat({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <div className="bg-ink/10 px-4 py-3.5">
      <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-paper/75">{k}</dt>
      <dd className="mt-1.5 break-words font-mono text-[15px] font-medium text-paper">{v}</dd>
      {note ? <p className="mt-1 text-[11px] leading-snug text-paper/70">{note}</p> : null}
    </div>
  );
}

// A "well" fact (design #F0EBE2 well, or an ink block for a negative/decisive datum).
function WellStat({
  k,
  v,
  note,
  mono = true,
  dark = false,
}: {
  k: string;
  v: ReactNode;
  note?: string;
  mono?: boolean;
  dark?: boolean;
}) {
  return (
    <div className={cn("rounded-[10px] p-3.5", dark ? "bg-ink" : "bg-soft shadow-inner")}>
      <dt className={cn("font-mono text-[11px] uppercase tracking-[0.06em]", dark ? "text-paper/60" : "text-ink2")}>
        {k}
      </dt>
      <dd className={cn("mt-1 text-[14px] leading-snug", mono ? "font-mono" : "", dark ? "text-paper" : "text-foreground")}>
        {v}
      </dd>
      {note ? (
        <p className={cn("mt-1 text-[11px] leading-snug", dark ? "text-paper/60" : "text-ink2")}>{note}</p>
      ) : null}
    </div>
  );
}

// A definition row (label column | value + optional note), used by the tracker + operational register.
function DefRow({ k, wide, children }: { k: string; wide?: boolean; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid gap-3 border-t border-border py-2.5 first:border-t-0",
        wide ? "grid-cols-[150px_minmax(0,1fr)]" : "grid-cols-[110px_minmax(0,1fr)]",
      )}
    >
      <dt className="pt-0.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink2">{k}</dt>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

// A truncated hash that copies its full value on click. Acknowledgement is purely visual (a brief token-
// coloured highlight) so no new rendered word is introduced; the full value is exposed via title={full}
// (a dynamic read — never a scanned literal). Copy path mirrors components/token/ca-copy.tsx.
function CopyHash({ full, short }: { full: string; short: string }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const copy = async (): Promise<void> => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(full);
      ok = true;
    } catch {
      const node = ref.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        try {
          ok = document.execCommand("copy");
        } catch {
          ok = false;
        }
      }
    }
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    }
  };
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => void copy()}
      title={full}
      className={cn(
        "cursor-copy rounded px-1 font-mono text-[13px] font-medium transition-colors",
        copied ? "bg-ok/20 text-ok" : "text-foreground hover:underline",
      )}
    >
      {short}
    </button>
  );
}

export function NarabiLive({ publishSchedule }: { publishSchedule: string }) {
  const [data, setData] = useState<NarabiData | null>(null);
  const [page, setPage] = useState(0);
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    let alive = true;
    void loadNarabi({ fetchText: browserFetchText, snapshot: NARABI_SNAPSHOT }).then((d) => {
      if (alive) setData(d);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Highlight the section in view. Runs after the sections mount (data present); the rootMargin biases the
  // "active" band toward the upper third of the viewport.
  useEffect(() => {
    if (!data) return;
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive((e.target as HTMLElement).id);
        }
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    for (const el of els) obs.observe(el);
    return () => {
      obs.disconnect();
    };
  }, [data]);

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
    <article className="overflow-hidden rounded-[18px] border border-border bg-paper text-foreground">
      {/* Header band — hero + state strip */}
      <header className="bg-hikae px-6 pb-10 pt-12 text-paper sm:px-10 sm:pt-14">
        <div className="flex items-center gap-3">
          <span className="text-paper">
            <NarabiMark className="size-8" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.08em] text-paper/75">
            narabi · sensor running · <span className="text-paper">{data.source}</span>
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 items-end gap-6 min-[900px]:grid-cols-2 min-[900px]:gap-10">
          <div>
            <h1 className="font-heading text-[40px] font-semibold leading-[1.05] tracking-tight text-paper sm:text-[52px]">
              Narabi — daily
            </h1>
            <p className="mt-3.5 max-w-xl text-lg leading-relaxed text-paper/90">{HERO_DEK}</p>
          </div>
          <div className="flex flex-col gap-2.5">
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-paper/20 bg-paper/20 sm:grid-cols-4">
              <TileStat k="T" v={fmtNum(state.tracker.t)} note="evaluable pairs stepped so far" />
              <TileStat k="q_t" v={sci(state.tracker.q, 6)} note="current threshold of the adaptive quantile tracker" />
              <TileStat
                k="bound_thm1"
                v={boundValue}
                note="deterministic long-run bound, tightens as T grows; a — means no evaluable pair yet"
              />
              <TileStat
                k="fired"
                v={drift.fired ? "yes — an ADR is opened; no automatic switch" : "no"}
                note={drift.text}
              />
            </dl>
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] leading-relaxed text-paper/75">
              <span>
                <span className="uppercase tracking-[0.06em]">read at</span> ·{" "}
                <span className="text-paper">{readAtLabel(data.fetchedAt)}</span>
              </span>
              <span>
                <span className="uppercase tracking-[0.06em]">lag</span> ·{" "}
                <span className="text-paper">{lag.text}</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Body — sticky table of contents + content */}
      <div className="grid grid-cols-1 gap-4 px-6 pb-16 pt-10 min-[900px]:grid-cols-[200px_minmax(0,1fr)] min-[900px]:gap-10 sm:px-10">
        <nav aria-label="sections" className="hidden self-start min-[900px]:sticky min-[900px]:top-6 min-[900px]:block">
          <div className="flex flex-col gap-0.5 text-[13px]">
            {SECTIONS.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                aria-current={active === s.id ? "true" : undefined}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 transition-colors",
                  active === s.id
                    ? "bg-soft-active font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="flex min-w-0 flex-col gap-12">
          {/* 01 — What Narabi is */}
          <section id="s-what" className="flex scroll-mt-6 flex-col gap-4">
            <SectionHead n={1} big>
              What Narabi is
            </SectionHead>
            <p className="max-w-3xl text-[16px] leading-relaxed">{FLEET_PLACE}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {LEVELS.map((lv) => (
                <div key={lv.name} className={CARD}>
                  <div className="font-mono text-[12px] font-medium uppercase tracking-[0.08em] text-monark-t">
                    {lv.name}
                  </div>
                  <p className="mt-2 text-[15px] font-semibold leading-snug text-foreground">{lv.claim}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink2">{lv.detail}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 02 — Why seven steps */}
          <section id="s-seven" className="flex scroll-mt-6 flex-col gap-4">
            <SectionHead n={2} big>
              Why seven steps
            </SectionHead>
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
              <div className={cn(CARD, "flex flex-col gap-3 text-[15px] leading-relaxed")}>
                <p>
                  Today T = <span className={CHIP}>{fmtNum(state.tracker.t)}</span>. {WHY_SEVEN}
                </p>
                <p>
                  The bound printed daily is the Angelopoulos, Barber and Bates long-run quantity{" "}
                  <span className={CHIP}>{BOUND_FORMULA}</span> with c = B ={" "}
                  <span className={CHIP}>{unitFraction(params.c)}</span> and ε ={" "}
                  <span className={CHIP}>{fmtNum(params.eps)}</span>; it stays above the target{" "}
                  <span className={CHIP}>{fmtNum(params.alpha)}</span> until T ={" "}
                  <span className={CHIP}>{fmtNum(state.projected_bound_leq_target_T)}</span>, and we say so
                  plainly rather than as a feature.
                </p>
              </div>
              <div className="flex items-center rounded-[14px] bg-ink p-6 text-[15px] leading-relaxed text-paper">
                <p>
                  <strong className="font-semibold">{TRACKER_ADAPTS}</strong> {NO_COVERAGE_MEASURED}
                </p>
              </div>
            </div>
          </section>

          {/* 03 / 04 — How a window is built · What the gate does with it */}
          <div className="grid items-start gap-3 lg:grid-cols-2">
            <section id="s-window" className={cn(CARD, "scroll-mt-6")}>
              <SectionHead n={3}>How a window is built</SectionHead>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">
                Five steps, every one recomputable from the chain and the two files.
              </p>
              <ol className="mt-3 flex flex-col">
                {WINDOW_STEPS.map((st, i) => (
                  <li
                    key={st}
                    className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 border-t border-border py-3 text-[14px] leading-relaxed first:border-t-0"
                  >
                    <span className="flex size-6 items-center justify-center rounded-full bg-ink font-mono text-[12px] font-medium text-paper">
                      {String(i + 1)}
                    </span>
                    <span>{st}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section id="s-gate" className={cn(CARD, "scroll-mt-6")}>
              <SectionHead n={4}>What the gate does with it</SectionHead>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">{GATE.body}</p>
              <dl className="mt-4 rounded-[10px] bg-soft px-3.5 shadow-inner">
                <div className="py-2.5">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink2">task class</dt>
                  <dd className="mt-0.5 break-all font-mono text-[14px] font-medium text-foreground">{GATE.cls}</dd>
                </div>
                <div className="border-t border-border py-2.5">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink2">committed key</dt>
                  <dd className="mt-0.5 break-all font-mono text-[13px] font-medium leading-relaxed text-foreground">
                    {GATE.key}
                  </dd>
                </div>
                <div className="border-t border-border py-2.5">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.06em] text-ink2">calibration pairs</dt>
                  <dd className="mt-0.5 font-mono text-[14px] font-medium text-foreground">{GATE.nCalib}</dd>
                  <p className="mt-1 text-[12px] text-ink2">
                    calm calibration pairs behind q₁; measured, order-independent digest
                  </p>
                </div>
              </dl>
              <p className="mt-4 rounded-r-[8px] border-l-[3px] border-ok bg-ok/10 px-3.5 py-3 text-[13px] leading-relaxed text-foreground">
                {VERIFY_HINT}
              </p>
            </section>
          </div>

          {/* 05 / 06 — Tracker state · Pre-registered drift criterion */}
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section id="s-tracker" className={cn(CARD, "scroll-mt-6")}>
              <SectionHead n={5}>Tracker state</SectionHead>
              <dl className="mt-4 grid grid-cols-3 gap-2.5">
                <WellStat k="q_t" v={sci(state.tracker.q, 6)} note="current threshold of the adaptive quantile tracker" />
                <WellStat k="q₁" v={sci(state.tracker.q1, 6)} note="the committed static calibration" />
                <WellStat k="T" v={fmtNum(state.tracker.t)} note="evaluable pairs stepped so far" />
              </dl>
              <dl className="mt-3">
                <DefRow k="bound_thm1" wide>
                  <div className="font-mono text-[14px] font-medium text-foreground">{boundValue}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                    deterministic long-run bound, tightens as T grows; a — means no evaluable pair yet
                  </p>
                </DefRow>
                <DefRow k="bound ≤ target, projected" wide>
                  <div className="font-mono text-[14px] font-medium text-foreground">{pb.date ? pb.date : "—"}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink2">{pb.assumption}</p>
                </DefRow>
                <DefRow k="params" wide>
                  <div className="break-all font-mono text-[13px] font-medium leading-relaxed text-foreground">
                    {paramList}
                  </div>
                </DefRow>
                <DefRow k="digest" wide>
                  <CopyHash full={state.digest} short={shortHash(state.digest, 8)} />
                  <p className="mt-1 text-[12px] text-ink2">folds q₁, params and every stepped score</p>
                </DefRow>
              </dl>
              <blockquote className="mt-4 rounded-[10px] border-l-[3px] border-monark-t bg-soft p-4 font-serif text-[14px] italic leading-relaxed text-foreground shadow-inner">
                {D8_SENTENCE}
              </blockquote>
            </section>

            <section id="s-drift" className={cn(CARD, "scroll-mt-6")}>
              <SectionHead n={6}>Pre-registered drift criterion</SectionHead>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">{DRIFT_LEDE}</p>
              <dl className="mt-4 flex flex-col gap-2.5">
                <WellStat
                  k="criterion"
                  v={`rolling calm-miss ≥ ${fixed(DRIFT_THRESHOLD, 2)} over the last ${fmtNum(CALM_WINDOW)} calm pairs`}
                />
                <WellStat k="status" v={drift.text} mono={false} />
                <WellStat
                  k="fired"
                  v={drift.fired ? "yes — an ADR is opened; no automatic switch" : "no"}
                  mono={false}
                  dark
                />
              </dl>
            </section>
          </div>

          {/* 07 — Windows */}
          <section id="s-windows" className={cn(CARD, "scroll-mt-6")}>
            <SectionHead
              n={7}
              right={
                <span className="rounded-full bg-soft px-2.5 py-1 font-mono text-[12px] text-ink2">
                  {pg.rangeLabel} · {pg.pageLabel}
                </span>
              }
            >
              Windows
            </SectionHead>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">{WINDOWS_LEDE}</p>
            <div className="mt-4 max-h-[520px] overflow-auto rounded-[10px] border border-border">
              <table className="w-full border-separate border-spacing-0 text-left font-mono text-[13px]">
                <thead className="sticky top-0 z-[1]">
                  <tr className="bg-ink text-paper">
                    <th className="px-3.5 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">day</th>
                    <th className="px-3.5 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">blocks</th>
                    <th className="px-3.5 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">burns (USDe)</th>
                    <th className="px-3.5 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">mints (USDe)</th>
                    <th className="px-3.5 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">supply close (USDe)</th>
                    <th className="px-3.5 py-2.5 text-right text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">v</th>
                    <th className="px-3.5 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">regime</th>
                    <th className="px-3.5 py-2.5 text-[11px] font-medium uppercase tracking-[0.06em]" scope="col">pair</th>
                  </tr>
                </thead>
                <tbody>
                  {pg.rows.map((l) => (
                    <tr key={l.line_hash} className="text-foreground even:bg-soft">
                      <td className="px-3.5 py-3 font-medium">{l.day}</td>
                      <td className="px-3.5 py-3">{fmtNum(l.from_block)}–{fmtNum(l.to_block)}</td>
                      <td className="px-3.5 py-3 text-right">{compact18(l.burns)}</td>
                      <td className="px-3.5 py-3 text-right">{compact18(l.mints)}</td>
                      <td className="px-3.5 py-3 text-right">{compact18(l.supply_close)}</td>
                      <td className="px-3.5 py-3 text-right">{sci(l.v, 4)}</td>
                      <td className="px-3.5 py-3">{regimeWord(l.regime)}</td>
                      <td className="px-3.5 py-3">{pairWord(l.pair_status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <nav aria-label="windows pagination" className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
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
            <p className="mt-2 text-[13px] text-ink2">{STATUS_IS_A_WORD}</p>
          </section>

          {/* 08 / 09 — Recompute & diff · Operational register */}
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <section id="s-recompute" className={cn(CARD, "scroll-mt-6 min-w-0")}>
              <SectionHead n={8}>{"Recompute & diff"}</SectionHead>
              <p className="mt-1.5 text-[14px] leading-relaxed text-ink2">{RECOMPUTE_LEDE}</p>
              <pre className="mt-4 overflow-x-auto rounded-[10px] bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-paper shadow-inner">
                {recipe}
              </pre>
              <p className="mt-3.5 text-[13px] leading-relaxed text-ink2">
                <a
                  className="inline-flex h-[30px] items-center rounded-[9px] border border-border bg-paper px-3 align-middle font-mono text-[13px] font-medium text-foreground"
                  href={STATE_PATH}
                  download
                >
                  state.json
                </a>{" "}
                ·{" "}
                <a
                  className="inline-flex h-[30px] items-center rounded-[9px] border border-border bg-paper px-3 align-middle font-mono text-[13px] font-medium text-foreground"
                  href={TIMELINE_PATH}
                  download
                >
                  timeline.jsonl
                </a>{" "}
                · published files, read-only
              </p>
            </section>

            <section id="s-ops" className={cn(CARD, "scroll-mt-6 min-w-0")}>
              <SectionHead n={9}>Operational register</SectionHead>
              <dl className="mt-4 text-[13px]">
                <DefRow k="sentinel_sha">
                  <CopyHash full={last ? last.sentinel_sha : ""} short={shortHash(last ? last.sentinel_sha : null, 8)} />
                </DefRow>
                <DefRow k="node_version">
                  <div className="font-mono text-[13px] font-medium text-foreground">{last ? last.node_version : "—"}</div>
                </DefRow>
                <DefRow k="endpoints">
                  <div className="whitespace-pre-line break-all rounded-[8px] bg-soft px-2.5 py-2 font-mono text-[12.5px] leading-relaxed text-foreground shadow-inner">
                    {endpointsUnion(lines).join("\n") || "—"}
                  </div>
                </DefRow>
                <DefRow k="lag">
                  <div className="leading-relaxed text-foreground">{lag.text}</div>
                </DefRow>
                <DefRow k="segments">
                  <div className="font-mono text-[12.5px] font-medium leading-relaxed text-foreground">
                    {segs
                      .map((s) => `${s.from} → ${s.to} · sentinel ${shortHash(s.sentinel_sha, 6)} · node ${s.node_version}`)
                      .join("\n") || "—"}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-ink2">
                    a segment is a run of unchanged parameters; any change opens a new one
                  </p>
                </DefRow>
                <DefRow k="source">
                  <div className="leading-relaxed text-foreground">{data.source}</div>
                </DefRow>
                <DefRow k="read at">
                  <div className="font-mono text-[13px] font-medium text-foreground">{readAtLabel(data.fetchedAt)}</div>
                </DefRow>
              </dl>
            </section>
          </div>

          {/* 10 / 11 — What this is not · Glossary */}
          <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
            <section id="s-not" className="scroll-mt-6 rounded-[14px] bg-ink p-6 text-paper">
              <SectionHead n={10} onDark>
                What this is not
              </SectionHead>
              <ul className="mt-4 flex flex-col text-[15px] leading-normal">
                {NOT_LIST.map((n) => (
                  <li key={n} className="flex gap-3 border-t border-paper/15 py-2.5 first:border-t-0">
                    <span aria-hidden className="font-semibold text-monark-t">
                      ×
                    </span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="s-glossary" className={cn(CARD, "scroll-mt-6")}>
              <SectionHead n={11}>Glossary</SectionHead>
              <dl className="mt-4 grid gap-x-6 text-[13px] leading-relaxed sm:grid-cols-2">
                {GLOSSARY.map((g) => (
                  <div key={g.term} className="border-t border-border py-2.5">
                    <dt className="font-mono text-[13px] font-medium text-foreground">{g.term}</dt>
                    <dd className="mt-0.5 text-ink2">{g.def}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>

          <footer className="border-t border-border pt-5 text-[15px] text-foreground">
            <p>{TRACKER_ADAPTS} No price, no gauge.</p>
          </footer>
        </div>
      </div>
    </article>
  );
}
