# G2-delta NARABI-OPS-1d (pli 7daf8e5) — PASS (Opus 5.5)

Modèle résolu : claude-opus-5-5[1m]

# G2-DELTA — lot NARABI-OPS-1d, pli `e12f59f..7daf8e5` (test-only) — **PASS**

> **Provenance (CA-8).** Relecteur G2-delta, instance séparée, contexte frais, 2026-09-22 (horloge `date -u` : début 19:07:23Z, fin 19:34:09Z). Modèle résolu déclaré par l'environnement : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` attendu après la décision 133 ; frontmatter `~/.claude/agents/worker.md` lu : `model: claude-opus-5-5`, `effort: max` ; le CORPS du même fichier annonce encore `claude-opus-4-8`, voir O-5). Clone isolé : `git clone --no-hardlinks --branch lot/narabi-ops-1d F:\Monark F:\tmp\g2-nops1d\tree-delta` → HEAD `7daf8e50e0c0893d17154c6c767c49b70b5a11fd`, parent `e12f59f0e650…`, `merge-base(7daf8e5, f6442fe) = f6442fe8ec0a…`. `mk-nm.ps1` → `entries: 220  monark: 10  fail: 0`, `require.resolve('@monark/rpc-guard')` → `F:\tmp\g2-nops1d\tree-delta\packages\rpc-guard\src\index.ts` (A-2). node v24.15.0 (win32). TEMP/TMP/TMPDIR = `F:\tmp\g2-nops1d\delta\tmp`. Tout oracle, harnais ou sonde tourne sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` (A-7 ; compte de présence imprimé = 0, aucune valeur lue ni affichée). **R-20** : aucun commit, aucun workflow déclenché, aucune écriture dans `F:\Monark` / `F:\Monark-wt-*` (les fusions à blanc sont faites dans des worktrees de MON clone, sans commit). **R-21** : chaque affirmation ci-dessous porte sa commande, son sha ou son log épinglé. Siège : je rends le **G2-delta seulement**. Le re-checkpoint-2 est le siège du validateur-humain : je ne le rends pas et je ne l'ai pas lu. Son commit `1be4a34` est apparu sur `lot/etude-suite` pendant ma revue ; je n'en ai consommé que la métadonnée « docs seulement » (§8).

## VERDICT G2-DELTA : **PASS**

Le pli est exactement ce qu'il déclare :
- +37/−0 sur un seul fichier de test ;
- `run.ts` golden `45557d6e…` et `rpc.ts` gelé `0e232519…` intacts ;
- 9 gelés byte-identiques.

Les deux tests sont verts sur le code réel. **Chacun rougit sous son mutant nommé, et sous lui seul.**
- L'oracle `env -u` égale l'attendu **933/931/0/2**.
- R-25 cumulé : **734**.
- La fusion à blanc est propre, deux fois : contre `a872716`, puis contre le HEAD déplacé `1d4f385`.

Les traces Linux C-V-1 **suffisent**. Je les ai **renforcées** par deux traces de première main sur le sha exact du pli : le run CI GitHub 110 (log téléchargé), et une reproduction docker indépendante, sans réseau, où V6 est rouge. Mes 14 mutants adverses se comportent tous comme déclaré.

Constats :
- **Deux corrections formées, pré-existantes à `e12f59f`**. Elles sont hors mandat du pli et non bloquantes pour ce G2-delta. C-G2D-1 (A-10 au sens strict non tenu pour la liste `endpoints` servie) est à plier avant le 2ᵈ redéploiement.
- **Cinq observations** de précision ou d'hygiène, dont O-1 : la revendication « A-10 fait » du RENDU est à requalifier « partiel ».

Aucune ne met en cause le code ni les tests du pli.

---

## 1. Diff exact du pli, golden `run.ts`, gel

- `git diff --numstat e12f59f 7daf8e5` = `37  0  apps/sentinel/test/sentinel-chainstack-guard.test.ts` (1 fichier, **+37/−0**).
  - `git diff --stat e12f59f 7daf8e5 -- . ':(exclude)apps/sentinel/test/sentinel-chainstack-guard.test.ts'` = **vide**.
  - Zéro ligne retirée ⇒ **aucune assertion existante affaiblie** (D-4).
  - Les 2 tests sont insérés entre `sentinel_guard_open_failure_degrades_to_keyless_and_publishes` et `sentinel_run_re_acquires_lock_after_clean_exit`.
- Blobs (`git show <c>:<f> | sha256sum`) :
  - `run.ts` = `45557d6e12739449…` à `e12f59f` **et** à `7daf8e5` ; à `f6442fe`, `54619a40…` = sha de prod E-5 ;
  - `rpc.ts` = `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` aux trois commits (gel D4) ;
  - `keyless-transport.ts` `be2266c5…` inchangé ;
  - fichier de test `2e3c5ad6170bfb…` → `3535eda25712ee48…`, égal à l'AVANT/APRÈS du RENDU.
