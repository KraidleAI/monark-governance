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

## 12. Corrections C-1 et C-2 (correcteur, 2026-10-02 ; plan écrit AVANT toute modification, 04:5xZ)

- Modèle résolu (R-1) : `claude-opus-5-5`, effort max, rôle corr (correcteur), instance fraîche, contexte neuf ; heures par `date -u`.
- Mission `F:/tmp/dojo/mission-corr-sendprep.md` : sha256 recalculé AVANT lecture (04:36:30Z) :
  `18bf81cd908bcb4483042740f1df805bb01ff58ba609b5ab69d5c96ffd37e23d`, égal ; reçu `mission-corr-sendprep.recu.json` vert
  (2026-10-02T04:36:07Z), même sha, base `d1120612`, tête `9e016897`. Règles insérées `64700025…d2ba`, égal ; outils de la mission aux
  sha256 de la mission (04:38:52Z) ; hors mission : `mutants/run.mjs` `41cdf83f…1ac8`, `oracle/lock.mjs` `501a76b5…33bb`,
  `mk-nm.ps1` `d70d8aea…fbe4`, `rm-nm.ps1` `b51b5d22…8749`.
- Worktree : HEAD `9e0168978448fc1bdf09b53985436adf5c2f4d9b`, `status` vide, les quatre fichiers du lot aux sha256 de la mission
  (04:36:40Z). Tronc `F:/Monark` : HEAD `5082a696`, `status` vide (04:38:52Z).
- Entrées lues en entier, dans l'ordre : rapport G2 `F:/tmp/dojo/g2-sendprep/RAPPORT.md` (`3c4864a8…88aa`, 271 l. ; C-1 à C-4) ; extrait
  (`dc402f3f…80c8`, 36 l.) ; test l.160-245 et ses 20 lignes `// killer:` ; ce journal (`b26548dd…f204`, 275 l.) ; FAITS
  `F:/Monark/docs/dojo/FAITS-caddy-header-up-delete-2026-10-02.md` (`28ee2920…625d`, 51 l.).
- Advisor intégré (canal 1), après l'orientation, avant toute écriture (04:4xZ) : plan confirmé ; avis suivis : trois lignes au commentaire
  du test, glissement déclaré ici avant l'édition ; messages d'assertion l.182 et l.224 formés en Q-C1, non touchés. Conseil, jamais verdict.

### 12.1 Plan (décisions de l'orchestrateur, à la lettre)

- C-1 : l'extrait (l.12-13) et le test citent FAITS-CADDY-HEADER-UP-DELETE-1 : établi pour Caddy v2.11.4 par la source (FAITS l.20-28,
  l.47-48), à relire à toute autre version installée (FAITS l.51). Les phrases « is not read here: it is established at the deploy act »
  (extrait l.12-13) et « is established at the deploy act, never here » (test l.212) disparaissent.
- C-2 : la phrase absolue est bornée, dans l'extrait (l.10) et dans le test (l.211) : aucune adresse que Caddy écrit n'atteint l'hôte ;
  `X-Real-IP` et `Forwarded` retirés tels qu'envoyés ; tout autre en-tête passe tel quel (DOJO-SITE-PROXY-HEADERS-ALLOWLIST-1). Le nom
  du test ne change pas.
- C-3 : l.14-17 de l'extrait inchangées (la l.15 garde `%2e%2e` une seule fois, ancre de K6).
- Extrait : l.10-13 réécrites en exactement quatre lignes (152 caractères au plus, mesuré par `F:/tmp/dojo/sendprep-corr/tmp/wrap.mjs`) ;
  36 lignes avant et après ; aucun numéro de ligne cible d'un tueur ne bouge (K5 à K11 : `:15`, `:21`, `:22`, `:27` à `:30`).
