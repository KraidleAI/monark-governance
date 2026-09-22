# PLI NARABI-OPS-1d (test-only) — worker Opus 4.8 — corrections C-V-2 / C-V-3 / C-V-5 (C-G2-2)

Modèle résolu : claude-opus-4-8[1m]

> **Provenance (CA-8).** Worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22. Travail DIRECT dans le worktree `F:\Monark-wt-nops1d` (branche `lot/narabi-ops-1d` @ `e12f59f`, base `lot/etude-suite` @ `f6442fe`, `node_modules` déjà pointés). `require.resolve('@monark/rpc-guard')` → `F:\Monark-wt-nops1d\packages\rpc-guard\src\index.ts` (A-2, le worktree, pas `F:\Monark`). node v24.15.0. TEMP/TMP/TMPDIR sur `F:\tmp\nops1d\tmp`. Tout oracle / harnais / probe sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` (A-7 ; aucune valeur d'env affichée, contrôle par présence seulement). **R-20** : aucun commit, aucun workflow. **R-21** : chaque affirmation porte sa preuve reproductible (commandes, sha, TAP, tally). **Pli test-only** : `apps/sentinel/src/run.ts` NON MODIFIÉ (restauré byte-exact après chaque mutation transitoire, sha `45557d6e…` inchangé) ; `rpc.ts` gelé (`0e232519…`) intact.

## Résultat : TOUS LES LIVRABLES FAITS, ZÉRO DETTE

- **2 tests e2e ajoutés** dans `apps/sentinel/test/sentinel-chainstack-guard.test.ts` (calque exact des e2e existants — `spawnSync` du `run.ts` réel via `runGuardedSync`, stub `globalThis.fetch` A-8, `guardEnv`), verts sur le code réel.
- **2 mutants ajoutés** à `F:\tmp\nops1d\mutants.mjs` + **harnais corrigé (C-V-5)**. **12/12 mutants TUÉS**, chacun ROUGE par son test NOMMÉ (`byIntended=true`), restauration byte-exacte (sha avant/après).
- **Oracle `env -u` complet vert** : **933 / 931 / 0 / 2** (= attendu) ; lint 0 ; ratchet 69/69 ; lang:gate 0 ; export:check 0 ; gate:vocab 0. **R-25 folded 734 < 1 150**. **9 sha gelés byte-identiques**.
- `RENDU-PLI.md` (ce fichier) + `DELIVERED.sha256` régénéré (validé 8/8).

---

## 1. Livrables 1 & 2 — les deux tests (mécanisme MESURÉ, pas raisonné)

### Test 1 — `sentinel_chainstack_floor_malformed_is_config_error` (C-V-3 / C-G2-2)

Une boucle sur `["abc", "-3", "12.5"]` ; pour CHAQUE valeur, `runGuardedSync` lance le `run.ts` réel avec `CHAINSTACK_CYCLE_FLOOR` posé (cycle + origine présents par défaut `guardEnv`), parent ledger pré-créé (`mkdirSync(dir/ledger)`, C-8). Assertions : `chainstack_guard === "config_error"`, `exit 0`, `chainstack === false`, `endpoints.length === 7` (aucune origine chainstack.com), `readLedger === []` (aucune ligne), pas de `.lock`.

- **Code réel (mesuré)** : `ok 9` — les trois valeurs donnent `config_error`. Mécanisme : `chainstackFloorFromEnv` (run.ts:256) throw sur le regex `/^\d+$/` DANS le `try` de `openChainstackLeg` (run.ts:289-298) **avant** `openGuardedClient` (run.ts:295) ⇒ `classifyGuardOpenError` → `config_error` ⇒ le throw précède toute ouverture ⇒ ni `.lock`, ni sous-dossier `<cycle>/`, ni ligne ledger.
- **Mutant `floor_regex_removed`** (`if (!/^\d+$/.test(raw))` → `if (false)`) : **ROUGE** — le rouge tombe sur `floor "-3"` (mesuré, probe transitoire) : `not ok 9 … floor "-3": the leg did not open => chainstack=false`. Sous le mutant, `-3` (floor NÉGATIF) passe `assertLimits` (`client.ts:72-74` [lu] : rejette seulement `!Number.isFinite(floor)` et `floor > cycleCap` ; `-3` est fini et `≤ 16 M` ⇒ **accepté**) ⇒ la jambe s'ouvre `ok` ⇒ `chainstack === true`. **Ceci montre exactement que `-3` passerait** (la regex est porteuse et n'était couverte par AUCUN test — mutant survivant au G2/checkpoint-2).
- **Finding déclaré (non-dette)** : `abc` NE discrimine PAS (`Number("abc")` = NaN → `assertLimits` throw `!Number.isFinite` → `config_error` même muté) ; `12.5` discrimine aussi (fini, `≤ cap`, accepté). Le kill repose sur `-3`/`12.5`, jamais sur `abc` ; le test l'énonce dans son libellé (D-2).

### Test 2 — `sentinel_chainstack_origin_absent_is_unconfigured` (C-V-2 / C-G2-2 ; A-10 liage de sortie)

`runGuardedSync(dir, …, { origin: false })` (utilise le paramètre `guardEnv` existant) : `CHAINSTACK_CYCLE_ID` posé, `CHAINSTACK_ETH_ORIGIN` absent, parent ledger pré-créé. Assertions : `chainstack_guard === "unconfigured"`, `exit 0`, `chainstack === false`, `endpoints.length === 7`, `endpoints.every(e => typeof e === "string" && e.length > 0)` (aucun `null`/`undefined`), aucune origine chainstack.com.

- **Code réel (mesuré)** : `ok 10` — `origin === undefined` ⇒ run.ts:285 retourne `unconfigured` **avant** d'ouvrir ⇒ 7 endpoints publics, aucune origine.
- **Mutant `origin_absent_half_removed`** (retrait de ` || origin === undefined || origin.length === 0` du garde run.ts:285) : **ROUGE** — cycle posé + origine absente ne dégrade plus ⇒ la jambe s'ouvre `ok`, `run.ts` publie `leg.origin!` (undefined) en 8ᵉ endpoint ⇒ dans la ligne servie `timeline.jsonl` c'est un `null` ⇒ `endpoints.length === 8` et le 8ᵉ n'est pas une chaîne. **A-10** : le test lie la SORTIE servie (`endpoints`) à sa source (`leg.origin`), pas seulement la lecture ; un mutant qui préserve la lecture du cycle et altère la sortie publiée (type-valide) rougit sur le chemin de l'artefact réel `run.ts` → `timeline.jsonl`.
  > **Erratum (re-checkpoint-2 C-RV-2, orchestrateur 2026-09-22 19:4x UTC)** : l'assertion TUEUSE mesurée du mutant est `chainstack=false` (`true !== false`, ordre des asserts : status, chainstack, chainstack_guard, puis endpoints) — pas « `endpoints.length === 8` ». Le mécanisme décrit (origine `undefined` publiée en 8ᵉ) est exact ; les assertions `length`/`every string` s'exécutent bien sur l'artefact réel et un `null` publié est tué par `origin_published_without_open` via la longueur.

Diff des tests (D-4) : **+2 tests** (aucune assertion existante affaiblie ni supprimée) ; une boucle interne au test 1 réordonnée `[abc,12.5,-3]`→`[abc,-3,12.5]` pour que la démonstration empirique tombe sur `-3` (le code réel est insensible à l'ordre — les trois throw au regex). TS strict : `endpoints.every(e => typeof e === "string" && e.length > 0)` évite un `TS2367` sur `string[]` ; `typecheck` vert.

## 2. Livrable 3 — 2 mutants + harnais C-V-5

### Les 2 mutants (dans `mutants.mjs`)

| name | file | find → replace | kills (test nommé) |
|---|---|---|---|
| `floor_regex_removed` | `apps/sentinel/src/run.ts` | `if (!/^\d+$/.test(raw))` → `if (false)` | `sentinel_chainstack_floor_malformed_is_config_error` |
| `origin_absent_half_removed` | `apps/sentinel/src/run.ts` | ` \|\| origin === undefined \|\| origin.length === 0` → `` | `sentinel_chainstack_origin_absent_is_unconfigured` |

Chaque `find` est unique dans `run.ts` (occ = 1, vérifié par le harnais ; le regex budget `/^[1-9]\d*$/` diffère de `/^\d+$/`).

### Correction du harnais (C-V-5)

`runFileRed` (le G1 ne capturait AUCUN nom de test rouge sur win32) corrigé, quatre points :
1. **`--test-reporter=tap`** forcé (le reporter par défaut win32 à travers un pipe n'émettait pas de lignes `not ok`) ;
2. **`maxBuffer: 64 MiB`** (le défaut 1 MiB pouvait tronquer un gros flux TAP) ;
3. **normalisation CRLF** (`out.replace(/\r\n/g,"\n")`) avant le match `^not ok \d+ - (.+)$` (win32 émet `\r\n`) ;
4. **capture + attribution** : `byIntended = failing.some(n => n.includes(m.kills))` (le TAP imprime le nom COMPLET dont `m.kills` est le préfixe identifiant) ; un mutant qui ne rougit que d'AUTRES tests est signalé (`byIntended=false`), non masqué. La porte est désormais `killed = red && restored && byIntended` (D-1 renforcé). Un bloc « Killer test names » imprime `mutant -> test nommé`.

### Rejeu des 12 mutants (mesuré, `env -u`, `NOPS1D_WORKTREE=F:\Monark-wt-nops1d`)

```
ALL MUTANTS KILLED (RED by named test) + RESTORED BYTE-EXACT (12 mutants)   exit 0
```

| mutant | red | restored | byIntended | test tueur nommé |
|---|---|---|---|---|
| paid_leg_raw_fetch | ✓ | ✓ | ✓ | sentinel_chainstack_leg_writes_ledger_line_before_fetch |
| env_key_read_in_run_ts | ✓ | ✓ | ✓ | sentinel_src_clean_and_allowlist_load_bearing |
| origin_published_without_open | ✓ | ✓ | ✓ | sentinel_guard_open_failure_degrades_to_keyless_and_publishes |
| no_lock_release_in_finally | ✓ | ✓ | ✓ | sentinel_run_re_acquires_lock_after_clean_exit |
| no_degrade_try_catch | ✓ | ✓ | ✓ | sentinel_guard_open_failure_degrades_to_keyless_and_publishes |
| timeout_30s | ✓ | ✓ | ✓ | sentinel_chainstack_leg_uses_20s_timeout |
| budget_leading_zero_accepted | ✓ | ✓ | ✓ | sentinel_budget_env_is_validated |
| max_day_success_only | ✓ | ✓ | ✓ | sentinel_max_day_ms_covers_the_slowest_faulting_day |
| keyless_transport_delisted | ✓ | ✓ | ✓ | sentinel_src_clean_and_allowlist_load_bearing |
| chainstack_guard_hardcoded_ok | ✓ | ✓ | ✓ | sentinel_guard_open_failure_degrades_to_keyless_and_publishes |
| **floor_regex_removed** (nouveau) | ✓ | ✓ | ✓ | **sentinel_chainstack_floor_malformed_is_config_error** |
| **origin_absent_half_removed** (nouveau) | ✓ | ✓ | ✓ | **sentinel_chainstack_origin_absent_is_unconfigured** |

Note (couverture, non-dette) : trois mutants existants (`origin_published_without_open`, `no_degrade_try_catch`, `chainstack_guard_hardcoded_ok`) rougissent AUSSI mes deux nouveaux tests — recouvrement sain (les deux tests assertent bien 7 endpoints / aucun null / statut fermé dans le cas dégradé) ; chaque mutant conserve son propre test tueur nommé (`byIntended=true`).

## 3. Livrable 4 — oracle `env -u` + gates + R-25 + gel

Oracle (`F:\tmp\nops1d\tmp\oracle.sh`, codes capturés DIRECTEMENT `> log 2>&1; echo =$?`, A-3) :

| gate | exit | mesure |
|---|---|---|
| `gate:vocab` | 0 | scanned 222 file(s), no forbidden claim (scope sentinel = mon fichier de test inclus) |
| `typecheck` (tsc --noEmit) | 0 | — |
| `test` | 0 | **tests 933 / pass 931 / fail 0 / skipped 2** |
| `lint` (eslint) | 0 | — |
| `lint:ratchet` | 0 | 69/69 (plafond committé mesuré ; mes tests n'ajoutent aucune violation) |
| `lang:gate` | 0 | 0 hit français |
| `export:check` | 0 | 0 chemin interdit, 0 hit français non exempté (scopes incl. sentinel) |

- **Les 2 skips** sont les pré-existants (inchangés, non vacueux) : `sentinel_run_releases_chainstack_lock_on_sigterm` (skip win32 déclaré) et `u4b_labels_replay_via_main_real_artifact` (artefacts e2 gitignorés). Mes 2 nouveaux tests s'EXÉCUTENT (verts sur win32), aucun skip.
- **R-25** (pathspec `.github/workflows/ci.yml:65` VERBATIM, base `f6442fe`) : lot committé `f6442fe..HEAD` = **697** (604+/93−, == G2) ; **folded lot+pli** (`f6442fe`..arbre de travail) = **734** (641+/93−) **< 1 150** ; delta du pli = **+37** insertions (le seul fichier .ts non-fixture touché). Aucune couture nécessaire.
- **9 sha gelés U-4b byte-identiques** (LF working-tree) — TOUS concordent avec les valeurs G2/checkpoint :

```
2f9a31f6…  scripts/census/u4b/u4b-scores.mjs
a5e66cd3…  scripts/census/u4b/u4b-reduce.mjs
5733daeb…  scripts/record-u4b-calib.mjs
7bee76fc…  apps/sentinel/src/ukemi/wadray.ts
3376eb08…  apps/sentinel/src/ukemi/abi.ts
9206df91…  packages/hikae/src/l1-split.ts
0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0  apps/sentinel/src/rpc.ts   (== gel D4, ADR-U4b §1)
3603265d…  packages/contracts/src/calib-digest.ts
cb020425…  scripts/census/u3-realized.mjs
```

## 4. Livrable 5 — DELIVERED.sha256 régénéré + P5

`F:\tmp\nops1d\DELIVERED.sha256` régénéré (chemins relatifs au worktree, `*` binaire), **validé 8/8** (`sha256sum -c` depuis la racine du worktree). SEUL le fichier de test change :

- `apps/sentinel/test/sentinel-chainstack-guard.test.ts` : `2e3c5ad6170bfb…` (AVANT) → `3535eda25712ee485aef23426ac76fe709404e198681e36eda58b3583e619ef7` (APRÈS).
- Les 7 autres byte-identiques : `keyless-transport.ts be2266c5…`, `run.ts 45557d6e…`, `sentinel-catchup-budget.test.ts f65cd05e…`, `sentinel-retry.test.ts 52733f90…`, `rpc-guard-fetch-only-inside-client.test.ts 7ca95702…`, `probe-narabi.test.ts 7c84a759…`, `monark-sentinel.service d526f9c0…`.

**Innocuité** : `git status --short` = une seule entrée (` M apps/sentinel/test/sentinel-chainstack-guard.test.ts`). Aucun `narabi-guard-*` sous `C:\Users\KACIMI\AppData\Local\Temp` (0, après oracle + harnais + probe). `run.ts`/`keyless-transport.ts`/le fichier grep restaurés byte-exact après chaque mutation transitoire. Aucun réseau (fetch bouchonné, hôtes `.test`, clé factice `DO_NOT_PUBLISH_chainkey`). Aucun commit (R-20).

## 5. Consigne standard G1 (`docs/CONSIGNE-STANDARD-G1.md`) — point par point

- **A-1** fait — 1ʳᵉ ligne `Modèle résolu : claude-opus-4-8[1m]`.
- **A-2** fait — `require.resolve('@monark/rpc-guard')` → `F:\Monark-wt-nops1d\packages\rpc-guard\src\index.ts` (worktree ; `node_modules` déjà pointés).
- **A-3** fait — codes capturés directement (oracle.sh, `> log 2>&1; echo =$?`), oracle complet (vocab/typecheck/test pass-fail-skip/lint/ratchet/lang/export).
- **A-4** fait — `DELIVERED.sha256` régénéré (relatif worktree, validé 8/8) ; rendu sous `F:\tmp\nops1d\` ; aucun commit ; rien sur `C:` ; aucun réseau.
- **A-5** fait — R-25 pathspec `ci.yml:65` verbatim, base `f6442fe` ; folded 734 < 1 150.
- **A-6** fait — 9 sha gelés listés byte-identiques AVANT/APRÈS ; `rpc.ts 0e232519…` (gel D4) intact ; 7 fichiers livrés inchangés, seul le test change.
- **A-7** fait — oracle + harnais + probe sous `env -u` des 8 clés ; TEMP sur `F:` ; aucune variable d'env imprimée (contrôle par présence seulement).
- **A-8** fait (hérité + réutilisé) — mes 2 tests réutilisent `runGuardedSync`/`STUB_SRC`/`guardEnv` : corps de forme réelle `{jsonrpc,id,result}` (le test A-8 `…consumes_real_form_bodies` reste vert).
- **A-9** n-a — pli test-only ; aucune phrase servie ni constante servie modifiée.
- **A-10** fait — test 2 lie la sortie servie `endpoints` à sa source `leg.origin` ; mutant préservant-lecture / altérant-sortie (publie `undefined`) rougit sur l'artefact réel `run.ts`→`timeline.jsonl`.
- **B-1..B-6** n-a — aucun nouveau traitement de clé/corps payant ; mes tests n'introduisent aucune lecture d'env ; clé factice `DO_NOT_PUBLISH` ; l'e2e existant asserte déjà l'absence de fuite (`!stdout.includes(SECRET_MARK)`).
- **C-1..C-4** n-a — aucune classe d'erreur / couche de retry / classifieur touché (`run.ts` gelé pour le pli).
- **D-1** fait — chaque test imposé a son mutant NOMMÉ ROUGE, rejoué par `mutants.mjs` (mutation transitoire, restauration byte-exacte par sha, attribution TAP au test nommé).
- **D-2** fait — vecteurs synthétiques non vides (3 floors malformés + origine absente), valeurs recomputées (endpoints.length, chainstack_guard, ledger vide), aucun vert sur entrée vide/legacy.
- **D-3** fait — intégration non-LLM bout-en-bout : `spawnSync(node --import <stub globalThis.fetch> run.ts)`, garde réel, ledger réel, seul `globalThis.fetch` bouchonné.
- **D-4** fait — aucune assertion affaiblie ; diff = + 2 tests (annoté ci-dessus).
- **E-1..E-3** n-a — verrou / ledger durable / cooldown non touchés (couverts par les tests existants inchangés).
- **F-1** n-a — pas de nouvel ADR de pièce (tuyaux de la jambe gardée au G1 §4) ; aucun renvoi `F:\tmp` dans les SOURCES du dépôt (le harnais `mutants.mjs` est hors dépôt, non-source, non compté R-25).
- **F-2** fait — sources gate-propres (`gate:vocab`/`lang:gate`/`export:check` verts sur le scope sentinel qui inclut mon fichier) ; le pli ajoute **4 tirets cadratins `—`** (U+2014, 2 par libellé de test), suivant la convention des 10 tests existants du fichier — c'est le seul non-ASCII, aucun nouveau type introduit, aucun gate ne le refuse ; aucune clé réelle (factice `DO_NOT_PUBLISH`).
- **F-3** fait — déviation déclarée (mutant floor non-discriminant sur `abc`, NaN attrapé — énoncé, pas contourné) ; aucun double échec ⇒ aucune consultation formée due.

## 6. Conformité R- / MAST

- **R-1** `claude-opus-4-8[1m]` (préfixe vérifié). **R-20** aucun commit/workflow. **R-21** chaque affirmation → preuve reproductible. **R-22** aucun gate suspendu. **R-25** 734 < 1 150.
- **MAST** : FM-2.4 (test fabriquant son entrée) contré par A-8 (stub de forme réelle, réutilisé). FM-3.3 (mesure sous clé ambiante) contré par A-7 (`env -u` sur oracle + harnais + probe). Fuite de clé : mes tests ne lisent aucune clé ; run.ts gelé ; e2e asserte l'absence de `SECRET_MARK`.

## 7. Reproduction

```
# tous sous : env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL \
#   -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY   (TEMP/TMP/TMPDIR=F:\tmp\nops1d\tmp)
cd F:\Monark-wt-nops1d
node --test --test-reporter=tap --test-timeout=120000 apps/sentinel/test/sentinel-chainstack-guard.test.ts   # ok 9 (floor), ok 10 (origin)
NOPS1D_WORKTREE=F:\Monark-wt-nops1d node F:\tmp\nops1d\mutants.mjs                                            # 12/12 killed + byIntended + restored
bash F:\tmp\nops1d\tmp\oracle.sh                                                                             # 933/931/0/2, 7 gates =0
NOPS1D_WORKTREE=F:\Monark-wt-nops1d node F:\tmp\nops1d\tmp\probe-floor.mjs                                   # mutant reds on floor "-3", run.ts restored byte-exact
# R-25 : git diff --shortstat f6442fe -- . ':(exclude,glob)docs/**/*.md' … (pathspec ci.yml:65) => 641+/93- = 734
# gel  : sha256sum <9 fichiers> ; rpc.ts == 0e232519…c65ca0
sha256sum -c F:\tmp\nops1d\DELIVERED.sha256                                                                  # 8/8 OK
```

Artefacts durables (R-21), **épinglés** (sha256, hors dépôt donc absents de `DELIVERED.sha256`) :
- `F:\tmp\nops1d\mutants.mjs` (12 mutants + harnais C-V-5) : `80f4d6b9eaf0363c46f7b1bc7eff019a7e813f05caa7d9ec8b39e0563cf0453b`
- `F:\tmp\nops1d\tmp\oracle.sh` : `ddabb5f51139ba77889c83264548f79e73fa32851d61285e2ebb956cc4cb49b3`
- `F:\tmp\nops1d\tmp\probe-floor.mjs` : `10e93e0a56d0fc31f6f02497e95a5f5c6289eda61f797576b53457454005edaf`
- plus `RENDU-PLI.md`, `DELIVERED.sha256` (les 8 fichiers du dépôt), logs `tmp\{o-*.log, mutants3.log}`.

## 8. Zéro dette (P5) — items formés

- **C-V-2** (test origine absente) : **CLOS** — test + mutant nommé rouge.
- **C-V-3** (test floor malformé) : **CLOS** — test + mutant nommé rouge (montre `-3` accepté par assertLimits sans la regex).
- **C-V-5** (harnais muet win32) : **CLOS pour ce lot** — `mutants.mjs` capture désormais le nom du test tueur (`--test-reporter=tap` + CRLF + `byIntended`). **Item formé résiduel** : porter `--test-reporter=tap` (+ capture CRLF du nom tueur) dans la CONSIGNE-STANDARD-G1 / le gabarit `mutants.mjs` de tout futur lot — **propriétaire : orchestrateur**, **déclencheur : ce pli** (amendement de consigne, hors périmètre worker R-20).
- **C-G2-2** (deux branches défense-en-profondeur non testées) : **CLOS** — les mutants `g2_floor_validation_disabled` et `g2_origin_absent_half_removed` du G2, qui SURVIVAIENT, sont désormais tués par `floor_regex_removed` / `origin_absent_half_removed`.
- Corrections G2/checkpoint restées propriétaire ORCHESTRATEUR (insertion G7, hors pli test-only, rappelées sans les traiter) : **C-G2-1 / C-V-4** (texte d'amendement ADR-U4b D4 : `rpc.ts` AVANT==APRÈS==`0e232519…` pour -1d, suppression + recompute = item POST-fusion) ; **C-G2-4** (amendements ADR datés + table tuyaux) ; **C-V-0** (ordonnancement fusion/redéploiement vs suppression §11-1) ; **C-V-1** (trace d'exécution Linux du skip SIGTERM — acte orchestrateur : docker/WSL/PR brouillon, installation interdite au worker). Aucune n'est un livrable de ce pli test-only ; listées pour traçabilité, chacune a déjà propriétaire + déclencheur au G2/checkpoint-2.

**Aucun « dû » nu.** R-1 : `claude-opus-4-8[1m]`.
