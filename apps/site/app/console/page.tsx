import type { Metadata } from "next";

// Static metadata only (ADR-M004 D15 / honesty lint §6b): no digit in title/description, and NO
// generateMetadata (gate no_generate_metadata_in_apps_site). The console is honestly Upcoming.
export const metadata: Metadata = {
  title: "Proof console — MONARK",
  description:
    "The living proof console: running tests, coverage, and every figure linked to its committed, hashed source. Nothing is shown until it is real.",
};

// Column headers of the Upcoming proof console (MONARK.dc.html consoleCols, L731). These are LABELS
// and provenance notes, never values: every value renders as "—" below. No live data, no literal
// figure — the whole point of the page ("values render from figures-sourced.json … never from a
// literal"). Page-local presentation only; carries zero numeric token.
const consoleCols: readonly { label: string; source: string }[] = [
  { label: "tests", source: "from CI, hashed" },
  { label: "coverage", source: "from CI, hashed" },
  { label: "decisions", source: "from committed fixtures" },
  { label: "B_t epochs", source: "from the gate log" },
];

// /console (server component) — "Proof · console", Upcoming. Renders the design section L390-404 on the
// shell mounted by the layout (header/footer are NOT re-mounted here). Faithful to the mock; honest by
// construction: the columns render "—", and the caption states values come from committed, hashed
// sources, never from a literal.
export default function ConsolePage() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 pt-16 pb-22">
      <div className="flex flex-wrap items-center gap-3">
        <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
          Proof · console
        </div>
        <span className="rounded-full border border-border px-[9px] py-[3px] font-mono text-[11px] text-muted-foreground">
          Upcoming
        </span>
      </div>

      <h1 className="mt-3 mb-4 max-w-[820px] font-heading text-[clamp(34px,4.5vw,56px)] font-semibold tracking-[-0.025em] text-balance">
        Living proof: tests and coverage, as they run.
      </h1>
      <p className="mb-9 max-w-[720px] text-[18px] leading-[1.55] text-muted-foreground">
        When the platform exposes them, this console will render running tests, coverage, and every
        figure on the site linked to its committed, hashed source. Nothing is shown until it is real.
      </p>

      <div className="overflow-hidden rounded-[20px] border border-border bg-card">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] border-b border-border">
          {consoleCols.map((c) => (
            <div key={c.label} className="border-r border-border px-5 py-[18px]">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {c.label}
              </div>
              <div className="font-mono text-[20px] text-muted-foreground">—</div>
              <div className="mt-1.5 text-xs text-muted-foreground">{c.source}</div>
            </div>
          ))}
        </div>
        <div className="px-5 py-12 text-center font-mono text-[13px] leading-[1.7] text-muted-foreground">
          No live data.
          <br />
          Values render from <span className="text-foreground">figures-sourced.json</span> and the
          hashed manifest — never from a literal.
        </div>
      </div>
    </main>
  );
}
