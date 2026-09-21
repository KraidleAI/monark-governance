# G0 — Sprint backlog lot POOL-RPC-1 (révision du pool RPC Ethereum ; PLAN, AUCUN code)

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, Opus 4.8 1M, non banni, effort max ; source = identité d'exécution de la session). **R-20** : ce worker ne committe pas, ne déclenche aucun workflow ; seul l'orchestrateur committe. **R-21** : chaque `fichier:ligne` cité a été OUVERT ce tour (liste au §Faits). **AUCUN appel réseau ce tour** (ni RPC ni API) ; aucune clé/URL à secret ; aucune valeur de marché du jour. Dépôt `F:\Monark` (branche `lot/etude-suite`, HEAD `e4cf0a6`) en **LECTURE SEULE** ; plan écrit en scratch `F:\tmp\pool-rpc-1\G0-lot-pool-rpc-1.md`.

**Provenance des entrées** (sha256 **[lu] recomputés ce tour**, `sha256sum` local sans réseau). CONF-SRC-2 (`…\SYNTHESE.md`, chercheur `claude-sonnet-5`, **`45c57d69e1b30a497b7f6786ca1bf9818e2f7269c91adfa153c2a79d69085abc`** — concorde avec le `45c57d69…` de `CHANTIERS.md:404`, désormais [lu] 1ʳᵉ main), FAITS Pocket lus sur place par l'orchestrateur (`12-pocket-network-FAITS-navigateur.md`, **`e2e8964717a2e9d6422d133c67cebb65c7a3c83696e9d3bf3e1c6dc73c3744aa`**, navigateur interne 2026-09-21T03:35Z), sonde sous garde (`13-sonde-pool-rpc-1.json`, **`2d6df6385f1ad95baf6c1fbd18275c75a736f0f263ff5d608410871b37c00fcc`**, 5 appels, plafond dur 8, aucun retry, 03:41Z), décisions investisseur **89** (publicnode conservé, `CHANTIERS.md:405`), **91** (U-4b re-mesure Chainstack ~280 k appels, `:273`), **92** (E-5 redéploiement sentinel accordé, `:274`), **100** (Pocket en trois temps + sonde, `:409`).

---

## Objet (une phrase)
Réviser les pools RPC Ethereum SERVIS/mesurés selon les conditions d'usage lues — **retirer Blast API** (service annoncé arrêté 2025-10-31 ; endpoint vivant ⇒ retrait par conditions, **sans urgence de panne**) et **LlamaRPC** (aucune ToS localisable) ; **instruire Tenderly** (clause « personal use » ⇒ **question investisseur**) ; **ajouter `https://eth.api.pocket.network`** comme MEMBRE de quorum (jamais seul, `providerOf`→`pocket.network`, archive eth_call vérifiée) ; **maintenir 1RPC hors campagnes lourdes** (200 req/j), **Chainstack à clé comme repli**, et **quorum-2 par opérateurs DISTINCTS partout** — plus un **compteur de concordance Pocket vs 2ᵉ opérateur** (producteur sûr en 1a, accrual 30 j déclaré en 1b).

---

## Faits mesurés [lu] (fichier:ligne OUVERT ce tour)

