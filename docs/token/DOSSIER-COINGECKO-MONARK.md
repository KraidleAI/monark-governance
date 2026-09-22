# DOSSIER — Listing CoinGecko du token MONARK (Solana)

**Modèle** : `claude-sonnet-5` (Sonnet 5, effort max) — Gate 0 satisfait en tête de la réponse
de la mission. **Rôle** : chercheur documentaire (lecture seule sur les dépôts produit ;
écriture uniquement dans `F:\Monark\docs\token\`). **Date de constitution** : 2026-09-22,
fenêtre de recherche 15:12–16:00 UTC environ. **Aucune clé, aucun compte CoinGecko/X/GitHub
créé, aucun formulaire soumis, aucun achat.**

Entrée : `F:\Monark\docs\token\FAITS-coingecko-listing-2026-09-22.md` (orchestrateur, [lu]
15:07 UTC). Journal exhaustif des URL et des échecs : `F:\Monark\docs\token\SOURCES-coingecko.md`
(à lire en complément — ce dossier n'y duplique pas les citations déjà journalisées en détail).

Discipline : chaque chiffre porte son niveau ([lu]/[abs]/[2nd]), sa classe (P1/P2/P3), sa
localisation (URL + horodatage de lecture) et — pour les prix/liquidité/holders — la mention
explicite **« valeur du jour »**. Tout ce qui n'est pas prouvé on-chain ou par une source
officielle est marqué **« à confirmer par l'investisseur »**. « NON TROUVÉ » est utilisé sans
détour quand une donnée n'a pas pu être obtenue par les méthodes autorisées.

---

## 0. Identification (résumé, détail des sources en §1 et dans SOURCES-coingecko.md)

| Champ | Valeur | Niveau / classe | Source |
|---|---|---|---|
| Nom | MONARK | [lu] P1 | site, X, pump.fun, ClawPump (5 sources convergentes) |
| Ticker | MONARK (affiché aussi `$MONARK`) | [lu] P1 | site (« one token, one ticker »), X bio (« $MONARK ») |
| Chaîne | Solana | [lu] P1 | mint format, pump.fun (`chain_id":"solana:...`) |
| Programme du mint | **Token-2022** (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`) — PAS le programme SPL Token classique | [lu] P1 | pump.fun, bloc JSON scopé par `pool_address` identique à la tâche |
| Mint | `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` | [lu] P1 | tâche, `out/mint.txt`, site `/token`, X bio — 4 sources identiques |
| Décimales | **6** | [lu] P1 | pump.fun (`"base_decimals":6`, bloc scopé par `pool_address` = pool de la tâche) — NON obtenu via Solscan/SolanaFM/Solana Explorer (§8 SOURCES, échecs techniques documentés) |
| Total supply (brut) | `1000000000000000` unités de base ÷ 10⁶ = **1 000 000 000 (1 milliard) MONARK** | [lu] P1 | pump.fun (`"total_supply"`/`"total_supply_str"`) ; corroboré par un calcul indépendant FDV/prix sur GeckoTerminal (voir §4) |
| Pool PumpSwap (tâche) | `GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg` | [lu] P1 | tâche, confirmé identique dans le JSON pump.fun (`pump_swap_pool`) |
| Créé le | 2026-09-10T14:10:0{4–6}Z | [lu] P1 | pump.fun `created_timestamp` (1789049406000) ET ClawPump `dateCreated` (2026-09-10T14:10:04.244064) — deux sources indépendantes, écart de 2 s |
| Adresse créateur | `BQPsJEawxaostAfQ3USyLBHkdLiEQ46Py6CkDFHyk3QV` | [lu] P1 | pump.fun (`"creator"`). Solde du wallet : **NON TROUVÉ** (ClawPump l'affiche mais en chargement client, non rendu serveur) |
| Contrat de vesting | Streamflow, `63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn` | [lu] P1 (existence et adresse) | Linktree officiel ET page ClawPump, deux sources indépendantes convergentes. Montant verrouillé/cliff/bénéficiaire : **NON TROUVÉ** (page Streamflow = coquille SPA sans rendu serveur) |
| Site officiel | https://monarkgate.tech (+ `/token`) | [lu] P1 | tâche, confirmé actif |
| Site déclaré par pump.fun | `https://agents.clawpump.tech/marketplace/agents/d47b930f-b54e-42a6-964c-62238264e2d0` | [lu] P1 | pump.fun (`"website"`) — **diffère de monarkgate.tech, contradiction non tranchée, voir §Contradictions** |
| GitHub public | **https://github.com/KraidleAI/monark** | [lu] P1, 4 sources convergentes | voir §1.7 |
| X officiel | **https://x.com/usemonark** | [lu] P1, 5 sources convergentes | voir §1.8 |
| Telegram officiel | **NON TROUVÉ** (aucun sur le site, ni Linktree, ni pump.fun, ni GitHub) | — | voir §1.8 |
| Linktree officiel | https://linktr.ee/monarkgate | [lu] P1 | référencé nommément par le README GitHub public (« Everything else ») |

---

## 1. Champs du formulaire CoinGecko « New Coin/Token Listing »

Le formulaire lui-même est derrière connexion (Partners Platform) : je n'y ai pas accédé (pas
de compte créé, conformément à la discipline). La liste de champs ci-dessous s'appuie sur (a)
les catégories de champs explicitement nommées par l'article Fast Pass « Coin Update »
(« Logo Update », « Project Name/Crypto Symbol Update », « Website URL/Community URL/Whitepaper
URL/Github URL Update », « Project Content/Description Update », « New Listing on
Exchanges/New Market Addition », « New Contract Addition » — [lu], support.coingecko.com,
article 37298264234649) et (b) le guide de soumission [lu] (articles 7291312302617 et
33084534107289), qui décrit le parcours mais ne republie pas la maquette exacte du formulaire
(« Fields marked with an asterisk (*) are mandatory » — sans lister les noms de champs eux-mêmes,
puisqu'ils sont uniquement visibles connecté). **Le détail champ-par-champ ci-dessous est donc du
[abs]/reconstruction raisonnée pour la liste des champs elle-même (structure), mais les VALEURS
proposées pour chaque champ sont [lu] de première main.**

### 1.1 Nom du projet
**MONARK**. [lu] P1 (site, X, pump.fun, ClawPump, GitHub — cohérent partout).

### 1.2 Ticker / symbole
**MONARK** (parfois affiché `$MONARK` sur X/pump.fun/Linktree/ClawPump). [lu] P1. Le site dit
littéralement « one token, one ticker » sans jamais épeler le symbole autrement que par le nom
du projet — cohérent, pas d'ambiguïté trouvée.

### 1.3 Chaîne / réseau
**Solana**. [lu] P1 (format d'adresse, `chain_id":"solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"` lu sur pump.fun).

### 1.4 Adresse du contrat (mint)
`FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT`. [lu] P1, identique dans 4 sources indépendantes
(tâche, `out/mint.txt`, site `/token`, bio X, JSON pump.fun).

**Point d'attention** : le mint tourne sur le programme **Token-2022**
(`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`), pas le programme SPL Token classique
(`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`, qui lui sert de `quote_token_program` pour le
wSOL dans la même page). Un mint Token-2022 peut porter des extensions (transfer fee, transfer
hook, permanent delegate, non-transferable, etc. — ce dépôt lui-même les gère pour d'autres
mints dans `apps/bell/src/supply.ts`). **Aucune extension Token-2022 de MONARK n'a été vérifiée
ici** (nécessiterait un `getAccountInfo` jsonParsed direct, hors périmètre « pages HTML publiques
seulement » de cette mission) → **NON TROUVÉ, à vérifier avant toute déclaration de supply
« propre » à CoinGecko**, une extension non détectée (ex. transfer fee) pourrait fausser
l'interprétation du solde brut lu ailleurs.

### 1.5 Décimales
**6**. [lu] P1, pump.fun, bloc JSON explicitement scopé par le `pool_address`
(`GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg`, identique à la tâche) donc sans ambiguïté
d'attribution : `"base_decimals":6,"quote_decimals":9` (le quote = SOL, 9 décimales, cohérent
avec la convention SOL bien connue — recoupement de cohérence interne).

**Écart de méthode signalé** : la tâche demandait des décimales « lues sur l'explorateur »
(Solscan/SolanaFM/Solana Explorer). Les trois ont échoué par une limite technique différente
chacun (détail exhaustif en `SOURCES-coingecko.md` §8) : Solscan et le pool-account rendent
`accountInfo:null` côté serveur (SPA hydratée uniquement côté client) ; SolanaFM sert une coquille
d'export statique sans aucune donnée ; Solana Explorer a opposé une page **« Vercel Security
Checkpoint »** (barrage anti-bot, traité comme un CAPTCHA — **non contourné**, conformément à la
règle absolue). La valeur de 6 décimales vient donc de pump.fun (la plateforme d'émission
elle-même), pas d'un des trois explorateurs nommés — écart méthodologique assumé et documenté,
pas dissimulé.

### 1.6 Total supply / Circulating supply / Max supply
- **Total supply : 1 000 000 000 (1 milliard) MONARK.** [lu] P1, pump.fun
  (`"total_supply":1000000000000000` en unités de base ÷ 10⁶ décimales). **Corroboration
  indépendante** : sur GeckoTerminal, `FDV = $77,994.53` et `prix unitaire =
  $0.000077994531343038956...` (JSON-LD [lu]) → `FDV / prix ≈ 999 999 977 ≈ 1 000 000 000` —
  calcul fait par moi à partir de deux nombres copiés tels quels, pas un champ « total supply »
  affiché directement par GeckoTerminal ; présenté comme calcul, pas comme citation.
- **Max supply** : rien d'indiquant un supply-cap distinct du total supply (pas de mécanisme de
  mint/burn dynamique mentionné). Cohérent avec un template pump.fun standard (supply fixe à la
  création). **NON confirmé explicitement comme « fixe pour toujours »** — pas de lecture des
  autorités de mint (mint authority) qui permettrait de l'affirmer avec certitude on-chain.