- Test : l.211-212 (deux lignes) deviennent l.211-213 (trois lignes, 153 caractères au plus) : le contenu décidé (provenance de XFF-1,
  C-2, C-1) fait 435 caractères sans préfixe, trois lignes au minimum à 160 (mesuré). Glissement DÉCLARÉ : le fichier passe de 413 à
  414 lignes ; les anciennes l.213-413 deviennent l.214-414, dont les neuf `// killer:` de K12 à K20 (anciennes l.235 à l.394) ; leurs
  cibles (`dojo-served.ts`, `dojo-live.tsx`, `dojo-live.ts`) et la numérotation K (ordinale) ne changent pas ; aucun tueur ne vise le
  fichier de test ; K5 à K11 (l.174, l.204-209) et les deux tests jugés par `red-proof` (l.175, l.210) restent en place.
- Aucune ligne exécutable ne change. Les messages d'assertion l.182 et l.224 portent encore la phrase que C-2 borne : chaînes
  exécutables, hors du périmètre « commentaires seuls », non touchées (Q-C1).
- Compte (estimé AVANT) : tour de corrections contre `9e016897` : extrait 4 + et 4 -, test 3 + et 2 -, soit 13 lignes ; lot contre
  `d1120612` : 55 insertions, 7 suppressions, 62 (porte CI 1 205) ; ce journal hors périmètre (`ci.yml` l.82).

### 12.2 Preuves et courses prévues (dans cet ordre)

1. Commentaires seuls : `git diff -U0` (lecture seule, `GIT_OPTIONAL_LOCKS=0`) : deux zones attendues, `@@ -10,4 +10,4 @@` (extrait) et
   `@@ -211,2 +211,3 @@` (test) ; lignes de code de l'extrait (filtre du test l.214) égales ; l.14-36 égales à l'octet ; transpilation
   TypeScript (`removeComments`) du test à `9e016897` et corrigé : sorties égales à l'octet ; 20 tueurs : `before` exactement une fois sur
   sa ligne cible ; aucune des trois requêtes que lit `said` dans les l.10-13 neuves.
2. Clone `--no-local` `F:/tmp/dojo/sendprep-corr/c1` (fichiers corrigés copiés, jonctions `mk-nm.ps1`) : tests ciblés ; portes
   `typecheck`, `lint`, `lint:ratchet`, `lang:gate`, `gate:vocab` (commandes des scripts de `package.json`, jamais `npm run`).
3. `red-proof` du tronc : `--base d1120612… --gel F:/Monark-wt-sendprep --repo F:/Monark --out F:/tmp/dojo/sendprep-corr/rp1 --draw 2
   --seed 415203789` (graine : 32 premiers bits du sha256 de la mission, `0x18bf81cd`).
