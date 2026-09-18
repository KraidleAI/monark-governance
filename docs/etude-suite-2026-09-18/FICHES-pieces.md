# FICHES par piece — registre F:\Monark\apps\site\lib\fleet.ts — 2026-09-18

> ETAT : LECTURE COMPLETE du perimetre mission. Ecrit apres lecture de : F:\Monark\docs
> (racine+adr+G7-phase1), MONARK SUITE au complet (suite A-E, F/G/H, biblio-F-narabi, produit
> visage, sous produits/1, site-redesign BRIEF+MODELE-ILLUSTRATION), la claque, GTM, autres
> produits monark, narabi-phase, grep packages/apps (Mokugeki..Genkan, Firebreak..Ballast),
> profiles.ts, fleet-presentation.ts, agents-presentation.ts. Confirme par grep : la claque, GTM et
> narabi-phase referencent les pieces par leur nom flotte (integre ci-dessous) ; "autres produits
> monark" ne le fait JAMAIS (0 occurrence, hors-fleet total, voir PROPOSITIONS.md). Chercheur :
> claude-sonnet-5. Aucun commit.

Perimetre : EXACTEMENT les 16 entrees du registre gele (`fleet_register_built_set_is_frozen`,
test/ci-gates.test.ts) — 11 FLEET_AGENTS (Shogen, Hikae, Ukemi, Narabi = built ; Mokugeki, Kaihi,
Kessai, Kamae, Kyokusen, Koyomi, Genkan = upcoming) + 5 PRODUCTS (Firebreak, Warden, Softlanding,
Verdict, Ballast = upcoming). Aucune piece n'est ajoutee. Les "produits-visage" (Attestation /
Hallmark / Threshold) et DefiDrama sont explicitement HORS de ce perimetre (voir PROPOSITIONS.md) ;
ils apparaissent ici seulement comme contexte croise quand une source les mentionne a cote d'une
des 16 pieces.

Convention par fiche : ce que c'est -> ce que ca apporte / acheteur nomme -> dependances aux 5
contrats geles -> deja fait dans le depot -> propositions existantes (auteur/date) -> verdicts
anterieurs (G7/advisor) -> ce qui manque.

---

## 1. Shogen — sensor — BUILT

**Ce que c'est (fleet.ts)** : role sensor, ligne registre verbatim : "Attested perception — a
verified price testimony." Chambre Attest (MODELE-ILLUSTRATION.md §3/§7). Depot separe (`F:\Shogen`,
Rust), expose sa sortie attestee comme frontiere consommee par MONARK (ADR-M001 D1).

**Ce que ca apporte** : temoignage verifie d'un prix (bytes + hash + hypotheses residuelles
nommees), JAMAIS un nombre de prix ni un score de confiance (Shogen 03 §0, cite par ADR-M001).
Le nombre de prix est interprete en aval par un adapter HIKAE (README.md racine).

