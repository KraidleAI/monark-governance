# RENDU — lot vitrine BELL-SERVED-1 (+ décision investisseur 155 « passe built »)

- **R-1** : modèle résolu `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme), effort max.
- **Worktree** `F:\Monark-wt-sitebell`, branche `lot/site-bell-built`, base `7a39698`. **Aucun commit, aucun déploiement, aucun workflow (R-20).** Index git laissé propre (un `git add -N` temporaire, fait pour mesurer R-25 sur les fichiers neufs, a été annulé par `git reset` ; `git status` = 12 M + 4 ??).
- **Horloge** : début 21:38:09Z, rendu 22:31Z. **Budget de 40 min dépassé (≈ 55 min).** Deux causes : la décision 155, reçue en cours de lot (bascule du registre, re-pins, copies) ; `node_modules` absent du worktree (voir §9, I-5).
- **Consignes** : la consigne initiale (« ne flippe pas le registre, badge `upcoming` + phrase D8 ») est **supersédée par la décision 155**, relayée par l'orchestrateur en cours de lot. Bell passe `built`. Le badge `upcoming` disparaît, parce que le statut est lu du registre. Le bloc « Served » reste. La phrase D8 « the register flips when… » n'a plus d'objet et n'est pas posée. Sa source [lu] reste utile à l'ADR d'amendement : ADR-B0 D8 l.72, « `built` conditionné à leur atteinte, atteignable au plus tôt après T-2 car E n'est testé qu'en T-2, C-9 ».

## 1. Fichiers livrés (sha256 : `F:\tmp\sitebell\DELIVERED.sha256`)

| Fichier | Rôle |
|---|---|
| `scripts/sync-bell-served.mjs` (nouveau, **racine, non exporté** comme `sync-bell-anchors.mjs`) | Fait deux GET (`/timeline.jsonl`, `/bell/pubkey.json`) : https, redirection refusée, 200 seulement, corps borné. Contrôles fail-closed avant écriture : trousseau servi = octets du trousseau committé ; 1re ligne = `bell-timeline-v1`, seq 1, `publication`, chaînée depuis GENESIS, signature Ed25519 vérifiée sous la clé committée (`bell-chain.mjs` `verifyLine`, `keyIdOf`). Écrit **seulement** host, read_at, seq, published_at, line_hash, key_id et les sha256 des deux corps. |
| `apps/site/data/bell-served.json` (nouveau, généré 21:53:28Z) | sha256 `da3c15d6…f303`. Seul nombre : `seq` = 1 (testé). Aucune valeur de marché. Aucun nom de fournisseur. |
| `apps/site/data/manifest.sha256.json` | Entrée `bell-served.json` et phrase `$comment`. Le test 44 (a) et le chargeur la re-vérifient. |
| `apps/site/lib/bell-served-load.ts` (nouveau) | Chargeur fail-closed, calqué sur `bell-legal-load.ts` : hash du manifeste, forme **fermée** à chaque niveau (clé en trop ou manquante ⇒ throw), seq entier ≥ 1, ISO UTC, hex64. Built-ins seulement, aucun alias. N'emploie jamais les identifiants `served_by` et `integration_test` (garde (4)). |
| `test/bell-served.test.ts` (nouveau, **6 tests**, racine, non exporté) | `bell_served_data_is_listed_and_hash_pinned` ; `bell_served_first_record_fields_pinned` ; `bell_served_data_matches_deploy_ca` (corps = `docs/deploy-CA-bell.json` `bodies_sha256` ; trousseau servi = `keyring_sha256` = octets committés ; 12/12 `ok`) ; `bell_served_data_carries_no_market_value` (seul nombre = seq ; aucune forme `massive\|databento\|polygon.io\|POLYGON_API_KEY` dans les données ni dans `/bell` et `/bell/method`, avec témoin positif) ; `bell_served_loader_is_fail_closed` (6 cas : témoin, altération, non listé, seq 0, champ `vwap` en trop, key_id malformé) ; `bell_pages_render_served_values_never_typed` (les deux pages appellent `loadBellServed(` et ne contiennent aucun littéral servi). |
| `apps/site/app/bell/page.tsx` | Héros au présent et sans promesse. Bloc **Served** : liens host, `/timeline.jsonl`, `/state.json`, `/bell/pubkey.json` ; key_id complet ; seq, published_at, line_hash et sha des corps lus par le chargeur, avec la date de lecture. « What is missing: the cash leg » dit en clair. Phrases devenues fausses corrigées : 3 lignes du tableau de statut `served` avec liens (au lieu des placeholders `url_state`, `url_timeline`, `pubkey_ed25519`), étiquettes « not served yet », « Once served, the board would read… », « Nothing on this page is served… », « once they are published ». |
| `apps/site/app/bell/method/page.tsx` | URL de la clé (liée, aucune copie servie par le site, C-10) et key_id lu. « How to check a line » : commande du vérificateur, chemin du trousseau committé, statuts `consistent_with_supplied_keyring` / `self_consistent_only`, et « ni le vérificateur ni le trousseau ne sont dans l'export public aujourd'hui ». « Detectable by whom » (§D6). Source de clôture « described here, not named », et « le 1er enregistrement ne lit aucun close ». Temps présents : timeline, signature, « generated on the dedicated host from which the records are published ». |
| `apps/site/lib/fleet.ts` | **Décision 155.** `FleetProduct` devient l'union `BuiltFleetProduct` (`served: FleetWiring` obligatoire) / `UpcomingFleetProduct` (`served?: never`), sur le calque `FleetAgent`. Bell : `status: "built"`, `ProductWiring` réel (collecteur, contrôles fermés de l'éditeur, publication signée + vérificateur), `served` W-1, `note` sans chiffre, **rendue sur `/bell`** (garde E6, voir `test/ci-gates.test.ts`). `fn` rendu vrai aujourd'hui : « a gap per session when its closing price can be read, a named abstention when it cannot ». `SHARED_GATE` exporté. **Écart déclaré à la lettre de la consigne 155** : `integration_test: "docs/deploy-CA-bell.json" + scripts/verify-bell.mjs` est inutilisable tel quel, parce que la garde exige des identifiants nus `test("<id>"` existant sous `WIRING_TEST_ROOTS`. La CA et le script vont donc dans `served_by`. `integration_test` reçoit deux vrais ids : `verify_bell_ca_check5_runs_real_bell_verify` (`test/verify-bell.test.ts`) et `bell_served_data_matches_deploy_ca` (`test/bell-served.test.ts`). |
| `apps/site/components/upcoming-panel.tsx` | « Cleared by the same gate » n'est plus dit que de la gate partagée (Hikae). Bell affiche « Gate: the publisher's closed checks… ». Mesuré dans `products.html` rendu : 5 × « same gate: Hikae », 1 × « Gate: the publisher ». |
| `apps/site/lib/fleet-presentation.ts` | Bloc INSIDE `bell` passé en `built` (« What's inside ») avec 3 points vrais aujourd'hui. Le point « an off-hours gap per session » est retiré : aucun écart n'est servi. |
| `apps/site/app/products/page.tsx`, `components/gate-sim/board.tsx`, `app/page.tsx`, `app/fleet/page.tsx` | Phrases devenues fausses : « Every product is upcoming » (×3) → « MONARK Bell is built; every other product is upcoming » ; carte Bell de l'accueil (« to come » retiré, fn vrai) ; « what Bell will add (upcoming) » ; « MONARK Bell is listed there, upcoming. » → « …listed there. ». |
| `test/ci-gates.test.ts` | `fleet_register_built_set_is_frozen` re-épinglé : agents built = {Shōgen, Hikae, Ukemi, Narabi} inchangé ; produit built = {bell} ; `upcomingCount` 13 → **12** (7 agents + 5 produits). La garde de câblage parcourt aussi les **produits built** (`served`, ids réels sous `WIRING_TEST_ROOTS`) et affirme que MONARK Bell y passe. Le `note` produit entre dans le scan numérique. La garde (6) exige en plus le **rendu** `{…served.note}` sur `/bell` (mutant : suppression du rendu ⇒ rouge). |
| `test/visage-register.test.ts` | Flotte 13 → 12 upcoming ; global 16 → 15 ; bloc INSIDE `bell` attendu `built` (clés des produits built dérivées du registre et affirmées = `["bell"]`) ; titre mis à jour. |

## 2. Faits lus sur place (première main, [lu])

- **GET 21:42:39Z** (curl) : `/timeline.jsonl`, `/state.json`, `/bell/pubkey.json` et `/provenance.json` répondent 200. Leurs sha sont `8dfd2b78…`, `a828489f…`, `beec868a…` et `4935a259…`, **égaux** aux `bodies_sha256` de `docs/deploy-CA-bell.json`.
- **Vérificateur** : `node apps/bell/scripts/bell-verify.mjs --url https://bell.monarkgate.tech --keyring apps/bell/keys/bell-keyring.json` → exit 0, `{"status":"consistent_with_supplied_keyring","head_seq":1,"publications":1,"active_key_id":"30fd26e8…"}`.
- **line_hash** `4a417cf02289b4968c17e7dc9f61c013bf04d62c77e541993a05a20a6965f47c`. Recalculé **indépendamment**, avec une canonicalisation ré-écrite hors de `bell-chain.mjs`, sur le corps lu à 21:42Z. Même valeur au générateur et à la publication (`docs/CHANTIERS.md:1340`). Le miroir opérateur `F:/PRODUITS/bell-mirror/timeline-seq1-2026-09-23T2135Z.jsonl` a pour sha `8dfd2b78…`, identique au corps servi.
- **state.json servi (constat de lecture, jamais rendu sur le site)** :
  - 4 entrées `gaps`, **toutes** `abstain: "no_close_ref"`, aucune clé `gT` ; `residuals.no_close_ref` = 4.
  - `volume[]` : 4 entrées **avec** `vol_ratio` (`adv_period` {2026, 8}, `n_bars` 21).
  - Donc la copie dit : pas de close, donc pas d'écart ; le ratio de volume est dans l'enregistrement.
  - Cette affirmation est liée à la seq 1 par `line_hash` → `state_sha256` (contenu immuable).
- **provenance.json servi** : `providers.faults[0].provider = "databento"` (et `providers: ["helius","chainstack"]`). Voir P-2.
- **Prose non épinglée par un test** : sur `/bell`, « each of its sessions abstains with `no_close_ref` » et « the volume ratios » (ce dernier est mon ajout, la consigne ne demandait que la jambe cash). Ces deux phrases reposent sur la lecture [lu] de 21:42Z, liée à la seq 1 par `line_hash` → `state_sha256`. Aucun test n'en porte le contenu, parce que les données du site ne copient pas le state, par règle. Si l'orchestrateur veut les épingler : le générateur peut lire l'immuable `/states/<state_sha256>.json` et refuser d'écrire si une entrée `gaps` n'est pas abstenue (un GET de plus).

## 3. Contrôles (11), sous ceinture A-7 et TEMP/TMP/TMPDIR = `F:/tmp/sitebell/tmp`

Journaux : `F:\tmp\sitebell\tmp\controls\*.log` (passe 2) et `F:\tmp\sitebell\tmp\controls-run2.txt`.

| # | Contrôle | Passe 1 (avant le correctif du panneau) | Passe 2 (état livré) |
|---|---|---|---|
| 1 | `next build` (apps/site) | exit 0, 19/19 pages statiques | exit 0, 19/19 |
| 2 | `node scripts/assert-fleet-html.mjs` | exit 0 | exit 0 |
| 3 | `node --test test/site-honesty.test.ts` | 8/8 | exit 0 |
| 4 | `npm run gate:vocab` | exit 0 | exit 0 |
| 5 | `npm run lang:gate` | exit 0 | exit 0 |
| 6 | `npm run export:check` | exit 0 (« 0 forbidden path ») | exit 0 |
| 7 | `node --test test/ci-gates.test.ts` | 31/31 | exit 0 |
| 8 | `npm run typecheck` | exit 0 | exit 0 |
| 9 | `npm run lint` | exit 0 | exit 0 |
| 10 | `npm run lint:ratchet` | exit 0 | exit 0 |
| 11 | `npm test` | **1 176 tests, 1 174 pass, 0 fail, 2 skip préexistants** (win32 SIGTERM ; artefacts u4b absents), 538 s ; test 42 passé dans le lot, **T42-LOAD-1 sans objet** | 1 176 / 1 174 / 0 fail / 2 skip, 349 s |

**Passe 3 (état final)**, après deux corrections : le héros ne présente plus la clé servie comme racine, et la `note` servie est rendue sur `/bell` avec la garde (6). Résultats : build exit 0 (19/19) ; assert-fleet-html, site-honesty 8/8, gate:vocab, lang:gate, export:check, ci-gates 31/31, typecheck, lint, lint:ratchet tous exit 0 ; npm test 1 176 / 1 174 / 0 fail / 2 skip préexistants, 497 s. Clôture (décision 156) sur l'état final : typecheck exit 0 ; node --test ci-gates + bell-served + visage-register 38/38 ; gate:vocab exit 0 ; lang:gate exit 0. Journaux : `F:\tmp\sitebell\tmp\controls\` (passe 3) et `controls-run2\` (passe 2).

Preuve hors réseau : les lignes `drpc.org`/`mevblocker.io` du journal `npm test` viennent de `apps/sentinel/test/ukemi-guard-record.test.ts`, qui remplace `globalThis.fetch` par un stub (`withFetch`, C-5). Ce ne sont pas des appels réseau.

## 4. Captures (`F:\tmp\sitebell\captures\`, sha dans DELIVERED.sha256)

- `bell-light.png`, `bell-dark.png`, `bell-method-light.png`, `bell-method-dark.png`, en 1 280 px de large, pleine page.
- Procédé : Chrome headless, profil jetable `F:/tmp/sitebell/tmp/chrome-prof-*`, `--disable-background-networking --disable-component-update`, thème par `--blink-settings=preferredColorScheme=0|1`. Serveur `next start -H 127.0.0.1 -p 3917` (boucle locale), arrêté ensuite.
- Relu visuellement : le sombre est appliqué, le bloc Served s'affiche en tête de `/bell`, les cartes « How to check a line » et « Detectable by whom » s'affichent sur `/bell/method`.
- Les captures datent d'avant les deux dernières corrections de /bell (phrase du héros et note servie en pied de statut) : /bell/method est inchangé, /bell diffère de ces deux phrases. La clôture immédiate (décision 156, « aucune autre modification ») exclut une nouvelle prise ; re-capture /bell à faire à la revue visuelle conjointe (CHANTIERS:1132)
- Pas de capture mobile (non demandée ici ; la revue visuelle conjointe de CHANTIERS:1132 la prévoit).

## 5. R-25

Mesure au format CI (`git diff --shortstat 7a39698 -- . ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json'`, fichiers neufs inclus par un `git add -N` temporaire, annulé ensuite) : **227 + 283 (fichiers neufs) insertions, 86 suppressions = 596 ≤ 1 150** (mesure finale sans toucher l'index : shortstat des suivis + wc -l des 4 fichiers neufs).

## 6. Décision 155 : ce qui pinnait M004 D14, à citer dans l'ADR d'amendement (orchestrateur)

- `test/ci-gates.test.ts:820-828` @ `7a39698`. Le commentaire (l.820-821) dit : « All six products are upcoming — … never "built" (ADR-M004 D14 invariant) ». L'assertion est aux l.826-827 : `assert.equal(p.status, "upcoming", …)`. S'y ajoute `:837` : `assert.equal(upcomingCount, 13, …)`.
- Également `apps/site/lib/fleet.ts:245` @ `7a39698` (« NONE is built today (ADR-M004 D14 invariant) ») et `test/visage-register.test.ts:58-59` @ `7a39698` (13 et 16).
- État livré : `test/ci-gates.test.ts:825-832` (`BUILT_PRODUCTS = ["bell"]`) et `:842` (12).
- L'ADR devrait aussi dater l'écart à **ADR-B0 D8**, puisque la Définition de fini n'est pas atteinte (P-4). Il devrait aussi relever la clause de `upcoming-panel.tsx` (« a product that is not built has nothing built to show »), désormais fausse pour Bell (item I-8).

## 7. Points à trancher (texte)

- **P-1 — le FAIT « databento/massive interdits par `vocab-banned.json` scope site » est inexact.**
  - Mesure : `grep -n -i -E "databento|massive|polygon" vocab-banned.json` donne 0 ligne. Le scope `site` ne bannit aucun des deux.
  - Seule garde : `test/no-cash-provider-name.test.ts`. Elle couvre `\bmassive\b`, `polygon.io` et `POLYGON_API_KEY` sur **tout fichier exporté**, et reste volontairement hors de `vocab-banned.json`, qui est exporté (C-9).
  - **« databento » n'est banni sur aucune surface exportée.**
  - Livré dans le périmètre : le scan de `bell_served_data_carries_no_market_value`, limité à `/bell`, `/bell/method` et `bell-served.json`.
  - À trancher : ajouter `/databento/i` aux `PROVIDER_FORMS` de `no-cash-provider-name.test.ts`, pour couvrir tout l'export (I-3).
- **P-2 — `/provenance.json` servi par l'hôte Bell nomme « databento ».**
  - Le nom figure dans `faults`, conséquence du « fix the bundle » de la décision 149 (CHANTIERS:1340).
  - Le site ne lie pas ce fichier, par choix. Mais l'hôte le sert publiquement, et la décision 69 comme CLOSE-SOURCE-NAMING-1 visent « jamais un nom de fournisseur sur une surface publique ».
  - Le test `no_cash_cross_provider_name_on_bell_served_files` ne voit pas la forme `databento`.
  - À trancher côté hôte (FAULTS-PROVIDER-NAME-1, déclencheur « AVANT la prochaine publication »).
- **P-3 — « Kane » non ajouté.**
  - ADR-B0 D4 : le capteur `FLEET_AGENTS` `upcoming` est la forme de T-1/T-2 ; « à la Définition de fini, "MONARK Bell" devient produit `PRODUCTS` `built` ». Le nom est « à confirmer T-1b », et le contrôle de collision est en attente (ADR-T1b D12).
  - J'ai donc flippé le **produit** seul. Les comptes d'agents restent 4 built et 7 roadmap : « Four built, seven on the roadmap » et `package.json` « 4 agents built, 7 on the roadmap » restent vrais, aucune réécriture.
  - Si l'orchestrateur veut Kane, un agent de plus impose de re-pinner les comptes d'agents, `package.json` et `/fleet`, `/roadmap`, `/`.
- **P-4 — Définition de fini (ADR-B0 D8) non atteinte ; la décision 155 la supersède.** Écarts mesurés :
  - (i) « recalculable par un tiers disposant d'une licence de close » : aucun écart dans l'enregistrement (close non lu), et code de rejeu non exporté (EXPORT-BELL-1) ;
  - (ii) disponibilité : aucune sonde externe indépendante, et cible ≤ 10 min « ni tenue ni revendiquée » (D13.2) ;
  - (iii) couverture E (parité) : T-2 non fait ;
  - (iv) export public gaté d'`apps/bell` : non fait.
  - Critères tenus :
    - timelines chaînées et signées (vérificateur exit 0) ;
    - abstentions comptées et publiées (`state.residuals`) ;
    - page de méthode publique ;
    - `gate:vocab` sur `apps/bell`.
  - À dater dans l'ADR (orchestrateur).
- **P-5 — la gate de Bell n'est pas Hikae.**
  - Selon la consigne 155, `wiring.gate` = « the publisher's closed checks: read quorum, earliest publication time, no closing price carried ». La classe (B) `tsv-offhours-gap-24h` sur Hikae relève de T-3 et n'est pas câblée.
  - Le panneau produit ne dit plus « same gate » pour Bell (correctif livré).
  - Question ouverte : le texte du dialogue produit, « A product is a wiring of fleet agents; the agent is the engine. », reste générique. Aucun agent n'est nommé pour Bell tant que P-3 n'est pas tranché.
- **P-6 — nature du test d'intégration W-1.**
  - Le tuyau servi (hôte) est **témoigné** par un enregistrement CA committé : exécution sur l'hôte, 12/12.
  - Hors ligne, deux tests le couvrent :
    - `bell_served_data_matches_deploy_ca` : données site = CA = trousseau committé ;
    - `verify_bell_ca_check5_runs_real_bell_verify` : le script CA lance le vrai vérificateur.
  - Il n'existe pas de rejeu hors ligne de l'hôte lui-même en CI (réseau).
  - À juger au regard de la règle de branchement de CLAUDE.md : chemin servi et test d'intégration non-LLM.
- **P-7 — `read_at` hors de la liste fermée.**
  - `bell-served.json` porte `host` et `read_at` en plus de seq, published_at, line_hash, key_id et sha des corps.
  - Motif : le sha du corps de la timeline n'est vrai qu'à la date de lecture, car le corps croît à chaque publication. La page dit « Read … at {read_at} ».
  - Aucun chiffre hors seq, dates et sha.
  - Si refusé : retirer `read_at` et le sha du corps de la timeline ensemble.

## 8. Actions d'environnement (déclarées)

- **Réseau** : GET sur `https://bell.monarkgate.tech` seulement.
  - curl ×4 à 21:42Z ;
  - `bell-verify --url` vers 21:43Z (ses GET : timeline, pubkey, state, provenance, immuables) ;
  - générateur ×2 à 21:53Z.
  - Aucun GET sur `monarkgate.tech`.
  - Chrome headless était pointé sur la boucle locale. Les appels de fond sont désactivés par flags ; **aucune tentative sortante n'a été mesurée par un proxy** (résiduel déclaré).
  - Aucun `npm install` ni `npm ci`.
- **node_modules** : le worktree n'en avait pas.
  - Une jonction de `node_modules` vers `F:\Monark\node_modules` a été **refusée par Turbopack** (« Symlink [project]/node_modules is invalid, it points out of the filesystem root ») puis retirée par `rmdir`.
  - Copie locale ensuite : `robocopy F:\Monark\node_modules`, lock identique entre `lot/etude-suite` et la branche (`git diff --stat` vide sur `package-lock.json` et `package.json`).
  - robocopy avait **copié** les 10 paquets d'espace de travail `@monark/*` depuis `F:\Monark`. Ces copies ont été supprimées et remplacées par des **jonctions vers ce worktree** (`@monark/site` → `F:\Monark-wt-sitebell\apps\site`, etc. ; vérifié par `readlink`).
  - `node_modules` est gitignoré.

## 9. Items formés (propriétaire, déclencheur, preuve)

- **I-1 METHOD-SERVED-STALE-1** — la copie « faits » de `/bell` (fait deux au futur, `adv_period` et `n_bars` « upcoming · in review ») et `/bell/method` (§periods : « the collector computes the denominator over a different window… a change in review » ; `no_multiplier` listé « upcoming ») sont en retard sur l'enregistrement servi.
  - Le `state.json` de la seq 1 porte `volume[].adv_period`, `n_bars`, `vol_ratio`, et la formule « the calendar month before session_date_et ».
  - `state.residuals` contient la clé `no_multiplier`.
  - Hors liste fermée de ce lot, non corrigé.
  - Propriétaire : orchestrateur. Déclencheur : prochain lot vitrine touchant `/bell` ou `/bell/method`. Preuve : `state.json` servi et test `bell_method_facts_match_collector`.
- **I-2 DOD-D8-AMEND-1** — l'ADR d'amendement M004 D14 doit dater les écarts de P-4 et la clause « atteignable au plus tôt après T-2 ». Propriétaire : orchestrateur. Déclencheur : G7 de ce lot.
- **I-3 PROVIDER-FORMS-DATABENTO-1** — ajouter `/databento/i` à `PROVIDER_FORMS` (`test/no-cash-provider-name.test.ts`, non exporté), avec un témoin positif. Propriétaire : orchestrateur. Déclencheur : G7 de ce lot. Preuve : base mesurée de 0 occurrence dans les fichiers exportés, à re-mesurer par le test.
- **I-4 FAULTS-PROVIDER-NAME-1** (existant, CHANTIERS:1340) — noter en plus que le `/provenance.json` **servi aujourd'hui** porte l'étiquette « databento ». Propriétaire : orchestrateur. Déclencheur : avant la prochaine publication.
- **I-5 WT-NODE-MODULES-1** — `F:\Monark-wt-sitebell\node_modules` est une copie locale, et `@monark/*` sont des jonctions.
  - **Attention au nettoyage** : faire d'abord `rmdir` de chaque jonction `node_modules\@monark\*`, puis seulement supprimer le reste. Un `rm -rf` qui traverserait une jonction effacerait les sources du worktree.
  - Propriétaire : orchestrateur. Déclencheur : fin du lot ou suppression du worktree.
- **I-6 BELL-SERVED-RESYNC-1** — `bell-served.json` est un instantané.
  - À la seq 2, le sha du corps de la timeline change ; les champs du 1er enregistrement ne changent pas.
  - Procédure : relancer `node scripts/sync-bell-served.mjs`, mettre à jour le manifeste (le script imprime le sha) et re-pinner `PINNED_FILE_SHA256`. `bell_served_data_matches_deploy_ca` exige aussi une CA re-jouée sur la même seq.
  - Propriétaire : orchestrateur. Déclencheur : avant tout upload vitrine suivant une publication.
- **I-7 KEY-ROTATION-COPY-1** — `/bell/method` garde le placeholder `key_rotation_policy`, alors qu'ADR-T1b D9 décrit rotation, révocation et perte. Hors liste fermée. Propriétaire : orchestrateur (copie). Déclencheur : prochain lot vitrine `/bell/method`.
- **I-8 PANEL-BUILT-COPY-1** — le commentaire et la doctrine d'`upcoming-panel.tsx` (« Exactly ONE status signal — the product-level Upcoming badge », « a product that is not built has nothing built to show ») datent d'avant 155. La `served.note` est rendue sur `/bell` et gardée (6) ; elle ne l'est pas sur `/products`.
  - Le composant rend bien le statut du registre (« built »), mais Bell n'a pas de gabarit « built » propre sur `/products`.
  - Propriétaire : orchestrateur. Déclencheur : revue visuelle conjointe (CHANTIERS:1132).
- **I-9 STATUS-METHOD-ROW-1** — dans le tableau de statut de `/bell`, la ligne « method page » reste `upcoming`, alors que la page est servie par le site. Le pill est préexistant et non touché : ma liste fermée ne couvrait que state, timeline et key. Propriétaire : orchestrateur. Déclencheur : même lot que I-1.
