# GTM — MONARK Bell

**Gate 0.** Chercheur — modèle résolu : `claude-sonnet-5` (Sonnet 5), effort max, conforme.
**Date** : 2026-09-19. **Statut** : lot séparé de l'ADR-B0 (D9 : « l'ADR annonce l'objet, ne rédige pas le GTM »), à produire par chercheur + advisor-marché — **ce document est la contribution chercheur, pas la version finale acceptée** ; il reste à relire par advisor-marché avant clôture. **Discipline doc 03** : chaque chiffre a une source datée et un niveau [lu]/[abs]/[2nd] ; « demande non démontrée » est une réponse légitime, répétée volontairement plutôt que comblée. Journal complet, verbatim, URL et sha256 des pages archivées : `docs/biblio/bell/R-gtm-bell-sources.md`.
**Objet rappelé (ADR-B0 D1)** : Bell = témoin public attesté des actions tokenisées (faits recalculables, sans gate, sans score) + classe conforme d'écart hors séance pour curateurs (T-3, espace d'écart jamais espace de prix). Bell **mesure**, ne trade pas, ne note pas, ne price pas.
**Interdits opposables (ADR-B0 D1, gate:vocab)** : bande de prix ; « ±X % à 90 % » ; score/probabilité par événement ; « verified » nu ; « guarantee » (dire « bound ») ; « partner »/« partnership » (aucun TSV, curateur ou fournisseur cité ci-dessous n'est un partenaire) ; « live »/« built » avant la Définition de fini (D8) ; couverture revendiquée quand l'écart de TV n'est pas nul. « Signed » ≠ « verified » (Ed25519 atteste l'origine, jamais la vérité des faits).
**État du registre au 2026-09-19** : MONARK Bell = `upcoming`. Rien de ce document ne doit être lu comme une annonce de disponibilité.

---

## 1. Gaps adressés

| Gap mesuré | Preuve primaire | Ce que Bell mesure | Ce que Bell ne prétend pas |
|---|---|---|---|
| Oracles hors séance = dernier prix figé, aucun heartbeat | Chainlink : « will report the last onchain value published before the market closed » ; « do not publish updates … while markets are closed » [R3 §1.1, lu-P1] | `g_t = ln(P_token_VWAP_session/P_close_ref)` par session déclarée (régulier/pre/after/overnight/week-end/férié), convention explicite | Un prix de référence 24/7 ; ne remplace pas Chainlink/Pyth/RedStone |
| Aucun tiers indépendant exigé par l'ordre SEC | L7 : « Aucun tiers indépendant exigé : espace ouvert, pas mandat » ; Notice item i : « if the TSV does not have such procedures, state so » [lu] | Un témoin tiers public, faits recalculables (delta de halt, volume/plafond, supply/PoR, parité) | Une certification de conformité TSV ; ne se substitue pas à l'examen SEC |
| PoR = relais du custodian, pas un audit | Yahoo Finance : PoR « solves data transmission security, not institutional trustworthiness » [R3 §6.2, lu] | Écart supply on-chain vs PoR relayé + staleness ; phrase honnête « Y n'est pas vérifiée contre le custodian » | Un audit de réserves ; ne certifie pas le custodian |
| Rebasing incompatible AMM standard ; vote/redemption Robinhood absents jusqu'au 14/09/26 | Uniswap : « rebasing tokens … not supported by the protocol » [R3 §2.3] ; Tenev : « In-kind redemption and voting are coming » [R3 §5.3, lu] | (T-2) multiplicateur de rebase avant/après ex-date, surplus `balanceOf(pool)` vs réserves | Ne force pas la distribution ; ne redistribue rien lui-même |
| Aucune calibration publique de l'écart hors séance pour les curateurs | LTV/collateral factor xStocks/Ondo : NON TROUVÉ publié (R3 §4.2) ; Kamino : « price band mechanism » non calibré publiquement [WS 2026] | (T-3) classe distribution-free `tsv-offhours-gap-<horizon>`, commit/defer/abstain par (symbole×plateforme×régime) | Ne fixe pas de LTV ; ne remplace pas le curateur ; `under_calib` déclaré (week-end jusqu'à ≈mi-2027) |
| Témoin de halt vide à ce jour | Census CSV NYSE : 0 halt sur 15 grands caps depuis 2025-06-30 [interne, lu, ADR-B0 Contexte 5] | Le dit tel quel (n=0), publie la position prête à mesurer le premier | Ne prétend pas avoir « testé » la conformité aux halts |
| Licence de données non conçue pour republication | Massive (= Polygon.io rebaptisé 2026) : plans Individual « licensed for personal and non-professional use » [abs-WS, ce jour] | Déclare sa source Polygon en [2nd] ; sollicite un avis écrit avant publication dérivée | Ne publie aucun dérivé commercial avant cet avis (PR-B-3) |
| Un commentateur du dossier File 4-927 documente lui-même l'écart | Tyrone Ross (Turnqey Labs), lettre du 17/09/26 : « the rights parity verification the order requires is unverifiable from outside » [lu-WF] | (T-2) parité de droits mesurée depuis des données publiques, recalculable par n'importe quel tiers | Ne se présente pas comme LA réponse à cette lettre ; ne cite pas Ross comme demandeur de Bell |

