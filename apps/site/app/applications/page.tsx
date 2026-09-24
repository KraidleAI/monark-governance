import type { Metadata } from "next";
import { UpcomingPanel } from "@/components/upcoming-panel";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import {
  builtProducts,
  upcomingProducts,
  productStatusSentence,
  countWord,
  capitalized,
  type BuiltFleetProduct,
} from "@/lib/fleet";
import { VISAGE } from "@/lib/visage";
import { insideFor } from "@/lib/fleet-presentation";
import { loadBellServed, bellServedRepoRoot, BELL_HOST, BELL_TIMELINE_PATH } from "@/lib/bell-served-load";
import { BuiltApplicationCard, type BuiltApplicationFact, type BuiltApplicationLink } from "./built-application-card";

// The status sentence of the applications, DERIVED from the register (lib/fleet.ts productStatusSentence): used by the
// static metadata AND the lede, so neither can drift from the register.
const PRODUCT_STATUS_SENTENCE = productStatusSentence();

// Static metadata only: no number in title/description (honesty lint §6b scans them), and NO generateMetadata (guard
// no_generate_metadata_in_apps_site). The status sentence is derived from the register at build. The route is
// /applications; its former address redirects to it permanently (next.config.mjs).
export const metadata: Metadata = {
  title: "Applications — MONARK",
  description: `The on-chain applications the MONARK engine powers, by the profile that needs them, and the artefacts sold to a named buyer. ${PRODUCT_STATUS_SENTENCE}`,
};

// A built application's own page on the site, keyed by its register key.
const PRODUCT_PAGE: Readonly<Record<string, string>> = { bell: "/bell" };

/** The served facts a built application carries on this page, read from committed, hashed data (never typed): the
 *  latest signed publication (`head`) of the served timeline. */
function factsFor(product: BuiltFleetProduct): BuiltApplicationFact[] {
  if (product.key !== "bell") return [];
  const record = loadBellServed(bellServedRepoRoot()).head;
  return [{ label: "latest signed record", value: `seq ${String(record.seq)} · published ${record.published_at} (UTC)` }];
}

/** Where a built application can be opened: its own page, then the served file anyone can read (Bell: the signed timeline). */
function linksFor(product: BuiltFleetProduct): BuiltApplicationLink[] {
  const links: BuiltApplicationLink[] = [];
  const page = PRODUCT_PAGE[product.key];
  if (page !== undefined) links.push({ href: page, label: `Open ${product.name} →`, external: false });
  if (product.key === "bell") links.push({ href: BELL_HOST + BELL_TIMELINE_PATH, label: "the signed timeline →", external: true });
  return links;
}

// The /applications route (server component), rendered as the applications page. Three registers, three sections: the BUILT
// applications (lib/fleet.ts, status "built": MONARK Bell), each a server-rendered BuiltApplicationCard carrying its served
// note and served facts; the UPCOMING applications (fingers, status "upcoming"), each opening its C-10-safe UpcomingPanel
// placeholder (only upcoming applications ever reach that panel, whose "to be announced" line and "a wiring of fleet
// agents" sentence are true of them alone); and the THREE VISAGE artefacts (lib/visage.ts), each a PlaceholderPanel with
// its named buyer and the "What it will use" block. The eight-profile picker is NOT here (it lives on the home page).
// Every status, name and count comes from the registers, never typed here.
export default function ProductsPage() {
  const built = builtProducts();
  const upcoming = upcomingProducts();
  return (
    <main className="mx-auto max-w-[1200px] px-6 py-16">
      <section className="flex flex-col gap-4">
        <div className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">Applications</div>
        <h1 className="max-w-3xl font-heading text-4xl font-semibold tracking-tight text-foreground">
          The on-chain applications the engine powers, by the profile that needs them.
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          A client installs one visible piece &mdash; the act that matches their need &mdash; while the
          sensors and the gate stay behind it. {PRODUCT_STATUS_SENTENCE}
        </p>
      </section>

      {/* Built applications — server-rendered cards: served note + served facts from committed, hashed data. */}
      {built.length > 0 ? (
        <section className="mt-10" aria-labelledby="l-built-products">
          <div id="l-built-products" className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
            Built · served on a tested path
          </div>
          <div className="mt-4 grid max-w-3xl gap-4">
            {built.map((p) => (
              <BuiltApplicationCard key={p.key} product={p} inside={insideFor(p.key)} facts={factsFor(p)} links={linksFor(p)} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Upcoming applications — each opens its placeholder; only upcoming ones reach UpcomingPanel. */}
      <section className="mt-10" aria-labelledby="l-upcoming-products">
        <div id="l-upcoming-products" className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
          Upcoming · named, not delivered
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.map((p) => (
            <UpcomingPanel key={p.key} product={p} />
          ))}
        </div>
      </section>

      {/* The three VISAGE artefacts, each sold to a named buyer. Distinct register (lib/visage.ts); never folded
          into PRODUCTS (PRODUCTS is frozen at six by the register test). */}
      <section className="mt-16">
        <h2 className="font-heading text-2xl font-medium tracking-tight text-foreground">Artefacts for a named buyer</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {capitalized(countWord(VISAGE.length))} artefacts, each sold to a named buyer.{" "}
          {VISAGE.every((v) => v.status === "upcoming") ? "All upcoming." : "Each carries its own status."}
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
