# G0 du lot RH-1, partie 1 : six notes de relecture pliées dans la section « Retire a kata row » du RUNBOOK (N-1 à N-6)

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Plan : `docs/G0-lot-retire-latency-rehearsal-1.md` §5, §8 et §11 ;
relecture RECHERCHES `d55006f` (notes N-1 à N-6).

red-proof: test-only

## Changement

- `docs/RUNBOOK-harness.md`, section « Retire a kata row » (texte seul) :
  - N-1, étape 7 : les deux contrôles des 300 s dans le bon sens, `produced_at_stale` (passé, `kata-path.ts` l.47) et
    `produced_at_future` (futur, le test de `tools/gate.ts` l.885 ; l.886 n'est que le `throw`) ;
  - N-2, étape 7 : le `yhat` de la sonde dans `calib_support`, `out_of_support` (l.93) étant testé avant `calib_retired` (l.94) ;
  - N-3, étape 4 (réécrite au repli de la G2, constat M) : seul le clone de `--verify` est exposé à `core.autocrlf`, lu comme
    fichiers par `compareTrees` (l.222-226 ; `DIFFERENT`, exit 1, l.275-276), le dépôt de spec n'ayant pas de `.gitattributes` ;
    l'arbre de gouvernance est lu par `readFileSync` (l.185), mais son `.gitattributes` (l.2, `* text=auto eol=lf`, depuis
    `357ef25f`) garde LF quel que soit `core.autocrlf` ; le clone `previous` est lu dans les objets git (l.179, `git cat-file
    blob` l.163), et c'est lui que T0 a refusé, `input_digest` (`docs/ETAT.md` l.603 ; `docs/G7-lot-t0-followup-1.md` l.8) ;
  - N-4, étapes 5 et 6 : déployer un commit fusionné vert avec `spec-policy-tables.mjs --check` à 0 ; la conduite si la fusion
    échoue après T_d ;
  - N-5, étape 9 : le cas « indexé, non commité » (`git clean` muet, `git rm -r` refuse, mesuré) et `git restore --staged` ;
  - la valeur `publication` et le refus `instant_out_of_cycle`, en une phrase marquée « AFTER #218 » : #218 n'est pas dans la base.
- `test/runbook-retire.test.ts` (N-6) : T_d avant T_e (« merges it after T_d, never before ») ; les refus et codes de sortie de
  `retire-latency.mjs` lus dans le script et rejoués ; `--out` de la publication et du déploiement ; la portée des commandes de
  refonte (`git rm -r -- spec/contract-1.1.0-tables-<YYYY-MM-DD>`, une seule) ; les refus cités de `spec-publish.mjs` et la sortie
  2 de `--check --date`. Chaque épingle porte sur un texte présent à la base : les cinq tests y sont verts.

## Repli de la G2 (2026-10-07)

Ligne datée 2026-10-07T06:09:47Z (`date -u`), RECHERCHES, modèle `claude-opus-5-5`. Actes git : `git fetch` à refspecs explicites
de `recherches/rh-1-runbook-notes` (`386ee07f`), `recherches/rh-1-probe-instants` (`8cf2482e`), `lot/etude-suite` (`acbaeb52`) et
`recherches/rh-3-publication-cycle` (`998c2e30`), vérifiés par `git ls-remote` ; un commit neuf sur `recherches/rh-1-runbook-notes`,
sans amend ni force ; `git merge-tree` contre `998c2e30` (#218), sans écriture de ref. Constats vérifiés à la source avant repli :
- M (N-3) : réécrit comme ci-dessus, phrase exacte du relecteur. Rejoué : un clone `--shared -c core.autocrlf=true` de cet arbre
  donne 0 fichier `w/crlf` (`git ls-files --eol`) ; `gh api repos/KraidleAI/monark-kata-spec/contents/.gitattributes` répond 404.
- m-1 (épingles du texte neuf) : quatre tests neufs, plus le test 4 étendu. Ils lisent la valeur attendue dans le code
  (`kata-path.ts` l.47 et `tools/gate.ts` l.885 pour le sens des deux refus d'horloge ; l'ordre `out_of_support` puis
  `calib_retired` de la branche d'échelle de `kata-path.ts` ; `.gitattributes`) et tiennent sur chaque phrase de la section qui
  porte l'affirmation. Le texte de base n'en porte aucune : ils y sont verts, et le lot reste test-only (`red-proof`, verdict
  « pinned »). Limite déclarée : la suppression pure d'une de ces phrases n'est pas rouge (rien ne l'exige à la base).
- m-2 : le test 2 exige que la liste « Exit 1 » égale l'ensemble des codes `no("…")` du script, et refuse « AFTER #218 » dès que
  le script lève `instant_out_of_cycle`. La phrase « AFTER #218 » reste telle quelle (ordre de fusion : #218 avant #223).
- m-3 (N-5) : la raison devient « `git rm -r -f` would remove it with no dry run first » (`git rm` imprime chaque chemin) ; le cas
  indexé cite `git clean -n -d -- <dir>/` et `git rm -r -- <dir>` portés, puis `git clean -n -d`, puis `-f -d`, portés et avec
  `-d`. Le test 4 capture toute commande `git clean|rm|restore` entre backticks et exige la portée `-- <dir>` (seul `git rm -r -f`,
  le contre-exemple, est excepté par son nom) et `-d` à chaque `git clean`. Rejoué dans un dépôt jetable : `git rm -r` refuse
  (« changes staged in the index »), `git rm -r -f -n` imprime `rm '…'`, `git clean -n` sans portée liste un autre fichier.
- m-4 (N-4) : « Merge the trunk into the lot branch, never rebase it (T_b and T_c are read on its commits) » ; `--check` prouve
  le fichier du dossier sous `spec/`, la publication est prouvée par le `--verify` de l'étape 4.

## Tueurs (les lignes du RUNBOOK bougent au repli de la G2 : 370 devient 372, 411 devient 414, 364 devient 366 ; 300 reste)

- docs/RUNBOOK-harness.md:372 CONST "(T_e)" -> "(T_f)"
- docs/RUNBOOK-harness.md:414 CONST "\"format\": \"retire-latency-v1\"" -> "\"format\": \"retire-latency-v2\""
- docs/RUNBOOK-harness.md:300 CONST "apps/harness/data/kata/retire/" -> "apps/harness/data/retire/"
- docs/RUNBOOK-harness.md:445 CONST "`git clean -f -d -- spec/contract-1.1.0-tables-<YYYY-MM-DD>/`" -> "`git clean -f -d`"
- docs/RUNBOOK-harness.md:366 CONST "`short_digest`" -> "`short_digests`"
- docs/RUNBOOK-harness.md:400 CONST "in the past is `produced_at_stale`" -> "in the past is `produced_at_future`"
- docs/RUNBOOK-harness.md:404 CONST "`out_of_support` (`kata-path.ts` l.93)" -> "`calib_retired` (`kata-path.ts` l.93)"
- docs/RUNBOOK-harness.md:358 CONST "`git -c core.autocrlf=false clone`" -> "`git -c core.autocrlf=true clone`"
- docs/RUNBOOK-harness.md:380 CONST "never rebase it" -> "rebase it"

## Suite

La partie 2 (`recherches/rh-1-probe-instants`, empilée sur celle-ci) livre RETIRE-PROBE-1 et RETIRE-INSTANTS-1 et cite leurs
commandes aux étapes 7 et 8.
