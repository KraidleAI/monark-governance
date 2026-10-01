claude-opus-5-5

# G1 — journal du lot MIDNIGHT-FLAKE (item DOJO-COLLECT-UNIT-TICK-MIDNIGHT-1)

Objet : rendre déterministe `dojo_collect_unit_runs_the_real_tick` (`test/dojo-collect-deploy.test.ts`), sans affaiblir ce qu'il prouve.

- **Modèle résolu (R-1)** : `claude-opus-5-5`, effort max, instance fraîche, contexte frais.
- **Mission** : `F:/tmp/dojo/mission-impl-midnight.md` (58 l., 15 761 o.), sha256
  `3a3ccc82e2969991cf50aff5caef0e3e2f0f1d45a56c5dd9065b9d9b5fd4541e`, recalculé AVANT lecture à 01:18:24Z (`date -u`), égal au `sha` du reçu
  `F:/tmp/dojo/mission-impl-midnight.recu.json` (verdict vert, 12 codes à 0, base = head = `1b57566c`).
- **Base** : worktree `F:/Monark-wt-midnight-flake`, branche `lot/midnight-flake`, HEAD `1b57566c8f0ee7f1c80eb76ec950121d8fb03e61`,
  `git --no-optional-locks status --porcelain` à 01:19:00Z : 0 ligne.
- **Verrou d'hôte** : `F:/tmp/oracle-lock` absent à 01:19:00Z, 01:33:43Z, 01:41:57Z, 01:42:13Z et 01:43:28Z (relevé avant chaque lot de courses).
- **C-V-4** (01:33:43Z, `Get-CimInstance Win32_OperatingSystem`) : 15 696 Mo de mémoire physique libre, 30 916 Mo de virtuelle, 9 `node.exe`.
- **Isolation git** : aucun `GIT_DIR` ni `GIT_WORK_TREE` posé, aucun `write-tree` ; aucun git écrivant dans le worktree ni dans `F:/Monark`. Git
  écrivant seulement dans des clones neufs sous `F:/tmp/dojo/midnight/` (`base`, `gel-killer`, `rp-repo` : `clone --no-local`, `checkout`)
  et dans les clones internes de l'oracle (gel) et de `red-proof`, sous leurs dossiers de travail.
- **Clés** : l'environnement de session porte des clés réelles (13 noms au motif `DENY` de `red-proof.mjs` l.34, noms seuls relevés) ; chaque
  course de test les retire (lanceur `run-one.mjs`, même motif). Aucune clé réelle lue ni écrite.

## Lecture (tâche 1 ; entrées de la mission, dans l'ordre, en entier)

| Fichier | Lignes | sha256 |
|---|---|---|
| `docs/ETAT.md` | 59 | `8fc81155d30f93b7dca04ac5c63b454c45d307a9593e18703e4a6e76f02fab62` |
| `test/dojo-collect-deploy.test.ts` | 357 | `92a621c0383b3be1d6686819eeb31705b0a7d61306ea94c11f583d81257ab080` |
| `apps/dojo/src/collect.ts` | 306 | `afd31de87ea2431cb8c8d36ab488b50f8b6147c8859d2e6c580fe6b33f9b9405` |
| `apps/dojo/scripts/dojo-seed.mjs` | 52 | `5a211317345e597fa7a6922968b716a3f7ef39f0ef8c27c6f05bafaf4497ca61` |
| `apps/dojo/test/helpers/collect-chain.ts` | 97 | `1a0eb87674140b43f78b95a0650825b67ad87ab3ec7d8ccd30e443b0c5a578e4` |
| `F:/Monark/scripts/red-proof.mjs` (`parseKiller` l.46-49) | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |

Hors liste, lus pour la mesure et la correction : `apps/dojo/scripts/dojo-core.mjs` l.417-472 (`hashChain`, `daySeed`, `beaconRound`,
`readInstants`) et `dojo-core.d.mts` l.37-39 ; `apps/dojo/test/helpers/dojo-fixture.ts` l.1-40 et l.118-130 (`ANCHOR_DAY`, `betaOf`, `roundOf`) ;
`apps/dojo/src/dojo-methods.ts` l.12-34 (`TRIES`, `READ_RULE`) ; `packages/rpc-guard/src/guarded.ts` l.15-60 (seuls les opérateurs demandés sont
résolus) ; `packages/rpc-guard/src/lock.ts` l.36-44 (cible du tueur, l.42) ; `F:/Monark/scripts/oracle/run.mjs` (mode `--static-only`) et
`r25.mjs` (sha256 `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0`, identique au tronc et au worktree).

## Mesure (tâche 1, sur l'arbre réuni, AVANT tout code ; 01:33Z à 01:52Z)

