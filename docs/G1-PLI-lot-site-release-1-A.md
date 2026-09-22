Modèle résolu : claude-opus-4-8[1m]

# RENDU-PLI — lot SITE-RELEASE-1, SOUS-LOT A : pli de la déviation D-2 (favicon Narabi servi)

> Pli worker (Opus 4.8, effort max) sur ruling coordinateur (D-2 ratifié comme angle mort du G0,
> `F:\Monark\docs\CHANTIERS.md` section « SITE-RELEASE-1-A »). Données brutes pour l'orchestrateur (R-21).
> Aucun commit (R-20). Aucun réseau. Écriture hors worktree sous `F:\tmp\siteA\` seulement. Aucune variable
> d'environnement affichée (A-7). `next.config.mjs` intact (D-1).

## 0. Provenance
- **Modèle** : `claude-opus-4-8` (effort max). Résolu : `claude-opus-4-8[1m]` (R-1).
- **Date** : 2026-09-22 (~06:21 UTC).
- **Worktree** : `F:\Monark-wt-siteA`, branche `lot/site-release-1-A`, **base `HEAD = 89c90b370cce071fc2dc34c6e32aadb2081c9e88`** (le sous-lot A initial est committé dans `89c90b3` ; ce pli est un delta par-dessus).
- **node_modules** : mk-nm (A-2) ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-siteA\packages\rpc-guard\src\index.ts`.

## 1. Ce que le pli change (ruling D-2 appliqué à la lettre)
Le favicon de `/narabi` cesse d'être un icône de route `app/narabi/icon.svg` (émis sur `/narabi/icon.svg`, SHADOWÉ par `handle_path /narabi/*` en prod ⇒ 404) et devient un **asset statique public** `public/icons/narabi.svg` déclaré via `metadata.icons` de la page — servi sur `/icons/narabi.svg`, **hors `/narabi/*`**, donc atteint Next et reste fonctionnel.

| Fichier | Action | Détail |
|---|---|---|
| `apps/site/public/icons/narabi.svg` | **NOUVEAU** | mêmes octets que l'ancien icône (sha `aa2f3006…daff867`, 14 l.), adaptatif `@media (prefers-color-scheme:dark)`, 0 URL chargée |
| `apps/site/app/narabi/icon.svg` | **SUPPRIMÉ** | l'icône de route (shadowé) est retiré (git détecte un RENAME 100 % vers `public/icons/narabi.svg`) |
| `apps/site/app/narabi/page.tsx` | **MODIFIÉ** | `metadata.icons = { icon: [{ url: "/icons/narabi.svg", type: "image/svg+xml" }] }` + commentaire de motif |
| `test/narabi-live.test.ts` | **MODIFIÉ** | l'ancien test icône unique remplacé par 2 tests (voir §3) |
| `F:\tmp\siteA\mutants.mjs` | **MODIFIÉ** | M5 re-pointé sur l'asset public ; **M7 nouveau** (« icon under /narabi/ ») |

Inchangés : `narabi-live.ts`, `narabi-live.tsx`, `narabi-copy.ts` (le cœur du sous-lot A committé en `89c90b3`), `next.config.mjs`, `ci.yml`, Caddyfile (∉ lot ; le shadow reste un item deploy, cf. §7), tous les fichiers de B.

## 2. Oracle local D-2 (le cœur du pli, mesuré sur l'artefact bâti)
- **Head bâti `/narabi`** (`apps/site/.next/server/app/narabi.html`) : `<link rel="icon" href="/icons/narabi.svg" type="image/svg+xml"/>` — UN seul lien icône, chemin public statique + type.
- **`grep -c 'href="/narabi/icon.svg'` = 0** : plus aucune référence au chemin shadowé (régression D-2 corrigée).
- **`shadowed("/icons/narabi.svg", "/narabi/*") === false`** (même logique que `narabi_live_route_not_shadowed_by_caddy`) : le favicon n'est PAS sous `/narabi/*` ⇒ non 404 en prod.
- **`app/narabi/icon.svg` absent** : l'icône de route est bien retiré (sinon Next ré-émettrait `/narabi/icon.svg`).
- **Fichier présent** : `apps/site/public/icons/narabi.svg` existe (asset servi).

