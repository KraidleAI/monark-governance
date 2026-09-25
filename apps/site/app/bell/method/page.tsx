import type { Metadata } from "next";
import Link from "next/link";
import { PRODUCTS } from "@/lib/fleet";
import { ANCHORS_ROUTE, loadAnchors, loadPublications } from "@/lib/bell-anchors-load";
import { publicationAnchorState, publicationAnchorSentence } from "@/lib/bell-anchors";
import {
  BELL_SESSION_BOUNDS_ET as B,
  BELL_CALENDAR,
  BELL_DECIMALS,
  BELL_RESIDUALS_SESSIONS,
  BELL_RESIDUALS_VOLUME,
  BELL_RESIDUALS_HALTS_RESERVES,
  BELL_RESIDUALS_UPCOMING,
  BELL_RESIDUAL_CODES_LISTED,
  BELL_PUBLIC_REPO_URL,
  BELL_VOL_RATIO_FORMULA_DISPLAY,
  type BellResidual,
} from "@/lib/bell-method";
import { BellContact } from "@/components/bell/contact";
import {
  loadBellServed,
  bellServedRepoRoot,
  thresholdsOf,
  utcSeconds,
  abstentionsOf,
  BELL_HOST,
  BELL_PUBKEY_PATH,
  type BellServedRun,
  type BellShape,
} from "@/lib/bell-served-load";
import { Placeholder } from "@/components/placeholder";

export const metadata: Metadata = {
  title: "Bell · method · MONARK",
  description:
    "The MONARK Bell method: session bounds, the reference close day, formulas, periods and the closed list of residuals, then the public key, how to check a line, the anchors and the replay code. Definitions pinned to the collector source.",
  icons: { icon: [{ url: "/icons/bell.svg", type: "image/svg+xml" }] },
};

// /bell/method — the page the comment letter points to (mock bell-method.html). Every definition shown here is
// pinned to the collector source (apps/bell/src) by the root test bell_method_facts_match_collector: the session
// bounds and the calendar are READ from lib/bell-method.ts (never typed as literals here), the decimals too; the
// residual list must cover the collector's closed list, and a code still marked upcoming must not be in it. Every
// served value (the key, the digests, the periods, the residual counts, the served schema, the thresholds named by the
// served gap rows or the publisher's closed list, the collector revision) is READ from apps/site/data/bell-served.json
// (lib/bell-served-load.ts); values that do not exist yet are named placeholders; sentences that need a path not served
// yet are in the future tense. Section ordinals are words, not digits. The volume-ratio formula is restated in the words of
// this page (lib/bell-method.ts), pinned clause by clause to the served string. The latest published record's timestamp state is derived
// from the bound publication rows (publicationAnchorState) and worded once (publicationAnchorSentence); the manifest keys shown are read
// from the served manifest.
/** A run's served counter for a residual code; a code without a counter throws (never a default count). */
function countOf(run: BellServedRun, code: string): number {
  const n = run.residuals[code];
  if (n === undefined) throw new Error(`bell method page: the served run carries no counter for ${code}`);
  return n;
}

function Residuals({ items, runs, upcoming = false }: { items: readonly BellResidual[]; runs: readonly BellServedRun[]; upcoming?: boolean }) {
  return (
    <>
      {items.map((r) => (
        <div key={r.code} className="c-residual-row">
          <span>
            <span className={upcoming ? "c-tag c-tag--next" : "c-tag"}>{r.code}</span>{" "}
            {upcoming ? null : (
              <span className="c-mono c-small">
                {runs.map((run) => `${run.records.map((x) => x.symbol).join(" · ")} ${String(countOf(run, r.code))}`).join(" · ")}
              </span>
            )}
          </span>
          <span className="c-muted c-small">{r.gloss}</span>
        </div>
      ))}
    </>
  );
}

