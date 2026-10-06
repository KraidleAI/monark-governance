// apps/site/next.config.mjs — Next.js App Router config for the MONARK storefront.
// @next/mdx (Vercel-maintained) renders the committed MDX content pages; its peers @mdx-js/loader and
// @mdx-js/react are pinned in package.json. No deployment config here — local `next dev` only;
// hosting (Cloudflare + VPS) is configured outside this repository.
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
  // Same for /dojo-served/* (the Dojo host's published files, relayed in production by the site's proxy snippet
  // deploy/Caddyfile.monark-dojo-site.snippet): under `next dev` only, so the /dojo reread resolves during review.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [{ source: "/narabi/:file(state.json|timeline.jsonl)", destination: "https://monarkgate.tech/narabi/:file" },
      { source: "/dojo-served/:path*", destination: "https://dojo.monarkgate.tech/:path*" }];
  },
  // /building is the page title of /roadmap (MONARK Building); the route keeps its address for the links that exist, and the
  // alias redirects to it (temporary, so the canonical address can still change without a cached permanent redirect).
  // The applications page moved to /applications; its former address redirects to it permanently (the new address is
  // final, so a cached permanent redirect is intended there).
  async redirects() {
    return [
      { source: "/building", destination: "/roadmap", permanent: false },
      { source: "/products", destination: "/applications", permanent: true },
    ];
  },
  // Bell anchors: `.ots` is ALSO the OpenDocument spreadsheet-template extension, so the static
  // server would label an OpenTimestamps proof as a spreadsheet (measured locally). Serve the proofs as bytes to
  // download; manifests stay text/plain.
  async headers() {
    return [
      {
        source: "/bell/anchors/:file(.+\\.ots)",
        headers: [
          { key: "Content-Type", value: "application/octet-stream" },
          { key: "Content-Disposition", value: "attachment" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({});

export default withMDX(nextConfig);
