# G0 — Sprint backlog lot T-1a-iv « qualification des émetteurs Q0→Q2 » (Bell) : échelle publiée Q0-Q5, ordre Backpack → Superstate → Remora → PreStocks, méthode « lecture sur place » (décision 86), zéro crédit d'abord

Rédaction worker PLANIFICATEUR-RÉDACTEUR `claude-opus-4-8[1m]` effort max, 2026-09-21. **Modèle résolu (R-1) : `claude-opus-4-8[1m]`** (préfixe `claude-opus-4-8` conforme, effort max — vérifiable par l'orchestrateur). **R-20** : le worker ne committe pas, ne déclenche aucun workflow. **R-21** : sortie vérifiable ; chaque `fichier:ligne` **ouvert et lu** ; les avis Fable sont des **conseils** re-vérifiés (défauts §Annexe). **AUCUN appel réseau/RPC/API** (leçon consignée `CHANTIERS:250` : advisor-defi a lu des RPC keyless mono-op AVANT les conditions d'usage — déviation `error_origin` advisor-defi + orchestrateur ; à REJOUER quorum-2 après PR-U). Aucun close ni prix en clair. Ce G0 est un PLAN : aucun code, aucun commit.

**Cadre (décisions investisseur, `docs/CHANTIERS.md`)** : **décision 85** (`CHANTIERS:254`) — Backpack = **premier émetteur qualifié** (lot **T-1a-iv**, Q0→Q2) ; bascule vers scénario (b) **seulement si ses trois conditions passent avant le G0 de T-1b** ; R2 (adaptateur) différé au premier Q3 réel. **Décision 86** (`CHANTIERS:255`, verbatim) — MÉTHODE « lecture sur place » : toute recherche commence par une lecture PRIMAIRE au navigateur INTERNE de l'orchestrateur, puis EXTERNE (Chrome investisseur) ; **fichier de FAITS daté** ([lu] première main, URL, heure) AVANT le lancement des agents ; **un refus/certificat invalide/CAPTCHA n'est JAMAIS contourné** ; aucune page portant une clé n'est lue ; les sous-agents n'ont pas de navigateur (WebFetch/firecrawl). **Décision 83-84** (`CHANTIERS:248`) : phase B Helius ≤ 50 000 cr, ledger dédié, créneau A (après la sonde -b3d, chemin critique prioritaire). **Décision 80** : tout symbole mesuré est publié pour tous. **Décision 68** : DONNÉE de première main ; article = MÉTHODE. **Décision 69** : aucun nom de fournisseur de recoupement cash exporté. **CA-11 durci** : composition EXÉCUTÉE depuis l'artefact.

**Faits d'entrée (à recevoir par le worker)** : `F:\PRODUITS\etude-2026-09-20\univers-bell\FAITS-navigateur-2026-09-20.md` (dont **addendum 2** : Sunrise = **Wormhole Labs** — PAS une venue Backpack ; Backpack Securities émet SPCX, MU, SNDK, BOT, DRAM via Sunrise ; **AUCUNE adresse de mint publiée sur la page lue** ⇒ **Q0 Backpack NON atteint**) + les trois avis Fable (`AVIS-advisor-{architecture,defi-mecanique,marche}-…`). **Ces avis sont conseils, PAS faits.**

**Rattachement** : ADR-B0 (D2 faits i-iv, D5 mutants/`gate:vocab`, D6 sources/coûts R-8, ESC-1 c) ; **ADR-B0 amendement D2-bis** (échelle Q0-Q5, doctrine fenêtre courante, **liste R2 qui fait foi**, **plan d'opérateurs** — brouillon séparé) ; ADR-T1aii (D1-quater `ScaledUiAmount`, D1-bis décision 44 « fenêtre par chaîne ») ; **G0 T-1a-iii** (`docs/G0-lot-t1a-iii-univers-solana.md` : `enumerateUniverse`, allowlists d'hôtes/méthodes, ledger dédié, PR-U-\*) ; **lot R1** (registre multi-émetteur, prérequis pour indexer par (émetteur, mint)).

> **PLI checkpoint-1 (worker RÉDACTEUR `claude-opus-4-8[1m]` effort max, 2026-09-21).** Le validateur `claude-fable-5-1` (2026-09-20 23:41→23:53 UTC, artefact `f5996a0`, sha256 `17781ad4a8ca68551022e3995b1de6e4fb21374641e0ad95310865c6ce824964` recalculé conforme, byte-identique au HEAD `2ca72e7`) a rendu **ACCEPTE-AVEC-CORRECTIONS** : bloquantes **B-IV-1..6** (dont l'intégration de la **SYNTHESE des conditions d'usage** — le G0 était périmé face à elle — et le **plan d'opérateurs** réduisant le « quorum-2 keyless » à UN opérateur admis), non bloquantes **NB-IV-1..6** pliées en place (marqueurs `[cp1 …]`), table finale. **Aucun code avant B-IV-1..6 ; seules les lectures Q0 sont lançables après B-IV-3** (définition fermée de « document d'émetteur »). Chaque `fichier:ligne` **ré-ouvert et lu** ; **la liste R2 et le plan d'opérateurs vivent dans l'ADR D2-bis** (ce G0 y renvoie).

---