- **Circulating supply : NON TROUVÉ / non calculable précisément.** Deux exercices distincts,
  À NE PAS CONFONDRE :
  1. **Méthodologie CoinGecko officielle** ([lu] par l'orchestrateur, `coingecko.com/en/methodology`,
     cf. FAITS) : `circulating = total supply − adresses verrouillées **fournies par l'équipe et
     vérifiées par CoinGecko**`. Sous cette définition, la **liquidité de la pool PumpSwap n'est
     normalement PAS un « verrou »** au sens CoinGecko (elle est immédiatement échangeable par
     n'importe qui) : seul le contrat Streamflow (vesting) serait candidat à une soustraction, et
     son montant est **NON TROUVÉ** (page SPA sans rendu serveur, voir SOURCES §7). Le solde du
     wallet créateur n'est pas nécessairement « verrouillé » non plus (ClawPump distingue
     explicitement sa section « Creator wallet balance » de sa section « Locked token supply »
     Streamflow — deux catégories différentes sur leur propre page). **Conclusion : sous la
     méthodologie CoinGecko, aucune circulating supply fiable n'est calculable tant que (a) le
     montant Streamflow n'est pas lu on-chain et (b) l'équipe n'a pas elle-même désigné/vérifié
     quelles adresses sont « verrouillées ».**
  2. **Formule demandée littéralement par la mission** (`total − pool − équipe/verrouillé, avec
     adresses et montants tels que lisibles on-chain`) : partiellement calculable, avec de fortes
     réserves :
     - Solde de la pool PumpSwap : **CONTRADICTION entre deux réponses de la MÊME page
       GeckoTerminal**, lues à quelques minutes d'intervalle dans un unique fetch (donc pas un
       écart temporel) : la réponse à « Who owns the most MONARK? » dit **« 138.4M MONARK
       tokens »** (≈ 13,84 % du total supply), tandis que la réponse à « What is the token
       allocation of MONARK/SOL? » dit **« pooled MONARK is 167M »** (≈ 16,7 % du total supply).
       Les deux sont [lu] verbatim, mêmes URL/horodatage, GeckoTerminal ne les réconcilie pas
       lui-même sur la page. **Rapportée telle quelle, non tranchée.**
     - Solde du wallet créateur (`BQPsJEawxaostAfQ3USyLBHkdLiEQ46Py6CkDFHyk3QV`) : **NON TROUVÉ**
       (ClawPump l'affiche mais en chargement client uniquement).
     - Montant Streamflow (`63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn`) : **NON TROUVÉ** (idem).
     - **Arithmétique partielle, à ne PAS soumettre telle quelle à CoinGecko** : en ne
       soustrayant QUE la pool (les deux autres termes étant inconnus, donc cette soustraction
       partielle **sous-estime** la vraie déduction) : `1 000 000 000 − 138 400 000 ≈ 861,6M` ou
       `1 000 000 000 − 167 000 000 = 833M`, selon la valeur de pool retenue. Ce sont des
       bornes hautes d'un nombre qui serait plus bas une fois le créateur et le vesting
       soustraits — **marqué « à confirmer par l'investisseur »**, pas une donnée à soumettre en
       l'état.
  - **Indice indirect** : le tooltip générique de GeckoTerminal (« Assuming circulating supply =
    total supply (includes locked, excludes burned) ») et le fait que `Market Cap` affiché
    (« $78K », arrondi UI) ≈ `FDV` (`$77,994.53`) suggèrent que CoinGecko/GeckoTerminal
    **traitent aujourd'hui MONARK comme si circulating = total** (aucune adresse verrouillée
    n'a encore été soumise/vérifiée) — cohérent avec le site qui dit encore « Tokenomics: ...
    to be announced ». Observation, pas une citation d'un champ dédié.

### 1.7 Site web
**https://monarkgate.tech** (page d'accueil) **+ https://monarkgate.tech/token** (page dédiée
au token, contient déjà l'adresse du contrat). [lu] P1, les deux pages sont en ligne et
répondent 200. **Contradiction à signaler** : le champ `"website"` publié par pump.fun lui-même
dans les métadonnées de la pièce pointe vers
`https://agents.clawpump.tech/marketplace/agents/d47b930f-b54e-42a6-964c-62238264e2d0` (une
fiche « agent » sur le marketplace ClawPump), pas vers monarkgate.tech. Les deux URL sont
réelles et actives ; laquelle doit apparaître dans le champ CoinGecko « Website URL » est une
décision produit, **marquée « à confirmer par l'investisseur »** (monarkgate.tech semble
l'évidence vu l'ensemble de la mission, mais ce n'est pas à moi de trancher un écart de
déclaration officielle).

