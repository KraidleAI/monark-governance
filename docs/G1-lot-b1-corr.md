# claude-opus-5-5

# Journal du lot B1-CORR (correction du bloquant B-1 de l'inspection de la partie 1, C-1 à C-4, Q-6, Q-8, N-6)

- **Modèle résolu** : `claude-opus-5-5`, effort `max`, instance fraîche (R-1). Rôle : correcteur (`corr`). Date : 2026-10-01 (`date -u`).
- **Worktree** : `F:/Monark-wt-b1-corr`, branche `lot/b1-corr`, base = HEAD `1f23825455c52c841323352ee0ca16017ffa4b04` (arbre propre à 02:13:51Z).
- **Mission** : `F:/tmp/dojo/mission-corr-b1.md`, sha256 `0289a25be8ab45e744954692788dfc51dbce4b0b44beff4b6970d0d8f36ad2fd`, recalculé AVANT lecture
  (2026-10-01T02:13Z), égal au reçu `F:/tmp/dojo/mission-corr-b1.recu.json` (verdict vert, 2026-10-01T02:13:29Z).
- **Outils**, sha256 recalculés égaux à la mission (tronc et worktree) : `lint.mjs` `4d1383c8`, `launch.mjs` `fb6c277f`, `oracle/run.mjs` `f22b9045`,
  `oracle/r25.mjs` `4d0544df`, `red-proof.mjs` `6579b550`, `REGLES-MISSION.md` `64700025` (préfixes de 8).
- **Entrées**, sha256 à la base : rapport G2 `F:/tmp/dojo/insp1/g2-publish/RAPPORT.md` `8d53c215` ; `docs/ETAT.md` du tronc `F:/Monark` (`ee5d1758`)
  `0ef7fff4` (la décision B-1, section « Choix de travail actuels », premier point, n'est que dans le tronc : le worktree porte la version de
  `1f238254`, sans elle) ; `dojo-publish.mjs` `6f4f4c05` ; `dojo-publish.d.mts` `3b94d83d` ; `scripts/dojo-deploy.mjs` `04db3116` ;
  `apps/dojo/test/dojo-publish.test.ts` `a229fb4a` ; `test/dojo-publish-e2e.test.ts` `9c8f81f4` ; `test/dojo-publish-deploy.test.ts` `4f30d9fa` ;
  `docs/RUNBOOK-dojo.md` `5f70535a` ; `collect.ts` `afd31de8` ; `history-build.ts` `e42db6a8` ; `history-collect.ts` `53445d2d` ; `dojo-verify.mjs` `7b707cbb`.
- **Aucun commit** (R-20) ; aucun git écrivant dans le worktree ni dans `F:/Monark`, hormis le rafraîchissement opportuniste de l'index du
  worktree par mon premier `git status` (02:13:51Z, écart consigné au §8) ; aucun `GIT_DIR` ni `GIT_WORK_TREE` ; aucun `--write-tree`.

## 1. Lecture et compte (écrit AVANT tout code)

Lus en entier, dans l'ordre de la mission : `docs/ETAT.md` (worktree, puis tronc) ; le rapport G2 (B-1, C-1 à C-4, N-1 à N-10, Q-6, Q-7, Q-8) ;
`dojo-publish.mjs` et `.d.mts` ; `history-build.ts`, `history-collect.ts` ; `collect.ts` ; `dojo-verify.mjs` ; les trois fichiers de tests ;
`scripts/dojo-deploy.mjs` ; `docs/RUNBOOK-dojo.md` (en entier) ; `F:/Monark/scripts/red-proof.mjs`. Lus en plus pour juger : `layout.ts`,
`bundle.ts:86-104`, `dojo-chain.mjs:85-170`, `dojo-core.mjs:442-471`, `deploy/monark-dojo-collect.timer`, `deploy/monark-dojo-publish.service`,
`apps/dojo/test/helpers/collect-chain.ts`, `dojo-fixture.ts`, `test/dojo-collect-deploy.test.ts` (épingles du RUNBOOK), la sonde et le correctif
de C-1 du G2 (`fix-takelock.patch` `2d590037`), le journal G1 de VERIFY-NONFINITE (forme).

### 1.1 Le fait d = R + 2, établi sur le code

R = le dernier jour de répétition clos avant A-9 (1) (`--first-read` du paquet provisoire) ; S = le jour UTC du démarrage A-9 (6) ; d = le premier
jour LU sous l'ancre réelle (le `--first-read` du paquet final).

- Un jour n'est planifié AVEC balise qu'à un pas antérieur à T_d + 900 s : `collect.ts:186` (`if (now(c) < T + O)`, O = `read_offset_s` = 900,
  `dojo-methods.ts:34`) ; sinon `plan` écrit le jour abstenu sans aucun appel (`collect.ts:201-202` : `beacon` null, `instants` vides,
  `beacon_unavailable`). Les pas de la minuterie sont 00:00, 00:05, 00:10, ... UTC (`deploy/monark-dojo-collect.timer:13`, `AccuracySec=1s` l.16) :
  seuls 00:00, 00:05 et 00:10 précèdent 00:15.
- Chaque pas planifie AUJOURD'HUI s'il suit le jour d'ancre (`collect.ts:271`) ; le jour d'ancre n'est jamais ouvert (`:263`, `:181`).
- Un jour sans lecture ne peut être `--first-read` : `history-collect.ts:153-156` (`readDayLayout` puis `firstRead`, refus `inputs_mismatch`) ;
  `history-build.ts:47-50` (aucun relevé, ou aucun à deux énumérations : arrêt).
- Un jour abstenu reporte son Eve telle quelle (`bundle.ts:98-99` : `addresses` null ; `layout.ts:69` : `nextEve` rend l'Eve reçue) ; sa clôture
  vient au premier pas à ou après T_d + 86 400 s (`collect.ts:111`, `endOf`), puis le même pas planifie le lendemain avec balise.
- R se clôt au premier pas à ou après max t_i + 600 s (`collect.ts:111`, `:269`), avec t_i dans [T_R + 900, T_R + 86 400) (`dojo-core.mjs:465-469`) :
  au plus tard au pas de 00:10 UTC de R + 1, à une heure tirée par la balise et la graine de R, donc inconnue d'avance.
- L'Eve doit aller au jour que le collecteur OUVRE (S, ou le lendemain du jour d'ancre) : sinon ce jour est ouvert sans Eve, `close` refuse
  `eve_missing` (`collect.ts:239`) et la marche de `tick` s'arrête sur lui à chaque pas (`:269`, `break`) : le jour suivant n'est jamais clos.