4. Tueurs K5 à K11 sur un clone neuf `c2` : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/sendprep-corr/c2 --base
   d1120612… --out F:/tmp/dojo/sendprep-corr/mut1 --killers --only K5,K6,K7,K8,K9,K10,K11 --file deploy/Caddyfile.monark-dojo-site.snippet
   --targets test/dojo-live-surface.test.ts --lock-root F:/tmp --min-free-mb 4096`.
5. Oracle du tronc, en dernier, seul : `--role corr --tree F:/Monark-wt-sendprep --base d1120612… --key site-send-prep` (arbre modifié :
   rejeu, aucun enregistrement servi).

Avant chaque course : sonde `held('F:/tmp')`, `Get-CimInstance Win32_OperatingSystem`, `node.exe` (`F:/tmp/dojo/sendprep-corr/logs/probes.log`).

### 12.3 Questions formées d'avance (Q-C)

- Q-C1 (à l'orchestrateur ; lignes exécutables, hors mission) : les messages d'assertion du test l.182 (« no client address sent ») et
  l.224 (« each client-address header deleted … no other header written ») disent encore la phrase absolue ; les borner touche des lignes
  exécutables (revue G2 ciblée, ligne datée 2026-09-30 03:1x) : décision à prendre ; rien n'est changé ici.
- Q-C2 (lecture) : « any other incoming header passes as is » (extrait) et « any other header passes as is » (test) se lisent après les
  en-têtes posés : Host (extrait l.6-7, `header_up Host`) et `X-Forwarded-Proto`, `X-Forwarded-Host` (posés par Caddy, FAITS K-1) ;
  c'est la formulation décidée (C-2), appliquée telle quelle ; un relecteur peut la vouloir plus étroite.

### 12.4 Résultats (mesurés ; preuves sous `F:/tmp/dojo/sendprep-corr/`)

- Ordre : plan écrit à 04:52:00Z (journal `a2d66939…3e1f`, extrait et test encore à `dc402f3f…` et `afc935ee…` :
  `logs/plan-written.txt`) ; corrections à 04:53Z. Extrait l.10-13 : quatre lignes remplacées, 152 caractères au plus, 36 lignes,
  `c744cb0129973870b78cf8f372dcb7ab5b0b10ee723422e6d3314bd7695a5407`. Test l.211-212 devenues l.211-213, 153 caractères au plus, 414 lignes,
  `213e33f4681bca284fd53857f7f2e6355659e2f1c5b2dde94670cc7ad4239667`. `dojo-copy.ts` inchangé (`e225b49e…c231`).
- Compte mesuré (`git diff --numstat`) : tour contre `9e016897` : extrait 4 + et 4 -, test 3 + et 2 -, 13 lignes ; lot contre `d1120612` :
  55 insertions, 7 suppressions, 62, égal à l'estimation de 12.1 et à la porte `r25` de l'oracle.
- Commentaires seuls (`tmp/comment-only.mjs` `3a84ea3d…c01c1`, sortie `logs/comment-only.out` `9025c903…024e`, 04:54:49Z) : 17 contrôles
  sur 17 : zones `@@ -10,4 +10,4 @@` et `@@ -211,2 +211,3 @@` seules ; 8 lignes changées de l'extrait, toutes `#` ; 5 du test, toutes `//` ;
  lignes de code de l'extrait égales ; l.1-9 et l.14-36 égales à l'octet ; la l.15 garde un `%2e%2e` ; aucune des trois requêtes de
  `said` dans les l.10-13 neuves, chacune une fois dans `said` ; transpilation TypeScript 6.0.3 (`removeComments`) égale à l'octet,
  sha256 `c5b511ffe13fa670383c4d69dc82cb332c619c63f7ca7083357530f772e5aa48` des deux côtés ; 1 987 jetons (scanner, trivia sautées) égaux ;
  nom du test inchangé ; 20 tueurs : mêmes spécifications dans le même ordre, chaque ancre une seule fois sur sa ligne cible, chaque
  pile juste au-dessus d'un `test(`. K12 à K20 descendent d'une ligne dans le fichier de test (l.235 vers 236 … l.394 vers 395), cibles
  inchangées. Diff du tour : `logs/diff-round.patch` `9cf32ba7…1d1f`.
- Tests ciblés (clone `--no-local` `c1`, HEAD `9e016897`, les trois fichiers copiés, sha256 égaux ; jonctions 220 entrées, 11 `@monark`,
  0 échec), 04:56:04Z-04:56:18Z : 17 fichiers, aucun marqueur du test 42, 13 noms DENY retirés (noms seuls) : **196 tests, 196 verts**,
  0 rouge, 0 annulé, 0 ignoré ; tests de l'extrait verts (TAP l.162, l.168), `dojo_page_lexicon_is_closed` (l.354),
  `dojo_caddyfile_serves_public_only_immutables_no_browse` (l.390). `logs/targeted.tap` `7863a6da…9c8d`.
- Portes (`c1`, commandes des scripts), 04:56:52Z-04:57:45Z, toutes à 0 : `typecheck`, `lint`, `lint:ratchet` (69/69), `lang:gate`,
  `gate:vocab` (330 fichiers) ; `logs/gates.out`, `logs/gate-*.log` ; `c1` sans artefact ensuite.
