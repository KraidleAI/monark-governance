Modèle résolu : claude-opus-5-5[1m]

# G1 — lot UKEMI-CONC-1 (course Ukemi, décision investisseur 140-bis « option vitesse MAX MAX » ; cible : temps 2 du recorder)

- Worker : `claude-opus-5-5[1m]`, effort max (décision 133). Aucun commit, aucun workflow (R-20). Rendu vérifiable (R-21).
- Worktree : `F:\Monark-wt-ukemiconc`, branche `lot/ukemi-conc-1`, base `lot/etude-suite` @ `2c276bb1fe3f365c82710e8902f48f0949691f15`
  (au lancement, 04:4x UTC). `lot/etude-suite` a avancé depuis à `38c767e` (2 commits DOCS seuls ; `git diff --stat 2c276bb 38c767e` =
  5 fichiers docs) — aucun recouvrement avec `apps/sentinel`, `packages/rpc-guard`, l'ADR-U4b, le prereg.
- `npm ci --ignore-scripts` (TEMP/TMP/cache npm sur `F:\tmp\ukemiconc\`, ceinture A-7) : exit 0 (`logs/npm-ci.log`).
  `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-ukemiconc\packages\rpc-guard\src\index.ts` (A-2 : le worktree). node v24.15.0.

## Synthèse (pour l'orchestrateur)

- **Livré** : `--concurrency <n>` (défaut 1 = recorder séquentiel inchangé ; entier ≥ 1 sinon refus PRÉ-VOL) ; à n > 1, un **préfetch
  borné** (fenêtre de n tâches) rejoue le plan de lecture de la passe de filtre ET de `recordBook` dans le lecteur mémoïsant, puis les
  consommateurs **inchangés** tournent sur des HIT ⇒ sorties porteuses de digest **byte-identiques par construction** ; `book.ts` non touché.
- **Défaut pré-existant corrigé** (F-1, `rpc2.ts`) : la politesse laissait passer ENSEMBLE deux appels concurrents au même opérateur (déjà
  à n=1 dans la scission `Promise.all` de `getLogsVia`) ⇒ portail FIFO par opérateur, horloge monotone, retries appelants compris.
- **Incident mesuré et corrigé pendant le G1** (ORACLE-HANG-1) : sous `Date` gelé (preload de `test/guard-scripts-u4.test.ts`) la 1re
  version du portail bouclait sans fin ⇒ `npm run test` pendu ; correctif horloge monotone + test de régression + mutant.
- **Preuves** : 11 tests nouveaux ; **19/19 mutants tués par leur test nommé** (17 mutations distinctes) ; **oracle 7 × exit 0**, tests
  **988/986/0/2** (= base 977/975/0/2 en worktree frais + 11) ; **A-6 9/9** ; **R-25 = 588** (< 600) ; fusion simulée avec le lot RETRY-2/3 :
  **0 conflit** textuel ; `DELIVERED.sha256` = goldens du harnais = octets de l'oracle.
- **Débit honnête** : avec `--operators drpc.org,tenderly.co,chainstack`, plafond = `1000 / --min-interval-ms` lectures/s (10/s à 100 ms) ;
  `--concurrency 8` le sature, ne le dépasse pas. Temps 2 ≈ 1,9 h au plafond (extrapolation, N à mesurer).
- **À faire par l'orchestrateur au G7** : insérer l'amendement ADR proposé (hors arbre, D-5) ; R-C-1 à la fusion avec RETRY-2/3 ; ligne de
  course du temps 2 au Sidecar (proposition ci-dessous).

## Journal (horodaté au fil de l'eau)
- 04:4x UTC : orientation — consigne A-1..A-13 (`docs/CONSIGNE-STANDARD-G1.md`), `FAITS-mevblocker-2026-09-23.md`, Sidecar 3
  (`SIDECAR-prereg-u4b-1b-2026-09-22.md`), `ETAT-REPRISE.md` §4-7, `record.ts`, `rpc2.ts`, `resume.ts`, `book.ts`, tests recorder existants.
- 04:51 UTC : A-6 AVANT (9 gelés prereg §2, sha256 LF des blobs HEAD `2c276bb`) : 9/9 = valeurs du prereg §2 (`logs/A6-frozen9-before.txt`).
- 05:0x UTC : constats d'orientation (AVANT code, [lu] fichier:ligne à `2c276bb`) :
  - **F-1 (défaut `rpc2.ts` sous concurrence, confirmé à la lecture)** : `polite()` (`rpc2.ts:137-145`) lit `politeLast`, attend, puis pose
    `politeLast.set(dom, Date.now())` APRÈS l'attente ⇒ deux appels concurrents au même opérateur lisent le même `prev`, dorment la même
    durée et passent ENSEMBLE. Manifestation DÉJÀ présente à n=1 : `getLogsVia` scinde une plage par `Promise.all` (`rpc2.ts:199`) ⇒ les
    deux sous-plages (récursivement jusqu'à 2^profondeur) franchissent `polite` simultanément (rafale sur un même opérateur).
  - **F-2** : le retry appelant (`record.ts:328-361`, boucle `attempt`) ré-appelle `c.call` après backoff SANS repasser par `polite`.
  - **F-3** : le temps 2 = `recordBook` (`book.ts:124-147`, boucle séquentielle) ; `book.ts` est un invariant « non touché » récurrent
    (PIN `034fbff9…` `ukemi.test.ts:33`/`ukemi-guard-record.test.ts:29` ; ADR-U4:19 « Non touchés : book.ts » ; CP2 u1a-hard-2).
  - **F-4** : le cache `--resume` appende par `appendFileSync` (`record.ts:385`), synchrone ⇒ sérialisé par construction dans le fil JS
    unique ; en revanche deux MISS concurrents de la MÊME clé (`resume.ts:96-103`) feraient deux lectures réseau + deux lignes.
  - **F-5** : le `finally` de `runRecorder` (`record.ts:496-513`) déverrouille les N opérateurs via `runCli unlock`, qui ouvre une SECONDE
    instance de ledger (`packages/rpc-guard/src/cli.ts:36`) et chaîne `unlocked` sur le head disque ; un appel en vol qui passerait `commit`
    ensuite chaînerait sur le head PÉRIMÉ de l'instance du client (`ledger.ts:127,135-138`) ⇒ « prev mismatch » (`ledger.ts:56`) ⇒ la
    fenêtre doit DRAINER avant de relancer.
  - **F-6 (zones du lot parallèle UKEMI-RETRY-2/3)** : `record.ts:160-185`, `:354-356`, battement `:91`.
  - Contraintes de scan : sur `apps/sentinel/src/**` les NOMS NUS des clés payantes et tout `fetch(` sont refusés, même en commentaire
    (`test/rpc-guard-fetch-only-inside-client.test.ts:28-51`) ; aucun littéral `latest` (`ukemi.test.ts:275`) ; motifs vocab sentinel.
- 05:0x-05:1x UTC : consultations advisor intégré n°1 (AVANT code, R-26) et n°2 (oracle de (v)). Avis retenus : préfetch pour le temps 2
  (`book.ts` non touché), drain avant relance (mécanique CHAIN-1), single-flight dans `resume.ts`, définition de « byte-identique » AVANT le
  test (i), oracle (v) = chaîne rejouée + `unlocked` en dernière ligne + aucune `attempted`/`refused` après, stop par `--max-calls` (pas
  `--max-ru 1`), `--min-interval-ms` > 0 dans (v), pool `eth_call` = {drpc, chainstack} pour la ligne de course. Avis écartés : voir D-2, D-3, D-4.
- 05:1x UTC : **mesure du lot parallèle** (`git -C F:\Monark-wt-ukemiretry diff`, en cours) : RETRY-2/3 + HEARTBEAT-1 modifie
  `record.ts:65` (+4 lignes après), `:91`, `UkemiArgs` (fin), `parseUkemiArgs`, `RecorderDeps`/`realDeps` (`:201-203`, + `retryWaitMs`),
  le commentaire du shim (`:322-324`), l'ensemble transitoire + backoff (`:351-356`), la ligne du battement (`:400`) et l'appel `:402`.
- 05:1x-05:2x UTC : code écrit (`rpc2.ts` portail + 3 sites, `pool.ts` NOUVEAU, `prefetch.ts` NOUVEAU, `resume.ts` single-flight,
  `record.ts` 11 points d'insertion hors zones RETRY) ; `npm run typecheck` exit 0 (`logs/tc-1.log`). 9 fichiers de test existants
  rejoués : 79/81 puis 81/81 après correction d'un commentaire (`fetch()` dans un commentaire de `rpc2.ts` rougissait
  `sentinel_src_clean_and_allowlist_load_bearing` ; reformulé « HTTP request »).
- 05:2x UTC : `apps/sentinel/test/ukemi-conc.test.ts` (10 tests) : 10/10 (`logs/conc-2.tap`).
- 05:30-05:35 UTC : harnais n°1 (`logs/mutants-1.log`) : 18/18 KILLED byIntended ; raisons vérifiées (`why.mjs`, `logs/why-1.log`) : M3b ⇒
  43 lignes `refused` (borne ≤ 8) ; **M4b ⇒ `rpc-guard: cycle ledger chain broken (prev mismatch, fail-closed)`** (CHAIN-1 exacte) ; M7 ⇒
  écarts `[33,1,0,0,0,0,0,61,…]` ms ; M8 ⇒ écarts 14-24 ms (< 25 : `setTimeout(0)` win32 ≈ 16 ms mesuré) ; M12 ⇒ `JSON.parse` d'une ligne
  entrelacée. Durcissement (tests seuls) : intervalle du test retry 25 → 40 ms ; attente du test budget `IV×12` → `IV×20`.
- 05:4x UTC : **fusion simulée** avec l'arbre de travail du lot RETRY (`record.ts` sha `78ab5106…`, base commune blob `fb9ae39`) :
  `git merge-file -p mine base theirs` ⇒ exit 0, **0 conflit** (`F:\tmp\ukemiconc\mergesim\`).
- 05:4x UTC : proposition d'amendement ADR rédigée HORS arbre (`F:\tmp\ukemiconc\ADR-amendement-UKEMI-CONC-1.md`, D-5).
- **05:42-05:52 UTC — INCIDENT ORACLE-HANG-1 (défaut du lot, détecté à l'oracle, corrigé)** : `npm run test` pendu ~10 min sur
  `test/guard-scripts-u4.test.ts`. Cause mesurée : ce test lance `scripts/census/u4-oracle-path.mjs` (qui construit
  `makeUkemiPool(…, minIntervalMs 50)`, `u4-oracle-path.mjs:26,96,130`) sous un preload qui GÈLE `Date` (`Date.now()` constant,
  `test/guard-scripts-u4.test.ts:74-76`) ; la boucle de re-test de la 1re version du portail (`last + interval > Date.now()`) ne se termine
  jamais sous horloge gelée ; `execFileSync` bloque le fichier de test (le `--test-timeout` ne peut pas tirer pendant un appel synchrone).
  Trou de ma sélection de « tests affectés » : les scripts `scripts/census/u4-*.mjs` qui importent `rpc2.ts` n'avaient pas été rejoués.
  Arrêt : UNIQUEMENT mon arbre d'oracle (`taskkill /T` des pid 57672 [oracle.sh] et 56240 → 104860 → 9340 → 96764 → 41904 [le prober],
  arbre vérifié par `ParentProcessId` AVANT) ; processus de course vérifiés vivants et NON touchés (78300 `record.ts`, 102592 `collect.ts`
  Bell). Correctif : horloge MONOTONE `performance.now()` dans le portail (insensible au gel de `Date` et aux sauts d'horloge murale) +
  re-test BORNÉ (≤ 10 sommeils) ; tests (ii) et retry mesurés sur la même horloge ; test de régression + mutant M16.
- 05:5x-06:0x UTC : `ukemi-conc.test.ts` **11/11** (`logs/conc-4.tap`) ; **les 30 fichiers de test qui exercent `rpc2.ts`/`record.ts`/
  `resume.ts`/`book.ts` (directement ou via `scripts/census/u4-*.mjs`, `u4b-*`, Bell `ethereum.ts`) : 355/355 en 44,6 s**
  (`logs/affected-2.tap`, sous `timeout 1500` de sûreté ; `test/guard-scripts-u4.test.ts` VERT) ; typecheck exit 0 (`logs/tc-2.log`) ;
  eslint ciblé sur les 6 fichiers exit 0 (`logs/lint-targeted.log`) ; **harnais FINAL 19/19 KILLED byIntended** (`logs/mutants-final.log`).
- 06:03-06:1x UTC : oracle 7 gates : 7 × exit 0 ; invariants ; fusion re-simulée contre le `record.ts` le plus récent du lot RETRY (sha
  `8b5074f3…`) : **0 conflit**.
- 06:1x UTC : consultation advisor intégré n°3 (AVANT rendu). Retenu : (1) contradiction de TEXTE entre la définition « byte-identique »
  (tallies inclus) et R-C-3 ⇒ tallies séparés des champs porteurs de digest, R-C-3 rendu PRÉDICTIF (G1 + ADR) ; (2) la seule borne SUPÉRIEURE
  de temps (`g < 5×IV`, test « horloge monotone ») pouvait faux-rougir sur un runner chargé ⇒ `8×IV` (le mutant M16 produit ≥ 10×IV) ;
  (3) note de lecture du log (lignes `..filter` = rejeu après le préfetch) ; (4) D-8 référence le test PIN à n=1. Test seul modifié
  (`ukemi-conc.test.ts`, 2 lignes) ⇒ TOUT rejoué : 11/11 (`logs/conc-5.tap`), **harnais FINAL 19/19 KILLED byIntended** (en-tête
  06:16:15Z, `logs/mutants-final.log`), **oracle 7 × exit 0, 988/986/0/2** (en-tête 06:21:46Z, `oracle/`), invariants (`logs/invariants.log`).
- 06:3x UTC : garde SECRET-SCAN-1 (`docs/ETAT-REPRISE.md` §4) appliquée d'avance aux fichiers de rendu hors arbre : les 13 motifs de
  `test/no-secret-in-repo.test.ts` (extraits du fichier, jamais re-tapés ; `F:\tmp\ukemiconc\secretscan.mjs`) sur `G1.md` et
  `ADR-amendement-UKEMI-CONC-1.md` ⇒ **0 occurrence** (persistance dans `docs/` sans risque de rougir la branche).

## D-n déclarées (F-3) — décisions de conception, alternatives écartées visibles

- **D-1 (forme de la concurrence : PRÉFETCH borné, consommateurs INCHANGÉS)** — la mission demande « lectures par compte de la passe de
  filtre ET du temps 2 par fenêtre bornée de n promesses », résultats « agrégés dans l'ordre des holders ». Réalisation : à n > 1,
  `prefetch.ts` rejoue le PLAN DE LECTURE du consommateur (passe de filtre `record.ts:66-86` ; `recordBook` `book.ts:70-143`) à travers le
  lecteur MÉMOÏSANT (cache `--resume`, ou mémo en RAM `makeResumeReader(basePool, [], noop)` quand `--resume` est absent), par une fenêtre
  bornée de n (`pool.ts`) ; puis le consommateur **inchangé** tourne séquentiellement sur des HIT ⇒ agrégation par le code d'origine,
  dans l'ordre des holders ; sorties byte-identiques **par construction**. Écartés : (a) boucle concurrente DANS `recordBook` (F-3) ;
  (b) boucle concurrente DANS `enumerateAndCountAtRisk` (conflit textuel certain avec RETRY `:65`/`:91`/`:402`). Défaillance sûre : un plan
  qui dériverait ⇒ le consommateur lit ce qui manque (correct, plus lent) ; dérive gardée par test (0 lecture réseau pendant `recordBook`).
- **D-2 (`--concurrency` hors `parseUkemiArgs`)** — `parseConcurrency(argv)` (`pool.ts`), appelé en tête de `runRecorder` (refus PRÉ-VOL),
  pour ne toucher ni `UkemiArgs`/`parseUkemiArgs` ni les `deepEqual` de `ukemi-record.test.ts:23,25` (zone RETRY, conflit certain sinon).
  Écart à l'avis advisor n°1 §8 (une ligne dans `UkemiArgs`).
- **D-3 (portail `rpc2.ts` : FIFO par opérateur, horloge monotone, stamp APRÈS émission)** — correctif de F-1 exigé par la mission. Écart à
  l'avis advisor n°1 §2 (réservation du créneau AVANT le sommeil) : la réservation espace des créneaux PRÉVUS, pas des émissions — un
  minuteur en retard puis le suivant à l'heure donnent un écart < intervalle, et des créneaux réservés dans le passé partent en rafale à la
  reprise ; la FIFO attend `last + interval` mesuré APRÈS l'émission réelle précédente et re-teste l'horloge après chaque minuteur ⇒ l'écart
  entre ÉMISSIONS est ≥ `minIntervalMs` (la requête HTTP part synchroniquement depuis `fn()` : shim → `client.call` → ligne write-ahead →
  transport). Le suivant est libéré dès l'émission (les appels à un même opérateur restent en vol ensemble). Horloge : `performance.now()`
  (ORACLE-HANG-1).
- **D-4 (retry appelant cadencé)** — F-2 corrigé plutôt que formé en résidu (écart à l'avis advisor n°1 §3) : l'invariant (a) de la mission est
  « ≤ 1 appel par `minIntervalMs` par opérateur » et un retry EST un appel. Une seule ligne, `record.ts:343` (hors zones RETRY, fusion
  simulée propre) : `attempt > 0` passe par le MÊME portail (partagé, injecté dans `makeUkemiPool`). À n = 1 : sans effet dès que
  `backoffMs ≥ minIntervalMs` (toutes les lignes de course : backoff ≥ 1 000 ms, intervalle ≤ 200 ms) ; tests existants à intervalle 0.
- **D-5** — amendement ADR livré HORS arbre (`F:\tmp\ukemiconc\ADR-amendement-UKEMI-CONC-1.md`, à APPENDRE au G7 en fin de
  `docs/adr/ADR-U4b-calibration-episode-frais.md`) : le lot RETRY appendra aussi en fin du même fichier (deux ajouts en EOF = conflit).
- **D-6** — A-2 : `npm ci --ignore-scripts` (imposé par la mission) au lieu de `mk-nm.ps1` ; résolution vers le worktree vérifiée.
- **D-7** — R-25 mesuré avec un `git add -N` TRANSITOIRE des 3 nouveaux fichiers puis `git reset` (index rendu à l'état initial ;
  `git status` final = 3 `M` + 3 `??`) ; aucun commit.
- **D-8** — `provenance.concurrency` est écrit aussi à n=1 (clé de provenance nouvelle, hors de tout digest ; l'aval gelé ne lit que
  `book` et `provenance.book_digest`, `scripts/census/u4b/u4b-reduce.mjs:41-48` [lu]). Écarté : clé seulement à n>1 (provenance muette).
  Le JSON n=1 n'est donc pas octet pour octet celui d'avant le lot (clé ajoutée ; `ukemi_sha` change de toute façon) ; ce qui est
  byte-identique à n=1 : les champs porteurs de digest — PIN `034fbff9…` reproduit à n=1 par `ukemi_record_then_unlock_then_reconcile_end_to_end`
  (`ukemi-guard-record.test.ts:64`, fichier INCHANGÉ, vert dans l'oracle) et par tous les tests recorder existants (intervalle 0, n=1).
- **D-9** — l'erreur relancée par la fenêtre est la PREMIÈRE dans le temps (équivalent séquentiel), pas « le budget d'abord » ; un
  `BudgetExceededError` survenu pendant le drain est listé dans `diag.pool.suppressed`. Écarté : priorité au budget (sortie 2) même si
  une abstention (sortie 1) l'a précédé.
- **D-10** — F-2 : 1 caractère non ASCII (`≤`) dans une ligne de commentaire MODIFIÉE de `rpc2.ts`, repris du texte pré-lot ; tout texte
  NOUVEAU est ASCII (mesuré par `grep -P` des octets > 0x7F sur les lignes ajoutées et les 3 fichiers neufs).

## Livrables (worktree `F:\Monark-wt-ukemiconc`, non committés — R-20)

| Fichier | sha256 (`DELIVERED.sha256`) | Rôle |
|---|---|---|
| `apps/sentinel/src/ukemi/pool.ts` (NOUVEAU, 52 l.) | `2119cfd052f2…` | `runBounded` (fenêtre, index d'entrée, stop, drain), `PoolStoppedError`, `parseConcurrency` |
| `apps/sentinel/src/ukemi/prefetch.ts` (NOUVEAU, 106 l.) | `228eeb374549…` | `prefetchFilterReads`, `prefetchBookReads` (+ énumération `head`, mémo de réserve single-flight) |
| `apps/sentinel/src/ukemi/rpc2.ts` | `624bc437ae68…` | `makePoliteGate` ; option `gate` de `makeUkemiPool` ; sites `quorum2`, `getLogsVia`, `finalized` |
| `apps/sentinel/src/ukemi/record.ts` | `a49bebb34cad…` | parse pré-vol, portail partagé + retry cadencé, mémo RAM, préfetch filtre/book, battement, provenance, diag |
| `apps/sentinel/src/ukemi/resume.ts` | `8954c497467c…` | single-flight `ethCall` |
| `apps/sentinel/test/ukemi-conc.test.ts` (NOUVEAU, 324 l.) | `901af7724f50…` | 11 tests |

Hors arbre (`F:\tmp\ukemiconc\`) : ce rendu, `DELIVERED.sha256`, `R25.txt`, `ADR-amendement-UKEMI-CONC-1.md`, `mutants.mjs`, `why.mjs`,
`oracle.sh`, `invariants.sh`, `oracle/`, `logs/` (TAP, harnais, invariants, typecheck, lint), `mergesim/`.

## Tests (11, `apps/sentinel/test/ukemi-conc.test.ts`) → exigence → mutant(s) tué(s) par CE test (A-11 byIntended)

| Test | Mission | Mutants |
|---|---|---|
| `ukemi_conc_pool_bounds_in_flight_and_keeps_input_order` | (iii), (c) | M1 fenêtre non bornée ; M2 agrégation à l'arrivée |
| `ukemi_conc_pool_first_error_stops_dispatch_and_drains_before_rethrow` | (e), (v) | M3 stop ignoré ; M4 pas de drain |
| `ukemi_conc_concurrency_is_optional_default_1_and_fail_closed` | (vi), défaut 1 | M5 défaut ≠ 1 ; M6 0 accepté |
| `ukemi_conc_polite_gate_spaces_issues_per_operator_under_concurrency` | (ii), (a) | M7 politesse contournée (portail pré-lot) |
| `ukemi_conc_polite_gate_uses_the_monotonic_clock_under_a_frozen_date` | (a), ORACLE-HANG-1 | M16 horloge murale |
| `ukemi_conc_retry_attempt_re_enters_the_gate` | (a) retries | M8 retry hors portail |
| `ukemi_conc_n8_filter_and_book_are_byte_identical_to_n1` | (i), (c), (iii) servi, PIN | M11 / M11b préfetch non branché ; M14 mémo RAM absent |
| `ukemi_conc_book_prefetch_leaves_recordbook_zero_network_reads` | garde D-1, (iii), (f) | M9 sur-lecture ; M10 sous-lecture ; M15 battement non cumulatif |
| `ukemi_conc_resume_under_concurrency_one_line_per_miss_and_replays` | (iv), (d) | M12 appends non sérialisés |
| `ukemi_conc_resume_reader_is_single_flight_per_key` | (d) | M13 single-flight retiré |
| `ukemi_conc_budget_stop_drains_before_unlock_and_ledgers_stay_chained` | (v), (e), F-5 | M3b stop ignoré (servi) ; M4b pas de drain (servi, CHAIN-1) |

« Byte-identique » défini AVANT le test (i) — **champs porteurs de digest, identiques pour tout n par construction** : `book` (objet
complet), `book_digest`, `holders_digest`, `counts`, `hf_findings` (ordre compris), `timeline` ; passe de filtre : `holders`,
`holders_digest`, `n_at_risk_config`, `excluded`, `projection_remaining_calls`. **Tallies de provenance (NON-gating, `record.ts` le dit
en clair)** : `calls`/`calls_by_operator`/`calls_by_method` et `rpc_errors` sont en PLUS assertés égaux sur ce jeu (ils tuent sur-lecture,
double MISS, mémo absent) — égalité valable parce que la fixture n'a AUCUNE `description()` en revert (3 × `0x7284e416` valides) ; sur une
course réelle, **R-C-3 est le SEUL écart connu, hors digest** : +2 `calls`, +2 `rpc_errors` (le shim journalise chaque `RpcError`), +1
`errors_by_operator` par opérateur (`transport.ts:177`), par réserve dont `description()` revert (GHO, `book.ts:82-83`). Hors comparaison par
définition : `provenance.concurrency`, `seconds`, horodatages. Jeu : 4 holders enregistrés + 48 clones re-clés (octets enregistrés)
couvrant les 4 genres (asserté > 0 chacun, D-2) ; PIN `034fbff9…` reproduit à n=8 sur la fixture.

Harnais final (`F:\tmp\ukemiconc\mutants.mjs` ; `logs/mutants-final.log`, en-tête A-12) : **19 entrées / 17 mutations distinctes, 19/19
KILLED byIntended, restauration byte-exacte, golden intact, exit 0.** Déclaratif (sans mutant tueur, déclaré) : remise à zéro des compteurs
après le préfetch de filtre (R-C-2) ; borne « ≤ 10 sommeils » du portail (filet contre une horloge monotone figée, non simulable sans
maquiller `performance.now`).

## Oracle 7 gates (`F:\tmp\ukemiconc\oracle.sh` ; `oracle/`)

`gate:vocab` 0 · `typecheck` 0 · `test` 0 · `lint` 0 · `lint:ratchet` 0 (69/69) · `lang:gate` 0 · `export:check` 0.
Tests : **988 / 986 pass / 0 fail / 2 skip**. Rapprochement : base mesurée dans `F:\Monark` = 977/976/0/1 (commit G7 BELL-SHORTPAGE-1) ;
dans un worktree FRAIS le test pré-existant `u4b_labels_replay_via_main_real_artifact` (`test/u3-realized-param.test.ts:238`) se saute car
`docs/census-2026-09-18/data/A-rawlogs.jsonl` est gitignoré (`.gitignore:19` ; présent dans `F:\Monark`, absent du worktree — mesuré) ⇒
base équivalente 977/975/0/2 ; + 11 ⇒ 988/986/0/2. L'autre saut = `sentinel_run_releases_chainstack_lock_on_sigterm` (win32, déclaré).

## R-25 et invariants

- **R-25 = 588** lignes (564 insertions + 24 suppressions) contre `2c276bb`, pathspec VERBATIM `.github/workflows/ci.yml:65` (`R25.txt`) ;
  cible mission < 600 tenue ; seuil 1 150 loin.
- **A-6** : 9/9 sha LF byte-identiques AVANT/APRÈS (`logs/A6-frozen9-before.txt` == `logs/A6-frozen9-after.txt`), = prereg §2.
- `git diff --quiet 2c276bb -- apps/sentinel/src/ukemi/book.ts docs/adr/ADR-U4b-calibration-episode-frais.md docs/PLAN-u4b-prereg.md
  apps/sentinel/test/fixtures package-lock.json packages scripts apps/bell` ⇒ **exit 0** ; `book.ts` LF `cb1ba53c…`, ADR-U4b `2675e543…`,
  prereg `1971d9b1…` (blob HEAD == worktree). `DELIVERED.sha256` (6 fichiers) == « golden » du harnais final (06:16:15Z) ; aucune écriture
  dans le worktree entre la fin du harnais et la fin de l'oracle (06:21:46Z →) ni après ⇒ mutants, oracle et livré portent sur les MÊMES
  octets (`sha256sum -c DELIVERED.sha256` : 6/6 OK au rendu).

## Tuyaux (règle de Branchement)
- **Entrée** : `--concurrency <n>` (ligne de course) → `parseConcurrency` → `runRecorder` (pré-vol).
- **Sortie** : mêmes artefacts (JSON de run, `book`/`book_digest`, cache `--resume`, `<out>.diag.json`) + `provenance.concurrency`,
  `diag.pool` (n > 1 : `{concurrency, suppressed}`), battement stderr `..prefetch pass=<filter|book> holders_done=… n_at_risk_config=…
  concurrency=… calls={…} errors={…}` (tous les 2 000 holders traités).
- **État** : cache `--resume` (hors dépôt) ou mémo en RAM ; ledgers de cycle par opérateur (inchangés).
- **Composition (non-LLM, chemin servi `runRecorder` sur le VRAI `openGuardedClient`, seul `globalThis.fetch` bouchonné, corps JSON-RPC de
  forme réelle)** : `…n8_filter_and_book_are_byte_identical_to_n1`, `…budget_stop_drains_before_unlock_and_ledgers_stay_chained`,
  `…resume_under_concurrency_one_line_per_miss_and_replays`, `…retry_attempt_re_enters_the_gate`. Statut : **branché** (chemin servi =
  la CLI de course) ; « built » seulement à la première course rapprochée.

## Ligne de course proposée pour le temps 2 (à valider par l'orchestrateur ; aucune course lancée par le worker)

Base [lu] : `F:\course-ukemi\record-t1-essai4b.sh:19-38` (flags de l'essai 4b) + deltas de l'essai 5 (`docs/ETAT-REPRISE.md` §7 :
`--operators drpc.org,tenderly.co,chainstack --min-interval-ms 100 --retries 6 --backoff-ms 1000 --backoff-cap-ms 30000
--heartbeat-every 500`). Préconditions : G7 UKEMI-CONC-1 + G7 UKEMI-RETRY-2/3 fusionnés, R-C-1 appliqué, temps 1 COMPLET (ligne
`holders` dans le cache, `n_at_risk_config` = N mesuré), `F:\Monark-wt-ukemiexec` ré-épinglé au sha fusionné, 0 verrou.

```
node apps/sentinel/src/ukemi/record.ts \
  --cluster weth --block 23414968 --from-block 16496792 \
  --operators drpc.org,tenderly.co,chainstack \
  --min-interval-ms 100 --concurrency 8 \
  --retries 6 --backoff-ms 1000 --backoff-cap-ms 30000 --heartbeat-every 500 \
  --ledger-dir F:/monark-ledger/chainstack-2026-09-19 --cycle chainstack-2026-09-19 --floor 12916 \
  --max-ru <2 x EC> --max-calls <9 x N x 1.2> --method-caps eth_call=<EC>,eth_getLogs=6000,eth_getBlockByNumber=4000 \
  --prereg-file docs/PLAN-u4b-prereg.md \
  --prereg-sha 1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49 \
  --labeler-sha cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af \
  --concordance-out F:/course-ukemi/record/concordance-book-23414968.jsonl \
  --resume F:/course-ukemi/record/U4-inputs-23414968.jsonl \
  --out F:/course-ukemi/record/U4-book-23414968.json
```

- **Caps (formule, pas une hausse silencieuse)** : projection du recorder lui-même `projection_remaining_calls = 9 × N` appels (provenance
  filter-only de `record.ts`) ; chaque lecture `eth_call` tire drpc ET chainstack ⇒ lectures ≈ 4,5 × N, tentatives chainstack `eth_call`
  ≈ 4,5 × N × (1 + taux de retry) ⇒ `EC` ≥ 4,5 × N × 1,2 ; `--max-calls` ≥ 9 × N × 1,2 ; `--max-ru` ≥ 2 RU × `EC` (2 RU/`eth_call`
  chainstack mesuré, `docs/ETAT-REPRISE.md` §6). Ordre de grandeur (EXTRAPOLATION, à remplacer par N mesuré) : battement de l'essai 4b lu
  à `F:\course-ukemi\logs\record-t1-essai4b.log` : `n_at_risk_config=3160` à `config_read=14000` (22,6 %) ⇒ N ≈ 15 190 sur 67 191 ⇒
  ≈ 68 400 lectures, `EC` ≈ 82 000, `--max-calls` ≈ 164 000, `--max-ru` ≈ 164 000 RU.
- **Débit (honnêteté, pas un « ×8 »)** : pool `eth_call` = {drpc, chainstack} (`ETH_CALL_KEYLESS_LABELS` ne contient pas tenderly,
  `packages/rpc-guard/src/transport.ts:36-37`) ; chaque lecture tire les DEUX ⇒ plafond `1000 / --min-interval-ms` = **10 lectures/s à
  100 ms** ⇒ ≈ 68 400 / 10 ≈ **1,9 h** au plafond. Quelques travailleurs saturent ce plafond ; au-delà, ils attendent dans la file du
  portail (sain, sans gain). Levier suivant = `--min-interval-ms` (règle d'arrêt 140-bis : delta d'erreurs drpc > 5 % entre battements ⇒
  200 ms). Le débit SÉQUENTIEL de référence est à lire sur des deltas de battements horodatés (`t=` ajouté par RETRY-2/3) : le champ
  `rate=` actuel compte les rejeux de cache (piège noté `docs/ETAT-REPRISE.md` §6). **Lecture du log en course** : le débit réel est sur
  les lignes `..prefetch pass=…` ; à n > 1 en `--filter-only`, la passe séquentielle INCHANGÉE qui suit rejoue les 67 191 HIT et tire ses
  propres lignes `..filter …` (~33) avec un `rate=` de rejeu — ce sont du rejeu, pas du réseau.
- **Option temps 1** : la même option vaut pour `--filter-only` (préfetch des `getUserConfiguration`) si le temps 1 n'est pas fini au
  G7 — reprise par `--resume` (les lectures en cache sont des HIT, 0 appel).

## Résidus formés (zéro dette nue ; propriétaire : orchestrateur)
- **R-C-1** câbler `every: args.heartbeatEvery` dans les deux appels `prefetch…Reads` de `record.ts` — déclencheur : G7 du second des deux
  lots (CONC, RETRY-2/3) ; une ligne par appel. Note de fusion : RETRY-3 injecte `deps.sleep` dans ses tests pour ne pas attendre le
  backoff, alors que le portail attend RÉELLEMENT (`setTimeout` + `performance.now`) avant tout `attempt > 0` ; un test RETRY lancé avec
  `--min-interval-ms` > 0 et un faux `sleep` ralentirait (ni faux vert ni faux rouge). **Vérifié sur le commit RETRY `dd44604`** (committé
  entre-temps sur `lot/ukemi-retry-2`) : son aide `argvR` pose `--min-interval-ms 0` (`ukemi-guard-record.test.ts:695-696` @ `dd44604`) ;
  les 2 seules occurrences `350` sont dans le test de parse (`parseUkemiArgs`, sans réseau) ⇒ aucune interaction. Fusion 3-voies de
  `record.ts` contre le blob `dd44604` (sha `8b5074f3…`) : **0 conflit** ; fichiers touchés par `dd44604` ∩ fichiers du lot = `record.ts`
  seul (+ `docs/G1-lot-ukemi-retry-2.md`, disjoint). L'oracle sur l'arbre FUSIONNÉ reste la gate du G7 (non rejoué ici).
- **R-C-2** test de la remise à zéro des compteurs après le préfetch de filtre — déclencheur : R-C-1 (test à `--heartbeat-every` petit).
- **R-C-3** description en revert concordant non cacheable ⇒ lue par le préfetch PUIS relue par `recordBook` (+2 `calls`, +2 `rpc_errors`,
  +1 `errors_by_operator`/opérateur par réserve concernée, hors digest) — déclencheur PRÉDICTIF : au Sidecar du temps 2, pré-déclarer que
  `calls_by_operator` dépassera la projection n=1 de 2 × (nombre de réserves à `description()` en revert — GHO attendu) : ce n'est pas une
  fuite ; +1 erreur par opérateur est invisible à l'échelle de la règle des 5 %. Alternative code (non requise par la mission, si le G2 la
  demande) : retirer la lecture `description` de `reserve()` dans `prefetch.ts` (`recordBook` la lit alors une seule fois quel que soit n).
- **R-C-4** pas de recul global par opérateur sur 429 (le portail plafonne à 1/intervalle retries compris, mais pendant un épisode 429 les
  autres lectures en vol continuent au débit du portail) — déclencheur : delta d'erreurs d'un opérateur > 5 % entre battements au débit
  concurrent ⇒ règle d'arrêt 140-bis (200 ms / n plus petit) ; lot dédié si récurrent.
- **R-C-5** ripple Bell (`apps/bell/src/ethereum.ts` consomme `makeUkemiPool`, `minIntervalMs 200`) : le portail entre dans l'exécution
  Bell au prochain ré-épinglage — déclencheur : prochaine frontière `mint_end` ; effet : sous-plages d'une scission `getLogsVia` cadencées
  (plus de rafale), sorties identiques (suites Bell vertes dans `logs/affected-2.tap`).
- Note (pas un défaut) : aucune borne haute sur n (fenêtre effective = min(n, holders)) ; la ligne de course fixe n.

## Consigne standard : point par point (`docs/CONSIGNE-STANDARD-G1.md`, A-1..A-13 + B..F + G-1)

- **A-1** fait — première ligne `Modèle résolu : claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`).
- **A-2** fait (variante D-6) — `npm ci --ignore-scripts` ; `require.resolve('@monark/rpc-guard')` → le worktree. Retrait : `node_modules`
  est un vrai dossier `npm ci` (pas de jonctions) ; aucun retrait fait par le worker.
- **A-3** fait — codes de retour capturés directement (`cmd > log 2>&1; echo exit=$?`) ; oracle 7 gates par `oracle.sh`.
- **A-4** fait — `DELIVERED.sha256` (chemins relatifs au worktree) ; rendu sous `F:\tmp\ukemiconc\` ; aucun commit ; aucun réseau (tests :
  `globalThis.fetch` bouchonné, pool injecté sur hôtes `.example`, opérateurs keyless seulement, env `{}`). Rien écrit sur `C:` par le
  worker (TEMP/TMP/TMPDIR/cache npm sur `F:`) ; déclaré : le harnais Claude Code persiste de lui-même certaines sorties d'outil sous
  `C:\Users\KACIMI\.claude\projects\…\tool-results\` (hors contrôle du worker).
- **A-5** fait — R-25 = 588 avec le pathspec VERBATIM de `ci.yml:65`.
- **A-6** fait — 9/9 ; ADR-U4b, prereg, `book.ts`, fixtures, lockfile, `packages/`, `scripts/`, `apps/bell/` intacts (exit 0).
- **A-7** fait — toute commande node/npm lancée sous `env -u` des 8 clés ; aucune variable affichée ; le harnais retire aussi les 8 clés
  (insensible à la casse) de l'env de chaque enfant.
- **A-8** fait — corps JSON-RPC de la forme réelle (`{"jsonrpc":"2.0","id":1,"result":…}` / `error`), valeurs = octets enregistrés.
- **A-9** n-a — aucune phrase servie touchée. **A-10** n-a — aucune valeur câblée vers une surface servie.
- **A-11** fait — `--test-reporter=tap`, CRLF normalisé, « tué » seulement si `not ok … - <tueur attendu>`.
- **A-12** fait — en-têtes auto-identifiants (`logs/mutants-final.log` : HEAD, arbre, node/uv/plateforme, commande, sha du harnais, du
  test et des goldens ; par mutant : hunk, sha muté, sha restauré ; `oracle/HEADER.txt`).
- **A-13** fait — tout fichier portant `\\` écrit par Write/Edit (sources, test, harnais, ce rendu) ; `find` du harnais re-comptés dans node
  au pré-vol (occurrence = 1, non-no-op). Observé au G1 : un heredoc Bash de ~8 Ko (dont le corps citait un motif `grep -P` portant
  l'échappement `\x00` et des caractères non ASCII) a été refusé au parse (« unexpected EOF while looking for matching quote », ligne 78) ;
  cause NON isolée — deux pièges mesurés compatibles : l'octet NUL mangé par le transport (A-13 / INCIDENT powercut) et le heredoc
  > ~7 Ko tronqué (C-V-6 GARDE-FSYNC, `docs/ETAT-REPRISE.md` §6) ; rien écrit (`wc -l` du rendu = 104 inchangé, mesuré) ; rendu réécrit par Write.
- **B-1** n-a en substance — aucun nouveau chemin de corps d'opérateur ; `diag.pool.suppressed` reprend les `message` des MÊMES objets
  d'erreur que `diag.error.message` (expurgés par le transport : indice fermé pour un payant), passés par `stripUrls`.
- **B-2/B-3/B-6** n-a — aucune manipulation de clé ni d'hôte. **B-4** fait — `record.ts` ne lit aucune env ; `--concurrency` = argument CLI.
  **B-5** fait — nouveaux fichiers dans la portée du scanner `fetch_only_inside_client` : 0 occurrence (après reformulation d'un commentaire).
- **C-1** fait — `BudgetExceededError` canonique (ré-export `rpc2.ts`) ; `PoolStoppedError` = classe INTERNE, jamais relancée hors de la
  fenêtre. **C-2** inchangé — le shim relance le budget d'abord (jamais retenté) ; le portail n'est pas un retry. **C-3** inchangé — une
  seule couche de retry. **C-4** n-a.
- **D-1** fait — 11 tests, 19 mutants (17 distincts) ROUGES par leur test nommé ; déclaratifs déclarés (R-C-2, borne du portail).
  **D-2** fait — jeu non vide couvrant les 4 genres, listes FERMÉES de champs, valeurs recomputées par le code d'origine. **D-3** fait —
  4 tests de composition sur le chemin servi. **D-4** fait — 0 ligne modifiée dans un test existant (fichier NOUVEAU seulement).
- **E-1/E-2** inchangés ; la fenêtre DRAINE avant le `finally` (test (v) + M4b). **E-3** fait — intervalles = `--min-interval-ms` /
  `--slow-interval-ms` (inchangés) ; banc 25 s inchangé ; aucun nouveau backoff.
- **F-1** fait — Tuyaux dans l'amendement proposé ; aucun renvoi vers `F:\tmp` dans son texte. **F-2** fait sauf D-10 (déclaré).
  **F-3** fait — D-1..D-10 ; consultations R-26 (advisor intégré).
- **G-1** n-a — aucune pièce publique (registre, README, skill, site, export) touchée.

## Provenance
Worker `claude-opus-5-5[1m]` (effort max, décision 133) ; 2026-09-23 04:4x-06:2x UTC ; base `2c276bb` ; contexte : mission G1
UKEMI-CONC-1 (orchestrateur `claude-fable-5-1`) ; consultations advisor intégré : 3 (n°1 avant code, n°2 oracle (v), n°3 avant rendu,
+ relecture finale) ; réviseur attendu : G2 ‖ checkpoint-2,
vérification adversariale R-21 de l'orchestrateur. `error_origin` proposé : F-1 = **plan** (portail conçu pour des appelants séquentiels
alors que `getLogsVia` scindait déjà en parallèle) ; ORACLE-HANG-1 = **implémentation G1** (horloge murale sous `Date` gelé ; détecté par
l'oracle du G1 lui-même, corrigé avant rendu).
