# GTM — MONARK Bell

**Gate 0.** Chercheur — modèle résolu : `claude-sonnet-5` (Sonnet 5), effort max, conforme.
**Thèse (à charger avant tout le reste)** : Bell est une valeur de position dont le seul acheteur plausible est une DAO qui vote déjà un budget de risque ; tout le reste est image ou bruit.
**Date** : 2026-09-19 (revu après relecture advisor-marché, même date). **Statut** : lot séparé de l'ADR-B0 (D9 : « l'ADR annonce l'objet, ne rédige pas le GTM »), à produire par chercheur + advisor-marché — **ce document est la contribution chercheur pliée sur la revue advisor-marché, pas une clôture** ; journal complet, verbatim, URL et sha256 : `docs/biblio/bell/R-gtm-bell-sources.md`. **Discipline doc 03** : chaque chiffre a une source datée et un niveau [lu]/[abs]/[2nd] ; « demande non démontrée » est une réponse légitime, répétée volontairement plutôt que comblée.
**Objet rappelé (ADR-B0 D1)** : Bell = témoin public attesté des actions tokenisées (faits recalculables, sans gate, sans score) + classe conforme d'écart hors séance pour curateurs (T-3, espace d'écart jamais espace de prix). Bell **mesure**, ne trade pas, ne note pas, ne price pas.
**Interdits opposables (ADR-B0 D1, gate:vocab)** : bande de prix ; « ±X % à 90 % » ; score/probabilité par événement ; « verified » nu ; « guarantee » (dire « bound ») ; « partner »/« partnership » (aucun TSV, curateur ou fournisseur cité ci-dessous n'est un partenaire) ; « live »/« built » avant la Définition de fini (D8) ; couverture revendiquée quand l'écart de TV n'est pas nul. « Signed » ≠ « verified » (Ed25519 atteste l'origine, jamais la vérité des faits).
**ESC-1 tranchée (c), DECISIONS pt 13, verbatim** : « Bell publie l'écart seul, le close de référence reste une entrée non republiée ; un tiers rejoue avec sa propre licence de données. » La Définition de fini dit « recalculable par un tiers disposant d'une licence de close » ; le close n'apparaît **jamais** dans les fichiers publiés ; avis écrit à Polygon sollicité en parallèle, **non bloquant**.
**État du registre au 2026-09-19** : MONARK Bell = `upcoming`. Rien de ce document ne doit être lu comme une annonce de disponibilité.

---

## 1. Gaps adressés