- `red-proof` (04:57:59Z-04:58:21Z), sortie 0, `ok: true` : 2 jugés, **2 F2P** (l.175 et l.210 : rouges à la base par assertion, verts au
  gel), 9 inchangés ; tirage 2 sur une population de 2, graine 415203789 : **2 tués** (`snippet:27` SDL, `snippet:30` SDL), fichier
  restauré (`c744cb01…` avant et après). Digest du gel `1d70373fefea62043d3d733d189a2039eeb4d761481f21321f6868c76f216437`.
  `rp1/RED-PROOF.json` `cfa9e92d46347fff25c71f9b65a68e143f8e1098c9f3dd8896828266052074e1`.
- Tueurs K5 à K11 (clone neuf `c2`, mêmes copies ; outil `41cdf83f…1ac8`), 04:59:01Z-04:59:27Z, sortie 0 : ligne de base verte (11 tests),
  **7 tués sur 7**, 0 survivant, 0 non conclu, 0 ancre perdue, restauration contrôlée à chaque mutant ; K7 à K10 rougissent les deux tests.
  `dirty` de `c2` `99298821…b213`, égal à celui de l'oracle (même arbre). `mut1/RESULTS.json`
  `d4a73a70bdee5e4f21f17ac0f1a5de5ab82ee1affd0389d777c4cd71e56da185` ; `RESULTS.txt` `6181b998…ba70`.
