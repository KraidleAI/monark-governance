# G2-delta-2 (micro-pli 1bcfbd7) — lot U-4b-1b-3 — relecteur Opus 5.5 (claude-opus-5-5[1m]), 2026-09-22

Modèle résolu : claude-opus-5-5[1m]

# G2-DELTA — pli U-4b-1b-3 (`801859f..d2e36ac`, branche `lot/u4b-1b-3`) — relecteur Opus 5.5, instance séparée, contexte frais

## Verdict : **PASS**, avec trois corrections non bloquantes (C-GD-1 à C-GD-3)

Le code livré par le pli est correct.
- Les 5 refus locaux de `runFillTs` ont lieu avant l'ouverture du garde, donc avant la pose des verrous. Je l'ai mesuré refus par refus : sur `d2e36ac`, aucun verrou ne reste et le même cycle se relance ; sur `801859f`, les verrous restaient.
- Les 17 mutants du lot sont tués par leur test nommé, lu dans le TAP.
- L'oracle passe 7/7 avec 934/933/0/1 sur le clone et sur deux fusions à blanc : avec `0440b23`, puis, après la coupure, avec la HEAD courante `3f6662f`.
- Les 11 fichiers gelés et le prereg sont identiques octet pour octet.
- R-25 vaut 443.
- Le §3 du rendu, qui contredit le cp-2, est confirmé par ma propre mesure.