## 3. Tests (D-1 de la consigne) — chaque test a son mutant nommé ROUGE
Le test icône unique est scindé en deux, mappés 1:1 sur deux mutants :
- **`narabi_icon_static_public_local`** : lit `public/icons/narabi.svg`, exige adaptatif + 0 URL distante (seule URI = xmlns). ⟵ mutant **M5** (favicon distant).
- **`narabi_icon_declared_not_under_narabi_path`** : (a) `app/narabi/icon.svg` ABSENT ; (b) href d'icône LU depuis la métadonnée de `page.tsx` = `/icons/narabi.svg` ; (c) `shadowed(href, "/narabi/*") === false` ; (d) le fichier public dérivé du href existe. ⟵ mutant **M7** (icône déclarée sous `/narabi/`).

Les 9 autres tests du fichier (pilule, single-source, glossaire, snapshot, Caddy, bornes) restent intacts et verts.

## 4. Mutants (`node F:/tmp/siteA/mutants.mjs`, exit 0) — 7/7 ROUGES, restauration byte-exacte
ROUGE exigé = `✖ <test nommé>` ET `ℹ fail ≥ 1` (pas seulement exit≠0), puis restauration octets ORIGINAUX + sha == baseline + sweep global.
| # | Mutant | Fichier | Test qui rougit | Verdict |
|---|---|---|---|---|
| M1 | N tapé au lieu de lu | narabi-live.ts | narabi_first_reading_label_reads_committed_t | RED, restauré |
| M2 | « of 7 » à T=7 (`<`→`<=`) | narabi-live.ts | narabi_first_reading_label_reads_committed_t | RED, restauré |
| M3 | SERIES_MIN_STEPS dupliqué | narabi-live.ts | narabi_first_reading_label_single_source_of_seven | RED, restauré |
| M4 | statut « shipped » | narabi-live.ts | narabi_first_reading_label_reads_committed_t | RED, restauré |
| M5 | favicon distant | **public/icons/narabi.svg** | narabi_icon_static_public_local | RED, restauré |
| M6 | glossaire chiffré | narabi-copy.ts | narabi_glossary_under_calib_generic_digit_free | RED, restauré |
| **M7** | **favicon déclaré SOUS `/narabi/`** (`url: "/narabi/icon.svg"`) | **app/narabi/page.tsx** | narabi_icon_declared_not_under_narabi_path | RED, restauré |
Sweep : narabi-live.ts `8e12619…`, narabi-copy.ts `8effd627…`, public/icons/narabi.svg `aa2f3006…`, page.tsx `630e1b1c…` == baseline.

## 5. Oracle complet (A-3 ; codes captés directement ; tout sous `env -u` des 8 clés payantes)
| Étape | Commande | Exit | Résultat |
|---|---|---:|---|
| CI | `npm run ci` | 0 | 815 tests, **814 pass, 1 skip, 0 fail** |
| lint | `npm run lint` | 0 | 0 |
| lint:ratchet | `npm run lint:ratchet` | 0 | 69/69 (inchangé) |
| lang:gate | `npm run lang:gate` | 0 | 0 hit non-exempt (après correction D-PLI-1, §6) |
| export:check | `npm run export:check` | 0 | 0 forbidden path, 0 French hit (public/icons/narabi.svg passe) |
| build (D-1) | `npm run build -w @monark/site -- --webpack` | 0 | 14 routes, `/narabi` prérendu ; `next.config.mjs` intact |
| assert-fleet-html | `node scripts/assert-fleet-html.mjs` | 0 | /fleet vert (header + 4 notes, 33324 chars) |
Logs : `F:\tmp\siteA\pli-oracle-*.log`, `pli-mutants.log`, `pli-narabi2.log`.

## 6. Déviation auto-attrapée (F-3, transparence) — D-PLI-1
En reprenant le nom de mutant du coordinateur, j'avais écrit un commentaire de test en **français** (« icône sous ») ⇒ `lang:gate` a rougi 2 hits (`test/narabi-live.test.ts:300` : `[diacritic] icône`, `[fr-word] sous`). **Attrapé par le gate lang:gate** (pas par ci ni export:check — le test racine n'est pas exporté). Corrigé en anglais ASCII (« icon under »). `lang:gate` re-passé = 0. Aucune dette : le gate a fait son office, la correction est dans l'arbre livré.