Arbre mesuré : clone `--no-local` du worktree sous `F:/tmp/dojo/midnight/base`, détaché sur `1b57566c` (test `92a621c0…b080`, identique),
jonctions `node_modules` par `mk-nm.ps1` (220 entrées, 11 `@monark`, 0 échec). TEMP, TMP, TMPDIR = `F:/tmp/dojo/midnight/tmp`. Outils, hors
dépôt, sous `F:/tmp/dojo/midnight/` : `force-seed.mjs` (sha256 `10ea64ce649d99551871431902608a221c53993d46dc606c3186ac2467d9157d`, préchargement
`NODE_OPTIONS=--import` : force ou journalise le secret de `dojo-seed.mjs` SEULEMENT quand son `--init` est sous un répertoire `dojo-collect-unit-*`,
celui du test cible, et vide `sim.reqs` du test à sa sortie) ; `find-seeds.mjs` (`0e9e74b1b57d6e1ecdff1d49fe75ff59e61bfd21e43b95edda0ff8d462ccd93a`) ;
`run-one.mjs` (`ce5327d680404de6c178a63b4283e59a3c009a6f1dc21491e731a1719547f990`) ; `summarize.mjs`
(`4f0ef6938216ec69f9748be4ecdca972933414bc9ea7ac0db9c0a720b038674e`) ; `classify.mjs` (`4dd9015bf7f0fa381b7ea503ec4847c65d3b4b059e972c5d44680b70aaeb86fa`).

1. **Fréquence exacte.** Un instant vaut `T + 900 + (h mod 85 500)` (`readInstants`, `dojo-core.mjs` l.459-472) : il tombe dans
   `[T + 86 101, T + 86 399]`, où le pas de minuterie `ceil(t/300)·300` vaut minuit, avec la probabilité 299/85 500. Quatre instants :
   `p = 1 - (85 201/85 500)^4 = 0,013915097770…`, soit **1,3915 %** par course (rationnels exacts, `seeds.json`, champ `exact.p_mid`).
2. **Monte-Carlo de la condition.** 10 000 000 secrets pris le long d'une chaîne SHA-256 au départ déclaré
   (`SHA-256("MIDNIGHT-FLAKE G1 seed search 2026-10-01")` = `f1201136…0236` ; le candidat `x(i)` a `daySeed(·,365,2) = x(i+363)`) :
   139 122 cas, **1,39122 %**, à 0,8 écart-type du calcul exact. `seeds.json` sha256
   `83fdc2b30c3ac9f77b8bfe71eb09f46641bc33b29398f8431698ea02d8e55fdb`, 207 s.
3. **Courses réelles à graines aléatoires.** 200 courses du test seul à la base (secret tiré par `dojo-seed.mjs` lui-même, journalisé par le
   préchargement, sans forçage ni vidage) : **2 rouges sur 200** (1,0 % ; 2,78 attendus), r057 (instant à T + 86 395) et r198 (T + 86 154). Les
   2 rouges sont exactement les 2 courses où la condition tient : 0 écart dans un sens comme dans l'autre (`m2-base-random.jsonl` sha256
   `b47fb1ba94a171c4ea8f2b111cb740059a70d14996f8e6be1ef5ec07e5d890ca`). Même assertion rouge dans les deux (`[2, 2, 17, 17]`).
4. **Graines forcées** (secrets de la chaîne, `daySeed` revérifié pour chacun ; test seul ; `F:/tmp/dojo/midnight/m1-base/<cas>/`, TAP et vidage) :

| Cas (indice) | Instants de D1, secondes après T1 = T(D1) | Base | `[drand-pl, drand-cf, helius, solana-foundation]` |
|---|---|---|---|
| far, témoin (0) | 8 605, 28 547, 28 612, 52 489 | vert | `[1, 1, 17, 17]` |
| edge_out (18 018) | …, 86 100 (pas à T1 + 86 100, dans le jour) | vert | `[1, 1, 17, 17]` |
| edge_in (1 312) | …, 86 101 (pas à minuit) | **rouge** | `[2, 2, 17, 17]` |
| mid1 (13) | …, 86 330 | **rouge** | `[2, 2, 17, 17]` |
| last (10 422) | …, 86 399 | **rouge** | `[2, 2, 17, 17]` |
| mid2 (6 665) | …, 86 117, 86 225 (deux pas à minuit) | **rouge** | `[2, 2, 17, 17]` |
| sub (1 522 118) | …, 86 147, et un instant de D1+1 à T2 + 900 | **rouge** | `[2, 2, 22, 22]` |