Les trois corrections :
- **C-GD-1** (tests) : un de mes 9 mutants, une vraie régression du verrou, survit à la suite de tests.
- **C-GD-2** (tests) : deux fixtures sans `phase`, dont le verdict dépend de l'ordre des gardes.
- **C-GD-3** (texte de l'ADR, au moment du fold).

Aucune ne touche le code de production.

---

**R-1.** Modèle résolu tel quel : `claude-opus-5-5[1m]`, le préfixe attendu par la mission (décision 133). La règle A-1 de la consigne porte ce préfixe depuis `de30eab` (mesuré sur `docs/CONSIGNE-STANDARD-G1.md:6`).

**R-20.** Aucun commit, aucun workflow.
- Aucune écriture dans `F:\Monark` ni dans `F:\Monark-wt-*`. Je n'y ai fait que des lectures : `git clone`/`fetch` en source, `rev-parse`, `log`, `show`, `find`.
- Mesure à 20:55:16Z, avec `--no-optional-locks` pour que même `status` n'écrive pas l'index :
  - `F:\Monark-wt-u4b1b3` : HEAD `d2e36acc4ac0…`, branche `lot/u4b-1b-3`, status vide ;
  - ses 3 fichiers du lot valent `20e1cf9d… / 30d61b79… / 696c7c03…`, identiques au commit ;
  - `F:\Monark` : `lot/u4b-1b-3` = `d2e36ac`.
- Le status de `F:\Monark` lui-même n'est pas une preuve : l'orchestrateur y a committé `0440b23` et `3f6662f` pendant la revue.
- Dans le clone, les junctions de `mk-nm.ps1` pointent vers `F:\Monark\node_modules`, en lecture.
- Le clone jetable est `F:\tmp\g2-u4b1b3\tree-delta` (HEAD `d2e36acc4ac0…`).
  - Commande : `git clone --no-hardlinks --branch lot/u4b-1b-3`.
  - Après chaque mutant, sonde et fusion à blanc, il est restauré et propre : `git status --porcelain` vide.

**R-21.** Chaque chiffre de ce rendu a sa commande et son journal (en-tête A-12) sous `F:\tmp\g2-u4b1b3\`.

**A-7.** L'oracle, les tests, les mutants et toute sonde qui exécute le code du lot tournent sous `env -u` des 8 clés payantes.
- Les harnais retirent aussi ces clés du process enfant, sans tenir compte de la casse.
- Aucune variable d'environnement n'a été affichée.
- `TEMP`, `TMP` et `TMPDIR` pointent vers `F:\tmp\g2-u4b1b3\tmp-delta`.
- Exceptions déclarées :
  - `d1-copy-link.mjs`, lancé en `node` nu : sonde de sémantique du système de fichiers, sans réseau ni code du lot, chemins explicites sur F:.
  - Le **parent** de `d1-d4-detail.mjs`, lancé en `node` nu : il écrit puis supprime le fichier voisin muté et lance l'enfant. L'enfant, qui exécute le code, est lancé avec les 8 clés retirées et TEMP sur F:.
  - Les commandes d'outillage (`git`, `mk-nm.ps1`, `node -e`/`-p` de lecture de version).

**Reprise après la coupure de courant (vers 20:3x UTC).** État relevé à 20:46:33Z, avant toute autre action :
- clone : HEAD `d2e36acc4ac0…`, pas de MERGE_HEAD, `git status --porcelain --untracked-files=all` vide ;
- golden `u4b-select-episode.mjs` : `20e1cf9d…`, identique au blob committé ; aucun fichier voisin temporaire restant (`.d4.mjs`, `.at801859f.mjs`) ;
- aucun mutant n'était en cours : les deux harnais s'étaient terminés à 20:21Z environ (`exit=0`, `FINAL_GOLDEN_INTACT=true`) ;
- ce rendu était déjà écrit (20:31Z) ;
- les 33 artefacts cités sont présents et complets (dernière ligne de chacun vérifiée) ;
- `lot/u4b-1b-3` est inchangée (`d2e36ac`) ; `lot/etude-suite` est passée à `3f6662f`, avec des changements sous `docs/` seulement.

Vérification refaite après la reprise : fusion à blanc et oracle contre la nouvelle HEAD `3f6662f` (§5).

**Indépendance.**
- Entrées lues :
  - le rendu du pli, `mutants.mjs`, l'ADR v2 et les journaux du worker ;
  - `docs/G2-lot-u4b-1b-3.md` et `docs/CHECKPOINT2-lot-u4b-1b-3.md` ;
  - les harnais cp-2 et `g2-demo-tests.ts`.
- Le re-checkpoint-2 du pli a été committé sur `lot/etude-suite` (`0440b23`) pendant cette revue. Je ne l'ai **pas** lu : seul son sujet de commit est apparu dans un `git log`, après ma mesure du §7.
- Après la coupure, le coordinateur m'a appris que le re-cp-2 porte un erratum C-V-3 (« brut réel 0 ts > to_block »). C'est **concordant** avec ma mesure indépendante du §7, faite à 20:15:03Z, avant que je reçoive cette information.

**Environnement.**
- `mk-nm.ps1` → `entries: 220 monark: 10 fail: 0`.
- `require.resolve('@monark/rpc-guard')` → `F:\tmp\g2-u4b1b3\tree-delta\packages\rpc-guard\src\index.ts`, soit le clone.
- Node v24.15.0, libuv 1.51.0, npm 11.12.1, win32/x64.
- Le champ `platform` des en-têtes d'oracle est altéré par la conversion de chemins MSYS (`win32C:/Program Files/Git/x64`). La valeur réelle, `win32/x64`, est mesurée dans les en-têtes des harnais.

---

## 1. Diff exact, gel D4, livraison — CONFORME

**Diff du pli** (`git diff --numstat 801859f d2e36ac`) : 3 fichiers, 245 lignes ajoutées et 33 supprimées.

| fichier | ajouts / suppressions |
|---|---|
| `apps/sentinel/test/u4b-select-episode.test.ts` | 190 / 7 |
| `scripts/census/u4b/u4b-select-episode.d.mts` | 6 / 3 |
| `scripts/census/u4b/u4b-select-episode.mjs` | 49 / 23 |

- Lot cumulé `b900b4b..d2e36ac` : les mêmes 3 fichiers, 326/2, 15/1 et 80/19.
- `801859f` a pour parent `b900b4b`, qui est aussi le merge-base avec `lot/etude-suite`.

**Livraison.**
- `DELIVERED.sha256` du worker est identique aux blobs committés (`git show d2e36ac:<f> | sha256sum`) et au checkout : 3/3, `20e1cf9d… / 30d61b79… / 696c7c03…`.
- Aucun CR dans les trois blobs.

**Gel (A-6), régime B** : `git show <rev>:<f> | tr -d '\r' | sha256sum` (journal `delta-a6.log`).
- **11/11 identiques** entre `801859f` et `d2e36ac` : les 9 sha du §2 plus `liquidation-logs.mjs` (`bf4eb293…`) et `windows.ts` (`b84827ae…`).
- Les 9 premiers sont égaux ligne à ligne au tableau §2 du prereg, extrait par programme (`prereg-9.txt` == `d2e-9.txt`).
- `git diff --quiet b900b4b d2e36ac` sort à 0 sur ces 11 fichiers, sur `docs/PLAN-u4b-prereg.md` et sur `docs/adr/ADR-U4b-calibration-episode-frais.md`.
- Prereg `1971d9b14ce0…892f49`, identique en brut et en LF.

**D-4.** Les 7 suppressions du test sont toutes des modifications :
- la ligne d'import ;
- trois commentaires et docstrings (`D-n` devient `D-BORNE-1`) ;
- la docstring et la signature de `blockStub` (ajout de `onFresh`) ;
- le seul message d'assertion modifié, `assert.equal(fetches, 0, …)`, dont le prédicat est inchangé.

Aucune assertion n'est retirée ni affaiblie.

**F-2.** Les 3 lignes ajoutées qui contiennent des caractères non ASCII (`—`, `§`) sont des lignes où seul `D-n` a changé. Ces caractères préexistaient.

## 2. C-V-1 — plus aucun `throw` entre l'ouverture du garde et le `try` — CONFORME (code), un trou de test (C-GD-1)

### 2.1 Lecture du code (`d2e36ac`)
L'ouverture est `:402` (`openU4GuardedClient`), le `try` est `:419`, le `finally{unlockAll}` est `:429-431`. Entre les deux, il n'y a que ceci :
- **`:404` `makeGuardedPoolCall(client, {retries:2, backoffMs:200, backoffCapMs:4000})`** (`u4-guard.mjs:149-168`).
  - À la construction : déstructuration à défauts d'un littéral, `let n = 0`, deux objets, des fermetures (`count`, `call`) et `return {…}`.
  - Ses `throw` (`:159`, `:162`, `:164`) sont dans `call`. Ils ne s'exécutent qu'à l'appel, donc dans le `try`.
- **`:405` `makeUkemiPool({...})`** (`rpc2.ts:124-239`).
  - À la construction : des `opts.x ?? défaut`, deux `new Map()`, des fermetures (`polite`, `live`, `quorum2`, `getLogsVia`) et un `return {…}` de 4 méthodes async.
  - Tous ses `throw` sont dans ces fermetures, et rien n'est validé à la construction (voir O-D4 pour `minIntervalMs`).
- **`:409-418`** : la définition de la fermeture `tsOf`, qui n'est exécutée qu'à partir de `:420`.
- **`:403` et `:406-408`** : des commentaires.

L'ouverture elle-même ne peut rien laisser tenu non plus. `openGuardedClient` (`packages/rpc-guard/src/guarded.ts`) valide la configuration avant tout verrou (`assertLimits`, `:37`). Si le k-ième verrou échoue, il libère les k−1 déjà pris (`:56-58`). La sonde P6 le mesure.

Les 5 refus locaux sont tous placés avant `:402` :
- `to_block` non entier (`:366-367`) ;
- sidecar illisible (`:378`) ;
- sidecar sans objet `block_ts_extra` (`:380`) ;
- self-sha (`:381`) ;
- `discover_sha` (`:382`).

C'est aussi le cas de `mkdirSync(--out)` (`:371`) et de `kept` (`:385`).

### 2.2 Sonde verrou du cp-2, adaptée et étendue
- Sonde : `delta-probes\delta-lock.test.mjs`, TAP.
- Journaux : `delta-lock-d2e36ac.log` et `delta-lock-801859f.log`.
- Pour la comparaison, le blob `801859f` a été posé comme fichier voisin temporaire dans le clone, puis supprimé.

Chaque cas refuse d'abord, puis relance le **même** cycle `c1` après avoir levé la cause.

| cas | `d2e36ac` (pli) | `801859f` (avant le pli) |
|---|---|---|
| P1 `to_block` non entier | `SelectError` nommée, 0 fetch, **0 `.lock`**, `c1` jamais créé ; relance même cycle **ok, complete** | 2 verrous tenus (`c1/drpc.org.lock`, `c1/mevblocker.io.lock`) ; relance **« already locked »** |
| P2 sidecar étranger | idem ; sidecar laissé intact | idem : verrous tenus, relance refusée |
| P3 sidecar tronqué | `SelectError` « `sidecar unreadable:` », 0 fetch, 0 verrou, fichier intact ; relance ok | **`SyntaxError`** non nommée, verrous tenus, relance refusée |
| P4 self-sha falsifié | `SelectError`, 0 verrou, relance ok | verrous tenus, relance refusée |
| P5 sidecar sans objet `block_ts_extra` | `SelectError`, 0 verrou, relance ok | verrous tenus, relance refusée |
| P6 verrou périmé de `mevblocker.io` (échec **dans** l'ouverture) | `LockHeldError` ; il ne reste que le verrou périmé : `drpc.org`, pris en premier, a été relâché | identique (comportement de rpc-guard, indépendant du pli) |

Bilan : 6/6 verts sur `d2e36ac` ; 1/6 vert sur `801859f` (P1 à P5 rouges). La sonde discrimine donc bien.

Honnêteté sur la sonde : le premier passage signalait P2 en échec. C'était un défaut de ma sonde : je testais la regex sur un message tronqué à 110 caractères, et « belongs to another brut » tombe au-delà. Je l'ai corrigé pour tester sur le message complet (v1 conservée : `delta-lock.test.v1.mjs`). Au premier passage, les observations de P2 étaient déjà conformes : `SelectError`, 0 verrou, relance ok.

**Sondes d'origine du cp-2 rejouées** (seuls les imports et `TMPROOT` sont repointés, journal `cp2-probes-replay.log`) :
- `cp2-lock` : « SECOND RUN SAME CYCLE: ok phase=complete ».
- `cp2-trunc` : « TRUNCATED SIDECAR => SelectError | SelectError? true ». La relance échoue sur « quorum needs 2 providers », parce que cette sonde refuse tout fetch par construction. Ce n'est **pas** « already locked ».

**Mutants M9, M10 et M11** (harnais du lot repointé sur le clone, voir §3) : tous tués par leur test nommé.

### 2.3 Trou : la liberté de verrou n'est pas pinnée refus par refus → **C-GD-1**
Mon mutant **D4** déplace **seulement** le refus self-sha après l'ouverture. Il reste une `SelectError` nommée, avec le même message.
- Il **survit** à tout le fichier de test : 31/31 verts (`mutants-delta-own-run.log`).
- C'est pourtant une régression réelle. La sonde P4, rejouée sur le fichier muté D4 (`d4-lock-detail.log`), trouve les **2 verrous tenus** et une relance du même cycle refusée par « already locked ».

La cause : aucun test ne vérifie l'absence de verrou après un refus self-sha. Les assertions `locksUnder` n'existent que dans le test pre-open (`:578,:583,:590`) et dans le test du sidecar tronqué (`:608`). Le refus « sans objet `block_ts_extra` » (`:380`) n'est testé nulle part, verrou ou pas.

Par contraste, mes mutants D5 (seul le parse déplacé) et D6 (seul le contrôle `discover_sha` déplacé) sont tués. Le verrou est donc pinné pour `to_block`, tronqué et étranger, mais pas pour self-sha ni pour « sans objet ».

## 3. Mutants M1..M17 du lot : tous tués par leur test nommé (A-11), rejoués sur le clone indépendant

Harnais : `mutants-delta.mjs`, copie de `F:\tmp\u4b1b3\mutants.mjs` où seules `TREE` et `TMPF` changent (`diff` à 2 lignes). Journal : `mutants-delta-run.log`. Commande enfant : `node --test --test-reporter=tap` sur le fichier de test entier, CRLF normalisé.
- `BASELINE status=0 ok=31 not_ok=0 intended_killers_green_on_golden=all`.
- `BASELINE_OK=true ALL_KILLED_BY_INTENDED=true ALL_RESTORED=true FINAL_GOLDEN_INTACT=true n_mutants=17`.
- Golden `20e1cf9d…` restauré après chaque mutant.

| # | test tueur (nommé dans le TAP) | tests rouges (`not_ok`) |
|---|---|---|
| M1 | `…window_truncated_offline_0_fetch` | 9 |
| M2 | `…with_0_fetch_past_to_block` | 1 |
| M3 | `…window_truncated_offline_0_fetch` | 2 |
| M4 | `…resumable_after_a_quorum_kill` | 3 |
| M5 | `…resumable_after_a_quorum_kill` | 2 |
| M6 | `…select_refuses_a_partial` | 2 |
| M7 | `…select_refuses_a_partial` | 8 |
| M8 | `…transient_429…` | 1 |
| **M9** (bloc de reprise après l'ouverture) | `u4b_fill_ts_pre_open_refusals_hold_no_cycle_lock_and_the_same_cycle_relaunches` | 2 (+ test du sidecar tronqué) |
| **M10** (`to_block` après l'ouverture) | idem | 1 |
| **M11** (`JSON.parse` nu) | `u4b_fill_ts_refuses_a_torn_sidecar_by_name_with_0_fetch_and_no_lock` | 1 |
| **M12** (`FLUSH_EVERY` 50→1e9) | `u4b_fill_ts_flushes_a_durable_partial_every_50_new_ts_observed_mid_run` | 2 (+ tmp+rename) |
| **M13** (garde `discover_sha` de reprise neutralisée) | `u4b_fill_ts_resume_refuses_a_sidecar_from_another_brut_by_name_with_0_fetch` | 2 (+ pre-open) |
| **M14** (garde self-sha de reprise neutralisée) | `u4b_fill_ts_resume_refuses_a_falsified_sidecar_by_self_sha_with_0_fetch` | 1 |
| **M15** (un `complete` n'est pas réamorcé) | `u4b_fill_ts_rerun_on_a_complete_sidecar_is_idempotent_0_fetch_identical_bytes` | 1 |
| **M16** (`phase` absente acceptée) | `u4b_select_refuses_a_block_ts_extra_sidecar_without_phase_by_name` | 1 |
| **M17** (réécriture sur place) | `u4b_fill_ts_replaces_the_sidecar_by_tmp_rename_never_in_place_and_leaves_no_tmp` | 1 |

Le journal porte le hunk de M9 et de M10 : ils recréent bien l'ordre d'avant le pli, avec la région reprise+`kept`+`flush` et le contrôle `to_block` placés après `openU4GuardedClient` et `makeGuardedPoolCall`.

## 4. Mes mutants (≥ 4 demandés : 9 rejoués, dont 2 survivants prédits)

Harnais : `mutants-delta-own.mjs`, même mécanique (TAP, `byIntended`, pré-vol, restauration contrôlée par sha, en-tête A-12), avec des mutants à plusieurs substitutions. Journal : `mutants-delta-own-run.log`.
- `BASELINE_OK=true ALL_AS_PREDICTED=true ALL_RESTORED=true FINAL_GOLDEN_INTACT=true n_mutants=9 working-tree-after=[]`.

| # | mutation | prédit | mesuré | tests rouges |
|---|---|---|---|---|
| D1 | `renameSync` remplacé par `copyFileSync(tmp, sc)` + `unlinkSync(tmp)` | tué | **tué** par `…tmp_rename_never_in_place…` | 1 |
| D2 | flush **périodique** écrit `complete` | tué | **tué** par `…every_50…observed_mid_run` | 2 (+ tmp+rename) |
| D3 | flush du **STOP** (`catch`) écrit `complete` | tué | **tué** par `…resumable_after_a_quorum_kill` | 1 |
| D4 | **seul** le refus self-sha déplacé après l'ouverture (`SelectError` conservée) | survit | **SURVIT**, régression réelle (§2.3) → **C-GD-1** | 0 |
| D5 | **seul** le refus « sidecar illisible » déplacé après l'ouverture (`SelectError` conservée) | tué | **tué** par `…torn_sidecar…no_lock` | 1 |
| D6 | **seul** le refus `discover_sha` déplacé après l'ouverture | tué | **tué** par `…pre_open_refusals…` | 1 |
| D7 | `runSelect` : garde `phase` placée **avant** les gardes self-sha et `discover_sha` | tué | **tué** par `u4b_select_refuses_a_tampered_block_ts_extra_sidecar` | 2 (+ `…from_another_brut`) → **C-GD-2** |
| D8 | `finally{unlockAll}` vidé | tué | **tué** par `…pre_open_refusals…` (assertion finale « released every operator lock ») | 1 |
| D9 | `FLUSH_EVERY` 50→25 (sonde de précision) | survit | **SURVIT** → O-D2 | 0 |

**Mécanisme de D1, mesuré sur NTFS** (`delta-probes\d1-copy-link.log`) :
- `copyFileSync` sur un nom existant réécrit le même fichier : même identifiant, et le lien dur voit `complete`.
- `renameSync` remplace le fichier : nouvel identifiant, et le lien garde `partial`.

Le test M17 attrape donc aussi « copie puis suppression », qui n'est pas atomique.

## 5. Oracle, R-25, fusion à blanc — CONFORME

**Oracle sur le clone `d2e36ac`** (`oracle-delta.sh`, journaux dans `oracle-delta\`, exits capturés directement, A-3).

| gate | exit | note |
|---|---|---|
| `gate:vocab` | 0 | — |
| `typecheck` | 0 | — |
| `test` | 0 | **tests 934, pass 933, fail 0, skipped 1** |
| `lint` | 0 | — |
| `lint:ratchet` | 0 | 69/69 |
| `lang:gate` | 0 | — |
| `export:check` | 0 | — |

- Le skip est nommé : `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts absent… »).
- 0 occurrence de `UV_HANDLE_CLOSING`.

