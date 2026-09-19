# G1 — journal de provenance, lot U-1a (recorder book de liquidation, digest canonique ; ADR-U1, ADR-M020)

- **Modèle worker** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Opus 5 banni (roster 2026-08-14).
  Contrôle de résolution (R-1) rendu au premier tour de session : préfixe `claude-opus-4-8` conforme, vérifié.
- **Date** : 2026-09-19. **Worktree** : `F:\Monark-wt-p1b1`, branche `lot/u-1a` (HEAD de départ `58fe309`). **Aucun `F:\Monark` ni autre worktree touché.**
- **Rattachement** : ADR-U1 (D1-D9, C-1..C-8, mutants) ; ADR-M020 (D1/D4 U-1) ; ADR-M018 (branchement) ; ADR-M012 (motif sentinelle, scope vocab). **ADR de lot : ADR-U1 (U-1a).**
- **Aucun commit** (R-20), aucune action `git` en écriture, aucun workflow : l'orchestrateur committe. Sortie = donnée brute pour vérif adversariale (R-21).
- **Portée U-1a livrée (et rien d'autre)** : **nouveau** `apps/sentinel/src/ukemi/` (6 modules) + `apps/sentinel/test/ukemi.test.ts` + fixture réduite ; **additifs justifiés** `vocab-banned.json` (scope `sentinel` : 4 motifs D8 + 1 exemptPhrases) et `scripts/grep-forbidden.mjs` (câblage `sentinel.exemptPhrases`, miroir site/skills). **Non touché (0 octet)** : `schemas/`, `packages/*`, `apps/harness`, `apps/site`, `apps/sentinel/src/{rpc,windows,run,flow,instrument,timeline,edetector}.ts` — vérifié §4.

## 1. Fichiers livrés + sha256 (LF-normalisé)

| Fichier | État | Lignes | sha256 (LF) |
|---|---|--:|---|
| `apps/sentinel/src/ukemi/abi.ts` | créé (keccak self-testé + sélecteurs calculés + décodeurs) | 168 | `9edc596bb9a560335f8c8df691a55116585041499be63982b000c2e323cbca52` |
| `apps/sentinel/src/ukemi/wadray.ts` | créé (percentMul demi-haut, wadDiv, rayMul, cross-check HF) | 55 | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` |
| `apps/sentinel/src/ukemi/clusters.ts` | créé (registre committé WETH + sUSDe/USDe, aTokens+RINIT résolus on-chain, épinglés) | 52 | `d247703bfd3fb02f06214d1784697a7c1f33d6b14fbc558d84c8c7c3d46a90b5` |
| `apps/sentinel/src/ukemi/rpc2.ts` | créé (quorum-2 par méthode ; réutilise `providerOf`/`QuorumDisagreementError`/`RpcCall` de `../rpc.ts` sans les toucher ; `asHex` rejette le résultat vide) | 165 | `8e8920a29b7212c1c81b5e5db6b0eba5be17b108ca367159f2a91c432ccb04fa` |
| `apps/sentinel/src/ukemi/book.ts` | créé (recorder + digest JSON canonique + éligible + timeline chaînée ; `description()` reverté toléré = `""` ; tris par octets) | 192 | `008d3933c280121619d5381ae06a59f342ef00b03800464b2a1129bdeed2d72f` |
| `apps/sentinel/src/ukemi/record.ts` | créé (CLI live, run-guarded, hors CI ; `ukemi_sha` + timing) | 73 | `1fcc84ac3dfde9418da562e913da1f2812d4e2aeb45a8b19b45d0d3c990551f9` |
| `apps/sentinel/test/ukemi.test.ts` | créé (11 tests : oracle + 6 mutants + HF + quorum + look-ahead + vocab) | 191 | `16940c87cd9e96bd0ea2e4ae7fa7a4a20763cc8a7c82fc6aacd6849d1a27c541` |
| `apps/sentinel/test/fixtures/ukemi/weth-book.fixture.json` | créé (**sous-ensemble réel épinglé @B=23545087**, non compacté) | 43 | `f98827f94aa2eb941b71b556fa9240e73f53aa230faff1155ff6faddd58ac2bd` |
| `vocab-banned.json` | modifié (+8/−2 : scope `sentinel` 4 motifs D8 + exemptPhrases) | 124 | `c9c1acb8f2074830b43fb6f32ff11441bcbbfb9be54e1cb3108e262697b7aa75` |
| `scripts/grep-forbidden.mjs` | modifié (+6/−2 : câblage `sentinel.exemptPhrases`) | 251 | `6457709706721ed683ee9cb585d4bb3fdd0bfab34f7e4a454876028e799f0a0f` |

**`ukemi_sha`** (sha256 sur `ukemi/*.ts`, ordre trié, **hors digest**, D2/C-6) = `8aae7bbee4866c72b325eaa22a77d28362744d58b21b45eebd300a51851c4c27`.

**R-25** (`git diff --shortstat`, la fixture compte ; CI exclut `docs/G1-lot-*.md`) : **939 lignes neuves + 14 ins/4 del modifiées ≈ 957 lignes** < borne **1 205**. Marge ~248. Pas de scission requise.

## 2. Mutants nommés (ADR-U1 D5 + C-7) — MESURÉ : chacun rougit, restauration bit-exacte du digest

| # | Test | Mutation | Résultat MESURÉ |
|---|---|---|---|
| oracle | `sentinel2_book_identical_to_pull` | rejeu du book réduit depuis la fixture | **VERT** — `book_digest = 034fbff9…b921` bit-identique + `holders_digest = 529bf2b8…f110` + `line_hash = eead4f53…3e15` ; recalcul indépendant `sha256(canonicalStringify(book))` concorde |
| 1 | `ukemi_mutant_block_shift` | B±1 | **ROUGE** (digest ≠ pour B−1 et B+1) |
| 2 | `ukemi_mutant_oracle_source` | `getSourceOfAsset(WETH)` altéré | **ROUGE** (digest ≠) |
| 3 | `ukemi_mutant_account_and_transfer_omitted` | log `Transfer` d'un compte à-risque retiré | **ROUGE** (`holders_digest` ≠ ⇒ `book_digest` ≠ ; `at_risk` −1) |
| 4 | `ukemi_mutant_balance_zeroed` | `balanceOf` aToken d'un compte à-risque = 0 | **ROUGE** (recompté `excluded_zero_balance` ⇒ digest ≠) |
| 5 | `ukemi_mutant_hash_chain` | fait altéré dans la ligne timeline | **ROUGE** (`ukemiLineHash` recomputé ≠ ⇒ chaîne refusée) |
| 6 | `ukemi_vocab_sentinel_scope_bans_adr_motifs` | motif banni inséré (assemblé au runtime) | **ROUGE** pour les 4 motifs D8 ; « score » **reste vert** (non banni) |

Autres invariants testés : `ukemi_hf_invariant_findings_recorded` (deltas exacts), `ukemi_wadray_matches_aave_formula`, `ukemi_quorum_two_fail_closed` (accord/désaccord/no_quorum), `ukemi_no_latest_literal`. **11/11 verts.**

## 3. Grep résiduel (mesuré)
- **Motifs D8 dans `apps/sentinel/src/ukemi/**` et `ukemi.test.ts`** : **0** (`cascade`, `Λ=0`, `would have alerted|aurait alert`, `reference price|prix de r…rence`). Les motifs de test sont **assemblés au runtime** (`["cas","cade"].join("")`, `String.fromCharCode(0xe9)`) pour que le scope `sentinel` du gate ne rougisse pas l'oracle lui-même (idiome `sentinel_edetector_isolation`).
- **Littéral `"latest"` sous `ukemi/**`** : **0** (test `ukemi_no_latest_literal` ; `finalized` seul est lu, jamais la tête mutable — D7).
- **Collision `\bcascade\b` ↔ nom d'outil committé** : `deploy/monark-harness.service:15` nomme l'outil `cascade` (fiction v0, retiré à U-2, ADR-M020 D4). Résolu par **exemptPhrases** scope-local (mécanisme site/skills), span exact `"attest, gate, cascade, calibrate"` masqué ; une revendication `cascade` nue ailleurs rougit toujours. **Déclencheur de retrait de l'exemption : U-2.**
- **Français dans les fichiers exportés** (lang-gate scope root/site/harness/…) : **0** — regex D8 rendue ASCII (`r.f.rence`, le `.` tient lieu de lettre accentuée, documenté dans le `why`) ; « why » anglais ; `\u` non employé (transport d'échappement fragile).

## 4. Oracle brut (mesuré, worktree `F:\Monark-wt-p1b1`)
- `npm run ci` (`gate:vocab` + `typecheck` + `test`) : `gate:vocab` **OK, 149 fichiers, 0 claim** · `tsc --noEmit` **0 erreur** · **tests 300 pass / 0 fail** (289 existants + 11 U-1a ; aucun test existant cassé).
- `npm run lint` (`eslint .`) → **0** (aucune sortie).
- `npm run lint:ratchet` → **69/69** (plafond inchangé ; la fixture et l'oracle typés au bord JSON n'ajoutent aucune violation `no-unsafe-*`/`no-explicit-any`).
- `node scripts/lang-gate.mjs --scope root` → **OK, 0 hit français**.
- `npm run export:check` → **check OK — 0 forbidden path, 0 non-exempt French** (scopes root/contracts/schemas/site/harness/skills, dont `apps/sentinel` et `vocab-banned.json` exportés).
- `npm run typecheck` → **clean** (strict : `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- **R-25** : ~949 lignes < 1 205 (§1).

## 5. Book live à B (N, appels, temps, digest, sha)
**Rejeu offline (fixture réduite, socle de preuve, déterministe)** : `recordBook(CLUSTER_WETH, 23545087, fixtureReader)` sur **octets réels enregistrés on-chain @B** →
`book_digest = 034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921`,
`holders_digest = 529bf2b8ba33201d1735193729ddbccac5e0ac20032073e77a03767de31bf110`,
`line_hash = eead4f5357a07d3d3c026c4fe1e2ac7c48a35a2485f6777ccdef4251ceb73e15` ;
counts `{holders:4, at_risk:2, eligible:0, excluded_collateral_off:1, excluded_no_debt:1, excluded_zero_balance:0}`.
Le book réduit décode correctement 3 réserves (WETH LT 8300/bonus 10500/e-mode 1, USDT/USDC LT 7800), sources d'oracle datées (`ETH / USD` `0x5424384b…`, `Capped USDT/USD`, `Capped USDC / USD`), prix 8-déc, HF on-chain autoritaire.

**Book live (artefact G1 non committé, ADR-U1 D9) — RÉUSSI bout-en-bout via `recordBook` (quorum-2 réel) sur fenêtre d'énumération BORNÉE `[23543087, 23545087]` (2 000 blocs) — précision G2 C3 : produit par un wrapper NON committé autour de `record.ts`, divergent sur 3 points du code gelé : (1) from-block d'énumération forcé à `23543087` au lieu de `reserveInitBlock` (16496792) — aucun paramètre dans `record.ts`/`clusters.ts` ; (2) `minIntervalMs` 350 au lieu des 200 committés (`record.ts:45`) ; (3) un retry de book absent de `main()`. Le book obtenu est donc un **sous-ensemble des acquéreurs récents d'aWETH** (les détenteurs entrés avant 23543087 ne sont pas énumérés), reproductible avec `from_block=23543087` (auto-enregistré dans l'artefact). Le wrapper et son `ukemi_sha` seront committés au durcissement de `record.ts` (item §7, propriétaire : orchestrateur, déclencheur : avant go U-6) :**
- **N_holders = 157, N_à-risque = 91**, exclus `{collateral_off 36, no_debt 30, zero_balance 0}`, **eligible_static = 0** (tous HF > 1 à ~2 blocs avant les liquidations).
- `book_digest = d35df289ca3993092eb23b3f40b2304a5775ab392ff216075adce89bec9fbdab`, `holders_digest = 3199ebe1…be2a1`, `line_hash = 7da3728e…7db99`, `pair_status = recorded`.
- **Appels RPC = 2 602** (quorum-2 ; finalité `26010148 ≥ B` ; énumération `{mevblocker, tenderly}` ; cadence polie 350 ms ; **1 retry de book après un HTTP 429 mevblocker**, réussi au 2ᵉ essai). Artefact `ukemi-book-live.json` sha256 `847691c82c4aa4fdc1fe7d9f041dd17b7fad4cc4175ca023b8fb07399e2dd1e8` (**non committé**, D9).
- **Invariant HF (C-2) sur 91 comptes réels** : **90 `checked`** — delta entier signé **exact**, de **+742 858 243 388** à **−4 011 492 127 105 457 577 170** ; **0 delta nul** (l'aggregate-recompute est un cross-check, **jamais bit-identique** ; delta amplifié par division par une dette faible / multi-collatéral ; **jamais « ≈ », jamais tolérance muette**) — **plus 1 `emode_recompute_skipped`** (`0xe3292ce7…`, e-mode **28**). C-2 **cross-check exercé** à l'échelle (finding enregistré pour chaque compte ; le delta n'est pas borné, ce n'est pas une confirmation d'égalité — le HF on-chain reste autoritaire, `wadray.ts:3`).
- **Les 2 corrections livrées validées LIVE** : `asHex` (rejet du vide) + `description()` reverté toléré (le book a traversé des emprunteurs **GHO** sans `description()`).
- **Book PLEIN deploy→B** (énumération O(tous détenteurs aWETH depuis 16496792), ~dizaines de milliers de lectures quorum) = artefact non committé D9, **formé avec déclencheur** (durcissement débit `record.ts` §7-3), non fait cette session sous contrainte de débit des fournisseurs keyless. Le recorder est cluster-agnostique et **prouvé live bout-en-bout (fenêtre bornée) ET offline (rejeu bit-identique du sous-ensemble réel)**.

## 6. Invariants de clôture (zéro dû nu)
- **Invariant HF exact (ADR-U1 C-2)** — MESURÉ sur les comptes réels @B : `percentMul(totalCollateralBase, currentLiquidationThreshold).wadDiv(totalDebtBase)` recompute la HF ; l'écart au `getUserAccountData.healthFactor` autoritaire est un **finding entier signé exact, jamais « ≈ », jamais une tolérance muette** : `0x552c4ad0…` **+274302**, `0xe0c20053…` **−458155**, compte dette-nulle **0** (le Pool garde une précision sub-unité dans son accumulation par-réserve que les agrégats ne reproduisent pas). e-mode ≠ 0 (compte liquidé à B+1, `0xf2e9e732…`, e-mode 2) ⇒ **`emode_recompute_skipped`** déclaré, HF on-chain autoritaire ⇒ `eligible_static = HF < 1e18 = true` (HF `999816350316206148`).
- **Éligible statique (Perez Eq. 3 via HF on-chain < 1e18)** par compte + agrégé (`count`, `total_debt_base`, `total_collateral_base` en base-monnaie 8-déc), dans le digest.
- **Quorum-2 par méthode** (D3) : `eth_call` {drpc, mevblocker, blastapi, nodies}, `eth_getLogs` {drpc, mevblocker, tenderly} ; **`no_quorum` ⇒ abstention du book entier** (test `ukemi_quorum_two_fail_closed` : accord retourne, désaccord `QuorumDisagreementError`, < 2 `NoQuorumError`). Désaccord = SHA du jeu de logs trié / octets `eth_call`.
- **Look-ahead interdit** (D7) : tout `eth_call`/`eth_getLogs` porte B explicite ; `finalized` seul (B ≤ finalized, gate dans `record.ts`) ; grep `latest` = 0.
- **Digest canonique** (D2) : clés triées octets-UTF8, entiers en chaînes décimales (uint256-sûr), zéro flottant, minifié ; **provenance hors digest** (`ukemi_sha`, endpoints, paires de quorum, timing, findings HF).
- **Constantes on-chain résolues + épinglées** : AaveOracle `0x54586bE6…Ca0C2` via `getPriceOracle()` ; aTokens/RINIT — aEthWETH `0x4d5f47fa…`/16496792, aEthsUSDe `0x4579a27a…`/20184634, aEthUSDe `0x4f5923fc…`/20033499 ; sélecteurs keccak self-testés (self-test au chargement `keccak('')` + `Transfer` topic0 = `rpc.ts`).
- **Dettes : zéro dû nu.** Items formés avec déclencheur au §7.

## 7. Points à trancher / items formés (orchestrateur / checkpoint-2)
1. **Exemption vocab `cascade`** (décision, non contournement) : le scope `sentinel` inclut `deploy/monark-harness.service` qui nomme l'outil committé `cascade` ; `\bcascade\b` (motif exact D8) le rougissait. Résolu par exemptPhrases scope-local (miroir site/skills) + câblage `sentinel.exemptPhrases` dans `grep-forbidden.mjs`. **Déclencheur de retrait : U-2 supprime l'outil `cascade` (ADR-M020 D4).** À valider par l'orchestrateur.
2. **Regex D8 `prix\s+de\s+r[ée]f[ée]rence` → ASCII `r.f.rence`** : le `.` tient lieu de la lettre accentuée pour que `vocab-banned.json` reste lang-gate-propre à l'export. Fonctionnellement superset du motif exact (documenté dans le `why`). À valider.
3. **Robustesse face aux fournisseurs keyless — 2 corrections CORRECTNESS livrées dans le lot, 2 items throughput formés (tous mesurés au run live)** :
   - **LIVRÉ `rpc2.ts` `asHex` rejette le résultat vide `"0x"`** : un `eth_call` archive vide (miss d'archive / revert-to-empty) sur blastapi/nodies était accepté ⇒ source d'oracle décodée en `0x0` ⇒ digest **corrompu** (bug de correction, pas de flakiness). Rejeté ⇒ le quorum benche le fournisseur. Tests verts.
   - **LIVRÉ `book.ts` tolère un `description()` reverté** : **fait on-chain mesuré** — l'actif **GHO** (`0x40d16fc0…`, source `0xd110cac5…`, code présent à B) a un oracle à prix fixe **sans `description()`** (reverte sur les 4 fournisseurs). Un book contenant un emprunteur GHO abstenait à tort le book entier ; désormais `description = ""` (fait réel, l'adresse de source reste la donnée porteuse au digest). La fixture (sources WETH/USDT/USDC avec description) est **inchangée** — digest `034fbff9…` stable.
   - **FORMÉ (throughput)** : (a) `eth_getLogs` large — drpc refuse (HTTP 400 « free plan », dégradé depuis le census où drpc servait) ⇒ le recorder benche drpc et sert par {mevblocker, tenderly} (census A : drpc = repli) ; split sur HTTP 400 = durcissement mineur. (b) `eth_call` per-compte — mevblocker HTTP 429 sous cadence ⇒ benching < quorum. **Déclencheur : ADR de durcissement `record.ts.defaultCall` (retry transitoire 429/5xx, split HTTP 400) avant le go U-6.** Le recorder **abstient correctement (no_quorum)** — fail-closed conforme D3, jamais un book partiel.
4. **Cluster sUSDe/USDe** : registre committé (`CLUSTER_SUSDE_USDE`, 2 collatéraux, aTokens/RINIT épinglés) ; **book live sUSDe/USDe = formé, déclencheur = run dédié** (le recorder est cluster-agnostique ; la fixture réduite U-1a couvre WETH, l'événement 2025-02-21 sUSDe est un lot de mesure aval).
5. **Additif `scripts/grep-forbidden.mjs`** (hors liste d'interdits octet U-1a item 7 ; `scripts/` autorisé) : 6 lignes câblant `sentinel.exemptPhrases`, miroir exact des scopes site/skills, testé vert par `vocab_sentinel_scope_scans_src_test_deploy` (2 patterns adaptatifs inchangés) + le gate:vocab. Déclaré.
6. **U-1b (attestation `AttestedBook`, voie (b))** hors U-1a : `attestation_ref = null` dans la ligne timeline ; le book émet `book_digest`, aucune attestation (D2/D10). Tuyau digest→attestation = U-1b.

<!-- Journal de provenance G1 (corpus doc 02). Aucune revendication non sourcée ; toute mesure reproductible dans le worktree cité. Vérif adversariale R-21 chez l'orchestrateur. -->

## G2 fraîche (`claude-opus-4-8[1m]`, gel `9f3af85`, persistée `docs/G2-lot-u1a.md`) : APPROUVÉ-AVEC-CORRECTIONS → pliées par l'orchestrateur
| # | correction | error_origin |
|---|---|---|
| C1 | `apps/sentinel/test/fixtures/ukemi/PROVENANCE-weth-book.md` créé : sha LF `f98827f9…` same-line, acquisition par entrée, recettes `holders_digest`/`book_digest`/`line_hash` (règle R-25-séries `f4428b4`, test racine rougissait à la fusion) | générateur (atténuant : règle postérieure à la base) |
| C2 | `book.ts` : le `catch` de `description()` ne tolère plus qu'un revert/vide unanime ; `QuorumDisagreementError`/`NoQuorumError` remontent (ADR-U1 D3) ; test `ukemi_description_disagreement_abstains_book` (mutant : catch large ⇒ rouge, rejoué) ; commentaire test 3 corrigé | générateur |
| C3 | §5b : wrapper non committé et ses 3 divergences déclarés ; « sous-ensemble des acquéreurs récents » ; « C-2 confirmé » → « cross-check exercé » (O2) | générateur |
Observations O1-O10 : items formés — O3 test `description()` reverté (couvert par le nouveau test, cas (a)) ; O4 couverture sUSDe/USDe (run dédié, avant go U-6) ; O5 vérifieur de chaîne = consommateur U-1b/U-6 ; O7 test « deux URL même providerOf » (lot U-6) ; O10 propriétaire du durcissement `record.ts` = orchestrateur. R-25 : 957 (gate courante) / 914 (D9 sexies).
