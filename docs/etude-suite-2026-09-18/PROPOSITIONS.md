# PROPOSITIONS — corpus produit MONARK — 2026-09-18

> ETAT : LECTURE COMPLETE de tout le perimetre mission (F:\Monark\docs, MONARK SUITE au complet,
> la claque, GTM, autres produits monark, narabi-phase, NARABI en identification). Chercheur :
> claude-sonnet-5. Aucun commit. Ecrit au fil de l'eau, reecrit a chaque dossier ferme.

Chaque entree : source (chemin), date, statut, pièce de rattachement ou "hors fleet".
Regle de vocabulaire tenue dans ce document (mission) : les deux mots explicitement bannis par la
mission (celui qui designe une collaboration commerciale nommee, celui qui designe l'independance
totale d'execution d'un agent) n'apparaissent nulle part dans le texte que j'ecris moi-meme
ci-dessous, y compris quand un document source du corpus les emploie lui-meme (reformule).

---

## Propositions rattachees a une pièce du registre (11+5)

### Narabi (piece #4, built — classe servie USDe)

1. **produit-F-run-redemption.md** — MONARK SUITE (racine), 2026-09-06, auteur non nomme. Statut :
   proposition d'origine -> DEVENUE Narabi (ADR-M008, 2026-09-12). Pas une proposition ouverte.
2. **SCOUT-P-F-6-usdc-candidate.md** — chercheur Sonnet 5, 2026-09-16. Statut : candidat retenu,
   NON calibre. Recommande USDC (SVB mars 2023) comme candidat de calibration.
3. **SCOUT-P-F-7-usde-candidate.md** — chercheur Sonnet 5, 2026-09-16. Statut : candidat RETENU et
   CALIBRE depuis (README racine confirme "a committed calibration for one population — USDe").
   Recompute on-chain [lu] direct par le chercheur (methode documentee, un defaut de chunking
   trouve et corrige avant livraison).
4. **SCOUTING-F-fdusd.md** — chercheur Sonnet 5, 2026-09-16 (revise le meme jour apres consultation
   advisor). Statut : candidat plausible, NON calibre. Verdict nuance : separation calme/run
   modeste (x2,3-6,4 dans le bon regime de supply, x1,4 seulement si mal compare).
