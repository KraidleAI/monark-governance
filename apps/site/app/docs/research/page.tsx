import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS, PRODUCTS, type FleetAgent } from "@/lib/fleet";
import { loadCommitted } from "@/lib/load-committed";
import { loadHarnessServed } from "@/lib/harness-served-load";
import { loadUkemiCourse } from "@/lib/ukemi-course-load";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { buildCourseView } from "@/lib/ukemi-course-view";
import { loadNarabiCapture } from "@/lib/narabi-capture-load";
import { captureData } from "@/lib/narabi-live";
import { loadBellServed, bellServedRepoRoot } from "@/lib/bell-served-load";
import { BELL_RESIDUAL_CODES_LISTED } from "@/lib/bell-method";
import { docsRepoRoot, resultById } from "@/lib/docs-references-load";
import { siteVocabulary } from "@/lib/docs-vocab";
import { DocHeader, Toc, DocSection, Figure, Callout, Cite, PrevNext, docsReferences } from "@/components/docs/doc-kit";
import { ResearchMapSchema } from "@/components/docs/schemas/research";

// /docs/research (server component). The questions, methods and results of the research behind the engine. Every figure is
// read from committed, hashed data: the liquidation figures of the one primary study the site carries from
// fixtures/figures-sourced.json (through lib/load-committed.ts, each attributed to the bibliography's work of the same DOI,
// with its page; a figure whose DOI names no listed work fails the build, and a figure whose words break the site's
// vocabulary is withheld and counted); the course results from
// the committed course report; the tracker state from the committed Narabi capture; the gap rows from the committed Bell data;
// the served clauses from the committed harness facts. The bibliography, with the reading level of each work, is the committed
// apps/site/data/docs-references.json. A literature result is stated in words and attributed; no second-hand figure appears.
export const metadata: Metadata = {
  title: "DeFi research · Docs · MONARK",
  description:
    "The research behind the MONARK engine: runs, liquidations, the oracle path, calibration and off-hours gaps. The questions, the methods, what was measured, what stays open, and the bibliography with the reading level of each work.",
};

function agent(name: string): FleetAgent {
  const a = FLEET_AGENTS.find((x) => x.name === name);
  if (a === undefined) throw new Error(`docs research: '${name}' is not an agent of the fleet register`);
  return a;
}

/** The waiver this page passes to the vocabulary filter of its figures: the site rules whose reason carries this tag (two
 *  lending platforms the cited study names) are not applied to the verbatim figures of that study, on this page only. */
const CITED_FIGURES_WAIVER = "the verbatim Qin et al. figures of /docs/research";