- Oracle du tronc : `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-sendprep --base d1120612… --key site-send-prep`,
  05:00:01Z-05:08:53Z, sortie **0**, seul sur l'hôte (verrou pris à 05:01:12Z, attente 0 s ; C-V-4 : 15 281 Mo libres, 17 `node.exe`).
  Enregistrement `F:/tmp/oracle-results/9e0168978448fc1bdf09b53985436adf5c2f4d9b-99298821e13ee978-corr-20261002T050001Z-118624.json`,
  sha256 `71f18f5a57498f93c11b35df67c0d7efe6340540136e9b3f9efda2a472eb3236` (copie à l'octet `oracle-corr-record.json`) ; arbre : tête
  `9e016897`, `dirty` `99298821…b213`, objet `8767caa04af69568f189ee07a542e3b644f748e4` ; `label` `site-send-prep` ; `served_from` null
  (arbre modifié : rejeu). Portes toutes à 0 : épinglage, `r25` (**55 + 7 = 62**, borne 1 205 ; contenu 0), `lang:gate`, `export:check`,
  `gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `test` (446,8 s). Tests : **1 870, 1 865 verts, 0 rouge, 5 ignorés** ; tests de
  l'extrait verts (`09-test.log` l.1964-1965), lexique (l.1996), test 42 vert une fois dans la suite (l.2048). Journaux copiés à
  l'octet : `oracle-logs/02-r25.log` `d4949846…d7fd5`, `oracle-logs/09-test.log` `ec1337b4…aa8c51`.
- Ignorés : 5 contre 4 aux oracles G1 et G2 ; l'écart est un seul test, `lot_retire_file_identity_keeps_every_bit_of_a_64_bit_ino`
  (`09-test.log` l.2120), qui a pris sa branche de saut déclarée : « no ino beyond the precision of a double here » (au plus 256 essais
  sur NTFS, `test/lot-retire-identity.test.ts`). Il n'importe que `node:*` et `scripts/lot/retire.mjs`, hors du diff du lot (4 fichiers) :
  dépendance au volume, sans lien avec un commentaire. Les quatre autres sauts sont ceux de la G2 (l.424, l.712, l.720, l.2771).
- Après l'oracle (05:10:27Z) : extrait, test et `dojo-copy.ts` égaux à leurs sha256 (`sha256sum -c logs/corrected.sha256`) ; seul ce
  journal a changé depuis (sections 12.4 à 12.6), hors du périmètre R-25 et sans test.

### 12.5 Écarts de conduite (`error_origin` : ce correcteur)

(1) Mon premier contrôle des tueurs exigeait chaque ligne `// killer:` juste au-dessus d'un `test(` : faux pour les tueurs empilés du
    fichier (K1-K2, K6-K11, K14-K15, K18-K20) : `red-proof.mjs` (l.18, l.63) lie au test la seule ligne juste au-dessus, l'outil de
    mutants (l.147) lit chaque ligne de la pile ; règle du contrôle corrigée (la pile se termine au-dessus d'un `test(`), rejoué : 17 sur
    17 ; sortie fautive gardée (`logs/comment-only.run1-strict-check.out`). Aucun fichier du lot touché par cette correction.
(2) Ma sonde et ma garde, à leur première écriture, portaient des barres inverses (expressions régulières) et des lignes de plus de
    160 caractères ; réécrites avant tout usage probant, contrôlées par la garde elle-même. Mon script d'attente a d'abord lu « exit= »
    dans les lignes de portes de l'oracle (fin annoncée à tort, rien n'a été lancé dessus) ; corrigé.
(3) Un `grep` avec une barre inverse dans le motif (04:39Z), refusé par `grep` (« Trailing backslash »), sans effet ; comptes ensuite par
    `node` (code 92).
(4) Sorties brutes d'outils gardées telles quelles, qui portent des barres inverses écrites par les outils (chemins Windows) :
    `logs/mk-nm-c1.out`, `logs/mk-nm-c2.out`, `logs/rm-nm.out`, `logs/rp1.out`, `logs/oracle.out`, `rp1/RED-PROOF.json` (champ `repo`),
    l'enregistrement de l'oracle ; aucun fichier écrit par moi n'en porte (garde).
(5) Aucun autre écart : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree` (ni `git write-tree`) ; git écrivant seulement par
    `git clone` de `c1` et `c2` et dans les clones jetables des outils ; aucune course pendant un verrou tenu par autrui ni pendant mon
    oracle ; aucun oracle arrêté ; aucun réseau ; aucune adresse IP écrite ; rien sur C: ; test 42 joué seulement dans la suite de
    l'oracle ; harnais de mutants lancé une seule fois, `RESULTS.txt` lu.

### 12.6 État à la remise et verdict

- Worktree `F:/Monark-wt-sendprep` : HEAD `9e016897` ; `status` : extrait, test et ce journal modifiés, rien d'autre ; le gel est un
  acte de l'orchestrateur. Tronc `F:/Monark` : HEAD `5082a696` à 04:38:52Z, `c7bde8bc` à 04:59:53Z, `ae655ffb` à 05:15:29Z (avancé par
  un autre que moi), `status` vide ; outils aux sha256 de la mission ; `node_modules` 220 entrées et 11 `@monark` avant et après
  (`logs/nm-trunk.log`).
- Clones `c1`, `c2`, `mut1/clone` : jonctions retirées par `rm-nm.ps1` (« removed », 05:10:5xZ) ; aucun `node_modules` sous
  `F:/tmp/dojo/sendprep-corr`. Dossiers de travail de `red-proof` et de l'oracle retirés par les outils. À 05:10:12Z, un autre oracle
  (`corr`, tête `bcc5a87a`, pid 415208, dossier `F:/tmp/oracle-runs/run-PlRfxa`) tient le verrou : pas le mien, non touché.
- Verdict proposé : **LIVRE**. C-1 et C-2 appliquées à la lettre, commentaires seuls (prouvé), portes, `red-proof`, tueurs K5 à K11 et
  oracle verts. Questions : Q-C1 (messages d'assertion l.182 et l.225, l.224 à `9e016897`), Q-C2 (lecture de « as is »), Q-C3 (le
  glissement d'une ligne du test, déclaré en 12.1 : cibles et numérotation des tueurs inchangées ; si la contrainte visait aussi les
  positions dans le fichier de test, deux lignes ne tiennent pas le contenu décidé : arbitrage de l'orchestrateur).
