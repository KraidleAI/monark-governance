Modèle résolu : claude-opus-4-8[1m]

# G0 (PLIÉ) — lot SITE-RELEASE-1 (temps 1 : `/narabi/`, `/ukemi/`, favicons par route)

> Statut : **G0 PLIÉ** par le worker (Opus 4.8, effort max) sur le **checkpoint-1** (`docs/CHECKPOINT1-lot-site-release-1.md`, décision APPROUVE-AVEC-CORRECTIONS, C-1..C-11, M-V1..M-V10) et les **rulings orchestrateur** (`docs/CHANTIERS.md` : Q-1..Q-8 du 04:50 UTC ; C-3/C-4 du 05:05 UTC). Ce document PLANIFIE ; il ne modifie aucun fichier du dépôt (R-20). Il reste soumis à la vérification adversariale de l'orchestrateur (R-21) : chaque fait porte sa preuve rejouable au §Appendice MESURES ou une référence de ligne [lu] à `826e2c7`. Le §16 trace où chaque correction est pliée. Les §17/§18 sont **deux missions G1 séparables, à fichiers disjoints** (worktrees parallèles, ruling CHANTIERS:699) ; le §19 en donne la table de disjointness.

## 0. Provenance (doc 02)
- **Modèle épinglé** : `claude-opus-4-8` (effort `max`), worker AgileGates. Réviseur cible : orchestrateur Fable 5.1.
- **Date** : 2026-09-22 (`date -u` de la session).
- **Base de lecture** : `F:\Monark` @ **`826e2c7`** (`git rev-parse HEAD` = `826e2c774bcbd87c4ab2a146f1bef1dfb909711a`, branche `lot/etude-suite`, arbre propre) — lecture seule. Le DRAFT et ses MESURES étaient basés sur `58e4d13` ; **les chemins de code sont byte-identiques entre `58e4d13` et `826e2c7`** (preuve appendice M-13.0 : `git diff --stat 58e4d13 HEAD -- apps/ test/ scripts/ .github/` = vide — seuls des `docs/*.md` ont changé), donc les mesures M1..M12 du DRAFT sont reportées telles quelles et re-vérifiées ici sur pièces.
- **Écriture** : uniquement `F:\tmp\site-release\` (`G0-lot-site-release-1.PLIE.md`, `measure-fold.mjs`) + scratchpad de session. Aucun réseau, aucune variable d'environnement affichée (A-7).
- **Design amont** : maquettes v4 validées par relecture conjointe investisseur + orchestrateur (`F:\PRODUITS\etude-2026-09-21\maquettes-release\v4\{index,narabi,ukemi}.html`, `assets\`) ; note `F:\PRODUITS\etude-2026-09-21\maquettes-release\NOTE-maquettes-v4.md` (**un niveau AU-DESSUS de `v4\`** — correction du chemin du DRAFT §0, checkpoint l.12). Le design est HORS gates (décision 101/62) ; **le CODE Next.js qui l'implémente EST sous gates** — objet de ce G0.
- **Chiffres** : Appendice MESURES de ce fichier (M-13..M-23 = un par correction C-1..C-11 ; M1..M12 reportées du DRAFT, code identique). Chaque chiffre = sa commande, rejouable à `826e2c7`.

## 1. Décisions investisseur qui nomment ces pièces publiques (toutes [lu] première main à `826e2c7`)
- **D-117 — périmètre temps 1** [lu `docs/CARTOGRAPHIE-TEMPS-1-BASELINE.md:20`] : Narabi + Ukemi servis ; **Bell** (`apps/bell/**`) cartographié mais **temps 2 = reste `upcoming` partout**. ⇒ périmètre servi de ce lot = Narabi + Ukemi ; Bell absent (ni page, ni logo, ni lien).
- **D-51 — Ukemi `built`, jamais `upcoming`** [lu verbatim `docs/CHANTIERS.md:116`] : « garder built … produit fini et parfait » ; confirmé `apps/site/lib/fleet.ts:156` (`status: "built"`, gelé par `fleet_register_built_set_is_frozen`). ⇒ pilule Ukemi = `built`, lue du registre, jamais codée en dur.
- **D-123 — 51 maintenue à la lettre ; `cascade` sort en U-5** [lu verbatim `docs/CHANTIERS.md:622-627`] : re-câblage `fleet.ts` = U-4b-2b (hors ce lot) ; retrait `cascade` = U-5 (hors ce lot).
- **D-126 — région servie = borne haute (score unilatéral)** [lu verbatim `docs/CHANTIERS.md:646-652`] : texte servi « upper bound », jamais « interval ». Confirmé `apps/harness/src/tools/gate.ts:134-142`. ⇒ barre de 0 à la borne, ŷ marqué dedans, 0 « interval » dans le texte de la classe.
- **D-120 — lockups finaux** [lu `docs/CARTOGRAPHIE-TEMPS-1-BASELINE.MESURES.md:19` ; marques `components/marks/{ukemi,narabi}-mark.tsx` en `currentColor`, déjà adaptatives].
- **D-127 — surfaces publiques dans le même lot** [lu `docs/CHANTIERS.md:654-657`] : jamais une pièce servie sans son registre. **Application §11** : ce lot ne modifie AUCUNE pièce servie ⇒ skill/MCP Registry/README/openapi/trace h5 NON concernés.
- **D-101 / D-62 — site hors gates de DESIGN, code SOUS gates** [lu `docs/CHANTIERS.md:414`, `:125`] : `gate:vocab`, mots interdits, `public_surfaces_make_no_probative_claim`, servi et parcouru en local restent non négociables. ⇒ ce G0 régit le code.
- **D-106 — retrait Blast/Llama du code servi** [lu `docs/CHECKPOINT1-lot-pool-rpc-1.md:58`, `CHANTIERS:436-437`]. **Fait de provenance daté (non-dette)** : le snapshot Narabi committé (`narabi-snapshot.ts`, `capturedAt 2026-09-19`, appendice M-15) PRÉCÈDE D-106 (2026-09-21) ⇒ ses `endpoints` incluent encore `eth.llamarpc.com` et `eth-mainnet.public.blastapi.io` (faits publiés de `timeline.jsonl`, non retapés) ; la page vivante suivra le snapshot suivant.

## 2. Objet, thèse, garde-fou de réduction
- **Objet** : porter dans le site de production Next.js les corrections de la maquette v4 pour clôturer le temps 1 côté vitrine — (a) **Narabi** : pilule « **built · step N of 7 before first reading** » (C-3), glossaire `under_calib` générique (C-11) ; (b) **page `/ukemi` créée** (borne haute, classe servie nommée, clause conditionnelle, état honnête `under_calib`) ; (c) **favicons adaptatifs par route** (Q-3b) ; (d) **assertion body `g3-site` étendue** (voie i, C-4).
- **Fait mesuré qui cadre le lot** [lu, appendice M-21] : **aucune route `/ukemi` n'existe** (`find apps/site/app -iname '*ukemi*'` = ∅ ; seuls `components/marks/ukemi-mark.tsx` et `components/ukemi-panel.tsx` existent). La page `/ukemi` est **une pièce à créer et à brancher** (règle Branchement).
- **Garde-fou de réduction (AgileGates)** : tâche de vitrine vérifiable par oracle déterministe (build + rendu + scan body + greps + égalité de constantes) ; **mono-worker G1 + oracle non-LLM par sous-lot**, pas de fan-out. Le fan-out (relecteur G2, checkpoint-2) sert l'indépendance de vérification, jamais le débit.
- **Ce que le lot NE fait PAS** : il ne touche pas `fleet.ts` (gelé ; re-câblage borne-haute = U-4b-2b), ne bump aucune version servie, n'ajoute/retire aucun outil MCP ⇒ skill/MCP Registry/README non concernés (D-127). Il n'ajoute **aucun** `scripts/assert-site-pages.mjs`, ne modifie **ni** `ci.yml` **ni** `test/site-build-fleet.test.ts` (voie i, §3.4/§11, C-4).

## 3. Périmètre EXACT, fichier par fichier
Convention : **[MQ]** contenu/forme des maquettes v4 porté sous les **tokens storefront** `globals.css` (jamais la charte C brute) ; **[SITE]** mécanique conservée ; **[HORS]** hors lot.

### 3.1 Fichiers NOUVEAUX
| Fichier | Sous-lot | Rôle | Contrainte dure |
|---|---|---|---|
| `apps/site/app/ukemi/page.tsx` | **B** | Route `/ukemi`, **server component STATIQUE (aucun `fetch`, aucun `"use client"`)** | Statique ⇒ `next build` rend `ukemi.html` ⇒ `assertUkemiBody()` peut l'asserter (§3.4). `metadata` title/description **sans chiffre** (lint règle 5, C-11) |
| `apps/site/components/ukemi/ukemi-page.tsx` | **B** | Corps : hero, is/is-not, « what is served » (**état honnête `under_calib`**, `LIQ_EMPTY_REGISTRY_SENTENCE` rendue en **UN seul `{X}`** JSX child), méthode (**digit-free, sans ordinal numérique rendu**), clause conditionnelle, limites, **barre borne-haute schématique** (`aria-hidden`, largeurs en `style`/`className`, **aucune graduation numérique rendue**) | **0 jeton numérique** dans le TEXTE rendu (nœuds texte + `alt`/`title`/`aria-label`) — prouvé par `assertUkemiBody()` (C-1) |
| `apps/site/lib/ukemi-copy.ts` | **B** | **Données pures — AUCUN import React/Next** (régime PORTABILITY de `fleet.ts:21`, importable par le test racine, C-11) : les **4** constantes `LIQ_UPPER_BOUND_SENTENCE`, `LIQ_H3_SENTENCE`, `LIQ_CONDITIONAL_SENTENCE`, `LIQ_EMPTY_REGISTRY_SENTENCE` **byte-identiques** à `gate.ts` ; prose méthode/limites (digit-free) ; listes is/is-not ; `UKEMI_ROUTE` | Constantes byte-identiques (§6.3, test d'égalité §17/B). **`LIQ_REQUIREMENTS_SENTENCE` (chiffres) EXCLUE** — jeu fermé de 4 déclaré (C-2) |
| `apps/site/app/ukemi/icon.svg` | **B** | Favicon Ukemi adaptatif (repris de `assets/favicon-ukemi.svg`, `@media prefers-color-scheme`, 12 l., M2) | **0 URL chargée** (§6.5). En **B** car la route `/ukemi` naît en B (C-9) |
| `apps/site/app/narabi/icon.svg` | **A** | Favicon Narabi adaptatif (repris de `assets/favicon-narabi.svg`, 14 l., M2) | idem |
| `test/site-ukemi.test.ts` | **B** | Tests racine (répertoire `test/` = DORMANT, exclu de l'export ⇒ **aucune inscription** dans `scripts/export-exclude-tests.json`, M-16/§19) | §17/B |

### 3.2 Fichiers MODIFIÉS
| Fichier | Sous-lot | Changement | Type |
|---|---|---|---|
| `apps/site/lib/narabi-live.ts` | **A** | + `firstReadingLabel(state, lines)` (fonction PURE ; « built · step {`state.tracker.t`} of {`SERIES_MIN_STEPS`} before first reading » si `t < SERIES_MIN_STEPS`, sinon « built · {`lines.length`} windows published »). **Réutilise `SERIES_MIN_STEPS` (l.36), PAS de `WINDOW_BEFORE_FIRST_READING`** (source unique, C-5) | [MQ]+[SITE] |
| `apps/site/components/narabi/narabi-live.tsx` | **A** | Rendu de la pilule `{firstReadingLabel(state, lines)}` dans l'en-tête héros (tokens storefront, repli `min-width:0`) ; **porteur asserté** (C-7) | [MQ] |
| `apps/site/lib/narabi-copy.ts` | **A** | + entrée `under_calib` dans `GLOSSARY` (une ligne, **générique** — jamais « in the stratum », vocabulaire Ukemi sur la page Narabi ; C-11) | [MQ] |
| `scripts/assert-fleet-html.mjs` | **B** | + `assertUkemiBody()` + `UKEMI_HTML_REL` + `main()` lit AUSSI `ukemi.html` (voie i, ligne `run:` CI inchangée) ; imports attendus depuis `ukemi-copy.ts`, **jamais `gate.ts`** (C-1) | [SITE] |
| `scripts/assert-fleet-html.d.mts` | **B** | Jumeau de type : déclare les **nouvelles** exportations (`assertUkemiBody`, `UKEMI_HTML_REL`, éventuel `UKEMI_HEADER`/scanner exporté) pour le `tsc` nodenext racine (C-4). Governance-only, non whitelisté | [SITE] |

**Home `/` et favicon global `app/icon.svg` : NON touchés** (Q-2b, Q-3b — §12).

### 3.3 Tests NOUVEAUX / étendus — chaque test a son mutant nommé (D-1)
| Test | Sous-lot | Prouve | Mutant nommé |
|---|---|---|---|
| `test/narabi-live.test.ts` (extension) `narabi_first_reading_label_reads_committed_t` | **A** | t=1 : `firstReadingLabel(state,lines) === "built · step 1 of 7 before first reading"`, **N dérivé de `NARABI_SNAPSHOT` parsé** ; t=6 : « step 6 of 7 » ; t=7 : « built · N windows published » (bascule à `SERIES_MIN_STEPS`) | littéral `1` tapé / libellé codé en dur ⇒ ROUGE à t=6/t=7 ; bascule hardcodée à un nombre ≠ `SERIES_MIN_STEPS` ⇒ ROUGE à la borne |
| `test/narabi-live.test.ts` (carrier) | **A** | `narabi-live.tsx` rend `{firstReadingLabel(` (idiome `comp.includes("{ID}")`, `narabi-live.test.ts:122-125`) ; `under_calib` def digit-free (`scanText`) | render pilule supprimé ⇒ ROUGE ; chiffre dans la def ⇒ ROUGE |
| `test/site-ukemi.test.ts` `site_ukemi_copy_equals_served_liq_text` | **B** | chacune des **4** constantes `ukemi-copy.ts` **byte-identique** à `gate.ts` (import des DEUX ; jeu FERMÉ nommé, C-2) | un caractère changé ⇒ ROUGE |
| `test/site-ukemi.test.ts` `site_ukemi_served_text_never_interval` (**A-9**) | **B** | injection « interval » dans **CHAQUE** constante servie **ET** dans `honestyText` ⇒ égalité + never-interval + body ROUGES (récidive U-4b-2a C-2 ; rejeu de `gate-liq.test.ts:184`) | grep sur la phrase NOMINALE seule = faux vert ⇒ ROUGE |
| `test/site-ukemi.test.ts` `site_ukemi_body_scan_and_carrier` (fixtures synthétiques, comme `site-build-fleet.test.ts` pilote `assertFleetBody`) | **B** | `assertUkemiBody()` : fixture avec jeton numérique ⇒ throw ; sans `LIQ_EMPTY_REGISTRY_SENTENCE` ⇒ throw ; avec `interval`/`cascade`/`Bell`/`Aave` ⇒ throw ; sans clause « which the gate does not check » ⇒ throw. **Parité scanner** : le scan `.mjs` et `scanText` (`honesty-lint.ts:74`) donnent la même sortie sur un jeu de fixtures (idiome « the root test asserts the identity », `narabi-live.ts:31-32`) | page creuse / phrase absente / dérive de scanner ⇒ ROUGE |
| **extension `scripts/assert-fleet-html.mjs`** : `assertUkemiBody()` sur `.next/server/app/ukemi.html` (rejoué par `g3-site` sur l'artefact RÉEL) | **B** | **dans le `<main>` de `/ukemi`** (isolé du chrome + `next/font`, M-24) : **scan de jetons numériques = 0** (nœuds texte + `alt`/`title`/`aria-label`, exclusions ISO + `ADR-M\d+\|R-\d+\|CA-\d+\|D\d+\|HIP-\d+`, **PAS `honesty-lint.exempt.json`**), `LIQ_EMPTY_REGISTRY_SENTENCE` **présente byte-identique**, `interval`=0, `\bcascade\b`=0, `\bBell\b`=0, `\bAave\b`=0, clause « which the gate does not check » présente | page creuse / `<main>` absent / `<script>` non clos ⇒ fail-closed (garde `renderedBody` + garde de vacuité `<main>`) |

### 3.4 CI — **voie (i) RETENUE** (ruling C-4), frottement minimal
Étendre `scripts/assert-fleet-html.mjs` in-situ, **ligne `run:` CI inchangée** :
- `g3_site_build_run_line_is_pinned` (`test/site-build-fleet.test.ts:161-167`) exige exactement `run: npm run build -w @monark/site` (=`SITE_BUILD_RUN`, l.163) ET `run: node scripts/assert-fleet-html.mjs` (l.167) — **toutes deux inchangées** ⇒ vert. `derived_workflow_run_paths_are_exported` (`:170-183`, l.179) exige `scripts/assert-fleet-html.mjs` exporté — **déjà** ⇒ **aucun** nouveau chemin, **aucun** `WHITELIST_FILES`. Le job `g3-site` reste **3 étapes** ; `ukemi.html` est rendu par le **même** `next build` ; `assertUkemiBody()` lit l'artefact dans le **même** `main()`.
- **`assert-site-pages.mjs`, la nouvelle étape `ci.yml`, la modification de `site-build-fleet.test.ts` (voie ii) sont ABANDONNÉS** (incohérence M-V10 du DRAFT §9/§11/§13 corrigée — C-4, M-16). Seul le **jumeau `.d.mts`** de `assert-fleet-html.mjs` est mis à jour (nouvelles exportations, C-4).
- **Note (non un oubli)** : le `name:` de l'étape O-2 (`ci.yml:174`) ne cite que `/fleet` ; il **n'est PAS modifié** (voie i, disjointness §19) — l'assertion `/ukemi` est ajoutée DANS le `.mjs` (`main()` lit les deux artefacts), pas dans le libellé d'étape ni dans une nouvelle étape.

### 3.5 [SITE] réutilisé, NON modifié (lecture seule)
`apps/site/lib/narabi-snapshot.ts` (source de N ; sha re-hashé par `narabi-live.test.ts`) ; `apps/site/lib/fleet.ts` (registre Ukemi `built` + seam `cascade → gate`, **gelé**) ; `apps/site/lib/load-committed.ts` + `apps/site/data/manifest.sha256.json` ; `apps/site/app/globals.css` (tokens) ; `components/marks/{ukemi,narabi}-mark.tsx` ; `apps/harness/src/tools/gate.ts` (source de vérité du texte servi — lue par le TEST racine, jamais par le `.mjs`) ; `scripts/{grep-forbidden,lang-gate,export-public}.mjs`.

### 3.6 [HORS] lot (justifié, item formé avec déclencheur)
- `fleet.ts` ligne Ukemi + seam `cascade → gate` : re-câblage borne-haute = **U-4b-2b** (`docs/G7-lot-u4b-2a.md` §4). Ce lot ne change **aucune pièce servie**.
- Cadrage « cascade »/« interval » du RESTE du site (10 fichiers, M4) : conservé (interdit `\bcascade\b` = scope **sentinel**, pas site — §6.6) ; durcissement = **U-5b** (Q-1b).
- Skill ClawHub / MCP Registry / README / openapi / trace h5 / `ALLOWED_TOOL_NAMES` / pierre tombale : **non concernés** (§11, D-127).

## 4. Pilule Narabi « built · step N of 7 before first reading » (C-3, C-5, C-7)
- **Libellé (ruling C-3, CHANTIERS:697, appliqué à la lettre)** : `t < SERIES_MIN_STEPS` ⇒ « **built · step N of 7 before first reading** », **N = `state.tracker.t`** (pas ÉVALUABLES, cohérent avec `WHY_SEVEN` « seven daily steps ») ; `t ≥ SERIES_MIN_STEPS` ⇒ « **built · N windows published** », **N = lignes de timeline publiées** (`lines.length`). Signature `firstReadingLabel(state, lines)` sur le précédent `projectedBoundDate(state, lines)` (`narabi-live.ts:271`).
- **Pourquoi « step », pas « day » (mesuré, M-15)** : le snapshot committé (`capturedAt 2026-09-19`) a **`tracker.t = 1`** mais **2 fenêtres publiées** (2026-09-17 `non_evaluable` T=0 ; 2026-09-18 `evaluable` T=1). « day 1 » serait **faux** (2ᵉ jour de publication) ; « step 1 of 7 » est honnête (1 pas évaluable de 7). Le tracker ne franchit un pas que sur une paire évaluable (`narabi-live.ts:274`).
- **N LU, jamais tapé** : à t=1, N dérivé de `NARABI_SNAPSHOT.stateJson` parsé (test racine) ; sur le site, N rendu à chaque lecture depuis `state.json` (repli snapshot committé, badge « snapshot » déclaré). Le « 7 » vient de `SERIES_MIN_STEPS` (l.36) — **pas de constante `WINDOW_BEFORE_FIRST_READING`** (doublon M-V3/M-17, C-5).
- **Piège client component (C-7, résiduel NOMMÉ)** : `/narabi` est un **client component** (`"use client"`, `narabi-live.tsx:1` — M-19) ⇒ le HTML de `next build` pour `/narabi` = coquille « reading the published files… ». **Un grep sur `narabi.html` ne verra jamais N.** Plancher accepté : (i) **fonction pure** testée sur les octets RÉELS du snapshot (t=1) + états synthétiques (t=6/t=7) ; (ii) **porteur asserté** (`comp.includes("{firstReadingLabel(")`, idiome `narabi-live.test.ts:122-125`) ; (iii) **parcours visuel investisseur** (décision 101). Option sans obligation : amorcer l'état initial depuis le snapshot committé pour que la pilule rende dans `narabi.html`. **Déclencheur : parcours visuel investisseur** (résiduel accepté jusqu'à ce parcours — pas une dette nue, il est nommé, son plancher est un test non-LLM ; aligné §10.A / §15).

## 5. Pilule Ukemi `built` — lit UNIQUEMENT `status` (C-6)
- Lue du **registre unique** `fleet.ts` : `FLEET_AGENTS.find(name==="Ukemi").status` (jamais « built » codé en dur). Gelé par `fleet_register_built_set_is_frozen`. D-51/D-123.
- **C-6, mesuré M-18** : `/ukemi` (et `ukemi-page.tsx`) lit **UNIQUEMENT `status`**, jamais `line` (« Liquidation-cascade **survival**. », `fleet.ts:155`) ni `wiring.*` (portent « cascade », `fleet.ts:160-166`). Rendre `line`/`wiring` rougirait `assertUkemiBody()` `\bcascade\b`=0 (§3.3) et **ne se répare JAMAIS par une édition de `fleet.ts`** (gelé).
- **Interdiction explicite (réflexe worker à couper)** : `/ukemi` **ne réutilise NI `components/ukemi-panel.tsx` NI `lib/fleet-presentation.ts`** — tous deux figurent dans les 10 fichiers portant `cascade`/`interval` (M4) ⇒ les réutiliser rougirait `\bcascade\b`=0 (`assertUkemiBody`). La page a son propre `ukemi-page.tsx` qui lit `status` seul.

## 6. Ukemi — borne haute, texte servi, honnêteté
### 6.1 Borne haute (D-126)
Barre de **0 à la borne** (bord gauche ouvert à 0), **ŷ marqué dedans** (tick « ŷ »), **jamais une jauge**. Rendu **schématique** (`aria-hidden`, largeurs en `style`/`className` = **hors** scan `assertUkemiBody`) — **sans graduation numérique rendue** (les « 0 / 2 500 000 / 5 000 000 » de la maquette sont des littéraux en position rendue ⇒ interdits par le scan body, C-1, et par test 44 (b)).
### 6.2 Zéro « interval » (mutant A-9)
`LIQ_UPPER_BOUND_SENTENCE` et `LIQ_EMPTY_REGISTRY_SENTENCE` = **0** « interval » (M7 ; `gate-liq.test.ts:178-185`). Le champ de fil `region.kind = "interval"` est un contrat gelé, **non affiché**. Le **mutant A-9** rejoue l'injection sur **chaque constante servie + `honestyText`** (pas seulement la phrase nominale).
### 6.3 Clause conditionnelle portée + jeu FERMÉ de constantes (C-2)
La maquette v4 **NE porte PAS** « which the gate does not check » (M3b = 0). Ce lot la porte via `LIQ_CONDITIONAL_SENTENCE` (`gate.ts:156-158`), **byte-identique** dans `ukemi-copy.ts` et **rendue** dans le body. **Jeu FERMÉ des 4 constantes portées** (C-2) : `LIQ_UPPER_BOUND_SENTENCE` (`:140-142`), `LIQ_H3_SENTENCE` (`:149-151`), `LIQ_CONDITIONAL_SENTENCE` (`:156-158`), `LIQ_EMPTY_REGISTRY_SENTENCE` (`:167-168`). **`LIQ_REQUIREMENTS_SENTENCE` (`:145` = « this class requires alpha = 0.01, nMin = 100 ») est OMISE, motif déclaré : elle porte des CHIFFRES** (Q-5a : prose digit-free au temps 1) alors qu'elle est bien servie dans `GATE_TOOL_DESCRIPTION` (`:191`) — omission NOMMÉE dans l'ADR B (M-14, M-V4). Le test d'égalité nomme le jeu de 4.
### 6.4 « under_calib » au glossaire (`narabi-copy.ts`, sous-lot **A**)
+1 entrée `GLOSSARY` (**anglais générique**, C-11 ; le brouillon disait « in the stratum » = vocabulaire Ukemi, corrigé). Formulation type (finalisée au G1) : `{ term: "under_calib", def: "Too few calibration points for a population: the region is withheld and the state is published. A named state, never a number." }`. Le mot vit déjà dans le contenu (`narabi-copy.ts:61` « Every other population abstains under_calib ») ; il manque au glossaire (mesuré : `GLOSSARY` = **8** entrées, pas d'`under_calib` — M-23).
### 6.5 Favicons adaptatifs par route (Q-3b ; assets LOCAUX, 0 URL)
Favicons **par-route** `app/{ukemi,narabi}/icon.svg` repris des `assets/favicon-{ukemi,narabi}.svg` (adaptatifs `@media prefers-color-scheme`, sha M2). **0 URL chargée** : SVG local, aucune police/image distante, aucun `@import`, aucun `url(http…)`. **Oracle G1 par sous-lot (C-9)** : grep du `<head>` bâti de la route DU sous-lot (`<link rel="icon">` par route) — **oracle LOCAL, jamais dans `assert-fleet-html.mjs`** (sinon le favicon de A serait asserté par le script de B et la disjointness casse — §19).
### 6.6 Interdits (mesures §Appendice, à re-mesurer au G1)
`node scripts/grep-forbidden.mjs <surfaces>` (GLOBAL) = **0** ; `npm run gate:vocab` = **0**. **Passes site ET sentinel 0/0/0** sur les surfaces livrées (le scope sentinel porte `\bcascade\b`, `reference price`, `would have alerted`, `Λ=0`, `adaptive coverage`). Note de portée : sur le site actuel, `\bcascade\b`/`interval` NE sont PAS gatés (scope sentinel, M4/M9) ; `/ukemi` NOUVELLE est écrite cascade-free/interval-free et le prouve par la passe sentinel + `assertUkemiBody()` + le mutant A-9 (Q-1b).
### 6.7 Non-ASCII (mesuré M12, pas deviné)
Symboles math (`ŷ`, `α`, `1 − α`, `·`, `−`) **tolérés** en **prose d'AFFICHAGE** `/ukemi` — `/narabi` expédie DÉJÀ `q₁`, `q_t`, `α`, `·`, `−` et `lang:gate --scope site` = 0 (M12). Les constantes `LIQ_*` de `ukemi-copy.ts` restent **ASCII** (`yhat`/`qhat`) car **byte-identiques** à `gate.ts` (ASCII-only, `:148`). Distinguer **constante servie (ASCII, copiée)** de **glyphe d'affichage décoratif (toléré)**.

## 7. « site renders only committed data » — CONSERVÉ, et son point dur (C-1, C-10)
- **Test conservé** [lu `test/site-honesty.test.ts:38-65`] : `site_renders_only_committed_data (a)` (manifest + 5 figures) ET `(b)` (honesty-lint : littéral numérique en position rendue rougit).
- **Point dur — pourquoi test 44 NE SUFFIT PAS (M-V1/M-13)** : test 44 (b) via `scanAppsSite` **ignore les initialiseurs de variables et propriétés d'objet** (`honesty-lint.ts:13-14` « EVERYTHING ELSE is ignored: … object-literal properties, variable initialisers »). Preuve vivante : `narabi-copy.ts:59` `nCalib: "613"` rendu par `{GATE.nCalib}` et test 44 est **vert**. Donc un worker pourrait mettre « 185 of 189 » dans `ukemi-copy.ts`, rendre `{X}`, test 44 reste vert. ⇒ **seul un scan du BODY rendu garantit l'honnêteté** ; c'est `assertUkemiBody()` (C-1, §3.3).
- **Correction §7 (C-10, mesuré M-22)** : l'exemption `01-04` de `honesty-lint.exempt.json` **N'est PAS bornée par `context`** (le champ `context` est **documentaire** ; `exemptValues()` (`honesty-lint.ts:349-351`) ne prend que `value` ; la garde d'inertie `honesty_exempt_entries_have_rendered_carrier` (`ci-gates.test.ts:1146`) vérifie l'existence d'un porteur rendu, pas son emplacement). La contrainte retenue (**tout texte rendu de `/ukemi` est digit-free, scan body = 0, sans recours à l'exemption**) est plus stricte et referme la brèche.
- **Conséquence non-négociable (Q-5a/Q-7a)** : la section « what is served » rend **l'état servi honnête** (`LIQ_EMPTY_REGISTRY_SENTENCE`, un seul `{X}`) + barre schématique **sans chiffres**, PAS des régions SAMPLE. **Écart maquette à signaler** (§16) : les ordinaux « 01·book »…« 04·region » et « S1 »…« S4 » de la maquette sont **rendus digit-free** (le scan body n'honore PAS l'exemption 01-04 ⇒ aucun ordinal numérique rendu).

## 8. Bell absent (D-117)
Bell n'est PAS dans `fleet.ts` (M4/M-V8 : `apps/site` = **0** fichier « Bell »). La maquette **index** nomme Bell (carte « upcoming »), **mais c'est le NAVIGATEUR de maquettes, pas la home** ⇒ non porté (Q-2b). Contrôle G1 : `\bBell\b` = 0 sur `/`, `/narabi`, `/ukemi` rendus (`assertUkemiBody()` pour `/ukemi`).

## 9. R-25 — estimation PAR SOUS-LOT, borne 1 150, voie (i) (C-4, C-9)
- **Règle (A-5)** : R-25 mesuré au G1 avec le **pathspec VERBATIM** de `.github/workflows/ci.yml:65` (`.md` exclus, `docs/**/*.mjs` comptés, fixtures `json/jsonl/csv` exclus, **SVG comptés**). **> 1 150 ⇒ STOP + couture pré-déclarée**. Borne CI = **1 205** (`ci.yml:43` `VIBEGATES_PR_LIMIT`), borne interne = **1 150**. **Mesuré par SOUS-LOT** (chaque worktree isolé).

**SOUS-LOT A** (estimation, à confirmer au G1) :
| Fichier | Est. |
|---|---:|
| `lib/narabi-live.ts` (`firstReadingLabel`) | ~15 |
| `components/narabi/narabi-live.tsx` (pilule + porteur) | ~10 |
| `lib/narabi-copy.ts` (`under_calib`) | ~2 |
| `app/narabi/icon.svg` | ~14 (M2) |
| `test/narabi-live.test.ts` (t=1/6/7 + carrier) | ~40–60 |
| **Total A** | **~80–100** ≪ 1 150 |

**SOUS-LOT B** (estimation, voie i) :
| Fichier | Est. |
|---|---:|
| `components/ukemi/ukemi-page.tsx` | 250–350 |
| `lib/ukemi-copy.ts` | 120–180 |
| `app/ukemi/page.tsx` | ~15 |
| `app/ukemi/icon.svg` | ~12 (M2) |
| `scripts/assert-fleet-html.mjs` (`assertUkemiBody` + scan + main) | 80–140 |
| `scripts/assert-fleet-html.d.mts` (jumeau) | 10–20 |
| `test/site-ukemi.test.ts` (égalité + A-9 + fixtures + parité) | 120–200 |
| **Total B** | **~607–917** < 1 150 |

- **Verdict** : les DEUX sous-lots tiennent sous 1 150 (voie i supprime `assert-site-pages.mjs`/`ci.yml`/`site-build-fleet.test.ts`). **Couture pré-déclarée de contingence** : si la mesure réelle de B au G1 dépasse 1 150, **B se scinde** — **B1** = coquille + méthode/limites + copie + favicon ; **B2** = section « what is served » (`under_calib`) + `assertUkemiBody()` + tests. (Q-5(a) n'ajoute AUCUN record design-set dans ce lot ⇒ le +200–400 du DRAFT ne s'applique pas ; il est HORS lot, déclencheur U-4b-2b.)

## 10. Tuyaux — PAR SOUS-LOT (règle Branchement ; F-1 « entrée / sortie / état / test », C-8)

### 10.A Tuyaux du sous-lot A (pilule Narabi + glossaire + favicon narabi)
- **Entrée (qui produit)** : `narabi-snapshot.ts` (octets committés, sha re-hashé) → **N** (`tracker.t`) + **lignes de timeline** ; `SERIES_MIN_STEPS` (`narabi-live.ts:36`) → le « 7 ».
- **Sortie (qui consomme)** : `/narabi` **rendu par `next build` et servi** (Caddy `file_server`), lu par un visiteur = **chemin servi**. La pilule rend `{firstReadingLabel(state, lines)}` dans le héros ; l'entrée `under_calib` rend dans le glossaire ; `app/narabi/icon.svg` sert le favicon par route.
- **État (où il vit)** : `state.json`/`timeline.jsonl` publiés (repli snapshot committé, badge « snapshot » déclaré).
- **Test d'intégration non-LLM (autorise « branché », D-3)** : `narabi_first_reading_label_reads_committed_t` (fonction pure sur octets RÉELS, t=1/6/7) + porteur asserté + `scanText` (glossaire digit-free) + oracle LOCAL `<link rel="icon">` du `<head>` bâti de `/narabi`.
- **Résiduel NOMMÉ (C-7)** : client component ⇒ la composition DOM de la pilule n'est PAS exécutée par un test non-LLM (N absent du HTML de build) ; plancher = fonction pure + porteur + parcours visuel investisseur (décision 101). **Déclencheur : parcours visuel investisseur** (pas une dette nue).
- **Branchement** : A ne flippe aucun statut de registre (Narabi déjà `built`).

### 10.B Tuyaux du sous-lot B (page `/ukemi` + favicon ukemi + assertion body)
- **Entrée (qui produit)** : `gate.ts` (4 constantes servies, source de vérité) → `ukemi-copy.ts` (**byte-identique**, prouvé par le test racine qui lit les DEUX) ; `fleet.ts` → `status` **seul** (C-6) ; `globals.css` (tokens).
- **Sortie (qui consomme)** : `/ukemi` **rendu par `next build` (server component STATIQUE) et servi**, lu par un visiteur = **NOUVELLE surface servie branchée**. Le body rend `LIQ_EMPTY_REGISTRY_SENTENCE` (un seul `{X}`) + clause conditionnelle + méthode digit-free + barre schématique (`aria-hidden`, sans chiffre) ; `app/ukemi/icon.svg` sert le favicon.
- **État (où il vit)** : `fleet.ts` (source unique built/upcoming, Ukemi=built gelé) ; registre de la classe liq **vide** au temps 1 ⇒ état honnête `under_calib`.
- **Test d'intégration non-LLM (autorise « branché », D-3)** : `g3-site` = `npm run build -w @monark/site` (typecheck TSX invisible au `tsc` racine + rendu `ukemi.html`) → `node scripts/assert-fleet-html.mjs` **étendu** (`assertUkemiBody()` sur l'artefact RÉEL, **portée = `<main>` de `/ukemi`** isolé du chrome + `next/font`, M-24 : scan numérique=0, `LIQ_EMPTY_REGISTRY_SENTENCE` byte-identique présente, `interval`/`\bcascade\b`/`\bBell\b`/`\bAave\b`=0, clause présente). + test racine `site-ukemi.test.ts` (égalité 4 constantes vs `gate.ts`, A-9, `assertUkemiBody` sur fixtures, parité scanner) + oracle LOCAL `<link rel="icon">` du `<head>` bâti de `/ukemi`. La composition depuis l'artefact RÉEL satisfait CA-11 (C-1).
- **Branchement** : `/ukemi` est une NOUVELLE surface servie branchée par `g3-site` ; elle **ne flippe aucun statut** (Ukemi déjà `built` via le seam ; la borne-haute flippe `built` en U-4b-2b).
- **Item formé avec déclencheur (Q-5a)** : « rendre les figures design-set depuis un enregistrement committé + manifesté » — **déclencheur : U-4b-2b** (quand un record frais existe). Non rendu au temps 1 (digit-free).

## 11. Déploiement — critère de vert, aucune publication externe (D-127, voie i)
- **`g3-site`** [lu `ci.yml:152-176`] : `npm ci` → `npm run build -w @monark/site` → `node scripts/assert-fleet-html.mjs`. **Critère de vert** : build exit 0 **ET** assertion body exit 0 (`/fleet` ET `/ukemi` : notes/état servis présents, scan numérique=0, interdits=0, clause présente). Reste **« blocking conditional »** (Q-6b : passage en status-check requis = action orchestrateur de branch-protection, APRÈS la release, hors code worker).
- **Publication** : ce lot **BUILDE et GATE** ; il **NE DÉPLOIE PAS** (décision 46/D-101 : servi et parcouru en local, rien en ligne avant validation visuelle investisseur).
- **D-127** : ce lot **ne modifie AUCUNE pièce servie** (pas de bump `HARNESS_VERSION`, aucun outil, aucune classe servie changée) ⇒ skill ClawHub, MCP Registry, README, openapi, trace h5, `ALLOWED_TOOL_NAMES`, pierre tombale 410 **NON concernés**. Seule surface publique modifiée = **le site**.

## 12. Rulings APPLIQUÉS (plus de question ouverte — G0 plié)
Chaque Q tranchée par l'orchestrateur ; branche retenue, horodatage, ligne CHANTIERS, atterrissage.
| Q | Ruling (verbatim résumé) | Source | Atterrit |
|---|---|---|---|
| **Q-1 (b)** | pas de durcissement global `vocab-banned.json` ; `/ukemi` cascade-free par passe sentinel + A-9 (retrait cascade = U-5b) | CHANTIERS:681, 04:50 | §3.6, §6.6 |
| **Q-2 (b)** | la home ne change pas (badges du registre) ; index = navigateur de maquettes | CHANTIERS:682 | §3.2 (pas de `app/page.tsx`) |
| **Q-3 (b)** | favicon **PAR route** (`app/{narabi,ukemi}/icon.svg`), adaptatif, local | CHANTIERS:683 | §3.1, §6.5 |
| **Q-4 (a)** | à T ≥ 7, bascule « built · N windows published » (N lu) ; jamais « of 7 » faux | CHANTIERS:684 | §4 |
| **Q-5 (a)** | prose SANS chiffre au temps 1 + état honnête `under_calib` ; item formé design-set, déclencheur U-4b-2b | CHANTIERS:685 | §7, §10.B |
| **Q-6 (b)** | `g3-site` reste blocking conditional (status-check requis après la release) | CHANTIERS:686 | §11 |
| **Q-7 (a)** | `/ukemi` au temps 1 (méthode + état honnête), régions vivantes à -2b | CHANTIERS:687 | §7, §10.B |
| **Q-8 (b)** | vocabulaire de statut UNIQUE : « built · … » (pas « shipped »), le mot suit le registre gelé | CHANTIERS:688 | §4 |
| **C-3** | pilule = « built · **step** N of 7 before first reading » (N=`tracker.t`) ; T≥7 « built · N windows published » (N=lignes timeline) ; tests t=6/t=7 + mutants | CHANTIERS:697, 05:05 | §4, §3.3 |
| **C-4** | **voie (i)** (étendre `assert-fleet-html.mjs`, ligne `run:` inchangée) ; §9/§11/§13 réalignés ; C-1/C-2/C-5/C-6/C-9 tranchées | CHANTIERS:698, 05:05 | §3.4, §9, §11, §16 |

## 13. Consigne standard G1 — points pré-cadrés (rappel)
**A-1** modèle résolu 1ʳᵉ ligne ; **A-3** codes de retour capturés ; oracle complet (`gate:vocab`, `typecheck`, `test`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`) + `npm run build -w @monark/site` + `node scripts/assert-fleet-html.mjs`. **A-4** rendu sous `F:\tmp\<lot>\`, `DELIVERED.sha256`, aucun commit, rien sur `C:`, aucun réseau. **A-5** R-25 pathspec verbatim `ci.yml:65`, STOP si > 1 150 **par sous-lot** (§9). **A-7** oracle avec clés payantes retirées (`env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL …`), jamais afficher une variable. **A-9** grep interdits sur la/les phrase(s) EFFECTIVEMENT servie(s) (chaque constante + `honestyText`). **D-1** chaque test imposé a son mutant nommé rouge (§3.3). **D-3** un test d'intégration non-LLM par tuyau (§10) autorise « branché ». **F-1** ADR : ligne « Tuyaux » PAR pièce (§10.A/§10.B), résidus nommés avec déclencheur. **F-2** ASCII dans les sources ; `lang:gate` scope site (§6.7).

## 14. MAST — risque résiduel (checklist de revue de sprint)
- **FM-1.1 (sur-revendication)** : rendre des nombres SAMPLE non committés. *Mitig.* : `assertUkemiBody()` scan body=0 + §7 (état `under_calib`, pas de régions vivantes) + Q-5a.
- **FM-1.3 (dérive de forme)** : la page paraphrase et dérive de `gate.ts`. *Mitig.* : `site_ukemi_copy_equals_served_liq_text` (byte-identique, jeu fermé de 4).
- **FM-3.2 (vérification incomplète)** : `g3-site` asserte le build mais pas le body ⇒ page creuse verte. *Mitig.* : `assertUkemiBody()` sur le **body rendu** (`renderedBody()`, fail-closed script non clos) + scan + notes/clause assertées.
- **FM-3.3 (vérification incorrecte)** : grep « interval » sur la constante NOMINALE alors qu'une AUTRE est servie (récidive U-4b-2a C-2) ; **ou** test 44 pris pour garant d'une page qu'il ne couvre pas (M-V1). *Mitig.* : **A-9** sur chaque constante + `honestyText` ; **scan body** (pas test 44) pour l'honnêteté ; **parité scanner** `.mjs`↔`scanText`.
- **FM-3.1 (terminaison prématurée)** : pilule Narabi assertée sur le HTML rendu (client component ⇒ N absent) = faux vert. *Mitig.* : preuve par fonction pure (§4), pas par le HTML ; résiduel C-7 nommé.
- **FM-2.2 (ne pas demander clarification)** : trancher seul un nœud. *Mitig.* : toutes les questions sont tranchées par rulings (§12) ; le worker ne tranche rien.

## 15. Zéro dette à la clôture (P5)
Aucun « dû » nu. (i) **Aucune question ouverte** (§12 : les 8 Q + C-3/C-4 tranchées avant ce pli). (ii) **Items formés avec déclencheur** : figures design-set depuis record committé (déclencheur U-4b-2b) ; re-câblage registre + retrait cascade + surfaces D-127 (déclencheurs U-4b-2b / U-5b) ; résiduel client-component de la pilule (déclencheur : parcours visuel investisseur, plancher = test non-LLM). (iii) **Fait de provenance daté (non-dette)** : endpoints Blast/Llama du snapshot 2026-09-19 antérieurs à D-106 (§1). Aucun procurement de papier requis (lot d'ingénierie interne, sources = fichiers du dépôt [lu]).

## 16. Pli du checkpoint-1 — table C-n → section/ligne
| C-n | Sous-lot | Objet (checkpoint) | Plié dans le PLIE |
|---|---|---|---|
| **C-1** | B | `assertUkemiBody()` : scan de jetons numériques du TEXTE rendu (nœuds texte + `alt`/`title`/`aria-label`, exclusions ISO + identifiants, **pas l'exemption 01-04**), `LIQ_EMPTY_REGISTRY_SENTENCE` présente byte-identique, mutants | §3.3 (l. test), §3.4, §7, §10.B, §18/B ; contrat scan = §18/B |
| **C-2** | B | jeu FERMÉ de 4 constantes portées ; omission de `LIQ_REQUIREMENTS_SENTENCE` (chiffres) déclarée dans l'ADR | §3.1 (`ukemi-copy.ts`), §6.3, §18/B (ligne ADR) |
| **C-3** | A | pilule « built · step N of 7 before first reading » (N=`tracker.t`) ; T≥7 « built · N windows published » ; tests t=6/t=7 + mutants ; N=`t` ≠ « day N » | §4, §3.3, §12, §17/A |
| **C-4** | plan/B | voie (i) ; §9/§11/§13 réalignés (pas de `assert-site-pages.mjs`, pas d'étape `ci.yml`, pas de modif `site-build-fleet.test.ts`) ; jumeau `.d.mts` mis à jour | §3.2, §3.4, §9, §11, §18/B |
| **C-5** | A | `SERIES_MIN_STEPS` source unique ; **pas** de `WINDOW_BEFORE_FIRST_READING` | §3.2, §4, §17/A |
| **C-6** | B | `/ukemi` lit **UNIQUEMENT** `status` de `FLEET_AGENTS` (jamais `line`/`wiring.note` = « cascade ») | §5, §10.B, §18/B (ligne ADR) |
| **C-7** | A | résiduel client-component NOMMÉ (plancher = fonction pure + porteur + parcours visuel) | §4, §10.A, §17/A (ligne ADR) |
| **C-8** | A+B | ligne « Tuyaux » PAR sous-lot dans chaque ADR (F-1) | §10.A, §10.B, §17/A, §18/B |
| **C-9** | couture/B | `app/ukemi/icon.svg` en **B** ; oracle `<link rel="icon">` **local** par sous-lot | §3.1, §6.5, §9, §17/A + §18/B, §19 |
| **C-10** | plan | §7 corrigé : exemption 01-04 **non** bornée par `context` ; contrainte retenue (digit-free rendu, sans exemption) plus stricte | §7 |
| **C-11** | **A+B** | **A** : glossaire `under_calib` **générique** (`narabi-copy.ts`) ; **B** : `ukemi-copy.ts` **données pures** (régime `fleet.ts:21`) + `metadata` title/description digit-free | §6.4 (A) + §3.1 (B), §17/A + §18/B |

### 16.1 Écarts à la maquette v4 validée — INFORMATION due à l'investisseur (pas escalade ; checkpoint §5)
1. **« shipped » → « built »** (Q-8b) : le mot de statut de la pilule suit le registre gelé (`FleetStatus`, `fleet.ts:24` « No "live" exists »), pas la maquette.
2. **« day N » → « step N of 7 »** (C-3) : « day » est faux sur le snapshot committé (2 fenêtres publiées, `tracker.t`=1 — M-15).
3. **Ordinaux « 01·book »…« 04·region » et strates « S1 »…« S4 » rendus DIGIT-FREE** : `assertUkemiBody()` exige 0 jeton numérique rendu et n'honore pas l'exemption 01-04 (C-1/C-10) ; les ordinaux numériques de la maquette ne sont pas portés tels quels.

## 17. MISSION G1 — SOUS-LOT A (Narabi + favicon narabi) — SÉPARABLE, fichiers disjoints
**Cadrage** : release Narabi. **Modèle** : `claude-opus-4-8`, effort max. **Rendu** sous `F:\tmp\site-release-1-A\` + `DELIVERED.sha256` (A-4). **Aucun commit** (R-20).
**Fichiers (5, cf. §19)** : `apps/site/lib/narabi-live.ts`, `apps/site/components/narabi/narabi-live.tsx`, `apps/site/lib/narabi-copy.ts`, `apps/site/app/narabi/icon.svg` (nouveau), `test/narabi-live.test.ts` (extension).
**À implémenter** :
- `firstReadingLabel(state, lines)` PURE dans `narabi-live.ts` : `t < SERIES_MIN_STEPS` ⇒ « built · step ${t} of ${SERIES_MIN_STEPS} before first reading » ; sinon « built · ${lines.length} windows published ». **Réutilise `SERIES_MIN_STEPS` (l.36), aucune constante nouvelle** (C-5).
- Rendu pilule `{firstReadingLabel(state, lines)}` dans l'en-tête héros de `narabi-live.tsx` (tokens storefront, repli débordement `min-width:0`).
- Entrée `GLOSSARY` `under_calib` **générique** (anglais, digit-free) dans `narabi-copy.ts` (C-11).
- `app/narabi/icon.svg` : favicon adaptatif repris de `assets/favicon-narabi.svg`, 0 URL.
**Tests + mutants (D-1)** : `narabi_first_reading_label_reads_committed_t` (t=1 sur `NARABI_SNAPSHOT` réel, t=6/t=7 synthétiques ; mutants : littéral `1` / bascule ≠ `SERIES_MIN_STEPS` ⇒ ROUGE) ; carrier `comp.includes("{firstReadingLabel(")` ; `scanText` sur la def `under_calib` (digit-free).
**Oracle G1 (non-LLM)** : oracle complet (A-3) + `npm run build -w @monark/site` (vert) + grep LOCAL `<link rel="icon">` du `<head>` bâti de `/narabi` + passes GLOBAL/site/sentinel = 0 sur les surfaces livrées.
**Lignes d'ADR à écrire** : (a) **Tuyaux A** (§10.A, F-1) ; (b) **sémantique de N** (« step »=pas évaluable, N=`tracker.t`, « 7 »=`SERIES_MIN_STEPS`, C-3/C-5) ; (c) **résiduel client-component NOMMÉ** avec plancher et déclencheur (C-7).
**R-25** : mesuré au G1 (pathspec `ci.yml:65`), estimation ~80–100 ≪ 1 150 (§9). STOP si > 1 150.

## 18. MISSION G1 — SOUS-LOT B (page `/ukemi` + favicon ukemi + assertion body) — SÉPARABLE, fichiers disjoints
**Cadrage** : page `/ukemi` servie. **Modèle** : `claude-opus-4-8`, effort max. **Rendu** sous `F:\tmp\site-release-1-B\` + `DELIVERED.sha256` (A-4). **Aucun commit** (R-20).
**Fichiers (7, cf. §19)** : `apps/site/app/ukemi/page.tsx` (nouveau), `apps/site/components/ukemi/ukemi-page.tsx` (nouveau), `apps/site/lib/ukemi-copy.ts` (nouveau), `apps/site/app/ukemi/icon.svg` (nouveau, C-9), `scripts/assert-fleet-html.mjs` (extension), `scripts/assert-fleet-html.d.mts` (jumeau), `test/site-ukemi.test.ts` (nouveau).
**À implémenter** :
- `app/ukemi/page.tsx` : server component **STATIQUE** (aucun `fetch`, aucun `"use client"`) ⇒ `ukemi.html` bâti ; `metadata` title/description **sans chiffre** (C-11).
- `components/ukemi/ukemi-page.tsx` : **contenu dans un `<main>`** (convention du dépôt, `app/narabi/page.tsx:33`) ; hero, is/is-not, « what is served » = `LIQ_EMPTY_REGISTRY_SENTENCE` rendue en **UN seul `{X}`** JSX child (C-1(b)) ; clause conditionnelle (« which the gate does not check ») rendue ; méthode + limites **digit-free** (aucun ordinal numérique rendu) ; **barre borne-haute schématique** (`aria-hidden`, largeurs en `style`/`className`, sans graduation). Lit `fleet.ts` **`status` seul** (C-6) ; **ne réutilise NI `ukemi-panel.tsx` NI `fleet-presentation.ts`** (cascade/interval, M4).
- `lib/ukemi-copy.ts` : **données pures, aucun import React/Next** (C-11) ; **4** constantes byte-identiques à `gate.ts` (`LIQ_UPPER_BOUND_SENTENCE`, `LIQ_H3_SENTENCE`, `LIQ_CONDITIONAL_SENTENCE`, `LIQ_EMPTY_REGISTRY_SENTENCE`) ; prose digit-free ; `UKEMI_ROUTE`.
- `app/ukemi/icon.svg` : favicon adaptatif repris de `assets/favicon-ukemi.svg`, 0 URL.
- **Extension `assert-fleet-html.mjs`** : `assertUkemiBody({ html, expected })` (pure, built-ins only, throws) + `UKEMI_HTML_REL = "apps/site/.next/server/app/ukemi.html"` ; `main()` lit AUSSI `ukemi.html` et importe les phrases attendues depuis **`ukemi-copy.ts`** (jamais `gate.ts` — dépendances harness). **Contrat de `assertUkemiBody()`** : (1) `body = renderedBody(html)` — **fonction PARTAGÉE, INCHANGÉE** (la disjointness impose de NE PAS toucher `renderedBody`/`assertFleetBody`, donc **aucune** modif de `site-build-fleet.test.ts` ∉ B) ; (2) **extraire le sous-arbre `<main>…</main>`** (fail-closed si absent/vide — garde de vacuité) : cela ISOLE le contenu de la page du `<head>`/`<title>`, de `SiteHeader`/`SiteFooter` et du **CSS `next/font`** que `renderedBody` NE retire PAS (font-weight numériques + hachages), tous **∉ B** (M-24) ⇒ l'assertion de B ne dépend QUE du `<main>` de `/ukemi` (fichiers de B) ; (3) **scan numérique DANS `<main>`** : nœuds texte après retrait de **TOUTES** les balises **+** valeurs `alt`/`title`/`aria-label` capturées avant retrait ; exclusions = `ISO_DATE` **+** `ADR-M\d+|R-\d+|CA-\d+|D\d+|HIP-\d+`, **rien d'autre (PAS l'exemption 01-04)** ; **0 attendu** ; regex `NUMERIC_TOKEN`/`ALLOWED_ID`/`ISO_DATE` recopiées inline ; (4) **DANS `<main>`** : `LIQ_EMPTY_REGISTRY_SENTENCE` présente byte-identique, clause « which the gate does not check » présente, `interval`=0, `\bcascade\b`=0, `\bBell\b`=0, `\bAave\b`=0. Vacuité gardée (comme `assertFleetBody` : `<main>` vide ⇒ throw).
- **Jumeau `.d.mts`** : déclarer `assertUkemiBody`, `UKEMI_HTML_REL` (+ tout nouvel export) pour le `tsc` nodenext racine (C-4).
**Tests + mutants (D-1)** : `site_ukemi_copy_equals_served_liq_text` (4 constantes byte-identiques, import de `ukemi-copy.ts` ET `gate.ts` ; mutant : 1 caractère ⇒ ROUGE) ; `site_ukemi_served_text_never_interval` (A-9 : injection dans chaque constante + `honestyText` ⇒ ROUGE) ; `site_ukemi_body_scan_and_carrier` (fixtures synthétiques : jeton numérique / phrase absente / interdit / clause absente ⇒ throw ; **parité** scanner `.mjs`↔`scanText` sur fixtures — idiome `narabi-live.ts:31-32`).
**Oracle G1 (non-LLM)** : oracle complet (A-3) + `npm run build -w @monark/site` (rend `ukemi.html`) + `node scripts/assert-fleet-html.mjs` (assertions `/fleet` ET `/ukemi` vertes) + grep LOCAL `<link rel="icon">` du `<head>` bâti de `/ukemi` + passes GLOBAL/site/sentinel = 0.
**Lignes d'ADR à écrire** : (a) **Tuyaux B** (§10.B, F-1) ; (b) **jeu FERMÉ de 4 constantes** + omission `LIQ_REQUIREMENTS_SENTENCE` motivée (chiffres, Q-5a) (C-2) ; (c) **« lit uniquement `status` »** (C-6) ; (d) **item formé** design-set figures, déclencheur U-4b-2b (Q-5a).
**R-25** : mesuré au G1 (pathspec `ci.yml:65`, SVG comptés), estimation ~607–917 < 1 150 (§9). STOP si > 1 150 ⇒ couture B1/B2 (§9).

## 19. Disjointness A ∩ B = ∅ (worktrees parallèles, ruling CHANTIERS:699)
| Sous-lot A (5 fichiers) | Sous-lot B (7 fichiers) |
|---|---|
| `apps/site/lib/narabi-live.ts` | `apps/site/app/ukemi/page.tsx` |
| `apps/site/components/narabi/narabi-live.tsx` | `apps/site/components/ukemi/ukemi-page.tsx` |
| `apps/site/lib/narabi-copy.ts` | `apps/site/lib/ukemi-copy.ts` |
| `apps/site/app/narabi/icon.svg` | `apps/site/app/ukemi/icon.svg` |
| `test/narabi-live.test.ts` | `scripts/assert-fleet-html.mjs` |
| | `scripts/assert-fleet-html.d.mts` |
| | `test/site-ukemi.test.ts` |

**Intersection = ∅** (aucun fichier partagé). **Ni A ni B ne touche** : `.github/workflows/ci.yml` (voie i), `test/site-build-fleet.test.ts` (ligne `run:` inchangée), `apps/site/lib/fleet.ts` (gelé, lecture seule), `apps/site/test/honesty-lint.exempt.json` (aucune exemption ajoutée — `/ukemi` digit-free), `scripts/export-exclude-tests.json` (répertoire racine `test/` = DORMANT, exclu en bloc — M-16), `apps/harness/src/tools/gate.ts` (source de vérité, lue par le TEST racine seulement), `apps/site/lib/narabi-snapshot.ts` (lecture seule). ⇒ les deux worktrees fusionnent sans conflit ; l'oracle `<link rel="icon">` est **local à chaque sous-lot** (C-9), jamais dans le script partagé.

---

# Appendice MESURES (M-13..M-23 = une mesure par correction C-1..C-11 ; base `826e2c7`, lecture seule, aucun réseau)
`cwd` = `F:/Monark` sauf indication. M1..M12 reportées du DRAFT (`docs/G0-lot-site-release-1.MESURES.md`) — valides car code byte-identique (M-13.0).

## M-13.0 — code byte-identique entre la base DRAFT `58e4d13` et HEAD `826e2c7`
```
$ git diff --stat 58e4d1327d85dd70113c2b095cc32ef12a17cdc0 HEAD -- apps/ test/ scripts/ .github/
(vide)
$ git diff --stat 58e4d13 HEAD | tail -1
 7 files changed, 784 insertions(+)   # tous docs/*.md