### 1.8 Réseaux sociaux / Community URL
- **X (Twitter) : https://x.com/usemonark.** [lu] P1, confirmé par **cinq sources indépendantes
  convergentes** : (i) le tableau `socialLinks` du Linktree officiel, (ii) le champ schema.org
  `sameAs` de la même page Linktree, (iii) la bio du compte X lui-même (qui cite le CA exact de
  MONARK), (iv) le champ `"twitter"` des métadonnées on-chain/plateforme de pump.fun, (v)
  absence totale de tout autre candidat ailleurs. Le profil X affiche `linktr.ee/monarkgate`
  comme site associé (pas directement monarkgate.tech — lien indirect en un saut, X → Linktree →
  site, pas X → site directement).
- **Telegram : NON TROUVÉ.** Recherche exhaustive et négative sur (a) le HTML complet de la page
  d'accueil et de `/token` (grep de tous les `href` externes — un seul lien externe trouvé sur
  tout le site, le GitHub), (b) le Linktree officiel (grep `t.me` : aucun résultat), (c) les
  métadonnées pump.fun (`"telegram"` absent du bloc JSON, seul `"twitter"` est renseigné), (d)
  la description GitHub. **Le seul indice Telegram qui existe dans tout le corpus fourni est le
  handle personnel de l'investisseur, « Stan @monark », utilisé dans une conversation PRIVÉE
  Clawpump↔Monark** (source : `F:\PRODUITS\clawpump\LECTURE-telegram-clawpump-monark-2026-09-22.md`,
  [lu] par l'orchestrateur) — **ce n'est PAS un canal communautaire officiel annoncé**, à ne
  soumettre à aucun champ CoinGecko sans validation explicite de l'investisseur.
- **Discord : NON TROUVÉ** (même recherche négative que Telegram).
- **Linktree (accessoire, pas un réseau social au sens CoinGecko mais utile en « Additional
  Information ») : https://linktr.ee/monarkgate**, [lu] P1, référencé nommément par le README
  GitHub public.

### 1.9 GitHub
**https://github.com/KraidleAI/monark**. [lu] P1, confirmé par **quatre sources indépendantes** :
(i) la page organisation `github.com/KraidleAI` liste un seul dépôt public, « Monark » ; (ii) le
lien du footer de monarkgate.tech pointe exactement là ; (iii) la description « About » du dépôt
lui-même s'auto-cite ; (iv) le Linktree officiel y renvoie aussi.

**Piège de collision évité, à consigner explicitement** : le dépôt de travail dans lequel cette
recherche s'exécute (`F:\Monark`, checkout local) a pour remote `origin` :
`https://github.com/KraidleAI/monark-governance.git` — un nom DIFFÉRENT. Une vérification par
fetch direct de cette URL renvoie **HTTP 404** (non public sous ce nom). Le fichier
`README.md` de CE dépôt local porte lui-même le commentaire explicite des mainteneurs : « The CI
badge points at the PUBLIC repo's workflow (KraidleAI/Monark) — what a stranger sees » — c'est-à-
dire que les mainteneurs eux-mêmes documentent la distinction entre CE dépôt (interne/gouvernance)
et le dépôt public à citer. **Le dépôt à indiquer dans le dossier CoinGecko est
`KraidleAI/monark`, jamais `KraidleAI/monark-governance`.**

Description publique du dépôt (`About`, [lu] verbatim) : « MONARK — a coverage-controlled
decision gate for DeFi and inference agents: commit | defer | abstain over a depletable budget,
never a probability of being right. Five frozen typed contracts, a public 4-tool MCP endpoint
(attest · gate · cascade · calibrate). Everything else: https://linktr.ee/monarkgate » — licence
Apache-2.0, langage TypeScript, mis à jour 19 sept. 2026.

### 1.10 Whitepaper
**NON TROUVÉ.** Aucune mention de « whitepaper » sur le site (grep négatif), ni dans le README
GitHub public consulté, ni sur les pages pump.fun/ClawPump/Linktree. Champ à laisser vide ou
« N/A », **à confirmer par l'investisseur** si un document existe ailleurs (le deck Google Doc
mentionné dans le Telegram — « MONARK detailed deck (first draft, 2026-09-22) » — est un deck
commercial privé partagé à Clawpump, pas un whitepaper public ; ne pas le soumettre comme tel
sans décision explicite).

