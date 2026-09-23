import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS } from "@/lib/fleet";
import { loadAnchors, ANCHORS_ROUTE } from "@/lib/bell-anchors-load";
import { AnchorsTable } from "@/components/bell/anchors-table";
import { BellContact } from "@/components/bell/contact";
import { Placeholder } from "@/components/placeholder";
import { TERMS_ROUTE, PRIVACY_ROUTE } from "@/lib/bell-legal";

// Static metadata only (no generateMetadata); digit-free (honesty lint §6b). Favicon = a static public asset
// OUTSIDE /bell/ (the /narabi precedent, ruling D-2: a future Caddy handle_path /bell/* must not shadow it).
export const metadata: Metadata = {
  title: "Bell · MONARK",
  description:
    "MONARK Bell, upcoming: a public, signed record of how tokens that track U.S. equities trade on a public ledger while U.S. markets are closed. One gap per session, a named abstention when it cannot know, an anchored digest. Never a score, never a probability of being right.",
  icons: { icon: [{ url: "/icons/bell.svg", type: "image/svg+xml" }] },
};

// /bell — the product page (charter C mock bell.html, decisions 145/146). HONESTY: Bell is UPCOMING (status read
// from the register, lib/fleet.ts); every figure is a NAMED placeholder (components/placeholder.tsx) until the
// served state file exists; sentences that need a served path (state.json, timeline, key, replay code) are in the
// future tense (SEC letter RENDU-v3 §6); the anchors table and its statuses are READ from the served files at
// build time (lib/bell-anchors-load.ts), never typed. The "one record" table shows the SHAPE of a served row:
// its regimes and residual states are illustrative, chosen to display each rendered state once.
export default function BellPage() {
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (!bell) throw new Error("bell page: MONARK Bell is absent from PRODUCTS (lib/fleet.ts) — the register is the single source of its status");
  const anchors = loadAnchors();

  return (
    <main className="c-main">
      <div className="c-hero">
        <div>
          <span className={bell.status === "built" ? "c-pill c-pill--built" : "c-pill c-pill--upcoming"}>{bell.status}</span>
          <h1 className="c-h1" style={{ marginTop: 12 }}>
            While New York is closed, the tokens keep printing. Bell will write down the gap, and the reasons it could not.
          </h1>
        </div>
        <p className="c-lede">
          A public, signed record, to come, of how tokens that track U.S. equities trade on a public ledger, in particular
          while U.S. markets are closed, written so that anyone can recompute it. One number per session, a list of what is
          missing, a digest. Never a score, never a probability of being right.
        </p>
      </div>
      {/* Hero visual (pli SITE-NOYAU-1): the vendored Canvas 2D cubes scene, moved here from the home page with its
          legend, same iframe (public/scene/blocks-hero.html, no library; reduced motion = one still frame). */}
      <div className="c-scene">
        <iframe src="/scene/blocks-hero.html" title="" aria-hidden="true" tabIndex={-1} loading="eager" />
      </div>
      <div className="c-legend" aria-hidden="true">
        <span><i style={{ background: "#FFFFFF", border: "1px solid var(--ink2)" }} />tokens, day side</span>
        <span><i style={{ background: "var(--cash-close)" }} />cash market quoting</span>
        <span><i style={{ background: "var(--token-print)" }} />tokens after the close</span>
        <span><i style={{ background: "var(--token-print)", borderRadius: "50%" }} />one dot, one session record</span>
      </div>
      <nav className="c-toc" aria-label="On this page" style={{ marginTop: 18 }}>
        <a href="#measures">what Bell measures</a>
        <a href="#properties">four properties</a>
        <a href="#anchors">anchors</a>
        <a href="#status">status</a>
        <a href="#conditions">conditions</a>
        <Link href="/bell/method">method</Link>
      </nav>

      <section className="c-section" id="measures" aria-labelledby="l-measures">
        <span className="c-label" id="l-measures">
          what Bell measures · population and two facts <span className="c-tag c-tag--next">upcoming · not served yet</span>
        </span>
        <div className="c-grid">
          <div className="c-card">
            <h2 className="c-h2">Population</h2>
            <ul className="c-list">
              <li>
                <span>+</span>
                <span>
                  <b>Four tokens.</b> TSLAx, AAPLx, NVDAx and SPYx, traded on public automated-market-maker pools on Solana.
                </span>
              </li>
              <li>
                <span>+</span>
                <span>
                  <b>Not a tokenization venue.</b> These pools are not a TSV under the Commission&rsquo;s order, and Bell makes
                  no representation that the tokens are Tokenized NMS Stock. The method, not this population, is designed to
                  apply to TSV pools.
                </span>
              </li>
              <li>
                <span>+</span>
                <span>
                  <b>Read from the ledger, twice.</b> Fills are enumerated from the public chain through one operator and
                  cross-read on a second endpoint; fewer than two distinct answers is a named abstention,{" "}
                  <span className="c-mono">no_quorum</span>.
                </span>
              </li>
              <li>
                <span>+</span>
                <span>
                  <b>Closing prices and consolidated volume</b> are obtained under the reader&rsquo;s licence and never
                  republished. Bell will publish gaps and ratios, not prices.
                </span>
              </li>
            </ul>
            <div className="c-feed" style={{ marginTop: 14 }} aria-hidden="true">
              <span className="c-sw c-sw--mint" />
              <span>token prints, on chain</span>
              <span className="c-sw c-sw--lav" />
              <span>last consolidated close</span>
              <span className="c-sw c-sw--ink" />
              <span>a named residual</span>
            </div>
          </div>

          <div className="c-card c-card--accent">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <span className="c-label" style={{ color: "var(--token-print)" }}>
                one record · what a session row will hold
              </span>
              <span className="c-state c-state--dashed">not served yet</span>
            </div>
            <div className="c-board" style={{ marginTop: 12 }}>
              <div className="c-board-scroll">
                <table className="c-table">
                  <thead>
                    <tr>
                      <th className="c-label">token</th>
                      <th className="c-label">session · regime</th>
                      <th className="c-label">window · UTC</th>
                      <th className="c-label c-num">
                        g = ln(P<sub>session</sub> / P<sub>close</sub>)
                      </th>
                      <th className="c-label c-num">vol_ratio</th>
                      <th className="c-label">residuals</th>
                      <th className="c-label c-num">reads</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><b style={{ color: "var(--token-print)" }}>TSLAx</b></td>
                      <td>weekend</td>
                      <td><Placeholder name="window_TSLAx_latest" /></td>
                      <td className="c-num"><Placeholder name="g_TSLAx_latest" /></td>
                      <td className="c-num"><Placeholder name="vol_ratio_TSLAx" /></td>
                      <td><span className="c-tag">multiplier_unit</span></td>
                      <td className="c-num"><Quorum answered="two" /></td>
                    </tr>
                    <tr>
                      <td><b style={{ color: "var(--token-print)" }}>AAPLx</b></td>
                      <td>overnight-weekday</td>
                      <td><Placeholder name="window_AAPLx_latest" /></td>
                      <td className="c-num"><Placeholder name="g_AAPLx_latest" /></td>
                      <td className="c-num"><Placeholder name="vol_ratio_AAPLx" /></td>
                      <td><span className="c-tag">multiplier_unit</span></td>
                      <td className="c-num"><Quorum answered="two" /></td>
                    </tr>
                    <tr>
                      <td><b style={{ color: "var(--token-print)" }}>NVDAx</b></td>
                      <td>holiday</td>
                      <td><Placeholder name="window_NVDAx_latest" /></td>
                      <td className="c-num" colSpan={2}><span className="c-abstain">abstained: no_close_ref</span></td>
                      <td><span className="c-tag">no_close_ref</span></td>
                      <td className="c-num"><Quorum answered="two" /></td>
                    </tr>
                    <tr>
                      <td><b style={{ color: "var(--token-print)" }}>SPYx</b></td>
                      <td>weekend</td>
                      <td><Placeholder name="window_SPYx_latest" /></td>
                      <td className="c-num" colSpan={2}><span className="c-abstain">abstained: no_quorum</span></td>
                      <td><span className="c-tag">no_quorum</span></td>
                      <td className="c-num"><Quorum answered="one" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              Rows are the shape of a record, not data: each value is a named placeholder, and the regimes and residual
              states are illustrative, chosen to display every rendered state once. Once served, the board would read{" "}
              <span className="c-mono">state.json</span> and show what it holds, in this layout.
            </p>
          </div>
        </div>

        <div className="c-grid c-grid--2" style={{ marginTop: 20 }}>
          <div className="c-card">
            <h2 className="c-h2">Fact one · the off-hours gap</h2>
            <p>
              For each session while the U.S. market is closed (weekday overnight, weekend, holiday), Bell will publish{" "}
              <span className="c-mono">g = ln(P_session / P_close)</span>: the volume-weighted average price of the
              token&rsquo;s on-chain fills, per underlying share, against the last consolidated closing price. It will report
              the share of sessions where the gap exceeds a threshold, with the count of sessions behind the share.
            </p>
            <dl className="c-kv" style={{ marginTop: 12 }}>
              <dt>first measurement</dt>
              <dd>TSLAx, window <Placeholder name="window_TSLAx" /></dd>
              <dt>weekday overnight</dt>
              <dd>
                beyond one percent: <Placeholder name="t4_TSLAx_wkn_gt1" /> · beyond five percent:{" "}
                <Placeholder name="t4_TSLAx_wkn_gt5" /> · of <Placeholder name="n_TSLAx_wkn" /> sessions with g computed
              </dd>
              <dt>weekend</dt>
              <dd>
                beyond one percent: <Placeholder name="t4_TSLAx_we_gt1" /> · beyond five percent:{" "}
                <Placeholder name="t4_TSLAx_we_gt5" /> · of <Placeholder name="n_TSLAx_we" /> sessions with g computed
              </dd>
            </dl>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              This statistic describes the size and frequency of off-hours deviations from the last close. It measures no
              effect on the underlying market and implies no causal link.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Fact two · pool volume against consolidated daily volume</h2>
            <p>
              For each observation window, Bell will publish the ratio of the volume in its observed pools, recomputed from
              on-chain swaps counted once per transaction and converted to shares with the on-chain shares-per-token
              multiplier, to the underlying stock&rsquo;s consolidated average daily share volume over a period stated in the
              method.
            </p>
            <dl className="c-kv" style={{ marginTop: 12 }}>
              <dt>numerator window</dt>
              <dd><Placeholder name="window_ratio" /> (collection window, UTC)</dd>
              <dt>denominator period</dt>
              <dd>
                <Placeholder name="adv_period" /> · <Placeholder name="n_bars" /> daily bars{" "}
                <span className="c-tag c-tag--next">upcoming · in review</span>
              </dd>
              <dt>unit</dt>
              <dd>shares / shares per day; a multiplier other than one raises <span className="c-mono">multiplier_unit</span></dd>
            </dl>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              These pools are not TSVs; the ratio describes on-chain activity in the observed pools, not whether any venue is
              within a limit.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="properties" aria-labelledby="l-props">
        <span className="c-label" id="l-props">
          four properties · what Bell would apply to its own records once they are served{" "}
          <span className="c-tag c-tag--next">upcoming</span>
        </span>
        <div className="c-props">
          <div className="c-card">
            <span className="c-label">01</span>
            <h3 className="c-h3" style={{ marginTop: 6 }}>Recomputable from the ledger</h3>
            <p>
              Each published fact will identify its on-chain transactions, so that a third party can recompute price, size,
              time and direction from the public ledger, and every gap and ratio bit for bit with the replay code once it is
              exported, given the same closing price and consolidated volume read under the reader&rsquo;s own licence.
            </p>
          </div>
          <div className="c-card">
            <span className="c-label">02</span>
            <h3 className="c-h3" style={{ marginTop: 6 }}>Named abstention</h3>
            <p>
              When a value cannot be established, the record gives a named reason instead of an estimate, for example{" "}
              <span className="c-mono">no_close_ref</span> for a missing closing price, and will count such cases in the
              published state file.
            </p>
          </div>
          <div className="c-card">
            <span className="c-label">03</span>
            <h3 className="c-h3" style={{ marginTop: 6 }}>Published and anchored digest</h3>
            <p>
              Each collection log is chained by SHA-256; at each start, end and resumption of a run, a manifest of its
              digests is submitted to a public timestamp. A later edit is detectable by recomputation. An anchor shows a log
              head existed before a Bitcoin block, not where its pages came from.
            </p>
          </div>
          <div className="c-card">
            <span className="c-label">04</span>
            <h3 className="c-h3" style={{ marginTop: 6 }}>Dated periods</h3>
            <p>
              Each gap is keyed to the trading day of its closing price by the rule stated in the method; each ratio will
              carry its observation window and name its denominator&rsquo;s month and source, so that a miscalculation in
              either term can be located.
            </p>
          </div>
        </div>
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          Bell is neither a TSV nor a Covered Firm. It assesses compliance with no condition of any order, and its records are
          not a certification. Independence from the venues and issuers measured: <Placeholder name="relation_commerciale" />;
          not independence from MONARK.
        </p>
      </section>

      <section className="c-section" id="anchors" aria-labelledby="l-anchors">
        <span className="c-label" id="l-anchors">anchors · the first-measurement run, one line per boundary</span>
        <AnchorsTable view={anchors} />
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          Read from the anchors register; dates, digests and commit identifiers are the register&rsquo;s own, sorted by time.
          Each manifest and each proof is served with the full register at{" "}
          <Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link>. The status column is what each proof file contains when this page
          was built, not a check against a Bitcoin node. An anchor shows that a log head existed before a Bitcoin block; it
          does not show where the pages came from, nor that the scan ran. The commit is a second, weaker witness (server date,
          same operator).
        </p>
      </section>

      <section className="c-section" id="status" aria-labelledby="l-status">
        <span className="c-label" id="l-status">status · what is served, what is not</span>
        <div className="c-board">
          <div className="c-board-scroll">
            <table className="c-table">
              <thead>
                <tr>
                  <th className="c-label">artifact</th>
                  <th className="c-label">what it is</th>
                  <th className="c-label">state</th>
                  <th className="c-label">location</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>state.json</td>
                  <td>the published state: window, digest, residual counts, per-token gaps and ratios, halt census; the first-measurement shares and counts per regime will be read from it</td>
                  <td><span className="c-pill c-pill--upcoming">upcoming</span></td>
                  <td><Placeholder name="url_state" /></td>
                </tr>
                <tr>
                  <td>timeline.jsonl</td>
                  <td>an append-only timeline, chained line by line, each line signed</td>
                  <td><span className="c-pill c-pill--upcoming">upcoming</span></td>
                  <td><Placeholder name="url_timeline" /></td>
                </tr>
                <tr>
                  <td>public key (Ed25519)</td>
                  <td>the public half of the signing key, generated on the dedicated host</td>
                  <td><span className="c-pill c-pill--upcoming">to be published</span></td>
                  <td><Placeholder name="pubkey_ed25519" state="to be published" /></td>
                </tr>
                <tr>
                  <td>method page</td>
                  <td>session bounds, formulas, periods, residuals, the public key, the anchors and the replay code; its definitions are pinned to the collector source by a test</td>
                  <td><span className="c-pill c-pill--upcoming">upcoming</span></td>
                  <td><Link href="/bell/method">/bell/method</Link></td>
                </tr>
                <tr>
                  <td>anchors · manifests and proofs</td>
                  <td>one manifest and one timestamp proof per boundary of the run, the register rendered, the status read from each proof file</td>
                  <td><span className="c-pill c-pill--upcoming">upcoming</span></td>
                  <td><Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link></td>
                </tr>
                <tr>
                  <td>replay code</td>
                  <td>the collector core, exported so that a third party recomputes digests offline</td>
                  <td><span className="c-pill c-pill--upcoming">to be exported</span></td>
                  <td><Placeholder name="url_replay" state="to be exported" /></td>
                </tr>
                <tr>
                  <td>contact</td>
                  <td>a public contact address on the domain, with a mail template</td>
                  <td><span className="c-pill c-pill--fact">created</span></td>
                  <td><BellContact /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          A line moves from upcoming to served only when its path is served and covered by an integration test that replays
          the composition end to end. Until then, nothing on this page is a claim about a served record.
        </p>
      </section>

      {/* Short conditions (decision 94) — the validated disclaimer block, verbatim (decision 147: the lawyer's GO on
          the Bell legal texts as drafted); publisher identity fields stay visible placeholders (decision 94). The full
          Terms of Use and Privacy Notice are linked at its foot (lot SITE-LEGAL-1). */}
      <section className="c-section" id="conditions" aria-labelledby="l-conditions">
        <span className="c-label" id="l-conditions">conditions in short · they apply to Bell&rsquo;s records once they are published</span>
        <div className="c-card c-card--prov">
          <p>
            This page and the facts it links to are published as a public witness: signed, recomputable records, not
            investment advice, a rating, or a certification.
          </p>
          <ul className="c-list" style={{ marginTop: 12 }}>
            <li>
              <span>·</span>
              <span>
                <b>Facts witnessed, not investment advice.</b> What is published here is a measurement and its definition,
                not a recommendation to buy, sell, or hold anything, and not a suitability opinion for anyone.
              </span>
            </li>
            <li>
              <span>·</span>
              <span>
                <b>A signature attests origin, not truth.</b> Each record is signed and chained to the one before it, so that
                any change after publication is detectable. The signature proves who published the record and when. It does
                not prove that the underlying fact is correct — recomputing it from the public inputs is how you check that.
              </span>
            </li>
            <li>
              <span>·</span>
              <span>
                <b>No endorsement of or by any issuer, venue, or data provider.</b> Being measured here is not a form of
                approval, and nothing here should be read as such.
              </span>
            </li>
            <li>
              <span>·</span>
              <span>
                <b>Replay requires your own reference-close licence.</b> We publish the computed gap, not the underlying
                reference closing price. Reproducing our computation end-to-end requires your own licensed access to that
                reference price.
              </span>
            </li>
            <li>
              <span>·</span>
              <span>
                <b>Abstentions and residuals are published as such.</b> Where our method cannot produce a reliable number for
                a given session — for example while a halt is in progress, or before enough sessions exist to calibrate a
                class — we publish that fact instead of an estimate. A count of abstentions and residuals is part of what we
                publish, not hidden from it.
              </span>
            </li>
          </ul>
          <p className="c-muted c-small" style={{ marginTop: 12 }}>
            Provided as is, without warranty of any kind. Publisher: the MONARK project; legal entity{" "}
            <Placeholder name="legal_entity" state="to be decided" />, legal form <Placeholder name="legal_form" state="to be decided" />,
            address <Placeholder name="publisher_address" state="to be decided" />. Nothing on this page is served as a Bell
            record today (status above).
          </p>
          <p className="c-small" style={{ marginTop: 8 }}>
            Full texts: <Link href={TERMS_ROUTE}>Terms of Use</Link> · <Link href={PRIVACY_ROUTE}>Privacy Notice</Link>.
          </p>
        </div>
      </section>

      <section className="c-section" id="not" aria-labelledby="l-not">
        <span className="c-label" id="l-not">what Bell does not do</span>
        <div className="c-grid c-grid--3">
          <div className="c-card">
            <h3 className="c-h3">No score, no probability</h3>
            <p className="c-muted">A gap is a number with its residuals; a ratio is a number with its period. Neither is graded, ranked or turned into odds.</p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">No cause, no direction</h3>
            <p className="c-muted">Bell measures no effect of off-hours trading on the underlying market or its opening, and colours nothing by sign.</p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">No prices, no advice</h3>
            <p className="c-muted">Closing prices and consolidated volumes are never republished. Bell does not trade, does not quote, and does not tell anyone to.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

/** Quorum of reads, drawn as bars and said in words (never a digit, never a percentage). */
function Quorum({ answered }: { answered: "one" | "two" }) {
  return (
    <span className="c-quorum">
      <i aria-hidden="true">
        <b />
        <b className={answered === "two" ? undefined : "c-off"} />
      </i>
      {answered} of two
    </span>
  );
}
