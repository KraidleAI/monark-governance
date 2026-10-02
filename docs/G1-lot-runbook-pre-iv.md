claude-opus-5-5

# G1 — lot RUNBOOK-PRE-IV (avant 18 (iv) : Q-14, Q-13, Q-12 ; parade du §17) — 2026-10-02

Implémenteur G1, instance fraîche, palier `claude-opus-5-5`, effort `max` (R-1 : modèle résolu `claude-opus-5-5`). Mission
`F:/tmp/dojo/mission-runbook-pre-iv.md` (sha256 `6a5e5dd4866acddd66c353a6454f76ce6eb5d2167b883f091b0e7582315517e7`, recalculé à
01:46:49Z avant lecture : égal ; reçu `F:/tmp/dojo/mission-runbook-pre-iv.recu.json`, verdict vert, 01:46:36Z). Worktree
`F:/Monark-wt-runbook`, branche `lot/runbook-pre-iv`, HEAD = base `d1120612b7b5c172509830c1cb314c9580549c41`, arbre propre à 01:46:56Z
et à 02:06:34Z. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun `git add`, `commit` ou `stash` ; un écart git
déclaré (Q-6 : un rafraîchissement d'index) ; aucun réseau ; rien sur C:. TEMP des courses : `F:/tmp/dojo/runbook-arrete-20261002/tmp`.

Premier G1 arrêté vers 02:3x UTC (limite d'usage), au milieu de son oracle. **Reprise** le 2026-10-02 à 03:03Z par une instance fraîche :
section 7 (ce qui est gardé, changé, refait ; toutes les preuves refaites sur l'arbre final). Les chemins `F:/tmp/dojo/runbook/` des
sections 1 à 6 sont réécrits vers `F:/tmp/dojo/runbook-arrete-20261002/`, où l'orchestrateur a renommé les sorties du premier G1.

## 1. Lecture (avant toute modification ; empreintes relevées à 02:02:39Z)

| Entrée | Lignes | sha256 |
|---|---|---|
| `docs/RUNBOOK-dojo.md` (§10, §14, §16 (3)-(4), §17, §18, §19, Never) | 974 | `11e1c3c51f89798bf3ffc6c553164e6fc2d77d8445089380c089d617d3cee3d3` |
| `F:/Monark/docs/ETAT.md` (tronc `9e979a36`, l.55-75, l.108 ; Q-5) | 313 | `82a4bdedc506fbd11ff84434b2d887a80849596603fd5b1f84f41770aeec1a53` |
| `docs/adr/ADR-DOJO-PR-3.md` (l.509, l.527 ; l.435, l.493) | 649 | `a42e8d54cd840e8a80ce5cffe246cf382a2732b3bfe2296b381286d24298a1b0` |
| `test/dojo-publish-deploy.test.ts` (épingles du RUNBOOK) | 474 | `252fbcbbdf67cd712b49875ec3c304404c6f0cd590cd247c72ead1f025c5cc74` |
| `test/dojo-collect-deploy.test.ts` (épingles du RUNBOOK) | 368 | `1d009900af9ce43a467af19833b859d2b9537e20506e672baede17f0f137e4b7` |
| `apps/dojo/scripts/dojo-publish.mjs` (`takeLock`, `unlock`, `--history`) | 542 | `516ce36505bd2d9f21d3e71d0d060a2324a74ef074e58d65f4b650b68d3a914f` |
| `F:/Monark/scripts/red-proof.mjs` (`parseKiller`) | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` (= mission) |
| `apps/dojo/src/history-build.ts` (format des lignes, l.232-241 ; manifeste) | 281 | `c3f87f4146ca811f7c0ce6322ede4df07f92fbf51fe8907d324eeac5acfff74b` |
| `deploy/monark-dojo-publish.service` (commentaire l.31-33 : domaine couvert) | 58 | `d7f679d0b914fb86ff80874e49aa4680349505b04f157cf5760db01c0922aee6` |
| `scripts/dojo-deploy.mjs` (`DOJO_PUBLISH_STATE`, `DOJO_PUBLISH_UNIT`) | 62 | `fb3047c0f72f086cf07fbbf7694100bad43cd63d5ce14adbacefe46a03daa2e9` |
| `docs/G1-lot-dojo-pr3b2a.md` (l.318-360 : DOJO-VERIFY-SCALE-1) | 387 | `945fe665d12e470756d16036666f9e867ad5a84ea79de85491aa738f6ff1a77a` |
| `docs/G1-lot-b1-corr.md` (l.340-356 : Q-10 à Q-14 de la partie 2) | 369 | `9945231573b4b8833ee985a01953b4685ea155be5fda1a7c4b78c1f75412a6ad` |
| `docs/RUNBOOK-sentinel.md` (l.416-424 : verrou laissé, état de l'unité) | 679 | `1a1093fd09ff38a65f5e46ed76601292ee984720261abf77972bf6cd521537fe` |
| `docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md` (l.17) | 20 | `d3525bb87be61854060075d9211b517fd13d4e6a1c488064efdf5a4aa2e8ec6f` |
| `apps/dojo/test/helpers/dojo-fixture.ts` (`DAY1`, `ANCHOR_DAY`, `anchorBody`) | 334 | `2e9e04b79dc4e6755f81b2e390248d56bbeb1885a19e2a7e46c06e23ab9b7e1d` |
| `F:/Monark/scripts/oracle/run.mjs`, `F:/Monark/scripts/oracle/r25.mjs` | 173, 28 | `f22b9045…cb2a41b`, `4d0544df…827cf0` (= mission) |
| `.github/workflows/ci.yml` (R-25 : `docs/**/*.md` exclus du compte de code) | 206 | `0f401ae2da253b76b7306322c85a5ddbd887ca675b0bedbbb4e43504dc8c949a` |
| hors dépôt `F:/tmp/methode/pr3b2/scale/gen-tree.mjs` (l.38, l.49-50) | 80 | `3d73247fb7179c1f2f2068cdb5810432939a04203ffd5947eba798e14e0a95fe` |
| hors dépôt `F:/tmp/methode/pr3b2/scale/results.jsonl` | 12 | `a0da00510d7e111dcce3f47ba54fe135466b866b9bbd3c87bf178aece76d7443` |

Faits lus qui portent le lot :

- Verrou (`dojo-publish.mjs` l.392-424, l.534-542) : `<state>/publish.lock` porte `{pid, mode, taken_at}` (l.401), écrit sous
  `publish.lock.<pid>` puis lié ; un résidu `publish.lock.<pid>` ne bloque aucun lancement (l.534-536) ; `--unlock` ne retire que le
  verrou d'un propriétaire qui ne tourne plus (l.415-424 ; `running()` l.394 : signal 0, EPERM compté vivant) ; tout refus sort 1
  (`runCli`, l.465-467).
- Historique (`history-build.ts` l.232-241) : une ligne au plus par adresse et par jour, `{"address","class","day","day_value"}` ;
  premier jour fixe `DOJO_HISTORY_FIRST_DAY` = 2026-09-10 (l.31) ; manifeste : `history_first_day`, `history_last_day`,
  `history_sha256`, `history_lines_count`, `addresses` (l.270-276).
- Grille DOJO-VERIFY-SCALE-1 (ADR l.509 ; journal G1 de PR-3b-2a l.333-353 ; unité l.31-33) : points mesurés (N, D) = (1 144, 30),
  (10 000, 30), (1 144, 365) ; domaine couvert N ≤ 10 000 à D ≤ 30, N ≤ 1 144 à D ≤ 365 ; (10 000, 365) extrapolé seulement.
  Arbres mesurés : 22 jours d'historique (gen-tree l.38 : HD = ANCHOR_DAY − DAY1 + 1 = 22), une ligne par détenteur et par jour
  (l.49-50), puis D instantanés vérifiés par la VAE.
- `docs/ETAT.md` (`9e979a36`) l.66-70 : décision datée de l'orchestrateur (2026-10-02, 01:4x UTC) sur Q-10 et D3-1, déclencheur
  déplacé au premier redéploiement de l'arbre de publication, à la première rotation de clé, ou au plus tard le 2026-10-09 ;
  « Parade : chaque lecture du §17 liste `publish.lock*` ».

## 2. Ce que les tests épinglent du RUNBOOK (lu avant modification)

`test/dojo-publish-deploy.test.ts` :

- T-A1 : le seul bloc de §16 qui contient `systemd-run` (job A-8), `--uid=dojo --gid=dojo` et ses huit `-p K=V` = l'unité.
- `dojo_two_units_share_no_writable_path` : le RUNBOOK contient `--groups dojo-handoff dojo`.
- T-A5 : les cinq chaînes du bloc de §12.
- T-A7 : la commande de trousseau de §13 (regex) ; en §18, le PREMIER bloc clôturé qui contient `--history`, son `C="..."` (le
  chemin du paquet est son 5e mot) : aucun bloc neuf de §18 ne doit contenir `--history`.
- T-A8 : les usages d'un chemin sous `/etc/monark/dojo/` (liste fermée), les deux comptes de §13 avant `cat`, et ni `set -x`, ni
  `sh -x`, ni `printenv`, ni `/run/credentials/` hors des deux passages d'interdiction.
- T-A9 : phrases de §6, §7, §10, §15, §16 et §18 ((i) à (iii), résidu de (iv)).
- T-A11 : l'ordre de §16 ; une ligne de §19 par code de `DOJO_PUBLISH_REFUSALS`, chacune **STOP** ; §17 contient
  « **STOP** on every other refusal (section 19) ».
- `dojo_runbook_jobs_carry_the_unit_properties` : exactement UN bloc `systemd-run` en §16, §18 et §19, propriétés = l'unité ; (iv) lit
  `--inbox <ReadOnlyPaths> --state <état>`. Aucun bloc neuf ne doit contenir `systemd-run`.
- Tueurs ancrés sur le RUNBOOK : `:460` (§13), `:617` (§16), `:851` (§18 (iv), `-p SupplementaryGroups=dojo-handoff`), `:896` (§19,
  ligne `price_version_pending`) : toute insertion avant l.851 ou l.896 impose leur réancrage.

`test/dojo-collect-deploy.test.ts` : deux `printf` de clés, deux `install -d ... -m 2750 .../bundles`, la commande d'archive, le lien
de résolution et les trois outils lancés par le RUNBOOK ; aucun tueur sur le RUNBOOK. Aucune autre pièce du dépôt ne lit le RUNBOOK
(recherche de `RUNBOOK-dojo` dans `*.ts`, `*.mjs`, `*.json`, `*.yml`). Aucune épingle de longueur de ligne.

## 3. Plan (écrit avant toute modification, 02:06Z)

- **Q-14** : les deux retraits du paquet ((iii), et la fin de (iv), qui passe du texte en ligne à un bloc clôturé) deviennent
  `if test ! -e /var/lib/monark-dojo/publish.lock && test "$(systemctl is-active monark-dojo-publish.service)" = inactive; then rm -r
  /var/lib/monark-dojo/history-packet && echo PACKET-REMOVED; else echo PACKET-KEPT; exit 1; fi` (forme de la garde de (iii),
  `PACKET-EXISTS`) ; prose : `PACKET-KEPT` ⇒ rien retiré, **STOP**. `= inactive` écrit à la lettre de la décision (Q-1).
- **Q-12** : paragraphe neuf entre (iii) et (iv), « before each (iv) » : une commande locale en lecture seule
  `node --input-type=module -e '...' '<local packet>/publish'` (forme de la commande S_CUT de §18) imprime `lines=`, `addresses=`,
  `days=` (de `history_first_day` à `history_last_day`, bornes comprises), `bytes=` (Q-4) puis `IN-GRID` ou `BEYOND-GRID` (sortie 1) ;
  grille = (N ≤ 10 000 et jours ≤ 30) ou (N ≤ 1 144 et jours ≤ 365). Dans la grille : JOURNAL ; au-delà : **STOP**, mesure de charge
  avant (iv). Argument de borne (pas une mesure) : l'acte (iv) vérifie l'historique (≤ N × jours lignes) et UN instantané candidat,
  deux passes de VAE (journal G1 de B1-CORR, Q-12) ; le point mesuré (N, 30) vérifie 22 jours d'historique et 30 instantanés dont
  chaque ligne retrace sa série : à jours ≤ 30 l'acte travaille moins (≈ 122 N contre ≈ 1 147 N unités de ligne-jour). Fait daté :
  `days` = 22 quand d − 1 = 2026-10-01 ; au-delà d'un dernier jour 2026-10-09 (d ≥ 2026-10-11), seule la branche N ≤ 1 144 reste.
- **Q-13** : une phrase à la fin de (iv), le retrait du paquet excepté (Q-2).
- **§17** : un bloc de lecture seule après la lecture du journal : `ls -l` de `publish.lock*`, puis, si `publish.lock` existe, son
  enregistrement et `ps -o pid=,comm= -p <pid>` ou `OWNER-NOT-RUNNING` (Q-3) ; routage : propriétaire vivant ⇒ attendre ; propriétaire
  absent ⇒ §19 `--unlock` ; enregistrement illisible ⇒ escalade ; `publish.lock.<pid>` ⇒ JOURNAL seulement ; phrase citant la décision
  datée du 2026-10-02 (Q-10, D3-1, déclencheur).
- **Tests** (`test/dojo-publish-deploy.test.ts`, ajoutés en fin de fichier, anglais, aucune barre inverse) :
  `dojo_runbook_removes_the_packet_only_without_a_writer` (Q-14, statique : texte ENTIER balayé pour tout `rm` sur `history-packet`,
  exactement deux, chacun commande d'un bloc clôturé de §18 ; négation du verrou épinglée exacte depuis `D.DOJO_PUBLISH_STATE` et
  `STATE_LOCK` ; `systemctl is-active <unité>` et `inactive` dans la garde, aucun `!=` ; `PACKET-KEPT` en `else` ; **STOP** dans la
  prose) et `dojo_runbook_counts_the_history_against_the_measured_grid` (Q-12, exécutable : le JS extrait du RUNBOOK joué sur des
  paquets du vrai `historyBundle` aux bornes (10 000, 30), (1 144, 365) dedans ; (10 001, 1), (10 000, 31), (1 145, 31), (1 144, 366)
  dehors). Chacun rouge à la base par assertion, vert au gel, sa ligne `// killer:` au format de `parseKiller`.
- **Tueurs** : réancrer `:851` et `:896` (et tout autre décalé) ; vérifier les six tueurs du RUNBOOK par `parseKiller` et occurrence
  unique sur la ligne visée (script hors dépôt), puis les tirer un à un sur un clone.
- **Mesures** : toute ligne créée ≤ 160 (`awk`), garde d'octets, tests du RUNBOOK sur un clone `--no-local`, portes, R-25, red-proof
  avec tirage des deux tueurs neufs, oracle du tronc rôle `G1` ; verrou d'hôte libre et C-V-4 vérifiés avant chaque course.

## 4. Questions et items formés (Q-n), chacun avec sa conséquence bornée et son déclencheur

- **Q-1 (URGENT, avant 18 (iv) le 2026-10-03 ; propriétaire : orchestrateur).** Toute garde « l'unité `inactive` » du RUNBOOK refuse
  quand le dernier lancement de l'unité de publication a échoué : une unité `Type=oneshot` dont le processus sort 1 reste `failed`,
  pas `inactive`, jusqu'au lancement suivant ou à `systemctl reset-failed`. Pièces (internes, aucune lecture réseau) : (i) RUNBOOK
  l.519-525 (A-5p) : le démarrage à blanc attend `start_exit=1` et enchaîne `systemctl reset-failed monark-dojo-publish.service`
  (l.522) ; (ii) RUNBOOK l.691 : « `history_missing` at every start until the `history` line », chaque refus sortant 1
  (`dojo-publish.mjs` l.465-467) ; (iii) `docs/RUNBOOK-sentinel.md` l.420 : l'unité « DOIT être inactive ou failed — jamais
  activating » (précédent du dépôt : hors exécution, `inactive` OU `failed`) ; (iv) `docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md`
  l.17 : une unité transitoire relevée `failed` sur cet hôte (mesure de l'orchestrateur, 2026-09-23). Déduction datée : A-10 fait le
  2 octobre ; d = 2026-10-02 n'est clos qu'à 00:15 UTC du 3, et la course finale de 18 (ii) puis (iii) suit cette clôture : (iv) vient
  donc après le créneau de 00:30 UTC du 3, qui refuse `history_missing` (sortie 1) ; à l'instant de (iv), `systemctl is-active
  monark-dojo-publish.service` imprime `failed`. Conséquences : l.849 (job (iv)) : la garde est fausse, la commande n'imprime rien et
  sort 1 : la ligne `history` ne peut pas être posée le 3 octobre en l'état ; l.940 (§19 `--unlock`) : idem, et c'est précisément
  après un lancement arrêté en route que chaque créneau refuse `lock_held` (sortie 1) : l'acte ne peut pas courir dans le cas pour
  lequel il existe ; l.571 (A-8 (2)) : même garde, sans effet aujourd'hui (fait avant A-10) ; les deux gardes neuves de Q-14 :
  `PACKET-KEPT`, **STOP** (refus à tort, jamais un retrait à tort). Remède proposé, une décision pour les cinq sites : le prédicat en
  lecture seule « l'unité ne tourne pas » = état ∈ {`inactive`, `failed`} (précédent sentinel l.420), par exemple
  `case "$(systemctl is-active monark-dojo-publish.service)" in inactive|failed) true ;; *) false ;; esac`, plutôt que
  `systemctl reset-failed` avant la garde : `reset-failed` est un acte sur l'unité (il efface son état et son résultat), contraire à la
  phrase de Q-13 (aucun acte sur les unités entre la ligne `history` et le premier `snapshot`) et à la lecture seule des gardes. Hors
  mandat (« Rien d autre ne change dans le RUNBOOK ») : rien n'est touché aux l.571, l.849, l.940. (Corrigé à la reprise, 7.2 : le
  test de Q-14 épingle désormais la commande distante entière, prédicat compris, par la constante `IDLE` ; le remède y est une ligne.)
- **Q-2 (Q-13, formulation ; propriétaire : orchestrateur).** La décision dit « aucun acte sur l'éditeur (son état, ses unités) »
  entre la ligne `history` et le premier `snapshot` ; la fin de (iv) retire le paquet, qui vit sous l'état
  (`/var/lib/monark-dojo/history-packet`), et Never (l.972) l'excepte déjà. Phrase écrite avec l'exception explicite du retrait du
  paquet ; la vérification hors ligne de A-8 (3)-(4) lit `public/` par `scp` (lecture, pas un acte). Rayer l'exception imposerait de
  déplacer le retrait après le premier `snapshot` (changement hors mandat).
- **Q-3 (§17, juge du propriétaire ; propriétaire : orchestrateur).** La lecture imprime l'enregistrement du verrou (non secret :
  `pid`, `mode`, `taken_at`, `dojo-publish.mjs` l.401) et `ps -o pid=,comm= -p <pid>` (précédent sentinel l.420-424 : `cat "$LOCK"`
  puis `ps -p <pid>`) ; `comm=` plutôt que `args=` : aucune ligne de commande d'un autre processus affichée. Le juge qui fait foi reste
  `--unlock` (`running()`, l.394). Un pid réutilisé se lit « vivant » : attente, puis escalade (fail-closed).
- **Q-4 (Q-12, octets ; propriétaire : orchestrateur).** La commande imprime aussi la taille du fichier d'historique (`bytes=`) sans
  l'ajouter au critère : elle renseigne l'item voisin « avant 18 (iv) : DOJO-PUBLISH-SCALE-1 (fichier candidat de plus de 64 Mio
  pendant la vérification) » (`docs/ETAT.md` l.108 à `9e979a36`). Le critère reste la grille de la décision.
- **Q-5 (références de la mission).** La mission cite `ETAT.md` l.57 pour la grille : lue à 01:5xZ, la grille est l.58 (l.57 vide).
  `docs/ETAT.md` a changé après la génération de la mission (commit `9e979a36`, 01:47:44Z ; 302 puis 313 lignes) : les items
  « avant A-10 » et « avant 18 (iv) » sont maintenant l.66-73 ; la décision datée Q-10/D3-1 est l.66-70 (texte cité au §17 d'après
  cette version).
- **Q-6 (écart d'outillage git, déclaré).** Un `git status --porcelain=v1 --untracked-files=all` lancé sans `GIT_OPTIONAL_LOCKS=0` à
  01:46:56Z a rafraîchi l'index du worktree (`F:/Monark/.git/worktrees/Monark-wt-runbook/index`, mtime 01:46:56.79Z) : ni objet,
  ni ref, ni commit. Tous les appels git suivants portent `GIT_OPTIONAL_LOCKS=0` ; les seules écritures git sont dans des clones
  neufs sous `F:/tmp/dojo/runbook-arrete-20261002/` et dans ceux que créent `red-proof.mjs` et `oracle/run.mjs`.
- **Q-7 (écart de procédure, déclaré).** À 02:17:08Z, mon pré-contrôle (`F:/tmp/dojo/runbook-arrete-20261002/precheck.sh`)
  imprimait l'état sans arrêter la chaîne : il montrait le verrou d'hôte tenu (pid 172988, oracle G2 d'un autre lot) et 51 node.exe
  (> 40), et la campagne `--killers` est partie quand même ; l'outil du tronc l'a refusée avant tout clone (sortie 2, « no campaign
  races an oracle » ; `F:/tmp/dojo/runbook-arrete-20261002/mutants-killers-1.log`), aucun dossier créé. Depuis, toute course passe par
  `F:/tmp/dojo/runbook-arrete-20261002/gate.sh`, qui sort 1 si le verrou est tenu, si node.exe > 40, si la mémoire libre < 4 096 Mo ou
  la virtuelle < 8 192 Mo.
- **Q-8 (écart de forme, déclaré).** La première version de `gate.sh` (script de travail hors dépôt, jamais livré) portait une séquence
  barre inverse dans un heredoc (`tr -d` avec `r` échappé), contraire à REGLES-MISSION ; aucun octet de contrôle produit (garde
  d'octets relue) ; réécrit à 02:17:56Z sans barre inverse (`tr -d '[:cntrl:]'`). Les fichiers livrés n'en portent aucune.

## 5. Réalisation du premier G1 (état à son arrêt ; l'état final est en 7.3)

| Décision | RUNBOOK (lignes au gel) | Test (`test/dojo-publish-deploy.test.ts`) |
|---|---|---|
| Q-14 | l.853-861 (acte de (iii)) et l.922-935 (fin de (iv), en bloc) | `dojo_runbook_removes_the_packet_only_without_a_writer` l.480, tueur `:854` |
| Q-12 | l.863-880 (paragraphe neuf, avant (iv)) | `dojo_runbook_counts_the_history_against_the_measured_grid` l.501, tueur `:873` |
| Q-13 | l.930-935 (phrase de fin de (iv), exception du retrait : Q-2) | aucun (la décision n'en demande pas) |
| §17 | l.697-713 (bloc de lecture seule et routage, décision datée) | aucun (idem) |

- Tueurs réancrés (même texte, ligne décalée) : `:851` → `:891` (job (iv)), `:896` → `:947` (ligne `price_version_pending`) ; `:460`
  et `:617` inchangés. `packetAt` (aide hors corps de test) prend un `n` facultatif : `n` détenteurs SYNTHÉTIQUES, une ligne chacun le
  dernier jour, dans l'ordre des octets ; pour `n = 0`, mêmes valeurs qu'avant (`lines` vide, `bytes` vide, `sha("")`, `rootOf([])`, Ève
  vide, comptes à 0) : T-A7 inchangé. Import : `STATE_LOCK` de `dojo-publish.mjs` (l.26).
- Tuyaux (règle Branchement) : entrée = le paquet local de la course finale (`history-collect.ts`, écrivain `historyBundle`) ; sortie =
  la ligne du JOURNAL et le STOP qui gardent (iv) ; le test joue la commande extraite du RUNBOOK sur des paquets du vrai `historyBundle`.
  Les gardes de Q-14 : entrée = `publish.lock` de `takeLock` (l.400-407) et l'état de l'unité ; sortie = le retrait ou `PACKET-KEPT`.

## 6. Mesures du premier G1 (arbre à son arrêt ; orientation seule, remplacées par 7.5 ; verrou et C-V-4 relus avant chaque course)

- Garde d'octets (`F:/tmp/dojo/runbook-arrete-20261002/bytecheck.mjs`) : RUNBOOK, test et journal sans TAB ni octet de contrôle, fin LF ; aucune ligne
  créée > 160 (les 25 lignes > 160 du RUNBOOK et ses 5 lignes à barre inverse sont antérieures, côté collecte, l.46-343) ; test et
  journal sans barre inverse ni adresse IP ; le RUNBOOK écrit l'hôte comme ses blocs existants.
- Tueurs (`F:/tmp/dojo/runbook-arrete-20261002/killers.mjs`, `parseKiller` importé de `F:/Monark/scripts/red-proof.mjs`, règle de `killerProblem`) :
  les 14 lignes `// killer:` du fichier de test valides (une occurrence de `<before>` sur la ligne visée, déclaration de test dessous).
- Clone `F:/tmp/dojo/runbook-arrete-20261002/c1` (`--no-local`, base `d1120612`, les trois fichiers copiés, octets égaux au worktree ; jonctions par
  `mk-nm.ps1` : 220 entrées, 11 `@monark`, 0 échec) : `typecheck` 0 (02:14:10-18 ; `--listFiles` : le test est dans les 770 fichiers) ;
  `eslint` du test 0 (02:15:00-08) ; 02:15:22-27, `dojo-publish-deploy` et `dojo-collect-deploy` : 23 tests, 23 verts (dont T-A7 et les
  deux neufs) ; `lint:ratchet` 69/69 (02:18:47), `lang:gate` 0 occurrence (02:19:16), `gate:vocab` OK (02:19:18), `lint` 0 (02:19:26-52).
- `red-proof` (02:15:56-02:16:27, verrou libre, 16 node.exe) : OK, 2 jugés F2P (rouges à la base par `ERR_ASSERTION`, verts au gel),
  12 inchangés, 2 tueurs tirés (graine 20261002) et tués, fichier restauré (sha256 égal avant et après) ;
  `F:/tmp/dojo/runbook-arrete-20261002/red-proof-1/RED-PROOF.json` sha256 `8a5f03ed953bb6e240ede3a3465682fd4c86c847fc4c8d631e1243f78e0a4f58`.
- R-25 (`git diff --numstat` contre la base, 02:18:28) : assiette CI = `test/dojo-publish-deploy.test.ts` seul, 49 + 7 = 56 lignes
  (borne 547) ; RUNBOOK 57 + 6 et journal hors assiette (`docs/**/*.md`).

## 7. Reprise 2026-10-02 (instance fraîche, palier `claude-opus-5-5`, effort `max` ; R-1 : modèle résolu `claude-opus-5-5`)

### 7.1 État trouvé (03:03:47Z à 03:19Z, heures lues à `date -u`)

- Mission recalculée à 03:03:47Z, avant lecture : sha256 `6a5e5dd4866acddd66c353a6454f76ce6eb5d2167b883f091b0e7582315517e7`,
  égal ; reçu `F:/tmp/dojo/mission-runbook-pre-iv.recu.json`, verdict vert, `2026-10-02T03:03:13Z`, `head` = base `d1120612`.
- Worktree : HEAD = base `d1120612b7b5c172509830c1cb314c9580549c41`, branche `lot/runbook-pre-iv` ; trois chemins non commis :
  `docs/RUNBOOK-dojo.md` (`aa5010dc…4e75`), `test/dojo-publish-deploy.test.ts` (`3c043e62…c94c`), journal non suivi (`e04cc792…1fd5`,
  égal à la sauvegarde `F:/tmp/dojo/arrete-20261002/G1-lot-runbook-pre-iv.md` de `SHA256SUMS`) ; patch de sauvegarde
  `F:/tmp/dojo/arrete-20261002/runbook-worktree.patch` `85ca00ce…4706` (égal à `SHA256SUMS`), relu en entier.
- Sorties du premier G1 : `F:/tmp/dojo/runbook-arrete-20261002/` (scripts, clone `c1`, `red-proof-1/`, `oracle-1.log` : oracle parti à
  02:21:08Z, arrêté après la porte `lint:ratchet`) et `runbook-deliver-arrete-20261002/` (vide) ; lues pour orientation seule. Mes sorties :
  `F:/tmp/dojo/runbook/` et `F:/tmp/dojo/runbook-deliver/`, neufs (créés à 03:06:18Z ; copies de base sous `F:/tmp/dojo/runbook/base/`).
- Verrou d'hôte libre à 03:04:37Z (`held("F:/tmp")` de `F:/Monark/scripts/oracle/lock.mjs` : `null`).
- Git : lectures seules (`git --no-optional-locks` : `status`, `diff --stat`, `show <base>:<chemin>`, `grep`, `log`). Aucun `GIT_DIR`,
  aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun git écrivant dans le worktree ni dans `F:/Monark`.
- Entrées relues en entier, dans l'ordre de la mission, aux empreintes de la section 1 : RUNBOOK de base `11e1c3c5…e3d3` (= copie de
  l'orchestrateur `F:/tmp/dojo/runbook-d1120612.md`), tests `252fbcbb…c74`, `1d009900…7b9`, `dojo-publish.mjs` `516ce365…14f`,
  `red-proof.mjs` `6579b550…b36`, ADR PR-3 `a42e8d54…1b0` (l.509, l.527). Sauf `F:/Monark/docs/ETAT.md`, désormais à
  `bb38abcb939e77b971e8b0641c74a6f51479e1fa28a11673f5ceefdfc2a95d16` (316 lignes, tronc `9127d75a`) : grille l.58, décision datée
  Q-10/D3-1 l.66-70, items « avant 18 (iv) » l.71-73 et l.108 (Q-5 inchangée sur le fond).
- Source primaire ajoutée, sans réseau : systemd.service(5), copie locale `F:/tmp/dojo/systemd-service.html` (sha256
  `8b9e04d13a18329c395d9088ee32898fa3c27cc296d7bd84baa549f7344f5aea`, page « systemd 262 », celle de FAITS-SYSTEMD-TIMEOUT-1) [lu], texte
  sans balises l.132-135 : un `oneshot` sans `RemainAfterExit=` « will never enter "active" unit state, but will directly transition from
  "activating" to "deactivating" or "dead" » ; l.565-567 : `SuccessExitStatus=` ajoute des statuts au seul succès normal, la sortie 0
  (texte sans balises : `F:/tmp/dojo/runbook/tmp/systemd-service.txt`, sha256 `54665afd…4abb`, par `sed -e 's/<[^>]*>//g'`).

### 7.2 Relecture ligne à ligne et plan de la reprise (écrit à 03:19Z, avant toute modification du RUNBOOK et du test)

Gardé (juste contre la mission, relu comme si je l'avais écrit) :

- §17 : le bloc en lecture seule (`ls -l publish.lock*`, puis l'enregistrement et `ps` si `publish.lock` existe), le routage et la
  phrase qui cite la décision datée (Q-10, D3-1, déclencheur).
- 18 (iii) et fin de (iv) : la garde de Q-14 à la lettre (`test ! -e` du verrou, puis `= inactive`, retrait dans la seule branche
  `then`, sinon `PACKET-KEPT` et sortie 1), le bloc unique, la fin de (iv) sortie du texte en ligne.
- Q-12 : paragraphe avant (iv), commande, critère (domaine couvert du commentaire de l'unité, l.31-33) ; `bytes=` gardé, déclaré (Q-4,
  précisé en 7.4). Q-13 : la phrase, avec l'exception du retrait du paquet (Q-2).
- Tests : `dojo_runbook_counts_the_history_against_the_measured_grid` tel quel ; `packetAt(n)` (octets identiques à `n = 0` pour T-A7) ;
  réancrages `:891` et `:947` ; import `STATE_LOCK`.

Changé :

- Test de Q-14 : la commande distante entière épinglée, du guillemet ouvrant jusqu'à `fi'`, l'état de l'unité par une constante
  `IDLE`. Motif : le contrôle lâche du premier G1 (`includes("inactive")`, aucun `!=`) laissait passer une garde niée,
  `! test "$(systemctl is-active <unité>)" = inactive`. Expression `rm` élargie aux options longues et à `--`.
- Prose de `PACKET-KEPT`, aux deux sites : « then this act again after the launch » retiré. Avec `= inactive`, avant la ligne `history`
  l'unité est `failed` après chaque créneau (Q-1) : au site de (iii) une nouvelle tentative ne passe jamais. Un STOP sans boucle.
- §17 : « any other record: escalation » devient « any other output » (un pid réutilisé par un autre programme, ou l'erreur de `ps`
  sur un enregistrement vide) ; la ligne du propriétaire s'écrit `<pid> <command>`, `node` attendu, jamais donnée pour mesurée sur
  l'hôte (aucun accès à l'hôte dans ce lot).
- Journal : sections 5 et 6 = état du premier G1 à son arrêt ; Q-1 corrigée (le test épingle le prédicat).

Refait sur l'arbre final : garde d'octets et longueurs, tueurs (`parseKiller`), clone `--no-local` neuf, les deux fichiers de test du
RUNBOOK, les cinq portes, `red-proof` (tirage couvrant les deux tueurs neufs), R-25, oracle du tronc rôle `G1`.

### 7.3 Réalisation finale (décision → fichier → test ; lignes de l'arbre final)

| Décision | `docs/RUNBOOK-dojo.md` (1 027 lignes) | `test/dojo-publish-deploy.test.ts` (517 lignes) |
|---|---|---|
| Q-14 | l.854-862 (acte de (iii)) ; l.924-933 (fin de (iv), en bloc) | `dojo_runbook_removes_the_packet_only_without_a_writer` l.481, `:855` |
| Q-12 | l.864-882 (paragraphe, commande, attendu ; avant (iv) l.884) | `dojo_runbook_counts_the_history_against_the_measured_grid` l.502, tueur `:874` |
| Q-13 | l.934-937 (la phrase, retrait du paquet excepté : Q-2) | aucun (la décision n'en demande pas) |
| §17 | l.697-714 (bloc en lecture seule, routage, décision datée) | aucun (idem) |

- Test de Q-14 : le RUNBOOK ENTIER compte deux `rm` du paquet, chacun seul dans un bloc clôturé de §18 ; chaque bloc aplati finit par la
  commande distante exacte ` 'if test ! -e <état>/publish.lock && <IDLE>; then rm -r <état>/history-packet && echo PACKET-REMOVED; else
  echo PACKET-KEPT; exit 1; fi'` (chemins tirés de `D.DOJO_PUBLISH_STATE`, `STATE_LOCK` et `D.DOJO_PUBLISH_UNIT`, jamais retapés) ; le
  paragraphe qui suit chaque bloc dit `PACKET-KEPT` et « nothing removed, **STOP** ». Le message d'échec cite la seule commande distante,
  jamais l'hôte (celui du premier G1 recopiait le bloc entier, hôte compris : `F:/tmp/dojo/runbook/red-proof-1/killer-1.tap`).
- Test de Q-12 (gardé) : la commande extraite du RUNBOOK jouée sur six paquets du vrai `historyBundle` aux bords de la grille :
  (10 000, 30) et (1 144, 365) dedans, sortie 0 ; (10 001, 1), (10 000, 31), (1 145, 31), (1 144, 366) dehors, sortie 1.
- Réancrages (même texte, ligne décalée) : `:851` → `:893` (job (iv)), `:896` → `:949` (`price_version_pending`) ; `:460`, `:617`
  inchangés. `packetAt` : `who`, `lines`, `bytes` sur trois lignes ; à `n = 0`, `lines` et `bytes` vides, `sha("")`, `rootOf([])`.
- Tuyaux (règle Branchement) : Q-12, entrée = le paquet local de la course finale (écrivain `historyBundle`), sortie = la ligne du
  JOURNAL ou le STOP avant (iv) ; Q-14, entrée = `publish.lock` de `takeLock` (`dojo-publish.mjs` l.400-407) et l'état de l'unité,
  sortie = le retrait ou `PACKET-KEPT` ; §17, entrée = `publish.lock*` de l'état, sortie = l'attente, l'acte `--unlock` ou le JOURNAL.
  Chaque composition est rejouée par un test non-LLM (Q-12, Q-14) ; §17 et Q-13 n'ont pas de test (la mission n'en demande pas).

### 7.4 Questions de la reprise (Q-R*, propriétaire : orchestrateur ; Q-1 à Q-8 : section 4)

- **Q-1 confirmée, URGENTE (avant 18 (iv), au plus tard le 2026-10-03 à 00:00 UTC).** Sources : unité `Type=oneshot` sans
  `SuccessExitStatus=` (`deploy/monark-dojo-publish.service`, `d7f679d0…aee6`) ; chaque lancement avant la ligne `history` sort 1
  (`history_missing`, RUNBOOK l.691 ; `runCli` l.465-467) ; systemd.service(5) [lu] l.132-135 et l.565-567 (7.1) ; RUNBOOK §14 l.522
  (`reset-failed` après `start_exit=1`) ; `docs/RUNBOOK-sentinel.md` l.420 ; `docs/course-bell/FAITS-vps-bell-precheck-2026-09-23.md`
  l.17 (unité relevée `failed` sur cet hôte) ; et le RUNBOOK lui-même, côté collecte, §9 l.335 : « `inactive` or `failed`, NEVER
  `activating` ». Déduction, non mesurée (aucun accès à l'hôte dans ce lot ; la lecture
  `systemctl is-active monark-dojo-publish.service` la tranche dès maintenant) : depuis A-10, l'unité est `failed` entre deux créneaux,
  jusqu'au premier lancement qui sort 0. Effets, trois sites : (a) job (iv) existant (l.891) : garde fausse, aucune sortie, code 1 :
  la ligne `history` ne se pose pas ; (b) retrait de (iii), neuf : `PACKET-KEPT` et STOP, et aucune nouvelle tentative ne passe avant la
  ligne `history` ; (c) retrait de fin de (iv), neuf : `PACKET-KEPT` jusqu'au créneau qui publie d (sortie 0, `inactive`), puis passe ;
  s'y ajoutent `--unlock` (§19, l.993) et A-8 (2) (l.571, déjà fait). Remède proposé, prix mesuré sur le clone de travail (jamais le
  worktree) : aux cinq gardes, `test "$(systemctl is-active monark-dojo-publish.service)" = inactive` devient
  `systemctl is-active monark-dojo-publish.service | grep -qx -e inactive -e failed` (« ne tourne pas » ; aucun `;`, aucun guillemet,
  tient dans la chaîne `&&` ; ligne la plus longue 152 caractères) et la constante `IDLE` du test suit : 5 + 1 lignes, les 23 tests
  verts (`F:/tmp/dojo/runbook/q1-remedy-tests.tap`, script `q1-remedy.mjs`). `reset-failed` écarté : acte sur l'unité, contraire à Q-13
  à la fin de (iv). La prose « the unit `inactive` » (l.552, l.887, l.990, l.1006) suivrait. Hors mandat : rien n'en est appliqué.
- **Q-R1 (§17, nom du propriétaire).** `<pid> node` est déduit (la ligne de l'unité lance `/usr/bin/env node`, qui exécute `node`),
  jamais lu sur l'hôte. Tout autre nom, ou toute autre sortie, mène à l'escalade, jamais à un retrait : le juge reste `--unlock`.
- **Q-R2 (Q-12, lecture de la grille).** Les jours comptés sont ceux de l'historique (`history_first_day` à `history_last_day`) ; la
  grille mesurée compte des jours publiés sur un historique de 22 jours. Lecture littérale retenue (adresses contre N, jours contre
  D), prudente sous un argument de borne, non mesuré (section 3) : l'acte (iv) vérifie l'historique et UN instantané, deux fois
  (≈ 122 N lignes-jours à 30 jours d'historique), contre ≈ 1 147 N au point mesuré (N, 30). Une mesure réelle viendra de la durée de
  l'acte (iv) au JOURNAL. À ratifier, ou à remplacer par une grille propre à l'acte.
- **Q-R3 (Q-4 précisée).** `bytes=` reste hors critère ; il renseigne l'item ETAT l.108 « avant 18 (iv) : DOJO-PUBLISH-SCALE-1 » :
  `VERIFY_BOUNDS.MAX_BODY_BYTES` = 64 Mio (`apps/dojo/scripts/dojo-verify.mjs` l.44), que la VAE applique avant tout engagement
  (ADR-DOJO-PR-3 l.604). Au-delà, (iv) refuserait sans rien écrire.
- **Q-R4 (constat, hors du lot).** `F:/tmp/dojo/runbook-arrete-20261002/c1/node_modules` est un VRAI répertoire de jonctions vers
  `F:/Monark/node_modules` (fait par `mk-nm.ps1`, `Attributes` = `Directory`, relevé à 03:1xZ). Jamais `rm -r` sur cet arbre ; retrait
  sûr : `powershell -File F:/tmp/dojo/drand-1a/rm-nm.ps1 -Tree F:/tmp/dojo/runbook-arrete-20261002/c1`. Non touché (orientation seule).
- **Q-R5 (références).** ETAT relu à `bb38abcb…` (7.1) ; l.74-75 y annonce une ligne datée de l'orchestrateur sur TU-1h d'ADR-DOJO-PR-3
  « avec la fusion de RUNBOOK-PRE-IV » : acte de l'orchestrateur, aucune ligne d'ADR écrite ici.
- **Écarts de forme, déclarés.** (i) Une commande `sed` de réancrage portait `&` échappé dans sa chaîne de remplacement (ni heredoc ni
  chemin ni fichier ; lignes produites relues, aucune barre inverse dans le test). (ii) Une première version de `q1-remedy.mjs` portait
  des guillemets échappés : réécrite avant toute exécution (codes de caractères), zéro barre inverse dans mes scripts (relevé par Node).

### 7.5 Mesures sur l'arbre final (heures `date -u` ; TEMP `F:/tmp/dojo/runbook/tmp` ; contrôle bloquant `gate.sh` avant chaque course)

- Empreintes livrées : `docs/RUNBOOK-dojo.md` `05d06c134e293f141338701ef1f033c996df9b82025d4c6a10ea305b631c4104`,
  `test/dojo-publish-deploy.test.ts` `7184331c4fb6d1024e8876660be680c547b449d547a978e6d46ddbecae75d391` ; journal : `DELIVERED.sha256`.
- Garde d'octets (`F:/tmp/dojo/runbook/bytecheck.mjs`, 03:28Z) : aucun TAB ni octet de contrôle, fin LF ; aucune ligne neuve de plus
  de 160 caractères (les 25 lignes longues du RUNBOOK sont celles de la base, octet pour octet) ; aucune barre inverse neuve ; test et
  journal sans adresse IPv4 ; RUNBOOK : 62 lignes à adresse à la base, 63 au gel, une seule adresse, celle de la base, toujours précédée
  de `-i ~/.ssh/monark_vps root@` sur les lignes ajoutées.
- Tueurs (`F:/tmp/dojo/runbook/killers.mjs`, `parseKiller` du tronc, règle de `killerProblem`) : 14 lignes, 14 valides.
- Clone `F:/tmp/dojo/runbook/c1` (`--no-local`, base `d1120612`, les trois fichiers copiés, octets égaux) ; jonctions `mk-nm.ps1` :
  220 entrées, 11 `@monark`, 0 échec (03:24:56Z).
- Tests du RUNBOOK (03:28:25-29Z, verrou libre, 11 node.exe) : `dojo-publish-deploy` et `dojo-collect-deploy`, 23 tests, 23 verts
  (T-A7 et les deux neufs compris) ; `F:/tmp/dojo/runbook/tests-2.tap` `d1a3a81c1daab509b70201ead254329dff082606d712d8b1c2b2f174ef98a2b6`.
- Portes (03:28:35-03:29:31Z) : `typecheck` 0 (`--listFiles` : 770 fichiers, le test compris), `gate:vocab` OK (330 fichiers),
  `lang:gate` 0 occurrence, `lint:ratchet` 69/69, `lint` 0 ; sorties `F:/tmp/dojo/runbook/gate-*-2.txt`.
- `red-proof` du tronc (03:29:38-03:30:04Z, `--draw 2 --seed 20261002`) : OK ; 2 jugés, F2P (base : `assert-fail`, « two removals… »
  `[2, [1]]` contre `[2, [1, 1]]`, et « the count of Q-12, before (iv) » ; gel : verts), 12 inchangés ; 2 tueurs tirés (population 2)
  et tués par une assertion (`:855`, `:874`), fichier restauré au même sha256 ;
  `F:/tmp/dojo/runbook/red-proof-2/RED-PROOF.json` `599669c97d2a94754390d4e4a6229f9969b271038a1bb64c73a1896de97f1f51`.
- R-25 (`F:/Monark/scripts/oracle/r25.mjs` rejoué sur le commit de gel `52925731` de mon clone, 03:30:28Z) : `STAT` 50 + 7 = 57
  (borne CI 1 205 ; borne du lot 547), `CONTENT_STAT` 0 ; RUNBOOK et journal hors assiette (`docs/**/*.md`) ;
  `F:/tmp/dojo/runbook/r25-1.txt` `d12862dd…da22`.
- Commande de Q-12 jouée À LA LETTRE sous Git Bash, comme l'opérateur la lance (03:34:37Z ; bloc extrait du RUNBOOK, seul
  `<local packet>` remplacé par `/f/tmp/dojo/runbook/tmp/pkt`, forme MSYS) sur un paquet du vrai `historyBundle` (`mkpacket.mjs`, 3
  détenteurs, historique 2026-09-10 à 2026-10-01) : `lines=3 addresses=3 days=22 bytes=240 IN-GRID`, sortie 0 (la conversion de
  chemins de MSYS ne touche pas le script ; `days=22`, le cas attendu du 3 octobre).
- Garde de Q-14 jouée à la lettre (03:35:27Z ; `q14-guard.mjs` : la commande distante extraite du RUNBOOK, les deux blocs égaux, le
  chemin de l'état porté sur un répertoire neuf par cas, `systemctl` remplacé par un script qui imprime l'état du cas) :
  verrou absent et `inactive` : `PACKET-REMOVED`, sortie 0, paquet retiré ; verrou tenu et `inactive` : `PACKET-KEPT`, sortie 1,
  gardé ; verrou absent et `activating` : `PACKET-KEPT`, gardé ; verrou tenu et `activating` : `PACKET-KEPT`, gardé ; verrou absent
  et `failed` : `PACKET-KEPT`, gardé (l'effet de Q-1). Shell de Git Bash ; l'hôte lance la commande sous son shell de connexion.
- Scripts de travail (hors dépôt, sans barre inverse ni TAB) : `gate.sh` `c5de8027…6239`, `bytecheck.mjs` `1fe17894…bb39`,
  `killers.mjs` `6cb787a4…353b`, `q1-remedy.mjs` `41785fa0…e7f6`, `mkpacket.mjs` `c72176b2…cfa1`, `q12-cmd.sh` `b4737073…e2f3`,
  `q14-guard.mjs` `9c63e8a9…c580`, tous sous `F:/tmp/dojo/runbook/`.
- Passages intermédiaires, avant la retouche du message d'échec (gardés, non cités comme preuve finale) : `tests-1.tap`,
  `gate-*-1.txt`, `red-proof-1/` (`RED-PROOF.json` `66218538…1969`).

### 7.6 Fin

- Livrables : `docs/RUNBOOK-dojo.md`, `test/dojo-publish-deploy.test.ts`, ce journal (worktree, non commis) ;
  `F:/tmp/dojo/runbook-deliver/REPONSE.md` et `DELIVERED.sha256`. L'oracle du tronc (rôle `G1`, base `d1120612`) court sur l'arbre
  final, qui porte ce journal : il est cité dans `REPONSE.md`, par chemin et sha256 de son enregistrement.
- Aucune dette nue : Q-1 (décision de l'orchestrateur avant le 3 octobre 00:00 UTC, remède mesuré joint), Q-R1 à Q-R5 et les Q-2 à
  Q-5 de la section 4 portent chacune son propriétaire et son déclencheur.
