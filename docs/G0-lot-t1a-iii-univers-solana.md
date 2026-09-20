# G0 — Sprint backlog lot T-1a-iii (Bell) : mesure de l'univers Solana élargi — liste CLASSÉE de candidats à ajouter à l'univers Bell du release, par mesure API de première main

Rédaction worker `claude-opus-4-8[1m]` effort max, 2026-09-20 ; **PLIÉ post-checkpoint-1** par le worker RÉDACTEUR `claude-opus-4-8[1m]` (les corrections B-1..B-11 / NB-1..NB-8 / défauts de faits (a)-(h) de l'avis `claude-fable-5-1` du 2026-09-20 21:45→21:54 UTC, artefact `ec0f422` sha `bce6ad32…`, sont pliées dans le corps ; table de traçabilité en §11). **R-20** : le worker ne committe pas, ne déclenche aucun workflow (l'orchestrateur portera ce pli et l'amendement d'ADR §10). **R-21** : sortie vérifiée adversarialement — chaque chiffre vient d'un fichier du dépôt (cité `fichier:ligne` ; les citations **corrigées au checkpoint-1 ont été RÉ-OUVERTES et lues** par le rédacteur, les citations **héritées du G0 `ec0f422` sont reportées inchangées, non ré-vérifiées**) ou est marqué **« proposition (Q) »** / **« à mesurer au PLI »**. **AUCUN appel réseau** ; aucune clé/URL ; aucun close ni prix en clair. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, non banni, effort max). **Q6/Q7/Q9 restent EN ATTENTE DE DÉCISION INVESTISSEUR** (aucune réponse présumée).

**Cadre (décisions investisseur, `docs/CHANTIERS.md`)** : **décision 82** (l.241, verbatim « oui forme le lot de mesure univers solana élargi ») forme ce lot ; fait [lu] première main : `xstocks.fi/products` liste **811 produits** (2026-09-20, l.241) — **[cp1 défaut h / NB-6]** ce 811 est un **compte produits publié**, PAS un fait « multi-chaîne » ; sa répartition Solana est **à MESURER** par l'énumération Phase A (§2), non inférée. **Amendement de la décision 82** (l.244-245, commit `001750e`, **[cp1 B-10]**) : verbatim investisseur « pourquoi tu ne veux pas le faire maintenant? » ⇒ la **Phase A (0 crédit Helius) est lançable dès ce G0 plié + le pré-enregistrement committé**, sans attendre la sonde -b3d ; le « APRÈS la sonde -b3d » ne vaut plus que pour la **Phase B**, qui reste **après la FUSION de -b3d-a + la sonde -b3d**. **Décision 68** (l.199-200) : toute DONNÉE vient d'une mesure de première main ; un article ne fournit qu'une MÉTHODE, jamais un chiffre porteur. **Décision 80** (l.228) : tout symbole ajouté est TOUJOURS mesuré et publié pour tous (biais de sélection déclaré). **Décision 81** (l.240) : Ondo **hors périmètre release**. **Décision 69** (l.208, l.222) : aucun nom de fournisseur de recoupement cash exporté. **CA-11 durci** (l.212, l.182) : un tuyau n'est « branché » que si un test d'intégration non-LLM **EXÉCUTE la composition depuis l'artefact d'entrée**.

**Rattachement** : ADR-B0 (D1 « mesure, pas trade » ; D2 faits i-iv ; **D5 mutants/`gate:vocab`** scope `apps/bell`, `ADR-B0:49` ; **D6 sources/coûts (R-8)**, `ADR-B0:52` ; ESC-1 c close jamais republié) ; ADR-T1aii (D1-quater rebase ScaledUiAmount, autorité partagée `S7vYFF…` ; C-9 carte opérateur ; C-10 hygiène de clé ; amendements datés D1-bis..D1-sexies avec section « Tuyaux ») ; leçon **C-G2-1 -b3d-a** (unité APPELS vs CRÉDITS ; `budget.json` par `--out`) ; `apps/bell/src/pools.ts`, `discover.ts`, `collect.ts`, `quorum.ts`, `operators.ts`, `digest.ts` ; `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md`.

## Isolation
`apps/bell/**` seulement (+ ADR/PLI/G0 docs + `docs/biblio/bell/`). Un worker, un worktree neuf par sous-lot. **[cp1 B-4]** Point d'entrée CLI **dans un FICHIER NEUF** (jamais `runMain` de `collect.ts`) : **aucune modification de `collect.ts` tant que -b3d-a n'est pas fusionné**. **Ne touche pas** CHANTIERS/JOURNAL (garde d'écriture orchestrateur), ni un `apps/bell/**` d'un autre lot en vol, ni le gate live -b3d/-b1-bis-ii au-delà de l'ajout de fichiers neufs.

## Nom de lot — `T-1a-iii` (vérifié LIBRE)
`t1a-iii`, `T-1a-iii`, `-iii-`, `iii-a`, `iii-b` : **0 occurrence** comme nom de lot dans `docs/`. Sous-lots : **`-iii-a`** (Phase A, zéro Helius), lui-même scindé par un seam PRÉ-DÉCLARÉ (**[cp1 B-11]**) en **`-iii-a1`** (identité + `ScaledUiAmount`, première main seule) puis **`-iii-a2`** (liquidité + classement) ; **`-iii-b`** (Phase B, Helius). T-1a-i (clos), T-1a-ii (course fondatrice des 4 mints), **T-1a-iii = extension de l'univers**.

## Objectif (une phrase)
Produire une **LISTE CLASSÉE de candidats xStocks Solana** à ajouter à l'univers Bell (aujourd'hui 4 mints : TSLAx, SPYx, NVDAx, AAPLx, `pools.ts:90-99`), par **mesure API de première main** — pour chaque candidat : adresse publiée par l'émetteur **== mint on-chain**, présence d'une clôture de référence, **solde du vault quote en USD (`quote_vault_balance_usd`, première main)** et volume tiers (triage), extension `ScaledUiAmount` (+ autorité), programme du pool, et **coût de collecte** — afin que l'investisseur tranche les ajouts (décision 80). **[cp1 B-2]** le mot « profondeur » est proscrit : la métrique de liquidité est le **solde on-chain du vault quote**, jamais une « profondeur » dérivée.

---

## 1. Périmètre et NON-périmètre

