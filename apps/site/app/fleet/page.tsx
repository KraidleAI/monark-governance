import type { Metadata } from "next";
import type { ComponentType, SVGProps } from "react";
import { join } from "node:path";
import { ShogenPanel } from "@/components/shogen-panel";
import { HikaePanel } from "@/components/hikae-panel";
import { UkemiPanel } from "@/components/ukemi-panel";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import { loadAttestedPriceContract, loadContract } from "@/lib/load-contract";
import { FLEET_AGENTS } from "@/lib/fleet";
import { insideFor } from "@/lib/fleet-presentation";
import { NARABI_ROUTE } from "@/lib/narabi-live";
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
    "The MONARK fleet: three agents built end to end, the Narabi redemption sensor now running, and seven more named on the roadmap, on one shared gate.",
};

// Marks for the register agents rendered here without a bespoke panel (F-site-2): the seven roadmap agents
// and the built Narabi sensor (ADR-M012 M012-e, shown via builtSensors below), keyed by register name. None
// carries a diacritic, so the INSIDE slug is a.name.toLowerCase() (Shōgen, a review-closed engine, has its
// own panel).
const AGENT_MARKS: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  Mokugeki: MokugekiMark,
  Narabi: NarabiMark,
  Kaihi: KaihiMark,
  Kessai: KessaiMark,
  Kamae: KamaeMark,
  Kyokusen: KyokusenMark,
  Koyomi: KoyomiMark,
  Genkan: GenkanMark,
};

// A built sensor's own live surface, keyed by register name (mirrors AGENT_MARKS): Narabi ships a daily
// board at /narabi. A future built sensor adds its own route here; the link is absent for the rest.
const AGENT_LIVE: Record<string, string> = {
  Narabi: NARABI_ROUTE,
};

// The /fleet route (server component). It consumes the fleet register (lib/fleet.ts): the three engines
// reuse their home-page panels (one source of truth, contracts read server-side from schemas/); any other
// built agent (ADR-M012 M012-e: Narabi) renders from the register via the shared PlaceholderPanel; and the
// seven upcoming agents each open a data-driven PlaceholderPanel carrying the sourced register line and the
// Mod #1 "What it will use" block. Status flows from the register, never hard-coded here. The five products
// are NOT here (they live on /products and behind the home segment cards), so "four built, seven on the
// roadmap" stays true.
export default function FleetPage() {
  const root = join(process.cwd(), "..", "..");
  const attestedContract = loadAttestedPriceContract(root);
  const coverageContract = loadContract(root, "coverage-verdict.schema.json", "Hikae");
  const predictionContract = loadContract(root, "prediction.schema.json", "Ukemi");
  const ENGINE_NAMES = new Set(["Shōgen", "Hikae", "Ukemi"]);
  const builtSensors = FLEET_AGENTS.filter((a) => a.status === "built" && !ENGINE_NAMES.has(a.name));
  const upcoming = FLEET_AGENTS.filter((a) => a.status === "upcoming");

  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      <section className="flex flex-col gap-4">
        <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Fleet</div>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground">
          A company of agents. Four built, seven on the roadmap.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          The first vertical is built end to end: Shōgen, then Hikae, then Ukemi. Every future act plugs
          into the same gate; every future sensor attests into the same contract.
        </p>
      </section>

      {/* Built — the three engines reuse their eight-block panels under the review-closed pill. Any other
          built agent (ADR-M012 M012-e: Narabi, the redemption sensor) renders below via the shared
          register-driven PlaceholderPanel, OUTSIDE that pill — it ships and runs daily, it is not a
          Phase-one review-closed engine. The real Narabi panel is a designer lot (ADR-M012 D4). */}
      <section className="mt-12">
        <div className="mb-4 flex items-center gap-3">
          <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">Built</h2>
          <span className="rounded-full border border-accent/50 px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            closed under independent review
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <ShogenPanel contract={attestedContract} />
          <HikaePanel contract={coverageContract} />
          <UkemiPanel contract={predictionContract} />
        </div>
        {builtSensors.length > 0 ? (
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="font-heading text-base font-medium tracking-tight text-foreground">
                Built &mdash; the redemption sensor
              </h3>
              <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
                ships and runs daily
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {builtSensors.map((a) => {
                const Mark = AGENT_MARKS[a.name];
                return (
                  <PlaceholderPanel
                    key={a.name}
                    mark={Mark ? <Mark className="size-10" /> : undefined}
                    name={a.name}
                    line={a.line}
                    inside={insideFor(a.name.toLowerCase())}
                    status={a.status}
                    liveHref={AGENT_LIVE[a.name]}
                    liveLabel="See it live"
                  />
                );
              })}
            </div>
          </div>
        ) : null}
      </section>

      {/* Upcoming — the seven roadmap agents. Named, not delivered; each opens its "What it will use"
          placeholder. The one-line descriptor is the sourced register line (lib/fleet.ts), not the
          design's unsourced copy. */}
      <section className="mt-16">
        <div className="mb-2 flex items-center gap-3">
          <h2 className="font-heading text-xl font-medium tracking-tight text-foreground">Upcoming</h2>
          <span className="rounded-full border border-border px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            named, not delivered
          </span>
        </div>
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          One sentence on what each agent does. No date, no segment, no metric &mdash; nothing is claimed
          for an agent that is not built.
        </p>
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
      </section>
    </main>
  );
}
