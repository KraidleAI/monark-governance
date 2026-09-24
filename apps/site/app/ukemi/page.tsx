import type { Metadata } from "next";
import { UkemiPage } from "@/components/ukemi/ukemi-page";

// Static metadata only (no generateMetadata — no_generate_metadata_in_apps_site). DIGIT-FREE (honesty lint
// scans title/description): the window is said in words, never "24h"; no sample number rides in the head.
//
// FAVICON as a STATIC public asset, NOT a route icon (ruling on sub-lot A deviation D-2, CHANTIERS
// SITE-RELEASE-1-A): a file-based app/ukemi/icon.svg would be served under /ukemi/ and could be SHADOWED by a
// Caddy `handle_path /ukemi/*` (as /narabi/* does). Declared here from apps/site/public/icons/ukemi.svg,
// served at the static /icons path (outside any /ukemi/ path); the built head carries that icon href.
export const metadata: Metadata = {
  title: "Ukemi — liquidation-eligible coverage · MONARK",
  description:
    "Ukemi, the liquidation-exposure measure: a lending book read at one declared block, the oracle price " +
    "path the protocol consulted, and a conformal upper bound on the amount liquidated, per stratum, with " +
    "its named residuals. Never a probability of being right. Read-only.",
  icons: { icon: [{ url: "/icons/ukemi.svg", type: "image/svg+xml" }] },
};

// STATIC server component (no fetch, no "use client"): `next build` renders ukemi.html, which
// scripts/assert-fleet-html.mjs asserts on. The <main> body lives in the UkemiPage component.
export default function Ukemi() {
  return <UkemiPage />;
}
