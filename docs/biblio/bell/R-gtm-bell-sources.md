# R-GTM-Bell — Journal des sources (GTM MONARK Bell)

**Gate 0.** Agent chercheur — modèle résolu : `claude-sonnet-5` (Sonnet 5), effort max, conforme.
**Date de la passe** : 2026-09-19 (2 rondes : collecte initiale, puis pli de la revue advisor-marché, même date). **Discipline doc 03** : [lu]/[abs]/[2nd] par finding ; chiffres copiés jamais reformulés ; verbatim ≤ 30 mots ; NON TROUVÉ consigné plutôt qu'inféré ; contradictions rapportées sans arbitrage.
**Mission** : GTM de MONARK Bell. Document final : `F:\Monark\docs\GTM-BELL.md`.
**Infrastructure** : `mcp__memstack` — **ConnectionRefused** signalé par le harness. Passe menée sans memstack.
**Note de processus (ronde 2)** : l'orchestrateur a relayé une revue advisor-marché sous forme de 13 points de correction fermés + 1 thèse à écrire en tête. Traités tous les 13 ci-dessous. **Un point (n°7, Credora PD/PSL) a été re-vérifié directement (2× WebFetch, résultat identique) et contredit la prémisse du point** — signalé explicitement dans le GTM §3 et ici, non tranché en écrasant l'un des deux constats, procurement PR-GTM-9 formé plutôt qu'une correction silencieuse.

---

## Note méthodologique sur les niveaux de preuve

- `[lu]` = document/page ouvert et son texte réellement extrait/lu.
- `[lu-WF]` = URL fetchée via WebFetch, contenu médié par un résumeur intermédiaire ; citations verbatim seulement quand rendues explicitement entre guillemets.
- `[abs-WS]` = synthèse WebSearch, page non ouverte directement par l'agent.
- `[2nd]` = mention secondaire (chiffre cité par une source qui cite elle-même un tiers).
- `[interne]` = fait tiré d'un document interne MONARK déjà [lu] par un autre agent de la campagne.

---

## Sources internes lues intégralement (base de la mission)

