# G0 du bloc C' (contrat 1.1.0, lot CM-3c-4, PR C') : rang exact, bords du test, largeur nulle, texte liq, corps 400 et `/openapi.json`, gloses, « the gate », garde d'envoi du site

- **Plan et sources** :
  - ADR-CM (`docs/adr/ADR-CM-chantier-moteur-audit-P3.md` de `origin/base/chantier-moteur-2026-10-03`, `0fcc18f2`) : §5, lignes B-8 (l.98), B-12, B-13, B-16 (l.252-255) ; amendement « 2026-10-04 (1) » (OPENAPI-ERROR-CODE-1, l.213-217) ; lignes datées 2026-10-05 (3) (découpe C1, C2, C' : « C' = lot CM-3c-4 (B-12, B-13, B-16, OPENAPI-ERROR-CODE-1, B-8) »), (4) (B-8 en C'), (9) point 4 (« rien d'autre ne fusionne dans `base/c2-integration` ») et **(10)** (`0fcc18f2` : texte du refus 1.0.0 avec « the gate », « le lot CM-3c-4 (C') corrige le mot et son test, avant T0 » ; règle m-1).
  - G0 du bloc C, `docs/G0-bloc-c-cm-3c-2.md` : §1 (tableau des PR, C' ~410), §2 (ordre C2 → C' → D), **§3.5 (lot CM-3c-4)**, §4 lignes 4 à 8, §5 (tueurs B-12, B-13, B-16, S-8, OPENAPI), §6 (projection en C' sur la liste close), §7 (tests inversés en C'), §8 P-4 (zones ouvertes « jusqu'à la fusion de C' »), §9 (R-25 de 3c-4, coupe nommée `canonicalRow`), §10, §14.
  - Coupes reçues de C2 : G0 de 3c-3a (Q-3a-5 : corps 400 avec `code` en C'), G7 de 3c-3a et G0 de 3c-3b (Q-3a-8, coupe (a) : test de composition Z-3 et liste close de l'écart liq en C', avec S-8), G0 de 3c-3b1 et 3c-3b2 (Q-3b-5 : test des 63 caractères en C'), G7 de 3c-3b2 (Q-3b2-2 : écart des valeurs servies accepté « jusqu'à C' »), G7 de 3c-3c (m-3 pour C' ; note « tout octet servi changé en C' se ré-épingle à quatre endroits » ; m-2).
  - Décision déléguée du bloc C (`recherches:coordination/pieces/2026-10-05-bloc-C-avis/DECISION-bloc-C-QC1-QC5.md`) : Q-C3 condition 5, Q-C5 conditions 2, 3, 4 et 6.
  - G0 d'UKEMI-PENDING-SNAPSHOT-1 (§6, ligne C' ; Q-UPS-M4) et réponse de MONARK (`…-UPS-M1-M4.md`, M4 : « le G0 de C' mesure l.152 »).
  - Message de MONARK `recherches:coordination/messages/2026-10-05-MONARK-vers-RECHERCHES-rattrapage.md` (branche `claude/monark-repository-access-brln3a`), section C2b : Q-3c-1 (trois gloses), Q-3c-2 (« the gate »), m-1, m-2 (SITE-SEND-GUARD-MECH-1 formé pour C').
  - NOTICE-1-1-0 (`recherches:coordination/pieces/2026-10-05-NOTICE-1-1-0/NOTES.md` l.65-69 ; décision de cellule V-1 à V-8 : lecture S-8 confirmée, NOTICE finalisée après le gel de C').
- **Branche** : `recherches/c-prime-site`, partie de `origin/base/c2-integration` = **`a5940308`** (fusion de #152, C2b). Pourquoi cette base et non `origin/base/chantier-moteur-2026-10-03` : C' suit C2 et en lit le code (format 1.1.0, `policy-served.ts`, instantanés en attente) ; la base ne porte pas encore C2 (la PR d'intégration `base/c2-integration` → base n'est pas fusionnée), et la ligne (9) point 4 interdit toute autre fusion dans `base/c2-integration`. Ce G0 ne porte que de la documentation. **Le code part de la base après la fusion de la PR d'intégration** (précondition P-1) : la branche y sera alors fusionnée (elle reçoit aussi `0fcc18f2` et `418a421f`, absents de `base/c2-integration`), et la PR C' visera `base/chantier-moteur-2026-10-03`.
- **Statut** : G0 écrit avant tout code, arrêté sur les questions de la section 8. Aucune PR. Auteur : RECHERCHES.

## 1. Périmètre

C' est le dernier morceau du bloc C. Il ne touche pas le paquet gelé (`packages/contracts/src/`, `schemas/` : Q-M1, C' ne fait que les lire). Rien n'est déployé avant T0 (ADR-PUBLIC-CADENCE-1 §17) : chaque octet servi changé ici n'est servi qu'à T0.

La ligne C' du plan (ligne datée (3), G0 du bloc §3.5) et les demandes reçues depuis forment treize postes. Ils sont rangés en deux lots, chacun ≤ 547 (section 5).

### 1.1 Lot CM-3c-4a : surfaces, textes et gardes (aucun calcul du moteur ne change)

1. **SITE-SEND-GUARD-MECH-1** (m-2 de la G2 de 3c-3c, formé par MONARK pour C'). La garde de `docs/RUNBOOK-vitrine.md` (`d1cf7a1b`, et la ligne M3 ukemi) n'est qu'un texte : « aucun envoi du site tant que `apps/site/data/harness-pending.json` existe dans l'arbre exporté » ; idem pour `ukemi-pending.json`. Elle est sur le tronc, pas sur `main`, ni sur la base, ni sur `base/c2-integration`. Garde mécanique proposée :
   - **où** : `scripts/export-public.mjs`, mode `--out` seulement. L'étape 1 du RUNBOOK (« Export propre ») est le seul chemin d'un envoi du site, et `release-public.mjs` passe aussi par `--out` (section 8, Q-CP-4).
   - **quoi** : si l'ensemble gardé contient `apps/site/data/harness-pending.json` ou `apps/site/data/ukemi-pending.json`, ou si `harness-served.json` ou `ukemi-served.json` porte `pending_since`, l'export échoue fermé (exit 1, rien d'écrit), avec un message qui nomme l'item, les fichiers trouvés, et les deux sorties admises : envoyer depuis le SHA déployé ou le tronc, ou promouvoir à T0.
   - **levée** : aucun drapeau de contournement. La promotion du temps (ii) (`node scripts/sync-harness-served.mjs`, puis la synchro ukemi) supprime l'instantané en attente et `pending_since` (`sync-harness-served.mjs:30-32`, `:194`). La garde tombe donc d'elle-même à T0, et seulement là.
   - **ce qu'elle ne fait pas** : `--check` (CI, `export:check`) reste vert avec l'instantané présent, sans quoi la CI de la base rougirait de C2 à T0. La règle m-1 (redéploiement de l'hôte depuis le SHA déployé) reste une règle de procédure, en zone MONARK (Q-CP-5).
   - fonction pure exportée (`pendingSendBlockers(keptFiles, readText)`, nom proposé), déclarée dans `scripts/export-public.d.mts` ; ligne de RUNBOOK qui renvoie à la garde (à MONARK, section 6).
2. **Trois gloses de site** (Q-3c-1, texte publié à T0 seulement), textes exacts de MONARK :
   - `calib_silence` : `This cell's calibration missed too often, or failed a dependence check, so no region is served.`
   - `calib_vetoed` : `A check registered in advance vetoed this cell's calibration, so no region is served.`
   - `calib_retired` : `This cell's calibration was retired by the published monitoring rule, so no region is served.`
   - Lieux : `apps/site/lib/how-copy.ts:73-75` (`REASON_GLOSS`, phrases avec majuscule et point : textes de MONARK à l'octet) et `apps/site/lib/docs-gate.ts:44-46` (`REASON_DOCS`, même gloses au format de ce tableau : minuscule initiale, sans point final ; Q-CP-3). Les deux autres gloses neuves (`out_of_support`, `region_degenerate`) restent telles quelles.
3. **« the gate » au lieu de « the harness »** (Q-3c-2, ADR-CM ligne (10), `0fcc18f2`) : `apps/harness/src/tools/gate.ts:865` rend `unsupported prediction.schema_version '<reçu>': the gate speaks '1.1.0'; specification: https://github.com/KraidleAI/monark-kata-spec`. Son test `schema_version_refusal_names_the_spoken_version_and_the_spec_repository` (`apps/harness/test/error-code.test.ts:160-172`) change de littéral et de commentaire. La date de T0 (« since <T0> ») n'entre pas ici : seconde ligne datée au go F-5a.
4. **Corps 400 avec `code`** (coupe de C2, Q-3a-5) : `apps/harness/src/http.ts:90` (`invalid_json`) et `:97` (`invalid_input`) gagnent `message` et `code` (`json_invalid`, `input_invalid`), donc la forme de la racine de `schemas/tool-error.schema.json`. Même commit : `input_invalid` et `json_invalid` sortent de `PENDING` (`apps/harness/test/kata-path.test.ts:339`, C-3 condition 3 : `PENDING` après C' = les 6 codes kata) ; commentaire C-3 de `gate.ts:273`. Q-C5 condition 2 (suit la coupe, condition 6) : chaque corps 400 des tests du miroir HTTP valide la racine, chaque 500 `InternalError`, et les 404 et 405 ne la valident pas.
5. **Test des 63 caractères** (C-11 condition 2, Q-3b-5) : une empreinte de 63 caractères rend 400 `input_invalid` en HTTP, une erreur sans code en MCP.
6. **OPENAPI-ERROR-CODE-1** (`apps/harness/src/openapi.ts:83`) : les réponses 400 et 500 de `/openapi.json` sont les projections de la racine et de `$defs/InternalError` de `schemas/tool-error.schema.json` (Q-C5 condition 4). Aucun code en littéral dans un module servi (condition 3, cliquet C-3) : les codes viennent du fichier ou de `TOOL_ERROR_CODES`.
7. **m-3** (G2 de 3c-3c, trou antérieur) : un vecteur de plus dans `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces`, une surface dont le `scores_sha256` du verdict BYO diffère de celui de `calibrate`, pour tuer le mutant `scripts/verify-harness.mjs:365` (retrait de `&& digest === calibrateScoresSha256`).
8. Ré-épinglages de ce lot (empreinte de `/openapi.json`) : voir 1.3.

### 1.2 Lot CM-3c-4b : moteur (lignes servies B-12, B-13, B-16, S-8)

9. **B-12, rang exact** : `splitRankShortest(n, alpha)` et `splitQuantileShortest(scores, alpha, nMin)` dans `packages/hikae/src/l1-split.ts`. Lecteur `String(alpha)` (grammaire de `Number::toString`, exposant compris : `1e-7`), rationnel exact, rang ⌈(n + 1)(1 − a)⌉ en entiers (BigInt), sans limite de décimales, aucun refus neuf. Les fonctions `splitRankExact` et `splitQuantileExact` (chaîne décimale, `policy-marginal.ts:38`) restent ; la nouvelle lit l'`alpha` reçu. Branchements : BYO (`gate.ts:454`), USDe (`:598`), liq (`:660`), `packages/hikae/src/interval-conformer.ts:84`, `apps/harness/src/tools/calibrate.ts:165`. `splitQuantile` reste exporté, inchangé, hors chemin servi (lecture R-2 de l'ADR-CM). Effet servi attendu : USDe (613 ; 0,1) → 553 et liq (170 ; 0,01) → 170 inchangés ; BYO et `calibrate` changent sur les couples où le rang flottant diffère.
10. **B-13, bords tirés du test du score** (`packages/hikae/src/region.ts`) : `hi` = plus grand double avec fl(hi − ŷ) ≤ q̂, `lo` = plus petit double avec fl(ŷ − lo) ≤ q̂, par bissection sur les motifs binaires (spec §8). Appelés par USDe, BYO intervalle et cascade. **La phrase B-7 est retirée** de `STABLE_RUN_COMMITTED_CORE` (`gate.ts:121-130`, « each band edge is yhat - qhat or yhat + qhat rounded … the band is not widened for it »). Elle change donc la description servie USDe, le `content`, le texte de table USDe (règle Z-3 : préfixe exact) et `policy_table_sha256` USDe. Seconde ligne datée Z-3 de MONARK (P-3).
11. **B-16, largeur nulle** : `buildIntervalRegion` (`region.ts:62`) et la ligne NDG-1 de `decideInterval` (`packages/hikae/src/l3-gate.ts:126-128`) rendent `region: null` et la raison `region_degenerate`, au lieu de `under_calib` (ADR-M011 §7, ADR-M002 l.145 et l.266, déjà en place). Le chemin borne supérieure d'ukemi (`apps/harness/src/ukemi-strata.ts:49-51`) est relu au code.
12. **S-8 (B-8)** : `honestyText` (`gate.ts:695`) reçoit la case résolue au lieu de la seule présence au registre. Liq s0 (ligne admise) garde la phrase calibrée ; liq s1 à s3 (`under_calib`) reçoivent le texte de la classe, et la phrase calibrée n'y est plus servie (lecture confirmée, décision de cellule V-1 à V-8). Appelant : `apps/harness/src/tools/registry.ts:76`. Le même commit porte la **coupe (a) reçue de C2** : le test de composition Z-3 (texte de table = préfixe exact de la phrase servie, suivi de `; B_t is caller-carried.`) sur USDe, cascade et liq s0 à s3, et la fermeture de la liste close de l'écart liq (Q-C3 condition 5). La partie USDe et cascade est déclarée au G7 avec un tueur à la main, verte à la base de C' ; la partie liq passe de rouge à vert avec S-8 (condition de Q-3a-8).
13. **Écart Q-3b2-2** (accepté « jusqu'à C' ») : `qhat`, `n_calib` et `alpha` servis USDe et liq sont lus sur la ligne admise (`policy-served.ts`) et non plus recalculés depuis les scores de `calibration.ts`. B-12 rend les deux calculs égaux par construction. Le test d'égalité existant (tueur `policy-marginal.ts:44`) reste (Q-CP-6).
14. **`canonicalRow` réexporté** (`packages/hikae/src/canonical-row.ts`) : il devient la réexportation de `canonicalJson`. Seule différence : la clé non ASCII, désormais refusée (Q-4 du G0 de CM-3c-1). C'est la **coupe nommée** du G0 du bloc (§9) : si 3c-4b dépasse 547, ce poste sort du chantier 1.1.0, puisqu'il ne change aucun octet servi.

### 1.3 Ré-épinglages (chaque lot, dans le commit de son changement)

Règle du G7 de 3c-3b2 : un lot qui change un octet servi met à jour les épingles dans son commit de tests et nomme chaque changement dans son G7 (champ, appels touchés, raison). Les quatre endroits nommés par le G7 de 3c-3c :
- le rejeu de 111 appels et la projection (`apps/harness/test/served-replay-cm3.test.ts`, `served-decisions-projection.test.ts`), qui ne bougent que sur la liste close B-12, B-13 et B-16 ;
- la bande USDe ;
- `PENDING_BODIES_SHA256` (`test/harness-served.test.ts:663`) ;
- `node scripts/sync-harness-served.mjs --pending`, puis `node scripts/sync-ukemi-served.mjs --pending` si un champ partagé bouge (`pending_since` gardé), avec l'entrée du manifeste du site.

Également : `apps/harness/src/calibration.ts` (empreintes, si B-12 en touche une) et l'empreinte de table USDe (B-13).

## 2. Hors de C'

- Le paquet gelé (`packages/contracts/src/`, `schemas/`, `test/contracts-frozen.*`) : lu, jamais écrit (Q-M1).
- La date de T0 dans le message du refus : ligne datée au go F-5a.
- `apps/harness/README.md` et le texte des `fixtures/PROVENANCE-*.md` : vont à T0 (liste de MONARK) ; texte « Eight frozen contracts » du site (liste de T0, MONARK).
- `HARNESS_VERSION`, la CA de l'hôte, la promotion des instantanés, tout déploiement et tout envoi du site : MONARK, à T0 (section 6).
- B-14 et tout le kata (bloc D) ; LATE-CALL-WINDOW-1 (code avec D).
- NOTICE-1-1-0 : RECHERCHES la finalise après le gel de C' (hors lot, documentation de coordination).

## 3. Fichiers touchés

| Fichier | Lot | Poste | Zone |
|---|---|---|---|
| `scripts/export-public.mjs`, `scripts/export-public.d.mts` | 4a | 1 | MONARK, ouverture demandée (Q-CP-7) |
| `test/export-public.test.ts` (ou `test/site-send-guard.test.ts` neuf) | 4a | 1 | idem |
| `apps/site/lib/how-copy.ts` (l.73-75) | 4a | 2 | site, ouverture demandée |
| `apps/site/lib/docs-gate.ts` (l.44-46 ; compte « content » de R-25) | 4a | 2 | idem |
| `test/site-docs.test.ts` ou `test/ci-gates.test.ts` (épingle des trois gloses) | 4a | 2 | idem |
| `apps/harness/src/tools/gate.ts` (l.865, commentaire l.273) | 4a | 3, 4 | RECHERCHES |
| `apps/harness/test/error-code.test.ts` (l.160-172) | 4a | 3 | RECHERCHES |
| `apps/harness/src/http.ts` (l.90, l.97) | 4a | 4 | RECHERCHES |
| `apps/harness/test/http*.test.ts`, `apps/harness/test/kata-path.test.ts:339` | 4a | 4, 5 | RECHERCHES |
| `apps/harness/src/openapi.ts` et son test | 4a | 6 | RECHERCHES |
| `test/verify-harness-liq.test.ts` | 4a | 7 | ouverte jusqu'à la fusion de C' (P-4) |
| `packages/hikae/src/l1-split.ts`, `region.ts`, `l3-gate.ts`, `interval-conformer.ts`, `canonical-row.ts`, `index.ts` | 4b | 9, 10, 11, 14 | RECHERCHES |
| `packages/hikae/test/` (`l1-split`, `region`, `interval-nondegenerate`, `l3`, `cm3b-engine`) | 4b | 9 à 14 | RECHERCHES |
| `apps/harness/src/tools/gate.ts` (l.121-130, 454, 472, 598, 607, 660, 695), `tools/calibrate.ts:165`, `tools/registry.ts:76`, `policy-served.ts`, `ukemi-strata.ts` (relu) | 4b | 9 à 13 | RECHERCHES |
| `apps/harness/test/` (`gate`, `gate-liq`, `gate-cm2b`, `calibrate`, `served-replay-cm3`, `served-decisions-projection`, `policy-served` ou `policy-marginal`) | 4b | 9 à 13 | RECHERCHES |
| `apps/site/data/harness-pending.json`, `ukemi-pending.json` (si un champ bouge), `manifest.sha256.json` ; `test/harness-served.test.ts` (`PENDING_BODIES_SHA256`) | 4a, 4b | 1.3 | ouvertes jusqu'à la fusion de C' (P-4, M1 d'UKEMI-PENDING-SNAPSHOT-1) |
| `test/site-ukemi.test.ts` (l.152) | 4b | 12 | seulement si l.152 rougit (Q-UPS-M4) |

## 4. Tests, rouges d'abord, et tueurs prévus

Forme fermée `// killer: fichier:ligne OP "avant" -> "après"`. Les adresses sont fixées au gel.

| # | Test (nom proposé) | Lot | Rouge à la base de C' parce que | Tueur prévu |
|---|---|---|---|---|
| T-1 | `site_send_refused_while_a_pending_snapshot_exists` : arbre temporaire avec `harness-pending.json` ⇒ `--out` exit 1, rien d'écrit ; idem `ukemi-pending.json` ; idem `pending_since` seul | 4a | aucune garde | `SDL` de l'appel de la garde dans le chemin `--out` |
| T-2 | `site_send_allowed_after_promotion_and_check_unaffected` : même arbre sans instantané ⇒ export ; `--check` vert avec l'instantané | 4a | fonction absente | `ROR` qui garde aussi `--check` ; `CONST` d'un des deux noms de fichier |
| T-3 | `calib_reason_glosses_are_monark_texts` : les trois gloses de `REASON_GLOSS` égales aux textes de MONARK à l'octet, et celles de `REASON_DOCS` à leur forme (Q-CP-3) | 4a | anciennes gloses | `CONST` d'un caractère, `how-copy.ts:73` |
| T-4 | `schema_version_refusal_names_the_spoken_version_and_the_spec_repository` (littéral « the gate ») | 4a | « the harness » | `CONST "the gate" -> "the harness"` (`gate.ts:865`) ; tueur existant de l'URL gardé |
| T-5 | `http_400_bodies_validate_the_tool_error_root` (corps 400 valident la racine, 500 `InternalError`, 404 et 405 non) | 4a | `message` et `code` absents | `SDL` du `code` de `invalid_input` (`http.ts:97`) |
| T-6 | `PENDING` = 6 codes kata (`kata-path.test.ts:339`) | 4a | `input_invalid`, `json_invalid` non lancés | tueur précédent (le code redevient non lancé) |
| T-7 | `score_sha256_of_63_chars_is_input_invalid` (HTTP 400 `input_invalid`, MCP erreur sans code) | 4a | pas de `code` | `CONST "input_invalid" -> "json_invalid"` |
| T-8 | `openapi_400_and_500_are_the_tool_error_projections` | 4a | 400 sans schéma | `CONST` : un code retiré de la projection |
| T-9 | vecteur m-3 dans `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` | 4a | le mutant survit | `SDL "&& digest === calibrateScoresSha256"` (`verify-harness.mjs:365`) |
| T-10 | `split_rank_shortest_four_killers` : (50 ; 0,12345) → 45, jamais `under_calib` ; (24 ; 0,44) → 14 ; (9 ; 0,70) → 3 ; (10 ; 1e-7) → 11 > n ⇒ `under_calib`, pas 400 ; USDe 553 et liq 170 inchangés | 4b | fonction absente | lecteur à 4 décimales ; rang flottant |
| T-11 | `gate_byo_and_calibrate_use_the_exact_rank` (un couple où rang flottant et exact diffèrent, BYO et `calibrate`) | 4b | rang flottant servi | `CONST` : `splitQuantile` rebranché à `gate.ts:454` |
| T-12 | `interval_edges_follow_the_score_test` (un vecteur où fl(ŷ + q̂) diffère d'un ulp du bord du test) ; inversion de `usde_band_edges_within_half_ulp_stated_and_band_unchanged` ; phrase B-7 absente de la description et du `content` | 4b | bords additifs | `ROR` du comparateur de la bissection |
| T-13 | `zero_width_is_region_degenerate` (USDe, BYO intervalle, L3) ; inversions de `gate_byo_interval_degenerate_calibration_is_under_calib_M011`, `gate_byo_interval_float_absorption_is_under_calib_M011`, `gate_stable_run_ndg1_zero_width_is_under_calib_reused`, `packages/hikae/test/interval-nondegenerate.test.ts`, ligne NDG-1 de `l3.test.ts` | 4b | `under_calib` | `CONST "region_degenerate" -> "under_calib"` à chaque site |
| T-14 | `liq_honesty_text_follows_the_resolved_cell` (s0 : phrase calibrée ; s1 à s3 : texte de classe) | 4b | texte choisi sur le registre | ancien critère (`hasCommittedCalibrationForClass`) |
| T-15 | `served_text_is_table_text_plus_suffix` (Z-3, USDe, cascade, liq s0 à s3) ; liste close de l'écart liq vide | 4b | liq s1 à s3 rouges (USDe et cascade verts, déclarés) | `CONST` du suffixe ; tueur à la main pour USDe et cascade |
| T-16 | `served_qhat_ncalib_alpha_read_from_the_admitted_row` | 4b | valeurs recalculées | `CONST` : la valeur recalculée remise |
| T-17 | `canonical_row_is_canonical_json` (clé non ASCII refusée ; `cm3b-engine.test.ts`) | 4b | deux écritures | `CONST` : ancienne implémentation |

Projection (§6 du bloc) : écarts seulement sur la liste close, chacun nommé par sa ligne B, au G7 de 4b.

## 5. R-25 (estimation, `r25()` ; borne de lot 547, de PR 1 205)

Recensement au code de `a5940308`, sans prototype. Incertitude ±25 %.

| Poste | Code | Tests | Total |
|---|---|---|---|
| 1. SITE-SEND-GUARD-MECH-1 | ~18 | ~30 | ~48 |
| 2. gloses (`how-copy.ts` au compte code ; `docs-gate.ts` au compte « content », 6 lignes) | ~6 | ~10 | ~16 |
| 3. « the gate » | ~2 | ~4 | ~6 |
| 4, 5. corps 400 avec `code`, `PENDING`, test des 63 caractères | ~8 | ~40 | ~48 |
| 6. OPENAPI-ERROR-CODE-1 | ~25 | ~35 | ~60 |
| 7. m-3 | 0 | ~8 | ~8 |
| Ré-épinglages de 4a (`/openapi.json` : `PENDING_BODIES_SHA256`, `harness-pending.json`, manifeste) | ~12 | ~4 | ~16 |
| **Lot 3c-4a** | | | **~200** |
| 9. B-12 | ~45 | ~70 | ~115 |
| 10. B-13 (bissection, branchements, phrase B-7) | ~45 | ~55 | ~100 |
| 11. B-16 | ~10 | ~35 | ~45 |
| 12. S-8, composition Z-3, liste de l'écart liq | ~25 | ~45 | ~70 |
| 13. Q-3b2-2 | ~10 | ~10 | ~20 |
| 14. `canonicalRow` | ~35 | ~25 | ~60 |
| Ré-épinglages de 4b (rejeu, projection, bande USDe, `PENDING_BODIES_SHA256`, `--pending`, manifeste, empreintes) | ~35 | ~25 | ~60 |
| **Lot 3c-4b** | | | **~470** |
| **PR C'** | | | **~670** |

- Le plan du bloc estimait C' à ~410. Les postes 1 à 7 et 13 (~220) sont venus après : coupes de C2, Q-3c-1, Q-3c-2, m-2, m-3 et Q-3b2-2. **Un seul lot dépasserait 547** : d'où les deux lots, dans une seule PR (~670 ≤ 1 205).
- 3c-4b est à ~470, soit ~75 de marge, moins que l'incertitude. **Coupe nommée** (G0 du bloc §9) : si le gel de 3c-4b dépasse 547, `canonicalRow` (~60) sort du chantier 1.1.0 (aucun octet servi). Seconde coupe de réserve : Q-3b2-2 (~20) reste un écart déclaré jusqu'à T0 (Q-CP-6).
- 3c-4a peut partir en PR à part (Q-CP-2) : ~200, sous 547 et 1 205.
- Rien n'est au compte des `docs/**/*.md` : ce G0 et les G7 sont exclus du compte.

## 6. Zones : à MONARK, à RECHERCHES

**RECHERCHES** (zone propre) : `apps/harness/`, `packages/hikae/`. **Zones ouvertes jusqu'à la fusion de C'** (G0 du bloc, P-4 ; M1 d'UKEMI-PENDING-SNAPSHOT-1) : `scripts/verify-harness.mjs`, `scripts/sync-*-served.mjs` (et `.d.mts`), `apps/site/data/harness-pending.json`, `ukemi-pending.json`, `harness-served.json` et `ukemi-served.json` (clé `pending_since` seule), `apps/site/data/manifest.sha256.json`, et les tests racine `harness-served`, `verify-harness-liq`, `narabi-live` (l.540-547), `site-ukemi` (trois littéraux).

**Ouvertures neuves demandées pour C'** (Q-CP-7), jusqu'à la fusion de C' :
- `scripts/export-public.mjs`, `scripts/export-public.d.mts`, et `test/export-public.test.ts` ou un test neuf (SITE-SEND-GUARD-MECH-1) ;
- `apps/site/lib/how-copy.ts` (l.73-75), `apps/site/lib/docs-gate.ts` (l.44-46) et le test qui épingle les gloses (Q-3c-1) ;
- `test/site-ukemi.test.ts` l.152, seulement si la mesure de 4b le rougit (Q-UPS-M4 ; attendu vert, voir Q-CP-9).

**MONARK** :
- tout déploiement de l'hôte, sous la règle m-1 (de la fusion de C2 à T0, revérification et redéploiement depuis le SHA déployé, archive et `verify-harness.mjs` compris ; jamais depuis `main`, la base ou `base/c2-integration`) ;
- tout envoi du site (RUNBOOK-vitrine) et sa ligne de RUNBOOK qui nomme la garde mécanique ; la promotion des instantanés à T0 (CA, synchro du harnais, puis synchro ukemi), après C' et la montée de `HARNESS_VERSION` ;
- la seconde ligne datée Z-3 (empreintes du texte USDe sans la phrase B-7, texte liq s1 à s3 par S-8) ;
- les actes d'ADR qui citent le rang (ADR-M007 D4, texte déjà rédigé dans `TEXTES-ADR-bloc-C.md`) ;
- la ligne de T0 (« since <T0> ») au go F-5a ; la publication de NOTICE-1-1-0 et de la spécification ; README du harnais, PROVENANCE, « Eight frozen contracts » à T0 ;
- le contrôle par diff, l'oracle Windows et la fusion de la PR.

## 7. Préconditions

- **P-1.** La PR d'intégration `base/c2-integration` → `base/chantier-moteur-2026-10-03` est fusionnée (R25-INTEGRATION-RULE-1 sur la base, oracle Windows `bad=[r25]` seul). La branche fusionne alors la base, et le code part de là.
- **P-2.** Réponses de MONARK à Q-CP-1 à Q-CP-9, et ouvertures de zone (Q-CP-7).
- **P-3.** Seconde ligne datée Z-3 de MONARK **avant le gel de 3c-4b** (pas avant son code). RECHERCHES mesure et transmet les empreintes au G0 court de 3c-4b.
- **P-4.** Le RUNBOOK du tronc (`d1cf7a1b` et la ligne M3) reste la garde de procédure jusqu'à ce que C' soit sur la base. La fenêtre entre la fusion de l'intégration et celle de C' n'a pas de garde mécanique (Q-CP-2).

## 8. Questions (défaut entre parenthèses)

- **Q-CP-1. Base de la branche et cible de la PR.** Branche partie de `base/c2-integration` (`a5940308`, C2 complète), base fusionnée après P-1, PR vers `base/chantier-moteur-2026-10-03`. (Oui. Partir de la base aujourd'hui n'aurait pas C2 ; viser `base/c2-integration` est interdit par la ligne (9) point 4.)
- **Q-CP-2. Découpe.** Une seule PR C', deux lots : 3c-4a (surfaces et gardes, ~200) puis 3c-4b (moteur, ~470), chaque tête verte. Variante : 3c-4a en PR à part, fusionnée juste après l'intégration de C2, pour réduire la fenêtre sans garde mécanique (P-4). (Une PR. La variante si tu juges la fenêtre trop longue ; elle coûte une G2 de plus.)
- **Q-CP-3. Forme des gloses dans `REASON_DOCS`.** `how-copy.ts` reçoit tes trois phrases à l'octet. `docs-gate.ts` garde sa forme (minuscule initiale, sans point) : `this cell's calibration missed too often, or failed a dependence check, so no region is served` ; `a check registered in advance vetoed this cell's calibration, so no region is served` ; `this cell's calibration was retired by the published monitoring rule, so no region is served`. (Oui ; sinon les deux tableaux portent la phrase entière, point compris, et `docs-gate` change de forme sur trois lignes seulement.)
- **Q-CP-4. Portée de la garde d'envoi.** La garde est dans `export-public.mjs --out`, donc elle bloque aussi `release-public.mjs` (le miroir public) tant qu'un instantané en attente existe. La ligne datée (6) de l'ADR-CM dit que « le service et le dépôt public » portent les empreintes réelles des trois tables « à partir de la PR C2 » : faut-il qu'un envoi du miroir reste possible avant T0 ? (Non : la garde bloque les deux, échec fermé. Si le miroir doit bouger avant T0, `release-public.mjs` passe un drapeau nommé que tu fixes, et la garde du site reste sans contournement.)
- **Q-CP-5. Règle m-1 en mécanique.** SITE-SEND-GUARD-MECH-1 ne couvre que le site. Le redéploiement de l'hôte depuis le SHA déployé reste une règle de procédure (archive « from HEAD » du RUNBOOK §6). (Pas de garde mécanique de l'hôte en C' : zone MONARK, aucun script de déploiement dans le dépôt.)
- **Q-CP-6. Écart Q-3b2-2.** C' le ferme : les valeurs servies sont lues sur la ligne admise, et le test d'égalité reste. (Oui, en 3c-4b. Seconde coupe de réserve si 3c-4b dépasse 547 après la coupe `canonicalRow` : l'écart reste déclaré jusqu'à T0.)
- **Q-CP-7. Ouvertures de zone** de la section 6 (export, gloses, l.152 conditionnelle). (Oui, jusqu'à la fusion de C'.)
- **Q-CP-8. Coupe nommée.** Si 3c-4b dépasse 547 au gel, `canonicalRow` sort du chantier 1.1.0 (item à part, après T0). (Oui, déjà écrite au G0 du bloc §9.)
- **Q-CP-9. l.152 de `site-ukemi` (Q-UPS-M4).** S-8 change le choix de la phrase dans `honestyText`, pas les quatre constantes liq de `gate.ts` ni la clause de la description de `/gate`. l.152 doit donc rester verte, et l'instantané ukemi ne pas bouger par S-8. B-13 change la description USDe, que l'état servi d'ukemi ne lit pas. (Mesuré au gel de 3c-4b ; ligne de zone demandée seulement si l.152 rougit.)

## 9. Preuve

Tests rouges d'abord (section 4), puis gel par lot ; red-proof `--base <base de C'> --draw n --seed 37` ; ancres `--touched` ; `npm test` complet (0 échec attendu), `tsc` 0, `lint`, `lint:ratchet` (69/69), `gate:vocab`, `lang:gate`, `export:check`, build du site (`npm run build -w @monark/site`) ; une exécution réelle de `node scripts/export-public.mjs --out` dans un arbre temporaire, avec et sans instantané, au G7 de 3c-4a. Au G7 de 3c-4b : changements servis nommés un par un contre la liste fermée (§4 du bloc, lignes 4 à 8) ; vecteurs NOTICE §2.4 ((24 ; 0,44) → 14, USDe 553, liq 170) rejoués ; R-25 mesuré lot par lot et pour la PR.
