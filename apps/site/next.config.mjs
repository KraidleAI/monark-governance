// apps/site/next.config.mjs — Next.js App Router config for the MONARK storefront (ADR-M004 D2 addendum).
// @next/mdx (Vercel-maintained) renders the committed MDX content pages; its peers @mdx-js/loader and
// @mdx-js/react are pinned in package.json. No deployment config here — local `next dev` only;
// hosting (Cloudflare + VPS) is the F-deploy increment (ADR-M004 Q2, out of this lot).
import createMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Routes come from .ts/.tsx plus committed MDX (content/, F-2). `.md` is deliberately NOT a page
  // extension, so a stray content .md is never turned into a route — and, being neither a route nor
  // matched by any MDX loader, `.md` is never a rendered surface, so the honesty lint does NOT scan
  // it (F-2a D1); only .mdx is scanned as rendered prose — apps/site/test/honesty-lint.ts.
  pageExtensions: ["ts", "tsx", "mdx"],
  // Local review only: in production Caddy serves /narabi/* (the sentinel's published files) before Next
  // ever sees the request, so this rewrite is unreachable there. Under `next dev` it proxies the two
  // published files from the live host so the links on /narabi resolve during review instead of 404ing.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [{ source: "/narabi/:file(state.json|timeline.jsonl)", destination: "https://monarkgate.tech/narabi/:file" }];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
