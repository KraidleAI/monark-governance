// apps/site/next.config.mjs — Next.js App Router config for the MONARK storefront (ADR-M004 D2 addendum).
// @next/mdx (Vercel-maintained) renders the committed MDX content pages; its peers @mdx-js/loader and
// @mdx-js/react are pinned in package.json (R-8). No deployment config here — local `next dev` only;
// hosting (Cloudflare + VPS) is the F-deploy increment (ADR-M004 Q2, out of this lot).
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Routes come from .ts/.tsx plus committed MDX (content/, F-2). `.md` is deliberately NOT a page
  // extension, so a stray content .md is never silently turned into a route (matches this comment's
  // intent). The honesty lint still scans .md defensively as MDX prose — apps/site/test/honesty-lint.ts.
  pageExtensions: ["ts", "tsx", "mdx"],
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
