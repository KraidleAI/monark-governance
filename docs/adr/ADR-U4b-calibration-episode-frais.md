# ADR-U4b — Calibration sur un épisode FRAIS : ŷ à close factor v3.5.0 au premier franchissement, deux cellules Mondrian, gel du code de score avant les données

- **Statut** : **proposé au G0 (`2f4456f`) → adopté au G1 -1a (`2be3a98`, G2 `214968d`, pli `155ea22`)** ; checkpoint-2 -1a ACCEPTE-AVEC-CORRECTIONS (C-V-1..9, `docs/CHECKPOINT2-lot-u4b-1a.md`) ; sous-lots à venir : -0 (consommer `@monark/rpc-guard`), -1b (prereg + course fraîche), -2 (branchement servi). Rattachement : ADR-M020 D1 (b) (programme Ukemi), ADR-U4 (U-4a : book B₀, D_e, calibration e2 — **conception**), ADR-U3 (étiquettes Y), ADR-M018 (règle de Branchement, tuyaux), ADR-M011/M014 (non-dégénérescence, pré-enregistrement), ADR-C01 amendement cadence 2026-09-21 (régime B). Décisions investisseur 91 (premier franchissement), 99 (U-4a-ii absorbé), 108 (**classe A seule servie**), 110 (anti-close bis : constantes on-chain publiques exemptées), 111 (u4 hors miroir).
- **Dates** : G0 2026-09-21 ; rédaction de cet ADR : orchestrateur `claude-fable-5-1` (C-V-6 du checkpoint-2 -1a ; `error_origin` orchestrateur : « adopté au G1 » non tenu au G1). Aucun réseau pour -1a (e2, offline).
- **Motif ADR-U4** repris : contexte mesuré → décisions D1..D5 → tuyaux → conséquences → rejets → MAST.

## Contexte (mesuré, [lu] fichier:ligne à `155ea22`)
1. U-4a (ADR-U4) a calibré sur **e2** (liquidations Aave v3 core, collatéral WETH, 2025-10-10/11 ; book B₀ = 23545087, 16 096 comptes à-risque, 140 updates de D_e) avec `ŷ = total_debt_base` si `HF(p_min) < 1e18` — plafond grossier, évalué à p_min (`ADR-U4:42-44`).
2. e2 est le **seul** cluster WETH observé par U-3 (`u3-realized.mjs:3-5, :40`) ⇒ **e2 = jeu de CONCEPTION** (forme du score, coupes), **jamais servi** ; la calibration servie exige un **épisode FRAIS** découvert par la règle P-EPI pré-enregistrée (`docs/G0-lot-u4b.md` §2), ~280 k appels (décision 91), après POOL-RPC-1a et GARDE-HELIUS-2.
3. Règle de liquidation lue [lu] : Aave v3.5.0 `LiquidationLogic.sol` (tag `6138e1fda…`, `F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\PR-U4-3-liquidationlogic-close-factor.md` §3-6) : close factor `min(CF_base, C_r/m)` avec bonus e-mode (`emode_raw`), seuil `MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD = 2000e8`, dust en OU, `>` strict sur 0,95e18 (`PR-U4-3:263`).
4. Mondrian [lu] (Vovk–Gammerman–Shafer 2003, `alrw.net/old/04.pdf`, précondition C-15) : validité **par catégorie** sans taille minimale ; la fonction de catégorie κ est fixée **a priori** (ici : classe × strate de taille de ŷ).
5. Mesures -1a sur e2 (`docs/CHECKPOINT2-lot-u4b-1a.md` M-3/M-4) : cellule A n = 565 (q̂ p=561 = `145029844742724`), cellule B n = 99 (< nMin ⇒ `under_calib`), `non_evaluable_x` 6 611 (dont 483 sub-$1 = **vrais collatéraux non-WETH minuscules**, pas du rounding — C-V-4), `crossed` 563 ; digests A `dc9ab572…`, B `89897a61…`, 4 pins de strate ; 565/565 ŷ et p\* recalculés indépendamment sous la convention du code.

