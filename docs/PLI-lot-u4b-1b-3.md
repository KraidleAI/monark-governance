# Pli U-4b-1b-3 (Opus 5.5) — C-V-1..C-V-6, C-G2-1..C-G2-3

Modèle résolu : claude-opus-5-5[1m]

# Pli U-4b-1b-3 — corrections checkpoint-2 C-V-1..C-V-6 + G2 C-G2-1..C-G2-3 (worker Opus 5.5, effort max, contexte frais)

**R-1** : modèle résolu tel quel `claude-opus-5-5[1m]`. Le préfixe `claude-opus-5-5` est celui que la mission contrôle (décision 133). La consigne A-1 exige encore `claude-opus-4-8…`, et le corps du prompt worker de cette session porte encore l'épinglage 4-8. Ces textes sont antérieurs à la décision 133 (voir O-2). La mission est postérieure, c'est elle qui fait foi.
**R-20** : aucun commit, aucun workflow. `lot/u4b-1b-3` reste @ `801859f`, avec 3 fichiers modifiés en arbre de travail. `F:\Monark` : status 0 (lecture seule).
**R-21** : chaque chiffre a sa commande et son log sous `F:\tmp\u4b1b3\`. Tous les oracles, tests et mutants tournent sous `env -u` des 8 clés payantes (A-7), avec `TEMP/TMP/TMPDIR=F:\tmp\u4b1b3\tmp`.

## 0. Bilan worker
- **Fermeture** : les 9 corrections (C-V-1..C-V-6, C-G2-1..C-G2-3) sont fermées. L'item formé du checkpoint-2 « tmp + rename » l'est aussi, par **implémentation** (option préférée de la mission).
- **Oracle** : 7/7 à exit 0 ; suite **934 / 933 / 0 / 1** (926 + 8 nouveaux ; 1 skip nommé, préexistant).
- **Mutants** : **17 mutants, tous tués par leur test tueur nommé**. L'attribution est lue dans le TAP (A-11) ; chaque mutant est restauré octet pour octet.
- **Contrôles** : A-6 11/11 ; R-25 du lot cumulé **443** (< 1 150 de la mission, < 1 205 de `ci.yml:43`).
- **Constat pour l'orchestrateur** : une affirmation du checkpoint-2 (C-V-3) est **contredite par la mesure** (§3).

## 1. Table de fermeture

| correction | changement | test de fermeture | mutant tué (TAP) |
|---|---|---|---|
| **C-V-1 (a)** refus de reprise puis même cycle | `toBlock`, lecture/parse/self-sha/`discover_sha`/amorçage, `mkdirSync`, `kept` et `flush` remontés **avant** `openU4GuardedClient` (`.mjs:363-400` ; open `:402`, try `:419`) | `u4b_fill_ts_pre_open_refusals_hold_no_cycle_lock_and_the_same_cycle_relaunches` (test `:567`) | **M9** « bloc de reprise replacé après open », **M10** « contrôle to_block replacé après open » |
| **C-V-1 (b)** sidecar tronqué | `try { JSON.parse } catch` → `SelectError` « `--out block-ts-extra sidecar unreadable: …` » (`:378`) | `u4b_fill_ts_refuses_a_torn_sidecar_by_name_with_0_fetch_and_no_lock` (`:595`) | **M11** « JSON.parse nu » |
| **C-V-2 V3 / C-G2-2** flush périodique | code inchangé | `u4b_fill_ts_flushes_a_durable_partial_every_50_new_ts_observed_mid_run` (`:613`, option (a) : lecture du disque au 51ᵉ bloc distinct) | **M12** `FLUSH_EVERY 50→1e9` |
| **C-V-2 V5 / C-G2-1 (G2-M3)** `discover_sha` étranger | code inchangé | `u4b_fill_ts_resume_refuses_a_sidecar_from_another_brut_by_name_with_0_fetch` (`:651`) | **M13** garde neutralisée |
| **C-V-2 V6 / C-G2-1 (G2-M5)** self-sha corrompu | code inchangé | `u4b_fill_ts_resume_refuses_a_falsified_sidecar_by_self_sha_with_0_fetch` (`:667`) | **M14** garde neutralisée |
| **C-G2-1** idempotence `complete` | code inchangé | `u4b_fill_ts_rerun_on_a_complete_sidecar_is_idempotent_0_fetch_identical_bytes` (`:684`) | **M15** « un `complete` n'est pas réamorcé » |
| **C-V-6 / C-G2-3** `phase` | `runSelect` : `if (sc.phase !== "complete")`, absence refusée nommément (`.mjs:217`) ; `.d.mts` : docstring « `phase` obligatoire » | `u4b_select_refuses_a_block_ts_extra_sidecar_without_phase_by_name` (`:706`) | **M16** « absence acceptée » (clémence `!== undefined &&` restaurée) |
| **C-V-3 / C-V-4** textes `.mjs` | « chain head / does not exist yet » supprimés sur les 4 sites (`:87`, `:97-100`, docstring `:322-335`, `:406-410`) ; commentaire R-BORNE-1 (`:386-392`) | — (texte) | — |
| **C-V-5** ADR | `ADR-amendement-v2.md` : **D-BORNE-1**, MAST résiduel, R-BORNE-1 reformulé, R-BORNE-2, CA-2 | — | — |
| item cp-2 **tmp + rename** | `flush` : `<sidecar>.tmp-<pid>-<16 hex>` puis `renameSync` (`:397-399`, calque de `probe-narabi.mjs:459-465`) | `u4b_fill_ts_replaces_the_sidecar_by_tmp_rename_never_in_place_and_leaves_no_tmp` (`:631`) | **M17** « réécriture sur place » |

Remarque C-V-6 : je n'ai pas jugé le refus inopportun, donc aucune consultation n'était nécessaire. Motifs mesurés :
- l'unique producteur écrit toujours `phase` ;
- aucun sidecar réel n'existe : `F:\course-ukemi\select` ne contient que 3 journaux, et `find block-ts-extra*` sur `F:\course-ukemi`, `F:\Monark` et `F:\monark-ledger` ne renvoie rien (`real-brut-bound-facts.log`) ;
- la clémence de `assertBrutComplete` concerne les bruts, qui sont un autre artefact.

## 2. Détail des livrables

### 2.1 C-V-1 : ordre des refus (régression bloquante)
- **Le verrou** est le fichier `<ledger>/<cycle>/<op>.lock`, créé par `openGuardedClient`→`acquireLock` (`packages/rpc-guard/src/lock.ts:17-26`, `guarded.ts:38-45`) [lu].
- **Après le pli**, il ne reste entre l'open et le `try` que `makeGuardedPoolCall` et `makeUkemiPool`. Ce sont des constructions de fermetures, sans chemin de `throw`. Vérifié dans `u4-guard.mjs:149-168` et `rpc2.ts:124-150`, où tous les `throw` sont dans des fonctions internes [lu].
- **Test (a)**, sur le **même** `ledgerDir` et le **même** cycle `c1` :
  1. `to_block` non entier ⇒ `SelectError` nommé, `locksUnder(l) == []` ;
  2. sidecar étranger ⇒ `SelectError` « belongs to another brut », et non « already locked » ; aucun verrou, `l/c1` jamais créé, 0 fetch ;
  3. une fois le sidecar écarté, le même `c1` **se relance et complète**, sans aucun `.lock` restant.
- **Test (b)** : sidecar tronqué (octets de la sonde cp-2) ⇒ `SelectError` « `block-ts-extra sidecar unreadable: ` ». 0 fetch, aucun verrou, fichier laissé octet pour octet identique.
- **Sonde cp-2** : son constat d'origine (« already locked for this cycle ») est reproduit par M9 et M10 : l'ordre de `801859f` rougit le test.

### 2.2 C-V-2 / C-G2-1 / C-G2-2 : tests repris des relecteurs, adaptés
- **Formes retenues** : celles du cp-2 (sidecar écrit à la main, assertion 0 fetch, octets identiques).
- **Refus self-sha** : il porte sur un ts **falsifié** d'un bloc nécessaire, avec le sha des données honnêtes. C'est le cas « matériel » de G2.
- **Flush périodique** : `blockStub` gagne `onFresh(n, before)`, appelé à la **première** requête de chaque bloc neuf.
  - Pourquoi c'est déterministe : clustering, recherche binaire et quorum-2 sont des `await` séquentiels (boucle `for` de `rpc2.ts:161`) [lu], et le flush est synchrone après le 50ᵉ ts.
  - Assertions : `phase:"partial"`, `n_extra==50` et self-sha valide sur disque **pendant** le run, puis `complete`.

### 2.3 C-V-6 / C-G2-3 : tranché, refus
- **Changement** : une seule ligne, `if (sc.phase !== "complete")`. Le message distingue `absent` de `'partial'`, donc le test existant sur `/sidecar phase 'partial' is not 'complete'/` reste vert sans modification.
- **Ordre conservé** : le contrôle `phase` reste **après** self-sha et `discover_sha`. Les tests `:166` et `:178` écrivent des sidecars sans `phase` et comptent sur ces deux gardes ; ils sont inchangés et verts.

### 2.4 Textes C-V-3 / C-V-4 / C-V-5 ; tmp + rename
- **Borne exacte** : `to_block = B_hi = finalized − 64` (§DISC:29). Les `null` viennent des sondes jusqu'à `B_first + 60 000` (`hiSpan`, `liquidation-logs.mjs:66,74`), c'est-à-dire **au-delà de la tête**.
- **Ts au-delà de `to_block`** : un brut **peut** en porter, car le témoin n'est pas borné (`u4b-discover.mjs:139`). `tsOf` les ignore par **choix de domaine**.
- **Variante écartée** (sonde `to_block+1`), pour trois motifs :
  - son existence n'est pas garantie par le code (`--to-block` est libre, `u4b-discover.mjs:73`) ;
  - le ts correspondant est absent du brut réel ;
  - le gain est borné au chemin H-0.
- **Libellés** : tous les `D-n` du lot sont devenus `D-BORNE-1` dans le `.mjs` et le test. `grep -n "D-n\b"` sur les 3 fichiers ne renvoie rien (exit 1).
- **tmp + rename, sources** (preuves dans `sources-rename.log`) :
  - POSIX : un nom remplacé « shall remain visible to other threads throughout the renaming operation » (IEEE Std 1003.1-2024, `rename()`) [lu, curl 19:39:27Z, sha `06671610…`].
  - Windows : libuv 1.51.0, celle de Node v24.15.0, appelle `MoveFileExW(…, MOVEFILE_REPLACE_EXISTING)` (`src/win/fs.c:2266-2273`) [lu, sha `60c76976…`].
  - Microsoft Learn, page MoveFileExW : 0 mention d'atomicité dans le contenu ; les 2 occurrences de « atomic » sont des attributs HTML `aria-atomic` [lu, 19:39:40Z, sha `840ab815…`]. D'où le résidu **R-BORNE-2** (ADR).
- **Sonde NTFS** (`probe-ntfs-rename.log`, en-tête A-12, volume F: en NTFS) :
  - une réécriture sur place garde l'identifiant de fichier ; un remplacement par rename le change ;
  - un lien dur garde les **anciens** octets après un rename, et montre les **nouveaux** après une réécriture sur place ;
  - c'est ce qui fonde le test M17, discriminant sous POSIX comme sous NTFS sans dépendre de `st_ino`.

## 3. Constat mesuré qui corrige le checkpoint-2 (à lire par l'orchestrateur)
Le checkpoint-2 (C-V-3) affirme : « le `block_ts` du brut réel contient des ts `> to_block` ». Mesure faite au pli, en lecture seule, sur `F:\course-ukemi\discover\weth-discover-2026-09-22.json` (`real-brut-bound-facts.log`, en-tête A-12) :
- `brut_sha256` recalculé = porté = `2ffa3acfa317118e419545bdf0e80491a425097f34d391db30ad0f0d3b093fa8` ;
- `block_ts` : 2 328 clés, maximum `24 565 504`, **0 clé `> to_block` (26 034 127)** ;
- `cluster_error: rpc-guard: run_calls (fail-closed)` : le témoin a épuisé ses 6 000 appels avant les clusters de fin de plage ;
- `START-v2.txt` : `finalized=26034191 to=26034127` (16:38:17 UTC), soit exactement −64.

Les commentaires et l'ADR v2 disent donc que le brut **peut** porter de tels ts (par le code), qu'il n'en porte aucun aujourd'hui (mesuré), et qu'ils sont ignorés par choix de domaine. Ils ne reprennent pas la formulation du cp-2.

## 4. Oracle complet (A-3, exits directs, env -u des 8 clés, TEMP sur F:)
Exécution finale auto-identifiée : `F:\tmp\u4b1b3\oracle-pli.sh` → `F:\tmp\u4b1b3\oracle-final\`. L'en-tête `HEADER.txt` donne HEAD `801859f`, les 3 sha livrés, node v24.15.0 et npm 11.12.1, à 19:46:40Z.

| gate | exit | note |
|---|---|---|
| `gate:vocab` | 0 | — |
| `typecheck` | 0 | — |
| `test` | 0 | **tests 934 / pass 933 / fail 0 / skipped 1**. Le skip est le nommé préexistant `u4b_labels_replay_via_main_real_artifact` (« real e2 artifacts absent »). 0 occurrence de `UV_HANDLE_CLOSING` (O-1 du G2 non reproduit) |
| `lint` (`eslint .`) | 0 | — |
| `lint:ratchet` | 0 | **69/69** (aucune violation différée ajoutée) |
| `lang:gate` | 0 | — |
| `export:check` | 0 | — |

Un run antérieur identique (`pli-oracle-*.log`, `pli-oracle-test-full.log`) donne aussi 934/933/0/1 et 7/7 exit 0. Le fichier u4b isolé, en TAP, passe 31/31 (`pli-u4b-tests-1.log`).

## 5. Mutants (A-11 + A-12) : `F:\tmp\u4b1b3\mutants.mjs` étendu
**Fonctionnement du harnais** :
- le fichier de test **entier** tourne en `--test-reporter=tap`, CRLF normalisé ;
- un mutant est tué si et seulement si le TAP porte `not ok N - <nom exact du test tueur>` (`byIntended`) ;
- **pré-vol** : chaque `find` est unique et non vide d'effet, et chaque test tueur est `ok` sur le golden ;
- le log porte l'en-tête A-12 puis, par mutant, le hunk de mutation, le sha du fichier muté et le sha restauré.

**Traçabilité** : la version G1 est conservée telle quelle (`mutants-g1.mjs`). Les `find` de M1, M2 et M6 ont été mis à jour en même temps que le texte du pli.

**Log** (`mutants-pli-run2.log`) :
- `BASELINE status=0 ok=31 not_ok=0 intended_killers_green_on_golden=all`
- `BASELINE_OK=true ALL_KILLED_BY_INTENDED=true ALL_RESTORED=true FINAL_GOLDEN_INTACT=true n_mutants=17`
- golden `.mjs` `20e1cf9d…` identique avant et après.

| # | mutant | test tueur (dans le TAP) | autres tests rouges (signalés) |
|---|---|---|---|
| M1 | clamp `reduceSelection` retiré | `…window_truncated_offline_0_fetch` | 8 tests `makeDiscover` (fixture bornée) |
| M2 | clamp `runFillTs` retiré | `…with_0_fetch_past_to_block` | — |
| M3 | troncature sans `\|\| b_last >= toBlock` | `…window_truncated_offline_0_fetch` | `u4b_episode_selection_is_deterministic` |
| M4 | aucun flush `partial` | `…resumable_after_a_quorum_kill` | flush périodique, tmp+rename |
| M5 | amorçage de reprise retiré | `…resumable_after_a_quorum_kill` | idempotence |
| M6 | garde `phase` de `runSelect` retirée | `…select_refuses_a_partial` | sans-`phase` |
| M7 | flush final `partial` | `…select_refuses_a_partial` | 7 tests fill-ts |
| M8 | retry 2→0 (2ᵉ occurrence) | `…transient_429…` | — |
| **M9** | bloc de reprise replacé **après** open | `u4b_fill_ts_pre_open_refusals_hold_no_cycle_lock_and_the_same_cycle_relaunches` | sidecar tronqué (verrou tenu) |
| **M10** | contrôle `to_block` replacé **après** open | idem | — |
| **M11** | `JSON.parse` nu | `u4b_fill_ts_refuses_a_torn_sidecar_by_name_with_0_fetch_and_no_lock` | — |
| **M12** | `FLUSH_EVERY 50→1e9` | `u4b_fill_ts_flushes_a_durable_partial_every_50_new_ts_observed_mid_run` | tmp+rename (pas de partiel à lier) |
| **M13** | garde `discover_sha` de reprise neutralisée | `u4b_fill_ts_resume_refuses_a_sidecar_from_another_brut_by_name_with_0_fetch` | pre-open (même garde) |
| **M14** | garde self-sha de reprise neutralisée | `u4b_fill_ts_resume_refuses_a_falsified_sidecar_by_self_sha_with_0_fetch` | — |
| **M15** | un `complete` n'est pas réamorcé | `u4b_fill_ts_rerun_on_a_complete_sidecar_is_idempotent_0_fetch_identical_bytes` | — |
| **M16** | `phase` absente acceptée | `u4b_select_refuses_a_block_ts_extra_sidecar_without_phase_by_name` | — |
| **M17** | tmp+rename abandonné (réécriture sur place) | `u4b_fill_ts_replaces_the_sidecar_by_tmp_rename_never_in_place_and_leaves_no_tmp` | — |

## 6. R-25, A-6, livraison
- **R-25** (pathspec `ci.yml:65` **verbatim**, `git diff --shortstat b900b4b -- <pathspec>`, arbre de travail = lot cumulé + pli) : **3 files, 421 insertions, 22 deletions = 443**.
  - Par fichier : test 326/2, `.d.mts` 15/1, `.mjs` 80/19.
  - Part commitée seule (`b900b4b...HEAD`) : 221. Part du pli seule (`HEAD` → arbre) : 245/33 = 278.
  - Bornes : < 1 150 (mission) ; borne CI réelle `VIBEGATES_PR_LIMIT=1205` (`ci.yml:43`).
- **A-6** : 11/11 identiques, via `a6.sh` (régime B, LF).
  - Égalité : `A6-pli-before-blob.txt` (blobs `801859f`) == `A6-pli-after-wt.txt` (arbre du pli) == `A6-shas-before.txt` du G1.
  - Couverture : les 9 sha §2, `liquidation-logs bf4eb293…` et `windows.ts b84827ae…`.
  - Prereg `1971d9b1…` inchangé ; `git diff --quiet` sur le prereg et l'ADR-U4b : OK.
- **A-2** : `require.resolve('@monark/rpc-guard')` → `F:\Monark-wt-u4b1b3\packages\rpc-guard\src\index.ts`, donc le worktree. `node_modules` était déjà pointé ; mk-nm n'a pas été relancé.
- **`DELIVERED.sha256`** régénéré en dernier (`sha256sum -c` OK). L'ancien est conservé dans `DELIVERED-g1.sha256`.
  - `20e1cf9d477d869afe0498d201680bd1037069176b6700865ceb47194a953280  scripts/census/u4b/u4b-select-episode.mjs`
  - `30d61b79472ccedc81da75b404d6bb33fc89c6b1d3bdec5a0c2807ba855e3bec  scripts/census/u4b/u4b-select-episode.d.mts`
  - `696c7c030511753a7c9f4d0a98c7efccc86f3cb5fcd71b5ad0dd7475c75feec1  apps/sentinel/test/u4b-select-episode.test.ts`
- **Hygiène** : `git diff --check` propre ; fins de ligne LF (0 CR) ; aucun résidu temporaire des 8 nouveaux tests.

## 7. Consigne standard G1 : point par point (A-1..A-12, B, C, D, E, F)
- **A-1** : fait (1ʳᵉ ligne). Le texte « stop si ≠ `claude-opus-4-8` » est périmé par la décision 133 ; la mission fixe le préfixe `claude-opus-5-5` (O-2).
- **A-2** : fait (resolve → worktree).
- **A-3** : fait (7 gates, exits directs, §4).
- **A-4** : fait (`DELIVERED.sha256`, rendu sous `F:\tmp\u4b1b3\`, 0 commit, rien sur `C:`, seul `fetch` bouchonné). Écart déclaré : trois lectures web en **lecture seule** (curl GitHub raw libuv, pubs.opengroup.org, learn.microsoft.com) pour sourcer le rename ; aucune API de données, aucun appel de nœud RPC.
- **A-5** : fait (443).
- **A-6** : fait (11/11).
- **A-7** : fait. Aucune variable affichée ; le retrait des clés est insensible à la casse dans le harnais.
- **A-8** : fait. Les stubs servent `eth_getBlockByNumber` sous forme réelle (`{hash,number,timestamp}` hex ; bloc inexistant = `result:null`). La forme de réponse de `blockStub` est inchangée ; seule l'option `onFresh` a été ajoutée, déclarée en D-4.
- **A-9** : n-a (aucune phrase servie modifiée).
- **A-10** : fait. `runSelect` refuse et accepte réellement le fichier produit par `runFillTs`, et les octets du sidecar sont comparés après relance.
- **A-11** : fait (§5).
- **A-12** : fait. En-têtes présents dans `mutants-pli-run2.log`, `probe-ntfs-rename.log`, `real-brut-bound-facts.log`, `sources-rename.log` et `oracle-final/HEADER.txt`.
- **B-1..B-6, C-1..C-4** : n-a. Aucun opérateur payant, aucune nouvelle classe d'erreur (`SelectError` réutilisée).
- **D-1** : fait (17 mutants nommés).
- **D-2** : fait. Vecteurs non vides : sidecars à données réelles, ts falsifié sur un bloc nécessaire, 50 et 60 ts.
- **D-3** : fait. Seul `globalThis.fetch` est bouchonné ; les sidecars tronqué et étranger sont posés sur disque comme état.
- **D-4** : fait. Diff du test annoté :
  - (+) imports `mkdirSync/readdirSync/linkSync` ;
  - (+) option `onFresh` de `blockStub`, additive et sans effet quand elle est absente ;
  - (~) libellés `D-n`→`D-BORNE-1` dans 2 commentaires, 1 docstring et 1 message d'assertion ;
  - (+) 8 tests ;
  - aucune assertion retirée ni affaiblie.
- **E-1** : fait. Le verrou ne peut plus rester tenu après un refus local (M9, M10). Un kill dur laisse toujours le verrou, comme prévu par `unlockAll` ; c'est hors portée du lot.
- **E-2, E-3** : inchangés.
- **F-1** : fait. Ligne Tuyaux avec les 8 tests, résidus à déclencheur. `ADR-amendement-v2.md` ne renvoie à aucun chemin hors dépôt : `grep -c "F:"` = 0, `grep -c "course-ukemi"` = 0 (sha du fichier `92543c99…`).
- **F-2** : fait. Tout texte écrit au pli est ASCII. Les seuls caractères non ASCII des lignes touchées (`—`, `§`) existaient déjà sur des lignes où seul `D-n` a changé. `gate:vocab` et `lang:gate` à 0.
- **F-3** : fait (§8).
- **G-1** : n-a (aucune pièce publique touchée).

## 8. Déviations D-n (F-3)
- **D-n-1 (tmp + rename implémenté au pli)** : c'est l'option « préférée » de la mission (≤ 10 lignes ; ici 5 lignes de code), testée par M17. Elle clôt l'item du checkpoint-2 ; le résidu Windows est formé (R-BORNE-2).
- **D-n-2 (mutant M10 ajouté)** : en plus des deux mutants nommés par la mission, il couvre le déplacement de `toBlock` qu'elle exige aussi.
- **D-n-3 (libellés)** : `D-n` → `D-BORNE-1` dans le `.mjs` et le test du lot, par cohérence avec le numéro assigné.

## 9. Items formés et observations (P5 : zéro dû nu)
- **R-BORNE-1 et R-BORNE-2** : items à déclencheur, propriétaire orchestrateur. Le texte complet est dans `ADR-amendement-v2.md`.
- **Fold** (propriétaire orchestrateur, déclencheur : fold de l'ADR v2) : journaliser dans CHANTIERS la mesure du §3 (brut réel, 0 clé `> to_block`), pour qu'elle devienne une source en dépôt.
- **O-1 (runSelect, observation hors portée)** : un sidecar **illisible** passé à `runSelect --block-ts-extra` lève encore une `SyntaxError` non nommée (`JSON.parse` nu, préexistant, hors mission).
  - Le comportement reste fail-closed : 0 fetch, aucun verrou (`runSelect` n'ouvre pas de garde), aucune écriture.
  - Avec tmp + rename, `--fill-ts` ne peut plus produire ce cas, sauf dans le scénario R-BORNE-2.
  - **Item formé** : nommer ce refus comme dans `runFillTs`. Propriétaire : orchestrateur. Déclencheur : celui de R-BORNE-2 (première reprise réelle sur sidecar illisible) ou le prochain lot qui touche `runSelect`.
- **O-2 (roster, texte périmé)** : `docs/CONSIGNE-STANDARD-G1.md:6` (A-1) exige encore `claude-opus-4-8…`, contrairement à la décision 133 et au contrôle de cette mission.
  - **Item formé** : aligner A-1 sur `claude-opus-5-5`. Propriétaire : orchestrateur. Déclencheur : avant la prochaine mission G1.
  - Fait constaté : le corps du prompt worker de cette session porte lui aussi l'épinglage `claude-opus-4-8`, alors que la mission impose le préfixe `claude-opus-5-5`. La mission, postérieure, fait foi.
  - Lien non vérifié : l'entrée « O-5 agent bodies fixed » du commit `60b54c0` en est probablement la correction, sans que ce soit établi ; l'orchestrateur le confirme au prochain redémarrage. Aucune action worker.
- **O-3 (O-1 du G2)** : le flake `UV_HANDLE_CLOSING` ne s'est pas reproduit sur 2 suites complètes (0 occurrence).

## 10. Fichiers
- **Dépôt** (worktree `F:\Monark-wt-u4b1b3`, non commité) :
  - `scripts/census/u4b/u4b-select-episode.mjs`
  - `scripts/census/u4b/u4b-select-episode.d.mts`
  - `apps/sentinel/test/u4b-select-episode.test.ts`
- **Rendu** (`F:\tmp\u4b1b3\`) :
  - `RENDU-PLI.md` (ce fichier) ; `ADR-amendement-v2.md` (à folder ; v1 conservé dans `ADR-amendement-v1.bak.md`) ;
  - `DELIVERED.sha256`, `DELIVERED-g1.sha256` ;
  - `mutants.mjs` (étendu), `mutants-g1.mjs`, `mutants-pli-run1.log`, `mutants-pli-run2.log` ;
  - `oracle-pli.sh`, `oracle-final\` (HEADER, EXITS, 7 logs), `pli-oracle-*.log`, `pli-u4b-tests-1.log`, `pli-typecheck-1.log`, `pli-lint-file-1.log`, `pli-ratchet-1.log` ;
  - `a6.sh`, `A6-pli-before-blob.txt`, `A6-pli-before-wt.txt`, `A6-pli-after-wt.txt`, `A6-pli-after-blob.txt` ;
  - `real-brut-bound-facts.log`, `sources-rename.log`, `probe-ntfs-rename.mjs`, `probe-ntfs-rename.log` ;
  - `apply-pli.mjs` et `patch\` (paires find/repl exactes, extraites par `sed -n` du golden `801859f`).

## Provenance
- **Worker** : `claude-opus-5-5[1m]`, effort max, 2026-09-22 (19:2x–19:5x UTC), contexte frais.
- **Base** : `lot/u4b-1b-3` @ `801859f`, dont le parent et le merge-base sont `b900b4b`.
- **Entrées lues** : `CHECKPOINT2-lot-u4b-1b-3.md`, `G2-lot-u4b-1b-3.md`, `G1.md`, `ADR-amendement.md`, `CONSIGNE-STANDARD-G1.md` (y compris A-12, ajouté en cours de mission), et les harnais des relecteurs `g2-demo-tests.ts` et `cp2-{harness,lock,trunc}.test.mjs`.
- **Advisor intégré** : consulté 3 fois (conception ; contrôle avant l'oracle ; contrôle final du rendu). Avis suivis, aucun verdict délégué.
- **Révision** : orchestrateur (R-21), puis G2-delta ‖ re-cp-2.