**R-25.**
- Méthode : j'ai extrait le pathspec **verbatim** de `.github/workflows/ci.yml:65` par programme, soit 15 arguments dont `.`.
- `git diff --shortstat b900b4b...d2e36ac -- <pathspec>` → `3 files changed, 421 insertions(+), 22 deletions(-)`, soit **443**.
- La forme CI `origin/lot/etude-suite...d2e36ac` donne le même résultat.
- Détail : pli seul 245+33 = 278 ; G1 seul 204+17 = 221.
- 443 est sous 1 150 (mission) et sous `VIBEGATES_PR_LIMIT=1205` (`ci.yml:43`).

**Fusion à blanc** : `git merge --no-commit --no-ff origin/lot/etude-suite`.
- Pendant la revue, `lot/etude-suite` est passée de `de30eab` à **`0440b23`**, qui contient `de30eab`. J'ai fusionné la HEAD courante `0440b23`.
- 0 conflit ; 34 chemins, tous sous `docs/` ; 0 chemin sous `scripts/`, `apps/`, `packages/`, `test/` ou `.github/`.
- **Oracle sur l'arbre fusionné** (`oracle-merged\`, en-tête `MERGE_HEAD: 0440b23…`) : 7/7 exit 0, **934/933/0/1**, même skip nommé, 0 `UV_HANDLE_CLOSING`.
- `git merge --abort` a été fait ; HEAD `d2e36ac`, arbre propre.