Sonde rejouable (le vrai `collect.ts` du clone de base, chaîne simulée des tests, aucune socket) : `F:/tmp/dojo/b1corr/probe/probe-d.mjs`
sha256 `9266f6dd808970093018054c05ec09f04169753b853ba8e361049b3653f645b4`, `node probe-d.mjs F:/tmp/dojo/b1corr/base` (TEMP sous `b1corr/tmp`),
Node v24.15.0, 2026-10-01T02:41:23Z ; sortie `probe-d.out.txt` sha256 `c45315e3efaeaccc87a12805d7b35a6221f12882beb79463852a37382f267cb9`, stderr vide :

- (a) démarrage le jour S à 14:00 UTC, Eve en S : 0 appel, `plan` de S abstenu (`beacon_unavailable`, 0 instant) ; au pas de 00:00 de S + 1 : S clos
  `abstained`, Eve de S + 1 = l'Eve déposée (octets égaux), S + 1 planifié avec balise (4 instants), première lecture de S + 1 écrite : d = S + 1 ;
- (b) démarrage le jour S à 00:10 UTC : S planifié avec balise (2 appels, 4 instants) : d = S ;
- (c) démarrage le jour d'ancre à 14:00, Eve au lendemain : 0 appel ; à 00:00 du lendemain, planifié avec balise : d = S + 1 ;
- (d) démarrage le jour S à 14:00, Eve en S + 1 (au lieu de S) : `eve_missing` à 00:00 de S + 1 et à 00:15 de S + 2 ; ni S ni S + 1 clos.

Conséquence : le démarrage (A-9 (6)) vient après la clôture de R (jusqu'à 00:10 UTC de R + 1), la copie de R et la course provisoire de
l'historique ; il a donc lieu le jour R + 1 après 00:15 UTC, et **d = R + 2** (S = R + 1 ouvert abstenu porte l'Eve provisoire jusqu'à R + 2).
d = R + 1 exigerait un démarrage avant 00:15 UTC de R + 1, ou le jour R lui-même après une clôture précoce de R (instants tirés) : le code le
permet mais l'ordre des actes ne le garantit pas ; le RUNBOOK écrit d = R + 2, démarrage le jour R + 1 à 00:15 UTC ou après.

### 1.2 Compte ascendant par fichier (insertions + suppressions prévues, avant tout code)

Règle : une ligne modifiée compte 2 (une insertion, une suppression), comme `git diff --shortstat` que lit `r25.mjs`. R-25 exclut `docs/**/*.md`
(`.github/workflows/ci.yml:79`) : le RUNBOOK et ce journal sont comptés à part.

- `apps/dojo/scripts/dojo-publish.mjs`, **≈ 106** : en-tête l.8 ; import coupé (l.12-13) et ligne vide l.24 retirée (aucun numéro ≥ 25 ne
  bouge) ; deux codes l.30 ; appel de l'écart l.202 ; lecture partagée l.205 ; série et pile partagées l.212-220 (même nombre de lignes) ;
  Q-6 l.359 ; `--history` l.369-385 ; C-1 l.402-405 ; CLI l.426-459 ; six fonctions hissées après l'entrée (l.473), ≈ 50 lignes.
- `apps/dojo/scripts/dojo-publish.d.mts`, **≈ 10** : `inboxDir` de `publishHistory`, doc de `DayResult`.
- `scripts/dojo-deploy.mjs`, **4** : N-6, l.45-46 en place (tueurs `:52`, `:57` inchangés).
- `apps/dojo/test/dojo-publish.test.ts`, **≈ 62** : deux tests `--history` (boîte, horloge, Q-6), Q-8 et codes neufs, deux tests neufs
  (pré-contrôle, jour manquant), deux tueurs réancrés (`:15`, `:205`).
- `test/dojo-publish-e2e.test.ts`, **≈ 50** : `world()` (A + 1 clos, `--history --inbox` à 00:20 de A + 2), quatre tests adaptés, T-SW1
  (`--inbox`), un test neuf (C-1).
- `test/dojo-publish-deploy.test.ts`, **≈ 60** : T-A7 par le vrai `--history` (argv du bloc 18 (iv)), aide `packetAt`, imports, test neuf
  (C-3), T-A11, trois tueurs du RUNBOOK réancrés.
- **Total R-25 (code et tests) ≈ 292**, borne de la mission 1 150 (porte CI 1 205).
- Hors R-25 : `docs/RUNBOOK-dojo.md` ≈ 160 (§7 (5), §10, §17, §18 (i) à (iv), §19, « Never ») ; ce journal ≈ 250.

### 1.3 Plan (arrêté avant le code)

- **Lignes ancrées** : 26 lignes `// killer:` visent des numéros de `dojo-publish.mjs`. Règle du lot : modifications EN PLACE, nombre de lignes
  conservé par région, fonctions neuves en déclarations `function` après la ligne d'entrée (hissées ; aucune `const` neuve après l'entrée).
  L'import de `readdirSync` (Q-6 et l'écart listent un répertoire) coupe la ligne 12 (153 + 13 > 160) : la ligne vide 24 est retirée, si bien
  que seules les lignes 13 à 23 descendent d'un cran ; tueur réancré : `:15` (`import { fileURLToPath }`). Le tueur `:205` (`refuse(e.code`)
  suit la lecture extraite.
- **B-1, code** : `--history` prend `--inbox` (obligatoire : sans lui, pas de pré-contrôle) ; `MODES` met `--history` en tête et la condition
  `modes.length !== 1` devient `mode === undefined` (la clause des clés admises refuse déjà tout autre drapeau). Avant `commitLine`, après la VAE
  (qui valide `history_last_day` comme vrai jour, `dojo-chain.mjs:115-117`) : `first_read_day` = `history_last_day` + 1, sinon
  `history_bundle_malformed` (Q-7) ; d clos dans la boîte et fini à l'horloge, sinon `first_read_day_open` (code neuf) ; d lu par la lecture
  partagée (codes du lecteur passés tels quels) ; la série construite du fichier par la fonction partagée de `--inbox`, puis la pile contrôlée
  par la fonction partagée (`eve_mismatch`). Trois extractions, jamais de copie : `readDay` (l.205), `putDays` (l.213-215), `evePile` (l.217-220).
- **B-1, éditeur** : `publishDay` refuse `day_missing` (code neuf) quand d n'est pas clos alors qu'un jour plus tard l'est (liste de la boîte,
  `existsSync` d'abord : une boîte absente reste `nothing_to_publish`).
