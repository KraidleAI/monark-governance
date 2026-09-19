# G1 — lot E-bon-marché (ADR-M018 D4 : écart corrigé avant toute nouvelle pièce)

> Journal de provenance (G1). Modèle résolu **`claude-opus-4-8[1m]`** (Opus 4.8 1M, épinglé effort max ;
> `claude-opus-5` banni ; pas de tier nu). Date **2026-09-19**. Worktree **`F:\Monark-wt-ecart`**, branche
> `lot/e-bon-marche`, base HEAD **`16ec12a`**. Worker implémenteur, **aucun commit ni `git` en écriture (R-20)** —
> l'orchestrateur committe. Réviseur : à assigner (G2 contexte frais ≠ générateur). Chaque assertion porte
> `fichier:ligne` ou une commande rejouable (R-21). Trois sous-parties indépendantes, chacune test + mutant.

## Portée : les trois écarts (cartographie P1 §4, reco G7)

| # | Écart mesuré (avant) | Correction (après) |
|---|---|---|
| E5 | Aucune hygiène de dépendances : un import `@monark/*` non déclaré passe par hoisting workspace (typecheck+test verts). Trois paquets **déjà** non déclarés au baseline : `@monark/hikae`, `@monark/ukemi`, `@monark/atelier` importent `@monark/contracts` (imports valeur) sans le déclarer. | Test racine zéro-dépendance + déclaration honnête des trois arêtes ; lockfile aligné. |
| E9 | La classe **numérique** servie `cascade-liquidable-24h` sous `under_calib` portait `label_schema:"up\|down"` (octet inerte — labels vides — mais malhonnête : schéma directionnel sur une classe numérique). | Toute voie `under_calib` numérique porte `NUMERIC_LABEL_SCHEMA = "numeric"` ; le défaut `BTC_DIR_LABEL_SCHEMA` reste pour les classes directionnelles. |
| E10 | Snapshot Narabi committé en retard : capture T=0 du 2026-09-18 (une fenêtre `2026-09-17`), alors que le live est à T=1. | Re-capture depuis les fichiers publiés (GET lecture seule), re-sha byte-exact, provenance datée. |

---

## E9 — région servie sur classe numérique (plus petit changement honnête)

**Frontière de contrat (gelée, zéro octet touché).** `schemas/coverage-verdict.schema.json` : la région `set`
**exige** `label_schema` non vide (`minLength:1`) ; il n'existe pas de région « vide sans `label_schema` » ni de
troisième variante. Donc la piste « région vide **sans** `label_schema` » **exige** un changement de contrat →
**écartée** (contrainte : zéro octet dans `schemas/` et `packages/contracts` ; mesuré `git diff --stat` = ces
chemins absents). Piste retenue : `label_schema` **propre à la classe** (numérique). **`packages/contracts` et
`schemas/` inchangés.**

**Cause (fonction + ligne, arbre courant).** `packages/hikae/src/verdict.ts:77` : `buildSetRegion([],
params.labelSchema ?? BTC_DIR_LABEL_SCHEMA)` — le défaut est directionnel (`verdict.ts` **non touché**). Les voies
numériques ne passaient pas de `labelSchema` : le conformeur régression `interval-conformer.ts` fonction `underCalib`
(sert la classe numérique `cascade-liquidable-24h` committée via `gate.ts` `cascadeVerdict`→`conformInterval`, et
stable-run non-committé via `stableRunVerdict`→`conformInterval`) ; `gate.ts` ternaire BYO `interval` (`:314`, ex-`undefined`) ;
`gate.ts` `stableRunVerdict` (split trop court / NDG-1).

**Correction (minimale ; `verdict.ts` NON touché — le défaut y reste intact).**
- `packages/hikae/src/region.ts` : ajout `export const NUMERIC_LABEL_SCHEMA = "numeric"` (7 car., même largeur que
  `up|down`) + JSDoc portant le résidu (le défaut reste directionnel ; chaque appelant numérique passe cette constante).
