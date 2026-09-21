# G2 — RELECTEUR (instance séparée, contexte frais, revue 3 étapes) — lot NARABI-OPS-1c

## Verdict : **PASS-AVEC-CORRECTIONS** (3 corrections FORMÉES, toutes NON BLOQUANTES pour G7/E-5 ; AUCUNE ne touche `run.ts`)

- **Aucune régression** sur le chemin servi en production (job quotidien Narabi). Le code de production `run.ts` est **byte-identique au sha E-5 `54619a40`** ; le bloc d'écriture est byte-identique à la base ; un jour dû normal produit un `state.json` byte-identique et le même `line_hash` publié (L-4).
- Les 7 mutants du worker rougissent (restauration byte-exacte), + 3 mutants G2 de mon cru, + le mutant V-1 du validateur (tué par le test C1). 1 mutant survit → **lacune de FORCE de test** (non un défaut de comportement), formée en C-G2-2.
- **C4 du checkpoint-2 satisfait** : cette G2 est rendue PASS et consignée. **Aucune correction ne touche `run.ts`** ⇒ le sha `54619a40` tient, le checkpoint-2 n'a PAS à être rejoué, et il n'y a **aucune divergence** de la checklist du validateur (je confirme C1/C3 landées, V-1 tué, résiduels (i)/(ii)/(iii) déclarés) ⇒ **pas d'ESCALADE**.

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme ; effort max ; Opus 5 banni). Worker RELECTEUR G2, contexte frais.

---

## Provenance & régime B (à lire en premier)
- Worktree `F:\Monark-wt-narabi1c`, branche `lot/narabi-ops-1c`, base `5d177db`.
- **La mission a épinglé HEAD = `ff98be4` (G1 ; test +369, R-25 458). Pendant ma revue (régime B), le checkpoint-2 a LANDÉ : HEAD a avancé à `90150c4`.** Commits `5d177db..90150c4` :
  - `ff98be4` G1 (worker) ; `e681754` checkpoint-2 (ACCEPTE-AVEC-CORRECTIONS C1..C4) ; `9ea1b05` fold TEST-ONLY (C1 + C3) ; `90150c4` ré-acceptation (ACCEPTE).
- **`run.ts` est byte-identique `54619a40` à `ff98be4` ET `90150c4`** (`git show ff98be4:…/run.ts | sha256sum` == `git show 90150c4:…/run.ts | sha256sum`) : le fold est TEST-ONLY. Mes vérifications `run.ts` (statiques, bloc d'écriture, mutants, différentiel) valent pour les deux HEAD.
- **J'ai revu le HEAD COURANT `90150c4`** (= « dernier commit » de la mission), qui est le sur-ensemble : test 369→385 lignes (les 2 ajouts C1/C3), + `docs/CHECKPOINT2-lot-narabi-ops-1c.md`. Diff `5d177db..90150c4` = **exactement 3 fichiers** : `apps/sentinel/src/run.ts`, `apps/sentinel/test/sentinel-catchup-budget.test.ts`, `docs/CHECKPOINT2-…md` (l'ADR et le G0 ne sont PAS retouchés par le fold).

## Conditions de rejeu (respect strict de la consigne)
- **Aucune écriture dans le dépôt.** Mutants dans un arbre ISOLÉ `git archive 90150c4 → F:\tmp\g2-narabi1c\tree`, jonction `node_modules → F:\Monark\node_modules`, restauration byte-exacte par sha256 (jamais `git checkout`/`stash`, jamais `npm ci`/`install`). `git status` sur `F:\Monark-wt-narabi1c` VIDE avant/après ; HEAD stable `90150c4`.
- **`git archive 90150c4`** : `run.ts` = `54619a40…`, test = `46a2f726…` (== valeurs annoncées).
- **Aucun réseau** (pool RPC injecté / stub `fetch`), **aucun vrai mail**, **rien sur C:** (`TEMP`/`TMP` redirigés vers `F:\tmp\g2-narabi1c\nodetmp` pour tous les `node --test` et sous-processus).