## 7. Item résiduel (deploy, hors code) — MESURÉ vs [non lu], qualifié
Le pli **corrige la cause côté site** (favicon hors `/narabi/*`). Il ne modifie pas le Caddyfile (∉ A/B). Ce qui est **mesuré** : `shadowed("/icons/narabi.svg", "/narabi/*") === false` (le favicon n'est PAS sous le matcher sentinel — rejouable). Ce qui est **[lu]** : le snippet Caddy s'insère « BEFORE its `reverse_proxy localhost:3000` » (commentaire du snippet). Ce qui reste **[non lu]/[2nd]** : le **site block Caddy hors snippet** (non lu) et le fait que Next serve `public/` (documenté, [2nd]). Formulation prudente : `/icons/narabi.svg` **atteint Next sous réserve** que le catch-all `reverse_proxy localhost:3000` soit le seul autre handler du site block, et que le déploiement serve bien Next (`next start`, pas un `output: export` — `next.config.mjs` n'en déclare pas, mais le RUNBOOK n'est pas lu). **Vérification = curl orchestrateur / parcours investisseur avant mise en ligne**. Aucune règle Caddy n'est requise si ces réserves tiennent ; l'ancien item D-2 « exception Caddy » devient sans objet (la solution du ruling est le chemin public).

## 8. R-25 (A-5 ; pathspec VERBATIM `ci.yml:65`, base `HEAD=89c90b3`)
`git add -N public/icons/narabi.svg` → `git diff --shortstat HEAD -- . <14 excludes verbatim>` → `git reset -q`. Résultat : **3 files changed, 38 insertions(+), 4 deletions(-)** ⇒ **R-25 = 42** ≪ 1 150. Le déplacement `app/narabi/icon.svg → public/icons/narabi.svg` est détecté RENAME (octets identiques, 0 ligne). Pas de STOP.

## 9. Livrables (`F:\tmp\siteA\`)
- `RENDU-PLI.md` (ce fichier).
- `DELIVERED.sha256` re-manifesté (3 fichiers présents du pli ; `sha256sum -c` = OK) :
  - `apps/site/app/narabi/page.tsx` `630e1b1c…d305070f`
  - `apps/site/public/icons/narabi.svg` `aa2f3006…daff867`
  - `test/narabi-live.test.ts` `18c8cebd…05cd2a7c`
  - (suppression : `apps/site/app/narabi/icon.svg` — retiré, pas de sha)
- `mutants.mjs` (7 mutants) ; `narabi.built.html` + `narabi.built.head.html` (artefact POST-pli recopié du `.next` courant ; head = `<link rel="icon" href="/icons/narabi.svg" type="image/svg+xml"/>`) ; `pli-oracle-*.log`.
- **Suppression prouvée** (A-4 « tous les fichiers touchés ») : `test ! -e apps/site/app/narabi/icon.svg` exit **0** (absent) ; `git diff --name-status 89c90b3 -- apps/site/app/narabi/icon.svg` = **`D`**. Non mise dans `DELIVERED.sha256` (pas de contenu à hacher ; `sha256sum -c` rejette un commentaire) — nommée ici.

## 10. Consigne standard G1 — deltas du pli
- A-1 fait (modèle résolu 1ʳᵉ ligne). A-3 fait (codes directs). A-4 fait (DELIVERED re-manifesté, sous `F:\tmp\siteA\`, aucun commit, rien sur `C:`, aucun réseau). A-5 fait (R-25 = 42). **A-6 fait — invariants byte-identiques listés** : (i) `public/icons/narabi.svg` == ancien icône, sha `aa2f3006…daff867` ; (ii) les 3 fichiers cœur du sous-lot A INCHANGÉS vs `89c90b3` — `git diff --quiet 89c90b3 -- <f>` exit **0** pour `narabi-live.ts` (`8e12619…`), `narabi-live.tsx` (`eadd808…`), `narabi-copy.ts` (`8effd627…`) ; (iii) `next.config.mjs` et fichiers de gel intacts (absents de `git status`). A-7 fait (env -u partout, aucune variable affichée). A-9 n-a (pas de phrase servie à mots interdits dans le pli). D-1 fait (mutants nommés + M7 nouveau). F-2 fait (sources ASCII/anglais — cf. D-PLI-1 corrigé). F-3 fait (déviation D-PLI-1 déclarée, non contournée).
