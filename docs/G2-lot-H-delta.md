# Revue G2 DELTA — Lot H (`packages/hikae`) — vérification indépendante des 5 corrections

- **Verdict : CLOS-AVEC-RÉSERVES** (corr. 1-3 CLOS ; corr. 4 CLOS-AVEC-RÉSERVE ; corr. 5 hors périmètre, orchestrateur).
- **Réviseur** : relecteur **G2 DELTA**, instance séparée, **contexte frais**, **≠ générateur** et **≠ orchestrateur**
  ayant appliqué les corrections. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme
  au roster mainteneur 2026-08-14 ; effort max ; non `claude-opus-5`, banni).
- **Date** : 2026-09-05 · **Worktree** : `F:\Monark-wt-hikae` · **Branche** : `phase1/hikae` · **HEAD** : `fcfa4cf`.
- **Objet** : les 5 corrections de `docs/G2-lot-H.md` §3 ont été appliquées par l'**ORCHESTRATEUR**
  (`claude-fable-5-1` — déviation roster consignée : un Fable a touché du code au lieu d'un worker Opus 4.8).
  Cette revue est la **vérification indépendante obligatoire (R-21) avant G7**. Je ne committe rien, je n'ai
  modifié aucun fichier suivi (R-20) ; tous les mutants sont **restaurés à l'octet** (§2, §7).
- **Environnement** : `node v24.15.0`, `npm 11.12.1` (type-stripping `.ts`). Commandes depuis `F:\Monark-wt-hikae`.
- **État de référence figé au départ** : `git status --porcelain` = **13 entrées** (` M packages/hikae/src/index.ts` +
  12 `??` dont `docs/G2-lot-H.md`). Les fichiers Lot H sont **non suivis** (sauf `src/index.ts`, tracked-modifié) ⇒
  mutants sauvegardés par `cp` hors-worktree, `git checkout` serait un no-op. sha256 des 22 fichiers `packages/hikae`
  capturés au départ ; ré-vérifiés identiques à la fin (`sha256sum -c` : 0 FAILED).

---

## 1. Corrections 1-4 — CLOS oui/non + preuve

### Correction 1 — prédicteurs D7 câblés & provenance honnête → **CLOS**

**(1a) `momentum4c` ET `oracleDidactique` réellement exécutés par `runS2` — prouvé par mutation.**
`runS2` (`src/s2/run.ts:132-133`) appelle `labeledFromPredictor(candles,"momentum-4c")` puis `…,"oracle-didactique")` ;
`labeledFromPredictor` (`src/s2/instrument.ts:165-166`) invoque `momentum4c(extractMomentumFeatures(byClose,t))` et
`oracleDidactique(target)`. Le test `s2_report_reproducible` (`test/s2.test.ts:64-77`) appelle `runS2()` et exige
l'égalité octet — c'est l'oracle d'exécution.

| Mutant | Fichier:ligne (avant→après) | `node --test test/s2.test.ts` | Effet mesuré (probe `runS2()`) |
|---|---|---|---|
| **A** — `momentum4c`→`"up"` | `predictor.ts:96` `return signDirection(f.closes[0],f.closes[4]);` → `return "up";` | `s2_report_reproducible` **✖**, `s2_predictors_wired` **✖** | journal digest `9afec079…`→`516ec1e9…` ; S2b-pooled `yhat` = `{up:695}` (était `{down:341,up:354}`) ; **agrégats invariants par arithmétique, non par accident** (sous le mutant, zéros calib = #(y=up) = **164** ≪ p=271 ⇒ q̂=1 forcé ; mesuré sur le TSV, le split portant sur les points évaluables, indépendant de `yhat`) — seule la colonne `yhat` par point + le hash changent |
| **B** — `oracleDidactique`→`"up"` | `predictor.ts:105` `return labelOf(candle);` → `return "up";` | `s2_report_reproducible` **✖**, `s2_predictors_wired` **✖** | journal digest →`f865bc73…` ; S2b-oracle `yhat` = `{up:695}` (était `{up:354,down:333}`, n 687→695) ; **§6b q̂ 0→1** (changement d'agrégat visible) |

Mutant A démontre le câblage de `momentum4c` par la colonne par-point + le hash (les agrégats sont insensibles car
momentum≈pièce donne q̂=1 quel que soit le sens — propriété saine : le test mord au niveau provenance, pas seulement
agrégat). Mutant B démontre le câblage de `oracleDidactique` par un changement d'agrégat **et** de hash. Les deux
fichiers restaurés à l'octet (`predictor.ts` sha256 `8b4444ca…`, re-vérifié 2× entre A et B).

Corroboration **dans le journal committé** (`docs/S2-journal-fixtures-synth.tsv`, `cut -f6/-f7/-f8`, sans mutation) :
`predictor_id` par campagne = `internal:momentum-4c` (S2b-pooled 695, asia 247, americas 224), `internal:oracle-didactique`
(S2b-oracle 687), `synthetic` (S2a 300) ; **S2b-oracle : 0/687 lignes ŷ≠y** (oracle ŷ=y), **S2b-pooled : 346/687 lignes
ŷ≠y** (momentum ≈ pièce, ~50 %). Provenance réelle, pas étiquetée à vide.

**(1b) Aucun id de prédicteur littéral dans `report.ts`** → **CLOS**. `grep 'internal:momentum-4c\|internal:oracle-didactique'
src/s2/report.ts` = **uniquement lignes 37 et 39 (commentaires JSDoc)** ; la sortie rendue utilise `${MOMENTUM_4C_ID}`/
`${ORACLE_DIDACTIQUE_ID}` (importés `report.ts:13` depuis `predictor.ts:17-18`). Les seules définitions-chaînes vivent
dans `predictor.ts` (R-3 fermé). *Note mineure §5.1 : le littéral subsiste dans deux commentaires — non fonctionnel.*

**(1c) Le rapport n'attribue plus les 9 états à ŷ=y** → **CLOS**. `report.ts:150-151` (et rendu `S2-RAPPORT:45`) : « Les 9
états … produits par le vrai `gate()` sur des verdicts à **scores déclarés** (COMMIT : 47/50 ⇒ q̂=0 ; DEFER : 25/50 ⇒
q̂=1) — **pas** par l'oracle ». Les scores déclarés (`GOOD_SCORES` 47×0+3×1, `BAD_SCORES` 25/25) sont dans
`instrument.ts:345-346` ; le commentaire `instrument.ts:338-342` confirme « pas ŷ=y — G2 Lot H corr. 1 ». L'oracle ŷ=y
n'apparaît plus que dans le bloc §6b **séparé** (campagne `oracleReal` réellement exécutée, q̂=0, couverture 100 %,
commit 100 % — cohérent avec un vrai ŷ=y). Contradiction initiale (COMMIT à 3 miscovers ≠ oracle 0-miscover) levée.

### Correction 2 — test 7 `deferral_preserves_miscover` non vacuous → **CLOS**

Mutant **C** : `l3-gate.ts:80` `action: "defer"` → `action: "commit"` (sha256 `c6f8cc29…`→`eeb2ad85…`).
`node --test test/l3.test.ts` : `deferral_preserves_miscover` **✖** (`AssertionError: π^H reporte les deux 2-sets — 0 !== 2`)
**et** `set_too_large_defers` **✖** ; `intent_not_in_region_denied`, `timeout_is_deny` **✔**. Le test réécrit
(`test/l3.test.ts:72-102`) exerce désormais deux politiques réellement distinctes via `gate()` (π^H τ=1, π⁰ τ=2) et
compte `defers`/`commits`/`miscover` sur le `C_t` porté par la décision — il **rougit** quand `defer→commit`.
**Contraste avec la revue initiale** (`G2-lot-H.md` §4.2) : ce même mutant laissait alors test 7 **vert** (vacuous) ;
il est maintenant **rouge**. `l3-gate.ts` restauré à l'octet (`c6f8cc29…`).

### Correction 3 — plus de `.tmp-vocab/` dans l'arbre, tmpdir nettoyé → **CLOS**

`test/contracts-integration.test.ts:67` = `mkdtempSync(join(tmpdir(),"hikae-vocab-"))` + `rmSync(scratch,{recursive,force})`
(`:76`) — écriture hors-worktree, éphémère, nettoyée. Vérifications (git status **fiable** ici : `git check-ignore -v
.tmp-vocab` = **non ignoré**) : avant/après **deux** `npm run ci` complets — **aucun** `.tmp-vocab/` en `git status`,
**aucun** `hikae-vocab-*` résiduel dans `os.tmpdir()`, `find -type d -name .tmp-vocab` = vide. Arbre laissé intact.

### Correction 4 — rapport S2 reproductible & lignes D10 → **CLOS-AVEC-RÉSERVE**

**Limbe reproductibilité (CLOS).** Mutant **D** : dans le rapport committé, `= 96.0 %` → `= 95.0 %` (S2a, `S2-RAPPORT:14` ;
sha256 `20ff4168…`→`2c0bfe6e…`). `node --test test/s2.test.ts` : `s2_report_reproducible` **✖**
(`AssertionError: rapport committé ≠ rapport régénéré (relancer scripts/s2-report.mjs)`) ; autres tests s2 **✔**. Toute
dérive d'un chiffre committé rougit. Rapport restauré à l'octet (`20ff4168…`).

**Lignes D10 (CLOS).** `grep -c _D10 S2-RAPPORT = 4` : §3 S2a (n=300), §4 S2b-poolé (n=687), §6a (n=687, `S2b-pooled`),
§6b (n=687, `S2b-oracle`) — chacune porte **n · étiquette `fixtures-synth/…` · date 2026-09-04 · journal sha256**.

**Hash TSV (CLOS).** sha256 du TSV committé = `9afec0795feef10f3362cad565325acbc3afbc81c7504e3594dd3597fbdd5833` ==
**exactement** celui cité `S2-RAPPORT:11` (forme longue) et en tête D10 (forme courte `9afec0795feef10f…`). `.gitattributes`
(`* text=auto eol=lf`) **couvre** `.tsv`/`.md` et **prime** sur `core.autocrlf=true` ⇒ checkout LF sur clone frais ⇒ le
`sha256sum` humain reste reproductible (risque autocrlf **écarté**). « 2153 lignes » (`S2-RAPPORT:11`) = lignes-données
(300+247+224+695+687), le fichier compte 2154 lignes en-tête incluse — cohérent, pas une erreur.

**RÉSERVE (voir §5.2).** Le bloc §5 M2 affiche des chiffres (`coverage clean=0.983 → flipped=0.017`, `S2-RAPPORT:31`)
qui **ne portent pas de ligne D10**, dont les paramètres (graine 42, n=120, accuracy 0.95, nCalib 60 —
`instrument.ts:455-462`) sont **absents du bloc 1**, et dont les campagnes `M2-clean`/`M2-flip` **ne sont pas dans le
journal TSV** (`run.ts:162` exclut `runMutants`) — alors que le bloc 2 affirme globalement « **Tout** chiffre ci-dessous
se recalcule depuis ce journal sans croire HIKAE (D10) ». Ces chiffres sont reproductibles **par ré-exécution du harnais**
(`s2_report_reproducible` les régénère) mais **non recalculables depuis le journal** et **sans D10** — précisément le
résidu que corr. 4 nommait (elle listait « M2 0.983→0.017 »). C'est ce point qui fait basculer corr. 4 en CLOS-AVEC-RÉSERVE.

---

## 2. Test de mutation — synthèse (4 mutants, tous restaurés à l'octet)

| # | Cible | sha256 réf. | test rouge attendu | résultat | restauré |
|---|---|---|---|---|---|
| A | `momentum4c`→`"up"` | `predictor.ts` `8b4444ca…` | `s2_report_reproducible` | ✖ + `s2_predictors_wired` ✖ | `8b4444ca…` ✔ |
| B | `oracleDidactique`→`"up"` | `predictor.ts` `8b4444ca…` | `s2_report_reproducible` | ✖ + `s2_predictors_wired` ✖ | `8b4444ca…` ✔ |
| C | `l3-gate.ts:80` `defer`→`commit` | `l3-gate.ts` `c6f8cc29…` | `deferral_preserves_miscover` | ✖ + `set_too_large_defers` ✖ | `c6f8cc29…` ✔ |
| D | `S2-RAPPORT:14` `96.0 %`→`95.0 %` | rapport `20ff4168…` | `s2_report_reproducible` | ✖ | `20ff4168…` ✔ |

Sauvegardes `cp` hors-worktree ; restaurations vérifiées par sha256 immédiatement après chaque run ; `sha256sum -c`
final sur les 22 fichiers = **0 FAILED**.

---

## 3. Recalcul À LA MAIN depuis `docs/S2-journal-fixtures-synth.tsv` (sans croire HIKAE)

`awk`/`grep` sur le TSV committé, comparé au rapport :

| Grandeur (bloc S2b poolé / §6a) | Recalcul TSV | Rapport | ✓ |
|---|---|---|---|
| rôles `S2b-pooled` | calib **300**, holdout **387**, excluded **8** (Σ 695) | n_calib=300, m=387 | ✓ |
| scores calib (col 10) | **145** zéros / 155 uns sur 300 | — | ✓ |
| q̂ : p=`ceil(301·0.9)`=**271** ; zéros(145) < 271 ⇒ q̂=**1** | **1** | q̂=1 | ✓ |
| couverture §6a = covered/m (col 12) | **387/387 = 100 %** | 100.0 % | ✓ |
| contrôle indépendant : ensembles hold-out (col 11) | **387× `{up,down}`** (q̂=1 ⇒ ensemble plein ⇒ couvert par construction, sans lire la colonne `covered`) | abst. 100 % | ✓ |
| strates : asia 60/185, americas 60/162 ; S2b-oracle 300/387, 0 exclu | idem | idem | ✓ |

Concordance exacte. Le contrôle « colonne ensemble » établit la couverture 100 % **sans** faire confiance à la colonne
`covered` calculée par HIKAE.

---

## 4. Contrôles globaux

- **`npm run ci`** (racine) : **exit 0**, `tests 66 / pass 66 / fail 0` — reproduit **2×** (baseline + après restauration
  de tous les mutants). Décomposition inchangée vs revue initiale +2 (`s2_report_reproducible`, `s2_predictors_wired`).
- **`gate:vocab`** : OK (intégré au CI vert ; 19 fichiers, 0 claim).
- **`grep TODO|FIXME|XXX|HACK` + `: any|as any|<any>` sous `packages/hikae/{src,test,scripts}`** : **0** (aucun nu introduit).
- **`git diff packages/hikae/src/index.ts`** (seul fichier tracked-modifié) : expansion propre du stub Phase 0
  (`export const HIKAE_PHASE="0-stub"`) vers un barrel exportant la chaîne S2 (`runS2`, `labeledFromPredictor`,
  `generateCandleSeries`, …) — cohérent avec corr. 1, aucune régression de type (tsc strict vert).
- **git status final** = **identique** à la référence (13 entrées ; `diff` trié = vide) **+** ce seul livrable
  `docs/G2-lot-H-delta.md` une fois écrit.

---

## 5. Défauts résiduels introduits/laissés par les corrections (liste fermée)

| # | Fichier:ligne | Nature | Sévérité |
|---|---|---|---|
| 5.1 | `test/s2.test.ts:21` | **Commentaire périmé** : « le jeu de MÉCANISME … produit par le vrai `gate()` (**oracle didactique + mutants**) ». Contredit le code corrigé (`instrument.ts:338-342` « scores DÉCLARÉS pas ŷ=y »), `README:44-45` (« pas ŷ=y »), `report.ts:150` (« pas par l'oracle »). Ré-étiquette les 9 états vers l'oracle — **même classe de défaut que corr. 1**, laissée dans un commentaire de test. Sans effet comportemental (l'oracle du digest est correct). Le libellé correct existe déjà dans `README:44-45` ⇒ correction = copie d'une ligne, pas une décision. | **basse** |
| 5.2 | `S2-RAPPORT:31` (M2) vs `:11` (bloc 2) | **Chiffres sans D10 / non recalculables depuis le journal** : `0.983 → 0.017` sans ligne D10, params hors bloc 1 (`instrument.ts:455-462`), campagnes M2 hors TSV (`run.ts:162`), alors que le bloc 2 affirme « tout chiffre … se recalcule depuis ce journal ». Reproductible par ré-harnais mais l'affirmation globale de recalculabilité **sur-porte**. (= la RÉSERVE de corr. 4.) | **basse-moyenne** |
| 5.3 | `report.ts:135` / `S2-RAPPORT:38` | Texte « Attendu » §6a : « au score 0/1, **n=50**, α=0,10 ⇒ COMMIT exige ≤ 4 erreurs/50 » juxtaposé à un bloc dont n_calib=**300** (⇒ ≤ 29/300 pour q̂=0). L'énoncé n=50 est correct en soi (plancher `nMin`) mais prête à confusion à côté du 300. | **basse** |

Aucun de ces points n'est comportemental ni sécuritaire ; ce sont des défauts de **fidélité de documentation/commentaire**,
de la même classe que les corrections 1 et 4, incomplètement nettoyée. Aucun n'introduit de régression fonctionnelle
(CI 66/66). Ils constituent les **réserves** du verdict.

---

## 6. Correction 5 (propriété ORCHESTRATEUR — hors périmètre 1-4, non bloquant, signalé avant G7)

`docs/JOURNAL-PROVENANCE.md:90-140` (section « Lot Phase 1 ») porte G0, checkpoint 1, **Gate-0 du validateur**,
amendements, et la liste des **fichiers racine** écrits par l'orchestrateur — mais **toujours pas** : (a) une **ligne de
provenance du CODE Lot H** (tableau P4/R-9), ni (b) une déclaration **Gate-0 (R-1) du worker Lot H** (modèle résolu /
effort / contexte). Corr. 5 reste donc **ouverte** ; à fermer par l'orchestrateur avant clôture G7 (dette de traçabilité,
pas un défaut du code). *Note additionnelle pour G7 : les corrections 1-4 ont été appliquées par un Fable (`claude-fable-5-1`)
et non par un worker Opus 4.8 — déviation roster à consigner au journal (`error_origin`).*

---

## 7. Verdict & attestation de restauration

**VERDICT : CLOS-AVEC-RÉSERVES.**
- Corr. **1, 2, 3 : CLOS** — câblage réel des deux prédicteurs prouvé par mutation (A,B) + corroboré par le journal ;
  test 7 non vacuous prouvé par mutation (C) ; arbre propre / tmpdir vérifié sur 2 CI.
- Corr. **4 : CLOS-AVEC-RÉSERVE** — reproductibilité prouvée par mutation (D), 4 lignes D10 présentes, hash TSV == cité
  (autocrlf écarté par `.gitattributes`) ; **réserve** : chiffres M2 (§5) sans D10 / non recalculables depuis le journal,
  face à l'affirmation globale du bloc 2.
- Aucune régression fonctionnelle ni de sécurité ; les réserves (§5.1-5.3) sont de fidélité documentaire, de la classe
  même que les corrections. Corr. 5 (orchestrateur) reste due avant G7.
- **Recommandation à l'orchestrateur (G7)** : soit fermer les 3 réserves §5 par une passe documentaire courte (ligne D10
  ou déclaration de paramètres pour M2 dans le bloc 2 ; commentaire `s2.test.ts:21` ; texte §6a) **avant** clôture, soit
  accepter-avec-note (réserves consignées, non contournées) — au choix, jamais un « dû » nu.
- **Divulgation d'indépendance (R-21 — biais de même famille de modèle)** : les corrections 1-4 ont été écrites par
  `claude-fable-5-1` (orchestrateur) ; l'advisor consulté pendant cette revue est **aussi** `claude-fable-5-1` (même id
  catalogue). Moi réviseur je suis `claude-opus-4-8` (≠ générateur, ≠ orchestrateur), mais correcteur et advisor
  partagent une identité — précisément le biais que la thèse TeamBench (doc 06) dit non résoluble par la seule séparation
  de prompt. **Mitigation** : aucun avis d'advisor n'est entré dans ce rapport sans exécution indépendante — chaque preuve
  est un mutant lancé et mesuré (A-D), une recomputation `awk` depuis le TSV committé, ou un `sha256`/`git` reproductible.
  La prédiction de l'advisor « mutant A ⇒ agrégats invariants » a été **testée** (164 zéros calib mesurés ≪ 271), pas crue.

**Restauration (R-20/R-21)** : les 4 mutants sont restaurés à l'octet (§2) ; `sha256sum -c` des 22 fichiers `packages/hikae`
= 0 FAILED ; `git status --porcelain` final = **13 entrées identiques** à la référence **+** ce seul fichier
`docs/G2-lot-H-delta.md`. Aucun fichier suivi modifié, aucun commit, aucun workflow déclenché. Verdict final et G7 :
orchestrateur (R-21).