---

## Résultats point par point (mission 1→10)

### (1) `npm run ci` + eslint + ratchet — VERT, le diff n'ajoute rien
- `npm run ci` (worktree, TEMP→F:) : **exit 0** ; `gate:vocab OK — 203 fichiers` ; `tsc` 0 erreur ; **`ℹ tests 701 / pass 700 / fail 0 / skipped 1`**. `git status` VIDE après (0 écriture repo).
- Le **1 skip** est **`fetch_only_inside_client`** (pré-existant, `# until 1b:` migration bell→@monark/rpc-guard), PAS de mon lot. `sentinel_budget_below_unit_timeout` s'exécute (`✔`) dans le worktree (deploy/ présent).
- **eslint sur les 2 fichiers du lot** : `npx eslint apps/sentinel/src/run.ts apps/sentinel/test/sentinel-catchup-budget.test.ts` → **exit 0, 0 ligne** (aucune erreur ajoutée).
- **Ratchet** : `node scripts/lint-ratchet.mjs` = `70/69` (PRÉ-EXISTANT, exit 1). Delta mesuré dans l'arbre isolé : **avec** le fichier de test = `70/69` ; **sans** = `70/69` ⇒ le lot **ajoute 0** au ratchet. (erreur lint pré-existante `apps/bell/test/rebase-crosscheck.test.ts:600` : hors périmètre, non touchée.)

### (2) Bloc d'écriture de `main` BYTE-IDENTIQUE à la base — Mode B inchangé
- Base `run.ts:182-192` == HEAD `run.ts:235-245`, `diff` vide, **sha256 identique `32f48d6bdd2d7d28fe92e65852d69289a2cbb108aace93ca48d48b3e517a48fb`** des deux côtés. Un seul `appendFileSync` de k lignes, puis `writeFileSync(state.json)`, puis 2 `copyFileSync` vers `public/`. La fenêtre « ligne tronquée » (Mode B) est inchangée.

### (3) Non-régression du job de production — PROUVÉE par différentiel base↔HEAD
Différentiel `F:\tmp\g2-narabi1c\diff-normal.mjs` : même stub committé (motif retry, piloté par la fixture), jour dû = l'incident 2026-09-19, état amorcé de 2 lignes de la fixture, pilotant **le `run.ts` de la base ET celui de HEAD** :
- **`state.json` BYTE-IDENTIQUE** (`fd2d8f23…`) base==HEAD ; **`public/state.json` idem**.
- **Ligne écrite** : le SEUL champ qui diffère est **`sentinel_sha`** (témoin de build, HORS champs hachés) ; **`line_hash` IDENTIQUE `f73c700642b3…` (= L-4 publié)** ; **`digest_T` IDENTIQUE**.
- Les deux : **exit 0, `stopped:null`, `processedDays:["2026-09-19"]`**. End-JSON : clés partagées à valeurs IDENTIQUES (liste des divergences = `[]`) ; HEAD n'ajoute que `elapsed_ms`/`max_day_ms`.
- Corroboré par le test committé `sentinel_normal_day_unchanged` (VERT : `line_hash==l3`, `Object.keys`=10+2, exit 0, `stopped:null`), et par **L-4 `sentinel-retry.test.ts` REJOUÉ PAR MOI dans les DEUX arbres : base `5d177db` 4/4, HEAD `90150c4` 4/4** (non édité — diff base..HEAD vide). `--dry-run` : `sentinel_dry_run_honours_budget_same_exit` VERT (même exit, rien écrit) ; L-4 cas (e) exerce aussi `--dry-run` sous arrêt sur les deux arbres.

