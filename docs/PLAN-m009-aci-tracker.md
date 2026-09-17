# PLAN-m009-aci-tracker — Lot M009 : primitive quantile tracker (ADR-M009, D8 (iv))

> **G0 AgileGates (plan AVANT code).** Rattachement : **ADR-M009** (proposé 2026-09-17). Statut : **checkpoint-1
> validateur `claude-fable-5-1` 2026-09-17 : ACCEPTE-AVEC-CORRECTIONS C-1..C-10 — foldées ci-dessous.** Aucun push. Tout critère ci-dessous est **PRÉ-ENREGISTRÉ** avant le premier octet de code.

## 1. Périmètre (clôture stricte)
- **Ajouts seulement** dans `packages/hikae/src/` (nouveau fichier `tracker.ts` ; `l2-monitor.ts` gagne au plus un
  commentaire de cross-ref), `packages/hikae/src/index.ts` (export), `packages/hikae/test/tracker.test.ts`.
- **0 modification** de : `adapter-narabi.ts`, `calibration.ts`, `l1-split.ts`, `region.ts`, `l3-gate.ts`,
  `apps/harness/src/tools/gate.ts`, `packages/contracts`, `schemas/`, `forbidden-keys.json`, manifest gelé.
- Gouvernance dans le même commit : ADR-M009, ce PLAN, amendement daté 1-ligne ADR-M008 D8, cross-ref ADR-M002 D4,
  correction `PLAN-m008-f2.md` §3, JOURNAL, `G1-lot-m009.md` (rejeux advisor), `G2-lot-m009.md`.
- **Commentaires de code en anglais** (lang:gate). En-tête : « TRACKER, NO GUARANTEE CLAIMED (ADR-M009 ; D8 (i)-(iii) unmet) ».

## 2. API (fixée)
```ts
export interface TrackerParams { alpha: number; c: number; eps: number; t0: number; B: number }
export interface TrackerState { q: number; t: number; q1: number; params: TrackerParams }
export function trackerInit(q1: number, params: TrackerParams): TrackerState   // fail-closed validation
export function trackerStepSize(t: number, params: TrackerParams): number     // eta_{t+1} = c * (t + 1 + t0) ** (-1/2 - eps) ; throws if !isFinite (C-1)
export function trackerStep(state: TrackerState, s: number): { state: TrackerState; E: Miscover }
export function clipScore(s: number, B: number): number                       // helper, OUTSIDE the recursion
export function trackerReplay(q1, params, scores: readonly number[]): { q: number; E: Miscover[]; t: number }
export function trackerDigest(q1, params, scores: readonly number[]): string  // C-6: sha256( f64be(alpha) ‖ f64be(c) ‖ f64be(eps) ‖ f64be(t0) ‖ f64be(B) ‖ f64be(q1) ‖ f64be(s_1) ‖ … ‖ f64be(s_T) ), -0 normalised to +0 (G2 R-1)
```
- **Convention d'indice ABB (C-1)** : l'état `t` = nombre de pas live déjà consommés (`t = 0` à l'init) ; le pas appliqué
  à l'état `t` est `η_{t+1} = c · (t + 1 + t₀)^(−1/2−ε)` ⇒ jamais `0^(−x)`. `trackerStepSize` et `trackerStep` rejettent
  toute `η` non finie (`throw`).
- `trackerStep` : `E = s > q ? 1 : 0` (strict, ABB `1{Y ∉ C}`, `C = {s ≤ q}`) ; `q' = imocpStep(q, alpha, E, η_{t+1})`
  (réutilise L2, ne le duplique pas) ; `t' = t+1`. Rejette `s ∉ [0,B]`, non fini. **Aucun clamp de `q`.**
- `trackerInit` rejette : `q1 ∉ [0,B]`, `eps ≤ 0`, `c ≤ 0`, `t0 < 0`, `B ≤ 0`, `alpha ∉ (0,1)`, non finis.
- Aucune constante par défaut exportée. Aucun `Prediction`/`CoverageVerdict` produit. Aucun octet sur le fil.

## 3. Oracle déterministe (tests, tous nommés — acceptation = les 9 verts + mutants rouges)
1. `tracker_direction` — raté ⇒ q monte, couvert ⇒ q baisse (via `imocpStep`).
2. `tracker_lemma1_bound` — sur suites adversariales de **scores** (C-5) : `s ≡ B`, `s ≡ 0`, alternée `B,0,B,0…`,
   T = 1000, c = B : `−α·M_{t−1} ≤ q_t ≤ B + (1−α)·M_{t−1}`, `M_t = max_{r≤t} η_r`, pour tout t.
3. `tracker_telescoping_identity` — `|Σ η_t(E_t − α) − (q_{T+1} − q_1)| ≤ 1e-12` sur timeline seedée (mulberry32)
   **préfixée de 20 scores `s = B` à c = B** ; le test **asserte d'abord** `min q < 0 || max q > B` (C-2 : la trajectoire
   sort de `[0,B]`, sinon le mutant clamp est réputé non tué) ; **M1 clamp** (`q' = max(0, min(B, q'))`) ⇒ ROUGE.
4. `tracker_thm1_worst_case` — sur `s ≡ B` et `s ≡ 0` (scores, C-5), **T = 1000, c = B, ε = 0.1** (borne ≈ 12.6 % < 1,
   sinon le test est vide) : `|moy(E) − α| ≤ (B + η_1)/(T·η_T)`.
5. `tracker_q_pinned` — `q_{T+1}` **épinglé octet-à-octet** (hex float64_be) sur timeline seedée de 200 scores avec
   **`t₀ = 7` test-only** (C-4, sinon M4 indistinguable) ; **M2** signe inversé, **M3** pas fixe (`eps` ignoré), **M4** `t₀`
   compté deux fois ⇒ ROUGE. Moteur épinglé : Node (déclaré dans le test).
