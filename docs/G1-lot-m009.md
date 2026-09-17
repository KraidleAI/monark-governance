# G1 — Génération tracée, Lot M009 (primitive quantile tracker, ADR-M009)

- **Rattachement** : `docs/adr/ADR-M009-aci-tracker.md` (G0) + `docs/PLAN-m009-aci-tracker.md` (pré-inscription).
- **Générateur** : worker implémenteur **`claude-opus-4-8[1m]`** (R-1 vérifié, première ligne du rapport), dispatché par
  l'orchestrateur `claude-fable-5-1`, 2026-09-17. Une première instance était tombée sur une limite d'usage **avant
  d'écrire** (arbre vérifié sans code) ; relance avec les deux faits qu'elle demandait (LF via `.gitattributes`, noms de
  scripts). Aucun commit par le worker (R-20), aucune action sortante ; `l2-monitor.ts` **non touché** (le worker a suivi
  la contrainte de mission « 3 fichiers », plus stricte que le « au plus un commentaire » du PLAN §1).
- **Chaîne de lecture** : 4 lecteurs `claude-sonnet-5` [lu] 2026-09-17 (ABB 2024 ; DtACI ; Barber 2023 ; AgACI) —
  rapports consignés en mémoire memstack (uids `5db6ad7b0594…`, `d05dd94c1e9d…`) ; les fichiers `tasks/*.output`
  correspondants sont **vides (0 octet)** — artefact du harness après consommation, consigné. **Advisor-defi 2026-09-17**
  (`Bash` vérification seule) a **relu** lui-même les textes pré-extraits et recomputé la calibration USDe (613 paires,
  écart trié max 4.11e-8 = troncature déclarée `fixtures/PROVENANCE-usde.md`).
- **Checkpoint-1** : validateur `claude-fable-5-1` **ACCEPTE-AVEC-CORRECTIONS C-1..C-10** (2026-09-17), foldées
  dans ADR + PLAN avant le dispatch (η non finie rejetée ; test 3 asserte la sortie de `[0,B]` ; mutants M1..M5 fermés ;
  `t₀ = 7` test-only ; suites de scores ; encodage du digest ; `export:check` par construction ; MAST §5bis ; items (a)-(e)
  avec déclencheur/action ; précisions ADR).

## Rejeux advisor-defi (illustration MÉCANIQUE sur la timeline exacte — jamais une preuve ; exclu R-25)
Calme = 613 pas in-sample (q₁ dérivé des mêmes scores) ; run = 6 jours hors échantillon (10-10 → 10-15, s_t = |v_t − v_{t−1}|).

| Variante | Calme (613 pas) | Run (6 jours) |
|---|---|---|
| (C) décroissant c=q̂, t₀=0 | 5 régions vides (t=62…103, période ≈ 1/α, cycle limite sur poussière) | inerte : q 1.3e-4→1.4e-4 ; alertes lo>q99 des clôtures 10-10 et 10-11 préservées ; 6 ratés |
| (C) décroissant c=B, t₀=0 | 49 régions vides ; q ∈ [−4.04e-3, 2.07e-2] (Lemme 1 [−4.17e-3, 7.92e-2] tenu) | q 5.9e-4→3.0e-3 ; **alerte clôture 10-10 perdue** ; ~30 j de région 20× calme après le run |
| (C) t₀=613, c=q̂ | 0 vide, q ∈ [1.02e-4, 1.56e-4] | totalement inerte |
| (C) pas fixe c=B | 55 vides | q ≈ 2.9e-2 (0.7 B) : run « couvert », aucune alerte (Prop 1 ABB en acte) |
| (A) γ=0.005 | 0 bord (α_t ∈ [0.044, 0.156]) | inerte ; alertes préservées |
| (A) γ=0.05 | 16 jours à +∞ en calme | déployé le jour du run : +∞ dès 10-13, 7 j à récupérer |
| Identité télescopique | erreur ≤ 4e-18 (non clampé) | — |

Jours de run (hors échantillon) : 10-10 1.10e-3 (8× q̂) ; 10-11 3.55e-3 (27×) ; 10-12 4.25e-3 (32×) ; 10-13..15 4.0e-4,
3.2e-4, 2.3e-4 ; v(10-11)×24 = 0.1116 recoupe le 11.16 % du scouting. Taux de raté statique en calme : 0.0979.

**Bornes (1 pas/jour)** — ABB Thm 1, c = κB, (1+κ)/(κ·T^(1/2−ε)), κ=1 : ε=0.1 → 90 j 33 %, 365 j 18.9 %, 1095 j 12.2 %,
3650 j 7.5 %, 8760 pas 5.3 %, 26280 pas 3.4 % ; ε=0.01 → 365 j 11.1 %, 3650 j 3.6 %. c = q̂ ⇒ borne vide (3008 % à 365 j).
G&C Prop 4.1 : γ=0.005 → 365 j 49.6 %, 3650 j 5.0 % ; γ=0.05 → 365 j 5.2 % (16 j triviaux en calme).
T pour ≤ 5 % : ABB κ=1 1860 pas (ε=0.01), 10 120 pas (ε=0.1) ; G&C 3620 (γ=0.005), 380 (γ=0.05).

