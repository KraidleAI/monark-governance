# CHECKPOINT-2 — lot U-4a (Ukemi : book Aave v3 @B₀, chemin d'oracle réalisé D_e, calibration réelle e2) — VALIDATEUR-HUMAIN

- **Modèle résolu (R-1)** : verdict rendu par le **validateur-humain `claude-fable-5-1`** (Fable 5.1), effort high, 2026-09-20T23:47Z → 2026-09-21T00:10Z. **Provenance de ce fichier** : transcrit au format dépôt (`docs/CHECKPOINT2-*.md`) par l'**implémenteur `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme R-1, effort max), 2026-09-21, sur instruction de l'orchestrateur ; vérifications condensées, corrections intégrales. L'implémenteur ne committe pas (R-20).
- **Checkpoint** : LIVRABLE (après G2 PASS-AVEC-CORRECTIONS, avant G7). Contexte frais du validateur : artefacts seuls, jamais le fil de travail.
- **Worktree** : `F:\Monark-wt-u4a`, branche `lot/u-4a`, base `b1302db` ; **α = `041a902`** (recorder durci, seam α, vert seul), **β = `3887190` = HEAD** (courses + réduction + ADR + PLI + G2 + avis advisor-defi).
- **Décision** : **ACCEPTE-AVEC-CORRECTIONS** — liste fermée C-V-1..C-V-7 (+ non-bloquantes). Les fixtures/séries/`book_digest` et le prereg restent **inchangés** ; `calib_digest` re-pinné par C-V-2 (conformité au prereg, aucune pièce servie ne le consomme).
- **Artefacts lus par le validateur** : `docs/G0-lot-u4.md` (+ amendement C-1..C-13), `docs/CHECKPOINT1-lot-u4.md`, `docs/PLAN-u4-prereg.md`, `docs/PLI-lot-u4a.md` (+ PLI G2 C-G2-1..7), `docs/G2-lot-u4a.md`, `docs/AVIS-advisor-defi-u4a-2026-09-20.md`, `docs/adr/ADR-U4-book-et-calibration.md`, `apps/sentinel/test/fixtures/ukemi/u4/PROVENANCE-u4.md` + 3 fixtures, `scripts/census/{u4-scores.mjs,u4-scores.d.mts,u4-reduce.mjs,u4-oracle-path.mjs}`, `apps/sentinel/test/{ukemi-u4a,ukemi-u4-scores}.test.ts`, `.github/workflows/ci.yml` (job R-25), bruts hors dépôt (lecture partagée).

## 1. Vérifications reproduites de première main (condensé)

Le validateur a **re-exécuté** la mesure (rejeu offline depuis les bruts hors dépôt + le driver committé, zéro réseau, `Bash` en vérification seule AM-2 du validateur) ; tout concorde avec le PLI/G2/ADR.

| # | Mesure re-exécutée par le validateur | Résultat |
|---|---|---|
| V-1 | `holders_digest` (par son propre sha) | **`92f6509d…`** == prereg/sonde/filtre/course |
| V-2 | `book_digest` (par **trois voies**) | **`695d862f…`** (rejeu cache, recompute indépendant, champ fixture) |
| V-3 | Calibration | **n = 797, p = 791, q̂ = 364550606513851, `calib_digest 668ab214…`** |
| V-4 | H1..H7 recalculées | **identiques** au PLI/ADR (trois NON : H2 185/189, H3 85,7 %, H6 69/107) |
| V-5 | 3 fixtures régénérées par le **driver committé** (`u4-reduce.mjs`) | **byte-identiques** aux séries pinnées |
| V-6 | Ordre prereg | **un seul commit `6ac8d4a`** (2026-09-20**T06:52:38Z**) ; **première écriture brute 08:03:59Z** ; `git diff b1302db -- prereg` **vide** ; LF sha **`9209cdab…`** |
| V-7 | Mutants | **9 rouges** (Y, D_e, LT_W, décodeur e-mode, signe int256, portée événement, appartenance cellule, intégrité cache par-compte, énumération) |
| V-8 | R-25 (pathspec `ci.yml`) | **α = 931**, **β = 606** ; **import α→β = 0** ; ordre α→β forcé (β importe α via `record.ts`/`abi.ts`) |
| V-9 | Fuite | **0 valeur** de secret (motif `https?://\|chainstack\|p2pify\|api-key` = 0 sur bruts ET dépôt) |
| V-10 | CA-11 branchement | **conforme, tout `upcoming`** ; `calib_digest` consommé par son seul test ; `gate/registry/calibration/fleet/adapter-book` intacts |
| V-11 | Budget | **plancher 278 931 ≤ 278 987 < 300 000** (cumul lot mesuré) |

## 2. Ratifications (R-20 : le validateur ratifie, ne produit pas)

