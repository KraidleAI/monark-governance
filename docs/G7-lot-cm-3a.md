# G7 du lot CM-3a : moteur, première moitié (E-8, E-4, E-5, E-12, E-9, E-6)

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` §3 (CM-3 sans différence servie), R-2, R-3. Plan : `docs/G0-lot-cm-3a.md`.
- **Base** : `2abe801` (branche `recherches/cm-3a`). Commits : `f0deeeb` (G0), `20564c3` (tests rouges), `4e726c4` (code), `ee1c184` (G7) ; corrections de la G2 : `ecd3a0c` (tests, G0), `24c6a27` (code, **gel**).

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

Rejeu indépendant de 430 appels (octets identiques), E-5 exact sur 30 000 rangs, E-9 égal sur 7 245 points. Corrections : E-12 sous l'amendement A-1 (`spendIndex` = h + 1, h les recalibrations non exemptées, défaut `attempt`, entier dans 1..`attempt`) ; E-6 sur scores non binaires (score au-dessus de `silenceAt` refusé, `calibMisses` compté aux scores de `silenceAt` seulement en silence) ; note pour CM-4 au G0 (`misses` lu dans `calibMisses`, jamais dans `kObs`) ; borne du test de temps à 4 s.

## Oracle (après la G2)

- `red-proof --base 2abe801 --gel 24c6a27 --repo /home/user/monark-governance-cm3 --draw 8 --seed 21` : **OK**, 7 jugés F2P, 7 tueurs tirés, 7 tués. Moteur 73/73, harnais 127/127 (rejeu épinglé `b891dcab…` inchangé), `tsc`, eslint, `gate:vocab`, `lint:ratchet` 69/69 verts. R-25 : +467/−15, **482 lignes**.

## Oracle (avant la G2)

- `node scripts/red-proof.mjs --base 2abe801 --gel 4e726c4 --repo /home/user/monark-governance-cm3 --draw 8 --seed 9` : **OK**, 7 tests jugés F2P (rouges par assertion à la base, verts au gel), 7 tueurs tirés (tous ceux du lot), 7 tués.
- `npx tsc --noEmit`, eslint sur les fichiers changés, `gate:vocab`, `lint:ratchet` 69/69 : verts.
- `node --test` : `packages/hikae/test` 73/73 (67 → 73) ; `apps/harness/test` 127/127 (126 → 127).
- `npm test` : 1 961 tests, 1 927 verts, 22 ignorés, 12 échecs, tous tolérés : `bell-served.test.ts:153` (clone superficiel), les 10 rouges des surfaces MONARK de CM-2b, et le test 42 (`export_public_no_governance_no_french`) : son CI exporté rougit sur `sentinel_run_releases_chainstack_lock_on_sigterm` sous charge ; ce test passe seul dans le dépôt (2 sur 2) et ne touche aucun fichier du lot.
- R-25 : 9 fichiers, +434/−15, soit **449 lignes comptées**, sous la borne locale de 547 et sous 1 150.

## Rejeu servi

111 appels de `runGate` (USDe clé commise et autre clé, α imposé violé ; liq s0 à s3 ; cascade ; BYO interval et set, scores négatifs et infinis compris ; budget, tau, `tauInterval`, horloge variés ; refus avec code et message), sérialisés : sha256 `b891dcab1b8cb40ca44c60d7dc16f641987aa43df0fab64be09340152181d238` à `2abe801` (mesuré avant le code, et repassé par l'exécution de base de `red-proof`, qui franchit l'assertion du rejeu avant de rougir sur NaN) et au gel. Le rejeu atteint `commit`, `defer`, `abstain` et des 400. Épinglé dans `apps/harness/test/served-replay-cm3.test.ts`.

## Changements

- **E-8** : garde `Number.isFinite` sur les six champs dans `decide()`, `abstain` / `non_evaluable`, après ŷ et `upstream_timeout`. Servi inchangé (les valeurs non finies sont refusées en amont).
- **E-4** : `scoresInDomain` (`finite`, `band`), appelé par les points d'entrée neufs ; `splitQuantile` et `riskControlQuantile` inchangés.
- **E-5** : `splitRankExact`, `splitQuantileExact` (rang entier, α décimal, comparateur à trois voies, domaine). Les 112 valeurs de n < 5 000 à α 0,45 : rang exact au neuf, rang flottant gardé au servi (épinglé).
- **E-12, E-6** : `riskControlRow` : delta de test `spendDelta(base, attempt)` rendu avec l'essai ; `calibMisses` et `silence`, sans `missBound` en silence (n 728, 306 erreurs : `calibMisses` 306, pas de borne ; la base lisait 0 et 0.4499257).
- **E-9** : k* en une passe ; égal à l'ancien calcul sur la grille (n 0 à 160, sept α, trois δ) ; n 4 368, α 0,45 : **8,67 s → 0,017 s**.
- Tueurs ré-ancrés (ligne seule) dans trois fichiers, chacun vérifié tué à la main.

## Autocontrôle

Aucun fichier de `schemas/**`, `packages/contracts/**`, `apps/site`, `apps/dojo`, `apps/bell`, `skills/**`, `fixtures/**` touché. Commentaires et code en ASCII anglais. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` présent dans l'arbre de travail avant le lot n'est pas commis.

## Écarts au dessin

- E-12 par une fonction neuve plutôt qu'une option de `riskControlQuantile`, pour la laisser octet pour octet (R-2, tueurs ancrés).
- `silence` ici = région égale à tout l'espace des labels (q̂ ≥ `silenceAt`) ; le silence des contrôles de runs reste à l'import (CM-4).
- Le test E-9 lit l'horloge (borne de 1,5 s, marge d'environ 80).

## Suite (CM-3b)

E-1 avec S-4 côté moteur, E-2 (dans `hikae`), E-13/S-9 (contrat gelé : proposé en amendement daté, pas codé, R-3), S-13, raisons écrites d'E-10 et d'E-14.

## Sortie

Prêt pour la G2 par une instance neuve. Aucun déploiement (CM-3 ne change rien au servi).
