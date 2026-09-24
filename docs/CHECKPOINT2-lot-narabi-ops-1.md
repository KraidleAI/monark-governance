# CHECKPOINT-2 — lot NARABI-OPS-1 (retry sentinel, endpoints publiés expurgés, Chainstack 3e opérateur via EnvironmentFile, rejeu local de l’incident)

Validateur-humain, modèle résolu (R-1) : `claude-fable-5-1` (Fable 5.1, effort high). Date : 2026-09-20.
Worktree `F:\Monark-wt-narabiops`, branche `lot/narabi-ops-1`, HEAD `9bf7c2d14c587d35bb8d65d659102c1391e5d121` (gel `ef1cd42` + commit G2),
base `eac7eea` ; merge-base avec `lot/etude-suite` (`7f6a07a`) = `eac7eea` ; `git merge-tree --write-tree 7f6a07a 9bf7c2d` = **CLEAN** (mesuré).
Contexte frais : artefacts seuls (jamais le fil du planificateur ni du worker). Aucun RPC live ; aucune variable d’environnement lue ni imprimée
(`CHAINSTACK_ETH_URL` jamais touchée) ; un seul `curl` public. Rejeu à froid sous `F:/tmp/cp2-nops/` (`TEMP/TMP/TMPDIR=F:/tmp`, `npm ci --cache F:/tmp/npm-cache`).

## 1. Artefacts lus (intégralement)
`docs/G0-lot-narabi-ops-1.md` (+ amendement C-1..C-11, C-11 appliqué), `docs/CHECKPOINT1-lot-narabi-ops-1.md`, `docs/PLI-lot-narabi-ops-1.md`,
`docs/G2-lot-narabi-ops-1.md`, `docs/adr/ADR-NARABI-OPS-1.md`, `docs/RUNBOOK-sentinel.md`, `apps/sentinel/src/run.ts`, `apps/sentinel/src/rpc.ts`,
`apps/sentinel/src/timeline.ts` (`hashedFields`/`lineHashOf`), `apps/sentinel/test/sentinel-retry.test.ts`, fixture + PROVENANCE,
`deploy/monark-sentinel.{service,timer}`, diffs `test/ci-gates.test.ts`, `test/no-secret-in-repo.test.ts`, `.github/workflows/ci.yml:65` (pathspec R-25),
`docs/CHANTIERS.md` (décisions 46, 54, 57 ; décision 58 par `git log` `76c82d8`).

## 2. Preuve d’innocuité (AM-2 bis/ter)
- AVANT : HEAD `9bf7c2d`, `git status --porcelain` vide, sha256(LF) des 14 fichiers du diff `eac7eea..9bf7c2d` consignés (`F:/tmp/cp2-nops-sha-before.txt`).
- APRÈS : HEAD identique, `git status` vide, **14/14 sha identiques** (`diff` vide avec `F:/tmp/cp2-nops/sha-after.txt`). Copie froide : `run.ts`/`rpc.ts`/`timer`
  identiques au worktree après les mutants (aucun mutant résiduel). Les 11 sha du PLI concordent (run.ts `f01e4e19…`, rpc.ts `b9a476bf…`, timer `d84a08b5…`,
  service `9e83a033…`, retry.test `35051da5…`, ci-gates `aa5eebc3…`, no-secret `f2ade09e…`, fixture `51716581a3…`, PROVENANCE `0a1408ce…`, ADR `d7d0fb21…`, RUNBOOK `a81f1ed2…`).
- Aucun `git` d’écriture, aucune écriture dans `F:\Monark*`. Chemin de rejeu : `F:/tmp/cp2-nops/{tree,hashcheck.mts,mutants.mjs,*.log,live.jsonl}`.
- Écritures déclarées sous `F:/tmp` mais HORS `cp2-nops/` (écart déclaré, aucune dans le dépôt) : `F:/tmp/cp2-nops-sha-before.txt` (snapshot AVANT, un cran
  au-dessus du dossier) et les répertoires `F:/tmp/narabi-retry-*` créés par `mkdtempSync` du test sous le `TMP=F:/tmp` imposé par la mission (20 après mes rejeux).

