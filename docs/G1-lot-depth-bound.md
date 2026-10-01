# claude-opus-5-5

# G1 — journal du lot DEPTH-BOUND (une borne de profondeur déclarée, lue avant tout JSON.parse ou canonical ; la mort d'un fichier de test)

- **Modèle résolu** : `claude-opus-5-5`, effort `max` (R-1). Rôle G1 (implémenteur). Date : 2026-10-01 (`date -u`).
- **Demande** : message de l'orchestrateur, 2026-10-01 vers 04:1x UTC, suite de la mission VERIFY-NONFINITE sous le même cadre : items
  VERIFY-DEPTH-BOUND-1 (ma Q-9) et VERIFY-TEST-DEAD-CHILD-1. L'ancien worktree `F:/Monark-wt-verify-nonfinite` ne bouge plus.
- **Worktree** : `F:/Monark-wt-depth-bound`, branche `lot/depth-bound`, base = HEAD `35930dc8a57838d9609bfc0c6637b1542b2f58da` (`lot/page-v1` réunie,
  lot VERIFY-NONFINITE compris), propre au départ. Clones sous `F:/tmp/dojo/depthbound/`, TEMP `F:/tmp/dojo/depthbound/tmp`.
- **Outils du tronc** (`F:/Monark`, HEAD `cdd7664e`), sha256 : `scripts/red-proof.mjs` `6579b550`, `scripts/oracle/run.mjs` `f22b9045`,
  `scripts/oracle/r25.mjs` `4d0544df`, `scripts/oracle/lock.mjs` `501a76b5`.
- **Aucun commit** (R-20), aucun git écrivant dans le worktree ni dans `F:/Monark`, aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree`.

## 1. Lecture et compte (écrit AVANT tout code)

### 1.1 Les constats de l'inspection, relus

Enregistrement `F:/tmp/oracle-results/1f23825455c52c841323352ee0ca16017ffa4b04-85becafe070c416f-corr-20261001T034537Z-204976.json`
(sha256 `baa09f40d2b72a66f68b574fba297fc6741529dda6d1ae4c6a9693400cbbf368`) : rôle `corr`, arbre `F:/tmp/dojo/b1corr/gel` (HEAD `1f238254`),
2026-10-01T03:45:37Z à 03:53:30Z, 1 800 tests, 1 793 verts, 2 rouges, 5 ignorés ; journal `09-test.log` (sha256 `98893777`) :

- `apps/dojo/test/dojo-verify.test.ts` échoue AU NIVEAU DU FICHIER (`'test failed'`, 25 399 ms) et aucun de ses sous-tests n'est rapporté : l'enfant
  est mort sans rien écrire. Le rapporteur `spec` de ce passage ne donne ni le code de sortie ni le signal de l'enfant.
- `site_names_no_kitchen` rougit sur mon commentaire « lot VERIFY-NONFINITE » de `apps/site/lib/dojo-served-load.ts` (vocabulaire interne interdit
  dans `apps/site`, `scripts/public-text-deny.mjs` `KITCHEN_FORMS` : sous-agent, orchestrateur, worker, checkpoint, G0 à G7, « lot <NOM> »,
  « decision <n> », identifiant ADR) ; corrigé par l'intégration `35930dc8`. Règle tenue dans ce lot : aucun de ces mots dans `apps/site`.

### 1.2 Sites qui lisent une ligne servie (règle de compte, Q-1)

Un **site** est une ligne qui passe un texte servi (ou fourni : le trousseau de la CLI) à `JSON.parse` ; pour la marche, qui ne reçoit que des valeurs,
la ligne où elle prend chaque ligne, avant `verifyLine` et `lineHash` (donc `canonical`). Rejouable : `grep -nE "JSON[.]parse[(]|walkDojoTimeline[(]lines|`
`const l = lines[[]i[]]"` sur les cinq fichiers du clone de base `F:/tmp/dojo/depthbound/base` (HEAD `35930dc8`, propre), commentaires écartés :
14 lignes, `F:/tmp/dojo/depthbound/probe/census-read-grep.txt`, sha256 `810486e769ac4f6d95b5d6925d0fe757b39cfbb0852c186d027042fcf8347ac3`.

