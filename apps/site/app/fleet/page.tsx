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
import { FLEET_AGENTS, type BuiltFleetAgent } from "@/lib/fleet";
import { insideFor } from "@/lib/fleet-presentation";
import { NARABI_ROUTE } from "@/lib/narabi-live";
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

// Static metadata only (ADR-M004 D15): counts spelled as words, never digits; no generateMetadata.
export const metadata: Metadata = {
  title: "Fleet — MONARK",
  description:
    "The MONARK fleet: three agents built and served piece by piece and composed on the gate path, the Narabi redemption sensor now running, and seven more named on the roadmap, on one shared gate.",
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

// A built agent's own surface, keyed by register name: Narabi ships a daily board, Ukemi a method page.
const AGENT_PAGE: Record<string, { href: string; label: string }> = {
  Narabi: { href: NARABI_ROUTE, label: "see it live →" },
  Ukemi: { href: "/ukemi", label: "page →" },
};

// The /fleet route (server component) in charter C (decision 145; mock fleet.html; ruling Q3: /fleet = the
// AGENTS, products stay on /products). It consumes the fleet register (lib/fleet.ts): the four built agents as
// register cards carrying their digit-free served note (wiring.note, ADR-EC E6 — the O-2 header below is asserted
// on the built HTML by scripts/assert-fleet-html.mjs), then the four built panels (the engines' eight-block panels
// and the Narabi panel, contracts read server-side from schemas/), then the seven upcoming agents, each opening a
// data-driven PlaceholderPanel. Status flows from the register, never hard-coded here.
export default function FleetPage() {
  const root = join(process.cwd(), "..", "..");
  const attestedContract = loadAttestedPriceContract(root);
  const coverageContract = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const predictionContract = loadContract(root, "prediction.schema.json", "Ukemi");
  const attestedFlowContract = loadContract(root, "attested-flow.schema.json", "Narabi");
  const built = FLEET_AGENTS.filter((a): a is BuiltFleetAgent => a.status === "built");
  const upcoming = FLEET_AGENTS.filter((a) => a.status === "upcoming");

  return (
    <main className="c-main">
      <div className="c-hero c-hero--single">
        <div>
          <span className="c-label">fleet · register</span>
          <h1 className="c-h1" style={{ marginTop: 8 }}>A company of agents. Four built, seven on the roadmap.</h1>
          <p className="c-lede" style={{ fontSize: 17, marginTop: 12, maxWidth: 720 }}>
            The first vertical is built and served piece by piece and composed on the gate path. Every future act plugs into
            the same gate; every future sensor attests into the same contract. A status word comes from the register, never
            from this page.
          </p>
        </div>
      </div>

      {/* Built — register cards with the digit-free served note (ADR-EC E6). Pinned by
          fleet_register_built_set_is_frozen guard (6) and the O-2 artefact check — deleting the note render reds both. */}
      <section className="c-section" id="built" aria-labelledby="l-built">
        <span className="c-label" id="l-built">How each built agent is served</span>
        <div className="c-reg">
          {built.map((a) => {
            const Mark = AGENT_MARKS[a.name];
            const page = AGENT_PAGE[a.name];
            return (
              <div key={a.name} className="c-card">
                <h3>
                  {Mark ? <Mark /> : null}
                  {a.name} <span className="c-tag c-role">{a.role}</span>
                  <span className={a.name === "Narabi" ? "c-pill c-pill--shipped" : "c-pill c-pill--built"}>
                    {a.name === "Narabi" ? `${a.status} · ships and runs daily` : a.status}
                  </span>
                </h3>
                <p>{a.line}</p>
                <p className="c-regnote">{a.wiring.note}</p>
                {page ? (
                  <Link className="c-mono c-small" href={page.href}>
                    {page.label}
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
        <p className="c-muted c-small" style={{ marginTop: 10 }}>
          An agent is built only when its output is consumed by a served path and that path is replayed by a non-LLM
          integration test. A component whose only consumer is a unit test, a fixture or a demo stays upcoming, whatever the
          state of its code. The three engines are closed under independent review; the sensor ships and runs daily.
        </p>
      </section>

      {/* The four built panels: how it works, how it is built, honest limits, the frozen contract (read from schemas/). */}
      <section className="c-section" id="panels" aria-labelledby="l-panels">
        <span className="c-label" id="l-panels">the built panels · how it works, how it is built, honest limits, frozen contract</span>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ShogenPanel contract={attestedContract} />
          <HikaePanel contract={coverageContract} />
          <UkemiPanel contract={predictionContract} />
          <NarabiPanel contract={attestedFlowContract} />
        </div>
      </section>

      {/* Upcoming — the seven roadmap agents: named, not delivered; each opens its "What it will use" placeholder. */}
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
          Products are wirings of these agents and live on <Link href="/products">/products</Link>, off the fleet count above;
          MONARK Bell is listed there.
        </p>
      </section>
    </main>
  );
}
