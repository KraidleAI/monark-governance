# G0 du lot RH-1, partie 1 : six notes de relecture pliées dans la section « Retire a kata row » du RUNBOOK (N-1 à N-6)

RECHERCHES, 2026-10-07. Base `177b5755` (lot/etude-suite). Plan : `docs/G0-lot-retire-latency-rehearsal-1.md` §5, §8 et §11 ;
relecture RECHERCHES `d55006f` (notes N-1 à N-6).

red-proof: test-only

## Changement

- `docs/RUNBOOK-harness.md`, section « Retire a kata row » (texte seul) :
  - N-1, étape 7 : les deux contrôles des 300 s dans le bon sens, `produced_at_stale` (passé, `kata-path.ts` l.47) et
    `produced_at_future` (futur, le test de `tools/gate.ts` l.885 ; l.886 n'est que le `throw`) ;
  - N-2, étape 7 : le `yhat` de la sonde dans `calib_support`, `out_of_support` (l.93) étant testé avant `calib_retired` (l.94) ;
  - N-3, étape 4 : `core.autocrlf` nomme les arbres exposés, l'arbre de gouvernance lu par `readFileSync` (l.185) et le clone
    de `--verify` comparé par `compareTrees` (l.222-226) ; le clone `previous` est lu dans les objets git (l.178) ;
  - N-4, étapes 5 et 6 : déployer un commit fusionné vert avec `spec-policy-tables.mjs --check` à 0 ; la conduite si la fusion
    échoue après T_d ;
  - N-5, étape 9 : le cas « indexé, non commité » (`git clean` muet, `git rm -r` refuse, mesuré) et `git restore --staged` ;
  - la valeur `publication` et le refus `instant_out_of_cycle`, en une phrase marquée « AFTER #218 » : #218 n'est pas dans la base.
- `test/runbook-retire.test.ts` (N-6) : T_d avant T_e (« merges it after T_d, never before ») ; les refus et codes de sortie de
  `retire-latency.mjs` lus dans le script et rejoués ; `--out` de la publication et du déploiement ; la portée des commandes de
  refonte (`git rm -r -- spec/contract-1.1.0-tables-<YYYY-MM-DD>`, une seule) ; les refus cités de `spec-publish.mjs` et la sortie
  2 de `--check --date`. Chaque épingle porte sur un texte présent à la base : les cinq tests y sont verts.

## Tueurs (les lignes du RUNBOOK bougent : 366 devient 370, 399 devient 411 ; 300 reste)

- docs/RUNBOOK-harness.md:370 CONST "(T_e)" -> "(T_f)"
- docs/RUNBOOK-harness.md:411 CONST "\"format\": \"retire-latency-v1\"" -> "\"format\": \"retire-latency-v2\""
- docs/RUNBOOK-harness.md:300 CONST "apps/harness/data/kata/retire/" -> "apps/harness/data/retire/"
- docs/RUNBOOK-harness.md:441 CONST "git rm -r -- spec/contract-1.1.0-tables-<YYYY-MM-DD>`" -> "git rm -r -- spec/`"
- docs/RUNBOOK-harness.md:364 CONST "`short_digest`" -> "`short_digests`"

## Suite

La partie 2 (`recherches/rh-1-probe-instants`, empilée sur celle-ci) livre RETIRE-PROBE-1 et RETIRE-INSTANTS-1 et cite leurs
commandes aux étapes 7 et 8.
