# PLAN v2 — Lot F-public (tranche verticale), vitrine MONARK en local

- **Statut** : PLAN v2 — 12 corrections du checkpoint 1 (validateur-humain, 2026-09-06) intégrées ; escalade tranchée par l'investisseur (§5). Prêt pour G0. Aucun code écrit.
- **Rattachement** : ADR-M004 D1 (surface publique, item 12 `fixtures/figures-sourced.json`), D2 (Next.js + « design system propre, pas template »), D7/D7 bis (liste blanche `apps/site`, export = publication), D10 (F-public dépend de **X** + E-root + E-contracts ; ordre X → F-public), D11 (test 44), §3 CA-F, §6 (Q2). ADR-M001 (contrats gelés). ADR-M003 D0.5 (English-only). ROADMAP §8-8.2 (panneau, réserve d'honnêteté). Recherche `F:\Clawpumptech\research\site-vitrine-best-practices.md` [lu].
- **Provenance** : orchestrateur `claude-fable-5-1`, 2026-09-06. v1 (`PLAN-F-public-lot`) portait deux erreurs corrigées ici : « Lot X satisfait » (faux, §8) et « page agent » (viole ROADMAP §8.2, §3). `error_origin` = orchestrateur.

## 1. Objet
Amorcer le niveau **public** (D1) en local, en **tranche verticale** end-to-end, prouvant l'architecture et la discipline d'honnêteté sur un chemin complet avant élargissement. **Aucun déploiement** (Q2 = deploy-time).

## 2. Décision de pile — scindée décidé / orientation / procurement (correction 6)
| Statut | Choix | Rôle | Fondé sur |
|---|---|---|---|
| **DÉCIDÉ (dans la tranche, [lu])** | **Next.js App Router** | framework | D2 |
| **DÉCIDÉ** | **shadcn/ui** | design system (source copié, own-the-code, MIT) | recherche §6.1 [lu] |
| **DÉCIDÉ** | **`@next/mdx`** (Vercel-maintenu) | contenu MDX des pages | recherche §2 [lu] ; « ou Velite » **retiré** |
| **ORIENTATION (à confirmer au lot concerné)** | **Fumadocs + Orama** | `/docs` (hors tranche) | recherche §2 — Nextra non comparé ⇒ procurement |
| **ORIENTATION** | **Tremor** | graphes `/live`,`/console` (hors tranche) | recherche §6.2 — comptes [abs] |
| **PROCUREMENT (avant toute décision)** | **Scalar** (OpenAPI→MCP), **Nextra vs Fumadocs**, **Velite** | API ref / docs | recherche §6.4, §2 — licences/DX NON TROUVÉ / [abs] |

**R-8** (correction 8) : chaque dépendance npm nouvelle (next, react, react-dom, tailwindcss, @next/mdx…) vérifiée au registre et **épinglée en version exacte** ; `package-lock.json` commis. **shadcn/ui n'est pas une dépendance npm** (source copié) : épingler la **version exacte du CLI `shadcn`** et **consigner au journal de provenance chaque composant copié** (nom + version du registre). Aucune image Docker (local `next dev`).

## 3. Périmètre — panneau, pas page (correction 4) ; scission a priori F-1/F-2 (correction 10)
Onboarding = ROADMAP §8.2 **confirmé investisseur** : entrée par profil → **panneau latéral par produit** (garde le contexte du segment), **pas** une page par produit. Une route de détail agent n'est admissible qu'en **divulgation progressive à la demande**. Les **8 items** du panneau sont une **proposition v0 soumise au checkpoint 2** (ROADMAP §8.2 les note « à valider »).

**F-1 (socle)** :
1. `workspaces` : `["packages/*"]` → `["packages/*", "apps/*"]` (F-public seul propriétaire, item 4 ; quick-verify R1).
2. `apps/site` : scaffold Next.js App Router, versions épinglées, Tailwind + shadcn/ui, TS aligné racine (`typescript@6.0.3`, ESM, node ≥ 24).
3. **Coutures X↔F possédées par F-public** (correction 3) : (a) `lang-gate.mjs` — ajouter le scope `site` (`apps/site`) et les extensions `.tsx`/`.mdx` à `TEXT_EXTS` ; (b) `export-public.mjs` — exclure `node_modules`, `.next`, `.turbo` du parcours `readdirSync` d'`apps/site` (ou ne suivre que les fichiers git-suivis) ; (c) test 42 étendu (mutant : `.next` exporté ⇒ rouge).
4. **Socle données** aligné D1 (correction 7) : les figures vivent dans **`fixtures/figures-sourced.json`** (emplacement canonique D1 item 12, déjà en liste blanche D7) ; `apps/site` les lit via `loadCommitted()` contre `apps/site/data/manifest.sha256.json`. **Contenu v0 énuméré** = les 5 chiffres Qin 2021 **[lu]** déjà rédigés (`scratchpad/figures-sourced.json`, à promouvoir sous G2) : 1.07 B USD liquidatable (MakerDAO, as of 2021-04-30, P-K1-1 p.344) ; 807.46 M ; 63.59 M ; 8.38 M ; 19.07 %. Toute autre figure = « to be announced ».
5. **Contenu MDX** (correction 1) : les pages de contenu vivent sous **`apps/site/content/**`** (hashé au manifest), **pas** dans `app/**`. `app/**` = layout + composants qui lisent `content/` et `fixtures/` via `loadCommitted()`.
6. **Test 44** (correction 1, à la **racine `test/site-honesty.test.ts`** — correction 10, car les globs `npm test` excluent `apps/**`) : (a) `loadCommitted()` vérifie les sha256 du manifest ; (b) **lint d'honnêteté à périmètre défini** — interdit un **littéral numérique dans une position de texte rendu** (nœud texte JSX, ou chaîne passée comme contenu visible) sous `apps/site/{app,content}/**`, **hors** : `className`/`style`/attributs SVG (`viewBox`, `grid-cols-*`, `gap-*`, `w-*`), `key`, chemins d'import, dates ISO (`\d{4}-\d{2}-\d{2}`), identifiants `^(ADR-M\d+|R-\d+|CA-\d+|D\d+|HIP-\d+)$`, et toute valeur issue de `figures-sourced.json`. Exemptions dans une **liste fermée commise `apps/site/test/honesty-lint.exempt.json`** (typées). **Mutant** : un `1.07` en dur dans une page ⇒ rouge.
7. **English-only** (correction 2) : oracle = `lang-gate.mjs` étendu au scope `site` (F-1 item 3a) ; **mutant** « chaîne FR visible dans une page ⇒ rouge ».
8. **Couverture lint** (correction 10) : `apps/site` couvert par le `npm run lint` racine (config eslint plate étendue à `apps/**`) ; le cliquet reste inchangé (tests uniquement). `npm run ci` racine exécute donc lint + test 44 racine.

**F-2 (pages)** :
9. **Home `/`** = « deck » public-safe : one-liner compagnie + vue flotte (3 agents live : Shōgen, Hikae, Ukemi) + **profile picker** (5 segments) ouvrant le **panneau** par produit. Comportement v0 quand seul Shōgen a un panneau riche : les autres panneaux affichent leur diagramme + « to be announced » (jamais une maquette).
10. **Panneau Shōgen** end-to-end (proposition 8 items, items sans donnée publique = « to be announced » / lien roadmap).
11. **`/roadmap`** (EN) : 3 agents live **+ les 8 noms d'agents futurs en teasers « upcoming »** (décision investisseur §5) — **sans** carte d'attachement, **sans** chiffres de marché, **sans** termes commerciaux.

## 4. Hors périmètre (incréments ultérieurs, nommés — correction 11)
`/live` (F-live) ; `/decisions` (F-console) ; `/docs` Fumadocs (**lot docs**) ; `/api/reference` + Scalar (**B-api / lot docs**) ; analytics (deploy-time) ; **hébergement + mise en ligne** (**incrément F-deploy, post-Q2 / B-infra** — porte le « site en ligne » de CA-F) ; panneaux Hikae/Ukemi riches (**incrément F-public suivant**) ; **`llms.txt`** (**incrément F-3 « machine surface »**, fichier statique sous manifest) ; tokenomics (Q3) ; `/articles` ; `/legal` (Q4).

## 5. Réserve d'honnêteté (liante) + escalade tranchée
- **Décision investisseur (2026-09-06)** : le site public et le dépôt exporté peuvent porter les **8 noms d'agents futurs en teasers roadmap** ; **interdits** : carte segment→produit, chiffres de marché investisseur, termes commerciaux.
- **Zéro chiffre de marché investisseur** sur le site (ROADMAP §8) ; seules les figures `fixtures/figures-sourced.json` **[lu]+qualifiées** s'affichent ; sinon « to be announced ».
- **Copy = projection du corpus déclassifié** (décisions investisseur verbatim traduites, ADR, roadmap) ; **zéro affirmation nouvelle** ; toute phrase soumise au checkpoint 2 (correction 12).
- Noms/casse = nomenclature gelée, Title case.

## 6. Rôles, gates, MAST (correction 9)
- **Roster** : orchestrateur `claude-fable-5-1` (seul committeur) ; implémentation workers `claude-opus-4-8` effort `max` ; G2 = instance Opus 4.8 séparée, contexte frais ; lecture `claude-sonnet-5`. **Gate 0** au 1er worker.
- **Boucle** : G0 (ce plan + addendum D2) → impl localisée → G2 (checklist + mutants nommés : test 44, lang FR, export `.next`) → oracle : `npm ci` + `npx next build` + `npm run lint` + `npm run ci` (dont test 44) verts → G7 → acceptation validateur → **checkpoint 2 avant toute publication**.
- **Fan-out** : aucun (séquentiel mono-agent + oracle ; garde-fou de réduction).
- **MAST (modes de la tranche)** : (i) *maquette présentée comme réel* → test 44 + règle d'honnêteté D1 ; (ii) *mort de worker en cours de lot* (mesurée, journal) → état vérifié par l'orchestrateur + relecture delta Opus avant commit (D10 M003 option a) ; (iii) *pression de délai* → R-22, R-25, aucune publication avant checkpoint 2.
- **R-25** : estimation — F-1 (scaffold + socle + coutures + test) et F-2 (pages) chacun visé sous 1 205 ; scission **a priori** ci-dessus, pas a posteriori.

## 7. Critères d'acceptation (sous-ensemble CA-F ; « en ligne » porté par F-deploy, correction 11)
- `next dev` local : home + panneau Shōgen + `/roadmap` rendus.
- **Test 44 vert** (manifest + lint d'honnêteté à périmètre défini + exemptions commises) ; **mutant tué en G2**.
- **English-only vert** sur `apps/site` (scope `site` du lang-gate) ; mutant tué.
- Négatifs/états réels visibles (« to be announced ») ; aucune maquette.
- `workspaces` modifié par F-public seul ; contrats gelés intacts (`git diff schemas/ packages/contracts` vide) ; `package-lock.json` commis, versions épinglées ; composants shadcn journalisés (R-8).
- **Export** : aucun run incluant `apps/site` avant checkpoint 2 (correction 12) ; exclusion `.next`/`node_modules` prouvée par test 42 étendu.
- Zéro dette nue ; pendants formés (§8).

## 8. Dépendances (état EXACT — correction 3) et pendants (correction 11)
- **Lot X : NON MERGÉ** (`lot-x-export`=`35e9863` rebasé sur `main`=`317dba7` ; `main` n'a pas `export-public.mjs`). **Prérequis** : finir X (G7 → PR → merge) **avant** la PR F-public. F-public branche sur le **nouveau main** et possède les 3 coutures (§3 F-1 item 3).
- **Satisfaites** : E-root (PR #4 mergée), E-contracts (PR #3 mergée). **Non requis en local** : domaine, Q2, `DEPLOY_SSH_KEY`.
- **Pendants formés** : Q2 hébergement (contrainte SSE de `/live`) ; comparaison **Nextra vs Fumadocs** (procurement) ; **Scalar** OpenAPI→MCP (procurement) ; **Velite** (procurement) ; profondeur narrative console (F-console) ; analytics ; registres MCP ; **llms.txt** → incrément F-3 ; **CA-F « en ligne »** → incrément F-deploy ; licence Q4 (bloque la publication, pas le local).

## 9. Demande au validateur (à la clôture, checkpoint 2)
Vérifier l'application fidèle des 12 corrections et de la décision d'escalade §5 sur le livrable F-1/F-2.

## 10. Traçabilité des 12 corrections du checkpoint 1
1 → §3 F-1(5,6) + §7 (lint d'honnêteté à périmètre + exemptions commises + MDX sous `content/`). 2 → §3 F-1(3a,7) + §7 (oracle lang-gate scope `site`). 3 → §8 (X non mergé, prérequis + 3 coutures possédées). 4 → §3 (panneau pas page ; 8 items = proposition v0). 5 → §5 (escalade tranchée). 6 → §2 (décidé/orientation/procurement). 7 → §3 F-1(4) (`fixtures/figures-sourced.json` + contenu v0 énuméré). 8 → §2 R-8 shadcn (CLI épinglé + composants journalisés). 9 → §6 MAST. 10 → §3 (F-1/F-2) + §6 R-25 + test 44 racine + §3 F-1(8) couverture lint. 11 → §4 + §8 (llms.txt→F-3, en ligne→F-deploy, Nextra/Fumadocs procurement). 12 → §5 + §7 (aucun export avant checkpoint 2 ; copy = projection).
