claude-opus-5-5

# G1 : lot SITE-SEND-PREP (partie 3 de la page snapshot du Dōjō : le site ; préalable de l'envoi), 2026-10-02

## 0. Identité, mission, conduite

- Modèle résolu (R-1) : `claude-opus-5-5`, effort max, rôle G1 (implémenteur), instance fraîche. Heures par `date -u`.
- Mission `F:/tmp/dojo/mission-sendprep.md`, sha256 recalculé AVANT lecture (01:05:49Z) :
  `3040727451f478c88bc3371835ac476f66da787cde17d1e732a3a4eeb0a62bed`, égal au sceau donné par l'orchestrateur. Règles insérées
  (`REGLES-MISSION.md`) : `6470002592fe9c18851c8f7c645d1a1ee963d83e8068cd6fbeb8ee94eabdd2ba`, égal au fichier du tronc (01:1xZ).
- Outils du tronc aux sha256 de la mission (01:1xZ) : `lint.mjs` `4d1383c8…f808`, `launch.mjs` `fb6c277f…ae3d`, `oracle/run.mjs`
  `f22b9045…a41b`, `r25.mjs` `4d0544df…7cf0`, `red-proof.mjs` `6579b550…ab36` ; hors mission : `mutants/run.mjs` `41cdf83f…1ac8`,
  `mk-nm.ps1` `d70d8aea…fbe4`, `rm-nm.ps1` `b51b5d22…8749`.
- Worktree `F:/Monark-wt-sendprep`, branche `lot/site-send-prep`, HEAD `d1120612b7b5c172509830c1cb314c9580549c41` (= `lot/page-v1`),
  `status --porcelain` vide à 01:05Z.
