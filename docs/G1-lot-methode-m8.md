claude-sonnet-5
# G1 — lot M-8 « retrait des worktrees fusionnés, âges au point d'étape » (ADR-METHODE-2 D7, ligne M-8) — journal

## 0. Reprise (coupure de courant, obligatoire)
Agent précédent mort à mi-course (coupure ≈ 09:14 UTC, reprise 12:1x UTC). Préambule `F:/tmp/REPRISE-2026-09-28-coupure.md` (sha256 `f4bb518e…`, vérifié) et mission `F:/tmp/methode/mission-g1-m8.md` (sha256 `d0cdb95a…`, vérifié) lus intégralement avant tout travail.

**Trouvé** (état partiel sur `F:/Monark-wt-m8`, HEAD `62adaf29` = base tronc de la mission, aucun git écrivant dans le worktree ni le dépôt) :
- `scripts/lot/retire.mjs` (177 l.), `scripts/lot/ages.mjs` (91 l.) : untracked, non modifiés par ce G1 — repris tels quels après lecture ligne à ligne.
- `test/lot-retire.test.ts` : untracked, 11 tests couvrant les 4 cas obligatoires (merged→RETIRE, unmerged→KEEP, dirty→KEEP, in-tree→REFUSE-IN-TREE) + Review Focus #1 (prunable), #3 (chemin à espace), #4 (`branch -d` contre le vrai HEAD, pas `--trunk`) + `--dry-run` idempotent.
- `F:/tmp/methode/m8/mutants/run-mutants.mjs` : harnais de mutants (11 mutants, un par test, restitution sha256 après chacun).
- `F:/tmp/methode/m8/oracle/oracle-m8.sh` : script d'oracle (verrou, 7 portes, test 42 à part, C-V-4), jamais exécuté avant la coupure.
- `F:/tmp/methode/m8/f2p/base-repo` : clone jetable à `62adaf29` (fetch réel), déjà construit.
- `F:/tmp/methode/m8-deliver/evidence/` : logs partiels d'un run antérieur (typecheck, eslint, gate-vocab, mk-nm, ages-real, retire-dry-run-real, deux campagnes de mutants marquées **superseded** par le nom de fichier lui-même) — **écartés** : tous datés d'avant le dernier arrêt du test (10:13 UTC) ou d'avant le tronc actuel (M-1 a fusionné depuis, `e5d492ba`) ; aucun rejoué, aucun chiffre repris tel quel dans ce rapport.

**Réutilisé** : les 3 fichiers de code (retire.mjs, ages.mjs, la base des 11 tests), le clone F2P `62adaf29`, le harnais de mutants, le script d'oracle — après relecture ligne à ligne (aucun n'a été modifié sans lecture préalable).

**Refait** (par moi, ce G1, daté `date -u`) : ajout puis **retrait** de 3 tests supplémentaires (détails §1 ci-dessous, R-25) ; F2P rouge/vert rejoués ; campagne de mutants rejouée en entier (l'ancienne, si présente, n'était pas datée après le gel courant) ; dry-run réel + âges réels sur `F:/Monark` rejoués ; oracle complet sous verrou rejoué de zéro (jamais exécuté avant la coupure).

**Écarts déclarés** : (a) j'ai d'abord ajouté 3 tests couvrant Review Focus #2 (HEAD détaché) et #5 (worktree courant), qui n'étaient pas couverts par la version héritée — R-25 est alors monté à 639 lignes, **au-dessus de la borne STOP 547** (ADR-METHODE-2 l.37 : « dépassement = refus », non discrétionnaire) ; je les ai retirés pour revenir au R-25 hérité (545, marge de 2 lignes) plutôt que de décider unilatéralement de faire porter un dépassement de gate — voir Q-M8-1. (b) Un premier run de la campagne de mutants a été tronqué par mon propre `timeout 300` externe (RM08 tué par SIGTERM à 143, pas un vrai survivant) ; rejoué sans contrainte de temps externe — chiffre final ci-dessous.