### (4) Mutants — 7 du worker + 4 du G2 + V-1 du validateur (arbre isolé, restauration byte-exacte)
Baseline pristine : **12 pass / 0 fail**. FINAL `run.ts` sha == pristine `54619a40…` après CHAQUE mutant. Voir la table plus bas. Points spécifiques exigés :
- **Horloge réelle dans `runDue`** : `runDue` n'utilise QUE `opts.now()` ; aucun `Date.now`/`performance.now` (grep du corps VERT via `sentinel_no_clock_env_is_read`). Le seul emploi réel est `main:221` (`now: () => performance.now()`) et les cooldowns de `rpc.ts` (hors budget). Mutant **G1** (injecte `performance.now()` dans le garde) → rouge sur `sentinel_no_clock_env_is_read` (grep statique) ET `sentinel_first_due_day_always_attempted` (couture DIRECTE) — **la couture sous-processus SEULE ne l'attraperait pas** (le stub y REMPLACE `performance.now`), d'où la valeur des DEUX coutures + le test-grep.
- **`lag` mal compté** : `dueList.length - processedDays.length` correct. Mutant **G2** (`-1`) → rouge (lag 13→12 / lag 2→1).
- **Écrasement d'un `stopped`** : impossible par construction — le garde budget est en TÊTE de boucle et TOUS les chemins `break` immédiatement après `stopped=…`. Mutant **G3** (retrait du `break` après `catchup_budget`) → rouge (traite les 20 jours) : le `break` est porteur.
- **`max_day_ms` hors `finally`** : mutant **G4** (mesure seulement au succès, saute le jour en faute) → **SURVIT** (12/0). Cause : dans `sentinel_max_day_ms_covers_a_faulting_day`, jour-atteint et jour-en-faute avancent l'horloge du MÊME `STEP_MS`, donc `maxDayMs==STEP` que le jour en faute soit mesuré ou non. → **C-G2-2** (le mutant « finally entièrement retiré » EST attrapé, cf. V-3 du validateur ; c'est la variante chirurgicale qui n'est pas épinglée).
- **Budget lu à chaque jour** : structurellement impossible — `budgetMs` est un PARAMÈTRE (lu une fois en `main:211` via `budgetMsFromEnv`), `runDue` ne lit aucun env ; `t0` capturé une fois à l'entrée de boucle. Mutant équivalent / non exprimable (limite de test déclarée, alignée advisor).
- **Env `MONARK_SENTINEL_BUDGET_S`** (`budgetMsFromEnv`, rejeu direct sur `run.ts` archivé) : `" 180"`,`"180 "`,`"180.0"`,`"1e2"`,`""`,`"-30"`,`"+180"` → **THROW** ; `"29"`,`"181"`,`"0"` → THROW (hors bornes) ; absent → 180000. **MAIS `"0180"`, `"00180"`, `"030"` → 180000/30000 SANS throw** (voir C-G2-1).

### (5) Test via `main` en SOUS-PROCESSUS — couture d'horloge côté TEST, jamais en env de prod
- La couture est un stub `--import` (`stubUrl()`, motif `sentinel-retry.test.ts:89,125`) qui pilote `performance.now` DANS L'ENFANT ; `run.ts` ne lit AUCUNE clé d'horloge (grep `CLOCK|TICK|WALL` VERT ; `run.ts` ne lit que `MONARK_SENTINEL_{DIR,J0,BUDGET_S}` — `sentinel_no_clock_env_is_read`).
- `sentinel_catchup_budget_stops_cleanly_between_days` (VERT) prouve : **7 jours traités / `lag:13` / exit 1 / `timeline.jsonl` fini par `\n` / 7 lignes chaînées / `digest` du `public/state.json` == `digest_T` de la 7ᵉ ligne** (invariant fact-5 de la sonde). `sentinel_catchup_resumes_next_slot_without_gap` (VERT) : reprise à `prevDay+1`, 14 jours contigus, 0 doublon, chaîne de hash continue, `trackerReplay==replay_q` publié.
- **C1 landé** (fold checkpoint-2) : `sentinel_budget_env_value_reaches_rundue` (VERT) prouve que la VALEUR d'env atteint `runDue` (`BUDGET_S:"30"` sur backlog 20j ⇒ 2 jours, `lag:18`, `catchup_budget`, exit 1, `elapsed_ms==60000`). **Le mutant V-1 du validateur (main valide l'env mais passe la CONSTANTE 180000) est tué par CE test, et lui seul** (rejoué : 11 pass, 1 fail, restauration `54619a40…`).