### 1.11 Description courte (≤ 300 caractères) et longue

Les deux candidates ci-dessous sont des **citations exactes** des balises `<meta name="description">`
du site (pas une reformulation) ; les deux passent la vérification programmatique contre
`F:\Monark\vocab-banned.json` (aucun motif banni du scope global ni du scope `site` ne matche —
vérifié par script, pas à l'œil).

- **Candidate A — description courte, page d'accueil (147 caractères), recommandée comme
  description principale du projet** :
  > « MONARK — a company of agent-products on one coverage-controlled gate that emits commit,
  > defer, or abstain, and a depletable authorization budget. »
- **Candidate B — description courte, page `/token` (154 caractères), alternative plus centrée
  sur le token** :
  > « MONARK is a depletable authorization budget, B_t: spent only by commit, never a yield,
  > never a probability of being right. Useful staking is under design. »
- **Description longue** (assemblage de phrases exactement reprises du site et du README GitHub
  public, sans reformulation ; sauts de ligne indiqués par `//`) :
  > « MONARK is a company of agent-products for DeFi and inference, built on one backbone: a
  > coverage-controlled decision gate that emits commit, defer, or abstain, and a depletable
  > authorization budget (B_t) — never a probability of being right. // One engine, eleven
  > agents, one plug per client: sensors witness, an adapter shapes the testimony into a frozen
  > Prediction, the gate authorizes, an act executes, and B_t is spent only on commit. // It is
  > not a yield, idle staking, an oracle, or a probability of being right. One token, one
  > ticker: MONARK. // Tokenomics mechanics are under design; details are to be announced. »
  (Sources phrase par phrase : phrase 1 = README public `KraidleAI/monark`, [lu] ; phrases 2–4 =
  monarkgate.tech accueil et `/token`, [lu].)

**Ne PAS utiliser** la formule « Transforming DeFi with conformal inference. Coverage over
confidence! » (Linktree/X/ClawPump) comme description CoinGecko : elle contient le mot
« confidence » nu, banni par `vocab-banned.json` scope `site` (« no confidence field/score
anywhere »), même si techniquement ce fichier-là n'est pas dans le périmètre scanné par le gate
(voir §Contradictions).

### 1.12 Logo — spécification (PNG 200×200, fond transparent)

**La consigne demandait de nommer un fichier source dans
`F:\PRODUITS\etude-2026-09-21\maquettes-release\v4\assets\`. Ce dossier NE CONTIENT PAS de
marque MONARK « parente » — vérifié par lecture intégrale des 4 SVG qu'il contient : ce sont les
deux marques PRODUIT, Narabi (accent or) et Ukemi (accent bleu-violet), chacune en variante
claire/sombre, aucune n'étant un « M » ou un motif générique MONARK. C'est un NON TROUVÉ pour la
consigne littérale.**

En cherchant ailleurs dans le dépôt (toujours en lecture seule), j'ai identifié la marque MONARK
réellement utilisée en production, avec un fichier source précis et vérifié :

- **Fichier source recommandé : `F:\Monark\apps\site\app\icon.svg`** (favicon actuellement servi
  par https://monarkgate.tech/icon.svg — vérifié octet-pour-octet identique par un fetch direct
  du site en production). Variante non arrondie : `F:\Monark\apps\site\app\apple-icon.svg` (même
  motif, coins carrés). Les deux : `viewBox 0 0 64 64`, fond `<rect>` plein `#1F1B16`
  (anthracite), 6 traits/points crème `#FAF7F2` en étoile, cercle central rouge `#A6453E`.
- **Pour obtenir un PNG 200×200 à fond transparent** (spécification demandée) à partir de ce
  fichier : supprimer l'élément `<rect>` de fond (qui est actuellement OPAQUE, pas transparent),
  conserver uniquement les tracés/cercles, puis rasteriser le SVG résultant en 200×200 avec canal
  alpha préservé. **Je ne génère pas ce PNG** (hors périmètre chercheur), je nomme seulement le
  fichier source et l'opération.
- **Recoupement fort, motif confirmé comme LA marque MONARK** : le même motif (cercle rouge +
  6 branches, fond clair cette fois) existe déjà, littéralement identique visuellement, à trois
  autres endroits déjà utilisés publiquement :
  1. `F:\Monark\out\logo.png` — 512×512 PNG RGBA, fond **crème opaque** (pas transparent),
     branches/points **noirs**, centre rouge. [lu] (image).
  2. L'image de métadonnées on-chain/plateforme du token elle-même :
     `https://clawpump.tech/api/token-image/bafkreigkkwhpt63yikterppearcve42li65bbj2gemmphabmcx62qniski`
     — 512×512 **WebP avec canal alpha** (confirmé par inspection du format de fichier), même
     motif que `out/logo.png` (fond crème, branches noires, centre rouge). [lu] (image, comparaison
     visuelle directe). **La présence d'un canal alpha dans le fichier n'implique pas que le
     fond soit visuellement transparent** — à l'écran le fond crème remplit tout le cadre ; la
     transparence réelle du canal n'a pas été vérifiée pixel par pixel.
  3. Le favicon en production (`icon.svg`, variante sombre) cité plus haut.
- **Recommandation, sous réserve de confirmation investisseur** : partir de `out/logo.png` (déjà
  512×512, déjà le fichier associé au token sur la plateforme d'émission) ou de
  `apps/site/app/icon.svg` (vectoriel, redimensionnement sans perte) ; dans les deux cas, retirer
  le fond opaque et exporter en 200×200 PNG avec transparence réelle avant soumission à
  CoinGecko — **à faire confirmer/exécuter par l'investisseur ou un rôle habilité à écrire dans
  le dépôt produit**, pas par ce chercheur.

### 1.13 Type de demande, adresse à joindre, vitesse de revue
- **Active Listing** (pas Preview Listing) : le token est déjà négocié (pool PumpSwap actif,
  suivi par GeckoTerminal) — cohérent avec le prérequis unique de CoinGecko lu par l'orchestrateur
  (« your cryptocurrency must be actively tradable on a cryptocurrency exchange tracked by
  CoinGecko »).
- **Exchange/market à déclarer** : PumpSwap (pump.fun), via le pool
  `GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg`, déjà suivi par GeckoTerminal (prérequis
  satisfait, cf. FAITS §2).
- **Vitesse de revue** : Regular Pass (gratuit, jusqu'à 5 jours) ou Fast Pass (payant, voir §2) —
  **décision investisseur**, liste fermée des actes en §5.
- **Pièce jointe « Public Verification Post »** : voir §5, procédure lue intégralement dans
  l'article « Verification Guide for Listing/Update Requests on CoinGecko » (23725417857817),
  [lu] P1 — nécessite un post PUBLIC depuis un compte social officiel « lié directement au site
  du projet » (X, Facebook ou Instagram), avant même de remplir le formulaire.

---

## 2. Fast Pass CoinGecko — prix et couverture

Tout ce paragraphe est [lu] intégralement (curl direct, 200 OK sur les trois articles), P1.

### Couverture (article « What does the CoinGecko Fast Pass feature cover? »,
support.coingecko.com/hc/en-us/articles/37298264234649)
Citation verbatim (structure) : « CoinGecko Fast Pass provides expedited review services for
**coin listing, coin update, contract migration or rebranding, and tag/category update**
requests. This ensures that your application receives a response within a **24-hour window**
from the time of submission. » Pour les demandes de type « Coin Update », seuls des champs
précis sont couverts (verbatim) : « Logo Update », « Project Name/Crypto Symbol Update »,
« Website URL/Community URL/Whitepaper URL/Github URL Update », « Project Content/Description
Update », « New Listing on Exchanges / New Market Addition (Market Mapping) », « New Contract
Addition ». **Pour une demande de LISTING (le cas de MONARK, premier listing), Fast Pass
accélère « the evaluation of new coin listing applications » dans son ensemble — pas de
sous-liste de champs pour ce type de demande** (la sous-liste de champs ne s'applique qu'aux
demandes de mise à jour d'un coin déjà listé).
Limite explicite (verbatim) : « Fast Pass guarantees faster processing, but does not guarantee
that your request will be approved. » Remboursement (verbatim) : « There is no refund for any
Fast Pass purchase(s) made. » y compris si la demande est hors périmètre ou rejetée pour
non-conformité. Mise en garde anti-fraude (verbatim) : « CoinGecko Fast Pass is our only
official paid service for expedited listing evaluations. Please be aware that any third-party
services claiming to offer fast or guaranteed listings are unauthorized and not endorsed by
CoinGecko. »

### Prix (article « CoinGecko Fast Pass - Frequently Asked Questions »,
support.coingecko.com/hc/en-us/articles/37297414892697 — **c'est cet article, pas
« How to Purchase », qui contient le prix**)
Citation verbatim : « Fast Pass is priced at — **$1,000 per request for Coin Listing, Tag
Updates, Contract Migrations** — **$200 per request for Coin Update**. » Autres réponses de la
même FAQ, verbatim : « Does Fast Pass guarantee my coin will be listed or updated? No, Fast Pass
does not guarantee approval. It only ensures a faster response time within 24 hours. » ; « Can I
purchase Fast Pass for multiple requests? Each Fast Pass only allows escalation of a single
request. » ; « Is Fast Pass refundable? Fast Passes are not refundable. » ; « Can I purchase Fast
Pass using crypto payments? Yes! ».
**Pour un premier listing MONARK (« Coin Listing »), le prix Fast Pass est donc $1,000, non
remboursable, sans garantie d'approbation, pour un délai de réponse (pas d'approbation) de 24 h.**

### Modalités d'achat (article « How to Purchase CoinGecko Fast Pass »,
support.coingecko.com/hc/en-us/articles/37529551769497)
Deux moments d'achat possibles (verbatim, résumé) : (1) au moment de la soumission du
formulaire, en choisissant Fast Pass plutôt que Regular Pass avant validation finale ; (2) après
coup, via trois canaux — le bouton « Purchase Now » sur la page de succès, le bouton « Get
Priority Review » dans l'onglet « Request & Listing » du tableau de bord, ou un lien « Fast Pass
upgrade » dans l'email de confirmation. Paiement : « Debit/Credit Card » ou « Cryptocurrency »
(connexion d'un wallet Web3, approbation d'une transaction on-chain). **Aucune mention explicite
d'un « listing fee » de base dans cet article ni dans le guide de soumission standard** — cohérent
avec (mais non confirmé verbatim par une lecture de première main) l'affirmation trouvée par
recherche que le Regular Pass est gratuit ; je ne le cite qu'en [2nd]/indice, pas comme un fait
lu textuellement dans les deux articles que j'ai ouverts.

