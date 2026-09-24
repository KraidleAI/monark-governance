# G1 — Lot BELL-CASH-LEG-1 (jambe cash réactivée, étiquettes génériques, outillage de course committé)

Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, effort max) — déclaré en tête de session (R-1).
Worktree `F:/Monark-wt-cashleg`, branche `lot/bell-cash-leg-1`. Base du lot `5ad3718c255a635e8a381308ff9adf0e760f005c` ; gel G2 `3bda2cad364fd151074de209c821fd0e4959cf7c`
(commit orchestrateur). Le pli de la G2 fraîche (§12) est posé **sur le gel, non committé** (R-20).
Cadre : `docs/adr/ADR-BELL-CASH-LEG-1.md` D1-D5 + **amendement checkpoint-1 C-1..C-12 (fait foi)** ; `ADR-T1aii` D1-quinquies (-b3b) ; `docs/RUNBOOK-bell.md` §9-12 ;
corrections de la G2 fraîche (deux lentilles, gel `3bda2ca`) B1, B2, M1-M9, message orchestrateur du 2026-09-24.
Hygiène : toute commande node/npm sous `env -u` des 8 clés + `TEMP/TMP/TMPDIR=F:/tmp` (A-7) ; aucun `env` affiché ; **aucun appel réseau** hormis
`npm ci` (registre npm, `--ignore-scripts`, cache `F:/tmp/npm-cache`) ; `docs/juriste/` non lu ; fichiers interdits (C-1) non touchés :
`scripts/sync-bell-served.mjs`, `apps/site/**`, `test/bell-served.test.ts` (vérifié par `git status`, 0 modification).

## 1. Journal de provenance (template du corpus)
| Date | PR/commit | Modèle | Effort | Contexte | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-24 | gel `3bda2ca` (commit orchestrateur, base `5ad3718`) | `claude-opus-5-5` | max | ADR-BELL-CASH-LEG-1 + C-1..C-12 ; mission orchestrateur | worker | G2 fraîche, deux lentilles (conformité ; sécurité) | approuvé avec corrections |
| 2026-09-24 | pli G2 sur `3bda2ca` (non committé) | `claude-opus-5-5` | max | corrections G2 B1, B2, M1-M9 (message orchestrateur) | worker | orchestrateur (R-21), puis checkpoint-2 | en attente |

## 2. Fichiers livrés (sha256 des octets du worktree, LF)
| Fichier | +/− (numstat vs `5ad3718`) | sha256 (après pli) | au gel `3bda2ca` |
|---|---|---|---|
| `apps/bell/src/close.ts` | 19/8 | `4696c74300e4a463c1b34327e8319d7ae73f5eed0787d530d40d2370f3b1a64f` | identique |
| `apps/bell/src/collect.ts` | 5/5 (toujours 883 lignes) | `4eb8271394a5eb6a7281b79690afbc2e050ab3ab701e0166c2f0dd76182ab829` | identique |
| `apps/bell/scripts/bell-publish.mjs` (commentaire `:93-94` seul) | 2/2 | `462962e08c7939a42aeb8056bdbfb6201d6b49bef65295e90ae5673f3539ddc2` | identique |
| `apps/bell/ops/launch-q6.sh` (nouveau) | 154/0 | `76c8429eaa61d3901e5d4b74eedd217858502b8aa16fd202031a07eab45a2e95` | `36382bc7…` |
| `apps/bell/ops/q6-controls.mjs` (nouveau) | 322/0 | `d38bce97b6f4ed10e36c5a4945995ba60648c7e12752a315ae96eb27a8e1953b` | `214363bb…` |
| `apps/bell/test/bell-ops.test.ts` (nouveau) | 203/0 | `901bb3448a6fc8cbe2c7be3f43a4ef61dc3ee4c554a79678e4b982abc6451e0b` | `293052e7…` |
| `apps/bell/test/close.test.ts` | 48/5 | `d7a8f2c69f0bddc406091f60f2691967a44c48015836a245036eab38314816bd` | identique |
| `apps/bell/test/bell-served-e2e.test.ts` | 13/0 | `3012237e71d0df34b5dea23f898b22a46d8b1328c7eaae101d86f3276f71cdc8` | identique |
| `apps/bell/test/bell-keys.test.ts` | 6/3 | `25ab6a2ac802ece1a0bc5fbf0fbbf231b76d97b0dc51f4c199d537ae1f7a59e8` | identique |
| `apps/bell/test/helpers/bell-served.ts` | 8/5 | `0b906d66e6b3b7b74b711e557f9be208ea8c61425fffca23b8a568540a9c8c3f` | identique |
| `apps/bell/test/bell-publish-validate.test.ts` | 3/2 | `e861461dd615b7b16a350c1551a73d4926ac08cfa597fb4ff15c88bb5a7058e2` | identique |
| `test/bell-caddy.ts` | 1/1 | `15ec9d7249b21990fd74f1552d0e37f68a89ef8a8bf538c6177984cf43b87fd9` | identique |
| `docs/RUNBOOK-bell.md` | 50/4 | `1481c2164f1d10eb99f0de3e3dc5a75fa4879b51d7305a8a0c612b139967e779` | `9d710c84…` |

Correspondance des sites de `close.ts` (lignes de base → lignes livrées) : requête close `:159→:170`, faute transport `:162→:173`,
faute de forme `:167→:178`, requête de recoupement `:170→:181`, faute de recoupement `:173→:184` ; `collect.ts:435` inchangé de ligne.

