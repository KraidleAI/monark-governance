# G7 - lot R25-INTEGRATION-RULE-1 (R-25 ne compte que le neuf d une PR d intégration prouvée)

- **Session** : RECHERCHES, 2026-10-05. **Branche** : `recherches/r25-integration-rule-1`, depuis le tronc `lot/etude-suite` @ `ab8084fb` (le tronc n a pas bougé pendant le lot : pas de fusion de synchro).
- **Commits** : G0 `94de83b8` ; tests rouges `600478e4` ; gel `5d310f48` ; ce G7 (commit suivant).
- **Réponses de MONARK** : Q-1 à Q-10 sans réponse au moment du gel. Le lot suit les défauts du G0 : Q-1 `base/<nom>` en grammaire fermée ; Q-3 preuve = fusionnée dans `L` + `r25-taille-de-lot` vert sur la tête exacte ; Q-4 `min(W, NEW)` ; Q-5 #56 et #89 ne prouvent rien ; Q-6 `--remerge-diff` brute ; Q-9 ni `pull_request_target` ni juge pris sur la cible ; Q-10 accepté. Q-2 : voir section 3.
- **Statut** : gel complet (module, câblage CI, câblage oracle, tests). Aucune PR ouverte. Le lot reste une PR écrite vers le tronc (E-7).

## 1. Ce que le lot livre

| Fichier | Rôle | R-25 (ins+del) |
|---|---|---|
| `scripts/lot-size-integration.mjs` (neuf) | implémentation unique : `L`, `EXCEPTED_PRS`, `GATE_FILES`, `isCandidate`, `proves`, `provenSet`, `specsOf`, `effective`, `buildProof` ; CLI `proof` et `count` | 138 |
| `scripts/lot-size-integration.d.mts` (neuf) | surface de types pour le test racine | 11 |
| `scripts/oracle/r25.mjs` | `r25(clone, ciText, base, proofFile)` lance la commande `count` du module **du clone figé**, champs `mode` et `proof` | 23 |
| `scripts/oracle/run.mjs` | drapeau `--r25-proof <fichier>` (absent : refus 2), part `r25_proof` de la clé D4, champs `r25_mode` et `r25_proof` du record | 14 |
| `.github/workflows/ci.yml` | job `r25-taille-de-lot` seul : `R25_READ_TOKEN` dans l `env:` de l étape, ligne `proof`, ligne `count` avec repli, deux gardes `case`, réassignation, impression du mode | 19 |
| `test/r25-integration.test.ts` (neuf) | T-1 à T-10 | 251 |
| `test/oracle-run.test.ts` | T-11 ; deux tueurs internes ré-ancrés (`r25.mjs:23` -> `:29`, `:25` -> `:33`) | 23 |
| `test/ci-gates.test.ts` | test neuf `ci_r25_integration_rule_is_wired_fail_closed` ; tueur `ci.yml:164` -> `:183` ré-ancré | 31 |
| **Total** (pathspec CODE de `ci.yml`, docs hors pathspec) | | **510** (borne du lot 547, CI 1 205) |

R-25 mesuré par le `r25()` **du tronc** (`git show ab8084fb:scripts/oracle/r25.mjs`) sur `ab8084fb...HEAD` au gel : `STAT 497 insertions, 13 deletions, changed 510` ; `CONTENT_STAT 0` ; GREEN. Pas de découpe 1a/1b.

## 2. Écarts au G0 (conception)

