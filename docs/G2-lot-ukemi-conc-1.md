# G2 — lot UKEMI-CONC-1 (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:\tmp\g2-ukemiconc\G2.md` (sha256 7e235f9d749197853185d23c3d151840be7587dccbb38836e28936da63186f7c). Verdict : PASS-AVEC-CORRECTIONS (C-G2-1 = cp-2 C-V-1/C-V-2, C-G2-1b, C-G2-2, C-G2-3 → micro-pli 1b en vol ; C-G2-4 → texte ADR à l'insertion G7).

---

Modèle résolu : claude-opus-5-5[1m]

# G2 — revue indépendante du lot UKEMI-CONC-1 (branche `lot/ukemi-conc-1` @ `dec704d`, base `2c276bb`)

- Relecteur : `claude-opus-5-5[1m]`, effort max, instance séparée du worker, contexte frais. Aucun commit, aucun workflow (R-20).
  Aucune écriture dans `F:\Monark` ni dans `F:\Monark-wt-*` (lecture seule du worktree `F:\Monark-wt-ukemiconc`). Arbres de travail =
  clones jetables sous `F:\tmp\g2-ukemiconc\` : `clone` (base + 6 fichiers livrés), `base` (`2c276bb` pur), `tip` (`db86efc` pur),
  `merge` (fusion à blanc), `mut` (mes mutants), `wrk` (`dec704d` pur : rejeu du harnais du worker + oracle du commit).
- Aucun processus de course touché (aucun `kill`/`taskkill` émis pendant la revue). Aucune variable d'environnement affichée ; toute
  commande node/npm lancée avec les 8 clés payantes RETIRÉES (`env -u …`, ou suppression insensible à la casse dans les harnais).
- Toute preuve est rejouée par le relecteur ; aucun chiffre repris du G1. Le checkpoint-2 du même lot (commit `0383e5b`, vu par son SEUL
  sujet dans `git log` à 07:28Z, après mes mesures R-C-1) n'a PAS été ouvert : indépendance G2 ‖ cp-2.

## Journal (UTC, `date -u`)
- 06:35:55Z orientation : `F:\tmp\ukemiconc\G1.md`, `DELIVERED.sha256`, `R25.txt`, `oracle.sh`, `invariants.sh`, `mutants.mjs`,
  `ADR-amendement-UKEMI-CONC-1.md`, `docs/CONSIGNE-STANDARD-G1.md` ; code `pool.ts`, `prefetch.ts`, `rpc2.ts`, `record.ts`, `resume.ts`,
  `book.ts`, `packages/rpc-guard/src/{client,transport,ledger,cli,guarded}.ts`.
- 06:36:41Z clone `-b lot/ukemi-conc-1` : HEAD = `2c276bb` (le lot n'était pas encore committé) ; les 6 fichiers copiés du worktree :
  `sha256sum -c DELIVERED.sha256` 6/6 OK. 06:37:21Z `npm ci --ignore-scripts --cache F:/tmp/npm-cache` exit 0 ;
  `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-ukemiconc\clone\packages\rpc-guard\src\index.ts` (A-2). node v24.15.0.
- 06:4xZ (avant 06:49Z) advisor intégré n°1 (après orientation, avant travail substantiel) : **« The advisor timed out. Proceed without
  it. »** — consigné, poursuite sans avis.
- 06:49-06:51Z point 1 ; 06:50:07-06:51:46Z oracle du lot (clone) ; 06:50:39Z fusion à blanc (patch 3-way) ; 06:52:43-06:54:36Z oracle
  fusionné ; 06:55:39Z / 06:56:59Z `npm run test` sur `tip` et `base`.
- 06:58-07:01Z sondes (i)/(ii)/(iv)/(vii) ; 07:06:59-07:15:00Z mes 18 mutants ; 07:16:03-07:20:18Z rejeu du harnais du worker.
- 07:2xZ CONSTAT : le clone `wrk` (créé ~07:15Z) est à **`dec704d`** : l'orchestrateur a committé le lot sur `lot/ukemi-conc-1` à
  06:56:18Z (`2026-09-23T07:56:18+01:00`), PENDANT la revue. Blobs des 6 fichiers à `dec704d` (`git ls-tree`) == mes `git hash-object` du
  clone ⇒ le code revu EST `dec704d` ; `dec704d` ajoute aussi `docs/G1-lot-ukemi-conc-1.md` (sha256 `81a73540…` == `F:\tmp\ukemiconc\G1.md`).
  Re-vérifié sur `dec704d` : invariants, A-6, R-25 VERBATIM, oracle 7 gates (07:21:22-07:23:59Z), fusion `git merge --no-commit`
  (07:24:52-07:27:09Z oracle).
- 07:24:04Z expérience R-C-1 sur l'arbre fusionné (`rc1-pli.mjs`, restauration octet-exacte vérifiée).
- 07:28Z CONSTAT : `lot/etude-suite` = `d55fbb7` (après `6349db8`) ; `git diff --stat db86efc d55fbb7 -- . ':(exclude)docs'` = VIDE ;
  `git merge-tree --write-tree d55fbb7 dec704d` exit 0 (propre).
- 07:31Z re-jeu final de toutes les sondes cœur avec les versions FINALES des scripts (mêmes verdicts ; chiffres ci-dessous = ce re-jeu).

## 1. Diff du lot, blobs, invariants, A-6

`git diff --numstat 2c276bb dec704d` (et, avant le commit, `git diff --numstat 2c276bb` sur le clone, identique pour les 6 fichiers) :

| Fichier | + | − | sha256 (== `DELIVERED.sha256`) | blob (== `dec704d`) |
|---|---|---|---|---|
| `apps/sentinel/src/ukemi/pool.ts` (nouveau) | 52 | 0 | `2119cfd052f2…17e5` | `7f42396707f3…` |
| `apps/sentinel/src/ukemi/prefetch.ts` (nouveau) | 106 | 0 | `228eeb374549…f2a9` | `1e77402f403d…` |
| `apps/sentinel/src/ukemi/record.ts` | 30 | 3 | `a49bebb34cad…fe8c` | `68c1ee1964da…` |
| `apps/sentinel/src/ukemi/resume.ts` | 11 | 3 | `8954c497467c…9003` | `44bd3682a780…` |
| `apps/sentinel/src/ukemi/rpc2.ts` | 41 | 18 | `624bc437ae68…97eb` | `36d86d99b654…` |
| `apps/sentinel/test/ukemi-conc.test.ts` (nouveau) | 324 | 0 | `901af7724f50…004a` | `b75e2a389603…` |
| `docs/G1-lot-ukemi-conc-1.md` (nouveau, commit orchestrateur) | 319 | 0 | `81a73540b102…` (== G1 hors arbre) | — |

- Invariants : `git diff --quiet 2c276bb dec704d -- apps/sentinel/src/ukemi/book.ts docs/adr/ADR-U4b-calibration-episode-frais.md
  docs/PLAN-u4b-prereg.md apps/sentinel/test/fixtures package-lock.json packages scripts apps/bell` ⇒ **exit 0** (idem sur le clone avant
  commit). **0 test existant modifié** (`--diff-filter=M -- '*.test.ts'` vide). LF : `book.ts` `cb1ba53cbf15ca23…`, ADR-U4b
  `2675e54349fa8544…`, prereg `1971d9b14ce0adf8…`.
- **A-6** : les 9 gelés du prereg §2, `tr -d '\r' | sha256sum`, recomputés sur l'arbre du clone, sur les blobs `2c276bb`, `db86efc` ET
  `dec704d` ; comparaison PROGRAMMATIQUE aux 9 valeurs extraites de `docs/PLAN-u4b-prereg.md:116-124` : **9/9 identiques** (`diff` vide ;
  `proofs/A6-prereg-ref.txt`, `proofs/A6-clone-lf.txt`, `proofs/A6-dec704d-blobs.txt`).
- Hors gel : `record.ts`/`rpc2.ts` nommés hors gel par l'ADR-U4b (`:133-136`) ; `resume.ts`, `pool.ts`, `prefetch.ts` absents du §2 et de la
  fermeture transitive du jeu gelé (`docs/PLAN-u4b-prereg.md:130`). Consommateur gelé de la sortie : `u4b-reduce.mjs:41-48` ne lit que
  `book` et `provenance.book_digest` [lu] ⇒ la clé `provenance.concurrency` (D-8) est sans effet aval.

## 2. Sémantique — preuves rejouées

Sonde `probes/run.mjs` : `runRecorder` sur le chemin SERVI (VRAI `openGuardedClient`, verrous, ledgers, transport ; SEUL
`globalThis.fetch` bouchonné) ; corps JSON-RPC de forme réelle ; valeurs = octets de `weth-book.fixture.json` re-clés par MA synthèse
(rotation `i*3 mod 4`, solde aToken nul pour `i mod 8 = 0`, options : revert CONCORDANT de `description()` sur une réserve, plafond de plage
`getLogs` pour forcer la scission, 503 sur la 1re tentative d'une requête sur k, désaccord de quorum sur un compte). Jeu : 44 holders couvrant
les 4 genres (`at_risk 17, coll_off 11, no_debt 11, zero_bal 5`). Scripts : `probes/{run,scenarios,cmp,refuse}.mjs`, `probes/drive.sh`.

### (i) `--concurrency` absent ⇒ chemin séquentiel STRICTEMENT inchangé — preuve DIFFÉRENTIELLE pré-lot vs lot (`proofs/i-n1diff.txt`)
Mêmes scénarios exécutés sur l'arbre PRÉ-LOT (`base` = `2c276bb`) et sur le lot : **10/10 PASS, 176 contrôles OK**. Pour chacun : JSON de
sortie égal (profond ET ordre des clés) hors la clé déclarée `provenance.concurrency: 1` (D-8) ; diag égal ; **fichier `--resume` octet pour
octet ; ledgers `.jsonl` + `.head` octet pour octet ; SÉQUENCE des requêtes identique** (hôte, méthode, params, dans l'ordre) ; stdout/stderr
identiques (normalisés : `seconds=`, `ukemi_sha=`, suffixe mkdtemp) ; 1 fetch en vol des deux côtés. Scénarios : livre (d1), livre
`--resume` exécuté 2× (d2), filtre `--resume` (d3), 3 ms + scission `getLogs` (d4), 3 ms + 503 réessayés (d5), jambe payante factice
`cs-node.example.invalid` avec crédits RU au ledger (d6), **PIN plage complète** (d7 : `book_digest` = `034fbff9…b921` des deux côtés,
1 468 requêtes), revert `description()` (d8), arrêt `--max-calls 60` (d9 : exit 2, diag égal, pas de clé `pool` à n=1),
`--concurrency 1` explicite (d10 = absent). **Seuls écarts : de TEMPS, déclarés (F-1/F-2 → D-3/D-4)** — à 3 ms, pré-lot : d4 (scission
`Promise.all`) 6 + 5 émissions au même opérateur sous l'intervalle (min 0,41 ms), d5 (retry hors politesse) 0 + 31 (min 0,94 ms) ; lot : **0**
(min 5,63 / 3,88 ms et 8,72 / 3,79 ms). Le défaut F-1 préexistant à n=1 est REPRODUIT sur le pré-lot et levé par le lot, sans changer ni
l'ordre ni un octet. Mutants confirmant que la sonde discrimine : G2M5 (défaut 8) et G2M10 (préfetch à n=1 : 318 requêtes contre 160).

### (ii) digests n=1 vs n=8 sur le même jeu (`proofs/ii-n1n8.txt`) : **6/6 PASS, 131 contrôles OK**
Livre (c1), livre `--resume` + rejeu (c2), filtre `--resume` (c3), jambe payante (c6), **PIN plage complète à n=8** (c7 : `034fbff9…`),
revert `description()` (c8). Octet pour octet (`JSON.stringify`) : `book`, `book_digest`, `holders_digest`, `counts`, `hf_findings` (ordre),
`timeline` ; filtre : `holders`, `holders_digest`, `n_at_risk_config`, `excluded`, `projection_remaining_calls`. En plus : ledgers n=8
chaînés, `unlocked` dernier (une ligne par exécution), 0 verrou ; multiset des lignes de ledger n=8 == n=1 ; multiset des lignes `--resume`
n=8 == n=1 (136/136, 51/51) ; rejeu n=8 = **0 fetch** ; en vol : 1 à n=1, 8 à n=8 (4 pour c7 sans délai). **R-C-3 MESURÉ** (c8, une réserve à
`description()` en revert) : `calls` 160 → 162, +1 par opérateur, `eth_call` +2, `errors_by_operator` +1 par opérateur, `rpc_error_count`
2 → 4, +1 ligne `attempted` (0 crédit) par ledger ; champs porteurs de digest identiques — exactement la prédiction R-C-3 du G1.

### (iii) contrat de fenêtre : arrêt du dispatch, DRAIN avant relance ; schéma CHAIN-1 reproduit quand l'attente est retirée
- Doré : arrêt NON budgétaire sur le chemin LIVRE (s1 : désaccord de quorum sur `getUserAccountData` du clone 19, n=8, portail 20 ms,
  attente de 1,5 s après le retour) ⇒ `QuorumDisagreementError`, **ledgers chaînés, `unlocked` DERNIÈRE ligne, rien après** (126 requêtes,
  stable sur 3 exécutions) ; arrêts budgétaires b1..b4 : idem.
- **Mutant G2M1 (mien : `Promise.all` → `Promise.race` sur les voies)**, scénario s1 : `drpc.org.jsonl` ligne 61 = `unlocked` (prev
  `45c6e493fedf`) ; **ligne 62 = `attempted drpc.org|eth_call` avec prev `45c6e493fedf`** (head PÉRIMÉ de l'instance du client) ⇒ rejeu
  « prev mismatch » à l'index 62 ; mevblocker : 3 `attempted` après `unlocked`. C'est le schéma exact de l'incident CHAIN-1
  (`docs/CHANTIERS.md:963`). Arrêt budgétaire b4 sous G2M1 : 6 + 1 `refused` après `unlocked`, prev mismatch. Preuves :
  `proofs/iii-G2M1-s1_disagree_book_n8.json` (`9fa0b7fd1a83c7a1…`), `proofs/iii-G2M1-b4_maxcalls_n8_book_iv20.json` (`3262ae2d8dd8bfb5…`).
  G2M1 est aussi tué par 4 tests du lot (dont `…first_error_stops_dispatch_and_drains_before_rethrow`, `…budget_stop_drains_before_unlock…`).
- **Trou de test (→ C-G2-2)** : l'arrêt « à la prochaine lecture » d'une tâche MULTI-lectures (le `rd` de `prefetchBookReads`,
  `prefetch.ts:90`) n'a AUCUN test tueur : G2M8 (contrôle `signal.stopped` retiré du `rd` livre) est VERT sur les 11 tests du lot et sur 93
  tests de 10 fichiers existants ; seule ma sonde s1 le voit : **142 requêtes après le désaccord contre 126** (les tâches en vol déroulent
  tout leur plan après l'erreur fatale ; en course, des appels payants). Le test budget du lot est `--filter-only` (une lecture par tâche) ;
  la table §2 de l'amendement attribue pourtant cette propriété à M3/M3b. Preuve : `proofs/iii-G2M8-s1_disagree_book_n8.json`.

### (iv) portail : espacement par opérateur, retries compris ; `Date` gelé ; `performance.now` gelé (`probes/t-lot/g*.json`)
- g1 (n=8, 15 ms, 503 sur 1 requête sur 3 ⇒ 71 `rpc_errors` réessayés par `record.ts:343`, scissions `getLogs`) : 131 + 130 émissions,
  **0 écart < 15 ms** (min 15,43 / 15,47 ms ; horloge monotone lue DANS le fetch bouchonné, c.-à-d. au moment de l'émission).
- g2 (n=8, 15 ms, **`Date.now` gelé** comme le preload de `guard-scripts-u4`) : termine (2,5 s), 0 écart < 15 ms (min 15,39 ms).
- g3 (**`performance.now` gelé**, 10 ms, n=4) : **termine** (2,7 s) ; écarts ≈ 153,5 ms = borne « ≤ 10 sommeils » × granularité win32 ⇒ la
  borne que le G1 déclarait « déclarative » est OBSERVÉE sur le chemin servi (pas de boucle infinie). Cohérent avec G2M4 (portail sur
  `Date.now`) : sous `Date` gelé (g2) il reste VERT sur l'espacement (écarts ≈ 155 ms ≥ 15) — la borne seule empêche le blocage — et n'est
  tué que par la borne SUPÉRIEURE `< 8×IV` du test monotone du lot : l'horloge monotone retire la pénalité de ≈ 155 ms par émission ; ce
  vert de sonde n'est donc pas un survivant.
- g4 (`--slow-operator mevblocker.io --slow-interval-ms 40`, défaut 10 ms) : mevblocker min 45,6 ms, drpc min 13,6 ms ; g5 (2 opérateurs,
  20 ms) : **écart global min 0,36 ms** ⇒ opérateurs distincts NON sérialisés (U-4a C-5 tenu par le doré).
- Émission synchrone vérifiée à la lecture : `fn()` → shim (`record.ts`, `c.call` invoqué avant tout `await`) → `client.call`
  (`client.ts:131-134` : `meter` → `commit` → `transport(...)`) → `transport` (`fetch` appelé dans le 1er segment synchrone) ; le tampon
  `last` est donc posé APRÈS l'émission réelle.

### (v) `--resume` sous concurrence (c2, c3) : toutes les lignes parsent (136/136, 51/51) ; `ethCall` 131 lignes = 131 clés distinctes
(47/47 au filtre) ; multiset == n=1 ; rejeu = 0 fetch, même `book_digest`. Consommateurs du cache (`u4-redraw.mjs:52-61`, `parseResumeLines`) :
lecture par clé, insensible à l'ordre des lignes (l'ordre diffère à n>1, déclaré).

### (vi) refus PRÉ-VOL (`proofs/vi-refuse.txt`, exit 0)
`runRecorder` avec `--concurrency` `0`, `-3`, `2.5`, `x`, `""` : refus NOMMÉ, **0 fetch, dossier ledger VIDE (ni cycle, ni verrou, ni
ligne), ni `--out` ni diag**. `parseConcurrency` : refusés `0 -1 -0 1.5 2.0 1e3 0x8 +8 " 8" "8 " abc "" Infinity NaN 9007199254740992` et le
drapeau final sans valeur ; acceptés `1 8 08` (= 8) et `9007199254740991` (aucune borne haute : O-3) ; absent ⇒ 1. Mutants : G2M6 (0 accepté)
et G2M6b (parse après `openGuardedClient` : `ledgerDir=["cyc"]` + diag écrit) rouges.

### (vii) plafonds sous concurrence (chemin LIVRE, n=8, jambe payante factice) — `probes/t-lot/b*.json`

| Scénario | Arrêt | Plafond | Mesuré (`attempted`) | `refused` | Ledgers |
|---|---|---|---|---|---|
| b1 n=8 `--method-caps eth_call=40` | exit 2 `method_cap` | 40 `chainstack\|eth_call` | **40** | 7 (≤ 8) | chaînés, `unlocked` dernier, 0 `.lock` |
| b1 n=1 (référence) | exit 2 `method_cap` | 40 | **40** | 1 | idem |
| b2 n=8 `--max-ru 61` | exit 2 `run_credits` | 61 RU | **60 RU** (30 × 2) | 8 (≤ 8) | idem |
| b3 n=8 `--max-calls 45` | exit 2 `run_calls` | 45 | **45** (23 + 22) | 8 (≤ 8) | idem |
| b4 n=8 `--max-calls 45`, 20 ms | exit 2 `run_calls` | 45 | **45** | 8 | idem |

Aucun dépassement : vérification et incrément dans le même tour synchrone (`packages/rpc-guard/src/client.ts:107` `meter`, `:122` `commit`,
`:131-134` `call`), atomique sous le fil JS unique. Les lectures en vol au moment du refus finissent leur appel keyless (b1 : drpc 50
tentatives à n=8 contre 44 à n=1 — gratuites, bornées par `--max-calls`) puis reçoivent un `refused`. Le `finally` relâche les N verrous
(N = 2 : deux `unlocked`, 0 `.lock`).

## 3. Oracle 7 gates, R-25, harnais du worker, mes mutants

### Oracles (codes capturés directement, `oracle.sh` sha256 `d3f1734bdb71e11e…`)

| Arbre | HEAD / contenu | Gates | Tests (total / pass / fail / skip) |
|---|---|---|---|
| `wrk` | **`dec704d`** (commit du lot, status vide) | 7 × exit 0 (`oracle-dec704d/`) | **988 / 986 / 0 / 2** |
| `clone` | `2c276bb` + 6 fichiers (avant commit) | 7 × exit 0 (`oracle-lot/`) | 988 / 986 / 0 / 2 |
| `base` | `2c276bb` pur | `test` exit 0 (`oracle-base/`) | 977 / 975 / 0 / 2 |
| `tip` | `db86efc` pur | `test` exit 0 (`oracle-tip/`) | 1042 / 1040 / 0 / 2 |
| `merge` | `db86efc` + `git merge --no-ff --no-commit dec704d` | 7 × exit 0 (`oracle-merged-dec704d/`) | **1053 / 1051 / 0 / 2** |

Rapprochement : 988 = 977 + 11 ; 1053 = 1042 + 11. Les 2 sauts dans TOUS les clones : `sentinel_run_releases_chainstack_lock_on_sigterm`
(win32) et `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts absent (A-rawlogs.jsonl gitignored…) ») — d'où 1040 au lieu du
1041 mesuré dans `F:\Monark` (artefact présent là-bas). Piège d'outil noté : le reporter `spec` de node 24 préfixe le décompte par `ℹ`, pas
`#` ; le `TEST-COUNTS.txt` du G1 est VIDE pour cette raison (le décompte du G1 venait donc d'une lecture du log, pas de ce fichier).

### R-25 (`r25.mjs` : lit `.github/workflows/ci.yml:65`, ne remplace QUE la plage par `2c276bb...HEAD`, exécute ; `proofs/R25.txt`)
Dans `wrk` (HEAD `dec704d`) : `6 files changed, 564 insertions(+), 24 deletions(-)` ⇒ **588** (le G1 committé est exclu par
`:(exclude)docs/G1-lot-*.md`). < 600 (cible mission), < 1 150 (borne).

### Rejeu du harnais du WORKER, chemins seuls (`worker-mutants-replay.mjs`, sha256 `5ee0b057…` ; original `2ddb362b…` = celui de
l'en-tête de `F:\tmp\ukemiconc\logs\mutants-final.log` ; `diff` = les 2 lignes `TREE`/`TMPF` seulement)
Sur `wrk` = `dec704d` (commit) : BASELINE 11/11, tueurs visés verts sur le doré ; **19/19 KILLED byIntended**, restauration 19/19, doré final
intact, exit 0 (`logs/worker-mutants-replay.log`, sha256 `dce12f2c864e5214…`).

### Mes mutants (18, dont les 7 exigés) — `g2-mutants.mjs` (sha256 `44ae8e379c9d49eb…`), `logs/g2-mutants.log` (`bf26241ab1e31d58…`)
Arbre `mut` (= base + 6 fichiers ; doré == `DELIVERED.sha256` vérifié en tête) ; pré-vol : chaque substitution présente EXACTEMENT une fois ;
oracles : (1) `ukemi-conc.test.ts` en TAP (A-11, CRLF normalisé, noms lus sur `not ok`) ; (2) si (1) vert, 10 fichiers existants qui exercent
les modules du lot ; (3) sonde G2 nommée sur le chemin servi. Restauration octet-exacte 18/18, doré final intact.

| # | Exigence | Mutation | Verdict | Tué par / sonde |
|---|---|---|---|---|
| G2M1 | attente des en-vol retirée | `Promise.all` → `Promise.race` (voies) | TUÉ | 4 tests du lot ; s1 + b4 : CHAIN-1 |
| G2M2 | résultats non rangés par index | `out.push(...)` (ordre d'arrivée) | TUÉ | `…pool_bounds_in_flight_and_keeps_input_order` |
| G2M3 | portail par opérateur retiré | `interval >= 0 ⇒ fn()` | TUÉ | polite, monotone, retry ; g5 : 181 écarts < 20 ms |
| G2M3b | portail par opérateur (variante) | clé du portail = `"*"` (une file pour tous) | **SURVIT à la suite** | g5 seule : écart global min 24,56 ms (doré 0,36) |
| G2M4 | horloge `Date.now()` | `Date.now()` dans boucle et tampon | TUÉ | `…uses_the_monotonic_clock_under_a_frozen_date` |
| G2M5 | défaut n ≠ 1 | site d'appel : absent ⇒ 8 | TUÉ | `…n8_filter_and_book_are_byte_identical_to_n1` ; n1diff d1 |
| G2M6 | refus de 0 retiré | clause `n < 1` supprimée | TUÉ | `…concurrency_is_optional_default_1_and_fail_closed` |
| G2M6b | pré-vol (variante) | parse dans le `try`, après le client | TUÉ | idem ; `refuse.mjs` rouge |
| G2M7 | partage de lecture en cours retiré | `inflight.set` supprimé | TUÉ | `…resume_reader_is_single_flight_per_key` |
| G2M7b | partage (variante) | `.finally(delete)` supprimé | TUÉ | idem |
| G2M8 | arrêt à la frontière de lecture (livre) | `signal.stopped` retiré du `rd` livre | **SURVIT à la suite** | s1 seule : 142 vs 126 requêtes |
| G2M10 | n=1 strictement inchangé | préfetch livre aussi à n=1 | TUÉ | `…n8_…` ; n1diff d8 : 318 vs 160 requêtes |
| G2M12 | FIFO du portail | `await prev` retiré | TUÉ | polite, monotone, retry ; g1 : 168 écarts < 15 ms |
| G2M13 | retry dans le MÊME portail | portail partagé non passé au pool | TUÉ | `…retry_attempt_re_enters_the_gate` ; g1 : 78 |
| G2M14 | fenêtre bornée | `n + 1` voies | TUÉ | 5 tests |
| G2M16 | préfetch via le lecteur mémoïsant | préfetch livre sur `basePool` | TUÉ | `…n8_…`, `…resume_under_concurrency…` |
| G2M18 | parse décimal strict | garde `/^[0-9]+$/` retirée | TUÉ | `…fail_closed` (`1e3`) |
| G2M19 | opérateur lent D-4 dans le portail | `resolveInterval` non consulté | **SURVIT à la suite** | g4 seule : mevblocker min 14,2 ms (< 40) |

**15/18 tués par un test NOMMÉ du lot ; 3 survivent aux 11 tests du lot ET aux 93 tests de 10 fichiers existants** (G2M3b, G2M8, G2M19),
rouges uniquement par mes sondes ⇒ trous de test (C-G2-2, C-G2-3). Le code doré est correct sur les trois propriétés (sondes vertes).

## 4. Fusion à blanc contre `db86efc` (pointe de la mission ; code identique à `6349db8` et `d55fbb7`)

- Conflits : **0**. Trois méthodes concordantes : `git apply --3way --index` du patch du lot (06:50:39Z) ; `git merge-file` (base = blob
  `2c276bb`, ours = lot, theirs = `db86efc`) exit 0, octets identiques ; `git merge --no-ff --no-commit dec704d` sur `db86efc` : « Automatic
  merge went well » (aucun commit créé). `record.ts` fusionné : sha256 `606bf04bacb8ce34…`, blob `005388b50c45e274…`. Contre `d55fbb7` :
  `git merge-tree --write-tree` exit 0.
- Oracle de l'arbre fusionné : 7 × exit 0, **1053 / 1051 / 0 / 2 = 1042 (pointe, mesurée ici) + 11**. `test/guard-scripts-u4.test.ts`
  (ORACLE-HANG-1) et les `u4_oracle_path_*` verts ; durée du `test` 83,9 s (pointe seule 79,2 s) : l'injection `deps.sleep` de RETRY-3
  n'interagit pas avec le portail (tests RETRY à `--min-interval-ms 0`).
- **R-C-1 : NÉCESSAIRE.** Mesure sur l'arbre fusionné (`rc1-pli.mjs`, `proofs/rc1-pli.txt`), `--heartbeat-every 10`, 52 holders :
  SANS pli, n=8 livre (h1) ⇒ **0 ligne de battement** : le battement n'est PAS absent, il tombe tous les 2 000 holders (défaut codé dans
  `prefetch.ts`) et 52 < 2 000 — le défaut réel est un drapeau accepté et VALIDÉ puis silencieusement ignoré à n>1 ;
  n=8 filtre (h2) ⇒ 0 ligne `..prefetch`, puis 5 lignes `..filter` émises par la passe de REJEU (cache) — trompeuses ; n=1 filtre (h3) ⇒ 5.
  AVEC le pli ⇒ h1 : 5 lignes `..prefetch pass=book` (10..50, avec `t=`) ; h2 : 5 `..prefetch pass=filter` + 5 `..filter` de rejeu qui
  REPARTENT à 10 (la remise à zéro R-C-2 devient observable) ; h3 inchangé ; tests `ukemi-conc` + `ukemi-guard-record` + `ukemi-record`
  **43/43** (3 fichiers seulement — l'oracle 7 gates n'a PAS été rejoué sur l'arbre plié : il reste la gate du G7) ; restauration octet-exacte. Lien ADR-U4b `:1856` (à `db86efc`) **R-U-5** (« temps 2 sans battement ; `--heartbeat-every` accepté sans effet ;
  déclencheur AVANT le temps 2 ») : à n>1, le battement du préfetch livre EST le battement du temps 2 — il n'honore le drapeau qu'avec R-C-1.
- **Texte exact du pli** (`proofs/rc1/R-C-1.diff`, contre `record.ts` fusionné `606bf04b…` ⇒ après pli `ceffc3703ab298e9…`) :

```
@@ -429 +429 @@  (tickFor, ligne ..prefetch)
-  … concurrency=${String(concurrency)} calls={${perOp}} errors={${perErr}}\n`);
+  … concurrency=${String(concurrency)} calls={${perOp}} errors={${perErr}} t=${new Date(deps.now()).toISOString()}\n`);
@@ -438 +438 @@
-  … onTick: tickFor("filter"), report: poolReport }); …
+  … onTick: tickFor("filter"), every: args.heartbeatEvery, report: poolReport }); …
@@ -476 +476 @@
-  … onTick: tickFor("book"), report: poolReport });
+  … onTick: tickFor("book"), every: args.heartbeatEvery, report: poolReport });
```
  Cœur (C-G2-1) = les hunks `:438` et `:476` ; le hunk `:429` (`t=`) = renforcement C-G2-1b. Le `t=` aligne la ligne `..prefetch` sur la
  ligne `..filter` de HEARTBEAT-1 : sans lui, sur un temps 2 REPRIS, `rate=` compte les holders servis par le cache (le piège de
  `docs/ETAT-REPRISE.md:130`) et aucun horodatage ne donne le Δt du débit réel (la règle des 5 % en Δerreurs/Δappels, elle, reste
  calculable sans `t=` à partir des compteurs cumulés `calls={}`/`errors={}` de chaque ligne).

