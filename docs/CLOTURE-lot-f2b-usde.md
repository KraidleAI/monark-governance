# Clôture — Lot F2-B : calibration committée USDe (`stable-run-velocity-24h`)

> **Rattachement** : ADR-M008 D4/D7/D7bis + **Amendement 2026-09-17 bis** ; `PLAN-m008-f2b-usde.md` §5/§8/§10.
> **Mode de clôture : COMMITTABLE** (le critère pré-enregistré tient). Roster : worker `claude-opus-4-8`
> effort max ; revue G2 fraîche ≠ générateur ; verdict G7 orchestrateur + acceptation validateur.
> **Aucun push, aucun commit par le worker (R-20).** Ce document est vérifié aux gates vocab (`npm run gate:vocab`,
> scope `narabi_docs`) : aucun chiffre de performance/probabilité — un flux est mesuré sous couverture, jamais scoré.

## 1. Ce qui est committé

- **Classe** `stable-run-velocity-24h`, **committée pour UNE population** (isolation sur le fil, C-10) :
  clé `(task_class, predictor_id)` = `('stable-run-velocity-24h',
  'narabi:persistence-v2@eip155:1/erc20:0x4c9edd5852cd905f086c759e8383e09bff1e68b3')`.
- **Scores** `USDE_STABLE_RUN_CALIB` (613, mesurés, échelle adaptateur 1e12 — A1), digest pinné
  `USDE_STABLE_RUN_CALIB_DIGEST_PINNED = c9793b281167465af88c9e837aaeaf7fb26c709ff4c5e342c68893e759d9e86c`
  (`calibDigest` C5, float64_be trié), **assertion fail-closed à l'import** (motif BTC), provenance mesurée.
- **Reproductible** : `scripts/record-usde-calib.mjs` (série `fixtures/usde-calib-series.json`
  sha `7c33027a…` → `AttestedFlow` → `fromAttestedFlow` → scores → `calibDigest`), auto-contrôle
  `calibDigest([0,1]) == 1e47beee…` + croisement `splitQuantile` (L1).
- **Chiffres pré-enregistrés tenus** : S_floor 1e25 exclut 30 ; θ_stress 0.01 exclut 28 ; 637 calmes,
  403 actives (ρ=0.6327 ≥ 0.30) ; n=613 (≥ 50) ; α=0.10 ; q̂=1.3119e-4/h (support 61) ; q99=3.4009e-4/h
  (support 6) ; région non dégénérée (q̂>0, NDG-1 vérifiée).

## 2. C-13 — distinction EXPLICITE des trois issues

Sur le fil, l'enum gelé rend `under_calib` pour les deux négatifs ; le **texte** dit lequel. Ce lot est le
mode **positif**, distingué des deux négatifs :

- **(a) support/dégénérescence insuffisants** (`ρ<0.30`, `n<50`, `q̂=0` largeur nulle) ⇒ `under_calib`.
  **NON** : ρ=0.6327, n=613, q̂>0. (C'était l'issue de F2-A msUSD — un seul jour calme à rachat, q̂=0.)
- **(b) calibration valide MAIS rétrospective négative** (le run ≤ q99) ⇒ `under_calib`, méthode non invalidée.
  **NON** : la rétrospective est positive sous le jeu pré-enregistré (§4). Condition **encodée** dans le
  recorder depuis C-14 (checkpoint-2) : `retroPositive` (≥ 1 fenêtre de run nommée > q99) ⇒ `committable` ;
  la branche (b) est atteignable (self-check « toutes fausses » ⇒ (b)).
- **(c) COMMITTABLE** ⇒ région committée pour la clé USDe. **OUI** — la présente clôture.

## 3. Rétrospective — OBSERVATION DE TÉMOIN (factuelle, dates nues)

Le run primaire hors-échantillon 2025-10-10 → 2025-10-15 (pic du 11 oct.) n'entre PAS dans la calibration
(calme uniquement). Les vélocités de rachat mesurées onchain **[lu]** (burns `Transfer→0x0`, adaptateur 1e12)
sont comparées au q99 calme committé — une comparaison **factuelle**, jamais une affirmation sur ce que le
gate émettrait en direct (le champ neutre du recorder est `run_windows_above_q99`, à dates nues) :

| Date (UTC) | v (/h) [lu] | > q99 committé (3.4009e-4) | > q99 sensibilité (1.2211e-3) |
|---|---|---|---|
| 2025-10-10 | 1.1042e-3 | **oui** | non |
| 2025-10-11 | 4.6498e-3 | **oui** | **oui** |
| 2025-10-12 | 4.0210e-4 | **oui** | non |
| 2025-10-13 | 1.7060e-6 | non | non |
| 2025-10-14 | 3.2482e-4 | non | non |
| 2025-10-15 | 9.0835e-5 | non | non |