export default function DocsResearchPage() {
  const root = docsRepoRoot();
  const clean = siteVocabulary(root, CITED_FIGURES_WAIVER);
  const allFigures = loadCommitted(root).figures;
  const figures = allFigures.filter((f) => clean(f.claim) && clean(f.qualifier) && clean(f.source));
  const withheld = allFigures.length - figures.length;
  const harness = loadHarnessServed(root);
  const course = loadUkemiCourse(root);
  const view = buildCourseView(course, loadUkemiServed(root));
  const narabiData = captureData(loadNarabiCapture(root));
  const bellServed = loadBellServed(bellServedRepoRoot(), BELL_RESIDUAL_CODES_LISTED);
  const refs = docsReferences();
  // A sourced figure is attributed through the bibliography: the work whose identifier is the figure's DOI, or the build fails.
  const figureWork = (doi: string): string => {
    const work = refs.references.find((r) => r.identifier === `doi:${doi}`);
    if (work === undefined) throw new Error(`docs research: a sourced figure cites doi:${doi}, a work absent from the bibliography (fail-closed)`);
    return work.id;
  };
  // The place in the work a figure's source line names after the work itself (for instance ", Appendix A"), kept next to the
  // page; the attribution itself is the bibliography's.
  const placeIn = (source: string): string => /\)((?:,[^,()]+)+)$/.exec(source)?.[1] ?? "";
  const beyond = resultById(refs, "beyond-exchangeability");
  const split = resultById(refs, "split-quantile");
  const typeWise = resultById(refs, "type-wise");
  const eligible = resultById(refs, "eligible-not-loss");
  const bell = PRODUCTS.find((p) => p.key === "bell");
  if (bell === undefined) throw new Error("docs research: MONARK Bell is absent from the register");
  const narabi = agent("Narabi");
  const ukemi = agent("Ukemi");
  const hikae = agent("Hikae");
  const stableRun = harness.classes.find((c) => c.state === "committed");
  const fixture = harness.classes.find((c) => c.state === "synthetic");
  const sessions = bellServed.head.runs.flatMap((r) => r.sessions);
  const withGap = sessions.filter((s) => s.gT !== null);
  const thresholds = [...new Set(withGap.flatMap((s) => s.exceed.map((e) => e.threshold)))].sort((a, b) => a - b);
  const nodes = [
    { question: "When does a redemption flow start to run?", method: "attested daily flow, a quantile tracker, a replayable timeline", carrier: narabi.name, status: narabi.status },
    { question: "How much of a book gets liquidated?", method: "a book at a block, realized labels, a conformal upper bound per stratum", carrier: ukemi.name, status: ukemi.status },
    { question: "Which price did the protocol read?", method: "the oracle path recorded from chain events, its lag measured against a bound", carrier: ukemi.name, status: ukemi.status },
    { question: "When may an agent act on a reading?", method: "split-conformal calibration per class, a closed policy, abstention", carrier: hikae.name, status: hikae.status },
    { question: "What does a token do while its market is closed?", method: "a signed session record, the gap to the close, named abstentions", carrier: bell.name, status: bell.status },
  ];
  const toc = [
    { id: "map", label: "The questions" },
    { id: "runs", label: "Runs" },
    { id: "liquidations", label: "Liquidations" },
    { id: "oracle", label: "The oracle path" },
    { id: "calibration", label: "Calibration" },
    { id: "gaps", label: "Off-hours gaps" },
    { id: "open", label: "Open questions" },
    { id: "bibliography", label: "Bibliography" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · DeFi research" title="Measure first. Say what was measured.">
        <p>
          No piece of MONARK is designed on a whiteboard and shipped. Each starts as an empirical study on chain data, pre-registered
          where it can be, and the study&rsquo;s artefacts stay attached to the served piece. This page gathers the questions, the
          methods, the results that are published, and what stays open. A result from the literature is stated in words and
          attributed; a figure appears only when it is read from committed data, with its source.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="map" title="The questions">
        <Figure caption={<>Five questions around one rule. Each is carried by a piece or an application of the register, drawn in the style of its status.</>}>
          <ResearchMapSchema nodes={nodes} />
        </Figure>
      </DocSection>

      <DocSection id="runs" title="Runs">
        <p>
          A run on a claim redeemable at face value is an equilibrium of expectations: holders who expect others to redeem redeem first (
          <Cite refId="diamond-dybvig" />), and the probability of a run can be tied to fundamentals rather than to a coin toss between
          equilibria (<Cite refId="goldstein-pauzner" />). MONARK does not model the equilibrium. It measures the speed of the
          redemption flow on chain, once a day, for one population.
        </p>
        <p>
          What the measurement found, as the served gate states it for the committed class{" "}
          {stableRun !== undefined ? <code>{stableRun.class_id}</code> : null}:{" "}
          {stableRun !== undefined ? stableRun.clauses.join("; ") : "no committed class"}. Because the calibration is not
          exchangeable across time, the served sentence rests on this result:
        </p>
        <Callout title={<><Cite refId={beyond.ref} />, {beyond.locator}</>}>
          <p>{beyond.statement}</p>
        </Callout>
        <p>
          Until that departure is estimated, no coverage is measured, and the served sentence says so.
        </p>
        <p>
          The tracker has stepped {narabiData.state.tracker.t} times in the committed capture, and its printed bound is projected to
          reach its target at T = {narabiData.state.projected_bound_leq_target_T}. See the <Link href="/docs/narabi">Narabi page</Link>.
        </p>
      </DocSection>

      <DocSection id="liquidations" title="Liquidations">
        <p>
          Liquidations are where a price becomes a loss, and the scale of the problem is measured. The figures below are those of the
          one primary empirical study the site carries, read from the committed file of sourced figures, each with its qualifier and
          its page:
        </p>
        <div className="d-tablewrap">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">figure</th>
                <th className="c-label">claim</th>
                <th className="c-label">qualifier</th>
                <th className="c-label">source</th>
              </tr>
            </thead>
            <tbody>
              {figures.map((f) => (
                <tr key={f.id}>
                  <td className="c-mono">
                    {f.value} {f.unit}
                  </td>
                  <td>{f.claim}</td>
                  <td>{f.qualifier}</td>
                  <td>
                    <Cite refId={figureWork(f.doi)} />
                    {placeIn(f.source)}, p. {f.page}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {withheld > 0 ? (
          <p className="c-muted">
            {withheld} more {withheld === 1 ? "figure" : "figures"} of the same file {withheld === 1 ? "is" : "are"} not shown here: the
            qualifier names a venue the site describes generically.
          </p>
        ) : null}
        <p>
          In a network of obligations, the payments that clear are a fixed point (<Cite refId="eisenberg-noe" />); with default costs
          the fixed point need not be unique (<Cite refId="rogers-veraart" />), and conditions for a single equilibrium under
          liquidation costs are known (<Cite refId="amini-uniqueness" />). Forced sales into an inelastic market move the price a book
          is marked at (<Cite refId="cifuentes-ferrucci-shin" />). And what a stress test flags is not what gets liquidated:
        </p>
        <Callout title={<><Cite refId={eligible.ref} />, {eligible.locator}</>}>
          <p>{eligible.statement}</p>
        </Callout>
        <p>
          What MONARK measured, on one recorded episode, <code>{course.event_id}</code>: {view.population} {view.multi_call}{" "}
          {view.liquidated_amounts} The full report, stratum by stratum, is on the <Link href="/ukemi/course">course page</Link>.
        </p>
      </DocSection>

      <DocSection id="oracle" title="The oracle path">
        <p>
          A liquidation is triggered by the price the protocol reads, not by the market&rsquo;s price. Ukemi records the oracle path
          from chain events and checks, against a bound fixed before the run, that the values the protocol read at the liquidation
          blocks belong to that path. On the course episode:
        </p>
        <p>{view.oracle}</p>
        <p>{view.oracle_anchor}</p>
        {view.oracle_bias !== null ? <p>{view.oracle_bias}</p> : null}
      </DocSection>

      <DocSection id="calibration" title="Calibration">
        <p>
          Every region the gate states is conformal. The method gives a finite-sample, marginal statement under exchangeability, with
          no assumption on the model:
        </p>
        <Callout title={<><Cite refId={split.ref} />, {split.locator}</>}>
          <p>{split.statement}</p>
        </Callout>
        <p>
          Coverage conditional on one input cannot be promised in general (<Cite refId="vovk-conditional" />), which is why the gate
          keeps one region per category fixed in advance:
        </p>
        <Callout title={<><Cite refId={typeWise.ref} />, {typeWise.locator}</>}>
          <p>{typeWise.statement}</p>
        </Callout>
        <p>
          A population with too few calibration points abstains; the floor follows the analysis of prediction sets for grouped data (
          <Cite refId="dunn-hierarchical" />). Abstention itself is an old idea: the tradeoff between errors and rejections (
          <Cite refId="chow-reject" />). And the served gate says plainly when a class is not a measurement:{" "}
          {fixture !== undefined ? (
            <>
              <code>{fixture.class_id}</code> is served as {fixture.clauses.join("; ")}.
            </>
          ) : (
            "no class is served as a fixture."
          )}
        </p>
      </DocSection>

      <DocSection id="gaps" title="Off-hours gaps">
        <p>
          Tokens that track U.S. equities trade while their market is closed, and empirical work measures how far and how often they
          stray from the last close, overnight and over the weekend (<Cite refId="cong-tokenized" />). The weekend effect in stock
          returns has an older literature, cited here by name only until the work is obtained (<Cite refId="french-weekend" />).
        </p>
        <p>
          MONARK Bell publishes the gap session by session. In its latest record, a gap is computed for {withGap.length} of{" "}
          {sessions.length} session rows, and each row counts whether the gap exceeded each threshold named by the served rows (
          {thresholds.map((t) => `${String(t)} percent`).join(", ") || "none"}). A measurement over a full collection window is not
          published yet; until it is, no share per regime is claimed here. See the <Link href="/docs/bell">Bell page</Link>.
        </p>
      </DocSection>

      <DocSection id="open" title="Open questions">
        <ul className="d-bullets">
          <li>
            Does the tracker&rsquo;s bound become informative at the projected T, and does the drift criterion fire before it?
          </li>
          <li>
            Is the next liquidation episode exchangeable with the one the course calibrated on? The distance to a new event is named,
            never estimated away.
          </li>
          <li>
            Why did the oracle serve its price with a delay on the design episode? On the course episode the lag is measured against a
            pre-registered bound, not explained.
          </li>
          <li>How often does the off-hours gap cross each threshold, per regime, over a full collection window?</li>
          <li>Does a third party call the gate without being pushed? Paid demand for a gate like this is not demonstrated, and we say so.</li>
        </ul>
      </DocSection>

      <DocSection id="bibliography" title="Bibliography">
        <p>
          Every work the documentation cites, with the reading level the project reached. A work not yet obtained is cited by name
          only, and nothing is claimed from its content.
        </p>
        <ul className="d-reflist">
          {refs.references.map((r) => (
            <li key={r.id} id={`ref-${r.id}`}>
              <span className="d-reflist__who">
                {r.authors} ({r.year})
              </span>{" "}
              {r.title !== null ? <em>{r.title}</em> : <span className="c-muted">title not reproduced: {r.title_note}</span>}. {r.venue}
              {r.identifier !== null ? <>, {r.identifier}</> : null}. <span className="c-tag">{r.level}</span>{" "}
              <span className="c-muted">Used for {r.used_for}.</span>
            </li>
          ))}
        </ul>
      </DocSection>

      <PrevNext href="/docs/research" />
    </article>
  );
}
