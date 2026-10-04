# G7 du lot COINBASE-PRE-LOOP-1 : la comparaison lit `empty_witness_pages`, le détecteur lit `pass` et `recorder_sha256`, g1-R10 concluant

- **Plan** : `docs/G0-lot-coinbase-pre-loop-1.md`. **Base** : `0c8f8177` (`origin/lot/etude-suite`). Branche
  `recherches/coinbase-pre-loop-1`. Commits : `8041ce9` (G0), `32e2ed6` (tests rouges), `598ca75` (code, premier gel), `4f3df75` (G7) ;
  pli de la G2 : `cdfed1e` (tests seuls, **gel**), puis la mise à jour de ce G7.
- **Hors zone** : rien. `scripts/record-coinbase-candles.mjs` n'est pas modifié (sha `dccb218d…281e`, celui de la relecture) ; aucun
  `.d.mts` ne change. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci` n'est pas commis.

## Pli de la G2 (instance neuve : APPROUVE-AVEC-CORRECTIONS ; rapport `scratchpad/G2-coinbase-pre-loop-1.md`)

Le pli ne touche que les tests (`cdfed1e`), d'abord : aucune ligne de code ne change, aucune adresse de tueur ne bouge.

| Correction | Pli | Vérifié |
|---|---|---|
| C-1 : l'enfant de m4 avec `env: {}` | `env: { SYSTEMROOT: process.env.SYSTEMROOT }`, comme les autres enfants Coinbase (node démarre sous Windows) | test vert au gel |
| C-2 : `v === 0` → `v <= 0` et → `v < 1` survivent (D:160) | cas `empty_pages` -1 et 0.5 ajoutés à `ee7_refuses_a_month_whose_manifest_is_not_a_sealed_pass_1` | les deux mutants appliqués à la main : tués |
| m-1 : deux mois seulement | cas de trois mois (2025-01 à 03), le troisième d'un autre enregistreur : refus nommé au troisième | mutant « seul le deuxième mois comparé » (`recorders[0]` → `recorders.length === 1 ? recorders[0] : undefined`) : tué |
| m-2 : le mois nommé | le détail nomme le premier mois qui diffère du premier mois lu ; si c'est le premier mois qui est l'intrus, c'est le deuxième qui est nommé | écrit ici |
| m-3, m-4 | sans changement (`1.0`, `1e0`, `-0` sont indiscernables de 0 et 1 en JSON ; m4 rougit à la base par le détecteur, choix du G0) | — |

**Red-proof après le pli** : `node scripts/red-proof.mjs --base 0c8f8177 --gel cdfed1e --repo /home/user/monark-governance-cb --draw 5
--seed 37` sous Node 24.21.0 : **OK au premier essai** (1 tentative), 5 jugés, 5 F2P, 78 inchangés, 5 tueurs tirés, 5 tués ;
`RED-PROOF.json` sha256 `02d476345ac0299baeb13046021cfdc220f746bcbcbbc67bdbd55b80b2a2d183`. Le premier gel `598ca75` avait aussi donné OK
au premier essai chez moi ; la G2 a eu trois REFUSED sur le même gel (O-1 ci-dessous).

**R-25 après le pli** : 168 lignes comptées (146 insertions, 22 suppressions), sous 547. **Tests après le pli** : comparaison 10/10,
détecteur 35/35, enregistreur 38/38, sonde 9/9 ; `tsc`, eslint, `gate:vocab`, `lint:ratchet` 69/69 verts.

## Fait, item par item

| Item | Code | Test | Tueur tiré, tué |
|---|---|---|---|
| COINBASE-WITNESS-PAGES-COMPARE-1 (m1) : passe 2, clé présente, entier de 0 à 1 | `compare-coinbase-passes.mjs:129-132` | `coinbase_passes_require_empty_witness_pages_of_0_or_1_in_pass_2` (absente, 2, -1, 0.5, `"1"`, `null` refusées ; 0 et 1 comparées) | `:131` `w <= 1` → `w <= 2` |
| m1 : passe 1, clé absente | même ligne | `coinbase_passes_refuse_empty_witness_pages_in_pass_1` (0, 1, `null` refusées) | `:131` condition de la passe 1 → `true` |
| EE7-MANIFEST-READ-1, reste (m2) : `pass` 1, `empty_pages` 0 | `detect-ee7-history.mjs:159-160` | `ee7_refuses_a_month_whose_manifest_is_not_a_sealed_pass_1` (`pass` 2, absent, `"1"` ; `empty_pages` 1, absent) | `:159` `v === 1,` → `v >= 1,` |
| m2 : `recorder_sha256` identique sur les mois lus | `detect-ee7-history.mjs:161`, `:204`, `:207` | `ee7_refuses_months_written_by_different_recorders` (second mois autre, premier mois autre ; les deux pareils : lus) | `:161` comparaison au premier mois → `true` |
| m4 : g1-R10 concluant | aucun | `coinbase_candles_records_both_passes_of_a_28_day_month_in_bounded_time_for_the_comparison_never_for_the_detector` | `record-coinbase-candles.mjs:131` `end + pad);` → `end);` |

Refus : `not_comparable` `{ pass, file: "manifest.json", key: "empty_witness_pages" }` à la comparaison ; `manifest_mismatch`
`{ file, key }` au détecteur. Aucune valeur n'est imprimée.

**Choix pour m2** (justifié au G0) : `recorder_sha256` identique sur tous les mois que la course lit, sans valeur épinglée. Le premier mois
lu fixe la valeur ; un mois suivant qui diffère est refusé, le mois et la clé nommés. Le lien à `dccb218d…281e` passe par les
`SHA256SUMS` de chaque mois, que le rapport du détecteur cite (`source.months`), et se vérifie une fois au scellement. Question Q-PL-1.

**g1-R10** : sous le mutant, l'enfant borné (30 s, tas de 64 Mo) écrit la passe 1, puis meurt sur la limite du tas en passe 2 en
465 ms (`SIGABRT`). Le test du parent rougit par assertion (« both passes written in bounded time »,
`[0, null, …]` contre `[null, "SIGABRT", "[1,2688,0,0,null]\n"]`). `red-proof` le compte **tué**, plus « non conclu ».

## Oracle

- `node scripts/red-proof.mjs --base 0c8f8177 --gel 598ca75 --repo /home/user/monark-governance-cb --draw 5 --seed 37` sous Node
  24.21.0 : **OK**, 5 tests jugés, 5 F2P (rouges à la base par `ERR_ASSERTION`, verts au gel), 78 inchangés, 5 tueurs tirés, 5 tués.
  `RED-PROOF.json` sha256 `12ad91ad681f4734b2185b18494b3fc1fedacbd274aaec00e7aaad66b58b271f` (dans le dossier scratch, hors dépôt).
- Tests sous Node 24.21.0, variables de proxy retirées : `compare-coinbase-passes` 10/10, `detect-ee7-history` 35/35,
  `record-coinbase-candles` 38/38, `probe-coinbase-bounds` 9/9, soit 92 verts, 0 en échec, 0 annulé (Coinbase : 54 de la base + 5 neufs ;
  détecteur : 33 + 2).
- `npx tsc --noEmit` vert ; eslint vert sur les trois fichiers de test ; `gate:vocab` OK ; `lint:ratchet` 69/69.
- R-25 par `r25()` (`scripts/oracle/r25.mjs`, pathspec de `ci.yml:82`) sur base…gel : **162 lignes comptées** (140 insertions, 22
  suppressions), sous 547. Détail : code 27 (comparaison 7, détecteur 20), tests 135 ; les docs ne comptent pas.

## Autocontrôle

- Aucun réseau : `fetch` injecté qui bâtit les pages en mémoire, `fetch` global piégé dans chaque fichier et dans l'enfant ; aucune
  série enregistrée lue ; aucune requête vers Coinbase ni Binance.
- Les tests existants restent verts au gel sans changement de corps : l'aide des manifestes synthétiques du détecteur porte `pass: 1` et
  `empty_pages: 0` (hors corps de test). Le contrôle de `empty_witness_pages` est placé après la garde `sharedEnd`, si bien que le test
  de la ligne de commande garde sa sortie (`core_end`).
- Lignes de tueur mises à jour (une ligne de tueur changée ne fait juger aucun test) : comparaison `:70`, `:90`, `:139`, `:140`, `:142`
  et `:166`, décalées de 1 à 3 ; détecteur `:160` → `:159`, et `:207`, dont le texte change (`recorders.push(readManifest(…))`). Après
  le gel, chaque tueur des trois fichiers est vérifié présent une fois sur sa ligne.

## Écarts au plan

- **`empty_pages` 0 exigé au détecteur** en plus de `pass` 1. ETAT l.393 nomme les deux comme reste d'EE7-MANIFEST-READ-1 ; le message de
  MONARK nomme `pass`. Coût : une clé de plus sur une ligne et deux cas de test.
- **Une ligne vide retirée** entre `readManifest` et `readCsv` du détecteur. Elle compense la ligne `return` ajoutée, de sorte que les
  27 tueurs du détecteur placés après la l.163 ne bougent pas. Ce n'est que de la forme.
- **Le test de g1-R10 rougit à la base par le détecteur**, pas par l'enregistreur, qui ne change pas : `red-proof` refuse un test vert à
  la base (Q-A7-11). Écrit au G0.
- Taille : 162 lignes contre 130 à 175 estimées au G0.

## Items ouverts et questions pour MONARK

- **Q-PL-1, recommandation de la G2** : garder « identique sur les mois lus », ne pas épingler dans le code. Le lien à la sha relue
  existe mais il est indirect : `source.months[].sha256sums` → `SHA256SUMS` → sha256 du manifeste → `recorder_sha256`. Ni la
  comparaison ni le détecteur n'impriment cette valeur, si bien qu'un enregistrement fait tout entier par un enregistreur non relu
  passe les deux scripts. Si MONARK veut une garantie dans le code avant la boucle, l'épinglage s'ajoute à la règle « identique », il
  ne la remplace pas. Item ouvert :
  - **EE7-RECORDER-SHA-REPORT-1** : (a) le détecteur imprime le `recorder_sha256` unique de la course dans `source` (la sortie et le
    `.d.mts` changent) ; (b) au scellement, la boucle vérifie cette valeur contre `dccb218d…281e` et l'inscrit.
  - Propriétaire : MONARK. Déclencheur : avant la première course du détecteur sur les mois scellés. Prix : environ 3 lignes de code,
    2 de `.d.mts` et un test.
- **Q-PL-2, item pour MONARK** (le code ne change pas dans ce lot) :
  - **COINBASE-WITNESS-PAGES-BOUND-1** : la borne de `empty_witness_pages` en passe 2 devient le nombre de cœurs de la passe 2 qui
    commencent à `end` ou après (exporter `cores` à côté de `sharedEnd`). Par la preuve de la relecture, ce nombre vaut 1 pour un mois
    de 28 ou 29 jours et 0 pour un mois de 30 ou 31 jours ; une valeur que la preuve exclut devient un refus nommé.
  - Propriétaire : MONARK. Déclencheur : avant le premier mois de 30 ou 31 jours de la boucle. Prix : environ 3 lignes et un cas de test.
- **RED-PROOF-TAP-TRUNCATION-1** (item d'outil, hors de ce lot) : `scripts/red-proof.mjs:153` lance chaque fichier avec
  `--test-reporter=tap --test-force-exit`. Sous ces options, le flux TAP est parfois tronqué au hasard, et le code de sortie reste 0
  quand tous les tests sont verts. Mesures de la G2 sur le fichier du détecteur : au gel, plans de 35, 32, 31 et 25 ; à la base, de 33
  et 26. Le reporter spec ne tronque jamais. Effet : de faux REFUSED (« missing », « other-fail »), jamais un faux F2P ni une fausse mise
  à mort. Piste : retirer `--test-force-exit`, ou écrire via `--test-reporter-destination`. D'ici là, l'oracle du G7 peut demander
  plusieurs essais ; ce lot en a demandé 1 sur chaque gel.
- La course par bloc (comptes C4) ne lit qu'une partie des mois : pour elle, « identique » ne couvre que ces mois. La course sur tout
  l'enregistrement, celle qui donne S et F, les couvre tous.
- COINBASE-PASSES-PIPE-1 (le détecteur exige le scellé de comparaison d'un mois) reste ouvert. Ce lot n'y touche pas : le refus de la
  passe 2 et le contrôle de `empty_pages` ferment seulement la part d'EE7-MANIFEST-READ-1.

## Sortie

Prêt pour le contrôle par diff de MONARK. Rien n'est poussé.
