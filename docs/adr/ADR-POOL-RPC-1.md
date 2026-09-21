# ADR-POOL-RPC-1 — Révision du pool RPC Ethereum : retrait Blast/Llama, ajout Pocket, opérateur {nodies, pocket}, compteur de concordance

> **Rédigé par le worker G1 `claude-opus-4-8[1m]` effort max, 2026-09-21 ; PORTÉ par l'orchestrateur** (le worker ne committe pas, ne déclenche aucun workflow — R-20). **Modèle résolu (R-1) : `claude-opus-4-8[1m]`**. Écrit au **pli G2** (correction bloquante **C-G2-1** du rapport `docs/G2-lot-pool-rpc-1a.md` : C-5 du checkpoint-1 était un dû nu). Sortie vérifiée adversarialement (R-21) : chaque `fichier:ligne` a été ré-ouvert et lu dans `F:\Monark-wt-pool1a`. **Aucun contrat gelé touché, aucun commit par ce document** (docs exclus R-25, `ci.yml:65`).

- **Statut** : **PROPOSÉ (pli G2, C-G2-1)** — écrit au pli G2, porte la révision de pool implémentée au lot POOL-RPC-1a (G1 `5b9bc37`, G2 `docs/G2-lot-pool-rpc-1a.md` = PASS-AVEC-CORRECTIONS). **Amendement** d'**ADR-M012** (D1/item (m), pool sentinel servi) et d'**ADR-U1 D3** (ensembles de providers mesurés du recorder Ukemi). Reste PROPOSÉ jusqu'à G7 + acceptation validateur-humain.
- **Dates** : décisions investisseur **100/102/106** (`docs/CHANTIERS.md:409,416-418,436-437`) · sonde L-5 orchestrateur 2026-09-21 04:44-04:45Z (`CHANTIERS.md:454-458`, VERTE) · G1 2026-09-21 · ADR 2026-09-21 (pli G2).
- **Propriétaire de la décision** : investisseur (décisions 100/102/106). Exécution : orchestrateur `claude-fable-5-1` ; rédaction G1 : worker `claude-opus-4-8[1m]` ; verdict/commit : orchestrateur (R-20).
- **Gate concerné** : G0 (ce lot est déjà en G2) → G7 + checkpoint-2. Lots **POOL-RPC-1a** (cet ADR) et **POOL-RPC-1b** (accrual 30 j, déclaré §Scission).
- **Éléments affectés** : `apps/sentinel/src/rpc.ts` (`PUBLIC_ENDPOINTS`, commentaires cosmétiques) ; `apps/sentinel/src/ukemi/rpc2.ts` (`operatorOf`, `ETH_CALL_PROVIDERS`, `GET_LOGS_PROVIDERS`, `UkemiPoolOpts.onQuorum`, `quorum2`/`finalized` distinctness, `isResultLimit`) ; `apps/sentinel/src/ukemi/record.ts` (couture `runRecorder`, `--concordance-out`, agrégat/flush, garde `distinct()`) ; `apps/sentinel/src/ukemi/concordance.ts` (nouveau, réducteur pur) ; consommateur **`apps/bell/src/ethereum.ts`** (jambe Ethereum, jamais modifiée, testée par injection) ; 4 scripts gelés (notes de tête Q2). **error_origin** : n/a (amendement de programme + implémentation G1).

---

## Contexte et décisions

Le pool RPC Ethereum sert deux surfaces MESURÉES : le **sentinel servi** `/narabi/` (`rpc.ts:PUBLIC_ENDPOINTS` → `poolEndpoints` → `quorumTwo`, ancre Narabi LIVE) et le **recorder Ukemi** `/ukemi/` (`rpc2.ts:ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` → `makeUkemiPool` → course U-4b, run à la demande). Après lecture des conditions d'usage (fichiers `conf-src-2`), l'investisseur a tranché :

- **Décision 106** (`CHANTIERS.md:436-437`, verbatim « retires les ») — **retirer Blast API ET LlamaRPC** du code servi (Blast : service annoncé arrêté 2025-10-31, endpoint vivant ⇒ retrait par conditions, sans urgence de panne ; LlamaRPC : aucune ToS localisable). **{nodies, pocket} = UN opérateur** confirmé au niveau investisseur.
- **Décision 102** (`CHANTIERS.md:416-418`, « peut on le garder et ajouter pocket? » → oui, « risque nul ») — **Tenderly CONSERVÉ** dans `GET_LOGS_PROVIDERS` ET **Pocket AJOUTÉ** ⇒ 3→4 opérateurs de logs, marge accrue (la CA-7 « exclure tenderly » et le MAST « effondrement getLogs par retrait Tenderly » du G0 source sont **CADUCS**). Item TENDERLY-TOS clos côté blocage ; rappel de relecture LEGAL-ATLAS sans effet sur le plan.
- **Décision 100** (`CHANTIERS.md:409`) — Pocket en 3 temps : head eth_call (sonde 03:41, n=1 + recoupement book), getLogs **gaté par la sonde L-5**, accrual concordance 30 j (1b). L'**archive getLogs Pocket** était À PROUVER (le `[]`@1-bloc de la 1ʳᵉ sonde ne prouvait rien, N-4).