1. **[lu] `apps/sentinel/src/rpc.ts:19-23`** — `PUBLIC_ENDPOINTS` = **8 hôtes** : publicnode (×2 alias), `eth.llamarpc.com`, `eth.drpc.org`, `rpc.mevblocker.io`, `eth-mainnet.public.blastapi.io`, `1rpc.io/eth`, `eth.rpc.blxrbdn.com`. `:28-36` `providerOf` = domaine enregistrable (2 derniers labels) ⇒ deux alias publicnode = **1** provider. `:60-63` `poolEndpoints` ajoute la 9ᵉ URL Chainstack (env) ; `:68-71` `publishedEndpoints` = 8 publics **verbatim** + Chainstack **rédigé à l'origine** (host, jamais la clé) ; `:174-200` `quorumTwo` exige **2 providers distincts** (saute un alias d'un provider déjà compté, `:185`).
2. **[lu] `apps/sentinel/src/ukemi/rpc2.ts:250`** — `ETH_CALL_PROVIDERS` = {`drpc`, `mevblocker`, `blastapi`, `nodies`} (4) ; **`:251`** `GET_LOGS_PROVIDERS` = {`drpc`, `mevblocker`, `tenderly`} (3). `:12` importe `providerOf` de `rpc.ts` (Narabi LIVE, ancre épinglée, **non modifié**). `:56` `isResultLimit` (split de plage), `:61` `isPlanLimited` (drpc free-plan ⇒ **bench**, pas split). `:164-188` `quorum2` calcule déjà `a.prov`/`b.prov` (domaines) — **point d'ancrage du compteur de concordance**.
3. **[lu] `docs/PLI-lot-u4a.md:52`** — énumération getLogs U-4a **par opérateur** : `mevblocker.io:708, tenderly.co:706, drpc.org:56, archive-env:0` ⇒ **Tenderly porte ~48 %** des getLogs (à égalité avec mevblocker) ; drpc benché tôt sur son cap free-plan. **[lu] `docs/G2-DELTA-lot-u4a.md:147`** : mevblocker exclu ⇒ « eth_call reste 3 distincts, **getLogs 2 + [archive-env]** » ; **`:238`** mevblocker exclu = **dégradation MESURÉE 34 % à 200 ms (D-5)**, codée en dur `u4-oracle-path.mjs:56-57`.
4. **[lu] `13-sonde-pool-rpc-1.json`** — Blast `eth_blockNumber` **200** (répond encore) ; Pocket ETH tête OK ; **Pocket `eth_call@B0 (archive)` = `434687000000` = `price_base_8dec` du book U-4a committé** ⇒ **archive d'ÉTAT vérifiée** ; Pocket `eth_getLogs@B0 (1 bloc)` = **`[]`** (indistinguable d'un bloc vide ⇒ **ne prouve PAS l'archive de logs**) ; Pocket-Solana `getSlot` OK.
5. **[lu] `12-pocket-network-FAITS-navigateur.md:3-8`** — endpoints publics **sans clé** via framework PATH (ETH/SOL/Base/BSC ; Robinhood absente) ; ToS révisées 2024-11-19 : **aucune clause « personal use »**, aucune interdiction d'usage automatisé/commercial ; limites : timeout 10 s, requête/réponse ≤ 100 MB, **≤ 100 000 lignes de logs**, « fair use » (dépassement = `-32097`/HTTP 429, aucun chiffre req/s) ; service « AS IS », retrait sans préavis ; **`providerOf` = un seul « pocket.network » quelle que soit la chaîne** (réponses servies par fournisseurs décentralisés non identifiés ⇒ **jamais seul**).
6. **[lu] `apps/site/lib/narabi-snapshot.ts:23`** — les lignes SERVIES (`/narabi/timeline.jsonl`) portent le tableau `endpoints` (les 8 hôtes). **[lu] `apps/site/components/narabi/narabi-live.tsx:300`** rend `<Fact k="endpoints" v={endpointsUnion(lines)…}/>` (import `:28`) — **union dynamique, AUCUNE hypothèse `length===8`** ⇒ Pocket apparaîtra dans le Fact « endpoints » ; les hôtes retirés restent dans l'**union historique** (honnête : ils ont servi ces fenêtres).
7. **[lu] `vocab-banned.json:107-122`** (scope `sentinel`) — motifs bannis = « adaptive coverage/region/gate », « cascade », « Λ=0 », « would have alerted », « reference price ». **Aucun nom d'opérateur RPC banni** ; « pocket » non listé. Scope `site:32-51` bannit des **marques tierces** (Aave, Polymarket…), pas les fournisseurs RPC. ⇒ ajouter `eth.api.pocket.network` **ne trippe aucun gate vocab**.
8. **[lu] `CHANTIERS.md:320`** — décision 69 = oracle **`no_cash_cross_provider_name_in_export`** (surface CASH **Bell** `/bell/`, test racine **NON exporté**, item T-1b `:328`). Pocket = membre de quorum **Ethereum** (sentinel/Ukemi), **pas** un fournisseur de recoupement **Bell** ⇒ décision 69 **non déclenchée**. Rappel `CHANTIERS.md:407` : sur **Solana**, Helius + Chainstack = deux opérateurs **à clé** (quorum-2 sans public) ⇒ **ne PAS ajouter Pocket-Solana** à `apps/bell/src/rpc.ts:19`.
9. **[lu] `.github/workflows/ci.yml:65`** (`STAT=`) — exclus R-25 : `:(exclude,glob)docs/**/*.md`, `docs/G1-lot-*.md`, `docs/G2-lot-*.md`, `package-lock.json`, `fixtures/**/*.{json,jsonl,csv}`, `apps/sentinel/test/fixtures/**`, `apps/bell/test/fixtures/series/**`. **`:55` `docs/**/*.mjs` RESTE COMPTÉ**. Métrique `ins+del+0` (`:69`), plafond `VIBEGATES_PR_LIMIT=1205` (`:43`).
10. **[lu] décision 92 (`CHANTIERS.md:274`)** — « redéploiement de l'unité sentinel sur le VPS site (E-5) : ACCORDÉ », **après G7 et checkpoint-2 de -1b-ii-b**, selon **RUNBOOK §6**, `T_s = 3×D`, vérif `systemctl show`. RUNBOOK §6 (`CHANTIERS.md:287`) : redéploiement **par SHA de fusion NOMMÉ**.

---

## Inventaire EXHAUSTIF des hôtes RPC codés (grep, classé par BRANCHEMENT)

**A. SERVI / LIVE — À MODIFIER dans ce lot (compté R-25) :**
- `apps/sentinel/src/rpc.ts:19-23` — `PUBLIC_ENDPOINTS` (pool sentinel SERVI `/narabi/`). **⇒ L-1.**
- `apps/sentinel/src/ukemi/rpc2.ts:250-251` — `ETH_CALL_PROVIDERS` / `GET_LOGS_PROVIDERS` (recorder Ukemi, prochain run = U-4b). **⇒ L-2 / L-3.**

