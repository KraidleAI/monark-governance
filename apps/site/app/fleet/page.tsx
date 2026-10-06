import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { join } from "node:path";
import Link from "next/link";
import { ShogenPanel } from "@/components/shogen-panel";
import { HikaePanel } from "@/components/hikae-panel";
import { UkemiPanel } from "@/components/ukemi-panel";
import { NarabiPanel } from "@/components/narabi-panel";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import { loadAttestedPriceContract, loadContract } from "@/lib/load-contract";
import {
  FLEET_AGENTS,
  SHARED_GATE,
  builtAgents,
  upcomingAgents,
  builtProducts,
  upcomingProducts,
  countWord,
  capitalized,
  listNames,
} from "@/lib/fleet";
import { insideFor } from "@/lib/fleet-presentation";
import { LIQ_EMPTY_REGISTRY_SENTENCE, LIQ_COMMITTED_STATE_NOTE } from "@/lib/ukemi-copy";
import { loadUkemiServed } from "@/lib/ukemi-served-load";
import { agentPages } from "./agent-pages";
import { NarabiFreshness } from "./narabi-freshness";
import { narabiFreshnessProps } from "./narabi-freshness-props";
import { ShogenMark } from "@/components/marks/shogen-mark";
import { HikaeMark } from "@/components/marks/hikae-mark";
import { UkemiMark } from "@/components/marks/ukemi-mark";
import { MokugekiMark } from "@/components/marks/mokugeki-mark";
import { NarabiMark } from "@/components/marks/narabi-mark";
import { KaihiMark } from "@/components/marks/kaihi-mark";
import { KessaiMark } from "@/components/marks/kessai-mark";
import { KamaeMark } from "@/components/marks/kamae-mark";
import { KyokusenMark } from "@/components/marks/kyokusen-mark";
import { KoyomiMark } from "@/components/marks/koyomi-mark";
import { GenkanMark } from "@/components/marks/genkan-mark";

// Static metadata only: counts spelled as words DERIVED from the register at build, never digits and never typed; no
// generateMetadata.
export const metadata: Metadata = {
  title: "Fleet — MONARK",
  description: `The MONARK fleet: ${countWord(builtAgents().length)} agents built and served piece by piece and composed on the gate path, and ${countWord(upcomingAgents().length)} more named on the roadmap, on one shared gate.`,
};

// Marks for every register agent, keyed by register name.
const AGENT_MARKS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Shōgen: ShogenMark,
  Hikae: HikaeMark,
  Ukemi: UkemiMark,
  Mokugeki: MokugekiMark,
  Narabi: NarabiMark,
  Kaihi: KaihiMark,
  Kessai: KessaiMark,
  Kamae: KamaeMark,
  Kyokusen: KyokusenMark,
  Koyomi: KoyomiMark,
  Genkan: GenkanMark,
};

// What the SERVED gate says today about a built agent's class, beside its register note, per the state the committed
// served record (apps/site/data/ukemi-served.json) holds: empty, the served sentence itself, read from a module pinned
// byte-identical to the served description (lib/ukemi-copy.ts), never a paraphrase; committed, the site's digit-free
// restatement (the served clause carries figures this page does not print yet). The root test
// registry_notes_track_served_descriptions reds while that record and the served gate description disagree.
const SERVED_STATE: Readonly<Record<"empty" | "committed", Readonly<Record<string, string>>>> = {
  empty: { Ukemi: LIQ_EMPTY_REGISTRY_SENTENCE },
  committed: { Ukemi: LIQ_COMMITTED_STATE_NOTE },
};

/** The register status of a named agent (fail-closed: a panel never renders a status the register does not hold). */
function statusOf(name: string): "built" | "upcoming" {
  const a = FLEET_AGENTS.find((x) => x.name === name);
  if (!a) throw new Error(`fleet: agent '${name}' is absent from the fleet register (lib/fleet.ts)`);
  return a.status;
}