Secrets : far `f1201136…0236`, edge_out `7e5c0612…e0d6`, edge_in `00ffa33b…5dec`, mid1 `e286723f…e5b9`, last `c4206783…6c72`,
mid2 `5cd7b9e0…f568`, sub `e03a518f…bf0f` (valeurs entières dans `seeds.json`, champ `first`). TAP (sha256, 16 premiers) : far `50af303435ce6950`,
edge_out `22cc2604283944d0`, edge_in `0cf857e24aef3f04`, mid1 `9089fca6afb5fd7a`, last `ff5feed61f17a771`, mid2 `489d32206d0d0195`,
sub `413c941e050d1afb`. Chaque rouge : `ERR_ASSERTION` sur le message « one beacon GET per relay through the guard; 5 + 3 x 4 pieces per
operator (the mint read once) ».

## Cause (exacte, après DRAND-1b)

- Au pas de minuit `T2 = T(D1 + 1)`, `tick()` (`collect.ts` l.271) planifie D1+1, qui n'a pas de plan ; comme `now < T2 + 900` (l.186), le plan fait
  le cours des relais par le garde (l.191-197, cycle `drand-<jour>`) : **un GET par relais du round de D1+1** (32 727 412 = `roundOf(D1 + 1)` ;
  32 698 612 pour D1), à l'horloge simulée T2 + 0 (vidages `reqs-*.json` de edge_in, mid1, last, mid2 et sub). Le même pas lit ensuite l'instant de
  D1, dont la fenêtre chevauche minuit (l.272-277). Avec deux instants à minuit (mid2), le plan est écrit au premier pas : un seul GET de plus.
- Le test compte TOUTES les requêtes de la course (l.327 et l.330) : `[2, 2, 17, 17]` contre `[1, 1, 17, 17]`. Depuis DRAND-1b, les GET des relais
  passent par le garde et le simulateur les compte sous `drand-pl` et `drand-cf` (`collect-chain.ts` l.24-25, l.73-81). Le comportement du
  collecteur est voulu ; le défaut est dans le test.
- **Sous-cas** (`p = 6,51·10⁻⁷` exact par course ; 4 cas sur 10⁷ au Monte-Carlo) : le simulateur répond à tout round avec `sim.beta`
  (`collect-chain.ts` l.67-68, l.81), donc le plan de D1+1 fait à minuit porte un beacon et des instants. Si l'un d'eux vaut T2 + 900, le pas
  final du test (l.326) le lit (`collect.ts` l.272-276 ; l'Ève de D1+1 vient d'être écrite par la clôture de D1, l.251-253) : 5 pièces de plus par
  opérateur, `[2, 2, 22, 22]` (cas sub, 10 requêtes de chaîne à T2 + 900 dans le vidage).
- **Bords** : T1 + 86 100 vert, T1 + 86 101 rouge. La cause est le pas de minuterie à minuit, à la seconde près ; aucune autre cause de rouge
  dans les 200 courses aléatoires.

## Choix (tâche 1)

**Voie recommandée, retenue** : l'assertion de comptage existante (l.330-331) ne compte plus que les requêtes du jour planifié ; celles du
lendemain sont affirmées à part, depuis les premiers principes. Une requête est « du lendemain » si c'est le GET du round de D1+1 (chemin exact
`/<beacon_chain_hash>/public/<roundOf(D1 + 1)>`, `roundOf` de la fixture, recodage indépendant) ou si son horloge simulée (`stampOf`) passe minuit :
les lectures de D1 se font toutes à un pas au plus égal à T2, seul le pas final vient après. Attendu du lendemain : `m` GET par relais
(`m = 1` si un pas de `inst` tombe à minuit, sinon 0) ; `4n + 1` pièces par opérateur pour `n` lectures (la monnaie une fois : 5, puis 4),
`n` = nombre d'instants de D1+1 dans la fenêtre du pas final, tirés de `daySeed(secret, 365, 2)` et de la bêta du monde, comme l.311 le fait
pour D1 ; `n = 0` quand `m = 0` (le plan de D1+1 fait au pas final n'a pas de beacon).

Pourquoi : (a) l'assertion du jour planifié garde ses valeurs `[1, 1, 17, 17]` et son message, pour toute graine ; (b) le témoin loin de minuit
garde exactement ce qu'il prouvait (toutes les requêtes de la course sont celles du jour ; l'autre partition vaut `[0, 0, 0, 0]`) ; (c) le pas de
minuit qui planifie le lendemain, voulu (1,39 % des jours réels), reste couvert et affirmé, avec son round ; (d) déterministe par construction,
sous-cas compris, sans toucher la graine (`dojo-seed.mjs` de l'arbre reste la source, l.277). Le repli (re-tirer la graine jusqu'à ce que le
dernier pas reste dans le jour) sortirait ce comportement du seul test TU-C de bout en bout, multiplierait les `--init` et l'ancre, et garderait
une probabilité d'échec non nulle à sa borne (0,013915 puissance k pour k tirages) : écarté.