**B. RÉUTILISENT les constantes par IMPORT — AUCUN changement d'hôte (héritent automatiquement) :**
- `scripts/census/u3-realized.mjs:271` `CALL_EPS = [env, ...PUBLIC_ENDPOINTS]` (import `:32`) ; **`:365` fait `eth_getLogs` en quorum sur `CALL_EPS` ⇒ `1rpc.io` EST utilisé pour du getLogs de campagne LOURDE par héritage** — **fait qui FALSIFIE SYNTHESE §1** (« déjà absent de ces scripts au dépôt, cohérence confirmée ») ; surfacé, non tu. Commentaire `:361` nomme blastapi (obsolète, non faux). **⇒ Q2 checkpoint-1** (gel vs filtrer `1rpc.io`).
- `scripts/census/u4-oracle-path.mjs:56-57` (`[...ETH_CALL_PROVIDERS]` / `[...GET_LOGS_PROVIDERS]` + env, exclut `mevblocker.io`) ; `u4-probe.mjs:67`, `u4-redraw.mjs:83` (jambe env Chainstack). ⇒ **le retrait en source se propage** ; ces scripts changent de comportement au prochain run sans édition.

**C. HÔTES CODÉS EN DUR — historiques / one-shot (NE PAS réécrire ; inventaire + note, sinon revisionnisme + coût R-25 nul) :**
- `scripts/usde-full-pull.mjs:31-33` — 9 hôtes dont **`1rpc.io/eth` + blast + llama + ankr dans une campagne LOURDE** (anomalie vs 1RPC 200/j). **Statut = question checkpoint-1** (gelé vs rejouable).
- `scripts/census/burns-by-burner.mjs:84-86` (logs/supply/block : mevblocker, tenderly×2, drpc, blastapi, nodies) ; `scripts/census/aave-liquidations.mjs:92-94` (tenderly×2, mevblocker, drpc) — census datés, sorties sha-pinnées séparément.
- `docs/biblio/ukemi-modeL/scripts-mesure/*.mjs` — `m1-archive-cost.mjs:34-45` (table complète), `m2-lambda.mjs:22`, `m2b-susde-0221.mjs:17`, `m2b/lib-m2b.mjs:17`, `m1b-userconfig.mjs:15`. **COMPTÉS R-25 (`docs/**/*.mjs`) ⇒ GEL STRICT** (aucune touche).

**D. Tests (compté R-25) — auto-contenus, résilients au changement de membres :**
- `apps/sentinel/test/sentinel.test.ts:481` : `Set(PUBLIC_ENDPOINTS.map(providerOf)).size >= 2` (dérivé, tient). `sentinel-retry.test.ts:215/219/266` : dérivent de `PUBLIC_ENDPOINTS.length` (pas de `===8`). `ukemi-u4a.test.ts:193-196` : tableau `eth` **synthétique local**. `ukemi.test.ts:50` : `POOL_EPS` **synthétique local** (4 doubles `*.example`). `test/probe-narabi.test.ts:122-127` : `eightPublic` **synthétique local** (teste `chainstackPresent`, pas la membership) — **mise à jour cosmétique optionnelle, non bloquante**.

**E. Sonde externe — NON concernée :** `scripts/probe-narabi.mjs:66/79/83` duplique `providerOf`/`chainstackPresent` et LIT les `endpoints` de la ligne publiée ; ne code aucun pool. **Inchangé.**

**F. Bell Solana — HORS SCOPE :** `apps/bell/src/rpc.ts:19` (`api.mainnet-beta.solana.com`) = défaut Solana ; quorum Bell = Helius+Chainstack à clé (décision, `CHANTIERS.md:407`). **Ne pas y ajouter Pocket-Solana.**

---

## Découpe : POOL-RPC-1a (ce lot) + POOL-RPC-1b (compteur 30 j, DÉCLARÉ)

**POOL-RPC-1a** = révision de pool (rpc.ts + rpc2.ts + tests + mutants) **+ producteur de concordance SÛR** (hook no-op dans `rpc2.ts:quorum2`, jamais dans `rpc.ts:quorumTwo` — ancre Narabi). Petit, faible risque, **rejoint le redéploiement E-5**.
**POOL-RPC-1b (DÉCLARÉ, item à déclencheur)** = **accrual quotidien 30 j** côté sentinel (décision 100 pas 2 = **volumes + concordance**). **Volumes** = `calls_by_operator` déjà émis par le recorder (`record.ts:356`) côté Ukemi **+ compte quotidien Pocket** côté sentinel ; **concordance** = accord Pocket vs 2ᵉ opérateur. Scission justifiée **par la sensibilité de l'ancre `rpc.ts` + la temporalité** (l'accrual ne peut commencer qu'après le déploiement de Pocket), **pas par R-25**. Déclencheur : fusion+déploiement de 1a. Tuyau spécifié ci-dessous (jamais un dû nu).

---

## POOL-RPC-1a — Livrables