- `packages/hikae/src/index.ts` : ré-export de la constante.
- `interval-conformer.ts` fonction `underCalib` (ligne `71`) : passe `labelSchema: NUMERIC_LABEL_SCHEMA`.
- `gate.ts:314` : ternaire `interval` → `NUMERIC_LABEL_SCHEMA` (non plus `undefined`) ; la diffusion conditionnelle
  (`byoVerdict` split under_calib) devient `labelSchema,` (sinon `labelSchema` se rétrécit en `string` →
  `no-unnecessary-condition` ferait bouger le ratchet 69/69) ; `byoVerdict` branche `interval` NDG (`:346`) et les deux
  `stableRunVerdict` (`:472`,`:481`) passent la constante. `btcDirVerdict` et `s2/instrument.ts:414` (directionnels)
  **non touchés** — défaut `up|down` correct.

**Test** `apps/harness/test/gate.test.ts` `numeric_under_calib_region_is_not_directional` : énumère **toute** voie
numérique servie (numérique committé ; stable-run non-committé ; stable-run clé USDe `nMin` > n committé ; BYO
`interval` p>n ; BYO `interval` NDG q̂=0) → chaque région `deepEqual { kind:"set", labels:[], label_schema:"numeric" }` ;
**contrôle positif** : `btc-dir-15m` sous `under_calib` reste `up|down` (défaut intact).

**Mutant** : suppression de la ligne `labelSchema: NUMERIC_LABEL_SCHEMA` (`interval-conformer.ts` `underCalib`, ligne 71) →
`npm run typecheck` **vert** (exit 0 — le défaut masque, comme le hoisting masque m1) ; test **rouge** (cas numérique
committé : `region must be the empty set with a numeric label_schema`). Restauré byte-exact.
`sha256(interval-conformer.ts)` avant = après = `cb6ed928c7268d9e7c78d0a5a8fbc7a8754d1645f50a7c3000ca099c1bc8b6d1`.

**Re-pin h5 (diff ciblé).** Régénéré, jamais édité à la main : `node scripts/record-h5-e2e-trace.mjs`.
`git diff fixtures/h5-e2e-trace.json` = **une ligne** (ligne 179, l'étape numérique→gate) :
`"label_schema": "up|down"` → `"label_schema": "numeric"`. Ligne 252 (`btc-dir`, directionnel) **inchangée**.
Fichier **15731 octets inchangés** (7 car. = 7 car.). `TRACE_SHA256_PINNED` (`test/h5-e2e-probe.test.ts:60`) et
`fixtures/PROVENANCE-h5-e2e-trace.md` : `9cf2f8b23b2c17a7358ca3be27b08fd54378978ec74ae1fd1147573f9179e5dd`
→ **`9b5457d9e8081fb8cdbe4ec7fcc3b6ce27fb1d34a0451989f66858567287b4ff`** (LF). Probe
`probe_harness_records_real_decision` : vert (re-drive live == committé). Le `response_sha256` de l'étape `tools/list` (octets de DESCRIPTION du `gate`, ligne 70 de la trace) est **inchangé** ⇒ aucune mise à jour de description skill/DEMO due par ce lot ; `skills/` et `README.md` ne portent aucun `up|down` sur la classe numérique (grep).

**ADR-M019 D2 (vacuité) — inchangée en propriété, digest en valeur.** `node docs/cartographie-p1/vacuity-replay.mjs`
→ `VACUITY_CONFIRMED=true`, 1 digest distinct, byte-identique sur `yhat ∈ {100, 999999, −5}`, `n_calib=0`,
`region_label_schema=numeric`. La **valeur** du digest de décision bouge (les octets de région entrent dans la
sérialisation canonique) : `fd1203e9…` → `14773773…`. Ce digest n'est **épinglé dans aucun test** (grep : seule la
cartographie datée `docs/CARTOGRAPHIE-P1-2026-09-19.md` le cite — artefact historique, non réécrit).

