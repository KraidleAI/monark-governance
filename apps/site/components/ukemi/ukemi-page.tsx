// apps/site/components/ukemi/ukemi-page.tsx — the /ukemi body (temps 1: method + honest served state).
// SERVER component, STATIC: no "use client", no fetch, no generateMetadata — so `next build` renders a real
// apps/site/.next/server/app/ukemi.html that scripts/assert-fleet-html.mjs asserts on.
//
// HONESTY:
//   - reads ONLY `status` from the fleet register. NEVER `line`/`wiring.note` — the note carries "cascade"
//     (lib/fleet.ts); rendering it would red assertUkemiBody's \bcascade\b=0. No silent
//     fallback: an absent Ukemi row throws, so a broken registry reds the build honestly.
//   - the two SERVED sentences that ride at temps 1 are DIGIT-FREE and rendered each in a SINGLE {X} JSX
//     child (C-1(b)): {LIQ_EMPTY_REGISTRY_SENTENCE} (the honest empty-registry state) and
//     {LIQ_CONDITIONAL_SENTENCE} (carries "which the gate does not check").
//   - the served STATE follows the committed, hashed, dated served-state file (apps/site/data/ukemi-served.json,
//     read through its fail-closed loader, the record / and /fleet read), never the harness source
//     (switch of the class): "empty" => {LIQ_EMPTY_REGISTRY_SENTENCE}; "committed" => {LIQ_COMMITTED_STATE_NOTE}, a
//     digit-free restatement, not the served clause (it carries figures outside the closed list this page may print),
//     then the figures of the committed stratum. assert-fleet-html checks the built page against the same file: the
//     state's sentence present, the other state's absent.
//   - FIGURES, committed branch only: calibration points, bound margin, scores digest and the day they were read,
//     from lib/ukemi-served-figures.ts over the served-state file and the course report (both fail-closed), each
//     rendered by property access in its own element, never typed and never in an attribute. assert-fleet-html checks
//     them against the closed list it reads from the same two files: each exactly once, and no other number.
//   - LIQ_UPPER_BOUND_SENTENCE / LIQ_H3_SENTENCE are NOT imported here (they carry "0" / "H-3"): the root
//     test's negative carrier forbids them in this file, in both states.
//   - every other line is digit-free explanatory prose read from lib/ukemi-copy.ts by property/identifier
//     (never a rendered numeric literal); the schematic upper-bound bar is aria-hidden with NO graduation.
// CHARTER C: charter cards/labels and the fixed Ukemi accent (var(--ukemi)); content unchanged (the mock's SAMPLE values are not ported: a fake value never rides
// on a served page). The site footer carries the four common phrases.
import { join } from "node:path";
import { FLEET_AGENTS } from "@/lib/fleet";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { loadUkemiCourse } from "@/lib/ukemi-course-load";
import { servedFiguresOf } from "@/lib/ukemi-served-figures";
import Link from "next/link";
import {
  HERO_TITLE,
  HERO_DEK,
  WHAT_LABEL,
  IS_LIST,
  IS_NOT_LIST,
  SERVED_LABEL,
  SERVED_STATE_LEAD,
  LIQ_EMPTY_REGISTRY_SENTENCE,
  SERVED_COMMITTED_LEAD,
  LIQ_COMMITTED_STATE_NOTE,
  FIGURES_LEAD,
  FIGURE_POINTS_LABEL,
  FIGURE_MARGIN_LABEL,
  BOUND_UNIT,
  FIGURE_MARGIN_NOTE,
  FIGURE_DIGEST_LABEL,
  DIGEST_NOTE,
  REGION_NOTE,
  CONDITIONAL_LEAD,
  LIQ_CONDITIONAL_SENTENCE,
  COVERAGE_NOTE,
  BAR_UPPER_LABEL,
  BAR_YHAT_LABEL,
  BAR_FLOOR_LABEL,
  STATES_NOTE,
  METHOD_LABEL,
  METHOD_STEPS,
  LIMITS_LABEL,
  LIMITS,
  UKEMI_COURSE_ROUTE,
  COURSE_POINTER_LEAD,
  COURSE_POINTER_LINK,
  COURSE_POINTER_TAIL,
} from "@/lib/ukemi-copy";

const ACCENT = { color: "var(--ukemi)" } as const;

/** No silent fallback: a committed served state without its figures throws (unreachable, servedFiguresOf throws first). */
function missingFigures(): never {
  throw new Error("ukemi-page: the committed served state carries no figures; no silent fallback.");
}

