# G0 court du lot SURFACES-1-1-0 (textes publics et surfaces du site en contrat 1.1.0)

- **Demande** : MONARK, `coordination/messages/2026-10-06-MONARK-vers-RECHERCHES-lot-surfaces-T0.md` (huit points ; liste de T0 de `docs/ETAT.md`, item CONTRACT-1-1-0).
- **Base** : `ec0e023d` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/surfaces-1-1-0`.
- **Référence des textes** : note de version `NOTICE-1-1-0.md` (sha256 `79b6c379…`), §2.2, §2.3, §2.6, §2.8, §2.13, §2.14, §4.10, et le code servi de la base (sondes en processus, `handleJsonMirror` et `runGate`).
- **Contraintes** : aucun fichier sous `apps/harness/src/`, `packages/`, `schemas/`, ni aucune trace ou donnée servie dans le diff ; `/openapi.json` reste `61c9df97…` ; les textes publics écrits passent `checkPublicText` ; V-1 (`public-text-deny`) n'est pas touché. Aucun texte du lot ne cite l'URL du dépôt de la spécification : rien ne dépend de V-1.
- **Tests** : un fichier neuf `test/surfaces-1-1-0.test.ts` (8 tests `srf_*`, un tueur chacun) ; `narabi_gate_facts_read_from_committed_sources` repointé ; une ligne du golden de `/ukemi/course` (`test/site-ukemi.test.ts`, fonction d'aide hors corps de test).

## Périmètre, point par point

| # | Fichier:ligne | Avant | Après | Source | Épingle |
|---|---|---|---|---|---|
| 1 | `skills/monark/SKILL.md:20` | audit clos quand « `calib_digest` equals your score-set digest » | « `scores_sha256`, `alpha` and `qhat` equal those of `calibrate` » | note §2.3, §4.10 | `srf_skill_audit_names_scores_sha256` |
| 1 | `skills/monark/DEMO.md:17, 28, 45, 54, 66, 70` | `set_digest`, `calib_digest`, `4081f718…`, `"schema_version": "1.0.0"` | `scores_sha256` (`3e12ae9e…`, lu dans la trace), `alpha`, `"1.1.0"` ; la ligne d'audit reste une ligne (l.88 ne bouge pas) | note §2.1 à §2.3 ; `fixtures/byo-demo-trace.json` | `srf_demo_json_blocks_are_the_recorded_byo_loop` (blocs JSON égaux à la trace) |
| 1 | `skills/monark/INTEGRATION.md` | relu : aucun nom, version ni forme 1.0.0 | inchangé | — | `srf_skill_audit_…` (aucun nom 1.0.0) |
| 1 | `README.md:328` | `calib_digest` | `scores_sha256` | `packages/contracts/src/canonical.ts:53` | `srf_repo_docs_name_scores_sha256` |
| 1 | `docs/RUNBOOK-harness.md:168-169, 175` | `verdict.calib_digest` / `set_digest` / « C5 digest » | `scores_sha256` / « pinned digest » | `scripts/verify-harness.mjs:291, 350, 362` | `srf_repo_docs_name_scores_sha256` |
| 1 | `apps/site/lib/sim.ts:25` | `"1.0.0"` | `"1.1.0"` | `SCHEMA_VERSION` de `@monark/contracts` | `srf_site_sim_echoes_the_served_schema_version` |
| 1 | `docs/deploy-CA-harness.json` | CA du déploiement 1.0.0 (2026-10-04) | **hors lot** : enregistrement d'un contrôle en ligne, réécrit par `verify-harness.mjs --out` après le déploiement de T0 (RUNBOOK-harness §6) ; l'éditer à la main serait un faux. Lu par trois tests comme le CA déployé. | — | — |
| 2 | `apps/site/lib/ukemi-copy.ts:141, 143-145` (`FIGURE_DIGEST_LABEL`, `DIGEST_NOTE`), `apps/site/app/how/page.tsx:77`, `apps/site/lib/ukemi-course-view.ts:155`, commentaires (`ukemi-page.tsx:18`, `ukemi-copy.ts:25, 142`, `ukemi-served-load.ts:46`, `ukemi-served-figures.ts:18`) | « calibration digest » | « scores digest » ; la note dit l'ordre de la table de la classe (sans chiffre : épingle de prose sans chiffre) | note §2.2 | `srf_site_says_scores_digest` ; golden de `/ukemi/course` |
| 2 | `/integrators`, `/docs/integrators` | déjà en 1.1.0 à la base (`scores_sha256`, traces réenregistrées par 3c-3c) ; le seul `set_digest` restant est `apps/site/data/harness-served.json:70`, donnée servie lue sur le service 1.0.0, non rendue | inchangé : la synchro du harnais de MONARK à T0 la remplace | — | — |
| 3 | `apps/site/data/ukemi-pending.json` `$comment` | porte : `scanText` GLOBAL + site, harnais, skills, phrases exemptées ou non : **0** ; `checkPublicText` (notes) : **ok** | inchangé | — | mesure au G7 |
| 4 | `apps/site/app/page.tsx:181`, `apps/site/app/docs/page.tsx:61` | compte dérivé de `schemas/` : **8** → « Eight frozen contracts (AttestedBook upcoming until served) » | inchangé : `ToolError` est servi (corps 400 et 500 de `/openapi.json`), `PolicyTable` l'est en empreinte (`policy_table_sha256` du verdict) et ses tables sont publiées avec la spécification à T0 ; aucun des deux n'entre dans `UNSERVED_CONTRACT_FILES` | m-6 du G7 de 3c-2 ; note §5 | `frozen_contracts_count_is_derived` (existant) |
| 5 | `apps/harness/README.md:32, 33, 35, 36 (neuve), 44-46, 73, 80, 94` | région vide, phrase des bords au double le plus proche, `calib_digest = calibDigest`, `1.0.0`, `calibDigest` | `region: null`, bords pris du test de score (spéc. §8), `scores_sha256` + `alpha` + `qhat`, ligne des 32 classes kata, motif réservé élargi, `1.1.0` | note §2.1, §2.3, §2.6, §2.8, §2.13, §2.14 ; sondes en processus | `srf_harness_readme_states_the_served_contract` |
| 5 | `fixtures/PROVENANCE-byo-demo.md:25, 37-38, 74-75` ; `PROVENANCE-h5-e2e-trace.md:65, 130` ; `PROVENANCE-usde.md:75-78` | `set_digest`, `calib_digest` (`4081f718…`, `c9793b28…`) | `scores_sha256` (`3e12ae9e…`, `e44a68b6…`) ; USDe : `calibDigest` reste le condensé de l'outil de provenance, le fil porte `scores_sha256` = l'épingle du fichier (la ligne d'épingle lue par le chargeur ne bouge pas) | traces ; `calibration.ts:161` | `srf_provenance_texts_name_the_recorded_scores_sha256` |
| 6 | `docs/RUNBOOK-vitrine.md:34-35` | refus « après les portes locales complètes (~15 min) » | refus au pré-vol, avant toute porte locale (#181) | `scripts/release-public.mjs:186-187` | `srf_runbook_vitrine_refusal_falls_at_preflight` |
| 7 | `skills/monark/DEMO.md:88` | **déjà fermé à la base** (`3ca4fe7b`) : cite `5c9b03e6…`, l'empreinte LF calculée de la trace | inchangé | `test/byo-demo-probe.test.ts:204` (`demo_md_cites_the_current_byo_trace_digest`, empreinte calculée par `sha256Lf`) | tueur existant tiré à la main au G7 |
| 8 | `apps/site/lib/narabi-calib-load.ts`, `components/narabi/narabi-live.tsx:144, 296`, `app/narabi/page.tsx:45`, `app/docs/narabi/page.tsx:101`, `lib/narabi-copy.ts:70` | la page affiche `calibDigest` (`c9793b28…`, empreinte triée 1.0.0) | `scoresSha256Of` (écriture canonique, ordre engagé) = `e44a68b6…`, la valeur du verdict servi ; libellé « scores digest » | Q-M6 ; note §2.2 ; `gate.test.ts:394` | `narabi_gate_facts_read_from_committed_sources` (repointé) |

## Hors lot, déclaré

- `docs/deploy-CA-harness.json` (ci-dessus) ; `apps/site/data/harness-served.json` (synchro de T0).
- `docs/RUNBOOK-harness.md:195` dit « 13 of 13 checks » ; `verify-harness.mjs` en fait 15 (le CA du 2026-10-04 en porte 15). Hors de la liste de MONARK : signalé.
- `skills/monark/SKILL.md:62` dit « Two other `task_class`es are served » ; à T0 les 32 classes kata sont aussi servies (sans ligne, abstention). Hors de la liste de la note (§4.10 ne nomme que la l.20) : question à MONARK.

## R-25

Estimation : ~95 lignes de code et de test (test neuf ~110, chargeur ~-5, test Narabi +6), sous 547 : une seule PR.
