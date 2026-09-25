import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS } from "@/lib/fleet";
import { BELL_SESSION_BOUNDS_ET, BELL_RESIDUAL_CODES_LISTED, BELL_PUBLIC_REPO_URL } from "@/lib/bell-method";
import { loadBellServed, bellServedRepoRoot, BELL_HOST, BELL_TIMELINE_PATH, BELL_PUBKEY_PATH, BELL_STATE_PATH, BELL_PROVENANCE_PATH } from "@/lib/bell-served-load";
import { loadAnchors, loadPublications, ANCHORS_ROUTE } from "@/lib/bell-anchors-load";
import { publicationAnchorState, publicationAnchorSentence } from "@/lib/bell-anchors";
import { DocHeader, StatusPill, Toc, DocSection, Figure, Callout, JsonBlock, Cite, RefList, PrevNext } from "@/components/docs/doc-kit";
import { BellDaySchema, BellPipelineSchema, CashLegSchema, BellChainSchema } from "@/components/docs/schemas/bell";

// /docs/bell (server component). MONARK Bell's status, function, wiring and served note are read from the fleet register;
// the session bounds from lib/bell-method.ts (pinned to the collector by a root test); every served fact (the lines, the key,
// the runs of the latest record, their sessions and residuals) from the committed, hashed copy of what the Bell host serves
// (apps/site/data/bell-served.json, fail-closed loader); the anchors from the served anchors register, and the latest record's timestamp
// state from the bound publication rows, in the one wording /bell renders (publicationAnchorSentence). No value is typed.
export const metadata: Metadata = {
  title: "MONARK Bell · Docs · MONARK",
  description:
    "MONARK Bell: a public, signed, hash-chained record of how tokenized equities trade while their market is closed. The day session by session, the gap and the cash leg, residuals, the chain, the key and a real record read from the host.",
};

