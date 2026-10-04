# G7 du lot CM-4a-ii-b (contrat 1.1.0, bloc B2)

- **Plan** : `docs/G0-lot-cm-4a-ii-b.md` (commit `fc3a45b7`) ; G-6 du G0 du bloc ; addendum 8 de l'ADR 0006 §1 et §4 ; ADR 0006 D1, D2, D6 ; A-2 r3 §2.2 points 2 à 6 et §5 ; A-1 points 2 à 4 ; pièce `tail-ts-entree-comptes` et réponses T-1 à T-3 ; G2 de #135 (m-1 à m-3).
- **Base de la PR** : `abe14e6b` (base après #135, fusionnée par `0a4533a8`). **Base du lot** : `29c2e29b`. **Gel** : `45b7ee53`. Commits : `fc3a45b7` (G0), `9b63e817` (tests rouges), `45b7ee53` (code, gel), ce commit (G7). Branche `recherches/cm-4a-ii`, même PR que le lot a ; rien n'est poussé.
- **Statut** : en attente de la G2 et du contrôle par diff de MONARK.

## Ce que le lot change

Tout dans `apps/harness/` ; aucun fichier de `packages/contracts/src/`, de `schemas/` ni de `packages/hikae/src/`.

- `apps/harness/src/policy-wave2.ts` (59 lignes, neuf) : la **seule couture** vers `tail.ts`.
  - `wave2Admission(row, is)` : r = `tailRank` ; refus de `tail_m` > n − r ; deux appels à `adjacencyTailFromCounts` ; chaînes comparées octet pour octet, non réduites, paire nulle à m = 0 ; une `TailCountsError` devient un refus nommé avec son `code`, testée par `instanceof` avant toute autre voie, et aucune erreur ne devient `under_calib` (m-3 de #135) ; rend `{reject, empty}`.
  - `guardCalibChain(rows)` : chaîne `calib_parent` d'A-1 (essais 1..k sans trou, parente = sha256 de l'écriture canonique de la ligne précédente, même case et même table de facteurs, seule la dernière `current`).
  - `W2_TAIL_FRAC`, `W2_CALIB_N_MAX`.
- `apps/harness/src/policy-guard.ts` (+32/−19 net) : `guardKataRow` admet une ligne de bande de la vague 2 cœur :
  - borne de n (8760 à 1h, 2190 à 4h) **avant** toute arithmétique de queue (m-2 de #135) ;
  - `tail_frac` épinglé, blocs `bridge` et `fwd` présents, `runs_*` nuls, `trial_id` `…|W2-CALIB` ;
  - dépense d'A-1 par essai (`n_min`, `k_star`, `miss_bound` au `test_delta` de la ligne), causes `initial` / `outcome`, parente hex64 ;
  - statut et raison de la vague 2 (`dependence check rejects`, `tail sequence constant (fails closed)`) ;
  - vetos pont, TEST-2 et FWD-2, conditionnels, raison du premier dans l'ordre de D1 ;
  - `under_calib` à colonnes de queue nulles.
  `guardKataTable` appelle `guardCalibChain`. Les vagues autres que 1 et 2, les directions en vague 2 et la vague 2b (`fit_sha256`) sont refusées.
- Tests : `apps/harness/test/policy-wave2.test.ts` (11 tests, neuf). Dans `policy-guard.test.ts`, seules les lignes de tueur du lot a sont déplacées avec le code : textes de `:54` et `:66` réécrits, aucun corps de test changé.

**Écarts au G0, déclarés** :
- `guard_modules_are_not_served` n'est pas modifié. Le module neuf a son propre test de graphe servi (`w2_module_is_not_served`), qui garde le red-proof en new-module.
- Pour garder les motifs des tests du lot a, les messages de refus de la vague 1 restent contenus dans les nouveaux : « wave 2 guard », « vetoes.test », « pinned constants ».

## Différences servies

**Aucune.** `policy-wave2.ts` n'est importé que par `policy-guard.ts`, lui-même hors du graphe servi (`guard_modules_are_not_served`) ; `w2_module_is_not_served` le vérifie directement.

## Oracle (Node 24.21.0, variables de proxy retirées, TMPDIR propre, effacé à la fin)

- `node scripts/red-proof.mjs --base 29c2e29b --gel 45b7ee53 --repo /home/user/monark-governance-b2c --draw 11 --seed 37` : **OK**, sortie 0. **11 jugés, tous new-module**, 15 inchangés, **11 tueurs tirés, 11 tués**. `RED-PROOF.json` sha256 `cf0479a1d4112589f7e6160995515561eb272bb91014185ed5802759065d9b15` (dépend des chemins).
- Tueurs (forme fermée, un par test) :
  - dans `tail.ts` : `:136 ROR` du comparateur `<=` → `<` (vecteur `tie-at-level`) ; `:117 SDL` du refus `n-zero` ;
  - dans `policy-guard.ts` : `:47 SDL` (colonnes de vague 2) ; `:46 SDL` (borne de n) ; `:56 CONST` (`spendDelta` à l'essai 1) ; `:82 CONST` (raison de queue vide) ; `:84 CONST` (ordre des vetos) ;
  - dans `policy-wave2.ts` : `:32 ROR` (`tail_m` ≤ n − r) ; `:37 CONST` (chaînes non réduites) ; `:55 CONST` (empreinte de la parente) ;
  - `server.ts:31 CONST` (graphe servi).
  Les 26 tueurs des deux fichiers de garde, appliqués un à un au gel, tuent chacun leur test (contrôle complet, au-delà du tirage).
- **Ancres** : contre `29c2e29b`, 26 tueurs, 26 ancrés, 0 dérivé, 0 perdu ; contre `abe14e6b` (toute la PR), 30, 30, 0, 0.
- `tsc --noEmit` vert ; `eslint .` propre ; `lint:ratchet` 69/69 ; `gate:vocab` OK (345 fichiers) ; `lang:gate` OK.
- `npm test` complet au gel : **2 222 tests, 2 201 verts, 21 sautés, 0 rouge**, test 42 compris, sortie 0.
- **Rejeu sur `wave1.json`** (`811fcd57…`, hors dépôt, épingles du G7 du lot a) : 280 lignes, **32 tables sur 32** admises ; `silence` 276, `region` 2, `vetoed` 2. Inchangé.
- **R-25** (`r25()` de `scripts/oracle/r25.mjs`) :
  - lot b contre `29c2e29b` : STAT **327** (+295/−32) ≤ 547 ;
  - PR entière contre `abe14e6b` : STAT **759** (+759/−0) ≤ 1 205 ;
  - CONTENT_STAT 0.

## Mineures de la G2 de #135

- **m-2** : borne de n tenue (`policy-guard.ts:46`, refus nommé, testé jusqu'à n = 2^52).
- **m-3** : `instanceof TailCountsError` d'abord (`policy-wave2.ts:27`) ; la garde n'a pas de voie `RangeError` → `under_calib`.
- **m-1** : tests `adjacencyUpperTail([])` → `n-zero` et bits tout à zéro à niveau invalide → `level-not-unit-decimal`. **Divergence notée** : le double `kata/w2c/test/tail-double.ts` du dépôt `recherches` rend `empty` dans ces deux cas. L'aligner est un changement du dépôt `recherches`, hors de ce lot.

## Questions

Aucune question de contrat.

Information pour MONARK : je ne trouve dans les pièces lues aucune trace du contrôle C-3 d'A-1 (A-2 en fait une condition d'import de la dépense et de la chaîne). Le lot applique A-1 tel qu'écrit (`e96db6fc…`).

Les lectures déclarées du G0 sont à juger par la G2 :
- `calib_parent` est l'empreinte canonique de la ligne parente ;
- raison d'un rejet de queue ;
- colonnes de queue nulles sur `under_calib` ;
- `current` de la vague 1 épinglé jusqu'à la garde de table de la vague 2 (CM-4c).