### 1.1 Émetteurs
| Émetteur | Traitement dans -iii | Motif (fichier:ligne) |
|---|---|---|
| **xStocks (Backed Assets (JE) Ltd)** | **DANS le périmètre, cœur du lot** — identité établie de première main | API émetteur publique sans clé `api.xstocks.fi/api/v2/public/assets`, adresses Solana == `pools.ts` caractère-pour-caractère (`L-lecture…:81-88`) ; « SPL Token-2022 + Scaled UI » (prose émetteur, `…:91-93`) |
| **Backpack Securities + Sunrise** | **À QUALIFIER — hors -iii-a/-b, item formé** : lecture d'un document d'émetteur donnant les adresses de mint Solana AVANT toute mesure | census v4 : droits « supported but not yet enabled » (`CENSUS…v4:14`) ; adresses de mint **NON TROUVÉES** (`CENSUS…v4:59`) ⇒ pas de mesure sans identité première main ; **[cp1 B-6]** procurement **PR-U-BACKPACK** formé (§6) |
| **Superstate Opening Bell** | **À QUALIFIER — hors -iii-a/-b, item formé** : idem (Superstate = transfer agent) | `CENSUS…v4:13,59` ; adresses Solana non établies première main ; **[cp1 B-6]** procurement **PR-U-SUPERSTATE** formé (§6) |
| **PreStocks** | **HORS mesure d'écart, déclaré** : pré-IPO, **pas de clôture boursière** ⇒ l'écart hors séance `g_t` n'est pas définissable | `CENSUS…v4:15` (« no NMS stock underlying ») ; **[cp1 défaut f]** **décision 82** (`CHANTIERS:241`, verbatim « PreStocks (pré-IPO : pas de clôture boursière ⇒ hors mesure d'écart, à déclarer) ») — l'ancienne mention « décision 40 (`CHANTIERS:49`) » est retirée : `décision 40` n'est qu'un renvoi minuscule interne à la ligne census v3 (l.49, l.126), **jamais une décision investisseur formée** ; critère C2 échoue par construction (pas de MIC) |
| **Remora** | **ITEM FORMÉ, aucune hypothèse** : aucun fait de première main (site non atteint) | décision 82 (`CHANTIERS:241`) ; procurement PR-U-REMORA si l'investisseur veut le qualifier |
| **Ondo** | **HORS périmètre** (décision 81) | `CHANTIERS:240` ; réouverture = entrée d'Ondo dans le périmètre Bell |

### 1.2 NON-périmètre (ce que -iii NE fait PAS)
- **N'ajoute AUCUN symbole** à `pools.ts` : ce lot **MESURE et CLASSE**. L'AJOUT effectif est un **lot ultérieur à chiffrer PAR SYMBOLE**.
- **Ne calcule aucune g_t**, ne touche aucun close, ne fait aucun scan full-mint des corps.
- **Ne publie rien** de la donnée de liquidité/volume/prix des API tierces (classement seulement — décision 68) ; **[cp1 B-11]** la donnée tierce et les bruts **vivent HORS dépôt**, sha-pinnés sous `F:\PRODUITS\`.
- **Ne résout PAS** la carte DEX `whirLbMii…` (`unknown-program`) : reprise -b1-bis-ii déjà formée (`CHANTIERS:220`) ; -iii **hérite** du label et le **déclare** (§3 C5).
- N'aborde ni EVM, ni autres chaînes (Solana seulement, décision 82).

---

## 2. Deux phases séparées par un gate (checkpoint entre -iii-a et -iii-b)

### Phase A — `-iii-a` : ZÉRO crédit Helius, **lançable dès le checkpoint-1** (amendement décision 82, l.244-245) — offline + réseau keyless/HTTP public

**(i) Univers + identité (émetteur == on-chain).**
- **Document qui fait foi** : API émetteur publique **sans clé** `GET https://api.xstocks.fi/api/v2/public/assets` (`security: []` ; pageSize max **100**, serveur le fait respecter ; `L-lecture…:282-283`), **paginée à ÉPUISEMENT** (le tri `?network=Solana` n'est **pas** alphabétique — les 4 mints connus sont **absents des 700 premiers actifs** ⇒ épuisement OBLIGATOIRE, `L-lecture…:407`). **[cp1 NB-2]** Le filtre Solana est appliqué **CÔTÉ CLIENT sur `deployments[].network`** (`L-lecture…:81-88,309-320`), **jamais** en se fiant à un filtre serveur : les filtres serveur `underlyingType`/`listingCountry` rendent des listes vides (`L-lecture…:409`). **[cp1 défaut h / NB-6]** Le **811** (décision 82) est un compte produits publié ; sa répartition Solana est le **résultat mesuré** de cette énumération, jamais une hypothèse « multi-chaîne ».
- **Lier symbole → mint SANS agrégateur seul** : l'API émetteur donne l'adresse ; **confirmation on-chain de première main** `getAccountInfo.owner == Token-2022` (`TOKEN_2022_PROGRAM`, `pools.ts:69`) + décimales, **sous quorum-2 keyless**. Owner ≠ Token-2022 ⇒ `identity_unconfirmed` (exclu, publié). Méthode load-bearing (`pools.ts:3-7` ; `L-lecture…:44-57,101-102`).
- **Providers keyless (0 Helius)** : quorum-2 sur opérateurs distincts `solana-foundation` (`api.mainnet-beta.solana.com`, `operators.ts:18`) + `publicnode` (`operators.ts:19`) ; `getAccountInfo` d'**état courant** n'exige **aucune** profondeur d'archive. **[cp1 défaut e]** Repli si un keyless manque : `drpc` (`operators.ts:24`), `ankr` (`operators.ts:26`), `pocket` (`operators.ts:20`) — **`operators.ts:23` = llamarpc (EVM), n'est PAS drpc**. **[cp1 B-6]** conditions de `api.mainnet-beta.solana.com`/publicnode = procurement **PR-U-SOLANA-PUBLIC-RPC** (prérequis du premier appel keyless).

**(ii) Liquidité par API PUBLIQUE gratuite (`quote_vault_balance_usd` de première main + volume de triage ; jamais publié). — sous-lot -iii-a2**
Sources candidates, chacune **précédée de sa lecture ToS [lu]** (procurements PR-U-\*, §6). **[cp1 B-5]** Une **ALLOWLIST D'HÔTES** dans le sampler HTTP, **alimentée UNIQUEMENT par le PLI après lecture des conditions** (avec **mutant** : hôte hors allowlist ⇒ refus) ; **tous les GET publics passent par `tick()` du même budget** (`makeBudgetedCall` de main l'expose déjà, `collect.ts:296,305`).
- **Tier 1 (préféré, décision 68) — API DEX-natives + confirmation on-chain** : Raydium `api-v3.raydium.io` (`pools.ts:116-131`) et Orca (pools `whirLbMii…`) pour **énumérer les pools** par mint, **puis** lecture on-chain **keyless** du **solde du vault quote** (`getAccountInfo`) = **`quote_vault_balance_usd`** de première main (0 Helius). **[cp1 NB-3]** biais d'énumération par API de DEX **déclaré** (l'ensemble des pools vus dépend du DEX interrogé).
- **Tier 2 (triage) — GeckoTerminal API publique** `api.geckoterminal.com/api/v2` (`pools.ts:107,136`) : volume 24 h agrégé — **agrégateur déclaré**, **colonne de triage** seulement, jamais publié, jamais source d'identité (`CHANTIERS:136`).
- **DexScreener : EXCLU** (`CHANTIERS:136`).
- **ANTI-CLOSE (bloquant). [cp1 B-11]** L'artefact de classement est **CONSTRUIT PAR ALLOWLIST DE CHAMPS**, **jamais par strip** : seuls des champs explicitement autorisés entrent (`quote_vault_balance_usd`, volume 24 h USD, décomptes, adresses, `scaled_ui`, `authority`, MIC, `quote_class`, `dex`). **Aucun couple de champs dont le ratio donne un prix** n'est admis ensemble (attention `fdv_usd`, `market_cap_usd`, **solde base + solde quote**). La garde existante **`assertNoClose`/`CLOSE_KEY` (`digest.ts:33,38`, ADR-B0 D5)** — **[cp1 défaut d]** elle vit dans `digest.ts`, **pas** dans `pools.ts` — reste en ceinture-et-bretelles sur l'artefact committé (mutant : champ prix laissé ⇒ rouge). **[cp1 B-11]** avant lecture des conditions, **seuls les champs on-chain sont committables** ; la donnée tierce est sha-pinnée hors dépôt (`F:\PRODUITS\`) ; fixtures **synthétiques seulement**.

