import { Placeholder } from "@/components/placeholder";
import { ANCHORS_ROUTE, shortDigest, utcLabel, type AnchorsView } from "@/lib/bell-anchors-load";
import type { AnchorStatus } from "@/lib/bell-anchors";

// The anchors register table: one line per boundary of the counter-verification run of the multiplier history, read
// from the served register, with each line's status READ FROM ITS PROOF FILE at build time (lib/bell-anchors-load.ts).
// Block heights and counts render from that read, never from a literal. Boundaries without a line (a started
// instrument without its end line, the final anchor) show as hatched lines with a named placeholder for their date;
// the wording states what the register holds, never an activity it cannot show. Reading a proof is not verifying it:
// the reader checks it with an open client. The status cell is shared with the table of the published records.
export function AnchorsTable({ view }: { view: AnchorsView }) {
  return (
    <div className="c-board">
      <div className="c-board-scroll">
        <table className="c-table c-anchors">
          <thead>
            <tr>
              <th className="c-label">date · UTC</th>
              <th className="c-label">boundary</th>
              <th className="c-label">instrument</th>
              <th className="c-label">manifest digest</th>
              <th className="c-label">last entry digest</th>
              <th className="c-label">commit</th>
              <th className="c-label">manifest · proof</th>
              <th className="c-label">timestamp status · read from the proof</th>
            </tr>
          </thead>
          <tbody>
            {view.rows.map((r) => (
              <tr key={`${r.date_utc}-${r.commit}`}>
                <td>{utcLabel(r.date_utc)}</td>
                <td>{r.boundary}</td>
                <td className={r.mint === null ? "c-muted" : undefined}>{r.mint ?? "n/a"}</td>
                <td>
                  <span title={r.manifest_sha256}>{shortDigest(r.manifest_sha256)}</span>
                </td>
                <td className={r.entry_sha256 === null ? "c-muted" : undefined}>
                  {r.entry_sha256 === null ? "n/a" : <span title={r.entry_sha256}>{shortDigest(r.entry_sha256)}</span>}
                </td>
                <td>{r.commit}</td>
                <td>
                  {r.manifest_file !== null && r.proof_file !== null ? (
                    <>
                      <a href={`${ANCHORS_ROUTE}/${r.manifest_file}`} download>
                        manifest
                      </a>{" "}
                      ·{" "}
                      <a href={`${ANCHORS_ROUTE}/${r.proof_file}`} download>
                        proof
                      </a>
                    </>
                  ) : (
                    <span className="c-muted">none</span>
                  )}
                </td>
                <AnchorStatusCell
                  status={r.status}
                  noProof={r.sameDigestAsLater !== null ? `the same manifest digest is timestamped on the ${utcLabel(r.sameDigestAsLater)} line` : "no proof file for this line"}
                />
              </tr>
            ))}
            {view.openMints.map((m) => (
              <tr key={`open-${m}`} className="c-hatch">
                <td>
                  <Placeholder name={`date_mint_end_${m}`} />
                </td>
                <td>mint_end</td>
                <td>{m}</td>
                <td colSpan={5}>
                  <span className="c-abstain">no end line in the register yet</span>
                </td>
              </tr>
            ))}
            {view.hasFinal ? null : (
              <tr className="c-hatch">
                <td>
                  <Placeholder name="date_final_anchor" />
                </td>
                <td>final</td>
                <td className="c-muted">n/a</td>
                <td colSpan={5}>
                  <span className="c-abstain">upcoming: the final manifest of the run, anchored at its end</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** A line's timestamp status as its proof file records it (read when the page was built, never checked against a node); `noProof` is
 *  said under "not timestamped". Shared by the two anchors tables, the course's wording kept word for word. */
export function AnchorStatusCell({ status, noProof }: { status: AnchorStatus | null; noProof: string }) {
  const cal = status?.pendingCalendars.length ?? 0, blocks = status?.bitcoinHeights.length ?? 0;
  return (
    <td style={{ whiteSpace: "normal", minWidth: 220 }}>
      {status === null ? (
        <>
          <span className="c-abstain">not timestamped</span>
          <div className="c-small c-muted" style={{ marginTop: 4 }}>{noProof}</div>
        </>
      ) : blocks > 0 ? (
        <>
          <span className="c-pill c-pill--fact">bitcoin attestation</span>
          <div className="c-small c-muted" style={{ marginTop: 4 }}>
            earliest block {status.bitcoinHeights[0]} · {blocks} {blocks === 1 ? "block record" : "block records"} · {cal}{" "}
            {cal === 1 ? "calendar record pending" : "calendar records pending"}
          </div>
        </>
      ) : (
        <>
          <span className="c-pill c-pill--upcoming">pending</span>
          <div className="c-small c-muted" style={{ marginTop: 4 }}>
            {cal} {cal === 1 ? "calendar record, no block yet" : "calendar records, no block yet"}
          </div>
        </>
      )}
    </td>
  );
}
