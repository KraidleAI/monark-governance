# G7 du lot CM-4a-ii-b (contrat 1.1.0, bloc B2)

- **Plan** : `docs/G0-lot-cm-4a-ii-b.md` (commit `fc3a45b7`) ; G-6 du G0 du bloc ; addendum 8 de l'ADR 0006 §1 et §4 ; ADR 0006 D1, D2, D6 ; A-2 r3 §2.2 points 2 à 6 et §5 ; A-1 points 2 à 4 ; pièce `tail-ts-entree-comptes` et réponses T-1 à T-3 ; G2 de #135 (m-1 à m-3).
- **Base de la PR** : `abe14e6b` (base après #135, fusionnée par `0a4533a8`). **Base du lot** : `29c2e29b`. **Gel** : `45b7ee53`. Commits : `fc3a45b7` (G0), `9b63e817` (tests rouges), `45b7ee53` (code, gel), ce commit (G7). Branche `recherches/cm-4a-ii`, même PR que le lot a ; rien n'est poussé.
- **Statut** : G2 (`coordination/pieces/2026-10-04-G2-recherches/G2-cm-4a-ii-lot-b.md`, APPROUVE SOUS RÉSERVE) pliée, voir « G2 » ; en attente du contrôle par diff de MONARK.

## Ce que le lot change

Tout dans `apps/harness/` ; aucun fichier de `packages/contracts/src/`, de `schemas/` ni de `packages/hikae/src/`.

- `apps/harness/src/policy-wave2.ts` (59 lignes, neuf) : la **seule couture** vers `tail.ts`.
  - `wave2Admission(row, is)` : r = `tailRank` ; refus de `tail_m` > n − r ; deux appels à `adjacencyTailFromCounts` ; chaînes comparées octet pour octet, non réduites, paire nulle à m = 0 ; une `TailCountsError` devient un refus nommé avec son `code`, testée par `instanceof` avant toute autre voie, et aucune erreur ne devient `under_calib` (m-3 de #135) ; rend `{reject, empty}`.
  - `guardCalibChain(rows)` : chaîne `calib_parent` d'A-1 (essais 1..k sans trou, parente = sha256 de l'écriture canonique de la ligne précédente, même case et même table de facteurs, seule la dernière `current`).
  - `W2_TAIL_FRAC`, `W2_CALIB_N_MAX`.
- `apps/harness/src/policy-guard.ts` (+32/−19 net) : `guardKataRow` admet une ligne de bande de la vague 2 cœur :
  - borne de n (8760 à 1h, 2190 à 4h) **avant** toute arithmétique de queue (m-2 de #135) ;
  - `tail_frac` épinglé, blocs `bridge` et `fwd` présents, `runs_*` nuls, `trial_id` `…|W2-CALIB` ;
  - dépense d'A-1 par essai (`n_min`, `k_star`, `miss_bound` au `test_delta` de la ligne), essai 1 en vague 1, **essai 2 (D1)** en vague 2 (corrigé au pli de la G2, B-1), causes `initial` / `outcome`, parente hex64 ;
  - statut et raison de la vague 2 (`dependence check rejects`, `tail sequence constant (fails closed)`) ;
  - vetos pont, TEST-2 et FWD-2, conditionnels, raison du premier dans l'ordre de D1 ;
  - `under_calib` à colonnes de queue nulles.
  `guardKataTable` appelle `guardCalibChain`. Les vagues autres que 1 et 2, les directions en vague 2 et la vague 2b (`fit_sha256`) sont refusées.

**Portée réelle** (pli de la G2, m-4) : une ligne de vague 2 n'est atteignable aujourd'hui **que par un appel direct** à `guardKataRow` ou à `guardCalibChain`. `guardKataTable` refuse toute table qui en porte une : la projection du registre de vague 1 (bloc B1) ne la redonne pas, et `current` de la vague 1 est épinglé à vrai alors que la chaîne exige la parente à faux. Un test de table mixte est prévu à CM-4c, avec la garde de table de la vague 2.
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

## G2

- **Pièce** : `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-cm-4a-ii-lot-b.md`, verdict **APPROUVE SOUS RÉSERVE** (B-1 bloquant, R-1 réserve, m-1 à m-4). Commits du pli : `6d91e4c7` (tests rouges), `7315a8a4` (code, **nouveau gel**), ce commit (G0 corrigé et G7). Base inchangée : `origin/base/chantier-moteur-2026-10-03` = `abe14e6b`, aucune fusion nécessaire.
- **B-1** (`policy-guard.ts:57`) : `at === (w2 ? 2 : 1)`, message « attempt 1 on wave 1, 2 on wave 2 (ADR 0006 D1) ». La chaîne refuse aussi une ligne de vague 2 hors essai 2 (`policy-wave2.ts:58`) : la chaîne 1 → 2 → 3 est refusée au niveau de la table, pas seulement ligne par ligne. Tests `w2_guard_attempt_2_only_on_wave_2` (essais 3 à 0.0125 et 4 à 0.00625, comptes recalculés à leur `test_delta`, admis avant le pli) et `w2_chain_attempt_2_only_on_wave_2`. « essai ≥ 2 » corrigé en « essai 2 (D1) » au G0 (point 2 et point 6) et ici.
- **R-1** : résolue par le C-3 de MONARK (message `2ae215c`, CONFORME, A-1 `e96db6fc…4e352` inchangé) ; voir « Questions ». Ce n'est plus une condition de fusion du bloc B2.
- **m-1** : lecture déclarée complétée au G0 et ci-dessous (forme remplacée, `current` faux) ; question posée à MONARK avant CM-4c. Le test `w2_chain_attempt_2_only_on_wave_2` épingle le refus de l'empreinte de la forme servie.
- **m-2** (`policy-guard.ts:66`) : `n_test` des blocs pont (8760 / 2190), TEST-2 et FWD-2 (4392 / 1098) borné par horizon **avant** `uTest` et `vetoFires`, refus nommé « has an n_test above its block ». Valeurs vérifiées dans D6 de `decisions/0006-ADR-draft-wave2.md` : CALIB-2 et pont « n 8760 / 2190 » (365 jours), TEST-2 « n 4392 / 1098 » (2023-10-01 à 2024-04-01, 183 jours), FWD-2 « same rule and numbers » (2024-04-01 à 2024-10-01, 183 jours). Constante `W2_BLOCK_N_MAX` dans `policy-wave2.ts`. Test `w2_guard_bounds_n_test_of_each_block` : bords admis (pont 8760, FWD-2 et TEST-2 4392), 8761 et 4393 refusés. Le `n_test` du TEST de vague 1 (lot a) et le bloc `retire` `live:` restent non bornés : à CM-4c.
- **m-3** : trois tests neufs, un tueur chacun : `w2_guard_under_calib_tail_columns_null` (`tail_m`, `tail_a`, `miss_adj_a` non nuls sur `under_calib` refusés), `w2_guard_under_calib_bridge_and_fwd_vetoes_false` (`vetoes.bridge` ou `vetoes.fwd` vrai sur `under_calib` refusés), `w2_guard_veto_order_test_before_fwd` (TEST et FWD-2 tirent, pont non : `vetoed: test`).
- **m-4** : phrase de portée ajoutée à « Ce que le lot change ».
- **Tueurs neufs** (forme fermée) :
  - `policy-guard.ts:57 CONST "(w2 ? 2 : 1)" -> "(w2 ? Math.max(at, 2) : 1)"` ;
  - `policy-wave2.ts:58 CONST "(r.source.wave === 2 ? 2 : 1)" -> "r.calib_attempt"` ;
  - `policy-guard.ts:66 SDL` de la borne des blocs ;
  - `policy-guard.ts:70 CONST "r.retire, ...tails]" -> "r.retire]"` ;
  - `policy-guard.ts:71 CONST` de la liste des vetos `under_calib` réduite à `[r.vetoes?.test]` ;
  - `policy-guard.ts:85 CONST "[\"bridge\", \"test\", \"fwd\"]" -> "[\"bridge\", \"fwd\", \"test\"]"`.
  Tueurs déplacés, réancrés : `policy-guard.ts` +1 à partir de `:66` (`:67`, `:74`, `:75`, `:83`, `:84`, `:85`, `:89`, `:93`, `:101`, `:108`, `:118`) ; `policy-wave2.ts` `:34`, `:39`, `:58`.

### Oracle du pli (Node 24.21.0, variables de proxy retirées, TMPDIR propre, effacé à la fin)

- `node scripts/red-proof.mjs --base f14df97c --gel 7315a8a4 --repo /home/user/monark-governance-b2c --draw 6 --seed 37` : 6 jugés, 26 inchangés.
  - **F2P, 3** : `w2_guard_attempt_2_only_on_wave_2`, `w2_chain_attempt_2_only_on_wave_2`, `w2_guard_bounds_n_test_of_each_block` ; leurs 3 tueurs tirés, **3 tués**.
  - **Refusés « green at base », 3**, attendus : les trois tests de m-3 ne font que resserrer (les mutants survivants de la G2 sont des mutants du gel, la garde refusait déjà ces lignes). Leurs tueurs, appliqués à la main au gel un à un : **3 tués**.
  - Sortie du script : REFUSED, à cause de ces trois seulement. `RED-PROOF.json` sha256 `ed3c31a001025592f973a34c77880a3f640cef4f79ac8470270f97c8f1e411b8` (dépend des chemins).
  - Contrôle complet : les **32 tueurs** des deux fichiers de garde, appliqués un à un au nouveau gel, tuent chacun leur test.
- **Ancres** : contre `29c2e29b`, 32 tueurs, 32 ancrés, 0 dérivé, 0 perdu ; contre `abe14e6b`, 36, 36, 0, 0.
- `tsc --noEmit` vert ; `eslint .` propre ; `lint:ratchet` 69/69 ; `gate:vocab` OK (345 fichiers) ; `lang:gate` OK.
- `npm test` complet au nouveau gel : **2 265 tests, 2 243 verts, 22 sautés, 0 rouge**, sortie 0.
- **Rejeu sur `wave1.json`** (`811fcd57…d9cb`, mêmes épingles) : 280 lignes, **32 tables sur 32** admises ; `silence` 276, `region` 2, `vetoed` 2. Inchangé.
- **R-25** (`r25()` sur `ci.yml`) : lot b contre `29c2e29b` STAT **388** (+356/−32) ≤ 547 ; PR contre `abe14e6b` STAT **820** (+820/−0) ≤ 1 205 ; CONTENT_STAT 0.

## Questions

Aucune question de contrat.

Trace du contrôle C-3 d'A-1 (information du G0) : **résolue** (R-1 de la G2) : MONARK a fait C-3 le 2026-10-04 vers 22:0x UTC (message `2ae215c`, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-C3-A1.md`). Verdict **CONFORME** ; empreinte d'A-1 `e96db6fc6bede57f60a5b82474d8c1d98731fb52a1b335edbedbb6af1744e352` inchangée ; le lot applique A-1 tel qu'écrit, sans garde d'attente. Sa remarque non bloquante (A-1 suppose alpha 0.01 pour ses n0 sans le dire) concerne le texte servi, pas ce lot.

**Question ouverte pour MONARK, à trancher avant CM-4c** (m-1 de la G2) : la forme de la parente que `calib_parent` digère. La garde prend la forme remplacée (`current` faux, telle que la table l'écrit) ; l'autre lecture est la forme servie (`current` vrai, le `policy_row_sha256` du fil). Le générateur de `wave2.json` et la garde doivent faire le même choix.

Les lectures déclarées du G0 sont à juger par la G2 :
- `calib_parent` est l'empreinte canonique de la ligne parente, dans sa forme remplacée (`current` faux ; m-1, question ci-dessus) ;
- raison d'un rejet de queue ;
- colonnes de queue nulles sur `under_calib` ;
- `current` de la vague 1 épinglé jusqu'à la garde de table de la vague 2 (CM-4c).
