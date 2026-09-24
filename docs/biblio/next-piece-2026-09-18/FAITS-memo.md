# FAITS-memo — vérification du mémo « Prochaine pièce après Narabi et ACI »

Mémo source : `F:\PRODUITS\downloads-monark\00-prochaine-piece-apres-narabi-aci.md` (18 septembre 2026).
Discipline : [lu]/[abs]/[2nd] ; chiffres copiés tels quels avec unité/date/URL ; NON TROUVÉ si applicable.

---

## A.6 — Day-zero (mémo §2) vs live `state.json` / `timeline.jsonl`

**Statut : CONFIRMÉ EXACTEMENT** (source P1, fetch direct 2026-09-18, [lu] intégral, pas de divergence).

Fetch brut `https://monarkgate.tech/narabi/timeline.jsonl` (1 seule ligne, HTTP 200) :
```
{"day":"2026-09-17","from_block":25993482,"to_block":26000650,
 "burns":"7248378739600000000000000","mints":"17695946655200000000000000",
 "supply_close":"4740020686554655133523503861","s_open":"4729573118639055133523503861",
 "c1_ok":true,"v":0.0000638568795,"regime":{"floor":true,"stress":false},
 "pair_status":"non_evaluable","q_before":0.00013119228083333334,
 "q_after":0.00013119228083333334,"T":0,"bound_thm1":null,"drift_flag":false,
 "digest_T":"48d40651eb2e69c38d43c58ebf47eb1e656560606a70a957e9929ae0e70c275a",
 "prev_line_hash":"GENESIS",
 "line_hash":"09beb6564fd68ac0635f782efb27fd655e9beffc48c7edc51bead5638c81da82"}
```
Fetch brut `https://monarkgate.tech/narabi/state.json` (HTTP 200) :
```
{"tracker":{"q":0.00013119228083333334,"t":0,"q1":0.00013119228083333334,
 "params":{"alpha":0.1,"c":0.041666666666666664,"eps":0.1,"t0":0,"B":0.041666666666666664}},
 "digest":"48d40651eb2e69c38d43c58ebf47eb1e656560606a70a957e9929ae0e70c275a",
 "projected_bound_leq_target_T":1789,"replay_q":0.00013119228083333334}
```

Recalcul de vérification (division par 1e18, 18 décimales ERC20) :
- burns raw `7248378739600000000000000` / 1e18 = **7 248 378,7396 USDe** → arrondi mémo « 7 248 379 » : **cohérent**.
- mints raw `17695946655200000000000000` / 1e18 = **17 695 946,6552 USDe** → arrondi mémo « 17 695 947 » : **cohérent**.
- s_open raw / 1e18 = **4 729 573 118,639055… ** → arrondi mémo « 4 729 573 119 » : **cohérent**.
- supply_close raw / 1e18 = **4 740 020 686,554655…** → arrondi mémo « 4 740 020 687 » : **cohérent**.
- v = 0,0000638568795 /h → mémo « 0,00006386 » : **cohérent** ; ×24h = 0,1532…% /jour → mémo « 0,153 % » : **cohérent**.
- q1 = 0,00013119228083333334 /h → mémo « 0,00013119 » : **cohérent** ; ×24h = 0,31486…% /jour → mémo « 0,315 % » : **cohérent**.
- Identité C1 recalculée sur les valeurs BRUTES (pas les arrondis) : s_open(raw) = supply_close(raw) + burns(raw) − mints(raw) ?
  4 740 020 686,554655 + 7 248 378,7396 − 17 695 946,6552 = 4 729 573 118,639055 = s_open(raw). **Identité exacte, tient.**
  Le mémo écrit "S_open = S_close + burns − mints" — **formulation identique**, confirmée bit à bit sur les valeurs brutes,
  pas seulement sur les arrondis.