export default function DocsBellPage() {
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (bell === undefined || bell.status !== "built") throw new Error("docs bell: MONARK Bell is not a built application of the register (fail-closed)");
  const served = loadBellServed(bellServedRepoRoot(), BELL_RESIDUAL_CODES_LISTED);
  const anchors = loadAnchors();
  const head = served.head;
  const runs = head.runs;
  const sessions = runs.flatMap((r) => r.sessions);
  const withGap = sessions.filter((s) => s.gT !== null);
  const symbols = [...new Set(runs.flatMap((r) => r.records.map((x) => x.symbol)))];
  const key = served.keyring.keys.find((k) => k.key_id === head.key_id);
  const anchorState = publicationAnchorState(served.head, served.lines, loadPublications(served.lines).bound);
  const firstRun = runs[0];
  const firstSession = firstRun?.sessions[0];
  // The example row without its on-chain price and volume: the documentation prints no market value (the Bell page prints them).
  const shownSession = firstSession === undefined ? undefined : Object.fromEntries(Object.entries(firstSession as unknown as Record<string, unknown>).filter(([k]) => k !== "vwap" && k !== "volumeBase"));
  const toc = [
    { id: "what", label: "What Bell is" },
    { id: "why", label: "Why off hours" },
    { id: "day", label: "The day, session by session" },
    { id: "pipeline", label: "From fills to a signed line" },
    { id: "gap", label: "The gap and the cash leg" },
    { id: "residuals", label: "Residuals, halts, the multiplier" },
    { id: "chain", label: "The chain, the key, the anchors" },
    { id: "record", label: "A real record" },
    { id: "not", label: "What Bell does not do" },
    { id: "sources", label: "Sources" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · applications · MONARK Bell" title="A signed record of tokenized equities, off hours." pill={<StatusPill status={bell.status} />}>
        <p>{bell.fn}</p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="what" title="What Bell is">
        <p>
          MONARK Bell is an application of the engine, on its DeFi side: {bell.segment}. It connects to {bell.connects}, and
          it publishes from its own host, <a href={BELL_HOST}>{BELL_HOST}</a>. The
          register&rsquo;s served note: <em>{bell.served.note}</em>.
        </p>
        <p>
          The latest signed record, line {head.seq} of the timeline, was published at {head.published_at} and covers{" "}
          {symbols.length} instruments: {symbols.join(", ")}. The timeline holds {served.timeline.lines} lines, as read from
          the host at {served.read_at}.
        </p>
      </DocSection>

      <DocSection id="why" title="Why off hours">
        <p>
          A token that tracks a U.S. equity trades on a public ledger at every hour, while the market of the equity it tracks opens on
          a calendar. Between two closes, the token keeps moving and the reference price does not. Empirical work on tokenized stocks
          measures how far and how often the token strays from the last close overnight and over the weekend (<Cite refId="cong-tokenized" />
          ). Bell does not predict that gap. It keeps a public record of it, session by session, that anyone can recompute, and it
          names every case where it cannot compute one.
        </p>
      </DocSection>

      <DocSection id="day" title="The day, session by session">
        <p>
          Bell classifies every fill by its New York wall-clock date and minute, with daylight saving applied per date, into the
          sessions of one trading day. An off-hours instant belongs to the gap that begins on the most recent trading day; the regime
          of that gap is read by walking forward to the next trading day.
        </p>
        <Figure caption={<>The sessions of one trading day. The bounds are the collector&rsquo;s own constants, read by this page from the method definitions a root test pins to the collector.</>}>
          <BellDaySchema bounds={BELL_SESSION_BOUNDS_ET} />
        </Figure>
      </DocSection>

      <DocSection id="pipeline" title="From fills to a signed line">
        <p>
          A fill is one swap in one declared pool, read from the ledger and counted once per transaction signature, so a route through
          an aggregator appears once. The list of fills must agree on two distinct operators, and a deterministic sample of them is
          cross-read on both; the publisher refuses a record that fails its closed checks; the host signs each line and chains it to
          the one before.
        </p>
        <Figure caption={<>From fills to a signed line. The words of the first three boxes are MONARK Bell&rsquo;s wiring in the fleet register.</>}>
          <BellPipelineSchema sensor={bell.wiring.sensor} gate={bell.wiring.gate} act={bell.wiring.act} />
        </Figure>
      </DocSection>

      <DocSection id="gap" title="The gap and the cash leg">
        <p>
          The gap of a session compares the price per share of the token&rsquo;s fills, volume-weighted, with the reference close of
          the day the session is keyed to. Before a gap is computed, the close is read twice, from two sources, and the two readings
          must agree as integers at a fixed scale.
        </p>
        <Figure caption={<>The cash leg: two readings of the close, compared before any gap. A disagreement abstains; it is never averaged away.</>}>
          <CashLegSchema />
        </Figure>
        <p>
          In the latest record, a gap is computed for {withGap.length} of its {sessions.length} session rows. Each
          row below is read from the served state:
        </p>
        <div className="d-tablewrap">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">instrument</th>
                <th className="c-label">session</th>
                <th className="c-label">fills</th>
                <th className="c-label">cash leg</th>
                <th className="c-label">gap g</th>
                <th className="c-label">abstention</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={`${s.symbol}-${s.session}-${s.regime ?? ""}`}>
                  <td className="c-mono">{s.symbol}</td>
                  <td className="c-mono">{s.regime ?? s.session}</td>
                  <td className="c-mono">{s.n}</td>
                  <td className="c-mono">{s.cash_cross ?? "none"}</td>
                  <td className="c-mono">{s.gT ?? "none"}</td>
                  <td className="c-mono">{s.abstain ?? "none"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DocSection>

      <DocSection id="residuals" title="Residuals, halts, the multiplier">
        <p>
          A residual is a named reason the collector could not produce a clean fact. The list is closed, every code is counted in the
          state file, and a session carries its codes next to the number they qualify. The codes counted above zero in the latest
          record, per instrument:
        </p>
        <dl className="d-kv">
          {runs.map((r) => {
            const nonzero = Object.entries(r.residuals).filter(([, n]) => n > 0);
            return (
              <div key={r.bell_sha} style={{ display: "contents" }}>
                <dt>{r.records.map((x) => x.symbol).join(", ")}</dt>
                <dd className="c-mono">
                  {nonzero.length === 0 ? "none" : nonzero.map(([code, n]) => `${code} ${String(n)}`).join(" · ")}
                  {" · halts in the window: "}
                  {r.halt_census.total}
                  {" · shares per unit: "}
                  {r.supply.map((s) => s.multiplier).join(", ")}
                </dd>
              </div>
            );
          })}
        </dl>
        <p>
          A trading halt of the underlying is matched to the first fill after it and the last fill before its resume; a missing resume
          time, an unknown reason and the gap between block time and submission time are all declared, never guessed. The
          shares-per-unit multiplier converts a token amount into shares at the time of each fill; when it cannot be established as
          constant or known over the window, the session abstains. The full closed list, with a gloss for each code, is on the{" "}
          <Link href="/bell/method#residuals">method page</Link>.
        </p>
      </DocSection>

      <DocSection id="chain" title="The chain, the key, the anchors">
        <Figure caption={<>The served timeline as a chain, drawn from the committed facts of its first and latest lines.</>}>
          <BellChainSchema
            first={served.first_record}
            head={head}
            genesis={served.first_record.prev_line_hash}
            lines={served.timeline.lines}
          />
        </Figure>
        <dl className="d-kv">
          <dt>public key</dt>
          <dd>
            <a href={BELL_HOST + BELL_PUBKEY_PATH}>{BELL_HOST + BELL_PUBKEY_PATH}</a>, Ed25519, key_id <span className="c-mono">{head.key_id}</span>
            {key ? `, ${key.status} from line ${String(key.valid_from_seq)}` : ""}
          </dd>
          <dt>files</dt>
          <dd className="c-mono">
            {BELL_TIMELINE_PATH} · {BELL_STATE_PATH} · {BELL_PROVENANCE_PATH}
          </dd>
          <dt>deploy check</dt>
          <dd>
            {served.deploy_check.checks_passed} of {served.deploy_check.checks_total} controls passed at {served.deploy_check.checked_at},
            the reader-side verifier run against the served host
          </dd>
          <dt>anchors</dt>
          <dd>
            {anchors.rows.length} lines in the anchors register, {anchors.withBitcoin} of {anchors.proofs} proofs carrying a Bitcoin block
            record; they timestamp the manifests of the counter-verification run of the multiplier history.{" "}
            <Link href={ANCHORS_ROUTE}>The register</Link>.
          </dd>
          <dt>the latest record&rsquo;s timestamp anchor</dt>
          <dd>{publicationAnchorSentence(anchorState)}</dd>
        </dl>
      </DocSection>

      <DocSection id="record" title="A real record">
        <p>
          The latest line of the timeline, as committed from the host, and the first session row of its first run. Nothing here is
          typed: the page prints the objects it read.
        </p>
        <JsonBlock
          value={{
            seq: head.seq,
            kind: head.kind,
            published_at: head.published_at,
            prev_line_hash: head.prev_line_hash,
            line_hash: head.line_hash,
            key_id: head.key_id,
            state_sha256: head.state_sha256,
            provenance_sha256: head.provenance_sha256,
            sig: head.sig,
          }}
          caption={
            <>
              line {head.seq} of {BELL_HOST + BELL_TIMELINE_PATH}: its facts as committed in the site data. The served line does not
              carry line_hash, which is the hash of its canonical bytes, computed here; the runs it binds are left out.
            </>
          }
        />
        {shownSession !== undefined && firstRun !== undefined ? (
          <JsonBlock value={shownSession} caption={<>one session row of the run {firstRun.records.map((x) => x.symbol).join(", ")}, as served in the state file, its on-chain price and volume left out (the Bell page prints them)</>} />
        ) : null}
        <p>
          To check a line yourself, follow the <Link href="/docs/verify">verification page</Link>: the key, the chain, the signatures,
          the state files. The reader-side verifier and the public keyring are in the <a href={BELL_PUBLIC_REPO_URL}>public repository</a>.
        </p>
      </DocSection>

      <DocSection id="not" title="What Bell does not do">
        <Callout tone="limit" title="Not a price call, not a certification">
          <p>
            Bell calls no price and republishes no close: it publishes a gap, the on-chain price and volume, and its abstentions. A
            signature attests who produced a line and that it is intact, never that it is true. Bell assesses no venue&rsquo;s
            compliance with anything, and its records describe on-chain activity in the observed pools, nothing beyond them.
          </p>
        </Callout>
        <p>
          The <Link href="/bell">Bell page</Link> shows the latest record in full and the <Link href="/bell/method">method page</Link>{" "}
          every definition.
        </p>
      </DocSection>

      <DocSection id="sources" title="Sources">
        <RefList refIds={["cong-tokenized", "french-weekend", "rfc-eddsa", "fips-sha", "rfc-transparency"]} />
      </DocSection>

      <PrevNext href="/docs/bell" />
    </article>
  );
}
