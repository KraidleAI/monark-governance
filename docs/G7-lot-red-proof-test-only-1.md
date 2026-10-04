# G7 du lot d'outil RED-PROOF-TEST-ONLY-1 : un mode `--test-only` de `scripts/red-proof.mjs` pour un lot qui n'ajoute que des épingles

- **Plan** : `docs/G0-lot-red-proof-test-only-1.md`. **Base** : `fc510e25` (tête de RED-PROOF-TAP-TRUNCATION-1, empilé sur la PR #113).
  Branche `recherches/red-proof-test-only-1`. Commits : `baff3a3` (G0), `26011bc` (tests rouges et types), `3f6c8d3` (code, premier gel),
  `e6e9309` (G7) ; pli de la G2 : `24f8e8c` (fusion `--no-ff` de la tête révisée de RED-PROOF-TAP-TRUNCATION-1, `1994b52`, qui devient
  la **base** du lot), `eb3eaf9` (tests et types), `b6f33ef` (code), `86940fe` et `9e82a42` (tests ; **gel** `9e82a42`), puis ce G7 révisé. Hôte de mesure : Linux, Node v22.22.2.

## Ce que fait le mode (gel `3f6c8d3`)

| Point du G0 | Code | Effet |
|---|---|---|
| Drapeau sans valeur, `--draw` refusé | l.215 (`--test-only`), l.220 | `--test-only --draw n` : exit 2, « --test-only fires every killer at gel: --draw does not apply » |
| Frontière de production | l.236 | tout chemin du diff (y compris non suivi, supprimé) hors `*.test.ts`, `test/`, `docs/**/*.md` ; écrit dans `files.production` dans les deux modes |
| Échec fermé | l.249, l.268, l.278 | production non vide en `--test-only` : aucun test lancé, aucune ligne, `ok: false`, exit 1, la preuve écrite et une ligne « --test-only refused: production files changed: … » |
| Vert des deux côtés | l.182 | en `--test-only`, après les refus communs (test 42, mort, sans tueur, tueur invalide, pas vert au gel) : base `pass` → `pinned` provisoire ; sinon refusé « red at base under --test-only » |
| Substitut du F2P | l.261-264 | chaque `pinned` : son tueur déclaré est tiré seul au gel (`fire`, restauration et sha256 comme le tirage, `killer-<n>.tap`) ; `killed` le garde `pinned`, `stillborn`/`invalid` le refusent (« its declared killer is … at gel: the test pins nothing it names »), `inconclusive` le rend `inconclusive` ; le tir est dans `kill` |
| Mode écrit | l.271, l.272 | `mode: "test-only"` ou `"f2p"` ; `kill: null` sur chaque ligne du mode F2P ; types dans `red-proof.d.mts` |

Le mode F2P est inchangé (mêmes lignes, mêmes verdicts ; `mode` et `files.production` ajoutés à la preuve).

## Tests (rouges à la base `fc510e25` par assertion : option inconnue, exit 2 sans preuve), tueurs

| Test | Ce qu'il fixe | Tueur (tiré, tué) |
|---|---|---|
| `red_proof_test_only_admits_a_pin_whose_declared_killer_kills_it_at_gel` | worktree au gel du dépôt fixe, un fichier de test neuf et une note `docs/` ; `--test-only` : exit 0, `ok`, `pin_ok` `pass`/`pass`/`pinned`, tir `killed`, `drawn: 0` ; sans le drapeau : refusé « green at base », `kill: null`, exit 1 | l.182 `t.base === "pass"` → `"skip"` |
| `red_proof_test_only_refuses_a_pin_whose_killer_survives` | une seconde épingle dont le tueur vise `lib/old.ts`, qu'elle n'importe pas : `stillborn`, refusée, exit 1 | l.263 `r.kill.outcome !== "killed"` → `false` |
| `red_proof_test_only_fails_closed_on_a_production_change` | le gel commit du dépôt fixe sous `--test-only` : aucune ligne, `files.production` = `lib/fresh.ts`, `lib/old.ts`, `packages/w/index.js` (la note `docs/` et les tests exclus), exit 1 ; `--test-only --draw` : exit 2 | l.249 `production.length > 0` → `false` |

Adresses des tueurs : le script gagne 9 lignes ; les 13 adresses déplacées sont réécrites par la correspondance base → gel (difflib)
et les 28 lignes `// killer:` revérifiées : **28/28**. Seules des lignes `// killer:` du test existant changent (0 autre ligne retirée) :
25 tests inchangés.

## Oracle

- `node scripts/red-proof.mjs --base fc510e25 --gel 3f6c8d32 --repo /home/user/monark-governance-rt --draw 3 --seed 37` (mode F2P, le lot
  change de la production) : **OK**, exit 0 ; 3 F2P, 25 inchangés, 3 tueurs tirés (la population), 3 tués ; `RED-PROOF.json` sha256
  `1d9279cf…`, digest `551f86a8…`, `files.production` = `scripts/red-proof.d.mts`, `scripts/red-proof.mjs`.
- Même plage avec `--test-only` : REFUSED, exit 1, « production files changed: scripts/red-proof.d.mts, scripts/red-proof.mjs » (échec
  fermé sur un vrai lot).
- `test/red-proof.test.ts` au gel : 27/28 ; l'échec est le rouge préexistant `red_proof_fails_on_a_stillborn_draw_or_an_empty_diff`
  (`vi_hangs` sous Node 22, voir le G7 de RED-PROOF-JUNCTION-1), non touché.
- `npx tsc --noEmit` vert (aussi au commit des tests) ; eslint vert sur le test ; `lint:ratchet` 69/69 ; `gate:vocab` OK ;
  `test/mutants-run.test.ts` 21/21.
- R-25 par `r25()` sur `fc510e25...HEAD` : +68/−27, **95 lignes comptées** (sous 547) ; G0 et G7 hors compte.

## Écarts au plan

- `scripts/red-proof.d.mts` (`mode`, `files.production`, `kill`, verdict `pinned`) est commis avec les tests, pour que `tsc` reste vert à
  ce commit.
- G2 neuve faite et pliée (section ci-dessous).
- Aucun vrai lot de test seul n'a été rejoué (SENTINEL-SIGTERM-LOAD-1 n'est pas écrit ; le pli de BINANCE-PRE35-1 est hors de ce dépôt
  de travail) ; à faire par le premier lot qui s'en sert.

