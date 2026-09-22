# G2 — lot HARNESS-DESC-1 — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-22

Modèle résolu : claude-opus-5-5[1m]

# G2 — lot HARNESS-DESC-1 (`lot/harness-desc-1` @ `906064b`, base `153582f`) — relecteur G2 (instance séparée, contexte frais)

**Verdict : PASS-AVEC-CORRECTIONS**. Une seule correction, qui ne touche que les tests : C-G2-1, le contrôle négatif de la CA de
déploiement. Le reste est en observations et items formés (§6). Le code servi est conforme à C-1..C-9 et au ruling C-1, et
toutes les mesures ont été refaites de mon côté.

> Rendu écrit au fil de l'eau (consigne investisseur 22:1x UTC) : première version durable à 22:14Z, mesures sur `merge-es2`
> terminées à 22:28Z, arrêt par la limite de session, reprise à 23:22Z (« Réessayer »). À la reprise, tous les clones ont été
> contrôlés par sha : worktree == index partout, `DELIVERED` 9/9, aucune mutation résiduelle. Rien de ce qui était prouvé sur
> disque n'a été refait. Finalisé à 23:25Z.
> Je n'ai pas lu le checkpoint-2 HARNESS-DESC-1 persisté entre-temps (commit `91a719b`, dont je n'ai vu que le titre) : je garde
> l'indépendance G2 ‖ cp-2.

## 0. En-tête A-12 et cadre

- Relecteur : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, décision 133), effort max. Date : 2026-09-22,
  mesures de 21:55Z à 22:28Z, puis contrôles de reprise de 23:22Z à 23:25Z (horloge des logs et `date -u`). Le générateur du
  lot est un worker G1 distinct (P6).