- `sha256sum -c F:\tmp\nops1d\DELIVERED.sha256` depuis la racine du clone : **8/8 OK**.
- 9 gelés U-4b (arbre de travail LF), tous égaux aux valeurs G2/cp-2/RENDU :
  - `u4b-scores 2f9a31f6…`, `u4b-reduce a5e66cd3…`, `record-u4b-calib 5733daeb…` ;
  - `wadray 7bee76fc…`, `abi 3376eb08…`, `l1-split 9206df91…` ;
  - **`rpc.ts 0e232519…c65ca0`**, `calib-digest 3603265d…`, `u3-realized cb020425…`.
- Le bloc du test SIGTERM est **byte-identique** entre les deux commits. Extraction awk du `test("sentinel_run_releases_chainstack_lock_on_sigterm` jusqu'au `});` : `5a1f335e9864e381…`, 20 lignes, à `e12f59f` et à `7daf8e5` (sert au §7).
- `docs/PLI-lot-narabi-ops-1d.md` (sur `lot/etude-suite`) et `F:\tmp\nops1d\RENDU-PLI.md` ont le même sha256 `df7c7e58903bb2d2…`.
- Artefacts du worker épinglés et concordants : `mutants.mjs 80f4d6b9…`, `tmp\oracle.sh ddabb5f5…`, `tmp\probe-floor.mjs 10e93e0a…`.

## 2. Test « floor malformé » ⇒ `config_error`, 7 endpoints, 0 ligne ledger

- Vert sur le code réel (`✔ sentinel_chainstack_floor_malformed_is_config_error`, `delta\logs\o-test.log`).
- **Rouge sur `-3`, mesuré deux fois.**
  - (a) Sonde du worker rejouée sur MON clone : `DETAIL: floor "-3": the leg did not open => chainstack=false`, `run.ts restored byte-exact: true` (`delta\logs\probe-floor.log`).
  - (b) Mon harnais (R1, extraction du diagnostic YAML TAP) : assertion tueuse = `floor "-3": the leg did not open => chainstack=false` (expected false, actual true).
  - Donc, sous le mutant, **`abc` traverse toutes les assertions** (NaN attrapé par `assertLimits`) et `-3` est la première valeur discriminante.
- Mécanisme [lu] :
  - `packages/rpc-guard/src/client.ts:72-74` ne rejette que `typeof floor !== "number" || !Number.isFinite(floor)` et `floor > cls.cycleCap`. Sans la regex de `run.ts:256`, `-3` (fini, ≤ cap) **passe** `assertLimits`, et la jambe s'ouvre `ok`.
  - `openGuardedClient` valide AVANT tout verrou (`guarded.ts:36-37`).
  - L'ouverture n'écrit aucune ligne : les lignes n'apparaissent que sur `attempted`/`refused`/`unlocked` (`client.ts:100/123`).
- **Chaque valeur discrimine seule (mesuré).**
  - G2D-1 (regex n'admettant que les négatifs, `/^-?\d+$/`) : tuée sur `floor "-3"`.
  - **G2D-2 (regex admettant les décimaux, `/^\d+(\.\d+)?$/`) : tuée sur `floor "12.5"`.** Le RENDU affirmait « `12.5` discrimine aussi » par raisonnement, car la boucle s'arrête à `-3` sous `floor_regex_removed`. C'est désormais mesuré.
- **Les assertions secondaires sont porteuses.**
  - G2D-3 : le floor est parsé APRÈS l'ouverture du garde. Le verrou est pris avec floor 0, puis le throw fait rapporter `config_error`, mais le verrou fuit. Mutant tué sur `floor "abc": no lock is acquired when the floor is rejected before open` (expected false, actual true). L'assertion « pas de `.lock` » est donc porteuse, et `abc` discrimine cette classe-là.
  - G2D-8 : l'erreur de floor est routée vers la branche « not resolved from env » du classifieur. Mutant tué sur `… config_error (got unconfigured …)`. L'assertion lie donc la VALEUR du statut, pas seulement « dégradé ».
- Chemins non vacants [lu] :
  - `readLedger` lit `<ledgerDir>/<cycle>/chainstack.jsonl` (= `ledger.ts:96` `${op}.jsonl`) ;
  - le verrou est `<cycleDir>/chainstack.lock` (= `lock.ts:18` `${op}.lock`) ;
  - les mêmes helpers assertent des lignes non vides dans l'e2e `ok`.
- Linux (docker, §7) : `floor_regex_removed` ⇒ `not ok 9` seul, première erreur `floor "-3": the leg did not open => chainstack=false`.

## 3. Test « origine absente » ⇒ `unconfigured`, aucun `null` publié (A-10)

- Vert sur le code réel (`✔ sentinel_chainstack_origin_absent_is_unconfigured`).
- Mutant `origin_absent_half_removed` : **rouge, par son test nommé seul** (win32 et Linux).
  - **Mais l'assertion tueuse mesurée est `the leg did not open => chainstack=false`** (expected false, actual true). C'est un champ du JSON de fin sur **stdout**, évalué AVANT toute assertion sur `endpoints`.
  - Les assertions sur l'artefact servi (`endpoints.length`, `every(non-empty string)`) ne sont **jamais atteintes** sous ce mutant.
  - Le RENDU/PLI attribue donc le rouge au mauvais mécanisme (O-1), en §1 (« ⇒ `endpoints.length === 8` et le 8ᵉ n'est pas une chaîne … rougit sur le chemin de l'artefact réel `run.ts → timeline.jsonl` ») comme en §5 (A-10).
- **La propriété REVENDIQUÉE par le pli est tenue, mais par un autre mutant (mesuré).**
  - « 7 endpoints, aucun `null`/`undefined` publié » est tenue sur l'artefact servi par R3 = `origin_published_without_open`.
  - Sous R3, la lecture est préservée (le statut reste `unconfigured`) et la sortie est altérée (`undefined` publié en 8ᵉ endpoint, soit `null` dans la ligne JSON).
  - Le test « origine absente » rougit alors sur `a degraded run publishes the 7 public endpoints only` (expected 7, actual 8). L'assertion est lue sur `lastLine(dir)`, la dernière ligne de `timeline.jsonl` (l'artefact servi).