---

## 2. Segments et acheteurs nommés

### 2.1 TSV candidats (statut au 2026-09-19, 2 jours après l'ordre)

| Acteur | Besoin | Réaction/statut post-ordre | Précédent de pricing / ce qu'il paie déjà | Canal d'accès |
|---|---|---|---|---|
| **Securitize** | Route US on-chain pour des titres déjà tokenisés | Carlos Domingo, CEO : « extremely positive… gives a way to trade real tokenized stocks » ; action +14 % [lu-WF CoinDesk] | FINRA broker-dealer régulé depuis mai 2026 [R2 §2.2, **2nd** — presse spécialisée citée par R2, pas une lecture SEC/FINRA primaire] | File 4-927 ; Notice TSV (item i) |
| **Dinari** | Même besoin, modèle déjà proche « issuer-sponsored » | Gabo Otte, CEO : « drawing an important line around what tokenized equities should actually represent » [lu-WF] | Transfer agent SEC enregistré ; « issuer disclosures » volontaires [R2 §7, abs] | idem |
| **Robinhood** | Combler un gap vote/redemption déjà admis publiquement | Johann Kerbrat : « a major step… will allow liquid tokenized securities markets to develop onshore » [lu-WF] | A annoncé redemption/vote « coming » le 14/09/26 (aveu direct, R3 §5.3) [lu] | idem |
| **Bullish** | Asseoir la légitimité d'une future venue via des transfer agents établis | Thomas Cowan : « not a broad opening… but a fantastic start » [lu-WF] | Rachat d'Equiniti en cours (transfer agent) [lu-WF, 13/07/26] | idem |
| **Superstate** | Redessiner l'offre « native issuance » pour se conformer | Robert Leshner, CEO : « issuers rethink products to conform with these rules » [lu-WF] | Series B 82,5 M$ (Bain Capital Crypto), 22/01/26 [R1 §1.6, abs] | idem |
| **Kraken (xStocks/Backed), Ondo** | Migrer d'un modèle offshore « price exposure only » vers un TSV US | « would need to change their models » pour la voie US [abs-WS CoinDesk] | Aucune candidature TSV annoncée à ce jour — **NON TROUVÉ** | idem |
| **Coinbase** | Ouvrir un pathway on-shore (flux déjà actif offshore) | Action +12 % le jour même ; aucune déclaration de candidature TSV trouvée [abs-WS] | Flux Chainlink « Coinbase B20 » déjà actif hors US [R1 §1.14, lu-WF] | idem |
| **Nasdaq, DTCC** | Sans objet direct — voies distinctes et antérieures | SR-2025-072 (mars 2026), No-Action Letter DTCC (déc. 2025) ; pas de lien confirmé au statut TSV de cet ordre — **NON TROUVÉ** | — | — |

