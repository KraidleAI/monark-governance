import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { join } from "node:path";
import { loadDojoServed } from "@/lib/dojo-served-load";
import { dojoPageFiguresOf } from "@/lib/dojo-served";
import { holdSnapshotStatus } from "@/lib/dojo-register";
import { DOJO_NAME, DOJO_TITLE, DOJO_TEXT as T } from "@/lib/dojo-copy";
import { DojoLive } from "@/components/dojo/dojo-live";

// /dojo: the hold snapshot, rendered at build time from the committed, hashed record (lib/dojo-served-load.ts, fail-closed).
// Static server component, static metadata only. Before any served snapshot there is no record, and no page: notFound(). The
// texts are the closed list of lib/dojo-copy.ts. The figures section is the reread component (components/dojo/dojo-live.tsx): its
// first paint is the record's figures, by state (counted without a unit version, counted under one, or abstained), each through
// components/dojo/dojo-figures.tsx, and the sentence of a conditional reread. The pill carries the register's status.
export const metadata: Metadata = { title: DOJO_TITLE, description: T.lead };

const PROSE = [T.method, T.exclusion, T.bounds, T.check, T.tree, T.beacon];

export default function DojoPage() {
  const data = loadDojoServed(join(process.cwd(), "..", ".."));
  const figures = dojoPageFiguresOf(data);
  if (data === null || figures.state === "E0") notFound();
  const status = holdSnapshotStatus();
  return (
    <main className="c-main" style={{ paddingTop: 32 }}>
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="c-label">{DOJO_NAME}</div>
          <span className={status === "built" ? "c-pill c-pill--built" : "c-pill c-pill--upcoming"}>{status}</span>
        </div>
        <h1 className="c-h1">{DOJO_TITLE}</h1>
        <p className="c-lede">{T.lead}</p>
      </section>
      <DojoLive committed={data} />
      <section className="c-section flex flex-col gap-3 text-sm text-muted-foreground">
        {PROSE.map((s) => (
          <p key={s}>{s}</p>
        ))}
      </section>
    </main>
  );
}
