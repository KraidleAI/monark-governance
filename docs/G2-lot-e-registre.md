# G2 — Revue fraîche du lot **E-registre** (ADR-EC D1, régime **T2**)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte, épinglé ; préfixe `claude-opus-4-8` conforme ; `claude-opus-5` banni ; pas de tier nu), **effort `max`**. Relecteur en **instance séparée, contexte frais** — je n'ai PAS écrit ce code. **Aucun commit, aucun workflow (R-20)** ; sortie écrite pour être vérifiée adversarialement (R-21) : chaque affirmation porte sa commande rejouable.

**Gel** : `7d6d117` sur `lot/e-registre`. **Base** : `ac04d41` (= parent direct + merge-base ; vérifié `git merge-base --is-ancestor ac04d41 7d6d117` ⇒ YES ; lot = 1 commit). `lot/etude-suite` a avancé à `61b6ccb` depuis le gel. **Méthode** : lecture par SHA (`git show 7d6d117:…`, `git diff ac04d41 7d6d117`) ; copie `git archive 7d6d117` dans `F:\tmp\g2-eregistre` + `npm ci` (exit 0, 0 vuln) ; `TEMP=TMP=TMPDIR=F:/tmp` ; rien sur C:.

**Verdict : APPROUVÉ-AVEC-CORRECTIONS** — 2 corrections mineures documentaires (C-1, C-2) foldables par l'orchestrateur ; 4 items formés (O-1..O-4). Aucun défaut de code bloquant : gates 328/328, tous les mutants requis rougissent, jambes mesurées non inventées, honnêteté préservée, branchement prouvé au niveau HTML servi, gel T2 intact, fusions propres.

---

## 1. Gates — commandes + sorties chiffrées (mesurées sur `git archive 7d6d117`, base `ac04d41`)

| Gate | Commande | Mesuré | Attendu | Verdict |
|---|---|---|---|---|
| CI | `npm run ci` | **328 pass / 0 fail**, exit 0, duration 32 566 ms ; `gate:vocab OK — scanned 156 file(s), no forbidden claim` ; `tsc --noEmit` 0 err | 328/328 | ✔ |
| Lint | `npm run lint` (`eslint .`) | exit 0 | 0 | ✔ |
| Ratchet | `npm run lint:ratchet` | **69/69** (measured_on 2026-09-16) | 69/69 | ✔ |
| Langue | `node scripts/lang-gate.mjs --scope root,contracts,schemas,site` | `0 non-exempt French hit` ; `site 0 hit [GATED]` | 0, site GATED | ✔ |
| Export | `npm run export:check` | `0 forbidden path, 0 non-exempt French hit` | 0 | ✔ |
| Vocab | `npm run gate:vocab` | `scanned 156 file(s), no forbidden claim` | 0 | ✔ |
| Build | `cd apps/site && npx next build` | exit 0 ; `Compiled successfully in 3.9s` ; `Finished TypeScript in 3.8s` ; **13/13** static pages ; `/fleet` = ○ (static) | 13/13, /fleet | ✔ |