### (6) `sentinel_budget_below_unit_timeout` — lit le VRAI `.service`, formule correcte, SKIP légitime & DÉCLARÉ
- Lit `deploy/monark-sentinel.service` (le VRAI, `TimeoutStartSec=300` — non modifié par le lot), asserte **`BUDGET_MAX_S(180) + MARGIN_MIN_S(120) = 300 ≤ TimeoutStartSec(300)`**. Mutant **M6** (copie à 200, via l'override TEST-ONLY `NARABI_SENTINEL_SERVICE_FILE`, le fichier repo n'est PAS muté) → rouge.
- **SKIP** : le fold checkpoint-2 (C3) a durci la condition — skip **SSI le RÉPERTOIRE `deploy/` est absent** (`existsSync(DEPLOY_DIR)`), et `assert.ok(existsSync(SERVICE_FILE), …)` avant l'assert. **Reproduit par moi dans l'arbre isolé** :
  - **deploy/ absent** (miroir de l'export public) → SKIP propre (`# SKIP the deploy/ directory is omitted from the public export`), **11 pass / 0 fail / 1 skip**.
  - **deploy/ présent, `.service` renommé** → **ÉCHOUE** (`not ok … 'deploy/ is present but …monark-sentinel.service is missing (renamed?) — a regression, not an export skip'`).
  - **`NARABI_SENTINEL_SERVICE_FILE` → inexistant** → **ÉCHOUE** (pas de skip silencieux).
- Donc **skip LÉGITIME et DÉCLARÉ, pas un trou** (le hole du HEAD épinglé `ff98be4`, `existsSync(SERVICE_FILE)` trop large, est CLOS par C3 à `90150c4`). L'alternative « ajouter à `scripts/export-exclude-tests.json` » est correctement REJETÉE (ce fichier ne liste que 4 tests governance/upcoming ; l'inclure exclurait aussi les 11 autres tests du lot de la CI publique). **Test 42** = `test/export-public.test.ts:115` (`export_public_no_governance_no_french` ; assertion (e) = la CI EXPORTÉE, ADR-M004 D7) : VERT dans mon `npm run ci` — le miroir export (deploy/ absent) fait SKIP proprement (reproduit ci-dessus), sans crash.

### (7) Modes résiduels — DÉCLARÉS ; pas de « livelock removed » ; léger sur-vente dans DEUX commentaires (C-G2-3)
- ADR (branche du lot, `:123`) déclare **(i) A′** (jour unique > 300 s ; `rpc.ts:one()` peut tourner 9 endpoints × 20 s) et **(ii)** jour lent au-delà de la marge APRÈS l'arrêt budget (lignes du run perdues). **(iii) préambule hors budget** déclaré par le validateur (C2) via **`feca317` sur `lot/etude-suite`** (ancêtre d'etude-suite ⇒ la fusion E-5 de -1c le portera ; PAS sur la branche du lot — topologie docs-sur-cible attendue). Vérifié PAR MOI : `feca317` ADR = ligne « Residual (iii)… criterion of NO gains… systemd wall-clock minus elapsed_ms > 30 000 ms ».
- **RUNBOOK vérifié par moi first-hand** (`git show lot/etude-suite:docs/RUNBOOK-sentinel.md`) : `:192` « **Status since sub-lot NARABI-OPS-1c … Mode A is REDUCED, not lifted.** ». Les seuls hits `removed`/`remove it` (`:285`,`:296`) relèvent de la procédure de RÉCUPÉRATION Mode B (retirer une ligne tronquée), PAS d'une sur-déclaration Mode A. Aucun `supprim|lifted|eliminat`.
- Code : `grep 'livelock|removed|lifted|eliminat'` sur `run.ts` = **AUCUN** (le drapeau rouge de la mission est absent). MAIS `:26` « a multi-day backlog **can no longer be killed at the same point every slot** » et `:105` « **progresses instead of being killed at the same point every slot** » sont ABSOLUS, sans le qualificatif « on a healthy pool » ni pointeur vers (ii)/(iii) — léger sur-vente. L'ADR/RUNBOOK, eux, disent « REDUCED, not lifted » (précis). → **C-G2-3** (NON bloquant ; éditer `run.ts` churnerait le sha E-5).