**Sonde L-5 (orchestrateur, acte réseau, R-20)** rendue VERTE le 2026-09-21 (`CHANTIERS.md:454-458`) : fenêtre ANCIENNE (2 000 blocs) — Pocket 2 272 logs **byte-identiques** (sha `1f87f85d…`) à MEV Blocker ⇒ archive getLogs Pocket admise ; fenêtre RÉCENTE (7 168 blocs) — burns/mints recalculés IDENTIQUES aux valeurs committées ⇒ L-1 VERT ; Pocket refuse > 5 000 blocs (`-32602 "query block range exceeds server limit, narrow your filter: 5000"`), autre limite hétérogène `"query exceeds max block range 10000"` ; dRPC gratuit refuse les DEUX fenêtres (`code 35 "ranges over 10000 blocks are not supported on free plan"`, même à 2 000 blocs).

---

## Ligne d'opérateur (C-2) — `operatorOf` dans `rpc2.ts` (JAMAIS `rpc.ts`)

`eth-pokt.nodies.app` (`ETH_CALL_PROVIDERS`) est une **passerelle adossée à Pocket Network (POKT)** (`conf-src-2/06-nodies.md:5`, suffixe « -pokt », `scripts/census/burns-by-burner.mjs:18-19`). Par `providerOf` (2 derniers labels), `nodies.app` ≠ `pocket.network` = 2 domaines ; mais **1 SEUL réseau décentralisé** ⇒ les compter comme 2 opérateurs falsifierait un quorum.

**`rpc2.ts:20` `operatorOf(url)`** : `const d = providerOf(url); return d === "nodies.app" || d === "pocket.network" ? "pocket" : d;`. Utilisé pour la **distinctness** (jamais le logging, qui reste `providerOf`, hôte nu jamais une clé) à **tous** les sites qui comptent : `quorum2` (garde `:183`, labels `:187/:191`), `finalized` (`:250`), `record.ts:331` garde `distinct()`. **Jamais `rpc.ts`** : l'ancre sentinel `quorumTwo` garde `providerOf` (Narabi LIVE ; `pocket` seul y entre au pool, jamais la paire {nodies, pocket}). Une carte d'opérateur **divergente et gelée** existe côté Bell-Solana (`apps/bell/src/operators.ts`, item ci-dessous) — hors périmètre, non fusionnée (import circulaire).

---

## Tuyaux (règle Branchement — entrée / sortie / état / test PAR livrable)

