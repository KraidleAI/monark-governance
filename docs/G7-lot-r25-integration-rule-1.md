# G7 - lot R25-INTEGRATION-RULE-1 (R-25 ne compte que le neuf d une PR d intégration prouvée), pli de la G2, lots 1a et 1b

- **Session** : RECHERCHES, 2026-10-05. Tronc `lot/etude-suite` @ `ab8084fb` (inchangé pendant le lot et le pli : pas de fusion de synchro).
- **Relecture pliée** : `G2-r25-integration-rule-1.md` (G2 neuve de RECHERCHES, pièce de coordination du 2026-10-04), verdict APPROUVE SOUS RÉSERVE, trois bloquants B-1 à B-3 et sept mineurs m-1 à m-7. Tous sont pliés (section 9).
- **Découpe** : le lot plié mesure 619 lignes R-25 (borne du lot 547). Il est coupé selon le G0 (section 9) :
  - **1a** `recherches/r25-integration-rule-1a`, depuis le tronc : G0 `bbf6582c` (repris tel quel de `94de83b8`), tests rouges `4d7d2b75`, gel `11e45dac`, docs (ce G7 et le G0 mis à jour, commit suivant) ;
  - **1b** `recherches/r25-integration-rule-1b`, depuis la tête de 1a `99edbc33` : tests rouges `a0bcc3c0`, gel `0b0c96ac`, docs (section 6.2, commit suivant).
- **Branche d origine** `recherches/r25-integration-rule-1` (tête `2475e8e5`, celle relue par la G2) : laissée telle quelle, remplacée par 1a puis 1b. Le G7 d origine y reste lisible ; celui-ci le remplace.
- **Statut** : gel complet des deux lots. Aucune PR ouverte. Deux PR écrites vers le tronc, 1a puis 1b (E-7). La règle ne vit qu après la fusion de 1b.

## 1. Ce que livrent les deux lots

| Lot | Fichier | Rôle | R-25 (ins+del) |
|---|---|---|---|
| 1a | `scripts/lot-size-integration.mjs` (neuf) | implémentation unique : `L`, `EXCEPTED_PRS`, `GATE_FILES`, `BOUND_KEYS`, `isCandidate`, `proves`, `provenSet`, `specsOf`, `boundsOf`, `effective`, `buildProof` ; CLI `proof` et `count` | 157 |
| 1a | `scripts/lot-size-integration.d.mts` (neuf) | surface de types du test racine (avec `buildProof`) | 12 |
| 1a | `test/r25-integration.test.ts` (neuf) | T-1 à T-9 (T-4 sur les comptes du module), B-1, B-2, `buildProof` (m-1, m-3) | 252 |
| | **Total 1a** (contre le tronc) | | **421** |
| 1b | `.github/workflows/ci.yml` | job `r25-taille-de-lot` seul : jeton, ligne `proof`, ligne `count` (cible lue dans `$GITHUB_BASE_REF`), repli, deux gardes `case` (la seconde borne la longueur), réassignation, mode | 19 |
| 1b | `scripts/oracle/r25.mjs` | `r25(clone, ciText, base, proofFile)` exécute **le module de l oracle**, seulement si le clone porte les mêmes octets | 26 |
| 1b | `scripts/oracle/run.mjs` | `--r25-proof`, part `r25_proof` de la clé D4, module dans la part `script`, champs `r25_mode` et `r25_proof` | 16 |
| 1b | `test/r25-integration.test.ts` | T-10 (parité CI / oracle), test B-3, T-4 repassé par le `r25()` de l oracle (sous une configuration git hostile) | 100 |
| 1b | `test/oracle-run.test.ts`, `test/ci-gates.test.ts` | T-11 (et la part `script` de la clé), test de câblage (m-4, m-5) ; tueurs ré-ancrés | 26 + 35 |
| | **Total 1b** (contre la tête de 1a ; 1a + 1b contre le tronc : 619) | | **222** |

Mesure : `r25()` **du tronc** (`git show ab8084fb:scripts/oracle/r25.mjs`), pathspec CODE de `ci.yml`, docs hors pathspec. 1a au gel `11e45dac` : `STAT 421 insertions, 0 deletions, changed 421` ; `CONTENT_STAT 0` ; GREEN, sous 547.