0. **Nom du module** : `scripts/lot-size-integration.mjs` (et sa surface `scripts/lot-size-integration.d.mts`), au lieu de `scripts/r25-integration.mjs` ; fichier de preuve CI `$RUNNER_TEMP/lot-size-proof.json`. Mesuré : le contrôle du mutant M-42f' de `test/export-public.test.ts` (test 42(f'), hors zone) exige que le corps du job r25 ne contienne aucun `r25` en minuscules ; les deux chemins le rougissaient (suite complète, premier passage). Le nom de la règle, des tests et des variables (`R25I`, `R25_MODE`, `R25_READ_TOKEN`, en majuscules) ne change pas. Partout ailleurs dans ce G7, « le module » désigne ce fichier.
1. **Épingle CI** : test neuf `ci_r25_integration_rule_is_wired_fail_closed` dans `test/ci-gates.test.ts`, au lieu d une partie (4quinquies) dans le test 38. Le test 38 reste octet pour octet ; le test neuf est jugé seul par red-proof (F2P) avec un tueur sur `ci.yml`. Les lignes ajoutées au job ne contiennent ni `git diff` ni `if [`, donc (4quater) reste vert sans modification.
2. **Égalité de `R25_DIFF_RE`** : épinglée dans T-10 (module, `r25.mjs`, test 38), et non par extension de `oracle-run.test.ts` l.290-291, qui ne bouge pas.
3. **Appel du module par l oracle** : `r25()` lance `node <clone>/scripts/lot-size-integration.mjs count ...`, la même commande que la CI, au lieu d un `import()` dynamique. `r25()` reste synchrone et le point d entrée est identique des deux côtés.
4. **Dépôt** : constante `REPO = "KraidleAI/monark-governance"`. Une candidate exige `head_repo == base_repo == REPO` ; une preuve exige `repo == REPO`.
5. **Objet PR en CI** : lu dans le payload de l événement (écrit par GitHub), sans `GET pulls/{n}`. Une PR non candidate ne fait **aucun** appel d API : une PR écrite, dont celle de ce lot, ne dépend jamais du réseau. En local (`--pr <n>`), l objet est lu par `gh api`.
6. **Modes** : `unproven`, `written`, `gate-files`, `integration`, `error`. Seul `integration` avec deux entiers remplace un compte, en bash comme dans `r25()` ; tout autre mode, ou une sortie non numérique, garde `W` (mesuré sur 7 sorties forgées : `integration abc 0`, `integration 3`, `gate-files 1 1`, vide, `integration 3 0 extra`, `integration -1 0` -> `written 52 7` ; `integration 3 0` -> `integration 3 0`).
7. **Garde des fichiers de la gate** : pour une fusion, les noms viennent de sa `--remerge-diff` ; pour un commit simple, du diff au parent. Une fusion propre qui ramène un fichier de gate d un côté non prouvé est couverte par les commits de ce côté, eux aussi dans `U`.
8. **Check-runs** : filtre par défaut de l API (dernier run par suite). Il faut au moins un run de l app `github-actions` nommé `r25-taille-de-lot`, tous `success`. Si `total_count` diffère du nombre lu, la preuve est incomplète et n est pas écrite.
9. **`base_sha` de la preuve** : enregistré, pas comparé au compte. Une preuve calculée sur une autre base ne peut que prouver moins (PR absentes de `merged`), jamais plus : le graphe de `M` décide.
10. **Oracle sans drapeau** : mode `unproven`, `r25_proof: null`, comptes d aujourd hui. Un arbre sale a un commit de gel différent de `pr.head_sha` : `unproven` (la preuve ne vaut que pour un arbre propre).
11. **Node** : le module tourne sur Node >= 20 (pas de `import.meta.main`, ni `import.meta.dirname`), car l étape s exécute avant `setup-node`, avec le Node préinstallé du runner. Non mesuré sur le runner : un `node` absent ou trop ancien donne le repli `written`.
12. **`run.mjs`** : les ajouts sont repliés sur des lignes existantes (l.2, l.42, l.45, l.63, l.137, l.142, l.167 : zéro ligne insérée) pour que les 20 tueurs de `oracle-run.test.ts` qui visent `run.mjs` restent ancrés sans édition.
13. **Serveur local de T-10** : démarré par `startLoopback` de `test/helpers/loopback.ts` (port tiré au-dessus de 10080), comme l exige `loopback_guard_every_bind_of_a_test_file_goes_through_the_helper` (rouge au premier passage avec un `listen(0)`).
14. **T-4, comptes mesurés** : une résolution de 25 lignes d un conflit add/add d une ligne compte 30 (25 + 5 lignes de marqueurs, Q-6), plus le commit `z` (1) = 31 > 20, rouge ; 10 lignes : 16, vert. La fusion propre avec 3 lignes glissées compte 3.

