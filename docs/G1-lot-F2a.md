# G1 — Génération tracée, Lot F-2a (Base UI init + gardes de code)

- **Générateur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 : préfixe `claude-opus-4-8` vérifié, effort max ; Opus 5 non utilisé). Worktree `F:\Monark-wt-f2`, branche `lot-f2a`. Aucun commit (R-19/R-20). 2026-09-07.
- **Spec** : `docs/PLAN-F2-lot.md` §3 (Base UI/D2-ter), §4 (F-2a), §6 (gardes a-g), §7 (oracle + oracle RSC), §8 (topologie), §9 (MAST).

## Décisions d'init (journalisées `apps/site/COMPONENTS-PROVENANCE.md`)
- **Commande** : `npx shadcn@4.21.0 init -c apps/site -b base -p nova --no-monorepo --no-rtl --no-pointer -y`. **Preset `nova` délibéré** (anti défaut silencieux, D2-ter/C9). `components.json` = `style: base-nova`, `rsc: true`, `aliases.utils: @/lib/utils`.
- **`--dry-run` n'existe pas** dans shadcn 4.21.0 (`init --help` ne le liste pas ; CLI rejette `unknown option '--dry-run'`). Équivalent fidèle : `init` sur arbre git-propre + lecture du `git diff` (l'ensemble exact tiré). `error_origin` = outillage ; PLAN §4 « --dry-run journalisé » présumait un flag absent.
- **`cn` = option (a), garder le `cn()` local F-1** (`clsx 2.1.1` + `tailwind-merge 3.6.0`) ; les composants copiés importent `cn` depuis `@/lib/utils` ; paquet `cn` 0.x **retiré** (réimplémentation générale, pas une config Base-UI requise — vérif discriminante).
- **`shadcn` retiré des deps runtime** : l'`init` l'avait ajouté pour `@import "shadcn/tailwind.css"` (629 lignes) ; seuls 2 blocs (`@custom-variant data-open`/`data-closed`) sont référencés par Button/Dialog → inlinés verbatim (MIT) dans `globals.css`, import + dep retirés (moins cher qu'`eject`, R-8-propre).
- **`next/font/google` (Geist) retiré** (fetch build-time) → fontes system-stack (`--font-sans`/`--font-heading`/`--font-kanji`, kanji secondaire) en tokens CSS ; build offline-safe (PLAN §3).

**Deps ajoutées, EXACTES (R-8, registre vérifié 2026-09-07)** : `@base-ui/react 1.8.0`, `class-variance-authority 0.7.1`, `lucide-react 1.41.0`, `tw-animate-css 1.4.0`. Retirées : `cn 0.2.6`, `shadcn 4.21.0` (CLI via npx). `npm ci` exit 0 ; `npm audit --audit-level=high` 0.

## Fichiers (15 ; `package-lock.json` exclu R-25)
Modifiés : `apps/site/{COMPONENTS-PROVENANCE.md, app/globals.css, app/layout.tsx, app/page.tsx, package.json, test/honesty-lint.ts, test/honesty-lint.exempt.json}`, `scripts/grep-forbidden.mjs`, `vocab-banned.json`, `test/site-honesty.test.ts`, `test/ci-gates.test.ts`. Nouveaux : `apps/site/components.json`, `apps/site/components/ui/{button,dialog}.tsx`, `apps/site/components/rsc-boundary-demo.tsx`. Intacts : `schemas/**`, `packages/**`, `scripts/export-exclude-tests.json`, `package.json` racine.

## Oracle RSC (C5, honnête)
`app/page.tsx` (serveur, pas de `'use client'`) importe `components/rsc-boundary-demo.tsx` (`'use client'`, Base UI Dialog+Button). `next build` exit 0, `/` prérendue `○ (Static)`, TS OK ⇒ **frontière RSC compilée**. Hydratation runtime = **CA manuelle `next dev`**, déclarée telle, **non** revendiquée couverte par `next build`.

## Gardes a-f (chacune mutant rouge prouvé + restauré ; assertions permanentes `test/site-honesty.test.ts` a-d, `test/ci-gates.test.ts` e-f)
- (a) `SCAN_ROOTS` ferme la classe : tout `apps/site` sauf SKIP + `test/`/`data/` top-level + `*.d.ts`. Mutants `<p>999</p>` en `components/` et `hooks/` ⇒ rouges.
- (b) export `metadata` (title/description, récursif openGraph/twitter) scanné ⇒ `description:"42…"` rouge.
- (c) `mdxProse` ne strippe plus les chaînes littérales ⇒ `{"999 agents"}` en `.mdx` rouge (parité TSX).
- (d) `VISIBLE_ATTRS` += `value`, `content` ⇒ `<option value="5">` / `<meta content="5 agents">` rouges.
- (e) gate vocab scope `site` (`.ts/.tsx/.mdx`) portant les 7 mots proscrits ⇒ `autonomous` en page rouge.
- (f) anti-collision : `@base-ui-components/react` absent de `apps/site/package.json` + `package-lock.json` ⇒ mutant rouge.

## D1 — RENVERSEMENT CONSCIENT de la réserve R1 du G2 de F-1 (tracé, R2 exigé par le G2 de F-2a)
F-1 G2 R1 avait fait DEUX choses : (i) retirer `"md"` de `pageExtensions` **et** (ii) scanner `.md` comme `mdx` (`if (ext===".mdx"||ext===".md") return "mdx"`). **F-2a D1 retire (ii)** : `kindForExt` renvoie `null` pour `.md`. Justification (3 preuves primaires) : `pageExtensions:["ts","tsx","mdx"]` (jamais une route) ; `@next/mdx` ne matche que `\.mdx$` (`createMDX({})` sans option) ; zéro import `.md`. Le trou « routable-mais-non-scanné » de R1 reste fermé **structurellement** par (i) (acquis F-1, toujours en place) ; D1 ne retire que le scan redondant, qui produisait des **faux positifs** sur les vrais numéros de version de `COMPONENTS-PROVENANCE.md`. Surface rendue = `.mdx` (toujours scannée). **Adjugé acceptable au G2 de F-2a.**

## Oracle final (arbre livrable)
`npm run ci` **93/93** (87 + 6 nouveaux) ; `lint` 0 ; `lint:ratchet` 92/92 ; `next build` exit 0 (`/` static) ; `lang-gate --scope site` 0 ; gate vocab site 0 (45 fichiers) ; `git diff main -- schemas/ packages/` vide. **R-25 = 809 < 1205** (753+ / 56−, 15 fichiers, fichiers neufs comptés staged).

## Pendants formés (pour F-2b)
- **`\bconfidence\b`** : la copy d'invariant de flotte MONARK (README l.67-71, « no confidence field/score ») rougira le gate vocab site ⇒ ADR scopé en F-2b (phrase exempte fermée ou motif conscient de la négation). Bien formé (`COMPONENTS-PROVENANCE.md` l.79-85).
- **`generateMetadata()`** (réviseur-surfacé) : §6b scanne la variable `metadata`, pas une fonction `generateMetadata` retournant des littéraux ⇒ §6b-bis en F-2b (scanner le retour + mutant) ou documenter le non-usage. Aucune page F-2a ne l'utilise.
- Résiduels MAST déclarés : template backtick dans `{…}` MDX (limite `honesty-lint.ts` déclarée) ; `data/` imbriqué reste scanné.
