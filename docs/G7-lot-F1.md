# G7 — Verdict d'orchestrateur, Lot F-1 (fondation vitrine MONARK)

- **Verdict** : **CLOS**. Rattachement : ADR-M004 D1, D2 (Addendum pile), D11 (test 44) ; `docs/PLAN-F-public-lot.md` §3-7 (plan v2, checkpoint 1 validateur ACCEPTE-AVEC-CORRECTIONS, 12 appliquées). Gates G0-G7 passés ; G2 CLOS-AVEC-RÉSERVES → 4 réserves **levées** (fix-pass).
- **Provenance** : orchestrateur `claude-fable-5-1`, 2026-09-07. Génération : worker `claude-opus-4-8[1m]` (`docs/G1-lot-F1.md`). Revue : worker `claude-opus-4-8[1m]` **instance séparée, contexte frais** (`docs/G2-lot-F1.md`). Aucun worker n'a committé (R-19/R-20).

## Gates
- **G0** : PLAN v2 + Addendum ADR-M004 D2 (pile décidée : Next.js App Router + shadcn/ui + `@next/mdx`).
- **G1** : génération tracée (`docs/G1-lot-F1.md`).
- **G2** : revue 100 %, réviseur ≠ générateur (`docs/G2-lot-F1.md`) — détecteur test 44 **AST** (TypeScript compiler API) à dents réelles ; CLOS-AVEC-RÉSERVES (R1-R2, O1-O2), **toutes levées** au fix-pass, mutant nommé chacune.
- **G3/G4/G6** — oracle : `npm run ci` **87/87**, `npm run lint` **0**, `lint:ratchet` **92/92**, `next build` **exit 0** (routes `/`, `/_not-found` statiques), `lang-gate --scope site` **0 hit**, `git diff main -- schemas/ packages/` **vide**. **Ré-exécuté par l'orchestrateur (R-21)** + mutant R2 indépendant (`{"Team of " + 7}` ⇒ token `7` rouge à `honesty-lint`, restauré, test 44 3/3 vert).
- **G5** : dette — pendants formés (§ ci-dessous) ; zéro dette nue.
- **G7** : présent verdict.

## Périmètre livré (fondation ; pages riches/contenu = F-2)
`workspaces` `+apps/*` ; `apps/site` scaffold Next.js App Router — deps **EXACT-épinglées (R-8)** : `next 16.3.4`, `react`/`react-dom 19.2.8`, `@next/mdx 16.3.4`, `tailwindcss 4.3.3`, `typescript 6.0.3`, etc. (CLI `shadcn 4.21.0` épinglé au journal, **pas** une dep runtime). 3 coutures X↔F : `lang-gate.mjs` (scope `site` + `.mdx` + SKIP `.next`/`.turbo`), `export-public.mjs` (exclut `node_modules`/`.next`/`.turbo` + `apps/site/test/**` + fichiers gitignorés d'`apps/site`), `test/export-public.test.ts` (M7 + assertions O1/O2). Socle `fixtures/figures-sourced.json` (5 chiffres Qin 2021 **[lu]**, qualifiés) + `apps/site/data/manifest.sha256.json` + `load-committed.ts`. `test/site-honesty.test.ts` (racine, détecteur AST) + `honesty-lint.exempt.json`. eslint étendu `apps/**` (`disableTypeChecked`, **+0** cliquet).

## Réserves G2 levées (fix-pass ; `error_origin` = générateur, caught G2)
- **R1** : `next.config.mjs` retire `"md"` de `pageExtensions` ; `kindForExt` traite `.md` comme `mdx`. Mutant `.md` « 999 agents » ⇒ rouge.
- **R2** : le détecteur descend dans `Conditional`/`Binary` (`RENDER_BINARY_OPS` = `+ - * / % **` et `&& || ??`)/`Template` en position texte-rendu ; littéraux chiffre/chaîne-avec-chiffre signalés, accès dynamique exempté. 3 mutants rouges, faux-positifs verts. **Interprétation surfacée** (réversible) : comparaison/bitwise exclus (rendent un booléen) ; `{index+1}` signale `1` (échappatoire = liste `honesty-lint.exempt.json`).
- **O1** : export exclut `apps/site/test/**` (garde dormante sinon exportée) ; assertion test 42.
- **O2** : export filtre les fichiers gitignorés d'`apps/site` (`next-env.d.ts`) via parse du `.gitignore` copié ; assertion test 42.

## Pendants formés (zéro dette nue)
- **shadcn base/preset** (Base UI vs Radix vs Aria) → **décision F-2** (recherche routée) ; la fondation garde `cn()` clsx+tailwind-merge, pas de `components.json`.
- **Détecteur test 44** : périmètre « texte rendu » à élargir en F-2 avec les vrais composants (props porteurs de texte, MDX imbriqué).
- **`next dev` local** : CA vérifiable manuellement ; `next build` en tient lieu d'oracle.

## Interdits respectés
`packages/**`/`schemas/**`/contrats gelés non touchés ; chaîne `package-lock` existante inchangée (`typescript 6.0.3`, `eslint 10.10.0`, `typescript-eslint 8.69.0`) ; aucun commit worker ; **R-25 905 < 1205**.

## Suite
Acceptation validateur-humain (checkpoint 2) → commit orchestrateur → PR sur `monark-governance` → 5 jobs verts → merge. F-public reste **local** (pas de mise en ligne ; Q2 = Cloudflare+VPS au déploiement, hors périmètre F-1).
