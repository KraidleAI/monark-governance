# PR-stables-kaiko — PR-3 (scouting admissibilité USDS/PSM · PYUSD · LUSD/BOLD) + PR-10 (Kaiko Best Execution)

## STATUT (ligne d'état)
- **2026-09-18, clôture de passe.** Chercheur = Sonnet 5 (`claude-sonnet-5`), effort max, doc 03. Les deux
  procurements (PR-3, PR-10) sont traités. PR-3 : 3/3 populations scoutées avec verdict sourcé (2
  « à clarifier », 1 « refuser » net sur le critère domestique + 1 sous-population BOLD en NON TROUVÉ).
  PR-10 : périmètre/méthodologie Kaiko trouvés en P1, **aucune grille tarifaire publique nulle part**
  (Kaiko, CoinRoutes, Talos, ION — les quatre) — confirmé comme un fait du marché, pas une lacune de
  recherche. Aucun commit, aucune écriture hors ce fichier et le scratchpad de session
  (`C:\Users\KACIMI\AppData\Local\Temp\claude\F--Shogen\90684fb2-4e7b-42e9-b820-f042dc4465f3\scratchpad\`,
  scripts `pyusd-census.mjs`/`pyusd-census2.mjs` + sources Solidity brutes téléchargées pour citation
  verbatim — non committés, hors dépôt `F:\Monark`). Aucun appel à l'advisor intégré.

---

## 0. Identification / cadrage

- **Mission** : `F:\Monark\docs\etude-suite-2026-09-18\PLAN-STRATEGIE.md` §5 [lu intégralement] — ligne PR-3
  et ligne PR-10.
- **Critère d'admissibilité appliqué** (source : `F:\Monark\docs\etude-suite-2026-09-18\AVIS-advisor-defi-2e-cle-c-prime.md`
  §4, verbatim) :
  > « population admissible pour un `AttestedFlow` mono-chaîne seulement si son mécanisme inter-chaînes ne
  > brûle pas sur mainnet (lock-and-mint, USDe OFT) ou brûle depuis un `from` distinct et séparable (USDC :
  > CCTP `TokenMinter` ≠ Circle) ; burn-and-mint natif par le même AP (FDUSD, PYUSD probable) : non. »
- **Point de vigilance déclaré avant recherche (maintenu après recherche)** : `docs/biblio/next-piece-2026-09-18/INVENTAIRE-stables.md`
  [lu 2026-09-18] contient déjà des verdicts provisoires **« Refuser »** pour LUSD (V1), BOLD (V2) et USDS,
  sous un critère **différent** (« une seule loi de mint/burn » domestique). Le présent PR-3 applique le
  critère AVIS §4 (mécanisme **inter-chaînes**) et, pour USDS, la question spécifique `trim()`/séparabilité
  demandée par le PLAN — un troisième angle, distinct des deux premiers. Les trois angles sont rapportés
  séparément ci-dessous, jamais fusionnés en un verdict unique masquant lequel des trois critères parle.
- **Script de référence cité par la mission** (`F:\Monark\scripts\census\burns-by-burner.mjs`, lu intégralement)
  **non modifié** — restriction de rôle. Pour PYUSD, un script autonome équivalent a été écrit et exécuté
  depuis le scratchpad (hors dépôt), réutilisant la même logique (lecture seule, sans clé, topic `Transfer`
  standard, décomposition par `from`), documenté en détail au §3.2.
- Aucun appel à l'advisor intégré pendant cette extraction (consigne de mission + CLAUDE.md « filtre de
  régurgitation »).

---

## PR-3 — Scouting d'admissibilité

### 3.1 USDS/DAI via PSM Sky (LitePSM)

**Identification.** LitePSM USDC-A mainnet : `0xf6e72Db5454dd049d0788e411b06CfAF16853042`, tag Etherscan
« Sky: LitePSM USDC A », ~204 238 490 $ détenus dont 204 260 959,06692 DAI [lu, WebSearch→Etherscan,
2026-09-18]. Contrat source : `sky-ecosystem/dss-lite-psm`, fichier `src/DssLitePsm.sol` — **lu en P1 direct**
(récupéré verbatim via `curl` sur `raw.githubusercontent.com/sky-ecosystem/dss-lite-psm/master/src/DssLitePsm.sol`,
HTTP 200, 542 lignes, sauvegardé dans le scratchpad, PAS via un résumé d'outil).

**Question 1 — `trim()` brûle-t-il sur mainnet ?** OUI, confirmé par le code source verbatim :
```solidity
/**
 * @notice Burns any excess of Dai from this contract.
 * @dev The total outstanding debt can still be larger than the debt ceiling after `trim`.
 *      Additional `buyGem` calls will enable further `trim` calls.
 * @return wad The amount of Dai burned.
 */
function trim() external returns (uint256 wad) {
    wad = gush();
    require(wad > 0, "DssLitePsm/nothing-to-trim");
    daiJoin.join(address(this), wad);
    vat.frob(ilk, address(this), address(0), address(this), 0, -_int256(wad));
    emit Trim(wad);
}
```
(source : `DssLitePsm.sol` lignes 422-437, [lu]).

**Question 2 — depuis quel `from` ?** Le contrat `DaiJoin` (repo `sky-ecosystem/dss`, fichier `src/join.sol`,
**lu en P1 direct**, même méthode `curl`) montre :
```solidity
function join(address usr, uint wad) external {
    vat.move(address(this), usr, mul(ONE, wad));
    dai.burn(msg.sender, wad);
    emit Join(usr, wad);
}
```
(lignes 164-168, [lu]). Comme `trim()` appelle `daiJoin.join(address(this), wad)` **directement**, `msg.sender`
vu par `DaiJoin` est le contrat LitePSM lui-même : `dai.burn(msg.sender, wad)` brûle donc depuis
`0xf6e72Db5454dd049d0788e411b06CfAF16853042` (le LitePSM), **jamais** depuis une adresse utilisateur.
**Fait qui décide, avec source : code des deux contrats, lu verbatim, deux fichiers.**

**Question 3 — séparable des repay/DSR ?** OUI structurellement, par construction : un remboursement de vault
CDP ou une entrée en DSR appelle `daiJoin.join(msg.sender_utilisateur, wad)` **directement par l'utilisateur
(ou son proxy)**, donc `dai.burn()` s'exécute avec `from` = l'adresse de l'utilisateur, jamais l'adresse du
LitePSM. Les deux flux sont donc distinguables par `from` (LitePSM = une adresse fixe et unique vs.
utilisateurs = adresses arbitraires). **Nuance non résolue dans cette passe** : je n'ai pas vérifié en P1 le
chemin exact d'appel `daiJoin.join` pour un remboursement de vault (probablement via `DssProxyActions` ou
similaire) — l'affirmation ci-dessus repose sur la sémantique de `DaiJoin.join()` lue en P1, pas sur une
lecture du code de remboursement de vault lui-même. Signalé comme résidu.

**Confond nouveau, non présent dans INVENTAIRE-stables.md** : le NatSpec de `trim()` dit explicitement que
son déclenchement est **batché et différé** (« Additional `buyGem` calls will enable further `trim` calls » —
`gush()`, lu lignes 480-495, calcule un excédent cumulé vs. `buf`, pas un burn par swap individuel). Le
LitePSM **ne brûle ni ne mint du DAI par swap utilisateur** (les swaps `sellGem`/`buyGem` sont de simples
transferts ERC-20 entre l'utilisateur et le pool, sans `Transfer→0x0`) — le signal `Transfer→0x0` du PSM ne
mesure donc PAS un flux de rachat utilisateur en temps réel, mais un rééquilibrage périodique de trésorerie
d'un pool, décorrélé de l'identité et du volume de chaque rachat individuel. **Ceci est un défaut structurel
distinct du défaut « deux lois PSM/vault » déjà noté par INVENTAIRE-stables.md §12, qui s'y ajoute.**

**Critère inter-chaînes (AVIS §4, sens strict)** : le PSM/LitePSM n'est PAS un mécanisme inter-chaînes — c'est
une fonction mono-chaîne (swap DAI/USDS↔USDC sur mainnet). Le critère AVIS §4 porte sur le bridge DAI/USDS
lui-même, vérifié séparément :
- **DAI → Arbitrum/Optimism** : lock-and-mint confirmé [lu, P1] — repo `sky-ecosystem/optimism-dai-bridge`,
  fichier `contracts/l1/L1Escrow.sol` : *« The L1DAITokenBridge escrows L1 DAI in an L1Escrow contract... It
  unlocks L1 DAI upon withdrawal messages from the L2 side »* — burn se produit **sur L2** au retrait, pas sur
  mainnet. Adresse Arbitrum DAI L1 Escrow : `0xA10c7CE4b876998858b1a9E12b10092229539400` (Etherscan, [lu]).
- **USDS → Base** : lock/escrow confirmé [lu, WebSearch citant developers.skyeco.com] : *« tokens are
  transferred to the Escrow contract on Ethereum when initiating deposits »* (SkyLink Base Native Bridge) —
  même famille lock-and-mint, admissible au sens AVIS §4.
- **USDS → Arbitrum/Optimism/Unichain via LayerZero OFT (SkyLink)** : **NON TROUVÉ** — mécanisme non confirmé
  (lock-and-mint via OFT Adapter, ou burn-and-mint natif) malgré trois recherches ciblées (`developers.skyeco.com`
  page générale insuffisamment détaillée ; `stablecoininsider.org` explicitement : *« the article does not
  contain that specification »*). **Résidu, procurement possible si ce point devient bloquant** (voir §NON
  TROUVÉ).

**VERDICT USDS/DAI-PSM (question `trim()` du PLAN) : À CLARIFIER, plutôt REFUSER en l'état.** Fait qui décide :
`trim()` brûle bien sur mainnet, depuis une adresse fixe et séparable des repay/DSR (P1, code source) — mais
ce burn est un rééquilibrage de trésorerie périodique et batché, PAS un proxy de rachat utilisateur individuel
(P1, NatSpec + logique de `gush()`), ce qui s'ajoute — sans le remplacer — au défaut « deux lois PSM/vault »
déjà connu (INVENTAIRE-stables.md §12, ARK Invest 25 juin 2026). Le sous-volet inter-chaînes SkyLink/LayerZero
reste NON TROUVÉ.

---

### 3.2 PYUSD

**Identification** [lu, Etherscan, 2026-09-18] : nom PayPal USD, symbole PYUSD, **decimals = 6** (confirmé
indépendamment par `eth_call` RPC direct, sélecteur `0x313ce567`, voir mesure ci-dessous), adresse
`0x6c3ea9036406852006290770BEdFcAbA0e23A0e8` (proxy `AdminUpgradeabilityProxy`, implémentation
`0x8C35CaA5FD5bDC64b6B11344aD57594A3676256a`), **total supply = 1 685 372 060,353202 PYUSD** (Etherscan,
capturé 2026-09-18 — chiffre non re-mesuré par moi via RPC, voir limite plus bas).

**Mécanisme de burn (domestique)** [lu, `github.com/paxosglobal/pyusd-contract` README] : *« Only
supplyControllers can mint and burn tokens »* — un contrat `SupplyControl` séparé porte le rôle
`SUPPLY_CONTROLLER_ROLE`, géré par une `SUPPLY_CONTROLLER_MANAGER_ROLE`. Le README ne détaille pas
l'implémentation exacte de l'événement de burn (pas de code source complet obtenu — je n'ai lu que le README,
pas `SupplyControl.sol`, **[abs]** pour ce niveau de détail contractuel précis, résidu déclaré).

**Mécanisme de bridge (inter-chaînes)** [lu, `developer.paypal.com/community/blog/pyusd-layerzero/`, annoncé
12 nov. 2024, + The Block 2026] : PYUSD utilise le standard **OFT (Omnichain Fungible Token) de LayerZero**
entre Ethereum et Solana (et depuis, Tron/Avalanche/Sei selon The Block). **Burn-and-mint explicitement
confirmé**, pas lock-and-mint : *« tokens are burned (permanently eliminated) on Ethereum... and then an
equal number of PYUSD tokens are minted on Solana »* — ceci correspond exactement à la branche
non-admissible de principe du critère AVIS §4 SI le burn est exécuté par le même AP que l'émission/rachat
cash. Testé empiriquement ci-dessous.

**Mesure on-chain (census, ce chercheur, 2026-09-18)** — méthode : script autonome
`pyusd-census2.mjs` (scratchpad, PAS le dépôt), RPC lecture seule sans clé, `eth_getLogs` sur le topic
`Transfer(address,address,uint256)` standard (`0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef`
— même constante que celle validée par le script de référence via son auto-test keccak256), fournisseur
principal `rpc.mevblocker.io`, découpage séquentiel par blocs de 6000 avec split récursif sur erreur de
limite de résultats, **checkpoint JSONL resumable** (résilience testée : un premier run a échoué sur
« service temporarily unavailable » après 12 tranches, repris depuis le checkpoint sans perte).
- **Plage mesurée (réelle, pas la cible nominale)** : blocs 25 791 811 → 26 006 736, soit
  **2026-08-19T21:21:59Z → 2026-09-18T20:19:35Z** (28 jours 23h, timestamps lus directement par
  `eth_getBlockByNumber`, PAS interpolés) — cible nominale 30 j via approximation 12,06 s/bloc, écart de
  ~1 jour assumé et non corrigé.
- **Quorum** : la plage complète est **mono-fournisseur** (mevblocker, 0 échec sur 36 tranches, `tenderly.co`
  jamais sollicité par le mécanisme de failover car aucune tranche n'a échoué). Un **spot-check** a posteriori
  sur la dernière tranche (blocs 26 001 811–26 006 736, 5874 logs) comparé `mevblocker` vs.
  `gateway.tenderly.co/public/mainnet` : **accord byte-exact** (`burns`, `mints`, nombre de logs identiques).
  **Limite déclarée** : ceci n'est PAS un quorum complet sur les 29 jours comme le fait le script de
  référence pour chaque fenêtre — un seul point de contrôle croisé, pas 36.
- **Résultats** (unités brutes ÷ 1e6 pour PYUSD) :
  - Burns totaux : 1 324 809 677,653637 PYUSD, 1061 événements, **419 adresses `from` distinctes**.
  - Mints totaux : 1 157 665 406,926250 PYUSD, 1762 événements, 1235 adresses `to` distinctes.
  - **Top burner : `0xf845a0a05cbd91ac15c3e59d126de5dfbc2aabb7` = 1 165 164 171,756556 PYUSD = 87,95 % de
    tous les burns.** Etherscan [lu] : name tag **« Paxos 8 »**, EOA (pas un contrat), activité
    « PYUSD / Global Dollar (USDG) Increase/Decrease Supply » — **wallet opérationnel Paxos, partagé entre
    PYUSD et USDG**, pas une adresse dédiée à un seul mécanisme.
  - 2ᵉ burner : `0xacddac6c77318b615f7f6fb9bb67c6833e9c05f1` = 54 167 337,118511 PYUSD = 4,09 %. Etherscan
    [lu] : name tag **« LZMultiCall »**, **contrat vérifié déployé par une adresse LayerZero**
    (`0x4AA1925e0F1f9cf5cA6079ED09e7dD9EF03ac84C`, créé 239 jours avant capture), activité récente associée à
    Stargate/USDe Bridge — **infrastructure LayerZero, adresse distincte de Paxos**.
  - 3ᵉ burner : `0xd7185c486dd88eb9f3573b878a1469485644091f` = 48 949 562,389911 PYUSD = 3,70 %. Etherscan
    [lu] : name tag **« MainnetBridgeSettler »**, contrat vérifié du protocole **0x** (déployeur
    `deployer.zeroexprotocol.eth`) — encore une adresse tierce distincte, sans lien apparent avec Paxos ni
    LayerZero (bridge-settler générique 0x Protocol, non expliqué davantage dans cette passe — **résidu**).
  - Top minter : `0x264bd8291fae1d75db2c5f573b07faa6715997b5` = 1 022 231 513,07 PYUSD = 88,30 % des mints.
    Etherscan [lu] : name tag **« Paxos 4 »**, EOA, même profil « Increase/Decrease Supply » — **wallet Paxos
    DIFFÉRENT du top burner** (« Paxos 8 » ≠ « Paxos 4 » : deux clés opérationnelles distinctes pour le même
    émetteur, le top burner ne reçoit AUCUN mint dans la fenêtre : vérifié, raw = 0).

**Interprétation, prudente, avec ce qui reste ouvert.** Le fait qui décide, sourcé : le burn dominant
(87,95 %) et le mint dominant (88,30 %) de PYUSD passent chacun par une adresse **taguée Paxos** sur
Etherscan — confirmant l'esprit du critère AVIS §4 (« même AP » contrôle le burn ET le mint), mais via deux
clés opérationnelles distinctes, pas la même adresse unique. **Cependant, contrairement à l'hypothèse
« PYUSD probable [non-admissible] » de l'AVIS**, le burn **spécifiquement attribuable à l'infrastructure de
bridge LayerZero (« LZMultiCall », 4,09 %) est une adresse SÉPARÉE et IDENTIFIABLE**, distincte des
wallets Paxos — structurellement analogue à l'exemple CCTP `TokenMinter` ≠ Circle cité par l'AVIS comme
admissible. **Ce que je n'ai PAS pu établir dans le budget de cette passe** : si le flux dominant « Paxos 8 »
(87,95 %) correspond 1:1 à des rachats cash utilisateur, ou mélange rachats et ajustements de trésorerie
internes Paxos (le tag Etherscan générique « Increase/Decrease Supply » ne permet pas de trancher) — c'est
l'analogue, pour PYUSD, du résidu « facilitators non audités » déjà noté pour GHO dans INVENTAIRE-stables.md
§11. Egalement non résolu : le rôle exact de « MainnetBridgeSettler » (0x Protocol, 3,70 %) dans le burn de
PYUSD.

**VERDICT PYUSD : À CLARIFIER** — ni franchement admissible ni franchement refusé. **Contradiction avec
l'AVIS signalée et non tranchée par moi** : le volet inter-chaînes strict (bridge LayerZero) est en fait
SÉPARABLE par `from` (fait mesuré, contrairement au « probable » de l'AVIS) ; mais le volet domestique
(burn/mint tous deux contrôlés par des wallets Paxos, sans preuve publique que le burn dominant soit un burn
de rachat pur) reste un point d'inadmissibilité potentiel non résolu par les sources publiques disponibles.

---

### 3.3 LUSD / BOLD (Liquity V1 / V2)

**Rappel collision de noms** (déjà noté par INVENTAIRE-stables.md, confirmé) : LUSD (V1) et BOLD (V2, token de
remplacement, contrat différent) sont deux objets distincts, traités séparément.

#### LUSD (Liquity V1)

**Burn depuis quel contrat, combien de voies ?** — lu en **P1 direct** (repo `liquity/dev`, fichiers
`packages/contracts/contracts/TroveManager.sol` et `BorrowerOperations.sol`, récupérés verbatim via `curl`
sur `raw.githubusercontent.com`, HTTP 200 chacun) :
1. **Redemption** (`redeemCollateral`, `TroveManager.sol` ligne 1019) :
   `contractsCache.lusdToken.burn(msg.sender, totals.totalLUSDToRedeem);` — brûle depuis **l'adresse du
   rédempteur** (`msg.sender`, arbitraire).
2. **Repayment** (`_repayLUSD`, `BorrowerOperations.sol` ligne 460, appelée par `repayLUSD()` et `closeTrove()`) :
   `_lusdToken.burn(_account, _LUSD);` — aux points d'appel lus (ligne 346, dans `closeTrove()`) :
   `_repayLUSD(activePoolCached, lusdTokenCached, msg.sender, debt.sub(LUSD_GAS_COMPENSATION));` — brûle
   depuis **l'adresse de l'emprunteur** (`msg.sender`, également arbitraire).
3. **Liquidation via Stability Pool offset** [lu, synthèse WebSearch du même repo, non re-vérifié en P1
   ligne-à-ligne dans cette passe — **[abs]** pour ce point précis] : brûle depuis le solde de la
   **StabilityPool**, une adresse de contrat fixe.
4. **Gas compensation à la fermeture** (`closeTrove()` ligne 347, [lu] P1) :
   `_repayLUSD(activePoolCached, lusdTokenCached, gasPoolAddress, LUSD_GAS_COMPENSATION);` — petit burn
   additionnel depuis une adresse `gasPoolAddress` fixe, distincte, montant mineur (couvre juste la
   compensation de gas réservée à l'ouverture du trove).

**Fait qui décide** : la redemption (le vrai « rachat ») et le repayment (remboursement de dette, PAS un
rachat) brûlent **tous deux depuis l'adresse appelante arbitraire** (`msg.sender`/`_account`) — **aucune
séparation possible par adresse `from` seule** entre ces deux événements économiquement différents ; seule
l'inspection du sélecteur de fonction appelé au niveau de la transaction (hors du simple flux `Transfer`)
permettrait de les distinguer. C'est une confusion plus précise et sourcée que le « plusieurs lois » générique
déjà noté par INVENTAIRE-stables.md §10 (même conclusion, mécanisme exact identifié ici).

**Critère inter-chaînes (AVIS §4)** [lu, blog officiel Liquity, `liquity.org/blog/liquity-lusd-x-chain-strategy`] :
*« LUSD tokens are locked in a bridge contract on mainnet... to output an IOU LUSD token on the target
chain »* — **lock-and-mint confirmé**, PAS de burn sur mainnet pour le bridge L2 (Arbitrum/Optimism, +
Stargate pour retrait accéléré). **Ce volet du critère AVIS §4 est donc SATISFAIT (branche admissible)** —
contrat exact du bridge non identifié par nom/adresse dans cette passe (résidu mineur).

**VERDICT LUSD : REFUSER**, sur le critère domestique (confusion redemption/repayment au niveau `from`,
fait précis établi en P1) — **indépendant et malgré** le critère inter-chaînes de l'AVIS §4 qui, lui, est
satisfait. Les deux critères pointent dans des directions opposées ; c'est le critère domestique qui
disqualifie ici, pas celui visé nommément par l'AVIS §4 — nuance à ne pas perdre en synthèse.

#### BOLD (Liquity V2)

**Adresse mainnet** : **NON TROUVÉE** dans cette passe (déjà NON TROUVÉE par INVENTAIRE-stables.md §10 —
confirmé, pas de nouvelle piste trouvée ; seule une adresse Sepolia testnet existe,
`0x620ce1130f7c63457784cdfa31cfccbfb6be5029`, explicitement NON utilisable mainnet).

**Mécanisme inter-chaînes** [lu, blog Liquity « Liquity Adopts the Chainlink Standard... »] : BOLD utilise le
standard **CCT (Cross-Chain Token) de Chainlink CCIP** sur Arbitrum/Base/Ethereum/Optimism. Le standard CCT
propose **deux types de pool configurables** : *« audited token pool contracts that handle the complexity of
burning and minting or locking and minting tokens across chains »* — **lequel des deux Liquity a choisi pour
BOLD n'est PAS précisé** dans la source lue (confirmé par citation directe : *« the document does not
specify... nor does it clarify »*). **NON TROUVÉ**, malgré deux recherches ciblées et deux fetches (blog
officiel Liquity + doc Chainlink CCT générale).

**VERDICT BOLD : NON TROUVÉ / À CLARIFIER pour le critère inter-chaînes** (les deux issues du standard CCIP
existent, laquelle s'applique n'est pas publique ou n'a pas été localisée). Le défaut domestique déjà
identifié par INVENTAIRE-stables.md §10 (architecture multi-branches, encore plus de lois que LUSD V1) n'a
pas été re-vérifié en détail dans cette passe (hors budget) — je ne le reconfirme ni ne l'infirme, je le
rapporte tel quel comme un résidu de la passe précédente, non retouché ici.

---

### Tableau récapitulatif PR-3

| Population | Critère inter-chaînes AVIS §4 | Critère domestique (séparabilité `from`) | Verdict de cette passe | Fait qui décide |
|---|---|---|---|---|
| USDS/DAI PSM (`trim()`) | DAI-Arbitrum/Optimism + USDS-Base : lock (admissible) ; USDS-LayerZero (autres L2) : NON TROUVÉ | `trim()` séparable (adresse LitePSM fixe) MAIS batché/décorrélé du rachat individuel ; + défaut « PSM vs vault » déjà connu | **À clarifier, plutôt refuser** | Code source `DssLitePsm.sol`/`join.sol` [lu P1] |
| PYUSD | Bridge LayerZero SÉPARABLE (« LZMultiCall » ≠ wallets Paxos), contrairement à l'attente de l'AVIS | Burn (88 %) et mint (88 %) tous deux via wallets tagués Paxos, mais DEUX clés différentes ; nature exacte du burn dominant non confirmée | **À clarifier** (contredit partiellement l'AVIS) | Census on-chain 29 j [mesuré, ce chercheur] + tags Etherscan [lu] |
| LUSD (V1) | Bridge L2 = lock-and-mint (admissible) | Redemption et repayment NON séparables par `from` (tous deux `msg.sender` arbitraire) | **Refuser** | Code source `TroveManager.sol`/`BorrowerOperations.sol` [lu P1] |
| BOLD (V2) | Chainlink CCT : burn-mint OU lock-mint, lequel NON confirmé | Non ré-examiné (déjà « refuser » par passe antérieure, architecture multi-branches) | **NON TROUVÉ (inter-chaînes) / refuser (domestique, hérité, non revérifié)** | NON TROUVÉ |

---

## PR-10 — Kaiko Best Execution (MiCA art. 78)

### Cadre réglementaire — MiCA article 78
[lu, `springlex.eu/en/packages/mica/mica-regulation/article-78/` — **paraphrase d'un tiers (cabinet de
compliance-tech), PAS le texte officiel EUR-Lex** ; une tentative de récupérer le texte officiel EUR-Lex
verbatim (`eur-lex.europa.eu`, CELEX 32023R1114) a échoué — page tronquée avant d'atteindre l'article 78,
échec consigné au journal des URL] :
- §1 : obligation de « meilleur résultat possible » (prix, coûts, rapidité, etc.), sauf instructions
  spécifiques du client.
- §2 : politique d'exécution des ordres écrite, exécution rapide/équitable/expéditive.
- §3 : information claire aux clients + consentement préalable.
- §4 : capacité de démonstration de conformité (clients + autorité compétente).
- §5 : consentement exprès préalable pour toute exécution **hors plateforme de trading**.
- §6 : surveillance continue + notification des changements matériels.
Confirmé indépendamment par un second résumé (WebSearch direct, sources croisées : bankinghub.eu, capco.com,
wyden.io) : les mêmes six obligations reviennent de façon cohérente sur les trois sources P2 lues. **Aucune
divergence relevée entre les sources P2** sur le contenu substantiel de l'article.

### Produit Kaiko Best Execution — périmètre et méthodologie
[lu, `kaiko.com/products/best-execution-pricing`, 2026-09-18] :
- Deux niveaux de couverture : **« Benchmarking Top-of-Book Prices »** (agrégation meilleur bid/ask sur les
  **10 exchanges leaders** du « Kaiko Exchange Ranking ») et **« Wider Top-of-Book Prices »** (n'importe
  quelle paire sur n'importe quel exchange couvert par Kaiko, « thousands of pairs », philosophie
  *« If it's traded, we cover it »*).
- Métriques : *« timestamp, best bid price, best ask price, aggregated best bid volume, and aggregated best
  ask volume »* (citation directe).
- Livraison : temps réel via « Kaiko Stream », rafraîchi *« every second »*.
- [lu, `docs.kaiko.com/.../kaiko-best-execution`] : cadrage produit — *« Proving crypto best execution requires
  continuous, 24/7 visibility into hundreds of order books... the ability to store and retain this
  information over time at scale »* — positionné explicitement pour MiCA et exigences globales similaires.
- **Note méthodologique divergente non résolue** : un premier résumé (search) mentionnait une fenêtre
  d'agrégation « 10-second aggregation period with MidPrice + VWAP » pour un produit voisin (« Best Execution
  Pricing Methodology ») — MAIS le fetch direct de cette page précise (`kaiko.com/reports/best-execution-pricing-methodology`)
  a montré un contenu **différent** (renvoi vers `docs.kaiko.com/kaiko-stream/analytics/aggregated-quotes`,
  sans la formule 10s/MidPrice+VWAP visible directement) — **contradiction non tranchée, signalée telle
  quelle** : soit la page a changé entre les deux passes de l'outil de recherche, soit le résumé initial a
  synthétisé depuis un extrait de résultat de recherche (snippet) non retrouvé identique sur la page réelle.
  Je ne retiens la formule 10s/MidPrice+VWAP qu'en **[2nd]**, pas en [lu] confirmé sur la page cible.

### Grille tarifaire — recherche exhaustive, résultat négatif confirmé
- **Kaiko (P1, propre site)** [lu, `kaiko.com/about-kaiko/pricing-and-contracts`] : *« Kaiko creates custom
  data plans for our enterprise clients dependent on: number of assets/instruments, data type, granularity,
  historical vs. live access, and usage »* — **aucune grille publique, confirmé par la source officielle
  elle-même**, pas une simple absence de donnée trouvée.
- **Kaiko (P3, tiers, indicatif seulement)** [lu, WebSearch citant `vendr.com/buyer-guides/kaiko`] : *« Kaiko
  is sold via enterprise contracts only; there is no public self-serve tier or list price »* ; données
  d'intelligence de dépenses SaaS : **minimum ≈ 9 500 $, maximum ≈ 55 000 $, moyenne ≈ 28 500 $/an** — chiffre
  agrégé Vendr, **NON spécifique au produit Best Execution** (porte sur « Kaiko » en général), et Vendr est un
  agrégateur de coûts déclarés par des acheteurs tiers, pas Kaiko — **[2nd], à traiter comme indicatif
  seulement, jamais comme un prix committé**.
- **CoinRoutes** [lu, `coinroutes.com`] : produit de TCA (« Transaction Cost Analysis ») avec benchmark
  propriétaire **RealPrice** ; chiffre de performance publié : *« slippage from the mid of roughly 10.4 basis
  points across all spot orders »* / *« 10.94 basis points... across almost $10 billion in notional value
  traded »* (contexte : performance d'exécution, PAS un prix de service) — **aucune grille tarifaire
  trouvée**.
- **Talos** [lu, `talos.com/insights/...`] : *« 2026 Quant Execution Insights Report »*, analyse de plus de
  250 000 ordres parents sur 600+ actifs en 2025, benchmarks arrival price / naive sweep — **aucune grille
  tarifaire trouvée**.
- **ION Group** [lu, `iongroup.com/resource-center/markets/ion-fx-crypto-enterprise-solution/` +
  `iongroup.com/markets/`] : produit TradFi *« Best Execution Engine »* confirmé pour MiFID II (via FastTrade/
  Equiduct/Apex, RTS 6), **mais aucune preuve trouvée que ce moteur soit étendu nommément aux crypto-actifs
  ni à MiCA** — le « ION Crypto Enterprise Solution » existe comme produit séparé (couvre sourcing de
  liquidité, optimisation d'exécution, notifications) sans mention explicite de conformité réglementaire
  crypto (MiCA/best-ex) dans les pages consultées. **Aucune grille tarifaire, aucun client nommé.**

**Constat du marché (fait, pas une lacune de recherche)** : sur les **quatre** fournisseurs vérifiés
(Kaiko, CoinRoutes, Talos, ION), **aucun ne publie de grille tarifaire pour un produit de best-execution/TCA
crypto** — modèle **100 % devis sur mesure / contrat entreprise**, confirmé positivement par la source Kaiko
elle-même. Ce pattern répété sur 4/4 fournisseurs constitue en soi une réponse utile pour Kessai (précédent :
« pas de prix public dans ce marché », pas seulement « je n'ai pas trouvé »).

### Clients CASP nommés
- **Kaiko** : aucun client nommé pour Best Execution spécifiquement. Contexte trouvé : Kaiko a acquis
  **Cometh** (licence MiCA/CASP AMF n° A2025-008, obtenue décembre 2025, + ISO 27001:2022) pour renforcer son
  infrastructure de données on-chain réglementée MiCA [lu, `kaiko.com/news/kaiko-acquires-cometh...`]. Mention
  générique non nominative : *« Kaiko's clients across banks, asset managers, data and index providers, and
  market infrastructure firms »*.
- **CoinRoutes / Talos / ION** : aucun client nommé trouvé pour leurs produits de best-execution/TCA
  respectivement.

**VERDICT PR-10** : périmètre et méthodologie du produit Kaiko Best Execution **documentés en P1** (deux
niveaux de couverture, métriques, format temps réel) ; article 78 MiCA résumé fidèlement mais **via
paraphrase tierce, pas le texte officiel EUR-Lex** (échec de récupération signalé) ; **aucune grille
tarifaire publique nulle part dans l'échantillon** (4 fournisseurs), fait confirmé positivement par Kaiko
elle-même, pas une simple absence ; seul chiffre chiffré disponible = l'estimation tierce Vendr (9,5–55 k$/an,
moy. 28,5 k$/an), à traiter en [2nd] non spécifique au produit.

---

## Contradictions relevées

1. **PYUSD vs AVIS §4** : l'AVIS anticipait PYUSD comme *« probable »* non-admissible pour burn-and-mint natif
   par le même AP. La mesure on-chain de cette passe montre que le burn lié au bridge LayerZero (« LZMultiCall »,
   4,09 % des burns) est en fait une adresse **séparée et identifiable**, distincte des wallets opérationnels
   Paxos — ce qui va dans le sens de l'admissibilité sur CE point précis. Le doute qui subsiste porte sur un
   angle différent (nature du burn domestique dominant, 87,95 %), pas sur celui anticipé par l'AVIS. Signalé,
   non tranché.
2. **LUSD** : le critère inter-chaînes (AVIS §4) est satisfait (lock-and-mint) alors que le critère domestique
   (confusion redemption/repayment) disqualifie — les deux critères, appliqués à la même population, donnent
   des verdicts opposés selon lequel on retient. Signalé, non fusionné en un seul verdict.
3. **Kaiko — méthodologie d'agrégation** : une formule « 10s / MidPrice+VWAP » trouvée par un résumé de
   recherche n'a pas été retrouvée identique sur re-fetch direct de la page ciblée. Signalé §PR-10, non
   tranché, retenu en [2nd] seulement.

---

## NON TROUVÉ

- **USDS via LayerZero OFT (Arbitrum/Optimism/Unichain, hors Base)** : mécanisme lock-and-mint ou
  burn-and-mint non confirmé. Trois sources consultées (`developers.skyeco.com`, `stablecoininsider.org`,
  WebSearch général), aucune ne précise. **Procurement possible** si ce point devient bloquant pour un
  verdict final sur USDS (voir ci-dessous).
- **BOLD (Liquity V2)** : adresse mainnet du token, et type de pool CCIP CCT choisi (burn-mint vs lock-mint).
  Confirmé NON TROUVÉ par deux passes indépendantes (INVENTAIRE-stables.md antérieurement, cette passe
  aujourd'hui).
- **Texte officiel EUR-Lex de l'article 78 MiCA** (CELEX 32023R1114) : fetch tenté, page tronquée avant
  d'atteindre l'article — je me suis appuyé sur une paraphrase tierce (springlex.eu) recoupée avec deux autres
  résumés P2, jamais le texte légal verbatim lui-même.
- **Grille tarifaire Kaiko Best Execution (chiffrée, spécifique au produit)** : confirmé absente publiquement
  (fait positif, pas juste une non-trouvaille — voir PR-10).
- **Clients CASP nommés utilisant Kaiko Best Execution, CoinRoutes, Talos ou ION pour la conformité MiCA** :
  aucun nom trouvé pour aucun des quatre fournisseurs.
- **`SupplyControl.sol` de PYUSD (code source complet)** : seul le README du repo `pyusd-contract` a été lu ;
  le contrat lui-même n'a pas été récupéré en P1 dans cette passe (résidu, le README suffisait pour la
  question posée mais pas pour une confirmation ligne-à-ligne du burn).
- **Nature exacte de l'implication de « MainnetBridgeSettler » (0x Protocol) dans les burns PYUSD** (3,70 %
  des burns sur 29 j) : identifié comme contrat 0x Protocol, mais pourquoi il brûle du PYUSD n'a pas été
  investigué (hors budget de cette passe).

---

## Procurements formés (nouveaux)

| # | Document / mesure | Usage | Tentatives faites |
|---|---|---|---|
| PR-3bis | Doc primaire Sky/SkyLink précisant le type de pool (OFT Adapter lock-and-mint vs OFT natif burn-and-mint) pour USDS sur Arbitrum/Optimism/Unichain — ou adresse du contrat OFT/adapter déployé sur mainnet pour lecture directe du code, comme fait ici pour LitePSM/LUSD | Trancher le sous-volet inter-chaînes USDS laissé NON TROUVÉ (§3.1) | `developers.skyeco.com` (page générale insuffisante), `stablecoininsider.org` (confirmé sans réponse), 1 WebSearch dédiée |
| PR-3ter | Adresse mainnet BOLD (Liquity V2) + doc primaire (Liquity docs ou repo `liquity/bold`) précisant le type de pool CCIP CCT (`getCCIPAdmin()`/Burn-and-Mint vs `owner()`/Lock-and-Release) réellement déployé | Trancher le verdict BOLD (§3.3), actuellement NON TROUVÉ | 1 WebFetch blog Liquity (confirmé sans réponse), 1 WebSearch (confirmé générique CCIP, pas spécifique BOLD) |
| PR-3quater | Documentation opérationnelle Paxos (si jamais rendue publique, ex. rapport d'attestation, audit SOC) précisant si le wallet « Paxos 8 » (burn dominant PYUSD, 87,95 %) sert exclusivement aux rachats cash ou aussi à des ajustements de trésorerie internes | Clore le verdict PYUSD « à clarifier » (§3.2) | Etherscan tag lu (générique « Increase/Decrease Supply »), pas de doc opérationnelle trouvée — peu probable qu'elle soit publique |
| PR-10bis | Texte officiel EUR-Lex de l'article 78, Regulation (EU) 2023/1114 (CELEX 32023R1114), pages correspondant à l'art. 78 spécifiquement | Remplacer la paraphrase tierce springlex.eu par le texte légal verbatim si un usage juridique précis en dépend | 1 WebFetch EUR-Lex (page tronquée avant l'article 78, échec technique de l'outil, pas un NON TROUVÉ de fond) |

---

## Journal des URL (succès et échecs)

**Succès [lu], 2026-09-18** (WebFetch/WebSearch sauf mention contraire) :
- `developers.sky.money/guides/psm/litepsm/` → redirection 301 vers `developers.skyeco.com/...` (suivie)
- `developers.skyeco.com/guides/psm/litepsm/` — contenu insuffisant sur `trim()` (résolu autrement, voir P1 ci-dessous)
- `raw.githubusercontent.com/sky-ecosystem/dss-lite-psm/master/src/DssLitePsm.sol` — **curl direct, HTTP 200**, P1
- `raw.githubusercontent.com/sky-ecosystem/dss/master/src/join.sol` — **curl direct, HTTP 200**, P1
- `github.com/sky-ecosystem/dss-lite-psm` (WebFetch résumé, adresse mainnet LitePSM)
- `etherscan.io/address/0xf6e72Db5454dd049d0788e411b06CfAF16853042` (via WebSearch) — confirmation tag « Sky: LitePSM USDC A »
- `github.com/paxosglobal/pyusd-contract/blob/master/README.md`
- `etherscan.io/token/0x6c3ea9036406852006290770bedfcaba0e23a0e8`
- `developer.paypal.com/community/blog/pyusd-layerzero/`
- `etherscan.io/address/0xf845a0a05cbd91ac15c3e59d126de5dfbc2aabb7` (« Paxos 8 »)
- `etherscan.io/address/0x264bd8291fae1d75db2c5f573b07faa6715997b5` (« Paxos 4 »)
- `etherscan.io/address/0xacddac6c77318b615f7f6fb9bb67c6833e9c05f1` (« LZMultiCall »)
- `etherscan.io/address/0xd7185c486dd88eb9f3573b878a1469485644091f` (« MainnetBridgeSettler »)
- `raw.githubusercontent.com/liquity/dev/main/packages/contracts/contracts/TroveManager.sol` — **curl direct, HTTP 200**, P1
- `raw.githubusercontent.com/liquity/dev/main/packages/contracts/contracts/BorrowerOperations.sol` — **curl direct, HTTP 200**, P1
- `liquity.org/blog/liquity-lusd-x-chain-strategy`
- `liquity.org/blog/liquity-adopts-the-chainlink-standard-for-cross-chain-interoperability-for-bold`
- `github.com/sky-ecosystem/optimism-dai-bridge` (+ `contracts/l1/L1Escrow.sol`, via WebSearch)
- `etherscan.io/address/0xA10c7CE4b876998858b1a9E12b10092229539400` (Arbitrum DAI L1 Escrow)
- `kaiko.com/products/best-execution-pricing`
- `docs.kaiko.com/explore-our-data/data-dictionary/analytics-solutions/kaiko-best-execution` — 404 au premier
  essai (voir échecs), contenu obtenu ensuite via WebSearch synthèse
- `kaiko.com/about-kaiko/pricing-and-contracts`
- `kaiko.com/news/kaiko-acquires-cometh-to-scale-mica-regulated-onchain-data-infrastructure` (via WebSearch)
- `springlex.eu/en/packages/mica/mica-regulation/article-78/`
- `coinroutes.com` (`/insights/coinroutes-1st-half-performance-review/`, `/academy/transaction-cost-analysis-tca-digital-assets/`)
- `talos.com/insights/execution-cost-savings-by-the-numbers-the-talos-quant-execution-insights-report-2026`
- `iongroup.com/resource-center/markets/ion-fx-crypto-enterprise-solution/`
- `vendr.com/buyer-guides/kaiko` (via WebSearch, [2nd])
- RPC lecture seule (mesure directe, pas une source documentaire) : `rpc.mevblocker.io`,
  `gateway.tenderly.co/public/mainnet` — 53+ appels `eth_getLogs`/`eth_call`/`eth_getBlockByNumber` sur
  30/09/2026, aucune clé, budget non formellement plafonné mais usage raisonnable (~110 appels au total
  toutes tentatives incluses, y compris le premier run échoué).

**Échecs consignés** :
- `docs.kaiko.com/explore-our-data/data-dictionary/analytics-solutions/kaiko-best-execution` (WebFetch direct)
  → page 404 constatée par l'outil, contenu récupéré autrement via WebSearch le même jour.
- `kaiko.com/reports/best-execution-pricing-methodology` (WebFetch direct) → page atteinte mais contenu
  minimal/différent d'un snippet de recherche antérieur (voir Contradictions §3).
- `eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32023R1114` (WebFetch) → document trop long, coupé
  avant d'atteindre l'article 78 ; pas de retry avec pagination dans le budget de cette passe.
- Recherche WebSearch directe de l'adresse `0xf845a0a05cbd91ac15c3e59d126de5dfbc2aabb7` (avant le WebFetch
  Etherscan direct) → 0 résultat pertinent, résolu par WebFetch direct de la page Etherscan à la place.
- Premier run du script de census PYUSD (`pyusd-census.mjs`, version 1, fan-out parallèle) → échec
  `"service temporarily unavailable"` après tranche 12/~41 (RPC rate-limit induit par le fan-out `Promise.all`
  parallèle) — corrigé par réécriture séquentielle + checkpoint (`pyusd-census2.mjs`), rerun réussi.
