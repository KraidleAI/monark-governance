import type { Metadata } from "next";
import Link from "next/link";
import { loadAnchors } from "@/lib/bell-anchors-load";
import { AnchorsTable } from "@/components/bell/anchors-table";

export const metadata: Metadata = {
  title: "Bell · anchors · MONARK",
  description:
    "The MONARK Bell anchors register: one line per boundary of the first-measurement run, each manifest and each OpenTimestamps proof served beside it, the status of each line read from its proof file.",
  icons: { icon: [{ url: "/icons/bell.svg", type: "image/svg+xml" }] },
};

// /bell/anchors (ruling Q2, decision 146): the governance register docs/course-bell/ANCHORS.md RENDERED (its real
// lines, synced to public/bell/anchors/anchors.json by scripts/sync-bell-anchors.mjs and pinned to the source by the
// root test bell_anchors_served_register_matches_source), the manifests and proofs served as files, and the status
// of each line READ FROM ITS PROOF at build time. Counts and block heights render from that read (never a literal).
export default function BellAnchorsPage() {
  const view = loadAnchors();
  return (
    <main className="c-main">
      <section className="c-section" id="top">
        <span className="c-label">/bell/anchors · manifests, proofs and the register · one line per boundary of the first-measurement run</span>
        <h1 className="c-h1" style={{ marginTop: 10 }}>Anchors</h1>
        <p className="c-lede" style={{ marginTop: 10 }}>
          At each start, end and resumption of a collection run, a manifest of the run&rsquo;s digests is submitted to a public
          timestamp (OpenTimestamps). The register below is the run&rsquo;s anchors register rendered; each manifest and each
          proof is served next to it. <b>What an anchor shows</b>: that the head of the chain existed before the date of the
          anchor. <b>What it does not show</b>: where the pages came from, nor that the scan was executed.
        </p>
        <p className="c-mono c-small c-muted" style={{ marginTop: 10 }}>
          {view.rows.length} lines in the register · {view.proofs} proof files · {view.withBitcoin} with a Bitcoin block record ·{" "}
          {view.withoutProof} without proof
        </p>
      </section>

      <section className="c-section" id="register" aria-labelledby="l-register">
        <span className="c-label" id="l-register">register · sorted by date · status read from the proof file, not from a node</span>
        <AnchorsTable view={view} />
        <p className="c-muted c-small" style={{ marginTop: 10, maxWidth: "76ch" }}>
          The status is what each proof file contains, read when this page was built: a calendar record names a calendar
          server that holds the commitment; a block record inscribes the height of the Bitcoin block the calendar reports,
          several when several calendars answered; the earliest is shown. None is checked against a Bitcoin node here:
          reading a record is not checking it. The check is yours, with an open client, against a node of your choice.
        </p>
      </section>

      <section className="c-section" id="format" aria-labelledby="l-format">
        <span className="c-label" id="l-format">format of one anchor</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">
              Head manifest <span className="c-mono">{"<boundary>[-<mint>]-manifest.txt"}</span>
            </h2>
            <pre className="c-code">{`one line "<relpath> <sha256hex>" per artefact of the boundary
sorted by <relpath> in byte order · LF line ends
no trailing space · one final LF · lower-case hex digests
<relpath> relative to the root of the run's state`}</pre>
            <dl className="c-kv" style={{ marginTop: 12 }}>
              <dt>boundary</dt>
              <dd>closed set: probe_end · mint_start · mint_resume · mint_end · final</dd>
              <dt>mint</dt>
              <dd>TSLAx · AAPLx · NVDAx · SPYx · n/a</dd>
              <dt>date</dt>
              <dd>ISO date and time in UTC, as measured by the anchoring host</dd>
              <dt>last entry digest</dt>
              <dd>the last line of the instrument&rsquo;s ledger where one exists, else n/a</dd>
              <dt>commit</dt>
              <dd>the git commit adding the line, the manifest and the proof (a private repository; the files are served here)</dd>
            </dl>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Artefacts per boundary</h2>
            <dl className="c-kv">
              <dt>probe_end</dt>
              <dd>budget file, first ledger page of the probe, probe report</dd>
              <dt>mint_start</dt>
              <dd>budget file, ledgers already present (the instrument&rsquo;s own not yet written)</dd>
              <dt>mint_resume</dt>
              <dd>budget file, the instrument&rsquo;s partial ledger</dd>
              <dt>mint_end</dt>
              <dd>the instrument&rsquo;s complete ledger, its cross-check file</dd>
              <dt>final</dt>
              <dd>the four cross-check files, the cross-check report, the budget file</dd>
            </dl>
            <p className="c-note" style={{ marginTop: 14 }}>
              Limit: the anchor shows the <b>anteriority of the chain head at the date of the anchor</b>, not the provenance
              of the pages nor the execution of the scan.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="verify" aria-labelledby="l-verify">
        <span className="c-label" id="l-verify">verification by a third party · five steps</span>
        <div className="c-card">
          <ol className="c-ol">
            <li>Download the line&rsquo;s manifest and its proof from the table above.</li>
            <li>Recompute the SHA-256 of the manifest: it must equal the line&rsquo;s manifest digest.</li>
            <li>Check the proof with the open OpenTimestamps client: it yields a Bitcoin instant <b>before</b> which the manifest existed.</li>
            <li>If the ledger is published (<span className="c-tag c-tag--next">to be published</span>): recompute the digests of the listed artefacts and re-pull one page at random to compare.</li>
            <li>The git commit is a <b>second, weaker witness</b> (server date, same operator). The bound stays: anteriority of the head at the anchor date, not provenance, not execution.</li>
          </ol>
          <p className="c-muted c-small" style={{ marginTop: 12 }}>
            Two witnesses: the push (weak: server date, same operator) and OpenTimestamps (independent: Bitcoin). No
            confirmation delay is quoted here. Method and residuals: <Link href="/bell/method">/bell/method</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}