### L-1 — `PUBLIC_ENDPOINTS` (sentinel SERVI) : −LlamaRPC, −Blast, +Pocket
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/sentinel/src/rpc.ts:19-23` (constante + commentaire de tête `:1-11` si mention « 8 ») |
| **Action** | retirer `https://eth.llamarpc.com` (fait 5 SYNTHESE : aucune ToS) et `https://eth-mainnet.public.blastapi.io` (fait 4 : arrêté 2025-10-31, endpoint vivant ⇒ retrait par conditions, sans urgence) ; ajouter `https://eth.api.pocket.network`. Pool final = **7** (publicnode×2, drpc, mevblocker, 1rpc, blxrbdn, **pocket**). ≥ 2 providers distincts maintenu (fait 1). |
| **Jamais seul** | garanti par `quorumTwo` (2 providers distincts, `:185`) ; Pocket = 1 provider `pocket.network` ⇒ toujours besoin d'un 2ᵉ. |
| **Tuyau** | entrée : `PUBLIC_ENDPOINTS` → `poolEndpoints(env)` → `quorumTwo` → ligne SERVIE `/narabi/` (`narabi-live.tsx:300` `endpointsUnion`) ; état : **BUILT** (code+test) ; **WIRED au redéploiement E-5** (preuve = 1ʳᵉ ligne JOURNAL post-déploiement liste `pocket`, sans llama/blast). |

