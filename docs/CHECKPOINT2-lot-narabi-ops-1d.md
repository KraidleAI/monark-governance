# Checkpoint-2 NARABI-OPS-1d (e12f59f) — ACCEPTE-AVEC-CORRECTIONS

Modèle résolu : claude-fable-5-1

# CHECKPOINT-2 — LIVRABLE — lot NARABI-OPS-1d (`lot/narabi-ops-1d` @ `e12f59f`, base `lot/etude-suite` @ `f6442fe`)

## 1. Artefacts lus et rejeu (AM-2 ter, contexte frais — G2 ignoré, aucun chiffre du G1 consommé sans rejeu)

Lus : `F:\tmp\nops1d\MISSION-G2-CP2.md`, `MISSION-G1.md`, `G1.md`, `DELIVERED.sha256`, `mutants.mjs` ; dans le clone : `docs/CHECKPOINT1-lot-narabi-ops-1d.md`, `docs/CHANTIERS.md` (ruling 04:3x UTC, décisions 118/121/133, journal U-4b-1b-3, G7 UKEMI-RETRY-1), `docs/adr/ADR-U4b-…md` (D4), `apps/sentinel/src/{run.ts,rpc.ts,keyless-transport.ts}`, `apps/sentinel/test/{sentinel-chainstack-guard,sentinel-catchup-budget,sentinel-retry}.test.ts`, `test/{rpc-guard-fetch-only-inside-client,probe-narabi}.test.ts`, `deploy/monark-sentinel.service`, `packages/rpc-guard/src/{guarded,cli,client,transport}.ts`, `.github/workflows/ci.yml`, `apps/sentinel/package.json`, `scripts/export-public.mjs`.

Rejeu : clone `git clone --no-hardlinks --branch lot/narabi-ops-1d F:\Monark F:\tmp\cp2-nops1d\tree` (HEAD `e12f59f`), `mk-nm.ps1` ⇒ `entries: 220 monark: 10 fail: 0`, `require.resolve('@monark/rpc-guard')` → `F:\tmp\cp2-nops1d\tree\packages\rpc-guard\src\index.ts` (A-2). `TEMP/TMP/TMPDIR=F:\tmp\cp2-nops1d\tmp`. Logs : `F:\tmp\cp2-nops1d\logs\{ci,lint,ratchet,lang,export,mutants-g1,mutants-g1-tap,mutants-cp2}.log`. Harnais à moi : `F:\tmp\cp2-nops1d\{mutants-cp2.mjs,mutants-g1-tap.mjs,mut-v5.mjs,probe-floor.mjs}`.

**Preuve d'innocuité (AM-2 bis/ter)** — `F:\Monark` AVANT/APRÈS : HEAD `f6442fe`, `git status --porcelain` = 0 entrée, `git stash list` = 0, `sha256 apps/sentinel/src/rpc.ts` = `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` (identique) ; `F:\Monark-wt-nops1d` : HEAD `e12f59f`, status 0 ; clone : status 0 après tous les rejeux, `sha256sum -c DELIVERED.sha256` 8/8 OK ; aucun `narabi-guard-*` sous `C:\Users\KACIMI\AppData\Local\Temp` (0). Aucun `git` d'écriture, aucune installation (pas de `docker pull`, pas de node WSL).

## 2. Vérifications refaites (mission items 1-8)

