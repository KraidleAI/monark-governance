# shadcn/ui component provenance — MONARK site (Lot F-public, R-8)

shadcn/ui is a source-copied ("own-the-code") design system, MIT-licensed. It is NOT an npm dependency:
the CLI copies component source into this repo, so R-8 is satisfied by pinning the **CLI version** and
logging **every component copied** (name + registry item version) here.

## Pinned CLI

- `shadcn` CLI: **4.21.0** (npm registry, verified 2026-09-07). Invocation: `npx shadcn@4.21.0 <cmd>`.

## Foundation authored by hand (provenance = worker, not the CLI)

Standard Tailwind/JS, written directly (not shadcn component source):

- `postcss.config.mjs` — Tailwind v4 PostCSS plugin (`@tailwindcss/postcss@4.3.3`).
- `app/globals.css` — `@import "tailwindcss";` baseline (design tokens pending `init`, below).
- `lib/utils.ts` — `cn()` helper (`clsx@2.1.1` + `tailwind-merge@3.6.0`, pinned exact).

## Components copied

_None yet._ The F-1 placeholder page uses built-in Tailwind utilities only.

## `shadcn init` — attempt and outcome (measured 2026-09-07)

`npx shadcn@4.21.0 init -d --no-monorepo` **ran headless successfully** (Next.js + Tailwind v4 detected;
import alias validated; exit 0). So "the CLI works in this environment" is proven.

Its output was **NOT adopted**, because the 4.21.0 **default preset (`base-nova`, selected by `-d`)** is not
a foundation-scope, R-8-clean result:

- dependencies were added as **caret ranges** (violates R-8 exact pinning): `@base-ui/react ^1.8.0`,
  `class-variance-authority ^0.7.1`, `cn ^0.2.6`, `lucide-react ^1.41.0`, `tw-animate-css ^1.4.0`;
- it added the **`shadcn` CLI itself as a runtime dependency** (`^4.21.0`) — a tool, not a runtime peer;
- it switched the primitives to **Base UI** and rewrote `lib/utils.ts` to a `cn` **indirection package**
  (`export { cn } from "cn"`) instead of the classic `clsx` + `tailwind-merge`;
- it wired **`next/font/google` (Geist)** into `app/layout.tsx` — a build-time network fetch the local
  foundation should not require.

The output was reverted by file copy (backup taken before the attempt); the lockfile was reconciled with
`npm install`.

## Formed pending (a DECISION, not a debt) — shadcn base/preset, deferred to F-2

The PLAN (§2) decided **"shadcn/ui"** but did NOT decide the **base/preset** (`-b base|radix|aria`;
`base-nova` vs the classic Radix preset). Adopting the `-d` default silently would be an undecided choice
(P5). F-2 (or a dedicated design-system pass) must:

1. decide the base/preset deliberately (sourced), then run `npx shadcn@4.21.0 init -b <base>` (or the
   classic Radix flow);
2. re-pin every dependency the CLI adds to an **exact** version verified at the registry (R-8), and drop
   the erroneous `shadcn` runtime dependency;
3. decide whether the site self-hosts fonts (no build-time `next/font/google` fetch) for an offline-safe
   local build;
4. log every component copied (`npx shadcn@4.21.0 add <name>`) here with its registry item version.

Until then the foundation keeps the classic, exact-pinned `cn()` (`clsx@2.1.1` + `tailwind-merge@3.6.0`)
and a bare `@import "tailwindcss";`; `components.json` is intentionally **absent** (not hand-written —
ADR-M004 D2 "design system, not a template").