### (8) R-25 = **474**, sous la borne dure 1205 — justifié par le pli, non gonflé
- Pathspec **verbatim `.github/workflows/ci.yml:65`** (le RENDU ne remplace que le ref `origin/${{ github.base_ref }}...HEAD` par la base). Mesuré `git diff --shortstat 5d177db...90150c4 -- <pathspec>` = **`456 insertions + 18 deletions = 474`** (== annonce commit `9ea1b05` / checkpoint-2). **Borne CI `VIBEGATES_PR_LIMIT=1205`** ⇒ 474 << 1205.
- Réconciliation du « 458 » de la mission : c'était le nombre à `ff98be4` (440+18). Le fold checkpoint-2 TEST-ONLY (C1 test + C3 skip, net +16) porte à 474. **Justifié** : 71 lignes de PRODUCTION (`run.ts`), le reste = la suite de 12 tests imposée + oracles (double couture sous-proc/direct, différentiel, invariant inter-fichiers, `trackerReplay`) issus du pli checkpoint-1 C1..C9 + C1/C3 du checkpoint-2. Périmètre FERMÉ (2 fichiers de code, impossible de scinder). **Non gonflé** : aucune assertion tueuse de mutant n'est du remplissage.

### (9) Vocabulaire interdit absent ; anglais
- `gate:vocab OK — 203 fichiers` (inclut le scope `sentinel` src+test+deploy, `vocab_sentinel_scope_scans_src_test_deploy` VERT). Diff en anglais.
- **Nuance (informationnelle, pas un défaut)** : le fichier de test porte **14 lignes non-ASCII (tiret cadratin U+2014)** ; `run.ts` (lignes ajoutées) est **pur-ASCII**. Le tiret cadratin est une CONVENTION du dépôt (le `sentinel-retry.test.ts` committé et VERT en porte 21) ; **aucun gate ne l'interdit** (`lang-gate` = détection du FRANÇAIS sur les scopes d'export ; `apps/sentinel/test` n'est pas un scope gardé). La formule du RENDU « anglais pur-ASCII » est donc IMPRÉCISE (anglais oui ; pur-ASCII non), sans conséquence.

### (10) Fusion avec `lot/etude-suite` — PROPRE, aucun conflit
- `git diff --name-only 5d177db..lot/etude-suite -- apps/sentinel/` = **VIDE** ; les 2 fichiers du lot + `deploy/` NON touchés sur etude-suite depuis la base.
- **`git merge-tree --write-tree lot/etude-suite lot/narabi-ops-1c`** ⇒ arbre `f87f25f8…` **sans marqueur de conflit** (merge propre). `rpc.ts` byte-identique (sha `0e232519…` base==HEAD), `sentinel-retry.test.ts` non édité.

---

## Table livrable → test → mutant (rouge PROUVÉ, sortie TAP citée)
Arbre isolé `F:\tmp\g2-narabi1c\tree` (archive `90150c4`), pristine `54619a40…`, restauration `copyFileSync` (jamais git). Baseline **12 pass / 0 fail**. Runner : `F:\tmp\g2-narabi1c\g2-mutants.mjs`.