### 2.2 Curateurs de risque

| Acteur | Besoin | Précédent chiffré (périmètre précisé) | Canal |
|---|---|---|---|
| **Gauntlet** | Calibrer LTV/seuils de liquidation hors séance sans tableau publié (R3 §4.2, NON TROUVÉ) | Aave ≈ 1,6 M$/an (réduit de 2 M$), **2023-2024, risque crypto général, pas actions tokenisées** [abs-WS] ; curateur nommé sur Morpho (Ondo SPYon/QQQon, RWA Vault) [R3 §4.2, lu] et Kamino V2 [abs-WS 2026] | Forums de gouvernance Aave/Morpho ; Kamino docs |
| **Chaos Labs** | Même besoin, chez les protocoles où il est mandaté | Aave, proposition « $400,000 increase, bringing our total annual compensation to $1.5M » (V2/V3/GHO), postée 09/08/2023 ; budget combiné ≈ 3 M$/an avec Gauntlet cité par la communauté [lu-WF governance.aave.com, page archivée] — **daté, risque crypto général, pas actions tokenisées** | Forums de gouvernance Aave/Morpho |
| **Steakhouse Financial** | idem, vaults xStocks Morpho Ethereum | 48 vaults Morpho, **0,5 M$+ ARR** ; fee de perf. plafonné à 50 % du rendement + fee de gestion [abs-WS 2026] | Morpho governance forum |
| **Kamino (curateurs V2 : Allez Labs, Gauntlet, Steakhouse, Rockaway, Sentora, Re7)** | Marché xStocks : « price band mechanism » non calibré publiquement | 6,3 M$ fournis / 5,75 M$ empruntés, 92 % util., avril 2026 [abs-WS] (≠ 23,1 M$ TVL R3, dates non réconciliées) | Kamino docs/gouvernance |

### 2.3 Prêteurs (protocoles)

Morpho (Ethereum : SPYX/TSLAx via Steakhouse ; Base : AAPLc/GOOGLc/NVDAc/METAc/SPCXc collatéral Coinbase), Aave/Euler (Base, mêmes tickers), Kamino (Solana, 8 tickers xStocks) — tous **sans table LTV/collateral factor publiée** pour ces marchés [R3 §4.2, NON TROUVÉ]. Besoin implicite = le même que leurs curateurs (2.2) ; c'est le gap exact que T-3 adresse. **Aucun de ces protocoles n'a été démarché à ce jour.**

### 2.4 Émetteurs

**Backed (xStocks)** — PoR Chainlink actif [R3 §6.1, abs-WS-P1]. **Ondo** — aucun mécanisme PoR trouvé [NON TROUVÉ]. **Dinari** — transfer agent SEC, disclosures volontaires [R2 §7]. Besoin commun : Notice item i exige de décrire « audits, certifications, attestations… if none, state so » [L7, lu] — un émetteur soigné de son image peut vouloir un point de donnée tiers à citer, sans que Bell certifie quoi que ce soit. Ce qu'ils paient déjà : NON TROUVÉ (aucun budget d'attestation tierce identifié pour ces trois). **Aucun émetteur démarché à ce jour.**

### 2.5 Examinateurs / régulateurs