Aucun changement du collecteur, de `rpc-guard` ni des unités. La ligne `// killer:` (l.261) reste juste au-dessus de `test(` (l.262), sa cible
`packages/rpc-guard/src/lock.ts:42` est inchangée.

## Compte ascendant AVANT tout code (tâche 1 ; `date -u` 2026-10-01 01:57:46Z)

| Fichier | Composants | Insertions | Suppressions |
|---|---|---|---|
| `test/dojo-collect-deploy.test.ts` | imports l.20 (`stampOf`) et l.21 (`roundOf`) | 2 | 2 |
| | commentaire du pas final l.326 (le lendemain peut être déjà planifié à minuit) | 1 | 1 |
| | après l.326 : 2 l. de commentaire, `nextGet`, ensemble `nextDay` | 4 | 0 |
| | l.327 : `ops` restreint aux requêtes du jour planifié (l.330-331 inchangées) | 1 | 1 |
| | après l.331 : 2 l. de commentaire, `m`, `n`, `reads`, assertion du lendemain (2 l.) | 7 | 0 |
| `docs/G1-lot-midnight-flake.md` | ce journal, exclu de R-25 (`ci.yml` l.82, `:(exclude)docs/G1-lot-*.md`) | — | — |
| **Total** | | **15** | **4** |

Prévu : 19 lignes mesurées contre la borne de 1 150 (`ci.yml`, job `r25-taille-de-lot`), solde prévu 1 131. Toutes les lignes prévues
mesurent au plus 154 caractères (brouillon `F:/tmp/dojo/midnight/draft/lines.txt`).

## Code (tâche 2 ; appliqué à 01:58:24Z)

Application par `F:/tmp/dojo/midnight/draft/apply.mjs` (sha256 `3b0ed91712e998d9998a04d49b22ecf2f5497f65dcb673430b1b01bf9b831bd6`), qui vérifie le
sha256 de base du fichier et le texte exact des lignes 20, 21, 326, 327, 330 et 331 avant de les remplacer par les lignes mesurées du brouillon
`draft/lines.txt` (`1defde141bfc730970a7baf0263d02d0f8c4074c8a49927c3375d68a0f38b847`).

- **`test/dojo-collect-deploy.test.ts`** : 357 → 368 lignes ; sha256 `92a621c0…b080` → `d780ca32be7f6316022b26d11d96b52f043d5e45ba214e91e9b6f663206c7c8e` ;
  `git diff --stat` : 15 insertions, 4 suppressions, soit exactement le compte ascendant.
  - l.20 et l.21 : imports `stampOf` (simulateur) et `roundOf` (fixture).
  - l.326 : commentaire du pas final précisé (« unless 00:00 did ») ; l'appel `tick(T(D1 + 1) + 900)` est inchangé.
  - l.327-330 : commentaire DOJO-COLLECT-UNIT-TICK-MIDNIGHT-1, chemin `nextGet` du round de D1+1, ensemble `nextDay` des requêtes du lendemain.
  - l.331 : `ops` ne garde que les requêtes du jour planifié. Les l.332-335 (jour compté, quatre lectures, comptage `[1, 1, 17, 17]` et son message)
    sont inchangées octet pour octet.
  - l.336-342 : commentaire, `m`, `end` et `tol`, `n` (instants de D1+1 dans la fenêtre du pas final), `reads`, assertion du lendemain
    `[m, m, reads, reads]`.
- Lignes ajoutées : 15, au plus 154 caractères, ASCII, sans TAB, sans octet de contrôle, sans barre oblique inverse ; LF final conservé.
- Ligne `// killer:` : l.261, juste au-dessus de `test(` l.262, inchangée ; `parseKiller` du tronc la lit
  (`packages/rpc-guard/src/lock.ts`, l.42, `SDL`, « before » présent une seule fois sur la ligne cible), dans le worktree comme à la base
  (`draft/check-killer.mjs`, sha256 `56d6c14c1afc085dad0cba5cf2016fdfcad303e7cec0084f7537932b00d70c0a`).
- Aucun autre fichier du dépôt modifié (`git status --porcelain` : ` M test/dojo-collect-deploy.test.ts`, `?? docs/G1-lot-midnight-flake.md`).

## Écarts (consignés, origine G1)

