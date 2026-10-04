# G0 du lot COINBASE-PRE-LOOP-1 : la comparaison lit `empty_witness_pages`, le détecteur lit `pass` et `recorder_sha256`, g1-R10 concluant

- **Rattachement** : message de MONARK du 2026-10-04 (`messages/2026-10-04-MONARK-vers-RECHERCHES-deux-lots-series-et-P1-b1.md` §2) ;
  relecture APPROUVE de RECHERCHES (`pieces/2026-10-04-relecture-enregistreurs/review-coinbase.md`, mineurs m1, m2, m4 et la preuve
  d'atteignabilité) ; items d'ETAT COINBASE-WITNESS-PAGES-COMPARE-1 (proposé au CORR de COINBASE-PASS-EDGES-1, Q-CORR-5) et
  EE7-MANIFEST-READ-1 (`docs/ETAT.md` l.391-395, son reste) ; mutant g1-R10 « non conclu » (`cbedges/corr/CORR.md` l.214).
- **Base** : `0c8f8177` (`origin/lot/etude-suite`). Branche `recherches/coinbase-pre-loop-1`, worktree propre. Auteur : RECHERCHES ;
  contrôle par diff et fusion : MONARK. Aucun réseau, aucune série enregistrée lue : tous les tests écrivent des mois synthétiques par un
  `fetch` injecté, le `fetch` global reste un piège.
- **Zone** : `scripts/compare-coinbase-passes.mjs`, `scripts/detect-ee7-history.mjs`, le test de g1-R10 dans
  `test/record-coinbase-candles.test.ts`, et les tests des deux premiers. `scripts/record-coinbase-candles.mjs` n'est pas modifié (son sha
  reste `dccb218d…281e`, celui de la relecture). Aucun `.d.mts` ne change : aucune signature ni aucune sortie ne bouge.

## Contenu

