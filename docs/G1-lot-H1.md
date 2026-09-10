# G1 — Contrôle de génération — Lot H1 (harnais MCP · outil `gate` HIKAE)

> Journal de provenance de la génération. Matérialisé au dépôt par l'orchestrateur au merge (patron K-1). Rattachement G0 : ADR-M005 (D1/D5/D6/D7/D8/D9/D11), PLAN-harnais-lot §H1.

## Gate 0 (R-1) — générateur
- **Modèle résolu** : `claude-opus-4-8[1m]`, effort max (préfixe `claude-opus-4-8`, pas `claude-opus-5` banni). Worker implémenteur.
- **R-20** : le worker n'a rien committé/poussé ; arbre laissé modifié pour adjudication orchestrateur. Seul l'orchestrateur (siège Opus-seat) committe.

## Fichiers (19 : 12 créés sous `apps/harness/`, 7 tracked modifiés)
- **Créés** : `apps/harness/{package.json,tsconfig.json,README.md}` ; `apps/harness/src/{server.ts,schema-projection.ts,calibration.ts,tools/gate.ts,tools/registry.ts}` ; `apps/harness/test/{gate,schema,registry,server}.test.ts`.
- **Modifiés** : `tsconfig.json` (include += apps/harness src|test), `eslint.config.mjs` (ignores/disableTypeChecked `apps/**`→`apps/site/**` ; harness devient type-checked, site reste linté), `package.json` (glob test += apps/harness), `scripts/lang-gate.mjs` (`SCOPES += harness` + branche `classifyScope`), `scripts/grep-forbidden.mjs` (parcours `apps/harness/src`), `vocab-banned.json` (`scan.harness`), `package-lock.json` (+47, install SDK).
- **`packages/contracts/` + `schemas/` : 0 octet de diff** (invariant gelé tenu).

## Décisions de conception (grounded, ADR-M005)
- **Calibration synthétique btc-dir (D5, C-8)** : dérivée des fixtures **S2a synthétiques** de HIKAE (`generateLabeledSeries` sur `S2_DEFAULT.s2a`, `harness_version="fixtures-synth"`, seed 101, n=300 → 150 scores de calibration, 6 uns). **Digest fail-closed** : `calibDigest(scores)` asserté == `CALIB_DIGEST_PINNED = fcebed27…eda6` **au chargement** (une dérive de génération HIKAE jette à l'import ; jamais de re-calibration silencieuse). Déclarée `synthetic`. q̂=0 pour α∈{0.05,0.1,0.2} → singleton → chemin COMMIT réel atteignable.
- **Cascade → `under_calib` honnête (D5)** : pas de calibration `cascade-liquidable-24h` → `nCalib=0` ; `gate()` (l3-gate:79 `nCalib<nMin`) tombe en `abstain`/`under_calib` **par la vraie logique**, pas un court-circuit. Résultat attendu, pas un défaut.
- **Enveloppe d'entrée `{prediction, params}`** : `Prediction` étant `additionalProperties:false`, les params non gelés ne peuvent cohabiter à plat → entrée = `{ prediction: <Prediction gelée projetée>, params: <non gelés validés serveur> }`. Params validés (K-4a) : `nMin≥1`, `alpha∈(0,1)`, `tau`/`tauInterval` finis ≥0, `bFloor≥0` → sinon **erreur d'outil**. `schema_version` fixé serveur `"1.0.0"` (K-4c) ; `clockOpen` porté-appelant ; `timedOut/evaluable/nCalib` dérivés-serveur (K-4d).
- **Projection de schéma (D8)** : `fromJsonSchema` **ne résout pas** le `$ref` externe gate-decision→coverage-verdict (mesuré) → transform déterministe : `stripMeta` ($schema/$id) + splice de la CoverageVerdict gelée à la place du nœud `$ref`. Reproductible indépendamment par le test de dérive.
- **Transport (D7)** : `createMcpHandler` (SDK **`@modelcontextprotocol/server@2.0.0`**, R-8 confirmé), `keepAliveMs 15000`, Origin allowlist (`monarkgate.tech`+sous-domaines ; 403 si présent-invalide ; **absent = accepté**, K-9), bind **`127.0.0.1:3001`** (K-8/C-10). `gate` **pur** — ne lit jamais `input.tool` (D0).
- **Câblage gouvernance** : tsconfig include d'abord, puis eslint (harness type-checked, site couvert) ; scopes `harness` réels (lang-gate/grep/vocab).

## 12 tests nommés (chacun tué par ≥ 1 mutant, restauré byte-exact sha256)
`gate_tool_emits_frozen_gate_decision`, `tool_schema_equals_frozen_schema`, `gate_tool_never_calls_tool`, `gate_dispatches_on_task_class`, `gate_description_declares_cascade_uncalibrated`, `gate_rejects_invalid_params`, `mcp_tools_have_no_side_effects`, `origin_invalid_returns_403`, `origin_absent_is_accepted`, `harness_binds_localhost_only`, `harness_tool_descriptions_pass_vocab`, `calibration_declared_synthetic`.

## Incident de procédure (transparence, error_origin=orchestrateur)
Pendant l'adjudication, l'orchestrateur a injecté un mutant français dans `apps/harness/src/server.ts` pour tester la non-vacuité de `lang-gate --scope harness` (résultat : scope RÉEL, 5 hits, exit 1). La restauration initiale a échoué (chemin `[System.IO.File]` relatif au cwd du process ≠ `Push-Location`), puis a été corrigée : `server.ts` restauré **byte-exact** (sha256 `f0f4e762…0107b09e`). Leçon : pour l'I/O binaire, chemins absolus ; oracle de restauration = sha256. Aucun défaut livré (arbre final byte-identique à l'état testé du worker, confirmé par la G2).

## Écart résolu (pas une dette nue)
`@modelcontextprotocol/server` absent du `node_modules` initial → vérif registre R-8 (2.0.0 GA, node≥20) puis install (+47 lockfile, `package.json` racine inchangé). Résolu, tracé.
