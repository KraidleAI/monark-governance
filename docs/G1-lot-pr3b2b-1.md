claude-opus-5-5

# Journal G1 — Dōjō PR-3b-2b-1 « CA de déploiement à douze contrôles, `scripts/verify-dojo.mjs` » — 2026-10-02

- **Rôle** : implémenteur G1 (partie 3 de la page, le site), worker `claude-opus-5-5` (R-1 : modèle résolu tel quel, déclaré en
  première ligne de la réponse et de chaque livrable), effort max (mission), contexte frais ; aucun commit, aucun workflow (R-20) ;
  aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, jamais `git write-tree` ; rien sur C: ; réseau : boucle locale seule.
- **Mission** : `F:/tmp/dojo/mission-pr3b2b-1.md` (60 l.), sha256 recalculé AVANT lecture (05:01Z) :
  `c1ab001bbd505c321778ea399b1f9b834481f95c92c2d0a432b5f947ac39d71b` = attendu ; reçu `F:/tmp/dojo/mission-pr3b2b-1.recu.json` vert
  (2026-10-02T05:01:28Z, douze codes à 0, `repo` `F:/Monark-wt-verifydojo`, base = head = `224a6bd19adb242613d263e219be94319411d6dd`).
  Règles `F:/Monark/docs/methode/REGLES-MISSION.md` (`d86bb19d…01a5d6`, = en-tête de la mission), insérées dans la mission, lues.
  Outils du tronc recalculés égaux à l'en-tête : `lint.mjs` `4d1383c8…`, `launch.mjs` `fb6c277f…`, `oracle/run.mjs` `f22b9045…`,
  `oracle/r25.mjs` `4d0544df…`, `red-proof.mjs` `6579b550…` ; hors en-tête : `oracle/lock.mjs` `501a76b5…`, `mutants/run.mjs` `41cdf83f…`.
- **Worktree** : `F:/Monark-wt-verifydojo`, branche `lot/pr3b2b-1`, HEAD `224a6bd1` (= `lot/page-v1`) ; arbre propre à l'ouverture.

## Écart de conduite déclaré à l'ouverture (Q-1, `error_origin` G1)

- Ma première commande git (05:01:52Z) a lancé `git status --short` SANS `--no-optional-locks` : l'index du worktree
  (`F:/Monark/.git/worktrees/Monark-wt-verifydojo/index`) porte la date 05:01:54Z (rafraîchissement des stats). Mesuré à 05:2xZ :
  `git --no-optional-locks diff --cached --name-only` = 0 ligne, HEAD inchangé (`224a6bd1`), `status --porcelain` = 0 ligne, date de
  l'index inchangée depuis. Aucun contenu indexé. Toute commande git suivante porte `--no-optional-locks`. Précédent : Q-1 du G1
  BATCH-NEAR (`F:/tmp/dojo/batch-deliver/REPONSE.md`). À juger par l'orchestrateur.

## Heures (`date -u`)

- 05:01:52Z sceau de la mission et état du worktree ; 05:02Z à 05:24Z lectures (ordre de la mission, puis hors liste) ;
  05:10:34Z verrou d'hôte tenu par un autre processus (pid vivant 415208), 39 `node.exe`, 13 972 Mo physiques et 30 719 Mo
  virtuels libres ; 05:14:41Z verrou toujours tenu, 18 `node.exe` ; 05:14:56Z mesures win32 (ci-dessous, aucun test) ;
  consultation n° 1 de l'advisor intégré (avant toute écriture) ; 05:24:40Z empreintes des entrées ; puis ce journal AVANT tout code.

## Entrées, dans l'ordre de la mission (sha256 à 05:24:40Z)

| # | Entrée | Lignes | sha256 | Lu |
|---|---|---|---|---|
| 1 | `docs/adr/ADR-DOJO-PR-3.md` | 667 | `11c0cff60794dad8ef3d445ab897ab7bf74a3e41d04c2a1ba0c6ad27d7352c45` | l.84, l.286, l.404-607, l.142-151, l.609-666 |
| 2 | `scripts/sync-dojo-served.mjs` | 179 | `d7dbe6e052981fb19c82fa8f1e61cb9cc1af20ab766253ad987aacaba5238efe` | en entier |
| 3 | `scripts/verify-bell.mjs` | 244 | `ab0a386e52fe3f88a4d5524ddb264efca89aff8901b9e92add87e85aec42c70f` | en entier |
| 3 | `test/verify-bell.test.ts` | 236 | `b06aea991159785b55ea0aa112fc5486e2e0356af99fad0acc3ae73d123850fc` | en entier |
| 4 | `scripts/dojo-deploy.mjs` | 62 | `fb3047c0f72f086cf07fbbf7694100bad43cd63d5ce14adbacefe46a03daa2e9` | en entier |
| 5 | `deploy/Caddyfile.monark-dojo` | 28 | `67bb93ac4c14f3abd2c457bddd8081b26bdab90bb9e53f09101a13f6ad72f08f` | en entier |
| 6 | `apps/dojo/scripts/dojo-verify-cli.mjs` | 105 | `73195ecdb8691b61ed047cad6dc45cdbac68868b3d541d01b1d2dd15029c038a` | en entier |
| 7 | `docs/RUNBOOK-dojo.md` | 974 | `11e1c3c51f89798bf3ffc6c553164e6fc2d77d8445089380c089d617d3cee3d3` | §1, §10 à §20, Never |