- `pair_status` = `"non_evaluable"` — mémo « Pair: non_evaluable » : **identique**.
- `q_before` = `q_after` = q1, `T`:0 — mémo « qt égal à q1 (aucun pas) » : **identique**.
- `bound_thm1`: null — mémo « bound_thm1 null » : **identique**.
- `drift_flag`: false — mémo « drift_flag false » : **identique**.
- `prev_line_hash`: "GENESIS" — mémo « prev_line_hash GENESIS » : **identique**.
- `regime`: `{"floor":true,"stress":false}` — mémo dit "Régime calm (stress: false, ...)". **Nuance** : le mot
  littéral `"calm"` n'apparaît PAS comme valeur JSON ; le régime est représenté par les booléens `floor`/`stress`.
  La lecture "calm" du mémo est une inférence correcte de `stress:false` (et vocabulaire de la doc Narabi
  copy, non re-vérifié ici), mais ce n'est pas un champ textuel du fichier. Signalé, pas une divergence de fond.
- `digest_T` (timeline) == `digest` (state.json) == `48d40651eb2e69c38d43c58ebf47eb1e656560606a70a957e9929ae0e70c275a` : cohérent entre les deux fichiers live.
- Fichier `timeline.jsonl` = **une seule ligne** (day zero, T=0) au 2026-09-18 : cohérent avec le récit "premier pas = le jour après" et absence de tout historique antérieur.

**Verdict global A.6 : tous les chiffres §2 du mémo sont confirmés, aucun écart trouvé.**

---

## A.1 — Aave Risk Stewards, IRM Changes on Aave V3, 2026-09-11