- Arbres, tous sous `F:\tmp\g2-hdesc1\`. Aucun commit, aucune écriture dans `F:\Monark` (porcelain = 0 au début et à la fin) :
  - `tree` = `git clone --no-hardlinks --branch lot/harness-desc-1 F:\Monark` → HEAD `906064b8c98daf55d14094cde9cefa1546751afe`, porcelain 0 ;
  - `base` = clone détaché à `153582fe62faf7b8db98ff37c8bb701305508af3`, l'état pré-lot ;
  - `merge-es` = clone `lot/etude-suite` @ **`a703e2449d39908c4f4f417e350c437d9f8f0bcc`** (NARABI-OPS-1d `3659181` inclus) + `git merge --no-commit --no-ff origin/lot/harness-desc-1`. Sortie : « Automatic merge went well » ;
  - `merge-a9` = même base `a703e24` + fusion octopus `git merge --no-commit --no-ff origin/lot/a9-outille origin/lot/harness-desc-1` (`649db8b` + `906064b`). Sortie : « Auto-merging apps/harness/src/tools/gate.ts … went well ».
  - `merge-es2` = clone `lot/etude-suite` @ **`7cdfb7c20c2ca0dfbc141b8e1986941eee611a44`** (A-9 micro-pli `4ff171e` fusionné
    par le G7 A-9 `eab911a`) + `git merge --no-commit --no-ff origin/lot/harness-desc-1`. Sortie : « Auto-merging
    apps/harness/src/tools/gate.ts … went well ». **C'est l'arbre qui correspond à la cible de fusion actuelle** (§2-bis).
  - `lot/etude-suite` a bougé pendant la revue : `a703e24` → `097bc9e` → `7cdfb7c` → `674cf9a` (23:23Z) → **`7c70826`** (23:25Z).
    - `a703e24..097bc9e` : 13 fichiers, tous sous `docs/**`.
    - `097bc9e..7cdfb7c` : fusion A-9 (code, re-mesurée sur `merge-es2`).
    - `7cdfb7c..674cf9a` : `docs/CHANTIERS.md` et `docs/ETAT-REPRISE.md` seulement.
    - `674cf9a..7c70826` : `docs/CHANTIERS.md`, `docs/ETAT-REPRISE.md` et `docs/G1-lot-u4b-stats-1.md` seulement.
    - `git merge-tree --write-tree origin/lot/etude-suite(674cf9a) origin/lot/harness-desc-1` : propre, tree `8f9e305d…`.
      Fichiers communs depuis `153582f` : `gate.ts` seul (commentaires A-9).
    - Comme `7cdfb7c..7c70826` ne touche que des docs, disjoints du lot, les mesures de `merge-es2` valent pour `7c70826`.
- A-2 : `mk-nm.ps1` passé sur les 5 arbres ⇒ `entries: 220 monark: 10 fail: 0`. `require.resolve('@monark/rpc-guard')` =
  `F:\tmp\g2-hdesc1\<arbre>\packages\rpc-guard\src\index.ts` (5/5).
- A-7 : tous les oracles, tests, mutants, recorders et CA tournent sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`. Les harnais de mutants suppriment les 8 noms de l'env enfant, sans jamais les lire ni les imprimer. Aucune variable affichée. TEMP/TMP = `F:\tmp\g2-hdesc1\os-tmp`.
- Réseau : aucun. Le harness tourne in-process (`createHarnessHandler().fetch`, `handleJsonMirror`) ou via `startServer(0)` sur
  un port éphémère de `127.0.0.1` (boucle locale). La CA vise `http://127.0.0.1:<port>`, donc TLS est sauté.
- node `v24.15.0`, win32 10.0.19045 x64, git 2.55.0.windows.5.
- Scripts de mesure G2 (sha256) : `oracle.sh` `a0a7df2b…`, `check-describe-g2.mjs` `410a3ec5…`, `served-diff.mjs` `b31599e4…`,
  `ca-run.mjs` `2fd9399d…`, `g2-mutants.mjs` `d012bbf6…`, `fullsuite-mutant.mjs` `d98e4c4a…` (entrées `rhd1`, `g25a`, `g25b`, `g25c`), `merged-checks.sh` `d97ff761…`.
  Copies des harnais G1 : `g1-mutants-copy.mjs` `ecaa059e…` et `g1-survivors-copy.mjs` `9bfb4d83…` ; seule la ligne TEMP/TMP
  diffère des originaux (diff montré).
- Entrées lues :
  - consigne `docs/CONSIGNE-STANDARD-G1.md` (A-1..A-12, B..F, G-1) ;
  - checkpoint-1 `docs/CHECKPOINT1-lot-harness-desc-1.md` (C-1..C-9) ;
  - ruling C-1 (`docs/CHANTIERS.md:866` : « `LIQ_CONDITIONAL_SENTENCE` conservée sur registre vide ») ;
  - rendu G1 `F:\tmp\hdesc1\G1.md` (sha `fb9d6318…`, 24 919 o) et `docs/G1-lot-harness-desc-1.md` (5 106 o, `36e1312`) ;
  - `DELIVERED.sha256` (`53ce0494…`), `mutants.mjs` (`7351ca9b…`), `survivors.mjs` (`67acc295…`), `ADR-amendement.md` (`8786ad40…`) ;
  - fait motivant `docs/carto/openapi-live-2026-09-22.json`, re-mesuré : 17 282 o, `info.version` 0.4.0, 4 chemins. Absents :
    `liquidation-eligible-coverage`, `attested` et « calibrated on one recorded episode ».

## 1. Vérifications de la mission (1)–(9) : résultat mesuré, preuve, log

| # | Objet | Résultat mesuré | Preuve (log sous `F:\tmp\g2-hdesc1\logs\`) |
|---|---|---|---|
| (1) | diff exact ; 9 sha | `git diff --numstat 153582f 906064b` : 9 fichiers, 332+/27−, numstat identique à la table G1 §2. `sha256sum -c DELIVERED.sha256` sur `tree` : **9/9 OK**. Blob `906064b` == disque pour les 9 (autocrlf true + `* text=auto eol=lf`). Les 9 fichiers sont byte-identiques dans `merge-es`. Dans `merge-a9`, 8/9 le sont ; seul écart : `gate.ts` = lot + les 2 hunks de commentaires A-9 (`:160-162,174`) | `git diff origin/lot/harness-desc-1 -- gate.ts` dans `merge-a9` : 2 hunks, commentaires seulement |
| (1b) | gel D4 (A-6) | Les 9 sha LF sont **identiques** sur base `153582f`, lot `906064b`, disque, `lot/etude-suite` `a703e24` et l'arbre fusionné `merge-es2` (cible actuelle, recompté à 23:26Z) : `2f9a31f6` u4b-scores, `a5e66cd3` u4b-reduce, `5733daeb` record-u4b-calib, `7bee76fc` wadray, `3376eb08` abi, `9206df91` l1-split, `0e232519` rpc.ts, `3603265d` calib-digest, `cb020425` u3-realized (re-gel QF-2, `ADR-U4b:402-407`). Aucun fichier du gel ni de `docs/adr/` dans le diff | recompute `git show <rev>:<f> \| tr -d '\r' \| sha256sum` |
| (2) | C-2 : fonction pure et liage | `describeGate(registryHasLiq: boolean): string`, sans I/O. `GATE_TOOL_DESCRIPTION = describeGate(hasCommittedCalibrationForClass(TASK_LIQ_ELIGIBLE))` (`gate.ts:220`). La clé est au niveau registre : `COMMITTED_CALIBRATIONS.some(c => c.taskClass === …)` (`calibration.ts:228-230`). Pas de cycle : `calibration.ts` n'importe pas `gate.ts`. **sha256(`describeGate(true)`) = `5574450432b7252bb82a31e51eb01b707d286fc9bf4af425a2bf5bce787aed77` = sha256(`GATE_TOOL_DESCRIPTION` de `153582f`), 3 193 car., `===` true** (mesuré en important les deux modules réels, pas avec le script du G1). État livré : registre liq = false. Sur les **4 surfaces** (descripteur `HARNESS_TOOLS[gate]`, `tools/list` réel via `createHarnessHandler().fetch`, `buildOpenApi()`, `GET /openapi.json` via `handleJsonMirror`) : EMPTY, REQ et COND présents ; H3, UPPER et « calibrated on » **absents**. « interval » est absent de la tranche liq dans les deux états ; il reste présent dans la clause BYO, ce qui prouve que le contrôle n'est pas vide | `check-describe-g2.log` (clause servie citée intégralement) |
| (3) | invariance | Dump servi base vs lot, feuille JSON par feuille JSON. `tools/list` : 417 feuilles, **1** différence (`$.tools[0].description`, 3 195 → 2 964 car. JSON). openapi : 486 feuilles, **1** différence (`$.paths./gate.post.description`). `/health` identique ; `info.version` 0.4.0 des deux côtés. `cascade`, `attest` et `calibrate` : entrée `tools/list` et chemin openapi byte-identiques. sha256 du JSON du résultat `tools/list` : `b88cd066…` (base) → `6b78a420…` (lot), exactement le delta `response_sha256` de la trace h5 (confirmation indépendante). Fixture : 1 ligne changée | `served-diff-base-lot.log` |
| (4) | C-3 : mutants | **G1 : 25/25 tués par le test attendu (TAP `not ok … - <nom>`) et 25/25 restaurés**, sur `tree`, `merge-a9` et `merge-es2` (cible actuelle, A-9 fusionné). `:185` est re-scopé sur `describeGate(true)` : diff lu, l'assertion n'est pas affaiblie et l'absence servie est assertée par (i). **G2 : 11 mutants à moi. 8/8 tués par le test attendu ; les 3 survivants que j'avais prédits (G2-5a/b/c) ont bien survécu, sur les trois arbres, et sur la suite complète.** Ils révèlent une faiblesse de la CA ⇒ C-G2-1. R-HD-1 : **survit à la suite COMPLÈTE** (927/926/0/1 une fois muté ; sha muté `357b45e6…`, le même qu'au G1) | `g1-mutants-on-{lot,merge-a9,merge-es2}.log`, `g2-mutants-on-{lot,merge-a9,merge-es2}.log`, `fullsuite-{rhd1,g25a,g25b,g25c}.log` ; §3 |
| (5) | C-5 : CA | CA du lot (`scripts/verify-harness.mjs` `a0f478e5…`) contre le harness **du lot** : 12/12 ok, `VERIFY OK`, exit 0. Contre le harness **PRÉ-LOT** (`153582f`, `gate.ts` `17247201…`) : `gate_liq_call` ok (200, `under_calib`, texte registre-vide) mais **`mcp_gate_description_liq` ok=false** (`empty_registry_sentence=false h3_sentence=true`), `VERIFY FAILED: mcp_gate_description_liq`, exit 3221226505. Le rouge est reproduit. Le test `verify_harness_ca_passes_on_the_in_process_harness` exécute la CA de bout en bout in-process, mais **dans le sens positif seulement** (C-G2-1) | `ca-lot-harness-lot-script.log`, `ca-prelot-harness-lot-script.log` |
| (6) | C-6 : re-pin sur arbre fusionné | Recorder lancé hors réseau (in-process sur `127.0.0.1`) sur `merge-es` : 21 943 o, sha LF **`90a21adf1f109d695bd99a5a3521b055b74daba02248de22defe79b070108252`**, identique à la fixture committée (index) ; `git diff` worktree↔index = 0. Même résultat sur `merge-a9` (A-9 ne change aucun octet servi) et sur **`merge-es2` (cible actuelle)** : **90a21adf…, 21 943 o, diff 0** sur les trois. PROVENANCE porte la raison, le delta (1 champ, `b88cd066…` → `6b78a420…`, taille inchangée) et le pin antérieur `4ad9b340…` | `merge-es/record-h5.log`, `merge-a9/record-h5.log`, `merge-es2/record-h5.log` |
| (7) | oracle, fusions, R-25 | voir §2 | §2 |
| (8) | ADR-amendement et RUNBOOK | forme conforme, avec 3 défauts éditoriaux (O-2, O-3, O-4) | §5 |
| (9) | code de sortie de la CA sous win32 | Reproduit 2/2 sur le script **PRÉ-LOT** (`4746f0dc…`), échec provoqué hors réseau (Host `mcp.` sur les contrôles api) : exit **3221226505**, assertion libuv `src\win\async.c, line 76`. Elle survient après l'impression du JSON et de `VERIFY FAILED`. Même chose avec le script du lot contre le harness pré-lot ⇒ **préexistant ; code non nul, donc fail-closed**. L'étape 6 du RUNBOOK dit « Treat ANY non-zero exit as RED ». Aucun consommateur ne lit le code exact (grep `.github`, `scripts`, RUNBOOK) | `ca-prelot-script-fail-{1,2}.log` |

## 2. Oracle, fusions à blanc, R-25 (vérification (7))

| Arbre | gate:vocab | typecheck | test (tests/pass/fail/skip) | lint | lint:ratchet | lang:gate | export:check |
|---|---|---|---|---|---|---|---|
| `tree`, lot `906064b`, run 1 | 0 | 0 | **exit 1 : 927/925/1/1** (voir la note) | 0 | 0 (69/69) | 0 | 0 |
| `tree`, lot `906064b`, relancé sans charge | — | — | **exit 0 : 927/926/0/1** | — | — | — | — |
| `merge-es` = `a703e24` + lot | 0 | 0 | exit 0 : **939/937/0/2** | 0 | 0 | 0 | 0 |
| `merge-a9` = `a703e24` + `649db8b` + lot | 0 | 0 | exit 0 : **943/941/0/2** | 0 | 0 | 0 | 0 |
| **`merge-es2` = `7cdfb7c` (A-9 `4ff171e` fusionné) + lot** | 0 | 0 | exit 0 : **943/941/0/2** | 0 | 0 | 0 | 0 |

- Skips nommés : `u4b_labels_replay_via_main_real_artifact` partout (artefacts e2 gitignorés). Sur les arbres fusionnés
  s'ajoute `sentinel_run_releases_chainstack_lock_on_sigterm` (win32, NARABI-OPS-1d, préexistant).
- **Note sur le run 1 (déclarée, pas cachée).** Le seul échec est `probe_state_digest_cross_check`
  (`test/probe-narabi-state.test.ts:82`), hors périmètre : le diff du lot n'y touche pas. Le cas « coherent » est sorti
  `unhealthy` pendant que je lançais en parallèle des clones, `mk-nm.ps1` (220 jonctions) et un process node, donc sous
  charge I/O. Contre-épreuves : le fichier seul passe 10/10 (2 runs sur 2) ; la suite complète relancée sans charge donne
  927/926/0/1 ; les deux arbres fusionnés sont verts. La sonde fait des GET bornés (8 s / 5 s,
  `scripts/probe-narabi.mjs:54,85`), ce qui rend plausible une sensibilité à la charge. Item formé O-5.
- Sur `merge-a9`, les tests A-9 `harness_tool_descriptions_pass_vocab` et `harness_served_honesty_carriers_pass_vocab`
  passent sur la nouvelle description (EMPTY + REQ + COND servis), ainsi que les 4 tests `hdesc_*`.
- Fusions à blanc :
  - `git merge-tree --write-tree`, qui ne touche aucun arbre : `lot/etude-suite` ⊕ lot est propre (tree `41ba2051…`) ;
    lot ⊕ `lot/a9-outille` est propre (tree `9dfc5532…`) ;
  - fichiers `153582f..a703e24` ∩ lot = ∅ ;
  - A-9 ∩ lot = `gate.ts` seul, avec des hunks disjoints (commentaires `:160-162,174` d'un côté, bloc `:179-220` de l'autre).
- **R-25** (pathspec VERBATIM de `ci.yml:65`) : `153582f...906064b` donne `7 files changed, 325 insertions(+), 25 deletions(-)`,
  soit **350**. L'index de `merge-es` contre `a703e24` donne aussi 325+/25− = **350**. C'est sous 400 (mission) et sous 1 205
  (`VIBEGATES_PR_LIMIT`, `ci.yml:43`).
- **La cible de fusion a bougé PENDANT la revue ; re-mesure faite.** À 22:25Z, `lot/a9-outille` = `4ff171e` : micro-pli
  test-only, `test/vocab-harness-a9.test.ts` +22/−2. Il est **déjà fusionné** dans `lot/etude-suite` = `7cdfb7c` (G7 A-9
  `eab911a`, suivi de commits docs). J'ai mesuré un 5e arbre, `merge-es2` = `7cdfb7c` + `git merge --no-commit --no-ff
  origin/lot/harness-desc-1` : « Auto-merging apps/harness/src/tools/gate.ts … went well ». Son `gate.ts` a le même sha
  (`4cc340e2…`) que dans `merge-a9`, et les 8 autres fichiers du lot sont byte-identiques. Résultats en §2-bis.

## 2-bis. Cible actuelle de fusion : `merge-es2` = `lot/etude-suite` @ `7cdfb7c` (A-9 `4ff171e` fusionné) + lot

Mesures faites de 22:26Z à 22:28Z. Logs : `logs/merge-es2/`, `logs/merge-es2-summary.log`, `logs/g1-mutants-on-merge-es2.log`,
`logs/g2-mutants-on-merge-es2.log`.
- **Fusion.** `git merge --no-commit --no-ff origin/lot/harness-desc-1` sur `7cdfb7c` est propre (« Auto-merging … gate.ts »).
  - Le `gate.ts` fusionné a le sha `4cc340e2…`, identique à `merge-a9` : lot + commentaires A-9.
  - Les 8 autres fichiers du lot sont byte-identiques aux blobs `906064b`.
  - `openapi.ts` et `registry.ts` sont identiques à HEAD après les mutants.
- **Recorder h5** (hors réseau) : 21 943 o, LF **`90a21adf…8252`** = index, `git diff` worktree↔index = 0.
- **Oracle** : `gate:vocab` 0, `typecheck` 0, `test` 0 avec **943/941/0/2**, `lint` 0, `lint:ratchet` 0, `lang:gate` 0,
  `export:check` 0.
  - Skips nommés : `sentinel_run_releases_chainstack_lock_on_sigterm` et `u4b_labels_replay_via_main_real_artifact`.
  - Verts : les 4 `hdesc_*`, `harness_tool_descriptions_pass_vocab`, `harness_served_honesty_carriers_pass_vocab`,
    `probe_harness_records_real_decision` et les 2 `verify_harness_*`.
- **Mutants du G1** : 25/25 tués par le test attendu, 25/25 restaurés, exit 0.
- **Mes mutants** : baseline dorée verte (`gate-liq` 14 ok, `verify-harness-liq` 2 ok, `h5-e2e-probe` 2 ok). 8/8 tués par le
  test attendu ; G2-5a/b/c survivent, comme prédit ; 11/11 restaurés ; état suivi identique avant et après.
- **Après l'arrêt de session** : worktree == index sur les 9 entrées indexées ; `git diff --name-only` = 0.

## 3. Mutants

### 3.1 Mutants du G1 (25), rejoués par moi
Harnais G1 lu avant rejeu : `isKilled = tapNames.includes(m.intended)`, restauration en `finally` avec contrôle sha, exit ≠ 0
dès qu'un mutant n'est pas tué ou pas restauré. Résultats :
- sur `tree` : 25/25 tués par le test attendu, 25/25 restaurés, exit 0 (`g1-mutants-on-lot.log`) ;
- sur `merge-a9` : 25/25, 25/25, exit 0 (`g1-mutants-on-merge-a9.log`) ; les 19 entrées indexées de la fusion sont inchangées
  et, pour chaque fichier muté, disque == index ;
- sur `merge-es2`, la cible actuelle avec A-9 fusionné : 25/25, 25/25, exit 0 (`g1-mutants-on-merge-es2.log`).

### 3.2 Mes 11 mutants (aucun ne figure parmi les 25 du G1)
Harnais `g2-mutants.mjs` : baseline dorée d'abord, chaque tueur visé étant `ok` sans mutation.

| Mutant | Mutation | Tueur visé | `tree` | `merge-a9` | `merge-es2` |
|---|---|---|---|---|---|
| G2-1 | COND retiré de la branche VIDE | `hdesc_served_…` | tué | tué | tué |
| G2-2 | EMPTY ajouté aussi à la branche PLEINE | `hdesc_describe_gate_two_states` | tué | tué | tué |
| G2-3 | site d'appel `describeGate(!hasCommitted…)` : lecture préservée, sortie altérée (A-10) | `hdesc_served_…` | tué | tué | tué |
| G2-4 | `openapi.ts` : `/gate` construit depuis l'ancien texte (`describeGate(true)`, import ajouté) | `hdesc_served_…` | tué | tué | tué |
| G2-5a | CA `mcp_gate_description_liq` réduit à `ok: res.status === 200` | `verify_harness_ca_passes_on_the_in_process_harness` | **SURVIT** (suite COMPLÈTE aussi) | **SURVIT** | **SURVIT** |
| G2-5b | CA `mcp_gate_description_liq` : prédicat `!hasH3` retiré | idem | **SURVIT** (suite COMPLÈTE aussi) | **SURVIT** | **SURVIT** |
| G2-5c | CA `gate_liq_call` : `ok: true` | idem | **SURVIT** (suite COMPLÈTE aussi) | **SURVIT** | **SURVIT** |
| G2-6 | description `cascade` altérée dans `registry.ts` (MAST, dérive de périmètre) | `probe_harness_records_real_decision` | tué | tué | tué |
| G2-7 | clause NON-liq de `gate` altérée (« tools ») | `probe_harness_records_real_decision` | tué | tué | tué |
| G2-8 | « interval » injecté dans la CONSTANTE `LIQ_CONDITIONAL_SENTENCE`, servie dans les 2 états | `hdesc_liq_clause_never_says_interval_in_both_states` | tué | tué | tué |
| G2-9 | branche pleine : REQ et H3 permutés, donc texte -2b ≠ pré-lot | `hdesc_describe_gate_two_states` | tué | tué | tué |

Résumé sur chacun des trois arbres : 8/8 tués attendus ; 3/3 survivants prédits ; 0 surprise ; 11/11 restaurés ; état suivi
identique avant et après. **Les trois survivants ont été MESURÉS sur la suite COMPLÈTE** (`npm run test`, `fullsuite-mutant.mjs`
`d98e4c4a…`), avec restauration identique à chaque fois :
- G2-5a : 927/926/0/1, sha muté `857d90e6…` (`fullsuite-g25a.log`) ;
- G2-5b : 927/926/0/1, sha muté `3fc0a536…` (`fullsuite-g25b.log`) ;
- G2-5c : 927/926/0/1, sha muté `22cd0fc1…` (`fullsuite-g25c.log`).

C'est cohérent avec le grep : seul `test/verify-harness-liq.test.ts` référence `verify-harness.mjs` (`test apps packages scripts`).

### 3.3 Survivant déclaré R-HD-1 : jugement
- Mesure : avec `describeGate(false)` codé en dur au site d'appel, **la suite COMPLÈTE reste verte à 927/926/0/1**
  (`fullsuite-rhd1.log`, sha muté `357b45e6…` identique au G1, restauration identique). Le G1 n'avait mesuré que 5 fichiers
  (`logs/survivors.log`), alors que l'ADR-amendement §6 écrit « survit à toute la suite (mesuré) ». L'affirmation est vraie
  (je l'ai mesurée), mais la preuve du G1 couvrait moins que ce qu'elle énonçait ⇒ O-3.
- Jugement : **déclaration honnête et correcte**. Sur registre vide, `listed === describeGate(hasCommitted…)` est satisfait à
  l'identique par `describeGate(false)`. Un seul état est observable par processus, car `COMMITTED_CALIBRATIONS` est une
  constante de module non exportée. La classe d'équivalence est bien nommée (toute expression fausse sur le registre livré),
  et son tueur est formé : l'item C-4 (d), au G1 de -2b.
- Alternative évaluée, non exigée : `mock.module` du test runner. Sur node v24.15.0, `mock.module` vaut `undefined` sans
  `--experimental-test-module-mocks` (le drapeau figure dans `node --help`). Il faudrait donc ajouter un drapeau expérimental
  au script `test` de toute la CI : le coût dépasse le bénéfice avant -2b. La route C-4 acceptée par le checkpoint-1 reste la
  bonne.
- Asymétrie relevée, non bloquante : le G1 écarte une garde par lecture de source (« déclarative »), alors que
  `verify_harness_liq_literals_equal_served_constants` lit aussi la source. C'est cohérent ici, car ce test lie des valeurs
  (A-10) sans garder une forme de code ; l'ADR peut le formuler ainsi.

## 4. Checklist G2 (template `checklist-revue-G2.md`), item par item

- **Compréhension.**
  - [x] Chaque bloc s'explique : `describeGate` (ternaire pur, deux branches), site d'appel, 4 tests `hdesc_*`, re-scope `:185`,
    boucle probative sur deux états (`gate.test.ts:832`), 2 contrôles CA + parseur `mcpToolDescription` + 2 littéraux liés,
    re-pin h5, PROVENANCE, RUNBOOK.
  - [x] L'intention correspond au G0 : cp-1 U-4b-2 C-1 (`CHECKPOINT1-lot-u4b-2.md:98`), G0 2a-3 (`G0-lot-u4b-2.md:55`),
    cp-1 HARNESS-DESC-1 C-1..C-9 et ruling (`CHANTIERS.md:866`).
- **Pièges catalogués.**
  - [x] Aucune branche ni validation d'entrée retirée : le diff de `gate.ts` ne touche que le bloc de description ;
    `liqEligibleVerdict` et `honestyText` sont intacts.
  - [ ] **Inversion ou simplification booléenne non couverte : NON conforme pour la CA.** Les prédicats de
    `gate_liq_call` et `mcp_gate_description_liq` peuvent être vidés sans rougir (G2-5a/b/c) ⇒ C-G2-1. Les branches de
    `describeGate` sont, elles, couvertes (`branches-inverted`, G2-3).
  - [x] Aucune maltraitance de `this` : `describeGate` est une fonction libre.
  - [x] La correction fonctionnelle n'est pas prise pour une preuve de sécurité : aucune surface de sécurité touchée (pas de
    clé, d'opérateur, d'hôte ni de lecture d'env). `verify-harness.mjs` garde son motif `fetch`/`node:http(s)` préexistant,
    hors de la portée de `rpc-guard-fetch-only-inside-client` (`:36,60`) ; la cible est un argument CLI.
  - [x] Aléa, crypto, chemins : rien d'ajouté.
  - [x] XSS et injection de logs : sans objet (pas de HTML ; `detail` est sérialisé en JSON).
- **Dépendances.**
  - [x] Aucune dépendance nouvelle : diff `package.json` / `package-lock.json` = 0 ligne.
- **Structure.**
  - [x] Duplication (R-3) : les 2 littéraux de la CA sont dupliqués exprès (script sans dépendance) et liés par un test (le
    mutant `ca-literal-drift` rougit). `mcpToolDescription` recopie le parse SSE/JSON de `mcpToolNames` : mineur, acceptable.
  - [x] R-25 = 350.
- **Traçabilité.**
  - [x] Provenance : G1 §9 et PROVENANCE-h5 renseignés ; l'entrée du journal revient à l'orchestrateur au G7.
  - [x] Aucun TODO/FIXME ajouté (grep des lignes `+` = 0).
  - [x] Non-ASCII ajouté : uniquement des octets déjà présents, déplacés (bloc servi ré-indenté, sha identique ; tirets
    cadratins préexistants RUNBOOK et PROVENANCE).
- **AgileCoder, 3 étapes.**
  - [x] Étape 1 : aucune implémentation vide, imports résolus (typecheck 0), docstrings présentes.
  - [x] Étape 2 : chaque élément correspond à C-1..C-9 ou à une déviation déclarée. D-5 étend la police à l'état -2b ; D-7
    (RUNBOOK) se justifie, sinon le RUNBOOK décrirait une CA plus étroite que le script.
  - [x] Étape 3 : C-1..C-9 vérifiés un par un (§1). Cas limites éprouvés : deux états, « interval » dans les deux, 3 autres
    outils invariants, CA rouge contre le pré-lot.
- **Script de workflow** : sans objet.
- **Consigne (points vérifiables par G2)** : A-3, A-4, A-5, A-6, A-7, A-9, A-10, A-11 et A-12 constatés et re-mesurés (§1, §2,
  §3). D-1 est non conforme pour les prédicats de la CA (C-G2-1). D-2 et D-3 sont conformes pour la description servie
  (entrée non vide, liste fermée, composition in-process). D-4 est conforme (`:185` re-scopé, `gate.test.ts:832` renforcé).

## 5. ADR-amendement (C-8) et RUNBOOK (vérification (8))

- Forme conforme :
  - provenance (modèle, date, base, insertion par l'orchestrateur, R-20) ;
  - constat mesuré (§1) et décision D-HD-1 (§2), sans décision de valeur nouvelle ;
  - ligne **Tuyaux** complète : entrée `COMMITTED_CALIBRATIONS` → `describeGate` ; sortie `tools/list`, `/openapi.json`, CA et
    h5 ; état « un état par processus » ; test de composition nommé (F-1, ADR-M018 D3) ;
  - **item C-4** formé, avec déclencheur (G1 -2b) et propriétaire (orchestrateur, ligne 2b-7) ;
  - **`error_origin` de -2a = générateur ET vérification**, avec les sources (`CHECKPOINT2-lot-u4b-2a.md:27` porte bien « 648 car. :
    0 interval, 0 probabilité ») ;
  - MAST : 2 modes mesurés et leurs contre-mesures ; liste C-9 des porteurs, que j'ai recomptée (grep `apps/harness/src` :
    `gate.ts` seul ; la négation dans `ukemi-predict.ts:63` vit dans un outil non enregistré, `registry.ts` = 4 outils) ;
  - ADR-M012 (i) clos ; aucun renvoi `F:\tmp` (grep = 0).
- Défauts éditoriaux, à corriger à l'insertion (non bloquants) :
  - **O-2** : §9 renvoie au « §7 ci-dessus », qui est la liste des porteurs. Il faut renvoyer au §2 du prereg et au tableau D4
    de l'ADR (re-gel déc. 126, puis QF-2 `:402-407`).
  - **O-3** : §6 R-HD-1 « survit à toute la suite (mesuré) » doit citer la mesure de la suite complète (G2
    `fullsuite-rhd1.log`, 927/926/0/1), la preuve G1 ne couvrant que 5 fichiers.
  - Option : reformuler l'asymétrie « garde par lecture de source » (§3.3).
- RUNBOOK, étape 6 : les deux contrôles sont décrits fidèlement au script ; la bascule à -2b est annoncée ; « ANY non-zero exit
  as RED » couvre R-HD-2.
  - **O-4** : le RUNBOOK renvoie à « ADR-U4b amendment HARNESS-DESC-1, section 4 », qui n'existe qu'après l'insertion par
    l'orchestrateur. Il faut insérer l'amendement **dans le même commit de fusion**, sinon le renvoi reste pendant.
  - Détail : la parenthèse « the class is then an unknown task_class, a 400 » n'explique que `gate_liq_call` ; pour
    `mcp_gate_description_liq`, la cause est l'absence de la phrase registre-vide (O-8, facultatif).

## 6. Corrections (liste fermée) et items

### C-G2-1 : contrôle NÉGATIF de la CA de déploiement (test seul, à plier avant G7)
- **Constat mesuré.** Les prédicats des deux contrôles neufs peuvent être vidés sans qu'aucun test ne rougisse :
  - G2-5a : `mcp_gate_description_liq` réduit à `status === 200` ;
  - G2-5b : `!hasH3` retiré, mesuré aussi sur la suite complète, 927/926/0/1 ;
  - G2-5c : `gate_liq_call` réduit à `ok: true`.

  Ils survivent sur `tree`, `merge-a9` et `merge-es2`. `verify_harness_ca_passes_on_the_in_process_harness` ne prouve qu'une chose :
  la CA ne donne pas de fausse alarme sur un bon harness. Que la CA **alarme** contre la sur-revendication R-10 ou contre un
  processus antérieur à -2a (CARTO-T1C-1) n'a été montré que par un run manuel hors dépôt (G1 `ca-base-harness-new-ca.log`,
  reproduit ici en §1 (5)). C'est le cas visé par D-1/D-2 (un vert sur l'entrée favorable ne prouve rien) et par la case
  « logique booléenne non couverte ». Le prédicat `!hasH3` porte à lui seul la preuve de la phrase `/ukemi` sur la surface
  servie (cp-1 C-5).
- **Risque concret.** L'item C-4 (c) prévoit de **basculer** ces deux prédicats à -2b. Sans contrôle négatif, une bascule
  vacante passerait la CI.
- **Correction.** Ajouter dans `test/verify-harness-liq.test.ts` un test nommé (par ex.
  `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`). Il lance la CA contre un serveur-fixture `node:http` sur
  `127.0.0.1:0` (aucun réseau, aucune dépendance), dans deux configurations :
  - **(α)** `tools/list` sert `describeGate(true)`, la description pré-lot (H3 présent, EMPTY absent), et `POST /gate` (Host
    `api.`) répond **400** « unknown task_class », comme le processus en ligne. Asserter `gate_liq_call.ok === false`,
    `mcp_gate_description_liq.ok === false` et un exit CA **≠ 0**. Il faut asserter `≠ 0` et non `=== 1` à cause de R-HD-2.
  - **(β)** `tools/list` sert une description qui porte **à la fois** EMPTY et H3 (l'état « empty-clause-keeps-coverage »), et
    `POST /gate` répond 200 avec `reason: "covered"`. Asserter les deux `ok === false`. C'est le seul cas qui tue G2-5b : sous
    (α), `hasEmpty` est déjà faux.
- **Ce n'est pas un « faux client » au sens de D-3.** Le système sous test est le *script CA* lui-même ; le serveur-fixture est
  le vecteur d'entrée adverse qu'exige D-2. Le même motif existe déjà en dépôt : `test/probe-narabi-state.test.ts:97-101`
  (`serve(stateBody)` = `createServer` servant un corps canné sur `127.0.0.1:0`, pour faire rougir la sonde réelle).
- **Limite nommée.** (α) et (β) ne tuent pas le retrait ISOLÉ de `&& said === true` dans `gate_liq_call`. C'est le contrôle D-3
  que le G1 a ajouté, plus strict que la lettre de C-5 ; sous (β), c'est `reason ≠ under_calib` qui fait déjà tomber `ok`.
  - **(γ), optionnel, même pli** : `POST /gate` répond 200 avec `reason: "under_calib"` mais SANS la phrase registre-vide dans
    `content` ; asserter alors `gate_liq_call.ok === false`.
  - Si (γ) n'est pas ajouté : **résidu déclaré à l'ADR**, avec déclencheur -2b (C-4 (c)), jamais tu.
- **Preuve exigée.** G2-5a, G2-5b et G2-5c doivent être rejoués ROUGES par ce test, en byIntended A-11 (mêmes chaînes que
  `F:\tmp\g2-hdesc1\g2-mutants.mjs`). Les 25 mutants du G1 et mes 8 mutants à tuer doivent rester rouges. R-25 est re-mesuré.
  L'item C-4 (c) s'étend à ce test : ses fixtures basculent à -2b.
- **Optionnel (O-6), même pli** : `mcp_gate_description_liq` peut aussi exiger l'absence de `LIQ_UPPER_BOUND_SENTENCE`. La
  lettre de C-5 est déjà tenue, et les SHA existants sont tous discriminés (pré-2a : EMPTY absent ; 2a..pré-lot : H3 présent ;
  lot : vert).

### Observations et items formés (non bloquants ; aucun « dû » nu)
- **O-1 (provenance, orchestrateur).** `docs/G1-lot-harness-desc-1.md` (`36e1312`, 5 106 o) **n'est pas** `F:\tmp\hdesc1\G1.md`
  (24 919 o, `fb9d6318…`), contrairement au « = » de la mission. C'est le message de synthèse du worker. Le rapport complet
  (table C-1..C-9, table des 25 mutants, D-1..D-7, reproduction §7) n'existe que sous `F:\tmp`, donc n'est pas vérifiable R-21
  depuis le dépôt. Action : persister le rapport complet au commit de fusion. Déclencheur : G7 de ce lot.
- **O-2, O-3, O-4** : voir §5. Corrections éditoriales à l'insertion de l'ADR ; O-4 contraint l'ordre du commit de fusion.
- **O-5 (flake hors lot, item formé).** `probe_state_digest_cross_check` a rougi 1 fois sur 4 exécutions, sous charge
  concurrente, et reste vert isolé et sans charge.
  - Propriétaire : orchestrateur.
  - Déclencheur : 2e occurrence en CI ou en oracle sans charge concurrente.
  - Piste à instruire : les bornes GET2 (`STATE_TIMEOUT_MS` 5 000, `scripts/probe-narabi.mjs:85`) sous charge.
  - Preuves : `logs/oracle-lot/test.log:1334-1350`, `logs/narabi-state-rerun-{1,2}.log`, `logs/oracle-lot-test2/`.
- **O-6** : voir C-G2-1, optionnel.
- **O-7 (ruling, constat).** COND servie sur registre vide (« the bound holds only if … ») : conforme au ruling
  (`CHANTIERS.md:866`), qui la qualifie d'énoncé de règle et non de revendication de couverture. Aucune action G2.
- **O-8** : parenthèse du RUNBOOK (§5), facultatif.
- **R-HD-2 : accepté**, préexistant et reproduit (§1 (9)). Aucun item.
- **R-HD-1 : accepté**, déclaration juste et mesurée sur la suite complète (§3.3). Tué par C-4 (d).

## 7. Verdict

**PASS-AVEC-CORRECTIONS.**
- **Ce qui est acquis, re-mesuré par moi.** Sur registre vide, la description servie de `gate` ne revendique plus aucune
  couverture. On le voit sur les 4 surfaces : EMPTY + REQ + COND, ni H3, ni UPPER, ni « calibrated on ». L'état -2b reproduit
  à l'octet près le texte pré-lot (`5574450432b7…`). Seul `gate.description` change sur `tools/list` et sur openapi. Le re-pin
  h5 `90a21adf…` se reproduit à l'octet sur les trois arbres fusionnés, dont **la cible actuelle** (`7cdfb7c` + lot, A-9
  fusionné ; `674cf9a` puis `7c70826` n'ajoutent que des docs). L'oracle est vert sur le lot (927/926/0/1 sans charge) et sur les trois fusions
  (939/937/0/2, 943/941/0/2, 943/941/0/2). Les 25/25 mutants du G1 et mes 8/8 sont tués par leur test attendu, sur trois arbres
  dont la cible actuelle. La CA rougit contre le harness pré-lot. R-25 = 350 et le gel est intact.
- **Ce qui manque.** C-G2-1 : la CA n'a pas de contrôle négatif dans la suite, et 3 mutants de ses prédicats survivent. C'est
  une correction de test seulement, sans changement de code servi, à plier avant G7 puis à vérifier par G2-delta ou par
  l'orchestrateur, mutants G2-5a/b/c rejoués ROUGES.
- **Items pour G7** :
  - O-1 : persister le rapport G1 complet.
  - O-2, O-3, O-4 : insérer l'ADR dans le même commit, avec les corrections éditoriales.
  - Réserve de fusion : A-9 est déjà fusionné, et la cible `lot/etude-suite` @ `7c70826` est mesurée via `merge-es2` (delta
    `7cdfb7c..7c70826` = docs seulement). Si `lot/etude-suite` reçoit du CODE avant la fusion (autre lot fusionné), G7 re-mesure l'oracle, le recorder
    h5 et les mutants sur l'arbre réellement fusionné. Il le fait aussi après le pli C-G2-1.

## 8. Reproduction (toujours sous `env -u` des 8 variables ; TEMP=`F:\tmp\g2-hdesc1\os-tmp`)

```
git clone --no-hardlinks --branch lot/harness-desc-1 F:\Monark F:\tmp\g2-hdesc1\tree ; powershell -NoProfile -File F:\tmp\g2-garde2bi\mk-nm.ps1 -Tree F:\tmp\g2-hdesc1\tree
bash F:/tmp/g2-hdesc1/oracle.sh F:/tmp/g2-hdesc1/tree <logdir>                       # 7 scripts, codes directs
node F:/tmp/g2-hdesc1/check-describe-g2.mjs                                           # sha describeGate(true) vs base + 4 surfaces
node F:/tmp/g2-hdesc1/served-diff.mjs F:/tmp/g2-hdesc1/base F:/tmp/g2-hdesc1/tree     # feuilles servies qui diffèrent
node F:/tmp/g2-hdesc1/g1-mutants-copy.mjs <tree> ; node F:/tmp/g2-hdesc1/g2-mutants.mjs <tree>
node F:/tmp/g2-hdesc1/fullsuite-mutant.mjs <tree> rhd1|g25a|g25b|g25c                 # survie sur la suite complète
node F:/tmp/g2-hdesc1/ca-run.mjs <harness-tree> <script-tree> [normal|fail]           # CA contre harness in-process
bash F:/tmp/g2-hdesc1/merged-checks.sh <merged-tree> <logdir>                         # recorder h5 + oracle
```
Nettoyage des clones (`tree`, `base`, `merge-es`, `merge-a9`, `merge-es2`) : `rm-nm.ps1` d'abord, jamais `Remove-Item -Recurse`
sur un `node_modules` de jonctions. Je les laisse en place pour la vérification R-21 ; après l'arrêt de session, les 5 ont été
contrôlés sans mutation résiduelle.

---
Fichier du rendu : `F:\tmp\g2-hdesc1\G2.md` (sha256 `80653475116384bfaf6e37fd3eac30072038f93de124b883aa212afb6af951af`, 35 251 o). Journaux sous `F:\tmp\g2-hdesc1\logs\`, scripts de mesure sous `F:\tmp\g2-hdesc1\`. Aucun commit, `F:\Monark` porcelain = 0.
