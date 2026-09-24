# G2 — relecture fraîche lot U-3 (étiquettes réelles Y_{i,e}, Ukemi)

Relecteur G2 **fraîche**, instance séparée, `claude-opus-4-8[1m]` (résolu tel quel, R-1), effort max · 2026-09-20 ·
worktree `F:\Monark-wt-u3`, branche `lot/u-3`, HEAD **`6cd991c`** (prereg `e87549a`, base `13b8391`) · scratch `F:\tmp\g2-u3\` ·
**aucun commit, aucun workflow (R-20)** · vérification par **re-exécution** (offline + re-tirage live indépendant), rédigée pour
être vérifiée (R-21). Aucune variable d'environnement imprimée ; opérateurs = domaines seuls.

## Verdict : **APPROUVÉ-AVEC-CORRECTIONS**
Le cœur est **sain, reproductible et vérifié de manière indépendante** : rejeu offline byte-identique, re-tirage live à l'unité,
identités U3-H1..H3 confirmées depuis A-rawlogs (indépendamment des séries), mutants rouges, tous les oracles verts, R-25 825 ≤ 1205,
CA-11 respecté, zéro secret. Les corrections C-G2-1..6 sont des **écarts de déclaration/documentation** (un mode « imposé par le
système » : une déviation au préreg non déclarée + un item conditionnel déclenché-mais-non-formé = dette au sens de la règle Dettes) ;
aucune n'affecte une étiquette Y_{i,e}. À plier avant clôture G7. Rien de bloquant (pas de REFUSÉ).

---
## 1. Checklist de vérification (re-exécutée) — items fermés

| # | Vérif (re-exécutée) | Résultat |
|---|---|---|
| V1 | sha LF prereg = script `--prereg-sha` = `U3-inputs` meta ; ordre commits | `835805cc…` partout ; `e87549a` = **PLAN seul** (181+, 1 fichier), jamais re-modifié ; `6cd991c` = 11 fichiers. **PASS** |
| V2 | rejeu offline depuis `U3-inputs` via le vrai `reduceU3` ⇒ 3 séries | `b4d93590`/`bb6e3207`/`748c7a81` **byte-identiques** au commit ET aux sha déclarés. 4/4 fichiers = sha déclarés. **PASS** |
| V2b | rejeu **depuis les bruts hors dépôt** (`u3-raws-clean`, sha `0afaf605` inchangé ; `--max-calls 60` = plafond fail-closed de la portion live d'un rejeu à cache complet ⇒ finalized+oracle+base-unit ≈ 6 ; **7 consommés**, tous lectures address-stable croisées contre `ORACLE_PINNED`, **sans effet sur aucune série**) | 3 séries de sortie **byte-identiques** ; `U3-inputs` identique **sauf `meta.providers`** (env-dépendant → C-G2-4). **PASS** |
| V3 | **re-tirage live indépendant** quorum-2 (`drpc.org`+`blastapi.io`), 15 appels ≤ 20 | 3 lignes (e1/e2/e3) : dtc, liqColl, `repayment_base`, `seized_base` recomputés **à l'unité**. **PASS** (§3) |
| V4 | C-7 (cross-check underlying) / C-8 (déficit, clé, contrôle positif) | M5 apparié : matché→`xfer_mismatch`, non-matché→sans effet ; déficit clé `(event,user,debt)` ; **4 `in_event`** (28 `DeficitCreated` fenêtre e2, 4 in_event + 24 window_other). **PASS** |
| V5 | C-5 fenêtres `B_last=firstBlockAtOrAfter(ts+86400)−1` (ts des bruts) ; C-6 impl@B_first | e1/e2/e3 vérifiés offline ; e2 `B_last=23552238`, `outside_window=29`. impl via **`eth_getStorageAt`(EIP-1967)**, PAS `Upgraded` → **C-G2-1** |
| V6 | U3-H1/H2/H3 + 3 déviations préreg | H1 tenue (déficit e2) ; H2 `source_change=0` (36 lignes/18 paires) ; H3 tenue à l'unité, **14 ancres cluster e2 exactes + e1/e3 pré-chiffrés** re-vérifiés depuis A-rawlogs. 3 déviations = justifiées (§4) ; 3 déviations **non déclarées** trouvées (C-G2-1/2/3) |
| V7 | 5 mutants, ≥ 3 rejoués dont M5 apparié | M1, M3, M5a, M5b rejoués (§2). Tous conformes. **PASS** |
| V8 | oracles + `npm run ci` complet (1 fois, tree clean, aucun `node --test` concurrent) | gate:vocab OK (167) · typecheck OK · lint 0 · ratchet 69/69 · lang:gate 0 · export:check 0 · **ci = 400 pass / 0 fail**. **PASS** |
| V9 | R-25 sous STAT= de `ci.yml`, `13b8391..HEAD` | **825 insertions** (PROVENANCE 62 + .d.mts 64 + .mjs 601 + test 98) ≤ **1 205**. = annoncé. **PASS** |
| V10 | CA-11 : `annex`, `fleet.ts` inchangé, test d'intégration réservé | sortie `annex` (jamais `built`) ; `fleet.ts` **non touché** (12 fichiers, tous nouveaux) ; `u4_calibrates_from_u3_realized_labels` réservé (ADR ×2, PLI ×1). **PASS** |
| V11 | aucune clé/URL dans dépôt/séries/rapport | **0** `://` dans les 12 fichiers U-3, les 4 séries, le rapport/ADR/PLI. `chainstack` = **nom de la variable/du fournisseur en prose**, jamais une valeur. Bruts hors dépôt, `pa/pb ∈ {archive-env, drpc.org, mevblocker.io, publicnode.com}` (domaines seuls ; publicnode = leg quorum des lectures non-archive). **PASS** |

