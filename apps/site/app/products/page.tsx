import type { Metadata } from "next";
import { UpcomingPanel } from "@/components/upcoming-panel";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import { PRODUCTS } from "@/lib/fleet";
import { VISAGE } from "@/lib/visage";
import { insideFor } from "@/lib/fleet-presentation";

// Static metadata only (ADR-M004 D15): no number in title/description (honesty lint §6b scans them),
// and NO generateMetadata (guard no_generate_metadata_in_apps_site).
export const metadata: Metadata = {
  title: "Products — MONARK",
  description:
    "Market-facing MONARK products by the profile that needs them, and the artefacts sold to a named buyer. Every product is upcoming — a wiring of fleet agents on one gate.",
};

// The /products route (server component). Two registers, two sections (design screen-label "Products" +
// "Core products"): the FIVE products (fingers) read from lib/fleet.ts — each opens its C-10-safe
// UpcomingPanel placeholder (no per-node "Built" pill) — and the THREE VISAGE artefacts read from
// lib/visage.ts, each a PlaceholderPanel with its named buyer and the Mod #1 "What it will use" block.
// The eight-profile picker is NOT here (it lives on the home page, F-site-4); each product the picker
// targets exists here as a panel (mapping E-1). All eight are upcoming; the mapping and copy come from
// the registers, never hard-coded. The design INVERTS the segment↔product mapping — we follow fleet.ts.
export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      <section className="flex flex-col gap-4">
        <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Products</div>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground">
          Market-facing products, by the profile that needs them.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A client installs one visible piece &mdash; the act that matches their need &mdash; while the
          sensors and the gate stay behind it. Every product is upcoming: a wiring of fleet agents on the
          same gate.
        </p>
      </section>

      {/* The five products (fingers) — fleet.ts is the source of truth for the mapping and the status. */}
      <section className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.map((p) => (
            <UpcomingPanel key={p.key} product={p} />
          ))}
        </div>
      </section>

      {/* Core products — the three VISAGE artefacts (uid 28b02686), each sold to a named buyer. Distinct
          register (lib/visage.ts); never folded into PRODUCTS (keeps PRODUCTS.length === 5). */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Core products</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Three artefacts, each sold to a named buyer. All upcoming.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VISAGE.map((v) => (
            <PlaceholderPanel
              key={v.key}
              name={v.name}
              sub={v.tagline}
              line={v.what}
              soldTo={v.buyers}
              inside={insideFor(v.key)}
              status={v.status}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