## 3. Chiffres re-mesurés (CA-9, rejeu à froid `git archive 9bf7c2d` → `F:/tmp/cp2-nops/tree`, `npm ci` exit 0, 282 paquets, Node v24.15.0)
| Oracle | Résultat |
|---|---|
| `gate:vocab` (§F) | OK, 171 fichiers, 0 revendication interdite |
| `typecheck` | OK |
| `lint` | OK |
| `lint:ratchet` | 69/69 |
| `lang:gate` | OK, 0 hit (scope inclut `sentinel`) |
| `export:check` | OK, 0 chemin interdit, 0 hit |
| Tests ciblés `apps/sentinel/test/*.test.ts test/ci-gates.test.ts test/no-secret-in-repo.test.ts` | **100/100, 0 fail** (attendu 100 — écart nul) ; les 6 nouveaux + `series_pinned_are_declared_and_hashed`, `no_secret_in_repo`, `fleet_register_built_set_is_frozen` verts |
| R-25 (pathspec exacte `ci.yml:65`, `eac7eea...9bf7c2d`) | `8 files changed, 398 insertions(+), 25 deletions(-)` = **423 ≤ 500** (plafond 1 205) |
| `lineHashOf` fixture (script indépendant important `timeline.ts` de la copie) | 3/3 MATCH ; chaîne `GENESIS → 09beb656… → ec4ce67e… → f73c700642…` intacte ; ligne 3 = `f73c700642b394c46ede6c930cff3186f516a9447190a16a57010bb10ad55b2c` ; `digest_T` = `cada7bf7…` |
| `curl` unique `https://monarkgate.tech/narabi/timeline.jsonl` | HTTP 200, 3 lignes, sha256(LF) `51716581a3…` = fixture = PROVENANCE : **byte-identique** |
| Champ `endpoints` des 3 lignes (fixture désormais exportée publiquement) | 8 URL publiques exactes, aucune forme de secret |
| `providerOf` `eac7eea` vs `9bf7c2d` | **diff vide** (C-3) |
| `fleet.ts`, `narabi-snapshot.ts`, `narabi-live.ts`, `apps/bell`, `vocab-banned.json`, `.github` | 0 ligne de diff (CA-11) |
| `npm run ci` complet | **non lancé** (réservé au G7 ; workers en vol) — conforme à la mission |

### Mutants rejoués (copie froide, harnais `F:/tmp/cp2-nops/mutants.mjs`, occ=1, restauration sha-exacte)
| # | Mutation | Test rougi | Message vu | Résultat |
|---|---|---|---|---|
| M1 | `stopped !== null ? 1 : 0` → `? 0 : 0` (L-1) | `sentinel_retry_replays_incident_and_exit_codes` | `no_quorum => exit 1` | TUÉ |
| M3 | `redactEndpoint(extra)` → `extra` (**URL brute dans la ligne écrite**, C-1) | `sentinel_chainstack_run_publishes_redacted_and_flags` **et** `sentinel_never_prints_endpoint_url` | `the key path never appears in a written line (C-1 ii)` | TUÉ — par l’assertion ligne servie, pas seulement l’unité |
| M2 | `redactEndpoint(url)` → `url` dans le message d’erreur de `defaultCall` | `sentinel_never_prints_endpoint_url` | `the error carries no key path` | TUÉ |
| M4 | un `OnCalendar=` supprimé (4→3) | `sentinel_timer_has_retry_slots` | `exactly four OnCalendar= slots` | TUÉ |
| M7 | `if (lines>0)` → `&& stopped === null` | `sentinel_retry_replays_incident_and_exit_codes` | `one line was appended (2026-09-18) despite the later stop` | TUÉ |
| **MD** (non joué par G2) | `process.exitCode = exitCode` supprimé dans la branche `--dry-run` (`run.ts:181`) | aucun (`sentinel-retry` + `sentinel` entiers) | — | **SURVIT** → OBS-2 est une revendication non testée (C-V-2) |