Le contexte de marché (dépeg USDe autour du 10–11 oct. 2025 sur le carnet Binance) est **[2nd]** (mid Binance
non recalculé en primaire ici) ; seuls les **burns onchain sont [lu]**. Le pic du 11 oct. (≈11,16% du supply)
était nommé AVANT le pull : sa franchise du q99 est la reproduction d'une issue connue, PAS un test.

## 4. CAVEAT (obligatoire, noir sur blanc — jamais minimisé)

**La franchise du q99 par le 2025-10-10 dépend du jeu de seuils, et ce jeu est un choix de modélisation
pré-enregistré, pas un théorème :**

- **Sous le jeu PRÉ-ENREGISTRÉ** (fenêtres de stress `burns/S_open ≥ 1%/j` **exclues**), q99 = **3.4009e-4/h**,
  et le **2025-10-10** (v=1.1042e-3) **DÉPASSE** q99.
- **Sous la SENSIBILITÉ sans exclusion** (q99 = **1.2211e-3/h**, diagnostic jamais committé), le **2025-10-10
  NE DÉPASSE PAS** q99 (1.1042e-3 < 1.2211e-3).
- Le **2025-10-11** (v=4.6498e-3) **dépasse sous les DEUX** jeux.
- Le **2025-10-12** (v=4.0210e-4) dépasse lui aussi **UNIQUEMENT sous exclusion** (4.0210e-4 < 1.2211e-3),
  exactement comme le 10 oct. (C-17 checkpoint-2).

Autrement dit : la « franchise » du **10 oct. ET du 12 oct.** est **entièrement portée par la décision
d'exclusion de stress**. **Seul le 11 oct. est robuste** aux deux jeux. Cette dépendance est déclarée ici et ne
doit pas être présentée comme une propriété robuste de la méthode. Depuis C-14 (checkpoint-2), la condition
rétrospective est **encodée** dans le recorder (`retroPositive` ⇒ `committable`) : « ≥ 1 fenêtre de run nommée
> q99 » — tenue ici par les 10, 11 et 12 oct. sous le jeu pré-enregistré.

## 5. Résidus nommés (dettes de connaissance, portées — jamais un « dû » nu)

- **R-1 — attribution ≠ prévention.** Le lien clé ↔ identité on-chain (`chain`+`subject` copiés dans le
  `predictor_id`) est une **revendication de l'appelant**, recalculable (recompute `eth_getLogs`) mais **non
  vérifiée en outil** (K-8). Le gate atteste une couverture de population, pas la véracité de l'étiquette.
- **R-2 — portée du hash.** `features_digest` = `utterance.hash` lie le **payload** (convention A3 : inclure
  `{address, fromBlock, toBlock, topics}` dans le payload canonique), pas l'enveloppe complète ; sinon
  l'attribution passe par l'`AttestedFlow` entier. Le recorder F2-B a construit le payload A3 (voir
  `record-usde-calib.mjs`), sans quoi ce résidu serait un défaut.
- **R-3 — famille = métadonnée.** `wrapping_family = synthetic-dollar-whitelisted-redeem` DOCUMENTE le
  support ; seule la **clé exacte** (chaîne, token, formule-version) est committée. Ajouter un membre =
  sa propre série + pooling **testé** (échantillonnage pré-enregistré) + nouveau digest par ADR — jamais un
  routage par étiquette de famille.
- **R-4 — échangeabilité intra-fenêtre + dérive temporelle.** Les paires chevauchantes partagent `v_t`
  (dépendance sérielle non modélisée) ; le flux est non stationnaire. La **clé n'y change rien** : la
  couverture reste marginale sous échangeabilité déclarée. Défenses : `B_t`/D8 (dégradation run-aware
  existante) et, plus tard, M009 (ACI, primitive à état caller-carried) sous ses conditions de livrabilité.

**Procurement dû (non cité ici)** : Barber, Candès, Ramdas, Tibshirani 2023 « beyond exchangeability » — corps
**[abs]** (abstract seul lu) ⇒ **demande de procurement formée** si son corps est cité pour un candidat
« dérive calme » ; NON cité dans ce lot (aucun chiffre de seconde main introduit).

## 6. Gates & oracle

- G2 fraîche ≠ générateur : **PASS-AVEC-RÉSERVES** (0 bloquant, 4 réserves de texte appliquées —
  `docs/G2-lot-f2b-usde.md`) ; G7 orchestrateur **ACCEPTÉ** ; checkpoint-2 validateur
  **ACCEPTE-AVEC-CORRECTIONS** C-14..C-20 (appliquées avant commit ; C-14 = condition rétrospective non
  encodée dans `committable`, attrapée par le validateur, manquée par G2).
- Oracle (sorties brutes dans le rapport de passe) : `npm run ci`, `node scripts/lint-ratchet.mjs` (≤ 69,
  jamais relevé), `npx tsc` (0), `npm run lang:gate` (0), `npm run export:check` (0), `npm run gate:vocab` (0).
- **Zéro dette** : les points ci-dessus sont soit résolus, soit des résidus nommés/portés (R-1..R-4) ou une
  demande de procurement formée (Barber et al. 2023, non cité). Aucun contournement.
