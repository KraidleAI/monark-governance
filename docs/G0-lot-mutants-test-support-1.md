# G0 du lot d'outil MUTANTS-TEST-SUPPORT-1 : un module d'appui de test déclaré peut porter des tueurs

- **Rattachement** : item MUTANTS-TEST-SUPPORT-1 de `docs/ETAT.md` (l.379-383, mesuré le 2026-10-03 au G1 de L2-P1-a1) ; décision
  de l'orchestrateur sur Q-1 du G1 de P1-a1 (`docs/G0-partie-l2-p1.md`, l.604-609, option (A)) ; Q-CORR-2 de LOOPBACK-PORTS-1
  (`docs/ETAT.md` l.391-392 : table de 13 lignes rejouée à la fusion de ce lot). Zone ouverte par MONARK : `scripts/mutants/`,
  `scripts/red-proof.mjs`, `scripts/oracle/` et leurs tests.
- **Base** : `5803d966` (`origin/lot/etude-suite`, tronc, fusion de LOOPBACK-PORTS-1). Branche `recherches/mutants-test-support-1`,
  worktree `/home/user/monark-governance-mt`. Auteur : RECHERCHES. Hôte : Linux, Node v24.21.0. Aucun réseau.
- **Hors lot, dit** : l'item RED-PROOF-JUNCTION-1 (`docs/ETAT.md` l.686-690, « le prochain lot de l'outil (avec
  MUTANTS-TEST-SUPPORT-1) ») est déjà porté par la PR #113 (`recherches/red-proof-junction-1`), sur laquelle sont empilés
  RED-PROOF-TAP-TRUNCATION-1 et RED-PROOF-TEST-ONLY-1. Le reprendre ici doublerait #113 et ses conflits : il n'est pas inclus.

## Le défaut, mesuré à la base

Les deux outils refusent par construction tout tueur dont le fichier est sous `test/` :

- `scripts/mutants/run.mjs` l.47 (`TEST_CODE = /(^|\/)test\/|\.test\.ts$/`) et l.123 (`lostOf`) : « is test code: a mutant mutates
  production code », ligne `anchor-lost` ;
- `scripts/red-proof.mjs` l.54 (`killerProblem`) : « invalid killer: … is test code: a killer mutates production code », test refusé.

Rejeu à la base sur P1-a1 (`origin/lot/l2-p1-a1` `f5596bf3`, base du lot `45e7a112`, clone `--no-local`) :

- `run.mjs --killers` : **0 tué sur 8**, K1 à K8 `anchor-lost` (`RESULTS.json` sha256 `7493d58f6fc47aec…`) ;
- `red-proof.mjs --draw 3 --seed 37` : REFUSED, 8 jugés, 8 « invalid killer » ;

ce que le G1 de P1-a1 avait vu (« campagne 0 tué sur 8 », réserve Q-1 du commit `f5596bf3`).

## Où vit la convention du tueur

`grep -i killer` sur `docs/` : la convention elle-même n'est écrite dans aucun document ; ADR-METHODE-2 D2 (l.22) dit seulement
« chaque test nomme la mutation qui le rougit (killer, journal G1) » ; la forme fermée vit dans l'en-tête de `scripts/red-proof.mjs`
(l.18-24, « KILLER CONVENTION (closed) » : `<file> is repo-relative production code (never *.test.ts nor under test/)`), que
`scripts/mutants/run.mjs` lit par `parseKiller`. L'amendement daté est donc écrit aux deux places : une ligne datée dans la case D2
d'ADR-METHODE-2, et la phrase de l'en-tête de `red-proof.mjs` réécrite en place.

## Conception

**Déclaration** : un module d'appui est déclaré par un fichier de test qui l'**importe** ; aucune ligne neuve n'est demandée aux lots
(P1-a1 se rejoue tel quel). Un fichier sous un répertoire `test/` est mutable si et seulement si :

1. ce n'est **jamais** un `*.test.ts` (le refus reste, même importé, même hors `test/`) ;
2. il est importé directement :
   - **red-proof** : par le fichier de test qui porte le tueur, par un `import` statique à spécificateur relatif (`./x.ts`,
     `../helpers/x.ts`), `import type` exclu (une mutation n'y change rien à l'exécution) ;
   - **mutants** : par un fichier de test de la suite (les motifs `*.test.ts` de `package.json`), les importeurs directs de
     `targetsOf` (même graphe que les cibles) ; cela couvre les tueurs (`--killers`, dont le fichier de test l'importe) et les
     lignes de table (la table de 13 lignes de LOOPBACK-PORTS-1 mute `test/helpers/loopback.ts`, qu'importent ses fichiers de test).

Un fichier sous `test/` qu'aucun test n'importe directement reste refusé, avec le message inchangé (« is test code »).

**Contrainte de voisinage** : trois lots non fusionnés changent `scripts/red-proof.mjs` (#113 et sa pile). Le lot reste local :
aucune ligne ajoutée ni retirée dans le corps de `red-proof.mjs` avant sa fin (les 16 adresses `// killer: scripts/red-proof.mjs:<n>`
de `test/red-proof.test.ts`, que la pile réécrit, restent justes), l'aide `supportOf` est une déclaration de fonction ajoutée en fin
de fichier (hissée) ; dans `run.mjs`, les changements sont faits en place (les 43 adresses de `test/mutants-run.test.ts` restent
justes). `test/red-proof.test.ts` n'est pas touché : les cas de red-proof vont dans un fichier neuf, ceux de mutants à la fin de
`test/mutants-run.test.ts` (que la pile ne touche pas).

## Tests (rouges à la base par assertion), tueurs

- `red_proof_admits_a_killer_on_a_support_module_its_test_file_imports` (fichier neuf `test/red-proof-support.test.ts`) : dépôt fixe,
  un module d'appui `test/place.ts` et son test qui l'importe, tueur sur `test/place.ts` ; `--draw` : la ligne est admise
  (`new-module`), le tueur tiré est `killed`, exit 0. Tueur : la condition « importé par son fichier de test » remplacée par vrai.
- `red_proof_still_refuses_a_test_file_or_an_unimported_module_under_test` : tueur sur un `*.test.ts` hors `test/`, et sur un
  `test/stray.ts` que le test n'importe pas : refusés « is test code ». Tueur : la clause `*.test.ts` retirée.
- `mutants_a_killer_or_a_row_mutates_a_support_module_a_test_file_imports` (`test/mutants-run.test.ts`) : `--killers` et une ligne de
  table sur le module d'appui : tués. Tueur : la clause « importeur direct » de `lostOf` retirée.
- `mutants_still_refuse_a_test_file_or_an_unimported_module_under_test` : lignes de table sur un `*.test.ts` et sur un module sous
  `test/` sans importeur : `anchor-lost` « is test code ». Tueur : la clause `*.test.ts` retirée.

## Taille

Attendu : code ≈ 10 lignes changées dans les deux outils, tests ≈ 60 ; docs hors compte (`docs/**/*.md`). Bien sous 547.

## Suite

Gel, red-proof du lot sur lui-même (`--draw`, `--seed 37`), puis rejeu de la campagne de P1-a1 par l'outil du gel (`--killers`) et
de sa preuve red-proof. La table de 13 lignes de LOOPBACK-PORTS-1 n'est pas dans le dépôt (journal de MONARK) : rejouée par MONARK
à la fusion de ce lot.
