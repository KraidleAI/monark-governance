# G1 — Lot BELL-CASH-LEG-1 (jambe cash réactivée, étiquettes génériques, outillage de course committé)

Modèle résolu : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, effort max) — déclaré en tête de session (R-1).
Worktree `F:/Monark-wt-cashleg`, branche `lot/bell-cash-leg-1`, HEAD `5ad3718c255a635e8a381308ff9adf0e760f005c` (inchangé : aucun commit, R-20).
Cadre : `docs/adr/ADR-BELL-CASH-LEG-1.md` D1-D5 + **amendement checkpoint-1 C-1..C-12 (fait foi)** ; `ADR-T1aii` D1-quinquies (-b3b) ; `docs/RUNBOOK-bell.md` §9-12.
Hygiène : toute commande node/npm sous `env -u` des 8 clés + `TEMP/TMP/TMPDIR=F:/tmp` (A-7) ; aucun `env` affiché ; **aucun appel réseau** hormis
`npm ci` (registre npm, `--ignore-scripts`, cache `F:/tmp/npm-cache`) ; `docs/juriste/` non lu ; fichiers interdits (C-1) non touchés :
`scripts/sync-bell-served.mjs`, `apps/site/**`, `test/bell-served.test.ts` (vérifié par `git status`, 0 modification).

## 1. Journal de provenance (template du corpus)
| Date | PR/commit | Modèle | Effort | Contexte | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-24 | (non committé, worktree ci-dessus, base `5ad3718`) | `claude-opus-5-5` | max | ADR-BELL-CASH-LEG-1 + C-1..C-12 ; mission orchestrateur | worker | G2 fraîche puis orchestrateur (R-21) | en attente |

## 2. Fichiers livrés (sha256 des octets du worktree, LF)
| Fichier | +/− (numstat vs `5ad3718`) | sha256 |
|---|---|---|
| `apps/bell/src/close.ts` | 19/8 | `4696c74300e4a463c1b34327e8319d7ae73f5eed0787d530d40d2370f3b1a64f` |
| `apps/bell/src/collect.ts` | 5/5 (nombre de lignes inchangé : 883) | `4eb8271394a5eb6a7281b79690afbc2e050ab3ab701e0166c2f0dd76182ab829` |
| `apps/bell/scripts/bell-publish.mjs` (commentaire `:93-94` seul) | 2/2 | `462962e08c7939a42aeb8056bdbfb6201d6b49bef65295e90ae5673f3539ddc2` |
| `apps/bell/ops/launch-q6.sh` (nouveau) | 152/0 | `36382bc7b38105012ac38ce8fd800b1056af3f0da144654cead5665c98dceda4` |
| `apps/bell/ops/q6-controls.mjs` (nouveau) | 312/0 | `214363bbe8d38f3d92b20146883f3fcb57d7857e064c5baf89596330462ae382` |
| `apps/bell/test/bell-ops.test.ts` (nouveau) | 115/0 | `293052e774723c5e6f899dc0f6aef412f6a32bc484000e34985bd249a29e4cb4` |
| `apps/bell/test/close.test.ts` | 48/5 | `d7a8f2c69f0bddc406091f60f2691967a44c48015836a245036eab38314816bd` |
| `apps/bell/test/bell-served-e2e.test.ts` | 13/0 | `3012237e71d0df34b5dea23f898b22a46d8b1328c7eaae101d86f3276f71cdc8` |
| `apps/bell/test/bell-keys.test.ts` | 6/3 | `25ab6a2ac802ece1a0bc5fbf0fbbf231b76d97b0dc51f4c199d537ae1f7a59e8` |
| `apps/bell/test/helpers/bell-served.ts` | 8/5 | `0b906d66e6b3b7b74b711e557f9be208ea8c61425fffca23b8a568540a9c8c3f` |
| `apps/bell/test/bell-publish-validate.test.ts` | 3/2 | `e861461dd615b7b16a350c1551a73d4926ac08cfa597fb4ff15c88bb5a7058e2` |
| `test/bell-caddy.ts` | 1/1 | `15ec9d7249b21990fd74f1552d0e37f68a89ef8a8bf538c6177984cf43b87fd9` |
| `docs/RUNBOOK-bell.md` | 48/4 | `9d710c842df321e886e0b21ad217549ead1dd859918974a09bdc14c10c447be0` |