## 3. Permissions (Q-2) : choix mesuré

- **Mesure** : `ci_workflow_declares_least_privilege_permissions` (`test/ci-gates.test.ts` l.1813-1833 au tronc) exige **une seule** clé `permissions` dans tout le workflow (« a job-level block overrides the workflow one »), au niveau racine, de corps exactement `contents: read`. Un bloc au niveau du job r25 rougit donc ce test. Ce test et ADR-CODEQL-ALERTS-1 sont hors zone.
- **Choix** : aucune ligne `permissions` n est modifiée. Le module est fail-closed : sans `pull-requests: read` et `checks: read`, l API peut répondre 403. Dans ce cas il n y a pas de preuve, le mode est `unproven`, le compte est celui d aujourd hui, et le job imprime `::warning::R-25 integration proof not obtained`. Non mesuré : si le jeton `contents: read` d un dépôt public lit quand même `pulls` et `check-runs`. Le premier run d une PR candidate le montrera.
- **Édition en attente, précondition pour que la règle vive en CI** (avant la synchro tronc -> base), à ouvrir par MONARK :
  1. `.github/workflows/ci.yml` l.24-25, bloc racine :
     ```
     permissions:
       contents: read
       pull-requests: read
       checks: read
     ```
     avec le commentaire l.21-23 mis à jour (référence à la ligne datée ci-dessous) ;
  2. `test/ci-gates.test.ts`, test `ci_workflow_declares_least_privilege_permissions` : `assert.deepEqual(body, ["  contents: read", "  pull-requests: read", "  checks: read"], ...)`. L assertion du workflow public dérivé (`derived[dIdx + 1] === "  contents: read"`) reste vraie ; l assertion « aucune écriture » ne bouge pas ;
  3. une ligne datée d ADR-CODEQL-ALERTS-1 D1 : deux portées en lecture seule ajoutées pour la preuve R-25 d ADR-M003 D9 nonies.
  Coût R-25 : 4 lignes de code (2 dans `ci.yml`, 2 dans le test). Sans cette édition, la fusion du lot est sûre (rien ne s abaisse), mais la PR d intégration de C2 reste mesurée en entier en CI. La ligne (9) d ADR-CM, borne 1 400, reste alors le repli.

## 4. Mesures avec le module (refs du 2026-10-05)

Preuve écrite par `buildProof` (code du gel avant le renommage du module, logique identique hors nom de fichier) avec le transport `gh api` (lecture authentifiée de la session, aucun jeton imprimé), objet PR synthétique (tête et cible nommées comme la future PR). Comptes par `effective()` sur le pathspec du `ci.yml` du lot. `base/c2-integration` a bougé depuis le G0 (`418a421f` -> `689daea1`).

