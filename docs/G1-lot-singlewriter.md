claude-opus-5-5

# G1 — journal de provenance, lot DOJO-PUBLISH-SINGLE-WRITER-1 (un seul écrivain sous `--state` ; plan `docs/G0-lot-single-writer.md`)

- **Modèle résolu (R-1)** : `claude-opus-5-5`, effort `max`, palier de la mission ; implémenteur, contexte frais.
- **Mission** : `F:/tmp/dojo/mission-impl-singlewriter.md` (69 l.), sha256 `199b606e00ca59a2a24ecd4896d67c29cf3b1a15ff1e5fff54f6da982c96e413`,
  recalculé à 00:07:40Z et égal au champ `sha` du reçu `F:/tmp/dojo/mission-impl-singlewriter.recu.json` (verdict `vert`, douze règles à 0).
- **Worktree** : `F:/Monark-wt-single-writer`, branche `lot/single-writer`, HEAD `b94cd20e2d8f707b803de2a7775eddf87a66b4f8`, propre à
  l ouverture ; les 9 sha256 de l en-tête de mission et les 6 outils recalculés : tous égaux. Aucun git écrivant dans le worktree ni dans
  `F:/Monark` ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun réseau ; aucune clé réelle.
- **Advisor intégré** : appelé à 00:16Z après l orientation, avant l écriture : « rate-limited », non relancé dans le tour (consigné, jamais
  contourné) ; chaque choix hors du plan est déclaré (§ 7) ou rendu en Q-n avec sa recommandation (§ 8).

## 1. Compte ascendant par fichier, établi AVANT tout code (00:20Z ; insertions + suppressions, une ligne modifiée = 2 ; jamais une mesure)

Entrées lues en entier, dans l ordre de la mission : `docs/ETAT.md` (59 l.) ; `docs/G0-lot-single-writer.md` (185 l., sha256 `b9aa5795…`) ;
`apps/dojo/scripts/dojo-publish.mjs` (382 l.) et `.d.mts` (35 l.) ; `apps/dojo/test/dojo-publish.test.ts` (595 l.) ;
`test/dojo-publish-e2e.test.ts` (130 l.) ; `test/dojo-entry-link.test.ts` (62 l.) ; `packages/rpc-guard/src/lock.ts` (44 l., sha256
`6655a9c8…`) ; `F:/Monark/scripts/red-proof.mjs` (268 l., `parseKiller` l.46-49, jugement des corps l.122-127, sha256 `6579b550…`).

| Fichier | Composante | Asc. |
|---|---|---|
| `apps/dojo/scripts/dojo-publish.mjs` | en-tête du module, l.8 (modes) et l.10 (disposition de `--state`) | 4 |
| idem | `unlinkSync` dans la déclaration `node:fs`, l.12 (Q-SW-1 (a)) | 2 |
| idem | `"lock_held"` dans la liste fermée des refus, l.29 | 2 |
| idem | section du verrou après l.336 : `STATE_LOCK`, vivacité, propriétaire, refus nommé | 9 |
| idem | prise et relâche (`takeLock`), enveloppe du dispatch (`locked`) | 15 |
| idem | `--unlock <state>` (`unlock`) | 11 |
| idem | usage l.338, `MODES` l.340, `VALUED` l.341 | 6 |
| idem | `runCli` : branche `--unlock` (1), l.368 et l.371 retouchées (4) | 5 |
| `apps/dojo/scripts/dojo-publish.d.mts` | `STATE_LOCK` et son commentaire | 2 |
| `test/dojo-publish-e2e.test.ts` | en-tête (1), import `existsSync` (2), `cliAt` (4) | 7 |
| idem | aides `LF`, `files`, `killAt` | 8 |
| idem | T-SW1 (32), T-SW2 (24), deux lignes `// killer:` (2), lignes vides (2) | 60 |
| `test/dojo-entry-link.test.ts` | réancrage des deux tueurs de la garde de l éditeur (Q-SW-1 (a)) | 4 |
| **Total** | hors ce journal (`docs/**/*.md` exclu de R-25) | **≈ 135** |

Écart avec le § 8 du plan (≈ 112) : le plan compte 1 par ligne modifiée ; ce compte compte 2 (forme du journal G1 d ENTRY-MAIN-LINK-1).
Borne de la mission : 1 150 ; garde du plan (D-SW9) : 300 ; la mesure `r25()` fait foi (§ 6).

