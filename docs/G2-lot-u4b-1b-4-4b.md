# Re-G2 micro-pli U-4b-1b-4b (206bc56) — relecteur claude-opus-5-5, 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

# RE-G2 micro-pli U-4b-1b-4b (`206bc56`, parent `30a2eee`) : **PASS**

Les cinq corrections de ma G2 sont pliées et prouvées, et il n'y a aucune correction nouvelle. Le rendu est dans `F:\tmp\g2-u4b1b4\G2-4b.md` (sha256 `be66326a0594ee531ad9dae0fd0c69681de6b6e08be8060c3fd5d44969d8031d`, fichier `logs\G2-4b.sha256`, fsyncé). Chaque mesure a son journal avec en-tête A-12 sous `F:\tmp\g2-u4b1b4\logs\`.

## Mesures refaites
- **Le correctif est mon prototype, octet pour octet.** Le diff de code est un seul hunk (`u4b-probe-cutoff.mjs:83-85`), la chaîne de mon prototype y apparaît une fois, et le blob a pour sha `8bdb1478…`, le `fixed_probe` de ma G2. Il refuse un `--ledger-dir` absent comme vide.
- **D-4 tenu.**
  - Les 10 lignes retirées des tests sont toutes remplacées par une forme égale ou plus forte.
  - Nombre d'assertions : 67 → 78 et 60 → 76 ; nombre de tests : 12 → 13 et 10 → 12.
  - Le plafond par défaut (6) et le plafond passé en argument (3) sont tous les deux assertés.
- **Les exigences vérifiées dans le code** :
  - la ligne CLI `{ env: {} }` est épinglée ;
  - l'accès à l'env est vérifié sous 5 formes, la cinquième étant un ensemble fermé de membres de `process`, ce qui attrape aussi un alias ;
  - le helper est vérifié clause par clause sur trois copies de la ligne e2 réelle, chacune fausse sur une seule clause, en comparant avec les lectures du scoreur gelé ;
  - l'invariant `anchor.block >= window.from` est asserté quand les deux témoins ignorent `fromBlock`.
- **Oracle** sur `206bc56` : les 7 gates sortent à 0, avec **952 / 950 / 0 / 2**.
- **Harnais de 39 mutants du worker**, recopié octet pour octet, seuls `TREE` et `TMPF` changent (`diff` vérifié) :
  - AVANT, sur `30a2eee` : les 13 survivent, et MG13 est le golden lui-même ;
  - APRÈS : **39/39 tués par le test visé**. Pour chacun des 39, verdict, `byIntended` et shas muté/restauré sont identiques au journal du worker.
- **Mon propre harnais**, indépendant de celui du worker : **26/26 tués par le test visé**.
  - Les 7 mutants de ma G2 que le worker n'a pas repris (R5, R7, R8, R14, R15, R18, R19) sont toujours tués.
  - 5 mutants nouveaux visent le pli (R20, R22 à R25) : tous tués.
  - Recopie « verbatim » des 14 prouvée sans le script du worker : le sha muté est le même des deux côtés pour les 14. Celui de MG13 vaut `deffbb6b`, c'est-à-dire exactement l'ancienne sonde.
- **Export réel** : 330 fichiers de chaque côté, `diff -r` vide, manifeste identique (`aae95266…`).
- **A-6 et R-25** : A-6 à 14/14. R-25 cumulé à **903** : le ruling (≤ 1 150) s'applique, et le plafond CI est 1 205.
- **Fusion à blanc** sur `origin/lot/etude-suite` = `fad24ab`, qui contient A-9, 1b-3 et HARNESS-DESC-1 :
  - 0 conflit, 0 fichier en commun avec la cible ; les 9 fichiers gelés et le prereg gardent leur sha dans l'arbre fusionné ;
  - cible seule 958 / 956 / 0 / 2, fusion **977 / 975 / 0 / 2**, soit +19 = 16 (G1) + 3 (pli) ; les 19 noms de tests passent ;
  - compte attendu dans `F:\Monark` après fusion, où les artefacts e2 sont présents : **977 / 976 / 0 / 1**.

## Items
- **I-6 tranché** : `<HEAD_E2>` = fusion de ce lot + STATS-1. J'en prends acte.
- **Épinglages à faire au G7** (déjà prévus par le worker et dans `ETAT-REPRISE.md:94`) :
  - la ligne 0.6 du RUNBOOK du dépôt épingle encore le prober à `a2b39d0e` (`RUNBOOK…:94`) : elle doit passer à `4ed4c31e`, et il faut y ajouter la sonde `8bdb1478` (et non `deffbb6b`) ;
  - l'ADR-amendement doit porter R-25 = 903.
- **I-7 (nouveau)** : le scan D_e du prober (code du lot -1b-2, `u4-oracle-path.mjs:226-237`) ne filtre pas les journaux par `[B0, B_last]`. Ce n'est pas introduit par ce lot, et le quorum l'atténue : un seul témoin fautif donne un désaccord, donc un STOP. Il faut un filtre + un test + un mutant au prochain lot qui touche le prober.
- **I-4 appuyé** : le worker a mesuré une récidive A-13 dans la prose de son rendu.
- **Observation sans item** : `decide(undefined, undefined)` rend GO mais c'est inatteignable, et R24/R25, les deux voies qui le rendraient atteignable, sont tués. Si on ajoute une ceinture, elle doit aller à la fois dans `decide` et dans le contrôle C-12.

## AM-2
- `F:\Monark-wt-u4b1b4` est identique avant et après.
- `F:\Monark` a pris 1 commit de l'orchestrateur, docs seulement. Les fichiers non suivis de l'orchestrateur ont seulement été hachés, jamais affichés.
- Les `node_modules` des 4 clones sont retirés. Le clone `merge` garde la fusion indexée (`--no-commit`), aucun commit n'a été créé.
- Jamais ouverts : `F:\course-ukemi` et `F:\course-bell`. Aucun réseau.
- Je n'ai pas lu le re-cp-2, pour rester indépendant.

Fichiers :
- `F:\tmp\g2-u4b1b4\G2-4b.md`
- `F:\tmp\g2-u4b1b4\logs\` (dont `4b-mutants-before.log`, `4b-mutants-after.log`, `4b-g2-mutants.log`, `4b-verbatim-14.log`, `oracle-lot4b\`, `oracle-merged4b\`, `oracle-target4b\`, `4b-export-real.log`, `4b-a6-r25.log`, `4b-merge-dry-run.log`, `4b-d4.log`, `am2-after-4b.log`)
- `F:\tmp\g2-u4b1b4\harness\mutants-4b-replay.mjs`, `F:\tmp\g2-u4b1b4\harness\g2-mutants-4b.mjs`