### L-2 — `ETH_CALL_PROVIDERS` (Ukemi) : −Blast, +Pocket (archive eth_call vérifiée)
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/sentinel/src/ukemi/rpc2.ts:250` |
| **Action** | retirer `blastapi`, ajouter `pocket` ⇒ {`drpc`, `mevblocker`, `nodies`, `pocket`} (4 distincts). Justification archive : sonde fait 4 (`eth_call@B0 = 434687000000` = book U-4a) ⇒ Pocket **qualifié pour eth_call d'état ancien**. |
| **Tuyau** | entrée : `ETH_CALL_PROVIDERS` → `makeUkemiPool` → course **U-4b** ; état : **BUILT** ; WIRED au **prochain run recorder** (U-4b, décision 91). |

### L-3 — `GET_LOGS_PROVIDERS` (Ukemi) : sort de Tenderly = **branche investisseur, GATÉE par sonde**
| Champ | Contenu |
|---|---|
| **Fichier** | `apps/sentinel/src/ukemi/rpc2.ts:251` |
| **Contrainte liante (fait 3)** | mevblocker exclu (D-5) ⇒ getLogs effectif = {`drpc`(fragile free-plan), `tenderly`} + Chainstack env. **Retirer Tenderly SANS repli ⇒ getLogs = drpc+Chainstack = 2 sans marge** (Tenderly porte ~48 %). |
| **Action (conditionnelle à la réponse investisseur Q1)** | **branche B (reco)** : retirer `tenderly`, ajouter `pocket` ⇒ {`drpc`, `mevblocker`, `pocket`} — **GATÉE par la sonde getLogs large** (précondition L-5) ; **branche A** : garder Tenderly sous procurement juridique (aucun changement code) ; **branche C** : retirer sans repli (**margin 0, non recommandé**). |
| **Tuyau** | entrée : `GET_LOGS_PROVIDERS` → `makeUkemiPool.getLogsRange` → U-4b ; état : **item à déclencheur** (déclencheur = réponse Q1 + sonde L-5 verte). |

### L-4 — Compteur de concordance BRANCHÉ (câblage nommé `record.ts` → `quorum2`)
| Champ | Contenu |
|---|---|
| **Fichiers** | `apps/sentinel/src/ukemi/rpc2.ts` (`quorum2`, `UkemiPoolOpts` : +`onQuorum?`) **et `apps/sentinel/src/ukemi/record.ts:276-307` (`main` → `makeUkemiPool`)** — **jamais** `rpc.ts:quorumTwo` (ancre Narabi épinglée). |
| **Câblage NOMMÉ (règle Branchement — l'antidote au « seul consommateur = un test »)** | `record.ts:main()` gagne `--concordance-out <path>`, **CONSTRUIT le sink** et le passe à `makeUkemiPool` (`:307`) ; `quorum2` l'invoque avec `(label, providerOf(a), providerOf(b), concordant)` — **domaines seuls** (C-1, jamais URL/clé) ; le sink **append** `{label, prov_a, prov_b, concordant, at}` au jsonl. **Consommateur SERVI = la course U-4b** (run recorder, décision 91). **Volumes déjà produits** par `calls_by_operator` (`record.ts:356`). |
| **No-op par défaut** | `--concordance-out` absent ⇒ `onQuorum` absent ⇒ **NO-OP ⇒ sorties recorder byte-identiques** (PINNED sha inchangé). |
| **Test d'intégration NON-LLM** | **pilote le CLI recorder** (`main`) sur fixtures offline avec `--concordance-out`, **LIT le jsonl produit**, asserte les lignes de concordance (Pocket accord ET désaccord) **et l'absence de toute URL** dans le fichier. |
| **Reco** | **fold dans 1a** (α) — U-4b imminent, hook byte-identique par défaut ; l'accrual sentinel 30 j reste **1b** (β, ancre `rpc.ts`). |
| **État / Tuyau** | entrée : `quorum2` (`a.prov`/`b.prov`, `:175/185`) → `record.ts --concordance-out` → jsonl hors dépôt (domaines) → lecture orchestrateur J+30 (décision 100 pas 2) ; **état = BUILT** (câblé `record.ts` + test pilote le CLI) — **plus « upcoming », CA-11 satisfait**. |

### L-5 — Sonde getLogs archive LARGE (PRÉCONDITION dure de L-3 branche B ; ORCHESTRATEUR, réseau, R-20)
| Champ | Contenu |
|---|---|
| **Nature** | **acte orchestrateur** (réseau interdit au worker) ; plafond d'appels DUR, **aucun retry** (calque sonde 03:41). |
| **Spéc (fait 4 : `[]`@1-bloc ne prouve rien)** | plage d'une **fenêtre committée** (`narabi-snapshot.ts:23` : `from_block 25993482..26000650`, burns/mints connus), `address=USDE_TOKEN`, `topics=[TRANSFER_TOPIC]` ; **byte-comparaison via `logsKey`** à drpc **ou** Chainstack ; **PLUS** capturer la **chaîne d'erreur** de Pocket au dépassement 100 000 lignes / timeout 10 s et vérifier qu'elle **matche `isResultLimit` (`rpc2.ts:56`)** — sinon `getLogsVia` ne splitte pas et **bench à tort**. |
| **Verdict** | vert ⇒ L-3 branche B admissible ; rouge ⇒ branche A (garder Tenderly) ou repli Chainstack. |
| **Tuyau** | entrée : fenêtre committée ; sortie : GO/NO-GO getLogs Pocket ; consommateur : L-3 + G0 U-4b ; **jamais un dû nu**. |

### L-6 — 1RPC hors campagnes lourdes + garde (fait SYNTHESE §4 : 200 req/j)
| Champ | Contenu |
|---|---|
| **Action** | 1rpc **reste** dans `PUBLIC_ENDPOINTS` (sentinel ~dizaines/j, marge fine acceptée) ; **assertion** qu'il est **ABSENT** de `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` (déjà le cas). `usde-full-pull.mjs` (1rpc en campagne lourde) → **question checkpoint-1** (gel + note de tête, hors ce lot). |

### L-7 — Chainstack repli inchangé + quorum-2 distinct PARTOUT (affirmation testée)
| Champ | Contenu |
|---|---|
| **Action** | **aucun changement** de la voie Chainstack (env `CHAINSTACK_ETH_URL`, ADR-NARABI-OPS-1 D3 ; jambe archive des scripts u4-*). Test que le pool à 7 garde ≥ 2 distincts (sentinel.test.ts:481) et que Chainstack reste un provider distinct (`chainstack.com`/`p2pify.com`). |

---

## Critères d'acceptation (testables HORS RÉSEAU, stubs offline)
- **CA-1** : `PUBLIC_ENDPOINTS` **exclut** `eth.llamarpc.com` et `eth-mainnet.public.blastapi.io`, **inclut** `https://eth.api.pocket.network` ; `Set(map(providerOf)).size >= 2`.
- **CA-2** : `providerOf("https://eth.api.pocket.network") === "pocket.network"` et **distinct** de tout provider existant.
- **CA-3 (jamais seul)** : un pool `["https://eth.api.pocket.network"]` (Pocket seul) ⇒ `quorumTwo`/`quorum2` **fail-closed** (< 2 providers distincts) ; `[pocket, drpc-stub]` ⇒ succès.
- **CA-4** : `ETH_CALL_PROVIDERS` exclut `blastapi`, inclut `pocket`, ≥ 2 distincts ; un **stub Pocket** byte-égal au book U-4a reproduit **`ethCall(getAssetPrice WETH @23545087)` = `0x…65355d3dc0` = 434687000000** en quorum-2 (fixture offline, sans réseau). *(NB : `434687000000` est un `eth_call` book **Ukemi** — PAS le `supplyAt`/`totalSupply` USDe du sentinel `rpc.ts` ; deux lectures distinctes, ne pas confondre.)*
- **CA-5** : `1rpc.io` **présent** dans `PUBLIC_ENDPOINTS` (sentinel bas volume, marge acceptée), **absent** de `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` (Ukemi) ; **ET** assertion qu'**aucun script `scripts/**` n'importe `PUBLIC_ENDPOINTS` pour un `eth_getLogs` de campagne lourde sans filtrer `1rpc.io`** — **exception MESURÉE à déclarer** : `u3-realized.mjs:271/365` le fait (⇒ gelé ou filtré, Q2 checkpoint-1). Sans cette clause, CA-5 donnerait une **fausse assurance** (le 1rpc en getLogs lourd existe par héritage d'import).
- **CA-6** : `publishedEndpoints` publie les publics **verbatim** + Chainstack **rédigé** (sentinel-retry.test.ts:215 tient avec la nouvelle liste) ; `sentinel_never_prints_endpoint_url` vert ; `no_secret_in_repo` vert.
- **CA-7 (L-3 branche B, GATÉE)** : `GET_LOGS_PROVIDERS` exclut `tenderly`, inclut `pocket`, ≥ 2 distincts — **conditionnée** à L-5 verte (précondition réseau).
- **CA-8 (L-4)** : hook absent ⇒ sortie recorder **byte-identique** (PINNED sha inchangé) ; sink injecté ⇒ reçoit `(label, providerOf(a), providerOf(b), concordant)` **domaines seuls** (jamais d'URL).

## Mutants prévus (`cp` byte-exact depuis pristine, jamais `git checkout`)
- **M-1** Blast non retiré de `PUBLIC_ENDPOINTS` ⇒ CA-1 **ROUGE** ; **M-2** Llama non retiré ⇒ **ROUGE**.
- **M-3** `providerOf(pocket) ≠ "pocket.network"` ⇒ CA-2 **ROUGE** ; **M-4** quorum accepte Pocket **seul** (garde 2-distinct retirée) ⇒ CA-3 **ROUGE**.
- **M-5** Blast non retiré de `ETH_CALL_PROVIDERS` ⇒ CA-4 **ROUGE** ; **M-6** 1rpc ajouté à un pool lourd ⇒ CA-5 **ROUGE**.
- **M-7** hook `onQuorum` **non no-op par défaut** (change les octets) ⇒ CA-8 **ROUGE** ; **M-7b** hook enregistre l'**URL** (fuite C-1) au lieu du domaine ⇒ CA-8 **ROUGE**.
- **M-8** pool < 2 providers distincts ⇒ sentinel.test.ts:481 **ROUGE**.

## Tuyaux (règle Branchement — ADR-M018 D3)
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test non-LLM |
|---|---|---|---|---|
| pool → sentinel SERVI | `rpc.ts:PUBLIC_ENDPOINTS` | `/narabi/` endpoints (`narabi-live.tsx:300`) | **BUILT**, wired à E-5 | `sentinel_*` (pool ≥ 2 distinct, publie rédigé) |
| pool → Ukemi | `rpc2.ts:ETH_CALL_PROVIDERS` | course **U-4b** | **BUILT**, wired au run recorder | CA-4 (stub book U-4a) |
| Pocket archive eth_call | sonde `13-sonde…json` | == book U-4a committé | **BUILT** (preuve committée) | — (fait committé) |
| Pocket getLogs large | **sonde L-5** (orchestrateur) | membership `GET_LOGS_PROVIDERS` | **item à déclencheur** (Q1+L-5) | CA-7 (gatée) |
| concordance producteur | `rpc2.ts:quorum2` → **`record.ts:main --concordance-out`** | jsonl domaines (C-1), consommé par U-4b | **BUILT (câblé CLI, 1a)** | test pilote le CLI recorder, lit le jsonl |
| concordance accrual 30 j | sentinel quotidien (ancre `rpc.ts`) | lecture orchestrateur J+30 (déc. 100) | **UPCOMING (POOL-RPC-1b déclaré)** | (spéc en 1b) |

## Projection R-25 (métrique `ins+del+0`, `ci.yml:69` ; plafond 1 205, `ci.yml:43`)
**Comptés** : `apps/sentinel/src/rpc.ts`, `apps/sentinel/src/ukemi/rpc2.ts`, **`apps/sentinel/src/ukemi/record.ts`** (câblage `--concordance-out`, L-4), `apps/sentinel/test/*.test.ts` (nouveaux tests + companions mutants + test d'intégration CLI). **Exclus** : `docs/**/*.md` (ce G0 = 0), fixtures json/jsonl. **NON touchés** : scripts C (gel, dont `docs/**/*.mjs` compté), tests D auto-contenus (sauf ajouts). Projeté brut : rpc.ts ~8-12, rpc2.ts ~10-16 (providers + hook), record.ts ~30-60, tests ~100-180 ⇒ **~150-270** ; **×2 conservateur (discipline b3d) ≈ 300-540 ≪ 1 205** ⇒ **aucune scission R-25**. La scission 1a/1b est motivée par l'ancre `rpc.ts` + la temporalité, non par R-25.

## Risques (MAST)
- **Effondrement silencieux du quorum getLogs U-4b** (retrait Tenderly sans repli, mevblocker exclu) ⇒ **la contrainte liante** : L-3 branche B **gatée par L-5** ; branche C explicitement « margin 0, non recommandé ». Décrit dans Q1.
- **Faux GO archive Pocket** (`[]`@1-bloc pris pour preuve, fait 4) ⇒ L-5 exige fenêtre committée byte-comparée + capture de la chaîne d'erreur au cap 100 k / timeout 10 s (matche `isResultLimit`).
- **Fuite de clé sur la surface** (C-1) ⇒ `publishedEndpoints` rédige Chainstack ; hook concordance = domaines seuls (M-7b) ; `no_secret_in_repo` vert.
- **Régurgitation d'un tier degradé** (429 1RPC en campagne) ⇒ 1rpc hors pools lourds (L-6, CA-5).
- **Modification d'ancre LIVE** ⇒ `providerOf`/`quorumTwo` de `rpc.ts` **non touchés** ; concordance producteur en `rpc2.ts` seul.
- **Surface publique nommant un recoupement Bell (déc. 69)** ⇒ Pocket = quorum **Ethereum**, pas Bell ; vocab-gate non trippé (fait 7/8) ; compteur tenu **hors** surfaces `/bell/`.

## Effet sur le SENTINEL DÉPLOYÉ (E-5, décision 92 — NE PAS planifier deux fois)
Le changement de `PUBLIC_ENDPOINTS` n'a d'effet servi qu'après **redéploiement** de l'unité sur le VPS site. Décision 92 : E-5 **déjà accordé**, **après G7+checkpoint-2 de Narabi -1b-ii-b**, RUNBOOK §6, redéploiement **par SHA de fusion nommé**, `T_s=3×D`, vérif `systemctl show`. **POOL-RPC-1a doit RIDER ce même E-5** (piggyback) : la fusion de 1a doit précéder (≤) le SHA E-5, sinon E-5 attend 1a **ou** un 2ᵉ redéploiement — **à trancher au checkpoint-1**, jamais une dette. **Ukemi/U-4b ne se déploie pas — preuve négative [lu] : `deploy/` ne contient QUE `monark-{harness,sentinel,probe}.{service,timer}` + 2 `Caddyfile`, AUCUNE unité recorder/ukemi.** Le recorder (`record.ts:main`, consommateur de `rpc2.ts:17`) est **run à la demande** (`--max-calls … --out`, `:283`) ; la surface `/ukemi/` (décision 57, `CHANTIERS.md:120`) sert des **fichiers book STATIQUES** via Caddy, pas le recorder ⇒ changer `rpc2.ts` n'affecte que le prochain run (U-4b), **pas de 2ᵉ redéploiement** pour L-2/L-3/L-4.

## Questions au checkpoint-1 (validateur-humain)
1. **Ordre de fusion vs E-5** : POOL-RPC-1a fusionne-t-il **avant** le SHA de redéploiement E-5 (piggyback) ou E-5 attend-il 1a ? (Éviter un 2ᵉ redéploiement.)
2. **Statut des scripts lourds utilisant 1rpc** — `usde-full-pull.mjs` (1rpc+blast+llama+ankr codés en dur) ET `u3-realized.mjs:365` (1rpc via `PUBLIC_ENDPOINTS` importé, getLogs quorum) : **gelés** (note de tête, hors lot — reco) ou rejouables (⇒ filtrer `1rpc.io` / basculer sur les pools Ukemi dans un lot dédié) ? *(Fait surfacé : contredit SYNTHESE §1.)*
3. **Fold du hook `onQuorum` en 1a** (α, reco) vs report intégral en 1b (β).
4. **Mise à jour cosmétique** des fixtures synthétiques (`probe-narabi.test.ts:122`, `ukemi-u4a.test.ts:193`) nommant blast/llama : faite ou laissée (non bloquant) ?

## Questions INVESTISSEUR (une par une, options + reco)

**Q1 — Tenderly : retirer (clause « personal use ») ou garder sous procurement juridique ?**
Contexte mesuré : clause ToS 2026-06-08 « solely for Your personal use and not for the benefit of any other person or entity » (la plus défavorable de l'archive) ; Tenderly porte **~48 % des getLogs** U-4a ; mevblocker exclu (dégradation 34 % D-5) ⇒ sans Tenderly, getLogs = drpc(fragile)+Chainstack.
- **Option A — garder sous lecture/procurement juridique** : coût = temps (pas d'argent) ; conserve la gratuité **si** la clause ne vise pas le gateway API société. Risque juridique maintenu jusqu'à l'avis.
- **Option B (RECO) — retirer + remplacer par Pocket dans `GET_LOGS_PROVIDERS`, GATÉ par la sonde getLogs large (L-5)** : supprime le risque juridique **sans** effondrer le quorum ; coût = une sonde sous garde. Repli si L-5 rouge = Option A.
- **Option C — retirer sans repli** : getLogs = drpc+Chainstack = **marge 0** (drpc benché tôt) ⇒ **non recommandé**.

**Q2 — Les 30 jours de mesure de concordance (décision 100 pas 2) doivent-ils s'écouler AVANT U-4b, ou U-4b est-il lui-même le tirage de mesure ?**
- **Option A (RECO)** — **U-4b procède maintenant**, Pocket en membre de quorum (jamais seul ⇒ un désaccord fail-close, sûr) ; la concordance du **vrai volume** est capturée par le hook L-4 pendant U-4b ; l'accrual sentinel 30 j (1b) tourne **en parallèle** et informe la **proposition écrite après LEGAL-ATLAS** (décision 100 pas 3), pas le gate de U-4b. Coût = zéro délai.
- **Option B** — attendre 30 j d'accrual sentinel avant U-4b : coût = **~1 mois de délai** ; bénéfice = concordance établie avant tout usage lourd de Pocket.

**Q3 — Cap de convergence Chainstack (SYNTHESE Q5) :** si plusieurs rôles basculent tous en repli vers le seul Chainstack payant, plafonner le nombre de rôles simultanés (préserver la diversité de quorum) ou accepter Chainstack comme repli par défaut multiple ? (Reco : plafonner à 1 rôle keyless remplacé par Chainstack à la fois, mesurer avant de généraliser.)

---

## Rendus de mission
**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`, effort max, non banni).
**sha256** : recomputé par l'orchestrateur (`sha256sum F:/tmp/pool-rpc-1/G0-lot-pool-rpc-1.md`) ; non embarqué (point fixe). Le worker ne committe pas (R-20).

**Résumé (15 lignes)**
1. Lot scindé : **1a** (révision de pool + producteur de concordance sûr) rejoint le redéploiement **E-5** ; **1b DÉCLARÉ** (accrual 30 j, ancre `rpc.ts` sensible).
2. **L-1** `PUBLIC_ENDPOINTS` (sentinel SERVI) : −LlamaRPC (aucune ToS), −Blast (arrêté 2025-10-31, endpoint vivant ⇒ retrait par conditions **sans urgence**), +Pocket ⇒ pool à 7, ≥ 2 distincts.
3. **L-2** `ETH_CALL_PROVIDERS` : −Blast, +Pocket (**archive eth_call vérifiée** : sonde = book U-4a `434687000000`).
4. **L-3** `GET_LOGS_PROVIDERS` : sortie de Tenderly = **branche investisseur GATÉE** ; contrainte liante mesurée (Tenderly ~48 % des getLogs, mevblocker exclu D-5 ⇒ retrait nu = marge 0).
5. **L-4** compteur de concordance **BRANCHÉ** : `record.ts:main --concordance-out` construit le sink → `makeUkemiPool` → `rpc2.ts:quorum2` (jamais `rpc.ts`, ancre Narabi) ; **no-op par défaut** (byte-identique), domaines seuls (C-1) ; **test pilote le CLI recorder** ; consommé par U-4b ⇒ **BUILT (CA-11), pas upcoming**.
6. **L-5** sonde getLogs LARGE = **précondition dure** (le `[]`@1-bloc ne prouve rien) : fenêtre committée byte-comparée + chaîne d'erreur au cap 100 k matchant `isResultLimit` ; acte orchestrateur.
7. **L-6** 1RPC reste sentinel (bas volume), exclu des pools Ukemi ; **fait surfacé : `u3-realized.mjs:365` + `usde-full-pull.mjs` utilisent 1rpc en getLogs LOURD** (falsifie SYNTHESE §1) ⇒ Q2 checkpoint-1 (gel/filtrer).
8. **L-7** Chainstack repli **inchangé** ; quorum-2 par opérateurs **DISTINCTS** partout (testé).
9. Inventaire EXHAUSTIF classé A(modifier)/B(import hérité)/C(gel historique, dont `docs/**/*.mjs` compté R-25)/D(tests auto-contenus)/E(sonde inchangée)/F(Bell hors scope).
10. **Pocket-Solana NON ajouté** à Bell (Helius+Chainstack à clé, décision).
11. Surface `/narabi/` publiera `eth.api.pocket.network` (union dynamique `narabi-live.tsx:300`) : **conforme** décision 69 (Pocket ≠ recoupement Bell) et vocab-gate (aucun opérateur banni).
12. **8 CA** hors réseau (stubs), **8 mutants** rouges byte-exact ; PINNED sha recorder inchangé (hook no-op).
13. **R-25** projeté ~110-200 ⇒ ×2 ≈ 220-400 ≪ 1 205 ⇒ **aucune scission R-25** (la scission 1a/1b = ancre+temporalité).
14. **E-5** : POOL-RPC-1a **ride** le redéploiement déjà accordé (décision 92) ; **ne pas planifier deux fois** ; ordre de fusion vs SHA E-5 = question checkpoint-1.
15. **3 questions investisseur** : Tenderly (reco B, retrait + Pocket gaté par sonde), timing 30 j vs U-4b (reco A, U-4b maintenant), cap convergence Chainstack (reco : plafonner).

**Liste des questions investisseur** : Q1 Tenderly (A garder-procurement / **B retirer+Pocket gaté sonde [reco]** / C retirer sans repli) ; Q2 30 jours avant U-4b (**A U-4b maintenant, concordance en parallèle [reco]** / B attendre 30 j) ; Q3 cap convergence Chainstack (reco : plafonner à 1 rôle à la fois).

**Points NON PLIÉS (avec raison, jamais un dû nu)** :
- **L-5 (sonde getLogs large)** : acte réseau **orchestrateur**, hors worker (R-20) — spécifiée entièrement, déclencheur = réponse Q1 branche B.
- **POOL-RPC-1b (accrual 30 j)** : sous-lot **déclaré** (ancre `rpc.ts` + temporalité), tuyau spécifié, déclencheur = déploiement de 1a.
- **`usde-full-pull.mjs` / census C** : **gel** (question checkpoint-1), inventoriés, non réécrits (revisionnisme + coût R-25 nul).