**Fusion à blanc refaite après la reprise, contre la HEAD courante `3f6662f`** (`merge-dry2.log`, `oracle-merged2\`) :
- 0 conflit ; 41 chemins, tous sous `docs/`.
- En-tête `MERGE_HEAD: 3f6662f5ea85…`, de 20:47:25Z à 20:50:06Z.
- Oracle : 7/7 exit 0, **934/933/0/1**, skip nommé `u4b_labels_replay_via_main_real_artifact`, 0 `UV_HANDLE_CLOSING`.
- `git merge --abort` a été fait ; HEAD `d2e36ac`, arbre propre, golden `20e1cf9d…`.

## 6. Textes et forme de l'ADR v2 — CONFORME sur le fond ; retouches de fold (C-GD-3)

**Code et test.**
- Aucune occurrence de « does not exist yet » dans les 3 fichiers (`git grep`).
- « chain head » apparaît **2 fois, toutes deux dans une négation** qui corrige l'ancienne affirmation : `.mjs:87` « NOT the chain head » et docstring `:323` « to_block is NOT the chain head ». L'affirmation fausse a disparu (O-D1, sans action).
- La borne est exprimée ainsi : « `B_hi = finalized - 64` (prereg DISC:29) », en `:87` et `:323`.
  - Vérifié [lu] : `PLAN-u4b-prereg.md:29` (`B_hi = finalized - 64`) et `:231` (`--to-block <finalized-64>`).
  - Instance : `START-v2.txt` donne `finalized=26034191 to=26034127`, soit exactement −64.
- Aucune occurrence de `D-n\b`.

**ADR v2** (`F:\tmp\u4b1b3\ADR-amendement-v2.md`, sha `92543c99…`).
- D-BORNE-1 est posée ; « D6 » et « D-6 » sont explicitement signalés comme déjà pris.
- La section MAST résiduel compte 4 lignes.
- R-BORNE-1 est reformulé : direction partial→complete, filet « no ts » hors ligne, cas du kill après le dernier fetch.
- R-BORNE-2 a un déclencheur et un propriétaire.
- La table Tuyaux cite 13 tests (5 du G1, 8 du pli), tous présents dans le fichier de test.
- Aucune occurrence de `F:`, `C:\` ni `course-ukemi`.

**Citations du code vérifiées [lu]** :
- `liquidation-logs.mjs:66` (`hiSpan ?? 60000`) et `:74` ;
- `windows.ts:44-49` (l'appelant doit borner `hi` par un bloc FINALISÉ) ;
- `rpc2.ts:64` (`malformed block`) ;
- `u4b-discover.mjs:73` (`--to-block` libre ; aucun `finalized` dans ce fichier) et `:139` (le témoin enregistre chaque `blockAt`, sans borne) ;
- `PLAN-u4b-prereg.md:95` (H-0, phrase conforme).

**Forme à retoucher au fold** (voir C-GD-3) :
- (a) R-BORNE-2 invoque trois sources web [lu] sans URL, heure ni sha. Ces preuves ne vivent que dans `F:\tmp\u4b1b3\sources-rename.log`, hors dépôt.
- (b) La ligne MAST « Blocage par ressource … prouvé … (M9, M10) » surclaime à l'échelle d'un refus isolé : D4 survit.
- (c) Le « Constat mesuré » dit « `--fill-ts` ×3 STOP sur `…malformed block` ». Les journaux sur disque disent autre chose (O-D7).

## 7. Constat du §3 du rendu contre le cp-2 (C-V-3) : re-mesuré, **le pli a raison**

Re-mesure en lecture seule (`delta-probes\real-brut-remeasure.mjs` et `.log`), avec `canon` et `sha256Hex` importés du `liquidation-logs.mjs` gelé du clone. Fichier `F:\course-ukemi\discover\weth-discover-2026-09-22.json` : sha du fichier `8113d014…`, 7 468 666 octets, mtime 16:58:35Z.

- `brut_sha256` recalculé = porté = `2ffa3acfa317…3fa8`.
- Schéma `ukemi-u4b-discover/2`, `phase:complete`.
- `to_block` = 26 034 127 (entier).
- 13 696 enregistrements ; plus grand bloc d'enregistrement 26 029 710.
- `block_ts` : **2 328 clés**, toutes entières, aucune nulle ; minimum 22 843 909, **maximum 24 565 504**.
- **0 clé `> to_block`**, et 0 clé `≥ to_block`.
- `clusters: null`, `cluster_error: "rpc-guard: run_calls (fail-closed)"`.

**Tranché.**
- L'énoncé du cp-2, « le `block_ts` du brut réel contient des ts `> to_block` », est **faux comme fait mesuré** sur ce brut. Le témoin a épuisé son budget avant les clusters de fin de plage : clé maximale 24,57 M, alors que les enregistrements vont jusqu'à 26,03 M.
- Il est **vrai comme possibilité par le code** :
  - `u4b-discover.mjs:139` enregistre chaque `blockAt` sans borne ;
  - `:73` laisse `--to-block` libre, non comparé à `finalized` ;
  - un témoin qui irait au bout enregistrerait donc des ts dans `(to_block, tête]`.
- La formulation du pli (« **peut** porter par le code, 0 aujourd'hui, mesuré, ignoré par choix de domaine ») est la bonne.
- Cela ne change pas la direction de D-BORNE-1 : le clamp ignore ces ts, qu'ils existent ou non.
- Origine d'erreur suggérée pour le G7 : un mécanisme du code énoncé comme fait, sans mesure, en revue (cp-2).

## 8. O-1 du rendu (`runSelect` : `JSON.parse` nu sur un sidecar illisible) — **item formé ACCEPTABLE, à élargir ; pas de correction dans ce pli**

Mesuré (`delta-probes\o1-bare-parse.test.mjs` et `.log`, 1/1 vert). La classe compte **4 sites préexistants**, tous introduits par `2be517f` (U-4b-1b-2) :

| site | entrée tronquée | erreur | effets de bord |
|---|---|---|---|
| `runSelect:196` | discover | **`SyntaxError`** non nommée | 0 fetch, `--out` non créé |
| `runSelect:211` | sidecar | **`SyntaxError`** non nommée | 0 fetch, `--out` non créé |
| `runFillTs:356` | discover | **`SyntaxError`** non nommée | 0 fetch, 0 verrou, `--out` non créé |
| `runCheckVersion:270` | fichier d'épisode | **`SyntaxError`** non nommée | 0 fetch, 0 verrou |

Dans tous les cas, l'entrée est laissée intacte.

Pourquoi c'est acceptable en item formé :
- Tous ces sites sont **fail-closed et sans effet de bord** :
  - `runSelect` n'ouvre aucun garde, et n'écrit qu'après `reduceSelection` (`:227+`) ;
  - `runFillTs:356` et `runCheckVersion:270` précèdent l'ouverture.
- Ils sont hors de la mission : C-V-1 ne visait que `runFillTs`.
- Depuis tmp+rename, `--fill-ts` ne peut plus produire lui-même un sidecar tronqué, sauf dans le résidu R-BORNE-2.
- Corriger le seul `:211` maintenant serait incohérent avec les trois autres sites.

L'item formé (voir la section Items formés) doit viser **les 4 sites** : refus nommé `SelectError` « `<flag> unreadable: …` ».

---

## CORRECTIONS FORMÉES (non bloquantes ; aucune ne touche le code de production)

**C-GD-1 (mineure, test seulement, environ 3 lignes) : pinner la liberté de verrou refus par refus.**
- Dans `u4b_fill_ts_resume_refuses_a_falsified_sidecar_by_self_sha_with_0_fetch` (`:667`), ajouter `assert.deepEqual(locksUnder(w.l), [])`.
- Faire de même dans `…from_another_brut…` (`:651`), par symétrie.
- Ajouter le cas « sidecar sans objet `block_ts_extra` » (`:380`, aujourd'hui non testé) avec la même assertion. Forme : ma sonde P5.
- Ajouter D4 au harnais du lot, avec pour tueur attendu le test self-sha.
- Preuve : D4 survit, 31/31 verts, alors que les verrous sont tenus (§2.3).
- Propriétaire : orchestrateur, qui confie un micro-pli à un worker.
- Déclencheur recommandé : avant la fusion de `lot/u4b-1b-3`. À défaut, au prochain lot qui touche `runFillTs`.

**C-GD-2 (mineure, test seulement, 2 lignes) : fixtures `:166` et `:178` en forme réelle (A-8).**
- `u4b_select_refuses_a_tampered_block_ts_extra_sidecar` et `u4b_select_refuses_a_block_ts_extra_sidecar_from_another_brut` écrivent des sidecars **sans `phase`**.
- Depuis C-V-6, un tel sidecar est lui-même refusé. Ces deux tests ne mesurent leur garde que grâce à l'ordre sha → `discover_sha` → `phase`, que D7 montre porteur.
- Correction : ajouter `phase: "complete"` aux deux fixtures. Chaque test isole alors sa garde, et le mutant « garde retirée » reste rouge (raisonné : le sidecar serait accepté et la sélection réussirait).
- Conséquence attendue, à déclarer au harnais : après cette correction, D7 (inversion de l'ordre de deux refus) devient un mutant **équivalent pour la sûreté**, qui survivra. Un sidecar falsifié ou étranger reste refusé dans les deux ordres ; seul le message change. Il ne faut donc pas en faire un tueur attendu.
- Même propriétaire et même déclencheur que C-GD-1.

**C-GD-3 (texte, au fold de l'ADR v2 par l'orchestrateur, R-20).**
- **(a)** Porter dans l'ADR ou dans CHANTIERS l'identité des 3 sources de R-BORNE-2 : URL, heure de lecture et sha, tels que dans `sources-rename.log`. En l'état, les [lu] ne sont prouvés que hors dépôt. Marquer aussi comme traduite (« trad. ») la citation POSIX entre guillemets, qui rend en français le texte anglais.
- **(b)** Ligne MAST « Blocage par ressource » : écrire « bloc entier prouvé par M9/M10 ; refus par refus, pinné pour `to_block`, sidecar tronqué et `discover_sha`, et pour self-sha et « sans objet » après C-GD-1 ».
- **(c)** « Constat mesuré » : remplacer « ×3 STOP sur `malformed block` » par « journal CHANTIERS:771-772 ; journaux sur disque : dernière erreur 429 `mevblocker.io` à 17:01, `malformed block` à 17:09 et à 17:23 » (O-D7).
- **(d)** L'item de fold du worker (journaliser la mesure du §3) est confirmé par ma re-mesure du §7.

## OBSERVATIONS

- **O-D1** : « chain head » ne survit que dans deux négations correctives (§6). Sans action.
- **O-D2** (D9, précision) :
  - Le test du flush périodique pinne ceci : « au 51ᵉ bloc distinct, un partiel durable de exactement 50 ts est déjà sur disque ».
  - Toute valeur de `FLUSH_EVERY` qui divise 50 le satisfait. C'est suffisant pour la durabilité annoncée : un kill dur perd au plus 50 ts.
  - Sans action.
- **O-D3** (disponibilité du `rename` sous Windows ; mode d'échec propre à `rename`, arrivé avec tmp+rename, fail-closed) :
  - [lu local] `graceful-fs` 4.2.11, `node_modules/graceful-fs/polyfills.js:87-111` (sha `66ea1687…`). Selon ses auteurs, un antivirus Windows peut faire échouer `rename` en EACCES ou EPERM. La bibliothèque réessaie EACCES, EPERM et EBUSY jusqu'à 60 s.
  - `flush` ne réessaie pas. Un tel échec transitoire STOPPE le `--fill-ts`, mais reste fail-closed et reprenable :
    - le sidecar précédent reste entier, le rename n'ayant pas eu lieu ;
    - au plus 50 ts sont à refaire ;
    - un temporaire `.tmp-<pid>-<hex>` reste dans `--out`.
  - Item formé : étendre le déclencheur de R-BORNE-2 à « premier STOP EACCES/EPERM/EBUSY sur le `rename` du sidecar » ⇒ retry borné sur ces codes (calque de graceful-fs). Propriétaire : orchestrateur.
- **O-D4** (préexistant `2be517f`, hors lot) : `--min-interval-ms` n'est pas validé.
  - Une valeur `NaN` (par exemple `150ms`) désactive silencieusement la politesse. [lu] `rpc2.ts:137-145` : `NaN <= 0` est faux, `wait` vaut NaN, donc pas d'attente.
  - Item formé : refus nommé si `!(Number.isFinite(v) && v >= 0)`. Déclencheur : prochain lot qui touche `runFillTs` ou `runCheckVersion`. Propriétaire : orchestrateur.
  - Sans effet sur la course prévue : la ligne RUNBOOK R-B passe `150`.
- **O-D5** : l'O-2 du rendu (A-1 encore en 4-8) est **clos** par `de30eab` (mesuré, voir R-1 en tête).
- **O-D6** : le commentaire de la section (10) du test renvoie à `F:\tmp\u4b1b3\mutants.mjs`. Ligne du G1, hors pli ; la pratique est répandue (6 occurrences dans `apps/`, `scripts/` et `test/`). F-1 vise l'ADR, qui est propre. Sans action.
- **O-D7** (journaux réels de `--fill-ts`, lus en lecture seule et purgés d'URL) :
  - `F:\course-ukemi\select\fill-ts.log` (mtime 17:01:22Z) : dernière erreur `HttpError … 'mevblocker.io' (code 429)`.
  - `fill-ts-2.log` (17:09:11Z) et `fill-ts-3.log` (17:23:38Z) : `malformed block`.
  - `CHANTIERS:771-772` note un premier STOP 429 (environ 2 700 appels), puis « x3 STOP malformed » entre 17:01 et 17:24 (environ 12 000 appels chacun).
  - Le disque confirme 2 STOP `malformed block`. Les nombres d'appels ne figurent pas dans ces journaux : ils ne viennent que du journal CHANTIERS, source en dépôt. Retouche au fold : C-GD-3(c).
  - Le mécanisme de D-BORNE-1 n'est pas en cause : il est [lu] dans le code.
- **O-D8** (hors mission) : les nouveaux tests n'ont pas été rejoués sous Linux (aucun workflow, R-20 et décision 136).
  - Ils n'utilisent que des API Node portables : `readdirSync({recursive})`, `linkSync`, `renameSync`.
  - La sémantique POSIX de `rename`, qui remplace l'entrée et laisse l'ancien inode aux liens durs, est celle que prend le test M17. Le rendu cite IEEE Std 1003.1-2024 `rename()` ; je ne l'ai pas re-lu, faute de réseau dans cette revue.

## ITEMS FORMÉS (P5 : aucun « dû » nu)

| item | propriétaire | déclencheur |
|---|---|---|
| C-GD-1, C-GD-2 (tests) | orchestrateur, via un micro-pli worker | avant la fusion de `lot/u4b-1b-3`, sinon prochain lot qui touche `runFillTs` |
| C-GD-3 (a)-(d) | orchestrateur | fold de l'ADR v2 |
| O-1 élargi aux 4 sites (`:196`, `:211`, `:270`, `:356`) | orchestrateur | prochain lot qui touche `u4b-select-episode.mjs`, ou première entrée réelle illisible |
| O-D3 : extension du déclencheur de R-BORNE-2 (retry EACCES/EPERM/EBUSY) | orchestrateur | premier STOP de ce type en course réelle |
| O-D4 : validation de `--min-interval-ms` | orchestrateur | prochain lot qui touche `runFillTs` ou `runCheckVersion` |

R-BORNE-1 et R-BORNE-2 (ADR v2) sont déjà formés et bien formés (§6).

## FICHIERS (tous sous `F:\tmp\g2-u4b1b3\`)

**Rendu**
- `G2-delta.md` : ce rendu.

**Clone et environnement**
- `tree-delta\` : le clone, HEAD `d2e36ac`, propre.
- `clone-delta.log` et `mknm-delta.log`.

**Gel**
- `delta-a6.log` : 11 sha à `801859f` et à `d2e36ac`.
- `prereg-9.txt` et `d2e-9.txt`.

**Oracles et fusion**
- `oracle-delta.sh`.
- `oracle-delta\` : clone.
- `oracle-merged\` et `merge-dry.log` : arbre fusionné avec `0440b23`.
- `oracle-merged2\`, `oracle-merged2.run.log` et `merge-dry2.log` : arbre fusionné avec `3f6662f`, après la reprise.

**Mutants**
- `mutants-delta.mjs` et `mutants-delta-run.log` : les 17 du lot.
- `mutants-delta-own.mjs` et `mutants-delta-own-run.log` : mes 9.

**Sondes (`delta-probes\`)**
- `delta-lock.test.mjs` (+ `.v1.mjs`), `delta-lock-d2e36ac.log`, `delta-lock-801859f.log`.
- `d1-d4-detail.mjs` et `d4-lock-detail.log`. Seuls les commentaires du script ont été corrigés après exécution ; le code exécuté est inchangé.
  - Commande : `node F:\tmp\g2-u4b1b3\delta-probes\d1-d4-detail.mjs`, cwd = clone. Parent en node nu, enfant sous 8 clés retirées (voir A-7).
  - L'en-tête de son journal ne porte pas le HEAD. Le sha du golden `20e1cf9d…` qu'il porte est celui du blob `d2e36ac`, et le muté `c3c1577b…` y est identifié.
- `d1-copy-link.mjs` et `d1-copy-link.log`.
- `cp2-lock.repointed.test.mjs`, `cp2-trunc.repointed.test.mjs` et `cp2-probes-replay.log`.
- `real-brut-remeasure.mjs` et `real-brut-remeasure.log`.
- `o1-bare-parse.test.mjs` et `o1-bare-parse.log`.

## PROVENANCE

- Relecteur G2-delta : `claude-opus-5-5[1m]` (effort max), 2026-09-22, instance séparée, contexte frais.
  - Première session : de 20:1x à 20:31Z.
  - Coupure de courant vers 20:3x UTC.
  - Reprise à 20:46Z : état vérifié, fusion refaite.
- Objet : pli `801859f..d2e36ac` sur `lot/u4b-1b-3`.
- Fusion à blanc contre `lot/etude-suite` @ `0440b23`, puis @ `3f6662f` après la reprise.
- L'oracle, les tests, les mutants et les sondes du code tournent sous `env -u` des 8 clés, avec TEMP sur F: ; exceptions déclarées en en-tête (A-7).
- Advisor intégré consulté deux fois (après l'orientation ; contrôle final avant la sortie) : avis suivis ; aucun verdict délégué.
- Réviseur de cette sortie : l'orchestrateur (R-21), puis le G7.
