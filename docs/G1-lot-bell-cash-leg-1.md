# G1 — Lot BELL-CASH-LEG-1 (jambe cash réactivée, étiquettes génériques, outillage de course committé)

Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, effort max) — déclaré en tête de session (R-1).
Worktree `F:/Monark-wt-cashleg`, branche `lot/bell-cash-leg-1`. Base du lot `5ad3718c255a635e8a381308ff9adf0e760f005c` ; gel 1 (G2) `3bda2cad364fd151074de209c821fd0e4959cf7c` ;
gel 2 (checkpoint-2) `1d20f4d1abe310b1f746331660f34e88e25754a6` = pli de la G2 (§12) ; commits orchestrateur. Le pli du checkpoint-2 (§13) est posé **sur le gel 2, non committé** (R-20).
Cadre : `docs/adr/ADR-BELL-CASH-LEG-1.md` D1-D5 + **amendement checkpoint-1 C-1..C-12 (fait foi)** ; `ADR-T1aii` D1-quinquies (-b3b) ; `docs/RUNBOOK-bell.md` §9-12 ;
corrections de la G2 fraîche (deux lentilles, gel `3bda2ca`) B1, B2, M1-M9 ; corrections du checkpoint-2 (gel `1d20f4d`) C-V-1, C-V-3, C-V-4 et deux observations, puis décisions (a) et (b) de l'orchestrateur sur les deux relais (messages orchestrateur du 2026-09-24).
Hygiène : toute commande node/npm sous `env -u` des 8 clés + `TEMP/TMP/TMPDIR=F:/tmp` (A-7) ; aucun `env` affiché ; **aucun appel réseau** hormis
`npm ci` (registre npm, `--ignore-scripts`, cache `F:/tmp/npm-cache`) ; `docs/juriste/` non lu ; fichiers interdits (C-1) non touchés :
`scripts/sync-bell-served.mjs`, `apps/site/**`, `test/bell-served.test.ts` (vérifié par `git status`, 0 modification).

## 1. Journal de provenance (template du corpus)
| Date | PR/commit | Modèle | Effort | Contexte | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-24 | gel `3bda2ca` (commit orchestrateur, base `5ad3718`) | `claude-opus-5-5` | max | ADR-BELL-CASH-LEG-1 + C-1..C-12 ; mission orchestrateur | worker | G2 fraîche, deux lentilles (conformité ; sécurité) | approuvé avec corrections |
| 2026-09-24 | pli G2 sur `3bda2ca` = gel 2 `1d20f4d` (commit orchestrateur) | `claude-opus-5-5` | max | corrections G2 B1, B2, M1-M9 (message orchestrateur) | worker | orchestrateur (R-21), puis checkpoint-2 (validateur `claude-fable-5-1`) | checkpoint-2 : accepté avec corrections (C-V-1..C-V-4) |
| 2026-09-24 | pli checkpoint-2 sur `1d20f4d` (non committé) | `claude-opus-5-5` | max | C-V-1, C-V-3, C-V-4 + deux observations, puis décisions (a) et (b) sur les deux relais (messages orchestrateur) | worker | orchestrateur (R-21), gel 3, puis G7 | en attente |

