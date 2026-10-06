import type { Metadata } from "next";
import Link from "next/link";
import { BellScene } from "@/components/bell-scene";
import { PRODUCTS } from "@/lib/fleet";
import { loadAnchors, loadPublications, ANCHORS_ROUTE } from "@/lib/bell-anchors-load";
import { publicationAnchorState, publicationAnchorSentence } from "@/lib/bell-anchors";
import { AnchorsTable } from "@/components/bell/anchors-table";
import { BellContact } from "@/components/bell/contact";
import { BellRequestSection } from "@/components/bell/request-section";
import { Placeholder } from "@/components/placeholder";
import { TERMS_ROUTE, PRIVACY_ROUTE } from "@/lib/bell-legal";
import { BELL_RESIDUAL_CODES_LISTED, BELL_PUBLIC_REPO_URL, porGloss } from "@/lib/bell-method";
import {
  loadBellServed,
  bellServedRepoRoot,
  bellStatePathOf,
  thresholdsOf,
  shiftDecimal,
  utcSeconds,
  sessionRowsOf,
  abstentionsOf,
  BELL_HOST,
  BELL_TIMELINE_PATH,
  BELL_STATE_PATH,
  BELL_PUBKEY_PATH,
  BELL_GENESIS,
  type BellServedRun,
  type BellServedVolume,
} from "@/lib/bell-served-load";

// Static metadata only (no generateMetadata); digit-free (honesty lint §6b). Favicon = a static public asset
// OUTSIDE /bell/ (the /narabi precedent: a future Caddy handle_path /bell/* must not shadow it).
export const metadata: Metadata = {
  title: "Bell · MONARK",
  description:
    "MONARK Bell: a public, signed record of how tokenized U.S. equities trade on a public ledger while U.S. markets are closed, served on its own host. A gap per session when its closing price can be read, a named abstention when it cannot, a signed and hash-chained timeline. Never a score, never a probability of being right.",
  icons: { icon: [{ url: "/icons/bell.svg", type: "image/svg+xml" }] },
};

const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many);
const monthOf = (p: { year: number; month: number }): string => `${String(p.year)}-${String(p.month).padStart(2, "0")}`;

/** The denominator periods a run's volume entries name, one line per distinct period (read, never typed). */
function periodsOf(volume: readonly BellServedVolume[]): string[] {
  return [...new Set(volume.map((v) => `${monthOf(v.adv_period)} (${String(v.n_bars)} daily bars for ${String(v.n_trading_days)} trading days)`))];
}