**SEC Division of Trading and Markets** — délivre l'exemption, reçoit les Notices, examens « at any time » [L7, lu]. Besoin : des faits opposables au dossier, pas un mandat (« aucun tiers indépendant exigé »). **File 4-927** — dossier de commentaires : **8 lettres déjà déposées en <48 h** (17-18/09/26). Sur les **3 lettres organisationnelles ouvertes** (Turnqey Labs, The Insumer Model LLC, PRO) : **Tyrone Ross (Turnqey Labs)** documente un problème réel et proche de la thèse Bell — « the rights parity verification the order requires is unverifiable from outside » [lu-WF, verbatim] — mais propose une **publication de données machine-readable réconciliables par les participants**, pas explicitement un témoin/auditeur tiers nommé (nuance à ne pas sur-lire) ; **Borthwick (Insumer Model)** = extraction PDF non fiable, traité NON TROUVÉ ; **Delderfield (PRO)** = lettre hors sujet (IA/sécurité spatiale). Les 5 lettres individuelles restantes n'ont pas été ouvertes (budget de passe, procurement §8). **ESMA** — citation Cazenave toujours non confirmée en primaire [R2, procurement ouvert]. Ce que ces acteurs paient déjà : sans objet (régulateurs, pas acheteurs).

### 2.6 Presse / analystes / académiques

**CoinDesk** (Krisztian Sandor) — couverture la plus dense, citations dirigeants multiples [lu-WF, ce jour]. **The Block** (Sarah Wynn, 17/09/26 9h EDT) — couverture mécanique de l'ordre, **aucune mention de vérification/mesure indépendante** [lu-WF] — le silence presse sur « qui vérifie » est lui-même une donnée de positionnement. **Blockworks** — NON TROUVÉ dans cette passe (2 recherches dédiées infructueuses, ne pas conclure à une absence de couverture). **RWA.xyz** — agrégateur, pas vérificateur : « Reference data comes directly from issuers… We don't rely on second-hand aggregations when the original source is available » [lu-WF] ; aucune déclaration d'audit trouvée. **Cong et al. 2025** (SSRN, [lu] L6) et **Scharnowski 2026** (JIFMIM, [lu] L8) — seules mesures empiriques publiées à ce jour, aucune n'est en continu ni publiée par une venue ; besoin potentiel = un jeu de données rejouable en continu pour prolonger leurs travaux (non démontré, aucun contact établi).

### 2.7 Adjacent, hors liste mission (signalé, pas un segment validé)

STA (Securities Transfer Association) et transfer agents incumbents (Computershare, Equiniti/Bullish, Fairmint) ont publiquement averti la SEC des risques des tokens tiers (lettre 01/07/26, relayée [lu-WF CoinDesk 13/07/26]) — audience potentiellement réceptive à un témoin neutre documentant l'écart issuer-sponsored vs third-party. **Aucune demande observée de leur part** ; extrapolation signalée comme telle.

---

## 3. Positionnement — « the witness, not the oracle »

