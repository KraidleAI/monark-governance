# G7 - lot R25-INTEGRATION-RULE-1 (R-25 ne compte que le neuf d une PR d intégration prouvée), pli de la G2, lots 1a et 1b

- **Session** : RECHERCHES, 2026-10-05. Tronc `lot/etude-suite` @ `ab8084fb` (inchangé pendant le lot et le pli : pas de fusion de synchro).
- **Relecture pliée** : `G2-r25-integration-rule-1.md` (G2 neuve de RECHERCHES, pièce de coordination du 2026-10-04), verdict APPROUVE SOUS RÉSERVE, trois bloquants B-1 à B-3 et sept mineurs m-1 à m-7. Tous sont pliés (section 9).
- **Relecture delta pliée** : `G2-r25-integration-rule-1-delta.md` (G2 neuve de RECHERCHES, pièce de coordination du 2026-10-04), verdict APPROUVE SOUS RÉSERVE, un nouveau bloquant B-4, trois mineurs m-a à m-c et une observation hors lot O-1. Tous sont pliés dans 1a, puis 1a est fusionnée dans 1b (section 10).
- **Relecture delta 2 pliée** : `G2-r25-integration-rule-1-delta2.md` (G2 neuve de RECHERCHES, pièce de coordination du 2026-10-04), verdict APPROUVE SOUS RÉSERVE, deux nouveaux bloquants B-5 et B-6 (dans le module, donc dans 1a), deux mineurs m-d et m-e, deux observations O-1 (hors lot) et O-2. Tous sont pliés dans 1a, puis 1a est fusionnée dans 1b (section 11).
- **Relecture delta 3 pliée** : `G2-r25-integration-rule-1-delta3.md` (G2 neuve de RECHERCHES, pièce de coordination du 2026-10-04), verdict APPROUVE SOUS RÉSERVE, aucun bloquant, trois mineurs m-f à m-h (oracle de 1b et texte) et une observation O-3. 1a est approuvée telle quelle (PR #154, inchangée) ; m-f, m-g et m-h sont pliés dans 1b seule, O-3 est notée (section 12).
- **Réponses de MONARK au G0 pliées** (2026-10-05, 1b seule, depuis `9746c5ba`) : Q-2 (bloc de permissions de job sur `r25-taille-de-lot`), Q-12 (ancre), Q-13 et Q-8 (lignes D9 nonies et D9 decies versées), ligne datée sous ADR-CODEQL-ALERTS-1 D1, Q-7, Q-11, Q-14, Q-15, O-1 (section 13).
- **Découpe** : le lot plié mesure 619 lignes R-25 (borne du lot 547). Il est coupé selon le G0 (section 9) :
  - **1a** `recherches/r25-integration-rule-1a`, depuis le tronc : G0 `bbf6582c` (repris tel quel de `94de83b8`), tests rouges `4d7d2b75`, gel `11e45dac`, docs `99edbc33` ; **pli delta** : tests rouges `fc1dd1c8`, gel `2e23d9fc`, docs `c640558c` ; **pli delta 2** : tests rouges `654ec986`, gel `1a9f6442`, docs (ce G7 et le G0, commit suivant) ;
  - **1b** `recherches/r25-integration-rule-1b`, depuis la tête de 1a `99edbc33` : tests rouges `a0bcc3c0`, gel `0b0c96ac`, docs `0778c31b` ; **pli delta** : 1a (`c640558c`) fusionnée dans 1b par le commit de fusion `b2c31e26` (aucun rebase, aucune poussée forcée), puis test rouge `abb65057`, gel `a3992699`, docs `9a331500` ; **pli delta 2** : 1a (`a00e62f3`) fusionnée dans 1b par le commit de fusion `c30e49ae` (aucun rebase, aucune poussée forcée), puis test rouge `72d5a26f`, gel `93f8bd75`, docs `bbdddb4d` ; **pli delta 3** (1b seule) : tests rouges `af41648c` (avec la note G0, section 12.1), gel `38ce8cb3`, docs (sections 6.2 et 12, commit suivant).
- **Branche d origine** `recherches/r25-integration-rule-1` (tête `2475e8e5`, celle relue par la G2) : laissée telle quelle, remplacée par 1a puis 1b. Le G7 d origine y reste lisible ; celui-ci le remplace.
- **Statut** : gel complet des deux lots. Aucune PR ouverte. Deux PR écrites vers le tronc, 1a puis 1b (E-7). La règle ne vit qu après la fusion de 1b.

## 1. Ce que livrent les deux lots

| Lot | Fichier | Rôle | R-25 (ins+del) |
|---|---|---|---|
| 1a | `scripts/lot-size-integration.mjs` (neuf) | implémentation unique : `L`, `EXCEPTED_PRS`, `GATE_FILES`, `BOUND_KEYS`, `isCandidate`, `proves`, `provenSet`, `specsOf`, `boundsOf`, `effective`, `buildProof` ; CLI `proof` et `count` ; pli delta 2 : plancher du diff combiné (B-5), attributs de l arbre vide (B-6), `core.bigFileThreshold` (m-d), git 2.40 (m-e), `metric()` fail-closed (O-2) | 192 |
| 1a | `scripts/lot-size-integration.d.mts` (neuf) | surface de types du test racine (avec `buildProof`) | 12 |
| 1a | `test/r25-integration.test.ts` (neuf) | T-1 à T-9 (T-4 sur les comptes du module), B-1, B-2, `buildProof` (m-1, m-3) ; pli delta : B-4, m-a, m-c ; pli delta 2 : B-5, B-6, m-d | 342 |
| | **Total 1a** (contre le tronc) | | **546** |
| 1b | `.github/workflows/ci.yml` | job `r25-taille-de-lot` seul : jeton, ligne `proof`, ligne `count` (cible lue dans `$GITHUB_BASE_REF`), repli, deux gardes `case` (la seconde borne la longueur), réassignation, mode | 19 |
| 1b | `scripts/oracle/r25.mjs` | `r25(clone, ciText, base, proofFile)` exécute **le module de l oracle**, seulement si le clone porte les mêmes octets ; `W` sans attributs utilisateur (pli delta m-a), sans attributs de l arbre mesuré et à `core.bigFileThreshold=512m` (pli delta 2, O-1 et m-d) | 28 |
| 1b | `scripts/oracle/run.mjs` | `--r25-proof`, part `r25_proof` de la clé D4, module dans la part `script`, champs `r25_mode` et `r25_proof` | 16 |
| 1b | `test/r25-integration.test.ts` | T-10 (parité CI / oracle), test B-3, T-4 repassé par le `r25()` de l oracle (sous une configuration git hostile, et sous un fichier d attributs utilisateur `* -diff`, pli delta m-a ; sous `core.bigFileThreshold=1` et après un `.gitattributes` mesuré `* -diff`, pli delta 2) | 108 |
| 1b | `test/oracle-run.test.ts`, `test/ci-gates.test.ts` | T-11 (et la part `script` de la clé), test de câblage (m-4, m-5) ; tueurs ré-ancrés | 26 + 35 |
| | **Total 1b** (contre la tête de 1a `a00e62f3` ; 1a + 1b contre le tronc : 754) | | **232** |

Mesure : `r25()` **du tronc** (`git show ab8084fb:scripts/oracle/r25.mjs`), pathspec CODE de `ci.yml`, docs hors pathspec. 1a au gel `11e45dac` : 421. 1a au gel delta `2e23d9fc` : 513. **1a au gel delta 2 `1a9f6442`** : `STAT 546 insertions, 0 deletions, changed 546` ; `CONTENT_STAT 0` ; GREEN, sous 547 (une ligne de marge). Pour y tenir, sans déplacer ni couper de test : `metric()` tient sur une ligne, la variante B-6 sur une ligne du test B-4, la variante m-d est une entrée de plus du test m-a, et le test B-5 parcourt ses six fixtures (trois scénarios, deux côtés) dans une seule boucle.

## 2. Écarts au G0 (conception)

Les écarts 0 à 14 du G7 d origine restent vrais, sauf 3, 7, 9 et 14, mis à jour ici :

0. **Nom du module** : `scripts/lot-size-integration.mjs`, au lieu de `scripts/r25-integration.mjs`, et preuve CI `$RUNNER_TEMP/lot-size-proof.json`. Raison mesurée : le contrôle du mutant M-42f′ de `test/export-public.test.ts` exige qu aucun `r25` en minuscules ne figure dans le corps du job r25 (précondition de la démonstration de 42(f′), ADR-M004 D7 ter). La G2 juge cette lecture légitime. D9 nonies nomme désormais le module et cette raison, pour qu une recherche de `r25` le retrouve.
3. **Appel du module par l oracle (pli G2 B-3)** : `r25()` exécute `node <arbre de l oracle>/scripts/lot-size-integration.mjs count ...` (constante `JUDGE`, à côté de `scripts/oracle/`), la même commande que la CI. Il compare d abord les octets du module du clone à ceux de `JUDGE` : s ils diffèrent, mode `gate-files`, `W`. Sans module d un côté : mode `error`, `W`.
7. **Garde des fichiers de la gate** : noms lus avec `-z` (pli, mesuré : sans `-z`, git cite un nom non ASCII entre guillemets, `".github/workflows/\303\251.yml"`, et la garde le manquait). Pour une fusion, les noms viennent de sa `--remerge-diff` ; pour un commit simple, du diff au parent.
9. **`base_sha` et `pr.number` de la preuve** : enregistrés, non comparés (G2 m-6 l accepte). Le graphe décide, et une preuve calculée sur une autre base prouve moins, jamais plus. Dit dans D9 nonies.
14. **T-4** : la PR #1 de la fixture passe de 40 à 15 lignes, sous la borne 20 de la fixture, pour rester prouvante sous B-2. Comptes inchangés : 31 (rouge) et 16 (vert).
15. **(pli) Bornes lues par le module** : `boundsOf(ciText)` lit `VIBEGATES_PR_LIMIT: "<n>"` et `VIBEGATES_CONTENT_LIMIT: "<n>"`, avec la même expression que `r25()` (l.28 du tronc). **Pli delta m-c** : seulement dans le bloc du job r25 (de la ligne de job, indentée de deux espaces au plus, qui précède la ligne STAT, jusqu à la ligne de même niveau qui suit), et chaque clé doit y être déclarée **une seule fois**. Absente ou répétée : levée, donc `W`. Elle n est lue que pour une candidate (une PR écrite ne dépend jamais d elle).
16. **(pli) Options git épinglées** : `-c merge.conflictStyle=merge -c diff.algorithm=myers -c diff.renames=true -c merge.renames=true -c merge.directoryRenames=conflict` sur chaque appel git du module. **Pli delta** : plus `-c diff.suppressBlankEmpty=false` et `-c core.attributesFile=` (m-a : un fichier d attributs utilisateur, par défaut XDG ou nommé, qui marque `* -diff`, faisait tomber un compte de 300 à 0) ; l environnement de git perd `GIT_DIFF_OPTS` (son `--unified=0` l emporte sur `--unified=` de la ligne de commande, mesuré : 3 000 lignes gardées comptaient 4) et reçoit `LC_ALL=C` (le module lit des messages de git : en-têtes `remerge CONFLICT` et `--shortstat` ; traduits, ils liraient 0. Non mesurable ici : aucune traduction de git dans le conteneur). La lecture de la `--remerge-diff` ajoute `--no-ext-diff --no-textconv --no-color`. Mesuré : un `-c` l emporte sur `GIT_CONFIG_PARAMETERS` et sur les fichiers de configuration. Je n ai pas isolé la configuration globale (`GIT_CONFIG_GLOBAL`) : sur la machine Windows de l oracle, elle porte probablement `safe.directory`, et l ignorer rendrait la règle inerte. **Pli delta 2** : plus `-c core.bigFileThreshold=512m`, la valeur par défaut de git, donc celle de la CI (m-d : un seuil de 1 posé par la machine rendait tout fichier binaire, et un commit simple comptait 0), et `--attr-source=<arbre vide>` sur chaque appel (B-6 : les attributs de l arbre mesuré, pilotes de fusion compris, ne s appliquent plus ; git ≥ 2.40, seuil relevé, m-e).
18. **(pli delta B-4) Fusions à conflit** : voir la section 10. Une fusion non prouvée est lue par `git show --remerge-diff --unified=99999999` (fichiers entiers en contexte), pathspec par pathspec. Elle compte chaque ligne +/- ; dans un fichier dont l entrée porte un en-tête `remerge CONFLICT (content)` ou `(add/add)`, elle compte **aussi chaque ligne de contexte** (le fichier résolu entier). Sous tout autre en-tête, ou un en-tête sans hunk, elle compte le maximum de `git diff --shortstat <parent> M` sur ses deux parents, et sa garde `gate-files` lit les noms de ces deux diffs.
19. **(pli delta 2 B-5) Plancher du diff combiné** : hors cas structurel, une fusion non prouvée compte au moins son diff combiné sans renommage, `git show --cc --no-renames --unified=0` sous la même pathspec : les lignes de `M` absentes au même chemin de **chacun** de ses deux parents. Le compte est `max(remerge-diff, combiné)`. Le diff combiné est vide pour une fusion propre sans renommage ; il voit les lignes qu un renommage détecté par la fusion (fichier ou répertoire, depuis un chemin hors pathspec ou depuis CONTENT) fait entrer dans CODE, que la `--remerge-diff` ne montre pas.
20. **(pli delta 2 O-2) `metric()` fail-closed** : une sortie `--shortstat` non vide sans `insertion` ni `deletion` lève une erreur (mode `error`, `W`) au lieu de rendre 0. Mesuré : git imprime `0 insertions(+), 0 deletions(-)` pour un changement binaire seul ou de mode seul ; le cas n est donc pas atteint sous les épinglages. Aucun test : le filet n a pas d entrée qui l atteigne.
17. **(pli) Échéance globale** : `buildProof` refuse tout appel après `deadline` (120 s par défaut) ; `fetchApi` borne chaque requête à `min(30 s, temps restant)` ; `gh api` (local) à 30 s. Pire cas : environ 150 s, sous le `timeout-minutes: 5` du job. Une API lente donne `W`, pas une expiration du job.

## 3. Permissions (Q-2) : la règle est probablement active dès la fusion de 1b

Le G7 d origine disait : « sans cette édition, la fusion du lot est sûre (rien ne s abaisse) ». **C est probablement faux** (G2 m-7) :

- la doc REST de `List pull requests` et de `List check runs for a Git reference` dit : « This endpoint can be used without authentication or the aforementioned permissions if only public resources are requested » ;
- le dépôt est public (mesure de la G2). Le jeton `contents: read` du run lira donc très probablement les deux ;
- non mesurable ici : le proxy de la session injecte son propre jeton, pas un `GITHUB_TOKEN` de run.

Conséquence : la règle vivra très probablement dès la fusion de 1b, et non après une édition de `permissions`. C est pour cela que B-1 à B-3 sont pliés **avant** toute fusion.

**Remplacé (section 13)** : MONARK a tranché Q-2 (bloc de job sur `r25-taille-de-lot`, lecture seule) ; le texte ci-dessous est l avis d avant sa réponse.

Choix (Q-2, avis de la G2) : **aucune permission n est élargie** tant qu un run candidat n a pas rendu 403. Le premier run de la PR de synchro tranchera. Sur un 403, le module ne produit pas de preuve, le job imprime `::warning::R-25 integration proof not obtained`, et le compte est celui d aujourd hui (aucun faux vert). Les trois éditions décrites au G7 d origine (bloc racine à trois lignes `read`, corps du test `ci_workflow_declares_least_privilege_permissions`, ligne datée d ADR-CODEQL-ALERTS-1) ne sont à ouvrir que dans ce cas.

## 4. Mesures avec le module plié (refs du 2026-10-05)

**Re-mesure après le pli delta 3** (gel 1b `38ce8cb3`, le module change : `GIT_ATTR_NOSYSTEM`, contrôle de `info/attributes`, exports ; même méthode, `buildProof` et `effective()` du gel, transport `gh api` ; tronc `ab8084fb` et `base/c2-integration` `689daea1` inchangés, vérifiés par `git ls-remote`) :

| Intégration | PR fusionnées / prouvantes | Non prouvés, dont fusions, dont conflit structurel | `W` | Règle | Mode | Temps, preuve / compte |
|---|---|---|---|---|---|---|
| synchro tronc `ab8084fb` -> `base/c2-integration` `689daea1` | 14 / 14 | 33, 14, 0 | 3 246 / 0 | **0 / 0** | `integration` | 9,0 s / 1,2 s |
| intégration C2 `689daea1` -> tronc `ab8084fb` | 11 / 11 | 13, 11, 0 | 5 156 / 0 | **0 / 0** | `integration` | 6,9 s / 0,8 s |

Aucun commit non prouvé n a un compte non nul ; le dépôt mesuré n a pas de `$GIT_DIR/info/attributes`.

**Re-mesure après le pli delta 2** (gel `1a9f6442`, même méthode : `buildProof` du gel, transport `gh api` de la session, proxy laissé pour la seule lecture GitHub, objet PR synthétique, `effective()` sur les pathspecs et bornes du `ci.yml` de l arbre ; tronc `ab8084fb` et `base/c2-integration` `689daea1` inchangés, vérifiés par `git ls-remote`) :

| Intégration | PR fusionnées / prouvantes | Non prouvés, dont fusions, dont conflit structurel | `W` | Règle | Mode | Temps, preuve / compte |
|---|---|---|---|---|---|---|
| synchro tronc `ab8084fb` -> `base/c2-integration` `689daea1` | 14 / 14 | 33, 14, 0 | 3 246 / 0 | **0 / 0** | `integration` | 9,5 s / 1,4 s |
| intégration C2 `689daea1` -> tronc `ab8084fb` | 11 / 11 | 13, 11, 0 | 5 156 / 0 | **0 / 0** | `integration` | 6,8 s / 0,7 s |

Toutes les PR prouvantes prouvent encore (`provenSet` est inchangé). Aucun commit non prouvé n a un compte non nul : le diff combiné sans renommage des 25 fusions non prouvées vaut 0 sous les deux pathspecs, et aucun de leurs `--shortstat` n est illisible (O-2). Les attributs de l arbre vide (B-6) et le seuil épinglé (m-d) ne changent rien ici : le `.gitattributes` du tronc ne porte que `text=auto eol=lf` (normalisation à l écriture, sans effet sur un diff d objets commités) et `binary` sur des formats binaires (`png`, `pdf`, `cbor`, `ots`, `ttf`) ; mesuré, aucun compte ne bouge.

**Re-mesure après le pli delta** (conservée) :

Gel `2e23d9fc`, même méthode, même `ci.yml`, transport `gh api` de la session, proxy laissé pour la seule lecture GitHub :

| Intégration | PR fusionnées / prouvantes | Contribution max (CODE) | Non prouvés, dont fusions, dont conflit structurel | `W` | Règle | Mode | Temps, preuve / compte |
|---|---|---|---|---|---|---|---|
| synchro tronc `ab8084fb` -> `base/c2-integration` `689daea1` | 14 / 14 | 547 | 33, 14, 0 | 3 246 / 0 | **0 / 0** | `integration` | 8,8 s / 1,3 s |
| intégration C2 `689daea1` -> tronc `ab8084fb` | 11 / 11 | 1 042 | 13, 11, 0 | 5 156 / 0 | **0 / 0** | `integration` | 6,7 s / 0,8 s |

Toutes les PR prouvantes prouvent encore. Aucun commit non prouvé n a un compte non nul. Somme des contributions `M^1..M` des prouvantes (CODE) : 3 300 et 5 226 (filet facultatif, section 10).

Mesures du premier pli, conservées :

Preuve écrite par `buildProof` du gel plié, transport `gh api` (lecture authentifiée de la session, aucun jeton imprimé), objet PR synthétique (tête et cible nommées comme la future PR). Comptes par `effective()` sur le pathspec et les bornes du `ci.yml` plié. Git 2.43.0, Node 24.21.0.

| Intégration (source -> cible) | `R` | PR fusionnées / prouvantes | Contribution `M^1..M` des prouvantes (CODE) | Non prouvés (`U`) dont fusions | `W` (CODE / CONTENT) | Règle (CODE / CONTENT) | Mode | Appels, preuve / compte |
|---|---|---|---|---|---|---|---|---|
| tronc `ab8084fb` -> `base/c2-integration` `689daea1` (synchro) | 160 | 14 / 14, toutes sous la borne | 14 à 547 | 33 dont 14 fusions de PR, toutes à 0 | 3 246 / 0 | **0 / 0** | `integration` | 16, 8,4 s / 1,7 s |
| `base/c2-integration` `689daea1` -> tronc (intégration C2) | 114 | 11 / 11, toutes sous la borne | 0 à 1 042 | 13 dont 11 fusions de PR, toutes à 0 | 5 156 / 0 | **0 / 0** | `integration` | 13, 6,6 s / 0,8 s |
| tronc -> `main` `207f021f` (avance de `main`) | 1 599 | 35 / 34 | 2 à 1 053 | - | 46 183 / 6 137 | 46 183 / 6 137 (rouge) | `gate-files` | 37, 17,9 s / 2,3 s |

- **B-1** : les fusions des PR prouvantes sont maintenant dans `U`. Leur `--remerge-diff` sous la pathspec vaut 0 pour les 25 (14 + 11). Les comptes restent 0 / 0.
- **B-2** : les 25 PR prouvantes de la synchro et de C2 apportent au plus 1 042 lignes CODE à leur cible, toutes sous 1 205 (et 0 CONTENT). Toutes prouvent encore.
- **m-3** : 37 appels en 17,9 s au pire, sous l échéance de 120 s.

## 5. Menaces A-1 à A-19

Inchangées depuis le G7 d origine, sauf :

| # | Statut | Preuve |
|---|---|---|
| A-3 fusion malicieuse ou résolution | couvert, **y compris la fusion `M` d une PR prouvée** (pli B-1), **les lignes qu un conflit garde** (pli delta B-4), **les lignes qu un renommage de fusion fait entrer dans CODE** (pli delta 2 B-5) **et un pilote de fusion de l arbre mesuré** (pli delta 2 B-6). Prémisses corrigées : R-25 ne mesure que le net d une PR, jamais ses commits intermédiaires ; un commit prouvé peut donc porter des lignes jamais mesurées, qu une fusion à conflit garde. Et « une fusion propre n apporte rien hors de ses parents » ne vaut que **par chemin** : la fusion détecte les renommages sur l arbre entier, et applique au chemin renommé (sous CODE) les lignes ajoutées par l autre côté au chemin d origine (hors CODE, ou sous CONTENT), sans que sa `--remerge-diff` les montre | T-4 ; `r25i_local_merge_of_a_proven_pr_counts_its_remerge_diff` (300 glissées : 300) ; `r25i_conflict_kept_material_of_a_proven_pr_counts` (3 000 gardées par rename/delete, côté tronc ou côté branche, ou par un conflit de contenu : 3 000 comptées, 3 005 pour le contenu ; sous un `.gitattributes` mesuré `* merge=union` : 3 006, `W`) ; `r25i_merge_time_rename_into_the_code_spec_counts` (renommage de fichier, de répertoire, de CONTENT vers CODE, des deux côtés : 3 040, 3 002, 7 002) |
| A-12 gate modifiée hors PR relue | **erreur couverte, attaque couverte par l oracle et par MONARK** (pli B-3). **Pli delta 2** : le `.gitattributes` de l arbre mesuré était une entrée non gardée du module (B-6 : un `merge=union` d une ligne rendait propre la fusion de B-4) ; le module lit désormais les attributs de l arbre vide, et cette entrée ne le règle plus. Le `W` du job bash lit toujours les attributs de l arbre mesuré (O-1, hors lot ; voir section 8) | T-7 (module, `.github/workflows/x.yml`, nom non ASCII) ; `oracle_r25_runs_its_own_module_and_refuses_a_foreign_one` (1b) ; variante `merge=union` de `r25i_conflict_kept_material_of_a_proven_pr_counts`. Voir ci-dessous |
| A-19 (neuf) PR verte contre une autre cible : recibler, cible poussée en arrière, relance d un vieux run | couvert (pli B-2) | `r25i_proving_pr_contribution_is_remeasured` (2 000 lignes jamais mesurées : 2 005 comptées) |

**Portée réelle de la garde `gate-files`** (G2 B-3) : elle protège contre une **erreur**, pas contre une **attaque**. En CI, elle est exécutée par le module de l arbre mesuré ; une PR qui remplace le module (ou `ci.yml`) remplace aussi la garde (résidu R-1, vrai de toute gate sous `pull_request`). La preuve contre une attaque est double :
- l oracle exécute son propre module (arbre de confiance de l opérateur) et rend `W` si les octets du module mesuré diffèrent ; le module entre dans la part `script` de sa clé D4 ;
- MONARK contrôle par diff, sur chaque PR d intégration, `git diff --stat <cible>...<tête> -- .github/workflows scripts/lot-size-integration.mjs scripts/oracle`. Une ligne non vide est une PR qui touche la gate, à relire comme telle.

Le juge pris sur la cible en CI (Q-9) fermerait R-1 ; il reste une suite possible, hors de ce pli.

## 6. Vérifications

### 6.1 Lot 1a

**Pli delta 2** (gel `1a9f6442`, Node 24.21.0, git 2.43.0, `TMPDIR=/tmp/r25f3-1`, proxy retiré pour les tests) :

- **R-25** (`r25()` du tronc) : contre le tronc, `STAT 546 insertions, 0 deletions, changed 546`, `CONTENT_STAT 0`, GREEN, sous 547.
- **red-proof** : `node scripts/red-proof.mjs --base ab8084fb --gel 1a9f6442 --repo <worktree> --draw 12 --seed 37` -> **OK** : 16 tests jugés (16 `new-module`), 0 inchangé, **12 tueurs tirés, 12 tués** (dont B-5 `:101` et m-d `:33`). `RED-PROOF.json` sha256 `a4c9fa3d85a3e948c4a0cdad8081603ca0e62c23f0e06b5d2dc6706a68ff0608`, digest `7f3ff0afe1bf5c5b6f1f454bb6be0397bf94344b4dfdd98bf84989223d53456f`.
- **Rouge contre l ancienne tête** : au module de `c640558c`, trois tests échouent par assertion, les 13 autres restent verts : B-4 (variante `merge=union` : 4 au lieu de 3 006), B-5 (40 au lieu de 3 040 au premier scénario ; mesuré hors du test, les six fixtures lisent 40, 40, 2, 2, 2, 2 au lieu de 3 040, 3 040, 3 002, 3 002, 7 002, 7 002), m-a / m-d (`[307, 307, 0]` au lieu de `[307, 307, 307]`).
- **Tueurs à la main** : les 29 tueurs de `test/r25-integration.test.ts`, un par un, test visé rejoué, fichier restauré octet pour octet : **29 tués sur 29**, dont les neufs `:124` (`both(remerged(`, B-5), `:101` (`Math.max(r, k)`, B-5), `:34` (`--attr-source`, B-6) et `:33` (`core.bigFileThreshold`, m-d). Un premier tueur m-d, posé sur la seule fusion du test m-a, survivait : sous un seuil de 1, le diff combiné de la fusion (qui ne lit pas `core.bigFileThreshold`) rendait les 300 lignes. Le test m-a ajoute donc un commit simple de 7 lignes, lu par `--shortstat`.
- **Ancres** : `verifie-ancres.mjs . --touched ab8084fb HEAD` : 29 tueurs, 29 ANCRE, 0 PERDU.
- `test/r25-integration.test.ts` 16/16, aussi sous la configuration hostile du pli delta (`GIT_CONFIG_PARAMETERS` à douze clés, `GIT_EXTERNAL_DIFF`, `GIT_DIFF_OPTS=--unified=0`) ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.

**Pli delta** (gel `2e23d9fc`, Node 24.21.0, git 2.43.0, `TMPDIR=/tmp/r25f2-1`, proxy retiré pour les tests) :

- **red-proof** : `node scripts/red-proof.mjs --base ab8084fb --gel 2e23d9fc --repo <worktree> --draw 12 --seed 37` -> **OK** : 15 tests jugés (15 `new-module`), 0 inchangé, **12 tueurs tirés, 12 tués**. `RED-PROOF.json` sha256 `9564cad4cce229c8a0e0177c36aecfba41bc04b3f5aa07564120a4a155b7458a`, digest `00e91be87dc8eb7c5d3ed8e034f7c6032d79ccd8a95e92bca7f67ba1bf79b46e`.
- **Rouge contre l ancienne tête** : les trois nouveaux tests (B-4, m-a, m-c) échouent par assertion contre le module de `99edbc33` ; les 12 autres restent verts.
- **Tueurs à la main** : les 25 tueurs de `test/r25-integration.test.ts`, un par un, test visé rejoué, fichier restauré octet pour octet : **25 tués sur 25**.
- **Ancres** : `verifie-ancres.mjs . --touched ab8084fb HEAD` : 25 tueurs, 25 ANCRE, 0 PERDU.
- `test/r25-integration.test.ts` 15/15, aussi sous une configuration hostile (`GIT_CONFIG_PARAMETERS` : noprefix, quotepath, `color.ui=always`, `diff.external`, copies, histogram, zdiff3, `suppressBlankEmpty`, `diff.context=0`, mnemonicPrefix, relative, `renameLimit=1`, `merge.renames=false` ; `GIT_EXTERNAL_DIFF`, `GIT_DIFF_OPTS=--unified=0`) ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.

**Premier pli** (gel `11e45dac`, `TMPDIR=/tmp/r25fold-1`) :

- **red-proof** : `node scripts/red-proof.mjs --base ab8084fb --gel 11e45dac --repo <worktree> --draw 12 --seed 37` -> **OK** : 12 tests jugés (12 `new-module`), 0 inchangé, **12 tueurs tirés, 12 tués**. `RED-PROOF.json` sha256 `dc1ceba952a72ab3a0f873133016ca5748c864cd98f490560f6f40f77a799b0c`, digest du gel `28518bb5b3df5276229d03adde2549d504300e34f9e1e5954ae35eeedb7b1dfa`.
- **Tueurs à la main** : les 19 tueurs de `test/r25-integration.test.ts` appliqués un par un (avant présent une seule fois sur sa ligne), test visé rejoué, fichier restauré octet pour octet : **19 tués sur 19**, dont les tueurs du pli (B-1 `:51`, B-2 `:50`, m-1 `:120`, `:121`, `:122`, `:108`, m-2 `:28`, `-z` `:91`, `.github/workflows/` `:24`, m-3 `:105`).
- **Ancres** : `verifie-ancres.mjs . --touched ab8084fb HEAD` : 19 tueurs, 19 ANCRE, 0 PERDU.
- `test/r25-integration.test.ts` 12/12 ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.

### 6.2 Lot 1b

**Pli delta 3** (gel `38ce8cb3`, sur `bbdddb4d`, 1a inchangée, mêmes outils, `TMPDIR=/tmp/r25f4-tmp`) :

- **R-25** (`r25()` du tronc) : contre la tête de 1a `a00e62f3`, `STAT 287 insertions, 39 deletions, changed 326`, `CONTENT_STAT 0`, GREEN, sous 547 (232 avant le pli : + 94). 1a + 1b contre le tronc `ab8084fb` : 830 (812 + / 18 −). Le pli seul, contre `bbdddb4d` : 110 (90 + / 20 −).
- **red-proof** : `node scripts/red-proof.mjs --base bbdddb4d --gel 38ce8cb3 --repo <worktree> --draw 12 --seed 37` -> **OK** : 5 tests jugés, tous F2P, 33 inchangés, **5 tueurs tirés (toute la population), 5 tués** (`scripts/lot-size-integration.mjs:33` et `:114`, `scripts/oracle/r25.mjs:23` et `:27`, `scripts/oracle/run.mjs:99`). `RED-PROOF.json` sha256 `de98ac5bbe71a1993a5651422d8cdae8233a779f19f5e8d15dea657960c7c0a4`. Aucun test de resserrement : les deux tueurs de T-4 ré-ancrés (ci-dessous) portent sur un test inchangé, appliqués à la main.
- **Rouge du pli** : au commit de test `af41648c` (sans le gel), les 5 tests échouent par assertion : `merge=union` dans `info/attributes` rend 3 au lieu de 3 005 ; `r25()` ne lève pas ; la copie lit `[2, 2, 2]` au lieu de `[3002, 3002, 3002]` ; le blob `diff` lit 0 au lieu de 3 001 ; le gabarit de machine fait lire 0 ligne à `run.mjs`.
- **Tueurs à la main** : les 72 lignes `// killer:` des trois fichiers du lot, une par une, test visé rejoué hors de npm, fichier restauré : **68 tués**, 2 PERDU (déjà PERDU au tronc, `oracle-run.test.ts:129`, `:182`), 1 survivant : `oracle-run.test.ts:131` (`run.mjs:46`, COR sur `npm_config_(offline|logs_dir)`), survivant aussi à `bbdddb4d` (mesuré), hors du pli : le test ne le tue que si un `npm_config_*` est dans l environnement, donc sous `npm test`. Dont les deux tueurs de T-4 ré-ancrés sur la lecture `W` (`scripts/oracle/r25.mjs:27` : `...PIN` retiré ; `--attr-source` retiré de la première lecture), tués.
- **Ancres** : `--touched bbdddb4d HEAD` : 65 tueurs, 63 ANCRE, 0 DERIVE, 2 PERDU ; `--touched ab8084fb HEAD` : 71 tueurs, 69 ANCRE, 0 DERIVE, 2 PERDU ; les deux PERDU sont ceux du tronc (`oracle-run.test.ts:129`, `:182`). Les lignes visées par les tueurs existants gardent leur numéro.
- **npm test** complet depuis le worktree, au gel `38ce8cb3` (proxy retiré) : **2 326 tests, 2 304 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0. Un premier passage avec `node_modules` en lien symbolique avait 50 rouges, tous d environnement (47 de `mutants-run` : `tool_tree ... EISDIR`, le lien non ignoré est lu comme un fichier suivi ; mêmes rouges mesurés à `bbdddb4d`) ; refait avec un `node_modules` réel (liens durs) : 0 rouge.
- `r25-integration`, `ci-gates`, `oracle-run` : 73/73 ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.
- Le module de 1b n est plus celui de 1a : synchro et C2 sont re-mesurées (section 4), 0 / 0.

**Pli delta 2** (gel `93f8bd75`, après la fusion `c30e49ae` de 1a, mêmes outils, `TMPDIR=/tmp/r25f3-1`) :

- **R-25** (`r25()` du tronc) : contre la tête de 1a `a00e62f3`, `STAT 205 insertions, 27 deletions, changed 232`, `CONTENT_STAT 0`, GREEN, sous 547. 1a + 1b contre le tronc : 754 (739 + / 15 −).
- **red-proof** : `node scripts/red-proof.mjs --base a00e62f3 --gel 93f8bd75 --repo <worktree> --draw 12 --seed 37` -> **OK** : 5 tests jugés (F2P), 63 inchangés, **5 tueurs tirés, 5 tués** (dont `scripts/oracle/r25.mjs:27`). `RED-PROOF.json` sha256 `4be6b34a29e09aa0ef46dfc7276885de2db9cf3ff19dd675ba1a75fae184271c`, digest `36d5fa51c935000e8affeb6a212eb793cc9fde2224f8ad0caf7052bc2d2da8da`.
- **Rouge du pli 1b** : au commit de test `72d5a26f` (sans le gel), T-4 par l oracle échoue par assertion sous `core.bigFileThreshold=1` (`W` de l oracle tombe à 0, le compte rendu aussi : `[31, 31, 31, 0]` au lieu de `[31, 31, 31, 31]`).
- **Tueurs à la main** : les 43 tueurs du lot (35 de `r25-integration`, dont les trois de `scripts/oracle/r25.mjs:27` : attributs utilisateur, `core.bigFileThreshold`, `--attr-source` ; 6 de `ci-gates` et `oracle-run` sur `run.mjs:62`, `:63`, `ci.yml:99` (deux), `:106`, `:183` ; les deux tueurs internes `r25.mjs:31` et `:35` de `oracle_r25_over_the_ci_bound_is_red`) : **43 tués sur 43**.
- **Ancres** : `--touched ab8084fb HEAD` et `--touched a00e62f3 HEAD` : 67 tueurs, 65 ANCRE, 2 PERDU, les deux déjà PERDU au tronc (`oracle-run.test.ts:129`, `:182`).
- **npm test** complet depuis le worktree, au gel `93f8bd75` (proxy retiré) : **2 321 tests, 2 299 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0.
- `r25-integration`, `ci-gates`, `oracle-run` : 68/68 ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.
- Le module de 1b est octet pour octet celui de 1a (`1a9f6442`) : les mesures réelles de la section 4 (synchro et C2 à 0 / 0, toutes les PR prouvantes prouvent) valent pour 1b.

**Pli delta** (conservé) :

Gel `a3992699`, après la fusion `b2c31e26` de 1a, mêmes outils, `TMPDIR=/tmp/r25f2-1` :

- **R-25** (`r25()` du tronc) : contre la tête de 1a `c640558c`, `STAT 199 insertions, 27 deletions, changed 226`, `CONTENT_STAT 0`, GREEN, sous 547. 1a + 1b contre le tronc : 715 (700 + / 15 −).
- **red-proof** : `node scripts/red-proof.mjs --base c640558c --gel a3992699 --repo <worktree> --draw 12 --seed 37` -> **OK** : 5 tests jugés, 62 inchangés, **5 tueurs tirés, 5 tués**. `RED-PROOF.json` sha256 `189670ca9bd9f6ad164212395032e63b731b5ccfe664ec1e9c5f7abc1c02a313`, digest `afe81f25f7bb2d732dc61b79e140ed695a77f134ebdc30aaeeb8ab5ec79c8064`.
- **Rouge du pli 1b** : au commit de test `abb65057` (sans le gel), T-4 par l oracle échoue par assertion sous le fichier d attributs utilisateur (`W` tombe à 0).
- **Tueurs à la main** : les 38 tueurs des trois fichiers du lot (`r25-integration`, `ci-gates`, `oracle-run`), dont le neuf `scripts/oracle/r25.mjs:27` (m-a) : **38 tués sur 38**.
- **Ancres** : `--touched ab8084fb HEAD` et `--touched c640558c HEAD` : 61 tueurs, 59 ANCRE, 2 PERDU, les deux déjà PERDU au tronc (`oracle-run.test.ts:129`, `:182`).
- **npm test** complet depuis le worktree, au gel `a3992699` (proxy retiré) : **2 320 tests, 2 298 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0.
- `r25-integration`, `ci-gates`, `oracle-run` : 67/67 ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` OK ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.
- Le module de 1b est octet pour octet celui de 1a (`c640558c`) : les mesures réelles de la section 4 valent pour 1b.

**Premier pli** (gel `0b0c96ac`) :

- **R-25** (`r25()` du tronc) : contre la tête de 1a `99edbc33`, `STAT 196 insertions, 26 deletions, changed 222`, `CONTENT_STAT 0`, GREEN, sous 547. Après la fusion de 1a, la PR de 1b mesure ces 222 lignes contre le tronc.
- **red-proof** : `node scripts/red-proof.mjs --base 99edbc33 --gel 0b0c96ac --repo <worktree> --draw 12 --seed 37` -> **OK** : 5 tests jugés, tous F2P (test de câblage, T-11, T-4 par l oracle, test B-3, T-10), 59 inchangés, **5 tueurs tirés (toute la population), 5 tués**. `RED-PROOF.json` sha256 `de4ee0b37cd30b883656b51622b63707b8b2b1a38d18ee78684dab7ff67e559e`.
- **Tueurs à la main** : les 22 tueurs de `test/r25-integration.test.ts` (dont B-3 `r25.mjs:20` et `:44`, m-2 `:28`) et les 6 tueurs de `oracle-run.test.ts` et `ci-gates.test.ts` qui visent `run.mjs:62`, `:63`, `ci.yml:99` (deux), `:106`, `:183` : **28 tués sur 28**. Les deux tueurs internes `r25.mjs:31` (SDL) et `:35` (ROR) de `oracle_r25_over_the_ci_bound_is_red`, ré-ancrés, sont tués aussi.
- **Ancres** : `--touched ab8084fb HEAD` et `--touched 99edbc33 HEAD` : 54 tueurs, 52 ANCRE, 2 PERDU, les deux déjà PERDU au tronc (`oracle-run.test.ts:129`, `:182`). Sur tout l arbre, comparé au tronc : un seul PERDU ajouté, `test/dojo-render.test.ts:326` (`ci.yml:226` devenu `:245`, Q-12), comme au G7 d origine.
- **npm test** complet depuis le worktree, au gel `0b0c96ac` (proxy retiré, suite hors ligne) : **2 317 tests, 2 295 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0.
- `test/r25-integration.test.ts`, `ci-gates`, `oracle-run` : 64/64 ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.

## 7. Ligne datée d ADR-M003 D9 (projet E-6, réécrit après le pli, à contrôler par MONARK)

> **Addendum D9 nonies - 2026-10-05 (règle GÉNÉRALE : R-25 ne compte que le neuf d une PR d intégration ; décision de l investisseur du 2026-10-05, verbatim « applique ta reco et informe recherches » ; lots R25-INTEGRATION-RULE-1a et 1b)** : la borne `VIBEGATES_PR_LIMIT = 1205` (et `VIBEGATES_CONTENT_LIMIT = 8000`, ADR-M013) reste. Les pathspecs restent ceux de D9, quater, sexies, septies et d ADR-M013. Pour une PR écrite, rien ne change. Une PR est **candidate** si, lus dans l objet PR écrit par GitHub (payload de l événement en CI, API en local), sa tête et sa cible sont dans la liste close `L` = {`lot/etude-suite`, `main`} ∪ {`base/<nom>`, `<nom>` de grammaire `^[a-z0-9][a-z0-9.-]*$`}, distinctes, et appartiennent toutes deux au dépôt `KraidleAI/monark-governance`. Un nom ne suffit jamais. Une PR fusionnée **prouve** des commits si elle est fusionnée dans `L`, n est pas une PR d exception keyée (#56, #89), porte un `r25-taille-de-lot` vert de `github-actions` sur sa tête exacte, et si sa contribution réelle à sa cible, `git diff M^1 M` sous chaque pathspec (`M` = son `merge_commit_sha`), tient sous les mêmes bornes : un run vert a mesuré la tête contre la cible du moment du run, ce qui ne couvre ni un changement de cible, ni une cible poussée en arrière, ni la relance d un vieux run. Elle prouve alors `rev-list M^2 ^M^1` si sa tête est le second parent de `M`, ou `M` seul si `M` a un parent (squash ou dernier commit rebasé). La fusion `M` elle-même n est jamais prouvée d office : elle est mesurée par sa `--remerge-diff` et au moins par son diff combiné sans renommage (0 pour une fusion propre sans renommage, qu elle soit faite par GitHub ou en local). Un commit prouvé n est couvert que par le **net** de sa PR, que R-25 a mesuré : ses lignes ajoutées puis retirées dans la même PR ne l ont jamais été. Une candidate dont la preuve est complète compte donc, contre les mêmes bornes, (a) pour chaque commit de fusion non prouvé, sa `git show --remerge-diff` brute, à fichiers entiers : chaque ligne ajoutée ou retirée, et chaque ligne d un fichier en conflit de contenu (`content`, `add/add`) ; sous tout autre conflit (rename/delete, modify/delete, ...) ou un conflit sans hunk, le plus grand de ses diffs à chacun de ses parents ; hors ce dernier cas, au moins son diff combiné sans renommage (`git show --cc --no-renames`, les lignes absentes au même chemin de chacun des deux parents), car une fusion propre n apporte rien hors de ses parents **par chemin** seulement : un renommage de fichier ou de répertoire détecté par la fusion peut faire entrer dans CODE des lignes qu aucun commit n y a comptées, et (b) le diff au parent de chaque autre commit non prouvé, au plus le compte d aujourd hui. Sans preuve complète, sur un dépôt ou une tête étrangers, si git est antérieur à 2.40, sur toute erreur, ou si un commit non prouvé touche la gate (`.github/workflows/**`, `scripts/lot-size-integration.mjs`, `scripts/oracle/r25.mjs`, `scripts/oracle/run.mjs`), on compte tout comme avant (fail-closed). Cette dernière garde protège d une erreur, pas d une attaque : elle est jugée par le code qu elle garde. Contre une attaque, la porte r25 de l oracle exécute **son propre** module, et rend le compte d aujourd hui si les octets du module mesuré diffèrent ; MONARK contrôle par diff les fichiers de la gate sur chaque PR d intégration. Une seule implémentation, `scripts/lot-size-integration.mjs` (nom choisi sans la sous-chaîne `r25`, que le contrôle M-42f′ d ADR-M004 D7 ter interdit dans le corps du job r25), avec les options git qui changent un compte épinglées (dont `core.bigFileThreshold` à sa valeur par défaut), sans fichier d attributs utilisateur ni système (un `$GIT_DIR/info/attributes` non vide rend le compte d aujourd hui), sans les attributs de l arbre mesuré (lus dans l arbre vide : un pilote de fusion de l arbre mesuré ne rend pas propre une fusion à conflit), sans `GIT_DIFF_OPTS`, messages de git en anglais ; les bornes sont lues une seule fois dans le job r25 ; le job `r25-taille-de-lot` exécute celui de l arbre mesuré (commande `count`, cible lue dans `$GITHUB_BASE_REF`), et en bash seul le mode `integration` avec deux entiers de moins de dix chiffres remplace un compte. La CI lit la preuve par l API avec le jeton du run, sous une échéance de 120 s ; un refus de l API (403) laisse le compte d aujourd hui, et les portées `pull-requests: read` et `checks: read` ne seront ajoutées (ligne datée d ADR-CODEQL-ALERTS-1) que si un run candidat rend 403. Le compte d aujourd hui de l oracle (`W`) est lu sous les options épinglées et l environnement du module, comme le plus grand de deux lectures : attributs de l arbre vide, et attributs de l arbre mesuré (la lecture du job) ; il n est donc jamais sous le `W` du job. Le module, lui, ne lit pas un attribut mesuré qui force le texte (`diff`) : un fichier binaire y compte comme binaire. L oracle clone sans gabarit de machine et rend rouge un clone dont `$GIT_DIR/info/attributes` n est pas vide. L oracle, hors ligne, lit une preuve déclarée (`--r25-proof`), produite par la même commande `proof` via `gh api`, citée par sha256 dans son record et dans sa clé D4. `base_sha` et `pr.number` de la preuve sont enregistrés, non vérifiés : le graphe décide, et une autre base prouve moins. Mesures du 2026-10-05 : synchro tronc `ab8084fb` -> `base/c2-integration` `689daea1` 3 246 -> 0 ; intégration de C2 5 156 -> 0 ; avance de `main` `207f021f` 46 183 -> 46 183 (garde `gate-files` ; reste rouge, Q-8). `test/r25-integration.test.ts`, `oracle_r25_integration_reads_the_declared_proof` et `ci_r25_integration_rule_is_wired_fail_closed` l épinglent. La ligne (9) d ADR-CM (borne 1 400) reste le repli tant que la règle ne vit pas en CI sur la base. `error_origin` : sans objet (décision de règle). **Livré par** : lots R25-INTEGRATION-RULE-1a et 1b (G0 `docs/G0-lot-r25-integration-rule-1.md`, G7 `docs/G7-lot-r25-integration-rule-1.md`, G2 pliée).

La ligne n est pas versée dans `docs/adr/ADR-M003-phase2-integration.md` : elle attend le contrôle de MONARK (E-6, Q-13). **Pli des réponses (section 13)** : sur Q-13, la ligne est versée dans 1b, en fin de `docs/adr/ADR-M003-phase2-integration.md`, avec la phrase des permissions récrite (bloc de job) et la fusion par rebase désactivée ; MONARK la contrôle au diff.

## 8. Questions pour MONARK, avec l avis de la G2

| Q | Défaut appliqué | Avis de la G2 |
|---|---|---|
| Q-1 liste close | `base/<nom>` en grammaire fermée | accepté, mais préfère l énumération datée : n importe quel écrivain peut créer `base/x`, y fusionner une fonctionnalité en tranches de 1 205 puis l intégrer à 0. À défaut, une ligne datée par nouvelle `base/*` |
| Q-2 permissions | aucune élargie | ne pas élargir tant qu un run candidat n a pas rendu 403 ; le premier run de la synchro tranche ; sur un 403, les trois éditions `read` (section 3) |
| Q-3 preuve machine | fusionnée dans `L` + r25 vert sur la tête exacte | d accord, **avec B-2** (plié) : le check-run seul ne lie pas la mesure à la cible |
| Q-4 `min(W, NEW)` | oui | oui |
| Q-5 #56, #89 | ne prouvent rien | oui (T-8) |
| Q-6 marqueurs | `--remerge-diff` brute | oui, avec `merge.conflictStyle=merge` épinglé (m-2, plié) |
| Q-7 fusion par rebase | à désactiver (investisseur) | oui (mesuré : elle est permise). Imposer la fusion GitHub plutôt que locale a un intérêt, mais B-1 rend la fusion locale sûre |
| Q-8 avance de `main` | hors lot ; recommandation : exception keyée (i) | hors lot ; (i) acceptable ; la garde `gate-files` y est déclenchée par `04c97744` |
| Q-9 juge pris sur la cible | non | pas de `pull_request_target` ; pour l oracle, B-3 (plié) ; pour la CI, une suite possible |
| Q-10 clé D4 | accepté | accepté |
| Q-11 git de l oracle | **pli delta 2 : le git de la machine Windows de l oracle doit être ≥ 2.40** (`--attr-source`, B-6 ; `--remerge-diff` demande 2.36). Plus ancien : le module rend `W` (mode `error`, message `git <v> is older than 2.40`) | oui ; ajouter aussi `git --version` au journal r25 de l oracle (absent de la clé D4). Non plié : hors des trois bloquants ; à faire au prochain lot de l oracle |
| Q-12 ancre hors zone | `test/dojo-render.test.ts:326` -> `ci.yml:245` (était `:226`) | ouvrir cette ligne de commentaire à la zone du pli. Non touchée : elle reste à ouvrir par MONARK (1b ne change pas le décalage : les lignes du job r25 gardent leur nombre) |
| Q-13 D9 nonies | à contrôler | à réécrire après B-1 à B-3 (fait, section 7 : fusion mesurée, contribution `M^1..M`, portée de `gate-files`, oracle avec son module, nom du module), puis à verser dans le pli après le contrôle de MONARK |

- **Q-15 (neuf, pli delta) filet `W − Σ contrib`** : non ajouté. Voir la section 10.
- **O-1 (neuf, hors lot, item pour MONARK)** : un `.gitattributes` **de l arbre mesuré** qui marque `src/** -diff` (ou `binary`, ou un pilote binaire) fait compter 3 000 lignes pour 1 (la ligne de `.gitattributes`), mesure de la G2 delta. Le trou existe **déjà au tronc**, pour le compte `W` d aujourd hui, en CI comme dans l oracle ; ce lot ne l aggrave pas (il prend `min(W, …)`, et `core.attributesFile=` du module ne couvre que les attributs utilisateur). Correction possible dans un lot à part : `git --attr-source=<cible>` sur les comptes (git ≥ 2.40, mesure de la G2 : 3 001), ou `.gitattributes` ajouté à la garde `gate-files`. Même famille, à traiter avec lui : le compte `W` de `r25()` (oracle) et du job bash lit `--shortstat` dans la langue de git (une traduction perdrait les suppressions) ; un `conflict-marker-size` de l arbre mesuré change les marqueurs (sans effet sur le module, qui ne lit pas les marqueurs). **Pli delta 2** : le module lit désormais les attributs de l arbre vide (B-6) ; un `.gitattributes` mesuré n abaisse plus son compte. `W`, lui, reste exposé : le module ne rend jamais plus que `W`. **Côté oracle, fermé dans 1b** : la lecture `W` de `scripts/oracle/r25.mjs:27` prend `--attr-source=<arbre vide>` (et `core.bigFileThreshold=512m`, m-d), une ligne dans la zone ouverte ; T-4 par l oracle l épingle (après un `.gitattributes` mesuré `* -diff`, 32 et 17, même sortie ; 0 sans le gel). **Côté CI, O-1 reste ouvert** : le `W` de la CI est calculé par la ligne `git diff --shortstat` du job bash, inchangée (elle est la forme que lisent `R25_DIFF_RE`, le test 38 et le contrôle M-42f′) ; un `.gitattributes` mesuré `-diff` y abaisse encore `W`, et le module, plafonné par `W`, ne le relève pas. Correction CI : lot à part. **Pli delta 3 (m-h)** : la phrase du pli delta 2 « l oracle est plus strict que la CI, jamais plus laxiste » était fausse. Contre-exemple de la G2 delta 3 : `.gitattributes` mesuré `*.dat diff`, et un `src/blob.dat` fait d un octet NUL puis de 3 000 lignes ; le `W` de la CI valait 3 001, celui de l oracle 0 (lecture à l arbre vide : binaire), le module 0. Ce n était pas exploitable vers le vert (sans la ligne `diff`, le `W` de la CI vaut déjà 0). Correction retenue, peu coûteuse : le `W` de l oracle est désormais le plus grand de deux lectures sous le même `PIN` que le module, l une aux attributs de l arbre vide, l autre aux attributs de l arbre mesuré (celle de la CI). **Relation exacte, désormais** : (1) `W` de l oracle ≥ `W` de la CI, à configuration de machine égale (celle de l oracle est épinglée : m-d, m-f, m-g) ; il le dépasse quand un attribut mesuré abaisse un compte (`-diff`, `binary`, un pilote) ; (2) en mode `integration`, le compte est `min(module, W)` et le module est le même des deux côtés : l oracle n est jamais sous la CI ; (3) le module ne lit aucun attribut mesuré : sous un attribut qui abaisse, il est plus strict que la CI ; sous un attribut qui force le texte (`diff`) sur un contenu binaire, il compte le contenu (0 pour le binaire) et ramène la PR candidate de la CI de 3 001 à 0, ce qui n ouvre aucun vert que le contenu seul n aurait pas donné.
- **Réponses de MONARK (2026-10-05)** : Q-1 à Q-15 et O-1 sont répondues ; leur pli est la section 13.
- **Q-14 (neuf, découpe)** : 1a puis 1b, deux PR écrites vers le tronc, chacune sous 547. 1a seule est inerte (aucun appelant). La PR de 1b est mesurée contre le tronc après la fusion de 1a ; avant, contre la tête de 1a.

## 9. Pli de la G2

| Point | Correction | Test (rouge au gel d origine, vert au gel plié) | Tueur |
|---|---|---|---|
| **B-1** fusion locale d une PR prouvée | `provenSet` n ajoute plus `M` : `rev-list M^2 ^M^1` seul (squash inchangé) | `r25i_local_merge_of_a_proven_pr_counts_its_remerge_diff` (300 au lieu de 0) | `scripts/lot-size-integration.mjs:51` `[m, ...rows(...)]` |
| **B-2** mesure non liée à la cible | une PR ne prouve que si `git diff --shortstat M^1 M` sous chaque pathspec ≤ sa borne (`boundsOf`) | `r25i_proving_pr_contribution_is_remeasured` (2 005 au lieu de 0) | `:50` ligne retirée |
| **B-3** l oracle exécute le juge mesuré | `r25()` exécute `JUDGE` (module de l arbre de l oracle), `W` (mode `gate-files`) si les octets du clone diffèrent ; module dans la clé D4 | `oracle_r25_runs_its_own_module_and_refuses_a_foreign_one` (module forgé, commit non prouvé ou PR prouvante : `gate-files`, 53, rouge) ; T-11 (part `script`) | `scripts/oracle/r25.mjs:20` (`JUDGE` -> clone), `:44` (comparaison retirée), `run.mjs:62` |
| m-1 survivants | test de `buildProof` à transport simulé ; T-7 sur `.github/workflows/` | `r25i_build_proof_needs_a_measured_head_and_reads_nothing_for_a_written_pr` ; T-7 | `:122`, `:121`, `:120`, `:108`, `:24` |
| m-2 configuration git | options épinglées (écart 16) ; noms lus avec `-z` (écart 7) | T-4 sous `GIT_CONFIG_PARAMETERS` zdiff3 + patience (31 sinon 32) ; T-7 nom non ASCII | `:28`, `:91` |
| m-3 échéance | 120 s globales (écart 17) | test `buildProof` (échéance passée : levée, zéro appel) | `:105` |
| m-4 `${{ github.base_ref }}` | `--base "origin/$GITHUB_BASE_REF"` ; le test de câblage interdit `${{` sur une ligne qui lance le module | test de câblage ; T-10 (`GITHUB_BASE_REF` posé) | `ci.yml:99` |
| m-5 débordement bash | bras `??????????*` (10 chiffres ou plus, `W`). Sûr : un tel compte dépasse ses deux bornes, donc `W`, plus grand, est rouge aussi | test de câblage | `ci.yml:106` |
| m-6 `base_sha`, `pr.number` | non vérifiés, dit dans D9 nonies | - | - |
| m-7 G7 §3 | réécrit (section 3) | - | - |

Coût R-25 du pli : 109 lignes (510 -> 619), d où la découpe 1a / 1b.

## 10. Pli de la G2 delta

| Point | Correction | Test (rouge à `99edbc33`, vert au gel `2e23d9fc`) | Tueur |
|---|---|---|---|
| **B-4** lignes d un commit prouvé, annulées dans le net de sa PR, gardées par une fusion à conflit | `remerged()` : `--remerge-diff` à fichiers entiers ; fichier en conflit de contenu compté entier ; conflit structurel ou sans hunk : maximum des diffs aux parents (comptes et garde `gate-files`) | `r25i_conflict_kept_material_of_a_proven_pr_counts` : rename/delete côté tronc **3 000** et côté branche **3 000** (G2 : 0), conflit de contenu **3 005** (`W`, voir ci-dessous ; 6 sans le pli), sous `GIT_DIFF_OPTS=--unified=0` | `scripts/lot-size-integration.mjs:92` SDL (garde structurelle), `:93` (contexte des fichiers en conflit), `:32` (`GIT_DIFF_OPTS`) |
| m-a attributs utilisateur | `-c core.attributesFile=` (et, sur 1b, dans `scripts/oracle/r25.mjs`) | `r25i_user_git_attributes_do_not_lower_counts` : `* -diff` par XDG ou par `core.attributesFile`, 300 restent 300 (0 sans le pli) | `:31` |
| m-b G0 périmé | G0 : nom du module, export réel, commandes réelles (`proof --pr <n> [--base <ref>] --out`, sans `--repo` ; lignes CI de 1b), note sur la table des tueurs du plan | - | - |
| m-c `boundsOf()` | lu dans le job r25 seul, une seule déclaration par clé, sinon `W` | `r25i_bound_is_read_once_from_the_r25_job` : leurre 999 999 dans un autre job : 2 005 comptées (0 sans le pli) ; seconde déclaration dans le job : `error`, `W` | `:72` (`lines.slice(from,` -> `lines.slice(0,`), `:75` (`!== 1` -> `=== 0`) |
| O-1 `.gitattributes` mesuré | hors lot : item pour MONARK (section 8) | - | - |

**Écart à la G2 delta (B-4), mesuré** : la correction proposée (en-tête `remerge CONFLICT` d un autre type que `(content)`) ne couvre pas le **conflit de contenu**. Fixture : la PR #5 ajoute `big.txt` (3 000 lignes) puis le réduit à une ligne (net 5, elle prouve) ; une branche partie du milieu modifie une ligne de `big.txt` ; la fusion a un conflit `(content)`, résolu en gardant le côté de la branche. La `--remerge-diff` ne montre que les trois marqueurs et la ligne retirée : **4**, alors que 3 000 lignes jamais mesurées entrent. Elles sont dans la région du conflit, en contexte. D où la lecture à fichiers entiers : un fichier en conflit de contenu compte toutes ses lignes. Le conflit `add/add` est traité comme un conflit de contenu (même forme), ce qui garde T-4 à 31 et 16. Un conflit de contenu résolu en gardant le texte à marqueurs n a pas de hunk : il tombe dans le cas structurel. Dans la fixture, le compte du contenu vaut 3 005 = `W` (3 004 de la fusion, 2 du commit de la branche, plafonnés à `W`).

**Coût sur les données réelles** : nul (section 4). Aucune des 25 fusions non prouvées de la synchro et de C2 n a de conflit sous les pathspecs (leurs `--remerge-diff` y valent 0, et un conflit de contenu y laisse au moins ses marqueurs). Sous le pli, une fusion de synchro à conflit **dans le code** comptera désormais tout le fichier résolu (contenu), ou ses diffs aux parents (structurel) : c est le prix du fail-closed.

**Filet facultatif `NEW = min(W, max(ΣU, W − Σ contrib))`** : mesuré sans effet aujourd hui (synchro Σ 3 300 ≥ 3 246, C2 Σ 5 226 ≥ 5 156 : 0 / 0 conservé). **Non ajouté** : B-4 est fermé à son mécanisme (structurel et contenu) ; les marges sont minces (54 et 70 lignes) ; `W − Σ contrib` grandit avec des matières sans rapport avec une fraude (diff au premier parent des fusions de synchro non prouvées) et rougirait des synchros légitimes ; il reste une décision de MONARK (Q-15).

**Coût R-25 du pli delta** : 92 lignes sur 1a (421 -> 513, borne 547).

## 11. Pli de la G2 delta 2

| Point | Correction | Test (rouge à `c640558c`, vert au gel `1a9f6442`) | Tueur |
|---|---|---|---|
| **B-5** une fusion propre fait entrer dans CODE, par renommage, des lignes qu aucun commit n y a comptées | la `--remerge-diff` reste ; une fusion non prouvée compte `max(remerge-diff, diff combiné)`, le diff combiné étant `git show --cc --no-renames --unified=0` sous la même pathspec (fonctions `both` et `combined`) ; le cas structurel reste structurel | `r25i_merge_time_rename_into_the_code_spec_counts` : (a) `docs/x.md` (40 lignes, hors CODE) reçoit 3 000 lignes sur `g`, le tronc le renomme en `src/x.md`, fusion propre : **3 040** = 40 + 3 000 ; (b) le tronc déplace `docs/d/` sous `src/d/` (2), `g` ajoute `docs/d/new.md` (3 000), conflit `file location` résolu en gardant le fichier : **3 002** ; (c) même chose depuis CONTENT, `site/d/new.md` (7 000) : **7 002** ; chaque fois côté tronc et côté branche, et `W` égal. Au gel précédent : 40, 2, 2 | `scripts/lot-size-integration.mjs:124` (`both(remerged(` -> `((x) => x)(remerged(`), `:101` (`Math.max(r, k)` -> `r`) |
| **B-6** un `.gitattributes` mesuré `merge=union` rend propre la fusion de B-4 | `--attr-source=<arbre vide>` sur chaque appel git du module (`gitIn`) | variante de `r25i_conflict_kept_material_of_a_proven_pr_counts` : après le conflit de contenu, un commit non prouvé ajoute `* merge=union` : **3 006** = `W` (4 au gel précédent) | `:34` (`--attr-source=${EMPTY_TREE}` retiré) |
| **m-d** `core.bigFileThreshold` non épinglé | `-c core.bigFileThreshold=512m` dans `PIN` et, sur 1b, dans la lecture `W` de `scripts/oracle/r25.mjs:27` | `r25i_user_git_attributes_do_not_lower_counts` sous `GIT_CONFIG_PARAMETERS='core.bigfilethreshold'='1'` : 300 glissées + un commit de 7 lignes = **307** (0 au gel précédent) ; 1b : T-4 par l oracle sous le même seuil, 31 / 16 (0 sans le gel) | `:33` ; `scripts/oracle/r25.mjs:27` |
| **m-e** seuil de version | 2.36 -> **2.40**, message exact (`--remerge-diff` 2.36, `--attr-source` 2.40) ; plus ancien : levée, `W` | non testable ici (git 2.43) ; un git plus ancien lèverait déjà sur `--attr-source` | - |
| **O-2** `metric()` | fail-closed : une sortie `--shortstat` non vide sans `insertion` ni `deletion` lève (écart 20) | aucun : l entrée n est pas atteignable sous les épinglages (binaire seul, mode seul : `0 insertions(+), 0 deletions(-)`, mesuré) | - |
| **O-1** (hors lot) | côté module : fermé par B-6 ; côté oracle (1b) : `--attr-source=<arbre vide>` dans la lecture `W` de `scripts/oracle/r25.mjs:27` ; côté CI : ouvert (section 8) | 1b : T-4 par l oracle après un `.gitattributes` mesuré `* -diff` : 32 / 17, même sortie (0 sans le gel) | `scripts/oracle/r25.mjs:27` (`--attr-source=${EMPTY_TREE}` retiré) |

**Écart à la G2 delta 2, mesuré** : le scénario (c) compte ici 7 002 et non 7 004. Ma fixture déplace un seul fichier de 2 lignes (`site/d/a.md`) ; les nombres attendus sont en forme close, `moved + n`.

**Le diff combiné ne remplace pas la `--remerge-diff`** : il masque une ligne identique à l un des parents (G0, section 3), donc une résolution qui garde un côté. Il ne sert que de plancher.

**Coût sur les données réelles** : nul (section 4) ; synchro et C2 restent à 0 / 0, toutes les PR prouvantes prouvent encore.

**Coût R-25 du pli delta 2** : 33 lignes sur 1a (513 -> 546, borne 547).

## 12. Pli de la G2 delta 3 (1b seul)

**Relecture** : `G2-r25-integration-rule-1-delta3.md` (G2 neuve de RECHERCHES, pièce de coordination du 2026-10-04), verdict APPROUVE SOUS RÉSERVE, aucun bloquant, trois mineurs m-f à m-h et une observation O-3. 1a (`a00e62f3`, PR #154) est approuvée telle quelle et **ne change pas** : tout le pli est sur 1b, depuis `bbdddb4d`.

### 12.1 Note G0 du pli (écrite avant les tests)

- **m-f** (attributs de machine hors de `--attr-source`) : le module, source unique, met `GIT_ATTR_NOSYSTEM=1` dans l environnement de git (fichier système `$(prefix)/etc/gitattributes`) ; un `$GIT_DIR/info/attributes` non vide (que `--attr-source` ne remplace pas) est une erreur, donc `W` (mode `error`). L oracle fait le même contrôle avant sa lecture `W` (levée, donc RED par `run.mjs`), et clone avec `--template=` : le gabarit de la machine (`GIT_TEMPLATE_DIR`, `init.templateDir`) n atteint plus le clone. Tests : le reproducteur de la G2 (B-4 « contenu » plus `info/attributes` `* merge=union`, puis `* -diff` : `W` = 3 005) ; `* -diff` dans le clone, par le `r25()` de l oracle : levée ; le gabarit `* -diff` par `run.mjs` : 3 lignes, vert. `GIT_ATTR_NOSYSTEM` n est pas épinglé par un test (il faudrait écrire le fichier système de la machine) : déclaré.
- **m-g** (le `W` de l oracle n épingle pas `diff.renames`) : le module exporte `PIN` et son environnement (`GIT_ENV`) ; la lecture `W` de `scripts/oracle/r25.mjs:27` les reprend, donc lit sous exactement les options et l environnement du module (dont `LC_ALL=C` et `GIT_DIFF_OPTS` retiré). Test : le reproducteur de copie de la G2 sous `diff.renames = copies` par `~/.gitconfig` (`HOME`), `GIT_CONFIG_GLOBAL` et `GIT_CONFIG_PARAMETERS` : 3 002, comme la CI (2 sans épinglage).
- **m-h** (« jamais plus laxiste » est faux) : correction peu coûteuse retenue plutôt qu une déclaration. Le `W` de l oracle devient le **plus grand** de deux lectures sous le même `PIN` : celle des attributs de l arbre vide (O-1, côté oracle) et celle des attributs de l arbre mesuré, qui est la lecture de la CI. Le `W` de l oracle n est donc jamais sous celui de la CI ; le compte du module est le même des deux côtés, et `min(module, W)` est croissant en `W`. Test : le reproducteur de la G2 (`*.dat diff` mesuré, `src/blob.dat` avec un octet NUL puis 3 000 lignes) : 3 001 dans les deux lectures (0 au gel précédent).
- **O-3** (le mutant 2.40 -> 2.36 survit) : noté seulement (section 12.3).
- Coût prévu : une trentaine de lignes de code, une soixantaine de tests, ce texte. Les lignes visées par les tueurs existants restent à leur numéro (le module garde 33 et 34, l oracle 20, 27, 31, 35, 44, 48 ; `run.mjs` 99 et la suite).

### 12.2 Pli

| Point | Correction | Test (rouge à `af41648c`, vert au gel `38ce8cb3`) | Tueur |
|---|---|---|---|
| **m-f** attributs de machine hors de `--attr-source` | module : `GIT_ATTR_NOSYSTEM=1` dans `GIT_ENV`, l environnement de chaque appel git ; `infoAttributes()` (`git rev-parse --path-format=absolute --git-path info/attributes`, fichier non vide) lève dans `effective()`, donc `W`, mode `error` ; oracle : même contrôle en tête de `r25()` (levée, RED par `run.mjs`) ; `run.mjs:99` clone avec `--template=` | `r25i_machine_attributes_return_the_written_count` : B-4 « contenu » puis `info/attributes` `* merge=union` (3 avant) ou `* -diff` (0 avant) : **3 005** = `W` ; `oracle_r25_refuses_machine_attributes` : `* -diff` dans le clone, `r25()` lève (lisait 0 pour 3 000) ; `oracle_clone_takes_no_machine_template` : `GIT_TEMPLATE_DIR` avec `info/attributes` `* -diff`, `run.mjs` lit 3 lignes, vert (0 avant) | `scripts/lot-size-integration.mjs:114` ; `scripts/oracle/r25.mjs:23` ; `scripts/oracle/run.mjs:99` |
| **m-g** le `W` de l oracle n épingle pas `diff.renames` | le module exporte `PIN` et `GIT_ENV` ; la lecture `W` de `scripts/oracle/r25.mjs:27` les reprend (plus de liste propre à l oracle) | `oracle_r25_w_reads_under_the_module_pin` : copie de la G2 sous `diff.renames = copies` par `~/.gitconfig` (`HOME`), `GIT_CONFIG_GLOBAL`, `GIT_CONFIG_PARAMETERS` : git non épinglé lit 2, l oracle **3 002** (2 avant) | `scripts/lot-size-integration.mjs:33` (`diff.renames=true` retiré du `PIN` du module : l oracle retombe à 2) |
| **m-h** « jamais plus laxiste » faux | correction plutôt que déclaration : `W` de l oracle = le plus grand de deux lectures sous le `PIN`, attributs de l arbre vide et attributs mesurés (celle de la CI) ; texte de la section 8 (O-1) et de D9 nonies (section 7) récrit : relation exacte | `oracle_r25_w_is_never_below_the_ci_read` : `*.dat diff` mesuré, `src/blob.dat` = NUL puis 3 000 lignes : CI **3 001**, oracle **3 001** (0 avant) | `scripts/oracle/r25.mjs:27` (seconde lecture retirée) |

- **Non épinglé, déclaré** : `GIT_ATTR_NOSYSTEM`. Le test devrait écrire le fichier d attributs système de la machine (`$(prefix)/etc/gitattributes`), hors de tout répertoire jetable.
- **Ré-ancrage** : les tueurs de T-4 `scripts/oracle/r25.mjs:27` « `core.attributesFile=` retiré » et « `core.bigFileThreshold=512m` retiré » visaient la liste propre à l oracle, remplacée par `...PIN` : ils deviennent un seul tueur (`...PIN` retiré, tué par les cas attributs utilisateur et seuil de 1). Le tueur `--attr-source` vise la première des deux lectures.
- **Coût R-25 du pli** : 110 lignes contre `bbdddb4d` ; 1b contre 1a passe de 232 à **326** (borne 547).

### 12.3 Observation O-3, notée

Le mutant du plancher de version (`< 2040` -> `< 2036`, `scripts/lot-size-integration.mjs:114`) survit à tout le fichier de tests : git 2.43 est au-dessus des deux seuils. Pas de test ajouté : sous 2.40, `--attr-source` fait déjà échouer git et le module rend `W` ; le plancher ne sert qu au message. Un test avec un `git` factice sur le `PATH` (`--version` -> `2.39.5`) l épinglerait, s il le faut.

## 13. Pli des réponses de MONARK au G0 (Q-1 à Q-15, O-1 ; 1b seul)

**Messages** : `2026-10-05-MONARK-vers-RECHERCHES-R25-G0-reponses.md` (Q-1 à Q-10), `…-rattrapage.md` (Q-2 bis, Q-11 à Q-15, O-1), puis `…-Q-2-job.md` (les deux premiers se sont croisés avec nos messages : **Q-2 bis est annulé, le bloc de job est gardé**). 1a (`a00e62f3`, PR #154) ne change pas : tout le pli est sur 1b, depuis `9746c5ba`.

**Commits** (aucun rebase, aucune poussée forcée ; chacun poussé) :

| Commit | Rôle |
|---|---|
| `6c9a34eb` | tests rouges, Q-2 au niveau du job |
| `48a509f6` | tests rouges, Q-2 bis (bloc racine à trois portées), sur le rattrapage |
| `b882fe05` | gel Q-2 bis ; **rouge en CI** (`g3-export`, `g3-verification`), voir ci-dessous |
| `62b23092` | tests rouges, Q-2 final : retour au bloc de job (version de `6c9a34eb`) |
| `1c8d3ef8` | gel Q-2 final, et correction de la cause du rouge de `b882fe05` |
| `bbd6837b` | fusion du tronc `lot/etude-suite` `58054d8c` (1a fusionnée par #154) dans 1b, commit de fusion, aucun rebase ; arbre du tronc identique à `a00e62f3`, aucun changement de contenu |
| ce commit | docs : lignes d ADR (Q-13, Q-8, D1) et ce G7 |

### 13.1 Q-2 : un seul bloc de job, sur `r25-taille-de-lot`

Bloc racine, inchangé : `permissions:` / `contents: read`. Bloc du job `r25-taille-de-lot`, et de lui seul (`.github/workflows/ci.yml:45-48`, sous une ligne de commentaire) :

```yaml
    permissions:
      contents: read
      pull-requests: read
      checks: read
```

Le commentaire du bloc racine dit l exception (« the one job-level block of the lot-size job ») sans le mot `r25` : ce commentaire passe dans le workflow public dérivé, dont l oracle est `grep -c r25 = 0` (ADR-M004 D7 bis R1).

**Rouge en CI à `b882fe05`, cause et correction** : le commentaire racine de Q-2 bis disait « the r25 job s integration proof ». `derivePublicWorkflow` retire le job r25, pas ce commentaire : le test 42 (`g3-export`, « exported workflow must contain no r25 reference ») et le test 42(f′) `export_public_derived_jobs_are_byte_identical` (`g3-verification`, `test:main`) étaient rouges, reproduits ici. Au gel `1c8d3ef8`, le commentaire dit « the lot-size job » : `npm run test:export` et `npm run gate:vocab && npm run typecheck && npm run test:main` (les commandes exactes des deux jobs) sont verts, mesurés avant la poussée du gel.

**Test** `ci_workflow_declares_least_privilege_permissions` (`test/ci-gates.test.ts`) : une fonction `problems(lignes)` juge un texte de workflow ; le vrai n en a aucun. Elle exige :

- une seule clé `permissions:` en colonne 0, après `on:` et avant `jobs:`, de corps exactement `  contents: read` ;
- une seule autre clé `permissions` dans tout le fichier (toute forme : clé de bloc, entre guillemets, mapping en ligne), à 4 espaces, ouvrant un bloc, dans le job `r25-taille-de-lot`, de corps exactement `contents: read`, `pull-requests: read`, `checks: read`, dans cet ordre ;
- aucun `write` ni `write-all` sur une ligne non commentée.

Onze mutants nommés, construits depuis le vrai workflow, doivent chacun être refusés : bloc racine retiré ; racine élargie (`pull-requests: read`) ; racine `contents: write` ; racine `read-all` en ligne ; bloc de job retiré ; portée en plus (`statuses: read`) ; portée manquante (`checks`) ; portée en écriture (`checks: write`) ; `permissions: write-all` sur le job ; bloc déplacé sur `g1-controle-generation` ; second bloc sur `g3-verification`. Le workflow public dérivé (job r25 retiré) n a que le bloc racine, `contents: read`. Tueur : `// killer: .github/workflows/ci.yml:48 CONST "checks: read" -> "statuses: read"`.

Rouge : à `9746c5ba` (et à `b882fe05`), le test échoue par assertion (`expected ONE job-level permissions block (r25-taille-de-lot), saw 0`).

### 13.2 Q-12 : ancre de `test/dojo-render.test.ts:326`

Le tueur visait `ci.yml:226` (le job `g3-site` avait glissé à `:245` avant ce pli). Avec le bloc de job (+5) et la ligne de commentaire racine (+1), la ligne `run: npm run build -w @monark/site` est `ci.yml:251` : le tueur y est ré-ancré (ANCRE, et tué à la main). Les tueurs de `ci-gates` suivent le même décalage : `ci.yml:99` -> `:105` (deux), `:106` -> `:112`, `:183` -> `:189`.

### 13.3 Q-13, Q-8 et D1 : lignes d ADR versées dans 1b (docs seules, hors du pathspec)

- **ADR-M003 D9 nonies** : le texte de la section 7, versé en fin de `docs/adr/ADR-M003-phase2-integration.md`. Deux phrases changent : la CI lit la preuve sous le seul bloc de job (au lieu de « portées ajoutées sur un 403 »), et la fusion par rebase est désactivée (Q-7) ; la mesure de l avance de `main` renvoie à D9 decies.
- **ADR-M003 D9 decies** (lettre libre : `decies` n existe nulle part dans `docs/adr`), versée juste après D9 nonies. Le sha du tronc à T0 reste à écrire par MONARK. Texte :

> **Addendum D9 decies — 2026-10-05 (exception PONCTUELLE R-25, décision de l investisseur du 2026-10-05 sur Q-8, verbatim « Exception unique (Recommandé) » ; non-précédent)** : la PR qui avance `main` jusqu au tronc `lot/etude-suite` à T0 est exemptée, une seule fois, de la borne R-25 (`VIBEGATES_PR_LIMIT = 1205`, `VIBEGATES_CONTENT_LIMIT = 8000`). L exception est liée à deux sha exacts : la base `main` = `207f021f` et la tête du tronc à T0 = `<sha complet de la tête de lot/etude-suite à T0, écrit par MONARK à T0>`. Elle ne couvre rien d autre : ni une autre base, ni une autre tête (un commit de plus sur le tronc, ou `main` déplacé), ni une seconde PR, ni une relance après la fusion. Raison mesurée : D9 nonies ne prouve pas cette avance, et c est voulu (E-3) : 1 276 commits du tronc datent d avant la livraison par PR, ont été fusionnés en local ou réécrits, aucune PR ne les prouve, et des commits non prouvés touchent la gate (garde `gate-files`, déclenchée par `04c97744`) ; mesure du 2026-10-05 : 46 183 lignes CODE et 6 137 CONTENT, compte d aujourd hui inchangé par la règle. Chaque lot porté par l avance a franchi R-25 à sa propre PR. Ni la borne, ni les pathspecs, ni le job `r25-taille-de-lot` ne changent ; le run r25 de cette PR reste rouge et mesuré, et la fusion s appuie sur cette ligne, comme D9 quinquies (#56) et D9 octies du 2026-09-24 (#89). Hors de cette avance, la règle normale s applique (D9, ses addenda et D9 nonies). `error_origin` : sans objet (décision d exception). **Livré par** : lot R25-INTEGRATION-RULE-1b (texte, G7 `docs/G7-lot-r25-integration-rule-1.md` section 13) ; le sha de T0 est écrit par MONARK à T0.

- **ADR-CODEQL-ALERTS-1, ligne datée sous D1**, versée entre D1 et D2 de `docs/adr/ADR-CODEQL-ALERTS-1.md`. Texte :

> **Ligne datée D1 — 2026-10-05 (portées de lecture pour la preuve d intégration R-25 ; lot R25-INTEGRATION-RULE-1b, G0 Q-2, réponse de MONARK du 2026-10-05, bloc de job confirmé le même jour)** : le bloc racine reste exactement `permissions:\n  contents: read`, après `on:` et avant `jobs:`. Le job `r25-taille-de-lot`, et lui seul, reçoit son propre bloc, exactement `contents: read`, `pull-requests: read`, `checks: read`, rien d autre. Raison : la preuve d intégration R-25 (ADR-M003 D9 nonies) lit par l API, avec le jeton du run, les PR fusionnées et le check-run `r25-taille-de-lot` de leur tête. Sur ce dépôt public ces lectures passent très probablement sans portée, mais une portée déclarée retire le doute ; un 403 ne laisserait que le compte d aujourd hui, jamais un faux vert. Lecture seule, au niveau du job : le moindre privilège, aucun autre job ne voit ces portées, aucune écriture n est ouverte. Ce job est interne : `derivePublicWorkflow` le retire, le workflow public garde le seul bloc racine. Tout autre bloc, toute autre portée ou tout `write` reste une décision d ADR. Test racine : `ci_workflow_declares_least_privilege_permissions` (le bloc racine exact ; un seul bloc de job, sur `r25-taille-de-lot`, exact ; aucun `write` ; onze mutants nommés refusés ; le workflow dérivé sans bloc de job). **Livré par** : lot R25-INTEGRATION-RULE-1b (G7 `docs/G7-lot-r25-integration-rule-1.md`, section 13).

MONARK contrôle les trois au diff (Q-13).

### 13.4 Autres réponses, notées

- **Q-7, méthodes de fusion** : MONARK a désactivé « Allow rebase merging » sur le dépôt de gouvernance (décision de l investisseur, vérifiée par MONARK). Restent le squash et le commit de fusion. La preuve couvre les deux : un squash (un parent) prouve `M` seul ; un commit de fusion prouve `rev-list M^2 ^M^1` si la tête de la PR est son second parent. Le cas « dernier commit rebasé » de D9 nonies reste dans le texte pour une PR fusionnée avant la désactivation.
- **Q-11 : réglé**. Git 2.55.0 sur la machine Windows de l oracle (≥ 2.40, `--attr-source` disponible).
- **Q-14 et Q-15 : d accord**. 1a puis 1b ; filet `W − Σ contrib` non ajouté.
- **O-1** : devient le lot à part **R25-ATTR-SOURCE-1**, à RECHERCHES, après 1b (le `W` de la CI sous un `.gitattributes` mesuré).
- **Q-1, Q-3 à Q-6, Q-9, Q-10** : les défauts tiennent (Q-9 : ni `pull_request_target`, ni juge pris sur la cible).

### 13.5 Vérifications (gel `1c8d3ef8`, worktree `/home/user/monark-governance-r25i`, Node 24.21.0, proxy retiré pour les tests)

| Vérification | Résultat |
|---|---|
| red-proof `--base 9746c5ba --gel 1c8d3ef8 --draw 1 --seed 37` | **OK** : 1 test jugé, F2P ; 44 inchangés ; 1 tueur tiré (toute la population), tué (`ci.yml:48`). `RED-PROOF.json` sha256 `b1a9290fcdf6102fc3b843c1e6ede7a7aaaab875649fbcc4368d7ff1c84618b8` |
| tueurs ré-ancrés, à la main | 6 sur 6 tués : `ci-gates` `ci.yml:105` (deux), `:112`, `:189`, `:48` ; `dojo-render` `ci.yml:251` |
| ancres `--touched 9746c5ba HEAD` | 29 tueurs, 29 ANCRE, 0 DERIVE, 0 PERDU (`ci-gates` et `dojo-render`) |
| `r25-integration`, `ci-gates`, `oracle-run` | 73/73 |
| `npm run test:export` (job `g3-export`) | vert |
| `gate:vocab && typecheck && test:main` (job `g3-verification`) | vert : 2 325 tests, 2 303 verts, 0 rouge |
| `npm test` complet | **2 326 tests, 2 304 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0 |
| `tsc --noEmit` ; `lint` ; `lint:ratchet` | 0 ; 0 ; 69/69 |
| `gate:vocab` ; `lang:gate` ; `export:check` | OK ; OK ; OK |

**R-25** (`r25()` de `scripts/oracle/r25.mjs` du tronc `ab8084fb`, sur le `ci.yml` du gel) : 1b contre la tête de 1a `a00e62f3` : `STAT 371 insertions, 67 deletions, changed 438`, `CONTENT_STAT 0`, GREEN, sous 547 (326 avant ce pli). 1a + 1b contre le tronc `ab8084fb` : **942** (896 + / 46 −), sous 1 205. Ce pli seul, contre `9746c5ba` : 120 (88 + / 32 −).

**Après la fusion de 1a** (#154, tronc `58054d8c`, PR #155 reciblée sur `lot/etude-suite`) : 1b contre `58054d8c`, la mesure de la CI pour #155 : **438** (371 + / 67 −), `CONTENT_STAT 0`, GREEN, sous 547 (le tronc a l arbre de `a00e62f3`). Tests du lot après la fusion `bbd6837b` : 73/73.
