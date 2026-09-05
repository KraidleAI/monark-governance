# Rapport de passe — MONARK — Phase 1 : moteurs HIKAE / UKEMI + atelier de démo (ADR-M002)

- **Période** : 2026-09-04 → 2026-09-05
- **Objectif (G0)** : ADR-M002 (`docs/adr/ADR-M002-phase1-moteurs-hikae-ukemi.md`, source ≡ copie `F:\Clawpumptech`, md5 `20df1e93…`, re-mesuré 2026-09-05 après corr. 3 du checkpoint 2) — trois lots isolés en worktrees : **H** `packages/hikae` (HAC-CP `btc-dir-15m`, L1/L2/L3 + instrument S2), **U** `packages/ukemi` (noyau de clearing E&N + cible A 24 h), **D** `packages/atelier` (écran de démo, 9 états racine). Cap hackathon D0 : pas de trading (KAIZEN = produit futur), « on publie ce qui a tourné ».
- **Verdict rendu par** : orchestrateur `claude-fable-5-1` (effort high), seul commiteur (R-19/R-20).

## 1. Réalisé (mesuré)

| Lot | Branche | Tests nommés D11 | CI finale | G2 initial | G2 delta (≠ générateur) |
|---|---|---|---|---|---|
| H | `phase1/hikae` @ `fcfa4cf`+main | 1-17 + gardes S2 (dont `s2_report_reproducible`, `s2_predictors_wired`) | **66/66**, gate vocab OK (20), `tsc` 0 | ACCEPTÉ-AVEC-CORRECTIONS (5) — `docs/G2-lot-H.md` | **CLOS-AVEC-RÉSERVES** — `docs/G2-lot-H-delta.md` ; 3 résidus documentaires (5.1-5.3) **fermés après** (commentaire test 14, M2 journalisé + D10, formule q̂=0 générique) ; CI re-verte 66/66 |
| U | `phase1/ukemi` @ `fcfa4cf`+main | 18-23 | **51/51**, gate vocab OK (14), `tsc` 0 | ACCEPTÉ-AVEC-CORRECTIONS (3) — `docs/G2-lot-U.md` | **CLOS-AVEC-RÉSERVES** — `docs/G2-lot-U-delta.md` ; réserves = lignes de journal (écrites sur main, §2 G1) |
| D | `phase1/atelier` @ `fcfa4cf` | 24-28 | **50/50**, gate vocab OK (22, atelier inclus), `tsc` 0 | ACCEPTÉ-AVEC-CORRECTIONS (2) — `docs/G2-lot-D.md` | **CLOS** — `docs/G2-lot-D-delta.md` |
| Racine (CA-0) | — | `contracts_frozen`, `fixtures_root_valid` | verts dans les **trois** worktrees | — | — |

Oracles non-LLM ayant rougi puis restaurés à l'octet (sha256) : H — `momentum4c`→const (A), `oracleDidactique`→const (B), `l3-gate` defer→commit (C), rapport `96.0→95.0` (D), `m=387→388` ; U — `schema_version "1.0"`, `produced_at` absent, `allowUnionTypes` retiré, `isLiquidable <→<=` ; D — `alpha:=n_calib`, `regionText` `", "→";"`. Chaque mutant est attrapé par une assertion **nommée**.

**Résultats S2 réels** (`packages/hikae/docs/S2-RAPPORT-fixtures-synth.md`, régénéré par `scripts/s2-report.mjs`, journal brut 2 393 lignes, sha256 `16003409…`) : `internal:momentum-4c` sur marche aléatoire seedée ⇒ q̂=1, abstention **100 %**, commit 0 % (silence calibré = le produit) ; `internal:oracle-didactique` sur la même série ⇒ q̂=0, commit 100 % (mécanisme visible, pas un produit). Prédicteurs **réellement exécutés** (695/687 `Prediction` gelées émises).

**Finding UKEMI (test 21)** : sur systèmes réguliers `e ≫ 0`, `‖Δp*‖₁ = 2‖Δe‖₁` (chaîne), `‖Δp*‖∞ = 3‖Δe‖∞` (fan-in) ; croissance + concavité confirmées ; Φ non-expansif en p confirmé. L'amplification réseau est ce que UKEMI mesure.

## 2. Gates

