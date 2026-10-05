# G0 du lot UKEMI-PENDING-SNAPSHOT-1 : instantané en attente de l'état servi d'ukemi, avant C2

- **Sources** :
  - item formé au G0 d'UKEMI-PENDING-1, §6 point 3 (`docs/G0-lot-ukemi-pending-1.md`, décisions de MONARK `recherches` `e9cd32b`, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-UKEMI-PENDING-1-Q.md`, Q-UP-3) : « l'instantané en attente de l'état servi d'ukemi (`ukemi-pending.json`, `--pending` de la synchro d'ukemi, `loadUkemiPending`, l.623 et partie (1) de l.1175 lues contre lui ; dessin du §4, Q-UP-3, proposition) ». Déclencheur : le G0 du bloc C. Critère : le bloc C change l'empreinte C5 ou la clause liq. Prix noté : R-25 d'environ 405 ;
  - G7 d'UKEMI-PENDING-1 (`docs/G7-lot-ukemi-pending-1.md`), « Items » et « Bloc C simulé » ;
  - **déclenchement** : G0 du bloc C, `docs/G0-bloc-c-cm-3c-2.md` de `recherches/cm-3c-2` (`406bc823`, fusionné avec `87f6081c` en `d9f66af5`), §2 (ordre « C1 → UKEMI-PENDING-SNAPSHOT-1 → C2 → C' »), §3.4 (« Instantané d'ukemi : par le mécanisme d'UKEMI-PENDING-SNAPSHOT-1 »), §8 P-6, §10 (« Déclenché. Critère rempli : C2 change l'empreinte C5 de la strate engagée […] et C' change la clause liq (S-8) »), §12 Q-M4 et Q-M5 ;
  - réponse de MONARK, `recherches` `coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-bloc-C-reponses.md` : **Q-M5** « oui. UKEMI-PENDING-SNAPSHOT-1 forme un lot à part sur la base, avant C2, avec la zone de Q-UP-1 rouverte sur les fichiers nommés jusqu'à sa fusion » ; **Q-M4** « compter » ; **Q-M13** « S-8 va en C' » ;
  - le mécanisme dont il est le pendant : SERVED-PENDING-1 (`docs/G0-lot-served-pending-1.md` §5, `docs/G7-lot-served-pending-1.md` et son pli de G2), schéma `monark-site-harness-pending-v1`, accepté par MONARK (Q-SP1-6) ;
  - code lu à `87f6081c` : `scripts/sync-ukemi-served.mjs` (225 lignes), `scripts/sync-ukemi-served.d.mts` (32), `apps/site/lib/ukemi-served-load.ts` (155), `apps/site/lib/ukemi-served-figures.ts`, `test/site-ukemi.test.ts` (1 641), `apps/site/data/ukemi-served.json` ; en regard, `scripts/sync-harness-served.mjs` (`pendingDiff`, `inProcessPending`, `markPendingSince`) et `apps/site/lib/harness-served-load.ts` (`loadHarnessPending`).
- **Base** : `origin/base/chantier-moteur-2026-10-03` = **`87f6081c`** (fusion de #141, CM-4b lot a ; refetchée). Branche `recherches/ukemi-pending-snapshot-1`, arbre `/home/user/monark-governance-ups`. Auteur : RECHERCHES. Borne R-25 : 547 lignes contre la base.
- **Statut** : G0 écrit **avant tout code**, arrêté sur les questions de la section 9. Rien n'est poussé, aucune PR n'est ouverte.

## 1. Ce que l'item exige

1. Un instantané **en attente** de l'état servi d'ukemi, `apps/site/data/ukemi-pending.json`, écrit **hors ligne, en processus**, par `node scripts/sync-ukemi-served.mjs --pending`, au temps (i) de chaque bloc qui change un fait d'ukemi servi (C2, puis C' si besoin).
2. Les tests de `test/site-ukemi.test.ts` qui comparent un fait d'ukemi **en processus** à `ukemi-served.json` le comparent à l'instantané en attente quand il existe, sinon au servi, comme aujourd'hui.
3. Les pages, `scripts/assert-fleet-html.mjs` et le texte rendu gardent le servi jusqu'à T0 (décision Q-SP1-2, transposée).
4. Au temps (ii), à T0, la synchro par défaut **promeut** : elle refuse d'écrire si le nouveau servi diffère de l'instantané en attente sur un champ partagé, sinon elle écrit le servi sans `pending_since` et retire l'instantané en attente.
5. **Rien de servi ne bouge dans ce lot** : aucun instantané en attente n'est versé (il entre avec C2, comme `harness-pending.json`, Q-SP1-6) ; sans lui, le chargeur, les pages, les octets du site et la synchro par défaut se comportent comme à la base.

## 2. Mesure du G0 (2026-10-05, Node 22.22.2 de l'hôte, variables de proxy retirées, TMPDIR propre)

- **Base verte** : `site-ukemi`, `verify-harness-liq`, `harness-served` : 48/48.
- **Empreintes de s0 mesurées** (`lookupCommittedCalibration`, 170 scores, rangés en ordre croissant dans le registre) :
  - C5 servie aujourd'hui (`calibDigest`, `ukemi-served.json` `liq_verdict.calibration_digest`, `UKEMI_LIQ_S0_CALIB_DIGEST_PINNED`) : `e7e67366…d4eff334` ;
  - `scoresSha256` des mêmes scores, dans l'ordre du registre (définition B-17 de C2, ordre `ascending` pour liq) : `a9277222…a6ee3c8`.

  C2 change donc l'empreinte de la strate engagée : le critère de l'item est rempli par la mesure, pas seulement par le plan.
- **Simulation 1, l'empreinte seule** (copie jetable de l'arbre, effacée) : `calibDigest` rendu égal à `scoresSha256`, épingles de `calibration.ts` (USDe, liq s0, `btc-dir` synthétique) et littéral `LIQ_S0_CALIB_DIGEST` de la CA ré-épinglés, rien d'autre. Sur `site-ukemi`, `verify-harness-liq`, `harness-served`, `narabi-live`, `site-build-fleet` (102 tests) : **4 rouges** :
  - `site_ukemi_course_served_stratum_status_bound_to_served_verdict` (l.1175 ; assertion l.1204, partie (1) : le servi contre `digestPinned`) ;
  - `site_ukemi_served_figures_read_from_the_two_files` (l.1480 ; assertion l.1486, le chiffre « digest » de la page contre `digestPinned`, l.1488) ;
  - `site_ukemi_digest_note_says_what_the_gate_returns` (l.1633 ; deux réponses de `runGate` en processus contre `liq_verdict.calibration_digest` du servi, l.1640) ;
  - `narabi_gate_facts_read_from_committed_sources` (`narabi-live:539`) : hors de ce lot (instantané du harnais et Q-M6 du bloc C, repointé par C2).

  Les deux dernières de `site-ukemi` (l.1480, l.1633) ne sont pas dans la liste de l'item (l.623, l.1175 (1)) : ce sont pourtant deux comparaisons en processus contre le servi, que la seule empreinte fait rougir. Ce lot les prend (Q-UPS-C6).
- **Simulation 2, une phrase de la clause liq** (copie jetable, effacée ; mandataire pessimiste de S-8 : `LIQ_H3_SENTENCE` allongée de quelques mots, donc la clause de `describeGate(true)` change) : **9 rouges** :
  - `site-ukemi` : `site_ukemi_copy_equals_served_liq_text` (l.152, la copie du site contre `gate.ts`), `site_ukemi_served_state_bound_to_harness_registry` (l.623), l.1175 (par la CA) ;
  - `verify-harness-liq` : les littéraux de la CA et les deux passages de la CA en processus (zone de C', P-4 du bloc C) ;
  - `harness-served:76`, `harness_pending_sync_writes_in_process_shapes`, `narabi-live:539` (instantané du harnais, régénéré par C').
- **Lecture** :
  - S-8, tel que le décrit le G0 du bloc C (§3.5 : « `honestyText` reçoit la case résolue »), change le texte `content` d'un appel liq en s1 à s3. L'état servi d'ukemi ne lit pas ce texte : il lit la clause de la **description** de `/gate` (`describeGate`, `servedFacts` de la synchro). Si S-8 ne touche que `honestyText`, la clause servie ne bouge pas et l.623 reste vert ; si S-8 touche une des phrases composées (simulation 2), l.623 et l.152 rougissent en C'. Ce G0 ne tranche pas la forme de S-8 : l'instantané porte `liq_clause` dans les deux cas, et C' le réécrit par `--pending` (section 6) ; l.152 est une question de zone pour C' (Q-UPS-M4).
  - La sonde de la synchro (`GATE_LIQ_BODY`, `yhat` de s0) reste en s0 : S-8 ne change pas son verdict. B-12 ne le change pas non plus (liq (170 ; 0,01) → 170, G0 du bloc C §4 ligne 4).
  - Le renommage B-17 (`calib_digest` → `scores_sha256`) des lecteurs de la synchro (`servedVerdictFacts`, l.122, l.131, l.149) reste au bloc C (Q-UP-4). Ce lot regroupe ces lectures en une seule fonction, partagée par le servi et l'en attente, pour que C2 les renomme une fois.

## 3. Périmètre exact et fichiers (zone de Q-UP-1 rouverte, Q-M5)

| Fichier | Ce que le lot y écrit |
|---|---|
| `scripts/sync-ukemi-served.mjs` | `verdictFactsOf` (contrôles du verdict contre l'état et le registre de l'arbre, sans la CA), que `servedVerdictFacts` appelle avant son contrôle de la CA, octets écrits inchangés ; `inProcessUkemiPending(writtenAt)` ; `markPendingSince(text, day)` ; `ukemiPendingDiff(served, pending)` sur la liste fixe ; `removeManifestEntry(text, rel)` ; `--pending` (`pendingMain`) ; promotion dans `main()` |
| `scripts/sync-ukemi-served.d.mts` | les déclarations des cinq fonctions neuves et de `PENDING_REL`, `PENDING_SCHEMA` |
| `apps/site/lib/ukemi-served-load.ts` | `loadUkemiServed` admet `pending_since` (jour UTC) et ne le rend pas ; `UKEMI_PENDING_REL`, `UkemiPending`, `loadUkemiPending(root)` (null sans fichier), `UKEMI_PENDING_SHARED` (liste fixe exportée, lue par la promotion) |
| `test/site-ukemi.test.ts` | l.623, l.1175 partie (1), l.1480 (la seule épingle en processus, l.1488), l.1633 : cible `loadUkemiPending(ROOT) ?? loadUkemiServed(ROOT)` ; `tmpRoot` copie l'instantané en attente quand l'arbre en porte un ; quatre tests neufs (section 5). Les `TRAPS` de l.1438 restent mot pour mot |

Restent dans la zone de Q-UP-1 **sans être touchés** : `scripts/verify-harness.mjs`, `test/verify-harness-liq.test.ts`, la ligne de `scripts/sync-harness-served.mjs`. Aucun autre fichier. Pas de fichier de données : `apps/site/data/ukemi-pending.json`, la clé `pending_since` de `apps/site/data/ukemi-served.json` et leurs entrées de `apps/site/data/manifest.sha256.json` entrent avec C2 (Q-UPS-M1).

## 4. Forme de l'instantané en attente (pendant de `monark-site-harness-pending-v1`)

- **Fichier** `apps/site/data/ukemi-pending.json`, schéma **`monark-site-ukemi-pending-v1`**, lu, comme le servi, après le contrôle de son empreinte (CRLF→LF) dans `manifest.sha256.json`.
- **Clés, closes** : `$comment`, `schema`, `written_at` (instant ISO UTC), puis les champs partagés avec le servi :
  - `served_class` ;
  - `registry_state` ;
  - `liq_clause` (la clause de la description de `/gate` **en processus**, par `servedFacts` sur `buildOpenApi()` via `handleJsonMirror`) ;
  - `cascade_uncalibrated_sentence_served` ;
  - `liq_verdict`, à huit clés : `path`, `stratum`, `verdict_reason`, `served_alpha`, `calibration_points`, `bound_margin_base`, `calibration_digest`, `interior_rank_min_n`.
- **Refusées** (rien de ce qui n'est lu que sur le serveur) : `host`, `path`, `read_at`, `body_sha256`, `liq_verdict.body_sha256`. Ni `openapi_sha256` (Q-UPS-C1).
- **Verdict en attente** : la réponse du harnais en processus au **même** objet `GATE_LIQ_BODY` (importé de la CA, jamais copié), contrôlée par `verdictFactsOf` contre l'état lu et la strate engagée de l'arbre (raison, `n_calib`, empreinte, q̂). Il n'est **pas** lié à la CA versée, qui est du temps (ii) (Q-UPS-C2).
- **`pending_since`** (`AAAA-MM-JJ`) dans le servi, inséré par `--pending` juste après `read_at`, aucun autre octet touché, gardé s'il est déjà posé (seconde écriture en C'). `loadUkemiServed` l'admet et rend la même projection. `loadUkemiPending` exige, en fermeture sûre :
  - un instantané en attente **si et seulement si** le servi porte `pending_since` ;
  - `pending_since` pas postérieur au jour de `written_at` ;
  - les mêmes contrôles de forme que le servi sur les champs partagés (état, clause ASCII ouverte par la phrase de son état, verdict clos et cohérent, seuil de rang intérieur recalculé).
- **Manifeste** : contrairement à la synchro du harnais, celle d'ukemi écrit déjà le manifeste (`setManifestEntry`). `--pending` pose donc les deux entrées (l'instantané en attente, neuve, après la dernière entrée `ukemi-` ; le servi marqué) ; la promotion retire l'entrée de l'instantané en attente (Q-UPS-C4).
- **Promotion** (`main()` par défaut, lancée par MONARK au temps (ii), après la CA) : si `ukemi-pending.json` existe, `ukemiPendingDiff` nomme chaque champ de `UKEMI_PENDING_SHARED` où le nouveau servi diffère (verdict comparé sans `body_sha256`), toute clé que l'instantané ne peut pas porter, et un schéma autre que `monark-site-ukemi-pending-v1` (m1 de la G2 de SERVED-PENDING-1, transposé). Non vide : rien n'est écrit. Vide : le servi est écrit sans `pending_since`, l'instantané en attente et son entrée de manifeste sont retirés.
- **Ce qui suit l'instantané en attente, ce qui garde le servi** :

  | Lecteur | Cible |
  |---|---|
  | pages (`/ukemi`, `/ukemi/course`, `/`, `/fleet`, docs), `servedFiguresOf`, `assert-fleet-html.mjs` | servi seul |
  | l.623 (état, clause, classe, drapeau cascade contre le module du harnais) | en attente, sinon servi |
  | l.1175 (1) : empreinte de la strate engagée contre `digestPinned` | en attente, sinon servi |
  | l.1175 (1) : `body_sha256` du servi contre la CA versée (l.1199) ; l.1397 (4), servi daté contre la CA | servi (deux faits du temps (ii)) |
  | l.1480 : figures de la page | servi ; seule l'épingle l.1488 (`digestPinned` en processus) lit l'en attente |
  | l.1633 : deux réponses de `runGate` en processus | en attente, sinon servi |

## 5. Ce que le lot doit prouver avant C2 (tests rouges à la base, tueurs)

**Tests rouges d'abord** (tous dans `test/site-ukemi.test.ts`). Les fonctions neuves sont lues par `await import(...)`, pour qu'à la base chaque test neuf rougisse par assertion (`loadUkemiPending` absent, `inProcessUkemiPending` absent) sans casser le chargement du fichier :

1. `ukemi_pending_snapshot_is_fail_closed` : sur un arbre temporaire, un instantané en attente sans `pending_since` sur le servi rougit ; `pending_since` sans instantané en attente rougit ; `pending_since` postérieur à `written_at` rougit ; chacune des clés refusées (`host`, `path`, `read_at`, `body_sha256`, `liq_verdict.body_sha256`) rougit ; un instantané non listé au manifeste rougit ; un schéma servi rougit. Contrôle : le servi qui porte `pending_since` rend la même projection que sans.
2. `ukemi_in_process_pins_follow_the_pending_snapshot` : l.623, l.1175 (1), l.1488 et l.1633 refactorés autour d'une cible unique, rejoués sur un arbre temporaire : en attente égal à l'arbre et servi plus ancien (empreinte, ou clause, d'un autre arbre) ⇒ vert ; en attente qui diffère de l'arbre ⇒ rouge ; aucun instantané ⇒ comportement de la base (contrôle).
3. `ukemi_pages_keep_the_served_snapshot_while_pending` (le B1 de SERVED-PENDING-1 transposé) : un instantané en attente dont l'empreinte et la clause diffèrent du servi ; `loadUkemiServed(t)` rend les valeurs servies, la projection entière de `ROOT` ; `servedFiguresOf` rend le chiffre servi ; contrôle : `loadUkemiPending(t)` rend bien l'autre.
4. `ukemi_pending_sync_writes_in_process_facts` : ce que `--pending` écrirait aujourd'hui (`inProcessUkemiPending`) égale le servi versé sur les champs partagés (à la base, l'arbre est le déployé) ; `ukemiPendingDiff` est vide entre eux et nomme chaque champ changé (empreinte, clause, verdict tronqué, clé refusée en trop, schéma) ; `markPendingSince` ne touche aucun autre octet et garde un `pending_since` posé ; `removeManifestEntry` ne change qu'une ligne et refuse un manifeste non canonique ; `servedVerdictFacts` rend les mêmes octets qu'à la base.

Les tests existants de l.623, l.1175, l.1480, l.1633 restent verts à la base (sans instantané en attente, ils lisent le servi) : leur preuve rouge passe par les cas temporaires du test 2.

**Tueurs en forme fermée**, adresses fixées au gel :

| Mutant | Tué par |
|---|---|
| `loadUkemiPending` ignore le fichier (`CONST "!existsSync(...)" -> "true"`) | test 2 (cas « servi plus ancien ») |
| contrôle « si et seulement si » supprimé (`SDL`) | test 1 |
| `ROR` de `pending_since` contre `written_at` | test 1 |
| `loadUkemiServed` rend la projection fusionnée avec l'en attente (`CONST`) | test 3 |
| la promotion compare les clés ouvertes au lieu de `UKEMI_PENDING_SHARED` (`CONST`) | test 4 |
| `inProcessUkemiPending` lit le verdict sans `verdictFactsOf` (`CONST`, verdict brut) | test 4 |
| `markPendingSince` réécrit l'objet entier (`CONST`) | test 4 |

**Oracle du gel** : `node scripts/red-proof.mjs --base 87f6081c --gel <gel> --repo /home/user/monark-governance-ups --draw <n> --seed 37` (4 F2P attendus, 7 tueurs) ; `scripts/mutants/run.mjs --killers` ; `verifie-ancres.mjs --ref 87f6081c` (0 dérivé, les PERDU de la base seulement ; les lignes `// killer:` de `site-ukemi` déplacées réancrées dans le commit qui les déplace) ; `tsc --noEmit`, `npm run lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check` ; `npm test` complet à 0 rouge (Node 24.21.0 si l'hôte l'offre, sinon noté ; test 42 relancé seul s'il est seul rouge) ; R-25 par `scripts/oracle/r25.mjs`.

**Rejeu de la simulation 1 sur une copie du gel**, avec `--pending` lancé : les trois rouges de `site-ukemi` disparaissent ; sans `--pending`, ils restent (voulu). Rejeu de la simulation 2 : l.623 vert avec `--pending`, l.152 rouge (hors de ce lot, Q-UPS-M4). Copies effacées ; `git status` propre.

## 6. Interaction avec C2 et C' (qui régénère quoi, quand)

| Temps | Porteur | Acte |
|---|---|---|
| ce lot | RECHERCHES | le mécanisme, sans fichier de données ; fusionné sur la base avant le code de 3c-3c |
| C2, 3c-3b | RECHERCHES | renommage B-17 dans `verdictFactsOf` (une fonction) et dans l.1633 (`verdict.scores_sha256`, littéral `"1.1.0"`) ; la clé du site `calibration_digest` reste (Q-UPS-C3) |
| C2, 3c-3c, après la bascule | RECHERCHES | `node scripts/sync-ukemi-served.mjs --pending` : écrit `ukemi-pending.json` (empreinte `a9277222…` attendue pour s0), pose `pending_since` dans `ukemi-served.json`, pose les deux entrées de manifeste ; versés dans le même commit, comptés au R-25 (Q-M4 : environ 25 lignes) |
| C' | RECHERCHES | relance `--pending` (`pending_since` gardé) si un champ partagé bouge (clause liq par S-8 si S-8 atteint `describeGate`) ; le test 2 rougit sinon. Si la composition de la clause change, `LIQ_CLAUSES` de la synchro suit (zone C' du bloc C) |
| D | RECHERCHES | relance `--pending` si D touche un fait partagé (rien de prévu) |
| T0, temps (ii) | MONARK | après le déploiement et la CA : synchro du harnais, puis `node scripts/sync-ukemi-served.mjs` (promotion) ; refus si l'écart n'est pas nul ; garde d'envoi du site tant que `ukemi-pending.json` existe (Q-UPS-M3) |

Indépendance : ce lot ne touche aucun fichier de C1 (paquet gelé, schémas, outils de C1, `apps/harness/test/`) ; il peut partir en parallèle de C1 (Q-UPS-M2). Il décale des lignes de `scripts/sync-ukemi-served.mjs` (l.122, l.131, l.149 citées par le G0 du bloc C §3.4) : le G0 court de 3c-3c les relit sur la base de C2.

## 7. R-25 estimé (pathspec de `ci.yml`, contre `87f6081c`)

| Partie | Lignes |
|---|---|
| `sync-ukemi-served.mjs` : `verdictFactsOf`, `inProcessUkemiPending`, `markPendingSince`, `ukemiPendingDiff`, `removeManifestEntry`, `--pending`, promotion | ~110 |
| `sync-ukemi-served.d.mts` | ~15 |
| `ukemi-served-load.ts` : clé admise, `loadUkemiPending`, liste fixe | ~55 |
| `site-ukemi.test.ts` : cible unique sur quatre tests, `tmpRoot`, quatre tests neufs | ~240 |
| **Total** | **~420** |

Incertitude ±25 % (315 à 525) ; borne 547. Le prix noté au G0 d'UKEMI-PENDING-1 était ~405 ; l'écart vient de l.1480 et l.1633, absents de la liste d'origine. **Coupe nommée** si le gel dépasse 547 : le test 3 (pages) se réduit au contrôle de `loadUkemiServed`, et `removeManifestEntry` devient une consigne imprimée (comme la synchro du harnais), environ −45. **Différences servies** : aucune.

## 8. Ordre

A → B1 → B2 → W2E-TAIL-1 → SERVED-PENDING-1 → UKEMI-PENDING-1 → #141 → **C1 ∥ UKEMI-PENDING-SNAPSHOT-1** → C2 → C' → D → T0. Précondition P-6 du bloc C : ce lot fusionné sur la base avant le code de 3c-3c (au plus tard avant le G0 court de 3c-3c, qui relit les lignes de la synchro).

## 9. Questions

### Choix de contrat (pour un advisor ; défaut proposé)

- **Q-UPS-C1. Clés de l'instantané en attente.** Défaut : la liste close du §4, sans `openapi_sha256`. Raison : aucun test d'ukemi ne compare l'`openapi.json` en processus à `ukemi-served.json` (`body_sha256` n'est lu que contre la CA versée, temps (ii)) ; `harness-pending.json` porte déjà cette empreinte, une seconde copie serait une épingle de plus sans lecteur.
- **Q-UPS-C2. Liaison du verdict en attente.** Défaut : la réponse en processus au même `GATE_LIQ_BODY`, contrôlée contre la strate engagée de l'arbre ; ni CA, ni `body_sha256`. Raison : la CA versée est du temps (ii) ; la lier à l'en attente ferait écrire une CA hors déploiement.
- **Q-UPS-C3. Nom de la clé d'empreinte après C2.** Défaut : le site garde `calibration_digest` (servi et en attente, schéma servi `monark-site-ukemi-served-v2` inchangé), qui porte à partir de T0 la valeur `scores_sha256` du fil. Raison : la synchro interdit d'écrire dans `apps/site` un nom de champ du contrat gelé (commentaire de `servedVerdictFacts`) ; la promotion compare des clés partagées, qui doivent être les mêmes des deux côtés. Alternative : une clé neuve et un schéma servi v3 (pages et chargeur touchés à T0).
- **Q-UPS-C4. Manifeste.** Défaut : `--pending` pose les deux entrées et la promotion retire celle de l'instantané en attente, puisque la synchro d'ukemi écrit déjà le manifeste. Alternative : imprimer les empreintes et laisser l'écriture à la main, comme la synchro du harnais.
- **Q-UPS-C5. `pending_since`.** Défaut : même règle que le harnais (jour UTC, gardé à la seconde écriture, pas postérieur à `written_at`, « si et seulement si » tenu par `loadUkemiPending`), date propre à ukemi, indépendante de celle de `harness-served.json`.
- **Q-UPS-C6. Tests qui suivent l'instantané en attente.** Défaut : l.623, l.1175 (1), l'épingle l.1488 de l.1480, l.1633 ; les figures de la page, l.1199 et l.1397 (4) restent sur le servi. Raison : la simulation 1 fait rougir l.1480 et l.1633 sur la seule empreinte ; ce sont des comparaisons en processus, la classe que l'item couvre.

### Zone et ordre (pour MONARK)

- **Q-UPS-M1. Zone écrite et données.** Ce lot écrit les quatre fichiers du §3 et eux seuls ; `scripts/verify-harness.mjs`, `test/verify-harness-liq.test.ts` et la ligne de `sync-harness-served.mjs` restent dans la zone rouverte sans être touchés. Les données entrent avec C2 : ajouter au tableau P-4 du bloc C, pour C2 et C', `apps/site/data/ukemi-pending.json` (neuf), `apps/site/data/ukemi-served.json` (clé `pending_since` seule), et `test/site-ukemi.test.ts` au-delà des trois littéraux (l.1633, renommage B-17). Défaut : oui.
- **Q-UPS-M2. Ordre.** Ce lot part en parallèle de C1 (zones disjointes) et fusionne avant le code de 3c-3c. Si C1 fusionne d'abord, rebase sans re-mesure sauf conflit. Défaut : oui.
- **Q-UPS-M3. Temps (ii) et garde d'envoi.** La garde du RUNBOOK-vitrine (« aucun envoi du site tant que `harness-pending.json` existe ») s'étend à `ukemi-pending.json` ; à T0, l'ordre est CA, synchro du harnais, synchro d'ukemi (promotion). Acte de MONARK au tronc, avant la fusion de C2. Défaut : oui.
- **Q-UPS-M4. S-8 et la copie du site.** Si S-8 change une phrase composée de la clause liq (simulation 2), C' rougit aussi `site_ukemi_copy_equals_served_liq_text` (l.152), une copie de page qui doit rester servie jusqu'à T0. Défaut : ce lot ne la prépare pas ; le G0 de C' mesure la portée de S-8 et, si l.152 rougit, demande la ligne de zone (le même pendant : copie comparée au servi, `gate.ts` à l'en attente). Si S-8 ne touche que `honestyText`, rien à faire.

## 10. Suite

Commits prévus : ce G0 ; G0 avec décisions ; tests rouges ; code (gel) ; G7. Jamais `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` n'est jamais indexé. Arrêt ici jusqu'aux réponses.