## 2. Compte mesuré (`git --no-optional-locks diff --numstat b94cd20e`, worktree, lecture seule, 00:39:38Z)

| Fichier | Insertions | Suppressions | Mesure | Asc. |
|---|---|---|---|---|
| `apps/dojo/scripts/dojo-publish.mjs` | 45 | 9 | 54 | 54 |
| `apps/dojo/scripts/dojo-publish.d.mts` | 2 | 0 | 2 | 2 |
| `test/dojo-publish-e2e.test.ts` | 89 | 3 | 92 | 75 |
| `test/dojo-entry-link.test.ts` | 2 | 2 | 4 | 4 |
| **Total** | 138 | 14 | **152** | ≈ 135 |

Écart du test (+17) : T-SW1 fait 44 lignes (asc. 32 : capture de stdout, rendu en `finally`, assertions séparées), T-SW2 28 (asc. 24), aides 9 (asc. 8).

## 3. Décision → fichier → test (lignes du fichier livré)

| Décision du plan | Fichier : lignes | Test |
|---|---|---|
| D-SW1 : un seul écrivain ; tout autre lancement `lock_held`, sortie 1, rien écrit | `dojo-publish.mjs` l.337-359, l.404-407 | T-SW1 |
| D-SW2 : `"wx"`, enregistrement `{pid, mode, taken_at}` écrit, fsyncé, fermé, répertoire fsyncé | l.345-354 | T-SW1 (enregistrement relu dans la pause) |
| D-SW2 : prise HORS du `try` qu elle garde ; relâche par son seul preneur | l.355-359 ; l.353 | T-SW1 (enregistrement étranger laissé) |
| D-SW3 : propriétaire mort, jamais de vol ; `--unlock` refuse vivant ou illisible | l.360-371 ; `runCli` l.394 | T-SW1 (vivant), T-SW2 (mort, déchiré) |
| D-SW4 : en place l.8, l.10, l.12, l.29 ; insertions après la l.336 et dans `runCli` | l.337-371, l.394 | 18 tests de l éditeur verts, tueurs intacts |
| D-SW5 : `unlinkSync` dans la déclaration `node:fs`, aucun module neuf | l.12 | T-8 `dojo_publish_imports_no_network_module` |
| D-SW6 : verrou à la racine de `--state` | l.348, l.363 | T-SW1 (`publish.lock` à la racine, absent de `public/`) |
| D-SW7 : aucune création sur refus ; `--state` absent : `fatal: ENOENT` | l.350 (aucun `ensureDir`) | mesure CLI (§ 5) ; `files(s)` de T-SW1, T-SW2 |
| D-SW8 : deux tests neufs à processus réels sous `test/` | `test/dojo-publish-e2e.test.ts` l.141-216 | T-SW1, T-SW2 |
| `STATE_LOCK` exporté et déclaré (une source) | l.339 ; `.d.mts` l.15-16 | première assertion de T-SW1 et de T-SW2 |
| `"lock_held"` dans la liste fermée des refus | l.29 | refus nommé de T-SW1, T-SW2 |
| usage, `MODES`, `VALUED` (mode valué `--unlock <state>`) | l.372-376 | T-SW1, T-SW2 ; usage d ENTRY toujours `--inbox` en tête |
| Q-SW-1 (a) | l.12 ; tueurs d ENTRY réancrés l.381 vers l.417 | contrôle statique des tueurs (§ 5) |
| Q-SW-2 (a) : `--unlock` explicite, aucune reprise automatique | l.360-371 | T-SW2 |
| Q-SW-3 (a) : consigne STOP écrite par l orchestrateur | `docs/RUNBOOK-dojo.md` non touché | sans objet |
| futur mode `history` sous le même dispatch verrouillé | l.404-407 enveloppent toute la chaîne de modes | à ajouter aux enfants de T-SW1 par son G1 |

## 4. Mesures exigées du G1 (plan § 5, « À MESURER ») et relecture adverse

- **(a) préchargement** : sonde `F:/tmp/dojo/singlewriter/probe/probe.mjs` (sha256 `9ef31d7e…`), sortie `probe-out.txt` (sha256 `a5ef2f55…`),
  00:21:33Z : `fs.openSync` ou `fs.renameSync` remplacé puis `syncBuiltinESMExports()` : l enfant meurt à l appel visé (ouverture : rien créé ;
  renommage : après l ouverture, rien renommé) ; SANS la synchro, il survit : les liaisons `import { openSync, renameSync }` gardent l original.