## 2. Mutants (rejoués in-memory via le vrai reducer, sans écrire le worktree)

| # | Mutation | Attendu | Mesuré (G2) |
|---|---|---|---|
| M1 | une ligne (`call`) retirée | rouge (replay) | série **change** ⇒ RED ✓ |
| M2 | prix altéré dans `U3-inputs` | rouge (replay) | **non rejoué en G2** ; couvert par construction du replay bit-identique (V2) |
| M3 | `U3-deficit` vidé | rouge (topic self-test) | **0** déficit réel ⇒ test `u3_deficit_topic_selftest` (assert ≥ 1) RED ✓ |
| M4 | topic déficit attendu altéré | rouge (self-test) | **non rejoué en G2** ; couvert par l'assertion topic du test `u3_deficit_topic_selftest` (keccak `0x2bccfb3f…`) |
| **M5a** | `Transfer` **apparié** altéré (repayment `liquidateur→aToken(debt)`, `=dtc`) | rouge | ligne e1/438403a3 gagne **`xfer_mismatch`**, série change ⇒ RED ✓ |
| **M5b** | `Transfer` **non-apparié** altéré (9 candidats même tx) | inchangé | série **byte-identique** ⇒ GREEN ✓ (cross-check **non-vacide ET ciblé**) |

Le couple M5a/M5b prouve que le cross-check C-7 détecte la corruption d'un transfert matché et ignore les transferts non matchés (non tautologique).

## 3. Re-tirage live indépendant (quorum-2 `drpc.org` = `blastapi.io`, 15 appels)

Amounts pris du **receipt on-chain** (indépendant de `U3-inputs`) ; prix = `getAssetPrice(asset)@bloc` concordant sur 2 opérateurs ;
`base = floor(native × prix / 10^dec)`. Décimales confirmées via `U3-inputs` reserve (USDC/USDT 6, sUSDe/WETH 18).

| ligne | bloc | prix debt @bloc | prix coll @bloc | dtc (chain=row) | liqColl (chain=row) | repay_base (recompute=row) | seized_base (recompute=row) |
|---|---|---|---|---|---|---|---|
| e1 USDT/sUSDe `438403a3` | 21895693 | 100018800 | 113124977 | 12871019904705 ✓ | 11789512659153229780051137 ✓ | 1287343965644708 ✓ | 1333688348407917 ✓ |
| e3 USDC/sUSDe `08c14b32` | 24266439 | 99972000 | 121621655 | 3322388532587 ✓ | 2807170276837489483559485 ✓ | 332145826379787 ✓ | 341412694935783 ✓ |
| e2 USDC/WETH `00d48aed` | 23549385 | 99979178 | 402690840220 | 460737013 ✓ | 119538335282185086 ✓ | 46064107833 ✓ | 48136992673 ✓ |

**Toutes les valeurs concordent à l'unité.** Les étiquettes sont des données on-chain réelles, non des fixtures auto-enregistrées.

## 4. Déviations au pré-enregistrement

**Déclarées (census §7) — justifiées :**
- **D-1** Set-equality déficit abandonnée (receipts ⊆ fenêtre ; 24/28 déficits hors cluster WETH) — **justifiée**, `error_origin` worker, mesure corrige une attente fausse ; getLogs-fenêtre autoritaire.
- **D-2** Classes de résidu post-hoc (`deficit`, `window_other`, `deficit_base_no_price`, `receive_atoken`) — **justifiée**, chacune ajoute de l'information, aucune ne masque une abstention.
- **D-3** Bruts `u3-raws-clean` (run à froid, sha reproductible) vs `u3-raws` (tiède) — **justifiée** ; les deux donnent des séries byte-identiques.

**Non déclarées — trouvées en G2 (corrections) :** C-G2-1, C-G2-2, C-G2-3 ci-dessous.

## 5. Corrections à plier avant G7 (C-G2-n)

