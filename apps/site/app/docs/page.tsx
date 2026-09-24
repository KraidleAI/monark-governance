import type { Metadata } from "next";
import Link from "next/link";
import { FLEET_AGENTS, builtAgents, upcomingAgents, countWord, capitalized, productStatusSentence } from "@/lib/fleet";
import { loadHarnessServed } from "@/lib/harness-served-load";
import { loadContract } from "@/lib/load-contract";
import { BT_SERVED_RULE, BT_FLOOR_RULE } from "@/lib/sim";
import { frozenContractsSummary } from "@/app/roadmap/frozen-contracts";
import { DOCS_SECTIONS, DOCS_PIECES_ROOT } from "@/lib/docs-nav";
import { docsRepoRoot } from "@/lib/docs-references-load";
import { DocHeader, Toc, DocSection, Figure, Callout, PrevNext } from "@/components/docs/doc-kit";
import { KnifeSchema, FloorsSchema } from "@/components/docs/schemas/overview";

// /docs, the overview (server component). Every name, status and count is read from the fleet register (lib/fleet.ts);
// the contract titles and their count from schemas/; the served tools, classes and clauses from the committed, hashed
// harness facts (apps/site/data/harness-served.json, fail-closed loader). The budget rule is the served one (lib/sim.ts).
export const metadata: Metadata = {
  title: "Docs · MONARK",
  description:
    "The MONARK documentation: one engine with two sides, the gate and its budget, every piece of the engine, MONARK Bell, Ukemi, Narabi, integration, use cases, the research behind it and how to verify it yourself.",
};

const STATE_WORDS: Readonly<Record<string, string>> = {
  synthetic: "a synthetic fixture, declared as such",
  none: "no calibration committed: it abstains",
  committed: "a committed calibration",
};

