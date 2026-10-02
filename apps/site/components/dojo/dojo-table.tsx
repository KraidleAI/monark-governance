"use client";

// apps/site/components/dojo/dojo-table.tsx -- the table of the lines of the snapshot the figures section shows, and the look-up of
// one address among them. First paint (the build): the sentence of a table to come, and nothing under an abstained head. Once the
// view of the figures section has an outcome, lib/dojo-served.ts (dojoTableOf) binds the lines of the head it shows: those its reread
// already bound, else one GET of the committed head's lines file (under the limits of the reader's tool, the module's own) bound to
// its signed values; a refusal lists no line and says so, never its reason. Under a unit version in force, a line whose day value is
// under its dust threshold is bound and searched, never listed; without one, every line is listed and a sentence says what the first
// version changes. Every cell is rendered by property access, each in its own element; every text is read from lib/dojo-copy.ts. The address
// typed stays in its field: read on the button or on Enter, checked by lib/dojo-lookup.ts before any use and searched among the lines
// already bound; it enters no request, link or kept value, and the page never shows it back. DojoTable holds the state and the
// effect; DojoTableBody renders one state with no hook of its own, so that a server render shows each state as the browser does.
import { useEffect, useRef, useState, type RefObject } from "react";
import { bindDojoLines, boundedSource, type DojoLiveGet, type Sha256 } from "@/lib/dojo-live";
import { dojoTableFirstOf, dojoTableOf, type DojoLiveView, type DojoTable as Table } from "@/lib/dojo-served";
import { dojoTableLookupOf, type DojoLookup } from "@/lib/dojo-lookup";
import type { DojoServedHead } from "@/lib/dojo-served-load";
import { DOJO_TABLE as W, DOJO_TEXT as T, DOJO_TIER_NAMES } from "@/lib/dojo-copy";

/** The lines shown at first, and added by each press of the button that shows more: a design step, not a measure. */
const STEP = 100;

/** The table of the lines of the head the figures section shows, and the look-up of one address among them. */
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
  const look = () => {
    setFound(dojoTableLookupOf(typed.current?.value ?? "", table));
  };
  const more = () => setCount(count + STEP);
  return <DojoTableBody table={table} found={found} count={count} typed={typed} look={look} all={() => setFound(null)} more={more} />;
}

/** The props of one state of the table: the table, the outcome of the last look-up, the lines shown so far, the field and the actions. */
export interface DojoTableBodyProps {
  table: Table;
  found: DojoLookup | null;
  count: number;
  typed: RefObject<HTMLInputElement | null>;
  look: () => void;
  all: () => void;
  more: () => void;
}

/** One state of the table: nothing under an abstained head; the sentence of a table to come, or of a refusal; a file without a line,
 *  its first sentence alone; else the lines listed, by slices of STEP (or the line looked up), with the sentences of its state, the
 *  outcome of a look-up said in a status region. */
export function DojoTableBody({ table, found, count, typed, look, all, more }: DojoTableBodyProps) {
  if (table.kind === "none") return null;
  if (table.kind !== "rows") return <p>{table.kind === "wait" ? T.table : T.tableRefused}</p>;
  if (table.bound.length === 0) return <p>{T.tableDone}</p>;
  const rows = found?.kind === "found" ? [found.row] : table.shown.slice(0, count);
  return (
    <div className="flex flex-col gap-3">
      <p>{T.tableDone}</p>
      <p>{table.versioned ? T.tableDust : T.tableNoVersion}</p>
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
      {found?.kind === "invalid" ? <p role="status">{T.lookupInvalid}</p> : null}
      {found?.kind === "absent" ? <p role="status">{T.lookupAbsent}</p> : null}
      {found?.kind === "found" && !found.row.listed ? <p role="status">{T.lookupDust}</p> : null}
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
        <button type="button" className="c-btn c-btn--line self-start" onClick={all}>
          {W.showAll}
        </button>
      ) : count < table.shown.length ? (
        <button type="button" className="c-btn c-btn--line self-start" onClick={more}>
          {W.showMore}
        </button>
      ) : null}
    </div>
  );
}