- **D-9 RATIFIÉ** (sous C-V-5) : « mécanisme du feed **NON EXPLIQUÉ, à procurer** ; **p_min défendu par ENCADREMENT** » — l'appartenance-valeur 106/107 et le retard 1-3 events sont un diagnostic post-hoc, **jamais** « feed validé ». Le NON 69/107 (forme pré-enregistrée) reste épinglé tel quel.
- **D-10 RATIFIÉ** : **garder les 16 096 comptes** dans la fixture book réduite (la cellule 797 dérive de la population complète ; une fixture « cellule seule » rendrait `eligible_under_De`/`eligible_static_b0` tautologiques). `PROVENANCE-u4.md` déclare la fixture *lossy* et pin le book brut/cache.

## 3. Checklist (l'avis rend des CORRECTIONS + des ratifications, PAS un verdict CA-par-CA ; les verdicts CA ci-dessous sont **déduits** par l'implémenteur de l'avis — marqués « (déduit) » — et rattachés aux corrections/mesures que l'avis énonce ; « n-a » = non applicable)

| Règle | Verdict | Preuve / renvoi |
|---|---|---|
| **CA-6** oracle + revue séparée | conforme (déduit) | mesure reproduite de première main (V-1..V-7) ; G2 = instance séparée à contexte frais (`docs/G2-lot-u4a.md`) ; **mais** re-tirage LIVE pré-enregistré non fait ⇒ C-V-3 |
| **CA-7** zéro dette | **correction** (déduit) | items formés (procurements PR-U4-1..4, U4-H1 stricte, EBUSY, A-5/6/7) ; **mais** Y incomplet (C-V-2), gate racine rouge (C-V-1), contrôle live non déclaré (C-V-3) ⇒ dettes à former/plier |
| **CA-8** provenance | **correction** (déduit) | `error_origin` par déviation + bloc JOURNAL par étape (C-V-4) ; `meta.model` des bruts = `claude-opus-4-8[1m]` (vérifié) ; 3 sha du PLI périmés (C-V-7) |
| **CA-9** vérification imposée par le système | **correction** (déduit) | rejeu offline par instance séparée, 9 mutants ; **mais** le contrôle indépendant **live** pré-enregistré (prereg §4) n'a pas été exécuté ni déclaré ⇒ C-V-3 (à exécuter par G2-delta) |
| **CA-10** anti-vitesse / petits lots | conforme (déduit) | aucun argument de vitesse ; R-25 α 931 / β 606 ≤ 1 205 (V-8) ; découpe C-10 α→β pré-déclarée |
| **CA-11** branchement | conforme | V-10 : tout `upcoming`, rien de nouveau `built`, tuyaux déclarés dans ADR-U4 ; **item formé** « rejouabilité publique de la calibration U-4 » (C-V-1) |
| CA-1..CA-5 (plan) | n-a | tranchés au checkpoint-1 (C-1..C-13) ; non re-rendus dans cet avis |

## 4. Corrections — liste fermée (INTÉGRALE)

### BLOQUANTES avant gel/fusion de α et avant G7

**C-V-1 — gate racine ROUGE introduit par le lot.** `npm run test` complet : β **439/440**, α **436/437**, base verte ; test rouge **`export_public_no_governance_no_french`** (`test/export-public.test.ts`, test 42). Cause double : (α) `u4_prereg_sha_matches_committed_plan` lit `docs/PLAN-u4-prereg.md`, **absent de l'export public** ⇒ **ENOENT** dans la CI exportée (assertion (e)) ; (β) `ukemi-u4-scores.test.ts` importe `scripts/census/u4-scores.mjs` + `.d.mts`, **hors `WHITELIST_FILES`** ⇒ **TS2307** au typecheck exporté.
**ADJUDICATION ORCHESTRATEUR (transcrite)** :
- (α) **isoler** le test du prereg dans un fichier de test « gouvernance » **dédié** (jamais un skip silencieux), ajouté à `scripts/export-exclude-tests.json`.
- (β) **EXCLURE** `ukemi-u4-scores.test.ts` de l'export par le **même mécanisme** (`export-exclude-tests.json`) ; **NE PAS** whitelister `scripts/census/**` (Ukemi est `upcoming`, la recette n'est pas une surface publique). **DIRE dans l'ADR-U4** que la **recette de calibration n'est pas rejouable depuis le miroir public à ce stade** — **item formé** « rejouabilité publique de la calibration U-4 » (déclencheur : G0 U-7 / publication Ukemi ; propriétaire : orchestrateur).
- **Fixtures `u4/*` (dont 5,96 Mo) + `PROVENANCE-u4.md` (chemin local `F:\…`)** : entrent dans l'export (via `apps/sentinel/test`). **Décision (plus petite forme cohérente, prouvée par précédent) = Option A** : exclure les **deux tests seulement**, laisser les fixtures. **Preuve** : sur l'arbre courant, l'export embarque déjà les fixtures **u3** (`U3-*.jsonl` + `PROVENANCE-u3.md` avec 1 chemin `F:`) en **orphelines** (le test u3 vit à la racine, non exporté) — état **accepté au CHECKPOINT2-u3**. Après exclusion des deux tests u4, l'état u4 est **identique** au précédent accepté. **NE JAMAIS** mettre les fixtures dans `STRUCTURAL_BLACKLIST` (échec dur exit 1 + divergence du miroir `BLACKLIST` de test 42).
- **Contrainte de disjonction α/β** : `scripts/export-exclude-tests.json` est le **seul** fichier des deux commits de pli. Assertion (d) exige `manifest.excluded_tests == cfg.tests` **exactement** ; un chemin absent de l'arbre n'est jamais candidat ⇒ **α-fix ajoute UNIQUEMENT le test gouvernance** (sinon α-seul rougit à (d)), **β-fix ajoute le test scores**.
- **Traçage** : amendement de `docs/adr/ADR-M004-infrastructure-plateforme.md` **D7** (addendum daté, texte exact posé au pli).
- **Exigé** : `npm run test` **COMPLET** mesuré VERT sur **α SEUL** (copie scratch = α + correction α) ET sur **l'arbre final** ; correction α dans des fichiers α, correction β dans des fichiers β ; deux listes de fichiers rendues.
- **error_origin** : **worker + orchestrateur** (non détecté par G2 ; répétition du mode C-G2-1 = suite complète non lancée).