**(iii) Extension `ScaledUiAmount` (+ autorité) — 1 `getAccountInfo` par mint. — sous-lot -iii-a1**
- **En Phase A, 0 crédit Helius** : `getAccountInfo(jsonParsed)` sous **quorum-2 keyless** (mainnet-beta + publicnode) lit `scaledUiAmountConfig{multiplier, newMultiplier, effTs, authority}` (état courant ; `ADR-T1aii:30` C-4). **Enregistrer `authority`** : `authority == S7vYFF…` ⇒ trajectoire de rebase **déjà énumérée** par -b3a/-b3d (re-décodage ~0 crédit, `G0-b3d:102`) ; `≠` ⇒ **scan d'autorité dû** (coût d'ajout supérieur). **Fail-closed** : quorum raté ⇒ `scaled_ui_unread` (résidu, jamais deviné) — **[cp1 Q8]** recommandation Phase A keyless **acceptée sous quorum-2 avec `scaled_ui_unread` fail-closed**.

**Sortie -iii-a** : artefact `universe-candidates-<date>.json` (identité confirmée + `quote_vault_balance_usd` + volume de triage + `scaled_ui` + `authority` + programme + `quote_class` + MIC, **construit par allowlist de champs, sans aucun prix**) + `docs/MESURE-UNIVERS-SOLANA-<date>.md` (rapport, chiffres avec unité, [lu]/[abs]). **Bornage réseau (0 crédit ≠ 0 budget)** : confirmation on-chain = plusieurs centaines × 2 appels keyless — **débit borné `--min-interval` + `--max-calls`** (`makeBudgetedCall` compte des APPELS, `collect.ts:296-298`), retry/backoff, **0 Helius** ; **déclencheur de repli PRÉ-ENREGISTRÉ** (HTTP 429 / seuil de 429 consécutifs, fixé au PLI) ⇒ confirmer d'abord le **top-N par `quote_vault_balance_usd`**, le reste à la promotion (déclaré).

