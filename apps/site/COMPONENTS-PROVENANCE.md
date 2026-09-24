# shadcn/ui component provenance — MONARK site

shadcn/ui is a source-copied ("own-the-code") design system, MIT-licensed. It is NOT an npm dependency:
the CLI copies component source into this repo, so the exact-pinning requirement is satisfied by pinning the **CLI version** and
logging **every component copied** (name + registry item version) here.

## Pinned CLI

- `shadcn` CLI: **4.21.0** (npm registry, verified 2026-09-07). Invocation: `npx shadcn@4.21.0 <cmd>`.

## Foundation authored by hand (provenance = authored directly, not the CLI)

Standard Tailwind/JS, written directly (not shadcn component source):

- `postcss.config.mjs` — Tailwind v4 PostCSS plugin (`@tailwindcss/postcss@4.3.3`).
- `app/globals.css` — navy/gold design tokens + kanji secondary font token; `@import "tailwindcss"` + `@import "tw-animate-css"`.
- `lib/utils.ts` — `cn()` helper (`clsx@2.1.1` + `tailwind-merge@3.6.0`, pinned exact).

## Components copied (own-the-code)

| Component | Base / preset | Copied via | Note |
|---|---|---|---|
| `components/ui/button.tsx` | base / nova | `npx shadcn@4.21.0 add -c apps/site button` | `import { cn } from "cn"` redirected → `@/lib/utils`; `cva` variants |
| `components/ui/dialog.tsx` | base / nova | `npx shadcn@4.21.0 add -c apps/site dialog` | `"use client"`; `cn` → `@/lib/utils`; uses `lucide-react` XIcon + tw-animate-css |

`components/rsc-boundary-demo.tsx` is authored directly (NOT the CLI): the RSC-boundary oracle
(C5) — a client Dialog+Button rendered by the server page `app/page.tsx` (`next build` compiles the
boundary; runtime hydration = manual `next dev` CA).

## `shadcn init` — attempt and outcome (measured 2026-09-07)

`npx shadcn@4.21.0 init -d --no-monorepo` **ran headless successfully** (Next.js + Tailwind v4 detected;
import alias validated; exit 0). So "the CLI works in this environment" is proven.

Its output was **NOT adopted**, because the 4.21.0 **default preset (`base-nova`, selected by `-d`)** is not
a foundation-scope, exact-pinning-clean result:

- dependencies were added as **caret ranges** (violates exact pinning): `@base-ui/react ^1.8.0`,
  `class-variance-authority ^0.7.1`, `cn ^0.2.6`, `lucide-react ^1.41.0`, `tw-animate-css ^1.4.0`;
- it added the **`shadcn` CLI itself as a runtime dependency** (`^4.21.0`) — a tool, not a runtime peer;
- it switched the primitives to **Base UI** and rewrote `lib/utils.ts` to a `cn` **indirection package**
  (`export { cn } from "cn"`) instead of the classic `clsx` + `tailwind-merge`;
- it wired **`next/font/google` (Geist)** into `app/layout.tsx` — a build-time network fetch the local
  foundation should not require.

The output was reverted by file copy (backup taken before the attempt); the lockfile was reconciled with
`npm install`.

## Base/preset resolved (2026-09-07, ADR-M004 D2-ter)