## 3. Corrections et décisions (état après pli)
| Item | Fait | Où | Preuve |
|---|---|---|---|
| D1 + C-4 (CASH-KEYLESS-SKIP-1) | clé Databento vide ⇒ **aucune requête** (`continue` avant tout `push`/appel), abstention `no_close_ref` sans faute, rien dans `cash_request_digest` ; commentaire `:41-42` corrigé (`:48-51` livrés) | `close.ts:164-166` | `bell_cash_keyless_emits_no_request` ; M1 |
| C-5 | `MASSIVE_API_KEY` n'est nommé nulle part ; la clé de recoupement lue est `POLYGON_API_KEY` (`readCashKeys`, inchangé) | `launch-q6.sh`, test | `bell_ops_launch_unsets_only_read_unneeded_vars` |
| D2 + C-3 + C-11 | `CASH_CLOSE_LABEL="cash-close"`, `CASH_CROSS_LABEL="cash-crosscheck"`, `ADV_BARS_LABEL="adv-bars"` exportés ; appliqués à `CashRequest.provider` et `TransportFault.provider` seulement ; `close_source`/`adv_source`/`CLOSE_SOURCE`/`ADV_SOURCE` **inchangés** ; pli (b) « faults ∈ providers » non fait (retiré par C-3) ; commentaire `bell-publish.mjs:93-94` réécrit sans nom de fournisseur | `close.ts:28-34,170-184`, `collect.ts:435` | `bell_cash_labels_are_generic` (M2b-M7) ; pin `bell_publish_bare_label_guard_pins_operator_vocabulary` étendu aux 3 étiquettes + refus des 2 hôtes de seq 1 (M8) |
| C-2 | E2E hors-ligne : `runMain` + `databentoGet` rejetant `HTTP 400` (clé synthétique posée) → `provenance.json` porte `{provider:"cash-close",status:"HTTP 400"}` → `publishToDir` **publie** ; servi = écrit | `bell-served-e2e.test.ts` | `bell_cash_fault_label_publishes_through_real_publisher` ; M2 ⇒ `bell/publish: url_or_key_shaped_string: $.runs[0].provenance.providers.faults[0].provider` |
| C-6 (C14, bloquant) | pour tout gap `no_close_ref` : FAIL si `earliestPublishUtc(refCloseDateOf(session, anchor)) <= now` (fonctions de l'arbre d'exécution) ; gaps remplis : `gT` string + `earliest_publish_utc` = celui recalculé + `cash_cross` `matched` ; `cash_cross_mismatch` ⇒ FAIL « STOP … investigate » ; `cash_cross_unavailable` ⇒ FAIL ; ancre = `session_date_et` de l'entrée volume jointe (§5) ; **chaque branche couverte après pli (B1)** | `q6-controls.mjs:184-201` (jointure), `:203-226` (C14) | test controls ; M12, M16, MQ1-MQ7 |
| C-7 | pré-vol `metadata.get_cost` dans le lanceur, avant `node collect`, exécuté aussi en DRYRUN, n'imprime que `cost_usd=<n>`, exit 4 au-delà de 1 USD ⇒ STOP ; requête construite par `close.ts` (`DATABENTO_HIST`, `databentoCostPath`) sur tous les jours de référence atteignables par la fenêtre ; corps non-JSON ⇒ exit 3 sans en imprimer un octet (M5) | `launch-q6.sh:74-91,126-127` | `bell_ops_cost_preflight_prints_only_the_cost` ; M10, M11, S02, S03, M5j |
| C-8 (C15) | `--seq1-state` : par session (clé symbole/session/régime/ancre) `vwap`, `volumeBase`, `n` égaux à seq 1 sinon WARN chiffré (valeurs seq1/seq2 + delta) ; fenêtre différente ⇒ WARN « not comparable » | `q6-controls.mjs:299-320` | test controls ; M15 |
| C-9 + D5 | un seul lanceur paramétré `launch-q6.sh <MINT> <mode> --out <dir>` ; `--out` obligatoire ; STOP si `<out>/state.json` existe (garde placée **avant** toute autre) ; `env -u` = les 2 variables lues et non nécessaires (`CHAINSTACK_ETH_URL` `transport.ts:106`, jambe `--eth` seule ; `BELL_HALTS_CSV` `collect.ts:848`) **+ les 3 URL payantes jamais lues** (`CHAINSTACK_BASE_URL`, `CHAINSTACK_BSC_URL`, `CHAINSTACK_ROBINHOOD_URL` : moindre privilège, G2 M7) ; xtrace forcé à off et aucune copie de secret (G2 B2) ; `q6-controls.mjs` committé ; `--out` obligatoire aussi côté contrôles | `apps/bell/ops/` | tests ops ; M9, M17, M18, M7u, S04, S04b |
| C09 / C11 (C-4) | C09 : **aucune** faute portant une étiquette cash (FAIL sinon), toute étiquette non nue = FAIL (test ajouté, M6) ; drapeau `--expect-databento-401` supprimé ; C11 attend `no_close_ref` = sessions non encore publiables (compte de C14) | `q6-controls.mjs:165-177,228-234` | test controls ; M13, M14, S21 |
| C-10 | R-25 mesuré §8 | — | — |
| C-11 | aucun `journal.json`/log de course committé | — | `git status` |
| C-12 | RUNBOOK §8 bis « un jour croisé à blanc » (`get_cost` gratuit, gardé contre la clé vide, puis `readReferenceCloses` sur UN jour **seulement après** `cost_usd=<n>` avec n <= 1 ; `{"cross":{"TSLA":{"2026-09-15":"matched"}},"faults":[]}` exigé, STOP sinon) + course + contrôles (jamais `--now`) ; relabel manuel interdit (§10 + « Never ») | `RUNBOOK-bell.md:246-285` | `bell_runbook_dry_cross_cost_command_guards_the_key` (commande exécutée telle qu'écrite) ; `bell_runbook_never_prints_private_key` vert ; M2g, M2o |
| C-1 | tuyau 3 et D4 hors lot ; fichiers interdits intacts | — | `git status` |

## 4. Profil HTTP 400 de seq 1 (Q6-C09-DATABENTO-1) — expliqué, clos par le skip
- **[mesuré, hors ligne, rejouable]** avec une clé vide, le `databentoGet` par défaut (`close.ts:198-199` livrés) envoie
  `Authorization: Basic Og==` à `hist.databento.com` : `Og==` = base64(`":"`), soit un identifiant **vide** et un mot de passe vide.
  L'en-tête est donc **présent** : ce n'était pas « une requête sans Authorization » (formulation du §Contexte de l'ADR). Commande :
  `node --input-type=module -e 'globalThis.fetch = async (url, init) => { console.log(new URL(String(url)).host, init.headers.Authorization); return new Response("", { status: 400 }); }; const { databentoGet } = await import("./apps/bell/src/close.ts"); try { await databentoGet("/v0/x", ""); } catch (e) { console.log(e.message); }'`
  → `hist.databento.com Basic Og==` (le `HTTP 400` qui suit vient du bouchon, pas du serveur).
- **[lu, première main]** les trois journaux de seq 1 portent exactement une faute `{"provider":"databento.com","status":"HTTP 400"}` :
  `F:/course-bell/q6/TSLAx/journal.json` `32022725f4739ff131c757bc3c2726cfbd6dff0538ac77e399e96fbcc4d4f497`, `AAPLx`
  `96990f980397faeebd5b7b570dcdc2cce74bf91f4dc63e72de1ca9738b33f834`, `SPYx` `855ff3e091fd995034900b0f681db8154a41a8fc5ee4f82709ffaebe01905296`.
- **[lu, via `docs/biblio/bell/L-lecture-databento-api-2026-09-20.md:8,48`]** authentification Basic, clé = identifiant, mot de passe vide ;
  table des codes : 400 Bad Request, 401 clé invalide.
- **[inférence, non lue côté serveur]** le serveur classe un identifiant vide comme requête mal formée (400) avant toute recherche de clé
  (401). Le corps de réponse n'est pas journalisé (C-10 : statut seul), donc non vérifiable sans un nouvel appel sans clé, que le skip
  rend sans objet. Aucun procurement nécessaire : C-4 retient le mécanisme client, et l'appel n'est plus émis.

## 5. C14 : jointure gap → date de séance (point de conception)
Une entrée `gaps[]` ne porte pas sa date d'ancre ; l'entrée `volume[]` du même groupe la porte (`session_date_et`). `collect()` émet une
entrée gap et une entrée volume par groupe, dans le même ordre (`collect.ts:150` tri ancre puis session) ; `buildDigest` re-trie les gaps
par symbole/session/régime avec un tri **stable** (`digest.ts:101-102`). Dans un seau (symbole, session, régime), le k-ième gap est donc le
k-ième volume. Chaque paire doit avoir le même `n`, et les seaux la même taille, sinon C14 échoue « join not proven » (fail-closed, jamais
une date devinée ; M16). Seau multi-dates exercé par le test (deux sessions `weekend` à 08-14 et 09-18).
`now` = horloge au moment du contrôle (`Date.now()`). `--now <ms>` est une surcharge de **test hors ligne** : présente, elle imprime
`FAIL Q6-C00 clock override --now=<iso>: offline tests only, never a course control` ; non finie ⇒ exit 2 (G2 M1).
**Limite déclarée (observation de la G2, cas C15e du relecteur)** : la garde `n` détecte une jointure rompue, pas toutes. Deux sessions du
même seau avec le même `n`, dans un état **modifié hors collecteur**, peuvent être appariées à tort sans alerte. Sur une sortie du
collecteur, l'appariement est exact par construction. Pour joindre par clé, `gaps[]` devrait porter `session_date_et` : c'est un
changement de digest (re-pin de `PINNED_BELL_SHA`), hors de ce lot. **Item formé BELL-GAP-ANCHOR-1** — propriétaire : orchestrateur ;
déclencheur : le prochain lot collecteur qui touche le digest.

## 6. Re-pins justifiés ligne par ligne (C-12) et fixtures
- `close.test.ts:49` base, `:51` livré (`a.provider` `"databento.com"` → `"cash-close"`) : littéral de `CashRequest.provider`, le champ D2. Le test exerce
  `cashRequestDigest` comme fonction pure ; la fixture reprend le vocabulaire émis par `close.ts:170` pour ne plus porter d'hôte.
- `close.test.ts:50` base, `:52` livré (`b.provider` `"polygon.io"` → `"cash-crosscheck"`) : idem pour la requête de recoupement `close.ts:181`.
- `close.test.ts:98` (livré ; base `:96`) : digest attendu des requêtes **réellement émises** ; avec l'ancien littéral le test rougit (M3).
- `close.test.ts:99` (livré ; base `:97`) : idem pour le recoupement (M5).
- `close.test.ts:56` base, `:58` livré (`close_source: "databento-equs-summary"`) **non re-pinné** : `close_source` est hors D2 (C-3).
- Fixtures `runMain` (clé synthétique `DATABENTO_API_KEY: "k"` ajoutée) : `helpers/bell-served.ts`, `bell-publish-validate.test.ts`,
  `test/bell-caddy.ts`. Elles appelaient le lecteur de close avec une clé vide, c'est-à-dire le comportement que C-4 supprime. Sans la clé,
  `bell_publish_refuses_unpublishable_session` (« carries a g_t ») et les non-vacuités `cash_cross`/`withGt` de `bell-served-e2e` rougissent.
  Avec la clé, elles lisent le même close synthétique qu'avant (contenu servi inchangé, seul `cash_request_digest` suit les nouvelles étiquettes).
  `runMainInto`/`publishedRun` acceptent un `databentoGet` de remplacement (C-2).

## 7. Oracle (commandes de la mission, `env -u` des 8 clés, `TEMP=F:/tmp`) — rejoué complet après le pli (03:28-03:35 UTC), puis sur les fichiers finaux (03:56-04:06 UTC), mêmes résultats
| Étape | Base `5ad3718` | Gel `3bda2ca` | Après pli |
|---|---|---|---|
| `npm run typecheck` | 0 | 0 | 0 |
| `npm run lint` | 0 | 0 | 0 |
| `npm run lint:ratchet` | 0 (69/69) | 0 (69/69) | 0 (69/69, plafond intact) |
| `npm run gate:vocab` | 0 (254 fichiers) | 0 | 0 (254 fichiers) |
| `npm run lang:gate` | 0 | 0 | 0 (un premier passage a rougi sur la variable de test `un`, mot français : renommée `unav`) |
| `npm run export:check` | 0 | 0 | 0 |
| `node --test --test-force-exit apps/bell/test/*.test.ts test/no-cash-provider-name.test.ts test/verify-bell.test.ts test/ci-gates.test.ts` | 324 / 324 pass | 331 / 331 pass | **333 tests, 333 pass, 0 fail, 0 skip** (+2 : `bell_ops_launcher_never_traces_nor_copies_a_secret`, `bell_runbook_dry_cross_cost_command_guards_the_key`) |
| hors mission : `no-secret-in-repo`, `bell-deploy-config`, `bell-served`, `export-public`, `rpc-guard-fetch-only-inside-client`, `bell-method`, `export-hygiene`, `lang-gate-routing` | — | — | 28 tests, 28 pass, 0 skip |
`npm test` complet non lancé (réservé à l'orchestrateur).

## 8. R-25 (C-10)
Mesure sur un **index jetable** (`GIT_INDEX_FILE=F:/tmp/cashleg/w/r25b.index`, `read-tree HEAD` + `add -A` ; l'index réel n'est pas touché),
avec la pathspec exacte de la gate (`ci.yml`, qui exclut aussi `docs/**/*.md` et les séries Bell) :
`git diff --cached --shortstat 5ad3718 -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.json' ':(exclude,glob)fixtures/**/*.jsonl' ':(exclude,glob)fixtures/**/*.csv' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.json' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.jsonl' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.csv' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.json' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.jsonl' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.csv'`
- **au gel `3bda2ca` : 715** (`12 files changed, 684 insertions(+), 31 deletions(-)`, valeur confirmée par la G2). Le 767 du premier G1 venait de
  la commande de la mission, qui compte `docs/RUNBOOK-bell.md`, un fichier hors gate (G2 M9).
- **après pli : 815** (`12 files changed, 784 insertions(+), 31 deletions(-)`) : +100, dont `bell-ops.test.ts` +88 net, `q6-controls.mjs` +10,
  `launch-q6.sh` +2. Le pli seul, du gel au worktree : `3 files changed, 153 insertions(+), 53 deletions(-)` hors docs. STOP 1 150 et CI 1 205
  non atteints. Pour mémoire, la commande de la mission (docs comptés) donne 869.

## 9. Mutants — campagne rejouée après le pli (44 : 43 tués, 1 survivant déclaré hors périmètre ; restauration à l'octet prouvée)
Harnais `F:/tmp/cashleg/w/mutants2.mjs` (sha256 `bb318313b99d5dff0423e035a78e7718d13c021850ec4fa7f177e05a658c1369`), résultat brut
`F:/tmp/cashleg/w/mutants2-result.json` (`026806165fdcd9da2db2ba6943f7094a0daee3bc4c433ee6218f3d68353d780b`, campagne rejouée en entier après le dernier
édit : l'élargissement de la regex M8 ; un premier passage avant cet édit, `98d7022e…`, donnait le même verdict). Pour chaque mutant : sha256 avant →
chaque remplacement à une seule occurrence (ou une ligne supprimée, ou un fichier créé) → test(s) désigné(s) en TAP → **octets originaux réécrits**
(le fichier créé supprimé) → sha256 re-mesuré. Manifeste des fichiers du lot identique avant et après la campagne (`diff` vide), `apps/bell/ops`
revenu à ses deux fichiers. Les 19 mutants du premier G1 sont rejoués (M9 suit le nouveau `env -u`) ; les 25 nouveaux sont au §12.
| # | Mutation | Test désigné | Résultat, message (1er échec) |
|---|---|---|---|
| M1 | skip retiré | close.test | tué : `bell_cash_keyless_emits_no_request :: no request is emitted without a key` |
| M2 | `"databento.com"` à la faute `close.ts:173` | bell-served-e2e | tué : `'bell/publish: url_or_key_shaped_string: $.runs[0].provenance.providers.faults[0].provider'` |
| M2b | idem | close.test | tué : `bell_cash_keyless_emits_no_request :: Expected values to be strictly deep-equal` (+ generic) |
| M3 / M5 | hôte à la requête `:170` / `:181` | close.test | tués : `bell_read_reference_closes_cross_matched_mismatch_unavailable :: Expected values to be strictly equal` (+ generic) |
| M4 / M6 / M7 | hôte à `:178` / `:184` / `collect.ts:435` | close.test | tués : `bell_cash_labels_are_generic :: one fault per site, each under its leg label` |
| M8 | `ADV_BARS_LABEL = "adv.bars"` | bell-keys | tué : `bell_publish_bare_label_guard_pins_operator_vocabulary :: the labels a Bell provenance can carry` |
| M9 | `-u DATABENTO_API_KEY` réintroduit | bell-ops | tué : `bell_ops_launch_unsets_only_read_unneeded_vars :: removed = paid and unneeded + read and unneeded` |
| M10 | plafond ×100 | bell-ops | tué : `bell_ops_cost_preflight_prints_only_the_cost :: over the 1 USD cap => exit 4 (the launcher stops)` |
| M11 | la clé imprimée avec le coût | bell-ops | tué : `… :: 'no form of the key is printed'` |
| M12 | `epu <= NOW` → `epu < 0` | bell-ops | tué : `bell_ops_controls_… :: … /^FAIL Q6-C14 1 session\(s\) without a publishable close: no_close_ref on weekend\|2026-08-14 …/` |
| M13 | faute cash en WARN | bell-ops | tué : `… /^FAIL Q6-C09 cash-leg faults=\[\{"provider":"cash-close","status":"HTTP 400"\}\]/` |
| M14 | `no_close_ref: pending` retiré de C11 | bell-ops | tué : `… /no_close_ref=1 \(expected 0\)/` |
| M15 | C15 ne compare que `n` | bell-ops | tué : `… /^WARN Q6-C15 1 difference\(s\), write the D-n line: …/` |
| M16 | contrôle `n` de la jointure retiré | bell-ops | tué : `… /^FAIL Q6-C14 gap -> session date join not proven …/` |
| M17 | `*_API_KEY=<littéral>` planté dans le lanceur | bell-ops | tué : `bell_ops_scripts_carry_no_secret_shape :: a credential shape in a committed ops file` |
| M18 | garde `state.json` neutralisée | bell-ops | tué : `bell_ops_launch_unsets_only_read_unneeded_vars :: 'C-9: an existing <out>/state.json stops the course'` |
sha256 avant = restauré : `close.ts` `4696c743…`, `collect.ts` `4eb82713…`, `launch-q6.sh` `76c8429e…`, `q6-controls.mjs` `d38bce97…`,
`RUNBOOK-bell.md` `1481c216…` (valeurs complètes au §2).

## 10. Lanceur : ce qui est prouvé hors ligne, ce qui ne l'est pas
- `bash -n` : syntaxe OK. Huit arrêts précoces exécutés au gel (aucun réseau, aucune clé, rien n'est écrit) : sans argument, `TSLAx W3` sans
  `--out`, mint inconnu, mode inconnu, `--out` sans valeur, `--out --x` ⇒ `usage` exit 2 ; `--out` contenant `state.json` ⇒
  `STOP [q6 TSLAx W3]: …/state.json exists: move the previous attempt (proof), never an overwrite` exit 3 ; `--out` vide sans `Q6_*` ⇒
  `STOP [q6 TSLAx W3]: Q6_SHA_G7 is not a 40-hex sha1` exit 3.
- **Preuve xtrace (G2 B2), comportementale** : `F:/tmp/cashleg/w/xtrace-proof.mjs` (`bad2842c39992c0bcb8cbea3c7db443f259b5e210d8c7283e9a3ec05bf4cd3f7`)
  reconstruit un prologue exécutable avec les **vraies lignes** du lanceur (`set -u`, la ligne suivante, `stop()`, les quatre contrôles de
  longueur). Il l'exécute sous `bash -x` avec des valeurs **synthétiques** de la bonne longueur, puis compte chaque valeur dans la trace.
  Sortie `xtrace-proof.out` (`d9c01a48b170576e53649f568a5e2a3590bfadf21d08a10a514e3a3d85a31ef6`) :
  - lot après pli : 0/0/0/0 occurrence, contrôles passés, seule trace `+ set -u` ;
  - lot sans la ligne `{ set +x; }` : 0/0/0/0, la forme « longueur en place » seule ne trace que `[ -n x ]` et `[ 36 -eq 36 ]` ;
  - gel `3bda2ca` : 1/1/1/1, `+ HK=<secret>`, `+ PK=…`, `+ CK=…`, `+ DK=…` (la fuite relevée par la G2).
  Messages d'arrêt sous `set -u` : clé absente ⇒ `STOP [q6 TSLAx W3]: HELIUS_API_KEY absent or of length  (expected 36)` exit 3 ;
  longueur fausse ⇒ `… DATABENTO_API_KEY absent or of length 5 (expected 32: the cash leg is ON, D1)` exit 3. Aucune erreur « unbound ».
- Le snippet `JS_COST` est **extrait du script et exécuté** par le test sur un `fetch` bouchonné (préchargé). La commande 1 du RUNBOOK §8 bis
  est **exécutée telle qu'écrite** (même bouchon, `cwd` = racine du dépôt). `q6-controls.mjs` est exécuté sur des sorties réelles de `runMain`
  et sur des copies JSON mutées de ces sorties.
- **Non exécuté par le worker** : les gardes d'environnement (git de l'arbre d'exécution, PowerShell, ledgers, trajectoire), le DRYRUN
  (il appelle `metadata.get_cost`, un appel réseau gratuit mais réseau) et la course. Premier DRYRUN = acte de l'orchestrateur (§11, I-3).
- `apps/bell/ops` hors export : `collectFiles(ROOT).kept` = 416 fichiers, **0** sous `apps/bell/ops` ; `export-public.mjs:96`
  « a new apps/bell file is NOT exported until an ADR line names it » ; `npm run export:check` exit 0.

## 10 bis. Tuyaux (règle Branchement, CA-11)
| Tuyau | Entrée | Sortie | État | Test d'intégration non-LLM (ce lot) |
|---|---|---|---|---|
| close_ref → gap | `close.ts` `readReferenceCloses` (clé opérateur ; clé vide ⇒ aucune requête) | `collect()` `gaps[].gT` + `cash_cross` | bundle opérateur `<OUT>/state.json` | `bell_close_databento_replays_synthetic_fixture` (runMain, inchangé, vert) ; `bell_ops_controls_c14_c09_c11_c15_on_runmain_outputs` (C14 sur sorties runMain) |
| bundle → servi | `bell-publish.mjs` `publishToDir` | `public/state.json`, `provenance.json`, `timeline.jsonl` | `/var/lib/monark-bell/public` | `bell_publish_consumes_real_runmain_output_end_to_end` ; `bell_cash_fault_label_publishes_through_real_publisher` (C-2) ; CA `scripts/verify-bell.mjs` à la publication (orchestrateur, I-1) |
| servi → vitrine | — | — | — | **hors lot (C-1)** : item BELL-SITE-SEQ2-1 (lot vitrine, déclencheur : publication seq 2) |
Le fait (i) n'est « servi » qu'après la course et la publication seq 2 (actes de l'orchestrateur) ; ce lot livre le code et les contrôles, pas la donnée.

## 11. Écarts déclarés et items formés (aucun dû nu)
- **I-1 BELL-TREE-G7-SEQ2-1 — TRANCHÉ par l'orchestrateur (2026-09-24)** : la CA de seq 2 garde le **G7 déployé**
  `1eaeef982166068ac7a4a4deeb74c9a6b07d0b0c` (`/f/tmp/bell-dn/G7.txt`), et l'étape 2 ne réexpédie pas l'arbre. La dérive est limitée au
  commentaire et consignée : `bell-publish.mjs` déployé sha256 `1355738188e0d2306b8d39689871fa97321de44314d5e678f9a868fc0c9e7f80` contre
  `462962e08c7939a42aeb8056bdbfb6201d6b49bef65295e90ae5673f3539ddc2` au lot. `git diff --stat 1eaeef98 3bda2ca` sur les quatre chemins de la CA
  (`bell-publish.mjs`, `bell-chain.mjs`, l'unité, le Caddyfile) donne `apps/bell/scripts/bell-publish.mjs | 4 ++--` : deux lignes de
  commentaire, rien d'autre.
- **I-2 (conception)** — les valeurs qui nomment le G7 de la course (`Q6_SHA_G7`, `Q6_EXEC_TREE`, `Q6_TRAJ_FILE`, `Q6_TRAJ_SHA256`,
  `Q6_FLOOR_CHAINSTACK_RU`) viennent de l'environnement, validées et affichées par la ligne DRYRUN : un commit ne peut pas porter son
  propre SHA. Les pins de blobs de seq 1 (`adc3260`) sont remplacés par `HEAD == Q6_SHA_G7` + arbre propre + `cmp` du lanceur avec sa copie
  G7. La garde P-1 d'ancre SPYx est conservée (toujours vraie). `FLOOR_HELIUS=60938` est conservé (un plancher est un max avec la somme du ledger).
- **I-3** — premier DRYRUN du lanceur par l'orchestrateur avant la course seq 2 (RUNBOOK §8 bis). **Déclencheur** : course seq 2.
- **Exception sanctionnée par C-7** : le pré-vol lit `DATABENTO_API_KEY` hors de `close.ts`, depuis l'environnement uniquement, jamais en
  argv ni affichée (M11, S02, S03). D1 « les clés ne sont lues que par close.ts » vaut pour le code du collecteur.
- **C-5 et M7** : C-5 disait « ne retire que les variables réellement lues ». L'orchestrateur retient l'observation M7 (moindre privilège) :
  les trois URL payantes jamais lues sont retirées aussi. Le test fixe la règle complète (liste A-7 du RUNBOOK §12 moins les quatre
  variables nécessaires, plus `BELL_HALTS_CSV`).
- `advBarsFor` est exporté (couture de test de D2, `collect.ts:422`).
- **« Coût nul » (ADR C-12) vs RUNBOOK §8 bis** : seul `metadata.get_cost` est gratuit (PR-B-DBN Q7, via `docs/biblio/bell/L-lecture-databento-api-2026-09-20.md:35`) ;
  la requête de plage d'UN jour × UN symbole est facturée. Le RUNBOOK l'écrit ainsi et fait mesurer ce coût à l'étape 1 avant l'appel
  facturé. « Coût nul » de l'ADR = arrondi à zéro de ce montant, pas une gratuité.
- Test `bell_ops_controls_*` : les contrôles tournent sans journal de course (`--log` absent), donc Q6-C01 et la fenêtre (C02/C06/C07)
  échouent toujours et le code de sortie vaut toujours 1. Aucune assertion ne porte sur ce code ; la preuve est portée par les lignes
  C00/C09/C11/C14/C15 assertées une à une. Les copies mutées ne sont pas re-scellées (C02 rougit) : seule la ligne nommée est assertée.
- `q6-controls.mjs` garde `--variant standard` par défaut (inchangé) ; le lanceur committé est la variante rapide et le RUNBOOK passe
  `--variant fast` explicitement.
- **Ajout hors C-12, à trancher par l'orchestrateur** : note C-1 dans « Next publications » du RUNBOOK (la CA de seq ≥ 2 est écrite hors
  dépôt, `docs/deploy-CA-bell.json` reste seq 1 jusqu'à BELL-SITE-SEQ2-1). Elle se retire sans effet si elle n'est pas voulue.
- **Observations de la G2 non pliées (absentes de la liste de l'orchestrateur), relayées pour décision** :
  (a) brouillon sécurité C9 : lancée avec `NODE_DEBUG=fetch|undici` dans l'environnement, la course écrit l'URL Helius avec `?api-key=`
  dans `$LOG`. C'est préexistant (seq 1 identique). Correction possible : `-u NODE_DEBUG -u NODE_OPTIONS` sur l'appel `node collect`, en
  élargissant la règle de M7 ; non faite, pour ne pas déborder la liste.
  (b) la limite de jointure du §5 (item BELL-GAP-ANCHOR-1).
- **Incident d'outillage (sans effet sur les livrables)** : le dossier scratchpad de la session est partagé avec d'autres agents. Un
  `rep.mjs` homonyme y a remplacé le mien pendant le lot. Les deux éditions qu'il a faites (textes C04/C12 de `q6-controls.mjs`) ont été
  relues par `grep`. Tout le reste du travail, pli compris, a eu lieu dans `F:/tmp/cashleg/w/`.
- **Ligne INFO de l'arbre d'exécution (M8)** : information seule. Sur un arbre sans `.git` (copie `git archive`, méthode des relecteurs),
  elle vaut `head=unknown worktree=unknown` (observé sur `F:/tmp/g2cashleg`, lecture seule) ; le test l'admet.
- **Source unique de la liste A-7** : `bell_ops_launch_unsets_only_read_unneeded_vars` lit la liste des variables payantes dans la
  commande du RUNBOOK §12 (`env -u … sh -c`). C'est voulu, mais un reformatage de cette ligne fait rougir le test ops.
- Items de l'ADR non touchés, restés formés : BELL-SITE-SEQ2-1 (lot vitrine), BELL-VERIFY-SCHEDULE-1, LIC-DBN-1, ESC-1-REWRITE.

## 12. G2 pliée (G2 fraîche, deux lentilles, gel `3bda2ca`) — toutes les corrections traitées
Chaque ligne : ce qui est fait, le test qui rougit sous le mutant nommé, le résultat de la campagne (§9, restauration à l'octet prouvée).
Les mutants S** reprennent **verbatim** les définitions du relecteur sécurité (`F:/tmp/g2sec-cashleg-w/mk-mutants.mjs`, `mutants-s23.json`).
Les MQ** sont redéfinis ici sur les lignes citées par la G2 (le relecteur conformité n'a pas archivé leurs définitions).
| Point | Fait | Test | Mutants → résultat |
|---|---|---|---|
| **B1** (conformité) | 4 variantes JSON-mutées du run `good` après le cas `broken` : (a) session remplie → `cash_cross_mismatch` (gT, exceed*, `earliest_publish_utc`, `multiplierUsed`, `rebase_residuals` retirés, `residuals.cash_cross_mismatch=1`) ; (b) `cash_cross:"unavailable"` + `residuals.cash_cross_unavailable=1` ; (c) `earliest_publish_utc+1` ; (d) `gT` numérique | `bell_ops_controls_c14_c09_c11_c15_on_runmain_outputs` (`bell-ops.test.ts:183-198`) | MQ1 `:215` branche STOP inerte → tué (`/…STOP cash_cross_mismatch on weekend\|2026-09-18 \(ref 2026-09-18\): investigate/`) ; MQ2 `:218` test de type `gT` retiré → tué (`/gT=number/`) ; MQ3 `:218` égalité `earliest_publish_utc` retirée → tué (`/earliest_publish_utc=\d+ \(expected \d+\)/`) ; MQ4 `:215` + `:223` (mismatch cohérent accepté) → tué ; MQ5 `:219` test `matched` retiré → tué (`/cash_cross=unavailable \(expected matched/`) ; MQ6 `:223` résiduel `unavailable` retiré → tué (`/residuals cash_cross_mismatch=0 cash_cross_unavailable=1 \(expected 0\)/`) ; MQ7 `:223` résiduel `mismatch` retiré → tué (`/residuals cash_cross_mismatch=1 cash_cross_unavailable=0 \(expected 0\)/`, assertion ajoutée à (a)) |
| **B2** (sécurité) | `{ set +x; } 2>/dev/null` juste après `set -u` (`launch-q6.sh:22-23`) ; longueurs prises **sans copie** : `[ -n "${V+x}" ] && [ "${#V}" -eq N ]` pour les quatre variables, message de longueur paresseux `${V+${#V}}` (`:112-116`) ; `HK/PK/CK/DK` et `unset` supprimés | `bell_ops_launcher_never_traces_nor_copies_a_secret` (nouveau) : `set -u` suivi de `{ set +x; }`, aucun `set -x` ni `set -o xtrace`, aucune affectation `="${…_API_KEY…}"`/`="${…_URL…}"`, forme en place épinglée pour les quatre ; preuve comportementale §10 | S04 (`set -x` après `set -u`) → tué (`'xtrace forced off right after set -u'`) ; S04b (copie `HK="${HELIUS_API_KEY:-}"` réintroduite) → tué (`'no secret copied into a variable'`) |
| **M1** | `--now` présent ⇒ `FAIL Q6-C00 clock override --now=<iso>: offline tests only, never a course control` (2ᵉ ligne de sortie) ; `--now` non fini ou sans valeur ⇒ exit 2 ; usage `:9-10` et RUNBOOK §8 bis « Never `--now` here » | test controls (`:150`, `:161-162`) ; test RUNBOOK | M1c (ligne FAIL C00 supprimée) → tué (`Expected values to be strictly equal`) ; M1n (garde exit 2 supprimée) → tué (`a non-finite --now is a usage error`) |
| **M2** | RUNBOOK §8 bis, commande 1 : `if (!process.env.DATABENTO_API_KEY) { console.log("no key"); process.exit(3); }` **avant** le `fetch` ; phrase « Run the second command only after the first printed `cost_usd=<n>` with n <= 1. » | `bell_runbook_dry_cross_cost_command_guards_the_key` (nouveau) : la commande est extraite du RUNBOOK et exécutée telle qu'écrite. Sans clé : `no key`, exit 3, aucune requête. Avec clé : `cost_usd=0.0042`, URL et Basic exacts | M2g (garde retirée) → tué (`no key => no request`) ; M2o (phrase d'ordre retirée) → tué (`'the billed command only after the cost is known'`) |
| **M3** | test du pré-vol : ni la clé ni `base64`/`hex` de `key` et de `key + ":"` dans stdout+stderr, sur tous les chemins ; `ok.err === ""` ; `denied.err === "cost pre-flight: HTTP 401\n"` exactement | `bell_ops_cost_preflight_prints_only_the_cost` | S02 (base64 sur stderr en erreur HTTP) → tué ; S03 (`auth=Basic <b64>` sur stderr au succès) → tué (tous deux `'no form of the key is printed'`) |
| **M4** | scan de formes : (a) `${VAR:-défaut}` remplacé par son **défaut**, `${VAR}`/`${#VAR}` par rien ; (b) **tous** les fichiers de `apps/bell/ops` (`readdirSync`) ; (c) formes réservées à ops : clé en query string, `Basic <b64>` ; témoins positifs construits à l'exécution | `bell_ops_scripts_carry_no_secret_shape` | S11 (query `&apiKey=`) → tué ; S14 (`Basic <b64>`) → tué ; S23 (clé `db-` en défaut de `${…:-}`) → tué (+ test B2) ; S24 (URL `?api-key=<uuid>` en défaut) → tué ; S16 (nouveau fichier ops avec clé) → tué ; **S12 (UUID nu) : survit, hors périmètre déclaré** (consigne : ne pas forcer) |
| **M5** | `JS_COST` : `let v; try { v = JSON.parse(await res.text()); } catch { console.error("cost pre-flight: not JSON"); process.exit(3); }` puis `Number(v)` (`launch-q6.sh:87-88`) | pré-vol : 200 + corps non-JSON ⇒ exit 3, stdout vide, stderr **exactement** `cost pre-flight: not JSON\n` | M5j (garde retirée) → tué (`a non-JSON body stops, no byte of it printed`) |
| **M6** | test C09 sur étiquette non nue : `journal.json` `faults=[{provider:"x.example",status:"HTTP 400"}]` ⇒ `^FAIL Q6-C09 non-bare fault labels=…` | test controls (`:200-201`) | S21 (FAIL → WARN) → tué |
| **M7** | `-u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL` remis (moindre privilège) ; en-tête du lanceur à jour | `bell_ops_launch_unsets_only_read_unneeded_vars` : retirées = (A-7 du RUNBOOK §12 − nécessaires) ∪ `BELL_HALTS_CSV` ; chacune lue par le collecteur ou payante ; les deux lues-inutiles épinglées | M7u (`-u CHAINSTACK_BSC_URL` retiré) → tué ; M9 (`-u DATABENTO_API_KEY` ajouté) → tué |
| **M8** | 1ʳᵉ ligne des contrôles : `INFO Q6-C00 exec-tree=<chemin> head=<sha\|unknown> worktree=<clean\|dirty (n entries)\|unknown>` (git local, `GIT_OPTIONAL_LOCKS=0`, information seule ; `unknown` sur un arbre sans `.git`) | test controls (`:149`) | M8i (ligne supprimée) → tué |
| **M9** | G1 : R-25 = 715 par la commande exacte de la gate au gel, 815 après pli (§8) ; I-1 tranché (§11) ; ce §12 | — | — |
