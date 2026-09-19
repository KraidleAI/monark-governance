# G1 — journal de provenance, lot U-1a (recorder book de liquidation, digest canonique ; ADR-U1, ADR-M020)

- **Modèle worker** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Opus 5 banni (roster 2026-08-14).
  Contrôle de résolution (R-1) rendu au premier tour de session : préfixe `claude-opus-4-8` conforme, vérifié.
- **Date** : 2026-09-19. **Worktree** : `F:\Monark-wt-p1b1`, branche `lot/u-1a` (HEAD de départ `58fe309`). **Aucun `F:\Monark` ni autre worktree touché.**
- **Rattachement** : ADR-U1 (D1-D9, C-1..C-8, mutants) ; ADR-M020 (D1/D4 U-1) ; ADR-M018 (branchement) ; ADR-M012 (motif sentinelle, scope vocab). **ADR de lot : ADR-U1 (U-1a).**
- **Aucun commit** (R-20), aucune action `git` en écriture, aucun workflow : l'orchestrateur committe. Sortie = donnée brute pour vérif adversariale (R-21).
- **Portée U-1a livrée (et rien d'autre)** : **nouveau** `apps/sentinel/src/ukemi/` (6 modules) + `apps/sentinel/test/ukemi.test.ts` + fixture réduite ; **additifs justifiés** `vocab-banned.json` (scope `sentinel` : 4 motifs D8 + 1 exemptPhrases) et `scripts/grep-forbidden.mjs` (câblage `sentinel.exemptPhrases`, miroir site/skills). **Non touché (0 octet)** : `schemas/`, `packages/*`, `apps/harness`, `apps/site`, `apps/sentinel/src/{rpc,windows,run,flow,instrument,timeline,edetector}.ts` — vérifié §4.

## 1. Fichiers livrés + sha256 (LF-normalisé)

*Arbre corrigé checkpoint-2 (V-1/V-2), mesuré dans `F:\Monark-wt-p1b1` sur l'arbre gelé `dedfcd5` + correctif (non committé, R-20). sha256 LF = `tr -d '\r' | sha256sum` ; lignes = `awk 'END{print NR}'`.*

| Fichier | État | Lignes | sha256 (LF) |
|---|---|--:|---|
| `apps/sentinel/src/ukemi/abi.ts` | créé (keccak self-testé + sélecteurs calculés + décodeurs) | 168 | `9edc596bb9a560335f8c8df691a55116585041499be63982b000c2e323cbca52` |
| `apps/sentinel/src/ukemi/wadray.ts` | créé (percentMul demi-haut, wadDiv, rayMul, cross-check HF) | 55 | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` |
| `apps/sentinel/src/ukemi/clusters.ts` | créé (registre committé WETH + sUSDe/USDe, aTokens+RINIT résolus on-chain, épinglés) | 52 | `d247703bfd3fb02f06214d1784697a7c1f33d6b14fbc558d84c8c7c3d46a90b5` |
| `apps/sentinel/src/ukemi/rpc2.ts` | créé/**V-1** (quorum-2 par méthode ; classe transport vs revert : `RpcError` typé + `isRpcRevert` + `ConcordantRevertError` ; un revert ne benche PAS ; `asHex` rejette le vide) | 198 | `019786c8836cb3f382682d9067fea23a390ff7f000cce89cb6e3c2b53e7b74b2` |
| `apps/sentinel/src/ukemi/book.ts` | créé/**V-1** (recorder + digest JSON canonique + éligible + timeline ; `description()` reverté **CONCORDANT** toléré `""` via `ConcordantRevertError` uniquement ; tris par octets) | 199 | `daa65f984a5845713ad27e97cfed4126a903a6662f40e3d5d58c62006e581c61` |
| `apps/sentinel/src/ukemi/record.ts` | créé/**V-1** (CLI live, run-guarded, hors CI ; `defaultCall` lève un `RpcError` typé sur `json.error` ; `ukemi_sha` + timing) | 75 | `a4b158a56631ca4fd8e68431dcbff86ba478dd9525a6d366cf3b4b57c6bc3725` |
| `apps/sentinel/test/ukemi.test.ts` | créé/**V-1** (16 tests : oracle pool 4-fournisseurs (a/b/c/d) + critère `isRpcRevert` + 6 mutants + HF + quorum + look-ahead + vocab ; nom C2 `ukemi_description_disagreement_abstains_book` conservé, corps réécrit pool) | 255 | `84ebf1361569505da0404b544b5ded79522a85b1e6613e14b3751dc94d1be238` |
| `apps/sentinel/test/fixtures/ukemi/weth-book.fixture.json` | créé (**sous-ensemble réel épinglé @B=23545087**, non compacté) | 43 | `f98827f94aa2eb941b71b556fa9240e73f53aa230faff1155ff6faddd58ac2bd` |
| `apps/sentinel/test/fixtures/ukemi/PROVENANCE-weth-book.md` | créé (G2 C1 : sha LF same-dir, acquisition par entrée, recettes `holders_digest`/`book_digest`/`line_hash`) | 47 | `732842dc1835988b43cf31496690996895f412f496e01c3b73cf63c5852ffc05` |
| `vocab-banned.json` | modifié (+8/−2 : scope `sentinel` 4 motifs D8 + exemptPhrases) | 124 | `c9c1acb8f2074830b43fb6f32ff11441bcbbfb9be54e1cb3108e262697b7aa75` |
| `scripts/grep-forbidden.mjs` | modifié (+6/−2 : câblage `sentinel.exemptPhrases`) | 251 | `6457709706721ed683ee9cb585d4bb3fdd0bfab34f7e4a454876028e799f0a0f` |

`docs/adr/ADR-U1-recorder-book-liquidation.md` : **amendé** (bloc « Amendement 2026-09-19 (checkpoint-2 V-1) », +31 l., `error_origin = orchestrateur`) — hors table (gouvernance ADR, compté dans la gate courante R-25).

**`ukemi_sha`** (sha256 sur `ukemi/*.ts`, ordre trié — recette `record.ts` `ukemiSha`, octets bruts = LF —, **hors digest**, D2/C-6) sur l'arbre corrigé = `c94bd79ba17348a6999e6fbdc9ab28785e7fecb59e8f7d25e2d127c17ad1ef00` (avant correctif `dedfcd5` : `c9cb9380…`).

**R-25** (`git diff --shortstat 58fe309 <arbre corrigé>`) : **gate courante = 1 141** (6 modules + tests + fixture + additifs vocab/grep + amendement `ADR-U1`) / **D9 sexies = 1 098** (fixture sha-pinnée exclue par pathspec `:(exclude,glob)apps/sentinel/test/fixtures/**`) < borne **1 205**. Marge 64 (courante). CI exclut `docs/G1-lot-*.md`/`docs/G2-lot-*.md`. Le rapport `docs/CORRECTIF-V1-lot-u1a.md` est un artefact de **gouvernance** (non compté ici ; item formé d'exclusion `docs/CORRECTIF-*.md` au §Correctif).

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

Autres invariants testés : `ukemi_hf_invariant_findings_recorded` (deltas exacts), `ukemi_wadray_matches_aave_formula`, `ukemi_quorum_two_fail_closed` (accord/désaccord/no_quorum), `ukemi_no_latest_literal`. **16/16 ukemi verts** (12 avant correctif V-1 ; +4 tests d'oracle pool, l'ancien test 0 remplacé).

**Correctif V-1 (oracle réécrit à travers `makeUkemiPool`, 4 fournisseurs distincts ; mutants rejoués ROUGE puis restaurés bit-exacts) :**

| Cas / mutant | Test | Résultat MESURÉ |
|---|---|---|
| (a) revert unanime sur tout `description()` | `ukemi_description_concordant_revert_tolerated_through_pool` | **VERT** — book produit, `oracle_description == ""` (3 réserves), `descCalls == 6` (3×2 : un revert ne benche pas, quorum s'arrête à 2), digest == chemin reader à descriptions vides, **≠ PIN** |
| (b) valeur sur 1 fournisseur / revert sur l'autre | `ukemi_description_disagreement_abstains_book` | **VERT** — `QuorumDisagreementError`, jamais un book |
| (c) revert sur 1 / transport sur les 3 autres | `ukemi_description_no_quorum_abstains_book` | **VERT** — `NoQuorumError`, jamais un book |
| (d) revert concordant sur `getAssetPrice` | `ukemi_concordant_revert_on_price_field_abstains_book` | **VERT** — `ConcordantRevertError` propagée, jamais un digest |
| critère de classification | `ukemi_is_rpc_revert_criterion` | **VERT** — code 3 / -32000 nommant un revert = revert ; -32601 / 429 / transport = benché |
| mutant : retrait du rethrow `book.ts` (C2) | rejoué | **ROUGE** sur (b) — le revert ne benche plus, la lecture aval réussit ⇒ book produit à tort ; **(c) reste VERT** (bench collatéral ⇒ `NoQuorumError` aval sur `getAssetPrice`, même type ⇒ (c) ne discrimine pas C2) |
| mutant : tolérance `ConcordantRevertError` élargie à `getAssetPrice` | rejoué | **ROUGE** sur (d) |
| mutant : revert classé transport (benché) | rejoué | **ROUGE** sur (a) [+ (b)/(d) collatéraux] |

Restauration bit-exacte après mutants : `book.ts` `daa65f98…c61`, `rpc2.ts` `019786c8…4b2` (= pré-mutants).

## 3. Grep résiduel (mesuré)
- **Motifs D8 dans `apps/sentinel/src/ukemi/**` et `ukemi.test.ts`** : **0** (`cascade`, `Λ=0`, `would have alerted|aurait alert`, `reference price|prix de r…rence`). Les motifs de test sont **assemblés au runtime** (`["cas","cade"].join("")`, `String.fromCharCode(0xe9)`) pour que le scope `sentinel` du gate ne rougisse pas l'oracle lui-même (idiome `sentinel_edetector_isolation`).
- **Littéral `"latest"` sous `ukemi/**`** : **0** (test `ukemi_no_latest_literal` ; `finalized` seul est lu, jamais la tête mutable — D7).
- **Collision `\bcascade\b` ↔ nom d'outil committé** : `deploy/monark-harness.service:15` nomme l'outil `cascade` (fiction v0, retiré à U-2, ADR-M020 D4). Résolu par **exemptPhrases** scope-local (mécanisme site/skills), span exact `"attest, gate, cascade, calibrate"` masqué ; une revendication `cascade` nue ailleurs rougit toujours. **Déclencheur de retrait de l'exemption : U-2.**
- **Français dans les fichiers exportés** (lang-gate scope root/site/harness/…) : **0** — regex D8 rendue ASCII (`r.f.rence`, le `.` tient lieu de lettre accentuée, documenté dans le `why`) ; « why » anglais ; `\u` non employé (transport d'échappement fragile).

## 4. Oracle brut (mesuré, worktree `F:\Monark-wt-p1b1`)
- `npm run ci` (`gate:vocab` + `typecheck` + `test`) : `gate:vocab` **OK, 149 fichiers, 0 claim** · `tsc --noEmit` **0 erreur** · **tests 305 pass / 0 fail** (289 existants + 16 U-1a ; aucun test existant cassé). *Note d'environnement : `C:` saturé (224 Mo libres) faisait échouer le `npm ci` imbriqué du test `export_public_no_governance_no_french` (ENOSPC) ; `TEMP`/`TMP`/`TMPDIR` redirigés vers `F:\tmp-monark-wt` (724 Go libres) — contournement d'environnement non destructif, aucun fichier du dépôt ni `node_modules` touché.*
- `npm run lint` (`eslint .`) → **0** (aucune sortie).
- `npm run lint:ratchet` → **69/69** (plafond inchangé ; la fixture et l'oracle typés au bord JSON n'ajoutent aucune violation `no-unsafe-*`/`no-explicit-any`).
- `node scripts/lang-gate.mjs --scope root` → **OK, 0 hit français**.
- `npm run export:check` → **check OK — 0 forbidden path, 0 non-exempt French** (scopes root/contracts/schemas/site/harness/skills, dont `apps/sentinel` et `vocab-banned.json` exportés).
- `npm run typecheck` → **clean** (strict : `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- **R-25** : gate courante **1 141** / D9 sexies **1 098** < 1 205 (§1).

## 5. Book live à B (N, appels, temps, digest, sha)
**Rejeu offline (fixture réduite, socle de preuve, déterministe)** : `recordBook(CLUSTER_WETH, 23545087, fixtureReader)` sur **octets réels enregistrés on-chain @B** →
`book_digest = 034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921`,
`holders_digest = 529bf2b8ba33201d1735193729ddbccac5e0ac20032073e77a03767de31bf110`,
`line_hash = eead4f5357a07d3d3c026c4fe1e2ac7c48a35a2485f6777ccdef4251ceb73e15` ;
counts `{holders:4, at_risk:2, eligible:0, excluded_collateral_off:1, excluded_no_debt:1, excluded_zero_balance:0}`.
Le book réduit décode correctement 3 réserves (WETH LT 8300/bonus 10500/e-mode 1, USDT/USDC LT 7800), sources d'oracle datées (`ETH / USD` `0x5424384b…`, `Capped USDT/USD`, `Capped USDC / USD`), prix 8-déc, HF on-chain autoritaire.

**Book live (artefact G1 non committé, ADR-U1 D9) — RÉUSSI bout-en-bout via `recordBook` (quorum-2 réel) sur fenêtre d'énumération BORNÉE `[23543087, 23545087]` (2 000 blocs) — précision G2 C3 : produit par un wrapper NON committé autour de `record.ts`, divergent sur 3 points du code gelé : (1) from-block d'énumération forcé à `23543087` au lieu de `reserveInitBlock` (16496792) — aucun paramètre dans `record.ts`/`clusters.ts` ; (2) `minIntervalMs` 350 au lieu des 200 committés (`record.ts:45`) ; (3) un retry de book absent de `main()`. Le book obtenu est donc un **sous-ensemble des acquéreurs récents d'aWETH** (les détenteurs entrés avant 23543087 ne sont pas énumérés), reproductible avec `from_block=23543087` (auto-enregistré dans l'artefact). Le wrapper et son `ukemi_sha` seront committés au durcissement de `record.ts` (item §7, propriétaire : orchestrateur, déclencheur : avant go U-6) :**
- **N_holders = 157, N_à-risque = 91**, exclus `{collateral_off 36, no_debt 30, zero_balance 0}`, **eligible_static = 0** (tous HF > 1 à ~2 blocs avant les liquidations).
- `book_digest = d35df289ca3993092eb23b3f40b2304a5775ab392ff216075adce89bec9fbdab`, `holders_digest = 3199ebe1…be2a1`, `line_hash = 7da3728e…7db99`, `pair_status = recorded`. **Ce digest live a été produit sur le code pré-C2 (`1e7bb7e`) ; il est irreproductible avec l'arbre gelé `dedfcd5` (pliage C2) ET avec l'arbre corrigé V-1 — pour deux raisons cumulées : le wrapper `record.ts` non committé (3 divergences ci-dessus) ET le chemin `description()` qui a changé deux fois (C2 puis V-1) — dit tel quel.**
- **Appels RPC = 2 602** (quorum-2 ; finalité `26010148 ≥ B` ; énumération `{mevblocker, tenderly}` ; cadence polie 350 ms ; **1 retry de book après un HTTP 429 mevblocker**, réussi au 2ᵉ essai). Artefact `ukemi-book-live.json` sha256 `847691c82c4aa4fdc1fe7d9f041dd17b7fad4cc4175ca023b8fb07399e2dd1e8` (**non committé**, D9).
- **Invariant HF (C-2) sur 91 comptes réels** : **90 `checked`** — delta entier signé **exact**, de **+742 858 243 388** à **−4 011 492 127 105 457 577 170** ; **0 delta nul** (l'aggregate-recompute est un cross-check, **jamais bit-identique** ; delta amplifié par division par une dette faible / multi-collatéral ; **jamais « ≈ », jamais tolérance muette**) — **plus 1 `emode_recompute_skipped`** (`0xe3292ce7…`, e-mode **28**). C-2 **cross-check exercé** à l'échelle (finding enregistré pour chaque compte ; le delta n'est pas borné, ce n'est pas une confirmation d'égalité — le HF on-chain reste autoritaire, `wadray.ts:3`).
- **Comportement `description()` de l'arbre CORRIGÉ (V-1) — PROUVÉ OFFLINE, PAS « validé LIVE »** : un revert **CONCORDANT** de `description()` (≥ 2 fournisseurs distincts, même revert) est toléré `""` via `ConcordantRevertError`, tolérance **scopée à `description()`** ; un désaccord/`no_quorum`/toute autre lecture abstient le book. Prouvé **à travers `makeUkemiPool`** (§2 cas (a)-(d), 4 fournisseurs), non par un run live. Le fait on-chain GHO (source `0xd110cac5…` sans `description()`) reste mesuré (§7-3), mais la traversée live d'un emprunteur GHO du run `d35df289…` s'est faite sur le **code pré-C2** (`1e7bb7e`, catch large, avant le défaut V-1) ; elle n'est **pas** ré-attestée pour l'arbre gelé+corrigé. `asHex` (rejet du résultat vide `"0x"`) reste livré et testé.
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
3. **Robustesse face aux fournisseurs keyless — corrections CORRECTNESS livrées (`asHex` + classification revert/transport V-1) ; items throughput formés** :
   - **LIVRÉ `rpc2.ts` `asHex` rejette le résultat vide `"0x"`** : un `eth_call` archive vide (miss d'archive / revert-to-empty) sur blastapi/nodies était accepté ⇒ source d'oracle décodée en `0x0` ⇒ digest **corrompu** (bug de correction, pas de flakiness). Rejeté ⇒ le quorum benche le fournisseur. Tests verts.
   - **V-1 `book.ts` tolère un `description()` reverté CONCORDANT** : **fait on-chain mesuré** — l'actif **GHO** (`0x40d16fc0…`, source `0xd110cac5…`, code présent à B) a un oracle à prix fixe **sans `description()`** (reverte). Le pliage C2 (gel `dedfcd5`) avait rendu la tolérance **inatteignable à travers le pool réel** (défaut V-1) : `quorum2` classait le revert comme transport ⇒ `NoQuorumError` relancé par `book.ts` ⇒ book entier abstenu. **Correctif V-1** : un revert **concordant** (≥ 2 fournisseurs distincts, même revert — critère `isRpcRevert`) devient `ConcordantRevertError`, toléré `""` **pour `description()` seule** ; un revert ne benche plus le fournisseur (fin de la pollution `cooldownUntil` 25 s). `description = ""` (l'adresse `oracle_source` reste la donnée porteuse) ; **aucune clé nouvelle** ⇒ fixture et digest `034fbff9…` **inchangés**. Prouvé à travers `makeUkemiPool` (§2, cas (a)-(d) + mutants). `error_origin = orchestrateur` (pliage C2 écrit+vérifié par la même instance).
   - **FORMÉ (throughput)** : (a) `eth_getLogs` large — drpc refuse (HTTP 400 « free plan », dégradé depuis le census où drpc servait) ⇒ le recorder benche drpc et sert par {mevblocker, tenderly} (census A : drpc = repli) ; split sur HTTP 400 = durcissement mineur. (b) `eth_call` per-compte — mevblocker HTTP 429 sous cadence ⇒ benching < quorum. **Déclencheur : ADR de durcissement `record.ts.defaultCall` (retry transitoire 429/5xx, split HTTP 400) avant le go U-6.** Le recorder **abstient correctement (no_quorum)** — fail-closed conforme D3, jamais un book partiel.
   - **FORMÉ (V-1, vérification du critère de revert)** : `isRpcRevert` (code 3 / -32000 nommant un revert) est un **choix documenté**, non vérifié sur les formes réelles des 4 fournisseurs keyless pour le `description()` GHO (aucun run live du code corrigé). **Déclencheur : le durcissement `record.ts` ci-dessus (propriétaire orchestrateur) — journaliser `code`/`message`/`data` réels par fournisseur et confirmer l'appariement à `isRpcRevert`, sinon élargir le critère par ADR.**
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

## Correctif checkpoint-2 (V-1 bloquante / V-2) — `error_origin = orchestrateur`
Delta appliqué sur l'arbre gelé `dedfcd5` (base `58fe309`) dans `F:\Monark-wt-p1b1`, branche `lot/u-1a`, **non committé** (R-20 ; l'orchestrateur relit et committe). Worker `claude-opus-4-8[1m]`, effort `max`.

**V-1 (bloquante) — le pliage G2 C2 avait un chemin live inatteignable.** À `dedfcd5`, la tolérance « `description()` reverté ⇒ `""` » du C2 n'existait plus que pour un `Error` nu — que `makeUkemiPool` ne produit jamais : `rpc2.ts` `quorum2` classait **tout** rejet de fournisseur comme transport (bench 25 s, `NoQuorumError` sous 2 succès), et `book.ts` relançait `NoQuorumError` ⇒ un `description()` reverté **unanime** (fait on-chain : oracle GHO `0xd110cac5…`) abstenait le book entier. `error_origin = orchestrateur` : le pliage C2 (`9f3af85 → dedfcd5`) a été écrit **et** vérifié par la même instance, sans relecture fraîche (CA-9).

Correctif (option (i) du validateur), **forme canonique du book inchangée** :
- `record.ts` `defaultCall` : un `json.error` JSON-RPC lève un `RpcError` typé (`code` + `data`) ; HTTP non-ok / timeout restent des `Error` de transport.
- `rpc2.ts` `quorum2` : un revert typé (`isRpcRevert` : code 3 EIP-1474 / -32000, message nommant un revert) entre dans `got` comme issue `revert` (clé `revert:<data|message normalisé>`) et **ne benche PAS** ; deux issues concordantes ⇒ valeur si `ok`, `ConcordantRevertError` si `revert` ; clés inégales ⇒ `QuorumDisagreementError` ; < 2 issues ⇒ `NoQuorumError`.
- `book.ts` : `ConcordantRevertError` attrapé **uniquement** autour de `description()` ⇒ `""` ; partout ailleurs (getAssetPrice, getUserAccountData, getSourceOfAsset, balanceOf, getReserveData, getReservesList, getPriceOracle) toute erreur propage ⇒ abstention. `QuorumDisagreementError`/`NoQuorumError` propagent partout.
- ADR-U1 amendé (D1/D3, bloc « Amendement 2026-09-19 (checkpoint-2 V-1) », `error_origin = orchestrateur`).
- Oracle réécrit à travers `makeUkemiPool` (§2) + 3 mutants ROUGE rejoués et restaurés bit-exacts.

**V-2 — provenance rafraîchie post-correctif** : §1 (sha256 LF + lignes de l'arbre corrigé, `PROVENANCE-weth-book.md` ajouté, `ukemi_sha = c94bd79b…`), §2 (16 tests, oracle V-1), §4 (305 tests, R-25), §5b + §7-3 (comportement réel : revert concordant toléré via `ConcordantRevertError` ; run live `d35df289…` irreproductible — wrapper non committé + code pré-C2). La ligne mutants « `description()` reverté unanime → toléré » du G2 est annotée dans `docs/G2-lot-u1a.md` (invalidée par C2 sur `dedfcd5`, rétablie par V-1).

**Vérification (worktree, `npm ci` propre, `TEMP/TMP/TMPDIR` → `F:\tmp-monark-wt` car `C:` saturé — contournement d'environnement non destructif)** : `npm run ci` = gate:vocab OK (149) · tsc 0 · **305/305** ; `node --test apps/sentinel/test/ukemi.test.ts` = **16/16** ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `lang-gate --scope root` OK ; `export:check` OK. R-25 : **gate courante 1 141 / D9 sexies 1 098** < 1 205 (code des 6 modules + tests + fixture + additifs + amendement ADR-U1).

**Item formé (R-25 / gouvernance)** : `docs/CORRECTIF-V1-lot-u1a.md` (rapport de correction, comme G1/G2) n'est PAS exclu par la gate courante (`ci.yml:52` n'exclut que `docs/G1-lot-*.md`/`docs/G2-lot-*.md`) : committé à `lot/u-1a`, il ajoute ~son compte de lignes à R-25 et ferait passer la gate courante au-dessus de 1 205. **Options : (a)** étendre l'exclusion ADR-M003 D9 à `docs/CORRECTIF-*.md` (même motif que G1/G2 : gouvernance, pas du code) ; **(b)** persister le rapport hors branche (comme `CHECKPOINT2-lot-u1a.md` dans `F:\Monark\docs`). **Déclencheur : décision de commit de l'orchestrateur (seul committeur, R-20).**