**Note d'alternative (assumée).** Rendre `labelSchema` **requis** sur `underCalibVerdict` (tuer le défaut silencieux)
a été considéré puis écarté : le libellé du mutant (« défaut réintroduit ⇒ rouge ») présuppose un défaut à
réintroduire, et l'analogie m1 (« vert par hoisting ») veut que le **test** soit le garde, pas le compilateur — le
requis ferait de la suppression de ligne une erreur de typecheck, pas un test rouge. Résidu déclaré : le défaut reste
directionnel ; le test garde les voies numériques **énumérées** (pas « toute région numérique up|down » dans l'absolu).

---

## E5 — hygiène de dépendances (option (a) de R1 ; aucune dépendance registre → R-8 libre)

**Baseline mesuré (fichier:ligne).** `@monark/*` importés sous `src/` vs `dependencies` déclarées : `hikae/src`
(`region.ts:14`, `verdict.ts:19` valeur `calibDigest`/`serializeVerdict`, …), `ukemi/src` (`prediction.ts:11` valeur
`serializePrediction`), `atelier/src` (`state.ts:7` valeur `assertClosedGateDecision`) importent tous
`@monark/contracts` avec `dependencies: {}` → **trois arêtes hoistées non déclarées**. `monark` déclarait déjà
exactement son import (b3), `harness`/`sentinel` complets.

**Correction honnête (fait avant nouvelle pièce).** Déclaration de l'arête déjà importée : `"@monark/contracts": "*"`
(convention `packages/monark`) dans `packages/{hikae,ukemi,atelier}/package.json` — **pas** un paquet registre nouveau
(workspace déjà présent ; R-8 sans objet). Lockfile aligné par `npm install --package-lock-only --ignore-scripts`
(node_modules **non** touché) : diff = **les trois** entrées `packages/*` gagnent `dependencies:{@monark/contracts}`,
**idempotent** (2ᵉ passe = diff vide ⇒ en phase avec `npm ci`). La description d'`atelier` « Zero runtime dependency » (contradiction avec l'arête déclarée) est corrigée « No third-party runtime dependency (the workspace @monark/contracts binding aside) » — un sibling workspace, pas un paquet tiers.

**Test** `test/deps-hygiene.test.ts` `deps_hygiene_monark_imports_are_declared` : pour chaque workspace, l'ensemble
des `@monark/*` importés sous `src/` (extracteurs regex mirroir de `docs/cartographie-p1/import-graph.mjs` ; imports
**type** comptés — ils sont dans le graphe `tsc` ; sous-chemins réduits au paquet ; self exclu ; `.d.ts` exclu) ⊆
`dependencies`. Garde de non-vacuité (`checkedImports > 0`). Aucun plugin eslint (R-8 : `eslint-plugin-import`/`knip`
absents).

**Mutant m1** : ré-import `@monark/ukemi` dans `packages/monark/src/index.ts` (b3 avait retiré cette arête), sans le
déclarer → `npm run typecheck` **vert** (exit 0, hoisting) ; test **rouge** (`@monark/monark: imports @monark/ukemi
under src/ but does not declare it`). Restauré byte-exact. `sha256(monark/src/index.ts)` avant = après =
`63033eeb22d549ed089465a5263483e959f7d91bff8fb975f38eb85c03839675`.

---

## E10 — snapshot Narabi re-capturé (T=0 → série T=1)

**Consistance contrôlée AVANT re-pin (lecture seule).** `curl -sS` sur `https://monarkgate.tech/narabi/{state.json,
timeline.jsonl}` (HTTP 200 ; 398 + 2719 octets ; aucun CRLF). 16 contrôles verts via les modules du worktree :
`parseState`/`parseTimeline` acceptent les octets ; `state.projected_bound_leq_target_T` (1789) ==
`projectedBoundT(DELTA_TARGET)` du sentinel ; `c === B` ; `params` == `TRACKER_PARAMS` ; `boundThm1(T)≤target<boundThm1(T-1)`.
Aucune incohérence ⇒ pas d'arrêt/item (la voie « ARRÊTE et déclare » n'a pas eu à jouer).

