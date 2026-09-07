# shadcn/ui component provenance — MONARK site (Lot F-public, R-8)

shadcn/ui is a source-copied ("own-the-code") design system, MIT-licensed. It is NOT an npm dependency:
the CLI copies component source into this repo, so R-8 is satisfied by pinning the **CLI version** and
logging **every component copied** (name + registry item version) here.

## Pinned CLI

- `shadcn` CLI: **4.21.0** (npm registry, verified 2026-09-07). Invocation: `npx shadcn@4.21.0 <cmd>`.

## Foundation authored by hand (provenance = worker, not the CLI)

Standard Tailwind/JS, written directly (not shadcn component source):

- `postcss.config.mjs` — Tailwind v4 PostCSS plugin (`@tailwindcss/postcss@4.3.3`).
- `app/globals.css` — navy/gold design tokens + kanji secondary font token (Lot F-2a); `@import "tailwindcss"` + `@import "tw-animate-css"`.
- `lib/utils.ts` — `cn()` helper (`clsx@2.1.1` + `tailwind-merge@3.6.0`, pinned exact).

## Components copied (own-the-code)

| Component | Base / preset | Copied via | Note |
|---|---|---|---|
| `components/ui/button.tsx` | base / nova | `npx shadcn@4.21.0 add -c apps/site button` | `import { cn } from "cn"` redirected → `@/lib/utils`; `cva` variants |
| `components/ui/dialog.tsx` | base / nova | `npx shadcn@4.21.0 add -c apps/site dialog` | `"use client"`; `cn` → `@/lib/utils`; uses `lucide-react` XIcon + tw-animate-css |

`components/rsc-boundary-demo.tsx` is authored by the worker (NOT the CLI): the RSC-boundary oracle
(C5) — a client Dialog+Button rendered by the server page `app/page.tsx` (`next build` compiles the
boundary; runtime hydration = manual `next dev` CA).

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

## Lot F-2a — base/preset resolved (2026-09-07, worker `claude-opus-4-8`, ADR-M004 D2-ter)

Runtime deps added by Base UI, all **pinned EXACT** (R-8; each = registry `latest` verified
2026-09-07): `@base-ui/react 1.8.0`, `class-variance-authority 0.7.1`, `lucide-react 1.41.0`,
`tw-animate-css 1.4.0`. The four F-1 pending items are resolved:

1. **Base = Base UI, preset = `nova`** (`nova` is shadcn's documented Base UI default, one of 8 base
   styles). Chosen deliberately, not silently defaulted (D2-ter C9); the
   navy/gold tokens override the palette. Command:
   `npx shadcn@4.21.0 init -c apps/site -b base -p nova --no-monorepo --no-rtl --no-pointer -y`.
   `components.json` written (`style: base-nova`, `rsc: true`, `aliases.utils: @/lib/utils`).
2. **`shadcn` runtime dep dropped.** `init` added it only because it wrote `@import "shadcn/tailwind.css"`
   (629 lines of `@custom-variant`/`@utility`/keyframes). The copied Button/Dialog reference only two
   blocks (`@custom-variant data-open` / `data-closed`, dialog transitions); those were inlined verbatim
   (MIT) into `globals.css` and the import + dep removed — cheaper than `eject` (inlines all 629 → R-25)
   and R-8-clean (CLI never a runtime dep). Unreferenced utilities re-inlined per future component.
3. **Fonts self-hosted.** `init` wired Geist via `next/font/google` (build-time fetch) into `layout.tsx`;
   removed for an offline-safe build (PLAN §3). `--font-sans`/`--font-heading`/`--font-kanji` are
   system-stack CSS tokens.
4. **`cn` = keep the local `cn()`** (`clsx@2.1.1` + `tailwind-merge@3.6.0`); the copied components'
   `import { cn } from "cn"` redirected to `@/lib/utils`, the `cn` package dropped. Why: `cn@0.2.6` is a
   compiled from-scratch reimplementation of clsx+tailwind-merge (own engine/tables), a general drop-in —
   NOT a Base-UI-specific config the components depend on; they only call `cn()` with standard Tailwind
   utilities. R-8 minimalism + F-1 consistency + own-the-code.

**No `--dry-run`:** shadcn 4.21.0 `init` exposes none (`init --help` lists no such flag; the CLI rejects
`--dry-run` as an unknown option). Faithful equivalent = run `init` on the git-clean tree, read the
`git diff`. **Anti-collision (C11):** `@base-ui/react` is the package; `@base-ui-components/react` is
absent from `apps/site/package.json` and `package-lock.json` (test `no_base_ui_components_collision`).

## Note for F-2b — vocab scope `site` vs the honest fleet-invariant copy

The `site` scope bans `\bconfidence\b` (C6). MONARK's honest fleet-invariant copy ("no confidence
field / score", README l.67-71) uses that exact word and WILL redden the gate — and it cannot simply
be reworded, because the honesty claim *is* about the absence of a "confidence" field. Resolve by a
scoped ADR: either a closed exempt phrase (the pattern used by `honesty-lint.exempt.json` /
`scripts/lang-exempt.json`) or a negation-aware pattern. A formed pending, not a naked due.