6. `tracker_E_from_fact` — `E` dérivé de `(s, q)` uniquement : sur `s` égal à `q` exactement ⇒ `E = 0` (`>` strict) ;
   l'API n'expose aucun paramètre `E` ; **M5** `>=` au lieu de `>` ⇒ ROUGE.
7. `tracker_fail_closed` — chaque paramètre invalide (`eps ≤ 0`, `c ≤ 0`, `q1 ∉ [0,B]`, `s > B`, `NaN`, `alpha ∉ (0,1)`,
   `t0 < 0`, et `η` non finie — cas `t + 1 + t₀` forcé à 0 via un état `t = −1` construit à la main, C-1) ⇒ `throw`.
8. `tracker_no_peek` — `trackerReplay(scores[0..t-1])` décide la fenêtre `t` sans `s_t` : changer `s_t` ne change ni
   `q_t` ni `E_{<t}` (motif `arrivedErrors`, test 10 L2).
9. `tracker_fixed_vs_decaying` — contrôle mécanique (Prop 1, « mécanisme », pas théorème) : sur 2000 scores seedés,
   pas fixe `η = B` produit strictement plus d'états `q < 0` ou `q ≥ B` que le pas décroissant.
- **Digest** : `tracker_digest_order_sensitive` — permuter deux scores change le digest (≠ `calibDigest`, qui trie) ;
  vecteur épinglé sur `params` test-only + 3 scores (hex attendu écrit dans le test après premier calcul Node).
- **Mutants — liste FERMÉE (C-3)** : **M1** clamp de `q` ; **M2** signe inversé (`q + η(α − E)`) ; **M3** pas fixe
  (`eps` ignoré, `η = c`) ; **M4** `t₀` ajouté deux fois ; **M5** `E = s >= q`. Chacun rapporté avec sa sortie rouge en G1.

## 4. Oracle de release (liste complète = leçon F2-B)
`npm run ci` (tests) ; `gate:vocab` ; `typecheck` ; `lang:gate` ; `lint-ratchet` (plafond 69, **non relevé**) ; `eslint` ;
`export:check` (C-7 : `tracker.ts` et `tracker.test.ts` entrent **par construction** dans l'export public —
`scripts/export-public.mjs` `PACKAGE_SUBPATHS` inclut `src` et `test` ; attendu = `export:check` **vert** (0 hit lang/vocab,
en-tête anglais) ; la publication effective relève du **go d'export/push**, manuel — aucun workflow n'exécute `npm run export`).

## 5. R-25 (estimation, plafond 1205 ; exclusions S2, G1/G2, lockfile)
ADR ~110 + PLAN ~70 + `tracker.ts` ~120 + tests ~220 + index/JOURNAL/amendements ~40 ≈ **560 lignes** (< plafond,
sans exception). Mesure réelle au G7 par `git diff --stat` ; un dépassement = découpage, jamais une exception.

## 5bis. Modes MAST nommés (C-8) et contre-mesures
- **Dérive de spécification** : le worker ajoute un clamp « par sécurité » ⇒ M1 + test 3 (assertion de sortie de `[0,B]`) + AC-2.
- **Perte d'information** : rapports lecteurs `.output` vides ⇒ chaîne memstack (`5db6ad7b…`, `d05dd94c…`) + relecture
  advisor-defi [lu] + citations ABB par lignes vérifiées par l'orchestrateur ET le validateur.
- **Vérification incorrecte** : G2 qui se fie aux chiffres rapportés ⇒ checkpoint-2 et G7 **rejouent** l'oracle (CA-9).
- **Clôture prématurée** sur « tests verts » ⇒ CA-6 : oracle ET revue G2 ET mutants rouges rapportés avec sortie.
- **Désobéissance de rôle** : le worker committe ou pousse ⇒ R-20, `git log` vérifié au G7.

## 6. Séquence
checkpoint-1 validateur (ce PLAN + ADR) → worker `claude-opus-4-8` max (R-1 : modèle résolu en première ligne) →
G2 fraîche (instance ≠ générateur, checklist corpus, MAST) → checkpoint-2 validateur (rejoue l'oracle avec `Bash`) →
G7 orchestrateur (R-21 : rejoue lui-même) → commit local (Kraidle + Co-Authored-By) → **push = go per-action**.

## 7. Critères d'acceptation (fermés)
AC-1 les 9 tests + digest verts ; AC-2 les 5 mutants nommés ROUGES (rapport G1 avec sortie) ; AC-3 `git diff --stat`
ne touche aucun fichier interdit §1 ; AC-4 oracle §4 vert intégralement ; AC-5 grep `adaptive|adaptif` = 0 dans les
ajouts **de code** (`tracker.ts`, `tracker.test.ts`, bloc `index.ts` ; la prose ADR/PLAN peut nommer le mot pour l'interdire — G2 R-3) ; AC-6 aucune constante par défaut exportée pour `c, eps, t0` ;
AC-7 JOURNAL : entrée avec `error_origin`, note « `.output` lecteurs vides, mémoire memstack = chaîne [lu] » ;
AC-8 (C-9) items formés (a)-(e) de l'ADR portés au JOURNAL **chacun avec déclencheur, prochaine action et ADR de
rattachement** — (d) : « `τ_interval = 1` rend la règle de largeur inerte pour la classe statique (largeur ≤ 8.3e-4) ;
à trancher par amendement ADR-M002 D6 au premier passage branche (a), contrainte `τ_interval < 2B` ».
