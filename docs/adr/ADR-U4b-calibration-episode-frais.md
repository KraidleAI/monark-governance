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