5. **AUDIT-next-piece-2026-09-18.md §3-4-6** — orchestrateur + advisor-defi, 2026-09-18. Statut :
   ordre propose FDUSD -> sUSDe -> USDtb pour la 2e classe de calibration (GHO en exercice de
   decomposition seul, refus attendu). Rectificatif §6 (meme jour) : sUSDe confirme comme "vraie
   nouveaute" (classe "entree de file", jamais poolee) meritant le scouting complet avant tout G0 ;
   FDUSD garde le meilleur dossier mais son churn "en rafales" impose une fenetre >24h ou une
   classe "rafale" a pre-enregistrer. DECISION FINALE NON PRISE (verbatim : "decision investisseur
   sur FDUSD (fenetre a pre-enregistrer) ou sUSDe (scouting F2-style) avant tout lot").
6. **PHASE-SUIVANTE.md Action 1.3** — investisseur/orchestrateur, 2026-09-18. Statut : proposition
   cadre (pas un choix tranche) : nouvelles task_class par famille de stables ET par cadence horaire
   (nouvelle classe "Mondrian"), branche ACI (a) si le critere (iii) tire, B_t a bFloor=0.
7. **advisor-defi (2026-09-16), cite par SCOUT-P-F-7 §0bis** — ruling sur F2 msUSD degenere :
   Option A retenue (rester under_calib) ; Option B = "lot de famille distinct", candidats nommes
   explicitement [abs] : USDC, USDe (executes depuis), PSM Sky/Maker, PYUSD, LUSD/BOLD (ces trois
   derniers NON scoutes dans le corpus indexe — item ouvert).
8. **narabi-phase/06-enrichissement.md** — auteur non nomme, 2026-09-15. Statut : proposition de
   6 adapters futurs au-dela des stables de rachat : ERC-4626 (`convertToAssets`+file redeem),
   Morpho/Aave/Kamino (utilisation), attestor PoR (liveness HTTP), LST unbonding ("plus tard, pas
   V1"), "hours banking" (rattache a Koyomi pour le calendrier). Aucun de ces adapters n'est
   confirme construit dans le README racine (qui ne mentionne qu'USDe).

**CONTRADICTION relevee, non tranchee (a signaler telle quelle)** : SCOUT-P-F-6-usdc-candidate.md
§0bis signale que deux documents internes donnent un nom et un horizon DIFFERENTS pour ce qui
semble etre la meme classe de tache :
- `PROCUREMENT-P-F-5-msusd-data.md` (2026-09-12/13, [lu]) nomme la classe **stable-run-velocity-24h**
  (horizon 24h), ADR-M008 F2 ;
- `NARABI PHASE\narabi-phase\04-task-classes.md` (15 septembre 2026, [lu] dans cette passe) nomme
  les classes live **flow-redeem-1h** (horizon 1h) et **utilization-lock-1h**, et REJETTE
  explicitement une variante 24h ("flow-redeem-15m / -24h" listee comme "copies d'horizon !=
  Mondrian").
Le chercheur de la passe du 2026-09-16 note ne pas avoir mandat pour trancher et remonte une demande
de consultation formee (canal 2, orchestrateur) avec deux options : (a) flow-redeem-1h supersede
stable-run-velocity-24h ; (b) les deux classes coexistent (lois differentes). **Cette passe
d'indexation ne tranche pas non plus** — signalee comme contradiction ouverte, datee, avec les deux
sources, conformement a la discipline doc 03. A rapprocher : `docs/AUDIT-next-piece-2026-09-18.md`
(2026-09-18, le plus recent lu dans cette passe) continue d'utiliser "stable-run-velocity-24h" sans
mentionner l'autre nom — la contradiction n'est donc PAS resolue par le document le plus recent lu
dans cette passe, alors meme que narabi-phase (09-15) est chronologiquement APRES le premier usage
de "stable-run-velocity-24h" (09-12/13).

**DEUXIEME CONTRADICTION relevee (schema propose vs schema livre), narabi/AttestedFlow** :
`narabi-phase/03-contrat-v1.md` (2026-09-15) propose un vocabulaire de 12 residus pour
`AttestedFlow`, dont `run_started`, `mint_spike`, `u_lock`, `primary_closed` (distinct de
`primary_closed_weekend`) et **`under_witness`** (residu de fail-closed "pas de flux hashable").
Le schema effectivement gele et livre, `schemas/attested-flow.schema.json` (ADR-M008, deja accepte
le 2026-09-12, donc AVANT ce document du 09-15), a un enum `residual` FERME a exactement 7 valeurs :
`ap_capacity_unknown`, `attestor_silent`, `attestor_terminated`, `primary_closed_weekend`,
`cross_venue_gap`, `redeem_velocity_unexplained`, `mint_wall` — **aucune trace** de `run_started`,
`mint_spike`, `u_lock`, `primary_closed` (sans suffixe) ni `under_witness`. Confirmation
independante : `docs/AUDIT-next-piece-2026-09-18.md` §2 point 5 (2026-09-18) constate explicitement
"`under_witness` n'existe pas dans l'enum". Lecture proposee (non tranchee par moi) : soit
narabi-phase/03 documente une PROPOSITION anterieure ou parallele qui n'a pas ete retenue au moment
du gel, soit c'est un brouillon jamais synchronise avec le schema final. Les deux sources sont
citees, datees, la divergence n'est pas arbitree ici.

### Ukemi (piece #3, built)

9. **Memo Grok "prochaine piece apres Narabi et ACI"** — auteur non nomme dans les extraits vus,
   date implicite 2026-09-18 (audite le jour meme). Statut : **REJETE**. Proposait "Ukemi <- file +
   book Aave" (liquidations Aave reelles sur collateral USDe/sUSDe) comme rang 1 d'enrichissement.
   Source : `docs/AUDIT-next-piece-2026-09-18.md` §2 (rejet initial, 5 raisons) + §6 (rectificatif
   le meme jour : la cible n'est pas "nulle par construction" mais "degeneree par parcimonie", 64
   jours sur ~470 avec des LiquidationCall, dont 2 jours >= 1 M$ — le rejet de la forme proposee est
   MAINTENU malgre la correction empirique ; reouverture = escalade investisseur + acheteur nomme).
10. **Rang 1 alternatif retenu** — AUDIT-next-piece-2026-09-18.md §4, orchestrateur, 2026-09-18 :
    filtrer `LiquidationCall` Aave V3 Core sur collateralAsset {USDe, sUSDe, PT-*} et debtAsset=USDe,
    a faible cout (`eth_getLogs`, pas de `eth_call` par compte) — pour FERMER definitivement la
    question sur pieces, pas pour construire un produit Ukemi-Aave.
11. **narabi-phase/05-ukemi.md et 08-alignement.md** (auteur non nomme, 2026-09-15) : renvoient vers
    un fichier `produit-ukemi-loop-clearing.md` (mode L, intervalle d'equite du loop) qui serait le
    document produit pour une extension Ukemi "loop-clearing" distincte de la cascade 24h —
    **INTROUVABLE** dans tout `Downloads\` (recherche par nom effectuee, 0 resultat). Proposition
    dont la source primaire n'a pas pu etre localisee ; a demander au mainteneur si elle existe
    ailleurs.

### Kaihi / Kessai / Mokugeki / Kamae / Kyokusen (pieces #6,7,5,8,9)

12-16. **gap-{A,B,C,D,E}-*.md + produit-{A,B,C,D,E}-*.md** — MONARK SUITE/MONARK suite/, 2026-09-06,
    auteur non nomme. Statut : propositions ouvertes, non tranchees, non commencees (aucun code
    moteur trouve dans packages/). Voir FICHES-pieces.md #5-#9 pour le detail par piece. Rang cash
    indicatif donne par le README du dossier (non une decision) : A=1, B=2, C=3, D=4 (PnL), E=5.
17. **la claque/produit-03-skill-gate.md et produit-05-tweet-signs.md** (auteur non nomme,
    2026-09-11) : proposent d'ETENDRE Genkan au-dela de produit-H (gate d'INSTALL d'un skill tiers,
    et gate de la SOURCE d'une instruction sign/transfer) — extensions rattachees a Genkan, pas des
    pieces separees. Voir section "la claque" ci-dessous.
18. **la claque/produit-04-event-or-vote.md** (2026-09-11) reprend integralement la these de
    `biblio-beta-adjudication.md` (Verdict) sur un episode concret (Strategy 8-K 1er juin 2026) —
    convergence, pas une proposition distincte.

### Softlanding / Verdict / Firebreak / Warden (produits #14,15,12,13)

19-22. **biblio-{alpha-v4, beta-adjudication, gamma-adl, delta-safe}.md** — MONARK SUITE/sous
    produits/1/, 2026-09-08, auteur non nomme. Statut : biblio de construction (pas des specs
    produit completes comme A-E), mapping confirme vers Softlanding/Verdict/Firebreak/Warden. Voir
    FICHES-pieces.md #12-15.

### Koyomi / Genkan (pieces #10, #11)

23. **produit-G-hours-gap-hip3.md** — MONARK SUITE (racine), 2026-09-06, auteur non nomme. Statut :
    proposition ouverte. Repositionnee "rang 3" (apres la 2e classe Narabi) par
    AUDIT-next-piece-2026-09-18.md §4 (orchestrateur, 2026-09-18) — pas un G0, un ordre de file.
24. **produit-H-openclaw-skill.md** — MONARK SUITE (racine), 2026-09-06, auteur non nomme. Statut :
    proposition ouverte ; distribution GENERIQUE du gate deja livree (ADR-M006, 2026-09-11) mais
    PAS ce produit specifique (wrapper before_tool transfer/swap/sign).
25. **GTM/03-beachhead.md** (auteur non nomme, 2026-09-10) : propose Genkan/profil "00 OpenClaw
    operator" comme SEUL beachhead go-to-market tenable en solo (5 raisons : trialability,
    compatibility, distribution hackathon deja payee, ACV <5k$ credible en PLG, effet cross-side
    vers le Sceau) — decision de sequencement GTM, pas une decision d'ingenierie produit ; ACV
    cible "0 puis 2-10 k$" pour le skill Genkan.
26. **la claque/produit-01-the-lock.md et produit-02-1010-replay.md** (2026-09-11) : proposent des
    demos/campagnes "full flotte" ancrees sur des episodes reels (exploit Kelp DAO 18 avril 2026,
    krach du 10 octobre 2025) qui exercent TOUTES les pieces simultanement via Genkan comme point
    d'entree — composites, pas des pieces.

---

## Propositions hors fleet (les 16 pieces n'en font pas mention, ou explicitement exclues)

### Les 3 "produits-visage" — Attestation / Hallmark / Threshold

27. **produits-visage-11-couches.md + gap/produit-dossier.md + gap/produit-sceau.md** — MONARK
    SUITE/produit visage/, 2026-09-08, auteur non nomme. Statut : proposition ouverte, NOMMEE et
    KEYEE dans `apps/site/lib/fleet-presentation.ts` (INSIDE "attestation"/"hallmark"/"threshold")
    et `apps/site/lib/profiles.ts` (profils 6-8) mais explicitement HORS du registre gele
    `fleet.ts` (ni FLEET_AGENTS ni PRODUCTS — confirme par le commentaire de tete de
    MONARK-suite/README qui dit auditer seulement Shogen/Hikae/Ukemi comme "deja sur la roadmap",
    et par `produits-visage-11-couches.md` en-tete : "Hors scope : hooks, flotte deja SKU, γ/β/α/δ
    (doigts, pas le visage)" — donc le corpus lui-meme classe le visage comme UNE CATEGORIE
    DISTINCTE des "doigts" (produits) et de la "flotte" (agents)).
    Rattachement partiel : le 3e produit-visage, **LE DECLENCHEUR** (Threshold), n'a PAS de fichier
    gap-declencheur.md/produit-declencheur.md dedie trouve dans le dossier — il n'est documente
    QUE dans `produits-visage-11-couches.md` §3 (donc [lu] mais pas dans un fichier a son nom
    propre comme les deux autres).
    Verdict antérieur (mapping engine) : `apps/site/lib/profiles.ts` note qu'un mapping de
    conception anterieur liait Attestation->Shogen, Hallmark->Hikae, Threshold->Hikae ("design CORE
    engine mapping"), et qu'une DECISION PRODUIT du 2026-09-09 a REJETE le sens de ce mapping
    ("the design's own profile->product mapping was ERRONEOUS and is thrown out ; ... whose meaning
    a product decision REJECTED ... 2026-09-09") — les 3 profils visage ont depuis `engineKeys: []`
    (aucun moteur allume). `MODELE-ILLUSTRATION.md` §7 (2026-09-18, valide investisseur) confirme :
    "Les trois profils VISAGE n'allument aucune piece tant que leurs moteurs ne sont pas ratifies
    (registre, 2026-09-09)."

### Le "sceau" / "dossier" — recoupement de pricing avec Warden

28. `produit-sceau.md` §4 (MONARK SUITE/produit visage/, 2026-09-08) cite explicitement le pricing
    de Warden comme etalon : "Licence 2-8 k$/mois/vault (ordre de δ Safe)" — recoupement de
    tarification entre un produit-visage (hors fleet) et Warden (piece #13), sans que les deux
    soient le meme objet. Confirme et etendu par GTM/07-ventes.md (2026-09-10) qui liste le meme
    ordre de grandeur (2-8 k$/mois) pour le "Sceau" comme produit de GTM a part entiere.

### DefiDrama — MISE DE CÔTÉ (decision investisseur, la plus recente et la plus explicite du corpus)

29. **DefiDrama** apparait dans trois sources, JAMAIS comme fichier gap-/produit- dedie dans le
    perimetre de lecture de cette mission (aucun `MONARK SUITE\...\defidrama*.md` trouve dans le
    perimetre indexe ; grep confirme sur la claque/GTM/autres produits/narabi-phase : 0 occurrence
    hors site-redesign) :
    - `docs/PHASE-SUIVANTE.md` (2026-09-18) §3, verbatim : "DefiDrama : mis de cote par decision
      investisseur du 2026-09-18 ; ni piece ni produit tant que la question 'produit experimental
      nourri par Narabi ou non' n'est pas tranchee ; ne pas le mentionner avec les produits."
    - `MONARK SUITE/site-redesign/BRIEF.md` addendum "2026-09-18 quater", verbatim investisseur :
      "on n'a pas encore decide si on en fait ou pas un produit experimental nourri par Narabi" ;
      action : le mark SVG deplace vers `assets/hors-perimetre/`, ne doit apparaitre "nulle part
      dans le diagramme, la liste des pieces, les profils clients ni les produits de l'ancien
      site".
    - `MONARK SUITE/site-redesign/MODELE-ILLUSTRATION.md` §2 et §7 (2026-09-18, modele valide) :
      "DefiDrama est hors perimetre (decision 2026-09-18) : ni piece ni produit ; jamais montre,
      jamais mentionne avec les produits."
    Caracterisation trouvee (BRIEF.md, description du fichier `defidrama-mark.svg`) : "produit
    derive depeg" — seul indice de nature dans le corpus indexe ; aucune specification (gap/produit)
    de DefiDrama n'a ete lue dans cette passe (n'existe pas dans le perimetre de lecture donne).
    **Statut retenu ici : hors fleet, explicitement REJETE/mis de cote, decision datee 2026-09-18,
    la plus autoritative et la plus recente du corpus sur ce point — reconduite a l'identique par
    trois documents independants du meme jour.**

### Recoupement Kessai <-> "best-execution" d'inference LLM (hors-fleet, corpus inference)

30. `produit-B-tca-swap.md` §1.2 (MONARK suite, 2026-09-06) signale lui-meme : "Le best-ex tokens
    LLM (produit-01 du corpus inference) — meme maths, autre marche." Ce "produit-01" est
    **autres produits monark/produit-01-best-execution.md** (2026-09-06, auteur non nomme) —
    CONFIRME apres lecture complete : meme objet mathematique (implementation shortfall de Perold
    1988), meme reference biblio (Perold, Almgren-Chriss, MiFID II RTS 27/28), applique a un marche
    DIFFERENT (facturation d'inference LLM entre providers, pas des swaps DeFi). Statut : proposition
    hors-fleet totalement independante, jamais rattachee au registre `fleet.ts` (0 occurrence des
    noms de pieces dans tout le dossier "autres produits monark", verifie par grep).

### "autres produits monark" — 6 propositions hors-fleet completes (marche inference LLM), 2026-09-06

31. **produit-01-best-execution.md** — proxy de best-execution d'inference (implementation shortfall
    vs sticker price, reçu d'audit) ; acheteur nomme par categorie : "CFO / FinOps / head of eng"
    avec >10 k$/mois de tokens ; pricing 20-30% des economies. Rang cash #1 du dossier (12 mois p50
    150-500 k$).
32. **produit-02-kv-cache.md** — hote de cache KV cross-tenant pour prefixes chauds (papier
    "Can I Buy Your KV Cache?", arXiv:2606.13361, reuse mesure 49,7x) ; feature du produit-01 ou
    vendu aux providers d'inference (Together, Fireworks). Rang cash #2.
33. **produit-03-hedging-polymarket.md** — copilote de couverture panier personnel via marches
    Polymarket/Kalshi/Parcl deja listes, sans licence ni execution propre. Rang cash #3 (15-80 k$).
34. **produit-04-calibration-brier.md** — leaderboard de calibration Brier d'agents (auto-annonce de
    p(succes) et de cout avant d'agir, mesure ensuite) ; acheteur = un laboratoire/marketplace
    (Mercor/Prime Intellect cites comme comparables, pas comme prospects). Rang cash #4 (0-120 k$,
    typiquement un seul contrat).
35. **produit-05-escrow-inference.md** — escrow d'inference JSON-mode (stake + re-run sur un 2e
    provider, PAS une assurance) ; acheteur = 2-3 protocoles DeFi (oracles, RWA). Rang cash #5
    (0-40 k$).
36. **produit-06-agent-credit-score.md** — score d'agent "payment-grounded" sur ERC-8004 (554 344
    enregistrements au 4 sept. 2026) : une review ne compte que si un paiement x402 on-chain > 1$ la
    confirme ; acheteur = un merchant x402. Rang cash #6 (0-20 k$).
    **Aucun des 6 ne se rattache au registre fleet.ts** (verifie par grep, 0 occurrence) ; le nom du
    dossier ("autres produits monark") suggere qu'ils ont ete consideres comme candidats MONARK a un
    moment, mais le contenu ne fait aucun lien architectural avec les contrats geles ou les pieces.

### GTM — sequencement et pricing appliques aux pieces existantes (hors-fleet, pas une piece), 2026-09-10

37. **GTM/00-index.md a 09-kpis-risques.md** (10 fichiers + biblio, auteur non nomme, 2026-09-10) —
    ne proposent aucune piece nouvelle. Contribution utile a signaler : un schema de "profils
    numerotes" (00 a 07 + File + Sceau) qui NOMME et SEQUENCE les pieces existantes pour la mise sur
    marche (00 OpenClaw operator/Genkan en beachhead ; 01 LP vault-curator/Kaihi+Sceau OU 02
    DAO-agent ops/Kessai+File comme premier "lighthouse", jamais les deux en parallele ; 03
    borrower-looper/Ukemi ; 04 PM desk/Kamae niche ; 05 HIP-3-RWA/Koyomi niche ; 06 stable
    curator/Narabi ; 07 FI treasury/Kyokusen, "plus petit cheque"). Ce schema de profils est repris
    tel quel par `la claque` (qui parle de "profil 00"), ce qui suggere que GTM (09-10) est
    anterieur et source pour la claque (09-11). ACV cibles consolidees en §07-ventes.md : Genkan
    0->2-10k$/an, Kaihi 80-250k$ (3-8 vaults), Kessai 50-180k$ ou 20% des bps sauves, Sceau
    2-8k$/mois/vault, File 180-540k$/12 mois (3 fonds + 2 CASP) — ce sont des CIBLES internes non
    sourcees a un client reel, pas des contrats signes.
38. **Contrainte calendaire hackathon citee par GTM (04-clawrena.md)** : deadline de tokenisation
    "20 septembre 2026 23:59 UTC" (ClawPump/AnsemHack) — coherente avec la meme deadline citee dans
    `docs/adr/ADR-M003-phase2-integration.md` (calendrier §1.2, "2026-09-20 23:59 UTC (limite)"), un
    recoupement de date entre le corpus GTM (hors-fleet) et un ADR du depot (fait) qui confirme que
    les deux corpus decrivent bien la meme entreprise/chronologie.

### "la claque" — 5 campagnes composites reutilisant les pieces (hors-fleet en tant que produits), 2026-09-11

39. **produit-01-the-lock.md** — File public + skill Genkan qui abstain sur `utilization_lock` /
    `receipts_not_asset`, ancre sur l'exploit Kelp DAO (18 avril 2026, bad debt 123,7-230,1 M$ selon
    la FSA japonaise citee, 30 juin 2026) et son actualite du 10 septembre 2026 (NYDIG, BeInCrypto).
    Residus PROPOSES non presents dans le schema `AttestedFlow` gele (`utilization_lock`,
    `receipts_not_asset`, `rate_ceiling`, `guardian_freeze` — a comparer a la meme divergence notee
    pour narabi-phase ci-dessus : aucun de ces noms n'est dans l'enum ferme a 7 valeurs livre).
40. **produit-02-1010-replay.md** — replay hop-par-hop du krach du 10 octobre 2025 (19,3 Md$ liquides
    Coinglass, ADL Hyperliquid 2,1 Md$/12min, meme source Chitra arXiv:2512.01112 que
    biblio-gamma-adl.md/Firebreak), GTM calendaire cale sur J+365 (avant le 3 octobre 2026, thread le
    10 octobre 20:49 UTC).
41. **produit-03-skill-gate.md** — extension de Genkan : gate l'INSTALL d'un skill tiers (pas
    seulement son execution), en reponse a une vague d'incidents securite ClawHub documentee
    (Koi/Yomtov 341/2857 skills malicieux, Snyk 3984 skills scannes, Unit 42 "agentic front-running"
    juin 2026). Le document nomme lui-meme "Genkan (le SKU)" comme piece porteuse.
42. **produit-04-event-or-vote.md** — reprend integralement `biblio-beta-adjudication.md` (Verdict)
    avec un episode concret (Strategy/MicroStrategy 8-K 1er juin 2026, marche Polymarket "sold by
    May 31" tranche No par vote UMA malgre une vente reelle documentee).
43. **produit-05-tweet-signs.md** — extension de Genkan : gate la SOURCE (canal) d'une instruction
    sign/transfer, ancre sur l'incident Bankr x Grok du 4 mai 2026 (~175 k$ draines via un message en
    morse tag Bankrbot).
    **Aucune des 5 campagnes ne cree de piece nouvelle** ; toutes composent des pieces EXISTANTES
    (majoritairement Genkan comme point d'entree) avec les produits-visage File/Sceau (eux-memes
    hors-fleet, item 27 ci-dessus). Statut retenu : propositions de CAMPAGNE/GTM ancrees sur l'actu,
    pas des specifications de produit au sens de MONARK suite A-E/F-H.

---

## Recapitulatif des statuts "rejete" ou "mis de cote" trouves dans le corpus (le plus fort niveau de preuve)

| Objet | Decision | Date | Source primaire (la plus datee/directe) |
|---|---|---|---|
| Ukemi <- file+book Aave liquidations (forme initiale du memo Grok) | REJETE (maintenu apres rectificatif empirique) | 2026-09-18 | `docs/AUDIT-next-piece-2026-09-18.md` §2 et §6 |
| DefiDrama comme piece/produit | MIS DE COTE (indecision assumee, pas un rejet definitif) | 2026-09-18 | `docs/PHASE-SUIVANTE.md` §3 + 2 confirmations site-redesign |
| Mapping engine visage (Attestation->Shogen, Hallmark->Hikae, Threshold->Hikae) | REJETE (sens du mapping, pas le nommage) | 2026-09-09 | `apps/site/lib/profiles.ts` (commentaire) + `MODELE-ILLUSTRATION.md` §7 |
| Diagramme 3D "sas" (rendu Higgsfield/three.js) | REJETE (esthetique, "societe taxe carbone") | 2026-09-18 | `site-redesign/BRIEF.md` addendum 6 (hors perimetre mission, note pour memoire — pas une piece) |
| task_class `flow-redeem-1h`/`utilization-lock-1h` (narabi-phase) vs `stable-run-velocity-24h` | NON TRANCHE (contradiction ouverte) | 09-12/13 vs 09-15 vs 09-18 | voir section Narabi ci-dessus |