- **É-1, tests lancés pendant un verrou d'hôte tenu par un autre processus** (règle du cadre : « aucun test pendant que le verrou d'hôte
  `F:/tmp/oracle-lock` est tenu par un autre processus »). Je relevais le verrou en tête de lot, non avant chaque course. Propriétaire : l'oracle G1
  du worktree `F:/Monark-wt-series-binance` (`c6ccb233` + arbre sale `9847c4ed…`), pid 83 388 (vivant, `Get-Process`), verrou pris à 02:10:21Z
  et rendu à 02:16:31Z ; puis son rejeu, pid 55 724, verrou pris à 02:18:47Z. Courses concernées : (a) 28 des 200 courses aléatoires
  (r173 à r200 de `m5-gel-random`, 02:10:21Z à 02:12:55Z) ; (b) les 12 fichiers de `m6-gel-files` (02:13:15Z à 02:15:39Z) ; (c) 10 s de
  `dojo-publish.test.ts` dans `m7-gel-files-clean` (02:18:47Z à 02:18:57Z), course résiduelle d'un contrôle fait par fichier. Aucun oracle arrêté
  ni touché. Correction : contrôle du verrou avant CHAQUE fichier (`m7`), puis avant CHAQUE course (`loop.mjs`, sha256
  `bf5dc89d67cc74ba1f6a477e7f4050c95dc23547cb0b6695ec4961c2b40b07bf`, qui attend tant que le verrou existe et journalise l'attente) ; preuves
  rejouées hors verrou (tests ci-dessous). Effet sur l'oracle concurrent : son premier enregistrement
  (`F:/tmp/oracle-results/c6ccb233b85afce1e33e5f0c9683e43c8c0c9051-9847c4ed4998fa5d-G1-20261001T020829Z-83388.json`, sha256
  `f675bb0d9205a0f02827e6b43f3b67aa883b20b6b081118e0d8d29d14a8b0370`) est rouge, 1 791 tests dont 1 échec : le test 42
  `export_public_no_governance_no_french`, `npm ci` hors ligne en `ENOTCACHED` sur `zwitch-2.0.4.tgz` (journal `09-test.log`, sha256
  `a8166650fc7bd01a26bbd15863adbc206b51493694bcd61bd7b936217143f038`). C'est un cache npm manquant, pas un dépassement de délai ni un
  manque de mémoire (C-V-4 de cet oracle : 10 882 Mo libres, 14 `node.exe`) ; rien n'y désigne mes courses. Jugement laissé à l'orchestrateur (Q-1).

## Tests (tâche 3)

Toutes les courses : lanceur `run-one.mjs` (TAP, test seul par `--test-name-pattern`, environnement sans les noms `DENY`, TEMP sur F:).

1. **Graines forcées sur l'arbre corrigé** (worktree, 01:59:30Z à 01:59:49Z, `F:/tmp/dojo/midnight/m3-gel/<cas>/`) : **7 vertes sur 7** (far,
   edge_out, edge_in, mid1, last, mid2, sub), dont les 5 qui rougissaient à la base. Forçage vérifié (journal du secret = secret forcé, pour chacune).
   Partition recalculée depuis les vidages, indépendamment du test (GET du round 32 727 412, ou horloge simulée après T2) :

| Cas | Jour planifié | Lendemain | Lecture |
|---|---|---|---|
| far, edge_out | `[1, 1, 17, 17]` | `[0, 0, 0, 0]` | témoin : toutes les requêtes sont celles du jour, comme avant |
| edge_in, mid1, last, mid2 | `[1, 1, 17, 17]` | `[1, 1, 0, 0]` | le pas de minuit planifie le lendemain : un GET de son round par relais |
| sub | `[1, 1, 17, 17]` | `[1, 1, 5, 5]` | plus la lecture de l'instant de D1+1 à T2 + 900 au pas final |

   TAP (sha256, 16 premiers) : far `8031cb8c5af99cf7`, edge_out `774f7dcf8a6f27e9`, edge_in `c5e3d0e5d390254f`, mid1 `9ac20965514d6105`,
   last `95a373da2aeaba75`, mid2 `3d62e79c9ab12899`, sub `10a6c0cacbd483df`.
2. **Tueur appliqué** (clone `F:/tmp/dojo/midnight/gel-killer`, base + test corrigé `d780ca32…7c8e` ; `draft/killer.mjs`, sha256
   `0bef8dacf09de86dda9a6854a5260c11332df48760a660a04cd462ea11d6daf5`, même mutation que `fire` de `red-proof.mjs` : la l.42 de
   `packages/rpc-guard/src/lock.ts` vidée, sha256 `6655a9c8…c244` → `b38b0dcd…3d78`, puis restaurée et revérifiée `6655a9c8…c244`) :
   **4 rouges sur 4** (graines far, mid1, sub et une sans forçage), statut `assert-fail` selon `classify` du tronc, à la l.324
   (`existsSync(lock)` : obtenu `true`, attendu `false`), donc avant les comptes. TAP : `m4-killer/killer-{far,mid1,sub,unforced}.tap`
   (sha256 `15705e93…`, `2797bba8…`, `3e1dd3e0…`, `3d5ea17c…`). `red-proof.mjs` ne peut pas tirer ce tueur ici : il copie le test du gel dans le
   clone de base, or le code est identique, donc le test est vert « à la base » et n'est pas admis au tirage (voir le point 6).