1. **Diff** `f6442fe..e12f59f` = 8 fichiers, +604/−93 ; `apps/sentinel/package.json` inchangé (`@monark/rpc-guard` déjà dépendance). **9 gelés** recomputés LF depuis le blob `e12f59f` : `u4b-scores 2f9a31f6`, `u4b-reduce a5e66cd3`, `record-u4b-calib 5733daeb`, `wadray 7bee76fc`, `abi 3376eb08`, `l1-split 9206df91`, **`rpc.ts 0e232519` (== gel D4)**, `calib-digest 3603265d`, `u3-realized cb020425` ; `git diff --stat` sur les 9 + `docs/adr` = vide.
2. **Clé lue par le transport seul** : grep `CHAINSTACK_ETH_URL` dans `apps/sentinel/src/**` = 2 hits, tous dans `rpc.ts:50/:54` (mort) ; les appelants de `chainstackUrl/poolEndpoints/publishedEndpoints/hasChainstack/defaultCall` hors `rpc.ts` = **uniquement** `sentinel-retry.test.ts:17/217/222/268` (unitaires, co-édits prévus §11-1) + commentaires ; `run.ts` lit exactement `MONARK_SENTINEL_{BUDGET_S,DIR,J0}` + `CHAINSTACK_{CYCLE_ID,ETH_ORIGIN,CYCLE_FLOOR}` (test `sentinel_no_clock_env_is_read` vert) et passe `process.env` entier à `openGuardedClient` (`transport.ts:106` résout la clé). Fuite : e2e asserte `DO_NOT_PUBLISH` absent de stdout et de la ligne écrite — vert.
3. **Garde** : write-ahead prouvé à l'exécution (le stub fetch compte les lignes du ledger sur disque AVANT de répondre : 1) ; mutant `paid_leg_raw_fetch` rouge par `…writes_ledger_line_before_fetch` ; D-degrade (parent ledger absent ⇒ `ledger_error`, exit 0, 7 endpoints) vert, mutant `no_degrade_try_catch` rouge ; D-lock `finally` prouvé par `re_acquires_lock_after_clean_exit` + mutant `no_lock_release_in_finally` rouge ; **D-lock SIGTERM : voir C-V-1 (aucune trace d'exécution nulle part)** ; C-6 origine publiée SSI garde ouvert : test + mutant `origin_published_without_open` rouge.
4. **Grep** : portée `apps/sentinel/src/**` (test exige la présence de `run.ts/rpc.ts/keyless-transport.ts/timeline.ts/windows.ts` + ≥ 8 `ukemi/*.ts`), `SENTINEL_ALLOW` = 2 entrées avec déclencheur, non-vacuité PAR entrée (`:176-180`) ; mutants `env_key_read_in_run_ts` et `keyless_transport_delisted` rouges par `sentinel_src_clean_and_allowlist_load_bearing` **et** `fetch_only_inside_client`.
5. **Mutants** : 10 du G1 rejoués sur le clone ⇒ `ALL MUTANTS KILLED + RESTORED BYTE-EXACT`, exit 0 ; rejoués une seconde fois avec reporter TAP ⇒ chaque rouge est **attribué au test nommé** (log `mutants-g1-tap.log`). **8 à moi** (§3, CA-6).
6. **Oracle** `env -u …(8 clés) npm run ci` ⇒ exit 0, **931 tests / 929 pass / 0 fail / 2 skipped** (= 921 de la base + 10 nouveaux) ; skips nommés et motivés : `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) et `u4b_labels_replay_via_main_real_artifact` (artefacts e2 gitignorés, pré-existant). `lint` 0, `lint:ratchet` 69/69 exit 0, `lang-gate` 0, `export:check` 0. **R-25** pathspec `ci.yml:65` verbatim ⇒ 604+93 = **697 < 1 150**.
7. **Amendements §11-§12** : complets en substance, mais **non datés** et sans table de tuyaux par amendement (les tuyaux sont dans G1 §4) — correction de forme à l'insertion (C-V-4) ; l'amendement ADR-U4b tel qu'écrit suppose APRÈS ≠ AVANT au rebase, ce qui n'est vrai que sous l'ordonnancement (a) ci-dessous.
8. **Branchement** : voir CA-11.

## 3. Mes mutants (harnais `mutants-cp2.mjs` + `mut-v5.mjs`, `env -u`, restauration sha vérifiée à chaque fois)

| Mutant | Résultat | Test tueur (TAP) |
|---|---|---|
| V1 `network:"ethereum-mainnet"` omis | **TUÉ** | `…ok_ledgers_publishes_origin_and_releases_lock` |
| V2 ledger sous `public/` (servi) | **TUÉ** | idem + `re_acquires_lock…` |
| V3 `ledger_error` reclassé `config_error` | **TUÉ** | `classifier_is_a_closed_set` + `guard_open_failure_degrades…` |
| V8 `unlock --op helius` (mauvais opérateur) | **TUÉ** | `…releases_lock` + `re_acquires_lock…` |
| V4 origine NON requise pour servir la jambe | **SURVIVANT** (3 suites vertes) | lacune de couverture : « cycle posé + origine absente ⇒ `unconfigured` » est déclaré (`run.ts:283-285`) mais jamais testé ; `guardEnv(opts.origin/cycle/url)` est un paramètre mort. Sous le mutant, `endpoints` publié contient `null`. |
| V5 regex floor supprimée | **SURVIVANT** | lacune : le code réel donne `config_error` pour `abc`/`12.5`/`-3` (sondé, `probe-floor.mjs`) ; sous le mutant `assertLimits` attrape NaN mais **accepte un floor négatif** — la regex est porteuse et non testée. |
| V6 handler SIGTERM non installé | **SURVIVANT** (attendu win32) | voir C-V-1. |
| V7 label fermé laissé dans le pool | survivant **équivalent** | le label rejette et est benché, aucun effet servi — pas un défaut. |

## 4. Checklist

| Règle | État | Preuve |
|---|---|---|
| CA-1 | conforme | Chaque tâche L-1a..L-5 reformulable en une phrase et falsifiée par un test nommé + mutant rouge attribué (§2-5, §3). |
| CA-2 | conforme | Aucune décision de valeur nouvelle prise par le worker ; option 1 (121) = ruling orchestrateur consigné. **Clause** : voir C-V-0 (une fusion/redéploiement avant la suppression §11-1 en créerait une). |
| CA-3 | correction | Amendements ADR proposés (R-20, non insérés) : ADR-U4b à réécrire selon l'ordonnancement retenu (C-V-4) ; aucun gate suspendu (R-22). |
| CA-4 | conforme | Mono-worker G1, G2 ‖ checkpoint-2 ; aucun fan-out de débit. |
| CA-5 | conforme | §14 : FM-2.4 (contré A-8 corps réels — vérifié `_consumes_real_form_bodies`), FM-3.3 (contré `env -u` — appliqué à mon oracle et à tous mes mutants). |
| CA-6 | **correction bloquante** | Oracle re-exécuté + revue G2 en parallèle ; MAIS le chemin **D-lock SIGTERM** n'a **aucune trace d'exécution** : skip win32 ; CI `gates` = `on: pull_request` seulement (`ci.yml:18-19`), branche non poussée, fusions locales `--no-ff` sans PR ⇒ le « RUNS sur CI Linux » du G1 est faux pour cette ligne de branches ; mon mutant V6 survit dans la suite exécutée. Le `finally` est prouvé indépendamment (test vert + mutant tué). |
| CA-7 | conforme (+ re-formation) | 8 items formés avec propriétaire + déclencheur ; le déclencheur de §11-1 (« au rebase, AVANT G2 ») est périmé par la mission — à re-former (C-V-0). |
| CA-8 | conforme | R-1 `claude-opus-4-8[1m]` ; générateur ≠ relecteur ≠ validateur ; DEV-1..5 déclarées avec `error_origin` (DEV-2 = plan). |
| CA-9 | conforme | Clone isolé, `node_modules` re-pointé, `env -u`, codes hors pipe, mutants rejoués + attribués par moi. |
| CA-10 | conforme (+ garde) | Aucun argument de vitesse dans le lot ; 697 lignes. La décision 133 (« fin des tâches en vol ») ne doit pas devenir un argument de vitesse pour l'ordonnancement (c) ci-dessous. |
| CA-11 (+ durci) | conforme | Composition EXÉCUTÉE depuis l'artefact réel : `spawnSync(node --import <stub fetch> run.ts --state <tmp>)` sur la fixture committée `narabi-timeline-2026-09-19.jsonl`, garde RÉEL (vrai `.lock`, vrai ledger chaîné `verifyCycleLedger`), seul `globalThis.fetch` bouchonné, `line_hash` reproduit, origine `chainstack.com` 8ᵉ endpoint, ledger `network:"ethereum-mainnet"`, ligne `unlocked`, `.lock` absent ; producteur→sonde composé par `probe_chainstack_present_from_real_producer_line`. Tuyaux déclarés (G1 §4) ; état **`upcoming` jusqu'au 2ᵈ redéploiement**, `built` à la 1ʳᵉ ligne JOURNAL réelle — honnête. Ledger : consommateur premier = le garde lui-même (caps/refus) + `unlock` servi ; rapprochement A-4 manuel = item §11-5 formé. `uses_20s_timeout` est un test de forme mais pinne une constante, pas un branchement — admissible. |
| Anti-close Bell | n-a | Lot non Bell ; aucune valeur de marché dans le diff. |

## 5. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée)

- **C-V-0 (ordonnancement — déjà tranché trois fois, je le TIENS, je ne l'ajoute pas)** : `e12f59f` est accepté comme **état STAGED**. Le G1 §4 ligne 3 déclare le 2ᵈ redéploiement « après clôture temps 1 + course U-4b-1b » ; checkpoint-1 C-1 et le ruling 04:3x UTC disent « fusion APRÈS clôture -1b ». Deux ordonnancements admissibles, tous deux à UN second redéploiement (118) : **(a)** tout attend la clôture, §11-1 appliqué au rebase, G2-delta + re-checkpoint-2, puis G7 + fusion + redéploiement ; **(b)** G7 + fusion maintenant, redéploiement **seulement** après le pli §11-1 (G2-delta + re-cp2 propres). **(c)** redéployer AVANT la suppression §11-1 impose soit un 3ᵉ redéploiement (hors 118 : « un second », 92 amendée « pour ce seul motif »), soit VPS ≠ archive (C-5 hache `rpc.ts`) ⇒ **ESCALADE-INVESTISSEUR pré-formée**, question fermée : « Autoriser un troisième redéploiement du VPS site (amendement des décisions 92/118) pour retirer le code mort de `rpc.ts` après la course, ou accepter une divergence déployé ≠ archive jusqu'au prochain redéploiement motivé, ou attendre la clôture (a/b) ? ». Si l'orchestrateur choisit (a) ou (b), aucune escalade.
- **C-V-1 (bloquante avant G7, CA-6, portée Q3(i))** : produire une **trace d'exécution Linux** de `apps/sentinel/test/sentinel-chainstack-guard.test.ts` sur le sha rebasé (docker `node:24` ou node sous WSL — acte orchestrateur, installation qui m'est interdite ; ou PR brouillon déclenchant `gates`), montrant `sentinel_run_releases_chainstack_lock_on_sigterm` **vert** et, idéalement, mon mutant V6 **rouge**. Sans cette trace, la clause « D-lock sur SIGTERM » n'est pas acceptée (le `finally` l'est).
- **C-V-2 (non bloquante, pli)** : test + mutant « `CHAINSTACK_CYCLE_ID` posé, `CHAINSTACK_ETH_ORIGIN` absent ⇒ `unconfigured`, 7 endpoints, aucun `null` publié » (utiliser le paramètre mort `guardEnv(…, { origin: false })`).
- **C-V-3 (non bloquante, pli)** : test + mutant « `CHAINSTACK_CYCLE_FLOOR` ∈ {`abc`, `12.5`, `-3`} ⇒ `config_error`, exit 0, 7 endpoints » (la regex est porteuse : sans elle un floor négatif passe `assertLimits`).
- **C-V-4 (à l'insertion G7)** : amendements §12 **datés** + table tuyaux par amendement ; ADR-U4b : sous (b), à cette fusion APRÈS = AVANT = `0e232519…` et le nouveau sha n'arrive qu'au pli §11-1 ; sous (b) également, les textes qui présupposent la suppression au rebase (`SENTINEL_ALLOW` déclencheur `rpc.ts`, `keyless-transport.ts:20`, commentaires `.service`) deviennent périmés une fois committés et sont à co-éditer dans le pli §11-1 — sous (a) ils sont exacts.
- **C-V-5 (consignation, hors dépôt)** : le harnais `F:\tmp\nops1d\mutants.mjs` ne capturait aucun nom de test rouge sur win32 (reporter spec + CRLF) — l'attribution « test tueur » du G1 n'avait jamais été observée ; mon rejeu TAP la confirme pour les 10. Défaut d'outillage G1, pas du lot ; à corriger dans la consigne standard (`--test-reporter=tap`).

**AM-1 — ce que la checklist a attrapé** : chemin SIGTERM sans aucune trace d'exécution (skip win32 + CI sur PR seulement + branche non poussée) ; deux gardes déclarés non testés (origine requise, regex floor) via mutants survivants ; attribution des mutants G1 jamais observée (harnais muet sur win32) ; ordonnancement fusion/redéploiement vs suppression différée (3ᵉ redéploiement latent) tenu contre la pression de la décision 133.

**R-1** : `claude-fable-5-1`. Aucune écriture hors `F:\tmp\cp2-nops1d\`, aucun `git` d'écriture, aucune installation, aucune valeur d'environnement payante lue ni affichée.
