import { Placeholder } from "@/components/placeholder";
import { ANCHORS_ROUTE, shortDigest, utcLabel, type AnchorsView } from "@/lib/bell-anchors-load";

// The anchors register table (ruling Q2): one line per boundary of the first-measurement run, read from the served
// register, with each line's status READ FROM ITS PROOF FILE at build time (lib/bell-anchors-load.ts). Block
// heights and counts render from that read, never from a literal (orchestrator ruling (3)). Boundaries not reached
// yet (a started token without its end line, the final anchor) show as hatched upcoming lines with a named
// placeholder for their date. Reading a proof is not verifying it: the reader checks it with an open client.
export function AnchorsTable({ view }: { view: AnchorsView }) {
  return (
    <div className="c-board">
      <div className="c-board-scroll">
        <table className="c-table c-anchors">
          <thead>
            <tr>
              <th className="c-label">date · UTC</th>
              <th className="c-label">boundary</th>
              <th className="c-label">token</th>
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
                <td style={{ whiteSpace: "normal", minWidth: 220 }}>
                  {r.status === null ? (
                    <>
                      <span className="c-abstain">not timestamped</span>
                      <div className="c-small c-muted" style={{ marginTop: 4 }}>
                        {r.sameDigestAsLater !== null
                          ? `the same manifest digest is timestamped on the ${utcLabel(r.sameDigestAsLater)} line`
                          : "no proof file for this line"}
                      </div>
                    </>
                  ) : r.status.bitcoinHeights.length > 0 ? (
                    <>
                      <span className="c-pill c-pill--fact">bitcoin attestation</span>
                      <div className="c-small c-muted" style={{ marginTop: 4 }}>
                        earliest block {r.status.bitcoinHeights[0]} · {r.status.bitcoinHeights.length}{" "}
                        {r.status.bitcoinHeights.length === 1 ? "block record" : "block records"} ·{" "}
                        {r.status.pendingCalendars.length}{" "}
                        {r.status.pendingCalendars.length === 1 ? "calendar record pending" : "calendar records pending"}
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="c-pill c-pill--upcoming">pending</span>
                      <div className="c-small c-muted" style={{ marginTop: 4 }}>
                        {r.status.pendingCalendars.length}{" "}
                        {r.status.pendingCalendars.length === 1 ? "calendar record, no block yet" : "calendar records, no block yet"}
                      </div>
                    </>
                  )}
                </td>
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
                  <span className="c-abstain">run in progress: the line is added when the boundary is reached</span>
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
