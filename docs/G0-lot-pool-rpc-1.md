# G0 — Sprint backlog lot POOL-RPC-1 (révision du pool RPC Ethereum ; PLAN plié au checkpoint-1, AUCUN code)

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, Opus 4.8 1M, non banni, effort max ; source = identité d'exécution de la session). **R-20** : ce worker ne committe pas, ne déclenche aucun workflow ; seul l'orchestrateur committe. **R-21** : chaque `fichier:ligne` cité a été **RÉ-OUVERT ce tour** (liste au §Faits ; toutes les corrections C-1..C-8 / N-1..N-5 / R-L4 / Q1..Q4 pliées sur pièce ré-ouverte). **AUCUN appel réseau ce tour** (ni RPC ni API) ; aucune clé/URL à secret ; aucune valeur de marché du jour. Dépôt `F:\Monark` en **LECTURE SEULE** (HEAD `af7109d` ce tour ; l'artefact-source jugé = `docs/G0-lot-pool-rpc-1.md` au commit **`7476b32`**, sha256 **`e160118c779a643c3a607969e990598a6d5ee3f7c1b76b531ee66cec187ffc8a`**, recalculé ce tour).

**Nature de ce document** : **remplaçant complet** du G0 source, produit au **checkpoint-1** par le rédacteur `claude-opus-4-8[1m]` (2026-09-21), **pliant** l'avis du validateur-humain `claude-fable-5-1` (persisté dans `docs/CHECKPOINT1-lot-pool-rpc-1.md`) ET les décisions investisseur **100** (`CHANTIERS.md:409`), **102** (`:416-418`), **106** (`:436-437`). Toutes les « Questions au checkpoint-1 » (Q1..Q4) et « Questions INVESTISSEUR » (Tenderly / timing / cap) sont désormais des **rulings/décisions** (§Rulings), plus une escalade **levée**.

**Provenance des entrées** (sha256 **[lu] recomputés au tour source**, non ré-embarqués — point fixe orchestrateur). CONF-SRC-2 SYNTHESE `45c57d69…` (chercheur `claude-sonnet-5`), FAITS Pocket navigateur `12-pocket-network-FAITS-navigateur.md` `e2e89647…` (orchestrateur, interne 2026-09-21T03:35Z), sonde sous garde `13-sonde-pool-rpc-1.json` `2d6df638…` (5 appels, plafond dur 8, aucun retry, 03:41:20Z), nodies `F:\PRODUITS\etude-2026-09-21\conf-src-2\06-nodies.md` (chercheur `claude-sonnet-5`), décisions investisseur **89** (publicnode conservé), **91** (U-4b re-mesure Chainstack ~280 k appels), **92** (E-5 redéploiement sentinel accordé), **100/102/106** (Pocket + Tenderly + retrait Blast/Llama).

---

## Objet (une phrase)
Réviser les pools RPC Ethereum SERVIS/mesurés selon les conditions d'usage lues — **retirer Blast API et LlamaRPC** (décision investisseur **106**, verbatim « retires les » ; Blast : service annoncé arrêté 2025-10-31, endpoint vivant ⇒ retrait par conditions **sans urgence de panne** ; LlamaRPC : aucune ToS localisable) ; **conserver Tenderly ET ajouter `https://eth.api.pocket.network`** aux `GET_LOGS_PROVIDERS` (décision **102**, verbatim « peut on le garder et ajouter pocket? » → oui, 3→4 opérateurs de logs, marge accrue ; ajout getLogs **GATÉ par la sonde L-5**) ; **ajouter Pocket** aux `ETH_CALL_PROVIDERS` (archive eth_call vérifiée, n=1 mesuré) et au pool sentinel SERVI ; **`providerOf`→`pocket.network`, jamais seul**, et **{nodies, pocket} = UN SEUL opérateur** (décision **106** + correction **C-2**) ; **maintenir 1RPC hors campagnes lourdes** (200 req/j), **Chainstack à clé comme repli**, **quorum-2 par opérateurs DISTINCTS partout** ; **brancher un compteur de concordance Pocket↔2ᵉ opérateur** (producteur en 1a, accrual 30 j en 1b).

---

## Faits mesurés [lu] (fichier:ligne RÉ-OUVERT ce tour)

1. **[lu] `apps/sentinel/src/rpc.ts:19-23`** — `PUBLIC_ENDPOINTS` = **8 hôtes** : publicnode (×2 alias), `eth.llamarpc.com`, `eth.drpc.org`, `rpc.mevblocker.io`, `eth-mainnet.public.blastapi.io`, `1rpc.io/eth`, `eth.rpc.blxrbdn.com`. `:28-36` `providerOf` = domaine enregistrable (2 derniers labels) ⇒ deux alias publicnode = **1** provider. `:60-63` `poolEndpoints` ajoute la Chainstack (env, 9ᵉ) ; `:68-71` `publishedEndpoints` = publics **verbatim** + Chainstack **rédigé** (origine, jamais la clé). **N-2 : les commentaires `:57` (« the 8 public ones … a ninth endpoint ») et `:65` (« the 8 public URLs UNCHANGED ») disent « 8 »/« ninth » — à mettre à jour « 7 »/« eighth » après L-1.** `quorumTwo` (ancre Narabi, NON touché) exige 2 providers distincts.
2. **[lu] `apps/sentinel/src/ukemi/rpc2.ts:250`** — `ETH_CALL_PROVIDERS` = `[drpc, mevblocker, blastapi, eth-pokt.nodies.app]` (4 URL). **`:251`** `GET_LOGS_PROVIDERS` = `[drpc, mevblocker, tenderly]` (3). `:12` importe `providerOf` de `rpc.ts` (Narabi LIVE, **non modifiable**). **`:164-188` `quorum2`** : **AUCUN round-robin** — `for (let i=0; i<list.length && got.length<2; i++)` part **toujours de i=0** et prend les **2 premiers providers distincts vivants** (ordre de la liste, `:169`) ; distinctness par `seen.add(providerOf(url))` (`:171,176,179`) ; **`:184`** garde NoQuorum (< 2) ; **`:185`** `throw QuorumDisagreementError` si `a.key !== b.key` (⇒ le hook de concordance doit tirer **entre `:184` et `:185`**) ; `:56` `isResultLimit` (regex de split), `:61` `isPlanLimited` (drpc free-plan ⇒ bench, pas split), `:43` `isRpcRevert` (code 3/-32000 **ET** /revert/).
3. **[lu] `docs/PLI-lot-u4a.md:70,81`** — charge eth_call U-4a **par opérateur**, mevblocker exclu (D-5) : CE-run `{drpc.org 7 083, blastapi.io 7 083, nodies.app 0}` (50/50 drpc/blast) ; course run 2 `{drpc.org 29 080, blastapi.io 29 467, nodies.app 183, archive-env 212}` ⇒ **Blast a porté 29 467/58 942 ≈ 50,0 % des eth_call**, nodies 0,3 % (repli seulement), Chainstack `archive-env` 0,4 %. Cause mesurée : `quorum2` sans round-robin + drpc benché tôt (free-plan) ⇒ la **paire effective devient {mevblocker/exclu → drpc, blastapi}** ; **retirer Blast déplace ce ~50 % de repli sur Pocket et Chainstack**. **[lu] `:82,87`** : `ukemi_sha` **CHANGE** à tout édit de `ukemi/**.ts` (`3b0cb14f…`→`798e1458…` à l'édit `abi.ts`) tandis que **`book_digest 695d862f…` reste INCHANGÉ** (rejeu offline) ⇒ **`ukemi_sha` n'est PAS l'invariant de byte-identité** (C-4).
4. **[lu] `apps/sentinel/src/ukemi/record.ts`** — `main()` **non exportée** (`:276`, module-privée), lancée par le run-guard `:415` `if (isMainModule(...)) main()`. `:211` `ukemiSha(dir)` = sha256 des sources (témoin de build, **hors digest**, `:210` commentaire) ; émis en `provenance.ukemi_sha` (`:356,385`). `:297-298` Chainstack `CHAINSTACK_ETH_URL` **appendu EN DERNIER** aux deux pools (quorum keyless d'abord, Chainstack tiré seulement au bench — RU minimisé) ; `:299-301` garde `distinct(...) < 2` (par `providerOf`). `:263` `--exclude-operator` (D-5), `:39-49` `operatorLabel`/`applyExcludeOperators` matchent **par `providerOf`/label seuls**. `:314-325` `--resume` ⇒ `reader = makeResumeReader(basePool, …)` : **un HIT `--resume` contourne `basePool`** (donc `quorum2`, donc le hook) — seuls les **MISS** produisent une observation de concordance (C-3).
5. **[lu] `apps/bell/src/ethereum.ts:16,76-77`** — **Bell (jambe Ethereum) IMPORTE `GET_LOGS_PROVIDERS` de `rpc2.ts`** (`:16`) et, dans `liveEthSwaps` (`:74-77`), le passe à `makeUkemiPool` **comme `ethCallProviders` ET `getLogsProviders`** (`opts.getLogsProviders ?? GET_LOGS_PROVIDERS` pour les deux), `minIntervalMs:200`, **sans jambe Chainstack ni garde de budget**. **[lu] `apps/bell/src/collect.ts:638`** — la vraie collecte appelle `liveEthSwaps(ethPool, ethFrom, ethTo)` (derrière `--eth`, `:634`) **sans passer d'opérateurs** ⇒ défaut = `GET_LOGS_PROVIDERS`. **⇒ L-3 (changer `GET_LOGS_PROVIDERS`) affecte la jambe Ethereum de Bell (swaps TSLAon/USDC), consommateur OUBLIÉ du G0 source** (C-1). `liveEthSwaps` a un `opts.getLogsProviders` injectable ⇒ testable par injection.
6. **[lu] `apps/sentinel/src/ukemi/rpc2.ts:250` + `F:\PRODUITS\…\conf-src-2\06-nodies.md:5` + `scripts/census/burns-by-burner.mjs:18-19`** — l'hôte `eth-pokt.nodies.app` de `ETH_CALL_PROVIDERS` est une **passerelle adossée à Pocket Network (POKT)** (suffixe « -pokt », doc « POKT Public RPC Endpoints » ; `burns-by-burner.mjs:18-19` « pokt … supply quorum broader »). ⇒ **{nodies, pocket} servent le MÊME réseau décentralisé** ; par `providerOf`, `nodies.app` ≠ `pocket.network` (2 domaines), mais **1 SEUL opérateur réel** (C-2 ; décision **106** « {nodies, pocket} = un opérateur »).
7. **[lu] `13-sonde-pool-rpc-1.json`** (ré-ouvert, 5 appels) — Blast `eth_blockNumber` **200** (`0x18d1564`, répond encore) ; **Pocket archive eth_call : n = 1 échantillon** (ligne 18, `eth_call getAssetPrice(WETH)@23545087` = `0x…65355d3dc0` = **434 687 000 000**, hex→déc vérifié ce tour ; **byte-identique** à `price_base_8dec` du book U-4a committé, fait 3/CA-4 — **1 recoupement au book, PAS un 2ᵉ tirage Pocket**) ; **Pocket `eth_getLogs@B0` (1 bloc) = `[]`** (ligne 27, **indistinguable d'un bloc vide ⇒ ne prouve PAS l'archive de logs**) ; Pocket-Solana `getSlot` OK. **N-4 / delta journal : `CHANTIERS.md:409` écrit « `eth_getLogs@B₀` OK » — SUR-AFFIRMÉ ; la mesure brute est `[]`@1-bloc, non probante ⇒ le plan (fait 7) a raison contre `:409`, l'archive getLogs Pocket reste À PROUVER par L-5.**
8. **[lu] `12-pocket-network-FAITS-navigateur.md:3-8`** — endpoints publics **sans clé** (framework PATH) ; ToS 2024-11-19 **sans clause « personal use »** ni interdiction d'automatisation ; limites : timeout 10 s, ≤ **100 000 lignes de logs**, « fair use » (dépassement = `-32097`/HTTP 429) ; « AS IS », retrait sans préavis ; **`providerOf` = un seul `pocket.network` toute chaîne** (fournisseurs décentralisés non identifiés ⇒ **jamais seul**).
9. **[lu] `CHANTIERS.md:320`** — oracle décision 69 = **`no_cash_cross_provider_name_in_export`** (surface CASH **Bell** `/bell/`, **test racine NON exporté**, item T-1b). **C-1 : la décision 69 vise les noms de fournisseurs de RECOUPEMENT CASH** (close/cross : Databento EQUS.SUMMARY, Massive/Polygon — `collect.ts:654,662-664` `closeSource`/`crossBySession`/`cashRequestDigest`), **PAS les opérateurs RPC de transport**. Pocket est un **opérateur RPC** ; **même si Bell (jambe Ethereum) le consomme** désormais (fait 5), l'export `/bell/` **ne nomme pas les opérateurs RPC** ⇒ **décision 69 NON déclenchée** — motif corrigé : « Pocket ∉ fournisseurs de recoupement CASH », **et non** « Pocket ≠ consommateur Bell » (faux). Rappel `CHANTIERS.md:407` : Solana = Helius+Chainstack à clé ⇒ **ne PAS ajouter Pocket-Solana** à `apps/bell/src/rpc.ts:19`.
10. **[lu] `apps/sentinel/test/ukemi-u4-scores.test.ts:20`** — `PINNED_DIGEST = "267cd9918abde0ee6de23f71c1dc0852d545e00824107c3dfb51f84bb943ea4b"` (calibDigest du réducteur de scores, rejeu offline). Avec `book_digest 695d862f…` et le PIN `sentinel2_book_identical_to_pull 034fbff9…` (`PLI-lot-u4a.md:87`), **voilà l'invariant réel de byte-identité** (C-4), non `ukemi_sha`.
11. **[lu] `.github/workflows/ci.yml:65,69,43`** — exclus R-25 : `docs/**/*.md`, `package-lock.json`, `fixtures/**`, `apps/sentinel/test/fixtures/**` ; **`docs/**/*.mjs` RESTE COMPTÉ**. Métrique `ins+del+0`, plafond `VIBEGATES_PR_LIMIT=1205`.
12. **[lu] décision 92 (`CHANTIERS.md:274`)** — E-5 (redéploiement sentinel sur VPS site) **ACCORDÉ**, après G7+checkpoint-2 de -1b-ii-b, **par SHA de fusion NOMMÉ** (RUNBOOK §6), `T_s=3×D`, vérif `systemctl show`.

---

## Inventaire EXHAUSTIF des hôtes/consommateurs RPC codés (grep, classé par BRANCHEMENT ; C-1 : Bell ajouté)

**A. SERVI / LIVE — À MODIFIER dans ce lot (compté R-25) :**
- `apps/sentinel/src/rpc.ts:19-23` — `PUBLIC_ENDPOINTS` (pool sentinel SERVI `/narabi/`). **⇒ L-1** (+ commentaires `:57,:65` « 8 »→« 7 », N-2).
- `apps/sentinel/src/ukemi/rpc2.ts:250-251` — `ETH_CALL_PROVIDERS` / `GET_LOGS_PROVIDERS` + **distinctness `quorum2` (opérateur, C-2)** + **hook `onQuorum` (L-4)**. **⇒ L-2 / L-3 / L-4.**
- `apps/sentinel/src/ukemi/record.ts` — **couture `runRecorder` (C-3)** + `--concordance-out` + garde `distinct()` par opérateur (C-2) + note politesse Pocket (C-6). **⇒ L-4.**

**A′. CONSOMMATEUR OUBLIÉ (C-1) — Bell jambe Ethereum, à DÉCLARER + tester par injection :**
- `apps/bell/src/ethereum.ts:16,76-77` importe `GET_LOGS_PROVIDERS` et le passe à `makeUkemiPool` comme `ethCallProviders` **ET** `getLogsProviders` ; appelé par `apps/bell/src/collect.ts:638` (`--eth`, swaps TSLAon/USDC). **⇒ L-3 change AUSSI le pool de Bell.** Tuyau : `rpc2.ts:GET_LOGS_PROVIDERS → ethereum.ts:liveEthSwaps → collect.ts:638 (--eth) → fills TSLAon Bell` ; **consommateur = T-1b-backend (GATÉ, décision 101)** ⇒ état « **câblé, consommateur GATÉ** ». La **garde de budget absente** ici est **déjà un item formé** (`CHANTIERS.md:424` « le branchement du garde de budget là où il manquait ») — **référencé, non absorbé** dans ce lot.

**B. RÉUTILISENT les constantes par IMPORT — héritent automatiquement (AUCUN changement d'hôte) :**
- `scripts/census/u3-realized.mjs:271,365` `CALL_EPS = [env, ...PUBLIC_ENDPOINTS]` puis `eth_getLogs` en quorum ⇒ **`1rpc.io` utilisé en getLogs de campagne LOURDE par héritage** — **FALSIFIE SYNTHESE §1** ; surfacé, non tu. **⇒ Q2 (gel + note de tête).**
- `scripts/census/u4-oracle-path.mjs:56-57`, `u4-probe.mjs:67`, `u4-redraw.mjs:83` — `[...ETH_CALL_PROVIDERS]`/`[...GET_LOGS_PROVIDERS]` + env ⇒ **le retrait Blast/Llama se propage** au prochain run, sans édition.

**C. HÔTES CODÉS EN DUR — historiques / one-shot (NE PAS réécrire ; inventaire + note) :**
- `scripts/usde-full-pull.mjs:31-33` — 9 hôtes dont **`1rpc.io/eth`+blast+llama+ankr en campagne LOURDE**. **⇒ Q2 : GEL + note de tête** (jamais rejoué tel quel).
- `scripts/census/burns-by-burner.mjs:84-86`, `aave-liquidations.mjs:92-94` — census datés, sorties sha-pinnées.
- `docs/biblio/ukemi-modeL/scripts-mesure/*.mjs` — **COMPTÉS R-25 (`docs/**/*.mjs`) ⇒ GEL STRICT**.
- **`apps/sentinel/test/fixtures/narabi-timeline-2026-09-19.jsonl`** (C-1) — fixture historique servie, portant les **8 anciens endpoints (blast/llama inclus)** : **JAMAIS réécrite** (union historique honnête : ces hôtes ont bien servi ces fenêtres ; revisionnisme proscrit) ; **exclue R-25** (`apps/sentinel/test/fixtures/**`, `ci.yml:65`). Inventoriée, gelée.

**D. Tests (compté R-25) — auto-contenus :**
- `sentinel.test.ts:481` (`Set(map(providerOf)).size >= 2`, tient à 7) ; `sentinel-retry.test.ts:215/219/266` (dérivent de `.length`) ; `ukemi-u4a.test.ts:193-196` et `ukemi.test.ts:50` (tableaux **synthétiques locaux**) ; `probe-narabi.test.ts:122-127` (`eightPublic` synthétique — **Q4 cosmétique**).
- **C-1 (oublis mineurs, ré-ouverts)** : `apps/sentinel/test/ukemi-record.test.ts:96` (`eth.mevblocker.io/…?k=secret`), `:149` (`eth.drpc.org/x?k=secret`), `:172` (`[eth.drpc.org, b.example, c.example]`) — **nomment drpc/mevblocker (CONSERVÉS) ⇒ AUCUNE édition due** ; inventoriés pour l'exhaustivité (le G0 source les avait omis). `:20-28` `withFetch` = le **stub fetch** dont la couture L-4 (C-3) se sert.

**E. Sonde externe :** `scripts/probe-narabi.mjs:66/79/83` LIT les `endpoints` de la ligne publiée, ne code aucun pool. **Inchangé.**

**F. Bell Solana — HORS SCOPE :** `apps/bell/src/rpc.ts:19` = défaut Solana ; quorum Bell-Solana = Helius+Chainstack à clé (`CHANTIERS.md:407`). **Ne pas y ajouter Pocket-Solana.** (Distinct de A′ : A′ = jambe **Ethereum** de Bell.)

---

## Découpe : POOL-RPC-1a (ce lot) + POOL-RPC-1b (compteur 30 j, DÉCLARÉ)

**POOL-RPC-1a** = révision de pool (`rpc.ts` + `rpc2.ts` + `record.ts` + tests + mutants) + **couture `runRecorder`** (C-3) + **collapse d'opérateur {nodies,pocket}** (C-2) + **producteur+réducteur de concordance** (L-4/R-L4 issue 1, si retenue) + **déclaration du consommateur Bell** (C-1). Rejoint le redéploiement **E-5** (piggyback, Q1).
**POOL-RPC-1b (DÉCLARÉ, item à déclencheur)** = **accrual quotidien 30 j** côté sentinel (décision 100 pas 2 = volumes + concordance). Scission justifiée par la **sensibilité de l'ancre `rpc.ts`** + la **temporalité** (l'accrual ne commence qu'après déploiement de Pocket), **pas par R-25**. Déclencheur : fusion+déploiement de 1a. **N-5 : 1b exigera un DEUXIÈME redéploiement sentinel** (au-delà d'E-5 ; la décision 92 ne couvre **qu'UN** redéploiement, Q1) ⇒ **1b = demande de go explicite pour un 2ᵉ redéploiement**, déclarée ici, jamais un dû nu.

---

## ADR de rattachement (C-5) : **ADR-POOL-RPC-1**

Nouvel ADR **ADR-POOL-RPC-1** (à créer en G0/G1 de 1a), **amendant `ADR-M012`** (pool sentinel `rpc.ts`) **et `ADR-U1 D3`** (quorum Ukemi `rpc2.ts`). Il porte :
- **les tuyaux** (table §Tuyaux : L-1 sentinel SERVI, L-2/L-3/L-4 Ukemi, **A′ consommateur Bell**) ;
- **les décisions 100** (Pocket 3 temps + sonde), **102** (Tenderly conservé + Pocket ajouté aux logs, gaté L-5), **106** (Blast+Llama retirés, {nodies,pocket}=1 opérateur) ;
- **la ligne d'opérateur C-2** : `operatorOf` dans `rpc2.ts` (jamais `rpc.ts`) mappant `nodies.app` **et** `pocket.network` → `pocket` ; distinctness `quorum2` par **opérateur**, pas domaine ;
- **la scission 1a/1b** et le **2ᵉ redéploiement 1b** (N-5).

---

## POOL-RPC-1a — Livrables

### L-1 — `PUBLIC_ENDPOINTS` (sentinel SERVI) : −LlamaRPC, −Blast, +Pocket (décision 106)
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/sentinel/src/rpc.ts:19-23` + **commentaires `:57,:65` « 8 »→« 7 », « ninth »→« eighth » (N-2)** |
| **Action** | retirer `https://eth.llamarpc.com` et `https://eth-mainnet.public.blastapi.io` ; ajouter `https://eth.api.pocket.network`. Pool = **7** (publicnode×2, drpc, mevblocker, 1rpc, blxrbdn, **pocket**). ≥ 2 providers distincts maintenu. |
| **Jamais seul** | `quorumTwo` (ancre Narabi, `:174-200`, NON touché) exige 2 providers distincts ; Pocket = 1 provider `pocket.network`. |
| **Précondition L-5 (C-7)** | **Pocket sert head eth_call/totalSupply** (sonde fait 7 : head OK). **Mais Pocket en membre getLogs recent (burns/mints) est GATÉ par L-5 fenêtre RÉCENTE** (comparer les logs Pocket d'une fenêtre `/narabi/` committée aux `burns`/`mints`/`supply_close` committés). `quorumTwo` étant **fail-closed** (un getLogs Pocket faux ⇒ désaccord ⇒ fenêtre échoue proprement, jamais de ligne publiée fausse), l'ajout est **sûr** ; L-5-récent confirme la **disponibilité** (Pocket ne benche/désaccorde pas à tort). **Comme 1a RIDE E-5 (Q1) et qu'E-5 s'exécute dès la fusion, L-5-récent est précondition de la FUSION de 1a** (pas seulement de L-3), calée sur « avant fusion de 1a » (§Points non pliés). |
| **Tuyau / État** | `PUBLIC_ENDPOINTS` → `poolEndpoints(env)` → `quorumTwo` → ligne SERVIE `/narabi/` (`narabi-live.tsx:300` `endpointsUnion`, union dynamique, aucune hypothèse `length===8`). **État = code + test ; WIRED à E-5** (preuve = 1ʳᵉ ligne JOURNAL post-déploiement listant `pocket`, sans llama/blast — critère C-8). **Jamais « BUILT » avant cette 1ʳᵉ ligne.** |

### L-2 — `ETH_CALL_PROVIDERS` (Ukemi) : −Blast, +Pocket — **4 URL, 3 OPÉRATEURS** (C-2)
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/sentinel/src/ukemi/rpc2.ts:250` |
| **Action + ORDRE EXACT (C-6)** | `ETH_CALL_PROVIDERS = ["https://eth.drpc.org", "https://rpc.mevblocker.io", "https://eth-pokt.nodies.app", "https://eth.api.pocket.network"]`. **4 URL mais 3 opérateurs DISTINCTS `{drpc, mevblocker, pocket}`** (nodies+pocket collapsés, C-2 — les deux URL Pocket = redondance de disponibilité, ordre entre elles immatériel). Chainstack `archive-env` appendu **en dernier** par `record.ts:297` (repli à clé). |
| **Archive** | sonde fait 7 : `eth_call@B0 = 434 687 000 000` = book U-4a ⇒ **archive eth_call Pocket : n = 1 échantillon mesuré** (+ 1 recoupement au book) — **PAS « qualifié »** ; delta assumé vs « n=2 » du validateur (la sonde brute ne porte qu'**1** eth_call archive Pocket ; le 2ᵉ « recoupement » est le book, pas un tirage Pocket). |
| **Charge projetée U-4b (~280 k, C-6)** | `quorum2` sans round-robin (`:169`) ⇒ paire par défaut = les 2 premiers distincts = **{drpc, mevblocker}**. **Deux cas projetés (ne PAS présumer que U-4b ré-exclut mevblocker)** : (a) **mevblocker gardé** ⇒ Pocket vu seulement en repli (drpc benché) — échantillon Pocket **faible** (calque nodies 183/58 942 en U-4a) ; (b) **mevblocker exclu (D-5 comme U-4a)** ⇒ opérateurs keyless = **{drpc, pocket} = 2 (minimum)** ; drpc benche tôt (free-plan) ⇒ **{pocket, archive-env=Chainstack}** porte le quorum (RU Chainstack) ; **`CHAINSTACK_ETH_URL` ABSENT ⇒ NoQuorum** (fail-closed, course stoppée). ⇒ **pour U-4b, la jambe `archive-env` Chainstack DOIT être fournie** (comme en U-4a, `archive-env:212`) ; lien avec le cap Chainstack (§Rulings). |
| **Politesse Pocket (C-6)** | 429/-32097 soutenu ⇒ `--exclude-operator pocket.network` (`record.ts:297-301,263`). **Attention (à déclarer, ne pas redessigner)** : `applyExcludeOperators` (`:46-49`) matche par **`providerOf`/`operatorLabel` seuls** ⇒ exclure l'**opérateur Pocket entier** exige `--exclude-operator nodies.app` **en plus**, OU d'étendre la couche `operatorOf` (C-2) à `applyExcludeOperators`. |
| **Tuyau / État** | `ETH_CALL_PROVIDERS` → `makeUkemiPool` → course **U-4b** (décision 91). **État = code + test ; WIRED au run recorder U-4b.** Jamais « BUILT » avant la 1ʳᵉ provenance U-4b listant `pocket` sans blast. |

### L-3 — `GET_LOGS_PROVIDERS` (Ukemi + Bell) : +Pocket, **Tenderly CONSERVÉ** (décision 102), ajout getLogs **GATÉ L-5**
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/sentinel/src/ukemi/rpc2.ts:251` (**et consommateur Bell `apps/bell/src/ethereum.ts:16,76-77`, C-1**) |
| **Décision 102 (branche A+)** | **conserver `tenderly`, AJOUTER `pocket`** ⇒ `GET_LOGS_PROVIDERS = [drpc, mevblocker, tenderly, pocket]` = **4 opérateurs distincts** (drpc, mevblocker, tenderly, pocket ; **pas de nodies ici** ⇒ pas de collapse). **Marge de quorum ACCRUE (3→4), plus « marge 0 »** : CA-7 « gatée » et **MAST « effondrement getLogs par retrait Tenderly » du G0 source = CADUCS**. Item TENDERLY-TOS **clos côté blocage** (note investisseur `CHANTIERS.md:418`, « risque nul ») ; rappel de relecture à LEGAL-ATLAS, sans effet sur le plan. |
| **Gate L-5 (C-7)** | l'**ajout de Pocket aux getLogs** (Ukemi ET Bell) est **GATÉ par L-5 fenêtre ANCIENNE** (le `[]`@1-bloc de la sonde ne prouve rien, fait 7). Tant que L-5-ancien n'est pas vert, `GET_LOGS_PROVIDERS` reste `[drpc, mevblocker, tenderly]` (3, sans pocket). |
| **ORDRE (C-6)** | `[drpc, mevblocker, tenderly, pocket]` : les 3 éprouvés d'abord (paire par défaut {drpc, mevblocker}), Pocket en 4ᵉ (repli) ⇒ échantillon Pocket getLogs **faible** en U-4b ; Chainstack `archive-env` appendu en dernier (`record.ts:298`). Bell (`liveEthSwaps`, `minIntervalMs:200`, pas de Chainstack) voit `[drpc, mevblocker, tenderly, pocket]` pour **eth_call ET getLogs** de TSLAon (fait 5). |
| **Tuyau / État** | Ukemi : `GET_LOGS_PROVIDERS → makeUkemiPool.getLogsRange → U-4b`. Bell : `→ ethereum.ts:liveEthSwaps → collect.ts:638 → fills TSLAon` (consommateur **T-1b-backend GATÉ**, décision 101). **État = code + test ; ajout getLogs Pocket = item à déclencheur (L-5 vert).** |

### L-4 — Compteur de concordance BRANCHÉ (couture nommée `runRecorder` ; hook `rpc2.ts:quorum2` ; réducteur non-LLM) — R-L4
| Champ | Contenu |
|---|---|
| **Fichiers** | `rpc2.ts` (`UkemiPoolOpts` + `onQuorum` dans `quorum2`), `record.ts` (`runRecorder`/`main`, `--concordance-out`, agrégat), **nouveau `apps/sentinel/src/ukemi/concordance.ts` (réducteur pur)** — **jamais** `rpc.ts:quorumTwo` (ancre Narabi). |
| **Couture nommée (C-3)** | extraire le corps de `main()` (`:276`) en **`export async function runRecorder(argv, deps)`** (deps = env/now/exit injectables) ; `main()` devient un **wrapper** `runRecorder(process.argv.slice(2), realDeps)` sous le run-guard `:415`. Le test pilote `runRecorder([...args, "--concordance-out", p], deps)` avec **fetch stubbé** (calque `ukemi-record.test.ts:20-28`). |
| **Hook (C-1/C-2/C-3)** | `quorum2` : **entre la garde NoQuorum (`:184`) et le throw de désaccord (`:185`)**, calculer `concordant = a.key === b.key` et appeler `opts.onQuorum?.(label, a.prov, b.prov, concordant)` ⇒ **désaccords ENREGISTRÉS avant le throw**. `a.prov`/`b.prov` (`:175,179`) passent de `providerOf(url)` à **`operatorOf(url)`** (C-2 : pocket/drpc/mevblocker/tenderly, **domaines/opérateurs seuls, jamais d'URL**, C-1). Le sink de `record.ts` re-labellise l'opérateur Chainstack → `archive-env` (`operatorLabel`, une ligne). |
| **Agrégat (N-3)** | `--concordance-out` présent ⇒ `record.ts` construit `Map<pair, {concordant, discordant}>` (clé = paire d'opérateurs triée) ; le hook **incrémente** ; en fin de run, **écrire UNE ligne jsonl compacte par paire** (`{pair, concordant, discordant, at}`) — **O(paires), pas ~140 k appends**. |
| **Réducteur non-LLM (R-L4 issue 1)** | `concordance.ts` exporte `reduceConcordance(jsonl) → [{pair, concordant, discordant, rate}]` (pur). **Test de chaîne** : `runRecorder(--concordance-out) → jsonl → reduceConcordance → assert` (Pocket accord ET désaccord, **aucune URL** dans le fichier). |
| **`--resume` (C-3)** | un **HIT `--resume` contourne `basePool`** (`:324`) ⇒ le hook n'observe **que les MISS** ; sur un U-4b repris de cache, l'échantillon de concordance = les MISS de ce run (à déclarer, jamais surinterprété). |
| **No-op par défaut (CA-8/C-4)** | `--concordance-out` absent ⇒ `onQuorum` absent ⇒ **NO-OP** ⇒ **`book`/`book_digest`/`holders_digest` byte-identiques** (`PINNED_DIGEST 267cd991…` + PIN book `034fbff9…` VERTS) ; **`ukemi_sha` CHANGE (sources touchées) — BÉNIN et ATTENDU** (fait 3, calque `798e1458…`), **jamais** l'invariant. |
| **État (R-L4, « BUILT » RETIRÉ)** | **le compteur est un instrument câblé CLI à sortie terminale** ⇒ **« BUILT / CA-11 satisfait » RETIRÉ.** **Issue retenue = 1 (reco du rédacteur)** : réducteur non-LLM en 1a + test de chaîne ⇒ **état = « BUILT si l'orchestrateur retient l'issue 1 » ; sinon = « câblé CLI, consommateur UPCOMING » + item formé** (déclencheur : fin U-4b **ou** J+30, décision 100 pas 2). **L'orchestrateur tranche** (Q3 lie α/β à C-3+R-L4). Consommateur ultime (proposition écrite post-LEGAL-ATLAS, décision 100 pas 3) = **futur**, item formé. |

### L-5 — Sonde getLogs archive (PRÉCONDITION de L-1 **ET** L-3/Bell ; ORCHESTRATEUR, réseau, R-20) — C-7
| Champ | Contenu |
|---|---|
| **Nature / garde (C-7)** | **acte orchestrateur** (réseau interdit au worker) ; **séquentielle, AUCUN retry**, **plafond dur = 8 appels** (calque sonde 03:41), **arrêt sur 429/-32097** ; **JAMAIS via `getLogsRange`** (qui splitte) — fetch brut unique ; **au plus UNE requête surdimensionnée** ; **URL Chainstack JAMAIS imprimée** (rédaction origine). |
| **DEUX fenêtres (C-7)** | **(récente) précondition de L-1** : logs Pocket d'une fenêtre `/narabi/` **committée** comparés aux `burns`/`mints`/`supply_close` **committés** (byte via `logsKey`). **(ancienne, domaine Ukemi) précondition de L-3/Bell** : `address=USDE_TOKEN`, `topics=[TRANSFER_TOPIC]`, fenêtre committée (`narabi-snapshot.ts:23`), byte-comparée à drpc **ou** Chainstack. |
| **Cap 100 k / `header not found` (C-7)** | UNE requête surdimensionnée pour capturer la **chaîne d'erreur** Pocket au dépassement 100 000 lignes / timeout 10 s et **vérifier qu'elle matche `isResultLimit` (`rpc2.ts:56`)** — sinon `getLogsVia` ne splitte pas et benche à tort (⇒ ajouter la phrase Pocket à la regex). **`header not found`** (bloc absent de l'archive Pocket) : matche **NI `isResultLimit` (`:56`) NI `isRpcRevert` (`:43`, exige /revert/)** ⇒ tombe au **`else` `:180`** ⇒ **cooldown/bench, PAS de split** — **c'est l'issue CORRECTE** pour une réponse non-archive (Pocket sans l'archive de logs à cette profondeur ⇒ hors `GET_LOGS_PROVIDERS`). |
| **Verdict** | **récente verte** ⇒ Pocket getLogs de fenêtre récente admis (L-1 disponible) ; **ancienne verte** ⇒ Pocket admis à `GET_LOGS_PROVIDERS` (L-3, Ukemi+Bell) ; **rouge** ⇒ Pocket **eth_call seulement** (L-2), Tenderly/Chainstack portent les getLogs (branche A). |
| **Tuyau** | entrée : fenêtres committées ; sortie : GO/NO-GO getLogs Pocket (récent → L-1, ancien → L-3/Bell) ; **jamais un dû nu** (spécifiée, déclencheur = acte orchestrateur avant fusion de 1a). |

### L-6 — 1RPC hors campagnes lourdes + garde
| Champ | Contenu |
|---|---|
| **Action** | 1rpc **reste** dans `PUBLIC_ENDPOINTS` (sentinel bas volume) ; **assertion** qu'il est **ABSENT** de `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` (déjà le cas). Exception MESURÉE à déclarer (CA-5) : `u3-realized.mjs:365` + `usde-full-pull.mjs` le portent en getLogs LOURD par héritage ⇒ **Q2 (gel + note de tête)**. |

### L-7 — Chainstack repli inchangé + quorum-2 distinct PARTOUT
| Champ | Contenu |
|---|---|
| **Action** | **aucun changement** de la voie Chainstack (env `CHAINSTACK_ETH_URL`, ADR-NARABI-OPS-1 D3 ; jambe `archive-env`). Test : pool à 7 garde ≥ 2 distincts (`sentinel.test.ts:481`) ; Chainstack = opérateur distinct (`chainstack.com`/`p2pify.com`). **Lien C-6/Rulings** : en U-4b, Chainstack devient **porteur** du quorum eth_call si mevblocker exclu (§L-2 cas b) ⇒ cap « un rôle à la fois » (Ruling). |

---

## C-2 — Collapse d'opérateur {nodies, pocket} (spéc, `rpc2.ts` SEUL)
- **Ajouter `operatorOf(url)` dans `rpc2.ts`** (jamais `rpc.ts`) : `const d = providerOf(url); return (d === "nodies.app" || d === "pocket.network") ? "pocket" : d;`.
- **`quorum2`** : remplacer `providerOf(url)` par `operatorOf(url)` aux sites de distinctness/labels (`seen` `:171,176,179` ; `a.prov`/`b.prov` `:175,179`) ⇒ **{nodies, pocket.network} = 1 opérateur `pocket`**, ne forment **jamais** un quorum à eux seuls. Idem `finalized()` (`:232-236`) et la garde `record.ts:299 distinct()`.
- **Sûreté des PINs** : U-4a n'avait pas `pocket.network` au pool ⇒ aucune paire {nodies,pocket} n'a pu se former ⇒ `book_digest`/`PINNED_DIGEST` **inchangés** ; les tests existants (`*.example` synthétiques) ne trippent pas `operatorOf`.

---

## Critères d'acceptation (testables HORS RÉSEAU, stubs offline)
- **CA-1** : `PUBLIC_ENDPOINTS` **exclut** `eth.llamarpc.com` et `eth-mainnet.public.blastapi.io`, **inclut** `https://eth.api.pocket.network` ; `Set(map(providerOf)).size >= 2` ; commentaires `:57,:65` ne disent plus « 8 » (N-2).
- **CA-2** : `providerOf("https://eth.api.pocket.network") === "pocket.network"` **et** `operatorOf(...) === "pocket"` **=== `operatorOf("https://eth-pokt.nodies.app")`** (C-2).
- **CA-3 (jamais seul)** : `["…pocket.network"]` seul ⇒ `quorumTwo`/`quorum2` fail-closed ; **`["…eth-pokt.nodies.app","…eth.api.pocket.network"]` (la paire {nodies,pocket}) ⇒ NoQuorum** (C-2, 1 opérateur) ; `[pocket, drpc-stub]` ⇒ succès.
- **CA-4** : `ETH_CALL_PROVIDERS` exclut `blastapi`, inclut `pocket` ; **4 URL, 3 opérateurs distincts** `{drpc, mevblocker, pocket}` (C-2) ; un **stub Pocket** byte-égal au book U-4a reproduit `ethCall(getAssetPrice WETH @23545087) = 0x…65355d3dc0 = 434 687 000 000` en quorum-2 (offline). *(NB : lecture eth_call book **Ukemi**, distincte du `totalSupply` USDe du sentinel.)*
- **CA-5** : `1rpc.io` **présent** dans `PUBLIC_ENDPOINTS`, **absent** de `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` ; **exception MESURÉE déclarée** (`u3-realized.mjs:365` getLogs lourd par héritage ⇒ Q2).
- **CA-6** : `publishedEndpoints` publie les publics **verbatim** + Chainstack **rédigé** (`sentinel-retry.test.ts:215` tient) ; `sentinel_never_prints_endpoint_url` + `no_secret_in_repo` verts.
- **CA-7 (L-3, décision 102, ajout getLogs Pocket)** : `GET_LOGS_PROVIDERS` inclut `tenderly` **ET** `pocket` (4 distincts) — **l'ajout de Pocket** conditionné à **L-5-ancien vert** (précondition réseau). *(La formulation « exclut tenderly » du G0 source est CADUQUE.)*
- **CA-8 (L-4, invariant réel C-4)** : hook absent ⇒ **`book`/`book_digest`/`holders_digest` byte-identiques** ⇒ `PINNED_DIGEST 267cd991…` + PIN book `034fbff9…` **VERTS** ; **`ukemi_sha` change (attendu, bénin)** ; sink injecté ⇒ reçoit `(label, operatorOf(a), operatorOf(b), concordant)` **opérateurs seuls (jamais d'URL)**.
- **CA-9 (C-1 Bell)** : `liveEthSwaps` **résout** `GET_LOGS_PROVIDERS` par défaut (test de résolution) et **honore `opts.getLogsProviders`** injecté (stub) ⇒ un pool injecté à 2 opérateurs distincts sert les fills TSLAon ; la paire {nodies,pocket} injectée ⇒ NoQuorum (hérite C-2).

## Mutants prévus (`cp` byte-exact depuis pristine, jamais `git checkout`)
- **M-1** Blast non retiré de `PUBLIC_ENDPOINTS` ⇒ CA-1 **ROUGE** ; **M-2** Llama non retiré ⇒ **ROUGE**.
- **M-3** `providerOf(pocket) ≠ "pocket.network"` ⇒ CA-2 **ROUGE** ; **M-4** quorum accepte Pocket **seul** ⇒ CA-3 **ROUGE**.
- **M-4b (C-2)** `operatorOf` retiré (distinctness par `providerOf`) ⇒ la paire {nodies,pocket} **forme** un quorum ⇒ CA-3 **ROUGE**.
- **M-5** Blast non retiré de `ETH_CALL_PROVIDERS` ⇒ CA-4 **ROUGE** ; **M-6** 1rpc ajouté à un pool lourd ⇒ CA-5 **ROUGE**.
- **M-7** hook `onQuorum` **non no-op par défaut** (change les octets) ⇒ CA-8 **ROUGE** ; **M-7b** hook enregistre l'**URL** au lieu de l'opérateur ⇒ CA-8 **ROUGE** ; **M-7c (C-3, câblage)** `--concordance-out` **parsé mais le sink NON passé** à `makeUkemiPool` (`onQuorum` undefined) ⇒ jsonl vide ⇒ **test de chaîne ROUGE**.
- **M-8** pool < 2 providers distincts ⇒ `sentinel.test.ts:481` **ROUGE** ; **M-9 (C-4)** CA-8 réancré à `ukemi_sha` (au lieu de `book_digest`) ⇒ **faux ROUGE** au 1ᵉʳ édit ⇒ mutant qui prouve que l'oracle doit viser `book_digest`.

## Tuyaux (règle Branchement — ADR-POOL-RPC-1)
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test non-LLM |
|---|---|---|---|---|
| pool → sentinel SERVI | `rpc.ts:PUBLIC_ENDPOINTS` | `/narabi/` endpoints (`narabi-live.tsx:300`) | **code+test ; wired à E-5** (getLogs Pocket gaté L-5-récent, **précondition de la fusion 1a**) | `sentinel_*` (≥ 2 distinct, publie rédigé) |
| pool → Ukemi eth_call | `rpc2.ts:ETH_CALL_PROVIDERS` | course **U-4b** | **code+test ; wired au run recorder** | CA-4 (stub book U-4a) |
| pool → Ukemi getLogs | `rpc2.ts:GET_LOGS_PROVIDERS` | course **U-4b** | **code+test ; ajout Pocket gaté L-5-ancien** | CA-7 (gatée) |
| **pool → Bell Ethereum (C-1)** | `rpc2.ts:GET_LOGS_PROVIDERS` | `ethereum.ts:liveEthSwaps → collect.ts:638 → fills TSLAon` | **câblé ; consommateur GATÉ (T-1b-backend, déc.101)** | CA-9 (injection `opts.getLogsProviders`) |
| Pocket archive eth_call | sonde `13-sonde…json` | == book U-4a committé | **mesuré n=1 + 1 recoupement book** | — (fait committé) |
| Pocket getLogs (récent/ancien) | **sonde L-5** (orchestrateur) | membership `PUBLIC_ENDPOINTS`/`GET_LOGS_PROVIDERS` | **item à déclencheur (L-5)** | CA-1/CA-7 (gatées) |
| concordance producteur+réducteur | `quorum2:onQuorum → record.ts --concordance-out → jsonl agrégé → concordance.ts` | J+30 (déc.100 pas 2) puis proposition post-LEGAL-ATLAS | **BUILT si issue 1 retenue ; sinon câblé CLI, consommateur UPCOMING + item formé** (R-L4) | test de chaîne `args→runRecorder→jsonl→reduceConcordance` |
| concordance accrual 30 j | sentinel quotidien (ancre `rpc.ts`) | lecture orchestrateur J+30 | **UPCOMING (POOL-RPC-1b ; 2ᵉ redéploiement N-5)** | (spéc en 1b) |

## Projection R-25 (métrique `ins+del+0`, `ci.yml:69` ; plafond 1 205, `:43`) — N-1 : UNE projection, SUPERSÈDE `:143` et `:195` du G0 source
**Comptés** : `rpc.ts` (L-1+N-2) ~8-14 ; `rpc2.ts` (L-2/L-3 + `operatorOf` C-2 + hook `onQuorum`) ~22-38 ; `record.ts` (couture `runRecorder` C-3 + `--concordance-out` + agrégat + `distinct` opérateur) ~40-80 ; **`concordance.ts` (réducteur)** ~20-40 ; `*.test.ts` (CA-1..9 + companions mutants M-1..M-9 + injection Bell CA-9 + paire {nodies,pocket} + M-7c + chaîne L-4) ~150-280. **Brut ≈ 240-450 ; ×2 conservateur ≈ 480-900 ≪ 1 205 ⇒ AUCUNE scission R-25.** Si le réalisé dépassait ~1 000, la **fissure naturelle = le réducteur+test-de-chaîne L-4** (séparable ⇒ β/1b). La scission 1a/1b reste motivée par l'**ancre `rpc.ts` + la temporalité**, non par R-25. **Le §Résumé ligne 13 du G0 source (« ~110-200 ⇒ 220-400 ») est REMPLACÉ par cette projection.**

## Risques (MAST) — CADUCS retirés, remplacés par des conséquences MESURÉES
- **MAST 1 (RETIRÉ : « effondrement getLogs par retrait Tenderly »)** — caduc (décision 102 : Tenderly conservé, 4 opérateurs). **Remplacé (C-6) par la conséquence eth_call MESURÉE** : `ETH_CALL_PROVIDERS` = **3 opérateurs keyless** ({drpc, mevblocker, pocket}, C-2) ; drpc benche tôt (free-plan) ; **mevblocker exclu (D-5) ⇒ {drpc, pocket} = 2 min ⇒ Chainstack `archive-env` devient porteur (RU) ; env absent ⇒ NoQuorum**. Mitigation : jambe Chainstack fournie en U-4b + cap « un rôle à la fois » (Rulings).
- **Faux GO archive Pocket** (`[]`@1-bloc, fait 7 ; `CHANTIERS.md:409` sur-affirmé, N-4) ⇒ L-5 exige fenêtre committée byte-comparée + chaîne d'erreur au cap 100 k matchant `isResultLimit` ; `header not found` benche sans split (issue correcte).
- **Corrélation cachée de quorum {nodies, pocket}** (C-2) ⇒ `operatorOf` collapse ; mutant M-4b ; jamais un quorum {nodies,pocket} seul.
- **Fuite de clé** (C-1) ⇒ `publishedEndpoints` rédige Chainstack ; hook = **opérateurs seuls** (M-7b) ; URL Chainstack jamais imprimée (L-5).
- **Régurgitation d'un tier dégradé** (429 1RPC) ⇒ 1rpc hors pools lourds (L-6) ; politesse Pocket (C-6).
- **Modification d'ancre LIVE** ⇒ `rpc.ts` `providerOf`/`quorumTwo` **non touchés** ; `operatorOf` + concordance en `rpc2.ts` seul.
- **Surface `/bell/` nommant un recoupement CASH (déc. 69)** ⇒ Pocket = **opérateur RPC**, ∉ fournisseurs de recoupement CASH ; **Bell jambe Ethereum le consomme (fait 5)** mais l'export ne nomme pas les opérateurs RPC ; vocab-gate non trippé.
- **CADUC : CA-7 « gatée par retrait Tenderly »** — remplacé par CA-7 « ajout Pocket gaté L-5 » (décision 102).

## Effet sur le SENTINEL DÉPLOYÉ (E-5, décision 92) + Q1 (piggyback)
L-1 (`PUBLIC_ENDPOINTS`) n'a d'effet servi qu'après **redéploiement** E-5 (déjà accordé, décision 92, par SHA de fusion nommé, RUNBOOK §6). **L-2/L-3/L-4 (Ukemi) NE redéploient PAS** — preuve négative [lu] : `deploy/` ne contient QUE `monark-{harness,sentinel,probe}.{service,timer}` + Caddyfiles, **aucune unité recorder** ; le recorder (`record.ts:main`) est **run à la demande** ; la surface `/ukemi/` sert des **fichiers book STATIQUES** via Caddy ⇒ changer `rpc2.ts` n'affecte que le prochain run (U-4b). **RULING Q1 (piggyback)** : **POOL-RPC-1a fusionne (avec son propre G7) AVANT le SHA de redéploiement E-5** ; le SHA E-5 **DOIT descendre** de la fusion 1a — preuve écrite au journal E-5 : **`git merge-base --is-ancestor <sha-fusion-1a> <sha-E-5>` == 0**. **Si 1a arrive après E-5 ⇒ ESCALADE** (2ᵉ redéploiement, **non couvert** par la décision 92 qui ne couvre qu'UN redéploiement). **N-5 : POOL-RPC-1b exigera lui aussi un 2ᵉ redéploiement sentinel = demande de go explicite.**

---

## Rulings (les Questions du G0 source sont TRANCHÉES)

**Questions au checkpoint-1 (validateur) → RULINGS :**
- **Q1 (ordre vs E-5)** → **piggyback** : 1a fusionne avant le SHA E-5, `git merge-base --is-ancestor` au journal (ci-dessus). Sinon escalade.
- **Q2 (scripts lourds 1rpc)** → **GEL + note de tête** : `usde-full-pull.mjs` et `u3-realized.mjs:365` (1rpc en getLogs lourd par héritage) **gelés, non réécrits** (revisionnisme + coût R-25 nul) ; la **note de tête** documente l'anomalie 1rpc-en-lourd et l'interdiction de rejeu tel quel = l'artefact. Résout honnêtement la contradiction SYNTHESE §1.
- **Q3 (fold hook en 1a)** → **α conditionnel** : le hook+réducteur foldent en 1a **SSI C-3 (couture `runRecorder` + M-7c) ET R-L4 (issue 1) sont satisfaits en 1a** ; sinon le producteur défère en **1b (β)**. Reco rédacteur : **α** (issue 1 retenue), l'orchestrateur confirme.
- **Q4 (MAJ cosmétique fixtures)** → **NON RULÉ par le validateur (transmis)** : reco rédacteur = **mettre à jour en 1a** `probe-narabi.test.ts:122` (`eightPublic`) et `ukemi-u4a.test.ts:193` **seulement** si elles nomment un opérateur RETIRÉ comme « public » (évite une référence trompeuse) ; sinon laissées (synthétiques). **Non bloquant ; flaggé en §Points non pliés** pour confirmation orchestrateur.

**Questions INVESTISSEUR → DÉCISIONS :**
- **Tenderly (ex-Q1)** → **décision 102 (A+)** : Tenderly **conservé** + Pocket **ajouté** aux getLogs (gaté L-5) ; note investisseur « risque nul » (`CHANTIERS.md:418`) ⇒ TENDERLY-TOS clos côté blocage.
- **Timing 30 j vs U-4b (ex-Q2)** → **RULING orchestrateur** : **U-4b n'attend PAS les 30 jours** (Pocket **jamais seul** ⇒ tout désaccord fail-close, sûr) ; la concordance du vrai volume est capturée par le hook L-4 pendant U-4b, l'accrual sentinel 30 j (1b) tourne en parallèle et informe la proposition post-LEGAL-ATLAS.
- **Cap Chainstack (ex-Q3)** → **RULING orchestrateur** : **cap = UN rôle keyless remplacé par Chainstack à la fois** (préserver la diversité de quorum ; mesurer avant de généraliser) — d'autant plus liant que L-2 cas (b) fait de Chainstack le **porteur** eth_call si mevblocker exclu.
- **E-1 (retrait Blast/Llama)** → **LEVÉE par la décision investisseur 106** (`CHANTIERS.md:436-437`, verbatim « retires les ») : Blast API **et** LlamaRPC retirés ; **L-1/L-2 exécutables** (plus « EN ATTENTE »).

---

## Rendus de mission
**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, effort max, non banni).
**sha256** : recomputé par l'orchestrateur (`sha256sum`) ; non embarqué (point fixe). Le worker ne committe pas (R-20).

**Résumé (15 lignes)**
1. Lot scindé : **1a** (révision pool + couture `runRecorder` + collapse {nodies,pocket} + concordance) rejoint **E-5** (piggyback Q1) ; **1b DÉCLARÉ** (accrual 30 j, ancre `rpc.ts`, **2ᵉ redéploiement N-5**).
2. **L-1** `PUBLIC_ENDPOINTS` : −Llama, −Blast (décision 106), +Pocket ⇒ 7 ; commentaires « 8 »→« 7 » (N-2) ; getLogs Pocket récent **gaté L-5**.
3. **L-2** `ETH_CALL_PROVIDERS` : −Blast, +Pocket ; **4 URL, 3 OPÉRATEURS** (C-2) ; ordre `[drpc, mevblocker, nodies, pocket]` ; archive eth_call **n=1 mesuré** (delta vs « n=2 » assumé) ; charge U-4b projetée (2 cas mevblocker in/exclu).
4. **L-3** `GET_LOGS_PROVIDERS` : **Tenderly CONSERVÉ + Pocket ajouté** (décision 102, 4 opérateurs) ; ajout getLogs **gaté L-5** ; **consommé aussi par Bell (C-1)**.
5. **L-4** concordance : couture **`runRecorder`** (C-3), hook **entre `:184` et `:185`** (désaccords enregistrés), **opérateurs seuls** (C-1/C-2), **agrégat par paire** (N-3), **réducteur non-LLM + test de chaîne** (R-L4 issue 1) ; **« BUILT » RETIRÉ** (conditionnel) ; no-op ⇒ `book_digest` byte-identique, **pas `ukemi_sha`** (C-4).
6. **L-5** sonde LARGE = **précondition de L-1 (récente) ET L-3/Bell (ancienne)** (C-7) : plafond 8, séquentielle, sans retry, jamais `getLogsRange` ; cap 100 k matché à `isResultLimit` ; `header not found` benche sans split.
7. **L-6/L-7** 1rpc hors pools lourds ; Chainstack repli inchangé (porteur eth_call si mevblocker exclu, §L-2).
8. **C-1** consommateur **Bell jambe Ethereum** déclaré (`ethereum.ts:16,76-77 → collect.ts:638`), test par injection (CA-9) ; garde de budget = item formé existant (`CHANTIERS.md:424`), référencé.
9. **C-2** `operatorOf` dans `rpc2.ts` (jamais `rpc.ts`) : {nodies, pocket}=1 opérateur ; mutant M-4b (paire seule ⇒ NoQuorum).
10. **C-4** invariant réel = `book`/`book_digest`/`holders_digest` + `PINNED_DIGEST 267cd991…`, **pas `ukemi_sha`** (change bénin).
11. **C-5** ADR-POOL-RPC-1 (amende ADR-M012 + ADR-U1 D3) portant tuyaux, décisions 100/102/106, ligne opérateur C-2, scission 1a/1b.
12. **Faits 8/9** corrigés (C-1) : décision 69 non déclenchée car Pocket ∉ recoupement CASH (Bell Ethereum le consomme pourtant) ; `CHANTIERS.md:409` sur-affirme l'archive getLogs (N-4).
13. **R-25** UNE projection ~240-450 brut ⇒ ×2 ≈ 480-900 ≪ 1 205 (SUPERSÈDE `:143`/`:195`) ⇒ aucune scission R-25.
14. **Rulings** : Q1 piggyback (merge-base), Q2 gel+note, Q3 α conditionnel, Q4 cosmétique (non rulé → flaggé) ; décisions : U-4b maintenant, cap Chainstack 1 rôle, **E-1 levée (déc. 106)**.
15. **Mutants** M-1..M-9 (+ M-4b, M-7c) rouges byte-exact ; PINs `book`/scores verts (hook no-op).

**Points NON PLIÉS (avec raison, jamais un dû nu)** :
- **L-5 (sonde getLogs large)** : acte réseau **orchestrateur** (R-20), spécifiée intégralement (2 fenêtres, plafond 8, cap 100 k, `header not found`) ; déclencheur = acte orchestrateur avant fusion 1a.
- **POOL-RPC-1b (accrual 30 j)** : sous-lot **déclaré** (ancre `rpc.ts` + temporalité) ; **2ᵉ redéploiement (N-5) = demande de go explicite** ; tuyau spécifié.
- **Q4 (cosmétique fixtures)** : **le validateur n'a pas rulé Q4 dans l'avis transmis** ⇒ reco rédacteur écrite (MAJ en 1a si trompeuse), **à confirmer par l'orchestrateur** — signalé, non contourné.
- **Issue R-L4 (1 réducteur vs 2 UPCOMING)** : rédacteur **recommande l'issue 1** ; **l'orchestrateur tranche** (Q3 lie α/β) — écrit comme conditionnel, jamais « BUILT » nu.
- **Chiffre RPS public Pocket/Nodies** : **[2nd] non confirmé** (« 15-25 RPS », `06-nodies.md:44` ; « fair use » sans chiffre Pocket, fait 8) ⇒ **procurement déjà formé** (`06-nodies.md:43-47`) ; usage = dimensionner le repli en campagne lourde ; **non deviné**.
- **`usde-full-pull.mjs` / census C** : **gel** (Q2), inventoriés, non réécrits.

## Rulings de l'orchestrateur après le pli (2026-09-21)
- **R-L4** : issue **1** retenue — le réducteur non-LLM (agrégat par paire d'opérateurs → compteurs) est livré en 1a avec le test de chaîne args réels → `runRecorder` → jsonl → réducteur → compteurs ; l'état du tuyau est « câblé + consommé par le réducteur » ; il n'entre dans AUCUN registre public (pas de surface) — donc ni « built » ni « upcoming » n'a à y figurer. Q3 = α.
- **Q4** : mettre à jour les mentions cosmétiques « 8 » (`rpc.ts:57,65`) en 1a ; laisser l'unité systemd et `RUNBOOK:92` à Narabi -1b-ii-b.
- **L-5** : exécutée par l'orchestrateur avant la fusion de 1a (résultat consigné dans CHANTIERS).