```
⇒ M1..M12 (prises à `58e4d13`) reportées telles quelles.

## M-13 — (C-1) test 44 NE couvre PAS les constantes `.ts` rendues ; `assert-fleet-html.mjs` n'a pas de scan de chiffres
```
$ sed -n '13,14p' apps/site/test/honesty-lint.ts
# EVERYTHING ELSE is ignored: className, style, key, SVG attrs (viewBox…),
# … object-literal properties, variable initialisers.
$ sed -n '59p' apps/site/lib/narabi-copy.ts        # nCalib: "613"  (rendu {GATE.nCalib}, test 44 vert)
$ grep -cE "NUMERIC_TOKEN|scanText|numeric" scripts/assert-fleet-html.mjs
0                                                   # aucun scan de chiffres aujourd'hui (M-V7)
```
⇒ seul un scan du BODY rendu garantit l'honnêteté ⇒ `assertUkemiBody()` (§18/B). Confirme M-V1, M-V7.

## M-14 — (C-2) `LIQ_REQUIREMENTS_SENTENCE` porte des chiffres, servie, absente des 4 constantes
```
$ sed -n '145p' apps/harness/src/tools/gate.ts
export const LIQ_REQUIREMENTS_SENTENCE = "this class requires alpha = 0.01, nMin = 100";
$ grep -n "LIQ_REQUIREMENTS_SENTENCE" apps/harness/src/tools/gate.ts
145: … (définition)   191: … (interpolée dans GATE_TOOL_DESCRIPTION)
```
⇒ jeu FERMÉ de 4 (`LIQ_UPPER_BOUND_SENTENCE`/`LIQ_H3_SENTENCE`/`LIQ_CONDITIONAL_SENTENCE`/`LIQ_EMPTY_REGISTRY_SENTENCE`), omission de la 5ᵉ (chiffres) déclarée. Confirme M-V4.

## M-15 — (C-3) « day N » faux : `tracker.t=1` mais 2 fenêtres publiées ; `SERIES_MIN_STEPS=7`
```
$ node F:/tmp/site-release/measure-fold.mjs
capturedAt            = 2026-09-19
tracker.t (N, T<7)    = 1
timeline lines (N,T>=7) = 2
  window 1: day=2026-09-17 pair_status=non_evaluable T=0 s=null
  window 2: day=2026-09-18 pair_status=evaluable T=1 s=set
