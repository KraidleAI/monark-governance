# ADR-U1 — Ukemi `sentinel-2` mode recorder : témoin du book de liquidation à un bloc archive, digest canonique et timeline chaînée

- **Statut** : **proposé (G0)** — lot U-1 du programme ADR-M020. **Checkpoint-1 orchestrateur `claude-fable-5-1` sur `9ab3771` : U-1a APPROUVÉ-AVEC-CORRECTIONS (C-1..C-8 pliées ici) ; U-1b REFUSÉ tel qu'écrit** — l'adjudication « le book-Temoignage entre dans `fromShogen` » est **infondée** (le vérifieur Shōgen exige un `Constat` de compagnon TLSN, `verification.rs:289-291` ⇒ `ConstatAbsent` sans lui ; un Temoignage RPC n'aura jamais de verdict) ⇒ U-1b réécrit en **trois voies à trancher par l'investisseur (Q2, D10)**. Aucun code, aucun commit (R-20).
- **Dates** : décision 2026-09-19 · checkpoint-1 `9ab3771` 2026-09-19 · dernière modification 2026-09-19
- **Propriétaire** : investisseur (programme Ukemi, ADR-M020) ; rédaction : worker `claude-opus-4-8[1m]` ; verdict/commit : orchestrateur `claude-fable-5-1` (R-20).
- **Gate concerné** : G0 (cet ADR) → G1/G2/G7 + checkpoint-2.
- **Éléments affectés** : **nouveau** `apps/sentinel/src/ukemi/` (recorder hors outil, K-8) + tests + fixtures ; `apps/sentinel/test/sentinel.test.ts` (tests U-1 ; `sentinel_imports_bidirectional` **couvre déjà** `ukemi/**` par sa marche récursive `collect/walk` `sentinel.test.ts:283-293`, vérifié ; `sentinelSha` non récursif `run.ts:98` inchangé) ; `vocab-banned.json` scope `sentinel` (D8) ; publication `/ukemi/` (fichiers, servis seulement en U-6). **Selon la voie U-1b (D10)** : (a) `packages/monark/src/index.ts` ré-export `encodeTemoignageCanonical` **+** crate Shōgen (nouveau résidu + Constat) ; (b) `packages/contracts/**` nouveau contrat `AttestedBook` ; (c) aucun. **Non touchés** : `apps/sentinel/src/{rpc,run,timeline,flow,instrument,edetector,windows}.ts` (Narabi LIVE, J0 2026-09-17, ancre `line_hash 09beb656…` pinnée) ; `apps/harness/**` ; `schemas/**` ; `packages/contracts/**` (hors voie b).

## Contexte (mesuré)
1. **Faisabilité/coût établis (M-1, [lu])** : `getUserAccountData(user)@B` = octets **identiques sur 6 endpoints** (quorum-2), book `0x552c4ad0…`@B collatéral 18 038 $/dette 14 218 $/**HF 1,0530** (`MESURES-prealables-2026-09-19.md` §5, `out/m1-results.json` sha `986cffd9…`). `UiPoolDataProvider` courant **absent (0 octet) @B** ⇒ chemin `getUserConfiguration@B`+`balanceOf` (`m1b-userconfig.mjs`).
2. **Énumération sous-estimée par `LiquidationCall` (M-1 caveat)** : l'ensemble à-risque = **détenteurs d'aToken via logs `Transfer`**, pas les comptes déjà liquidés. N=213 (WETH liquidés) est un plancher.
3. **Prix + source par actif datables (M-2b, [lu] on-chain)** : `getSourceOfAsset`+`description()` (`m2b4-source-bisect.mjs`) ; **AaveOracle `0x54586bE62E3c3580375aE3723C145253060Ca0C2`** via `PoolAddressesProvider.getPriceOracle()` (le `…060Ca40C` d'un texte antérieur = coquille, 0 octet). Source WETH = feed SVR backrun-only (`0x5424384b…`) — `getAssetPrice` reste la vérité du HF.
4. **`liquidable-24h.ts` n'est PAS Perez Eq. 3** (vérifié) : générateur de paires **synthétiques** (`n=300`, `α=0.01` ; « no real 24h label », `packages/hikae/src/liquidable-24h.ts:9-13`). L'éligible statique est calculé à neuf = HF on-chain < 1 ([lu]).
5. **`cbor-canonique.ts` est lié au témoignage Shōgen 7-champs** et rejette les entiers > u64 (`packages/monark/src/cbor-canonique.ts:9-16`) — un book porte des uint256. Non employé pour sérialiser le book.
6. **Asymétrie fournisseurs (mesurée)** : `eth_call`@B servi par {drpc, mevblocker, blastapi, nodies} (M-1 §5) ; `eth_getLogs` **large** par {drpc, mevblocker, tenderly} seulement (blastapi 10 blocs / nodies 50 blocs, census A §2). Le quorum **dépend de la méthode**.
7. **Attestation Shōgen impossible pour un book RPC (checkpoint-1, [lu] `verification.rs:281-391`)** : `verifier_temoignage(temoignage, registre, constat)` exige `constat` (sinon `ConstatAbsent`) ; (b2/c/f/g/h) lient l'utterance/preuve/`attestor.key`/instant/hôte à un **Constat de compagnon TLSN** (`A(transport-check-delegated)`, `docs/08-assumptions.md`). Une lecture quorum-RPC n'a pas de tel compagnon. ⇒ D10.

## Décision — U-1a (recorder + digest, APPROUVÉ)

**D1 — Objet (v1 : Aave v3 core Ethereum, collatéral WETH ; puis sUSDe/USDe, wstETH e-mode).** À un bloc archive **B** (fenêtre UTC ancrée bloc, `windows.ts`, B ≤ `finalized`), pour un cluster déclaré :
- **Énumération** : détenteurs d'aToken via logs `Transfer` (topic0 `0xddf252ad…`) depuis le **bloc `ReserveInitialized(topic1=collatéral)` du PoolConfigurator** (topic0 `0x3a0ca721…`, census A §1 ; résolu on-chain, jamais codé) → B ; dédup ; **prédicat à-risque = aToken `balanceOf`>0 ∧ bit collatéral ON (`getUserConfiguration`) ∧ dette>0** ; exclus **comptés** (`excluded_zero_balance`/`excluded_collateral_off`/`excluded_no_debt`), hors book. `getUserConfiguration` **d'abord** borne le coût (D4).
- **Par compte** : `getUserConfiguration`, `balanceOf` aToken/debtToken par réserve utilisée, HF **autoritaire** = `getUserAccountData.healthFactor` (brut 1e18), `getUserEMode`.
- **Prix+source** : `getAssetPrice` (8 déc. brut), `getSourceOfAsset`+`description()`.
- **Réserves @B** (via `getReservesList`+`getReserveData`, jamais adresse historique codée) : aToken/debtToken/decimals/LT/LTV/bonus ; e-mode : `getUserEMode` porté ; catégorie e-mode (getters v3.2+) lue **au lot du cluster e-mode**, `abi_mismatch` fail-closed, jamais repli sur le LT de base.
- **Bloc + hash de bloc** (quorum-2), chain id, pool, oracle, cluster id, paramètres d'énumération.
- **Éligible statique (Perez Eq. 3, [lu] via HF on-chain)** : `eligible_static = (healthFactor < 1e18)` par compte + agrégé. **Invariant croisé (C-2)** : recomputation en **WadRayMath du Pool reproduite** (base-monnaie 8 déc., LT pondéré en bps via `percentMul` **arrondi demi-haut**, puis `wadDiv` par `totalDebtBase`) = `getUserAccountData.healthFactor` **exact (pas « ≈ » ; un écart d'arrondi de bord = finding G1, jamais une tolérance muette)** ; tout compte à e-mode ≠ 0 en v1 WETH ⇒ `emode_recompute_skipped` (HF on-chain autoritaire).

**D2 — Digest : JSON canonique MONARK pour le book.** Book sérialisé en **JSON canonique** (jeu de règles fermé propre au projet, discipline RFC 8949 déterministe déjà portée par `cbor-canonique.ts:9-16`) : clés triées par octets UTF-8, aucune dupliquée, tableaux en ordre déclaré (réserves, comptes triés par adresse), **entiers en chaînes décimales** (uint256-sûr), **zéro flottant**, minifié, UTF-8. `book_digest = SHA-256(octets)`. **Périmètre** = D1 ; **exclus du digest** : endpoints, paires de quorum, latences, `node_version`, `sentinel_sha`, **`ukemi_sha`** (C-6, témoin de build `sha` sur `apps/sentinel/src/ukemi/**.ts`, vit dans la provenance à côté ; `sentinelSha` intact), tout horodatage (leçon M-2 → M-2b). *Contre CBOR pour le book* : (a) encodeur lié au témoignage 7-champs ; (b) major-0 cap u64 < uint256 ; (c) inspectable (`jq -S -c`) ; même déterminisme. **Attestation = U-1b, trois voies (D10)** — U-1a ne produit **aucune** attestation.

**D3 — Fournisseurs (quorum-2, par méthode).** `no_quorum` : toute lecture sans deux **fournisseurs distincts** concordants ⇒ tout le book `(cluster,B)` abstient en nommant la lecture ; jamais un book partiel présenté complet. Politesse ≤ **300 appels/min**, retry cooldown round-robin (motif `rpc.ts`, réutilisé sans le toucher).

| Étape | Méthode | Quorum-2 | Non retenus (mesuré) |
|---|---|---|---|
| Énumération | `eth_getLogs` (large, split-on-cap) | **drpc, mevblocker, tenderly** | blastapi (10 blocs), nodies (50) — census A §2 |
| Book/compte/réserve/prix/source | `eth_call`@B | **drpc, mevblocker, blastapi, nodies** | tenderly (rate-limit ~8) — M-1 §5 |

Concordance = SHA-256 du jeu trié (`(block,logIndex,topics,data)`, motif `A-chunks.jsonl` ; octets exacts pour `eth_call`). `providerOf` = domaine enregistrable (`rpc.ts:28`).

**D4 — Coût.** Départ ≈ bloc `16 291 127` (déploiement, census A §1) → B ; pour B=23 545 087 ≈ 727 chunks × quorum-2 ≈ **≥ 1 450 `eth_getLogs`** + splits (aWETH dense). Puis global ≈ 70 (`getReservesList`+~55–67 `getReserveData`) + par compte `getUserConfiguration`(1)→filtre→`balanceOf`×réserves(~1,7)+`getUserAccountData`(1). **N_à-risque WETH borné haut par les destinataires distincts `Transfer` aWETH à `balanceOf`>0. N, nombre d'appels et temps consignés au G1 du premier run** (aucun N ni temps devinés — C-3).

**D5 — Oracle non-LLM + mutants (avant code).** Test **`sentinel2_book_identical_to_pull`** (nom réservé **U-1** ; distinct de `sentinel2_windows_identical_to_pull`, réservé **U-6** par ADR-M020 D3 ; les deux calquent `sentinel_windows_identical_to_pull`, `sentinel.test.ts:114`) : rejeu du book depuis la fixture (D9) ⇒ `book_digest` **bit-identique**. Mutants (chacun rougit) : (1) **bloc décalé** B±1 ; (2) **source d'oracle changée** (mock `getSourceOfAsset`) ; (3) **compte omis** ; (3b) **`Transfer` omis** ⇒ `holders_digest` ≠ ⇒ compte manquant ; (4) **`balanceOf`=0 non exclu** ; (5) **hash de chaîne cassé** (fait altéré) ⇒ `line_hash` recomputé ≠ ⇒ **timeline refusée** (motif `sentinel_hash_chain`, `sentinel.test.ts:197`).

**D6 — Publication + timeline (motif Narabi).** `/ukemi/state.json` (dernier book_digest + méta) + `/ukemi/timeline.jsonl` append-only chaîné : ligne `(cluster, B, block_hash, from/to d'énumération, holders_digest, distinct_recipients, book_digest, attestation_ref, prev_line_hash, line_hash, pair_status ∈ {recorded, no_quorum, abi_mismatch, unfinalized_block})`, `line_hash` sur faits+digests **hors provenance** (`ukemi_sha` exclu). `holders_digest` (sha des adresses triées) + paramètres d'énumération ⇒ un tiers re-dérive depuis le départ. **Cache incrémental des détenteurs (C-5) = item formé** — déclencheur : cadence quotidienne (U-6) ; action : cache + **mutant « cache corrompu » ⇒ `holders_digest` ≠ ⇒ abstention** ; en U-1 l'énumération part du départ (vérifiable).

**D7 — Regard `latest` interdit (look-ahead).** Seul `finalized` non-pinné (choix de B) ; **tout** `eth_call`/`eth_getLogs` porte **B explicite**. Test = grep `apps/sentinel/src/ukemi/**` du littéral `"latest"` (calque `sentinel_waits_for_finality`).

**D8 — Interdits + `gate:vocab` scope `sentinel` (C-4).** U-1a ajoute à `vocab-banned.json` les motifs **exacts** `\bcascade\b`, `(Λ|lambda)\s*=\s*0`, `would\s+have\s+alerted|aurait\s+alert`, `reference\s+price|prix\s+de\s+r[ée]f[ée]rence`, **+ mutant d'insertion** (un mot banni inséré ⇒ rouge). **« score » N'EST PAS banni en regex** (le tracker Narabi l'emploie légitimement) — il reste un interdit de **doctrine** (ADR-M020 D2 : aucun score vendu), non un motif. Interdit book : aucun **prix publié comme référence** (`residual`/attestation = « lu, pas vrai », D10) ; aucun `latest` (D7) ; aucun [2nd] ; aucun sha horodaté dit reproductible.

**D9 — R-25 (seuil 1 205, C-1/C-8).** Seuil = **`VIBEGATES_PR_LIMIT="1205"`** (`.github/workflows/ci.yml:36`, ADR-M003 D9 ; **pas 400**), mesuré par `git diff --shortstat` (base `fetch-depth: 0`). Arithmétique **tests ET fixture inclus** : **U-1a** ≈ code 650 (`ukemi/rpc2` 150 + énum/filtre 120 + lectures compte/réserve/prix/source 200 + assemblage/JSON/digest 140 + éligible 40) + tests/mutants ~350 + **fixture ~150** ≈ **1 150 < 1 205**. **U-1b** (voie choisie D10) : publication+timeline ~130 + tests ~120 + attestation propre à la voie — chacun < 1 205. **Fixture (C-8)** : JSON **lisible (non compacté pour passer sous le compteur)**, sous `apps/sentinel/test/fixtures/ukemi/` = **sous-ensemble épinglé réduit** (poignée de comptes des sondes M-1 + quelques réserves + réponses `eth_call`, ~qq centaines de lignes comptées par `--shortstat`) ; le **book plein à B** est un artefact **G1 live** (digest journalisé), **non committé** (sinon N lignes de détenteurs feraient sauter 1 205).

## D10 — U-1b : attestation, trois voies (Q2, l'investisseur tranche ; un seul oracle par voie)
Le book RPC ne peut pas produire un verdict Shōgen (Contexte 7). Choix **investisseur** (ni worker ni orchestrateur) :
- **(a) ADR Shōgen « transport rpc-quorum »** : nouveau **résidu de transport** au registre (`docs/08-assumptions.md`, ex. `A(rpc-quorum-agreement)` : « ≥2 fournisseurs RPC indépendants renvoyant les mêmes octets ne colludent pas » — un par mécanisme, ADR-0001) **+ producteur de `Constat`** pour quorum-RPC (`attestor.key = cle_du_controle`, hôte de `subject` = `origine_authentifiee`). *Oracle* : `(Temoignage_book + Constat_rpcquorum) → verifier_temoignage = Ok(Verdict)`, nouveau résidu résolu ; mutant `Constat` absent ⇒ `ConstatAbsent`. Lourd (crates Shōgen).
- **(b) Contrat gelé MONARK `AttestedBook`** (lignée Narabi `AttestedFlow`, **auto-déclaré, hors Shōgen, aucun vérifieur**) : `subject` (URL, D-schéma), `attestor` (clé placeholder, Adj-2), `residual = ["rpc_quorum_2","oracle_price_as_read","oracle_source_as_read"]`, `utterance.hash = book_digest`, `observed_at = ts(B)`, consommé par un adaptateur `fromAttestedBook`. *Oracle* : `fromAttestedBook(serialize(book))` round-trip + mappe vers un aval déclaré ; mutant champ altéré ⇒ rejet. Le plus honnête/léger qui **branche**.
- **(c) Octets sans vérifieur, tuyau 2 « upcoming »** : émettre le book + `book_digest` (D2), **aucun** contrat d'attestation ; tuyau 2 déclaré **non branché** (M018), formé avec déclencheur. *Oracle* : `sentinel2_book_identical_to_pull` seul.

**Schéma d'URL du `subject` (item (iii) CLOS, [lu] `subject.rs` C1-C10)** : `https://` minuscule exclusif, hôte minuscule non-vide, pas de `#`/userinfo/littéral d'adresse/IDN, chemin non-vide sans segment `.`/`..` ⇒ schéma **immuable par `(cluster, B)`** : `https://monarkgate.tech/ukemi/book/<cluster>/<B>.json` (valide C1-C10). **Adjudication 2 (K-1)** : sous (b)/(c) la clé `attestor` est un **placeholder** (Narabi sert déjà `attestor.key:"deadbeef"`, `flow.ts:52`) — item K-1 d'honnêteté, **déclencheur = avant le go U-6 servant `/ukemi/`** ; sous (a) la clé = `cle_du_controle` (pas de placeholder).

## Tuyaux (ADR-M018 D3)
| Tuyau | Entrée | Sortie | État | Test |
|---|---|---|---|---|
| book → digest (U-1a) | RPC archive quorum-2 (D3) | `book_digest` (JSON canonique) | — | `sentinel2_book_identical_to_pull` + mutants (1)-(4) |
| book → timeline (U-1a/b) | recorder | `/ukemi/timeline.jsonl` chaînée | JSONL append-only | mutant (5) |
| digest → attestation (U-1b) | recorder | **selon voie D10** (a/b/c) | fichiers `/ukemi/` | **un oracle par voie (D10)** |

**Non branché en U-1, formé avec déclencheur (M018 D3)** : (i) **chemin servi** Caddy `/ukemi/*` + `fleet.ts wiring` + test servi bout-en-bout → **U-6** ; jusque-là l'entrée **Ukemi** reste **`built`** (décision investisseur ADR-M020 D5), `wiring` honnête ; (c) déclaré **servi** qu'en U-6 ; aucune surface publique ne change en U-1 — déclencheur : U-1..U-5 clos + go. (ii) **gate/classe** `liquidation-realized-given-oracle-path-24h` → **U-4** ; le chemin attestation→gate dépend de la voie D10 (a : `fromShogen` ; b : nouvel adaptateur ; c : néant) + ligne `ATTESTATION_BINDING` — déclencheur : U-3 + U-2.

## Sources
- **[lu] on-chain/mesuré** : `MESURES-prealables-2026-09-19.md` §5 ; `MESURES-M2b-sources-2026-09-19.md` §2.1/§4.4/§4.6 ; `docs/census-2026-09-18/A-aave-liquidations.md` §1/§2 + `data/A-rawlogs.jsonl` `d0f4aa1e…`. Sélecteurs self-testés keccak : `getUserAccountData=0xbf92857c`, `getUserConfiguration=0x4417a583`, `getReservesList=0xd1946dbc`, `getAssetPrice=0xb3596f07`, `getSourceOfAsset=0x92bf2be0`, `description()=0x7284e416`, `Transfer=0xddf252ad…` ; `getReserveData`/`getUserEMode`/`balanceOf` calculés de même.
- **[lu] code** : `packages/hikae/src/liquidable-24h.ts:9-13` ; `packages/monark/src/cbor-canonique.ts:9-16,570` ; `apps/sentinel/src/{rpc.ts:19-197,windows.ts,timeline}` ; `apps/harness/src/tools/gate.ts:533,566-608` + `ADR-M017` D2 ; **`F:\Shogen\crates\shogen-core\src\verification.rs:281-391`** (Constat obligatoire, `cle_du_controle`) + **`subject.rs` C1-C10** + **`docs\08-assumptions.md`** (résidus de transport) ; `.github/workflows/ci.yml:36` (R-25=1205) ; `scripts-mesure/{m1-archive-cost,m1b-userconfig,m2b/m2b4-source-bisect}.mjs`.
- **[lu web]/[abs]** : Perez, Werner, Xu, Livshits, *Liquidations: DeFi on a Knife-edge* (FC 2021, pp. 457-476, arXiv:2009.13235 — titre/auteurs/venue [lu web] 2026-09-19) ; **Eq. 3** (HF<1) **non paginée [abs]** ; claim première = HF on-chain [lu]. Procurement PR-U1-1.

## Alternatives rejetées
- **`liquidable-24h.ts` pour l'éligible statique** : paires synthétiques (contexte 4).
- **CBOR-canonique pour le book** : lié au témoignage, cap u64 (D2).
- **Énumérer depuis `LiquidationCall`** : sous-estime l'à-risque (M-1).
- **`fromShogen`→`AttestedPrice` pour un book RPC** : **impossible** (Constat TLSN requis, `verification.rs:289` ; adjudication infondée retirée) → D10.
- **Committer le book plein à B en fixture** : N lignes de détenteurs > 1 205 (C-8) → sous-ensemble réduit + G1 live.
- **Modifier `rpc.ts`/`run.ts`/`timeline.ts`** : Narabi LIVE, ancre pinnée → module `ukemi/rpc2` important `providerOf`/`QuorumDisagreementError` sans les toucher.

## Modes d'échec MAST (revue de sprint)
| Mode | Menace | Contre-mesure |
|---|---|---|
| Vérification incorrecte | digest horodaté | périmètre digest sans provenance (D2), rejeu bit-identique (D5) |
| **Fixture auto-enregistrée (C-7)** | fixture produite par le recorder ⇒ bug cuit dedans, test vert à vide | G2 : **re-tirage live ≥ 3 comptes @B quorum-2** + `holders_digest` sur plage réduite, **indépendant de la fixture** |
| Terminaison prématurée | déclarer (c) « servi » avant U-6 | entrée Ukemi `built` maintenue (M020 D5) ; (c) servi qu'en U-6 ; registre au seul G7 |
| Dérive de spécification | « cascade »/« Λ=0 »/prix-référence réapparaissant | `vocab-banned.json` scope `sentinel` + mutant d'insertion (D8) |
| Input d'agent ignoré | ABI @B supposée courante (`UiPoolDataProvider` absent l'a montré) | résolution on-chain @B, `abi_mismatch` fail-closed (D1) |
| Perte d'information inter-agents | à-risque partiel présenté complet | `no_quorum` nommé (D3), `holders_digest` re-dérivable (D6) |

## Procurement (investisseur)
| Id | Document | Identité | Tentatives | Usage |
|---|---|---|---|---|
| PR-U1-1 | Perez, Werner, Xu, Livshits, *Liquidations: DeFi on a Knife-edge* | **Financial Cryptography and Data Security 2021, pp. 457-476** ; arXiv:2009.13235 ([lu web] titre/auteurs/venue 2026-09-19 ; **Eq. 3 non paginée = [abs]**) | PDF paginé à procurer | citation paginée de l'éligible statique (U-7) ; claim première = HF on-chain [lu] |

## Conséquences
- **Positives** : premier témoin du book de liquidation à un bloc archive, digest reproductible, source d'oracle par actif datable, éligible statique first-hand ; réutilise le motif Narabi sans toucher la sentinelle LIVE ; l'attestation est **honnêtement** posée en trois voies (aucun faux verdict Shōgen).
- **Négatives (assumées)** : le chemin (c) n'est **servi** qu'en U-6 (entrée Ukemi `built` maintenue, M020 D5) ; N_à-risque, coût et temps **non chiffrés avant le premier run** (G1) ; e-mode recompute sauté en v1 ; U-1b **bloqué sur Q2** (l'investisseur tranche la voie avant tout code d'attestation).
- **G1 attendu du worker d'implémentation** : sha des fixtures ; `book` brut à B + `book_digest` ; résultats des **6 mutants** (digest ≠ / timeline refusée) ; **invariants** — quorum-2 par méthode, `no_quorum` exercé, absence de `latest` (grep), exclus comptés, N_holders/N_filtrés/appels/temps réels, `holders_digest` re-dérivable, **recompute HF = on-chain à l'entier**, `ukemi_sha` hors digest.

## Décisions investisseur pliées (2026-09-19, décisions 15-17)
- **Q1 — clusters de U-1 : WETH + sUSDe/USDe** (les deux événements calibrables : 2025-10-10/11 WETH, 2025-02-21 sUSDe) ; wstETH/weETH/rsETH e-mode = lot **U-1c** après U-3. D1 v1 est amendé en conséquence : deux clusters dès U-1a (même recorder, deux registres de cluster, digest par cluster).
- **Q2 — enveloppe d'attestation : voie (b) `AttestedBook`**, nouveau contrat gelé MONARK (lignée `AttestedFlow` Narabi, auto-déclaré : « ce que le recorder a lu, avec quorum de fournisseurs », hors Shōgen). ADR de contrat séparé (`ADR-U1b-contrat-attestedbook`) à rédiger, checkpoint-1 avec signature investisseur (touche `schemas/`). D10 : voies (a) et (c) écartées ; U-1b = implémentation de (b).
- **Q3 — séries sha-pinnées et R-25 : règle générale** (amendement ADR-M003 D9 quinquies : exclusion par pathspec des séries de données sha-pinnées + test de déclaration/hachage) ; l'exception ponctuelle U-1a est couverte par la règle. Prérequis du G7 de U-1a, pas de son démarrage.