/** One served object of the publisher's closed list, as a line: name { key, key: shape, … }. */
function schemaLine(name: string, shapes: Readonly<Record<string, BellShape>>): string {
  const keys = Object.entries(shapes).map(([k, sh]) =>
    sh === "scalar" ? k : sh === "scalar[]" ? `${k}: [ ]` : typeof sh === "string" ? `${k}: ${sh}` : `${k}: [${sh[0]}]`,
  );
  return `${name.padEnd(15)} { ${keys.join(", ")} }`;
}

export default function BellMethodPage() {
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (!bell) throw new Error("bell method page: MONARK Bell is absent from PRODUCTS (lib/fleet.ts)");
  const anchors = loadAnchors();
  const served = loadBellServed(bellServedRepoRoot(), BELL_RESIDUAL_CODES_LISTED);
  const pubkeyUrl = BELL_HOST + BELL_PUBKEY_PATH;
  const closures = BELL_CALENDAR.fullClosures;
  const halfDays = BELL_CALENDAR.halfDays;
  const head = served.head;
  const runs = head.runs;
  const symbolsOf = (run: BellServedRun): string => run.records.map((x) => x.symbol).join(" · ");
  const sessions = runs.flatMap((r) => r.sessions);
  const withGap = sessions.filter((x) => x.gT !== null).length;
  const allNoClose = sessions.length > 0 && sessions.every((x) => x.abstain === "no_close_ref");
  const abstentions = abstentionsOf(sessions).join(", ");
  const servedThresholds = [...new Set(sessions.flatMap((x) => x.exceed.map((e) => e.threshold)))].sort((a, b) => a - b);
  const thresholds = servedThresholds.length > 0 ? servedThresholds : thresholdsOf(Object.keys(served.served_schema.objects.gap ?? {}));
  const hasVolume = runs.some((r) => r.volume.length > 0);
  const periods = [...new Set(runs.flatMap((r) => r.volume.map((v) => `${String(v.adv_period.year)}-${String(v.adv_period.month).padStart(2, "0")}: ${String(v.n_bars)} daily bars for ${String(v.n_trading_days)} trading days`)))];
  const residualSum = runs.reduce((a, r) => a + Object.values(r.residuals).reduce((x, y) => x + y, 0), 0);
  const listed = new Set(BELL_RESIDUAL_CODES_LISTED);
  for (const run of runs) for (const code of Object.keys(run.residuals)) if (!listed.has(code)) throw new Error(`bell method page: served residual ${code} is not in the page's list`);
  const key = served.keyring.keys.find((k) => k.key_id === head.key_id);
  const pubs = loadPublications(served.lines), anchorState = publicationAnchorState(served.head, served.lines, pubs.bound), keyed = pubs.bound[pubs.bound.length - 1];
  const [prefixKey, lineKey] = (keyed?.entries ?? []).map((e) => e.relpath).filter((r) => r.startsWith("timeline.jsonl#"));
  const symbols = [...new Set(runs.flatMap((r) => r.records.map((x) => x.symbol)))];
  const ss = served.served_schema;
  const schemaText = [
    `${"state.json".padEnd(15)} { ${ss.state_file.join(", ")} }   runs: one state per run`,
    `${"provenance.json".padEnd(15)} { ${ss.provenance_file.join(", ")} }   runs: one provenance per run`,
    `${"timeline line".padEnd(15)} { ${ss.timeline_line.join(", ")} }`,
    `${"line run".padEnd(15)} { ${ss.timeline_run.join(", ")} }   records: [record]`,
    ...Object.entries(ss.objects).map(([name, shapes]) => schemaLine(name, shapes)),
  ].join("\n");
  const rev = served.collector_revision;

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
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              The record has no closing-price field, and the close source is described here, not named.{" "}
              {withGap > 0
                ? `In the latest record a gap is computed for ${String(withGap)} of its ${String(sessions.length)} session rows.`
                : allNoClose
                  ? "In the latest record no close is read: each of its sessions abstains with no_close_ref."
                  : `In the latest record no gap is computed: its session rows abstain (${abstentions}).`}
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="formulas" aria-labelledby="l-formulas">
        <span className="c-label" id="l-formulas">formulas · exact integer arithmetic, decimals carried to {BELL_DECIMALS} places</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">Fills</h2>
            <p className="c-muted">
              A fill is one swap in one observed pool, read from the ledger: base delta b (units of the tokenized equity) and quote delta q
              (quote units), with the block time. Fills are <b>counted once per transaction signature</b>, so an aggregator
              route through a pool appears once. A session with no fill abstains with{" "}
              <span className="c-mono">no_fill_in_window</span>.
            </p>
            <h2 className="c-h2" style={{ marginTop: 16 }}>Price per share and gap</h2>
            <pre className="c-formula">{`m(t)       = shares per unit at block time t
             (on-chain multiplier)
VWAP_share = Σ |q_i|  /  Σ ( |b_i| · m(t_i) )
g          = ln ( VWAP_share / P_close )
exceeds(θ) = | VWAP_share − P_close | / P_close > θ`}</pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              θ takes each threshold named by{" "}
              {servedThresholds.length > 0 ? "the served gap rows" : "the publisher's closed list of gap keys"}:{" "}
              {thresholds.map((k) => `${String(k)} percent`).join(", ")}
              {servedThresholds.length === 0 ? " (no gap is served yet)" : ""}. P_close is the
              reference close of the day given under <a href="#refclose">reference close day</a>. When the multiplier is one
              over the whole pool window, the unrebased path is used. When the multiplier history is known and differs from
              one, the per-fill form above is used and the session carries <span className="c-mono">multiplier_unit</span>.
              When the multiplier could not be established as constant or known, the session abstains with{" "}
              <span className="c-mono">rebase_unverified</span>.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Volume ratio</h2>
            {hasVolume ? (
              <pre className="c-formula">{BELL_VOL_RATIO_FORMULA_DISPLAY}</pre>
            ) : (
              <p className="c-muted">No volume entry is served in the latest record.</p>
            )}
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              The block above restates, clause by clause and in the words of this page, the formula string carried in each
              volume entry of the served state; the restatement is pinned to that string by a test. The numerator is the
              session&rsquo;s own fills, the denominator the month before the session date. The record has no
              consolidated-volume field; a denominator that cannot be established produces no ratio and a named residual (
              <span className="c-mono">no_adv</span>, <span className="c-mono">no_multiplier</span>), never a fabricated ratio.
              The ratio values are not rendered on this site.
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
              Per session: the session&rsquo;s own pool fills, counted once per transaction, from its first fill to its last
              (the session window, served with each entry). The run&rsquo;s observation window, in ledger time (UTC,{" "}
              <span className="c-mono">state.window.from_utc_ms</span> to <span className="c-mono">state.window.to_utc_ms</span>):{" "}
              {runs.map((r) => `${symbolsOf(r)} ${utcSeconds(r.window.from_utc_ms)} → ${utcSeconds(r.window.to_utc_ms)}`).join(" · ")}.
              The numerator is set against a daily denominator; the unit is stated in the served formula.
            </p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">Ratio denominator</h3>
            <p className="c-muted">
              The <b>calendar month before the session date</b>, served as{" "}
              <span className="c-mono">{"adv_period { year, month }"}</span>: {periods.join(" · ") || "no period served"}. The
              daily bars (<span className="c-mono">n_bars</span>) must cover exactly the month&rsquo;s trading days (
              <span className="c-mono">n_trading_days</span>), or the session&rsquo;s ratio abstains with{" "}
              <span className="c-mono">no_adv</span>; the <span className="c-mono">formula</span> string is carried in each entry.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="residuals" aria-labelledby="l-residuals">
        <span className="c-label" id="l-residuals">residuals · the closed list; each one counted in state.json</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">Sessions and reads</h2>
            <Residuals items={BELL_RESIDUALS_SESSIONS} runs={runs} />
            <h2 className="c-h2" style={{ marginTop: 16 }}>Volume ratio</h2>
            <Residuals items={BELL_RESIDUALS_VOLUME} runs={runs} />
          </div>
          <div className="c-card">
            <h2 className="c-h2">Halts, reserves, wrappers</h2>
            <Residuals items={BELL_RESIDUALS_HALTS_RESERVES} runs={runs} />
            {BELL_RESIDUALS_UPCOMING.length > 0 ? (
              <>
                <h2 className="c-h2" style={{ marginTop: 16 }}>
                  Not in the collector yet <span className="c-tag c-tag--next">upcoming</span>
                </h2>
                <Residuals items={BELL_RESIDUALS_UPCOMING} runs={runs} upcoming />
              </>
            ) : null}
          </div>
        </div>
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          A residual is a named reason the collector could not produce a clean fact. Each code has one runtime source; a
          session carries its codes as words next to the number it qualifies, and each run&rsquo;s{" "}
          <span className="c-mono">residuals</span> object in <span className="c-mono">state.json</span> counts every code of
          the list. The counts beside each code are the latest record&rsquo;s, per instrument, as read from the host at{" "}
          {served.read_at} (UTC), when this page&rsquo;s data was last written; the served counters sum to {residualSum}.
        </p>
      </section>

      <section className="c-section" id="digest" aria-labelledby="l-digest">
        <span className="c-label" id="l-digest">digest and chain · the served schema, read from the publisher&rsquo;s closed list</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">What a published file contains</h2>
            <pre className="c-code">{schemaText}</pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              The first four lines are the key lists of the files and of the signed line as served; the others are the
              publisher&rsquo;s closed list of objects (a key outside its object, or an object outside the list, is refused
              before publication). A scalar key is written bare, <span className="c-mono">[ ]</span> is a list of scalars and a
              name is another object of the list. Schemas served: timeline <span className="c-mono">{served.timeline.schema}</span>,
              state file <span className="c-mono">{head.state_schema}</span>, run{" "}
              <span className="c-mono">{[...new Set(runs.map((r) => r.schema))].join(", ")}</span>, digest{" "}
              <span className="c-mono">{[...new Set(runs.map((r) => r.digest_schema))].join(", ")}</span>, provenance file{" "}
              <span className="c-mono">{head.provenance_schema}</span>, key set <span className="c-mono">{served.keyring.schema}</span>.
              Close values, reference prices and consolidated volumes (a numeric value under any key naming a close, a
              reference price, an average daily volume or a share volume) are refused by the digest guard; the on-chain VWAP
              and base volume are carried.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Chaining</h2>
            <ol className="c-ol">
              <li><b>Canonical bytes.</b> The digest object is serialised with sorted keys and no whitespace; <span className="c-mono">bell_sha</span> is its hash.</li>
              <li><b>Journal.</b> Each line of the collection journal carries the hash of the previous line&rsquo;s canonical bytes; a removed or edited line breaks the chain at recomputation.</li>
              <li>
                <b>Timeline.</b> <span className="c-mono">timeline.jsonl</span> is append-only; each line carries the previous
                line&rsquo;s hash and a signature over its canonical bytes. The first line&rsquo;s previous-line hash is the
                genesis value <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{served.first_record.prev_line_hash}</span>;
                the latest line is of kind <span className="c-mono">{head.kind}</span>, signed{" "}
                <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{head.sig}</span>.
              </li>
              <li>
                <b>Provenance.</b> A separate file carries, per run, the start of the collection, the operators behind the reads
                and the quorum, the faults logged and the digest of the closing-price request. It travels beside the digest and is
                not hashed into it; the signed line names its SHA-256.
              </li>
              <li>
                <b>Manifests.</b> At each start, end and resumption of the counter-verification run of the multiplier history, a
                manifest lists the run&rsquo;s artifacts with their hashes, sorted, one per line; the manifest is what gets
                anchored (see{" "}
                <a href="#anchors">anchors</a>). The latest published record&rsquo;s timestamp status is stated under anchors, below; it
                is read from the proof file when one is served.
              </li>
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
              <dd style={{ overflowWrap: "anywhere" }}><a href={pubkeyUrl}>{pubkeyUrl}</a>, the one URL of the key; this site links it and serves no copy</dd>
              <dt>key_id</dt>
              <dd className="c-mono" style={{ overflowWrap: "anywhere" }}>{head.key_id}</dd>
              <dt>status</dt>
              <dd>
                {key ? `${key.status} from seq ${String(key.valid_from_seq)}` : "not in the key set"}, read from the committed keyring,
                byte-identical to the key set served as read at {served.read_at} (UTC)
              </dd>
              <dt>generated</dt>
              <dd>on the dedicated host from which the records are published, operated by MONARK</dd>
              <dt>backups</dt>
              <dd>
                a backup of the private key exists offline; restoring it is an exposure event, followed by an immediate
                counter-signed rotation of the key, journaled in the served timeline
              </dd>
              <dt>signs</dt>
              <dd>each line of <span className="c-mono">timeline.jsonl</span>, over the line&rsquo;s canonical bytes</dd>
              <dt>rotation</dt>
              <dd><Placeholder name="key_rotation_policy" state="to be published" /></dd>
            </dl>
          </div>
          <div className="c-card">
            <h2 className="c-h2">What a valid signature tells you</h2>
            <p className="c-muted">
              That the line was produced by the holder of this key, and that it has not been altered since. It says nothing
              about whether the line&rsquo;s content is true: truth is checked by recomputing the line from the ledger and from
              the reader&rsquo;s own close data (see <a href="#replay">replay code</a>). Independence from the venues and issuers
              measured: <Placeholder name="relation_commerciale" />; not independence from MONARK.
            </p>
          </div>
        </div>
        <div className="c-grid c-grid--2" style={{ marginTop: 20 }}>
          <div className="c-card">
            <h2 className="c-h2">How to check a line</h2>
            <pre className="c-code" style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
              {"node apps/bell/scripts/bell-verify.mjs --url " + BELL_HOST + " --keyring apps/bell/keys/bell-keyring.json"}
            </pre>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              Run from the MONARK source tree, the reader-side verifier re-derives the chain and every signature of the
              served timeline, the key schedule, and the binding of the state file to the head line. Its trust root is the
              committed keyring <span className="c-mono">apps/bell/keys/bell-keyring.json</span>; the key served above is
              only a cross-checked channel. Its success status reads <span className="c-mono">consistent_with_supplied_keyring</span>;
              without a keyring it reports <span className="c-mono">self_consistent_only</span>, never an unqualified
              success. The verifier, the publisher, its chain library and the public keyring are in the{" "}
              <a href={BELL_PUBLIC_REPO_URL}>public repository</a>; the collector (replay code below) is not exported yet.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">Detectable by whom</h2>
            <p className="c-muted">
              A rewrite of the timeline is detectable by whoever keeps an earlier copy: the operator&rsquo;s mirror, whose
              SHA-256 is recorded in the operator journal after each publication, and any third-party copy of{" "}
              <span className="c-mono">timeline.jsonl</span> or of the immutable state files. Keep a copy, and a later
              change to a published line shows at recomputation.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="anchors" aria-labelledby="l-anchors">
        <span className="c-label" id="l-anchors">anchors · public timestamps of the run&rsquo;s manifests and of the published records</span>
        <div className="c-grid c-grid--2">
          <div className="c-card">
            <h2 className="c-h2">What is anchored, and when</h2>
            <p className="c-muted">
              At each boundary of the counter-verification run of the multiplier history of {anchors.mints.join(", ")} (the end
              of the probe, the start, each resumption and the end of each instrument&rsquo;s enumeration, and the final
              state), the boundary&rsquo;s manifest is submitted to OpenTimestamps. The proof is pending first, then upgraded to
              a Bitcoin attestation.
            </p>
            <dl className="c-kv" style={{ marginTop: 12 }}>
              <dt>manifests and proofs</dt>
              <dd><Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link></dd>
              <dt>lines in the register</dt>
              <dd>{anchors.rows.length} ({anchors.proofs} with a proof, {anchors.withoutProof} without)</dd>
              <dt>proofs with a Bitcoin record</dt>
              <dd>{anchors.withBitcoin} of {anchors.proofs}, read from the proof files when this page was built</dd>
              <dt>the latest published record</dt>
              <dd>{publicationAnchorSentence(anchorState)}</dd>
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
          <div className="c-card">
            <h2 className="c-h2">Anchors of published records</h2>
            <p className="c-muted">
              For each timestamped line of the timeline, a manifest lists the line&rsquo;s hash, the hash of the timeline up to that line
              and, for a publication, the digests of the two files the line names. The manifest&rsquo;s SHA-256 is submitted to
              OpenTimestamps. The proof is pending first; once a calendar has included it in a Bitcoin block, the proof file records that
              block.
            </p>
            <p className="c-muted">
              <b>Check one yourself.</b> Download the manifest and its proof. Hash line n of the timeline without its line feed: it must
              equal the manifest&rsquo;s line digest. Hash the first n lines with their line feeds: it must equal the manifest&rsquo;s prefix
              digest. Hash the manifest: it must equal the digest the proof carries. Run an open OpenTimestamps client on the proof against
              a Bitcoin node of your choice: it names the block before which the manifest existed. No MONARK account, key or software is
              needed for that check; the files are public, any copy serves. The signature check is a separate step.
            </p>
            <p className="c-muted">
              <b>Bound.</b> An anchor shows that the line, and every line before it, existed before that block. It does not show that the
              facts are true, when the record was published, when its data was collected, or that no other line was ever timestamped. A
              pending proof depends on a calendar until it records a block.
            </p>
            <p className="c-muted">
              In a manifest, the line key hashes that one line without its line feed: its digest is the line&rsquo;s hash. The prefix key
              hashes every line from the first to that one, each with its line feed.
              {keyed !== undefined && lineKey !== undefined && prefixKey !== undefined ? (
                <>
                  {" "}The served manifest of line {keyed.row.seq} carries <code>{lineKey}</code> and <code>{prefixKey}</code>.
                </>
              ) : null}
            </p>
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
              {runs.map((r) => (
                <div key={r.bell_sha} style={{ display: "contents" }}>
                  <dt>published digest · {symbolsOf(r)}</dt>
                  <dd className="c-mono" style={{ overflowWrap: "anywhere" }}>{r.bell_sha}</dd>
                </div>
              ))}
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
            <p className="c-muted">
              Designed for four symbols of one family of tokenized equities on one chain, outside the TSV framework, over the
              stated windows; the latest published record covers {symbols.join(", ")}. Results do not extend to other
              instruments, chains or venues.
            </p>
          </div>
          <div className="c-card">
            <h3 className="c-h3">Not a certification</h3>
            <p className="c-muted">Bell is neither a TSV nor a Covered Firm; it assesses compliance with no condition of any order. Its records describe on-chain activity in the observed pools.</p>
          </div>
        </div>
        <dl className="c-kv" style={{ marginTop: 20 }}>
          <dt>this page</dt>
          <dd>
            version dated {rev.committed_at.slice(0, 10)}, the date of the collector source revision it restates,{" "}
            <span className="c-mono">{rev.commit.slice(0, 7)}</span>
          </dd>
          <dt>contact</dt>
          <dd><BellContact href="/bell#request-a-symbol" /></dd>
        </dl>
      </section>
    </main>
  );
}