- **(b) statut sous win32** après `process.kill(process.pid, "SIGKILL")` : `status: 1`, `signal: null` (4 cas sur 4) ; `process.kill(pid, 0)`
  ensuite : ESRCH. Témoin retenu dans T-SW2 : `status !== 0`, jamais `signal`.
- **(c) réemploi immédiat de pid** (risque relevé en relecture de T-SW2 : le lancement suivant recevant le pid de l enfant tué se lirait
  `running`) : `tmp/pid-reuse.mjs` (sha256 `efa39a65…`), 300 lancements de suite, 300 pids distincts, 0 égal au précédent
  (`pid-reuse-out.txt`, sha256 `3a3234a4…`) : négligeable sur cet hôte ; s il survenait, refus fail-closed, jamais un vol.

## 5. Preuves (hors dépôt, sous `F:/tmp/dojo/singlewriter/`)

- **Clone de test** `clone/` : `git clone --no-local` du worktree, détaché à `b94cd20e`, les 4 fichiers du lot copiés (sha256 égaux au worktree,
  `sha256sum -c`) ; jonctions `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark` re-pointées, 0 échec), retirées par `rm-nm.ps1` à
  00:39:38Z ; `F:/Monark/node_modules` jamais modifié (220 entrées après).
- **Tests** (`node --test --test-reporter=tap --test-timeout=120000 --test-force-exit` sur `apps/dojo/test/dojo-publish.test.ts`,
  `test/dojo-publish-e2e.test.ts`, `test/dojo-entry-link.test.ts`, TEMP sous `F:/tmp/dojo/singlewriter/tmp`) : **31 verts sur 31**
  (18 de l éditeur, 10 d ENTRY, T-9, T-SW1, T-SW2), `suite-final.tap` sha256 `2f7aab41…`, 00:37:00Z à 00:37:16Z ; le fichier de bout en
  bout seul : trois passages verts de suite (`run1-e2e.tap` à `run3-e2e.tap`).