| Gap mesuré | Preuve primaire | Ce que Bell mesure | Ce que Bell ne prétend pas |
|---|---|---|---|
| Oracles hors séance = dernier prix figé, aucun heartbeat | Chainlink : « will report the last onchain value published before the market closed » ; « do not publish updates … while markets are closed » [R3 §1.1, lu-P1] | `g_t = ln(P_token_VWAP_session/P_close_ref)` par session déclarée (régulier/pre/after/overnight/week-end/férié) ; **l'écart seul est publié, `P_close_ref` n'est jamais republié** (ESC-1(c), DECISIONS pt 13) | Un prix de référence 24/7 ; ne remplace pas Chainlink/Pyth/RedStone ; un tiers qui veut rejouer `g_t` doit disposer de sa propre licence de close |
| Aucun tiers indépendant exigé par l'ordre SEC | L7 : « Aucun tiers indépendant exigé : espace ouvert, pas mandat » ; Notice item i : « if the TSV does not have such procedures, state so » [lu] | Un témoin tiers public, faits recalculables (delta de halt, volume/plafond, supply/PoR, parité) | Une certification de conformité TSV ; ne se substitue pas à l'examen SEC |
| PoR = relais du custodian, pas un audit | Yahoo Finance : PoR « solves data transmission security, not institutional trustworthiness » [R3 §6.2, lu] | Écart supply on-chain vs PoR relayé + staleness ; phrase honnête « Y n'est pas vérifiée contre le custodian » | Un audit de réserves ; ne certifie pas le custodian |
| Rebasing incompatible AMM standard ; vote/redemption Robinhood absents jusqu'au 14/09/26 | Uniswap : « rebasing tokens … not supported by the protocol » [R3 §2.3] ; Tenev : « In-kind redemption and voting are coming » [R3 §5.3, lu] | (T-2) multiplicateur de rebase avant/après ex-date, surplus `balanceOf(pool)` vs réserves | Ne force pas la distribution ; ne redistribue rien lui-même |
| Aucune calibration publique de l'écart hors séance pour les curateurs | LTV/collateral factor xStocks/Ondo : NON TROUVÉ publié (R3 §4.2) ; Kamino : « price band mechanism » non calibré publiquement [WS 2026] | (T-3) classe distribution-free `tsv-offhours-gap-<horizon>`, commit/defer/abstain par (symbole×plateforme×régime) | Ne fixe pas de LTV ; ne remplace pas le curateur ; `under_calib` déclaré (week-end jusqu'à ≈mi-2027) |
| Témoin de halt vide à ce jour | Census CSV NYSE : 0 halt sur 15 grands caps depuis 2025-06-30 [interne, lu, ADR-B0 Contexte 5] | Le dit tel quel (n=0), publie la position prête à mesurer le premier | Ne prétend pas avoir « testé » la conformité aux halts |
| Licence de données du fournisseur de close non conçue pour republication | Massive (= Polygon.io rebaptisé le **30/10/2025**, « effective today (October 30, 2025) at 4 PM ET » [lu-WF, massive.com/blog/polygon-is-now-massive]) : plans Individual **« Individual use only », « Non-pros only »** [abs-WS] | **Bell publie l'écart seul ; le close de référence n'est jamais republié** ; un tiers rejoue avec sa propre licence de close ; avis écrit à Polygon sollicité en parallèle, **non bloquant** (ESC-1(c)) | La recalculabilité de `g_t` par un tiers est **conditionnée à une licence de close chez ce tiers**, pas à celle de Bell ; la dépendance est déplacée, pas supprimée |
| Un commentateur du dossier File 4-927 pose le même diagnostic, propose un autre remède | Tyrone Ross (Turnqey Labs, vendeur d'infra de réconciliation RIA — §2.8), lettre du 17/09/26 : « the rights parity verification the order requires is unverifiable from outside » ; remède proposé = **le TSV lui-même** publie fills/halts/corporate actions en machine-readable, pas un témoin tiers ; « the market can absorb dozens of venues and investors will be better served than they are today » [lu-WF, verbatim] | (T-2) parité de droits mesurée dès aujourd'hui depuis des données publiques, sans attendre qu'un TSV auto-publie | **Ross = diagnostic, pas une demande de Bell** ; ne cite pas Ross comme demandeur ; Bell comble l'intervalle avant que le remède de Ross (si un TSV l'adopte) n'existe |

---

## 2. Segments et acheteurs nommés

### 2.1 TSV candidats (statut au 2026-09-19, 2 jours après l'ordre)

| Acteur | Besoin | Réaction/statut post-ordre | Précédent de pricing / ce qu'il paie déjà | Canal d'accès |
|---|---|---|---|---|
| **Securitize** | Route US on-chain pour des titres déjà tokenisés | Carlos Domingo, CEO : « extremely positive… gives a way to trade real tokenized stocks » [lu-WF CoinDesk] | Statut broker-dealer FINRA : **mis en quarantaine — [2nd] non confirmé**, R2 cite une presse spécialisée, pas une lecture BrokerCheck/FINRA primaire (procurement PR-GTM-10) | File 4-927 ; Notice TSV (item i) |
| **Dinari** | Même besoin, modèle déjà proche « issuer-sponsored » | Gabo Otte, CEO : « drawing an important line around what tokenized equities should actually represent » [lu-WF] | Transfer agent SEC enregistré ; « issuer disclosures » volontaires [R2 §7, abs] | idem |
| **Robinhood** | Combler un gap vote/redemption déjà admis publiquement | Johann Kerbrat : « a major step… will allow liquid tokenized securities markets to develop onshore » [lu-WF] | A annoncé redemption/vote « coming » le 14/09/26 (aveu direct, R3 §5.3) [lu] | idem |
| **Bullish** | Asseoir la légitimité d'une future venue via des transfer agents établis | Thomas Cowan : « not a broad opening… but a fantastic start » [lu-WF] | Rachat d'Equiniti en cours (transfer agent) [lu-WF, 13/07/26] | idem |
| **Superstate** | Redessiner l'offre « native issuance » pour se conformer | Robert Leshner, CEO : « issuers rethink products to conform with these rules » [lu-WF] | Series B 82,5 M$ (Bain Capital Crypto), 22/01/26 [R1 §1.6, abs] | idem |
| **Kraken (xStocks/Backed), Ondo** | Migrer d'un modèle offshore « price exposure only » vers un TSV US | « would need to change their models » pour la voie US [abs-WS CoinDesk] | Aucune candidature TSV annoncée à ce jour — **NON TROUVÉ** | idem |
| **Coinbase** | Ouvrir un pathway on-shore (flux déjà actif offshore) | Aucune déclaration de candidature TSV trouvée [abs-WS] — mouvement de cours (+12 % le jour de l'ordre) écarté comme signal de demande, pas un précédent | Flux Chainlink « Coinbase B20 » déjà actif hors US [R1 §1.14, lu-WF] | idem |
| **Nasdaq, DTCC** | Sans objet direct — voies distinctes et antérieures | SR-2025-072 (mars 2026), No-Action Letter DTCC (déc. 2025) ; pas de lien confirmé au statut TSV de cet ordre — **NON TROUVÉ** | — | — |

### 2.2 Curateurs de risque

**Lecture correcte du tableau ci-dessous (thèse, en-tête)** : les montants sont ce que Gauntlet/Chaos Labs/Steakhouse **gagnent comme vendeurs de curation** — ce n'est **pas** un précédent de ce qu'un acheteur dépenserait pour une mesure tierce type Bell. Le fait pertinent est ailleurs : ces montants prouvent qu'un **trésor de protocole (DAO)** vote déjà des budgets de risque de cet ordre de grandeur — c'est ce budget voté, pas le curateur, qui est le point de comparaison pour Bell.

| Acteur | Besoin | Ce que l'acteur gagne comme vendeur de curation (périmètre précisé) | Canal |
|---|---|---|---|
| **Gauntlet** | Calibrer LTV/seuils de liquidation hors séance sans tableau publié (R3 §4.2, NON TROUVÉ) | Aave ≈ 1,6 M$/an (réduit de 2 M$), **2023-2024, risque crypto général, pas actions tokenisées** [abs-WS] ; curateur nommé sur Morpho (Ondo SPYon/QQQon, RWA Vault) [R3 §4.2, lu] et Kamino V2 [abs-WS 2026] | Forums de gouvernance Aave/Morpho ; Kamino docs |
| **Chaos Labs** | Même besoin, chez les protocoles où il est mandaté | Aave, proposition « $400,000 increase, bringing our total annual compensation to $1.5M » (V2/V3/GHO), postée 09/08/2023 ; budget combiné ≈ 3 M$/an avec Gauntlet cité par la communauté [lu-WF governance.aave.com, page archivée] — **daté, risque crypto général, pas actions tokenisées** | Forums de gouvernance Aave/Morpho |
| **Steakhouse Financial** | idem, vaults xStocks Morpho Ethereum | 48 vaults Morpho, **0,5 M$+ ARR** ; fee de perf. plafonné à 50 % du rendement + fee de gestion [abs-WS 2026] | Morpho governance forum |
| **Kamino (curateurs V2 : Allez Labs, Gauntlet, Steakhouse, Rockaway, Sentora, Re7)** | Marché xStocks : « price band mechanism » non calibré publiquement | 6,3 M$ fournis / 5,75 M$ empruntés, 92 % util., avril 2026 [abs-WS] (≠ 23,1 M$ TVL R3, dates non réconciliées) | Kamino docs/gouvernance |

### 2.3 Prêteurs (protocoles)

Morpho (Ethereum : SPYX/TSLAx via Steakhouse ; Base : AAPLc/GOOGLc/NVDAc/METAc/SPCXc collatéral Coinbase), Aave/Euler (Base, mêmes tickers), Kamino (Solana, 8 tickers xStocks) — tous **sans table LTV/collateral factor publiée** pour ces marchés [R3 §4.2, NON TROUVÉ]. Besoin implicite = le même que leurs curateurs (2.2) ; c'est le gap exact que T-3 adresse. **Aucun de ces protocoles n'a été démarché à ce jour.**

### 2.4 Émetteurs

**Backed (xStocks)** — PoR Chainlink actif [R3 §6.1, abs-WS-P1]. **Ondo** — aucun mécanisme PoR trouvé [NON TROUVÉ]. **Dinari** — transfer agent SEC, disclosures volontaires [R2 §7]. Besoin commun : Notice item i exige de décrire « audits, certifications, attestations… if none, state so » [L7, lu] — un émetteur soigné de son image peut vouloir un point de donnée tiers à citer, sans que Bell certifie quoi que ce soit. Ce qu'ils paient déjà : NON TROUVÉ. **Aucun émetteur démarché à ce jour.**

### 2.5 Examinateurs / régulateurs

**SEC Division of Trading and Markets** — délivre l'exemption, reçoit les Notices, examens « at any time » [L7, lu]. Besoin : des faits opposables au dossier, pas un mandat (« aucun tiers indépendant exigé »). **File 4-927** — dossier de commentaires : **8 lettres déposées en <48 h — 1 pertinente, 1 illisible, 1 hors sujet, 5 non lues**. **Tyrone Ross (Turnqey Labs, vendeur d'infra de réconciliation RIA — §2.8)** : « the rights parity verification the order requires is unverifiable from outside » ; remède proposé = **le TSV lui-même** publie un registre de contrats (CUSIP/FIGI), fills/liquidity-pool data machine-readable, corporate actions standardisées, et « a public, timestamped event log for halts, pool parameter changes and access-standard changes » [lu-WF, verbatim] — **pas un témoin tiers nommé** ; conclut « the market can absorb dozens of venues and investors will be better served than they are today » [lu-WF, verbatim]. **Borthwick (Insumer Model)** = extraction PDF non fiable, NON TROUVÉ. **Delderfield (PRO)** = hors sujet (IA/sécurité spatiale). 5 lettres restantes non ouvertes (procurement §8). **ESMA** — citation Cazenave toujours non confirmée en primaire [R2, procurement ouvert]. Ce que ces acteurs paient déjà : sans objet (régulateurs, pas acheteurs).

### 2.6 Presse / analystes / académiques

**CoinDesk** (Krisztian Sandor) — couverture la plus dense, citations dirigeants multiples [lu-WF, ce jour]. **The Block** (Sarah Wynn, 17/09/26 9h EDT) — couverture mécanique de l'ordre, **aucune mention de vérification/mesure indépendante** [lu-WF]. **Blockworks** — NON TROUVÉ dans cette passe (2 recherches dédiées infructueuses). **RWA.xyz** — agrégateur, pas vérificateur : « Reference data comes directly from issuers… We don't rely on second-hand aggregations when the original source is available » [lu-WF]. **Cong et al. 2025** (SSRN, [lu] L6) et **Scharnowski 2026** (JIFMIM, [lu] L8) — seules mesures empiriques publiées, aucune en continu ni publiée par une venue.

### 2.7 Adjacent, hors liste mission (signalé, pas un segment validé)

STA (Securities Transfer Association) et transfer agents incumbents (Computershare, Equiniti/Bullish, Fairmint) ont publiquement averti la SEC des risques des tokens tiers (lettre 01/07/26, relayée [lu-WF CoinDesk 13/07/26]) — audience potentiellement réceptive à un témoin neutre. **Aucune demande observée de leur part.**

### 2.8 Infra de réconciliation RIA (plausible, non démontré, nouveau)

Turnqey Labs (Tyrone Ross) se décrit : « Turnqey builds the data infrastructure that registered investment advisers and wealth platforms use to see, reconcile and report on client crypto and tokenized assets » [lu-WF, sec.gov, lettre 4-927]. Produits confirmés indépendamment [abs-WS] : TAIP (holdings intelligence, `Qscore`), Qeychain (self-custody tracker), intégrations Wealthbox/Morningstar ByAllAccounts. Sa lettre propose que les TSV publient eux-mêmes registre de contrats (CUSIP/FIGI), fills machine-readable, et un « public, timestamped event log for halts, pool parameter changes and access-standard changes » [lu-WF, verbatim]. **Lecture pour Bell** : un vendeur d'infra RIA qui réconcilie déjà des positions tokenisées pour des advisers est un consommateur plausible d'un flux de faits recalculables — **mais aucune demande n'a été faite à Bell**, et Ross demande que le TSV publie lui-même, pas qu'un tiers le fasse à sa place. Extrapolation signalée comme telle.

---

## 3. Positionnement — « the witness, not the oracle »

| Concurrent cité | Ce qu'il vend | Bell ne fait pas ça | Bell fait |
|---|---|---|---|
| **Chainlink / Pyth / RedStone** | Un prix (dernier close figé le week-end pour Chainlink ; 24/5 pour Pyth ; RedStone COO décrit lui-même le risque de « ghost prices » [R3 §1.1]) | Ne rebâtit pas un prix de référence 24/7 | Mesure l'écart entre le token et le dernier close déclaré (jamais republié), sessions non couvertes dites telles quelles |
| **Chaos Labs / Gauntlet / Steakhouse** | La curation (LTV, seuils de liquidation, jugement propriétaire) | Ne fixe aucun paramètre, ne recommande aucun seuil | Fournit `g_t` calibré (T-3) que le curateur consomme via son propre `yhat` |
| **RWA.xyz** | L'agrégation (AUM/holders déclarés par les émetteurs + on-chain) | Ne compile pas un TAM multi-plateforme | Recalcule des faits unitaires (halt, volume/plafond, supply/PoR) bit-à-bit rejouables, chaînés et signés |
| **Credora (RedStone, depuis le 04/09/2025 [lu-WF CoinDesk])** | Une note lettre A+ à D **et**, en méthodologie publiée, une probabilité — Probability of Default / Probability of Significant Loss [lu-WF, credora.network/docs/methodologies/defi-rating-scale/, vérifié 2× ce jour] | Interdiction doctrinale : aucun score, aucune probabilité par événement (ADR-B0 D1) | Verdict commit/defer/**abstain** sur un intervalle déclaré, `under_calib` explicite tant que n < 99/cellule |

**Fait notable pour le positionnement** : RedStone (concurrent prix) a acquis Credora (concurrent score) le **04/09/2025** [lu-WF, coindesk.com/business/2025/09/04/crypto-oracle-firm-redstone-acquires-defi-credit-specialist-credora] ; mise sur le marché du produit combiné annoncée le **06/11/2025** [lu-WF, blog.redstone.finance] — convergence prix+score chez un même acteur, à l'opposé exact de la doctrine « mesurer, jamais scorer/pricer » de Bell. **Point de désaccord avec la revue advisor-marché, signalé et non tranché unilatéralement** : la revue indique le PD/PSL « absent de credora.network et /docs » ; **vérification directe faite deux fois ce jour** sur `credora.network/docs/methodologies/defi-rating-scale/` confirme au contraire la présence verbatim de « Asset methodologies output a Probability of Default (PD) » et « product methodologies … output a Probability of Significant Loss (PSL) » — la présentation publique de la note (A+ à D) est distincte de la méthodologie documentée (PD/PSL), les deux coexistent sur la même page officielle. Non tranché en écrasant l'un des deux constats ; procurement PR-GTM-9 formé pour une revue méthodologique complète par un second lecteur.

**Ce qu'on ne fait pas (répété, opposable)** : pas de market making (produit 5 écarté — deviendrait un « Covered Firm »/dealer, décision investisseur 2) ; pas de LTV ; pas d'audit de custodian ; pas de certification de conformité TSV ; pas de couverture revendiquée avant calibration ; « signed » n'est jamais dit « verified ».

---

## 4. Offre et pricing

| Niveau | Contenu | Chemin servi | Précédent de pricing trouvé | Statut prix |
|---|---|---|---|---|
| **0 — Flux public** | `state.json` + `timeline.jsonl`, gratuit | `bell.monarkgate.tech` (T-1b) | — | Gratuit par doctrine (témoin public) |
| **1 — Rapport attesté** par symbole/venue (signé Ed25519) | Export structuré d'un fait recalculable donné ; **ne porte jamais le close de référence lui-même** (ESC-1(c)) — seul l'écart `g_t` est exporté, le rejeu suppose une licence de close côté destinataire | À définir (panneau + export gaté, D8) | Chainlink PoR pour émetteurs RWA : **NON TROUVÉ** de grille publique ; Kaiko : **NON TROUVÉ** primaire (page officielle lue [lu-WF] : « contact us » seulement) | **À sonder**, aucun chiffre inventé |
| **2 — Accès MCP/API** | Requêtes programmatiques sur la timeline | Outil MCP (calque `attest`, disponible seulement après T-3 pour le bras `gate`) | x402 : CoinGecko et Circle facturent **0,01 $ USDC/requête** ; Cloudflare Monetization Gateway cite **0,01 $ à 2,00 $/appel** [abs-WS, confirmé ce jour] | Ordre de grandeur marché, pas un prix Bell engagé |
| **3 — Lettre de témoin** pour un dossier de conformité (émetteur/TSV/curateur) | Document signé référençant des faits publiés | Hors périmètre code de l'ADR-B0 à ce jour | **Zéro précédent, y compris indirect** — les mandats Gauntlet/Chaos Labs (≈1,5-1,6 M$/an, 2023-2024) rémunèrent un service de curation, pas une mesure tierce achetée ; seul fait transférable : un trésor de protocole **vote** des budgets de risque de cet ordre de grandeur | **Acheteur non démontré ; payeur plausible = trésor de protocole (thèse, en-tête)** |

**Constat central, répété volontairement** : **aucun acheteur n'est démontré à ce jour pour aucun de ces niveaux.** La valeur immédiate est une valeur de position (premier témoin tiers au moment où les TSV démarrent), pas un revenu mesuré.

---

## 5. Séquence de lancement (alignée T-1..T-3, ADR-B0 D7)

| Étape | Contenu | Dépendance / preuve |
|---|---|---|
| **(a) Flux public + annonce** | xStocks (Solana, Raydium/Jupiter) + Ondo (Ethereum) — part de marché non publiée (ADR-B0 amendement O-3 2026-09-19 : chiffre retiré, recomputé au census) ; VPS dédié `bell.monarkgate.tech`, Ed25519 ; brouillon d'annonce déjà écrit (ANNONCE-X, non publié, « go par action ») | T-1a clos → T-1b ; DNS/provisioning = action sortante sous go |
| **(b) Lettre de commentaire File 4-927** | Mesures rejouées (Table 4 Cong) ancrées sur **Q3 et Q6 seulement** (impact liquidité/prix/reporting ≤10 min/trading nocturne ; pertinence des plafonds Tier 1/2) — **la sollicitation ne pose aucune question sur les halts** [lu, texte intégral pré-extrait `txt/sec-34-106402-innovation-exemption.txt`, p.56-59] : ne jamais présenter la lettre comme réponse à une demande sur les halts | **Après T-1**, « go investisseur » requis (DECISIONS pt 3) ; **8 lettres déposées en <48 h : 1 pertinente (Ross, diagnostic sans nommer de tiers), 1 illisible, 1 hors sujet, 5 non lues** ; aucun délai de clôture stipulé dans le texte intégral [lu, confirmé, pas un NON TROUVÉ] ; dépôt par formulaire web, email `rule-comments@sec.gov` (objet : File Number 4-927), ou courrier (Secretary, SEC, 100 F Street NE, Washington DC 20549-1090) [lu] |
| **(c) 5 sondes pré-enregistrées, critère comportemental (ordre : 1 d'abord)** | **(1)** Forum gouvernance Morpho, vault Steakhouse xStocks — poster `g_t` TSLAx/SPYx, n=63 week-ends, k/n dépassements >1/2/5 %, rejeu bit-identique, `under_calib` déclaré ; succès = un curateur/délégué demande un symbole/horizon sous 14 j. **(2)** Kamino (marché xStocks, « price band ») — même post, 8 tickers ; succès = demande d'export ou citation dans un paramètre. **(3)** Gauntlet via forum Ondo/Morpho (SPYon/QQQon) ; succès = message public référençant `g_t`. **(4)** Dinari : « citeriez-vous un écart supply/PoR tiers dans vos issuer disclosures ? » ; succès = demande d'export signé. **(5)** Turnqey : envoi de l'URL `timeline.jsonl` ; succès = second appel mesuré dans les logs | Probes à critère comportemental, jamais un pitch ; aucune ne dit « partner », « verified », « live » ; réponse attendue majoritairement nulle à ce stade |
| **(d) Bascule TSV mi/fin octobre** | Dès le premier TSV avec Notice déposée et flux G actif, Bell bascule sa source primaire | Lancement TSV estimé « mid to late October » 2026 [R3 §2.4, lu-P2] ; registre public des Notices TSV : NON TROUVÉ (PR-GTM-6) |
| **(e) Rapport mensuel public** | Synthèse : n halts, sessions calibrées/`under_calib`, abstentions comptées | Aligné D8 (uptime, latence ≤10 min, abstentions publiées) |
| **Option Stocklana** | Hackathon Solana Foundation, dépôt **25/09/26 16h ET**, prix porté à **121 k$** (5 pistes dont Pyth : « best use of Pyth market data ») [abs-WS, confirmé ce jour] | **Plan inchangé** (DECISIONS pt 7) ; adaptation = décision investisseur ultérieure |

---

## 6. Signaux pré-enregistrés et KPI

**Pivot unique** : un curateur ou une DAO nommée consomme `g_t` publiquement dans les 30 j suivant T-1b. **Tue le pivot** : 30 j de silence sur les 3 sondes DAO (1-3, §5) ET premier TSV auto-publiant fills/halts + un oracle (Chainlink/Pyth) republiant l'écart hors séance comme feed dérivé gratuit.

**Confirme** : une lettre 4-927 réclamant explicitement une mesure/témoin indépendant nommé — **non déclenché à ce jour** : sur 3 lettres organisationnelles vérifiées, aucune ne le fait explicitement ; Ross (Turnqey Labs) s'en rapproche sans nommer de tiers (diagnostic, remède = auto-publication par le TSV, §2.8) ; Borthwick illisible ; Delderfield hors sujet ; 5 non lues. Autres signaux confirme : un curateur nommé demandant un état hors séance avec abstention ; premier TSV publiant son flux G.
**Tue** : Coinbase/Nasdaq publient leur métrologie interne ; six mois après le premier TSV sans halt ni approche de plafond ; Pyth publie une couverture calibrée par régime ; RedStone/Credora étend son score PD/PSL à l'écart hors séance ; **plus largement, tout TSV publiant fills+halts en machine-readable (remède Ross) combiné à un oracle republiant l'écart hors séance comme feed dérivé gratuit** — le witness devient redondant des deux côtés à la fois.
**KPI honnêtes (jamais « adoption », jamais un mouvement de cours)** : lignes de timeline rejouées bit-identiques (D5) ; **rejeu indépendant effectué par un tiers** ; **`g_t` cité dans un post de gouvernance** (Morpho/Aave/Kamino/Ondo) ; nombre d'abstentions publiées (pas un objectif à minimiser) ; nombre de sondes réussies (sur 5, critère comportemental §5(c), refus inclus) ; citations presse nommant Bell (0 à ce jour) ; lettres File 4-927 citant Bell (0 à ce jour) ; halts observés (n=0 à ce jour, dit tel quel) ; uptime + latence de publication.

---

## 7. Risques

| Risque | Mécanisme | Mitigation | Résidu nommé |
|---|---|---|---|
| **Licence de close chez le tiers rejoueur** | Massive (= Polygon.io rebaptisé le 30/10/2025 [lu-WF]) : plans Individual « Individual use only », « Non-pros only » [abs-WS] — mais **Bell ne republie jamais le close** (ESC-1(c)) : la licence n'est plus bloquante pour Bell lui-même | Avis écrit à Polygon en parallèle, non bloquant (PR-B-3) ; **un tiers qui veut rejouer `g_t` doit avoir sa propre licence de close** — dépendance déplacée, pas supprimée | `close_license_shifted` |
| **Sélection adverse (émetteurs)** | Un émetteur dont l'écart serait défavorable a intérêt à ne pas coopérer ; seuls les « bons élèves » pourraient enrichir l'accès de Bell | Bell reste construit sur données publiques par défaut, ne dépend d'aucune coopération d'émetteur pour publier | `issuer_selection_bias` |
| **Commoditisation Pyth/Chainlink** | Signal « tue » : Pyth publie une couverture calibrée par régime ; RedStone/Credora étend son score au gap hors séance ; TSV auto-publie (remède Ross) | Distinction méthodologique tenue (distribution-free/abstain vs probabilité par événement) mais pas une protection commerciale | `commoditization` |
| **Statut juridique** | Bell n'est **ni un TSV ni un Covered Firm** (définitions L7 p.1 et p.3) ; un « report » ou une « lettre de témoin » mal formulée pourrait être lue comme une certification | D1 interdits + `gate:vocab` ; jamais « partner » avec un TSV cité ; « signed » ≠ « verified » (D5, D8) | `mislabeled_attestation` |
| **Réputation** | Un seul fait mal calculé (delta de halt, fuseau) publié sous signature détruit la valeur de recalculabilité | Rejeu bit-identique + mutants nommés (halt décalé, fuseau DST, casse `Reason`) avant toute publication (D5) | `wrong_fact_fatal` |
| **Acheteur non démontré** | Zéro précédent de pricing direct, y compris indirect, pour un « témoin public de TSV » | Séquence (a)-(e) teste la demande (pivot unique, §6) avant tout investissement commercial | `no_demonstrated_buyer` |

---

## 8. Procurement (format Dettes)

| Id | Manque | Tentatives faites | Usage prévu |
|---|---|---|---|
| PR-GTM-1 | Lettre Borthwick/Insumer Model (PDF) et 5 lettres File 4-927 non ouvertes | Hrefs obtenus [lu-WF] ; Borthwick : WebFetch contradictoire ; curl → 403 WAF sec.gov | **Routé à l'investisseur pour procurement** (accès institutionnel/pdftotext) |
| PR-GTM-2 | Délai de clôture des commentaires File 4-927 | **RÉSOLU cette passe** : texte intégral pré-extrait localement (`txt/sec-34-106402-innovation-exemption.txt`) lu [lu] — aucun délai stipulé dans le texte de sollicitation lui-même (constat confirmé, pas un manque de recherche) | Fermé |
| PR-GTM-3 | Grille tarifaire Chainlink PoR pour émetteurs RWA | 2 recherches web indépendantes, silence confirmé | Borne de pricing niveau 1 |
| PR-GTM-4 | Devis Kaiko primaire (pas de grille publique) | Page pricing officielle lue et archivée [lu-WF] | Borne de pricing niveau 1 |
| PR-GTM-5 | Couverture Blockworks de l'ordre du 17/09/26 | 2 requêtes dédiées, NON TROUVÉ | Compléter §2.6 |
| PR-GTM-6 | Registre public des Notices TSV déposées (condition C) | Recherche non tentée au-delà de la page de règle | Déclencher la bascule (d) |
| PR-GTM-7 (= ADR-B0 PR-B-3) | Avis écrit licence Massive/Polygon « Individual Use » | Mainteneur/Polygon — à former | Non bloquant depuis ESC-1(c), reste dû pour Bell en tant que consommateur de données |
| PR-GTM-8 | Mandat 2026 spécifique actions tokenisées payé à un curateur | Seuls mandats crypto généraux 2023-2024 trouvés | Précédent de pricing direct niveau 3 |
| PR-GTM-9 | Revue méthodologique complète Credora (PD/PSL vs présentation lettre A+/D) | Vérification directe faite 2× ce jour (présence confirmée) ; désaccord avec la revue advisor-marché signalé §3, non tranché unilatéralement | Trancher la présentation publique exacte du score Credora pour le positionnement §3 |
| PR-GTM-10 | Statut broker-dealer FINRA de Securitize (BrokerCheck) | R2 cite une presse spécialisée [2nd], pas de lecture BrokerCheck primaire | Confirmer/infirmer §2.1 |

---

## Sources

Journal complet, verbatim, URL et empreintes sha256 des pages archivées : `docs/biblio/bell/R-gtm-bell-sources.md` (dossier `_txt/`). Bases internes [lu] : PROPOSITIONS/R1/R2/R3/L6/L7/L8/DECISIONS (relu, points 11-19 confirmés dont pt 13 ESC-1)/ANNONCE-X (`Downloads/PRODUITS/etude-2026-09-19/`), texte intégral pré-extrait de l'ordre 34-106402 (`Downloads/PRODUITS/etude-2026-09-19/txt/`), ADR-B0-programme-bell.md (`docs/adr/`), CHANTIERS.md (extraits), GTM v1 (structure/ton seulement). Recherche externe : CoinDesk, The Block, sec.gov, docs.rwa.xyz, kaiko.com, governance.aave.com, massive.com/blog, credora.network/docs — voir journal pour le détail par source.
