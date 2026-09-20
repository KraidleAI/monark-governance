# G2 — revue fraîche du lot NARABI-OPS-1 (retry du sentinel, 3ᵉ opérateur Chainstack, rejeu de l'incident 2026-09-20)

**Relecteur G2 FRAÎCHE** (instance séparée, contexte frais), modèle résolu **`claude-opus-4-8[1m]`** (préfixe
`claude-opus-4-8` conforme, effort max ; R-1). Opus 5 banni, non utilisé. Date 2026-09-20.
Worktree `F:\Monark-wt-narabiops`, branche `lot/narabi-ops-1`, gel **`ef1cd42`** (base **`eac7eea`**, 1 commit).
Scratch `F:/tmp/g2-nops/` (TMP/TEMP/TMPDIR=`F:/tmp`, résolu `F:\tmp` mesuré) ; **aucun RPC live** ; aucune
variable d'environnement imprimée ; les tests utilisent des URL factices. Aucun commit, aucun workflow (R-20).
Un seul appel réseau : `curl https://monarkgate.tech/narabi/timeline.jsonl` (donnée publique, autorisé une fois
par la mission). Sortie à re-vérifier adversarialement (R-21) : chaque ligne porte sa commande rejouable.

## Verdict : **ACCEPTÉ (G2 PASS)** — 5 observations non bloquantes (OBS-1..5), zéro correction bloquante.
Les 10 axes de la mission sont vérifiés **par re-exécution**. Les **7 mutants** re-joués (harnais indépendant
`F:/tmp/g2-nops/mutants.mjs`) tuent chacun le test nommé **pour la bonne raison** (exit ≠ 0 **et** message
d'assertion exact), avec restauration **sha-exacte** et arbre propre. `npm run ci` complet vert **427/427**
(base 421 + 6), lancé une fois après contrôle qu'aucun `npm run ci`/`node --test` d'un autre worktree ne tourne.
R-25 = **423 ≤ 500**. `providerOf` byte-identique, `fleet.ts` intact, aucun secret dans l'arbre. Aucun
`error_origin` à ouvrir au G7.

## Intégrité du gel (préalable)
`git diff --name-status eac7eea..ef1cd42` = **13 fichiers** : les 12 livrables du PLI + `docs/G0-lot-narabi-ops-1.md`
(le plan, portant la seule ligne « C-11 appliqué au G1 » ; diff = 1 ligne ajoutée ; exclu R-25 en `docs/**/*.md`).
Rien hors isolation (aucun `apps/bell`, `apps/harness`, `.github`, `vocab-banned.json`, `fleet.ts`). Les 11
`sha256(LF)` recomputés (`tr -d '\r' | sha256sum`) sont **identiques** à la colonne du PLI (run.ts `f01e4e19…`,
rpc.ts `b9a476bf…`, timer `d84a08b5…`, service `9e83a033…`, sentinel-retry.test.ts `35051da5…`, ci-gates.test.ts
`aa5eebc3…`, no-secret.test.ts `f2ade09e…`, fixture `51716581a3…`, PROVENANCE `0a1408ce…`, ADR `d7d0fb21…`,
RUNBOOK `a81f1ed2…`).

## Revue 3 étapes (AgileCoder)
1. **Cohérence spéc↔code** : les livrables L-1, L-2, L-3, L-4, L-6 correspondent au G0 + amendement C-1..C-11
   (C-11 appliqué : L-5 sonde reportée au pli NARABI-OPS-1b). Codes de sortie (D1), 4 créneaux timer (D2),
   opérateur Chainstack hors dépôt (D3), URL jamais imprimée (D4), amendement daté d'ADR-M012 D5, table des
   codes de sortie et table des tuyaux : tous présents et conformes à l'incident (CHANTIERS §E, run 00:44 UTC
   `exit 0` masquant un jour perdu ; relance manuelle 04:58 UTC).