| Livrable | Entrée (produit par) | Sortie (consommée par) | État | Test non-LLM |
|---|---|---|---|---|
| **L-1** `PUBLIC_ENDPOINTS` −Llama −Blast +Pocket | `rpc.ts:19-26` | `poolEndpoints(env)` → `quorumTwo` → ligne SERVIE `/narabi/` (`narabi-live.tsx:300`, union dynamique) | **code+test ; WIRED à E-5** (getLogs Pocket récent gaté L-5, VERT). « BUILT » seulement à la 1ʳᵉ ligne JOURNAL post-déploiement listant `pocket` sans llama/blast (critère C-8) | `pool_rpc_1a_ca1_public_endpoints_membership`, `sentinel_quorum_needs_two_providers`, `pool_rpc_1a_l1_pocket_through_unchanged_anchor` |
| **L-2** `ETH_CALL_PROVIDERS` −Blast +Pocket (4 URL / 3 opérateurs) | `rpc2.ts:268` | `makeUkemiPool` → course **U-4b** | **code+test ; WIRED au run recorder** ; « BUILT » à la 1ʳᵉ provenance U-4b listant `pocket` sans blast | `pool_rpc_1a_ca4_*`, `pool_rpc_1a_provider_order_is_pinned` |
| **L-3** `GET_LOGS_PROVIDERS` +Pocket, Tenderly gardé (4 opérateurs) | `rpc2.ts:269` | Ukemi : `makeUkemiPool.getLogsRange` → U-4b. **Bell** : `ethereum.ts:76-77 liveEthSwaps` → `collect.ts:638 (--eth)` → fills TSLAon | **code+test ; ajout Pocket gaté L-5 (VERT)** ; consommateur Bell = T-1b-backend GATÉ (décision 101) | `pool_rpc_1a_ca7_get_logs_pool`, `pool_rpc_1a_provider_order_is_pinned`, `bell_pool_rpc_1a_ca9_*` (×4) |
| **C-2** `operatorOf` {nodies, pocket}=1 | `rpc2.ts:20` | `quorum2`/`finalized`/`record.ts distinct()` | **code+test** | `pool_rpc_1a_ca2/ca3`, `ukemi_record_distinct_guard_by_operator` |
| **L-4** Compteur de concordance | `quorum2:onQuorum` (`rpc2.ts:199`) → `record.ts` agrégat par paire → flush jsonl (`--concordance-out`) → `concordance.ts:reduceConcordance` | **le RÉDUCTEUR de test** (J+30/fin U-4b = déclencheur futur ; proposition ultime post-LEGAL-ATLAS) | **instrument câblé CLI ; consommé par le réducteur du test de chaîne** ; **DANS AUCUN REGISTRE PUBLIC** (pas de surface servie ⇒ ni « built » ni « upcoming » sur site/README/skill) — R-L4 issue **1** (ruling orchestrateur) | `ukemi_record_concordance_chain` (args→runRecorder→jsonl→reduceConcordance→compteurs) |
| **L-5** Sonde getLogs archive | fenêtres committées | GO/NO-GO membership (récent→L-1, ancien→L-3) | **FAIT/VERT** (acte orchestrateur, R-20) | (consigné `CHANTIERS.md:454-458`) |
| **L-6/L-7** 1rpc hors pools lourds ; Chainstack repli inchangé | `rpc2.ts:268-269` ; env `CHAINSTACK_ETH_URL` | — | **assertion d'absence** ; ancre Chainstack inchangée | `pool_rpc_1a_ca5_1rpc_out_of_heavy_pools` |

