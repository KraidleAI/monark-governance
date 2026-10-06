# G7 du lot SURFACES-1-1-0 : textes publics et surfaces du site en contrat 1.1.0

- **Plan** : `docs/G0-lot-surfaces-1-1-0.md`. **Base** : `ec0e023d` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/surfaces-1-1-0`, rien de poussé, aucune PR.
- **Commits** : `9495565a` (tests rouges), `0bbef90c` (G0), **`d94a8810` gel**, `72be5ed9` (le test du runbook de la vitrine ne cite plus de français : porte de langue), puis ce G7. Hôte : Linux, Node 24.21.0.
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé. Rien sous `apps/harness/src/`, `packages/`, `schemas/`, `apps/site/data/`, ni trace ou fixture JSON dans le diff (`git diff --stat ec0e023d HEAD -- apps/harness/src packages schemas apps/site/data 'fixtures/*.json'` : vide).

## Ce qui a été fait (points de MONARK)

| # | État | Détail |
|---|---|---|
| 1 | fait, sauf le CA | `SKILL.md:20`, `DEMO.md:17, 28, 45, 54, 66-67, 70` (la l.88 ne bouge pas), `README.md:328`, `RUNBOOK-harness.md:168-169, 175`, `sim.ts:25` ; `INTEGRATION.md` relu, sans écart. **`docs/deploy-CA-harness.json` hors lot** : enregistrement du contrôle en ligne, à réécrire par `verify-harness.mjs --out` après le déploiement de T0. |
| 2 | fait | « calibration digest » devient « scores digest » partout dans `apps/site` (`FIGURE_DIGEST_LABEL`, `DIGEST_NOTE`, `/how`, `/ukemi/course`, Narabi, commentaires). `/integrators` et `/docs/integrators` étaient déjà en 1.1.0 à la base ; seul `harness-served.json:70` porte encore `set_digest` (donnée servie, non rendue, remplacée par la synchro de T0). |
| 3 | mesuré, inchangé | `$comment` de `ukemi-pending.json` (sha256 `d94bceba…`) : `scanText` GLOBAL + site, harnais et skills, phrases exemptées ou non : **0** ; `checkPublicText` (notes) : **ok**. |
| 4 | mesuré, inchangé | compte dérivé de `schemas/` = 8 ; construit : « Eight frozen contracts (AttestedBook upcoming until served) » (`/`), « the eight frozen contracts » (`/docs`). `ToolError` et `PolicyTable` restent hors de `UNSERVED_CONTRACT_FILES` (question Q-SRF-1). |
| 5 | fait | `apps/harness/README.md` (`region: null`, bords du test de score, `scores_sha256` + `alpha` + `qhat`, ligne des 32 classes kata, motif réservé élargi, `1.1.0`) ; `PROVENANCE-byo-demo.md`, `-h5-e2e-trace.md`, `-usde.md`. |
| 6 | fait | `RUNBOOK-vitrine.md:34-35` : refus au pré-vol (#181). |
| 7 | déjà fermé à la base | `DEMO.md:88` cite `5c9b03e6…` (`3ca4fe7b`), épinglé par `demo_md_cites_the_current_byo_trace_digest` (empreinte calculée par `sha256Lf`) ; tueur tiré à la main ci-dessous. |
| 8 | fait | `narabi-calib-load.ts` : `scoresSha256Of` (écriture canonique, ordre engagé) remplace `calibDigestOf` ; la page et `/docs/narabi` affichent `e44a68b6…` (le verdict servi), plus `c9793b28…`. |

## Mesures

- **R-25** (contre `ec0e023d`, G7 compris) : voir la ligne finale ci-dessous ; avant ce G7 : **278** (208 +, 70 −), `GREEN`, borne du lot 547 : **une seule PR**, pas de coupe.
- **Ancres** (`verifie-ancres.mjs . --touched ec0e023d HEAD`) : tueurs 18, ANCRE 18, **DERIVE 0, PERDU 0**.
- **red-proof** (`--base ec0e023d --gel 72be5ed9 --draw 9 --seed 37`) : **OK, 9 jugés, 9 F2P, 60 inchangés, 9 tueurs tirés, 9 tués**.
- **Suite complète au gel** (`npm test`) : 2 689 tests, 2 664 verts, 22 sautés, **3 rouges, les mêmes à la base** : `sentinel_sigterm_after_lock_acquired_before_handler_releases_lock`, `sentinel_sigterm_while_lock_acquiring_releases_lock` (« the preload reached the window point … stdout="" ») et `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`. Rejoués sur une extraction `git archive ec0e023d` : 3 rouges, mêmes messages. Fichiers hors du diff : rouges de l'hôte, pas du lot.
- **Vérifications** : `tsc --noEmit` 0 ; `eslint .` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK ; **construction du site** (`npm run build -w @monark/site`, copie hors arbre avec un vrai `node_modules`, Turbopack refusant le lien symbolique) **verte**, `assert-fleet-html` OK. Pages construites : 0 « calibration digest », 0 `calib_digest`/`set_digest`, 0 `c9793b28` ; `e44a68b6` sur `/narabi`, `/docs/narabi`, `/integrators`, `/docs/integrators`.

### Octets servis : inchangés

Mesurés en processus (`handleJsonMirror`, `schema-projection.ts`, `gate.ts`) sur `git archive ec0e023d` et `git archive HEAD` :

| Corps | Base = gel |
|---|---|
| `/openapi.json` | `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0` |
| `TOOL_ERROR_400_SCHEMA` | `75dc6b17ff40690149dcc75fc4865fef0604e891f554617d4ffe86d774a30408` |
| `TOOL_ERROR_500_SCHEMA` | `072a23ce1be1e2a287a003710485d1e579ef5040f9d2387fac8b98ffd96b2ae0` |
| `TOOL_OUTPUT_SCHEMA` | `3b7c685ee012756c911b5311b83c43dbd3d6a2bbeb76c5174dfccab461609e03` |
| clause kata (`kataClause()`) | `022756c39c3f3aa381a39f313ebb92236d237d75e770febe3822de047898e803` |
| description de `gate` | `dd7287793b229a3e083286ac1a7333f646d3cc3a323071d129bff702c4551ef3` |
| toutes les exportations de `schema-projection.ts` | `830680b3…` |

### `checkPublicText` (kind `notes`)

Lignes ajoutées par le lot, fichier par fichier : **ok** sur `SKILL.md`, `DEMO.md`, `README.md`, `PROVENANCE-byo-demo.md`, `PROVENANCE-h5-e2e-trace.md` et les six fichiers du site. Deux fichiers portent sur une ligne modifiée un renvoi d'ADR **préexistant** (règle k) : `apps/harness/README.md` (`ADR-CM B-2`, `ADR-M007 D7`) et `PROVENANCE-usde.md` (`ADR-M001 C5`) ; les mots écrits par le lot, ces renvois masqués : **ok**. Fichiers entiers, base contre gel : même nombre de violations partout (aucune ajoutée). Aucun texte ne cite l'URL du dépôt de la spécification : rien ne dépend de V-1.

## Tueurs (tous tirés à la main : mutation, test seul, rouge par assertion, restauration, sha256 identique)

| Tueur | Test | Résultat |
|---|---|---|
| `skills/monark/SKILL.md:20 CONST "`scores_sha256`" -> "`calib_digest`"` | `srf_skill_audit_names_scores_sha256` | tué |
| `skills/monark/DEMO.md:45 CONST "1.1.0" -> "1.0.0"` | `srf_demo_json_blocks_are_the_recorded_byo_loop` | tué |
| `apps/site/lib/sim.ts:25 CONST "1.1.0" -> "1.0.0"` | `srf_site_sim_echoes_the_served_schema_version` | tué |
| `apps/harness/README.md:73 CONST "must be `1.1.0`" -> "must be `1.0.0`"` | `srf_harness_readme_states_the_served_contract` | tué |
| `fixtures/PROVENANCE-byo-demo.md:38 CONST "3e12ae9e" -> "4081f718"` | `srf_provenance_texts_name_the_recorded_scores_sha256` | tué |
| `README.md:328 CONST "scores_sha256" -> "calib_digest"` | `srf_repo_docs_name_scores_sha256` | tué |
| `apps/site/app/how/page.tsx:77 CONST "the scores digest it came from" -> "the calibration digest it came from"` | `srf_site_says_scores_digest` | tué |
| `docs/RUNBOOK-vitrine.md:35 CONST "`preflight`" -> "`main`"` | `srf_runbook_vitrine_refusal_falls_at_preflight` | tué |
| `apps/site/lib/harness-served-load.ts:192` (existant) | `narabi_gate_facts_read_from_committed_sources` | tué |
| `apps/site/lib/narabi-calib-load.ts:34 CONST "JSON.stringify(scores)" -> "JSON.stringify([...scores].sort((a, b) => a - b))"` (à la main) | `narabi_gate_facts_read_from_committed_sources` | tué |
| `skills/monark/DEMO.md:88 CONST "5c9b03e6…" -> "daf8d3ea…"` (existant, point 7) | `demo_md_cites_the_current_byo_trace_digest` | tué |

## Restes et questions pour MONARK

- **Q-SRF-1** (point 4) : garder `ToolError` et `PolicyTable` comme servis (corps 400/500 ; empreinte du verdict et tables publiées avec la spécification), donc « Eight frozen contracts (AttestedBook upcoming until served) » ?
- **Q-SRF-2** : `skills/monark/SKILL.md:62` (« Two other `task_class`es are served ») ne nomme pas les 32 classes kata servies à T0 ; hors de la liste du §4.10 de la note. Ajouter une phrase ?
- **Q-SRF-3** : `docs/RUNBOOK-harness.md:195` dit « 13 of 13 checks » ; le script en fait 15.
- À T0, chez MONARK : `docs/deploy-CA-harness.json` (CA neuf), synchro du harnais puis d'ukemi (remplace `set_digest` de `harness-served.json` et supprime `ukemi-pending.json`), envoi du site.
- La ligne du golden de `/ukemi/course` (`test/site-ukemi.test.ts:1034`) est dans une fonction d'aide : non jugée par red-proof, couverte par `site_ukemi_course_view_golden` (vert au gel).