**C-V-2 — C-12 absorbé (Y incomplet).** Le PLI (§7, §8 D-1) dit « la réduction utilise 23550406 » mais le réducteur **ne lit jamais `usdt_prices`**. Compte `0x15391e14…` (résidu U-3 `deficit_base_no_price`, USDT natif 4 428 191 052, `first_block` 23550406) : **Y utilisé 277 615 428 066** (repayment seul), **deficit omis 445 329 889 526** (= 4 428 191 052 × prix USDT 100567000 / 10⁶), **Y complet 722 945 317 592**. Comme ŷ = 0 (`eligible_de:false`), score = Y < q̂ (3,65 e14) ⇒ **n, p, q̂ invariants**, seul `calib_digest` change.
**ADJUDICATION** : le prereg §2 et C-12 (checkpoint-1 l.55, l.33 : « Y = repayment + deficit RATIFIÉ ») définissent **Y déficit COMPRIS** ⇒ **COMPLÉTER Y** (conformité au prereg ; `calib_digest` + fixture scores re-pinnés ; **vérifier que n, p, q̂ restent inchangés, sinon ARRÊTER et rendre les chiffres**). Le digest n'est consommé par **aucune pièce servie** aujourd'hui ⇒ moment le moins cher. **Corriger le PLI dans tous les cas** (constat daté, chiffres avant/après). **Mutants correspondants**.
**error_origin** : **worker** (non détecté par G2 ni advisor-defi).

**C-V-3 — contrôle indépendant PRÉ-ENREGISTRÉ non fait et non déclaré.** Prereg §4 : « re-tirage G2 ≥ 3 comptes du book + ≥ 3 `AnswerUpdated` » ; G0 l.52, l.68 / C-13. La G2 a fait un **rejeu offline** depuis le cache, **PAS** un re-tirage **live**. **NE PAS l'exécuter ici** (doit l'être par l'instance **G2-delta** séparée, lancée par l'orchestrateur après le pli).
**Travail de l'implémenteur** : (i) **déclarer la déviation D-12** au PLI (`error_origin` **G2 + orchestrateur**) ; (ii) **PRÉPARER l'outil** : une commande exacte, **bornée** (`--max-calls` ≤ 60, **fail-closed**, sous le garde de budget existant, brut **hors dépôt**), qui **re-tire ≥ 3 comptes du book** (choisis par une **graine dérivée de `book_digest`**, pas à la main) et **≥ 3 `AnswerUpdated`**, et **compare aux valeurs du cache** ; l'outil doit permettre d'**EXCLURE des opérateurs** du pool (`publicnode` sous examen CONF-SRC-1 : re-tirage possible SANS eux) — **dire comment** ; (iii) mettre à jour la **ligne MAST de l'ADR-U4** (« contrôle indépendant live : à exécuter par G2-delta »).

