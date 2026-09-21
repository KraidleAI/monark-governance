# G0 (BROUILLON) — GARDE-HELIUS-1b — Bell consomme `openGuardedClient` de `@monark/rpc-guard`

> **STATUT : BROUILLON de worker (proposition).** Aucun point n'est tranché : chaque décision est « proposée »,
> l'orchestrateur (Fable 5) vérifie adversarialement (R-21) et rend le G0 définitif. Les questions non couvertes par
> les sources du dépôt sont en **§13 QUESTIONS orchestrateur**. Ce fichier est une donnée brute, pas un message.

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Provenance** : worker DOCS `claude-opus-4-8[1m]`, 2026-09-21, contexte = rédaction du brouillon G0 de GARDE-HELIUS-1b
(Bell = temps 2, décision 117) ; réviseur = orchestrateur (R-21). Advisor intégré consulté une fois avant rédaction.
**R-20** : aucun commit, aucun workflow, aucun fichier du dépôt modifié. **Écritures UNIQUEMENT sous `F:\tmp\garde1b\`.**
**AUCUN réseau. Aucun secret lu** : aucun `.env*`/`*secret*` ouvert ; aucune URL à clé recopiée ; `F:\Monark` +
`F:\Monark-wt-garde2b` ouverts en LECTURE seule ; les worktrees NON touchés ; rien sur `C:`.

**Base de mesure** : `F:\Monark` `lot/etude-suite` HEAD **`430e99d`→`4ee3285`** (le tronc a AVANCÉ pendant la passe — un
autre process orchestrateur a committé ; lignes RE-CONFIRMÉES identiques, cf. MESURES M0) pour le code Bell (état post-2a,
**pré-2b-ii**) ; `F:\Monark-wt-garde2b` HEAD `f0a6f1d` (`lot/garde-helius-2b`, état **2b-i**) pour l'API du paquet. **Le lot
1b s'ouvre APRÈS la fusion de 2b-ii** ⇒ toutes les mesures ci-dessous sont **[à ré-mesurer au G1]** sur la base réelle (post-2b-ii).
Les `fichier:ligne` du paquet sont ceux de 2b-i ; ceux de Bell ceux de `430e99d` (les lots -f/a1-bis ont **déjà décalé**
les lignes du plan G0 lot 1, cf. §MESURES).

---

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de première main dans un fichier du dépôt à `fichier:ligne` (rejouable par l'orchestrateur ; cf. `MESURES.md`).
- **[mesuré]** = sortie d'une commande rejouée par ce worker (grep/`node --test`/`wc`), brute dans `MESURES.md`.
- **[2nd]** = chiffre lu dans un document (CHANTIERS, FAITS, dashboard) sans première main.
- **[à mesurer]** = projection de ce G0 (R-25 surtout), à confirmer au G1 par mesure sur la base réelle post-2b-ii.

---

## 1. Contexte, objet, et ce que 1b « branche »

**Chaîne du lot GARDE-HELIUS** [lu `docs/G7-lot-garde-helius-1a.md:25`] : 1a a livré le **paquet** `@monark/rpc-guard`
**`upcoming`** (aucun consommateur servi) ; 2a a ajouté le second opérateur payant Chainstack (RU) + le cœur
multi-opérateur ; 2b-i a livré la surface d'erreur (`RpcError` canonique, `classify.ts`, indice D6) — `PASS-AVEC-CORRECTIONS`,
fusionnable, C-G-1/C-G-3 en **entrée du G1 de 2b-ii** [lu `docs/G2-lot-garde-helius-2b-i.md:190,192`] ; 2b-ii migre le
**recorder Ukemi**. **1b est le lot qui BRANCHE le paquet côté Bell** : `openGuardedClient` cesse d'être `upcoming`
côté Solana quand une course Bell le consomme par un **chemin servi + test d'intégration non-LLM** (règle Branchement).

**Objet** : rendre non-reproductible l'incident HELIUS-1 **DANS le code Bell** — le dépôt PORTE encore les chemins qui le
rejouent (retry sous le tick, ledger dans `--out`, absent⇒0, leg hors budget). 1a a factorisé le mécanisme ; 1b le
substitue à chaque `makeBudgetedCall` local, chaque `fetch(` payant, chaque lecture de clé Bell.

**Dépendances d'ordre (dures)** :
1. **1b s'ouvre APRÈS la fusion de 2b-ii** [mission] : 2b touche les MÊMES fichiers du paquet (`transport.ts`,
   `classify.ts`, `errors.ts`, `client.ts`) ; ouvrir 1b avant créerait un conflit de fusion. 2b-ii branche `isRpcRevert`/
   `validateRevertData`/le vocabulaire au livre — 1b ne re-spécifie PAS ces pièces (cf. §11).
2. Les items C-G-1 (drift regex↔tableau) et C-G-3 (garde de code `isRpcRevert`) de 2b-i sont **BLOQUANTS pour le G1 de
   2b-ii** [lu `docs/G2-lot-garde-helius-2b-i.md:152,162`] ⇒ supposés soldés par 2b-ii, hors périmètre 1b.

**Ce que 1b NE fait PAS** : aucune course payante (Bell = temps 2, aucune course tirée ; cf. §11).

---

## 2. Exigences d'entrée énumérées → livrable ou item formé (kit §9.6)

| # | Exigence d'entrée (source) | Mesure de première main [lu/mesuré] | Traitement 1b |
|---|---|---|---|
| E-1 | **CONV-2 + phantom-fresh** (`universe-cli.ts:124-129`) [lu `docs/G7-lot-t1a-iii-a1-bis.md:26`] | Le commentaire `universe-cli.ts:124-129` nomme CONV-2 = « universe MIGRATES to `@monark/rpc-guard` C-8 » ; `mkdirp(a.out)` précède `readPriorCalls` ⇒ `--out` déplacé sur reprise ⇒ 0 [lu `universe-cli.ts:115,130`, `universe.ts:236-238`] | **L-2** (migration universe) + **D-6** (phantom-fresh borné) |
| E-2 | **`ledger-format-lock.test.ts:16-17` `RefMod` arité 5, `[], []`** [lu `docs/G7-lot-t1a-ii-b3d-f.md:18`] | Le vrai `rebase-crosscheck.ts:158-159 chainedLedgerEntry` est **arité 5** (`+pageEvents, pageHandoffs`) [lu] ; le `RefMod` du test le déclare **arité 3** (`packages/rpc-guard/test/ledger-format-lock.test.ts:16-17,32`) [lu] ; test **VERT mais vacueux** — `node --test` = `pass 1 fail 0` [mesuré], car `payloadSha(undefined,undefined)=sha('{}')` (undefined omis) [lu `rebase-crosscheck.ts:151-152`] | **L-1** (RefMod arité 5 + `[], []` + `payload_sha256` 10ᵉ clé) |
| E-3 | **dé-skip de `fetch_only_inside_client`** [lu `test/rpc-guard-fetch-only-inside-client.test.ts:79`] | Test SKIP « until 1b » ; portée = TOUT `apps/bell/src/**` ; en-tête = **14 hits mesurés sur base `514ee1a`** (lignes PÉRIMÉES) [lu `:14-24`] | **L-1..L-5** (chaque hit migré ou allowlist déclarée à déclencheur) + **L-5** (dé-skip final) |
| E-4 | **unité `requests`** (Helius crédits, Chainstack RU ; ADR A-1) [lu] | `OperatorClass.unit = "credits"|"ru"|"keyless"` — **`"requests"` RETIRÉ en 2a** [lu `client.ts:31`] ; item ADR « D-3 à déclencheur 1b » (Databento/Polygon en requêtes) [lu ADR l.100] | **D-3** (Databento/Polygon : re-introduire `requests` ou tick-compté) ; Bell Solana = Helius crédits [lu], Chainstack Solana = RU |
| E-5 | **8 603 RU solana-mainnet le 20/09 à rattacher** [lu `docs/CHANTIERS.md:571`] | `CHANTIERS.md:571` : « solana-mainnet 8 603 RU … le 2026-09-20 … déclencheur : GARDE-HELIUS-1b pour Solana » ; = FAITS Chainstack pt 11 [lu `FAITS-tarification-chainstack-2026-09-21.md:18`] | **Item orchestrateur** (rattachement au journal au 1ᵉʳ rapprochement Chainstack Solana ; §11) |

**Aucune de ces exigences n'est un « dû » nu** : chacune est un livrable L-n ou une décision D-n ou un item formé à
déclencheur nommé (§11).

---

## 3. Architecture cible et découpe (couture R-25 décidée d'emblée, ruling Q3)

**Contrainte la plus serrée = la dé-skip de `fetch_only_inside_client` (E-3)** : elle scanne TOUT `apps/bell/src/**` et
n'est verte QUE lorsque les **13 sites** (7 `fetch(` + 6 `env.<clé>`, **ré-mesurés** ci-dessous — lignes ≠ en-tête du
test, périmé sur `514ee1a`) sont migrés ou allowlistés à déclencheur. Le lot ne clôt (dé-skip) qu'au dernier sous-lot.

### 3.0 Les 13 sites, ré-mesurés sur `430e99d` [mesuré, cf. MESURES.md]

| Site | `fichier:ligne` (430e99d) [lu] | Opérateur | Sous-lot qui le retire |
|---|---|---|---|
| `fetchCall` POST | `apps/bell/src/rpc.ts:44` | Helius/Chainstack Solana (`BELL_SOLANA_RPC`) | 1b-ii |
| `bellSolanaCall` POST | `apps/bell/src/collect.ts:284` | Helius/Chainstack Solana | 1b-ii |
| `bellEthCall` POST | `apps/bell/src/ethereum.ts:64` | **keyless** ETH (`GET_LOGS_PROVIDERS`) | 1b-iii |
| `databentoGet` GET (Basic) | `apps/bell/src/close.ts:176` | Databento (`DATABENTO_API_KEY`) | 1b-iii ou allowlist (D-3) |
| `polygonGet` GET (Bearer) | `apps/bell/src/close.ts:191` | Polygon/Massive (`POLYGON_API_KEY`) | 1b-iii ou allowlist (D-3) |
| `liveHttpGet` GET (issuer) | `apps/bell/src/universe-cli.ts:267` | issuer PUBLIC keyless (crédit 0) | 1b-i |
| `liveRpcCall` POST | `apps/bell/src/universe-cli.ts:281` | Chainstack Solana | 1b-i |
| clé `CHAINSTACK_SOLANA_URL` ×3 | `universe-cli.ts:111,297,312` | Chainstack Solana | 1b-i |
| clé `BELL_SOLANA_RPC` | `rpc.ts:22` (`solanaEndpoints`) | Helius Solana | 1b-ii |
| clé `POLYGON_API_KEY` | `collect.ts:582` | Polygon | 1b-iii ou allowlist (D-3) |
| clé `DATABENTO_API_KEY` | `collect.ts:583` | Databento | 1b-iii ou allowlist (D-3) |

> **Finding [mesuré]** : `HELIUS_API_KEY` n'est PAS un accès `env.` dans `apps/bell/src` (commentaire seul, `rpc.ts:7`) ;
> Bell résout Helius via `BELL_SOLANA_RPC` (le transport 2b appose `?api-key=HELIUS_API_KEY` si présent, `transport.ts:68-69`).
> Le motif `undici` de l'en-tête du test (`universe-cli.ts:208` sur `514ee1a`) n'existe plus à `430e99d` (item 1a soldé
> par les décalages -f/a1-bis) — **à re-mesurer au G1** ; le grep doit toujours ignorer les commentaires.

### 3.1 Couture proposée (4 sous-lots, PR unitaires R-25 — aucun ne clôt seul)

| Sous-lot | Contenu | Consommateur (branchement) | Projection `ins+del` [à mesurer] |
|---|---|---|---|
| **1b-0 paquet** | extension `transport.ts` : opérateur `chainstack-solana` (`CHAINSTACK_SOLANA_URL`) + **chemin GET keyless `xstocks-issuer`** (le transport 2b est POST-JSON-RPC seul, `assertHostAllowed` porté) + **D-9 sémantiques durcies** (`redirect:"manual"` + 3xx typé, `retryAfterMs` sur `TransportError`) ; `tariff.ts` (`getAccountInfo`=1 RU Solana, FAITS pt 7) ; **L-1** (RefMod arité 5) ; table `--method-caps` Bell ; `bin` exécutable | AUCUN ⇒ **upcoming** | ≈ 350–600 |
| **1b-i universe** | `universe-cli.ts` (réordonne retry, 3 lectures clé, `openGuardedClient`, CONV-2/phantom-fresh D-6), `universe.ts` (`Fatal403Error` canonique, `readPriorCalls`), 2 `fetch(` retirés | courses `universe` Bell GATÉES ⇒ **BRANCHÉ** | ≈ 450–700 |
| **1b-ii collect Solana** | `collect.ts runMain` (`openGuardedClient`, suppr. `makeBudgetedCall` `:297`, `budgeted.*`→client), `rebase-crosscheck.ts` (suppr. `callsByMethod`, crédits dérivés), `quorum.ts`/`rpc.ts` (labels, dé-exporter `solanaEndpoints`), ré-export `BudgetExceededError` (4 fichiers) | courses collect/crosscheck/discover Bell GATÉES ⇒ **BRANCHÉ** | ≈ 550–900 |
| **1b-iii close/eth + dé-skip** | `ethereum.ts` (leg ETH keyless budgété), `close.ts` (Databento/Polygon, D-3), **dé-skip E-3** (T4 full-scope) | courses eth/cash Bell GATÉES + CI | ≈ 300–550 |

- **G7 du lot** couvre 1b-0 + 1b-i + 1b-ii + 1b-iii (un paquet sans consommateur n'est pas « built ») ; **aucun sous-lot
  ne clôt seul** (calque G0 lot 1 §8) [lu `docs/G0-lot-garde-helius.md:372`].
- **Chaque sous-lot livre un test ACTIF par-fichier** (`<file>_clean_of_fetch_and_keys`, calque du compagnon actif
  `rpc_guard_package_src_clean_and_allowlist_load_bearing` [lu `test/rpc-guard-fetch-only-inside-client.test.ts:68`]) ⇒ le
  progrès est PROUVÉ tandis que le `fetch_only_inside_client` full-scope reste SKIP jusqu'au 1b-iii.
- **Ré-mesure R-25 au G1** obligatoire ; si un sous-lot dépasse 1 150 mesuré, re-scinder (déclencheur nommé). §8.

---

## 4. Décisions D-n proposées (toutes « proposées » ; R-21)

- **D-1 — chemin public UNIQUE `openGuardedClient` ; `deps.call` conservé pour l'UNITÉ, pas pour l'intégration.**
  L'API n'expose que `openGuardedClient(env, limits, ledgerDir, cycles, opts)` [lu `index.ts:7`, `guarded.ts:19-25`]. Les
  cœurs Bell (`runUniverse`, `runMain`) gardent leur couture `deps` pour les tests unitaires offline ; MAIS le **test
  d'intégration** (§5, tuyau) DOIT passer par `openGuardedClient` réel + espion `globalThis.fetch` (calque 2b L-2-3
  `ukemi_record_spends_only_through_guard` [lu ADR l.28]) : un test qui injecte encore `deps.call` NE PROUVE PAS le
  branchement. `openGuardedClient` n'a **PAS d'injection de transport** (`TransportOpts` = `timeoutMs`/`onTransportError`
  seuls [lu `transport.ts:52`]) ⇒ l'espion est sur `globalThis.fetch`.

- **D-2 — UNE couche de retry chez l'appelant (INVERSION du H-B `universe-cli.ts:136`).** Aujourd'hui `pacedInner` fait
  `withUniverseRetry(() => deps.call(...))` PUIS `makeUniverseBudget(..., pacedInner)` [lu `universe-cli.ts:136-137`] ⇒ R
  retries = 1 unité comptée (H-B, DANS le dépôt). Le client fait EXACTEMENT une tentative (`call` = 1 ligne write-ahead +
  1 transport, pas de retry [lu `client.ts:131-135`]). 1b réordonne : `withUniverseRetry(() => client.call(op,m,p))` —
  chaque retry ré-entre le client ⇒ chaque tentative comptée. `withRetry`/`withUniverseRetry` re-jettent
  `BudgetExceededError` EN PREMIER (déjà le cas [lu `quorum.ts:122`, `universe.ts:121`]).

- **D-3 — Databento/Polygon : `requests` retiré ⇒ deux options, question ouverte.** `unit:"requests"` supprimé en 2a
  [lu `client.ts:31`, ADR l.100 « item D-3 à déclencheur 1b »] ; décision 115 : Databento/Polygon en **requêtes/cycle**,
  chiffre « posé au G1 depuis leurs quotas lus sur place » [lu `CHANTIERS.md:489`] = **acte orchestrateur, jamais deviné**.
  Le transport ne fait qu'un POST JSON-RPC [lu `transport.ts:162`] ; ce sont des **GET Basic/Bearer** [lu `close.ts:176,191`].
  *Options proposées (→ QUESTION §13)* : **(a)** sous-lot 1b-iii-bis dédié APRÈS lecture sur place des quotas (engage de
  l'argent ⇒ **checkpoint-1 delta**), le transport gagne un mode GET + un opérateur `unit:"requests"` ré-introduit
  (`cycleCap` en requêtes) ; **(b)** `close.ts` reste une **entrée d'allowlist DÉCLARÉE à déclencheur** (précédent
  `apps/sentinel/src/rpc.ts`, décision investisseur 118 option B [lu `docs/G0-lot-garde-helius.md:492-493`]) — Databento/
  Polygon hors garde pour temps 2, mutant « allowlist élargie sans déclencheur » ROUGE. **Reco de brouillon : (b)** —
  aucune course cash n'est tirée à 1b, l'option (a) engage de l'argent sans besoin ; option (a) au déclencheur « course
  cash Bell ». Ni (a) ni (b) n'est un « dû » nu.

- **D-4 — Chainstack Solana ≠ Chainstack ETH : un compte, un cap 16 M RU, dashboard PAR RÉSEAU ⇒ risque fail-open.**
  Mesuré [lu `FAITS-tarification-chainstack-2026-09-21.md:16,18`] : UN compte, 5 nœuds élastiques (dont solana ET ethereum),
  compteur PAR RÉSEAU et par jour (ethereum-mainnet 4 258 RU ; solana-mainnet 8 603 RU le 20/09). Le transport 2b résout
  `chainstack` = **CHAINSTACK_ETH_URL** (ETH) avec `cycleCap = 16 000 000` [lu `transport.ts:73-76`]. Bell a besoin de
  **Chainstack SOLANA** (`CHAINSTACK_SOLANA_URL`, `universe-cli.ts:111`) — un opérateur DISTINCT. Si 1b crée `chainstack-solana`
  avec SON propre cap 16 M, le total du **compte** peut atteindre 32 M ⇒ **fail-open au niveau compte** (décision 115 fixe
  16 M pour « Chainstack », pas par réseau). *Options (→ QUESTION §13)* : **(i)** un seul opérateur `chainstack` avec URL
  routée par méthode/réseau (un seul cap, un seul ledger) ; **(ii)** deux labels avec un cap **partagé/scindé** (sous-caps
  sommant à 16 M). Bell (Solana, temps 2) et Ukemi (ETH, temps 1) courent à des moments distincts, mais le cap doit rester
  fail-closed au niveau compte. **Ne PAS livrer deux caps 16 M indépendants.**

- **D-5 — `tariff.ts` : `getAccountInfo` sur Chainstack Solana = 1 RU (FAITS pt 7), extension SOURCÉE.** Bell **envoie** sur
  Solana **4 méthodes** [mesuré, §MESURES M4, grep des littéraux entre guillemets] : `getAccountInfo`, `getSignaturesForAddress`,
  `getTransaction`, `getTransactionsForAddress` (`getTokenAccountsByOwner` n'apparaît qu'en PROSE de commentaire dans
  `pools.ts` — PAS une méthode envoyée, à re-vérifier au G1). `chainstackRu` price déjà `getSignaturesForAddress`/`getTransaction`
  = 2 RU (`CHAINSTACK_ARCHIVABLE_SOLANA` [lu `tariff.ts:54-57`]) mais **THROW `unknown_method`** pour `getAccountInfo` (aucun
  set 1-RU Solana) [lu `tariff.ts:71-77`]. FAITS pt 7 : « toute autre méthode Solana = 1 RU » [lu `FAITS…chainstack:10`] ⇒ 1b
  ajoute un set ÉNUMÉRÉ `CHAINSTACK_ONE_RU_SOLANA = {getAccountInfo}` (jamais un défaut blanket qui casserait le fail-closed).
  Côté Helius, les 4 méthodes sont TOUTES couvertes par `heliusCredits` (gTfA=10, reste=1) [lu `tariff.ts:12-22`] — aucune
  extension Helius. `getTransactionsForAddress` est **HELIUS-EXCLUSIF** [lu `discover.ts:185`, `rebase-produce.ts:112`] ⇒ ne
  doit JAMAIS être routé vers Chainstack (le routage + `--method-caps` le garantit ; sinon `chainstackRu` throw, fail-closed).

- **D-6 — Phantom-fresh : le ledger de RUN (a1-bis) reste ; le ledger de CYCLE devient la garde-argent.** Le run-ledger
  (`budget.json` ancre + journal chaîné dans `--out`) est un artefact de PROVENANCE a1-bis avec test de composition [lu
  `docs/G7-lot-t1a-iii-a1-bis.md:23`] : le CONSERVER. Le défaut phantom-fresh (`--out` déplacé ⇒ `readPriorCalls`=0
  [lu `universe.ts:236-238`]) est **borné par `--max-calls` par run** [lu `universe-cli.ts:126`] mais rejoue HELIUS-1
  entre runs. 1b le ferme par le **ledger de CYCLE du garde** : parent `HELIUS_LEDGER_DIR` DOIT pré-exister (throw sinon,
  C-8 [lu `guarded.ts:49`]) et `prior = max(floor, Σ_at_open)` [lu `client.ts:85-87`] ⇒ supprimer/déplacer le `--out` ne
  rouvre PAS le budget de cycle. **Test/mutant** : `universe_out_moved_on_resume_keeps_cycle_prior` (déplacer `--out` ⇒
  le prior de cycle inchangé, la course refuse au cap) ; mutant « parent auto-créé » ROUGE. Résidu DÉCLARÉ (borné) : le
  run-ledger phantom-fresh subsiste pour le COMPTE de run (`--max-calls`), le CYCLE est la garde.

- **D-7 — ETH leg keyless (correction du plan §2.0).** `bellEthCall` ne lit AUCUNE clé [lu `ethereum.ts:60-70`] ;
  `liveEthSwaps` utilise `GET_LOGS_PROVIDERS` (keyless : drpc/mevblocker/nodies/pocket/tenderly) [lu `ethereum.ts:76`,
  `transport.ts:34-35`]. Le plan G0 lot 1 §2.0 le classait « Chainstack ETH payant » — **inexact pour l'état mesuré**.
  Donc : leg ETH = labels keyless, **coût 0, compté** (`--max-calls`). Le défaut « hors budget » (`collect.ts:651`
  n'injecte pas de call budgété [lu]) est réel ; 1b le budgète via `client` sur les labels keyless.

- **D-8 — `--method-caps` non-vacant (contrat C-V-5).** `assertLimits` exige une table non-vide sur un opérateur payant
  [lu `client.ts:75`] ; une méthode non listée ⇒ `refused method_cap_unlisted` [lu `client.ts:115`]. 1b LIVRE la table
  fermée des **4 méthodes** Bell (§7-C-3) : `{getSignaturesForAddress, getTransaction, getAccountInfo, getTransactionsForAddress}`
  — chaque méthode utilisée est listée avec son cap (gTfA BAS, le vecteur HELIUS-1).

- **D-9 — PORT des sémantiques durcies a1-bis/quorum (sinon régression SILENCIEUSE à la migration).** Le transport 2b fait
  `fetch(url, {method:"POST", headers, body, signal})` **SANS `redirect`** (défaut `"follow"`) et **NE LIT PAS** `retry-after`
  [lu `transport.ts:162`]. Or les appels live universe (`liveRpcCall`/`liveHttpGet`) posent `redirect:"manual"` + 3xx ⇒
  `RedirectBlockedError` HARD STOP (C-G2-3 : le corps ne doit JAMAIS atteindre un hôte hors-allowlist) [lu `universe-cli.ts:267-283`],
  et `withUniverseRetry` honore `Retry-After` (`e.retryAfterMs`) et transforme un 403 en `Fatal403Error` [lu `universe.ts:122,125`].
  `quorum.ts` porte une taxonomie PARALLÈLE (`SolRpcError`/`isSolRevert`, `statusOf` regex `/\bHTTP\s+(\d{3})\b/` [lu `quorum.ts:36-56`])
  distincte du `RpcError` canonique 2b-i. **Migrer le `fetch` dans le transport SANS porter ces sémantiques = régression
  silencieuse** (les tests a1-bis qui injectent `deps.call`/`deps.httpGet` levant `HttpStatusError`/`RedirectBlockedError`
  restent VERTS pendant que le chemin live perd la protection — même piège que L-1). *Déliverables* : (1b-0) le transport gagne
  `redirect:"manual"` + une erreur 3xx TYPÉE + `retryAfterMs` sur `TransportError` ; (1b-i) `withUniverseRetry` s'adapte à
  `TransportError.code`/le 3xx typé (403 hard-stop conservé) ; (1b-ii) `statusOf`/`isSolRevert` réconciliés sur
  `TransportError`/`RpcError.code` (le quorum Bell consomme `RpcError.code`, pas `SolRpcError`). Tests/mutants en §7 (via
  `openGuardedClient` + espion `globalThis.fetch`, JAMAIS via `deps`).

---

## 5. Tuyaux déclarés (entrée / sortie / état / test — Bell devient consommateur SERVI)

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État (où) | Test d'intégration NON-LLM |
|---|---|---|---|---|
| `runUniverse` gardé (1b-i) | `openGuardedClient(env, limits, dir, {solana-foundation, chainstack-solana, xstocks-issuer})` ; floor/cycle/method-caps (orchestrateur) | course `universe` Bell GATÉE (exit code) | ledger `<HELIUS_LEDGER_DIR>/<cycle>/{chainstack-solana,solana-foundation,xstocks-issuer}.{jsonl,head,lock}` (helius si `BELL_SOLANA_RPC` posé) | **IT-1** `universe_spends_only_through_guard` (espion `globalThis.fetch` : chaque `fetch` payant précédé de sa ligne ledger sur DISQUE, via `runUniverse` réel) |
| `runMain` collect gardé (1b-ii) | idem | courses collect/crosscheck/discover Bell GATÉES | idem + `budget.json` de run DÉRIVÉ de `client.spent()` | **IT-2** `collect_spends_only_through_guard` ; **IT-3** `crosscheck_credits_derived_from_ledger` (crédits = `Σ requêtes×tarif`, plus de `callsByMethod` local) |
| leg ETH gardé (1b-iii) | `client` sur labels keyless | course eth Bell GATÉE | ledger keyless (coût 0, compté) | **IT-4** `eth_leg_budgeted_and_keyless` |
| dé-skip CI (1b-iii) | scanner `test/rpc-guard-fetch-only-inside-client.test.ts` | CI (rouge si un `fetch(`/clé hors garde) | — | **T4** `fetch_only_inside_client` ACTIF (14→0 hits) |

**Branchement (formulation prudente — anti over-claim)** : à la fusion de 1b-i, Bell devient un **consommateur** de
`openGuardedClient` avec **test d'intégration non-LLM** (IT-1) — le **code est branché, le tuyau prouvé** (composition
argv → ligne ledger sur disque → transport, rejouée offline). **MAIS le registre reste `upcoming`** jusqu'à la **première
course RAPPROCHÉE** — précédent 2b explicite : « paquet et recorder gardé restent `upcoming` jusqu'à la première course
rapprochée » [lu `docs/G0-ADDENDUM-lot-garde-helius-2.md:30`] ; Bell = temps 2, aucune course tirée, tout `upcoming`
[lu `docs/G7-lot-t1a-iii-a1-bis.md:23`]. **Un tuyau absent = item formé à déclencheur** : Databento/Polygon (D-3), la course
elle-même (temps 2, §11).

---

## 6. Invariants byte-identiques (fichiers gelés — NE PAS toucher ; sha au G1)

> **Attention (R-21)** : `universe-cli.ts`, `universe.ts`, `rebase-crosscheck.ts`, `collect.ts`, `quorum.ts`, `rpc.ts`
> sont des **CIBLES de migration**, PAS des fichiers gelés. Les invariants portent sur : (a) des fichiers hors migration,
> (b) des FORMATS que la migration doit reproduire byte-pour-byte.

- **Format du ledger de PAGE du crosscheck** (lot -f, condition (f)) : `chainedLedgerEntry`/`verifyLedgerChain` — core en
  ORDRE d'écriture (`prev..list_sha256`) PUIS `payload_sha256` en **10ᵉ champ**, `entry_sha256 = sha(JSON.stringify(core))`,
  C-F-1 (`payload_sha256` absent ⇒ refusé) [lu `rebase-crosscheck.ts:126-203`]. La suppression de `callsByMethod` (1b-ii)
  NE DOIT PAS altérer ce format. Verrouillé par `ledger_format_locked_to_rebase_crosscheck` (rendu non-vacueux par L-1) +
  `bell_crosscheck_resume_refuses_edited_payload` [lu `docs/G7-lot-t1a-ii-b3d-f.md:26`] + `…rederives_committing_page_payload`.
- **`PINNED_BELL_SHA`** [lu `apps/bell/src/collect.ts:173`] — le digest Bell ; inchangé par la migration (rewiring du budget,
  pas du calcul).
- **`PINNED_DIGEST 267cd991…`** et **`book_digest 034fbff9…`** [2nd `docs/G2-lot-garde-helius-2b-i.md:111`] — épinglés par
  leurs tests (verts) ; hors périmètre 1b (Ukemi).
- **Pré-enregistrement §2 `7071484f…`** (lot -f) [2nd `docs/G7-lot-t1a-ii-b3d-f.md:8`].
- **Gel U-4b (7 fichiers, ADR-U4b D4)** [2nd `docs/CHECKPOINT2-lot-garde-helius-2b-i.md:33`] : `u4b-scores.mjs 9ad20666`,
  `u4b-reduce.mjs a5e66cd3`, `record-u4b-calib.mjs 5733daeb`, **`apps/sentinel/src/rpc.ts 0e232519`**, `wadray.ts 7bee76fc`,
  `abi.ts 3376eb08`, `l1-split.ts 9206df91` — 1b ne touche NI `apps/sentinel/**` NI `scripts/census/u4b/**`.
- **Fixtures** `apps/bell/test/fixtures/series/rebase/**` (séries fondatrices, décision 60) — byte-identiques (les courses
  offline rejouent contre elles). **[Sha exacts à figer au G1]** (item formé, déclencheur = G1 ; les 3 sha ci-dessus tronqués
  au préfixe visible dans les revues).

---

## 7. Tests imposés (noms exacts) + mutants nommés

**Règle Branchement** : chaque pièce « built » a un test d'intégration non-LLM rejouant la composition de bout en bout.
Liste FERMÉE proposée (offline, espion `globalThis.fetch`, fixtures ; **[à compléter/renuméroter au G1]**) :

| # | Test (nom exact proposé) | Ce qu'il prouve | Sous-lot |
|---|---|---|---|
| **L-1** | `ledger_format_locked_to_rebase_crosscheck` (RENDU NON-VACUEUX) | `RefMod.chainedLedgerEntry` typé **arité 5** ; appel `ref.chainedLedgerEntry(genesis,1,[…],[], [])` ; `payload_sha256` assérté 10ᵉ clé du core ; reproduit le calque byte-pour-byte | 1b-0 |
| **T4** | `fetch_only_inside_client` (dé-skippé) | 0 `fetch(`/`node:http`/`undici`/`child_process`/`env.<clé>` hors `transport.ts` (+ allowlist D-3 déclarée) sur TOUT `apps/bell/src/**` | 1b-iii |
| **T4a..e** | `<file>_clean_of_fetch_and_keys` (universe-cli/collect/rpc/ethereum/close) | par-fichier ACTIF, prouve le progrès pendant que T4 reste SKIP | par sous-lot |
| **IT-1** | `universe_spends_only_through_guard` | via `runUniverse` réel + `openGuardedClient` : chaque `fetch` payant précédé de sa ligne ledger sur DISQUE (P6) | 1b-i |
| **IT-2** | `collect_spends_only_through_guard` | idem via `runMain` réel | 1b-ii |
| **IT-3** | `crosscheck_credits_derived_from_ledger` | crédits = `Σ requêtes×tarif` du ledger ; `callsByMethod` local supprimé | 1b-ii |
| **D-2** | `universe_retry_counts_each_attempt` | R retries appelant ⇒ R+1 lignes `attempted` (retry ré-ordonné au-dessus du client) | 1b-i |
| **D-6** | `universe_out_moved_on_resume_keeps_cycle_prior` | `--out` déplacé ⇒ prior de CYCLE inchangé (parent pré-existe, `prior=max(floor,Σ)`) ; course refuse au cap | 1b-i |
| **D-4** | `chainstack_solana_and_eth_share_one_cycle_cap` | deux réseaux Chainstack ne cumulent PAS deux caps 16 M (cap compte fail-closed) | 1b-0 |
| **D-5** | `chainstack_solana_getaccountinfo_is_one_ru` | `getAccountInfo` sur `chainstack-solana` = 1 RU (FAITS pt 7) ; méthode absente ⇒ `unknown_method` | 1b-0 |
| **C-3** | `bell_method_caps_table_covers_every_called_method` | la table `--method-caps` couvre les 5 méthodes Bell ; une méthode appelée non listée ⇒ throw à la construction | 1b-0 |
| **D-1** | `bell_course_reaches_fetch_only_via_openGuardedClient` | aucun chemin servi n'atteint `fetch` sans passer par `openGuardedClient` (sonde fonctionnelle, pas scan de chaînes) | 1b-i |
| **D-9a** | `transport_3xx_is_hard_stop_never_followed` | un 302 sur un opérateur ⇒ erreur 3xx typée (hard stop), corps jamais envoyé à l'hôte redirigé (C-G2-3 préservé) | 1b-0 |
| **D-9b** | `transport_403_is_fatal_hard_stop` | un 403 ⇒ hard stop propagé (calque `Fatal403Error`), jamais retryé | 1b-0/i |
| **D-9c** | `universe_retry_after_is_honored_post_migration` | `Retry-After` du 429 respecté via `TransportError.retryAfterMs` (item pré-enregistré `universe-cli.ts:246`) | 1b-i |

**Mutants nommés (chacun DOIT rougir UN test de la liste ; aucun ne nomme un test absent)** :

| Mutant | Défaut rejoué (`fichier:ligne`) | Test qui rougit |
|---|---|---|
| retry SOUS le tick (non réordonné) | `universe-cli.ts:136` [lu] | **D-2** |
| `RefMod` arité 3 (payload non engagé) | `ledger-format-lock.test.ts:16-17` [lu] | **L-1** |
| parent auto-créé (mkdir recursif) | `guarded.ts:49` calque | **D-6** |
| deux caps 16 M indépendants (Solana+ETH) | `transport.ts:76` | **D-4** |
| `getAccountInfo` tarifé par défaut (pas fail-closed) | `tariff.ts:75-76` | **D-5** |
| `makeBudgetedCall` local restauré | `collect.ts:297` [lu] | **IT-2** |
| `callsByMethod` local restauré | `rebase-crosscheck.ts:635,717` [lu] | **IT-3** |
| allowlist élargie sans déclencheur | scanner T4 | **T4** |
| `fetch(` payant sans ligne ledger (append après fetch) | client calque | **IT-1** |
| redirect suivi (transport sans `redirect:"manual"`) | `transport.ts:162` [lu] | **D-9a** |
| 403 non hard-stop après migration | `transport.ts` / `universe.ts:122` | **D-9b** |
| Retry-After ignoré (transport ne lit pas l'en-tête) | `transport.ts:162` [lu] | **D-9c** |

---

## 8. Estimation R-25 mesurée + couture de repli

**Mesuré [MESURES.md]** : la métrique CI = `ins+del`, pathspec `ci.yml:65`, plafond **1 205** (docs exclus) [lu `docs/G0-lot-garde-helius.md:356`]. Grandeurs de churn Bell :
- **Fichiers cibles src** : `collect.ts` 702, `universe-cli.ts` 316, `universe.ts` 494, `rebase-crosscheck.ts` 773,
  `quorum.ts` 136, `rpc.ts` 137, `ethereum.ts` 91, `close.ts` 194 lignes [mesuré `wc -l`].
- **`makeBudgetedCall`** = 20 occurrences Bell / 6 fichiers, dont **14 dans 3 fichiers de TEST**
  (`universe.test.ts` 3, `rebase-crosscheck.test.ts` 8, `collect.test.ts` 3) [mesuré] ⇒ la suppression casse ces imports.
- **`callsByMethod`** = 26 occurrences Bell [mesuré] ⇒ suppression au profit de la ventilation `(op,method)` du ledger.
- **`budgeted.`** 9, **`solProviders`** 8, **`readPriorCalls/ByMethod`** 11, **`BudgetExceededError`** dans **8 fichiers
  src Bell** (ré-export) [mesuré].

**Projection [à mesurer au G1]** : la migration monolithique dépasse **largement 1 150** (churn cumulé src + réécriture de
~14 sites de test `makeBudgetedCall` + 26 sites `callsByMethod` + extension transport/tarif). **La scission est donc
OBLIGATOIRE** (ruling Q3, « scission d'emblée », déjà dans le plan lot 1 [lu `docs/G0-lot-garde-helius.md:361`]). La couture
§3.1 (4 sous-lots) vise chaque PR **≤ 1 150** ; le sous-lot le plus lourd (**1b-ii collect Solana**, ≈ 550–900) est le risque
— **couture de repli si 1b-ii > 1 150 mesuré au G1** : scinder `collect.ts runMain`+`rpc.ts`+`quorum.ts` (1b-ii-a) de
`rebase-crosscheck.ts` (`callsByMethod`, 1b-ii-b), déclencheur nommé « G1 1b-ii > 1 150 ».

**Mitigation churn (ruling Q7, mesurée applicable)** : `OperatorLabel` = string branchée [lu `client.ts:13`] ⇒ les stubs
de test `(u,m,p)` où `u` est un nom nu **compilent inchangés** (le label EST une string). Cela BORNE le churn des ~190
occurrences `[Pp]rovider` (163 Bell [mesuré]) aux SIGNATURES, pas aux stubs — MAIS ne mitige PAS la suppression de
`makeBudgetedCall`/`callsByMethod` (symboles supprimés, imports cassés), qui reste le poste dominant de 1b-ii.

---

## 9. Oracle (proposé)

- **Par sous-lot** : `npm run ci` (gate:vocab + typecheck + `node --test`) exit 0 ; `npm run lint` exit 0 ; `npm run
  lint:ratchet` (plafond figé) ; `npm run lang:gate`. **Codes de retour capturés DIRECTEMENT, jamais après un pipe**
  (règle a1-bis C-VD-1 [lu `docs/G7-lot-t1a-iii-a1-bis.md:31`]).
- **Oracle sur l'arbre FUSIONNÉ** (règle ADR-C01 complément 1 : les interactions inter-lots — TS2554 arité — ne se voient
  qu'à la fusion [lu `docs/G7-lot-t1a-iii-a1-bis.md:5`]).
- **Mutants** : chacun ROUGE sur son test nommé, restauration byte-exacte (sha256 worktree vs snapshot).
- **`npm ci --offline`** rejoué si `package-lock.json` édité (nouveau `bin` du paquet).
- **R-25** : `git diff --shortstat <base>..<head> -- <pathspec verbatim ci.yml:65>` par sous-lot, ≤ 1 205.

---

## 10. Critères d'acceptation (proposés)

1. **E-1..E-5 traités** : chaque exigence d'entrée est un L-n livré OU un item formé à déclencheur nommé (§2, §11).
2. **T4 `fetch_only_inside_client` ACTIF et VERT** au terme de 1b-iii (14→0 hits ré-mesurés ; allowlist = `transport.ts`
   [+ close.ts déclaré si D-3(b)]) ; mutant « allowlist élargie sans déclencheur » ROUGE.
3. **Bell consommateur (code branché, tuyau prouvé)** : ≥ 1 chemin (`universe`) consomme `openGuardedClient` réel + test
   d'intégration non-LLM (IT-1) via espion `globalThis.fetch` ; **le registre reste `upcoming`** jusqu'à la première course
   rapprochée (précédent 2b, §5) — 1b ne « built » pas le paquet, il le BRANCHE.
4. **Invariants byte-identiques tenus** (§6 ; sha au G1) — format ledger de page, `PINNED_BELL_SHA`, gel U-4b.
5. **L-1 rend le lock non-vacueux** (RefMod arité 5, `payload_sha256` 10ᵉ clé).
6. **Zéro dette nue** : Databento/Polygon (D-3), 8 603 RU (E-5), course (temps 2) = items formés à déclencheur.
7. **G7 couvre les 4 sous-lots** ; aucun ne clôt seul ; `error_origin` assigné.

---

## 11. HORS lot (déclaré)

- **La course de contre-vérification Bell (~5,4 M cr Helius, plusieurs jours)** [lu `docs/CHANTIERS.md:540,562`] — Bell =
  temps 2 ; 1b livre la GARDE, pas la course.
- **Question C-F-4** (ancrage externe par page) : **ESCALADE-INVESTISSEUR au G0 de la course** [lu `docs/G7-lot-t1a-ii-b3d-f.md:19`,
  `docs/CHANTIERS.md:562`] — pas dans 1b.
- **Plafond ~5,4 M cr** : question investisseur au G0 de course [lu `docs/CHANTIERS.md:540`] — pas dans 1b (les caps de
  cycle 8 M/16 M restent des gardes anti-BUG, décision 112/115 [lu `docs/CHANTIERS.md:561`]).
- **`BELL_SOLANA_RPC` + `HELIUS_API_KEY`** : variables ABSENTES de l'env (CI tourne sans elles [lu `docs/CHANTIERS.md:344`] ;
  le transport exige `BELL_SOLANA_RPC` non-vide pour résoudre `helius` [lu `transport.ts:65-71`]) — **posées par l'investisseur
  AVANT la course** (kit §10.5), pas par 1b.
- **`HELIUS_LEDGER_DIR` pré-existant, `HELIUS_CYCLE_ID`, floor lu sur place** : entrées de course, orchestrateur avant la
  course (décision 114 [lu `docs/G0-lot-garde-helius.md:419`]).
- **8 603 RU solana-mainnet 20/09** : rattachement au journal Chainstack Solana au 1ᵉʳ rapprochement = **item orchestrateur**
  (déclencheur : 1ʳᵉ course/rapprochement Chainstack Solana) [lu `docs/CHANTIERS.md:571`].
- **2b-i (RpcError, `classify.ts`, indice D6, `isRpcRevert`, `validateRevertData`)** : livré par 2b — 1b NE re-spécifie PAS
  (référence `docs/G2-lot-garde-helius-2b-i.md`, `docs/CHECKPOINT2-lot-garde-helius-2b-i.md`).
- **Job quotidien sentinel / `apps/sentinel/**`** : hors périmètre (lot NARABI-OPS-1d, décision 118 [lu `docs/G0-lot-garde-helius.md:492-493`]).
- **Databento/Polygon (D-3 option a)** : au déclencheur « course cash Bell » si l'option (a) est retenue.

---

## 12. Risques MAST (checklist de risque résiduel, doc 06)

| Mode MAST | Risque ici | Atténuation (section) |
|---|---|---|
| **Budget non attribué (HELIUS-1)** | retry sous le tick (`universe-cli.ts:136`), ledger dans `--out`, leg ETH hors budget | D-2 (une couche), D-6 (cycle ledger), D-7 (leg budgété) |
| **Fail-open silencieux (multi-réseau)** | deux caps 16 M Chainstack (Solana+ETH) ⇒ compte à 32 M | **D-4** (cap compte fail-closed, test dédié) |
| **Information-withholding** | `getAccountInfo` Chainstack tarifé par défaut | D-5 (fail-closed, extension sourcée FAITS pt 7) |
| **Fail-open (identité d'erreur)** | `BudgetExceededError`/`Fatal403Error` non ré-exporté ⇒ `instanceof` cassé (8 fichiers Bell) | ré-export canonique (1b-ii) ; `Fatal403Error` étend la classe canonique [lu `universe.ts:96`] |
| **No-attempt-to-verify** | garde « built » sans preuve ; test qui injecte `deps.call` | D-1 (IT via `openGuardedClient` réel + espion fetch) |
| **Incorrect-verification** | lock-test vacueux (arité 3) ; grep sur base périmée `514ee1a` | L-1 (non-vacueux) ; ré-mesure des 13 sites au G1 |
| **Régression silencieuse (protocole)** | migration du `fetch` dans le transport POST-only ⇒ perte de redirect:manual/3xx, Retry-After, 403 hard-stop, statusOf ; tests `deps`-injectés restent verts | **D-9** (port des sémantiques ; tests via `openGuardedClient`+espion fetch, pas `deps`) |
| **Spec-gaming / over-claim** | « aucun appel payant hors garde » avec Databento/Polygon non migrés | D-3 (allowlist DÉCLARÉE à déclencheur, jamais silencieuse) |
| **Task derailment** | migration qui déborde sur `apps/sentinel/**` / gel U-4b | périmètre `apps/bell/src` + `packages/rpc-guard` ; sha U-4b (§6) |

---

## 13. QUESTIONS orchestrateur (non couvertes par les sources — verdict dû)

1. **[D-3] Databento/Polygon** : option (a) sous-lot dédié après lecture sur place des quotas (engage de l'argent ⇒
   checkpoint-1 delta) **ou** (b) `close.ts` en allowlist DÉCLARÉE à déclencheur « course cash Bell » ? *(Reco brouillon : b.)*
   Impact : la dé-skip T4 (E-3) dépend du choix (si b, l'allowlist du scanner gagne `apps/bell/src/close.ts`).
2. **[D-4] Cap Chainstack multi-réseau** : la décision 115 « 16 M RU » est-elle le cap du **compte** (⇒ Solana+ETH partagent
   16 M, sous-caps à définir) ou **par réseau** (⇒ 16 M Solana + 16 M ETH, à ratifier) ? Le dashboard est par réseau ; le
   compte est unique (FAITS pt 9). **Décision de valeur** — verdict investisseur possible.
3. **Périmètre servi minimal de 1b** : suffit-il que **1b-i (universe)** branche Bell (chemin servi + IT-1) pour lever
   `upcoming` côté Solana, la migration collect/eth (1b-ii/iii) restant des sous-lots du même G7 ? Ou le G7 exige-t-il TOUTE
   la migration Bell avant de lever `upcoming` ?
4. **`OperatorLabel` du 3ᵉ opérateur Chainstack Solana** : nom du label (`chainstack-solana` proposé) et clé env
   (`CHAINSTACK_SOLANA_URL` existante [lu `universe-cli.ts:111`]) — à confirmer (le transport 2b nomme `chainstack` l'ETH).
5. **Ledger-format-lock : emplacement du fichier** — la mission cite `apps/bell/test/ledger-format-lock.test.ts` (INEXISTANT
   [mesuré]) ; le fichier réel est `packages/rpc-guard/test/ledger-format-lock.test.ts:16-17,32` [lu]. Confirmer que L-1 vise
   bien ce dernier.
6. **`bin` exécutable** (item 1b accepté [lu `docs/CHECKPOINT2-lot-garde-helius-1a.md:63`]) : dans 1b-0 (paquet) ou 1b-i
   (premier consommateur) ?
7. **[D-9] Chemin GET dans le transport** : l'issuer GET keyless (`liveHttpGet`, `universe-cli.ts:267`) + le port des
   sémantiques durcies (redirect:"manual", Retry-After, 403 hard-stop) alourdissent 1b-0. Confirmer : (a) le transport gagne
   un **mode GET + un opérateur keyless `xstocks-issuer`** (`assertHostAllowed` porté dans le transport), OU (b) l'issuer GET
   reste une **exception keyless DÉCLARÉE** hors transport (allowlist à déclencheur). Idem : D-9 est-il un préalable BLOQUANT de
   1b-i (sinon régression C-G2-3/Retry-After/403 sur le chemin live), ou un sous-lot 1b-0-bis ?

---

## RÉSUMÉ (brouillon, 12 lignes)
1. **Modèle** `claude-opus-4-8[1m]` (R-1). Base mesurée : Bell `430e99d`, paquet 2b-i `f0a6f1d` ; **1b après 2b-ii**, tout **[à ré-mesurer au G1]**.
2. **Objet** : brancher `openGuardedClient` côté Bell (temps 2) ⇒ Bell **consommateur avec IT** (code branché, tuyau prouvé ; registre reste `upcoming` jusqu'à 1ʳᵉ course rapprochée), HELIUS-1 non-reproductible dans le code Bell.
3. **E-1 CONV-2/phantom-fresh** = L-2/D-6 (cycle ledger ferme, parent pré-existe ; run-ledger a1-bis conservé, borné).
4. **E-2 RefMod arité 5** = L-1 : lock **VERT mais vacueux** [mesuré `pass 1`] ⇒ arité 5 + `[], []` + `payload_sha256` 10ᵉ clé.
5. **E-3 dé-skip T4** = couture 4 sous-lots ; 13 sites ré-mesurés (lignes ≠ en-tête périmé `514ee1a`).
6. **E-4 `requests` retiré** = D-3 (Databento/Polygon : allowlist à déclencheur reco, ou sous-lot après lecture quotas).
7. **E-5 8 603 RU** = item orchestrateur (rattachement au 1ᵉʳ rapprochement Chainstack Solana).
8. **D-2** une couche de retry (réordonne `universe-cli.ts:136`) ; **D-4** cap Chainstack compte fail-closed (Solana≠ETH) ; **D-5** `getAccountInfo`=1 RU (FAITS pt 7).
9. **D-1** test d'intégration via `openGuardedClient` réel + espion `globalThis.fetch` (pas d'injection transport) ; **D-7** leg ETH keyless (correction plan §2.0) ; **D-9** port des sémantiques durcies (redirect:manual/3xx, Retry-After, 403 hard-stop, statusOf/SolRpcError→RpcError) sinon régression silencieuse.
10. **R-25** : churn >> 1 150 mesuré (makeBudgetedCall 20/callsByMethod 26/8 fichiers ré-export) ⇒ **scission obligatoire** (4 sous-lots) + repli 1b-ii.
11. **Invariants** : format ledger de page, `PINNED_BELL_SHA`, gel U-4b (7 sha) ; cibles de migration NON gelées.
12. **Zéro dette nue** : chaque reste = item formé à déclencheur ; **§13 QUESTIONS orchestrateur** (D-3, D-4, périmètre servi, label, chemin lock, bin).

## 14. RULINGS ORCHESTRATEUR (2026-09-21 ~20:2x UTC, avant checkpoint-1 ; prévalent sur les « reco brouillon »)
1. **D-3** : option **(b)** — `apps/bell/src/close.ts` en allowlist DÉCLARÉE du scanner, déclencheur « G0 de la course cash Bell » (lecture sur place des quotas Databento/Polygon à ce moment, plafond par cycle en requêtes, décision 115) ; T4 dé-skippé avec cette allowlist.
2. **D-4** : **décision investisseur 121 (« A »)** — plafond Chainstack 16 M RU **par COMPTE**, un seul ledger de cycle Chainstack ; `network` = attribut du journal, jamais un second plafond. Floor = total du compte lu sur le tableau de bord.
3. **Périmètre servi** : **1b-i (universe) suffit à BRANCHER** (chemin servi + IT-1) ; 1b-ii/iii sont des sous-lots du même G7 ; le registre reste `upcoming` jusqu'à la première course RAPPROCHÉE (même règle que 2b-ii, R-C).
4. **Label** : opérateur `chainstack` UNIQUE (compte), résolution d'URL par réseau (`CHAINSTACK_ETH_URL` / `CHAINSTACK_SOLANA_URL`) = paramètre `network` du client, pas un opérateur `chainstack-solana`. Cohérent avec 121.
5. **Lock-test** : L-1 vise `packages/rpc-guard/test/ledger-format-lock.test.ts:16-17,32` (le chemin `apps/bell/test/…` de la mission était une erreur de l'orchestrateur, `error_origin` orchestrateur).
6. **`bin`** : dans **1b-0** (paquet), car c'est le sous-lot qui touche `packages/rpc-guard`.
7. **D-9** : option **(a)** — le transport gagne un mode GET + un opérateur keyless `xstocks-issuer` (`assertHostAllowed` porté) ; **1b-0 est un préalable BLOQUANT de 1b-i** (sinon régression silencieuse C-G2-3 / Retry-After / 403 hard-stop). Test imposé : les sémantiques durcies d'a1-bis rejouées à travers le transport (mutant « redirect suivi » rouge).
- Ordre : 1b-0 → 1b-i → 1b-ii → 1b-iii ; tout après la fusion de 2b-ii ; R-25 mesuré par sous-lot au G1.

## RULINGS ORCHESTRATEUR sur le checkpoint-1 (2026-09-21 ~21:3x UTC ; avis `docs/CHECKPOINT1-lot-garde-helius-1b.md`, APPROUVE-AVEC-CORRECTIONS C-1..C-7 bloquants)
- **C-7** : option **(β)** — `method = "GET"`, `params = [pathAndQuery]`, clé de cap `xstocks-issuer|GET` (une seule clé, `--max-calls` compte les pages) ; `assertHostAllowed` devient structurel dans le transport (le label `xstocks-issuer` ne résout qu'un hôte, `kind:"http-get"`, classe `keyless`) ; l'allowlist d'hôtes de `universe.ts` est RÉDUITE à un test de label. Motif : (α) ferait dériver `by_op_method` avec la pagination (une clé par page) et gonflerait le ledger.
- **C-5** : la spécification `network` est écrite UNE fois, comme clause 121 de l'ADR-GARDE-HELIUS, au G1 de 2b-ii (qui construit le ledger Chainstack) : `opts.network` de course, champ ledger additionnel, reconcile sur le total du compte, **verrou `chainstack.lock` partagé Bell/Ukemi** ; 1b-0 la cite. Ripple 2b-ii/2b-iii : ajouté aux exigences du G1 2b-ii (ligne datée à porter dans le G0 2b-ii).
- **C-1, C-2, C-3, C-4, C-6** : pliés tels quels par l'auteur (ré-export canonique de `BudgetExceededError` en 1b-0/1b-i ; label `solana-foundation` → hôte admis `api.mainnet.solana.com` ; tests + mutants pour `statusOf`/`isSolRevert`/`withRetry` sur `TransportError`/`RpcError` ; lock-test à liste fermée de 10 clés + payload recomputé ; 14 hits, lectures de clé `collect.ts:582-583` déplacées dans le module allowlisté).
- C-8..C-12 : pliés dans le corps ; ligne datée du décalage de 115 → 121 dans CHANTIERS (faite : décision 121).
