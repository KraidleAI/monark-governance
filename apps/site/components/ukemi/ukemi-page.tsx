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
// CHARTER C (decision 145, lot SITE-CHARTE-C): charter cards/labels and the fixed Ukemi accent (var(--ukemi),
// decision 120); content unchanged (the mock's SAMPLE values are not ported: fake values, and digits, never ride
// on a served page). The site footer carries the four common phrases (ruling Q5).
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

const ACCENT = { color: "var(--ukemi)" } as const;

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

      {/* WHAT IS SERVED — honest empty-registry state (temps 1), schematic bar, conditional clause */}
      <section className="c-section">
        <div className="c-label">{SERVED_LABEL}</div>
        <div className="c-card" style={{ marginTop: 12, borderColor: "var(--ukemi)" }}>
          <p className="text-sm text-muted-foreground">{SERVED_STATE_LEAD}</p>
          <p className="mt-3 font-mono text-base text-foreground">{LIQ_EMPTY_REGISTRY_SENTENCE}</p>

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