> **`next build` est requis** : le `tsconfig.json` racine (`include`) ne contient **PAS** `apps/site/**` (vérifié `git show 7d6d117:tsconfig.json` : include = packages/*, test/, apps/harness, apps/sentinel, apps/bell). `board.tsx` et `app/fleet/page.tsx` (TSX) ne sont typecheckés par **aucun** gate CI — `next build` est leur seul typecheck. Claim G1 §6 **confirmé**.

---

## 2. R-25 (par lot) + oracle D9 septies

**R-25 mon lot** — commande exacte `ci.yml:52` (nouvel ensemble d'exclusions, incl. `':(exclude,glob)docs/**/*.md'`), `ac04d41...7d6d117` :
```
git diff --shortstat "ac04d41...7d6d117" -- . ':(exclude)packages/*/docs/S2-*' ':(exclude)docs/G1-lot-*.md' \
  ':(exclude)docs/G2-lot-*.md' ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json' \
  ':(exclude,glob)fixtures/**/*.json' … ':(exclude,glob)apps/sentinel/test/fixtures/**/*.csv'
⇒ 7 files changed, 228 insertions(+), 44 deletions(-)  =  272  (< 1205)
```
Les 7 fichiers comptés : `ci.yml`, `fleet.ts`, `page.tsx`, `board.tsx`, `honesty-lint.exempt.json`, `ci-gates.test.ts`, `site-honesty.test.ts`. `docs/adr/ADR-M003…md` et `docs/G1-lot-e-registre.md` **exclus** (par `docs/**/*.md` / `docs/G1-lot-*.md`). **Attendu 272 — conforme.**

**Oracle D9 septies** (`git diff --shortstat main...<sha>` ins+del sous la gate) :

| SHA | OLD gate (S2+G1/G2+lockfile+séries, **sans** docs) | NEW gate (**+** `docs/**/*.md`) | chute |
|---|---|---|---|
| `3f69ef6` (SHA épinglé par G1/addendum) | 20 676 + 399 = **21 075** | 8 737 + 392 = **9 129** | 11 946 |
| `a3f85f4` (commit « décision 25 R-25 D9 septies ») | 20 678 + 399 = **21 077** | 8 737 + 392 = **9 129** | 11 948 |

- **NEW = 9 129 — EXACT** à `3f69ef6` **et** `a3f85f4` (docs exclus ⇒ stable). La conclusion du rule (docs dominent, ~12 k lignes chutent, l'essentiel en docs) est **reproduite**.
- **OLD** : le chiffre annoncé **21 077** (= 20 678+399) se reproduit à **`a3f85f4`**, **pas** à `3f69ef6` (qui donne **21 075**). Or l'addendum ADR-M003 D9 septies **et** G1 §7 écrivent tous deux « mesuré au SHA `3f69ef6` ». **Cause établie** (rejouable, boucle `git rev-list --reverse 3f69ef6..ac04d41`) : la valeur croît de +2 insertions **docs** entre `3f69ef6` (20 676) et `a3f85f4` (20 678) — le worker a mesuré au commit décision-25 (`a3f85f4`) mais a épinglé `3f69ef6`. **⇒ C-2** (voir §9). L'écart (2 lignes) est **entièrement docs** (NEW identique aux deux SHA) — bénin sur le fond, mais le pin de repro doit reproduire (doc 03).

**Piège glob `:(glob)` (mesuré via index temporaire, `git ls-files` — seul git qui honore `:(glob)` ; `ls-tree` le rejette : « pathspec magic not supported ») :**

| Pathspec | @ `3f69ef6` | @ `7d6d117` |
|---|---|---|
| `:(glob)docs/**/*.md` | **230** | 235 |
| bare `docs/**/*.md` | **73** (piège) | 74 |
| `:(glob)docs/**/*.mjs` | **13** (NON exclus, code compté) | 13 |
| contrôle `:(glob)fixtures/**/*.json` vs bare | 16 vs 0 | 16 vs 0 |

**230 / 73 / 13 @ 3f69ef6 — conformes à G1/addendum.** `docs/**/*.mjs` = 13 fichiers **restent comptés** (mission §6 vérifiée) : le pathspec n'exclut que `.md`. Le contrôle 16 vs 0 confirme que `:(glob)` est **obligatoire** (le bare rate le sommet).

---

## 3. E2 — jambes servies : liste, existence littérale, source **mesurée** (cartographie §2/§3), A7f/A7b

`FleetWiring.integration_test: string` → **`string[]`** ; `note: string` ajouté ; `served_by` **inchangé**. 7 slots (6 ids uniques ; `probe_harness_records_real_decision` partagé Hikae↔Ukemi — licite, ids partagés admis).

| Agent (built) | jambes `integration_test[]` | `test("<id>"` (SHA 7d6d117) | source cartographie |
|---|---|---|---|
| **Shōgen** (1) | `gate_attested_concordant_files_residual` | `apps/harness/test/gate.test.ts:761` | §2 l.61 `attest→gate` CÂBLÉ (servi) |
| **Hikae** (3) | `probe_harness_records_real_decision` | `test/h5-e2e-probe.test.ts:83` | §2 l.62 fil MCP réel (btc-dir/cascade) |
| | `probe_byo_demo_loop_closes` | `test/byo-demo-probe.test.ts:78` | §2 l.65 BYO in-proc |
| | `gate_stable_run_honesty_text_is_keyed_A2_A7f` | `apps/harness/test/gate.test.ts:528` | §2 l.66 stable-run via **`gateTool.run()`** |
| **Ukemi** (1) | `probe_harness_records_real_decision` | `test/h5-e2e-probe.test.ts:83` | §2 l.62 `cascade→gate` CÂBLÉ (servi), vacue |
| **Narabi** (2) | `narabi_live_parses_real_state_shape` | `test/narabi-live.test.ts:45` (**titre suffixé ` — `**) | §2 l.63 publié→parseur byte-exact |
| | `gate_stable_run_usde_committed_region_A7b` | `apps/harness/test/gate.test.ts:482` | §2 l.64 `fromAttestedFlow→gate` via **`runGate` direct** |

- **Mesurées, non inventées** : l'écart « 1 test nommé pour N jambes » est **exactement** l'item E2 formé par la cartographie (§4 l.107) ; les 3 jambes Hikae et les 2 jambes Narabi sont nommées ligne à ligne en §3 (l.85/l.87). Le lot **résout** cet item.
- **A7f/A7b désambiguïsés (corps de test lus, `gate.test.ts`)** : A7b (`:482`) = `adaptToPrediction(narabiFlow(…))` puis **`runGate(pred, …)` direct** ⇒ **Narabi** (niveau fonction) ; A7f (`:528`) = `HARNESS_TOOLS.find(t=>t.name==="gate").run({…}).text` = **`gateTool.run()`** = **surface servie** ⇒ **Hikae**. Assignation du worker **correcte**. (Cartographie dit « registry.run() » pour A7f ; le test appelle `gateTool.run()` — même surface servie, distinction vs `runGate` direct préservée.)
- **Garde (3)** itère la liste : `Array.isArray` + `length >= 1` + par id `/^[A-Za-z0-9_]+$/` + `declRe = /test\(\s*["']<id>(?:["']| — )/` sur le corpus des racines `WIRING_TEST_ROOTS`. Titre suffixé (`narabi_live…`) résout ✔.

---

## 4. Batterie de mutants — attendu / mesuré / restauration (sha LF re-hashé)

Mutation en place dans l'archive, `node --test <fichier>`, restauration depuis `.bak`, **puis re-hash LF-normalisé de chaque fichier touché = sha du gel** (colonne restauration).

| # | Mutant | Fichier | Attendu | Mesuré (test rouge) | Restauration |
|---|---|---|---|---|---|
| A1 | `integration_test: []` (Shōgen) | fleet.ts | rouge | ✖ `fleet_register…` (min 1) | 388b64e8 ✔ |
| A2 | `integration_test: [""]` | fleet.ts | rouge | ✖ `fleet_register…` (regex id nu) | 388b64e8 ✔ |
| A3 | `["no_such_test_xyz"]` | fleet.ts | rouge | ✖ `fleet_register…` (declRe) | 388b64e8 ✔ |
| A7 | id présent **seulement** sous `packages/*/test` (`adapter_maps_shogen_triple_to_attested_price`) | fleet.ts | rouge (exclusion racine) | ✖ `fleet_register…` | 388b64e8 ✔ |
| A6 | **id dupliqué dans une liste** | fleet.ts | (sonde survivant) | **VERT — SURVIVANT** | 388b64e8 ✔ |
| A4 | un chiffre dans `note` (Shōgen) | fleet.ts | rouge | ✖ `fleet_register…` (garde 1) **et** ✖ `site_renders…wiring.note` | 388b64e8 ✔ |
| A5 | `note: ""` (vide) | fleet.ts | rouge | ✖ `site_renders…wiring.note` (non-vide) | 388b64e8 ✔ |
| A5b | `%` dans `note` | fleet.ts | rouge | ✖ `fleet_register…` **et** ✖ `site_renders…` (`/[%\d]/`) | 388b64e8 ✔ |
| B1 | racine ajoutée à `WIRING_TEST_ROOTS` sans rationale | ci-gates.test.ts | rouge | ✖ `wiring_test_roots_exclusion_is_declared` (⇔) | 0373ad45 ✔ |
| C1 | retrait de `':(exclude,glob)docs/**/*.md'` | ci.yml | rouge (test 38) | ✖ `ci_gates_blocking…` (test 38 / 4ter) | 11eda432 ✔ |
| C2 | `docs/*.md` (sans `**`) | ci.yml | rouge (test 38) | ✖ `ci_gates_blocking…` **et** ✖ `series_pinned…` | 11eda432 ✔ |
| M11 | pathspec `:(glob)` supplémentaire **non whitelisté** (`zzz/**/*.md`) | ci.yml | rouge (M11 intact) | ✖ `series_pinned…` (direction « extra ») | 11eda432 ✔ |

Le gel porte **7** pathspecs `:(exclude,glob)` (mesuré) : 3 `apps/sentinel/test/fixtures/**` + 3 `fixtures/**` (= 6 séries) + 1 `docs/**/*.md`. `NON_SERIES_GLOB` whiteliste **exactement** le seul membre non-série (`docs/**/*.md`) ; tout autre `:(glob)` (les 6 séries doivent être dans `SERIES_EXCLUDE_PATHSPECS`, sinon « missing » ; un supplémentaire ⇒ « extra ») ⇒ **M11 intact** (mutant zzz rouge).
| D1 | suppression du rendu `{a.wiring.note}` (commentaire conservé) | page.tsx | rouge (garde 6) | ✖ `fleet_register…` (garde 6) | de4b1aea ✔ |

- **Tous les mutants requis (mission §2/§3/§4/§6/§9) rougissent.** Restauration byte-exacte confirmée par re-hash : les 7 fichiers de l'archive = sha du gel §8 après la batterie.
- **A4 double couverture** : garde (1) (scan numérique du registre, `note` poussé dans `registryStrings` si `built`) **et** `site-honesty` (`scanText` + `/[%\d]/`). A5 (vide) rougit `site-honesty` seul (la garde 1 accepte le vide).
- **Faux-vert garde (6) correctement fermé** : le régex est `/wiring\.note\s*\}/` (ferme d'expression JSX) ; D1 (retirer le rendu en gardant la prose « wiring.note » du commentaire) ⇒ **rouge** (la prose n'a pas de `}` après `note`). Le worker a auto-détecté et corrigé ce faux-vert (`/wiring\.note\b/` → `/wiring\.note\s*\}/`) — mesuré.

**Survivant A6 (id dupliqué)** ⇒ **O-1** : la garde (3) vérifie l'**existence** de chaque id, pas la **distinction** intra-liste. Aucun doublon n'existe aujourd'hui ; la spec ADR-EC E2 exige « min 1, chaque id grepé », **pas** l'unicité ; le partage inter-agents (probe_harness Hikae/Ukemi) est **voulu** — donc renforcement, pas violation de spec.

---

## 5. E3 / E6 / board / exempt.json

- **E3** (`wiring_test_roots_exclusion_is_declared`) : `WIRING_TEST_ROOTS = ["test","apps/harness/test","apps/sentinel/test"]` **⇔** `WIRING_TEST_ROOTS_RATIONALE` (deepEqual clés) ; chaque racine porte un motif non-vide et **n'est pas** `packages/*/…` ; l'exclusion `WIRING_TEST_ROOTS_EXCLUDED` (`packages/*/test`) déclarée + motivée. Garde (3) dérive son corpus de `WIRING_TEST_ROOTS` (plus de liste dupliquée). Mutant B1 rouge ✔.
- **E6** : `note` **digit-free**, **rendu sur `/fleet` pour les built seulement** (`page.tsx` : `built.filter(status==="built") … {a.wiring.note}` sous « How each built agent is served »), scanné par `site-honesty` **et** garde (1). **`served_by`/`integration_test` NON rendus** — vérifié sur le **HTML prérendu servi** `apps/site/.next/server/app/fleet.html` : `btc-dir-15m`/`stable-run-velocity-24h`/`cascade-liquidable-24h` ⇒ **0** ; `served_by`/`integration_test` (littéraux) ⇒ **0** ; les 6 ids de test ⇒ **0** ; les 4 notes + l'en-tête ⇒ **présents (1 chacun)**. (Le « MCP gate » ×1 dans fleet.html provient de la **note** Shōgen rendue « served through the MCP gate… » — digit-free, voulue — **pas** de `served_by` ; tracé et clos.) Tripwire (4) `wiringIdent = /\b(?:served_by|integration_test)\b/` levé **pour `note` seul** (jamais dans le régex) — vérifié : `page.tsx` ne référence ni `served_by` ni `integration_test`.
- **Garde (6) « consommation »** : prouve **exactement** que le **source** `page.tsx` contient le littéral `wiring.note}` (ferme JSX). C'est un **proxy textuel faible** : false-RED possible sur un rendu ternaire `{a.wiring.note ? X : null}`, false-GREEN possible sur `{false && a.wiring.note}`. Le rendu réel est **inconditionnel** (`.map(a => …{a.wiring.note})`) et la **preuve de consommation forte** est le HTML prérendu (4 notes présentes). ⇒ **O-2** (préférer une assertion sur la sortie HTML).
- **board.tsx (C-11 vi)** : couche `02 · acts · execute (upcoming)` ; `pipe` = « feeds the gate (cascade → gate), not execute » affiché **si** `n.status === "built"`. Ukemi = `role:"act"`, `status:"built"` (**seul act built** ; `ACTS = NODES.filter(role==="act")`). **Vrai selon la cartographie** : §2 l.62 `cascade→gate` CÂBLÉ (servi) ; §3 l.97 la couche « acts (execute) » n'est servie par aucun outil (D0 no-trade) ⇒ act = upcoming. Aucun chiffre (`gate_sim_rendered_labels_have_no_numeric_hole` vert) ; vocab OK. **Servi** dans `…/app/index.html` (page d'accueil) — pipe présent, C-11 vi **branché**.
- **`honesty-lint.exempt.json`** : **seul le `context` du jeton `02` change** (`'02 · acts · execute'` → `'02 · acts · execute (upcoming)'`) pour refléter le nouveau texte board ; **aucun nouveau jeton numérique**. Exemption **FERMÉE** — phrase exacte du `$comment` : « *CLOSED, committed exemption list for the test-44 honesty lint (root test/site-honesty.test.ts, ADR-M004 D11)* » ; garde d'inertie `honesty_exempt_entries_have_rendered_carrier` (rougit toute entrée sans porteur rendu / tout chiffre nu) — verte, le porteur « 02 » reste rendu (board + page).

---

## 6. T2 / CA-11 (gel)

- `builtCount === 4`, `upcomingCount === 12` (7 agents + 5 produits) — assertions `ci-gates.test.ts:616-617`, vertes. `package.json.description` = « fleet: **4** agents built, **7** on the roadmap » (l.626 assertée).
- **Aucun `upcoming` promu** : built = {Shōgen, Hikae, Ukemi, Narabi} exact. Union discriminée **vérifiée dans le corps de type** (`fleet.ts@7d6d117`) : `BuiltFleetAgent` (l.64, `wiring: FleetWiring` requis), `UpcomingFleetAgent` (l.70) avec `wiring?: never` (l.72), `FleetAgent = BuiltFleetAgent | UpcomingFleetAgent` (l.77) ⇒ `wiring` sur un `upcoming` = erreur TS (preuve : `npm run typecheck` vert dans `npm run ci`).
- **Freeze re-pin** : `fleet_register_built_set_is_frozen` **n'a pas de fichier gelé séparé** — **le test EST le pin** ; le re-pin = le test passe avec la nouvelle forme `integration_test: string[]` + `note` + garde (6). Le gel se lit dans les sha du gel §8 : `fleet.ts 388b64e8…`, `ci-gates.test.ts 0373ad45…`.
- **Message de commit** : `7d6d117` = « **site[T2]** e-registre: … » — préfixe régime T2 conforme (ADR-M013).

---

## 7. Fusion (merge-tree) — mesures

| Paire | Résultat |
|---|---|
| `lot/etude-suite` (61b6ccb) + `lot/e-registre` | **exit 0, 0 conflit** (arbre `1dbf087…`) |
| `lot/e-registre` + `lot/e-honnetete` | **exit 0, 0 conflit** ; **fichiers partagés = ∅** (`comm -12` vide) — e-registre ne touche ni `README.md` ni `scripts/lang-gate.mjs` ⇒ **disjoints trivialement** |
| `lot/e-registre` + `lot/t-1a-ii-a` | **exit 0, 0 conflit** |

- **`lot/t-1a-ii-a` est ANCÊTRE de `ac04d41`** (déjà dans la base d'e-registre ; vérifié). Il **ne touche PAS** `test/ci-gates.test.ts` (diff vide). `SERIES_EXCLUDED_ROOTS` = `["fixtures","apps/sentinel/test/fixtures"]` (inchangé, **pas** `apps/bell` — item futur checkpoint-2 T-1a, ADR-M003 D9 sexies). E-registre ne modifie **pas** `SERIES_EXCLUDED_ROOTS` (il n'ajoute que `NON_SERIES_GLOB` et la clause « extra » ligne ~1120) ⇒ **hunks disjoints, zéro overlap**. Le merge propre contre `etude-suite` (qui contient t-1a-ii-a) est la preuve dispositive.
- `lot/e-honnetete` n'est PAS encore dans `etude-suite` mais ses 12 fichiers (README, shogen-panel, fleet-presentation, lang-gate.mjs, ADR-M009/M018, index.ts, DEMO/SKILL, 2 tests) sont **disjoints** des 9 d'e-registre.

---

## 8. sha256 (blob = LF) des 8 fichiers @ `7d6d117` — conformité au tableau G1 §2

| Fichier | sha256[..16] | G1 §2 |
|---|---|---|
| `apps/site/lib/fleet.ts` | `388b64e87e8d1fcc` | ✔ |
| `test/ci-gates.test.ts` | `0373ad45667df47c` | ✔ |
| `test/site-honesty.test.ts` | `ffa6f5157fbbdf96` | ✔ |
| `apps/site/app/fleet/page.tsx` | `de4b1aea652a9492` | ✔ |
| `apps/site/components/gate-sim/board.tsx` | `d154c3c275c00c43` | ✔ |
| `apps/site/test/honesty-lint.exempt.json` | `6442843d06157c64` | ✔ |
| `.github/workflows/ci.yml` | `11eda432e89db7fc` | ✔ |
| `docs/adr/ADR-M003-phase2-integration.md` | `37b4bd392dd33183` | ✔ |

Les 8 sha du G1 §2 **reproduits**. Le rapport G1 est **fidèle** aux mesures (jambes, ids, lignes, oracle 230/73/13, R-25=272, mutants) — à l'exception du pin oracle (C-2) et de l'imputation d'`error_origin` (O-4), signalés ci-dessous.

---

## 9. Corrections (C-n) et items formés (O-n)

### C-1 — commentaires obsolètes en DEUX endroits (traçabilité au point du code)
- **Fichier:ligne (a)** : `.github/workflows/ci.yml` bloc de commentaire ~46-51 (au-dessus de la ligne 52). Il énumère « Exclusions (ADR-M003 D9 + D9 quater + D9 sexies) : … S2 … G1/G2 … lockfile … DATA SERIES » ; il **omet D9 septies / `docs/**/*.md`** alors que le pathspec est ajouté ligne 52 dans le **même** commit. Un lecteur du seul `ci.yml` ne sait pas que **tous** les `docs/**/*.md` sont désormais exclus.
- **Fichier:ligne (b)** : `test/ci-gates.test.ts` commentaire-doc de `series_pinned` ~1064-1074. Il décrit encore le ⇔ comme « **SET EQUALITY** between the `:(glob)` … pathspecs … and … `SERIES_EXCLUDED_ROOTS x exts` — neither a dropped nor an extra pathspec » et « **M11 a 7th pathspec in ci.yml => red** », **sans** mentionner le carve-out `NON_SERIES_GLOB` ajouté par ce lot. Après E-registre le ⇔ est « set equality **moins la whitelist** », et le 7ᵉ pathspec (`docs/**/*.md`) est précisément le membre **whitelisté légitime** (vert) — le commentaire est donc trompeur (« M11 » devrait lire « un 7ᵉ pathspec `:(glob)` **non-whitelisté** ⇒ rouge »). Le seul ajout du lot dans cette zone est le commentaire inline `NON_SERIES_GLOB` (3 lignes) dans le corps du test.
- **Correction** : (a) étendre le commentaire `ci.yml` pour citer **D9 septies** / `docs/**/*.md` (code/tests/schémas/scripts + `docs/**/*.mjs` restent comptés) ; (b) mettre à jour le commentaire-doc `series_pinned` pour dire « set equality **moins `NON_SERIES_GLOB`** » et reformuler M11 en « 7ᵉ pathspec `:(glob)` **non-whitelisté** ⇒ rouge ».
- **`error_origin`** : worker (omissions dans l'édition qui ajoute le pathspec + la whitelist). Foldable, doc-only.

### C-2 — pin de reproductibilité de l'oracle D9 septies incorrect (doc 03)
- **Fichier:ligne** : `docs/adr/ADR-M003-phase2-integration.md` (addendum D9 septies) **et** `docs/G1-lot-e-registre.md` §7 — « Oracle before/after … **mesuré au SHA `3f69ef6`** … avant = 20 678 + 399 = **21 077** ».
- **Preuve (rejouable)** : `git diff --shortstat main...3f69ef6 -- . <excludes OLD>` ⇒ 20 676 + 399 = **21 075**, **pas** 21 077. Le 21 077 (20 678+399) se reproduit à **`a3f85f4`** (« Decisions 21-25 … R-25 D9 septies »). Boucle `for c in $(git rev-list --reverse 3f69ef6..ac04d41)` : la valeur passe de 20 676 (`3f69ef6`) → 20 678 (`a3f85f4`), +2 lignes **docs**. NEW = **9 129** aux deux SHA (docs exclus ⇒ stable).
- **Correction** : ré-épingler l'oracle OLD=21 077 à **`a3f85f4`**, ou restater OLD=**21 075** à `3f69ef6`. (La conclusion — docs dominent, chute ~11,9 k, NEW=9 129 — est **saine et exacte** ; seul le pin de la valeur « avant » ne reproduit pas.)
- **`error_origin`** : worker (a épinglé le mauvais SHA pour **son** chiffre, G1 §7). **Option de scission offerte au G7 (non tranchée par la revue)** : le même mauvais pin est **committé dans `ADR-M003` par l'orchestrateur** (`7d6d117` est son commit) ⇒ split possible « worker (G1) + orchestrateur (propagation dans l'ADR sans re-jouer le pin) ». Magnitude 2 lignes (docs), mais un pin cité doit reproduire (doc 03).

### O-1 — garde (3) : unicité intra-liste non enforced (mutant A6 survivant)
Dupliquer un id dans la liste d'un agent passe (existence vérifiée, pas la distinction). Aucun doublon actuel ; spec E2 = « min 1 + grepé » (pas distinct) ; partage inter-agents voulu. **Déclencheur** : prochain lot touchant `apps/site/lib/fleet.ts` ⇒ ajouter `assert.equal(new Set(list).size, list.length)` par agent. Renforcement, non bloquant.

### O-2 — garde (6) : proxy textuel de consommation faible
`/wiring\.note\s*\}/` sur le source ≠ preuve de rendu servi (false-RED sur ternaire, false-GREEN sur `{false && …}`). La preuve **forte** est le grep du HTML prérendu (fait ici et en G1 §9). **Déclencheur** : prochain lot `apps/site` ⇒ assertion sur la sortie `next build` (HTML) plutôt que le régex source. Non bloquant (rendu réel inconditionnel, consommation prouvée).

### O-3 — « rendu par le designer » : déviation déclarée à confirmer
ADR-EC D1 (E6) : la note « rendu **par le designer** (W1 (b)) ». Le worker a rendu **lui-même** (liste `<ul>` texte seul), déclarant que la mission supersède (G1 §9 : shogen-panel interdit, aucun composant nouveau). Le rendu est honnête/testé/branché ; la déviation est **déclarée, non cachée**. **Déclencheur** : l'orchestrateur confirme la supersession contre la **mission réelle** du worker (que je ne vois pas) avant G7. Gouvernance, non défaut de code.

### O-4 — `error_origin` de D9 septies à trancher au G7
G1 §10 signale : l'addendum porte `error_origin = orchestrateur`, mais D9 septies est une **décision de politique (25)**, pas la correction d'un oubli — **pas d'erreur à imputer**. Le worker **défère au G7** (AgileGates : `error_origin` assigné au G7). **Item porté**, non tranché par la revue — à adjuger par l'orchestrateur au G7.

---

## 10. Verdict

**APPROUVÉ-AVEC-CORRECTIONS.**

Substance **saine** : 328/328 ; lint/ratchet 69/69/lang/export/vocab verts ; `next build` 13/13 + `/fleet` rend les 4 notes (HTML servi) ; R-25 lot = 272 ; oracle NEW=9 129 exact, glob 230/73/13 exacts, `.mjs` comptés ; les 7 jambes existent littéralement et sont **mesurées** (cartographie §2/§3), A7f/A7b corrects ; tous les mutants requis rougissent (restauration byte-exacte re-hashée) ; `served_by`/`integration_test` jamais rendus (HTML) ; gel T2 intact (built 4 / upcoming 12, aucun promu, `site[T2]`) ; fusions propres (e-honnetete disjoint, t-1a-ii-a ancêtre) ; sha256 G1 §2 conformes.

À corriger avant clôture (foldable, doc-only, `error_origin` worker) : **C-1** (commentaire `ci.yml` cite D9 septies), **C-2** (repin oracle 21 077 → `a3f85f4`, ou restater 21 075 @ `3f69ef6`). Items formés à déclencheur : **O-1** (unicité garde 3), **O-2** (consommation garde 6 sur HTML), **O-3** (confirmer supersession « designer »), **O-4** (`error_origin` D9 septies au G7).

Aucune dette nue, aucun chiffre de seconde main, aucun `[2nd]`, aucune procurement requise (tout interne, mesuré). Vérification adversariale (R-21) : chaque chiffre porte sa commande.

---

## 11. Provenance
Revue G2 fraîche générée le **2026-09-19** par relecteur `claude-opus-4-8[1m]` effort `max`, **instance séparée / contexte frais** (n'a pas écrit le code), worktree de lecture `F:\tmp\g2-eregistre` (archive `7d6d117`, `npm ci` exit 0), dépôt `F:\Monark`. Advisor intégré consulté avant rédaction (cause du Δ2 oracle, item `error_origin` déféré, trace « MCP gate », tsconfig, restauration sha) — avis suivi. **R-20 : aucun commit, aucun workflow.** Livrable écrit non committé (l'orchestrateur committe, R-20). Lecture préalable par SHA : ADR-EC (D1/Tuyaux/MAST/C-11/P2), CHECKPOINT1-ADR-EC (C-3/C-5/P2), G1-lot-e-registre, ADR-M018 (via ADR-EC), ADR-W1 (via ADR-EC/G1), ADR-M013 (T2), ADR-M003 (D9 sexies/septies), CARTOGRAPHIE-P1-2026-09-19 §1-§4.
