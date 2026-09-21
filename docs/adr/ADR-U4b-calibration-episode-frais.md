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
| région servie | `calibration.ts` K entrées classe A + `strateOf` serveur | outil MCP `gate` → `GateDecision` | `built` **ssi** test servi vert (-2) | `u4b_gate_serves_region_from_real_artifact` |
| cascade retrait | 8 fichiers gatés + `fleet.ts` (site, décision 101) | classe synthétique disparue | -2 | `no_cascade_class_in_harness` |

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
