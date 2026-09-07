# G7 — Verdict d'orchestrateur, Lot F-2a (Base UI init + gardes de code)

- **Verdict** : **CLOS**. Rattachement : `docs/PLAN-F2-lot.md` §3-§9 (checkpoint 1 ACCEPTE-AVEC-CORRECTIONS, 12 appliquées ; escalades E-1/E-2 tranchées) ; ADR-M004 Addendum D2-ter (Base UI). Gates G0-G7 passés ; G2 CLOS-AVEC-RÉSERVES → 2 réserves **levées**.
- **Provenance** : orchestrateur **`claude-opus-4-8`** (siège planificateur/committeur sous **exception investisseur Opus-seat**, datée 2026-09-07, précédent PR #1 ; le roster nomme Fable 5.1). Génération : worker `claude-opus-4-8[1m]` (`docs/G1-lot-F2a.md`). Revue : worker `claude-opus-4-8[1m]` **instance séparée, contexte frais** (`docs/G2-lot-F2a.md`). Aucun worker n'a committé (R-19/R-20).

## Gates
- **G0** : PLAN F-2 v2 (checkpoint 1) + Addendum D2-ter (Base UI).
- **G1** : génération tracée (`docs/G1-lot-F2a.md`) — trace explicitement **D1 renverse F-1 G2 R1** (exigé au G2).
- **G2** : revue 100 %, réviseur ≠ générateur, contexte frais (`docs/G2-lot-F2a.md`) — 6 gardes prouvées à dents sur chemins de code indépendants (route group, `mdx-components.tsx`, branche JSX-expression), mutants du réviseur ≠ générateur.
- **G3/G4/G6 — oracle ré-exécuté par l'orchestrateur (R-21)** : `npm run ci` **93/93** (87 + 6 nouveaux), `lint` **0**, `lint:ratchet` **92/92**, `next build` **exit 0** (`/` statique, **frontière RSC compilée** : client Dialog+Button dans page serveur), `lang-gate --scope site` **0**, gate vocab site **0** (45 fichiers), `git diff main -- schemas/ packages/` **vide**. R-25 **809 < 1205**. Réexécuté **après** la levée de R1 (comment-only) : ci 93/93, lang-gate site 0, next build 0.
- **G5** : dette — pendants formés (§ ci-dessous) ; zéro dette nue.
- **G7** : présent verdict.

## Réserves G2 levées
- **R1** (`error_origin` générateur) : 2 commentaires périmés (« .md scanné ») corrigés — `apps/site/test/honesty-lint.ts` docblock `scanAppsSite` (ne cite plus `.md`, explique le non-scan + le renversement conscient de F-1 G2 R1) et `apps/site/next.config.mjs:11` (le lint ne scanne PAS `.md`, seul `.mdx` est rendu). Oracle rejoué vert après correction.
- **R2** (`error_origin` orchestrateur — matérialisation) : `docs/G1-lot-F2a.md` **matérialisé** (+ `docs/G2-lot-F2a.md`, présent verdict), tracant le renversement D1↔F-1-R1. Les commentaires de tests (`test/site-honesty.test.ts:116,128,150`) ne pendent plus.

## Déviations acceptées (G2)
D1 (`.md` hors parcours — 3 preuves primaires, trou fermé structurellement par `pageExtensions`) ; D2 (`*.d.ts`) ; D3 (scope vocab `.ts/.tsx/.mdx`) ; D4 (`--dry-run` inexistant dans shadcn 4.21.0, `error_origin` outillage — équivalent init-arbre-propre+diff fidèle). Pré-empts R-21 : `Kraidle` dans `vocab-banned.json` exporté = pas une fuite neuve ; `confidence` = pendant bien formé.

## Périmètre livré
Base UI (`init -b base -p nova`), `cn()` local gardé, `shadcn`+`cn` retirés des deps runtime (variantes MIT inlinées), fontes system-stack (offline-safe), 4 deps EXACT-épinglées (R-8 : `@base-ui/react 1.8.0`, `class-variance-authority 0.7.1`, `lucide-react 1.41.0`, `tw-animate-css 1.4.0`), `components/ui/{button,dialog}.tsx` + `rsc-boundary-demo.tsx`, tokens navy/or/kanji (honnêtes), **6 gardes** (détecteur a-d élargi + gate vocab scope `site` + test anti-collision). Aucune page de contenu (F-2b/c).

## Pendants formés (zéro dette nue ; pour F-2b)
- **`\bconfidence\b`** vs copy d'invariant honnête → ADR scopé (phrase exempte fermée ou motif conscient de la négation). À **promouvoir en PLAN §10** (ne vit qu'en note de provenance).
- **`generateMetadata()`** non scanné (réviseur-surfacé) → §6b-bis en F-2b (scanner le retour + mutant) ou documenter le non-usage.
- Résiduels MAST déclarés : template backtick dans `{…}` MDX ; `data/` imbriqué reste scanné.
- **Hydratation runtime** : CA manuelle `next dev` (non couverte par `next build`) — vérifiable au déploiement.

