claude-opus-5-5

# G1 — journal du lot Dōjō PR-3a-2 « publication de l'historique par l'éditeur » (ADR-DOJO-PR-3)

- **Modèle résolu (R-1)** : `claude-opus-5-5` (identifiant déclaré par le système), effort max (mission), contexte frais. Implémenteur G1 ;
  ne committe pas, ne lance aucun workflow (R-20) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`.
- **Mission** : `F:/tmp/dojo/mission-impl-pr3a2.md` (57 l., 16 198 octets), sha256 recalculé AVANT lecture (23:29:58Z) =
  `5aa2df7b8ca233c956e27843a1c8f2060f3f50bc70e17f700d2123778951aeb1`, égal au reçu `F:/tmp/dojo/mission-impl-pr3a2.recu.json`
  (`1cbbf729…57ba` ; verdict `vert`, 12 codes à 0, base = head = `f4ebcf5b`).
- **Worktree** : `F:/Monark-wt-dojo-pr3a2`, branche `lot/dojo-pr3a2`, HEAD `f4ebcf5b538c1d70a6e8aa0774b2374619d2040f` ; `git status`
  (`--no-optional-locks`) propre à l'ouverture ; fins de ligne LF (`git ls-files --eol` : `i/lf w/lf`, 0 octet CR, 0 TAB dans les quatre
  fichiers à modifier).
- **Décision 300** (ADR l.438-442) : ce lot livre du code et ses tests verts ; ni F2P, ni mutants, ni oracle (l'inspection finale les
  fera). Les tests sont écrits pour elle : liaison tardive, appels enveloppés, une ligne `// killer:` au format de `parseKiller`.

## Horloge (`date -u`)