- **Portes statiques** (même clone, octets livrés) : `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `gate:vocab` : toutes
  sorties 0, 00:37:32Z à 00:38:36Z (`final-gate-*.txt`). Cliquet : 69/69, et 69/69 mesuré à la base `b94cd20e` (0 violation ajoutée).
  Un premier `lint` rouge : `@typescript-eslint/unbound-method` sur la cible `process.stdout.write` d une affectation par déstructuration ;
  remplacée par deux affectations directes (forme de `apps/dojo/test/dojo-publish.test.ts` l.535), rejouée verte.
- **Tueurs** (contrôle statique : `parseKiller` du tronc, règles de `killerProblem` de `red-proof.mjs` l.51-59 ; `tmp/killers-check.mjs`
  sha256 `3fa596dc…`, sortie `killers-check-out.txt` sha256 `0bdb2595…`) : 21 valides sur les 22 qui visent l éditeur, dont
  T-SW1 vers l.350 `CONST "wx" -> "w"` (M-SW2), T-SW2 vers l.367 `SDL "unlinkSync(p)" -> ""` (M-SW8) et les deux d ENTRY à la l.417 ;
  le 22e est antérieur au lot (Q-SW-G1-1).
- **Jugement de `red-proof`** (blocs `git diff -U0` contre `b94cd20e` et contre `8950ab15` : identiques) : lignes neuves 8, 13, 95, 98,
  101-109 et 141-216 du test ; le corps de T-9 (l.112-140) n est pas touché ; T-SW1 (l.143-186) et T-SW2 (l.189-216) sont jugés en entier,
  chacun rouge à la base par sa première assertion (`STATE_LOCK` absent) : attendu, non exécuté ici. Ni F2P, ni mutants, ni oracle (mission).
- **Comportements CLI** (dossier `tmp/cli-probe-ZB5C`, sans clé) : `--state` absent : `dojo/publish: fatal: ENOENT`, sortie 1, rien créé ;
  `--unlock` sans verrou : `{"status":"not_locked"}`, sortie 0 ; refus après la prise (clé illisible) : verrou retiré, état vide ; usage
  terminé par `| --unlock <state>`.

## 6. R-25 (`r25()` exporté de `F:/Monark/scripts/oracle/r25.mjs`, sha256 `4d0544df…`)

- Clone jetable `r25/` (`--no-local`, détaché à `b94cd20e`, fichiers du lot copiés) ; commits de gel LOCAUX `f6e81bf4` puis
  `d3934c62` (code et tests livrés ; le journal, hors R-25, y est antérieur) ; forme de `scripts/oracle/run.mjs` l.103 ; jamais poussés
  ni récupérés : `r25()` compare `<base>...HEAD`.
- Script `tmp/r25-run.mjs` (sha256 `8b27f211…`), sortie `r25-final.txt` (sha256 `52c538e7…`, égale à la première mesure) :
  base `b94cd20e` (le lot seul) : STAT 138 insertions, 14 suppressions, **152** ; CONTENT_STAT 0 ; **vert** (borne CI 1 205 ; mission 1 150 ;
  garde D-SW9 de 300 non atteinte). Base `8950ab15` (tronc, ENTRY-MAIN-LINK-1 inclus) : 221 + 24 = 245, vert.
- Contre-mesure sans commit (`git --no-optional-locks diff --shortstat b94cd20e`, worktree) : 4 fichiers, 138 insertions, 14 suppressions.

## 7. Écarts et choix déclarés (chacun vérifiable sur pièce)

- **Vivacité** (`running`, l.341) : toute erreur de `process.kill(pid, 0)` autre qu ESRCH se lit `running` ; `scripts/oracle/lock.mjs` l.13 lit
  `not running` toute erreur autre qu EPERM. Même résultat sur les trois cas du plan (succès, EPERM, ESRCH) ; plus strict ailleurs (un pid
  hors des entiers 32 bits fait lever `process.kill` : refus, jamais un retrait). M-SW10 reste non constructible sur cet hôte (un utilisateur).
- **Nom** : `owner` (et non `ownerOf`), pour tenir la l.343 à 160 caractères.
- **Fenêtre de création** : entre l ouverture exclusive et l écriture de l enregistrement, le fichier est vide ; un lancement concurrent y lit
  `owner unreadable` et refuse (fail-closed), `--unlock` aussi.
- **Échappements** : trois lignes neuves ou retouchées de l éditeur (l.369, l.373, l.394) portent l échappement JS du saut de ligne, style du
  fichier (l.132, l.393, l.408) ; produit à l exécution par l applicateur (`String.fromCharCode(92)`), jamais transporté par heredoc ; aucune
  barre oblique inverse dans les lignes neuves du test (saut de ligne par `String.fromCharCode(10)`), ni dans ce journal.
- **Écriture des fichiers** : applicateur Node `tmp/apply.mjs` (sha256 `8bcce9b1…`) : paires ancien/neuf, chaque ancien texte présent
  EXACTEMENT une fois, sinon arrêt sans écrire ; fichiers de paires `tmp/pairs-*.txt` (sha256 rendus dans REPONSE).
- **Commits de gel jetables** dans `r25/` (§ 6) : hors worktree et hors `F:/Monark` ; contre-mesure sans commit égale.

## 8. Questions à l orchestrateur (fermées, recommandation jointe)

- **Q-SW-G1-1 (tueur périmé, hors périmètre)** : `apps/dojo/test/dojo-publish.test.ts:195` vise `dojo-publish.mjs:15` « import { pathToFileURL } » ;
  vrai au tronc `8950ab15`, faux depuis ENTRY-MAIN-LINK-1 (l.15 = `import { fileURLToPath } from "node:url";` dès `b94cd20e`, avant ce lot) :
  `killerProblem` le refuserait, T-8 n a plus de tueur valide. (a) l orchestrateur le réancre à l intégration (même ligne, `pathToFileURL`
  remplacé par `fileURLToPath` dans l avant et l après ; une ligne `// killer:` ne compte jamais au jugement F2P) ; (b) une correction de ce lot
  rouvre le périmètre fermé du plan (§ 4) ; (c) une correction d ENTRY-MAIN-LINK-1. **Recommandation : (a)**, 2 lignes R-25 ;
  `error_origin` proposé : G1 d ENTRY-MAIN-LINK-1 (tueurs du fichier non relus quand la l.15 a changé).
- **Q-SW-G1-2 (consultation formée, advisor indisponible)** : problème : quatre choix faits sans avis (forme de `running`, commits de gel
  jetables pour `r25()`, échappements de l éditeur, renvoi de Q-SW-G1-1) ; tentative : advisor intégré « rate-limited » vers 00:16Z ;
  options : (a) consultation routée vers l agent ADVISOR ; (b) jugement à l inspection finale. **Recommandation : (b)** (preuves au § 7).

## 9. Menaces, tuyaux, items (plan § 9 à § 11)