**Correction.** `apps/site/lib/narabi-snapshot.ts` régénéré depuis les octets bruts (`JSON.stringify`, format existant) :
`capturedAt "2026-09-18"→"2026-09-19"`, `stateJson`/`timelineJsonl` = live T=1 (`t:1`, `q:-0.004035…`,
`digest 9b5f89fd…`, timeline = genèse `2026-09-17` + fenêtre `2026-09-18` chaînée), en-tête (provenance) daté.
`stateSha256` = **`86c33c4251bef4b307688c7b8386d74137136cf7ba2d91687ee42ad06e06b96b`** ; `timelineSha256` =
**`4b17d0b812e47e34a8d0d9fed47c153a8b471e6e53787b55bc4c574a6de0ea5b`** (sha de la chaîne embarquée == sha du fichier
publié, recalculé node ET `sha256sum`). `test/narabi-live.test.ts` : `STATE_SHA`/`TIMELINE_SHA` mis à jour.

**Provenance.** Pas de fichier PROVENANCE séparé (grep) : la provenance est l'en-tête de `narabi-snapshot.ts` (date +
source + sha recalculable), mis à jour. Anciens sha `7abd7ab4…`/`1803f512…` subsistent uniquement dans des docs datés
historiques (F-site-10, JOURNAL, RAPPORT M014) — non réécrits.

**Test/mutant** `narabi_live_parses_real_state_shape` (byte-exact + forme réelle) : les 6 tests Narabi verts sur la
série T=1. Mutant : flip d'un octet de `narabi-snapshot.ts` `stateJson` → assertion sha **rouge** (`state.json bytes
must match the published file`). Restauré byte-exact. `sha256(narabi-snapshot.ts)` avant = après =
`943a8596109c438a5ea6b116e0aaaad97e2b1bfb32252d4de4278ea25ac67ec5 (LF ; le G1 initial portait un digest non reproductible, corrigé à la G2 C1)`.

**Item formé (déclencheur nommé, jamais un « dû » nu).** Cadence de re-capture du snapshot Narabi : **déclencheur =
chaque lot touchant `apps/site`** (aligne la capture committée sur la série live publiée). Propriétaire : orchestrateur.
Non une dette nue — item formé au sens ADR-M018 D3 / règle Dettes.

---

## Oracle (rejouable ; arbre `F:\Monark-wt-ecart`)

| Étape | Commande | Résultat |
|---|---|---|
| ci (gate:vocab+typecheck+test) | `npm run ci` | **291/291**, 0 fail (baseline 289 + E9 + E5) |
| lint | `npm run lint` | 0 |
| ratchet | `npm run lint:ratchet` | **69/69** (inchangé — les tests n'ajoutent pas de dette de typage différé) |
| export:check | `npm run export:check` | 0 chemin interdit, 0 hit langue |
| lang-gate | `node scripts/lang-gate.mjs --scope root,contracts` | 0 hit |
| typecheck | `tsc --noEmit` (dans ci) | 0 |
| build site | `npm run build -w apps/site` | compiled successfully, 13 pages statiques |
| vacuité D2 | `node docs/cartographie-p1/vacuity-replay.mjs` | `VACUITY_CONFIRMED=true` |

**R-25** : ~**258 lignes** hors fixture (154 fichiers suivis + 104 `test/deps-hygiene.test.ts` neuf ; lockfile 12 lignes
générées à part ; trace h5 = **1 ligne** fixture, exempte ; ce G1 = rapport de gouvernance, exclu du décompte). < 400. PR unitaires.

**Interdits respectés** : aucun octet dans `schemas/` ni `packages/contracts` ; aucun commit / `git` écriture (R-20).

## Dettes à la clôture — zéro « dû » nu

- **E5, E9** : aucun résidu ouvert (corrigés + test + mutant + oracle vert).
- **E9 résidu** (défaut directionnel conservé pour les classes non numériques) : **déclaré**, gardé par le test des
  voies numériques énumérées — pas une dette (choix « plus petit changement honnête »).
- **E10** : un **item formé** (cadence de re-capture, déclencheur = lot `apps/site`, propriétaire orchestrateur).

*(sha256 de ce fichier : émis dans le retour worker à l'orchestrateur post-écriture — un fichier ne contient pas son propre digest.)*