23:29:58Z (sha256 de la mission, avant lecture) ; 23:30:24Z (verrou d'hôte lu : `owner.txt` rôle G1, pid 443812 vivant, aucun test) ;
23:49:35Z (empreintes des entrées) ; 23:52:47Z (verrou libéré, pid 443812 disparu, 12 `node`) ; heure de fin et empreinte finale : hors du
fichier (`F:/tmp/dojo/pr3a2-deliver/REPONSE.md`).

## Lu (sha256 recalculés à 23:49:35Z)

| Entrée | sha256 | Lecture |
|---|---|---|
| mission (57 l.) | `5aa2df7b8ca233c956e27843a1c8f2060f3f50bc70e17f700d2123778951aeb1` | en entier |
| `docs/methode/REGLES-MISSION.md` (18 l.) | `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335` | verbatim dans la mission |
| `docs/adr/ADR-DOJO-PR-3.md` (442 l.) | `e13d6784eb337dc18e4d94e4e311dc2deb2c116715bbe98b149293a1de2184a6` | en entier |
| `docs/adr/ADR-DOJO-PR-2B.md` (1 003 l.) | `222c13251a067412c08a9424c3be1faebf1c9f4222c27ce6b07e6965e1b816cb` | D-12 (l.441-474), lignes datées l.939-1003 |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` (1 367 l.) | `cd976054b22837b0aeef1d50fdafcd360f768b7c97a4241e583a2ee6769111ec` | T-9 (l.429 : M-E4), l.415, l.495 |
| `apps/dojo/scripts/dojo-publish.mjs` (380 l.) | `2350af49a303d0af24117b92836181d52b5f8adbe9aebb8435ab7367408c4030` | en entier |
| `apps/dojo/scripts/dojo-publish.d.mts` (35 l.) | `67181623ac597b127d95bb6d212c8d7a2ad9b1f51b162482dab3efd0736529fa` | en entier |
| `apps/dojo/scripts/dojo-verify.mjs` (372 l.) | `ef6d15b21239e3a78ebb874c654b6e7a5ba2ecb5952ba1fd5b794d3d42f6c49f` | en entier |
| `apps/dojo/scripts/dojo-chain.mjs` (168 l.) | `04411fa71b2cfd365ef7023161d82e0fa65f9f4904b27964caf78b4b39ca7123` | en entier |
| `apps/dojo/src/history-collect.ts` (451 l.) | `11a45354a75a3eb566d025fedd138011b7896e6ab710aed00bc4fd3fd008e7a0` | l.1-30, 140-170, 380-451 (`publish/`) |
| `apps/dojo/src/history-build.ts` (256 l.) | `e42db6a812c4b44dd0e818f036f72465c8b301af0974a20b9916ed6527bb46e4` | l.1-60, l.200-256 (`historyBundle`) |
| `apps/dojo/src/layout.ts` (97 l.) | `75abccd62961a0b364e35bd428645abb09552ff26e99ec61e6627a599dd96f2e` | en entier (lecteur du jour, modèle) |
| `apps/dojo/test/dojo-publish.test.ts` (595 l.) | `2ba9d543f4e1877ff7469e012510f8f8d287eb718db0853243be87f94bfd8007` | en entier |
| `test/dojo-publish-e2e.test.ts` (130 l.) | `7da1428076d4951c3a636cad4e21f4e893bfd9fa3f5401165ad3ad12f5315d77` | en entier |
| `test/dojo-history-e2e.test.ts` (112 l.) | `2e34ef6206e0963f4a97fae7a215225a836bc07897eb079a5b7aabb2e2a3b49b` | en entier (collecteur vers vérificateur) |
| `apps/dojo/test/helpers/dojo-fixture.ts` (334 l.) | `2e9e04b79dc4e6755f81b2e390248d56bbeb1885a19e2a7e46c06e23ab9b7e1d` | exports |
| `F:/Monark/scripts/red-proof.mjs` (268 l.) | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | l.1-60 (`parseKiller` l.46-49) |
| `F:/Monark/scripts/oracle/r25.mjs` (28 l.) | `4d0544dfe6c3cb316f014265aee51771547841cbbe99a23713c4365154827cf0` | en entier |
| `F:/Monark/scripts/oracle/run.mjs` (173 l.) | `f22b90459b54cf0fd2eff1e9d556b4676b57a2e82d766cd9342aa3619cb2a41b` | recette du clone gelé (l.91-104) |
| `.github/workflows/ci.yml` (206 l.) | `0f401ae2da253b76b7306322c85a5ddbd887ca675b0bedbbb4e43504dc8c949a` | l.75-100 (pathspec R-25) |
| `docs/G1-lot-dojo-pr3a1c.md` (671 l.) | `ebb0330cfbe8198d6f8822c3146d41ee9b204a8e205eb6f38ea0c46f8fcee40c` | forme du journal et du compte |
| `F:/tmp/dojo/drand-1a/mk-nm.ps1`, `rm-nm.ps1` | `d70d8aea…31fbe4`, `b51b5d22…368749` | en entier |

Outils de la mission recalculés dans le worktree : `lint.mjs` `4d1383c8…f808`, `launch.mjs` `fb6c277f…ae3d`, `run.mjs` `f22b9045…a41b`,
`r25.mjs` `4d0544df…7cf0`, `red-proof.mjs` `6579b550…ab36` : égaux à la mission.

## Constats mesurés (avant le compte)

- **É-1 — aucun lecteur du paquet d'historique n'existe.** `history-build.ts` écrit le paquet (`historyBundle`, l.235-256 : `publish/` =
  `history/<sha256>.jsonl`, `manifest.json`, `eve.json`, puis `SHA256SUMS` des trois en ordre d'octets) ; aucun module n'exporte de
  lecteur. Le lecteur « avec son contrôle » naît donc dans l'éditeur (périmètre fermé de la mission) ; seul lecteur d'une seule forme
  (FM-1.1), sa dérive contre l'écrivain est tenue par l'e2e qui lance le VRAI `historyBundle`.
- **É-2 — contrôle (ADR PR-2B D-12 l.474 et ligne datée 11:53Z)** : `SHA256SUMS` qui vérifie (quatre fichiers, chemins relatifs à
  `publish/`), statut `complete`, lignes canoniques et triées, racine recomputée. Les trois derniers points sont ceux de
  `readImmutable` du vérificateur (`dojo-verify.mjs:144-162` : compte, sha256, formes, ordre, racine) : la VAE les juge sur la ligne
  bâtie depuis le manifeste ; le lecteur tient `SHA256SUMS`, le manifeste (clés fermées, `complete`, trois contrôles `pass`) et le nom.
- **É-3 — marcheur** : une seconde ligne `history` est refusée (`dojo-chain.mjs:116`, `timeline_malformed`) et tout `snapshot` exige la
  ligne `history` (l.93) : `snapshot` implique `history`. La garde « après un `snapshot` » doit donc précéder la garde « seconde ligne »,
  sinon elle est morte (mutant équivalent). Deux codes distincts.
- **É-4 — seul le vérificateur refuse une histoire finie avant le jour de l'ancre** (`dojo-verify.mjs:197`, DOJO-WALK-GAPS-1 (b)) ; le
  marcheur l'admet (`dojo-chain.mjs:114-119`) : cas de test où la VAE seule garde l'engagement (ligne irréversible).
- **É-5 — la ligne `history` ne porte ni `mint` ni `program`** (`FIELDS.history`, `dojo-verify.mjs:89`) : le lien paquet ↔ ancre en
  vigueur (manifeste `mint`, `program`) n'est vérifiable que par l'éditeur ; refus existant `bundle_anchor_mismatch` repris.
- **É-6 — Eve** : `eve.json` = adresses des lignes du dernier jour, `accounts` vide (`history-build.ts:221-222`), octets canoniques + LF ;
  elle devient l'Eve du premier jour lu (A-11) ; une Eve qui omet une adresse à pile fait refuser ce jour pour toujours (`eve_mismatch`,
  `dojo-publish.mjs:219`) après une ligne `history` irréversible : comparée aux lignes du dernier jour AVANT l'engagement.
- **É-7 — ancres des tueurs** : plus haute ligne visée par un tueur existant = l.336 (`dojo-publish.test.ts:274`) ; e2e : l.228. Lots
  parallèles lus (lecture seule) : ENTRY-MAIN-LINK-1 (`F:/Monark-wt-entrylink`, `0bf2afc0`) modifie l.12, l.15 et la fin du fichier ;
  écrivain unique (`F:/Monark-wt-single-writer`, `ae330bf4`, arbre propre à 23:4x) : `openState`. Placement retenu : bloc neuf après la
  l.336, éditions sans décalage au-dessus (l.8, l.25-26, l.29) ; l.12, l.15, l.96-135 et la fin non touchées : aucun tueur existant
  renuméroté.
- **É-8 — C-V-4 à l'ouverture** : 34 `node` ; mémoire libre 11 234 Mo, virtuelle 27 301 Mo (`Get-CimInstance Win32_OperatingSystem`) ;
  verrou tenu par pid 443812 (sha du G0 ENTRY-MAIN-LINK-1 `a75f7f5d`) jusqu'avant 23:52:47Z.

## Compte ascendant par fichier (tâche 1, AVANT tout code)

Unité : insertions + suppressions prévues, celle de `r25()` (`git diff --shortstat`, sans `-M`, `-C`, `-B`) ; une ligne modifiée compte 2.
Lignes citées = base `f4ebcf5b`. Seuil de la mission : moins de 547 ascendantes (sinon arrêt avant le code).

**`apps/dojo/scripts/dojo-publish.mjs`** (380 l.) : **62**

| Composant | Lignes de base | + / − | Compte |
|---|---|---|---|
| en-tête : mode `--history <packet>` | l.8 | +1 / −1 | 2 |
| `HISTORY` (quatre codes neufs) à la place du bloc de doc de `PASSED`, repris en commentaire de fin de ligne | l.25-26 | +2 / −2 | 4 |
| `...HISTORY` dans la liste fermée (l.29 : 146 + 12 = 158 caractères) | l.29 | +1 / −1 | 2 |
| `HISTORY_LINE` (cinq champs de la ligne, doublon déclaré de `FIELDS.history`) | après l.336 | +2 | 2 |
| `MANIFEST` (26 clés fermées, doublon déclaré du littéral de `historyBundle`) | après l.336 | +6 | 6 |
| `readHistory()` : `SHA256SUMS` seule entrée, trois chemins, sha256 en octets (M-E12), manifeste, nom du fichier | neuf | +19 | 19 |
| `publishHistory()` : gardes (`no_timeline`, `history_after_snapshot`, `history_exists`), ancre, ligne, VAE, Eve, engagement | neuf | +19 | 19 |
| séparateur | neuf | +1 | 1 |
| CLI : `USAGE`, `MODES`, `VALUED` (lignes tenues sous 160) | l.337, 339, 341 | +3 / −3 | 6 |
| CLI : aiguillage `--history` | après l.368 | +1 | 1 |

**`apps/dojo/scripts/dojo-publish.d.mts`** (35 l.) : **5** — doc (2) et déclaration de `publishHistory` avec son résultat (3).

**`apps/dojo/test/dojo-publish.test.ts`** (595 l.) : **96**

| Composant | Lignes de base | + / − | Compte |
|---|---|---|---|
| imports étendus : `DOJO_VERIFY_REFUSALS`, `DOJO_PUBLISH_REFUSALS`, `DOJO_BUNDLE_REFUSALS`, `DOJO_LAYOUT_REFUSALS` | l.18, 20, 22, 24 | +4 / −4 | 8 |
| imports neufs : `historyBundle`, `DOJO_HISTORY_CREATION` (présents à la base : aucun rouge d'import) | neuf | +2 | 2 |
| `publishHistory` lié tard (absent à la base : appels enveloppés) | l.305 | +1 / −1 | 2 |
| `World.hl` et retour de `world()` (hors des corps de test) | l.322, l.344 | +2 / −2 | 4 |
| `packet()` : paquet écrit par le VRAI `historyBundle` | neuf | +11 | 11 |
| `repack()` : un fichier du paquet réécrit et sa somme | neuf | +5 | 5 |
| T-H1 `dojo_publish_history_before_the_first_snapshot` (M-E4) | neuf | +25 | 25 |
| T-H2 `dojo_publish_history_reads_the_packet_with_its_check` (M-E12, VAE, ancre, Eve) | neuf | +24 | 24 |
| T-H4 `dojo_publish_refusals_list_is_every_code_raised` (DOJO-PUBLISH-REFUSALS-LIST-1) | neuf | +11 | 11 |
| lignes vides entre tests | neuf | +4 | 4 |

**`test/dojo-publish-e2e.test.ts`** (130 l.) : **54**

| Composant | Lignes de base | + / − | Compte |
|---|---|---|---|
| en-tête : l'historique n'est plus une doublure (3a1b/Q-V-2) | l.6 | +1 / −1 | 2 |
| imports : `historyBundle`, `DOJO_HISTORY_CREATION`, `dirname` | neuf ; l.13 | +3 / −1 | 4 |
| `World.pkt` | l.54 | +1 / −1 | 2 |
| doc de `world()` | l.55-58 | +2 / −2 | 4 |
| `world()` : doublure (7 l.) remplacée par le VRAI écrivain et la CLI `--history` (synchrone : corps de TU-1c intact) | l.66-72 | +2 / −7 | 9 |
| retour de `world()` | l.73 | +1 / −1 | 2 |
| `packet()` (doublon déclaré de celui du test unitaire) | neuf | +10 | 10 |
| T-H3 `dojo_history_publish_to_verify_end_to_end` (TU-12c) | neuf | +20 | 20 |
| ligne vide | neuf | +1 | 1 |

**Total : 62 + 5 + 96 + 54 = 217 < 547** : aucun arrêt ; projection × 2,31 = 501,3 ≤ 1 150 (STOP de R-25).

- **Calibrage contre le plan (≈ 90, D-1 l.67)** : +127, chaque part nommée : VAE et Eve (neuves, PC-7 et É-6) ; clés fermées du manifeste
  (É-2) ; test de la liste des refus (DOJO-PUBLISH-REFUSALS-LIST-1, neuf) ; forme F2P des tests (liaison tardive, enveloppes) ; `packet()`
  en deux exemplaires (unitaire, e2e) ; TU-1c rejoué sur le vrai écrivain (3a1b/Q-V-2).
- **Ce qui ne sera pas fait, et pourquoi** : aucun fichier étranger refusé sous `publish/` (il faudrait `readdirSync` à la l.12, ligne de
  ENTRY-MAIN-LINK-1 ; un tel fichier n'est ni lu ni servi) ; aucune borne de 64 Mio sur le fichier candidat (DOJO-PUBLISH-SCALE-1,
  réponse Q-G2-2 : objet déjà formé) ; aucune garde « dernier jour d'historique révolu » (hors des décisions ; le paquet n'existe qu'après la
  clôture du premier jour lu) : Q-n du § de fin.

## Plan (décision → fichier → test)

| Décision (mission) | Fichier | Test |
|---|---|---|
| mode de publication du paquet d'historique, lu AVEC son contrôle | `dojo-publish.mjs` (`readHistory`, `publishHistory`, CLI), `.d.mts` | T-H2, T-H3 |
| fichier et ligne vérifiés ensemble par le vrai `verifyDojoServed` avant tout ajout ; refus nommé | `dojo-publish.mjs` (`checked`) | T-H2 (É-4, racine) |
| une seule ligne `history` par chronologie, avant tout `snapshot` | `dojo-publish.mjs` (deux gardes, É-3) | T-H1 |
| fichier durable avant la ligne (M-E4) | `dojo-publish.mjs` (`commitLine` réemployé) | T-H1 (journal des écritures) |
| DOJO-PUBLISH-REFUSALS-LIST-1 | `dojo-publish.mjs` (`HISTORY` dans la liste fermée) | T-H4 |
| chaîne paquet → éditeur → vérificateur, TU-1c sur le vrai écrivain | `test/dojo-publish-e2e.test.ts` | T-H3, TU-1c |

## Fin du G1 (tâches 2 à 5) — `date -u` 00:15:52Z

### Livré : décision → fichier → test (lignes de l'arbre du worktree)

| Décision (mission) | `dojo-publish.mjs` | Test (tueur) |
|---|---|---|
| paquet lu AVEC son contrôle : `SHA256SUMS` seule entrée, trois chemins en ordre d'octets, sha256 en octets | l.350-366 | T-H2 (l.359 SDL, M-E12) |
| manifeste : canonique, 26 clés fermées, `complete`, trois contrôles `pass`, fichier nommé par `history_sha256` | l.342-346, 361-365 | T-H2 |
| une ligne `history`, avant tout `snapshot` : `history_after_snapshot` PUIS `history_exists` (É-3) ; `no_timeline` | l.374-376 | T-H1 (l.375 SDL, M-E4) |
| ancre en vigueur : `mint` et `program` du manifeste, refus `bundle_anchor_mismatch` repris (É-5) | l.378 | T-H2 |
| ligne et fichier vérifiés ENSEMBLE par le vrai `verifyDojoServed` avant tout ajout (`checked`, PC-7) | l.381 | T-H2 (racine, É-4) |
| Eve du premier jour lu = adresses du dernier jour, avant l'engagement (É-6) | l.382-383 | T-H2 |
| fichier durable dans `staging/` avant la ligne, servi après (M-E4) | l.384 (`commitLine`) | T-H1 (journal) |
| CLI `--history <packet> --state <dir>` | l.389-393, 421 | T-H3 (l.391 CONST) |
| DOJO-PUBLISH-REFUSALS-LIST-1 : `HISTORY` (quatre codes) dans la liste fermée | l.25, 29 | T-H4 (l.25 CONST) |
| paquet du vrai `historyBundle` → CLI `--history` → vrai vérificateur ; TU-1c sur cet écrivain ; Eve du paquet par `readEve` | e2e | T-H3 (TU-12c), TU-1c |

- Tests neufs : T-H1 `dojo_publish_history_before_the_first_snapshot` (l.628), T-H2 `dojo_publish_history_reads_the_packet_with_its_check`
  (l.655 : 18 cas, un par clause du contrôle ; l'histoire finie avant le jour de l'ancre ; le paquet intact publié), T-H4
  `dojo_publish_refusals_list_is_every_code_raised` (l.688), dans `apps/dojo/test/dojo-publish.test.ts` ; T-H3
  `dojo_history_publish_to_verify_end_to_end` (l.147) dans `test/dojo-publish-e2e.test.ts`. Libellés en anglais.
- **Forme pour l'inspection finale** (décision 300 : F2P, mutants, oracle non faits ici) : `publishHistory` lié tard (l.294 du test) ; premier
  appel de chaque test enveloppé (`okA`, `refusesA` ; code de sortie de la CLI asserté dans `world()` de l'e2e) : à la base, rouge par
  assertion PRÉVU, NON MESURÉ (décision 300) ; T-H4 : rouge prévu à la base par sa dernière assertion (codes de `--history` absents de la
  liste), son égalité y restant verte (prévu, non mesuré) ; MESURÉ : aucun corps de test existant modifié (TU-1c intact : `world()` reste
  synchrone par la CLI) ; 19 tueurs existants valides sans renumérotation, 4 neufs : 23 vérifiés par `parseKiller` du tronc et la règle de
  `killerProblem` (`tools/killers.mjs`, `runs/killers.txt`).

### R-25 (mesuré par `r25()` de `F:/Monark/scripts/oracle/r25.mjs`)

- Clone de mesure `F:/tmp/dojo/pr3a2/c1` (`git clone --no-local`, `core.autocrlf=false`), base `f4ebcf5b` détachée, diff du worktree appliqué,
  journal copié, empreintes égales au worktree ; commits de gel DANS CE CLONE seulement (recette de `run.mjs` l.99-103). Gel 2 `a4b93e62`
  (arbre `feb7c133`) : **223 insertions + 30 suppressions = 253** ≤ 1 150 (STOP) et ≤ 1 205 (`VIBEGATES_PR_LIMIT`) ; CONTENT 0 ; GREEN.
- Par fichier (`--numstat`) : module +60/−7 = 67 (compté 62) ; `.d.mts` +4 (5) ; test unitaire +107/−6 = 113 (96) ; e2e +52/−17 = 69 (54) ;
  journal hors compte (`docs/G1-lot-*.md`, `ci.yml:82`). **253 contre 217, × 1,17.** Écarts : T-H2 porté à un cas par clause (revue adverse,
  +11) ; imports de l'e2e (quatre lignes au lieu d'une : `appendFileSync`, `keyIdOf`, `lineHash`, `signLine` devenus inutiles) ; `readEve`.
- Gel 1 `b816d7a2` (avant la revue adverse) : 215 + 29 = 244 (`runs/r25.txt`). Le clone a été bâti par `F:/tmp/dojo/pr3a2/dirty.patch`
  (`git diff --binary` du worktree, entre 00:00:48Z et 00:01:48Z, sha256 `79e17fb46f9b2e8435cf30079eed5b9caaa9866f664a48a0b8b4e6237fc70392`), mis à jour
  par copie des quatre fichiers (empreintes égales) ; il porte une copie du journal antérieure à cette fin, hors compte.

### Tests (clone ; TMP, TEMP, TMPDIR = `F:/tmp/dojo/pr3a2/tmp` ; verrou libre et C-V-4 relevé avant chaque course)

- run2, 00:06:28Z-00:06:45Z (9 `node`, 14 904 Mo libres) : éditeur (unitaire, e2e), vérificateur (`dojo-verify.test.ts`,
  `dojo-verify-url.test.ts`), `dojo-history-e2e.test.ts` : **58/58**.
- run3, 00:10:20Z-00:11:10Z (10 `node`, 15 112 Mo) : tous `apps/dojo/test/*.test.ts`, tous `test/dojo-*.test.ts`, `test/ci-gates.test.ts` :
  **222/222** ; le test 42 (`test/export-public.test.ts:142`) n'y est pas.
- Diagnostic hors dépôt `tools/diag-cases.mjs` : chaque cas de T-H2 atteint la clause qu'il nomme (code et détail imprimés), le paquet
  intact est publié (`runs/diag-cases.txt` ; rejoué après réécriture de l'outil : `runs/diag-cases-2.txt`, identique).

### Portes statiques (clone, 00:07:33Z-00:08:46Z, après la revue adverse)

`typecheck` 0, `lint` 0, `lint:ratchet` 0 (69/69), `lang:gate` 0, `export:check` 0, `gate:vocab` 0 (328 fichiers) : `runs/gate2-*.log`.

### Conduite et écarts

- git : lecture seule dans le worktree et le tronc (`--no-optional-locks`) ; écritures git dans le seul clone de mesure (deux commits de
  gel) ; aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun réseau ; rien sur C:.
- Lecture seule de deux worktrees parallèles (É-7) : `git diff f4ebcf5b 0bf2afc0` (ENTRY-MAIN-LINK-1), `git status` (écrivain unique).
- Jonctions `node_modules` posées par `mk-nm.ps1` (220 entrées, 11 `@monark`, 0 échec), retirées par `rm-nm.ps1` à 00:14:35Z ;
  `F:/Monark/node_modules` inchangé (218 entrées visibles et 11 `@monark`, avant et après).
- **J-1** : les douze `npm run` des portes ont écrit leurs journaux de débogage dans le cache partagé `F:/cache/npm/_logs` (rotation de npm
  à 10) ; l'oracle du tronc les dirige vers son dossier de run et pose `npm_config_offline=true` (`run.mjs` l.136) ; ni C: (cache sur F:)
  ni réseau (`_update-notifier-last-checked` inchangé depuis le 2026-09-24 16:24 heure locale, contrôle hebdomadaire) ; run3 posait les deux.
- **J-2** : mes outils hors dépôt (`guard`, `killers`, `r25-run`, `diag-cases`) portaient d'abord des barres inverses (écrits par l'outil
  d'écriture, jamais par heredoc) ; réécrits sans barre inverse, sorties rejouées identiques (`diag-cases-2.txt`, `r25-3.txt`).
- **J-3** : trois lignes de ce journal au-delà de 160 caractères, vues par la garde avant tout code, repliées (23:54:31Z).
- Observé, non touché : `git count-objects` signale `garbage found: F:/Monark/.git/worktrees/Monark-wt-dojo-pr3a2/refs`.

### Questions à l'orchestrateur (Q-n)

- **Q-1 (tueurs à l'intégration)** : les numéros valent pour cet arbre. L'écrivain unique (insertions dans `openState`, l.96-135) décalera
  les cibles l.146 à 336 et trois des quatre tueurs neufs (l.359, 375, 391 ; la l.25 non) ; ENTRY-MAIN-LINK-1 remplace la l.15, texte du
  tueur de `dojo_publish_imports_no_network_module`. Réancrage sur la branche intégrée, avant l'inspection finale.
- **Q-2 (conflits textuels)** : lignes de ce lot exposées : l.8 (en-tête), l.25-26 et l.29 (liste fermée, où l'écrivain unique ajoutera
  vraisemblablement son code), l.389-393 et l.421 (CLI) ; aucune des l.12, 15, 96-135 ni de la fin du fichier.
- **Q-3 (écrivain unique)** : `publishHistory` appelle `openState`, `checked` et `commitLine` comme `publishDay` ; toute prise ou
  libération de verrou par mode doit couvrir `--history` ; TB-13 vaut ici aussi (l'attente de la VAE).
- **Q-4 (DOJO-VERIFY-NONFINITE-1, proposé ; PAROXYSME)** — MESURÉ (`tools/diag-nonfinite.mjs`, `runs/diag-nonfinite.txt`) : une ligne
  d'historique portant `1e400` (somme, compte, racine et Eve cohérents) fait lever `Error: non-finite number in digest`, sans code, dans
  la VAE : rien d'écrit (fail-closed), mais un refus NON nommé (CLI : `fatal`). Cause lue : `readImmutable` appelle `canonical(o)` (Bell,
  `bell-chain.mjs:17` : un nombre non fini lève) avant le contrôle de forme (`dojo-verify.mjs:153`) ; `verifyDojoServed` ne convertit que
  `DojoVerifyError` (l.360-361) : le vérificateur public lèverait de même sur un arbre servi hostile. Construction proposée : la levée de
  `canonical` lue comme `line_malformed` (≈ 1 l. et un test, lot du vérificateur) ; la VAE en hérite sans ligne ici. Déclencheur proposé :
  la partie 1 de la décision 300 (le vérificateur est servi au lecteur).
- **Q-5 (borne)** : le fichier candidat passe la VAE en mémoire sans la borne de 64 Mio de `dirSource` (comme le fichier de lignes du
  jour) : objet de DOJO-PUBLISH-SCALE-1 (réponse Q-G2-2), déjà formé ; aucune ligne ici.
- **Q-6 (fichier étranger)** : un fichier non énuméré sous `publish/` n'est ni lu ni servi, ni refusé (il faudrait `readdirSync` à la l.12,
  ligne d'ENTRY-MAIN-LINK-1) ; à trancher après l'intégration : accepter (déclaré ici) ou refuser (≈ 2 l. et un cas).
- **Q-7 (jour révolu)** : aucune garde « dernier jour d'historique révolu à l'heure de la ligne » ; ni le marcheur ni le vérificateur ne
  l'exigent ; un vrai paquet n'existe qu'après la clôture du premier jour lu. Accepter, ou ligne datée et garde (≈ 1 l. et un cas).
- **Q-8 (T-H4 fragile à l'intégration)** : sa première assertion suppose UN seul site de transmission `refuse(e.code` et aucun `refuse(`
  en commentaire dans `dojo-publish.mjs` ; un code ajouté par l'écrivain unique ne la rougit pas, un second site de transmission ou un tel
  commentaire, si. Correctif d'une ligne si besoin : compter les littéraux `refuse("` et les sites de transmission connus, nommés.
- **Q-9 (rejeu et forme de la boîte, pour le RUNBOOK de A-11)** : `--anchor` rejoué après un arrêt passé l'engagement rend `anchored`
  (l.169) ; `--history` rejoué refuse `history_exists` (conforme à la mission : seconde ligne refusée nommée). Le RUNBOOK dira : sur
  `history_exists`, lire le `timeline.jsonl` servi (ligne 2 = `history`, `history_sha256` du manifeste) avant toute escalade. Forme :
  `--history <packet>` prend le répertoire qui CONTIENT `publish/` (comme `bundles/<d>/` pour `--inbox`), jamais `publish/` lui-même.

### Errata du compte d'avant le code (ajout ; le compte lui-même n'est pas réécrit)

Relevés par l'advisor avant la remise, vérifiés au `f4ebcf5b` (`git show`, lecture seule) ; `error_origin` : G1 (lignes recopiées de mémoire).
- Test unitaire : imports étendus aux l.19, 21, 23, 25 (et non 18, 20, 22, 24) ; liaison de `publishHistory` AJOUTÉE après la l.291 (+1,
  et non « l.305, +1/−1 ») ; `interface World` l.308 et retour de `world()` l.331 (et non 322, 344).
- e2e : imports modifiés aux l.12, 14, 16 et 23 (`readEve`), plus deux neufs (et non « l.13, +3/−1 ») ; doublure l.67-74, huit lignes (et
  non l.66-72, sept) ; retour de `world()` l.75 (et non l.73). Les totaux mesurés font foi (R-25 ci-dessus).

### Provenance

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte | Générateur | Réviseur |
|---|---|---|---|---|---|---|
| 2026-09-30/10-01 | G1 PR-3a-2 : code, tests, journal ; base `f4ebcf5b` | `claude-opus-5-5` | max | § « Lu » | worker G1 | orchestrateur, inspection |

- Advisor intégré consulté après l'orientation, avant toute écriture (placement sans décalage, ordre des gardes, clés fermées du manifeste,
  forme des tests pour l'inspection, `world()` synchrone, contraintes d'exécution) ; seconde consultation avant la remise. Conseil, jamais
  verdict ; chaque point vérifié sur pièce.

### Empreintes (calculées par `tools/evidence.mjs`, jamais recopiées à la main ; ce journal : hors du fichier, `REPONSE.md`)

`run1.tap` = la première course (58/58), avant la revue adverse ; `final.patch` = `git diff --binary` du worktree (lecture seule), sortie de git.

| Preuve | Lignes | sha256 |
|---|---|---|
| `F:/Monark-wt-dojo-pr3a2/apps/dojo/scripts/dojo-publish.mjs` | 433 | `03fd20d02b32b49023de7382969dbfce9d2cece0bd4b3c357588e1cdaa30f9c4` |
| `F:/Monark-wt-dojo-pr3a2/apps/dojo/scripts/dojo-publish.d.mts` | 39 | `ec77a62920317fb1029040b2d02d12de50f47501fa71124e600b250c05e7bd44` |
| `F:/Monark-wt-dojo-pr3a2/apps/dojo/test/dojo-publish.test.ts` | 696 | `546fd0aa099801bc598c0a8c802b9e5e18800b0a913dfa01b6b964174e09c27f` |
| `F:/Monark-wt-dojo-pr3a2/test/dojo-publish-e2e.test.ts` | 165 | `9692e0451873ddb56ed62ab3008135e4070038ee95e157a4ab54e7c400eaa3b4` |
| `F:/tmp/dojo/pr3a2/final.patch` | 382 | `1555565a339abda471fb5056b60e8be1af6c17e42af001df5ee9412be5126d1f` |
| `F:/tmp/dojo/pr3a2/runs/run1.tap` | 372 | `5d9813474c4666663bbcfece317e072a6775e0f461bfbdcaba051956b429f0dd` |
| `F:/tmp/dojo/pr3a2/runs/run2.tap` | 372 | `bcd2894be8c435b7216d2daed3f6b5dd53cdd1f837c3fee63de07943554c8d8c` |
| `F:/tmp/dojo/pr3a2/runs/run3.tap` | 1360 | `d38b3ae2086d6df64fa6b1e2a978b0588434f4e051b9f1fef33bd8d4040828e6` |
| `F:/tmp/dojo/pr3a2/runs/r25.txt` | 4 | `981c224f94793e5019a82dac8c5806ee22149ea8d8cd20ff723d3214ba94f22d` |
| `F:/tmp/dojo/pr3a2/runs/r25-2.txt` | 4 | `a9c5fded7ef3eb8282f8673e25cc6c70300345909a6325d731cdc76182c27d2a` |
| `F:/tmp/dojo/pr3a2/runs/r25-3.txt` | 4 | `a9c5fded7ef3eb8282f8673e25cc6c70300345909a6325d731cdc76182c27d2a` |
| `F:/tmp/dojo/pr3a2/runs/killers.txt` | 23 | `090b3bcea1ea226abd8635b598672d627e6104df06a7017d17f1551e1a76c8df` |
| `F:/tmp/dojo/pr3a2/runs/diag-cases.txt` | 20 | `52c70c3136aa4a314c2025dfcc0bc8c6fbea79cfe0f1612e057e773dba3f796f` |
| `F:/tmp/dojo/pr3a2/runs/diag-cases-2.txt` | 20 | `52c70c3136aa4a314c2025dfcc0bc8c6fbea79cfe0f1612e057e773dba3f796f` |
| `F:/tmp/dojo/pr3a2/runs/diag-nonfinite.txt` | 2 | `84d48db3be0d045f05a071697c84a366523499699cdc20ac5e123d9a5e324c34` |
| `F:/tmp/dojo/pr3a2/runs/gate2-typecheck.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `F:/tmp/dojo/pr3a2/runs/gate2-lint.log` | 0 | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| `F:/tmp/dojo/pr3a2/runs/gate2-lint-ratchet.log` | 1 | `bf35ba72e61a4472777c999f3b2cc0006b5438a9d00e1439e97be8348bfecfd8` |
| `F:/tmp/dojo/pr3a2/runs/gate2-lang-gate.log` | 16 | `b7247d5bd76e1ebd46e57d635c015c9924ea1257230820c1da92a117b687270f` |
| `F:/tmp/dojo/pr3a2/runs/gate2-export-check.log` | 16 | `08affca00532e25c0b10d2007b0fdb786262ae67bd17398dde8cd3c42c839f3f` |
| `F:/tmp/dojo/pr3a2/runs/gate2-gate-vocab.log` | 1 | `fef5258063438b7344e880e87b986d400c4ad734a7cd41d2bad15468df35d7ef` |
| `F:/tmp/dojo/pr3a2/tools/guard.mjs` | 15 | `06f16c70be3d26f954a0b2d4d70221e5247f9b51154e715f7afa119941dc7a42` |
| `F:/tmp/dojo/pr3a2/tools/killers.mjs` | 31 | `996d0becfe80814e8a438db318eb8253091e2470bf80c376a6229507371595c0` |
| `F:/tmp/dojo/pr3a2/tools/r25-run.mjs` | 10 | `60e5e0196e125d33ce70e69383e6c2cd9ff473a1851ad788a9acc53b1bf2a80e` |
| `F:/tmp/dojo/pr3a2/tools/diag-cases.mjs` | 71 | `704bde0ec9165dbad2c6c4b0e23209c6ae3592607817f6a3bd06391178f11fe7` |
| `F:/tmp/dojo/pr3a2/tools/diag-nonfinite.mjs` | 44 | `f8ace4b82c52069264772bf1549f7ef69ff93af19ce7285a7ea1c9c57d158e57` |
| `F:/tmp/dojo/pr3a2/tools/evidence.mjs` | 10 | `ef69e986a96897274a03ce1d2c2909cd6b38b69cc0ee2b59519c2cc1f4123d34` |