**Source primaire [lu] intégral** : https://governance.aave.com/t/risk-stewards-irm-changes-on-aave-v3-2026-09-11/25627
(fetch JSON API Discourse `.json`, HTTP 200 ; topic id 25627, **un seul post**, id 65391, auteur **LlamaRisk**,
`created_at` = **2026-09-11T19:24:31.510Z**. P1 (canal officiel de gouvernance Aave ; auteur LlamaRisk = prestataire
de risque financé en partie par la DAO Aave, disclosure en pied de post — noté, reste le texte de gouvernance officiel).

Table "USDe Debt Migration" copiée telle quelle (colonnes : Instance | Debt on August 28 | Debt now | Change |
Supply on August 28 | Supply now | Utilization then | Utilization now) :

| Instance | Debt 28 août | Debt maintenant | Δ | Supply 28 août | Supply maintenant | Util. alors | Util. maintenant |
|---|---|---|---|---|---|---|---|
| Aave V3 Core | 450.4M | 117.5M | -73.9% | 713.3M | 661.1M | 63.1% | 17.8% |
| Aave V3 Plasma | 169.0M | 75.7M | -55.2% | 332.4M | 411.1M | 50.8% | 18.4% |
| Aave V3 Monad | 36.0M | 6.4M | -82.2% | 120.0M | 97.0M | 30.0% | 6.6% |
| Aave V3 Mantle | 2.7M | 0.1M | -96.2% | 10.9M | 14.1M | 25.1% | 0.7% |

Verbatim : *"Aggregate USDe debt across the five reserves fell from approximately 658.1M to approximately 199.7M,
a reduction of approximately 70%."* — Nuance : ce total « cinq réserves » inclut Avalanche, qui n'apparaît PAS
dans la table de migration ci-dessus (seulement Core/Plasma/Monad/Mantle) ; Avalanche est listée séparément dans
la table des taux avec Utilization 70.0% (courant, en hausse) — asymétrie signalée, pas résolue plus loin par moi.

Verbatim base rate : *"The USDe base rate moved from 0.00% to 6.00% in six steps between August 28 and
September 9, 2026, alongside the Slope1 reductions applied over the same period."* Et la recommandation de CE post :
*"Increase the USDe base rate from 6.00% to 6.30%"*.

### Comparaison aux chiffres du mémo (§4 « Actu »)

| Chiffre mémo | Source primaire | Verdict |
|---|---|---|
| Dette USDe Core 450,4 M → 117,5 M (−73,9 %) | Debt 28 août 450.4M → Debt maintenant 117.5M, Δ -73.9% (Core) | **CONFIRMÉ exact** |
| Base rate 0 → 6,00 % puis recommandation 6,30 % | "moved from 0.00% to 6.00% in six steps... Aug 28–Sep 9" + recommandation "6.00% to 6.30%" (ce post) | **CONFIRMÉ exact** |
| Supply Core 713 M → 661 M | Supply 28 août 713.3M → maintenant 661.1M | **CONFIRMÉ** (arrondi : 713,3→713 ; 661,1→661) |
| Utilisation 63 % → 18 % | Utilization then 63.1% → now 17.8% (Core) | **CONFIRMÉ** (arrondi : 63,1→63 ; 17,8→18) |
| Même mouvement sur Plasma, Monad, Mantle | Plasma -55.2%, Monad -82.2%, Mantle -96.2%, "USDe debt declined on every deployment across that window" | **CONFIRMÉ** |

**Verdict global A.1 : intégralement confirmé, chiffre pour chiffre, aucun écart.** « deux semaines » du mémo
(§4 : « en deux semaines ») correspond à la fenêtre citée par la source « between August 28 and September 9,
2026 » = 12 jours (pas exactement 14, mais dans le langage courant « deux semaines » est une approximation
raisonnable ; signalé pour précision, pas une erreur factuelle sur les chiffres).

---

## A.2 — « Aavethena » / Aave V4 marché Ethena, 7 septembre 2026

**Statut : EXISTE, confirmation PARTIELLE (P1 pour la relation générale, P2 pour la date précise).**

- P1 [lu] : https://aave.com/blog/ethena (blog officiel Aave) — utilise verbatim le nom **« Aavethena »** :
  *"The Aave x Ethena Partnership ('Aavethena')"*. Daté **2025-08-29** (PAS 2026-09-07 — c'est un post plus
  ancien sur le partenariat général, pas l'annonce du nouveau marché). Chiffre verbatim (recherche complémentaire,
  page "Aave 2025 Year in Review") : *"more than 50% of USDe-related assets have been deposited on Aave"* [2nd
  au sens où je n'ai pas ouvert la page complète, uniquement un extrait de résultat de recherche — à re-vérifier
  si cité ailleurs].
- P1 [lu] : https://governance.aave.com/t/hubs-spokes-in-aave-v4/24040 et
  https://governance.aave.com/t/aave-v4-hub-and-spoke-initial-configurations/24233 et
  https://governance.aave.com/t/arfc-aave-v4-activation-on-ethereum-mainnet/24293 — confirment l'architecture
  Hub-and-Spoke d'Aave V4 (mainnet activé ~30 mars 2026 selon presse). **Aucun topic** du forum de gouvernance
  Aave nommé explicitement autour d'un « Ethena Spoke » n'a été trouvé daté du 7 septembre 2026 (recherche
  `governance.aave.com/search.json?q=Ethena%20Spoke`, 27 résultats, aucun ne correspond — le plus proche est
  "Staked USDe (sUSDe) on Aave Monad Assessments", 2026-07-01, hors-sujet V4/Ethereum).
- P2 [lu] : https://www.cryptotimes.io/2026/09/07/aave-v4-activates-usde-rewards-in-new-ethena-market/ — daté
  **2026-09-07**, cite verbatim *"USDe rewards are now live in the dedicated Ethena ecosystem market on Aave V4
  on Ethereum" (Ethena, September 7, 2026)* — attribution à **Ethena** (pas Aave) comme émetteur du communiqué,
  mais l'article ne fournit qu'un lien partiel vers un post Aave ("aave-v4-live-ethereum"), pas de citation
  primaire complète.
- P2 [lu] : https://blockworks.com/insights/ethena-aave-v4-allocation — daté **2026-06-19** (PAS septembre),
  traite de faisabilité d'allocation Ethena→Aave V4, sans confirmer de date de lancement le 7 septembre.

**Ce que je n'ai PAS pu obtenir en P1 direct** : un post officiel Aave (blog ou gouvernance) ou Ethena
(blog/annonce) daté précisément du 2026-09-07 pour CE lancement spécifique. `aave.com/blog/aave-v4-live-ethereum`
existe (trouvé via recherche) mais correspond vraisemblablement au lancement général V4 (~30 mars 2026, cf.
FXStreet daté 2026-03-30), pas à l'ajout du marché Ethena en septembre — non ouvert directement (à faire si
approfondissement demandé). **NON TROUVÉ** (P1 daté exactement) — recommandation : procurement du post Ethena
officiel (X/blog) du 7 septembre 2026 si ce fait doit devenir un chiffre committé.