2. **Défauts/bugs** : aucun défaut fonctionnel. Le fail-closed du quorum (2 opérateurs distincts) est préservé ;
   `endpoints` est hors `hashedFields` (31 champs) donc l'expurgation ne touche pas `line_hash` ; la clé n'est
   lue qu'en `main()` via `poolEndpoints()`/`chainstackUrl()`, jamais dans `makeRpcPool` ni au scope module.
   Cinq points d'hygiène/documentation non bloquants (OBS-1..5).
3. **Lisibilité/maintenabilité** : en-têtes anglais dans `deploy/` et `scripts/` (lang:gate/export:check verts) ;
   sémantique des codes de sortie documentée (ADR + RUNBOOK) ; L-5 = item formé avec déclencheur et spec de
   reprise complète ; secret posé par stdin SSH + `sha256sum` des deux côtés (RUNBOOK, jamais `cat` distant).

## Tableau de vérification (C-G2-1..10 — toutes FERMÉES par re-exécution)

| # | Axe (mission) | Résultat re-mesuré | Preuve rejouable |
|---|---|---|---|
| C-G2-1 | **C-1 secret jamais imprimé** | `redactEndpoint` garde l'origine (scheme+host), jette path/query ; `publishedEndpoints` publie les 8 gratuits **verbatim** + le 9ᵉ **expurgé** ; erreur `defaultCall` = `HTTP <status> <origin>`. Test `sentinel_never_prints_endpoint_url` couvre l'**erreur** + l'unité de redaction ; **ligne écrite + stdout** couverts par `sentinel_chainstack_run_publishes_redacted_and_flags` (couverture complète sur 2 tests, OBS-3). **Grep** : 0 forme-secret (`chainstack.com/hex32`, `p2pify/hex`, `wss/hex`, `api-key uuid`) dans `apps/sentinel/**` + fixture ; `no_secret_in_repo` vert (arbre entier). | mutants **M2** (url brute dans l'erreur) + **M3** (9ᵉ non expurgé) rouges ; `grep -rnE '(core\.)?chainstack\.com/[0-9a-f]{32}\|p2pify\.com/[0-9a-f]+\|wss://…' apps/sentinel/` → 0 |
| C-G2-2 | **L-1 code de sortie** | `exitCode = report.stopped !== null ? 1 : 0` (run.ts:175). Cas re-joués : (a) `no_quorum` ⇒ **exit 1**, 0 ligne ; (b) rattrapage ⇒ **exit 0** ; (c) no-op « nothing due » ⇒ **exit 0** ; (d) **rattrapage partiel** ⇒ 2026-09-18 écrit **ET exit 1**. « waiting for finality » partage la branche `due=[]` ⇒ `stopped=null` ⇒ 0 (dueDays omet un jour non finalisé). | `sentinel_retry_replays_incident_and_exit_codes` vert (4 cas) ; branche finalité par `sentinel_gap_is_lag_not_skip` (l.214-215 « d2 not finalized => lag ») ; mutants **M1** (exit 0 forcé) + **M7** (partiel non écrit) rouges |
| C-G2-3 | **L-4 rejeu = `line_hash` réel** | `lineHashOf` recomputé sur les 3 lignes de la fixture : ligne 3 = **`f73c700642…`** (le hash publié 2026-09-19) ; chaîne `GENESIS → 09beb656 → ec4ce67e → f73c7006` intacte ; auto-vérification des 3 lignes. **Curl unique** du site = **byte-identique** à la fixture (`sha256(LF) = 51716581a3…`, 3 lignes). Run 3 idempotent (0 ligne, exit 0). | `F:/tmp/g2-nops/hashcheck.mts` → `ALL_HASH_CHECKS_PASS=true` ; `curl … timeline.jsonl \| tr -d '\r' \| sha256sum` = `51716581a3…` |
| C-G2-4 | **C-2 timer** | 4 `OnCalendar=` **séparés** valides `*-*-* HH:30:00 UTC` (00/03/06/09) ; `Persistent=true` ; aucune liste-virgule. `systemd-analyze` indisponible sous Windows ⇒ vérifié par **grammaire** (`*-*-* HH:MM:SS UTC` = syntaxe systemd.time valide, une expression par ligne) + test ; validation runtime = étape 4 du RUNBOOK (limite déclarée, non un contrôle sauté). | `sentinel_timer_has_retry_slots` vert ; mutant **M4** (un créneau supprimé) rouge |
| C-G2-5 | **C-3 `providerOf` byte-identique** | `git show eac7eea:…/rpc.ts` vs `ef1cd42` sur la fonction = **diff vide** ; quorum inchangé (`quorumTwo`, 2 opérateurs distincts, fail-closed, `providerOf` fusionne les alias). | `diff <(git show eac7eea:apps/sentinel/src/rpc.ts \| awk '/providerOf/,/^}/') <(git show ef1cd42:…)` vide ; `sentinel_quorum_disagreement_fails_closed` vert |
| C-G2-6 | **C-4 env lue en `main` seul** | `makeRpcPool` = `opts.endpoints ?? PUBLIC_ENDPOINTS` (ne lit jamais l'env) ; env lue via `chainstackUrl(env)`/`poolEndpoints(env)`/`hasChainstack(env)`, appelées **uniquement en `main()`** ; chemin `endpoints` injecté (tests) ne consulte jamais l'env. `chainstack: boolean` dans le JSON de fin. `sentinel_windows_identical_to_pull` vert (digest publié bit-identique). | `sentinel_quorum_accepts_chainstack_as_distinct_operator` (call+endpoints injectés, sans env) vert ; mutant **M6** (`chainstack:false`) rouge |
| C-G2-7 | **Mutants (≥ 4/7)** | **7/7** re-joués, harnais indépendant : chaque find-string unique (occ=1), mutation appliquée, `node --test --test-name-pattern` exit ≠ 0 **ET** message exact présent, restauration `git checkout` **sha-exacte** (before==after), `git status --porcelain` vide. | `F:/tmp/g2-nops/mutants.mjs` → `ALL_MUTANTS_RED_AND_RESTORED=true (7/7)` ; tableau ci-dessous |
| C-G2-8 | **Oracles + ci** | `gate:vocab` OK (171 fichiers) ; `typecheck` OK ; `lint` OK ; `lint:ratchet` 69/69 ; `lang:gate` OK (scope inclut `sentinel`) ; `export:check` OK (l'export `apps/sentinel/test/**` passe) ; **`npm run ci` = 427/427, 0 fail** (base 421 + 6), lancé **une fois** après contrôle d'absence de `ci`/`--test` d'un autre worktree (4-5 `node.exe` selon l'instant = serveurs MCP openalex + claude-mem, **aucun** portant `--test` ni `Monark-wt` ; les correspondances sur « test » sont des faux positifs internes au script bootstrap claude-mem). | logs `F:/tmp/g2-nops/{gate-vocab,typecheck,lint,lint-ratchet,lang-gate,export-check,ci}.log` |
| C-G2-9 | **R-25 ≤ 500** | Pathspec **exacte** `ci.yml:65` sur `eac7eea...ef1cd42` : `8 files changed, 398 insertions(+), 25 deletions(-)` ⇒ **423** (annoncé 423). 8 fichiers comptés ; PROVENANCE `.md` sous `fixtures/` **compté**, la fixture `.jsonl` **exclue**, docs `.md` exclus. | commande `git diff --shortstat … ':(exclude,glob)docs/**/*.md' …` reproduite |
| C-G2-10 | **CA-11 / branchement** | `fleet.ts`, `narabi-snapshot.ts`, `narabi-live.ts`, `vocab-banned.json`, `ci.yml` = **0 ligne de diff** ; `fleet_register_built_set_is_frozen` vert (`built == {Shōgen,Hikae,Ukemi,Narabi}` ; rien de nouveau built — Narabi déjà built à go 4). ADR : table des tuyaux avec **entrée/sortie/état/test/déclencheur** ; L-5 (sonde) = pli NARABI-OPS-1b, spec de reprise complète (§Deferral of L-5) ; RUNBOOK : secret par `ssh … stdin` + `sha256sum` des deux côtés, jamais `cat` distant, jamais `set -x`. | `git diff eac7eea..ef1cd42 -- apps/site/lib/fleet.ts` vide ; ADR §Tuyaux + §Deferral of L-5 |

## Tableau des mutants (7 re-joués, harnais G2 indépendant, restauration sha-exacte)

| # | Mutation (une ligne) | Fichier | Test rougi (nommé) | Message d'assertion attendu | occ | exit≠0 | msg vu | restauré sha-exact | arbre propre |
|---|---|---|---|---|---|---|---|---|---|
| M1 | `stopped!==null ? 1:0` → `? 0:0` | run.ts | `sentinel_retry_replays_incident_and_exit_codes` | `no_quorum => exit 1` | 1 | ✔ | ✔ | ✔ | ✔ |
| M2 | `${redactEndpoint(url)}` → `${url}` | rpc.ts | `sentinel_never_prints_endpoint_url` | `the error carries no key path` | 1 | ✔ | ✔ | ✔ | ✔ |
| M3 | `redactEndpoint(extra)` → `extra` | rpc.ts | `sentinel_never_prints_endpoint_url` | `the Chainstack endpoint is published redacted` | 1 | ✔ | ✔ | ✔ | ✔ |
| M4 | 1 `OnCalendar=` supprimé (4→3) | monark-sentinel.timer | `sentinel_timer_has_retry_slots` | `exactly four OnCalendar= slots` | 1 | ✔ | ✔ | ✔ | ✔ |
| M5 | `EnvironmentFile=-/etc/…` supprimé | monark-sentinel.service | `sentinel_service_reads_env_file` | `EnvironmentFile=-/etc/monark/sentinel.env present` | 1 | ✔ | ✔ | ✔ | ✔ |
| M6 | `chainstack: hasChainstack()` → `false` | run.ts | `sentinel_chainstack_run_publishes_redacted_and_flags` | `end JSON flags chainstack (C-4)` | 1 | ✔ | ✔ | ✔ | ✔ |
| M7 | `if (lines>0)` → `+ && stopped===null` | run.ts | `sentinel_retry_replays_incident_and_exit_codes` | `one line was appended (2026-09-18) despite the later stop` | 1 | ✔ | ✔ | ✔ | ✔ |

`ALL_MUTANTS_RED_AND_RESTORED = true` (7/7 rouges pour la bonne raison). Aucun mutant laissé dans l'arbre
(`git status --porcelain` vide après la passe).

## Chiffres
- **Tests** : `npm run ci` 427/427, 0 fail (base 421 + 6 nouveaux : `sentinel_retry_replays_incident_and_exit_codes`,
  `sentinel_never_prints_endpoint_url`, `sentinel_chainstack_run_publishes_redacted_and_flags`,
  `sentinel_quorum_accepts_chainstack_as_distinct_operator`, `sentinel_timer_has_retry_slots`,
  `sentinel_service_reads_env_file`).
- **R-25** : 423 (398 ins + 25 del), ≤ 500 (cible), ≪ 1 205 (plafond).
- **Mutants** : 7/7 rouges, restaurés sha-exact.
- **`line_hash` 2026-09-19** : `f73c700642b394c46ede6c930cff3186f516a9447190a16a57010bb10ad55b2c` (recomputé =
  publié = servi sur le site).
- **`digest` publié (`state.json`) 2026-09-19** : `cada7bf7279ed0a76a38215a09472e442c22a1dd63fac3a0d4b8aad7ef3903f4`
  (= `digest_T` de la ligne ; le rejeu L-4 cas (b) asserte `stateJson.digest === l3.digest_T`, second artefact
  servi bit-identique, item (6) de la mission).
- **hashedFields** : 31 champs (calque exact requis pour la spec de reprise de la sonde 1b).

## Observations non bloquantes (formées ; aucune ne bloque le G7)
- **OBS-1 (précision doc)** : `rpc.ts:3` (« Public RPC pool (no key, read-only) ») et `RUNBOOK-sentinel.md:5`
  (« public RPC, read-only, no key ») portent un descriptif « no key » global désormais légèrement imprécis (le
  pool PEUT porter un opérateur payé optionnel via l'EnvironmentFile). **Les deux cibles NOMMÉES par C-5**
  (`monark-sentinel.service` en-tête l.4, `no-secret-in-repo.test.ts` l.2-4) **ont bien été mises à jour** : la
  correction est complète selon son périmètre. Suggestion : clarifier ces deux descriptifs de base au prochain
  contact ; ne bloque pas (la gestion du secret est correcte et testée, `no_secret_in_repo` vert).
- **OBS-2 (doc)** : `--dry-run` propage le code de sortie (`run.ts:181` pose `process.exitCode = exitCode` avant
  `return`) ; un dry-run tombant sur un `stopped` sortirait 1. Comportement L-1 **correct**, mais absent de la
  table des codes de sortie de l'ADR et de l'étape 3 du RUNBOOK (« Expect JSON on stdout »). C-6 « `--dry-run`
  déclaré » est satisfait (`parseArgs` + commentaire). Suggestion : une ligne/row au prochain contact doc.
- **OBS-3 (traçabilité de test — C-1 était bloquant au checkpoint-1)** : le libellé de l'amendement C-1 (« asserte
  sur erreur + ligne + stdout ») se lit comme un test unique, mais la couverture est répartie sur **deux** tests.
  Elle est **complète** ; cartographie vecteur → test → ligne :

  | Vecteur C-1 | Test | Assertion |
  |---|---|---|
  | erreur (message) | `sentinel_never_prints_endpoint_url` | `sentinel-retry.test.ts:209` (`the error carries no key path`) |
  | ligne écrite servie | `sentinel_chainstack_run_publishes_redacted_and_flags` | `sentinel-retry.test.ts:227` (`the key path never appears in a written line (C-1 ii)`) |
  | stdout | `sentinel_chainstack_run_publishes_redacted_and_flags` | `sentinel-retry.test.ts:225` (`the key path never appears in stdout (C-1 iii)`) |

  Note : l'assertion stdout de `sentinel-retry.test.ts:147` (dans le run **keyless** du rejeu) est quasi-vacue ; le
  vrai contrôle stdout keyed est à `:225`. Consigné pour que le checkpoint-2 n'y lise pas un manque.
- **OBS-4 (PLI)** : la table « touched set » du PLI liste 12 fichiers ; le gel en touche **13** (les 12 + le plan
  `docs/G0-lot-narabi-ops-1.md`, une ligne « C-11 appliqué »). G0 est le sprint backlog, pas un livrable, et est
  exclu R-25 (`docs/**/*.md`). Consigné pour complétude ; non un défaut.
- **OBS-5 (branchement / CA-11)** : la table des tuyaux de l'ADR marque deux tuyaux « built (this lot) ». Réconcilié
  avec CA-11 : le registre public (`fleet.ts`) est **inchangé**, ces tuyaux sont **internes à Narabi** (déjà built
  à go 4) et chacun est couvert par un test d'intégration **non-LLM en sous-processus** (`env → rpc.ts` par les
  deux tests Chainstack ; `timer → run → timeline` par le rejeu L-4 sur le vrai `main`) — exactement ce qu'exige
  la règle Branchement. Le tuyau `timeline → probe` est correctement « absent — pli NARABI-OPS-1b ».

## Provenance
Généré par relecteur G2 fraîche, modèle épinglé `claude-opus-4-8` (effort max), 2026-09-20, worktree
`F:\Monark-wt-narabiops`, gel `ef1cd42` (base `eac7eea`). Réviseur = orchestrateur `claude-fable-5-1`
(vérification adversariale R-21) + validateur-humain (checkpoint-2). Aucun commit, aucun workflow (R-20).
Artefacts de preuve : `F:/tmp/g2-nops/{hashcheck.mts,mutants.mjs,live.jsonl,*.log}`. `error_origin` : aucun à
ouvrir au G7 (aucun défaut fonctionnel ; observations documentaires seules).