| Gate | État | Preuve |
|---|---|---|
| G0 cadrage | ✅ | ADR-M002 + checkpoint 1 validateur (C1-C13) + amendements 1-2 quick-verifiés ; copie ≡ source |
| G1 provenance | ✅ | `docs/JOURNAL-PROVENANCE.md` § « G1/G2 (2026-09-04) » : générateur/contexte/réviseur/verdict par lot, Gate-0 R-1, **déviation roster consignée** (voir §5) |
| G2 revue 100 % | ✅ | 3 revues initiales + 3 revues delta, toutes `claude-opus-4-8[1m]` effort max, contexte frais, ≠ générateur ; checklist corpus ; mutants re-exécutés par les relecteurs |
| G3 vérification auto | ✅ | `npm run ci` = gate vocab + `tsc --strict` + `node:test` ; 0 dépendance runtime nouvelle ; ajv/ajv-formats dev-only (R-8, Phase 0). **Réserve fermée (checkpoint 2 corr. 5)** : les deux tests racine CA-0 (`test/contracts-frozen.test.ts`, `test/fixtures-root.test.ts`) étaient hors `tsconfig include` (exécutés par type-stripping, jamais typés) — `include` étendu à `test/**/*.ts` sur `main`, `tsc --strict` re-vert (voir §1) |
| G4 métriques archi | ✅ | Duplication nouvelle : 0 (ids prédicteurs importés, `m2Campaigns` factorisée) ; churn < 2 sem. : 100 % (phase de création) ; ratio refactoring/ajout : n/a (première passe de code) — série ouverte |
| G5 dette | ✅ | §3 : dettes nues = **0** ; pendants formés (g)-(k) + P-EN-249 |
| G6 compliance | ✅ | 0 remote (C14), local-only ; DEVOPS (eslint, SHA-pin, commits signés) = pendant (i) **avant tout remote**, Phase 3 ; SBOM = `package-lock.json` prouvé Phase 0 ; CRA UE : aucune mise sur le marché avant DEVOPS |
| G7 verdict | ✅ | **ce document**, §5 |

## 3. Clôture zéro dette

### 3.a Demandes de procurement formées
- **P-EN-249** — Eisenberg L., Noe T. H. (2001), « Systemic Risk in Financial Systems », *Management Science* 47(2), pp. 236-249, DOI 10.1287/mnsc.47.2.236.9835. Page imprimée **249** absente du PDF local (14 p.). Tentative : lecture du fichier local, 2026-09-05. Usage : fin App. 1 (preuve Thm 2) + références. Non bloquant.
- **P-K4-1 / P-K4-2** (inchangés, ADR-M002 §4) — Rogers & Veraart ; Cifuentes, Ferrucci & Shin (canal endogène, hors périmètre Phase 1).

### 3.b Recherches / lectures formées
- **(l) CLOS** — lecture page rendue E&N Lemme 5 (`docs/lecture-EN-lemme5.md`, Sonnet 5 [lu]) : norme ℓ¹ explicite, domaine `ℝⁿ₊₊`, aucune hypothèse supplémentaire ⇒ adjudication `error_origin` §5.
- Pendants investisseur (ADR-M002 §4, formés, datés) : **(e) présentation S2b** — « silence seul » ou « silence + mécanisme étiqueté » ; chiffres synthétiques attachés : `internal:momentum-4c` ⇒ q̂=1, abstention 100 %, commit 0 % ; `internal:oracle-didactique` ⇒ q̂=0, commit 100 % ; échéance ADR = lecture du rapport S2b **réel** post-J0 (le synthétique ne déclenche pas la décision) ; (g) clé UsePod, (h) date de lancement token + post X, (i) DEVOPS, (j) builders, (k) volume on-chain = token seul.
- **CA-D1 visuel (pendant investisseur formé, checkpoint 2 corr. 6)** : aucune capture d'écran n'existe ; preuve machine acquise (G2-D §1.6 : `curl 127.0.0.1:4173` ⇒ 9 `data-state`, 2 horloges ×9, B_t ×9, 3 panneaux). **CLOS le 2026-09-05** : atelier lancé (`node serve.js`, 127.0.0.1:4173, HTTP 200, 9 `data-state`) et vu par l'investisseur, qui a **confirmé** les cinq éléments de CA-D1 sur l'état `01-commit-up` (3 panneaux Shōgen/HIKAE/UKEMI ; verdict hac-cp α 0.1 n_calib 50 q̂ 0 `{up}` ; COMMIT · `covered` ; B_t 0.1 « capacité qui se consomme — pas un rendement » ; horloges 12:00:00Z / 12:15:00Z). Preuve textuelle = contenu de page relevé par l'orchestrateur ; capture d'écran non produite (rendu bloqué fenêtre minimisée) — la confirmation investisseur tient lieu d'acceptation visuelle.

