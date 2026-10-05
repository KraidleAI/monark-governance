# G7 du lot CM-3c-4b (contrat 1.1.0, bloc C', second lot de la PR C') : moteur (B-12, B-13, B-16, S-8, Q-3b2-2)

- **Plan** : `docs/G0-lot-c-prime.md` (`8f554390`, §1.2 postes 9 à 14, §4 T-10 à T-17, §5, §7 P-3, §8) et le G0 court du lot, `docs/G0-lot-c-prime-b.md` (`55552aab`). Réponses de MONARK au G0 court : défauts de Q-CP4B-1 à Q-CP4B-4 acceptés ; `canonicalRow` devient un item après T0.
- **Base** : 3c-4a fusionné (#164) dans `base/chantier-moteur-2026-10-03` (`9b5511e0`, avec la ligne de RUNBOOK de MONARK). La branche l'a reçue par le commit de fusion **`740645b2`** (sans rebase) : **base de mesure du lot**.
- **Précondition P-3 tenue** : seconde ligne datée Z-3 de MONARK au journal du tronc, commit **`b26fa106`** (« 2026-10-05 15:1x UTC — Z-3, seconde ligne »), écrite avant que le gel ne soit poussé ; ses empreintes recalculées égalent celles du G0 court.
- **Commits** (branche `recherches/c-prime-site`, aucune PR) :
  - `740645b2` fusion de la base ;
  - `55552aab` G0 court (empreintes Z-3), poussé seul d'abord ;
  - `b6e660b6` tests (19 rouges à la base) ;
  - **`a61a483e` gel** (code et ré-épinglages), fait sur une branche locale, poussé par la coordination en avance rapide ;
  - `26fdf987` lignes de tueurs seules (cinq ré-ancrages) : **tête mesurée** ;
  - le commit de ce G7.
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé ; `node_modules` jamais indexé. Aucun fichier du paquet gelé écrit (`packages/contracts/src/`, `schemas/`).

## Ce que le lot écrit

1. **B-12, rang exact** (`packages/hikae/src/l1-split.ts`) : `splitRankShortest(n, alpha)` lit `String(alpha)` (grammaire de `Number::toString`, exposant compris, sans limite de décimales) comme rationnel exact et rend ⌈(n + 1)(1 − a)⌉ en BigInt ; `splitQuantileShortest(scores, alpha, nMin)` rend `under_calib` sur n < nMin, un alpha non fini, p > n ou p < 1 (aucun refus neuf). Branché sur le BYO (`gate.ts:454`, intervalle et ensemble), `calibrate` (`calibrate.ts:165`) et `conformInterval` (`interval-conformer.ts:83` : cascade, population USDe non engagée). `splitQuantile` reste exporté, inchangé (lecture R-2). Vecteurs rejoués (T-10) : (50 ; 0,12345) → 45 ; (24 ; 0,44) → 14 ; (9 ; 0,70) → 3 ; (10 ; 1e-7) → 11 > n, `under_calib` ; (9 ; 0,3) → 7 ; (19 ; 0,15) → 17 ; USDe (613 ; 0,1) → 553 ; liq (170 ; 0,01) → 170.
2. **B-13, bords du test du score** (`packages/hikae/src/region.ts`) : `scoreTestBand(yhat, qhat)` ; `hi` = plus grand double x avec fl(x − ŷ) ≤ q̂, par bissection sur les motifs binaires (`upperEdge`) ; `lo` = −(le `hi` de −ŷ), l'arrondi au plus proche étant symétrique en signe ; puis `buildIntervalRegion`. USDe (`gate.ts:607`), BYO intervalle (`gate.ts:472`), conformeur (`interval-conformer.ts:87`). La phrase B-7 sort de `STABLE_RUN_COMMITTED_CORE` (`gate.ts:127-129`, deux lignes de commentaire gardent les adresses des tueurs) : description, `content` USDe, texte de table USDe et `policy_table_sha256` USDe changent.
3. **B-16, largeur nulle** : `buildIntervalRegion` rend `region_degenerate` sur `lo === hi` (`region.ts:75`) ; la ligne NDG-1 de `decideInterval` aussi (`l3-gate.ts:128`). Les appelants passent la raison au verdict sans région (`noRegionVerdict(ir.reason, …)`, `gate.ts:476`, `:610` ; `interval-conformer.ts:88`). Le non-fini reste `under_calib`.
4. **S-8 (B-8)** : `honestyText(taskClass, cellKey, isByo)` (`gate.ts:701-710`) lit la case résolue dans la table servie : texte de la ligne courante de la clé, sinon texte de la classe, puis `; B_t is caller-carried.`. `registry.ts:76` passe `decision.verdict.cell_key` (clé de strate pour liq, `predictor_id` pour USDe et cascade). Liq s0 : phrase calibrée ; liq s1 à s3 : texte de classe. La composition Z-3 tient par construction sur toutes les classes servies ; la liste close de l'écart liq est vide (T-15).
5. **Q-3b2-2 fermé** : `admittedSplit(cell)` (`gate.ts`, fin de fichier) lit `qhat` et `alpha` sur la ligne courante de la case ; USDe (`gate.ts:598`) et liq (`:660`) ne recalculent plus de quantile. Le test d'égalité `served_values_equal_the_admitted_row` (tueur `policy-marginal.ts:44`) reste.
6. **Poste 14 (`canonicalRow`) non livré** : coupe nommée (voir « Coupe »).

## Seconde ligne Z-3 et empreintes servies

Ligne de MONARK : tronc, `b26fa106`. Octets hachés : valeur JavaScript de la chaîne, UTF-8, sans fin de ligne ni BOM (commande au G0 court, §3). Mesurés au gel (`a61a483e`) sur ce que le serveur sert (outil `gate`, `run`, partie avant ` verdict `) :

| Texte | Octets | sha256 | Mesuré au gel sur |
|---|---|---|---|
| USDe, texte de table | 728 | `8fce32e1d3568735743b42916fb61e5f78c58d5d7f9c1ac67b71cb9410c1f34d` | `STABLE_RUN_COMMITTED_SENTENCE` et `text` de la ligne USDe de la table servie |
| USDe, phrase servie | 752 | `4feaf914cd42b761e433d569510a02f9c723d2f1cf0b18ce1064d6db3eaf2f70` | `content` USDe (clé engagée) |
| liq s1 à s3, texte de classe | 110 | `94f90557563d3c37c834f67b5353ddebdf8bf281698088d146cf91d611b06830` | `class.text` de la table liq |
| liq s1 à s3, phrase servie | 134 | `98cc5ba5e5c8cc0a1f23ca2033a8c49a10b5e969724b3976acf0009005092e4d` | `content` liq à ŷ = 1e12, 5e13, 5e14 (s1, s2, s3) |

Égales à celles du G0 court et de la ligne `b26fa106`. Description servie de `gate` (`tools/list`, `/openapi.json`) : 3 445 octets `4279a54d…` → 3 247 octets **`bfb474f36957ea2390c4f4b99dbbebbea128724d7a7e3b58c1bbe81553016443`**.

## Liste des changements servis de ce lot (pour MONARK)

Rien n'est servi avant T0 (ADR-PUBLIC-CADENCE-1 §17). Tous sur la liste fermée du bloc C (§4, lignes 4 à 7).
1. **B-12** : `qhat` BYO (intervalle et ensemble) et `calibrate` au rang exact, sur les couples où le rang flottant différait (exemple : (24 ; 0,44), 15 → 14). USDe et liq inchangés (553, 170).
2. **B-13** : bords USDe et BYO intervalle du test du score ; écart d'au plus un ulp au bord additif, dans les deux sens. Phrase B-7 retirée de la description et du `content` USDe.
3. **B-16** : largeur nulle (q̂ = 0 ou absorption) : raison `region_degenerate` au lieu de `under_calib`, dans le verdict et dans la décision.
4. **S-8** : `content` liq s1 à s3 = texte de classe ; la phrase calibrée n'y est plus servie.
5. **Q-3b2-2** : aucun octet ne bouge (valeurs égales par construction).
- **Rejeu de 111 appels** (`served-replay-cm3`) : **39 appels** bougent, tous par les bords B-13 : 36 USDe (ŷ = 1e-4, 5e-4, −1e-4 sur les 12 combinaisons de seuils ; exemple ŷ = 1e-4 : `lo` −0,000031192280833333336 → −0,00003119228083333335, `hi` 0,00023119228083333333 → 0,00023119228083333336) et 3 BYO intervalle (ŷ = 1, q̂ = 1 : `lo` 0 → −2⁻⁵³ = −1,1102230246251565e-16). **Aucune action ni raison** du rejeu ne bouge. Projection `c9db863c…` → `efdde3e6…` ; octets `cb6a4e4f…` → `1aab90a8…`.

## Ré-épinglages (commit du gel, `a61a483e`)

- Rejeu : projection et octets (ci-dessus). Bande USDe, octets : `50ccc9fd…` → `c4b6bf15…`. Description servie (`hdesc_served_gate_description_is_the_committed_clause`) : `4279a54d…` → `bfb474f3…`.
- `PENDING_BODIES_SHA256` (`test/harness-served.test.ts:664-665`) : `/openapi.json` `d30e3123…` → **`ccae5fc0cd14…844f`** ; `/gate` `3ed9be55…` → **`701e9b068944…a08c`** ; `/gate liquidation-eligible-coverage` et `/calibrate` inchangés.
- `node scripts/sync-harness-served.mjs --pending` : `harness-pending.json`, seuls `written_at` et `openapi_sha256` changent ; `pending_since` gardé, `harness-served.json` inchangé (`30afbec2…`). Entrée du manifeste du site et `PINNED` : `d1045f39…` → **`f874bb44a50e…2fb3`**.
- Trace H5 réenregistrée par son générateur (`node scripts/record-h5-e2e-trace.mjs` : `content` USDe et ses bords) : 22 472 octets `8b05b4d4…` → 22 272 octets **`6242f7d0e307…fa05`** ; épingles de la sonde, de `PINNED`, du manifeste du site, et ligne d'empreinte de `fixtures/PROVENANCE-h5-e2e-trace.md` seule (son texte va à T0). Trace BYO inchangée (`5c9b03e6…`).
- `node scripts/sync-ukemi-served.mjs --pending` lancé puis **annulé** : seul `written_at` bougeait, aucun champ partagé ; `ukemi-pending.json` et son entrée restent `220c14c9…`. `test/site-ukemi.test.ts:152` vert (Q-CP-9 : aucune ouverture de zone).
- `apps/harness/src/calibration.ts` inchangé (aucune empreinte de scores ne bouge).

## Tueurs (forme fermée)

| Test | Tueur | Tiré |
|---|---|---|
| `split_rank_shortest_four_killers` (T-10, neuf) | `packages/hikae/src/l1-split.ts:233 CONST` rang exact → `Math.ceil((n + 1) * (1 - alpha))` | tué |
| `gate_byo_and_calibrate_use_the_exact_rank` (T-11, neuf) | `apps/harness/src/tools/gate.ts:454 CONST "splitQuantileShortest(…)" -> "splitQuantile(…)"` | tué ; second tueur à la main : `calibrate.ts:165`, rang flottant, tué |
| `interval_edges_follow_the_score_test` (T-12, inverse R-3 de CM-2b) | `packages/hikae/src/region.ts:109 ROR "<= q" -> "< q"` | tué |
| `gate_stable_run_ndg1_zero_width_is_region_degenerate_reused` (T-13) | `region.ts:75 CONST "region_degenerate" -> "under_calib"` | tué |
| `gate_byo_interval_degenerate_calibration_is_region_degenerate_M011` (T-13) | `gate.ts:476 CONST "noRegionVerdict(ir.reason, {" -> "underCalibVerdict({"` | tué |
| `gate_byo_interval_float_absorption_is_region_degenerate_M011` (T-13) | `region.ts:71 ROR "if (lo === hi) {" -> "if (lo > hi + 1) {"` | tué |
| `numeric_under_calib_region_is_not_directional` (T-13, cas NDG) | tueur existant `gate.ts:595 SDL assertPolicy` | tué |
| `interval_nondegenerate_conformer_msusd_like_region_degenerate`, `…_all_zeros_region_degenerate` (T-13) | `interval-conformer.ts:88 CONST "underCalib(params, ir.reason)" -> "underCalib(params)"` | tués |
| `interval_nondegenerate_l3_handbuilt_zero_width_abstains` (T-13) | `l3-gate.ts:128 CONST "region_degenerate" -> "under_calib"` | tué |
| `interval_nondegenerate_buildIntervalRegion_equal_bounds`, `interval_lo_le_hi` (T-13) | `region.ts:75 CONST` | tués |
| `oracle_l3_interval_path_reason_order_exhaustive` (T-13, 9 raisons) | tueur existant `l3-gate.ts:130 ROR` | tué |
| `oracle_usde_fixture_zero_atom_ties` (bord B-13 mesuré) | tueur existant `region.ts:71 ROR` | tué |
| `conform_scaled_band_serves_zero_to_h_star` (constante d'abstention) | à la main : `region.ts:75 CONST` | tué (à la main ; non jugé par red-proof, seule une constante de module change) |
| `liq_honesty_text_follows_the_resolved_cell` (T-14, inverse `u4b_liq_committed_text_is_honest`) | `gate.ts:708 CONST` → ancien critère (`hasCommittedCalibrationForClass`) | tué |
| `u4b_gate_serves_region_from_real_artifact` (T-14) | `gate.ts:708 CONST "r.current && r.cell_key === cellKey" -> "r.current"` | tué |
| `served_text_is_table_text_plus_suffix` (T-15, neuf) | `gate.ts:709 CONST` suffixe `; ` → `. ` | tué ; partie USDe et cascade verte à la base, tueurs à la main `gate.ts:703` (table trouvée pour liq seule) et `:709` (texte de classe remplacé), tués |
| `served_qhat_ncalib_alpha_read_from_the_admitted_row` (T-16, neuf) | `gate.ts:598 CONST "admittedSplit(cell)" -> "{ ...splitQuantileShortest(…), alpha: params.alpha }"` | tué |
| `harness_served_honesty_carriers_pass_vocab` (adaptation : clé s0) | tueur existant `gate.ts:927` | tué (à la main) |

**Mutant survivant déclaré** : `gate.ts:704`, repli d'une classe inconnue sur la phrase cascade (`; ` → `. `). Aucun test ne le tue : la branche est inatteignable pour une classe servie (une classe inconnue est un 400 `task_class_unknown` avant `honestyText`), et elle rend le texte d'avant le lot.

## red-proof

`node scripts/red-proof.mjs --base 740645b2 --gel 26fdf987 --repo . --draw 25 --seed 37` : sortie 1 (REFUSED, attendu) ; **23 jugés, 100 inchangés ; 22 F2P ; 22 tueurs tirés, 22 tués** ; `RED-PROOF.json` sha256 `5f24eac2…` (dépend des chemins).
- **F2P (22)** : T-10, T-11, T-12, T-14 (deux), T-15, T-16, les inversions de T-13 (dix), et les épingles qui bougent avec les octets servis (bande USDe, description, rejeu ×2).
- **Refusé (1), attendu** : `harness_served_honesty_carriers_pass_vocab` (« green at base ») : adaptation (clé s0 passée à `honestyText`), tueur tiré à la main, tué.

## Ancres

- `verifie-ancres.mjs . --touched 740645b2 HEAD` : **62 tueurs, 62 ancrés, 0 dérivé, 0 perdu** (après `26fdf987`).
- `26fdf987` ré-ancre cinq lignes : trois tueurs du lot décalés d'une ligne dans `gate.ts` (`:710` → `:709`, `:709` → `:708` ×2) ; `l1.test.ts:16` (`l1-split.ts:38` → `:40`, déjà perdu à la base) ; `oracle-l3-interval.test.ts:176` (`interval-conformer.ts:87` appelle désormais `scoreTestBand` : `"scoreTestBand(params.yhat, qhat)" -> "scoreTestBand(params.yhat, 2 * qhat)"`).
- Arbre entier : 1 181 tueurs, 1 173 ancrés, 0 dérivé, **8 perdus, tous déjà perdus à la base** (la base en avait 9 ; celui de `l1.test.ts` est ré-ancré ici).

## Contrôles

Node 24.21.0, variables de proxy retirées pour les tests, TMPDIR propre à la session, `node_modules` local de 3c-4a gardé.

| Contrôle | Commande | Résultat |
|---|---|---|
| `npm test` complet (`26fdf987`) | `npm test` | **2 544 tests, 2 522 verts, 0 rouge, 22 sautés, 0 annulé, exit 0** (test 42 compris) |
| `tsc` | `npx tsc --noEmit` | 0 erreur |
| `lint` | `npx eslint .` | 0 erreur |
| `lint:ratchet` | `npm run lint:ratchet` | 69/69 |
| `gate:vocab` | `npm run gate:vocab` | OK (346 fichiers) |
| `lang:gate` | `npm run lang:gate` | OK |
| `export:check` | `npm run export:check` | OK |
| CI `g3-site` | `npm run build -w @monark/site` puis `node scripts/assert-fleet-html.mjs` | build vert ; quatre assertions OK |
| CI `g3-export`, `g3-verification`, `g4-architecture` | test 42, `gate:vocab` + `typecheck` + tests, `lint` + `lint:ratchet` | couverts par les lignes ci-dessus, verts |

## R-25

`r25()` de `scripts/oracle/r25.mjs` contre `740645b2`, à `26fdf987` : **STAT 496** (+321 / −175, dont 10 lignes des cinq ré-ancrages) ≤ 547 ; CONTENT_STAT 0. G0 court : 492 au prototype. Estimation du bloc pour 3c-4b : ~470, dont ~60 de `canonicalRow` coupé. **PR C'** : 344 (3c-4a) + 496 ≈ 840 ≤ 1 205.

## Coupe (Q-CP-8)

Le poste 14 (`canonicalRow` réexportation de `canonicalJson`) porterait le lot vers ~556 > 547 : **coupe nommée appliquée dès le G0 court**, acceptée par MONARK (Q-CP4B-4). Il sort du chantier 1.1.0 (aucun octet servi) ; **item après T0** (proposé : `CANONICAL-ROW-REEXPORT-1`), avec T-17 (`canonical_row_is_canonical_json`, clé non ASCII refusée, messages de `cm3b-engine.test.ts`). La seconde coupe de réserve (Q-3b2-2) n'est pas tirée : le poste 13 est livré.

## Écarts au G0 du bloc C'

1. **Poste 14 coupé** (ci-dessus) ; T-17 non écrit.
2. **B-12 sur USDe et liq par la ligne admise** (postes 9 et 13 ensemble) : ces chemins lisent `qhat` et `alpha` sur la ligne, construite au rang exact ; `n_calib` et `scores_sha256` restent dérivés des scores engagés (format gelé), leur égalité avec la ligne tenue au chargement (`guardMarginalTable`).
3. **Bord additif hors binary64** : `under_calib` comme avant (pas de bord `Number.MAX_VALUE`) ; q̂ négatif ou NaN : chemin M5 inchangé.
4. **Borne haute liq** [0, ŷ + q̂] : ni B-13 ni B-16 (q̂ = 0 reste `under_calib`, delta D-2) ; `ukemi-strata.ts` relu, inchangé.
5. **`honestyText` garde sa signature** ; le deuxième paramètre est la clé résolue.
6. **T-13 sans test neuf** : inversions seules ; la ligne NDG-1 de L3 est dans `oracle-l3-interval.test.ts` (`l3.test.ts` inchangé).
7. **Trace H5 réenregistrée** (non nommée au §1.3 du bloc) : elle porte le `content` USDe.
8. **Erratum du G0 court** : au tableau de la section 4, le second tueur de T-11 est **`calibrate.ts:165`**, non `:166`.

## Réponses aux questions du G0 court (MONARK)

- **Q-CP4B-1** (texte liq s1 à s3) : défaut accepté, le texte de classe à l'octet (NOTICE-1-1-0 §2.9, décision V-1 à V-8).
- **Q-CP4B-2** (clause BYO de la description, `[yhat - q̂, yhat + q̂]`) : défaut accepté, gardée.
- **Q-CP4B-3** (bord additif hors binary64) : défaut accepté, `under_calib`.
- **Q-CP4B-4** (coupe de `canonicalRow` au G0) : acceptée ; item après T0.

## Suite

G2 adverse en cours sur `26fdf987` (revue séparée) ; le pli de la G2 suivra dans ce G7. Puis la PR C' vers `base/chantier-moteur-2026-10-03` (MONARK : contrôle par diff, oracle Windows, fusion) ; NOTICE-1-1-0 finalisée après le gel de C' (§2.4 rang exact, §2.7, §2.8, §2.9).
