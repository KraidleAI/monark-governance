# G2 — Lot ADR-M011 (garde NDG-1) — rapport verbatim de l'instance relectrice

> Instance G2 : `worker` **`claude-opus-4-8[1m]`**, agentId `accf369e` — **≠ générateur** (`afb3de98`). Contexte frais, revue seule, mutants restaurés byte-exact. Persisté par l'orchestrateur (`claude-fable-5-1`) sur correction C-1 du checkpoint-2 (2026-09-17). Texte ci-dessous = sortie de l'agent, verbatim.

---

## 1. Modèle résolu
`claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme (R-1). Instance G2 fraîche, contexte séparé du générateur ; aucun fichier source modifié de façon persistante (mutants restaurés byte-exact, prouvé infra §4b/§4c).

## 2. Étape 1 — Conformité à l'ADR (point par point)

| Point ADR | Attendu | Constat (file:line) | Verdict |
|---|---|---|---|
| **D1** garde sur BORNES `lo===hi`, pas `q̂` | structurel | `region.ts:60` `if (lo === hi)` ; commentaire :61-63 nomme l'absorption flottante ; jamais un test sur `q̂` | **conforme** |
| **D2** résultat `under_calib` enum gelé, pas de HarnessToolError | fail-closed | `region.ts:64` `{ abstain:true, reason:"under_calib" }` ; `l3-gate.ts:124` idem ; aucun nouveau littéral `CoverageReason`, aucun HarnessToolError ajouté | **conforme** |
| **D3a** ordre finitude→`lo>hi` throw→`lo===hi` abstain ; message throw byte-identique HEAD | ordre + octets | `region.ts:52-54` finitude → `:55-59` throw → `:60-65` abstain. Message : `git show HEAD:…region.ts` L50 **≡** worktree L57 | **conforme** |
| **D3b** `if (region.lo >= region.hi)` PREMIÈRE ligne de `decideInterval`, avant budget | priorité | `l3-gate.ts:123` première instruction ; budget à `:126` | **conforme** |
| **D5** `l1-split.ts`, `packages/contracts/**`, `schemas/*.json` ABSENTS | 0 octet | `git diff --name-only` : `l1-split` grep-count **0**, `contracts|schemas.json` grep-count **0** | **conforme** |
| **D6(b)** ligne under_calib commune étendue | `nCalib<nMin \|\| verdict.reason==="under_calib"` | `l3-gate.ts:88` **exact** ; en-tête :9-11, :20 documentent le proxy incomplet | **conforme** |
| **C-4** B-6 M007 reste « bien-formation » ; cross-ref « dégénérescence = M011 NDG-1 » | disjonction | `ADR-M007:59` B-6 inchangé ; `:60` cross-ref | **conforme** |
| **C-5** en-tête `l3-gate.ts:2-~31` porte ligne under_calib étendue ET branche `lo>=hi` | double | :4, :9-11, :20 + :23, :29 | **conforme** |
| **Cross-refs M002** D5 + D9/C4 datées 1-ligne → M011 | 2 refs | `M002:143` (D5) + `M002:224` (D9/C4) | **conforme** |
| **Aucune logique** dans `interval-conformer.ts` / `gate.ts` | commentaires seuls | `interval-conformer.ts` diff = en-tête :7-11 + inline :85-86 ; `gate.ts` diff = commentaire :271 | **conforme** |

## 3. Étape 2 — Oracle : discrimination / vacuité

| Assertion (test) | Discriminante ? | Preuve |
|---|---|---|
| §3.1 `scores.length===191`, 190 zéros, **1 positif** | discriminante | tue une garde naïve « tous nuls » |
| §3.1 **anti-circularité** `splitQuantile(scores,0.10,·)==={qhat:0}` | **discriminante** | prouve L1 rend q̂=0 ⇒ l'under_calib vient de NDG-1 |
| §3.1 conformer → under_calib/abstain/qhat null/region null | discriminante | tuée par M1 |
| §3.1 **contrôle négatif** α=0.01 → `{qhat:DUST}` + `covered` | **discriminante** | pin α=0.10 porteur |
| §3.1-pure all-zeros α∈{0.1,0.01,0.2}→under_calib | discriminante | α-indépendance |
| §3.2 hand-built `{interval,100,100}`, `covered`, nCalib=50=nMin, intent=100 → abstain/under_calib | **discriminante** | isole D3(b) (ligne 88 ne fire pas) ; tuée par M2 |
| §3.3 `splitQuantile([1e-12×10],0.1,5)==={qhat:1e-12}` | **discriminante** | prouve q̂>0 |
| §3.3 `1e6+1e-12===1e6` ET `1e6-1e-12===1e6` | **discriminante** | prouve l'absorption |
| §3.3 unitaire `buildIntervalRegion(1e6,1e6)`→abstain | discriminante | présent |
| §3.4(a) set singleton q̂=0 → COMMIT covered | anti-faux-positif | régresserait si garde `q̂` globale |
| §3.4(b) interval q̂=99 → COMMIT covered | anti-faux-positif | présent |
| §3.6 (C-1) harness `runGate(BYO_INTERVAL_PRED,{…,alpha:0.1,calibration})` verdict.reason/qhat null/abstain + action/allow/reason===under_calib | **discriminante, C-1 SATISFAITE** | traverse `byoVerdict` ; tue M1 ET M4 |
| Test 15 : id conservé, `(1,1)`→abstain (flip), `(-0.03,0.03)` valide, `(0.05,0.01)` throw | discriminante | flip mesuré ; id référencé ADR-M002:270 préservé |

**Aucune vacuité, aucune assertion manquante.**

## 4. Étape 3 — Vérification EXÉCUTÉE

**a.** `npm test` baseline & final : **212 pass / 0 fail**.

**b. Byte-exactness (sha256, 8 hex)** — mesuré ≡ déclaré : region `1a1a2d3d` ✓, l3-gate `c23a4030` ✓, interval-conformer `78796dae` ✓, gate `9f23228f` ✓. `grep -c "lo === hi" region.ts` = 4 ; garde `lo >= hi` à `l3-gate.ts:123`.

**c. Rejeu indépendant des mutants** (prédictions écrites AVANT lancement ; restauration par Edit inverse, jamais `git checkout`) :
- **M1** (retrait `lo===hi`, sha muté `b0cb21ef`) → 6 rouges prédits, tous rouges : `interval_nondegenerate_conformer_msusd_like_under_calib`, `…_all_zeros_under_calib`, `…_buildIntervalRegion_equal_bounds`, `interval_lo_le_hi`, `gate_byo_interval_degenerate_calibration_is_under_calib_M011`, `gate_byo_interval_float_absorption_is_under_calib_M011` ; +1 cascade `export_public_no_governance_no_french` (CI imbriquée). Restauré → `1a1a2d3d` → vert.
- **M2** (retrait `lo >= hi`, sha muté `eb79c720`) → 1 rouge prédit : `interval_nondegenerate_l3_handbuilt_zero_width_abstains` (action `commit`) + cascade. Restauré → `c23a4030`.
- **M4** (retrait `|| verdict.reason==="under_calib"`, sha muté `c92e72a1`) → 2 rouges prédits (`d.reason` = `intent_not_in_region`) + cascade. **Aucun 4ᵉ rouge** ⇒ non-régression D6(b) confirmée par le sens inverse. Restauré → `c23a4030`.
- **M3** : non exécuté en mutant-code ; kill établi par les assertions in-test (`splitQuantile==={qhat:1e-12}` + `1e6±1e-12===1e6`).

Contrôle post-mutants : `git diff --stat` = `9 files changed, 127 insertions(+), 26 deletions(-)` (identique pré-mutants) ; 4 shas ≡ baseline ; `npm test` 212/212.

**d. Lint-ratchet & tsc** : `lint-ratchet.json` ceiling 69 ; `npm run lint:ratchet` → 69/69 exit 0 ; `npm run typecheck` exit 0.

**e. Refs de ligne périmées** (4, navigationnelles, non-bloquantes) : `gate.ts:271` `interval-conformer.ts:84`→`:86` ; `gate.ts:169` `region.ts:48`→`:55` ; `gate.ts:232` `interval-conformer.ts:93-94`→`:95-96` ; `ADR-M007:59` `region.ts:48`→`:55`. Note : l'estimation du générateur « throw ~:52 » est fausse — mesuré :55.

## 5. VERDICT G2 : **APPROUVÉ-AVEC-CORRECTIONS**
Logique NDG-1 (D1–D6) intégralement conforme et empiriquement discriminée. Corrections C-1..C-4 (refs de ligne ci-dessus), toutes non-bloquantes. Note de staging : `docs/adr/ADR-M011-…md` untracked, doit figurer dans le commit.

## 6. Dépendance au lot F2-B hors-lot : **NON (fonctionnelle)**
Aucun import d'artefact M008/F2-B. Seul lien : commentaire de provenance pointant `docs/PLAN-m008-f2b-usde.md:15` dans les nouveaux tests — pointeur documentaire, non-bloquant.

## 7. Blocage : **aucun**

---

**Suite (orchestrateur)** : les 4 refs de ligne ont été appliquées (sed ligne-scopé), vérifiées (old = none, new présent), suite relancée **212/212**. `gate.ts` a donc un sha différent de `9f23228f` après ces nits (commentaires seuls).
