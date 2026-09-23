import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS } from "@/lib/fleet";
import { ANCHORS_ROUTE, loadAnchors } from "@/lib/bell-anchors-load";
import {
  BELL_SESSION_BOUNDS_ET as B,
  BELL_CALENDAR,
  BELL_DECIMALS,
  BELL_RESIDUALS_SESSIONS,
  BELL_RESIDUALS_HALTS_RESERVES,
  BELL_RESIDUALS_UPCOMING,
  type BellResidual,
} from "@/lib/bell-method";
import { BellContact } from "@/components/bell/contact";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Bell · method · MONARK",
  description:
    "The MONARK Bell method: session bounds, the reference close day, formulas, periods and the closed list of residuals, then the public key, the anchors and the replay code. Upcoming; definitions pinned to the collector source.",
  icons: { icon: [{ url: "/icons/bell.svg", type: "image/svg+xml" }] },
};

// /bell/method — the page the comment letter points to (mock bell-method.html). Every definition shown here is
// pinned to the collector source (apps/bell/src) by the root test bell_method_facts_match_collector: the session
// bounds and the calendar are READ from lib/bell-method.ts (never typed as literals here), the decimals too; the
// residual list must cover the collector's closed list. Values that do not exist yet are named placeholders;
// sentences that need a served path are in the future tense. Section ordinals are words, not digits.
function Residuals({ items, upcoming = false }: { items: readonly BellResidual[]; upcoming?: boolean }) {
  return (
    <>
      {items.map((r) => (
        <div key={r.code} className="c-residual-row">
          <span className={upcoming ? "c-tag c-tag--next" : "c-tag"}>{r.code}</span>
          <span className="c-muted c-small">{r.gloss}</span>
        </div>
      ))}
    </>
  );
}