**Verdict A.2 : « Aavethena » et le marché V4-Ethena EXISTENT bien (P1 pour la relation et l'architecture), mais
la date du 7 septembre 2026 et le cadre « looping ajouté sur ce stock » du mémo reposent sur du P2 non recoupé
en P1 à ce stade.**

---

## A.3 — GHO : le burn passe-t-il par un `Transfer` vers 0x0 ?

**Statut : CONFIRMÉ — OUI, `Transfer(facilitator, 0x0, amount)` est émis, ET `totalSupply` décroît.**
**Ce point CONTREDIT la prudence du mémo (§5, §10) qui dit « pas forcément Transfer(0) ».**

Sources P1 [lu] intégral, code source :
- `https://github.com/aave/gho-core/blob/main/src/contracts/gho/GhoToken.sol` (raw, fetch direct, HTTP 200) :
  ```solidity
  function burn(uint256 amount) external {
    require(amount > 0, 'INVALID_BURN_AMOUNT');
    Facilitator storage f = _facilitators[msg.sender];
    uint256 currentBucketLevel = f.bucketLevel;
    uint256 newBucketLevel = currentBucketLevel - amount;
    f.bucketLevel = uint128(newBucketLevel);
    _burn(msg.sender, amount);
    emit FacilitatorBucketLevelUpdated(msg.sender, currentBucketLevel, newBucketLevel);
  }
  ```
  Seul un facilitator actif (`msg.sender` enregistré) peut appeler `burn()`, et brûle depuis SON PROPRE solde.
- `https://github.com/aave/gho-core/blob/main/src/contracts/gho/ERC20.sol` (raw, fetch direct, HTTP 200) —
  implémentation locale dérivée de Solmate, PAS OpenZeppelin direct :
  ```solidity
  function _burn(address from, uint256 amount) internal virtual {
    balanceOf[from] -= amount;
    unchecked { totalSupply -= amount; }
    emit Transfer(from, address(0), amount);
  }
  ```
- **Vérification déployé (pas seulement GitHub)** : Etherscan, adresse **`0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f`**
  (Ethereum mainnet, confirmée via recherche + WebFetch `etherscan.io/address/...#code`) — **« Source Code
  Verified — Exact Match »**, nom de contrat **`GhoToken`**, compilateur `v0.8.10+commit.fc410830` (200 runs),
  licence MIT. La page confirme le même schéma `burn` → `_burn` → `Transfer(from, address(0), amount)`.

**Lecture** : chaque `burn()` d'un facilitator émet bien `Transfer(facilitator_address, 0x0, amount)` ET
décrémente `totalSupply` — l'identité C1 (Transfer↔0x0 + totalSupply) devrait donc tenir structurellement pour
GHO, puisque c'est le SEUL chemin de code qui réduit `totalSupply` dans ce contrat (pas de fonction alternative
de burn cachée trouvée dans `GhoToken.sol`). **Résidu non résolu** : je n'ai pas audité TOUS les facilitators
(GSM, GSM4626, GhoDirectMinter, Aave V3 Pool facilitator, FlashMinter) pour vérifier qu'ils appellent bien
`GhoToken.burn()` lors d'un rachat utilisateur (et pas, par exemple, un simple transfert vers une adresse morte
sans passer par `burn()`, ce qui NE décrémenterait PAS `totalSupply` et casserait C1 silencieusement côté
facilitator, même si le token lui-même est sain). Ce résidu correspond exactement à la mise en garde du mémo
(« l'adapter peut casser ») et **doit être mesuré empiriquement** (rejouer `eth_getLogs` sur une fenêtre GHO et
vérifier `Transfer→0x0` == Δ`totalSupply`), pas seulement audité au niveau du code du token. Voir aussi
`https://github.com/aave-dao/GhoDirectMinter` (cité par le mémo) — **non ouvert** dans cette passe (NON
TROUVÉ / à lire si C1 doit être mesuré sur ce facilitator spécifique).