| Document | Emplacement | Statut |
|---|---|---|
| PROPOSITIONS, R1, R2, R3, L6, L7, L8, ANNONCE-X | `C:\Users\KACIMI\Downloads\PRODUITS\etude-2026-09-19\` | [lu] intégral (ronde 1) |
| **DECISIONS-investisseur-2026-09-19.md** | idem | [lu] intégral **relu en ronde 2** — le fichier a grossi sur disque de 10 à **19 points** entre les deux rondes (rédaction concurrente, même campagne). **Point 13 vérifié verbatim** : « ADR-B0 ESC-1 (close de référence et licence Polygon « Individual Use ») : **(c)** — « Bell publie l'écart seul, le close de référence reste une entrée non republiée ; un tiers rejoue avec sa propre licence de données. » Conséquence : la Définition de fini dit « recalculable par un tiers disposant d'une licence de close » ; le close n'apparaît jamais dans les fichiers publiés ; demande d'avis écrit à Polygon en parallèle (item formé, non bloquant). » — confirme intégralement la directive de l'orchestrateur, pas pris sur parole sans re-lecture. Point 12 (registre Bell, capteur `FLEET_AGENTS`) et point 14 (ESC-2, VPS déployé par l'orchestrateur en SSH) notés en passant, hors périmètre GTM direct. |
| **Texte intégral pré-extrait, ordre SEC 34-106402** | `C:\Users\KACIMI\Downloads\PRODUITS\etude-2026-09-19\txt\sec-34-106402-innovation-exemption.txt` (2 116 lignes) | [lu] intégral de la section VI « Solicitation of Comments » (10 questions numérotées, p.56-59) + section duration/conclusion. **Nouveau en ronde 2** — remplace la dépendance à L7 (paraphrase) et à la page communiqué SEC (résumé) par le texte réglementaire primaire lui-même, déjà pré-extrait au format doc 03 §6. |
| ADR-B0-programme-bell.md | `F:\Monark\docs\adr\` | [lu] intégral (ronde 1), non remodifié en ronde 2 |
| CHANTIERS.md, GTM v1 | idem | [lu] ciblé (ronde 1) |

**Fait interne central [interne, lu]** : abonnement **Massive/Polygon Stocks Starter, 29 $/mois**, clé `POLYGON_API_KEY`. Licence **« Individual Use »** — voir §3 pour la date exacte de rebranding (corrigée en ronde 2 : **30/10/2025**, pas « début 2026 »). **Statut du blocage levé en ronde 2** : DECISIONS pt 13 (ESC-1c) rend cette licence **non bloquante** pour Bell lui-même (Bell ne republie jamais le close) ; elle redevient bloquante uniquement pour un **tiers** qui voudrait rejouer `g_t` sans sa propre licence de close.

---

## Findings — recherche web, ronde 1 (2026-09-19, matin)

### 1. TSV candidats — statut de candidature post-ordre 2026-09-17

**[lu-WF] CoinDesk, Krisztian Sandor, « SEC opens door to tokenized U.S. stock trading. Here's who could benefit »**, 2026-09-17 (page archivée localement §9) :
- **Securitize** — Carlos Domingo, CEO : « This is extremely positive because it gives a way to trade real tokenized stocks. »
- **Bullish** — Thomas Cowan : « It's showing that regulators are thinking about how to enable AMMs and new market structure. » ; « It is definitely not a broad opening that the crypto community was looking for...but it is a fantastic start. »
- **Dinari** — Gabo Otte, CEO : « The SEC is drawing an important line around what tokenized equities should actually represent »
- **Robinhood** — Johann Kerbrat : « The SEC innovation exemption is a signal that tokenization is ready to come to the United States. This is a major step »
- **Superstate** — Robert Leshner, CEO : « I expect over the coming weeks, months we'll see issuers rethink products to conform with these rules. »
- **Aerodrome/Dromos Labs** — Jim Petrila : « The SEC's innovation exemption is a meaningful, directionally bullish signal for DeFi. »
- **Coinbase, Kraken, Ondo, Nasdaq, DTCC** : aucune candidature TSV explicite trouvée — NON TROUVÉ. **Mouvements de cours (Securitize +14 %, Coinbase +12 %) notés en ronde 1 puis retirés du GTM en ronde 2 (point 4 de la revue) : une réaction de cours n'est pas un signal de demande ni un précédent de pricing.**

**[lu-WF] The Block, Sarah Wynn**, 2026-09-17, 9:00 AM EDT (page archivée §9) : aucune réaction d'entreprise nommée, aucune mention de vérification indépendante.

**Blockworks** — NON TROUVÉ (2 requêtes dédiées).

### 2. Antécédent — lobbying des transfer agents (2026-07-13)

**[lu-WF] CoinDesk, 2026-07-13** (page archivée §9) : Securities Transfer Association (STA) avertit sur les tokens tiers ; nomme Computershare, Equiniti (rachat Bullish), Fairmint (transfer agents) vs Figure, Securitize, Ondo, Kraken, Dinari, tZERO, Centrifuge (tokenisation). Segment adjacent GTM §2.7.

### 3. Identité de « Massive » — **date corrigée en ronde 2**

**[lu-WF] massive.com/blog/polygon-is-now-massive** (URL correcte ; la tentative `massive.com/blog/polygon-io-is-now-massive` en ronde 2 a échoué 404, corrigée par une recherche dédiée) : citation exacte rendue par l'outil — « We have just renamed Polygon.io to Massive.com, effective today (October 30, 2025) at 4 PM ET. » **Date exacte : 30/10/2025**, PAS « début 2026 » comme écrit en ronde 1 (erreur corrigée suite à la revue advisor-marché, point 2). La page elle-même ne mentionne aucune licence « Individual use only »/« Non-pros only » — cette terminologie provient de la page de tarification [abs-WS, non re-fetchée en primaire cette ronde — niveau maintenu à [abs-WS], pas upgradé à [lu-WF]]. **Recherche croisée** (natlawreview.com, fisd.net, tigm.com) confirme la même date de façon convergente.

### 4. Curateurs de risque — précédents de pricing

**[abs-WS]** Gauntlet quitte Aave pour Morpho fin février 2024 ; Aave payait Gauntlet **1,6 M$/an**, réduit de 2 M$.
**[lu-WF] governance.aave.com, ARFC Chaos Labs Scope and Compensation Amendment**, 9 août 2023 (page archivée §9) : « $400,000 increase, bringing our total annual compensation to $1.5M » (V2/V3/GHO) ; budget combiné ≈3 M$/an cité par la communauté. **Daté 2023-2024, risque crypto général, pas actions tokenisées.**
**[abs-WS]** Steakhouse Financial : 48 vaults Morpho, 0,5 M$+ ARR. **[lu-WF] docs.morpho.org/curate/concepts/fee/** : fee perf. ≤50 % du rendement + fee de gestion.
**[abs-WS]** Kamino V2 : curateurs Allez Labs, Gauntlet, Rockaway, Steakhouse, Sentora, Re7 Capital. Marché xStocks : « price band mechanism » Chainlink, non calibré publiquement. 6,3 M$ fournis/5,75 M$ empruntés, 92 % util., avril 2026 (≠ 23,1 M$ TVL R3, non réconcilié).

**Correction ronde 2 (point 5 de la revue)** : ces montants ont été **mal étiquetés en ronde 1** comme « précédent de pricing » pour une mesure tierce type Bell. Ce sont en réalité des salaires de curation payés par un trésor de protocole (DAO) à un vendeur de service — un flux économique différent. Reclassés dans le GTM §2.2/§4 comme preuve indirecte qu'un **trésor de protocole vote des budgets de risque**, pas comme précédent direct pour Bell.

### 5. Positionnement — Credora et RWA.xyz

**[abs-WS ronde 1, puis vérifié [lu-WF] 2× en ronde 2]** RedStone a acquis Credora. **Dates exactes obtenues en ronde 2** : acquisition annoncée **04/09/2025** [lu-WF, coindesk.com/business/2025/09/04/crypto-oracle-firm-redstone-acquires-defi-credit-specialist-credora — « Crypto Oracle Firm RedStone Acquires DeFi Credit Specialist Credora »] ; mise sur le marché du produit combiné **06/11/2025** [lu-WF, blog.redstone.finance/2025/11/06/redstone-brings-credora-to-market-following-acquisition-introducing-defi-risk-ratings-to-morpho-and-spark/].

**Vérification directe du contenu méthodologique, faite deux fois (ronde 1 puis ronde 2, résultat identique)** sur `credora.network/docs/methodologies/defi-rating-scale/` [lu-WF] :
- « Asset methodologies output a Probability of Default (PD), the likelihood the asset fails its core redemption or reserve commitments. »
- « Product methodologies (loan pairs, vaults, and pools) output a Probability of Significant Loss (PSL), the annualized probability of a loss of 1% or more of principal. »
- « Both are expressed on the same Credora PD Curve... »
- Format de présentation : « The scale combines letter grades (A+ through D) with probability percentages… the Score is derived from a representative PD within each rating band. »

**Conflit avec la revue advisor-marché relayée par l'orchestrateur (point 7)** : la revue affirme le PD/PSL « absent de credora.network et /docs ». **Ma vérification directe, répétée, contredit cette affirmation** sur l'URL précise `/docs/methodologies/defi-rating-scale/`. Hypothèse non tranchée : la revue a peut-être consulté une autre page (accueil, /docs racine) où seule la note lettre A+/D apparaît sans le détail PD/PSL — les deux présentations (lettre publique, méthodologie PD/PSL) coexistent sur des pages différentes du même site, ce qui pourrait expliquer un constat divergent selon la page precisément visitée. **Non tranché unilatéralement** : signalé dans le GTM §3, procurement PR-GTM-9 formé pour qu'un second lecteur fasse une revue méthodologique complète (toutes les pages Credora, pas une seule URL).

**[lu-WF] docs.rwa.xyz/methodology/overview** (page archivée §9) : sourcing par issuers + on-chain ; « We don't rely on second-hand aggregations when the original source is available. » Aucune déclaration d'audit indépendant trouvée.

### 6. Pricing — précédents pour l'offre Bell

**[lu-WF] kaiko.com/about-kaiko/pricing-and-contracts** (archivée §9) : aucun chiffre public, renvoie à « contact us ». Chiffres tiers (Datarade/Vendr, 1-2,5 k$/mois) non confirmés en primaire.
**Chainlink PoR** : NON TROUVÉ de grille publique (2 recherches indépendantes).
**x402** : CoinGecko et Circle facturent 0,01 $ USDC/requête ; Cloudflare Monetization Gateway 0,01-2,00 $/appel [abs-WS].

### 7. File No. 4-927 — dossier de commentaires (enrichi en ronde 2)

**[lu-WF] sec.gov/rules-regulations/2026/09/4-927** et **sec.gov/rules-regulations/public-comments/4-927** : 8 lettres déposées 17-18/09/26, hrefs individuels obtenus.

**Ronde 2 — re-fetch ciblé de la lettre Ross (Turnqey Labs), prompt élargi (remède proposé + description de l'entreprise)** [lu-WF, sec.gov/comments/4-927/4927-1052379-3611846.html] — **contenu substantiellement plus riche que le premier passage (contradiction interne notée en ronde 1, résolue par ce second fetch, pas par supposition)** :
- Description de l'entreprise, verbatim : « Turnqey builds the data infrastructure that registered investment advisers and wealth platforms use to see, reconcile and report on client crypto and tokenized assets. »
- Remède proposé, verbatim (extraits) : « Each TSV's public notice should include a published registry of the token contracts it trades, mapped to the underlying security's CUSIP and FIGI » ; « A TSV should also publish trade and liquidity pool data in a documented, machine readable form. » ; « TSVs and tokenizers publish corporate action events in a standard form... » ; « A public, timestamped event log for halts, pool parameter changes and access-standard changes, published by the TSV alongside its trade data. » ; « A holder should be able to designate an adviser or reporting agent that can read the holder's fills and positions on a TSV without being a trading participant. »
- Conclusion, verbatim : « The market can absorb dozens of venues and investors will be better served than they are today. »
- **Lecture** : Ross diagnostique le même trou que Bell (vérifiabilité externe) mais son remède est que **le TSV s'auto-publie**, pas qu'un tiers (Bell) le fasse. C'est un signal « tue » potentiel à terme (si un TSV adopte ce remède + qu'un oracle republie le gap, §6 GTM), pas un signal « confirme » pour Bell.

**[abs-WS] recherche complémentaire sur Turnqey Labs** : confirme indépendamment — TAIP (Turnqey Assets Intelligence Platform, holdings intelligence, `Qscore`), Qeychain (self-custody wallet tracker), intégrations Wealthbox/Morningstar ByAllAccounts ; fondé par Tyrone Ross (ex-CEO Onramp Invest). Nouveau sous-segment GTM §2.8, « plausible, non démontré ».

**[lu-WF] Delderfield (PRO)** : hors sujet (IA/sécurité spatiale). **Borthwick (Insumer Model)** : extraction PDF non fiable, NON TROUVÉ, routé à l'investisseur (PR-GTM-1).

**Ronde 2 — lecture primaire de la sollicitation de commentaires (texte intégral pré-extrait)** [lu, `txt/sec-34-106402-innovation-exemption.txt`, lignes 2026-2100, p.56-59] :
- **10 questions numérotées au total** (pas seulement Q3/Q6/Q10 comme paraphrasé par PROPOSITIONS) : Q1 (modifier l'exemption TSV ?), Q2 (permanence, durée), **Q3** (impact liquidité/prix/reporting sur le marché sous-jacent, incl. reporting ≤10 min et trading nocturne sur l'ouverture/la clôture), Q4 (élargir les types de titres/actifs appariés), Q5 (modifier les conditions), **Q6** (pertinence de la catégorisation Tier 1/2, 75 symboles/0,25 %, 250 symboles/2,5 %), Q7 (relief Reg NMS pour les broker-dealers), Q8-Q10 (Covered Firm Exemption).
- **Vérifié directement, par lecture exhaustive des 10 questions : aucune ne mentionne les halts.** Confirme précisément le point 8 de la revue advisor-marché (la sollicitation ne pose aucune question sur les halts) — vérification personnelle, pas une reprise sans lecture.
- **Mécanique de dépôt, verbatim** : « Use the Commission's internet comment form (https://www.sec.gov/comments/4-927/order-granting-temporary-conditional-exemptive-relief-pursuant-section-36a1-securities-exchange-act) ; or Send an email to rule-comments@sec.gov. Please include File Number 4-927 on the subject line. » Courrier : « Secretary, Securities and Exchange Commission, 100 F Street NE, Washington, DC 20549-1090. »
- **Délai de clôture** : recherché explicitement dans tout le texte (grep sur « days », « comment period »), **aucune date de clôture stipulée** — la Commission dit seulement « intends to monitor closely the use of the exemptions ». Ce NON TROUVÉ est donc désormais **confirmé par lecture primaire complète**, pas seulement par l'absence sur une page web secondaire. **PR-GTM-2 clos** sur cette base.

**Conséquence pour le signal « confirme »** : inchangée par rapport à la ronde 1 — non déclenché ; enrichie par le remède Ross, qui pointe vers l'auto-publication par le TSV comme alternative, pas vers un témoin tiers nommé.

### 8. Option Stocklana — inchangé (voir ronde 1, non repris ici)

### 9. Archive locale et empreintes sha256 (ronde 1, inchangée)

Pages sauvegardées via `curl` dans `F:\Monark\docs\biblio\bell\_txt\` — voir table complète dans la version précédente de ce document (non reproduite ici pour la longueur ; fichiers toujours présents sur disque, sha256 inchangés) :
`coindesk-who-could-benefit.html`, `coindesk-transfer-agents-lobby.html`, `theblock-innovation-exemption.html`, `rwaxyz-methodology.html`, `kaiko-pricing.html`, `aave-chaoslabs-comp.html` (200, contenu réel) ; `sec-4927-rule.html`, `sec-4927-comments-list.html`, `sec-4927-comment-ross-turnqey`, `sec-4927-comment-borthwick-insumer`, `sec-4927-comment-delderfield-pro` (403 WAF « Request Rate Threshold Exceeded », pages d'erreur de 1 925 octets chacune, pas le contenu — WebFetch a réussi indépendamment pour ces URL, voir §7).

---

## Contradictions relevées (consolidé, les deux rondes)

1. **Chiffres Kamino xStocks** : 6,3 M$/5,75 M$ (avril 2026, [abs-WS]) vs 23,1 M$ TVL (R3, date non précisée) — non réconciliés.
2. **Ross/Turnqey, niveau de preuve** : le premier fetch (ronde 1) a sous-exploité la lettre (une seule citation, résumé prudent) ; le second fetch (ronde 2, prompt élargi) a produit une citation bien plus riche et cohérente. Les deux fetchs portent sur la même URL — la variance vient du prompt, pas de la source. La version ronde 2 fait foi (plus complète), la ronde 1 n'est pas fausse mais incomplète.
3. **Credora PD/PSL, ronde 2, non tranché** : revue advisor-marché relayée par l'orchestrateur affirme l'absence du PD/PSL sur credora.network/docs ; vérification directe personnelle (2×, même URL précise) confirme sa présence verbatim. Signalé au GTM §3, procurement PR-GTM-9 formé, pas d'arbitrage unilatéral.

## NON TROUVÉ (consolidé, les deux rondes)

- Candidature TSV explicite de Coinbase, Kraken, Ondo, Nasdaq, DTCC.
- Grille de prix publique Chainlink PoR et Kaiko (primaire).
- Mandat 2026 spécifique actions tokenisées payé à un curateur.
- Contenu de la lettre Borthwick (PDF illisible) et des 5 lettres File 4-927 non ouvertes.
- Couverture Blockworks de l'ordre.
- Registre public des Notices TSV déposées.
- Statut broker-dealer FINRA de Securitize en lecture BrokerCheck primaire (R2 ne cite qu'une presse spécialisée, [2nd]) — **nouveau, ronde 2**, procurement PR-GTM-10.
- **Résolu en ronde 2, n'est plus un NON TROUVÉ** : délai de clôture des commentaires File 4-927 — confirmé absent par lecture primaire complète (pas juste non trouvé sur une page secondaire).

## Procurements formés (état après ronde 2)

1. **PR-GTM-1** — Lettre Borthwick (PDF) + 5 lettres non ouvertes. **Routé à l'investisseur** pour procurement (accès institutionnel/pdftotext), suite à la revue.
2. **PR-GTM-2** — **RÉSOLU** (délai de clôture 4-927 : confirmé absent du texte primaire).
3. **PR-GTM-3/4** — Grilles tarifaires Chainlink PoR / Kaiko primaires. Ouverts.
4. **PR-GTM-5** — Couverture Blockworks. Ouvert.
5. **PR-GTM-6** — Registre public des Notices TSV. Ouvert.
6. **PR-GTM-7** (= ADR-B0 PR-B-3) — Avis écrit licence Massive/Polygon. Ouvert, **non bloquant depuis ESC-1(c)**.
7. **PR-GTM-8** — Mandat 2026 spécifique actions tokenisées. Ouvert.
8. **PR-GTM-9** (nouveau, ronde 2) — Revue méthodologique complète Credora (PD/PSL vs présentation lettre), suite au conflit non tranché §5.
9. **PR-GTM-10** (nouveau, ronde 2) — Statut broker-dealer FINRA Securitize, lecture BrokerCheck primaire.

## Journal des URL — ronde 2 (nouveaux fetchs)

### Succès
1. massive.com/blog/polygon-is-now-massive — [lu-WF], date exacte 30/10/2025
2. credora.network/docs/methodologies/defi-rating-scale/ — [lu-WF], 2 fetchs identiques, PD/PSL confirmé
3. sec.gov/comments/4-927/4927-1052379-3611846.html (Ross, re-fetch prompt élargi) — [lu-WF]
4. `txt/sec-34-106402-innovation-exemption.txt` (local, pré-extrait) — [lu] intégral section VI

### Échecs
- massive.com/blog/polygon-io-is-now-massive — HTTP 404 (mauvaise URL devinée, corrigée par recherche)

### WebSearch ronde 2 (numérotation reprend à 21)
21. "Polygon.io is Now Massive" blog rebrand date
22. RedStone acquires Credora September 2025 CoinDesk
23. Turnqey Labs Tyrone Ross RIA infrastructure product what does it do

---

## Renvoi

Document final : `F:\Monark\docs\GTM-BELL.md`. Ce journal reste la source de vérification (URL, dates, verbatim, sha256) ; le GTM le synthétise, ne le remplace pas.
