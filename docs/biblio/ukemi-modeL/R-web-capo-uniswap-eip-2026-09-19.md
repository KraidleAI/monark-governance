MODELE RESOLU: claude-sonnet-5

# R — Web : CAPO Aave, Uniswap token integration, Solana Token-2022, ERC-8056, Aave v3.3 deficit, Chainlink SVR

- **Chercheur** : `claude-sonnet-5`, effort max, 2026-09-19 (règle roster mainteneur ; doc 03).
- **Mission** : recherche web ciblée (6 cibles) pour fonder/casser les chiffres de seconde main déjà
  présents dans `F:\Monark\docs\etude-suite-2026-09-18\ukemi-eisenberg-noe-audit.md` et
  `produit-ukemi-loop-clearing.md` sur l'incident CAPO Aave mars 2026 (~27 M$, wstETH, remboursement
  512,19 ETH), et sur des mécanismes de tokens à rebasement / multiplicateur pertinents pour Ukemi
  (Uniswap, Solana Token-2022, ERC-8056 Robinhood, Aave v3.3 bad debt event, Chainlink SVR).
- **Discipline** : sources primaires en priorité (dépôts GitHub, docs officielles, forums de gouvernance,
  EIP) ; URL exacte + date ; [lu] seulement après lecture directe, sinon [abs]/[2nd] ; sauvegarde locale
  (HTML→texte ou PDF→`pdftotext -layout`) + sha256 dans `SOURCES-sha256.txt` ; jamais l'advisor intégré
  pendant la collecte (risque de filtre de régurgitation, règle mainteneur 2026-09-05) ; verbatim ≤ 25 mots.
- **Contexte interne préexistant (secondaire, à fonder ici)** : `ukemi-eisenberg-noe-audit.md` L58/114/126/141
  cite « Chaos Labs part d'Aave avril 2026 en refusant 5 M$ », « incident CAPO 26,9 M$ de liquidations
  indues mars 2026 », « oracle 2,85 % trop bas », « 34 comptes wstETH » — **ces chiffres sont [2nd]**
  jusqu'à confirmation primaire ci-dessous.
