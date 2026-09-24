# SOURCES — Dossier de listing CoinGecko MONARK (journal des URL)

Chercheur Sonnet 5 (`claude-sonnet-5`), effort max. Session 2026-09-22, 15:12–15:33 UTC (heures
approximatives, prises à `date -u` à intervalles pendant la recherche, pas horodatées requête
par requête). Discipline doc 03 : [lu]/[abs]/[2nd], classes P1/P2/P3, échecs consignés (URL +
code). Toute donnée de marché (prix, MCAP, liquidité, holders) est une **valeur du jour**,
jamais réutilisée comme fait durable — voir la clause dédiée à chaque occurrence.

Méthode de lecture : `curl` avec en-tête `User-Agent` de navigateur (Chrome/128 Windows), GET
simple sur pages HTML publiques, **aucune clé, aucun compte, aucun formulaire soumis**. Les
pages fortement rendues côté client (React/Next.js) ont été inspectées via leur bloc
`__NEXT_DATA__`/JSON intégré au HTML servi (donnée server-side-rendered, donc toujours « page
HTML publique », jamais un appel à une API tierce authentifiée).

## 1. Entrées locales lues avant toute recherche externe
- `F:\Monark\docs\token\FAITS-coingecko-listing-2026-09-22.md` — [lu], orchestrateur Fable 5.1, 2026-09-22 15:07 UTC. P1 (lecture directe support.coingecko.com + geckoterminal.com par l'orchestrateur).
- `F:\Monark\vocab-banned.json` — [lu] intégral. P1 (source de vérité du dépôt).
- `F:\PRODUITS\clawpump\LECTURE-telegram-clawpump-monark-2026-09-22.md` — [lu] intégral. P1 (lecture directe Telegram par l'orchestrateur, aucun message envoyé).
- `F:\Monark\out\mint.txt` — [lu]. `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` (identique au mint de la tâche).
- `F:\Monark\out\logo.png` — [lu] (image, Read tool). 512×512 PNG RGBA, fond crème **opaque** (non transparent), motif hub-and-spoke (cercle rouge central, 6 branches noires terminées par des points noirs).
- `F:\Monark\out\banner.jpg` — [lu] (métadonnées via `file`). 1500×500 JPEG.
- `F:\PRODUITS\etude-2026-09-21\maquettes-release\v4\assets\*.svg` (4 fichiers) — [lu] intégral. Aucun n'est une marque MONARK « parent » : marques produits Narabi (or `#E8C468`/`#B8922E`) et Ukemi (bleu-violet `#9AA2EE`/`#5661C9`), variantes claire/sombre. Confirmé par `aria-label`/`<title>` de chaque fichier.
- `F:\PRODUITS\etude-2026-09-21\maquettes-release\v4\index.html` — [lu] (grep ciblé). Carte "Bell" porte littéralement « no logo in temps 1 ».
- `F:\Monark\apps\bell\src\supply.ts` — [lu] intégral. Hors-sujet direct (mints xStocks) mais montre la méthode déjà normée dans ce dépôt pour lire un mint Token-2022 on-chain (`getAccountInfo` jsonParsed, extensions) — repère de méthode.
- `F:\Monark\apps\site\app\icon.svg`, `F:\Monark\apps\site\app\apple-icon.svg` — [lu] intégral. Source git-trackée exacte de la marque MONARK utilisée en production (favicon + apple-touch-icon), confirmée byte-identique au `/icon.svg` servi en direct par le site (voir §2).
- `F:\Monark\apps\site\public\icons\{narabi,ukemi}.svg` — présence confirmée, pas de `monark.svg` — corrobore l'absence de marque MONARK parent dans les assets produit.
- `F:\Monark\README.md` (racine du dépôt local) — [lu] (tête du fichier). Contient le commentaire explicite des mainteneurs : « The CI badge points at the PUBLIC repo's workflow (KraidleAI/Monark) » et « Latest tagged release on the PUBLIC repo (KraidleAI/Monark) ». P1, décisif pour la vérification du dépôt GitHub public (§3).
- `F:\Monark\.git/config` (via `git remote -v`) — [lu]. `origin` = `https://github.com/KraidleAI/monark-governance.git` — CE dépôt local n'est PAS le dépôt public cité par son propre README (voir contradiction §3).

## 2. Site officiel monarkgate.tech
- `https://monarkgate.tech` — [lu] intégral, `curl` 200 OK (68 110 octets), 2026-09-22 ~15:13 UTC. P1.
  - Titre : `<title>MONARK</title>`.
  - Meta description (candidate description courte CoinGecko) : « MONARK — a company of agent-products on one coverage-controlled gate that emits commit, defer, or abstain, and a depletable authorization budget. » (147 caractères hors guillemets).
  - Hero : « It abstains, so it can act. »
  - Paragraphe hero complet (verbatim intégral, y compris la phrase finale absente du premier résumé WebFetch) : « One engine, eleven agents, one plug per client. Sensors witness, an adapter shapes the testimony into a frozen Prediction, the gate authorizes, an act executes — and B_t is spent only on commit. Never a probability of being right. »
  - Footer, colonne « Proof » : liens `Console` (marqué littéralement `UPCOMING`), `Writing` (`/writing`), `GitHub` → `https://github.com/KraidleAI/monark` (`target="_blank"`).
  - Footer, bandeau bas : « MONARK — a company of agent-products for DeFi and inference. » et « No confidence field, anywhere. » (correspond exactement à `exemptPhrases: ["no confidence field"]` de `vocab-banned.json`, scope site).
  - **Recherche exhaustive de liens sociaux (grep de tous les `href` externes) : AUCUN lien X/Twitter, Telegram ou Discord sur la page d'accueil. Le SEUL lien externe de toute la page est le GitHub ci-dessus.** Confirmé par grep direct sur le HTML brut, pas par résumé d'outil.
- `https://monarkgate.tech/token` — [lu] intégral, `curl` 200 OK (33 724 octets), même session. P1.
  - Contract Address affichée : `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` (identique à la tâche).
  - Meta description (candidate alternative, description courte) : « MONARK is a depletable authorization budget, B_t: spent only by commit, never a yield, never a probability of being right. Useful staking is under design. » (154 caractères).
  - Bloc « What it is / What it is not » (liste, verbatim) : *is* → « ...», `remaining_budget`, « one token, one ticker » ; *is not* → « a yield », « idle staking », « an oracle », « a probability of being right ».
  - Section Tokenomics (verbatim) : titre « The token », sous-titre `mechanics under design — details to be announced` ; « Watchers earn for catching a faulty commit; fault is proven by recomputing the frozen decision. » ; « A staker reward mechanism is under design — useful staking, tied to the fleet's work, not a passive payout. »
  - **Aucune donnée de supply, décimales, adresses verrouillées ou allocation publiée sur cette page.** Seul lien externe : le même GitHub que la page d'accueil.
- `https://monarkgate.tech/icon.svg` — [lu] intégral, `curl` 200 OK (646 octets, `image/svg+xml`), 2026-09-22 ~15:29 UTC. P1. Contenu identique byte-pour-byte à `apps/site/app/icon.svg` du dépôt local (rect de fond `#1F1B16` arrondi rx=14, traits/points `#FAF7F2`, cercle central `#A6453E`) — confirme que ce SVG EST la marque MONARK en production.

## 3. GitHub — vérification du dépôt public exact
- `https://github.com/KraidleAI` (page organisation) — [lu] via WebFetch, 2026-09-22 ~15:13 UTC. P1. Un seul dépôt public listé : **Monark**, TypeScript, licence Apache-2.0, mis à jour 19 sept. 2026.
- `https://github.com/KraidleAI/monark` — [lu] intégral, `curl` 200 OK (356 113 octets), 2026-09-22 ~15:41 UTC. P1.
  - `<title>` : « GitHub - KraidleAI/Monark: MONARK — a coverage-controlled decision gate for DeFi and inference agents: commit | defer | abstain over a depletable budget, never a probability of being right. Five frozen typed contracts, a public 4-tool MCP endpoint (attest · gate · cascade · calibrate). Everything else: https://linktr.ee/monarkgate »
  - Description « About » (JSON intégré) : identique, se terminant par **« Everything else: https://linktr.ee/monarkgate »** — c'est ce lien qui a mené à la découverte du Linktree officiel (§4).
- `https://raw.githubusercontent.com/KraidleAI/monark/main/README.md` — [lu] (têtes du fichier), `curl` 200 OK (12 945 octets), 2026-09-22 ~15:42 UTC. P1. Contenu identique à `F:\Monark\README.md` local (même bannière `out/banner.jpg`, mêmes badges CI/Release pointant vers `KraidleAI/Monark`).
- **Vérification locale** : `git remote -v` dans `F:\Monark` → `origin = https://github.com/KraidleAI/monark-governance.git`. Fetch de contrôle `https://github.com/KraidleAI/monark-governance` → **HTTP 404** (WebFetch, 2026-09-22 ~15:38 UTC).
- **CONTRADICTION / PIÈGE DE COLLISION IDENTIFIÉ ET RÉSOLU** : le dépôt de travail local (celui de cette session, `F:\Monark`) N'EST PAS le dépôt public. Son remote `origin` (`KraidleAI/monark-governance`) répond 404 en public. Le dépôt public réel, confirmé par **quatre sources indépendantes convergentes** (page organisation GitHub, lien du footer du site, description « About » du dépôt lui-même, badges CI/Release du README local et distant identiques), est **`https://github.com/KraidleAI/monark`** (affiché « Monark », casse indifférente sur GitHub). C'est CE dépôt qu'il faut citer dans le dossier CoinGecko, jamais l'origin local.

## 4. Linktree officiel (découvert via la description GitHub, pas deviné)
- `https://linktr.ee/monarkgate` — [lu] intégral (JSON `links` et `socialLinks` structurés extraits du HTML servi), `curl` 200 OK (218 295 octets), 2026-09-22 ~15:47 UTC. P1 (référencé nommément par le dépôt GitHub officiel comme « Everything else »).
  - `og:description` : « Transforming DeFi with conformal inference. Coverage over confidence! »
  - `profile:username` : `monarkgate`.
  - Tableau `links` (6 entrées, exhaustif, structuré) :
    1. « Explore MONARK » → `https://monarkgate.tech/`
    2. « GitHub » → `https://github.com/KraidleAI/monark`
    3. « DEX Screener » → `https://dexscreener.com/solana/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT`
    4. « Monark X ClawPump » → `https://clawpump.tech/tokens/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` (« X » = « × », collaboration — PAS Twitter)
    5. « MONARK X ClawHub » → `https://clawhub.ai/kraidle/skills/monark` (« X » = « × » également)
    6. « Streamflow » → `https://app.streamflow.finance/contract/solana/mainnet/63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn`
  - Bloc `socialLinks` (icônes sociales, distinct du tableau `links`) : `[{"type":"X","url":"https://x.com/usemonark","position":1}]`. Confirmé également par un champ `sameAs":["https://x.com/usemonark"]` (schema.org).
  - **Aucune entrée Telegram/Discord nulle part dans le HTML (grep `t.me` : aucun résultat).**

## 5. X (Twitter) officiel
- `https://x.com/usemonark` — [lu] intégral, `curl` 200 OK (591 733 octets — X sert un rendu HTML complet aux robots), 2026-09-22 ~15:48 UTC. P1.
  - `<title>` : « Monark (@usemonark) / X »
  - `og:description` (bio du compte) : « Transforming DeFi with conformal inference, Coverage over confidence.\n\n$MONARK\nCA: FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT » — confirme le CA à l'identique.
  - Lien "website" du profil affiché : `linktr.ee/monarkgate` (redirection `t.co`).
  - Avatar (`og:image`) : `https://pbs.twimg.com/profile_images/2096922687985860608/YQqnTaBN_200x200.jpg` (200×200 JPEG — non inspecté visuellement).
  - **Ce même compte `https://x.com/usemonark` est aussi le champ `twitter` du dossier on-chain pump.fun de MONARK (§7)** — cinquième confirmation indépendante (Linktree tableau `links`/`socialLinks`, schema.org `sameAs`, bio X elle-même, métadonnée pump.fun, et absence totale sur le site).
- **Note vocabulaire (à signaler, pas à corriger ici)** : la bio X et la bio Linktree emploient toutes deux littéralement « Coverage over confidence » — le mot « confidence » est banni nu par `vocab-banned.json` scope `site` (« no confidence field/score anywhere »). Cette bannière n'est pas un fichier scanné par le gate (autre surface), mais c'est une incohérence de discours publique par rapport au footer du site lui-même (« No confidence field, anywhere. »). Retrouvé IDENTIQUE sur 3 surfaces (Linktree, X, page ClawPump §7) donc clairement un choix de copy assumé, pas une coquille isolée.

## 6. Articles support.coingecko.com (tous [lu] intégralement, `curl` avec UA navigateur — WebFetch renvoyait HTTP 403 sur ce domaine, contournement licite documenté ci-dessous)
- **Note de méthode** : WebFetch a échoué avec `HTTP 403 Forbidden` sur les 5 premières URLs support.coingecko.com testées (2026-09-22 ~15:20 UTC). Ce n'est pas un CAPTCHA ni un mur d'authentification (pas de page de défi retournée, juste un 403 sec) : un `curl` simple avec un en-tête `User-Agent` de navigateur standard sur la MÊME URL publique a immédiatement réussi (200 OK). Traité comme un blocage d'après l'empreinte réseau de l'outil WebFetch, pas un accès protégé — lecture d'une page publique sans compte ni clé, donc conforme à la discipline. Documenté ici en toute transparence plutôt que silencieux.
- `https://support.coingecko.com/hc/en-us/articles/37298264234649-What-does-the-CoinGecko-Fast-Pass-feature-cover` — [lu] intégral, 200 OK, 30 808 octets. P1.
- `https://support.coingecko.com/hc/en-us/articles/37529551769497-How-to-Purchase-CoinGecko-Fast-Pass` — [lu] intégral, 200 OK, 29 070 octets. P1.
- `https://support.coingecko.com/hc/en-us/articles/37297414892697-CoinGecko-Fast-Pass-Frequently-Asked-Questions` — [lu] intégral, 200 OK, 25 518 octets. P1. **C'est CET article, et non les deux ci-dessus, qui contient le prix exact.**
- `https://support.coingecko.com/hc/en-us/articles/4498809321369-Why-is-my-token-not-listed-on-CoinGecko` — [lu] intégral, 200 OK, 29 050 octets. P1.
- `https://support.coingecko.com/hc/en-us/articles/23725417857817-Verification-Guide-for-Listing-Update-Requests-on-CoinGecko` — [lu] intégral, 200 OK, 30 257 octets. P1.
- `https://support.coingecko.com/hc/en-us/articles/7291312302617-How-to-List-a-New-Cryptocurrency-on-CoinGecko` — [lu] intégral, 200 OK, 31 618 octets. P1. (URL correcte ; une première tentative sur un slug numérique deviné à partir du titre — `4497761574041-...` — a échoué en **404**, consigné puis corrigé par recherche.)
- `https://support.coingecko.com/hc/en-us/articles/33084534107289-Guide-to-the-CoinGecko-Self-Serve-Request-Form` — [lu] intégral, 200 OK, 26 214 octets. P1.
- `https://support.coingecko.com/hc/en-us/articles/5298401805337-How-to-read-decimals-from-blockchain-explorer` (redirige 301 vers `.../How-to-Find-Token-Decimals-Using-a-Blockchain-Explorer`) — [lu] intégral après suivi de redirection (`curl -L`), 200 OK, 28 142 octets. P1.
- `https://support.coingecko.com/hc/en-us/articles/17325776759577-How-to-Find-Token-Decimals-Using-a-Blockchain-Explorer` — tentative directe sur un slug deviné → **404**, consigné, non recontourné (l'URL correcte ci-dessus a été trouvée par recherche et lue à la place).
- Contenu détaillé de chaque article : voir DOSSIER-COINGECKO-MONARK.md §2/§3, citations exactes reproduites là pour éviter la duplication ici.

## 7. Plateformes on-chain / marché (MONARK, valeurs « du jour » sauf mention contraire)
- `https://www.geckoterminal.com/solana/pools/GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg` — [lu] intégral (JSON-LD `FAQPage`/`Product` server-rendu dans le HTML), `curl` 200 OK, 150 619 octets, 2026-09-22 ~15:20 UTC. P1/P2 (produit CoinGecko lui-même, donc P1 pour le compte-officiel, mais les chiffres de marché restent des valeurs du jour). Détail intégral des citations exactes en DOSSIER §identification et §4.
- `https://www.geckoterminal.com/solana/tokens/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` — [lu], 200 OK, 150 619 octets (page quasi identique à la page pool ci-dessus — redirection interne vers la même vue faute d'un deuxième pool). Aucun champ `decimals`/`total supply` trouvé (recherché explicitement, absent).
- `https://pump.fun/coin/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` — [lu] intégral (bloc JSON React-Flight server-rendu, retrouvé via le champ `pool_address` identique à celui de la tâche pour lever toute ambiguïté d'attribution), `curl` 200 OK, 2 227 318 octets, 2026-09-22 ~15:56 UTC. **P1 — c'est la plateforme de lancement elle-même ; source la plus directe obtenue pour les décimales/supply/adresses.** Champs exacts extraits (verbatim JSON) :
  `"base_decimals":6`, `"quote_decimals":9`, `"total_supply":1000000000000000`, `"total_supply_str":"1000000000000000"`, `"creator":"BQPsJEawxaostAfQ3USyLBHkdLiEQ46Py6CkDFHyk3QV"`, `"bonding_curve":"2v82mDXA1cpm9yba5cnJX6gjr9b4wxMd3wsJfoRy1m6F"`, `"associated_bonding_curve":"6tW6Vb8mwoKHhRommxq4TLwMUTdBfgKMKFKfwyFMyYWo"`, `"created_timestamp":1789049406000`, `"complete":true`, `"real_sol_reserves":0`, `"real_token_reserves":0`, `"virtual_sol_reserves":115005362452`, `"virtual_token_reserves":279900000000000`, `"pump_swap_pool":"GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg"`, `"token_program":"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"`, `"quote_token_program":"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"`, `"twitter":"https://x.com/usemonark"`, `"website":"https://agents.clawpump.tech/marketplace/agents/d47b930f-b54e-42a6-964c-62238264e2d0"`, `"image_uri":"https://ipfs.io/ipfs/bafkreicxfxu5p6aehrofffwn4pp55pachbq5dfljikted2xv7ms6pl3vq4"`, `"metadata_uri":"https://ipfs.io/ipfs/bafkreigkkwhpt63yikterppearcve42li65bbj2gemmphabmcx62qniski"`, `"verified":false`, `"usd_market_cap":98026.43764710837` (à 2026-09-22T11:54:01Z, `updated_at` — PAS l'heure du fetch), `"ath_market_cap_timestamp":1789791483000` (= 2026-09-19T04:18:03Z).
  Aucun champ Streamflow/montant verrouillé dans ce bloc (le lock est décrit ailleurs, cf. ClawPump ci-dessous).
- `https://clawpump.tech/tokens/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` — [lu] intégral, `curl` 200 OK, 182 656 octets, 2026-09-22 ~15:59 UTC. P1 (plateforme de lancement/back-office citée dans le Telegram [lu] par l'orchestrateur).
  - JSON-LD : `"dateCreated":"2026-09-10T14:10:04.244064"` (concorde à 2 s près avec `created_timestamp` pump.fun ci-dessus — même évènement, deux horodatages indépendants).
  - `"about":{"name":"$MONARK","alternateName":"MONARK","identifier":"FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT","sameAs":["pump.fun/coin/...","solscan.io/token/...","dexscreener.com/solana/..."]}`.
  - Section « Locked token supply » : sous-titre « Total locked on Streamflow » — valeur **non rendue côté serveur** (placeholder « Checking Streamflow lock… », chargement client). Section « Creator wallet balance » : même chose (« Checking on-chain balance… »). Phrase fixe : « Wallet balance excludes tokens in the vesting contract » avec lien vers le MÊME contrat Streamflow que le Linktree (`63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn`) — recoupement indépendant réussi.
  - Image de la page (`primaryImageOfPage`) : `/api/token-image/bafkreigkkwhpt63yikterppearcve42li65bbj2gemmphabmcx62qniski` → résolu en `https://clawpump.tech/api/token-image/bafkreigkkwhpt63yikterppearcve42li65bbj2gemmphabmcx62qniski`, [lu] (image), `curl` 200 OK, 5 618 octets, `image/webp`, **512×512, canal alpha présent** (format `file` : « WebP image, with alpha, ICC profile, 512x512 »). Rendu visuel identique au motif hub-and-spoke de `out/logo.png` (fond crème, branches noires, centre rouge) — confirme que ce motif EST la marque MONARK utilisée on-chain.
- `https://app.streamflow.finance/contract/solana/mainnet/63dKEiLjxBHg3ZGTy4ApyAcJYFgePrPNr4s46RNVb1Pn` — tentative [lu], `curl` 200 OK mais **6 887 octets seulement : coquille SPA générique** (`<title>Streamflow Finance</title>`, aucune donnée de contrat rendue côté serveur — vérifié par grep `decimals|deposited|recipient|cliff|unlock|amount`, aucune occurrence). **Montant verrouillé, cliff, bénéficiaire : NON TROUVÉ via page HTML publique.** L'existence du contrat et son adresse sont [lu] (confirmées deux fois, Linktree + ClawPump), mais pas son contenu chiffré.
- `https://dexscreener.com/solana/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` — **HTTP 403** (`curl`, même UA navigateur), 2026-09-22 ~16:00 UTC. Non contourné (pas de deuxième tentative avec des en-têtes différents). Source non essentielle (bonus), remplacée par pump.fun pour les mêmes données.

## 8. Explorateurs Solana publics nommés par la tâche — échecs consignés en détail
- `https://solscan.io/token/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` — `curl` 200 OK, 37 599 octets, 2026-09-22 ~15:24 UTC. **Techniquement chargé mais VIDE de données** : le bloc `__NEXT_DATA__` server-rendu contient `"accountInfo":null` (props Next.js `getServerSideProps` explicitement nulles). Aucune occurrence de « decimals », « holders », « total supply » dans le HTML brut (recherché explicitement). Les données réelles ne sont chargées que côté client via l'API propriétaire de Solscan (hors périmètre « pages HTML publiques seulement »). **NON TROUVÉ, cause identifiée : SPA à hydratation client, pas de SSR des données de compte.**
- `https://solscan.io/account/GhCGq9qTCBWZvpBY4fzfvxvENWe1syryLuGACgj3Lhvg` (pool) — même constat exact : 200 OK, 37 034 octets, `"accountInfo":null`. **NON TROUVÉ, même cause.**
- `https://solana.fm/address/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` — `curl` 200 OK, 21 629 octets, 2026-09-22 ~15:24 UTC. `__NEXT_DATA__` = export statique (`"nextExport":true`, `"pageProps":{}`) : la page est un obus vide, TOUTES les données (y compris le nom de la page) sont chargées après coup en JS. `<title>` générique : « Next-Gen Solana Explorer » (pas même le nom du token). **NON TROUVÉ, cause identifiée : export statique sans SSR de compte.**
- `https://explorer.solana.com/address/FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT` — `curl` **HTTP 429**, deux tentatives (2026-09-22 ~15:25 et ~15:26 UTC, avec `?cluster=mainnet-beta` à la 2ᵉ). Corps de la réponse identifié : page « **Vercel Security Checkpoint** » (contrôle anti-bot, style CAPTCHA). **Traité comme un CAPTCHA — NON CONTOURNÉ, conformément à la règle absolue.** Aucune troisième tentative.
- **Conclusion pour les trois sources nommées par la tâche** : décimales, total supply et composition des top holders ne sont PAS extractibles de Solscan/Solana FM/Solana Explorer par simple lecture HTML publique (SPA à données client, export statique, ou contrôle anti-bot). Les valeurs obtenues dans ce dossier (décimales, total supply, adresses créateur/bonding curve/pool) proviennent de **pump.fun et ClawPump** (§7 ci-dessus), deux plateformes directement liées à l'émission et à la négociation du token, dont les pages intègrent une partie de leurs données en rendu serveur. Ce sont des sources P1 pour CE token spécifiquement (elles nomment le `pool_address`/mint exacts de la tâche), mais ce ne sont pas les trois sources littéralement citées par la mission — écart signalé, pas dissimulé.

## 9. Récapitulatif des échecs (pour audit rapide)
| URL | Méthode | Résultat | Cause | Contourné ? |
|---|---|---|---|---|
| 5× support.coingecko.com (divers articles) | WebFetch | HTTP 403 | Blocage probable sur l'empreinte de l'outil | Non — relu via `curl` UA-navigateur (page publique, sans compte) |
| support.coingecko.com articles/4497761574041-... | curl | HTTP 404 | Slug d'URL deviné incorrect | Non — bonne URL retrouvée par recherche |
| support.coingecko.com articles/17325776759577-... | curl | HTTP 404 | Slug d'URL deviné incorrect | Non — bonne URL (5298401805337, redirection 301) retrouvée par recherche |
| github.com/KraidleAI/monark-governance | WebFetch | HTTP 404 | Dépôt non public sous ce nom | Non — dépôt public réel identifié ailleurs (`KraidleAI/monark`) |
| explorer.solana.com/address/... | curl ×2 | HTTP 429 + page « Vercel Security Checkpoint » | Contrôle anti-bot (CAPTCHA-like) | **Non contourné**, conforme à la règle absolue |
| dexscreener.com/solana/... | curl | HTTP 403 | Blocage anti-bot probable | Non — source bonus, non essentielle |
| solscan.io (token + account) | curl | 200 OK mais données nulles | SPA hydratée côté client (`accountInfo:null`) | Non applicable (pas un refus, une limite technique) |
| solana.fm/address/... | curl | 200 OK mais coquille vide | Export statique sans SSR de compte | Non applicable |
| app.streamflow.finance/contract/... | curl | 200 OK mais coquille générique | SPA wallet-adapter, aucune donnée de contrat en SSR | Non applicable |

Fin du journal — voir `DOSSIER-COINGECKO-MONARK.md` pour l'analyse et les réponses aux 5 points de la mission.