- **TB-13 et TB-23** : neutralisés par construction pour tout lancement par la CLI (T-SW1 : six enfants, chaque mode qui écrit et `--unlock`,
  refusés PENDANT la fenêtre de la VAE de A, là où le défaut a été mesuré ; FM-3.3 couvert).
- **TB-SW1** (lancement tué) : T-SW2, avant et après le point d engagement : refus nommé `not running`, `--unlock`, reprise sans perte ni
  doublon. **TB-SW4** (enregistrement déchiré) : T-SW2, refus `owner unreadable`. **TB-SW5** (verrou servi) : T-SW1. **FM-1.1** (prise dans
  le `try` gardé) : `locked` l.356-359, M-SW3. TB-SW2, TB-SW3, TB-SW6, TB-SW7, TB-SW8 : résiduels du plan, inchangés.
- **Tuyaux** : TU-SW et TU-SW-U composés en test (processus CLI réels, vrai verrou, vrais écrivains de PR-2, vrai vérificateur) ; servis à A-8
  puis A-10 ; TU-SW-U « à brancher » jusqu à la consigne STOP du RUNBOOK (Q-SW-3 (a)). TU-1c inchangé (T-9 vert, corps intouché).
- **Items routés du plan** (DOJO-PUBLISH-LOCK-AUTORECOVER-1, DOJO-PUBLISH-LOCK-API-1, consigne au G0 de PR-3a-2, DOJO-KEYMODE-RETRY-1) :
  inchangés, propriétaire l orchestrateur ; aucun item neuf hors Q-SW-G1-1.

## 10. Conduite et provenance

- **git** : dans le worktree, lecture seule ; un premier relevé à 00:07Z (`rev-parse`, `status --porcelain`, `branch --show-current`, `log`)
  lancé SANS `--no-optional-locks` (rafraîchissement d index possible, aucun contenu changé), tous les suivants avec (`grep`, `diff`, `show`).
  Écritures git seulement dans les clones jetables `clone/` et `r25/` (`clone --no-local`, `checkout --detach` ; `r25/` : `add`, deux commits
  de gel locaux). Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`, aucun `git write-tree` ; rien committé dans le dépôt (R-20).
- **Hôte** : verrou `F:/tmp/oracle-lock` absent avant chaque passage de test ; C-V-4 : 10 `node.exe`, 13 832 à 15 312 Mo de mémoire libre,
  29 556 Mo de mémoire virtuelle libre au moins ; aucun oracle, aucun harnais de mutants, aucun `--help`.
- **Réseau et clés** : aucun réseau, aucun outil de recherche distant ; clés Ed25519 générées par les tests sous TEMP ; rien sur C:.
- **Sources** : chaque affirmation cite une pièce du dépôt ou une mesure de ce G1 ; aucun chiffre de seconde main. Limite déclarée : le
  statut que rend `spawnSync` sous POSIX pour un enfant tué n est ni mesuré ici ni lisible hors réseau (`child_process.d.ts` ne le décrit
  pas). T-SW2 n en dépend pas : il exige `status !== 0` (win32 : 1, mesuré) ET le verrou présent ET la chronologie à n ou n + 1 ; un enfant
  allé à son terme aurait relâché son verrou, donc serait vu. L inspection finale le rejoue en CI.

| Date | Objet | Modèle | Effort | Contexte | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-10-01 | G1, 4 fichiers et ce journal, base `b94cd20e` | `claude-opus-5-5` | max | mission `199b606e…` (§ 1) | implémenteur | inspection | à venir |

## 11. Fichiers livrés (sha256 des octets ; celui de ce journal dans `F:/tmp/dojo/singlewriter-deliver/DELIVERED.sha256`)

| Fichier | sha256 |
|---|---|
| `apps/dojo/scripts/dojo-publish.mjs` | `503aff6fcdea4b996f059e8569e68b9e3d317a55bf1fef3053dafc569c753281` |
| `apps/dojo/scripts/dojo-publish.d.mts` | `107166dbf4393cde3f43e17340e872d1cb40b4bde4f1ee3a8a9e042ab785a86d` |
| `test/dojo-publish-e2e.test.ts` | `8f1eb349977f79e2ab37fe106977e878f248cacf23e0bb61e19bbc420be4e539` |
| `test/dojo-entry-link.test.ts` | `33307507dd74d66541ecde5ae4939f6f79c43951139a5336b9d8c24d1f6d56f4` |
| `docs/G1-lot-singlewriter.md` | ce journal |