---

## A.4 — DAI/USDS : part PSM (LitePSM → USDC) vs vaults CDP

**Statut : CONFIRMÉ pour les deux chiffres cités séparément ; nuance sur le mot « majorité » du mémo.**

Source P1 [lu] (fetch direct réussi via curl + user-agent navigateur, HTTP 200, 138 680 octets, après échec
initial WebFetch → 403) : ARK Invest, *« A Guide To Stablecoins: Multi-Collateral-Backed Stablecoins—DAI, USDS »*,
par Raye Hadi (Research Associate, Digital Assets), publié **25 juin 2026** (pas juste "juin 2026" — date exacte
trouvée en tête d'article), URL du mémo confirmée : https://www.ark-invest.com/articles/analyst-research/multi-collateral-backed-stablecoins-dai-usds.
Note de source interne à l'article : *« Source: ARK Investment Management LLC, 2026, based on data from
SkyEcosystem as of June 11, 2026. »* — donc le **snapshot de données** est daté du **11 juin 2026**, l'article
publié 2 semaines après.

Citations verbatim exactes :
> "As of the latest reserve snapshot, only ~12% of backing for DAI and USDS now comes from core CDP vaults [footnote 14], the majority of the balance is backed by modules like the Spark Liquidity Layer (SLL), Staking Engine, Grove, and stablecoins in the Peg Stability Module (LitePSM), all of which rely more on protocol-controlled liquidity than on market-driven arbitrage."

> "Today, peg stability is managed primarily through the Peg Stability Module (PSM), now known as The LitePSM. The LitePSM refers to the ~30% of reserves in stablecoins, and it allows users to swap between DAI or USDS and USDC at a fixed rate, minus small governance-set fees."

Comparaison au mémo :
| Chiffre mémo | Source ARK Invest | Verdict |
|---|---|---|
| ~12 % vault | "~12% of backing for DAI and USDS now comes from core CDP vaults" | **CONFIRMÉ exact** |
| « majorité PSM → USDC » | LitePSM = **~30%** des réserves en stablecoins (PAS une majorité >50% à elle seule) ; le texte ARK dit que la « majorité du solde » (hors les 12% CDP) est répartie entre **SLL + Staking Engine + Grove + LitePSM** ensemble, pas LitePSM seul | **NUANCE** — le "~12% CDP" est confirmé exact, mais présenter LitePSM/PSM seul comme « majorité » **sur-simplifie** : ARK attribue la majorité à un ENSEMBLE de modules (SLL, Staking Engine, Grove, LitePSM), dont LitePSM n'est qu'une composante à ~30% des réserves. Le mémo devrait dire « ~12% vault, ~30% PSM/LitePSM, le reste (SLL/Staking Engine/Grove) » plutôt que « majorité PSM ». |

Sky/Maker primaire (deuxième source demandée) : https://developers.skyeco.com/guides/psm/litepsm/ (redirection
depuis `developers.sky.money`, suivie, [lu]) — confirme le MÉCANISME (swap DAI/USDS ↔ USDC à taux fixe moins
frais, deux modules `LitePSM-DAI-USDC` et `LitePSMWrapper-USDS-USDC`) mais **ne donne AUCUN pourcentage** de
répartition PSM vs vaults — renvoie vers un dashboard tiers (`https://litepsm.blockanalitica.com`) pour les
stats courantes. Page « last updated 2025-07-15 » (antérieure à juin 2026, donc pas la source des chiffres ARK).
**NON TROUVÉ en P1 Sky direct pour le pourcentage** — seule ARK (qui cite elle-même "SkyEcosystem as of June 11,
2026" comme source de données, sans lien direct fourni dans le texte extrait) donne le chiffre. Le dashboard
`litepsm.blockanalitica.com` n'a pas été interrogé dans cette passe (NON TROUVÉ, piste pour approfondissement).

**Verdict global A.4 : le chiffre ~12% CDP est confirmé exact et daté (snapshot 11 juin 2026, article 25 juin
2026). Le "PSM → USDC" est confirmé comme mécanisme et le ~30% de réserves en stablecoins est confirmé, mais la
qualification « majorité » du mémo mérite la nuance ci-dessus.**

---

## A.5 — Circle USDC : politique de rachat T+1/T+2 ; rythme des burns on-chain

**Statut : PARTIELLEMENT CONFIRMÉ (mécanisme et "next business day" oui ; terminologie explicite "T+1/T+2" NON
TROUVÉE en primaire) ; rythme des burns on-chain = À MESURER (non fait dans cette passe).**

- P1 [lu] : https://developers.circle.com/circle-mint/concepts/how-minting-works — verbatim : **"Payouts
  typically settle on the next business day."** Et (résumé WebSearch de la même famille de pages Circle) : "the
  daily redemption calculation resets at 12pm ET", "domestic wire deposits received before the daily cutoff
  settle on the same business day, while real-time interbank rails settle in seconds" [ce deuxième point est un
  résumé agrégé par l'outil de recherche, PAS une citation directe que j'ai vérifiée moi-même sur la page —
  marqué **[2nd]**, à re-vérifier si utilisé comme chiffre committé].
