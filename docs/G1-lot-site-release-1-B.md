# G1 SITE-RELEASE-1-B /ukemi (worker Opus 4.8)

Modèle résolu : claude-opus-4-8[1m]

Mission §18 (sous-lot B) exécutée et **BRANCHÉE**. Tous les livrables sont durables sous `F:\tmp\siteB\` ; aucun commit (R-20) ; worktree = exactement les 7 fichiers du sous-lot B (disjoints de A, §19 vérifié vide sur les fichiers de A + les 8 gelés/partagés interdits).

## Livrables (chemins absolus)
- `F:\tmp\siteB\G1-lot-site-release-1-B.md` — rendu G1 complet (consigne A-1..A-9 point par point, ADR §18/B, Tuyaux, déviations/résiduels).
- `F:\tmp\siteB\DELIVERED.sha256` — 7 fichiers, `sha256sum -c` = **OK** (7/7).
- `F:\tmp\siteB\mutants.mjs` — harnais, **14 mutants tous ROUGES + restauration byte-exacte**.
- `F:\tmp\siteB\ukemi.built.html` (40 330 o) + `ukemi.main.html` (extrait `<main>`, 9 546 o) — capture du rendu bâti.
- Logs oracle : `F:\tmp\siteB\log-*.txt`.

## Fichiers du worktree (`F:\Monark-wt-siteB`, base 7c34bef)
`apps/site/app/ukemi/page.tsx` (nouveau, server statique + `metadata.icons`), `apps/site/public/icons/ukemi.svg` (nouveau, octets v4 byte-exact), `apps/site/components/ukemi/ukemi-page.tsx` (nouveau), `apps/site/lib/ukemi-copy.ts` (nouveau), `scripts/assert-fleet-html.mjs` (étendu voie i), `scripts/assert-fleet-html.d.mts` (jumeau), `test/site-ukemi.test.ts` (nouveau).

## Décision-clé de correctness (à vérifier adversarialement)
Les 4 constantes `LIQ_*` de `ukemi-copy.ts` sont **byte-identiques** à `apps/harness/src/tools/gate.ts` (import des deux, test `site_ukemi_copy_equals_served_liq_text`). Mais **seules 2 sont RENDUES** dans le `<main>` : `LIQ_EMPTY_REGISTRY_SENTENCE` et `LIQ_CONDITIONAL_SENTENCE` (digit-free). `LIQ_UPPER_BOUND_SENTENCE` (« …is **0** by construction ») et `LIQ_H3_SENTENCE` (« **H-3** ») portent un chiffre → **portées mais NON rendues** (carrier négatif AST : ni `{IDENT}` ni import), ride à U-4b-2b. `LIQ_REQUIREMENTS_SENTENCE` (chiffres) omise (jeu fermé de 4). Le scan `<main>` = **0 token numérique** l'exige.

## Ruling coordinateur appliqué (D-2 / D-1)
- **D-2** : pas d'icône de route `/ukemi/` (risque shadow Caddy) → asset statique `public/icons/ukemi.svg` déclaré via `metadata.icons` = `{ url: "/icons/ukemi.svg", type: "image/svg+xml" }`. Head bâti mesuré : `href="/icons/ukemi.svg"` ×1, `href="/ukemi/icon…"` ×**0**. Mutant M11 (icône sous `/ukemi/`) ROUGE.
- **D-1** : build worktree `next build --webpack` (Turbopack 16 refuse `next` résolu via jonction hors racine — build hermétique). `next.config.mjs` intact ; ligne `run:` CI (`next build`) inchangée (C-4).

## Oracle (env clés payantes retirées ; codes capturés directement)
`npm run ci` **0** (815 tests, **814 pass, 0 fail**, 1 skip pré-existant) · `gate:vocab` 0 · `typecheck` racine 0 · `tsc -p apps/site/tsconfig.json` **0** (typecheck TSX site, le seul apport de `next build` au-delà du root tsc) · `lint` 0 · `lint:ratchet` 0 · `lang:gate` global+site 0 · `export:check` 0 · **`npm run build -w @monark/site -- --webpack` 0** (offline : cache chaud `next/font`, aucun appel réseau logué) · **`node scripts/assert-fleet-html.mjs` 0** sur l'artefact RÉEL (`/fleet` 4 notes ; `/ukemi` `<main>` digit-free **0 token**, état+clause présents, **0** interval/cascade/Bell/Aave).

## R-25
Pathspec VERBATIM `ci.yml:65` (via `git add -N` / `git reset`, sans commit) vs base 7c34bef = **823 lignes** (820 ins + 3 del) < 1150 (borne interne). Pas de couture (estimation G0 §9 : 607–917).

## Points de vérification (R-21) et non-dettes (P5)
- A-9 : « interval » rejoué sur **chaque** constante servie (M4a–d) **et** sur le body composé.
- C-6 : composant lit `status` SEUL, **throw** si Ukemi absent du registre (pas de fallback) ; mutant M5 (`.line`/`.wiring`) ROUGE.
- Parité scanner `scanNumericTokens` (.mjs) ≡ `scanText(_, ∅)` (honesty-lint) prouvée byte-for-byte.
- Résiduels nommés avec déclencheur : aucun lien vers `/ukemi` depuis `SiteHeader`/`/fleet` (∉ B → lot nav suivant / U-4b-2b) ; figures design-set + borne-haute chiffrée non rendues au temps 1 (U-4b-2b).
- Information (non-écart) : seules occurrences de « cascade »/« interval » dans mes fichiers = **commentaires d'honnêteté** (C-6, nom du test A-9), non rendus (assertUkemiBody prouve le `<main>` propre) et non gatés.
- **Advisor** : consulté avant le travail substantiel (10 raffinements intégrés) ; **indisponible (surchargé) au dernier appel** — indisponibilité consignée, non contournée (R-26).

Sortie soumise à ta vérification adversariale (R-21) ; aucun commit ni workflow déclenché (R-20).
