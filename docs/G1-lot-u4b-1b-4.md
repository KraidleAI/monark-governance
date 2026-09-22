# G1 — lot U-4b-1b-4 (outillage course Ukemi : sonde (d) CutoffTimeSet, helper usdt-blocks, ancre pre-B0) — worker Opus 5.5 (claude-opus-5-5[1m]), 2026-09-22

Modèle résolu : claude-opus-5-5[1m]

# G1 — lot U-4b-1b-4 : outillage de course Ukemi hors gel (R-G sonde (d), R-H helper `--usdt-blocks`, R-I ancre pré-B₀)

Ce message est le rendu intégral. Le même texte est sur disque dans `F:\tmp\u4b1b4\G1.md`, synchronisé sur disque (fsync) et sauvegardé dans `backup\`.

- **Worker** : `claude-opus-5-5[1m]`, effort max, le 2026-09-22, de ~20:48 à ~22:15 UTC. La période inclut deux coupures de courant (§2).
- **Worktree** : `F:\Monark-wt-u4b1b4`, branche `lot/u4b-1b-4`, base `030fe06`.
  - Créé à `3f6662f`, puis avancé en fast-forward avant toute modification.
  - Entre les deux, seuls ont changé des fichiers `docs` et NARABI-OPS-1d. Aucun fichier de ce lot n'est concerné.
- **Aucun commit** (R-20), aucun workflow, aucun appel réseau réel : dans tous les tests, seul `globalThis.fetch` est bouchonné.
- **Sources lues [lu]** :
  - la consigne G1, le RUNBOOK (§A, §B, étapes 0-6, annexes C et O), le prereg (§DISC, `:66`, §Sonde, §5, §8) ;
  - G0 `:196-204,:284-310`, CHANTIERS `:835-850`, le checkpoint-1 du lot (C-1..C-9), les FAITS DualAggregator, l'ADDENDUM daté, PR-U4-1 en entier ;
  - le code du prober, du garde, du réducteur et du scoreur gelés, du sélecteur (lecture seule), de discover, `rpc2.ts`, `abi.ts`, `transport.ts:22-48`, les tests concernés et les fixtures e2.

## 1. Résultat

| Item | État | Preuve rejouable |
|---|---|---|
| **R-I** ancre pré-B₀ réelle, inconditionnelle | Livrée dans `u4-oracle-path.mjs` | Tests, plus une composition prober → réducteur gelé lancé en processus enfant → scoreur. 9 mutants tués. |
| **R-H** helper sur la forme réelle | Livré | Sur la fixture e2 réelle : `required=[23550406]`, `optional=[23550879]`. Les blocs lus par le scoreur gelé, observés par un Proxy, sont exactement `required`. Digests A/B e2 inchangés. 4 mutants tués. |
| **R-G** sonde (d) | Livrée **après** les FAITS et l'ADDENDUM : `scripts/census/u4b/u4b-probe-cutoff.mjs` (+ `.d.mts`) | Scan des événements `CutoffTimeSet`, règle GO si et seulement si `c_fresh == c_e2`. 10 tests, 12 mutants tués. |
| Prereg | **Non modifié** (`1971d9b1…`). Aucun flag obligatoire ajouté sur une ligne figée. | `PREREG-DELTA.md` : complément d'ADDENDUM §4 proposé, deltas RUNBOOK, contrôles **exécutés**, 2 rulings demandés |
| ADR | Amendement proposé | `ADR-amendement.md` |
| Oracle complet | **949 tests / 947 pass / 0 fail / 2 skips nommés**. gate:vocab, typecheck, lint, lang:gate, export:check sortent tous à 0 ; lint:ratchet à 69/69. | `oracle-final2\SUMMARY.txt`. Base `030fe06` : 933/931/0/2, avec les mêmes 2 skips. |
| Mutants (A-11, tap + byIntended) | **25/25** tués chacun par son test visé, restauration byte-exacte | `mutants-final.log` |
| R-25 (pathspec verbatim de `ci.yml:65`) | **795** (751 + / 44 −), donc < 800 | `R25.txt` |
| Invariants | **14/14 byte-identiques** : 9 gelés, prereg, ADR-U4b, ADDENDUM, FAITS, sélecteur `225d2304`. Blobs HEAD == arbre de travail. `git diff HEAD` vide sur ces fichiers et sur `docs/`. | `INVARIANTS-{BEFORE,AFTER}.txt` |

## 2. Incident : deux coupures de courant — intégrité reconstruite et prouvée

**Première coupure (~20:3x UTC).**
- Le worktree n'existait plus : je l'ai recréé et j'ai relancé `mk-nm.ps1`.
- A-2 : `require.resolve('@monark/rpc-guard')` résout vers `F:\Monark-wt-u4b1b4\packages\rpc-guard\src\index.ts`.

**Deuxième coupure (~21:37 UTC) : deux fichiers entièrement remplis d'octets NUL (mesuré).**
- `u4-oracle-path.mjs` : 23 715 octets NUL.
- `u4b-probe-cutoff.mjs` : 11 109 octets NUL.
- Les 6 autres fichiers étaient intacts (0 NUL, dernier octet `\n`).
- L'annonce « 0 octet NUL » que j'avais reçue est donc inexacte pour ces deux fichiers.
- Copies des fichiers NUL conservées dans `nul-evidence\`.

**Reconstruction byte-exacte.**
- Prober : version de base (`a2b39d0e…`) plus ré-application de la spécification d'édition. Résultat `4ed4c31e…`, identique au golden consigné dans l'en-tête des runs de mutants antérieurs à la coupure.
- Sonde : contenu d'origine ré-écrit. Résultat `1cec9b1d…`, identique au golden du run 3 antérieur à la coupure.
- Les 3 fichiers dont seul l'en-tête avait été retouché juste avant la coupure sont vérifiés par ré-application inverse. Ils redonnent exactement les versions testées avant la coupure : `138b59c4…`, `03a0c0f6…` et `1cec9b1d…`.

**Après la reconstruction.**
- Sur conseil de l'advisor : une vérification ajoutée au test 2 de la sonde, et l'en-tête de la sonde compacté.
- L'oracle complet, les 25 mutants, R-25, les invariants, les contrôles et les REF ont tous été ré-exécutés sur les octets finaux.
- Les 8 fichiers du lot sont sauvegardés et synchronisés dans `backup\`.
- Item formé : étendre GARDE-FSYNC-1 aux worktrees. Recommandation : un commit de sauvegarde par l'orchestrateur dès l'acceptation.

## 3. R-I — ancre pré-B₀ (prereg `:66`, ADR-U4b D2, cp-1 C-4/C-5, ADDENDUM §2)

### Code (`u4-oracle-path.mjs`, `4ed4c31e…`)

- **Constantes nommées** : `PRE_B0_FIRST_DEPTH = 9990` (`:49`), `DEFAULT_PRE_B0_MAX_WINDOWS = 6` (`:50`), `EXIT_PRE_B0_ANCHOR_STOP = 3` (`:52`).
- **Fenêtres (`preB0Windows`, `:55`)** :
  - la profondeur double à chaque fenêtre : `D_k = 9990·2^(k−1)` ;
  - chaque fenêtre ne lit que sa partie nouvelle, `[B0 − D_k, B0 − D_(k−1) − 1]` ; la première est `[B0 − 9990, B0]` ;
  - les fenêtres sont disjointes, jamais relues, et bornées à 0.
- **Choix de l'ancre (`pickPreB0Anchor`, `:70`)** :
  - c'est le **dernier** événement par `(block, logIndex)` dans les bornes de la fenêtre ;
  - un nœud qui ignore `toBlock` ne peut donc pas faire passer un événement de `[B0, B_last]` pour l'ancre ;
  - forme C-4 : `{price, block, log_index, round_id}`.
- **Étape 1b (`:204-221`)** :
  - lecture sur `aggregator()@B0`, avant le getLogs principal ;
  - chaque morceau de ≤ 9 990 blocs est lu en quorum-2 keyless et compté par le garde ;
  - une ligne de cache est écrite par fenêtre, avec auto-test du topic0.
- **Plafond épuisé** : le prober écrit sur stderr « PRE-B0 ANCHOR STOP … NO raw written » et renvoie `{status: 3}`. Aucun raw ni inputs n'est écrit, et le `finally` libère tous les verrous.
- **Sortie** :
  - le raw porte `pre_b0_anchor` (`:276`) ;
  - la provenance porte `pre_b0_anchor_window {from, to, windows_tried, calls}` (`:268`) ;
  - le flag optionnel `--pre-b0-max-windows` (défaut nommé : 6) est refusé avant tout fetch s'il n'est pas un entier > 0 (`:159`).

### Tests (`u4b-oracle-path.test.ts`)

Le bouchon `eth_getLogs` filtre désormais `fromBlock/toBlock` (C-5).

- **Test A-8 étendu** :
  - l'ancre retournée est égale à l'événement bouchonné ;
  - la provenance vaut `{from: B0−9990, to: B0, windows_tried: 1, calls: 4}` ;
  - `episode-selection.json` est byte-identique et `selection_sha256` inchangé.
- **Fenêtres, en pur** : dernier événement et non premier ; un événement au-dessus de B0 est ignoré.
- **Élargissement** : ancre trouvée à `windows_tried: 2` ; seule la plage `[B0−19980, B0−9991]` est lue.
- **Plafond épuisé** : exit 3, ni raw ni inputs, seulement les plages plafonnées lues, STOP nommé, 0 verrou restant.
- **Validation du flag** : `0`, `-1`, `2.5`, `six` refusés, 0 fetch.
- **Composition C-1(i)** (`u4b_anchor_and_usdt_blocks_compose_prober_to_frozen_reducer_and_scorer`) :
  - helper sur les labels e2 réels → run réel du prober → raw → `u4b-reduce.mjs` gelé en processus enfant ;
  - la ligne d'ancre produite vaut `{kind:"anchor", block, price, source:"answer_updated_pre_b0"}`, égale à l'événement ;
  - dans les scores, `cell_a.anchor_price` est égal à ce prix, et `deficit_lines_priced_from_usdt = 1` ;
  - le brut *book* est l'enveloppe du recorder autour du livre e2 réduit committé (réserves réelles, 0 compte). Le recorder est hors lot. Le brut oracle n'est jamais construit à la main.
- **`guard-scripts-u4.test.ts`** :
  - le préchargement contient maintenant un événement pré-B₀ (bloc 23 545 000) et un getLogs qui respecte les bornes ;
  - `REF.ORACLE_RAW/ORACLE_INPUTS` passent de `8b0e3d69…/755a3d91…` à `82544163…/e2c3ff88…`, mesurés deux fois indépendamment : par le harnais du test, et par `ref-measure.mjs` (CLI enfant, deux passages identiques, re-mesuré après la reconstruction) ;
  - 15/15 tests verts ;
  - le test de refus de budget tient toujours `refused == 1`, `fetches == 5`, exit 2 (vérifié, non affaibli).

## 4. R-H — helper `usdtBlocksFromLabelerDeficit` (runbook C-7, cp-1 C-1(ii))

- **Contrat (`:118-137`)** : `(realizedJsonl, inputsJsonl?) → {required, optional, blocks}`.
  - `required` = les `first_block` des lignes qui satisfont exactement le prédicat du scoreur gelé (`u4b-scores.mjs:109-116`).
  - Une telle ligne sur une dette non-USDT est refusée nommément (le scoreur jetterait dessus, `:113`).
  - `optional` = les blocs `DeficitCreated` USDT des mêmes comptes : lecture coûtée, jamais lue par le scoreur (C-9).
  - Une ligne non-JSON est refusée.
- **Mesures sur la fixture e2 réelle** :
  - `required = [23550406]`, `optional = [23550879]`, `blocks` = exactement les clés `usdt_prices` de la fixture ;
  - les blocs réellement lus par le scoreur, observés par un Proxy, sont `[23550406]` ;
  - avec `usdt_prices` réduit aux seuls blocs requis, les digests A `2feb4ab0…` et B `07bb8e3b…` sont inchangés ;
  - une ligne réelle rendue non-USDT est refusée.
- L'ancien test synthétique `kind:"deficit"` est retiré.

## 5. R-G — sonde (d) (`u4b-probe-cutoff.mjs` `deffbb6b…`), écrite après les FAITS et l'ADDENDUM (C-2)

**Méthode.**
- `s_cutoffTime` est `uint32 internal` sans getter (FAITS) : la sonde ne peut pas faire d'`eth_call`.
- Elle lit `aggregator()` sur le proxy §DISC:28 à `B_fresh`, et vérifie que le résultat est bien `0x7c7fdfca…`. Sinon STOP, sans scan.
- Elle lit ensuite les événements `CutoffTimeSet(uint32)` :
  - topic0 `0xb24a681ce3399a408a89fd0c2b59dfc24bdad592b1c7ec7671cf060596c1c4d1`, calculé localement par le keccak auto-testé et cité dans le test ;
  - sur `[22 076 041, max(B_fresh, 23 545 087)]`, en morceaux ≤ 9 990, quorum-2 keyless, chaque morceau compté.
- `B_fresh = episode.B0`, lu dans le fichier d'épisode sha-vérifié. Les flags `--block`, `--finalized`, `--target` sont refusés nommément.

**Décision.**
- `decodeCutoffEvents` (`:46`) : `data` doit être un seul mot uint32 ; un `0x` vide donne une `ProbeError` nommée.
- `cutoffAt` (`:57`) : la valeur en vigueur à un bloc est celle du **dernier** événement ≤ ce bloc.
- `decide` (`:64`) : GO si et seulement si `c_fresh` et `c_e2` existent et sont égaux.
- Tout échec de lecture compte comme un scan incomplet et donne un STOP nommé.
  - `reason` fermé : `cutoff_changed`, `aggregator_mismatch`, `no_event_at_or_below_block`, `budget_stop`, `read_failed:<Classe>`.
- Le fichier de sortie est toujours écrit. Codes de sortie : 0 = GO, 3 = STOP, 1 = refus d'argument (sans fichier).
- La CLI passe un env vide au garde. La sortie `cutoff-<B_fresh>.json` est hors dépôt, et jamais dans `episode-selection.json`.

**Tests (10).**
- GO sur corps de forme réelle, plage contiguë depuis 22 076 041, et contrôle C-12 exit 0.
- STOP quand la valeur change après e2 (45 contre 30), C-12 exit 3.
- Épisode antérieur à e2 (`B_fresh = 23 000 000`, changement à 23 300 000) : la plage est étendue à 23 545 087 et donne STOP. Sans cette extension, on obtiendrait un faux GO (mutant MG12).
- Tests purs (dernier événement, règle, `0x` vide, dépassement uint32, topic0 étranger).
- Agrégateur différent : STOP sans scan.
- Quorum manquant et mot vide : STOP nommé, 0 verrou restant.
- La sélection n'est jamais écrite, et le `parseEpisodeFile` du prober l'accepte toujours.
- Refus avant tout fetch, y compris `chainstack` et `helius`.
- Refus de budget : STOP `budget_stop`, 1 ligne `refused`, aucun fetch supplémentaire.
- CLI enfant : exit 0 sur GO, 3 sur STOP.
- B-5 : aucun appel réseau, aucune lecture d'env, aucun nom de clé payante ; imports fermés.

**Contrôles runbook exécutés sur les octets finaux (`controls.log`).**
- C-7-bis : `required=23550406` / `optional=23550879`.
- C-9-bis : `has_pre_b0_anchor:true`, exit 0. `emode_ok:false` est attendu sur ce brut bouchonné.
- Réducteur gelé : exit 0.
- C-10-bis : `anchor_is_real:true`, exit 0.
- Sonde GO : exit 0 puis C-12 exit 0. Sonde STOP : exit 3 puis C-12 exit 3.

## 6. Corrections cp-1 C-1..C-9 : état

| # | État | Preuve |
|---|---|---|
| C-1 (i) | fait | composition prober → réducteur gelé → scoreur (MI5, MH4) |
| C-1 (ii) | fait | helper sur la fixture e2 réelle ; lectures observées égales à `required` ; digests inchangés ; test synthétique retiré (MH1-MH3) |
| C-1 (iii) | fait | sonde → fichier → C-12 exit 0/3 (MG2, MG3, MG9, MG12) |
| C-2 | fait : aucune ligne de sonde écrite avant les FAITS | méthode par événement ; agrégateur asserté (MG5) |
| C-3 | fait par l'orchestrateur (ADDENDUM) ; le code l'applique à la lettre | `decide`, `RULE` ; écarts d'exécution proposés en ADDENDUM §4 |
| C-4 | fait côté code, proposé côté docs | MI4 ; C-9-bis, C-10-bis, Sidecar 5 dans `PREREG-DELTA.md` |
| C-5 | fait | bouchons filtrés par bornes ; MI1, MI2, MG4 ; REF mesurés deux fois |
| C-6 | fait | MG4 ; test 6 |
| C-7 | proposé (acte orchestrateur) | `PREREG-DELTA.md` §2 : sha attendus en 0.6 = `4ed4c31e` et `deffbb6b` ; `P_ancre` = 2, 3, 5, 9, 17, 33 |
| C-8 | fait | `ADR-amendement.md` §4 (7 modes MAST) |
| C-9 | fait | ligne 1 ; R-25 = 795 ; option `DeficitCreated` déclarée coûtée |

## 7. Consigne standard : point par point

### A — Environnement et preuve

- **A-1** fait : ligne 1.
- **A-2** fait : `mk-nm.ps1` ; `require.resolve` en §2.
- **A-3** fait : codes de sortie capturés directement, 7 commandes à exit 0.
- **A-4** fait : `DELIVERED.sha256` vérifié 8/8 ; aucun commit ; rien sur `C:` ; aucun réseau.
- **A-5** fait : 795 lignes, pathspec verbatim de `ci.yml:65`.
  - Mesuré sur l'arbre de travail via un index git temporaire (`GIT_INDEX_FILE` + `git add -N` des 3 fichiers neufs), l'index réel restant intact.
  - Couture pré-déclarée si besoin : PR-A 340 / PR-B 455.
- **A-6** fait : 14/14 invariants byte-identiques.
- **A-7** fait : tout est lancé sous `env -u` des 8 clés.
- **A-8** fait : corps de forme réelle, `résolu === corps` asserté.
- **A-9** n-a : aucune phrase servie.
- **A-10** n-a (aucune surface servie), mais le liage est asserté : ancre → `anchor_price`, bloc USDT → compteur, verdict → code de sortie (MG9).
- **A-11** fait : 25/25.
- **A-12** fait : en-têtes auto-identifiants dans tous les journaux.

### B — Sécurité des secrets

- **B-1** n-a, motivé :
  - la sonde refuse les opérateurs payants par code (testé `chainstack` et `helius`) ;
  - le refus repose sur une liste positive keyless, donc le mutant « un seul payant refusé » n'a pas de prise ; MG8 (refus retiré) est rouge.
- **B-2 / B-3** n-a : aucune clé manipulée.
- **B-4** fait : env vide passé au garde (MG11) ; arguments requis sans défaut.
- **B-5** fait partiellement : la sonde a son propre grep fail-closed. La racine CI ne couvre pas `scripts/census/u4b/**`, ce qui relève de l'item existant CARTO-T1C-7 (orchestrateur).
- **B-6** n-a.

### C — Identités et erreurs

- **C-1** fait : classes d'erreur canoniques réutilisées.
- **C-2** fait : refus de budget jamais réessayé, ré-asserté sur la sonde (MG10).
- **C-3** fait : une seule couche de retry (sonde 2 retries, 200→4 000 ms ; prober inchangé, 3 retries, 500→8 000 ms).
- **C-4** n-a.

### D — Tests qui prouvent

- **D-1** fait : 25 mutants nommés.
- **D-2** fait : vecteurs non vides tirés de la fixture réelle.
- **D-3** fait : un test de composition par tuyau ; rien n'est déclaré `built`.
- **D-4** fait : §10.

### E — Concurrence et état

- **E-1** fait : verrous libérés au `finally`, testé sur STOP.
- **E-2** fait : `assertLedgerDir` réutilisé.
- **E-3** fait : backoffs déclarés.

### F — Rédaction

- **F-1** fait : une ligne Tuyaux par pièce ; aucun renvoi vers `F:\tmp` dans l'ADR.
- **F-2** fait : lignes ajoutées en ASCII (mesuré), gate:vocab à 0.
- **F-3** fait : advisor consulté avant le code et avant le rendu.

### G

- **G-1** n-a : aucune pièce publique touchée.

## 8. Tuyaux

| Tuyau | Chaîne |
|---|---|
| Ancre | prober → `raw.pre_b0_anchor` → réducteur gelé → `anchor_price` du scoreur |
| `--usdt-blocks` | labeler → helper → prober → réducteur → `usdtPrices[first_block]` |
| Sonde (d) | sonde → fichier `cutoff-<B_fresh>.json` → contrôle C-12 → go/no-go de l'étape 3 |

Chacun est couvert par un test de composition non-LLM. Aucune pièce n'est `built`, et aucun registre public n'est touché.

## 9. Déviations D-n

1. **Ancre absente** : la mission prévoyait « champ absent + statut nommé ». C'est remplacé par C-4 / ADDENDUM : STOP exit 3, aucun raw.
2. **Nom du flag** : `--pre-b0-max-windows` au lieu de `--pre-b0-max-chunks`, parce que l'unité de l'ADDENDUM est la fenêtre.
3. **Fenêtre 1** : elle compte 9 991 blocs, donc 2 morceaux et non « un morceau » comme l'écrit l'ADDENDUM. Bornes gardées littérales.
4. **Sonde** : les flags `--block`, `--finalized`, `--target` et l'`eth_call` de la mission sont remplacés par la méthode de l'ADDENDUM §1 ; ces flags sont refusés.
5. **Borne haute du scan** : `max(B_fresh, 23 545 087)`, testée (MG12).
6. **Compte de tests** : la base a avancé (fusion NARABI-OPS-1d) et compte 933 tests, dont 2 skips. Final : 949 = 933 + 16, mêmes 2 skips nommés.
7. **REF re-baselinés**, avec deux mesures indépendantes.
8. **Helper** : il retourne un objet au lieu d'un tableau et lit `U3-realized`.
9. **Base du worktree** avancée par fast-forward, avant toute modification.
10. **Opérateurs de la sonde** : `drpc.org,mevblocker.io,tenderly.co` proposés, docs seulement, sur ruling de l'orchestrateur.

## 10. Diff des tests annoté (D-4)

- **Retiré** : l'assertion synthétique `kind:"deficit"`. Motif : c'est la forme `U3-inputs`, jamais lue par le scoreur (le défaut R-H). Elle est remplacée par un test plus fort sur la fixture réelle.
- **Bouchons** : les getLogs sont désormais filtrés par bornes (plus strict) et contiennent un événement pré-B₀.
- **REF** : re-mesurés deux fois.
- **Messages** : le texte de deux assertions `n_updates` est complété ; la valeur attendue (3) est inchangée.
- **Budget** : le test de refus de budget est inchangé et reste vert.
- Aucune assertion n'est affaiblie.

## 11. Mutants

Tous tués par leur test visé.

| Groupe | Mutants | Tests tueurs |
|---|---|---|
| R-I | MI1-MI9 | windows (pur) ×4, widening, cap-exhausted ×2, flag, composition |
| R-H | MH1-MH4 | real-e2 ×3, composition |
| R-G | MG1-MG12 | value-in-force, go, stop ×2 (dont MG12), selection, aggregator, refusals ×2, empty-word, cli, budget, scan |

Détail complet (hunk, sha du fichier muté, sha restauré, tests rouges collatéraux) : `mutants-final.log`.

## 12. Clôture zéro dette (P5)

**Actes de l'orchestrateur (R-20).**
- Insérer `ADR-amendement.md`.
- Appliquer les deltas docs-only du RUNBOOK et du SIDECAR, plus l'ADDENDUM §4 s'il est accepté (sha à recalculer après commit).
- Fusionner avant `<HEAD_E1>`.
- Trancher deux rulings :
  - `<USDT_BLOCKS>` : blocs requis seuls, ou requis + optionnels ;
  - `--operators` de la sonde. Dans les deux cas, une passerelle incomplète donne un STOP, jamais un GO.

**Items formés, avec déclencheur.**
- **OBS-1** : littéral `model` du prober. Déclencheur atteint, à trancher.
- **CARTO-T1C-7** : étendre la racine CI à `scripts/census/u4b/**`.
- **C-12 en deux copies** (constante de test et RUNBOOK) : épingler leur égalité au moment de l'insertion.
- **GARDE-FSYNC-1** : étendre aux worktrees.

**Aucune demande de procurement.** Aucun chiffre de seconde main n'est porteur : la valeur 30 est rapportée, jamais décisive, et l'écart maximal e2 (301 blocs, 3 636 s) est mesuré sur la fixture committée.

## 13. `DELIVERED.sha256`

```
8f5bc265f54129a6f1b2a0916abc6480e46dad54db500f292fa5d463e10af3ce  apps/sentinel/test/u4b-oracle-path.test.ts
d222221160eb24490c7b96a38cdcc5cb0c28ab2175d242bb0229a85a66ecc643  apps/sentinel/test/u4b-probe-cutoff.test.ts
6084b3bfa39d0948ac1b53563647edd90091aa3d006a85cebb25c8e56a27599d  scripts/census/u4-oracle-path.d.mts
4ed4c31e99f148b9d6285926f010cd7beb5f3b686c70a9e7188b3c0c7f8f0d7a  scripts/census/u4-oracle-path.mjs
b890d4e2ccd549c89cea955d057fca161f4f5688b03edb0074164c4ad07b43d3  scripts/census/u4b/u4b-probe-cutoff.d.mts
deffbb6b79e802875e5519801eacfce00299ac6b926eb09d400fd93f30c50a57  scripts/census/u4b/u4b-probe-cutoff.mjs
36c31b61cea1feefcf4278daeeda4dbfac9fed7edd942ac692cd4ce357916368  scripts/export-exclude-tests.json
119f04e818296303c54a914178373955748091d8a2256580427dea0a5392cdb3  test/guard-scripts-u4.test.ts
```

## 14. Chemins absolus

**Fichiers modifiés ou créés dans le worktree (non committés) :**
- `F:\Monark-wt-u4b1b4\scripts\census\u4-oracle-path.mjs`
- `F:\Monark-wt-u4b1b4\scripts\census\u4-oracle-path.d.mts`
- `F:\Monark-wt-u4b1b4\scripts\census\u4b\u4b-probe-cutoff.mjs`
- `F:\Monark-wt-u4b1b4\scripts\census\u4b\u4b-probe-cutoff.d.mts`
- `F:\Monark-wt-u4b1b4\apps\sentinel\test\u4b-oracle-path.test.ts`
- `F:\Monark-wt-u4b1b4\apps\sentinel\test\u4b-probe-cutoff.test.ts`
- `F:\Monark-wt-u4b1b4\test\guard-scripts-u4.test.ts`
- `F:\Monark-wt-u4b1b4\scripts\export-exclude-tests.json`

**Preuves (`F:\tmp\u4b1b4\`) :**
- `G1.md`, `DELIVERED.sha256`
- `mutants.mjs`, `mutants-final.log`
- `PREREG-DELTA.md`, `ADR-amendement.md`
- `R25.txt`, `INVARIANTS-BEFORE.txt`, `INVARIANTS-AFTER.txt`
- `oracle-final2\`, `ref-measure-final.json`, `controls.log`
- `backup\`, `nul-evidence\`