Hors liste, lus pour agir sur pièce : `apps/dojo/scripts/dojo-verify.mjs` (375 l., `e52271fa…eaa23` : rapport, 18 clés, bornes) ;
`apps/site/lib/dojo-served-load.ts` (278 l., `89aa8ecc…9c98` : `DOJO_HOST`, `buildDojoServed`) ; `test/dojo-publish-e2e.test.ts`
(287 l., `e824f106…3b10` : `world`, `writeDay`, `packet`, `cliAt`, calqués par T-B1) ; `test/dojo-publish-deploy.test.ts` (474 l.,
`252fbcbb…c5cc74` : T-A7, épingles du RUNBOOK par numéro de section) ; `test/bell-caddy.ts` (226 l., `15d41e62…4764` : modèle Caddy) ;
`test/dojo-served.test.ts` (420 l., `e9d672fa…f9bd` : `caOf`, `bareManifest`, `syncRoot`) ; `test/dojo-verify-url.test.ts` (154 l.,
`04e03de4…5302`) ; `apps/dojo/test/helpers/dojo-fixture.ts` (334 l., `2e9e04b7…7e1d`) ; `docs/dojo/FAITS-systemd-publish-2026-09-30.md`
(`950d0a9a…aade`) ; `docs/dojo/FAITS-node-fetch-tls-2026-09-30.md` (`dc31cbee…d6f2`) ; `docs/G1-lot-dojo-pr3b2a.md` (387 l.,
`945fe665…a77a` : mesure SCALE l.318-362, délai T proposé l.354, Q-G1-5) ; `docs/ETAT.md` (`8fc81155…ab62`) ; `docs/RUNBOOK-bell.md`
(§1, §7, §11 : formes des captures) ; `scripts/verify-bell.d.mts`, `scripts/sync-dojo-served.d.mts` ; `.github/workflows/ci.yml` l.40-98
(R-25) ; `eslint.config.mjs`, `lint-ratchet.json` (plafond 69), `tsconfig.json` ; `scripts/lang-gate.mjs` (`docs/` non lu par la porte ;
mots français refusés dans le code) ; `test/byte-guard.test.ts` ; outils du tronc (formes exactes des commandes de la tâche 3).

## Mesures win32 (05:14:56Z, Node v24.15.0 ; aucun test, aucun réseau ; sous `F:/tmp/dojo/pr3b2b1/measure/`)

- `env-child.mjs` (`818c0bf2…4148`), sortie `env-child.out.json` (`d8e038ce445b7e873ad30210ff2dcf60378e11e1e4efbc54a453cbd593ef9f22`) :
  un enfant lancé par `execFileSync(process.execPath, …, {env: {}})` voit EXACTEMENT onze noms, pris dans l'environnement réel du
  parent : `HOMEDRIVE`, `HOMEPATH`, `LOGONSERVER`, `PATH`, `SYSTEMDRIVE`, `SYSTEMROOT`, `TEMP`, `USERDOMAIN`, `USERNAME`, `USERPROFILE`,
  `WINDIR` ; avec `{DOJO_MEASURE_ONLY}` : ces onze plus lui ; la résolution de `localhost` réussit. Aucun des onze n'est un nom des
  familles de PB-3 (2). Conséquence : sous win32 la plateforme ajoute ces noms à tout bloc ; E les nomme tous (liste blanche fermée),
  pour que « noms vus par l'enfant = E » soit vrai sur les deux plateformes (Linux n'ajoute rien).
- `env -i` sous Git Bash (`env-i.out.txt`, `dc547a184089cd95562991ea62c77a6bb30f6515cf664e1f4cb8cd525096b72e`) : `node.exe` voit
  `MSYSTEM`, `PATH`, `SYSTEMROOT`, `WINDIR` (ajoutés par MSYS) ; idem avec `PATH` et `SYSTEMROOT` passés. Le parent de la CA sous
  `env -i PATH="$PATH"` est donc fermé au sens de c07 ; `git` reste trouvable (PATH).
- Magasin TLS (même heure) : `tls.getCACertificates("default")` = 341 certificats sous le harnais (`NODE_USE_SYSTEM_CA` posé, É-B6),
  `"bundled"` = 145 ; `process.config.variables.node_use_openssl_ca` absent : le défaut du binaire est le magasin embarqué. c07 NOMME
  le magasin (PB-3 (c)) sans s'y fermer (« relevé et nommé »).
- La preuve de suffisance de E contre `https://bell.monarkgate.tech` (PB-3 (1)) est un acte de l'orchestrateur (hôte distant) : écrite
  en précondition de CA-1 au RUNBOOK, jamais jouée ici.

## Plan (tâche 1)

1. Ce journal (plan, contrôles, compte) ; 2. `scripts/verify-dojo.mjs` puis `scripts/verify-dojo.d.mts` ; 3. `test/verify-dojo.test.ts`
(T-B1 à T-B5, noms exacts de PB-6) ; 4. RUNBOOK : §15 (CA-0) complété, CA-1 ajouté avant « Never » (aucun numéro inséré au milieu :
`sectionOf(n)` épingle les §7, 10, 12, 13, 15 à 19) ; 5. lignes `// killer:` en dernier, vérifiées par `parseKiller` ; 6. gardes
d'octets, de longueur et R-25 sans verrou ; 7. quand `held(F:/tmp)` est nul, une course à la fois, sur un clone `--no-local` sous
`F:/tmp/dojo/pr3b2b1/` : itérations du fichier de test, `red-proof`, tueurs (`mutants/run.mjs --killers`), R-25 (`r25.mjs` sur un clone
à commit de gel), oracle G1 ; jonctions retirées ; livrables.

Réutilisé de `scripts/verify-bell.mjs` (une seule source, aucune copie) : `httpGet`, `tlsProbe`, `gitBlob`, `parseDigests`,
`parseSystemctlCat`, `PRIVATE_SHAPES`, `UNIT_INSTALLED`, `CADDY_DEDICATED`. Importé de la synchro : `CA_SCHEMA`, `CA_KEYS`, `CA_CHECKS`,
`CA_BODY_PATHS` (FM-1.1) ; de `dojo-served-load.ts` : `DOJO_HOST` ; du vérificateur : `DOJO_VERIFY_REPORT_KEYS`, `VERIFY_BOUNDS` ; de
`scripts/dojo-deploy.mjs` : listes d'arbres, unités, extrait. Aucune barre oblique inverse dans les fichiers créés (classes `[.]`, `[/]`,
`String.fromCharCode(10)`).

