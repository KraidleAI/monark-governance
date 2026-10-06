# G0 court du lot CM-3c-4b (contrat 1.1.0, bloc C', second lot de la PR C') : moteur (lignes servies B-12, B-13, B-16, S-8), postes 9 à 13

- **Plan** : `docs/G0-lot-c-prime.md` (`8f554390`) : §1.2 (postes 9 à 14), §1.3, §4 (T-10 à T-17), §5 (R-25 ~470, coupe nommée), §7 (P-3), §8 (Q-CP-6, Q-CP-8, Q-CP-9), §9. G7 du lot 3c-4a (`docs/G7-lot-c-prime-a.md`) et sa G2 (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-c-prime-3c-4a.md`, aucun bloquant, rien qui touche le moteur). Réponses de MONARK au G0 du bloc C' : tous les défauts acceptés (`…-155-G0-c-prime.md`).
- **Base** : 3c-4a est fusionné (#164) dans `base/chantier-moteur-2026-10-03`, aujourd'hui `9b5511e0` (elle porte aussi la ligne de RUNBOOK de MONARK, Q-CPA-2). La branche `recherches/c-prime-site` l'a reçue par le commit de fusion **`740645b2`** (sans rebase) : **base de mesure du lot** (empreintes, rouges, R-25, ancres).
- **Statut** : G0 court, écrit avant les tests rouges et le gel. Il porte les empreintes que demande P-3 (section 3). Auteur : RECHERCHES. Aucune PR.

## 1. Périmètre (rappel)

Le lot change le calcul servi sur la liste fermée du bloc C (§4 du G0 du bloc C, lignes 4 à 7), et rien d'autre :

| Poste | Ligne | Ce qui change |
|---|---|---|
| 9 | B-12 | `splitRankShortest(n, alpha)` et `splitQuantileShortest(scores, alpha, nMin)` (`packages/hikae/src/l1-split.ts`) : `String(alpha)` lu comme rationnel exact (exposant compris, sans limite de décimales), rang ⌈(n + 1)(1 − a)⌉ en BigInt, aucun refus neuf. Branchés sur le BYO (`gate.ts:454`, intervalle et ensemble), `calibrate` (`calibrate.ts:166`) et `conformInterval` (cascade, population USDe non engagée). `splitQuantile` reste exporté et inchangé. |
| 10 | B-13 | `scoreTestBand(yhat, qhat)` (`packages/hikae/src/region.ts`) : `hi` = plus grand double x avec fl(x − ŷ) ≤ q̂, `lo` = plus petit avec fl(ŷ − x) ≤ q̂, par bissection sur les motifs binaires (spec §8). USDe, BYO intervalle, conformeur. Phrase B-7 retirée de `STABLE_RUN_COMMITTED_CORE` (description, `content`, texte de table USDe, `policy_table_sha256` USDe). |
| 11 | B-16 | largeur nulle : `buildIntervalRegion` rend `region_degenerate` (verdict sans région), et la ligne NDG-1 de `decideInterval` (`l3-gate.ts:128`) aussi. |
| 12 | S-8 (B-8) | `honestyText` lit la case résolue (le `cell_key` du verdict, que `registry.ts:76` passe) dans la table servie : texte de la ligne courante de cette clé, sinon texte de la classe, puis le suffixe inchangé. Liq s0 : phrase calibrée ; liq s1 à s3 : texte de la classe. Composition Z-3 et liste close de l'écart liq (coupe (a) de C2). |
| 13 | Q-3b2-2 | `qhat` et `alpha` servis USDe et liq lus sur la ligne admise (`admittedSplit`, `gate.ts`), plus recalculés depuis les scores. Le test d'égalité (tueur `policy-marginal.ts:44`) reste. |

Changements servis attendus (rejeu de 111 appels mesuré sur le prototype) : **39 appels** bougent, tous par les bords B-13 (36 USDe, 3 BYO intervalle `(1 ; 1)` où `lo` passe de 0 à −2⁻⁵³) ; aucune action ni raison ne bouge dans le rejeu. Hors rejeu : B-12 sur les couples BYO et `calibrate` où rang flottant et exact diffèrent ; B-16 sur les largeurs nulles ; S-8 sur le `content` liq s1 à s3 ; B-7 sur la description et le `content` USDe. USDe (613 ; 0,1) → 553 et liq (170 ; 0,01) → 170 inchangés.

## 2. Écarts au G0 du bloc C'

1. **Poste 14 (`canonicalRow`) coupé dès ce G0** (coupe nommée, §5 et Q-CP-8). Le prototype complet des postes 9 à 13 mesure **492** lignes R-25 contre la base `740645b2` ; le poste 14 (~60, dont la suppression du corps de `canonical-row.ts` et les messages épinglés de `cm3b-engine.test.ts`) porterait le lot vers ~550 > 547. Il sort du chantier 1.1.0 (aucun octet servi), item à part après T0. T-17 n'est pas écrit. La seconde coupe (Q-3b2-2) n'est pas tirée.
2. **B-12 sur USDe et liq par la ligne admise** (postes 9 et 13 ensemble) : ces deux chemins n'appellent plus de quantile ; ils lisent `qhat` et `alpha` sur la ligne courante de la case, construite au chargement au rang exact (`splitRankExact` de l'`alpha` de la ligne, égal à `String(alpha)` imposé). `n_calib` et `scores_sha256` restent dérivés des scores engagés par `buildVerdict` (format gelé) : leur égalité avec `n` et `scores_sha256` de la ligne est tenue au chargement (`guardMarginalTable`) et par `served_values_equal_the_admitted_row`.
3. **Bord additif non fini** : si ŷ − q̂ ou ŷ + q̂ sort de binary64, `scoreTestBand` garde le comportement d'avant (`under_calib` par `buildIntervalRegion`), au lieu d'un bord `Number.MAX_VALUE` que donnerait la lettre de la spec. Un q̂ négatif ou NaN garde aussi l'ancien chemin (M5). Voir Q-CP4B-3.
4. **Borne haute liq [0, ŷ + q̂]** : ni B-13 (0 ulp mesuré par DEM-4, garde LIQ-BAND-EXACT-GUARD-1) ni B-16 (q̂ = 0 reste `under_calib`, delta D-2, `liqUpperBoundRegion` relu ; ŷ + q̂ = 0 y est inatteignable). Le chemin borne supérieure d'ukemi (`ukemi-strata.ts:49-58`) n'est pas modifié.
5. **S-8 sans changement de signature** : `honestyText(taskClass, cellKey, isByo)` garde ses trois paramètres ; le deuxième est désormais la clé résolue (le `predictor_id` pour USDe et cascade, la clé de strate pour liq). La lecture de la table rend la composition Z-3 vraie par construction sur toutes les classes servies.
6. **T-13 sans test neuf** : les inversions nommées par le G0 du bloc couvrent USDe (`numeric_under_calib_region_is_not_directional`, cas NDG, et `gate_stable_run_ndg1_…`), le BYO intervalle (deux tests), le conformeur et L3 (`interval-nondegenerate.test.ts`), plus `interval_lo_le_hi`, `conform_scaled_band_serves_zero_to_h_star` (constante d'abstention) et `oracle_l3_interval_path_reason_order_exhaustive`. La ligne NDG-1 de L3 est dans ce dernier fichier, pas dans `l3.test.ts` (inchangé).
7. **Ré-épinglages** (§1.3) : rejeu de 111 appels (projection et octets), bande USDe (octets), description servie (`hdesc_…`), `PENDING_BODIES_SHA256` (`/openapi.json`, `/gate`), `harness-pending.json` par `--pending`, entrée du manifeste et `PINNED`, et la **trace H5** (`fixtures/h5-e2e-trace.json`, réenregistrée par son générateur : le `content` USDe et ses bords ; ligne d'empreinte de sa PROVENANCE seule, son texte va à T0). `calibration.ts` ne bouge pas (aucune empreinte de scores ne change). `ukemi-pending.json` ne bouge pas : `--pending` d'ukemi lancé puis annulé (seul `written_at` bougeait). `test/site-ukemi.test.ts:152` reste vert (Q-CP-9 : aucune ouverture de zone demandée).

## 3. Empreintes pour la seconde ligne datée Z-3 de MONARK (P-3)

**Méthode** : à la base de mesure `740645b2`, en processus (Node 24.21.0), import de `apps/harness/src/tools/gate.ts` ; texte USDe = `STABLE_RUN_COMMITTED_SENTENCE` dont on retire exactement la sous-chaîne `; each band edge is yhat - qhat or yhat + qhat rounded to the nearest double, so it can differ from the exact edge by up to half a unit in the last place of that edge; the band is not widened for it` (présente une fois) ; texte liq s1 à s3 = texte de classe de la table liq servie (`SERVED_TABLE_TEXTS.classText("liquidation-eligible-coverage")`, soit `LIQ_EMPTY_REGISTRY_SENTENCE`, inchangé). Empreinte = sha256 des octets UTF-8 exacts de la chaîne JavaScript, sans fin de ligne. La phrase servie est le texte de table suivi de `; B_t is caller-carried.` (règle Z-3) ; le `content` servi la fait suivre d'une espace et de la ligne `verdict …`. Contrôle : les mêmes valeurs à la base reproduisent les empreintes de la première ligne Z-3 (`84be45f0…e767a6`, 926 octets ; `adaa0118…f4a39f`, 482 octets ; `94f90557…b06830`, 110 octets).

**Octets hachés** : la valeur JavaScript (chaîne) de la constante ou de la fonction nommée, encodée en UTF-8 (`Buffer.from(s, "utf8")`), **sans fin de ligne ni BOM**, rien avant ni après. Ce n'est pas le corps JSON (`content[0].text` du JSON est la même chaîne, échappée) ; la ligne `verdict …` qui suit dans le `content` servi n'est pas hachée. **Commande** (racine d'un arbre à `740645b2` ou à la tête poussée de ce G0, `node_modules` en place, Node 24) :

```sh
node --input-type=module -e '
import { createHash } from "node:crypto";
const g = await import(process.cwd() + "/apps/harness/src/tools/gate.ts");
const B7 = "; each band edge is yhat - qhat or yhat + qhat rounded to the nearest double, so it can differ from the exact edge by up to half a unit in the last place of that edge; the band is not widened for it";
if (g.STABLE_RUN_COMMITTED_SENTENCE.split(B7).length !== 2) throw new Error("B-7 clause not found once");
const usde = g.STABLE_RUN_COMMITTED_SENTENCE.replace(B7, ""), liq = g.SERVED_TABLE_TEXTS.classText(g.TASK_LIQ_ELIGIBLE);
for (const [k, s] of [["usde", usde], ["usde served", usde + "; B_t is caller-carried."], ["liq s1-s3", liq], ["liq s1-s3 served", liq + "; B_t is caller-carried."]]) { const b = Buffer.from(s, "utf8"); console.log(k, b.length, createHash("sha256").update(b).digest("hex")); }'
```

Au gel, la même mesure se lit sans retrait : `STABLE_RUN_COMMITTED_SENTENCE` (et le `text` de la ligne USDe de la table servie) pour USDe, `honestyText("liquidation-eligible-coverage", "<base>/s1", false)` pour liq s1 (phrase servie).

| Texte | Octets | sha256 |
|---|---|---|
| USDe, texte de table (ligne de la clé USDe), sans la phrase B-7 | 728 | `8fce32e1d3568735743b42916fb61e5f78c58d5d7f9c1ac67b71cb9410c1f34d` |
| USDe, phrase servie (texte de table + `; B_t is caller-carried.`) | 752 | `4feaf914cd42b761e433d569510a02f9c723d2f1cf0b18ce1064d6db3eaf2f70` |
| liq s1 à s3, texte servi par S-8 (texte de classe de la table liq) | 110 | `94f90557563d3c37c834f67b5353ddebdf8bf281698088d146cf91d611b06830` |
| liq s1 à s3, phrase servie (texte de classe + `; B_t is caller-carried.`) | 134 | `98cc5ba5e5c8cc0a1f23ca2033a8c49a10b5e969724b3976acf0009005092e4d` |

Pour information (non demandées par P-3) : `STABLE_RUN_COMMITTED_CORE` sans B-7, 665 octets, `b2a435f15b1517da100c8181a584743c9cd219d97a2188af809c38f6498834c8` (base : 863 octets, `b5efc030…00451e`) ; description servie de `gate` (`tools/list` et `/openapi.json`), 3 247 octets, `bfb474f36957ea2390c4f4b99dbbebbea128724d7a7e3b58c1bbe81553016443` (base : 3 445 octets, `4279a54d…553f38`). Les textes liq s0 (`adaa0118…`), USDe autre population, cascade et le texte de classe USDe ne changent pas. Le gel (étape suivante) confirmera que ces octets sont ceux qu'il sert.

## 4. Tests rouges d'abord (un tueur par test, forme fermée, adresses au gel)

| # | Test | Fichier | Rouge à la base parce que | Tueur |
|---|---|---|---|---|
| T-10 | `split_rank_shortest_four_killers` | `packages/hikae/test/l1.test.ts` | fonctions absentes | `l1-split.ts:233` rang flottant |
| T-11 | `gate_byo_and_calibrate_use_the_exact_rank` ((24 ; 0,44) → 14) | `apps/harness/test/calibrate.test.ts` | rang flottant 15 | `gate.ts:454` `splitQuantile` rebranché ; `calibrate.ts:166` à la main |
| T-12 | `interval_edges_follow_the_score_test` (inverse R-3 de CM-2b) | `apps/harness/test/gate-cm2b.test.ts` | phrase B-7, bords additifs | `region.ts:109` ROR de la bissection |
| T-13 | inversions (section 2, point 6) | `gate.test.ts`, `interval-nondegenerate.test.ts`, `region-predictor.test.ts`, `oracle-l3-interval.test.ts`, `cm3b-engine.test.ts`, `oracle-fixtures.test.ts` (bord B-13) | `under_calib` ; bord additif | `CONST "region_degenerate" -> "under_calib"` à `region.ts:75`, `l3-gate.ts:128` ; `gate.ts:476` ; `interval-conformer.ts:88` ; tueurs existants gardés là où ils tuent encore |
| T-14 | `liq_honesty_text_follows_the_resolved_cell` (inverse `u4b_liq_committed_text_is_honest`) ; `u4b_gate_serves_region_from_real_artifact` | `gate-liq.test.ts`, `gate-liq-artifact.test.ts` | texte choisi sur le registre | `gate.ts:709` ancien critère |
| T-15 | `served_text_is_table_text_plus_suffix` (USDe, autre population, cascade, liq s0 à s3 ; liste close de l'écart vide) | `gate-cell.test.ts` | liq s1 à s3 (USDe et cascade verts à la base, déclarés) | `gate.ts:710` suffixe ; USDe et cascade à la main |
| T-16 | `served_qhat_ncalib_alpha_read_from_the_admitted_row` (enfant dont le constructeur de ligne double q̂) | `gate-cell.test.ts` | valeurs recalculées | `gate.ts:598` valeur recalculée remise |

Adaptation non F2P : `harness_served_honesty_carriers_pass_vocab` (`registry.test.ts`) passe la clé s0 à `honestyText` pour l'appel liq (vert à la base et au gel). Les ré-épinglages (section 2, point 7) vont dans le commit du gel.

## 5. R-25

Prototype complet (postes 9 à 13, tests et ré-épinglages) contre `740645b2` : **+319 / −173 = 492** ≤ 547 (marge 55), CONTENT_STAT 0. Estimation du bloc : ~470 dont ~60 pour le poste 14, coupé ; l'écart (~+80 sur les postes 9 à 13) vient surtout des réécritures en place de `gate.ts` (adresses des tueurs gardées) et des inversions. PR C' : 344 (3c-4a) + ~492 ≈ 836 ≤ 1 205. Mesure exacte au gel.

## 6. Questions (défaut entre parenthèses)

- **Q-CP4B-1. Texte liq s1 à s3.** Le texte de classe servi par S-8 est `no liquidation-eligible-coverage calibration is committed yet; the gate abstains (under_calib) by construction`. Il est servi à côté d'une classe dont s0 est engagée : « no … calibration is committed yet » se lit au niveau de la classe. (Garder le texte de classe à l'octet, comme le disent NOTICE-1-1-0 §2.9 et la décision V-1 à V-8. Un texte propre aux strates serait une troisième ligne Z-3 et un changement du texte de classe de la table.)
- **Q-CP4B-2. Clause BYO de la description** (`` `interval` ⇒ region [yhat - q̂, yhat + q̂] ``) : elle reste, notation de la bande, ses bords venant désormais du test du score. (La garder : la changer ajoute un octet servi hors de la liste fermée.)
- **Q-CP4B-3. Bord additif hors binary64** (section 2, point 3) : `under_calib` comme avant. (Oui ; servir `Number.MAX_VALUE` en bord serait un changement servi neuf.)
- **Q-CP4B-4. Poste 14** : coupé dès ce G0 sur la mesure du prototype plutôt qu'après un gel à ~550. (Oui, coupe nommée de Q-CP-8.)