## 1. Arbre, portée, classification
- Worktree `F:/Monark-wt-m8`, branche `lot/methode-m8`, base tronc `62adaf29` (mission), modifié en place. Aucun git écrivant dans le dépôt réel `F:/Monark` (lecture seule : `worktree list --porcelain`, `status`, `log`, `branch --merged`, `merge-base --is-ancestor`) — **jamais** `scripts/lot/retire.mjs` exécuté sans `--dry-run` sur `F:/Monark` (interdit absolu du harnais, respecté). Git écrivant uniquement dans des dépôts jetables : les fixtures du test (sous `TEMP`), le clone F2P `F:/tmp/methode/m8/f2p/base-repo`.
- TEMP/TMP `F:/tmp/methode/m8/tmp` pour tout node/git de ce G1 (rien sur C:). `GIT_OPTIONAL_LOCKS=0` pour le dry-run réel et `ages` réel (lecture seule, 90 worktrees voisins, dont 3 missions sœurs actives M-2a/M-3/M-4).
- Classification D-4 (e) : **bounded** (deux scripts + un test neufs, portée close par la mission).

## 2. Code — transcription (rien réinventé)
- `scripts/lot/retire.mjs` (177 l.) : conforme à la mission point 1 — refuse (a) non fusionné, (b) sale, (c) détaché non atteignable, (d) sous l'arbre du dépôt (`REFUSE-IN-TREE`, jamais retiré par l'outil) ; sinon `RETIRE` (`git worktree remove` + `git branch -d`, jamais `-D`) ; `--dry-run` imprime sans agir ; `--only` cible un chemin ; comptes finaux `retired/kept/refused-in-tree` ; exit 0 même avec des KEEP, exit 2 sur erreur git. Garde supplémentaire mesurée dans le code hérité, hors la lettre stricte de la mission mais conforme à son esprit (Review Focus #5) : le worktree courant (celui d'où tourne le script) n'est jamais retiré.
- `scripts/lot/ages.mjs` (91 l.) : branche, fusionnée oui/non, sale oui/non, âge en jours (`git log -1 --format=%ct`), triée du plus vieux au plus récent, `--json`.

## 3. Tests non-LLM — `test/lot-retire.test.ts` (277 l., 11 tests)
Fixture : dépôt jetable `git init` sous `TEMP`, isolé de la config git de l'hôte (`GIT_CONFIG_NOSYSTEM=1`, `GIT_CONFIG_GLOBAL=""`), tronc + 7 worktrees (merged-clean, unmerged, merged-dirty, in-tree sous `.claude/worktrees/x`, merged-dans-`release`-seulement, chemin à espace, prunable). Chaque test nomme sa mutation tueuse en commentaire `// killer: …`.
- **Vert autonome** (`node --test --test-reporter=tap test/lot-retire.test.ts`, `TEMP=F:/tmp/methode/m8/tmp`) : **11/11**, `date -u` 2026-09-28T12:27:31Z. TAP `evidence/test-standalone-green.tap`.

## 4. Preuve F2P (module neuf)
- **Rouge sur la base** (`F:/tmp/methode/m8/f2p/base-repo`, `git init` + `fetch --depth 1 file:///F:/Monark 62adaf29`, checkout détaché ; seul `test/lot-retire.test.ts` copié, `scripts/lot/` absent) : **11/11 rouge** (`spawnSync` échoue : `RETIRE`/`AGES` introuvables), `date -u` 2026-09-28T12:37:12Z. TAP `evidence/f2p/F2P-base.tap`.
- **Vert au gel** (mêmes 3 fichiers copiés dans le clone, sha vérifiés égaux à `GEL-sha256.txt`) : **11/11 vert**, `date -u` 2026-09-28T12:45:13Z. TAP `evidence/f2p/F2P-freeze.tap`.

## 5. Mutants (harnais `F:/tmp/methode/m8/mutants/run-mutants.mjs`, restitution sha256 après chaque mutant)
11 mutants (6 sur `retire.mjs`, 3 sur `ages.mjs`, 2 supplémentaires sur `retire.mjs` — parse d'un chemin à espace, garde prunable). Un premier passage a été tronqué par un `timeout` externe que j'avais moi-même posé (RM08 tué en SIGTERM, pas un vrai survivant — écart déclaré §0) ; rejoué sans cette contrainte : **11/11 tués**, restitution octet pour octet vérifiée après chaque mutant ET en fin de campagne (`restauration finale OK` sur les deux fichiers). Détail par mutant et sha : `evidence/mutants/results.json`, `evidence/mutants/*.tap`.

## 6. Dry-run réel + âges réels sur `F:/Monark` (lecture seule, `GIT_OPTIONAL_LOCKS=0`)
- `node scripts/lot/retire.mjs --repo F:/Monark --trunk lot/etude-suite --dry-run` : **retired=68 kept=21 refused-in-tree=0** (90 worktrees au total, dont le principal jamais compté ; c'est la liste que l'orchestrateur exécutera au G7 — `evidence/retire-dry-run-real.log`). `F:/Monark-wt-m8` (ce worktree) : `KEEP current-worktree` — jamais retiré tant qu'un G1 y tourne. Écart mesuré à la mission (89 lignes/1 in-tree au 2026-09-28 06:3x UTC) : à ce relevé, `refused-in-tree=0` — le worktree parasite `.claude/worktrees/magical-proskuriakova-…` cité par la mission a déjà été retiré par `git worktree prune` (CHANTIERS l.1918, action orchestrateur du 2026-09-27 20:55Z), avant ce G1.
- `node scripts/lot/ages.mjs --repo F:/Monark --trunk lot/etude-suite [--json]` : 89 lignes, triées du plus vieux (~23 j) au plus récent (~0,2 j) ; `evidence/ages-real.log` / `.json`.
- **Point notable pour Q-M8 (voir §9)** : `F:/Monark-wt-main` (worktree sur la branche `main`) ressort `RETIRE` (fusionné + propre) — mécaniquement correct selon les 4 critères de refus de la mission, mais retirer le worktree `main` local peut ne pas être l'intention de l'orchestrateur.

## 7. Oracle (7 portes + test 42 à part, sous verrou)
- Verrou `F:/tmp/oracle-lock` : absent au départ (retiré par l'orchestrateur à la reprise, confirmé) ; pris par ce G1 (`mkdir` atomique, `owner.txt` "G1 M-8" + WINPID), 7 portes (`gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `test`) + `test/export-public.test.ts` (« test 42 ») à part, `npm_config_offline=true`, jetons payants exclus de l'environnement, jonctions `node_modules` reconstruites (`mk-nm.ps1`) puis retirées (`rm-nm.ps1`) en sortie, C-V-4 vérifié à la prise et à la sortie.
- **Résultat : oracle overall exit=0** (verrou pris 2026-09-28T12:47:01Z après 60 s d'attente sur le lock du sibling « corr », relâché 2026-09-28T12:58:05Z ; C-V-4 respecté du début à la fin : node.exe 9→6, libre 28,4→30,0 Go). 7/7 portes vertes (`vocab`, `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `test`) + `test/export-public.test.ts` (test 42) vert séparément. 1476 tests dans la porte `test` (1473 pass, 0 fail, 3 skipped, 388,98 s) ; sha des 3 fichiers relevé à la prise ET à la sortie du verrou : identiques à `GEL-sha256.txt` (aucune mutation n'a fui du gel). Logs complets : `evidence/oracle/session.log`, `gate-*.log`, `test42.tap`.

## 8. R-25 (mesuré au gel)
- **CODE** (`scripts/lot/*.mjs` + `test/lot-retire.test.ts`, aucun exclu par le pathspec `ci.yml:82`) : `retire.mjs` 177 insertions, `ages.mjs` 91 insertions, `test/lot-retire.test.ts` 277 insertions (méthode A, `git diff --no-index --shortstat /dev/null <fichier>` ; méthode B, `wc -l` : identique) — **545 lignes, 0 suppression**. Sous la borne STOP 547 (ADR-METHODE-2 l.37, « dépassement = refus ») **avec une marge de 2 lignes seulement**. Très au-dessus de l'attendu 110-150 (×3,6 sur `ages.mjs`+`retire.mjs` = 40+30 estimés contre 268 mesurés, mais surtout le test : 40 estimés contre 277 mesurés) — cause nommée : le test hérité couvre 11 scénarios (4 obligatoires + 5 Review Focus + dry-run + refus `-D`) au lieu du minimum ; aucune ligne n'a été coupée pour artificiellement rentrer sous la borne.
- **Item formé Q-M8-1** : R-25 = 545/547, marge de 2 lignes. Toute correction post-G2 qui ajoute ne serait-ce que 3 lignes de CODE fait basculer le lot en refus mécanique. Je n'ai pas tranché la scission (M-8b pour les tests Review Focus #2/#5, sur le modèle M-4) : décision d'architecture, portée au G2/G7 plutôt que décidée par ce worker (consigne de la mission : « si un choix d'architecture surgit, arrête-toi… ne décide pas »).

## 9. CA-11 — tuyau (règle Branchement)
- **Entrée** : `git worktree list --porcelain` sur `F:/Monark` (lu, jamais muté par ce G1). **Sortie** : verdict ligne par ligne `RETIRE <chemin> <branche>` / `KEEP <chemin> <motif>` / `REFUSE-IN-TREE <chemin>`, comptes finaux. **État** : aucun (lecture seule ; `--dry-run` ne modifie rien, prouvé par le test `lot_retire_dry_run_changes_nothing`). **Consommateur servi** : **le G7 de M-8 lui-même** — l'orchestrateur exécute la liste `RETIRE` du dry-run réel (§6, `evidence/retire-dry-run-real.log`) comme acte de fusion/clôture (R-20 : seul committeur). Tant que ce G7 n'a pas eu lieu, `retire.mjs` reste **« upcoming »** dans tout registre public au sens de la règle Branchement (sa sortie n'est consommée par aucun chemin servi avant cet acte).
- **Test d'intégration non-LLM qui rejoue la composition** : `lot_retire_merged_clean_worktree_is_retired` et `lot_retire_dry_run_changes_nothing` rejouent, sur un dépôt fixture réel (pas une simulation), la même paire `git worktree list --porcelain` → décision → `git worktree remove`/`branch -d` que le dry-run réel exerce sur `F:/Monark` (§6) — même code, même chemin.

## 10. Review Focus (5 classes, priorité de la mission)
1. **Worktree disparu du disque (prunable)** : couvert (`lot_retire_prunable_worktree_is_kept_never_attempted`) — jamais tenté, `KEEP prunable` ; `git worktree prune` reste un acte orchestrateur distinct (Q-M8-2, déjà nommé dans le code hérité).
2. **Branche fusionnée mais HEAD détaché** : **non couvert par un test** dans la version livrée (retiré avec les 2 autres tests que j'avais ajoutés, §0/§8, pour rester sous R-25 547) ; le code gère les deux sous-cas (`if (wt.detached) { … anc.status !== 0 → KEEP detached-unreachable }`, sinon suite normale → `RETIRE` sans `branch -d`) mais aucune fixture ne l'exerce. **Gap déclaré, pas silencieux.**
3. **Chemin avec espace dans `--porcelain`** : couvert (`lot_retire_worktree_path_with_a_space_is_retired`, tue le mutant `line.split(' ')[1]`).
4. **Branche fusionnée dans `main` mais pas dans `--trunk`** : couvert (`lot_retire_refuses_to_force_delete_branch_not_merged_into_repos_own_head`, prouve que `branch -d` — jamais `-D` — revalide contre le vrai HEAD, pas contre `--trunk`).
5. **Le worktree courant dans la liste** : **non couvert par un test** dans la version livrée (même raison qu'en 2) ; le code le protège (`wtNorm === cwdNorm → KEEP current-worktree`, vérifié en direct sur `F:/Monark` au §6 : `F:/Monark-wt-m8` ressort `KEEP current-worktree`) mais aucune fixture ne l'exerce isolément. **Gap déclaré.**

## 11. MAST (modes d'échec, risque résiduel)
- **FM-2.4** (résultat d'agent mort non lu) : directement pertinent à cette reprise — contre-mesure appliquée : aucune sortie de l'agent mort (evidence marquées *-superseded, logs antérieurs au dernier arrêt du test) n'a été citée comme un chiffre de ce rapport ; tout rejoué.
- **FM-1.3/1.4** (relance sur état périmé, double exécution) : contre-mesure — sha256 relus avant réutilisation de chaque fichier hérité ; le clone F2P vérifié à `62adaf29` (le tronc a avancé depuis, mais la mission fixe la base à ce sha, donc pas de rejeu du clone).
- **FM-3.2** (ciblage incomplet) : suite complète exécutée au gel (§7), pas seulement le fichier de test isolé.
- **FM-1.2** (outil qui fermerait un gate) : `retire.mjs` n'a jamais tourné sans `--dry-run` sur `F:/Monark` pendant ce G1 — aucun outil de ce G1 ne ferme le gate de retrait réel, qui reste un acte du G7.

## 12. `error_origin` proposés
- **OUT** (hôte/outillage) : la coupure de courant elle-même, et mon propre `timeout 300` externe qui a tronqué le premier passage de mutants (RM08 faussement rouge par SIGTERM) — corrigé par un second passage sans contrainte externe.
- **G1** (ce worker, s'il y a lieu) : l'ajout puis le retrait de 3 tests (§0), qui a fait monter puis redescendre R-25 — décision de portée que je documente plutôt que de la cacher en silence.
- **ANT** (base antérieure) : la proximité de R-25 (545/547) était déjà présente dans le code hérité de l'agent mort, avant toute intervention de ce G1.

## 13. Questions (Q-M8-n)
- **Q-M8-1** : R-25 = 545/547 (marge 2 lignes). Ratifier tel quel (les 2 gaps de Review Focus #2/#5 restent des gaps déclarés, jamais fermés par un test), ou scinder en M-8b (les 2 tests que j'ai écrits puis retirés, `+~55 l.`) sur le modèle de la scission M-4/M-4b ? Je ne tranche pas (choix d'architecture).
- **Q-M8-2** (héritée du code) : `git worktree prune` sur un worktree `prunable` reste un acte orchestrateur distinct, jamais déclenché par `retire.mjs`. Confirmer ?
- **Q-M8-3** : le dry-run réel classe `F:/Monark-wt-main` (worktree sur `main`, fusionné et propre) en `RETIRE`. Mécaniquement conforme aux 4 critères de la mission, mais retirer le worktree local de `main` peut ne pas être voulu. Faut-il une 5ᵉ garde « jamais la branche par défaut du dépôt » (`git symbolic-ref refs/remotes/origin/HEAD` ou équivalent local), ou est-ce accepté tel quel ?
- **Q-M8-4** : accepter le tuyau CA-11 tel que décrit (§9) — `retire.mjs`/`ages.mjs` restent **« upcoming »** au registre public tant que le G7 de M-8 n'a pas réellement exécuté la liste `RETIRE` du dry-run réel sur `F:/Monark` ?

## 14. Livrables
`F:/tmp/methode/m8-deliver/` : `scripts/lot/{retire.mjs,ages.mjs}`, `test/lot-retire.test.ts`, `docs/G1-lot-methode-m8.md` (ce fichier), `evidence/` (TAP standalone, F2P rouge/vert, mutants/*.tap + results.json, dry-run réel, âges réels, GEL-sha256.txt, oracle/*). `DELIVERED.sha256` scelle l'ensemble.
