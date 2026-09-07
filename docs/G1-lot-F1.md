# G1 — Génération tracée, Lot F-1 (fondation vitrine MONARK)

- **Générateur** : worker `claude-opus-4-8[1m]` (Gate 0 R-1 : préfixe `claude-opus-4-8` vérifié, effort max ; Opus 5 non utilisé). Worktree `F:\Monark-wt-fpublic`, branche `lot-f-public`. Aucun commit (R-19/R-20). 2026-09-07.
- **Spec** : `docs/PLAN-F-public-lot.md` §3 (F-1), ADR-M004 Addendum D2, D11 (test 44).

## Fichiers (7 modifiés + 16 nouveaux ; puis fix-pass G2 : 5 touchés)
Modifiés : `package.json` (`workspaces` `+apps/*`), `package-lock.json` (deps `apps/site`), `.gitignore` (`.next/`,`.turbo/`,`next-env.d.ts`), `eslint.config.mjs`, `scripts/lang-gate.mjs`, `scripts/export-public.mjs`, `test/export-public.test.ts`.
Nouveaux : `fixtures/figures-sourced.json`, `test/site-honesty.test.ts`, et sous `apps/site/` : `package.json`, `next.config.mjs`, `postcss.config.mjs`, `tsconfig.json`, `app/globals.css`, `app/layout.tsx`, `app/page.tsx`, `lib/utils.ts`, `lib/load-committed.ts`, `content/.gitkeep`, `data/manifest.sha256.json`, `COMPONENTS-PROVENANCE.md`, `test/honesty-lint.ts`, `test/honesty-lint.exempt.json`.

## Versions épinglées EXACTES (R-8 ; vérifiées au registre npm avant écriture)
Runtime : `next 16.3.4`, `react 19.2.8`, `react-dom 19.2.8`, `@next/mdx 16.3.4`, `@mdx-js/loader 3.1.1`, `@mdx-js/react 3.1.1`, `clsx 2.1.1`, `tailwind-merge 3.6.0`. Dev : `typescript 6.0.3`, `@types/node 24.13.3`, `@types/react 19.2.18`, `@types/react-dom 19.2.7`, `tailwindcss 4.3.3`, `@tailwindcss/postcss 4.3.3`. CLI `shadcn 4.21.0` (journalisé `COMPONENTS-PROVENANCE.md`, pas dep runtime). `npm ci` strict vert ; chaîne existante (`typescript 6.0.3`, `eslint 10.10.0`, `typescript-eslint 8.69.0`, `ajv 8.20.0`) inchangée.

## Socle données
`fixtures/figures-sourced.json` = 5 chiffres **[lu]** de Qin et al. (IMC '21, DOI 10.1145/3487552.3487811, lecture `procurements-lectures/P-K1-1`) : 1.07 B USD liquidatable (MakerDAO, ≤, as of 2021-04-30, p.344) ; 807.46 M liquidé ; 63.59 M profit liquidateur ; 8.38 M oracle Compound nov. 2020 ; 19.07 % risque liquidateur. Chacun avec valeur/unité/qualificatif/source/DOI/page/`reading`. `apps/site/data/manifest.sha256.json` = sha256 LF-normalisé UTF-8 des fichiers de données.

## Mutants (générateur) — rouge prouvé + restaurés PAR COPIE (sha256 avant==après)
1. test 44 — `1.07` en dur dans `app/page.tsx` ⇒ rouge (prouve : un littéral est rouge même si sa valeur EST une figure ; l'exclusion = injection dynamique, pas value-match).
2. English-only — chaîne FR dans `page.tsx` ⇒ `lang-gate --scope site` rouge.
3. test 42 — M7, neutralisation de `WALK_SKIP_DIRS` ⇒ `.next` fuit ⇒ rouge.
4. test 44(a) — falsification manifest (`807.46→807.47` sans régénérer) ⇒ `load-committed: sha256 mismatch` ⇒ rouge.

## Oracle (arbre livrable)
`npm ci` exit 0 ; `npm run ci` 87/87 ; `npm run lint` 0 ; `lint:ratchet` 92/92 ; `next build` exit 0 ; `lang-gate --scope site` 0 hit ; contrats gelés diff vide. **R-25 = 905 < 1205** (après fix-pass G2).
