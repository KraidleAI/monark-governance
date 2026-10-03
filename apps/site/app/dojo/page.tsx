import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isAbsolute, join } from "node:path";
import { loadDojoServed } from "@/lib/dojo-served-load";
import { dojoPageFiguresOf } from "@/lib/dojo-served";
import { holdSnapshotStatus } from "@/lib/dojo-register";
import { DOJO_NAME, DOJO_TITLE, DOJO_TEXT as T } from "@/lib/dojo-copy";
import { DojoLive } from "@/components/dojo/dojo-live";
import { DojoSentence } from "@/components/dojo/dojo-figures";

// /dojo: the hold snapshot, rendered at build time from the committed, hashed record (lib/dojo-served-load.ts, fail-closed).
// Static server component, static metadata only. Before any served snapshot there is no record, and no page: notFound(). The
// texts are the closed list of lib/dojo-copy.ts. The figures section is the reread component (components/dojo/dojo-live.tsx): its
// first paint is the record's figures, by state (counted without a unit version, counted under one, or abstained), each through
// components/dojo/dojo-figures.tsx, and the sentence of a conditional reread. The pill carries the register's status. Below the table,
// two native folds: how it is counted (the method sentence names the anchor's validation window in days, same component), how to check it.
export const metadata: Metadata = { title: DOJO_TITLE, description: T.lead };

const COUNTED = [T.retro, T.exclusion, T.bounds], CHECK = [T.check, T.tree, T.beacon];

export default function DojoPage() {
  const data = loadDojoServed(recordRootOf());
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
      <DojoLive
        committed={data}
        counted={
          <>
            <p>
              <DojoSentence text={T.method} figures={figures} />
            </p>
            {COUNTED.map((s) => (
              <p key={s}>{s}</p>
            ))}
          </>
        }
      />
      <details className="pt-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer">{T.foldCheck}</summary>
        <div className="mt-3 flex flex-col gap-3">
          {CHECK.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </div>
      </details>
    </main>
  );
}

/** The repository root the record is read under: two levels above the site's working directory while `next build` runs (the committed
 *  record), or, for a local build on a fixture only, the absolute directory MONARK_DOJO_LOCAL_BUILD_ROOT names. Read here, by this server
 *  page, when the build renders it: never in a client file, never set by the production build (test/dojo-render.test.ts); a relative or
 *  empty value throws, so the build reds. Declared last, so that no line above it moves (the killers of the tests name lines of this file). */
function recordRootOf(): string {
  const local = process.env.MONARK_DOJO_LOCAL_BUILD_ROOT;
  if (local === undefined) return join(process.cwd(), "..", "..");
  if (!isAbsolute(local)) throw new Error("dojo page: MONARK_DOJO_LOCAL_BUILD_ROOT must name an absolute directory (fail-closed)");
  return local;
}
