# G0 du bloc C (contrat 1.1.0) : la bascule 1.1.0, lots CM-3c-2, CM-3c-3 et CM-3c-4 (C')

- **Sources** (sha256 des octets LF ; `sha256sum -c` du dossier r3 : 8 sur 8 OK, de `avis/` : 4 sur 4 OK ; `recherches` à `033d782`) :
  - plan r3 `recherches:coordination/pieces/2026-10-04-contrat-1-1-0-r3/PLAN-CM-3c-CM-4.md` (`3e0da1a6…653c`) : §2, §2.2.1, §2.4, §3, §5.1, §5.2.1, §5.3, §5.5, §6, §7, **§8.3 (ligne C)**, §8.4, **§8.5**, §8.6, §9.2, §9.4, §10 (R-j, R-k) ;
  - `SPEC-1-1-0-brouillon.md` (`975bb40c…7b9d`) §2, §5, §6, §7, §8, §10, §11, §12 bis, §13, §15 ;
  - `AMENDEMENT-ADR-CM-r3.md` (`774a5601…d0d0`) §2 (B-11 amendée, B-12, B-13, B-16, B-17, items du §10) ;
  - `TEXTES-ACTES-MONARK.md` (`ebad3a88…c08c`) §1 à §3 ;
  - liste r4 `…/2026-10-04-contrat-1-1-0-r4-liste/LISTE-REVISION.md` (`dcd6021e…24e3`), lignes 4, 5, 6, 8 à 17 ;
  - décisions déléguées : `avis/DECISION-PolicyRow-Q1-Q3.md` (`117eb289…37ba4`, Q-1 condition 4, Q-3) ; `…/2026-10-04-CM-4b-avis/DECISION-CM-4b-C1-C11.md` (`bee35dbc…bb5a`) : C-1 condition 2 et 5, C-3 condition 3, C-4 (forme L3), C-9 (forme avant ce G0), C-10, C-11 condition 2 ; avis lus : `AVIS-advisor-PolicyRow-Q1-Q3.md`, `AVIS-advisor-CM-4b-C1-C11.md` ;
  - G0 et G7 sur la base : `docs/G0-lot-cm-3c-1.md`, `docs/G7-lot-cm-3c-1.md` (bloc A) ; `docs/G0-lot-cm-4a-i.md`, `docs/G7-lot-cm-4a-i.md` (B1) ; `docs/G0-lot-cm-4a-ii.md`, `docs/G7-lot-cm-4a-ii.md`, `docs/G7-lot-cm-4a-ii-b.md` (B2) ; `docs/G0-lot-served-pending-1.md`, `docs/G7-lot-served-pending-1.md` ; `docs/G0-lot-ukemi-pending-1.md`, `docs/G7-lot-ukemi-pending-1.md` (item UKEMI-PENDING-SNAPSHOT-1, déclencheur : ce G0) ; W2E-TAIL-1 / TAIL-TS-COUNTS-1 (`docs/ETAT.md` du tronc, #135 sur la base) ; CM-4b lot a : `docs/G0-lot-cm-4b.md` et `docs/G7-lot-cm-4b.md` de `origin/recherches/cm-4b` (`12577be9`, PR #141) ;
  - messages de MONARK depuis le 2026-10-04, dont : `…-Q1-Q3-controle.md` (ENGINE-ROW-RETIRE-PATH-1 : sortie déclarée), `…-128-129-130.md` (Q-SP1-6 confirmée), `…-SERVED-PENDING-1-Q.md`, `…-UKEMI-PENDING-1-Q.md`, `…-CM-4b-Z.md` (Z-1 à Z-6), `…-CM-4b-croisement.md`, `…-D-7-accord.md` (D = 7 jours), `…-138-139.md`, `2026-10-05-MONARK-vers-RECHERCHES-141-et-audit-P3.md` (S-8 au bloc C, sinon D ; #141 en fusion).
- **Base (amendée 2026-10-05)** : `origin/base/chantier-moteur-2026-10-03` = **`87f6081c`**, fusion de #141 (CM-4b lot a, tête `12577be9`), oracle de MONARK vert (2 311 tests, 0 échec) ; la base est fusionnée dans `recherches/cm-3c-2` par un commit de fusion (aucun conflit : ce G0 ne porte que de la documentation). #141 ne touche aucune ancre citée ici (`kata-path.ts`, `policy-classes.ts`, `policy-guard.ts`, aides de test, deux docs) ; `gate.ts:62` et `verify-harness.mjs:41` inchangés. P-1 rempli. Le reste de cette puce est l'état du G0 initial.
- **Base initiale** : `origin/base/chantier-moteur-2026-10-03` = **`e6dc5542`** (refetchée : `git fetch origin '+refs/heads/*:refs/remotes/origin/*'`). **#141 (CM-4b lot a) n'est pas encore fusionnée** (PR ouverte, tête `12577be9` ; MONARK annonce la fusion à la CI verte). Ce G0 part donc de `e6dc5542` et le note : le code ne part qu'après la fusion de #141, sur la nouvelle tête (précondition P-1). La base porte A, B1, B2, SERVED-PENDING-1, UKEMI-PENDING-1 et `tail.ts`. Branche `recherches/cm-3c-2`, arbre `/home/user/monark-governance-blc`. Auteur : RECHERCHES.
- **Statut** : G0 écrit **avant tout code**, arrêté sur les questions de la section 12. **Amendé le 2026-10-05** (section 14) : Q-M1 à Q-M16 répondues par MONARK, Q-C1 à Q-C5 décidées (décision déléguée), Q-F1 et Q-F2 répondues par le fondateur. Branche poussée, aucune PR ouverte.

## 1. Constat principal : le bloc C ne tient pas dans une PR de 1 205

Le plan r3 §8.3 estime le bloc C à « ~420 + ~540 » et prévoit C' (3c-4 : B-12, B-13, ~250) si la mesure dépasse 1 205. Mesure de ce G0 (recensement `git grep` à `e6dc5542`, plus une simulation jetable) :

- **Simulation « bascule seule »** (arbre jetable, effacé ; `SCHEMA_VERSION = "1.1.0"` à `apps/harness/src/tools/gate.ts:62` et `CA_SCHEMA_VERSION = "1.1.0"` à `scripts/verify-harness.mjs:41`, rien d'autre ; Node 22, variables de proxy retirées) :
  - `apps/harness`, `packages/*` : 357 tests, **59 rouges**, tous dans 16 fichiers de `apps/harness/test/` (`gate.test.ts` 19, `gate-liq` 6, `gate-cm2b` 5, `gate-byo-lookalike` 5, `error-code` 4, `http` 3, `gate-byo-tau-cap` 3, `gate-byo-confusable` 3, `oracle-fixtures` 2, `gate-produced-at` 2, `gate-empty-set` 2, `ukemi-predict`, `served-replay-cm3`, `registry`, `gate-liq-artifact`, `error-code-sites` 1 chacun) ; **0 dans `packages/hikae` et `packages/contracts`** (leurs constructeurs prennent la version en paramètre) ;
  - racine (80 fichiers, hors export et outils de mutation) : 6 rouges dus à la bascule : `probe_byo_demo_loop_closes`, `probe_harness_records_real_decision`, `h5_carries_attested` (traces enregistrées en 1.0.0), et les trois littéraux de `site-ukemi` déjà nommés par UKEMI-PENDING-1 (l.1137, l.1457, l.1638). Les autres rouges du passage sont environnementaux (arbre sans `.git` : `byte_guard`, générateur de mission, sondes coinbase, dojo, bell, u4) et n'ont pas de lien avec la bascule.
  - `harness_served_data_matches_in_process_harness` et `narabi_gate_facts_read_from_committed_sources` restent **verts** sous la seule bascule de version : ce sont les changements de format (schémas projetés) qui les feront bouger, et l'instantané en attente qui les couvrira.
- **Recensement** (lignes qui changent, lues fichier par fichier) : `"1.0.0"` sur 42 lignes de `apps/harness/test/` ; `calib_digest`, `set_digest` ou `calibDigest` sur 90 lignes de tests et dans 60 fichiers hors docs ; plus le format lui-même (types, schémas, couplages), deux schémas neufs, le moteur, les producteurs, les chargeurs, les scripts et l'instantané en attente (`apps/site/data/harness-pending.json`, environ 130 lignes, **compté** par le pathspec de `ci.yml:82`).

**Estimation de tout ce que la ligne C du plan nomme : ~2 000 lignes R-25** (section 9), soit le double du plan. Retirer seulement B-12 et B-13 (C') laisse ~1 600 lignes : au-dessus de 1 205. La bascule elle-même (format, producteurs, lecteurs, épingles), qui doit être atomique pour que la tête de PR soit verte, pèse à elle seule ~1 300 lignes si rien n'est préparé avant.

**Proposition (Q-M1)** : trois PR, cinq lots, chacun ≤ 547, chaque PR ≤ 1 205 et verte en tête :

| PR | Lots | Contenu | Servi | R-25 estimé |
|---|---|---|---|---|
| **C1** | 3c-2 | préparation sans bascule : deux schémas neufs (paquet gelé, ajout pur), outil de provenance de `calibDigest`, générateur des 9 décisions, constante de version dans les tests, rejeu par projection | **aucun octet** | ~540 |
| **C2** | 3c-3a, 3c-3b, 3c-3c | **la bascule** : format 1.1.0 (B-11 amendée), B-17, USDe, liq et cascade servis depuis la table, codes `input_invalid` et `json_invalid`, épingles régénérées, instantané en attente | B-11 amendée, B-17 | ~1 065 (345 + 420 + 300) |
| **C'** | 3c-4 | B-12, B-13, B-16 (producteurs), OPENAPI-ERROR-CODE-1, S-8 (B-8), `canonicalRow` réexporté | B-12, B-13, B-16, S-8 | ~410 |

Le paquet gelé (`packages/contracts/src/`, `schemas/`) ne change qu'en C1 et C2, tous deux lots CM-3c-2 et CM-3c-3 que nomme l'addendum D9-ter (« bloc C (lots CM-3c-2 et CM-3c-3) ») ; C' n'y touche pas. C'est une lecture de D9-ter à confirmer par MONARK (Q-M1).

## 2. Ordre

A → B1 → B2 → W2E-TAIL-1 → SERVED-PENDING-1 → (#141, CM-4b lot a, non servi) → **C1 → UKEMI-PENDING-SNAPSHOT-1 → C2 → C'** → D → temps (i) final → actes 2 et 3 (T − D, D = 7 jours) → T0 → E.

- C1 ne change aucun octet servi et peut partir dès la fusion de #141 et les réponses à Q-M1 et Q-M3.
- UKEMI-PENDING-SNAPSHOT-1 est **déclenché** (section 10) et doit être sur la base avant C2, comme SERVED-PENDING-1 avant C.
- C' suit C2 et précède D : D attend le format complet (C-1 condition 2) et le texte liq de S-8 (si S-8 reste en C', Q-M13).

## 3. Périmètre exact par lot

Zone RECHERCHES : `apps/harness/`, `packages/hikae/`, et le paquet gelé sous D9-ter (`packages/contracts/src/`, `schemas/`, `test/contracts-frozen.manifest.json`, le compte de `test/contracts-frozen.test.ts`). Tout autre fichier demande une ouverture de zone (section 8, P-4).

### 3.1 Lot CM-3c-2 (PR C1) : préparation, aucun octet servi

1. **`schemas/policy-row.schema.json`** (neuf ; D9-ter). Racine : le fichier de table `{row_format, class, rows}` ; `$defs` : `ClassEntry` (16 clés) et `PolicyRow` (60 clés), tirés des formes du contrôle fermé du bloc A (`packages/contracts/src/policy-table.ts`) : clés, types JSON, nullabilité, énumérations, motifs numériques (`u_test`, `miss_bound`, `marginal_alpha`, queues en chaînes de comptes, `alpha` de ligne). Les couplages structurels restent au contrôle fermé (le schéma les nomme en description). Contenu exact : Q-C4.
2. **`schemas/tool-error.schema.json`** (neuf ; D9-ter) : le corps 400 de la spec §13, `{error ∈ tool_error | invalid_input | invalid_json, operation, message, code}`, plus `issues` sur `invalid_input` ; `code` dans le catalogue fermé. Contenu exact : Q-C5.
3. **Tests de parité** (`packages/contracts/test/`) : schéma de table ↔ formes du contrôle (clés de `POLICY_ALLOWED_KEYS`, types sondés valeur par valeur) ; `code` du schéma d'erreur ↔ `TOOL_ERROR_CODES`.
4. **`test/contracts-frozen.manifest.json`** : deux entrées neuves ; **`test/contracts-frozen.test.ts`** : compte 7 → 9 (l.71-75) et titre qui nomme D9-ter (m-2 de la G2 de CM-3c-1).
5. **Outil de provenance** `scripts/lib/calib-digest-provenance.mjs` (et `.d.mts`), copie à l'octet de `calibDigest` (plan §5.5, « hors contrat ») ; test de parité avec `calibDigest` de `@monark/contracts` tant qu'il existe ; `scripts/record-usde-calib.mjs`, `scripts/record-u4b-calib.mjs` (et `.d.mts`), `scripts/emit-u4b-calibration.mjs` l'importent à la place de `@monark/contracts` (plan §6 (b)). Zone MONARK.
6. **FIXTURES-GATE-DECISION-GEN-1** : générateur `scripts/gen-gate-decision-fixtures.mjs` (nom proposé ; et `.d.mts`), qui écrit les 9 `fixtures/*.gate-decision.json` et `fixtures/manifest.json` depuis `gate()` de `@monark/hikae` ; test : il **reproduit à l'octet** les 9 fichiers de la base (preuve que le générateur dit la vérité avant de servir en C2). Zone MONARK.
7. **Constante de version dans les tests** : les 42 lignes `"1.0.0"` de `apps/harness/test/` lisent `SCHEMA_VERSION` de `tools/gate.ts`. Refactor pur : à la bascule, une seule ligne change (`gate.ts:62`). Les tests de `packages/hikae` gardent leur paramètre de version (verts à la bascule, mesuré).
8. **Rejeu par projection** (`apps/harness/test/served-decisions-projection.test.ts`, nom proposé) : le jeu d'appels de `served-replay-cm3` réduit à une projection indépendante de la version (`action`, `reason`, région « aucune » ou bornes, `qhat`, `n_calib`, `alpha`), épinglée à la base. En C2 la projection ne bouge pas ; en C' elle ne bouge que sur la liste close des cas B-12, B-13 et B-16 (section 4). C'est l'outil qui prouve « aucune décision servie USDe, liq ou BYO ne change par l'ordre » (plan §3).

Rien de servi : aucun fichier de `src/tools/`, `http.ts`, `openapi.ts`, `schema-projection.ts` ne change ; un schéma neuf sous `schemas/` n'est lu par aucune projection servie (seul `apps/site/app/roadmap/frozen-contracts.ts:33` liste le dossier, page de contenu du site, déployée à T0). Preuve au G7 : empreintes de `/openapi.json`, `tools/list`, `harness-served.json` et des corps de la CA identiques base / gel.

### 3.2 Lot CM-3c-3a (PR C2) : paquet gelé et moteur

- `schemas/coverage-verdict.schema.json` : `schema_version` constante `"1.1.0"` ; `method` + `risk-control` ; `region` = ensemble, intervalle ou `null` ; requis : + `qhat_unit`, `scale`, `scores_sha256`, `cell_key`, `policy_row_sha256`, `policy_table_sha256`, − `calib_digest` (17 champs requis) ; raisons + `calib_silence`, `calib_vetoed`, `calib_retired`, `out_of_support`, `region_degenerate`. `schemas/gate-decision.schema.json` : constante `"1.1.0"`, + `request_sha256` (9 requis), mêmes raisons. `schemas/prediction.schema.json` : motif de version gardé (spec §3), description seule.
- `packages/contracts/src/` : `enums.ts` (5 raisons, `risk-control`) ; `types.ts` (`CoverageVerdict` 1.1.0, `region` nullable, `GateDecision.request_sha256`) ; `closed-check.ts` (clés, et les couplages de la spec §5 : `region = null` ⇔ `qhat = null` ; `region = null` ⇒ `abstain` et raison « sans région » ; `abstain` sur toute raison `calib_*` ; `scale ≠ null` ⇔ `qhat_unit = scale` ; `policy_row_sha256 ≠ null` ⇒ `cell_key ≠ null` ; `cell_key = null` ⇔ `policy_table_sha256 = null` ; `scores` présent ⇒ `scores_sha256 = scoresSha256(scores)`) ; `calib-digest.ts` **retiré** et son export (l'outil de C1 le remplace) ; `index.ts`. Manifeste ré-épinglé dans le même commit.
- `packages/hikae/src/` : `verdict.ts` (`buildVerdict` porte les cinq champs neufs et `scores_sha256` par `scoresSha256` de `@monark/contracts` ; `noRegionVerdict(reason)` remplace l'ensemble vide de `underCalibVerdict`) ; `interval-conformer.ts` ; `l3-gate.ts` (**étape insérée** : nCalib < nMin, toute raison « sans région » et toute raison `calib_*` ⇒ `abstain` avec la raison du verdict ; plan §3, ADR-M011 §7 D6 (b)) ; `index.ts` ; `s2/instrument.ts` (version) et `packages/hikae/test/fixtures.manifest.json` ré-épinglé.
- Tests du lot : couplages du contrôle fermé ; **forme L3 du tueur « a `calib_*` row defers » (C-4)** dans `packages/hikae/test/` ; parité `KATA_REASONS` ⊆ `COVERAGE_REASONS` (C-1 condition 2 ; lit `kata-path.ts` de #141 par import de test seulement).
- **Tête du lot rouge, liste close** (lecture du plan §8.3, Q-M2) : `tsc` et les tests de `apps/harness` et de la racine qui lisent le format, jusqu'à 3c-3b et 3c-3c.

### 3.3 Lot CM-3c-3b (PR C2) : harnais

- `apps/harness/src/tools/gate.ts` : `SCHEMA_VERSION = "1.1.0"` et message de refus (Q-F2) ; `request_sha256` = `requestSha256` de l'enveloppe telle que reçue ; champs du verdict sur les quatre chemins (BYO : `cell_key` et `policy_table_sha256` nuls, `qhat_unit` selon le mode, Q-C1 ; USDe, liq, cascade : clé recherchée, table de la classe) ; **USDe, liq et cascade servis depuis la table** (tables construites au chargement par `marginalClassEntries`, `marginalRow` et `guardMarginalTable` de B2, en échec fermé ; `qhat`, `n_calib`, `alpha`, `scores_sha256` lus sur la ligne admise ; le rang reste `splitQuantile` jusqu'à C') ; jeton `calib_digest=` → `scores_sha256=` de la ligne de résumé ; refus nommé d'une enveloppe non écrivable canoniquement (Q-C2) ; commentaire `gate.ts:275` corrigé (C-3). `kata-path.ts` n'est **pas** importé (sinon les 6 codes kata entreraient dans le graphe servi, C-3) : si `servedPolicyTables` doit servir les trois tables marginales, elle passe dans un module à part (Q-C3).
- `tools/calibrate.ts` (**B-17**) : `scores_sha256` à la place de `set_digest`, par `scoresSha256` ; jeton de résumé `scores_sha256=` ; `schema-projection.ts` (contrat de sortie de `calibrate`), `tools/registry.ts` (commentaire et texte).
- `http.ts` : `message` et `code` sur `invalid_input` (`input_invalid`) et `invalid_json` (`json_invalid`) ; **retrait des deux codes de `PENDING`** dans `apps/harness/test/kata-path.test.ts`, même commit (C-3 condition 3).
- `calibration.ts` : épingles sous la nouvelle définition (`scores_sha256`, ordre `time` pour USDe, `ascending` pour liq, `btc-dir` retiré gardé ou supprimé : relu au code) ; `tools/ukemi-predict.ts:33`.
- Tests : renommages de champs (~60 lignes), régions « sans région » (`numeric_under_calib_region_is_not_directional` inversé), boucle d'audit à trois égalités, test de permutation de `calibrate.test.ts:110` inversé, tests neufs de format servi (section 5), empreinte de 63 caractères (C-11 condition 2), `served-replay-cm3` remplacé par la projection de C1.

### 3.4 Lot CM-3c-3c (PR C2) : surfaces, épingles, instantanés

- `packages/ukemi/src/prediction.ts:13` (version ; zone MONARK, plan §6 (d)) ; `packages/atelier/src/state.ts` (`regionText` sur `region: null`).
- Scripts : `scripts/verify-harness.mjs` (`CA_SCHEMA_VERSION` l.41 avec `gate.ts:62` ; lecteurs l.291, l.362, détail l.366) ; `scripts/sync-ukemi-served.mjs` (l.122, l.131, l.149) ; `scripts/sync-harness-served.mjs` et `scripts/sync-harness-served.d.mts` (Q-SP1-7) ; `scripts/assert-fleet-html.mjs:486` ; `scripts/record-byo-demo.mjs` (réenregistrement).
- Site (chargeurs, pas les pages) : `apps/site/lib/harness-served-load.ts:289-313` (`ByoLoop` : égalité sur `scores_sha256`, `alpha`, `qhat`, même commit que la trace) ; `apps/site/components/sas/sas-audit.ts:14` (indices du `required[]` lu sur `schemas/`) ; `test/narabi-live.test.ts:540-547` (Q-M6).
- **Instantané en attente** : `node scripts/sync-harness-served.mjs --pending` écrit `apps/site/data/harness-pending.json` et pose `pending_since` dans `harness-served.json` ; entrées de `apps/site/data/manifest.sha256.json` ; `PINNED` de `test/harness-served.test.ts` (Q-SP1-6 confirmée). Instantané d'ukemi : par le mécanisme d'UKEMI-PENDING-SNAPSHOT-1 (section 10).
- Régénérés (hors R-25, `fixtures/**/*.json`) : les 9 décisions par le générateur de C1, `fixtures/manifest.json`, `fixtures/byo-demo-trace.json`, `fixtures/h5-e2e-trace.json` ; textes `fixtures/PROVENANCE-byo-demo.md`, `PROVENANCE-h5-e2e-trace.md`, `PROVENANCE-usde.md:75-97` (comptés).
- Tests racine : `byo-demo-builder.ts`, `byo-demo-probe.test.ts`, `h5-trace-builder.ts`, `h5-e2e-probe.test.ts`, `harness-served.test.ts`, `fixtures-root.test.ts`, `verify-harness-liq.test.ts`, `sas-audit.test.ts`, `site-ukemi.test.ts` (trois littéraux), `test/ci-gates.test.ts:853-855` (12 → 17, 8 → 9, 5 inchangé) et, si la mesure le demande, la liste fermée de `frozen_contract_fields_stay_dynamic` (champs neufs `scale`, `cell_key`…, Q-M14).
- `apps/harness/README.md:34,90`.

### 3.5 Lot CM-3c-4 (PR C')

- **B-12** : `splitRankShortest(n, alpha: number)` et `splitQuantileShortest(scores, alpha, nMin)` dans `packages/hikae/src/l1-split.ts` (lecteur `String(alpha)`, grammaire de `Number::toString`, rationnel exact, rang en entiers ; plan §7) ; branchés sur BYO (`gate.ts:454`), USDe (`:596`), liq (`:657`), `interval-conformer.ts:84` et `calibrate.ts:165` ; `splitQuantile` reste exporté, inchangé.
- **B-13** : bords additifs tirés du test du score (`hi` = plus grand double avec fl(hi − ŷ) ≤ q̂, `lo` = plus petit avec fl(ŷ − lo) ≤ q̂, bissection sur les motifs binaires, spec §8) dans `packages/hikae/src/region.ts` ; USDe, BYO intervalle, cascade ; **la phrase B-7 du texte servi USDe est retirée** (`STABLE_RUN_COMMITTED_CORE`, `gate.ts:127-129`).
- **B-16** : `buildIntervalRegion` et la ligne NDG-1 de `l3-gate.ts:127` rendent `region_degenerate` (ADR-M011 §7, ADR-M002 l.145 et l.266, déjà en place).
- **OPENAPI-ERROR-CODE-1** (`apps/harness/src/openapi.ts`) : la réponse 400 décrit `{error, operation, message, code}` avec le catalogue, la 500 `output_invalid` (spec §13 ; ADR-CM amendement « 2026-10-04 (1) »).
- **S-8 (B-8)** : le texte d'honnêteté liq est tiré de la ligne résolue : phrase calibrée pour s0 seulement, texte de classe (`under_calib`) pour s1 à s3 ; `honestyText` reçoit la case résolue (`tools/registry.ts`).
- `canonicalRow` de `packages/hikae/src/canonical-row.ts` devient la réexportation de `canonicalJson` (Q-4 du G0 de CM-3c-1 ; seule différence : la clé non ASCII, refusée désormais).
- Instantanés en attente réécrits par `--pending` (`pending_since` gardé).

## 4. Changements servis (liste fermée)

Contre le servi actuel (déploiement de l'étape 4, `harness-served.json` `77d7b914…`). Rien n'est déployé avant T0 (ADR-PUBLIC-CADENCE-1 §17) ; ces octets ne sont servis qu'à T0.

| # | Ligne | PR | Après |
|---|---|---|---|
| 1 | B-11 amendée | C2 | `schema_version` `"1.1.0"` pour les trois formats ; toute prédiction 1.0.0 rend 400 `schema_version_unsupported` (message : Q-F2) ; verdict 1.1.0 (17 champs requis, `region: null` à la place de l'ensemble vide « sans région », `qhat_unit`, `scale`, `scores_sha256` à la place de `calib_digest`, `cell_key`, `policy_row_sha256`, `policy_table_sha256`) ; décision avec `request_sha256` ; corps 400 `invalid_input` et `invalid_json` avec `message` et `code` (`input_invalid`, `json_invalid`) ; jeton de résumé `scores_sha256=` ; schémas projetés de `tools/list` et `/openapi.json` (entrée et sortie de `gate` et `calibrate`) |
| 2 | B-11 amendée, P-5 | C2 | liq : `cell_key` = `${UKEMI_LIQ_PREDICTOR_BASE}/s${k}` rend visible que le `predictor_id` de l'appelant n'entre pas dans la recherche (aucun comportement neuf) |
| 3 | B-17 | C2 | `calibrate` rend `scores_sha256` (ordre de l'appelant) à la place de `set_digest` ; jeton `set_digest=` → `scores_sha256=` |
| 4 | B-12 | C' | rang exact sur BYO, USDe, liq et `calibrate` ; aucun changement sur les classes engagées (USDe (613 ; 0,1) → 553 ; liq (170 ; 0,01) → 170) ; BYO et `calibrate` changent sur les couples où le rang flottant diffère (3 251 couples sur la grille à 4 décimales, plan §5.5) ; aucun refus neuf |
| 5 | B-13 | C' | bords additifs du test du score (USDe, BYO intervalle) ; phrase B-7 retirée du texte USDe (description et `content`) |
| 6 | B-16 | C' | largeur nulle : `region: null`, raison `region_degenerate` (verdict et L3) au lieu de `under_calib` |
| 7 | S-8 (B-8) | C' (Q-M13) | texte liq des strates s1 à s3 en `under_calib` : texte de la classe, plus la phrase calibrée |
| 8 | OPENAPI-ERROR-CODE-1 | C' | `/openapi.json` décrit `code` du 400 et le 500 `output_invalid` |
| 9 | B-11 amendée, Q-C2 (ajout du 2026-10-05) | C2 (3c-3b) | une enveloppe `gate` non écrivable canoniquement (I-JSON, RFC 7493) rend **400 `param_invalid`** au lieu de **200** : surrogate isolée dans une chaîne libre (`intent`, `tool`, `yhat` chaîne en mode ensemble) ; littéral numérique hors binary64 (`1e400`) sur `yhat` ou `intent` (aujourd'hui `non_evaluable`, ou écho, par exemple `intent: null`). Conversion de la seule `RangeError` de `requestSha256`, au calcul de `request_sha256`, après tous les contrôles existants (`scores` `[1e400]` reste `byo_calibration_invalid` ; `tau` `1e400` reste `param_invalid` ; `yhat` `"\ud800"` en intervalle reste `byo_yhat_type`) ; `calibrate` `[1e400]` → `calibrate_input_invalid`. Aucun code neuf. **Précondition** : la ligne de la liste fermée de l'ADR-CM, portée par la PR de documentation de l'amendement 9 et validée là par MONARK **avant le code de C1** (P-10 ; liste r4, ligne 21) ; une phrase de NOTICE-1-1-0 dans le brouillon de RECHERCHES (Z-4) |

**Ne change pas** : l'ordre de décision L3 (plan §3) ; la description kata (bloc D) ; les contrats d'attestation (`AttestedPrice`, `AttestedFlow`, `AttestedBook` restent en 1.0.0 : `packages/monark/src/adapter-*.ts`, `apps/sentinel/src/flow.ts:50`, `scripts/record-usde-calib.mjs:57`) ; les pages du site (servi jusqu'à T0, décision Q-SP1-2) ; `HARNESS_VERSION` (acte de MONARK à T0).

## 5. Tueurs par ligne B (forme fermée, adresses fixées au gel)

| Ligne | Test | Mutant tué |
|---|---|---|
| B-11 | couplages du contrôle fermé (verdict construit à la main, sept cas) | `SDL` de chaque couplage (`region`/`qhat`, `scale`/`qhat_unit`, `cell_key`/`policy_table_sha256`, `abstain` des `calib_*`) |
| B-11 | refus d'une prédiction 1.0.0, parité `CA_SCHEMA_VERSION` | `CONST "1.1.0" -> "1.0.0"` (`gate.ts:62`) ; tueur existant de `verify-harness.mjs:41` |
| B-11 | `request_sha256` = sha256 de l'enveloppe envoyée, avec et sans `attested` | `CONST` : empreinte de `prediction` seule |
| B-11 | `scores_sha256` USDe dans l'ordre `time` | `CONST` : empreinte d'une copie triée (tueur d'A-2 §5) |
| B-11 | verdicts USDe, liq, cascade, BYO : `cell_key`, `policy_row_sha256`, `policy_table_sha256` | `CONST` : `cell_key` liq = `predictor_id` de l'appelant |
| B-11, C-4 | L3 : verdict `{up, down}`, q̂ 1, `tau` 1, horloge ouverte, raison `calib_silence` ⇒ `abstain calib_silence` | `SDL` de l'étape `calib_*` ⇒ `defer set_too_large` |
| B-11 | corps 400 avec `code` ; `PENDING` sans `input_invalid` ni `json_invalid` ; empreinte de 63 caractères ⇒ 400 `input_invalid` (HTTP), erreur sans code (MCP) | `SDL` du `code` de `invalid_input` |
| B-11 | parité schéma ↔ forme (`policy-row`, `tool-error`) | `CONST` d'une clé ; `CONST` d'un code |
| D9-ter | `contracts_frozen` | modifier un fichier du paquet gelé sans ré-épingler ⇒ rouge (mutant nommé de D9-ter) |
| B-17 | boucle d'audit : `scores_sha256`, `alpha`, `qhat` égaux, ou deux `under_calib` ; permutation : empreinte changée, q̂ gardé | `CONST` : `scoresSha256` d'une copie triée dans `calibrate.ts` |
| B-12 | les quatre tueurs du plan §7 : (50 ; 0,12345) → rang 45, jamais `under_calib` ; (24 ; 0,44) → 14 ; (9 ; 0,70) → 3 ; (10 ; 1e-7) → 11 > n ⇒ `under_calib`, pas 400 | lecteur `parseAlpha` (4 décimales) ; rang flottant |
| B-13 | bords d'un vecteur où fl(ŷ + q̂) diffère du bord du test d'un ulp | `ROR` du comparateur de la bissection |
| B-16 | USDe, BYO intervalle et L3 à largeur nulle | `CONST "region_degenerate" -> "under_calib"` à chaque site |
| S-8 | appel liq en s1 : texte de classe ; en s0 : phrase calibrée | texte choisi sur la présence au registre (l'ancien critère) |
| OPENAPI | réponse 400 du document : `code` égal au catalogue | `CONST` : un code retiré |
| LIQ-BAND-EXACT-GUARD-1 | une ligne s3 forgée de même q̂ refusée au chargement servi | `SDL` de l'appel à `guardMarginalTable` au chargement |
| B-11, Q-C1 (2026-10-05) | quatre verdicts BYO (intervalle et ensemble, servis et `under_calib`) : `qhat_unit` du mode, `scale` nul | `CONST "label" -> "score"` sur la branche intervalle |
| B-11, Q-C2 (2026-10-05) | cinq vecteurs I-JSON (HTTP et MCP) ⇒ 400 `param_invalid` ; refus existants gardent leur code ; trois paires de même `request_sha256` | `SDL` de la conversion (500 revient) ; `ROR` qui convertit toute exception |

## 6. Ré-épinglages

**Sous D9-ter (seul le bloc C le peut)**, chacun dans le commit de son changement :

| Épingle | C1 (3c-2) | C2 (3c-3a) |
|---|---|---|
| `test/contracts-frozen.manifest.json` : `schemas/policy-row.schema.json` | entrée neuve | — |
| idem : `schemas/tool-error.schema.json` | entrée neuve | — |
| idem : `schemas/coverage-verdict.schema.json`, `gate-decision.schema.json`, `prediction.schema.json` | — | ré-épinglées |
| idem : `packages/contracts/src/enums.ts`, `types.ts`, `closed-check.ts`, `index.ts` | — | ré-épinglées |
| idem : `packages/contracts/src/calib-digest.ts` | — | entrée retirée |
| idem : `packages/contracts/src/policy-table.ts` | — | seulement si ENGINE-ROW-RETIRE-PATH-1 fixe une autre preuve de retrait (Q-M10) ; sinon inchangée |
| `test/contracts-frozen.test.ts` : compte des schémas | 7 → 9 (et titre D9-ter) | — |

Inchangés : `attested-*.schema.json`, `forbidden-keys.json`, `canonical.ts`, `tool-error-codes.ts` (32 codes du bloc A), `forbidden-keys.ts`, `region.ts`, `serialize.ts` (sauf si `serializeVerdict` doit suivre le contrôle : relu au code). Aucune colonne de `ClassEntry` n'entre (C-9, section 11).

**Autres épingles régénérées** (pas sous D9-ter) : `fixtures/manifest.json` (générateur) ; `packages/hikae/test/fixtures.manifest.json` (S2) ; `apps/harness/src/calibration.ts` (empreintes USDe et liq) ; `apps/site/data/manifest.sha256.json` (`harness-served.json`, `harness-pending.json`, et les instantanés d'ukemi) ; `PINNED` de `test/harness-served.test.ts` ; `test/ci-gates.test.ts:853-855` ; indices de `sas-audit.ts` ; projection de C1 (en C' seulement, sur la liste close des cas B-12, B-13, B-16). Le recensement ancien → nouveau, épingle par épingle, part au G7 de C2 (acte 1).

## 7. Tests inversés ou régénérés

- Inversés : `calibrate.test.ts:110` (permutation) ; `gate_byo_audit_calib_digest_closes_the_loop` (trois égalités) ; `numeric_under_calib_region_is_not_directional` (plus d'ensemble vide) ; en C' : `gate_byo_interval_degenerate_calibration_is_under_calib_M011`, `gate_byo_interval_float_absorption_is_under_calib_M011`, `gate_stable_run_ndg1_zero_width_is_under_calib_reused`, `packages/hikae/test/interval-nondegenerate.test.ts`, la ligne NDG-1 de `l3.test.ts`, `usde_band_edges_within_half_ulp_stated_and_band_unchanged` (B-13).
- Remplacé : `served-replay-cm3` (empreinte 1.0.0) par la projection de C1.
- Régénérés : les 59 rouges de la simulation (version), les 6 de la racine, les traces BYO et H5, les 9 décisions, `fixtures-root.test.ts` (`calibDigest` → `scoresSha256`), `narabi-live.test.ts:540-547`, `verify-harness-liq.test.ts`, `sas-audit.test.ts`, les tests de `packages/contracts` (`fixtures.ts`, `calib-digest.test.ts` déplacé avec l'outil), `contracts-integration.test.ts`, `tracker.test.ts`, `cm3b-engine.test.ts` (`canonicalRow`, C').

## 7 bis. Ce que le bloc D attend du paquet gelé (C-1 condition 2)

Les 5 raisons (`calib_silence`, `calib_vetoed`, `calib_retired`, `out_of_support`, `region_degenerate`) ; les 5 champs neufs du verdict (`cell_key`, `policy_row_sha256`, `policy_table_sha256`, `qhat_unit`, `scale`) ; `region: null` ; `method: risk-control` ; `request_sha256` ; les 32 codes (bloc A) ; `PolicyRow` et `ClassEntry` (bloc A, `retire` sauf Q-M10) ; **aucune colonne de `ClassEntry` issue de C-9**. Parité `KATA_REASONS` ⊆ `COVERAGE_REASONS` en 3c-3a ; D supprime `KATA_REASONS`.

## 8. Préconditions

- **P-1. #141 fusionnée** sur la base (`PENDING` de `kata-path.test.ts`, `KATA_REASONS`, `servedPolicyTables`) ; ce G0 est alors rebasé, et le code part de la nouvelle tête. État : PR ouverte, fusion annoncée par MONARK. **État 2026-10-05 : rempli** (`87f6081c`, oracle vert, 2 311 tests, 0 échec) ; G0 fusionné avec la base.
- **P-2. Actes M-5 de MONARK** :
  - §1 (ADR-M001 D9-ter, `docs/adr/ADR-M001-phase0-depot-langage-contrats.md:242`) et §2 (ADR-PUBLIC-CADENCE-1 §17, l.420) : **en place** à `e6dc5542` ;
  - **§3, avant le G0 de 3c-2** : **en place** (ADR-M011 §7, `ADR-M011-interval-non-degenerescence.md:189` ; ADR-M002 l.145 et l.266) ;
  - actes restants nommés par l'amendement 9, **non faits** : ADR-M001 Décision 4 et C5 (`calib_digest`), ADR-M005 K-4 (c) (l.100, `"1.0.0"`), ADR-M007 B-7 (l.38, l.40, l.76, `set_digest`), ADR-M010 l.38 et l.139, `CONTRIBUTING.md:56-57`. Échéance proposée : avant la fusion de C2 (Q-M7). **État 2026-10-05** : Q-M7 répondue (« je les applique avant la fusion de C2 ») ; textes rédigés dans la pièce `recherches:coordination/pieces/2026-10-05-bloc-C-textes-ADR/TEXTES-ADR-bloc-C.md` (sha256 dans son `SHA256SUMS`), ancres à `87f6081c` ; à appliquer par MONARK **avant la fusion de C2** ; ne bloque pas C1.
- **P-3. ADR-CM-AMEND-3-1** : l'amendement 9 (« 2026-10-04 (3) », B-11 amendée, B-17, items), base des lignes servies de C2, **n'est ni sur la base ni au tronc** (dernier amendement : « 2026-10-04 (2) », l.219). PR de documentation (étape 7 du plan §8.1), avec les lignes datées que ce G0 ajoute (Q-M8), avant le code de C1. **État 2026-10-05** : Q-M8 répondue ; PR de documentation rédigée sur la branche `recherches/adr-cm-amendement-9` (depuis `87f6081c`, fichier `docs/adr/ADR-CM-chantier-moteur-audit-P3.md`, même octets à la base et au tronc), poussée sans PR : texte r3 §2 à l'octet, puis huit lignes datées du 2026-10-05 (Q-F3 close ; D = 7 jours ; découpe C1, C2, C' ; B-8 en C' ; refus I-JSON de Q-C2 ; go Q-F1 ; go Q-F2 ; items LATE-CALL-WINDOW-1 et UKEMI-PENDING-SNAPSHOT-1). La lecture de D9-ter (Q-M1) et la ligne Z-3 (Q-M12) restent des lignes de MONARK, non dupliquées. **Contrôle de MONARK avant le code de C1.**
- **P-4. Ouvertures de zone** (par nom et durée ; Q-M3) :

  | Fichiers | Lot | Durée |
  |---|---|---|
  | `test/contracts-frozen.manifest.json`, compte et titre de `test/contracts-frozen.test.ts` | C1, C2 | ouverte depuis A « jusqu'à la fusion du bloc C » : à lire jusqu'à la fusion de C2 |
  | `scripts/lib/calib-digest-provenance.mjs` (et `.d.mts`, test), `scripts/record-usde-calib.mjs`, `scripts/record-u4b-calib.mjs` (et `.d.mts`), `scripts/emit-u4b-calibration.mjs` | C1 | jusqu'à la fusion de C1 |
  | `scripts/gen-gate-decision-fixtures.mjs` (et `.d.mts`, test), `fixtures/*.gate-decision.json`, `fixtures/manifest.json`, `fixtures/PROVENANCE-fixtures-root.md` | C1, C2 | jusqu'à la fusion de C2 |
  | `packages/ukemi/src/prediction.ts` (l.13 seulement) | C2 (3c-3c) | jusqu'à la fusion de C2 |
  | `packages/atelier/src/state.ts` et `packages/atelier/test/atelier.test.ts` | C2 (3c-3c) | idem |
  | `scripts/verify-harness.mjs`, `scripts/sync-ukemi-served.mjs` (et `.d.mts`), `scripts/sync-harness-served.mjs` et `scripts/sync-harness-served.d.mts`, `scripts/assert-fleet-html.mjs:486`, `scripts/record-byo-demo.mjs` | C2, C' | jusqu'à la fusion de C' |
  | `apps/site/lib/harness-served-load.ts`, `apps/site/components/sas/sas-audit.ts`, `apps/site/data/harness-pending.json` (neuf), `apps/site/data/harness-served.json` (clé `pending_since` seule), `apps/site/data/manifest.sha256.json` | C2, C' | idem |
  | `fixtures/byo-demo-trace.json`, `fixtures/h5-e2e-trace.json`, `fixtures/PROVENANCE-byo-demo.md`, `PROVENANCE-h5-e2e-trace.md`, `PROVENANCE-usde.md` | C2 | jusqu'à la fusion de C2 |
  | `test/byo-demo-builder.ts`, `test/byo-demo-probe.test.ts`, `test/h5-trace-builder.ts`, `test/h5-e2e-probe.test.ts`, `test/harness-served.test.ts`, `test/narabi-live.test.ts` (l.540-547), `test/fixtures-root.test.ts`, `test/verify-harness-liq.test.ts`, `test/sas-audit.test.ts`, `test/site-ukemi.test.ts` (trois littéraux), `test/ci-gates.test.ts` (l.853-855 et, si mesuré, la liste fermée de `frozen_contract_fields_stay_dynamic`) | C2, C' | jusqu'à la fusion de C' |

- **P-5. SERVED-PENDING-1** : **fusionnée** (#132, `7a0b1a49`) ; Q-SP1-6 confirmée par MONARK (`pending_since` arrive avec le bloc C, nom `monark-site-harness-pending-v1`) ; **Q-SP1-7 sans réponse** (trois déclarations dans `scripts/sync-harness-served.d.mts`, Q-M9) ; m6 réglé par UKEMI-PENDING-1 (`CA_SCHEMA_VERSION`, changée avec `gate.ts:62`). **État 2026-10-05** : Q-M9 répondue (oui, défaut) : Q-SP1-7 tranchée, trois déclarations dans `scripts/sync-harness-served.d.mts` en C2.
- **P-6. UKEMI-PENDING-SNAPSHOT-1** fusionné sur la base avant C2 (section 10, Q-M5). **État 2026-10-05** : Q-M5 répondue (oui) : lot à part sur la base, **avant C2**, zone de Q-UP-1 rouverte sur les fichiers nommés jusqu'à sa fusion ; prix noté ~405. Ne bloque pas C1.
- **P-7. Textes et sources des trois tables marginales** (USDe, liq, cascade) fixés par la ligne datée de MONARK (Z-3) avant le code de C2, et go du fondateur sur leur publication (Q-M12, Q-F1). **État 2026-10-05** : **go du fondateur Q-F1 donné** (verbatim « Oui, ces 3 tables (Recommandé) ») ; Q-M12 répondue : textes = phrases servies à l'octet, `source` = provenance déjà publique ; empreintes UTF-8 relevées par MONARK à `87f6081c` (message `92efa2a`, abrégées) : `STABLE_RUN_COMMITTED_SENTENCE` 926 octets `84be45f0…e767a6`, `STABLE_RUN_UNCALIBRATED_SENTENCE` 100 octets `8ecfa679…0f53ff`, `LIQ_COMMITTED_SENTENCE` 482 octets `adaa0118…f4a39f`, `LIQ_EMPTY_REGISTRY_SENTENCE` 110 octets `94f90557…b06830`, `CASCADE_UNCALIBRATED_SENTENCE` 82 octets `2f95bc28…c33deb`. **Reste** : la ligne datée Z-3 de MONARK, empreintes complètes, au journal du tronc (prochain commit de docs), **avant le code de C2** ; C' l'ajuste par une seconde ligne (S-8, B-13). Relation `content` ↔ `text` : **tranchée par MONARK** (section 14.6, point 2).
- **P-8. Classe cascade `additive-band`** : contrôlée par MONARK à ce G0 (G0 de B2, « Pli de la G2 », dernière puce ; ligne r4 4 : « avant que le bloc C publie l'entrée de classe ») (Q-M11). **État 2026-10-05 : contrôlée** (Q-M11 : `cascadeVerdict`, `gate.ts:531` à `87f6081c`, appelle `conformInterval` ; entrée `additive-band`, `interval`, `qhat_unit: label` ; `calib: []`, verdict `under_calib`, table sans ligne).
- **P-9. Révision r4 des pièces** (lignes 4 et 17 au moins) écrite par RECHERCHES avant le G7 de C2 (Q-M15). **État 2026-10-05** : Q-M15 répondue (oui) ; la liste r4 porte maintenant les lignes 18 à 26 (décision Q-C, go Q-F1 et Q-F2).
- **P-10 (ajout 2026-10-05). Ligne de l'ADR-CM pour le refus I-JSON de Q-C2** (section 4, ligne 9 ; liste r4, ligne 21) : portée par la PR de documentation de l'amendement 9, **à la liste fermée des changements servis** (§5, ligne ajoutée sous B-11 amendée, ligne datée 2026-10-05 (5)), **validée par MONARK là, avant le code de C1** (section 14.6, point 1) ; phrase de NOTICE-1-1-0 dans le brouillon de RECHERCHES (Z-4), publication au go F-5a.
- **P-11 (ajout 2026-10-05). Ligne Z-3 de MONARK** (empreintes complètes des cinq phrases, `source`) au journal du tronc, avant le code de C2 (Q-M12) ; et la ligne de MONARK sous D9-ter (lecture de Q-M1), au prochain commit de docs du tronc.

## 9. R-25 (estimation, `r25()` contre la base de chaque PR)

| Lot | Postes | Code | Tests | Total |
|---|---|---|---|---|
| 3c-2 (C1) | schéma de table ~150, schéma d'erreur ~55, manifeste et compte ~8, outil de provenance ~45, générateur ~70, constante de version ~45, projection ~55 | ~330 | ~210 | **~540** |
| 3c-3a (C2) | schémas ~51, `contracts` ~172 (dont `calib-digest.ts` retiré), `hikae` ~70 | ~295 | ~50 | **~345** |
| 3c-3b (C2) | `gate.ts` ~110, `calibrate.ts` ~20, `http.ts` ~6, `calibration.ts` ~20, projection et registre ~15 | ~170 | ~250 | **~420** |
| 3c-3c (C2) | scripts ~25, chargeurs du site ~20, `ukemi` et `atelier` ~4, instantané en attente ~134, `PROVENANCE-*.md` ~10, tests racine ~105 | ~195 | ~105 | **~300** |
| 3c-4 (C') | B-12 ~105, B-13 ~85, B-16 ~40, OPENAPI ~60, S-8 ~60, `canonicalRow` ~60 | ~180 | ~230 | **~410** |

| PR | Total | Borne |
|---|---|---|
| C1 | ~540 | 547 (lot) et 1 205 |
| C2 | ~1 065 | 1 205 |
| C' | ~410 | 547 et 1 205 |

- Incertitude déclarée : ±25 % (recensement, pas de code). Le plan estimait ~960 pour C et ~250 pour C'.
- **Coupes nommées si la mesure au gel dépasse** :
  - 3c-2 > 547 : la projection (~55) passe en 3c-3b ;
  - C2 > 1 205 : les corps 400 avec `code` et leurs tests (~45) passent en C' (le schéma d'erreur de C1 les décrit déjà) ;
  - 3c-4 > 547 : `canonicalRow` (~60) sort du chantier 1.1.0 (aucun octet servi).
- Si MONARK exclut les instantanés en attente du compte R-25 (Q-M4), C2 gagne ~134 lignes de marge.
- **Réestimation du 2026-10-05** (après Q-M4 et la décision Q-C1 à Q-C5) :
  - Q-M4 : **compter** (`ci.yml:82` inchangé) ; la marge de ~134 n'existe pas.
  - **C1 (3c-2) : ~540 + ~45 = ~585**, au-dessus de 547 : sondes clé par clé et liste d'écarts du schéma de table (Q-C4, conditions 2 et 3), union à trois branches et `$defs/InternalError` du schéma d'erreur, parité 29 + 3 = 32 (Q-C5, condition 1). **La coupe nommée devient probable** : la projection (~55) passe en 3c-3b, et C1 revient à ~530. Le G0 court de 3c-2 la déclare, ou la mesure au gel la rend inutile.
  - **C2 : ~1 065 + ~25 (Q-C2 : conversion, cinq vecteurs HTTP et MCP, vecteurs d'empreinte, test `canonicalJson(JSON.parse(corps))`) + ~10 (Q-C1 : quatre verdicts BYO) + ~55 (projection reçue de C1) = ~1 155**, sous 1 205 ; marge ~50. Q-C3 (`servedMarginalTables` dans un module à part) est à coût constant (code déplacé de `kata-path.ts`, compté une fois). Si la mesure au gel dépasse, la coupe nommée de C2 (corps 400 avec `code`, ~45, vers C') s'applique, avec la condition 6 de Q-C5.
  - C' : ~410, inchangé.

## 10. Items fermés ou déclenchés

| Item | Effet de ce bloc |
|---|---|
| **UKEMI-PENDING-SNAPSHOT-1** | **Déclenché.** Critère rempli : C2 change l'empreinte C5 de la strate engagée (`digestPinned` de `calibration.ts`, lu par `test/site-ukemi.test.ts:1204`) en passant à `scores_sha256`, et C' change la clause liq (S-8). Lot à part, sur la base avant C2, au dessin du G0 d'UKEMI-PENDING-1 §4 (prix ~405) ; zone de Q-UP-1 à rouvrir (Q-M5). |
| **OPENAPI-ERROR-CODE-1** | fermé par C' (une seule nouvelle empreinte d'`openapi.json` avec la bascule, ADR-CM « 2026-10-04 (1) ») |
| **FIXTURES-GATE-DECISION-GEN-1** | générateur en C1 (reproduit la base à l'octet), régénération en C2 ; fermé au G7 de C2 |
| **LIQ-BAND-EXACT-GUARD-1** | clé fixée (`${UKEMI_LIQ_PREDICTOR_BASE}/s${k}`, plan §5.3 ; garde `assertLiqBandExact` de B2) ; **fermé par C2**, quand le chemin servi charge ses lignes liq par `guardMarginalTable` en échec fermé (ETAT : « au chargement d'une calibration liq ») |
| **S-8 (B-8)** | porté par ce G0 dans la liste fermée (section 4, ligne 7) ; fermé par C' (ou D, Q-M13) |
| **Ligne cascade (r4, 4)** | l'entrée de classe cascade `additive-band` est servie (son `policy_table_sha256`) dès C2 : contrôle de MONARK et ligne r4 avant C2 |
| SERVED-PENDING-1 | utilisé : premier `--pending` en C2 |
| C-3 condition 3 | `input_invalid` et `json_invalid` quittent `PENDING` en 3c-3b |
| C-4 | forme L3 en 3c-3a |
| C-9 / LATE-CALL-WINDOW-1 | forme conclue (section 11) ; ligne datée de l'ADR-CM à MONARK |
| C-11 condition 2 | test de l'empreinte de 63 caractères en 3c-3b |
| ENGINE-ROW-RETIRE-PATH-1 | dernière fenêtre de `retire` : se ferme à la fusion de C2 |
| CONTRACT-1-1-0, acte 1 | C2 donne le recensement des épingles du dépôt |
| NOTICE-1-1-0 | la liste de la section 4 en est l'entrée « changements servis » |

## 11. Forme de LATE-CALL-WINDOW-1 (C-9, conclusion avant ce G0)

**Constante de la version : 300 s**, lue sur `PRODUCED_AT_FUTURE_TOLERANCE_MS` (même source que B-4), **aucune colonne de `ClassEntry`**. Raisons : la vague 1 n'a que 1h et 4h (fenêtre de 8,3 % et 2,1 % de h) ; une classe plus courte (15m, F-K-5) passe déjà par une révision datée (spec §9) ; aucune mesure de latence des appelants n'existe, et une colonne vide ou fixée à 300 partout ne dirait rien de plus. Conséquence écrite : une borne par classe après la fusion de C2 exigera une nouvelle valeur de `row_format` et un acte d'ADR. La valeur publiée reste due avant F-5a, le code et les vecteurs au lot de D qui sert `produced_at_stale`.

## 12. Questions

Réponses et décisions : section 14 (amendement du 2026-10-05).

### Choix de contrat (pour un advisor, sous la délégation du fondateur ; défaut proposé)

- **Q-C1. `qhat_unit` d'un verdict BYO** (aucune entrée de classe). Défaut : `label` en mode intervalle (bande additive, scores |y − ŷ|), `score` en mode ensemble (spec §8 : « the caller's for a caller-supplied set »). Raison : c'est la seule lecture de la table d'unités de la spec, et elle est fixée par le mode, comme l'unité l'est par la classe ailleurs.
- **Q-C2. Enveloppe non écrivable canoniquement.** `params.intent` et `params.tool` sont des chaînes libres ; une surrogate isolée y passe le schéma, et `requestSha256` la refuse (P-2). Défaut : 400 `param_invalid`, nommé, contrôlé avant toute décision, avec un vecteur. Raison : P-3 (raison vraie : un paramètre de gate invalide), aucun code neuf, jamais un 500 ; `input_invalid` reste le code du schéma.
- **Q-C3. Source des trois tables marginales servies.** Défaut : en C2, `gate.ts` construit les tables USDe, liq et cascade par `marginalClassEntries`, `marginalRow` et `guardMarginalTable` (B2), sans importer `kata-path.ts` ; un test de parité exige que leurs empreintes égalent celles de `servedPolicyTables` pour ces classes. Alternative : déplacer `servedPolicyTables` dans un module neutre servi dès C2 (les 32 tables kata vides entreraient alors au graphe servi avant D). Raison : C-3 (les littéraux kata ne doivent pas entrer au graphe servi avant D) et une seule fonction d'octets pour la publication (C-10).
- **Q-C4. Contenu de `schemas/policy-row.schema.json`.** Défaut : racine = fichier de table `{row_format, class, rows}`, `$defs` `ClassEntry` et `PolicyRow` ; le schéma porte clés, types, nullabilité, énumérations et motifs ; les couplages (ligne marginale, `side`/`bucket`, `retire`/`status`, `scale_table.sha256`…) restent au contrôle fermé et sont nommés en description. Raison : le recalcul (spec §11 point 2) part du fichier de table ; JSON Schema ne dit pas tous les couplages sans les dupliquer de façon fragile ; le compte de 9 schémas de D9-ter tient.
- **Q-C5. Contenu de `schemas/tool-error.schema.json`.** Défaut : le corps 400 seul (spec §13 le nomme ainsi), `code` dans les 31 codes de `TOOL_ERROR_CODES` hors `output_invalid` ; le 500 n'est décrit que dans `/openapi.json` (C') ; `issues` sans forme fermée (forme du SDK, hors version). Raison : un 400 ne porte jamais `output_invalid` ; le corps 500 est hors du schéma d'erreur client.

### Zone et ordre (pour MONARK)

- **Q-M1. Découpe du bloc C en trois PR** (C1, C2, C') et lecture de D9-ter : le ré-épinglage 2 est fait par les lots CM-3c-2 (C1) et CM-3c-3 (C2), deux PR, chacun dans le commit de son changement ; C' ne touche pas le paquet gelé. Défaut : oui (section 1).
- **Q-M2. Têtes de lot rouges dans C2.** 3c-3a et 3c-3b ne peuvent pas être verts seuls (la bascule est atomique). Défaut : liste close des rouges à chaque G7 intermédiaire, oracle = CI de la tête de C2 (plan §8.3, règle 7), red-proof de la PR entière contre sa base au gel de 3c-3c.
- **Q-M3. Ouvertures de zone** du tableau P-4, par nom et durée.
- **Q-M4. Instantanés en attente et R-25.** `harness-pending.json` (~130 lignes) et `ukemi-pending.json` sont des données générées et épinglées au manifeste. Les exclure du pathspec de `ci.yml:82` (acte de MONARK, ADR-M003 D9) ou les compter ? Défaut : compter (la découpe de la section 9 le fait).
- **Q-M5. UKEMI-PENDING-SNAPSHOT-1** : lot à part, sur la base avant C2, zone de Q-UP-1 rouverte (`scripts/sync-ukemi-served.mjs` et `.d.mts`, `apps/site/lib/ukemi-served-load.ts`, `test/site-ukemi.test.ts`, `apps/site/data/ukemi-pending.json`, `ukemi-served.json` pour `pending_since`, manifeste). Défaut : oui.
- **Q-M6. Page Narabi.** Elle affiche l'empreinte USDe calculée par `apps/site/lib/narabi-calib-load.ts` (portage de `calibDigest`) ; c'est un fait servi en 1.0.0 jusqu'à T0. Défaut : la page et son chargeur ne changent qu'à T0 (acte de MONARK) ; C2 repointe seulement `test/narabi-live.test.ts:540-547` sur l'outil de provenance et sur l'épingle en processus.
- **Q-M7. Actes d'ADR restants** (P-2, dernière puce) : avant la fusion de C2 ; RECHERCHES en rédige le texte dans une pièce (comme `TEXTES-ACTES-MONARK.md`). Défaut : oui.
- **Q-M8. ADR-CM.** La PR de documentation de l'amendement 9 (P-3) porte aussi : S-8 comme ligne servie (B-8, C') ; la ligne datée de C-9 condition 1 (trois échéances de LATE-CALL-WINDOW-1) ; la découpe C1, C2, C' (règle R-25 en blocs, l.70) ; UKEMI-PENDING-SNAPSHOT-1. Défaut : RECHERCHES rédige, MONARK contrôle, avant le code de C1.
- **Q-M9. Q-SP1-7** : trois déclarations ajoutées à `scripts/sync-harness-served.d.mts` en C2 (préférence de la G2). Défaut : oui.
- **Q-M10. ENGINE-ROW-RETIRE-PATH-1** : aucune autre forme de preuve de retrait n'est fixée à ce jour. Confirmer avant la fusion de C2, dernière fenêtre ; sinon `retire` est corrigée en C2. Défaut : `retire` du bloc A reste.
- **Q-M11. Classe cascade `additive-band`** (lue sur `cascadeVerdict` → `conformInterval`) : ton contrôle, promis au G0 de C.
- **Q-M12. Textes Z-3 des trois tables marginales** (entrées de classe et lignes) et valeurs de `source` : ligne datée avant le code de C2. Défaut : textes = phrases servies aujourd'hui, à l'octet (`STABLE_RUN_COMMITTED_SENTENCE`, `STABLE_RUN_UNCALIBRATED_SENTENCE`, `LIQ_COMMITTED_SENTENCE`, `LIQ_EMPTY_REGISTRY_SENTENCE`, `CASCADE_UNCALIBRATED_SENTENCE`) ; `source` = provenance déjà publique (fichiers de `fixtures/` et enregistreurs, avec leurs sha256 déjà versées). C' ajuste le texte liq (S-8) et retire la phrase B-7 (B-13) par une seconde ligne.
- **Q-M13. Place de S-8** : C' (défaut), plutôt que C2 (R-25) ou D ; même ligne servie.
- **Q-M14. Liste fermée de `frozen_contract_fields_stay_dynamic`** (`test/ci-gates.test.ts`) : des champs neufs au nom commun (`scale`) peuvent toucher des chaînes du site ; je mesure au code et te propose les entrées, sans les écrire hors zone.
- **Q-M15. Échéance de la ligne r4 17** (« avant le G0 du bloc C ») : ce G0 la porte dans sa liste fermée ; la pièce r4 suit avant le G7 de C2. Défaut : cette lecture.
- **Q-M16. Textes publics hors pages** (`skills/monark/SKILL.md`, `DEMO.md`, `INTEGRATION.md`, `README.md:328`, `docs/RUNBOOK-harness.md:169`, `apps/site/lib/sim.ts:25`, `docs/deploy-CA-harness.json`) : à T0, par toi (plan §9.2), pas dans C. Défaut : oui, sauf si un test épingle l'un d'eux contre la trace réenregistrée (mesuré au code, signalé avant).

### Pour le fondateur (publication, textes servis)

- **Q-F1. Publication des trois tables marginales avant F-5a.** C2 sert, et verse dans le dépôt public (code, traces, tests), l'empreinte des tables USDe, liq et cascade. C-10 condition 4 met toute publication de table réelle avant F-5a hors délégation. Défaut proposé : oui pour ces trois tables seulement, parce que tout ce qu'elles contiennent est déjà public (scores et provenance versés, phrases servies) ; les 32 tables kata restent synthétiques jusqu'à F-5a. Sans ce go, C2 ne peut pas servir `policy_table_sha256` sur ces classes.
- **Q-F2. Message du refus 1.0.0.** Le plan §9.2 veut un message qui pointe vers la spécification et la date ; la date (T0) n'existe qu'au go F-5a, après C2. Défaut : en C2, le message nomme la version parlée et le dépôt de la spécification ; la date entre par une ligne au go F-5a. Le texte exact passe par la porte de vocabulaire et la ligne datée de MONARK.

## 13. Plan de preuve rouge et oracle

- **Commits par lot** : G0 (ce fichier pour le bloc ; un G0 court par lot suivant, qui renvoie ici) ; tests rouges ; code (gel) ; G7. Jamais `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` n'est jamais indexé.
- **C1** : `node scripts/red-proof.mjs --base <tête après #141> --gel <gel> --repo /home/user/monark-governance-blc --draw <n> --seed 37` : parités et générateur en F2P ou new-module ; refactor de la constante et projection **verts à la base par construction** (refusés « green at base ») : tueurs appliqués à la main, comme aux G7 de B2 et de CM-4b ; preuve « aucun octet servi » par empreintes base / gel ; mutant D9-ter rejoué.
- **C2** : red-proof de la PR entière contre sa base au gel de 3c-3c ; tests de format F2P (rouges à la base par assertion) ; tueurs de la section 5 ; projection de C1 inchangée (aucune décision servie ne change en C2) ; liste close des rouges de 3c-3a et 3c-3b à leurs G7 ; bloc C simulé du G7 d'UKEMI-PENDING-1 rejoué (0 rouge attendu à la tête).
- **C'** : F2P des vecteurs B-12, B-13, B-16, S-8, OPENAPI ; projection : écarts seulement sur la liste close, chacun nommé par sa ligne B.
- **Toujours** : `verifie-ancres.mjs . --touched <base> HEAD` (0 dérivé, 0 perdu ; ancres déplacées réancrées dans le commit qui les déplace) ; `tsc --noEmit`, `eslint .`, `lint:ratchet`, `gate:vocab`, `lang:gate` (D7 decies couvre `aux_seq`, `runs_aux`, `aux_sha256` dans `policy-row.schema.json`) ; `npm test` complet à 0 rouge (Node 24.21.0, proxy retiré, TMPDIR propre ; test 42 relancé seul s'il est seul rouge) ; R-25 par `scripts/oracle/r25.mjs`.

## 14. Amendement daté du 2026-10-05 : base après #141, réponses de MONARK, décision Q-C1 à Q-C5, go du fondateur Q-F1 et Q-F2

- **Sources** (sha256 des octets LF ; `recherches` à `b0c079c`) :
  - réponses de MONARK : `recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-bloc-C-reponses.md` (commit `92efa2a`, `19de89cc0d0a8512bf5d2f66142b6999794f67c7757800b0feff0e5009e1eb05`) ;
  - décision déléguée : `recherches:coordination/pieces/2026-10-05-bloc-C-avis/DECISION-bloc-C-QC1-QC5.md` (`9d3e6231866bd40f5d8dec5182711c93f6d127c89bbd83222531ab0eb79fc042`), sur l'avis `AVIS-advisor-bloc-C-QC1-QC5.md` (`754f27d4d1919dc9f26cdc56a224da68a781b68d5487889961d30aadb8296bf0`) ;
  - go du fondateur et relais : `recherches:coordination/messages/2026-10-05-RECHERCHES-vers-MONARK-bloc-C-decisions-QF.md` (`5d6aa7bbb0961fc0fae44eb52357f70f6bcc7fabc7643753c8b44c4fe70273e2`) ;
  - liste r4 : `…/2026-10-04-contrat-1-1-0-r4-liste/LISTE-REVISION.md`, lignes 18 à 26.
- **Base** : `87f6081c` (#141), fusionnée dans cette branche (en-tête). Les sections 1 à 13 restent la mesure et les questions telles que posées, sauf les lignes marquées « 2026-10-05 » (en-tête, section 4 ligne 9, section 8, section 9).

### 14.1 Réponses de MONARK (Q-M1 à Q-M16)

| Question | Réponse | Effet |
|---|---|---|
| Q-M1 | **oui, trois PR** (C1, C2, C'). Lecture de D9-ter : ré-épinglage 2 en deux commits, un par lot (CM-3c-2 en C1 : deux schémas neufs, compte 7 → 9 ; CM-3c-3 en C2 : les trois schémas de verdict en 1.1.0) ; C' ne touche pas le paquet gelé ; zone ouverte jusqu'à la fusion de C2 | MONARK écrit cette lecture en ligne datée sous D9-ter (tronc) ; non dupliquée dans l'amendement 9 |
| Q-M2 | oui : liste close des rouges à chaque G7 intermédiaire, oracle = CI de la tête de C2, red-proof de la PR entière au gel de 3c-3c | section 13 inchangée |
| Q-M3 | oui : tableau P-4 ouvert tel qu'écrit, par nom et pour la durée de chaque ligne | P-4 rempli |
| Q-M4 | **compter** (défaut) ; pathspec de `ci.yml:82` inchangé | section 9, réestimation |
| Q-M5 | oui : UKEMI-PENDING-SNAPSHOT-1 lot à part sur la base avant C2, zone de Q-UP-1 rouverte jusqu'à sa fusion | P-6 |
| Q-M6 | oui (défaut) : page Narabi et son chargeur à T0 ; C2 repointe seulement `test/narabi-live.test.ts:540-547` | section 3.4 |
| Q-M7 | oui : RECHERCHES rédige, MONARK applique avant la fusion de C2 | pièce `2026-10-05-bloc-C-textes-ADR/TEXTES-ADR-bloc-C.md` ; P-2 |
| Q-M8 | oui : RECHERCHES rédige la PR de documentation de l'amendement 9 avec ses lignes datées ; MONARK la contrôle avant le code de C1 | branche `recherches/adr-cm-amendement-9` ; P-3 |
| Q-M9 | oui (défaut) : trois déclarations dans `scripts/sync-harness-served.d.mts` en C2 | P-5 |
| Q-M10 | `retire` du bloc A reste ; aucune autre forme de preuve ; la fenêtre ferme à la fusion de C2 | section 6 : `policy-table.ts` inchangé ; section 10 |
| Q-M11 | **contrôlée** : `cascadeVerdict` (`gate.ts:531`) → `conformInterval`, [ŷ − q̂, ŷ + q̂], unité du label ; entrée `additive-band`, `interval`, `qhat_unit: label` ; `calib: []`, verdict `under_calib`, table sans ligne | P-8 ; ligne r4 4 tenue à C2 |
| Q-M12 | oui : textes = phrases servies à l'octet (empreintes abrégées en P-7), `source` = provenance publique ; ligne datée complète de MONARK au journal avant le code de C2 ; seconde ligne en C' (S-8, B-13) | P-7, P-11 |
| Q-M13 | oui : S-8 en C' (bloc C), même ligne servie | section 4 ligne 7 ; ligne datée 2026-10-05 (4) de l'amendement 9 |
| Q-M14 | oui : RECHERCHES mesure et propose les entrées de `frozen_contract_fields_stay_dynamic` ; MONARK les écrit | au G0 court de 3c-3c |
| Q-M15, Q-M16 | oui (défauts) | P-9 ; textes publics hors pages à T0, par MONARK |

### 14.2 Décision déléguée Q-C1 à Q-C5 (avec leurs conditions)

Qualité : décision déléguée (RECHERCHES sur l'avis d'un advisor), sous la délégation du fondateur, verbatim « pour les choix que tu me demandes, lances des advisors spécialisés et décidez ». Ce n'est pas un go du fondateur.

- **Q-C1, défaut retenu** : `qhat_unit` BYO fixé par le mode, `label` en `interval`, `score` en `set` ; `scale` toujours nul sur le BYO. Conditions : spécification r4 §5 et §8 (« on a caller-supplied calibration, fixed by its mode » ; un même `task_class` BYO peut porter deux unités ; ligne r4 18) ; tueur en 3c-3b : quatre verdicts BYO (intervalle et ensemble, servis et `under_calib`), `qhat_unit` attendu et `scale` nul, mutant `CONST "label" -> "score"` sur la branche intervalle (le contrôle fermé ne le tue pas).
- **Q-C2, défaut retenu sur le code, élargi à I-JSON** : 400 `param_invalid` pour une **surrogate isolée** dans une chaîne libre **et** pour un **littéral numérique hors binary64** (`1e400`). **Changement servi 200 → 400** : section 4, **ligne 9**, avec la ligne datée de l'ADR-CM de MONARK pour précondition (P-10). Conditions :
  1. lieu : au calcul de `request_sha256`, après tous les contrôles existants ; seule une `RangeError` de `requestSha256` est convertie (les refus existants gardent leur code : `scores` `[1e400]` → `byo_calibration_invalid` ; `tau` `1e400` → `param_invalid` ; `yhat` `"\ud800"` en intervalle → `byo_yhat_type`) ;
  2. vecteurs HTTP et MCP, chacun 400 `param_invalid` : `intent` `"\ud800"` ; `tool` `"\udc00x"` ; `intent` `1e400` ; `yhat` `1e400` en BYO intervalle ; `yhat` `"\ud800"` en BYO ensemble ; vecteurs d'empreinte : `-0` et `0`, `1.0` et `1`, `0.10000000000000001` et `0.1` donnent la même `request_sha256` ;
  3. test : `request_sha256` = sha256 de `canonicalJson(JSON.parse(corps))` ;
  4. tueurs : `SDL` de la conversion (le 500 revient) ; `ROR` qui convertit toute exception (les vecteurs de la condition 1 rougissent) ;
  5. ligne datée de l'ADR-CM sous B-11 amendée (rédigée : amendement 9, ligne datée 2026-10-05 (5)) et phrase de NOTICE-1-1-0 ;
  6. `calibrate` : `scores` `[1e400]` → `calibrate_input_invalid` avant `scoresSha256`.
  Lignes r4 19 à 21. Tueurs ajoutés à la section 5 (lot 3c-3b).
- **Q-C3, variante du défaut** : une fonction `servedMarginalTables` dans son propre module du harnais (nom proposé `apps/harness/src/policy-served.ts`), importée par `gate.ts` en C2 et appelée par `servedPolicyTables` (`[...tables kata, ...servedMarginalTables(texts)]`, triées) : égalité par construction ; aucun code kata au graphe servi avant D. Conditions : le module n'importe ni `kata-path.ts`, ni `policy-classes.ts`, ni `policy-guard.ts`, ne porte aucun littéral de code, et `kata_path_is_not_served` liste exactement les modules `policy-*` servis ; tables construites une fois au chargement, en échec fermé ; empreinte synthétique de `kata-path.test.ts` (`d32cf528…`) inchangée (preuve du déplacement) ; textes et `source` en un seul paramètre défini dans un seul module, valeurs de la ligne Z-3 ; relation `content` ↔ `text` testée en C2 sur USDe et cascade, écart liq s1 à s3 nommé en liste close et fermé en C' ; G7 honnête : sur une table construite en processus, la comparaison de lignes de `guardMarginalTable` est une tautologie, les contrôles effectifs sont `assertPolicyTableFile` et `assertLiqBandExact` (LIQ-BAND-EXACT-GUARD-1 fermé par ce dernier) ; subordonnée à Q-F1 (donné). **Le module neuf entre au graphe servi : à signaler au contrôle par diff de C2.** Ligne r4 22. Remplace la puce `kata-path.ts` de la section 3.3.
- **Q-C4, défaut retenu, avec un critère** : le schéma porte ce qui se dit d'une clé seule (type, nullabilité, énumération, motif, bornes entières) ; tout couplage reste au contrôle fermé et est nommé en description. Racine `{row_format, class, rows}`, `$defs` `ClassEntry` (16), `PolicyRow` (60), `VetoBlock` ; `additionalProperties: false` ; toutes les clés `required` ; une seule convention de nullabilité ; entiers bornés à 9007199254740991 (`calib_attempt` 1 à 4, `tau_cap` 1 ou null) ; motifs exacts du contrôle ; `dec` en sur-ensemble déclaré ; en-tête 2020-12, `$id` `https://monark.local/schemas/policy-row.schema.json`, `title` `PolicyTable`, aucun `examples` ni `default` réel. Conditions : tout document admis par le contrôle est valide pour le schéma (corpus B1, B2, 35 tables synthétiques, une ligne par statut et par `region_rule`) ; parité clé par clé sur les 76 clés ; **liste fermée des écarts** épinglée (`dec` exact `-0` et `0.10000000000000001`, `strata_cuts` croissantes, `scale_table.sha256`, couplages de Q-1 condition 1, règles de fichier, surrogate isolée) ; tueurs `CONST` d'une clé, d'une énumération, motif `u_test` à 6 décimales, mutant D9-ter ; si Q-M10 changeait `retire` (non : Q-M10 le garde), parité rejouée ; aucun texte ni empreinte réels (C-10 condition 1) ; validateur ajv 2020 de test, aucune dépendance neuve. Ligne r4 23.
- **Q-C5, défaut précisé** : racine = `oneOf` de trois objets fermés par `error` (`tool_error` avec `code` ∈ 29 codes dans l'ordre de `TOOL_ERROR_CODES` ; `invalid_input` avec `code` `input_invalid` et `issues` requis, éléments sans forme ; `invalid_json` avec `code` `json_invalid`) ; 500 sous `$defs/InternalError` (`{error: "internal_error", operation, code?: "output_invalid"}`) : le fichier porte exactement les 32 codes ; `$id` `https://monark.local/schemas/tool-error.schema.json`, `title` `ToolError`, description qui exclut MCP, 404 et 405. Conditions : parité en C1 (29 dans l'ordre ; union = les 32) ; conformité servie en C2 (chaque corps 400 du miroir HTTP valide la racine, les 500 `InternalError`, les 404 et 405 non) ; cliquet C-3 (`openapi.ts` lit les codes du schéma ou de `TOOL_ERROR_CODES`, jamais en littéraux ; `PENDING` après C' = les 6 codes kata) ; OPENAPI-ERROR-CODE-1 en C' projette ce fichier ; spécification r4 §13 (un code inconnu reste un refus) ; si la coupe de C2 envoie les corps 400 avec `code` en C', la condition de conformité suit. Ligne r4 24.
- Section 3.1, points 1 et 2 : « Contenu exact : Q-C4 / Q-C5 » se lit avec ces décisions.

### 14.3 Go du fondateur (verbatim)

- **Q-F1** : question portée par RECHERCHES après les réponses de MONARK à Q-M1 et Q-M12 (« à partir de la PR C2 (la bascule 1.1.0), le service et le dépôt public contiennent l empreinte réelle des tables de politique USDe, liq et cascade, avant ton go F-5a […] Tu autorises ? ») ; **réponse verbatim : « Oui, ces 3 tables (Recommandé) »**. Les 32 tables kata restent synthétiques jusqu'à F-5a. Exception à C-10 condition 1 pour ces trois tables seulement (ligne r4 25, close). C2 peut servir `policy_table_sha256` sur ces classes ; le go couvre aussi leurs empreintes dans `harness-pending.json`, les traces et les 9 décisions régénérées.
- **Q-F2** : libellé du refus 1.0.0 ; **réponse verbatim : « Version + dépôt de spec (Recommandé) »**. En C2, le message nomme la version parlée (1.1.0) et le dépôt de la spécification ; la date T0 y entre par une ligne au go F-5a ; texte exact par la porte de vocabulaire et la ligne datée de MONARK (ligne r4 26).

### 14.4 Préconditions, état au 2026-10-05

| # | Objet | État | Bloque |
|---|---|---|---|
| P-1 | #141 sur la base | **fait** (`87f6081c`) | — |
| P-2 | actes d'ADR restants (Q-M7) | textes rédigés (pièce `TEXTES-ADR-bloc-C.md`) ; application par MONARK | fusion de C2 |
| P-3 | amendement 9 de l'ADR-CM (Q-M8) | rédigé, branche `recherches/adr-cm-amendement-9` poussée sans PR ; contrôle de MONARK | **code de C1** |
| P-4 | ouvertures de zone (Q-M3) | **ouvertes** | — |
| P-5 | SERVED-PENDING-1, Q-SP1-7 | **fait** ; Q-SP1-7 tranchée (Q-M9) | — |
| P-6 | UKEMI-PENDING-SNAPSHOT-1 (Q-M5) | lot à part à faire, sur la base | C2 |
| P-7 | textes Z-3 et go Q-F1 | go Q-F1 **donné** ; ligne Z-3 de MONARK (empreintes de `92efa2a`, complètes au journal) attendue | code de C2 |
| P-8 | classe cascade (Q-M11) | **contrôlée** | — |
| P-9 | révision r4 | lignes 18 à 26 portées ; pièce r4 avant le G7 de C2 | G7 de C2 |
| P-10 | ligne ADR-CM du refus I-JSON (Q-C2) | rédigée à la liste fermée du §5 (amendement 9, ligne (5)) ; validation de MONARK dans la PR | **code de C1** |
| P-11 | lignes de MONARK : D9-ter (Q-M1), Z-3 (Q-M12) | annoncées « au prochain commit de docs du tronc » | Z-3 : code de C2 |

**Le code de C1 part** au contrôle de l'amendement 9 par MONARK (P-3), sur la base `87f6081c` ou plus récente, par un G0 court de 3c-2 qui déclare la coupe de la projection si la mesure la demande (section 9).

### 14.5 Questions ouvertes (hors délégation, pour MONARK)

- Z-3 et affichage des schémas neufs : **tranchés** (section 14.6).
- Compléments de la pièce des textes d'ADR hors de la liste du plan (ADR-M001 Décision 5 ; ADR-M005 D5 l.94-95) : à prendre ou à laisser par écrit.

### 14.6 Réponses de MONARK hors délégation (2026-10-05)

Source : `recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-bloc-C-hors-delegation.md` (commit `3d7f63b`, sha256 `e683a666a39278f36ee0d454f593b880f370883b018bf13ed1f0b4241d739416`). MONARK y note aussi le go du fondateur Q-F1 et Q-F2 (versé en verbatim au HANDOFF du tronc) et annonce le contrôle par diff du module `servedMarginalTables` en C2 (Q-C3).

1. **Ligne de l'ADR-CM du refus Q-C2** : d'accord sur le fond (requête non hachable canoniquement, surrogate isolée ou littéral hors binary64 → 400 `param_invalid` nommé, sans code neuf ; 200 en 1.0.0). Elle va dans la PR de documentation de l'amendement 9, **à la liste fermée des changements servis** ; MONARK la contrôle et la valide là, **avant le code de C1**. Fait : branche `recherches/adr-cm-amendement-9`, ligne datée 2026-10-05 (5), une ligne du §5 sous B-11 amendée (P-10).
2. **Z-3, `content` ↔ `text`** (Q-C3 condition 5) : le `content` servi **contient** le texte de table à une place fixée ; il ne lui est pas égal (l'égalité stricte changerait des octets servis). Règle : le texte de table est le **préfixe exact** de la phrase servie, suivi du suffixe inchangé, aujourd'hui `${SENTENCE}; B_t is caller-carried.` (`apps/harness/src/tools/gate.ts:698-707` à `87f6081c`). **Un test épingle cette composition** (lot 3c-3b, sur USDe, liq et cascade). En C2, la phrase liq reste la même pour s0 à s3 (défaut S-8 connu, octets servis inchangés) ; C' corrige ensemble le texte de table et le texte servi, par la seconde ligne datée de MONARK. La liste close de l'écart liq de Q-C3 condition 5 se lit ainsi : en C2, la composition préfixe + suffixe tient sur s0 à s3 avec le texte de table de s0 ; C' la ferme avec le texte de classe.
3. **Les deux schémas neufs sur le site** (`policy-row`, `tool-error` ; titres, compte 9, `UNSERVED_CONTRACT_FILES`) : **à T0, par MONARK**, avec la republication de la spécification (plan §9.2, comme Q-M16), **pas dans le bloc C**. C1 ne touche donc pas le site ; `frozen_contracts_count_is_derived` suit le disque.
4. **À faire par RECHERCHES** : la phrase de NOTICE-1-1-0 du refus Q-C2 (enveloppe non écrivable canoniquement → 400 `param_invalid`, 200 en 1.0.0) entre dans le brouillon de l'avis (**Z-4**), avec les autres changements servis de la section 4.