- **Revue post-avis-advisor (2026-09-19, même passe)** : un premier jet a été relu par l'advisor avant
  clôture. Quatre corrections factuelles ont été appliquées à cette version : (1) §1.1 relit
  intégralement les 18 posts du thread post-mortem (le premier jet n'en avait lu que 5, et affirmait à
  tort avoir « effectivement lu » les 18 pour conclure à l'absence de LlamaRisk — LlamaRisk **est**
  présent, post #18, maintenant [lu]) ; (2) §3.2 corrige une fausse dégradation de confiance sur le
  reverse split xStocks (le grep l'avait bien confirmé, contrairement à ce que le premier jet disait) ;
  (3) §6.3 corrige une affirmation fausse sur la répartition de frais SVR (65/35 primaire et 58,5/31,5
  secondaire sont liés par un facteur ×0,9 exact, pas un désaccord arithmétique brut) ; (4) ajout de
  plusieurs NON TROUVÉ explicites que le premier jet avait omis (bloc de l'incident CAPO, concept
  « rights » dans ERC-8056, la valeur exacte « 26,9 M$ » de la mission introuvable dans le primaire).

## 0. Gate 0

Modèle résolu déclaré ligne 1 : `claude-sonnet-5`. Préfixe conforme à l'attendu (`claude-sonnet-5`).
Poursuite autorisée.

## Cible 1 — Post-mortem primaire CAPO (Aave, mars 2026, wstETH)

### 1.1 Post-mortem — Chaos Labs, forum gouvernance Aave (thread intégral relu : 18/18 posts)
- **Identite** : « Post-Mortem: Exchange Rate Misallignment on wstETH Core and Prime Instances ».
  Auteur du post #1 : ChaosLabs (compte forum officiel). Categorie : Risk. Thread id 24269.
- **URL** : https://governance.aave.com/t/post-mortem-exchange-rate-misallignment-on-wsteth-core-and-prime-instances/24269
- **Date** : created_at du post #1 = 2026-03-10T19:50:36.487Z. Dernier post substantiel (#18,
  LlamaRisk) = 2026-03-16T20:14:57.671Z. 18 posts au total dans le post_stream API.
- **Classe** : P1 (post officiel de l'equipe de gestion de risque mandatee + reponses d'autres service
  providers officiels Aave — LlamaRisk, BGD Labs — sur le forum de gouvernance officiel).
- **Niveau** : **[lu] — les 18 posts ont maintenant ete lus integralement** (correction : une premiere
  passe de cette meme mission n'avait lu que les posts #1-#5, ~220 lignes sur 681, et affirmait a tort
  avoir « effectivement lu » les 18 posts pour conclure a l'absence de reponse LlamaRisk — cette
  affirmation etait fausse ; LlamaRisk EST present, post #18, voir plus bas). JSON brut Discourse
  recupere via `<thread>.json`, HTML `cooked` nettoye en texte par script Python local
  (`_txt/web/extract_discourse.py`). Sauvegarde : `_txt/web/aave-capo-postmortem-24269.json` (brut) +
  `.txt` (nettoye), sha256 dans `SOURCES-sha256.txt`.

**Mecanisme exact (CAPO = Correlated Asset Price Oracle)** — trois parametres on-chain :
`snapshotRatio` (taux de change de reference), `snapshotTimestamp` (horodatage associe),
`maxYearlyRatioGrowthPercent` (taux de croissance annualise maximal permis). Le plafond de taux
est calcule depuis `snapshotRatio` + croissance permise entre `snapshotTimestamp` et le bloc courant.

Verbatim (mecanisme, post #1, section « What happened ») : « the timestamp assumed a 7-day-old
anchor, but the ratio was not actually updated to the 7-day-old exchange rate » (22 mots).

**Root cause approfondie (post #11, ChaosLabs, reponse detaillee du 2026-03-12T16:17:59Z)** — fait
majeur absent du premier jet : le `snapshotRatio` **« had not been updated for over a year »**
(stale depuis plus d'un an) avant l'incident. C'est cette staleness prolongee qui a produit un ecart
cible de **6,1 %** en un seul pas (~1.1572 -> ~1.2282), soit le double de la borne autorisee (3 %/3
jours) — verbatim PrudentiaLabs post #6, confirme par ChaosLabs post #11 : « A 6.1% required move is
therefore not something that would emerge in the course of normal upkeep; it was a consequence of
prolonged staleness. » ChaosLabs y affirme aussi que **c'etait la toute premiere mise a jour poussee
par le « CAPO Risk Agent »** (nuance importante confirmee independamment par LlamaRisk post #18 : «
As this was the first update pushed by the CAPO Risk Agent »), ce qui distingue « CAPO » le cadre/
mecanisme general (« operated reliably for approximately two years », dixit ChaosLabs) de ce « CAPO
Risk Agent » specifique, automatise, deploye recemment et dont c'etait le coup d'essai.

**Chiffres exacts copies** (post #1, sections « What happened » / « Impact », complete par posts
ulterieurs) :
- `snapshotRatio` vise off-chain : ~1.2282 ; contrainte on-chain : +3 %/3 jours ; valeur precedente
  sur le contrat : ~1.1572 ; valeur atteignable en une mise a jour : ~1.1919.
- `snapshotTimestamp` : 1772535647 (horodatage Unix du point de reference 7 jours plus tot — **ce
  n'est PAS le bloc/horodatage de l'incident lui-meme**, voir NON TROUVE plus bas).
- Taux de change plafond calcule resultant : ~1.1939.
- Ecart/deviation : « approximately 2.85% » (texte) puis « around 2.855% » (meme post #1) — les deux
  coexistent dans le MEME document primaire, copie tel quel, non arbitre.
- Health factor affecte : positions « lower than 1.0288 ».
- Volume liquide : « roughly 10938 wstETH » en E-Mode, 34 comptes.
- ETH capture par les liquidateurs (section Impact, post #1) : ~116 ETH bonus + ~382 ETH profit de
  deviation = 498 ETH par addition directe — **coherent avec la valeur explicite « up to ~498 ETH »
  citee independamment par PrudentiaLabs (post #6)**, mais le meme post #1 arrondit ailleurs a
  « approximately 512 ETH » en resume — deux formulations proches, non identiques, du meme document.
- Recupere via BuilderNet refunds : 141 ETH (Summary) vs 141.5 ETH (« Recovery and compensation »,
  meme post) — deux valeurs differentes dans le MEME post, copiees telles quelles.
- Plafond de compensation ad-hoc DAO annonce : « no more than 358 ETH ».
- Aucune dette non recouvrable : « no bad debt accrued by the protocol » (repete, un commentateur
  note « has been mentioned 3 times »).
- **Montant total liquide — QUATRE valeurs primaires distinctes, aucune n'egale les « 26,9 M$ » de la
  mission** : « resulting in $26M in liquidation volume » (ChaosLabs, post #1, Closing) ; « roughly
  $26.6 million in liquidation volume » (LlamaRisk, post #18, Executive Summary — **nouveau, absent
  du premier jet**) ; « $27M in erroneous liquidations » (ApuMallku, post #5, commentaire du meme
  thread) ; « roughly $26M–$27M » (_LP17, post #10, formule en fourchette). Aucune de ces quatre
  valeurs primaires ne correspond litteralement a « 26,9 M$ » ni a « 27,78 M$ » (chiffre de presse,
  §1.3) — **la valeur exacte 26,9 M$ citee par le document interne Ukemi n'a ete retrouvee dans AUCUNE
  source primaire lue cette passe**, a traiter comme une valeur a part, potentiellement un arrondi ou
  un recalcul propre a l'auteur du document interne, non retrace ici.

**Debat gouvernance/accountability (posts #2, #5, #6, #8, #9, #10, #11, #12, #13, #17 — nouveau,
absent du premier jet)** : plusieurs commentateurs (PrudentiaLabs post #6, en particulier) posent la
question directe de savoir si la contrainte on-chain a l'origine de l'incident (+3 %/3 jours) a
elle-meme ete introduite par un **AIP anterieur de fevrier 2025 redige par Chaos Labs**, ce qui
questionnerait la neutralite du recit « incident de configuration » plutot que « faille de design » ;
ChaosLabs (post #11) repond que la borne de 3 % « was analytically derived as a system-wide parameter
and not chosen ad hoc ». Marc Zeller (compte `MarcZeller`, figure fondatrice Aave/ACI, post #9)
prend position pour une compensation rapide sans rechercher la responsabilite financiere de Chaos
Labs : « these implementations were greenlighted by the DAO via AIPs ». Stani (compte `stani`, figure
fondatrice Aave, post #13) defend le bilan historique des service providers. eboado (BGD Labs, post
#12) va dans le meme sens. _LP17 (post #10) et AlanWestbrook (post #8) demandent au contraire des
comptes et s'interrogent sur le maintien de Chaos Labs comme risk provider (budget cite : « around
$3M per year »).

**LlamaRisk — post-mortem independant (post #18, [lu], 2026-03-16T20:14:57.671Z) — nouveau, absent du
premier jet** : LlamaRisk publie sa propre analyse (« we have completed our own independent
post-mortem ») mais **« defer to @ChaosLabs' published report to avoid redundancy »** sur les faits
bruts ; l'essentiel de l'apport LlamaRisk est normatif/gouvernance : (a) confirme le meme mecanisme
racine ; (b) note que le mode de defaillance etait « deterministic and reproducible », detectable par
une simple simulation pre-deploiement (verification `isCapped()` sur un fork mainnet) ; (c) souligne
qu'« it is currently not possible for LlamaRisk or any other party to independently verify the
offchain code executed » par le Risk Agent ; (d) mentionne en passant, comme contexte de gouvernance
deja connu au 16 mars 2026, les **« @ACI and @bgdlabs departures »** — confirmation PRIMAIRE (lue
directement dans ce post officiel) que BGD Labs et ACI avaient deja quitte ou etaient en train de
quitter leurs roles de service provider Aave a cette date ; (e) recommande un role de co-signature
LlamaRisk sur `RiskSteward`, des revues de mode de defaillance pre-deploiement, et un audit des
agents de risque en production.

**Allegations tierces non verifiees (posts #14 et #16, `abdulwahed`, signe « Huntkits, Independent
Security Researcher ») — a traiter avec prudence** : un chercheur independant publie une « analyse
forensique » chiffree pretendant couvrir 623 liquidations Aave V3 (blocs 18M-21M), 354 victimes
uniques, 460,27 ETH de pots-de-vin documentes vers des builders, une concentration de 70 % du volume
sur 5 liquidateurs, 67 % de transactions en mempool prive, et un exemple de « cascade C-045 » (5 aout
2024, 35 victimes). **Ces chiffres sont [lu] au sens ou j'ai lu directement le post sur le forum
officiel, mais ce sont des ASSERTIONS D'UN TIERS non verifiees par moi (aucun recoupement Etherscan
fait cette passe), ni endossees par Aave/Chaos Labs/BGD dans le thread** — a traiter comme une
allegation sourcee mais non confirmee, pas comme un fait etabli. Le meme post confond au passage
« 141,5 ETH » (montant RECUPERE via BuilderNet, cf. plus haut) avec le total de « wrongful
liquidations », ce qui est une lecture erronee des chiffres du post-mortem par ce commentateur —
signale ici pour eviter de propager cette confusion.

**NON TROUVE (explicite, demande par la mission)** : le **bloc Ethereum exact de l'incident** n'a
ete trouve dans aucun des 18 posts lus. Les seules ancres temporelles disponibles sont (a)
`snapshotTimestamp = 1772535647`, qui est l'horodatage Unix du point de reference **7 jours
anterieur** utilise par le calcul CAPO, PAS le bloc de l'incident lui-meme ; et (b) l'horodatage du
post #1 (`2026-03-10T19:50:36.487Z`), qui est l'heure de PUBLICATION du post-mortem, posterieure a
l'incident. Aucun numero de bloc Ethereum n'est cite verbatim dans le thread. Procurement possible :
lire l'Etherscan/explorateur des transactions `LiquidationCall` sur les contrats Aave v3 Core/Prime
wstETH autour du 10 mars 2026 pour identifier le(s) bloc(s) exact(s) — non fait cette passe (hors
outillage disponible sans cle API, cf. §6.4).

**Mesures preventives proposees** (post #11) : escalade Risk Steward pour scenarios de convergence
contrainte ; logique de construction du snapshot garantissant l'alignement ratio/timestamp sous mise
a jour contrainte ; verifications de bornes off-chain ; garde-fous on-chain additionnels « in
discussion with BGD Labs ».

### 1.2 Proposition de remboursement — TokenLogic, Direct-to-AIP
- **Identite** : « [Direct To AIP] wstETH CAPO Oracle Incident User Reimbursement ». Auteur :
  TokenLogic (service provider Aave DAO). Categorie : Governance. Thread id 24275, post #1 id=62330.
- **URL** : https://governance.aave.com/t/direct-to-aip-wsteth-capo-oracle-incident-user-reimbursement/24275
- **Date** : created_at post #1 = 2026-03-11T20:27:19.911Z. Thread actif du 2026-03-11 au 2026-04-01,
  ferme automatiquement le 2026-05-01 (post #9, message systeme).
- **Classe** : P1 (proposition de gouvernance officielle, ARFC/Direct-to-AIP, executee on-chain).
- **Niveau** : [lu] — 9 posts lus integralement (fichier complet, 151 lignes, pas de troncature).
  Sauvegarde : `_txt/web/aave-capo-reimbursement-24275.json`/`.txt`, sha256 archive.

**Montant exact — confirme le chiffre nomme par la mission.** Section Summary, verbatim : « The
total refund amounts to 512.19 ETH, with a net cost to the DAO of 357.56 ETH after recoveries »
(20 mots). **Le chiffre 512,19 ETH de la mission est donc confirme en primaire [lu]** (post #1,
section Summary, 2026-03-11).

**Contradiction interne au MEME document (P1)**, copiee telle quelle, non tranchee : le tableau
« Loss Breakdown » du meme post #1 indique Total loss = 513.19 (Oracle profit 382.76 + Liquidation
bonus 129.72 + Goodwill allowance 1 = 513.48 par addition directe — ni 512.19 ni 513.19 exactement),
Net cost to the DAO = 358.56 dans le tableau (vs 357.56 dans le texte), et la section
« Specification » demande une allocation de « Amount: 513.19 ETH ». Quatre valeurs voisines mais
distinctes cohabitent dans un seul document primaire : 512.19 / 513.19 / 513.48 (calcule par moi par
simple addition) pour le total ; 357.56 / 358.56 pour le net DAO. Non resolu.

**Decomposition des pertes** (tableau « Loss Breakdown ») : Oracle profit 382.76 ETH ; Liquidation
bonus 129.72 ETH ; Goodwill allowance 1 ETH ; Recovered from Titan Builder (141.60) ETH ; Recovered
liquidation fees (13.32) ETH.

**Specification technique** (verbatim) : Asset WETH `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`,
Spender AFC `0x22740deBa78d5a0c24C58C740e3715ec29de1bFa`, methode `approve()` sur l'Aave Ethereum
Collector.

**Suivi post-vote** (posts ulterieurs, [lu]) :
- Post #3 (2026-03-12, TokenLogic) : recuperation additionnelle de 41.62 WETH negociee par @bgdlabs
  aupres d'un « searcher », ramenant le cout net DAO a 316.94 WETH.
- Post #4/#5 (Frida, 2026-03-13 et 2026-03-18) : contestation procedurale sur le choix Direct-to-AIP.
  Verbatim post #5 : « Direct-to-AIP with zero explanation is governance bypass » (7 mots).
- Post #6-#8 (skoreless, MconnectDAO, 2026-03-26 au 2026-04-01) : absence de reconciliation publique
  par utilisateur apres execution ; un paiement signale « ~20 weth short » — non resolu dans le
  thread capture (post #9 = fermeture automatique systeme, 2026-05-01, sans reponse).

**Statut final observe** : AIP execute on-chain, fonds distribues, mais aucune reconciliation par
utilisateur publiee dans le thread lu — fait du dossier lui-meme, pas une lacune de ma collecte.

### 1.3 Presse secondaire (P2/P3, [2nd] — pour comparaison, jamais terminal)
Non re-fetchees verbatim (le primaire prime et suffit) ; listees pour tracabilite : CoinDesk
(« $27 million liquidations », 2026-03-10), The Block (« $26 million »), crypto-economy.com,
dev.to (« $27.78M », chiffre derive de 10938 wstETH x prix spot, non une donnee du post-mortem),
CCN. Tous [2nd] : la presse cite 26-27,78 M$, aucune ne cite « 26,9 M$ ».

### 1.4 Contexte hors-perimetre rencontre en lisant le primaire — depart Chaos Labs (avril 2026)
Le premier jet de cette archive citait en tete (ligne 16) le chiffre interne « Chaos Labs part
d'Aave avril 2026 en refusant 5 M$ » comme [2nd] a confirmer, sans jamais le traiter — erreur
d'omission signalee par la relecture. **Investigation faite cette revision (une recherche, hors
perimetre strict des 6 cibles nommees par la mission, donc volontairement limitee)** : recoupement
convergent (~10 medias : CoinDesk, The Block, Unchained, Yahoo Finance/finance.yahoo.com, The
Defiant, bex.co, cryptonews.com, coincentral.com, crypto-economy.com — **[2nd], aucun fetch
verbatim de ces pages cette passe**) confirme que Chaos Labs a annonce le 6 avril 2026 la fin de son
engagement de risk manager Aave, refusant un paquet de retention de 5 M$ propose par Aave Labs
(budget 2025 cite a 3 M$, besoin estime a 8 M$ pour couvrir V3+V4), invoquant un desaccord de fond
sur la gestion du risque a l'approche de v4. La presse situe ce depart comme le TROISIEME apres ceux
de BGD Labs (1er avril 2026) et de l'Aave-Chan Initiative/ACI (debut mars 2026) — **le depart
BGD/ACI est corrobore en PRIMAIRE [lu]** par la mention de LlamaRisk au §1.1 (post #18, 16 mars
2026, « @ACI and @bgdlabs departures »), mais je n'ai trouve **aucun post governance.aave.com
primaire** annoncant specifiquement le depart de Chaos Labs (une recherche `site:governance.aave.com`
ciblee n'a retourne que des articles de presse) — reste **[2nd]**, procurement possible si ce point
devient central pour Ukemi : chercher directement sur governance.aave.com un thread de mars-avril
2026 poste par ChaosLabs annoncant sa sortie.

**Bilan cible 1** : les DEUX chiffres nommes par la mission sont CONFIRMES en primaire [lu] : la
fourchette ~26-27 M$ de liquidations est confirmee (4 formulations primaires distinctes : $26M /
$26.6M / $27M / « $26M–$27M », voir §1.1 — mais PAS le chiffre exact « 26,9 M$ » du document
interne, introuvable) et 512,19 ETH de remboursement propose (TokenLogic ARFC, section Summary). Le
mecanisme CAPO est confirme en detail primaire, y compris la nuance staleness > 1 an / premiere mise
a jour du Risk Agent, absente du premier jet. AUCUN bad debt. 34 comptes, wstETH, Ethereum Core +
Prime — confirmes primaire. NON TROUVE : bloc Ethereum exact de l'incident.

## Cible 2 — Uniswap « Token Integration Issues » (rebasing / fee-on-transfer, v3 vs v4)

### 2.1 Page officielle v3 « Token Integration Issues » (= « Unsupported Tokens »)
- **Identite** : « Token Integration Issues » (titre affiche) = slug
  `/docs/protocols/v3/concepts/unsupported-tokens`.
- **URL demandee par la mission** : https://docs.uniswap.org/concepts/protocol/integration-issues
  **redirige (301)** vers https://developers.uniswap.org/concepts/protocol/integration-issues, qui
  redirige (303) vers l'URL finale
  https://developers.uniswap.org/docs/protocols/v3/concepts/unsupported-tokens . Migration de
  domaine docs.uniswap.org -> developers.uniswap.org constatee (reorganisation, pas une collision de
  contenu).
- **Classe** : P1 (documentation officielle du protocole, developers.uniswap.org).
- **Niveau** : [lu] — double confirmation : (a) page HTML rendue recuperee par curl
  (`_txt/web/uniswap-integration-issues.html`, 283087 octets, `<title>Token Integration Issues |
  Uniswap Developers</title>` confirme) ; (b) version markdown brute via l'endpoint LLM-friendly du
  site (`_txt/web/uniswap-unsupported-tokens.mdx`, 737 octets, texte integral, page courte,
  entierement lue).
- **Verbatim exact (integralite du corps, page tres courte)** :
  - Chapo : « Fee-on-transfer and rebasing tokens will not function correctly on v3. » (10 mots)
  - Section « Fee-on-Transfer Tokens » (verbatim complet, 3 phrases, citee en totalite car c'est le
    corps entier de la section source) : « Fee-on-transfer tokens will not function with our router
    contracts. As a workaround, the token creators may create a token wrapper or a customized
    router. We will not be making a router that supports fee-on-transfer tokens in the future. »
  - Section « Rebasing Tokens » (verbatim complet) : « Rebasing tokens will succeed in pool creation
    and swapping, but liquidity providers will bear the loss of a negative rebase when their
    position becomes active, with no way to recover the loss. »
- **Point negatif confirme** : aucune mention de v4 ni de hooks sur cette page (page specifiquement
  scopee v3).
- **Date de derniere mise a jour** : NON TROUVEE dans le HTML capture (pas de champ « Last updated »
  identifie). Tentative de contournement cette revision : recherche du depot GitHub source
  (developers.uniswap.org est backed par un repo Uniswap, chemin exact non identifie ; recherche
  GitHub code-search infructueuse, API necessite une authentification que je n'ai pas —
  `api.github.com/search/code` a repondu « Requires authentication », HTTP 401) — **reste NON
  TROUVE**, procurement : identifier le repo GitHub exact (probablement `Uniswap/docs` ou
  equivalent sous `developers.uniswap.org`) et consulter l'historique de commits du fichier.

### 2.2 Page officielle v2 « Troubleshooting » — le « surplus non comptabilise »
- **Identite** : « Troubleshooting (v2) », slug `/docs/protocols/v2/guides/troubleshooting` — page
  DISTINCTE de la page v3 ci-dessus ; c'est ICI, pas sur la page v3, que se trouve le langage sur le
  surplus non comptabilise que la mission demandait.
- **Classe** : P1. **Niveau** : [lu] — markdown brut via endpoint llms.mdx,
  `_txt/web/uniswap-v2-troubleshooting.mdx`, 2304 octets, texte integral lu.
- **Verbatim exact — « surplus non comptabilise »** (section « Positive rebasing tokens ») :
  « Positive rebases can create surplus balances that are not reflected in reserve accounting. Third
  parties may capture this surplus via skim(). » (20 mots) — confirme exactement le point demande
  par la mission, mais situe sur la page v2, pas sur la page v3 « integration issues » (2.1).
- **Autres verbatims utiles** :
  - « Inclusive fee-on-transfer tokens » : « These tokens burn or divert part of each transfer, so
    the recipient receives less than the sender transfers. »
  - « Exclusive fee-on-transfer tokens » (categorie distincte, non nommee dans le mandat) : « These
    tokens send an additional trailing transfer after the primary transfer. Because the router
    cannot anticipate that trailing transfer, swaps may revert or leave pair state inconsistent. »
  - « Negative rebasing tokens » : « Negative rebases can unbalance pool reserves and shift losses
    to the next transacting account. »
  - Wrapper pattern CHAI cite comme exemple de compatibilite amelioree.

### 2.3 Position v4 — hooks : confirmation officielle que le coeur v4 NE supporte PAS le rebasing
- **Identite/URL** : « Does Uniswap support Blast rebase tokens? », Uniswap Labs Help Center,
  https://support.uniswap.org/hc/en-us/articles/25351747812109-Does-Uniswap-support-Blast-rebase-tokens
- **Classe** : P1. **Niveau** : [lu] — WebFetch a echoue (403 Forbidden), contourne par curl direct
  avec header User-Agent navigateur (HTTP 200). Sauvegarde HTML+TXT.
- **Date affichee sur la page** : « Updated / May 29, 2026 20:25 » (verbatim pied de page).
- **Verbatim exact (reponse a la question v4/hooks de la mission)** : « Uniswap v3 and v4 do not
  support rebase tokens. This means that additional tokens earned through rebasing cannot be
  withdrawn from the liquidity position. » (21 mots) — et : « Uniswap v2 does support rebase
  tokens. » (6 mots).
- **Interpretation stricte** : la page dit explicitement que le coeur v3 ET v4 ne supporte pas les
  tokens rebasing — les hooks v4 ne sont pas presentes ici comme une solution generale activee par
  defaut (cf. 2.4, piste non lue en primaire).

### 2.4 Piste v4/hooks non confirmee en primaire — [2nd], procurement non forme
Une recherche web (resume, pas de lecture directe) mentionne un hook v4 specifique pour
wrapper/unwrapper stETH<->wstETH gerant le rebasing, et un article de blog Trail of Bits
(« Building secure Uniswap v4 hooks », 2026-07-30) recommandant que tout hook enonce explicitement
quels comportements de token il supporte. [2nd] pour ces deux points — hors perimetre strict des 6
cibles. Procurement si utile a une passe Ukemi ulterieure : lire
https://blog.trailofbits.com/2026/07/30/building-secure-uniswap-v4-hooks/ et identifier le depot
GitHub du hook stETH/wstETH.

### 2.5 Page consommateur generale « Rebasing, reflection, and debasing tokens »
- **URL** : https://support.uniswap.org/hc/en-us/articles/34258911235469-Rebasing-reflection-and-debasing-tokens
- **Classe** : P1. **Niveau** : [lu] (curl direct, 200 OK).
- **Date** : « Updated / February 13, 2025 15:18 » (verbatim pied de page).
- **Contenu** : definition generale rebasing/reflection/debasing ; aucune mention v3/v4/hooks sur
  cette page precise. Verbatim : « Rebasing and reflection tokens use smart contracts that enable
  the creators to control the token supply in response to price changes. » (18 mots).

**Bilan cible 2** : le passage exact demande par la mission (« will not function correctly on v3 »,
« surplus non comptabilise ») est confirme en primaire [lu], mais reparti sur deux pages officielles
distinctes (v3 « unsupported-tokens » pour la premiere phrase ; v2 « troubleshooting » pour le
surplus/skim()). La question v4/hooks est tranchee au niveau du coeur du protocole (non supporte,
page Blast, 2026-05-29). NON TROUVE : date de derniere mise a jour de la page 2.1 (tentative GitHub
infructueuse, authentification requise).

## Cible 3 — Solana Token-2022 « Scaled UI Amount » extension + xStocks/Backed

### 3.1 Documentation officielle Solana — Scaled UI Amount Extension
- **URL** : https://solana.com/docs/tokens/extensions/scaled-ui-amount
- **Classe** : P1 (documentation officielle Solana Foundation/Labs).
- **Niveau** : [lu] — HTML complet recupere par curl (1 619 914 octets), verbatim confirme par grep
  direct sur le JSON MDX embarque dans la page.
- **Verbatim exact (mecanisme)** : « No new tokens are created. The token amount stored in token
  accounts stays the same. Only the displayed UI amount changes. » (18 mots).
- **Incompatibilite documentee** : ne pas activer `ScaledUiAmount` et `InterestBearingConfig` sur le
  meme mint — le Token Extension Program rejette cette combinaison.
- **Champs de `ScaledUiAmountConfig`** (verbatim) : « ScaledUiAmountConfig stores the update
  authority, multiplier, new_multiplier, and new_multiplier_effective_timestamp. » Et : « Before
  new_multiplier_effective_timestamp, conversions use multiplier. At or after that timestamp,
  conversions use new_multiplier. »
- **Avertissement arithmetique** (verbatim) : « AmountToUiAmount, UiAmountToAmount, and the
  extension conversion helpers use floating-point arithmetic for scaled UI amount mints, so
  conversions are not guaranteed to round-trip exactly. » — pas de garantie d'aller-retour exact,
  pertinent pour tout calcul Ukemi derivant un solde brut depuis un montant affiche.
- **Ce que voient les pools/wallets** : Raw Amount = solde brut inchange stocke on-chain ; UI Amount
  = brut x multiplicateur (+ decimales), via `AmountToUiAmount`/`UiAmountToAmount`.
- **Date de publication/mise a jour** : NON TROUVEE (pas de champ date/lastModified identifie ;
  meme tentative GitHub infructueuse qu'en 2.1, meme cause : API code-search necessite
  authentification).

### 3.2 xStocks / Backed Finance — dividendes et splits
- **URL page dividendes/splits** : https://docs.xstocks.fi/docs/dividends-and-stock-splits
- **URL page technique developpeur** : https://docs.xstocks.fi/developers/multipliers
- **Classe** : P1. **Niveau** : [lu] pour les deux pages — HTML complet recupere par curl, verbatim
  confirme par grep direct dans le HTML rendu.
- **Mecanisme (dividendes)** : le custodien recoit le dividende et le reinvestit en actions
  supplementaires du meme titre (net de retenue fiscale), ce qui hausse le multiplicateur. Verbatim :
  « Example: Apple pays a dividend. The multiplier moves from 1.0 to 1.008. »
- **Mecanisme (split)** : verbatim : « Example: A 4-for-1 split. The multiplier moves from 1.008 to
  4.032. »
- **Mecanisme (reverse split)** : verbatim : « The multiplier moves from 4.032 to 2.016. » —
  **confirme par le MEME grep direct que les deux exemples precedents** (correction : le premier jet
  de cette archive affirmait a tort une « confiance moderee » sur ce point, pretendant que le grep ne
  l'avait pas confirme explicitement ; relecture de ma propre commande : la sortie du grep
  `"multiplier moves from..."` contenait bien les TROIS lignes dans le meme resultat, y compris
  celle-ci — [lu] plein, pas de degradation).
- **Multi-chaine** (verbatim) : « Solana: The onchain balance remains constant. A multiplier is
  stored in token metadata. » et « TON: Functions similarly to Solana. »
- **Lien explicite Token-2022 — CONFIRME** (page `developers/multipliers`, verbatim) : titre de
  section « Solana (SPL Token-2022) », puis : « Solana xStocks use the Scaled UI Amount Extension,
  part of the SPL Token-2022 standard. This extension stores the multiplier as metadata alongside
  the token. » Ce lien est confirme verbatim sur la page technique developpeur, PAS sur la page
  dividendes/splits generale (qui ne nomme pas « Token-2022 » — verifie par grep negatif).
- **EVM (contraste)** : sur les chaines EVM, le contrat ajuste directement les soldes via
  `balanceOf()` (rebasing ERC-20 classique) — distinct du mecanisme Solana/TON.

**Bilan cible 3** : mecanisme du multiplicateur Solana Token-2022 confirme en primaire [lu] avec les
4 champs exacts de `ScaledUiAmountConfig` et l'avertissement sur l'arithmetique flottante. Lien
xStocks -> Scaled UI Amount -> SPL Token-2022 confirme verbatim en primaire [lu], avec les TROIS
exemples chiffres de multiplicateur (dividende, split, reverse split) confirmes par grep direct.
NON TROUVE : date de mise a jour de la page 3.1.

## Cible 4 — ERC-8056 (existe-t-il ? statut, auteurs, mecanisme)

### 4.1 ERC-8056 — confirmation d'existence, depot officiel ethereum/ERCs
- **Identite exacte** (frontmatter YAML, verbatim) : `eip: 8056` / `title: Scaled UI Amount
  Extension for ERC-20 Tokens` / `description: Equity Token support for Stock Splits` / `author:
  Chris Ridmann (@cridmann) <chris@superstate.co>, Daniel Gretzke (@gretzke), Gilbert Shih
  <chung.shih@robinhood.com>, Tino Martinez Molina (@tinom9), Markus Osterlund (@robriks)
  <markus.osterlund@coinbase.com>` / `discussions-to:
  https://ethereum-magicians.org/t/erc-8056-scaled-ui-amount-extension-for-erc-20-tokens/25899` /
  `status: Draft` / `type: Standards Track` / `category: ERC` / `created: 2025-10-20` /
  `requires: 20, 165`.
- **Pas de collision** : le numero 8056 designe bien ce standard, confirme sur DEUX sources
  independantes convergentes : depot GitHub brut (`raw.githubusercontent.com/ethereum/ERCs/...`) et
  page rendue officielle `eips.ethereum.org/EIPS/eip-8056` (titre HTML confirme).
- **Classe** : P1. **Niveau** : [lu] — fichier markdown complet recupere par curl (18 111 octets), lu
  integralement (Abstract, Motivation, Specification, interfaces Solidity, implementation reference
  complete, Rationale, Backwards Compatibility, debut Test Cases).
- **Auteur Robinhood — precision** : « Gilbert Shih <chung.shih@robinhood.com> », cite
  individuellement (convention EIP standard). Un co-auteur (Markus Osterlund) porte une adresse
  @coinbase.com — collaboration inter-entreprises (Superstate, Robinhood, Coinbase).

### 4.2 Mecanisme (interfaces exactes) — et NON TROUVE explicite sur « rights »
- **Interface centrale MUST** `IScaledUIAmount` : `uiMultiplier() external view returns (uint256)`
  (18 decimales, `1e18 = 1.0`) ; event `UIMultiplierUpdated(...)` ; events optionnels
  `TransferWithUIAmount(...)`, `UIMultiplierUpdateCancelled(...)`.
- **Extensions optionnelles** : `IScaledUIAmountConversion` (`toUIAmount`/`fromUIAmount`) ;
  `IScaledUIAmountBalances` (`balanceOfUI`/`totalSupplyUI`).
- **Extension MUST** `IScaledUIAmountNewUIMultiplier` : `newUIMultiplier()`/`effectiveAt()`.
- **Identifiants d'interface (ERC-165, verbatim)** : `IScaledUIAmount: 0xa60bf13d` ;
  `IScaledUIAmountNewUIMultiplier: 0x4bd27648` ; `IScaledUIAmountConversion: 0x57854fc3` ;
  `IScaledUIAmountBalances: 0xd890fd71`.
- **Compatibilite ascendante** (verbatim) : « This EIP is fully backwards compatible with ERC-20. »
- **Alternatives ecartees** (Rationale) : rebasing tokens, wrapper tokens par evenement, tokens a
  taux d'echange/index, solutions off-chain.
- **NON TROUVE explicite — concept de « rights »** : la mission demandait le mecanisme sous l'angle
  « multiplier, rights ». J'ai lu integralement la specification ERC-8056 et **aucun concept de
  « rights » (droits, permissions particulieres au porteur, droits de vote, etc.) n'y apparait** —
  le standard est PUREMENT un mecanisme d'affichage de solde (multiplicateur), sans notion de droits
  distincte de la propriete ERC-20 standard. Absence confirmee par lecture directe, pas une omission
  de ma recherche — signale explicitement car demande nommement par la mission.

### 4.3 Application chez Robinhood Chain (Stock Tokens) — le « bon » ERC confirme
- **URL** : https://docs.robinhood.com/chain/stock-tokens/ (section « Corporate actions & the
  multiplier »). **Classe** : P1. **Niveau** : [lu] — HTML complet recupere par curl, verbatim
  confirme par grep direct.
- **Verbatim exact** : «... ERC-8056 (Scaled UI Amount Extension). Onchain swaps remain unaffected,
  and the oracle automatically incorporates the multiplier into the price... » — confirme que
  Robinhood Stock Tokens implementent bien ERC-8056.
- **Architecture chaine** (verbatim, page d'accueil docs.robinhood.com/chain/) : « Robinhood Chain
  is built on Arbitrum Dedicated Blockchains, a modular Layer-2 framework that combines Ethereum's
  security with high throughput and low transaction costs. » **Note terminologique** : la
  presse/WebSearch parle d'« Arbitrum Orbit »/« Nitro » ; le terme EXACT de la doc officielle est
  « Arbitrum Dedicated Blockchains » — ni « Orbit » ni « Nitro » trouves verbatim sur les pages
  officielles lues. Ecart signale, non resolu.
- **Non trouve sur cette page precise** : les events `UIMultiplierUpdated`/`TransferWithScaledUI`
  ne sont pas nommes explicitement (la page renvoie a `uiMultiplier()` et a l'EIP par lien).

**Bilan cible 4** : ERC-8056 EXISTE, confirme en primaire [lu] sur deux sources convergentes. Statut
Draft, cree le 2025-10-20, 5 auteurs dont un @robinhood.com et un @coinbase.com. Mecanisme =
multiplicateur `uiMultiplier()` 18 decimales. Confirme comme standard reellement implemente par
Robinhood Stock Tokens. NON TROUVE explicite : aucun concept de « rights » dans le standard.

## Cible 5 — Aave v3.3 "deficit" / bad debt : event exact, topic0, date de deploiement

### 5.1 Event exact — code source primaire, topic0 calcule par moi
- **URL source** :
  https://raw.githubusercontent.com/aave-dao/aave-v3-origin/main/src/contracts/interfaces/IPool.sol
- **Classe** : P1 (depot de code officiel `aave-dao/aave-v3-origin`).
- **Niveau** : [lu] — fichier Solidity source complet recupere par curl (848 lignes), lu directement.
- **Definition exacte** (verbatim du code, NatSpec) : `event DeficitCreated(address indexed user,
  address indexed debtAsset, uint256 amountCreated);` — « Emitted when deficit is realized on a
  liquidation. »
- **Signature canonique** : `DeficitCreated(address,address,uint256)`.
- **topic0 — CALCULE PAR MOI**, pas copie d'une source tierce : `pycryptodome` (`Crypto.Hash.keccak`,
  digest_bits=256) installe localement (`pip install pycryptodome`), methode validee par un test de
  sanite : keccak256 de `Transfer(address,address,uint256)` calcule par le meme script =
  `0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`, qui correspond au topic0
  ERC-20 Transfer universellement connu — methode validee.
  **Resultat** : `DeficitCreated(address,address,uint256)` ->
  `topic0 = 0x2bccfb3fad376d59d7accf970515eb77b2f27b082c90ed0fb15583dd5a942699`.
- **Event complementaire** : `event DeficitCovered(address indexed reserve, address caller, uint256
  amountCovered);` -> topic0 CALCULE = `0x84b203e49f1a4b553088061534231969a68ad1c81be192205e96d23a206cb26a`.
- **Event LiquidationCall** (deja existant avant v3.3, utile pour decomposer repayment/seized) :
  `event LiquidationCall(address indexed collateralAsset, address indexed debtAsset, address indexed
  user, uint256 debtToCover, uint256 liquidatedCollateralAmount, address liquidator, bool
  receiveAToken);` -> topic0 CALCULE = `0xe413a321e8681d831f4dbccbca790d2952b56f977908e45be37335533e005286`.
  **Decomposition** : `debtToCover` = dette remboursee ; `liquidatedCollateralAmount` = collateral
  saisi ; si collateral final nul + dette residuelle, celle-ci est bruleee et loggee separement par
  `DeficitCreated.amountCreated` (evenement DIFFERENT, pas un champ de `LiquidationCall`).
- **Fonctions associees** : `eliminateReserveDeficit(address asset, uint256 amount)` (role
  `Umbrella`) ; `getReserveDeficit(address asset) external view returns (uint256)`.

### 5.2 Mecanisme narratif — docs officielles BGD Labs (Aave-v3.3-features.md)
- **URL** : https://raw.githubusercontent.com/bgd-labs/aave-v3-origin/main/docs/3.3/Aave-v3.3-features.md
- **Classe** : P1. **Niveau** : [lu] — fichier markdown complet (11 549 octets), lu integralement.
- **Verbatim (declencheur exact)** : « If an account ends up with zero collateral and non-zero debt,
  any remaining debt in the account is burned and the new deficit created is accounted to the
  reserve. »
- **Stockage** : « The new `deficit` data is introduced to the `ReserveData` struct by re-utilizing
  the deprecated stableBorrowRate (`__deprecatedStableBorrowRate`) storage. »
- **Cas special GHO** : liquidation en deux etapes — `vGHO.burn` puis `aGHO.handleRepayment(...)`.
- **Limite reconnue** (verbatim) : « we define a bad debt situation as an account that has zero
  collateral, in base currency, but retains some level of debt. »
- **Close Factor (2.1)** : passage d'un close factor 50 % par RESERVE a un close factor sur la
  POSITION ENTIERE (exemple chiffre du doc : 3k$ GHO/USDC/DAI x 9k$ ETH collateral).
- **100 % close factor conditionnel (2.2)** : autorise si principal/dette sous
  `MIN_BASE_MAX_CLOSE_FACTOR_THRESHOLD` (exemple : seuil 1_000e8, position 1200$/900$, HF 0.96).

### 5.3 Date de deploiement — confirmee par DEUX sources primaires convergentes
- **Source A — Changelog officiel Aave** (`aave.com/docs/resources/changelog`, [lu], HTML complet
  142 029 octets) : « 24 February 2025 / Aave v3.3 / Introduces logging and burn functionality... »
- **Source B — Thread de gouvernance BGD** (`governance.aave.com/t/bgd-aave-v3-3-feat-umbrella/20129`,
  [lu], 7 posts lus integralement, post initial bgdlabs `created_at=2024-12-10T08:27:37.873Z`) :
  « The on-chain AIP to upgrade all active Aave v3.2 instances to Aave v3.3 has been created...
  execution expected on Monday 24th February. »
- **Convergence** : les deux sources pointent la MEME date, 24 fevrier 2025, pour l'upgrade on-chain
  de « all active Aave v3.2 instances » (formulation multi-reseaux — aucune des deux sources ne dit
  « Ethereum Core » explicitement, mais Ethereum Core y est inclus par construction).
- **Coherence temporelle avec cible 1** : cette date (24 fevrier 2025) est ANTERIEURE a l'incident
  CAPO (10 mars 2026) — v3.3 etait deja deploye lors de l'incident. Le post-mortem dit « no bad debt
  accrued » ; deduction logique (non verifiee on-chain) : aucun `DeficitCreated` ne devrait avoir ete
  emis lors de cet incident.

**Bilan cible 5** : event exact confirme en primaire [lu] = `DeficitCreated(address indexed user,
address indexed debtAsset, uint256 amountCreated)`, topic0 calcule par moi =
`0x2bccfb3fad376d59d7accf970515eb77b2f27b082c90ed0fb15583dd5a942699`. Date de deploiement
multi-reseaux (incluant Ethereum) = 24 fevrier 2025, deux sources primaires convergentes.
Decomposition repayment/seized/bad debt = `LiquidationCall.debtToCover` /
`LiquidationCall.liquidatedCollateralAmount` / `DeficitCreated.amountCreated`.

## Cible 6 — Chainlink SVR (Smart Value Recapture) pour Aave WETH

### 6.1 Mecanisme officiel (backrun-only)
- **URL** : https://docs.chain.link/data-feeds/svr-feeds (documentation officielle Chainlink).
- **Classe** : P1. **Niveau** : [lu] — HTML complet recupere par curl (363 980 octets), texte extrait
  localement (272 lignes), lu integralement.
- **Verbatim exact (mecanisme backrun-only)** : « SVR is purpose-built for recapturing non-toxic
  liquidation-related OEV via backrunning and cannot be used for harmful forms of MEV such as
  frontrunning or sandwich attacks. »
- **Architecture** : le Data DON transmet le rapport de prix deux fois en parallele — route publique
  standard vers le Price Feed normal, route privee vers le « SVR Aggregator » via un canal type
  Flashbots MEV-Share. Les searchers encherissent pour executer la liquidation en backrun immediat.
  Fallback vers le prix standard apres un delai configurable en cas d'echec de la route privee.
- **Reseau Aave concerne** : « Ethereum Mainnet » -> systeme d'enchere « Flashbots MEV-Share »
  (tableau reseau/systeme d'enchere de la doc officielle).

### 6.2 Activation ETH/USD sur Aave v3 Ethereum CORE — proposition de gouvernance, date exacte
Chronologie confirmee en primaire [lu] (Aave forum, API Discourse JSON, post #1 de chaque thread lu
integralement ; posts suivants parcourus par grep cible sur les templates recurrents des mises a
jour hebdomadaires et quelques posts specifiques lus en contexte — **correction du premier jet, qui
affirmait a tort avoir lu « tous » les posts des 3 threads integralement** ; les threads complets
font 20/13/15 posts, seuls les posts #1 de chacun, plus quelques posts cibles par grep, ont ete lus) :

- **Phase 1** (`governance.aave.com/t/arfc-aave-chainlink-svr-v1-phase-1-activation/21247`, post #1
  bgdlabs, 2025-03-04T08:34:52.602Z) : active BTC/USD (LBTC, tBTC) + AAVE/USD + LINK/USD sur Aave v3
  Core. WETH/ETH-USD EXPLICITEMENT EXCLU : « In this first activation batch, major assets size-wise
  should be avoided: ETH, wstETH, WBTC, weETH. »
- **Phase 2** (`.../phase-2/21940`, post #1 bgdlabs, 2025-05-01T13:05:19.622Z) : active WETH/ETH-USD
  SVR sur Aave v3 Ethereum PRIME (pas Core) : « WETH. Currently using the ETH/USD (Chainlink) feed,
  to be replaced by the ETH/USD SVR version. » Exclut Core pour l'instant.
- **Phase 3** (`.../phase-3/22387`, post #1 bgdlabs, 2025-06-19T11:33:22.753Z) : propose ENFIN
  WETH/ETH-USD SVR sur Aave v3 Ethereum CORE (phase demandee par la mission). Tableau verbatim :
  « WETH | ETH/USD Chainlink feed | ETH/USD SVR Chainlink feed ».

**Date exacte d'activation on-chain (Phase 3, Core)** : post #3 (bgdlabs, 2025-06-23T13:37:04.623Z)
annonce l'AIP on-chain (`vote.onaave.com/proposal/?proposalId=330`), vote sous ~24h. Confirmation
indirecte de l'execution : post #6 (Chainlinkdaddy, 2025-07-01T15:14:13.392Z), verbatim : « yes, we
need it updated to include all the new feeds that got flipped on 3 days ago » — soit ~28 juin 2025
par inference arithmetique (pas une date calendaire ecrite telle quelle). **Tentative de confirmation
directe cette revision** : `vote.onaave.com/proposal/?proposalId=330` fetche — page desactivee,
verbatim : « This interface is not actively maintained anymore » (interface BGD Labs retiree,
redirige vers la gouvernance Aave actuelle) ; `app.aave.com/governance/v3/proposal/?proposalId=330`
fetche — page SPA cote client, aucune donnee de proposition dans le HTML statique. **La date
d'execution exacte reste une inference, non une donnee lue** — deux tentatives faites, toutes deux
NON TROUVE.

### 6.3 Repartition des frais (Chainlink/Aave) — CORRIGE : relation arithmetique exacte, pas une contradiction brute
Primaire [lu], repetee ~15+ fois sur 5 mois de mises a jour hebdomadaires (posts RaoulSchipper-CLL,
Chainlink Labs) : verbatim systematique « representing 65% of the recaptured OEV for this period,
per the agreed-upon SVR fee split » — et, plus explicitement : « The amount sent will align with the
6-month 65/35 fee split defined in the ARFC Addendum. » **Repartition confirmee primaire : 65 % Aave
DAO / 35 % Chainlink**, qualifiee de « 6-month » (periode initiale, potentiellement renegociee
ensuite — l'« ARFC Addendum » n'a pas ete lu cette passe, procurement possible).

Secondaire [2nd], WebSearch uniquement, non re-fetche verbatim : « Chainlink ultimately receives
31.5% of all liquidation fees, while Aave receives the remaining 58.5%. »

**Correction (premier jet erronne)** : le premier jet de cette archive affirmait que les deux
chiffres « ne se recoupent pas par un simple recalcul evident ». **C'est faux** — verification
arithmetique directe : 58,5 / 65 = 0,9 exactement, et 31,5 / 35 = 0,9 exactement. **Les deux couples
de chiffres sont donc le MEME ratio 65/35, applique a une assiette qui ne represente que 90 % d'un
total** (65 % x 0,9 = 58,5 % ; 35 % x 0,9 = 31,5 %). La question qui reste reellement ouverte n'est
pas « lequel des deux chiffres est correct » mais **« que represente le 10 % manquant dans la
formulation presse »** (une retenue Flashbots/builder ? une part conservee par les searchers avant
le partage Aave/Chainlink ? un arrondi de communication ?) — cette question precise n'est pas
tranchee par les sources lues cette passe, signalee comme telle (procurement : ARFC Addendum, cf.
ci-dessus, pourrait clarifier l'assiette exacte).

### 6.4 Contrat 0x5424384b... — verifie, source LUE (mise a jour : Blockscout keyless)
Identification precise — CONFIRMEE en primaire [lu] sur la page officielle des adresses de feeds
Chainlink (`docs.chain.link/data-feeds/price-feeds/addresses`, filtre Ethereum, 16 115 963 octets) :
donnees structurees embarquees dans la page, verbatim exact des champs JSON : `"name":"ETH / USD"`,
`"path":"eth-usd-svr"`, `"proxyAddress":"0x5147eA642CAEF7BD9c1265AadcA78f997AbB9649"`,
`"secondaryProxyAddress":"0x5424384B256154046E9667dDFaaa5e550145215e"`, `"threshold":0.5`,
`"feedCategory":"low"`, `"feedType":"Crypto"`. L'adresse nommee par la mission est donc la
`secondaryProxyAddress` du feed `eth-usd-svr`. Le seuil 0,5 % correspond exactement au chiffre cite
dans le thread de gouvernance Phase 1 (§6.2).

**Etherscan** : https://etherscan.io/address/0x5424384B256154046E9667dDFaaa5e550145215e . Tentative
curl directe BLOQUEE (HTTP 403, challenge Cloudflare, capture conservee comme preuve de l'echec).
Contournement WebFetch : nom de contrat `EACAggregatorProxy`, « Source Code Verified », solde 0 ETH,
3 transactions (« Propose Aggregator », « Confirm Aggregator », « Transfer Ownership »), cree ~1 an
avant cette passe (coherent avec un deploiement mi-2025), Solidity v0.6.6, licence MIT.

**Lecture du CODE SOURCE — [lu], upgrade de cette revision.** L'API Etherscan v1/v2 est restee
bloquee (v1 « deprecated », v2 « Missing/Invalid API Key », pas de cle disponible). **Contournement
reussi via l'API Blockscout keyless** (`eth.blockscout.com/api?module=contract&action=getsourcecode
&address=0x5424384B256154046E9667dDFaaa5e550145215e`, HTTP 200, JSON complet sauvegarde,
`_txt/web/blockscout-source-0x5424384b.json`) : `ContractName: "EACAggregatorProxy"`,
`CompilerVersion: "0.6.6+commit.6c089d02"`, `FileName:
"/Users/yos/chainlink2/evm-contracts/src/v0.6/EACAggregatorProxy.sol"` (chemin de developpement
Chainlink d'origine, embarque dans les metadonnees de verification — corrobore l'authenticite du
deploiement). Verbatim du `SourceCode` lui-meme (NatSpec) : « @title External Access Controlled
Aggregator Proxy » / « A trusted proxy for updating where current answers are read from... delegates
where it reads from to the owner, who is trusted to update it. » / « Only access enabled addresses
are allowed to access getters for aggregated answers and round information. » Le contrat expose
`setController(address)` restreint par `onlyOwner()`, et les getters `latestAnswer()`/
`latestTimestamp()` sont gates par un modificateur `checkAccess()` — coherent avec les 3
transactions observees sur Etherscan (Propose/Confirm Aggregator = changement de l'aggregateur
delegue ; Transfer Ownership = changement du owner autorise a le faire). **Ce texte est le meme
verifie que celui qu'Etherscan affiche (meme bytecode/verification indexee par les deux
explorateurs), mais je n'ai pas fait de comparaison octet-a-octet entre les deux explorateurs cette
passe** — a considerer comme [lu] avec un tres haut degre de confiance, pas une identite formellement
prouvee entre les deux sources.

**Bilan cible 6** : mecanisme backrun-only confirme verbatim en primaire. Activation WETH/ETH-USD
sur Aave v3 Ethereum Core = Phase 3 (id 22387, creee 2025-06-19, AIP ~2025-06-23), execution
on-chain estimee ~28 juin 2025 (inference, deux tentatives de confirmation directe infructueuses).
Repartition des frais : 65/35 primaire et 58,5/31,5 secondaire sont le MEME ratio applique a une
assiette a 90 % (pas une contradiction brute — correction du premier jet) ; question ouverte =
nature du 10 % manquant. Adresse `0x5424384B256154046E9667dDFaaa5e550145215e` confirmee comme
`secondaryProxyAddress` du feed officiel `eth-usd-svr`, contrat `EACAggregatorProxy` verifie, code
source maintenant LU via Blockscout keyless.

---

## Bilan global de la passe (6 cibles)

Toutes les 6 cibles ont ete traitees avec au moins une source primaire [lu] (aucun NON TROUVE total
sur une cible entiere). Deux chiffres nommes par la mission sont CONFIRMES en primaire : le
remboursement CAPO 512,19 ETH (cible 1, verbatim exact de l'ARFC TokenLogic) et l'existence/le statut
de ERC-8056 (cible 4, Draft, cree 2025-10-20).

**Deux constats corriges par la relecture advisor** (l'un devient une precision, pas une
contradiction ; l'autre reste une vraie contradiction) :
(a) cible 6, repartition des frais SVR : 65/35 (primaire, repete) et 58,5/31,5 (secondaire) sont le
    MEME ratio applique a une assiette a 90 % — PAS une contradiction arithmetique, mais une question
    ouverte sur la nature de ce 10 % (voir §6.3) ;
(b) cible 1, quatre valeurs voisines du montant total de remboursement CAPO dans le MEME document
    primaire (512,19 / 513,19 / 513,48 / 358,56 / 357,56) — contradiction interne reelle, non
    resolue ;
(c) cible 1, QUATRE formulations primaires du montant total liquide ($26M ChaosLabs / $26.6M
    LlamaRisk / $27M commentaire du meme thread / « $26M–$27M » en fourchette) — aucune n'egale les
    « 26,9 M$ » du document interne Ukemi, qui reste une valeur non retracee dans le primaire.

**NON TROUVE explicites** (mission ou relecture) :
1. Le bloc Ethereum exact de l'incident CAPO (cible 1) — seule la date/heure des posts et
   `snapshotTimestamp` (reference 7 jours avant, pas le bloc de l'incident) sont disponibles.
2. Le concept de « rights » dans ERC-8056 (cible 4) — absent de la specification lue, standard
   purement multiplicateur d'affichage.
3. La date de derniere mise a jour des pages Uniswap 2.1 et Solana 3.1 — deux tentatives (recherche
   directe + GitHub code-search, bloque par authentification requise) infructueuses.
4. La date calendaire exacte d'execution de l'AIP Phase 3 SVR (cible 6) — deux tentatives (interface
   de vote retiree ; SPA sans rendu statique) infructueuses, seule une inference relative subsiste.
5. Le depart de Chaos Labs (avril 2026, cite par le document interne) n'a pas de source
   `governance.aave.com` primaire retrouvee — confirme uniquement par convergence de presse [2nd]
   (~10 medias), le depart BGD Labs/ACI l'est en revanche en primaire [lu] (LlamaRisk, §1.1/1.4).

**Procurements formes** :
1. Lecture directe de l'ARFC Addendum Aave <> Chainlink SVR definissant le split 65/35 « 6-month »
   (cible 6, pour clarifier la nature du 10 % d'ecart avec le chiffre de presse) — URL non
   identifiee cette passe.
2. Identifier le depot GitHub source des docs developers.uniswap.org et docs.solana.com (cibles 2/3)
   pour en tirer l'historique de commits — bloque par l'authentification requise de l'API GitHub
   code-search cette passe.
3. Chercher un post `governance.aave.com` primaire annoncant le depart de Chaos Labs (avril 2026,
   cible 1 contexte) — une recherche `site:governance.aave.com` ciblee n'a retourne que de la presse.
4. Lire les transactions `LiquidationCall`/`DeficitCreated` on-chain autour du 10 mars 2026 pour
   identifier le bloc exact de l'incident CAPO (cible 1) — necessite un explorateur/RPC, non fait
   cette passe.

**Methode notable** : keccak256/topic0 des events Aave v3.3 (`DeficitCreated`, `DeficitCovered`,
`LiquidationCall`) calcules localement via `pycryptodome`, valides par un test de sanite sur l'event
`Transfer` ERC-20 dont le topic0 est universellement connu
(`0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`). Contournement Etherscan (403
Cloudflare / cle API absente) via l'API Blockscout keyless, qui a permis une lecture [lu] du code
source verifie du contrat `0x5424384B...` (cible 6).

Tous les fichiers sources (HTML/JSON/MD/TXT/scripts) sont dans
`F:\Monark\docs\biblio\ukemi-modeL\_txt\web\` ; tous les sha256 sont appendes a
`F:\Monark\docs\biblio\ukemi-modeL\SOURCES-sha256.txt` (prefixe `_txt/web/...`).
