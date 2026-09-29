claude-opus-5-5

# G1 — lot Dōjō PR-4a-2 (piste C, site) : synchro du site, égalité avec la CA

- **Modèle résolu** : `claude-opus-5-5` (R-1), worker implémenteur G1, effort max (mission), instance fraîche.
- **Mission** : `F:/tmp/dojo/mission-g1-pr4a2.md`, sha256 recalculé AVANT lecture :
  `a2aa40036dbb2c9d43417bfe1adf7367fbbf2c7e94d568f8d8576348444b8188` (égal à l'attendu) ; reçu vert
  `F:/tmp/dojo/mission-g1-pr4a2.recu.json` (lint 12 codes à 0, `base` = `head` = `80c224cfa63603d630ddf77aff84aad06a6d918a`).
- **Règles** : `F:/Monark/docs/methode/REGLES-MISSION.md` (7 685 octets) lu en entier.
- **Base** : worktree `F:/Monark-wt-dojo-pr4a2`, branche `lot/dojo-pr4a2`, HEAD `80c224cf` ; `git status --porcelain` vide à l'ouverture.
  `F:/Monark` est à `8b47a822` (un commit de plus : trois registres seuls, `git diff --stat 80c224cf 8b47a822`) ; les entrées sont lues au `80c224cf`.
- **Conduite git** : lecture seule dans le worktree (`status`, `diff`, `show`, `rev-parse`) ; clones `--no-local` sous `F:/tmp/dojo/pr4a2/`
  (`base`, `gel`) ; **aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`**, aucun commit, aucun réseau, rien sur C:.

## 0. Horaires (`date -u`)

| Heure | Acte |
|---|---|
| 19:36:34Z | sha256 de la mission recalculé, mission et reçu lus, règles lues ; worktree propre, verrou d'hôte libre |
| 19:51:03Z | sha256 des entrées relevés au `80c224cf` ; C-V-4 relevé ; advisor consulté (plan, avant écriture) |
| 19:58:29Z | ouverture du journal : clés de la CA recopiées, compte ascendant prévu, AVANT toute ligne de code |
| 20:00-20:09Z | synchro, surface de types, tests, édition É-1 |
| 20:10:15Z | verrou d'hôte tenu (cp-2, pid 65028 vivant, `held()`) : aucun test ; portes statiques seules, clone gel (20:11-20:13Z) |
| 20:14:17Z | verrou libre : tests ciblés (20:14:28Z, 20:14:35Z), preuve rouge d'É-1 (20:14:49Z), killers à la main (20:15:31Z) |
| 20:15:55Z | red-proof n° 1 : REFUSÉ par l'outillage (`node_modules` de `--repo`, section 8) |
| 20:20:08Z | verrou tenu (cp-2, pid 66728) : attente ; 20:24:13Z libre : rejeu, puis red-proof n° 2 OK (20:24:38-20:25:05Z) |
| 20:26:33Z | campagne de mutants de l'outil du tronc : 20 / 20 tués (fin 20:27:00Z) |
| 20:27:48Z | oracle G1 (verrou pris 20:28:55Z) : exit 0 à 20:36:48Z |
| 20:38:02Z | jonctions `node_modules` retirées (`rm-nm.ps1`) ; `F:/Monark/node_modules` intact (220 entrées) |

## 1. Entrées lues (sha256 et lignes au `80c224cf`, `git show 80c224cf:<chemin>`)

| Fichier | l. | sha256 |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-4.md` (en entier) | 246 | `d1b5bf35b7c659de3801974146fe8b216555dde776909fe3ea6004079ecbeea7` |
| `docs/adr/ADR-DOJO-PR-3.md` (§0, D-1, D-2, D-3) | 282 | `f1f0e12cde7f0d237041bf3b5ace932d9cf8770fe32396135b8fd2a8665b3526` |
| `docs/CHECKPOINT1-lot-dojo-pr4.md` | 42 | `fdda34fa9848a8e8a93105a18d2e678bbff6af3e3b3faa82fb3358ac59161d16` |
| `apps/site/lib/dojo-served-load.ts` | 248 | `a83faaed956f54225481373dbcbec1ca06e70c4e3ee152ac5d792f728fda5a88` |
| `apps/site/lib/dojo-served.ts` | 41 | `0eeae2b3ceed980b4e8b78233ea5f863108a67406bca8727d2f07007658c8d00` |
| `test/dojo-served.test.ts` | 212 | `cd76b4ff9afe410d5bf3d4b0f76819b2f289c5f60a152403e9ae8cf8c1ce9fbf` |
| `apps/dojo/scripts/dojo-verify.mjs` | 355 | `d768df168b1784bc53e76989c0a767bfb7e737f7fd7c6075565bb7fc98b349cb` |
| `scripts/sync-bell-served.mjs` (précédent Bell) | 91 | `1bb60dbbf5a59a3fcdac50eba4c96eb4ef4a5224fe83b0077635d8cfbd4b5bbc` |
| `docs/CHANTIERS.md` (entrées 19:32Z et 19:36Z) | 2 183 | `7db13ba13cd791923874e6fff16f3a293d29a625cc4025c8784d72c9d3c41532` |

- Précédents relus : `scripts/sync-ukemi-served.mjs` (+ `.d.mts` : `setManifestEntry` par aller-retour canonique, ajout d'entrée),
  `apps/site/lib/bell-served-load.ts` l.440-446 et l.478-580 (liaison des corps à la CA, libellés lus et retirés),
  `test/bell-served.test.ts` l.82-153, 193-218 ; mère `docs/adr/ADR-DOJO-SNAPSHOT-1.md` D-11 l.266, T-11 l.435, l.280 ;
  `docs/G1-lot-dojo-pr4a1.md` §3 point 5, §10, §14 ; `test/ci-gates.test.ts` l.1171-1212 (`dojo_register_is_frozen`) ;
  outils du tronc `scripts/red-proof.mjs`, `scripts/mutants/run.mjs`, `scripts/oracle/run.mjs`, `r25.mjs`, `lock.mjs`.

## 2. DOJO-CA-FORMAT-1, recopié (ADR-DOJO-PR-3 D-2 l.84, fichier au tronc sha256 `f1f0e12c…3526`)

- La ligne l.84 seule (sans son LF) a pour sha256 `3024482e26d653563b7adb9391d0ab09c73e70bc6e8cb9ff731cbcec2d4c0f90`, épinglé par
  `dojo_served_data_matches_deploy_ca` ; toute ligne datée qui l'amende change ce pin (et la lecture de la synchro).
- Clés fermées de `docs/deploy-CA-dojo.json` : `schema` = `dojo-deploy-ca-v1`, `url`, `g7`, `checks` (liste ordonnée de
  `{name, pass, detail}`), `tls` (`authorized`), `head` (`seq`, `day`, `lines_sha256`, `lines_count`, `recomputed_root`),
  `history` (`history_sha256`, `history_lines_count`, `history_root`, ou `null` avant la ligne `history`), `bodies_sha256`,
  `inputs_sha256`.
- Contrôles, dans l'ordre : `c01_timeline_jsonl`, `c02_pubkey_equals_committed_keyring`, `c03_dojo_verify_keyring_root`,
  `c04_acao_star`, `c05_no_directory_listing`, `c06_cache_immutable_lines_history_no_cache_timeline`, `c07_tls_authorized`,
  `c08_no_private_material_served`, `c09_loaded_config_equals_g7`, `c10_bell_and_probe_untouched`,
  `c11_head_and_history_recomputed`, `c12_immutables_hash_to_their_names`.
- Non gelé par ce format (lu, pas deviné en silence) : les clés internes de `bodies_sha256` et d'`inputs_sha256` ; la
  référence du « G7 » pour juger une CA périmée. Choix de ce G1 et questions : section 3 (Q-G1-1, Q-G1-2).

## 3. Décisions portées par la mission (décision 275 de l'orchestrateur) et choix de ce G1

- **Décision 275, citée** : périmètre fermé (`scripts/sync-dojo-served.mjs` + `.d.mts`, `setManifestEntry` et `$comment`,
  `dojo_served_data_matches_deploy_ca` à deux jambes, `dojo_sync_drops_operator_labels`) ; règle P-10 ; refus d'une CA
  périmée, d'une CA sans racine recomputée ou sans racine d'historique, d'une jambe committée qui passe sur une absence non
  vérifiée ; aucun libellé d'opérateur vers le site ; CA de test synthétique générée par le test ; budget 260 ascendantes.
- `$comment` = celui du **manifeste** (mère D-11 l.266 : « de son entrée de manifeste (`setManifestEntry`), et du `$comment`
  du manifeste » ; T-11 l.435 : « `apps/site/data/manifest.sha256.json` (entrée et `$comment`) »).
- `setManifestEntry` vit dans la synchro (motif `scripts/sync-ukemi-served.mjs`) : `dojo-served-load.ts` n'est pas modifié.
- **Choix 1, entrées-sorties injectées** : `runSync({root, g7, get, readAt})` lit le trousseau committé, la CA et le manifeste
  sous `root`, les corps servis par `get(rel)`, puis écrit l'enregistrement et le manifeste ; la CLI passe un GET HTTPS borné
  (https seul, redirection refusée, 200 seul, corps ≤ `VERIFY_BOUNDS.MAX_BODY_BYTES`) ; le test passe une `Map` et une racine
  temporaire : « rien synchronisé » s'y constate sans réseau (fichier absent, manifeste inchangé octet pour octet).
- **Choix 2 (Q-G1-1)** : clés internes de `bodies_sha256` lues sous la forme de la CA de Bell (`docs/deploy-CA-bell.json` :
  chemins d'URL `/timeline.jsonl`, `/bell/pubkey.json`), soit `/timeline.jsonl` et `/dojo/pubkey.json`, constantes exportées
  `CA_BODY_PATHS` ; non gelé par DOJO-CA-FORMAT-1 : à porter par ligne datée à l'ADR PR-3 (l'écrivain de PR-3b-2 s'y épingle).
- **Choix 3 (Q-G1-2)** : référence du G7 = `--g7 <40 hex>` de l'acte de synchro (motif `scripts/verify-bell.mjs` l.6 et l.131,
  `--g7` exigé) ; la CA doit nommer ce G7. Alternative non disponible : blobs de l'arbre de publication au G7 = HEAD, quand
  la liste de cet arbre existera (PR-3b-2 ; `scripts/dojo-deploy.mjs` l.3 : « The publication side ... is not written here »).
- **Choix 4 (garde des libellés)** : libellés de lecture du Dōjō `CHAIN_OPERATORS` (`apps/dojo/src/dojo-methods.ts` l.16,
  importé, jamais recopié), formes `OPERATOR_FORMS` et `DATA_SOURCE_FORMS` (`scripts/public-text-deny.mjs`, non exporté) et
  portée `site` de `vocab-banned.json` (mesuré : cette portée ne lit que `.ts`, `.tsx`, `.mdx`, jamais le JSON des données) ;
  toute chaîne de l'enregistrement (clés comprises) ; un libellé ⇒ refus, rien écrit (l'ancre est signée et portée entière,
  un champ ne peut en être retiré). Mesuré : le marcheur n'exige de `pool`, `pool_quote_vault`, `sol_usd_source` qu'une
  chaîne non vide (`apps/dojo/scripts/dojo-chain.mjs` l.31 et l.54) : la garde de la synchro est la seule barrière.
  Résidu déclaré : les motifs à bornes de mot peuvent, avec une probabilité de l'ordre de 1e-6 par enregistrement, toucher une
  valeur base64url (`sig`, `x`) ; le sens de l'erreur est le refus (rien écrit), jamais une fuite.
- **Choix 5** : la jambe committée juge par une fonction de production exportée (`committedRefusals`), pour que M-P20 soit un
  mutant du code et non du test ; présence : liaison à la CA committée ; absence : ni fichier, ni entrée, registre `upcoming`.
- **Choix 6** : une CA à `history` nul est refusée (un `snapshot` n'est servi qu'après la ligne `history`, ADR PR-3 D-2
  « le premier `snapshot` attend la ligne `history` » ; `buildDojoServed` refuse une chronologie sans ligne `history`).
- **DOJO-SERVED-VERIFIED-FIGURES-1, forme (A)** (ADR PR-4 D-3, pli C-G2-2) : tenue par la liaison à la CA (égalité de
  `head.seq`, `head.day` et du sha256 de `timeline.jsonl`, `c03_dojo_verify_keyring_root` à `pass: true`, comme les onze autres).
- **É-1, écart forcé hors des sorties déclarées (Q-G1-3)** : `test/ci-gates.test.ts` l.1211 (`dojo_register_is_frozen`) exigeait
  que le test `dojo_served_data_matches_deploy_ca` n'existe pas (« only the unwritten committed leg refuses ») ; l'écrire, comme la
  mission l'exige, rougit ce test existant. Édition minimale portée, preuve rouge / vert en section 7.
- **Items dont le déclencheur est ce G1, hors du périmètre fermé** : DOJO-SERVED-DEPLOY-CHECK-1 (Q-G1-4) et
  DOJO-SERVED-FIXTURE-SPREAD-1 (Q-G1-5) : aucun code, questions formées. **C-8 constaté** : `dojo-chain.mjs` l.104 (« one
  history line ») et l.116 (`st.history !== null` ⇒ `timeline_malformed`) : une chronologie qui marche ne porte qu'une ligne
  `history` ; le mutant C-8 (dernière ligne `history` au lieu de la première) est équivalent par construction.

## 4. Compte ascendant prévu (avant écriture) et mesure

| Fichier | Ascendantes prévues | Mesuré (insertions + suppressions) |
|---|---|---|
| `scripts/sync-dojo-served.mjs` | 160 | 174 |
| `scripts/sync-dojo-served.d.mts` | 30 | 33 |
| `test/dojo-served.test.ts` (deux tests, aides) | 100 | 141 (138 + 3) |
| `test/ci-gates.test.ts` (É-1) | 8 | 10 (7 + 3) |
| **Total** | **≈ 298** (ADR : 260) | **358** (R-25 de l'oracle, section 12) |

- Prévu ≤ 547 : le G1 a continué. Mesuré 358 = × 1,20 du prévu, × 1,38 de l'ADR (260), sous les 546 prédits à × 2,1, sous le
  STOP 1 150 et la borne CI 1 205. C-V-4 à l'ouverture (19:51Z) : 24 processus `node`, 16 830 Mo physiques et 36 949 Mo
  virtuels libres (`Get-CimInstance Win32_OperatingSystem`) ; avant la campagne (20:26Z) : 12, 15 875 Mo, 38 469 Mo.

## 5. Livrables (worktree `F:/Monark-wt-dojo-pr4a2`, non committés : le gel est un acte de l'orchestrateur)

| Fichier | l. | sha256 |
|---|---|---|
| `scripts/sync-dojo-served.mjs` (neuf) | 174 | `5f2ff3bb8706083688481303b1a83b4617dca6fec314220ab2d44d93b68fab79` |
| `scripts/sync-dojo-served.d.mts` (neuf) | 33 | `b846d4ff7de79a370a087641fcc283e69035617a0fd48fd45fea87ee76af003a` |
| `test/dojo-served.test.ts` (modifié) | 347 | `db1de7749b3294ddd67714e82ba49ebf456a3f2d2268c101dd4c0f34baba65b7` |
| `test/ci-gates.test.ts` (modifié, É-1) | 1 751 | `26235ed3869270311e2193ed28d77d814da0ce2e6e29aa32a06997b212bd71dd` |

- La synchro est un outil du dépôt source, non exporté (`scripts/` hors liste blanche de `scripts/export-public.mjs` ;
  `export:check` vert) ; le test racine n'est pas exporté. `apps/site/lib/dojo-served-load.ts` : **inchangé**.
- Aucun `dojo-served.json`, aucune `docs/deploy-CA-dojo.json`, aucun trousseau Dōjō committé (FM-2.6 : une CA de test verte
  n'est pas un déploiement) ; le manifeste du site est inchangé (l'entrée et la clause du `$comment` sont écrites par l'acte).
- Tuyaux (ADR-M018 D3, ADR PR-4 §3) : **TU-7** composé en test (`runSync` sur l'arbre servi signé de la fixture, CA de test,
  racine temporaire, relu par `loadDojoServed`) ; **absent** au dépôt jusqu'à l'acte (DOJO-SYNC-AFTER-ANNOUNCE-1) ; la jambe
  committée juge aujourd'hui l'absence ; la pièce reste `upcoming` ; aucun tuyau n'est déclaré servi par ce G1.

## 6. Tâche → fichier → test → mutant

Fichier des tâches 1 à 7 : `scripts/sync-dojo-served.mjs` ; test D = `dojo_served_data_matches_deploy_ca`, test L =
`dojo_sync_drops_operator_labels` (tous deux dans `test/dojo-served.test.ts`). Killers numérotés comme l'outil de mutants
(fichiers triés, puis ligne) : K1 = `apps/site/lib/dojo-register.ts:19`, K2 = synchro l.74, K3 = synchro l.145.

1. Synchro et P-10 (aucun chiffre que `dojo-verify` refuse) : `runSync` l.135-151 (vérification complète dans `buildDojoServed`) ;
   test D (fenêtre du trousseau fermée à seq 5 : refus, rien écrit) ; mutant N7.
2. CA périmée (autre tête, autre G7, autres corps), rien synchronisé : `bindDojoCa` l.71, l.73, l.77, écritures après tous les
   contrôles ; test D (variantes, puis CA de la tête E1 à travers `runSync`) ; mutants M-P7, M-P7b, M-P7c.
3. CA sans racine recomputée ou sans racine d'historique : `bindDojoCa` l.74 à l.76 ; test D ; mutants M-P9 (et K2), M-P9h, M-P9n.
4. CA hors DOJO-CA-FORMAT-1 (hôte, schéma, clés, douze contrôles par nom et rang, verts, TLS) : `bindDojoCa` l.65, l.67, l.70 ;
   test D (pin de la puce de l'ADR, noms des contrôles lus dans l'ADR) ; mutants N1, N2, N3, N5.
5. Jambe committée, cohérence de l'absence : `committedRefusals` l.110-121 ; test D (dépôt tel que committé, absences
   incohérentes) ; mutants M-P20, M-P20b, M-P20c, N6.
6. `setManifestEntry` et `$comment` du manifeste : l.96-106 ; test D (entrée et clause seules, second passage identique, clause et
   `$comment` de l'enregistrement passés aux formes « cuisine » et de noms du site : KITCHEN-PUBLIC-1 les lira à l'acte) ; N4.
7. Libellé d'opérateur retiré (textes de la CA jamais copiés) ou refus (ancre signée) : `LABEL_FORMS` l.52, `operatorLabelsIn`,
   `runSync` l.145 ; test L ; mutants M-P6 et K3.
8. Registre (É-1) : `test/ci-gates.test.ts`, `dojo_register_is_frozen` ; killer K1 (`apps/site/lib/dojo-register.ts:19`).

## 7. É-1 : `dojo_register_is_frozen`, preuve rouge / vert

- Rouge sans l'édit (clone gel, `ci-gates.test.ts` remis au `80c224cf` par `git show`, le test neuf présent) :
  `F:/tmp/dojo/pr4a2/e1-red.log` : `AssertionError [ERR_ASSERTION]: only the unwritten committed leg refuses`, `actual: []`.
- Édition portée (7 insertions, 3 suppressions) : ligne `// killer:` au-dessus du test (K1) ; commentaire (2) mis à jour ;
  l'assertion retournée (`[]` : toutes conditions tenues, le registre PEUT dire `built`) ; la branche « test non écrit » gardée
  vivante sur un identifiant fictif ; `existsSync(scripts/sync-dojo-served.mjs)` : la jambe committée vient avec la synchro qui
  écrit l'enregistrement qu'elle lit (assertion qui rend le test F2P : à la base, red-proof copie les tests du gel, pas la synchro).
- Les conditions M-P4, M-P18, M-P21 du registre sont inchangées et refusent toujours `built` (enregistrement nul, sans version).

## 8. Écarts d'exécution relevés (aucun contournement)

- **Heredoc** : le premier script d'aide jetable `F:/tmp/dojo/pr4a2/killcheck.mjs` portait deux séquences « barre inverse, n »
  écrites par heredoc (octets vérifiés intacts par `od -c`), contre la règle ; réécrit avec l'outil d'écriture
  (`String.fromCharCode(10)`). Même défaut, une fois, dans ce journal (la phrase qui décrivait l'écart) : corrigé par l'outil
  d'écriture. Les fichiers livrés à barres inverses (la synchro, le test) sont écrits par l'outil d'écriture, jamais par heredoc.
- **red-proof et `node_modules` de `--repo`** (mesuré, 20:16Z) : `linkModules` de `scripts/red-proof.mjs` (l.135-146) ne relie
  que les entrées non liées de `<repo>/node_modules` et les espaces de travail `@monark` ; un `node_modules` fait de jonctions par
  `mk-nm.ps1` perd donc `typescript` : `test/ci-gates.test.ts` rougit par import aux deux côtés (première preuve REFUSÉE,
  `F:/tmp/dojo/pr4a2/f2p/RED-PROOF.json`, gardée). Remède : `rm-nm.ps1` puis une seule jonction `base/node_modules` →
  `F:/Monark/node_modules` (les entrées vues par `linkModules` sont alors les répertoires réels du checkout principal) ; seconde
  preuve dans un dossier neuf `f2p2`. Item formé : RED-PROOF-NM-JUNCTION-1 (section 15). Pour la campagne de mutants, `node_modules`
  dans le dossier de sortie par `mk-nm.ps1 -Tree <out>` : ses 10 entrées `@monark` restent vides (« NO WORKSPACE », aucune cible
  ne les importe : relevé par `grep`), ligne de base verte.
- **Verrou d'hôte** : tenu deux fois par un cp-2 d'un autre lot (pid 65028 puis 66728, vivants par `held()`) ; aucun test ni
  harnais lancé pendant ces fenêtres (seules les portes statiques du clone gel, que l'oracle lui-même court hors verrou).

## 9. Tests (clone gel `F:/tmp/dojo/pr4a2/gel` = worktree, `cmp` égal ; TEMP `F:/tmp/dojo/pr4a2/tmp`)

- `test/dojo-served.test.ts` entier : 6 / 6 verts (`run-3.log`, 20:24:32Z) : les quatre existants, les deux neufs.
- `dojo_register_is_frozen` : vert (`run-2.log`) ; rouge sans l'édit (`e1-red.log`, section 7).
- Fichiers exposés (`ci-gates`, `byte-guard`, `deps-hygiene`, `export-public`, `dojo-page`, `public-text-deny`) : 61 / 61
  (`run-4.log`, 20:27:36Z, test 42 sauté ici, couru par l'oracle).
- Portes statiques du clone gel : `tsc --noEmit` 0 (fichiers du lot dans le programme : `--listFiles`), ESLint 0, cliquet des six
  règles `no-unsafe-*` : 9 → 9 sur `ci-gates`, 0 → 0 sur `dojo-served` (`ratchet-base.json`, `ratchet-gel.json`) ; `gate:vocab`,
  `lang:gate`, `export:check` : 0. Suite complète : oracle (section 12).
- Garde d'octets : aucun TAB, aucun octet de contrôle dans les fichiers livrés ; barres inverses : 0 dans le `.d.mts` et le
  journal, 16 dans la synchro (sources de regex).
- CLI, sans réseau, dans le clone gel (20:53:16Z, verrou libre, après l'avis final de l'advisor) : sans argument, exit 1,
  message d'usage (`cli-1.log`, sha256 `909e9f78…ffb7`) ; `--g7 0123…4567`, exit 1 sur ENOENT de `apps/dojo/keys/dojo-keyring.json`
  (`cli-2.log`, sha256 `672b3c51…3587`) : la racine de confiance est lue AVANT tout GET, et rien n'est écrit (statut du clone
  inchangé) ; le trousseau committé n'existe pas encore au tronc (DOJO-KEY-1, acte A-8).

## 10. F2P (outil du tronc `scripts/red-proof.mjs`)

- Commande : `node F:/Monark/scripts/red-proof.mjs --base 80c224cf --gel F:/Monark-wt-dojo-pr4a2 --repo F:/tmp/dojo/pr4a2/base
  --out F:/tmp/dojo/pr4a2/f2p2 --draw 3 --seed 2026` (celle de la mission, `--out` neuf après le refus d'outillage de la section 8).
- **Preuve retenue** : `F:/tmp/dojo/pr4a2/f2p2/RED-PROOF.json`, sha256
  `a766f67972a80e42292ec778ce9eacd96835ece54335e65d0a20794fac2d4cf2`, `ok: true`, 20:25:05Z ; `gel.digest`
  `d1556d0cf49ac4424d203f6757c21e6f7d2e85dfed691c8acf2ae83b7e5fe42c` ; 3 jugés, 36 inchangés :
  `dojo_register_is_frozen` **F2P** (base `assert-fail`, gel `pass`) ; `dojo_served_data_matches_deploy_ca` et
  `dojo_sync_drops_operator_labels` **new-module** (la base ne charge pas `scripts/sync-dojo-served.mjs`, ajouté par le diff).
- Tirage 3 sur 3, graine 2026 : K `sync-dojo-served.mjs:74` SDL, `dojo-register.ts:19` CONST, `sync-dojo-served.mjs:145` SDL :
  **tués**, sha256 avant = après.
- Première preuve (refusée par l'outillage, section 8) : `F:/tmp/dojo/pr4a2/f2p/RED-PROOF.json`, sha256
  `15fb78f9b36b89bcedabf72666e95031dbdda583db3435c78f8ae998b91fccec` (le dossier `--out` de la mission, gardé en preuve).

## 11. Mutants (outil du tronc `node F:/Monark/scripts/mutants/run.mjs`)

- Commande : `--repo F:/tmp/dojo/pr4a2/gel --base 80c224cf --out F:/tmp/dojo/pr4a2/mutants --table
  F:/tmp/dojo/pr4a2/mutants-table.mjs --killers --file scripts/sync-dojo-served.mjs --targets test/dojo-served.test.ts
  --lock-root F:/tmp --min-free-mb 4096` ; `held(F:/tmp)` nul avant le lancement ; aucune course ni oracle pendant la campagne.
- `RESULTS.json` : `F:/tmp/dojo/pr4a2/mutants/RESULTS.json`, sha256 `0d6f08c5e4252dead0dd5605a75c853ab1e7db5e9cbd7ad6eccc7353687cf91e` ;
  table sha256 `02c314a9a83f89e20acf64b2dd74a65201c4f63b2529dcc7749dea61d8fc5b65` ; outil sha256 `2606e7da…3b19`, arbre `8b47a822`.
- Ligne de base verte (39 tests) ; **20 / 20 tués**, tous stricts (ERR_ASSERTION seul), sha256 restaurés : M-P6, M-P7, M-P7b,
  M-P7c, M-P9, M-P9h, M-P9n, M-P20, M-P20b, M-P20c, N1 à N7, K1 à K3. Mutants de l'ADR : M-P6, M-P7, M-P9 côté CA (M-P9, M-P9h,
  M-P9n), M-P20 ; neufs : sept (N1 à N7, `why` dans la table).

## 12. Oracle et R-25 (`node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr4a2 --base 80c224cf --key PR-4a-2`)

- Enregistrement : `F:/tmp/oracle-results/80c224cfa63603d630ddf77aff84aad06a6d918a-7efd9eb646ac223a-G1-20260929T202748Z-34252.json`,
  sha256 `c8419cd105278ab1f2b7f1a3e0f872fbaa973e22cb5ceab1c2f980221b5b1bb3` ; `exit` 0, `static_only` false, `served_from` nul
  (rejoué) ; arbre `dirty` `7efd9eb6…e055`, objet `4a10902f922c4cd40c2927214cca57ac4ceb862d` ; 20:27:48Z → 20:36:48Z.
- Portes : épinglage des modèles, r25, `lang:gate`, `export:check`, `gate:vocab`, typecheck, lint, cliquet, test : toutes à 0.
  Suite : 1 710 tests, 1 707 verts, **0 rouge**, 3 sautés (sentinelle SIGTERM, nom court 8.3, artefacts u4b : étrangers au
  lot) ; test 42 vert (448 s) ; les trois tests du lot verts dans la suite. C-V-4 de l'oracle : 14 `node.exe`, 16 038 Mo libres.
- **R-25** (calcul exporté `r25()` de `scripts/oracle/r25.mjs`, dans l'oracle) : `STAT` 352 insertions, 6 suppressions,
  **358** changées (borne `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0.
- Seul ce journal (`docs/*.md`, hors R-25, hors code) a changé depuis le gel de l'oracle.

## 13. MAST (C-V-5 ; modes de la mission)

- **FM-1.1 dérive de format** (étiquette de la mission : FM-2.3 ; Q-G1-6) : risque, une CA lue sous d'autres clés que
  DOJO-CA-FORMAT-1 ; parade : pin de la puce l.84 (`3024482e…`), contrôles lus dans l'ADR ; résidu DOJO-CA-BODY-KEYS-1.
- **FM-1.3 périmètre** : risque, du code hors de la liste fermée ; parade : É-1 seul (forcé, Q-G1-3) ; DEPLOY-CHECK-1 et
  FIXTURE-SPREAD-1 non codés (Q-G1-4, Q-G1-5) ; `dojo-served-load.ts` inchangé.
- **FM-2.6** (étiquette de la mission : une CA de test verte n'est pas un déploiement) : risque, un registre `built` sur données
  de test ; parade : aucune CA ni donnée réelle committée ; la jambe committée juge l'absence cohérente, registre `upcoming`.
- **FM-3.3 vérification incorrecte** : risque, une CA de test recopiée de l'enregistrement ; parade : CA recalculée des octets
  servis (Merkle recodé dans le test) ; 20 / 20 mutants stricts.

## 14. `error_origin` proposés (assignés au G7 par l'orchestrateur)

- É-1 : planificateur de la mission (sorties déclarées sans `test/ci-gates.test.ts` ; le test de PR-4b l'annonçait :
  « Today the committed leg's test is not written yet (it comes with the sync) »).
- Première preuve F2P refusée : outillage (`red-proof.mjs` et `mk-nm.ps1`), RED-PROOF-NM-JUNCTION-1.
- Barres inverses en heredoc (deux fois) : worker (ce G1), corrigé en place, aucune trace dans un fichier livré.
- Étiquette MAST : planificateur de la mission (FM-2.3 contre FM-1.1 du pli cp-1 C-V-3, ADR PR-4 l.195).

## 15. Items formés (aucun « dû » nu) et questions à l'orchestrateur

- **DOJO-CA-BODY-KEYS-1** (format) : noms internes de `bodies_sha256` (lus `/timeline.jsonl`, `/dojo/pubkey.json`), forme
  fermée de `tls` (`{authorized}`) et de chaque contrôle (`{name, pass, detail}`), à porter par ligne datée de DOJO-CA-FORMAT-1 ;
  déclencheur : G0 ou G1 de PR-3b-2 ; propriétaire : orchestrateur.
- **DOJO-SYNC-G7-REF-1** (décision) : référence du G7 : `--g7` de l'acte (ce G1) ou blobs de l'arbre de publication au G7 = HEAD ;
  déclencheur : G0 de PR-3b-2 ; propriétaire : orchestrateur.
- **DOJO-SYNC-COST-1** (recherche) : chaque acte relit TOUS les fichiers de lignes servis (vérification complète, forme (B)) :
  coût linéaire en nombre de `snapshot` ; déclencheur : 30e `snapshot` servi ; propriétaire : orchestrateur. Recherche jointe
  (sources au dépôt, lues à ce G1) : `dojo-verify.mjs` l.251-293 lit le fichier de lignes de chaque `snapshot` (les piles d'un jour
  découlent de la veille) ; borne par corps `VERIFY_BOUNDS` (64 Mio, l.37), aucune borne totale ; voie à instruire : un état de
  piles vérifié et committé (sha256), repris par la vérification suivante (preuve de cohérence de journal, RFC 9162 §2.1.4,
  déjà lue pour PR-1a : FAITS-RFC6962-1) ; mesure réelle au premier acte (TU-7).
- **RED-PROOF-NM-JUNCTION-1** (outil) : `linkModules` de `red-proof.mjs` saute les jonctions de `<repo>/node_modules` :
  documenter la forme exigée de `--repo`, ou suivre les jonctions ; déclencheur : prochain lot outillé ; propriétaire : orchestrateur.
- **Q-G1-1** : DOJO-CA-BODY-KEYS-1, forme proposée : chemins d'URL, motif de `docs/deploy-CA-bell.json` ; `CA_BODY_PATHS` exporté.
  Même ligne datée, pour que l'écrivain de PR-3b-2 s'y épingle : la forme LUE de `tls` (clés fermées `{authorized}`, lecture
  littérale de la l.84 ; la CA de Bell porte aussi `host`, `issuer`, `valid_to`) et de chaque contrôle (`{name, pass, detail}`,
  fermé). Une ligne datée SÉPARÉE laisse vert le pin `3024482e…` du test ; une édition EN PLACE de la l.84 le rougit (re-pin
  d'une ligne du test, voulu : la lecture de la synchro change avec le format).
- **Q-G1-2** : DOJO-SYNC-G7-REF-1 : `--g7` retenu (motif `verify-bell.mjs`) ; la jambe committée ne juge pas le G7 (`g7` nul).
- **Q-G1-3** : É-1 (section 7) : édition de `test/ci-gates.test.ts` hors des sorties déclarées de la mission ; ratifier, ou
  la reprendre par une mission ; sans elle, `dojo_register_is_frozen` rougit dès que le test de la jambe committée existe.
- **Q-G1-4** : DOJO-SERVED-DEPLOY-CHECK-1 (déclencheur : ce G1) hors du périmètre fermé : proposition de clore « sans objet »
  (la page ne rend aucun compte de la CA ; la jambe committée lie l'enregistrement à la CA par tête, historique et corps), ou
  de déplacer son déclencheur au G0 de PR-4c-1.
- **Q-G1-5** : DOJO-SERVED-FIXTURE-SPREAD-1 (déclencheur : ce G1 ; tuer G-M8 et G-M19) hors du périmètre fermé : aucun code ;
  déplacer son déclencheur (lot de fixture de la piste A, ou G1 de PR-4c-1). C-8 constaté ici (section 3).
- **Q-G1-6** : étiquette MAST de la dérive de format : FM-2.3 dans la mission, FM-1.1 au pli cp-1 C-V-3 (ADR PR-4 l.195) ;
  ce journal suit l'ADR et cite l'étiquette de la mission.

## 16. Advisor

- Outil intégré consulté après l'orientation, avant toute écriture (plan en huit points) : conseil, jamais verdict. Retenus et
  vérifiés sur pièce : piège red-proof sur un test existant modifié (killer immédiatement au-dessus, F2P par une assertion qui
  dépend de code ajouté) ; forme canonique du manifeste mesurée avant de choisir l'aller-retour (vraie) ; clés de
  `bodies_sha256` et `--g7` exposés en questions ; killers vérifiés à la main par ERR_ASSERTION avant red-proof ; disposition de
  `node_modules` d'une campagne récente relue (`F:/tmp/dojo/cp2-rg1c/mutants`) ; items hors périmètre formés, C-8 constaté.

## 17. Provenance et état final

- Généré par `claude-opus-5-5` (worker G1, effort max), 2026-09-29, contexte : mission ci-dessus ; réviseurs attendus : G2
  (instance séparée), cp-2 (validateur-humain), G7 (orchestrateur). Aucun commit, aucun workflow (R-20).
- `git status --porcelain` final du worktree : ` M test/ci-gates.test.ts`, ` M test/dojo-served.test.ts`,
  `?? docs/G1-lot-dojo-pr4a2.md`, `?? scripts/sync-dojo-served.d.mts`, `?? scripts/sync-dojo-served.mjs`.
- Hors dépôt : `F:/tmp/dojo/pr4a2/` (clones `base`, `gel`, `f2p`, `f2p2`, `mutants`, journaux `run-*.log`, `e1-red.log`,
  `ratchet-*.json`, `tsc-*.log`, table et aide) ; `F:/tmp/dojo/pr4a2-deliver/` (`REPONSE.md`, `DELIVERED.sha256`).
