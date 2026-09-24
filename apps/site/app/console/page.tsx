import type { Metadata } from "next";
import { basename } from "node:path";
import {
  harnessRepoRoot, loadHarnessServed, loadByoTrace, loadH5Trace, HARNESS_SERVED_REL, BYO_TRACE_REL, H5_TRACE_REL,
} from "@/lib/harness-served-load";

// Static metadata only (honesty lint §6b): no digit in title/description, and NO
// generateMetadata (gate no_generate_metadata_in_apps_site). The console is honestly Upcoming.
export const metadata: Metadata = {
  title: "Proof console — MONARK",
  description:
    "The living proof console: running tests, coverage, and every figure linked to its committed, hashed source. Nothing is shown until it is real.",
};

// /console (server component) — "Proof · console". The "Upcoming" pill is this PAGE's own status, not a register word:
// lib/fleet.ts registers agents and products and carries no entry for the console, so the pill is written here, and it
// under-declares (nothing on the page is live). Two columns carry committed, hashed values, read through
// lib/harness-served-load.ts (each file checked against the site manifest, fail-closed): the gate decisions recorded
// over the MCP transport of an in-process server (the two traces under fixtures/), each shown with the served clause of
// its class — the bring-your-own decision with the served BYO clause, and a recorded class the snapshot does not serve
// fails the build — and the harness deploy check (apps/site/data/harness-served.json). Tests and coverage render "—":
// no hashed CI summary is committed or served yet. The served gate keeps no state and no log, so no budget column is
// promised. Every value is a property read, never a literal.
export default function ConsolePage() {
  const root = harnessRepoRoot();
  const served = loadHarnessServed(root);
  const byo = loadByoTrace(root);
  const h5 = loadH5Trace(root);
  const clauseOf = (taskClass: string): string => {
    const c = served.classes.find((x) => x.class_id === taskClass);
    if (c === undefined) throw new Error("console: the class of a recorded decision is not a served class (fail-closed)");
    return c.clauses.join("; ");
  };
  const rows = [...h5.decisions.map((d) => ({ d, clause: clauseOf(d.task_class) })), { d: byo.decision, clause: served.byo_clause }];
  const check = served.deploy_check;
  const cols: readonly { label: string; value: string; source: string }[] = [
    { label: "tests", value: "—", source: "from CI, hashed — not published yet" },
    { label: "coverage", value: "—", source: "from CI, hashed — not published yet" },
    { label: "decisions", value: String(rows.length), source: `recorded over the MCP transport of an in-process server on ${h5.bind}, committed fixtures` },
    { label: "deploy checks", value: `${String(check.ok_count)}/${String(check.count)}`, source: `harness deploy check, ${check.checked_at}` },
  ];
  const sources = [HARNESS_SERVED_REL, H5_TRACE_REL, BYO_TRACE_REL].map((rel) => basename(rel));

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
          {cols.map((c) => (
            <div key={c.label} className="border-r border-border px-5 py-[18px]">
              <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
                {c.label}
              </div>
              <div className="font-mono text-[20px] text-muted-foreground">{c.value}</div>
              <div className="mt-1.5 text-xs text-muted-foreground">{c.source}</div>
            </div>
          ))}
        </div>
        <ul className="m-0 flex flex-col gap-1 border-b border-border px-5 py-5 font-mono text-[12.5px] leading-[1.6]">
          {rows.map(({ d, clause }) => (
            <li key={d.step}>
              <span className="text-muted-foreground">{d.step}</span> · {d.op} {d.tool} → {d.action} · {d.reason}
              <span className="text-muted-foreground"> — {clause}</span>
            </li>
          ))}
        </ul>
        <div className="px-5 py-10 text-center font-mono text-[13px] leading-[1.7] text-muted-foreground">
          No live data: recorded values only.
          <br />
          Values render from <span className="text-foreground">{sources.join(", ")}</span>, each checked against the
          hashed manifest at build time — never from a literal.
        </div>
      </div>
    </main>
  );
}