**Données** : 129/613 = 21 % de résidus nuls, 39 poussières < 1e-8, 458 valeurs distinctes, plage de zéros 48 j (fin
2024-02-01). ACF s_t : lag1 0.418, lag2 0.265, lag3 0.192, lag7 0.216 ; benchmark v mélangé i.i.d. : lag1 0.348, lag2 −0.01.

## Livrables (empreinte : 3 fichiers code, +4 sur `index.ts`, 161 + 238 lignes)
- `packages/hikae/src/tracker.ts` — sha256 **`37db3331c653b5cb13c573303528ef57de2236bf25a901caac5bf57b07f68e3c`** (LF, UTF-8
  sans BOM ; en-tête « TRACKER, NO GUARANTEE CLAIMED (ADR-M009 ; D8 (i)-(iii) unmet) » ; 8 exports exacts ; `imocpStep`
  réutilisé ; aucun clamp de `q` ; `clipScore` séparé, jamais appelé dans la récursion ; aucune constante par défaut).
- `packages/hikae/test/tracker.test.ts` — sha256 **`f5bb3554eb58e639ce93f810cd28d73d7fc470e943dff2ef508e827ccdf5cd3c`** ;
  10 tests nommés verbatim (PLAN §3). Vecteurs épinglés **moteur Node** : `q_{T+1}` float64_be = `3fa29520dacf6cca`
  (t₀ = 7 test-only, 200 scores seedés) ; digest = `06e2a024f78b1b13e2c907bbd232d03f491ce25e815ceadb80c7e28910f9ea89`.
- `packages/hikae/src/index.ts` — bloc d'export « Quantile tracker (ADR-M009) — no consumer, no guarantee claimed ».
- **Choix déclaré du worker** : `trackerDigest` normalise `-0 → 0` (miroir de `calibDigest`) — précision à porter dans
  ADR §6 (un rejoueur cross-langage doit faire de même). À juger en G2.

## Mutants (appliqués un à un sur l'arbre pristine, rejoués sur le seul fichier de test, revertés ; sha `37db3331…`
## restauré après chaque revert — arbre final identique)
- **M1 clamp `q`∈[0,B]** — fail 3/10 : `tracker_telescoping_identity` « trajectory must leave [0,B] (min=0.0208, max=0.0417) » ;
  `tracker_thm1_worst_case` « |mean(E)-alpha| = |0.5 - 0.1| = 0.4 <= bound 0.1262 » ; `tracker_q_pinned` (got `3fa27ec7b99a2ff6`).
  **Finding fort** : le clamp casse la garantie Thm 1 elle-même sur l'oracle, pas seulement le digest.
- **M2 signe inversé** — fail 6/10 : direction, Lemme 1 (t=2), télescopique (|0.738 − (−0.738)|), Thm 1 (|1 − 0.1|), pinned
  (`bfe14561f1fa4f52`), fixed_vs_decaying.
- **M3 pas fixe (η=c)** — fail 4/10 : pinned (`3fb0000000000009`), fail_closed (« Missing expected exception: eta non-finite »),
  no_peek, fixed_vs_decaying (fixed=1266 > decaying=1266 faux).
- **M4 t₀ compté deux fois** — fail 1/10 : pinned (`3fa20d1740760ce5`) — confirme C-4 (seul `t₀ ≠ 0` le distingue).
- **M5 `>=`** — fail 2/10 : `tracker_E_from_fact` (« s == q => E=0, got E=1 »), no_peek.
- Aucun survivant ⇒ aucun renforcement de test nécessaire.

## Oracle (rapport worker ; **à rejouer** par G2, checkpoint-2 et G7 — R-21)
`npm run ci` : baseline 222 → **232 pass / 0 fail** ; `gate:vocab` OK (116 fichiers) ; `lint:ratchet` **69/69** ; `lang:gate`
OK hikae 0 ; `export:check` OK hikae 0 ; `npm run lint` clean. `git status` : 3 fichiers code + 6 docs de gouvernance,
rien d'autre (AC-3) ; `grep -iE 'adapti[fv]'` = 0 dans les ajouts (AC-5). Orchestrateur (2026-09-17) : shas recomputés
identiques, `node --test` 10/10 rejoué, grep 0.
- Note outillage (worker) : `grep -c $'\r'` donne un faux positif sous ce shell ; méthode fiable `tr -cd '\r' < f | wc -c` = 0.
