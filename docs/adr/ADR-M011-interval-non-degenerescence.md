# ADR-M011 — Garde de non-dégénérescence de la région `interval` (largeur nulle ⇒ `under_calib`)

> **Statut** : **IMPLÉMENTÉ — G2 APPROUVÉ (instance fraîche) · G7 ACCEPTÉ · checkpoint-2 validateur `claude-fable-5-1`
> ACCEPTE-AVEC-CORRECTIONS C-1..C-7 appliquées (2026-09-17)**. Checkpoint-1 : ACCEPTE-AVEC-CORRECTIONS (C-1 oracle
> harness + C-2..C-5 foldées), **D6 tranché (b)**. Rapports : `docs/G1-lot-m011.md`, `docs/G2-lot-m011.md` ; journal
> `docs/JOURNAL-PROVENANCE.md`. **Aucun push sans go per-action de l'investisseur.**
> **Amende** : ADR-M002 **D5** (prédicat L3 fermé) + **D9/C4** (constructeur `buildIntervalRegion`, invariant
> M5) ; ADR-M007 **B-6** (contrainte mode `interval`). Cross-refs datées 1-ligne portées dans M002 et M007
> dans le MÊME commit (évolution par ADR, R-22).
> **Roster** : worker implémenteur `claude-opus-4-8` effort max ; **G2 fraîche ≠ générateur** ;
> orchestrateur/validateur `claude-fable-5-1` ; Opus 5 banni.
> **S'appuie sur** : la décision **advisor-defi 2026-09-16** (« Option A = `under_calib` honnête + garde
> largeur-nulle + clôture négative » ; msUSD dégénérescence GÉNUINE) — **CITÉE, non re-litigée**. Chip
> `task_e94d7490` : garde du **chemin BYO `interval` L3**, **DISTINCT** de la garde classe-committée **C-11**
> du lot F2-B (`calibration.ts`, PLAN-m008-f2b-usde §5.1/§10).

## 1. Contexte / le défaut (mesuré, [lu] code, fichier:ligne)
Le chemin `interval` (BYO ADR-M007 D7 **et** le conformeur HIKAE `conformInterval`) accepte une calibration
de scores **dégénérés** (repro F2 msUSD, C-2 : 198 fenêtres 24h dont 191 calmes = **190 scores = 0 + 1 score positif** (poussière,
1 token/82M) ⇒ à **α = 0.10** (classe msUSD, F2 §5.1) `p=⌈192·0.9⌉=173` ⇒ `q̂` = 173ᵉ plus petit (indice 172) `= 0` ; le cas
pur « tous nuls » est le même cas structurel, α-indépendant ; fixture série
`sha256 d95cc0a34507ff9593ed52d55463c2daeca826a9cd2117e5776c19cabdff5e58`). Trace :

1. `splitQuantile` (`l1-split.ts:39-42`) : `n≥nMin`, `p≤n`, `sorted[p-1]=0` ⇒ `{qhat:0}` — **correct**, pas un défaut de L1.
2. `buildIntervalRegion(ŷ, ŷ)` (`region.ts:44-54`) : ne rejette que non-fini / `lo>hi` ⇒ rend une région
   `interval` **VALIDE** `{lo:ŷ, hi:ŷ}` (largeur nulle).
3. `conformInterval` (`interval-conformer.ts:83-100`) / `byoVerdict` (`gate.ts:267-295`) : `ir.abstain=false`
   ⇒ verdict `reason:"covered", abstain:false`.
4. `decideInterval` (`l3-gate.ts:107-121`) : `width=0 ≤ τ_interval` ⇒ **jamais DEFER** ;
   `intentInRegion(intent,[ŷ,ŷ]) ⇔ intent===ŷ` ⇒ **COMMIT `covered`, `allow=true`**.

⇒ **auto-commit silencieux sur une région de largeur nulle = précision « parfaite » fabriquée**, viol direct
du contrat d'honnêteté (« never a probability of being right »). L'invariant B-6 (`q̂ ≥ 0`, pas `q̂ > 0`) le
laisse passer.

