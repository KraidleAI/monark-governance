import type { Metadata } from "next";
import Link from "next/link";
import { StatusBadge } from "@/components/status-badge";
import { FLEET_AGENTS } from "@/lib/fleet";

// Static metadata only (ADR-M004 D14 / PLAN F-2c §2): no number in title/description (honesty lint
// §6b scans them), and NO generateMetadata — that would render into <title>/<meta> yet escape the §6b
// scan (F-2b guard no_generate_metadata_in_apps_site).
export const metadata: Metadata = {
  title: "Roadmap — MONARK",
  description: "The MONARK fleet roadmap: the agents on the way, and the built agents they extend.",
};

// The /roadmap route (server component). It consumes the fleet register (lib/fleet.ts) — the built set
// links back to the home-page panels (one source of truth, no duplicated panels), and the upcoming set
// renders as non-openable teasers. The FIVE products do NOT appear here (they live behind the home
// segment cards), so "three built, eight on the roadmap" stays true (C-9).
export default function RoadmapPage() {
  const built = FLEET_AGENTS.filter((a) => a.status === "built");
  const upcoming = FLEET_AGENTS.filter((a) => a.status === "upcoming");
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <section className="flex flex-col gap-4">
        <Link
          href="/"
          className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Back to MONARK
        </Link>
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-primary">Fleet roadmap</h1>
        <p className="max-w-3xl text-lg text-foreground">
          The fleet is three built agents and eight more on the way. A product is a wiring of fleet
          agents; the agent is the engine.
        </p>
        <p className="max-w-3xl text-sm text-muted-foreground">
          The products that wire these agents together are entered by segment on the{" "}
          <Link href="/" className="underline underline-offset-4 hover:text-foreground">
            home page
          </Link>
          ; this page is the agents themselves.
        </p>
      </section>

      {/* Built agents — a renvoi to their home-page panels; not duplicated here (item 1). */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Built</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Built end to end and closed under independent review. Each one keeps its full panel on the{" "}
          <Link href="/#fleet" className="underline underline-offset-4 hover:text-foreground">
            home page
          </Link>
          .
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {built.map((a) => (
            <li key={a.name} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-medium text-card-foreground">{a.name}</h3>
                <StatusBadge status={a.status} className="ml-auto" />
              </div>
              <p className="text-sm text-muted-foreground">{a.line}</p>
              <Link
                href="/#fleet"
                className="mt-auto pt-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                Open its panel on the home page
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Upcoming agents — teasers: name, one sourced line, an Upcoming badge. Non-openable (nothing
          built to open); the wording is the verbatim register line (deck + memstack; docs/G1-lot-F2c.md). */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">On the roadmap</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Named, not built. Each will attest, gate, or act on the same backbone.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((a) => (
            <li key={a.name} className="flex flex-col gap-2 rounded-xl border bg-card p-5">
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-medium text-card-foreground">{a.name}</h3>
                <StatusBadge status={a.status} className="ml-auto" />
              </div>
              <p className="text-sm text-muted-foreground">{a.line}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
