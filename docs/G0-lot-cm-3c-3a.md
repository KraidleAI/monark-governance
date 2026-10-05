# G0 du lot CM-3c-3a (contrat 1.1.0, bloc C, premier lot de la PR C2) : paquet gelé et moteur en 1.1.0

- **G0 du bloc** : `docs/G0-bloc-c-cm-3c-2.md` (section 1, découpe C1 / C2 / C' ; section 3.2, lot 3c-3a ; sections 4 à 7 ; section 9, R-25 et coupes nommées ; section 13, plan de preuve ; section 14, réponses de MONARK, décision Q-C1 à Q-C5, go du fondateur Q-F1 et Q-F2). Ce G0 court reprend **le lot 3c-3a seul** et dit ce qu'il contient, mesuré au code. Il ne remplace aucune décision du G0 du bloc.
- **Découpe suivie** : le G0 du bloc fixe C2 = **3c-3a** (paquet gelé et moteur), puis **3c-3b** (harnais), puis **3c-3c** (surfaces, épingles, instantanés), dans cet ordre (sections 1 et 3.2 à 3.4). « 3c-3a d'abord » est donc la découpe du bloc ; ce G0 la suit sans la changer.
- **Sources lues** :
  - G7 de C1 `docs/G7-lot-cm-3c-2.md` : coupe nommée appliquée (projection vers 3c-3b) ; 8 rouges restants sous la seule bascule de version ; Q-1 à Q-3 et position de la cellule ; m-5 et m-6 de la G2 ;
  - G7 d'UKEMI-PENDING-SNAPSHOT-1 `docs/G7-lot-ukemi-pending-snapshot-1.md`, section « Pour C2 et T0 » (N-1 à N-3, rejeu `scanText`, `--pending` après la bascule du registre) ;
  - `recherches` : liste r4 `coordination/pieces/2026-10-04-contrat-1-1-0-r4-liste/LISTE-REVISION.md` (lignes 18 à 29) ; `coordination/pieces/2026-10-05-bloc-C-avis/DECISION-bloc-C-QC1-QC5.md` et l'avis ; `coordination/pieces/2026-10-05-bloc-C-textes-ADR/TEXTES-ADR-bloc-C.md` (§1 et §3 : `calibDigest` quitte le paquet au lot 3c-3a) ; spécification r3 `SPEC-1-1-0-brouillon.md` §5 et §6 ;
  - messages de MONARK : `2026-10-05-MONARK-vers-RECHERCHES-bloc-C-reponses.md`, `…-bloc-C-hors-delegation.md`, `…-docs-tronc.md` (ligne Z-3 et lecture de D9-ter au tronc, `63603285`), `…-146.md` (#146 tenue, fusion sur la base annoncée) ; message de RECHERCHES `2026-10-05-RECHERCHES-vers-MONARK-PR-147-C1.md` (Q-1 à Q-3 en attente du troisième avis de MONARK). Aucune réponse de MONARK sur #147 ni sur Q-1 à Q-3 au moment de ce G0 (`recherches` à `77e7770`).
- **Base et branche** :
  - `origin/base/chantier-moteur-2026-10-03` = **`7af2ad63`** (refetchée) ; elle **ne contient pas encore** #146 (UKEMI-PENDING-SNAPSHOT-1, tête `95fe89de`) ni #147 (C1, tête `6b342068`) ;
  - branche `recherches/cm-3c-3a`, partie de `origin/recherches/cm-3c-2` = `6b342068` (C1), arbre `/home/user/monark-governance-c2a` ;
  - **`origin/recherches/ukemi-pending-snapshot-1` (`95fe89de`) fusionnée par le commit `5b1499ac`** (fusion sans conflit), pour que C2 voie le code de l'instantané en attente ; jamais de rebase ;
  - quand MONARK aura fusionné #146 et #147 sur la base, la base est fusionnée dans cette branche (commit de fusion) **avant le premier commit de tests rouges**. Mesure de contrôle : `r25()` de cette branche contre `7af2ad63` = **1 088** (543 de C1 + 545 de #146) ; contre chacune des deux têtes, 545 et 543. La PR C2 ne s'ouvre donc que sur une base qui porte les deux, sinon elle hérite de 1 088 lignes.
- **Statut** : G0 écrit **avant tout test et tout code**. Auteur : RECHERCHES.

## 1. Périmètre exact de 3c-3a, face à 3c-3b et 3c-3c

| | 3c-3a (ce lot) | 3c-3b | 3c-3c |
|---|---|---|---|
| Paquet gelé (`schemas/`, `packages/contracts/src/`, manifeste D9-ter) | **tout le ré-épinglage 2 de C2**, dans le commit du changement | rien | rien |
| Moteur (`packages/hikae/src/`) | verdict 1.1.0, verdict sans région, étape L3 | rien | rien |
| Harnais (`apps/harness/src/`) | **rien** | bascule `gate.ts:62`, chemins servis, B-17, `http.ts`, `calibration.ts`, `servedMarginalTables`, refus I-JSON, projection de C1 | rien |
| Surfaces et données (`scripts/`, `apps/site/`, `fixtures/`, `packages/ukemi`, `packages/atelier`, `packages/monark`) | seulement les imports de `calibDigest` imposés par son retrait (Q-1, Q-2) | rien | tout le reste (CA, synchro, chargeurs, instantanés, traces, 9 décisions) |

Contenu de 3c-3a, poste par poste (G0 du bloc, section 3.2) :

1. **Schémas** (D9-ter) :
   - `schemas/coverage-verdict.schema.json` : `schema_version` constante `"1.1.0"` ; `method` + `risk-control` ; `region` = ensemble, intervalle ou `null` ; requis : + `qhat_unit`, `scale`, `scores_sha256`, `cell_key`, `policy_row_sha256`, `policy_table_sha256`, − `calib_digest` (17 champs requis) ; raisons + `calib_silence`, `calib_vetoed`, `calib_retired`, `out_of_support`, `region_degenerate` ;
   - `schemas/gate-decision.schema.json` : constante `"1.1.0"`, + `request_sha256` (9 requis), mêmes 18 raisons ;
   - `schemas/prediction.schema.json` : motif de version gardé (spec §3), description seule.
2. **`packages/contracts/src/`** (D9-ter) :
   - `enums.ts` : 5 raisons, `risk-control` ; la liste des raisons admises sans région (section 7, Q-3a-6) ;
   - `types.ts` : `CoverageVerdict` 1.1.0 (`region` nullable, cinq champs neufs, `scores_sha256` à la place de `calib_digest`), `GateDecision.request_sha256` ; `qhat_unit` typé par `QhatUnit` de `policy-table.ts` (fichier inchangé, Q-M10) ;
   - `closed-check.ts` : clés 1.1.0 et les couplages de la spec §5 (`region = null` ⇔ `qhat = null` ; `region = null` ⇒ `abstain` et raison admise sans région ; `abstain` sur toute raison `calib_*` ; `scale ≠ null` ⇔ `qhat_unit = scale` ; `policy_row_sha256 ≠ null` ⇒ `cell_key ≠ null` ; `cell_key = null` ⇔ `policy_table_sha256 = null` ; `scores` présent ⇒ `scores_sha256 = scoresSha256(scores)`) ;
   - **`calib-digest.ts` retiré** et son export de `index.ts` (l'outil de C1, `scripts/lib/calib-digest-provenance.mjs`, le remplace hors contrat) ;
   - `test/contracts-frozen.manifest.json` ré-épinglé **dans le même commit** : 7 entrées changées (3 schémas, `enums.ts`, `types.ts`, `closed-check.ts`, `index.ts`), 1 retirée (`calib-digest.ts`). `serialize.ts`, `canonical.ts`, `region.ts`, `policy-table.ts`, `tool-error-codes.ts`, `forbidden-keys.ts` inchangés : relu au code, `serializeVerdict` passe déjà par `assertClosedCoverageVerdict`, qui portera les couplages.
3. **`packages/hikae/src/`** :
   - `verdict.ts` : `buildVerdict` reçoit les cinq champs de case en **un seul paramètre** (`cell`, forme proposée `{ qhatUnit, scale, cellKey, policyRowSha256, policyTableSha256 }`, requis) et écrit `scores_sha256 = scoresSha256(scores)` (ordre déclaré, jamais trié) ; `noRegionVerdict(reason, …)` rend `region: null`, `qhat: null`, `abstain: true` ; `underCalibVerdict` devient `noRegionVerdict("under_calib", …)` (nom gardé : les 7 appels du harnais en 3c-3b ne changent que par `cell`) ;
   - `interval-conformer.ts` : `cell` transmis ; sous-calibration par `noRegionVerdict` (région `null`) ;
   - `l3-gate.ts` : **étape 4 de la spec §6** : `nCalib < nMin`, toute raison admise sans région, toute raison `calib_*`, ou `region === null` ⇒ `abstain` avec la raison du verdict (`under_calib` pour `nCalib < nMin` seul ; Q-3a-6). La ligne NDG-1 de `decideInterval` (`under_calib`) **ne change pas** : B-16 est en C' ;
   - `index.ts` (exports) ; `s2/instrument.ts` (version `"1.1.0"`, `cell` de ses verdicts de démonstration) et `packages/hikae/test/fixtures.manifest.json` ré-épinglé (jeu S2, côté moteur, non servi).
4. **Retrait de `calibDigest` : imports hors du paquet** (sinon le dépôt ne charge plus ces fichiers) :
   - `scripts/record-usde-calib.mjs:23` vers l'outil de provenance (Q-1) ;
   - `scripts/record-u4b-calib.mjs:13` (et `.d.mts` si sa déclaration nomme le paquet) vers l'outil (Q-2), avec le re-gel de `GENERATOR_SHA256_LF` (`apps/harness/test/calibration-liq.test.ts:41`) dans le même commit ;
   - tests des paquets qui s'en servent comme **identité de tableaux servis** (`packages/hikae/test/risk-control-quantile.test.ts:17`, `runs.test.ts:14`, `contracts-integration.test.ts:8`) : import repointé vers l'outil, **empreintes épinglées inchangées** (preuve que les scores servis ne bougent pas) ;
   - `packages/contracts/test/calib-digest.test.ts` : déplacé par `git mv` vers `test/calib-digest-vectors.test.ts`, import repointé vers l'outil (vecteurs C5 gardés ; détection de renommage de `git diff` : environ 4 lignes R-25, vérifié au gel ; à défaut, suppression, −46) ;
   - `test/calib-digest-provenance.test.ts` : la parité avec `@monark/contracts` devient une empreinte épinglée des mêmes vecteurs (calculée à la base par la fonction du contrat), et le test vérifie que le paquet n'exporte plus `calibDigest`.
5. **Tests des paquets remis au format 1.1.0** (verts à la tête du lot) : `packages/contracts/test/fixtures.ts` (deux verdicts et une décision : version, cinq champs, `scores_sha256`, `request_sha256`) ; appels de `buildVerdict` et `conformInterval` dans `packages/hikae/test/` (+ `cell`, une ligne par appel) ; `interval-conformer.test.ts` (version du verdict validé par ajv, sous-calibration sans région). Les littéraux `"1.0.0"` des tests de `packages/hikae` qui ne passent pas par un schéma **restent** (paramètre de version, mesuré au G7 de C1).

**Hors de 3c-3a, explicitement** : `apps/harness/src/**` (3c-3b) ; le rejeu par projection, reçu de C1 par la coupe nommée (3c-3b) ; `KATA_REASONS` ⊆ `COVERAGE_REASONS` (déplacé en 3c-3b, écart 2) ; B-16, B-12, B-13 (C') ; tout fichier du site, de `fixtures/`, des traces, des instantanés (3c-3c) ; `packages/ukemi/src/prediction.ts:13`, `packages/atelier/src/state.ts`, `packages/monark/src/adapter-narabi.ts:26` (3c-3c, Q-3).

## 2. Écarts au G0 du bloc, mesurés au code (déclarés, avec défaut)

1. **Le harnais ne se charge plus à la tête de 3c-3a.** `apps/harness/src/calibration.ts:16` et `apps/harness/src/tools/calibrate.ts:27` importent `calibDigest` de `@monark/contracts` ; son retrait (3c-3a, G0 du bloc section 3.2) fait échouer la liaison ESM de tout le graphe du harnais, pas seulement `tsc`. La liste close des rouges de 3c-3a (Q-M2) est donc : `tsc` ; **tous les tests de `apps/harness`** ; tout test racine ou de `apps/*` qui importe le harnais ou `calibDigest` du paquet (`fixtures-root`, `narabi-live`, `harness-served`, `byo-demo-probe`, `h5-e2e-probe`, `verify-harness-liq`, `sas-audit`, `site-ukemi`, `ci-gates` l.853-855, et ce que la mesure ajoute) ; les tests de `packages/atelier` qui lisent l'état S2 « 09-under-calib » (région `null`, `regionText` en 3c-3c). Liste exacte, fichier par fichier, au G7 du lot. Défaut : garder le retrait en 3c-3a, parce que la lecture de D9-ter par MONARK (Q-M1) veut le ré-épinglage 2 de C2 dans **un** commit, celui du changement ; le repousser en 3c-3b ferait un second commit de ré-épinglage. Q-3a-1.
2. **Parité `KATA_REASONS` ⊆ `COVERAGE_REASONS` (C-1 condition 2) déplacée en 3c-3b.** Elle lit `apps/harness/src/kata-path.ts`, qui importe `./calibration.ts` (l.10) : à la tête de 3c-3a le test rougirait au chargement, ce que `red-proof` refuse. Placée en 3c-3b dans `apps/harness/test/kata-path.test.ts`, elle reste F2P contre la base de C2 (`calib_silence` absent de `COVERAGE_REASONS`). C-1 condition 2 ne demande la parité que **avant D**, ce que C2 tient. Q-3a-2.
3. **Tests de 3c-3a : ~175 lignes R-25, au lieu de ~50** au G0 du bloc. Le bloc ne comptait que les tests neufs ; les tests des paquets doivent rester verts à la tête du lot, donc passer au format 1.1.0 dans ce lot (fixtures du paquet gelé, appels du moteur, vecteurs de `calibDigest`). Effet sur C2 : section 6.

## 3. Octets servis : ce qui change, et comment c'est épinglé

Rien n'est déployé avant T0 (ADR-PUBLIC-CADENCE-1 §17). La liste fermée des changements servis reste celle du G0 du bloc (section 4, lignes 1, 2, 3 et 9 pour C2) ; 3c-3a n'en ajoute aucune.

| Surface | Effet de 3c-3a | Épinglé par |
|---|---|---|
| `schemas/coverage-verdict.schema.json`, `gate-decision.schema.json`, `prediction.schema.json` | octets changés (B-11 amendée) | `test/contracts-frozen.manifest.json`, ré-épinglé dans le même commit (D9-ter, ré-épinglage 2, seconde moitié) |
| `GET /openapi.json`, MCP `tools/list` | ils projettent ces schémas tels quels (`apps/harness/src/schema-projection.ts:60-61`, entrée `prediction` et sortie de `gate`) : **changent avec le schéma** | `harness-served.json` (`openapi_sha256`) et tests de `apps/harness` : rouges de la liste close jusqu'à 3c-3b et 3c-3c (`--pending`) |
| corps `/gate`, `/cascade`, `/calibrate`, MCP `tools/call` | harnais non chargeable à la tête de 3c-3a (écart 1) : **aucune surface servie mesurable à ce lot** | comparaison base / tête **au gel de 3c-3c**, sur la liste fermée de la section 4 du bloc ; projection de C1 inchangée |
| site (`apps/site/lib/gate-enums.ts`, lecture au build des raisons de `gate-decision.schema.json`) | 18 raisons au build ; pages servies à T0 seulement | `test/ci-gates.test.ts:853-855` (12 → 17, 8 → 9, 5 inchangé), en 3c-3c |
| jeu S2 du moteur (`packages/hikae/test/fixtures.manifest.json`) | empreinte changée (non servi) | ré-épinglé dans le commit de `s2/instrument.ts` |
| `fixtures/*.gate-decision.json`, `fixtures/manifest.json` | **inchangés** : le générateur de C1 passe par `gate()` de `@monark/hikae` sur des verdicts déclarés à la main, que 3c-3a ne touche pas ; `gate-decision-fixtures-gen` reste vert | régénérés en 3c-3c |

Preuve au G7 de 3c-3a : `git diff <base du lot> <gel>` vide sous `apps/harness/src/`, `apps/site/`, `fixtures/`, `packages/{ukemi,atelier,monark}/src/` ; mutant D9-ter rejoué ; empreintes des trois schémas avant et après.

## 4. Tests rouges prévus et tueurs (forme fermée ; adresses fixées au gel)

Chaque test est rouge à la base **par assertion** : un export neuf est lu par l'espace de noms (`(mod as Record<string, unknown>).noRegionVerdict`), jamais par un import nommé qui échouerait au chargement (règle du G7 de C1). Un tueur par test (règle de `red-proof`) ; les autres mutants d'un même test sont tués à la main au G7.

| # | Test (fichier) | Ce qu'il épingle | Tueur prévu |
|---|---|---|---|
| T1 | `verdict_1_1_0_region_null_iff_qhat_null_and_abstains` (`packages/contracts/test/closed-check.test.ts`) | un verdict 1.1.0 valide passe ; `region` nulle avec `qhat` non nul, et l'inverse, refusés ; `region` nulle avec `abstain: false` ou une raison servie (`covered`) refusée | `// killer: packages/contracts/src/closed-check.ts:<l> SDL "if ((region === null) !== (qhat === null)) fail(\"region\", \"qhat\");" -> ""` |
| T2 | `verdict_1_1_0_calib_reason_abstains` (idem) | `calib_silence` avec `abstain: false` refusé, sur un verdict ensemble `{up, down}` | `// killer: packages/contracts/src/closed-check.ts:<l> SDL "if (reason.startsWith(\"calib_\") && abstain !== true) fail(\"reason\", \"abstain\");" -> ""` |
| T3 | `verdict_1_1_0_scale_iff_scale_unit` (idem) | `scale` non nul sous `qhat_unit` `label`, et `scale` nul sous `scale`, refusés | `// killer: packages/contracts/src/closed-check.ts:<l> SDL "if ((scale !== null) !== (unit === \"scale\")) fail(\"scale\", \"qhat_unit\");" -> ""` |
| T4 | `verdict_1_1_0_cell_key_couplings` (idem) | `policy_row_sha256` sans `cell_key` refusé ; `cell_key` nul avec une table, et l'inverse, refusés | `// killer: packages/contracts/src/closed-check.ts:<l> SDL "if ((cellKey === null) !== (tableSha === null)) fail(\"cell_key\", \"policy_table_sha256\");" -> ""` |
| T5 | `verdict_1_1_0_scores_digest_matches_scores` (idem) | `scores` présent avec un `scores_sha256` d'une copie triée refusé | `// killer: packages/contracts/src/closed-check.ts:<l> CONST "scoresSha256(scores)" -> "scoresSha256([...scores].sort((a, b) => a - b))"` |
| T6 | `verdict_and_decision_schemas_are_1_1_0` (`packages/contracts/test/schema.test.ts`) | fixtures 1.1.0 valides ; `"1.0.0"`, `calib_digest`, un champ neuf absent, `request_sha256` absent : refusés ; `region: null` et `method: risk-control` admis | `// killer: schemas/gate-decision.schema.json:<l> SDL "    \"request_sha256\"," -> ""` (entrée de `required`) |
| T7 | `l3_calib_and_regionless_reasons_abstain_with_the_verdict_reason` (`packages/hikae/test/l3.test.ts`) | forme L3 de C-4 : verdict `{up, down}`, q̂ 1, `tau` 1, horloge ouverte, raison `calib_silence` ⇒ `abstain calib_silence` (jamais `defer`) ; `out_of_support` et `region_degenerate` à région nulle ⇒ `abstain` avec leur raison | `// killer: packages/hikae/src/l3-gate.ts:<l> SDL "if (input.nCalib < input.nMin \|\| abstainsOnReason(input.verdict)) return { action: \"abstain\", allow: false, reason: stepFourReason(input) };" -> ""` (le mutant rend `defer set_too_large`) |
| T8 | `no_region_verdict_has_null_region_and_qhat` (`packages/hikae/test/contracts-integration.test.ts`) | `noRegionVerdict` et `underCalibVerdict` : `region` et `qhat` nuls, `abstain`, `n_calib` = nombre de scores, `scores_sha256` des scores fournis ; `conformInterval` sous-calibré : région nulle | `// killer: packages/hikae/src/verdict.ts:<l> CONST "region: null," -> "region: buildSetRegion([], BTC_DIR_LABEL_SCHEMA),"` |
| T9 | `verdict_scores_sha256_is_over_the_declared_order` (même fichier ; remplace `calib_digest_matches_contracts`) | `scores_sha256 = scoresSha256(scores)` dans l'ordre donné ; deux permutations ⇒ deux empreintes ; les cinq champs de `cell` recopiés tels quels | `// killer: packages/hikae/src/verdict.ts:<l> CONST "scoresSha256(params.scores)" -> "scoresSha256([...params.scores].sort((a, b) => a - b))"` (tueur d'A-2 §5) |
| T10 | `calib_digest_provenance_keeps_the_c5_vectors` (`test/calib-digest-provenance.test.ts`, réécrit) | `@monark/contracts` n'exporte plus `calibDigest` (rouge à la base) ; l'outil rend l'empreinte épinglée des 27 vecteurs de C1 ; refus d'un score non fini | `// killer: scripts/lib/calib-digest-provenance.mjs:16 CONST "s === 0 ? 0 : s" -> "s"` (tueur de C1, gardé) |

Tests existants qui bougent sans tueur neuf (preuve à la main au G7) :
- `contracts_frozen` : mutant D9-ter (un des trois schémas, ou `closed-check.ts`, changé sans ré-épingler ⇒ rouge ; `calib-digest.ts` remis sans entrée ⇒ « file added or removed in the frozen zone ») ;
- `fixtures_hash_stable` (S2) : manifeste ré-épinglé ; l'ancien manifeste contre le nouveau code ⇒ rouge ;
- `enums.test.ts` (égalité des énumérations des schémas et de `COVERAGE_REASONS`, `METHODS`) : vert par construction, mutant à la main (une raison retirée de `enums.ts` seul ⇒ rouge) ;
- `u4b_committed_registry_equals_generator_output` et le test du générateur gelé (`calibration-liq.test.ts:56`) : sortie identique après le repointage (Q-2), `GENERATOR_SHA256_LF` ré-épinglé ; ces tests vivent dans `apps/harness` et ne tournent qu'à partir de 3c-3b (écart 1) : la preuve de sortie identique est faite au G7 de 3c-3a par un lancement direct du générateur sur une copie, contre le registre versé.

`red-proof` du lot (information, pas porte : la porte est le `red-proof` de la PR entière au gel de 3c-3c, Q-M2) : `node scripts/red-proof.mjs --base <base du lot> --gel <gel> --repo /home/user/monark-governance-c2a --draw 10 --seed 37`, attendu T1 à T10 en F2P et 10 tueurs tués.

## 5. Ancres et contrôles

- `verifie-ancres.mjs . --touched <base du lot> HEAD` : 0 dérivé, 0 perdu.
- `tsc --noEmit` : **rouge attendu**, liste close (harnais, `packages/atelier`, tests racine du format) ; `tsc` limité à `packages/contracts` et `packages/hikae` : vert.
- `eslint .`, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check` (voir Q-1 : `record-usde-calib.mjs` importe un fichier que la liste blanche ne nomme pas encore).
- `npm test` complet (Node 24.21.0, variables de proxy retirées, TMPDIR propre) : rouges égaux à la liste close de l'écart 1, comptés fichier par fichier ; `packages/contracts`, `packages/hikae`, `packages/ukemi`, `packages/monark` à 0 rouge.

## 6. R-25 (estimation, `r25()` de `scripts/oracle/r25.mjs`, insertions + suppressions)

Contre la base du lot (la tête de cette branche après la fusion de la base qui porte #146 et #147) :

| Poste | Lignes |
|---|---|
| trois schémas | ~45 |
| `packages/contracts/src/` (`enums` ~12, `types` ~20, `closed-check` ~38, `index` ~3, `calib-digest.ts` retiré −30) | ~103 |
| manifeste D9-ter (7 entrées changées, 1 retirée) | ~15 |
| `packages/hikae/src/` (`verdict` ~45, `interval-conformer` ~12, `l3-gate` ~14, `index` ~3, `s2/instrument` ~10) | ~85 |
| imports de `calibDigest` hors paquet (Q-1, Q-2 ; `.d.mts` ; épingle du générateur) | ~8 |
| **code** | **~255** |
| tests neufs T1 à T9 | ~95 |
| tests existants des paquets au format 1.1.0 (fixtures ~23, appels du moteur ~20, `interval-conformer` ~8, imports d'identité ~6, `calib-digest.test.ts` déplacé ~4, T10 ~8, S2 ~2, divers ~9) | ~80 |
| **tests** | **~175** |
| **Total 3c-3a** | **~430** (borne 547 ; incertitude ±20 %) |

- G0 du bloc : ~345 pour 3c-3a ; l'écart (~85) est l'écart 3 (tests des paquets).
- **C2 réestimée** : ~430 (3c-3a) + ~515 (3c-3b : ~420 + Q-C2 ~25 + Q-C1 ~10 + projection reçue de C1 ~55 + parité kata déplacée ~5 ; sous 547) + ~300 (3c-3c) = **~1 245**, au-dessus de 1 205 de ~40. **La coupe nommée de C2 devient nécessaire** (corps 400 avec `code` et leurs tests, ~45, vers C', avec la condition 6 de Q-C5) : C2 ~1 200, marge ~5. Elle se déclare au G0 court de 3c-3b, sur la mesure du gel de 3c-3a. C' passerait de ~410 à ~455 (sous 547). Une marge de ~5 ne tient pas l'incertitude : si le gel de 3c-3a mesure plus de ~430, il faut une seconde coupe, à nommer avant le code de 3c-3b (candidats sans octet servi : `apps/harness/README.md:34,90` et les textes `fixtures/PROVENANCE-*.md`, ~15, repris à T0 par MONARK ; Q-3a-5).
- Si le déplacement de `calib-digest.test.ts` n'est pas détecté comme renommage, +42 : la suppression nette est alors préférée et le G7 le dit.
- `CONTENT_STAT` : 0 (aucun fichier de contenu du site).

## 7. Dépendances : Q-1 à Q-3 (troisième avis de MONARK attendu) et autres

La G2 de C1 et la cellule suivent les trois défauts du G7 de C1 ; MONARK ne les a pas encore tranchés. Effet sur 3c-3a :

- **Q-1** (`scripts/record-usde-calib.mjs`, exporté au miroir, `scripts/export-public.mjs:79`) : **dépendance dure de 3c-3a**. Le repointage vers l'outil se fait **au plus tard dans le commit qui retire `calib-digest.ts`**, c'est-à-dire le commit de code de 3c-3a. Il faut d'abord la ligne d'ADR-M004 D7 de MONARK qui nomme `scripts/lib/calib-digest-provenance.mjs` dans `WHITELIST_FILES`, sinon `export:check` ou la commande « Reproduce » de `PROVENANCE-usde.md` §6 casse. Sans réponse, le code de 3c-3a attend.
- **Q-2** (`scripts/record-u4b-calib.mjs`, générateur gelé d'ADR-U4b D4) : **dépendance dure de 3c-3a**, même commit : ligne datée d'ADR-U4b (re-gel du sha256 LF), `GENERATOR_SHA256_LF` ré-épinglé, sortie identique prouvée. Pas de module de réexport dans `@monark/contracts` (contraire à D9-ter).
- **Q-3** (version de la `Prediction` de Narabi, `packages/monark/src/adapter-narabi.ts:26`) : le code de l'adaptateur est en 3c-3c. **Mais** le défaut de la cellule veut la version lue depuis **une seule constante exportée**, « par exemple du paquet de contrats ». Si MONARK la place dans `@monark/contracts`, elle **doit entrer en 3c-3a**, seul commit de C2 qui touche le paquet gelé (proposition : `SCHEMA_VERSION = "1.1.0"` dans `packages/contracts/src/enums.ts`, sans fichier neuf ; ~3 lignes ; `schemas/*` égal à elle par un test de parité). Elle n'est alors lue, en 3c-3a, que par `s2/instrument.ts` ; `apps/harness/src/tools/gate.ts:62` garde son littéral `"1.0.0"` jusqu'à la bascule de 3c-3b, où il devient la réexportation de la constante (le tueur `CONST "1.1.0" -> "1.0.0"` du bloc, section 5, passe alors sur `enums.ts`). Si MONARK préfère une constante hors du paquet gelé, 3c-3a ne change pas. Q-3a-4.
- **Zone** : les lignes de P-4 qui couvrent `scripts/record-usde-calib.mjs`, `scripts/record-u4b-calib.mjs` (et `.d.mts`) et `test/calib-digest-provenance.test.ts` sont ouvertes « jusqu'à la fusion de C1 » ; 3c-3a en a besoin en C2, plus un fichier racine neuf (`test/calib-digest-vectors.test.ts`, déplacement). Q-3a-3.
- **Notes reçues, sans effet sur 3c-3a** :
  - m-5 du G7 de C1 (corps `invalid_input` et `invalid_json` non conformes à `tool-error.schema.json` jusqu'à C2) : 3c-3b (ou C' par la coupe) ;
  - m-6 (« Eight frozen contracts » du site) : T0, MONARK ; 3c-3a ne change pas le compte des schémas (9) ;
  - N-1 (renommage B-17 de `verdictFactsOf` et de `gatePin`) : 3c-3b ; N-2 (`--pending` **après** la bascule du registre et B-17) et le rejeu `scanText` de m-5 d'UKEMI-PENDING-SNAPSHOT-1 sur `ukemi-pending.json` versé : 3c-3c ; N-3 : T0 ;
  - les 8 rouges restants du G7 de C1 sous la seule bascule de version (`usde_band_edges_within_half_ulp_stated_and_band_unchanged`, `served_replay_identical_and_nan_never_commits_in_the_served_gate`, `cascade_returns_frozen_prediction`, `u5_producer_predicts_then_gate_follows_the_committed_registry`, quatre `gate_stable_run_*`) : englobés dans la liste close de 3c-3a (harnais non chargeable), traités en 3c-3b (projection, bandes) et 3c-3c (`ukemi`, Narabi par Q-3).
- **Autres préconditions de C2** (G0 du bloc, section 14.4), sans effet sur le code de 3c-3a : P-2 (actes d'ADR, avant la fusion de C2) ; P-7 et P-11 (ligne Z-3 : au tronc, `63603285`, selon MONARK ; lue en 3c-3b) ; P-6 (#146 sur la base : fusion annoncée).

## 8. Questions pour MONARK

- **Q-3a-1 (liste close).** À la tête de 3c-3a, le retrait de `calibDigest` rend le harnais non chargeable (liaison ESM) : la liste close couvre tout `apps/harness` et les tests qui l'importent, pas seulement les tests du format. Défaut : accepté (Q-M2, oracle = CI de la tête de C2), retrait gardé en 3c-3a pour un seul commit de ré-épinglage en C2. Alternative : retrait dans le commit de bascule de 3c-3b (second commit de ré-épinglage dans C2).
- **Q-3a-2 (parité kata).** `KATA_REASONS` ⊆ `COVERAGE_REASONS` en 3c-3b au lieu de 3c-3a (écart 2). Défaut : oui.
- **Q-3a-3 (zone).** Prolonger jusqu'à la fusion de C2 les lignes de P-4 sur `scripts/record-usde-calib.mjs`, `scripts/record-u4b-calib.mjs` (et `.d.mts`), `test/calib-digest-provenance.test.ts`, et ouvrir `test/calib-digest-vectors.test.ts` (neuf, par `git mv` depuis `packages/contracts/test/`). Défaut : oui.
- **Q-3a-4 (Q-3, place de la constante).** Si ton troisième avis suit le défaut de Q-3, la constante de version entre-t-elle dans `@monark/contracts` (alors en 3c-3a, `enums.ts`) ou ailleurs ? Défaut : `enums.ts`, en 3c-3a.
- **Q-3a-5 (R-25).** C2 réestimée à ~1 245 : la coupe nommée de C2 (corps 400 avec `code`, ~45, vers C') devient nécessaire et laisse ~5 de marge ; elle se déclare au G0 court de 3c-3b. Accepter dès maintenant une seconde coupe de réserve (`apps/harness/README.md` et `fixtures/PROVENANCE-*.md` à T0, par toi), appliquée seulement si le gel de 3c-3a dépasse ~430 ? Défaut : oui.
- **Q-3a-6 (lecture de la spec, choix de contrat : décision déléguée si tu le demandes).** Ensemble des raisons admises avec `region: null` (couplage du contrôle fermé et étape 4 de L3) : celles dont la colonne « Region » de la spec §6 dit « none » ou « any » (`non_evaluable`, `under_calib`, `out_of_support`, `region_degenerate`, les trois `calib_*` pour les bandes, et les réservées `upstream_timeout`, `attestation_absent`, `attestation_refused`, `binding_broken`). Étape 4 : raison du verdict quand elle est `calib_*` ou admise sans région, sinon `under_calib` (cas `nCalib < nMin` sur un verdict servi) ; une région nulle avec une raison servie (verdict fait à la main) ⇒ `abstain under_calib`, jamais une exception. Défaut : cette lecture, portée en ligne de la liste r4 (§5, §6). Si tu la tiens pour un choix de contrat, la cellule lance un advisor avant les tests rouges.
- **Q-3a-7 (rappel de #147).** Porter #142 (`--test-force-exit`) sur la base avant C2 ? Proposé au message de #147, sans réponse.
- **Ordre.** Les tests rouges de 3c-3a partent quand : #146 et #147 sont sur la base et la base fusionnée ici ; Q-1 et Q-2 tranchés (lignes d'ADR-M004 D7 et d'ADR-U4b prêtes pour le commit de code) ; Q-3a-3 ouverte ; Q-3a-6 répondue.
