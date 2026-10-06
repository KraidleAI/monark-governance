import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS } from "@/lib/fleet";
import { loadNarabiCapture } from "@/lib/narabi-capture-load";
import { loadNarabiServed } from "@/lib/narabi-served-load";
import { loadNarabiCalibration } from "@/lib/narabi-calib-load";
import { captureData, BOUND_FORMULA, TRACKER_ADAPTS, QUORUM_CLAUSE, DRIFT_THRESHOLD, CALM_WINDOW, NARABI_ROUTE, STATE_PATH, TIMELINE_PATH } from "@/lib/narabi-live";
import { WINDOW_STEPS } from "@/lib/narabi-copy";
import { docsRepoRoot, resultById } from "@/lib/docs-references-load";
import { DocHeader, StatusPill, Toc, DocSection, Figure, Callout, JsonBlock, Cite, RefList, PrevNext, docsReferences } from "@/components/docs/doc-kit";
import { NarabiDaySchema, TrackerSchema } from "@/components/docs/schemas/narabi";

// /docs/narabi (server component). Narabi's status and served note are read from the fleet register; the tracker, its
// parameters, its bound and every line from the committed capture of the two published files (apps/site/data/narabi-capture.json);
// the served class, the publication slots and the probe's deadline from apps/site/data/narabi-served.json; the calibration size
// and digest from the committed score fixture; the drift criterion's constants from lib/narabi-live.ts. No value is typed.
export const metadata: Metadata = {
  title: "Narabi · Docs · MONARK",
  description:
    "Narabi, one window a day: the attested redemption flow of one stablecoin population, a quantile tracker stepped on the realized outcome, a long-run bound printed with T, and a hash-chained timeline anyone can replay.",
};