| Concurrent cité | Ce qu'il vend | Bell ne fait pas ça | Bell fait |
|---|---|---|---|
| **Chainlink / Pyth / RedStone** | Un prix (dernier close figé le week-end pour Chainlink ; 24/5 pour Pyth ; RedStone COO décrit lui-même le risque de « ghost prices » [R3 §1.1]) | Ne rebâtit pas un prix de référence 24/7 | Mesure l'écart entre le token et le dernier close déclaré, sessions non couvertes dites telles quelles |
| **Chaos Labs / Gauntlet / Steakhouse** | La curation (LTV, seuils de liquidation, jugement propriétaire) | Ne fixe aucun paramètre, ne recommande aucun seuil | Fournit `g_t` calibré (T-3) que le curateur consomme via son propre `yhat` |
| **RWA.xyz** | L'agrégation (AUM/holders déclarés par les émetteurs + on-chain) | Ne compile pas un TAM multi-plateforme | Recalcule des faits unitaires (halt, volume/plafond, supply/PoR) bit-à-bit rejouables, chaînés et signés |
| **Credora (RedStone, depuis sept. 2025)** | Un score — Probability of Default / Probability of Significant Loss [lu-WF] | Interdiction doctrinale : aucun score, aucune probabilité par événement (ADR-B0 D1) | Verdict commit/defer/**abstain** sur un intervalle déclaré, `under_calib` explicite tant que n < 99/cellule |

**Fait notable pour le positionnement** : RedStone (concurrent prix cité par la mission) a acquis Credora (concurrent score) en septembre 2025 [abs-WS, blog.redstone.finance] — convergence prix+score chez un même acteur, à l'opposé exact de la doctrine « mesurer, jamais scorer/pricer » de Bell.

**Ce qu'on ne fait pas (répété, opposable)** : pas de market making (produit 5 écarté — deviendrait un « Covered Firm »/dealer, décision investisseur 2) ; pas de LTV ; pas d'audit de custodian ; pas de certification de conformité TSV ; pas de couverture revendiquée avant calibration ; « signed » n'est jamais dit « verified ».

---

## 4. Offre et pricing

| Niveau | Contenu | Chemin servi | Précédent de pricing trouvé | Statut prix |
|---|---|---|---|---|
| **0 — Flux public** | `state.json` + `timeline.jsonl`, gratuit | `bell.monarkgate.tech` (T-1b) | — | Gratuit par doctrine (témoin public) |
| **1 — Rapport attesté** par symbole/venue (signé Ed25519) | Export structuré d'un fait recalculable donné | À définir (panneau + export gaté, D8) | Chainlink PoR pour émetteurs RWA : **NON TROUVÉ** de grille publique (2 recherches indépendantes, R3 + ce jour) ; Kaiko : **NON TROUVÉ** primaire (page officielle lue [lu-WF] : « contact us » seulement, chiffres 1-2,5 k$/mois vus seulement sur des sites tiers non primaires) | **À sonder**, aucun chiffre inventé |
| **2 — Accès MCP/API** | Requêtes programmatiques sur la timeline | Outil MCP (calque `attest`, disponible seulement après T-3 pour le bras `gate`) | x402 : CoinGecko et Circle facturent **0,01 $ USDC/requête** ; Cloudflare Monetization Gateway cite **0,01 $ à 2,00 $/appel** selon coût de calcul [abs-WS, confirmé ce jour] | Ordre de grandeur marché, pas un prix Bell engagé |
| **3 — Lettre de témoin** pour un dossier de conformité (émetteur/TSV/curateur) | Document signé référençant des faits publiés | Hors périmètre code de l'ADR-B0 à ce jour | Mandats de mesure de risque tiers, Aave/Chaos Labs/Gauntlet **2023-2024, généraux, pas actions tokenisées** : ≈1,5-1,6 M$/an chacun [abs-WS] ; Steakhouse ARR 0,5 M$+ sur 48 vaults [abs-WS] — **bornes d'ordre de grandeur seulement, pas des précédents directs** | **Acheteur non démontré, zéro précédent direct** |

**Constat central, répété volontairement (déjà énoncé 3× dans ADR-B0)** : **aucun acheteur n'est démontré à ce jour pour aucun de ces niveaux.** La valeur immédiate est une valeur de position (premier témoin tiers au moment où les TSV démarrent), pas un revenu mesuré.

---

## 5. Séquence de lancement (alignée T-1..T-3, ADR-B0 D7)

| Étape | Contenu | Dépendance / preuve |
|---|---|---|
| **(a) Flux public + annonce** | xStocks (Solana, Raydium/Jupiter) + Ondo (Ethereum) ≈ 47 % du marché [interne, ADR-B0 Contexte 4] ; VPS dédié `bell.monarkgate.tech`, Ed25519 ; brouillon d'annonce déjà écrit (ANNONCE-X, non publié, « go par action ») | T-1a clos → T-1b ; DNS/provisioning = action sortante sous go |
| **(b) Lettre de commentaire File 4-927** | Mesures rejouées (Table 4 Cong, deltas de halt) déposées au dossier | **Après T-1**, « go investisseur » explicite requis (DECISIONS pt 3) ; **8 lettres déjà déposées par des tiers en <48 h**, dont une (Ross/Turnqey) évoque déjà la vérifiabilité externe de la condition E sans nommer de tiers — fenêtre active, aucun délai de clôture trouvé (NON TROUVÉ) |
| **(c) 5 sondes desk/curateur pré-enregistrées** | Contact direct Gauntlet, Chaos Labs, Steakhouse, Kamino + 1 (ex. forum gouvernance Aave/Morpho) : « utiliseriez-vous un écart hors séance calibré via votre propre `yhat` ? » | Probes, pas des pitchs commerciaux ; réponse attendue majoritairement nulle/négative à ce stade (honnêteté KPI, §6) |
| **(d) Bascule TSV mi/fin octobre** | Dès le premier TSV avec Notice déposée et flux G actif, Bell bascule sa source primaire | Lancement TSV estimé « mid to late October » 2026 [R3 §2.4, lu-P2] ; **registre public des Notices TSV : NON TROUVÉ**, à surveiller (procurement PR-GTM-6) |
| **(e) Rapport mensuel public** | Synthèse : n halts, sessions calibrées/`under_calib`, abstentions comptées | Aligné D8 (uptime, latence ≤10 min, abstentions publiées) |
| **Option Stocklana** | Hackathon Solana Foundation, dépôt **25/09/26 16h ET**, prix porté à **121 k$** (5 pistes dont Pyth : « best use of Pyth market data ») [abs-WS, confirmé ce jour] | **Plan inchangé** (DECISIONS pt 7) ; adaptation = décision investisseur ultérieure, hors périmètre de ce document |

---

## 6. Signaux pré-enregistrés et KPI

**Confirme** : une lettre 4-927 réclamant explicitement une mesure/témoin indépendant nommé — **non déclenché à ce jour** : sur 3 lettres organisationnelles vérifiées (17-18/09/26), aucune ne le fait explicitement ; Ross (Turnqey Labs) s'en rapproche (« the rights parity verification the order requires is unverifiable from outside » [lu-WF]) sans nommer de tiers, Borthwick est illisible (échec d'extraction), Delderfield est hors sujet ; 5 lettres non encore lues. Autres signaux confirme : un curateur nommé demandant un état hors séance avec abstention ; premier TSV publiant son flux G.
**Tue** : Coinbase/Nasdaq publient leur métrologie interne ; six mois après le premier TSV sans halt ni approche de plafond ; Pyth publie une couverture calibrée par régime ; RedStone/Credora étend son score PD/PSL à l'écart hors séance actions tokenisées (convergence prix+score chez un concurrent direct, constat §3).
**KPI honnêtes (jamais « adoption »)** : lignes de timeline rejouées bit-identiques (D5) ; nombre d'abstentions publiées (pas un objectif à minimiser) ; nombre de sondes curateurs ayant répondu (sur 5, y compris les refus) ; citations presse nommant Bell (0 à ce jour) ; lettres File 4-927 citant Bell (0 à ce jour) ; halts observés (n=0 à ce jour, dit tel quel) ; uptime + latence de publication mesurée.

---

## 7. Risques

| Risque | Mécanisme | Mitigation | Résidu nommé |
|---|---|---|---|
| **Licence Massive « Individual Use »** | Massive = Polygon.io rebaptisé 2026 ; plans Individual « licensed for personal and non-professional use », redistribution exige un contrat Business [abs-WS, confirmé ce jour] | Avis écrit avant toute publication dérivée (PR-B-3, « à former ») | `data_license_gap` |
| **Sélection adverse (émetteurs)** | Un émetteur dont l'écart serait défavorable a intérêt à ne pas coopérer ; seuls les « bons élèves » pourraient enrichir l'accès de Bell | Bell reste construit sur données publiques par défaut, ne dépend d'aucune coopération d'émetteur pour publier | `issuer_selection_bias` |
| **Commoditisation Pyth/Chainlink** | Signal « tue » : Pyth publie une couverture calibrée par régime ; RedStone/Credora étend son score au gap hors séance | Distinction méthodologique tenue (distribution-free/abstain vs probabilité par événement) mais pas une protection commerciale | `commoditization` |
| **Statut juridique** | Bell n'est **ni un TSV ni un Covered Firm** (définitions L7 p.1 et p.3) ; un « report » ou une « lettre de témoin » mal formulée pourrait être lue comme une certification | D1 interdits + `gate:vocab` ; jamais « partner » avec un TSV cité ; « signed » ≠ « verified » (D5, D8) | `mislabeled_attestation` |
| **Réputation** | Un seul fait mal calculé (delta de halt, fuseau) publié sous signature détruit la valeur de recalculabilité | Rejeu bit-identique + mutants nommés (halt décalé, fuseau DST, casse `Reason`) avant toute publication (D5) | `wrong_fact_fatal` |
| **Acheteur non démontré** | Zéro précédent de pricing direct pour un « témoin public de TSV » (répété 3× dans ADR-B0) | Séquence (a)-(e) teste la demande avant tout investissement commercial | `no_demonstrated_buyer` |

---

## 8. Procurement (format Dettes)

| Id | Manque | Tentatives faites | Usage prévu |
|---|---|---|---|
| PR-GTM-1 | Lettre Borthwick/Insumer Model (PDF) et 5 lettres File 4-927 non ouvertes (Brown, Redoutey, Morita, Templeman, Cody L.) | Hrefs individuels obtenus [lu-WF] ; Borthwick : WebFetch a rendu une réponse contradictoire ; curl direct → 403 WAF sec.gov (2 tentatives, headers navigateur complets, voir journal) | Trancher si l'une réclame explicitement une mesure/témoin indépendant (signal §6) |
| PR-GTM-2 | Ordre 34-106402 (PDF complet) — délai de clôture des commentaires | Page de règle lue [lu-WF], délai absent ; PDF déjà signalé binaire/non décodé par R3 ; curl direct → 403 WAF | Confirmer la fenêtre exacte avant la lettre (b) |
| PR-GTM-3 | Grille tarifaire Chainlink PoR pour émetteurs RWA | 2 recherches web indépendantes (R3 + ce jour), silence confirmé | Borne de pricing niveau 1 |
| PR-GTM-4 | Devis Kaiko primaire (pas de grille publique) | Page pricing officielle lue et archivée [lu-WF], renvoie à « contact us » | Borne de pricing niveau 1 |
| PR-GTM-5 | Couverture Blockworks de l'ordre du 17/09/26 | 2 requêtes dédiées, NON TROUVÉ | Compléter §2.6 |
| PR-GTM-6 | Registre public des Notices TSV déposées (condition C) | Recherche non tentée au-delà de la page de règle | Déclencher la bascule (d) au bon moment |
| PR-GTM-7 (= ADR-B0 PR-B-3) | Avis écrit licence Massive/Polygon « Individual Use » | Mainteneur/Polygon — à former | Condition de publication dérivée, tous niveaux d'offre |
| PR-GTM-8 | Mandat 2026 spécifique actions tokenisées payé à un curateur (Gauntlet/Chaos Labs/Steakhouse) | Seuls mandats crypto généraux 2023-2024 trouvés | Précédent de pricing direct niveau 3 |

---

## Sources

Journal complet, verbatim, URL et empreintes sha256 des pages archivées : `docs/biblio/bell/R-gtm-bell-sources.md` (dossier `_txt/`). Bases internes [lu] : PROPOSITIONS/R1/R2/R3/L6/L7/L8/DECISIONS/ANNONCE-X (`Downloads/PRODUITS/etude-2026-09-19/`), ADR-B0-programme-bell.md (`docs/adr/`), CHANTIERS.md (extraits), GTM v1 (`Downloads/GTM monark version 1/GTM/`, structure/ton seulement). Recherche externe datée du 2026-09-19 : CoinDesk, The Block, sec.gov (page de règle + 3 lettres 4-927 lues sur 8), docs.rwa.xyz, kaiko.com, governance.aave.com — voir §§1-9 du journal pour le détail par source.