## Les douze contrôles, un par un (en ligne ; hors ligne = table C-V-4 de PB-2)

- **c01** : GET `/timeline.jsonl` (verify-bell `httpGet` : sans redirection, corps ≤ 64 Mio) : 200, corps terminé par LF, au moins une
  ligne, chaque ligne JSON de `schema` `dojo-timeline-v1` ; `detail` commence par `checked_at=<ISO UTC>`. Hors ligne : le fichier du miroir.
- **c02** : GET `/dojo/pubkey.json` : 200 et `canonical` égal à celui du trousseau `--keyring` (un nombre que `canonical` refuse : rouge,
  jamais une exception). Hors ligne : le fichier du miroir.
- **c03** : vraie CLI `node apps/dojo/scripts/dojo-verify-cli.mjs --url <url> --keyring <kr>` (hors ligne : `<miroir> --keyring <kr>`)
  par `execFile(process.execPath, …)` asynchrone, `env` = E, délai T ; vert ssi sortie 0, une seule ligne, objet aux clés =
  `DOJO_VERIFY_REPORT_KEYS`, `ok` vrai, `status` `consistent_with_supplied_keyring`, `trust_root` `supplied_keyring`, `detail` nul.
- **c04** : chaque réponse des fichiers servis lus (chronologie, clé, immuables nommés) porte `access-control-allow-origin: *`. Hors
  ligne : jamais passé.
- **c05** : `/`, `/lines/`, `/history/`, `/dojo/` répondent, statut ≠ 200, corps sans nom servi (aucun listage). Hors ligne : jamais passé.
- **c06** : `Cache-Control` de chaque immuable porte le jeton `immutable` ; chronologie et clé : jeton `no-cache`, sans `immutable`.
  « Chaque » sur un ensemble vide est vrai (la non-vacuité de la CA est portée par c11). Hors ligne : jamais passé.
- **c07** : poignée de main TLS `authorized` (sonde de verify-bell, magasin par défaut du binaire) ET aucun nom de l'environnement de la
  CA en `^(NODE_|SSL_|OPENSSL_)` ou finissant par `PROXY` (casse ignorée) ET `execArgv` vide ; cible http : sautée, jamais passée
  (couture `tlsProbe` des tests seule) ; `detail` : noms trouvés et noms d'options, jamais une valeur, et le magasin nommé
  (`ca_default`, `ca_bundled`, égalité, sha256 du magasin par défaut). Hors ligne : jamais passé.
- **c08** : aucune forme privée (`PRIVATE_SHAPES`) dans un corps servi lu ; `/dojo/pubkey.json` : au moins une clé, chaque `public_key` aux
  seules clés `crv`, `kty`, `x` ; les treize sondes du pli répondent ≠ 200. Hors ligne : tout fichier du miroir est dans la liste fermée
  servie (M-E9), formes privées absentes, JWK publics seuls.
- **c09** : (a) arbre de publication capturé = blobs du G7 de `DOJO_PUBLISH_TREE_PATHS` (mêmes chemins, mêmes empreintes, aucun de plus) ;
  (b) arbre de collecte = blobs de `DOJO_COLLECT_TREE_PATHS` ; (c) chacune des quatre unités : `systemctl cat` à UN en-tête, en ligne 1,
  `/etc/systemd/system/<nom>`, fragment = blob ; (d) `NeedDaemonReload` = `no` quatre fois ; (e) lignes `import` du Caddyfile principal
  (jetons séparés par espace ou tabulation) = exactement {Bell, Dōjō} ; (f) extrait installé = blob de `deploy/Caddyfile.monark-dojo` ;
  (g) noms du bloc du gestionnaire et d'une invocation aux propriétés de l'unité de publication : non vides, sans nom des familles de
  c07. Hors ligne : identique (captures).
- **c10** : captures `sha256sum` avant et après égales octet pour octet, analysables, portant un fichier sous `/opt/monark-bell/`,
  l'unité de Bell, l'extrait de Bell, `/etc/monark/probe.env` et un fichier sous `/opt/monark-probe/`.
- **c11** : tête = dernière ligne `snapshot` de la chronologie lue PAR LA CA ; nulle : rouge, `no snapshot served` ; sinon la CA recalcule
  sur les octets qu'elle a lus le compte, le sha256 et la racine (`rootOf`) du fichier de lignes de la tête et du fichier d'historique ;
  égaux au rapport de c03 ET aux lignes signées ; `day` de premier niveau du rapport = `day` de la ligne ; `timeline_sha256` du rapport =
  `bodies_sha256["/timeline.jsonl"]`. Sans ligne `history` : `history` du rapport nul. Hors ligne : identique sur le miroir.
- **c12** : chaque fichier nommé par la chronologie lue (`lines/<lines_sha256>.jsonl`, `history/<history_sha256>.jsonl`) : nom de 64 hex,
  200, sha256 = nom ; fichiers lus ≤ `MAX_FILES`, octets lus ≤ `MAX_TOTAL_BYTES` ; vrai à vide (ligne CA-0 de PB-5 : vert après A-8).
  Hors ligne : le fichier existe au chemin nommé du miroir, sha256 = nom.
- **Sortie** : les neuf clés de `CA_KEYS`, construites dans cet ordre ; `url` = `--url` tel quel (`null` hors ligne, Q-6) ; `head` =
  `{seq, day, lines_sha256, lines_count, recomputed_root}` (`seq` de la ligne de tête, `day` du rapport, le reste recalculé par la CA ;
  nul sans `snapshot`) ; `history` = `{history_sha256, history_lines_count, history_root}` recalculés (nul sans ligne) ; `tls` =
  `{authorized}` ; `bodies_sha256` par chemin d'URL des fichiers servis lus ; `inputs_sha256` : trousseau, deux arbres, captures nommées,
  deux empreintes de Bell, CLI du vérificateur. CLI : JSON sur stdout, `VERIFY OK - 12/12 …` ou `VERIFY FAILED: <noms>` sur stderr.
