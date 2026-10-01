"use client";

// apps/site/components/dojo/dojo-table.tsx -- the table of every line of the snapshot the figures section shows, and the look-up of
// one address among them. First paint (the build): the sentence of a table to come, and nothing under an abstained head. Once the
// view of the figures section has an outcome, lib/dojo-served.ts (dojoTableOf) lists the lines of the head it shows: those its reread
// already bound, else one GET of the committed head's lines file (under the limits of the reader's tool, the module's own) bound to
// its signed values; a refusal lists no line and says so, never its reason. Every cell is rendered by property access, each in its
// own element; every text is read from lib/dojo-copy.ts. The address typed stays in its field: read on the button or on Enter,
// checked by lib/dojo-lookup.ts before any use and searched among the lines already bound; it enters no request, link or kept value,
// and the page never shows it back.
import { useEffect, useRef, useState } from "react";
import { bindDojoLines, boundedSource, type DojoLiveGet, type Sha256 } from "@/lib/dojo-live";
import { dojoTableFirstOf, dojoTableOf, type DojoLiveView, type DojoTable as Table } from "@/lib/dojo-served";
import { dojoLookupOf, type DojoLookup } from "@/lib/dojo-lookup";
import type { DojoServedHead } from "@/lib/dojo-served-load";
import { DOJO_TABLE as W, DOJO_TEXT as T, DOJO_TIER_NAMES } from "@/lib/dojo-copy";

/** The lines shown at first, and added by each press of the button that shows more: a design step, not a measure. */
const STEP = 100;

/** The table of every line of the head the figures section shows, and the look-up of one address among them. */
export function DojoTable({ view, get, sha256 }: { view: DojoLiveView; get: DojoLiveGet; sha256: Sha256 }) {
  const [table, setTable] = useState<Table>(() => dojoTableFirstOf(view));
  const [found, setFound] = useState<DojoLookup | null>(null);
  const [count, setCount] = useState(STEP);
  const typed = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let current = true;
    const bind = (bytes: Uint8Array, head: DojoServedHead) => bindDojoLines(bytes, head, sha256);
    void dojoTableOf(view, { read: boundedSource(get), bind, words: W, tiers: DOJO_TIER_NAMES }).then((t) => {
      if (current) {
        setTable(t);
        setFound(null);
      }
    });
    return () => {
      current = false;
    };
  }, [view, get, sha256]);
  if (table.kind === "none") return null;
  if (table.kind !== "rows") return <p>{table.kind === "wait" ? T.table : T.tableRefused}</p>;
  const bound = table.bound;
  const look = () => {
    setFound(dojoLookupOf(typed.current?.value ?? "", bound));
  };
  const rows = found?.kind === "found" ? [found.row] : table.shown.slice(0, count);
  return (
    <div className="flex flex-col gap-3">
      <p>{T.tableDone}</p>
      <p>{T.tableOrder}</p>
      <p>{T.lookup}</p>
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={typed}
          type="text"
          aria-label={W.address}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded border border-current bg-transparent px-3 py-2 font-mono text-xs"
          onKeyDown={(e) => {
            if (e.key === "Enter") look();
          }}
        />
        <button type="button" className="c-btn c-btn--line" onClick={look}>
          {W.lookUp}
        </button>
      </div>
      {found?.kind === "invalid" ? <p>{T.lookupInvalid}</p> : null}
      {found?.kind === "absent" ? <p>{T.lookupAbsent}</p> : null}
      <div className="overflow-x-auto">
        <table className="c-table">
          <thead>
            <tr>
              {table.columns.map((c) => (
                <th key={c}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.address}>
                {r.cells.map((c, i) => (
                  <td key={i} className="break-all">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {found?.kind === "found" ? (
        <button type="button" className="c-btn c-btn--line self-start" onClick={() => setFound(null)}>
          {W.showAll}
        </button>
      ) : count < table.shown.length ? (
        <button type="button" className="c-btn c-btn--line self-start" onClick={() => setCount(count + STEP)}>
          {W.showMore}
        </button>
      ) : null}
    </div>
  );
}