export default function BellMethodPage() {
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (!bell) throw new Error("bell method page: MONARK Bell is absent from PRODUCTS (lib/fleet.ts)");
  const anchors = loadAnchors();
  const closures = BELL_CALENDAR.fullClosures;
  const halfDays = BELL_CALENDAR.halfDays;

  return (
    <main className="c-main">
      <div className="c-hero c-hero--single">
        <div>
          <span className="c-label">method · /bell/method</span>{" "}
          <span className={bell.status === "built" ? "c-pill c-pill--built" : "c-pill c-pill--upcoming"}>{bell.status}</span>
          <h1 className="c-h1" style={{ marginTop: 10 }}>
            Session bounds, formulas, periods, residuals. Then the key, the anchors and the replay code.
          </h1>
          <p className="c-lede" style={{ marginTop: 12 }}>
            Everything a third party needs to recompute a Bell record from the public ledger and from closing prices and
            consolidated volumes read under their own licence. Definitions are those of the collector&rsquo;s source; a
            change to any of them is a new dated version of this page.
          </p>
          <nav className="c-toc" aria-label="On this page" style={{ marginTop: 16 }}>
            <a href="#sessions">sessions</a>
            <a href="#refclose">reference close day</a>
            <a href="#formulas">formulas</a>
            <a href="#periods">periods</a>
            <a href="#residuals">residuals</a>
            <a href="#digest">digest and chain</a>
            <a href="#key">public key</a>
            <a href="#anchors">anchors</a>
            <a href="#replay">replay code</a>
            <a href="#limits">limits</a>
          </nav>
        </div>
      </div>

      <section className="c-section" id="sessions" aria-labelledby="l-sessions">
        <span className="c-label" id="l-sessions">sessions · New York wall clock, daylight saving applied per date</span>
        <div className="c-timeline" aria-label="Session bounds in Eastern Time">
          <div className="c-off"><b>overnight-weekday</b>from the end of after-hours to the next pre-open, across a night with no weekend and no closure in it</div>
          <div className="c-on"><b>pre</b>{B.preOpen} to {B.regularOpen} ET</div>
          <div className="c-on"><b>regular</b>{B.regularOpen} to {B.regularClose} ET · {B.regularCloseHalfDay} on a half-day</div>
          <div className="c-on"><b>after</b>{B.regularClose} to {B.afterClose} ET · {B.afterCloseHalfDay} on a half-day</div>
          <div className="c-off"><b>weekend</b>a gap with a Saturday or Sunday in it</div>
          <div className="c-off"><b>holiday</b>a gap with a full closure in it; a weekend around it does not change the regime</div>
        </div>
        <div className="c-grid c-grid--2" style={{ marginTop: 20 }}>
          <div className="c-card">
            <h2 className="c-h2">Anchor day and regime</h2>
            <ol className="c-ol">
              <li>An instant is classified by its Eastern wall-clock date and minute; the offset for that date is taken from the time zone database, never a fixed number.</li>
              <li>
                An off-hours instant belongs to the gap that <b>begins on the most recent trading day</b>: after {B.afterClose} ET
                ({B.afterCloseHalfDay} on a half-day) the gap begins that day; before {B.preOpen} ET it began on the previous
                trading day; a Saturday, Sunday or full closure anchors on the last day the exchange opened.
              </li>
              <li>
                The regime of a gap is read by walking forward from its anchor day to the next trading day: a full closure on
                the way makes it <span className="c-mono">holiday</span>; otherwise a Saturday or Sunday makes it{" "}
                <span className="c-mono">weekend</span>; otherwise it is <span className="c-mono">overnight-weekday</span>.
              </li>
              <li>A trading day is a weekday that is not a full closure. A half-day is a trading day with an early close.</li>
            </ol>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Committed calendar</h2>
            <dl className="c-kv">
              <dt>range</dt>
              <dd>{BELL_CALENDAR.from} to {BELL_CALENDAR.to}; outside it, classification is <b>unknown</b> and no session is produced</dd>
              <dt>full closures</dt>
              <dd>{closures.length} days: {closures.join(" · ")}</dd>
              <dt>half-days</dt>
              <dd>{halfDays.length} days: {halfDays.join(" · ")}</dd>
              <dt>source</dt>
              <dd>
                up to 2025-12-31, derived from the absence of a daily bar on the underlying (first hand; it caught the special
                closure of 2025-01-09); from 2026-01-01, read on the exchange&rsquo;s published calendar and cross-read on a
                market-status endpoint
              </dd>
              <dt>extension</dt>
              <dd>a new year is a dated amendment with the same first-hand check; future dates are never guessed</dd>
            </dl>
          </div>
        </div>
      </section>

      <section className="c-section" id="refclose" aria-labelledby="l-refclose">
        <span className="c-label" id="l-refclose">reference close day · the rule that keys each gap to a trading day</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <pre className="c-formula">{`refCloseDateOf(session, anchorDay) =
  anchorDay
      if session ∈ { overnight-weekday, weekend, holiday, after }
  previousTradingDay(anchorDay)
      if session ∈ { pre, regular }`}</pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              For the off-hours regimes and for after-hours, the anchor day&rsquo;s official close has already settled when the
              session occurs, so that close is the reference. For pre-market and regular hours, the anchor day&rsquo;s close has
              not settled yet at session time; using it would read the future, so the reference is the prior trading
              day&rsquo;s close. Off-hours regimes, the ones Bell reports, are keyed to their anchor day.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Two readings of the close</h2>
            <p className="c-muted">
              The reference close is read from a consolidated end-of-day source and cross-read on a second source at a fixed
              scale. The two must agree on the scaled integer; a disagreement abstains the session with{" "}
              <span className="c-mono">cash_cross_mismatch</span>, never an average and never a silent pick. When the
              cross-read cannot run, the session carries <span className="c-mono">cash_cross_unavailable</span>. A close that
              is missing or not positive abstains with <span className="c-mono">no_close_ref</span>.
            </p>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>Close values are never published.</p>
          </div>
        </div>
      </section>

      <section className="c-section" id="formulas" aria-labelledby="l-formulas">
        <span className="c-label" id="l-formulas">formulas · exact integer arithmetic, decimals carried to {BELL_DECIMALS} places</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">Fills</h2>
            <p className="c-muted">
              A fill is one swap in one observed pool, read from the ledger: base delta b (token units) and quote delta q
              (quote units), with the block time. Fills are <b>counted once per transaction signature</b>, so an aggregator
              route through a pool appears once. A session with no fill abstains with{" "}
              <span className="c-mono">no_fill_in_window</span>.
            </p>
            <h2 className="c-h2" style={{ marginTop: 16 }}>Price per share and gap</h2>
            <pre className="c-formula">{`m(t)       = shares per token at block time t
             (on-chain multiplier)
VWAP_share = Σ |q_i|  /  Σ ( |b_i| · m(t_i) )
g          = ln ( VWAP_share / P_close )
exceeds(θ) = | VWAP_share − P_close | / P_close > θ`}</pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              θ takes the two thresholds of the first-measurement report, one percent and five percent. P_close is the
              reference close of the day given under <a href="#refclose">reference close day</a>. When the multiplier is one
              over the whole pool window, the unrebased path is used. When the multiplier history is known and differs from
              one, the per-fill form above is used and the session carries <span className="c-mono">multiplier_unit</span>.
              When the multiplier could not be established as constant or known, the session abstains with{" "}
              <span className="c-mono">rebase_unverified</span>.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Volume ratio</h2>
            <pre className="c-formula">{`V_tokens   = Σ |b_i| in token units
             (numerator window, deduped fills)
V_shares   = V_tokens · m
ADV        = mean of the daily consolidated
             share volumes over the
             denominator period
vol_ratio  = V_shares / ADV`}</pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              Only the ratio will be published; the consolidated daily volume is never carried in the record. A denominator
              that cannot be established produces no ratio and a named residual (<span className="c-mono">no_adv</span>,{" "}
              <span className="c-mono">no_multiplier</span> <span className="c-tag c-tag--next">upcoming · in review</span>),
              never a fabricated ratio.
            </p>
            <h2 className="c-h2" style={{ marginTop: 16 }}>Shares per regime</h2>
            <pre className="c-formula">{`share(regime, θ) =
    #{ sessions in regime, g computed, exceeds(θ) }
  / #{ sessions in regime, g computed }`}</pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              Sessions that abstained are in neither count; their number will be published beside the share.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="periods" aria-labelledby="l-periods">
        <span className="c-label" id="l-periods">periods · every published number will carry its dates</span>
        <div className="c-grid c-grid--3">
          <div className="c-card">
            <h3 className="c-h3">Gap sessions</h3>
            <p className="c-muted">
              Each gap is keyed to the reference close day and to its regime. The first-measurement window for TSLAx is{" "}
              <Placeholder name="window_TSLAx" />; a pool whose bounds were reduced declares them.
            </p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">Ratio numerator</h3>
            <p className="c-muted">
              The collection window, in UTC: <Placeholder name="window_ratio" />, from{" "}
              <span className="c-mono">state.window.from_utc_ms</span> to <span className="c-mono">state.window.to_utc_ms</span>.
              The numerator is the total of that window; it is set against a daily denominator, and that difference of unit
              is stated with the ratio.
            </p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">
              Ratio denominator <span className="c-tag c-tag--next">upcoming · in review</span>
            </h3>
            <p className="c-muted">
              The <b>previous calendar month</b>, to be published as <span className="c-mono">{"adv_period { year, month }"}</span>{" "}
              = <Placeholder name="adv_period" />, with <span className="c-mono">n_bars</span> ={" "}
              <Placeholder name="n_bars" /> daily bars and the <span className="c-mono">formula</span> string carried in the
              record.
            </p>
          </div>
        </div>
        <p className="c-note" style={{ marginTop: 12 }}>
          At the date of this page, the collector computes the denominator over a different window than the previous calendar
          month; a change in review aligns the code and adds the three fields above, which stay marked upcoming until then.
        </p>
      </section>

      <section className="c-section" id="residuals" aria-labelledby="l-residuals">
        <span className="c-label" id="l-residuals">residuals · the closed list; each one to be counted in state.json</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">Sessions and reads</h2>
            <Residuals items={BELL_RESIDUALS_SESSIONS} />
          </div>
          <div className="c-card">
            <h2 className="c-h2">Halts, reserves, wrappers</h2>
            <Residuals items={BELL_RESIDUALS_HALTS_RESERVES} />
            <h2 className="c-h2" style={{ marginTop: 16 }}>
              Added by the change in review <span className="c-tag c-tag--next">upcoming</span>
            </h2>
            <Residuals items={BELL_RESIDUALS_UPCOMING} upcoming />
          </div>
        </div>
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          A residual is a named reason the collector could not produce a clean fact. Each code has one runtime source; a
          session carries its codes as words next to the number it qualifies, and <span className="c-mono">state.residuals</span>{" "}
          will count each code, with <span className="c-mono">residual_total</span> as their sum. Codes marked upcoming are not
          in the collector&rsquo;s closed list until the lot that adds them is merged and its integration test passes.
        </p>
      </section>

      <section className="c-section" id="digest" aria-labelledby="l-digest">
        <span className="c-label" id="l-digest">digest and chain · what a published state will contain</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">state.json</h2>
            <pre className="c-code">{`{
  "schema": "…",
  "bell_sha": "`}<Placeholder name="bell_sha_latest" />{`",
  "window": { "from_utc_ms": …, "to_utc_ms": … },
  "residuals": { "<code>": <count>, … },
  "residual_total": …,
  "digest": {
    "gaps":   [ { symbol, session, regime, ref_close_date,
                  vwap, volume_base, n, g_t | abstain, … } ],
    "halts":  { census },
    "volume": [ { symbol, vol_ratio, multiplier_unit, … } ],
    "supply": [ … ], "por": [ … ], "wrapper": [ … ]
  }
}`}</pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              Field names are the collector&rsquo;s; the shape shown is read from its source and will be replaced by the served
              schema at publication. Close values, share volumes and any price-like key are refused by the digest guard.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Chaining</h2>
            <ol className="c-ol">
              <li><b>Canonical bytes.</b> The digest object is serialised with sorted keys and no whitespace; <span className="c-mono">bell_sha</span> is its hash.</li>
              <li><b>Journal.</b> Each line of the collection journal carries the hash of the previous line&rsquo;s canonical bytes; a removed or edited line breaks the chain at recomputation.</li>
              <li><b>Timeline.</b> <span className="c-mono">timeline.jsonl</span> will be append-only; each line will carry the previous line&rsquo;s hash and a signature over its canonical bytes.</li>
              <li><b>Provenance.</b> A separate file names the operators and the quorum for each read and the close source. It travels beside the digest and is not hashed into it.</li>
              <li><b>Manifests.</b> At each start, end and resumption of a run, a manifest lists the run&rsquo;s artifacts with their hashes, sorted, one per line; the manifest is what gets anchored (see <a href="#anchors">anchors</a>).</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="c-section" id="key" aria-labelledby="l-key">
        <span className="c-label" id="l-key">public key · a signature attests origin, not truth</span>
        <div className="c-grid c-grid--2">
          <div className="c-card c-card--prov">
            <dl className="c-kv">
              <dt>algorithm</dt>
              <dd>Ed25519</dd>
              <dt>public key</dt>
              <dd><Placeholder name="pubkey_ed25519" state="to be published" /></dd>
              <dt>generated</dt>
              <dd>on the dedicated host from which the records will be published, operated by MONARK</dd>
              <dt>signs</dt>
              <dd>each line of <span className="c-mono">timeline.jsonl</span>, over the line&rsquo;s canonical bytes</dd>
              <dt>rotation</dt>
              <dd><Placeholder name="key_rotation_policy" state="to be decided" /></dd>
            </dl>
          </div>
          <div className="c-card">
            <h2 className="c-h2">What a valid signature will tell you</h2>
            <p className="c-muted">
              That the line was produced by the holder of this key, and that it has not been altered since. It says nothing
              about whether the line&rsquo;s content is true: truth is checked by recomputing the line from the ledger and from
              the reader&rsquo;s own close data (see <a href="#replay">replay code</a>). Independence from the venues and issuers
              measured: <Placeholder name="relation_commerciale" />; not independence from MONARK.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="anchors" aria-labelledby="l-anchors">
        <span className="c-label" id="l-anchors">anchors · public timestamps of the run&rsquo;s manifests</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">What is anchored, and when</h2>
            <p className="c-muted">
              At each boundary of a run (the end of the probe, the start, each resumption and the end of each token&rsquo;s
              enumeration, and the final state), the boundary&rsquo;s manifest is submitted to OpenTimestamps. The proof is
              pending first, then upgraded to a Bitcoin attestation.
            </p>
            <dl className="c-kv" style={{ marginTop: 12 }}>
              <dt>manifests and proofs</dt>
              <dd><Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link></dd>
              <dt>lines in the register</dt>
              <dd>{anchors.rows.length} ({anchors.proofs} with a proof, {anchors.withoutProof} without)</dd>
              <dt>proofs with a Bitcoin record</dt>
              <dd>{anchors.withBitcoin} of {anchors.proofs}, read from the proof files when this page was built</dd>
            </dl>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Check one anchor yourself</h2>
            <ol className="c-ol">
              <li>Download the line&rsquo;s manifest and its proof from <Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link>.</li>
              <li>Recompute the SHA-256 of the manifest; it must equal the line&rsquo;s manifest digest.</li>
              <li>Run an open OpenTimestamps client on the proof, against a Bitcoin node of your choice; it names the block before which the manifest existed.</li>
              <li>Where a ledger is published (<span className="c-tag c-tag--next">to be published</span>), recompute the digests of the artifacts the manifest lists, and re-pull one page from the chain to compare.</li>
              <li>Bound: an anchor shows the log head existed before that block. It does not show where the pages came from, nor that the scan ran. The commit is a second, weaker witness.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="c-section" id="replay" aria-labelledby="l-replay">
        <span className="c-label" id="l-replay">replay code · recompute, do not trust</span>
        <div className="c-grid c-grid--2">
          <div className="c-card c-card--prov">
            <p>
              The collector core will be exported so that a third party recomputes the digests offline:{" "}
              <Placeholder name="url_replay" state="to be exported" />. Its commands and file names will be printed here
              from the exported repository; with the same inputs on disk, no network call is needed. A replay confirms the
              arithmetic; the only check on a fact is the on-chain recompute.
            </p>
            <dl className="c-kv" style={{ marginTop: 12 }}>
              <dt>published digest</dt>
              <dd><Placeholder name="bell_sha_latest" /></dd>
            </dl>
          </div>
          <div className="c-card">
            <h2 className="c-h2">What you bring</h2>
            <dl className="c-kv">
              <dt>closes</dt>
              <dd>consolidated end-of-day closes for the reference days, read under your own licence</dd>
              <dt>daily volumes</dt>
              <dd>consolidated daily share volumes for the denominator period, same</dd>
              <dt>fills</dt>
              <dd>the run&rsquo;s ledger of fills <span className="c-tag c-tag--next">to be published</span>, or your own enumeration of the pools from the chain</dd>
              <dt>multipliers</dt>
              <dd>the run&rsquo;s multiplier history <span className="c-tag c-tag--next">to be published</span>, or your own scan of the mint&rsquo;s update events</dd>
            </dl>
            <p className="c-muted c-small" style={{ marginTop: 12 }}>
              With the same inputs, every gap and ratio is designed to recompute bit for bit. With different inputs, the
              difference names the input.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="limits" aria-labelledby="l-limits">
        <span className="c-label" id="l-limits">declared limits</span>
        <div className="c-grid c-grid--4">
          <div className="c-card">
            <h3 className="c-h3">An omitted transaction</h3>
            <p className="c-muted">Bell cannot detect a transaction omitted inside an otherwise complete page returned by the operator. For the multiplier history, a second scan method reduces this risk without removing it.</p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">A signature is origin</h3>
            <p className="c-muted">A valid signature shows who produced a line and that it is intact. It does not make the line true. An anchor shows a manifest existed before a block, nothing more.</p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">Sample</h3>
            <p className="c-muted">Four symbols of one token family on one chain, outside the TSV framework, over the stated windows. Results do not extend to other tokens, chains or venues.</p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">Not a certification</h3>
            <p className="c-muted">Bell is neither a TSV nor a Covered Firm; it assesses compliance with no condition of any order. Its records describe on-chain activity in the observed pools.</p>
          </div>
        </div>
        <dl className="c-kv" style={{ marginTop: 20 }}>
          <dt>this page</dt>
          <dd>
            version <Placeholder name="method_version" />, dated <Placeholder name="method_date" />; source revision{" "}
            <Placeholder name="method_commit" />
          </dd>
          <dt>contact</dt>
          <dd><BellContact /></dd>
        </dl>
      </section>
    </main>
  );
}
