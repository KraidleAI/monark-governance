# @monark/hikae — moteur HAC-CP (Phase 1)

HIKAE conforme une prédiction en un **verdict de couverture**, puis **gate** une action :
`COMMIT | DEFER | ABSTAIN`. Le produit n'est pas l'ensemble — c'est le **droit d'agir sous
couverture attestée**, et **le droit de n'avoir aucun avis**. Code le nôtre ; l'app Grok est un
input de conception, jamais liftée (ADR-M002 D0 ; GROK-DECORTICATION §9).

## Les trois couches

| Couche | Rôle | Garantie **déclarée honnêtement** |
|---|---|---|
| **L1** `l1-split` | split conformal par classe, `q̂ = ceil((n+1)(1−α))`-ième score ; fail-closed `under_calib` | **type (i)** : marginale, échantillon-fini, **sous échangeabilité à l'intérieur de la classe** ; **pas** de couverture conditionnelle à x ; **jamais `p_correct`**. Sources [lu] : Barber 2020 Thm 2.1 ; jackknife+ note 1 p.4 (correction `(n+1)`). |
| **L2** `l2-monitor` | pas IM-OCP sur labels **arrivés**, budget `B_t` | **MONITEUR — aucune garantie revendiquée** (ADR-M002 D4 branche b). `r_t` n'a aucun consommateur d'ensemble en Phase 1 ; la garantie long-run (ii) de Wang n'est **pas** invoquée. Le retard déterministe + `w/T` = **composition (H4), esquisse**, pas un théorème publié. |
| **L3** `l3-gate` | politique fermée → `GateDecision` | soundness du gate (H2) ; **l'erreur conditionnelle à COMMIT n'est PAS bornée par α** (H2.3) : chiffre de desk **étiqueté**, jamais vendu comme `1−α`. |

## Beachhead `btc-dir-15m`

Score **indicatif** `s(x,ŷ)=0, s(x,autre)=1` (k=1) ⇒ `q̂ ∈ {0,1}` : `q̂=0 ⇒ C={ŷ}`,
`q̂=1 ⇒ C={up,down}`. Sur un binaire, la richesse de la CP ne se manifeste pas — **c'est le
silence calibré, pas un défaut** (GROK-DECORTICATION §2). Label `y = sign(close − open)` de la
bougie `[t, t+15)` ; `close == open ⇒ non_evaluable`. Features = 5 closes terminées **≤ t** (D7,
anti look-ahead). Prédicteurs Phase 1 : `internal:momentum-4c` (baseline déclarée) et
`internal:oracle-didactique` (rend le chemin COMMIT visible — **pas un produit**). Le prédicteur
UsePod/Hermes (clé API, Python) est **Phase 2**.

## Pas de trading (ADR-M002 D0)

HIKAE **gate** `perps_order_preview` / `perps_order_execute` — MONARK **ne les appelle jamais**,
ni réel ni paper. Le trading est un produit **futur, KAIZEN**. Le PnL n'entre pas dans la politique.

## Instrument S2 (`s2/`)

Harnais **jetable** (R-22), fixtures **synthétiques par graine** (`fixtures-synth`) — aucun réseau,
la sonde J0 sur Coinbase (décision (a)) est ultérieure. Les prédicteurs D7 sont **réellement
exécutés** (`generateCandleSeries → extractMomentumFeatures → momentum4c`, label par `labelOf` ;
oracle didactique sur la même série) et entrent dans la chaîne gelée par une `Prediction`
(`serializePrediction`). Rapport + **journal brut par point** générés par `scripts/s2-report.mjs`
(`node packages/hikae/scripts/s2-report.mjs`) :
[`docs/S2-RAPPORT-fixtures-synth.md`](docs/S2-RAPPORT-fixtures-synth.md),
[`docs/S2-journal-fixtures-synth.tsv`](docs/S2-journal-fixtures-synth.tsv) ; le test
`s2_report_reproducible` exige l'égalité **octet à octet** rapport committé ↔ régénéré et le sha256
du journal — chaque chiffre porte sa ligne D10 (n, étiquette, date injectée, hash). **Résultat
négatif = résultat** : avec `internal:momentum-4c` sur marche aléatoire (≈ pièce), `q̂=1`,
abstention 100 % — la démo ne montre pas de position. Les 9 états de mécanisme sont des verdicts à
**scores déclarés** (pas ŷ=y), digest figé. Paramètres v0 (`α=0.10, n_min=50, τ=1, k=1, η=0.05, B_floor=0, w=15 min`) :
**déclarés, non fondés** (Grok = input) ; ils changent par ADR.

## Tests

`npm run ci` (racine) : gate vocab + `tsc --strict` + `node:test`. Les 17 tests nommés d'ADR-M002
D11 (Lot H) plus les gardes S2. Le jeu de mécanisme (3 COMMIT / 2 DEFER / 3 ABSTAIN / 1
`under_calib`) est produit par le vrai `gate()` et son hash figé dans `test/fixtures.manifest.json`
(dérive sans ADR = bug). Contrats gelés consommés via `@monark/contracts` — jamais réimplémentés,
jamais modifiés (`contracts_frozen`).