## 2. Écarts au G0 (conception)

Les écarts 0 à 14 du G7 d origine restent vrais, sauf 3, 7, 9 et 14, mis à jour ici :

0. **Nom du module** : `scripts/lot-size-integration.mjs`, au lieu de `scripts/r25-integration.mjs`, et preuve CI `$RUNNER_TEMP/lot-size-proof.json`. Raison mesurée : le contrôle du mutant M-42f′ de `test/export-public.test.ts` exige qu aucun `r25` en minuscules ne figure dans le corps du job r25 (précondition de la démonstration de 42(f′), ADR-M004 D7 ter). La G2 juge cette lecture légitime. D9 nonies nomme désormais le module et cette raison, pour qu une recherche de `r25` le retrouve.
3. **Appel du module par l oracle (pli G2 B-3)** : `r25()` exécute `node <arbre de l oracle>/scripts/lot-size-integration.mjs count ...` (constante `JUDGE`, à côté de `scripts/oracle/`), la même commande que la CI. Il compare d abord les octets du module du clone à ceux de `JUDGE` : s ils diffèrent, mode `gate-files`, `W`. Sans module d un côté : mode `error`, `W`.
7. **Garde des fichiers de la gate** : noms lus avec `-z` (pli, mesuré : sans `-z`, git cite un nom non ASCII entre guillemets, `".github/workflows/\303\251.yml"`, et la garde le manquait). Pour une fusion, les noms viennent de sa `--remerge-diff` ; pour un commit simple, du diff au parent.
9. **`base_sha` et `pr.number` de la preuve** : enregistrés, non comparés (G2 m-6 l accepte). Le graphe décide, et une preuve calculée sur une autre base prouve moins, jamais plus. Dit dans D9 nonies.
14. **T-4** : la PR #1 de la fixture passe de 40 à 15 lignes, sous la borne 20 de la fixture, pour rester prouvante sous B-2. Comptes inchangés : 31 (rouge) et 16 (vert).
15. **(pli) Bornes lues par le module** : `boundsOf(ciText)` lit la première ligne `VIBEGATES_PR_LIMIT: "<n>"` et `VIBEGATES_CONTENT_LIMIT: "<n>"`, avec la même expression que `r25()` (l.28 du tronc). Une borne absente lève, donc `W`. Elle n est lue que pour une candidate (une PR écrite ne dépend jamais d elle).
16. **(pli) Options git épinglées** : `-c merge.conflictStyle=merge -c diff.algorithm=myers -c diff.renames=true -c merge.renames=true -c merge.directoryRenames=conflict` sur chaque appel git du module. Mesuré : un `-c` l emporte sur `GIT_CONFIG_PARAMETERS` et sur les fichiers de configuration. Je n ai pas isolé la configuration globale (`GIT_CONFIG_GLOBAL`) : sur la machine Windows de l oracle, elle porte probablement `safe.directory`, et l ignorer rendrait la règle inerte.
17. **(pli) Échéance globale** : `buildProof` refuse tout appel après `deadline` (120 s par défaut) ; `fetchApi` borne chaque requête à `min(30 s, temps restant)` ; `gh api` (local) à 30 s. Pire cas : environ 150 s, sous le `timeout-minutes: 5` du job. Une API lente donne `W`, pas une expiration du job.

## 3. Permissions (Q-2) : la règle est probablement active dès la fusion de 1b

Le G7 d origine disait : « sans cette édition, la fusion du lot est sûre (rien ne s abaisse) ». **C est probablement faux** (G2 m-7) :

- la doc REST de `List pull requests` et de `List check runs for a Git reference` dit : « This endpoint can be used without authentication or the aforementioned permissions if only public resources are requested » ;
- le dépôt est public (mesure de la G2). Le jeton `contents: read` du run lira donc très probablement les deux ;
- non mesurable ici : le proxy de la session injecte son propre jeton, pas un `GITHUB_TOKEN` de run.