## 2. Fichiers livrés (sha256 des octets du worktree, LF)
| Fichier | +/− (numstat vs `5ad3718`) | sha256 (après pli checkpoint-2) | au gel 2 `1d20f4d` | au gel 1 `3bda2ca` |
|---|---|---|---|---|
| `apps/bell/src/close.ts` | 19/8 | `4696c74300e4a463c1b34327e8319d7ae73f5eed0787d530d40d2370f3b1a64f` | identique | identique |
| `apps/bell/src/collect.ts` | 5/5 (toujours 883 lignes) | `4eb8271394a5eb6a7281b79690afbc2e050ab3ab701e0166c2f0dd76182ab829` | identique | identique |
| `apps/bell/scripts/bell-publish.mjs` (commentaire `:93-94` seul) | 2/2 | `462962e08c7939a42aeb8056bdbfb6201d6b49bef65295e90ae5673f3539ddc2` | identique | identique |
| `apps/bell/ops/launch-q6.sh` (nouveau) | 154/0 | `96a3f839570a747f60142db557f974dfee2c6397364dfc6bcfca704d41e0e451` | `76c8429e…` | `36382bc7…` |
| `apps/bell/ops/q6-controls.mjs` (nouveau) | 322/0 | `d38bce97b6f4ed10e36c5a4945995ba60648c7e12752a315ae96eb27a8e1953b` | identique | `214363bb…` |
| `apps/bell/test/bell-ops.test.ts` (nouveau) | 223/0 | `777c37bccebe0551c9e4c6877eb3d9bd945125ae8ec7f7fb3767ff762f83362b` | `901bb344…` | `293052e7…` |
| `apps/bell/test/close.test.ts` | 48/5 | `d7a8f2c69f0bddc406091f60f2691967a44c48015836a245036eab38314816bd` | identique | identique |
| `apps/bell/test/bell-served-e2e.test.ts` | 13/0 | `3012237e71d0df34b5dea23f898b22a46d8b1328c7eaae101d86f3276f71cdc8` | identique | identique |
| `apps/bell/test/bell-keys.test.ts` | 6/3 | `25ab6a2ac802ece1a0bc5fbf0fbbf231b76d97b0dc51f4c199d537ae1f7a59e8` | identique | identique |
| `apps/bell/test/helpers/bell-served.ts` | 8/5 | `0b906d66e6b3b7b74b711e557f9be208ea8c61425fffca23b8a568540a9c8c3f` | identique | identique |
| `apps/bell/test/bell-publish-validate.test.ts` | 3/2 | `e861461dd615b7b16a350c1551a73d4926ac08cfa597fb4ff15c88bb5a7058e2` | identique | identique |
| `test/bell-caddy.ts` | 1/1 | `15ec9d7249b21990fd74f1552d0e37f68a89ef8a8bf538c6177984cf43b87fd9` | identique | identique |
| `docs/RUNBOOK-bell.md` | 56/4 | `368119922fea3604f26e5bdad084f45d64411272c440968ddf0c35c7c6b8dde6` | `1481c216…` | `9d710c84…` |
| `docs/adr/ADR-BELL-CASH-LEG-1.md` (C-V-3 seul) | 2/0 | `2f4dfe5dabc75e3099b5cf8ece446d001a913ee77cedd22dba5c88428a3edb18` | `76677a14…` (= `5ad3718`) | `76677a14…` |

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
| C-9 + D5 | un seul lanceur paramétré `launch-q6.sh <MINT> <mode> --out <dir>` ; `--out` obligatoire ; STOP si `<out>/state.json` existe (garde placée **avant** toute autre) ; `env -u` de l'appel `node collect` (l.141, seul `env -u` du lanceur) = les 2 variables lues et non nécessaires (`CHAINSTACK_ETH_URL` `transport.ts:106`, jambe `--eth` seule ; `BELL_HALTS_CSV` `collect.ts:848`) **+ les 3 URL payantes jamais lues** (`CHAINSTACK_BASE_URL`, `CHAINSTACK_BSC_URL`, `CHAINSTACK_ROBINHOOD_URL` : moindre privilège, G2 M7) **+ les 3 diagnostics du runtime node** (`NODE_DEBUG`, `NODE_DEBUG_NATIVE`, `NODE_OPTIONS` : checkpoint-2 C-V-1, §13) ; ces trois et les deux commutateurs TLS (`NODE_TLS_REJECT_UNAUTHORIZED`, `NODE_EXTRA_CA_CERTS`) retirés aussi pour **tout** appel `node` du lanceur par la ligne `unset` (l.23, décisions (a) et (b) de l'orchestrateur, §13) ; xtrace forcé à off et aucune copie de secret (G2 B2) ; `q6-controls.mjs` committé ; `--out` obligatoire aussi côté contrôles | `apps/bell/ops/` | tests ops ; M9, M17, M18, M7u, S04, S04b, CV1a-CV1c, CV1m, UR1-UR3, UT1, UT2, UL, UMv, UX |
| C09 / C11 (C-4) | C09 : **aucune** faute portant une étiquette cash (FAIL sinon), toute étiquette non nue = FAIL (test ajouté, M6) ; drapeau `--expect-databento-401` supprimé ; C11 attend `no_close_ref` = sessions non encore publiables (compte de C14) | `q6-controls.mjs:165-177,228-234` | test controls ; M13, M14, S21 |
| C-10 | R-25 mesuré §8 | — | — |
| C-11 | aucun `journal.json`/log de course committé | — | `git status` |
| C-12 | RUNBOOK §8 bis « un jour croisé à blanc » (`get_cost` gratuit, gardé contre la clé vide, contre une erreur HTTP et contre un corps non-JSON (observation du checkpoint-2), puis `readReferenceCloses` sur UN jour **seulement après** `cost_usd=<n>` avec n <= 1 ; `{"cross":{"TSLA":{"2026-09-15":"matched"}},"faults":[]}` exigé, STOP sinon) + course + contrôles (jamais `--now` ; VWAP du WARN C15 masqués dans le dépôt) ; relabel manuel interdit (§10 + « Never ») | `RUNBOOK-bell.md:246-288` | `bell_runbook_dry_cross_cost_command_guards_the_key` (commande exécutée telle qu'écrite) ; `bell_runbook_never_prints_private_key` vert ; M2g, M2o, RBj, RBh |
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
déclencheur : le prochain lot collecteur qui touche le digest. Inscrit dans l'ADR (« Items formés ») au checkpoint-2 (C-V-3, §13).

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

## 7. Oracle (commandes de la mission, `env -u` des 8 clés, `TEMP=F:/tmp`) — rejoué complet après le pli (03:28-03:35 UTC), puis sur les fichiers finaux (03:56-04:06 UTC), mêmes résultats ; après le pli du checkpoint-2 : §13
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

## 8. R-25 (C-10) — jusqu'au gel 2 ; après le pli du checkpoint-2 : §13
Mesure sur un **index jetable** (`GIT_INDEX_FILE=F:/tmp/cashleg/w/r25b.index`, `read-tree HEAD` + `add -A` ; l'index réel n'est pas touché),
avec la pathspec exacte de la gate (`ci.yml`, qui exclut aussi `docs/**/*.md` et les séries Bell) :
`git diff --cached --shortstat 5ad3718 -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.json' ':(exclude,glob)fixtures/**/*.jsonl' ':(exclude,glob)fixtures/**/*.csv' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.json' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.jsonl' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.csv' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.json' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.jsonl' ':(exclude,glob)apps/bell/test/fixtures/series/**/*.csv'`
- **au gel `3bda2ca` : 715** (`12 files changed, 684 insertions(+), 31 deletions(-)`, valeur confirmée par la G2). Le 767 du premier G1 venait de
  la commande de la mission, qui compte `docs/RUNBOOK-bell.md`, un fichier hors gate (G2 M9).
- **après pli : 815** (`12 files changed, 784 insertions(+), 31 deletions(-)`) : +100, dont `bell-ops.test.ts` +88 net, `q6-controls.mjs` +10,
  `launch-q6.sh` +2. Le pli seul, du gel au worktree : `3 files changed, 153 insertions(+), 53 deletions(-)` hors docs. STOP 1 150 et CI 1 205
  non atteints. Pour mémoire, la commande de la mission (docs comptés) donne 869.

## 9. Mutants — campagne rejouée après le pli (44 : 43 tués, 1 survivant déclaré hors périmètre ; restauration à l'octet prouvée) — gel 2 ; campagne du checkpoint-2 (50 mutants) : §13
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
| lanceur → collect (checkpoint-2, C-V-3) | `apps/bell/ops/launch-q6.sh` (environnement opérateur + `Q6_*`) | `collect.ts` `runMain` → `<OUT>/state.json` et les trois autres artefacts | `F:/course-bell/q6/<MINT>/` + `F:/course-bell/logs/q6-<MINT>.log` | non exécutable hors ligne ; substitution mesurée au §13 (invocation l.142-151 identique octet pour octet à seq 1, 16 drapeaux présents dans `collect.ts`) ; préfixe épinglé et pré-vol exécuté par `bell-ops.test.ts` ; **I-3** premier DRYRUN, déclencheur : course seq 2 |
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
- **Observations de la G2, relayées au gel 2, pliées au checkpoint-2** : (a) la fuite `NODE_DEBUG` (brouillon sécurité C9) → C-V-1,
  §13 ; (b) la limite de jointure du §5 → item BELL-GAP-ANCHOR-1 inscrit dans l'ADR (C-V-3, §13).
- **Incident d'outillage (sans effet sur les livrables)** : le dossier scratchpad de la session est partagé avec d'autres agents. Un
  `rep.mjs` homonyme y a remplacé le mien pendant le lot. Les deux éditions qu'il a faites (textes C04/C12 de `q6-controls.mjs`) ont été
  relues par `grep`. Tout le reste du travail, pli compris, a eu lieu dans `F:/tmp/cashleg/w/`.
- **Ligne INFO de l'arbre d'exécution (M8)** : information seule. Sur un arbre sans `.git` (copie `git archive`, méthode des relecteurs),
  elle vaut `head=unknown worktree=unknown` (observé sur `F:/tmp/g2cashleg`, lecture seule) ; le test l'admet.
- **Source unique de la liste A-7** : `bell_ops_launch_unsets_only_read_unneeded_vars` lit la liste des variables payantes dans la
  commande du RUNBOOK §12 (`env -u … sh -c`). C'est voulu ; un reformatage de cette ligne fait rougir le test ops, et le RUNBOOK §12 le
  dit désormais (C-V-4, §13).
- Items de l'ADR non touchés, restés formés : BELL-SITE-SEQ2-1 (lot vitrine), BELL-VERIFY-SCHEDULE-1, LIC-DBN-1, ESC-1-REWRITE.

## 12. G2 pliée (G2 fraîche, deux lentilles, gel `3bda2ca`) — toutes les corrections traitées
Chaque ligne : ce qui est fait, le test qui rougit sous le mutant nommé, le résultat de la campagne (§9, restauration à l'octet prouvée).
Les mutants S** reprennent **verbatim** les définitions du relecteur sécurité (`F:/tmp/g2sec-cashleg-w/mk-mutants.mjs`, `mutants-s23.json`).
Les MQ** sont redéfinis ici sur les lignes citées par la G2 (le relecteur conformité n'a pas archivé leurs définitions).
| Point | Fait | Test | Mutants → résultat |
|---|---|---|---|
| **B1** (conformité) | 4 variantes JSON-mutées du run `good` après le cas `broken` : (a) session remplie → `cash_cross_mismatch` (gT, exceed*, `earliest_publish_utc`, `multiplierUsed`, `rebase_residuals` retirés, `residuals.cash_cross_mismatch=1`) ; (b) `cash_cross:"unavailable"` + `residuals.cash_cross_unavailable=1` ; (c) `earliest_publish_utc+1` ; (d) `gT` numérique | `bell_ops_controls_c14_c09_c11_c15_on_runmain_outputs` (`bell-ops.test.ts:183-198`) | MQ1 `:215` branche STOP inerte → tué (`/…STOP cash_cross_mismatch on weekend\|2026-09-18 \(ref 2026-09-18\): investigate/`) ; MQ2 `:218` test de type `gT` retiré → tué (`/gT=number/`) ; MQ3 `:218` égalité `earliest_publish_utc` retirée → tué (`/earliest_publish_utc=\d+ \(expected \d+\)/`) ; MQ4 `:215` + `:223` (mismatch cohérent accepté) → tué ; MQ5 `:219` test `matched` retiré → tué (`/cash_cross=unavailable \(expected matched/`) ; MQ6 `:223` résiduel `unavailable` retiré → tué (`/residuals cash_cross_mismatch=0 cash_cross_unavailable=1 \(expected 0\)/`) ; MQ7 `:223` résiduel `mismatch` retiré → tué (`/residuals cash_cross_mismatch=1 cash_cross_unavailable=0 \(expected 0\)/`, assertion ajoutée à (a)) |
| **B2** (sécurité) | `{ set +x; } 2>/dev/null` juste après `set -u` (`launch-q6.sh:21-22` depuis les décisions (a)/(b) du §13 ; `:22-23` au gel 2) ; longueurs prises **sans copie** : `[ -n "${V+x}" ] && [ "${#V}" -eq N ]` pour les quatre variables, message de longueur paresseux `${V+${#V}}` (`:112-116`) ; `HK/PK/CK/DK` et `unset` supprimés | `bell_ops_launcher_never_traces_nor_copies_a_secret` (nouveau) : `set -u` suivi de `{ set +x; }`, aucun `set -x` ni `set -o xtrace`, aucune affectation `="${…_API_KEY…}"`/`="${…_URL…}"`, forme en place épinglée pour les quatre ; preuve comportementale §10 | S04 (`set -x` après `set -u`) → tué (`'xtrace forced off right after set -u'`) ; S04b (copie `HK="${HELIUS_API_KEY:-}"` réintroduite) → tué (`'no secret copied into a variable'`) |
| **M1** | `--now` présent ⇒ `FAIL Q6-C00 clock override --now=<iso>: offline tests only, never a course control` (2ᵉ ligne de sortie) ; `--now` non fini ou sans valeur ⇒ exit 2 ; usage `:9-10` et RUNBOOK §8 bis « Never `--now` here » | test controls (`:150`, `:161-162`) ; test RUNBOOK | M1c (ligne FAIL C00 supprimée) → tué (`Expected values to be strictly equal`) ; M1n (garde exit 2 supprimée) → tué (`a non-finite --now is a usage error`) |
| **M2** | RUNBOOK §8 bis, commande 1 : `if (!process.env.DATABENTO_API_KEY) { console.log("no key"); process.exit(3); }` **avant** le `fetch` ; phrase « Run the second command only after the first printed `cost_usd=<n>` with n <= 1. » | `bell_runbook_dry_cross_cost_command_guards_the_key` (nouveau) : la commande est extraite du RUNBOOK et exécutée telle qu'écrite. Sans clé : `no key`, exit 3, aucune requête. Avec clé : `cost_usd=0.0042`, URL et Basic exacts | M2g (garde retirée) → tué (`no key => no request`) ; M2o (phrase d'ordre retirée) → tué (`'the billed command only after the cost is known'`) |
| **M3** | test du pré-vol : ni la clé ni `base64`/`hex` de `key` et de `key + ":"` dans stdout+stderr, sur tous les chemins ; `ok.err === ""` ; `denied.err === "cost pre-flight: HTTP 401\n"` exactement | `bell_ops_cost_preflight_prints_only_the_cost` | S02 (base64 sur stderr en erreur HTTP) → tué ; S03 (`auth=Basic <b64>` sur stderr au succès) → tué (tous deux `'no form of the key is printed'`) |
| **M4** | scan de formes : (a) `${VAR:-défaut}` remplacé par son **défaut**, `${VAR}`/`${#VAR}` par rien ; (b) **tous** les fichiers de `apps/bell/ops` (`readdirSync`) ; (c) formes réservées à ops : clé en query string, `Basic <b64>` ; témoins positifs construits à l'exécution | `bell_ops_scripts_carry_no_secret_shape` | S11 (query `&apiKey=`) → tué ; S14 (`Basic <b64>`) → tué ; S23 (clé `db-` en défaut de `${…:-}`) → tué (+ test B2) ; S24 (URL `?api-key=<uuid>` en défaut) → tué ; S16 (nouveau fichier ops avec clé) → tué ; **S12 (UUID nu) : survit, hors périmètre déclaré** (consigne : ne pas forcer) |
| **M5** | `JS_COST` : `let v; try { v = JSON.parse(await res.text()); } catch { console.error("cost pre-flight: not JSON"); process.exit(3); }` puis `Number(v)` (`launch-q6.sh:87-88`) | pré-vol : 200 + corps non-JSON ⇒ exit 3, stdout vide, stderr **exactement** `cost pre-flight: not JSON\n` | M5j (garde retirée) → tué (`a non-JSON body stops, no byte of it printed`) |
| **M6** | test C09 sur étiquette non nue : `journal.json` `faults=[{provider:"x.example",status:"HTTP 400"}]` ⇒ `^FAIL Q6-C09 non-bare fault labels=…` | test controls (`:200-201`) | S21 (FAIL → WARN) → tué |
| **M7** | `-u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL` remis (moindre privilège) ; en-tête du lanceur à jour (règle étendue aux diagnostics du runtime au checkpoint-2, §13) | `bell_ops_launch_unsets_only_read_unneeded_vars` : retirées = (A-7 du RUNBOOK §12 − nécessaires) ∪ `BELL_HALTS_CSV` ; chacune lue par le collecteur ou payante ; les deux lues-inutiles épinglées | M7u (`-u CHAINSTACK_BSC_URL` retiré) → tué ; M9 (`-u DATABENTO_API_KEY` ajouté) → tué |
| **M8** | 1ʳᵉ ligne des contrôles : `INFO Q6-C00 exec-tree=<chemin> head=<sha\|unknown> worktree=<clean\|dirty (n entries)\|unknown>` (git local, `GIT_OPTIONAL_LOCKS=0`, information seule ; `unknown` sur un arbre sans `.git`) | test controls (`:149`) | M8i (ligne supprimée) → tué |
| **M9** | G1 : R-25 = 715 par la commande exacte de la gate au gel, 815 après pli (§8) ; I-1 tranché (§11) ; ce §12 | — | — |

## 13. Checkpoint-2 plié (validateur `claude-fable-5-1`, gel 2 `1d20f4d`, ACCEPTE-AVEC-CORRECTIONS)
Rapport lu en entier avant tout édit : `F:/tmp/cashleg/cp2/CP2-report.md` (sha256 `a190614aa7ad12e9c2cc91ad8450606f1088326b4e26244d99e288e513f9da09`).
Liste fermée de l'orchestrateur : C-V-1, C-V-3, C-V-4 et les deux observations non bloquantes (coût nul) ; puis ses décisions sur les deux
relais (a) et (b), pliées sur le même arbre (fin du §13). **C-V-2** (les deux rapports G2
archivés hors dépôt avec sha au JOURNAL/G7 ; `error_origin` de l'incident scratchpad et de la fuite `NODE_DEBUG`) appartient à
l'orchestrateur au G7 : non touché ici. Hygiène inchangée (préfixe `env -u` des 8 clés, `TEMP=F:/tmp`, jamais `env` nu) ; aucun appel
réseau (la preuve C-V-1 n'utilise que la boucle locale 127.0.0.1). Scratch du pli : `F:/tmp/cashleg/w/cp2fold/`.

| Point | Fait | Test | Mutants → résultat |
|---|---|---|---|
| **C-V-1** (bloquante) | `launch-q6.sh:141` : `-u NODE_DEBUG -u NODE_DEBUG_NATIVE -u NODE_OPTIONS` ajoutés au préfixe `env` de l'appel `node collect`, **sur la même ligne** : l.142-151 inchangées (identiques au gel 2 et à seq 1, voir plus bas). En-tête l.14-18 réécrit **à nombre de lignes constant** (le fichier garde 154 lignes : toute référence de ligne du G1 et du rapport CP2 reste valide ; aux décisions (a)/(b), l'en-tête passe à 4 lignes, l.14-17, pour absorber la ligne `unset` l.23 : toujours 154 lignes, toute ligne ≥ 24 garde son numéro), sans motif `-u NOM` (le test lit tout le fichier) | `bell_ops_launch_unsets_only_read_unneeded_vars` réécrit : le préfixe est lu juste avant `node apps/bell/src/collect.ts` ; tout `-u` du lanceur doit être sur cet appel ; trois catégories fermées : lues et inutiles, payantes et jamais lues (liste A-7 du RUNBOOK §12), diagnostics du runtime (`RUNTIME` = `NODE_DEBUG`, `NODE_DEBUG_NATIVE`, `NODE_OPTIONS`) ; chaque variable `RUNTIME` retirée, non lue par le collecteur, non payante (message nommé par variable) | CV1a, CV1b, CV1c (retrait de l'une des trois) → tués (`CP2 C-V-1: <VAR> is removed from the collector's environment`) ; CV1m (`-u NODE_DEBUG` déplacé sur l'appel du pré-vol) → tué (`every removal sits on the collector call`) ; M9 (`-u DATABENTO_API_KEY` réintroduit) et M7u → tués (`removed = paid and unneeded + read and unneeded + runtime diagnostics`) |
| **C-V-3** | ADR : première ligne de la table des tuyaux « lanceur → collect » (entrée : environnement opérateur + `Q6_*` ; sortie : `<OUT>/state.json` et les trois autres artefacts ; état : `F:/course-bell/q6/<MINT>/` + log ; preuve : substitution octet pour octet + 16 drapeaux + I-3, déclencheur course seq 2) ; puce **BELL-GAP-ANCHOR-1** dans « Items formés » (propriétaire orchestrateur, déclencheur : le prochain lot collecteur qui touche le digest). Même ligne de tuyau au §10 bis | lecture (docs, hors gate) | — |
| **C-V-4** | RUNBOOK §12 : phrase **après** le bloc de code, sans le motif `env -u NOM … sh -c` (le test prend la première occurrence) : `bell-ops.test.ts` lit cette commande comme source unique de la liste A-7, la reformater rougit le test | lecture (docs) | — |
| **Obs. 1** (commande 1 du §8 bis) | même garde que M5 : `if (!r.ok)` imprime `HTTP <status>` et sort en 3 ; `JSON.parse` sous `try`, sinon `not JSON` et sortie 3 ; aucune apostrophe (la commande vit entre apostrophes bash) ; prose « Expected » : `HTTP <status>` ou `not JSON` = STOP. **Écart déclaré** : une erreur HTTP sortait en 0 avec le même texte ; elle sort maintenant en 3 | `bell_runbook_dry_cross_cost_command_guards_the_key` : 401 ⇒ stdout `HTTP 401` seul, sortie 3 ; corps non-JSON ⇒ stdout `not JSON` seul, sortie 3 ; stderr vide sur les quatre chemins | RBj (garde JSON retirée) → tué (`a non-JSON body stops, no byte of it printed`) ; RBh (garde HTTP retirée) → tué (`an HTTP error stops with its status only`) |
| **Obs. 2** (WARN C15) | RUNBOOK §8 bis : la ligne imprime les VWAP de seq 1 et de seq 2 (`seq1=`, `seq2=`) ; elle n'est jamais collée telle quelle dans un document du dépôt (JOURNAL compris) : chaque VWAP prend le jeton `[masqué]`. `q6-controls.mjs` inchangé (sha identique au gel 2) : la note vit là où la ligne D-n est écrite | lecture (docs) | — |

**Preuve à l'exécution C-V-1, rejouée après le pli.** Harnais `F:/tmp/cashleg/w/cp2fold/nodedebug-proof.mjs` (sha256
`85e97bb02a64831fc7b5f96afcc8ed439fa9d0a68aed4252887c732b01c93924`), sonde `nd-probe.mjs` (`67f31bdb9b50cf52880cf36ce2c5817e52a37373c791141012fe604770c01a6d`),
préchargement `nd-inject.cjs` (`5d2c9affb663a91aeda37f7a7fcbcd051ba77233eeeb8977c1e51f041e467dfc`), sortie `nodedebug-proof.out`
(`fb4b7a09b9618e2d73dde52f7a2c4ffafd9551bf49ae2d1bd0559e327ff07bef`). Le script exécuté est construit avec les **vraies lignes** du lanceur,
au gel 2 (`git show 1d20f4d:`) et après pli : la ligne `env -u …` de l'appel `node collect` (l.141), la sonde à la place de
`node apps/bell/src/collect.ts …`, la vraie redirection `>> "$LOG" 2>&1` (l.151). La sonde fait deux requêtes sur 127.0.0.1 avec des
identifiants **synthétiques** aux deux formes du collecteur (clé Helius en `?api-key=`, `transport.ts:97` ; identifiant Chainstack dans le
chemin de `CHAINSTACK_SOLANA_URL`) et un en-tête `Authorization` synthétique (forme Databento et Polygon, `close.ts:199,214`), puis
imprime lesquelles des trois variables l'ont atteinte (noms seuls). Occurrences comptées dans `$LOG` :

| Variable posée | gel 2 : Helius en URL / Chainstack en URL / en-tête / code injecté | après pli : les quatre | variable vue par la sonde (gel 2 → pli) |
|---|---|---|---|
| aucune | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | — |
| `NODE_DEBUG=fetch` | **3 / 3** / 0 / 0 | 0 / 0 / 0 / 0 | set → unset |
| `NODE_DEBUG=undici` | **3 / 3** / 0 / 0 | 0 / 0 / 0 / 0 | set → unset |
| `NODE_DEBUG_NATIVE=INSPECTOR_SERVER` | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 | set → unset |
| `NODE_OPTIONS=--require nd-inject.cjs` | 1 / 0 / 0 / **1** (le code injecté imprime la clé Helius qu'il voit) | 0 / 0 / 0 / 0 | set → unset |

Le gel 2 reproduit la mesure du checkpoint (3 occurrences par URL, avec `fetch` comme avec `undici`) ; après pli, 0 partout. Un identifiant
porté par un en-tête n'est pas imprimé par `NODE_DEBUG` (0 dans les deux états). Sources des catégories : `node --help` (v24.15.0) [lu],
`NODE_DEBUG` « ','-separated list of core modules that should print debug information », `NODE_DEBUG_NATIVE` « ','-separated list of
C++ core debug categories that should print debug output » ; `NODE_OPTIONS` n'y figure pas : son effet (préchargement de code) est
mesuré ci-dessus. Dans l'environnement du worker, les trois variables sont absentes (test posé ou non, aucune valeur lue) : le pli ne
change rien à une course dont l'environnement ne les pose pas.

**Tuyau lanceur → collect (C-V-3), substitution mesurée.** `cmp` : `launch-q6.sh:142-151` après pli = `launch-q6-fast-TSLAx.sh:128-137`
= `launch-q6-fast-AAPLx.sh:128-137` = `launch-q6-fast-SPYx.sh:128-137` (scripts de seq 1, `F:/tmp/q6course/`, sha256 `e75665a5…e758`,
`8180c06f…1f76`, `e6f0bd2f…72e8`) = gel 2 ; extrait `lot-142-151.txt` sha256 `f9cc3bfe0c3605eab99f814654185e80c62de0a288e4613ddefda11eb63f2d53`.
Les 16 drapeaux de l'invocation (`--pools` à `--out`) existent chacun comme littéral entre guillemets dans `collect.ts` (`grep -c` ≥ 1).

**Relais (a) et (b) : décisions de l'orchestrateur, pliées sur le même arbre.** (a) OUI : `unset NODE_DEBUG NODE_DEBUG_NATIVE NODE_OPTIONS`
juste après `set -u`, pour que les autres appels `node` du lanceur ne puissent pas charger de module par `NODE_OPTIONS`, en gardant les `-u`
de l'appel `collect` (double barrière, test toujours ancré sur `collect`). (b) OUI : `NODE_TLS_REJECT_UNAUTHORIZED` et `NODE_EXTRA_CA_CERTS`
dans le même `unset` et dans une catégorie fermée `TLS` du test (message par variable, mutant de retrait rouge).
- **Fait.** `launch-q6.sh:23` = `unset NODE_DEBUG NODE_DEBUG_NATIVE NODE_OPTIONS NODE_TLS_REJECT_UNAUTHORIZED NODE_EXTRA_CA_CERTS`, la ligne
  qui suit `{ set +x; } 2>/dev/null` : « juste après `set -u` » au sens du prologue, avant le premier appel `node` (l.109). La ligne n'est pas
  entre les deux, parce que B2 épingle `set -u` immédiatement suivi de `{ set +x; }` (test et mutant S04). L'appel `collect` (l.141) garde
  ses trois `-u`.
- **Écart déclaré** à « en-tête à nombre de lignes constant » : l'en-tête passe de 5 à 4 lignes (l.14-17, de 155 à 173 caractères ; le
  fichier a déjà une ligne de 297) pour absorber la ligne `unset`. Le fichier garde 154 lignes et **toute ligne ≥ 24 garde son numéro**
  (comparaison ligne à ligne avec l'état d'avant ce pli : 132 lignes identiques au même numéro, 0 différente). Les références du G1, de
  l'ADR (`launch-q6.sh:142-151`, l.141) et du rapport CP2 (l.109, l.141, l.151…) restent donc valides. Seules `set -u` et `{ set +x; }`
  remontent d'une ligne (l.21-22 ; la ligne B2 du §12 est corrigée). Garder 5 lignes d'en-tête aurait décalé toutes les lignes ≥ 24.
- **Test.** `bell_ops_launch_unsets_only_read_unneeded_vars` : la ligne qui suit `{ set +x; } 2>/dev/null` doit être l'`unset` (regex
  ancrée, liste de mots séparés par une espace, sans retour arrière ambigu) ; une seule ligne `unset` dans le lanceur ; chaque variable
  `RUNTIME` et chaque variable `TLS` (`NODE_EXTRA_CA_CERTS`, `NODE_TLS_REJECT_UNAUTHORIZED`, catégorie fermée) y figure, avec un message par
  variable ; les `TLS` ne sont ni lues par le collecteur, ni payantes, ni sur le préfixe de `collect` ; la ligne vaut `RUNTIME` ∪ `TLS`, rien
  d'autre (jamais un identifiant). Les assertions sur le préfixe de `collect` sont inchangées (double barrière). Sources : `node --help`
  (v24.15.0) [lu], `NODE_TLS_REJECT_UNAUTHORIZED` « set to 0 to disable TLS certificate validation », `NODE_EXTRA_CA_CERTS` « path to
  additional CA certificates file ».
- **Mutants de ce pli, tous tués** : UR1, UR2, UR3 (retrait d'une variable `RUNTIME` de l'`unset`) → `CP2 decision (a): <VAR> is unset for
  every node call of the launcher` ; UT1, UT2 (retrait d'une variable `TLS`) → `CP2 decision (b): <VAR> (TLS switch) is unset for every node
  call of the launcher` ; UL (ligne supprimée) et UMv (ligne déplacée après le contrôle de version l.109, donc après un appel `node`) →
  `the line right after the xtrace-off line is the unset, before any node call` ; UX (`HELIUS_API_KEY` ajouté à l'`unset` : la course
  perdrait sa clé) → `the unset line = runtime diagnostics + TLS switches, nothing else (never a credential)`.
- **Preuve à l'exécution.** Harnais `F:/tmp/cashleg/w/cp2fold/prologue-proof.mjs` (sha256
  `59a238d150f56a34a75abcf0b266e3b1cf8e17176fca7e427e3de2521438a95b`), sonde `nd-probe5.mjs` (`b8a35155a6549fde6c16a98f3401f1701990e72f847f033ca86b0b6bd4f2f263`),
  préchargement `nd-inject-mark.cjs` (`7574098e7489e22126892ef2cd919db26a6ad451f3d6d51e179371440f9b2739`), sortie `prologue-proof.out`
  (`c9e1524db085d26bb10e9eff1a6c71aed390f944a69f25a1c48c71e2e01201f9`). Le script est construit avec les vraies lignes du lanceur (gel 2
  puis pli) : le prologue, `stop()`, le vrai contrôle de version (l.109), puis un appel `node` sans préfixe (la sonde, comme `JS_TRAJ` et
  `JS_COST`). Les cinq variables sont posées dans l'environnement parent avec une clé Databento **synthétique** ; aucun appel réseau.
  | État | processus `node` où `NODE_OPTIONS` a injecté du code | la clé vue par ce code | variables vues par l'appel sans préfixe |
  |---|---|---|---|
  | gel 2 `1d20f4d` | **2** (le contrôle de version et la sonde) | 2 | les cinq posées |
  | après pli | 0 | 0 | les cinq absentes |
  La preuve C-V-1 (appel `collect`), rejouée après ce pli, redonne `nodedebug-proof.out` à l'identique (`cmp`) : la ligne 141 n'a pas changé.
  La preuve B2 du §10 (`xtrace-proof.mjs`), rejouée sur le lanceur final, redonne `xtrace-proof.out` à l'identique (`cmp`, sha256
  `d9c01a48…31ef6`) : aucune clé dans la trace sous `bash -x`, le prologue modifié n'y change rien.
- **Conséquence déclarée.** Sans `NODE_EXTRA_CA_CERTS`, un environnement opérateur qui compterait sur une autorité de certification ajoutée
  (proxy d'entreprise) verrait ses appels TLS échouer, sans jamais passer en silence : le `fetch` du pré-vol rejette et le lanceur s'arrête
  (`|| stop "cost pre-flight refused …"`, l.126), et le collecteur enregistre des fautes, visibles à Q6-C09 (lecture du code, non exécuté).
  De même, un `NODE_OPTIONS` que l'opérateur poserait pour autre chose (par exemple `--max-old-space-size`) est perdu par les cinq appels
  `node` du lanceur (l.109, 111, 125, 126, 142) : un manque de mémoire de la course tuerait le processus, avec un code de sortie non nul écrit
  dans `$LOG` (l.152-153 : `exit=$RC`), jamais en silence. Les cinq variables sont absentes de l'environnement du worker (test posé ou non,
  aucune valeur lue) : rien ne change pour une course dont l'environnement ne les pose pas. L'en-tête cite sa ligne (`line 23`) : une
  édition future du prologue doit la tenir à jour (le test, lui, ancre la ligne par son contenu, pas par son numéro).

**Oracle final** (commandes du §7, préfixe `env -u` des 8 clés, 2026-09-24 05:41-05:48 UTC, fichiers finaux, journaux
`F:/tmp/cashleg/w/cp2fold/s-*.log`) : typecheck 0, lint 0, lint:ratchet 0 (69/69, plafond intact), gate:vocab 0 (254 fichiers), lang:gate 0,
export:check 0 ; tests du lot **333 tests, 333 pass, 0 fail, 0 skip** (`s-tests.log` sha256
`e2f34cdb40538f85d45444318829ac18fa8faf8a2a82d5152fc852553aaf79c7` ; même nombre de tests : les cas nouveaux sont des assertions dans les
tests existants) ; les 8 fichiers hors mission du §7 : 28 / 28, 0 skip (`s-extra.log` `f76003c38d0d054f6525b41784780b710b5ca93bc6806333e9c0ebc6c54ed426`).
Passage intermédiaire, après C-V-1..C-V-4 et avant les décisions (a) et (b) : mêmes résultats (`k-*.log`, `k-tests.log`
`c7431f3afae5a6d298c3885d4964ddb82ad4e1102e6d5243fbb7541b924bf7df`).

**Mutants, campagne complète rejouée sur les fichiers finaux.** Harnais `F:/tmp/cashleg/w/cp2fold/mutants4.mjs` (sha256
`92ac020e2c704cd11ad4f99fbf6f5fc297c0ce84723446c6ac17659f4a7dd77e`) = celui du §9 (M9 fait désormais son remplacement après `-u NODE_OPTIONS`,
fin du préfixe de `collect`) + les 6 mutants de C-V-1 et des observations (CV1a, CV1b, CV1c, CV1m, RBj, RBh) + les 8 des décisions (a) et
(b) (UR1-UR3, UT1, UT2, UL, UMv, UX) ; résultat `mutants4-result.json` (`adb9537622756248ba5847e355089f792849889b5228d450c9747b494fc3ab41`).
**58 : 57 tués, S12 survivant déclaré** (hors périmètre, comme au §9), attendus 58/58, restauration à l'octet 58/58, 0 erreur
d'application ; manifeste (lanceur, test, RUNBOOK, ADR, `close.ts`, `collect.ts`, `q6-controls.mjs`) identique avant et après la campagne
(`diff` vide) ; `apps/bell/ops` revenu à ses deux fichiers. Campagne intermédiaire, avant les décisions : `mutants3.mjs` (`beb872ad…5f08`),
50 mutants, 49 tués, S12 survivant (`mutants3-result.json` `31b11537…5fe`). Après la première campagne, seule la ligne de tuyau de l'ADR a
changé de libellé (« préfixe épinglé, pré-vol exécuté ») : fichier de docs, lu par aucun test ni mutant ; sha final au §2.

**R-25.** Pathspec lue dans `ci.yml:65` (les 14 exclusions du §8), index jetable : **835** contre `5ad3718`
(`12 files changed, 804 insertions(+), 31 deletions(-)`), 815 au gel 2, 826 au passage intermédiaire. Pli complet, `1d20f4d` → worktree :
`2 files changed, 39 insertions(+), 19 deletions(-)` (lanceur 6/6, test 33/13 ; RUNBOOK 10/4 et ADR 2/0 hors gate). Les +20 viennent du test
(203 → 223 lignes) ; le lanceur garde ses 154 lignes. Au-dessus du « +5 à +10 » estimé par le checkpoint pour C-V-1 seul : les cas nouveaux
de la commande 1 du RUNBOOK et les décisions (a)/(b). Sous STOP 1 150 et CI 1 205.

**Incident d'outillage du pli (sans effet sur les livrables, pour l'`error_origin` du G7).** Les heredocs de l'outil Bash du worker
arrivent avec leurs barres obliques inverses doublées réduites à une seule. Deux lignes du test inséré en ont été touchées : la regex de
l'appel `node collect` et la ligne `reads`. Le premier passage du test ops a rougi (« the env prefix of the collector call is found »,
puis « CHAINSTACK_SOLANA_URL: read by the collector and needed by the course »). Les deux lignes ont été réparées par des scripts qui
construisent le caractère par son code (92), et la ligne `reads` est prouvée identique octet pour octet au gel 2 (`cmp`). Ensuite, tout texte
portant ce caractère est écrit par l'outil Write (qui le transmet tel quel) ou construit par son code, et les lignes sensibles du test
sont recomptées (7, 4 et 6 barres obliques inverses : regex de l'appel `collect`, ligne `reads`, regex de l'`unset`). L'oracle et les
campagnes de mutants ont tourné après la réparation.
