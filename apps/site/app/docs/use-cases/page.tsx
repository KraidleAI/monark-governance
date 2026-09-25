import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS, PRODUCTS, type FleetAgent, type FleetProduct } from "@/lib/fleet";
import { loadHarnessServed } from "@/lib/harness-served-load";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { loadBellServed, bellServedRepoRoot } from "@/lib/bell-served-load";
import { BELL_RESIDUAL_CODES_LISTED } from "@/lib/bell-method";
import { loadPublications } from "@/lib/bell-anchors-load";
import { publicationAnchorState, publicationAnchorSentence } from "@/lib/bell-anchors";
import { docsRepoRoot } from "@/lib/docs-references-load";
import { DocHeader, Toc, DocSection, Figure, Callout, StatusPill, PrevNext } from "@/components/docs/doc-kit";
import { FlowSchema } from "@/components/docs/schemas/flow";

// /docs/use-cases (server component). Design targets: what the engine is built toward when every piece is served. Each case
// sits next to its state today, and that state is never typed: a piece or an application's label is read from the fleet
// register, a served class from the committed harness facts, the Ukemi class state from the committed served state, the Bell
// record and its anchors from the committed Bell data. A step is drawn solid only when what it names is served today.
export const metadata: Metadata = {
  title: "Use cases · Docs · MONARK",
  description:
    "What MONARK is built toward when every piece is served: venues listing tokenized equities, agents that move money, oracles that wrap a verifiable record, positions that ease down, treasuries that hold a stablecoin. Each case next to its state today.",
};

function agent(name: string): FleetAgent {
  const a = FLEET_AGENTS.find((x) => x.name === name);
  if (a === undefined) throw new Error(`docs use cases: '${name}' is not an agent of the fleet register`);
  return a;
}
function app(key: string): FleetProduct {
  const p = PRODUCTS.find((x) => x.key === key);
  if (p === undefined) throw new Error(`docs use cases: '${key}' is not an application of the fleet register`);
  return p;
}

function StateList({ items }: { items: readonly { name: string; status: "built" | "upcoming" }[] }) {
  return (
    <ul className="d-bullets">
      {items.map((i) => (
        <li key={i.name}>
          {i.name}: <StatusPill status={i.status} />
        </li>
      ))}
    </ul>
  );
}