Conséquence : la règle vivra très probablement dès la fusion de 1b, et non après une édition de `permissions`. C est pour cela que B-1 à B-3 sont pliés **avant** toute fusion.

Choix (Q-2, avis de la G2) : **aucune permission n est élargie** tant qu un run candidat n a pas rendu 403. Le premier run de la PR de synchro tranchera. Sur un 403, le module ne produit pas de preuve, le job imprime `::warning::R-25 integration proof not obtained`, et le compte est celui d aujourd hui (aucun faux vert). Les trois éditions décrites au G7 d origine (bloc racine à trois lignes `read`, corps du test `ci_workflow_declares_least_privilege_permissions`, ligne datée d ADR-CODEQL-ALERTS-1) ne sont à ouvrir que dans ce cas.

## 4. Mesures avec le module plié (refs du 2026-10-05)

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
| A-3 fusion malicieuse ou résolution | couvert, **y compris la fusion `M` d une PR prouvée** (pli B-1) | T-4 ; `r25i_local_merge_of_a_proven_pr_counts_its_remerge_diff` (300 lignes glissées dans la fusion locale d une PR prouvée : 300 comptées) |
| A-12 gate modifiée hors PR relue | **erreur couverte, attaque couverte par l oracle et par MONARK** (pli B-3) | T-7 (module, `.github/workflows/x.yml`, nom non ASCII) ; `oracle_r25_runs_its_own_module_and_refuses_a_foreign_one` (1b). Voir ci-dessous |
| A-19 (neuf) PR verte contre une autre cible : recibler, cible poussée en arrière, relance d un vieux run | couvert (pli B-2) | `r25i_proving_pr_contribution_is_remeasured` (2 000 lignes jamais mesurées : 2 005 comptées) |

**Portée réelle de la garde `gate-files`** (G2 B-3) : elle protège contre une **erreur**, pas contre une **attaque**. En CI, elle est exécutée par le module de l arbre mesuré ; une PR qui remplace le module (ou `ci.yml`) remplace aussi la garde (résidu R-1, vrai de toute gate sous `pull_request`). La preuve contre une attaque est double :
- l oracle exécute son propre module (arbre de confiance de l opérateur) et rend `W` si les octets du module mesuré diffèrent ; le module entre dans la part `script` de sa clé D4 ;
- MONARK contrôle par diff, sur chaque PR d intégration, `git diff --stat <cible>...<tête> -- .github/workflows scripts/lot-size-integration.mjs scripts/oracle`. Une ligne non vide est une PR qui touche la gate, à relire comme telle.

Le juge pris sur la cible en CI (Q-9) fermerait R-1 ; il reste une suite possible, hors de ce pli.

## 6. Vérifications

### 6.1 Lot 1a (gel `11e45dac`, Node 24.21.0, git 2.43.0, `TMPDIR=/tmp/r25fold-1`)

- **red-proof** : `node scripts/red-proof.mjs --base ab8084fb --gel 11e45dac --repo <worktree> --draw 12 --seed 37` -> **OK** : 12 tests jugés (12 `new-module`), 0 inchangé, **12 tueurs tirés, 12 tués**. `RED-PROOF.json` sha256 `dc1ceba952a72ab3a0f873133016ca5748c864cd98f490560f6f40f77a799b0c`, digest du gel `28518bb5b3df5276229d03adde2549d504300e34f9e1e5954ae35eeedb7b1dfa`.
- **Tueurs à la main** : les 19 tueurs de `test/r25-integration.test.ts` appliqués un par un (avant présent une seule fois sur sa ligne), test visé rejoué, fichier restauré octet pour octet : **19 tués sur 19**, dont les tueurs du pli (B-1 `:51`, B-2 `:50`, m-1 `:120`, `:121`, `:122`, `:108`, m-2 `:28`, `-z` `:91`, `.github/workflows/` `:24`, m-3 `:105`).
- **Ancres** : `verifie-ancres.mjs . --touched ab8084fb HEAD` : 19 tueurs, 19 ANCRE, 0 PERDU.
- `test/r25-integration.test.ts` 12/12 ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.

### 6.2 Lot 1b

Gel `0b0c96ac`, mêmes outils.