3. **200 courses du test seul, graines aléatoires** (worktree, 02:02:00Z à 02:12:55Z, `m5-gel-random/`, secret tiré par `dojo-seed.mjs` lui-même et
   journalisé) : **200 vertes sur 200**, 200 secrets distincts, dont 3 cas de minuit (r094 à T1 + 86 257, r133 à T1 + 86 263, r173 à T1 + 86 356)
   qui auraient rougi à la base (`m5-gel-random.jsonl` sha256 `c9715c8ee3f2ee945efa7db58285e2e96df4f16d50ec781ca99e803fde701801`). Les courses
   r173 à r200 ont tourné sous le verrou d'un autre processus (É-1) : la série propre de 200 est rejouée au point 5.
4. **Fichiers entiers, sans préchargement** (série propre `m7-gel-files-clean/`, contrôle du verrou avant chaque fichier ; 02:17:25Z à 02:18:57Z,
   puis 02:26:36Z et 02:27:03Z) : **tout vert**. `test/dojo-collect-deploy.test.ts` **9/9** (TAP sha256 `62b4f662625c3364…`) ; sous
   `apps/dojo/test/` : `dojo-collect` 17/17 (`08ef718c28b9865d…`), `dojo-collect-pure` 12/12 (`6cd67bc6e732b442…`), `dojo-collect-sigterm` 1/1
   (`1f84f08754888675…`), `dojo-history-collect` 15/15 (`f719ff0fceb06649…`), `dojo-chain` 15/15 (`80b3bebc542f2022…`), `dojo-core-curve-merkle`
   2/2 (`00bb02707e28eda3…`), `dojo-core-hold` 12/12 (`8df06fe2f572ade6…`), `dojo-history-build` 8/8 (`87efec7fe4c2df71…`), `dojo-history-read`
   6/6 (`3c7f4f380c113556…`), `dojo-publish` 21/21 (`cba9a3401ae5388d…`, 10 s sous verrou, É-1 (c), rejoué propre à 02:27:03Z : 21/21,
   `b17a768284e8af48…`), `dojo-verify` 33/33 (`b31d22850bdc3c06…`). Soit 142 tests sous `apps/dojo/test/`, 0 rouge. La série `m6-gel-files`
   (sous verrou, É-1 (b)) était déjà toute verte ; elle n'est pas retenue comme preuve.
5. **200 courses propres du test seul, graines aléatoires** (worktree, 02:29:04Z à 02:36:17Z, `m8-gel-random-clean/`, verrou contrôlé avant et
   après CHAQUE course par `loop.mjs` : aucune attente, aucun verrou vu ; journal `m8-gel-random-clean.pauses.log`) : **200 vertes sur 200**,
   200 secrets distincts tirés par `dojo-seed.mjs`, dont 1 cas de minuit (r130 à T1 + 86 282) ; `m8-gel-random-clean.jsonl` sha256
   `879b5a3669a73645954ffe52ed0f8541a35fb35f844adf1b1a682f5c6f8ad7da`. Avec le point 3 : 400 courses, 0 rouge, 4 cas de minuit.
6. **`red-proof.mjs` du tronc** (02:36:37Z à 02:37:00Z ; `--base 1b57566c… --gel F:/Monark-wt-midnight-flake --repo F:/tmp/dojo/midnight/rp-repo
   --out F:/tmp/dojo/midnight/rp-out --draw 1 --seed 1`, `rp-repo` = clone `--no-local` à la base, `node_modules` en jonction unique vers
   `F:/Monark/node_modules`) : 1 test jugé (`dojo_collect_unit_runs_the_real_tick`, l.262), 8 inchangés ; base `pass`, gel `pass` ; tueur
   `packages/rpc-guard/src/lock.ts:42 SDL` valide (`killerProblem` nul) ; verdict « refused: green at base: a self-confirming test » ;
   population du tirage 0, aucun tueur tiré ; sortie 1. Attendu : l'outil copie le test du gel dans le clone de base et le code ne change pas, donc
   son critère F2P (rouge à la base) ne s'applique pas à un lot qui ne touche que le test (Q-3). `RED-PROOF.json` sha256
   `53c4c5cd0b726e66f24769e0a554d0b4997e7f72ac078db2587a9306368c9b9f` (`base.tap` `66df161b…99b3`, `gel.tap` `08c5c781…ac62`).