## Questions pour MONARK

- **Q-RTO-1** : la frontière de « production » refuse aussi un lot de test qui touche `package.json`, une config eslint, un `*.d.mts` de
  types ou un fichier fixe hors `test/` : voulu (échec fermé), ou faut-il une liste d'exceptions nommées ?
- **Q-RTO-2** : `--draw` est refusé en `--test-only` (chaque tueur est déjà tiré). Les commandes de mission de la G2 et du cp-2 portent
  `--draw n --seed s` : faut-il plutôt l'accepter et l'ignorer, écrit dans la preuve ?
- **Q-RTO-3** : un test seulement **modifié** (pas neuf) est jugé de même : vert des deux côtés et tué par son tueur. Un tueur déclaré
  peut viser n'importe quelle ligne de production que le test atteint ; le mode ne prouve pas que l'épingle vise **le** comportement
  du lot, seulement qu'elle tient à la ligne nommée. Ce niveau suffit-il, ou faut-il que le G0 du lot liste les tueurs attendus ?
- **Q-RTO-4** : le choix du mode revient à l'auteur. MONARK refuse-t-il un `--test-only` quand le G0 du lot ne se déclare pas « test
  seulement » ?

## Pli de la G2 (instance neuve : CORRECTIONS REQUISES ; B-1 et B-2 bloquantes)

Rapport : `scratchpad/G2-red-proof-tools.md`. Conception révisée : section « Pli de la G2 » du G0. Code au gel `9e82a42` :
`testOnlyGate` l.214-224, verdict l.182-184, garde l.263, tir l.276-278, preuve v2 l.286, motifs l.293.