=> T<7  label: built · step 1 of 7 before first reading
=> T>=7 label: built · 2 windows published (N = published timeline windows)
$ sed -n '36p' apps/site/lib/narabi-live.ts
export const SERIES_MIN_STEPS = 7; // seven daily steps = one week …
```
⇒ « step N of 7 » (N=`tracker.t`, pas évaluable), bascule « N windows published » à T≥7. Confirme M-V2, M-V3.

## M-16 — (C-4) voie (i) : ligne `run:` épinglée inchangée ; aucun `assert-site-pages.mjs`
```
$ sed -n '167p' test/site-build-fleet.test.ts   # assert `run: node scripts/assert-fleet-html.mjs` (O-2)
$ sed -n '179p' test/site-build-fleet.test.ts   # sanity: derived g3-site cites scripts/assert-fleet-html.mjs
$ grep -rc "assert-site-pages" test/ scripts/ .github/ | grep -v ":0" | wc -l
0                                                # n'existe pas ⇒ voie (ii) abandonnée
```
⇒ étendre `assert-fleet-html.mjs` in-situ : ligne `run:` inchangée, chemin déjà exporté, 0 whitelist. Confirme M-V7, M-V10 (incohérence corrigée).

## M-17 — (C-5) `SERIES_MIN_STEPS` source unique ; `WINDOW_BEFORE_FIRST_READING` absente
```
$ grep -rn "SERIES_MIN_STEPS" apps/site/lib/narabi-live.ts   # 36: export const … = 7
$ grep -rc "WINDOW_BEFORE_FIRST_READING" apps/site/ | grep -v ":0" | wc -l
0
```
⇒ le libellé dérive de `SERIES_MIN_STEPS`, aucune constante doublon. Confirme M-V3.

## M-18 — (C-6) entrée Ukemi de `fleet.ts` : `line` + `wiring` portent « cascade »
```
$ sed -n '153,167p' apps/site/lib/fleet.ts
  name: "Ukemi",  role: "act",  line: "Liquidation-cascade survival.",  status: "built",
  wiring: { served_by: "MCP cascade → gate …",  integration_test: ["probe_harness_records_real_decision"],
            note: "feeds the served gate through the cascade seam …" }
