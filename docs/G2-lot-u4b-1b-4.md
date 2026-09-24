# G2 — lot U-4b-1b-4 — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-23

Modèle résolu : claude-opus-5-5[1m]

# G2 U-4b-1b-4 (`30a2eee`, base `030fe06`) : **PASS-AVEC-CORRECTIONS**

Le rapport complet est dans `F:\tmp\g2-u4b1b4\G2.md` (sha256 `5b83ea0118d1454acaad9aee21f185d34a5206c7d003d16f3ad138fe7bce551d`, fichier `logs\G2.sha256`, fsyncé). Chaque mesure a son journal avec en-tête A-12 sous `F:\tmp\g2-u4b1b4\logs\`.

## Ce qui a été re-mesuré, pas relu
- **Oracle** : les 7 gates sortent à 0. Tests 949 / pass 947 / fail 0 / skip 2, avec 2 skips nommés.
- **Mutants du worker** : 25/25 tués par le test visé. Pour chacun, le sha muté et le sha restauré sont identiques à son journal. Le harnais est une copie octet, seules les deux constantes de chemin changent (vérifié par `diff`).
- **Fusion à blanc**, faite deux fois car la cible a bougé pendant la revue. Aucun conflit dans les deux cas, +16 tests à chaque fois :
  - sur `39bea22` : 937 → 953 ;
  - sur `c6dfe04`, qui contient la fusion d'U-4b-1b-3 : 951 → 967. Depuis, seuls des docs ont changé jusqu'à `b7defaf`.
- **Tailles et invariants** :
  - R-25 = **795** avec le pathspec verbatim de `ci.yml:65`.
  - A-6 : 14/14 fichiers identiques.
  - DELIVERED : 8/8 concordants sur 4 sources.
  - Export public : 329/329 fichiers, octets identiques. La modification de `export-exclude-tests.json` est nécessaire : sans elle, le test 42 rougit en TS2307, mesuré par contrefactuel.
- **Topic0 `0xb24a681c…`** : recalculé avec un Keccak que j'ai écrit moi-même, validé 27/27 contre le SHA3 d'OpenSSL.
- **Chiffres du PREREG-DELTA** : `P_ancre` = 2, 3, 5, 9, 17, 33 recalculé. La constante C-12 du test et la commande du PREREG-DELTA sont identiques au caractère près.
- **Sécurité**, testée avec des clés FACTICES :
  - `chainstack` et `helius` sont refusés avec exit 1 et 0 fetch ;
  - aucune fuite de `FAKEKEY` ;
  - OBS-3 confirmé par exécution : des caps par méthode à 1 n'ont aucun effet en keyless.
- **ERRATUM O-6 : tenu**, à préciser (item I-1) :
  - Prober : byte-exact. Base + `edits/prober.mjs` (antérieur à la coupure) donne `4ed4c31e`, le golden des 3 runs d'avant la coupure. Le fichier NUL fait 23 715 octets, comme le blob.
  - Sonde : c'est le **code** qui est byte-exact, pas les octets livrés. En inversant `trim4` sur le blob, on obtient **11 109 octets, exactement la taille du fichier NUL**. En inversant ensuite `trim3`, on obtient `1cec9b1d`, le golden d'avant la coupure. Les octets livrés (`deffbb6b`) n'ont tourné qu'après la coupure.

## Corrections (liste fermée)
Chaque correction a un test nommé et des mutants nommés. Pour chaque mutant survivant, j'ai écrit un prototype de test tueur dans un clone jetable : il est vert sur le golden et rouge sur le mutant.

| # | Nature | Contenu | Mutants à tuer | Statut |
|---|---|---|---|---|
| **C-G2-1** | code + test | `--ledger-dir` réellement requis (`u4b-probe-cutoff.mjs:83`). Mesuré : lancé hors de la racine sans ce flag, la sonde tourne (exit 0, GO) et écrit un ledger fantôme dans `<cwd>/<cycle>/`. Test : `u4b_probe_cutoff_refuses_a_missing_ledger_dir_from_any_cwd` | `MG13-ledger-dir-defaults-to-cwd` (= le golden actuel, rouge) | **bloquante avant fusion** |
| C-G2-2 | test seul | `decide(null,null)` doit donner STOP ; un scan vide doit donner un STOP nommé avec exit 3 ; borne uint32 exacte | R1, R2, R6 | avant G7 |
| C-G2-3 | test seul | `--finalized` refusé ; refus d'argument → exit 1 sans fichier ; accès à l'env sous toutes ses formes + ligne CLI `{ env: {} }` épinglée | R3, R4, R17 | avant G7 |
| C-G2-4 | test seul | Helper : prédicat vérifié clause par clause contre le scoreur, plus refus des lignes non-JSON et NUL. Les données e2 ne contiennent aucune ligne limite (0/0/0 mesuré) | R10, R11, R12, R12b | avant G7 |
| C-G2-5 | test seul | Prober : plafond effectivement consigné dans la provenance ; invariant `anchor.block >= window.from` quand les témoins ignorent `fromBlock` ; exit 3 de la CLI | R9, R13, R16 | avant G7 |

J'ai écrit 20 mutants à moi. 7 sont tués par la suite livrée, par le test visé, dont ceux qui ciblent `pre_b0_anchor_window`. Les **13 autres survivent**, et chacun est tué par son prototype. Aucun ne permet aujourd'hui un faux GO ni une lecture de clé : C-12 revérifie `c_fresh !== null`, et le refus keyless tient même quand l'env passe. `error_origin` = worker pour les cinq corrections : ce sont des affirmations du G1 qu'aucun test ne tue.

Après le pli, R-25 devrait monter à environ 880. Ça dépasse les 800 de cp-1 C-9 (non bloquante) : il faudra soit la couture PR-A / PR-B déjà prévue, soit une dérogation.

## Point de procédure (à trancher avant la fusion, item I-6)
Pendant ma revue, l'étape 1 de la course a été lancée depuis `<HEAD_E1>` = `f28a184` (commit `4c55a6d`, Sidecar 0 à 00:00:24Z). Ce commit ne contient pas `30a2eee`. La fusion de ce lot est donc déjà une D-n au sens de cp-1 C-7, et la précondition « gel d'outillage vide » du RUNBOOK (`:26`, `:100`) rougira à l'étape 2. Les outils du lot servent aux étapes 2c-bis et 5, alors que l'étape 1 n'importe aucun de ses fichiers (mesuré). Il faut choisir entre re-noter `<HEAD_E1>` par une D-n datée, ou relancer l'étape 1 après la fusion.

## Autres items et observations
- **Items à déclencheur** (détail dans le rapport) :
  - I-2 : R-1b4-1 « déclaré, non lu » n'a aucun champ dans le code ; sa seule trace possible est une ligne dans la SIDECAR de l'étape 5.
  - I-3 : trancher le §4 de l'ADDENDUM avant d'inscrire son sha, car « un morceau » et `<N_PROBE>` contredisent le code.
  - I-4 : A-13 est dépendant du contexte (mesuré : `\\b` et `\\$` sont réduits, `\\"` est conservé).
  - I-5 : étendre GARDE-FSYNC-1 aux restaurations de golden des harnais.