| Point | Changement | Test (rouge à la base `1994b52`) | Tueur |
|---|---|---|---|
| **B-1** : `test/h.ts` changé, importé par `scripts/rec.mjs`, passait `ok:true` | l.216 : un fichier de `test/` (hors `*.test.ts`) changé ou supprimé, dont le chemin depuis `test/` sans extension figure dans un fichier de code du gel hors frontière de test, va en production (recherche textuelle : échec fermé ; un chemin calculé lui échappe) | `red_proof_test_only_counts_a_test_file_that_production_imports_as_production` (`test/h.ts` et `packages/w/test/hw.ts` importés, `test/free.ts` non) | l.216 `production.push(p)` → `null` |
| **B-2** : un `*.test.ts` supprimé passait sans trace | l.218 : chaque déclaration d'un test supprimé ou modifié (lue à la base) absente de tous les tests du gel est nommée dans `files.removed` et refuse ; un fichier déplacé dont les tests reviennent n'est pas un retrait | `red_proof_test_only_refuses_a_removed_test_and_names_it` | l.218 `!names.has(d.name)` → `false` |
| **Q-RTO-4** : déclaration vérifiable | l.219 : un `docs/**/G0-*.md` du diff porte la ligne exacte `red-proof: test-only` (`declared`), sinon refus | `red_proof_test_only_refuses_a_lot_whose_g0_does_not_declare_it` | l.219 |
| **Q-RTO-3** : la liste des tueurs au G0 | l.183 : le tueur de chaque test doit figurer dans ce G0 sous la forme `<fichier>:<ligne> <OP> "<avant>" -> "<après>"` | `red_proof_test_only_refuses_a_pin_whose_killer_its_g0_does_not_list` | l.183 |
| **Q-RTO-3**, **m-3** : tué sans assertion | l.278 : un tir `killed` dont le statut n'est pas `assert-fail` refuse le test | `red_proof_test_only_refuses_a_kill_that_is_no_assertion_failure` (`pin_throw`, `other-fail`) | l.278 |
| **m-4** : hors des globs de `npm test` ; `{ todo: true }` | l.182 : globs lus dans `scripts.test` du `package.json` du gel (sans globs : tout refusé) ; un `todo` vert se lit `skip` au gel, donc refusé (épinglé) | `red_proof_test_only_refuses_a_pin_outside_the_npm_test_globs` ; `…_red_at_base_and_a_passing_todo` | l.182 |
| **T5**, **T6** : la règle « vert à la base » sans test | aucun code | `red_proof_test_only_refuses_a_pin_red_at_base_and_a_passing_todo` (`pin_red`, `other-fail` à la base) | l.184 `true ?` ; T5 tué aussi |
| **m-5** | schéma `red-proof-v2` (l.286), `mode` au sommet ; une preuve v1 se lit f2p ; aucun lecteur des preuves dans le dépôt | (assertions du test d'admission) | — |
| **m-6**, **T9** | l.276 : `pin-<n>.tap` par compteur ; le tirage garde `killer-<n>.tap` | `red_proof_test_only_keeps_each_kill_in_its_own_tap` (3 tirs, 3 fichiers, sha256 recalculés) | l.276 |
| **T10** | aucun code (l.250 juste) | `red_proof_test_only_fails_closed_on_a_production_change` étendu : un fichier de production supprimé | l.263 déclaré ; T10 tué |

Le dépôt fixe gagne `scripts.test` (`node --test "test/*.test.ts"`) dans son `package.json` de base (hors corps de test). Une collision de
clé de cache (`weak`, déjà prise par `weakRun`) a été corrigée par `86940fe` avant l'oracle.

Mutants rejoués à la main au gel (Node 24.21.0, fichier entier ; T1, T10, T18 à T21 rejoués sous un lanceur protégé par `setBlocking`,
le lanceur nu ayant tronqué leur sortie) : T1 à T3, T5 à T11, T13 à T21 tués ; survivent T4 et T12 (redondants, comme le dit la G2).
Neufs : T15 (globs), T16 (G0), T17 (assertion), T18 (B-1), T19 (B-2), T20 (déclaration), T21 (clé de recherche = chemin entier).

Oracle du gel `9e82a42` :
- `node scripts/red-proof.mjs --base 1994b52f --gel 9e82a42c --repo /home/user/monark-governance-rt --draw 11 --seed 37` : **OK**, exit 0 ;
  11 F2P, 29 inchangés, 11 tueurs tirés (la population), 11 tués ; `RED-PROOF.json` sha256 `d1635132…`, digest `06ab190f…`, schéma v2.
- Même plage avec `--test-only` : REFUSED, exit 1, trois motifs (deux fichiers de production, pas de déclaration au G0).
- `test/red-proof.test.ts` : 39/40 sous Node 22 (le rouge préexistant `vi_hangs`), **40/40 sous Node 24.21.0**. Un passage nu sous
  Node 22 a rendu 29 tests sur 40 : le saut 1 frappe aussi `npm test` (item NPM-TEST-FORCE-EXIT-TRUNCATION-1, G7 du lot 1).
- `tsc` vert (aussi au commit des tests), eslint vert, `lint:ratchet` 69/69, `gate:vocab` OK, `test/mutants-run.test.ts` 21/21 ;
  adresses des tueurs **40/40** (contrôleur ; l'adresse l.207 du lot 1 re-pointée en l.208 dans la fusion).
- R-25 par `r25()` sur `1994b52f...HEAD` : +151/−34, **185** (sous 547) ; depuis l'ancienne base `fc510e25` (pli du lot 1 compris) : 256.

Réponses consignées : **Q-RTO-1** frontière fermée, sans exception (plus B-1) ; **Q-RTO-2** `--draw` reste une erreur d'usage ; les
gabarits de mission G2 et cp-2 d'un lot test seulement passent `--test-only` sans `--draw` (à porter par MONARK) ; **Q-RTO-3** tir par
assertion exigé, tueurs listés au G0 et vérifiés par l'outil, la G2 juge s'ils visent le comportement nommé ; **Q-RTO-4** déclaration
`red-proof: test-only` au G0 du diff, vérifiée par l'outil.

Questions restantes pour MONARK :
- **Q-RTO-5** : m-4 n'est appliqué qu'en `--test-only` ; faut-il aussi refuser en mode F2P un fichier jugé hors des globs de `npm test`
  (`apps/site/test`, `packages/*/<sous-dossier>`) ? Cela change des verdicts existants.
- **Q-RTO-6** : la recherche B-1 est textuelle ; un import par chemin calculé lui échappe. Faut-il une liste fermée des aides de test
  importées par la production (les deux `*-builder.ts`) en plus ?

## Re-revue de la G2 (CORRECTIONS REQUISES : B-3 ; X2, X3)

Rapport : `scratchpad/G2-red-proof-tools-rr.md`. Lot 1 re-plié et fusionné (`871c542`, `--no-ff`, deux queues du fichier de test
gardées) : la **base** du lot devient `c2ccc78` (tête de RED-PROOF-TAP-TRUNCATION-1). La PR #113 n'a pas bougé sur origin (`6dd2ecb`) :
rien d'elle n'est fusionné. Commits : `9ab3059` (tests), `c7a7d27` (code, **gel**), puis ce G7.

| Point | Changement (gel `c7a7d27`) | Test (rouge à la base) | Mutant à la main |
|---|---|---|---|
| **B-3** (bloquante) : un chemin calculé échappe à la recherche (`scripts/census/u4-*.mjs` lisent `apps/sentinel/test/fixtures/ukemi/…` par `join(…, "test", "fixtures", …)`) ; un lot pouvait aussi affaiblir une aide d'assertion partagée | l.216 : sous `--test-only`, un fichier de `test/` hors `*.test.ts` **modifié ou supprimé** va en production ; seul un ajout passe, et la recherche des chemins littéraux reste pour l'ajout (un fichier que la production nomme sans l'avoir) | `red_proof_test_only_refuses_a_modified_test_support_file_and_admits_an_added_one` (modifié : refusé ; ajouté : `ok`, exit 0) ; le test B-1 vise désormais des ajouts nommés par la base | tueur déclaré l.216 tué ; B-1 (`production.push`) tué |
| **X2** : retrait dans un fichier modifié non testé ; un même nom dans un autre fichier le masquait | l.217-218 : retrait jugé par fichier ; un fichier modifié garde ses propres tests ; ceux d'un fichier supprimé doivent revenir dans un fichier ajouté (déplacement) | `red_proof_test_only_names_a_test_removed_inside_a_modified_file_even_if_another_file_reuses_its_name` | X2 (`st === "D"`) et X2b (clé partagée) tués |
| **X3** : déclaration non ancrée ; CRLF | l.219 : `/^red-proof: test-only\r?$/m` ; chaque G0 de fixture écrit la déclaration en CRLF | `red_proof_test_only_reads_the_declaration_only_on_a_line_of_its_own` (phrase citée en ligne : refus) | X3 tué ; `\r?` retiré (X3b) est **équivalent** : en JS, `$` avec `m` s'arrête déjà devant `\r` ; gardé pour la lecture |

Limite restante, déclarée : `listed` accepte le tueur n'importe où dans le texte du G0 (pas seulement dans une liste).

Contrôles au gel `c7a7d27` : `test/red-proof.test.ts` 44/45 sous Node 22 (le rouge préexistant `vi_hangs`) ; `tsc` vert (aussi au
commit des tests) ; adresses des tueurs **45/45** ; R-25 sur `c2ccc78e...HEAD` : **205** (sous 547). Mutants rejoués en place
(lanceur protégé, fichier restauré, `git status` propre).

Oracle du gel `c7a7d27` (rejoué dès que la place disque est revenue) : `node scripts/red-proof.mjs --base c2ccc78e --gel c7a7d275
--repo /home/user/monark-governance-rt --draw 14 --seed 37` : **OK**, exit 0 ; 14 F2P, 31 inchangés, 14 tueurs tirés (la population),
14 tués ; `RED-PROOF.json` sha256 `ade235a9…`, digest `cf7feb68…`. `test/red-proof.test.ts` sous Node 24.21.0 : **45/45**.

## Sortie

Prêt pour le contrôle par diff de MONARK, après RED-PROOF-TAP-TRUNCATION-1 (empilé, fusionné). Item RED-PROOF-TEST-ONLY-1 clos au
gel `c7a7d27` (pli de la G2 et de sa re-revue) ; Q-RTO-1 à Q-RTO-4 répondues, Q-RTO-5 et Q-RTO-6 ouvertes. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci`
n'est pas commis ; rien n'est poussé.