| Livrable (exigence) | `run.ts` | Test (VERT) | Mutant → cible ROUGE (failed:[…] cité) | restore |
|---|---|---|---|---|
| Garde budget STRICT entre jours, `stopped="catchup_budget"`, lignes rendues | :120 | `…stops_cleanly…` | **M1** garde retirée → `[stops_cleanly, env_value_reaches, resumes, first_due, dry_run]` | byte-exact |
| 1er jour dU toujours tenté | :120 (`!first`) | `…first_due_day_always_attempted` | **M2** garde avant 1er jour → `[first_due]` (seul) | byte-exact |
| `stopped` non nul à l'arrêt (contrat L-1 exit 1) | :120 | `…stops_cleanly…` | **M3** `stopped` laissé null (`{ break; }`) → `[stops_cleanly, env_value_reaches, resumes, first_due, dry_run]` | byte-exact |
| Lignes déjà produites ÉCRITES | :120/:145 | `…stops_cleanly…`,`…resumes…` | **M4** lignes jetées (`lines.length=0`) → `[stops_cleanly, resumes]` | byte-exact |
| Validation env fail-closed | :41-47 | `sentinel_budget_env_is_validated` | **M5** 2 throw neutralisés → `[budget_env_is_validated]` | byte-exact |
| Invariant inter-fichiers `≤ TimeoutStartSec` | (lit `.service`) | `sentinel_budget_below_unit_timeout` | **M6** copie `.service` à 200 (repo NON muté) → `[budget_below_unit_timeout]` | n/a (0 mutation repo) |
| Comparaison STRICTE `>` (180 s exact) | :120 | `sentinel_budget_boundary_is_strict` | **M7** `>=` → `[stops_cleanly, env_value_reaches, resumes, boundary_is_strict, dry_run]` | byte-exact |
| Aucune horloge réelle dans `runDue` | :116/:120/:141/:144 | `sentinel_no_clock_env_is_read` + `first_due` | **G1** `performance.now()` dans le garde → `[first_due, no_clock_env_is_read]` | byte-exact |
| `lag` = jours restants | :145 | `…stops_cleanly…` | **G2** `-1` → `[stops_cleanly, env_value_reaches, first_due, boundary, normal_day, dry_run]` | byte-exact |
| `break` porteur à l'arrêt budget | :120 | `…stops_cleanly…` | **G3** `break` retiré → `[stops_cleanly, env_value_reaches, resumes, first_due, dry_run]` | byte-exact |
| VALEUR d'env atteint `runDue` (C1) | :211/:221 | `sentinel_budget_env_value_reaches_rundue` | **V-1** (validateur) constante 180000 passée → `[env_value_reaches]` (seul) | byte-exact |
| `max_day_ms` mesuré au `finally` (jour en faute) | :140-142 | `sentinel_max_day_ms_covers_a_faulting_day` | **G4** mesure au succès seul → **SURVIT (12/0)** — voir C-G2-2 | byte-exact |

Sortie brute conservée : `F:\tmp\g2-narabi1c\g2-mutants.mjs` (rejouable). Toutes les restaurations vérifiées `sha256==54619a40…`.

---

## Corrections FORMÉES (zéro dette) — toutes NON BLOQUANTES, aucune ne touche `run.ts`