**Compteur de concordance — précision (R-L4 issue 1)** : le hook `onQuorum` tire **AVANT** le throw de désaccord (`rpc2.ts:199`, entre la garde NoQuorum et le throw `QuorumDisagreementError`), avec des **opérateurs seuls** (`operatorOf`, jamais d'URL) ; l'agrégat est **par paire d'opérateurs triée** (N-3 : O(paires), pas ~140 k appends) ; le flush est dans un **`finally`** (garanti même sur throw d'abstention) ; le réducteur `reduceConcordance` est **pur** (aucune IO). **No-op par défaut** : `--concordance-out` absent ⇒ `onQuorum` undefined ⇒ `book`/`book_digest`/`holders_digest` **byte-identiques** (`034fbff9…`/`267cd991…` VERTS) ; `ukemi_sha` change (bénin, C-4, PAS l'invariant). **Couture** : `runRecorder(argv, deps)` exporté (`record.ts:308`), `main()` = wrapper sous run-guard ; deps = `{env, now}` — la couture RETOURNE le code (0/2), le wrapper applique `process.exit` APRÈS le `finally` (écart déclaré vs « deps=env/now/exit » : `process.exit` tuerait le flush).

---

## L-5 — classification des plafonds de range (`rpc2.ts:67/72`)

`isResultLimit` étendu de `narrow your filter` (les phrases Pocket `block range exceeds`/`max block range` étaient déjà couvertes par `block range`, le message dRPC par `10000`/`ranges? over`). Dans `getLogsVia`, **`isPlanLimited` est testé D'ABORD** : un 400 dRPC « free plan » **benche sans splitter** (le plafond est le PLAN, pas la range — L-5 : dRPC refuse même 2 000 blocs, splitter est futile). Un `header not found` ne matche NI l'un NI l'autre ⇒ bench sans split (issue correcte pour un bloc hors archive). Le **découpage tient ≤ 5 000 blocs pour Pocket** par la récursion existante (chunk 9990 → 4995 ≤ 5000), transparente au quorum (logs concaténés triés).

---

## Scission 1a / 1b (motivée par l'ancre + la temporalité, PAS R-25)

- **POOL-RPC-1a** (ce lot) : révision de pool + couture `runRecorder` + collapse {nodies, pocket} + producteur/réducteur de concordance + déclaration du consommateur Bell. Rejoint le redéploiement **E-5** (piggyback, Q1 : 1a fusionne avant le SHA E-5 ; `git merge-base --is-ancestor <sha-1a> <sha-E-5> == 0` au journal E-5 ; sinon escalade).
- **POOL-RPC-1b** (DÉCLARÉ, item à déclencheur) : accrual quotidien 30 j côté sentinel (décision 100 pas 2). **N-5 : 1b exige un DEUXIÈME redéploiement sentinel** (la décision 92 ne couvre qu'UN redéploiement) ⇒ **demande de go explicite**, déclarée ici, jamais un dû nu. Déclencheur : fusion+déploiement de 1a.

---

## Items formés (règle Dettes — jamais un dû nu)

1. **`apps/bell/src/operators.ts` — `operatorOf` divergent (carte gelée Bell-Solana, ADR-T1aii C-9).** Il existe DÉJÀ un `operatorOf` (domaine→opérateur : helius, chainstack, publicnode, pocket, llama, drpc, ankr…) consommé par la seule jambe **Solana** de Bell (`quorum.ts:84/88/93`, `collect.ts:250`, `discover.ts`, `rebase-*.ts`). Il mappe `pocket.network`→`pocket` mais **PAS `nodies.app`** (→ « nodies.app »), et son schéma d'étiquettes diverge du `operatorOf` minimal de rpc2.ts (domaines : drpc.org, mevblocker.io, tenderly.co, pocket). **Isolation CONFIRMÉE** (G2 point 2/9-1) : la jambe **Ethereum** de Bell (`ethereum.ts`) utilise `rpc2.operatorOf`, PAS `operators.ts`. Non fusionné (frozen par ADR C-9 ; un import rpc2→bell serait circulaire). **Décision à trancher (owner : orchestrateur)** : (a) laisser deux cartes (sous-systèmes distincts, Solana n'a pas de nodies-eth), ou (b) ajouter `"nodies.app": "pocket"` à `OPERATOR_OF_DOMAIN` par une ligne d'ADR. **Déclencheur** : tout lot futur touchant la distinctness Bell-Solana.
2. **Ancre sentinel `rpc.ts:87` `isResultLimit` sans `isPlanLimited` (C-G2-4).** Contrairement à `rpc2.ts`, l'ancre Narabi n'a pas de garde `isPlanLimited` : un 400 dRPC « free plan » y matche `isResultLimit` (via `10000`/`block range`) ⇒ `getLogsVia` (`rpc.ts:208`) **splitte jusqu'au plancher puis benche** (gaspilleur ; `eth.drpc.org` EST dans `PUBLIC_ENDPOINTS`). **Pré-existant** (non introduit par 1a), **hors périmètre** (ancre Narabi LIVE non touchée, C-2 « jamais rpc.ts »), **non-correctness** (le fail-closed tient : la fenêtre échoue proprement, jamais de ligne fausse). **Owner : orchestrateur** ; **déclencheur : lot Narabi suivant** (retirer dRPC de la voie getLogs sentinel, OU porter `isPlanLimited` dans l'ancre = lot séparé avec ses propres gates). Question orchestrateur L-5 (« à comprendre au G1 », `CHANTIERS.md:456`) ainsi consignée, ni contournée ni tue.
3. **`apps/site/lib/narabi-snapshot.ts:23`** — snapshot committé (sha-pinné `stateSha256`/`timelineSha256`) de lignes SERVIES 2026-09-17/18 portant les 8 anciens endpoints dans `endpoints[]`. **NON réécrit** : histoire honnête (ces hôtes ont bien servi ces jours), revisionnisme proscrit (même principe que la fixture `narabi-timeline-2026-09-19.jsonl`). Aucun coût R-25.
4. **`--exclude-operator pocket.network` exige AUSSI `nodies.app`** : `applyExcludeOperators` (`record.ts:46-49`) matche par `providerOf`/`operatorLabel` seuls (NON étendu à `operatorOf`, C-6 « à déclarer, ne pas redessigner »). Exclure l'opérateur Pocket ENTIER en campagne lourde = 2 drapeaux. Déclaré, non corrigé (hors périmètre).
5. **`--resume` HIT contourne le hook** (`record.ts:324`) : un U-4b repris de cache n'observe la concordance que sur les MISS. Déclaré, jamais surinterprété.
6. **Chiffre RPS Pocket/Nodies [2nd]** non confirmé (« 15-25 RPS », `conf-src-2/06-nodies.md:44`) ⇒ **procurement déjà formé** (`06-nodies.md:43-47`), non utilisé comme fait ici.

---

## Rattachement

Amende **ADR-M012** (item (m), pool sentinel servi : le pool passe de 8 à 7 publics + Pocket ; `providerOf`/`quorumTwo` inchangés) et **ADR-U1 D3** (ensembles de providers mesurés du recorder : `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` révisés, distinctness par `operatorOf`, hook `onQuorum`). Ne touche aucun contrat gelé (ADR-M001). Les MAST caducs (effondrement getLogs par retrait Tenderly) sont retirés ; la conséquence eth_call mesurée (3 opérateurs keyless, Chainstack porteur si mevblocker exclu) + le cap « un rôle keyless remplacé par Chainstack à la fois » restent liants pour U-4b.