## Décisions
- **D1 — Unité, cellule, étiquette.** Unité = compte **mono-collatéral WETH** à B₀ : `collat_non_WETH_base(p0)/total_collateral_base(p0) ≤ X` avec **X = 0** (lecture stricte de « mono-collatéral WETH », décision 91 ; 6 611 comptes exclus sur e2, `non_evaluable_x`). e-mode hors {0,1} ⇒ fail-closed (exclu). LST = catégorie e-mode 1 ∧ ≠ WETH (rsETH hors) ; dette LST tenue à p0 (`lst_debt_at_p0`). Étiquette Y = ADR-U3. **Classe A** `liquidation-eligible-coverage` : cellule = {ŷ > 0 sous D_e} ∪ {liquidés}. **Classe B** `liquidation-realized-given-liquidated` : cellule = liquidés — **calculée hors ligne, JAMAIS servie** (décision 108 ; le générateur C-9 n'émet que A).
- **D2 — ŷ = maximum liquidable en UN appel, au PREMIER FRANCHISSEMENT p\*.** p\* = premier `AnswerUpdated` le long de D_e depuis l'ancre pré-B₀ (ordre `(block, logIndex)`) tel que `HF(p*) < 1e18` ; HF recomputé WadRay, jambes WETH (aWETH, vWETH) au prix p\*, autres actifs figés à p0 (limitation déclarée) ; LT = réserve si emode 0, sinon catégorie e-mode ; identité H-7 : à p\* = p0, HF == hf0. Bords : `HF(p0) < 1e18` ⇒ p\* = p0 ; jamais de franchissement ⇒ ŷ = 0, Y compté. ŷ = `max_r min(CF(HF), C_r/m_r)` sur les réserves de dette r (règle multi-dettes = max), `CA = floor(C·1e4/bonus)`, dust en OU, `m_bps` 10 100 (e-mode) / 10 500. **Convention `D_tot(p*) = total_debt_base − vWETH@p0 + vWETH@p*`** (agrégat on-chain autoritaire, précédent ADR-U1 C-2) — **choix de méthode pré-enregistré** (C-V-1) : la convention Σ jambes déplace 140/565 ŷ de ±1–2 unités, 1 p\* (compte dust) et le digest ; constat brut consigné : `total_debt_base` > Σ floor(amt·prix/unit) de +1..+5 unités pour 564/565 comptes de A ⇒ item formé « expliquer agrégat ≠ Σ jambes » (orchestrateur, avant la course -1b). Score et ŷ en devise de base 8-dec (pas floor natif Solidity) ; arrondi on-chain exact de `CA` non vérifiable hors réseau ⇒ `PR-U4-3-ter` (lecture `LiquidationLogic.sol` l.609-660, sha `201159d0…`) formé, propriétaire orchestrateur, déclencheur avant le prereg -1b.
- **D3 — Score, α, nMin, Mondrian.** Split-conformal : `s = |Y − ŷ|`, sans clipage, tri canonique ; `q̂` = p-ᵉ plus petit, `p = ⌈(n+1)(1−α)⌉`, **α = 0,01**, **nMin = 100** par strate (Dunn 2022 Thm 11, strict) ; strates de A par taille de ŷ aux frontières **du code** : `< 2000e8`, `[2000e8, 100 k$)`, `[100 k$, 1 M$)`, `≥ 1 M$` ; registre C-9 (`buildRegistryEntries`, `predictorBase` obligatoire, scores bornés < 2^53, `float64_be` trié). En **couverture**, jamais en probabilité (vocabulaire gaté).
- **D4 — Ordre pré-enregistré + GEL du code de score AVANT les données.** `docs/PLAN-u4b-prereg.md` committé SEUL avant tout appel ; le script refuse sans `--prereg-sha` (garde `lfSha256`). Le prereg fige les sha256 LF de : `scripts/census/u4b/u4b-scores.mjs` **`9ad20666af878c630073d998c6d3bc0bca38017e73b406853bcc31c3f83feacf`**, `scripts/census/u4b/u4b-reduce.mjs` **`a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0`**, `scripts/record-u4b-calib.mjs` **`5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3`** (re-figés après le pli G2 `155ea22` et la ligne d'usage C-V-3 viii, `1b4f8e2`) **ET, C-V-2, des imports transitifs hors zone gelée** : `apps/sentinel/src/ukemi/wadray.ts` `7bee76fc…`, `apps/sentinel/src/ukemi/abi.ts` `3376eb08…`, `packages/hikae/src/l1-split.ts` `9206df91…`, **et `apps/sentinel/src/rpc.ts` `0e232519…` (GARDE-HELIUS-2 C-3 : transitif de 2ᵉ niveau — `abi.ts:7` importe `TRANSFER_TOPIC` de `../rpc.ts` ; ajouté au gel, byte-identique vérifié au G1 de GARDE-HELIUS-2b)** (à recomputer LF au commit du prereg ; `calib-digest.ts` déjà sous `contracts_frozen`). Précondition C-15 (Mondrian 2003 [lu]) tenue. Toute déviation = D-n déclarée au PLI. Liste fermée des choix à pré-enregistrer avec effet mesuré (C-V-7) : X = 0 ; e-mode fail-closed ; LST ; tie-break dust = premier dans l'ordre des balances ; scale 1 ; devise de base vs floor natif ; `CA` floor ; convention `D_tot` ; `>` strict sur 0,95e18 (asserté par lecture, 0 compte à l'égalité sur e2). **Preuve d'intégrité sous régime B** : blobs HEAD (`git show HEAD:…`), pas `git status` (AM-1 du validateur).
- **D5 — Budget, ledger, rapprochement.** Tout appel compté en TENTATIVES par la couche budgétée de `@monark/rpc-guard` (GARDE-HELIUS-2, ledger de cycle `F:\monark-ledger\<cycle>/`, caps par run/méthode/cycle, Chainstack 16 M RU décision 115) ; rapprochement asymétrique `Δdashboard ≤ ledger_run` + bande `max(50 cr, 0,5 %)` (décision 113) ; aucun script de brouillon n'appelle un endpoint payant ; sonde -1b avec `--concordance-out` (POOL-RPC-1a C-5/C-6). **U-4b-0 (discover/calib) est SUBSUMÉ par GARDE-HELIUS-2** (addendum D4 (iii)) : le discover/calib de U-4b-1b consomme le recorder GARDÉ (une fois `GARDE-HELIUS-2b-migration` livré) ; aucun second compteur de budget n'existe.

## Tuyaux (ADR-M018 ; règle de Branchement)
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test |
|---|---|---|---|---|
| score-code gelé | `u4b-scores`/`u4b-reduce`/`record-u4b-calib` (sha D4) | `U4b-scores-e2.jsonl` → (à -2) `calibration.ts` | **-1a `upcoming`** (consommé par un test seul, C-V-5) | `u4b_scores_on_e2`, `u4b_registry_recomputes_from_scores_jsonl`, `_anchor_is_required_and_positive`, `_runner_and_generator_paths_are_required` |
| épisode frais | `u4b-discover.mjs` (P-EPI, budget gardé) | book/D_e/labels frais | -1b (après POOL-RPC-1a, GARDE-HELIUS-2, prereg) | `u4b_episode_selection_is_deterministic` |
| région servie (borne haute `[0, ŷ+q̂_k]`, décision 126) | `calibration.ts` K entrées classe A (registre VIDE en -2a, FRAIS en -2b) + `strateOf` serveur (`ukemi-strata.ts`) | outil MCP `gate` + `POST /gate` → `GateDecision` | `built` **ssi** test servi vert sur registre FRAIS (**-2b**) ; en -2a : servie, `under_calib` partout | `u4b_gate_serves_region_from_real_artifact` (-2a, abstention) puis 2b-4 (borne) |
| cascade retrait | remplacement 4→4 par le producteur de ŷ `ukemi-predict` (décision 123 = D ; 51 à la lettre) | classe synthétique disparue, pierre tombale 410 | **U-5 / -5b** (plus -2) | `no_cascade_class_in_harness` (U-5) |

## Conséquences
- Rien n'est `built` avant -2 ; registre public (site/README/skill) inchangé jusque-là.
- Export public : les 4 fixtures `apps/sentinel/test/fixtures/ukemi/u4b/*` sont ajoutées à `scripts/export-exclude-data.json` **à la fusion** avec `lot/etude-suite` (C-V-8, décision 111 ; le fichier n'existe pas sur la base `2f4456f`).
- `error_origin` -1a (C-V-9) : C-G2-1..4 worker G1 ; C-V-1 worker G1 + relecteur G2 ; C-V-2 planificateur + validateur cp-1 ; C-V-4 worker G1 ; C-V-5 rédacteur du pli ; C-V-6/C-V-8 orchestrateur.

## Rejets
- ŷ à p_min (U-4a) : refusé (décision 91 ; mutant b rouge). ŷ = `D_tot` (plafond) : refusé (mutant a rouge). Dust en ET : refusé (mutant g rouge). Servir la classe B : refusé (décision 108, n < nMin). Convention Σ jambes pour `D_tot` : non retenue à -1a, **déclarée** avec son effet (D2) — pas tranchée « vraie ».

## MAST (résiduel)
Sélection sur l'issue — contrée par D4 (gel élargi C-V-2) ; spécification ambiguë — liste fermée C-V-7 pré-enregistrée ; vérification non indépendante — CA-9 : le validateur recalcule sous une convention alternative (C-V-1 b) ; dérive de vocabulaire — `gate:vocab` ; dépense non gardée — D5.

## Amendement daté 2026-09-21 (addendum GARDE-HELIUS-2 C-7)

> **Provenance.** Rédaction : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`
> conforme, effort max ; Opus 5 banni), 2026-09-21, base `lot/etude-suite` HEAD
> `2d3f5d8` (mesures reproductibles jointes, `MESURES.md`). **Insertion dans l'ADR par
> l'orchestrateur `claude-fable-5-1` SEUL** (R-20 ; le worker ne committe pas). Réviseur =
> orchestrateur (vérification adversariale R-21). **Aucune décision nouvelle** : cet
> amendement ne fait que fixer, dater et rendre traçable ce que l'addendum GARDE-HELIUS-2
> (faits C-3, D4 (iii), C-7, Protocole) et les décisions investisseur 118 et 121 disent
> déjà. Il **formalise** — sans les ré-introduire — les clauses en ligne de D4 (`rpc.ts`)
> et de D5 (« SUBSUMÉ ») déjà portées par le commit `798b4e9` (GARDE-HELIUS-2b-i G1).

**État à l'ouverture de l'amendement (mesuré, régime B).** L'addendum C-7 exigeait un
amendement daté de cet ADR portant (i) `rpc.ts` au gel D4 et (ii) « U-4b-0 subsumé » en D5.
Le prereg DRAFT les notait absents (Q3) — constat pris à `430e99d` (ancêtre de HEAD sur
`lot/etude-suite`, **antérieur à la fusion `8ba2cbc`**), où l'ADR (38 lignes) ne portait pas
encore ces clauses (mesuré : 0 occurrence) : **le constat d'absence de Q3 était exact à
`430e99d`** ; c'est la prémisse « jamais atterri » de la mission, héritée de Q3, qui est
**périmée depuis `8ba2cbc`**. Depuis cette fusion, la **substance** de (i) et (ii) figure
**en ligne** dans D4 et D5 (lignes 18-19), portée par `798b4e9` (G1 GARDE-HELIUS-2b-i,
« ADR clauses ») — présente à `8aedd03` (base mission) comme au HEAD. Restent dus,
et sont fixés ci-dessous : la valeur LF **complète** de `rpc.ts` recomputée avec sa preuve
d'imports (§1) ; les SHA de fusion de GARDE-HELIUS-2 et la mise à jour de la ligne de tuyau
(§2) ; la **contrainte d'ordre NARABI-OPS-1d** (§3) ; la **note « plafond par compte »
(décision 121)** (§4).

### 1. D4 (gel) — `apps/sentinel/src/rpc.ts` : valeur LF complète + preuve de la chaîne d'imports

`apps/sentinel/src/rpc.ts` **figure au gel D4** (clause en ligne portée par `798b4e9` ;
addendum C-3 : transitif de 2ᵉ niveau du jeu gelé). Cet amendement **fixe sa valeur LF
complète**, recomputée par le worker depuis le blob HEAD sous la convention D4/AM-1
(`git show HEAD:<f> | tr -d '\r' | sha256sum`) :

```
0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0  apps/sentinel/src/rpc.ts
```

- **Chaîne d'imports prouvée (mesurée, blob HEAD).** `apps/sentinel/src/ukemi/abi.ts`
  **ligne 7** est, verbatim : `import { TRANSFER_TOPIC } from "../rpc.ts";`. La constante
  importée est définie à `apps/sentinel/src/rpc.ts` **ligne 15** (constante littérale
  exportée). `abi.ts` est lui-même gelé (C-V-2, `3376eb08...`) et importé par
  `u4b-scores.mjs` et `u4b-reduce.mjs` ⇒ `rpc.ts` est un transitif du jeu gelé **par
  `abi.ts:7`**.
- **`rpc.ts` est une feuille.** Son seul `import` (ligne 12) est
  `import { createHash } from "node:crypto";` — aucun import `src`. La fermeture transitive
  gelée reste donc **fermée** : {`u4b-scores.mjs`, `u4b-reduce.mjs`, `record-u4b-calib.mjs`,
  `wadray.ts`, `abi.ts`, `rpc.ts`, `l1-split.ts`} ∪ {`calib-digest.ts`, déjà
  `contracts_frozen`}. Aucun import `src` non gelé ne subsiste.
- **Preuve d'intégrité (régime B, AM-1).** Recompute effectué à HEAD
  `2d3f5d85ee3c808723a0f948f89e73b6568aedb2`, la mission ayant été formée à HEAD
  `8aedd03` ; le **seul** fichier modifié entre les deux est `docs/TABLEAU-DE-BORD.md`
  (`git diff --name-only 8aedd03 2d3f5d8`). Les **7 fichiers gelés sont byte-identiques**
  aux deux HEAD (les 3 valeurs complètes de D4 et les 4 préfixes D4/C-V-2 concordent ;
  `rpc.ts` = valeur ci-dessus) — c'est la preuve « blobs HEAD inchangés » que D4 prescrit,
  pas `git status`.
- **Inchangé.** La clause D4 « à recomputer LF au commit du prereg » **reste due** : la
  valeur ci-dessus est celle du HEAD `2d3f5d8` ; toute divergence au commit réel du prereg
  = ÉCART = STOP (Q10).

### 2. D5 — U-4b-0 « consommer `@monark/rpc-guard` » subsumé par GARDE-HELIUS-2 ; ligne de tuyau

La clause D5 « **U-4b-0 (discover/calib) est SUBSUMÉ par GARDE-HELIUS-2** » (en ligne,
`798b4e9` ; addendum D4 (iii)) est **précisée** par l'état de livraison de GARDE-HELIUS-2 :

- **2a** (paquet `@monark/rpc-guard` multi-opérateur) : **fusionné `e98b54f`** ;
- **2b-i** (moitié paquet : vocabulaire d'erreur à source unique, `RpcError` canonique,
  indice fermé D6) : **fusionné `8ba2cbc`** ;
- **2b-ii** (moitié migration : `record.ts` consomme `openGuardedClient` ; grep CI) :
  **en cours** (G0 `docs/G0-lot-garde-helius-2b-ii.md`, checkpoint-1 en vol). C'est le
  `GARDE-HELIUS-2b-migration` que D5 nomme comme condition de consommation (découpe
  2b-i / 2b-ii du 2026-09-21 17:40 UTC, `docs/CHANTIERS.md`).

Le sous-lot **« -0 (consommer `@monark/rpc-guard`) »** de la ligne de Statut est ce **même**
U-4b-0 subsumé : le discover/calib de U-4b-1b consomme le recorder GARDÉ ; **aucun second
compteur de budget** n'existe. La ligne de tuyau « épisode frais » de la table Tuyaux est
**remplacée** par (colonne État mise à jour) :

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test |
|---|---|---|---|---|
| épisode frais | `u4b-discover.mjs` (P-EPI, budget gardé) | book/D_e/labels frais | -1b (après POOL-RPC-1a, GARDE-HELIUS-2 : 2a `e98b54f` fusionné, 2b-i `8ba2cbc` fusionné, 2b-ii en cours ; prereg) | `u4b_episode_selection_is_deterministic` |

### 3. Contrainte d'ordre — NARABI-OPS-1d ne fusionne pas pendant la fenêtre prereg → clôture de course

`apps/sentinel/src/rpc.ts` étant **au gel D4** (§1), et **NARABI-OPS-1d** étant le lot qui
**migre `rpc.ts` vers `@monark/rpc-guard`** (décision 118 ; addendum C-4 : allowlist du grep
CI à déclencheur -1d) :

- **NARABI-OPS-1d NE fusionne PAS entre le commit du prereg -1b et la clôture de la course.**
  Sinon `rpc.ts` change, le gel est rompu, et il faut **re-geler + re-pré-enregistrer**
  (prereg Q10). La course U-4b-1b se termine **AVANT** NARABI-OPS-1d.
- **Cohérent avec la décision 118** : NARABI-OPS-1d est **APRÈS le release temps 1**
  (« E-5 ⇐ -1c seulement » ; la migration de `rpc.ts` est un lot séparé, après le temps 1),
  donc l'ordre naturel place déjà -1d après la course.
- **Fait discriminant.** `record.ts` / `rpc2.ts` sont **hors** du gel (en aval du jeu gelé —
  `docs/G0-lot-garde-helius-2b-ii.md` §3) ⇒ l'ordre 2b-ii ↔ prereg **ne crée pas** de
  conflit. C'est `rpc.ts`, **dans** le gel et migré par -1d, qui impose cette contrainte
  d'ordre.

### 4. Note — plafond Chainstack PAR COMPTE (décision 121) ; A-4 lit le total du compte + la ligne `ethereum-mainnet`

Le plafond de cycle Chainstack cité en D5 (« Chainstack 16 M RU, décision 115 ») est
**précisé** par la décision 121 : c'est un plafond **par COMPTE**, tous réseaux confondus
(`ethereum-mainnet` Ukemi + `solana-mainnet` Bell + tout autre). Conséquences portées au
prereg -1b :

- **un seul ledger** de cycle Chainstack, **une seule clé de cycle**, floor lu au tableau
  de bord = **somme des réseaux** ;
- le rapprochement **A-4 lit le total du compte ET la ligne `ethereum-mainnet`** (le job
  quotidien Narabi et une éventuelle sonde Bell comptent dans le même plafond) ;
- la ventilation par réseau est un **attribut du journal** (`network`), **jamais un second
  plafond**.

L'amendement de `ADR-GARDE-HELIUS-client-budgete-unique.md` (A-1 / A-4, clause « par
compte ») **reste un item formé** (propriétaire orchestrateur, déclencheur G1 2b-ii,
décision 121) — **hors** du présent ADR.

## Amendement daté 2026-09-22 (décision 126) — score UNILATÉRAL `max(Y − ŷ, 0)`, re-gel du sha #1, région servie = borne haute

> **Provenance.** Rédaction : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`
> conforme, effort max ; Opus 5 banni), 2026-09-22, worktree `lot/u4b-score-1` base
> `lot/etude-suite` @ `f26693f` (mesures reproductibles jointes au G1 `G1-lot-u4b-score-1.md`).
> **Insertion dans l'ADR par l'orchestrateur `claude-fable-5-1` SEUL** (R-20 ; le worker ne
> committe pas). Réviseur = orchestrateur (vérification adversariale R-21). **Autorité :
> décision 126** (`docs/CHANTIERS.md`, orchestrateur sur délégation investisseur verbatim
> « audite la décision de l advisor et tranche »), audit adversarial de l'avis advisor-defi
> (`F:\PRODUITS\etude-2026-09-21\ukemi-u4b-prerequis\AVIS-advisor-defi-vacuite-region-A-options-2026-09-22.md`,
> option 1). Les corps D1..D5 et l'amendement 2026-09-21 **restent byte-identiques** ; cet
> amendement les SUPERSÈDE sur les seuls points ci-dessous (l'exigence de consigne « ADR du
> gel intact » est levée pour CE lot par la décision 126, qui EST un re-gel ; le tableau
> AVANT/APRÈS §3 prouve que seul le sha #1 a bougé).

**Licéité.** Le prereg -1b n'est PAS committé (`docs/PLAN-u4b-prereg.md` absent, CANDIDAT seul) et aucune donnée fraîche n'a été tirée ⇒ la fenêtre est
ouverte ; la FORME du score est fixée AVANT que la donnée fraîche existe (e2 = conception,
C-12 ; anti « sélection sur l'issue », Barber-Candès-Ramdas-Tibshirani 2023 : la fonction de
non-conformité S est fixée avant la calibration). Après la course -1b, ce changement serait
post-hoc.

### 1. D3 — score UNILATÉRAL
`s = |Y − ŷ|` (D3) **devient** `s = max(Y − ŷ, 0)` (exceedance unilatérale, base 8-dec, clipée
à 0). Motif : l'unilatérale fait de q̂ une statistique de la QUEUE des exceedances (l'erreur
qui coûte — la liquidation dépasse le maximum liquidable en un appel), là où `|Y − ŷ|` mêle un
percentile de ŷ. Validité split-conformal inchangée (couverture ≥ 1−α sous échangeabilité ;
seule la borne SUPÉRIEURE `1−α+1/(n+1)` exigerait des résidus distincts — MONARK ne revendique
que « ≥ 1−α »). Édition : `scripts/census/u4b/u4b-scores.mjs:245` (ligne 244 avant l'insertion du commentaire) + commentaire `:29-30` ;
`u4b-reduce.mjs` et `record-u4b-calib.mjs` **OCTETS INCHANGÉS** (seule leur SORTIE change).

### 2. Région servie = BORNE HAUTE `[0, ŷ + q̂_k]`, jamais un intervalle

> **Champ de fil (précision checkpoint-2 C-2 / G2 C-3).** Le champ `region.kind` du contrat gelé `CoverageVerdict` reste le littéral `"interval"` (`packages/contracts/src/types.ts:207`, `schemas/coverage-verdict.schema.json`) : « borne haute / upper bound » qualifie la FORME servie (`lo = 0` par construction, `hi = ŷ + q̂_k`) et le TEXTE servi de la classe, jamais un nouveau `kind`. Aucun contrat gelé ne change (checkpoint-1 delta U-4b-2, D-1).
La forme de la région servie : `[ŷ − q̂_k, ŷ + q̂_k]` **devient** `[0, ŷ + q̂_k]`. Texte servi :
« upper bound », jamais « interval ». Conséquence à porter au `docs/G0-lot-u4b-2.DRAFT.md`
(hors gel, non encore built ; non modifié par ce lot — lignes notées au G1) :
`buildIntervalRegion(ŷ − q̂, ŷ + q̂)` → `buildIntervalRegion(0, ŷ + q̂)`.

### 3. D4 — re-gel : tableau des sha AVANT / APRÈS (recompute LF, worktree base `f26693f`)
Seul le sha #1 bouge ; la fermeture transitive reste **fermée et byte-identique**.

| # | Fichier gelé | AVANT (LF sha256) | APRÈS (LF sha256) | État |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `9ad20666…f83feacf` | `2f9a31f6…f51445c0` | **RE-GELÉ** |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd3…57a6fac0` | idem | inchangé |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb…2a1fbc31a3` | idem | inchangé |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc…e4de2322` | idem | inchangé |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb08…c1ab2d66` | idem | inchangé |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df91…8164ffa3` | idem | inchangé |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519…c1c65ca0` | idem | inchangé |
| 8 | `packages/contracts/src/calib-digest.ts` (contracts_frozen) | `3603265d…94c42380` | idem | inchangé |
| — | `scripts/census/u3-realized.mjs` (labeler, gel déféré) | `755b3a38…618db2de4` | idem | inchangé |

Valeurs complètes du sha re-gelé (worker ; **à recomputer au commit réel du prereg —
ÉCART = STOP**) :
```
AVANT  9ad20666af878c630073d998c6d3bc0bca38017e73b406853bcc31c3f83feacf  u4b-scores.mjs
APRÈS  2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0  u4b-scores.mjs
```

### 4. Digests de cellule et q̂ (recalcul orchestrateur, confirmé PAR EXÉCUTION et par recomputation indépendante)
- Fixture `U4b-scores-e2.jsonl` : `84f8aa13…dec79971e` → `301d39fa806fd36a72cc446484aa4d04807a56ab603b1b69f464264550a126ad`
  (recette PROVENANCE §3 EXACTE, bruts sha-pinnés inchangés `8f620f6c…` / `7b87f6d3…` ;
  book/oracle **byte-identiques** ; census **IDENTIQUE** ; seuls le champ `score` et les
  digests bougent — diff structuré au G1).
- Cellule A : digest `dc9ab572…` → `2feb4ab057613925c9ed77dbec4f186044375b223d5ea520df3ec82d63524720` ;
  cellule B : `89897a61…` → `07bb8e3b1f35a95f5679f013133cc3e87540e01177279ccfe9ec6f4f8dfb8b0f`.
- q̂ par strate SERVIE (base 8-dec) : strate 0 `23169870364` (231,70 $), strate 1
  `3609978241254` (36 099,78 $ = max, p=n=148) ; strates 2/3 `under_calib` (n < nMin=100).
  (Les valeurs « 23170000000 / 3609978000000 » de la décision 126 étaient des **arrondis
  d'affichage** ; les valeurs de fixture ci-dessus sont autoritaires.)
- Registre (`record-u4b-calib` sur la fixture régénérée) : strate 0 q̂=`23169870364`
  calib_digest `371f0577…` ; strate 1 q̂=`3609978241254` `624e21c7…` ; strate 2 `31654567…`
  (under_calib) ; strate 3 `db51ef06…` (under_calib).

### 5. Quatre clauses pré-enregistrées (portées dans la même édition du prereg -1b)
1. **H-3** : « test exact bêta-binomial UNILATÉRAL, **CONSERVATEUR sous ex æquo** (atomes en 0
   comptés couverts) » — sans elle, H-3 « scores continus i.i.d. » est FAUX (sous
   l'unilatérale, [mesuré fixture régénérée] les scores nuls par strate = 344/363, 120/148,
   38/46, 7/8 (509/565 au total) ⇒ `#{s ≤ q̂}` non
   bêta-binomial ; le test « couverture trop basse » reste valide mais conservateur).
2. **Condition d'épisode** : `n ≥ 199` par strate servie pour un q̂ **intérieur** (α=1 % ⇒
   p = ⌈(n+1)·0,99⌉ < n ssi n ≥ 199), distincte de nMin=100 ; sinon q̂ = max rapporté tel
   quel (sur e2, strate 1 n=148 < 199 ⇒ q̂ = max = `3609978241254`).
3. **Rapport obligatoire, à côté de q̂₀** : (a) le compteur census `crossed_yhat_zero`
   (comptes ayant FRANCHI mais dont tout `D_r` floore à 0 ⇒ ŷ=0) ; (b) l'ensemble
   **{ŷ=0 ∧ liquidés}** **avec leur Y**, **sous-divisé par `pstar`** — `pstar=null`
   (« liquidé sans franchissement » = no_crossing) et `pstar≠null` (franchi mais ŷ=0). La
   strate 0 est gouvernée par ces échecs de règle, pas par l'erreur de close factor. Sur e2
   [mesuré] : `crossed_yhat_zero` = **1** (compte franchi NON liquidé, hors cellule) ;
   {ŷ=0 ∧ liquidés} = **3**, tous `pstar=null` (**3** sans franchissement / **0** franchi-ŷ0),
   Y = 32 772,78 $ / 231,70 $ / 106 668,92 $ ; ces ensembles sont **DISJOINTS** sur e2 (donc
   **3, pas 3−1**). q̂₀ = 231,70 $ EST le 3ᵉ échec de règle (`n − p = 2` en exclut deux).
4. **Région servie** = borne haute `[0, ŷ + q̂_k]`, jamais un intervalle (§2).

### 6. Item formé « calibration suivante » — Mondrian CONDITIONNEL-AU-LABEL (option 3)
La vacuité résiduelle du mélange (la classe A mêle les comptes Y=0 et les liquidés) se traite
par un **Mondrian conditionnel-au-label** {Y = 0} ∪ {Y > 0} (× strate de ŷ) — Vovk 2012
Prop. 3 (validité conditionnelle à la catégorie, κ(·,(x,y)) := y). Sous l'unilatérale, la
région servie de la catégorie {Y > 0} est `[0, ŷ + q̂_{B,k}]` (connexe) ⇒ **l'unilatérale est
le prérequis de FORME de l'option 3** (le symétrique donnerait {0} ∪ [ŷ − q̂, ŷ + q̂],
disconnexe, non représentable par `buildIntervalRegion`). **Item formé**, propriétaire
orchestrateur, **déclencheur** : épisode frais avec ≥ 100 liquidés mono-WETH dans une strate
(le code gelé émet déjà la cellule B ; le passage à « servie » = décision -2 + décision 108
amendée, **sans re-gel supplémentaire** l'unilatérale étant adoptée aujourd'hui).

### 7. Résiduel nommé
La strate 0 reste large (largeur/ŷ médian ≈ ×227 sous l'unilatérale) — **propriété de la
STRATE** (ŷ médian ≈ 1 $, poussière), pas du score ; q̂₀ mesure la gravité des échecs de règle
(F3 de l'avis), pas l'erreur de close factor. Ce n'est pas une dette : propriété mesurée,
rapportée (clause 3), jamais un contournement.

## Amendement daté 2026-09-22 (U-4b-2a — classe servie sur registre vide ; décisions 123/126)

> Provenance. Rédaction : worker `claude-opus-4-8[1m]` (préfixe conforme, effort max ; Opus 5 banni),
> 2026-09-22, base `lot/etude-suite` @ f0720ae. Insertion par l'orchestrateur `claude-fable-5-1` SEUL (R-20).
> Aucune décision nouvelle : cet amendement fixe et trace la re-dérivation serveur de la clé + met à jour les
> tuyaux :26-27 périmés sous 123/126. Réviseur = orchestrateur (R-21).

1. Clé re-dérivée SERVEUR (déviation déclarée à ADR-M020 D1(b)). Pour la classe servie
   `liquidation-eligible-coverage`, la clé de lookup committée est re-dérivée côté serveur
   `UKEMI_LIQ_PREDICTOR_BASE + "/s" + strateOf(yhat)` ; le `predictor_id` PORTÉ PAR L'APPELANT est IGNORÉ
   pour le lookup (le serveur ne fait jamais confiance à la strate/clé client — checkpoint-1 C-10). En -2a
   `UKEMI_LIQ_PREDICTOR_BASE` est un placeholder (`ukemi:liquidation-eligible-coverage-uncommitted-until-u4b-2b`,
   registre vide) ; -2b le re-épingle au littéral `meta.cell_a.predictor_id` de l'épisode FRAIS. Déviation
   par rapport à ADR-M020 D1(b) : la classe (b) `liquidation-realized-given-oracle-path-24h` y nommait la clé
   par population ; ici la classe A committée dérive la strate de ŷ, pas d'une clé client.

2. Tuyaux :26-27 (périmés sous 123/126) réécrits. Ligne 27 « cascade retrait | 8 fichiers gatés + fleet.ts
   | classe synthétique disparue | -2 | no_cascade_class_in_harness » devient « cascade retrait -> U-5/-5b
   (le retrait bouge avec le PRODUCTEUR réel `fromRealizedBook`, décision 123) ; `no_cascade_class_in_harness`
   à U-5 ». Ligne 26 « région servie … État -2 » devient « -2b » (après registre frais). Motif : décision 123
   (le remplaçant de `cascade` = le producteur de ŷ, U-5) et décision 126 (score UNILATÉRAL max(Y-ŷ,0) ⇒
   région servie = BORNE HAUTE [0, ŷ+q̂], jamais un intervalle symétrique ; le fil garde `region.kind:"interval"`).

3. Score/sha D3/D4. Le re-gel du score (unilatéral, lot U-4b-SCORE-1) porte l'amendement D3/D4 avec les 8 sha
   recomputés ; le présent amendement y RENVOIE sans les dupliquer. -2a ne lit du JSONL que yhat/strate/
   meta.cell_a.predictor_id (invariants sous SCORE-1, delta D-6).
```

## Amendement daté — 2026-09-22 (D4, liaison de course par CODE) — À INSÉRER par l'orchestrateur (R-20 ; le worker ne committe pas)

Contexte : la phrase D4 en ligne « le script refuse sans `--prereg-sha` (garde `lfSha256`) » était **fausse au sens
littéral avant décision 128** (`record.ts` comparait `--prereg-sha` à `docs/PLAN-u4-prereg.md`, le prereg U-4), puis
**incomplète après le lot U-4b-1b-0** : mesuré au checkpoint-2 (P3c) et au G2, le code refusait *si un flag était fourni
et ≠*, mais restait *optionnel par code sans le flag*. La question d'escalade (`docs/CHECKPOINT2-lot-u4b-1b-0.md` §5)
a été **tranchée par l'orchestrateur le 2026-09-22** (`docs/CHANTIERS.md:677`, « Ruling orchestrateur … question
d'escalade tranchee ») : **enforcement par CODE**. Cet amendement **supersède** la formulation proposée au
checkpoint-2 C-3(a) (« la fourniture est exigée par le prereg §5a/§6, **pas par le code** »), désormais caduque.

### Libellé D4 amendé (liaison prereg/labeler)

Le recorder `apps/sentinel/src/ukemi/record.ts` lie la course au prereg ainsi :

- **Refus quand fourni et ≠** : un `--prereg-sha` (resp. `--labeler-sha`) fourni **doit** égaler le sha256 **LF** de
  `--prereg-file` (défaut `docs/PLAN-u4b-prereg.md`) (resp. de `scripts/census/u3-realized.mjs`, le labeler U-3 gelé) ;
  sinon **refus nommé**.
- **REQUIS par code dès que `docs/PLAN-u4b-prereg.md` existe** : dès que le fichier `--prereg-file` **existe sur
  disque**, `--prereg-sha` **ET** `--labeler-sha` sont **obligatoires par code** (la phrase D4 « refuse sans
  `--prereg-sha` » est ainsi rendue **vraie par code** — mais **conditionnée à l'existence du fichier**, pas
  inconditionnelle). L'usage générique hors U-4b (U-1/susde) lève l'exigence par `--no-prereg-binding` **explicite**,
  **écrit dans la provenance** (`prereg_binding: "none"`) ; le prereg -1b **interdit** `--no-prereg-binding` pour la
  course weth. `--no-prereg-binding` ne lève que **l'exigence** : un sha fourni reste vérifié.
- **Refus de garde = pré-vol** : tout refus des gardes ci-dessus survient **avant le client gardé** —
  **0 appel** (fetch), **0 ligne de ledger**, **pas de diag** (`<out>.diag.json` n'est écrit que sur un échec
  survenu APRÈS l'ouverture de la course, chemin `try`). Quand `docs/PLAN-u4b-prereg.md` **n'existe pas** (dépôt sans
  prereg), les flags redeviennent optionnels par code (un `--prereg-sha` fourni avec `--prereg-file` absent reste un
  **refus nommé** « does not exist », jamais un ENOENT nu).

### Preuve (tuyaux + tests, au commit du lot au pli)

- Tests (`apps/sentinel/test/ukemi-record-guard-binding.test.ts`) :
  `ukemi_record_a_correct_prereg_and_labeler_sha_cross_both_guards` (contrôle positif : sha LF vrais ⇒ gardes
  franchies, erreur suivante = quorum, 0 fetch) ; `ukemi_record_prereg_and_labeler_sha_are_mandatory_once_the_prereg_file_exists`
  (fichier existant + flags absents ⇒ refus nommé, 0 ledger ; `--no-prereg-binding` lève l'exigence).
- Provenance (`apps/sentinel/test/ukemi-guard-record.test.ts`, `ukemi_record_then_unlock_then_reconcile_end_to_end`) :
  `provenance.params.prereg_binding == "none"` sur le chemin par défaut (prereg absent).
- Mutants nommés ROUGES (harnais du pli, rejoué hors dépôt) : `prereg-guard-always-refuses`, `labeler-guard-always-refuses`,
  `flags-absent-accepted`, `no-prereg-binding-parse-ignored`, `prereg-binding-not-recorded` (tous tués + restaurés byte-exact).

Provenance de l'amendement : worker `claude-opus-4-8[1m]` effort max, 2026-09-22 ; source du ruling
`docs/CHANTIERS.md:677` ; réviseur en amont = orchestrateur (R-21). Aucun `.mjs`/`.ts` du gel D4 modifié : les 9 sha LF
de l'ADR §3 vérifiés byte-identiques avant/après le pli.

## Amendement 2026-09-22 (ruling QF-2 + pli checkpoint-2, lot U-4b-1b-1) — re-gel du labeler paramétré (gel déféré levé)

> **Insertion dans `docs/adr/ADR-U4b-calibration-episode-frais.md` par l'orchestrateur `claude-fable-5-1` SEUL**
> (R-20). Réviseur = orchestrateur (R-21). **Provenance** : worker `claude-opus-4-8[1m]` (préfixe conforme, effort
> max ; Opus 5 banni), 2026-09-22. Worktree `F:\Monark-wt-u4b1b1` (`lot/u4b-1b-1`), base du pli **`2cbdea2`** (le
> commit G1 du lot ; fork de `a56e739`). Aucun commit, aucun réseau, aucun workflow.
> **Autorité** : ruling QF-2 (`docs/CHANTIERS.md`, option alpha — le paramétrage fusionne AVANT le commit du
> prereg) + **pli checkpoint-2** (`docs/CHECKPOINT2-lot-u4b-1b-1.md`, ACCEPTE-AVEC-CORRECTIONS ; liste (B) C-6/C-7
> **par code** RETENUE dans `docs/CHANTIERS.md`). QF-2 EST un re-gel : le blob que la course lie est gelé par le
> prereg committé (le gel a lieu avant que la donnée fraîche existe — propre).
> **A-6 (« ADR du gel intact ») est LEVÉE pour CE lot** par QF-2 (re-gel du **labeler, gel déféré**, ADR §3 ligne
> « — », `755b3a38…`). Corps D1..D5 et amendements 2026-09-21 / 2026-09-22 (déc. 126, U-4b-2a) **byte-identiques** ;
> le tableau AVANT/APRÈS ci-dessous prouve que **seul le sha du labeler bouge**.

### 1. Objet du lot (précondition -1b, §Y / §5c-d, condition (i-a) ; + gardes de course par code, pli checkpoint-2)
Le labeler `scripts/census/u3-realized.mjs` portait l'épisode e2/e1/e3 **en dur** (`EVENTS :73-77`, `RAWLOGS_SHA
:43`, chemin prereg `:405-408`) et une **lecture de clé au SCOPE MODULE** (`ENV_ARCHIVE = process.env.CHAINSTACK_ETH_URL
:273`, plus `process.env.U3_MIN_INTERVAL_MS :282`). Le lot :
1. **Paramètre la SECTION LIVE** (défauts = valeurs e2) : `--events <json>` (défaut `EVENTS`), `--rawlogs-sha <sha>`
   (défaut `RAWLOGS_SHA`), `--rawlogs <path>`, `--episode-tag`, `--prereg-file <path>`, `--operators <liste>`,
   `--min-interval-ms`.
2. **Supprime toute lecture d'env au scope module.** `--archive-operator <label>` OPTIONNEL, résolu **uniquement
   dans `@monark/rpc-guard`** (`openGuardedClient`, import dynamique du chemin payant ; réutilise
   `scripts/census/u4-guard.mjs`) : le script ne lit **ni URL ni clé**. **KEYLESS-ONLY par défaut** (CARTO-T1-1) ;
   un opérateur **payant** (`chainstack`/`helius`, **et variantes de casse** `Chainstack`/`HELIUS`) est **refusé
   fail-closed (0 fetch)** sans `--allow-paid`. `process.env` n'apparaît **qu'une fois** (injection
   `main({ env: process.env, argv: process.argv.slice(2) })`).
3. **Condition (i-a) : NON déclenchée.** Le **réducteur PUR** (`:81-267`) reste **byte-identique** — **aucun 9ᵉ sha
   gelé requis**. Tranche `sed -n '/^\/\/ PURE REDUCER (exported/,/^\/\/ LIVE PULL (run-guarded/p' | tr -d '\r' |
   sha256sum` = **`1c7574acd325ab75e6760f50d6743e3d9d39cd5565abbf3d497d4884317a6ada`** sur `git show a56e739:…` ET
   sur le fichier livré.
4. **Gardes de COURSE par CODE (pli checkpoint-2, liste (B), CA-9 : plus de garde par prompt)** :
   - **C-6** — `--out` et `--raws-dir` sont **OBLIGATOIRES sans défaut** ; un `--out`/`--raws-dir` résolu **sous
     `apps/sentinel/test/fixtures/`** est **refusé fail-closed** (l'ancien défaut écrasait les 4 séries pinnées, P14 ;
     l'ancien `--raws-dir` appendait au raws e2).
   - **C-7** — `EXCLUDED_OPERATORS = ["1rpc.io"]` **retiré du pool keyless par défaut** ET un `--operators` qui le
     nomme est **refusé fail-closed** (le code contredisait son en-tête L-6, `:2-4` : 1rpc dans un `eth_getLogs`
     lourd). `meta.providers` est un jeu de labels, pas un pin.

### 2. Invariant behavioural (§Y ligne 88) et preuve d'égalité par `main()` (C-1, CA-11 durci)
- `u4b_labels_replay` : `parseArgs([]).events` / `.rawlogsSha` = les valeurs e2 (comparées à un LITÉRAL) ; et
  `reduceU3(U3-inputs)` reproduit `U3-realized.jsonl` byte-identique (sha LF `b4d93590…`).
- **`u4b_labels_replay_via_main_real_artifact` (C-1)** : rejoue le VRAI `main()` sur le **brut A-rawlogs réel**
  (`docs/census-2026-09-18/data/A-rawlogs.jsonl`, gitignoré) + une COPIE du raws pinné `0afaf605…`, `--rawlogs-sha`
  et `--events` **par défaut**, `globalThis.fetch` bouchonné répondant au SEUL `eth_getBlockByNumber ["finalized"]`
  (bloc `26015906`) ⇒ `U3-realized.jsonl` LF **`b4d93590…`** et **2 fetch** (cache-replay complet). SKIP NOMMÉ si
  les bruts hors dépôt sont absents.

### 3. D4 — re-gel : tableau des sha AVANT / APRÈS (recompute LF, worktree base `a56e739`)
Seul le sha du **labeler** bouge ; les 8 gelés + `calib-digest.ts` restent **byte-identiques** (recompute
base(`a56e739`) == livré, fichier par fichier).

| # | Fichier gelé | AVANT (LF sha256) | APRÈS (LF sha256) | État |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f6…f51445c0` | idem | inchangé |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd3…57a6fac0` | idem | inchangé |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb…2a1fbc31a3` | idem | inchangé |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc…e4de2322` | idem | inchangé |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb08…c1ab2d66` | idem | inchangé |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df91…8164ffa3` | idem | inchangé |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519…c1c65ca0` | idem | inchangé |
| 8 | `packages/contracts/src/calib-digest.ts` (contracts_frozen) | `3603265d…94c42380` | idem | inchangé |
| 9 | `scripts/census/u3-realized.mjs` (**labeler ; gel déféré LEVÉ**) | `755b3a38…618db2de4` | `cb020425…a205b41a1af` | **RE-GELÉ (QF-2)** |

Valeurs complètes du sha re-gelé (à recomputer au commit réel — **ÉCART = STOP**) :
```
AVANT  755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4  u3-realized.mjs
APRES  cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af  u3-realized.mjs
```
Co-édités hors gel (non listés au §2) : `scripts/census/u3-realized.d.mts` `98f07672…` → `73030a72…` (surface de
types) ; `test/u3-realized-param.test.ts` (gouvernance, non exporté).

### 4. Ligne de commande FIGÉE du labeler pour le prereg §5c/§5d (KEYLESS-ONLY, CARTO-T1-1 ; gardes C-6/C-7 par CODE)
```
env -u CHAINSTACK_ETH_URL \                               # ceinture keyless-only (CARTO-T1-1)
  node scripts/census/u3-realized.mjs \
  --events      <episode FRAIS .json — [{id,collateral,clusterLo,clusterHi,preV33}] hors dépôt> \
  --rawlogs     <A-rawlogs.jsonl de l'épisode FRAIS — hors dépôt> \
  --rawlogs-sha <sha256 BRUT du fichier ci-dessus — épinglé> \
  --prereg-file docs/PLAN-u4b-prereg.md \                 # RULING (3) : lie les labels frais au prereg -1b (fixé)
  --prereg-sha  <sha256 LF de docs/PLAN-u4b-prereg.md> \
  --operators   drpc.org,mevblocker.io,pocket.network,publicnode.com,blxrbdn.com \  # 1rpc.io EXCLU par code (C-7)
  --out         <dossier FRAIS HORS DÉPÔT> \              # OBLIGATOIRE par code (C-6) ; sous fixtures/ => refus
  --raws-dir    <bruts concordants HORS DÉPÔT> \          # OBLIGATOIRE par code (C-6)
  --episode-tag <tag de l'épisode frais> \
  --max-calls   <budget fail-closed>
```
- **`--archive-operator` ABSENT** pendant la course (keyless-only servi). La jambe payante n'existe que via
  `--archive-operator chainstack --allow-paid` + budget gardé (`--ledger-dir`/`--cycle`/`--floor`/`--max-ru`/
  `--method-caps`), refusée fail-closed sinon ; `meta.archive_operator`/`meta.allow_paid` écrits à la provenance.
- **Plus de footgun `--out` / de décision `--prereg-file`** : le ruling (3) a fixé `--prereg-file` à
  `docs/PLAN-u4b-prereg.md` et C-6 a rendu `--out`/`--raws-dir` obligatoires par code (P14 fermé). `--only` n'est
  pas utilisé par la course.
- **Correction prereg §5d** (C-9, propriétaire orchestrateur) : la note « sondes d'env `:273/:282` » est **PÉRIMÉE**
  (ces sondes n'existent plus) ; la ligne figée du prereg doit être réécrite depuis ce §4 (flags réels + rulings
  (1)-(4)), sans `--prereg-sha 835805cc…` (prereg U-3) ni `--only`.

### 5. Tuyaux (F-1), gardes de course, et résidus formés (à déclencheur)
- **Tuyaux** : entrée = `--events`/`--rawlogs` (produits par le discover + le réducteur de sélection d'épisode, §5b) ;
  sortie = `--out/U3-realized.jsonl` FRAIS, consommé par `u4b-reduce --labels` (§5d, CLI réel `u4b-reduce.mjs:10-11,31`) ;
  état = bruts concordants au `--raws-dir` (hors dépôt) ; **gardes** = C-6 (`--out`/`--raws-dir` obligatoires, hors
  fixtures) + C-7 (1rpc.io exclu) **par code** ; test de composition depuis l'artefact RÉEL = `u4b_labels_replay_via_main_real_artifact`.
- **Résidu R-1 (drift)** : `KEYLESS_WITNESS_LABELS` (garde payant défense-en-profondeur) duplique le jeu keyless de
  `@monark/rpc-guard` (`transport.ts` `KEYLESS_ETH`/labels). **Déclencheur : première course figée** ⇒ resynchroniser
  + test hôte. **Sévérité bornée** : `isPaidOperator = !KEYLESS_WITNESS_LABELS.has(label)` ⇒ tout label ABSENT du jeu
  est traité PAYANT (refusé sans `--allow-paid`) — prouvé même pour les variantes de casse (`Chainstack`/`HELIUS`, test
  C-3). Donc un drift = **sur-refus d'un témoin keyless**, JAMAIS l'admission fail-open d'un payant. (Mesuré checkpoint-2 :
  le jeu ne contient ni `publicnode.com`, ni `blxrbdn.com`, ni `1rpc.io` ; sans effet, car la résolution passe par
  `openGuardedClient`.)
- **Résidu R-2 (garde de quorum)** : `CALL_LEGS.length < 2` compte les JAMBES, pas les `providerOf` DISTINCTS
  (`--operators publicnode.com` = 2 URL / 1 op passe la garde puis échoue `no_quorum` après 1 fetch — refus tardif,
  non silencieux, mesuré P11). **Déclencheur : première course figée** ⇒ durcir en compte d'`op` distincts.

# Amendement daté 2026-09-22 (lot U-4b-1b-2) — réducteur de SÉLECTION d'épisode, prober D_e paramétré, discover schéma v2 — À INSÉRER dans `docs/adr/ADR-U4b-calibration-episode-frais.md` par l'orchestrateur `claude-fable-5-1` SEUL (R-20)

> **Provenance.** Rédaction : worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni),
> 2026-09-22, worktree `F:\Monark-wt-u4b1b2` (`lot/u4b-1b-2`), base `lot/etude-suite` @ `e60ea07`. Aucun commit, aucun
> réseau, aucun workflow. Réviseur = orchestrateur (vérification adversariale R-21). **Autorité** : décision 128 Q-D
> (item « réducteur de SÉLECTION » + « paramétrage du prober D_e »), + course-corrections orchestrateur du 2026-09-22
> (Livrable C discover ; checkpoint-1 C-1..C-9). **Les 9 sha gelés (§2) sont byte-identiques avant/après** (recompute
> ci-dessous) — ce lot ne touche AUCUN fichier du gel D4.

## 1. Objet (résout Q-D partiellement ouvert dans le prereg §7 « Préconditions de COURSE »)

Trois pièces, toutes **hors gel** :
- **A — `scripts/census/u4b/u4b-select-episode.mjs` (+ `.d.mts`)** : le réducteur de SÉLECTION AVAL. Applique la RÈGLE
  pré-enregistrée §DISC:31 (exclusion e2), :34-40 (clustering via la fonction PURE `clusterWethLiquidations`), :42-46
  (éligibilité), :49-50 (argmin + tie-break) sur le **brut de découverte**, et écrit `episode-selection.json` +
  `A-rawlogs-<episode_id>.jsonl`. **HORS LIGNE** (0 réseau) ; `version_ok` est une sous-commande gardée séparée.
- **B — `scripts/census/u4-oracle-path.mjs`** : le prober D_e, **paramétré par `--episode-file`** ; les constantes e2
  en dur (`B0`/`BLAST`/`USDT_BLOCKS`/`EMODE_CATEGORIES`) sont **SUPPRIMÉES** ; `--feed-proxy` conserve son défaut §DISC:28.
- **C — `scripts/census/u4b/u4b-discover.mjs`** : schéma **v2** (course FATAL 2026-09-22) — le brut est écrit AVANT le
  témoin, porte `block_ts`, et `blockAt` passe par `--block-operators` (pool sans pocket, qui élague les en-têtes anciens).

## 2. TUYAUX (ADR-M018 ; règle de Branchement) — à ajouter à la table Tuyaux de l'ADR-U4b

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test |
|---|---|---|---|---|
| discover brut v2 | `u4b-discover.mjs` (getLogs + `block_ts` de `blockAt`, gardé keyless) | `--discover` du réducteur A / du `--fill-ts` | `upcoming` jusqu'à la 1ʳᵉ course servie | `u4b_discover_over_a_log_fixture_is_deterministic`, `u4b_discover_writes_the_brut_even_when_the_witness_clustering_fails`, `u4b_discover_getlogs_only_brut_is_durable_before_the_witness` (C-V-3), `u4b_discover_refuses_fewer_than_2_distinct_block_operators` (H-2) |
| block-ts extra (C-2) | `u4b-select-episode.mjs --fill-ts` (blockAt quorum-2 keyless gardé, pocket-free) | `block-ts-extra.json` (sha-lié) → `--block-ts-extra` du réducteur A | `upcoming` | `u4b_chain_e2_adjacent_missing_ts_resolved_by_fill_ts`, `u4b_select_refuses_a_tampered_block_ts_extra_sidecar` |
| sélection d'épisode | réducteur A (`u4b-select-episode.mjs`) sur le brut v2 (+ `--block-ts-extra` optionnel) | `episode.B0` → `--block` du recorder (§5a) ; `events-<id>.json` (tableau) → `--events` du labeler (§5d) ; `episode.{B0,B_last}` + `selection_sha256` → `--episode-file` du prober B ; `rawlogs_sha256` + `A-rawlogs-<id>.jsonl` → `--rawlogs`/`--rawlogs-sha` du labeler | `upcoming` (consommé par le test de chaîne réel + la course) | `u4b_episode_selection_is_deterministic`, `u4b_select_events_compose_with_the_labeler_parseArgs_and_predicate` (C-2/C-4), `u4b_select_writes_A_rawlogs_with_a_matching_raw_sha256` (C-3), `u4b_chain_discover_to_select_far_from_e2` (C-4) |
| version d'épisode (H-1) | `u4b-select-episode.mjs --check-version` (1 `eth_getStorageAt` EIP-1967 quorum-2 keyless, gardé) | `version_check` écrit dans `episode-selection.json` (selection_sha256 INCHANGÉ) | `upcoming` | `u4b_check_version_true_on_v350_and_leaves_selection_sha_unchanged`, `u4b_check_version_false_stops_H1_unless_neutral_ref` |
| chemin D_e frais | prober B (`u4-oracle-path.mjs --episode-file`) | `U4-oracle-path-<tag>.raw.json` → `u4b-reduce --oracle-raw` (§5e) | `upcoming` | `u4b_oracle_path_composes_real_form_bodies_and_reads_episode_bornes` (A-8), `u4b_oracle_path_unions_both_aggregators_on_phase_change`, `u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data` |

Le **test d'intégration non-LLM de bout en bout COMMITTÉ** (règle de Branchement, C-V-4) est `apps/sentinel/test/u4b-chain.test.ts` :
la sortie RÉELLE de `runDiscover` (fetch bouchonné, pool gardé réel) → `runSelect` : (a) loin de e2 ⇒ succès 0-fetch dans le
sélecteur ; (b) un cluster dont la fenêtre 24 h chevauche la borne haute de e2 ⇒ le sélecteur REFUSE nommément, `--fill-ts`
(keyless quorum-2) écrit `block-ts-extra.json`, puis `runSelect --block-ts-extra` SUCCÈDE (0 fetch). La composition C-2 se
lit sur le fichier `events-<id>.json` réel via `parseArgs(--events)` du labeler + un **calque** (réimplémenté, non importé)
de son prédicat `:548`. Aucune pièce n'est `built` avant la première course rapprochée (D-3).

## 3. Schéma du brut de discover v2 (C-1) + écriture DURABLE (C-V-3) + résolution du ts manquant (C-V-2)

`u4b-discover.mjs` (schéma `ukemi-u4b-discover/2`) écrit le brut **DEUX fois** avec un champ `phase` (C-V-3, option a) :
d'abord **`phase:"getlogs-only"`** (`records` décodés + `block_ts:{}`), **DURABLE, avant tout `blockAt`** — un kill dur
pendant les sondes de ts garde les ~650 getLogs ; puis réécrit **`phase:"complete"`** avec `block_ts:{<bloc>:<ts>}` =
**chaque `eth_getBlockByNumber`** lu par le témoin, **`brut_sha256` recomputé à CHAQUE écriture**. Le clustering témoin
est best-effort : en échec, `clusters:null` + `cluster_error` (URL-scrubbée), **sort 0** — le brut est la pièce, le témoin
est consultatif (prereg §5b). `blockAt` passe par **`--block-operators`** (liste keyless explicite, ≥ 2 opérateurs
DISTINCTS par `operatorOf`, fail-closed — H-2 ; sans pocket qui élague : mesuré « blocks are available from block 25771356 »
pour un accès à 22849534).

**C-2 (résolution du ts manquant — cul-de-sac fermé, phrase §3 corrigée).** Le réducteur A lit `tsOf` de `block_ts` puis
du sidecar `block_ts_extra` (0 réseau). **Correction de la phrase précédente « l'épisode frais est loin de e2 donc
`block_ts` le couvre » : INEXACTE** — le refus frappe **TOUT** cluster dont le départ change une fois e2 retiré, pas le
seul gagnant ; le témoin clusterise l'ensemble COMPLET, le sélecteur l'ensemble e2-EXCLU, donc un cluster e2-adjacent
(prereg §Y : 29 WETH dans `(23552238, 23557060]`) sonde des blocs jamais lus, et le décalage peut cascader. Le refus n'est
donc PAS l'exception : il a un **chemin de code de résolution** — la sous-commande GARDÉE **`--fill-ts`** (quorum-2 keyless,
`--operators` pocket-free, budget/ledger/cycle requis) re-clusterise avec un `tsOf` PARESSEUX à réseau qui récupère
**exactement** les blocs manquants (dans le bon ordre : chaque ts réel corrige la recherche binaire) et écrit le sidecar
**`block-ts-extra.json`** sha-lié (`block_ts_extra_sha256`, `discover_sha` lié au brut). Le passage hors ligne accepte
**`--block-ts-extra <sidecar>`** (vérifie les deux sha, 0 réseau) et écrit `block_ts_extra_sha256` dans
`episode-selection.json` (chaîne sha-liée). **Critère (validateur, cas b) VERT** : `u4b_chain_e2_adjacent_missing_ts_resolved_by_fill_ts`.
Si `--fill-ts` n'a pas encore tourné, le sélecteur refuse NOMMÉment en pointant vers `--fill-ts` — jamais un appel réseau
dans le sélecteur.

## 4. Ligne de commande FIGÉE (pour le prereg §5 — item formé, propriétaire orchestrateur)

Le prereg lui-même n'est PAS modifié par le worker (R-20). **Item formé « prereg §5b-bis / §5a `--block` / §5e `<tag>`
alimentés par `episode-selection.json` »**, propriétaire orchestrateur, déclencheur « avant la course » :

```
# (5b) discover — schéma v2, block_ts, --block-operators (ledger IMBRIQUÉ : --ledger-dir F:\monark-ledger --cycle <cycle>
#      crée <ledger-dir>\<cycle>\ ; le prereg §5b « <F:\monark-ledger\<cycle>\> » est l'imbriqué, à désambiguïser)
node scripts/census/u4b/u4b-discover.mjs --from-block 22803459 --to-block <finalized-64> --event-id weth-discover-<date> \
  --operators drpc.org,mevblocker.io,tenderly.co,pocket.network \
  --block-operators drpc.org,mevblocker.io,tenderly.co \                 # C-2 : blockAt sans pocket (élagage)
  --ledger-dir F:\monark-ledger --cycle <cycle> --max-calls <n> --out <hors dépôt>

# (5b-bis) réducteur de sélection (HORS LIGNE, 0 réseau ; --block-ts-extra si --fill-ts a tourné, cf. 5b-fill)
node scripts/census/u4b/u4b-select-episode.mjs --discover <brut v2> \
  --prereg-file docs/PLAN-u4b-prereg.md --prereg-sha <LF sha> --out <dir hors dépôt> \
  [--n-min 50] [--e2-window 23545088,23557060] [--b-hi <to_block du brut>] [--block-ts-extra <sidecar 5b-fill>]
#   -> <out>/episode-selection.json  (episode.B0 -> §5a --block ; events_file -> §5d --events ; rawlogs_sha256 -> §5d --rawlogs-sha ; block_ts_extra_sha256 si sidecar)
#   -> <out>/events-<episode_id>.json  (le TABLEAU, C-V-4, consommé DIRECTEMENT par le labeler --events)
#   -> <out>/A-rawlogs-<episode_id>.jsonl  (§5d --rawlogs)

# (5b-fill) OPTIONNEL — SI 5b-bis refuse « brut has no ts for block N » (C-2, cluster e2-adjacent) : fill-ts gardé
node scripts/census/u4b/u4b-select-episode.mjs --fill-ts --discover <brut v2> --out <dir hors dépôt> \
  --operators drpc.org,mevblocker.io,tenderly.co --ledger-dir F:\monark-ledger --cycle <cycle> \
  --max-calls <n> --method-caps '{"eth_getBlockByNumber":<cap>}'
#   -> <out>/block-ts-extra.json (sha-lié) ; re-lancer 5b-bis avec --block-ts-extra <ce fichier> (0 réseau)

# (5b-ter) contrôle de version (H-1, gardé keyless quorum-2, 1 eth_getStorageAt EIP-1967)
node scripts/census/u4b/u4b-select-episode.mjs --check-version --episode-file <out>/episode-selection.json \
  --operators drpc.org,mevblocker.io,tenderly.co --ledger-dir F:\monark-ledger --cycle <cycle> \
  --max-calls <n> --method-caps '{"eth_getStorageAt":<cap>}' [--version-neutral-ref <doc si impl != v3.5.0 et diff [lu] NEUTRE>]
#   version_ok=false SANS --version-neutral-ref => STOP H-1 (PR-U4-3-bis), JAMAIS d'avance silencieuse (C-5)

# (prober D_e) paramétré par --episode-file (§DISC:28 feed-proxy conservé)
node scripts/census/u4-oracle-path.mjs --episode-file <out>/episode-selection.json \
  --prereg-file docs/PLAN-u4b-prereg.md --prereg-sha <LF sha> \
  [--feed-proxy 0x5424384b256154046e9667ddfaaa5e550145215e] \           # DÉFAUT §DISC:28 (feed_proxy_source en provenance)
  [--usdt-blocks <b1,b2>] --emode-categories <liste> | --book <U4-book> \
  --raws-dir <hors dépôt> --ledger-dir F:\monark-ledger --cycle <cycle> --floor <F> --max-ru <R> --max-calls <n> --method-caps '{...}'
#   --usdt-blocks ABSENT => usdt_prices {} + usdt_blocks_status "omitted" (C-7 ; blocs dérivables par
#   usdtBlocksFromLabelerDeficit(U3-deficit.jsonl) — helper pur exporté ; ORDRE labeler -> prober, D-n déclarée)
```

## 5. Déviations D-n déclarées (F-3)

- **D-n (C-1)** : le brut v2 porte `block_ts` (nouveau champ vs le brut v1 du prereg §5b) ; la fixture des tests du
  réducteur est « forme réelle + `block_ts` » (le champ que le témoin de discover persiste). Un `block_ts` manquant est
  résolu par `--fill-ts` (C-2) ou, à défaut, refusé NOMMÉment — jamais de réseau dans le passage hors ligne.
- **D-n (C-V-3, durable write)** : le brut est écrit `phase:"getlogs-only"` PUIS `phase:"complete"` ; `phase` entre dans
  `brut_sha256`. Le message de commit PR-C et l'ADR §3 sont alignés sur ce code (« écrit avant le témoin » est désormais
  VRAI : la 1ʳᵉ écriture précède tout `blockAt`).
- **D-n (C-V-4, events file)** : le sélecteur écrit `events-<id>.json` (le TABLEAU) en plus de `episode-selection.json`
  (un OBJET) ; seul le tableau est consommable par `parseEventsFile` du labeler. `events_file` référence le fichier.
- **D-n (C-V-7, --out hors dépôt)** : `assertOutDir` refuse désormais tout `--out` sous la racine du dépôt (comme le
  `--raws-dir` du prober), en plus du refus spécifique sous `apps/sentinel/test/fixtures/`.
- **D-n (C-7 / ordre de course)** : le prober `--usdt-blocks` est dérivé des lignes `deficit_base_no_price` USDT de
  `U3-realized.jsonl`/`U3-deficit.jsonl` (helper pur `usdtBlocksFromLabelerDeficit`) ⇒ le **labeler tourne AVANT le prober**.
  À inscrire au prereg §5 (propriétaire orchestrateur).
- **D-4 (prober)** : les sha de référence de `u4_oracle_path…` (`test/guard-scripts-u4.test.ts` `REF.ORACLE_RAW`/
  `ORACLE_INPUTS`) sont **re-baselinés** (le prober paramétré porte une provenance enrichie : `episode_id`,
  `selection_sha256`, `prereg_file`, `feed_proxy_source`, `usdt_blocks_status` ; `prereg_sha` = U-4b) ; les DONNÉES D_e
  (aggregator, updates, usdt, emode) restent byte-identiques (vecteur inline dans le test).
- **§DISC:50 tie-break** : « address min » (non spécifié au prereg) lu comme « min du `user` liquidé minuscule du cluster » ;
  déclaré. Le tie-break est **inatteignable par construction** (le clustering glouton rend `B_first` strictement croissant) ;
  implémenté (pré-enregistré) et testé directement comme comparateur défensif.
- **`residual_outside_window` = INVARIANT, pas un compteur mesuré** : §DISC:40 le définit comme les records d'un cluster
  hors `[B_first, B_last]` ; le clustering glouton assigne CHAQUE record WETH ⇒ **structurellement 0**. L'assertion `=== 0`
  est un **garde-fou de régression** (une future ré-implémentation NON gloutonne le ferait rougir), PAS une preuve (D-2).
  Les compteurs réellement mesurés = `n_excluded_e2`, `window_truncated`, `n_eligible`, `candidates`.

## 6. MAST résiduel (C-9)

- **Dérive de format de sortie** (le tuyau `episode-selection.json` porte plusieurs consommateurs aux contrats distincts :
  labeler `--events`, prober `--episode-file`, recorder `--block`) — contré par : (a) le test de composition C-2
  (`parseArgs(--events)` réel + prédicat `:548`) ; (b) `selection_sha256` calculé sur le fichier HORS
  `version_check`/`selection_sha256` (C-5), vérifié par le prober (0 fetch au refus) ; (c) `rawlogs_sha256` = sha RAW des
  octets d'`A-rawlogs`, tel que le labeler le vérifie (`update(rawBuf)`).
- **Vérification non indépendante** — contré par : la parité `canon`/`sha256Hex` entre `liquidation-logs.mjs` (producteur)
  et `u4-guard.mjs` (vérificateur allowlist-borné du prober) est **épinglée octet-à-octet** par
  `u4guard_canon_matches_liquidation_logs_canon` ; C-4 asserte `B_last` réducteur == recalcul labeler sur les mêmes ts.
- **Sélection sur l'issue** — contré par : le réducteur est HORS LIGNE et déterministe depuis `(prereg_sha, brut)` ;
  `version_ok` est post-hoc et fail-closed (false ⇒ STOP, jamais d'avance vers un « meilleur » candidat).

## 7. Recompute des 9 sha gelés (§2) — byte-identiques avant/après (régime B, `git show HEAD:… | tr -d '\r' | sha256sum`)

```
2f9a31f6…f51445c0  scripts/census/u4b/u4b-scores.mjs
a5e66cd3…57a6fac0  scripts/census/u4b/u4b-reduce.mjs
5733daeb…2a1fbc31a3 scripts/record-u4b-calib.mjs
7bee76fc…e4de2322  apps/sentinel/src/ukemi/wadray.ts
3376eb08…c1ab2d66  apps/sentinel/src/ukemi/abi.ts
9206df91…8164ffa3  packages/hikae/src/l1-split.ts
0e232519…c1c65ca0  apps/sentinel/src/rpc.ts
3603265d…94c42380  packages/contracts/src/calib-digest.ts
cb020425…a205b41a1af scripts/census/u3-realized.mjs   (labeler)
```
Concordent tous avec le prereg §2. AUCUN ÉCART. Les 3 fichiers touchés (`u4b-discover.mjs`, `u4-oracle-path.mjs`,
`u4-guard.mjs`) sont HORS gel ; `u4-guard.mjs` gagne `canon`/`sha256Hex` (copie byte-identique de `liquidation-logs.mjs`,
parité testée).

## Amendement daté 2026-09-22 (UKEMI-RETRY-1 — `NonJsonBody@200` transitoire dans le recorder ; calque BELL-RETRY-1)

> Cet amendement fixe, date et rend traçable la modification du **classifieur de retry du recorder**
> `apps/sentinel/src/ukemi/record.ts` (le shim `call`), **PRÉCONDITION du départ de la course Ukemi** (jamais « 1re
> occurrence »). Il naît de **R-BR2** (BELL-RETRY-1 checkpoint-2 §4 ; ruling orchestrateur 2026-09-22 15:42 UTC C-3,
> `docs/CHANTIERS.md`) : le recorder portait le MÊME prédicat que Bell **sans** la clause `NonJsonBody`
> (`record.ts:322-323` l'excluait). Provenance : worker `claude-opus-4-8[1m]`, effort max ; aucun commit (R-20) ;
> `error_origin` : plan (classe d'erreur non qualifiée à la conception du retry du recorder).

**Décision (D-n).** Un `NonJsonBody` (HTTP 200 + corps non-JSON, page HTML de passerelle ; fait de transport [lu]
`packages/rpc-guard/src/transport.ts:241` `raise(op,"NonJsonBody",res.status,text)` ⇒ `.code = res.status`,
atteignable **seulement sur un 2xx** : `:229` `!ok`→HttpError, `:228` 3xx→RedirectBlocked, AVANT `JSON.parse`) de
**code 200/429/≥500** est désormais **TRANSITOIRE** (retry borné EXISTANT du recorder — shim `call`, `args.retries`
défaut 2, backoff `backoffMs`/`backoffCapMs` ; R retries ⇒ R+1 `client.call` ⇒ R+1 lignes write-ahead ledger + R+1
tally) ; **2xx≠200 (201/204) et 4xx≠429 (400/404) restent FATALS** ; libellé de diag
`rpc_errors[].message = "non-json <code>"` (message SEUL, pas de champ `http` : `RpcErrorRecord` réserve `http` à une
réponse non-2xx, et un `NonJsonBody` est un 2xx). **Calque exact de BELL-RETRY-1** (`apps/bell/src/quorum.ts`
`isTransient`/`statusOf`). Les branches 429/≥500 sont **DÉFENSIVES** (via ce transport un `NonJsonBody` ne porte qu'un 2xx).

### 1. `record.ts` est HORS gel — le prédicat est modifié AVANT la course (licite)
- **Fait discriminant confirmé** [lu] : ce même ADR §3 (contrainte d'ordre NARABI-OPS-1d) dit verbatim
  « `record.ts` / `rpc2.ts` sont **hors** du gel (en aval du jeu gelé) » ; et le **prereg §2** (les 8 sha gelés +
  labeler) NE liste PAS `record.ts`. Trois confirmations indépendantes (prereg §2 ; BELL-RETRY-1 G1 §6 ; ce §3).
- Modifier `record.ts` AVANT la course ne rompt donc AUCUN gel. Les 9 sha gelés sont **byte-identiques
  AVANT==APRÈS** (recompute LF par le worker) et concordent au prereg §2 : `u4b-scores 2f9a31f6…`,
  `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…`, `wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`,
  **`rpc.ts 0e232519…` INTOUCHÉ**, `calib-digest 3603265d…`, labeler `u3-realized cb020425…`.

### 2. prereg §5a INCHANGÉ dans son contenu (note explicite exigée par la mission)
- La ligne de commande FIGÉE du recorder (prereg §5a) est **inchangée dans son CONTENU** : `--prereg-sha` lie
  `docs/PLAN-u4b-prereg.md`, `--labeler-sha` lie `scripts/census/u3-realized.mjs` ; **NI l'un NI l'autre ne lie le
  contenu de `record.ts`** (aucun `--record-sha` n'existe). Les deux liaisons sont donc **INTACTES**.
- Le diff sur `record.ts` est **+10 lignes nettes** (17 ajoutées, 7 retirées), inséré autour du shim `call`
  (`record.ts:322-356`). Les **annotations de numéro de ligne** de §5a qui pointent APRÈS l'insertion (p.ex.
  `:384-414`, `:403`, `:432`, `:466-467`, `:470`, `:489`) **dérivent de +10** ; celles AVANT l'insertion (`:239`,
  `:247`, `:266-271`, `:297-298`) sont **inchangées**. Cette dérive est **attendue** (record.ts hors gel, modifié
  avant la course) et **sans effet sur les flags/valeurs figés** de la commande §5a.
- La provenance `ukemi_sha` (`record.ts:102-107`, sha sur `ukemi/**.ts`) **change** ; elle est **HORS du
  `book_digest`** (en-tête ADR-U1 : « Provenance … is OUTSIDE the digest ») ⇒ le `book_digest` de la course est
  **inaffecté** par ce lot.

### 3. Tuyaux (règle de Branchement) et coût
- **Entrée** : un `NonJsonBody@200` levé par le transport gardé pendant un read du recorder (quorum-2 `rpc2.ts`).
- **Sortie** : le retry borné de l'appelant ré-émet le `client.call` (R+1 lignes write-ahead ledger + R+1 tally) ;
  la faute est métrée dans `rpc_errors` en `non-json <code>` (chemin succès et diag).
- **État** : le ledger durable par-opérateur/cycle (hors dépôt) + le JSON de run / `<out>.diag.json` (`rpc_errors`).
- **Test de composition (non-LLM, chemin SERVI)** : `ukemi_record_nonjsonbody_200_gateway_html_is_retried_and_metered`
  (VRAI `openGuardedClient`, seul `globalThis.fetch` bouchonné) — 1re réponse = HTML de passerelle à 200 ⇒ retry ⇒
  2e = JSON ⇒ la course CONTINUE, `book_digest` = PIN, `rpc_errors` = un `non-json 200`. Matrice de prédicat +
  épuisement borné : `ukemi_record_nonjsonbody_transient_matrix`, `ukemi_record_nonjsonbody_200_exhausts_bounded_and_journals`.
- **Coût** (calque Bell §4 pt 2) : un retry sur la jambe payante (chainstack) coûte +1 appel métré (RU), borné
  ×(R+1)/read par `--retries` ; `BudgetExceededError` **jamais** retenté (fatal d'abord) ; sous-plafonds enshrined
  (`--max-ru`/`--max-calls`) tenus.
- **`errors_by_operator` (D-4, monitor 5%-rule) — changement de sémantique CONSIGNÉ** (calque Bell checkpoint-2 C-4
  pt 3) : le hook transport (`record.ts:318` ← `transport.ts:177`) incrémente `errByOp` à CHAQUE faute levée ⇒ un
  `NonJsonBody@200` retenté l'incrémente jusqu'à R+1 fois (au lieu de 1-puis-bench). Même convention que 429/503, mais
  un CHANGEMENT pour cette classe. `errByOp` est **affichage/provenance/diag SEUL** ([lu] `record.ts` : aucune
  garde/`throw`/`if` dessus — `:399`/`:488` stderr, `:414`/`:443` provenance, `:474` diag), **PAS une garde-code** ⇒
  effet borné. **Consigne** : toute lecture 5%-rule enjambant la fusion UKEMI-RETRY-1 lit ce changement de sémantique.

### 4. Mécanique du STOP (honnêteté vs « STOPperait à l'identique »)
- Contrairement au chemin Bell **lecture unique** `withRetry` (où un `NonJsonBody@200` persistant rejetait
  immédiatement ⇒ STOP TSLAx), les reads du recorder sont **quorum-2** (`rpc2.ts` `quorum2`/`finalized`) : une faute
  transport **BENCHE** la jambe (cooldown 25 s) et le quorum **se reforme** sur les autres — donc, à > 2 opérateurs,
  un `NonJsonBody@200` isolé n'est PAS un STOP immédiat. Le STOP survient quand le bench affame le quorum (blip
  corrélé sur ≥ N−1 jambes, ou sur une jambe nécessaire) ⇒ `NoQuorumError` + reprise manuelle. **Le classifieur est
  identique (R-BR2) ; la valeur de l'amendement est d'éviter le bench — et le tirage payant qu'il peut induire une
  fois ASSEZ de jambes keyless benchées** (chainstack est appendée EN DERNIER, `record.ts:293-295`, tirée seulement si
  < 2 keyless répondent ; à 3 keyless eth_call {drpc,mevblocker,pocket} un bench isolé n'appelle PAS la jambe
  payante — prereg §5a(e)) — **en réessayant le
  blip transitoire SUR PLACE.**
- **R-BR1 (analogue) PINNÉ** — plus fort que Bell : 201/204 sont des `NonJsonBody` 2xx≠200 **atteignables par le
  transport**, assertés FATALS dans la matrice ; la borne 2xx≠200 du recorder est épinglée (chez Bell, V4 survivait).

### 5. Résidus formés (à déclencheur, zéro dette nue)
- **R-U-1 (contradiction ADR-GARDE-HELIUS) — RÉSOLU** : le fold BELL-RETRY-1 est **FUSIONNÉ** (`lot/etude-suite` @
  `4db059e`, G7 `docs/G7-lot-bell-retry-1.md`) ; `ADR-GARDE-HELIUS-client-budgete-unique.md:320` lit désormais «  …
  `NonJsonBody` a 200/429/>=500 (amendement BELL-RETRY-1 2026-09-22 : retry borné, métré), JAMAIS … `NonJsonBody`
  2xx!=200 ou 4xx!=429 … » — clause **DOCTRINE-GÉNÉRALE** de l'Amendement 2b dont le recorder (2b-ii) est le sujet ⇒
  elle COUVRE `record.ts`. Le CODE du recorder est CE lot ; code et doctrine **CONCORDENT** désormais, plus de
  contradiction. **Item CLOS.**
- **R-U-2 (classifieur symétrique census non aligné)** : `scripts/census/u4-guard.mjs:136` (HEAD `lot/etude-suite` ;
  `:120` sur la base `831a87b` — dérive de ligne) porte le même prédicat `if (raw.name === "NonJsonBody") return false;`.
  HORS périmètre (ce lot = `record.ts` seul). Ses consommateurs de course sont **keyless-only par code** (discover /
  select / fill-ts ; labeler CARTO-T1-1) ; le prober payant n'existe que via `--with-chainstack`, **ABSENT de la ligne
  prereg** ⇒ jamais une précondition de course. *Déclencheur* : **après clôture de course ou à une frontière ancrée,
  OU ajout de `--with-chainstack` à un pas u4-guard de la course** — jamais « 1re occurrence ». Propriétaire :
  orchestrateur. `error_origin` : plan. (Le bras `apps/bell/src/universe.ts` `withUniverseRetry` est **R-BR3, déjà
  formé côté Bell** `4db059e` — hors de ce résidu.)
- **R-U-3 (branches défensives non atteignables)** : les branches `NonJsonBody` 429/≥500 sont défensives (via ce
  transport un `NonJsonBody` ne porte qu'un 2xx) ⇒ aucun mutant du chemin servi ne peut les rougir (comme les bras
  429/5xx de Bell). Gardées pour la fidélité du calque. *Déclencheur* : un changement de transport levant
  `NonJsonBody` sur un code non-2xx.

*(ADR-U4b n'est PAS dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Cet amendement
n'édite AUCUNE valeur de sha de référence existante : il APPEND une section datée, donc le recompute du prereg §2
reste vrai. Le worker ne committe pas (R-20) ; l'orchestrateur folde/committe au G7.)*

## Amendement daté 2026-09-22 (NARABI-OPS-1d, fusion option (b)) — D4 : `apps/sentinel/src/rpc.ts` AVANT == APRÈS ; la suppression du code mort est un item post-course

> **Provenance.** Texte : worker `claude-opus-5-5[1m]` (effort max), 2026-09-22 ; recompute LF depuis les blobs (`git show <c>:<f> | tr -d '\r' | sha256sum`, régime B) aux commits `9e095a0` (commit du prereg), `f6442fe` (base du lot), `7daf8e5` (pointe du lot) et `de30eab` (`lot/etude-suite` à la rédaction). **Insertion par l'orchestrateur `claude-fable-5-1` SEUL** (R-20) ; réviseur = orchestrateur (R-21). Corrige le texte PROPOSÉ au G1 §12 de NARABI-OPS-1d (« APRÈS = recomputé au commit du rebase -1d »), devenu faux par le report du gel (G2 C-G2-1 ; checkpoint-2 C-V-4 ; ruling C-V-0 option (b), `docs/CHANTIERS.md:783` et `:786`).

### 1. D4 — sha AVANT / APRÈS de la fusion NARABI-OPS-1d
Aucun fichier gelé ne bouge : `git diff --name-only f6442fe 7daf8e5` = 8 fichiers, aucun du gel. Les 9 valeurs sont identiques aux quatre commits cités :

| # | Fichier gelé | AVANT (`9e095a0` = `f6442fe`) | APRÈS (`7daf8e5` = arbre fusionné hors `docs/`) | État |
|---|---|---|---|---|
| 1 | `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f6…f51445c0` | idem | inchangé |
| 2 | `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd3…57a6fac0` | idem | inchangé |
| 3 | `scripts/record-u4b-calib.mjs` | `5733daeb…1fbc31a3` | idem | inchangé |
| 4 | `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc…e4de2322` | idem | inchangé |
| 5 | `apps/sentinel/src/ukemi/abi.ts` | `3376eb08…c1ab2d66` | idem | inchangé |
| 6 | `packages/hikae/src/l1-split.ts` | `9206df91…8164ffa3` | idem | inchangé |
| 7 | `apps/sentinel/src/rpc.ts` | `0e232519…c1c65ca0` | idem | **inchangé — GELÉ ; exports payants devenus morts** |
| 8 | `packages/contracts/src/calib-digest.ts` | `3603265d…94c42380` | idem | inchangé |
| 9 | `scripts/census/u3-realized.mjs` (labeler) | `cb020425…5b41a1af` | idem | inchangé |

Valeur complète du sha #7 (AVANT == APRÈS) :
```
0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0  apps/sentinel/src/rpc.ts
```
**À recomputer sur le commit de fusion réel** (`git show <fusion>:<f> | tr -d '\r' | sha256sum`) — tout écart = STOP.

### 2. Contrainte d'ordre (§3 de l'amendement 2026-09-21, l. 121-136 ; prereg, « Préconditions dures » point 6)
- Lettre (`docs/PLAN-u4b-prereg.md:367` ; l. 127-129 ci-dessus) : « NARABI-OPS-1d NE fusionne PAS entre le commit du prereg -1b et la clôture de la course. Sinon `rpc.ts` change, le gel est rompu ». Sous l'option (b), -1d fusionne DANS cette fenêtre (prereg committé `9e095a0`, course non close) ; mais `rpc.ts` et les 8 autres fichiers gelés sont byte-identiques (§1), et aucun fichier de la fermeture d'imports des scripts de course n'est touché (`run.ts` et `keyless-transport.ts` ne sont importés que par `run.ts` et par des tests sentinel ; `git grep` sur `scripts apps packages` @ `7daf8e5`). L'objet protégé est intact : le gel n'est PAS rompu, aucun re-gel.
- **D-n à consigner** au PLI de la course U-4b-1b (le prereg, committé et lié par `--prereg-sha`, n'est PAS modifié) : « D-n (NARABI-OPS-1d, option (b), 2026-09-22) — fusion de `lot/narabi-ops-1d` @ `7daf8e5` pendant la fenêtre prereg → clôture, en écart à la LETTRE de la précondition 6 (`docs/PLAN-u4b-prereg.md:367`) ; 9 sha LF byte-identiques AVANT/APRÈS (ADR-U4b, amendement -1d §1) ; aucun fichier gelé ni aucune ligne de commande figée touchés. »
- La SUPPRESSION du code mort de `rpc.ts` (pli §11-1) reste soumise à la lettre de §3.

### 3. Item formé — pli §11-1 (post-course) et sha APRÈS' de `rpc.ts`
- Contenu, sur `rpc.ts` : suppression de `chainstackUrl` (l. 50-56), `poolEndpoints` (l. 58-64), `publishedEndpoints` (l. 66-72), `hasChainstack` (l. 74-78), `defaultCall` (l. 121-133) et du défaut `opts.call ?? defaultCall` (l. 145). Ne touche ni `TRANSFER_TOPIC` (l. 15 ; importé par `abi.ts:7`, gelé) ni `PUBLIC_ENDPOINTS`/`providerOf` (importés par le labeler `u3-realized.mjs:36`, gelé).
- **Déclencheur : clôture de la course U-4b-1b AU SENS DU GEL** — après l'exécution du hors-ligne du prereg §(5e) (`docs/PLAN-u4b-prereg.md:310` : « après la course ; sous la vérification des 9 sha par l'orchestrateur » ; `u4b-reduce` → `u4b-scores` → `record-u4b-calib`). `u4b-scores.mjs:37` et `u4b-reduce.mjs:19` importent `abi.ts`, qui importe `rpc.ts` (`abi.ts:7`) : modifier `rpc.ts` avant ces étapes romprait leur vérification (ÉCART = STOP). La clôture « sur les données » de la décision 129 ne suffit PAS.
- Au commit du pli : amendement D4 daté portant AVANT `0e232519…` / APRÈS' (recomputé). Si le prereg d'une calibration suivante a re-gelé `rpc.ts` entre-temps ⇒ STOP (re-gel et re-prereg, ou report). **Propriétaire** : orchestrateur.

*(ADR-U4b n'est pas dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Ajout pur : aucune valeur de référence existante n'est éditée.)*

## Amendement daté 2026-09-22 (U-4b-1b-3) — décision **D-BORNE-1** « borne `to_block` » : sélecteur et `--fill-ts` bornés au domaine observé, sidecar INCRÉMENTAL reprenable (v3 = fold G7 : pli `d2e36ac` + micro-pli `1bcfbd7`)

> **Numéro de décision : D-BORNE-1** (libellé libre). Le G1 laissait le numéro à l'orchestrateur (`docs/G1-lot-u4b-1b-3.md:36`) ; le checkpoint-2 l'a exigé (C-V-5, `docs/CHECKPOINT2-lot-u4b-1b-3.md:41`) ; le pli l'a fixé ; le ruling de fold le retient (`docs/CHANTIERS.md:895`). « D6 » et « D-6 » sont déjà pris dans cet ADR, avec des sens distincts : « indice fermé D6 » (l. 106) et « delta D-6 » (l. 293).

> **Provenance.** G1 : worker `claude-opus-4-8[1m]` (effort max), commit de lot `801859f` (parent = merge-base avec
> `lot/etude-suite` = `b900b4b`). Pli : worker `claude-opus-5-5[1m]` (effort max, décision 133), commit `d2e36ac`, journal
> `docs/PLI-lot-u4b-1b-3.md` ; auteur du texte v2 de cet amendement. Micro-pli (test seul) : worker `claude-opus-5-5[1m]`,
> commit `1bcfbd7`. **Fold v3 (ce texte)** : worker `claude-opus-5-5[1m]` (effort max), 2026-09-22 vers 23:4x UTC, docs
> seulement, aucun commit (R-20) ; toutes les corrections dues sont repliées et tracées à leur source (§9). **Insertion par
> l'orchestrateur `claude-fable-5-1` SEUL**, en queue de ce fichier, dans le commit du G7 ; réviseur = orchestrateur (R-21).
> Cette v3 remplace la v2 et la v1 (aucune des deux n'a été foldée). Seuls `scripts/census/u4b/u4b-select-episode.mjs`
> (+ `.d.mts`) et `apps/sentinel/test/u4b-select-episode.test.ts` bougent ; R-25 du lot cumulé `b900b4b...1bcfbd7` (pathspec
> `ci.yml:65` verbatim) = **472** lignes (448 + / 24 −), sous `VIBEGATES_PR_LIMIT = 1205` (`ci.yml:43`) — mesuré au
> micro-pli, rejoué par le G2-delta-2 et le re-checkpoint-2 (`docs/CHANTIERS.md:895`), re-mesuré au fold. Corps D1..D5 et
> amendements antérieurs de cet ADR byte-identiques : ajout pur en fin de fichier.

### 1. Chaîne de revue (ordre réel ; heure = `TZ=UTC git log` du commit porteur)
| étape | acteur | objet (commit) | verdict et mesures | source en dépôt |
|---|---|---|---|---|
| G1 | worker `claude-opus-4-8[1m]` | `801859f` (18:23) | 5 tests, 8 mutants rouges, oracle 922/921/0/1 (worktree G1 ; sur clone frais de `801859f` : 926/925/0/1, checkpoint-2 et G2), R-25 221 | `docs/G1-lot-u4b-1b-3.md:21,24,27,30` |
| checkpoint-1 | — | — | **ABSENT** : lot lancé sans checkpoint-1 ; CA-1..CA-5 rendus rétroactivement au checkpoint-2 ; `error_origin` orchestrateur | `docs/CHANTIERS.md:797` ; `docs/CHECKPOINT2-lot-u4b-1b-3.md:30` |
| checkpoint-2 | validateur `claude-fable-5-1` | `801859f` ; persisté `3ba5a06` (18:43) | ACCEPTE-AVEC-CORRECTIONS (C-V-1 bloquante … C-V-6, item tmp + rename), conditionnel au G2, encore absent à cette heure ; 926/925/0/1 | `docs/CHECKPOINT2-lot-u4b-1b-3.md:12,18,36-43` |
| G2 | relecteur `claude-opus-4-8[1m]` | `801859f` ; persisté `a41331b` (18:58) | PASS-AVEC-CORRECTIONS (C-G2-1..C-G2-3) ; 926/925/0/1 au 2ᵉ passage (1ᵉʳ passage : flake libuv `UV_HANDLE_CLOSING`, hors lot) | `docs/G2-lot-u4b-1b-3.md:13,83-87,104-110` |
| pli | worker `claude-opus-5-5[1m]` | `d2e36ac` (19:58) | 934/933/0/1 ; 17 mutants tués par leur test nommé (TAP) ; R-25 443 ; A-6 11/11 | `docs/PLI-lot-u4b-1b-3.md:13-15` |
| re-checkpoint-2 | validateur `claude-fable-5-1` | `d2e36ac` ; persisté `0440b23` (20:18) | ACCEPTE-AVEC-CORRECTIONS C-1..C-4 (au fold/G7), conditionnel au G2-delta ; erratum de son C-V-3 | `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:16,29-41` |
| G2-delta | relecteur `claude-opus-5-5[1m]`, instance séparée | `d2e36ac` ; persisté `66f75c2` (20:58) | PASS avec C-GD-1..C-GD-3 ; 934/933/0/1 sur le clone et sur deux fusions à blanc | `docs/G2-lot-u4b-1b-3-delta.md:7-22,229,248,254` |
| micro-pli (test seul) | worker `claude-opus-5-5[1m]` | `1bcfbd7` (21:34) | 935/934/0/1 ; 25 mutants : 24 tués par leur test nommé (18 du cœur M1..M17 + D4, 6 supplémentaires D6, M18..M22), D7 déclaré équivalent ; R-25 472 | `docs/CHANTIERS.md:895` ; message du commit `1bcfbd7` ; décompte nominatif : `docs/G2-lot-u4b-1b-3-delta2.md` après re-persistance (note D-1) |
| G2-delta-2 ‖ re-checkpoint-2 | même relecteur (contexte intact) ‖ validateur | `1bcfbd7` ; persistés `91a719b` (22:09) | PASS ‖ ACCEPTE ; 24/24 + D7 équivalent ; mutant VX-L2 du validateur rouge ; fusions à blanc `15fb00a` et `a703e24` : 947/945/0/2 (clones : rejeu e2 sauté) | chiffres : `docs/CHANTIERS.md:895` ; textes intégraux : `docs/G2-lot-u4b-1b-3-delta2.md`, `docs/CHECKPOINT2-lot-u4b-1b-3-re2.md` (note D-1) |
| G7 | orchestrateur `claude-fable-5-1` | fusion de `1bcfbd7` + ce fold | oracle 7 gates sur l'arbre principal fusionné (note « compte G7 ») | entrée « G7 U-4b-1b-3 » de `docs/CHANTIERS.md` |

- **Note D-1 (persistance).** Au commit `91a719b`, les deux revues du micro-pli ont reçu le bon titre mais, de la ligne 3 à
  la fin, le corps des revues du PLI (`docs/G2-lot-u4b-1b-3-delta.md` et `docs/CHECKPOINT2-lot-u4b-1b-3-re.md`,
  byte-identiques, mesuré au fold). Le G7 re-persiste leurs corps avant ce commit (acte orchestrateur) ;
  `error_origin` : orchestrateur. La source en dépôt des verdicts et chiffres du micro-pli est `docs/CHANTIERS.md:895`.
- **Note « compte G7 ».** Attendu sur l'arbre principal fusionné : N + 14, où N = compte de `lot/etude-suite` sur l'arbre
  principal au moment de la fusion, et 14 = tests ajoutés par le lot (5 au G1, `docs/G1-lot-u4b-1b-3.md:21` ; 8 au pli,
  `docs/PLI-lot-u4b-1b-3.md:13` ; 1 au micro-pli, 934 → 935, `docs/CHANTIERS.md:895`). Un seul skip attendu :
  `sentinel_run_releases_chainstack_lock_on_sigterm` (win32), car l'arbre principal exécute le rejeu e2
  (`docs/CHANTIERS.md:868`). Avec N = 937 (arbre principal après la fusion A-9-OUTILLE, `docs/CHANTIERS.md:903` ; aucun
  fichier hors `docs/` modifié depuis `eab911a`, mesuré au fold), l'attendu est **951/950/0/1**. La valeur 947/946/0/1
  (O2-1 du G2-delta-2, reprise `docs/CHANTIERS.md:895,907`) était calculée contre `a703e24` (933 + 14) ; la fusion
  A-9-OUTILLE l'a rendue périmée (`error_origin` : orchestrateur). La mesure réelle est portée par l'entrée G7 de
  `docs/CHANTIERS.md` et par le message du commit de fusion. Tout écart avec l'attendu = STOP avant commit.

### 2. Constat mesuré (course réelle du 2026-09-22 ; corrigé au pli et au fold)
- **discover v2** : brut `phase:complete`, 13 696 `LiquidationCall` sur `[22 803 459, 26 034 127]`
  (`docs/CHANTIERS.md:771`, section « Decision 133 », l. 768). **`to_block` = 26 034 127 = finalized 26 034 191 − 64**
  (ligne de lancement de 16:38:17 UTC, `docs/PLI-lot-u4b-1b-3.md:83` ; `docs/G2-lot-u4b-1b-3-delta.md:264`) : c'est la
  règle `B_hi = finalized − 64` de §DISC:29 (`docs/PLAN-u4b-prereg.md:29`). `to_block` n'est donc **pas** la tête de chaîne :
  les blocs au-delà existent.
- **Arrêts du `--fill-ts` (C-GD-3 (c), O-D7).** Le journal (`docs/CHANTIERS.md:771-772`) consigne un 1ᵉʳ essai arrêté
  sur un 429 de `mevblocker.io` après environ 2 700 appels keyless, puis « x3 STOP … malformed block » entre 17:01 et 17:24 UTC,
  après environ 12 000 appels keyless chacun (« ~36 000 appels keyless perdus », 0 RU). Les journaux sur disque, relus par le
  G2-delta (`docs/G2-lot-u4b-1b-3-delta.md:378-383`), disent autre chose : dernière erreur 429 `mevblocker.io` à 17:01,
  `malformed block` à 17:09 et à 17:23, soit **2** arrêts `malformed block` confirmés. Les comptes d'appels (2 700,
  12 000, 36 000) ne figurent que dans le journal, pas dans les journaux d'exécution, et ne sont pas re-mesurés. Aucun
  sidecar n'a été écrit : chaque essai était tout-ou-rien (`docs/CHANTIERS.md:772`).
- **Cause [lu au code]** : `clusterWethLiquidations` (gelé, `liquidation-logs.mjs:74`) borne la recherche de fenêtre à
  `B_first + 60 000` (`hiSpan`, `:66`) ; pour un cluster qui s'ouvre en fin de plage, `firstBlockAtOrAfter` (gelé,
  `windows.ts:50`) sonde des blocs `> to_block` **jusqu'au-delà de la tête** : c'est là, et seulement là, qu'un fournisseur
  rend `null`, donc `asBlock` lève `malformed block` (`rpc2.ts:64`) et le quorum-2 devient impossible. `windows.ts:44-49`
  pose la précondition que l'appelant borne `hi` par un bloc FINALISÉ ; `B_first + 60 000` ne l'est pas. Citations
  vérifiées [lu] par le G2-delta (`docs/G2-lot-u4b-1b-3-delta.md:275-280`). `error_origin` de l'arrêt : plan (borne de
  recherche non liée à `to_block`, `docs/CHANTIERS.md:772`).
- **Corrections de texte (checkpoint-2 C-V-3) et mesure de fold (re-checkpoint-2 C-2, G2-delta C-GD-3 (d)).**
  (a) La phrase du G1 « aucun bloc n'existe au-delà de `to_block` (tête de chaîne) » était **fausse** (point précédent) ;
  corrigée au pli (`u4b-select-episode.mjs:87` et docstring `:323` : « NOT the chain head »,
  `docs/G2-lot-u4b-1b-3-delta.md:261`).
  (b) L'énoncé du checkpoint-2 « le `block_ts` du brut réel contient des ts `> to_block` »
  (`docs/CHECKPOINT2-lot-u4b-1b-3.md:39`) est **faux comme fait mesuré**. Mesure en lecture seule sur le brut de la course
  (hors dépôt par construction ; `brut_sha256` recalculé = porté = `2ffa3acf…3fa8`) : `block_ts` = **2 328 clés**, minimum
  22 843 909, **maximum 24 565 504**, **0 clé `> to_block`** (et 0 clé `≥ to_block`) ; plus grand bloc d'enregistrement
  26 029 710 ; provenance du témoin `calls 6000 / max_calls 6000`, `cluster_error: rpc-guard: run_calls` : le témoin a
  épuisé son budget avant les clusters de fin de plage. Faite au pli (`docs/PLI-lot-u4b-1b-3.md:78-85`), refaite
  indépendamment par le G2-delta (`docs/G2-lot-u4b-1b-3-delta.md:289-307`) et par le validateur, qui a rendu l'erratum de
  son C-V-3 (`docs/CHECKPOINT2-lot-u4b-1b-3-re.md:24,29-30`) ; journalisée `docs/CHANTIERS.md:854`. Par CODE, un brut
  **peut** porter de tels ts : le témoin de discover enregistre chaque `blockAt` sans borne (`u4b-discover.mjs:139`) et
  `--to-block` est un argument libre, jamais comparé à `finalized` (`:73`). L'erratum **renforce** D-BORNE-1 : 26 029 710
  est à moins de 60 000 blocs de `to_block`, donc un témoin non épuisé aurait sondé au-delà de `to_block` sur cette plage
  même (`docs/CHECKPOINT2-lot-u4b-1b-3-re.md:30`).

### 3. Décision D-BORNE-1 — le domaine de sélection est `[.., to_block]` ; au-delà, `+Infinity` sans lecture
Lignes citées au bout du lot, `1bcfbd7` (blob LF du `.mjs` `20e1cf9d…3280`, inchangé par le micro-pli).
1. **`tsOf(block > to_block) = +Infinity`, sans lecture réseau NI lecture de `block_ts`**, dans `reduceSelection` (hors
   ligne, `:100`) ET `runFillTs` (gardé keyless, `:410`). Un ts `> to_block` éventuellement présent dans `block_ts` est
   **ignoré délibérément** : c'est un **choix de domaine** (le domaine observé du brut, `B_hi` par défaut), pas un fait de
   chaîne. La recherche binaire converge alors au plus à `to_block + 1`, donc `B_last ≤ to_block` ; aucun `blockAt` n'est émis
   au-delà de `to_block` (l'arrêt `malformed block` disparaît). Le clamp vit **entièrement** dans les fermetures `tsOf`
   injectées par `u4b-select-episode.mjs` : `windows.ts` et `liquidation-logs.mjs` restent intouchés (gel D4, §5).
2. **Troncature étendue, fail-closed** : `complete ⟺ (B_last ≤ B_hi) ∧ (B_last < to_block)` ; code (`:111`)
   `if (!(c.b_last <= bHi) || c.b_last >= toBlock) reasons.push("window_truncated")`. Le **seul** cas qui bascule
   `complete → window_truncated` par rapport à la lecture non bornée du prereg est la frontière EXACTE
   `firstBlockAtOrAfter == to_block + 1` (fenêtre finissant pile à `to_block`, indiscernable dans `[.., to_block]` d'une
   fenêtre qui déborde). Avec `--b-hi < to_block`, le terme `to_block` est inerte : §DISC:44 s'applique verbatim. Arêtes
   `== to_block`, `== to_block + 1`, `≥ to_block + 2` et `--b-hi < to_block` rejouées par le checkpoint-2
   (`docs/CHECKPOINT2-lot-u4b-1b-3.md:22`).
3. **Information investisseur (CA-2 du checkpoint-2)** : D-BORNE-1 est une **restriction** du prereg, jamais une
   relaxation. Le seul cas basculant ne change l'épisode servi que si ce cluster de fin de plage est le **seul** éligible
   (`episode = argmin B_first`, §DISC:49) ; il tombe alors dans **H-0 `no_fresh_episode`**, déjà pré-enregistré
   (`docs/PLAN-u4b-prereg.md:95` : « NON ⇒ arrêt `no_fresh_episode`, item formé (élargir fenêtre / abaisser N_min = décision
   investisseur), AUCUNE course »). Aucune valeur pinnée n'est touchée : aucun `selection_sha256` réel n'existe, le
   `--fill-ts` n'a jamais complété (`docs/CHECKPOINT2-lot-u4b-1b-3.md:32`).
4. **Variante écartée (fidélité exacte)** : autoriser la seule sonde `to_block + 1` (clamp à `> to_block + 1`, règle
   §DISC:44 verbatim) déciderait exactement le cas-frontière du point 2. Écartée parce que (i) l'existence de `to_block + 1`
   n'est pas garantie par le code : `--to-block` est un argument libre de `u4b-discover` (`u4b-discover.mjs:73`), non vérifié
   contre `finalized`, et un brut à `to_block` = tête réintroduirait la sonde `null`, donc `malformed block` ; (ii) le passage
   hors ligne exigerait `ts(to_block + 1)`, absent du brut réel (0 clé `> to_block`, §2) : un aller réseau de plus, hors du
   domaine observé, pour tout cluster de fin de plage ; (iii) le gain est borné au chemin H-0 pré-enregistré (point 3). Coût
   du choix retenu : au pire un H-0 sur un cas-frontière d'un bloc, jamais un épisode faux.
5. **Sidecar `block-ts-extra.json` INCRÉMENTAL + REPRENABLE.** Réécrit tous les **N = 50** nouveaux ts (`FLUSH_EVERY`,
   `:393`) et sur arrêt gracieux (`phase:"partial"`, `catch`, `:425`), une fois à la fin (`phase:"complete"`). **Chaque
   écriture = `writeFileSync(tmp)` puis `renameSync(tmp, sidecar)` dans le même dossier** (`:397-399` ; nom temporaire
   `<sidecar>.tmp-<pid>-<16 hex>`, calque de `scripts/probe-narabi.mjs` C-G2-6 / C-G2D-2), **sans `fsync`** (R-BORNE-2,
   §6). L'item formé du checkpoint-2 « écriture `tmp + rename` » (`docs/CHECKPOINT2-lot-u4b-1b-3.md:43`) est **clos par
   implémentation** (test + mutant M17). Au démarrage, un sidecar existant de MÊME `discover_sha` et self-sha valide
   **amorce** `extra` (0 re-fetch des ts déjà lus) ; une relance sur un `complete` est **idempotente** (0 fetch, octets
   identiques, même sha).
6. **Ordre des refus (checkpoint-2 C-V-1, régression du lot corrigée au pli ; G2-delta C-GD-1).** Les **5 refus** qui ne
   lisent que l'état local s'exécutent **avant** `openU4GuardedClient` (`:402`), qui pose les verrous
   `<ledger>/<cycle>/<op>.lock` (`packages/rpc-guard/src/lock.ts`) : `to_block` non entier (`:366-367`), sidecar illisible
   (`:378`), sidecar sans objet `block_ts_extra` (`:380`), self-sha (`:381`), `discover_sha` (`:382`) ; `mkdirSync(--out)`
   (`:371`) et `kept` (`:385`) aussi. Entre l'ouverture et le `try` (`:419`) ne restent que des constructions de
   fermetures, sans chemin de `throw` à la construction (`makeGuardedPoolCall` `:404`, `makeUkemiPool` `:405` ;
   `docs/G2-lot-u4b-1b-3-delta.md:113-123`). Un refus de reprise ne laisse donc jamais le cycle verrouillé : le même cycle
   se relance. Un sidecar illisible (JSON tronqué) est un refus **nommé** `SelectError` « `block-ts-extra sidecar
   unreadable: …` », jamais une `SyntaxError` ; 0 fetch ; fichier laissé intact pour l'opérateur. Depuis le micro-pli, la
   liberté de verrou est épinglée **refus par refus** (§8, ligne « Blocage par ressource »).
7. **`phase` obligatoire (checkpoint-2 C-V-6 / G2 C-G2-3) et fixtures en forme réelle (G2-delta C-GD-2).**
   `runSelect --block-ts-extra` refuse nommément tout sidecar dont `phase` ≠ `"complete"`, **phase absente comprise**
   (`:217`, « `sidecar phase absent is not 'complete'` »). Motif : le seul producteur (`runFillTs`) écrit toujours `phase`,
   et aucun sidecar réel n'existe (`docs/CHECKPOINT2-lot-u4b-1b-3-re.md:23`). La clémence de `assertBrutComplete` porte sur
   les **bruts** legacy/synthétiques, un autre artefact. Les fixtures des tests de garde `u4b_select_refuses_a_tampered_block_ts_extra_sidecar`
   et `u4b_select_refuses_a_block_ts_extra_sidecar_from_another_brut` portent désormais `phase:"complete"` (test `:171`,
   `:183`) : chaque test isole SA garde (mutants M20 et M21, garde retirée : « Missing expected rejection »). Le mutant D7
   (garde `phase` placée avant les gardes sha) est **déclaré équivalent pour la sûreté** et survit : un sidecar falsifié ou
   étranger reste refusé dans les deux ordres, seul le message change (`docs/G2-lot-u4b-1b-3-delta.md:345-349` ;
   `docs/CHANTIERS.md:895`). La **reprise** (`--fill-ts`) réutilise les données de tout sidecar au self-sha valide et de même
   `discover_sha`, quelle que soit sa phase (réécrite au flush suivant).
8. **`--min-interval-ms` par opérateur + tolérance 429** : inchangés depuis le G1 (retry borné du pool,
   `makeGuardedPoolCall({retries:2})`, `:404` ; mutant `retries:0` rouge, M8). La valeur n'est pas validée (item O-D4, §7).

### 4. Tuyaux (ADR-M018 ; règle de Branchement) — test de composition = intégration non-LLM, seul `globalThis.fetch` bouchonné
| pièce | entrée (qui produit) | sortie (qui consomme) | état (où il vit) | tests qui prouvent la composition (`apps/sentinel/test/u4b-select-episode.test.ts` @ `1bcfbd7`) |
|---|---|---|---|---|
| `--fill-ts` reprenable, borné à `to_block` | brut discover v2 (`u4b-discover.mjs`) + sidecar antérieur optionnel (`partial`/`complete`, même `discover_sha`) | `block-ts-extra.json{phase}` → `runSelect --block-ts-extra` (hors ligne, 0 fetch) | `<out>/block-ts-extra.json` (hors dépôt, lié au `discover_sha`) ; temporaire `<sidecar>.tmp-<pid>-<hex>` transitoire ; verrous `<ledger>/<cycle>/<op>.lock` | G1 : `u4b_fill_ts_resolves_a_to_block_minus_1000_cluster_with_0_fetch_past_to_block` (`:472`), `u4b_fill_ts_is_incremental_and_resumable_after_a_quorum_kill` (`:486`), `u4b_fill_ts_writes_complete_which_select_accepts_and_select_refuses_a_partial` (`:515`), `u4b_fill_ts_quorum2_tolerates_a_transient_429_via_the_bounded_pool_retry` (`:536`) ; pli : `u4b_fill_ts_pre_open_refusals_hold_no_cycle_lock_and_the_same_cycle_relaunches` (`:567`), `u4b_fill_ts_refuses_a_torn_sidecar_by_name_with_0_fetch_and_no_lock` (`:595`), `u4b_fill_ts_flushes_a_durable_partial_every_50_new_ts_observed_mid_run` (`:613`), `u4b_fill_ts_replaces_the_sidecar_by_tmp_rename_never_in_place_and_leaves_no_tmp` (`:631`), `u4b_fill_ts_resume_refuses_a_sidecar_from_another_brut_by_name_with_0_fetch` (`:651`), `u4b_fill_ts_resume_refuses_a_falsified_sidecar_by_self_sha_with_0_fetch` (`:668`), `u4b_fill_ts_rerun_on_a_complete_sidecar_is_idempotent_0_fetch_identical_bytes` (`:709`) ; micro-pli : `u4b_fill_ts_resume_refuses_a_sidecar_without_block_ts_extra_object_by_name_with_0_fetch_and_no_lock` (`:686`) |
| sélecteur — troncature `> to_block` sans réseau ; `phase` obligatoire | brut discover v2 (`block_ts`) + sidecar `complete` | `episode-selection.json` (`window_truncated`, `candidates[].reasons`) → prober `u4-oracle-path.mjs --episode-file` (vérifie `selection_sha256`) | `<out>/episode-selection.json` | G1 : `u4b_select_marks_a_to_block_minus_1000_cluster_window_truncated_offline_0_fetch` (`:450`) ; pli : `u4b_select_refuses_a_block_ts_extra_sidecar_without_phase_by_name` (`:731`) ; fixtures en forme réelle (C-GD-2) : `:166`, `:178`. **Composition sélecteur → prober NON rejouée** (CARTO-T1C-5, item §7) |

État : 14 tests d'intégration non-LLM du lot (5 G1 + 8 pli + 1 micro-pli). Le `--fill-ts` n'a jamais complété sur la course
réelle : ce tuyau de production n'est exercé qu'en test, donc `built` seulement à la première course rapprochée
(`docs/CONSIGNE-STANDARD-G1.md:30`, D-3). Aucune surface publique ne le déclare `built`
(`docs/CHECKPOINT2-lot-u4b-1b-3-re.md:26`).

### 5. Gel D4 intact (A-6, régime B, LF)
Les 9 fichiers gelés du prereg §2 + `scripts/census/u4b/liquidation-logs.mjs` + `apps/sentinel/src/windows.ts` sont
byte-identiques entre `b900b4b` et `1bcfbd7` : **11/11** (mesuré au pli, `docs/PLI-lot-u4b-1b-3.md:141-144` ; au
G2-delta, `docs/G2-lot-u4b-1b-3-delta.md:94-98` ; au micro-pli et au re-checkpoint-2, `docs/CHANTIERS.md:895` ; re-mesuré au
fold par `git show 1bcfbd7:<f> | tr -d '\r' | sha256sum`) : `u4b-scores 2f9a31f6…`, `u4b-reduce a5e66cd3…`,
`record-u4b-calib 5733daeb…`, `wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`, `rpc.ts 0e232519…`,
`calib-digest 3603265d…`, labeler `u3-realized cb020425…` (= prereg §2), `liquidation-logs bf4eb293…`,
`windows.ts b84827ae…`. Prereg `docs/PLAN-u4b-prereg.md` `1971d9b1…` inchangé ; cet ADR inchangé par le lot
(`git diff --quiet b900b4b 1bcfbd7`).

### 6. Résidus nommés (règle Dettes : items formés à déclencheur, jamais une dette nue)
- **R-BORNE-1 — `phase` hors du `block_ts_extra_sha256`** (préserve la chaîne C-2 byte-stable). Direction
  `complete → partial` : attrapée par la garde `phase` de `runSelect` (test + mutant M6). Direction **`partial → complete`**
  (flip MANUEL, qu'une garde `phase` ne peut par définition pas voir) : le filet réel est le refus nommé « `brut has no ts
  for block …` » de `reduceSelection` (hors ligne), car un partial authentique manque au moins un bloc nécessaire
  (`flush("complete")` n'est écrit qu'après un clustering complet) — rejoué par le checkpoint-2 sur un partial de 60 entrées
  (`docs/CHECKPOINT2-lot-u4b-1b-3.md:24`). **Cas inoffensif** : un kill APRÈS le dernier fetch (le partial détient déjà tous
  les ts nécessaires) ; le flip rend alors la même sélection qu'un `complete` authentique, jamais une sélection fausse.
  **Déclencheur** : un consommateur du sidecar autre que `runSelect` ⇒ lier `phase` sous un sha (ou signer le sidecar
  entier). Propriétaire : orchestrateur.
- **R-BORNE-2 — atomicité et durabilité du remplacement du sidecar sous Windows.**
  - **Sources (C-GD-3 (a) ; traces en dépôt : `docs/PLI-lot-u4b-1b-3.md:69-72` et
    `docs/course-bell/FAITS-win32-flush-rename-2026-09-22.md:18-34`)** :
    (i) POSIX, IEEE Std 1003.1-2024 (Issue 8), `rename()` — `https://pubs.opengroup.org/onlinepubs/9799919799/functions/rename.html`,
    lue par le pli le 2026-09-22 à 19:39:27 UTC (lecture seule), sha256 de la page
    `06671610134b0a52cdf4dcdaf382f72fef85ef51088b8a52b8679c7f03829318` [lu par le pli ; classé [2nd] par le validateur,
    `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:25`] : l'entrée remplacée « shall remain visible to other threads throughout the
    renaming operation and refer either to the file referred to by new or old » ; (trad.) elle reste visible pendant toute
    l'opération et désigne soit l'ancien, soit le nouveau fichier.
    (ii) libuv v1.51.0 (celle de Node v24.15.0), `src/win/fs.c` —
    `https://raw.githubusercontent.com/libuv/libuv/v1.51.0/src/win/fs.c`, sha256
    `60c76976514f427fa0be21c1c7986c2ab1d9e2e77b9d5bcf8c7ab99ed36b0693` : `fs__rename` (l. 2266-2273) appelle
    `MoveFileExW(…, MOVEFILE_REPLACE_EXISTING)` seul, sans `MOVEFILE_WRITE_THROUGH` ni sémantique POSIX — [lu] par le pli
    (vers 19:26 UTC), re-téléchargé par le validateur (même sha, `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:25`), lu sur place
    par l'orchestrateur à 22:24 UTC (même sha, FAITS `:27-34`).
    (iii) Microsoft Learn, `MoveFileExW` — `https://learn.microsoft.com/en-us/windows/win32/api/winbase/nf-winbase-movefileexw` :
    lue par le pli à 19:39:40 UTC, sha256 de la page `840ab81522b06162e5725b2941e7aa499053ac31417fe4dfe01110d856ad43a5`
    (aucune mention d'atomicité dans le contenu ; les 2 occurrences de « atomic » sont des attributs HTML `aria-atomic`) ;
    lue sur place par l'orchestrateur à 22:24 UTC (page « Last updated on 06/01/2023 ») : sans `MOVEFILE_WRITE_THROUGH`,
    aucune garantie de persistance du renommage au retour de la fonction (FAITS `:18-25`).
    Au fold, les sha256 des trois copies locales du pli ont été recalculés sans réseau : identiques aux trois valeurs
    ci-dessus.
  - **Ce qui en découle.**
    (1) *Kill du processus pendant un flush* : sous POSIX, le nom désigne l'ancien ou le nouveau sidecar entier (i) ; sous
    Windows, l'atomicité n'est pas documentée (ii)(iii). Pire cas **fail-closed** : sidecar illisible, donc refus nommé
    (`:378` ; point 6 ; test `:595` + mutant M11), sans verrou tenu ni sélection fausse, au prix de la progression :
    l'opérateur écarte le fichier et le remplissage repart de zéro (la reprise ne lit que `block-ts-extra.json`).
    (2) *Coupure de courant* : la v2 plaçait la perte de courant hors du modèle de menace (« kill du processus »). Les faits
    du 2026-09-22 l'y font entrer : deux coupures (`docs/CHANTIERS.md:864`, `:886`), fichiers réécrits en entier retrouvés
    vides ou NUL (`:887`), ruling de classe « tout fichier réécrit en entier passe par tmp + fsync + rename », prononcé pour
    GARDE-FSYNC-1 et BELL-SHORTPAGE-1 C-6 (`:889`). `flush` n'appelle pas `fsync` sur le temporaire avant `renameSync`
    (`:397-399`) et `MoveFileExW` sans `MOVEFILE_WRITE_THROUGH` ne garantit pas la persistance du renommage (iii) : une
    coupure pendant ou peu après un flush peut laisser un sidecar illisible, avec la même issue fail-closed que (1) (0 RU :
    appels keyless seulement ; jamais une sélection fausse). Item R-BORNE-2-F (§7).
    (3) *Re-checkpoint-2 C-4* : le `flush("partial")` du `catch` (`:425`) peut lui-même lever — `EPERM` sur `renameSync`
    dès qu'un lecteur **quelconque** tient la cible ouverte (mesuré pour Node, Git-Bash, Python et PowerShell,
    `docs/course-bell/RUNBOOK-supervision-tirage.md:7-21`, `docs/CHANTIERS.md:893` ; le libellé « lecteur non-Node » du
    re-checkpoint-2, `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:40`, est corrigé par cette mesure) — et masquer l'erreur
    d'origine `e`. Fail-closed : le sidecar précédent reste entier (le renommage n'a pas eu lieu), le `finally` déverrouille
    (`:429-430`). `probe-narabi` a un `try/catch` de repli ; le pli ne l'a pas repris. Replié sous le déclencheur de
    R-BORNE-2, sans nouvel item (re-checkpoint-2 C-4).
    (4) *G2-delta O-D3* : un échec transitoire du `rename` (antivirus, indexeur, tout lecteur : `EACCES`, `EPERM`, `EBUSY` ;
    `graceful-fs` 4.2.11 réessaie ces codes jusqu'à 60 s, `docs/G2-lot-u4b-1b-3-delta.md:365-371`) ARRÊTE le `--fill-ts`,
    fail-closed et reprenable : au plus 50 ts à refaire, un temporaire laissé dans `--out`. Analogue Bell, même motif :
    R-SP-A / BELL-RENAME-RETRY-1 (`docs/CHANTIERS.md:894`).
    (5) *Re-checkpoint-2 C-1 (VX-B)* : aucun test n'asserte que le temporaire vit dans `--out` (M17 prouve le remplacement
    par `rename`, pas l'emplacement ; un temporaire hors volume ferait échouer le premier flush) ; le code est correct
    (même dossier, `:397`) (`docs/CHECKPOINT2-lot-u4b-1b-3-re.md:20,37`).
  - **Déclencheurs** (propriétaire : orchestrateur) : R-BORNE-2 (v2) — première reprise réelle sur un sidecar illisible
    malgré `tmp + rename` ⇒ recherche documentée (`ReplaceFileW`, `FILE_RENAME_FLAG_POSIX_SEMANTICS`, `fsync` fichier +
    dossier) ; couvre (1) et (3). Les items O-D3, R-BORNE-2-F et VX-B ont leur propre déclencheur (§7).
  - L'atomicité sous crash réel n'est pas couvrable par un mutant d'exécution normale (même position que la sonde Narabi,
    journal CHANTIERS NARABI-OPS-1b-i) ; M17 prouve le porteur (remplacement par `rename`, jamais de réécriture sur place) ;
    le mutant D1 du G2-delta (copie puis suppression) est aussi tué par ce test (`docs/G2-lot-u4b-1b-3-delta.md:205,215-219`).
- Comportement connu, sans action requise : un kill entre l'écriture du temporaire et le `rename` laisse
  `block-ts-extra.json.tmp-<pid>-<hex>` dans `--out` ; jamais lu (la reprise ne lit que `block-ts-extra.json`), supprimable
  à la main.

### 7. Items formés (propriétaire : orchestrateur ; zéro « dû » nu)
| item | contenu | déclencheur | `error_origin` | source en dépôt |
|---|---|---|---|---|
| **O-1** (élargi aux 4 sites) | refus nommé `SelectError` « `<flag> unreadable: …` » sur les 4 `JSON.parse` nus : `:196` (`runSelect`, discover), `:211` (`runSelect`, sidecar), `:270` (`runCheckVersion`, fichier d'épisode), `:356` (`runFillTs`, discover) ; aujourd'hui `SyntaxError` non nommée, fail-closed et sans effet de bord | prochain lot qui touche `u4b-select-episode.mjs`, ou première entrée réelle illisible | préexistant : G1 de U-4b-1b-2 (`2be517f`) | `docs/G2-lot-u4b-1b-3-delta.md:309-330,394` ; `docs/PLI-lot-u4b-1b-3.md:190-193` ; `docs/CHANTIERS.md:879` |
| **O-D3** | retry borné `EACCES`/`EPERM`/`EBUSY` sur le `renameSync` du sidecar (motif `graceful-fs` ; même exigence que l'item Bell BELL-RENAME-RETRY-1, R-SP-A) | premier arrêt de ce type en course réelle | pli (mode d'échec arrivé avec tmp + rename) | `docs/G2-lot-u4b-1b-3-delta.md:365-371,395` ; `docs/CHANTIERS.md:879,893-894` |
| **O-D4** | refus nommé si `!(Number.isFinite(v) && v >= 0)` pour `--min-interval-ms` (`:368` ; une valeur `NaN` désactive la politesse, `rpc2.ts:137-145`) ; sans effet sur la course prévue (valeur 150, `docs/CHANTIERS.md:844`) | prochain lot qui touche `runFillTs` ou `runCheckVersion` | préexistant : `2be517f` | `docs/G2-lot-u4b-1b-3-delta.md:372-375,396` ; `docs/CHANTIERS.md:879` |
| **VX-B** (re-checkpoint-2 C-1) | test : le temporaire du flush vit dans `--out` (même dossier que le sidecar) | prochain lot qui touche `flush`, ou celui de R-BORNE-2 | pli (trou de test) | `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:20,37` |
| **C-4** (re-checkpoint-2) | `try/catch` de repli autour du `flush("partial")` du `catch` (`:425`), calque `probe-narabi` | celui de R-BORNE-2 (§6) | pli (calque incomplet) | `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:40` ; `docs/CHANTIERS.md:893` |
| **R-BORNE-2-F** (nouveau au fold) | `fsync` du temporaire dans `flush` avant `renameSync` (+ dossier si disponible) ; même exigence que BELL-SHORTPAGE-1 C-6 et GARDE-FSYNC-1 (lots en vol) | ruling de l'orchestrateur sur l'extension du ruling `docs/CHANTIERS.md:889` à `u4b-select-episode.mjs` (non tranchée par ce fold), ou G7 de GARDE-FSYNC-1, au premier des deux | design (pli : aucun `fsync`, modèle de menace limité au kill) + infrastructure (coupures) — même attribution que le précédent Bell (`docs/CHANTIERS.md:865`) | `docs/CHANTIERS.md:864,886-889` ; FAITS `:18-25` |
| **CARTO-T1C-5** | test de composition `u4b_chain_select_to_oracle_path` : `runSelect` → `episode-selection.json` → `run()` du prober `u4-oracle-path.mjs`, seul `fetch` bouchonné | déclencheur initial « G7 de U-4b-1b-3 ou avant l'étape prober de la course, au premier des deux » ATTEINT à ce G7 sans le test (ni le pli ni le micro-pli ne l'ajoutent) ⇒ nouveau déclencheur = ruling de l'orchestrateur ; proposition : pli ou G7 de U-4b-1b-4 (lot qui touche le prober), ou avant l'étape 5 du RUNBOOK de la course Ukemi (prober, `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:355`), au premier des deux | G1 de U-4b-1b-2 (sélecteur `2be517f`, prober `--episode-file` `6930c7a` : composition non rejouée) | `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md:157,237,250` ; `docs/CHANTIERS.md:852` |
| **O-FOLD-1** (relevé au fold) | la docstring de `runFillTs` porte encore le libellé du journal « ~12k lost keyless calls x3 » (`:324` ; déjà `:319` à `801859f`) : l'aligner sur les faits du §2 (1 arrêt 429 + 2 arrêts `malformed block` sur disque ; comptes d'appels du seul journal) | celui de O-1 (prochain lot qui touche `u4b-select-episode.mjs`) | orchestrateur (libellé `docs/CHANTIERS.md:772`, repris par le G1) | §2 ; `docs/G2-lot-u4b-1b-3-delta.md:378-383` |
| **O-MP-1** (micro-pli) | trier les résidus TEMP laissés par un oracle complet (suites `bell-*`, `u2c-snap-*`, `atelier-vocab-*`, `ukemi-weth-*.diag.json` ; aucun en `u4b*`) : nettoyage `finally` ou résidu voulu | prochain lot qui touche `apps/bell/test` ou les tests u2c/ukemi concernés, ou prochaine passe d'hygiène disque | hors lot (suites préexistantes) | rendu du micro-pli (hors dépôt), repris dans l'entrée G7 de `docs/CHANTIERS.md` |
| **O-MP-2** (micro-pli) | vérifier le serveur memstack (`ECONNREFUSED` au démarrage de la session du micro-pli) | avant la prochaine mission qui s'appuie sur memstack | infrastructure (`docs/CHANTIERS.md:866`) | idem ; au fold, `memory_stats` a répondu (2026-09-22 23:34 UTC) : proposé clos par cette mesure |

Observations sans action (relecteurs) : O-D2 — toute valeur de `FLUSH_EVERY` qui divise 50 satisfait le test du flush
périodique ; la durabilité annoncée (un kill perd au plus 50 ts) tient (`docs/G2-lot-u4b-1b-3-delta.md:361-364`). O-D8 —
les nouveaux tests n'ont pas été rejoués sous Linux ; ils n'utilisent que des API Node portables (`:384-386`) ; toute
exécution de CI reste sous la décision 136. O-1 du G2 — flake `UV_HANDLE_CLOSING` (libuv, win32, fin de suite complète),
non reproduit au pli sur deux suites complètes (`docs/PLI-lot-u4b-1b-3.md:198`).

### 8. MAST résiduel
- **Vérification non indépendante / tests déclaratifs** — contré par : 25 mutants au harnais du lot, dont 24 tués chacun
  par SON test nommé dans le TAP (A-11 ; 18 du cœur M1..M17 + D4, 6 supplémentaires D6, M18..M22) et D7 déclaré
  équivalent, qui survit comme prévu ; rejoués par le G2-delta-2 et le re-checkpoint-2, avec le mutant VX-L2 du validateur,
  rouge (`docs/CHANTIERS.md:895`) ; restauration byte-exacte. Mutants propres des relecteurs à chaque tour (G2 : 5,
  `docs/G2-lot-u4b-1b-3.md:64-72` ; checkpoint-2 : 7, `docs/CHECKPOINT2-lot-u4b-1b-3.md:21` ; G2-delta : 9,
  `docs/G2-lot-u4b-1b-3-delta.md:198-213` ; re-checkpoint-2 : 5, `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:20`) : chaque
  survivant est devenu une correction (C-G2-*, C-V-2, C-GD-1, C-GD-2) ou un item (VX-B).
- **Perte d'état / terminaison prématurée (kill dur, coupure)** — contré par : flush périodique observé EN COURS de run
  (M12), `tmp + rename` (M17 ; D1 du G2-delta), reprise sans re-fetch (M5), idempotence `complete` (M15) ; résidus
  R-BORNE-2 (atomicité Windows non documentée) et R-BORNE-2-F (coupure sans `fsync`).
- **Dérive de spécification** (lecture non bornée du prereg vs domaine observé) — contrée par : D-BORNE-1 déclarée comme
  restriction, seul cas basculant nommé et borné à H-0 (point 3), variante exacte écartée avec motif (point 4) ; arêtes
  `== to_block`, `== to_block + 1`, `≥ to_block + 2` et `--b-hi < to_block` rejouées par le checkpoint-2.
- **Blocage par ressource** (verrou de cycle tenu après un refus ; C-GD-3 (b)) — contré par : les 5 refus locaux
  s'exécutent avant l'ouverture du garde (point 6), mesuré refus par refus par la sonde du G2-delta : 6/6 sur `d2e36ac`,
  1/6 sur `801859f` (`docs/G2-lot-u4b-1b-3-delta.md:141-150`). **Bloc entier** prouvé par M9 et M10 ; **refus par refus**,
  épinglé pour `to_block` (M10, assertion `:578`), sidecar illisible (M11 et D5 du G2-delta, `:608`), `discover_sha` (D6,
  `:583` et `:664`), self-sha (D4, `:682`) et « sans objet » (M18, `:702`) — les trois derniers depuis le micro-pli
  (C-GD-1) ; relance du même cycle et libération de tous les verrous (`:590`, D8 du G2-delta). Sonde indépendante du
  G2-delta-2 sur l'objet absent : 5/5 formes, 0 verrou (`docs/CHANTIERS.md:895`).

### 9. Traçabilité des corrections repliées (chaque correction → sa source → son emplacement → son `error_origin`)
| correction | source | où dans cette v3 | `error_origin` | état |
|---|---|---|---|---|
| C-V-1 (verrou tenu après un refus de reprise) | `docs/CHECKPOINT2-lot-u4b-1b-3.md:37` | §3 pt 6 ; §8 « Blocage » | G1 `801859f` (adjugé `docs/CHANTIERS.md:854`) | fermée au pli (M9-M11) ; refus par refus au micro-pli (D4, D6, M18) |
| C-V-2 (3 tests manquants) | `:38` | §4 (tests `:613`, `:651`, `:668`) | G1 | fermée au pli (M12-M14) |
| C-V-3 (a) « tête de chaîne » | `:39` | §2 (a) | G1 | fermée au pli |
| C-V-3 (b) « ts > to_block dans le brut réel » | `:39` ; erratum `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:29-30` | §2 (b) | revue checkpoint-2 (énoncé déduit du code sans mesure, reconnu `-re.md:30` ; `docs/G2-lot-u4b-1b-3-delta.md:307`) | erratum rendu ; mesure journalisée `docs/CHANTIERS.md:854` |
| C-V-4 (texte R-BORNE-1) | `:40` | §6 R-BORNE-1 | G1 | fermée au pli |
| C-V-5 (numéro, MAST) | `:41` | en-tête ; §8 | numéro : déféré par conception (`docs/G1-lot-u4b-1b-3.md:36` ; « pas un défaut », `docs/G2-lot-u4b-1b-3.md:98`) ; MAST absent : G1 | fermée au pli ; mise à jour au fold |
| C-V-6 (`phase` du `.d.mts` vs code) | `:42` | §3 pt 7 | G1 | fermée au pli (M16) |
| item tmp + rename | `:43` | §3 pt 5 ; §6 R-BORNE-2 | G1 (réécriture sur place) | clos par implémentation au pli (M17) |
| C-G2-1 (gardes de reprise, idempotence) | `docs/G2-lot-u4b-1b-3.md:106` | §4 (`:651`, `:668`, `:709`) | G1 | fermée au pli (M13-M15) |
| C-G2-2 (flush tous les 50) | `:108` | §4 (`:613`) | G1 | fermée au pli (M12) |
| C-G2-3 (`phase` absente) | `:110` | §3 pt 7 | G1 | fermée au pli (absence refusée, M16) |
| C-GD-1 (verrou refus par refus) | `docs/G2-lot-u4b-1b-3-delta.md:336-343` | §3 pt 6 ; §8 « Blocage » | pli | fermée au micro-pli (D4, D6, M18 ; `docs/CHANTIERS.md:895`) |
| C-GD-2 (fixtures sans `phase`) | `:345-350` | §3 pt 7 | pli (fixtures `:166`/`:178` gardées sans `phase` après C-V-6, `docs/PLI-lot-u4b-1b-3.md:59`) | fermée au micro-pli (M20, M21 ; D7 équivalent) |
| C-GD-3 (a) (sources de R-BORNE-2) | `:353` | §6 R-BORNE-2, « Sources » | pli (texte v2) | fermée au fold |
| C-GD-3 (b) (ligne MAST « Blocage ») | `:354` | §8 | pli (texte v2) | fermée au fold |
| C-GD-3 (c) (« ×3 STOP ») | `:355` ; O-D7 `:378-383` | §2 « Arrêts du `--fill-ts` » | orchestrateur (journal `docs/CHANTIERS.md:772`, repris par le G1 et le pli) | fermée au fold |
| C-GD-3 (d) (journal de la mesure) | `:356` | §2 (b) | n-a (acte de fold prévu, pas un défaut) | faite : `docs/CHANTIERS.md:854` + §2 (b) |
| re-checkpoint-2 C-1 (VX-B) | `docs/CHECKPOINT2-lot-u4b-1b-3-re.md:37` | §6 (5) ; §7 | pli (trou de test) | item formé |
| re-checkpoint-2 C-2 (fold + journal) | `:38` | cette v3 ; §2 (b) | n-a (acte de fold, pas un défaut) | fold = cette v3 ; journal `docs/CHANTIERS.md:854` |
| re-checkpoint-2 C-3 (`error_origin`, provenance du journal de pli) | `:39` | §9 ligne C-V-1 ; ligne de provenance ajoutée à `docs/PLI-lot-u4b-1b-3.md` | C-V-1 : G1 ; journal de pli réécrit sans déclaration : orchestrateur | fermée au G7 |
| re-checkpoint-2 C-4 (flush du `catch`) | `:40` | §6 (3) ; §7 | pli ; libellé « lecteur non-Node » : revue re-checkpoint-2 (non mesuré ; corrigé par `docs/CHANTIERS.md:893`) | sous le déclencheur de R-BORNE-2 |
| D-1 (persistance des revues du micro-pli) | mesure du fold | §1, note D-1 | orchestrateur (`91a719b`) | corps re-persistés au G7 |
| compte G7 attendu | mesure du fold | §1, note « compte G7 » | orchestrateur (valeur calculée contre `a703e24`) | attendu recalculé (951/950/0/1) |
| checkpoint-1 absent | `docs/CHANTIERS.md:797` | §1 | orchestrateur | déviation consignée |
| arrêt du `--fill-ts` réel (motif du lot) | `docs/CHANTIERS.md:772` | §2 « Cause » | plan | corrigé par D-BORNE-1 |

*(ADR-U4b n'est PAS dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Cet amendement
n'édite AUCUNE valeur de référence existante : il APPEND une section datée. Le worker ne committe pas (R-20) ;
l'orchestrateur folde et committe au G7.)*

## Amendement daté 2026-09-22 (HARNESS-DESC-1 — description servie de `gate` conditionnelle à l'état du registre ; CARTO-T1C-2) — À INSÉRER par l'orchestrateur (R-20)

> **Provenance.** Rédaction : worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, décision 133 ; effort
> max ; Opus 5 banni), 2026-09-22, base `lot/etude-suite` @ `153582f`, branche `lot/harness-desc-1` (worktree dédié).
> **Insertion dans l'ADR par l'orchestrateur `claude-fable-5-1` SEUL** (R-20 ; le worker ne committe pas).
> Réviseurs : orchestrateur (R-21), G2, checkpoint-2. **Aucune décision de valeur nouvelle** (checkpoint-1
> HARNESS-DESC-1 CA-2) : cet amendement exécute le critère d'état déjà fixé par le checkpoint-1 U-4b-2 C-1
> (`docs/CHECKPOINT1-lot-u4b-2.md:98`) et le G0 2a-3 (`docs/G0-lot-u4b-2.md:55`), avec les corrections C-1..C-9 du
> checkpoint-1 HARNESS-DESC-1 (`docs/CHECKPOINT1-lot-harness-desc-1.md`) et le ruling orchestrateur sur la phrase
> conditionnelle (C-1).

### 1. Constat (mesuré à `153582f`, exécution des modules réels, sans réseau)

`hasCommittedCalibrationForClass("liquidation-eligible-coverage") = false` (registre vide de la classe), alors que
la description servie de l'outil `gate` — `GATE_TOOL_DESCRIPTION`, servie par `registry.ts:61` → `registerTool`
(MCP `tools/list`) et par `openapi.ts:73` (`GET /openapi.json`) — portait `LIQ_UPPER_BOUND_SENTENCE` et
`LIQ_H3_SENTENCE` (« calibrated on one recorded episode », `gate.ts:150`) et **ne** portait **pas**
`LIQ_EMPTY_REGISTRY_SENTENCE` (cartographie temps 1, R-10 / CARTO-T1C-2 ; re-mesuré indépendamment par le
checkpoint-1 et par le G1). `LIQ_H3_SENTENCE` est déclarative : rien n'est calibré dans le registre servi ⇒
sur-revendication servie. Le test `apps/harness/test/gate-liq.test.ts:185` épinglait cette présence.

### 2. Décision D-HD-1 (exécution de cp-1 U-4b-2 C-1 / G0 2a-3)

La description servie de `gate` est une **fonction PURE de l'état du registre** :
`describeGate(registryHasLiq: boolean)` (`gate.ts:194`) et
`GATE_TOOL_DESCRIPTION = describeGate(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE))` (`gate.ts:220`),
évaluée **au chargement** (même clé de niveau REGISTRE que `honestyText`, delta D-3).
- **Registre vide** : clause liq = `LIQ_EMPTY_REGISTRY_SENTENCE` ; `LIQ_REQUIREMENTS_SENTENCE` (le 400 alpha/nMin est
  levé AVANT le lookup, `gate.ts:574-583` à la base — vrai sur registre vide ; cp-1 U-4b-2 C-7) ;
  `LIQ_CONDITIONAL_SENTENCE` (**ruling orchestrateur** : énoncé d'une règle, pas une revendication de couverture ;
  le site la rend au temps 1, `ukemi-copy.ts`). **Jamais** `LIQ_UPPER_BOUND_SENTENCE` ni `LIQ_H3_SENTENCE`.
- **Registre non vide (-2b)** : « the served region is » + UPPER ; REQ ; H3 ; COND — **byte-identique** au texte
  pré-lot (sha256 de `describeGate(true)` = sha256 de l'ancienne `GATE_TOOL_DESCRIPTION` =
  `5574450432b7252bb82a31e51eb01b707d286fc9bf4af425a2bf5bce787aed77`, 3 193 caractères).
- **Aucune autre phrase servie modifiée** : dump avant/après de `tools/list` et de `/openapi.json` (arbre fusionné
  à blanc avec `lot/etude-suite` @ `071b3ee`) ⇒ seul `gate.description` (tools/list) et `/gate` `post.description`
  (openapi) diffèrent ; `cascade`/`attest`/`calibrate`, les schémas d'entrée/sortie de `gate`, `info.version`
  (`0.4.0`) et `servers` sont byte-identiques. `honestyText` (texte `content` de `tools/call`) était déjà
  conditionnel et n'est pas touché. Aucun bump de version, aucun changement du set d'outils, aucune publication
  externe (décision 51 Q2 : changement de contenu dans le set de 4).

### 3. Tuyaux (ADR-M018 ; règle de Branchement) — ligne à ajouter à la table Tuyaux (complète la ligne :26 « région servie »)

| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test |
|---|---|---|---|---|
| description servie de `gate` (classe liq) | `COMMITTED_CALIBRATIONS` (`calibration.ts:195`) → `hasCommittedCalibrationForClass` (`:228`) → `describeGate` → `GATE_TOOL_DESCRIPTION` (`gate.ts:194,220`) | `HARNESS_TOOLS[gate].description` (`registry.ts:61`) → `registerTool` → MCP `tools/list` ; `openapi.ts:73` → `GET /openapi.json` ; clients MCP/HTTP ; CA de déploiement `scripts/verify-harness.mjs` (`gate_liq_call`, `mcp_gate_description_liq`) ; trace h5 (`response_sha256` de `tools/list`) | constante de module évaluée au chargement : **UN état observable par processus** ; bascule automatique à la première entrée liq committée (-2b) | `hdesc_served_gate_description_is_the_empty_registry_clause` (chemin réel : descripteur + `tools/list` in-process + `/openapi.json`, liage A-10), `hdesc_describe_gate_two_states` (fonction pure, deux états — **n'est pas** la preuve CA-11 de -2b), `hdesc_liq_clause_never_says_interval_in_both_states`, `hdesc_both_description_states_pass_vocab`, `gate_description_makes_no_probative_claim` (étendu à `describeGate(true)`), `verify_harness_ca_passes_on_the_in_process_harness` (CA bout en bout hors réseau), `probe_harness_records_real_decision` (pin h5 `90a21adf…`) |

Test de composition (non-LLM) : `hdesc_served_gate_description_is_the_empty_registry_clause` rejoue la composition
registre → description → `tools/list` réel (SDK in-process, `createHarnessHandler`) → `/openapi.json` réel
(`handleJsonMirror`) et asserte l'égalité des trois surfaces entre elles et à `describeGate(état du registre)`, la
clause liq EXACTE (construite depuis les constantes, indépendamment de `describeGate`) et l'absence, sur toutes les
feuilles chaîne servies, des phrases de couverture committées. La CA de déploiement rejoue le même contrôle sur la
surface servie en ligne (`mcp_gate_description_liq`) et l'appel de la classe (`gate_liq_call` : 200, `under_calib`,
phrase registre-vide dans `content`) — c'est ce contrôle qui prouve, après redéploiement (CARTO-T1C-1), la phrase
« served through the gate » de `/ukemi`.

### 4. Item formé -2b (checkpoint-1 HARNESS-DESC-1 C-4) — déclencheur : G1 de U-4b-2b ; propriétaire : orchestrateur (G0 -2b, ligne 2b-7)

À la première entrée liq committée, dans le MÊME lot : (a) le test du chemin réel asserte sur le registre FRAIS
que la description servie porte UPPER + REQ + H3 + COND et PAS EMPTY (le test actuel rougit par construction —
sa précondition `hasCommittedCalibrationForClass === false` tombe — : tripwire, à re-scoper sur l'état committé,
jamais supprimé) ; (b) re-pin h5 propre (`response_sha256` de `tools/list` rechange) ; (c) bascule des deux contrôles
de la CA (`mcp_gate_description_liq` : H3 présent, EMPTY absent ; `gate_liq_call` : ŷ d'une strate committée ⇒
`covered` avec `hi = ŷ + q̂_k`, ŷ d'une strate non committée ⇒ `under_calib`) ; (d) le survivant déclaré §6 (R-HD-1)
y devient tuable. Ligne connexe à former au G0 -2b (2b-5/2b-7, note du checkpoint-1) : rien ne fait rougir le
site quand le registre se remplit alors que `/ukemi` rend la phrase registre-vide comme état servi.

### 5. `error_origin` de la déviation -2a (checkpoint-1 HARNESS-DESC-1 C-8)

- **Générateur** : le G1 -2a a interpolé la clause committée (UPPER + H3) **sans condition** dans
  `GATE_TOOL_DESCRIPTION`, contre son propre G0 (2a-3 : « upper bound » réservé au registre non vide ; description
  -2a = REQ + phrase registre-vide) et contre le cp-1 U-4b-2 C-1 ; il a épinglé la sur-revendication par
  `gate-liq.test.ts:185`.
- **Vérification** : le G2 -2a et le checkpoint-2 -2a ont accepté la description sur un critère de **vocabulaire**
  (« 0 interval / 0 probabilité » sur la tranche de 648 caractères, `docs/CHECKPOINT2-lot-u4b-2a.md:27`) au lieu du
  critère d'**état** du cp-1 U-4b-2 C-1 (« la description ne contient aucune phrase de couverture »).
- Détection : cartographie temps 1 (CARTO-T1C-2) ; le retard de déploiement (CARTO-T1C-1, confirmé sur place) a
  empêché la publication en ligne de cette description.

### 6. MAST (checkpoint-1 C-7) et résidus nommés

- **Vérification incorrecte** (tests par présence seule, cp-2 -2a C-2) ⇒ assertions d'ABSENCE (liste fermée de mots
  committés sur la tranche liq ; phrases committées exactes sur toutes les feuilles servies) + 25 mutants nommés,
  tués chacun par son test attendu (A-11, TAP `not ok … - <nom>`), restaurés byte-exact.
- **Dérive de périmètre** ⇒ invariance byte-à-byte des trois autres descriptions et de tous les autres champs servis
  (dump avant/après, §2) ; la trace h5 ne change que d'UN champ (`response_sha256`), taille 21 943 octets inchangée.
- **R-HD-1 (survivant déclaré, inobservable aujourd'hui)** : le site d'appel codé en dur
  `GATE_TOOL_DESCRIPTION = describeGate(false)` est indiscernable du vrai liage sur registre vide (un état par
  processus) ; il survit à toute la suite — mesuré par le G2 sur la suite COMPLÈTE (927/926/0/1 sous le mutant, `docs/G2-lot-harness-desc-1.md` §3.3 ; la preuve G1 ne couvrait que 5 fichiers). Il représente une CLASSE : toute expression fausse sur le registre
  livré au site d'appel survit de même. Déclencheur : G1 -2b, item §4 (d), qui tue la classe en bloc. Garde
  structurelle par lecture de source envisagée et écartée (déclarative au sens D-1, fragile au formatage).
- **R-HD-2 (observation, pré-existence mesurée)** : sous win32, quand la CA ÉCHOUE, le script se termine par
  l'assertion libuv `src\win\async.c` (code 3221226505) au lieu de 1 — mesuré 3/3 sur le script PRÉ-LOT (blob
  `153582f`) comme sur celui du lot ; même assertion que celle déjà documentée à `test/h5-e2e-probe.test.ts:165`.
  La sortie reste non nulle (fail-closed), le JSON de CA est imprimé avant, et le RUNBOOK traite déjà « ANY non-zero
  exit » comme ROUGE (`docs/RUNBOOK-harness.md`, étape 6). **Item O-1b-G2-1 (re-G2 du micro-pli, `docs/G2-lot-harness-desc-1-1b.md` §5)** : sous win32, `process.exit()` après `fetch` finit TOUJOURS sur l'assertion libuv (code 3221226505 quel que soit l'argument) ⇒ le code de sortie est non discriminant ; remède MESURÉ = `process.exitCode = 1` puis retour (exit 1 sans assertion, exit 0 en succès), à appliquer aux deux sites de sortie de `scripts/verify-harness.mjs` puis resserrer le test (3) à `r.code === 1` — retire R-HD-2. Déclencheur : prochaine modification de la CA, au plus tard la bascule -2b ; propriétaire : orchestrateur.
- **CA avant redéploiement** : contre le processus en ligne (antérieur à -2a, CARTO-T1C-1), les deux contrôles neufs
  sont ROUGES par construction (classe inconnue ⇒ 400 ; description sans la phrase registre-vide) ; ils deviennent
  verts au redéploiement à un SHA contenant ce lot. `docs/RUNBOOK-harness.md` (étape 6) énumère les deux contrôles
  (modifié dans le lot).

### 7. Liste fermée des porteurs (checkpoint-1 C-9, mesurée par grep des lignes NON commentaires de `apps/harness/src`)

Phrases de couverture liq servies : `gate.ts` seul — `LIQ_UPPER_BOUND_SENTENCE` (`:140-142`), `LIQ_H3_SENTENCE`
(`:149-151`) et leurs compositions `LIQ_COMMITTED_SENTENCE` (`:163` → `honestyText`, branche committée, déjà
conditionnelle) et la branche pleine de `describeGate`. `LIQ_CONDITIONAL_SENTENCE` (`:156-158`) = règle (ruling).
`schema-projection.ts` : **0** phrase de couverture liq. `ukemi-predict.ts:63` porte une NÉGATION (« no coverage is
claimed here… ») dans un outil non enregistré (U-5b) : non porteur.

### 8. ADR-M012 item (i) — clos

Déclencheur (« prochain lot touchant `GATE_TOOL_DESCRIPTION` ») atteint ; la déduplication est déjà faite et épinglée
(`apps/harness/test/gate.test.ts:535`, 0 occurrence de « every other » dans la description) et reste vraie dans les
deux états ⇒ item consigné **clos**.

### 9. Gel D4

Les 9 sha gelés (§2 du prereg ; tableau D4 de cet ADR — re-gel décision 126, puis QF-2 :402-407) sont byte-identiques AVANT (blobs `153582f`) == APRÈS (disque du lot)
== arbre fusionné à blanc (`071b3ee` + lot). Aucun fichier du gel ni cet ADR n'est dans le diff du lot.

### 6-bis. Contrôle négatif de la CA de déploiement (micro-pli HARNESS-DESC-1b, correction G2 C-G2-1) — À INSÉRER par l'orchestrateur (R-20)

Provenance : worker `claude-opus-5-5[1m]` (effort max, décision 133), 2026-09-22/23 UTC, base `906064b` (lot HARNESS-DESC-1),
pli test seul. Source de la correction : `docs/G2-lot-harness-desc-1.md` §6 (C-G2-1). Aucun octet servi ne change
(`apps/harness/src/**` et `scripts/verify-harness.mjs` intacts ; pin h5 `90a21adf…` inchangé). Placement proposé :
après §6 (MAST et résidus nommés) ; l'extension de l'item §4 (c) est donnée à la fin de cette section.

**Constat (G2, mesuré sur la suite complète).** On pouvait vider les prédicats des deux contrôles neufs de la CA
sans faire rougir aucun test : G2-5a (`mcp_gate_description_liq` réduit à `res.status === 200`), G2-5b (`!hasH3`
retiré) et G2-5c (`gate_liq_call` réduit à `ok: true`) survivaient. `verify_harness_ca_passes_on_the_in_process_harness`
prouve seulement que la CA ne donne pas de fausse alarme. Il ne prouve pas qu'elle alarme.

**Test ajouté (nommé).** `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (`test/verify-harness-liq.test.ts`,
test (3)).
- Le système sous test est la CA elle-même, `scripts/verify-harness.mjs`, lancée en processus enfant comme au
  déploiement.
- Le vecteur adverse (D-2) est un mandataire `node:http` sur `127.0.0.1:0`. Il reprend le motif de
  `test/probe-narabi-state.test.ts` (`serve()`) et se place devant le VRAI harness in-process (`startServer(0)`).
- Toute requête passe à l'identique : trame SSE réelle du SDK, corps réels du miroir (A-8). Il y a exactement deux
  points de réécriture :
  - la description servie de `gate` dans `tools/list`. La chaîne JSON-échappée de `GATE_TOOL_DESCRIPTION` est
    remplacée dans la trame réelle. Si elle n'y figure pas exactement une fois, le mandataire répond 500 (fail-closed) ;
  - la réponse au `POST /gate` de la classe liq sur la surface `api.`.
- Tous les littéraux sont liés par import (`describeGate`, `GATE_TOOL_DESCRIPTION`, `LIQ_*_SENTENCE`, `TASK_*`,
  `API_HOST_PREFIX`) ; aucun n'est recopié.

Quatre vecteurs. Chacun isole un prédicat :

| Vecteur | Description servie | Réponse liq servie | Contrôles rouges attendus (liste FERMÉE) | Prédicat isolé |
|---|---|---|---|---|
| (alpha) | `describeGate(true)`, texte pré-lot : H-3 présent, EMPTY absent | **400** `{ error: "tool_error", operation: "gate", message: "unknown task_class …" }`, forme `apps/harness/src/http.ts:102`, message de `1447c05:apps/harness/src/tools/gate.ts:551` (processus pré-2a) | `gate_liq_call` + `mcp_gate_description_liq` | la vacance globale (G2-5a, G2-5c) |
| (beta) | EMPTY **et** H-3 servis ensemble (état « empty-clause-keeps-coverage » du G2, restreint à EMPTY + REQ + H-3 + COND : UPPER omis volontairement, la CA ne le teste pas, cf. R-1b-2) | corps RÉEL 200 où `reason` passe de `under_calib` à `covered` ; la phrase registre-vide reste dans `content` | `gate_liq_call` + `mcp_gate_description_liq` | `!hasH3` (G2-5b) et `reason === "under_calib"` |
| (gamma) | description du lot (`GATE_TOOL_DESCRIPTION`) | corps RÉEL 200 `under_calib` dont `content` porte `LIQ_COMMITTED_SENTENCE` À LA PLACE de la phrase registre-vide | `gate_liq_call` seul | `said === true` |
| (delta) | description sans EMPTY ni H-3 (classe de défaut du texte en ligne pré-2a, qui ne porte aucune clause liq : CARTO-T1C-1) | corps RÉEL 200 (inchangé) | `mcp_gate_description_liq` seul | `hasEmpty` |

Assertions pour chaque vecteur :
- l'ensemble des contrôles rouges est ÉGAL à la liste fermée. Les 10 autres contrôles (alpha, beta) ou les 11 autres
  (gamma, delta) restent verts : le mandataire est fidèle, et le rouge vient des seuls contrôles liq ;
- le `detail` émis par la CA pour les deux contrôles liq est égal à la valeur attendue. C'est l'auto-preuve que la CA
  a lu le vecteur voulu ;
- les compteurs du mandataire valent `{ rewrites: 2, liq: 1 }` : il a bien réécrit les deux `tools/list` et
  intercepté l'unique appel liq ;
- l'exit de la CA est **≠ 0**, et non `=== 1`, à cause de R-HD-2. Mesuré sous win32 : 3221226505 pour les quatre
  vecteurs.

**Tuyaux (vérification).**

| Tuyau | Entrée | Sortie | État | Test |
|---|---|---|---|---|
| contrôle négatif de la CA | `scripts/verify-harness.mjs` exécuté tel que déployé, contre le harness réel servi derrière le mandataire | verdict du test dans `npm test` (job CI `g3-verification`, `.github/workflows/ci.yml:99,111`) | sans état : ports éphémères `127.0.0.1`, serveurs fermés en `finally` (`closeAllConnections` + `close`) | le test nommé ci-dessus |

**Mutants.** Chacun est tué par ce test, en byIntended A-11 (TAP `not ok … - verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`).
Les mutants sont restaurés à l'octet. Les vecteurs s'exécutent dans l'ordre alpha → beta → gamma → delta. Le premier
vecteur rouge, lu dans le `error:` du TAP, prouve donc que les vecteurs précédents n'attrapaient pas le mutant.

| Mutant (`scripts/verify-harness.mjs`) | Hunk | Premier vecteur rouge (assertion) |
|---|---|---|
| G2-5a (exigé) | `:253` `return { ok: res.status === 200 && hasEmpty && !hasH3,` → `return { ok: res.status === 200,` | (alpha) ensemble rouge ≠ `gate_liq_call + mcp_gate_description_liq` |
| G2-5b (exigé) | `:253` même motif → `return { ok: res.status === 200 && hasEmpty,` | (beta) idem |
| G2-5c (exigé) | `:240` `return { ok: res.status === 200 && reason === "under_calib" && said === true,` → `return { ok: true,` | (alpha) idem |
| ca-reason-dropped (auto-déclaré) | `:240` `… && reason === "under_calib" && said === true,` → `… && said === true,` | (beta) idem |
| ca-said-dropped (auto-déclaré) | `:240` ` && said === true,` → `,` | (gamma) ensemble rouge ≠ `gate_liq_call` |
| ca-has-empty-dropped (auto-déclaré) | `:253` `hasEmpty && !hasH3,` → `!hasH3,` | (delta) ensemble rouge ≠ `mcp_gate_description_liq` |

Résultats :
- G2-5a, G2-5b et G2-5c survivaient avant ce pli sur `906064b`. Leurs octets mutés ont les mêmes sha que ceux du G2.
- Les 25 mutants du G1 restent tués par leur test attendu (28/28 exigés), et les 3 auto-déclarés sont tués (3/3).
- Les 8 mutants à tuer du G2 restent rouges.
- Les 4 mutants CA du G1 font aussi rougir le nouveau test. Cela ne change pas leur attribution byIntended.

**Résidus nommés (jamais tus).**
- **R-1b-1, équivalents déclarés et mesurés comme survivants.** Il s'agit du retrait isolé de `res.status === 200`,
  dans `gate_liq_call` (`:240`) et dans `mcp_gate_description_liq` (`:253`).
  - Aucun producteur réel ne sert un statut ≠ 200 avec un corps que ces contrôles accepteraient.
  - Côté miroir, le seul site qui émet `structuredContent` répond avec le statut par défaut 200
    (`apps/harness/src/http.ts:98`).
  - Côté SDK `@modelcontextprotocol/server@2.0.0`, une réponse de requête JSON-RPC (donc un `result` de `tools/list`)
    est servie en 200 seulement, en SSE (`dist/index.mjs:754-756`) comme en JSON (`:893-897`). Une non-requête reçoit
    202 sans corps (`:682`) ; une erreur reçoit un corps `{ jsonrpc, error, id: null }`, sans `result` (`:367-379`).
  - Ces prédicats sont donc une défense en profondeur. Déclencheur de réexamen : un changement du SDK ou du miroir.
- **R-1b-2, lacune O-6 (G2), mesurée.** La CA n'exige pas l'absence de `LIQ_UPPER_BOUND_SENTENCE` dans la
  description. Une surface qui sert EMPTY + UPPER sans H-3 passe donc la CA.
  - Mesure : branche vide + UPPER ⇒ les tests CA restent verts.
  - Le défaut, s'il vient du code servi, est tué en dépôt par
    `hdesc_served_gate_description_is_the_empty_registry_clause`.
  - Aucun SHA servi connu ne porte cet état : pré-2a sans EMPTY, 2a..pré-lot avec H-3, lot vert (G2 §6).
  - Ajouter l'absence d'UPPER est un changement de la CA, hors du périmètre de ce pli test-only.
  - Item : propriétaire orchestrateur ; déclencheur = la prochaine modification de la CA, au plus tard la bascule
    -2b (§4 (c)), où les deux prédicats sont réécrits de toute façon.

**Extension de l'item §4 (c) (bascule -2b).** À la première entrée liq committée, dans le MÊME lot :
- basculer les deux contrôles de la CA ;
- re-dériver les QUATRE vecteurs et leurs listes fermées contre les prédicats de l'état committé. Exemples de surfaces
  sur-revendicatrices à -2b : EMPTY servi alors qu'une calibration est committée ; H-3 absent ; `under_calib` sur une
  strate committée ;
- rejouer les six mutants de prédicats ci-dessus (G2-5a/b/c + les 3 auto-déclarés) contre la CA basculée.

Sans cette bascule, le test (3) rougit par construction à -2b : en (gamma), `GATE_TOOL_DESCRIPTION` porterait H-3.
C'est un fil-piège, à re-scoper et jamais à supprimer. Il empêche aussi qu'une bascule vacante de la CA passe la CI,
ce qui était le risque nommé par le G2.

**Observation (classe connue, pas de nouvel item).**
- Pendant la vérification du pli, un rejeu du harnais G2 sous G2-5a a produit UNE fois un `not ok` de niveau fichier
  sur `test/verify-harness-liq.test.ts`, sans le `not ok` nommé.
- Le log n'est pas signé : le TAP brut n'avait pas été conservé.
- Aucun des rejeux suivants ne l'a reproduit : 52 sous G2-5a, 40 sans mutant, 3 séquences G2 complètes avec TAP brut
  conservé.
- Rattachement par inférence : la classe D4 est documentée pour les fichiers de test à serveur sous `--test-force-exit`,
  en local Windows, avec la CI ubuntu non exposée. Sources : `docs/CHANTIERS.md:586` et
  `docs/CHECKPOINT2-lot-t1a-iii-a1-bis.md:63` (« échecs niveau fichier non signés »). L'item D4 existant la couvre
  (propriétaire orchestrateur ; déclencheur : Node local portant le correctif amont, ou premier rouge de cette forme
  sur ubuntu).
- Le sens est fail-safe : un `not ok` nommé absent compte comme mutant NON tué, jamais comme une fausse mise à mort.

**`error_origin` de C-G2-1 (re-cp-2 C-V-3, `docs/CHECKPOINT2-lot-harness-desc-1-1b.md`)** : générateur (G1 : test (2) positif seul, aucun contrôle négatif de la CA) + vérification (le cp-2 initial a accepté C-5 sur un rejeu rouge manuel hors dépôt sans exiger que la suite impose le négatif ; les mutants G2-5a/b/c l'ont prouvé).

### Addendum d'insertion (orchestrateur `claude-fable-5-1`, G7 HARNESS-DESC-1, 2026-09-23)
- Chaîne de revue : checkpoint-1 (`docs/CHECKPOINT1-lot-harness-desc-1.md`, C-1..C-9) ; G1 `906064b` (`docs/G1-lot-harness-desc-1.md`, intégral `docs/G1-lot-harness-desc-1-integral.md`, worker `claude-opus-5-5[1m]`) ; G2 PASS-AVEC-CORRECTIONS (`docs/G2-lot-harness-desc-1.md`, C-G2-1) ; checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-harness-desc-1.md`, C-V-1) ; micro-pli test-only `7cc6176` (contrôle négatif de la CA par mandataire loopback, 31/31 mutants) ; re-G2 PASS (`docs/G2-lot-harness-desc-1-1b.md`) ; re-checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-harness-desc-1-1b.md`, C-V-1 étendue = cette insertion, C-V-3 ci-dessus).
- Ruling cp-2 §4 : `/ukemi` en ligne devient VRAIE ssi la CA `scripts/verify-harness.mjs` est verte après redéploiement (12/12 dont `gate_liq_call` et `mcp_gate_description_liq`, `tls.authorized`, `docs/deploy-CA-harness.json` régénéré, JOURNAL nommant le SHA) ; vérité datée `checked_at`, procédurale (RUNBOOK-harness étape 6). Observation (CARTO-T1C-1) : étendre la CA à COND et `n_calib`.
- Items suivis : R-1b-1 (S1/S2, déclencheur SDK/`http.ts`), R-1b-2 (= O-6 : UPPER exigé absent par la CA ; prochaine modification de la CA), O-1b-G2-1 (ci-dessus), O-1b-G2-2 (durée du test (3) ; premier dépassement), extension §4 (c) (à -2b : re-dériver les 4 vecteurs, rejouer les 6 mutants), IF-1 (G2 A-9 : 4e exemption `verified` au re-pin h5 de ce lot ou de U-5b), O-1b-1/D4 (flake de niveau fichier, item D4 existant).
- Ordre de fusion : après A-9-OUTILLE (`eab911a`) et U-4b-1b-3 (`b9eb62b`) ; avant le redéploiement du harness à un SHA nommé (décision 137 : investisseur informé).