- P1 [lu] : https://www.circle.com/legal/usdc-terms (fetch direct, HTTP 200, 79 814 caractères de texte) —
  contient de nombreuses clauses "redeem/redemption" mais **AUCUNE mention explicite de "T+1" ou "T+2"** comme
  terme contractuel ; formulation trouvée : *"Circle (or an affiliate designated by Circle) commits to redeem 1
  USDC for 1 USD, subject to [...]"* sans délai chiffré explicite dans le texte extrait.
  Tentative de recherche additionnelle (prospectus SEC Circle Internet Group, Form 424B4, FY2025,
  `sec.gov/Archives/edgar/data/1876042/000119312525135795/d737521d424b4.htm`) : **fetch bloqué (HTTP 403,
  probablement anti-bot SEC)** — NON TROUVÉ, piste non aboutie.
  Page `help.circle.com/s/article/USDC-redemption-structure` (celle qui porte très probablement la distinction
  T+1/T+2 explicite d'après son titre) : **fetch échoué à deux reprises** (WebFetch → page de chargement
  Salesforce vide ; curl avec user-agent navigateur → même page de chargement JS, 201 044 octets sans contenu
  utile) — **NON TROUVÉ**, nécessite un outil de rendu JS (hors budget de cette passe) ou un accès authentifié.
- **Conclusion T+1/T+2** : le mémo affirme "Circle redemption T+1/T+2 (loi USDC...)" comme un fait déjà connu/
  cadré (voir mémo §10, biblio) plutôt que comme un chiffre à vérifier ici point par point ; ce que j'ai pu
  confirmer en P1 est le principe **"next business day"** (cohérent avec "T+1" en substance pour le rail
  bancaire standard), mais je n'ai **pas** trouvé de source primaire employant littéralement "T+1" et "T+2"
  comme deux options distinctes. **Marqué NON TROUVÉ pour la distinction explicite T+1 vs T+2** (à
  procurer : `help.circle.com/s/article/USDC-redemption-structure` via un fetch capable de JS, ou le prospectus
  SEC via un canal non bloqué).
- **Rythme des burns on-chain USDC (Transfer vers 0x0 par Circle)** : **À MESURER** — non fait dans cette passe
  (nécessiterait d'interroger `eth_getLogs` sur le contrat USDC `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
  pour les événements `Transfer` vers `0x0000000000000000000000000000000000000000`, sur une fenêtre de
  plusieurs semaines, et d'observer si le rythme suit les jours ouvrés US). Piste explicitement laissée ouverte
  par la mission (« marque à mesurer »). **NON TROUVÉ / À MESURER**, pas de source substituée.

---