- **A-10 au sens strict n'est PAS tenu pour la liste `endpoints`.**
  - A-10 exige un mutant **type-valide** qui préserve la lecture et altère la sortie. R3 publie `undefined`, qui n'est pas type-valide à l'exécution.
  - Les mutants type-valides **survivent à toute la suite** : G2D-6a (liste publique altérée, branche dégradée), G2D-6b (branche `ok`) et G2D-7 (origine codée en dur).
  - Le test lie cardinalité, type et absence d'origine, mais pas l'ÉGALITÉ de la liste servie à sa source ⇒ C-G2D-1.
  - La case « A-10 fait » du RENDU §5 est à requalifier « partiel » (O-1).

## 4. Les 12 mutants rejoués, attribution TAP (`byIntended`)

Commande : `NOPS1D_WORKTREE=F:\tmp\g2-nops1d\tree-delta env -u … node F:\tmp\nops1d\mutants.mjs` (`delta\logs\mutants12.log`).
- Exit 0, `ALL MUTANTS KILLED (RED by named test) + RESTORED BYTE-EXACT (12 mutants)`, **12/12 `byIntended=true`**.
- `sha256sum -c` des 3 fichiers mutés OK après le rejeu ; `git status` du clone vide.
- Les deux nouveaux mutants sont tués **exclusivement** par leur test nommé (liste `failing` = un seul test chacun).
- Harnais conforme à A-11 : `--test-reporter=tap`, CRLF normalisé, `killed = red && restored && byIntended`.

Précision (O-2) : le RENDU §2 dit que trois mutants existants rougissent « AUSSI mes deux nouveaux tests ».
- Mesuré, `no_degrade_try_catch` ne rougit que le test floor : le chemin origine-absente retourne à `run.ts:285`, avant le `try`.
- `origin_published_without_open` et `chainstack_guard_hardcoded_ok` rougissent bien les deux.

## 5. Oracle `env -u` sur le clone @ `7daf8e5`

Commande : `bash F:\tmp\g2-nops1d\delta\oracle-delta.sh`, codes capturés hors pipe (A-3).

| Gate | Code | Mesure |
|---|---|---|
| `gate:vocab` | 0 | 222 fichiers |
| `typecheck` | 0 | |
| `test` | 0 | **tests 933 / pass 931 / fail 0 / skipped 2**, 0 `✖`, 57,5 s |
| `lint` | 0 | |
| `lint:ratchet` | 0 | 69/69 |
| `lang:gate` | 0 | |
| `export:check` | 0 | |

Skips nommés et motivés, inchangés :
- `sentinel_run_releases_chainstack_lock_on_sigterm` : `# win32: process.kill is a hard kill (no SIGTERM handler); RUNBOOK unlock covers a SIGKILL (C-7)` ;
- `u4b_labels_replay_via_main_real_artifact` : `# real e2 artifacts absent (A-rawlogs.jsonl gitignored / u3-raws-clean out of repo)`.

Les 2 nouveaux tests S'EXÉCUTENT sur win32.

## 6. R-25 cumulé