$ sed -n '153,167p' apps/site/lib/fleet.ts | grep -ic cascade
6                                                # 6 lignes portent « cascade » (line + 5 lignes wiring/commentaires)
```
⇒ `/ukemi` lit `status` SEUL ; rendre `line`/`wiring` rougirait `\bcascade\b`=0 (`assertUkemiBody`). Confirme M-V9.

## M-19 — (C-7) `/narabi` = client component ⇒ N absent du HTML de build ; porteur = idiome existant
```
$ sed -n '1p' apps/site/components/narabi/narabi-live.tsx
"use client";
$ grep -n 'comp.includes("{' test/narabi-live.test.ts | head -1
124:    assert.ok(comp.includes("{" + id + "}"), …)     # patron porteur réutilisable
```
⇒ plancher : fonction pure + porteur asserté + parcours visuel (résiduel nommé). Confirme le piège FM-3.1.

## M-20 — (C-8) F-1 exige une ligne « Tuyaux » PAR pièce livrée
```
$ grep -n "F-1" docs/CONSIGNE-STANDARD-G1.md
39:- F-1 ADR : chaque pièce livrée a sa ligne « Tuyaux » (entrée / sortie / état / test) ; … résidus nommés avec déclencheur.
```
⇒ §10.A et §10.B (une par sous-lot), reprises en §17/§18.

## M-21 — (C-9) aucune route `/ukemi` (naît en B) ; SVG comptés au R-25
```
$ find apps/site/app -iname "*ukemi*" -not -path "*/.next/*"
(vide)                                            # aucune route /ukemi
$ sed -n '65p' .github/workflows/ci.yml           # pathspec R-25 : .md exclus, *.svg NON exclus (comptés)
```
⇒ `app/ukemi/icon.svg` en **B** ; les 2 SVG (14/12 l., M2) comptent au R-25 de leur sous-lot.

## M-22 — (C-10) exemption 01-04 : `context` documentaire ; `exemptValues` ignore `context` ; garde d'inertie = porteur
```
$ sed -n '4,7p' apps/site/test/honesty-lint.exempt.json   # entries 01..04 avec champ "context" (documentaire)
$ sed -n '349,351p' apps/site/test/honesty-lint.ts
export function exemptValues(ex) { return new Set(ex.entries.map((e) => e.value)); }  # context ignoré
$ grep -n "honesty_exempt_entries_have_rendered_carrier" test/ci-gates.test.ts
1146: test(… — no inert exemption, no gutting bare digit …)   # vérifie un PORTEUR, pas l'emplacement
```
⇒ l'exemption n'est PAS bornée par `context` ; la contrainte retenue (digit-free rendu, sans exemption) est plus stricte. Confirme M-V6.

## M-23 — (C-11) régime « données pures » importable par le test racine ; `under_calib` générique
```
$ sed -n '20,21p' apps/site/lib/fleet.ts
// SOURCING … Pure data — NO React/Next import — so the root test can import it under node:test.
$ sed -n '72,80p' apps/site/lib/narabi-copy.ts   # GLOSSARY = 8 entrées, pas d'under_calib
$ grep -c "under_calib" apps/site/lib/narabi-copy.ts
1                                                  # présent en contenu (GATE.body:61), pas au glossaire
```
⇒ `ukemi-copy.ts` suit le régime `fleet.ts:21` (importable racine) ; glossaire `under_calib` **générique** (pas « in the stratum »). Confirme M-V6 (glossaire) et le régime PORTABILITY.

## M-24 — (C-1, raffinement de portée) le scan body doit se limiter au `<main>` : `ukemi.html` ≠ `/ukemi` (layout + `next/font` ∉ B)
```
$ head -3 apps/site/app/layout.tsx            # import { Sora, IBM_Plex_Mono, Newsreader } from "next/font/google";
$ grep -nE "weight:" apps/site/app/layout.tsx  # weight: ["300","400","500","600","700"] … next/font injecte du CSS
$ grep -cE ">[^<]*[0-9]" apps/site/components/site-header.tsx   # 0 : chrome header digit-free en position rendue
$ grep -nE "cascade|interval" apps/site/components/site-{header,footer}.tsx | grep -v "^.*://\|L4" | wc -l   # 0
$ grep -nE "<main" apps/site/app/narabi/page.tsx   # 33: <main className="mx-auto max-w-[1200px] px-6 py-16">
```
Constat : `ukemi.html` (artefact `next build`) contient le **layout partagé** (`SiteHeader`/`SiteFooter`), le `<head>`/`<title>`, et le **CSS `next/font`** (`@font-face`, `font-weight: 400`, hachages) que `renderedBody()` (l.51-67) **ne retire PAS** (script/noscript/template/comments seulement). Un scan « body entier » rougirait sur le `font-weight: 400` ou sur un futur `{FOOTER_YEAR}` du layout — et `layout.tsx`/`site-*.tsx` sont **∉ B** (aucune réparation dans le périmètre de B ⇒ la disjointness casserait). Mesuré : la chrome (`SiteHeader`/`SiteFooter`) a un **texte rendu digit-free et cascade/interval-free** (seuls chiffres = commentaires source non rendus). ⇒ **portée du scan numérique = le sous-arbre `<main>` de la page** (convention `narabi/page.tsx:33`, toutes les pages du dépôt rendent `<main>`), extrait de `renderedBody()` **inchangée** ⇒ l'assertion de B ne dépend que de ses propres fichiers (§18/B). Confirme le piège M-V1 côté layout.

## Provenance des scripts de mesure (F-3)
- `F:\tmp\site-release\measure-fold.mjs` (M-15) — dans le périmètre d'écriture, rejouable : `node F:/tmp/site-release/measure-fold.mjs`. Aucun autre fichier hors `F:\tmp\site-release\` (et scratchpad) écrit ; `F:\Monark` en lecture seule (R-20). Aucune déviation de chemin (contrairement à la D-1 du DRAFT).