- **Usage** (sortie 2, rien écrit, aucun GET) : argument inconnu ou répété ; ni ou les deux de `--url`, `--offline` ; `--url` autre que
  `DOJO_HOST` exact ou `http://127.0.0.1[:port]` (cible de test) ; `--offline` qui n'est pas un répertoire ; `--keyring` absent ; `--g7`
  hors 40 hex ; `--tree-digests`, `--loaded-config` ou `--bell-digests` manquants.

## Tests (PB-6, noms exacts) et tueurs (une ligne `// killer:` juste au-dessus de chaque test, les autres empilées)

- **T-B1 `verify_dojo_ca_runs_real_dojo_verify`** (TU-5, TU-5c, TU-6, et TU-7 composé) : état du vrai éditeur (calque déclaré de
  `world`, `packet`, `writeDay`, `cliAt` de `test/dojo-publish-e2e.test.ts` l.43-116 : vrais écrivains, vrai `--history`), servi par le
  modèle Caddy de `deploy/Caddyfile.monark-dojo` sur `127.0.0.1:0`, vraie CLI par défaut (chemin épinglé), coutures `tlsProbe`, `env`,
  `execArgv` seules ; (i) avant le premier `snapshot` : rouge = [c11], `no snapshot served` ; (ii) après `publishDay` : 12/12, sortie 0,
  racines recalculées dans le test par `rootOf`, `timeline_sha256` = sha256 du corps servi ; la CA écrite (seule substitution DÉCLARÉE :
  `url` → `DOJO_HOST`) est lue par la vraie synchro `runSync` sur une racine temporaire : enregistrement et manifeste écrits ; (iii)
  publication du jour suivant entre la lecture de la CA et celle du vérificateur : rouge = [c11] (TB-19). Tueur : M-H25.
- **T-B2 `verify_dojo_ca_checks_named_and_fail_closed`** : noms = `CA_CHECKS`, clés = `CA_KEYS`, formes fermées ; base verte (vérificateur
  de substitution qui imprime le rapport du vrai vérificateur sur ces octets) ; chaque contrôle seul rouge sur sa faute ; mode hors ligne
  par la vraie CLI de la CA : sortie 1, `VERIFY FAILED` sur c04 à c07, jamais `VERIFY OK` ; usages : sortie 2, rien écrit ; la CA verte
  liée par `bindDojoCa` à l'enregistrement de son arbre. Tueurs : M-H24, M-H28.
- **T-B3 `verify_dojo_ca_leaves_bell_untouched`** : c10 vert à captures égales et complètes ; rouge sur un fichier de Bell, l'unité,
  l'extrait, `probe.env`, un fichier de la sonde changés, une entrée requise absente, une capture absente. Tueur : M-H12.
- **T-B4 `verify_dojo_ca_closes_the_tls_environment`** : vérificateur de substitution qui écrit les NOMS de son environnement : = E,
  alors que la CA porte aussi des familles et un nom inconnu ; un marqueur posé dans le vrai `process.env` n'atteint pas l'enfant ; chaque
  famille et chaque option : c07 rouge qui la nomme, jamais sa valeur. Tueurs : M-H22, M-H23.
- **T-B5 `verify_dojo_ca_needs_a_head_and_the_same_timeline`** (sans la jambe « version due », 2b-2) : tête nulle ; `timeline_sha256`
  d'une autre chronologie ; racine de tête altérée ; racine d'historique altérée ; ligne de tête signée à racine fausse que le rapport
  recopie (vérificateur au défaut partagé, FM-3.3) : c11 rouge à chaque fois. Tueurs : M-H15 (tête), M-H15 (historique), M-H20, M-H21, M-H27.
- Forme : chaque test assert d'abord l'existence du module neuf puis l'importe (import calculé : rouge à la base par assertion,
  précédent `apps/dojo/test/dojo-verify.test.ts` l.28-33) ; aucun calcul lourd au chargement ; boucle locale seule ; clés générées à
  l'exécution ; aucune barre oblique inverse ; aucun `any` (plafond du cliquet 69).

## Compte ascendant par fichier (AVANT tout code ; estimation, jamais une mesure)

| Fichier | Lignes estimées |
|---|---|
| `scripts/verify-dojo.mjs` | ≈ 240 (en-tête 15, imports et constantes 35, arguments 30, douze contrôles 120, sortie et CLI 40) |
| `scripts/verify-dojo.d.mts` | ≈ 30 |
| `test/verify-dojo.test.ts` | ≈ 360 (en-tête et imports 35, aides 60, calque de `world` 45, T-B1 45, T-B2 95, T-B3 20, T-B4 35, T-B5 30) |
| Total R-25 (les `docs/**/*.md` sont exclus par `ci.yml` l.82) | ≈ 630, sous la borne de 800 de la mission |

