# CHECKPOINT-2 bis — lot U-4a (Ukemi : book Aave v3 @B₀, chemin d'oracle réalisé D_e, calibration réelle e2) — VALIDATEUR-HUMAIN

- **Modèle résolu (R-1)** : verdict rendu par le **validateur-humain `claude-fable-5-1`** (Fable 5.1), effort high, 2026-09-21T02:09Z → 02:21Z. **Provenance de ce fichier** : transcrit au format dépôt (`docs/CHECKPOINT2-*.md`) par le **rédacteur `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme R-1, effort max), 2026-09-21, sur instruction de l'orchestrateur ; vérifications condensées, corrections intégrales. Le rédacteur ne committe pas (R-20) et ne touche QUE `docs/**/*.md`.
- **Checkpoint** : LIVRABLE (après G2-delta PASS-AVEC-CORRECTIONS + contrôle live D-12, avant G7). Contexte frais du validateur : artefacts seuls, jamais le fil de travail.
- **État vérifié** : worktree `F:\Monark-wt-u4a`, branche `lot/u-4a`, **HEAD `88d28a5`** (retrait du chemin local restant de `PROVENANCE-u4.md`, C-G2D-1 a). Chaîne : α `041a902` → β `3887190` → α-fix `c137af1` → β-fix `16640ee` → G2-delta `0a348d4` → pli G2-delta `b8ad104` → `88d28a5`.
- **Décision** : **ACCEPTE-AVEC-CORRECTIONS (docs seules, avant G7)** — liste fermée C-VB-1..C-VB-6 (+ deux items non numérotés). Toutes les corrections sont **documentaires** (`docs/**/*.md`) : aucun code/test/fixture ne change, `PROVENANCE-u4.md` (sous `apps/`) n'est PAS touché par ce pli. Fixtures/séries/`book_digest`/`calib_digest`/prereg **inchangés**. Si l'orchestrateur applique ces corrections **à l'identique**, aucun checkpoint-2 ter n'est demandé ; un écart de contenu ramène le dossier.

## 1. Vérifications reproduites de première main (condensé)

Le validateur a **re-exécuté** la mesure (rejeu offline depuis les bruts hors dépôt + le driver committé, plus le brut live D-12, zéro nouvelle course, `Bash` en vérification seule AM-2 du validateur) ; tout concorde avec le PLI / ADR / rapport G2-delta.

| # | Mesure re-exécutée par le validateur | Résultat |
|---|---|---|
| VB-1 | `npm run test` COMPLET (arbre final `88d28a5`) | **442 / 442** ; `export_public_no_governance_no_french` **VERT** |
| VB-2 | Mécanisme d'exclusion de l'export | = **mécanisme du dépôt** (`scripts/export-exclude-tests.json`, jamais `STRUCTURAL_BLACKLIST`) ; **3 entrées au manifeste d'export** |
| VB-3 | `PROVENANCE-u4.md` sans chemin local | grep = **0** (dépôt **ET** export) |
| VB-4 | 3 fixtures régénérées par le **driver committé** | **régénérées == committées == pins** : `743e9499…` (book), `97035715…` (oracle-path), `8b84e095…` (scores) |
| VB-5 | Calibration | **n = 797, p = 791, q̂ = 364550606513851**, `calib_digest 267cd9918abde0ee6de23f71c1dc0852d545e00824107c3dfb51f84bb943ea4b` |
| VB-6 | Brut `U4-redraw.json` (contrôle live D-12) relu | sha `c01f75ce68dba297811b5269082aeeaa9e423e4aebf227660582020f038119b3`, **1 392 o**, `all_match: true` ; **13 appels** (drpc 5, blastapi 3, tenderly 3, archive-env 2) ; indices comptes **3443 / 12793 / 15952**, updates **131 / 68 / 114** ; cache `09968df1…` **inchangé** |
| VB-7 | Mutants | **9 rouges** (dont `USDT_DECIMALS 6→8` et suffixe de graine) |
| VB-8 | R-25 | **α 948 / β 810 / direct 1 756** ; **UNE fusion `--no-ff` satisfait R-25** (chaque unité revue ≤ 1 205 ; le job CI lirait 1 756 sur une PR unique ⇒ R-25 est tenu ICI par **deux mesures indépendantes**, pas par la CI) |

## 2. Réserve, constat, décision investisseur, recommandation

- **RÉSERVE CA-8 (provenance)** : le champ `model` des bruts est un **LITTÉRAL SOURCE** — `scripts/census/u4-redraw.mjs:111`, `apps/sentinel/src/ukemi/record.ts:319,353,382`, `scripts/census/u4-probe.mjs:121,128`, `scripts/census/u4-oracle-path.mjs:125,140` (tous `model: "claude-opus-4-8[1m]"` codés en dur) ⇒ **non probant** de quel modèle a réellement tourné. L'identité de l'**instance G2 séparée** est **DÉCLARÉE par son rapport** (`docs/G2-DELTA-lot-u4a.md`) et **bornée par les horodatages** : `16640ee` 01:24:08Z ; G2-delta lancé 01:25:01Z ; brut `U4-redraw.json` écrit 01:56:48Z ; `0a348d4` (rapport G2-delta) 02:07:58Z. La preuve d'indépendance est temporelle + déclarative, jamais `meta.model`.
- **Constat (gate aveugle)** : `export:check` rend « 0 forbidden path » alors que l'export **contient** `apps/sentinel/test/fixtures/ukemi/u3/PROVENANCE-u3.md:42` avec un **chemin de lecteur local** (`F:\PRODUITS\etude-2026-09-20\u3-raws-clean\u3-reads.jsonl`) — le gate est **AVEUGLE à cette classe** (chemins de lecteur Windows `[A-Z]:\`). Porté en item d'outil, ADR-M004 D7 sexies (C-VB-4).
- **Décision investisseur 91 (2026-09-21, `F:\Monark\docs\CHANTIERS.md:273`)** : l'escalade du checkpoint-2 est **RÉPONDUE**, verbatim « refais la mesure avec chainstack ukemi » — re-périmétrage de U-4b sur épisode **FRAIS** (~280 k appels, Chainstack, ŷ à close factor, classe mono-collatéral WETH, deux classes Mondrian, e2 = jeu de conception seulement) ; **supersède P-6 du G0 U-4** ; déclencheur : G7 de U-4a.
- **Recommandation (ne bloque pas le G7)** : **absorber A-5..A-7 dans le G0 de U-4b** et **annuler U-4a-ii comme sous-lot distinct** — confirmation investisseur en **une ligne au G0 de U-4b**. Recommandation, non verdict : jusqu'à cette confirmation, U-4a-ii reste **renvoyé** (jamais « annulé » par un générateur).

## 3. Checklist (docs seules ; un seul CA rendu, les autres non re-rendus dans cet avis)

| Règle | Verdict | Preuve / renvoi |
|---|---|---|
| **CA-8** provenance | **RÉSERVE** (voir §2) | `meta.model` = littéral source, non probant ; identité G2 = déclarée + bornée par horodatages ; 3 lignes de l'ADR-U4 + bloc JOURNAL périmés (C-VB-1/C-VB-2) ; message `0a348d4` inexact |
| CA-1..CA-7, CA-9..CA-11 | **non re-rendus** | tranchés au checkpoint-2 (C-V-1..7 pliés) et au G2-delta (D-12 FAIT, R-25) ; ce bis ne rouvre que la couche **documentaire** (pas de code touché) |

## 4. Corrections — liste fermée (INTÉGRALE), toutes documentaires (`docs/**/*.md`)

### C-VB-1 — `docs/adr/ADR-U4-book-et-calibration.md`
(a) **statut** ⇒ « **G2-delta FAITE, checkpoint-2 bis FAIT** » (la chaîne « à venir » est périmée). (b) **ligne MAST** « contrôle indépendant LIVE : À EXÉCUTER » ⇒ **FAIT** : 13 appels, `all_match`, brut `c01f75ce…`, 2026-09-21T01:56:48Z, cache `09968df1…` inchangé. (c) **ESCALADE-INVESTISSEUR** ⇒ **RÉPONDUE** par la décision investisseur 91 du 2026-09-21, verbatim « refais la mesure avec chainstack ukemi » ; **supersède P-6 du G0 U-4**. (d) le **consommateur annoncé `UKEMI_REALIZED_E2` de `calibration.ts`** est **REQUALIFIÉ** — e2 devient un **JEU DE CONCEPTION, jamais servi** ; le sort de **U-4a-ii (A-5..A-7)** est **renvoyé au G0 de U-4b** (recommandation du validateur : absorber ; confirmation investisseur due au G0 de U-4b). Non bloquant : ligne « Gate » ⇒ ajouter **G2-delta** et **checkpoint-2 bis** à la chaîne.

### C-VB-2 — bloc JOURNAL du PLI (`docs/PLI-lot-u4a.md`)
**G2-delta** ⇒ **FAITE**, rôle **relecteur** (pas « worker »), modèle `claude-opus-4-8[1m]` ; **contrôle live D-12** ⇒ **FAIT**. Ajouter « **pli G2-delta (`b8ad104`, `88d28a5`) : orchestrateur `claude-fable-5-1`, vérifié mécaniquement au checkpoint-2 bis (grep = 0, suite 442/442)** » ; ajouter « **checkpoint-2 bis : validateur `claude-fable-5-1`, FAIT** » ; « **ce pli docs : worker `claude-opus-4-8[1m]`** » ; laisser « **G7 À VENIR** ». **Remplacer** « vérifiable : meta.model des bruts » par « **modèle DÉCLARÉ par chaque agent ; `meta.model` est un littéral source, non probant** ». `error_origin` : **C-V-5, C-V-6, C-V-7 = worker (docs)**, assignés par le validateur ; **C-G2D-1 = worker + orchestrateur**. Observation à consigner : le message du commit `0a348d4` annonce le retrait du chemin alors que ce commit **ne contient que le rapport G2-delta** — le retrait est dans `b8ad104` et `88d28a5` (même classe que C-G2D-2 ; l'historique reste tel quel). Note AM-1 du checkpoint-2 : « vérifié » écrit sur `meta.model` = **manqué du validateur**.

### C-VB-3 — table de sha du PLI
Écrire la valeur **LITTÉRALE** du sha LF de `PROVENANCE-u4.md` = **`a1475cba1183a6667ee120db47a1c71dbaeb28bb762f069327134c6770c5921a`** (recalculée par le rédacteur : `sha256sum` du fichier du worktree `88d28a5` = cette valeur, LF confirmé, 0 octet CR) à la place du renvoi « voir `git log` » de la section PLI G2-delta, **et** dans la table C-V-7 (l'ancien `ec35820c…` était vrai à `16640ee`, superSédé à `88d28a5` par le retrait du chemin local).

### C-VB-4 — `docs/adr/ADR-M004-infrastructure-plateforme.md` D7 sexies
Note **DATÉE (2026-09-21)** : le chemin local u4 est **RETIRÉ** de `PROVENANCE-u4.md` depuis `88d28a5` (le texte disant encore « cites a local raws path » est corrigé). L'item formé **C-G2D-1 (b)** est **PORTÉ ICI** avec ses **TROIS volets** : (i) mécanisme d'exclusion des **DONNÉES orphelines `upcoming`** de l'export public (analogue de `export-exclude-tests.json`, **jamais** `STRUCTURAL_BLACKLIST`) ; (ii) nettoyage de `PROVENANCE-u3.md:42` (chemin de lecteur local déjà exporté) ; (iii) extension de `export:check` aux **chemins de lecteur Windows** (`[A-Z]:\`) — constat mesuré : le gate rend « 0 forbidden path » sur un export qui en contient un. Déclencheur : **AVANT la prochaine publication du miroir public** ; propriétaire : **orchestrateur**.

### C-VB-5 — item d'outil complété (ADR-U4 entrées U-4b + registre du PLI)
`meta.model` devient un **ARGUMENT ou une variable d'environnement OBLIGATOIRE, fail-closed**, dans `record.ts` et les scripts census — **s'ajoute à l'item `onRpcError`**. Déclencheur : **G0 de U-4b** ; propriétaire : **orchestrateur** ; **à NE PAS faire dans ce lot** (rouvrirait α et changerait `ukemi_sha`).

### C-VB-6 — texte du message de fusion attendu (dans le PLI)
Une seule fusion `--no-ff` ; R-25 **α 948 / β 810 / direct 1 756** ; **caveat bisect** (C-G2D-2 : `git archive c137af1` contient β ⇒ 439/440 ; l'arbre vert « α seul corrigé » est reconstruit `041a902` + 3 fichiers α-fix).

### Non bloquant à consigner comme item U-4b
`PROVENANCE-u4.md:57-58` annonce comme défaut `<U4_RAWS_DIR>` alors que `u4-reduce.mjs:24` garde un défaut local (`F:/PRODUITS/etude-2026-09-20/u4-raws` ; script non exporté) — à **aligner en U-4b**.

### G0 de U-4b — ce qu'il doit contenir (validateur ; ADR-U4 entrées U-4b)
Prereg frais committé seul ; les 7 entrées déjà listées ; **OPTION B** (classe mono-collatéral WETH — décision 91) ; **PR-U4-1 et PR-U4-3 au niveau [lu] avant la course**, **PR-U4-4 résolu avant le G0** ; budget RU Chainstack lu au dashboard + plafond d'appels fail-closed ; tuyaux jusqu'au chemin servi avec **test d'intégration depuis l'artefact réel** ; table MAST + **découpe R-25 pré-déclarée** ; items d'outil (`onRpcError`, `meta.model` en argument, durcissement EBUSY, 12 comptes e-mode non-cat-1) ; **contrôle live indépendant planifié DANS la mission G2 dès le départ**.

## 5. AM-1 (le validateur nomme ce qu'il a attrapé / manqué)
**Attrapé** : trois lignes de l'ADR-U4 et le bloc JOURNAL **périmés** ; `meta.model` **littéral** (non probant) ; `export:check` **aveugle aux chemins Windows** ; tuyau `UKEMI_REALIZED_E2` **caduc** (e2 = jeu de conception, jamais servi) ; message de `0a348d4` **inexact** (annonce un retrait absent de son diff). **Manqué par le validateur au checkpoint-2** : « vérifié » écrit sur `meta.model` **sans lire le source** (le champ est un littéral ⇒ la mention « (vérifié) » du CHECKPOINT2-lot-u4a.md était une inférence, non une lecture).

---
Pas de REFUS ; pas de nouvelle ESCALADE (la décision 91 clôt l'escalade du checkpoint-2). Les corrections ci-dessus sont **documentaires** et appliquées à `docs/adr/ADR-U4-book-et-calibration.md`, `docs/PLI-lot-u4a.md`, `docs/adr/ADR-M004-infrastructure-plateforme.md` ; ce fichier en est le record. Application par un rédacteur `claude-opus-4-8[1m]` (docs seules, R-20 : aucun commit, aucun workflow — l'orchestrateur seul).