- **R-1b4-2 vérifié.** La sonde passe la même liste aux pools eth_call et getLogs ; tenderly ne sert qu'en repli, et une divergence donne un STOP. Le « mevblocker exclu » de `G0-lot-u4b.md:180` correspond à une dégradation mesurée au recorder U-4a, alors que les lignes figées du prereg (`:246`, `:252`) l'incluent : la sonde est alignée sur ces dernières.
- **Incident de ma part**, du même type qu'A-13 : `\\$t` a été réduit par le transport et `mk-nm.ps1` a créé un dossier parasite `F:\tmp\g2-u4b1b4$t`. Je l'ai nettoyé par `rm-nm.ps1`. `F:\Monark\node_modules` a été vérifié intact.
- **AM-2** :
  - `F:\Monark-wt-u4b1b4` est identique avant et après.
  - `F:\Monark` est passé de `7cdfb7c` à `b7defaf` : ce sont 18 commits de l'orchestrateur, aucune écriture de ma part.
  - Aucun commit créé ; le clone `merge` garde la fusion indexée, sans commit. Aucun réseau. Je n'ai pas lu le cp-2 de ce lot, pour rester indépendant.

## Fichiers
- Rapport : `F:\tmp\g2-u4b1b4\G2.md` (et `F:\tmp\g2-u4b1b4\logs\G2.sha256`)
- Journaux : `F:\tmp\g2-u4b1b4\logs\` (dont `oracle-lot\`, `oracle-merged\`, `oracle-merged2\`, `oracle-target\`, `oracle-target2\`, `mutants-worker-replay.log`, `g2-mutants.log`, `g2-mutants-2.log`, `g2-mutants-3.log`, `g2-mutants-4.log`, `o6-check.log`, `sec-probe.log`, `ledger-dir-absent.log`, `c-g2-1-proto.log`, `am2-before.log`, `am2-after.log`)
- Harnais : `F:\tmp\g2-u4b1b4\harness\`
- Prototypes jetables : `F:\tmp\g2-u4b1b4\proto\`
- Contrôles : `F:\tmp\g2-u4b1b4\o6\o6-check.mjs`, `F:\tmp\g2-u4b1b4\keccak\keccak-indep.mjs`, `F:\tmp\g2-u4b1b4\sec\`, `F:\tmp\g2-u4b1b4\docs-check.mjs`, `F:\tmp\g2-u4b1b4\export-diff.mjs`
- Clones : `F:\tmp\g2-u4b1b4\{lot,mut,merge,target}` (node_modules retirés)
