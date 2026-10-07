# G7 de SHORT-DIGEST-INVERSION-1 (partie unique) : le plancher exact des digests 0/1, dans la porte et dans la garde

- **Base** : `5348b9d2`. **PR** : #215, branche `monark/short-digest-floor-1`, tête `c4dbfc56` (deux commits : `f6c2638e`, le G0 à
  l octet de `60216cbe`, blob `7911a589` ; `c4dbfc56`, le lot). **Fusion au tronc** : `c318aa54`, tronc avant fusion `07b7fc20`.
- **G0** : `docs/G0-lot-short-digest-inversion-1.md` (§1 à §9, puis §10 et annexe B pour la construction). **Runtime** : Node 24.21.0
  (win32).
- **Décisions** : RECHERCHES, Q-1 à Q-10 (`4e27ba3`, sha256 `9da1fc2d…`) ; Q-11 et Q-12 (`82e61e8`).
- **Construction** : worker `claude-opus-5-5` (effort max). MONARK a relu le diff entier et refait les preuves (double comptage, borne
  de l union, forme close des runs). Il a demandé deux reprises, faites par le même worker :
  - f part de 1 quand les deux digests sont publiés et diffèrent ;
  - l effet sur la vague 1 est mesuré, non argumenté.

## Ce que le lot livre

- `apps/harness/src/policy-digest-floor.ts` (nouveau, pur) : le nombre exact, en entiers, des suites 0/1 compatibles avec ce que
  publie une ligne `sign-set`. Une ligne sous 2^128 est refusée, comme un digest de suite non dite.
  - Côté `down` : un double comptage sur les plats non publiés, de 0 à 34. f vaut 0 seul quand les digests sont égaux, et part de 1
    quand ils diffèrent.
  - À qhat 0 : la borne de l union.
- `scripts/spec-publish.mjs` (`tableRowProblems`) et `apps/harness/src/policy-guard.ts` (`guardKataRow`) appliquent la même règle
  (Q-4). Les fixtures de synthèse du fichier de vecteurs sont dispensées de cette seule règle (Q-9).
- La règle est plus stricte que le §4.1 du G0 (écart E-2) : Q-6 n est pas montrée en une ligne, et la borne de 34 plats couvre chaque
  f explicitement. C est la seconde branche que RECHERCHES avait ouverte.

## Vérification et G2

- **G2 de RECHERCHES : APPROUVE** (`82e61e8`).
  - Les sept points de la preuve sont refaits de leur côté : scores, union à qhat 0, labels à qhat 0, f = 0, côté `up`, minimum sur
    f, `runsOutcomeCount`.
  - La plage de f est confirmée, ainsi que la place de la clause, avant `if (dir) return;`.
  - E-1, le registre de synthèse réécrit en place, est accepté.
  - `node --test test/short-digest-floor.test.ts` donne 13 sur 13.
  - Ils n ont pas rejoué la mesure de la vague 1 (registre hors de l arbre) ; la mesure de MONARK fait foi.

## Mesures

- **Vague 1** (registre `811fcd57…`, lu seul, jamais copié ; `wave1-floor.mjs`, `0dc69e43…`, pièce
  `recherches:coordination/pieces/2026-10-07-plancher-vague-1/`). Mesure du worker, puis rejouée par MONARK à 01:1x UTC :
  - 280 lignes, 32 classes ;
  - 28 tables publiables ; retenues bnb, btc, eth et sol-dir-4h, soit 29 lignes sous le plancher ;
  - plus petite borne d une dir-1h : 2^343,25 (sol-dir-1h).
- **red-proof** contre `5348b9d2` (`--draw 14 --seed 47`) : 14 tests jugés (1 F2P, 13 sur module nouveau), 14 tueurs tirés et tués.
  13 mutants à la main, tués par assertion.
- **Énumération** : les comptes sont tenus à `runsLowerTailLeq` par énumération complète jusqu à 14 points, et à la frontière de rejet
  jusqu à 1 254 points. Les bornes sont tenues contre chaque suite jusqu à 12 points, soit 5 448 cas.
- **Rejeu Windows sur le tronc** (fusion `c318aa54`) : 101 tests verts. Ce sont le plancher, `policy-guard`, `kata-path`,
  `policy-retire` et `ci-gates`. S y ajoutent les tests de la spécification, 53, dont 52 verts et 1 sauté sous win32.
- **Oracles** :
  - G1 sur `c4dbfc56` : sortie 0 (record `5463028a…`) ;
  - G7 sur la fusion `c318aa54`, base `07b7fc20` : sortie 0 (record `ef3ef079…`).
- **CI** : 11 sur 11 sur `c4dbfc56`. **R-25** : 389, sous 1 205.

## `error_origin`

- **Générateur (MONARK)** : l écart E-2 est voulu et approuvé. Avant la reprise, f = 0 était compté quand les digests diffèrent : une
  borne inutilement stricte, sans effet sur la vague 1, trouvée par MONARK à la relecture.
- **Orchestrateur (MONARK)** : aucun.

## Items formés (ETAT)

- Repris du G0 (§8) : DIR-4H-DIGEST-COMMIT-1, E2A-DIGEST-FLOOR-TEST-1, VERIFIER-REPORT-DIGESTS-1, FLAT-CAP-NEXT-WAVE-1,
  DIGEST-FLOOR-ATTACKER-COST-1.
- Nouveaux :
  - DIGEST-FLOOR-FLAT-EXACT-1 (PAROXYSME, §10.6) ;
  - BAND-AUX-DIGEST-W2-1 (Q-11) ;
  - SHORT-DIGEST-SPEC-TEXT-1 (Q-8 et Q-12) ;
  - SHORT-DIGEST-RELEASE-NOTE-1 (Q-7).
- **Branchement** : la règle est « upcoming » jusqu au chargeur d E-2a (E2A-DIGEST-FLOOR-TEST-1, le test de composition sur le
  registre réel).