export default function DocsUseCasesPage() {
  const root = docsRepoRoot();
  const harness = loadHarnessServed(root);
  const ukemiServed = loadUkemiServed(root);
  const bellServed = loadBellServed(bellServedRepoRoot(), BELL_RESIDUAL_CODES_LISTED);
  const bell = app("bell");
  const gate = agent("Hikae");
  const ukemi = agent("Ukemi");
  const narabi = agent("Narabi");
  const shogen = agent("Shōgen");
  const genkan = agent("Genkan");
  const kessai = agent("Kessai");
  const koyomi = agent("Koyomi");
  const softlanding = app("softlanding");
  const warden = app("warden");
  const ballast = app("ballast");
  const gapClassServed = harness.classes.some((c) => /gap/.test(c.class_id));
  const stableRun = harness.classes.find((c) => c.state === "committed");
  const byoServed = harness.byo_clause.length > 0;
  const liqCommitted = ukemiServed.registry_state === "committed";
  const head = bellServed.head;
  const anchorState = publicationAnchorState(bellServed.head, bellServed.lines, loadPublications(bellServed.lines).bound);
  const toc = [
    { id: "venue", label: "A venue listing tokenized equities" },
    { id: "agent", label: "An agent that moves money" },
    { id: "oracle", label: "An oracle that wraps a verifiable record" },
    { id: "position", label: "A leveraged position that eases down" },
    { id: "treasury", label: "A treasury that holds a stablecoin" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · use cases" title="At full deployment.">
        <p>
          These are design targets: what MONARK is built toward when every piece is served. None of them is an agreement with a third party, a
          promise or a date. Each case sits next to its state today, read from the fleet register and the served files, never assumed: a step
          drawn solid exists and is served today, a dashed one does not yet.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="venue" title="A venue listing tokenized equities">
        <p>
          A lending market or a perpetual venue that accepts tokenized U.S. equities has a problem every night and every weekend: the
          token keeps trading while its reference market is closed, and the price feeds it relies on may stop moving. The target: the
          venue reads a signed record of the off-hours gap, asks the gate whether the evidence supports its current parameters, and
          applies its own haircut or pauses new positions when the gate defers or abstains.
        </p>
        <Figure caption={<>A venue listing tokenized equities, at full deployment. A dashed step does not exist or is not served yet; the states are read from the register and the served files.</>}>
          <FlowSchema
            label="A venue reads the signed off-hours record, the gate answers on the gap class, the venue keeps its parameters or applies its own haircut."
            steps={[
              { head: "The signed record", body: "the off-hours gap per session, signed and chained, with its abstentions counted", today: bell.status === "built", source: bell.name },
              { head: "A gap class on the gate", body: "the gap per regime, calibrated like any class: overnight, weekend and holiday kept apart", today: gapClassServed, source: "served classes" },
              { head: "The gate answers", body: "commit, defer or abstain on the gap class, with its reason on the wire", today: gate.status === "built", source: gate.name },
              { head: "The venue acts on the answer", body: "keeps its parameters on commit; applies its own haircut or pauses new positions otherwise", today: gapClassServed, source: "the venue" },
            ]}
            footer="The venue keeps its own risk policy; the gate says whether the evidence supports acting on it."
          />
        </Figure>
        <Callout tone="today" title="Today">
          <StateList items={[bell, gate, koyomi]} />
          <p>
            An off-hours gap class on the served gate: {gapClassServed ? "served." : "not among the served classes yet."} The record
            itself is served: line {head.seq} of the timeline, published {head.published_at}. {koyomi.name} is the act that would
            flatten leveraged exposure ahead of a closure on the same evidence.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="agent" title="An agent that moves money">
        <p>
          An agent that knows when it does not know is the one you can let run. The target: the agent brings its own model&rsquo;s
          prediction and that model&rsquo;s track record, the gate turns the prediction into a region, and the agent acts through its
          wallet policy only on commit. The wallet policy says what the agent may touch; the gate says whether the evidence supports
          acting at all. The two stack.
        </p>
        <Figure caption={<>An agent that moves money, at full deployment. The states are read from the register and the served harness.</>}>
          <FlowSchema
            label="An agent brings its prediction and its scores, the gate answers, the wallet policy and the act follow on commit only."
            steps={[
              { head: "The agent's model", body: "any model, any provider: a prediction and its past scores", today: true, source: "the caller" },
              { head: "Bring your own calibration", body: "the gate conforms against the caller's own scores, for the caller's own class", today: byoServed, source: "served harness" },
              { head: "The gate answers", body: "commit, defer or abstain, with the region and the budget the caller carries", today: gate.status === "built", source: gate.name },
              { head: "The door", body: "one entry every transfer, swap or signature passes through first", today: genkan.status === "built", source: genkan.name },
              { head: "An execution receipt", body: "what was intended, what was filled, and the shortfall between them", today: kessai.status === "built", source: kessai.name },
            ]}
            footer="Human approval is the control today; at agent cadence it becomes the bottleneck. The gate is built to take that seat for the reading, not for the policy."
          />
        </Figure>
        <Callout tone="today" title="Today">
          <StateList items={[gate, genkan, kessai]} />
          <p>
            Bring-your-own calibration is {byoServed ? "served" : "not served"}: {harness.byo_clause}. The agent carries its budget:
            the gate returns it unchanged.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="oracle" title="An oracle that wraps a verifiable record">
        <p>
          A price network or an oracle can relay a value it did not compute. The target: an oracle that consumes MONARK Bell&rsquo;s
          record checks each line&rsquo;s signature and chain against the committed keyring, relays the value with the line&rsquo;s
          hash, and lets any consumer trace the value back to the signed line and recompute it from the ledger.
        </p>
        <Figure caption={<>An oracle that wraps a verifiable record, at full deployment. The anchoring state is read from the publication register.</>}>
          <FlowSchema
            label="An oracle checks the signed record, relays the value with the line hash, and a consumer traces and recomputes it."
            steps={[
              { head: "The signed line", body: "each line signed over its canonical bytes and chained to the one before", today: bell.status === "built", source: bell.name },
              { head: "The oracle checks", body: "the signature against the committed keyring, the chain back to the genesis value", today: true, source: "public verifier" },
              { head: "A public timestamp", body: "each published line anchored, so its existence before a block is shown by anyone", today: anchorState.state === "anchored", source: "publication register" },
              { head: "The value relayed", body: "with the line hash, so a consumer can trace it and recompute it", today: false, source: "an oracle" },
            ]}
            footer="A signature attests origin, never truth: the consumer's check of a fact is the recompute from the ledger."
          />
        </Figure>
        <Callout tone="today" title="Today">
          <StateList items={[bell, shogen]} />
          <p>
            The latest record&rsquo;s timestamp status: {publicationAnchorSentence(anchorState)}.{" "}
            The reader-side verifier and the public keyring are public; no oracle relays the record.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="position" title="A leveraged position that eases down">
        <p>
          A leveraged position on a lending venue can be liquidated in parts when its collateral falls. The target: before it clears,
          the position reads an upper bound on what the protocol&rsquo;s rule would liquidate, asks the gate whether the evidence
          supports that bound, and eases its exposure down on commit.
        </p>
        <Figure caption={<>A leveraged position that eases down, at full deployment. The class state is read from the served gate description.</>}>
          <FlowSchema
            label="A position reads the liquidation bound, the gate answers on the committed stratum, the position eases down on commit."
            steps={[
              { head: "The book at a block", body: "the position and the oracle path, read under a quorum of operators", today: ukemi.status === "built", source: ukemi.name },
              { head: "A committed stratum", body: "an upper bound on the amount liquidated, per stratum of the prediction", today: liqCommitted, source: "served class state" },
              { head: "The gate answers", body: "commit when the bound is narrow enough to act on; abstain below the floor", today: gate.status === "built", source: gate.name },
              { head: "Ease the exposure down", body: "reduce the loan or add collateral before the liquidation clears", today: softlanding.status === "built", source: softlanding.name },
            ]}
            footer="Eligible is not liquidated: the bound is on what gets liquidated, not on what a stress test flags."
          />
        </Figure>
        <Callout tone="today" title="Today">
          <StateList items={[ukemi, gate, softlanding]} />
          <p>
            The served state of the class <code>{ukemiServed.served_class}</code>: {ukemiServed.liq_clause}.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="treasury" title="A treasury that holds a stablecoin">
        <p>
          A treasury, a DAO or an agent that holds a stablecoin wants to know early when redemptions speed up. The target: the treasury
          reads the daily redemption-flow record, asks the gate on the stable-run class of its population, and rebalances on commit.
        </p>
        <Figure caption={<>A treasury that holds a stablecoin, at full deployment. The class state is read from the served harness.</>}>
          <FlowSchema
            label="A treasury reads the daily redemption flow, the gate answers on the stable-run class, the treasury rebalances on commit."
            steps={[
              { head: "The daily flow", body: "burns, mints and supply of one population, one line a day, hash-chained", today: narabi.status === "built", source: narabi.name },
              { head: "The stable-run class", body: "a committed calibration for one population; every other population abstains", today: stableRun !== undefined, source: "served classes" },
              { head: "A least-privilege gate", body: "a spend or a signature from the treasury passes the same gate first", today: warden.status === "built", source: warden.name },
              { head: "Hold the treasury steady", body: "rebalance or hedge when the evidence supports it", today: ballast.status === "built", source: ballast.name },
            ]}
            footer="The record senses the flow; it does not call a run, and it is not a peg gauge."
          />
        </Figure>
        <Callout tone="today" title="Today">
          <StateList items={[narabi, warden, ballast]} />
          <p>
            The committed stable-run class: {stableRun !== undefined ? `${stableRun.class_id}, ${stableRun.clauses.join("; ")}.` : "none."}
          </p>
        </Callout>
        <p>
          Every application named here has its page on the <Link href="/applications">applications page</Link>; every piece, on the{" "}
          <Link href="/docs/pieces">pieces page</Link>.
        </p>
      </DocSection>

      <PrevNext href="/docs/use-cases" />
    </article>
  );
}