export function UkemiPage() {
  // Single source of the pill: the frozen fleet register (C-6). Read status ONLY; throw if absent.
  const ukemiAgent = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  if (!ukemiAgent) {
    throw new Error(
      "ukemi-page: 'Ukemi' is absent from FLEET_AGENTS (lib/fleet.ts) — the register is the single source of the status pill (C-6); no silent fallback.",
    );
  }
  const status = ukemiAgent.status;
  // The served state of the class, from the committed, hashed, dated served-state file (fail-closed loader).
  const served = loadUkemiServed(join(process.cwd(), "..", ".."));
  // The figures of the committed stratum, from that file and the course report (fail-closed; null while empty).
  const figures = servedFiguresOf(served, loadUkemiCourse(join(process.cwd(), "..", "..")));

  return (
    <main className="c-main" style={{ paddingTop: 32 }}>
      {/* HERO */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="c-label">Ukemi</div>
          <span className="c-pill c-pill--ukemi">{status}</span>
        </div>
        <h1 className="c-h1" style={{ maxWidth: 900 }}>{HERO_TITLE}</h1>
        <p className="c-lede" style={{ fontSize: 17 }}>{HERO_DEK}</p>
      </section>

      {/* IS / IS NOT */}
      <section className="c-section">
        <div className="c-label">{WHAT_LABEL}</div>
        <div className="c-grid c-grid--2" style={{ marginTop: 12 }}>
          <div className="c-card">
            <h2 className="c-h2">What Ukemi is</h2>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {IS_LIST.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-mono" style={ACCENT} aria-hidden="true">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="c-card">
            <h2 className="c-h2">What Ukemi is not</h2>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {IS_NOT_LIST.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-mono text-muted-foreground" aria-hidden="true">
                    x
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WHAT IS SERVED — the synced served state (empty: the served sentence; committed: its digit-free
          restatement), schematic bar, conditional clause */}
      <section className="c-section">
        <div className="c-label">{SERVED_LABEL}</div>
        <div className="c-card" style={{ marginTop: 12, borderColor: "var(--ukemi)" }}>
          {served.registry_state === "empty" ? (
            <>
              <p className="text-sm text-muted-foreground">{SERVED_STATE_LEAD}</p>
              <p className="mt-3 font-mono text-base text-foreground">{LIQ_EMPTY_REGISTRY_SENTENCE}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">{SERVED_COMMITTED_LEAD}</p>
              <p className="mt-3 text-base text-foreground">{LIQ_COMMITTED_STATE_NOTE}</p>
              {figures === null ? (
                missingFigures()
              ) : (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {FIGURES_LEAD} <span className="font-mono">{figures.readDate}</span>:
                  </p>
                  <ul className="mt-2 flex flex-col gap-1 text-sm text-foreground">
                    <li>
                      <span className="font-mono">{figures.points}</span> {FIGURE_POINTS_LABEL}
                    </li>
                    <li>
                      {FIGURE_MARGIN_LABEL} <span className="font-mono">{figures.boundMargin}</span> {BOUND_UNIT}; {FIGURE_MARGIN_NOTE}
                    </li>
                    <li>
                      {FIGURE_DIGEST_LABEL} <span className="c-mono break-all">{figures.digest}</span>
                    </li>
                  </ul>
                  <p className="mt-2 text-sm text-muted-foreground">{DIGEST_NOTE}</p>
                </>
              )}
            </>
          )}
          <p className="text-sm text-muted-foreground" style={{ marginTop: 10 }}>
            {COURSE_POINTER_LEAD} <Link href={UKEMI_COURSE_ROUTE}>{COURSE_POINTER_LINK}</Link>
            {COURSE_POINTER_TAIL}
          </p>

          {/* Schematic upper-bound bar: from an open floor to the upper bound, y-hat marked inside; never a
              gauge, NO numeric graduation. aria-hidden + widths in style => outside the rendered-text scan. */}
          <div className="relative mt-6 h-12" aria-hidden="true">
            <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
            <div
              className="absolute top-4 h-5 rounded-br-sm border-b-2 border-r-2"
              style={{ left: "0", width: "44%", borderColor: "var(--ukemi)" }}
            >
              <span className="absolute -top-4 right-0 font-mono text-[0.65rem]" style={ACCENT}>
                {BAR_UPPER_LABEL}
              </span>
            </div>
            <div className="absolute top-3 h-6 w-px" style={{ left: "22%", background: "var(--ukemi)" }}>
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[0.65rem]" style={ACCENT}>
                {BAR_YHAT_LABEL}
              </span>
            </div>
            <span className="absolute top-7 left-0 whitespace-nowrap font-mono text-[0.65rem] text-muted-foreground">
              {BAR_FLOOR_LABEL}
            </span>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">{REGION_NOTE}</p>
          <p className="mt-4 text-sm text-muted-foreground">{CONDITIONAL_LEAD}</p>
          <p className="mt-2 font-mono text-sm text-foreground">{LIQ_CONDITIONAL_SENTENCE}</p>
        </div>
        <p className="mt-4 max-w-3xl text-sm text-muted-foreground">{STATES_NOTE}</p>
        <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{COVERAGE_NOTE}</p>
      </section>

      {/* METHOD — each step recomputable, ordinal-free (digit-free) */}
      <section className="c-section">
        <div className="c-label">{METHOD_LABEL}</div>
        <div className="c-steps" style={{ marginTop: 12 }}>
          {METHOD_STEPS.map((step) => (
            <div key={step.name}>
              <span className="c-label">{step.name}</span>
              <b>{step.title}</b>
              <span className="c-muted c-small">{step.detail}</span>
            </div>
          ))}
        </div>
      </section>

      {/* DECLARED LIMITS */}
      <section className="c-section">
        <div className="c-label">{LIMITS_LABEL}</div>
        <div className="c-grid c-grid--3" style={{ marginTop: 12 }}>
          {LIMITS.map((limit) => (
            <div key={limit.title} className="c-card">
              <h3 className="c-h3">{limit.title}</h3>
              <p className="c-muted">{limit.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