**Dégénérescence GÉNUINE** (advisor-defi 2026-09-16, §0 résolu) : msUSD = 1 seul jour calme à `burns>0`
(2026-06-12, `1e18` wei = 1 token sur ~82M de supply, ratio `1.2e-8` = poussière), **1 score non nul / 191**.
Ce n'est **pas** un défaut de recorder ; une calibration dégénérée **existe dans la nature** — la garde doit
être en code, pas seulement une hygiène de données.

## 2. Décisions

### D1 — Critère STRUCTUREL sur les BORNES de la région (`lo == hi`), pas sur `q̂`
La garde teste la **largeur nulle de la région** (`lo == hi`), **pas** `q̂ == 0`. Motif : **absorption
flottante** — `ŷ=1e6, q̂=1e-12` ⇒ `ŷ+q̂ === ŷ` en float64 ⇒ `lo === hi` **avec `q̂ > 0`**. Un durcissement
B-6 en `q̂ > 0` **seul** manquerait ce cas. Le critère est la **dégénérescence géométrique** de la région
continue (mesure de Lebesgue nulle), détectée à la construction. **Aucun seuil X% arbitraire** (exigence
investisseur/task : « structurel, pas un seuil »).

### D2 — Résultat = `under_calib` (verdict de couverture honnête), PAS `HarnessToolError` 400
Une calibration tous-nuls est un **input BIEN FORMÉ mais dégénéré** (elle ne supporte pas de région
non-dégénérée) — sémantiquement une **sous-calibration**, pas une erreur d'entrée. Résultat = `under_calib`
(enum gelé `CoverageReason`, `abstain=true`, `qhat=null`), **la même issue fail-closed que `n<nMin`**.
Conforme au ruling advisor-defi (Option A, « under_calib honnête »). **Distinct de** B-6 négatif (score < 0
= malformé ⇒ `HarnessToolError` 400) : les deux modes d'échec restent **séparés** (D4).

### D3 — Site primaire : `buildIntervalRegion` (constructeur UNIQUE) + défense en profondeur L3
- **(a) `region.ts` `buildIntervalRegion`** — le **SEUL** constructeur `interval` (D9/C4), qui porte **déjà**
  la sémantique « borne non-finie ⇒ `under_calib` abstention » : ajouter
  `lo === hi ⇒ { abstain:true, reason:"under_calib" }`. `lo > hi ⇒ throw` (invariant M5 dur, contournement =
  bug) **conservé**. **Une région `interval` valide exige désormais `lo < hi` (strict).** Corrige les **DEUX**
  producteurs (`conformInterval` **et** `byoVerdict`) **SANS duplication** : les deux routent déjà
  `ir.abstain` → `underCalib`/`underCalibVerdict` (verdict honnête `under_calib`, région `set` vide, `qhat=null`).
- **(b) `l3-gate.ts` `decideInterval`** — amendement du **prédicat FERMÉ D5** : **première ligne, avant le
  budget** (priorité `under_calib` > `budget_exhausted`, ordre déclaré D5) :
  `if (region.lo >= region.hi) return { action:"abstain", allow:false, reason:"under_calib" }`. Le `>=` capte
  **aussi** une région `interval` fabriquée à la main (inversée/nulle) qui **contournerait** le constructeur.
  C'est l'**auto-défense du prédicat fermé** : une région de largeur nulle atteignant L3, quelle que soit sa
  provenance, **ne COMMIT JAMAIS**.

### D4 — B-6 (ADR-M007) INCHANGÉ = bien-formation seule ; nouvel invariant **NDG-1** (non-dégénérescence, M002 D9/C4)
**C-4 (validateur)** : B-6 **reste** « bien-formation » (`scores ≥ 0`, 400) et n'est **pas** réétiqueté. La
non-dégénérescence est un invariant **distinct, nommé NDG-1**, rattaché au constructeur `region.ts` (M002 D9/C4) :
« une région `interval` valide exige `lo < hi` ». La cross-ref M007 dit : « B-6 = bien-formation ; dégénérescence =
M011 NDG-1 ». **Deux gardes disjointes, deux sémantiques** :
- score < 0 (⇒ `q̂ < 0` ⇒ `lo > hi`) = **malformé** ⇒ `HarnessToolError` 400 (INCHANGÉ ; `validateCalibration`
  `gate.ts:191-196`, AVANT `buildIntervalRegion`).