- **R-25** (`r25()` du tronc) : contre la tête de 1a `99edbc33`, `STAT 196 insertions, 26 deletions, changed 222`, `CONTENT_STAT 0`, GREEN, sous 547. Après la fusion de 1a, la PR de 1b mesure ces 222 lignes contre le tronc.
- **red-proof** : `node scripts/red-proof.mjs --base 99edbc33 --gel 0b0c96ac --repo <worktree> --draw 12 --seed 37` -> **OK** : 5 tests jugés, tous F2P (test de câblage, T-11, T-4 par l oracle, test B-3, T-10), 59 inchangés, **5 tueurs tirés (toute la population), 5 tués**. `RED-PROOF.json` sha256 `de4ee0b37cd30b883656b51622b63707b8b2b1a38d18ee78684dab7ff67e559e`.
- **Tueurs à la main** : les 22 tueurs de `test/r25-integration.test.ts` (dont B-3 `r25.mjs:20` et `:44`, m-2 `:28`) et les 6 tueurs de `oracle-run.test.ts` et `ci-gates.test.ts` qui visent `run.mjs:62`, `:63`, `ci.yml:99` (deux), `:106`, `:183` : **28 tués sur 28**. Les deux tueurs internes `r25.mjs:31` (SDL) et `:35` (ROR) de `oracle_r25_over_the_ci_bound_is_red`, ré-ancrés, sont tués aussi.
- **Ancres** : `--touched ab8084fb HEAD` et `--touched 99edbc33 HEAD` : 54 tueurs, 52 ANCRE, 2 PERDU, les deux déjà PERDU au tronc (`oracle-run.test.ts:129`, `:182`). Sur tout l arbre, comparé au tronc : un seul PERDU ajouté, `test/dojo-render.test.ts:326` (`ci.yml:226` devenu `:245`, Q-12), comme au G7 d origine.
- **npm test** complet depuis le worktree, au gel `0b0c96ac` (proxy retiré, suite hors ligne) : **2 317 tests, 2 295 verts, 0 rouge, 0 annulé, 22 sautés**, exit 0.
- `test/r25-integration.test.ts`, `ci-gates`, `oracle-run` : 64/64 ; `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.

## 7. Ligne datée d ADR-M003 D9 (projet E-6, réécrit après le pli, à contrôler par MONARK)

> **Addendum D9 nonies - 2026-10-05 (règle GÉNÉRALE : R-25 ne compte que le neuf d une PR d intégration ; décision de l investisseur du 2026-10-05, verbatim « applique ta reco et informe recherches » ; lots R25-INTEGRATION-RULE-1a et 1b)** : la borne `VIBEGATES_PR_LIMIT = 1205` (et `VIBEGATES_CONTENT_LIMIT = 8000`, ADR-M013) reste. Les pathspecs restent ceux de D9, quater, sexies, septies et d ADR-M013. Pour une PR écrite, rien ne change. Une PR est **candidate** si, lus dans l objet PR écrit par GitHub (payload de l événement en CI, API en local), sa tête et sa cible sont dans la liste close `L` = {`lot/etude-suite`, `main`} ∪ {`base/<nom>`, `<nom>` de grammaire `^[a-z0-9][a-z0-9.-]*$`}, distinctes, et appartiennent toutes deux au dépôt `KraidleAI/monark-governance`. Un nom ne suffit jamais. Une PR fusionnée **prouve** des commits si elle est fusionnée dans `L`, n est pas une PR d exception keyée (#56, #89), porte un `r25-taille-de-lot` vert de `github-actions` sur sa tête exacte, et si sa contribution réelle à sa cible, `git diff M^1 M` sous chaque pathspec (`M` = son `merge_commit_sha`), tient sous les mêmes bornes : un run vert a mesuré la tête contre la cible du moment du run, ce qui ne couvre ni un changement de cible, ni une cible poussée en arrière, ni la relance d un vieux run. Elle prouve alors `rev-list M^2 ^M^1` si sa tête est le second parent de `M`, ou `M` seul si `M` a un parent (squash ou dernier commit rebasé). La fusion `M` elle-même n est jamais prouvée d office : elle est mesurée par sa `--remerge-diff` (0 pour une fusion propre, qu elle soit faite par GitHub ou en local). Une candidate dont la preuve est complète compte, contre les mêmes bornes, (a) la `git show --remerge-diff` brute de chaque commit de fusion non prouvé et (b) le diff au parent de chaque autre commit non prouvé, au plus le compte d aujourd hui. Sans preuve complète, sur un dépôt ou une tête étrangers, si git est antérieur à 2.36, sur toute erreur, ou si un commit non prouvé touche la gate (`.github/workflows/**`, `scripts/lot-size-integration.mjs`, `scripts/oracle/r25.mjs`, `scripts/oracle/run.mjs`), on compte tout comme avant (fail-closed). Cette dernière garde protège d une erreur, pas d une attaque : elle est jugée par le code qu elle garde. Contre une attaque, la porte r25 de l oracle exécute **son propre** module, et rend le compte d aujourd hui si les octets du module mesuré diffèrent ; MONARK contrôle par diff les fichiers de la gate sur chaque PR d intégration. Une seule implémentation, `scripts/lot-size-integration.mjs` (nom choisi sans la sous-chaîne `r25`, que le contrôle M-42f′ d ADR-M004 D7 ter interdit dans le corps du job r25), avec les options git qui changent un compte épinglées ; le job `r25-taille-de-lot` exécute celui de l arbre mesuré (commande `count`, cible lue dans `$GITHUB_BASE_REF`), et en bash seul le mode `integration` avec deux entiers de moins de dix chiffres remplace un compte. La CI lit la preuve par l API avec le jeton du run, sous une échéance de 120 s ; un refus de l API (403) laisse le compte d aujourd hui, et les portées `pull-requests: read` et `checks: read` ne seront ajoutées (ligne datée d ADR-CODEQL-ALERTS-1) que si un run candidat rend 403. L oracle, hors ligne, lit une preuve déclarée (`--r25-proof`), produite par la même commande `proof` via `gh api`, citée par sha256 dans son record et dans sa clé D4. `base_sha` et `pr.number` de la preuve sont enregistrés, non vérifiés : le graphe décide, et une autre base prouve moins. Mesures du 2026-10-05 : synchro tronc `ab8084fb` -> `base/c2-integration` `689daea1` 3 246 -> 0 ; intégration de C2 5 156 -> 0 ; avance de `main` `207f021f` 46 183 -> 46 183 (garde `gate-files` ; reste rouge, Q-8). `test/r25-integration.test.ts`, `oracle_r25_integration_reads_the_declared_proof` et `ci_r25_integration_rule_is_wired_fail_closed` l épinglent. La ligne (9) d ADR-CM (borne 1 400) reste le repli tant que la règle ne vit pas en CI sur la base. `error_origin` : sans objet (décision de règle). **Livré par** : lots R25-INTEGRATION-RULE-1a et 1b (G0 `docs/G0-lot-r25-integration-rule-1.md`, G7 `docs/G7-lot-r25-integration-rule-1.md`, G2 pliée).

La ligne n est pas versée dans `docs/adr/ADR-M003-phase2-integration.md` : elle attend le contrôle de MONARK (E-6, Q-13).

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
| Q-11 git de l oracle | vérifier `git --version` ≥ 2.36 sur la machine Windows | oui ; ajouter aussi `git --version` au journal r25 de l oracle (absent de la clé D4). Non plié : hors des trois bloquants ; à faire au prochain lot de l oracle |
| Q-12 ancre hors zone | `test/dojo-render.test.ts:326` -> `ci.yml:245` (était `:226`) | ouvrir cette ligne de commentaire à la zone du pli. Non touchée : elle reste à ouvrir par MONARK (1b ne change pas le décalage : les lignes du job r25 gardent leur nombre) |
| Q-13 D9 nonies | à contrôler | à réécrire après B-1 à B-3 (fait, section 7 : fusion mesurée, contribution `M^1..M`, portée de `gate-files`, oracle avec son module, nom du module), puis à verser dans le pli après le contrôle de MONARK |

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