7. **Cas « quatre instants dans la fenêtre »** (p⁴ ≈ 1,5·10⁻¹⁰, aucune graine trouvée) : il ne diffère de mid1 que parce que le premier pas de
   minuit est le pas refusé (sans `BELL_SOLANA_RPC`), suivi du pas `lock_held`. Harnais `F:/tmp/dojo/midnight/allfour.mjs` (sha256
   `ba496a5b53cf6fdb044bb4cdacecfb40be8195a88ad541e5010ac6ea0c5f59a2`), `collect.ts` et simulateur du worktree, graine mid1, 02:27:20Z ;
   sortie `allfour-out.json` (`0d6d1e0b6c0ec228796135bb65bca0219cba0f9224da8baacc44ce02ffc4256c`). Le pas refusé à T2 rend « rpc-guard: requested
   operator 'helius' is not resolved from env (fail-closed) », le motif attendu par le test, APRÈS avoir planifié D1+1 : un GET par relais du round
   32 727 412 (le garde n'ouvre que les opérateurs demandés, `guarded.ts` l.26-37 ; le plan précède les lectures, `collect.ts` l.271-278). Les pas
   suivants à T2 (`lock_held`, lecture, répétition) n'ajoutent aucun GET. Donc `m = 1` et le lendemain vaut `[1, 1, 0, 0]` dans ce cas aussi.
   La graine de ce cas reste à chercher : item formé DOJO-MIDNIGHT-ALLFOUR-SEED-1 (Q-6).

## Portes statiques et R-25 (tâche 4)

- **Oracle du tronc, mode statique** : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-midnight-flake --base 1b57566c…
  --static-only` (02:27:35Z à 02:28:45Z, hors verrou par construction ; gel dans le clone de l'outil, empreinte de l'arbre sale `a88062c5…`,
  objet arbre `2cbd819efc0fc08f28b5dc0d5c57bac9a34617e5`). **Huit portes à 0** : `lint-model-pinning` 0, `r25` 0, `lang:gate` 0,
  `export:check` 0, `gate:vocab` 0, `typecheck` 0, `lint` 0, `lint:ratchet` 0. Enregistrement
  `F:/tmp/oracle-results/1b57566c8f0ee7f1c80eb76ec950121d8fb03e61-a88062c5fa25c2b4-G1-20261001T022735Z-394584.json`, sha256
  `6bb23eb378a023040afa54cbb1d8ceeead07737cdf59a0934331a135f292b23e`. Seul ce journal a changé depuis ce gel (le test est le même octet pour
  octet) ; le rejeu statique sur l'arbre final est cité dans `F:/tmp/dojo/midnight-deliver/REPONSE.md`.
- **R-25** (calcul exporté `r25()` de `scripts/oracle/r25.mjs`, sha256 `4d0544df…cf0`, dans le clone gelé, plage `base...HEAD`) :
  `STAT` **15 insertions, 4 suppressions, 19 lignes** (porte `VIBEGATES_PR_LIMIT` = 1 205) ; `CONTENT_STAT` 0 (porte 8 000) ; vert. Contre la
  borne de la mission (1 150) : solde 1 131. Égal au compte ascendant (15 et 4) et à la mesure précoce en lecture seule (`git diff --shortstat`
  avec les chemins de `ci.yml` l.82 : 1 fichier, 15 insertions, 4 suppressions).

## Fin du G1 (§ de fin ; `date -u` 2026-10-01 02:39:04Z)

- **Mesure** : rouge à 1,3915 % par course (exact ; 1,39122 % sur 10⁷ graines ; 2 sur 200 courses réelles, toutes deux expliquées). Cause : un
  instant dans `[T + 86 101, T + 86 399]` met un pas à minuit, qui planifie D1+1 avant 00:15 et fait un GET par relais de son round, compté par
  l'assertion l.330 ; sous-cas à 6,51·10⁻⁷ : lecture d'un instant de D1+1 à T2 + 900 au pas final.
- **Choix** : voie recommandée. Le jour planifié est compté seul (assertion et valeurs inchangées) ; le lendemain est affirmé à part, depuis les
  premiers principes (`[m, m, reads, reads]`).
- **Test** : 7 graines forcées vertes (5 rouges à la base) ; tueur 4 rouges sur 4 par assertion (l.324) ; 400 courses aléatoires vertes (200 propres) ;
  fichier entier 9/9 ; `apps/dojo/test/` 142/142 ; ligne `// killer:` valide au format `parseKiller` ; mécanisme du cas à quatre instants observé.
- **R-25** : 19 lignes (15 + 4), `r25()` vert ; solde 1 131 sur 1 150. **Portes** : les huit portes statiques à 0.
- **Verdict** : **LIVRE-AVEC-RESERVES**. Livrables complets, tests et portes verts ; réserve unique : É-1 (règle du verrou d'hôte enfreinte
  pendant la passe ; preuves rejouées hors verrou ; effet sur l'oracle concurrent laissé au jugement de l'orchestrateur, Q-1).

### Questions à l'orchestrateur

- **Q-1 (É-1)** : mes courses ont tourné sous le verrou de l'oracle G1 de `F:/Monark-wt-series-binance` (02:10:21Z à 02:15:39Z, puis 10 s à
  02:18:47Z). Son premier enregistrement est rouge par le test 42 (`npm ci` hors ligne, `ENOTCACHED` sur `zwitch-2.0.4.tgz`) ; son rejeu
  (`F:/tmp/oracle-results/c6ccb233b85afce1e33e5f0c9683e43c8c0c9051-9847c4ed4998fa5d-G1-20261001T021733Z-55724.json`, sha256
  `1b8833025879c84742ee233db1de713ed50c7fb53fdace540d4744de0e3eb153`) est vert : 1 791 tests, 0 échec, 4 ignorés. Un rejeu de plus est-il dû ?
