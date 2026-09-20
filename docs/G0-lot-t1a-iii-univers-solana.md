# G0 — Sprint backlog lot T-1a-iii (Bell) : mesure de l'univers Solana élargi — liste CLASSÉE de candidats à ajouter à l'univers Bell du release, par mesure API de première main

Rédaction worker `claude-opus-4-8[1m]` effort max, 2026-09-20, à la demande de l'orchestrateur (PLANIFICATEUR-RÉDACTEUR G0). **Brouillon PRÉ-checkpoint-1** : les questions ouvertes (Q1..Q9) et procurements sont en fin de document ; le **validateur tranche AVANT tout code** (AgileGates : approbation du PLAN avant code). **R-20** : le worker ne committe pas, ne déclenche aucun workflow. **R-21** : sortie vérifiée adversarialement — chaque chiffre vient d'un fichier du dépôt (cité `fichier:ligne`) ou est marqué **« proposition (Q) »** / **« à mesurer au PLI »**. **AUCUN appel réseau dans ce tour** (ni Helius, ni API de données, ni issuer API) ; aucune clé/URL ; aucun close ni prix en clair. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, Opus 4.8 1M, non banni, effort max ; source = identité d'exécution de la session).

**Cadre (décisions investisseur, `docs/CHANTIERS.md`)** : **décision 82** (l.241, verbatim « oui forme le lot de mesure univers solana élargi ») forme ce lot ; fait [lu] première main : `xstocks.fi/products` liste **811 produits** (2026-09-20, l.241). **Décision 68** (l.199-200) : toute DONNÉE vient d'une mesure de première main par nos API directes ; un article ne fournit qu'une MÉTHODE, jamais un chiffre porteur ; RWA.xyz/Asortino/census v4 = archive, non consommés par le produit. **Décision 80** (l.228) : tout symbole ajouté, même financé par un demandeur, est TOUJOURS mesuré et publié pour tous (biais de sélection déclaré ; aucune mesure privée). **Décision 81** (l.240) : Ondo **hors périmètre release** (clé GM auth-gated, KYC ; réouverture = entrée d'Ondo dans le périmètre Bell). **Décision 69** (l.208, l.222) : aucun nom de fournisseur de recoupement cash sur une surface ou un source **exporté** (test racine NON exporté). **Ordre** (l.241, l.204 voie B) : **APRÈS la sonde -b3d** (budget Helius non dispersé) ; **G0 + checkpoint-1 avant tout appel** ; budget pré-enregistré. **CA-11 durci** (l.212, l.182) : un tuyau n'est « branché » que si un test d'intégration non-LLM **EXÉCUTE la composition depuis l'artefact d'entrée**.

**Rattachement** : ADR-B0 (D1 doctrine « mesure, pas trade » ; D2 faits i-iv ; D5 mutants/`gate:vocab` scope `apps/bell` ; D6 sources/coûts ; ESC-1 c close jamais republié) ; ADR-T1aii (D1-quater rebase ScaledUiAmount, autorité partagée `S7vYFF…` ; C-9 carte opérateur ; C-10 hygiène de clé) ; leçon **C-G2-1 -b3d-a** (unité APPELS vs CRÉDITS ; `budget.json` par `--out`) ; `apps/bell/src/pools.ts`, `discover.ts`, `collect.ts`, `quorum.ts`, `operators.ts` ; `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md` (méthode « mint émetteur == mint on-chain »).

## Isolation
`apps/bell/**` seulement (+ ADR/PLI/G0 docs + `docs/biblio/bell/` pour les lectures ToS). Un worker, un worktree neuf par sous-lot. **Ne touche pas** CHANTIERS/JOURNAL (garde d'écriture orchestrateur), ni un `apps/bell/**` d'un autre lot en vol, ni le gate live -b3d/-b1-bis-ii au-delà de l'ajout de fichiers neufs.

## Nom de lot — `T-1a-iii` (vérifié LIBRE)
`t1a-iii`, `T-1a-iii`, `-iii-`, `iii-a`, `iii-b` : **0 occurrence** comme nom de lot dans `docs/` (vérifié `Grep`, 2026-09-20). Les sous-lots sont **`-iii-a`** (Phase A, zéro Helius) et **`-iii-b`** (Phase B, Helius). T-1a-i (clos), T-1a-ii (course fondatrice des 4 mints, sous-lots -b*), **T-1a-iii = extension de l'univers** (troisième branche de T-1a).

## Objectif (une phrase)
Produire une **LISTE CLASSÉE de candidats xStocks Solana** à ajouter à l'univers Bell (aujourd'hui 4 mints : TSLAx, SPYx, NVDAx, AAPLx, `pools.ts:90-99`), par **mesure API de première main** — pour chaque candidat : adresse publiée par l'émetteur **== mint on-chain**, présence d'une clôture de référence, liquidité/profondeur/volume, extension `ScaledUiAmount` (+ autorité), programme du pool, et **coût de collecte** (crédits Helius + durée) — afin que l'investisseur tranche les ajouts (décision 80 : tout ajout est publié pour tous).

---

## 1. Périmètre et NON-périmètre

### 1.1 Émetteurs
| Émetteur | Traitement dans -iii | Motif (fichier:ligne) |
|---|---|---|
| **xStocks (Backed Assets (JE) Ltd)** | **DANS le périmètre, cœur du lot** — identité établie de première main | API émetteur publique sans clé `api.xstocks.fi/api/v2/public/assets`, adresses Solana == `pools.ts` caractère-pour-caractère (`L-lecture-xstocks…:83-88`) ; « SPL Token-2022 + Scaled UI » (prose émetteur, `…:91-93`) |
| **Backpack Securities + Sunrise** | **À QUALIFIER — hors -iii-a/-b, item formé** : lecture d'un document d'émetteur donnant les adresses de mint Solana AVANT toute mesure | census v4 : droits « supported but not yet enabled » (`CENSUS…v4:14`) ; adresses de mint par document émetteur **NON TROUVÉES** (`CENSUS…v4:59`) ⇒ pas de mesure sans identité première main |
| **Superstate Opening Bell** | **À QUALIFIER — hors -iii-a/-b, item formé** : idem (Superstate = transfer agent, l'émetteur est la société tokenisée) | `CENSUS…v4:13,59` ; adresses Solana non établies première main |
| **PreStocks** | **HORS mesure d'écart, déclaré** : pré-IPO, **pas de clôture boursière** ⇒ l'écart hors séance `g_t` n'est pas définissable ; listé « hors mesure » | `CENSUS…v4:15` (« no NMS stock underlying ») ; décision 40 exclut le pré-IPO (`CHANTIERS:49`) ; critère C2 échoue par construction (pas de MIC) |
| **Remora** | **ITEM FORMÉ, aucune hypothèse** : aucun fait de première main (site non atteint, navigation refusée) | décision 82 (`CHANTIERS:241`) ; procurement de lecture PR-U-REMORA si l'investisseur veut le qualifier |
| **Ondo** | **HORS périmètre** (décision 81) | `CHANTIERS:240` ; réouverture = entrée d'Ondo dans le périmètre Bell |

### 1.2 NON-périmètre (ce que -iii NE fait PAS)
- **N'ajoute AUCUN symbole** à `pools.ts` : ce lot **MESURE et CLASSE**. L'AJOUT effectif d'un symbole (registre `pools.ts` + séries + course g_t + contre-vérification rebase-aware) est un **lot ultérieur à chiffrer PAR SYMBOLE** (calque du coût T-1a-ii des 4 mints).
- **Ne calcule aucune g_t**, ne touche aucun close, ne fait aucun scan full-mint des corps (c'est -b3d et l'ADD lot).
- **Ne publie rien** de la donnée de liquidité/volume/prix des API tierces (elle sert à **CLASSER**, jamais à publier — décision 68).
- **Ne résout PAS** la carte DEX `whirLbMii…` (`unknown-program`) : c'est une **reprise -b1-bis-ii** déjà formée (`CHANTIERS:220`) ; -iii **hérite** du label et le **déclare** (§3 C5).
- N'aborde ni EVM, ni autres chaînes (Solana seulement, décision 82).

---

## 2. Deux phases séparées par un gate (checkpoint entre -iii-a et -iii-b)

### Phase A — `-iii-a` : ZÉRO crédit Helius, lançable dès le checkpoint-1 (offline + réseau keyless/HTTP public)

**(i) Univers + identité (émetteur == on-chain).**
- **Document qui fait foi** : API émetteur publique **sans clé** `GET https://api.xstocks.fi/api/v2/public/assets` (`security: []` ; pageSize max **100**, serveur le fait respecter ; `L-lecture…:282-283`), **paginée à ÉPUISEMENT** (le tri `?network=Solana` n'est **pas** alphabétique — les 4 mints connus sont **absents des 700 premiers actifs** ⇒ épuisement OBLIGATOIRE, `L-lecture…:407`). Pour chaque actif, extraire `deployments[].address` où `network=="Solana"` (`L-lecture…:81-88,309-320`). Le **811** de la décision 82 est le compte produit **multi-chaîne** ; la Phase A énumère le **sous-ensemble Solana**.
- **Lier symbole → mint SANS agrégateur seul** : l'API émetteur (1re partie, pas un agrégateur) donne l'adresse ; **confirmation on-chain de première main** `getAccountInfo.owner == Token-2022` (`TOKEN_2022_PROGRAM`, `pools.ts:69`) + décimales, **sous quorum-2 keyless** (motif `quorum.ts` réutilisé). Un mint dont l'owner on-chain ≠ Token-2022 ⇒ `identity_unconfirmed` (exclu, publié, jamais deviné). C'est la méthode load-bearing du fichier (`pools.ts:3-7` ; `L-lecture…:44-57,101-102`).
- **Providers keyless (0 Helius)** : quorum-2 sur opérateurs distincts `solana-foundation` (`api.mainnet-beta.solana.com`) + `publicnode` (retiré de l'archive mais sert l'ÉTAT COURANT ; `operators.ts:18-19`) ; `getAccountInfo` d'**état courant** n'exige **aucune** profondeur d'archive (le rôle archival de mainnet-beta, C-1, est **hors sujet** ici — n'importe quel RPC sain convient). Repli si un keyless manque : `drpc`/`ankr`/`pocket` (`operators.ts:23,26,20`).

**(ii) Liquidité / profondeur / volume par API PUBLIQUE gratuite (ranking, jamais publié).**
Sources candidates, chacune **précédée de sa lecture ToS [lu]** (procurements PR-U-*, §6 — licence, quotas, attribution, **interdiction de redistribution**) :
- **Tier 1 (préféré, le plus conforme décision 68) — API DEX-natives + confirmation on-chain** : Raydium `api-v3.raydium.io` (déjà utilisé `pools.ts:116-131`) et Orca (pour les pools `whirLbMii…`) pour **énumérer les pools** par mint, **puis** lecture on-chain **keyless** du **solde du vault quote** (`getAccountInfo`) = réserves USDC de première main (0 Helius). L'API DEX-native de son propre DEX n'est pas un agrégateur tiers.
- **Tier 2 (aide au triage) — GeckoTerminal API publique** `api.geckoterminal.com/api/v2` (déjà utilisé `pools.ts:107,136`) : `volume_24h`/réserves agrégées — **agrégateur déclaré**, entrée de **classement** seulement, jamais publié, jamais source d'identité (« jamais un agrégateur seul », `CHANTIERS:136`).
- **DexScreener : EXCLU** (banni comme source unique, `CHANTIERS:136`) — non utilisé.
- **ANTI-CLOSE (bloquant, leçon advisor)** : ces API renvoient toutes des **prix de token** (`api.xstocks.fi/.../price-data` ; GeckoTerminal `base_token_price_usd` ; Raydium `price`). L'artefact de classement **strippe tout champ prix** : garde `assertNoClose`/`CLOSE_KEY` (`pools.ts` motif, ADR-B0 D5) **étendue** aux formes `price|price_usd|base_token_price|quote_token_price` + **mutant** ; seuls liquidité/volume **en USD** et décomptes sont conservés.

**(iii) Présence de l'extension `ScaledUiAmount` (+ autorité) — 1 `getAccountInfo` par mint.**
- **En Phase A, 0 crédit Helius** : `getAccountInfo(jsonParsed)` sous **quorum-2 keyless** (mainnet-beta + publicnode) lit `scaledUiAmountConfig{multiplier, newMultiplier, effTs, **authority**}` (état courant, pas d'archive requise ; `ADR-T1aii:30` C-4, D1-quater `mod.rs`). **Enregistrer `authority`** (leçon advisor) : `authority == S7vYFF…` ⇒ trajectoire de rebase **déjà énumérée** par -b3a/-b3d (re-décodage ~0 crédit, `G0-b3d:102`) ; `authority ≠ S7vYFF` ⇒ **un nouveau scan d'autorité est dû** (coût d'ajout supérieur). Fail-closed : quorum raté ⇒ `scaled_ui_unread` (résidu, jamais un défaut deviné).
- **Alternative** (Q8) : repousser (iii) en Phase B sur Helius (1 `getAccountInfo` = **1 crédit**/mint) si le quorum keyless est jugé insuffisant pour un fait d'état ; recommandation = **Phase A keyless** (l'état courant n'exige pas d'archive).

**Sortie -iii-a** : artefact `universe-candidates-<date>.json` (identité confirmée + liquidité/volume + `scaled_ui` + `authority` + programme + `quote_class` + MIC de référence, **sans aucun prix**) + `docs/MESURE-UNIVERS-SOLANA-<date>.md` (rapport, chiffres avec unité, [lu]/[abs]). **Bornage réseau (0 crédit ≠ 0 budget)** : confirmation on-chain = plusieurs centaines × 2 appels keyless — **débit borné `--min-interval` + `--max-calls`** (les runs keyless portent AUSSI `--max-calls` ; `makeBudgetedCall` compte des APPELS, méthode-agnostique, `collect.ts:296-298,423,563` ; une boucle keyless emballée est une terminaison prématurée MAST), retry/backoff (calque `record.ts`), **0 Helius** ; **déclencheur de repli PRÉ-ENREGISTRÉ** (HTTP 429 / seuil de 429 consécutifs, fixé au PLI) ⇒ confirmer d'abord le **top-N par liquidité**, le reste à la promotion (déclaré).

### GATE (checkpoint entre A et B)
G2 fraîche + checkpoint-2 de -iii-a (offline + rejeu keyless), **puis** -iii-b lancé **seulement après** : (1) le **checkpoint-2 de -b3d-a**, et (2) la **sonde -b3d** (budget Helius du cycle settlé). Décision 82 (l.241) : « APRÈS la sonde -b3d ».

### Phase B — `-iii-b` : crédits Helius, APRÈS le gate

**Objet** : pour les **N premiers candidats** (top-N par liquidité Phase A, N pré-enregistré, Q1), mesurer le **nombre de signatures par mint** ⇒ **coût full-mint** (crédits + durée).
- **Primitive** : `getSignaturesForAddress` (gSFA) = **1 crédit/appel**, ≤ 1000 signatures/page (`G0-b3d:24`) — **archive requise** (historique complet) ⇒ **Helius mono-opérateur** (résiduel `authority_scan_mono_operator`-like déclaré ; pas d'équivalent gSFA Chainstack bon marché). Réutilise le pager `signaturesUntil`/gSFA (`rpc.ts`, cité `G0-b3d:28`).
- **Par candidat** : paginer gSFA jusqu'à un **cap par mint** `C_page` (Q2). **ÉPUISÉ sous le cap** ⇒ `n_sig` **exact** ⇒ **coût full-mint exact** = `⌈n_sig/1000⌉ × 10 cr` (gTfA `full`, 10 cr/page, `G0-b3d:24`) + **durée exacte** = `⌈n_sig/1000⌉ / 4` s (`--min-interval 250` ⇒ 4 appels/s, `collect.ts:423`). **CAP atteint** ⇒ publier **`n_sig ≥ C_page×1000` (plancher)** + **débit récent** (sig/j sur l'empan `blockTime` des pages vues) ; **N exact et coût projeté = DÉFÉRÉS à l'ADR d'ajout par symbole** (pas de projection présentée comme fait ici).
- **Méthode PURE 1-crédit** : jeu de méthodes pré-enregistré **`{getSignaturesForAddress, getAccountInfo}`**, **1 cr chacun** (`CHANTIERS:122`) ⇒ le compteur d'**appels** (`makeBudgetedCall`, `collect.ts:296-298`) **== crédits** ⇒ `--max-calls == plafond` (pas de conversion pire cas nécessaire ; contraste avec -b3d où gTfA 10 cr force `--max-calls = plafond/10`). **Tout appel gTfA en Phase B = hors pré-enregistrement ⇒ STOP** (garde : `credits_recomputed` assertion + mutant `×1↔×10`, la leçon C-G2-3 : ce mutant a **survécu** en -b3d-a, `G2-b3d-a:117`). Genesis (pour le débit d'un mint capé) : **NON tiré en Phase B** (gSFA pagine seulement en arrière ; un genesis exigerait une page gTfA asc à 10 cr) ⇒ plancher + débit récent seulement ; l'option « +1 page gTfA asc/mint capé (10 cr) pour un N projeté » est un **Q3**.

**Compteur cumulatif partagé avec -b3d (leçon C-G2-1, `G2-b3d-a:23-42`)** : `budget.json` est **par `--out`** ⇒ un `--out` distinct **casse silencieusement** le plafond cumulatif. Mécanisme (code, compté R-25) : -iii-b prend un flag **`--ledger <path>`** dédié pointant le **même fichier de budget cumulatif** que le cycle, lu par `readPriorCalls` (offset ; mutant M17 -b3d « budget non offset par priorCalls » à conserver). **Recommandation : un flag `--ledger` dédié plutôt que le partage d'`--out`** (partager `--out` coupleraient les répertoires d'artefacts entre lots) — Q6. **Fail-closed** : `--max-calls` requis, > 0 (`collect.ts:430-432`) ; `BudgetExceededError` re-levé, jamais avalé (`quorum.ts:24,90`).

**Sortie -iii-b** : `crosscheck-signatures-<date>.json` (par candidat : `n_sig` exact **ou** plancher+débit, `full_mint_credits`, `duration_sec`, `authority`, `calls_by_method`, `credits_recomputed`) + MAJ du rapport. **Ledger + tout brut hors dépôt sha-pinné** ; opérateurs par **domaine seul**.

---

## 3. Critères de classement PRÉ-ENREGISTRÉS (committés SEUL avant toute donnée ; aucun score composite ; jamais le mot « score » sur une surface publique)

Chaque critère est une **colonne** de la table de classement (pas d'agrégat opaque). Les **valeurs de seuil** sont des **propositions (Q)**, à fixer au PLI **avant** de voir la donnée (règle §F « prereg committé seul »).

| # | Critère | Règle (pré-enregistrée) | Effet |
|---|---|---|---|
| **C1** | **Identité première main** | adresse émetteur (`api.xstocks.fi`) **== on-chain** `getAccountInfo.owner==Token-2022` + décimales, quorum-2 | échec ⇒ `identity_unconfirmed` = **exclu** (publié) |
| **C2** | **Clôture de référence existe** | `underlying.exchange.mic ∈ {XNAS, XNYS, ARCX, BATS, …}` (MIC US lu de première main sur l'API émetteur, `L-lecture…:149-154`) ⇒ un close SIP existe **par construction** ; **aucun nom de fournisseur, 0 crédit, décision 69-propre** ; pré-IPO/pas de MIC ⇒ échec | échec ⇒ **hors mesure d'écart** (PreStocks, l.1.1) |
| **C3** | **Quote USD-stable** | mint quote du pool ∈ `USD_STABLE_MINTS` (USDC aujourd'hui, `pools.ts:80`) ⇒ mesurable en USD ; sinon `quote_class:"non-usd"` | non-usd ⇒ listé **avec résidu**, exclu de la course g_t (ADR-B0 D6) |
| **C4** | **Liquidité/profondeur ≥ seuil** | réserves quote-vault ≥ `T_liq` USD **ET** volume 24 h ≥ `T_vol` USD (`T_liq`,`T_vol` = Q4) | en-dessous ⇒ `candidate_below_liquidity_threshold` **publié** (jamais dropé en silence — calque `discover.ts:69,94`) |
| **C5** | **Programme lisible par `discover.ts`** | `raydium-clmm` committé (`pools.ts:74-76`) vs **`whirLbMii…` = `unknown-program`** aujourd'hui (`pools.ts:172,175`). **IMPLICATION (à dire) :** sur Solana l'extraction VWAP/découverte est **par delta de vault, agnostique au programme** (`pools.ts:40-42`) ⇒ `unknown-program` **NE bloque PAS** la mesure ; c'est une **colonne résiduelle** (honnêteté), et committer un nouveau programme à `DEX_BY_PROGRAM_ID` est **une ligne d'ADR** (`pools.ts:74`, C-5), reprise déjà formée -b1-bis-ii (`CHANTIERS:220`) | **résiduel/label, PAS un disqualifiant** |
| **C6** | **`ScaledUiAmount` + autorité** | présence enregistrée ; `authority==S7vYFF` ⇒ rebase déjà énuméré (re-décodage ~0 cr) ; `≠` ⇒ scan d'autorité dû (coût d'ajout supérieur) | **colonne**, informe le coût d'ajout M2 |
| **C7** | **Coût ≤ plafond par symbole** | coût full-mint (M1, §Phase B) ≤ plafond par symbole `T_cost` (Q5) | au-dessus ⇒ `cost_prohibitive_current_plan` (ajout différé / décision budget) |

**Ordre de la liste** : tri **transparent déclaré** (proposition : par réserves quote-vault décroissantes parmi C1∧C2∧C3 satisfaits), **jamais** un composite. **Deux colonnes de coût (leçon advisor, honnêteté) :**
- **M1 — coût full-mint** (métrique littérale de la mission) = `⌈n_sig/1000⌉×10 cr` + durée : tirer **tous** les corps du mint (grade -b3d-crosscheck) — **borne haute conservatrice**, pas le chemin d'ajout.
- **M2 — coût d'ajout réel décomposé** (décision-utile) : (a) découverte du pool fondateur (**~575 cr/mint mesuré** : -b1-bis-i ~2 302 cr pour 4 mints, `CHANTIERS:193` — la mesure, pas le plafond ≤ 20 k autorisé `CHANTIERS:190`), (b) course sur le **POOL** dans la fenêtre Cong (pas l'historique complet du mint), (c) re-décodage d'autorité partagée (~0 cr si `authority==S7vYFF`, sinon un scan). M2 ≪ M1 pour les mints à autorité partagée — **présenter M1 seul ferait refuser tous les ajouts** (5,4 M/4 mints). M2 précis par symbole = ADR d'ajout.

---

## 4. Livrables, tuyaux, upcoming, tests non-LLM, R-25, découpe

### 4.1 Livrables (liste fermée ; CA-11 durci : composition EXÉCUTÉE depuis l'artefact)
| # | Sous-lot | Fichier | Contenu | Test / oracle (nommé ; regex sur source proscrite) |
|---|---|---|---|---|
| L-1 | -iii-a | `apps/bell/src/universe.ts` (neuf) | `enumerateUniverse` (core pur : liste émetteur injectée + confirmations on-chain → candidats identité-confirmée) + sampler HTTP injecté (offline-testable) ; `--universe` de `runMain` | `bell_universe_enumerates_from_issuer_list_and_onchain` (liste + stub getAccountInfo → owner≠Token-2022 ⇒ `identity_unconfirmed`) ; mutant : identité admise sans confirm on-chain ⇒ rouge |
| L-2 | -iii-a | `apps/bell/src/liquidity-rank.ts` (neuf) | core pur de classement : seuils pré-enregistrés C1-C7 → liste ordonnée + `below_threshold` publié ; **aucun composite** | `bell_liquidity_rank_thresholds_and_below_threshold_published` ; mutants : composite introduit ⇒ rouge ; below-threshold dropé en silence ⇒ rouge |
| L-3 | -iii-a | `universe.ts` + `assertNoPrice` | **anti-close** : strippe `price\|price_usd\|base_token_price\|quote_token_price` de l'artefact | `bell_universe_artifact_has_no_price_field` ; mutant : champ prix laissé ⇒ rouge |
| L-4 | -iii-b | `apps/bell/src/universe-count.ts` (ou extension `discover.ts`) `countSignatures` + `--count-signatures` de `runMain` | gSFA paginé capé (1 cr) ; ÉPUISÉ⇒`n_sig` exact + coût full-mint exact ; CAP⇒plancher+débit ; `--ledger` partagé | `bell_signature_count_paginates_and_projects` ; `bell_signature_count_budget_fail_closed` (budget ⇒ `BudgetExceededError`, partiel jamais présenté complet) ; `bell_universe_credits_recomputed` (`credits==gSFA×1+getAccountInfo×1`, mutant `×1→×10` rouge — C-G2-3) |
| L-5 | -iii-a/-b | `crosscheck-*.json`/`universe-*.json` (réduits, hors R-25) + `PROVENANCE-univers-solana.md` same-dir (compté) + `docs/MESURE-UNIVERS-SOLANA-…md` | artefacts réduits + rapport (M1/M2, [lu]/[abs]) ; ToS collé en PROVENANCE ; opérateurs par domaine seul | `series_pinned_are_declared_and_hashed`, `no_secret_in_repo` verts |
| L-6 | -iii-a/-b | `docs/PLI-lot-t1a-iii.md` + prereg | PLI (R-25 par livrable, sha, **seuils/critères committés SEUL avant tout appel**, budget, ledger, procurements ToS) | ADR/PLI = docs |

### 4.2 Tuyaux (ADR-M018 D3 ; entrée / sortie / état / test) — règle de Branchement
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| liste émetteur + confirm on-chain → univers candidats | `api.xstocks.fi/public/assets` (keyless, ToS [lu]) + `getAccountInfo` quorum-2 keyless | `universe-candidates.json` (identité confirmée) | **upcoming** | `bell_universe_enumerates_from_issuer_list_and_onchain` |
| API DEX/Gecko (liquidité) + on-chain réserves → colonnes de classement | Raydium/Orca/GeckoTerminal (ToS [lu]) + vault quote keyless | champs liquidité/volume (**prix strippé**) | **upcoming** | `bell_universe_artifact_has_no_price_field` |
| candidats + critères pré-enregistrés → liste CLASSÉE | `universe-candidates` + seuils (prereg) | classement ordonné + below-threshold publié | **upcoming** (consommateur servi = décision investisseur ajouts) | `bell_liquidity_rank_thresholds_and_below_threshold_published` |
| gSFA par mint (Phase B) → coût full-mint + durée | gSFA Helius archive (mono-opérateur, budget) | `crosscheck-signatures.json` (M1, durée, authority) | **upcoming** | `bell_signature_count_paginates_and_projects`, `bell_signature_count_budget_fail_closed` |
| liste CLASSÉE → décision investisseur ajouts | classement + M1/M2 | décision investisseur → **ADR d'ajout par symbole** (lot ultérieur) | **item à déclencheur** | (décision hors code) |

### 4.3 Ce qui reste `upcoming`
**Tout.** Bell reste **absent** de `fleet.ts`/README/site/skills/export (registre EXACT dans les deux sens, `CARTOGRAPHIE…passe2:114-124`). Aucune pièce -iii n'a de chemin servi ; consommateurs = tests non-LLM + décision investisseur (item à déclencheur, calque « retrait pending » -b3d). Bell n'est « built » qu'à T-1b.

### 4.4 Estimation R-25 (≤ 1 205) et découpe
| Sous-lot | Pièces (brut) | ×1,5 | Note |
|---|---|---|---|
| **-iii-a** | `universe.ts` ~120 + `liquidity-rank.ts` ~90 + `assertNoPrice`/CLI ~25 + tests ~240 + PROVENANCE ~40 ≈ **~515** | **~770** | offline + keyless, 0 Helius |
| **-iii-b** | `universe-count.ts` ~70 + `--ledger`/CLI ~20 + tests ~160 + PROVENANCE ~40 ≈ **~290** | **~435** | Helius, budget pré-enregistré |
Les deux **< 1 205** avec marge. **Découpe retenue = 2 sous-lots** (naturellement séparés par le gate Phase A/B) ; -iii-a fusionné avant -iii-b. Seam interne `-iii-a` non attendu (< 1 205). Pathspec R-25 `STAT=` : `docs/**/*.md` exclus ; `series/**/*.{json,jsonl,csv}` exclus ; **PROVENANCE `.md` sous `series/` compté**.

---

## 5. Risques (MAST), biais, anti-close, décision 69, secrets

| Mode MAST | Menace | Contre-mesure |
|---|---|---|
| Dérive de spéc | agrégateur pris pour source d'identité | identité = API émetteur + **confirm on-chain** requis (C1) ; mutant « identité sans on-chain » rouge |
| Vérification incorrecte | liquidité d'agrégateur publiée comme vérité produit | agrégateur = **ranking only, jamais publié** (décision 68) ; produit = 1re main |
| Vérification incomplète | prix de token laissé dans l'artefact | **anti-close** `assertNoPrice` (L-3) + mutant ; diff anti-close au checkpoint-2 (`CHANTIERS:174,182`) |
| Terminaison prématurée | signature-count capé présenté exact | fail-closed cap + distinction **exact/plancher** + `BudgetExceededError` re-levé |
| Sur-déclaration de couverture | « voici l'univers » | liste = **candidats d'UN émetteur (xStocks)** + autres à qualifier ; incomplétude déclarée (811 multi-chaîne, sous-ensemble Solana confirmé) |
| Rétention d'info inter-agents | [abs]/[2nd] remonté en [lu] | niveaux figés ; chiffres du dépôt cités `fichier:ligne` |
| Confusion d'unités (calls/crédits) | plafond en appels ≠ crédits | **leçon C-G2-1** : Phase B pure 1-cr ⇒ `--max-calls==plafond` ; `credits_recomputed` testé + mutant `×1↔×10` |
| Sur-déclaration CA-11 | tuyau « branché » par regex | tests **exécutent la composition depuis l'artefact** ; Bell `upcoming` |

- **Biais de sélection** `issuer_selection_bias` : un univers classé par liquidité est un **choix déclaré** (le critère de tri est écrit) ; couvrir xStocks d'abord est un **choix d'émetteur déclaré** (autres à qualifier). Décision 80 : tout ajout est publié pour tous ; le **fait qu'un symbole a été demandé** est un résiduel de biais déclaré.
- **Anti-close** : ce lot ne calcule aucune g_t et ne lit **aucune valeur** de close ; C2 teste l'**existence** d'un close via `exchange.mic` (première main, gratuit, aucun nom de fournisseur), jamais une valeur. `assertNoPrice`/`CLOSE_KEY` gardent tout artefact.
- **Décision 69** : aucun nom de fournisseur de recoupement cash sur une surface/source **exporté** — ce lot n'en cite aucun (C2 via MIC, pas via un fournisseur) ; le test racine **non exporté** (`CHANTIERS:222`) reste vert.
- **Secrets** : Phase A **keyless** (issuer/Gecko/Raydium/Orca sans clé ; RPC keyless) ⇒ 0 secret ; Phase B clé Helius du scope User, jamais loggée ; `no_secret_in_repo` étendu au motif UUID Helius (`ADR-T1aii:9`) ; opérateurs par **domaine seul** ; bruts/ledger hors dépôt.

---

## 6. Questions ouvertes (checkpoint-1) et procurements formés

### Questions (le validateur tranche AVANT tout code)
- **Q1 — N (top-N Phase B)** : proposition **N = 20** (calque décision 45 « top 20 par chaîne », `CHANTIERS:104`), extensible en lots suivants. Confirmer/ajuster.
- **Q2 — cap gSFA par mint `C_page`** : proposition **≤ 2 500 pages** (≤ 2,5 M signatures comptées exactes avant plancher ; ≤ 625 s/mint à 4 appels/s). Confirmer.
- **Q3 — genesis d'un mint capé** : (a) plancher + débit récent seulement (recommandé, Phase B pure 1-cr) ; (b) +1 page gTfA asc/mint capé (10 cr) pour un N projeté (réintroduit du 10-cr ⇒ `--max-calls=plafond/10`). Trancher.
- **Q4 — seuils C4** `T_liq`/`T_vol` : à fixer au PLI **avant** la donnée (pas de fixation post-hoc — pré-enregistrement ; fixer un seuil APRÈS avoir vu la distribution qu'il filtre est précisément interdit). Proposition **structurelle non circulaire** : `T_liq` = réserves quote-vault ≥ **le minimum des 4 pools fondateurs courants** (`FOUNDING_POOLS`, `pools.ts:166-179`, ancre mesurable au dépôt) ; `T_vol` = plancher USD fixe à **arbitraire déclaré**. Confirmer/ajuster.
- **Q5 — plafond de coût par symbole C7 `T_cost`** : proposition **≤ 100 000 crédits/symbole** = « abordable au plan courant ». Lie l'ADR d'ajout futur ; confirmer.
- **Q6 — plafond crédits Phase B + cumul cycle** : proposition **≤ 50 000 crédits Helius** (fail-closed, `--ledger` partagé). Cumul cycle pire cas = **7 528 946** (-b3d, `F:\Monark-wt-bellb3d\docs\G0-lot-t1a-ii-b3d.md:96`) **+ ≤ 50 000 = ~7,58 M / 10 M** (marge ~2,42 M ; quota inclus 10 M, `G0-b3d:97`). **Ratification investisseur** (budget).
- **Q7 — ordonnancement vs -b1-bis-ii** : -b1-bis-ii (course g_t ≤ 1 M, ratifiée Q5 décision 66, `CHANTIERS:178`) est **plus prioritaire produit** ; -iii-b (≤ 50 k) s'intercale sans l'affamer, mais confirmer l'ordre (avant/après -b1-bis-ii) et si -iii-b tient dans le cycle 19 sept→19 oct ou après bascule.
- **Q8 — (iii) ScaledUiAmount en Phase A keyless vs Phase B Helius** : recommandation **Phase A keyless** (état courant, 0 Helius). Confirmer que le quorum-2 keyless est acceptable pour un fait d'état.
- **Q9 — périmètre émetteurs** : recommandation **xStocks seul en -iii** (identité établie première main) ; Backpack/Sunrise, Superstate, Remora = **qualification ultérieure** conditionnée aux lectures d'émetteur (PR-U-* ci-dessous). Confirmer.

### Procurements formés (doc 03 — identité complète, usage, tentatives ; zéro dette nue)
**Lectures ToS (missions lecteur Sonnet 5, prérequis [lu] AVANT le premier appel de -iii-a — calque PR-B-SETAUTH `G0-b3d:32`)** :
- **PR-U-GECKOTERMINAL-TOS** — GeckoTerminal API publique (`api.geckoterminal.com/api/v2`, doc `geckoterminal.com`) : licence, quotas (rate-limit), attribution, **interdiction de redistribution**. Tentatives : non lu (mission « aucun appel réseau »). Usage : autoriser l'entrée de classement liquidité/volume (Phase A ii, Tier 2). Fichier : `docs/biblio/bell/L-lecture-geckoterminal-tos-<date>.md`.
- **PR-U-RAYDIUM-TOS** — Raydium API (`api-v3.raydium.io`) : termes/limites/attribution. Usage : énumération DEX-native des pools + tvl/volume (Phase A ii, Tier 1). Fichier idem motif.
- **PR-U-ORCA-TOS** — Orca API (pools `whirLbMii…`) : **existence de l'API HTTP publique à ÉTABLIR par la lecture** ; sinon énumération on-chain par `getProgramAccounts` sur `whirLbMii…` (coût keyless à mesurer). Termes/limites si l'API existe. Usage : énumérer les pools Orca des candidats (SPYx/NVDAx fondateurs y sont, `pools.ts:172,175`). Fichier idem.
- **PR-U-XSTOCKS-API-TOS** — API émetteur `api.xstocks.fi` : établie publique sans clé (`L-lecture…:277-280`), mais termes de **redistribution/attribution non lus**. Usage : source d'identité de l'univers (Phase A i). Fichier idem (léger : donnée non publiée).
- **PR-U-REMORA** (conditionnel Q9) — document d'émetteur Remora donnant les adresses de mint Solana : site non atteint (décision 82) ; usage = qualifier Remora ; propriétaire orchestrateur → lecteur.

**Renvois (déjà au dossier, non re-procurés)** : Helius (clé posée, `CHANTIERS:52`) ; Databento EQUS.SUMMARY « All stocks and ETFs » +24 h (décision 53, `CHANTIERS:118`) = confirmation secondaire de close pour l'**ADR d'ajout**, pas pour C2 (C2 = MIC première main) ; PR-B-DBN #8 (page licence EQUS.SUMMARY, `CHANTIERS:72`) inchangé. **Aucun procurement Ondo** (hors périmètre, décision 81).

---

## 7. Faits mesurés [lu] qui fixent la méthode (fichier:ligne)
1. **Univers actuel = 4 mints** : `pools.ts:90-99` (XSTOCKS TSLAx/SPYx/NVDAx/AAPLx), `FOUNDING_POOLS` `pools.ts:166-179`.
2. **API émetteur publique sans clé, adresses == on-chain** : `L-lecture-xstocks…:81-88` (match caractère-pour-caractère), `:276-291` (endpoints, `security:[]`), `:282-283` (pageSize 100), `:407` (pagination non alphabétique ⇒ épuisement), `:91-93` (Token-2022 + Scaled UI prose), `:149-154` (`exchange.mic` par sous-jacent : TSLAx XNAS, SPYx ARCX, NVDAx XNAS, AAPLx XNAS).
3. **Provenance load-bearing = on-chain** : `pools.ts:3-7`, `L-lecture…:44-57`.
4. **Extraction Solana agnostique au programme (vault delta)** : `pools.ts:40-42` ; carte DEX committée = raydium-clmm seul `pools.ts:74-76` ; `whirLbMii…`=`unknown-program` `pools.ts:172,175` ; USD-stable `pools.ts:80`.
5. **Coûts unitaires** : gTfA **10 cr**, `getTransaction` **1 cr**, gSFA **1 cr**, Chainstack ~1 RU (`F:\Monark-wt-bellb3d\docs\G0-lot-t1a-ii-b3d.md:24` ; `CHANTIERS:122`). Recompute crédits existant : `discover.ts:248` (gTfA×10 + reste×1).
6. **Budget fail-closed (compteur d'APPELS)** : `collect.ts:296-298` (`makeBudgetedCall` `n+=1`), `:430-432` (`--max-calls` requis >0), `:423`/`:563` (`--min-interval 250` ⇒ 4 appels/s) ; `BudgetExceededError` re-levé `quorum.ts:24,90`.
7. **Leçon calls vs crédits + `budget.json` par `--out`** : `F:\Monark-wt-bellb3d\docs\G2-lot-t1a-ii-b3d-a.md:23-42` (C-G2-1) ; mutant `credits_recomputed ×1` **survivant** `:68-74,:117` (C-G2-3).
8. **Cumul cycle -b3d pire cas 7 528 946 / 10 M** : `G0-b3d:96` ; Helius 5 $/M, autoscaling off, arrêt système à 10 M `G0-b3d:97` ; cycle 19 sept→19 oct ; -b1-bis-ii ≤ 1 M ratifié `CHANTIERS:178`.
9. **Autorité partagée `S7vYFF…` couvre tous les 43/x xStocks (re-décodage bon marché)** : `G0-b3d:102`, ADR-T1aii D1-quater (`:226-234`).
10. **Providers keyless (0 Helius pour l'état courant)** : `operators.ts:18-19` (solana-foundation, publicnode), `:20,23,26` (pocket, drpc, ankr) ; quorum-2 `quorum.ts:71-104`, distinctness par opérateur `operators.ts:30`.

## 8. Budget et ordonnancement (résumé)
- **Phase A (-iii-a)** : **0 crédit Helius** (keyless + HTTP public) ; borné `--min-interval` ; repli top-N si rate-limit public.
- **Phase B (-iii-b)** : **≤ 50 000 crédits Helius** (Q6, fail-closed, `--ledger` cumulatif partagé) ; cumul cycle pire cas ~7,58 M/10 M ; **APRÈS** checkpoint-2 -b3d-a + sonde -b3d (décision 82) ; ordonnancement vs -b1-bis-ii = Q7. **Dépense $ nouvelle seulement si autoscaling activé** (à reconfirmer au dashboard, `G0-b3d:97`) ; sous plafond, **0 $ nouveau**.

## 9. Rôles
Checkpoint-1 validateur `claude-fable-5-1` **avant tout code** (ce document ; Q1..Q9). Lectures ToS PR-U-* (lecteur Sonnet 5) **avant** le premier appel réseau de -iii-a. Prereg (seuils C1-C7 + méthode Phase B) **committé seul** par l'orchestrateur avant le worker. Worker Opus 4.8 max : plumbing offline + Phase A keyless (-iii-a) gelé et mesuré d'abord → G2 fraîche → checkpoint-2 → G7 → fusion ; **puis** -iii-b (Helius, sous `--max-calls` adossé au ledger, après le gate) → G2 → checkpoint-2 (re-exécution CA-9 : rejeu du classement hors ligne + vérif `ledger_sha256`) → G7 (orchestrateur, verdict + `error_origin`) → fusion `--no-ff`. **Le worker ne committe jamais, ne déclenche aucun workflow (R-20)** ; sortie vérifiée adversarialement (R-21).

## 10. Sources
- **Dépôt (première main, `fichier:ligne`)** : `apps/bell/src/{pools,discover,collect,quorum,operators}.ts` ; `docs/CHANTIERS.md` (décisions 45,53,55,66,67,68,69,80,81,82) ; `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md` ; `docs/adr/ADR-B0-programme-bell.md` ; `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` ; `docs/CARTOGRAPHIE-BELL-passe2-2026-09-20.md` ; `docs/CENSUS-ACTIONS-TOKENISEES-v4-2026-09-20.md` (archive, décision 68 — non consommé comme chiffre porteur) ; worktree `F:\Monark-wt-bellb3d\docs\{G0-lot-t1a-ii-b3d.md, G2-lot-t1a-ii-b3d-a.md}`.
- **[abs]/à mesurer** : tous les seuils/plafonds/N/cap (Q1-Q6) = propositions ; distributions de liquidité/volume/signatures = à mesurer aux Phases A/B ; ToS des API tierces = PR-U-* [à lire].