Runtime deps added by Base UI, all **pinned EXACT** (each = registry `latest` verified
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
   (MIT) into `globals.css` and the import + dep removed — cheaper than `eject` (inlines all 629)
   and exact-pinning-clean (CLI never a runtime dep). Unreferenced utilities re-inlined per future component.
3. **Fonts self-hosted.** `init` wired Geist via `next/font/google` (build-time fetch) into `layout.tsx`;
   removed for an offline-safe build (PLAN §3). `--font-sans`/`--font-heading`/`--font-kanji` are
   system-stack CSS tokens.
4. **`cn` = keep the local `cn()`** (`clsx@2.1.1` + `tailwind-merge@3.6.0`); the copied components'
   `import { cn } from "cn"` redirected to `@/lib/utils`, the `cn` package dropped. Why: `cn@0.2.6` is a
   compiled from-scratch reimplementation of clsx+tailwind-merge (own engine/tables), a general drop-in —
   NOT a Base-UI-specific config the components depend on; they only call `cn()` with standard Tailwind
   utilities. Exact-pinning minimalism + F-1 consistency + own-the-code.

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

## Charter C assets (lot SITE-CHARTE-C, investor decisions 145/146, 2026-09-23)

Authored directly or copied byte-for-byte; no CLI, no npm dependency added.

- `app/fonts/` — OFL fonts copied byte-for-byte from the brand font folder (decisions 105/107), with their OFL
  licence texts beside them (two of them normalised from CRLF to LF by `.gitattributes` on commit, text unchanged);
  loaded by `next/font/local` in `app/layout.tsx`. SHA-256 of the fonts:
  `SpaceGrotesk-wght.ttf` `acad6de1…fbd79f72`, `JetBrainsMono-wght.ttf` `48715a42…193ffeda`,
  `ArchivoBlack-Regular.ttf` `dd9a89a0…39703180`.
- `app/fonts/Newsreader-opsz-wght.ttf`, `app/fonts/Newsreader-Italic-opsz-wght.ttf`, `app/fonts/OFL-Newsreader.txt`
  (investor decision 148, 2026-09-23) — Newsreader (Production Type), SIL Open Font License 1.1, copied
  byte-for-byte from the public `google/fonts` repository, path `ofl/newsreader/` (branch `main`, fetched 2026-09-23;
  the google/fonts commit was not recorded, the bytes are pinned by SHA-256 below), renamed without brackets like the
  other font files (upstream names `Newsreader[opsz,wght].ttf`, `Newsreader-Italic[opsz,wght].ttf`, `OFL.txt`; the
  licence text has no final newline upstream, kept as is). The family's `METADATA.pb` (not committed) names the
  upstream source `productiontype/NewsReader` at commit `1ece6a8bfe5db1a2b90c76cc1fe5d3b2eed5dcf3`. SHA-256:
  `Newsreader-opsz-wght.ttf` `8a08d13f8a6c0d51be379a60af84f945f65369a67e509ee3c3bdcc421254d7c1`,
  `Newsreader-Italic-opsz-wght.ttf` `796668611f80b64d5adf182fde3b6f29ed83b4e7cbec7b96937e84ac01364792`,
  `OFL-Newsreader.txt` `fdfad38143ec470553cae82a1e45320bdd1b9ec70415d37bd0171051d8a4ded8`. Variable axes (fvar):
  wght 200–800, opsz 6–72. Loaded by `next/font/local` in `app/layout.tsx` with serif fallback metrics
  (`adjustFontFallback: "Times New Roman"`); it replaces the build-time Google Fonts download of the same family.
- `public/scene/blocks-hero.html` — the designer's vendored Canvas 2D hero scene (no library), copied from the
  charter C mock folder (`assets/3d/blocks-hero.html`, SHA-256 `1ef964e5…4ce64998`), then four changes, each
  commented in the file: the two projected clock labels are drawn only on a canvas at least 480 px wide (designer
  mobile note, point 5); the still frame is redrawn after a resize under reduced motion (a resize clears the canvas);
  the document declares both colour schemes (no opaque iframe backdrop under the dark theme); the night-side label
  reads "closed · recording" (orchestrator ruling V4: it no longer names Bell, which is upcoming in public).
- `components/lockups.tsx` — the MONARK, Narabi, Ukemi and Bell lock-ups, path data transcribed from the
  designer's SVG files (decision 120 lettering; Q1 ruling), ink as `currentColor`, accent as the product token.
- `public/bell/anchors/` — written by `scripts/sync-bell-anchors.mjs` from the anchors register (manifests,
  OpenTimestamps proofs, `anchors.json`); pinned by the root test `bell_anchors_served_register_matches_source`.
- `public/icons/bell.svg` — the Bell mark (designer favicon) with a dark-scheme rule, the `/icons/narabi.svg` pattern.

## Bell legal texts (lot SITE-LEGAL-1, investor decisions 146/147/148, 2026-09-23)

Copied from the legal drafts validated by the investor's lawyer ("as drafted", decision 147), outside this
repository: `TERMS-OF-USE-draft.md` (SHA-256 `5f11f0fe…a7131efd`), `PRIVACY-NOTICE-draft.md` (SHA-256
`160826cb…a6dff64e`; both full values in the `$comment` of `data/bell-legal.json`), `MAILTO-TEMPLATE-draft.md`
(SHA-256 `1ef97d7f…fc67070a`).

- `app/bell/terms/page.tsx`, `app/bell/privacy/page.tsx` — the two texts, verbatim except for the deviations the lot
  report lists one by one, each with its reason (notes to the lawyer removed, licence option left as a placeholder,
  present tense on non-served paths put in the future, no country, placeholders for fields still to decide).
- `data/bell-legal.json` — generated by a script from the two drafts (the table "Words we do not use, and why" cell by
  cell, and two spans of the Privacy Notice found by exact search), not typed; listed with its SHA-256 in
  `data/manifest.sha256.json`, read by `lib/bell-legal-load.ts`; what it carries is pinned by `test/bell-legal.test.ts`.
- `lib/bell-contact.ts` — the mail template's lists and body lines copied verbatim (country field dropped, decision 94);
  the link equals the template's own encoded link up to two declared substitutions, pinned by `test/bell-contact.test.ts`.

## The MONARK noyau (pli SITE-NOYAU-1, investor delivery of 2026-09-23)

Delivered by the investor as the archive `Monark animation concepts.zip` (SHA-256 `5c855327…3cced9d2`); its `site/` folder
was read after checking that each unpacked file equals its archive entry byte for byte. No CLI, no npm dependency added.

- `components/noyau/noyau-engine.ts` — the Canvas 2D engine (no library, no WebGL; its canvases draw no text), delivered
  SHA-256 `30883757…587b0705`. Adapted: the group of an agent is the fleet register's own status word (`built` or
  `upcoming`, formerly `built` or `named`), and the header comment no longer names the orbits.
- `components/noyau/noyau.tsx` — the React client component, delivered SHA-256 `f1b28d93…dc972b9c`. Adapted for honesty:
  the delivered file typed each agent's group by hand, with MONARK Bell drawn as built; the drawn set and each group are
  now READ from the register (`lib/fleet.ts`: every `FLEET_AGENTS` entry, then `PRODUCTS` key `bell`), passed through
  unchanged, so Bell (upcoming) sits on the dashed ring. A delivered agent that the register does not list was removed,
  with its mark. The legend is English and holds the two register words only; the accessible name is English and lists
  the register's built and upcoming names. Bell's mark is the `BellMark` of `components/lockups.tsx` (same geometry as the
  delivered mark, accent read from the `--bell` token), so the page renders one Bell mark, not two.
- Not copied: the delivered `components/marks/bell-mark.tsx` (a second `BellMark`, identical geometry, accent hard-coded)
  and the mark of the agent absent from the register (its name is banned on the storefront by the site vocabulary scope).
- `app/page.tsx` — the noyau replaces the cubes scene in the home hero; `app/bell/page.tsx` — the cubes scene
  (`public/scene/blocks-hero.html`, unchanged, still served) and its legend are the hero visual of /bell.