## Interdits respectés
`schemas/**`/`packages/**`/contrats gelés non touchés ; `scripts/export-exclude-tests.json` intact ; aucun commit worker ; **R-25 809 < 1205**.

## Suite
Acceptation validateur-humain (checkpoint 2) → commit orchestrateur → PR sur `monark-governance` → 5 jobs verts → merge. F-2a reste **local** (pas de mise en ligne). Puis F-2b (home + 5 segments + panneaux 3 bâtis) — E-1 tranché.

## Addendum — acceptation checkpoint 2 (validateur `claude-fable-5-1`, 2026-09-07)
**ACCEPTE-AVEC-CORRECTIONS** (C-1, C-2, C-3 ; aucune escalade, aucun REFUSE). **Appliquées avant commit** :
- **C-1** (code, `error_origin` générateur) : `test/ci-gates.test.ts` `pageExtensions_excludes_md` verrouille `pageExtensions` (== ts/tsx/mdx, `md` absent) — ferme le fail-open latent de D1 (le non-scan `.md` reposait sur un `pageExtensions` non verrouillé, même forme que le `TOLERATED_ABSENT` de F-1). Mutant `+"md"` ⇒ rouge (fail 1), restauré byte-exact. Oracle : `npm run ci` **94/94**.
- **C-2** (docs) : PLAN §12 errata — D4 (`--dry-run` inexistant) ; `\bconfidence\b` promu pendant §10 ; §6b-bis `generateMetadata()` pour F-2b.
- **C-3 / pendant P-3** : `next build` et `lang-gate --scope site` **ne sont PAS des jobs CI** (`ci.yml` n'exécute que `gate:vocab && typecheck && test`, `lint && lint:ratchet`, `audit`) — l'oracle RSC repose sur 3 instances distinctes (G1/G2/G7), pas sur la CI. **Pendant formé P-3** (hérité de F-1) : câbler `next build` (+ `lang-gate --scope site`) dans `ci.yml` en lot de gouvernance.
- **Note CI (transparence)** : le 1er run de la PR F-2a a rougi g3 (tsc TS2532) + g4 (eslint no-unnecessary-type-assertion) sur **une seule ligne** du test C-1 (`m![1]` : `!` inutile après `assert.ok` ET `[1]` possiblement `undefined` sous `noUncheckedIndexedAccess`). Cause : vérification locale **masquée par un pipe** (`npm run ci | grep` renvoyait le code de `grep`, pas de `npm`) ; `npm test` seul ne typecheck pas. `error_origin` = orchestrateur (garde C-1). Corrigé (`?.[1] ?? ""` + filtre `is string`, sans `!`) ; `npm run ci` **exit 0** vérifié explicitement, mutant C-1 re-prouvé rouge. Leçon R-21 : contrôler les codes de sortie, pas la sortie grepée.
