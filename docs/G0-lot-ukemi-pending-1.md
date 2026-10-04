# G0 du lot UKEMI-PENDING-1 : les corps de la CA et l'état servi d'ukemi avant le bloc C

- **Sources** :
  - décision de MONARK, `recherches` `0058bfe`, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-SERVED-PENDING-1-Q.md`, point 4 (Q-SP1-4) : « `:125` reste inchangé. **UKEMI-PENDING-1** est un item à part, formé dans ETAT, à toi, sur la base **avant le bloc C** : les deux tests de site-ukemi rougiraient sinon au bloc C » ;
  - `docs/ETAT.md` du tronc (`origin/lot/etude-suite` = `050da36d`, ligne posée par `d1cf7a1b`), l.439-441 : « les deux tests de site-ukemi (`:1198`, `:1438`) lisent `ukemi-served.json` et rougiraient au bloc C sur `schema_version` du corps de la CA, ce qu un instantané en attente du harnais ne couvre pas. Construction : le même mécanisme pour l état servi d ukemi (synchro et vérification). Porteur : RECHERCHES, sur la base avant le bloc C ; état : ouvert. » ;
  - plan r3 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md` : §1 point 1 (« Toute autre valeur de `prediction.schema_version` rend 400 `schema_version_unsupported` »), §6 (recensement : `scripts/verify-harness.mjs:14,50,270,320-346` et `scripts/sync-ukemi-served.mjs:19,29,122,131-132,146-149` changent au bloc C pour B-17, « à changer au temps (i), sinon la CA d'après déploiement est rouge »), §8.5 (ligne « comparaisons en processus, `test/site-ukemi.test.ts:1198`, `:1438`, recensement de MONARK (b2) ») ;
  - le mécanisme analogue : SERVED-PENDING-1, `docs/G0-lot-served-pending-1.md` et `docs/G7-lot-served-pending-1.md` de `recherches/served-pending-1` (PR #132), dont la note : « `--pending` envoie au harnais en processus les corps de la CA (`GATE_BODY` de `scripts/verify-harness.mjs`, `GATE_LIQ_BODY` de la synchro, `schema_version: "1.0.0"`). Si le bloc C refuse ces corps, `--pending` échoue fermé tant que UKEMI-PENDING-1 ne les a pas passés en 1.1.0 » ; G2 de SERVED-PENDING-1, m6.
- **Base** : `origin/base/chantier-moteur-2026-10-03` = `7a0b1a49` (fusion de #132, SERVED-PENDING-1) ; G0 mesuré sur `880654ed`, rebasé sans conflit. Branche `recherches/ukemi-pending-1`, arbre `/home/user/monark-governance-ukp`. Auteur : RECHERCHES. Borne R-25 : 547 lignes contre `7a0b1a49`.
- **Statut : décidé.** MONARK a répondu à Q-UP-1 à Q-UP-4 (`recherches` `e9cd32b`, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-UKEMI-PENDING-1-Q.md`) : propositions retenues, Q-UP-3 dans sa variante « Q-UP-2 seule ». Section 6 ; les sections 1 à 5 restent la mesure et les questions telles que posées.

## 1. Ce que l'item exige (texte d'ETAT et décision de MONARK)

1. Les deux tests de `test/site-ukemi.test.ts` aux lignes `:1198` et `:1438` ne rougissent pas au bloc C.
   - `:1198` est dans `site_ukemi_course_served_stratum_status_bound_to_served_verdict` (l.1175) : partie (1), le verdict de `ukemi-served.json` contre la CA versée et contre l'empreinte C5 du registre ; partie (2), la CA lancée comme au déploiement contre le harnais en processus (`execFile` de `scripts/verify-harness.mjs`, l.1214-1224) et `sync.GATE_LIQ_BODY` posté en processus (l.1207-1209).
   - `:1438` est la table `TRAPS` de `site_ukemi_served_state_carriers_follow_the_dated_served_state` (l.1397). Sa première ligne (l.1439) exige que `site_ukemi_served_state_bound_to_harness_registry` (l.623) compare encore le registre du dépôt à l'état servi synchronisé.
2. La construction est « le même mécanisme » que SERVED-PENDING-1, pour l'état servi d'ukemi, « synchro et vérification ». Transposé, cela donne :
   - un instantané en attente, avec son schéma propre et ses seuls champs en processus ;
   - les tests comparent le dépôt à l'instantané en attente quand il existe, sinon au servi ;
   - les pages gardent le servi ;
   - la promotion par la synchro par défaut refuse d'écrire si le servi diffère de l'instantané en attente.
3. Le lot porte aussi le passage des corps de la CA à la version que parle le harnais du dépôt. C'est ce que dit la note de SERVED-PENDING-1 (« tant que UKEMI-PENDING-1 ne les a pas passés en 1.1.0 »), et c'est la cause que nomme ETAT.
4. L'item est sur la base, avant le bloc C. **Rien de servi ne bouge** : sans instantané en attente, les pages, les octets du site, la CA versée et les synchros par défaut se comportent comme aujourd'hui.

## 2. Mesure du G0 (2026-10-04, Node 24.21.0, variables de proxy retirées, TMPDIR propre)

- **Base verte** : `site-ukemi` et `verify-harness-liq` donnent 30/30.
- **Bloc C simulé, refus seul** : `SCHEMA_VERSION = "1.1.0"` dans `apps/harness/src/tools/gate.ts:62`, rien d'autre. Le harnais refuse alors tout corps en 1.0.0 (`gate.ts:863-866`, comme §1 point 1 du plan). Sur `site-ukemi`, `verify-harness-liq`, `harness-served` et `narabi-live`, **7 rouges sur 70** :
  - **cause « corps de la CA »**, des corps écrits dans les scripts :
    - `site_ukemi_course_served_stratum_status_bound_to_served_verdict` (l.1175 ; assertion l.1224, « the deploy CA is green on this tree's in-process harness », 1 !== 0) ;
    - `verify_harness_ca_passes_on_the_in_process_harness` (`test/verify-harness-liq.test.ts:91`) ;
    - `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (`:218`) ;
    - `harness_served_sync_liq_row_follows_the_served_state` (`test/harness-served.test.ts:438`, qui poste `GATE_LIQ_BODY` de la synchro d'ukemi).
  - **cause « littéraux des tests »**, `schema_version: "1.0.0"` écrit dans le test même : `site_ukemi_prose_claims_conditional` (l.1133, littéral l.1137), `site_ukemi_count_wording_says_what_the_wire_serves` (l.1454, l.1457) et `site_ukemi_digest_note_says_what_the_gate_returns` (l.1633, l.1638).
- **Même simulation, corps de la CA passés en 1.1.0** (les quatre littéraux de `scripts/verify-harness.mjs` l.44, 50, 61, 74 et la copie de `GATE_LIQ_BODY` dans `scripts/sync-harness-served.mjs:55`) : **3 rouges sur 70**, les trois littéraux des tests. Les quatre rouges « corps de la CA » reverdissent, dont l.1175. Arbre restauré (`git status` propre).
- **Lecture** :
  - le test de `:1438` (l.1397) ne rougit pas sous le seul refus. Il lit des fichiers et des phrases. Il rougira si le bloc C change ce que compare le test qu'il garde (l.623) :
    - le texte de la clause liq ;
    - l'état du registre.

    Il rougira aussi si une ligne des `TRAPS` disparaît.
  - la partie (1) de l.1175 compare `liq_verdict.calibration_digest` du servi à `digestPinned` du registre en processus (l.1200-1204). Si le bloc C change cette empreinte (plan §9, « toutes les empreintes changent »), c'est une comparaison en processus contre le servi : c'est là que l'instantané en attente d'ukemi sert. Sous le seul refus, elle ne bouge pas.
  - le renommage `calib_digest` vers `scores_sha256` (B-17) casse aussi `servedVerdictFacts` (`sync-ukemi-served.mjs:131-132`) et la ligne `verify-harness.mjs:270`. Le plan les met au bloc C (§6) ; ce lot ne peut pas les faire avant le bloc C, puisque le harnais de la base sert encore `calib_digest`.
  - les quatre corps sont **copiés** à deux endroits : `GATE_LIQ_BODY` de `sync-harness-served.mjs:54-57` est une copie à l'octet de celui de `verify-harness.mjs:73-76`.
  - `scripts/verify-harness.mjs` est « ZERO dependency » (l.4) et part seul dans l'archive de déploiement (`docs/RUNBOOK-harness.md:66,92`) : il ne peut pas importer la constante du harnais.

## 3. Zone que l'item demande (à décider, Q-UP-1)

| Fichier | Pourquoi | Dans une décision ? |
|---|---|---|
| `scripts/verify-harness.mjs` | une constante `CA_SCHEMA_VERSION` (exportée), lue par ses quatre corps littéraux ; le bloc C la passe en 1.1.0 avec `gate.ts` | non (dans la table de #111, close) ; le plan §6 l'ouvre au bloc C |
| `scripts/sync-ukemi-served.mjs`, `scripts/sync-ukemi-served.d.mts` | `--pending` (instantané en attente, en processus) ; promotion qui refuse en cas d'écart | non ; plan §6 au bloc C |
| `apps/site/lib/ukemi-served-load.ts` | `loadUkemiPending(root)` (null sans fichier) ; `loadUkemiServed` admet `pending_since` et ne le rend pas | non |
| `test/site-ukemi.test.ts` | l.623 et l.1175 comparent le dépôt à l'instantané en attente quand il existe ; tests neufs ; les `TRAPS` restent mot pour mot | oui pour le fichier (plan §8.5, liste de SERVED-PENDING-1) |
| `test/verify-harness-liq.test.ts` | épingle de parité `CA_SCHEMA_VERSION === SCHEMA_VERSION` du harnais (tueur) | non ; rougit aussi au bloc C (§2) sans figurer dans la liste du plan |
| `scripts/sync-harness-served.mjs` | sa copie de `GATE_LIQ_BODY` (l.54-57) lirait `CA_SCHEMA_VERSION`, ou importerait le corps de la CA comme le fait `GATE_BODY` (l.38) | zone de SERVED-PENDING-1, PR #132 ouverte |
| `test/harness-served.test.ts:438` | aucun changement si les corps suivent la constante (§2) | zone de SERVED-PENDING-1 |

Les littéraux des trois tests de `site-ukemi` (l.1137, l.1457, l.1638) sont des producteurs du test. Ils sont régénérés au bloc C avec les autres « 1.0.0 » (plan §9, ligne 1). Ce lot n'y touche pas ; il les nomme pour la liste du G0 du bloc C.

## 4. Questions (réponse de MONARK demandée avant les tests rouges)

**Q-UP-1 : zone.** Aucune décision ne nomme les fichiers.
- **Proposition** : les cinq premières lignes du tableau du §3, et elles seules, jusqu'à la fusion du lot :
  - `scripts/verify-harness.mjs` ;
  - `scripts/sync-ukemi-served.mjs` et son `.d.mts` ;
  - `apps/site/lib/ukemi-served-load.ts` ;
  - `test/site-ukemi.test.ts` ;
  - `test/verify-harness-liq.test.ts`.
- **`scripts/sync-harness-served.mjs`** est dans la zone de #132, encore ouverte. Deux options :
  - **(a)** une ligne dans #132 avant sa fusion (sa copie lit `CA_SCHEMA_VERSION`) ;
  - **(b)** ce lot part de la base après la fusion de #132 et prend cette ligne, sans rien d'autre de ce fichier.
- **Je propose (b)**. Sinon, `--pending` de SERVED-PENDING-1 et `:438` rougissent au bloc C pour la seule copie (§2).

**Q-UP-2 : version des corps de la CA.** Le harnais de la base refuse 1.1.0. On ne peut donc pas passer les corps en 1.1.0 avant le bloc C ; on peut seulement faire qu'ils suivent la version du dépôt.
- **(a) Proposition** : une constante unique `CA_SCHEMA_VERSION = "1.0.0"` dans `verify-harness.mjs`, lue par les quatre corps littéraux (`GATE_BODY`, `GATE_RETIRED_BODY`, `GATE_BYO_BODY`, `GATE_LIQ_BODY` ; `GATE_FUTURE_BODY` et `GATE_LIQ_UNCOMMITTED_BODY` en dérivent), et un test de parité avec `SCHEMA_VERSION` de `gate.ts`.
  - Le bloc C change les deux en une ligne chacun ; le test de parité rougit si l'une bouge sans l'autre (tueur en forme fermée).
  - Le script reste sans dépendance.
  - La CA parle la version de l'arbre déployé. Entre le bloc C et T0, une CA ou une synchro contre le harnais déployé (1.0.0) échoue fermé. C'est la règle déjà posée par le plan §6 (« à changer au temps (i) »), et aucun déploiement du harnais n'est prévu entre C et T0.
- **(b)** deux jeux de corps, servi (1.0.0) et en attente (version du dépôt), et un drapeau `--pending` sur la CA pour les tests en processus. La CA versée resterait juste contre le déployé jusqu'à T0, mais au prix d'un corps de plus par appel, en double jusqu'à la promotion.
- **Je propose (a)**.

**Q-UP-3 : instantané en attente d'ukemi.** Sous le seul refus de version, aucun test ne compare un fait d'ukemi en processus à `ukemi-served.json` qui bougerait (§2). L'instantané en attente ne sert que si le bloc C change, en processus :
- la clause liq ;
- l'état du registre ;
- l'empreinte C5 de la strate engagée (`digestPinned`, l.1200-1204) ;
- le verdict lu par la synchro.

C'est probable pour l'empreinte (plan §9, « toutes les empreintes changent »), mais le G0 du bloc C ne l'a pas encore mesuré.
- **Proposition** : le construire dans ce lot, au même dessin que SERVED-PENDING-1 :
  - `apps/site/data/ukemi-pending.json`, schéma `monark-site-ukemi-pending-v1`, clés closes : `$comment`, `schema`, `written_at`, `served_class`, `registry_state`, `liq_clause`, `cascade_uncalibrated_sentence_served`, `openapi_sha256` (en processus), et `liq_verdict` sans `body_sha256` ni `read_at`. Ni `host`, ni `read_at`, ni `body_sha256` : rien de ce qui n'est lu que sur le serveur, et un test qui les refuse.
  - `sync-ukemi-served.mjs --pending` : en processus seulement (`handleJsonMirror`, `GATE_LIQ_BODY`). Il écrit l'instantané en attente et insère `pending_since` dans le servi sans toucher à un autre octet.
  - Le verdict en attente n'est pas lié à la CA versée (la CA est du temps (ii)) : il est lié à la réponse en processus au même corps.
  - `loadUkemiPending` : existe si et seulement si le servi porte `pending_since`. Les pages et `assert-fleet-html.mjs` gardent `loadUkemiServed`.
  - l.623 et la partie (1) de l.1175 comparent le dépôt à l'instantané en attente quand il existe. Les `TRAPS` restent mot pour mot.
  - Promotion par la synchro par défaut : elle refuse d'écrire si le nouveau servi diffère de l'instantané en attente sur un champ partagé. Sinon, elle écrit le servi sans `pending_since` et retire l'instantané en attente. MONARK la lance au temps (ii).
  - Aucun instantané en attente versé : il entre avec le bloc C, comme `harness-pending.json` (Q-SP1-6).
  - La garde du RUNBOOK-vitrine (« aucun envoi du site tant que `harness-pending.json` existe ») s'étendrait à `ukemi-pending.json` : c'est un acte de MONARK.
- **Alternative** : ce lot ne fait que Q-UP-2, et l'instantané d'ukemi attend la mesure du G0 du bloc C. Le lot serait trois fois plus petit, mais l.623 et l.1175 (1) peuvent rougir au bloc C.

**Q-UP-4 : renommages de B-17.** `servedVerdictFacts` (`sync-ukemi-served.mjs:131-132`) et `verify-harness.mjs:270` lisent `verdict.calib_digest`. Ils restent au bloc C (plan §6) : le harnais de la base ne sert pas `scores_sha256`.
- **Proposition** : ce lot ne les touche pas. Le G0 du bloc C les porte avec la liste du §3 (littéraux des tests) et la ligne m6 de la G2 de SERVED-PENDING-1.
- À confirmer, car la l.1175 rougit au bloc C tant que ce renommage n'est pas fait, quelle que soit la version des corps.

## 5. Plan, une fois les réponses reçues (propositions retenues)

- **Tests rouges d'abord** :
  - parité `CA_SCHEMA_VERSION` et `SCHEMA_VERSION` (`verify-harness-liq`) ; contrôle : chaque corps de la CA porte la constante, aucun littéral « 1.0.0 » n'y reste ;
  - `ukemi_pending_snapshot_is_fail_closed` : instantané en attente sans `pending_since` sur le servi, `pending_since` sans instantané en attente, `pending_since` postérieur à `written_at`, les trois clés du serveur refusées, un fichier non listé au manifeste ;
  - l.623 et l.1175 sur un arbre temporaire qui porte un instantané en attente : registre en processus égal à l'instantané en attente et servi plus ancien (vert) ; différent des deux (rouge) ;
  - `ukemi_pending_sync_writes_in_process_facts` : ce que `--pending` écrirait aujourd'hui égale le servi sur les champs partagés ; la comparaison de promotion nomme chaque champ changé ; l'insertion de `pending_since` ne touche aucun autre octet ;
  - `ukemi_pages_keep_the_served_snapshot_while_pending` (le B1 de SERVED-PENDING-1 transposé).
- **Tueurs en forme fermée**, à ancrer au gel :
  - `CA_SCHEMA_VERSION` changé seul (CONST) ;
  - le chargeur qui ignore l'instantané en attente (`?? loadUkemiServed` → `loadUkemiServed`) ;
  - le contrôle « si et seulement si » supprimé (SDL) ;
  - la promotion qui compare les clés ouvertes au lieu de la liste fixe (CONST).
- **Oracle** :
  - `node scripts/red-proof.mjs --base 880654ed --gel <gel> --repo /home/user/monark-governance-ukp --draw <n> --seed 37` ;
  - `tsc --noEmit`, `npm run lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ;
  - `npm test` complet à 0 échec ;
  - le bloc C simulé du §2 rejoué : les rouges « corps de la CA » doivent disparaître.
- **R-25 estimé** (pathspec de `ci.yml`, contre `880654ed`) :

  | Partie | Lignes |
  |---|---|
  | `verify-harness.mjs` | ~12 |
  | `sync-harness-served.mjs` | ~2 |
  | `sync-ukemi-served.mjs` et son `.d.mts` | ~110 |
  | chargeur | ~50 |
  | tests | ~230 |
  | **Total** | **~405** |

  Q-UP-2 seul (alternative de Q-UP-3) : **~60**. Borne 547.
- **Différences servies** : aucune. Aucun instantané en attente n'est versé ; la CA versée, `ukemi-served.json`, le manifeste et les pages ne bougent pas.

## 6. Décisions de MONARK (`recherches` `e9cd32b`) et plan retenu

1. **Q-UP-1, zone** : ces fichiers et eux seuls, jusqu'à la fusion du lot :
   - `scripts/verify-harness.mjs` ;
   - `scripts/sync-ukemi-served.mjs` et son `.d.mts` ;
   - `apps/site/lib/ukemi-served-load.ts` ;
   - `test/site-ukemi.test.ts` ;
   - `test/verify-harness-liq.test.ts` ;
   - la seule ligne du corps liq copié dans `scripts/sync-harness-served.mjs` (option (b) : #132 est sur la base, à `7a0b1a49`).

   Sous la décision de Q-UP-3, le lot n'écrit que dans `scripts/verify-harness.mjs`, la ligne de `scripts/sync-harness-served.mjs` et `test/verify-harness-liq.test.ts`. La synchro d'ukemi, son `.d.mts`, le chargeur et `test/site-ukemi.test.ts` restent dans la zone sans être touchés.
2. **Q-UP-2, (a)** : une constante `CA_SCHEMA_VERSION` dans `verify-harness.mjs`, exportée, lue par les quatre corps littéraux. Le test de parité contre `SCHEMA_VERSION` de `gate.ts` est le tueur. Le script reste sans dépendance.
   - La copie de `GATE_LIQ_BODY` dans `sync-harness-served.mjs` suit, en une ligne : `schema_version: GATE_BODY.prediction.schema_version`. `GATE_BODY` y est déjà importé de la CA (l.47), donc ni import ni autre ligne ne change.
   - La parité de cette copie est testée (forme du corps copié, aucun autre `schema_version` dans le fichier).
3. **Q-UP-3** : pas d'instantané en attente d'ukemi dans ce lot. Le report est un item :
   - **UKEMI-PENDING-SNAPSHOT-1** : l'instantané en attente de l'état servi d'ukemi (`ukemi-pending.json`, `--pending` de la synchro d'ukemi, `loadUkemiPending`, l.623 et partie (1) de l.1175 lues contre lui ; dessin du §4, Q-UP-3, proposition).
   - **Déclencheur** : le G0 du bloc C.
   - **Critère** : le bloc C change l'empreinte C5 (`digestPinned` de la strate engagée) ou la clause liq. Sinon, l'item se ferme sans code.
   - **Prix noté** : R-25 d'environ 405.
   - **Porteur** : RECHERCHES ; état : ouvert.
4. **Q-UP-4** : les renommages B-17 (`servedVerdictFacts`, `sync-ukemi-served.mjs:131-132`, et la ligne `verify-harness.mjs:270`, `calib_digest` vers `scores_sha256`) restent au bloc C (plan §6). Ce lot ne les touche pas.

**Plan retenu** :
- **Tests rouges** (`test/verify-harness-liq.test.ts`) :
  - `verify_harness_ca_schema_version_equals_the_harness_schema_version` : `CA_SCHEMA_VERSION === SCHEMA_VERSION`, et les deux corps exportés la portent. À la base, la constante n'existe pas : rouge par assertion. Tueur : la constante changée seule (`"1.0.0"` vers `"1.1.0"`, CONST).
  - `verify_harness_ca_bodies_read_the_ca_schema_version` : les quatre corps littéraux lisent la constante, la CA n'écrit `schema_version` que là, et la copie liq de la synchro du harnais suit par `GATE_BODY`. À la base, chaque corps porte le littéral `"1.0.0"` : rouge par assertion. Tueur : la copie remise au littéral (CONST).
  - L'ajout de trois lignes en tête de `verify-harness.mjs` déplace la ligne du tueur existant (l.271 vers l.274) ; sa ligne `// killer:` suit.
- **Code** : la constante et les quatre corps ; la ligne de la copie.
- **Oracle** : `node scripts/red-proof.mjs --base 7a0b1a49 --gel <gel> --repo /home/user/monark-governance-ukp --draw 2 --seed 37` ; `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ; `npm test` complet ; le bloc C simulé du §2 rejoué.
- **Attendu de la simulation** (`SCHEMA_VERSION = "1.1.0"` dans `gate.ts` et `CA_SCHEMA_VERSION = "1.1.0"`, comme le bloc C les changerait) : seuls les trois littéraux des tests de `site-ukemi` (l.1137, l.1457, l.1638) restent rouges ; la partie de l.1175 qui dépend de B-17 ne rougit pas sous le seul refus de version.
- **R-25 estimé** : ~60. **Différences servies** : aucune.
