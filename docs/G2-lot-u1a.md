# Revue G2 — lot U-1a (recorder book de liquidation Aave v3, ADR-U1 / ADR-M020), gel `9f3af85` (code = `1e7bb7e`, base `58fe309`)

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 (~09:20 UTC). Persisté par l'orchestrateur avant tout checkpoint-2. Arbre propre à `9f3af85` après la passe ; mutations en copie / probes scratchpad ; `apps/sentinel/src/rpc.ts` intact ; 9 sha LF = G1 §1.

## Verdict : APPROUVÉ-AVEC-CORRECTIONS
| # | fichier:ligne | défaut | correction | error_origin |
|---|---|---|---|---|
| C1 (bloquante fusion) | `apps/sentinel/test/fixtures/ukemi/` | série `weth-book.fixture.json` (sha LF `f98827f9…`) non déclarée+hachée same-dir ⇒ `series_pinned_are_declared_and_hashed` rouge à la fusion avec `f4428b4` ; recette `holders_digest` (tri, minuscules, `join("\n")`, `0x0` retiré) absente d'ADR/G1 ; acquisition par entrée à tracer | `PROVENANCE-weth-book.md` same-line + recettes + acquisition | générateur (règle postérieure à la base) |
| C2 (D3) | `book.ts:86` ; commentaire `ukemi.test.ts:73` | `catch` avale `QuorumDisagreementError` sur `description()` (champ du digest) ⇒ digest avec `""` au lieu d'abstenir (prouvé PROBE C1 vs C2) | ne tolérer que le revert/vide unanime ; remonter les erreurs de quorum ; commentaire corrigé | générateur |
| C3 (docs) | G1 §5b | digest live `d35df289…` produit par un `record.ts` non committé divergent (from-block 23543087, cadence 350 ms, retry) ; « sous-ensemble des acquéreurs récents » non dit | déclarer les 3 divergences, borner la revendication | générateur |

## Oracle re-exécuté
`npm run ci` 300/300 ; gate:vocab 149 ; lint 0 ; ratchet 69/69 ; export:check 0 ; lang-gate 0 ; tsc propre. R-25 : 957 (gate courante) / 914 (D9 sexies). Digest `034fbff9…` reproduit par un canonicaliseur indépendant (`python json.dumps(sort_keys)`) ; `ukemi_sha` `8aae7bbe…` recomputé.

## Mutants
| mutation | résultat |
|---|---|
| 6 du worker (bloc±1, source, Transfer omis, balance nulle, chaîne, vocab `cascade`) | tous rouges à l'insertion / verts en tant que tests |
| keccak `RHO[1]` altéré | ROUGE au load (`keccak self-test failed`) |
| `percentMul` demi-bas | ROUGE (`−429035` ≠ `+274302`) |
| quorum divergence 1 octet / < 2 fournisseurs | `QuorumDisagreementError` / `NoQuorumError`, jamais un digest |
| `asHex` vide | rejeté ⇒ `NoQuorumError` |
| `description()` reverté unanime | toléré, digest honnête (GHO) — **[annoté 2026-09-19, checkpoint-2 V-1]** vrai du code pré-C2 (`1e7bb7e`, catch large) ; **INVALIDÉ par le pliage C2 sur `dedfcd5`** (le catch restreint relançait `NoQuorumError`, que `makeUkemiPool` produit pour un revert unanime ⇒ book abstenu — défaut V-1) ; **RÉTABLI par le correctif V-1** (revert **concordant** toléré via `ConcordantRevertError`, prouvé à travers `makeUkemiPool`) |
| `description()` DÉSACCORD | avalé ⇒ **C2** (le correctif V-1 conserve : désaccord ⇒ `QuorumDisagreementError` ⇒ abstention) |

## Observations formées
O1 mutant bloc offline = liaison au label ; O2 HF cross-check = diagnostic non borné (dire « exercé », pas « confirmé ») ; O3 revert `description()` non testé (couvert par C2 cas (a)) ; O4 cluster sUSDe/USDe sans couverture comportementale (run dédié, avant U-6) ; O5 aucun vérifieur de chaîne (U-1b/U-6) ; O6 `record.ts` non importé (conforme D7) ; O7 test « deux URL même providerOf » manquant ; O8 regex D8 superset inoffensif ; O9 exemption `cascade` bornée, câblage minimal ; O10 propriétaire du durcissement `record.ts` à nommer (orchestrateur).

## Conformité ADR-U1 D1-D9 : ✓ sauf D3 `description()` (C2) et D6/D9 provenance (C1). Branchement M018 : `upcoming`, aucun registre touché, aucun « built ».

## Décision 19 — avant release Ukemi
C1, C2, C3 ; U-1b AttestedBook ; durcissement `record.ts` (retry 429/5xx, split 400, wrapper committé) ; U-6 chemin servi + `wiring` + `sentinel2_windows_identical_to_pull` ; K-1 clé attestor ; couverture sUSDe/USDe ; book plein deploy→B ; e-mode (U-1c) ; Perez Eq. 3 paginé (PR-U1-1).

## Pliage (orchestrateur, sans relance d'agent — ordre investisseur)
C1 `PROVENANCE-weth-book.md` ; C2 `book.ts` catch restreint + test `ukemi_description_disagreement_abstains_book` (mutant rejoué rouge) ; C3 G1 §5b ; 301/301.