### Distinction importante : Fast Pass ≠ GeckoTerminal Fast Pass
La recherche a fait remonter deux articles distincts pour « GeckoTerminal Fast Pass » (« What
does the GeckoTerminal Fast Pass feature cover? », « What is GeckoTerminal Fast Pass? ») — **non
lus ici** (hors périmètre : la tâche demandait explicitement le Fast Pass CoinGecko, pas
GeckoTerminal). GeckoTerminal suit déjà MONARK/SOL sans qu'aucune action n'ait été nécessaire
(prérequis satisfait, cf. FAITS) ; ne pas confondre les deux produits payants si l'investisseur
explore plus tard une accélération côté GeckoTerminal spécifiquement.

---

## 3. Motifs de rejet CoinGecko et état de MONARK pour chacun

Source unique, [lu] intégralement : « Why is my token not listed on CoinGecko? »
(support.coingecko.com/hc/en-us/articles/4498809321369). Citation d'ouverture verbatim :
« CoinGecko reserves the right to publish or unpublish any listed cryptoasset, ICO, or exchange
on our site without prior notice if we feel that any of the presented information is inaccurate
in any way. » Huit motifs nommés, chacun confronté à l'état connu de MONARK :

| Motif (verbatim résumé) | État MONARK connu | Niveau |
|---|---|---|
| **Limited Cryptoasset Presence** — « must be listed on at least one active exchange where CoinGecko has integrated » | **Satisfait** : pool PumpSwap déjà suivi par GeckoTerminal (FAITS §2, [lu] orchestrateur). Le même article ajoute : « In the meantime, your token may already be listed on GeckoTerminal » — c'est déjà le cas. | [lu] |
| **Insufficient Information on Cryptoasset** — site fonctionnel avec détails projet/équipe/réseaux sociaux | **Partiellement à risque** : le site monarkgate.tech est fonctionnel et détaillé sur le PRODUIT, mais ne publie aucune information d'ÉQUIPE (pas de page équipe/à-propos trouvée), et la section Tokenomics dit explicitement « to be announced ». Le champ social est limité à X (pas de Telegram/Discord). | [lu]/[abs] |
| **Trademark Infringement / Inappropriate Content** | Aucun indice de conflit de marque trouvé dans cette recherche (nom « MONARK » non vérifié activement contre un registre de marques — hors périmètre de cette mission). | NON TROUVÉ (non recherché) |
| **Impersonations / Ticker or Name Conflict** | Aucun autre projet « MONARK » identifié pendant cette recherche (recherches faites : site, GitHub, X, Linktree, pump.fun — tous cohérents entre eux, un seul écosystème). Pas de vérification exhaustive de collision de ticker sur CoinGecko lui-même (nécessiterait une recherche dédiée sur coingecko.com, non faite ici). | [abs] |
| **Malicious Application / Missing submitter's role** — « provide proof of your affiliation with the official team » | Couvert par la procédure « Public Verification Post » (§5) — à condition qu'un compte social officiel existe et soit utilisé pour le post (X existe : `x.com/usemonark`). | [lu] |
| **Smart Contract Issues** | Non audité à ma connaissance (aucune mention d'audit trouvée ; GeckoTerminal affiche un champ « Audits » vide sur la page pool). Le token utilise Token-2022 avec des extensions non vérifiées (§1.4) — point de vigilance, pas un fait de rejet avéré. | [lu] (absence d'audit) / NON TROUVÉ (extensions) |
| **Rug-pull Risk** — « flagged when a token has unlocked liquidity... or token is not traded on one or more exchanges » | **Signal positif lu sur GeckoTerminal** (à re-vérifier, c'est une déclaration de la page GT, pas une vérification on-chain indépendante par moi) : « the liquidity provided to the pool is 100% locked » et « This trading pair's token minting and freezing authority is disabled » et « 0% of the tokens were purchased via bundled buys » (verbatim, FAQ « Is it safe to buy MONARK/SOL? », GT Security Score 58,13/100 affiché le même jour). Le token EST négocié sur un exchange suivi (PumpSwap). | [lu] (déclaratif GeckoTerminal, pas re-vérifié on-chain indépendamment par ce chercheur) |
| **Duplicated / Spam Request** | Sans objet tant qu'aucune demande n'a encore été soumise. À surveiller lors de la soumission (une seule demande, pas de doublon). | N/A |

Rappel verbatim des consignes de comportement : « Do not submit Incomplete submissions... »,
« Repeated submissions on CoinGecko request form will be marked as spam. », « If your token is
not listed after 2 weeks of applying, it is likely that the project did not pass our listing
evaluation. »

---

## 4. Ce qu'il faudrait ajouter sur `monarkgate.tech/token` pour que CoinGecko puisse vérifier la supply

Raisonnement combinant la méthodologie CoinGecko ([lu] par l'orchestrateur : « Circulating
Supply = total supply − adresses verrouillées fournies par l'équipe et vérifiées par CoinGecko »)
et les motifs de rejet « Insufficient Information » / « Rug-pull Risk » (§3) :

1. **Publier le total supply et les décimales explicitement** (actuellement absents de la page —
   `/token` affiche seulement l'adresse du contrat et dit « Tokenomics: ... to be announced »).
   Valeurs déjà connues on-chain (§1.5–1.6) : 1 000 000 000 total, 6 décimales.
2. **Nommer et publier CHAQUE adresse à exclure du circulating supply**, avec le montant détenu
   au moment de la publication : le contrat de vesting Streamflow
   (`63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn`), et — si son solde est destiné à rester hors
   circulation — le wallet créateur (`BQPsJEawxaostAfQ3USyLBHkdLiEQ46Py6CkDFHyk3QV`). Sans cette
   publication explicite par l'équipe, CoinGecko ne peut PAS vérifier une circulating supply
   (leur méthodologie exige que ce soit « fourni par l'équipe » puis vérifié, jamais déduit
   unilatéralement par CoinGecko).
3. **Publier le détail du vesting Streamflow** (montant total verrouillé, cliff, calendrier de
   déblocage) — aujourd'hui invisible même sur ClawPump (rendu uniquement côté client). Un lien
   direct vers la page Streamflow (déjà présent sur Linktree) plus un résumé texte statique sur
   `/token` lèverait l'ambiguïté sans dépendre du JavaScript d'un tiers.
4. **Déclarer explicitement l'état des autorités du mint** (mint authority / freeze authority) —
   GeckoTerminal affirme déjà qu'elles sont désactivées, mais cette affirmation gagnerait à être
   corroborée par le projet lui-même sur sa propre page (avec un lien vers une lecture on-chain
   vérifiable), ce qui répond directement au critère de rejet « Rug-pull Risk ».
5. **Clarifier/aligner le champ « website » déclaré sur les plateformes tierces** : pump.fun
   déclare aujourd'hui `agents.clawpump.tech/marketplace/...` comme site officiel du token, pas
   monarkgate.tech (§Contradictions) — un examinateur CoinGecko qui recoupe les deux pourrait
   percevoir une incohérence ; à harmoniser avant soumission.
6. **Réconcilier les deux chiffres de solde de pool** trouvés contradictoires sur GeckoTerminal
   (138,4M vs 167M, §1.6) n'est pas du ressort du site MONARK (c'est un calcul GeckoTerminal),
   mais publier le total supply et les adresses verrouillées sur `/token` permettrait à
   quiconque de recalculer indépendamment et de repérer l'écart.
7. **Ajouter une page équipe/à-propos minimale** (même pseudonyme + rôle) pour adresser le motif
   de rejet « Insufficient Information on Cryptoasset », qui demande explicitement des
   informations sur « the purpose, team, or social media profiles ».

Tout ce qui précède est une **recommandation du chercheur**, pas une action déjà effectuée ; la
mise en œuvre suppose un accès en écriture au dépôt `apps/site`, hors périmètre de cet agent
(R-20 : aucun commit, aucune écriture hors `docs/token/`).

---

## 5. Liste fermée des actes investisseur (compte, soumission, paiement, preuve de contrôle)

Reconstruite à partir des articles CoinGecko [lu] (§1, §2, §3) ; **aucun de ces actes n'a été
effectué par ce chercheur.**

1. **Créer/utiliser un compte CoinGecko** (connexion requise avant tout accès au formulaire —
   [lu], « How to List a New Cryptocurrency on CoinGecko »).
2. **Publier un « Public Verification Post »** sur un compte de réseau social officiel « lié
   directement au site du projet » (X, Facebook ou Instagram) — [lu], « Verification Guide for
   Listing/Update Requests on CoinGecko ». Contenu requis (verbatim, structure) : déclaration
   d'intention de soumettre une demande à CoinGecko + URL GeckoTerminal du projet (déjà
   existante : la page pool MONARK/SOL) + handle Telegram (optionnel — MONARK n'en a pas, ce
   champ resterait vide). **Seul compte social officiel disponible aujourd'hui : `x.com/usemonark`**
   — c'est le compte qui devrait publier ce post, si l'investisseur en contrôle bien l'accès.
3. **Remplir le formulaire « New Coin/Token Listing » (Active Listing)** sur la Partners
   Platform, joindre le logo (§1.12), coller le lien du post de vérification (champ dédié ou,
   à défaut, section « Additional Information »).
4. **Répondre au post de vérification** avec l'identifiant de demande (`CLXXXXX`) reçu par email
   de confirmation, une fois le formulaire soumis — c'est cette réponse publique qui prouve le
   contrôle du compte X pour CoinGecko.
5. **Choisir la vitesse de revue** : Regular Pass (gratuit à ma connaissance mais non confirmé
   verbatim, jusqu'à 5 jours) ou Fast Pass ($1,000, non remboursable, réponse sous 24 h, sans
   garantie d'approbation — §2).
6. **Accepter les CGU** (« Terms & Conditions for Listing on CoinGecko » + « Terms & Conditions
   for Fast Pass » si applicable) et compléter le captcha avant soumission finale.
7. **Paiement, SI Fast Pass est choisi** : carte bancaire OU connexion d'un wallet Web3 pour
   approuver une transaction on-chain — **acte financier et/ou de compte à ne déclencher
   qu'après feu vert explicite de l'investisseur**, jamais par un agent.
8. **Suivi** de la demande via l'onglet « Request & Listing » du tableau de bord CoinGecko.

**Préalable bloquant identifié par cette recherche, à traiter avant l'étape 2** : la procédure de
vérification CoinGecko exige un compte social « officiel » — aujourd'hui MONARK n'en a qu'un
seul, X (`x.com/usemonark`). Si l'investisseur n'a pas un accès de contrôle direct et vérifiable
sur ce compte X précis, l'étape 2 (et donc toute la chaîne) ne peut pas être complétée telle que
documentée par CoinGecko.

---

## Contradictions relevées (non tranchées, rapportées telles quelles)

1. **Solde de la pool PumpSwap** : GeckoTerminal donne deux réponses différentes sur la MÊME
   page, lues dans le même fetch : « 138.4M MONARK tokens » (FAQ « Who owns the most MONARK? »)
   vs « pooled MONARK is 167M » (FAQ « What is the token allocation of MONARK/SOL? »). Écart
   d'environ 28,6M tokens (≈2,9 % du total supply). Non réconcilié par la source elle-même.
2. **Site officiel déclaré** : pump.fun (métadonnées de la pièce, `"website"`) déclare
   `agents.clawpump.tech/marketplace/agents/d47b930f-b54e-42a6-964c-62238264e2d0`, alors que
   toute la mission (et le lien GitHub du footer du site lui-même) s'organise autour de
   `monarkgate.tech`. Les deux existent et fonctionnent ; aucune indication trouvée que l'un
   remplace l'autre.
3. **Âge du « pool »** : GeckoTerminal dit « This MONARK/SOL pool was created 8 days ago » (lu le
   2026-09-22, donc ≈ 14 septembre), alors que le MINT/la pièce a été créé(e) le 2026-09-10 (deux
   sources : `dateCreated` ClawPump et `created_timestamp` pump.fun, concordantes à 2 s près).
   Interprétation la plus probable (non confirmée par une source qui l'énoncerait explicitement) :
   le token a d'abord vécu sur la bonding curve pump.fun (créée le 10/09), puis a « gradué »
   vers un pool PumpSwap distinct quelques jours plus tard (≈14/09) une fois le seuil de
   migration atteint — cohérent avec `"complete":true` et `"real_sol_reserves":0` /
   `"real_token_reserves":0` (réserves de la bonding curve vidées après migration) lus sur
   pump.fun. Présenté comme la lecture la plus cohérente des faits, pas comme un fait
   lui-même énoncé quelque part.
4. **Vocabulaire « confidence »** : la bio Linktree/X/ClawPump dit « Coverage over confidence! »
   à trois endroits identiques, alors que le site principal affirme « No confidence field,
   anywhere. » et que `vocab-banned.json` bannit le mot nu « confidence » sur le scope `site`.
   Les surfaces sociales ne sont pas dans le scope scanné par le gate technique, mais le message
   public n'est pas uniforme. Signalé, non corrigé (hors mandat de ce chercheur).
5. **Dépôt GitHub de travail vs dépôt public** : voir §1.9 — le remote `origin` local
   (`monark-governance`) n'est pas le dépôt public (`monark`) ; les deux noms existent, un seul
   est public.

## NON TROUVÉ (récapitulatif)
- Montant exact verrouillé dans le contrat Streamflow (cliff, calendrier de déblocage,
  bénéficiaire précis) — contrat identifié, contenu chiffré non accessible en HTML public.
- Solde exact du wallet créateur `BQPsJEawxaostAfQ3USyLBHkdLiEQ46Py6CkDFHyk3QV`.
- Liste complète des « top holders » au-delà du premier rang (la pool elle-même) — pas de
  classement 2ᵉ/3ᵉ/etc. trouvé sur les sources autorisées.
- Extensions Token-2022 du mint MONARK (transfer fee, transfer hook, permanent delegate, etc.) —
  ni confirmées ni infirmées par la méthode HTML-seule imposée.
- Whitepaper public.
- Toute preuve d'audit de sécurité du contrat.
- Décimales/total supply confirmés indépendamment via Solscan, SolanaFM ou Solana Explorer (les
  trois sources explicitement nommées par la tâche) — obtenus via pump.fun à la place, écart de
  méthode assumé et documenté.
- Confirmation qu'aucun autre projet crypto n'utilise déjà le ticker/nom « MONARK » sur
  CoinGecko (vérification de collision non effectuée, hors périmètre de cette recherche).
- Existence ou non d'un « listing fee » de base pour le Regular Pass, énoncée verbatim dans une
  source de première main (indice trouvé par recherche mais non lu verbatim dans les deux
  articles ouverts).

## Procurements / recherches formées à transmettre

1. **Blocage de méthode (Solana Explorer)** : `explorer.solana.com` oppose un
   « Vercel Security Checkpoint » (barrage anti-bot) à toute requête sans navigateur JS complet.
   Non contourné, conformément à la règle absolue CAPTCHA. **Option A** : lecture sur place par
   l'orchestrateur via un navigateur (interne puis externe, selon la règle « lecture sur place »
   du 2026-09-20) sur `https://solscan.io/token/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` et
   `https://explorer.solana.com/address/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT`, pour
   confirmer indépendamment décimales/supply/holders déjà obtenus via pump.fun. **Option B** :
   autorisation explicite d'un appel en lecture seule au RPC JSON-RPC public Solana
   (`getAccountInfo`/`getTokenSupply` sur le mint, méthode déjà normée dans ce dépôt à
   `apps/bell/src/supply.ts`), après lecture de ses conditions d'usage — non fait ici car hors du
   périmètre explicitement donné à cette mission (« Solscan/Solana FM/explorer public : pages
   HTML publiques seulement »).
2. **Blocage de méthode (Streamflow)** : la page contrat `app.streamflow.finance/contract/...`
   ne rend aucune donnée côté serveur. Même options A/B que ci-dessus, appliquées à
   `getAccountInfo` sur `63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn`, ou lecture sur place par
   navigateur de la page Streamflow elle-même.
3. **Décision produit requise** : lequel de `monarkgate.tech` ou
   `agents.clawpump.tech/marketplace/agents/d47b930f-...` doit être le « Website URL » officiel
   soumis à CoinGecko (contradiction §Contradictions point 2) — décision investisseur, pas une
   recherche.
4. **Décision produit requise** : quelles adresses (créateur ? Streamflow ? les deux ?) l'équipe
   souhaite désigner comme « verrouillées » pour le calcul CoinGecko de circulating supply —
   décision investisseur puis vérification CoinGecko, pas quelque chose qu'un chercheur peut
   décider à sa place.

---

*Archive écrite au fil de la recherche par un chercheur Sonnet 5 (`claude-sonnet-5`), effort
max. Journal complet des URL et des échecs : `F:\Monark\docs\token\SOURCES-coingecko.md`. Aucune
écriture hors de `F:\Monark\docs\token\` ; aucun commit (R-20).*