- `apps/dojo/scripts/dojo-chain.mjs` (1) : `:136`, chaque ligne prise par la marche (puis `verifyLine` en `:144`, `lineHash` en `:163`).
- `apps/dojo/scripts/dojo-verify-cli.mjs` (1) : `:80`, le fichier `--keyring`.
- `apps/site/lib/dojo-served-load.ts` (1) : `:183`, `parseJson`, appelée en `:194` (trousseau engagé), `:196` (`dojo/pubkey.json`), `:198` (lignes de
  chronologie, par `walkable`) et `:218` (lignes de la tête).
- `apps/site/lib/dojo-live.ts` (2) : `:240` (lignes de chronologie), `:300` (lignes d'un fichier de lignes, relecture et tableau).
- `apps/dojo/scripts/dojo-verify.mjs` (3) : `:152` (lignes de `history/` et `lines/`), `:170` (`parse`, pour `dojo/pubkey.json` en `:177`), `:175`
  (lignes de chronologie).
- Écartés : `dojo-verify.mjs:315` (relit une chaîne canonique que l'outil vient de calculer), `:182` (l'appel de la marche, une entrée),
  `dojo-chain.mjs:129` (la signature de la marche), `dojo-served-load.ts:103` et `:113` (le manifeste et l'enregistrement ENGAGÉS, lus par
  `loadDojoServed` au build, non servis : Q-4).

### 1.3 Compte ascendant par fichier (sites, base `35930dc8`)

| Fichier | Sites |
|---|---|
| `apps/dojo/scripts/dojo-chain.mjs` | 1 |
| `apps/dojo/scripts/dojo-verify-cli.mjs` | 1 |
| `apps/site/lib/dojo-served-load.ts` | 1 |
| `apps/site/lib/dojo-live.ts` | 2 |
| `apps/dojo/scripts/dojo-verify.mjs` | 3 |
| **Total** | **8** |

### 1.4 La profondeur réelle des lignes servies, mesurée ; le choix de la borne

Sonde `F:/tmp/dojo/depthbound/probe/depth-real.mjs` (sha256 `d8c0569c300d558af4b9178b48b9c3643d219b234dad130a123c13b9393aac36`), sortie
`depth-real.json` (sha256 `2e7c8a3fa8cc33884ee7a08a0fd90763d23b271fff573e53d6b208e2e08cd1e1`, 2026-10-01T04:22:06Z, Node v24.15.0) : profondeur
d'imbrication des objets et des tableaux de chaque texte que rendent le fixture et le fixture étalé (rotation de clé), lue par un balayage du texte.

- Lignes de chronologie : `anchor` 2, `history` 1, `snapshot` **4** (ligne, `reads`, lecture, fraction), `price_version` 3, `key_rotation` 2.
- Ligne d'un fichier de lignes 3 (ligne, `lots`, lot) ; ligne d'historique 1 ; `dojo/pubkey.json` **4** (fichier, `keys`, clé, `public_key`) ; trousseau
  fourni 4 ; l'enregistrement engagé de la page (non servi) 5.
- `canonical` (`bell-chain.mjs`) écrit au plus **3 148** niveaux avant `RangeError` sur cette machine (`stack.mjs` en mode `limit`, sha256 `1cf42f6a`,
  sortie `stack-limit.json` `3f4505b6`, Node v24.15.0, win32).

**Borne retenue : 16.** Quatre fois la profondeur réelle la plus grande (4) : un champ neuf peut s'imbriquer de 12 niveaux sans la toucher ; environ
197 fois sous la pile mesurée de `canonical` : aucune récursion sur une valeur servie n'approche plus la pile, quel que soit le moteur.

### 1.5 L'hypothèse d'une mort native, mesurée avant le code

Mes tests de profondeur du lot VERIFY-NONFINITE poussaient `canonical` jusqu'à la limite de pile (200 000 niveaux). Sonde `crash-load.mjs`
(sha256 `0ac97938`), sortie `crash-load-1.json` (`f0a2f074`) : 16 processus concurrents, 100 débordements chacun, tous rattrapés : 16 survivants,
code 0. La seule récursion de `canonical` ne reproduit pas la mort ; la cause reste à mesurer par des passages qui relèvent le code de sortie (§1.6).

### 1.6 Plan (arrêté avant le code)

- **Déclaration** dans `apps/dojo/scripts/dojo-chain.mjs`, module que lisent le vérificateur et l'éditeur (ses imports sont épinglés : `node:crypto`
  et Bell seulement, donc code autonome), ajoutée en fin de fichier (l'éditeur cite `dojo-chain.mjs:33-37`) : `DOJO_MAX_DEPTH = 16` ; `jsonDepth(text)`,
  la profondeur d'un texte JSON en un seul passage sur ses caractères, chaînes et échappements sautés, sans parse ni récursion ; `readJson(text)`,
  `null` au-delà de la borne, sinon `JSON.parse`.
- **Refus** : le `null` rendu au-delà de la borne n'est accepté par aucune forme servie ; chaque site rend le refus qu'il donne déjà à un `null`,
  aucun code neuf : vérificateur, ligne de chronologie, `timeline_malformed` à sa seq (par la marche) ; fichier immuable, `line_malformed` ;
  `dojo/pubkey.json`, `keyring_invalid` ; CLI, fichier `--keyring`, `keyring_invalid` détail `--keyring` ; navigateur, repli `timeline_malformed`
  à sa seq, `line_malformed` ; chargeur, `the timeline does not walk under the committed keyring (seq <n>: timeline_malformed)`,
  `dojo/pubkey.json is malformed`, `head line <n> must be an object`.
- **La marche** : une ligne ajoutée après `:138`, `depthOf(l) > DOJO_MAX_DEPTH`, profondeur de la valeur mesurée sans récursion, avant
  `verifyLine` : `timeline_malformed`, pour tout appelant (vérificateur, chargeur, éditeur).
- **Navigateur et chargeur** : ils restatent la borne et le balayage (aucun import de valeur dans `dojo-live.ts` ; chargeur autonome), ajoutés en fin de
  fichier, épinglés égaux à ceux de `dojo-chain.mjs` par test ; chaque lecture passe par leur `readJson`.
- **CLI** : le cœur ré-exporte `readJson` (la doctrine de la CLI : « the checks ... are the core's, imported and never copied ») ; l'épingle des
  exports du cœur passe de 9 à 10 noms.
- **Tests** : bornés à 16 et 17 niveaux, jamais la pile du moteur ; les tests 8 et 9 du lot VERIFY-NONFINITE (200 000 niveaux) ramenés à 17.
- **Mort de l'enfant** : 10 passages des deux fichiers sous charge après la borne ; le même protocole à la base, en témoin (§3).

## 2. Code (écrit après le §1)

Insertions et suppressions par fichier (`git diff --numstat`, journal exclu), sha256 du worktree :

- `apps/dojo/scripts/dojo-chain.mjs` (+37), `0a5e63a79205dc4e74c33040e12b365c15bd2dffe4a7ce6277deae160cf2842f` : `:139`, la garde de la marche, une ligne
  ajoutée après la première vérification de Bell (même code, `timeline_malformed`), avant `verifyLine` et `lineHash` ; en fin de fichier, `:176`
  `DOJO_MAX_DEPTH = 16`, `:179` `jsonDepth`, `:190` `readJson`, `:195` `depthOf` (pile explicite, arrêt dès la borne franchie). Les lignes 1 à 138
  ne bougent pas (l'éditeur cite `:33-37`) ; aucun import neuf (épingle `dojo_walk_imports_the_closed_list`).
- `apps/dojo/scripts/dojo-chain.d.mts` (+6), `6846ee64` : les trois déclarations.
- `apps/dojo/scripts/dojo-verify.mjs` (+8, -5), `6f92580c664b5497cfbf899424aee1154cd95ca9d9958846e070e309f61aff1a` : `:15` importe `readJson` ;
  `:152` (fichiers immuables), `:170` (`parse`, pour `dojo/pubkey.json`), `:175` (chronologie) lisent par `readJson` ; `:176`, le commentaire ;
  `:374-375`, le ré-export pour la CLI. Lignes citées par des tueries : `:70`, `:152` et `:175` gardent leurs textes cibles.
- `apps/dojo/scripts/dojo-verify.d.mts` (+2), `82f797c4` ; `apps/dojo/scripts/dojo-verify-cli.mjs` (+2, -2),
  `d3e8ba6522b1fa283864a30051f11100470308560b2fd897a9020ba156501f12` : `:9` importe `readJson` du cœur, `:80` lit le fichier `--keyring` par lui ;
  `:89` et `:94` (tueries) inchangées.
- `apps/site/lib/dojo-live.ts` (+22, -3), `9cb2f61de013c064c3911c13f79af43c6be215c894f882777ca0d36a0a17aa94` : `:240` et `:300` lisent par leur `readJson` ;
  `:294`, la note ; en fin de fichier, `:310` `DOJO_LIVE_MAX_DEPTH = 16`, `:313` `jsonDepth`, `:323` `readJson`.
- `apps/site/lib/dojo-served-load.ts` (+25, -5), `b09b6576efd149d0b83f410fdb273cc44ba6df8e8bb4307165fcacb8a97a2314` : `:183`, `parseJson` lit par son
  `readJson` ; `:250-253`, le commentaire de `walkable` remis exact (un texte trop profond n'atteint plus `lineHash`), quatre lignes pour quatre, donc
  `:256` (tuerie) ne bouge pas ; en fin de fichier, `:262` `DOJO_SERVED_MAX_DEPTH = 16`, `:265` `jsonDepth`, `:276` `readJson`. `:243` inchangée.
- Garde d'octets : 218 lignes ajoutées, aucune au-delà de 160 caractères, aucune barre oblique inverse ni TAB ; comptes de barres obliques
  inverses par fichier égaux à la base. Aucun mot de `KITCHEN_FORMS` ni du vocabulaire interdit dans les lignes neuves de `apps/site`.

Refus de chaque site au-delà de la borne (aucun code neuf, chacun déjà le sien pour un `null`) :

| Site | Refus |
|---|---|
| vérificateur, ligne de chronologie | `timeline_malformed` à sa seq, par la marche (`dojo-chain.mjs:138`, `l === null`) |
| vérificateur, ligne de `history/` ou `lines/` | `line_malformed`, `<fichier> line <n>` |
| vérificateur, `dojo/pubkey.json` | `keyring_invalid`, détail `dojo/pubkey.json` |
| CLI, fichier `--keyring` | `keyring_invalid`, détail `--keyring` (la CLI, avant tout parse) |
| marche, une valeur reçue | `timeline_malformed` à sa seq (`:139`) |
| navigateur, ligne de chronologie ou de fichier de lignes | repli `timeline_malformed` à sa seq ; `line_malformed` |
| chargeur, chronologie, clé servie, ligne de tête | phrase de la marche (`seq <n>: timeline_malformed`) ; `is malformed` ; `must be an object` |

## 3. Tests (4 neufs, 3 modifiés ; chacun sa ligne `// killer:`)

- **Modifiés.** `dojo_verify_names_a_value_nested_too_deep` (`apps/dojo/test/dojo-verify.test.ts`) : la profondeur suit la borne, plus la pile
  (chronologie : 16 lue puis `signature_invalid @12`, 17 `timeline_malformed @12` ; fichier de lignes : 16 `tier_mismatch`, 17 `line_malformed` ;
  épingles : ligne d'historique et `dojo/pubkey.json` à 17 ou plus) ; tuerie `dojo-chain.mjs:191 CONST "jsonDepth(text) > DOJO_MAX_DEPTH" -> "false"`.
  `dojo_served_build_names_a_line_the_walk_cannot_hash` (`test/dojo-live.test.ts`) : son cas profond passe de 200 000 niveaux à 17 (tuerie
  `dojo-served-load.ts:256` inchangée). `dojo_verify_core_imports_no_network_module` : dix exports, `readJson` le nouveau (tuerie `:12` inchangée).
- **Neufs.** `dojo_verify_cli_reads_no_keyring_past_the_depth_bound` (fichier `--keyring` à 16 : détail `the supplied keyring` ; à 17 : `--keyring`,
  jamais lu) ; tuerie `dojo-verify-cli.mjs:80 CONST "keyring = readJson(" -> "keyring = JSON.parse("`.
  `dojo_live_reads_no_text_past_the_depth_bound` (les trois bornes égales à 16 ; les trois `jsonDepth` égaux sur un corpus de cas piégés, échappements
  compris, et sur tout le texte servi du fixture ; relecture : 16 lue, 17 repliée à sa seq, ligne du préfixe comprise, ligne de fichier à 17
  `line_malformed`) ; tuerie `dojo-live.ts:324 CONST "jsonDepth(text) > DOJO_LIVE_MAX_DEPTH" -> "false"`.
  `dojo_served_build_reads_no_text_past_the_depth_bound` (ligne de tête à 17 : `head line 3 must be an object` ; `dojo/pubkey.json` : `is malformed`) ;
  tuerie `dojo-served-load.ts:277 CONST "jsonDepth(text) > DOJO_SERVED_MAX_DEPTH" -> "false"`.
  `dojo_walk_refuses_a_line_nested_past_the_bound` (`apps/dojo/test/dojo-chain.test.ts` : valeur à 16 marchée puis `signature_invalid`, à 17
  `timeline_malformed` ; `readJson` de part et d'autre de la borne ; un texte hors JSON lève) ; tuerie `dojo-chain.mjs:139 SDL`.
- **Tuerie réancrée.** Celle du test `dojo_live_falls_back_by_name_on_a_line_that_is_not_json` : `dojo-live.ts:240`, texte cible devenu
  `let l: unknown = null; try { l = readJson(raw);` (son corps n'a pas changé : non jugé par `red-proof`, rejoué à la main, §4).
- **Indépendance du moteur** : aucune entrée de test ne dépasse 19 niveaux (fichier de clé à 17 tableaux) ; `canonical` en écrit 3 148 ici.
- Nouvelles exportations lues par espaces de noms (`import * as chain`, `import * as load`) et première assertion sur la valeur de la borne : à la
  base, chaque test jugé rougit par assertion, jamais par un échec de chargement.

## 4. Exécution sur le clone `gel` et preuve F2P

- Clone `F:/tmp/dojo/depthbound/gel` : base, plus `gel.patch` (sha256 `d51dce6abb6bfbdabc546ba99fccacca98d3b21a0a7137707ab4b6ce63dcce56`), plus le
  commentaire corrigé de `dojo-served-load.ts` (copié, sha256 égal au worktree), plus le journal ; `node_modules` par `mk-nm.ps1`.
- Les trois fichiers touchés : 79 tests, 79 verts (`F:/tmp/dojo/depthbound/runs/gel-touched.tap`,
  sha256 `65e6b16a807f16fd79377ff3a712f0cb2d0b7bad1d7e45dbf6d8e7e466185f75`, 2026-10-01T05:01:43Z).
- `red-proof.mjs` du tronc (`--base 35930dc8 --gel F:/Monark-wt-depth-bound --repo F:/Monark --draw 10 --seed 20261001`, 05:02:10Z), **sortie 0** :
  `F:/tmp/dojo/depthbound/red-proof-1/RED-PROOF.json`, sha256 `dc550765bd5906de1c8e39f855b7db626437526a46830b2fe94433075fc024e3` (digest du gel
  `2fab4703`, hors `docs/**/*.md`) ; 7 jugés, **7 F2P** ; 7 tueries tirées sur 7 admises, **7 tuées** (`dojo-chain.mjs:191`,
  `dojo-verify.mjs:12`, `dojo-chain.mjs:139`, `dojo-served-load.ts:277`, `dojo-live.ts:324`, `dojo-served-load.ts:256`, `dojo-verify-cli.mjs:80`).
- Tuerie réancrée du test non jugé `dojo_live_falls_back_by_name_on_a_line_that_is_not_json`, rejouée comme `fire()` : `probe/killer-t10.mjs`
  (sha256 `d9eb7c99`), sortie `killer-t10.out` (`adaefe63`) : témoin `ok`, mutant `not ok` (`ERR_ASSERTION`), fichier restauré.
- Validité de toutes les lignes `// killer:` (`killers-valid.mjs`, `parseKiller` du tronc) : base 389, gel 393 (4 neuves) ; 22 invalides dans les
  deux, listes identiques, préexistantes, aucune dans le lot (`probe/base-killers.json` `3501cf6b`, `probe/gel-killers.json` `c5de93b6`).

## 5. La mort de l'enfant (VERIFY-TEST-DEAD-CHILD-1)

### 5.1 Protocole

`F:/tmp/dojo/depthbound/probe/load-passes.mjs` (sha256 `271c39b54ba04296f510cdc1022cc79e30abde480f3b7286e51a4f8011a307ae`) : un passage est un seul
`node --test` sur les 23 fichiers de test du Dōjō (`apps/dojo/test/*.test.ts` et `test/dojo-*.test.ts`, concurrence par défaut, donc 23 enfants), en
TAP ; avant chaque passage, verrou d'hôte libre et C-V-4 (40 `node.exe` au plus, 4 096 Mo libres au moins), sinon attente ; TAP et stderr gardés ;
chaque `not ok` de premier niveau relevé avec son YAML (`exitCode`, `signal`). `dojo-verify` et `dojo-live` tournent ainsi sous la charge des 21 autres.

### 5.2 Résultats

- **Témoin, base `35930dc8`** (où les tests à 200 000 niveaux tournent encore) : 10 passages sur 10 verts, 238 tests, 0 rouge ; `dojo-verify` rapporte
  ses 38 sous-tests à chaque passage, stderr vide (`F:/tmp/dojo/depthbound/passes-base/SUMMARY.json`,
  sha256 `f8da64fe5016ef0419a70e6f195158220e5c61b3da1ee08411a6c968fb74c6eb`,
  04:25:37Z à 05:01:15Z ; deux attentes de la garde d'hôte, de 13 et de 7 minutes).
- **Après la borne (`gel`) : la mort revient.** 9 passages verts sur 10 (242 tests) ; au passage 9 (05:11:21Z), `apps/dojo/test/dojo-verify.test.ts`
  meurt au niveau du fichier après 17 721 ms : `exitCode: 3221226505` (**0xC0000409**), `signal: ~`, aucun sous-test rapporté, stderr vide
  (`passes-gel/SUMMARY.json` `1037841e568f11a8e75974f4de87e26cb2cb21f8f898c409556f534703417e0f`, `pass-09.tap` `c292ac82`). `dojo-live` : 10 sur 10.

### 5.3 Recherche de la cause (mesures)

- **0xC0000409 n'est pas l'arrêt de Node.** Sur ce Node, `process.abort()` et une erreur fatale (mémoire épuisée) sortent en 134, l'erreur fatale avec
  son message et son rapport de diagnostic (`F:/tmp/dojo/depthbound/reports-check/`). 0xC0000409 est un fast-fail natif (contrôle de pile, paramètre
  invalide de la bibliothèque C, `std::terminate`) qui court-circuite Node : ni message ni rapport.
- Le journal des événements Windows ne garde aucun « Application Error » ni rapport WER pour `node.exe` sur 24 heures : ce poste ne les consigne pas.
- **Le runner ne perd pas les rapports d'un enfant qui meurt** : `crash-sim/` (trois tests, une ligne sur stderr, puis `process.abort()`, derrière un
  fichier lent) : tout est rapporté, la pile de l'arrêt comprise (`sim.tap` `43423bb6`). L'absence de tout rapport s'explique par l'écriture
  asynchrone sur un tube sous Windows (Q-7) : un runner lent, tenu par 22 autres enfants, laisse les événements en file dans l'enfant, perdus à sa mort.
- **Pas la récursion de `canonical`** : 16 processus, 100 débordements chacun, 16 survivants (`crash-load-1.json`, §1.5).
- **Pas `rmSync` natif sur une jonction** (le test de lien crée une jonction vers `apps/`, effacée en fin de fichier) : 12 processus, 200 arbres à
  jonction chacun, 12 survivants, cible factice intacte (`probe/exp-rm-1.json` `bf589cd1`).
- **Hors du runner à plusieurs fichiers, aucune mort** : 30 lancements directs concurrents (`exp-direct-force/SUMMARY.json` `97181def`), 30 runners
  du seul fichier (`exp-runner-force/SUMMARY.json` `ae1c97cd`), 20 passages où `dojo-verify` tourne en direct sous la charge des 22 autres fichiers
  (`exp-mix/SUMMARY.json` `e802915c`) : 0 sur 80. Dans le runner à plusieurs fichiers : 1 sur 20 (base et gel).
- **L'historique des oracles de cette machine** (179 dossiers) montre une autre mort de fichier après plus de 5 s : `test/probe-narabi.test.ts`,
  2026-09-29T03:21:31Z, passage G7, avant les lots VERIFY-NONFINITE et DEPTH-BOUND (`probe/oracle-long-deaths.txt` `15a71587`).
- **Conclusion, dans la mesure de ce qui est mesuré** : la borne ne cause ni ne guérit cette mort ; c'est un arrêt natif rare d'un enfant du runner,
  qui ne tient pas au code du lot et touche d'autres fichiers ; sa cause racine n'est pas établie : item et procurement (Q-6).

### 5.4 Limites du protocole

- La charge est celle du sous-ensemble Dōjō (23 fichiers), pas de la suite entière (environ 200) ; la mort d'origine : un passage complet sur cinq.
- Les passages et les expériences ont tourné avant le retrait d'une variable inutilisée dans un test (§6) : le code de production est identique.

## 6. Portes statiques et R-25

- Premier passage de l'oracle statique (2026-10-01T05:52:45Z) : `lint` à 1, `test/dojo-live.test.ts:446`, `k` inutilisé dans mon test ; corrigé
  (`const { f, c }`) ; enregistrement `F:/tmp/oracle-results/35930dc8a57838d9609bfc0c6637b1542b2f58da-a5ee90b54fcc145e-G1-20261001T055245Z-354392.json`.
- Rejoués après la correction : les trois fichiers touchés, 79 sur 79 (`runs/gel-touched-2.tap` `08cc27f9`) ; `red-proof`, sortie 0,
  `F:/tmp/dojo/depthbound/red-proof-2/RED-PROOF.json` sha256 `3ad945eaeec3ba053e758cc6156ae5bef4fb13ccb71f104b42680a8448e3db41` (digest `ca62c1d9`) :
  7 jugés, 7 F2P, 7 tueries tirées sur 7, 7 tuées.
- Oracle du tronc `--role G1 --static-only`, 05:56:05Z :
  `F:/tmp/oracle-results/35930dc8a57838d9609bfc0c6637b1542b2f58da-78ddca685f766c8e-G1-20261001T055605Z-380756.json`,
  sha256 `773ca5df4cefad49b9239d679426f21daa7fa47bf40a8a5769902143f4ecf340` : sortie 0 ; `typecheck`, `lint`, `lint:ratchet` (69/69, la base aussi),
  `lang:gate`, `export:check`, `gate:vocab` à 0, `lint-model-pinning` et `r25` aussi.
- **R-25** par `r25.mjs` : 222 insertions et 29 suppressions, **251** lignes (borne de la mission 1 150, porte 1 205) ; le journal est hors du compte.
  Le rejeu sur l'arbre final, ce journal achevé, est cité dans `F:/tmp/dojo/depthbound-deliver/REPONSE.md`.

## 7. Q-n (aucune dette nue : décision demandée, item formé ou procurement)

- **Q-1, règle de compte** : un site lit un texte servi par `JSON.parse` ; pour la marche, l'entrée d'une ligne avant `canonical` (§1.2) ; le grep
  rejouable donne tout autre compte.
- **Q-2, la marche** : elle reçoit des valeurs, pas de texte ; sa garde mesure la valeur (pile explicite, sans récursion) avant `verifyLine` et
  `lineHash`. Les lecteurs de texte (vérificateur, CLI, navigateur, chargeur) ne lui passent jamais une ligne trop profonde ; la garde couvre aussi
  la marche de l'éditeur sur sa chronologie privée.
- **Q-3, ordre du refus au vérificateur** : une ligne de chronologie trop profonde est refusée par la marche, par la même voie qu'une ligne `null`
  servie, après la lecture de `dojo/pubkey.json` et du trousseau : même code, même seq, `day: null` ; si le fichier de clé était injoignable,
  `unreachable` passerait d'abord. Le navigateur et la CLI refusent à la lecture même.
- **Q-4, non balayés (hors des cinq sites)** : `loadDojoServed` (l'enregistrement ENGAGÉ, profondeur 5 mesurée, vérifié par son sha256 contre le
  manifeste avant tout parse) ; les lectures propres de l'éditeur `dojo-publish.mjs` (paquets du collecteur, état privé), dont la marche est couverte.
- **Q-5, écarts de méthode** : (a) le heredoc de `load-passes.mjs` portait une expression régulière à deux barres obliques inverses (retour
  chariot facultatif, saut de ligne) : vue par la garde d'octets avant
  tout lancement, réécrit sans ; (b) des lignes de commande portaient des échappements (filtre PowerShell, une expression régulière, un `node -e`) :
  pas des heredocs, aucun fichier livré ; (c) le premier oracle statique rouge en `lint` (§6), corrigé et rejoué.
- **Q-6, item formé VERIFY-TEST-DEAD-CHILD-2, et demande de procurement** : la mort revient (1 sur 10) ; sa cause racine n'est pas établie ; la nommer
  demande un vidage mémoire de l'enfant au fast-fail. Demande au mainteneur : (i) autoriser sur cet hôte la clé WER `LocalDumps` pour `node.exe`
  (`DumpType` 2, dossier sous `F:/tmp/`), ou fournir Sysinternals ProcDump (capture sur exception de premier niveau) ; (ii) fournir un débogueur
  (Debugging Tools for Windows : `cdb` ou WinDbg) pour lire la pile native. Tentatives faites : journal des événements (rien), rapport de diagnostic
  de Node (inopérant sur un fast-fail), cinq expériences (§5.3). Usage : nommer le module et la fonction fautifs, puis choisir (mise à jour de Node,
  contournement dans le runner, rejeu d'un fichier mort). D'ici là : un fichier mort sans rapport se lit « non conclu », comme `red-proof` le fait.
- **Q-7, item d'outillage proposé ORACLE-DEAD-CHILD-EXITCODE-1** : l'oracle écrit la suite au rapporteur `spec`, qui tait le code de sortie d'un fichier
  mort (le record d'origine n'en donnait aucun) ; un second rapporteur TAP vers un fichier ferait nommer à chaque mort son code et son signal.
  L'écriture asynchrone sur tube est une lecture du mécanisme de Node sous Windows, non mesurée directement ici.

Git : aucun `GIT_DIR` ni `GIT_WORK_TREE`, aucun `--write-tree` ; lectures du worktree sous `GIT_OPTIONAL_LOCKS=0` ; écritures git seulement dans mes
clones sous `F:/tmp/dojo/depthbound/` (checkout, apply) et dans les clones des outils du tronc (gel de l'oracle, clones de `red-proof`).