| Intégration (source -> cible) | `R` | PR fusionnées dans `R` / prouvantes | Non prouvés (`U`) | Gate actuelle `W` (CODE / CONTENT) | Règle (CODE / CONTENT) | Mode | Preuve / compte |
|---|---|---|---|---|---|---|---|
| tronc `ab8084fb` -> `base/c2-integration` `689daea1` (synchro) | 160 | 14 / 14 | 19 (docs poussés en direct) | 3 246 / 0 | **0 / 0** | `integration` | 7,8 s (16 appels) / 0,5 s |
| `base/c2-integration` `689daea1` -> tronc `ab8084fb` (intégration C2) | 114 | 11 / 11 | 2 (docs) | 5 156 / 0 | **0 / 0** | `integration` | 6,6 s (13 appels) / 0,2 s |
| tronc `ab8084fb` -> `main` `207f021f` (avance de `main`) | 1 599 | 35 / 34 (#92 : pas de `r25` vert) | - | 46 183 / 6 137 | **46 183 / 6 137** (rouge) | `gate-files` | 17,4 s (37 appels) / 0,9 s |

- La synchro réelle conflicte (`docs/adr/ADR-M004-infrastructure-plateforme.md`, mesure du G0). Elle passera par une branche `base/sync-...` portant une fusion résolue. Sa résolution, un `.md` sous `docs/`, est hors pathspec et compte 0.
- **Avance de `main`** : des commits non prouvés du tronc touchent `.github/workflows/**`, donc la garde `gate-files` rend `W`. Sans la garde (calcul informatif, module muté hors dépôt) : 1 283 commits non prouvés, dont 153 fusions, pour 46 073 / 6 137. `main` reste rouge dans les deux cas (Q-8).
- Temps : moins de 18 s pour la preuve et 1 s pour le compte, sous le `timeout-minutes: 5` du job (R-3 du G0, mesuré en local à travers le proxy de la session ; à re-mesurer sur le runner).

## 5. Menaces A-1 à A-18

| # | Statut | Preuve |
|---|---|---|
| A-1 commit non relu caché | couvert | T-1 (`12` = 7 + 5, PR #1 prouvée à 0) |
| A-2 copie amendée d un commit relu | couvert | T-1 (même message, autre sha : compté) |
| A-3 fusion malicieuse ou résolution | couvert | T-4 (résolution 25 lignes rouge, 3 lignes glissées comptées), tueur `--remerge-diff` tué |
| A-4 squash | couvert | T-9 (0) |
| A-5 rebase | couvert, fail-closed | T-9 (2 premiers comptés). Q-7 ouverte |
| A-6 fusionnée hors `L` | couvert | T-8 |
| A-7 tête poussée après revue | couvert pour la machine | T-2 (`head_sha` != `M^2` : rien prouvé). La G2 reste au contrôle MONARK (Q-3) |
| A-8 commits ajoutés après la fusion | couvert | T-2 (`late` compté, 15) |
| A-9 faux nom de branche | couvert | T-3 (fork, `lot/etude-suite-x`, cible de fork : `written` ; `base/fake` sans preuve : tout compté) |
| A-10 API indisponible, 403, pagination | couvert | T-5 (pas de fichier : `unproven`) ; `buildProof` lève sur tout statut != 200, page illisible ou check-runs paginés, et le fichier ancien est supprimé d abord |
| A-11 preuve d une autre PR, tête ou dépôt | couvert | T-5 (incomplète, autre dépôt, autre tête, autre schéma, illisible, absente via la CLI) |
| A-12 gate modifiée hors PR relue | couvert, résidu R-1 | T-7 (`gate-files`, 53) |
| A-13 jeton | couvert | jeton dans l `env:` de la seule étape r25, jamais imprimé (épinglé par le test de câblage) ; aucune portée ajoutée (section 3) |
| A-14 `pull_request_target` | non utilisé | Q-9 |
| A-15 injection par nom de branche | couvert | aucun `${{ github.head_ref }}` ni `${{ github.event.pull_request.head.ref }}` dans le workflow (test de câblage, mutant nommé M-c rouge). Les noms de `L` passés à git passent la grammaire fermée ; les sha sont validés `^[0-9a-f]{40}$` avant git et avant l URL |
| A-16 sortie non numérique, module en erreur | couvert | T-6 (`error` -> `W`), deux gardes `case` (mesure section 2.6), repli `\|\| R25I="written ..."` (tueur tué) |
| A-17 PR d exception keyée | couvert | T-8 (#89) |
| A-18 historique réécrit | couvert | `rev-list` d un `M` absent : la PR ne prouve rien (`provenSet`, `catch`). Mesuré : #92 apparaît dans `R` de l avance de `main` sans `r25` vert, elle ne prouve rien |

**Résidu R-1** (inchangé, vrai de toute gate sous `pull_request`) : une PR peut modifier `ci.yml` et retirer la garde elle-même, puisque le job exécute le workflow de la tête. La garde `gate-files` ne couvre que le module, `r25.mjs`, `run.mjs` et les workflows **appelés** depuis la tête ; une PR qui les modifie sans PR prouvée est comptée en entier tant que la garde est en place. Une PR qui retire la garde est elle-même du neuf compté, visible au contrôle MONARK par diff. Seul un juge pris sur la cible fermerait ce résidu (Q-9).

## 6. Vérifications (gel `5d310f48`, Node 24.21.0, git 2.43.0, `TMPDIR=/tmp/r25i-1`)

- **red-proof** : `node scripts/red-proof.mjs --base ab8084fb --gel 5d310f48 --repo <worktree> --draw 12 --seed 37` -> **OK** : 12 tests jugés (2 F2P : `ci_r25_integration_rule_is_wired_fail_closed`, `oracle_r25_integration_reads_the_declared_proof` ; 10 `new-module`), 48 inchangés, **12 tueurs tirés, 12 tués**. `RED-PROOF.json` sha256 `4198d6949aab644fdcbfb0fb61d822016a9aea37b4d3ab0f9045f348cbda7304`, digest du gel `68e0f268472e5e65f7e7f122cd30309eb9531e7d58f9f38dd026b944a18293d5`.
- **Mutants nommés du câblage CI** (appliqués à `ci.yml`, test de câblage rejoué, fichier restauré octet pour octet, sha256 `a67b831e...`) : M-a garde `''|*[!0-9]*)` retirée : rouge ; M-b ligne `count` déplacée après les impressions : rouge ; M-c `--base "origin/${{ github.head_ref }}"` : rouge ; M-d `R25_READ_TOKEN` posé aussi dans le job g1 : rouge. Le retrait du repli est le tueur tiré par red-proof (tué).
- **Ancres** : `verifie-ancres.mjs . --touched ab8084fb HEAD` : 39 tueurs, 37 ANCRE, 2 PERDU, les deux **déjà PERDU au tronc** (`oracle-run.test.ts:129` et `:182`, texte absent de `run.mjs`). Sur tout l arbre, le lot ajoute un seul PERDU, hors zone : `test/dojo-render.test.ts:326` vise `ci.yml:226`, devenu `ci.yml:245` (Q-12).
- **npm test** complet depuis le worktree : vert, voir 6.1.
- `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` 0 ; `export:check` OK ; `test/ci-gates.test.ts` 35/35 ; `test/oracle-run.test.ts` 15/15 ; `test/r25-integration.test.ts` 10/10.

### 6.1 Suite complète

`npm test` depuis le worktree, au gel `5d310f48` (proxy retiré de l environnement, la suite est hors ligne) : **2 313 tests, 2 291 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0.

Premier passage, sur le gel précédent (non poussé) : 2 rouges causés par le lot, corrigés avant ce gel : le contrôle M-42f' de `test/export-public.test.ts` (écart 0, renommage du module) et `loopback_guard_every_bind_of_a_test_file_goes_through_the_helper` (écart 13).

## 7. Ligne datée d ADR-M003 D9 (projet E-6, à contrôler par MONARK)

> **Addendum D9 nonies - 2026-10-05 (règle GÉNÉRALE : R-25 ne compte que le neuf d une PR d intégration ; décision de l investisseur du 2026-10-05, verbatim « applique ta reco et informe recherches » ; lot R25-INTEGRATION-RULE-1)** : la borne `VIBEGATES_PR_LIMIT = 1205` (et `VIBEGATES_CONTENT_LIMIT = 8000`, ADR-M013) reste. Les pathspecs restent ceux de D9, quater, sexies, septies et d ADR-M013. Pour une PR écrite, rien ne change. Une PR est **candidate** si, lus dans l objet PR écrit par GitHub (payload de l événement en CI, API en local), sa tête et sa cible sont dans la liste close `L` = {`lot/etude-suite`, `main`} ∪ {`base/<nom>`, `<nom>` de grammaire `^[a-z0-9][a-z0-9.-]*$`}, distinctes, et appartiennent toutes deux au dépôt `KraidleAI/monark-governance`. Un nom ne suffit jamais. Une PR fusionnée **prouve** ses commits si elle est fusionnée dans `L`, n est pas une PR d exception keyée (#56, #89), porte un `r25-taille-de-lot` vert de `github-actions` sur sa tête exacte, et si sa tête est le second parent de son `merge_commit_sha` (ensemble prouvé : ce commit et `rev-list M^2 ^M^1`), ou si ce commit a un seul parent (squash ou dernier commit rebasé : lui seul). Une candidate dont la preuve est complète compte, contre les mêmes bornes, (a) la `git show --remerge-diff` brute de chaque commit de fusion non prouvé et (b) le diff au parent de chaque autre commit non prouvé, au plus le compte d aujourd hui. Sans preuve complète, sur un dépôt ou une tête étrangers, si git est antérieur à 2.36, sur toute erreur, ou si un commit non prouvé touche la gate (`.github/workflows/**`, `scripts/lot-size-integration.mjs`, `scripts/oracle/r25.mjs`, `scripts/oracle/run.mjs`), on compte tout comme avant (fail-closed). Une seule implémentation, `scripts/lot-size-integration.mjs`, est exécutée par le job `r25-taille-de-lot` et par la porte r25 de l oracle depuis l arbre mesuré (commande `count`) ; en bash, seul le mode `integration` avec deux entiers remplace un compte. La CI lit la preuve par l API avec le jeton du run ; tant que le bloc `permissions` racine ne porte pas `pull-requests: read` et `checks: read` (ligne datée d ADR-CODEQL-ALERTS-1 à venir), un refus de l API laisse le compte d aujourd hui. L oracle, hors ligne, lit une preuve déclarée (`--r25-proof`), produite par la même commande `proof` via `gh api`, citée par sha256 dans son record et dans sa clé D4. Mesures du 2026-10-05 : synchro tronc `ab8084fb` -> `base/c2-integration` `689daea1` 3 246 -> 0 ; intégration de C2 5 156 -> 0 ; avance de `main` `207f021f` 46 183 -> 46 183 (garde `gate-files` ; reste rouge, Q-8). `test/r25-integration.test.ts` (T-1 à T-10), `oracle_r25_integration_reads_the_declared_proof` et `ci_r25_integration_rule_is_wired_fail_closed` l épinglent. La ligne (9) d ADR-CM (borne 1 400) reste le repli tant que la règle ne vit pas en CI sur la base. `error_origin` : sans objet (décision de règle). **Livré par** : lot R25-INTEGRATION-RULE-1 (G0 `docs/G0-lot-r25-integration-rule-1.md`, G7 `docs/G7-lot-r25-integration-rule-1.md`).

La ligne n est pas versée dans `docs/adr/ADR-M003-phase2-integration.md` par ce commit : elle attend le contrôle de MONARK (E-6).

## 8. Questions pour MONARK

- **Q-1 à Q-10** (G0 section 10) : sans réponse ; défauts appliqués (en-tête). Une réponse différente sur Q-1, Q-4, Q-5 ou Q-6 se traduit par un pli borné du module et de ses tests.
- **Q-2 bis (précondition)** : ouvrir à la zone les trois éditions de la section 3 (`ci.yml` l.21-25, le corps du test de permissions, la ligne datée d ADR-CODEQL-ALERTS-1), dans ce lot (pli de 4 lignes de code) ou dans un micro-lot avant la synchro. Sans elles, la règle est inerte en CI si l API refuse le jeton `contents: read`.
- **Q-7** : désactiver la fusion par rebase dans les réglages du dépôt (acte de l investisseur).
- **Q-8** (avance de `main`) : mesurée à 46 183 / 6 137 même sous la règle (garde `gate-files`, puis 1 283 commits sans PR). À trancher par l investisseur. Ma recommandation reste l exception keyée (i).
- **Q-11** (oracle Windows) : vérifier `git --version` >= 2.36 sur la machine de l oracle. Sinon, mode `error` et compte d aujourd hui partout.
- **Q-12** (ancre hors zone) : `test/dojo-render.test.ts:326` doit passer de `ci.yml:226` à `ci.yml:245` (texte inchangé, `run: npm run build`). Une ligne de commentaire, hors zone : je ne l ai pas touchée. À ouvrir à la zone de ce lot, ou à reprendre au prochain lot qui touche ce fichier.
- **Q-13** (ligne D9 nonies) : contrôler le texte de la section 7, puis me dire s il est versé dans ce lot (docs, hors pathspec) ou par le commit de docs du tronc.
