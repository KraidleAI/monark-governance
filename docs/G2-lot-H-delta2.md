# Revue G2 DELTA-2 — Lot H (`packages/hikae`) — vérification des corrections des résidus §5.1-5.3

- **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme au roster mainteneur
  2026-08-14 ; effort max ; non `claude-opus-5`, banni). Réviseur **G2 DELTA-2**, instance séparée, **contexte
  frais**, **≠ générateur** et **≠ orchestrateur** (`claude-fable-5-1`) ayant appliqué les corrections.
- **Reprise après coupure de courant** (1re instance n'a rien livré). Livrable unique : ce fichier. Je ne committe
  rien, je ne modifie aucun fichier suivi (R-20) ; tout mutant est restauré à l'octet (§e).
- **Date** : 2026-09-05 · **Worktree** : `F:\Monark-wt-hikae` · **Branche** : `phase1/hikae` · **HEAD** : `fcfa4cf`.
- **Périmètre FERMÉ** (checkpoint 2, corr. 1) : les modifications faites APRÈS `docs/G2-lot-H-delta.md` (§5 résidus
  5.1-5.3) par l'orchestrateur, sur `instrument.ts` (`M2_PARAMS`, `m2Campaigns`, `runMutants` réutilise), `run.ts`
  (M2 au journal, `m2Params`/`m2N` au rapport), `report.ts` (ligne M2 bloc 1, D10 bloc 5, formule q̂=0),
  `s2.test.ts` (commentaire test 14), et le TSV+RAPPORT régénérés. Objet : vérifier que 5.1-5.3 sont clos, qu'aucun
  défaut nouveau n'entre.
- **État de référence figé au départ (cette session)** : `git status --porcelain` = **14 entrées**
  (` M packages/hikae/src/index.ts` + 13 `??` dont `docs/G2-lot-H.md`, `docs/G2-lot-H-delta.md`,
  `packages/hikae/docs/`). Les fichiers Lot H sont **non suivis** ⇒ « committé » dans la mission = fichier livré
  dans le worktree ; sha256 = vérité de contenu. (La revue DELTA citait 13 : son propre livrable
  `docs/G2-lot-H-delta.md` n'existait pas encore.)
- **Environnement** : Node `v24.15.0` (type-stripping `.ts`), commandes depuis `F:\Monark-wt-hikae` (Git Bash).

---

## (a) Résidus 5.1-5.3 clos — fichier:ligne + preuve

### 5.2 (basse-moyenne, = RÉSERVE de corr. 4) — chiffres M2 sans D10 / non recalculables depuis le journal → **CLOS**

C'était le résidu substantiel. Quatre sous-défauts de 5.2, chacun corrigé :

1. **Paramètres M2 hors bloc 1** → clos. `instrument.ts:443` : `export const M2_PARAMS = { seed: 42, n: 120,
   accuracy: 0.95, nCalib: 60 } as const;`. `report.ts:81-84` pousse la ligne bloc 1 (chaîne l.82) ; **rendu**
   `S2-RAPPORT:9` : « M2 (mutant labels inversés) : graine = 42 · n = 120 · accuracy déclarée = 0.95 · n_calib = 60
   · campagnes journalisées `M2-clean` / `M2-flip`. » Paramètres désormais **déclarés**.
2. **Campagnes M2 hors TSV** → clos. `instrument.ts:446-457` `m2Campaigns()` renvoie `{clean, broken}` (labels
   `M2-clean`/`M2-flip`) ; `run.ts:164` `const m2 = m2Campaigns();` puis `run.ts:165`
   `const campaigns = [s2a, ...byStratum, pooled, oracleReal, m2.clean, m2.broken];` — les deux campagnes entrent
   dans `journalRows`. Le TSV committé **contient** 120 lignes `M2-clean` + 120 lignes `M2-flip` (§b).
3. **Absence de ligne D10** → clos. `report.ts:134` `L.push(d10(inp.m2N, "M2-clean+M2-flip"));` ; **rendu**
   `S2-RAPPORT:37` : `_D10 : n = 120 · étiquette = fixtures-synth/M2-clean+M2-flip · date = 2026-09-04 · journal
   sha256 = 160034090a179f49…_`. (Observation non-bloquante sur `n=120` : §défauts-nouveaux O1.)
4. **Affirmation globale « tout chiffre se recalcule depuis ce journal » sur-portait** → clos. Les chiffres M2
   `0.983 → 0.017` sont désormais **recalculables** depuis le TSV (§b : 59/60 et 1/60). L'affirmation
   `S2-RAPPORT:12` ne sur-porte plus pour M2. `runMutants` (`instrument.ts:458`) **réutilise** `m2Campaigns`
   (`instrument.ts:471` `const { clean, broken } = m2Campaigns();`) : une seule source pour le journal et le
   verdict mutant M2 — pas de divergence possible.

### 5.3 (basse) — texte §6a n=50 juxtaposé à n_calib=300 → **CLOS**

`report.ts:144-145` : la formule utilise désormais `inp.silenceReal.nCalib` (= n_calib poolé = 300) et non le
plancher fixe 50 : `q̂=0 exige ≤ n − ⌈(n+1)(1−α)⌉ … : n=${inp.silenceReal.nCalib}, α=${p.alpha} ⇒ ≤
${inp.silenceReal.nCalib - Math.ceil((inp.silenceReal.nCalib + 1) * (1 - p.alpha))}`. **Rendu** `S2-RAPPORT:41` :
« … n=300, α=0.1 ⇒ ≤ 29 ». Plus de juxtaposition n=50 / 300. Contrôle reliquat : `grep 'n=50|≤ 4 erreurs|n = 50'`
sur `report.ts` + `S2-RAPPORT` = **aucun** ; le seul `n_min = 50` restant (`S2-RAPPORT:6`, ligne « Communs ») est le
paramètre global légitime (plancher `nMin`), pas le texte confus. La valeur rendue « ≤ 29 » est vérifiée à la main (§d).

### 5.1 (basse) — commentaire périmé `test/s2.test.ts` « oracle didactique » → **CLOS**

Défaut nommé par 5.1 = le commentaire ré-étiquetait les 9 états vers **l'oracle didactique / ŷ=y**, contredisant
`instrument.ts:338` (« Verdicts construits à scores DÉCLARÉS (pas ŷ=y — G2 Lot H corr. 1) ») et `report.ts:150`.
Corrigé : `s2.test.ts:20-21` dit maintenant « produit par le vrai `gate()` (**verdicts à scores déclarés** +
mutants) ». La mention « oracle didactique » a disparu.

**Le libellé corrigé est exact** (vérifié, pas cru — cf. §défauts-nouveaux, point tranché) : « verdicts à scores
déclarés + mutants » correspond **mot pour mot** au vocabulaire canonique du dépôt, `instrument.ts:338-340` :
« Verdicts construits à scores DÉCLARÉS … les ABSTAIN **des mutants** (timeout, intent hors région, budget
épuisé) ». Les 3 états ABSTAIN de `demoStates()` (`instrument.ts:406-408` : `intent:"down"` hors région,
`timedOut:true`, `remainingBudget:-0.02`) sont précisément ces **mutations d'entrée** du verdict COMMIT — le
référent de « mutants ». Ni `runMutants` ni `m2Campaigns` (les mutants M1-M5) n'entrent dans les 9 états, et le
commentaire ne le prétend pas. 5.1 **clos**, sans réserve.

---

## (b) Recalcul awk depuis le TSV committé (sans croire HIKAE)

Colonnes (entête l.1) : `campaign  index  close_time  hour_utc  stratum  predictor_id  yhat  y  role  score  set  covered  action`.

| Grandeur | Recalcul awk sur `docs/S2-journal-fixtures-synth.tsv` | Rapport | ✓ |
|---|---|---|---|
| lignes `M2-clean` | **120** | campagne journalisée | ✓ |
| lignes `M2-flip` | **120** | campagne journalisée | ✓ |
| rôles M2-clean | 60 calib + 60 holdout, 0 excluded | — | ✓ |
| rôles M2-flip | 60 calib + 60 holdout, 0 excluded | — | ✓ |
| coverage M2-clean = covered/holdout | **59/60 = 0.9833 → 0.983** | `0.983` (`S2-RAPPORT:32`) | ✓ |
| coverage M2-flip = covered/holdout | **1/60 = 0.01667 → 0.017** | `0.017` (`S2-RAPPORT:32`) | ✓ |
| total lignes-données (7 campagnes) | 300+247+224+695+687+120+120 = **2393** | « 2393 lignes » (`S2-RAPPORT:12`) | ✓ |

Détail `covered` M2-clean : 60 vides (calib) + 1×`0` + 59×`1` (holdout) ⇒ 59/60. M2-flip : 60 vides + 59×`0` +
1×`1` ⇒ 1/60. `awk -F'\t'` reproductible. `wc -l` = 2394 (2393 données + 1 entête). Les 240 lignes M2 sont bien
recalculables : la valeur `0.983 → 0.017` (`instrument.ts:478`, `detail: coverage clean=${cleanCov.toFixed(3)} →
flipped=${brokenCov.toFixed(3)}`, où `cleanCov`/`brokenCov` = `coverageAll` de M2-clean/M2-flip, l.472-473) tombe
**exactement** sur le covered/holdout par campagne du journal.

---

## (c) sha256 du TSV == cité → ✓

```
sha256sum docs/S2-journal-fixtures-synth.tsv
160034090a179f4982daeeaf6719dce70cd8161b10b93c142b2b4ad570618651  (fichier)
160034090a179f4982daeeaf6719dce70cd8161b10b93c142b2b4ad570618651  (cité mission)
160034090a179f4982daeeaf6719dce70cd8161b10b93c142b2b4ad570618651  (S2-RAPPORT:12, forme longue)
160034090a179f49…                                                  (têtes D10 :16,26,37,42,46, forme courte)
```

Identiques à l'octet. Le sha256 court `160034090a179f49…` des 5 lignes D10 est le préfixe exact. Fichier
**non suivi** (`??`) ⇒ la comparaison porte sur le contenu du worktree ; `.gitattributes` (`* text=auto eol=lf`,
vérifié à la revue DELTA §4) écarte le risque autocrlf sur clone frais.

---

## (d) Formule q̂=0 recalculée à la main → ✓

Conformal split, scores ∈ {0,1} (1 = erreur de calibration), q̂ = p-ème plus petit score, p = ⌈(n+1)(1−α)⌉.
Pour q̂=0, il faut que la p-ème statistique d'ordre soit 0 ⇒ il faut ≥ p zéros ⇒ ≤ n − p erreurs.

- n = 300, α = 0.10.
- (n+1)(1−α) = 301 × 0.9 = **270.9** ; p = ⌈270.9⌉ = **271**.
- n − p = 300 − 271 = **29** ⇒ « ≤ 29 erreurs » pour q̂=0.
- **Frontière** : 29 uns + 271 zéros ⇒ tri ascendant `[0×271, 1×29]` ⇒ 271e = 0 ⇒ q̂ = **0** ✓.
  30 uns + 270 zéros ⇒ 271e = 1 ⇒ q̂ = **1** ✓.

Concorde exactement avec le rendu `S2-RAPPORT:41` (« n=300, α=0.1 ⇒ ≤ 29 ») et l'expression `report.ts:145`
(`300 - Math.ceil(301*0.9)` = `300 - 271` = `29`). NB : la campagne §6a réelle (momentum ≈ pièce) a q̂=1
(la revue DELTA §3 a mesuré 145 zéros calib < 271) ; la formule « ≤ 29 » est l'énoncé didactique de ce
qu'exigerait q̂=0, correctement instancié à n=300 — cohérent.

---

## (e) Test de mutation — s2_report_reproducible rougit / restauration à l'octet

Le test `s2_report_reproducible` (`test/s2.test.ts`) : `out = runS2()` puis (assert 3)
`committedReport == out.report` et (assert 4) `sha256(committedJournal) == out.journalDigest`
(lecture avec normalisation `\r\n→\n`). Deux mutants, chacun exerçant une assertion distincte, backups
hors-worktree (fichiers non suivis ⇒ `git checkout` no-op).

**Baseline** : 4 tests s2 verts ; TSV sha256 `160034090a179f49…618651` ; RAPPORT sha256 `196120427b55…d60e`.

| Mutant | Cible (avant→après) | sha256 muté | `node --test test/s2.test.ts` | restauré (sha256==baseline) |
|---|---|---|---|---|
| **E1** | RAPPORT `0.983`→`0.984` | `a751d051…` | `s2_report_reproducible` **✖** « rapport committé ≠ rapport régénéré » (assert 3) ; 3 autres ✔ | RAPPORT `196120427b55…d60e` ✔ |
| **E2** | TSV l.2275 `M2-flip`→`M2flip` (diff = **1 ligne**) | `8f4f330c…` | `s2_report_reproducible` **✖** « journal committé ≠ digest régénéré » (assert 4) ; 3 autres ✔ | TSV `160034090a179f49…618651` ✔ |

Toute dérive d'un chiffre du RAPPORT (E1) **ou** d'une ligne M2 du journal (E2) rougit le test. **Vérification
finale** : `sha256sum` des deux fichiers == baseline à l'octet. Aucun fichier suivi touché ; mutations restaurées.

---

## (f) Contrôles globaux — npm run ci / vocab / TODO / git status

- **`npm run ci`** (racine `F:\Monark-wt-hikae`) : **exit 0**. Chaîne = `gate:vocab && typecheck && test`.
- **Décompte** : `ℹ tests 66 · ℹ pass 66 · ℹ fail 0` — **66/66** ✓ (conforme à l'attendu ; s2.test.ts porte toujours
  4 tests, DELTA-2 n'a ajouté aucun test ⇒ total inchangé).
- **`gate:vocab`** : `OK — scanned 20 file(s), no forbidden claim.`. **Set de scan vérifié** (lecture de
  `scripts/grep-forbidden.mjs`) = `packages/*/src/**/*.ts` (+ package `atelier`, absent) — **exactement 20** fichiers
  énumérés : `contracts/src` (8), `hikae/src` (10, dont `s2/instrument.ts`, `s2/report.ts`, `s2/run.ts`),
  `monark/src` (1), `ukemi/src` (1). Le gate **ne scanne PAS** `docs/` ni `packages/hikae/docs/` ⇒ ni le RAPPORT
  régénéré ni mon livrable `docs/G2-lot-H-delta2.md` ne comptent. (Correction : mon hypothèse initiale « 20 vs 19
  = RAPPORT régénéré » était fausse ; le set est le source-tree `.ts`. La cause du 19→20 relevé par DELTA est hors
  de mon périmètre mesuré ; je ne la devine pas — mesure ci-dessus, 0 claim.)
- **`typecheck`** (tsc strict) : passé (chaîné avant `test`, exit global 0).
- **`grep -rnE 'TODO|FIXME|XXX|HACK|: any|as any|<any>'` sous `packages/hikae/{src,test,scripts}`** : **0 occurrence**
  (aucun nu introduit — R-13).
- **`git status --porcelain` final = 15 entrées** = **14** (état de départ de CETTE session : ` M src/index.ts` +
  13 `??`) **+** mon unique livrable **`docs/G2-lot-H-delta2.md`**. Le ` M packages/hikae/src/index.ts`
  **préexiste** (généré à corr. 1, pas par moi). Les mutants E1/E2 (sous le `?? packages/hikae/docs/` déjà présent)
  sont restaurés à l'octet ⇒ aucun delta résiduel.

---

## Défauts nouveaux (liste fermée)

**Aucun défaut nouveau bloquant.** Une observation non-bloquante ; et un candidat-défaut tranché comme **non-défaut**
après vérification (traçabilité de la levée exigée par R-21).

| # | Fichier:ligne | Statut | Détail |
|---|---|---|---|
| **N1 (retiré — NON-DÉFAUT)** | `test/s2.test.ts:21` | **Non-défaut** | J'avais d'abord soupçonné que « + mutants » ré-attribuait les 9 états aux mutants `runMutants` (M1-M5). **Réfuté par mesure** : `instrument.ts:340` nomme explicitement « les ABSTAIN **des mutants** (timeout, intent hors région, budget épuisé) », et `demoStates()` `instrument.ts:406-408` produit ces 3 ABSTAIN par mutation d'entrée du verdict COMMIT. « verdicts à scores déclarés + mutants » est donc le **vocabulaire canonique du dépôt**, exact. Rien à corriger. |
| **O1 (observation, non-bloquant)** | `report.ts:134` / `S2-RAPPORT:37` (D10 M2) | **Observation défendable** | La ligne D10 déclare `n=120` (`= m2.clean.nEvaluable`) sous étiquette bi-campagne « M2-clean+M2-flip », alors que l'empreinte journal des deux campagnes = 240 lignes évaluables. **Défendable** sous la convention D10 « n = nEvaluable de la campagne » (les autres D10 aussi : S2b-pooled n=687 pour 695 lignes-journal) : M2-clean et M2-flip partagent la **même base de 120 points** (flip = inversion des labels holdout, mêmes indices) ⇒ 120 points distincts sous-jacents. Un vérificateur filtrant `campaign ~ M2` trouve 240 lignes ⇒ légère ambiguïté d'étiquette, sans conséquence de recalculabilité (les deux chiffres 0.983/0.017 se recalculent, §b). |

**O1 n'est pas une réserve** : c'est un choix de forme défendable, non comportemental, non-sécuritaire. Polissage
optionnel documenté (zéro dette, P5) : soit deux lignes D10 (une par campagne, n=120), soit `m2N =
clean.nEvaluable + broken.nEvaluable` (=240) pour l'union étiquetée, soit étiquette mono-campagne — au choix de
l'orchestrateur, jamais un « dû » nu.

---

## VERDICT : **CLOS**

**Résidus du périmètre fermé (checkpoint 2, corr. 1) — les trois clos, sans réserve** :
- **5.2** (basse-moyenne — LA réserve de corr. 4) : **CLOS**, matériellement. Params M2 déclarés (bloc 1,
  `instrument.ts:443` + `S2-RAPPORT:9`) ; campagnes `M2-clean`/`M2-flip` **au journal** (240 lignes, `run.ts:164-165`)
  ; ligne **D10 présente** (`report.ts:134` / `S2-RAPPORT:37`) ; chiffres `0.983 → 0.017` **recalculables** depuis
  le TSV (§b : 59/60 et 1/60) ⇒ l'affirmation globale « tout chiffre se recalcule depuis ce journal » ne sur-porte
  plus pour M2 ; `runMutants` réutilise `m2Campaigns` (source unique).
- **5.3** (basse) : **CLOS**. Formule §6a instanciée à `nCalib=300` (`report.ts:144-145`), rendu « n=300, α=0.1 ⇒
  ≤ 29 » (`S2-RAPPORT:41`) ; plus de juxtaposition n=50. Recalcul manuel §d = 29 (exact, frontière 29/30 vérifiée).
- **5.1** (basse) : **CLOS**. « oracle didactique / ŷ=y » éliminé de `s2.test.ts:20-21` ; le nouveau libellé
  « verdicts à scores déclarés + mutants » est **exact** (== `instrument.ts:338-340`, vocabulaire canonique ;
  candidat-réserve « + mutants » réfuté par mesure, cf. N1).

**Preuves d'exécution (reproductibles)** : mutation E1/E2 rougissant `s2_report_reproducible` (assert 3 et 4),
restaurées à l'octet ; `awk` recalculant 120/120 lignes M2 et 0.983/0.017 depuis le TSV committé ; sha256 TSV ==
cité ; formule q̂=0 recalculée à la main ; `npm run ci` exit 0 / 66-66 / vocab OK (20 fichiers source, 0 claim) /
0 TODO nu ; typecheck strict vert.

**Une seule observation non-bloquante** (O1, étiquette D10 M2 défendable) — non comportementale, non-sécuritaire,
avec polissage optionnel documenté. Aucun défaut nouveau bloquant, aucune régression fonctionnelle ni de sécurité.

**Recommandation à l'orchestrateur (G7, R-21)** : clôturer. O1 relève d'un polissage de forme optionnel (à faire
ou accepter-avec-note, jamais un « dû » nu), pas d'un blocage. La bascule CLOS-AVEC-RÉSERVES → CLOS est motivée :
le seul candidat-réserve (« + mutants ») a été **réfuté par mesure** (`instrument.ts:340`), et O1 est un choix de
forme défendable — maintenir une réserve sur ce seul point, enchaînée à l'AVEC-RÉSERVES de DELTA, serait la
régression infinie que G7 doit éviter.

**Divulgation d'indépendance (R-21)** : corrections DELTA-2 écrites par l'orchestrateur `claude-fable-5-1` ; moi
réviseur = `claude-opus-4-8[1m]` (≠ générateur, ≠ orchestrateur) ; l'advisor consulté est aussi `claude-fable-5-1`
(même famille que le correcteur — biais déclaré). **Mitigation** : aucun avis d'advisor n'entre ici sans exécution
indépendante. L'advisor a soulevé trois points ; les trois ont été **tranchés par mesure**, pas crus : (1) « + mutants »
→ grep `instrument.ts:340` (vocabulaire dépôt, N1 réfuté) ; (2) numéros de ligne → `grep -n` (run.ts:164 corrigé,
toFixed à :478) ; (3) « 20 vs 19 » → lecture de `grep-forbidden.mjs` + énumération (ma conjecture RAPPORT réfutée,
set = `packages/*/src/**/*.ts`).

**Restauration (R-20/R-21)** : mutants E1/E2 restaurés à l'octet (sha256 == baseline) ; `git status` final =
départ de session (14) + ce seul fichier `docs/G2-lot-H-delta2.md`. Aucun fichier suivi modifié, aucun commit,
aucun workflow déclenché. Verdict final et G7 : orchestrateur (R-21).