Correspondance des sites de `close.ts` (lignes de base → lignes livrées) : requête close `:159→:170`, faute transport `:162→:173`,
faute de forme `:167→:178`, requête de recoupement `:170→:181`, faute de recoupement `:173→:184` ; `collect.ts:435` inchangé de ligne.

## 3. Corrections et décisions (état)
| Item | Fait | Où | Preuve |
|---|---|---|---|
| D1 + C-4 (CASH-KEYLESS-SKIP-1) | clé Databento vide ⇒ **aucune requête** (`continue` avant tout `push`/appel), abstention `no_close_ref` sans faute, rien dans `cash_request_digest` ; commentaire `:41-42` corrigé (`:48-51` livrés) | `close.ts:164-166` | `bell_cash_keyless_emits_no_request` ; M1 |
| C-5 | `MASSIVE_API_KEY` n'est nommé nulle part ; la clé de recoupement lue est `POLYGON_API_KEY` (`readCashKeys`, inchangé) | `launch-q6.sh`, test | `bell_ops_launch_unsets_only_read_unneeded_vars` |
| D2 + C-3 + C-11 | `CASH_CLOSE_LABEL="cash-close"`, `CASH_CROSS_LABEL="cash-crosscheck"`, `ADV_BARS_LABEL="adv-bars"` exportés ; appliqués à `CashRequest.provider` et `TransportFault.provider` seulement ; `close_source`/`adv_source`/`CLOSE_SOURCE`/`ADV_SOURCE` **inchangés** ; pli (b) « faults ∈ providers » non fait (retiré par C-3) ; commentaire `bell-publish.mjs:93-94` réécrit sans nom de fournisseur | `close.ts:28-34,170-184`, `collect.ts:435` | `bell_cash_labels_are_generic` (M2b-M7) ; pin `bell_publish_bare_label_guard_pins_operator_vocabulary` étendu aux 3 étiquettes + refus des 2 hôtes de seq 1 (M8) |
| C-2 | E2E hors-ligne : `runMain` + `databentoGet` rejetant `HTTP 400` (clé synthétique posée) → `provenance.json` porte `{provider:"cash-close",status:"HTTP 400"}` → `publishToDir` **publie** ; servi = écrit | `bell-served-e2e.test.ts` | `bell_cash_fault_label_publishes_through_real_publisher` ; M2 ⇒ `bell/publish: url_or_key_shaped_string: $.runs[0].provenance.providers.faults[0].provider` |
| C-6 (C14, bloquant) | pour tout gap `no_close_ref` : FAIL si `earliestPublishUtc(refCloseDateOf(session, anchor)) <= now` (fonctions de l'arbre d'exécution) ; gaps remplis : `gT` string + `earliest_publish_utc` = celui recalculé + `cash_cross` `matched` ; `cash_cross_mismatch` ⇒ FAIL « STOP … investigate » ; `cash_cross_unavailable` ⇒ FAIL ; ancre = `session_date_et` de l'entrée volume jointe (voir §5) | `q6-controls.mjs:174-191` (jointure), `:193-216` (C14) | test controls ; M12, M16 |
| C-7 | pré-vol `metadata.get_cost` dans le lanceur, avant `node collect`, exécuté aussi en DRYRUN, n'imprime que `cost_usd=<n>`, exit 4 au-delà de 1 USD ⇒ STOP ; requête construite par `close.ts` (`DATABENTO_HIST`, `databentoCostPath`) sur tous les jours de référence atteignables par la fenêtre | `launch-q6.sh:72-88,124-125` | `bell_ops_cost_preflight_prints_only_the_cost` ; M10, M11 |
| C-8 (C15) | `--seq1-state` : par session (clé symbole/session/régime/ancre) `vwap`, `volumeBase`, `n` égaux à seq 1 sinon WARN chiffré (valeurs seq1/seq2 + delta) ; fenêtre différente ⇒ WARN « not comparable » | `q6-controls.mjs:289-310` | test controls ; M15 |
| C-9 + D5 | un seul lanceur paramétré `launch-q6.sh <MINT> <mode> --out <dir>` ; `--out` obligatoire ; STOP si `<out>/state.json` existe (garde placée **avant** toute autre) ; `env -u` réduit aux 2 variables lues et non nécessaires (`CHAINSTACK_ETH_URL` lue `transport.ts:106` sur la seule jambe `--eth`, `BELL_HALTS_CSV` lue `collect.ts:848`) ; `q6-controls.mjs` committé ; `--out` obligatoire aussi côté contrôles | `apps/bell/ops/` | tests ops ; M9, M17, M18 |
| C09 / C11 (C-4) | C09 : **aucune** faute portant une étiquette cash (FAIL sinon), toute étiquette non nue = FAIL ; drapeau `--expect-databento-401` supprimé ; C11 attend `no_close_ref` = sessions non encore publiables (compte de C14) | `q6-controls.mjs:155-167,218-224` | test controls ; M13, M14 |
| C-10 | R-25 mesuré §8 | — | — |
| C-11 | aucun `journal.json`/log de course committé | — | `git status` |
| C-12 | RUNBOOK §8 bis « un jour croisé à blanc » (`get_cost` gratuit puis `readReferenceCloses` sur UN jour, `{"cross":{"TSLA":{"2026-09-15":"matched"}},"faults":[]}` exigé, STOP sinon) + course + contrôles ; relabel manuel interdit (§10 + « Never ») | `RUNBOOK-bell.md` | lecture ; `bell_runbook_never_prints_private_key` vert |
| C-1 | tuyau 3 et D4 hors lot ; fichiers interdits intacts | — | `git status` |

