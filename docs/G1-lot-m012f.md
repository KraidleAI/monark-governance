# G1 — Génération tracée, Lot M012-f (source unique de version du harnais MCP)

- **Générateur** : worker **Opus 4.8** — modèle résolu `claude-opus-4-8[1m]` (R-1 déclaré à la première
  prise de parole ; préfixe `claude-opus-4-8` conforme), effort `max`. Le worker ne committe pas (R-20) ;
  seul l'orchestrateur committe. Date : **2026-09-18**. HEAD de départ : `2e5b4bf`.
- **Réviseur** : revue G2 fraîche (instance séparée ≠ générateur) + vérification adversariale orchestrateur
  (R-21) — à faire avant consommation.
- **Spec / décision de rattachement** :
  - **Défaut mesuré (2026-09-18, sonde `initialize` sur `https://mcp.monarkgate.tech/mcp`)** :
    `serverInfo = {name:"monark", version:"1.0.0"}`, littéral en dur `apps/harness/src/server.ts:91`.
  - Contradit la doctrine **« never a version one »** et **ADR-M010 §2.3/§2.4** (« `1.0.0` is a human
    decision, never an agent's ; version source of truth = the git tag »).
  - **JOURNAL-PROVENANCE** 2026-09-17 (registre MCP `1.0.0` retiré : « misaligned version number, never a
    release », `error_origin = lot M006 ») ; 2026-09-18 (`v0.4.0` publié ; registre MCP
    `tech.monarkgate/monark` = `0.4.0 active isLatest=true`). La version annoncée suit **le tag public**,
    jamais `package.json`.
  - `error_origin` (mesuré) du littéral in-server : introduit à la création des surfaces harnais —
    `server.ts` au **Lot H1** (`047ad14`), `openapi.ts` (`OPENAPI_INFO_VERSION`) au **Lot H4** (`f1469ed`) ;
    jamais réaligné quand ADR-M010 (tag = source) et le registre `0.3.0/0.4.0` ont bougé. Assignation finale
    au G7 (orchestrateur).
  - **Extension de périmètre (course-correction orchestrateur, 2026-09-18)** : les deux traces committées
    re-pinnées (voir §Traces).

## Changement

1. **Source unique** : nouveau module `apps/harness/src/version.ts` exportant
   `export const HARNESS_VERSION = "0.4.0"` (alignée sur le tag public `v0.4.0` + l'entrée registre MCP
   `0.4.0` du 2026-09-18 ; bump = même commit que le tag). Commentaire d'en-tête : MAJOR reste 0 par doctrine
   (ADR-M010 §2.3) ; distinction explicite d'avec `@monark/hikae` `HARNESS_VERSION = "fixtures-synth"`
   (provenance de calibration, autre domaine — cf. Déviation D2).
2. **Câblage** : `server.ts:91` `version: HARNESS_VERSION` (import ajouté) ; `openapi.ts:25`
   `OPENAPI_INFO_VERSION = HARNESS_VERSION` (dérivée de la source unique, plus de second littéral).
   `OPENAPI_VERSION = "3.1.0"` (dialecte OpenAPI) et `SCHEMA_VERSION = "1.0.0"` (contrat de prédiction gelé,
   `tools/gate.ts`) sont d'AUTRES domaines et **inchangés**. `http.ts` n'expose aucune version (dérive via
   `buildOpenApi`). Grep de contrôle `serverInfo` / `"version":"1.0.0"` sur `skills/`, `README.md`,
   `apps/harness/README.md`, `apps/site` : **0 autre surface de version SERVEUR** — les 4 hits sont le
   `schema_version` de prédiction gelé (contrat K-1 ; « the server speaks one version »), correctement non
   touché ; le versioning skill ClawHub `1.0.x` est indépendant (JOURNAL 244).
3. **Test** (`apps/harness/test/server.test.ts`, `serverInfo_version_is_single_source_and_never_one`) :
   (a) garde doctrinale `!HARNESS_VERSION.startsWith("1.")` + `match(/^0\.\d+\.\d+$/)` (message ADR-M010
   §2.3) ; (b) `buildOpenApi().info.version === HARNESS_VERSION` ; (c) invariant ADR-M010 §2.4 —
   `apps/harness/package.json` reste `version "0.0.0"` + `private:true`, découplé (`HARNESS_VERSION !==
   pkg.version`) — lu via `readFileSync` (pas `require`, ESM) sur le SEUL package.json du harnais (aucun import
   hors workspace harnais) ; (d) **filaire** : sonde `initialize` rejouée sur la surface `mcp.`
   (`startServer(0)` + `wiredPost`), `serverInfo.version === HARNESS_VERSION`. C'est la reproduction exacte de
   la sonde qui a mesuré le défaut.

## Traces committées re-pinnées (recette officielle, jamais à la main)

Le bump `serverInfo.version` fait dériver l'étape `initialize` des deux traces enregistrées. Régénérées par
leur recorder officiel (`node scripts/record-h5-e2e-trace.mjs` / `node scripts/record-byo-demo.mjs`) ; pins
`TRACE_SHA256_PINNED` + fichiers PROVENANCE mis à jour. **Diff vérifié : une SEULE ligne change par trace —
`serverInfo.version` `"1.0.0" → "0.4.0"`** (swap 5 car. pour 5 car. ⇒ longueur inchangée ; `clientInfo.version`
et tout digest de décision byte-identiques).

| Trace | sha256(LF) avant | sha256(LF) après | octets |
| --- | --- | --- | --- |
| `fixtures/h5-e2e-trace.json` | `94af6409267cb98bc9ff26da5e3a9a7e18653f9787ee8d7f3402ebc7b98acdee` | `b429a2414b1a719d05a4e6789a3d22bb08cc64350c17d2bcb5060b6fb70d3654` | 15731 (inchangé) |
| `fixtures/byo-demo-trace.json` | `60f348689cc75db4978c04ec0e4a232c90fcf277720785fc6fabf27ad20c6ce3` | `daf8d3eabacbc601e608d01936d02c0f7ba78dfb5a0d6f5741ecea5fb4eef6d2` | 9735 (inchangé) |

(sha « avant » = version committée à HEAD `2e5b4bf`, reproductible par `git show HEAD:<trace> | sha256sum` ;
« après » = valeur imprimée par le recorder, égale au pin `TRACE_SHA256_PINNED` du test de sonde.)

## sha256 des fichiers livrés (working tree, `sha256sum` brut)

| Fichier | sha256 |
| --- | --- |
| `apps/harness/src/version.ts` (nouveau) | `56c8cf039e6a40cdf159e37bc4382b92ed61a20335d0cd990d837c96d3dd0f86` |
| `apps/harness/src/server.ts` | `f4ecf4e0eea2e8f1c024ba7f687a577de4b1a73193db28087dd0956943b3c114` |
| `apps/harness/src/openapi.ts` | `d3819890c25ff0d1e2fad496103b67c0b069c04fb1df7041d31d275d0ac75418` |
| `apps/harness/test/server.test.ts` | `b41689cec6717878392bfdce26d56ca3f337ff567b7989e88cca3de74b9d2560` |
| `test/h5-e2e-probe.test.ts` | `0ffa77babf1a9223a6a1e172992a49ec8cfe4320bdaff53c400eb9067d6dfaab` |
| `test/byo-demo-probe.test.ts` | `df85e8591b818e759ebe914de518f4443aab8127a109d4cdd79145cdf4ebb419` |
| `fixtures/h5-e2e-trace.json` | `b429a2414b1a719d05a4e6789a3d22bb08cc64350c17d2bcb5060b6fb70d3654` |
| `fixtures/byo-demo-trace.json` | `daf8d3eabacbc601e608d01936d02c0f7ba78dfb5a0d6f5741ecea5fb4eef6d2` |
| `fixtures/PROVENANCE-h5-e2e-trace.md` | `10d5e273cfe49a1ddef2562eb872b01c370c2afc1f88fecbf85fa9d8a83a3424` |
| `fixtures/PROVENANCE-byo-demo.md` | `4bdb450c4d34795acb01283cb429aec116e788acd55744367473d4224612ad03` |

(Cross-check : le `sha256sum` brut des deux traces égale leur pin LF — fichiers en LF sur disque via
`.gitattributes eol=lf`.)

## Oracle (arbre livrable, brut)

- `npm run ci` (gate:vocab + typecheck + test) : **264/264 pass, 0 fail** (263 baseline + 1 test ajouté ; les
  7 tests `sas_*` de l'autre lot restent verts).
- `npm run typecheck` : exit 0.
- `npm run lint` (eslint .) : exit 0.
- `npm run lint:ratchet` : **69/69** (plafond committé, exit 0).
- `npm run lang:gate` : 0 hit non-exempt, tous scopes GATED (exit 0).
- `npm run export:check` : 0 chemin interdit, 0 français non-exempt, tous scopes GATED (exit 0). `version.ts`
  est auto-exporté (walk `apps/harness/src/**`, `APP_PACKAGE_DIRS`) — le miroir résout `./version.ts`.
- `npm run gate:vocab` : 134 fichiers, aucune revendication interdite (exit 0).
- `git diff --check` : exit 0 (l'unique avertissement CRLF porte sur `ADR-M004`, fichier de l'AUTRE lot, pas
  une erreur d'espaces sur mes fichiers).

## Mutants nommés (oracle déterministe)

- **Mutant A** — `server.ts` `version: HARNESS_VERSION` → `version: "1.0.0"` : **ROUGE** sur 3 tests —
  `serverInfo_version_is_single_source_and_never_one` (« serverInfo.version must equal HARNESS_VERSION (single
  source); got "1.0.0" »), `probe_harness_records_real_decision` et `probe_byo_demo_loop_closes` (« committed
  trace must equal the freshly-driven … trace »). Revert par swap exact ⇒ sha256 `server.ts` **identique**
  avant/après = `f4ecf4e0eea2e8f1c024ba7f687a577de4b1a73193db28087dd0956943b3c114`.
- **Mutant B** — `version.ts` `HARNESS_VERSION = "0.4.0"` → `"1.0.0"` : **ROUGE** sur la garde doctrinale
  (« HARNESS_VERSION must not be a 1.x — 1.0.0 is a human decision, never an agent's (ADR-M010 section 2.3);
  got "1.0.0" »). **Non-vacuité prouvée** : l'égalité `serverInfo === HARNESS_VERSION` PASSERAIT (les deux
  valent "1.0.0"), mais la garde `startsWith("1.")` rougit avant ; **rayon mesuré par la G2 : 3 tests rouges** (la garde + les deux probes de traces, dont la trace fraîche « 1.0.0 » ≠ pin « 0.4.0 »). Revert ⇒ sha256 `version.ts` **identique**
  avant/après = `56c8cf039e6a40cdf159e37bc4382b92ed61a20335d0cd990d837c96d3dd0f86`.

## R-25 (PR petite et unitaire)

Additions de MON lot (hors doc de gouvernance G1, hors `ADR-M004` = autre lot) : **116** (94 suivies + 22
`version.ts` nouveau). Deletions suivies : 27 (churn total add+del = 143). Sous la cible **< 120** en
additions. Le gros est le livrable substantiel (`server.test.ts` +55, `version.ts` +22, `server.ts`/`openapi.ts`
+5 = 82) ; le reste (~34 add / ~25 del) est le re-pin couplé imposé par l'orchestrateur (traces/PROVENANCE/pins).
`ADR-M004` (9 add) apparaît dans `git diff` mais est une modif **préexistante de l'autre lot** (déjà ` M` au
départ de session) — à exclure du commit de ce lot.

## Déviations (surfacées, non contournées — P5)

- **D1 — `package.json` NON bumpé (déviation de la consigne mission (2)/(3), fondée sur ADR-M010).** La
  mission demandait `apps/harness/package.json` et racine `package.json` à `"0.4.0"` et l'assertion
  `HARNESS_VERSION === require('../package.json').version`. **Bloquant doctrinal** : **ADR-M010 §2.4**
  (décision), **§6** (table d'acceptation), **§9** (« `package.json` as version source » = alternative
  explicitement **REJETÉE »), et **CONTRIBUTING.md §Releases** (doc exportée) imposent : *« The version source
  of truth is the git tag. `package.json` deliberately stays at `0.0.0` and `private:true` »*. Le JOURNAL
  2026-09-18 confirme : `v0.4.0` publié via le tag, `package.json` intact. L'assertion (3) est **insatisfiable**
  (0.4.0 ≠ 0.0.0) sans violer un ADR accepté ET falsifier une doc publique. **Résolution retenue** : ne PAS
  bumper (les deux `package.json` restent `0.0.0`, mesuré : aucune modif) ; **inverser** l'assertion (3) en sa
  forme doctrinalement correcte — le test garde désormais l'invariant ADR-M010 (`pkg.version === "0.0.0"`,
  `private === true`, découplage `HARNESS_VERSION !== pkg.version`), invariant qu'aucun test ne gardait
  jusqu'ici. Oracle vert et cohérent avec 264/264. **Un bump réel exigerait un amendement d'ADR-M010** (décision
  G0 = orchestrateur + validateur-humain ; ADR-M010 est hors de ma liste de fichiers) — surfacé pour
  adjudication, jamais contourné.
- **D2 — collision de nom `HARNESS_VERSION` (nom conservé, tel que dicté ; observation surfacée).**
  `@monark/hikae` exporte déjà `HARNESS_VERSION = "fixtures-synth"` (`packages/hikae/src/s2/instrument.ts:32`),
  importé dans `apps/harness/src/calibration.ts:15` — provenance de calibration, domaine distinct. Le nom dicté
  par la mission est conservé (pas de faux, pas de conflit compile/lint : modules différents, `server.ts`
  importe le mien, `calibration.ts` importe celui de hikae). Désambiguïsation en tête de `version.ts` + cette
  note. Le nommage est décision du planificateur ; je surface, il tranche.
- **D3 — tag `v0.4.0` absent de `git tag -l` local** (seuls `v0.1.0`, `v0.3.0` ; `git describe` = `v0.3.0-19`).
  Le JOURNAL 2026-09-18 note le tag de gouvernance `v0.4.0` créé **sur le clone** (non poussé, B-2). La
  référence d'alignement de `HARNESS_VERSION` est le **tag public** `v0.4.0` + l'entrée registre `/versions`
  `0.4.0`, tous deux journalisés 2026-09-18 — pas le tag local. Aucun tag créé (R-20).
- **Périmètre étendu par l'orchestrateur** (2026-09-18) aux 2 fixtures de traces + leurs pins/PROVENANCE
  (h5, byo). Fait par recette officielle ; diff vérifié = `version` seul.

## Suivi formé (hors périmètre worker, non bloquant)

Le défaut a été **mesuré sur l'endpoint LIVE** (`https://mcp.monarkgate.tech/mcp`, sonde `initialize`). Ce lot
est **code-only** : la sonde live continuera d'afficher `serverInfo.version "1.0.0"` **jusqu'au redéploiement
VPS du harnais**, qui est une **action sortante sous go investisseur** (précédent JOURNAL `59601cb` « harness
redeployed … (go 2) » ; M004 D0.3). **Clôture du défaut mesuré = ce redéploiement** — hors périmètre worker
(R-20), à ordonnancer par l'orchestrateur après commit. Ne pas re-sonder le live avant redéploiement : le
`1.0.0` live n'invalide pas ce lot (le code, l'oracle et les traces portent bien `0.4.0`).

## Zéro dette

Aucune dette nue. Les 3 déviations sont des **recherches de solutions documentées** (sources ADR/JOURNAL à
l'appui), pas des contournements ; D1 est une adjudication G0 renvoyée à l'orchestrateur/validateur (jamais un
« dû » nu). Aucun `package.json` bumpé, aucun commit, aucun workflow déclenché (R-20).