- **C-1** : un enregistrement non écrit, ou un répertoire non synchronisé, retire le verrou de ce lancement (créé par O_EXCL : le sien).
- **Q-6 (b)** : tout fichier de `publish/` hors des quatre chemins : `history_bundle_malformed`. **Q-8 (b)** : sites non littéraux = `["e.code"]`.
- **Tests** : tout test existant modifié porte une assertion rouge à la base (red-proof refuse un test vert à la base) ; T-A1 n'est pas touché
  (C-3 en test neuf, tueur sur une ligne du bloc 18 (iv)).
- **RUNBOOK** : 18 (ii) copie le jour clos entier sans `evidence/` (le `--first-read` est lu par `readDayLayout`, jamais `readings/` seul :
  défaut trouvé, déclaré aux §4 et §8) ; deux courses, deux `--state` neufs (`history-collect.ts:207` épingle `--first-read` en première ligne, `:158`
  refuse un état complet) ; propriétés des jobs : `UnsetEnvironment=` en UN argument quoté (`"$U"`, `--property=`) car `$S` se découpe aux
  espaces ; la lecture sur l'hôte de cette forme (systemd 259) reste due avant A-8 (aucun réseau ici).

Écart au compte (mesuré, §7) : 320 lignes contre ≈ 292 prévues (× 1,10) ; écart surtout dans les tests (T-A7 et le test neuf C-3).

## 2. Code (écrit après le §1)

- `apps/dojo/scripts/dojo-publish.mjs`, sha256 `765959adb0fe0b3b5c6b7725809f21da31b863ed76e99f677fa999720619f053` (473 → 525 lignes, +82 −30) :
  l.8 (en-tête, `--history <packet> --inbox <bundles>`) ; l.12-13 (import coupé, `readdirSync`) et la ligne vide 24 retirée ; l.30 (deux codes) ;
  l.202 (`gap`) ; l.204-205 (`readDay`) ; l.213-215 (`putDays`) ; l.217-220 (`evePile`) ; l.359 (`strays`, Q-6) ; l.369-373 (doc et
  signature de `publishHistory`) ; l.383-385 (`objs`, puis `firstReadDay` juste avant `commitLine`) ; l.402-405 (C-1) ; l.426-429 (USAGE,
  `MODES`) ; l.442 (`mode === undefined`) ; l.459 (`inboxDir`) ; l.475-525, six déclarations hissées : `readDay` (480), `putDays` (485),
  `evePile` (496), `firstReadDay` (505), `gap` (513), `strays` (521). Hors des lignes 13 à 23, descendues d'un cran par l'import coupé
  (octets inchangés), toute autre ligne garde son numéro et ses octets (tueurs : §3).
- `apps/dojo/scripts/dojo-publish.d.mts`, sha256 `16d688fe791b495cd63e590ff05a84051d066141397c64b2c26cdb32590584d5` (+8 −5) : `inboxDir: string`
  de `publishHistory`, doc de `DayResult` (`day_missing`).
- `scripts/dojo-deploy.mjs`, sha256 `fb3047c0f72f086cf07fbbf7694100bad43cd63d5ce14adbacefe46a03daa2e9` (+2 −2) : N-6, l.45-46 en place.
- Garde d'octets des trois fichiers : 0 TAB, 0 octet de contrôle, aucune ligne > 160 ; barres obliques inverses : 28 dans l'éditeur, comme
  à la base (aucune ajoutée).
- Sémantique : `firstReadDay` passe APRÈS la VAE et le contrôle de `eve.json`, AVANT `commitLine` : tout refus neuf laisse l'état intact.
  Ordre : `first_read_day` du manifeste (Q-7, `history_bundle_malformed`), d clos et fini (`first_read_day_open`), lecture de d (codes du
  lecteur), pile (`eve_mismatch`, même fonction et même détail que `--inbox`). `gap` ne lit la boîte que si d n'est pas clos ; il ne voit
  qu'un jour plus tard CLOS (un jour plus tard encore ouvert n'est pas un écart). C-1 : le verrou est retiré si l'écriture, la
  synchronisation du fichier, ou celle de son répertoire échoue ; il appartient à ce lancement (O_EXCL), `unlinkSync` comme la relâche.

## 3. Tests (libellés en anglais ; tueurs au format de `parseKiller`, 50 lignes valides sur les quatre fichiers, `tools/killcheck.mjs`)

Neufs (4) :
1. `dojo_publish_history_waits_for_the_first_day_read` (`apps/dojo/test/dojo-publish.test.ts:707`) : d absent, d clos mais pas fini à
   l'horloge (`first_read_day_open` ×2) ; d sans ADDR.A, qui tient des lots au dernier jour (`eve_mismatch`, détail exact de `--inbox`) ;
   `first_read_day` du manifeste à d + 1 (`history_bundle_malformed`, détail `publish/manifest.json: first_read_day`) ; un fichier étranger
   sous `publish/` du jour (`layout_stray_file`, passé tel quel) ; état intact à l'octet ; puis la ligne, puis le premier `snapshot` = d.
   Tueur `dojo-publish.mjs:508 CONST "t < (d + 1) * DAY_MS" -> "t < d * DAY_MS"`.
2. `dojo_publish_names_a_missing_day` (`:730`) : d + 1 clos et d absent, puis d ouvert : `day_missing` (détail exact), rien d'écrit ;
   boîte sans jour plus tard clos, ou absente : `nothing_to_publish` comme avant. Tueur `:517 CONST "later.length > 0" -> "later.length > 1"`.
3. `dojo_publish_lock_record_not_written_leaves_no_lock` (`test/dojo-publish-e2e.test.ts:253`) : `DURABLE_FS.writeSync` puis `fsyncDir`
   lèvent ENOSPC à la prise du verrou (`runCli` en processus) : sortie 1, `fatal: ENOSPC`, aucun `publish.lock`, rien d'écrit ; puis
   `--unlock` : `not_locked` ; puis `--inbox` atteint l'éditeur (`history_missing` sur un état vide). Tueur `:404 CONST "if (!recorded)"`.
4. `dojo_runbook_jobs_carry_the_unit_properties` (`test/dojo-publish-deploy.test.ts:441`, C-3) : les trois blocs `systemd-run` (A-8 (2),
   18 (iv), `--unlock`), leurs propriétés fermées et égales à l'unité ; `UnsetEnvironment=` de l'unité sur les deux jobs qui chargent la
   clé, en UN argument `"$U"` ; groupe et `ReadOnlyPaths=` pour 18 (iv), dont le `--inbox` est le chemin lu en lecture seule par l'unité.
   Tueur `docs/RUNBOOK-dojo.md:744 CONST "-p SupplementaryGroups=dojo-handoff" -> "-p SupplementaryGroups=dojo-collect"`.