**C-G2-1 — validation d'env tolère les zéros de tête (test-only ; `error_origin` proposé : worker G1 / couverture).**
- `run.ts:44` `budgetMsFromEnv` : `/^\d+$/` puis `Number(raw)` ⇒ `"0180"`,`"00180"`,`"030"` acceptés (→ 180000/30000). Le rejet-list du test `sentinel-catchup-budget.test.ts:284` ne couvre AUCUN cas à zéro de tête ; la mission listait `"0180"` explicitement.
- INOFFENSIF (valeur canonicalisée correctement ; le validateur (e) concourt « inoffensif, à mentionner »).
- Correctif recommandé (SANS toucher `run.ts`, pour ne pas churner le sha E-5) : **documenter la tolérance** (une ligne d'ADR : « décimaux à zéro de tête canonicalisés, non rejetés »). Si un futur lot touche `run.ts` : resserrer à `^[1-9]\d*$` + ajouter `"0180"`,`"030"` au rejet-list. **NON bloquant.**

**C-G2-2 — `sentinel_max_day_ms_covers_a_faulting_day` n'épingle pas sa cible (test-only ; `error_origin` : worker G1 / couverture).**
- Le test affirme « le `finally` mesure le jour en faute » mais mon mutant G4 (mesure au succès seul, saute le jour en faute) **survit** : jour-atteint et jour-en-faute avancent l'horloge du MÊME `STEP_MS`, donc `maxDayMs==STEP` dans les deux cas. (Le mutant « finally entièrement retiré » EST attrapé — V-3 du validateur — donc la garde n'est pas nulle, mais la variante chirurgicale ne l'est pas.)
- Correctif (test-only) : faire avancer l'horloge du jour EN FAUTE de `2*STEP` (2ᵉ appel avançant l'horloge avant la faute, ou pas plus large pour le jour 1) et asserter `maxDayMs == 2*STEP_MS`. Le code (`run.ts`) est CORRECT ; c'est la force de mutation du test qui manque. **NON bloquant.**

**C-G2-3 — deux commentaires de `run.ts` sur-vendent légèrement (doc/comment ; `error_origin` : worker G1 / précision).**
- `run.ts:26` (« can no longer be killed at the same point every slot ») et `:105` (« progresses instead of being killed at the same point every slot ») sont ABSOLUS, sans « on a healthy pool » ni pointeur (ii)/(iii). Les phrases-drapeau de la mission (« livelock removed/lifted/eliminated ») sont ABSENTES et l'ADR/RUNBOOK sont précis (« REDUCED, not lifted »).
- Correctif : un qualificatif d'une clause (« on a healthy pool ; residuals (ii)/(iii) ADR-NARABI-OPS-1c »). **RECOMMANDÉ de reporter au prochain lot touchant `run.ts`** (éditer maintenant churnerait le sha E-5 `54619a40`). **NON bloquant.**

*(Note informationnelle, pas une correction : la formule « anglais pur-ASCII » du RENDU est imprécise — 14 lignes à tiret cadratin U+2014, convention du dépôt, aucun gate ne l'interdit. Aucune action.)*

## `error_origin` proposé (assignation finale au G7 par l'orchestrateur)
- **Logique de production (`run.ts`)** : **aucun défaut** ⇒ `error_origin = néant`. Le code est correct, sans régression, byte-identique au sha E-5.
- **Items FORMÉS (mineurs, non bloquants)** : C-G2-1 & C-G2-2 = **worker G1 (couverture de test)** ; C-G2-3 = **worker G1 (précision de commentaire)**. Tous héritent d'une décision de conception « ne pas modifier `run.ts` » qui est SAINE (préserve le sha E-5).

## Rappels de gate
- **R-20 respecté** : je n'ai rien committé, déclenché aucun workflow. `git status` VIDE, HEAD stable `90150c4`.
- **R-21** : chaque affirmation ci-dessus est reproductible — arbre isolé `F:\tmp\g2-narabi1c\tree`, runner `g2-mutants.mjs`, différentiel `diff-normal.mjs`, log `ci.log`.
- **Conséquence pour le validateur (C4)** : G2 rendue **PASS-AVEC-CORRECTIONS**, aucun bloquant, **aucune correction ne touche `run.ts`** ⇒ le sha `54619a40` tient, le checkpoint-2 n'a PAS à être rejoué, **pas de divergence** de la checklist ⇒ **pas d'ESCALADE**. G7 peut clore le lot ; les 3 C-G2 sont des durcissements test/doc formés, plaçables en suivi.
