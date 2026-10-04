# G0 du lot CM-4a-ii-b (contrat 1.1.0, bloc B2) : garde des lignes kata de la vague 2, queues depuis les comptes, chaîne A-1

- **Sources** (lues pour ce G0 ; empreintes comme au G0 du bloc, `docs/G0-lot-cm-4a-ii.md`) :
  - addendum 8 de l'ADR 0006 (`4d03a7e2…b517b`, P0 `ec202d00`) : §1 (ce que la garde recalcule et refuse), §4 (tueur W2-E ajouté) ;
  - ADR 0006 v8.1 (`fe48c03a…b4be6`) : D1 (vague 2 cœur : 40 cases de bande, essai 2, `test_delta` 0.025, cause `outcome` ; ordre du statut : admission CALIB-2, pont, TEST-2, FWD-2 ; format de `trial_id` `…|W2-CALIB` ; directions hors vague 2), D2 (loi exacte de A, cas limites, « tail sequence constant (fails closed) », check 1 vide non refusé, entrée à n ≥ n0 seulement), D6 (bloc CALIB-2 : n 8760 / 2190 ; veto du pont à k ≥ 104 / ≥ 31 ; TEST-2 à k ≥ 56 / ≥ 18 ; FWD-2 « same rule and numbers ») ;
  - A-2 r3 (`d883725a…7d12`) : §2.2 points 2 à 6 ; §5, tueur « a wave 2 region row with a tail at or below `runs_level`, or an empty tail, is admitted » ;
  - A-1 (`e96db6fc…e352`) : points 2 à 4 (dépense, `calib_cause`, chaîne `calib_parent`) et ses tueurs ;
  - décision déléguée et table finale de l'avis `AVIS-advisor-PolicyRow-Q1-Q3.md` (colonnes `bridge`, `fwd`, `vetoes`, `tail_*`, `miss_adj_*`, `runs_*` « KC vague 1 ; D vague 2 », `calib_parent` « hex64 de la ligne parente », `status_reason` étendu `vetoed: <test|bridge|fwd>`, « le premier veto déclenché, dans l'ordre du statut de la vague ») ;
  - spécification 1.1.0 brouillon §10 (lignes triées par (`task_class`, `cell_key`, `calib_attempt`), ligne remplacée `current` faux, `policy_row_sha256` = empreinte de l'écriture canonique de la ligne) ;
  - pièce `recherches:coordination/pieces/2026-10-04-tail-ts-entree-comptes/SPEC-tail-ts.md` et `vectors.json` ; réponses de MONARK : T-1 (`tailRank` exporté), T-2 (`TailCountsError extends RangeError`, `code` fermé), T-3 (m = 0 : paire nulle sur la ligne) ;
  - `packages/hikae/src/tail.ts` sur la base (#135, fusionnée à `abe14e6b`) ; G2 de #135 (APPROUVE, mineures m-1 à m-3, reprises ici).
- **Base de la PR** : `abe14e6b` (`origin/base/chantier-moteur-2026-10-03` après #135). **Base du lot** : `29c2e29b` (tête du lot a, G7 du pli compris). Branche `recherches/cm-4a-ii`, même PR que le lot a.
- **Bornes** : R-25 du lot ≤ 547, mesuré contre `29c2e29b` ; R-25 de la PR ≤ 1 205, mesuré contre `abe14e6b` (règle d'équipe : 547 par lot ; décision du coordinateur du 2026-10-04).
- **Statut** : G0 écrit avant tout code. **Aucun choix de contrat ouvert** : chaque point ci-dessous est lu dans un texte cité ; les lectures sont déclarées.

## Périmètre (G-6 du G0 du bloc)

Tout dans `apps/harness/` ; aucun fichier de `packages/contracts/src/`, de `schemas/` ni de `packages/hikae/src/` (`tail.ts` est à MONARK) ; aucun module servi ne change.

1. **Une seule couture vers `tail.ts`** : `apps/harness/src/policy-wave2.ts`, `wave2Admission(row, is)`. Seul module de la garde à importer `tailRank`, `adjacencyTailFromCounts` et `TailCountsError`.
2. **Admission d'une ligne de vague 2 dans `guardKataRow`** (G-2 étendue, mêmes refus nommés) :
   - `source.wave` ∈ {1, 2} ; vague 2 : ligne de bande (`scaled-band`) seulement (D1 : les directions ne sont pas en vague 2), `fit_sha256` nul (la vague 2b attend sa pré-inscription P0-2 : refusée) ; toute autre vague est refusée (fail-closed) ;
   - **borne de n avant toute arithmétique de queue** (G2 de #135, m-2) : n ≤ 8760 à 1h, ≤ 2190 à 4h (points du bloc CALIB-2, D6), refus nommé ;
   - `tail_frac` épinglé : `0.95` à 1h, `0.90` à 4h ; `runs_level` `0.05` ; `bridge` et `fwd` non nuls ;
   - `runs_miss` et `runs_aux` nuls (table finale : « KC vague 1 ; D vague 2 », et aucune direction en vague 2) ;
   - `trial_id` `<task_class>|<kata_id>|<venue>|<symbol>|<horizon>|W2-CALIB` (D1 (p)) ;
   - chaîne A-1 au niveau de la ligne : vague 1 ⇒ essai 1 ; vague 2 ⇒ essai ≥ 2 ; essai 1 ⇔ `initial` et `none` ; essai ≥ 2 ⇒ cause `outcome` et `calib_parent` hex64 ; `test_delta` = `spendDelta("0.05", essai)` (A-1 point 2 : h = nombre d'essais non exemptés parmi 2..j = essai − 1, puisque toute exemption est refusée faute de journal, Q-3) ; un essai non exempté non divisé (`0.05` à l'essai 2) est refusé ;
   - `n_min`, `k_star`, `miss_bound` au `test_delta` de la ligne (0.025 : n0 368, k\* 69 à n 8760, 12 à n 2190, recalculés) ; le niveau des vetos reste 0.05 ;
   - `under_calib` (n < n0) : D2 ne tourne pas (« rows reach D2 only with n ≥ n0 ») ; `tail_m`, `tail_a`, `miss_adj_a` et les quatre chaînes de queue sont nuls, `vetoes.bridge` et `vetoes.fwd` faux ;
   - ligne calibrée : `wave2Admission` (point 3), puis statut et raison (point 4).
3. **`wave2Admission`** (addendum 8 §1) : r = `tailRank(n, tail_frac)` ; refus de `tail_m` > n − r ; `adjacencyTailFromCounts(n, tail_m, tail_a, runs_level)` et `adjacencyTailFromCounts(n, misses, miss_adj_a, runs_level)` ; les chaînes de la ligne doivent être **octet pour octet** les `num` et `den` non réduits (une queue réduite par le PGCD est refusée, tueur B2 de la décision) ; à m = 0, paire nulle (T-3) ; A hors support : la `TailCountsError` de `tail.ts` devient un refus nommé de la ligne, avec son `code`. **G2 de #135, m-3** : la garde teste `instanceof TailCountsError` d'abord ; elle n'a aucune correspondance `RangeError` → `under_calib` (l'`under_calib` vient de n < n0 seul) ; toute autre erreur remonte telle quelle. Rend `{reject, empty}` : `reject` si la queue de tau ou celle du check 1 est ≤ `runs_level`, `empty` si `tail_m` = 0 (un check 1 vide n'est pas un refus, D2).
4. **Statut et raison de la vague 2**, dans l'ordre de FORMAT : `under_calib` ; un rejet (queue de tau ou check 1) → `silence`, `dependence check rejects` ; queue de tau vide → `silence`, `tail sequence constant (fails closed)` (D2) ; `misses` > k\* → `silence`, `misses <m> above k* <k>` ; sinon `region`. Ainsi une ligne `region` à queue vide ou ≤ `runs_level` est refusée (tueur d'A-2 §5, addendum 8 §1).
5. **Vetos pont, TEST-2, FWD-2** (A-2 point 5, D6) : chacun sur un statut CALIB `region` seulement, avec `n` ≥ 1 et `k` non nul, par la même règle que TEST (`vetoFires` : P(Bin(n, alpha) ≥ k) ≤ 0.05, au n réalisé du bloc) ; sinon faux. Mesuré : la règle redonne les seuils imprimés de D6 (pont 104 / 31, TEST-2 56 / 18, au bord exact). `u_test` et k ≤ n recalculés sur les trois blocs. Statut `vetoed` si l'un tire ; raison `vetoed: <bloc>` du premier qui tire dans l'ordre de D1 : `bridge`, `test`, `fwd`.
6. **Chaîne `calib_parent` d'une table** (A-1 point 4) : `guardCalibChain(rows)`, appelée par `guardKataTable` et utilisable seule. Par case : essais 1..k sans trou ; `calib_parent` de l'essai j ≥ 2 = sha256 de l'écriture canonique de la ligne j − 1 (même empreinte que `policy_row_sha256`) ; mêmes `kata_id`, `w`, `venue`, `symbol`, `horizon`, `side`, `bucket`, `thresholds`, `scale_table` que la parente (D1 : « keep their kata ids and their factor tables byte for byte ») ; seule la dernière ligne est `current` (spécification §10).
7. **Tests W2-E de `tail.ts`** (exception de zone : tests et tueurs à RECHERCHES) : les 10 vecteurs de la pièce (les deux vecteurs de D2 par sha256 de leurs chaînes) ; `tailRank` sur les trois exemples de D2 ; **G2 de #135, m-1** : `adjacencyUpperTail([])` lève `n-zero`, des bits tout à zéro avec un niveau invalide lèvent `level-not-unit-decimal`. Le double `kata/w2c/test/tail-double.ts` du dépôt `recherches` rend `empty` dans ces deux cas : divergence notée au G7, alignement hors de ce lot.

## Lectures déclarées (aucun choix de contrat)

- **`calib_parent`** = sha256 de l'écriture canonique de la ligne parente : la table finale dit « hex64 de la ligne parente » et la seule empreinte de ligne du contrat est celle de l'écriture canonique (`policy_row_sha256`, spécification §10).
- **Raison d'un rejet de queue** : `dependence check rejects` (FORMAT : « check 1 or check 2 rejects » ; la queue de tau remplace le check 2, D2). Ordre rejet avant vide : celui de FORMAT (« the checks », puis la séquence constante).
- **`current` sur une ligne de vague 1** : G-2 garde l'épinglage du pli m-1 (`current` vrai). Une table qui porterait une ligne de vague 1 remplacée (`current` faux) demande aussi une autre projection que celle de B1, qui écrit `current: true` : c'est la garde de table de la vague 2 (projection de `wave2.json`, format pas encore écrit), à CM-4c. `guardCalibChain` tient déjà la règle « seule la dernière est `current` » pour toute table.
- **A-1 au stade brouillon** : A-2 note que la dépense et la chaîne d'A-1 ne s'importent qu'après le contrôle C-3 de MONARK ; je n'en trouve pas de trace dans les pièces lues. Le lot applique A-1 tel qu'écrit (`e96db6fc…`) ; un A-1 corrigé changerait ce point. Signalé à MONARK, non bloquant pour le code.

## Tests prévus et tueurs en forme fermée

Fichier neuf `apps/harness/test/policy-wave2.test.ts` (importe le module neuf : new-module au red-proof). Lignes de vague 2 bâties sur une ligne de bande `region` du registre synthétique de graine 37 de B1 (essai 2, `outcome`, parente = la ligne de vague 1). Un tueur par test, adresses fixées au gel :

| Test | Contenu | Tueur |
|---|---|---|
| `w2e_tail_vectors` | 10 vecteurs de la pièce, refus par `code` | `tail.ts`, `ROR` du comparateur `<=` → `<` (vecteur `tie-at-level`) |
| `w2e_tail_edges_of_the_counts_entry` | m-1 de #135 ; `tailRank` (8322, 1971, 7884) | `tail.ts`, `SDL` du refus `n-zero` |
| `w2_guard_admits_a_wave2_row` | ligne de vague 2 admise ; chaîne admise | `SDL` d'une clause d'admission |
| `w2_guard_refuses_a_reduced_tail` | queue de tau et queue du check 1 réduites par le PGCD refusées ; `"0"`/`"1"` à m = 0 refusés (T-3) | `CONST` de la comparaison des chaînes |
| `w2_guard_refuses_region_with_empty_or_low_tail` | `region` à queue vide ou à queue ≤ `runs_level` (tau ou check 1) refusée ; la même en `silence` avec sa raison admise | `CONST` de la raison de séquence vide |
| `w2_guard_tail_m_and_support` | `tail_m` > n − r refusé ; A hors support refusé par code (`a-outside-support`), jamais `under_calib` (m-3 de #135) | `ROR` de `tail_m` ≤ n − r |
| `w2_guard_bounds_n_before_the_tails` | n au-delà du bloc CALIB-2 refusé par son nom (m-2 de #135) | `SDL` de la borne |
| `w2_guard_bridge_and_fwd_vetoes` | pont, FWD-2 ; raison du premier veto dans l'ordre de D1 ; veto sur une ligne non `region` refusé | `CONST` de l'ordre des vetos |
| `w2_guard_spend_and_causes` | essai 2 non divisé refusé ; `initial` ou `epoch:` à l'essai 2 refusés ; vague 1 à l'essai 2 refusée ; 5ᵉ essai refusé | `CONST` de `spendDelta` |
| `w2_guard_calib_parent_chain` | parente rompue, trou d'essai, deux lignes courantes, table de facteurs changée refusés | `CONST` de l'empreinte de la parente |

Tueurs d'A-1 couverts : chaîne rompue ; essai non exempté non divisé ; exemption hors journal (cause `epoch:` refusée) ; 5ᵉ essai (contrôle fermé du bloc A). « Exempt attempt halved » : aucune exemption n'est admissible tant que le journal n'est pas épinglé (Q-3), sans objet. Tueur d'addendum 8 §4 et tueurs W2-E de la décision : couverts.

## Différences servies

**Aucune.** `policy-wave2.ts` n'est importé que par `policy-guard.ts` ; `guard_modules_are_not_served` du lot a s'étend au module neuf.

## Oracle

Comme au lot a : `tsc --noEmit`, `eslint .`, `lint:ratchet`, `gate:vocab`, `lang:gate`, `npm test` complet (test 42 relancé seul s'il est seul rouge), `node scripts/red-proof.mjs --base 29c2e29b --gel <gel> --repo /home/user/monark-governance-b2c --draw <n> --seed 37`, ancres `verifie-ancres.mjs . --touched 29c2e29b HEAD`.

## R-25 (estimation)

Code ~110 (couture ~45, extension de G-2 ~45, chaîne ~20) ; tests ~200 ; total **~310** contre `29c2e29b` (≤ 547). PR : 496 + ~310 ≈ **~806** contre `abe14e6b` (≤ 1 205).

## Questions

Aucune question de contrat. Information pour MONARK : trace du contrôle C-3 d'A-1 (voir « Lectures déclarées »).