/** One run of the latest publication: its signed record, the per-session rows and every other served field. */
function RunCard({ run, seq, publishedAt, readAt }: { run: BellServedRun; seq: number; publishedAt: string; readAt: string }) {
  const symbols = run.records.map((r) => r.symbol);
  const nonZero = Object.entries(run.residuals).filter(([, v]) => v > 0);
  const zero = Object.keys(run.residuals).length - nonZero.length;
  const allAbstain = run.sessions.every((s) => s.gT === null);
  const allNoClose = run.sessions.length > 0 && run.sessions.every((s) => s.abstain === "no_close_ref");
  return (
    <div className="c-card c-card--accent">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <span className="c-label" style={{ color: "var(--token-print)" }}>
          the latest record · {symbols.join(" · ")} · seq {seq}
        </span>
        <span className="c-pill c-pill--fact">read from the served files bound to the signed line</span>
      </div>
      {run.records.map((rec) => (
        <p key={rec.symbol} className="c-muted c-small" style={{ marginTop: 8 }}>
          Observation window (ledger time) {utcSeconds(run.window.from_utc_ms)} → {utcSeconds(run.window.to_utc_ms)} UTC ·
          collection started {run.provenance.generated_at} (UTC), published {publishedAt} (UTC) · {rec.n_fills} fills over {rec.sessions}{" "}
          {plural(rec.sessions, "session", "sessions")} on {rec.chain} · quorum coverage {rec.quorum_coverage ?? "not stated"} (share of transaction
          bodies read on both operators) · bell_sha{" "}
          <span className="c-mono" title={run.bell_sha}>
            {run.bell_sha.slice(0, 16)}…
          </span>
        </p>
      ))}
      <div className="c-board" style={{ marginTop: 12 }}>
        <div className="c-board-scroll">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">instrument</th>
                <th className="c-label">session · regime</th>
                <th className="c-label">session date (ET)</th>
                <th className="c-label">first fill → last fill (UTC)</th>
                <th className="c-label c-num">fills</th>
                <th className="c-label c-num">on-chain VWAP (quote per unit)</th>
                <th className="c-label c-num">base volume (units)</th>
                <th className="c-label c-num">g = ln(P<sub>session</sub> / P<sub>close</sub>)</th>
                <th className="c-label">residual</th>
              </tr>
            </thead>
            <tbody>
              {sessionRowsOf(run).map(({ session: x, volume: vol }) => {
                // Paired by index (the loader checked the pairing); the session date keeps two same-named rows apart.
                return (
                  <tr key={`${x.symbol}-${x.session}-${x.regime ?? ""}-${vol.session_date_et}`}>
                    <td><b style={{ color: "var(--token-print)" }}>{x.symbol}</b></td>
                    <td>{x.session}{x.regime !== null && x.regime !== x.session ? ` · ${x.regime}` : ""}</td>
                    <td>{vol.session_date_et}</td>
                    <td className="c-mono">{`${utcSeconds(vol.window.from_utc_ms)} → ${utcSeconds(vol.window.to_utc_ms)}`}</td>
                    <td className="c-num">{x.n}</td>
                    <td className="c-num c-mono">{x.vwap}</td>
                    <td className="c-num c-mono">{x.volumeBase}</td>
                    <td className="c-num">
                      {x.gT !== null ? (
                        <span className="c-mono">
                          {x.gT}
                          {x.exceed.some((e) => e.exceeded > 0)
                            ? ` · beyond ${x.exceed.filter((e) => e.exceeded > 0).map((e) => `${String(e.threshold)} percent`).join(", ")}`
                            : ""}
                        </span>
                      ) : (
                        <span className="c-abstain">abstained: {x.abstain}</span>
                      )}
                    </td>
                    <td>
                      {x.abstain !== null ? <span className="c-tag">{x.abstain}</span> : "—"}
                      {x.rebase_residuals.map((r) => (
                        <span key={r} className="c-tag" style={{ marginLeft: 4 }}>{r}</span>
                      ))}
                      {x.cash_cross !== null ? <span className="c-small c-muted"> close cross-read: {x.cash_cross}</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <p className="c-muted c-small" style={{ marginTop: 10 }}>
        Every value above is copied from the served files bound to the signed line: the line itself, and the state file
        and the provenance file it names by SHA-256, as read at {readAt} (UTC) and hashed in the site manifest; nothing is
        typed by hand. VWAP and base volume are session aggregates of on-chain fills, not a price feed.{" "}
        {allAbstain
          ? allNoClose
            ? "The gap column abstains on every session: no closing price is read into this record."
            : `The gap column abstains on every session (${abstentionsOf(run.sessions).join(", ")}).`
          : "A gap is shown where one is computed from the closing price of the session's reference day; the other sessions abstain with their named residual."}{" "}
        Run residuals:{" "}
        {nonZero.map(([k, v], idx) => (
          <span key={k}>{idx > 0 ? " · " : ""}<span className="c-tag">{k}</span> {v}</span>
        ))}
        {nonZero.length > 0 ? "; " : ""}the other {zero} {plural(zero, "code counts", "codes count")} zero (every code:{" "}
        <Link href="/bell/method#residuals">method · residuals</Link>).
      </p>
      <dl className="c-kv" style={{ marginTop: 12 }}>
        <dt>volume ratio</dt>
        <dd>
          per session, against the calendar month before the session date: {periodsOf(run.volume).join(" · ") || "no period served"}; the
          formula and its unit are served with each entry (<Link href="/bell/method#periods">method · periods</Link>); the ratio values are
          not rendered on this page
        </dd>
        {run.supply.map((s) => (
          <div key={`supply-${s.symbol}`} style={{ display: "contents" }}>
            <dt>supply · {s.symbol}</dt>
            <dd>
              {shiftDecimal(s.supply, s.decimals)} units on-chain (raw {s.supply}, {s.decimals} decimals) · shares per unit {s.multiplier} ·{" "}
              {s.paused ? "paused" : "not paused"} ·{" "}
              {s.permanent_delegate === null ? (
                "no permanent-delegate authority on the mint, as read on-chain"
              ) : (
                <>
                  the mint&rsquo;s permanent-delegate authority, as read on-chain:{" "}
                  <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{s.permanent_delegate}</span>
                </>
              )}
            </dd>
          </div>
        ))}
        {run.por.map((p) => (
          <div key={`por-${p.symbol}`} style={{ display: "contents" }}>
            <dt>reserves · {p.symbol}</dt>
            <dd>
              {porGloss(p.kind)}
              {p.age_sec !== null ? ` (age ${String(p.age_sec)} s)` : ""}
            </dd>
          </div>
        ))}
        {run.wrapper.map((w) => (
          <div key={`wrapper-${w.symbol}`} style={{ display: "contents" }}>
            <dt>wrapper or bridge contracts · {w.symbol}</dt>
            <dd>
              {w.contracts.length === 0 ? "none named" : w.contracts.join(" · ")} ({w.residue})
            </dd>
          </div>
        ))}
        <dt>halts in the window</dt>
        <dd>
          {run.halt_census.total} · with an empty resume: {run.halt_census.empty_resume} ·{" "}
          {run.halt_deltas.length === 0
            ? "no halt delta in this run"
            : run.halt_deltas
                .map((h) => `${h.symbol} ${h.reason_family}: ${h.n_fills_in_window} fills between ${h.halt_utc_ms === null ? "an unknown halt" : utcSeconds(h.halt_utc_ms)} and ${h.resume_utc_ms === null ? "an unknown resume" : utcSeconds(h.resume_utc_ms)} UTC`)
                .join(" · ")}
        </dd>
        <dt>operators</dt>
        <dd>
          {run.provenance.providers_distinct} distinct behind the read quorum, {run.provenance.quorum_required} required
        </dd>
        <dt>faults logged</dt>
        <dd>
          {run.provenance.faults.length === 0
            ? "none"
            : run.provenance.faults.map((f) => `${f.status} (${f.ledger_operator ? "on an operator of the read quorum" : "outside the read quorum"})`).join(" · ")}
        </dd>
        <dt>closing-price request</dt>
        <dd>
          {run.provenance.cash_request_digest === null ? (
            "none logged"
          ) : (
            <>
              logged by its digest <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{run.provenance.cash_request_digest}</span>
            </>
          )}
        </dd>
        {run.provenance.cash_cross_mismatch_days.length + run.provenance.cash_cross_unavailable_days.length > 0 ? (
          <>
            <dt>close cross-read</dt>
            <dd>
              mismatch: {run.provenance.cash_cross_mismatch_days.join(" · ") || "none"} · unavailable:{" "}
              {run.provenance.cash_cross_unavailable_days.join(" · ") || "none"}
            </dd>
          </>
        ) : null}
        <dt>schemas</dt>
        <dd>
          run <span className="c-mono">{run.schema}</span> · digest <span className="c-mono">{run.digest_schema}</span>
        </dd>
      </dl>
    </div>
  );
}

// /bell — the application page (charter C mock bell.html). HONESTY:
// the status is read from the register (lib/fleet.ts); every fact about the served host and its records (host paths,
// key, first record, latest publication and every run in it, residual counts, deploy check) is READ from
// apps/site/data/bell-served.json (lib/bell-served-load.ts, hashed, written from the served files by
// scripts/sync-bell-served.mjs), never typed; the anchors table and its statuses are READ from the served anchor files at build
// time (lib/bell-anchors-load.ts), and the latest record's timestamp state from the bound publication rows (publicationAnchorState,
// worded once by publicationAnchorSentence in lib/bell-anchors.ts). Figures that are not served stay NAMED
// placeholders; sentences about a path that is not served are in the future tense. The volume-ratio values are served by
// the host but not rendered here (their display is suspended); the record has no closing-price or consolidated-volume field.
// Served facts are dated by the instant they were read (read_at); wording about closes branches on the served abstentions.
export default function BellPage() {
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (!bell) throw new Error("bell page: MONARK Bell is absent from PRODUCTS (lib/fleet.ts) — the register is the single source of its status");
  const anchors = loadAnchors();
  const served = loadBellServed(bellServedRepoRoot(), BELL_RESIDUAL_CODES_LISTED);
  const head = served.head;
  const first = served.first_record;
  const runs = head.runs;
  const sessions = runs.flatMap((r) => r.sessions);
  const withGap = sessions.filter((s) => s.gT !== null);
  const noClose = sessions.filter((s) => s.abstain === "no_close_ref");
  const allNoClose = sessions.length > 0 && noClose.length === sessions.length;
  const abstentions = abstentionsOf(sessions).join(", ");
  const symbols = [...new Set(runs.flatMap((r) => r.records.map((x) => x.symbol)))];
  const key = served.keyring.keys.find((k) => k.key_id === head.key_id);
  const anchorState = publicationAnchorState(served.head, served.lines, loadPublications(served.lines).bound);
  const sameLine = head.seq === first.seq;
  const codes = Object.keys(runs[0]?.residuals ?? {}).length;
  const servedThresholds = [...new Set(sessions.flatMap((s) => s.exceed.map((e) => e.threshold)))].sort((a, b) => a - b);
  const thresholds = servedThresholds.length > 0 ? servedThresholds : thresholdsOf(Object.keys(served.served_schema.objects.gap ?? {}));
  const outside = runs.flatMap((r) => r.provenance.faults.filter((f) => !f.ledger_operator));
  const onOperators = runs.flatMap((r) => r.provenance.faults.filter((f) => f.ledger_operator));
  const requestDigests = runs.flatMap((r) => (r.provenance.cash_request_digest === null ? [] : [r.provenance.cash_request_digest]));
  const coverage = runs.flatMap((r) => r.records.map((x) => `${x.symbol} ${x.quorum_coverage ?? "not stated"}`));
  const windows = runs.map((r) => `${r.records.map((x) => x.symbol).join(" · ")}: ${utcSeconds(r.window.from_utc_ms)} → ${utcSeconds(r.window.to_utc_ms)} UTC`);
  const periods = [...new Set(runs.flatMap((r) => periodsOf(r.volume)))];
  const dc = served.deploy_check;

  return (
    <main className="c-main">
      {/* Hero: the text and the scene side by side, one block, no frame (investor, 2026-09-24). The scene is the
          native BellScene component (components/bell-scene.tsx), no iframe: its loop pauses out of view. */}
      <div className="c-hero c-hero--bell">
        <div className="c-hero__text">
          <span className={bell.status === "built" ? "c-pill c-pill--built" : "c-pill c-pill--upcoming"}>{bell.status}</span>
          <h1 className="c-h1" style={{ marginTop: 12 }}>
            While New York is closed, tokenized equities keep printing. Bell writes down what it reads, signed, and names what it could not.
          </h1>
          <p className="c-lede">
            A public, signed record of how tokenized U.S. equities trade on a public ledger, in particular while U.S.
            markets are closed, written so that anyone can recompute it. The host is served and, as read at {served.read_at}{" "}
            (UTC), its timeline holds {served.timeline.publications} signed{" "}
            {plural(served.timeline.publications, "publication", "publications")}; how to check a line, and against which key
            set, is on the method page.{" "}
            {withGap.length > 0
              ? `The latest record carries a gap for ${String(withGap.length)} of its ${String(sessions.length)} session rows.`
              : allNoClose
                ? "The latest record carries no gap: no closing price is read into it (what is missing, below)."
                : `The latest record carries no gap: its session rows abstain (${abstentions}).`}{" "}
            Never a score, never a probability of being right.
          </p>
          <div className="c-legend" aria-hidden="true">
            <span><i style={{ background: "#FFFFFF", border: "1px solid var(--ink2)" }} />tokenized equities, day side</span>
            <span><i style={{ background: "var(--cash-close)" }} />cash market quoting</span>
            <span><i style={{ background: "var(--token-print)" }} />tokenized equities after the close</span>
            <span><i style={{ background: "var(--token-print)", borderRadius: "50%" }} />one dot, one session record</span>
          </div>
        </div>
        <BellScene className="c-bellscene" />
      </div>
      <nav className="c-toc" aria-label="On this page" style={{ marginTop: 18 }}>
        <a href="#served">served</a>
        <a href="#measures">what Bell measures</a>
        <a href="#properties">four properties</a>
        <a href="#anchors">anchors</a>
        <a href="#status">status</a>
        <a href="#conditions">conditions</a>
        <Link href="/bell/method">method</Link>
      </nav>

      <section className="c-section" id="served" aria-labelledby="l-served">
        <span className="c-label" id="l-served">served · the host, the key, the first record and the latest publication</span>
        <div className="c-grid c-grid--2">
          <div className="c-card c-card--prov">
            <dl className="c-kv">
              <dt>host</dt>
              <dd><a href={BELL_HOST}>{BELL_HOST}</a> · its root redirects to this page</dd>
              <dt>timeline</dt>
              <dd>
                <a href={BELL_HOST + BELL_TIMELINE_PATH}>{BELL_TIMELINE_PATH}</a> · append-only, one signed line per
                publication, each carrying the hash of the line before it · {served.timeline.lines}{" "}
                {plural(served.timeline.lines, "line", "lines")}, schema <span className="c-mono">{served.timeline.schema}</span>
              </dd>
              <dt>state</dt>
              <dd>
                <a href={BELL_HOST + BELL_STATE_PATH}>{BELL_STATE_PATH}</a> · the latest published state, schema{" "}
                <span className="c-mono">{head.state_schema}</span> · SHA-256{" "}
                <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{head.state_sha256}</span>, named by the signed line ·{" "}
                <a href={BELL_HOST + bellStatePathOf(head.state_sha256)}>its immutable copy</a>
              </dd>
              <dt>provenance</dt>
              <dd>
                SHA-256 <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{head.provenance_sha256}</span>, named by the
                signed line; the provenance file travels beside the state (<Link href="/bell/method#digest">method · digest and chain</Link>)
              </dd>
              <dt>public key</dt>
              <dd>
                <a href={BELL_HOST + BELL_PUBKEY_PATH}>{BELL_PUBKEY_PATH}</a> · key_id{" "}
                <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{head.key_id}</span>
                {key ? ` · ${key.status} from seq ${String(key.valid_from_seq)}` : ""}
              </dd>
              <dt>first record</dt>
              <dd>seq {first.seq} · published {first.published_at} (UTC) · {first.symbols.join(" · ")}</dd>
              <dt>its line hash</dt>
              <dd className="c-mono" style={{ overflowWrap: "anywhere" }}>{first.line_hash}</dd>
              <dt>latest publication</dt>
              <dd>
                {sameLine ? (
                  <>the first record (seq {head.seq}) · {symbols.join(" · ")} · the latest as read at {served.read_at} (UTC)</>
                ) : (
                  <>
                    seq {head.seq} · published {head.published_at} (UTC) · {symbols.join(" · ")} · the latest as read at{" "}
                    {served.read_at} (UTC) · line hash{" "}
                    <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{head.line_hash}</span>
                  </>
                )}
              </dd>
              <dt>previous line hash</dt>
              <dd>
                <span className="c-mono" style={{ overflowWrap: "anywhere" }}>{head.prev_line_hash}</span>
                {head.prev_line_hash === BELL_GENESIS ? " (the genesis value: no line before it)" : ""}
              </dd>
              <dt>timestamp anchor</dt>
              <dd>{publicationAnchorSentence(anchorState)}</dd>
            </dl>
            <p className="c-muted c-small" style={{ marginTop: 10, overflowWrap: "anywhere" }}>
              Read from the served files at {served.read_at} (UTC), when this page&rsquo;s data was last written: timeline
              body SHA-256 <span className="c-mono">{served.bodies_sha256.timeline}</span>, key set SHA-256{" "}
              <span className="c-mono">{served.bodies_sha256.pubkey}</span>, state body SHA-256{" "}
              <span className="c-mono">{served.bodies_sha256.state}</span>, provenance body SHA-256{" "}
              <span className="c-mono">{served.bodies_sha256.provenance}</span>. The timeline grows with each publication; its
              first line does not change.
            </p>
          </div>
          <div className="c-card">
            <h2 className="c-h2">{withGap.length > 0 ? "The cash leg" : allNoClose ? "What is missing: the cash leg" : "No gap in the latest record"}</h2>
            <p>
              {withGap.length > 0
                ? `A gap is computed for ${String(withGap.length)} of the latest record's ${String(sessions.length)} session rows; the others abstain with their named residual.`
                : allNoClose
                  ? `No closing price is read into the latest record, so it carries no gap: ${String(noClose.length)} of its ${String(sessions.length)} session rows abstain with the named residual no_close_ref.`
                  : `The latest record carries no gap: its session rows abstain (${abstentions}).`}{" "}
              {requestDigests.length > 0 ? "Its provenance logs the closing-price request by its digest." : "Its provenance logs no closing-price request."}{" "}
              {`Faults logged: ${String(outside.length)} outside the read quorum (${outside.map((f) => f.status).join(", ") || "none"}), ${String(onOperators.length)} on its operators.`}
            </p>
            <p style={{ marginTop: 10 }}>
              What it holds is the on-chain side read from the ledger, per session: fills, volume-weighted average and base
              volume, and the volume-ratio periods (the ratio values are not rendered on this page); then the supply, reserve
              and wrapper readings, the halt census and every residual count, signed and chained.
            </p>
            <p className="c-muted c-small" style={{ marginTop: 10 }}>
              A signature attests origin, not truth: it shows that the holder of this key published these bytes, not that
              they are right. How to check a line: <Link href="/bell/method#key">method · public key</Link>.
            </p>
          </div>
        </div>
      </section>

      <section className="c-section" id="measures" aria-labelledby="l-measures">
        <span className="c-label" id="l-measures">
          what Bell measures · population and two facts{" "}
          <span className="c-tag c-tag--next">{withGap.length === 0 ? "latest record served · no gap in it" : "latest record served · gaps in it"}</span>
        </span>
        <div className="c-grid">
          <div className="c-card">
            <h2 className="c-h2">Population</h2>
            <ul className="c-list">
              <li>
                <span>+</span>
                <span>
                  <b>Designed for four tokenized equities.</b> TSLAx, AAPLx, NVDAx and SPYx, traded on public
                  automated-market-maker pools on Solana. In the latest published record: {symbols.join(", ")}. In the
                  counter-verification run of the multiplier history (anchors, below): {anchors.mints.join(", ")}.
                </span>
              </li>
              <li>
                <span>+</span>
                <span>
                  <b>Not a tokenization venue.</b> These pools are not a TSV under the Commission&rsquo;s order, and Bell makes
                  no representation that these instruments are Tokenized NMS Stock. The method, not this population, is designed to
                  apply to TSV pools.
                </span>
              </li>
              <li>
                <span>+</span>
                <span>
                  <b>Read from the ledger, on two operators.</b> Fills are read from the public chain; transaction bodies are
                  cross-read on a second operator on a deterministic sample (named residual{" "}
                  <span className="c-mono">quorum_sampled</span>). Share read on both for the latest record: {coverage.join(", ")}.
                  Fewer than two distinct answers is a named abstention, <span className="c-mono">no_quorum</span>.
                </span>
              </li>
              <li>
                <span>+</span>
                <span>
                  <b>Not a price feed.</b> A record carries session aggregates of on-chain fills, a gap where one is computed
                  from a closing price and a volume ratio where its denominator is established; it has no closing-price field
                  and no consolidated-volume field, and the ratio values it carries are not rendered on this site.
                </span>
              </li>
            </ul>
            <div className="c-feed" style={{ marginTop: 14 }} aria-hidden="true">
              <span className="c-sw c-sw--mint" />
              <span>on-chain prints of tokenized equities</span>
              <span className="c-sw c-sw--lav" />
              <span>last consolidated close</span>
              <span className="c-sw c-sw--ink" />
              <span>a named residual</span>
            </div>
          </div>

          {runs.map((run) => (
            <RunCard key={run.bell_sha} run={run} seq={head.seq} publishedAt={head.published_at} readAt={served.read_at} />
          ))}
        </div>

        <div className="c-grid c-grid--2" style={{ marginTop: 20 }}>
          <div className="c-card">
            <h2 className="c-h2">Fact one · the off-hours gap</h2>
            <p>
              For each session while the U.S. market is closed (weekday overnight, weekend, holiday), a record carries{" "}
              <span className="c-mono">g = ln(P_session / P_close)</span> when the closing price of its reference day is read:
              the volume-weighted average price of the instrument&rsquo;s on-chain fills, per underlying share, against the last
              consolidated closing price; otherwise a named abstention. The first-measurement report will give the share of
              sessions where the gap exceeds a threshold, with the count of sessions behind the share. Thresholds named by{" "}
              {servedThresholds.length > 0 ? "the served gap rows" : "the publisher's closed list of gap keys"}:{" "}
              {thresholds.map((k) => `${String(k)} percent`).join(", ")}
              {servedThresholds.length === 0 ? " (no gap is served yet)" : ""}.
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
              For each session, Bell computes the ratio of the volume in its observed pools, recomputed from on-chain swaps
              counted once per transaction and converted to shares with the on-chain shares-per-unit multiplier, to the
              underlying stock&rsquo;s consolidated average daily share volume over the calendar month before the session date.
              The ratio values are not rendered on this page.
            </p>
            <dl className="c-kv" style={{ marginTop: 12 }}>
              <dt>numerator</dt>
              <dd>per session, the session&rsquo;s own fills, from its first fill to its last (table above)</dd>
              <dt>observation window</dt>
              <dd>{windows.join(" · ")} (ledger time)</dd>
              <dt>denominator period</dt>
              <dd>{periods.join(" · ") || "no period served"}</dd>
              <dt>unit</dt>
              <dd>
                a fraction of one average trading day of the period, as the served formula states (
                <Link href="/bell/method#formulas">method · formulas</Link>); a multiplier other than one raises{" "}
                <span className="c-mono">multiplier_unit</span>
              </dd>
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
          four properties · what Bell applies to its own records; a part said in the future is not served yet{" "}
          <span className="c-tag c-tag--next">in part upcoming</span>
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
              <span className="c-mono">no_close_ref</span> for a missing closing price, and counts such cases in the published
              state file: each run counts every one of the {codes} codes of the closed list.
            </p>
          </div>
          <div className="c-card">
            <span className="c-label">03</span>
            <h3 className="c-h3" style={{ marginTop: 6 }}>Signed records, anchored collection logs</h3>
            <p>
              Each published record is signed and carries the hash of the line before it; a later edit is detectable by
              recomputation. The logs of the counter-verification run of the multiplier history are chained by SHA-256, and at
              each start, end and resumption a manifest of their digests is submitted to a public timestamp. The latest record&rsquo;s
              timestamp status is stated under served, above; it is read from the proof file when one is served.{" "}
              An anchor shows a log head existed before a Bitcoin block, not where its pages came from.
            </p>
          </div>
          <div className="c-card">
            <span className="c-label">04</span>
            <h3 className="c-h3" style={{ marginTop: 6 }}>Dated periods</h3>
            <p>
              Each gap is keyed to the trading day of its closing price by the rule stated in the method; each ratio carries its
              session window and its denominator&rsquo;s month, and the method describes the denominator&rsquo;s source without
              naming it, so that a miscalculation in either term can be located.
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
        <span className="c-label" id="l-anchors">
          anchors · the counter-verification run of the multiplier history of {anchors.mints.join(", ")}, one line per boundary
        </span>
        <AnchorsTable view={anchors} />
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          Read from the anchors register; dates, digests and commit identifiers are the register&rsquo;s own, sorted by time.
          Each manifest and each proof is served with the full register at{" "}
          <Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link>. These anchors timestamp the logs of that counter-verification run; the published
          records have their own register at <Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link>.{" "}
          The status column is what each proof file contains when this page was built, not a check against a Bitcoin node. An
          anchor shows that a log head existed before a Bitcoin block; it does not show where the pages came from, nor that the
          scan ran. The commit is a second, weaker witness (server date, same operator).
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
                  <td>the published state: per run, the observation window, the digest (per-session aggregates, gaps where one is computed, volume-ratio periods and values, supply, reserves, wrappers, halt census) and every residual count; the ratio values are not rendered here</td>
                  <td><span className="c-pill c-pill--built">served</span></td>
                  <td><a href={BELL_HOST + BELL_STATE_PATH}>{BELL_STATE_PATH}</a></td>
                </tr>
                <tr>
                  <td>timeline.jsonl</td>
                  <td>an append-only timeline, chained line by line, each line signed</td>
                  <td><span className="c-pill c-pill--built">served</span></td>
                  <td><a href={BELL_HOST + BELL_TIMELINE_PATH}>{BELL_TIMELINE_PATH}</a></td>
                </tr>
                <tr>
                  <td>public key (Ed25519)</td>
                  <td>the public half of the signing key, generated on the dedicated host</td>
                  <td><span className="c-pill c-pill--built">served</span></td>
                  <td><a href={BELL_HOST + BELL_PUBKEY_PATH}>{BELL_PUBKEY_PATH}</a></td>
                </tr>
                <tr>
                  <td>deploy check</td>
                  <td>
                    a one-off conformity check of the host by its operator, on the bodies read above: {dc.checks_passed} of{" "}
                    {dc.checks_total} controls passed{dc.tls_authorized ? ", TLS certificate chain accepted" : ", TLS certificate chain not accepted"}; a dated act, not a continuous monitor
                  </td>
                  <td><span className="c-pill c-pill--fact">dated</span></td>
                  <td>{dc.checked_at} (UTC)</td>
                </tr>
                <tr>
                  <td>method page</td>
                  <td>session bounds, formulas, periods, residuals, the public key, the anchors and the replay code; its definitions are pinned to the collector source by a test</td>
                  <td><span className="c-pill c-pill--built">served</span></td>
                  <td><Link href="/bell/method">/bell/method</Link></td>
                </tr>
                <tr>
                  <td>anchors · manifests and proofs</td>
                  <td>one manifest and one timestamp proof per boundary of the counter-verification run of the multiplier history, and one per timestamped line of the published timeline; the registers rendered, the status read from each proof file</td>
                  <td><span className="c-pill c-pill--built">served</span></td>
                  <td><Link href={ANCHORS_ROUTE}>{ANCHORS_ROUTE}</Link></td>
                </tr>
                <tr>
                  <td>replay code</td>
                  <td>
                    the publisher, the chain library, the verifier and the public keyring are in the{" "}
                    <a href={BELL_PUBLIC_REPO_URL}>public repository</a> (check a line yourself); the collector core, so that a
                    third party recomputes digests offline, is not exported yet
                  </td>
                  <td><span className="c-pill c-pill--upcoming">partial</span></td>
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
          the composition end to end. {bell.status === "built" ? <>Served today: {bell.served.note}.</> : null} The other
          lines are not a claim about a served record.
        </p>
      </section>

      {/* Short conditions — the disclaimer block validated by counsel, verbatim (counsel's GO on
          the Bell legal texts as drafted); publisher identity fields stay visible placeholders. The full
          Terms of Use and Privacy Notice are linked at its foot. */}
      <section className="c-section" id="conditions" aria-labelledby="l-conditions">
        <span className="c-label" id="l-conditions">conditions in short · they apply to Bell&rsquo;s published records</span>
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
                any change after publication is detectable. The signature shows who published the record and that it is intact;
                the publication time it carries is the publishing host&rsquo;s clock. It does not show that the underlying fact is
                correct — recomputing it from the public inputs is how you check that.
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
            address <Placeholder name="publisher_address" state="to be decided" />. What is served as a Bell record today is
            listed in the status above.
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
            <h3 className="c-h3">Not a price feed, no advice</h3>
            <p className="c-muted">A record carries session aggregates of on-chain fills; it has no closing-price or consolidated-volume field. Bell does not trade, does not quote, and does not tell anyone to.</p>
          </div>
        </div>
      </section>
      <BellRequestSection />
    </main>
  );
}