Modifiés, chacun rouge à la base par une assertion (red-proof, §6) :
- `dojo_publish_history_before_the_first_snapshot` : `inboxDir`, et `first_read_day_open` avant la clôture de d ; `hclock` à 00:20 de A + 2.
- `dojo_publish_history_reads_the_packet_with_its_check` : d clos dans la boîte ; Q-6, deux cas (`publish/extra.json`,
  `publish/history/extra.jsonl`) : `history_bundle_malformed`.
- `dojo_publish_refusals_list_is_every_code_raised` : Q-8 (b), les sites non littéraux valent `["e.code"]` ; les deux codes neufs listés.
- `dojo_publish_rotation_and_revocation_follow_bell` : deux cas d'usage (`--history` sans `--inbox` ; `--history --inbox --anchor`).
- e2e : `world()` clôt A + 1 avec l'Eve du paquet puis lance le vrai `--history --inbox` à 00:20 de A + 2 ; les quatre tests suivent
  (T-SW1 : l'enfant `--history` porte `--inbox`).
- `dojo_units_compose_collect_to_publish_to_verify` (T-A7, C-2) : la ligne `history` écrite à la main disparaît ; le paquet du vrai
  écrivain (aide `packetAt`, l.241, doublon déclaré de `packet()` de l'e2e) est déposé au chemin du RUNBOOK, puis l'argv du job de 18 (iv),
  lu dans le RUNBOOK, tourne dans l'enfant de l'unité : à 00:10 de D1 + 1 (D1 fini, pas clos) `first_read_day_open`, rien d'écrit ; après
  la clôture, la ligne ; puis le créneau de 00:30 publie D1 et le vérificateur public relit l'arbre.
- `dojo_runbook_stops_before_the_stamp_and_on_refusals` (T-A11) : les deux lignes neuves du §19 et leur acte.
- Tueurs réancrés (lignes `// killer:` seules, jamais jugées) : `dojo-publish.mjs:15` → `:16`, `:205` → `:481` ; `RUNBOOK:418` → `:436`,
  `:606` → `:629`, `:721` → `:782`. T-A1 n'est pas touché (il compte toujours 8 `-p` au job d'A-8 ; `"$U"` est un `--property=`).

## 4. RUNBOOK (`docs/RUNBOOK-dojo.md`, sha256 `2805b205896c58e142676bbe28fb1f4005b7becfbb57c18028187bf0e729bd49`, 794 → 859 lignes)

- §7 (5) à (7) : l'Eve du paquet PROVISOIRE au jour o que le collecteur relancé ouvre ; démarrage le jour R + 1 à 00:15 UTC ou après ; le
  fait d = R + 2 et sa raison dans le code ; le contrôle du plan de o (`beacon` null, une commande) ; plan avec balise ⇒ d = o, au JOURNAL.
- §10 : l'ordre sans « jour zéro = répétition » ; deux paquets, le prix (une course de plus) ; la phrase épinglée par T-A11 est gardée.
- §16 (A-8 (2)) : `"$U"` ; bloquant FAITS-SYSTEMD-RUN-UNSETENV-1 (lecture sur l'hôte, due).
- §17 : l'attendu (`history_missing`, puis d publié au premier créneau après la ligne ; `day_missing` est un STOP).
- §18 réécrit : (i) Eve de o par le paquet provisoire ; (ii) copie d'un jour clos ENTIER (`eve.json`, `publish/`, `readings/`), défaut
  trouvé : l'ancien (ii) ne copiait que `readings/`, que `--first-read` refuse (`readDayLayout` exige `publish/SHA256SUMS`) ; (iii) le
  paquet final, `PACKET-EXISTS` nommé au rejeu ou à une copie coupée, et l'acte écrit qui la retire (C-4) ; (iv) le job (groupe,
  `ReadOnlyPaths=`, `"$U"`, `--inbox`), l'attendu, les trois refus du pré-contrôle et l'acte de chacun, le résidu déclaré.
- §19 : `first_read_day_open`, `day_missing` (neuves) ; `eve_mismatch`, `history_bundle_malformed` (amendées). « Never » : l'exception du
  paquet, et la ligne `history` avant la clôture de d ou tirée du paquet provisoire.
- Garde : les 25 lignes > 160 du RUNBOOK sont celles de la base (§1 à §9, N-8), aucune neuve ; barres obliques inverses : 15, comme à la base.

## 5. Constat → fichier → test

| Constat | Fichier (lignes) | Test |
|---|---|---|
| B-1, `first_read_day` ≠ dernier jour + 1 (Q-7) | `dojo-publish.mjs:507` | `history_waits_for_the_first_day_read` |
| B-1, d non clos ou non fini | `dojo-publish.mjs:508` | idem ; T-A7 (job de 18 (iv) à 00:10) ; `history_before_the_first_snapshot` |
| B-1, d sans une adresse détentrice | `:509`, `evePile` `:496-501` (partagée avec `:220`) | `history_waits_for_the_first_day_read` |
| B-1, `--history` exige `--inbox` | `:426-429`, `:442`, `:459` | `rotation_and_revocation_follow_bell` (usage) ; e2e |
| B-1, éditeur, jour attendu manquant | `:202`, `gap` `:513-518` | `names_a_missing_day` |
| C-1, verrou sans enregistrement | `:402-405` | `lock_record_not_written_leaves_no_lock` (e2e) |
| C-2, T-A7 par le vrai `--history` | `test/dojo-publish-deploy.test.ts` (T-A7, `packetAt`) | T-A7 |
| C-3, trois jobs, `UnsetEnvironment=`, boîte | RUNBOOK §16 (2), §18 (iv), §19 | `runbook_jobs_carry_the_unit_properties` |
| C-4, 18 (iii) rejoué ou coupé | RUNBOOK §18 (iii), « Never » | (texte ; tâche 4) |
| Q-6 (b), fichier étranger du paquet | `:359`, `strays` `:521-525` | `history_reads_the_packet_with_its_check` |
| Q-8 (b), sites non littéraux | test seul | `refusals_list_is_every_code_raised` |
| N-6, programmes de l'arbre | `scripts/dojo-deploy.mjs:45-46` | (commentaire) |
| RUNBOOK §7 (5), §10, §17, §18, §19 | `docs/RUNBOOK-dojo.md` | T-A11, T-A7, C-3 ; `dojo_runbook_counts_only_after_the_block` |

## 6. Exécution (clones `--no-local` sous `F:/tmp/dojo/b1corr/`, TEMP `F:/tmp/dojo/b1corr/tmp`, verrou d'hôte absent à chaque lancement)

- Clones : `base` (1f238254, propre ; sondes) et `gel` (1f238254 plus les huit fichiers du lot, copiés et comparés au worktree par sha256 :
  8 égaux) ; `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark`, 0 échec). C-V-4 avant les tests : 8 `node.exe`, 13 243 148 Ko de
  mémoire physique et 31 399 524 Ko de mémoire virtuelle libres (02:57:33Z).
