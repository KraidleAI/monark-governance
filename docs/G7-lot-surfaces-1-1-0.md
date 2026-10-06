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

- **R-25** (contre `ec0e023d`, G7 compris)  : **279** (209 +, 70 −) avec ce G7, 278 avant lui, `GREEN`, borne du lot 547 : **une seule PR**, pas de coupe.
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

## Repli de la G2

- **G2 neuve** : `docs/G2-lot-surfaces-1-1-0.md`, verdict « bloquant » sur B-1 seul. **Base fusionnée** : `647e078a` (V-1, #185) par le commit de fusion `4c2c2003` (`--no-ff`), **sans conflit**. Commits du pli : `72530dc9` (tests rouges), `fd5bda12` (gel), puis la réponse de MONARK (`b561bc5`) : un commit de tests, un commit de texte.

| Point | Fait | Épingle et tueur |
|---|---|---|
| B-1 | `SKILL.md:62` « served with a committed calibration » ; nouveau paragraphe `:72` : les 32 classes kata servies **sans calibration**, le portail s'abstient (`under_calib`, ou `non_evaluable` pour un penchant nul sur `dir`, raisons vérifiées par `runGate` en processus), aucune région ni bande promise ; motif réservé lu de `KATA_CLASS_RE`, `byo_reserved_kata` | `srf_skill_names_the_kata_classes_and_the_reserved_pattern`, `SKILL.md:72 CONST "`byo_reserved_kata`" -> "`byo_overrides_committed`"` |
| N-1 | la ligne du pré-vol est épinglée par empreinte (`7793735f…`), le test ne cite pas de français | `srf_runbook_vitrine_refusal_falls_at_preflight`, `RUNBOOK-vitrine.md:36 CONST "`preflight`" -> "`main`"` ; la sonde de la G2 (sens 1.0.0 remis) est maintenant tuée |
| N-2 | `assert.equal` sur tout `DIGEST_NOTE` | `srf_ukemi_digest_note_is_the_1_1_0_note`, `ukemi-copy.ts:144` ; la sonde « sorted ascending » est tuée |
| N-3 | `CONTRIBUTING.md:20, 25-26` : `scores_sha256`, ordre envoyé, boucle sur `scores_sha256`, `alpha`, `qhat` | `srf_contributing_closes_the_loop_on_scores_sha256`, `CONTRIBUTING.md:25` |
| N-4 / Q-SRF-3 | `RUNBOOK-harness.md:195` : `VERIFY OK — all checks passed` (15 of 15 checks), compte dérivé du script | `srf_runbook_harness_green_gate_quotes_the_script`, `RUNBOOK-harness.md:195 CONST "15 of 15 checks" -> "13 of 13 checks"` |
| N-5 | pas de code (voir ci-dessous) | — |
| M-1, M-2 | ligne kata du README du harnais : type et domaine de `yhat` ; `nCalib` d'une classe kata : `0` | — |
| M-3 | **à MONARK** : `scripts/sync-ukemi-served.mjs` (`COMMENT`, zone de MONARK) écrit « the calibration digest » dans le `$comment` de `ukemi-served.json` ; correctif proposé : « the scores digest (the verdict's scores_sha256) » | — |
| M-4 | `README.md:20, 94` : « eight frozen … contracts », `:317` sans chiffre (le site dit « Eight », Q-SRF-1) | aucun test n'épinglait « six » |
| M-5 | l'entrée datée du 2026-10-05 retrouve ses mots ; la correction 1.1.0 est une nouvelle ligne datée (2026-10-06, SURFACES-1-1-0) en dessous | N-1 |

- **N-5, UKEMI-COURSE-DIGEST-PIN-1** : jusqu'à la synchro ukemi de T0, `apps/site/data/ukemi-served.json` porte `calibration_digest` `e7e67366…`, l'empreinte triée 1.0.0 lue sur le service ; un site construit avant la synchro afficherait sur `/ukemi/course` « served scores digest e7e67366… », faux pour cette valeur. La garde d'envoi (`*-pending.json`) empêche de le publier ; la synchro de MONARK (`sync-ukemi-served.mjs:152`, `calibration_digest: v.scores_sha256`) le remplace par `a9277222…`. Item ouvert UKEMI-COURSE-DIGEST-PIN-1 : un test qui, sans `ukemi-pending.json`, exige `liq_verdict.calibration_digest === UKEMI_LIQ_SCORES_SHA256_PINNED[<clé s0>]`. Options : (a) dans `test/site-ukemi.test.ts`, ~8 lignes de test, rouge par construction tant que l'instantané en attente existe sauf garde `existsSync` ; (b) dans le prochain lot après T0, vert dès la promotion. Recommandé : (b), ~8 lignes, zéro octet servi.
- **Réponses de MONARK** (`b561bc5`) : Q-SRF-1, garder « Eight » (aucun changement) ; Q-SRF-2, corrigé ici (B-1, sans calibration, abstention) ; Q-SRF-3, corrigé ici, 15 of 15 ; `docs/deploy-CA-harness.json` reste hors lot : MONARK le régénère par `node scripts/verify-harness.mjs --out docs/deploy-CA-harness.json` juste après le déploiement de T0, avant les deux synchros ; il comptera 15 contrôles.

### Mesures du pli

- **red-proof** `--base ec0e023d --gel HEAD --draw 9 --seed 37` : **OK, 16 jugés** (les 13 du lot et les 3 tests de V-1 venus de la base), 9 tueurs tirés, 9 tués. Contre le commit de fusion `4c2c2003`, `srf_ukemi_digest_note_is_the_1_1_0_note` est « vert à la base » (la note y est déjà) : d'où la base `ec0e023d`.
- **Tueurs neufs tirés à la main** (mutation, test seul, rouge par assertion, sha256 restauré) : les cinq déclarés ci-dessus, plus deux sondes (`RUNBOOK-vitrine.md:36` sens 1.0.0 ; `SKILL.md:72` « with a calibrated band ») : **7/7 tués**.
- **Ancres** : contre `ec0e023d`, 25 tueurs, 0 dérive, 0 perdu ; contre `4c2c2003`, 12, 0, 0.
- **R-25** contre la base `647e078a` : **338** (260 +, 78 −), `GREEN`, sous 547.
- **Octets servis**, `git archive 647e078a` contre `git archive HEAD` : identiques (`/openapi.json` `61c9df97…`, 400 `75dc6b17…`, 500 `072a23ce…`, `TOOL_OUTPUT_SCHEMA` `3b7c685e…`, clause `022756c3…`, description `dd728779…`, exportations `830680b3…`).
- **Portes** : `tsc` 0, `eslint` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate`, `export:check` OK. Tests des fichiers touchés (`surfaces-1-1-0`, `skills`, `narabi-live`, `site-ukemi`, `byo-demo-probe`, `site-build-fleet`, `public-surfaces-honesty`, `export-public`, `cra-b`, `public-text-deny`) : 137/137.
- **`checkPublicText`** (notes) sur les lignes ajoutées du pli : `SKILL.md` et `CONTRIBUTING.md` ok ; `README.md:94` porte « budget » (q3) et le README du harnais des renvois d'ADR, tous deux **préexistants** sur la ligne modifiée ; nombres de violations des fichiers entiers inchangés entre base et gel. Aucun texte ne cite l'URL de la spécification.
