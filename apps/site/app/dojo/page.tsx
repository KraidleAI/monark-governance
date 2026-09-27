import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { join } from "node:path";
import { loadDojoServed } from "@/lib/dojo-served-load";
import { dojoPageFiguresOf } from "@/lib/dojo-served";
import { holdSnapshotStatus } from "@/lib/dojo-register";
import { DOJO_NAME, DOJO_TITLE, DOJO_TEXT as T } from "@/lib/dojo-copy";
import { DojoSentence } from "@/components/dojo/dojo-figures";

// /dojo: the hold snapshot, rendered at build time from the committed, hashed record (lib/dojo-served-load.ts, fail-closed).
// Static server component, static metadata only. Before any served snapshot there is no record, and no page: notFound(). The
// texts are the closed list of lib/dojo-copy.ts, chosen by the state of the record (counted without a unit version, counted
// under one, or abstained); every figure goes through components/dojo/dojo-figures.tsx. The pill carries the register's status.
export const metadata: Metadata = { title: DOJO_TITLE, description: T.lead };

const PROSE = [T.method, T.exclusion, T.bounds, T.check, T.tree, T.beacon];

export default function DojoPage() {
  const data = loadDojoServed(join(process.cwd(), "..", ".."));
  const figures = dojoPageFiguresOf(data);
  if (data === null || figures.state === "E0") notFound();
  const versioned = data.head.price_version !== null;
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
      <section className="c-section flex flex-col gap-3 text-sm text-foreground">
        <p className="text-base">
          <DojoSentence text={figures.state === "EA" ? T.abstained : T.counted} figures={figures} />
        </p>
        {figures.state === "EA" ? null : (
          <p>
            <DojoSentence text={T.totals} figures={figures} />
          </p>
        )}
        {figures.state === "E2" ? (
          <p>
            <DojoSentence text={figures.holders_count === "1" ? T.holder : T.holders} figures={figures} />
          </p>
        ) : null}
        <p>{versioned ? <DojoSentence text={T.tiers} figures={figures} /> : T.noVersion}</p>
        {figures.state === "E2" ? <p>{T.tier}</p> : null}
      </section>
      <section className="c-section flex flex-col gap-3 text-sm text-muted-foreground">
        {PROSE.map((s) => (
          <p key={s}>{s}</p>
        ))}
      </section>
    </main>
  );
}