- Outils du lot, hors dépôt : `tools/rep.mjs` (remplacement exact, une occurrence ; sha256 `6ab9063d`), `tools/killcheck.mjs` (lignes
  `// killer:` par `parseKiller` du tronc et les règles de `killerProblem` ; sha256 `e7de26be`) : 50 tueurs, 0 invalide
  (`runs/killcheck-final.txt` `2f720dbc`).
- Tests du Dōjō sur `gel` final (les 22 fichiers `apps/dojo/test/*.test.ts` et `test/dojo-*.test.ts` : éditeur, vérificateur, déploiement,
  collecte, historique, page) : 237, dont 235 verts, 0 rouge, 2 ignorés connus (SIGTERM réel sous win32 ; TU-K jusqu'à A-4p),
  `runs/gel-dojo-final.tap` sha256 `703e1dde6975396464ef7ff5f7ac5c35ea894280c5b62583b4d65be885c07f4f` (03:08:24Z).
- `red-proof.mjs` du tronc, `--draw 20 --seed 20261001`, 2026-10-01T03:09:38Z : `F:/tmp/dojo/b1corr/red-proof-2/RED-PROOF.json` sha256
  `82cddc7db1e4f81a230380863e2df02cb7855b01fa110cf9abda50965044fa42` (digest du gel `dda3f596`) : 14 jugés, 14 F2P, 14 tueurs tirés sur 14
  admis, 14 tués par `ERR_ASSERTION` ; sortie 0. Premier passage (avant les deux cas d'usage) : `red-proof-1`, 13 sur 13, sortie 0.
- Sondes rejouées : `probe-d.mjs` (§1.1) ; la sonde de C-1 du G2 (`probe-lock-enospc-v2.mjs` `c0623a40`) sur `gel` : sortie
  `probe/c1-gel.out.txt` sha256 `caadb3c017ed37ccb5aa6ad242049eaff006d9a255a39749cfda5087386adc61`, octet pour octet celle que le G2 mesurait
  avec son correctif (`probe-v2-fixed.out.txt`) : `fatal: ENOSPC` sans verrou, `not_locked`, puis `history_missing`.
- Oracle du tronc, `--role corr --key b1-corr`, suite complète, sur `gel` (ce journal arrêté au §5), 03:09:59Z-03:18:15Z :
  `F:/tmp/oracle-results/1f23825455c52c841323352ee0ca16017ffa4b04-52d3af148c4b0a6e-corr-20261001T030959Z-164436.json` sha256
  `187670baeabdd8f7ad9aab72838dbcd8ff3b33916e1ebdda39f8ed6f175600be` : portes statiques à 0, R-25 vert, tests 1 838, dont 1 832 verts, 5
  ignorés connus et **1 rouge, préexistant à la base** (Q-5) ; sortie 1 de ce seul fait. Le rejeu des portes sur l'arbre final, ce journal
  achevé, est cité dans `REPONSE.md`.
- Jonctions `node_modules` des deux clones retirées à la fin par `rm-nm.ps1` (« removed » ×2, remises le temps du dernier oracle puis
  retirées) ; `F:/Monark/node_modules` : 220 entrées et 11 `@monark` avant et après (jamais modifié).

## 7. R-25 et portes

- R-25 par `r25.mjs` (la fonction exportée, porte `r25` de l'oracle ci-dessus, `02-r25.log`) : **243 insertions, 77 suppressions, 320 lignes**
  (borne de la mission 1 150, porte CI 1 205) ; contenu 0 (borne 8 000). Par fichier (`git diff --numstat`) : `dojo-publish.mjs` +82 −30,
  `.d.mts` +8 −5, `dojo-deploy.mjs` +2 −2, `dojo-publish.test.ts` +55 −10, e2e +38 −13, déploiement +58 −17 (RUNBOOK +124 −59 et ce journal :
  hors R-25, `docs/**/*.md`).
- Portes statiques (même oracle) : `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `export:check`, `gate:vocab`, `lint-model-pinning` à 0.
  Un premier passage `--static-only` (03:00:00Z, record `...-bc3a69a6945e0956-corr-20261001T030000Z-415912.json` sha256 `0b6f62dc`) était
  rouge sur `lang:gate` (« pendant », mot français, dans un commentaire neuf de l'éditeur) : remplacé par « counterpart », vert depuis.

## 8. Q-n (aucune dette nue : chaque point est une décision demandée, une demande formée ou un item avec sa construction)

- **Q-1, d = R + 1** : le code le permet si le démarrage précède 00:15 UTC de R + 1, ou a lieu le jour R après une clôture précoce de R
  (instants tirés) ; le RUNBOOK fixe d = R + 2 (démarrage le jour R + 1 à 00:15 ou après) et note la conduite si le plan de o porte une
  balise (d = o). Décision demandée seulement si l'orchestrateur veut la variante opportuniste (un jour de gagné, ordre moins déterministe).
- **Q-2, demande formée FAITS-SYSTEMD-RUN-UNSETENV-1** (bloquant écrit au §16) : lire sur l'hôte, par SSH, `man systemd-run` (option
  `-p`/`--property=`, « same format as unit files ») et `man systemd.exec` (`UnsetEnvironment=`, liste séparée par des blancs) de systemd 259,
  puis consigner au JOURNAL que `"--property=UnsetEnvironment=<13 noms>"` en UN argument est admis par `systemd-run`. Non fait ici : aucun
  réseau ni accès à l'hôte (cadre de la mission). Tentative : la forme est celle de la ligne de l'unité, déjà acceptée par `daemon-reload` à
  A-5p ; un refus reste fermé (le job échoue avant de tourner, rien d'écrit). Usage : A-8 (2) et 18 (iv).
- **Q-3, `InaccessiblePaths=` de l'unité absent du job de 18 (iv)** : la décision nomme le groupe et `ReadOnlyPaths=` ; l'utilisateur `dojo`
  n'a de toute façon aucun droit sur ces chemins (0600 root, 0640 `dojo-collect`, `ledger/` du collecteur). Construction pour l'égalité
  exacte avec l'unité : un second argument quoté `"--property=InaccessiblePaths=<la liste de l'unité>"` (même forme que `"$U"`) et la
  liste attendue du test C-3 étendue (≈ 4 lignes). Décision demandée.
- **Q-4, portée du pré-contrôle (item PAROXYSME proposé, B1-PRECHECK-FULL-1)** : `--history` vérifie les trois conditions de la décision ;
  le premier `snapshot` de d peut encore être refusé après la ligne irréversible pour une autre raison du jour (`bundle_day_mismatch`,
  `bundle_anchor_mismatch`, `seed_outside_anchor_chain`, ou la VAE) : arrêt nommé, jamais une ligne fausse, mais d attendu à chaque créneau.
  Construction qui donne la garantie : calculer dans `--history` le `snapshot` candidat de d comme `publishDay` (fonction partagée, sans
  écrire), puis vérifier ENSEMBLE la ligne `history` et ce candidat par la VAE avant d'engager la ligne ; prix estimé 15 à 25 lignes et un
  test. Décision demandée.
- **Q-5, rouge préexistant à la base (item formé KITCHEN-NONFINITE-1)** : `site_names_no_kitchen` (`test/site-build-fleet.test.ts:1133`)
  refuse `apps/site/lib/dojo-served-load.ts:250` (« lot VERIFY-NONFINITE », vocabulaire de travail sur la vitrine), présent depuis `23dcb5aa`
  et rouge sur le clone de base seul (`runs/base-site-kitchen.tap` sha256 `a1f7fc47be7fae3cc00967544dbbe81dbc2840f188365fe55a4a9d5bf24dd58a`).
  Hors des fichiers de cette mission : non touché. Construction : retirer « lot VERIFY-NONFINITE, » du commentaire (garder
  BUILD-NONFINITE-1), une ligne. Déclencheur : avant le G7 de la partie 1 (tant qu'il reste, tout oracle complet de `page-v1` sort 1).
- **Q-6, double faute au verrou (item PAROXYSME proposé, DOJO-PUBLISH-LOCK-LINK-1)** : si l'écriture de l'enregistrement échoue ET que la
  fermeture ou le retrait échouent aussi, ou si le processus meurt entre la création exclusive et l'écriture (coupure, SIGKILL : TB-SW4), un
  verrou vide reste (`owner unreadable`, escalade). Construction qui supprime la fenêtre : écrire et synchroniser l'enregistrement dans
  `publish.lock.<pid>`, puis `linkSync` vers `publish.lock` (atomique, EEXIST si tenu), puis retirer le temporaire ; un verrou n'existe
  alors jamais sans son enregistrement complet. Décision demandée.
- **Q-7, ADR** : la ligne TU-1h d'ADR-DOJO-PR-3 dit « `readings/` du premier jour lu » ; le code exige le jour clos entier (§4). Amendement
  de documentation proposé (ligne datée de l'orchestrateur).
- **Q-8, écarts de méthode consignés** : (a) à 02:40Z, un heredoc (script `node` jetable corrigeant `probe-d.mjs`) portait des séquences
  « barre oblique inverse, n » ; le fichier produit en compte 0 (mesuré) ; (b) à 02:43Z, une commande `node -e` de contrôle (lecture seule du
  journal) portait la même séquence ; (c) un heredoc de ≈ 9 Ko a échoué au lexage du harnais (règle des 6 Ko), rien d'écrit (journal resté à 102 lignes,
  mesuré), réécrit en trois morceaux. Aucun fichier livré n'en dépend : barres obliques inverses ajoutées au lot, 0 (§2, §4).
- **Git** : aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree` ; écritures git seulement dans mes clones (`clone`) et dans ceux des
  outils du tronc (gel de l'oracle, clones de `red-proof`). Écart consigné : ma toute première commande (02:13:51Z) lisait le worktree par
  `git status --short` SANS `--no-optional-locks` ; l'index du worktree (`F:/Monark/.git/worktrees/Monark-wt-b1-corr/index`) porte depuis
  cette heure (mtime 02:13:51Z, relevé à 03:35Z) : rafraîchissement opportuniste du cache de l'index, aucun contenu indexé (rien n'est
  ajouté : `status --porcelain` ne montre que les fichiers du lot, non indexés, HEAD `1f238254`). Toutes les lectures suivantes sous
  `--no-optional-locks` ou `GIT_OPTIONAL_LOCKS=0` : l'index n'a plus bougé (même mtime à 03:35Z).

## 9. Suite de la mission (message de l'orchestrateur, 2026-10-01 vers 04:1x UTC) : plan écrit avant le code (04:1x UTC)

- Base de la suite : le worktree avancé par l'orchestrateur en avance rapide sur `35930dc8` (le lot réuni sur `lot/page-v1`, tueurs du
  RUNBOOK réancrés, commentaire de Q-5 corrigé) ; arbre propre à 04:08:25Z ; index du worktree daté de 04:08:07Z (l'avance rapide, avant ma
  première commande, lue sous `--no-optional-locks`). Les fichiers du lot y sont ceux de ma livraison, sauf le test de déploiement (trois
  tueurs réancrés de deux lignes) et le RUNBOOK (lot SMALL-CORR : deux lignes de plus avant le §13).
- Décisions reçues, sans action ici : Q-1 (d = R + 2 gardé), Q-2 (demande FAITS-SYSTEMD-RUN-UNSETENV-1 et son bloquant gardés), Q-7 (item
  noté), Q-9 (autre lot). À faire : Q-3, Q-4 (B1-PRECHECK-FULL-1), Q-6 (DOJO-PUBLISH-LOCK-LINK-1).
- **Q-3** : au job de 18 (iv), `I="--property=InaccessiblePaths=<les trois chemins de l'unité>"` et `"$I"` après `"$U"` ; le test C-3 lit
  désormais toute affectation `X="--property=K=V"` et ses suites `X="$X …"`, compare chaque valeur à celle de l'unité, et exige `"$U" "$I"`
  pour 18 (iv), `"$U"` seul pour A-8 (2), aucun pour `--unlock`.
- **Q-4** : `publishHistory` fait construire par `publishDay` lui-même, en mode « à blanc » (second argument interne `dry`), le `snapshot`
  candidat de d sur l'état engagé suivi de la ligne `history` non engagée, puis la VAE vérifie ensemble la ligne et ce candidat (et le
  fichier d'historique, en mémoire). En place dans `publishDay` : l.195 (l'état, par `stateOf`), l.214 (la série tirée du fichier du paquet),
  l.240 (retour avant tout ajout), l.276 (`checked` lit aussi `st.files`) ; l.239 inchangée (son tueur demeure). `firstReadDay` garde ses deux
  contrôles et appelle le mode à blanc ; il refuse si celui-ci ne rend pas son marqueur (fermé sur l'échec). Causes atteignables, un test et
  un tueur chacune : `day_not_after_anchor`, `bundle_day_mismatch`, `bundle_anchor_mismatch`, `seed_outside_anchor_chain` (chaîne, puis
  horizon), `line_refused` (VAE du candidat). Déjà couvertes : `eve_mismatch`, les refus du lecteur.
- **Q-6** : l'enregistrement est écrit et synchronisé dans `publish.lock.<pid>` (ouvert « w » : un pid réutilisé écrase un reste), puis
  `linkSync` vers `publish.lock` (atomique, EEXIST si tenu), puis le temporaire retiré, puis le répertoire synchronisé ; chaque échec ne
  laisse rien (le test C-1 l'exige). Test neuf : processus tué entre la création et l'écriture de l'enregistrement (`killAt("writeSync",
  "taken_at")`) : aucun `publish.lock`, le lancement suivant publie. Tueurs réancrés : celui de T-SW1 (« wx » n'existe plus) et celui de C-1.
- **Compte ascendant de la suite** (lignes R-25 contre `35930dc8`) : éditeur ≈ 52 ; `.d.mts` ≈ 4 ; test unitaire ≈ 45 (cinq tests) ; e2e
  ≈ 14 ; déploiement ≈ 16 ; total ≈ 131. Cumul du lot : 320 + la suite (borne 1 150).
- Ajout de l'orchestrateur reçu pendant le code (04:2x UTC), d'après la relecture G2 du lot (`F:/tmp/dojo/insp1/g2-publish/RAPPORT.md`, section
  « Delta B1-CORR », relue en entier ; sha256 `94bea336…` à 04:23Z) : la relecture lève B-1, C-1 à C-4, Q-6 à Q-8, N-5, N-6 et garde D2-1
  (ce Q-4). Deux notes à appliquer ici : **D2-4** (au RUNBOOK, d se lit sur le plan de o, R + 2 restant le cas attendu) et **D2-5** (le refus
  de `strays` nomme le chemin sous `publish/`). D2-6 (garde mécanique du retrait du paquet) n'est pas demandée : non faite (Q-14).

### 9.1 Code de la suite (écrit après le plan)

- `apps/dojo/scripts/dojo-publish.mjs`, sha256 `516ce36505bd2d9f21d3e71d0d060a2324a74ef074e58d65f4b650b68d3a914f` (525 → 542 lignes ; +40 −23
  contre `35930dc8`) : import (`linkSync` ; `relative`, `sep`) ; `publishDay` (l.193-195 : `dry`, `stateOf` ; l.214 : la série tirée du fichier
  du paquet en mode à blanc ; l.240 : retour `checked` avant tout ajout ; l.239 intacte) ; `checked` (l.276 : `st.files`) ; `publishHistory`
  (l.372, l.385 : `await firstReadDay(…)`) ; `takeLock` (l.398-407, même nombre de lignes) ; `firstReadDay` (l.505-511 : ses deux contrôles,
  puis `publishDay` à blanc, refus fermé si le marqueur manque) ; `strays` (l.521, l.525 : D2-5) ; neuves : `stateOf` (l.529),
  `lockByLink` (l.537). Les lignes 1 à 504 gardent leurs numéros. Barres obliques inverses : 28, comme à la base.
- `apps/dojo/scripts/dojo-publish.d.mts`, sha256 `c8410c0a5722ea8ce4628fd9e48a678c62e0a50bacbf73f5ecedfb7fa256728d` : doc de `publishHistory`.
- `docs/RUNBOOK-dojo.md`, sha256 `7949b10716fe07b1c05cd7afb9c23f8f8710a9aecca6c02cd9f826f573aa5a4c` (867 → 870 lignes) : §7 (6) (D2-4 : d lu sur le plan
  de o par `grep -c "beacon.:null"`, sans jamais imprimer d'instant ; R + 2 attendu) ; §10 (ordre) ; §18 (intro, D2-4 ; (iv) : `"$I"` et sa prose,
  le pré-contrôle complet et ses refus). Lignes > 160 : les 25 de la base, aucune neuve ; barres obliques inverses : 15.

### 9.2 Tests de la suite (6 neufs, 2 modifiés ; tueurs au format de `parseKiller`, 58 valides sur cinq fichiers)

- `apps/dojo/test/dojo-publish.test.ts` (sha256 `e33f87f0…`) : aide `refusedBeforeTheLine` (l.751 : `--history` sur d clos et fini, refus
  au détail exact de `--inbox`, état intact à l'octet) ; neufs, un par cause atteignable : `dojo_publish_history_checks_the_day_after_the_anchor`
  (l.759, tueur `:206 SDL`), `..._checks_the_day_of_the_bundle` (l.766, `:207 SDL`), `..._checks_the_anchor_of_the_bundle` (l.773, `:208 CONST`),
  `..._checks_the_seed_chain` (l.780, `:210 CONST` ; graine de répétition, puis jour au-delà de l'horizon), `..._verifies_the_first_snapshot_with_the_line`
  (l.791, `:239 CONST`, `seq 3: read_instant_mismatch (instant)`) ; modifié : `dojo_publish_history_reads_the_packet_with_its_check` (D2-5 :
  `publish/history/extra.jsonl: not listed`) ; tueur réancré : `:517` → `:518`.
- `test/dojo-publish-e2e.test.ts` (sha256 `e824f106…`) : neuf `dojo_publish_lock_never_exists_without_its_record` (l.279 ; tué à l'écriture de
  l'enregistrement par `killAt("writeSync", "taken_at")` : aucun `publish.lock`, seul `publish.lock.<pid>` reste, le lancement suivant publie ;
  tueur `:538 CONST`) ; tueurs réancrés : T-SW1 (`:541 CONST "linkSync(tmp, p)" -> "renameSync(tmp, p)"`), C-1 (`:539`).
- `test/dojo-publish-deploy.test.ts` (sha256 `97b2a681…`) : `dojo_runbook_jobs_carry_the_unit_properties` lit toute propriété quotée
  (`"$U"`, `"$I"`) et exige `InaccessiblePaths=` égal à l'unité pour 18 (iv) ; tueurs du RUNBOOK réancrés : `:440`, `:633`, `:750`, `:793`.

### 9.3 Exécution de la suite (clone neuf `F:/tmp/dojo/b1corr/gel2` à `35930dc8`, fichiers égaux au worktree : digest `042f8bd9…` des deux)

- C-V-4 à 04:21Z : 8 `node.exe`, 13 375 708 Ko physiques, 32 088 792 Ko virtuels libres ; verrou d'hôte absent à chaque course.
- Suite du Dōjō (22 fichiers) : 244 tests, 242 verts, 0 rouge, 2 ignorés connus (`runs/gel2-dojo-all-2.tap` `9f951db9…`, 04:27:02Z) ; après
  les deux corrections du §9.5 (tests seuls), les trois fichiers touchés : 46 tests, 45 verts, 1 ignoré (`runs/gel2-3files-2.tap` `c3820400…`).
- `red-proof.mjs` du tronc, `--base 35930dc8 --draw 30 --seed 20261001` (04:50:22Z, après les deux corrections du §9.5) :
  `F:/tmp/dojo/b1corr/red-proof-4/RED-PROOF.json` sha256 `7234eb185dc67af79e831ba7ddbd30df6b8205da9df65500d699523e465f5d53` (digest du gel
  `7b2f7b28`) : 8 jugés, 8 F2P, 8 tueurs tirés, 8 tués par `ERR_ASSERTION` ; sortie 0 (premier passage, avant elles : `red-proof-3`, 8 sur 8).
- Tueurs réancrés, tirés un à un sur `gel2` par `tools/fire.mjs` (`1ef1652a…`, la logique de `fire` de red-proof ; fichier restauré, sha256
  vérifié) : T-SW1 `:541`, C-1 `:539`, `names_a_missing_day` `:518`, `refuses_a_malformed_bundle` `:481`, `imports_no_network_module` `:16` :
  5 tués par une assertion (`fire/killer-1.tap` à `-5.tap` : `338a7ce3…`, `f2753f5a…`, `4df8ddb6…`, `d650a87e…`, `b8d682d2…`).
- R-25 de la suite contre `35930dc8` (`git diff --shortstat`, hors `docs/**/*.md`) : 125 + 39 = **164** (prévu ≈ 131, × 1,25) ; cumul du lot sur
  ses six fichiers de code et de test contre `1f238254` : 339 + 87 = **426** (borne 1 150). L'oracle sur l'arbre final est cité dans `REPONSE.md`.

### 9.4 Q-n de la suite

- **Q-10, trace d'un lancement tué (Q-6)** : un processus tué entre la création et l'écriture laisse `publish.lock.<pid>` (vide ou partiel) ; il ne
  bloque aucun lancement (le verrou est l'autre nom) et un pid réutilisé l'écrase (« w »). Non retiré. Construction, si voulue : `--unlock`
  retire aussi les `publish.lock.<pid>` dont le pid ne tourne pas (≈ 3 lignes, un cas de T-SW2). Décision demandée.
- **Q-11, liens physiques** : `linkSync` exige un système de fichiers qui les porte (ext4 à l'état de l'hôte Bell, NTFS ici) ; sur FAT ou exFAT,
  chaque lancement finirait `fatal` (jamais un faux verrou). À relever avec FAITS-SYSTEMD-RUN-UNSETENV-1 : `stat -f -c %T /var/lib/monark-dojo`.
- **Q-12, coût** : l'acte d'historique passe la VAE deux fois (la ligne seule, gardée pour l'ordre des refus que T-H2 et le §19 épinglent, puis
  la ligne avec le `snapshot` candidat) ; la mesure DOJO-VERIFY-SCALE-1 de l'acte est à refaire avant 18 (iv) si l'historique est gros.
- **Q-13, résidu de B1-PRECHECK-FULL-1** : le candidat est bâti à l'horloge de l'acte ; la vraie première publication vient au créneau suivant ;
  seul un changement entre les deux (une rotation, une ancre, une retouche de `bundles/<d>`) pourrait la faire refuser, par un arrêt nommé.
  Construction qui le fermerait : publier d dans le même lancement que la ligne `history` (deux lignes, une VAE). Décision demandée.
- **Q-14, D2-6 non demandée** : le retrait du paquet (18 (iii)) n'a pas de garde mécanique ; construction du G2 : `test ! -e
  /var/lib/monark-dojo/publish.lock` avant `rm -r`. Non faite (hors des deux notes demandées).
- **Q-2 étendu** : la lecture sur l'hôte couvre aussi `"--property=InaccessiblePaths=<trois chemins>"` (même forme que `"$U"`).
- **Git, suite** : index du worktree daté de 04:08:07Z (l'avance rapide de l'orchestrateur), inchangé depuis (relevé en fin de suite) ; toutes
  mes lectures du worktree sous `--no-optional-locks` ou `GIT_OPTIONAL_LOCKS=0` ; aucun `GIT_DIR`, `GIT_WORK_TREE` ni `--write-tree`.

### 9.5 Portes de la suite

- Premier oracle complet de la suite (`--role corr --key b1-corr --base 35930dc8`, 04:31:01Z, record
  `35930dc8…-589fc53079038b9b-corr-20261001T043101Z-357852`) : `typecheck` rouge (TS2339 : dans le cas de l'horizon,
  `hl.map((l) => String(l.address))` lisait le tableau réécrit par étalement, que TypeScript type `{ day: string }`) et `lint` rouge
  (`require-await` : le test neuf de Q-6 était `async` sans `await`). Corrigés : `short.hl.map(…)` ; le test rendu synchrone. Les tests
  sous Node passaient (Node retire les types sans les vérifier) : l'oracle est la seule preuve des portes. Rejeu cité dans `REPONSE.md`.
- Ce même passage : 1 845 tests, 1 839 verts, 5 ignorés connus, 1 rouge hors du lot, `probe_smtp_connect_deadline_bounds_handshake`
  (`test/probe-narabi.test.ts:909`, une borne de temps réseau local) ; la porte `test` y a duré 843 s, le double des passages de la matinée
  (12 à 20 `node.exe` d'autres travaux sur l'hôte) : à juger au rejeu, sans action dans ce lot.
