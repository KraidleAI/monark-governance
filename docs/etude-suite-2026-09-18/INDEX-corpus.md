# INDEX du corpus produit MONARK — 2026-09-18

> ETAT : LECTURE COMPLETE (tous les dossiers du perimetre mission traites : F:\Monark\docs
> racine+adr, MONARK SUITE au complet, la claque, GTM, autres produits monark, narabi-phase,
> NARABI en identification). Reste : grep de cloture packages/apps (fait, voir section N) et
> redaction du rapport final court. Chercheur : claude-sonnet-5 (Gate 0 declare en tete du rapport
> final). Aucun commit. Ecriture au fil de l'eau (electricite instable) — ce fichier a ete reecrit
> section par section a chaque dossier ferme.

## Methode et perimetre (a lire avant les tables)

- **Niveaux** : [lu] = fichier ouvert et lu integralement ou par sections cibles par moi dans cette
  passe ; [abs] = resume/en-tete lu, corps non integralement parcouru ; [2nd] = connu seulement via
  la citation d'un autre document de ce corpus (jamais terminal).
- **PDF hors perimetre texte-seul** : la mission restreint `NARABI\` aux "fichiers texte seuls" —
  ce dossier ne contient QUE des PDF (23), donc aucun fichier n'y est lu dans cette passe ; ils sont
  listes plus bas par identification de titre (nom de fichier) seulement, statut [abs]. Par
  coherence, les 3 PDF academiques de `biblio-F-narabi\` (Diamond-Dybvig, Goldstein-Pauzner,
  Gibbs-Candes) sont traites de meme : identifies via `biblio-00-index-F.md` (qui les cite comme
  telecharges/lus par une passe anterieure), non rouverts par moi dans cette passe — statut [2nd
  pour cette passe]. Decision de perimetre motivee : la mission cible l'indexation du corpus
  PRODUIT MONARK, pas une revue de litterature academique complete (tache distincte de lecteur
  dediee).
- **Assets binaires/backup ignores per mission** : `MONARK SUITE\backup-2026-09-18\` (4 .md + 6
  .jsonl + 1 .svg + 1 .bundle) et, dans `site-redesign\`, tout sauf BRIEF.md/MODELE-ILLUSTRATION.md
  (assets/, concepts/, data/, higgsfield/, shared/, video/, COMPARATIF.md, DIAGRAM-SPEC.md,
  PROCUREMENT-icons.md — non lus, listes pour memoire seulement).
- **Dates** : quand le document porte une date explicite, elle est citee ; a defaut, la date de
  derniere modification du fichier (mtime, `find -printf %T`) est utilisee et marquee (mtime).
- **Statut** (colonne demandee par la mission) qualifie ce que le document DECRIT (un produit / une
  piece), pas mon niveau de lecture : fait = deja construit/livre selon fleet.ts ou un ADR ;
  propose = proposition non tranchee ; rejete = explicitement refuse/mis de cote par une decision
  datee ; superseded = remplace par un document posterieur du corpus.
- **Hors perimetre mission, signale et NON lu (doc 03 : ne jamais silencieusement sauter)** :
  plusieurs documents lus dans cette passe renvoient vers des fichiers "soeurs" situes DANS
  `Downloads\` mais HORS de la liste explicite de dossiers donnee par la mission :
  `Downloads\Genkan and kraidle\genkan-et-kraidle\` (dont un `06-flotte.md` cite par
  `narabi-phase/00-index.md`), `Downloads\prérequis\prerequis-claude-code.md` /
  `Downloads\prerequis-claude-code.md` (cite par `narabi-phase/06-enrichissement.md`), un dossier
  `NIJU\00-ROADMAP.md` (non retrouve par recherche de nom), et
  `MONARK SUITE\sous produits\..\MONARK suite\produit-ukemi-loop-clearing.md` (cite par
  `narabi-phase/05-ukemi.md`, **introuvable** — recherche par nom sur tout `Downloads\`,
  0 resultat : soit renomme/supprime depuis le 2026-09-15, soit jamais livre). Ces renvois ne sont
  **pas** ouverts dans cette passe (hors liste de dossiers donnee par la mission) ; ils sont notes
  ici pour que l'orchestrateur sache qu'ils existent et puisse decider de les faire lire.

---

## A. Depot F:\Monark — registre, contrats, docs de passe, ADR

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| apps/site/lib/fleet.ts | commentaires internes non dates (lu 2026-09-18) | Registre SOURCE UNIQUE DE VERITE : 11 FLEET_AGENTS + 5 PRODUCTS, built = {Shogen, Hikae, Ukemi, Narabi}, verrouille par test | fait (registre) | les 16 |
| apps/site/lib/fleet-presentation.ts | idem | Panneau "What's inside / will use" : points methode par piece (built = ancre ADR ; upcoming = nom de methode) ; Verdict nomme Mokugeki x Kamae (decision beta 2026-09-10) | fait (presentation) | les 16 + visage |
| apps/site/lib/profiles.ts | decision E-1, 2026-09-10 | 8 profils client (5 fingers + 3 visage) avec engineKeys sources : firebreak/softlanding -> ukemi, warden -> genkan, ballast -> kyokusen, verdict -> mokugeki + kamae ; visage engineKeys vides (mapping design rejete 2026-09-09) | fait (registre) | firebreak, warden, softlanding, verdict, ballast, visage |
| apps/site/lib/agents-presentation.ts | brand freeze 2026-09-07 | Metadata kanji + accent des 11 agents, presentation seule | fait | 11 agents |
| schemas/attested-price.schema.json | ADR-M001 D3 | Contrat gele 1/5 : temoignage prix Shogen | fait | shogen, hikae |
| schemas/attested-flow.schema.json | ADR-M008 | Contrat gele : flux de rachat Narabi (burns/mints/supply bruts, residual enum ferme) | fait | narabi |
| schemas/prediction.schema.json | ADR-M001 D6 | Contrat gele : Prediction (yhat, predictor_id) | fait | hikae + tout capteur |
| schemas/coverage-verdict.schema.json | ADR-M001 D4 | Contrat gele : verdict conforme polymorphe set/interval | fait | hikae |
| schemas/gate-decision.schema.json | ADR-M001 D5 | Contrat gele : commit/defer/abstain + remaining_budget (B_t) | fait | hikae, genkan, tous produits |
| schemas/forbidden-keys.json | ADR-M001 D7 / M008 D5 | Invariant (pas un contrat) : 15 cles bannies partout | fait | toutes |
| README.md (racine) | reflete l'etat au 2026-09-18 | Vitrine texte : 4 built, Narabi "runs" (USDe calibre), 7 named roadmap, 5 contrats geles, MCP live | fait | les 16 |
| docs/PHASE-SUIVANTE.md | 2026-09-18 | Consigne investisseur : etude de portefeuille (11 produits fleet, 4 livres) vs enrichir l'existant ; DefiDrama mis de cote ; Shogen FULL differe | propose (cadrage) | tous, hors-fleet DefiDrama |
| docs/AUDIT-next-piece-2026-09-18.md | 2026-09-18 | Audit du memo "prochaine piece" : rejette Ukemi-Aave-liquidations (pas d'acheteur nomme, cible degeneree) ; retient census burns par bruleur (FDUSD/sUSDe/USDtb/GHO) et LiquidationCall Aave comme rang 1 | rejete (Ukemi-Aave) / propose (enrichissement Narabi) | ukemi, narabi |
| docs/RAPPORT-passe-m014-edetector.md | 2026-09-18 | Cloture passe e-detecteur de derive (SRR) pour Narabi, instrument etiquete hors etat | fait | narabi |
| docs/RAPPORT-passe-narabi-aci.md | 2026-09-12 -> 2026-09-18 | Cloture passe Narabi sentinelle + ACI + vitrine v0.4.0 ; DefiDrama non mentionne comme produit | fait | narabi, shogen, hikae, ukemi |
| docs/G7-phase1.md | 2026-09-04 -> 05 | Verdict G7 Phase 1 : lots H (Hikae) et U (Ukemi) ACCEPTES, integrables | fait | hikae, ukemi |
| docs/adr/ADR-M001..M014-*.md (14 fichiers) | 2026-09-04 -> 2026-09-18 | ADR de phase (contrats geles, moteurs, integration, infra, harnais, skills, calibrate BYO, Narabi flow, ACI tracker, release, non-degenerescence, sentinelle live, regimes vitrine, e-detecteur) | fait (backbone) | shogen, hikae, ukemi, narabi + infra |

## B. MONARK SUITE\MONARK suite\ — 5 pieces upcoming (gap+produit), date 2026-09-06

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| README.md | 2026-09-06 | Index des 5 produits A-E, rang cash, schema d'accrochage a la flotte | propose | kaihi, kessai, mokugeki, kamae, kyokusen |
| gap-A-lvr-toxicite.md | 2026-09-06 | Trou LVR/toxicite de flux AMM (LP paient l'arbitrageur) ; >500 M$/an ecosysteme, 87% volume v4 sans hook (Dune) | propose | kaihi |
| produit-A-lvr-toxicite.md | 2026-09-06 | Agent signal + range (pas un hook) ; acheteur = vaults LP (Gamma/Arrakis/Charm) ; pricing 10-20% du LVR evite | propose | kaihi |
| gap-B-tca-swap.md | 2026-09-06 | Trou implementation shortfall du swap on-chain (Perold) ; CoW 9,9 Md$ vol T2 2026 | propose | kessai |
| produit-B-tca-swap.md | 2026-09-06 | Feature runtime Hermes (pas de co separee) : swap() minimisant l'IS, recu 6 axes ; pricing 20-30% des bps sauves | propose | kessai |
| gap-C-perception-document.md | 2026-09-06 | Trou capteur texte/evenement atteste (frere de Shogen) ; PM 24 Md$/mois (Pew) | propose | mokugeki |
| produit-C-perception-document.md | 2026-09-06 | AttestedDoc : bytes_hash + source + residuals, zero sentiment ; acheteur = desk MM / vault LP / HIKAE ; licence 2-10 k$/mois | propose | mokugeki |
| gap-D-inventory-mm.md | 2026-09-06 | Trou inventory MM sur Polymarket/Kalshi (pas la prediction) ; 24 Md$/mois combine | propose | kamae |
| produit-D-inventory-mm.md | 2026-09-06 | Desk Avellaneda-Stoikov autour d'un fair (C + CEX) ; payeur = le capital, pas SaaS ; PnL mesure hors rewards | propose | kamae |
| gap-E-pendle-courbe.md | 2026-09-06 | Trou courbe de taux DeFi PT/YT mal pricee ; fees Pendle 644 k$/30j (petit, pas flagship) | propose | kyokusen |
| produit-E-pendle-courbe.md | 2026-09-06 | Module Nelson-Siegel sur PT cash-yield, gate de looping ; acheteur = tresorerie qui veut le fixe | propose | kyokusen |

## C. MONARK SUITE\ (racine) — pieces F/G/H, date 2026-09-06

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| produit-F-run-redemption.md | 2026-09-06 | Proposition d'origine de Narabi : AttestedFlow, velocite v_t = B_t/(S_t.delta), acheteur = curators Morpho | fait (a ete construit, ADR-M008) | narabi |
| produit-G-hours-gap-hip3.md | 2026-09-06 | Agent gap horaire HIP-3 (flatten calendaire week-end 53h) ; acheteur = desk taker/MM xyz ; 40-180 k$/an si 3-8 desks | propose | koyomi |
| produit-H-openclaw-skill.md | 2026-09-06 | Skill OpenClaw/MCP wrappant transfer/swap/sign en commit/defer/abstain ; "pas un X-agent, le GTM du gate" | propose (partiellement fait : la distribution skill existe deja, ADR-M006, mais generique flotte, pas ce wrapper before_tool specifique) | genkan |

## D. MONARK SUITE\biblio-F-narabi\ — biblio + scouting Narabi, 2026-09-12 / 2026-09-16

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| biblio-00-index-F.md | 2026-09-12 | Index biblio de construction de Narabi (10 refs), 3 desambiguisations tranchees, donnee critique msUSD signalee manquante | fait (index) | narabi |
| PROCUREMENT-F.md | 2026-09-12 | 4/5 procurements recus (Allen-Gale, Akerlof, Grossman + Milgrom, Chow) ; P-F-5 (serie msUSD) reste ouverte | fait (procurement clos a 4/5) | narabi |
| PROCUREMENT-P-F-5-msusd-data.md | 2026-09-12, resolu partiellement 2026-09-13 | Demande serie horaire brute msUSD ; adresses fournies par l'investisseur, granularite horaire reste due | propose (partiellement resolu) | narabi |
| SCOUT-P-F-6-usdc-candidate.md | 2026-09-16 | Scouting USDC (SVB mars 2023) comme candidat calibration ; mecanisme + run solides, churn calme encore [2nd] ; signale une ambiguite de nommage classe 24h vs 1h (demande de consultation formee, non tranchee) | propose (candidat retenu, non calibre) | narabi |
| SCOUT-P-F-7-usde-candidate.md | 2026-09-16 | Scouting USDe (Ethena, run 10-12 oct. 2025) recompute on-chain [lu] par le chercheur ; recommande USDe comme candidat prioritaire | fait (retenu : README confirme calibration USDe committee) | narabi |
| SCOUTING-F-fdusd.md | 2026-09-16 (revise apres advisor, meme date) | Scouting FDUSD (run 2-3 avril 2025, bruleur unique Safe) ; separation calme/run modeste (x2,3-6,4) | propose (candidat plausible, non calibre) | narabi |
| diamond-dybvig-1983-...pdf, goldstein-pauzner-2005-...pdf, gibbs-candes-2021-ACI-...pdf | 2026-09-12 (mtime) | 3 papiers academiques sources (bank runs ; ACI) | [2nd, non rouverts cette passe] | narabi |

## E. MONARK SUITE\produit visage\ — 3 artefacts hors-fleet (Dossier/Sceau/Declencheur), 2026-09-08

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| produits-visage-11-couches.md | 2026-09-08 | Synthese des 3 produits-visage : Dossier (File, par hop), Sceau (badge SEALED 90j), Declencheur (index parametrique assurance) ; explicitement hors des 16 pieces fleet | propose, hors-fleet | hors fleet (= attestation/hallmark/threshold dans fleet-presentation.ts) |
| gap-dossier.md | 2026-09-08 | Trou : aucune piece probante par hop pour CFO / DPO DORA / claims officer | propose, hors-fleet | idem (attestation) |
| produit-dossier.md | 2026-09-08 | Objet MONARK FILE (page par hop, hash) ; licence 5-15 k$/mois/fonds | propose, hors-fleet | idem (attestation) |
| gap-sceau.md | 2026-09-08 | Trou : le LP ne voit pas si l'agent s'est tu / a recharge B_t en yield (marche de citrons, Akerlof) | propose, hors-fleet | idem (hallmark) |
| produit-sceau.md | 2026-09-08 | Badge binaire SEALED apres 90j de Files ; licence 2-8 k$/mois/vault | propose, hors-fleet | idem (hallmark) |

## F. MONARK SUITE\sous produits\1\ — biblio de construction des 4 "doigts" grecs, 2026-09-08

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| biblio-00-index.md | 2026-09-08 | Index : gamma = Ukemi-ADL, beta = event vs UMA, alpha = Ukemi-V4, delta = Genkan-Safe | fait (index) | firebreak, verdict, softlanding, warden |
| biblio-alpha-v4.md | 2026-09-08 | Ukemi-V4 (Aave V4 Target HF par Spoke, bonus Dutch) ; mapping confirme = Softlanding | propose | softlanding |
| biblio-beta-adjudication.md | 2026-09-08 | Event vs adjudication UMA (Economics Letters 268/2026) ; moteur Mokugeki x Kamae ; mapping confirme = Verdict | propose | verdict |
| biblio-gamma-adl.md | 2026-09-08 | Ukemi-ADL (Chitra arXiv:2512.01112, 2,1 Md$/12min le 10 oct. 2025) ; mapping confirme = Firebreak | propose | firebreak |
| biblio-delta-safe.md | 2026-09-08 | Genkan-Safe : meme JSON before_tool que produit-H, transport Safe Allowance Module au lieu de MCP ; mapping confirme = Warden (la biblio delta cite explicitement produit-H comme le meme endpoint) | propose | warden (et genkan par heritage d'engine) |

## G. MONARK SUITE\site-redesign\ — 2 fichiers dans le perimetre mission (2026-09-18), reste ignore

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| BRIEF.md | 2026-09-18, 7 addenda le meme jour | Brief design (exploration, PAS deploye) ; confirme DefiDrama mis de cote (mark deplace hors-perimetre) ; confirme "MONARK = le moteur, pas une 12e piece" ; choix DA "Console" B, concepts A/C ecartes | propose (exploration design, decisions actees le jour meme) | les 16 (registre visuel) + hors-fleet DefiDrama |
| MODELE-ILLUSTRATION.md | 2026-09-18, VALIDE investisseur | Modele "fluide/sas/filtres" : affectation des 11 pieces aux 4 chambres (Attest/Calibrate/Gate/Agir), mapping profils clients -> produits -> pieces identique a profiles.ts | fait (modele valide, implementation a venir) | les 16 |
| (ignores, hors perimetre mission) COMPARATIF.md, DIAGRAM-SPEC.md, PROCUREMENT-icons.md, assets/, concepts/A,B,C,D/, data/AGENT-ECOSYSTEMS.md, higgsfield/, shared/, video/ | 2026-09-16/18 (mtime) | Assets binaires, concepts HTML rendus, video promo — non lus (hors liste explicite de la mission) | — | — |

## H. MONARK SUITE\backup-2026-09-18\ — ignore par instruction explicite de la mission

| Chemin | Date | Resume | Statut |
|---|---|---|---|
| A-aave-liquidations.md, B-burners.md, REPRISE.md, SCOUT-susde-candidate.md, census-data/*.jsonl (6 fichiers), icon-light.svg, monark-governance-np.bundle | 2026-09-18 (mtime) | NON LU (mission : "ignore backup et assets binaires") — probablement le materiel brut derriere AUDIT-next-piece-2026-09-18.md (census A/B) | non lu, hors perimetre |

## I. PRODUITS QUI CLAQUENT\la claque\ — 5 campagnes composites (actu-ancrees), 2026-09-11

Chaque campagne reutilise PLUSIEURS pieces existantes (jamais une piece nouvelle) + les
produits-visage File/Sceau ; explicitement "full flotte". Aucune ne cree de piece.

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| 00-index.md | 2026-09-11 | Index 5 campagnes classees par "buzz CT x $ en jeu x cablage reel" ; ordre de ship propose 3+5 -> 1 -> 2 -> 4 | propose | toutes (composite) |
| biblio.md | liens verifies 11 sept. 2026 | Bibliographie consolidee (P2 presse crypto + 1 papier academique EL 268) | fait (index sources) | — |
| gap-01-the-lock.md / produit-01-the-lock.md | 2026-09-11 | Episode Kelp DAO 18 avril 2026 (bad debt 123,7-230,1 M$ FSA) + util. Aave a 100% (NYDIG 10 sept.) ; propose un File + skill Genkan qui abstain sur `utilization_lock`/`receipts_not_asset` | propose, hors-fleet (composite, toutes pieces) | genkan, narabi, shogen, mokugeki, hikae, ukemi + File |
| gap-02-1010-replay.md / produit-02-1010-replay.md | 2026-09-11 | Replay du krach 10 oct. 2025 (19,3 Md$ liquides, ADL HL 2,1 Md$/12min) hop par hop ; demo/GTM calee sur J+365 (10 oct. 2026) | propose, hors-fleet (composite) | shogen, narabi, mokugeki, hikae, ukemi, koyomi, kessai, kaihi, kamae, kyokusen, genkan |
| gap-03-skill-gate.md / produit-03-skill-gate.md | 2026-09-11 | Skill ClawHub qui gate l'INSTALL d'autres skills (defense front-running/malware, Unit 42 juin 2026) ; "Genkan (le SKU)" | propose, rattachee a Genkan (extension de produit-H) | genkan, mokugeki, hikae |
| gap-04-event-or-vote.md / produit-04-event-or-vote.md | 2026-09-11 | Badge set {event,uma} sur marches disputes (papier EL 268/2026, episode Strategy 8-K 1er juin 2026) | propose, rattachee a Verdict (meme these que biblio-beta-adjudication.md) | mokugeki, kamae, verdict |
| gap-05-tweet-signs.md / produit-05-tweet-signs.md | 2026-09-11 | Episode Bankr x Grok Morse (4 mai 2026, ~175 k$ draines) ; Genkan sur sign/transfer avec allowlist de canal d'instruction | propose, rattachee a Genkan | genkan, mokugeki |

## J. GTM monark version 1\GTM\ — strategie de mise sur marche, 2026-09-10, hors-fleet

Aucune piece nouvelle ; sequencement/ACV cible appliques aux 16 pieces + File/Sceau. Le dossier
definit un schema de "profils numerotes" (00 OpenClaw operator/Genkan, 01 LP vault-curator/Kaihi,
02 DAO-agent ops/Kessai, 03 borrower-looper/Ukemi, 04 PM desk/Kamae, 05 HIP-3-RWA/Koyomi, 06 stable
curator/Narabi, 07 FI treasury/Kyokusen, + File/Sceau) repris tel quel par `la claque` ("profil 00").

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| 00-index.md | 2026-09-10 | These GTM 2 faces (distribution vs payeur) ; beachhead = profil 00 Genkan ; horloge hackathon ClawPump/AnsemHack (deadline tokenize 20 sept 23:59 UTC) | propose, hors-fleet | genkan (beachhead) |
| 01-these-marche.md | 2026-09-10 | TAM 3 anneaux (845 M$->9,45 Md$ agents finance ; SAM DAO 2,4 Md$ ; SOM 12 mois 40-180 k$ skill/desk, File 180-540 k$) ; 5 pieges a refuser (agent trader plus malin, cap $, score/vault stars, "AI safe", solveur physique) | propose, hors-fleet | tous (cadrage marche) |
| 02-deux-faces.md | 2026-09-10 | Chicken-and-egg (Rochet-Tirole, Caillaud-Jullien) ; subsidier le cote agent, faire payer le cote curateur/CFO ; B_t jamais farme en APY | propose, hors-fleet | tous |
| 03-beachhead.md | 2026-09-10 | Table des 8 profils numerotes + ACV cible + ordre d'attaque (00 -> 02 xor 01 -> File) | propose, hors-fleet | genkan, kessai, kaihi, ukemi, narabi, kamae, koyomi, kyokusen |
| 04-clawrena.md | 2026-09-10 | Regles hackathon AnsemHack/ClawPump (token = ticket, deadline 20 sept 23:59 UTC, jury nomme, script pitch 15 min) | fait (contexte hackathon, pas une piece) | — |
| 05-token.md | 2026-09-10 | $MONARK = B_t (budget, pas un yield) ; stats de survie des mints Solana (graduation 0,198%, Telegram x8,94) | propose, hors-fleet | tous (token transverse) |
| 06-canaux.md | 2026-09-10 | Canaux X/Telegram/site, cadence, ce qu'on n'ouvre pas T0 | propose, hors-fleet | — |
| 07-ventes.md | 2026-09-10 | Motion B (vente apres hack) : ACV/motion (Runwayteam), lighthouse = DAO(Kessai+File) OU curator(Kaihi+Sceau), cycle 3-9 mois | propose, hors-fleet | kessai, kaihi |
| 08-90-jours.md | 2026-09-10 | Plan semaine par semaine 10 sept -> 8 dec 2026, kill criteria a J+90 | propose, hors-fleet | genkan (WIP=2, prioritaire) |
| 09-kpis-risques.md | 2026-09-10 | North star = GateDecision emis par cles non-fondateur ; guardrails (B_t jamais farme, pas de score) ; 9 risques nommes avec residual | propose, hors-fleet | tous |
| 10-biblio.md | verifie sept. 2026 | Bibliographie academique/marche du GTM (Rochet-Tirole, Caillaud-Jullien, Moore, Rogers, a16z Rosenthal, etc.) | fait (index sources) | — |

## K. autres produits monark\ — 6 produits "DeFi x IA x inference", 2026-09-06, ENTIEREMENT hors-fleet

Verifie par grep : **zero** occurrence de "monark/shogen/hikae/ukemi/genkan/mokugeki/kaihi/kessai/
kamae/kyokusen/koyomi" dans les 13 fichiers. Marche cible = facturation d'inference LLM pour
agents (pas la DeFi). Nomme "monark" seulement dans le nom du DOSSIER, pas dans le contenu.

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| README (1).md | 2026-09-06 | Index : produit-01+02 = meme acheteur (facture tokens), produits 03-06 = cash inferieur | propose, hors-fleet | — |
| gap-01-best-execution.md / produit-01-best-execution.md | 2026-09-06 | "Flashbots des tokens" : best-ex d'inference LLM (Chitra 2026, cache-cheat 3,5-14 M$/an OpenRouter) ; acheteur = CFO/FinOps a >10 k$/mois de tokens ; pricing 20-30% des economies | propose, hors-fleet | — (cite par produit-B-tca-swap.md comme "meme maths, autre marche") |
| gap-02-kv-cache.md / produit-02-kv-cache.md | 2026-09-06 | Hote de KV-cache cross-tenant (arXiv:2606.13361, reuse 49,7x) ; feature du produit-01 ou vendu aux providers (Together/Fireworks) | propose, hors-fleet | — |
| gap-03-hedging-polymarket.md / produit-03-hedging-polymarket.md | 2026-09-06 | Copilote hedging panier personnel -> marches Polymarket/Kalshi/Parcl existants, sans licence ni execution | propose, hors-fleet | — |
| gap-04-calibration-brier.md / produit-04-calibration-brier.md | 2026-09-06 | Leaderboard de calibration Brier d'agents (auto-annonce p et cout avant d'agir) ; acheteur = 1 lab/marketplace | propose, hors-fleet | — |
| gap-05-escrow-inference.md / produit-05-escrow-inference.md | 2026-09-06 | Escrow JSON-mode (stake + re-run sur 2e provider), PAS une assurance ; acheteur = 2-3 protocoles DeFi (oracles/RWA) | propose, hors-fleet | — |
| gap-06-agent-credit-score.md / produit-06-agent-credit-score.md | 2026-09-06 | Score d'agent "payment-grounded" (ERC-8004 + x402, review valide ssi paiement >1$) ; acheteur = merchant x402 | propose, hors-fleet | — |

## L. NARABI PHASE\narabi-phase\ — phase de construction Narabi (planification), 2026-09-15

Doc de travail CONTEMPORAIN de biblio-F-narabi (12-16 sept) et ANTERIEUR aux ADR-M009/M011/M012
(17-18 sept). Contient la source de la CONTRADICTION de nommage documentee dans PROPOSITIONS.md
(`flow-redeem-1h` / `utilization-lock-1h` vs `stable-run-velocity-24h`).

| Chemin | Date | Resume | Statut | Piece(s) |
|---|---|---|---|---|
| 00-index.md | 2026-09-15 | Carte du dossier ; renvoie vers 3 fichiers "soeurs" HORS perimetre mission (NIJU, genkan-et-kraidle — voir note de perimetre en tete de ce document) | fait (index) | narabi |
| 01-these.md | 2026-09-15 | Narabi = 3e capteur ; non-objet explicite (pas un bot depeg, pas un 5e tool MCP, pas une kappa Ukemi) | fait (these validee depuis par ADR-M008) | narabi |
| 02-gap.md | 2026-09-15 | Le gap = la file pas le peg ; tableau 5 episodes (msUSD, USDe, USDC/SVB) ; nomme deja `primary_closed` = Koyomi | fait | narabi, koyomi |
| 03-contrat-v1.md | 2026-09-15 | Schema AttestedFlow projete (proche mais pas identique au schema gele final) + vocabulaire de residus V1 (12 residus, dont `under_witness` — ABSENT du schema gele final livre, voir contradiction ci-dessous) | superseded (par schemas/attested-flow.schema.json livre, ADR-M008) | narabi |
| 04-task-classes.md | 2026-09-15 | Nomme et fige `flow-redeem-1h` + `utilization-lock-1h`, REJETTE explicitement `flow-redeem-24h` comme "copie d'horizon" | propose, CONTREDIT par le nommage effectivement utilise au 2026-09-18 (stable-run-velocity-24h) — voir PROPOSITIONS.md | narabi |
| 05-ukemi.md | 2026-09-15 | Cablage Narabi->Hikae->Ukemi ; deux lois distinctes (Diamond-Dybvig vs Eisenberg-Noe), jamais partager une kappa ; renvoie vers produit-ukemi-loop-clearing.md INTROUVABLE (voir note perimetre) | fait (schema de cablage, toujours valide) | narabi, ukemi |
| 06-enrichissement.md | 2026-09-15 | Table des adapters futurs (ERC-20, primary issuer, ERC-4626, Morpho/Aave/Kamino, attestor PoR, LST unbonding, hours banking) ; checklist "trop enrichi" | propose | narabi, koyomi |
| 07-aave-mcp.md | 2026-09-15 | Deep-dive sourcage du lancement Aave MCP (8 sept. 2026, mcp.aave.com, tiers nommes par Aave : Chainlink, CoW, MetaMask) | fait (sourcage) | narabi, ukemi |
| 08-alignement.md | 2026-09-15 | Hop gele agent-Aave-MONARK-wallet ; table mapping flotte complete x Aave (Shogen/Narabi/Ukemi/Hikae/Kessai/Koyomi/Mokugeki/Genkan/B_t) avec interdits par piece | fait | shogen, narabi, ukemi, hikae, kessai, koyomi, mokugeki, genkan |
| 09-optimisations.md | 2026-09-15 | Ce qui gele (4 tools, AttestedFlow, residus append-only) vs ce qui croit (adapters, calib BYO) | fait | narabi |
| 10-actu-sources.md | 2026-09-15 | Journal de sources (liens Aave MCP + MONARK live), non lu en integralite (sourcage deja recoupe ailleurs) | [abs] | narabi |
| 11-biblio.md | 2026-09-15 | Bibliographie academique (Diamond-Dybvig, Akerlof, Allen-Gale, Morris-Shin, Gorton...) ; en-tete lu, corps non integralement parcouru | [abs] | narabi |
| 12-brief-claude.md | 2026-09-15 | Brief d'implementation pret-a-coller pour un agent codeur ; correspond a ce qui est devenu ADR-M008/M012 | fait (brief historique) | narabi |
| 13-negatives.md | 2026-09-15 | Liste d'interdits de phase (5e tool MCP, prix dans AttestedFlow, kappa partagee, seuil HF=commit, phrases overclaim publiques interdites) | fait | narabi |
| 14-papier-prerequis.md | 2026-09-15 | "Loi" de lecture prealable obligatoire (315 lignes) ; en-tete lu (position dans le File, non-objet), corps academique non integralement parcouru dans cette passe | [abs] | narabi |

## M. NARABI\ — 23 PDF academiques, identification seule (fichiers texte seulement exclut ce dossier)

Conforme a l'instruction mission ("fichiers texte seulement") : AUCUN de ces 23 PDF n'est ouvert.
Identification par nom de fichier uniquement (mtime 2026-09-12, date de depot dans Downloads, PAS
necessairement la date de publication du papier — non inferee pour eviter toute fabrication).

| Fichier | Statut |
|---|---|
| 10-years-of-stablecoins-Their-impact-what-we-know-and-future-research-directions.pdf | [abs], non ouvert |
| Cross-cryptocurrency-return-predictability.pdf | [abs], non ouvert |
| DeFi-Protocol-Risks-The-Paradox-of-DeFi.pdf | [abs], non ouvert |
| On-Stablecoin-Ecosystem-architecture-mechanism-and-applicability-as-payment-method.pdf | [abs], non ouvert |
| Preferring-stablecoin-over-dollar-Evidence-from-a-survey-of-Ethereum-platform-traders.pdf | [abs], non ouvert |
| Stablecoin-depegging-risk-prediction.pdf | [abs], non ouvert — PROCUREMENT-F.md avertit : "litterature de score p_depeg, a lire en ADVERSAIRE, jamais a construire" |
| What-Drives-the-In-stability-of-a-Stablecoin.pdf | [abs], non ouvert |
| What-keeps-stablecoins-stable.pdf | [abs], non ouvert |
| akerlof1970.pdf | [abs], non ouvert — REÇU/confirme par PROCUREMENT-F.md (P-F-2) |
| allen2000.pdf | [abs], non ouvert — REÇU/confirme par PROCUREMENT-F.md (P-F-1, Financial Contagion JPE 2000) |
| chow1970.pdf | [abs], non ouvert — REÇU/confirme par PROCUREMENT-F.md (P-F-4) |
| clark2020.pdf | [abs], non ouvert |
| cooper1998.pdf | [abs], non ouvert |
| engineer1989.pdf | [abs], non ouvert |
| grossman1981.pdf | [abs], non ouvert — REÇU/confirme par PROCUREMENT-F.md (P-F-3) |
| jarno2021.pdf | [abs], non ouvert |
| jarrow2013.pdf | [abs], non ouvert |
| kinateder2014.pdf | [abs], non ouvert |
| koenig2022.pdf | [abs], non ouvert |
| milgrom1981.pdf | [abs], non ouvert — REÇU/confirme par PROCUREMENT-F.md (P-F-3) |
| peck2003.pdf | [abs], non ouvert |
| qi1994.pdf | [abs], non ouvert |
| wang2020.pdf | [abs], non ouvert |

## N. Grep de cloture — code source F:\Monark (packages/, apps/), 2026-09-18

Confirme pour les 12 pieces upcoming (7 agents + 5 produits) : **aucune** occurrence dans
`packages/*/src` ou `packages/*/test` (moteur) — seulement dans la couche presentation
`apps/site` : `lib/fleet.ts`, `lib/fleet-presentation.ts`, `lib/agents-presentation.ts` (11
agents seulement), `lib/profiles.ts`, `components/marks/*-mark.tsx` (11 agents seulement, aucun
mark pour les 5 produits), `app/fleet/page.tsx`, `app/how/page.tsx` (Kaihi/Genkan seulement),
`components/gate-sim/board.tsx`, `components/sas/sas-model.ts`. Les 5 produits (Firebreak, Warden,
Softlanding, Verdict, Ballast) n'apparaissent QUE dans fleet.ts/fleet-presentation.ts/profiles.ts —
pas de mark SVG dedie, pas d'entree board separee (rendus comme cartes segment sur la home + un
panneau upcoming generique). Recherche "MONARK Verdict" (chaine litterale complete, pour eviter le
faux-positif du mot "verdict" tres frequent dans le code Hikae) : 6 occurrences, toutes dans la
couche presentation, confirmant C-1 (aucun agent moteur nomme dans le registre gele) vs la decision
beta (Mokugeki x Kamae nommes dans le panneau `fleet-presentation.ts` seulement).

## Addendum 2026-09-18 (procurement PR-2 close — fichiers remis par l'investisseur)
| Fichier | Date | Résumé | Statut | Pièce |
|---|---|---|---|---|
| `produit-ukemi-loop-clearing.md` (copié dans `MONARK SUITE\` et ici) | 2026-09-07 | Ukemi **mode L** « loop-clearing » : le loop de l'utilisateur = réseau Eisenberg–Noe à n petit ; choc D nommé → équité résiduelle E(D) en intervalle → `flatten | reduce | hold` ; résidus nommés `capo_oracle`, `lt_bonus_path_break`, `fire_sale_lambda`, `primary_closed_weekend` ; payeur = looper / risk lead (pas Aave DAO) ; MVP 30 j (1 wallet e-mode, D ∈ {3,5,7,10} %, n ≤ 3, replay CAPO 2026-03-10 + 2025-10-10) ; pricing cible interne 10–20 % du bonus évité ou 2–8 bps ; biblio EN 2001, Rogers–Veraart 2013, Gatto 2026, DFS août 2026, Gibbs–Candès, Chow 1970 | proposé (mode d'Ukemi, pas 12ᵉ agent) | Ukemi (+ Kessai unwind, Genkan `before_tool(loop)`, Kyokusen PT = nœud) |
| `ukemi-eisenberg-noe-audit.md` | 2026-09-07 | Audit de 6 idées EN : TUE oracle systémique / assurance / MEV searcher / cross-chain EN ; GARDE moteur EN dans le pipeline agent (= Hikae + Ukemi + Genkan) ; FAIBLE dashboard DAO (module) ; trois modes d'Ukemi : L loop-clearing (construire), C cluster fire-sale Cifuentes (après L), K keeper (ne pas cloner DFS) ; falsification : L meurt si un seuil 105 % a même shortfall et même taux de faux positifs que l'intervalle | proposé | Ukemi |
Note orchestrateur : ces deux documents répondent à la cible « liquidable sous choc de prix » rejetée dans l'AUDIT (§2/§6) par une **autre paire** : ŷ = E(D) sur le loop de l'utilisateur (petit graphe, Gatto : bonus e-mode 1 %, LT 0,95), y = équité réalisée après le choc nommé. Payeur nommé par profil (looper/desk), pas par nom ⇒ reste sous la décision (0)/D7 de l'ADR-M015 ; à soumettre à l'advisor-defi (calibrabilité : E(D) est-il un outcome observable hors exécution ?) et à l'advisor-marché avant tout G0. Chiffres du document = [2nd] (FC26, BoC 2026, Gatto SSRN 7157638, Chaos avr. 2026) jusqu'à lecture.