export default function DocsNarabiPage() {
  const root = docsRepoRoot();
  const narabi = FLEET_AGENTS.find((a) => a.name === "Narabi");
  if (narabi === undefined || narabi.status !== "built") throw new Error("docs narabi: Narabi is not a built agent of the register (fail-closed)");
  const data = captureData(loadNarabiCapture(root));
  const served = loadNarabiServed(root);
  const calibration = loadNarabiCalibration(root);
  const state = data.state;
  const params = state.tracker.params;
  const last = data.lines[data.lines.length - 1];
  const points = data.lines.map((l) => ({ T: l.T, q_before: l.q_before, q_after: l.q_after, stepped: l.eta !== null, miss: l.E_tracker === 1 }));
  const decaying = resultById(docsReferences(), "decaying-bound");
  const toc = [
    { id: "senses", label: "What Narabi senses" },
    { id: "window", label: "One window a day" },
    { id: "tracker", label: "The tracker and its bound" },
    { id: "gate", label: "What the gate reads" },
    { id: "probe", label: "What the probe checks" },
    { id: "line", label: "A real line" },
    { id: "not", label: "What Narabi is not" },
    { id: "sources", label: "Sources" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · the pieces · Narabi" title="Narabi, one day at a time." pill={<StatusPill status={narabi.status} />}>
        <p>
          Narabi reads the redemption flow of one stablecoin population once a day, at block finality, steps an adaptive quantile
          tracker on what actually happened, and publishes a line anyone can replay. The gate reads a committed calibration, not the
          tracker. {TRACKER_ADAPTS}
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="senses" title="What Narabi senses">
        <p>
          A run on a claim redeemable at face value is the object: holders who expect others to redeem redeem first, and the flow of
          redemptions speeds up before the stock does (<Cite refId="diamond-dybvig" />, and for a run tied to fundamentals,{" "}
          <Cite refId="goldstein-pauzner" />). Narabi measures the speed of that flow on chain, for one population today, the served
          class keyed <code>{served.gate.predictor_id}</code>. It publishes the measurement; it does not call a run.
        </p>
        <p>
          The register&rsquo;s served note: <em>{narabi.wiring.note}</em>.
        </p>
      </DocSection>

      <DocSection id="window" title="One window a day">
        <Figure caption={<>One window a day. The publication slots and the probe&rsquo;s deadline are read from the committed served facts.</>}>
          <NarabiDaySchema slots={served.sentinel_timer.on_calendar_utc} deadline={served.probe.deadline_utc} quorum={`${QUORUM_CLAUSE}; the reads wait for finality`} />
        </Figure>
        <ol className="d-steps">
          {WINDOW_STEPS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </DocSection>

      <DocSection id="tracker" title="The tracker and its bound">
        <p>
          The tracker moves its quantile threshold each window, up when the score exceeded it and down otherwise, with a step size
          that decays as windows accumulate. Its parameters, as published: target miscoverage {params.alpha}, step constant {params.c}, decay
          parameter {params.eps}, score bound {params.B}.
        </p>
        <Callout title={<>The result, after <Cite refId={decaying.ref} />, {decaying.locator}</>}>
          <p>{decaying.statement}</p>
          <p className="c-mono">{BOUND_FORMULA}</p>
        </Callout>
        <p>
          After {state.tracker.t} steps, the published state projects that the printed bound reaches the target at T ={" "}
          {state.projected_bound_leq_target_T}. Until then the bound stays above the target, and the page says so rather than hiding it.
        </p>
        <Figure caption={<>The tracker&rsquo;s threshold over the published windows, from the committed capture of the timeline. The dashed line is the committed threshold the gate reads.</>}>
          <TrackerSchema points={points} q1={state.tracker.q1} lastDay={last?.day ?? ""} T={state.tracker.t} />
        </Figure>
      </DocSection>

      <DocSection id="gate" title="What the gate reads">
        <p>
          The served gate class <code>{served.gate.task_class}</code> reads a committed static calibration of {calibration.nCalib} calm
          pairs, scores digest <span className="c-mono">{calibration.scoresSha256}</span>. Every other population abstains, with the reason{" "}
          <code>under_calib</code>. The committed region moves only when a pre-registered drift criterion fires: the rolling share of
          calm pairs that missed the committed threshold reaching {DRIFT_THRESHOLD}, evaluable once {CALM_WINDOW} calm pairs have
          accumulated. A drift opens a review; it never switches anything automatically.
        </p>
      </DocSection>

      <DocSection id="probe" title="What the probe checks">
        <p>
          A probe runs on another host than the one that publishes, so a stalled or broken publication is seen from the outside. It
          reads the published timeline at the UTC times {served.probe.shots_utc.join(", ")}, the first of them the deadline. It checks
          that the last expected window is there, that the chain of line hashes holds from the genesis line, and that the published
          state agrees with the last line. A failure raises an alert to the operator.
        </p>
        <p>
          The <Link href={NARABI_ROUTE}>Narabi page</Link> re-runs the same integrity checks in your browser, on the files as served
          now: <code>{STATE_PATH}</code> and <code>{TIMELINE_PATH}</code>.
        </p>
      </DocSection>

      <DocSection id="line" title="A real line">
        <p>The last line of the committed capture of the published timeline, as captured. Nothing here is typed.</p>
        {last !== undefined ? (
          <JsonBlock
            value={{
              day: last.day,
              from_block: last.from_block,
              to_block: last.to_block,
              burns: last.burns,
              mints: last.mints,
              supply_close: last.supply_close,
              pair_status: last.pair_status,
              s: last.s,
              q_before: last.q_before,
              q_after: last.q_after,
              T: last.T,
              bound_thm1: last.bound_thm1,
              drift_flag: last.drift_flag,
              prev_line_hash: last.prev_line_hash,
              line_hash: last.line_hash,
            }}
            caption={<>a selection of the fields of the line for {last.day}, as committed in the site data</>}
          />
        ) : null}
      </DocSection>

      <DocSection id="not" title="What Narabi is not">
        <Callout tone="limit" title="Not a coverage, not a probability, not an alarm">
          <p>
            The printed bound is a long-run quantity, not a coverage per window and not a probability of being right. The timeline is
            not a price, a peg gauge or a run alarm, and a few steps are not a trend. A rewrite of the timeline is detectable,
            never certified: the only check of the facts is the on-chain recompute.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="sources" title="Sources">
        <RefList refIds={["abb-decaying", "gibbs-candes-aci", "barber-beyond", "diamond-dybvig", "goldstein-pauzner"]} />
      </DocSection>

      <PrevNext href="/docs/narabi" />
    </article>
  );
}