### 3.c Dette délibérée-prudente par ADR
| ADR | Principal | Propriétaire | Échéance |
|---|---|---|---|
| — | aucune | — | — |

## 4. Métriques G4
Première passe de code : série initialisée (voir G4 ci-dessus). Prochaine passe = point de comparaison.

## 5. Verdict final (G7) — orchestrateur

**ACCEPTÉ — les trois lots sont intégrables**, sous les trois actions de commit ci-dessous.

**`error_origin` (journal de provenance)** :

| Défaut | Origine | Preuve |
|---|---|---|
| Test 21 : sous-énoncé « nonexpansive » du Lemme 5 E&N contredit par calcul | **source** (papier) — établi sur page rendue [lu] : énoncé ℓ¹ sur `ℝⁿ₊₊`, étape d'induction livrant la constante `n` et non 1 ; contre-exemples réguliers dans le domaine énoncé | `docs/lecture-EN-lemme5.md` ; `packages/ukemi/test/*` ; archive K4:90 = paraphrase fidèle ; implémentation correcte (Thm 1, croissance, concavité confirmés) |
| G2-H corr. 1-4 (provenance mal étiquetée, test 7 vacuous, scratch dans l'arbre, rapport non recalculable) | **générateur** (orchestrateur en siège worker, Lot H) | `docs/G2-lot-H.md` ; corrigé, re-vérifié delta |
| G2-U C1-C3 ; G2-D corr. 1 | **générateur** (documentaire / oracle faible) | revues + deltas |
| G2-D corr. 2 (« B_t non croissant sur miscover » non calculable depuis `GateDecision`) | **spécification** (ADR-M002 D11, orchestrateur) | amendement daté, barré, copie ≡ source |
| Journal : « corrections en siège worker `claude-opus-4-8` » | **orchestrateur** (R-1 faux) | corrigé ; **déviation roster** : code H/U + 10 corrections écrits par `claude-fable-5-1` (limite d'usage, 4 workers morts) ; mitigation = relectures delta Opus 4.8 ≠ générateur, exécutées |
| Perte de la 1re lecture (l) sous filtre de régurgitation | **outillage** (advisor intégré reçoit le transcript plein de citations) | règle 4/4bis `lecteur.md` + CLAUDE.md 2026-09-05, doc en ligne citée |

**Risque résiduel MAST** : *pression de deadline* (cap hackathon) — mitigée par R-22 (aucun gate suspendu, mutants exigés) ; *générateur = vérificateur* — mitigée par les six revues Opus 4.8 indépendantes ; *fausse confiance* — le résultat négatif (abstention 100 %) est publié tel quel.

**Checkpoint 2 (validateur-humain `claude-fable-5-1`, `docs/CHECKPOINT2-phase1.md`) : ACCEPTE-AVEC-CORRECTIONS, 6 items** — (1) relecture delta-2 Opus 4.8 du diff post-delta Lot H [lancée, bloque le commit H] ; (2) journal l.140-141 barrés + Gate-0 cités [fait] ; (3) ADR D10 S2a / D10 C9 / D11-14 amendés, copie ≡ source [fait, md5 ci-dessous] ; (4) pendant (e) au §3.b [fait] ; (5) tests racine dans `tsc` [fait] ; (6) CA-D1 visuel formé [fait].

**Actions de commit (orchestrateur, après acceptation checkpoint 2)** :
1. Un commit par branche de lot (R-25) : code + README + artefacts G2/G2-delta du lot ; H inclut `docs/S2-*` régénérés.
2. Merge des trois branches dans `main` (chemins disjoints, `fixtures/manifest.json` inchangé).
3. Commit `main` : `docs/JOURNAL-PROVENANCE.md`, `docs/adr/ADR-M002-…` (amendements D9/D11/§4 (l)), `docs/lecture-EN-lemme5.md`, ce rapport ; md5 copie Clawpumptech re-vérifié.
4. **0 remote** jusqu'au pendant (i).

Checkpoint 2 (acceptation validateur-humain) : demandé sur ce document.
