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

## Amendement daté 2026-09-23 (U-4b-1b-4 — outillage de course hors gel : ancre pré-B₀ réelle, helper `--usdt-blocks` sur la forme réelle, sonde (d) `s_cutoffTime` ; fold G7 : G1 `30a2eee` + micro-pli `206bc56`)

> **Provenance.** G1 : worker `claude-opus-5-5[1m]` (effort max, décision 133), commit de lot `30a2eee` (parent = merge-base
> avec `lot/etude-suite` = `030fe06`), rendu persisté `docs/G1-lot-u4b-1b-4.md`. Micro-pli U-4b-1b-4b (C-G2-1 code,
> C-G2-2..C-G2-5 tests) : même worker, contexte intact, commit `206bc56`. Texte v1 de cet amendement : worker du G1, rendu
> hors dépôt (sha256 `dbe6f780b7de8615592e4e1c389f12348b91f126c8797c6a28ef70b4782a6604`). **Fold G7 (ce texte)** : worker
> `claude-opus-5-5[1m]` (effort max), 2026-09-23, repris à 04:23:26Z (`date -u`) après une coupure de session (429), docs
> seulement, aucun commit (R-20) ; il replie les
> corrections du checkpoint-2, du G2, du re-G2 et du re-checkpoint-2 et assigne un `error_origin` à chacune (§4, §9).
> **Insertion par l'orchestrateur `claude-fable-5-1` SEUL**, en queue de ce fichier, dans le commit du G7 ; réviseur =
> orchestrateur (R-21). Corps D1..D5 et amendements antérieurs byte-identiques : ajout pur en fin de fichier. Cet ADR n'est
> pas dans le diff du lot (`git diff --quiet 030fe06 206bc56 -- docs/adr/ADR-U4b-calibration-episode-frais.md`). Lignes de
> code citées au bout du lot (`206bc56`) : `scripts/census/u4-oracle-path.mjs` sha256 LF
> `4ed4c31e99f148b9d6285926f010cd7beb5f3b686c70a9e7188b3c0c7f8f0d7a` ; `scripts/census/u4b/u4b-probe-cutoff.mjs` sha256 LF
> `8bdb1478e7b3c107b91f5daa9c01642ef97956033ddaf72cfe29b3d73f19e56b` (version du G1 `30a2eee` :
> `deffbb6b79e802875e5519801eacfce00299ac6b926eb09d400fd93f30c50a57` ; prober avant le lot :
> `a2b39d0edf0d7ba4612ba67ddad0857faa61352198092ef6dad69953486975a8`) — mesures `git show <c>:<f> | tr -d '\r' | sha256sum`.

### 1. Chaîne de revue (ordre réel ; heure = `TZ=UTC git log` du commit porteur)
| étape | acteur | objet (commit) | verdict et mesures | source en dépôt |
|---|---|---|---|---|
| checkpoint-1 | validateur `claude-fable-5-1` | persisté `d841957` (20:39) | APPROUVE-AVEC-CORRECTIONS C-1..C-9 (toutes bloquantes sauf C-9) | `docs/CHECKPOINT1-lot-u4b-1b-4.md:1,49` |
| FAITS + ADDENDUM daté | orchestrateur `claude-fable-5-1` | `030fe06` (20:57) | `s_cutoffTime` sans getter ⇒ événement `CutoffTimeSet` ; règle GO ssi `c_fresh == c_e2` ; lookback de l'ancre (cp-1 C-2/C-3/C-4) | `docs/course-ukemi/FAITS-dualaggregator-cutoff-2026-09-22.md` ; `docs/course-ukemi/ADDENDUM-sonde-d-ancre-pre-b0-2026-09-22.md` ; `docs/CHANTIERS.md:873-875` |
| G1 | worker `claude-opus-5-5[1m]` | `30a2eee` (22:21) ; rendu persisté `097bc9e` (22:16) | 949/947/0/2 ; 25/25 mutants tués par leur test nommé ; R-25 795 ; A-6 14/14 ; re-vérifié par l'orchestrateur avant commit ; rulings R-1b4-1, R-1b4-2 | `docs/G1-lot-u4b-1b-4.md` ; `docs/CHANTIERS.md:904,923` |
| checkpoint-2 | validateur `claude-fable-5-1` | `30a2eee` ; persisté `dde21eb` (23:45) | ACCEPTE-AVEC-CORRECTIONS C-V-1..C-V-4, conditionné au G2 ; 949/947/0/2 ; 25/25 + 7/7 mutants propres ; fusion à blanc 953/951/0/2 ; instance R-1b4-2 rejouée | `docs/CHECKPOINT2-lot-u4b-1b-4.md:13-19,25,28-32` |
| G2 | relecteur `claude-opus-5-5[1m]`, instance séparée | `30a2eee` ; persisté `b147db0` (00:14) | PASS-AVEC-CORRECTIONS C-G2-1 (bloquante) .. C-G2-5 ; 13 mutants propres survivants, chacun tué par un prototype ; items I-2..I-6 | `docs/G2-lot-u4b-1b-4.md:35-54` ; intégral `docs/G2-lot-u4b-1b-4-integral.md` |
| micro-pli U-4b-1b-4b | worker `claude-opus-5-5[1m]` (contexte intact) | `206bc56` (01:05) | 952/950/0/2 ; 39/39 (25 + 14) tués par leur test nommé ; même harnais AVANT sur `30a2eee` : les 13 survivent et MG13 = golden ; R-25 cumulé 903 ; export réel 330/330 identique | `docs/CHANTIERS.md:949,951` |
| re-G2 ‖ re-checkpoint-2 | même relecteur (contexte intact) ‖ validateur | `206bc56` ; persistés `56e7730` (01:39) | PASS ‖ ACCEPTE-AVEC-CORRECTIONS (C-V-1..C-V-4 maintenues, C-V4b-1..C-V4b-3) ; 39/39 + 26/26 ; fusion à blanc sur `fad24ab` 977/975/0/2 | `docs/G2-lot-u4b-1b-4-4b.md` ; `docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:24-27` ; `docs/CHANTIERS.md:957` |
| G7 | orchestrateur `claude-fable-5-1` | fusion `--no-ff` de `206bc56` + ce fold | oracle 7 portes sur l'arbre principal fusionné (note « compte G7 ») | entrée « G7 U-4b-1b-4 » de `docs/CHANTIERS.md` |

- **Note « compte G7 ».** Attendu sur l'arbre principal fusionné : N + 19, où N = compte de `lot/etude-suite` sur l'arbre
  principal au moment de la fusion, et 19 = tests ajoutés par le lot (16 au G1 : 933 → 949 ; 3 au micro-pli : 949 → 952).
  Un seul skip attendu, `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) : l'arbre principal porte les artefacts
  e2 que les clones n'ont pas (`docs/G2-lot-u4b-1b-4-4b.md:32-33`). Au re-G2, N = 958 (arbre principal au G7
  HARNESS-DESC-1, 958/957/0/1, `docs/CHANTIERS.md:946`) ⇒ 977/976/0/1 ; depuis, la fusion de BELL-SHORTPAGE-1
  (`2c276bb`, `apps/bell` seulement) a porté N à **977** (arbre principal mesuré au G7 BELL-SHORTPAGE-1, 977/976/0/1,
  `docs/CHANTIERS.md:972`) ⇒ attendu **996/995/0/1** si aucune autre fusion non docs ne précède (GARDE-FSYNC-1,
  UKEMI-RETRY-2 changeraient N : le remesurer juste avant la fusion de ce lot). Écart à N + 19 = STOP avant commit.

### 2. Objet (trois pièces, toutes hors gel)
- **A — ancre pré-B₀ réelle** (R-I ; prereg `:66`, D2 ; cp-1 C-4/C-5 ; ADDENDUM §2), `scripts/census/u4-oracle-path.mjs` :
  dernier `AnswerUpdated` d'ordre `(block, logIndex)` de bloc ≤ B₀ sur `aggregator()@B₀` (`pickPreB0Anchor`, `:70`) ;
  profondeurs `D_k = 9 990·2^(k−1)` (`PRE_B0_FIRST_DEPTH`, `:49`) ; fenêtre k = seule partie nouvelle
  `[B₀ − D_k, B₀ − D_(k−1) − 1]`, fenêtre 1 = `[B₀ − 9 990, B₀]` (`preB0Windows`, `:55`), disjointes, jamais relues ;
  plafond 6 fenêtres (`DEFAULT_PRE_B0_MAX_WINDOWS`, `:50` ; ≈ 320 k blocs) ; chaque morceau getLogs ≤ 9 990 compté au
  `--max-calls`. **Inconditionnelle** : plafond épuisé ⇒ « PRE-B0 ANCHOR STOP » (`:219`), exit 3
  (`EXIT_PRE_B0_ANCHOR_STOP`, `:52`), AUCUN raw ni inputs écrit : le repli `book_weth_price_base_8dec` du réducteur gelé
  devient inatteignable pour la course -1b. Raw `pre_b0_anchor = {price, block, log_index, round_id}` (`:276` ; forme lue par
  `u4b-reduce.mjs:66-69`) ; provenance `pre_b0_anchor_window = {from, to, windows_tried, calls}` (`:268`) et
  `params.pre_b0_max_windows` ; flag OPTIONNEL `--pre-b0-max-windows` (défaut nommé 6 ; refusé avant tout fetch s'il n'est
  pas un entier > 0, `:157-159`).
- **B — helper `usdtBlocksFromLabelerDeficit(U3-realized[, U3-inputs])`** (R-H ; cp-1 C-1(ii) ; `:118`) : `required` =
  `first_block` distincts des lignes au prédicat EXACT du scoreur gelé (`u4b-scores.mjs:109-116` : `deficit_base == 0`,
  `residual ∋ deficit_base_no_price`, `deficit_native > 0`) ; une telle ligne sur une dette NON-USDT ⇒ refus nommé (le
  scoreur gelé jette, `:113`) ; ligne non JSON ⇒ refus ; `optional` = blocs `DeficitCreated` USDT des mêmes comptes
  (`U3-inputs`), lecture coûtée jamais lue par le scoreur. **Ruling R-1b4-1** : `<USDT_BLOCKS>` = `required` seuls ;
  `optional` rapporté « déclaré, non lu » (`docs/CHANTIERS.md:904`).
- **C — sonde (d) `scripts/census/u4b/u4b-probe-cutoff.mjs`** (+ `.d.mts`) (R-G ; ADDENDUM §1 ; cp-1 C-2/C-3/C-6) :
  `s_cutoffTime` est `uint32 internal` sans getter (FAITS) ⇒ lecture par événements `CutoffTimeSet(uint32)` (topic0
  `0xb24a681c…c1c4d1` calculé localement par le keccak auto-testé d'`abi.ts`, `:37` ; recalculé par un Keccak indépendant au
  G2, `docs/G2-lot-u4b-1b-4.md:20`) sur l'agrégateur RÉSOLU `aggregator()@B_fresh` du proxy §DISC:28 (`:27`), égalité
  assertée contre `0x7c7fdfca…` (`:29` ; sinon `aggregator_mismatch`, 0 scan) ; UN scan
  `[22 076 041, max(B_fresh, 23 545 087)]` (`:31`, `:33`, `:98`) ; `B_fresh = episode.B0` du `--episode-file` sha-vérifié
  (0 fetch sur écart) ; `decide` (`:64`) : **GO ssi `c_fresh` et `c_e2` existent et sont égaux**, sinon STOP (exit 3) ;
  échec de lecture = scan incomplet = STOP nommé (`budget_stop`, `read_failed:<Classe>`) ; `--block`, `--finalized`,
  `--target` refusés nommément ; `--operators`, `--ledger-dir`, `--cycle`, `--max-calls`, `--method-caps`, `--out` requis
  sans défaut (`--ledger-dir` absent ou vide ⇒ refus nommé depuis le micro-pli, `:83-85`, C-G2-1) ; keyless quorum-2 via
  `openU4GuardedClient`, env VIDE passé au garde (`:134`) ; sortie `<--out>/cutoff-<B_fresh>.json` hors dépôt (`--out` sous
  le dépôt refusé), JAMAIS `episode-selection.json` (C-6). Écarts d'exécution vs ADDENDUM §1 : ADDENDUM-2 daté
  (`docs/course-ukemi/ADDENDUM-2-sonde-d-ancre-pre-b0-2026-09-23.md`, même commit que cet amendement).

### 3. Tuyaux (ADR-M018 ; règle de Branchement) — à ajouter à la table Tuyaux ; tests @ `206bc56`
| pièce | entrée (qui produit) | sortie (qui consomme) | état (où il vit) | tests qui prouvent la composition (intégration non-LLM, seul `globalThis.fetch` bouchonné) |
|---|---|---|---|---|
| ancre pré-B₀ réelle | prober `u4-oracle-path.mjs` (lookback getLogs gardé keyless sur `aggregator()@B₀`) | `raw.pre_b0_anchor` → `u4b-reduce.mjs` GELÉ (`anchor.source = "answer_updated_pre_b0"`) → scoreur (`cell_a.anchor_price`) | raw hors dépôt (`--raws-dir`, RUNBOOK étape 5) ; `upcoming` | `u4b_anchor_and_usdt_blocks_compose_prober_to_frozen_reducer_and_scorer` (`apps/sentinel/test/u4b-oracle-path.test.ts:390` : prober réel → réducteur gelé en processus enfant → scoreur), `u4b_pre_b0_windows_recede_disjoint_and_the_anchor_is_the_last_event_at_or_below_B0` (`:278`), `u4b_oracle_path_pre_b0_anchor_found_after_widening` (`:292`), `u4b_oracle_path_pre_b0_anchor_cap_exhausted_stops_without_raw` (`:324`), `u4b_oracle_path_cli_exit_3_on_pre_b0_anchor_stop_without_raw` (`:348`, micro-pli), `u4b_oracle_path_pre_b0_max_windows_flag_is_refused_unless_positive_integer` (`:369`), `u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data` (`test/guard-scripts-u4.test.ts:221`) |
| `--usdt-blocks` | labeler `U3-realized.jsonl` (+ option `U3-inputs.jsonl`) → helper pur | `--usdt-blocks` du prober → `raw.usdt_prices` → réducteur → `usdtPrices[first_block]` du scoreur gelé | fichiers hors dépôt ; `upcoming` | `u4b_usdt_blocks_helper_on_real_e2_labels_is_what_the_frozen_scorer_reads` (`u4b-oracle-path.test.ts:240` : fixture e2 RÉELLE, lectures du scoreur observées par Proxy, digests A/B e2 inchangés, prédicat clause par clause depuis le micro-pli) + la composition `:390` |
| sonde (d) | `u4b-probe-cutoff.mjs` (1 `eth_call aggregator()` + scan `CutoffTimeSet`, gardé keyless) | `cutoff-<B_fresh>.json` → contrôle C-12 (RUNBOOK, annexe C) → go/no-go de l'étape 3 (ADDENDUM §1 ; ADDENDUM-2 (h)) | fichier hors dépôt (`--out`, RUNBOOK étape 2c-bis) ; `upcoming` (consommateur = procédure, pas un chemin servi) | `u4b_probe_cutoff_go_when_equal_real_form_logs_full_range_and_C12_exit_0` (`apps/sentinel/test/u4b-probe-cutoff.test.ts:76`), `u4b_probe_cutoff_stop_when_the_cutoff_changed_after_e2` (`:105`), `u4b_probe_cutoff_empty_scan_is_a_named_stop_exit_3` (`:152`, micro-pli), `u4b_probe_cutoff_never_writes_the_selection_and_the_prober_still_accepts_it` (`:207`), `u4b_probe_cutoff_refuses_a_missing_ledger_dir_from_any_cwd` (`:267`, micro-pli), `u4b_probe_cutoff_cli_exit_code_is_0_on_GO_and_3_on_STOP` (`:297`) |

État : aucune pièce `built` avant la première course rapprochée (`docs/CONSIGNE-STANDARD-G1.md:30`, D-3) ; aucun octet
servi ne change (export réel identique 330/330, `docs/CHANTIERS.md:949` ; registre public inchangé). **Composition
sélecteur → prober non rejouée par ce lot** : les épisodes des tests sont synthétiques (`writeEpisode`,
`u4b-oracle-path.test.ts:73`, `u4b-probe-cutoff.test.ts:53`) ⇒ item CARTO-T1C-5 (§8).

### 4. Déviations D-n déclarées (F-3) — numérotation du G1 (`docs/G1-lot-u4b-1b-4.md`, §9), adjugées « fondées » par le checkpoint-2 (`docs/CHECKPOINT2-lot-u4b-1b-4.md:25`) ; `error_origin` = grille du checkpoint-2, §4 (e)
| D-n | contenu | `error_origin` |
|---|---|---|
| D-1 | mission (item 2) « ancre absente ⇒ champ absent + statut nommé » REMPLACÉE par cp-1 C-4 / ADDENDUM §2 : plafond épuisé ⇒ STOP nommé, exit 3, aucun raw | orchestrateur (lettre de la mission) |
| D-2 | flag `--pre-b0-max-windows` (unité = fenêtre de l'ADDENDUM) au lieu de `--pre-b0-max-chunks` ; « morceau » = getLogs ≤ 9 990 | n-a (non-incident) |
| D-3 | fenêtre 1 `[B₀ − 9 990, B₀]` = 9 991 blocs ⇒ 2 morceaux (ADDENDUM §2 : « un morceau ») ; bornes gardées littérales (elles définissent la donnée), +2 appels ; corrigé par l'ADDENDUM-2 (b) | orchestrateur (ADDENDUM) |
| D-4 | mission (item 1 : `eth_call s_cutoffTime()` avec `--block`/`--finalized`/`--target`) remplacée par ADDENDUM §1 : scan d'événements, ces flags refusés nommément ; conséquence A-8 : le « vide » réel est un mot `data = 0x` ⇒ refus nommé (`read_failed:ProbeError`) ; un `0x` vide sur `aggregator()` est écarté par le pool ⇒ `NoQuorum` ⇒ STOP | planificateur (prereg `:186` : getter public supposé, non vérifié) |
| D-5 | borne haute du scan `max(B_fresh, 23 545 087)` au lieu de « jusqu'à B_fresh » (ADDENDUM §1) — testée (épisode `B_fresh = 23 000 000`, changement à 23 300 000 ⇒ STOP ; mutant MG12 « scan arrêté à B_fresh » = faux GO, rouge) ; fixée avant la donnée et VIVE pour cette course (B0 = 23 414 968) : ADDENDUM-2 §0 (C-V4b-1) | orchestrateur (ADDENDUM) |
| D-6 | oracle attendu de la mission « 921 + n / 1 skip » : base avancée (NARABI-OPS-1d) ⇒ 933/931/0/2 ; final 949 = 933 + 16, mêmes 2 skips nommés | n-a (non-incident) |
| D-7 | `REF.ORACLE_RAW/ORACLE_INPUTS` de `test/guard-scripts-u4.test.ts` re-baselinés (`8b0e3d69…/755a3d91…` → `82544163…/e2c3ff88…`), deux mesures indépendantes (harnais du test ; CLI enfant sous le préchargement du test) ; données D_e de `[B₀, B_last]` inchangées ; re-mesurés par le checkpoint-2 (`docs/CHECKPOINT2-lot-u4b-1b-4.md:15`) | n-a (non-incident) |
| D-8 | helper : entrée `U3-realized` (+ option `U3-inputs`), retour `{required, optional, blocks}`, refus nommé d'une ligne non-USDT ; l'assertion synthétique `kind:"deficit"` de `u4b_oracle_path_pure_helpers` est retirée (forme `U3-inputs`, jamais lue par le scoreur) et remplacée par le test sur la fixture e2 réelle ; prereg `:262-263` (« `usdtBlocksFromLabelerDeficit(U3-deficit.jsonl)` ») inexact : kinds mesurés sur e2 `{window_other: 24, in_event: 4}` ⇒ `[]` | planificateur (prereg `:262-263`) |
| D-9 | base du worktree `3f6662f → 030fe06` (fast-forward sans commit, avant toute modification ; 8 fichiers NARABI-OPS-1d, aucun du lot) | n-a (non-incident) |
| D-10 | opérateurs de la sonde : instance `drpc.org,mevblocker.io,tenderly.co` (ruling R-1b4-2, `docs/CHANTIERS.md:904` ; rejouée par le checkpoint-2, `docs/CHECKPOINT2-lot-u4b-1b-4.md:17`) au lieu des « opérateurs keyless du fill-ts » de l'ADDENDUM §1 ; motifs et effet borné : ADDENDUM-2 (f) et (g) | orchestrateur (ADDENDUM) |
| O-6 | erratum du contrôle post-coupure n°2 « 0 octet NUL » : faux pour ce worktree (deux fichiers non committés entièrement NUL) ; reconstruction du prober byte-exacte confirmée par pièces ; sonde : code byte-exact, octets livrés (`deffbb6b`) postérieurs à la reconstruction et prouvés par les rejeux | orchestrateur + infrastructure (`docs/CHANTIERS.md:923` ; `docs/CHECKPOINT2-lot-u4b-1b-4.md:19`) |

### 5. MAST résiduel (cp-1 C-8 ; mis à jour au fold)
- **Spécification ambiguë** (`B_fresh`, règle absente) — contrée par l'ADDENDUM §1 et le code : `B_fresh = episode.B0`
  sha-vérifié, `decide()` pure et testée ; mutant « règle inversée » (MG3) rouge ; `decide(null, null)` et `decide(30, null)`
  ⇒ STOP épinglés depuis le micro-pli (R1, R6).
- **Repli silencieux** (ancre) — contré par cp-1 C-4 : exit 3 sans raw ; MI4 (« STOP inatteignable ») et MI5 (« ancre non
  écrite », rouge par la composition au réducteur gelé) rouges ; exit 3 de la CLI épinglé (R16).
- **Vérification non indépendante** (helper testé sur une forme synthétique : le défaut R-H) — contrée par la fixture e2
  RÉELLE, les lectures du scoreur gelé observées (Proxy) et le prédicat vérifié clause par clause (R10, R11, R12, R12b) ;
  MH1..MH4 rouges.
- **Dérive de format de sortie** (sonde écrite dans la sélection) — contrée par un fichier séparé ; MG4 rouge par le refus
  sha du prober.
- **Dépense non bornée** (lookback ×2, scan par morceaux) — plafonds a priori (6 fenêtres ; `--max-calls 1200`), chaque
  morceau compté ; test d'épuisement qui compte les morceaux (MI7) ; plafond utilisé consigné (R9).
- **Hypothèse non vérifiée** (getter public supposé au prereg) — FAITS lus sur place ; agrégateur résolu asserté (MG5) ;
  topic0 calculé localement et recalculé indépendamment au G2.
- **Vérification terminale incorrecte** (code de sortie) — test CLI 0/3 (MG9) ; refus d'argument ⇒ exit 1 sans fichier
  (R4) ; C-12 relit le fichier indépendamment et son texte égale la constante `C12` du test (vérifié par le script
  d'insertion du G7, item C12-PIN).
- **Défaut silencieux d'un argument requis** (C-G2-1 : `arg("--ledger-dir") ?? ""` ⇒ ledger fantôme dans `<cwd>/<cycle>/`
  hors racine, mesuré au G2) — contré par le refus nommé (`:83-85`) et un test CLI lancé depuis un cwd HORS dépôt avec un
  `fetch` qui lève (`u4b-probe-cutoff.test.ts:267` ; MG13 rouge). Leçon du re-checkpoint-2 : tout `arg(...) ?? <défaut>`
  d'un script de course se rejoue depuis un cwd hors dépôt (`docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:30`).

### 6. Gel D4 intact (A-6, régime B, LF) et invariants
Les 9 gelés (prereg §2 ; tableau D4) — `u4b-scores 2f9a31f6…`, `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…`,
`wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`, `rpc.ts 0e232519…`, `calib-digest 3603265d…`, labeler
`u3-realized cb020425…` — ainsi que le prereg `1971d9b1…`, l'ADDENDUM daté `eb7ad29b…` et les FAITS `4f23216d…` sont
byte-identiques à `030fe06`, à `206bc56` et au HEAD de la cible (re-mesuré au fold par `git show <c>:<f> | tr -d '\r' |
sha256sum`) ; A-6 14/14 au G1, au checkpoint-2, au micro-pli, au re-G2 et au re-checkpoint-2. Le 14ᵉ invariant de ces
revues, le sélecteur `225d2304…`, est le blob de la BASE `030fe06` ; sur l'arbre fusionné, le sélecteur est `20e1cf9d…`
(G7 U-4b-1b-3, Sidecar 0), non touché par ce lot. Fichiers du lot ∩ fichiers modifiés côté cible depuis `030fe06` = ∅
(mesuré au fold) : les blobs fusionnés sont ceux de `206bc56`.

### 7. Taille (R-25) — remplace la ligne « R-25 » du texte v1 (re-G2, re-checkpoint-2)
R-25 du lot cumulé `030fe06...206bc56`, pathspec de `ci.yml:65` verbatim (15 arguments, extraits par programme) = **903**
lignes (858 + / 45 −, 8 fichiers) ; dont G1 `030fe06...30a2eee` = 795 (751 + / 44 −) et micro-pli `30a2eee..206bc56` =
126 (116 + / 10 −, 3 fichiers). Le cumul est inférieur à 795 + 126 parce que le pli modifie des lignes ajoutées au G1 : c'est
une mesure, pas une somme. Mesuré au micro-pli, rejoué par le re-G2 et le re-checkpoint-2 (`docs/G2-lot-u4b-1b-4-4b.md:29` ;
`docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:16`), re-mesuré au fold sur les blobs committés. **Dépassement déclaré de la cible de
mission** (800, cp-1 C-9, indicative), sous la règle STOP A-5 (1 150) et le plafond CI `VIBEGATES_PR_LIMIT = 1205`
(`ci.yml:43`) ; le mot « dérogation » employé au journal pour 903 se lit ainsi (ruling de vocabulaire,
`docs/CHANTIERS.md:958`). La couture PR-A / PR-B pré-déclarée au G1 est sans objet (ruling du G2, `docs/CHANTIERS.md:935`).

### 8. Items formés (propriétaire : orchestrateur ; zéro « dû » nu)
| item | contenu | déclencheur | `error_origin` | source en dépôt |
|---|---|---|---|---|
| **C-V4b-3 / VX-L2** (test seul) | épingler le refus d'un `--ledger-dir` SOUS la racine du dépôt pour la sonde, dans `u4b_probe_cutoff_refuses_before_any_fetch` (mutant du validateur « racine du garde neutralisée » : 0 test rouge ; code correct, `assertLedgerDir(ledgerArg, ROOT)`, `:85` ; pas de faux GO) | prochain pli de la sonde, ou micro-pli avant l'étape 2c-bis ; non bloquant pour la fusion | worker (trou de test du G1, non couvert par le micro-pli) | `docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:15,27` |
| **I-7** | filtrer par `[B₀, B_last]` les journaux du scan D_e du prober (`u4-oracle-path.mjs:226-237` : `getLogsRange(agg, …, B0, bLast)` sans filtre de bloc au retour) + test + mutant ; atténué aujourd'hui par le quorum (un seul témoin fautif ⇒ désaccord ⇒ STOP) | prochain lot qui touche le prober | G1 de U-4b-1b-2 (préexistant, non introduit par ce lot) | `docs/G2-lot-u4b-1b-4-4b.md:40` |
| **CARTO-T1C-5** | test de composition `u4b_chain_select_to_oracle_path` : `runSelect` → `episode-selection.json` → `run()` du prober, seul `fetch` bouchonné | le déclencheur du ruling (b) du G7 U-4b-1b-3 (« G7 de U-4b-1b-4 OU avant l'étape 5 du RUNBOOK, au premier des deux », `docs/CHANTIERS.md:932`) est **ATTEINT à ce G7 sans le test** ⇒ nouveau déclencheur = ruling de l'orchestrateur (non tranché par ce fold) ; proposition : avant l'étape 5 (moitié restante du déclencheur), par un micro-pli test-only qui porte aussi C-V4b-3 | G1 de U-4b-1b-2 (composition non rejouée) ; non repris par ce lot (hors mission) | `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md:157,250` ; `docs/CHANTIERS.md:932` |
| **OBS-1** | littéral `model: "claude-opus-4-8[1m]"` du prober (`u4-oracle-path.mjs:266,283`) = auteur historique du code, pas l'exécutant ⇒ `code_author` (la sonde neuve le porte déjà) | déclencheur du RUNBOOK (annexe O, « prochain lot touchant ces scripts ») ATTEINT par ce lot sans traitement (format du raw hors mission) ; ruling du G7 demandé par le checkpoint-2 (non tranché par ce fold) ; proposition : même déclencheur qu'I-7 | worker (déclencheur atteint, non traité, déclaré au G1) | `docs/CHECKPOINT2-lot-u4b-1b-4.md:32` ; RUNBOOK, annexe O |
| **C12-PIN** | la constante `C12` (`apps/sentinel/test/u4b-probe-cutoff.test.ts:22`) et le contrôle C-12 du RUNBOOK sont deux copies d'un même texte : égalité VÉRIFIÉE par le script d'insertion du G7 (mesure ponctuelle) ; épingle durable = un test qui lit le RUNBOOK et compare | prochain pli de la sonde (avec C-V4b-3) | n-a (duplication de conception, déclarée au G1) | `docs/CHECKPOINT2-lot-u4b-1b-4.md:30` |
| **PROBE-RATE-1** (opérationnel) | la sonde n'a pas de politesse ciblée par opérateur (`--min-interval-ms`, défaut 50 ms, s'applique à chaque fournisseur) alors que `mevblocker.io` a rendu 355 × HTTP 429 (13,5 % de ses `eth_call`) à l'essai 2 du recorder ; effet borné : `NoQuorum` ⇒ STOP `read_failed:*`, jamais un GO | premier STOP `read_failed:*` ou `budget_stop` de l'étape 2c-bis ⇒ relance après délai ou nouvelle instance consignée (R-26) | n-a (constat de course postérieur au G1) | `docs/course-ukemi/FAITS-mevblocker-2026-09-23.md` ; ADDENDUM-2 (g) |
| **ceinture `decide(undefined, undefined)`** (observation) | `decide` rend GO sur `(undefined, undefined)` : inatteignable (les deux voies, R24/R25, sont tuées) ; une ceinture éventuelle va dans `decide` ET dans C-12 ET dans la constante `C12` du test (C-12 accepte aussi `undefined === undefined`) | observation sans item (re-G2) ; à reprendre par tout lot qui touche `decide` ou C-12 | n-a | `docs/G2-lot-u4b-1b-4-4b.md:42` |
| **I-4** (A-13 dépendant du contexte) | la CONSIGNE A-13 précise : `\\b` et `\\$` réduits, `\\"` conservé (mesuré au G2) ; la prose aussi (récidive mesurée au rendu du micro-pli, 4 mentions corrigées) | prochaine révision de `docs/CONSIGNE-STANDARD-G1.md` | outillage (transport de l'outil Bash) ; récidive : worker | `docs/G2-lot-u4b-1b-4.md:52` ; `docs/G2-lot-u4b-1b-4-4b.md:41` |
| **WORKTREE-DURABILITY-1** (cp-2 C-V-4) | commit WIP au rendu de tout G1 > 1 h (sources non committées perdues par une coupure : O-6) ; GARDE-FSYNC-1 (ledgers du garde) inchangé | tout G1 > 1 h, ou worktree non committé lors d'une coupure | infrastructure (coupures) ; rattachement initial à GARDE-FSYNC-1 : worker (hors domaine, cp-2 §4 (f)) | `docs/CHECKPOINT2-lot-u4b-1b-4.md:31` |
| **I-5** | restaurations de golden des harnais de mutants sous la même discipline de durabilité | celui de WORKTREE-DURABILITY-1 | infrastructure | `docs/G2-lot-u4b-1b-4.md:53` ; `docs/CHANTIERS.md:935` |
| **CARTO-T1C-7** | la couverture grep de la CI n'atteint pas `scripts/census/u4b/*.mjs` ; la sonde est couverte par son propre test B-5 (`u4b_probe_cutoff_script_is_keyless_clean_and_imports_closed`, `u4b-probe-cutoff.test.ts:318`) | item orchestrateur existant | préexistant | `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md:252` |