**C-V-4 — bloc JOURNAL à poser au commit G7.** Écrit **VERBATIM** dans le PLI (« ▼ BLOC EXACT »), un modèle résolu **PAR ÉTAPE** : plan + prereg orchestrateur `claude-fable-5-1` ; checkpoint-1 `claude-fable-5-1` ; G1, courses et plis `claude-opus-4-8[1m]` (vérifiable dans `meta.model` des bruts — **vérifié : `"model":"claude-opus-4-8[1m]"`**) ; G2 `claude-opus-4-8[1m]` ; advisor-defi `claude-fable-5-1` ; checkpoint-2 `claude-fable-5-1` ; ce pli ; G2-delta À VENIR ; checkpoint-2 bis À VENIR ; G7 À VENIR.
**`error_origin` (assignés au G7)** : D-1 **none** (la phrase fausse sur la réduction est portée par C-V-2) ; D-2 **worker** ; D-3/4/5 **none** ; D-7 **orchestrateur** ; D-8 **none** ; D-9 **worker** ; D-10 **none** ; D-11 **none** ; C-G2-1 **worker** ; C-G2-2 **checkpoint-1** ; C-G2-3..7 **worker** ; C-V-1 **worker + orchestrateur** ; C-V-2 **worker** ; C-V-3 **G2 + orchestrateur**.
**Note AM-1 du validateur (à consigner)** : son C-2 de checkpoint-1 (« q̂ = score maximal ») **supposait n ≤ 198** ; son C-4 **présupposait que le proxy sert le dernier event**.

### Avant G7, documentaires

- **C-V-5** : l'ADR-U4 (**l.88**) et le message du test (**l.105** de `ukemi-u4-scores.test.ts`) portent la **CONDITION** de l'encadrement : « **toute valeur servie ∈ events ∪ {p0}** », **mesurée sur 179 blocs biaisés vers les liquidations » — l'encadrement min(events) ≤ min(servi) ne tient que sous cette condition.
- **C-V-6** : reformuler **PR-U4-4** en **ITEM DE RECHERCHE** (un chercheur Sonnet 5 résout les identités bibliographiques complètes — CQR / Angelopoulos–Bates / scores studentisés — **avant le G0 de U-4b** ; propriétaire orchestrateur ; tentatives consignées).
- **C-V-7** : trois sha du PLI **périmés** — `ukemi-u4a.test.ts` `6d3d5fb0`→`b35edaeb` ; `ukemi-u4-scores.test.ts` `6a565b0e`→`09bccc03` ; `PROVENANCE-u4.md` `e5b3929e`→`fa8772cb` (mesurés). **RECALCULER toute la table sha en DERNIER**, après toutes les écritures du pli.

### Non bloquantes (adjudication : à faire ICI, zéro dette)

- Le **fallback silencieux `?? wethBaseLT`** du réducteur (l.70, dormant, 0 catégorie manquante mesurée) passe en **FAIL-CLOSED** avec test + mutant (le réducteur est rouvert par C-V-2 de toute façon).
- **Erratum** dans le texte de l'implémenteur pointant la **ligne H6 « feed validé autrement » du rapport G2 (l.26)** vers l'ADR (« p_min par encadrement, mécanisme non expliqué ») — **ne pas modifier le rapport du relecteur** (R-20).
- Si `u4-scores.mjs` garde un **chemin absolu `F:/Monark-wt-u4a/…`** (l.133), le passer en **chemin relatif à la racine**.

## 5. À consigner dans l'ADR-U4 (entrées U-4b) — ESCALADE-INVESTISSEUR (en attente, aucune réponse présumée)

Le validateur demande, **avant le checkpoint-1 de U-4b**, l'escalade investisseur : « La calibration e2 est valide, mais sa région couvre 0 pour 790 comptes sur 797. Voulez-vous servir U-4b calibré sur e2 tel quel, comme le prévoit le G0 (P-6), ou le re-périmétrer selon l'avis advisor-defi — **épisode frais** (nouvelle course d'environ 280 k appels), **ŷ à close factor**, **classe mono-collatéral**, **Mondrian** ? »

## 6. Discipline attendue du pli (rappel)

Chaque garde a son **mutant ROUGE rejoué** (copie, restauration byte-exacte, jamais `git checkout`) ; re-rejouer les **3 mutants A-4**. Oracles : **`npm run test` COMPLET** (objet de C-V-1 : α-seul-corrigé ET arbre final ; **pas** `npm run ci`), typecheck, eslint fichiers touchés, `lint:ratchet`, `gate:vocab`, `export:check`, `lang:gate`, `no-secret-in-repo`, `series_pinned_are_declared_and_hashed`. R-25 (pathspec `STAT=` de `.github/workflows/ci.yml`) : α cumulé vs `b1302db` et β cumulé vs α-final, chacun ≤ 1 205 — si α dépasse, ARRÊTER et proposer. Rapport final : modèle résolu, deux listes de fichiers (α-fix / β-fix) + sha256, décision C-V-2 avec chiffres avant/après, commande du re-tirage live (C-V-3), table C-V-n → fichier:ligne → test → mutant, oracles (chiffres de la suite complète), R-25, reste dû.