- Git : lectures seules sur le worktree et sur `F:/Monark` ; git écrivant seulement dans mes clones `--no-local` sous
  `F:/tmp/dojo/sendprep/` et dans les clones jetables des outils du tronc. Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`
  (ni `git write-tree`, ni son aide) ; aucun commit dans un dépôt ou un worktree, aucun workflow (R-20). TEMP, TMP, TMPDIR =
  `F:/tmp/dojo/sendprep/tmp`. Aucun réseau, aucun hôte, aucune clé ; rien sur C: ; aucune adresse IP écrite (boucle locale comprise).
- Verrou d'hôte : tenu à 01:06Z par un oracle G7 (pid 130100, vivant, sur `d1120612`) : aucune course pendant ce temps ; libre à
  01:19:48Z. C-V-4 relevé avant chaque course (section 6).
- Advisor intégré (canal 1) consulté après l'orientation, avant toute écriture (01:2xZ) : plan confirmé ; avis suivis : déclarer non lu
  l'ordre des opérations de Caddy pour `X-Forwarded-For` (section 2.1), ne pas modéliser l'appariement de chemins de Caddy dans le test
  (section 2.3), tueurs ancrés après l'extrait final. Seconde consultation avant la remise (01:51Z, livrables écrits) : verdict
  LIVRE-AVEC-RESERVES jugé tenable, réserve unique gardée ; avis suivi : consigner cette consultation, regénérer et contrôler
  `DELIVERED.sha256`. Conseil, jamais verdict.

## 1. Entrées lues (en entier, dans l'ordre de la mission)

| Entrée | sha256 |
|---|---|
| `F:/tmp/dojo/cp-part3/CP-PARTIE3-RAPPORT.md` (277 l. ; C-V-1, C-V-3) | `ad2b86746762904c363488a5e453ef4f55fb5b79669609a27e99dfdb23ab98ff` |
| `docs/dojo/FAITS-caddy-proxy-headers-2026-09-30.md` (17 l. ; K-1 à K-6) | `a1b4eefaa9d82aededa9a5630f8fcc285dcab4e17cc367f8f8c0202aecb61c7f` |
| `deploy/Caddyfile.monark-dojo-site.snippet` (26 l.) | `b5c846881278602c7892a7687092a5383dd37917f4b770c7c8db125c8a33fbf9` |
| `test/dojo-live-surface.test.ts` (377 l.) | `ddfa77f19eced52435bc07acb61f886aa32b66b1e2d8a00efa0086d024852274` |
| `test/dojo-publish-deploy.test.ts` (474 l.) | `252fbcbbdf67cd712b49875ec3c304404c6f0cd590cd247c72ead1f025c5cc74` |
| `apps/site/lib/dojo-copy.ts` (112 l.) | `a4c9302ac29f77ea6972e09cede86c27334ee1764d5269cb455b19815fe2da76` |
| `F:/Monark/scripts/red-proof.mjs` (268 l. ; `parseKiller`, `killerProblem`, `judgedOf`) | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |

Lus pour juger, par extraits nommés : `F:/tmp/dojo/g2-pr4c1b/G2-report.md` l.118-125 et l.293-299 (Q-G2-2, origine de l'item ;
`74684387457c672a35a26f16460313a2b54ef9a1012728e139b0ec2f5a11f224`) ; `docs/adr/ADR-DOJO-PR-4.md` l.390-398 (`cac88bc8…2376`) ;
`F:/Monark/docs/ETAT.md` du tronc (HEAD `eb3ee3ec`, 302 l.) l.280-302 (`83e4b28a…9e4b`) ; `apps/dojo/scripts/dojo-publish.mjs` l.11,
l.124, l.196, l.340 (`516ce365…914f`) ; `deploy/Caddyfile.monark-dojo` l.1-28 (`67bb93ac…f08f`) ;
`docs/dojo/FAITS-webcrypto-ed25519-edge-cache-2026-09-30.md` C-1 à C-3 (`feaad9f5…086f`) ; `docs/adr/ADR-M004-infrastructure-plateforme.md`
l.75 et l.451 (`adbb9931…ef37`) ; `apps/site/lib/dojo-served.ts` l.170-200 (`b8921860…eb5aeb`) ; `apps/site/components/dojo/dojo-table.tsx`
l.92 (`3a030e39…f3c`) ; en-têtes de `F:/Monark/scripts/oracle/run.mjs`, `r25.mjs`, `mutants/run.mjs` ; `.github/workflows/ci.yml` l.82.

## 2. Décisions appliquées (fixées AVANT le code)

### 2.1 En-têtes retirés en amont : liste exacte tirée de FAITS K-1

- K-1 [lu par l'orchestrateur, FAITS du 2026-09-30T02:11Z] : « By default, Caddy passes through incoming headers—including Host—to the
  backend without modifications, with three exceptions » : `X-Forwarded-For` posé ou augmenté, `X-Forwarded-Proto` et
  `X-Forwarded-Host` posés ; les valeurs entrantes de ces trois sont ignorées.
- `X-Forwarded-For` : l'adresse du client, posée par Caddy lui-même : RETIRÉ.
- `X-Forwarded-Proto` (le schéma) et `X-Forwarded-Host` (le nom du site ; K-4 : « reste passé ») : aucune adresse : GARDÉS.
- Tout autre en-tête entrant passe inchangé (K-1) : chaque en-tête d'adresse cliente qu'un client peut envoyer passe ; la décision de
  l'orchestrateur en nomme deux, `X-Real-IP` et `Forwarded` : RETIRÉS.
- Liste fermée : `X-Forwarded-For`, `X-Real-IP`, `Forwarded`, dans cet ordre ; trois lignes `header_up -<nom>` dans le bloc
  `reverse_proxy`, après `header_up Host {upstream_hostport}`, avant `header_down`.
- Non retenus (aucune source lue ; mission sans réseau) : les noms qu'un bord (CDN) ajouterait. ETAT du tronc l.294-295 : « le DNS de
  `monarkgate.tech` pointe droit sur le VPS, sans bord ». Item formé avec déclencheur (section 9), jamais une limite nue.
- **Non lu : l'ordre des opérations.** Que `header_up -X-Forwarded-For` retire aussi l'en-tête que Caddy pose lui-même (suppression
  appliquée après la pose) n'est établi ni par K-1 ni par une lecture de cette mission (aucun `caddy` dans le PATH : G2 de PR-4c-1b, et
  `command -v caddy` vide ici, 01:0xZ ; aucun réseau). Le test de ce lot épingle le TEXTE de l'extrait, jamais l'effet à l'exécution : un test vert
  ne prouve pas que l'hôte Dōjō ne reçoit aucune adresse. Demande de FAITS et question de mesure à l'acte formées (section 9) ; le
  commentaire de l'extrait le dit.

### 2.2 Trois requêtes de traversée, nommées par le commentaire d'en-tête, attendues 404 à l'acte

- Hors de la liste fermée : `GET /dojo-served/history/<h>.jsonl` : un fichier que l'hôte Dōjō sert (`deploy/Caddyfile.monark-dojo`
  l.6-7) et que le mandataire ne relaie pas.
- `..` encodé : `GET /dojo-served/lines/%2e%2e/history/<h>.jsonl` : sort de `lines/` vers l'historique.
- Méthode autre que GET : `HEAD /dojo-served/timeline.jsonl`.
- `<h>` = `history_sha256` de la ligne d'historique (`dojo-publish.mjs` l.124, l.340), qui précède tout instantané (`dojo-publish.mjs:196`,
  refus `history_missing`, décision 231) : le commentaire dit « once published ».
- Raisonnement de choix [non lu : la normalisation des chemins par Caddy et le service de fichiers de l'hôte ne sont pas lus] : chaque
  requête vise un fichier que l'hôte servirait (200) si le mandataire la relayait ; une réponse 404 sans relais est le seul résultat
  conforme, quelle que soit la normalisation. La mesure est l'acte. Variantes de la G2 non retenues par la décision : Q-1 (section 8).

### 2.3 Tests (fichier `test/dojo-live-surface.test.ts`, où vit le test de l'extrait)

- `dojo_site_proxy_snippet_is_outside_the_page_route` : sa liste exacte des lignes de code gagne les trois retraits ; son tueur garde
  sa mutation (`header_down`), réancré sur la ligne déplacée.
- Neuf, `dojo_site_proxy_sends_no_client_address_to_the_dojo_host` : les `header_up` du bloc `reverse_proxy` sont exactement Host puis
  les trois retraits (liste fermée `CLIENT_ADDRESS_HEADERS`, constante du test) ; un seul `reverse_proxy` ; `@read` = `method GET` et
  les trois chemins ; tout le reste `respond 404` ; le commentaire nomme les trois traversées (inclusion de chaque chaîne). Rouge à la
  base par assertion. Tueur : SDL de la ligne `header_up -X-Forwarded-For` ; empilés : SDL `-X-Real-IP`, SDL `-Forwarded`, CONST de
  `method GET` (HEAD ajouté), CONST du chemin (`/history/*` ajouté), SDL de la ligne de commentaire du `..` encodé.
- Aucun modèle de l'appariement de chemins de Caddy dans le test (toute modélisation figerait une hypothèse non lue).

### 2.4 C-V-3 : commentaire de `DOJO_TABLE` (`apps/site/lib/dojo-copy.ts` l.106-107), commentaire seul

- « The words of the table of every line » devient : les mots de la table des lignes de l'instantané montré, celles sous le seuil de
  poussière de la version en vigueur étant publiées et non listées (code : `dojo-served.ts` l.198 `listed`, l.202 `shown` ; textes
  `tableDone`, `tableDust`). Aucun chiffre (M-P1, `dojo-page.test.ts:194`) ; aucune valeur exportée ne change, donc l'empreinte de la
  liste fermée des textes non plus (`dojo_page_lexicon_is_closed`, rejoué inchangé). Aucun tueur ne vise `dojo-copy.ts` après l.75.

## 3. Compte ascendant (estimé AVANT le code à 01:2xZ ; mesuré au gel en section 6 ; porte `r25` de l'oracle en section 7)

Périmètre CI (`.github/workflows/ci.yml` l.82) : le journal est exclu (`:(exclude)docs/G1-lot-*.md`).

| Fichier | + | - |
|---|---|---|
| `deploy/Caddyfile.monark-dojo-site.snippet` | 10 | 2 |
| `test/dojo-live-surface.test.ts` | 34 | 4 |
| `apps/site/lib/dojo-copy.ts` (commentaire) | 3 | 2 |
| **Total estimé** | **47** | **8** |

Soit 55 lignes, borne de la mission 1 150 (porte CI 1 205). Pas de coupe.

Mesuré au gel (`git diff --numstat` du worktree, 01:36:18Z ; `r25.mjs` en section 6) : snippet 11 + 1, test 40 + 4, `dojo-copy.ts` 3 + 2 :
**54 insertions, 7 suppressions, 61** au périmètre CI (6 de plus que l'estimation : le commentaire d'en-tête de l'extrait, plus long).

## 4. Code, fichier par fichier (sha256 au gel, figés AVANT l'oracle : `F:/tmp/dojo/sendprep/frozen-at-oracle.sha256` `3d836724…cb0b`)

- `deploy/Caddyfile.monark-dojo-site.snippet` (`dc402f3f2901180329f52ff9ce0cee0ee61e72b7a6fd9489e6e005d9084280c8`, 36 l.) : l.10-13 neuves (en-têtes
  retirés, motif, ce qui reste ; le non-lu de 2.1 dit dans l'extrait lui-même) ; l'ancienne l.10 scindée en l.14-17 (trois traversées et
  `<h>`, retour arrière inchangé) ; l.27-29 neuves : `header_up -X-Forwarded-For`, `header_up -X-Real-IP`, `header_up -Forwarded`.
- `test/dojo-live-surface.test.ts` (`afc935ee23d7a88da51edc9b81a4c03933bbae94f6ee68c506818124e3bc5029`, 413 l.) : l.170-172 constante
  `CLIENT_ADDRESS_HEADERS` ; l.174 tueur réancré (`:20` vers `:30`, même mutation) ; l.179-183 liste exacte du bloc ; l.204-209 six tueurs ;
  l.210-233 test neuf. Aucun autre test touché ; `test/dojo-publish-deploy.test.ts` inchangé (ses `includes` restent vrais).
- `apps/site/lib/dojo-copy.ts` (`e225b49e04d61e5c843ddddecb1d3d19d1cf59636bbe42bb2f4b0a7463a5c231`) : l.106-108, commentaire de `DOJO_TABLE`
  seul (« The words of the table of the lines of the snapshot shown …, where the lines under the dust threshold of the version in force are
  published and not listed … ») ; aucune valeur exportée changée ; aucun chiffre ; les anciennes l.108-112 descendent d'une ligne
  (l.109-113, 113 l. au total), aucun tueur ne les vise (tueurs de ce fichier : `:41`, `:75` seulement, relevés à 01:2xZ).

Tueurs du lot (numéros K de l'outil de mutants : lignes `// killer:` du fichier de test changé, dans l'ordre) :

| K | Ligne du test | Cible et mutation | Test au-dessous | Mesure |
|---|---|---|---|---|
| K5 | 174 | `snippet:30` SDL `header_down Cache-Control` (réancré) | `…is_outside_the_page_route` | `red-proof` tiré : tué ; `mut1` : tué |
| K6 | 204 | `snippet:15` SDL `%2e%2e` (ligne du commentaire des traversées) | test neuf | `mut1` : tué |
| K7 | 205 | `snippet:22` CONST `/lines/* ` vers `/lines/* /history/* ` | test neuf | `mut1` : tué (deux tests rouges) |
| K8 | 206 | `snippet:21` CONST `method GET` vers `method GET HEAD` | test neuf | `mut1` : tué (deux tests rouges) |
| K9 | 207 | `snippet:29` SDL `header_up -Forwarded` | test neuf | `mut1` : tué (deux tests rouges) |
| K10 | 208 | `snippet:28` SDL `header_up -X-Real-IP` | test neuf | `mut1` : tué (deux tests rouges) |
| K11 | 209 | `snippet:27` SDL `header_up -X-Forwarded-For` | test neuf | `red-proof` tiré : tué ; `mut1` : tué |

Review Focus : un en-tête d'adresse cliente encore transmis : K9, K10, K11 rougissent ; un chemin hors de la liste fermée relayé, ou une
méthode autre que GET : K7, K8 rougissent (les deux tests). Contrôle de forme de chaque tueur (règle de `killerProblem` du tronc, réécrite :
`F:/tmp/dojo/sendprep/tmp/killers-check.mjs` `0522626f…840e`) : 20 lignes `// killer:` du fichier, 0 problème (01:28Z).

## 5. Garde d'octets et de longueur

`F:/tmp/dojo/sendprep/tmp/guard.mjs` (`d84055c5…d1d9`) sur les lignes ajoutées contre `d1120612` et le journal entier : 0 ligne de plus de
160 caractères, 0 TAB, 0 point de code de contrôle, 0 barre inverse, 0 forme d'adresse IP (01:25Z avant le code, 01:28Z après). Octets
comptés aussi par `node` sur l'extrait et le journal : 0 CR, 0 TAB, 0 barre inverse.

## 6. Courses ciblées, portes, R-25, F2P, tueurs (clone `F:/tmp/dojo/sendprep/c1`, `--no-local`, HEAD `d1120612` + les 4 fichiers copiés)

- Clone 01:28:52Z, sha256 des quatre fichiers contrôlés égaux au worktree ; jonctions `mk-nm.ps1` : 220 entrées, 11 `@monark`, 0 échec
  (01:28:57Z) ; `F:/Monark/node_modules` : 220 entrées et 11 `@monark` avant (01:29Z) et après `red-proof` (01:33Z).
- Environnement des courses : treize noms de la liste DENY de `red-proof.mjs` retirés (noms seuls relevés, aucune valeur lue ni écrite) ;
  TEMP, TMP, TMPDIR = `F:/tmp/dojo/sendprep/tmp` ; `GIT_OPTIONAL_LOCKS=0`, `GIT_TERMINAL_PROMPT=0`, `< /dev/null`.
- C-V-4 avant chaque course (`Get-CimInstance Win32_OperatingSystem`) : 13 546 à 14 244 Mo physiques, 31 540 à 32 382 Mo virtuels libres,
  8 à 10 `node.exe` ; verrou `F:/tmp/oracle-lock` absent avant chaque course (01:28Z, 01:31Z, 01:33Z, 01:34Z, 01:35Z).
- **Tests du site et de l'éditeur** (`tmp/wrap.mjs` `0a6fc8ce…ea46`), 01:29:23Z-01:30:34Z, 31 fichiers (les 16 `test/dojo-*` et `test/site-*`,
  les 15 `apps/dojo/test/*`) : **361 tests, 360 verts, 0 rouge, 1 ignoré** (sous-test « a real SIGTERM » de `dojo-collect-sigterm`, saut
  win32 connu) ; les deux tests de l'extrait verts (ok 190, ok 191), `dojo_page_lexicon_is_closed` vert (empreinte des textes inchangée),
  `dojo_caddyfile_serves_public_only_immutables_no_browse` vert. Aucun de ces fichiers ne porte le test 42 (`grep`). Preuve :
  `logs/run1.tap` `eb76d91fec999a859b6c74cc2a5a3823ec7ae2897daa6df039dd3409d96d23b7`.
- **Portes** (`tmp/gates.mjs` `d278cbfd…3503`, commandes des scripts de `package.json`, jamais `npm run`), 01:31:06Z-01:32:03Z, toutes à 0 :
  `typecheck`, `lint`, `lint:ratchet` (69/69), `lang:gate`, `export:check`, `gate:vocab` (330 fichiers). Journaux `logs/gate-*.log`.
- **R-25** par `F:/Monark/scripts/oracle/r25.mjs` (`tmp/r25-run.mjs` `e2e54369…11d9`), sur un commit de gel de MON clone (`30744e6a`,
  identité de remplacement), 01:32:34Z : `STAT` **54 insertions, 7 suppressions, 61** (borne `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0
  (borne 8 000) ; GREEN, sortie 0. Preuve : `logs/r25.out` `60df9007d0b948d401dbd1b116d3b5688f0850cd3f2886847c7cb5e28939f501`.
- **`red-proof`** du tronc (`6579b550…ab36`) : `--base d1120612 --gel F:/Monark-wt-sendprep --repo F:/Monark --out F:/tmp/dojo/sendprep/rp1
  --draw 2 --seed 809529972` (graine : 32 premiers bits du sha256 de la mission, `0x30407274`), 01:33:04Z-01:33:26Z, sortie 0 : `ok: true`,
  **2 jugés, 2 F2P** (`dojo_site_proxy_snippet_is_outside_the_page_route` l.175, `dojo_site_proxy_sends_no_client_address_to_the_dojo_host`
  l.210 : rouges à la base par `ERR_ASSERTION`, sur l'assertion visée de chacun, lue dans `base.tap` ; verts au gel), 9 inchangés ; tirage
  2 demandés, population 2, **2 tués** (`snippet:30` SDL, `snippet:27` SDL ; fichier restauré, sha256 égal avant et après). Digest du gel
  `798e75890f2c256630ff5ed31fece24e471093b615b81997b9b09333d1185f36`. Preuve : `rp1/RED-PROOF.json`
  `c4844f857c72803ebf8578ad0c2a39cbd8d009ce043989124f9286142ca61f6e` ; `base.tap` `4b9e7f5e…0e85`, `gel.tap` `ce9bf520…5f24`,
  `logs/rp1.out` `c128c356…fb70`.
- **Tueurs empilés** : outil de mutants du tronc (`41cdf83f…1ac8`), `--repo F:/tmp/dojo/sendprep/c1 --base d1120612 --out
  F:/tmp/dojo/sendprep/mut1 --killers --only K5,K6,K7,K8,K9,K10,K11 --file deploy/Caddyfile.monark-dojo-site.snippet --targets
  test/dojo-live-surface.test.ts --lock-root F:/tmp --min-free-mb 4096`, 01:34:0xZ-01:34:34Z, sortie 0 : ligne de base verte (11 tests),
  **7 tués sur 7**, 0 survivant, 0 non conclu, 0 ancre perdue. Preuve : `mut1/RESULTS.json`
  `7cb066edce85f077d6988eb9cd06af73bbf9432f7f2073544f6929e790680140`, `RESULTS.txt` `c85d08ea…cf12`, `logs/mut1.out` `12802dc3…f0d9`.

## 7. Oracle du tronc (rôle G1)

`node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-sendprep --base d1120612b7b5c172509830c1cb314c9580549c41` (outil
`f22b9045…a41b`, `r25.mjs` `4d0544df…7cf0`), lancé à 01:35:1xZ après les sha256 figés (section 4), seul sur l'hôte ; verrou pris à
01:36:29Z, attente 0 s ; aucune autre course jusqu'à sa fin (01:45:23Z dans l'enregistrement, marqueur 01:45:46Z). Sortie **0**. Gel de
l'outil dans son clone : `35ecfd94`, journal et test aux sha256 figés (relus à 01:35:33Z).

- Enregistrement : `F:/tmp/oracle-results/d1120612b7b5c172509830c1cb314c9580549c41-e675243e9bc07d0d-G1-20261002T013517Z-308272.json`, sha256
  `cae9923b3d69a82f645931a192fb4c058e42f5344c68857d9242df7b175dad17` (copie octet à octet : `F:/tmp/dojo/sendprep/oracle-g1-record.json`) ;
  arbre : tête `d1120612`, `dirty` `e675243e9bc07d0de186b847e697a73b9c34ac048c3f16e1b06ec4f1a51ebbcc`, objet
  `5336dc3a868831055dd5f40c50279f6c86be36a3` ; `static_only` false ; `served_from` null (rejoué, sans `--key`) ; C-V-4 lu par l'outil :
  13 366 Mo libres, 10 `node.exe`.
- Portes, toutes à 0 : épinglage des modèles, **`r25`** (54 insertions, 7 suppressions, **61**, borne 1 205 ; contenu 0 sur 8 000 ;
  `02-r25.log` `cef17108…3501`), `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `test` (533,9 s).
- Tests : **1 870, 1 866 verts, 0 rouge, 0 annulé, 4 ignorés** (le G7 de `d1120612` en comptait 1 869, ETAT l.287 : plus le test neuf) ;
  les deux tests de l'extrait verts (`09-test.log` l.1964-1965) ; test 42 (`export_public_no_governance_no_french`) vert en 497,7 s, une
  seule occurrence, dans la suite ; aucun fichier de test mort (0 rouge) ; résidus TEMP relevés par l'outil : 383, comme aux oracles
  précédents. `09-test.log` `af70ef3cb9e472ba54aa42d8ec56836eed05420d37ca50b5b587ba997bec0d4d`.
- Après l'oracle (01:46:53Z) : les trois fichiers de code et de test égaux à leurs sha256 figés (`sha256sum -c`) ; seul le journal a
  changé depuis (sections 4 à 11), hors du périmètre R-25 et sans test.

## 8. Questions et choix (Q-n), chacun avec sa preuve

- **Q-1 (traversées ; décision de l'orchestrateur appliquée)** : la G2 de PR-4c-1b (Q-G2-2 (b), l.297-299) proposait `/dojo-served/lines/../x`,
  sa forme encodée `%2e%2e` et une casse changée ; la mission retient : hors liste, `..` encodé, méthode autre que GET (section 2.2). Ni la
  forme littérale (sa normalisation dépend aussi du client qui l'envoie, non lue) ni la casse changée ne sont nommées : à ajouter à l'acte
  si l'orchestrateur le décide. Un `..` encodé qui retombe DANS la liste (`/dojo-served/lines/%2e%2e/timeline.jsonl`) n'est pas nommé non
  plus : selon la normalisation de Caddy (non lue), il peut être relayé vers un fichier que la liste admet déjà (rien au-delà de la liste) ;
  exiger 404 pour lui demanderait une garde de plus dans l'extrait, construite sur une lecture FAITS (item I-3), hors du périmètre décidé.
- **Q-2 (mesure, à l'acte, de l'effet de `header_up -X-Forwarded-For`)** : l'hôte Dōjō ne journalise rien (`deploy/Caddyfile.monark-dojo` :
  ni `log`, épinglé par `dojo_caddyfile_serves_public_only_immutables_no_browse`) : rien de ce côté ne peut voir les en-têtes reçus. Voies,
  au choix de l'orchestrateur : (a) la lecture FAITS de l'item I-1 à la version installée ; (b) `caddy adapt` du Caddyfile déployé : la
  liste des suppressions dans les opérations d'en-têtes de requête du `reverse_proxy` (preuve de configuration, pas d'exécution) ; (c) une
  mesure d'exécution : un amont temporaire, en boucle locale de l'hôte du site, qui renvoie les en-têtes reçus, derrière une copie du bloc
  `reverse_proxy` de l'extrait, puis retiré (acte sous go). Tant qu'aucune n'est faite, la revendication de XFF-1 reste celle du TEXTE.
- **Q-3 (`<h>` et l'heure de l'acte)** : si DOJO-SITE-PROXY-1 précède la ligne d'historique, les deux requêtes fondées sur `<h>` ne
  discriminent plus (un nom quelconque répond aussi 404 à l'hôte). La ligne d'historique précède tout instantané (`dojo-publish.mjs:196`) :
  faire les trois requêtes après elle, ou tenir l'acceptation de l'acte jusque-là.
- **Q-4 (forme des tests)** : le test neuf lit le TEXTE de l'extrait (blocs, lignes, commentaire) et ne modélise ni l'appariement de chemins
  ni l'ordre des opérations de Caddy (avis de l'advisor, suivi) ; le test existant garde la liste exacte de tout le bloc. Les lignes de
  retrait sont donc jugées deux fois (redondance voulue : l'un épingle le bloc entier, l'autre nomme la propriété et la procédure de l'acte).

## 9. Items formés et demandes (règle Dettes : aucun dû nu)

- **I-1 FAITS-CADDY-HEADER-UP-DELETE-1** (lecture sur place par l'orchestrateur ; déclencheur : avant l'acte DOJO-SITE-PROXY-1 ; bloquant pour
  la revendication de XFF-1 au-delà du texte) : lire, à la version installée (`caddy version` relevé à l'acte), le paragraphe `header_up` de
  https://caddyserver.com/docs/caddyfile/directives/reverse_proxy (forme `-<champ>` ; ordre de la suppression par rapport aux
  `X-Forwarded-*` que Caddy pose : K-1 ne le dit pas) ou, à défaut, la source `modules/caddyhttp/reverseproxy/reverseproxy.go` de cette
  version ; fichier FAITS daté ; puis la mesure de Q-2. Tentative faite ici : aucune (mission sans réseau ; règle « lecture sur place » :
  acte de l'orchestrateur) ; source locale cherchée : aucun binaire `caddy`, aucune documentation Caddy sous `F:/Monark/node_modules`.
- **I-2 DOJO-SITE-PROXY-HEADERS-ALLOWLIST-1** (recherche, registre PAROXYSME ; déclencheur : avant tout bord placé devant `monarkgate.tech`,
  ETAT du tronc l.294-295 n'en voyant aucun aujourd'hui, ou au prochain lot qui touche l'extrait) : la liste fermée de trois suppressions laisse
  passer tout autre en-tête entrant (K-1) : ceux d'adresse cliente qu'un bord ajouterait, `Via` d'un mandataire du lecteur, tout nom libre.
  Construction qui donne la garantie : retirer TOUS les en-têtes de requête sauf une liste fermée (Host posé ; `Accept-Encoding` selon
  K-3) ; elle exige la lecture FAITS des opérations d'en-têtes de Caddy (suppression générique, ordre avec les poses) à la version
  installée ; prix : quelques lignes de l'extrait et de son test. À porter au registre `docs/PAROXYSME-Dojo.md` (PAROXYSME-DOJO-FILE-1,
  avant la première synchro selon ETAT l.296-297).
- **I-3 DOJO-SITE-PROXY-PATH-NORMALIZE-1** (lecture sur place par l'orchestrateur ; déclencheur : avant l'acte, ou dès qu'une des trois
  traversées répond autre chose que 404) : la normalisation des chemins par Caddy (décodage, `..`, casse) sous `handle_path` et `path`
  n'est pas lue (Q-G2-2 (b) de la G2 de PR-4c-1b ; ici ni `caddy` ni réseau) : lecture FAITS des pages de `handle_path` et des matchers ;
  elle tranche Q-1 (garde de plus, ou non).

## 10. Écarts de conduite (`error_origin` : ce G1)

(1) Des séquences barre inverse dans des motifs de MES commandes Bash, hors heredoc et hors chemin (la règle vise ces deux cas) : un
    motif `grep` de recherche de CR dans une sortie `od` (01:2xZ), dont le compte affiché (89) était faussé par le transport, le risque
    même que la règle vise ; et une barre inverse devant l'étoile dans des `sed` d'affichage d'empreintes (sorties relues,
    correctes). Octets recomptés par `node` (0 CR, 0 TAB, 0 barre inverse dans l'extrait et le journal) ; aucun fichier touché ;
    motifs sans barre inverse ensuite (`[*]`). Une barre inverse écrite par erreur dans ce journal même (01:48Z) a été retirée avant
    remise (garde rejouée).
(2) Un `ls F:/` superflu (racine du disque, 40 noms affichés) dans la commande de recherche locale de 01:08Z : lecture seule, rien n'en
    est retenu ni écrit ; `F:/Monark-wt-page-v1` et `F:/PRODUITS/` jamais nommés par mes commandes.
(3) Premier contrôle des tueurs refusé par `node` (import ESM d'un chemin absolu Windows sans `file:///`) : corrigé, relancé ; aucun effet.
(4) La recherche locale dans `F:/Monark/node_modules` a dépassé 120 s et a fini en arrière-plan (sortie lue après la fin) ; aucun effet.
(5) Aucun autre écart : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` ; aucun git écrivant dans le worktree ni dans
    `F:/Monark` (commit de gel dans mon seul clone `c1`) ; aucune course pendant un verrou tenu par autrui ; aucun oracle arrêté ; aucun
    réseau ; aucune adresse IP écrite ; rien sur C: ; test 42 non joué hors de la suite de l'oracle.

## 11. État à la remise (01:47Z)

- Worktree `F:/Monark-wt-sendprep` : HEAD `d1120612` (inchangé), `status --porcelain` : trois fichiers modifiés
  (`apps/site/lib/dojo-copy.ts`, `deploy/Caddyfile.monark-dojo-site.snippet`, `test/dojo-live-surface.test.ts`) et ce journal non suivi ;
  rien d'autre. Le gel (`add`, `commit`) est un acte de l'orchestrateur. Empreintes de remise : `F:/tmp/dojo/sendprep-deliver/DELIVERED.sha256`.
- Tronc `F:/Monark` : HEAD `eb3ee3ec` à ma première lecture (01:1xZ) et à la fin (01:47:01Z), `status` vide ; je n'y ai rien écrit.
  `F:/Monark/node_modules` : 220 entrées, 11 `@monark`, avant (01:29Z) et après (01:46:53Z).
- Clones : `F:/tmp/dojo/sendprep/c1` (commit de gel `30744e6a` dans ce clone seul) et `F:/tmp/dojo/sendprep/mut1/clone` : jonctions
  retirées par `rm-nm.ps1` (« removed », 01:46:5xZ), aucun `node_modules` sous `F:/tmp/dojo/sendprep` ensuite. Répertoires de travail de
  `red-proof` et de l'oracle retirés par les outils eux-mêmes (`F:/tmp/oracle-runs/` vide à 01:47Z).
- `F:/tmp/dojo/sendprep/tmp/` : mes outils (`guard.mjs`, `killers-check.mjs`, `wrap.mjs`, `gates.mjs`, `r25-run.mjs`), deux listes de
  sha256 et `node-compile-cache/` (cache de compilation que `tsc` ou `eslint` écrivent sous TEMP ; laissé, aucun `rm` générique).
  `F:/tmp/dojo/sendprep/oracle-logs/` : copies octet à octet de `02-r25.log` et `09-test.log` de l'oracle (sha256 égaux, 01:50Z).
- Verdict proposé à l'orchestrateur : **LIVRE-AVEC-RESERVES**. Réserve unique : l'effet, à l'exécution, de `header_up -X-Forwarded-For` sur
  l'en-tête que Caddy pose lui-même n'est pas lu (section 2.1) : le lot garantit le texte de l'extrait, pas encore ce que l'hôte Dōjō reçoit ;
  item I-1, bloquant avant l'acte DOJO-SITE-PROXY-1, et mesure de Q-2.