## 0. Objectif (une phrase)
Qualifier les émetteurs d'actions tokenisées Solana hors xStocks contre une **échelle publiée Q0→Q5** (chaque palier = artefact + test non-LLM + critère d'arrêt nommé + état public autorisé ; « built » seulement à Q5), dans l'ordre **Backpack (Q0→Q2), Superstate (étapes 1-2), Remora (statut d'abord), PreStocks (ligne d'offre + `no_reference_close_by_construction`)**, par la méthode « lecture sur place » (décision 86), **zéro crédit d'abord** — afin que l'investisseur tranche la bascule vers le scénario (b) avant le G0 de T-1b, **sans ajouter aucun émetteur au release** ni implémenter aucun résiduel R2.

## 1. Périmètre et NON-périmètre

### 1.1 DANS le périmètre
- **Qualification Q0→Q2** de Backpack ; **étapes 1-2** de Superstate ; **statut** de Remora ; **ligne d'offre** de PreStocks. Chaque palier produit un **artefact** + un **état public** (échelle §2).
- **Réutilisation de `enumerateUniverse`** de T-1a-iii-a1 (`G0-t1a-iii:109`, `apps/bell/src/universe.ts`) avec une **seconde liste d'émetteur injectée** — **pas de dédoublement** de code d'énumération.
- **Procurements de lecture formés** (§12) ; **FAITS datés** par l'orchestrateur avant tout agent (décision 86).
- **Conditions de bascule (b)** pré-enregistrées (§7) ; **doctrine « fenêtre courante »** posée en question (§8).

### 1.2 NON-périmètre (ce que T-1a-iv NE fait PAS)
- **N'ajoute AUCUN émetteur au release** (scénario a inchangé : 4 xStocks + registre R1). Une bascule vers (b) est une **décision investisseur** ultérieure (§7).
- **N'implémente AUCUN résiduel R2** ni aucun adaptateur d'événement de titre : les nouveaux codes de séance sont **NOMMÉS** (§5), pas codés ; ils appartiennent à **R2, un seul re-pin** (au premier Q3 réel).
- **Ne calcule aucune g_t** de second émetteur ; **ne touche PAS `residuals.ts`** (aucun code R2). **[cp1 B-IV-4 — contradiction levée].** Il **touche `pools.ts` UNIQUEMENT pour ajouter/renseigner des `IssuerRef` à `tokens: []`** (Backpack, Superstate, Remora, PreStocks) portant leur `qualification {rung, stop}` — **JAMAIS un `TokenRef` ni une entrée `POOLS`** de ces émetteurs (aucun symbole mesuré/servi). L'état de qualification **VIT dans `ISSUERS`** (donnée de registre non hachée, ADR D2-bis.2), consommé par `/bell/method` à T-1b. **Deux tests négatifs prouvent l'absence d'effet de bord** : ces `IssuerRef` à `tokens:[]` (a) **n'entrent PAS dans `solanaTokens(wanted)`** (donc pas dans le digest ni les 6 sites), (b) **n'entrent PAS dans `sources.issuers[]`** (provenance limitée aux émetteurs d'un symbole EFFECTIVEMENT mesuré dans le run, cf. R1 B-R1-1). Le pin reste inchangé (rien de haché n'est ajouté).
- **Aucune dépense Helius** avant : (i) la sonde -b3d, (ii) PR-U-SOLANA-PUBLIC-RPC + PR-U-RAYDIUM-TOS lus, (iii) `enumerateUniverse` de -iii-a1 fusionné.
- **Ne contourne aucun refus** de navigation (Remora certificat invalide, Backpack navigation interne refusée — `FAITS…:13,22-23`).

## 2. Échelle de qualification Q0-Q5 (publiée ; ÉTAT ≠ CODE résiduel)

**Règle dure (mesurée)** : l'échelle est portée par une **donnée de registre `IssuerRef.qualification {rung, stop}`** (lot R1), **PUBLIÉE et NON hachée** — le `stop` est une chaîne d'affichage (liste fermée d'États). Elle **ne passe JAMAIS par `RESIDUAL_CODES`** : `newResidualCounts()` (`residuals.ts:61-65`) met toutes les clés dans le digest (`collect.ts:241-242`) ⇒ un code dans l'enum re-pinnerait AVANT le release, ce qui violerait « R2 différé » (décision 85). Les codes de séance (§5) sont R2.

| Gate | Artefact | Test non-LLM | Critère d'arrêt (État publié, NON haché) | État public autorisé |
|---|---|---|---|---|
| **Q0 identité première main** | lecture [lu] des adresses publiées **par l'émetteur** (**« document d'émetteur » = définition FERMÉE pré-enregistrée, voir §2.1 [cp1 B-IV-3]**) + sha du corps lu | **[cp1 NB-IV-1]** lecture par **lecteur Sonnet 5** puis avis **lecture-advisor `claude-fable-5-1`** (les LECTEURS sont Sonnet 5 ; l'advisor est Fable 5.1) ; critère **NON-LLM** (sha du corps ∈ liste, hôte ∈ domaines de l'émetteur, forme de l'adresse) ; pas d'appel réseau | `identity_unpublished` + procurement formé | « planned — identity pending » |
| **Q1 objet on-chain lu** | ligne `TokenRef` candidate (programme, décimales, extensions `ScaledUiAmount`/`pausable`/`transferHook`/`transferFee`/`confidentialTransfer`, autorité) sous **quorum-2 keyless** | « adresse émetteur == on-chain `getAccountInfo.owner`+décimales » + mutant identité-sans-on-chain | `identity_unconfirmed` (identité d'agrégateur seul ⇒ exclu, publié) | « planned » |
| **Q2 prix observable** | `discovery-<MINT>.json` (calque -iii) : pool à **quote USD-stable** avec **solde de vault ≥ seuil pré-enregistré** ; **règle de définition de g_t** (§4) satisfaite | calque `bell_founding_registry_equals_discovery_measure` (C-4) + mutant | `price_unobservable` / `no_open_pool_found` / `permissioned_participants` / `no_reference_close_by_construction` (États publiés) | « planned — no observable price » |
| **Q3 événement de titre décodable** (**R2, hors T-1a-iv**) | adaptateur d'énumération (§5) + preuve replay == état lu (bits) OU preuve « aucun mécanisme observable » | oracle bit-exact + mutant | `title_event_undecodable` (**code R2**, re-pin) | « upcoming » |
| **Q4 série mesurée** (**hors T-1a-iv**) | séries pinnées + PROVENANCE, budget pré-enregistré | rejeu bit-identique | **[cp1 NB-IV-3]** arrêt **PARAMÉTRÉ par la réponse à E-1** : sous (ii) = « série fondatrice non définissable » ; sous (i)/(iii) = fenêtre courante bornes déclarées + `under_calib` si < minimum de sessions (jamais comparée à la fondatrice) | « upcoming » |
| **Q5 branché et servi** (**hors T-1a-iv**) | chemin `/bell/` + test d'intégration depuis l'artefact (CA-11 durci) + cartographie | intégration + cartographie de branchement | — | **« built » (seul palier)** |

**T-1a-iv couvre Q0→Q2** (+ pose Q3-Q5 comme upcoming). **« built » n'existe qu'à Q5** (règle de Branchement, CA-11).

### 2.1 [cp1 B-IV-3] « Document d'émetteur » — définition FERMÉE et pré-enregistrée (committée AVANT toute lecture Q0)
Q0 n'est atteint que si l'adresse de mint est publiée dans un **document d'émetteur** au sens fermé suivant (sinon `identity_unpublished`) :
- **Domaines par émetteur (allowlist committée)** : xStocks `{xstocks.fi, docs.xstocks.fi, api.xstocks.fi}` ; Backpack Securities `{backpack.exchange, learn.backpack.exchange}` ; Superstate `{superstate.com, docs.superstate.com}` ; PreStocks `{prestocks.com}` ; Remora `{remora.markets}`. Un hôte hors la liste de l'émetteur ⇒ non-Q0.
- **Statut d'un dépôt réglementaire** : un **communiqué EDGAR de la société tokenisée elle-même** (p. ex. Galaxy pour GLXY, `sec.gov`) **compte comme document d'émetteur** ; un article de presse ou un agrégateur ne compte pas.
- **Statut d'un TIERS** : **Sunrise = Wormhole Labs** (couche de listing Solana, `FAITS…:26`), **Wormhole Labs SEUL = NON-Q0** (ce n'est pas l'émetteur des titres — l'émetteur est Backpack Securities) ; idem tout tiers de listing/distribution. Q0 exige un document **de l'émetteur des titres**.
- **Statut d'un post X / réseau social** : **NON-Q0** (jamais une source d'identité de première main pour Q0 ; au mieux [2nd] à rejouer).
- **Critère NON-LLM** (opposable) : `sha256(corps lu)` consigné ∈ liste committée ∧ hôte ∈ domaines de l'émetteur ∧ forme d'adresse valide (base58 Solana / hex EVM). Aucune inférence LLM ne « décide » Q0.

**Conséquence corrigée [cp1 B-IV-3]** : PR-U-BACKPACK-MINTS (§12) est réécrit — Sunrise/Wormhole Labs n'est PAS un « document d'émetteur » ; seule une page **Backpack Securities** publiant les adresses atteint Q0.

## 3. Ordre des émetteurs + faits d'entrée (niveaux figés)

### 3.1 Backpack Securities (Q0→Q2) — PREMIER
- **Faits [lu, première main]** (`FAITS…:16-19,25-31`) : Backpack `/stocks` « real shares: security entitlements governed by New York law … cash dividends », « liquidity natively integrated into traditional venues » ; **Sunrise = Wormhole Labs** (couche de listing Solana, PAS venue Backpack — addendum 2) ; titres listés via Sunrise : **SPCX, MU, SNDK, BOT, DRAM** ; **la page NE DONNE AUCUNE adresse de mint** ⇒ **Q0 NON atteint** ; PR-U-BACKPACK-MINTS **maintenu**.
- **Faits [lu, mono-op] à REJOUER quorum-2** (avis defi, `CHANTIERS:250` erratum orchestrateur) : FWDI Backpack `FWDtiB5fXHdVAewPqvHPL2dh4aBC1C6GacQbePoQXKjz` [**adresse 2nd** via Solana Compass], on-chain `permanentDelegate`, `pausableConfig(false)`, `confidentialTransferMint`, **`transferHook` présent `programId: null`**, `scaledUiAmountConfig(m=1)` ; **≥ 10 pools Raydium** (dont un CLMM USDC). ⇒ Backpack est **mesurable EN PRINCIPE** (pool USDC ouvert), MAIS Q0 non atteint (adresse non publiée par l'émetteur) et le `transferHook` non nul (même `programId: null`) exige la garde `transfer_hook_unknown` (§5).
- **instrumentClass** = droit sur titre (security-entitlement, NY law) ; **venueClass** = mixte (venues traditionnelles **+** pools AMM ouverts observés — l'erratum orchestrateur `CHANTIERS:250` corrige « se forme sur leur bourse » : FWDI a ≥ 10 pools Raydium). **`baseDec` lu PAR MINT** (piège d'unité, avis defi §défini).
- **Séquence** : Q0 (lecture sur place → FAITS → lecteur Sonnet 5 sur PR-U-BACKPACK-MINTS) → Q1 (**quorum-2 sous le PLAN D'OPÉRATEURS de l'ADR D2-bis.4, [cp1 B-IV-2]** — voie (A) `api.mainnet.solana.com` + Chainstack Solana, « zéro crédit HELIUS », pas « keyless » car un seul keyless est admis ; après PR-U-SOLANA-PUBLIC-RPC lu) → Q2 (`enumerateUniverse` seconde liste + `discovery` du pool USDC).
- **[cp1 B-IV-5 — ordre + biais].** Les **seuils d'admissibilité** ET la **règle de définition de `g_t` (§4)** sont **committés AVANT le rejeu quorum-2** des lectures mono-op (item 9 de l'ADR ; E-2 EN ATTENTE), avec le **biais déclaré** : le rejeu part d'un état où l'on a **DÉJÀ vu en mono-op** un `transferHook` **nul** (`programId: null`) et **≥ 10 pools Raydium** (dont un CLMM USDC) — pré-enregistrer les seuils après ce constat est biaisé, donc les seuils sont figés d'abord (biais de sélection déclaré, calque décision 80). Le `transferHook` présent (même `programId: null`) exige la garde `transfer_hook_unknown` (§5, R2).

### 3.2 Superstate Opening Bell (étapes 1-2)
- **Faits [lu, première main]** (`FAITS…:4-9`) : ALLOWLIST obligatoire (« must first add that address to the allowlist ») ; programme Allowlist Solana `HFkKyweJDUuGer5KaCst5qZSYD5aapKaD7xzdNaoRtfA` ; tokens Token-2022 (**USTB/USCC publiés ; mints des ACTIONS NON listés** sur smart-contracts) ; vente « use a supported DEX (if available) » ; 5 actions : GLXY, SBET, FWDI, EXOD, HSDT (petites caps crypto-liées) ; `legalEntity` = **Superstate Services LLC (transfer agent enregistré SEC)** — l'émetteur des actions est la **société tokenisée**.
- **Faits [lu, mono-op] à rejouer** (avis defi) : GLXY Superstate `2HehXG149TXuVptQhbiWAWDjbbuCsXSAtLTB5wc2aajK` [**adresse via communiqué Galaxy sur EDGAR = document d'émetteur**], `defaultAccountState=frozen`, `permanentDelegate`, `scaledUiAmountConfig(m=1)` ; **0 pool Raydium GLXY**. ⇒ **défini en droit, vide en fait** : étapes 1 (lecture du mint quorum-2) et 2 (existence d'un pool) ⇒ **abstention Q2 attendue** (`no_open_pool_found` OU `permissioned_participants` si un vault dégelé existe — avis defi §Superstate). **Ne JAMAIS substituer le flux Pyth** (sous-jacent, pas le token).
- **Correction d'un avis antérieur** (avis marché Q3) : les mints des ACTIONS Superstate **ne sont PAS résolus** (seuls USTB/USCC publiés) ⇒ GLXY vient d'un communiqué EDGAR, à lire dans **PR-U-SUPERSTATE-MINTS** avec les conditions d'accès **sec.gov**.

### 3.3 Remora (statut d'abord)
- **Faits** : site `remora.markets` **certificat TLS invalide** (`FAITS…:22-23`, navigation EXTERNE bloquée, **NON contournée**) ⇒ **AUCUN fait de première main**. Avis defi [2nd, non corroboré] : arrêt annoncé 2026-02-23 par Step Finance ; RWA.xyz affiche encore la plateforme ; TSLAr `FJug3z58gssSTDhVNkTse5fP8GRZzuidf9SRtfB2RhDe` [lu-médié via post X], **9 décimales**, `pausable`, une seule clé tient toutes les autorités.
- **Séquence** : **STATUT D'ABORD** (PR-U-REMORA-STATUS : annonce primaire du 2026-02-23) — si fermeture confirmée ⇒ **`issuer_wind_down_declared`** (État), faits d'offre seulement, **jamais un écart** ; le pool TSLAx/TSLAr est **hors mesure Bell** (pas de quote USD, avis defi §Remora). Aucune hypothèse tant que le statut n'est pas lu de première main.

### 3.4 PreStocks (ligne d'offre + `no_reference_close_by_construction`)
- **Faits [lu, première main]** (`FAITS…:20-21`) : tokens « 1:1 backed by SPV exposure » ; sociétés **privées** (Anthropic, OpenAI, Anduril, Kalshi, Polymarket, Neuralink) ; écosystème Meteora/Raydium/Jupiter/DFlow/Titan ⇒ **pools ouverts vraisemblables** ; « confer no ownership, voting, dividend … rights » ; « no guaranteed secondary-market liquidity ». **Pas de clôture boursière (sociétés privées).**
- **Faits [2nd, dépôt tiers]** (avis defi) : Token-2022 avec **transfer fees**, permanent delegate, `ScaledUiAmount` à multiplicateurs ≠ 1 ; aucun mint lu.
- **Séquence** : **indéfini par construction** (pas de MIC/clôture) ⇒ **ligne publiée « listed, not measurable under this method (no reference close) »** + État **`no_reference_close_by_construction`** ; le « mark » PreStocks est une valeur d'émetteur (relais de sticker) ⇒ **jamais un écart** (mesurer autrement = un autre produit, escalade investisseur — avis marché Q3, **non recommandée**). Les transfer fees biaiseraient le delta de vault (§5, `transfer_fee_present`).

## 4. Règle de définition de `g_t` (avis defi, à cuire au Q2)
`g_t` **défini ssi** : vault de pool détenant le mint avec **quote USD-stable** ∧ **MIC de clôture** existe ∧ **pas de frais de transfert** (ou corrigés par règle testée) ∧ mint **ni en pause ni en montants confidentiels**. Sinon : **étiquette de venue/classe OU abstention typée** (jamais un écart fabriqué). Un **multiplicateur constant ne prouve PAS l'absence d'événement** (un dividende en espèces hors chaîne ne laisse aucune trace) ⇒ résiduel dédié `corporate_action_offchain_unobservable` (§5). Le mécanisme d'événement est **le même partout : `ScaledUiAmount`** (avis defi §1, cohérent `rebase-scan.ts:75` `data[0]===43`) ; ce qui change est l'**AUTORITÉ** (propre à chaque mint chez Superstate/Backpack, partagée `S7vYFF…` chez xStocks) ⇒ le scan par autorité partagée est une **optimisation xStocks**, pas une dépendance de correction (⇒ `enumerationStrategy: "per-mint"` en donnée R1 pour ces émetteurs, adaptateur = R2).

## 5. Résiduels nouveaux — NOMMÉS ici, NON implémentés (R2, un seul re-pin)
Ces codes sont **de séance** ⇒ ils entreraient dans `RESIDUAL_CODES` (`residuals.ts:48`) ⇒ `newResidualCounts()` (`:61-65`) ⇒ digest ⇒ **re-pin**. **Interdits en T-1a-iv et en R1** ; **groupés dans le re-pin UNIQUE de R2** (au premier Q3 réel, décision 85). **[cp1 NB-R1-8]** la **LISTE R2 qui fait foi vit dans l'ADR D2-bis.3** (13 codes, incluant **`price_unobservable`** qui manquait des trois artefacts, et `title_event_undecodable`) — ce G0 n'en re-liste plus (les listes divergeaient). **⚠ collision `CLOSE_KEY` mesurée** : `no_reference_close_by_construction` matche `CLOSE_KEY` (`digest.ts:33`, via « reference ») ⇒ comme CLÉ de compteur il rougirait `assertNoClose` (`collect.test.ts:562-572`) ⇒ **renommé à l'implémentation R2** (règle de migration, ADR D2-bis.2). **Distinction** : les mêmes libellés servent d'**États de qualification** (`IssuerRef.qualification.stop` = **VALEUR non hachée, type fermé `QualificationStop`**, publiée) tant qu'aucun second émetteur n'est mesuré en séance — c'est leur usage en T-1a-iv, et c'est licite car une VALEUR de `stop` ne passe pas par le compteur haché.

## 6. Méthode (décision 86) + budget (décisions 83-84)
- **Chaque Q0** commence par une **LECTURE SUR PLACE de l'orchestrateur** : navigateur INTERNE puis EXTERNE ; **fichier de FAITS daté** ([lu] première main, URL, heure) AVANT le lancement des agents ; **puis** un lecteur **Sonnet 5** (`~/.claude/agents/lecteur.md`, effort max) traite les documents (une seule mission lecteur pour les lectures groupées, calque NB-8). **Refus/certificat invalide/CAPTCHA JAMAIS contournés** ; aucune page à clé lue.
- **AUCUN appel RPC/API avant lecture des conditions d'usage** de la source. **[cp1 B-IV-1]** verdicts de la SYNTHESE intégrés : Q1 sous le **plan d'opérateurs** (ADR D2-bis.4), PR-U-SOLANA-PUBLIC-RPC **LU** (`api.mainnet.solana.com` ADMIS ~3,5 req/s non-production ; `mainnet-beta` + publicnode EXCLUS) ; énumération Q2 par Raydium `api-v3` **ADMIS** (429/`Retry-After`) ; **GeckoTerminal keyless EXCLU ⇒ repli CoinGecko `/onchain` à clé** ; Orca INDÉTERMINÉ (procurement). Leçon `CHANTIERS:250`.
- **[cp1 B-IV-2] « Zéro crédit » = « zéro crédit HELIUS », affirmable SEULEMENT sous la voie (A) ou (B) du plan d'opérateurs** (ADR D2-bis.4) — **PAS « keyless quorum-2 »** : `operatorOf` fait collapser `api.mainnet.solana.com`/`mainnet-beta` en UN opérateur (`solana-foundation`) et publicnode est NON ADMIS ⇒ un seul keyless admis ⇒ **pas de quorum-2 keyless**. Voie (A) RETENUE : `api.mainnet.solana.com` (keyless) **+ Chainstack Solana** (`CHAINSTACK_SOLANA_URL`, payant, sous abonnement, opérateur distinct) — **RU Chainstack consommés** (jamais « zéro coût »), plafond sur un **compte DISTINCT** du 200 k -b1-bis-ii. **Toute dépense Helius (voie C = E-3) = APRÈS la sonde -b3d** (décision 84, créneau A, chemin critique prioritaire), **budget pré-enregistré en CRÉDITS** sur un **ledger DÉDIÉ à -iv** (`--ledger <path-iv>`, AM-1 : **jamais** celui de -b3d ni de -iii-b). Cumul cycle re-vérifié au dashboard AVANT/APRÈS.
- **Réutilise `enumerateUniverse`** de -iii-a1 (seconde liste d'émetteur injectée) ⇒ **pas de dédoublement** ; dépend donc de la **fusion de -iii-a1**.

## 7. Conditions de bascule vers le scénario (b) (décision 85 + avis marché Q2) — trois faits ENSEMBLE, avant le G0 de T-1b
1. **PR-U-BACKPACK-MINTS donne des adresses de mint dans un document d'émetteur, identiques on-chain** (Q0+Q1 Backpack positifs).
2. **[cp1 B-IV-6 — retour au VERBATIM de la décision 85]** « **pool USDC actif** » (`CHANTIERS:254`). Son **opérationnalisation** (« fills par session sur 30 j passant un test d'admissibilité pré-enregistré » — Q2 Backpack : `discovery` + règle `g_t` §4, hook nul/non-pause vérifiés) **attend E-2** (mesurée avec les critères C1-C6 de T-1a-iii, **sans seuil propre à Backpack**). **EN ATTENTE — aucun seuil présumé.**
3. **≥ 1 sous-jacent recoupe l'univers xStocks-Solana** (élargi) **à liquidité comparable**. **Fait mesuré** (`FAITS…:31`) : **AUCUN des 5 titres Backpack (SPCX/MU/SNDK/BOT/DRAM) ne recoupe nos 4 symboles** (TSLA/SPY/NVDA/AAPL) ; recoupement **possible avec l'univers xStocks ÉLARGI** (p. ex. **MU**) — **à mesurer en phase A de T-1a-iii** ⇒ **la condition (3) dépend de -iii-a**.
**Si les trois passent avant le G0 de T-1b** ⇒ (b) devient recevable comme **premier lot après le release** (décision investisseur). **Sinon** la seconde jambe serait une **abstention permanente** ⇒ (a) tient. Falsifiabilité (avis marché) : confirmée si une demande nommée hors xStocks arrive sous 30 jours ; tuée si toutes les demandes portent sur des symboles xStocks.

## 8. Doctrine « fenêtre courante » vs série fondatrice juillet-octobre 2025 (question + options + recommandation)
- **Constat mesuré** : la série fondatrice est calée sur **juillet-octobre 2025** (`ADR-B0:60` « TSLAx Solana jul-oct 2025 » ; `pools.ts:50-52` « 2025-07..10 founding window »). Un émetteur **né après** cette fenêtre (Backpack SPCX listé 2026-06-12, `FAITS…:28`) **n'a pas de Q4 par construction** sur la fenêtre fondatrice.
- **Précédent** (à ancrer) : **ADR-T1aii D1-bis (décision 44)** fait déjà « **fenêtre par chaîne** », « pools nés après = **depuis le premier fill, borne déclarée par pool** », « **seule la jambe Solana 2025 est comparable à Cong** » (`ADR-T1aii:61`).
- **Options** : (i) **fenêtre courante par émetteur** (bornes `[premier_fill, to]` déclarées par émetteur/mint, **NON comparable à la fondatrice Cong** — constat par régime, période déclarée) ; (ii) **exiger jul-oct 2025** (⇒ tout émetteur né après = **abstention Q4 permanente** « série fondatrice non définissable ») ; (iii) hybride (fondatrice pour xStocks, fenêtre courante étiquetée pour les autres).
- **Recommandation** : **(iii)** — conserver la fondatrice jul-oct 2025 pour xStocks (comparable Cong) ET autoriser une **fenêtre courante par émetteur, bornes déclarées, étiquetée « non comparable à la fenêtre fondatrice »**, calquée sur D1-bis. **⇒ amendement ADR-B0 D2** (posé dans le brouillon D2-bis). **Question INVESTISSEUR** : trancher (i)/(ii)/(iii) — un témoin honnête ne cache pas qu'une fenêtre courante n'est pas la fondatrice.

## 9. Neutralité d'affichage (avis marché Q4) — invariants publiés
- **Même mesure pour tous** ; critères **pré-enregistrés AVANT toute donnée du second émetteur**.
- **Ordre d'affichage = ALPHABÉTIQUE**, **jamais par magnitude** ; **aucun tri** par écart / abstention / résiduel (= classement interdit) ; **aucune couleur rouge/verte**.
- **AUCUN agrégat par émetteur** (une moyenne par émetteur est un quasi-score — interdit) ; **aucune phrase causale** (structure juridique vs chaîne vs liquidité confondues).
- **[cp1 NB-IV-4] AUCUNE comparaison NI agrégat ENTRE FENÊTRES.** Une fenêtre courante par émetteur (E-1 option (i)/(iii)) n'est **PAS comparable** à la fenêtre fondatrice jul-oct 2025 (régimes distincts) ⇒ jamais de delta, de moyenne, de classement ou de phrase qui rapproche un `g_t` de fenêtre courante d'un `g_t` fondateur ; chaque ligne porte **sa fenêtre déclarée** et son nombre de sessions ; l'affichage interdit tout croisement inter-fenêtres (calque ADR-T1aii D1-bis « seule la jambe Solana 2025 comparable à Cong »).
- **Étiquettes de classe d'instrument et de venue** sur chaque ligne (libellé légal + venue + nombre de sessions) ; **FWDI sur DEUX lignes** (émetteur, mint — car FWDI existe deux fois).
- Noms d'émetteurs **licites** (décision 69 vise les fournisseurs de recoupement cash) ; toute mention **exclut affiliation/partenariat/endorsement**. Contestation : **pas de « droit de réponse » éditorial** ; défense = recalculabilité + journal d'errata public daté avec `error_origin`. Formulation juridique (dénigrement UE/US) ⇒ **juriste** (décision 79).

## 10. Wording licite / illicite (avis marché Q5)
- **Licite** : « One method, applied identically to any issuer's token. » ; « At release: one issuer measured (xStocks, 4 symbols). » ; « Other issuers are listed in the plan as not yet measured, each with a stated reason. » ; « Admission criteria are pre-registered and public. » ; « Listed, not measurable under this method (no reference close). » ; « issuer-agnostic by method; single-issuer by coverage today ».
- **À éviter** : **« multi-issuer » au présent** (décision 85) ; « supports / covers / coming soon » accolés à un tiers ; « issuer-neutral benchmark » ; toute formule suggérant une relation ; les mots interdits (ADR-B0 D1 : bande de prix, « verified » nu, « guarantee », « partner », « live »). `gate:vocab` scope `apps/bell`.

## 11. Trois signaux à 30 jours (avis marché Q6 ; instrumentation décision 78 ; seuils pré-enregistrés AVANT T-1b)
1. **Demande nommée hors xStocks** (mail « request a symbol », profil curateur/prêteur/chercheur).
2. **Lecture du plan** : section « émetteurs » de `/bell/method` puis timeline ou `/bell/pubkey` (logs Caddy).
3. **Usage externe comparatif** (gouvernance, note de recherche, ou contestation d'un émetteur).
**Zéro sur trois à J+30 ⇒ le plan reste un plan.**

## 12. Procurements formés (doc 03 — identité complète, tentatives, usage ; règle de décision pré-enregistrée par PR ; une seule mission lecteur, NB-8)
| Id | Document / ressource | Identité / tentatives | Usage / règle |
|---|---|---|---|
| **PR-U-BACKPACK-MINTS** **[cp1 B-IV-3]** | document d'émetteur **de Backpack Securities** (l'émetteur des titres) donnant les **adresses de mint Solana** + « Tokenized Securities Issuer Terms ». **Sunrise = Wormhole Labs (TIERS de listing, `FAITS…:26`) ≠ document d'émetteur** (NON-Q0 seul) — l'ancien libellé « Backpack Securities/Sunrise » est corrigé | pages `backpack.exchange/stocks` + `learn.backpack.exchange/articles/what-is-sunrise` [lu, **aucune adresse**, `FAITS…:30`] ; navigation interne refusée (`FAITS…:13`) ⇒ lecteur Sonnet 5 via firecrawl/WebFetch, ou l'investisseur ouvre la page | **PIVOT** condition (1)/(b) ; Q0 Backpack ; lecture ⇒ adresse admise **seulement si publiée par Backpack Securities** (§2.1 définition fermée), sinon `identity_unpublished` |
| **PR-U-SUPERSTATE-MINTS** | pages par action `superstate.com/opening-bell` + **communiqué Galaxy sur EDGAR** (GLXY) + DEX supportés (derrière portail) | mints des actions non listés sur smart-contracts (`FAITS…:6`) ; conditions d'accès **sec.gov** à lire | Q0-Q1 Superstate ; lecture ⇒ adresse admise (document d'émetteur) sinon `identity_unpublished` |
| **PR-U-SUPERSTATE-ALLOWLIST** | source/IDL du programme Allowlist `HFkKyweJDUuGer5KaCst5qZSYD5aapKaD7xzdNaoRtfA` | seeds PDA, conditions du **Thaw permissionless** (`FAITS…:6-7`) | Q2 Superstate : décider `permissioned_participants` vs `no_open_pool_found` |
| **PR-U-REMORA-STATUS** | **annonce primaire** de la fermeture Remora (2026-02-23) | site cert invalide (`FAITS…:22-23`, non contourné) ; Step Finance [2nd] ; RWA.xyz affiche encore | **statut d'abord** ; confirmé ⇒ `issuer_wind_down_declared`, faits d'offre seulement |
| **PR-U-PRESTOCKS** | conditions PreStocks (SPV, absence de droits, absence de clôture) | `prestocks.com` [lu, `FAITS…:20-21`] ; mints non lus | ligne d'offre + `no_reference_close_by_construction` ; jamais un écart |
| **PR-U-SOLANA-PUBLIC-RPC** **[cp1 B-IV-1 — LU, verdicts rendus (SYNTHESE)]** | conditions/limites du RPC public Solana | **LU** (`solana.com/docs/references/clusters`, [lu]) : **`api.mainnet.solana.com` ADMIS SOUS CONDITIONS** (40 req/10 s/IP = 4 req/s ⇒ viser ~3,5 ; non-production, ponctuel ; 429/403 respectés) ; **`api.mainnet-beta.solana.com` EXCLU jusqu'à équivalence** (indice « Triton One » non vérifié) ; **publicnode NON ADMIS** (data-mining/business-purpose). **Procurement résiduel** : équivalence DNS `mainnet.solana.com`/`mainnet-beta` (SYNTHESE §4.5) | **prérequis de Q1** sous le plan d'opérateurs (voie A) ; plus « keyless quorum-2 » (un seul keyless admis) |
| **PR-U-RAYDIUM-TOS** **[cp1 B-IV-1 — LU]** | `api-v3.raydium.io` : termes/limites/attribution | **LU** (`docs.raydium.io/sdk-api/rest-api.md`, [lu]) : **ADMIS** (« Hit them anonymously », bots/agrégateurs accommodés ; respecter 429/`Retry-After` ; < 120 req/min si `transaction-v1`). **Procurement résiduel** : ToS générale `raydium.io` (SPA non lisible) + statut `raydium-app.to` (SYNTHESE §4.2) ; `robots.txt` non vérifié (hôte interdit à la mission de lecture) | **prérequis de l'énumération Q2** ; repli = `getProgramAccounts` on-chain |
| **PR-MKT-7** | pages de paramètres de risque **Kamino** + notes de curateurs | à lire | falsifieur avis marché Q1 : deux enveloppes du même sous-jacent à paramètres différenciés ET motivés ? (demande démontrée) |

**Renvois (déjà au dossier)** : PR-U-{GECKOTERMINAL,ORCA,XSTOCKS-API}-TOS (T-1a-iii) ; Helius (clé posée `CHANTIERS:52`). **Aucun procurement Ondo** (hors périmètre, décision 81).

## 13. Livrables, tuyaux, tests, mutants, R-25, découpe

### 13.1 Livrables (liste fermée)
| # | Sous-lot | Fichier | Contenu | Test / oracle |
|---|---|---|---|---|
| L-1 | Q0 (zéro code) | FAITS-\<émetteur\>-\<date\>.md (orchestrateur) + `docs/biblio/bell/L-lecture-\<émetteur\>-mints-…md` (lecteur) | identité première main + sha, par émetteur | relecture lecture-advisor (pas de test code) |
| L-2 | Q1 (**sous plan d'opérateurs (A)**, après -iii-a1 + PR-U-SOLANA-PUBLIC-RPC) | réutilise `apps/bell/src/universe.ts` `enumerateUniverse` (**seconde liste d'émetteur injectée — forme committée : constante `ISSUER_LIST_IV` déclarée dans le prereg, pas un littéral inline**) | mint on-chain quorum-2 (voie A) ⇒ `TokenRef` candidat ou `identity_unconfirmed` | **[cp1 NB-IV-2]** `bell_universe_enumerates_from_issuer_list_and_onchain` = test **PLANIFIÉ -iii-a1** (`G0-t1a-iii:109`), **PAS « existant »** (-iii-a1 non fusionné) ⇒ dépendance dure sur la fusion de -iii-a1 ; mutant identité-sans-on-chain |
| L-3 | Q2 (après PR-U-RAYDIUM-TOS) | réutilise `discover.ts`/allowlists d'hôtes de -iii | `discovery-\<MINT\>.json` : pool USD-stable + règle g_t §4 ⇒ `price_unobservable`/`no_open_pool_found`/… (États) | calque `bell_founding_registry_equals_discovery_measure` ; mutant hook-non-nul/pause ⇒ abstention |
| L-4 | échelle publiée | **[cp1 B-IV-4]** `IssuerRef.qualification {rung, stop}` renseignée par émetteur **DANS `ISSUERS` (`pools.ts`), en entrées à `tokens: []`** (jamais un `TokenRef`/`POOLS`) — LIEU déclaré, contradiction §1.2 levée | état public par palier (non haché) | `bell_issuer_qualification_state_is_unhashed` (état absent du digest) ; **+ 2 tests négatifs** : `bell_iv_issuers_absent_from_solana_tokens`, `bell_iv_issuers_absent_from_sources_issuers` |
| L-5 | docs | `docs/PLI-lot-t1a-iv.md` + prereg (seuils d'admissibilité, allowlists, ledger dédié, budget crédits, procurements) | ADR/PLI = docs | — |

### 13.2 Tuyaux (entrée / sortie / état / test)
| Tuyau | Entrée (produit) | Sortie (consomme) | État | Test |
|---|---|---|---|---|
| lecture sur place → FAITS → lecteur → identité | pages émetteur (orchestrateur navigateur) + PR-U-\* | `TokenRef` candidat (Q1) / `identity_unpublished` (Q0) | **upcoming** | `bell_universe_enumerates_from_issuer_list_and_onchain` |
| `enumerateUniverse` (2ᵉ liste) + on-chain → candidats | `enumerateUniverse` (-iii-a1) + quorum-2 keyless | candidats identité-confirmée / `identity_unconfirmed` | **upcoming** | (idem) |
| `discovery` → prix observable | `discover.ts` + vault keyless + règle g_t §4 | État Q2 publié (jamais un écart) | **upcoming** | calque C-4 |
| échelle Q0-Q5 → page plan | `IssuerRef.qualification` | `/bell/method` (T-1b) affiche l'état par émetteur | **item à déclencheur** (T-1b) | `bell_issuer_qualification_state_is_unhashed` |
| trois conditions (b) → décision investisseur | Q0+Q1+Q2 Backpack + recoupement -iii-a | décision investisseur bascule (b) | **item à déclencheur** (avant G0 T-1b) | (décision hors code) |

### 13.3 Ce qui reste `upcoming`
**Tout.** Aucun émetteur n'atteint Q5 en T-1a-iv ⇒ aucun n'est « built ». Bell reste `upcoming` (registre public exact). Aucun résiduel R2 ⇒ **aucun re-pin**.

### 13.4 R-25 (projection [abs], découpe)
T-1a-iv est majoritairement **méthode + lecture + données** (peu de code neuf : `enumerateUniverse` et `discover.ts` **réutilisés** de -iii). Code neuf : renseignement de `IssuerRef.qualification` par émetteur **en entrées `ISSUERS` à `tokens:[]`** (~données, B-IV-4) + `bell_issuer_qualification_state_is_unhashed` (~40 l.) + **[cp1 B-IV-4]** deux tests négatifs `bell_iv_issuers_absent_from_solana_tokens` / `bell_iv_issuers_absent_from_sources_issuers` (~30 l.) + adaptation de test seconde liste `ISSUER_LIST_IV` (~60 l.). Brut [abs] ~150-210 ×1,5 ≈ ~225-315 — **< 700 cible**, **1 lot** (données seules, voie (a) de B-IV-4). **Dépendances dures** : fusion de **R1** (registre par émetteur) + fusion de **-iii-a1** (`enumerateUniverse`) + **sonde -b3d** (avant tout Helius voie C). Q0 (lecture) = **lançable dès maintenant après B-IV-3** (définition fermée de « document d'émetteur »), **zéro code, zéro crédit**.

## 14. Risques (MAST)
| Mode | Menace | Contre-mesure |
|---|---|---|
| Dérive de spéc | « multi-issuer » au présent ; agrégat par émetteur | wording §10 ; neutralité §9 ; `gate:vocab` |
| Vérification incorrecte | RPC keyless avant lecture des conditions (récidive) | PR-U-SOLANA-PUBLIC-RPC/RAYDIUM lus AVANT tout appel (§6) ; rejeu quorum-2 des lectures mono-op de l'avis defi |
| Sur-déclaration couverture | Q3+ présenté fait ; « émetteur mesuré » avant Q5 | échelle publiée §2 ; « built » seulement à Q5 ; CA-11 |
| Terminaison prématurée | qualification traitée en résiduel ⇒ re-pin avant release | `IssuerRef.qualification` non hachée (§2) ; codes R2 nommés non implémentés (§5) |
| Rétention d'info | [2nd]/[lu-mono-op] remonté en [lu] | niveaux figés (§3) ; adresses Backpack/GLXY/TSLAr = [2nd]/[mono-op] déclarés |
| Confusion d'unités | `baseDec` supposé 8 | `baseDec` lu PAR MINT (Superstate 6, Remora 9, xStocks 8 — avis defi) |
| Budget | ledger partagé ; Helius avant sonde | ledger DÉDIÉ -iv (AM-1) ; Helius après sonde -b3d (décision 84) ; dashboard avant/après |

## 15. Questions (checkpoint-1)
- **Q1 → E-1 (INVESTISSEUR, EN ATTENTE — aucune réponse présumée)** — **Doctrine fenêtre courante** (§8) : trancher (i) fenêtre courante par émetteur / (ii) exiger jul-oct 2025 / (iii) hybride. **Reco (iii) sous DEUX gardes** : (a) **aucun agrégat NI comparaison ENTRE FENÊTRES** (NB-IV-4, §9) ; (b) **minimum de sessions pré-enregistré, sinon `under_calib`**. Amende ADR-B0 D2.
- **Q2 → [cp1 NB-IV-5] CLOS par la décision 82** (`CHANTIERS:241`, verbatim « PreStocks (pré-IPO : pas de clôture boursière ⇒ hors mesure d'écart, à déclarer) ») — « ligne d'offre + `no_reference_close_by_construction`, jamais un écart » est **acté** (plus une question ouverte) ; toute autre mesure = autre produit (escalade non recommandée). Item 6 de l'ADR = CLOS.
- **Q3 → E-2 (INVESTISSEUR, EN ATTENTE)** — **conditions 2 et 3 de la décision 85** mesurées avec les **critères C1-C6 de T-1a-iii, SANS seuil propre à Backpack** (pas de solde de vault / fenêtre 30 j inventés) ; condition (2) = « pool USDC actif » verbatim (B-IV-6) ; biais de sélection déclaré (§3.1 B-IV-5).
- **Q4 (orchestrateur)** — **Ordre T-1a-iv vs -iii-a1 vs R1** : T-1a-iv Q1/Q2 dépend de la fusion de -iii-a1 (`enumerateUniverse`, test **planifié** NB-IV-2) ET de R1 (registre par émetteur) ; Q0 lançable après B-IV-3 (définition fermée). Séquence : R1 → -iii-a1 → T-1a-iv (Q0 en parallèle, zéro code).
- **Q5 → E-3 (INVESTISSEUR, EN ATTENTE — CONDITIONNELLE)** — **Budget Helius -iv** : dû **SEULEMENT si la voie (C) du plan d'opérateurs est retenue** (Helius) ; sous la voie (A) retenue (Chainstack Solana + `api.mainnet.solana.com`), **zéro crédit Helius** ⇒ E-3 sans objet. Si (C) : plafond en crédits sur ledger dédié (calque -iii-b ≤ 50 000, décision 83), cumul re-vérifié, **après la sonde -b3d** (décision 84).
- **Q6 → [cp1 NB-IV-6] AJOUT à la liste de la décision 79** — comparaison publique d'émetteurs nommés + canal de signalement d'erreur factuelle : **ajouté à la liste de questions juriste EXISTANTE** (décision 79, `CHANTIERS:227`), pas une escalade neuve ; bloquant la **mise en ligne** de la page plan (T-1b), pas le code.

---

## Rôles et provenance
Q0 (lecture sur place) = **orchestrateur** (navigateur), puis **lecteur Sonnet 5** (une mission groupée). Prereg (seuils + allowlists + ledger) committé seul par l'orchestrateur. Worker Opus 4.8 max : L-2/L-3 (réutilisation `enumerateUniverse`/`discover.ts`) → G2 fraîche → checkpoint-2 (re-exécution CA-9) → G7. **Le worker ne committe jamais (R-20)** ; sortie vérifiée adversarialement (R-21). `error_origin` au G7.

## Annexe — citations d'avis re-vérifiées sur pièce (défauts)
- Avis architecture, échelle Q0-Q5 : **confond la colonne « arrêt déclaré » (État de qualification, non haché) et un code résiduel** — corrigé §2 (Q0-Q2 = `IssuerRef.qualification.stop` publié ; Q3+ = codes R2 hachés). Sans cette séparation, publier l'échelle re-pinnerait avant le release.
- Avis defi, ordre de qualification : les lectures on-chain (FWDI Backpack, GLXY Superstate, TSLAr Remora) sont **[lu, mono-op]/[2nd]** (adresses via Solana Compass / communiqué / post X) — **à rejouer quorum-2 après PR-U** ; **ne satisfont PAS Q0** (identité publiée par l'émetteur). Le `transferHook` Backpack **présent (`programId: null`)** exige `transfer_hook_unknown` (§5), pas une mesure directe.
- FAITS addendum 2 : **Sunrise = Wormhole Labs**, PAS venue Backpack (census v4 à corriger) ; **aucune adresse de mint publiée** ⇒ Q0 Backpack non atteint (contredit toute présentation de Backpack comme « prêt à mesurer »).

---

## PLI checkpoint-1 — table de traçabilité correction → section modifiée
| Correction (avis `claude-fable-5-1`, `f5996a0`) | Nature | Section(s) de ce G0 |
|---|---|---|
| **B-IV-1** intégrer la SYNTHESE | verdicts rendus (hôtes admis/exclus, repli CoinGecko, procurements résiduels) | §6, §12 (PR-U-SOLANA-PUBLIC-RPC, PR-U-RAYDIUM-TOS) |
| **B-IV-2** plan d'opérateurs Q1/Q2 | voie (A) Chainstack Solana + `api.mainnet.solana.com` ; « zéro crédit HELIUS » ; (B)/(C) | §3.1, §6, renvoi ADR D2-bis.4 |
| **B-IV-3** définition FERMÉE de « document d'émetteur » | domaines par émetteur, EDGAR, Sunrise=Wormhole non-Q0, post X non-Q0, critère NON-LLM ; PR-U-BACKPACK-MINTS corrigé | §2.1 (neuf), §12 |
| **B-IV-4** lieu de l'état de qualification | `ISSUERS` à `tokens:[]` + 2 tests négatifs ; §1.2 corrigé | §1.2, L-4 |
| **B-IV-5** ordre seuils + `g_t` avant rejeu quorum-2 | biais « hook nul & ≥10 pools déjà vus en mono-op » déclaré | §3.1 |
| **B-IV-6** condition (2) verbatim | « pool USDC actif » ; opérationnalisation → E-2 | §7 |
| **NB-IV-1** roster | lecture-advisor = Fable 5.1 ; lecteurs = Sonnet 5 | §2 Q0 |
| **NB-IV-2** test -iii « planifié -iii-a1 » | pas « existant » ; forme committée 2ᵉ liste (`ISSUER_LIST_IV`) | L-2 |
| **NB-IV-3** ligne Q4 paramétrée par E-1 | arrêt selon (i)/(ii)/(iii) | §2 gate Q4 |
| **NB-IV-4** interdire comparaison/agrégat ENTRE FENÊTRES | garde d'affichage | §9 |
| **NB-IV-5** Q2 PreStocks + item 6 clos | par la décision 82 | §15 Q2 |
| **NB-IV-6** Q6 juriste | ajout à la liste de la décision 79 | §15 Q6 |
| **NB-R1-8** (partagé) liste R2 qui fait foi | renvoi ADR D2-bis.3 ; `price_unobservable` ; collision `CLOSE_KEY` | §5 |

**Escalades EN ATTENTE (aucune réponse présumée)** : **E-1** (fenêtre courante, reco (iii) sous deux gardes) ; **E-2** (conditions 2 et 3 de la décision 85, critères C1-C6 sans seuil Backpack) ; **E-3** (budget Helius -iv, conditionnel voie C — sans objet sous la voie (A) retenue).

**Persistance (R-20/R-21)** : worker RÉDACTEUR `claude-opus-4-8[1m]` effort max ; ne committe pas, ne déclenche aucun workflow ; chaque `fichier:ligne` **ouvert et lu** ; `FAITS-navigateur-2026-09-20.md` ré-ouvert (Sunrise=Wormhole `:26`, FWDI Backpack mono-op `:28`, aucune adresse Backpack `:30`).


## Décisions investisseur reçues après le pli (2026-09-21 — `docs/CHANTIERS.md` décisions 87, 89, 90 ; consigné par l'orchestrateur)
- **E-1 RÉPONDUE — option (iii)** (décision 87) : fenêtre `[premier fill, fin]` déclarée par mint, étiquetée « non comparable à la fenêtre fondatrice » ; aucun agrégat ni comparaison entre fenêtres ; minimum de sessions pré-enregistré, sinon `under_calib`.
- **publicnode** (décision 89) : CONSERVÉ par décision de l'investisseur (« on a les droits ») — le verdict de lecture « non admise » de la SYNTHESE est surclassé pour les usages existants ; le plan d'opérateurs de ce lot reste la voie (A) (`api.mainnet.solana.com` + Chainstack Solana), inchangé.
- **Cible de symboles** (décision 90) : aucun chiffre ; roadmap d'univers après la phase A.
- **E-2 : EN ATTENTE.**

- **E-2 RÉPONDUE — mêmes critères pour tous** (décision 93, 2026-09-21) : critères et seuils pré-enregistrés de T-1a-iii (C1-C6), sans seuil propre à Backpack, committés avant tout rejeu quorum-2 d'une donnée Backpack.
