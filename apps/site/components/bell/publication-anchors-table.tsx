import { AnchorStatusCell } from "@/components/bell/anchors-table";
import { ANCHORS_ROUTE, shortDigest, utcLabel, type PublicationsView } from "@/lib/bell-anchors-load";

// The anchors table of the published records: one row per timestamped line of the timeline, read from the publications register served
// under /bell/anchors, each row bound at build time to its manifest and proof and to the chain the site data walked
// (lib/bell-publications-load.ts), its status READ FROM ITS PROOF FILE (the status cell of the course table, shared). Digests, lines and
// dates render from the register, never from a literal. Reading a proof is not checking it: the reader checks it with an open client.
const HEADS = ["date · UTC", "line", "kind", "line hash", "timeline up to the line", "manifest digest", "commit", "manifest · proof", "timestamp status · read from the proof"];

export function PublicationAnchorsTable({ view }: { view: PublicationsView }) {
  const digest = (hex: string) => <span title={hex}>{shortDigest(hex)}</span>;
  return (
    <div className="c-board">
      <div className="c-board-scroll">
        <table className="c-table c-anchors">
          <thead>
            <tr>
              {HEADS.map((h) => (
                <th key={h} className="c-label">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.rows.map((r) => (
              <tr key={`${r.date_utc}-${String(r.seq)}-${r.commit}`}>
                <td>{utcLabel(r.date_utc)}</td>
                <td>{r.seq}</td>
                <td>{r.kind}</td>
                <td>{digest(r.line_hash)}</td>
                <td>{digest(r.prefix_sha256)}</td>
                <td>{digest(r.manifest_sha256)}</td>
                <td>{r.commit}</td>
                <td>
                  {r.manifest_file !== null && r.proof_file !== null ? (
                    <>
                      <a href={`${ANCHORS_ROUTE}/${r.manifest_file}`} download>manifest</a> · <a href={`${ANCHORS_ROUTE}/${r.proof_file}`} download>proof</a>
                    </>
                  ) : (
                    <span className="c-muted">none</span>
                  )}
                </td>
                <AnchorStatusCell status={r.status} noProof="no proof file for this line" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