### 9. Traçabilité des corrections repliées (chaque correction → sa source → son emplacement → son `error_origin`)
| correction | source | où | `error_origin` | état |
|---|---|---|---|---|
| C-G2-1 (bloquante : `--ledger-dir` réellement requis) | `docs/G2-lot-u4b-1b-4.md:35` | §2 C, §5 ; code `u4b-probe-cutoff.mjs:83-85`, octets du prototype du G2 (`8bdb1478…`, `docs/G2-lot-u4b-1b-4-4b.md:10`) | worker G1 (affirmation « requis sans défaut » sans test tueur, `docs/G2-lot-u4b-1b-4.md:41`, confirmé par le re-checkpoint-2, CA-8) ; vérification : manqué par le checkpoint-2 initial (`docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:30`) | fermée au micro-pli (MG13 rouge ; test `:267`) |
| C-G2-2 | `docs/G2-lot-u4b-1b-4.md:36` | §5 | worker G1 | fermée au micro-pli (R1, R2, R6 ; tests `:128`, `:152`) |
| C-G2-3 | `:37` | §5 | worker G1 | fermée au micro-pli (R3, R4, R17 ; tests `:220`, `:297`, `:318`) |
| C-G2-4 | `:38` | §2 B, §3 | worker G1 | fermée au micro-pli (R10, R11, R12, R12b ; `u4b-oracle-path.test.ts:240`) |
| C-G2-5 | `:39` | §2 A, §3 | worker G1 | fermée au micro-pli (R9, R13, R16 ; tests `:292`, `:348`) |
| C-V-1 (insérer l'amendement ; `error_origin` par D-n) | `docs/CHECKPOINT2-lot-u4b-1b-4.md:28` | ce texte (§4 : 10 D-n + O-6) | texte v1 sans `error_origin` : worker G1 ; insertion : acte du G7 (n-a) | fermée par cette insertion |
| C-V-2 (ADDENDUM-2 daté (a)-(e) + (f) + (g) ; deux sha au SIDECAR) | `:29` | `docs/course-ukemi/ADDENDUM-2-sonde-d-ancre-pre-b0-2026-09-23.md` (même commit) ; sha au SIDECAR avant 2c-bis | écarts de l'ADDENDUM (D-3, D-5, D-10) : orchestrateur ; (f) et (g) absents du complément proposé par le G1 : worker G1 | fichier : fermée à l'insertion ; ligne SIDECAR : acte orchestrateur avant 2c-bis |
| C-V-3 (deltas RUNBOOK ; égalité C-12 / `C12`) | `:30` | deltas de `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md` (même commit) ; égalité vérifiée par le script d'insertion ; épingle durable = C12-PIN | n-a (acte de fold prévu) | fermée à l'insertion |
| C-V-4 (WORKTREE-DURABILITY-1) | `:31` | §8 | infrastructure ; rattachement : worker G1 | item formé |
| OBS-1 (ruling au fold) | `:32` | §8 | worker G1 | ruling du G7 demandé |
| C-V4b-1 (citation a priori de `max(B_fresh, 23 545 087)`) | `docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:25` | ADDENDUM-2, §0 | n-a (exigence née de la chronologie de la course : aucune pièce antérieure à la sélection ne pouvait dater la donnée) | fermée à l'insertion |
| C-V4b-2 (ligne SIDECAR « gel `<HEAD_E2>` » ; arbre d'exécution 2c-bis/5 épinglé) | `:26` | RUNBOOK §A (gel) et étapes 2c-bis/5 ; ligne SIDECAR (acte orchestrateur à `<HEAD_E2>`) | orchestrateur (ordre de fusion cp-1 C-7 non tenu, même racine qu'I-6) | ouverte jusqu'à la ligne SIDECAR ; aucune étape ≥ 2c-bis non commencée avant elle |
| C-V4b-3 (VX-L2) | `:27` | §8 | worker (trou de test) | item formé |
| I-6 (ordre fusion / course) | `docs/G2-lot-u4b-1b-4.md:45-47` ; ruling `docs/CHANTIERS.md:935` | RUNBOOK §A et 0.7 (D-n datée) ; ADDENDUM-2 (h) | orchestrateur (ordre de fusion cp-1 C-7 non tenu, au profit du démarrage de la course) | tranché : référence `<HEAD_E2>` |
| I-2 (« déclaré, non lu » sans champ dans le code) | `docs/G2-lot-u4b-1b-4.md:50` | ligne Sidecar 5 du RUNBOOK | n-a (conception : ruling R-1b4-1) | fermée à l'insertion du RUNBOOK |
| I-3 (compléter l'ADDENDUM avant d'inscrire son sha) | `:51` | ADDENDUM-2 séparé (checkpoint-2 §4 (b)) ; (b) corrige « un morceau » et `<N_PROBE>` | orchestrateur (ADDENDUM) | fermée à l'insertion |
| épinglages du re-G2 (0.6 → `4ed4c31e` + sonde `8bdb1478` ; R-25 903) | `docs/G2-lot-u4b-1b-4-4b.md:37-39` | RUNBOOK 0.6 ; §7 | n-a (acte de fold prévu) | fermée à l'insertion |
| chiffres périmés des livrables G1 (0.6 et ligne SIDECAR « outillage » citant `deffbb6b` ; ligne R-25 du texte v1) | `docs/CHECKPOINT2-lot-u4b-1b-4-4b.md:21,24` | RUNBOOK 0.6 et gabarit SIDECAR (`8bdb1478…`) ; §7 | worker (livrables du G1 antérieurs au micro-pli, relevés par lui-même au rendu du micro-pli) | fermée au fold |
| O-6 | `docs/CHANTIERS.md:923` ; `docs/CHECKPOINT2-lot-u4b-1b-4.md:19` | §4 | orchestrateur + infrastructure | erratum consigné |

*(ADR-U4b n'est PAS dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Cet amendement n'édite
AUCUNE valeur de référence existante : il APPEND une section datée. Le worker ne committe pas (R-20) ; l'orchestrateur folde
et committe au G7.)*

### Addendum d'insertion (orchestrateur `claude-fable-5-1`, G7 U-4b-1b-4, 2026-09-23)
- Chaîne de revue : checkpoint-1 (`docs/CHECKPOINT1-lot-u4b-1b-4.md`, C-1..C-9) ; FAITS + ADDENDUM (`030fe06`) ; G1 `30a2eee`
  (`docs/G1-lot-u4b-1b-4.md`, worker `claude-opus-5-5[1m]`) ; checkpoint-2 ACCEPTE-AVEC-CORRECTIONS
  (`docs/CHECKPOINT2-lot-u4b-1b-4.md`, C-V-1..C-V-4) ; G2 PASS-AVEC-CORRECTIONS (`docs/G2-lot-u4b-1b-4.md`, intégral
  `docs/G2-lot-u4b-1b-4-integral.md`, C-G2-1..C-G2-5) ; micro-pli U-4b-1b-4b `206bc56` ; re-G2 PASS
  (`docs/G2-lot-u4b-1b-4-4b.md`) ; re-checkpoint-2 ACCEPTE-AVEC-CORRECTIONS (`docs/CHECKPOINT2-lot-u4b-1b-4-4b.md`,
  C-V4b-1..C-V4b-3).
- Insérés dans le MÊME commit que cet amendement : `docs/course-ukemi/ADDENDUM-2-sonde-d-ancre-pre-b0-2026-09-23.md`
  (C-V-2, C-V4b-1) et les deltas de `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md` (C-V-3, I-6, C-V4b-2) ;
  l'ADDENDUM daté du 2026-09-22 (`eb7ad29b…`) et le prereg (`1971d9b1…`) restent byte-identiques.
- Ordre de fusion : indépendant de GARDE-FSYNC-1 ; avant U-4b-STATS-1, dont la fusion forme `<HEAD_E2>` (ruling I-6,
  `docs/CHANTIERS.md:935`) ; la ligne SIDECAR « gel `<HEAD_E2>` » (C-V4b-2) précède toute étape ≥ 2c-bis non commencée.
- Rulings demandés au G7, non tranchés par ce fold : nouveau déclencheur de CARTO-T1C-5 ; OBS-1 ; statut de l'étape 3a
  (lancée avant la sonde) vis-à-vis de l'ordre de l'ADDENDUM §1 (ADDENDUM-2 (h)).

## Amendement daté 2026-09-23 (U-4b-STATS-1 — outils hors ligne H-3 / H-4 / H-6 et entrée de la clause prereg :359 ; fold G7 : trois segments first-parent `66141fb` → `4c5fa8d` → `c1e9e30`)

> **Provenance.** Texte v1 : worker `claude-opus-5-5[1m]` (effort max, décision 133), 2026-09-22, rendu hors dépôt au
> G1 (sha256 `3f3029d99bacd63e79811afb42f3c594f4813c9c93f8169c3d8a604cbc943e5a`), sur le checkpoint-1 C-1..C-12.
> **Fold G7 (ce texte)** : worker `claude-opus-5-5[1m]` (effort max), 2026-09-23, docs seulement, aucun commit (R-20) ;
> il replie les corrections des trois checkpoints-2 (1a, 1b, 1c), du G2 de 1a, du G2-delta de 1b, du micro-pli 1c et du
> re-G2-delta de 1c, date le ruling Q-1 (a) et assigne un `error_origin` à chaque correction (§13). **Insertion par l'orchestrateur
> `claude-fable-5-1` SEUL**, en queue de ce fichier, dans le commit du G7 ; réviseur = orchestrateur (R-21). Ajout pur :
> aucune ligne existante n'est éditée (le renvoi `:207 → :402` est porté par le §14). Cet ADR n'est pas dans le diff du
> lot (`git diff --quiet 50f78b0 c1e9e30 -- docs/adr/ADR-U4b-calibration-episode-frais.md`). Octets cités au bout du lot
> (`c1e9e30` ; `git show <c>:<f> | tr -d '\r' | sha256sum`) : `scripts/census/u4b/u4b-hyp.mjs`
> `65b0d8f9608969c670bd321d7613920c408ccf90bac4e067e990b93dad77fc25` (état 1a `564292d` = 1a-corr `66141fb` :
> `50436e8f4a027a60a2d62278f078d0579cdc72dbb314edd8c3357d2900a6b8bd` ; état 1b `4c5fa8d` :
> `07e25e197f1c57fe3ea14fe1c4c50e4ceeda476fd6150e39be8cf04a2760393e`) ; `scripts/census/u4b/u4b-hyp.d.mts`
> `5a019059af4292169725f3cb1a48436f53cd4feb57530d865b293d954000f6d6` ; `apps/sentinel/test/u4b-hyp.test.ts`
> `f8d8f3a61e8acf565f85282a55889859833bd1b98c27a07d7c4f0f9add4f05b3` (39 tests). Le prereg GELÉ
> (`docs/PLAN-u4b-prereg.md`, sha256 LF `1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49`) n'est pas
> modifié ; aucun des 9 fichiers gelés du prereg §2 n'est touché (§11).

### 1. Chaîne de revue (ordre réel ; heure = `TZ=UTC git log` du commit porteur)
| étape | acteur | objet (commit) | verdict et mesures | source en dépôt |
|---|---|---|---|---|
| checkpoint-1 | validateur `claude-fable-5-1` | persisté `d841957` (2026-09-22 20:39) | APPROUVE-AVEC-CORRECTIONS C-1..C-12 (verdict fermé C-1, compteur de labels C-2, épinglages C-3, ordre C-4, oracles antérieurs C-5, RUNBOOK C-8, MAST C-10) | `docs/CHECKPOINT1-lot-u4b-stats-1.md:54-67` |
| G1 (unité 1a) | worker `claude-opus-5-5[1m]` | `564292d` (23:26) ; rendu persisté `7c70826` (23:24) | STOP A-5 déclaré (lot entier 1 385 > 1 150) ⇒ couture 1a/1b pré-déclarée ; 1a : 933/932/0/1, 16/16 mutants tués par leur test nommé, R-25 640 ; incident coupure n°2 (outil non suivi entièrement NUL) : restauration octet-exacte, preuves régénérées | `docs/G1-lot-u4b-stats-1.md:14-45` |
| ruling Q-1 | orchestrateur `claude-fable-5-1` | journalisé `7c70826` (2026-09-22 23:24), avant toute donnée fraîche | option (a), §5 | `docs/CHANTIERS.md:913` |
| checkpoint-2 (1a) | validateur | `564292d` ; persisté `babd44d` (23:50) | ACCEPTE-AVEC-CORRECTIONS C-V-1..C-V-4, conditionné au G2 ; 933/932/0/1 ; 16/16 identiques au worker ; mutants propres VX-1..VX-8 : 3 survivants (gardes de `parseScores` sans test) | `docs/CHECKPOINT2-lot-u4b-stats-1-1a.md:9-16` |
| G2 (1a) | relecteur `claude-opus-5-5[1m]`, instance séparée | `564292d` ; persisté `03e098c` (00:24) | PASS-AVEC-CORRECTIONS C-G2-1..C-G2-5 (tests seuls ; aucun comportement faux) ; 20 mutants propres ; items I-G2-1, I-G2-2 | `docs/G2-lot-u4b-stats-1-1a.md:18-32` ; `docs/G2-lot-u4b-stats-1-1a-integral.md:132-157` |
| 1a-corr | worker (contexte intact) | `66141fb` (00:55), prototype du G2 à l'octet | 940/939/0/1 ; 28/28 byIntended ; fin du segment 1 (R-25 735) | message de `66141fb` ; `docs/G2-lot-u4b-stats-1-1b.md:35` |
| 1b (v3) | worker | `4c5fa8d` (01:01) | 951/950/0/1 ; 58/58 byIntended (42 G1 + 4 VX + 12 G2) ; segment 2 (R-25 826) ; re-vérifié par l'orchestrateur avant commit | `docs/CHANTIERS.md:947,951` |
| checkpoint-2 (1b) | validateur | `4c5fa8d` ; persisté `56e7730` (01:39) | ACCEPTE-AVEC-CORRECTIONS C-W-1..C-W-4, conditionné au G2-delta ; condition CA-6 de 1a levée ; VY-2 et VY-6 survivants ; réserve de vocabulaire sur 826 | `docs/CHECKPOINT2-lot-u4b-stats-1-1b.md:9-18` |
| ruling de vocabulaire | orchestrateur | `56e7730` (01:39) | 826 = « dépassement déclaré de la cible de mission (D-4) » ; aucun gate franchi | `docs/CHANTIERS.md:958` |
| G2-delta (1a-corr, 1b) | même relecteur que le G2 1a (contexte intact) | `66141fb`, `4c5fa8d` ; persisté `5423c0f` (01:58) | 1a-corr PASS ; 1b PASS-AVEC-CORRECTIONS C-G2D-1 (code) .. C-G2D-6 ; item I-G2D-1 ; prototype de correction sha256 `137b0b11b551b0bebe47b7cd1146d8b5cf6f12564272dbbb399c2a7dd98f4b07` | `docs/G2-lot-u4b-stats-1-1b.md:17-31` |
| micro-pli 1c | worker (contexte intact) | `c1e9e30` (04:35) ; rendu persisté dans le même commit | prototype du G2 appliqué à l'octet + 2 tests `cw1_*` ; 960/959/0/1 ; mutants §8 ; segment 3 (R-25 178) | `docs/PLI-lot-u4b-stats-1-1c.md` |
| re-checkpoint-2 (1c) | validateur | `c1e9e30` ; persisté `7154d18` (05:09) | ACCEPTE-AVEC-CORRECTIONS (C-W-2 à 3 segments, C-W-3 + C-G2D-2 (ii), I-G2D-1, C-W-4, I-V-1, note A-6), conditionné au re-G2-delta 1c ; défaut C-G2D-1 rejoué AVANT (écriture dans le dépôt) puis APRÈS (refus nommé) | `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:81-89,113` |
| re-G2-delta (1c) | relecteur `claude-opus-5-5[1m]`, contexte frais | `c1e9e30` ; rendu clos 2026-09-23 05:18 UTC (sha256 du rendu hors dépôt `4ba3f05af35018bd31f7e0a454fecafa0a50088e5a28b3ff9ae45f1a3c0e1a09`), persisté `aa15a59` (05:21) dans `docs/G2-lot-u4b-stats-1-1c.md` (rendu à l'octet, plus un en-tête et un pied) | PASS-AVEC-CORRECTIONS ; **aucune correction du worker** ; correction unique **C-R1** (fusion : conflit du segment 1 sur la pointe `3bbbb06`, résolution par union, fichier sha256 `0b648e14…`, concordante avec §7) ; oracle de l'arbre fusionné à blanc 7 × 0, 1 035/1 033/0/2 (clone : 2 skips), 39 tests du lot verts ; observations O-A..O-F (§12) ; condition CA-6 du re-checkpoint-2 satisfaite | `docs/G2-lot-u4b-stats-1-1c.md` §4, §6, §7 |
| G7 | orchestrateur `claude-fable-5-1` | fusions `--no-ff` `28ffb5b` (segment 1), `aeeed70` (segment 2), `b9964ee` (segment 3), toutes 2026-09-23 05:21 (§7) + ce fold | oracle 7 portes sur l'arbre principal fusionné (note « compte G7 ») | entrée « G7 U-4b-STATS-1 » de `docs/CHANTIERS.md` |

- **Note « compte G7 ».** Attendu sur l'arbre principal fusionné : N + 39, où N = compte de `lot/etude-suite` sur
  l'arbre principal juste avant la première fusion, et 39 = tests du lot, tous dans `apps/sentinel/test/u4b-hyp.test.ts`
  (12 en 1a : 921 → 933 ; 7 en 1a-corr : → 940 ; 11 en 1b : → 951 ; 9 en 1c : → 960). N = **996** au G7 U-4b-1b-4
  (`docs/CHANTIERS.md:983`, 996/995/0/1) ⇒ attendu **1035/1034/0/1** si aucune autre fusion non docs ne précède (sinon
  remesurer N). Un seul skip attendu, `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) : l'arbre principal
  porte les artefacts e2 réels, donc `u4b_labels_replay_via_main_real_artifact` y tourne (les clones l'ignorent :
  1016/1014/0/2 à la fusion à blanc du re-checkpoint-2, N = 977 ; 1 035/1 033/0/2 à celle du re-G2-delta 1c sur la
  pointe `3bbbb06`, N = 996). Écart à N + 39 = STOP avant commit.

### 2. Objet et décision
- **Pièce** : `scripts/census/u4b/u4b-hyp.mjs` (+ `u4b-hyp.d.mts`) ; test `apps/sentinel/test/u4b-hyp.test.ts`, listé
  dans `scripts/export-exclude-tests.json` (le test importe `scripts/census/**` et lit le prereg et des fixtures exclues
  de l'export). L'outil est **pur** : il n'importe que `node:fs`, `node:crypto`, `node:url`, `node:path` et
  `./u4b-scores.mjs` (gelé) ; aucun réseau, aucune variable d'environnement, aucune horloge ni aucun chemin absolu dans
  une sortie ; la seule écriture est le rapport, une fois (`wx`), hors dépôt.
- **Rôle** : produire hors ligne, après la course, les rapports des hypothèses pré-enregistrées H-3, H-4 et H-6
  (prereg `:100-103`), et la sous-commande `report` qui porte l'**entrée** de la clause pré-enregistrée `:359`
  (`body.clause_359`). L'orchestrateur applique cette entrée mécaniquement (décision 137) ; l'outil n'émet **jamais** de
  jeton de décision (`u4b_hyp_report_e2_end_to_end_deterministic_body_digest`,
  `u4b_hyp_summary_vocabulary_gate_and_c11_sentence`). CLI : `h3 | h4 | h6 | report` (`runCli`, `u4b-hyp.mjs:644`).
- **Trois segments** (R-25 ; §7) : **1** = cœur exact H-3 (`564292d`) + épingles du G2 1a (`66141fb`) ; **2** = H-4,
  H-6, labels, census, `report`, CLI, RUNBOOK étape 6d + tests des gardes VX du checkpoint-2 (`4c5fa8d`) ; **3** =
  micro-pli 1c : correctif `outOfRepo` (C-G2D-1) + 7 tests `g2proto1b_*` + 2 tests `cw1_*` (`c1e9e30`). Le lot n'est clos
  (G7) qu'après la fusion du segment 3 : avant, la chaîne servie à l'étape 6d n'est pas complète (règle Branchement).

### 3. H-3 — statistique, loi nulle, décision, épinglages C-3 (inchangés depuis le texte v1, relus par le G2 1a)
- **Statistique** (prereg `:100`) : K = #{ s ∈ lignes `score_a` de la fixture e2
  `apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl` (sha256 LF `301d39fa…`, `u4b-hyp.mjs:63-64`, vérifié à
  chaque exécution, fail-closed, chemin fixe, sans flag) de la cellule : s ≤ q̂_frais }. Couverture **fermée**.
- **Loi nulle** : BetaBinomial(N = n_e2, a = p, b = n + 1 − p), n = taille fraîche de la cellule,
  p = ⌈(n+1)(1 − α)⌉, α = 1/100. *Dérivation* : sous échangeabilité des n + N scores à valeurs distinctes, les
  positions des N valeurs e2 parmi les n + N statistiques d'ordre sont uniformes sur C(n+N, N) configurations ; K = j
  ssi exactement j valeurs e2 précèdent la p-ième valeur fraîche, d'où
  P(K = j) = C(p−1+j, j)·C(n−p+N−j, N−j) / C(n+N, N), qui est la loi BB(N, p, n+1−p) (a + b − 1 = n). Rationnels
  exacts en BigInt ; masse totale = 1 vérifiée **exactement** (identité de Chu–Vandermonde ; refus nommé sinon ;
  `bbDistribution`, `u4b-hyp.mjs:113`). Concordance [lu] : Angelopoulos & Bates, arXiv:2107.07511v6 — p.14
  (couverture conditionnelle ~ Beta(n+1−l, l), l = ⌊(n+1)α⌋, donc n+1−l = p), p.49 (le compte suit une
  BetaBinom(n_val, n+1−l, l)), p.50 (moments ; égalité exacte testée par
  `u4b_hyp_bb_moments_match_angelopoulos_bates_p50`) ; PDF hors dépôt, sha256
  `c69aa191d8363c25b36685db4adb7e6980e55ee39892fd3626206c16e1e0efa1` (versement : item I-2, §12). La dérivation a été
  jugée « correcte et complète » par le G2 1a et recomputée hors outil par le G2 (code propre) et par le checkpoint-2
  (fractions exactes) (`docs/G2-lot-u4b-stats-1-1a-integral.md:82-86` ; `docs/CHECKPOINT2-lot-u4b-stats-1-1a.md:23`).
- **Ex æquo** (atomes en 0 : 509/565 sur e2, prereg `:100`) : on départage par des uniformes indépendantes ; les rangs
  lexicographiques deviennent uniformes et le compte départagé suit exactement BB ; le compte fermé K le majore point par
  point ((s_j, u_j) < (q̂, u\*) ⇒ s_j ≤ q̂), d'où P(K ≤ k) ≤ BB_CDF(k) : la p-value est super-uniforme sous H0, le test
  est **valide et conservateur**. Analogue primaire [lu] : Vovk (2012), PMLR 25:475-490, §3 Prop. 2b, p. 478-479
  (`docs/biblio/M012-h/fiche-vovk-2012.md`). Preuve exécutable : `u4b_hyp_atoms_keep_the_lower_tail_test_conservative`
  (énumération exacte avec atomes, inégalité stricte observée).
- **Décision** : p-value = P(K′ ≤ K), rationnel exact ; **NON ssi p-value ≤ 5/100** (`rejectsAtLevel`,
  `u4b-hyp.mjs:142` ; A&B annexe A.1.1 [lu] : une p-value valide satisfait P_H(p ≤ t) ≤ t ; la frontière « ≤ » découle
  de cette condition). Queue basse = « couverture trop basse ». Aucun lissage ni tie-break aléatoire : l'alternative
  « smoothed » de `:100` n'est PAS adoptée. Exactitude épinglée là où le flottant ne sait pas trancher
  (`g2proto_level_decision_exact_where_float_cannot_tell`).
- **Verdicts** (C-1) : ensemble fermé `VERDICTS` = {OUI, NON, UNDER_CALIB, NON_TESTABLE_E2} (`u4b-hyp.mjs:60`),
  consommé par les tests (`g2proto1b_verdicts_closed_set_c1` ; `cw1_verdicts_membership_on_the_written_report_t17` sur
  le rapport ÉCRIT) ; précédence UNDER_CALIB > NON_TESTABLE_E2 > test. UNDER_CALIB : n_frais < 100, q̂ null du
  producteur gelé (`u4b-scores.mjs:63-71`). NON_TESTABLE_E2 : n_e2 < 50 (`:100`) ; strates 2 et 3 d'e2 (46 et 8)
  toujours ; frontière épinglée des deux côtés (`g2proto_e2_min_n_boundary_50_testable_49_not`).
- **Épinglages C-3** : (i) cellule A poolée = `meta.cell_a.{n, p, qhat}` du producteur gelé
  (`u4b-scores.mjs:266-270`) ; (ii) frontière « p-value ≤ 5/100 » ; (iii) `n`, `p` et `q̂` **lus** dans la méta gelée et
  **assertés** — `p` = ⌈99(n+1)/100⌉ en BigInt, égal à l'expression gelée `Math.ceil((n+1)*0.99)` (`u4b-scores.mjs:65` ;
  0 divergence sur n ∈ [1, 5·10⁷], mesuré au G2 1a) ; `n` = lignes fraîches de la cellule ; `q̂` = p-ième plus petit score
  frais ; `strate` = `strateOf(yhat)` importée du fichier gelé ; `alpha = 0.01` et `n_min = 100` (gardes de dérive).
  Toute incohérence = refus nommé (`HypError`), jamais un recalcul silencieux ; le câblage `computeH3` est épinglé
  (`g2proto_tampered_meta_qhat_is_refused_through_computeH3`, `g2proto_producer_drift_n_min_and_score_guards_refuse`) ;
  gardes amont de `parseScores` épinglées (`u4b_hyp_parse_scores_refuses_rows_ne_meta_n_vx3`,
  `u4b_hyp_parse_scores_refuses_score_ne_exceedance_vx5`, `u4b_hyp_parse_scores_refuses_strata_ne_4_vx6`).
- **Sur NON** (C-11) : k, n_e2, E[K] = n_e2·p/(n+1), couvertures observée, nominale et attendue sous H0, manque, écart et
  p-value, chacun asserté contre sa forme close (`g2proto_c11_fields_on_non_cell_equal_closed_forms`). La borne
  Σ w̃·d_TV (Barber, Candès, Ramdas & Tibshirani 2023, arXiv:2202.13415v5, Thm 2 [lu],
  `docs/biblio/ukemi-modeL/L-lecture-tibshirani2019-barber2023.md`) est déclarée **non estimée** (aucun estimateur
  pré-enregistré ; item I-1). **Texte servi (C-11)** : la phrase de `:100` est lue verbatim dans le prereg sha-épinglé et
  figure sur chaque ligne OUI, et seulement là (`u4b_hyp_c11_sentence_read_verbatim_from_pinned_prereg`).

### 4. H-4 (C-6) et H-6 (C-7)
- **H-4** (`computeH4`, `u4b-hyp.mjs:283`) : appels de l'épisode ordonnés par (block, log_index) ; remboursement par
  appel = `floorDiv` (ADR-U3 D1) ; rapprochement **exact** de chaque position (user, dette, collatéral) avec
  `repayment_base` de U3-realized (sinon refus) ; positions `repayment_base: null` exclues et comptées ; numérateur = Σ des
  appels **après le premier** ; dénominateur = `y` du JSONL de scores ; deficit rapporté **à part** ; médiane exacte (0 pour
  un mono-appel) et Σ par strate ; sous-ensemble multi-appels en secondaire ; fractions multi-appels (cellule A et tous
  les liquidés) contre 5/100, **NON ssi > 5/100** — frontière épinglée des deux côtés : 1/20 ⇒ OUI
  (`g2proto1b_h4_boundaries_and_guards`), 5/99 ⇒ NON (`cw1_h4_boundary_just_above_5_over_100_is_NON`). e2 : 11/99 et
  24/189, NON attendu (prereg `:101`) ; 194/194 positions rapprochées exactement.
- **H-6** (`computeH6`, `u4b-hyp.mjs:392`) : valeurs servies = lignes `kind:"price"` WETH de U3-inputs aux blocs des
  appels de l'épisode (`price` à b, `price_prev` à b−1 ; deux valeurs différentes au même bloc ⇒ refus) ; série = ancre
  p0 + lignes `update` du oracle-path **réduit** ; NON ssi une valeur ∉ events ∪ {p0}, ou retard > 3 events, ou retard non
  défini (épinglés : `u4b_hyp_h6_synthetic_lag_bound_membership_and_anchor`,
  `g2proto1b_h6_future_value_and_same_block_conflict`) ; `anchor.source` rapporté (le repli `book_weth_price_base_8dec`
  est inatteignable en course depuis U-4b-1b-4 : ancre pré-B₀ inconditionnelle, contrôle C-10-bis) ; biais d'échantillon
  déclaré (valeurs aux seuls blocs de liquidation, `docs/adr/ADR-U4-book-et-calibration.md:106-107`). e2 : 179 valeurs,
  177 ∈ events, 2 = p0, 0 hors série, retard max 3 (reproduit `docs/adr/ADR-U4-book-et-calibration.md:104-112`).

### 5. Labels et clause :359 (C-2) — ruling Q-1 (a) daté
- `labels_no_quorum_unresolved` = nombre de lignes de U3-realized de l'épisode dont `repayment_base === null`
  (`u3-realized.mjs:226`) ; `residual ∋ no_quorum` est compté **à part** ; c'est le premier compteur qui constitue les
  « non résolus » de `:359` (`u4b_hyp_labels_no_quorum_counts_null_repayment_only`).
- `clause_359` (`clause359`, `u4b-hyp.mjs:576`) = {`h3_no_NON_on_served_strata` (NON compté sur les seules strates
  **servies**, n_frais ≥ 100 ; UNDER_CALIB et NON_TESTABLE_E2 ne comptent jamais), `labels_no_quorum_unresolved`,
  `condition_satisfied`, `h3_pooled_verdict_outside_condition`}.
- **Ruling Q-1 (a), journalisé le 2026-09-22 à 23:24 UTC** (commit `7c70826`, `docs/CHANTIERS.md:913`), avant toute
  donnée fraîche : la clause `:359` est lue à la lettre — « aucune strate SERVIE en NON au test H-3 » ; le q̂ poolé n'est
  servi nulle part (G0-lot-u4b C-10) ; le verdict de la cellule A poolée est **rapporté hors condition** et, **s'il vaut
  NON, porté à l'investisseur AVANT l'application mécanique de U-6** (information, pas STOP). L'option (b) (poolé dans la
  condition) est refusée : ce serait un durcissement postérieur au prereg. Épinglé au niveau `computeH3`
  (`g2proto_pooled_non_is_reported_outside_the_359_predicate_q1a`) et au niveau `clause359`
  (`g2proto1b_clause359_pooled_non_outside_the_condition_q1a` : `{true, 0, true, "NON"}`). Ce paragraphe remplace
  « demande formée Q-1 ; ruling attendu avant l'étape 6a » du texte v1 (C-V-2 / C-W-3).
- **Observation** : `u4b-scores.mjs:120` fait `BigInt(p.repayment_base)` sur chaque ligne de l'épisode ; un label `null`
  fait donc lever une exception au scoreur gelé (étape 6b). Si un rapport existe, `labels_no_quorum_unresolved` vaut
  structurellement 0 pour le même fichier de labels : c'est une ceinture, dite telle quelle.

### 6. Tuyaux (ADR-M018 ; règle de Branchement) — à ajouter à la table Tuyaux ; tests @ `c1e9e30`
| pièce | entrée (qui produit) | sortie (qui consomme) | état (où il vit) | tests qui prouvent la composition (intégration non-LLM) |
|---|---|---|---|---|
| `u4b-hyp.mjs report` (segments 2-3) | `U4b-scores-<EP>.jsonl` et `U4b-oracle-path-<EP>.jsonl` (réducteur et scoreur gelés, étapes 6a-6b) ; `U3-inputs.jsonl` et `U3-realized.jsonl` (labeler, étape 4) ; fixture e2 (dépôt, sha `301d39fa…`) ; prereg (sha `1971d9b1…`) | `hyp-report-<EP>.json` hors dépôt (`--out` de l'étape 6d du RUNBOOK) → ligne « Sidecar 6 » → `body.clause_359` → application mécanique de la clause U-6 par l'orchestrateur (RUNBOOK étape 8, décision 137) | fichier écrit une fois (`wx`), hors dépôt, déterministe ; `body_digest` = sha256 du corps canonique (provenance hors digest) ; `upcoming` | `u4b_hyp_report_e2_end_to_end_deterministic_body_digest` (`apps/sentinel/test/u4b-hyp.test.ts:582` : fixtures committées réelles des deux côtés, digest épinglé `49b138c3…`, octets identiques sur 2 exécutions), `cw1_verdicts_membership_on_the_written_report_t17` (`:841`, lit le fichier ÉCRIT), `g2proto1b_clause359_pooled_non_outside_the_condition_q1a` (`:708`), `u4b_hyp_cli_refuses_forbidden_unknown_and_in_repo_flags` (`:639`), `g2proto1b_out_with_dotdot_named_child_is_inside_the_repository` (`:689`) |
| cœur H-3 `computeH3` (segment 1) | JSONL de scores frais + fixture e2 | `report` (segment 2) | pur | `u4b_hyp_h3_e2_vs_e2_strata_and_pooled` (`:294`), `g2proto_pooled_non_is_reported_outside_the_359_predicate_q1a` (`:362`) |

**Statut** : `upcoming` jusqu'à la première exécution de 6d sur l'épisode frais (item I-4) ; aucun octet servi ne change
(export public rejoué : 328 fichiers, manifeste identique à celui du checkpoint-2 1b,
`docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:73` ; contre la base, seule la ligne `excluded_tests` du manifeste diffère,
`docs/PLI-lot-u4b-stats-1-1c.md:95-101`) ; registre public inchangé.

### 7. Taille (R-25) et ordre de fusion — trois segments first-parent (C-W-2, mise à jour du re-checkpoint-2)
- R-25, pathspec de `ci.yml:65` verbatim (15 arguments), mesuré sur les commits et rejoué au fold par fusion à blanc sur
  `lot/etude-suite` @ `7154d18` (forme CI `<parent 1 de la fusion>...<commit du lot>` et forme first-parent,
  identiques) : **segment 1** `50f78b0..66141fb` = **735** (733 + / 2 −, 4 fichiers ; dont unité 1a 640) ; **segment 2**
  `66141fb..4c5fa8d` = **826** (813 + / 13 −, 3 fichiers) ; **segment 3** `4c5fa8d..c1e9e30` = **178** (175 + / 3 −,
  2 fichiers ; le rendu du pli, `.md`, est exclu). D'un bloc `50f78b0..c1e9e30` = 1 707 (1 705 + / 2 −) > 1 205 ⇒ trois
  fusions `--no-ff` séparées sont OBLIGATOIRES (décision 25, `docs/CHANTIERS.md:94`) : `66141fb`, puis `4c5fa8d`, puis
  `c1e9e30`, jamais un seul `merge` de la branche (linéaire : ce serait un segment unique de 1 707). Fusions réelles :
  `28ffb5b`, `aeeed70`, `b9964ee` (2es parents `66141fb`, `4c5fa8d`, `c1e9e30`, dans cet ordre sur la chaîne
  first-parent) ; R-25 relu au fold sur ces trois fusions : 735 / 826 / 178, identique.
- **Gates non touchés** : STOP A-5 (1 150) et `VIBEGATES_PR_LIMIT = 1205` (`ci.yml:43`) ; 826 dépasse la seule cible de
  mission (< 800) : « dépassement déclaré de la cible de mission (D-4) », ruling de vocabulaire
  (`docs/CHANTIERS.md:958`) ; ni dérogation ni escalade (`docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:80`).
- **Conflit au segment 1** (fusion à blanc au fold sur `7154d18`) : `scripts/export-exclude-tests.json` a été modifié des
  deux côtés depuis `50f78b0` (tronc : `30a2eee`, U-4b-1b-4, entrée `u4b-probe-cutoff.test.ts` ; lot : `564292d`, entrée
  `u4b-hyp.test.ts`) ; deux régions (phrase `reason`, dernière entrée de `tests`). Résolution par **union** : la phrase du
  lot est ajoutée après celle de U-4b-1b-4 ; l'entrée `apps/sentinel/test/u4b-hyp.test.ts` suit
  `apps/sentinel/test/u4b-probe-cutoff.test.ts` ; blob attendu sha256
  `0b648e14cd3e9964aba1375ec87b3281eeca9703e13a631a6e347f73f076de56` (15 entrées). Segments 2 et 3 : propres (le RUNBOOK
  fusionne automatiquement ; delta fusionné = delta du lot). La fusion à blanc du re-checkpoint-2 (sur `38c767e`, avant
  la fusion de U-4b-1b-4 : 0 conflit) n'est plus représentative ; le conflit était annoncé à l'entrée G7 de U-4b-1b-4
  (`docs/CHANTIERS.md:988`) et il est mesuré indépendamment par le re-G2-delta 1c (C-R1, même union, même sha256,
  pointe `3bbbb06`) ; il a été résolu ainsi à la fusion réelle `28ffb5b` (le fichier vaut `0b648e14…` à `b9964ee`). Blobs de l'arbre fusionné = blobs de `c1e9e30` pour les quatre fichiers propres au lot (outil, `.d.mts`,
  test, rendu du pli).
- **`<HEAD_E2>`** : la troisième fusion complète la composition de `<HEAD_E2>` (U-4b-1b-4 + U-4b-STATS-1 en trois
  segments, plus toute fusion non docs intervenue entre-temps, chacune listée avec D-n : ruling I-6 et ruling (d) du G7
  U-4b-1b-4, `docs/CHANTIERS.md:990`) : `<HEAD_E2>` = `b9964ee`, consigné par la ligne SIDECAR « gel `<HEAD_E2>` » du
  2026-09-23 05:29:12 UTC (commit `5a7b76b`), qui inscrit aussi l'outil `65b0d8f9…` et l'arbre d'exécution
  `<EXEC_TREE_E2>` épinglé à `b9964ee` ; elle précède toute étape ≥ 2c-bis non commencée.

### 8. Mutants — harnais nommés (hors dépôt, sha256 des octets) et résultats
| étape | harnais (sha256) | résultat |
|---|---|---|
| G1 1a | worker `mutants.mjs` (`619b620c…` au G1) | 16/16 tués par leur test nommé ; 1a+1b (patch) 42/42 |
| checkpoint-2 1a | rejeu worker 16/16 ; `vx-mutants.mjs` (`e47f0e0f…` au §3.2 du rendu intégral ; fichier réécrit avant le rejeu final, `8e1baabc…` à la mesure du fold) | VX-1..8 : 5 tués ; VX-3/5/6 survivants ⇒ C-V-3 (fermée en 1b) |
| G2 1a | `g2-mutants.mjs` (`239d8404…` au rendu du G2 1a ; fichier modifié depuis, `71b03a1a…` à la mesure du fold) | 20 mutants propres ; 16 survivent aux tests de 1a (G01 et G20 équivalents, G08/G09 tués par `lang:gate` en CI) ⇒ C-G2-1..C-G2-5 ; 12/12 visés tués par les prototypes |
| 1b (v3) | worker v46 `mutants.mjs` (`9722de92…`) + phase B du G2 | 58/58 byIntended (42 G1 + 4 VX + 12 G2) |
| checkpoint-2 1b | rejeux 46/46, 12/12, VX 8/8 ; `vy-mutants.mjs` (`ad21d889…`) | VY-1..8 : 5 tués, VY-7 équivalent (`wx`), VY-2 et VY-6 survivants ⇒ C-W-1 |
| G2-delta 1b | `g2-mutants-1b.mjs` (`d4421f50…`) | 23 mutants propres : 9 tués byIntended sur `4c5fa8d` ; 14 non (13 survivants + D13) ⇒ C-G2D-1..C-G2D-6 ; tous tués par le prototype |
| **arbre final `c1e9e30`** | v46 ré-ancré `mutants-1c.mjs` (**`7ca83ff9b67885305e953d40cf6c6bc0ac6630fe11089a43819cf066e49c9808`**, 1 ligne de diff vs `9722de92…` : ancre de M40) | **46/46** byIntended (M40 rouge sur T19 et sur `g2proto1b_out_with_dotdot_named_child_is_inside_the_repository`) |
| | phase F du G2 `g2-mutants-1b-1c.mjs` (`8400251b47ab30290a72ee5e4b9b6c316fa8bed5c580868a23d44a90d02dd366`, copie chemins seuls de `d4421f50…`) | **15/15** byIntended (D02, D03, D04, D07, D08, D11, D12, D13, D15, D16, D19, D21, D22, D23, D24) |
| | `vy-mutants-1c.mjs` (`560c469ef428c6ba521891f4df2c92300c41f24988d140a1b5187dfdcfccd3bc`, copie chemins seuls de `ad21d889…`) | **8/8** tués (VY-2, VY-6, VY-7 par les tests du prototype) |
| | `cw1-mutants.mjs` (`eeb1a4974f91782afb150bf2794df723d2542a7805387927d62cb158e7dc5c8a`) | **4/4** byIntended après ; 0/4 avant (prototype seul) : les deux tests `cw1_*` sont nécessaires |
| | re-checkpoint-2 : `vz-mutants.mjs` (`6099ca4c9ea9b28bd26cc3743ef588f1d875f42acca0af191c4af9eadcd013b1`) | **7** : 4 tués (VZ-2 régression C-G2D-1, VZ-4, VZ-5, VZ-6) ; VZ-1 équivalent de comportement, VZ-7 équivalent arithmétique ; **VZ-3 survit** (`isAbsolute(rel)` retiré : fail-closed, hors chemin servi) ⇒ item I-V-1 |

Sur l'arbre final : 46 + 15 + 8 + 4 + 7 = 80 mutants distincts, 77 tués, 3 survivants qualifiés (2 équivalents, 1
fail-closed formé en item). Les rejeux du re-checkpoint-2 sont identiques au worker (verdict, sha muté, ensemble des tests
rouges ; `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:37-60`). **Consigne de rejeu** (condition du re-checkpoint-2, §5.1) :
tout rejeu du harnais v46 sur un arbre qui contient C-G2D-1, fusion comprise, utilise `mutants-1c.mjs` `7ca83ff9…` ;
`mutants.mjs` `9722de92…` s'arrête sur l'ancre de M40 (0 occurrence dans l'outil corrigé).

### 9. Déviations D-n déclarées (F-3) et `error_origin`
| D-n | contenu | `error_origin` |
|---|---|---|
| D-1 (G1) | couture R-25 : lot 1 385 (G1) puis 1 707 (fin) > 1 150 ⇒ unités séparées, aujourd'hui trois segments first-parent (§7) | dimensionnement du plan : planificateur + validateur du checkpoint-1 (R-25 attendu non chiffré ; `docs/CHECKPOINT2-lot-u4b-stats-1-1a.md:24`) |
| D-2 (G1) | `--alpha` et `--reference` n'existent pas : constantes et chemin fixe sha-épinglé ; `--alpha 0.05` = refus nommé (C-10) | n-a (choix imposé par C-10) |
| D-3 (G1) | H-6 lit le oracle-path **réduit** (ancre + `update`), non le brut du prober (C-5 ii / C-7) | n-a (choix imposé) |
| D-4 (G1) | le compteur de labels vient de U3-realized, non de `census` (clé absente, mesuré au checkpoint-1 ; C-2) | n-a (choix imposé) |
| D-5 (G1) | amendement livré en texte proposé, inséré par l'orchestrateur (ADR amendé sur le tronc après la base) | n-a (patron NARABI-OPS-1d) |
| D-6 (G1) | ajouts déclarés : mutants M37-M42, T19 durci après l'effet de bord de M40, sous-commandes `h3`/`h4`/`h6`, en-têtes décrivant le lot | worker, toléré (checkpoint-2 1a, CA-7) |
| D-4 (1b v3) | segment 2 = 826 > cible de mission 800 | dimensionnement du plan (déjà assigné au checkpoint-2 1a) ; vocabulaire : §7 |
| D-1 (1c) | copie du harnais v46 : ancre de M40 ré-ancrée, seule ligne changée (le correctif C-G2D-1 réécrit la ligne visée) | n-a (conséquence mécanique ; acceptée minimale, `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:79`) |
| D-C4 (fold) | ordre C-4 « brut frais existant avant la fusion ⇒ D-n » : la course a démarré avant les fusions (ruling I-6 ; fusions à 05:21 UTC) ; au fold (lecture `ls` seule du dossier de course, 2026-09-23 05:34 UTC, donc aussi à la fusion), seuls existent les bruts des étapes 1 à 3a (discover, sélection, cache du recorder `--filter-only`) et un dossier de sonde vide ; AUCUNE entrée de l'outil n'existe (labels de l'étape 4, brut du prober de l'étape 5, fixtures réduites et scores des étapes 6a-6b : dossiers absents) ⇒ l'outil est figé (`65b0d8f9…`, tests épinglés) avant que `U4b-scores-<EP>.jsonl` existe : l'anti-sélection visée par C-4 tient | orchestrateur (ordre course-avant-fusion, même racine que la D-n datée du RUNBOOK §A « Gel d'outillage ») |
| D-F1 (fold) = C-R1 (re-G2 1c) | fusion à blanc du re-checkpoint-2 périmée (tronc `38c767e`) : conflit au segment 1 sur `7154d18` (fold) et sur `3bbbb06` (re-G2), résolu par union (§7) | orchestrateur (attendu « 0 conflit » de la mission non re-mesuré après la fusion de U-4b-1b-4 `da5d6e1`, assignation du re-G2 1c §6) ; cause structurelle O-E (§12) |

### 10. MAST résiduel
- **Dérive de spécification** : niveau, sens, couverture et fixture de référence sont des constantes ; les flags
  `--alpha`, `--level`, `--side`, `--ref`, `--reference`, `--smoothed`, `--seed`, `--tie-break`, `--two-sided` et
  `--n-min` sont refusés, de même que tout flag inconnu, en double ou manquant (M01-M03, M15, M39).
- **Vérification circulaire** : oracles indépendants et antérieurs (masses de l'avis advisor-defi Q6, 3,6 / 5,8 / 6,3 /
  10,4 % ; ADR-U4 :104-112 ; 11/99 et 24/189 ; rapprochement exact avec U3-realized épinglé ; lgamma indépendant ;
  moments A&B p.50 ; énumération exacte avec atomes). L'épingle de régression T17 (digest produit par l'outil) n'est
  jamais seule : les champs C-11 sont assertés contre leurs formes closes (C-G2-3).
- **Vérification incomplète** (FM-3.2, mode résiduel des deux G2) : 0 survivant non qualifié sur l'arbre final (§8).
- **Garde de chemin sondée d'un seul côté** (C-G2D-1, défaut de code réel : `<racine>/..x` écrit dans le dépôt, mesuré au
  G2-delta et rejoué par le re-checkpoint-2) : correctif `rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)`
  (`u4b-hyp.mjs:629`) ; leçon consignée par le re-checkpoint-2 (AM-1) : toute garde de chemin se sonde sur ses formes
  limites (`..x`, `..`, absolu, autre lecteur, séparateur) avant d'être déclarée épinglée.
- **Perte d'historique** (coupures n°2 et 429) : états reconstitués depuis des sha consignés, jamais de mémoire ;
  reconstruction de 1a prouvée octet-exacte par le G2 1a et le checkpoint-2 1a.

### 11. Gel et invariants (A-6, régime B, LF)
Les 9 fichiers gelés du prereg §2 (`u4b-scores 2f9a31f6…`, `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…`,
`wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…`, `rpc.ts 0e232519…`, `calib-digest 3603265d…`, labeler
`u3-realized cb020425…`) et le prereg `1971d9b1…` sont byte-identiques à `50f78b0`, à `c1e9e30` et sur l'arbre fusionné
(fusion à blanc du fold sur `7154d18` ; fusion réelle `b9964ee`). Le gel A-6 du lot compte 13 invariants (ces 10, plus le sélecteur, le prober et
cet ADR, mesurés à `50f78b0`) : 13/13 sur les blobs du lot à chaque revue ; sur l'arbre fusionné, **10/13**, les trois
écarts venant du TRONC seul — sélecteur `20e1cf9d…` (G7 U-4b-1b-3), prober `4ed4c31e…` (G7 U-4b-1b-4, écart apparu
après la mesure 11/13 du re-checkpoint-2 sur `38c767e`), ADR `9268ecb8…` (amendements antérieurs à celui-ci). Aucun
fichier du lot n'est gelé ; le lot ne touche aucun des 13.

### 12. Items formés (zéro « dû » nu)
| item | contenu | porteur | déclencheur | source |
|---|---|---|---|---|
| **I-G2D-1** | le SIDECAR inscrit le sha256 LF du blob `scripts/census/u4b/u4b-hyp.mjs` de l'arbre fusionné = **`65b0d8f9608969c670bd321d7613920c408ccf90bac4e067e990b93dad77fc25`** (remplace `07e25e19…` de l'item I-3 du G1), les trois segments étant fusionnés AVANT l'étape 6a. **Première inscription FAITE** : ligne « gel `<HEAD_E2>` » du 2026-09-23 05:29:12 UTC (commit `5a7b76b`), avant toute étape ≥ 6 (C-4 satisfaite). Reste la **re-mesure à l'exécution** : la ligne « Sidecar 6 (pré-6a) » (RUNBOOK étape 6d, édit E-04) relit le blob dans l'arbre qui exécute l'étape 6 (garde contre une dérive d'arbre) ; autre valeur ⇒ STOP + D-n ; `provenance.tool.sha256_lf` du rapport doit l'égaler (la provenance est hors `body_digest`, qui reste `49b138c3…`) | orchestrateur | étape 6a (re-mesure) | `docs/G2-lot-u4b-stats-1-1b.md:28-31` ; `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:86` ; SIDECAR, ligne « gel `<HEAD_E2>` » |
| **I-V-1** (test seul) | épingler `isAbsolute(rel)` de `outOfRepo` : un `--out` sur un autre lecteur, parent inexistant, doit échouer sur « parent directory does not exist » et non sur « inside the repository », sans écriture (tue VZ-3) ; même constat, indépendant, au re-G2-delta 1c (O-B, « durcissement facultatif, décision du G7 ») | worker | prochain pli test-only du lot OU prochain toucher d'`outOfRepo`, au premier des deux ; non bloquant (fail-closed, hors chemin servi) | `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:54,88` ; `docs/G2-lot-u4b-stats-1-1c.md` §7 |
| **O-D** (test seul, facultatif) | lier le corps ÉCRIT au digest : recompute indépendant de `body_digest` depuis le fichier écrit dans T17 (aujourd'hui le digest est calculé sur le corps en mémoire ; `canon` rendrait un champ `undefined` non recomputable — détectable, jamais silencieux) | worker | même déclencheur qu'I-V-1 | O-2 du G2-delta 1b (rendu intégral) ; `docs/G2-lot-u4b-stats-1-1c.md` §7 (O-D) |
| **O-A** | la garde `outOfRepo` est lexicale (`resolve` + `relative`) : un chemin du dépôt écrit par l'espace de noms de périphériques Win32 ou par un partage UNC n'est pas reconnu (même famille que O-4 du G2-delta 1b : jonctions) ; hors modèle de menace de l'outil (opérateur unique, `--out` du RUNBOOK) ; direction mesurée par le re-G2 : `realpathSync.native` + refus des chemins UNC | orchestrateur | extension du modèle de menace de la garde, ou réemploi du motif `outOfRepo` dans un nouveau lot | `docs/G2-lot-u4b-stats-1-1c.md` §5, §7 |
| **O-E** | format du registre `scripts/export-exclude-tests.json` (une phrase `reason` unique + un tableau alimenté en fin) : toute paire de lots concurrents qui excluent chacun un test entre en conflit (cause structurelle de C-R1) ; décision d'architecture : (i) union documentée au G7 (retenue pour ce lot, §7) ou (ii) une entrée `{test, reason}` par test, en ordre trié | orchestrateur | prochain lot qui exclut un test de l'export | `docs/G2-lot-u4b-stats-1-1c.md` §4, §7 |
| **C-W-4 (a) — procurement JKK** | **clos « non requis »** (motivé ; acte de l'orchestrateur à ce G7, option ouverte par le checkpoint-2 1a C-V-4) : la pmf BB(N, p, n+1−p) est établie ici par dérivation complète (§3), jugée correcte et complète par le G2 1a, recomputée hors outil par deux codes indépendants (G2, checkpoint-2), et sa loi est [lu] chez A&B (p.14, p.49) ; une référence encyclopédique n'ajouterait aucune vérification. Aucun identifiant (ISBN, DOI, section) n'est cité : non vérifiés dans la chaîne, et inutiles après clôture. Alternative (demande formée à un chercheur) : ruling du G7 | orchestrateur | ce G7 | `docs/CHECKPOINT2-lot-u4b-stats-1-1a.md:16` ; `docs/G1-lot-u4b-stats-1.md:398-402` |
| **C-W-4 (b) = I-2** — versement A&B | verser au dépôt une fiche de lecture des passages cités (p.14, p.49, p.50, annexe A.1.1) d'Angelopoulos & Bates, arXiv:2107.07511v6, et ajouter la ligne du PDF (sha256 `c69aa191d8363c25b36685db4adb7e6980e55ee39892fd3626206c16e1e0efa1`) à `docs/biblio/ukemi-modeL/SOURCES-sha256.txt` (le dossier `pdf/` n'est pas suivi) ; la fiche hors dépôt existante (sha256 `b6565447aefce928d630bf658d68b9ddbdd0fefdd33249fe13ccdd6bb48bf1a2`) ne couvre pas ces pages | orchestrateur | ce G7 (était « G7 1a », échu) | `docs/G1-lot-u4b-stats-1.md:409` |
| **C-W-4 (c) = I-G2-2** | chaîne d'import `u4b-hyp.mjs:36 → u4b-scores.mjs:37 → abi.ts:7 → rpc.ts:15` (`TRANSFER_TOPIC`) : l'outil de l'étape 6d dépend de `rpc.ts`, que le pli NARABI-OPS-1d §11-1 élague ⇒ ce pli inclut `u4b-hyp.mjs` dans sa liste de déclenchement ou préserve `TRANSFER_TOPIC` ; inscrit à la ligne NARABI-OPS-1d de l'étape 8 du RUNBOOK par ce G7 | orchestrateur | G0 du pli NARABI-OPS-1d §11-1 (déclencheur du pli : clôture de course, `docs/CHANTIERS.md:783`) | `docs/G2-lot-u4b-stats-1-1a.md:32` |
| **I-1** | estimateur de la borne Barber 2023 Thm 2 (Σ w̃·d_TV) pour un NON servi : recherche de solutions, aucun estimateur improvisé | orchestrateur | premier NON sur une strate servie | `docs/G1-lot-u4b-stats-1.md:408` |
| **I-4** | statut `built` de l'outil | orchestrateur | première exécution de 6d sur l'épisode frais | `docs/G1-lot-u4b-stats-1.md:411` |
| **O-2** (observation) | le rapport est écrit une fois et déterministe : une coupure donne un échec détectable, jamais une entrée fausse silencieuse ; contrôle recommandé à 6d : rejouer vers un second `--out` et comparer les octets | orchestrateur | étape 6d | `docs/G1-lot-u4b-stats-1.md:416` |

Fermés : Q-1 (ruling (a), §5) ; I-3 du G1 (remplacé par I-G2D-1) ; I-5 du G1 (recompte NUL des fichiers non suivis fait à
23:22 UTC, `docs/CHANTIERS.md:912` ; règle durable = WORKTREE-DURABILITY-1 de l'amendement U-4b-1b-4) ; I-G2-1 (tranché par
C-G2D-6 : `VERDICTS` consommé).

### 13. Traçabilité des corrections repliées (correction → source → emplacement → `error_origin` → état)
| correction | source | où | `error_origin` | état |
|---|---|---|---|---|
| C-1..C-12 (checkpoint-1) | `docs/CHECKPOINT1-lot-u4b-stats-1.md:56-67` | outil, tests, RUNBOOK 6d (G1 §6) | n-a (exigences de plan) | faites au G1 (`docs/G1-lot-u4b-stats-1.md:285-300`) |
| C-V-1 (deux segments) | `docs/CHECKPOINT2-lot-u4b-stats-1-1a.md:13` | §7 | dimensionnement du plan | remplacée par C-W-2 puis par sa mise à jour à 3 segments |
| C-V-2 (Q-1 daté ; renvoi `:207`) | `:14` | §5 ; §14 | orchestrateur (texte v1 antérieur au ruling) ; O-3 : orchestrateur (cohérence documentaire) | fermée à cette insertion |
| C-V-3 (gardes VX-3/5/6 ; précédence VX-1) | `:15` | tests `u4b_hyp_parse_scores_refuses_*`, T7 | worker G1 (trous de preuve) ; manqué par le checkpoint-1 | fermée en 1b (`4c5fa8d`) |
| C-V-4 | `:16` | §12 | n-a | reconduite par C-W-4 |
| C-G2-1 (Q-1 (a) non épinglé) | `docs/G2-lot-u4b-stats-1-1a.md:18` | `g2proto_pooled_non_is_reported_outside_the_359_predicate_q1a` | orchestrateur (ruling journalisé après le G1, sans exigence de test) ; part worker : (a) déclaré implémenté sans épingle | fermée en 1a-corr ; volet `clause359` fermé en 1c |
| C-G2-2 (lecture de q̂ par `computeH3`, gardes `n_min` et score) | `:19` | §3 | worker G1 | fermée en 1a-corr |
| C-G2-3 (champs C-11 non assertés) | `:20` | §3 | worker G1 | fermée en 1a-corr |
| C-G2-4 (décision flottante, fail-open dès n ≈ 12 000) | `:21` | §3 | worker G1 | fermée en 1a-corr |
| C-G2-5 (frontière E2_MIN_N d'un seul côté) | `:22` | §3 | worker G1 | fermée en 1a-corr |
| C-W-1 (a) (poolé NON au niveau `clause359`) | `docs/CHECKPOINT2-lot-u4b-stats-1-1b.md:15` | §5 | volet différé par le G2 1a (item, pas une faute) | fermée en 1c (`g2proto1b_clause359_pooled_non_outside_the_condition_q1a`) |
| C-W-1 (b) (frontière H-4) | `:15` | §4 | worker (« NON ssi > 5/100 » écrit sans test) + checkpoint-1 (C-6 sans la frontière) | fermée en 1c (1/20 ⇒ OUI ; 5/99 ⇒ NON) |
| C-W-1 (c) (consommateur de `VERDICTS`) | `:15` | §3 | worker G1 (export sans consommateur, I-G2-1) | fermée en 1c |
| C-W-2 (fusions first-parent) | `:16` ; mise à jour `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:84` | §7 | dimensionnement du plan | acte du G7 (3 fusions) |
| C-W-3 (ADR à l'insertion ; RUNBOOK `:501`) | `docs/CHECKPOINT2-lot-u4b-stats-1-1b.md:17` ; `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:85` | ce texte ; deltas du RUNBOOK (même commit) | orchestrateur (hunk RUNBOOK gardé tel quel en v3, sur ordre ; texte v1 antérieur au ruling) | fermée à cette insertion |
| C-W-4 | `docs/CHECKPOINT2-lot-u4b-stats-1-1b.md:18` | §12 | n-a | (a) clos ; (b) et (c) formés |
| C-G2D-1 (code : `outOfRepo`) | `docs/G2-lot-u4b-stats-1-1b.md:21` | §10 ; `u4b-hyp.mjs:629` | worker 1b (garde `startsWith("..")` sans séparateur) ; manqué par le checkpoint-2 1b | fermée en 1c (D19, D23, VY-7, VZ-2 rouges) |
| C-G2D-2 (i) (Q-1 au niveau `clause359`) ; (ii) (phrase RUNBOOK `:501`) | `:22` | §5 ; delta RUNBOOK | orchestrateur (RUNBOOK-DELTA rédigé à 22:22 UTC, avant le ruling de 23:24 UTC) | (i) fermée en 1c ; (ii) fermée par les deltas du RUNBOOK de ce G7 |
| C-G2D-3 (H-4 : départage, frontière, 3 gardes) | `:23` | §4 | worker 1b | fermée en 1c |
| C-G2D-4 (H-6 : retard indéfini, conflit au même bloc) | `:24` | §4 | worker 1b | fermée en 1c |
| C-G2D-5 (gardes census, compteur non-USDT) | `:25` | §4 | worker 1b | fermée en 1c |
| C-G2D-6 (consommer `VERDICTS`) | `:26` | §3 | worker 1b | fermée en 1c |
| I-G2D-1 | `:28` | §12 | n-a (conséquence de C-G2D-1 sur les octets de l'outil) | première inscription faite (`5a7b76b`) ; re-mesure à l'étape 6a (ligne « Sidecar 6 (pré-6a) ») |
| I-V-1 (= O-B du re-G2 1c) | `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:88` | §12 | trou de preuve d'auteur (prototype du G2 + worker) sur une branche non exercée | formé |
| C-R1 (re-G2 1c : conflit du segment 1) | `docs/G2-lot-u4b-stats-1-1c.md` §6 | §7 ; entrée G7 | orchestrateur (attendu non re-mesuré après `da5d6e1`) ; cause structurelle O-E | acte du G7 (union à la fusion réelle) |
| O-A, O-D, O-E (re-G2 1c) | `docs/G2-lot-u4b-stats-1-1c.md` §6-7 | §12 | O-A, O-D : worker 1b d'origine (préexistants) ; O-E : structurel | formés |
| note A-6 | `:89` | §11 | n-a (mouvements du tronc) | consignée ici (10/13 sur `7154d18`) |
| incident NUL (coupure n°2) | `docs/G1-lot-u4b-stats-1.md:28-45` | G1 §1 | infrastructure + réécriture sans fsync + contrôle post-coupure limité aux fichiers suivis (orchestrateur) | clos (restauration prouvée ; I-5 fait) |
| incident sans effet (`FETCH_HEAD`) | `docs/CHECKPOINT2-lot-u4b-stats-1-1c.md:123` | — | validateur (écriture dans `.git` du dépôt principal hors clause AM-2) | consigné |
| incident sans effet (fold) | journal du fold | — | worker du fold (un `git status` d'orientation sans verrous optionnels désactivés a rafraîchi le cache stat de l'index du worktree du lot ; contenu inchangé) | consigné |

### 14. Erratum documentaire O-3 — renvoi `:207 → :402` (C-V-2)
La ligne `:207` de ce fichier (table « D4 — re-gel » de l'amendement décision 126, instantané daté où le labeler valait
`755b3a38…618db2de4`, gel déféré) est antérieure au re-gel QF-2 : pour le labeler `scripts/census/u3-realized.mjs`, la
valeur en vigueur est `cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af`, **re-gelée à `:402`** (tableau du
lot U-4b-1b-1 ; recompute `:406-407`) et reprise à `:731` ; elle est celle du prereg §Y et §8c et de la ligne
`--labeler-sha` du SIDECAR. Numéros de ligne mesurés dans ce fichier à `7154d18` (inchangés depuis `50f78b0` : les
amendements s'ajoutent en queue). La ligne `:207` n'est pas éditée en place (ajout pur ; instantané daté conservé) ;
l'annotation en place demandée à la lettre par le checkpoint-2 1a reste un ruling du G7.

*(ADR-U4b n'est PAS dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Cet amendement n'édite
AUCUNE valeur de référence existante : il APPEND une section datée. Le worker ne committe pas (R-20) ; l'orchestrateur folde
et committe au G7.)*

### Addendum d'insertion (orchestrateur `claude-fable-5-1`, G7 U-4b-STATS-1, 2026-09-23)
- Chaîne de revue : checkpoint-1 (`docs/CHECKPOINT1-lot-u4b-stats-1.md`, C-1..C-12) ; G1 (`docs/G1-lot-u4b-stats-1.md`,
  worker `claude-opus-5-5[1m]`) ; checkpoint-2 1a (`docs/CHECKPOINT2-lot-u4b-stats-1-1a.md`, C-V-1..C-V-4) ; G2 1a
  (`docs/G2-lot-u4b-stats-1-1a.md`, intégral `docs/G2-lot-u4b-stats-1-1a-integral.md`, C-G2-1..C-G2-5) ; checkpoint-2 1b
  (`docs/CHECKPOINT2-lot-u4b-stats-1-1b.md`, C-W-1..C-W-4) ; G2-delta 1b (`docs/G2-lot-u4b-stats-1-1b.md`,
  C-G2D-1..C-G2D-6, I-G2D-1) ; micro-pli 1c (`docs/PLI-lot-u4b-stats-1-1c.md`) ; re-checkpoint-2 1c
  (`docs/CHECKPOINT2-lot-u4b-stats-1-1c.md`) ; re-G2-delta 1c (`docs/G2-lot-u4b-stats-1-1c.md`).
- Insérés dans le MÊME commit que cet amendement : les deltas de `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md`
  (ligne R-K de §B ; à l'étape 6d, précondition d'ordre, ligne neuve « Sidecar 6 (pré-6a) » et ligne « Sidecar 6 » ;
  phrase Q-1 (a) et item I-G2-2 à l'étape 8) ; le prereg (`1971d9b1…`) reste byte-identique.
- Ordre de fusion : trois `merge --no-ff` first-parent, `66141fb` → `4c5fa8d` → `c1e9e30` (fusions `28ffb5b`, `aeeed70`,
  `b9964ee`) ; conflit du segment 1 résolu par union (§7) ; `<HEAD_E2>` = `b9964ee` (§7).
- Rulings demandés au G7, non tranchés par ce fold : clôture JKK « non requis » ou demande formée (§12) ; annotation en
  place de `:207` ou erratum seul (§14) ; acceptation de la D-n D-C4 (§9) ; sort des durcissements facultatifs I-V-1
  (= O-B) et O-D (§12).

## Amendement daté 2026-09-23 (UKEMI-RETRY-2/3 / HEARTBEAT-1 — 408 transitoire, `Retry-After` honoré, battement paramétrable dans le recorder) — inséré au G7 du 2026-09-23 (fusion `12b6dcd`)

> **Provenance.** Texte proposé par le worker `claude-opus-5-5[1m]` (effort max, décision 133), 2026-09-23 vers 05:1x UTC, lot `lot/ukemi-retry-2` (base `lot/etude-suite` @ `435aec0`), aucun commit (R-20). Insertion et révision par l'orchestrateur `claude-fable-5-1` seul (R-21). Décisions investisseur 140 / 140-bis (option vitesse, jambe payante Chainstack). `error_origin` ASSIGNÉ au G7 : plan (classe 408 non qualifiée à la conception du retry du recorder ; période du battement codée en dur).

**Modèle de faute (mesuré, course temps 1).** Pool `eth_call` de l'essai 4 (`--operators drpc.org,tenderly.co,chainstack`) = {drpc.org, chainstack} : `tenderly.co` n'est pas un opérateur `eth_call` (`packages/rpc-guard/src/transport.ts:36`). Un seul HTTP 408 de drpc (« Request timeout on the free plan », `docs/CHANTIERS.md:965`) était FATAL au premier essai (`record.ts:355` ne retentait que 429/≥500) ⇒ bench 25 s (`rpc2.ts:172`) ⇒ un seul résultat ⇒ `NoQuorumError` (`rpc2.ts:176`) ⇒ STOP de l'essai 4 à 04:29:31.217Z (diag `ts`) — deux lancements consignés dans `F:\course-ukemi\logs\record-t1.launch.log` (04:25:27Z pid 118725 ; 04:27:51Z pid 84) : le STOP est à 1 min 40 s du lancement effectif de 04:27:51Z (correction C-G2-3, `error_origin` G1). L'essai 2 portait déjà 5 × 408 drpc sur `eth_call` (Sidecar 3 suite). Le transport parse déjà `Retry-After` en `retryAfterMs` sur tout non-ok sauf 403 (`transport.ts:235`, borne 60 000 ms `:70-77`) ; le recorder l'ignorait (backoff fixe). Le battement du filtre n'était émis que toutes les 2 000 lectures (`record.ts:91`) ⇒ 36 min muettes à l'essai 2.

**Décision (D-n).**
1. **UKEMI-RETRY-2** : dans le shim `call` du recorder (`apps/sentinel/src/ukemi/record.ts`), un `HttpError` **408** est TRANSITOIRE (retry borné EN PLACE : `--retries`, R retries ⇒ R+1 `client.call` ⇒ R+1 lignes write-ahead + R+1 tally), jamais un bench immédiat. Bras `NonJsonBody@408` ajouté par symétrie, DÉFENSIF (via ce transport un `NonJsonBody` ne porte qu'un 2xx : inatteignable, cf. R-U-3). **Restent FATALS** : tout autre 4xx (400 plan-limited de getLogs — `getLogsVia` doit le recevoir JETÉ, `rpc2.ts:194-196` ; 403, 404, 407, 409), `RpcError`, `RedirectBlocked`, `BudgetExceededError` (fatal d'abord, inchangé).
2. **UKEMI-RETRY-3** : attente avant la tentative suivante = `min(max(retryAfterMs, backoffMs·2^attempt), backoffCapMs)` quand `retryAfterMs` est défini, fini et > 0 ; sinon `min(backoffMs·2^attempt, backoffCapMs)` (inchangé). Fonction pure exportée `retryWaitMs`. **Valeurs (E-3)** : défauts `--retries 2 --backoff-ms 500 --backoff-cap-ms 8000` inchangés ; ligne de course proposée `--retries 6 --backoff-ms 1000 --backoff-cap-ms 30000` ⇒ attentes 1, 2, 4, 8, 16, 30 s = 61 s en place (> bench 25 s ; nuance O-3 du G2 : dans le pool `eth_call` à 2 opérateurs un bench n'est pas une pause mais un `NoQuorumError` immédiat, `rpc2.ts:172-176` — le critère opérant est 7 échecs consécutifs sur une même lecture, 61 s sans `Retry-After`, ≤ 180 s avec). Un `Retry-After` supérieur au cap est TRONQUÉ au cap (déclaré) ; le transport le borne déjà à 60 s. L'attente passe par `RecorderDeps.sleep` (optionnel, défaut `setTimeout`) : les tests l'injectent et n'attendent jamais.
3. **UKEMI-HEARTBEAT-1** : `--heartbeat-every <n>` (optionnel, défaut 2000, entier ≥ 1 ; C-1(b) : argument CLI, aucune variable d'environnement). `0` est refusé PRÉ-VOL au parse (0 fetch, aucun verrou) et le cœur `enumerateAndCountAtRisk` refuse lui-même une période non entière ou < 1 avant toute lecture (un `% 0` rendrait le battement muet en silence). La ligne stderr garde ses compteurs cumulés (`calls={…} errors={…}`) et ajoute ` t=<ISO>` (`deps.now`). **Rien ne change dans le JSON ni sur stdout** : aucune clé ajoutée à la provenance (D-n : la période n'est donc pas tracée dans le brut ; elle vit dans le script de course).

**`record.ts` est HORS gel** (prereg §2 ; cet ADR, amendement UKEMI-RETRY-1 §1). Les 9 sha LF gelés sont byte-identiques AVANT == APRÈS (recompute worker, `tr -d '\r' | sha256sum`) ; `rpc2.ts`, `book.ts`, `resume.ts` et `packages/rpc-guard/**` sont intouchés. La ligne §5a du prereg est inchangée dans son CONTENU (`--heartbeat-every` est optionnel ; son absence = comportement antérieur) ; ses annotations de ligne `record.ts:N` dérivent de : +0 (N ≤ 64), `:65` modifiée en place (signature), +4 (66-135), +5 (136-159), +8 (160-184), +9 (185-200), +20 (204-350), +22 (351-399), +23 (N ≥ 400) — p. ex. `:239-250` → `:259-270`, `:266-271` → `:286-291`, `:318` → `:338` (hunks `git diff -U0 435aec0`). `ukemi_sha` change (hors `book_digest`).

**Tuyaux (règle de Branchement).**
- *Entrée* : `TransportError` levée par le transport gardé pendant une lecture quorum-2 (`HttpError` 408 ; `retryAfterMs` parsé du header).
- *Sortie* : le shim ré-émet le `client.call` après `retryWaitMs` (ledger write-ahead + tally) ; la faute est journalisée dans `rpc_errors` (`http: 408`, détail fermé pour un payant) et comptée dans `errors_by_operator` ; la ligne de battement stderr (`--filter-only`).
- *État* : ledger de cycle par opérateur (hors dépôt), cache `--resume`, `<out>.diag.json`.
- *Tests de composition (non-LLM, chemin SERVI, seul `globalThis.fetch` bouchonné)* dans `apps/sentinel/test/ukemi-guard-record.test.ts` : `ukemi_record_retry2_drpc_408_is_retried_in_place_course_topology_survives` (rejoue la mort de l'essai 4 sur la topologie de course : corps drpc réel à 408, retry en place, livre = PIN), `…_persistent_408_is_bounded_then_surfaces_and_leaks_nothing`, `…_4xx_boundary_only_408_is_transient`, `ukemi_record_retry3_retry_after_floors_the_backoff_under_the_cap`, `ukemi_record_heartbeat1_period_is_the_flag_stderr_only_with_iso_t`, `…_zero_is_refused_preflight_and_in_the_filter_core`, `…_changes_nothing_but_stderr` ; parse : `ukemi_record_parses_cli_args` (`apps/sentinel/test/ukemi-record.test.ts`).

**Changement de sémantique `errors_by_operator` (D-4, règle des 5 %)** — calque UKEMI-RETRY-1 §3 : le hook transport incrémente à CHAQUE lever ⇒ un 408 retenté compte jusqu'à R+1 fois (au lieu de 1-puis-bench). Affichage/provenance seul (aucune garde de code). **Consigne** : la règle d'arrêt 140-bis se lit sur le battement comme Δ`errors.drpc.org` / Δ`calls.drpc.org` entre deux lignes consécutives (compteurs cumulés, `t=` donne l'intervalle). Observation O-4 du G2 : pendant le préfixe servi par le cache `--resume`, Δappels drpc = 0 ⇒ règle « non évaluable » ; la première ligne de battement cumule l'énumération (400 plan-limited drpc) ⇒ évaluer à partir du 2ᵉ battement live.

**Coût.** Un retry sur la jambe payante = +1 appel métré (2 RU par `eth_call` : `docs/ETAT-REPRISE.md` §6, recompté par le worker sur le ledger de cycle — 2 414 entrées `attempted` eth_call, toutes `credits_derived: 2`, tarif `chainstack-2026-09-21`), borné à ×(R+1) par lecture ; **Sémantique des bornes (correction C-G2-1 du G2, mesure `packages/rpc-guard/src/client.ts:37-38,107-121`)** : `--method-caps eth_call` borne les tentatives de la SEULE jambe payante (chainstack ; le cap n'est appliqué qu'aux opérateurs non `keyless`, compte par `op|method`) ; `--max-calls` borne les tentatives de TOUS les opérateurs (2 jambes par lecture + énumération) ; chaque retry consomme `--max-calls`, et `eth_call`/RU seulement s'il tombe sur la jambe payante. Dimensionner la marge sur les retries sur ces deux bornes distinctes.

**Doctrine ADR-GARDE-HELIUS — texte compagnon à insérer au même G7.** `ADR-GARDE-HELIUS-client-budgete-unique.md:320` et `:502` disent « JAMAIS … 4xx!=429 » ; le recorder retente désormais le 408. Proposé (append daté, sans éditer les lignes existantes) : « Amendement 2026-09-23 (UKEMI-RETRY-2/3) : pour le shim `call` du recorder Ukemi seul, `HttpError` 408 (et `NonJsonBody@408`, défensif) rejoint les transitoires ; l'attente honore `retryAfterMs` (`min(max(Retry-After, backoff), cap)`). Les autres 4xx restent JAMAIS retentés. Classifieurs frères non alignés : item R-U-4 (ADR-U4b). »

**Résidus formés (déclencheur, propriétaire : orchestrateur ; zéro dette nue).**
- **R-U-3 étendu** : `NonJsonBody@408` inatteignable par le transport (mutant « 408 retiré du bras `NonJsonBody` » SURVIT, déclaré). *Déclencheur* : un transport levant `NonJsonBody` sur un non-2xx.
- **R-U-4 (408 et `Retry-After` non alignés ailleurs)** : `apps/bell/src/quorum.ts` `isTransient`, `apps/bell/src/universe.ts` `withUniverseRetry` (honore `Retry-After` par REMPLACEMENT, sans cap) et `scripts/census/u4-guard.mjs` `isTransient` ne retentent pas le 408. *Déclencheur* : un 408 observé dans un diag Bell ou census, OU la passe d'alignement R-BR3/R-BR4/R-U-2, au premier des deux.
- **R-U-5 (temps 2 sans battement)** : le chemin livre complet (`recordBook`, temps 2) n'a AUCUN battement (`book.ts` sans `onTick`) ; `--heartbeat-every` y est accepté sans effet. *Déclencheur* : AVANT le lancement du temps 2 — lot UKEMI-HEARTBEAT-2 (compteur au niveau du lecteur, `book.ts` intouché) ou décision datée de courir muet avec surveillance de la croissance du cache `--resume`.
- **PROV-MODEL-1** : `model: "claude-opus-4-8[1m]"` codé en dur dans la méta d'un cache `--resume` neuf et dans les deux provenances (`record.ts`, 3 occurrences) — roster périmé (décision 133) ; hors `book_digest` (la méta est ignorée à la relecture, `resume.ts:86`). Hors liste fermée de ce lot. *Déclencheur* : prochain lot recorder (champ à dériver d'un argument, jamais d'une constante).

*(ADR-U4b n'est pas dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Ajout pur : aucune valeur de référence existante n'est éditée.)*

## Amendement daté 2026-09-23 (UKEMI-CONC-1 — fenêtre bornée `--concurrency <n>` du recorder et portail de politesse FIFO par opérateur ; décision investisseur 140-bis ; fold G7 : G1 `dec704d` + back-merge `ce7bccf` + micro-pli 1b `2f1e728`) — inséré au G7 du 2026-09-23 (fusion `e1411cf`)

> **Provenance.** Texte v1 : worker G1 `claude-opus-5-5[1m]` (effort max, décision 133), 2026-09-23 vers 05:4x UTC, rendu hors
> dépôt (D-5 du G1 ; sha256 `8b56659160b763913fac879c3aaab7f1f12e41b6801ea71f9328bf412a039f9e`), base `lot/etude-suite` @ `2c276bb`.
> Texte v2 : fold G7, worker `claude-opus-5-5[1m]` (effort max), 2026-09-23 07:57-08:33 UTC (C-G2-4 × 8, C-V-3 (i)-(iv) ; sha256
> `6ae2ab29b6188fe463a81a4f3c060812697daf5014884c611249d5737a4c5f58`). **Texte v3 (ce texte)** : même worker, 2026-09-23 à partir de
> 09:12 UTC, docs seulement, aucun commit (R-20) ; il intègre le micro-pli 1b (`2f1e728`), le re-checkpoint-2 du pli (C-V3-1 (i)-(vii))
> et les rulings de l'orchestrateur du 2026-09-23 (UKEMI-GUARD-GATE-1, report de PROV-MODEL-1, garde de blob du temps 2, catégorie
> `error_origin` « implémentation pli (outillage de preuve) »). Insertion, remplacement des marqueurs du G7, révision : orchestrateur
> `claude-fable-5-1` seul (R-20, R-21). Générateur ≠ relecteurs : G2 et re-G2-delta = instances Opus 5.5 séparées à contexte frais ;
> checkpoint-2 et re-checkpoint-2 = validateur-humain `claude-fable-5-1`, instances séparées ; indépendance déclarée
> (`docs/G2-lot-ukemi-conc-1.md:17-18` ; `docs/CHECKPOINT2-lot-ukemi-conc-1.md:66` ; `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:12`).
> Décisions investisseur 140 / 140-bis (`docs/ETAT-REPRISE.md:137-138`). `error_origin` : proposés par correction (§11), ASSIGNÉS au G7.

### 1. Chaîne de revue (ordre réel ; heure = `TZ=UTC git log` du commit porteur)

| étape | artefact | verdict | commit (heure UTC) |
|---|---|---|---|
| G1 (worker `claude-opus-5-5[1m]`) | `docs/G1-lot-ukemi-conc-1.md` ; `pool.ts` et `prefetch.ts` (neufs), `rpc2.ts`, `record.ts`, `resume.ts` ; `apps/sentinel/test/ukemi-conc.test.ts` (11 tests) | 19/19 mutants du worker tués par leur test nommé ; oracle 7 × 0, 988/986/0/2 (clone frais) | `dec704d` sur `lot/ukemi-conc-1` (06:56:18), base `2c276bb` |
| checkpoint-2 (validateur-humain `claude-fable-5-1`) | `docs/CHECKPOINT2-lot-ukemi-conc-1.md` | ACCEPTE-AVEC-CORRECTIONS C-V-1..C-V-3, conditionné au G2 PASS et à un re-G2-delta du micro-pli (§7, `:80`) | persisté `0383e5b` (06:56:32) |
| G2 (relecteur `claude-opus-5-5[1m]`, contexte frais) | `docs/G2-lot-ukemi-conc-1.md` | PASS-AVEC-CORRECTIONS C-G2-1..C-G2-4 ; 15/18 mutants du relecteur tués par un test nommé, 3 survivants (G2M3b, G2M8, G2M19) ⇒ C-G2-2, C-G2-3 ; fusion à blanc sur `db86efc` : 0 conflit, oracle 7 × 0, 1053/1051/0/2 (clone frais) | persisté `8a05bab` (07:40:16) |
| back-merge (orchestrateur ; option (β) du pli, `docs/PLI-lot-ukemi-conc-1-1b.md:20-35`) | fusion de `lot/etude-suite` @ `6aca053` dans le lot | AUTOMATIQUE : `git merge-tree --write-tree dec704d 6aca053` = `44008497d3cf…` = `ce7bccf^{tree}` (`docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:26` ; recomputé par ce fold sans écriture dans le dépôt) | `ce7bccf` (08:28:15) |
| micro-pli 1b (worker `claude-opus-5-5[1m]`) | `docs/PLI-lot-ukemi-conc-1-1b.md` ; `record.ts` 3/3, `prefetch.ts` 6/4, `ukemi-conc.test.ts` +102 (11 → 13 tests) | C-V-1/C-V-2 (= C-G2-1), C-G2-1b, C-G2-2, C-G2-3 ; 15/15 mutants tués par leur test nommé, MV1/MV2 aussi au typecheck ; oracle 7 × 0 sur le produit de fusion, 1055/1053/0/2 (clone frais) ; worktree seul ROUGE par construction (D-1 du pli) | `2f1e728` (08:28:17) |
| re-checkpoint-2 du pli (validateur-humain `claude-fable-5-1`) | `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md` | ACCEPTE-AVEC-CORRECTIONS C-V3-1..C-V3-3, conditionné au re-G2-delta PASS ; oracle 7 × 0 sur `2f1e728` et sur la fusion à blanc `defb0a7` ← `2f1e728` (0 conflit, 1055/1053/0/2) ; mutant distinct « `every: 2000` sur le seul préfetch livre » rouge sur le test C-V-2 (`:40`) | persisté `637dbb4` (09:02:49) |
| re-G2-delta du pli (instance fraîche ; condition du checkpoint-2 `:80` et du re-checkpoint-2 `:62`) | `docs/G2-lot-ukemi-conc-1-1b.md — PASS, liste fermée vide (O-R1..O-R7)` | avant la fusion du G7 | — |
| G7 (orchestrateur `claude-fable-5-1`) | fusion `--no-ff` de `2f1e728` et ce texte | preuves C-V3-3 (§8) | `e1411cf` |

### 2. Décision

- **`--concurrency <n>`** : argument CLI optionnel (aucune variable d'environnement, C-1(b)). Absent ⇒ **1 = le recorder séquentiel,
  inchangé** — preuve différentielle du G2 contre l'arbre pré-lot : 10/10 scénarios, JSON (hors la clé déclarée
  `provenance.concurrency`, D-8), diag, cache `--resume`, ledgers et SÉQUENCE des requêtes identiques ; seuls écarts : de TEMPS, F-1 et
  F-2 levés (`docs/G2-lot-ukemi-conc-1.md:75-86`). Présent ⇒ entier décimal ≥ 1, sinon **refus pré-vol** avant client, verrou et ledger
  (0 fetch, dossier ledger vide ; `docs/G2-lot-ukemi-conc-1.md:132-136`). Parsé hors `parseUkemiArgs` (`parseConcurrency`,
  `apps/sentinel/src/ukemi/pool.ts` ; appel `record.ts:251` @ `2f1e728`, D-2).
- **Préfetch borné, consommateurs INCHANGÉS** : à n > 1, `apps/sentinel/src/ukemi/prefetch.ts` rejoue le plan de lecture du
  consommateur (passe de filtre ; `recordBook`) à travers le lecteur **mémoïsant** (cache `--resume`, ou mémo en RAM sans fichier) par
  une fenêtre de n tâches ; puis le consommateur inchangé tourne séquentiellement sur des HIT. `book.ts` **non touché** (PIN
  `034fbff9…`) ; l'agrégation reste celle du code d'origine, dans l'ordre des holders ⇒ `book`, `book_digest`, `holders_digest`,
  `counts`, `hf_findings` (ordre compris), `timeline` et, en passe de filtre, `holders`, `holders_digest`, `n_at_risk_config`,
  `excluded`, `projection_remaining_calls` **byte-identiques à n = 1 par construction** (G2 : 6/6 scénarios n = 1 contre n = 8, PIN de
  la plage complète compris, `docs/G2-lot-ukemi-conc-1.md:88-95` ; checkpoint-2 : n = 1/3/8 sur un jeu que le worker n'avait pas
  couvert, `docs/CHECKPOINT2-lot-ukemi-conc-1.md:33`). Écartés : boucle concurrente dans `recordBook` (invariant `book.ts`) ou dans
  `enumerateAndCountAtRisk` (conflit certain avec UKEMI-RETRY-2/3).
- **Portail de politesse partagé** (`makePoliteGate`, `apps/sentinel/src/ukemi/rpc2.ts`, remplace `polite`) : file FIFO par
  opérateur (`providerOf`, D-4 inchangé) ; émission au plus tôt à `last + intervalle` sur l'horloge MONOTONE `performance.now()`
  (re-testée après chaque minuteur, au plus 10 sommeils) ; `last` posé APRÈS l'émission ; suivant libéré avant la fin de l'appel.
  Opérateurs DISTINCTS servis en parallèle et `--slow-operator` honoré À TRAVERS le portail : épinglés au pli 1b (C-G2-3 : deux blocs
  ajoutés à `ukemi_conc_polite_gate_spaces_issues_per_operator_under_concurrency` ; G2M3b, G2M19, MS1 rouges). Le même portail couvre
  les **retries** appelants du recorder (`attempt > 0`) ⇒ « ≤ 1 appel par `minIntervalMs` par opérateur » vaut retries compris (G2 :
  0 écart sous l'intervalle, `Date` ou `performance.now` gelés compris, `docs/G2-lot-ukemi-conc-1.md:113-126`).
- **Fenêtre** : ≤ n tâches en vol (n travailleurs, un curseur) ; résultats rangés par index d'entrée. **Première erreur (C-G2-4
  point 4)** : la fenêtre s'arrête à la PREMIÈRE erreur dans le TEMPS. « Équivalent séquentiel » vaut pour la MÉCANIQUE (comme la boucle
  séquentielle, aucune lecture n'est lancée après elle), PAS pour l'IDENTITÉ de l'erreur : à n > 1, le holder fautif et la classe de
  l'erreur — donc le code de sortie (1 abstention, 2 arrêt budgétaire) et le diag — peuvent différer de ceux de n = 1 (D-9,
  `docs/G1-lot-ukemi-conc-1.md:129-131`) ; les erreurs ultérieures, y compris un `BudgetExceededError` survenu pendant le drain, sont
  listées dans `diag.pool.suppressed` (URL retirées, `record.ts:528` @ `2f1e728`), jamais relancées. **Arrêt à la frontière de
  lecture** : une tâche multi-lectures (chemin livre, `prefetchBookReads`) teste le drapeau d'arrêt à CHAQUE lecture (`prefetch.ts:92`
  @ `2f1e728`) — épinglé au pli 1b (C-G2-2, `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained`).
  **Drain de toutes les tâches en vol AVANT de relancer** (F-5). Aucune sortie porteuse de digest n'est écrite sur un arrêt (inchangé :
  le JSON de run n'est écrit que sur le chemin de succès ; un arrêt en course écrit `<out>.diag.json`, avec la clé `pool` à n > 1).
  Cache `--resume` **single-flight** par clé (`resume.ts`) ; appends `appendFileSync` (une ligne complète par appel, sérialisée par le
  fil JS unique).

### 3. Modèle de faute (défaut → mécanisme → test nommé, mutant rouge)

| Défaut | Mécanisme | Test (mutant) |
|---|---|---|
| **F-1** portail pré-lot : stamp APRÈS l'attente, sans file ⇒ deux appels concurrents au même opérateur passent ENSEMBLE (déjà à n = 1 : sous-plages `Promise.all` de `getLogsVia`) | FIFO + stamp après émission | `ukemi_conc_polite_gate_spaces_issues_per_operator_under_concurrency` (M7) |
| **F-2** retry appelant hors portail | portail partagé | `ukemi_conc_retry_attempt_re_enters_the_gate` (M8) |
| portail : une file UNIQUE pour tous les opérateurs (G2M3b) ; opérateur lent D-4 ignoré par le portail (G2M19) — trous de test mesurés au G2 (`docs/G2-lot-ukemi-conc-1.md:189,203-206`) | clé `providerOf` ; `resolveInterval` consulté dans le portail | `ukemi_conc_polite_gate_spaces_issues_per_operator_under_concurrency`, deux blocs ajoutés au pli 1b (G2M3b, G2M19 ; MS1 « portail partagé sans le jeu lent » ; `docs/PLI-lot-ukemi-conc-1-1b.md:62,99`) |
| **ORACLE-HANG-1** (mesuré au G1) portail sur l'horloge murale : sous un `Date` GELÉ (preload de `test/guard-scripts-u4.test.ts`) le re-test ne finit jamais ⇒ `npm run test` pendu | horloge monotone + re-test borné | `ukemi_conc_polite_gate_uses_the_monotonic_clock_under_a_frozen_date` (M16) ; `test/guard-scripts-u4.test.ts` vert |
| **F-5** ligne write-ahead APRÈS l'`unlocked` du `finally` (seconde instance de ledger ; l'appel tardif chaîne sur le head PÉRIMÉ ⇒ « prev mismatch » ⇒ l'essai suivant refuse d'ouvrir — famille CHAIN-1) | drain avant relance | `ukemi_conc_budget_stop_drains_before_unlock_and_ledgers_stay_chained` (M4b) ; `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow` (M4) ; `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` (G2M1 : chaîne `drpc.org` cassée) |
| lectures lancées après le stop — (a) au DISPATCH (chemin filtre : une lecture par tâche) ; (b) à la PROCHAINE LECTURE d'une tâche multi-lectures (chemin livre) — **C-G2-4 point 3** | (a) drapeau au dispatch ; (b) `signal.stopped` testé à chaque lecture | (a) `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow` (M3) et `ukemi_conc_budget_stop_drains_before_unlock_and_ledgers_stay_chained` (M3b : 43 `refused` au lieu de ≤ n, `docs/G1-lot-ukemi-conc-1.md:62-63`) ; (b) `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` (G2M8 : 22 requêtes distinctes / 43 émissions après l'arrêt contre ≤ 7 / ≤ 14, `docs/PLI-lot-ukemi-conc-1-1b.md:61,98`) |
| fenêtre non bornée ; agrégation dans l'ordre d'arrivée | n travailleurs ; `out[i]` | `ukemi_conc_pool_bounds_in_flight_and_keeps_input_order` (M1, M2 — propriété portée par la fenêtre : les compteurs sont commutatifs) |
| double MISS d'une clé ; ligne entrelacée | single-flight ; append synchrone | `ukemi_conc_resume_reader_is_single_flight_per_key` (M13) ; `ukemi_conc_resume_under_concurrency_one_line_per_miss_and_replays` (M12) |
| dérive du plan de préfetch ; préfetch non branché ; mémo absent | garde « 0 lecture réseau pendant `recordBook` » ; en vol 1 < · ≤ n sur le chemin servi ; totaux d'appels n = 8 == n = 1 | `ukemi_conc_book_prefetch_leaves_recordbook_zero_network_reads` (M9, M10, M15) ; `ukemi_conc_n8_filter_and_book_are_byte_identical_to_n1` (M11, M11b, M14) |
| défaut ≠ 1 ; 0 accepté | `parseConcurrency` | `ukemi_conc_concurrency_is_optional_default_1_and_fail_closed` (M5, M6) |
| battement du préfetch figé à 2 000 : `--heartbeat-every` accepté, validé puis IGNORÉ à n > 1 (ex-R-C-1 ; 0 ligne `..prefetch` à `--heartbeat-every 5`, `docs/CHECKPOINT2-lot-ukemi-conc-1.md:37`) ; compteurs de la passe de rejeu non remis à zéro (ex-R-C-2) ; `t=` absent de la ligne `..prefetch` | `every: args.heartbeatEvery` aux deux appels (`record.ts:438,476` @ `2f1e728`, C-V-1) ; `every` OBLIGATOIRE dans `PrefetchOpts` (`prefetch.ts:20`, C-G2-1b) ; `t=` ISO de `deps.now` (`record.ts:429`, C-G2-1b) | `ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero` (MV1-MV8, MT1, MT2 ; MV1/MV2 aussi au typecheck, TS2345 ; mutant distinct du re-checkpoint-2 « `every: 2000` sur le seul préfetch livre », `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:40`) |

**Budget (choix documenté)** : aucune lecture NOUVELLE après le stop ; les lectures en vol terminent — un appel déjà passé par `commit`
finit son transport (ligne `attempted` écrite, write-ahead honoré), un appel qui atteint `meter` après l'épuisement est **refusé et
ledgeré** (`refused`, 0 crédit) : le ledger de cycle compte les TENTATIVES, au plus une refusée par lecture en vol (≤ n). Plafonds tenus
sous concurrence (vérification et incrément dans le même tour synchrone ; G2 b1-b4 : aucun dépassement,
`docs/G2-lot-ukemi-conc-1.md:138-151`). **Tallies (C-G2-4 point 5)** : les tallies de provenance (`calls*`, `rpc_errors`,
`errors_by_operator` ; NON-gating) sont égaux à n = 1 sauf R-C-3 **sur une course menée à terme** ; sur un ARRÊT, ils portent EN PLUS
les appels des ≤ n − 1 lectures en vol au moment de la première erreur et ≤ n lignes `refused` (G2, `--method-caps eth_call=40` :
7 `refused` à n = 8 contre 1 à n = 1 ; drpc 50 tentatives à n = 8 contre 44 à n = 1, keyless, bornées par `--max-calls`).

### 4. Tuyaux (règle de Branchement)

- *Entrée* : `--concurrency <n>` (ligne de course) → `parseConcurrency` → `runRecorder` (pré-vol) ; `--heartbeat-every <n>`
  (UKEMI-HEARTBEAT-1) règle aussi la période du battement du préfetch (C-V-1).
- *Sortie (C-G2-4 point 7 ; C-V3-1 (i))* : les MÊMES artefacts (JSON de run, `book`/`book_digest`, cache `--resume`,
  `<out>.diag.json`) ; `provenance.concurrency` (hors digest, D-8 ; le consommateur gelé `scripts/census/u4b/u4b-reduce.mjs:41-48` ne
  lit que `book` et `provenance.book_digest`) ; `diag.pool` (n > 1) ; battement stderr
  `..prefetch pass=<filter|book> holders_done=… n_at_risk_config=… rate=…/s concurrency=… calls={…} errors={…} t=<ISO>`
  émis **à la période `--heartbeat-every`** (holders dont la lecture de configuration est arrivée ; C-V-1, `record.ts:438,476` @
  `2f1e728` ; avant le pli, figé à 2 000, `docs/G2-lot-ukemi-conc-1.md:217-224`) et horodaté **`t=` = ISO de `deps.now`** (C-G2-1b,
  `record.ts:429` ; `realDeps.now = Date.now`, `record.ts:217`) ; sur le chemin servi, la période vient du seul parse
  (`reqInt("--heartbeat-every", 2000)`, `record.ts:169-170`), `every` étant OBLIGATOIRE dans `PrefetchOpts` (`prefetch.ts:20`). Lecture
  en course : débit réseau = Δ`calls` par opérateur / Δ`t` entre deux lignes ; règle 140-bis = Δ`errors` / Δ`calls` par opérateur entre
  deux lignes ; `rate=` compte des holders, HIT du cache compris (piège `docs/ETAT-REPRISE.md:130`) ; `holders_done` devance d'au plus n
  tâches les plans complets (le tick suit la lecture de configuration, `prefetch.ts:93-95` @ `2f1e728`) ; à n > 1 en `--filter-only`, la
  passe inchangée qui suit REJOUE le cache et émet ses propres lignes `..filter`, qui repartent de `--heartbeat-every` (remise à zéro
  épinglée : MV6, MV7) : du rejeu, pas du réseau.
- *État* : cache `--resume` (hors dépôt) ou mémo en RAM ; ledgers de cycle par opérateur (inchangés).
- *Tests de composition (non-LLM, chemin servi `runRecorder` sur le VRAI `openGuardedClient`, seul `globalThis.fetch` bouchonné, corps
  JSON-RPC de forme réelle)* : `ukemi_conc_n8_filter_and_book_are_byte_identical_to_n1` (+ PIN à n = 8),
  `ukemi_conc_budget_stop_drains_before_unlock_and_ledgers_stay_chained`, `ukemi_conc_resume_under_concurrency_one_line_per_miss_and_replays`,
  `ukemi_conc_retry_attempt_re_enters_the_gate` ; au pli 1b : `ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero`
  (battement des deux préfetchs, période, `t=`, remise à zéro du rejeu) et
  `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` (arrêt non budgétaire sur le chemin livre, ledgers
  chaînés, `unlocked` dernier). Registre : branché ; « built » à la première course rapprochée (temps 2 à n > 1).
- **Relation à R-U-5 (C-G2-4 point 2 ; `:1856` de cet ADR, amendement UKEMI-RETRY-2/3)** : à n > 1, le temps 2 A un battement — les
  lignes `..prefetch pass=book` couvrent toute sa phase réseau (le `recordBook` qui suit rejoue le cache : 0 lecture réseau hors
  R-C-3, garde `ukemi_conc_book_prefetch_leaves_recordbook_zero_network_reads`), à la période `--heartbeat-every`, horodatées `t=`
  (C-V-1 et C-G2-1b appliqués au pli 1b `2f1e728`) ; la règle 140-bis y est évaluable. R-U-5 est donc satisfait pour toute course à
  n > 1, dont la ligne de course du §6 ; à n = 1 (repli séquentiel), R-U-5 reste entier, déclencheur inchangé (`recordBook` sans
  `onTick`). La ligne `:1856` n'est pas éditée (ajout pur).

### 5. Portée : gel, invariants, ripple, déclencheur d'usage

- **Gel D4 intact (A-6, régime B, LF)** : les 9 sha du prereg §2 (`docs/PLAN-u4b-prereg.md:116-124`) sont byte-identiques à
  `dec704d`, `8a05bab`, `6aca053`, `2f1e728` et `3147249` (`git show <c>:<f> | tr -d '\r' | sha256sum`, 9/9, recomputé par ce fold),
  à `2c276bb` (G1, G2, checkpoint-2) et sur le produit de la fusion à blanc `defb0a7` ← `2f1e728` (re-checkpoint-2, `:43`) ; au
  commit de fusion : `9/9 SAME sur e1411cf (2f9a31f6, a5e66cd3, 5733daeb, 7bee76fc, 3376eb08, 9206df91, 0e232519, 3603265d, cb020425)`. `rpc.ts 0e232519…` et `book.ts` intouchés.
- **Invariants (re-checkpoint-2 §9, `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:83`)** : depuis le back-merge `ce7bccf`, la forme
  littérale « diff vide contre `2c276bb` » n'est plus probante (elle compte le code d'`etude-suite` entré par le back-merge) ; formes
  probantes, VIDES (recomputé par ce fold) sur `book.ts`, cet ADR, le prereg, `apps/sentinel/test/fixtures`, `package-lock.json`,
  `packages`, `scripts`, `apps/bell` : `2c276bb..dec704d` et `6aca053..2f1e728`.
- **Hors gel (C-G2-4 point 8)** : `record.ts` et `rpc2.ts` sont nommés hors gel par le §3 de l'amendement 2026-09-21 de cet ADR
  (`:133-136`, « en aval du jeu gelé »). Ce §3 ne nomme PAS `resume.ts`, `pool.ts` ni `prefetch.ts` : ils sont hors gel parce
  qu'absents du tableau des 9 gelés (prereg §2, `docs/PLAN-u4b-prereg.md:110-126`) et de la fermeture transitive du jeu gelé
  (`docs/PLAN-u4b-prereg.md:130`) — aucun des 9 n'importe `record.ts`, `rpc2.ts`, `resume.ts`, `pool.ts` ni `prefetch.ts` (`git grep`
  des lignes `import` des 9 à `8a05bab` et à `dec704d` : vide). Prereg §5a inchangé dans son contenu (aucun flag ne lie `record.ts` ;
  ses annotations de ligne `record.ts:N` dérivent) ; `ukemi_sha` change (hors `book_digest`).
- **Ripple complet (C-G2-4 point 6)** — consommateurs NON-test de `makeUkemiPool`, mesurés par `git grep -n makeUkemiPool` à `8a05bab`,
  `6aca053`, `637dbb4` et `2f1e728` (fichiers non touchés par le lot : mêmes lignes sur l'arbre fusionné) ; le portail FIFO par
  opérateur s'y applique dès qu'ils tournent sur un arbre qui contient ce lot :
  - Bell : `apps/bell/src/ethereum.ts:97` (`minIntervalMs: 200`) ;
  - outils de course : `scripts/census/u4-oracle-path.mjs:189` (prober de l'étape 5 ; `:130` à la base `2c276bb`),
    `scripts/census/u4-redraw.mjs:92` (re-tirage indépendant U-4a, `minIntervalMs: 50` — **absent de la liste du G2, ajouté par le
    fold**), `scripts/census/u4b/u4b-discover.mjs:106`, `scripts/census/u4b/u4b-probe-cutoff.mjs:97`,
    `scripts/census/u4b/u4b-select-episode.mjs:405` ;
  - effet : les appels concurrents à un même opérateur (sous-plages d'une scission `Promise.all` de `getLogsVia`) sont cadencés au lieu
    de partir en rafale ; valeurs rendues inchangées (suites vertes sur l'arbre du lot et sur les fusions à blanc, dont
    `test/guard-scripts-u4.test.ts`, prober sous `Date` gelé : `docs/G2-lot-ukemi-conc-1.md:214-216` ;
    `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:43`) ; les arbres d'exécution (course, Bell) étant épinglés, le portail n'y entre qu'au
    ré-épinglage (R-C-5, §7) ;
  - `record.ts` passe son portail PARTAGÉ par l'option `gate` (retries compris) ; les autres consommateurs reçoivent chacun un portail
    propre (défaut `makePoliteGate(minIntervalMs, …)` de `makeUkemiPool`) qui ne cadence que les premiers essais (UKEMI-GUARD-GATE-1, §7).
- **Déclencheur d'usage (C-G2-4 point 1)** : UKEMI-RETRY-2/3 + HEARTBEAT-1 est FUSIONNÉ (`12b6dcd`, docs `db86efc`) AVANT ce G7 : la
  composition des deux lots se fait À CE G7 — R-C-1 et R-C-2, formés au G1 avec le déclencheur « G7 du second des deux lots », sont
  APPLIQUÉS au pli 1b (`2f1e728`, C-V-1/C-V-2 = C-G2-1) ; ce ne sont plus des résidus (§7). Usage au temps 2 : ce G7 fusionné ; temps 1
  COMPLET (ligne `holders` au cache `--resume`, `n_at_risk_config` = N mesuré) ; arbre d'exécution de la course ré-épinglé au sha de
  fusion, avec la garde de blob du temps 2 (§7) ; C-12 exit 0 (acquis à l'étape 2c-bis, `docs/CHANTIERS.md:1024`) ; 0 verrou ; ligne
  Sidecar 3b (go/no-go du temps 2, RUNBOOK étape 3b, `docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:304`) écrite AVANT le
  lancement, avec la ligne de course (§6), ses caps recalculés sur N mesuré et la pré-déclaration R-C-3. Option temps 1
  (`docs/G1-lot-ukemi-conc-1.md:247-248`) : la même fenêtre vaut pour `--filter-only` si le temps 1 n'est pas fini au G7 (reprise par
  `--resume`, les lectures en cache sont des HIT, 0 appel) — décision opératoire de l'orchestrateur, hors de ce texte.

### 6. Débit et ligne de course du temps 2 (proposition du G1, à valider au Sidecar 3b avec N mesuré)

- **Formule.** Pool `eth_call` pour `--operators drpc.org,tenderly.co,chainstack` = {drpc.org, chainstack}
  (`ETH_CALL_KEYLESS_LABELS` sans tenderly, `packages/rpc-guard/src/transport.ts:36` ; `chainstack` ajouté par `record.ts`) ; chaque
  lecture quorum-2 émet un appel sur CHACUN des deux ; le portail espace d'au moins `iv` = `--min-interval-ms` les émissions à un même
  opérateur ⇒ **débit ≤ 1000 / iv lectures/s** (10/s à 100 ms), sous réserve que les deux opérateurs soient servis en parallèle (vrai
  sur le doré, sonde g5 du G2 ; épinglé au pli 1b : bloc (1) de C-G2-3, G2M3b rouge). Avec une latence séquentielle L par lecture :
  débit ≈ min(n / L, 1000 / iv) ⇒ saturation dès n ≥ n_sat = L × 1000 / iv ; au-delà, les travailleurs attendent dans la file du
  portail (sain, sans gain) et seul le coût d'un arrêt croît (UKEMI-CONC-BOUND-1).
- **Mesuré** (G2, battements horodatés `t=` de l'essai 5, même ligne d'opérateurs, 100 ms ; `docs/G2-lot-ukemi-conc-1.md:269-278` ;
  recomputé par le fold sur les deux mêmes lignes) : compteur `chainstack` 535 → 3 535 entre `t=06:48:29.998Z` et `t=07:08:21.845Z` ⇒
  3 000 lectures en 1 191,847 s = 2,517 lectures/s ⇒ **L = 0,397 s** ⇒ **n_sat = 3,97** à 100 ms (1,99 à 200 ms) : n = 8 sature le
  plafond.
- **Dérivé** : gain plafond à 100 ms = 10 / 2,517 = **× 3,97** — et non le « × 5-10 » estimé avant la mesure
  (`docs/ETAT-REPRISE.md:138`).
- **Extrapolé** (4,5 lectures par compte = projection `9 × N` appels du recorder / 2 jambes ; N du temps 1 NON terminé ; à remplacer par
  N mesuré) : N = 67 191 × 3 160 / 14 000 = **15 166** (battement de l'essai 4b ; le G1 écrivait 15 190 : erratum O-2) ; 15 220 au
  dernier battement de l'essai 5 lu par le G2 (21 500 → 4 870) ⇒ lectures du temps 2 ≈ 4,5 N ≈ 68 250 à 68 490 ⇒ **≈ 1,90 h au
  plafond** (n = 8, 100 ms) contre **≈ 7,5 h en séquentiel** (× L) ; repli 140-bis à 200 ms (plafond 5/s) ⇒ ≈ 3,8 h.
- **Ligne de course proposée** (G1, `docs/G1-lot-ukemi-conc-1.md:210-248`) — base : flags de l'essai 4b et deltas de l'essai 5 (D-n du
  Sidecar 3, `docs/course-ukemi/SIDECAR-prereg-u4b-1b-2026-09-22.md:26`) ; écarts au RUNBOOK 3c
  (`docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:313`) : opérateurs de l'essai 5, `--concurrency 8`, retries, backoff et
  battement de l'essai 5 — D-n à consigner au Sidecar 3b ; préfixe ENV-7 du RUNBOOK (étape 3) inchangé ; exécutée depuis l'arbre
  d'exécution de la course ré-épinglé au sha de fusion :

```
node apps/sentinel/src/ukemi/record.ts \
  --cluster weth --block 23414968 --from-block 16496792 \
  --operators drpc.org,tenderly.co,chainstack \
  --min-interval-ms 100 --concurrency 8 \
  --retries 6 --backoff-ms 1000 --backoff-cap-ms 30000 --heartbeat-every 500 \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 --cycle chainstack-2026-09-19 --floor 12916 \
  --max-ru <2 x EC> --max-calls <9 x N x 1.2> --method-caps eth_call=<EC>,eth_getLogs=6000,eth_getBlockByNumber=4000 \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --labeler-sha cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af \
  --concordance-out F:/course-ukemi/record/concordance-book-23414968.jsonl \
  --resume F:/course-ukemi/record/U4-inputs-23414968.jsonl \
  --out F:/course-ukemi/record/U4-book-23414968.json
```

- **Caps (formule sur N, pas une hausse silencieuse ; à valider au Sidecar 3b avec N mesuré)** : `EC` ≥ 4,5 × N × 1,2 (tentatives
  `eth_call` de la seule jambe payante, marge de retry 20 %) ; `--max-calls` ≥ 9 × N × 1,2 (+ énumération, RUNBOOK 3b `:306` ; toutes
  jambes, retries compris — sémantique des bornes, `:1849` de cet ADR) ; `--max-ru` ≥ 2 RU × `EC` (2 RU par `eth_call` chainstack,
  `:1849` ; `docs/ETAT-REPRISE.md:130`). Ordre de grandeur (EXTRAPOLATION, N = 15 166) : `EC` ≈ 81 900, `--max-calls` ≈ 163 800,
  `--max-ru` ≈ 163 800 RU — à recalculer au Sidecar 3b sur N = `n_at_risk_config` du temps 1 complet, jamais repris tels quels.

### 7. Items formés et résidus requalifiés (propriétaire : orchestrateur ; zéro « dû » nu)

Requalifiés (C-V-3 (ii) ; C-V3-1 (iii)) : **R-C-1** (câbler `args.heartbeatEvery` dans l'option `every` des deux appels
`prefetch…Reads`) et **R-C-2** (remise à zéro des compteurs après le préfetch de filtre) sont **appliqués au pli 1b (`2f1e728`, C-V-1 /
C-V-2 = C-G2-1)** : R-C-1 = les deux lignes `every: args.heartbeatEvery` (`record.ts:438,476` @ `2f1e728`) ; R-C-2 fermé par test (MV6,
MV7 rouges) ; leur déclencheur « G7 du second des deux lots » était déjà tiré (RETRY-2/3 fusionné `12b6dcd`) ; ce ne sont plus des résidus.

| item | contenu | déclencheur | source |
|---|---|---|---|
| **UKEMI-CONC-BOUND-1** (O-3 du G2) | aucune borne haute sur n (fenêtre effective = min(n, holders)) : coût d'un arrêt O(n) — ≤ n `refused`, ≤ n − 1 lectures en vol, drain jusqu'à n × iv par opérateur par la file FIFO ; au-delà de n_sat (§6), n n'ajoute aucun débit ; issue : borne dans `parseConcurrency`, ou phrase datée « n ≤ 64 recommandé ; la ligne de course fixe n = 8 » | prochain lot touchant `pool.ts` | `docs/G2-lot-ukemi-conc-1.md:302-304` |
| **UKEMI-CONC-EVERY-GUARD-1** (O-P1 du pli ; C-V3-1 (vi)) | `prefetch.ts` ne revérifie pas `every ≥ 1` (`tick`, `prefetch.ts:69-72` @ `2f1e728`) alors que le cœur séquentiel le fait (`record.ts:71-72`) : un `every: 0` y donnerait `% 0` ⇒ NaN ⇒ battement muet ; seul appelant de production = `args.heartbeatEvery`, refusé `< 1` au parse (`record.ts:169-170`, pré-vol) ; `every` OBLIGATOIRE et typé : aucun défaut caché | apparition d'un 2ᵉ appelant de production de `prefetchFilterReads` / `prefetchBookReads` (ajouter alors la garde en cœur, calque HEARTBEAT-1) | `docs/PLI-lot-ukemi-conc-1-1b.md:172-177` ; `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:63` |
| **R-C-3** | `description()` en revert concordant non cacheable ⇒ lue par le préfetch PUIS relue par `recordBook` : +2 `calls`, +2 `rpc_errors`, +1 `errors_by_operator` par opérateur et par réserve concernée, hors digest (mesuré : G2 `docs/G2-lot-ukemi-conc-1.md:93-95` ; checkpoint-2 `docs/CHECKPOINT2-lot-ukemi-conc-1.md:34`) ; **ajout du fold (lecture du code, non mesuré)** : +1 observation concordante par réserve concernée dans `--concordance-out` (hors digest), `onQuorum` étant appelé avant le `throw` du revert concordant (`quorum2`, `rpc2.ts:203,205` @ `2f1e728`) | PRÉDICTIF : pré-déclarer au Sidecar 3b que `calls_by_operator` dépassera la projection n = 1 de 2 × (réserves à `description()` en revert — GHO attendu, `apps/sentinel/src/ukemi/book.ts:82-83`) : pas une fuite ; alternative code (retirer la lecture `description` de `reserve()` dans `prefetch.ts`) au prochain lot touchant `prefetch.ts`, si le G7 la préfère | `docs/G1-lot-ukemi-conc-1.md:260-264` |
| **R-C-4** | pas de recul global par opérateur sur 429 : le portail plafonne à 1 émission par intervalle, retries compris, mais pendant un épisode 429 les autres lectures en vol continuent au débit du portail | Δ`errors` d'un opérateur > 5 % de Δ`calls` entre deux battements au débit concurrent ⇒ règle d'arrêt 140-bis (200 ms, ou n plus petit) ; lot dédié si récurrent | `docs/G1-lot-ukemi-conc-1.md:265-267` |
| **R-C-5** (étendu, C-G2-4 point 6) | le portail entre dans chaque consommateur de `makeUkemiPool` au ré-épinglage de son arbre d'exécution (liste §5) ; sorties inchangées (suites vertes) | Bell : prochaine frontière `mint_end` (déploiement Bell = événement séparé) ; outils de course : ré-épinglage de l'arbre d'exécution de l'étape qui les lance (prober de l'étape 5 : `u4-oracle-path.mjs`) | `docs/G1-lot-ukemi-conc-1.md:268-270` ; `docs/G2-lot-ukemi-conc-1.md:262-264` |
| **UKEMI-GUARD-GATE-1** (ruling de l'orchestrateur, 2026-09-23 ; constat de lecture du fold v2) | F-2 n'est corrigé que dans le recorder : le retry appelant de `makeGuardedPoolCall` (`scripts/census/u4-guard.mjs:149-167`) repart après son backoff DANS le même appel au portail, donc hors cadence ; préexistant (même comportement sous l'ancien `polite`) ; borné par `retries` (0 par défaut) : un retry peut suivre de moins d'un intervalle l'émission précédente au même opérateur quand l'intervalle dépasse le backoff (500 ms au premier retry par défaut ; p. ex. `--min-interval-ms 1000` de la sonde (d), `docs/CHANTIERS.md:1024`) | prochain lot touchant `scripts/census/u4-guard.mjs`, OU toute course census lancée avec `retries > 0` ; propriétaire : orchestrateur | ruling de l'orchestrateur (entrée CHANTIERS du G7) |
| **PROV-MODEL-1** (existant, `:1857` de cet ADR) | déclencheur « prochain lot recorder » ATTEINT par ce lot (il touche `record.ts`) ; **REPORTÉ** par ruling de l'orchestrateur, motif daté 2026-09-23 : mission du lot antérieure à la formation de l'item (lancée à 04:47Z, `docs/ETAT-REPRISE.md:145` ; item formé au G7 RETRY-2/3, 06:34Z, `docs/CHANTIERS.md:1007`), course en cours ; les 3 littéraux `claude-opus-4-8[1m]` restent (`record.ts:410,455,488` @ `2f1e728`) | NOUVEAU déclencheur : prochain lot recorder APRÈS le temps 2 ; propriétaire : orchestrateur | ruling de l'orchestrateur (entrée CHANTIERS du G7) |
| **Garde de blob du temps 2** (item RUNBOOK ; ruling de l'orchestrateur) | le contrôle 0.6 du RUNBOOK (`docs/course-ukemi/RUNBOOK-course-ukemi-2026-09-22.md:95`) épingle `rpc2.ts 92577c5a` et `record.ts afa20f8c`, périmés par RETRY-2/3 et par ce lot (LF à `2f1e728` : `record.ts` `ceffc370…`, `rpc2.ts` `624bc437…`) ⇒ garde fail-closed des blobs `record.ts` et `rpc2.ts` en tête du script du temps 2 (calque du ruling (b) du G7 RETRY-2/3, `docs/CHANTIERS.md:1013`) ; 0.6 re-mesuré | Sidecar 3b (avant le lancement du temps 2) ; propriétaire : orchestrateur | ruling de l'orchestrateur (entrée CHANTIERS du G7) |
| **O-2** (erratum G1) | N = 15 166 (et non 15 190) ; L = 0,397 s mesuré | repris au §6 ; ligne Sidecar 3b | `docs/G2-lot-ukemi-conc-1.md:300-301` |
| **O-4** (C-V3-1 (v)) | commentaire périmé `apps/sentinel/test/ukemi-u4a.test.ts:149` (« polite() consults it » ; `polite` n'existe plus) ; **NON traité au pli 1b** (hors périmètre des 3 fichiers, `docs/PLI-lot-ukemi-conc-1-1b.md:63`) | prochain lot touchant `apps/sentinel/test/ukemi-u4a.test.ts` ; propriétaire : orchestrateur | `docs/G2-lot-ukemi-conc-1.md:305-306` ; `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:63` |
| **O-5** | hôtes de test `.example` (A-4 dit `.invalid`) : TLD réservé, jamais fetchés ; **NON aligné au pli 1b** : le pli n'a qu'AJOUTÉ des lignes (D-4 ; 0 ligne retirée) et ses 3 lignes ajoutées qui nomment un hôte utilisent aussi `.example` (mesuré par le fold : `git diff ce7bccf 2f1e728 -- apps/sentinel/test/ukemi-conc.test.ts`) | le déclencheur « prochaine édition du test » est ATTEINT sans alignement ⇒ re-formé : prochain lot autorisé à MODIFIER des lignes existantes de `apps/sentinel/test/ukemi-conc.test.ts` ; propriétaire : orchestrateur (confirmation au G7) | `docs/G2-lot-ukemi-conc-1.md:307` |
| **O-6** | piège d'outil mesuré : `grep -c` d'un `$'\r'` via l'outil Bash compte toutes les lignes d'un fichier LF (famille A-13) ; fins de ligne à mesurer par node | proposition d'amendement A-13 de `docs/CONSIGNE-STANDARD-G1.md`, prochaine révision de la consigne | `docs/G2-lot-ukemi-conc-1.md:308-309` |
| **O-7** (préexistant, inchangé) | une sous-plage sœur d'une scission `Promise.all` (`getLogsVia`) peut survivre au rejet de l'autre ; sur le chemin servi, `process.exit` (`record.ts:569,575` @ `2f1e728`) passe avant tout minuteur ⇒ aucune ligne après le `finally` ; seul un appelant programmatique gardant le processus vivant pourrait la voir | aucun pour la course ; à reprendre par tout lot qui appelle `runRecorder` dans un processus long ou qui touche `getLogsVia` | `docs/G2-lot-ukemi-conc-1.md:310-312` |
| **O-P2** (pli) | bornes du test C-G2-2 ATTEINTES par le doré (7 = n − 1 requêtes distinctes ; 13 ≤ 14 émissions) : bornes STRUCTURELLES (fenêtre pleine), pas des seuils de temps ; 20/20 exécutions identiques ; les assertions temporelles de C-G2-3 (écart global < IV/2, ≥ 40 ms) sont passées vertes aux 3 exécutions du re-checkpoint-2 (limite déclarée, `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:70`) | aucune action ; premier rouge non reproductible d'un test `ukemi_conc_*` en CI ⇒ item de robustesse temporelle (calque PROBE-SMTP-TIMING-1) | `docs/PLI-lot-ukemi-conc-1-1b.md:178-180` |
| O-1 | commit `dec704d` posé pendant la revue du G2 ; tout re-vérifié sur `dec704d` | aucun (clos) | `docs/G2-lot-ukemi-conc-1.md:299` |

### 8. Taille (R-25), compte et preuves du G7 (C-V-3 (iii) ; C-V3-1 (iv), (vii) ; C-V3-3)

- **R-25 (C-V3-1 (vii))**, pathspec de `.github/workflows/ci.yml:65` VERBATIM (15 arguments, extraits par programme ; recomputé par ce
  fold) : **forme CI de la PR `<pointe>...2f1e728` = 692** lignes (668 + / 24 −, 6 fichiers), identique pour les pointes `defb0a7`,
  `6aca053`, `637dbb4` (même merge-base `6aca053` ; re-checkpoint-2 `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:31`) ; delta brut du pli
  `ce7bccf..2f1e728` = 118 (111 + / 7 −, 3 fichiers) ; lot au G1 `2c276bb...dec704d` = 588 (564 + / 24 −, historique ; mesuré par le G2
  et le checkpoint-2, `docs/G2-lot-ukemi-conc-1.md:170-172`, `docs/CHECKPOINT2-lot-ukemi-conc-1.md:29`). Depuis le back-merge
  `ce7bccf` (AUTOMATIQUE, §1), la forme `2c276bb...2f1e728` = 3 590 (3 501 + / 89 −, 35 fichiers) **n'est PAS le diff de PR** : elle
  compte le code d'`etude-suite` entré par le back-merge. Bornes : 692 < 1 150 (STOP A-5) et < 1 205 (`VIBEGATES_PR_LIMIT`,
  `.github/workflows/ci.yml:43`) ; 692 > 600, cible de la mission G1 (non-gate) : **déviation déclarée** (+104 net au pli, dont +102
  lignes de test ; re-checkpoint-2 CA-10, `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:58`). Note C-V-3 (iii) : le `R25.txt` du G1 portait
  la forme ARBRE DE TRAVAIL (`git add -N` transitoire, D-7), le lot n'étant pas committé au rendu ; même valeur. Les rendus
  `docs/G1-lot-*.md` sont exclus par le pathspec (les autres `docs/**/*.md` aussi).
- **Compte attendu au G7 (C-V3-1 (iv))** : N + 13, où N = 1042 (arbre principal au G7 UKEMI-RETRY-2/3, 1042/1041/0/1,
  `docs/CHANTIERS.md:1012` ; 1042/1040/0/2 en clone frais à `defb0a7`, re-checkpoint-2 `:43` ; aucune fusion NON docs de `db86efc` à
  `3147249`, mesuré par ce fold) et 13 = 11 tests du G1 + 2 du pli (C-V-2, C-G2-2 ; C-G2-3 = blocs ajoutés à un test existant) ⇒
  **1055/1054/0/1** sur l'arbre principal (un seul skip, `sentinel_run_releases_chainstack_lock_on_sigterm`, win32) et
  **1055/1053/0/2** en clone frais (+1 skip : artefact e2 gitignoré) — 1055/1053/0/2 MESURÉ sur le produit de fusion par le pli
  (`docs/PLI-lot-ukemi-conc-1-1b.md:14-15`) et par le re-checkpoint-2 (fusion à blanc `defb0a7` ← `2f1e728`, `:43`). Le 1054/1053/0/1
  du checkpoint-2 (`docs/CHECKPOINT2-lot-ukemi-conc-1.md:61`) est SUPERSÉDÉ. Écart = STOP avant commit.
- **Lots concurrents** (N à re-mesurer juste avant la fusion) : GARDE-FSYNC-1 (pli 3 PASS-AVEC-CORRECTIONS au re-G2-delta, pli 4
  test-only lancé, `docs/CHANTIERS.md:1060` ; au pli 3 `9d85fb1`, 11 fichiers non docs dont `packages/rpc-guard/src/ledger.ts`,
  `packages/rpc-guard/src/cli.ts` et `apps/sentinel/test/ukemi-guard-record.test.ts`, mesuré par le fold) et UKEMI-PRE5-TESTS
  (`bbe8538`, 3 fichiers de test, « attendu N+3 », `docs/ETAT-REPRISE.md:152`) : s'ils fusionnent avant ce G7, N change ; pour
  GARDE-FSYNC-1 (code du ledger), la fusion à blanc du re-checkpoint-2 ne serait plus représentative : re-simuler la fusion et rejouer
  l'oracle 7 gates, dont `ukemi_conc_budget_stop_drains_before_unlock_and_ledgers_stay_chained` et
  `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained` (chaîne du ledger de cycle).
- **Preuves du G7 après la fusion RÉELLE (C-V3-3, `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:65` ; écart = STOP)** : sha256 des 3
  fichiers du pli sur l'arbre fusionné == `2f1e728` (`record.ts` `ceffc3703ab298e961bcb8b01262c8354c4872a5dbc3988e00b55d799b89dd42`,
  blob `833db0da23d3e78db689ac2149053262289c6e4d` ; `prefetch.ts` `47bf52ce0b34bcb8d8ddda1eb298662cc47e3525fb9b29518c9bf1e54e6e0533` ;
  `ukemi-conc.test.ts` `3acc52016596d212f07a3d7ff5baf6b43adccccf777345281a1d0429f076cf86`) ;
  `git diff --quiet <fusion> 2f1e728 -- . ':(exclude)docs'` exit 0 (si la pointe a avancé en non-docs : re-fusion à blanc + oracle) ;
  oracle 7 × 0 avec 1055/1054/0/1 ; A-6 9/9 (§5) — résultat :
  `DELIVERED-pli1b-merged 3/3 OK ; git diff --quiet e1411cf 2f1e728 -- . :(exclude)docs exit 0 ; oracle 7 × exit 0, 1055/1054/0/1 (09:40-09:46Z)`.

### 9. MAST résiduel (C-V-3 (i), C-V3-1 (ii) ; CA-5 parcourue a posteriori, faute de checkpoint-1)

Topologie : un worker + oracle déterministe (motif RustAssistant, CA-4) ; revues G2 ‖ checkpoint-2, puis re-G2-delta ‖ re-checkpoint-2
séparées. Modes plausibles → contre-mesure :
- **Sur-lecture / répétition d'étape** (le préfetch relit ce que le consommateur relira) — garde « 0 lecture réseau pendant
  `recordBook` » (`ukemi_conc_book_prefetch_leaves_recordbook_zero_network_reads`, M9/M10) ; seul écart connu = R-C-3 (revert non
  cacheable, hors digest).
- **Terminaison prématurée** (relance avant la fin des lectures en vol ⇒ ligne write-ahead après `unlocked`, CHAIN-1) — drain F-5 (M4,
  M4b ; mutants DISTINCTS du checkpoint-2 et du G2, G2M1 : schéma CHAIN-1 reproduit sur disque) ; arrêt à la frontière de lecture du
  chemin livre (C-G2-2, `ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained`).
- **Rétention d'information** (drapeau `--heartbeat-every` accepté puis ignoré à n > 1) — battement du préfetch câblé (C-V-1) et
  horodaté (C-G2-1b), épinglé par `ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero`.
- **Absence de recul global sur 429** — R-C-4 (règle d'arrêt 140-bis).
- **Vérification incomplète** (ajout du fold, constats du G2 et du re-checkpoint-2) : 3 mutants survivaient aux 11 tests du lot ET à
  93 tests existants (G2M3b, G2M8, G2M19) — tués au pli 1b par leurs tests nommés (harnais 15/15 byIntended,
  `docs/PLI-lot-ukemi-conc-1-1b.md:101-130`) ; le re-checkpoint-2 a montré que son propre oracle C-V-2 (filtre seul) restait VERT sous
  un câblage livre-seul erroné, que le test committé (volet livre) tue (`docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:40`) ; confirmation
  indépendante : `re-G2-delta PASS : G2M1, G2M3b, G2M8, G2M19 tués 4/4 par leur tueur visé`.
- **Vérification incorrecte (outillage)** : deux défauts du harnais du pli, attrapés avant son rendu et sans effet sur le code livré —
  critère de type lisant la mauvaise ligne de `tsc` (MV1/MV2 notés survivants à tort) ; comptes faux d'un `node -e` passé par l'outil
  Bash (A-13) — `error_origin` « implémentation pli (outillage de preuve) », catégorie acceptée par l'orchestrateur
  (`docs/PLI-lot-ukemi-conc-1-1b.md:188-189`).
- **Désalignement inter-lots** (ajout du fold) : lots CONC et RETRY/HEARTBEAT-1 planifiés en parallèle sur `record.ts`, composition
  différée par conception (R-C-1 « au G7 du second lot ») ⇒ défaut de composition mesuré (0 battement du préfetch à n > 1) — replié au
  pli 1b après le back-merge (C-G2-1, `error_origin` plan).

### 10. Déviations et `error_origin`

- **DEV-CP1 (datée 2026-09-23)** : pas de checkpoint-1 pour ce lot — plan = mission G1 sous les décisions investisseur 140 / 140-bis
  (« option vitesse ») ; CA-1..CA-5 parcourues a posteriori par le checkpoint-2 sur le plan tel qu'exécuté
  (`docs/CHECKPOINT2-lot-ukemi-conc-1.md:13`) ; à porter dans l'entrée CHANTIERS du G7 (`:62`) ; même forme que la déviation du G7
  UKEMI-RETRY-2/3 (`docs/CHANTIERS.md:1012`). Conséquence : la ligne MAST (CA-5) manquait au texte v1 (C-V-3 (i), repliée au §9).
  `error_origin` de la conséquence : plan.
- **D-1..D-10 du G1** (`docs/G1-lot-ukemi-conc-1.md:95-133`) — D-1 préfetch borné, consommateurs inchangés ; D-2 `--concurrency` hors
  `parseUkemiArgs` ; D-3 portail FIFO, horloge monotone, stamp après émission ; D-4 retry appelant cadencé ; D-5 amendement hors
  arbre ; D-6 `npm ci --ignore-scripts` ; D-7 R-25 mesuré par un `git add -N` transitoire ; D-8 `provenance.concurrency` écrit aussi à
  n = 1 ; D-9 première erreur dans le temps (précisée au §2) ; D-10 un caractère non ASCII dans une ligne de commentaire modifiée de
  `rpc2.ts`. Décisions de conception déclarées, jugées cohérentes par le checkpoint-2 (CA-1, CA-8) et rejouées par le G2 ;
  `error_origin` : n-a.
- **D-1..D-4 du pli** (`docs/PLI-lot-ukemi-conc-1-1b.md:199-210`) — D-1 oracle du worktree SEUL rouge par construction
  (`args.heartbeatEvery` n'existe qu'après la fusion de RETRY-2/3 ; oracle probant = produit de fusion) ; D-2 forme R-25 (§8) ; D-3
  pointe d'`etude-suite` avancée par des commits docs seuls ; D-4 extension de mission en cours de route (C-G2-1b/2/3). Intégration
  retenue : option (β), back-merge `ce7bccf` puis pli (`:20-35`). `error_origin` : n-a.
- **R-25 692 > 600** (cible de la mission G1, non-gate) : déviation déclarée (§8).

### 11. Traçabilité des corrections repliées (correction → source → emplacement → `error_origin` proposé → état)

| correction | source | où | `error_origin` proposé | état |
|---|---|---|---|---|
| C-G2-1 = C-V-1 + C-V-2 (cœur R-C-1 : deux lignes `every:` ; test de composition ; ferme R-C-2) | `docs/G2-lot-ukemi-conc-1.md:292` ; `docs/CHECKPOINT2-lot-ukemi-conc-1.md:58-59,80` | §2, §3, §4, §7 | plan (lots planifiés en parallèle, composition différée par conception — G2, pli) | appliquée au pli 1b `2f1e728` (`record.ts:438,476` ; `ukemi_conc_heartbeat_every_paces_both_prefetches_and_the_replay_restarts_at_zero`) |
| C-G2-1b (`t=` sur la ligne `..prefetch` ; `every` obligatoire dans `PrefetchOpts`) | `docs/G2-lot-ukemi-conc-1.md:293` | §3, §4 | plan (G2, pli) | appliquée au pli 1b (`record.ts:429` ; `prefetch.ts:20`) |
| C-G2-2 (test d'arrêt non budgétaire sur le chemin livre, G2M8) | `:294` | §2, §3, §4 | implémentation G1 (tests) — G2, pli | appliquée au pli 1b (`ukemi_conc_book_stop_halts_each_task_at_its_next_read_and_ledgers_stay_chained`) |
| C-G2-3 (assertions du portail, G2M3b et G2M19) | `:295` | §2, §3 | implémentation G1 (trou préexistant sur l'ancien `polite`, repris par la réécriture) — G2, pli | appliquée au pli 1b (deux blocs ajoutés au test du portail) |
| C-G2-4 point 1 (RETRY-2/3 fusionné ; R-C-1 plié au G7) | `:251-252` | §5, §7 | plan (amendement écrit avant la fusion RETRY) — G2 | fermée par cette insertion |
| C-G2-4 point 2 (relation à R-U-5) | `:253-254` | §4 | plan — G2 | fermée par cette insertion |
| C-G2-4 point 3 (table : tueur de l'arrêt sur le chemin livre) | `:255-256` | §3 | implémentation G1 — G2 | fermée par cette insertion |
| C-G2-4 point 4 (« première erreur » : mécanique contre identité, D-9) | `:257-259` | §2 | implémentation G1 — G2 | fermée par cette insertion |
| C-G2-4 point 5 (tallies à l'arrêt) | `:260-261` | §3 | implémentation G1 — G2 | fermée par cette insertion |
| C-G2-4 point 6 (ripple complet) | `:262-264` | §5, §7 (R-C-5) | implémentation G1 — G2 ; `u4-redraw.mjs:92` absent de la liste du G2 (constat du fold, vérification) | fermée par cette insertion |
| C-G2-4 point 7 (battement « à la période `--heartbeat-every` » + `t=`) | `:265` | §4 | plan — G2 | fermée par cette insertion |
| C-G2-4 point 8 (citation du hors-gel) | `:266-267` | §5 | implémentation G1 — G2 | fermée par cette insertion |
| C-V-3 (i) ligne MAST | `docs/CHECKPOINT2-lot-ukemi-conc-1.md:60` | §9 | plan (DEV-CP1 : exigence CA-5 absente de la mission G1) — proposition du fold | fermée par cette insertion |
| C-V-3 (ii) R-C-1 / R-C-2 requalifiés | `:60` | §5, §7 | = C-G2-1 (plan) | appliqués au pli 1b ; fermée par cette insertion |
| C-V-3 (iii) note R-25 (forme verbatim) | `:60` | §8 | n-a (lot non committé au rendu du G1) | fermée par cette insertion |
| C-V-3 (iv) insertion après l'amendement RETRY-2/3 | `:60` | position de ce texte | n-a | fermée (le script d'insertion vérifie que le dernier titre `## ` de l'ADR est celui de RETRY-2/3) |
| C-V3-1 (i) tuyau « Sortie » : période `--heartbeat-every` + `t=` ISO de `deps.now` | `docs/CHECKPOINT2-lot-ukemi-conc-1-1b.md:63` | §4 | n-a (données du pli, postérieures au texte v2) | fermée par cette insertion |
| C-V3-1 (ii) ligne MAST | `:63` | §9 | = C-V-3 (i) | fermée par cette insertion |
| C-V3-1 (iii) R-C-1 / R-C-2 « appliqués au pli 1b » | `:63` | §5, §7 | = C-G2-1 (plan) | fermée par cette insertion |
| C-V3-1 (iv) compte N + 13 | `:63` | §8 | n-a (le pli ajoute deux tests) | fermée par cette insertion |
| C-V3-1 (v) O-4 résolu NON | `:63` | §7 | n-a (hors périmètre du pli) | item formé |
| C-V3-1 (vi) UKEMI-CONC-EVERY-GUARD-1 | `:63` | §7 | n-a (observation O-P1 du pli) | item formé |
| C-V3-1 (vii) R-25 en forme CI ; `2c276bb...` non probante | `:63` | §8 | n-a (conséquence du back-merge) | fermée par cette insertion |
| C-V3-2 (entrée CHANTIERS : 3 items, `error_origin`, DEV-CP1, pointeurs) | `:64` | hors de ce texte | n-a | acte du G7 |
| C-V3-3 (preuves après la fusion réelle) | `:65` | §8 | n-a | acte du G7 (marqueur du §8) |
| défauts d'outillage de preuve du pli (critère de type du harnais ; `node -e` via l'outil Bash) | `docs/PLI-lot-ukemi-conc-1-1b.md:188-189` | §9 | **implémentation pli (outillage de preuve)** — catégorie ACCEPTÉE par l'orchestrateur | corrigés avant le rendu du pli |
| UKEMI-GUARD-GATE-1 (ex-R-C-6 du v2) | ce texte (fold v2) ; ruling de l'orchestrateur | §5, §7 | n-a (préexistant, hors lot) | item formé |
| PROV-MODEL-1 (déclencheur atteint) | `:1857` de cet ADR ; ruling de l'orchestrateur | §7 | n-a (mission antérieure à l'item) | reporté, nouveau déclencheur |
| garde de blob du temps 2 (RUNBOOK 0.6) | ruling de l'orchestrateur | §5, §7 | n-a | item formé |
| O-5 (déclencheur atteint sans alignement) | `docs/G2-lot-ukemi-conc-1.md:307` ; mesure du fold | §7 | n-a (D-4 du pli) | re-formé (confirmation au G7) |
| compte pré-déclaré 1054/1053/0/1 | `docs/CHECKPOINT2-lot-ukemi-conc-1.md:61` | §8 | n-a (pré-déclaration antérieure au G2) | supersédé par N + 13 (mesuré) |
| F-1 (portail pré-lot, défaut préexistant) | `docs/G1-lot-ukemi-conc-1.md:17-18,34-37` | §3 | plan (G1 ; cohérent, checkpoint-2 CA-8) | corrigée au G1 |
| ORACLE-HANG-1 | `docs/G1-lot-ukemi-conc-1.md:69-78` | §3 | implémentation G1 (G1 ; cohérent, checkpoint-2 CA-8) | corrigée au G1 |
| O-1..O-7, O-P2 | `docs/G2-lot-ukemi-conc-1.md:298-312` ; `docs/PLI-lot-ukemi-conc-1-1b.md:178-180` | §6 (O-2), §7 | voir §7 | voir §7 |

*(ADR-U4b n'est PAS dans le gel du prereg §2 ; les docs sont exclus du décompte R-25 — `ci.yml:65`. Ajout pur : aucune valeur de
référence existante n'est éditée, `:1856` (R-U-5) et `:1857` (PROV-MODEL-1) comprises. Le worker ne committe pas (R-20) ;
l'orchestrateur folde et committe au G7.)*