Pathspec `ci.yml:65` VERBATIM : `git diff --shortstat f6442fe...7daf8e5 -- . <exclusions>` = **8 files, 641+/93− = 734 < 1 150** (et < 1 205, `VIBEGATES_PR_LIMIT`).
- Décomposition : lot `f6442fe...e12f59f` = 697 ; pli `e12f59f...7daf8e5` = 37.
- Tel que la CI le calcule aujourd'hui (`origin/lot/etude-suite...7daf8e5`, merge-base `f6442fe`) : 734.
- Confirmé par la CI elle-même, job `r25-taille-de-lot` du run 110 : `Changed lines: 734 (ADR bound: 1205)`.

## 7. Les deux traces Linux C-V-1 : suffisent-elles ? **OUI**, et renforcées

Lecture des pièces fournies :
- **T1** `F:\tmp\nops1d\linux-sigterm-trace.log` (docker `node:24`, orchestrateur).
  - TAP : `tests 10 / pass 10 / fail 0 / skipped 0`, `ok 10 - sentinel_run_releases_chainstack_lock_on_sigterm`.
  - 10 tests ⇒ c'est la version `e12f59f` du fichier (le pli en porte 12).
  - **Extrait** : commence à `ok 2`, sans en-tête (ni sha, ni digest d'image, ni version de node, ni commande). Sa provenance repose sur CHANTIERS:784.
- **T2** `F:\tmp\nops1d\linux-sigterm-mutant-V6.log` : `not ok 10 - sentinel_run_releases_chainstack_lock_on_sigterm`, `pass 9 / fail 1`.
  - **Extrait** : la seule ligne de code montrée est `321:  if (leg.status === "ok") process.on("SIGTERM", onSigterm);`, c'est-à-dire la ligne NON mutée (localisation ou contrôle de restauration, ambigu).
  - Ni diff de mutation, ni sha du fichier muté, ni preuve de restauration.
- **T3** `F:\tmp\nops1d\ci-88-sigterm-trace.log` (GitHub Actions) : `✔ sentinel_run_releases_chainstack_lock_on_sigterm (429.49ms)`, `tests 931 / pass 930 / fail 0 / skipped 1`.
  - Authentifiée par moi : run **109** attempt 2 (id `35763895313`, PR brouillon #88, `headSha e12f59f…`, job `g3-verification` 18:12:13Z→18:13:42Z).
  - Les **5 lignes** de T3 se retrouvent **verbatim** (lignes entières, horodatages compris) dans le log du job que j'ai téléchargé (`grep -c -F` = 1 pour chacune).
  - « #88 » est le numéro de PR, pas de run (O-3).

**Jugement : suffisant.**
- Lettre de C-V-1 : « trace d'exécution Linux sur le sha rebasé, SIGTERM vert et idéalement V6 rouge ». T1 et T3 montrent le test SIGTERM **exécuté et vert** sur Linux à `e12f59f` ; T2 le montre **rouge** sans handler.
- **Transfert au pli** : le pli n'insère que deux tests. Le blob `run.ts` est identique (`45557d6e…`) et le bloc du test SIGTERM est byte-identique (`5a1f335e…`) entre `e12f59f` et `7daf8e5`. Le comportement SIGTERM et l'effet de V6 sont donc inchangés par construction.
- Faiblesse : T1 et T2 sont des extraits non auto-identifiants. Je l'ai compensée par deux traces de première main sur le sha exact du pli :
  - **T4 (CI, téléchargée)** : run **110** (id `35769452047`, attempt 1, `headSha 7daf8e5…`, conclusion `success`, 6 jobs verts).
    - Checkout `pull/88/merge` = `0f2c2d9` « Merge 7daf8e5 into f6442fe ».
    - `✔ sentinel_run_releases_chainstack_lock_on_sigterm (224.38ms)`, `✔` des deux nouveaux tests, **`tests 933 / pass 932 / fail 0 / skipped 1`** (seul skip : `u4b_labels_replay_via_main_real_artifact`).
    - Logs, lus seulement par `gh run view --log` (aucun workflow déclenché) : `delta\ci\run110-g3-verification.log` `2475a24d…`, `run109-g3-verification.log` `b257b647…`, `run110-r25.log` `e63f11f1…`.
  - **T5 (docker, indépendante, sans réseau)** :
    - Source : `git archive 7daf8e5` (`git get-tar-commit-id` = `7daf8e50e0c0…`, tar `ff9584c6…`), monté en lecture seule dans `node:24` (image `b795e77f6c25`, `node@sha256:64af3819f9275802…`).
    - Options `--network none --pull never --read-only`, `/work` et `/tmp` en tmpfs. **Aucun `npm ci`** : la fermeture d'imports du test n'a AUCUNE dépendance tierce (`delta\closure.mjs` : builtins `node:` plus 5 paquets `@monark` liés par symlink).
    - Linux 6.18 WSL2, node v24.21.0, clés présentes = 0.
    - Golden : **12/12, 0 skip**, `ok 12 - sentinel_run_releases_chainstack_lock_on_sigterm`.
    - **V6** : diff montré (`-  if (leg.status === "ok") process.on("SIGTERM", onSigterm);`), `run.ts` muté `240c8aa5…`. Résultat : `not ok 12` seul, `11/1`. Assertion tueuse : `the child exited after SIGTERM (the handler ran then process.exit)` (`notStrictEqual` ; code de sortie `null` = processus tué par le signal, sans handler). Restauré byte-exact.
    - Les deux mutants du pli sont aussi rouges sur Linux (§2, §3).
    - Logs : `delta\logs\linux-7daf8e5.log` `6ed6961a…`, `linux-7daf8e5-v6-diag.log` `2c8d1f48…`.

## 8. Fusion à blanc avec `lot/etude-suite` HEAD

- **Contre `a872716`** (HEAD au début de ma revue) :
  - `git merge-tree --write-tree origin/lot/etude-suite 7daf8e5` ⇒ exit 0, arbre `aabf138b…`.
  - Worktree `git merge --no-ff --no-commit 7daf8e5` ⇒ « Automatic merge went well », 0 non fusionné, 8 fichiers indexés (ceux du lot), `MERGE_HEAD 7daf8e5`, arbre d'index `aabf138b…`.
  - Hors `docs/`, l'arbre fusionné est identique à `7daf8e5` (diff vide) ; sous `docs/`, il est identique à `a872716` (diff vide). `lot/etude-suite` n'a touché QUE des docs depuis `f6442fe` (9 fichiers).
  - **Oracle sur l'arbre fusionné** : 7 gates à 0, **933/931/0/2**, mêmes 2 skips (`delta\logs-merge\oracle-merge.out`).
- **`lot/etude-suite` a bougé PENDANT ma revue** : `a872716` → `1d4f385` (commits `50f6d12`, `b130852`, `1be4a34`, `1d4f385` ; 15 fichiers, +236, **tous sous `docs/`** : `git diff --name-only a872716 1d4f385 -- . ':(exclude,glob)docs/**'` = vide).
- **Refait contre `1d4f385`** :
  - `merge-tree` exit 0, arbre `8d69d59d…` ;
  - worktree `--no-commit` propre (0 non fusionné, 8 indexés) ; code identique à `7daf8e5`, docs identiques à `1d4f385` ;
  - **oracle sur cet arbre : 7 gates à 0, 933/931/0/2, mêmes 2 skips** (`delta\logs-merge2\oracle-merge2.out` `d1a236e2…` ; le premier : `delta\logs-merge\oracle-merge.out` `6cecca95…`).
  - merge-base inchangé `f6442fe` ⇒ R-25 de la PR inchangé (734).

---

## Mes mutants

Harnais `F:\tmp\g2-nops1d\delta\g2d-mutants.mjs`, sous `env -u`, avec restauration de `run.ts` vérifiée par sha à chaque fois. Résultat dans `delta\logs\g2d-mutants.log` : `ALL OUTCOMES AS DECLARED + RESTORED BYTE-EXACT`, exit 0.

| Mutant | Fichiers exécutés | Résultat | Assertion tueuse (diagnostic TAP) |
|---|---|---|---|
| R1 `floor_regex_removed` (worker) | guard | TUÉ, test floor seul | `floor "-3": the leg did not open => chainstack=false` |
| R2 `origin_absent_half_removed` (worker) | guard | TUÉ, test origine seul | `the leg did not open => chainstack=false` (stdout, pas l'artefact servi) |
| R3 `origin_published_without_open` (worker) | guard | TUÉ (3 tests) | origine : `a degraded run publishes the 7 public endpoints only` (7 vs 8) : propriété « aucun null » tenue sur l'artefact servi (mutant non type-valide, donc pas la preuve A-10 stricte) ; floor : idem sur `abc` |
| R4 `chainstack_guard_hardcoded_ok` (worker) | guard | TUÉ (3 tests) | floor `abc` : `config_error (got ok …)` ; origine : `unconfigured (got ok …)` |
| R5 `no_degrade_try_catch` (worker) | guard | TUÉ (2 tests, PAS le test origine) | floor : `run.ts printed no end JSON … sentinel FATAL …` |
| G2D-1 regex `/^-?\d+$/` | guard | TUÉ, floor seul | `floor "-3": … chainstack=false` |
| G2D-2 regex `/^\d+(\.\d+)?$/` | guard | TUÉ, floor seul | `floor "12.5": … chainstack=false` |
| G2D-3 floor parsé après le verrou | guard | TUÉ, floor seul | `floor "abc": no lock is acquired when the floor is rejected before open` |
| G2D-8 erreur floor mal classée | guard | TUÉ, floor seul | `floor "abc": … config_error (got unconfigured …)` |
| G2D-4 moitié `origin.length === 0` retirée | **suite entière** | **SURVIT** (933/931/0/2) | aucun test ne pose `CHAINSTACK_ETH_ORIGIN=""` |
| G2D-5 moitié `cycleId.length === 0` retirée | **suite entière** | **SURVIT** | aucun test ne pose `CHAINSTACK_CYCLE_ID=""` |
| G2D-6a liste publique servie altérée (branche dégradée : 1ᵉʳ dupliqué, dernier retiré) | **suite entière** | **SURVIT** | 7 chaînes non vides sans chainstack.com : rien n'asserte l'égalité |
| G2D-6b idem, branche `ok` | **suite entière** | **SURVIT** | idem (longueur 8 et `providerOf` du dernier seulement) |
| G2D-7 origine servie codée en dur (`"https://ethereum-mainnet.core.chainstack.com"`) | **suite entière** | **SURVIT** | la constante `ORIGIN` du test (`:33`) est l'hôte canonique ; seul `providerOf(dernier) === "chainstack.com"` est asserté |

---

## Constats : corrections formées (zéro dette, propriétaire et déclencheur)

**C-G2D-1 : le liage A-10 de la liste `endpoints` servie a été PERDU par `e12f59f`.** Défaut pré-existant, hors mandat du pli, manqué par G1, G2 et cp-2.
- Mesuré : G2D-6a, G2D-6b et G2D-7 survivent à toute la suite.
- Cause [lu] :
  - à `f6442fe`, `run.ts:213` publiait `publishedEndpoints()`, dont la sortie est assertée verbatim par `sentinel-retry.test.ts:218` (`deepEqual(pub.slice(0, PUBLIC_ENDPOINTS.length), [...PUBLIC_ENDPOINTS])`) ;
  - depuis `e12f59f`, `run.ts:327` construit `published` en ligne et `publishedEndpoints` est MORTE ;
  - l'assertion verbatim lie donc désormais du code mort, et la liste servie n'est liée que par longueur et `providerOf`.
- Aggravant : l'item G1 §11-1 prévoit de SUPPRIMER ces assertions (`:214/:219`) avec le code mort. Après lui, il ne resterait plus aucun liage verbatim.
- **Correction (test seul, `run.ts` intouché)** :
  - dans les e2e dégradés (`ledger_error`, floor, origine absente, `url_alone`), asserter `deepEqual(written.endpoints, [...PUBLIC_ENDPOINTS])` ;
  - dans l'e2e `ok`, poser une `ORIGIN` non canonique (hôte `*.chainstack.com` distinct) et asserter `deepEqual(written.endpoints, [...PUBLIC_ENDPOINTS, ORIGIN])` ;
  - G2D-6a, G2D-6b et G2D-7 doivent alors rougir (harnais fourni).
- **Propriétaire** : orchestrateur, qui amende le texte de l'item §11-1 (« déplacer le liage verbatim sur le chemin servi, ne pas le supprimer »), puis worker au pli §11-1.
- **Déclencheur** : le pli §11-1 au plus tard, **AVANT le 2ᵈ redéploiement VPS** (option (b)).
- Non bloquant pour la fusion (b) : le VPS sert l'ancien `run.ts` jusqu'au redéploiement, et `run.ts:327` est correct à la lecture.

**C-G2D-2 : couverture des moitiés « chaîne vide » du garde `unconfigured` (`run.ts:285`).** Défaut pré-existant.
- Mesuré : G2D-4 et G2D-5 survivent à toute la suite.
- Sous G2D-4, une origine vide ouvrirait la jambe et publierait `""` en 8ᵉ endpoint.
- Sous G2D-5, un cycle vide ferait `ensureCycleDir(ledgerDir, "")` = la racine du ledger (`ledger.ts:74-79` [lu]), donc un ledger et un verrou hors cycle.
- Le code réel rejette les deux. Un `CHAINSTACK_CYCLE_ID=` vide dans un EnvironmentFile est plausible au basculement mensuel.
- **Correction** : paramétrer le test origine-absente (ou un test frère) avec `CHAINSTACK_ETH_ORIGIN=""` et `CHAINSTACK_CYCLE_ID=""` ⇒ `unconfigured`, 7 endpoints, pas de `.lock` ; G2D-4 et G2D-5 doivent rougir.
- **Propriétaire** : orchestrateur, puis worker. **Déclencheur** : même pli §11-1 (test seul). Non bloquant.

## Observations (précision et hygiène, non bloquantes, formées)

**O-1 : attribution A-10 dans le RENDU/PLI.**
- `docs/PLI-lot-narabi-ops-1d.md` §1 (test 2) et §5 (A-10) attribuent le rouge sur l'artefact servi à `origin_absent_half_removed`.
- Mesuré (R2, win32 et Linux) : ce mutant est tué par l'assertion `chainstack === false` du JSON de fin ; les assertions `endpoints` ne sont jamais atteintes.
- La propriété « aucun `null` publié » est portée par `origin_published_without_open` (R3). A-10 au sens strict (mutant type-valide) n'est pas tenu pour `endpoints` (C-G2D-1). « A-10 fait » du RENDU §5 est donc à requalifier « partiel ».
- Même ombrage dans le test floor : le rouge de `floor_regex_removed` vient de `chainstack === false`, pas de `config_error`, du ledger ni du verrou. Ces trois assertions sont prouvées porteuses par G2D-3, G2D-8 et R4.
- **Propriétaire** : orchestrateur (erratum du PLI au G7).
- Mesuré vers 19:2xZ (`g2d-mutants.log` mtime 19:28:51Z), avant les commits `1be4a34` et `1d4f385`, dont le sujet mentionne un erratum C-RV-2 de même nature. Il s'agit d'une convergence, pas d'une consultation.

**O-2 : comptes du RENDU.**
- F-2 annonce 4 tirets cadratins (« 2 par libellé »). Mesuré sur les lignes ajoutées : **6** (2+2 dans les libellés, 1 dans un commentaire, 1 dans un message d'assertion). Les gates sont verts ; seul le texte est inexact.
- La note §2 du RENDU est aussi inexacte (cf. §4 ci-dessus : `no_degrade_try_catch` ne rougit que le test floor).
- **Propriétaire** : orchestrateur (annotation G7).

**O-3 : provenance des traces.**
- T1 et T2 sont des extraits non auto-identifiants : pas de sha, d'image, de version ni de commande ; T2 n'a ni diff de mutation ni preuve de restauration.
- « CI #88 » désigne la PR ; les runs sont 109 (attempt 2, `e12f59f`) et 110 (`7daf8e5`).
- Compensé ici par T4 et T5.
- Recommandation : toute trace future porte un en-tête (sha, digest d'image, node, commande), le diff de mutation et le sha de restauration, et cite les ids de run.
- **Propriétaire** : orchestrateur. **Déclencheur** : prochaine trace (consigne).

**O-4 : heures du journal (hors lot).** CHANTIERS étiquette les entrées avec des heures « UTC » qui ne correspondent pas aux commits :

| Étiquette CHANTIERS | Heure réelle (UTC) |
|---|---|
| « Pli NARABI-OPS-1d (19:0x UTC) » | `7daf8e5` commité **18:45:27Z** (journal `58a1ff0` 18:46:59Z) |
| « G2 U-4b-1b-3 (19:1x UTC) » | `a41331b` commité **18:58:50Z** |
| « Post-restart (19:5x UTC) » | porté par `a872716`, commité **19:02:53Z** ; `date -u` lisait 19:07:23Z au début de cette revue |

- Preuve : `TZ=UTC git log --format='%h %cd' --date=iso-local`.
- Récidive du défaut « heures du journal » (C-V-5 de -b3d).
- **Propriétaire** : orchestrateur. **Déclencheur** : prochaine écriture CHANTIERS (recalcul par `TZ=UTC git log`).

**O-5 : R-1, application incomplète de la décision 133 (hors lot).**
- Les frontmatters sont bien ré-épinglés (`worker.md`, `chercheur.md`, `lecteur.md` : `model: claude-opus-5-5`, `effort: max`).
- Mais les CORPS sont périmés :
  - `worker.md:13` : « Modèle épinglé `claude-opus-4-8` » ;
  - `worker.md:32` : « l'orchestrateur vérifie le préfixe `claude-opus-4-8` » ;
  - **`chercheur.md:59` : « attendu : `claude-sonnet-5`. Si le préfixe diffère, arrête et signale »**. Un chercheur sous Opus 5.5 s'arrêtera donc à sa Gate 0.
- Lecture seule : je n'ai modifié aucun fichier d'agent.
- **Propriétaire** : orchestrateur. **Déclencheur** : avant le prochain lancement de chercheur (bloquant pour ce rôle) ou de worker.

**Rappel G2 (non nouveau)** : le message du commit `e12f59f` porte la tally pré-rebase 877/875/0/2 ; la tally réelle est écrite au G7.

## Innocuité (preuves)

- `F:\Monark` : `status --porcelain` 0 et `stash` 0, au début (HEAD `a872716`) comme à la fin (HEAD `1d4f385`). Le HEAD a été avancé par l'orchestrateur pendant ma revue ; je n'y ai lancé que des commandes de lecture, sans aucune écriture.
- `F:\Monark-wt-nops1d` : HEAD `7daf8e5`, status 0, au début et à la fin.
- Clone : status 0 après l'oracle, les 12 et 14 mutants et la sonde (`run.ts` `45557d6e…` restauré, `sha256sum -c` OK).
- `narabi-guard-*` sous `C:\Users\KACIMI\AppData\Local\Temp` : 0 au début et à la fin ; sous mon TEMP F: : 0.
- Réseau : seulement la lecture des logs CI (`gh run view`, lecture seule). Conteneur docker en `--network none --pull never`, sans clé.
- Les worktrees de fusion à blanc `F:\tmp\g2-nops1d\merge-delta{,2}` sont laissés en état MERGE non commité. Leurs `node_modules` sont des jonctions : à retirer par `rm-nm.ps1` AVANT toute suppression récursive.

## Conformité R- / MAST

- **R-1** : `claude-opus-5-5[1m]` (voir O-5 pour les corps d'agents).
- **R-20** : aucun commit, aucun workflow.
- **R-21** : preuves ci-dessus, artefacts épinglés.
- **R-22** : aucun gate suspendu.
- **R-25** : 734 < 1 150.
- **CA-9 (indépendance)** : clone isolé, `node_modules` re-pointé, `env -u`, mutants et diagnostics à moi, traces Linux reproduites de première main ; le re-cp-2 n'a pas été lu.
- **MAST** :
  - FM-2.4 (test fabriquant son entrée) : les deux tests réutilisent `STUB_SRC`, de forme réelle (A-8) ;
  - FM-3.3 (mesure sous clé ambiante) : `env -u` partout, 0 clé dans le conteneur ;
  - FM-3.2/3.3 (vérification incomplète) : c'est précisément ce que C-G2D-1 et O-1 attrapent (assertions ombrées, liage verbatim déplacé vers du code mort).

## Reproduction

```
git clone --no-hardlinks --branch lot/narabi-ops-1d F:\Monark F:\tmp\g2-nops1d\tree-delta
powershell -NoProfile -File F:\tmp\g2-garde2bi\mk-nm.ps1 -Tree F:\tmp\g2-nops1d\tree-delta
# tous sous env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY
git diff --numstat e12f59f 7daf8e5 ; sha256sum -c F:\tmp\nops1d\DELIVERED.sha256
bash F:\tmp\g2-nops1d\delta\oracle-delta.sh                                   # 933/931/0/2, 7 gates = 0
NOPS1D_WORKTREE=F:\tmp\g2-nops1d\tree-delta node F:\tmp\nops1d\mutants.mjs     # 12/12 byIntended
NOPS1D_WORKTREE=F:\tmp\g2-nops1d\tree-delta node F:\tmp\nops1d\tmp\probe-floor.mjs   # floor "-3"
node F:\tmp\g2-nops1d\delta\g2d-mutants.mjs                                    # 14 mutants, diagnostics TAP
git diff --shortstat f6442fe...7daf8e5 -- . <pathspec ci.yml:65>               # 641+/93- = 734
git merge-tree --write-tree origin/lot/etude-suite 7daf8e5                      # exit 0
MSYS_NO_PATHCONV=1 docker run --rm --pull never --network none --read-only --tmpfs /work:rw,exec,size=1g --tmpfs /tmp:rw,exec,size=512m -v "F:/tmp/g2-nops1d/delta/linux-src:/src:ro" -v "F:/tmp/g2-nops1d/delta/linux-script:/script:ro" -w /work node:24 bash /script/linux-run.sh
gh run view --job 106887215941 --log --repo KraidleAI/monark-governance      # run 110, lecture seule
```

Artefacts épinglés (sha256) :
- scripts :
  - `delta\oracle-delta.sh c09eb0b6…`
  - `delta\g2d-mutants.mjs e1b8ae31…`
  - `delta\closure.mjs 2a3286a5…`
  - `delta\linux-script\linux-run.sh 8bc5751a…`
  - `delta\linux-script\linux-v6-diag.sh c9557138…`
  - `delta\linux-7daf8e5.tar ff9584c6…`
- logs `delta\logs\` :
  - `o-test.log b4b981f6…`
  - `oracle-run1.out ab2c9bbb…`
  - `mutants12.log 99d4ba54…`
  - `g2d-mutants.log 7cbe7ddb…`
  - `probe-floor.log 6d183e9e…`
  - `linux-7daf8e5.log 6ed6961a…`
  - `linux-7daf8e5-v6-diag.log 2c8d1f48…`
- logs CI `delta\ci\` :
  - `run110-g3-verification.log 2475a24d…`
  - `run109-g3-verification.log b257b647…`
  - `run110-r25.log e63f11f1…`
- oracles de fusion :
  - `delta\logs-merge\oracle-merge.out 6cecca95…`
  - `delta\logs-merge2\oracle-merge2.out d1a236e2…`

**Verdict G2-DELTA : PASS.** R-1 : `claude-opus-5-5[1m]`.