## 5. Amendement ADR proposé — exactitude contre le code, tuyaux, débit

Exact (vérifié contre le code et/ou par mesure) : défaut 1 / refus pré-vol / parse hors `parseUkemiArgs` ((vi)) ; préfetch borné +
consommateurs inchangés, digests identiques ((ii)) ; portail FIFO par `providerOf`, horloge monotone, ≤ 10 sommeils, tampon après émission,
libération avant la fin de l'appel, retries dans le même portail ((iv)) ; ≤ n en vol, index d'entrée, drain avant relance, `pool.suppressed`
avec `stripUrls` (`record.ts:505`) ((iii)) ; single-flight + appends synchrones ((v)) ; « Budget (choix documenté) » : ≤ 1 `refused` par
lecture en vol (≤ n) ((vii)) ; R-C-3 ((ii)). **Tuyaux** : entrée / sortie / état / 4 tests de composition sur le chemin servi — présents et
rejoués (oracles verts). Inexactitudes / manques à corriger AVANT insertion (→ C-G2-4) :
1. « Déclencheur d'usage : G7 de ce lot ET de UKEMI-RETRY-2/3 » et R-C-1 « au G7 du second lot » : RETRY-2/3 est FUSIONNÉ (`12b6dcd`, G7
   `db86efc`) ⇒ R-C-1 se plie à CE G7 (C-G2-1) ; ce n'est plus un résidu.