PB-1 projetait 377 ascendantes × 2,31 ≈ 871 pour 2b-1 : le présent compte, du bas, est plus serré ; la mesure tranche (r25.mjs, puis
comparaison à 800 par moi : `r25.mjs` ne rougit qu'à 1 205). Au-delà de 800 : dit, jamais compacté.

## Questions ouvertes (Q-n ; jamais tranchées seules)

- **Q-1** : écart de conduite (index rafraîchi), ci-dessus.
- **Q-2** : délai T de l'enfant = 740 000 ms, valeur de la ligne datée PROPOSÉE de DOJO-VERIFY-SCALE-1 (journal G1 de PR-3b-2a l.354 ;
  l'unité en a adopté les valeurs sœurs : tas 448, `MemoryMax=512M`, `TimeoutStartSec=2900`) ; aucune ligne datée de ratification lue à
  l'ADR : ratifier ?
- **Q-3** : CA-0 précède A-6 (RUNBOOK §10) ; c09 (e) et (f) exigent l'import et l'extrait du Dōjō, c10 l'extrait de Bell (BELL-CA-DOJO-1)
  : avant A-6, c09 est rouge sur ces deux sous-contrôles alors que la ligne CA-0 de PB-5 l'attend vert. Code écrit à la lettre de c09
  (« comme en ligne ») ; trancher : attendu de CA-0 amendé, ou forme « avant A-6 » de c09 ?
- **Q-4** : TU-7 : PB-1 met le RUNBOOK de TU-7 dans 2b ; la mission ne demande que CA-0 et CA-1 : TU-7 à 2b-2 ?
- **Q-5** : forme d'hôte des commandes neuves du RUNBOOK : la mission interdit d'écrire une adresse IP ; le reste du fichier écrit
  `root@<adresse>` ; mes commandes écrivent `root@bell.monarkgate.tech` (l'enregistrement A existe, RUNBOOK-bell §7) : accepter l'écart
  de forme ?
- **Q-6** : `url` vaut `null` sous `--offline` (aucune URL n'est lue ; une CA hors ligne ne se lie jamais) ; et `--url` est fermé à
  `DOJO_HOST` exact ou à une origine de boucle locale (lecture de « origine sans barre finale », DOJO-CA-BODY-KEYS-1) : ratifier ?
- **Q-7** : `inputs_sha256.dojo_verify` n'épingle que le fichier de la CLI, pas sa fermeture d'imports (le cœur est épinglé sur l'hôte
  par c09, pas sur la machine de l'orchestrateur) : limite déclarée, item PAROXYSME proposé (épingler la fermeture, ou exiger les blobs
  du G7 pour la CLI et son cœur). La commande CA-1 du RUNBOOK (§21 (1)) exige déjà `git diff --quiet "$G7" HEAD` sur ces chemins.
- **Q-8** : écart de conduite (`error_origin` G1), ci-dessous « Écart Q-8 ».

## Advisor intégré (conseil, jamais verdict ; chaque point vérifié sur pièce)

- **Consultation n° 1** (05:1xZ, après l'orientation, avant toute écriture) : journal d'abord ; `--url` fermé à `DOJO_HOST` (importé)
  ou à la boucle locale, substitution déclarée du seul `url` dans T-B1, liaison par `runSync` si le budget le permet ; E nommant les
  noms de plateforme, couture `env` de T-B4 construite depuis le vrai `process.env` ; vacuité de c06 et c12 (PB-5 attend c12 vert après
  A-8) ; magasin nommé, pas fermé ; T = 740 000 ms avec Q-n ; réutiliser verify-bell ; aucune barre inverse, aucune IP ; aucun
  `LoadCredential` dans le job de capture ; F2P par import calculé ; stubs partout sauf T-B1 ; tueurs empilés ; RUNBOOK sans
  renumérotation ; une course à la fois sur clone. Tout retenu ; vérifié sur pièce : `test/journal-index.test.ts` n'indexe pas
  `docs/G1-lot-*.md` (dépôts jetables sous `docs/journal/`), `lang-gate` saute `docs/`, `gate:vocab` ne lit ni `scripts/` ni `test/`.

## Code et tests (tâche 2 ; écrits après ce plan, 05:3xZ à 05:53Z)

- `scripts/verify-dojo.mjs` (255 l.) : les douze contrôles de la section ci-dessus, dans cet ordre de lecture : GET de la chronologie
  (c01) puis de la clé (c02), GET de chaque fichier nommé (c12), PUIS l'enfant vérificateur (c03), de sorte qu'une publication entre la
  lecture de la CA et celle du vérificateur rougisse c11 (TB-19) ; exports `DOJO_CA_CHILD_ENV` (E, les onze noms mesurés),
  `DOJO_CA_TLS_FAMILY`, `DOJO_CA_TIMEOUT_MS` (740 000, Q-2), `DOJO_CA_PROBES` (les treize sondes du pli), `DOJO_CA_UNITS`,
  `DOJO_CA_CAPTURES`, `runCa`. Correction de relecture avant toute course (05:50Z, l.141 réécrite en place, aucune ligne déplacée) : une
  ligne `snapshot` ou `history` sans empreinte de 64 hex compte comme nom fautif de c12 (avant : ignorée, passage à vide).
- `scripts/verify-dojo.d.mts` (36 l.) : surface de types (précédent `verify-bell.d.mts`).
- `test/verify-dojo.test.ts` (422 l.) : T-B1 à T-B5 aux noms de PB-6 ; 31 fautes isolées dans T-B2 (chaque contrôle au moins une, ensemble
  rouge = ce contrôle seul, sauf « deux lignes » = c03 et c11, déclaré) ; hors ligne en processus et par la vraie CLI de la CA (sortie 1,
  `VERIFY FAILED` sur c04 à c07, `--out` écrit, jamais `VERIFY OK`) ; onze usages (sortie 2) dont `DOJO_HOST/` (barre finale), une
  origine https étrangère, `http://localhost:1` ; l'origine de production franchit la règle de `--url` sans réseau (le refus suivant est
  celui du trousseau) ; usage par la CLI : sortie 2, stdout vide, rien écrit ; une CA à contrôle rouge est refusée par la synchro.
  Correction après `red-proof` n° 1 (05:53Z) : les liaisons positives passent par `assert.doesNotReject` (aide `bound`) : le tueur M-H25
  de T-B1 tuait par une exception de `runSync` (« other-fail »), que l'outil de mutants aurait classée « non conclu ».
- `docs/RUNBOOK-dojo.md` (hors R-25) : §15 réécrit (CA-0 : (1) empreintes de Bell et de la sonde, (2) captures de c09, (3) miroir,
  (4) la CA sous `env -i`, attendus de la table C-V-4 et de Q-3), §21 ajouté avant « Never » (CA-1 : (1) outils de HEAD = G7, (2) preuve
  de suffisance de E contre `bell.monarkgate.tech`, (3) captures, (4) la CA, commit, TU-7 renvoyé à Q-4), §10 : « CA-1 (section 21) ».
  Aucune adresse IP écrite (Q-5) ; aucune barre inverse ; lignes ≤ 160 ; aucune commande ne nomme `/etc/monark/dojo/` ; aucun
  `printf` de clés ni `install -d … 2750` ajouté (épingles de `test/dojo-collect-deploy.test.ts` l.122 et l.125) ; numéros 1 à 20 inchangés.

## Mesures (tâche 3 ; clone d'itération `F:/tmp/dojo/pr3b2b1/it1` à `224a6bd1`, fichiers du lot copiés, jonctions `mk-nm.ps1`)

- Course 1 (05:51:10Z, verrou libre, 9 `node.exe`) : `test/verify-dojo.test.ts`, 5/5 verts, 10,5 s (`run1.tap` `6463fb6b…751a`) ; course 2
  après la correction (05:53:35Z, verrou libre) : 5/5 (`run2.tap` `49eb1d812bac154d3b8c737ed6a13f0f2b73e4b14aa24570ed690ccdda63751a`).
- Tests voisins (05:56:57Z, verrou libre, 11 `node.exe`) : `test/dojo-publish-deploy.test.ts`, `test/dojo-collect-deploy.test.ts`,
  `test/no-secret-in-repo.test.ts`, `test/deps-hygiene.test.ts`, `test/export-hygiene.test.ts` : 27/27 (`run-related.tap` `1f9dfba0…1d2d`),
  avec le RUNBOOK modifié (épingles par section intactes).
- Portes statiques sur le clone : `tsc --noEmit` 0 (`tsc-3.log` vide) ; ESLint du fichier de test 0 message, et 0 avec les six règles du
  cliquet réactivées (`F:/tmp/dojo/pr3b2b1/lint-one.mjs` `07aee7c3…fd4`) ; `export-public.mjs --check` 0 (`export-check.log` `08affca0…3f9f`) ;
  `lang-gate.mjs` 0 (`lang-gate.log` `b7247d5b…270f`) ; `grep-forbidden.mjs` 0 (`vocab.log` `81694cc0…52d8`). Les portes entières
  (dont `lint` et `lint:ratchet` sur tout le dépôt) sont rejouées par l'oracle.
- **R-25** (05:56:39Z) : `r25()` de `F:/Monark/scripts/oracle/r25.mjs` sur le clone jetable `F:/tmp/dojo/pr3b2b1/r25clone` (fichiers du lot
  copiés, commit de gel `8b71abf4` DANS ce clone seulement, identité locale, jamais le worktree ni `F:/Monark`), base `224a6bd1` :
  `STAT: 713 insertions(+), 0 deletions(-), changed 713` (borne CI 1 205), `CONTENT_STAT` 0 ; GREEN (`r25.log` `ed1f17c8…cafe`, script
  `tools/r25-measure.mjs` `8f65462e…09d7`). **713 ≤ 800** (borne de la mission ; solde 87) ; ≤ 1 150 (solde 437). Compte ascendant du
  plan ≈ 630 : mesure 713 (×1,13). Aucune compaction.
- **Tueurs** (05:54:19Z-05:56:00Z ; verrou libre avant ; aucune autre course pendant) : `node F:/Monark/scripts/mutants/run.mjs --repo
  F:/tmp/dojo/pr3b2b1/mclone --base 224a6bd1… --out F:/tmp/dojo/pr3b2b1/mutants-1 --killers --file scripts/verify-dojo.mjs --targets
  test/verify-dojo.test.ts --lock-root F:/tmp --min-free-mb 4096` sur un clone NEUF (`mclone`, fichiers du lot copiés, égalité sha256
  vérifiée, jonctions `mk-nm.ps1`) : base verte (5/5), **12 tués sur 12**, sortie 0 ; `RESULTS.json`
  `b5c656bf258dbaa3cd4174c8ade02b33807b892c2327eb9bd22af5bcb5fe4dd8`, `RESULTS.txt` `a576b2fe…cfd0`, outil `41cdf83f…1ac8`. K9 (M-H15 tête)
  tue deux tests (T-B2 et T-B5 : `strict` faux par le compte, tué par assertion).

| Tueur | Mutant (PB-6) | Ligne de `verify-dojo.mjs` | Test | Résultat |
|---|---|---|---|---|
| K1 | M-H25 `checked_at` au premier niveau | 237 | T-B1 (juste au-dessus) | tué |
| K2 | M-H28 c04 passé hors ligne | 154 | T-B2 (empilé) | tué |
| K3 | M-H24 c03 vert à `detail` non nul | 149 | T-B2 (empilé) | tué |
| K4 | M-H24 c03 vert en `self_consistent_only` | 149 | T-B2 (juste au-dessus) | tué |
| K5 | M-H12 c10 sans l'égalité avant et après | 204 | T-B3 | tué |
| K6 | M-H23 c07 vert sous une famille ou un `execArgv` | 168 | T-B4 (empilé) | tué |
| K7 | M-H22 enfant qui hérite de l'environnement | 78 | T-B4 (juste au-dessus) | tué |
| K8 | M-H27 racine de tête prise au rapport | 216 | T-B5 (empilé) | tué |
| K9 | M-H15 sans racine recalculée de la tête | 219 | T-B5 (empilé) | tué |
| K10 | M-H15 sans racine recalculée de l'historique | 221 | T-B5 (empilé) | tué |
| K11 | M-H21 c11 sans l'égalité de `timeline_sha256` | 225 | T-B5 (empilé) | tué |
| K12 | M-H20 c11 vert sur tête nulle | 225 | T-B5 (juste au-dessus) | tué |

- M-H26 (version due, Q-B1 (a)) : hors de ce lot (2b-2), aucune ligne.

## Écart Q-8 (`error_origin` G1)

- À 05:57:15Z, une course de 17 tests (`test/byte-guard.test.ts`, `test/no-secret-in-repo.test.ts`, sur `r25clone`, quelques secondes,
  17/17, `run-guards.tap` `22e87e19…6138`) a tourné alors que `held(F:/tmp)` lisait un verrou tenu par le pid vivant 349380 : ma commande
  enchaînait la lecture du verrou et la course par `;` au lieu d'en faire une condition. Aucun oracle arrêté, aucun fichier d'autrui
  touché. Parade appliquée dès 05:57:32Z : `F:/tmp/dojo/pr3b2b1/tools/gate.mjs` (`0adc93a2…7197`) sort 1 si le verrou est tenu ou si C-V-4
  échoue (`node.exe` ≤ 40, physique ≥ 4 096 Mo, virtuelle ≥ 8 192 Mo), et chaque course suivante est lancée par `gate.mjs && …`.

## Correction n° 3 et mesures finales (06:0xZ, avis de l'advisor n° 2)

- Test : le cas « dix-neuvième clé » forgeait `price_version_pending`, clé que Q-B1 (a) ajoutera en 2b-2 (le cas deviendrait vert à
  tort) ; remplacé par `extra_key` (« a key outside DOJO_VERIFY_REPORT_KEYS »). Le fichier garde 422 l. ; les douze lignes `// killer:`
  sont égales octet pour octet aux douze que calcule `tools/killers.mjs` (`bad=0`, `cmp` vert).
- Sous `env -i PATH="$PATH"` (Git Bash, 06:04:40Z) : `execFileSync("git")` trouve `git version 2.55.0.windows.5` (`envi-git.txt`
  `72dc60e1…c46c`) ; la CA démarre, imports `.ts` compris, et refuse `--url x` par l'usage, sortie 2 (`envi-ca-usage.txt` `1b676bfa…5cc1`) ;
  magasin TLS par défaut = embarqué, 145 = 145 (`envi-store.txt` `286d606a…517b`).
- **`red-proof` final** (06:04:50Z-06:05:29Z, `gate.mjs` GO, 9 `node.exe`) : `node F:/Monark/scripts/red-proof.mjs --base 224a6bd1…
  --gel F:/Monark-wt-verifydojo --repo F:/tmp/dojo/pr3b2b1/it1 --out F:/tmp/dojo/pr3b2b1/red-proof-2 --draw 5 --seed 2026`, TEMP sous
  `F:/tmp/dojo/pr3b2b1/tmp`, `GIT_OPTIONAL_LOCKS=0` : **sortie 0, « red-proof OK: 5 judged, 0 unchanged, 5 killer(s) drawn »** ; les cinq
  tests `assert-fail` à la base et `pass` au gel (F2P) ; les cinq tueurs tirés (l.204, 237, 78, 225, 149) tués par assertion ;
  `RED-PROOF.json` `ff087d448c1ff23f51c2d58fd35ad9db18b270b6d7b602efc2a4578c0754d581` (digest des changements
  `f486e010dfeed9dac7998da7baf3dc649dfabc3f05486a00c4195105cb293e42`), `base.tap` `d2638b97…e7f8`, `gel.tap` `ff9a8313…aeb3ae4`. Le
  `red-proof` n° 1 (05:52Z, `RED-PROOF.json` `03e266ea…0029`, avant `bound` et `extra_key`) est périmé, gardé pour trace.
- **Tueurs, campagne finale** (06:05:57Z-06:07:36Z, `gate.mjs` GO ; `RESULTS.txt` de la campagne n° 1 relu avant) : même commande sur un
  clone NEUF `F:/tmp/dojo/pr3b2b1/mclone2` (cinq fichiers du lot copiés, égalité sha256 vérifiée), `--out F:/tmp/dojo/pr3b2b1/mutants-2` :
  base verte, **12 tués sur 12**, sortie 0 ; `RESULTS.json` `c64d0427df0e26c238239ea7454d2541499efee4cd8551b9824e4e73d28ca908`,
  `RESULTS.txt` `30f20720…f7b1`. La campagne n° 1 (`b5c656bf…4dd8`, 12/12) portait le test d'avant `extra_key`.
- Non mesuré faute d'hôte (formes supposées, à constater à l'acte ; [2nd] de la documentation, jamais de l'hôte) : la sortie de
  `systemctl show -p NeedDaemonReload --value` à quatre unités (une valeur par unité, blocs séparés par une ligne vide : le parseur ne
  compte que les lignes non vides, quatre `no` exigés) ; `env -0 | sed -z "s/=.*//" | tr "[:cntrl:]" " "` sur le `sed` et le `tr` de
  l'hôte (GNU attendus ; une sortie portant `=` ou une valeur rougit c09, jamais ne verdit) ; la preuve de suffisance de E contre
  `bell.monarkgate.tech` (§21 (2)).
- Couverture déclarée : la jambe « publication entre deux lectures » de T-B5 est portée par T-B1 (iii) avec la vraie CLI et par le
  vérificateur de substitution à `timeline_sha256` d'une autre chronologie dans T-B5 ; le cas « deux lignes » de T-B2 rougit c03 ET c11
  par construction (sans rapport, c11 n'a rien à lier).

## Oracle du tronc, rôle G1 (06:08:12Z-06:16:15Z)

- Lancé derrière `gate.mjs` (GO à 06:08:12Z : verrou nul, 10 `node.exe`, 15 802 Mo physiques et 33 726 Mo virtuels libres), en tâche de
  fond, jamais interrompu, aucune autre course pendant : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-verifydojo
  --base 224a6bd19adb242613d263e219be94319411d6dd` (`GIT_TERMINAL_PROMPT=0`, `< /dev/null`).
- Enregistrement `F:/tmp/oracle-results/224a6bd19adb242613d263e219be94319411d6dd-987b20becef75162-G1-20261002T060812Z-72012.json`, sha256
  `740272bc149771b5c020ff3cff2584b95157d760b9a439e708078bb96c257401` (recalculé) : **sortie 0** ; arbre `head` `224a6bd1`, `dirty`
  `987b20becef751629622e50084e9b79d8d4788cb9357c58adb57ba3b976c6e4b`, `object` `3a2b26638270efc8aa4b47c7264d6f95076ad76c` ; neuf portes à 0
  (`lint-model-pinning` 121 ms, `r25` 53, `lang:gate` 1 852, `export:check` 1 279, `gate:vocab` 914, `typecheck` 7 499, `lint` 19 510,
  `lint:ratchet` 20 810, `test` 421 944 sous verrou, attente 0 s) ; **1 877 tests : 1 873 verts, 0 rouge, 4 sautés** (préexistants,
  d'environnement : SIGTERM sous win32 deux fois, nom 8.3 absent, artefacts u4b absents ; aucun de ce lot) ; les cinq tests du lot verts
  (`09-test.log` `5be29571…90f3`) ; R-25 de l'oracle : 713 (borne CI 1 205) ; C-V-4 : 15 752 Mo, 10 `node.exe`.
- Contrôle (06:18Z) : le digest `dirty` recalculé sur le worktree par la recette de l'oracle (`tools/dirty.mjs`) vaut `987b20be…6e4b` :
  l'arbre livré est l'arbre jugé. Après l'oracle, SEUL ce journal change (cette section et la suivante) ; les quatre autres fichiers
  gardent les empreintes du gel ci-dessous ; le journal valait `6a8d59e56df8f2b038821cde5d95a56a6bf01d92635ac9ec1727eca8c2cf087e` (296 l.)
  à l'oracle ; sa valeur finale est rendue hors du fichier (`REPONSE.md`, `DELIVERED.sha256`). L'index du worktree garde la date de
  05:01:54Z (Q-1) : ni l'oracle ni `red-proof` ne l'ont réécrit.

## Fin (06:1xZ)

- Empreintes du gel (les fichiers jugés par l'oracle) : `scripts/verify-dojo.mjs` (255 l.)
  `d287b5ad9ba4f17f90e386de2a6e402db36ca13401e0ea2b74145056048d3221` ; `scripts/verify-dojo.d.mts` (36 l.)
  `8f9f222acb622c09ae76cf77c7499c1e26d0c07b5770011acf63dcb62f60805f` ; `test/verify-dojo.test.ts` (422 l.)
  `c06913a41a9d26364b71181e28ee4c47db05645cb8b7cc90923bac2c898bee4a` ; `docs/RUNBOOK-dojo.md` (1 079 l.)
  `26f3a1a2c5b6ae7ea460936fea661d4e31b14f63ac8bff91f7ed9e5c44a4795a`.
- Nettoyage (06:17:41Z) : jonctions retirées par `rm-nm.ps1` de `it1`, `mclone`, `mclone2`, `mutants-1/clone`, `mutants-2/clone` ;
  `F:/Monark/node_modules` : 220 entrées et 11 `@monark` avant et après ; clones et preuves gardés sous `F:/tmp/dojo/pr3b2b1/` (cités).
- Provenance : worker `claude-opus-5-5`, effort max, contexte frais, 2026-10-02 ; `git` en lecture seule dans le worktree (avec
  `--no-optional-locks` après l'écart Q-1) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, jamais `git write-tree` ; aucun
  git écrivant dans le worktree ni dans `F:/Monark` ; seuls git écrivants : des clones jetables sous `F:/tmp/dojo/pr3b2b1/` (clones, et le
  commit de gel de `r25clone`) ; réseau : boucle locale seule ; rien sur C: ; aucune adresse IP écrite ; aucune ligne d'ADR écrite ;
  aucune ligne de `apps/dojo/scripts/dojo-verify.mjs` changée. Réviseur : la G2 de la partie 3 (une seule, après ce G1), puis le G7.
- **Verdict du G1 : LIVRÉ-AVEC-RÉSERVES.** Réserves : (1) Q-1 et Q-8, écarts de conduite consignés ; (2) Q-3 : c09 (et c10 avant
  BELL-CA-DOJO-1) rouge à CA-0 avant A-6, contre l'attendu de la ligne CA-0 de PB-5 : code écrit à la lettre, à trancher ; (3) Q-2, Q-4 à
  Q-7 ouvertes (délai T, TU-7, forme d'hôte du RUNBOOK, `url` nul hors ligne et `--url` fermé, fermeture d'imports de la CLI) ; (4) formes
  de capture de l'hôte non mesurées (section « Correction n° 3 et mesures finales »).
- **Q-9** (forme, relevée à la consultation n° 3) : au §15 (3) du RUNBOOK, les gabarits `public-ca0-<n>` des l.583-585 sont hors
  guillemets (`mkdir -p …`, `scp … …/public-ca0-<n>/`, `cd …`) : collé tel quel dans Bash, `<n` serait une redirection (précédent du
  même fichier : `provisional-<J>` l.813, hors guillemets aussi ; aux l.597-598 le gabarit est dans `A="…"`, inoffensif). Correction de
  forme pour le tour de corrections (gabarit entre apostrophes, ou numéro littéral à remplacer) ; non faite ici, pour que l'arbre livré
  reste l'arbre jugé par l'oracle. Recommandation : apostrophes.
- **Consultation n° 3 de l'advisor** (06:2xZ, livrables écrits, avant la remise) : compte des consultations à mettre à jour (trois),
  Q-9 ci-dessus, forme de la sortie structurée ; rien d'autre ne bloque. Retenu ; aucun des quatre fichiers du gel n'est touché
  (`d287b5ad…`, `8f9f222a…`, `c06913a4…`, `26f3a1a2…`).