- `lo == hi` (largeur nulle, que ce soit `q̂=0` **ou** absorption flottante) = **dégénéré bien-formé** ⇒
  `under_calib` (D2).

On **ne remplace PAS** `q̂ ≥ 0` par `q̂ > 0` (manquerait l'absorption D1 + conflaterait les deux modes D2).

### D5 — L1 `splitQuantile` INCHANGÉ (`q̂=0` légitime en mode `set`)
`l1-split.ts` n'est **pas touché**. `q̂=0 ⇒ C={ŷ}` (singleton) est une couverture **LÉGITIME et informative**
en classification (ADR-M002 D5 / test-14 : S2b « calibration 47/50 ⇒ q̂=0 » **COMMIT** ; `l1-split.ts:12-14`
« calibrated silence, not a defect »). La dégénérescence est **spécifique à la région `interval` CONTINUE**
(largeur nulle sur ℝ), **pas** une propriété de `q̂`. Une garde `q̂>0` **globale RÉGRESSERAIT** les COMMIT
singleton `set`. Le task listait `l1-split.ts` ; **la non-modification est la décision, justifiée ici**.

### D6 — Cohérence de la RAISON du gate — RECOMMANDÉ (b), arbitrage validateur
Sur le chemin conformeur/`byoVerdict`, le verdict `under_calib` porte une **région `set` VIDE**
(`underCalibVerdict` → `buildSetRegion([])`) ⇒ à L3 la **DÉCISION** rend `intent_not_in_region` (intent
numérique ∉ set vide) au lieu de `under_calib`. Deux options :
- **(a) Accepter** : `verdict.reason=under_calib` (vérité de **couverture** ✅), `gate.reason=intent_not_in_region`
  (vérité de **décision**). Le bug (auto-COMMIT) est corrigé, le verdict est honnête. Minimal.
- **(b) RECOMMANDÉ** : étendre la garde `under_calib` **commune** de L3 (`l3-gate.ts:79`) de
  `nCalib < nMin` à `nCalib < nMin || verdict.reason === "under_calib"` ⇒ la raison de **décision** du gate =
  `under_calib` pour **TOUT** verdict `under_calib`, corrigeant **aussi** le gap **LATENT** `p>n` (à `n≥nMin`,
  le verdict est `under_calib` mais le gate disait `intent_not_in_region`). Surface gate plus honnête ; lit
  `verdict.reason` — cohérent avec la ligne 79 existante qui utilise déjà `nCalib` comme **proxy** de « verdict
  `under_calib` », proxy incomplet que (b) complète. **Vérifié NON-régressif** sur `l3.test.ts` (Test 2 :
  verdict `covered` `q̂=0` `set` → `verdict.reason≠under_calib` → inchangé ; aucun test ne construit un verdict
  `under_calib` à `n≥nMin` attendant `intent_not_in_region`).

**TRANCHÉ (b) par le validateur au checkpoint-1 (2026-09-17).** Ripple vérifié par lui au-delà de `l3.test.ts` :
`cross-agent-gate.test.ts:124-127`, `interval-gate.test.ts:60`, `byo-demo-probe.test.ts:163`, `l3.test.ts:45` = verdicts
`covered` intent hors région (inchangés) ; `gate.test.ts:305-309` (p>n à n≥nMin, le gap latent) n'asserte que `action` ;
fixture `09-under-calib` `n_calib:10` et trace H5 `n_calib:0` = chemin `nCalib` (inchangés) ; **aucune trace sha-épinglée
ne porte un verdict `under_calib` à n≥nMin**. (b) est monotone fail-closed, 0 octet de contrat, enum inchangé. **Repli (a)
uniquement** si la suite complète révèle un ripple non lu — à consigner, jamais à contourner. Note : (b) et la garde
D3(b) sont **disjointes** — (b) capte tout verdict `under_calib` (région `set` vide) ; D3(b) capte une région
`interval` `covered` de largeur nulle atteignant L3.

## 3. Oracle (test mutant, anti-circularité) — critère d'acceptation
Nouveau `packages/hikae/test/interval-nondegenerate.test.ts` + mise à jour du test 15 + **test harness (C-1)** :
1. **Conformeur (repro, C-2)** : `n=191` paires donnant **190 résidus = 0 + 1 résidu positif** (vecteur FIDÈLE msUSD,
   sha `d95cc0a3…` en commentaire de provenance ; tue une garde naïve « tous les scores nuls ») **à α = 0.10 ÉPINGLÉ**
   — **piège** : à α=0.01, `p=191=n` ⇒ `q̂` = le score poussière `> 0` ⇒ région NON dégénérée, le test passerait pour
   la mauvaise raison ou échouerait à reproduire — **et** le cas pur tous-nuls (α-indépendant) → `conformInterval` →
   `verdict.reason==="under_calib"`, `verdict.abstain===true`, `qhat===null`, `region===null`. **Mutant** : retirer la
   garde `region.ts` ⇒ `covered` ⇒ **ROUGE**.
2. **L3 (région hand-built)** : région `interval` **fabriquée à la main** `{kind:"interval",lo:100,hi:100}` (verdict
   `covered`) → `gate()` → `action==="abstain"`, `allow===false`, `reason==="under_calib"`. Prouve la garde
   `decideInterval` (D3b). **Mutant** : retirer ⇒ COMMIT ⇒ **ROUGE**.
3. **Absorption flottante — discriminateur D1 vs « q̂>0 » (C-3)** : **PAS** via `conformInterval` (les résidus `|y−ŷ|`
   s'absorbent à 0 AVANT `splitQuantile` ⇒ q̂=0, indiscernable). Le **seul** chemin où `q̂>0` et `lo===hi` coexistent =
   `byoVerdict` avec **scores fournis** : `scores = [1e-12 × n]`, `ŷ = 1e6` ⇒ `q̂=1e-12 > 0` mais `1e6 ± 1e-12 === 1e6`
   ⇒ `lo===hi` ⇒ `under_calib`. **Mutant nommé** : remplacer la garde `lo===hi` par `q̂>0` ⇒ `covered`/COMMIT ⇒ **ROUGE**.
   (+ `buildIntervalRegion(1e6, 1e6)` ⇒ `abstain=true, reason=under_calib` en unitaire.)
4. **Non-régression (anti-faux-positif)** : (a) `set` `q̂=0` singleton `{up}`, intent `up` → **COMMIT covered**
   (Test 2 `l3.test.ts` reste vert) ; (b) `interval` `q̂=99` hand `[901,1099]` → **covered/COMMIT**
   (`interval-conformer.test.ts` / `interval-gate.test.ts` restent verts).
5. **Test 15** `interval_lo_le_hi` : `buildIntervalRegion(1,1).abstain` **FLIPPE** `false`→`true`,
   `reason==="under_calib"` ; titre/commentaire « lo <= hi » → **« lo < hi strict ; égal = dégénéré ⇒
   under_calib »**. (`(-0.03,0.03)` valide et `(0.05,0.01)` throw restent.)
6. **Harness `byoVerdict` — chemin de repro RÉEL (C-1, BLOQUANTE)** : `apps/harness/test/gate.test.ts` :
   `runGate(BYO_INTERVAL_PRED, {…GOOD_PARAMS, intent: 0, nMin: 5, alpha: 0.10, calibration: {scores: <vecteur §3.1>,
   mode:"interval"}})` ⇒ `verdict.reason==="under_calib"`, `verdict.qhat===null`, `action==="abstain"`, `allow===false`,
   `reason==="under_calib"` (sous D6 (b)). **Vérifier `GOOD_PARAMS.alpha`** et épingler `alpha: 0.10` explicitement (piège
   §3.1). `CALIBRATE_MAX_N=10000` ⇒ n=191 passe le cap, vecteur msUSD reproduit tel quel. **Mutant** : garde `region.ts`
   retirée ⇒ `commit` ⇒ **ROUGE**. **Sans ce test, §3.1-2 ne traversent PAS le chemin de repro.**

Anti-circularité : régions de test 2/3 **construites à la main** ou par scores fournis (pas via le `sort` de production) ;
chaque mutant nommé (retrait de garde ; `lo===hi`→`q̂>0`) doit passer ROUGE.

## 4. Points de contact (ATOMIQUES, même commit)
- `packages/hikae/src/region.ts` — garde `lo===hi` (D3a) + en-tête (M5 : `lo <= hi` → `lo < hi` pour une
  région valide, largeur nulle = abstention).
- `packages/hikae/src/l3-gate.ts` — garde `decideInterval` `lo>=hi` (D3b) + ligne 79 étendue (D6 (b), tranché) +
  **en-tête :2-27 (C-5)** : le prédicat D5 et l'ordre des raisons portent la ligne `under_calib` étendue (verdict) **et**
  la branche `lo>=hi` du chemin `interval`.
- `packages/hikae/src/interval-conformer.ts` — **en-tête seulement** (les mentions « `q̂ ≥ 0 ⇒ lo ≤ hi (M5)` »
  lignes 9-11/83 → `lo < hi` + note garde non-dég.). **Aucune logique nouvelle** (la garde `region.ts` traverse
  via `if (ir.abstain) return underCalib(params)` :84).
- `apps/harness/src/tools/gate.ts` — `byoVerdict` : **aucune logique nouvelle** (garde `region.ts` traverse via
  `ir.abstain` :270) ; commentaire :271 (ajouter « largeur nulle »). **HORS liste du task mais chemin de repro
  RÉEL** (F2 msUSD BYO) — **scope ajouté déclaré** (motif D8 M007) ; G2 + validateur notés.
- **`apps/harness/test/gate.test.ts`** — **site de TEST** (C-1 bloquante) : le test §3.6 traverse `byoVerdict` ; scope
  légitime confirmé par le validateur (chemin de repro, pas un dépassement).
- `packages/hikae/test/interval-nondegenerate.test.ts` (nouveau) + `region-predictor.test.ts` test 15 (flip).
- **`packages/contracts` : 0 octet.** B-6 **n'y est pas** (grep vide) — B-6 vit dans `gate.ts:191-196` ;
  l'invariant région dans `hikae/region.ts` (« NOT in `@monark/contracts` (frozen, D2) », `region.ts:5-6`).
  Une région `interval` largeur-nulle reste **WIRE-valide** (schéma gelé inchangé) : on ne la **PRODUIT** jamais
  comme `covered`. **Aucun `schemas/*.json` touché.**
- `l1-split.ts` : **INCHANGÉ** (D5).
- Cross-refs datées 1-ligne dans **ADR-M002** (D5 + D9/C4) et **ADR-M007** (B-6) → ce ADR-M011, même commit.

## 5. Modes MAST (risque résiduel + contre-mesure)
- **Régression set-singleton** (D5) — garde interval-scoped + oracle §3.4(a) + Test 2 `l3` vert.
- **Mutant survivant / vérif incomplète** (H2/H6) — oracle hand-rolled anti-circulaire + mutants nommés +
  **G2 fraîche ≠ générateur** + R-21 orchestrateur.
- **Point de contact manquant** (`gate.ts` hors liste task, H6) — §4 exhaustif file:line + G2 vérifie
  l'atomicité + le chemin de repro **réel** testé **par §3.6 (harness `byoVerdict`)** — §3.1-2 ne le traversent PAS
  (C-1 validateur).
- **Ripple option (b)** — vérifié `l3.test.ts` ; le worker balaye la **suite complète**, G2 confirme ; repli (a).

## 6. Alternatives écartées
- **Garde `q̂ > 0` (B-6 durci) seule** : manque l'absorption flottante (D1) + conflate malformé/dégénéré (D4).
- **Garde dans `l1-split.ts`** : régresserait le singleton `set` (D5).
- **Seuil de largeur X %** : non structurel, arbitraire — **exclu par le task**.
- **`HarnessToolError` 400 pour tous-nuls** : traite un input bien-formé comme malformé, masque la
  sous-calibration honnête (D2), contredit le ruling advisor-defi Option A.
- **Garde uniquement au recorder / `calibration.ts`** : c'est **C-11** (classe committée F2-B), **DISTINCT** ;
  ne protège pas le chemin **BYO générique** ni le conformeur HIKAE (UKEMI).