// The /fleet route (server component) in charter C (/fleet = the AGENTS, applications stay on /applications). It consumes
// the fleet register (lib/fleet.ts): the built agents as register cards carrying their digit-free served note
// (wiring.note — the O-2 header below is asserted on the built HTML by scripts/assert-fleet-html.mjs) and, where the
// served gate states one, the served sentence of the agent's class (said while the committed served record,
// apps/site/data/ukemi-served.json, holds the empty registry; its digit-free restatement while that record holds a
// committed one); Narabi's card carries the freshness line, judged against
// the served schedule; then the built panels (the engines' eight-block panels and the Narabi panel, contracts read
// server-side from schemas/, the Shōgen, Hikae and Narabi card status handed in from the register); then the upcoming
// agents, each opening a data-driven PlaceholderPanel. Every status, every agent and application count and every listed
// name flows from the register, never typed here; the prose around them is fixed copy (the engine sentence below is
// /roadmap's phase one, word for word).
export default function FleetPage() {
  const root = join(process.cwd(), "..", "..");
  const ukemiServed = loadUkemiServed(root);
  const narabiFreshness = narabiFreshnessProps(root);
  const attestedContract = loadAttestedPriceContract(root);
  const coverageContract = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const predictionContract = loadContract(root, "prediction.schema.json", "Ukemi");
  const attestedFlowContract = loadContract(root, "attested-flow.schema.json", "Narabi");
  const built = builtAgents();
  const upcoming = upcomingAgents();
  const productsBuilt = builtProducts().map((p) => p.name);
  const productsUpcoming = upcomingProducts();
  // "each cleared by the shared gate" is said only while it holds for every upcoming product (register wiring).
  const upcomingOnSharedGate = productsUpcoming.every((p) => p.wiring.gate === SHARED_GATE);

  return (
    <main className="c-main">
      <div className="c-hero c-hero--single">
        <div>
          <span className="c-label">fleet · register</span>
          <h1 className="c-h1" style={{ marginTop: 8 }}>
            {capitalized(countWord(built.length + upcoming.length))} smart pieces. {capitalized(countWord(built.length))} built,{" "}
            {countWord(upcoming.length)} on the roadmap.
          </h1>
          <p className="c-lede" style={{ fontSize: 17, marginTop: 12, maxWidth: 720 }}>
            The first vertical is built and served piece by piece and composed on the gate path. Every future act plugs into
            the same gate; every future sensor attests into the same contract. A status word comes from the register, never
            from this page.
          </p>
        </div>
      </div>

      {/* Built — register cards with the digit-free served note. Pinned by fleet_register_built_set_is_frozen guard (6)
          and the O-2 artefact check — deleting the note render reds both. */}
      <section className="c-section" id="built" aria-labelledby="l-built">
        <span className="c-label" id="l-built">How each built agent is served</span>
        <div className="c-reg">
          {built.map((a) => {
            const Mark = AGENT_MARKS[a.name];
            const pages = agentPages(a.name);
            const servedState = SERVED_STATE[ukemiServed.registry_state][a.name];
            return (
              <div key={a.name} className="c-card">
                <h3>
                  {Mark ? <Mark /> : null}
                  {a.name} <span className="c-tag c-role">{a.role}</span>
                  <span className={a.name === "Narabi" ? "c-pill c-pill--shipped" : "c-pill c-pill--built"}>{a.status}</span>
                </h3>
                <p>{a.line}</p>
                <p className="c-regnote">{a.wiring.note}</p>
                {servedState !== undefined ? <p className="c-regnote">On the served gate today: {servedState}.</p> : null}
                {a.name === "Narabi" ? (
                  <p className="c-regnote">
                    <NarabiFreshness schedule={narabiFreshness.schedule} capture={narabiFreshness.capture} />
                  </p>
                ) : null}
                {pages.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {pages.map((page) => (
                      <Link key={page.href} className="c-mono c-small" href={page.href}>
                        {page.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          An agent is built only when its output is consumed by a served path and that path is replayed by a non-LLM
          integration test. A component whose only consumer is a unit test, a fixture or a demo stays upcoming, whatever the
          state of its code. Hikae and Ukemi engines complete; interface frozen.
        </p>
      </section>

      {/* The built panels: how it works, how it is built, honest limits, the frozen contract (read from schemas/). */}
      <section className="c-section" id="panels" aria-labelledby="l-panels">
        <span className="c-label" id="l-panels">the built panels · how it works, how it is built, honest limits, frozen contract</span>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ShogenPanel contract={attestedContract} status={statusOf("Shōgen")} />
          <HikaePanel contract={coverageContract} status={statusOf("Hikae")} />
          <UkemiPanel contract={predictionContract} />
          <NarabiPanel contract={attestedFlowContract} status={statusOf("Narabi")} />
        </div>
      </section>

      {/* Upcoming — the roadmap agents: named, not delivered; each opens its "What it will use" placeholder. */}
      <section className="c-section" id="upcoming" aria-labelledby="l-upcoming">
        <span className="c-label" id="l-upcoming">upcoming · named, not delivered · one sentence each, no date, no segment, no metric</span>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {upcoming.map((a) => {
            const Mark = AGENT_MARKS[a.name];
            return (
              <PlaceholderPanel
                key={a.name}
                mark={Mark ? <Mark className="size-10" /> : undefined}
                name={a.name}
                line={a.line}
                inside={insideFor(a.name.toLowerCase())}
                status={a.status}
              />
            );
          })}
        </div>
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          Applications are listed on the <Link href="/applications">applications page</Link>, off the agent count above.
          {productsBuilt.length > 0 ? (
            <>
              {" "}
              {listNames(productsBuilt)} {productsBuilt.length === 1 ? "is" : "are"} built on {productsBuilt.length === 1 ? "its" : "their"} own
              served path.
            </>
          ) : null}
          {productsUpcoming.length > 0 && upcomingOnSharedGate ? (
            <>
              {" "}
              The {countWord(productsUpcoming.length)} upcoming applications are each cleared by the shared gate.
            </>
          ) : null}
        </p>
      </section>
    </main>
  );
}