## 4. Jugements demandés par l’orchestrateur
- **C-1** : aucune forme de secret possible dans une ligne publiée ni un log — `publishedEndpoints` expurge à l’origine ; `defaultCall` réduit à `HTTP <status> <origin>` ; M2/M3 tués sur les trois vecteurs (erreur, ligne écrite, stdout) ; fixture exportée = 8 URL publiques. **Conforme.**
- **C-2** : 4 `OnCalendar=*-*-* HH:30:00 UTC` séparés, `Persistent=true`, aucune liste-virgule ; M4 tué. `systemd-analyze` indisponible hors systemd (limite déclarée, runbook étape 4 avant `enable`). **Conforme** (voir C-V-1 pour le cas « timer déjà actif »).
- **C-3** : `providerOf` diff vide. **Conforme.**
- **C-4/C-5** : env lue seulement via `chainstackUrl(env)` appelée par `poolEndpoints`/`publishedEndpoints`/`hasChainstack` depuis `main()` ; `makeRpcPool` = `opts.endpoints ?? PUBLIC_ENDPOINTS` ; `chainstack: boolean` dans le JSON de fin (M6 G2) ; `EnvironmentFile=-` conservé + commentaires C-5 mis à jour. **Conforme.**
- **C-6** : 4 cas rejoués sur le vrai `main` en sous-processus (no_quorum ⇒ 1/0 ligne ; rattrapage ⇒ 0 ; no-op ⇒ 0 ; partiel ⇒ 1 ligne ET exit 1) ; stub méthode-conscient. **Conforme** ; le cas `--dry-run` est déclaré mais non exercé (C-V-2).
- **C-7** : fixture réelle (site byte-identique), chaîne intacte, PROVENANCE sha épinglé, `series_pinned` vert. **Conforme.**
- **OBS-1..5 de la G2** : OBS-1 et OBS-2 sont des « dûs nus » (« au prochain contact ») ⇒ **corrections en-lot** (C-V-3, C-V-2) ; OBS-3/OBS-4 = consignées, rien à corriger ; OBS-5 = registre public intact mais libellé « built (this lot) » décrit un état post-déploiement ⇒ C-V-4.
- **R-25** : 423 ≤ 500. **Conforme.**
- **CA-11** : rien de nouveau built (`fleet_register_built_set_is_frozen` vert, `fleet.ts` 0 diff) ; sonde `upcoming`/« absent — pli 1b » avec spec de reprise complète et déclencheur (canal mail, décision 58). **Conforme sous C-V-4.**
- **Plan de déploiement vs décision 46 (« L-4 le prouve ? »)** : L-4 prouve la jambe **processus** (env → pool → ligne → code de sortie, sur le vrai `main`). Il ne peut pas prouver les trois jambes **systemd** (parse des 4 `OnCalendar`, injection d’`EnvironmentFile` dans le processus, lecture d’un fichier `root:sentinel 0640`) — non testables en local sans systemd. Le runbook couvre la première (`systemd-analyze calendar` avant `enable`) et montre la configuration de la deuxième (`systemctl show -p EnvironmentFiles`), mais : (i) il est écrit pour une **première installation** (`useradd`, drop-in J0, `enable --now`) alors que ce lot est un **redéploiement sur un timer vivant** avec état non vide ; (ii) il n’exige aucun observable **positif** (`chainstack: true`, `exit_code: 0`) au premier run ; (iii) le critère G0 n° 3 (premier run de chaque créneau consigné en JOURNAL) n’y figure pas. Secret : stdin SSH + `sha256sum` des deux côtés, jamais `cat`, jamais `set -x` — conforme au checkpoint-1 (8). ⇒ **Conforme sous C-V-1.**

## 5. Checklist CA-1..CA-11
| Règle | Verdict | Preuve |
|---|---|---|
| CA-1 | conforme | Chaque livrable retenu (L-1..L-4, L-6) a son test nommé et rejoué ; L-5 = item formé avec spec falsifiable (tests nommés dans l’ADR). |
| CA-2 | conforme | Aucune décision de valeur nouvelle : Chainstack = décision 43 ; sonde Bell = 57 ; canal mail = 58 ; report L-5 = C-11 (mécanique R-25). |
| CA-3 | conforme | ADR-NARABI-OPS-1 amende ADR-M012 D5 par référence datée ; aucun gate suspendu ; `npm run ci` complet explicitement réservé au G7 (pas une suspension). |
| CA-4 | conforme | Worker G1 → G2 fraîche (instance séparée) → checkpoint-2 (rejeu propre) ; aucun fan-out par débit. |
| CA-5 | conforme | MAST : 6 modes nommés avec contre-mesures (dont C-9 : secret dans la provenance publiée ; dérive de l’ordre de hash — reportée avec la sonde). |
| CA-6 | conforme | Oracle d’exécution rejoué par moi (100/100, 6 gates, 5 mutants) ET revue G2 (10 axes, 7 mutants) — les deux, jamais l’un sans l’autre. |
| CA-7 | **correction** | OBS-1/OBS-2 = dûs nus (C-V-2, C-V-3) ; MD survivant = revendication non testée (C-V-2). L-5 et alerte = items formés. |
| CA-8 | conforme (G7 dû) | PLI : `claude-opus-4-8[1m]` ; G2 : `claude-opus-4-8[1m]` instance séparée ; `error_origin` : aucun. Entrée JOURNAL-PROVENANCE absente de la branche (0 mention) — attendue au G7 (C-V-5). |
| CA-9 | conforme | Tout re-exécuté sous `F:/tmp/cp2-nops/` (copie `git archive`, `npm ci`), chiffres ci-dessus. |
| CA-10 | conforme | Aucun argument de vitesse. |
| CA-11 | conforme sous C-V-4 | Registre public inchangé ; tuyaux déclarés avec entrée/sortie/état/test/déclencheur ; libellé « built (this lot) » à corriger (état réel = code branché, déploiement non fait). |