1. **COINBASE-WITNESS-PAGES-COMPARE-1 (m1).** `compare-coinbase-passes.mjs` exige `empty_witness_pages` absent du manifeste de la passe 1
   (clé propre, quelle que soit sa valeur) et, en passe 2, présent et entier de 0 à 1 (`Number.isInteger`, `0 <= w <= 1` : refuse
   `2`, `-1`, `0.5`, `"1"`, `null`, l'absence). Sinon `not_comparable`, détail `{ pass, file: "manifest.json", key:
   "empty_witness_pages" }` : la raison est nommée par la clé. Borne 1 : point 2 de la preuve de la relecture (au plus un cœur de témoins
   seuls par fenêtre, car 298 > 149). Le contrôle se place avec celui de `witness_slots`, après la garde `sharedEnd` : un mois de 149
   créneaux modulo 298 reste refusé par cette garde d'abord (le test de la ligne de commande garde sa sortie).
2. **Reste d'EE7-MANIFEST-READ-1 (m2).** `detect-ee7-history.mjs` (`readManifest`, l.160-161) exige en plus `pass` égal à 1 et
   `empty_pages` égal à 0 (ETAT l.393 nomme les deux ; le message de MONARK nomme `pass`), et `recorder_sha256` identique sur tous les
   mois que la course lit. Refus : `manifest_mismatch`, détail `{ file, key }` (le mois fautif, la clé ; jamais la valeur).
3. **m4 : g1-R10 concluant.** Le mutant (`to = Math.min(from + CORE * step, end + pad)` → `…, end)`, l.131 de l'enregistreur) fait boucler
   `cores()` sans fin en passe 2, de façon synchrone, avant toute requête : un délai de `node:test` ne peut pas tirer (la boucle ne rend
   jamais la main) et la course meurt sur la limite du tas, ce que `red-proof` classe « non concluant ». Le test enregistre donc les deux
   passes de février 2023 dans un processus enfant borné (`spawnSync`, délai 30 s, `--max-old-space-size=64`) et affirme son code de
   sortie et sa sortie : sous le mutant, l'enfant meurt et le test du parent rougit par assertion (tué, concluant).

## Choix pour m2 : identique sur tous les mois lus (et non épinglé)

MONARK : « égal à celui de l'enregistreur (ou identique sur tous les mois) ». Lecture du détecteur : S et F viennent d'**une** course sur
tout l'enregistrement (en-tête l.6-7), qui lit et vérifie chaque mois de la fenêtre l'un après l'autre (`readWindow`, l.203-218) ;
« identique sur tous les mois lus » vaut donc « identique sur les 50 mois » pour la course qui compte. Raisons :
- **Le lien à l'enregistreur relu reste écrit** : chaque `SHA256SUMS` épingle son `manifest.json`, et le rapport du détecteur sort le
  sha256 du `SHA256SUMS` de chaque mois (`source.months`) ; le `recorder_sha256` unique d'une course se vérifie donc une fois contre
  `dccb218d…281e`, au scellement. La comparaison des passes exige déjà le même `recorder_sha256` dans les deux passes d'un mois (C:31).
- **Une valeur épinglée couple le détecteur à l'octet près de l'enregistreur** : toute retouche future de l'enregistreur (même un
  commentaire, après une nouvelle relecture) casserait le détecteur et ses tests (le test qui lit un mois écrit par l'enregistreur prend
  son sha au fichier), alors que les mois déjà scellés, eux, ne changent pas. La règle « identique » survit à une relecture neuve
  (réenregistrement de tous les mois), et refuse un mélange.
- **Ce que la règle ne voit pas** : un enregistrement fait tout entier par un enregistreur non relu. Ce cas relève du scellement (le
  `recorder_sha256` d'une course est lu une fois, cité au scellé des mois) ; si MONARK préfère l'épinglage, c'est une ligne
  (`RECORDER_SHA256`), question Q-PL-1.

## Tests (rouges à la base par assertion), tueurs

`test/compare-coinbase-passes.test.ts` :
- `coinbase_passes_require_empty_witness_pages_of_0_or_1_in_pass_2` : passe 2 sans la clé, à `2`, `-1`, `0.5`, `"1"`, `null` : refus nommé ;
  à 0 et à 1 : comparée. Tueur : `w <= 1` → `w <= 2`.
- `coinbase_passes_refuse_empty_witness_pages_in_pass_1` : la clé en passe 1, à 0, à 1, à `null` : refus nommé. Tueur : la condition de la
  passe 1 mise à `true`.

`test/detect-ee7-history.test.ts` :
- `ee7_refuses_a_month_whose_manifest_is_not_a_sealed_pass_1` : `pass` 2, absent, `"1"` ; `empty_pages` 1, absent. Tueur : `v === 1` → `v >= 1`.
- `ee7_refuses_months_written_by_different_recorders` : deux mois dont l'un porte un autre `recorder_sha256` (bien formé) : refus au second
  mois lu, quel que soit le mois changé ; les deux changés pareil : lus. Tueur : la comparaison au premier mois retirée.
- L'aide qui écrit les manifestes synthétiques porte `pass: 1` et `empty_pages: 0`, comme l'enregistreur (hors corps de test).

`test/record-coinbase-candles.test.ts` :
- `coinbase_candles_records_both_passes_of_a_28_day_month_in_bounded_time_for_the_comparison_never_for_the_detector` : l'enfant borné
  enregistre février 2023 en passe 1 puis en passe 2 (page de témoins seuls vide, `empty_witness_pages` 1) ; le parent compare les deux
  (exit 0, 2 688 créneaux) et passe chaque dossier au détecteur : la passe 1 est lue, la passe 2 refusée (`pass`). Tueur : g1-R10.
  Ce test est vert à la base pour sa partie g1-R10 par nature (l'enregistreur ne change pas) : `red-proof` refuse un test vert à la base
  (Q-A7-11) ; il rougit à la base par le refus de la passe 2 au détecteur (m2), qui est l'usage réel des deux dossiers. Même forme que
  le test de l'enregistreur logé dans le fichier de la comparaison (W10), retournée.

Les tueurs des tests existants que le décalage des lignes de la comparaison déplace (l.139, 140, 142, 166 → +2) et celui de la l.207 du
détecteur (texte changé) sont mis à jour ; une ligne de tueur changée ne fait juger aucun test.

## Taille

Estimation : code 10 à 15 lignes, tests 120 à 160 ; sous 547 (R-25, `scripts/oracle/r25.mjs`).

## Questions pour MONARK

- **Q-PL-1** : `recorder_sha256` identique sur tous les mois lus (choix de ce lot) ; épingler `dccb218d…281e` en plus ou à la place ?
- **Q-PL-2** : `empty_witness_pages` vaut 1 seulement pour un mois de 28 ou 29 jours (relecture, « Real months ») ; la comparaison admet
  0 ou 1 pour tout mois, comme MONARK l'a écrit. Resserrer à 0 pour les mois de 30 et 31 jours ?