| id | Correction | Gravité | Preuve / justification |
|---|---|---|---|
| **C-G2-1** | **Déclarer la déviation de méthode d'implémentation.** Le préreg C-6 pré-enregistre « dernier `Upgraded(impl) ≤ B_first` » ; le script résout l'impl par **`eth_getStorageAt`(slot EIP-1967)@B_first** (`UPGRADED_TOPIC` self-testé mais **jamais utilisé**). Documenté dans PROVENANCE §2 mais **absent** de la section « Déviations » du census. À déclarer comme 4ᵉ déviation avec `error_origin`. | Mineure, **immatérielle aux étiquettes** | `impl` = métadonnée corroborante ; `preV33` est **codé en dur** dans `EVENTS`, et le statut pré-v3.3 de e1 repose sur la date de déploiement (2025-02-24, ADR-M020 D6 [lu]) > 2025-02-21 — pas sur l'impl. `getStorageAt` est même plus autoritaire (état réel au bloc). |
| **C-G2-2** | **Former l'item conditionnel « mapping vers la release taguée ».** Préreg §5 C-6 : « le mapping vers la release taguée = item formé (web/[2nd]) si non tiré. » Non tiré, **aucun item formé** (PLI §8) ⇒ dette nue au sens de la règle Dettes. Former l'item (ou biffer le conditionnel car non porteur : le statut v3.3 ne dépend pas du tag). | Mineure | PLI §8 ne liste pas l'item ; census §2 montre les 3 impl sans les mapper à un tag de version. |
| **C-G2-3** | **Rapporter (ou clore) la vérification Blockscout par événement.** Préreg §5 : « un receipt par événement vérifié Blockscout avant généralisation : e1 `0x6290d4…`, e2 (tx @23545088), e3 `0xeb20d0…` ». Non rapportée comme faite hors du préreg. | Mineure | Le G2 a re-vérifié on-chain les receipts e1 `0x6290d4` et e3 `0xeb20d0` (dtc/liqColl exacts, §3) ⇒ la substance est couverte ; il manque la trace. Noter qu'elle est superseded par le cross-check receipt quorum-2. |
| **C-G2-4** | **Corriger PROVENANCE §2** : « a third party re-derives `U3-inputs.jsonl` from the raws » est **surdit** — sans l'archive-env, `U3-inputs` se reproduit **sauf `meta.providers`** (8 vs 7 entrées ; les 5164 autres lignes identiques). Les **3 séries de sortie** sont, elles, env-indépendantes. | Mineure, non bloquant | G2 : run from-raws ⇒ diff `U3-inputs` = **uniquement** `meta.providers` (`archive-env` en tête absent). |
| **C-G2-5** | **Corriger le chemin du test** dans ADR-U3 (« Éléments produits ») et PROVENANCE §4 : cité `apps/sentinel/test/u3-realized.test.ts` ; réel (et découvert par CI via `test/*.test.ts`) = **`test/u3-realized.test.ts`**. | Mineure | PLI §1 donne le bon chemin ; `package.json test` glob `test/*.test.ts` le ramasse (4/4 verts). |
| **C-G2-6** | **Corriger le touched set PLI §1** : rapport census listé à **106** lignes (réel **129**) ; le PLI **s'omet lui-même** (12ᵉ fichier `docs/PLI-lot-u3.md`, 88 lignes). | Mineure, R-25-exclu | `wc -l` = 129 ; `git show --stat 6cd991c` = 12 fichiers dont PLI. |

**Note d'ancrage (informationnelle, non défaut du lot).** L'énoncé mission « gel `e87549a` (prereg `6cd991c`) » et « R-25 `13b8391..e87549a` » **inversent** les commits : réel = prereg `e87549a`, HEAD/travail `6cd991c`, plage R-25 `13b8391..6cd991c`. Le G0 §Critères #4 disait « R-25 ≤ 400 », amendé par C-4 à **1 205** (825 < 1205). Vérifié sur l'état git réel (fait foi).

## 6. Chiffres re-mesurés (résumé)

- Séries : `U3-realized` 198 · `U3-sources` 36 · `U3-deficit` 28 · `U3-inputs` 5165 lignes — sha déclarés = fichiers = reducer.
- e1 21895671→21902824, 5 appels/3 pos, `deficit_topic_absent` · e2 23545088→**23552238**, 239 in-window/**194 pos**/29 outside, **28 `DeficitCreated`** (4 in_event ≈180 104 $, 24 window_other) · e3 24266439→24273612, 1/1.
- U3-H3 (depuis A-rawlogs, indépendant) : e1 USDC 8 511 568 493 136 + USDT 12 871 019 904 705 ; e3 USDC 3 322 388 532 587 ; e2 identité par debt in-window ✓ ; **14 ancres cluster e2 exactes**. Cluster e2 = 268/119/213/**219**.
- R-25 = **825** (≤ 1205) · ci = **400/0** · re-tirage live = **3/3 à l'unité** · secrets = **0**.

*Donnée brute pour l'orchestrateur (R-21) : vérifier adversarialement avant consommation. Le worker plie C-G2-1..6 ; l'orchestrateur committe (R-20).*