**Acheteur nomme** : aucun acheteur nomme trouve dans le corpus indexe (Shogen precede ce corpus ;
MONARK suite/README.md dit explicitement "Shogen ... deja sur la roadmap, ce dossier ne l'audite
pas"). Le README racine documente une CA publique (token) mais pas un acheteur B2B nomme pour
l'attestation elle-meme.

**Dependances aux 5 contrats geles** : producteur de `AttestedPrice` (schemas/attested-price.schema.json,
ADR-M001 Decision 3). `sens_emis_digest` optionnel vient du `Constat` (`verification.rs`).

**Deja fait dans le depot** : `crates/shogen-core/src/temoignage_canonique.rs`,
`verification.rs` (F:\Shogen, hors perimetre lecture de cette passe mais cite par ADR-M001/M003) ;
adapter `packages/monark/src/adapter-shogen.ts` + tests ; fixtures Shogen exportees publiquement
(Q-A ADR-M005) ; panneau `apps/site/components/shogen-panel.tsx`. Statut "built" verrouille par le
test `fleet_register_built_set_is_frozen`.

**Propositions existantes (auteur/date)** : aucune proposition alternative trouvee dans le corpus
Downloads indexe (Shogen n'est pas un "produit" candidat, c'est un prerequis deja livre).

**Verdicts anterieurs (G7 / advisor)** : Phase 0 (ADR-M001) G7 = ACCEPTE (orchestrateur
`claude-fable-5-1`), checkpoint validateur-humain accepte-avec-corrections C1-C14. Shogen campagne
S2/S3 geree dans F:\Shogen (hors perimetre de cette passe ; voir docs/PHASE-SUIVANTE.md Action 2,
"Shogen FULL" differe apres la phase couratne, mise de cote au 2026-09-18 selon
RAPPORT-passe-narabi-aci.md §0).

**Ce qui manque** : rien signale comme manquant pour la piece elle-meme dans le corpus indexe (piece
consideree livree) ; la suite ("Shogen FULL", reetude d'horizon) est actee comme action separee et
sequencee, non traitee par ce corpus.

---

## 2. Hikae — gate — BUILT

**Ce que c'est (fleet.ts)** : role gate, ligne verbatim : "Coverage-controlled inference — the gate
itself." Chambre double Calibrate + Gate (MODELE-ILLUSTRATION.md §7 : "Hikae = filtre double, deux
chambres").

**Ce que ca apporte (fleet-presentation.ts INSIDE.hikae)** : conformal prediction (split-conformal),
couverture marginale a echantillon fini, politique de porte fermee emettant commit/defer/abstain
contre la region et le budget, monitoring en ligne du risque restant.

**Acheteur nomme** : aucun acheteur B2B nomme dans le corpus indexe ; Hikae est le coeur backbone
consomme par tous les autres produits/pieces (pas vendu seul).

**Dependances aux 5 contrats geles** : consomme `Prediction`, produit `CoverageVerdict` et
`GateDecision` (packages/hikae/src/l1-split.ts, l3-gate.ts, region.ts, verdict.ts).

**Deja fait dans le depot** : `packages/hikae/*` (L1 split-conformal, L2 monitor, L3 gate, interval
conformer), 66+ tests a la cloture Phase 1 (G7-phase1.md). Garde non-degenerescence ADR-M011
(largeur nulle -> under_calib). Endpoint harnais `gate`/`calibrate` en production (ADR-M005/M007).

**Propositions existantes** : aucune dans le corpus Downloads (Hikae est backbone, pas un
"produit A-E/F-H" candidat).

**Verdicts anterieurs (G7/advisor)** : G7-phase1.md (2026-09-04->05) : "ACCEPTE — les trois lots
sont integrables" (Hikae = lot H, accepte-avec-corrections G2 puis clos-avec-reserves fermees).
ADR-M011 (implemente, G2 approuve, G7 accepte, checkpoint-2 valdateur accepte-avec-corrections
C-1..C-7, 2026-09-17) corrige le defaut de degenerescence msUSD.

**Ce qui manque** : rien signale comme piece manquante ; travaux en cours = calibrations par
task_class supplementaires (cf. Narabi, et le debat Ukemi-Aave ci-dessous).

---

## 3. Ukemi — act — BUILT

**Ce que c'est (fleet.ts)** : role act, ligne verbatim : "Liquidation-cascade survival." Chambre
Agir avec Kaihi/Kessai/Kamae/Koyomi (MODELE-ILLUSTRATION.md §7).

**Ce que ca apporte (INSIDE.ukemi)** : point fixe de clearing reseau (Eisenberg-Noe), sequence de
defauts fictifs (chaque noeud paie ce qu'il peut, par rondes), taux de recouvrement alpha/beta et
amplification de contagion, intervalle conforme pour la cascade conforme par la porte.

**Acheteur nomme** : AUCUN a ce jour pour une extension "Ukemi-Aave" (constat explicite,
AUDIT-next-piece-2026-09-18.md §2.6, citant le G7 UKEMI du 2026-09-03 : "pas de G0 Ukemi sans
acheteur nomme formulant une exigence de couverture" — source primaire `liquidations/G7-VERDICT-UKEMI.md`,
HORS PERIMETRE de cette passe, situee hors F:\Monark ; citee ici au niveau [2nd] via ADR-M002
Rattachement + AUDIT-next-piece-2026-09-18.md).

**Dependances aux 5 contrats geles** : consomme `CoverageVerdict` (region interval), participe a
`GateDecision`. `packages/ukemi/src/liquidable.ts`, `clearing.ts`.

**Deja fait dans le depot** : `packages/ukemi/*` (clearing E&N, `liquidableAmount`), 51+ tests
Phase 1 (G7-phase1.md), finding empirique test 21 (amplification reseau mesuree). Sous-wiring
"Ukemi-V4" (alpha, biblio-alpha-v4.md) et "Ukemi-ADL" (gamma, biblio-gamma-adl.md) documentes comme
biblio de construction pour Softlanding et Firebreak (pas pour Ukemi lui-meme, qui reste le moteur
generique de cascade). `narabi-phase/05-ukemi.md` (2026-09-15) documente le cablage Narabi -> Hikae
-> Ukemi (Ukemi consomme les features du livre — qty/debt/K/queue — que Narabi remplit, jamais une
task_class Narabi).

**Propositions existantes (auteur/date)** : mémo Grok "prochaine piece apres Narabi/ACI"
(non nomme, date implicite 2026-09-18, cite et audite par AUDIT-next-piece-2026-09-18.md) proposait
"Ukemi <- file + book Aave" (liquidations Aave reelles) comme rang 1 d'enrichissement — REJETE (voir
PROPOSITIONS.md). Par ailleurs, `narabi-phase/05-ukemi.md` et `08-alignement.md` (2026-09-15)
renvoient vers un `produit-ukemi-loop-clearing.md` (mode L, intervalle d'equite du loop, distinct de
la cascade 24h) qui serait un document produit specifique — recherche par nom sur tout `Downloads\`
effectuee dans cette passe : **fichier INTROUVABLE**. Soit renomme/supprime depuis, soit jamais
livre au chercheur ; signale comme NON TROUVE plutot que silencieusement ignore (doc 03).

**Verdicts anterieurs (G7/advisor)** : G7-phase1.md ACCEPTE (lot U). AUDIT-next-piece-2026-09-18.md
§2 : rejette la forme "Ukemi <- file + book Aave" (5 raisons : cible degeneree par construction sur
le feed USDe/sUSDe Aave "Capped USDT/USD", pas de cable liquidableAmount<->flux, deux books
confondus, cout eth_call archive prohibitif, vocabulaire faux under_calib au lieu de
attestation_absent/binding_broken) ; §6 rectificatif du meme jour : la cible n'est pas "nulle par
construction" mais "degeneree par parcimonie" (64/470 jours avec LiquidationCall, 2 jours >=1M$,
~86% de jours a zero) — la decision de rejet reste inchangee, la reouverture exige un acheteur
nomme ET une redefinition de cible par ADR (escalade investisseur).

**Ce qui manque** : un acheteur nomme pour toute extension Aave-liquidations ; un modele v -> shock
source (ADR-M002 D9(ii), NON TROUVE) ; le champ "Queue" n'existe pas dans `Position` ; le document
`produit-ukemi-loop-clearing.md` (NON TROUVE, ci-dessus).

---

## 4. Narabi — sensor — BUILT (classe servie, calibration USDe)

**Ce que c'est (fleet.ts)** : role sensor, ligne verbatim : "Narabi senses redemption-run velocity
from the attested onchain flow; its adaptive quantile tracker publishes a replayable daily
timeline." Chambre Attest (avec Shogen, Mokugeki).

**Ce que ca apporte (INSIDE.narabi)** : flux de rachat atteste (burns, mints, supply de cloture sur
une fenetre de blocs declaree, recalculable on-chain), tracker de quantile adaptatif (Angelopoulos-
Barber-Bates, pas decroissant), timeline publiee rejouable avec chaine de hash par ligne ; la region
de la porte reste statique jusqu'a un critere de derive pre-enregistre.

**Acheteur nomme** : "curators Morpho (poche isolee), tresoreries qui wrapent USDe/GHO/DAI"
(produit-F-run-redemption.md §2, PAS Circle, PAS Tether) — proposition d'origine, jamais confirmee
par un client reel nomme dans le corpus indexe ; le README racine ne nomme aucun client pour
Narabi.

**Dependances aux 5 contrats geles** : producteur du 5e contrat gele `AttestedFlow`
(schemas/attested-flow.schema.json, ADR-M008). Alimente `Prediction`/`CoverageVerdict`/`GateDecision`
via la task_class `stable-run-velocity-24h`. **Divergence de vocabulaire documentee** :
`narabi-phase/03-contrat-v1.md` (2026-09-15) proposait 12 residus dont `run_started`, `mint_spike`,
`u_lock`, `primary_closed`, `under_witness` ; le schema gele livre n'en retient que 7
(`ap_capacity_unknown`, `attestor_silent`, `attestor_terminated`, `primary_closed_weekend`,
`cross_venue_gap`, `redeem_velocity_unexplained`, `mint_wall`) — voir PROPOSITIONS.md pour le
detail comparatif complet.

**Deja fait dans le depot** : `apps/sentinel/*` (sentinelle hors-outil quotidienne, ADR-M012),
`packages/hikae/src/tracker.ts` (ACI, ADR-M009), calibration committee pour UNE population (USDe),
page `/narabi` (F-site-10) et `/narabi/state.json` + `/narabi/timeline.jsonl` publies en production
depuis J0 = 2026-09-17 (RAPPORT-passe-narabi-aci.md). e-detecteur de derive SRR pre-enregistre,
instrument etiquete hors etat, non declencheur (ADR-M014, RAPPORT-passe-m014-edetector.md).

**Propositions existantes (auteur/date)** : (1) produit-F-run-redemption.md (corpus MONARK SUITE,
2026-09-06, auteur non nomme) = proposition d'origine, DEVENUE Narabi. (2) Enrichissement
multi-population : SCOUT-P-F-6-usdc-candidate.md (chercheur Sonnet 5, 2026-09-16, candidat retenu
non calibre), SCOUT-P-F-7-usde-candidate.md (chercheur Sonnet 5, 2026-09-16, candidat RETENU et
calibre depuis), SCOUTING-F-fdusd.md (chercheur Sonnet 5, 2026-09-16, candidat plausible non
calibre). (3) AUDIT-next-piece-2026-09-18.md §3-4 (orchestrateur + advisor-defi, 2026-09-18) :
ordre FDUSD -> sUSDe -> USDtb pour la 2e classe, GHO en exercice de decomposition seul ; §6
rectificatif (meme jour) : FDUSD confirme (bruleur unique 100%, run 8,32%/24h, C1 0/271, churn
calme median quotidien 0%) mais B-H1 "partielle" (rachats en rafales) ; sUSDe = B-H2 CONFIRMEE
(classe distincte "entree de file", jamais poolee) ; USDtb = B-H3 confirmee (risque qhat=0) ; GHO =
B-H4 REFUS confirme (100% flash mint+burn meme tx). Decision finale NON PRISE : "decision
investisseur sur FDUSD (fenetre a pre-enregistrer) ou sUSDe (scouting F2-style) avant tout lot."
(4) PHASE-SUIVANTE.md Action 1.3 : nouvelles task_class par cadence horaire (Mondrian), branche ACI
(a) si critere (iii) tire, B_t a bFloor=0. (5) narabi-phase/06-enrichissement.md (2026-09-15) :
table de 6 adapters futurs (ERC-4626, Morpho/Aave/Kamino, attestor PoR, LST unbonding "pas V1",
"hours banking" rattache a Koyomi) — aucun confirme construit au-dela d'USDe.

**Verdicts anterieurs (G7/advisor)** : RAPPORT-passe-narabi-aci.md (2026-09-12->18) G7 = "Passe
close" (ACCEPTE). ADR-M008 = ACCEPTE (2026-09-12), escalades E-M008-1..4 ratifiees investisseur.
ADR-M009 (ACI tracker) = G7 ACCEPTE, checkpoint-2 accepte-avec-corrections C-11..C-13. ADR-M012
(sentinelle live) = checkpoint-1 accepte-avec-corrections C-1..C-14, statut d'en-tete "propose"
signale PERIME par RAPPORT-passe-narabi-aci.md ("checkpoint-2 M012-e rendu, amendement du
2026-09-18"). ADR-M014 (e-detecteur) : passe close 2026-09-18 (RAPPORT-passe-m014-edetector.md),
G7 accepte, error_origin assigne a l'orchestrateur/planificateur pour plusieurs corrections C-1/C-a-b.
advisor-defi (2026-09-16) : ruling sur F2 msUSD degenere -> Option A (rester under_calib) + Option B
"lot de famille" avec candidats nommes USDC/USDe/PSM Sky-Maker/PYUSD/LUSD-BOLD.

**Ce qui manque** : decision investisseur tranchee sur la 2e classe (FDUSD vs sUSDe) — NON PRISE au
2026-09-18 ; serie continue (pas seulement discrete) pour USDe/FDUSD/USDC ; ambiguite de nommage
classe 24h (stable-run-velocity-24h) vs 1h (flow-redeem-1h) signalee par SCOUT-P-F-6 comme demande
de consultation formee NON TRANCHEE (voir PROPOSITIONS.md, contradiction) ; acces BSC pour FDUSD
(bloque, 15+ tentatives RPC echouees) ; couverture PSM Sky-Maker/PYUSD/LUSD-BOLD (nommes par
advisor-defi, non scoutes dans le corpus indexe).

---

## 5. Mokugeki — sensor — upcoming

**Ce que c'est (fleet.ts)** : role sensor, ligne verbatim : "Mokugeki attests the facts it extracts
from a document or an event, without adding sentiment or interpretation." Chambre Attest.
INSIDE.mokugeki (upcoming) : "Cryptographic attestation for documents and events, Named residual
hypotheses."

**Ce que ca apporte / doc source** : produit-C-perception-document.md (MONARK suite, 2026-09-06) —
AttestedDoc {bytes_hash, source, fetched_at, residuals[]}, zero sentiment/confidence/p_positive ;
"4e capteur de la flotte" ; extraction (pas generation), texte -> residus nommes, prediction hors du
capteur.

**Acheteur nomme** : "desk MM (D=Kamae), vault LP (A=Kaihi), HIKAE lui-meme (input)" (produit-C
§2) — pas un client final externe nomme, plutot des consommateurs internes a la flotte.
Chiffres marche cites (non un acheteur) : PM combine ~24 Md$/mois (Pew mai 2026), sports 80% volume
Kalshi. Pricing propose : licence 2-10 k$/mois/desk, ou bundled dans A/D.

**Dependances aux 5 contrats geles** : produirait un `AttestedDoc` (NON un contrat gele existant —
proposition d'un objet frere de `AttestedPrice`, jamais formalise en JSON Schema dans schemas/).
Alimenterait `Prediction` via un adapter (comme Shogen/Narabi).

**Deja fait dans le depot** : presentation seulement — `apps/site/components/marks/mokugeki-mark.tsx`,
entree fleet.ts/fleet-presentation.ts/agents-presentation.ts, carte sur `/fleet` et le board
`gate-sim`. AUCUN code moteur dans packages/ (grep confirme). Engine cite comme co-moteur de
MONARK Verdict (avec Kamae) dans fleet-presentation.ts (decision beta 2026-09-10) et
biblio-beta-adjudication.md.

**Propositions existantes (auteur/date)** : gap-C-perception-document.md + produit-C-perception-
document.md (corpus MONARK SUITE, 2026-09-06, auteur non nomme). Reprise dans biblio-beta-
adjudication.md (sous produits/1, 2026-09-08) pour l'usage specifique "AttestedDoc x2 (source
listee + etat UMA)" au service de MONARK Verdict. Egalement repris dans la claque/produit-04-
event-or-vote.md (2026-09-11, meme these, episode Strategy 8-K) et produit-05-tweet-signs.md
(2026-09-11, Mokugeki hashe le prompt/tweet source d'une instruction sign/transfer).

**Verdicts anterieurs (G7/advisor)** : aucun G7/checkpoint trouve pour Mokugeki lui-meme dans le
corpus indexe (piece non encore passee en G0).

**Ce qui manque** : schema JSON gele pour `AttestedDoc` (n'existe pas dans schemas/) ; acheteur
externe nomme ; MVP (EDGAR 8-K ou TokenUnlocks ou feed blessures NBA, un seul au choix par
produit-C §3) non commence.

---

## 6. Kaihi — act — upcoming

**Ce que c'est (fleet.ts)** : role act, ligne verbatim : "Kaihi exits a liquidity range — minting
or burning it — ahead of toxic order flow." Chambre Agir. INSIDE.kaihi (upcoming) :
"Loss-versus-rebalancing and order-flow toxicity (Glosten-Milgrom, VPIN)."

**Ce que ca apporte / doc source** : produit-A-lvr-toxicite.md (MONARK suite, 2026-09-06) — mesure
le LVR (Milionis-Moallemi-Roughgarden-Zhang) vs fees par fenetre, predit un INTERVALLE de LVR a
5-60 min (Hikae conformalise), agit mint/burn/wait. "Pas un hook Uniswap v4" (evite explicitement
le risque Bunni, 8,4 M$ exploit, ferme oct. 2025).

**Acheteur nomme** : "Vaults LP (Gamma, Arrakis, Charm, successeurs Bunni, pockets curator) ; PAS
Uniswap Labs ; PAS le LP retail 2k$" (produit-A §2.1). Pricing : 10-20% du LVR evite, ou 3-8 k$/mois
par vault. Chiffres cites : LVR ecosysteme >500 M$/an (~1 Md$ hors stables, ordre de grandeur, Eco
Support) ; Uniswap fees ~142 M$/30j (OAK/Dune 2026) ; 87% du volume v4 sans hook (Dune Paulapivat).
GTM/03-beachhead.md (2026-09-10, profil "01 LP vault/curator") reprend Kaihi comme lighthouse
ALTERNATIF (avec le produit-visage Sceau), ACV cible 80-250 k$ si 3-8 vaults.

**Dependances aux 5 contrats geles** : `Prediction` (regression LVR) -> `CoverageVerdict` (interval)
-> `GateDecision` (commit burn/mint, defer wait).

**Deja fait dans le depot** : presentation seulement (`kaihi-mark.tsx`, fleet.ts, apparait aussi
dans `apps/site/app/how/page.tsx` — a verifier au prochain passage si c'est un exemple narratif ou
une donnee). Aucun code moteur packages/.

**Propositions existantes (auteur/date)** : gap-A + produit-A (corpus MONARK SUITE, 2026-09-06,
auteur non nomme). Sous-wiring "Ukemi-V4/alpha" (biblio-alpha-v4.md, 2026-09-08) est DISTINCT de
Kaihi (alpha = Softlanding, pas Kaihi — Kaihi reste le produit LVR/toxicite AMM autonome, aucune
biblio sous-produit dediee trouvee dans sous produits/1 pour Kaihi specifiquement). GTM/03 et 07
(2026-09-10) le positionnent comme lighthouse alternatif au profil DAO/Kessai (jamais les deux en
parallele).

**Verdicts anterieurs** : aucun G7/checkpoint trouve (piece non passee en G0).

**Ce qui manque** : acheteur reel nomme (la liste §2.1 est une categorie, pas un nom d'entite) ;
MVP (replay LVR vs fees, 1 pool ETH-USDC v3) non commence a notre connaissance.

---

## 7. Kessai — act — upcoming

**Ce que c'est (fleet.ts)** : role act, ligne verbatim : "Kessai routes a swap to a venue and issues
a settlement receipt for the execution." Chambre Agir. INSIDE.kessai (upcoming) :
"Transaction-cost analysis and implementation shortfall."

**Ce que ca apporte / doc source** : produit-B-tca-swap.md (MONARK suite, 2026-09-06) — au
GateDecision=commit, fige le mid, cote en parallele CoW/1inch Fusion/UniswapX/0x/Jupiter/HL spot,
choisit argmin IS estime, execute, log un recu a 6 axes (mid_t0, fill, venue, gas, split, bps).
Explicitement "pas un solver" (evite la concentration Rizzolver/Wintermute 26% du volume,
arXiv:2607.21955).

**Acheteur nomme** : "Runtime d'agent (Hermes). DAO ops (TokenLogic, kpk). PAS le retail CowSwap"
(produit-B §2). TokenLogic et kpk sont les seuls NOMS D'ENTITES nommes explicitement dans tout le
corpus A-E/F-H comme acheteurs potentiels (buyback Aave DAO 30-50 M$/an cite, TokenLogic fev.
2026). Pricing : 20-30% des bps sauves. GTM/03-beachhead.md (profil "02 DAO/agent ops") reprend
Kessai comme lighthouse ALTERNATIF a Kaihi, ACV cible 50-180 k$.

**Dependances aux 5 contrats geles** : consomme `GateDecision` (commit) comme declencheur ;
n'emet aucun contrat gele lui-meme, produit un "recu" hors-contrat.

**Deja fait dans le depot** : presentation seulement (`kessai-mark.tsx`, fleet.ts). Aucun code
moteur packages/.

**Propositions existantes (auteur/date)** : gap-B + produit-B (corpus MONARK SUITE, 2026-09-06,
auteur non nomme). Note explicite de recoupement : "meme maths, autre marche" que le "produit-01 du
corpus inference" (best-execution) — CONFIRME en lisant autres produits monark/produit-01-best-
execution.md (voir PROPOSITIONS.md, recoupement hors-fleet, meme objet mathematique de Perold 1988
mais marche different : inference LLM, pas swap DeFi).

**Verdicts anterieurs** : aucun G7/checkpoint trouve (piece non passee en G0).

**Ce qui manque** : acheteur nomme au-dela de la categorie generique (TokenLogic/kpk cites comme
exemples de marche, pas comme prospects confirmes) ; MVP (adapter swap Hermes, 2 venues) non
commence.

---

## 8. Kamae — act — upcoming

**Ce que c'est (fleet.ts)** : role act, ligne verbatim : "Kamae quotes both sides of a market from
inventory, and stays silent when told to abstain." Chambre Agir. INSIDE.kamae (upcoming) :
"Avellaneda-Stoikov inventory market-making."

**Ce que ca apporte / doc source** : produit-D-inventory-mm.md (MONARK suite, 2026-09-06) — quotes
Avellaneda-Stoikov autour d'un fair (Mokugeki + mid CEX), inventaire penalise, silence si Hikae
abstain sur le fair. Explicitement "pas un SaaS, un desk — le payeur = le capital".

**Acheteur nomme** : "le capital (toi, ou un desk)" — PAS un client SaaS, PAS de nom d'entite
(produit-D §2). Chiffres : volume combine PM ~24 Md$/mois (Pew) ; rewards maker Polymarket 20,4 M$
cumul / >5 M$/mois (guide, cite comme "claim marketing, pas alpha"). PnL 12 mois projete : 0-300k$
hors rewards SI edge, sinon "stop" explicite (auto-falsification dans le document).

**Dependances aux 5 contrats geles** : consomme `CoverageVerdict` (set trop large -> pas de quote,
regle Chow reject).

**Deja fait dans le depot** : presentation seulement (`kamae-mark.tsx`, fleet.ts, profiles.ts).
Co-moteur nomme de MONARK Verdict (avec Mokugeki, decision beta 2026-09-10).

**Propositions existantes (auteur/date)** : gap-D + produit-D (corpus MONARK SUITE, 2026-09-06,
auteur non nomme). Reprise pour Verdict dans biblio-beta-adjudication.md (sous produits/1,
2026-09-08) : "Kamae quotes le fair de payoff" apres resolution UMA. GTM/03-beachhead.md
(2026-09-10, profil "04 PM desk") le classe explicitement "niche, pas beachhead".

**Verdicts anterieurs** : aucun G7/checkpoint trouve pour Kamae seul (piece non passee en G0).

**Ce qui manque** : falsification explicite deja ecrite dans le document source lui-meme ("si hors
rewards <= 0 au jour 30 : tuer") — pas encore testee (MVP non commence) ; capital de desk non
identifie.

---

## 9. Kyokusen — act — upcoming

**Ce que c'est (fleet.ts)** : role act, ligne verbatim : "Kyokusen fits a yield curve across
maturities and gates rollovers and looped positions against it." Chambre Calibrate (avec Hikae).
INSIDE.kyokusen (upcoming) : "Nelson-Siegel yield-curve fitting across maturities."

**Ce que ca apporte / doc source** : produit-E-pendle-courbe.md (MONARK suite, 2026-09-06) — fit
Nelson-Siegel sur PT stables USD (cash-yield, points strippes), z-score implied vs courbe -> region
Hikae, roll calendar, gate de looping (commit seulement si spread > borrow + haircut). Explicitement
"pas un flagship, un module".

**Acheteur nomme** : "tresorerie qui achete du fixe (DAO, looper). PAS le YT degen" (produit-E §2)
— categorie, pas de nom. Chiffres : TVL Pendle ~1,15-1,2 Md$ (Dune/CoinMagnetic aout 2026) ; fees
30j 644 k$ (Dune live, en baisse vs 34 M$ annualises avril, cite comme "stale"). 12 mois solo
projete : 0-80k$ (1 mandat). GTM/03-beachhead.md (2026-09-10, profil "07 FI treasury") le classe
"plus petit cheque, plus tard".

**Dependances aux 5 contrats geles** : `Prediction` (residu implied-fitted) -> `CoverageVerdict`
(interval) -> `GateDecision` (commit roll/loop, abstain sur YT-points).

**Deja fait dans le depot** : presentation seulement (`kyokusen-mark.tsx`, fleet.ts, profiles.ts).
Moteur nomme de MONARK Ballast (profiles.ts, ballast -> engineKeys ["kyokusen"]).

**Propositions existantes (auteur/date)** : gap-E + produit-E (corpus MONARK SUITE, 2026-09-06,
auteur non nomme).

**Verdicts anterieurs** : aucun G7/checkpoint trouve (piece non passee en G0).

**Ce qui manque** : pas de sous-produit dedie trouve dans sous produits/1 pour documenter
specifiquement le wiring "Kyokusen -> Ballast" au-dela du produit-E lui-meme (contraste avec
alpha/beta/gamma/delta pour Softlanding/Verdict/Firebreak/Warden) — asymetrie de documentation
notee comme fait structurant (voir rapport final) ; acheteur nomme absent.

---

## 10. Koyomi — act — upcoming

**Ce que c'est (fleet.ts)** : role act, ligne verbatim : "Koyomi flattens leveraged exposure ahead
of a recurring weekend trading-window closure." Chambre Agir. INSIDE.koyomi (upcoming) :
"Weekend-gap and thin-venue risk."

**Ce que ca apporte / doc source** : produit-G-hours-gap-hip3.md (MONARK suite racine, 2026-09-06)
— avant vendredi 21:00 UTC, intervalle de gap lundi (French 1980 weekend effect) +
flatten/reduce/hold, fenetre 53h (ven 21:00 -> dim 21:59 UTC). Explicitement "ne remplace pas
l'oracle XYZ [HIP-3]". `narabi-phase/02-gap.md` et `08-alignement.md` (2026-09-15) confirment
independamment le meme partage : quand le residu Narabi `primary_closed`/`primary_closed_weekend`
se declenche, "Koyomi co-signe" le calendrier — c'est Koyomi, pas Narabi, qui porte la logique
calendaire, meme si Narabi observe et emet le residu.

**Acheteur nomme** : "Desk taker/MM sur xyz [marches HIP-3 Hyperliquid], PAS Trade XYZ [le
deployer]" (produit-G §2) — categorie, pas de nom. Chiffres : trade.xyz vol/OI 2,89 Md$/3,60 Md$
(Dune) ; HIP-3 cumul vol 557 Md$ (Dune) ; 137 marches live (HL Guide 4 sept.). 12 mois solo projete
40-180k$ si 3-8 desks. GTM/03-beachhead.md (2026-09-10, profil "05 HIP-3/RWA") le classe "niche,
calendrier, pas volume".

**Dependances aux 5 contrats geles** : `Prediction` (regression gap log) -> `CoverageVerdict`
(interval) -> `GateDecision` (flatten/reduce/hold).

**Deja fait dans le depot** : presentation seulement (`koyomi-mark.tsx`, fleet.ts). Cite dans
AUDIT-next-piece-2026-09-18.md §1 comme "Koyomi recale rang 3 : accord (loi USDC != burn Ethena)"
et §4 "Rang 3 : Koyomi avec une cle USDC (apres separation Circle/CCTP)" — SEULE piece upcoming
avec une trace de sequencement dans une decision recente (2026-09-18).

**Propositions existantes (auteur/date)** : gap-G/produit-G (corpus MONARK SUITE racine,
2026-09-06, auteur non nomme, PAS de fichier gap- separe — produit-G est seul, sans gap-G-*.md
distinct dans le dossier, contrairement a A-E). AUDIT-next-piece-2026-09-18.md (orchestrateur +
advisor-defi, 2026-09-18) le repositionne "rang 3" dans l'ordre d'enrichissement, APRES la 2e classe
Narabi. narabi-phase/06-enrichissement.md (2026-09-15) le rattache a l'adapter "hours banking"
(primary ouvert ou non).

**Verdicts anterieurs** : aucun G7/checkpoint dedie ; mention de sequencement dans
AUDIT-next-piece-2026-09-18.md (non un verdict de gate, un ordre de priorite).

**Ce qui manque** : acheteur nomme ; MVP (replay 90j gap 3 marches) non commence a notre
connaissance ; separation Circle/CCTP prealable (mentionnee comme prerequis par AUDIT §4).

---

## 11. Genkan — distribution — upcoming

**Ce que c'est (fleet.ts)** : role distribution, ligne verbatim : "Genkan is the point every
transfer, swap, or signature passes through first, returning a commit, defer, or abstain decision
along with the remaining budget." Chambre Gate (avec Hikae-decision).
INSIDE.genkan (upcoming) : "Least-privilege dual control at the treasury door."

**Ce que ca apporte / doc source** : produit-H-openclaw-skill.md (MONARK suite racine, 2026-09-06)
— MCP server / skill OpenClaw, `before_tool(tool,args,context) -> GateDecision`, wrappe
transfer/swap/sign (v1), llm.complete (v1.1). Explicitement "PAS un 6e capteur/acte, PAS un ACL
(OpenClaw l'a deja), s'execute APRES la whitelist". `narabi-phase/08-alignement.md` (2026-09-15)
confirme le meme role dans le hop Aave x MONARK : "κ -> actes Aave : commit cascade => {repay,
withdraw, close} ; interdit : ticket = prepare_".

**Acheteur nomme** : "Operateur OpenClaw (SMB NYT [New York Times, exemple cite], independant,
petit desk). PAS la DAO Aave en premier" (produit-H §2) — un exemple de presse (NYT) est cite pour
un chiffre de cout ("burn jour 1 150$", NYT 4 juin 2026), pas un acheteur confirme. Pricing : SaaS
29-99$/mois ou 1% du spend evite. **GTM/03-beachhead.md (2026-09-10) designe explicitement Genkan
("profil 00 OpenClaw operator") comme LE SEUL beachhead go-to-market tenable en solo** (5 raisons :
trialability maximale, deja compatible avec les wallets existants, distribution hackathon deja
payee — ClawPump/AnsemHack —, ACV <5k$ credible en PLG, effet cross-side vers le Sceau) ; ACV
cible "0 (hackathon) puis 2-10 k$/an desk".

**Dependances aux 5 contrats geles** : consomme/emet `GateDecision` directement (avant tout autre
acte de la flotte) ; le meme JSON que le contrat gele existant, pas un nouveau contrat.

**Deja fait dans le depot** : presentation seulement (`genkan-mark.tsx`, fleet.ts, profiles.ts —
warden -> engineKeys ["genkan"]). La distribution "skill" GENERIQUE existe deja et est LIVREE
(ADR-M006, ClawHub `monark` 1.0.3 live, registre MCP `tech.monarkgate/monark` 0.4.0) MAIS c'est une
distribution du gate `attest/gate/cascade/calibrate` dans son ensemble, PAS le wrapper
before_tool(transfer/swap/sign) specifique que produit-H propose — distinction a noter : la
"couche de distribution" existe, le produit Genkan (porte d'entree wrap-tout-outil) reste upcoming.

**Propositions existantes (auteur/date)** : produit-H (corpus MONARK SUITE racine, 2026-09-06,
auteur non nomme, pas de gap-H-*.md separe non plus). Reprise/etendue dans biblio-delta-safe.md
(sous produits/1, 2026-09-08, "Genkan-Safe") pour le wiring specifique vers un coffre DAO (Warden) —
cf. fiche Warden. Deux extensions supplementaires dans la claque (2026-09-11, auteur non nomme) :
**produit-03-skill-gate.md** (gate l'INSTALL d'un skill tiers, pas seulement son execution — le
document nomme lui-meme "Genkan (le SKU)") et **produit-05-tweet-signs.md** (gate la SOURCE/canal
d'une instruction sign/transfer, allowlist gouvernee dans le File) ; ces deux extensions
n'ajoutent aucun contrat, elles etendent le meme `before_tool -> GateDecision`.

**Verdicts anterieurs (G7/advisor)** : ADR-M006 (skills-distribution, generique, PAS specifique a
Genkan) = accepte 2026-09-11, grounding `docs/R-P4-skills-recon.md` (24 sources [lu]) +
`docs/advisor-marche-M006.md` : verdict advisor-marche cite = "whitespace technologique reel
(couverture calibree) MAIS demande de l'objet NON demontree" — pertinent par analogie pour Genkan
lui-meme (meme risque de demande non demontree).

**Ce qui manque** : acheteur nomme confirme (NYT est un exemple de cout, pas un prospect) ;
implementation before_tool specifique (MVP: MCP stdio 1 tool swap mock) non trouvee dans packages/.

---

## 12. MONARK Firebreak — upcoming — segment "Vault LP"

**Ce que c'est (fleet.ts)** : `key: "firebreak"`, fn verbatim : "Ride out an auto-deleveraging
cascade on a perp venue rather than be caught in it." Wiring : sensor "Ukemi reads the
deleveraging queue", gate "Hikae and the MONARK budget", act "de-risk before it hits".

**Ce que ca apporte / doc source** : biblio-gamma-adl.md (sous produits/1, 2026-09-08, "gamma =
Ukemi-ADL") — objet = le GAGNANT d'un perp se fait fermer par une file (PnL x levier) quand
liquidation + fonds d'assurance ne suffisent plus ; `Prediction` = rang/notionnel ADL-able ;
`GateDecision` = reduce levier ou take_profit. Papier-pivot : Chitra arXiv:2512.01112 (10 oct. 2025 :
2,1 Md$ fermes/12min, overshoot ~28x, ~653,6 M$ positions fermees en trop). Analogie CCP :
Variation Margin Gains Haircutting (VMGH). Meme papier et meme episode repris independamment par
la claque/produit-02-1010-replay.md (2026-09-11) comme demo/replay hop-par-hop.

**Acheteur nomme** : profiles.ts profil 1 = "Vault LP" (categorie, pas un nom d'entite).

**Dependances aux 5 contrats geles** : consomme `CoverageVerdict`/`GateDecision` via Ukemi ; PAS de
contrat gele propre (le rang ADL n'est pas un contrat forme).

**Deja fait dans le depot** : presentation seulement (fleet.ts, fleet-presentation.ts INSIDE.firebreak
= "Ukemi's liquidation-cascade engine: a network clearing fixed point and a conformal interval,
conformed by the gate", profiles.ts). Segment card "Vault LP" sur la page d'accueil (upcoming-panel).

**Propositions existantes (auteur/date)** : biblio-gamma-adl.md (sous produits/1, 2026-09-08,
auteur non nomme) = biblio de construction complete (Chitra, Duffie/Cont CCP waterfall, Garcia
Seuma cascade microstructure, dataset ConejoCapital HyperMultiAssetedADL).

**Verdicts anterieurs** : aucun G7/checkpoint dedie a Firebreak trouve. Note de coherence avec
Ukemi : le rejet Ukemi-Aave (AUDIT-next-piece-2026-09-18.md) NE PORTE PAS sur l'ADL perp (c'est une
"file" HL/Binance distincte du book de liquidation Aave) — Firebreak n'est pas directement touche
par ce rejet, mais herite de la meme exigence structurelle (acheteur nomme avant tout G0 Ukemi,
G7-VERDICT-UKEMI 2026-09-03, [2nd]).

**Ce qui manque** : acheteur nomme ; le "faux ami" explicitement signale (biblio-gamma-adl.md §6) :
ne pas confondre avec Eisenberg-Noe (paiements bilateraux) ni Gatto SSRN (lending Aave, c'est alpha
= Softlanding).

---

## 13. MONARK Warden — upcoming — segment "DAO / agent"

**Ce que c'est (fleet.ts)** : `key: "warden"`, fn verbatim : "Put a least-privilege gate on a
treasury a DAO or another agent controls." Wiring : sensor "a spend or a signature", gate GATE,
act "commit, defer, or abstain".

**Ce que ca apporte / doc source** : biblio-delta-safe.md (sous produits/1, 2026-09-08, "delta =
Genkan-Safe") — meme JSON `before_tool -> GateDecision` que produit-H (Genkan/OpenClaw), transport
different : Safe Allowance Module (coffre DAO) au lieu de MCP. "L'Allowance Module Safe est un
point (10 USDC/jour) ; B_t + GateDecision s'ajoutent SOUS le cap." Citation explicite : "31.
produit-H-openclaw-skill.md — delta = le meme endpoint, autre transport (Safe module vs MCP)."

**Acheteur nomme** : profiles.ts profil 2 = "DAO / agent" (categorie). Le document delta cite Safe
docs "AI agent with a spending limit" et Coinbase Agentic Wallets (11 fev. 2026) comme CONCURRENTS
(cap aveugle), pas comme acheteurs.

**Dependances aux 5 contrats geles** : consomme `GateDecision` (le meme contrat que Genkan) sous
un cap Safe Allowance additionnel.

**Deja fait dans le depot** : presentation seulement (fleet.ts, fleet-presentation.ts
INSIDE.warden = "Genkan's least-privilege dual control at the treasury door", profiles.ts
warden -> engineKeys ["genkan"]).

**Propositions existantes (auteur/date)** : biblio-delta-safe.md (sous produits/1, 2026-09-08,
auteur non nomme). Biblio commune avec produit-H (ne duplique pas : "delta n'ajoute aucun papier
d'acte, il impose que gamma/beta/alpha parlent deja ce JSON").

**Verdicts anterieurs** : aucun G7/checkpoint dedie trouve.

**Ce qui manque** : acheteur DAO nomme ; le document lui-meme liste un "faux ami" a eviter :
"un 5e contrat SafeDecision — casse l'Anneau. C'est GateDecision" — i.e. le risque de dupliquer un
contrat gele est explicitement anticipe et refuse par le document source.

---

## 14. MONARK Softlanding — upcoming — segment "Leverage"

**Ce que c'est (fleet.ts)** : `key: "softlanding"`, fn verbatim : "Read the liquidation risk on a
leveraged position and ease the exposure down before it clears." Wiring : sensor "Ukemi reads the
position", gate GATE, act "ease the exposure down".

**Ce que ca apporte / doc source** : biblio-alpha-v4.md (sous produits/1, 2026-09-08, "alpha =
Ukemi-V4") — objet = la perte a la liquidation L(H) = b(H).Q_repay(H,H*_spoke) N'EST PLUS
"bonus x 50% debt" (V3) mais Target HF PAR SPOKE + bonus DUTCH (Aave V4). Table ARFC citee : Spoke
Main Target HF 1.2400 (bonus 90%), Lido 1.0137 (bonus 100%), etc. Papier-pivot : Qin et al. 2021
(arXiv:2106.06389, over-liquidation, close factor 50%) + Euler whitepaper (dynamic close factor,
ancetre le plus proche de V4).

**Acheteur nomme** : profiles.ts profil 3 = "Leverage" (categorie). Aucun nom d'entite dans
biblio-alpha-v4.md.

**Dependances aux 5 contrats geles** : `Prediction` = L-hat(D) (perte estimee) sous le Spoke
courant -> `CoverageVerdict`/`GateDecision` (flatten avant que b(H) accelere).

**Deja fait dans le depot** : presentation seulement (fleet.ts, fleet-presentation.ts
INSIDE.softlanding = meme texte que Firebreak "Ukemi's liquidation-cascade engine...", profiles.ts).

**Propositions existantes (auteur/date)** : biblio-alpha-v4.md (sous produits/1, 2026-09-08, auteur
non nomme). Distingue explicitement de V3 (Gatto 2026 SSRN 7157638, "a ne pas recopier") et du
Dutch temporel Maker MIP45 ("V4 = Dutch SUR le HF, pas sur le temps").

**Verdicts anterieurs** : aucun G7/checkpoint dedie a Softlanding. Residu signale par le document :
`hub_spoke_decouple` ("phantom solvency", Chaos Labs 2 fev. 2026, "pas un SKU, trop petit").

**Ce qui manque** : acheteur nomme ; le document liste "residus" `spoke_target_unobserved`,
`bonus_path_dutch`, `dynamic_config_post_loan` comme non resolus.

---

## 15. MONARK Verdict — upcoming — segment "Betting desk"

**Ce que c'est (fleet.ts)** : `key: "verdict"`, fn verbatim (generique par decision C-1, aucun
agent moteur nomme dans le registre gele) : "Turn a raw event call into a coverage-controlled,
settled decision." Wiring : sensor "an attested event", gate GATE, act "settle the call". NOTE
C-1 (fleet.ts commentaire) : "MONARK Verdict names NO engine agent — its sensor and act stay
generic" dans le REGISTRE ; mais fleet-presentation.ts (panneau Mod #1, decision beta 2026-09-10)
NOMME l'engine "Mokugeki x Kamae" — deux niveaux de granularite coexistent sciemment (registre
gele generique, panneau explicite).

**Ce que ca apporte / doc source** : biblio-beta-adjudication.md (sous produits/1, 2026-09-08,
"beta = event vs UMA") — un contrat predictif paie ce que l'ORACLE certifie, pas l'evenement
physique ; dans la fenetre post-evenement/pre-vote, le mid = P(adjudication). Papier-pivot :
Economics Letters 268 (2026) 113176 ("Do prediction markets price events or adjudication?", 233
marches disputes, vote renverse l'audit 12,4%/3,4%). Analogie exacte : ISDA Determinations
Committee / CDS ("le contrat paie le comite, pas le defaut economique"). Episode repris
integralement par la claque/produit-04-event-or-vote.md (2026-09-11) : Strategy/MicroStrategy 8-K
1er juin 2026, marche "sold by May 31" tranche No par vote UMA malgre une vente documentee.

**Acheteur nomme** : profiles.ts profil 4 = "Betting desk" (categorie). GTM/07-ventes.md
(2026-09-10) ne le retient PAS comme lighthouse candidat (seuls Kaihi/Kessai le sont) et
GTM/03-beachhead.md le classe "profil 04, niche, pas beachhead".

**Dependances aux 5 contrats geles** : deux `AttestedDoc` (8-K/regle listee + etat UMA, proposition
non formalisee en schema gele) -> `Prediction` set {uma_yes, uma_no, too_early, unknown} ->
`CoverageVerdict` (set, pas p_overturn) -> `GateDecision` (adder/reduce/silence).

**Deja fait dans le depot** : presentation seulement (fleet.ts avec commentaire C-1 explicite,
fleet-presentation.ts INSIDE.verdict = "Mokugeki attests the event; Kamae quotes from inventory
(Avellaneda-Stoikov)", profiles.ts verdict -> engineKeys ["mokugeki","kamae"]).

**Propositions existantes (auteur/date)** : biblio-beta-adjudication.md (sous produits/1,
2026-09-08, auteur non nomme). Episodes de replay nommes : Strategy (MSTR) 8-K 1er juin 2026 ($60M
marche), Zelenskyy-suit juil. 2025 (~200-237M$), Ukraine minerals mars 2025 (~7M$, un holder ~25%
du vote UMA). Repris par la claque/produit-04-event-or-vote.md (2026-09-11, meme episode Strategy).

**Verdicts anterieurs (G7/advisor)** : aucun G7/checkpoint dedie a Verdict lui-meme ; la decision de
NOMMER l'engine au niveau presentation (beta, 2026-09-10) mais PAS au niveau registre gele (C-1)
est elle-meme une decision produit tracee dans fleet.ts/fleet-presentation.ts (motif : "event
resolution is undecided" au niveau contrat).

**Ce qui manque** : acheteur nomme ; schema `AttestedDoc` non gele ; "faux ami" signale par le
document : lire Wolfers-Zitzewitz comme "le prix EST P(evenement)" est l'hypothese que Verdict
refute, pas un theoreme.

---

## 16. MONARK Ballast — upcoming — segment "Rate treasury"

**Ce que c'est (fleet.ts)** : `key: "ballast"`, fn verbatim : "Hold a rate treasury steady as the
yield curve moves." Wiring : sensor "the rate surface", gate GATE, act "hedge or rebalance".

**Ce que ca apporte / doc source** : AUCUN sous-produit grec dedie trouve dans sous produits/1
(contrairement a alpha/beta/gamma/delta pour les 4 autres produits) — le document source le plus
proche reste produit-E-pendle-courbe.md (Kyokusen, MONARK suite, 2026-09-06), qui couvre deja le
cas d'usage tresorerie ("Payeur : tresorerie qui achete du fixe") sans wiring produit distinct
explicite. profiles.ts confirme ballast -> engineKeys ["kyokusen"] (source citee : "Mod #1
Ballast -> Kyokusen").

**Acheteur nomme** : profiles.ts profil 5 = "Rate treasury" (categorie) ; produit-E §2 : "tresorerie
qui achete du fixe (DAO, looper). PAS le YT degen."

**Dependances aux 5 contrats geles** : herite du wiring Kyokusen : `Prediction` (residu courbe) ->
`CoverageVerdict` (interval) -> `GateDecision` (hedge/rebalance).

**Deja fait dans le depot** : presentation seulement (fleet.ts, fleet-presentation.ts
INSIDE.ballast = "Kyokusen's Nelson-Siegel yield-curve fitting across maturities", profiles.ts).

**Propositions existantes (auteur/date)** : aucune proposition DEDIEE a "Ballast" par nom trouvee
dans le corpus Downloads ; le produit herite integralement de produit-E-pendle-courbe.md (Kyokusen).
C'est un ecart de couverture documentaire par rapport aux 4 autres produits, note comme fait
structurant (voir rapport final).

**Verdicts anterieurs** : aucun G7/checkpoint trouve.

**Ce qui manque** : un document de wiring produit dedie (equivalent grec, "epsilon" absent) ; un
acheteur nomme ; MVP non commence a notre connaissance.

---

## Note transversale 1 — les 3 "produits-visage" (hors des 16, contexte croise)

Attestation / Hallmark / Threshold (`fleet-presentation.ts` INSIDE keys "attestation"/"hallmark"/
"threshold") sont explicitement HORS du registre `fleet.ts` (ni FLEET_AGENTS ni PRODUCTS) mais SONT
dans `fleet-presentation.ts` et `profiles.ts` (profils 6-8). Documentes par MONARK SUITE/produit
visage/ (Dossier=Attestation, Sceau=Hallmark, Declencheur=Threshold — mapping engine confirme par
profiles.ts commentaire : "Attestation -> shogen / Hallmark -> hikae / Threshold -> hikae", mapping
qu'une "decision produit a rejete" le 2026-09-09 au niveau engineKeys (vides depuis) tout en gardant
le nommage). Non traites en fiche ici (mission : n'invente aucune piece) ; detailles en
PROPOSITIONS.md.

## Note transversale 2 — GTM (hors fleet) : sequencement et ACV cibles appliques aux pieces

`GTM monark version 1\GTM\` (2026-09-10, auteur non nomme) ne propose aucune piece, mais
sequence et chiffre (en cibles internes, jamais des contrats signes) les 16 pieces + le
produit-visage File/Sceau via un schema de "profils numerotes" (00 a 07) repris ensuite par
`la claque` (2026-09-11). Recapitulatif ACV cible (GTM/03-beachhead.md, 07-ventes.md) :
Genkan (profil 00, BEACHHEAD) 0 -> 2-10 k$/an ; Kessai (profil 02, lighthouse candidat) 50-180 k$ ;
Kaihi (profil 01, lighthouse candidat alternatif) 80-250 k$ (3-8 vaults) + Sceau 2-8 k$/mois ;
Ukemi (profil 03) "desk risk", pas de chiffre ; Narabi (profil 06) "wrapping treasury", pas de
chiffre ; Kamae (profil 04, niche) capital propre ; Koyomi (profil 05, niche) "flatten vendredi" ;
Kyokusen (profil 07, plus petit cheque) "module" ; File (produit-visage Dossier) 180-540 k$
(3 fonds + 2 CASP). Regle explicite du GTM : un seul lighthouse a la fois (02 XOR 01, jamais les
deux), et zero pipeline File avant qu'un File reel n'existe sur un hop live. Ces chiffres sont des
CIBLES de planification interne (methode Runwayteam/a16z citee), pas des revenus mesures ni des
contrats signes — a ne jamais confondre avec les chiffres de marche [2nd] cites dans les fiches
produit elles-memes.