## 6. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée)
- **C-V-1 (runbook, redéploiement sur timer vivant — décision 46 / G0 critère 3).** Ajouter une section « Redeploy (lot NARABI-OPS-1) on a LIVE timer » :
  archive `apps/` depuis HEAD → `npm ci` → `cp` des deux unités → `systemd-analyze calendar` ×4 (STOP si invalide) → pose du secret (stdin SSH, `sha256sum` deux côtés)
  → `systemctl daemon-reload` → **`systemctl restart monark-sentinel.timer`** = choix sûr par défaut sur un timer déjà actif (`enable --now` est le chemin de
  première installation ; que `daemon-reload` seul recalcule ou non les échéances d’un timer actif : **non vérifié ici**, aucune source consultée — le `restart` rend
  la question sans objet) → `systemctl list-timers` doit montrer une prochaine échéance cohérente avec les 4 créneaux → **attendre** un run immédiat possible :
  sous `Persistent=true` ([abs], extrait cité au CHECKPOINT1 §2(2)), un `restart` en journée peut déclencher tout de suite si une échéance nouvelle est déjà passée
  depuis le dernier déclenchement stocké — inoffensif par L-4 (no-op « nothing due » ou rattrapage légitime), à consigner comme premier run, pas à s’en étonner
  → **ne PAS** re-poser le drop-in J0 (état non vide, `j0Source: state`) → premier run : `journalctl` doit montrer **`chainstack: true`** et `exit_code: 0`
  (observable positif = preuve que la jambe systemd est branchée) → le premier run de **chacun des 4 créneaux** consigné en JOURNAL (sortie JSON, `chainstack`,
  `exit_code`, `processedDays`).
- **C-V-2 (OBS-2 mesuré, CA-7).** Le mutant « `process.exitCode` supprimé en `--dry-run` » survit : ajouter un cas (e) à `sentinel_retry_replays_incident_and_exit_codes`
  (ou un test court) : `--dry-run` avec `STUB_FAIL_ETH_CALL_FROM=all` ⇒ exit 1, `dryRun: true`, 0 ligne, state dir inchangé ; puis une ligne « `--dry-run` :
  même sémantique, rien d’écrit » dans la table des codes de sortie de l’ADR et à l’étape 3 du RUNBOOK. Le mutant MD doit rougir ensuite. (~10 lignes ; R-25 ≈ 433 ≤ 500.)
- **C-V-3 (OBS-1, CA-7).** `rpc.ts:3` et `RUNBOOK-sentinel.md:5` : « no key » → « read-only ; optional keyed 9th operator via out-of-repo EnvironmentFile (ADR-NARABI-OPS-1) ». Deux lignes.
- **C-V-4 (OBS-5, CA-11 libellé).** Colonne Trigger de la table des tuyaux ADR : « built (this lot) » → « built (code + test non-LLM) ; **branché au déploiement** — preuve
  = entrée JOURNAL du premier run avec `chainstack: true` et 4 créneaux observés (C-V-1) ». Même preuve pour CA-11 et décision 46.
- **C-V-5 (CA-8, au G7).** Entrée JOURNAL-PROVENANCE : modèles résolus (`claude-opus-4-8[1m]` G1 et G2 ; `claude-fable-5-1` checkpoints/orchestrateur), `error_origin: none`,
  puis les entrées de déploiement de C-V-1. Condition de clôture, pas un défaut du lot.

Pas d’ESCALADE : aucune décision de valeur ou de périmètre nouvelle (46, 57, 58 déjà prises) ; checklist et G2 convergent (G2 ACCEPTÉ, 0 correction bloquante ; mes
corrections portent sur des observations que la G2 a laissées en « dû nu » et sur un mutant qu’elle n’a pas joué).

**Relayé à l’orchestrateur (hors verdict, non bloquant)** : (i) si l’hôte Chainstack réel est de la forme `*.p2pify.com`, `providerOf` rend `p2pify.com` (toujours distinct
des 8 gratuits — le quorum tient) mais l’ADR D3 dit « `chainstack.com` » et l’origine publiée porterait l’identifiant de nœud dans l’hôte : à confirmer au déploiement
sans imprimer la variable (vérification hors transcript) ; (ii) le test `sentinel-retry` laisse ses `mkdtempSync` (`narabi-retry-*`) sous `os.tmpdir()` (20 répertoires
après mes rejeux) — un `after()` avec `rmSync` en 1b (même fichier).

## 7. AM-1 — ce que la checklist a attrapé
Mutant `--dry-run` survivant (OBS-2 = revendication non testée) ; runbook écrit pour une première installation alors que le lot est un redéploiement sur timer vivant
(`enable --now` no-op, J0 à ne pas re-poser) ; aucun observable positif `chainstack: true` exigé au premier run ; G0 critère 3 (JOURNAL par créneau) absent du runbook ;
OBS-1/OBS-2 laissées en dû nu ; libellé « built (this lot) » avant déploiement. Manqués : à renseigner par l’orchestrateur a posteriori.