- **Q-2** : le test 42 dépend du cache npm hors ligne ; à 02:11:20Z `zwitch-2.0.4.tgz` y manquait (cause non mesurée : dépendance neuve de ce lot
  ou cache incomplet). L'inspection de la partie 1 avec l'oracle complet peut la rencontrer : vérifier le cache avant ?
- **Q-3** : `red-proof.mjs` refuse par construction un lot qui ne touche qu'un test (« green at base ») et ne tire alors aucun tueur ; la preuve
  du tueur est faite à la main (même mutation que `fire`, `classify` du tronc). Faut-il un mode pour ces lots (clone de base gardant l'ancien
  test, ou graine forcée déclarée) ? Si oui, item à former par l'orchestrateur.
- **Q-4** : la décision 300 prévoit « killers et mutations sur chaque PR ou fusion » ; la mission ne demandait pas de campagne de mutants et
  aucune n'a été lancée. À tenir à l'inspection de la partie 1 ?
- **Q-5** : TEMP. REGLES-MISSION dit `F:/tmp/methode/<lot>/`, le cadre de la mission dit `F:/tmp/dojo/midnight/tmp` ; j'ai suivi la mission,
  plus précise. À confirmer.
- **Q-6 (item formé DOJO-MIDNIGHT-ALLFOUR-SEED-1, règle PAROXYSME)** : chercher une graine dont les quatre instants de D1 tombent dans les
  300 dernières secondes, pour rejouer le test entier sur ce cas, aujourd'hui couvert par le harnais du point 7 et la lecture du code. Prix :
  en moyenne 1/p⁴ ≈ 6,7·10⁹ candidats ; au débit mesuré du chercheur (10⁷ candidats en 207 s, soit 20,7 µs l'un), environ 38 h sur un cœur.
  Le passage à l'échelle sur 24 fils et un chercheur réduit au premier instant ne sont PAS mesurés. Déclencheur : une fenêtre où aucun oracle ne
  tient l'hôte, ou tout lot qui touche `tick()`. Non lancé ici : saturer le processeur partagé mettrait en danger les oracles des autres lots.

### Provenance

- Modèle `claude-opus-5-5`, effort max ; passe du 2026-10-01, 01:18:24Z à la clôture ; contexte : la mission (sha256 ci-dessus) et ses entrées ;
  réviseur : aucun à ce stade (relecture G2 et inspection de la partie 1 à venir) ; `error_origin` de É-1 : G1.
- Outils hors dépôt (sha256 ci-dessus) : `force-seed.mjs`, `find-seeds.mjs`, `run-one.mjs`, `summarize.mjs`, `classify.mjs`, `loop.mjs`,
  `allfour.mjs`, `draft/apply.mjs`, `draft/lines.txt`, `draft/check-killer.mjs`, `draft/killer.mjs` (sous `F:/tmp/dojo/midnight/`). Un brouillon
  supplanté (`allfour.ts`, jamais exécuté) a été supprimé par son chemin explicite.
- Isolation : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun git écrivant dans le worktree ni dans `F:/Monark` ; jonctions
  `node_modules` retirées à 02:37:44Z (worktree, `base`, `gel-killer`, `rp-repo`) ; `F:/Monark/node_modules` jamais écrit ; TEMP, clones et
  sorties sous `F:/` (les caches propres de PowerShell, s'il en tient, ne sont pas mesurés) ; R-20 : aucun commit, aucun workflow.
- Preuve que `F:/Monark/node_modules` est intact : l'oracle statique final, lancé après `red-proof` et après le retrait des jonctions, jonctionne
  depuis ce dossier et sort `typecheck`, `lint` et `lint:ratchet` à 0 (enregistrement cité dans `REPONSE.md`).
