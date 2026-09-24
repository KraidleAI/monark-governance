# G2 NARABI-OPS-1d (e12f59f) — PASS-AVEC-CORRECTIONS

Revue complète. La mission G2 est intégralement exécutée : clone isolé `F:\tmp\g2-nops1d\tree` @ `e12f59f`, 8 vérifications refaites, oracle mesuré (931/929/0/2, tout vert), 10 mutants G1 rejoués + 4 mutants G2 adverses, corrections formées. Verdict **PASS-AVEC-CORRECTIONS**. Rendu écrit dans `F:\tmp\g2-nops1d\G2.md` ; harnais durable `F:\tmp\g2-nops1d\g2-mutants.mjs` + `F:\tmp\g2-nops1d\oracle.sh`. Rendu intégral ci-dessous.

---

Modèle résolu : claude-opus-4-8[1m]

# G2 — revue (relecteur Opus 4.8) — lot NARABI-OPS-1d @ `e12f59f`

> **Provenance (CA-8).** Relecteur `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22, instance séparée / contexte frais. Clone isolé `F:\tmp\g2-nops1d\tree` (`git clone --no-hardlinks --branch lot/narabi-ops-1d F:\Monark` → HEAD `e12f59f0e65001274ecb93a28121b68d7907c69f`, parent `f6442fe` = `lot/etude-suite` ; rebase confirmé par `merge-base(narabi,f6442fe)==f6442fe`). node v24.15.0, `node_modules` par `mk-nm.ps1` (entries 220, monark 10, fail 0 ; `require.resolve('@monark/rpc-guard')` → le clone). Tout oracle sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`, TEMP sur `F:`. **R-20** : aucun commit, aucun workflow, aucune écriture dans `F:\Monark`/`F:\Monark-wt-*` (mutants pointés sur le clone via `NOPS1D_WORKTREE`, restaurés byte-exact). **R-21** : chaque affirmation porte sa preuve reproductible.

## VERDICT G2 : **PASS-AVEC-CORRECTIONS**