### GATE (checkpoint entre A et B)
G2 fraîche + checkpoint-2 de -iii-a (offline + rejeu keyless, brut sha-pinné sous `F:\tmp\cp2-t1a-iii-a\`, **[cp1 B-8]**), **puis** -iii-b lancé **seulement après** : (1) le **checkpoint-2 de -b3d-a**, (2) la **FUSION de -b3d-a** (**[cp1 B-4]** : -iii-b consomme `readPriorCalls`/`--max-credits` qui n'existent que dans le worktree -b3d), et (3) la **sonde -b3d**. Amendement décision 82 (l.244-245) : Phase B après fusion -b3d-a + sonde.

### Phase B — `-iii-b` : crédits Helius, APRÈS le gate — **lancement SUSPENDU à ESCALADE-INVESTISSEUR (Q6, Q7)**

**Objet** : pour les **N premiers candidats** (top-N par `quote_vault_balance_usd`, N pré-enregistré, Q1), mesurer le **nombre de signatures par mint** ⇒ **coût full-mint**.
- **Primitive** : `getSignaturesForAddress` (gSFA) = **1 crédit/appel**, ≤ 1000 signatures/page (`G0-b3d:24`) — **archive requise** ⇒ **Helius mono-opérateur** (résiduel déclaré). Réutilise le pager gSFA (`rpc.ts`, cité `G0-b3d:28`) **par import lecture seule** ([cp1 B-4] fichier neuf).
- **Par candidat** : paginer gSFA jusqu'à un **cap par mint `C_page`** — **[cp1 Q2 / B-7 / NB-4]** `C_page` **≤ 2 000 pages** ou **deux paliers** (K pages de débit pour tous ; épuisement seulement si projection < cap ; **N=20 × 2 500 = 50 000 ne laisse AUCUNE marge**). **ÉPUISÉ sous le cap** ⇒ `n_sig` **exact** ⇒ coût full-mint exact = `⌈n_sig/1000⌉ × 10 cr` (gTfA `full`, 10 cr/page, `G0-b3d:24`) + durée = `⌈n_sig/1000⌉ / 4` s. **CAP atteint** ⇒ **[cp1 NB-7]** publier **`n_sig ≥ C_page×1000` (plancher) + débit récent** ; **le coût par symbole N'EST PAS livré pour un mint capé** ; N exact et coût projeté **DÉFÉRÉS à l'ADR d'ajout**.
- **Méthode & budget — [cp1 B-7 + défaut c + défaut g].** **Allowlist de MÉTHODES dans le chemin d'appel** : toute méthode hors **`{getSignaturesForAddress, getAccountInfo}`** ⇒ **`BudgetExceededError` AVANT l'envoi** (+ mutant). Barème : gSFA **1 cr** (`G0-b3d:24`), `getAccountInfo` **1 cr** (**`PLI-lot-t1a-ii-b1-bis.md:45`** — `CHANTIERS:122` ne liste PAS `getAccountInfo`). **Plafond en CRÉDITS sur un LEDGER DÉDIÉ** via **`--max-credits`** (le flag introduit par le pli **`eb54baa`** de -b3d-a, `collect.ts:440-447` du worktree -b3d — **disponible seulement après la fusion**, d'où la Phase B post-fusion) avec un **pire cas = 1 crédit/appel** propre à -iii-b, **justifié par l'allowlist de méthodes** (pas la constante 10 de gTfA, pas une re-dérivation `--max-calls == plafond`). **Mécanisme (choix de conception worker sous B-4)** : dans -b3d, `makeBudgetedCall` multiplie par une **constante de module importée** (`WORST_CASE_CREDITS_PER_CALL`, `collect.ts:303` de `eb54baa`), non un paramètre ⇒ -iii-b impose son pire-cas = 1 soit par son **propre garde dans `universe-count.ts`** (dans les lignes de l'allowlist de méthodes, sans toucher `collect.ts` — retenu par défaut, cohérent B-4), soit par **paramétrage de `makeBudgetedCall` post-fusion** (changement `collect.ts` déclaré + test). **JAMAIS le ledger de -b3d** (le plafond 6,5 M de la décision 67 est « pour cet usage » ; partager coupleraient deux plafonds — AM-1). **Lecture du dashboard AVANT** (consommé + réserves + 50 k ≤ 10 M) **et APRÈS** (delta == `credits_recomputed`, sinon STOP). Genesis d'un mint capé : **[cp1 Q3=(a)]** plancher + débit récent **seulement** (aucune page gTfA asc).

**Compteur cumulatif — [cp1 défaut g].** `readPriorCalls`/`priorCalls`/`maxCredits` et le mutant **M17** **n'existent PAS dans `F:\Monark`** (grep = 0 sur `collect.ts` de main) ; ils vivent dans le worktree **-b3d non fusionné** (`F:\Monark-wt-bellb3d\apps\bell\src\collect.ts:29,297,582`, commit `eb54baa`, **non-ancêtre de HEAD**). -iii-b **ne les présuppose pas** : il attend la FUSION de -b3d-a, puis utilise `--max-credits` sur son **propre ledger dédié** (`--ledger <path>` distinct). **Fail-closed** : `--max-calls` requis, > 0 (`collect.ts:430-432`) ; `BudgetExceededError` re-levé, jamais avalé (`quorum.ts:24,90`).

**Sortie -iii-b** : `crosscheck-signatures-<date>.json` (par candidat : `n_sig` exact **ou** plancher+débit, `full_mint_credits`, `duration_sec`, `authority`, `calls_by_method`, `credits_recomputed`) + MAJ du rapport. **Ledger dédié + tout brut hors dépôt sha-pinné** ; opérateurs par **domaine seul**.

---

## 3. Critères de classement PRÉ-ENREGISTRÉS (committés SEUL avant toute donnée ; aucun score composite)

Chaque critère est une **colonne**. Les **valeurs de seuil** sont fixées au PLI **avant** de voir la donnée.

| # | Critère | Règle (pré-enregistrée) | Effet |
|---|---|---|---|
| **C1** | **Identité première main** | adresse émetteur (`api.xstocks.fi`) **== on-chain** `getAccountInfo.owner==Token-2022` + décimales, quorum-2 | échec ⇒ `identity_unconfirmed` = **exclu** (publié) |
| **C2** | **Clôture de référence existe** | `underlying.exchange.mic ∈ {XNAS, XNYS, ARCX, BATS, …}` (MIC US, `L-lecture…:149-154`) ⇒ close SIP existe **par construction** ; **aucun nom de fournisseur, 0 crédit** ; pré-IPO/pas de MIC ⇒ échec | échec ⇒ **hors mesure d'écart** (PreStocks, l.1.1) |
| **C3** | **Quote USD-stable** | mint quote ∈ `USD_STABLE_MINTS` (USDC, `pools.ts:80`) ⇒ mesurable en USD ; sinon `quote_class:"non-usd"` | non-usd ⇒ listé **avec résidu**, exclu de la course g_t |
| **C4** | **`quote_vault_balance_usd`** (**[cp1 B-2]**) | **colonne** = solde on-chain du vault quote en USD, **première main** (jamais « profondeur ») ; le **volume 24 h** tiers est une **colonne de triage séparée** (`T_vol` **supprimé comme seuil**) | en-dessous de l'**ancre fondatrice** ⇒ `below_founding_anchor` **NON excluant, publié** (calque `discover.ts:69,94`) |
| **C5** | **Programme lisible par `discover.ts`** | `raydium-clmm` committé (`pools.ts:74-76`) vs **`whirLbMii…` = `unknown-program`** (`pools.ts:172,175`). Extraction Solana **agnostique au programme** (`pools.ts:40-42`) ⇒ `unknown-program` **NE bloque PAS** la mesure ; committer un programme est **une ligne d'ADR** (`pools.ts:74`), reprise -b1-bis-ii (`CHANTIERS:220`) | **résiduel/label, PAS un disqualifiant** |
| **C6** | **`ScaledUiAmount` + autorité** | présence enregistrée ; `authority==S7vYFF` ⇒ rebase déjà énuméré (~0 cr) ; `≠` ⇒ scan d'autorité dû | **colonne**, informe le coût d'ajout M2 |
| **C7** | **Coût full-mint (colonne M1) — [cp1 B-1]** | coût full-mint (M1, §Phase B) **RAPPORTÉ comme colonne** ; **aucun seuil** au stade -iii (`T_cost` **différé à l'ADR d'ajout par symbole** ; **Q5 retirée**) — un seuil de coût ferait échouer les 4 mints fondateurs eux-mêmes | **colonne informative, jamais un disqualifiant** |

**[cp1 B-2] Oracle de calibration pré-enregistré** (committé avec les seuils) : les **4 mints fondateurs** (`pools.ts:90-99`) **apparaissent dans l'énumération à épuisement, adresse identique caractère-pour-caractère, satisfont C1-C6** ; leur `quote_vault_balance_usd` fixe l'**ancre fondatrice** (jeu de pools = `FOUNDING_POOLS`, `pools.ts:166-179`, + **date de lecture** pré-enregistrée) ; **sinon STOP** (l'énumérateur est cassé).

**Ordre de la liste** : tri **transparent déclaré** (par `quote_vault_balance_usd` décroissant parmi C1∧C2∧C3 satisfaits), **jamais** un composite. **Deux colonnes de coût :**
- **M1 — coût full-mint** = `⌈n_sig/1000⌉×10 cr` + durée : **borne haute conservatrice**, pas le chemin d'ajout.
- **M2 — coût d'ajout réel décomposé, [cp1 B-3 + défaut a/b]** : **M2 n'a JAMAIS de total** ; chaque composante est étiquetée `measured` / `extrapolated_n4` / `not_measured` :
  - (a) découverte du pool fondateur = **154 cr/mint** `measured` (échantillon **3 points × 5 pages** ; RUN 2 découverte **616 cr / 4 mints**, `PLI-lot-t1a-ii-b1-bis.md:121-122`). **PAS « ~575 cr/mint »** : 575 = 2 302/4 confond RUN 1 scanner d'autorité **1 686 cr** (`PLI:119`) + RUN 2 découverte 616 cr.
  - (b) course sur le **POOL** dans la fenêtre Cong (pas l'historique complet du mint) `extrapolated_n4`.
  - (c) re-décodage d'autorité partagée (~0 cr si `authority==S7vYFF`, sinon un scan) `measured`/`not_measured` selon l'autorité lue.
  - **« 5,4 M » = PROJECTION** (`G0-b3d:23`, auto-étiquetée « ordre de grandeur de budget », « estimation haute », N « INCONNU jusqu'à épuisement »), **jamais un fait mesuré**. M2 précis par symbole = ADR d'ajout.

---

## 4. Livrables, tuyaux, upcoming, tests non-LLM, R-25, découpe

### 4.1 Livrables (liste fermée ; CA-11 durci : composition EXÉCUTÉE depuis l'artefact ; **[cp1 B-4]** aucun `runMain`/`collect.ts` avant fusion -b3d-a)
| # | Sous-lot | Fichier (NEUF, point d'entrée propre) | Contenu | Test / oracle (nommé) |
|---|---|---|---|---|
| L-1 | -iii-a1 | `apps/bell/src/universe.ts` + `apps/bell/src/universe-cli.ts` (neufs) | `enumerateUniverse` (core pur : liste émetteur injectée + confirmations on-chain → candidats identité-confirmée ; filtre `deployments[].network` **client**) + `ScaledUiAmount`/`authority` (`scaled_ui_unread` fail-closed) ; **CLI dans un fichier neuf, jamais `runMain`** | `bell_universe_enumerates_from_issuer_list_and_onchain` (owner≠Token-2022 ⇒ `identity_unconfirmed`) ; **oracle de calibration** `bell_universe_founding_mints_appear_and_satisfy_c1_c6` (sinon STOP) ; mutants : identité sans confirm on-chain ⇒ rouge ; quorum raté sans `scaled_ui_unread` ⇒ rouge |
| L-2 | -iii-a2 | `apps/bell/src/liquidity-rank.ts` (neuf) + sampler HTTP (allowlist d'hôtes) | core pur de classement : colonnes C1-C7 → liste ordonnée par `quote_vault_balance_usd` + `below_founding_anchor` **publié** ; **aucun composite** ; GET publics via `tick()` | `bell_liquidity_rank_columns_and_below_founding_anchor_published` ; mutants : composite ⇒ rouge ; `below_founding_anchor` dropé en silence ⇒ rouge ; **hôte hors allowlist ⇒ refus (mutant)** |
| L-3 | -iii-a | `universe.ts` — **construction par ALLOWLIST DE CHAMPS** + garde `assertNoClose` (`digest.ts:38`) | **[cp1 B-11]** artefact bâti par allowlist de champs (jamais strip) ; aucun couple donnant un prix (`fdv_usd`/`market_cap_usd`/base+quote) | `bell_universe_artifact_built_by_field_allowlist_no_price` ; mutants : champ hors allowlist inclus ⇒ rouge ; couple prix-dérivable admis ⇒ rouge |
| L-4 | -iii-b | `apps/bell/src/universe-count.ts` + `apps/bell/src/universe-count-cli.ts` (neufs) | gSFA paginé capé (1 cr) ; **allowlist de MÉTHODES** ; ÉPUISÉ⇒`n_sig` exact ; CAP⇒plancher+débit ; `--ledger` **dédié** + `--max-credits` (`WORST_CASE=1`) | `bell_signature_count_paginates_and_projects` ; `bell_signature_count_method_allowlist_fail_closed` (méthode hors `{gSFA,getAccountInfo}` ⇒ `BudgetExceededError` avant envoi, mutant) ; `bell_universe_credits_recomputed` (mutant `×1→×10` rouge — C-G2-3) ; **`bell_universe_count_reads_topN_from_committed_iii_a_artifact` (RPC stubé, [cp1 B-8])** |
| L-5 | -iii-a/-b | `universe-*.json`/`crosscheck-*.json` (réduits, hors R-25) + `PROVENANCE-univers-solana.md` same-dir (compté) + `docs/MESURE-UNIVERS-SOLANA-…md` | artefacts réduits + rapport (M1/M2, [lu]/[abs]) ; conditions d'usage en PROVENANCE **[cp1 NB-5]** ≤ 25 mots + URL + date + sha, jamais collées ; opérateurs par domaine seul | `series_pinned_are_declared_and_hashed`, `no_secret_in_repo` verts |
| L-6 | -iii-a/-b | `docs/PLI-lot-t1a-iii.md` + prereg | PLI (R-25 par livrable, sha, **seuils/critères + allowlists d'hôtes/méthodes committés SEUL avant tout appel**, budget, ledger dédié, procurements ToS) | ADR/PLI = docs |

### 4.2 Tuyaux (ADR-M018 D3 ; entrée / sortie / état / test) — règle de Branchement
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| liste émetteur + confirm on-chain → univers candidats | `api.xstocks.fi/public/assets` (keyless, ToS [lu]) + `getAccountInfo` quorum-2 keyless | `universe-candidates.json` (identité confirmée, `scaled_ui`, `authority`) | **upcoming** | `bell_universe_enumerates_from_issuer_list_and_onchain`, oracle de calibration |
| API DEX/Gecko (liquidité) + on-chain réserves → colonnes de classement | Raydium/Orca/GeckoTerminal (ToS [lu], allowlist d'hôtes) + vault quote keyless via `tick()` | colonnes `quote_vault_balance_usd`/volume (**allowlist de champs, prix absent**) | **upcoming** | `bell_universe_artifact_built_by_field_allowlist_no_price` |
| candidats + critères pré-enregistrés → liste CLASSÉE | `universe-candidates` + seuils (prereg committé) | classement ordonné + `below_founding_anchor` publié (committé à l'octet) | **upcoming** (consommateur servi = décision investisseur) | `bell_liquidity_rank_columns_and_below_founding_anchor_published` |
| gSFA par mint (Phase B) → coût full-mint + durée | gSFA Helius archive (mono-opérateur, ledger dédié `--max-credits`) | `crosscheck-signatures.json` (M1, durée, authority) | **upcoming** | `bell_signature_count_paginates_and_projects`, `bell_signature_count_method_allowlist_fail_closed`, lit le top-N depuis l'artefact -iii-a committé |
| liste CLASSÉE → décision investisseur ajouts | classement + M1/M2 | décision investisseur → **ADR d'ajout par symbole** (lot ultérieur) | **item à déclencheur** | (décision hors code) |

### 4.3 Ce qui reste `upcoming`
**Tout.** Bell reste **absent** de `fleet.ts`/README/site/skills/export (`CARTOGRAPHIE…passe2:114-124`). Aucune pièce -iii n'a de chemin servi ; consommateurs = tests non-LLM + décision investisseur. Bell n'est « built » qu'à T-1b.

### 4.4 Estimation R-25 et découpe — **[cp1 B-11 : seam -iii-a1/-iii-a2 pré-déclaré ; ~770 jugé sous-estimé]**
R-25 = **projections** (marquées [abs]) mesurées à chaque gel sous la pathspec `STAT=` ; bande ×1,07–×1,7 mesurée (b1-bis) ⇒ facteur ×1,5 retenu. `docs/**/*.md` exclus ; `series/**/*.{json,jsonl,csv}` exclus ; **PROVENANCE `.md` sous `series/` compté**.

| Sous-lot | Pièces (brut, projection) | ×1,5 | Note |
|---|---|---|---|
| **-iii-a1** (identité + `ScaledUiAmount`, 1re main) | `universe.ts` (enum + confirm on-chain + `scaled_ui`/`authority`) ~130 + allowlist de champs/`assertNoClose` ~25 + `universe-cli.ts` neuf ~20 + tests (enum+on-chain, oracle calibration, `scaled_ui_unread`, allowlist de champs + mutants) ~165 + PROVENANCE ~30 ≈ **~370** | **~555** | on-chain seul, **committable avant lecture ToS** ; 0 Helius |
| **-iii-a2** (liquidité + classement) | `liquidity-rank.ts` (colonnes C1-C7, `quote_vault_balance_usd`, `below_founding_anchor`) ~110 + sampler HTTP + allowlist d'hôtes via `tick()` ~50 + CLI ~15 + tests (colonnes, below-anchor publié, allowlist d'hôtes mutant, classement committé à l'octet) ~150 + PROVENANCE ~20 ≈ **~345** | **~520** | **après lecture ToS** (allowlist d'hôtes alimentée par le PLI) ; 0 Helius |
| **-iii-b** (Helius, après fusion -b3d-a) | `universe-count.ts` + `universe-count-cli.ts` neufs ~90 + allowlist de méthodes ~30 + ledger dédié/`--max-credits`/dashboard ~40 + CLI ~25 + tests (paginate+project, method-allowlist fail-closed, credits_recomputed ×1→×10, lit top-N depuis l'artefact committé, delta dashboard) ~180 + PROVENANCE ~30 ≈ **~395** | **~590** | Helius, budget crédits pré-enregistré, ledger **dédié** |

Les trois **< 1 205** avec marge ; **-iii-a total (~555 + ~520 ≈ ~1 075) confirme que l'ancien ~770 sous-estimait** (d'où le seam B-11). **Découpe = 3 sous-lots séquentiels** : -iii-a1 → -iii-a2 (chacun gelé et mesuré, seam B-11-propre : a1 = champs on-chain committables avant ToS, a2 = allowlist d'hôtes) → fusion -iii-a ; **puis**, après fusion de -b3d-a, -iii-b. R-25 **ré-mesuré au gel** de chaque sous-lot.

---

## 5. Risques (MAST), biais, anti-close, décision 69, secrets

| Mode MAST | Menace | Contre-mesure |
|---|---|---|
| Dérive de spéc | agrégateur pris pour source d'identité | identité = API émetteur + **confirm on-chain** (C1) ; mutant « identité sans on-chain » rouge |
| Vérification incorrecte | liquidité d'agrégateur publiée comme vérité produit | agrégateur = **triage only, jamais publié** (décision 68) ; produit = 1re main ; **[cp1 B-2]** `quote_vault_balance_usd` = solde on-chain, jamais « profondeur » dérivée |
| Vérification incomplète | prix laissé dans l'artefact | **[cp1 B-11]** artefact **par allowlist de champs** (jamais strip) + garde `assertNoClose` (`digest.ts:38`) + mutant ; **aucun couple prix-dérivable** (`fdv_usd`/`market_cap_usd`/base+quote) ; diff anti-close au checkpoint-2 (`F:\tmp\cp2-t1a-iii-a\`) |
| Terminaison prématurée | signature-count capé présenté exact | fail-closed cap + **exact/plancher** + **[cp1 NB-7]** coût par symbole non livré pour un mint capé + `BudgetExceededError` re-levé |
| Sur-déclaration de couverture | « voici l'univers » ; « 811 multi-chaîne » | liste = **candidats d'UN émetteur (xStocks)** + autres à qualifier ; **[cp1 défaut h/NB-6]** répartition Solana du 811 **à mesurer**, jamais inférée |
| Rétention d'info inter-agents | [abs]/[2nd] remonté en [lu] | niveaux figés ; chiffres du dépôt cités `fichier:ligne` **ouverts et lus** |
| Confusion d'unités (calls/crédits) | plafond en appels ≠ crédits | **[cp1 B-7]** ledger **dédié** `--max-credits` (`WORST_CASE=1` justifié par l'allowlist de méthodes), **jamais** partagé avec -b3d, **jamais** `--max-calls==plafond` ; `credits_recomputed` + mutant `×1↔×10` |
| Isolation / dépendance non fusionnée | modifier `collect.ts` ; présupposer `readPriorCalls`/M17 | **[cp1 B-4/défaut g]** fichiers neufs ; -iii-b **après FUSION -b3d-a** (où vivent `readPriorCalls`/`--max-credits`, commit `eb54baa`) |
| Sur-déclaration CA-11 | tuyau « branché » par regex | **[cp1 B-8]** tests **exécutent la composition depuis l'artefact committé** (classement à l'octet ; -iii-b lit le top-N de -iii-a) ; Bell `upcoming` |

- **Biais de sélection** `issuer_selection_bias` : tri par `quote_vault_balance_usd` = **choix déclaré** ; xStocks d'abord = **choix d'émetteur déclaré**. **[cp1 NB-3]** biais d'énumération par API de DEX **déclaré**. Décision 80 : tout ajout publié pour tous.
- **Anti-close** : aucun close/prix lu ; C2 teste l'**existence** d'un close via `exchange.mic` (première main, gratuit, aucun nom de fournisseur), jamais une valeur.
- **Décision 69** : aucun nom de fournisseur de recoupement cash exporté (C2 via MIC).
- **Secrets** : Phase A **keyless** ⇒ 0 secret ; Phase B clé Helius du scope User, jamais loggée ; `no_secret_in_repo` étendu au motif UUID Helius (`ADR-T1aii:9`) ; opérateurs par **domaine seul** ; bruts/ledger hors dépôt (`F:\PRODUITS\`).

---

## 6. Questions (checkpoint-1) et procurements formés

### Questions — tranchées / EN ATTENTE
- **Q1 — N (top-N Phase B)** : **N = 20 acceptable sous B-7/NB-4** (porté dans l'escalade Q6). [cp1]
- **Q2 — cap gSFA `C_page`** : **≤ 2 000 pages OU deux paliers** (N × cap sans marge sinon). [cp1]
- **Q3 — genesis d'un mint capé** : **(a)** plancher + débit récent seulement. [cp1]
- **Q4 — colonne C4** : **structure acceptée, MODIFIÉE par B-2** — `quote_vault_balance_usd` ancré sur `FOUNDING_POOLS` (`pools.ts:166-179`) + date de lecture pré-enregistrées ; `below_founding_anchor` **non excluant** ; **`T_vol` retiré comme seuil** (volume = colonne de triage). [cp1]
- **Q5 — plafond de coût par symbole** : **SUPPRIMÉE** (C7 = colonne, `T_cost` différé à l'ADR d'ajout, B-1). [cp1]
- **Q6 — plafond crédits Phase B + cumul cycle** : proposition **≤ 50 000 crédits Helius** (ledger **dédié**, fail-closed) ; cumul cycle pire cas **7 528 946** (`F:\Monark-wt-bellb3d\docs\G0-lot-t1a-ii-b3d.md:96`) **+ ≤ 50 000 = ~7,58 M / 10 M** (`G0-b3d:97`). **EN ATTENTE DE DÉCISION INVESTISSEUR (ESCALADE).**
- **Q7 — ordonnancement vs -b1-bis-ii** : -iii-b (≤ 50 k) vs course -b1-bis-ii (≤ 1 M, ratifiée). **EN ATTENTE DE DÉCISION INVESTISSEUR (ESCALADE)** — créneau **A** (après la sonde -b3d, hors tout tirage du chemin critique) **ou B** (après la course -b1-bis-ii). *Note : l'amendement décision 82 (l.244-245) séquence -iii-b après la fusion+sonde -b3d, mais NE tranche PAS Q7 (choix -iii-b vs -b1-bis-ii) ; à réconcilier par l'orchestrateur.*
- **Q8 — `ScaledUiAmount` en Phase A keyless** : **oui sous quorum-2 avec `scaled_ui_unread` fail-closed.** [cp1]
- **Q9 — périmètre émetteurs** : recommandation xStocks seul en -iii ; Backpack/Sunrise, Superstate, Remora = qualification ultérieure (PR-U-\*). **EN ATTENTE DE DÉCISION INVESTISSEUR (ESCALADE)** — report avec **deux lectures d'émetteur formées**, déclenchées après le release.

### Procurements formés (doc 03 — identité complète, usage, tentatives ; **[cp1 B-5]** chaque PR-U-\* nomme ses documents + règle de décision pré-enregistrée : lecture ⇒ source admise OU repli nommé ; **[cp1 NB-8]** une SEULE mission lecteur pour toutes les lectures de conditions)
- **PR-U-GECKOTERMINAL-TOS** — `api.geckoterminal.com/api/v2`, doc `geckoterminal.com`, `robots.txt` : licence, quotas, attribution, **interdiction de redistribution**. Règle : lecture ⇒ Tier 2 triage admis ; repli = colonne volume absente (déclarée). Fichier : `docs/biblio/bell/L-lecture-geckoterminal-tos-<date>.md`.
- **PR-U-RAYDIUM-TOS** — `api-v3.raydium.io`, doc + `robots.txt` : termes/limites/attribution. Règle : lecture ⇒ énumération Tier 1 admise ; repli = énumération on-chain `getProgramAccounts` (coût keyless mesuré).
- **PR-U-ORCA-TOS** — Orca (pools `whirLbMii…`) : **existence de l'API HTTP à ÉTABLIR par la lecture** ; sinon `getProgramAccounts` sur `whirLbMii…`. Règle : lecture ⇒ API admise si publique ; repli = on-chain.
- **PR-U-XSTOCKS-API-TOS** — `api.xstocks.fi` : établie publique sans clé (`L-lecture…:277-280`), termes de redistribution/attribution non lus. Règle : lecture ⇒ source d'identité admise (donnée non publiée de toute façon).
- **[cp1 B-6] PR-U-BACKPACK** — document d'émetteur Backpack Securities/Sunrise donnant les adresses de mint Solana : droits « supported but not yet enabled » (`CENSUS…v4:14`) ; usage = qualifier Backpack/Sunrise ; **déclenché après le release** (Q9).
- **[cp1 B-6] PR-U-SUPERSTATE** — document d'émetteur Superstate Opening Bell (transfer agent ; l'émetteur est la société tokenisée) : adresses Solana ; usage = qualifier Superstate ; **déclenché après le release** (Q9).
- **[cp1 B-6] PR-U-SOLANA-PUBLIC-RPC** — conditions/limites de `api.mainnet-beta.solana.com` et publicnode : **prérequis du premier appel keyless** de -iii-a ; usage = autoriser le quorum-2 keyless.
- **PR-U-REMORA** (conditionnel Q9) — document d'émetteur Remora : site non atteint (décision 82) ; usage = qualifier Remora.

**Renvois (déjà au dossier)** : Helius (clé posée, `CHANTIERS:52`) ; Databento EQUS.SUMMARY (décision 53) = confirmation secondaire de close pour l'**ADR d'ajout**, pas pour C2. **Aucun procurement Ondo** (hors périmètre, décision 81).

---

## 7. Faits mesurés [lu] qui fixent la méthode (fichier:ligne — citations corrigées au checkpoint-1 RÉ-OUVERTES et lues par le rédacteur ; citations héritées de `ec0f422` reportées inchangées, non ré-vérifiées)
1. **Univers actuel = 4 mints** : `pools.ts:90-99` ; `FOUNDING_POOLS` `pools.ts:166-179` (ancre B-2).
2. **API émetteur publique sans clé, adresses == on-chain** : `L-lecture…:81-88`, `:276-291`, `:282-283`, `:407` (pagination non alphabétique ⇒ épuisement), `:409` (filtres serveur inefficaces ⇒ filtrage client `deployments[].network`), `:91-93`, `:149-154` (`exchange.mic`).
3. **Provenance load-bearing = on-chain** : `pools.ts:3-7`, `L-lecture…:44-57`.
4. **Extraction Solana agnostique au programme (vault delta)** : `pools.ts:40-42` ; carte DEX `pools.ts:74-76` ; `whirLbMii…`=`unknown-program` `pools.ts:172,175` ; USD-stable `pools.ts:80`.
5. **Coûts unitaires** : gTfA **10 cr**, `getTransaction` **1 cr**, gSFA **1 cr** (`G0-b3d:24` ; `CHANTIERS:122`) ; **`getAccountInfo` 1 cr : `PLI-lot-t1a-ii-b1-bis.md:45`** (**[cp1 défaut c]** `CHANTIERS:122` ne le liste PAS). Recompute crédits : `discover.ts:248`.
6. **Budget fail-closed (compteur d'APPELS) + `tick()`** : `collect.ts:296-298` (`makeBudgetedCall`, expose **`tick()`** `:296,305`), `:430-432` (`--max-calls` requis >0), `:423`/`:563` (`--min-interval 250` ⇒ 4 appels/s) ; `BudgetExceededError` re-levé `quorum.ts:24,90`.
7. **`--max-credits` + `readPriorCalls` + M17 = worktree -b3d NON fusionné** (**[cp1 défaut g]**) : `F:\Monark-wt-bellb3d\apps\bell\src\collect.ts:29,297,440-447,582` (commit `eb54baa`, **non-ancêtre de HEAD**) ; **absents de `F:\Monark`** (grep = 0). Leçon calls vs crédits + `budget.json` par `--out` : `F:\Monark-wt-bellb3d\docs\G2-lot-t1a-ii-b3d-a.md:23-42` (C-G2-1) ; mutant `credits_recomputed ×1` **survivant** `:117` (C-G2-3).
8. **Cumul cycle -b3d pire cas 7 528 946 / 10 M** : `G0-b3d:96` ; Helius 5 $/M, autoscaling off, arrêt système à 10 M `G0-b3d:97`.
9. **Autorité partagée `S7vYFF…`** : `G0-b3d:102`, ADR-T1aii D1-quater.
10. **Providers keyless** : `operators.ts:18` (solana-foundation), `:19` (publicnode), `:20` (pocket), `:24` (drpc), `:26` (ankr) — **[cp1 défaut e]** `:23` = llamarpc (EVM) ; quorum-2 `quorum.ts:71-104`, distinctness `operators.ts:30`.
11. **Anti-close** : `CLOSE_KEY` `digest.ts:33`, `assertNoClose` `digest.ts:38` (**[cp1 défaut d]** — dans `digest.ts`, pas `pools.ts`).
12. **Amendement décision 82** : `CHANTIERS:244-245` (commit `001750e`, **[cp1 B-10]**).

## 8. Budget et ordonnancement (résumé)
- **Phase A (-iii-a1 puis -iii-a2)** : **0 crédit Helius** (keyless + HTTP public) ; borné `--min-interval` + `--max-calls` ; GET publics via `tick()` ; repli top-N par `quote_vault_balance_usd` si rate-limit. **Lançable dès ce G0 plié + prereg committé** (amendement décision 82).
- **Phase B (-iii-b)** : **≤ 50 000 crédits Helius** (Q6, fail-closed, **ledger DÉDIÉ** `--max-credits` `WORST_CASE=1`) ; cumul cycle pire cas ~7,58 M/10 M ; **APRÈS FUSION -b3d-a + sonde -b3d** ; **lancement SUSPENDU à ESCALADE-INVESTISSEUR (Q6, Q7)**. Sous plafond, **0 $ nouveau** (autoscaling off).
- **Ordonnancement (conditions du checkpoint-1)** : chemin critique (-b3d, -b1-bis-ii, -b3c, T-1b) **prioritaire sur toute file** ; **aucun run keyless de phase A pendant un run réseau du chemin critique** (mêmes RPC publics, même IP) ; **aucun tirage Helius concurrent**.

## 9. Rôles
Checkpoint-1 validateur `claude-fable-5-1` rendu **avant tout code** (avis persisté `docs/CHECKPOINT1-lot-t1a-iii.md`). Lectures ToS PR-U-\* (**une** mission lecteur Sonnet 5, NB-8) **avant** le premier appel réseau de -iii-a2 (et PR-U-SOLANA-PUBLIC-RPC avant -iii-a1 keyless). Prereg (seuils C1-C7 + oracle de calibration + allowlists d'hôtes/méthodes) **committé seul** par l'orchestrateur avant le worker. Worker Opus 4.8 max : -iii-a1 (identité + `ScaledUiAmount`, on-chain committable avant ToS) gelé et mesuré → -iii-a2 (liquidité + classement) → G2 fraîche → checkpoint-2 → G7 → fusion -iii-a ; **puis**, après fusion de -b3d-a, -iii-b (Helius, ledger dédié) → G2 → checkpoint-2 (re-exécution CA-9) → G7 → fusion `--no-ff`. **Le worker ne committe jamais, ne déclenche aucun workflow (R-20)** ; sortie vérifiée adversarialement (R-21).

## 10. Amendement d'ADR (rédigé ici, porté par l'orchestrateur — **[cp1 B-9]**, R-8, avant tout code)

> **Amendement daté — 2026-09-20 (lot -iii, univers Solana élargi ; `claude-opus-4-8[1m]` rédige, orchestrateur porte).** À insérer dans **ADR-T1aii** (suite des amendements D1-bis..D1-sexies) **ou** dans **ADR-B0 D6 (Données, coûts, dépendances (R-8), `ADR-B0:52`)** :
>
> **Sources nouvelles [lu] (R-8)** : (1) `docs/biblio/bell/L-lecture-xstocks-mints-emetteur-2026-09-20.md` (API émetteur `api.xstocks.fi`, `deployments[].network`, `exchange.mic`, pagination à épuisement) ; (2) `docs/PLI-lot-t1a-ii-b1-bis.md:45` (barème `getAccountInfo` 1 cr) et `:118-122` (RUN 1 scanner 1 686 cr + RUN 2 découverte 616 cr = 154 cr/mint) ; (3) `apps/bell/src/digest.ts:33,38` (`CLOSE_KEY`/`assertNoClose`) ; (4) `apps/bell/src/operators.ts:18-26` (opérateurs keyless) ; (5) `F:\Monark-wt-bellb3d\...:G0-lot-t1a-ii-b3d.md:23,24,96,97,102` et `collect.ts:29,297,440-447,582` (commit `eb54baa` : `--max-credits`/`readPriorCalls`, non fusionné) ; (6) `docs/CHANTIERS.md:241,244-245` (décision 82 + amendement). Conditions d'usage des API tierces = PR-U-\* [à lire] (§6), citations **≤ 25 mots + URL + date + sha** (NB-5).
>
> **Table des tuyaux (§4.2)** portée telle quelle (entrée/sortie/état/test), tous **`upcoming`** (Bell built à T-1b). **Coûts** : Phase A 0 crédit ; Phase B ≤ 50 000 cr sur ledger **dédié** (`--max-credits`, `WORST_CASE=1`), plafond « pour cet usage » **distinct** du 6,5 M -b3d (décision 67). **Dépendance** : -iii-b **bloqué sur la fusion de -b3d-a** (source de `--max-credits`).

---

## 11. PLI checkpoint-1 — table de traçabilité correction → section modifiée
| Correction | Nature | Section(s) modifiée(s) du G0 |
|---|---|---|
| **défaut (a)** « 575 cr/mint » | fait faux (154 réel) | §3 M2(a), §7 fait 5 |
| **défaut (b)** « 5,4 M / 4 mints » | à étiqueter projection | §3 M2 |
| **défaut (c)** `getAccountInfo` 1 cr source | citation (`PLI:45`, pas `CHANTIERS:122`) | §2 Phase B, §7 fait 5 |
| **défaut (d)** `assertNoClose`/`CLOSE_KEY` | citation (`digest.ts:33,38`, pas `pools.ts`) | §2 (ii), §5, §7 fait 11 |
| **défaut (e)** `operators.ts:23` drpc | citation (drpc=`:24`, `:23`=llamarpc) | §2 (i), §7 fait 10 |
| **défaut (f)** « décision 40 (`CHANTIERS:49`) » | refonder sur décision 82 (`:241`) | §1.1 PreStocks |
| **défaut (g)** `readPriorCalls`/M17/`--max-credits` | worktree -b3d non fusionné | §Isolation, §2 Phase B/GATE, §7 fait 7 |
| **défaut (h)** « 811 = multi-chaîne » | à mesurer | Cadre, §2 (i), §5 |
| **B-1** C7 seuil → colonne | seuil retiré, `T_cost` différé, Q5 retirée | §3 C7/M1, §6 Q5 |
| **B-2** C4 `quote_vault_balance_usd` | jamais « profondeur » ; `below_founding_anchor` non excluant ; ancre + date prereg ; `T_vol` retiré ; oracle calibration | Objectif, §2 (ii), §3 C4 + oracle, §6 Q4 |
| **B-3** M2 sans total, composantes étiquetées | 154 cr/mint ; « 5,4 M » projection | §3 M2 |
| **B-4** isolation | fichier CLI neuf, aucun `collect.ts` avant fusion -b3d-a ; -iii-b après fusion | §Isolation, §2 GATE/Phase B, §4.1 |
| **B-5** sources tierces gated | allowlist d'hôtes par PLI + mutant ; GET via `tick()` ; règle de décision par PR | §2 (ii), §6 procurements |
| **B-6** procurements manquants | PR-U-BACKPACK/SUPERSTATE/SOLANA-PUBLIC-RPC | §1.1, §6 |
| **B-7** -iii-b budget | allowlist de méthodes ; ledger dédié `--max-credits`=1 ; dashboard avant/après ; N×cap sans marge | §2 Phase B, §4.1 L-4, §8 |
| **B-8** CA-11 durci | rejeu committé à l'octet ; -iii-b lit le top-N de -iii-a ; checkpoint-2 `F:\tmp\cp2-t1a-iii-a\` | §2 GATE, §4.1 L-4, §5 |
| **B-9** amendement d'ADR | sources R-8 + tuyaux §4.2 (texte rédigé) | §10 |
| **B-10** amendement décision 82 | FAIT par l'orchestrateur (`CHANTIERS:244-245`, `001750e`) — cité | Cadre, §2 |
| **B-11** anti-close par allowlist de champs | jamais strip ; couples prix-dérivables ; brut hors dépôt `F:\PRODUITS\` ; seam -iii-a1/-iii-a2 ; R-25 ré-estimé | §1.2, §2 (ii)/(iii), §3, §4.1 L-3, §4.4, §5 |
| **NB-1** citations | défauts a-h ci-dessus | §7 |
| **NB-2** filtre `deployments[].network` client | `L-lecture:409` | §2 (i) |
| **NB-3** biais d'énumération DEX | déclaré | §2 (ii), §5 |
| **NB-4** `C_page` deux paliers | K pages débit ; épuisement si projection < cap | §2 Phase B, §6 Q2 |
| **NB-5** conditions d'usage | ≤ 25 mots + URL + date + sha | §4.1 L-5, §6, §10 |
| **NB-6** « 811 » à mesurer | = défaut h | Cadre, §2 (i) |
| **NB-7** mint capé : coût/symbole non livré | plancher + débit | §2 Phase B, §5 |
| **NB-8** une seule mission lecteur | conditions groupées | §6, §9 |

**Points laissés EN ATTENTE (aucune réponse présumée)** : **Q6** (plafond 50 000 cr + cumul 7,58 M/10 M), **Q7** (créneau A/B vs -b1-bis-ii — l'amendement décision 82 séquence -iii-b après fusion+sonde -b3d mais ne tranche PAS ce choix), **Q9** (périmètre émetteurs, report Backpack/Superstate avec deux lectures formées) — **ESCALADE-INVESTISSEUR**.