2. Relation à **R-U-5** absente : à écrire (n>1 : battement du temps 2 = `..prefetch pass=book`, période `--heartbeat-every` après C-G2-1,
   `t=` après C-G2-1b ; n=1 : R-U-5 inchangé).
3. Table §2, ligne « lectures lancées après le stop » : couverture attribuée à M3/M3b (drapeau au DISPATCH, chemin filtre) ; le drapeau « à
   chaque lecture » du chemin livre n'a pas de tueur (G2M8) ⇒ nommer le test de C-G2-2, ou déclarer « déclaratif ».
4. « la première erreur (dans le temps, équivalent séquentiel) » : à CLARIFIER — « équivalent séquentiel » vaut pour la mécanique (la
   fenêtre s'arrête à la première erreur comme la boucle séquentielle), pas pour l'identité de l'erreur : le holder et le code de sortie
   peuvent différer de n=1 (D-9) ; le préciser.
5. « Tallies … égaux à n=1 sauf R-C-3 » : vrai pour une course menée à terme ; sur un arrêt, + les appels des ≤ n−1 lectures en vol et ≤ n
   `refused` (mesuré b1 : drpc 50 contre 44).
6. Ripple : Bell SEUL cité ; `makeUkemiPool` est aussi consommé par les outils de course `scripts/census/u4-oracle-path.mjs:189`,
   `u4b/u4b-discover.mjs:106`, `u4b/u4b-probe-cutoff.mjs:97`, `u4b/u4b-select-episode.mjs:405` (+ `apps/bell/src/ethereum.ts:97`) : le
   portail FIFO s'y applique au ré-épinglage des arbres d'exécution (scissions cadencées, sorties inchangées : suites vertes).
7. Tuyaux « battement … (tous les 2 000) » ⇒ « tous les `--heartbeat-every` » après C-G2-1 (+ `t=` après C-G2-1b).
8. « rpc2.ts/record.ts/resume.ts hors gel, §3 de l'amendement 2026-09-21 » : ce §3 (`ADR-U4b:133-136`) ne nomme que `record.ts`/`rpc2.ts` ;
   citer pour `resume.ts`/`pool.ts`/`prefetch.ts` le prereg §2 et la fermeture transitive (`PLAN-u4b-prereg.md:130`).

**Débit — recompute** (le G1 porte les chiffres ; l'amendement porte la formule). Plafond : pool `eth_call` = {drpc, chainstack} pour
`--operators drpc.org,tenderly.co,chainstack` (`ETH_CALL_KEYLESS_LABELS` sans tenderly, `transport.ts:36` [lu] ; chainstack ajouté en queue,
`record.ts`) ; chaque lecture quorum-2 émet 1 appel sur CHACUN des deux ; portail ≥ `iv` entre émissions au même opérateur ⇒ **≤ 1000/iv
lectures/s** (10/s à 100 ms), SOUS réserve que les opérateurs soient portés en parallèle (vrai sur le doré, g5 ; non épinglé par test :
C-G2-3). Latence séquentielle MESURÉE (battements horodatés de l'essai 5, même ligne d'opérateurs et 100 ms,
`F:\course-ukemi\logs\record-t1-essai5.log`) : `t=06:48:29.998Z chainstack:535` → `t=07:08:21.845Z chainstack:3535` ⇒ 3 000 lectures en
1 191,8 s = **2,517 lectures/s ⇒ L = 0,397 s** ⇒ saturation dès n ≥ 10 × L = **3,97** : n = 8 sature (l'affirmation « quelques
travailleurs » du G1 est désormais MESURÉE). N : `67 191 × 3 160 / 14 000` = **15 166** (le G1 écrit 15 190) ; dernier battement de l'essai 5
(`21 500 → 4 870`) ⇒ 15 220. Lectures temps 2 ≈ 4,5 N ≈ 68 250-68 490 ⇒ **≈ 1,90 h au plafond** (n=8) contre **≈ 7,5 h en séquentiel**
(× L). Extrapolation (4,5 lectures/compte, N du temps 1 non terminé) — à remplacer par N mesuré.

## 6. Sécurité A-7

- Lignes AJOUTÉES de `src` (`proofs/lot-src.diff`, 437 l.) : 0 URL, 0 `process.env`, 0 `fetch(`, 0 `child_process`/`node:http(s)`/`undici`,
  0 nom de clé payante (les 3 occurrences de `env` = commentaires « no env »). Test neuf : hôtes `https://a.example`/`https://b.example`
  (jamais fetchés : `call` injecté), env `{}`. Lignes RETIRÉES : l'ancien `polite` et ses sites, l'appel direct, la lecture MISS — du code
  remplacé, **aucune assertion retirée**, aucun test existant touché. Non-ASCII : 1 ligne de commentaire (`≤`, D-10). `pool.suppressed`
  passe par `stripUrls` et reprend des messages déjà expurgés par le transport (B-1 inchangé).

## Corrections — LISTE FERMÉE

| # | Objet | Bloquante | Porteur | `error_origin` proposé |
|---|---|---|---|---|
| **C-G2-1** | Cœur R-C-1 (réponse à la question de la mission) : les 2 lignes `every: args.heartbeatEvery` du pli §4 (`:438`, `:476` de `record.ts` fusionné) + le test de composition qui les épingle (exigence D-1/D-3 de tout pli, pas une extension) : `runRecorder` n=8 `--heartbeat-every 10` (52 holders) ⇒ 5 lignes `..prefetch pass=book` ; `--filter-only` ⇒ 5 `..prefetch pass=filter` puis 5 `..filter` de rejeu repartant à 10 (ferme R-C-2) ; rejouer l'oracle 7 gates sur l'arbre plié | **OUI** (G7) : sans lui, `--heartbeat-every`, accepté et validé, est silencieusement ignoré à n>1 sur la seule phase réseau (battement figé à 2 000 holders) ; dépendance R-U-5 (Δerreurs/Δappels entre battements) | orchestrateur au G7 de fusion (ou pli worker) | `plan` (lots CONC et RETRY/HEARTBEAT-1 planifiés en parallèle ; composition différée par conception) |
| **C-G2-1b** | Renforcement recommandé, même pli : `t=${new Date(deps.now()).toISOString()}` sur la ligne `..prefetch` (`:429`, aligne HEARTBEAT-1 ; sans lui, pas de Δt pour le débit réel d'un temps 2 REPRIS, `rate=` comptant les HIT du cache) ; `every` OBLIGATOIRE dans `PrefetchOpts` (3ᵉ source du défaut 2000, famille O-2 du G2 RETRY) | non — sinon item formé, déclencheur : AVANT le lancement du temps 2 à n>1 | orchestrateur (ou pli worker) | `plan` |
| **C-G2-2** | Test tueur de l'arrêt « à la prochaine lecture » sur le chemin LIVRE : `runRecorder` n=8, arrêt NON budgétaire (désaccord de quorum) à mi-course, portail ≥ 20 ms ⇒ ledgers chaînés + `unlocked` dernier + requêtes après l'arrêt ≤ celles des lectures en vol ; mutant G2M8 rouge ; corriger la ligne de la table §2 | non (code correct, sonde verte) — à plier avec C-G2-1 ; sinon item formé, déclencheur : AVANT le lancement du temps 2 à n>1 | worker (pli) ; propriétaire orchestrateur | `implémentation G1` (tests) |
| **C-G2-3** | Deux assertions dans `…polite_gate_spaces_issues_per_operator_under_concurrency` : opérateurs distincts NON sérialisés (écart global min < IV/2) ; `slowOperators` honoré À TRAVERS `makePoliteGate` ; mutants G2M3b et G2M19 rouges | non — même pli que C-G2-2 ; sinon item formé, déclencheur : prochain lot touchant `rpc2.ts` | worker (pli) | `implémentation G1` (trou préexistant sur l'ancien `polite`, repris par la réécriture du portail) |
| **C-G2-4** | Texte de l'amendement ADR : les 8 points du §5 (RETRY fusionné, R-U-5, table §2, D-9, tallies à l'arrêt, ripple complet, battement, citation du hors-gel) | **OUI** pour l'insertion au G7 (le texte ne s'insère pas tel quel) | orchestrateur (insertion, R-20) | `plan` pour 1, 2, 7 (amendement écrit avant la fusion RETRY) ; `implémentation G1` pour 3, 4, 5, 6, 8 |

## Observations (non bloquantes, disposition formée)
- **O-1** Commit `dec704d` posé par l'orchestrateur pendant la revue : tout re-vérifié sur `dec704d` (§1, §3). Disposition : aucune.
- **O-2** Erratum G1 : N = 15 166 (pas 15 190) ; latence séquentielle mesurée L = 0,397 s (§5). Disposition : la ligne Sidecar du temps 2
  reprend ces valeurs recomputées (orchestrateur, au Sidecar).
- **O-3** Aucune borne haute sur n : coût d'un arrêt O(n) (≤ n `refused`, ≤ n−1 lectures en vol, drain jusqu'à n × iv par opérateur via la
  file FIFO). Disposition : item **UKEMI-CONC-BOUND-1** (borne ou phrase ADR « n ≤ 64 recommandé ; la ligne de course fixe n = 8 »),
  déclencheur : prochain lot touchant `pool.ts` ; propriétaire orchestrateur.
- **O-4** Commentaire périmé `apps/sentinel/test/ukemi-u4a.test.ts:149` (« polite() consults it » ; `polite` n'existe plus).
  Disposition : à corriger dans le pli C-G2-3 (commentaire seul) ; sinon au prochain lot touchant ce test.
- **O-5** Hôtes de test `.example` (A-4 dit `.invalid`) : TLD réservé, jamais fetchés. Disposition : aligner à la prochaine édition du test.
- **O-6** Piège d'outil mesuré : `grep -c $'\r'` via l'outil Bash a compté TOUTES les lignes d'un fichier LF (52/52) — le transport altère
  `$'\r'` (famille A-13) ; fins de ligne mesurées par node (`CRLF 0`). Disposition : proposition d'amendement A-13 (orchestrateur).
- **O-7** (préexistant, inchangé) une sous-plage sœur d'une scission `Promise.all` (`getLogsVia`) peut survivre au rejet de l'autre ; sur le
  chemin servi, `process.exit` (`record.ts:546`, `:552`) passe avant tout minuteur ⇒ aucune ligne après le `finally` ; seul un appelant
  programmatique gardant le processus vivant pourrait la voir. Disposition : aucune pour la course ; phrase dans les résidus de l'ADR (C-G2-4).

## Verdict

**PASS-AVEC-CORRECTIONS.** Le lot fait ce qu'il déclare, prouvé par exécution : chemin n=1 octet pour octet et requête pour requête
identique au pré-lot (10/10) ; digests n=8 == n=1 (6/6, PIN compris) ; drain avant relance (CHAIN-1 reproduit exactement quand il est
retiré) ; portail espacé ≥ iv par opérateur retries compris, sans blocage sous `Date` ou `performance.now` gelés ; plafonds tenus sous
concurrence ; refus pré-vol ; 0 conflit de fusion, oracle fusionné 1053/1051/0/2. Corrections bloquantes pour le G7 : **C-G2-1** (cœur
R-C-1 : 2 lignes `every:` + test de composition + oracle rejoué) et **C-G2-4** (texte ADR). C-G2-1b (`t=`, `every` obligatoire), C-G2-2 et
C-G2-3 (trous de test) : à plier dans le même pli, sinon items formés à déclencheur.

## Provenance
- Relecteur `claude-opus-5-5[1m]`, effort max ; 2026-09-23 06:35:55Z → 07:38:53Z ; mission G2 de l'orchestrateur (`claude-fable-5-1`) ;
  lot `dec704d` (base `2c276bb`) ; fusion à blanc contre `db86efc` (vérifiée propre contre `d55fbb7`).
- Advisor intégré : n°1 (après orientation, 06:4xZ) **timed out** ; n°2 (avant clôture, 07:3xZ, rendu déjà écrit) : verdict jugé soutenu ;
  avis RETENUS et appliqués — (a) scinder C-G2-1 en cœur bloquant (2 lignes `every:` + test) et renforcement C-G2-1b (`t=`, `every`
  obligatoire) ; (b) préciser que le pli n'a été rejoué que sur 3 fichiers de test (43/43), pas sur l'oracle 7 gates ; (c) préciser que sans
  le pli le battement n>1 tombe à 2 000 (h1 = 0 ligne car 52 < 2 000) ; (d) C-G2-4 point 4 reformulé « à clarifier » au lieu d'« inexact » ;
  (e) phrase sur G2M4 vert en g2 / tué par la borne `< 8×IV` ; (f) ajouter cette ligne PUIS recalculer le sha du rendu. Aucun avis écarté.
  Conseil, jamais verdict.
- SECRET-SCAN-1 appliqué d'avance à ce rendu (13 motifs extraits de `test/no-secret-in-repo.test.ts` à `dec704d`, jamais re-tapés ; `secretscan-g2.mjs`) : 0 occurrence.
- sha256 du rendu : dans `F:\tmp\g2-ukemiconc\G2.md.sha256` (un fichier ne peut pas porter son propre sha).

## Fichiers de preuve (tous sous `F:\tmp\g2-ukemiconc\`)
- Scripts : `oracle.sh`, `r25.mjs`, `g2-mutants.mjs`, `worker-mutants-replay.mjs`, `rc1-pli.mjs`, `rc1-diff.mjs`,
  `probes/{run,scenarios,cmp,refuse}.mjs`, `probes/drive.sh`, `probes/scen/*.json` (31).
- Oracles : `oracle-lot/`, `oracle-dec704d/`, `oracle-base/`, `oracle-tip/`, `oracle-merged/` (patch), `oracle-merged-dec704d/`.
- Journaux : `logs/g2-mutants.log`, `logs/worker-mutants-replay.log`, `logs/merge-apply.log`, `logs/merge-dec704d.log`,
  `logs/merge-tree-6349db8.log` (contre `d55fbb7`), `logs/npm-ci*.log`, `logs/final-probes-*.log`.
- Preuves : `proofs/lot.patch`, `proofs/lot-src.diff`, `proofs/lot-test.diff`, `proofs/A6-*.txt`, `proofs/i-n1diff.txt`,
  `proofs/ii-n1n8.txt`, `proofs/vi-refuse.txt`, `proofs/R25.txt`, `proofs/iii-G2M1-*.json`, `proofs/iii-G2M8-*.json`, `proofs/rc1-pli.txt`,
  `proofs/rc1/{record.merged.ts,record.pli.ts,R-C-1.diff}`, `proofs/rc1-*-h*.json`, `proofs/G1-committed.md`, `mergesim/`.
- Transcripts : `probes/t-base/`, `probes/t-lot/`, `mut-probes/`.
