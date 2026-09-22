// apps/site/components/ukemi/ukemi-page.tsx — the /ukemi body (temps 1: method + honest served state).
// SERVER component, STATIC: no "use client", no fetch, no generateMetadata — so `next build` renders a real
// apps/site/.next/server/app/ukemi.html that scripts/assert-fleet-html.mjs asserts on (CA-11, G0 §18/B).
//
// HONESTY (G0 §5/§6/§7, checkpoint-1 C-1/C-6):
//   - reads ONLY `status` from the fleet register (D-51/C-6). NEVER `line`/`wiring.note` — both carry
//     "cascade" (fleet.ts:155-166); rendering them would red assertUkemiBody's \bcascade\b=0. No silent
//     fallback: an absent Ukemi row throws, so a broken registry reds the build honestly.
//   - the two SERVED sentences that ride at temps 1 are DIGIT-FREE and rendered each in a SINGLE {X} JSX
//     child (C-1(b)): {LIQ_EMPTY_REGISTRY_SENTENCE} (the honest empty-registry state) and
//     {LIQ_CONDITIONAL_SENTENCE} (carries "which the gate does not check").
//   - LIQ_UPPER_BOUND_SENTENCE / LIQ_H3_SENTENCE are NOT imported here (they carry "0" / "H-3"): the root
//     test's negative carrier forbids them in this file. They ride at U-4b-2b.
//   - every other line is digit-free explanatory prose read from lib/ukemi-copy.ts by property/identifier
//     (never a rendered numeric literal); the schematic upper-bound bar is aria-hidden with NO graduation.
import { FLEET_AGENTS } from "@/lib/fleet";
import {
  HERO_TITLE,
  HERO_DEK,
  WHAT_LABEL,
  IS_LIST,
  IS_NOT_LIST,
  SERVED_LABEL,
  SERVED_STATE_LEAD,
  LIQ_EMPTY_REGISTRY_SENTENCE,
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
} from "@/lib/ukemi-copy";

const sectionLabel = "font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground";
const cardClass = "rounded-xl border border-border bg-card p-5";

export function UkemiPage() {
  // Single source of the pill: the frozen fleet register (C-6). Read status ONLY; throw if absent.
  const ukemiAgent = FLEET_AGENTS.find((a) => a.name === "Ukemi");
  if (!ukemiAgent) {
    throw new Error(
      "ukemi-page: 'Ukemi' is absent from FLEET_AGENTS (lib/fleet.ts) — the register is the single source of the status pill (C-6); no silent fallback.",
    );
  }
  const status = ukemiAgent.status;

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      {/* HERO */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className={sectionLabel}>Ukemi</div>
          <span className="rounded-full border border-accent/50 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {status}
          </span>
        </div>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground">
          {HERO_TITLE}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">{HERO_DEK}</p>
      </section>

      {/* IS / IS NOT */}
      <section className="mt-16">
        <div className={sectionLabel}>{WHAT_LABEL}</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className={cardClass}>
            <h2 className="mb-3 font-heading text-xl font-medium tracking-tight text-foreground">
              What Ukemi is
            </h2>
            <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
              {IS_LIST.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="font-mono text-accent" aria-hidden="true">
                    +
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className={cardClass}>
            <h2 className="mb-3 font-heading text-xl font-medium tracking-tight text-foreground">
              What Ukemi is not
            </h2>
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

      {/* WHAT IS SERVED — honest empty-registry state (temps 1), schematic bar, conditional clause */}
      <section className="mt-16">
        <div className={sectionLabel}>{SERVED_LABEL}</div>
        <div className={`${cardClass} mt-4 border-accent/60`}>
            <p className="text-sm text-muted-foreground">{SERVED_STATE_LEAD}</p>
            <p className="mt-3 font-mono text-base text-foreground">{LIQ_EMPTY_REGISTRY_SENTENCE}</p>

            {/* Schematic upper-bound bar: from an open floor to the upper bound, y-hat marked inside; never a
                gauge, NO numeric graduation. aria-hidden + widths in style => outside the rendered-text scan. */}
            <div className="relative mt-6 h-12" aria-hidden="true">
              <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
              <div
                className="absolute top-4 h-5 rounded-br-sm border-b-2 border-r-2 border-accent"
                style={{ left: "0", width: "44%" }}
              >
                <span className="absolute -top-4 right-0 font-mono text-[0.65rem] text-accent">
                  {BAR_UPPER_LABEL}
                </span>
              </div>
              <div className="absolute top-3 h-6 w-px bg-accent" style={{ left: "22%" }}>
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 font-mono text-[0.65rem] text-accent">
                  {BAR_YHAT_LABEL}
                </span>
              </div>
              <span className="absolute top-6 left-0 font-mono text-[0.65rem] text-muted-foreground">
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
      <section className="mt-16">
        <div className={sectionLabel}>{METHOD_LABEL}</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {METHOD_STEPS.map((step) => (
            <div key={step.name} className={cardClass}>
              <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
                {step.name}
              </div>
              <div className="mt-1 font-heading text-base font-medium text-foreground">{step.title}</div>
              <p className="mt-2 text-sm text-muted-foreground">{step.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DECLARED LIMITS */}
      <section className="mt-16">
        <div className={sectionLabel}>{LIMITS_LABEL}</div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {LIMITS.map((limit) => (
            <div key={limit.title} className={cardClass}>
              <h3 className="mb-2 font-heading text-base font-medium text-foreground">{limit.title}</h3>
              <p className="text-sm text-muted-foreground">{limit.detail}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