La migration fonctionnelle est complète et correcte, les 9 fichiers gelés U-4b restent byte-identiques (`rpc.ts` == valeur de gel D4), l'oracle `env -u` est vert et **égale exactement l'attendu 931/929/0/2**, les 10 mutants G1 sont tués + restaurés byte-exact et mes 4 mutants adverses se comportent comme prédit (1 contrôle positif TUÉ, 2 lacunes de couverture SURVIVANTES, 1 limite win32 déclarée). Les corrections sont **documentaires** (texte d'amendement ADR-U4b périmé par le report du gel) et de **couverture mineure** (deux branches défense-en-profondeur non testées) — aucune n'est bloquante, aucune n'est un contournement. La résolution « par étapes » (rpc.ts gelé, code mort allowlisté, suppression = item formé) est **jugée SAINE** (non re-décidée).

---

## Vérification 1 — Diff exact, gel U-4b, package.json

- `git diff --stat f6442fe..e12f59f` = **8 fichiers, +604/−93** (conforme). Ventilation numstat : run.ts 168/47, chainstack-guard.test 303/0, grep-test 36/22, catchup-budget.test 27/10, retry.test 12/9, probe-narabi.test 13/5, keyless-transport 35/0, deploy 10/0.
- **9 sha gelés U-4b byte-identiques** (sha256 LF, working tree `eol=lf` par `.gitattributes`) — TOUS concordent, et aucun n'apparaît dans le diff du lot : `u4b-scores.mjs 2f9a31f6…` · `u4b-reduce.mjs a5e66cd3…` · `record-u4b-calib.mjs 5733daeb…` · `wadray.ts 7bee76fc…` · `abi.ts 3376eb08…` · `l1-split.ts 9206df91…` · **`apps/sentinel/src/rpc.ts` `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` (== valeur de gel D4 COMPLÈTE, ADR-U4b §1 ligne 74)** · `calib-digest.ts 3603265d…` · `u3-realized.mjs cb020425…`.
- `apps/sentinel/package.json` **inchangé** (`git diff --stat … -- apps/sentinel/package.json` vide) ; `@monark/rpc-guard` y est déjà (dépendance de workspace, R-8 propre).

## Vérification 2 — `CHAINSTACK_ETH_URL` lu UNIQUEMENT par le transport du garde

**Prouvé par grep des appelants + test statique.**
- Lecteurs de `CHAINSTACK_ETH_URL` (src, hors tests/docs) : `apps/sentinel/src/rpc.ts:54` (dans `chainstackUrl`, **code MORT** — allowlisté) et **`packages/rpc-guard/src/transport.ts:106`** (`const chainstackUrl = network === "solana-mainnet" ? env.CHAINSTACK_SOLANA_URL : env.CHAINSTACK_ETH_URL;` — le SEUL lecteur VIVANT, module allowlisté). Le hit `scripts/census/u4b/liquidation-logs.mjs:12` est un commentaire ; `u3-realized.mjs` (script de course, gelé) n'est pas dans le graphe d'imports de `run.ts` (run.ts → rpc.ts, keyless-transport, windows, flow, timeline, @monark/rpc-guard) — hors du chemin d'exécution du sentinel.
- `run.ts` **n'invoque AUCUNE** des fonctions mortes de rpc.ts : `chainstackUrl`/`poolEndpoints`/`publishedEndpoints`/`hasChainstack`/`defaultCall` ne sont référencées QUE dans rpc.ts (+ commentaires de keyless-transport). Donc à l'exécution, `chainstackUrl` (le seul lecteur de la clé dans rpc.ts) n'est jamais atteint depuis run.ts.
- `run.ts` passe `process.env` à `openGuardedClient(…, { network: "ethereum-mainnet" })` → le transport résout `CHAINSTACK_ETH_URL` en interne. `grep CHAINSTACK_ETH_URL run.ts keyless-transport.ts` = **0**.
- **Test statique** `sentinel_no_clock_env_is_read` (catchup-budget.test) : asserte que run.ts lit EXACTEMENT six clés ENV — `CHAINSTACK_CYCLE_FLOOR`, `CHAINSTACK_CYCLE_ID`, `CHAINSTACK_ETH_ORIGIN`, `MONARK_SENTINEL_BUDGET_S/DIR/J0` — toutes NON secrètes ; `CHAINSTACK_ETH_URL` **n'y figure pas**. Le grep test (bareKeys=true sur `apps/sentinel/src/**`) refuse en outre le NOM nu de la clé hors allowlist (mutant `env_key_read_in_run_ts` TUÉ).
- Aucune clé loguée/publiée : `redactEndpoint` (origine seule) ; l'e2e asserte `!stdout.includes(SECRET_MARK) && !writtenLine.includes(SECRET_MARK)`.

## Vérification 3 — Garde : write-ahead, plafonds, D-degrade, D-lock, origine SSI ouverte

- **Write-ahead** : `sentinel_chainstack_leg_writes_ledger_line_before_fetch` asserte `linesSeenByFetch===1` (la ligne ledger est sur DISQUE avant que le fetch du transport ne parte) ; mutant `paid_leg_raw_fetch` (bypass du garde) TUÉ.
- **Plafonds** : `limits = { maxCalls: 2000, runCaps.chainstack: 20000, methodCaps: 2000×3, cycleFloor }` ; `sentinel_chainstack_caps_cover_the_g0_m7_stress_bound` : 322 appels (borne de stress G0 M-7) ⇒ **0 `refused`**, chaque compte par méthode ≤ cap, RU run ≤ cap. Caps mesurés au G1 (e2e : 19+1+2 = 22 essais/44 RU un jour dégradé), ré-assertés `>0 && ≤ cap` par l'e2e — non devinés.
- **D-degrade keyless quand le garde refuse / échoue** : `chainstack_refusal_degrades_to_keyless_quorum_not_stopped_day` (BudgetExceededError ⇒ `makeRpcPool` benche la jambe ⇒ quorum keyless, jour NON arrêté) ; `sentinel_guard_open_failure_degrades_to_keyless_and_publishes` (parent ledger absent ⇒ `ledger_error`, exit 0, 7 endpoints, 0 origine). Mutants `no_degrade_try_catch` (throw au lieu de dégrader) et `chainstack_guard_hardcoded_ok` TUÉS. `openChainstackLeg` **ne throw jamais** (try/catch → `classifyGuardOpenError`, ensemble fermé).
- **D-lock (finally + SIGTERM)** : `sentinel_run_re_acquires_lock_after_clean_exit` (run 2 ré-acquiert car run 1 a relâché en `finally` ; 2 lignes `unlocked`, 0 `.lock`) — VERT sur win32, mutant `no_lock_release_in_finally` TUÉ ; `sentinel_run_releases_chainstack_lock_on_sigterm` — SKIP win32 déclaré (voir Vérif. 6), corps exécuté sur CI Linux.
- **Origine publiée SSI le garde a ouvert (C-6)** : `published = hasChain ? [...PUBLIC, leg.origin!] : [...PUBLIC]` ; e2e ouvert ⇒ 8ᵉ endpoint = `providerOf==="chainstack.com"` ; e2e dégradé ⇒ 7 endpoints, aucune origine. Mutant `origin_published_without_open` TUÉ.

## Vérification 4 — Test grep

`test/rpc-guard-fetch-only-inside-client.test.ts`, test `sentinel_src_clean_and_allowlist_load_bearing` :
- **Portée `apps/sentinel/src/**`** (asserte run.ts, rpc.ts, keyless-transport.ts, timeline.ts, windows.ts en portée ; ≥ 8 ukemi/*.ts — un « scope narrowed to ukemi-only » rougirait).
- **`SENTINEL_ALLOW` = 2 entrées AVEC déclencheur** : `rpc.ts` (déclencheur = suppression du code mort à la clôture U-4b-1b) et `keyless-transport.ts` (déclencheur = migration du pool keyless sous le garde, route β).
- **Non-vacuité PAR entrée** : chaque fichier allowlisté, scanné SEUL sous allowlist vide, doit produire ≥ 1 hit (sinon son déclencheur est atteint ⇒ rouge). Double garde (l'entrée doit être un fichier réellement en portée). Mutant `keyless_transport_delisted` (entrée retirée) TUÉ ; un `fetch(`/nom de clé ajouté hors allowlist rougit (mutant `env_key_read_in_run_ts` TUÉ). **Conséquence load-bearing** : quand le code mort de rpc.ts sera supprimé, l'entrée `rpc.ts` deviendra vacante ⇒ rouge ⇒ retrait auto-forcé (l'item §11-1 est auto-armé, pas une dette nue).

## Vérification 5 — Mutants (10 G1 rejoués + 4 G2), restauration byte-exacte

- **10 mutants G1 rejoués sur le clone** (`mutants.mjs`, `NOPS1D_WORKTREE=F:\tmp\g2-nops1d\tree`, `env -u`) ⇒ **ALL MUTANTS KILLED + RESTORED BYTE-EXACT (10)**, exit 0. (paid_leg_raw_fetch, env_key_read_in_run_ts, origin_published_without_open, no_lock_release_in_finally, no_degrade_try_catch, timeout_30s, budget_leading_zero_accepted, max_day_success_only, keyless_transport_delisted, chainstack_guard_hardcoded_ok.)
- **4 mutants G2 adverses** (`g2-mutants.mjs`, même clone, `env -u`) ⇒ tous conformes à l'attente + restaurés byte-exact :
  - `g2_network_solana_positive_control` (run.ts `network:"ethereum-mainnet"`→`"solana-mainnet"`) : **TUÉ**. Mécanisme exact (tracé) : l'env e2e (`guardEnv`/`childEnv`) ne porte pas `CHAINSTACK_SOLANA_URL` ⇒ `transport.ts:106` ne résout aucun URL ⇒ `openGuardedClient` throw « not resolved » ⇒ `classifyGuardOpenError` → `unconfigured` ⇒ l'assertion `chainstack_guard === "ok"` (chainstack-guard.test:236) rougit AVANT même l'assertion du stamp `network` (:244). Le mutant prouve donc que l'e2e EXIGE une jambe RÉELLEMENT ouverte sur le bon réseau (il lie la sortie servie), mais il n'ISOLE pas l'assertion du stamp `network` du ledger — l'isoler exigerait de poser `CHAINSTACK_SOLANA_URL=FAKE_URL` (non fait, noté ; hors des 4 mutants, non ré-exécuté).
  - `g2_floor_validation_disabled` (retrait de `/^\d+$/` sur `CHAINSTACK_CYCLE_FLOOR`) : **SURVIVANT** ⇒ lacune : le chemin « floor malformé ⇒ config_error » n'est couvert par AUCUN test.
  - `g2_origin_absent_half_removed` (retrait de la moitié `origin===undefined` du garde `unconfigured`, run.ts:285) : **SURVIVANT** ⇒ lacune : la branche « cycle posé + origine absente ⇒ unconfigured » n'est pas testée (le mutant publierait `undefined` en 8ᵉ endpoint). `guardEnv(opts.origin:false)` existe mais n'est jamais appelé.
  - `g2_sigterm_handler_removed` (retrait de `process.on("SIGTERM", …)`, run.ts:321) : **SURVIVANT sur win32** — le test tueur skippe sur win32 ; il rougit sur CI ubuntu-latest. Limite de couverture DÉCLARÉE, pas un défaut.
- **Restauration** : `git status` propre + les 8 fichiers livrés == `DELIVERED.sha256` byte-exact après tous les runs (A-6).

## Vérification 6 — Oracle `env -u` sur le clone

`env -u … npm run ci` (gate:vocab + typecheck + test) ⇒ **exit 0** ; **tests 931 / pass 929 / fail 0 / skipped 2** (== attendu 931/929/0/2). `npm run lint` **0** ; `npm run lint:ratchet` **0** (69/69, plafond mesuré) ; `node scripts/lang-gate.mjs` **0** ; `npm run export:check` **0** (0 chemin interdit, 0 hit français non exempté).
- **R-25** (pathspec `ci.yml:65` VERBATIM, formule CI `ins+del` vs `VIBEGATES_PR_LIMIT=1205`) : `git diff --shortstat f6442fe...HEAD -- . :(exclude…)` ⇒ **8 files, 604 insertions(+), 93 deletions(-) = 697** < **1 150** (seuil mission/A-5) et < 1 205 (CI). Aucune couture nécessaire.
- **Les 2 skips sont nommés + motivés + déclarés non vacants** :
  1. `sentinel_run_releases_chainstack_lock_on_sigterm` — SKIP win32 (`# win32: process.kill is a hard kill (no SIGTERM handler); RUNBOOK unlock covers a SIGKILL (C-7)`). Non vacueux : le corps S'EXÉCUTE sur CI ubuntu-latest, et le mécanisme de relâche (unlock+unlink+ré-acquisition) est prouvé CROSS-plateforme par `sentinel_run_re_acquires_lock_after_clean_exit` (VERT sur win32) — seule la livraison du signal est Linux.
  2. `u4b_labels_replay_via_main_real_artifact` — SKIP pré-existant (`# real e2 artifacts absent`, gitignorés hors dépôt), PAS de ce lot.
  `sentinel_budget_below_unit_timeout` **PASSE** (deploy/ présent) — ce n'est pas un skip.
- **Note (informative, non bloquante)** : le MESSAGE du commit `e12f59f` porte encore la tally PRÉ-rebase « 877/875/0/2 » (mesure du worker sur base `1f4b746`) ; l'arbre rebasé sur `f6442fe` mesure 931/929/0/2. Le message est périmé mais l'arbre est correct ; l'orchestrateur écrira la tally réelle au G7.

## Vérification 7 — Amendements ADR §11-§12 + RUNBOOK

Le commit `e12f59f` **ne touche AUCUN doc** (`git diff --name-only f6442fe..e12f59f -- docs/` vide) — les amendements sont PROPOSÉS (R-20, insérés par l'orchestrateur). Évaluation :
- **ADR-NARABI-OPS-1 (route α, correction dérive)** : sain. La dérive « ninth endpoint / 8 free providers » (ADR lignes 38-39/49/61) est réelle ; `PUBLIC_ENDPOINTS` = 7 URLs, la ligne publiée = 7 publics + origine gardée = **8ᵉ** (e2e : `endpoints.length === PUBLIC_ENDPOINTS.length + 1`). Le commentaire `.service` corrige verbatim. Ensemble fermé `chainstack_guard ∈ {ok,unconfigured,lock_held,ledger_error,config_error}` cohérent avec `classifyGuardOpenError`.
- **ADR-GARDE-HELIUS A-1/A-4 « par compte » (décision 121)** : sain (ledgers locaux par machine + floor importé ; ledger Chainstack VPS = source du minorant A-4, essais × 1 RU plancher). Le stamp `network:"ethereum-mainnet"` est vérifié sur les lignes ledger de l'e2e.
- **CORRECTION C-G2-1 (ADR-U4b D4, texte PÉRIMÉ par le report du gel)** : le G1 §12 propose « `rpc.ts` — AVANT `0e232519…` ; APRÈS = **recomputé au commit du rebase -1d** après la suppression du jeu mort » et §11-1 « déclencheur = clôture de -1b, **au rebase annoncé, AVANT G2** ». **Or le rebase -1d (`e12f59f`) a été fait SANS suppression** — la course U-4b-1b n'est pas close, l'orchestrateur MAINTIENT le report (en-tête de mission ; `rpc.ts` reste `0e232519`, gel D4 §1 intact). Donc **pour -1d : AVANT == APRÈS == `0e232519…`** ; la suppression + le recompute sont un item **POST-fusion SÉPARÉ** (déclencheur = clôture U-4b-1b), PAS une propriété du commit -1d. Inséré verbatim au G7, le texte §12 enregistrerait un « APRÈS » qui n'existe pas dans -1d. **À corriger avant insertion** : -1d livre `rpc.ts` GELÉ ; l'amendement AVANT/APRÈS appartient à l'étape de suppression ultérieure. (Le CODE est correct ; seule la prose d'amendement est à réaligner — non bloquant, cohérent avec « résolution par étapes ».)
- **RUNBOOK §13 (C-5, 2ᵈ redéploiement)** : concret et complet (`install -d -o sentinel -g sentinel -m 0750 /var/lib/monark-sentinel/ledger` AVANT le dry-run ; poser `CHAINSTACK_CYCLE_ID`/`CHAINSTACK_ETH_ORIGIN`/`CHAINSTACK_CYCLE_FLOOR` ; champs du 1er run réel dont `chainstack_guard ok` + absence de `.lock` ; STOP/rollback ; réparation SIGKILL par `runCli unlock`). Daté 2026-09-22.
- **CORRECTION C-G2-4 (format d'amendement — item 7 « datés, avec tuyaux »)** : les TROIS amendements ADR proposés (G1 §12) sont en PROSE — **ni datés dans le texte de l'amendement, ni porteurs des 4 champs de tuyau (entrée/sortie/état/test)**. Les tuyaux existent bien, mais dans le G1 §4 (table), PAS dans l'amendement lui-même. Sur insertion au G7, l'orchestrateur doit reporter dans l'amendement ADR-NARABI-OPS-1 la **ligne « jambe Chainstack gardée » de la table §4** (entrée : `process.env`+clés de cycle → `openGuardedClient` ; sortie : `<ledgerDir>/<cycle>/chainstack.jsonl` + ligne publiée ; état : `upcoming`→`built` au 1er JOURNAL post-déploiement ; test : `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock`) **et la date 2026-09-22**. Non bloquant pour le code, mais une case explicite de l'item 7 laissée vide est un défaut du rendu à fermer.

## Vérification 8 — Branchement (CA-11)

- **Test d'intégration non-LLM : OUI.** `sentinel_chainstack_guard_ok_ledgers_publishes_origin_and_releases_lock` `spawnSync` le **run.ts RÉEL** (`--import <stub globalThis.fetch>` seul bouchonné, corps de forme réelle), garde RÉEL (ledgerDir temporaire, vrai `.lock`), un jour complet à pool dégradé (chainstack forcé dans le quorum) ⇒ asserte la ligne ledger `network:"ethereum-mainnet"` sur disque, l'origine `chainstack.com` en 8ᵉ endpoint, `line_hash` INCHANGÉ (M-11), `unlocked` chaîné + 0 `.lock` à la sortie, exit 0, aucune fuite de clé. Rejoue la composition `openChainstackLeg → makeDispatchCall → garde → ledger → makeRpcPool → publication` de bout en bout.
  - **Déviation C-3 vue et jugée déclarée-non-cachée** : le checkpoint-1 C-3 demandait littéralement « `timeline.jsonl`/`state.json`/`public/` **byte-identiques** à la base -1c » ; l'e2e asserte le **`line_hash`** (dans `hashedFields`), PAS les octets bruts. C'est la déviation DEV-3 du G1 (`sentinel_sha`/`endpoints` dérivent : nouveau module top-level + origine publiée ⇒ `timeline.jsonl` non byte-identique, mais `line_hash` l'est — provenance hors hash, M-11). Déclarée, annotée, non affaiblissante : l'invariant de VALEUR (le hash) est tenu, la dérive de provenance est assumée. Le checkpoint-2 vérifiera C-3 contre son propre libellé — je le nomme ici.
- **Chemin SERVI : PAS ENCORE (correctement déclaré `upcoming`).** Le VPS tourne l'ANCIEN `run.ts` (`54619a40`, checkpoint-1 §1) jusqu'au **2ᵈ redéploiement post-G7** (décision 118) ; la jambe gardée devient `built` à la 1ʳᵉ ligne JOURNAL post-déploiement (`chainstack:true`, `chainstack_guard:ok`, origine `chainstack.com`, ledger écrit). Le G1 §4 le déclare ainsi. **Aucune sur-déclaration dans le registre** : `README.md:41` « Narabi runs (class served; timeline published daily) » décrit le job quotidien M012 DÉJÀ servi, **pas** la nouvelle jambe gardée. La règle Branchement est respectée : la pièce est BRANCHÉE par un test d'intégration non-LLM ; son passage à `built` est un item formé au déclencheur (2ᵈ redéploiement), pas un « dû » nu.

---

## Corrections formées (zéro dette — propriétaire + déclencheur)

- **C-G2-1 (bloquant pour l'insertion ADR au G7, non bloquant pour le code)** — réaligner le texte d'amendement ADR-U4b D4 et l'item §11-1 : -1d livre `rpc.ts` GELÉ (`0e232519…`, AVANT==APRÈS) ; la suppression du code mort + le recompute du sha APRÈS sont un item POST-fusion. **Propriétaire** : orchestrateur (insertion G7). **Déclencheur** : clôture de la course U-4b-1b.
- **C-G2-2 (couverture, non bloquant — chemins défense-en-profondeur qui dégradent sûrement)** — ajouter, avec mutant, (a) un test « `CHAINSTACK_CYCLE_FLOOR` malformé ⇒ `config_error` » et (b) un test « cycle posé + `CHAINSTACK_ETH_ORIGIN` absent ⇒ `unconfigured` » (le paramètre `guardEnv(opts.origin:false)` existe déjà, inutilisé). Mesuré : mes mutants `g2_floor_validation_disabled` et `g2_origin_absent_half_removed` SURVIVENT. Impact réel borné (le RUNBOOK exige les deux clés ; D-degrade sûr), mais la couverture doit fermer ces branches (P5). **Propriétaire** : orchestrateur/worker au pli. **Déclencheur** : ce G2.
- **C-G2-3 (informatif, limite win32 déclarée)** — consigner que la registration du handler SIGTERM (`run.ts:321`) n'est couverte que sur CI Linux (mutant `g2_sigterm_handler_removed` survit sur win32) ; le lot le déclare (DEV-5, skip non vacueux via `_re_acquires_lock_after_clean_exit`). Aucune action de code. **Déclencheur** : n/a (note de couverture).
- **C-G2-4 (format d'amendement ADR — item 7, non bloquant)** — les 3 amendements ADR proposés (G1 §12) ne sont ni datés dans leur texte ni porteurs des 4 champs tuyau ; à l'insertion G7, reporter la ligne « jambe Chainstack gardée » de la table G1 §4 (entrée/sortie/état/test) + la date 2026-09-22 dans l'amendement ADR-NARABI-OPS-1 (détail Vérif 7). **Propriétaire** : orchestrateur (insertion G7). **Déclencheur** : ce G2.

## Conformité R- / MAST

- **R-1** `claude-opus-4-8[1m]` (préfixe vérifié). **R-20** aucun commit/workflow/insertion ADR (proposés). **R-21** chaque affirmation → preuve reproductible (commandes, sha, tests, mutants). **R-22** aucun gate suspendu. **R-25** 697 < 1 150. **R-8** package.json propre.
- **MAST** : FM-2.4 (test fabriquant son entrée) contré par A-8 (corps de forme réelle : enveloppe succès, `error` JSON-RPC à 200, 429+Retry-After ⇒ retryAfterMs=2000, 403 ⇒ pas de retryAfterMs — transport.ts:229-251 concordant). FM-3.3 (mesure sous clé ambiante) contré par A-7 (`env -u` sur tout l'oracle + les deux harnais de mutants). Fuite de clé : la clé n'est lue que par le transport allowlisté ; run.ts = 0 hit KEY/KEY_BARE.

## Reproduction

```
git clone --no-hardlinks --branch lot/narabi-ops-1d F:\Monark F:\tmp\g2-nops1d\tree
powershell -NoProfile -File F:\tmp\g2-garde2bi\mk-nm.ps1 -Tree F:\tmp\g2-nops1d\tree
# gel : sha256sum <9 fichiers> ; rpc.ts == 0e232519a18a…c65ca0
# oracle : env -u … npm run ci ; lint ; lint:ratchet ; node scripts/lang-gate.mjs ; npm run export:check
# R-25 : git diff --shortstat f6442fe...HEAD -- . ':(exclude,glob)docs/**/*.md' … (ci.yml:65)
# mutants G1 : NOPS1D_WORKTREE=F:\tmp\g2-nops1d\tree env -u … node F:\tmp\nops1d\mutants.mjs
# mutants G2 : NOPS1D_WORKTREE=F:\tmp\g2-nops1d\tree env -u … node F:\tmp\g2-nops1d\g2-mutants.mjs
# oracle intégral scripté : bash F:\tmp\g2-nops1d\oracle.sh
```
Artefacts durables (R-21) : `F:\tmp\g2-nops1d\G2.md`, `F:\tmp\g2-nops1d\g2-mutants.mjs`, `F:\tmp\g2-nops1d\oracle.sh`, clone `F:\tmp\g2-nops1d\tree` @ `e12f59f`.