export default function DocsOverviewPage() {
  const root = docsRepoRoot();
  const served = loadHarnessServed(root);
  const contracts = frozenContractsSummary(root);
  const prediction = loadContract(root, "prediction.schema.json", "Ukemi").title;
  const verdict = loadContract(root, "coverage-verdict.schema.json", "Hikae").title;
  const decision = loadContract(root, "gate-decision.schema.json", "Hikae").title;
  const toolNames = served.tools.map((t) => t.name);
  const built = builtAgents();
  const upcoming = upcomingAgents();
  const labels = [...new Set(FLEET_AGENTS.map((a) => a.status))];
  const toc = [
    { id: "knife", label: "One engine, two sides" },
    { id: "floors", label: "The floors" },
    { id: "today", label: "What you will see if you call it today" },
    { id: "labels", label: "What the labels mean" },
    { id: "next", label: "Read next" },
  ];
  return (
    <article>
      <DocHeader eyebrow="docs · overview" title="One engine, two sides.">
        <p>
          MONARK is a coverage-controlled decision gate, the pieces that read and act around it, and the on-chain applications it
          powers. The gate answers commit, defer or abstain against a budget the caller carries, and never a probability of being
          right. These pages explain each part with a schema, show what is served today, read from the served files, and say how to
          check it yourself.
        </p>
      </DocHeader>
      <Toc items={toc} />

      <DocSection id="knife" title="One engine, two sides">
        <p>
          Think of a pocket knife. The handle is the engine, the AI side: the gate and its budget, the sensors that attest to what
          happened on chain, the {countWord(contracts.count)} frozen contracts they speak, and the harness through which other agents
          reach it. The blades are the DeFi side: the on-chain applications the engine powers, each grown from a study of on-chain
          data before it is served. {productStatusSentence()}
        </p>
        <Figure
          caption={
            <>
              The knife, adapted from the pitch deck and redrawn from the register: an open blade is an application the register
              marks built; a folded, dashed one is named. The contract count is read from the frozen schemas, the tools from the
              served harness.
            </>
          }
        >
          <KnifeSchema contractCount={contracts.count} toolNames={toolNames} />
        </Figure>
        <p>
          The ring is how other agents hold the knife: one public endpoint over MCP, and a plain HTTP mirror, with no account, e-mail
          or wallet. The <Link href="/docs/integrators">integration page</Link> shows calls recorded over the transport, request and
          answer.
        </p>
      </DocSection>

      <DocSection id="floors" title="The floors">
        <p>
          The engine has four floors. Sensors attest: they carry bytes, a hash and named residual hypotheses, never a truth claim.
          The gate decides: it turns a reading into a region and the region into one word. Acts execute, and only on commit. The door
          lets other agents in. A language model&rsquo;s answer and an onchain flow take different roads to the same contract,{" "}
          <code>{prediction}</code>, and meet the same gate.
        </p>
        <Figure
          caption={
            <>
              Four floors and two directions. The contract titles are read from the frozen schemas; the gate and the door carry their
              register status.
            </>
          }
        >
          <FloorsSchema predictionTitle={prediction} verdictTitle={verdict} decisionTitle={decision} toolNames={toolNames} />
        </Figure>
      </DocSection>

      <DocSection id="today" title="What you will see if you call it today">
        <p>
          The served gate knows the task classes below, each with the state of its calibration and the first clause it serves, as read
          from the served harness at {served.read_at}. A population outside a committed class gets an abstention with the reason{" "}
          <code>under_calib</code>: that is the design, not an outage.
        </p>
        <div className="d-tablewrap">
          <table className="c-table">
            <thead>
              <tr>
                <th className="c-label">task class</th>
                <th className="c-label">calibration</th>
                <th className="c-label">first served clause</th>
              </tr>
            </thead>
            <tbody>
              {served.classes.map((c) => (
                <tr key={c.class_id}>
                  <td className="c-mono">{c.class_id}</td>
                  <td>{STATE_WORDS[c.state] ?? c.state}</td>
                  <td>{c.clauses[0] ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Callout tone="today" title="The budget and the attestation, as served">
          <p>
            {BT_SERVED_RULE}; {BT_FLOOR_RULE}. On the served gate, an attestation is optional: {served.honesty.attested.join("; ")}.
          </p>
        </Callout>
      </DocSection>

      <DocSection id="labels" title="What the labels mean">
        <p>
          Every piece and every application carries one of {countWord(labels.length)} labels, read from the fleet register, never typed on a page.{" "}
          {capitalized(countWord(built.length))} of the {countWord(FLEET_AGENTS.length)} pieces of the engine are marked{" "}
          <code>{built[0]?.status ?? ""}</code> and {countWord(upcoming.length)} are marked <code>{upcoming[0]?.status ?? ""}</code>. A
          label moves only when a piece meets all of these:
        </p>
        <ol className="d-steps">
          <li>A study first: a measurement on chain data, pre-registered where it can be, its artefacts committed and hashed.</li>
          <li>A frozen contract, if the piece speaks a new shape.</li>
          <li>A served surface that consumes its output: a tool, a published file, or a piece downstream, never only a test or a demo.</li>
          <li>An end-to-end integration test that replays the composition, and a deployment check where a host is served.</li>
        </ol>
        <p>
          The <Link href={DOCS_PIECES_ROOT}>pieces page</Link> draws every piece in the style of its label, and each piece page says
          what is served for it today.
        </p>
      </DocSection>

      <DocSection id="next" title="Read next">
        <div className="d-cards">
          {DOCS_SECTIONS.filter((s) => s.href !== "/docs").map((s) => (
            <Link key={s.href} href={s.href} className="d-card">
              <span className="d-card__title">{s.href === DOCS_PIECES_ROOT ? `The ${countWord(FLEET_AGENTS.length)} pieces` : s.label}</span>
              <span className="d-card__body">{s.blurb}</span>
            </Link>
          ))}
        </div>
      </DocSection>

      <PrevNext href="/docs" />
    </article>
  );
}