## 4. Profil HTTP 400 de seq 1 (Q6-C09-DATABENTO-1) — expliqué, clos par le skip
- **[mesuré, hors ligne, rejouable]** avec une clé vide, le `databentoGet` par défaut (`close.ts:198-199` livrés) envoie
  `Authorization: Basic Og==` à `hist.databento.com` : `Og==` = base64(`":"`), soit un identifiant **vide** et un mot de passe vide.
  L'en-tête est donc **présent** : ce n'était pas « une requête sans Authorization » (formulation du §Contexte de l'ADR). Commande :
  `node --input-type=module -e 'globalThis.fetch = async (url, init) => { console.log(new URL(String(url)).host, init.headers.Authorization); return new Response("", { status: 400 }); }; const { databentoGet } = await import("./apps/bell/src/close.ts"); try { await databentoGet("/v0/x", ""); } catch (e) { console.log(e.message); }'`
  → `hist.databento.com Basic Og==` (le `HTTP 400` qui suit vient du bouchon, pas du serveur).
- **[lu, première main]** les trois journaux de seq 1 portent exactement une faute `{"provider":"databento.com","status":"HTTP 400"}` :
  `F:/course-bell/q6/TSLAx/journal.json` `32022725…d4f497`, `AAPLx` `96990f98…f834`, `SPYx` `855ff3e0…5296` (sha256 complets au §9).
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
`now` = horloge au moment du contrôle (`Date.now()`), surchargeable par `--now <ms>` pour les tests hors ligne uniquement.

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

## 7. Oracle (commandes de la mission, `env -u` des 8 clés, `TEMP=F:/tmp`)
| Étape | Base `5ad3718` (worktree propre) | Final |
|---|---|---|
| `npm run typecheck` | 0 | 0 |
| `npm run lint` | 0 | 0 |
| `npm run lint:ratchet` | 0 (69/69) | 0 (69/69, plafond intact) |
| `npm run gate:vocab` | 0 (254 fichiers) | 0 (254 fichiers) |
| `npm run lang:gate` | 0 | 0 (un premier passage a rougi sur `Mon` = lundi et `preuves` dans `apps/bell/ops` : corrigé en `Monday` et reformulé) |
| `npm run export:check` | 0 | 0 |
| `node --test --test-force-exit apps/bell/test/*.test.ts test/no-cash-provider-name.test.ts test/verify-bell.test.ts test/ci-gates.test.ts` | 324 tests, 324 pass, 0 fail, 0 skip | **331 tests, 331 pass, 0 fail, 0 skip** (+7 : 2 close, 1 e2e, 4 ops) |
| hors mission : `test/no-secret-in-repo.test.ts`, `test/bell-deploy-config.test.ts`, `test/bell-served.test.ts` | — | 12 tests, 12 pass |
| hors mission : `test/export-public.test.ts` (+ tout ce qui précède) | — | 339 pass, 0 fail |
| hors mission : les autres tests racine qui visent `apps/bell` (`grep -ln "apps/bell" test/*.test.ts`) : `rpc-guard-fetch-only-inside-client`, `bell-method`, `export-hygiene`, `lang-gate-routing` | — | 14 tests, 14 pass, 0 skip |
`npm test` complet non lancé (réservé à l'orchestrateur).

## 8. R-25 (C-10)
Commande de la gate, verbatim, sur un **index jetable** (`GIT_INDEX_FILE=F:/tmp/cashleg/w/r25.index`, `read-tree HEAD` + `add -A` ; l'index réel
n'est pas touché : les fichiers nouveaux restent `??`) :
`git diff --cached --shortstat 5ad3718 -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' ':(exclude)docs/G2-lot-*.md' ':(exclude)package-lock.json' ':(exclude,glob)fixtures/**/*.json' ':(exclude,glob)fixtures/**/*.jsonl' ':(exclude,glob)fixtures/**/*.csv' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.json' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.jsonl' ':(exclude,glob)apps/sentinel/test/fixtures/**/*.csv'`
→ `13 files changed, 732 insertions(+), 35 deletions(-)` = **767** (STOP 1 150 non atteint ; CI 1 205). Avec la pathspec exacte de `ci.yml` (qui exclut aussi `docs/**/*.md` et les séries Bell) : `12 files changed, 684 insertions(+), 31 deletions(-)` = **715**.
Écart à l'estimation (≈ 600-700) : +67, dû à C14/C15 et à la jointure (`q6-controls.mjs` 244 → 312 lignes) et au §8 bis du RUNBOOK (52 lignes).

## 9. Mutants (19, tous tués, restauration à l'octet prouvée)
Harnais `F:/tmp/cashleg/w/mutants.mjs` (sha256 `0638364d…8eeb`), résultat brut `mutants-result.json` (`f5868ec7…87eb1`). Pour chaque mutant :
sha256 avant → une seule occurrence remplacée → test(s) désigné(s) en TAP → **octets originaux réécrits** → sha256 re-mesuré. Manifeste des 13
fichiers identique avant et après la campagne (`diff` vide). Campagne rejouée trois fois, la dernière après le dernier édit du lot (sha avant = sha restauré ci-dessous).
| # | Mutation | Test désigné | Résultat, message exact (1er échec) | sha avant = restauré |
|---|---|---|---|---|
| M1 | skip retiré (`if (dates.length === 0) continue;`) | close.test | tué : `bell_cash_keyless_emits_no_request :: no request is emitted without a key` | `4696c743…` = `4696c743…` |
| M2 | `"databento.com"` à la faute `close.ts:173` | bell-served-e2e | tué : `'bell/publish: url_or_key_shaped_string: $.runs[0].provenance.providers.faults[0].provider'` | `4696c743…` = `4696c743…` |
| M2b | idem | close.test | tué : `bell_cash_keyless_emits_no_request :: Expected values to be strictly deep-equal` (+ `bell_cash_labels_are_generic`) | idem |
| M3 | `"databento.com"` à la requête `:170` | close.test | tué : `bell_read_reference_closes_cross_matched_mismatch_unavailable :: Expected values to be strictly equal` (+ generic) | idem |
| M4 | `"databento.com"` à la faute de forme `:178` | close.test | tué : `bell_cash_labels_are_generic :: one fault per site, each under its leg label` | idem |
| M5 | `"polygon.io"` à la requête `:181` | close.test | tué : `bell_read_reference_closes_cross_matched_mismatch_unavailable :: Expected values to be strictly equal` (+ generic) | idem |
| M6 | `"polygon.io"` à la faute `:184` | close.test | tué : `bell_cash_labels_are_generic :: one fault per site, each under its leg label` | idem |
| M7 | `"polygon.io"` à `collect.ts:435` | close.test | tué : `bell_cash_labels_are_generic :: one fault per site, each under its leg label` | `4eb82713…` = `4eb82713…` |
| M8 | `ADV_BARS_LABEL = "adv.bars"` | bell-keys | tué : `bell_publish_bare_label_guard_pins_operator_vocabulary :: the labels a Bell provenance can carry` | `4696c743…` = `4696c743…` |
| M9 | `-u DATABENTO_API_KEY` réintroduit | bell-ops | tué : `bell_ops_launch_unsets_only_read_unneeded_vars :: C-5: the two variables read by the collector and not needed here` | `36382bc7…` = `36382bc7…` |
| M10 | plafond ×100 | bell-ops | tué : `bell_ops_cost_preflight_prints_only_the_cost :: over the 1 USD cap => exit 4 (the launcher stops)` | idem |
| M11 | la clé imprimée avec le coût | bell-ops | tué : `bell_ops_cost_preflight_prints_only_the_cost :: 'the key is never printed'` | idem |
| M12 | `epu <= NOW` → `epu < 0` | bell-ops | tué : `bell_ops_controls_c14_c09_c11_c15_on_runmain_outputs :: The input did not match … /^FAIL Q6-C14 1 session\(s\) without a publishable close: no_close_ref on weekend\|2026-08-14 …/` | `214363bb…` = `214363bb…` |
| M13 | faute cash en WARN au lieu de FAIL | bell-ops | tué : `… /^FAIL Q6-C09 cash-leg faults=\[\{"provider":"cash-close","status":"HTTP 400"\}\]/` | idem |
| M14 | `no_close_ref: pending` retiré de C11 | bell-ops | tué : `… /no_close_ref=1 \(expected 0\)/` | idem |
| M15 | C15 ne compare que `n` | bell-ops | tué : `… /^WARN Q6-C15 1 difference\(s\), write the D-n line: TSLAx\|weekend\|weekend\|2026-08-14 vwap seq1=1\.0000000000 …/` | idem |
| M16 | contrôle `n` de la jointure retiré | bell-ops | tué : `… /^FAIL Q6-C14 gap -> session date join not proven \(gap TSLAx\|weekend\|weekend#0 has no volume entry of the same n\)/` | idem |
| M17 | ligne `*_API_KEY=<littéral>` plantée dans le lanceur | bell-ops | tué : `bell_ops_scripts_carry_no_secret_shape :: a credential shape in a committed ops file` | `36382bc7…` = `36382bc7…` |
| M18 | garde `state.json` neutralisée (`&& echo`) | bell-ops | tué : `bell_ops_launch_unsets_only_read_unneeded_vars :: 'C-9: an existing <out>/state.json stops the course'` | idem |
Journaux seq 1 cités au §4 (sha256 complets) : TSLAx `32022725f4739ff131c757bc3c2726cfbd6dff0538ac77e399e96fbcc4d4f497`, AAPLx
`96990f980397faeebd5b7b570dcdc2cce74bf91f4dc63e72de1ca9738b33f834`, SPYx `855ff3e091fd995034900b0f681db8154a41a8fc5ee4f82709ffaebe01905296`.

## 10. Lanceur : ce qui est prouvé hors ligne, ce qui ne l'est pas
- `bash -n` : syntaxe OK. Huit arrêts précoces exécutés (aucun réseau, aucune clé, rien n'est écrit) : sans argument, `TSLAx W3` sans `--out`,
  mint inconnu, mode inconnu, `--out` sans valeur, `--out --x` ⇒ `usage` exit 2 ; `--out` contenant `state.json` ⇒
  `STOP [q6 TSLAx W3]: …/state.json exists: move the previous attempt (proof), never an overwrite` exit 3 ; `--out` vide sans `Q6_*` ⇒
  `STOP [q6 TSLAx W3]: Q6_SHA_G7 is not a 40-hex sha1` exit 3.
- Le snippet `JS_COST` est **extrait du script et exécuté** par le test sur un `fetch` bouchonné (préchargé), et `JS_TRAJ` est repris à
  l'identique de seq 1 (messages traduits). `q6-controls.mjs` est exécuté sur des sorties réelles de `runMain`.
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
- **I-1 BELL-TREE-G7-SEQ2-1 (formé)** — le commentaire `bell-publish.mjs:93-94` (exigé par C-3) change le sha256 d'un fichier de
  `BELL_TREE_PATHS` (`scripts/verify-bell.mjs:40`). La CA check 11 compare l'arbre de l'hôte à `git cat-file blob <G7>:<path>` : lancée
  avec le G7 de ce lot, elle rougira tant que `/opt/monark-bell` n'est pas réinstallé depuis ce G7 (RUNBOOK §2). **Propriétaire** :
  orchestrateur. **Déclencheur** : étape 11 de seq 2. **Options** : garder `--g7` = G7 déployé (`/f/tmp/bell-dn/G7.txt`), le publieur
  étant fonctionnellement identique (diff = 2 lignes de commentaire), ou réinstaller l'arbre avant la CA.
- **I-2 (conception)** — les valeurs qui nomment le G7 de la course (`Q6_SHA_G7`, `Q6_EXEC_TREE`, `Q6_TRAJ_FILE`, `Q6_TRAJ_SHA256`,
  `Q6_FLOOR_CHAINSTACK_RU`) viennent de l'environnement, validées et affichées par la ligne DRYRUN : un commit ne peut pas porter son
  propre SHA. Les pins de blobs de seq 1 (`adc3260`) sont remplacés par `HEAD == Q6_SHA_G7` + arbre propre + `cmp` du lanceur avec sa copie
  G7. La garde P-1 d'ancre SPYx est conservée (toujours vraie). `FLOOR_HELIUS=60938` est conservé (un plancher est un max avec la somme du ledger).
- **I-3** — premier DRYRUN du lanceur par l'orchestrateur avant la course seq 2 (RUNBOOK §8 bis). **Déclencheur** : course seq 2.
- **Exception sanctionnée par C-7** : le pré-vol lit `DATABENTO_API_KEY` hors de `close.ts`, depuis l'environnement uniquement, jamais en
  argv ni affichée (M11). D1 « les clés ne sont lues que par close.ts » vaut pour le code du collecteur.
- `advBarsFor` est exporté (couture de test de D2, `collect.ts:422`).
- **« Coût nul » (ADR C-12) vs RUNBOOK §8 bis** : seul `metadata.get_cost` est gratuit (PR-B-DBN Q7, via `docs/biblio/bell/L-lecture-databento-api-2026-09-20.md:35`) ; la requête de plage d'UN jour × UN symbole est facturée. Le RUNBOOK l'écrit ainsi, et fait mesurer ce coût par l'étape 1 (`get_cost`) avant l'appel facturé. « Coût nul » de l'ADR = arrondi à zéro de ce montant, pas une gratuité.
- Test `bell_ops_controls_*` : les contrôles tournent sans journal de course (`--log` absent), donc Q6-C01 et la fenêtre (C02/C06/C07) échouent toujours et le code de sortie vaut toujours 1. Une assertion sur ce code ne discriminait rien et a été retirée. La preuve est portée par les lignes C09/C11/C14/C15 assertées une à une (M12-M16).
- `q6-controls.mjs` garde `--variant standard` par défaut (inchangé) ; le lanceur committé est la variante rapide et le RUNBOOK passe
  `--variant fast` explicitement.
- **Ajout hors C-12, à trancher par l'orchestrateur** : note C-1 dans « Next publications » du RUNBOOK (la CA de seq ≥ 2 est écrite hors
  dépôt, `docs/deploy-CA-bell.json` reste seq 1 jusqu'à BELL-SITE-SEQ2-1). Elle se retire sans effet si elle n'est pas voulue.
- **Incident d'outillage (sans effet sur les livrables)** : le dossier scratchpad de la session est partagé avec d'autres agents. Un
  `rep.mjs` homonyme y a remplacé le mien pendant le lot. Les deux éditions qu'il a faites (textes C04/C12 de `q6-controls.mjs`) ont été
  relues par `grep`. La suite du travail a eu lieu dans `F:/tmp/cashleg/w/`.
- Items de l'ADR non touchés, restés formés : BELL-SITE-SEQ2-1 (lot vitrine), BELL-VERIFY-SCHEDULE-1, LIC-DBN-1, ESC-1-REWRITE.
