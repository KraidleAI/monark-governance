# G0 — GARDE-HELIUS-1b — Bell consomme `openGuardedClient` de `@monark/rpc-guard` (PLAN PLIÉ, checkpoint-1)

> **STATUT : PLAN PLIÉ (pli par reprise de l'auteur, décision 116).** Ce fichier **REMPLACE** le brouillon
> `docs/G0-lot-garde-helius-1b.DRAFT.md` en foldant : (a) les **rulings orchestrateur 1-7** (§14) et (b) les **corrections
> du checkpoint-1 C-1..C-12** (`docs/CHECKPOINT1-lot-garde-helius-1b.md`, `claude-fable-5-1`, **APPROUVE-AVEC-CORRECTIONS**,
> C-1..C-7 BLOQUANTS avant tout code). Chaque section porte ses tags `[C-n]` (correction foldée) et `[R-n]` (ruling
> orchestrateur) pour rendre la table correction→section vérifiable (R-21). Les décisions tranchées ne sont plus
> « proposées » ; ce qui reste ouvert est un item formé à déclencheur nommé. **Section de traçabilité : §15 « Pli du
> checkpoint-1 » (C-n → ce qui change).** Les rulings en fin (§14 + rulings post-checkpoint) sont **conservés**.

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé).
**Provenance** : worker DOCS `claude-opus-4-8[1m]`, 2026-09-21, contexte = pli du checkpoint-1 de GARDE-HELIUS-1b dans le G0
(Bell = temps 2, décision 117) ; réviseur = orchestrateur (R-21, vérification adversariale avant consommation) ; advisor
intégré consulté une fois avant la rédaction du brouillon. **R-20** : aucun commit, aucun workflow, aucun fichier du dépôt
modifié. **Écritures UNIQUEMENT sous `F:\tmp\garde1b\`.** **AUCUN réseau. Aucun secret lu** : aucun `.env*`/`*secret*`
ouvert ; aucune URL à clé recopiée ; `F:\Monark` + `F:\Monark-wt-garde2b` en LECTURE seule ; worktrees non touchés ; rien
sur `C:`.

**Base de mesure** : `F:\Monark` `lot/etude-suite` HEAD **`3350eec`** (photo du pli ; le tronc a avancé `430e99d`→`4ee3285`→
`8aedd03`→`4d102ca`→`51c4d9a`→`3350eec`→`2d1d685` pendant les passes — commits docs seuls, 0 code, `git status --porcelain`=0,
cf. MESURES M0/M18) pour le code Bell (état post-2a, **pré-2b-ii**) ; `F:\Monark-wt-garde2b` HEAD `f0a6f1d` (`lot/garde-helius-2b`,
état **2b-i**) pour l'API du paquet. **Le lot 1b s'ouvre APRÈS la fusion de 2b-ii** ⇒ toutes les mesures sont
**[à ré-mesurer au G1]** sur la base réelle (post-2b-ii). Les `fichier:ligne` du paquet sont ceux de 2b-i ; ceux de Bell
ceux de `3350eec`.

---

## 0. Niveaux de preuve (doc 03)
- **[lu]** = lu de première main dans un fichier du dépôt à `fichier:ligne` (rejouable ; cf. `MESURES.md`).
- **[mesuré]** = sortie d'une commande rejouée par ce worker (grep/`node --test`/`wc`), brute dans `MESURES.md`.
- **[2nd]** = chiffre lu dans un document (CHANTIERS, FAITS, dashboard) sans première main.
- **[à mesurer]** = projection de ce G0 (R-25 surtout), à confirmer au G1 par mesure sur la base réelle post-2b-ii.

---

## 1. Contexte, objet, et ce que 1b « branche »

**Chaîne du lot GARDE-HELIUS** [lu `docs/G7-lot-garde-helius-1a.md:25`] : 1a a livré le **paquet** `@monark/rpc-guard`
**`upcoming`** ; 2a a ajouté le second opérateur payant Chainstack (RU) + le cœur multi-opérateur ; 2b-i a livré la surface
d'erreur (`RpcError` canonique, `classify.ts`, indice D6) — fusionnable [lu `docs/G2-lot-garde-helius-2b-i.md:190`] ; 2b-ii
migre le **recorder Ukemi**. **1b BRANCHE le paquet côté Bell** : `openGuardedClient` cesse d'être `upcoming` côté Solana
quand une course Bell le consomme par un **chemin servi + test d'intégration non-LLM** (règle Branchement).

**Objet** : rendre non-reproductible l'incident HELIUS-1 **DANS le code Bell** — le dépôt PORTE encore les chemins qui le
rejouent (retry sous le tick, ledger dans `--out`, absent⇒0, leg hors budget). 1a a factorisé le mécanisme ; 1b le substitue
à chaque `makeBudgetedCall` local, chaque `fetch(` payant, chaque lecture de clé Bell.

**Dépendances d'ordre (dures)** :
1. **1b s'ouvre APRÈS la fusion de 2b-ii** : 2b touche les MÊMES fichiers du paquet (`transport.ts`, `classify.ts`,
   `errors.ts`, `client.ts`) ; ouvrir 1b avant créerait un conflit de fusion. 2b-ii branche `isRpcRevert`/`validateRevertData`/
   le vocabulaire au livre — 1b ne re-spécifie PAS ces pièces (§11).
2. C-G-1/C-G-3 de 2b-i (drift regex↔tableau, garde de code `isRpcRevert`) sont **BLOQUANTS pour le G1 de 2b-ii**
   [lu `docs/G2-lot-garde-helius-2b-i.md:152,162`] ⇒ soldés par 2b-ii, hors périmètre 1b.
3. **La clause `network` « par compte » (décision 121, §4-D-4) est écrite au G1 de 2b-ii** (le sous-lot qui construit le
   ledger Chainstack) ; 1b-0 la CITE et porte l'adaptation des consommateurs déjà fusionnés (C-5).

**Ce que 1b NE fait PAS** : aucune course payante (Bell = temps 2, aucune course tirée ; §11).

---

## 2. Exigences d'entrée énumérées → livrable ou item formé (kit §9.6)

| # | Exigence d'entrée (source) | Mesure de première main [lu/mesuré] | Traitement 1b |
|---|---|---|---|
| E-1 | **CONV-2 + phantom-fresh** (`universe-cli.ts:124-129`) [lu `docs/G7-lot-t1a-iii-a1-bis.md:26`] | `mkdirp(a.out)` précède `readPriorCalls` ⇒ `--out` déplacé ⇒ 0 [lu `universe-cli.ts:115,130`, `universe.ts:236-238`] ; en plus l'univers SONDE l'env pour l'opérateur (`:111,297,312` `CHAINSTACK_SOLANA_URL`) [mesuré, C-12] | **L-2** (migration universe : `openGuardedClient`, sous-ensemble d'opérateurs par CLI, plus par l'env — C-12) + **D-6** (phantom-fresh borné) |
| E-2 | **`ledger-format-lock.test.ts:16-17` `RefMod` arité 5, vecteur non vide** [lu `docs/G7-lot-t1a-ii-b3d-f.md:18`] | `chainedLedgerEntry` **arité 5** [lu `rebase-crosscheck.ts:158-159`] ; `RefMod` typé **arité 3** [lu test `:16-17,32`] ; test **VERT mais vacueux** — `node --test`=`pass 1 fail 0` [mesuré] ; **`payload_sha256` est DÉJÀ 10ᵉ clé à 3 args** ⇒ « assérté 10ᵉ clé » ne tue PAS le mutant [mesuré, C-4] | **L-1 [C-4]** (arité 5 + vecteur SYNTHÉTIQUE non vide + liste FERMÉE des 10 clés + `payload_sha256` recomputé) |
| E-3 | **dé-skip de `fetch_only_inside_client`** [lu `test/rpc-guard-fetch-only-inside-client.test.ts:79`] | Test SKIP « until 1b » ; portée = TOUT `apps/bell/src/**` ; **14 hits RE-MESURÉS sur HEAD** (7 `fetch(` + 6 clés + **1 `undici` en COMMENTAIRE `universe-cli.ts:268`**) [mesuré, C-6/C-10] — le brouillon disait ce 14ᵉ hit « disparu » : **FAUX**, il a migré `:208`→`:268` | **L-1..L-5** (chaque hit migré ou allowlist DÉCLARÉE) + **L-5** (dé-skip final) |
| E-4 | **unité `requests`** (Helius crédits, Chainstack RU ; ADR A-1) [lu] | `OperatorClass.unit = "credits"|"ru"|"keyless"` — **`"requests"` RETIRÉ en 2a** [lu `client.ts:31`] ; item ADR « D-3 à déclencheur 1b » [lu ADR l.100] | **D-3 [R-1]** (Databento/Polygon : allowlist DÉCLARÉE, déclencheur « G0 course cash Bell ») ; Bell Solana = Helius crédits [lu], Chainstack Solana = RU **du même compte** (121) |
| E-5 | **8 603 RU solana-mainnet le 20/09 à rattacher** [lu `docs/CHANTIERS.md:571`] | « solana-mainnet 8 603 RU … déclencheur : GARDE-HELIUS-1b pour Solana » = FAITS Chainstack pt 11 [lu] | **Item orchestrateur** (rattachement au journal Chainstack `network=solana-mainnet` au 1ᵉʳ rapprochement ; §11) |

**Aucune de ces exigences n'est un « dû » nu** : chacune est un livrable L-n, une décision tranchée, ou un item formé à
déclencheur nommé (§11).

---

## 3. Architecture cible et découpe (couture R-25 décidée d'emblée, ruling Q3)

**Contrainte la plus serrée = la dé-skip de `fetch_only_inside_client` (E-3)** : elle scanne TOUT `apps/bell/src/**` et
n'est verte QUE lorsque les **14 hits** (7 `fetch(` + 6 `env.<clé>` + 1 `undici` commentaire) sont migrés/reformulés/
allowlistés à déclencheur. Le lot ne clôt (dé-skip) qu'au dernier sous-lot.

### 3.0 Les 14 hits, ré-mesurés sur `3350eec` [mesuré, cf. MESURES M1/M2/M9]

| Hit | `fichier:ligne` (3350eec) [lu] | Opérateur | Sous-lot / traitement |
|---|---|---|---|
| `fetchCall` POST | `apps/bell/src/rpc.ts:44` | Helius/Chainstack Solana (`BELL_SOLANA_RPC`) | 1b-ii (migré) |
| `bellSolanaCall` POST | `apps/bell/src/collect.ts:284` | Helius/Chainstack Solana | 1b-ii (migré) |
| `bellEthCall` POST | `apps/bell/src/ethereum.ts:64` | **keyless** ETH (`GET_LOGS_PROVIDERS`) | 1b-iii (migré) |
| `databentoGet` GET (Basic) | `apps/bell/src/close.ts:176` | Databento (`DATABENTO_API_KEY`) | 1b-iii : allowlist DÉCLARÉE (R-1/C-6) |
| `polygonGet` GET (Bearer) | `apps/bell/src/close.ts:191` | Polygon/Massive (`POLYGON_API_KEY`) | 1b-iii : allowlist DÉCLARÉE (R-1/C-6) |
| `liveHttpGet` GET (issuer) | `apps/bell/src/universe-cli.ts:267` | issuer PUBLIC keyless | 1b-i (migré via GET keyless `xstocks-issuer`, C-7) |
| `liveRpcCall` POST | `apps/bell/src/universe-cli.ts:281` | Chainstack Solana | 1b-i (migré) |
| clé `CHAINSTACK_SOLANA_URL` ×3 | `universe-cli.ts:111,297,312` | Chainstack Solana | 1b-i : **disparaît** (C-12, sous-ensemble par CLI) |
| clé `BELL_SOLANA_RPC` | `rpc.ts:22` (`solanaEndpoints`) | Helius Solana | 1b-ii (dé-exporté, migré) |
| clé `POLYGON_API_KEY` | `collect.ts:582` | Polygon | 1b-iii : **DÉPLACÉE dans le module allowlisté** (C-6, jamais `collect.ts` allowlisté) |
| clé `DATABENTO_API_KEY` | `collect.ts:583` | Databento | 1b-iii : idem C-6 |
| `undici` COMMENTAIRE | `universe-cli.ts:268` [mesuré, C-6] | — | 1b-i : **REFORMULATION du commentaire** (le scanner ne saute pas les commentaires, `test:60-63`) |

> **Finding [mesuré]** : `HELIUS_API_KEY` n'est PAS un accès `env.` dans `apps/bell/src` (commentaire seul, `rpc.ts:7`) ;
> Bell résout Helius via `BELL_SOLANA_RPC` (le transport 2b appose `?api-key=HELIUS_API_KEY` si présent, `transport.ts:68-69`).
> **[C-6/C-10]** L'allowlist du scanner est LE fichier qui porte À LA FOIS le `fetch` ET la lecture `env.<clé>` (discipline
> `transport.ts`) : `collect.ts` n'est **JAMAIS** allowlisté ; 1b-iii déplace `env.POLYGON_API_KEY`/`env.DATABENTO_API_KEY`
> vers le module allowlisté (`close.ts`, ou un `cash-http.ts` dédié). L'allowlist est le `Map<path, trigger>` de 2b-ii.

### 3.1 Couture (4 sous-lots, PR unitaires R-25 — aucun ne clôt seul) [C-8 : rulings foldés]

| Sous-lot | Contenu | Consommateur (branchement) | Projection `ins+del` [à mesurer] |
|---|---|---|---|
| **1b-0 paquet** | extension `transport.ts` : opérateur `chainstack` **UNIQUE par compte** (121) résolu par réseau (`CHAINSTACK_ETH_URL`/`CHAINSTACK_SOLANA_URL` selon `opts.network`) + **chemin GET keyless `xstocks-issuer`** (`method="GET"`, `params=[pathAndQuery]`, `assertHostAllowed` structural — C-7 β) + **D-9 sémantiques durcies** (`redirect:"manual"` + 3xx typé, `retryAfterMs` sur `TransportError`) ; `tariff.ts` (`getAccountInfo`=1 RU Solana, FAITS pt 7) ; **L-1** (RefMod arité 5, C-4) ; table `--method-caps` Bell (4 méthodes) ; **ré-export canonique `BudgetExceededError` (C-1)** ; **CITE la clause `network` 121 + adapte les consommateurs déjà fusionnés (recorder 2b-ii, scripts 2b-iii) — C-5 ripple** ; **amendement daté ADR-GARDE-HELIUS « 1b » (C-9)** (mode GET + `xstocks-issuer`, `network`→clause 121 renvoyée au G1 2b-ii, `retryAfterMs`/3xx typé, allowlist cash à déclencheur, tuyaux Bell §5, résidus déclarés D-6/Databento-Polygon) ; `bin` exécutable | AUCUN ⇒ **upcoming** | ≈ 450–750 |
| **1b-i universe** | `universe-cli.ts` (réordonne retry AU-DESSUS du client, **sous-ensemble par CLI, plus par l'env — C-12**, `openGuardedClient`, CONV-2/phantom-fresh D-6, reformule commentaire `undici`), `universe.ts` (`Fatal403Error` étend la canonique, `readPriorCalls`, allowlist d'hôtes réduite à un test de label — C-7), 2 `fetch(` retirés ; **`withUniverseRetry` s'adapte à `TransportError`/3xx typé (C-3/D-9)** | courses `universe` Bell GATÉES ⇒ **BRANCHÉ** (R-3) | ≈ 450–700 |
| **1b-ii collect Solana** | `collect.ts runMain` (`openGuardedClient`, suppr. `makeBudgetedCall` `:297`, `budgeted.*`→client), `rebase-crosscheck.ts` (suppr. `callsByMethod`, crédits dérivés), `quorum.ts` (labels, **`statusOf`/`isSolRevert` sur `TransportError`/`RpcError`, `SolRpcError` local SUPPRIMÉ — C-3**), `rpc.ts` (dé-exporter `solanaEndpoints` ; item CONF-SRC-5 `PUBLIC_SOLANA`=mainnet-beta déclaré — C-2) | courses collect/crosscheck/discover Bell GATÉES ⇒ **BRANCHÉ** | ≈ 550–900 |
| **1b-iii close/eth + dé-skip** | `ethereum.ts` (leg ETH keyless budgété), **clés cash déplacées dans le module allowlisté (C-6)**, allowlist `Map<path,trigger>` (entrée cash à déclencheur « G0 course cash Bell », R-1), **dé-skip E-3** (T4 full-scope, 14→0) | courses eth/cash Bell GATÉES + CI | ≈ 300–550  **+ ruling G7 1b-0 (2026-09-22) : 1b-iii porte aussi le ripple du `finally` du recorder Ukemi `apps/sentinel/src/ukemi/record.ts` (deverrouillage par `(op, cycles[op])`, ADR 1b0-E) - couplage cross-lot DECLARE ici.** |

- **G7 du lot** couvre 1b-0 + 1b-i + 1b-ii + 1b-iii (un paquet sans consommateur n'est pas « built ») ; **aucun sous-lot ne
  clôt seul** (calque G0 lot 1 §8 [lu `docs/G0-lot-garde-helius.md:372`]).
- **Chaque sous-lot livre un test ACTIF par-fichier** (`<file>_clean_of_fetch_and_keys`, calque du compagnon actif
  `rpc_guard_package_src_clean_and_allowlist_load_bearing` [lu `test/…:68`]) ⇒ progrès PROUVÉ tandis que le full-scope reste
  SKIP jusqu'au 1b-iii.
- **[C-1] Le ré-export canonique `BudgetExceededError` passe de 1b-ii à 1b-0/1b-i (AVANT IT-1)** — sinon un refus du client
  est de la classe du PAQUET, non reconnu par `withUniverseRetry`/`quorum2`/`withRetry` (`instanceof` sur la classe LOCALE
  `quorum.ts:24`), **réessayé 4 fois puis benché** ⇒ fail-open (3ᵉ instance du défaut d'identité de classe, après 1a C-13 et
  2b C-1). `apps/bell/src/quorum.ts` fait `export { BudgetExceededError } from "@monark/rpc-guard"` ; `Fatal403Error`/
  `RedirectBlockedError` étendent la canonique ; les 8 fichiers src qui l'importent de `quorum.ts` suivent SANS édition.
- **Ré-mesure R-25 au G1** obligatoire ; repli si un sous-lot > 1 150 (§8).

---

## 4. Décisions (tranchées par rulings/checkpoint ; ce qui reste ouvert est un item formé)

- **D-1 — chemin public UNIQUE `openGuardedClient` ; `deps.call` conservé pour l'UNITÉ, pas pour l'intégration.** L'API
  n'expose que `openGuardedClient(env, limits, ledgerDir, cycles, opts)` [lu `index.ts:7`, `guarded.ts:19-25`]. Les cœurs
  Bell (`runUniverse`, `runMain`) gardent leur couture `deps` pour les tests unitaires offline ; le **test d'intégration**
  (§5) passe par `openGuardedClient` réel + espion `globalThis.fetch` (calque 2b L-2-3 [lu ADR l.28]) — pas d'injection de
  transport (`TransportOpts` = `timeoutMs`/`onTransportError` seuls [lu `transport.ts:52`]).

- **D-2 — UNE couche de retry chez l'appelant (INVERSION du H-B `universe-cli.ts:136`).** `pacedInner` fait
  `withUniverseRetry(() => deps.call(...))` PUIS `makeUniverseBudget(..., pacedInner)` [lu `:136-137`] ⇒ R retries = 1 unité
  (H-B). Le client fait UNE tentative [lu `client.ts:131-135`]. 1b réordonne : `withUniverseRetry(() => client.call(op,m,p))`
  ⇒ chaque retry ré-entre le client, chaque tentative comptée. `BudgetExceededError` re-jeté EN PREMIER (déjà le cas
  [lu `quorum.ts:122`, `universe.ts:121`]) — MAIS voir C-1 : encore faut-il que ce soit la classe CANONIQUE.

- **D-3 [TRANCHÉ, ruling R-1] — Databento/Polygon : allowlist DÉCLARÉE à déclencheur.** `unit:"requests"` supprimé en 2a
  [lu `client.ts:31`]. **Option (b) retenue** (ruling R-1, précédent 118) : le module allowlisté (`close.ts`/`cash-http.ts`)
  porte le `fetch` GET ET les clés `POLYGON_API_KEY`/`DATABENTO_API_KEY` (**déplacées de `collect.ts`**, C-6) ; entrée
  d'allowlist `Map<path, trigger>` avec déclencheur « **G0 de la course cash Bell** » (lecture sur place des quotas
  Databento/Polygon à ce moment, plafond par cycle en requêtes, décision 115 déférée par ruling R-1 — C-11). `collect.ts`
  n'est JAMAIS allowlisté. Aucune course cash n'est tirée à 1b ⇒ aucun engagement d'argent. Mutant « allowlist élargie sans
  déclencheur » ROUGE.

- **D-4 [TRANCHÉ, décision investisseur 121] — Chainstack = UN opérateur PAR COMPTE, un cap 16 M RU, `network` = attribut.**
  [lu `docs/CHANTIERS.md:602-603`] : le plafond 16 M RU (décision 115, 80 % du plan Growth 20 M) est **par COMPTE**, tous
  réseaux confondus (`ethereum-mainnet` Ukemi + `solana-mainnet` Bell) : **un seul ledger de cycle Chainstack, une seule clé
  de cycle, floor = somme des réseaux lue au dashboard**. L'opérateur `chainstack` du garde est **unique** ; la ventilation
  par réseau est l'attribut de journal `network`, **jamais un second plafond**. Le transport résout `chainstack` vers
  `CHAINSTACK_<réseau>_URL` selon `opts.network` (absent ⇒ throw avant tout verrou). **Conséquence** : Bell (Solana) et Ukemi
  (ETH) partagent `chainstack.lock` ⇒ pas deux courses Chainstack simultanées (fail-closed voulu ; runbook : `unlock` de
  l'autre course d'abord). L'ancienne « option deux caps 16 M » du brouillon est **ÉCARTÉE** (aurait mis le compte à 32 M,
  fail-open). Test `chainstack_one_account_cap_across_networks` [C-5] ; mutant « label `chainstack-solana` avec son propre
  cap » ROUGE.

- **D-5 — `tariff.ts` : `getAccountInfo` sur Chainstack Solana = 1 RU (FAITS pt 7), extension SOURCÉE.** Bell **envoie** sur
  Solana **4 méthodes** [mesuré, M4] : `getAccountInfo`, `getSignaturesForAddress`, `getTransaction`, `getTransactionsForAddress`
  (`getTokenAccountsByOwner` n'est que PROSE de commentaire `pools.ts` — PAS envoyée). `chainstackRu` price déjà
  `getSignaturesForAddress`/`getTransaction`=2 RU (archivable [lu `tariff.ts:54-57`]) mais **THROW `unknown_method`** pour
  `getAccountInfo` [lu `tariff.ts:71-77`]. FAITS pt 7 « toute autre méthode Solana = 1 RU » [lu] ⇒ 1b ajoute un set ÉNUMÉRÉ
  `CHAINSTACK_ONE_RU_SOLANA = {getAccountInfo}` (jamais un défaut blanket qui casserait le fail-closed). Helius : les 4
  couvertes par `heliusCredits` [lu `tariff.ts:12-22`]. `getTransactionsForAddress` **HELIUS-EXCLUSIF** [lu `discover.ts:185`,
  `rebase-produce.ts:112`] ⇒ jamais routé vers Chainstack (routage + `--method-caps` le garantissent ; sinon throw fail-closed).

- **D-6 — Phantom-fresh : le ledger de RUN (a1-bis) reste ; le ledger de CYCLE est la garde-argent.** Le run-ledger
  (`budget.json` ancre + journal chaîné dans `--out`) est un artefact de PROVENANCE a1-bis avec test de composition
  [lu `docs/G7-lot-t1a-iii-a1-bis.md:23`] : CONSERVÉ. Le défaut phantom-fresh (`--out` déplacé ⇒ `readPriorCalls`=0
  [lu `universe.ts:236-238`]) est **borné par `--max-calls` par run** [lu `universe-cli.ts:126`] mais rejoue HELIUS-1 entre
  runs. 1b le ferme par le **ledger de CYCLE** : parent `HELIUS_LEDGER_DIR` DOIT pré-exister (throw sinon, C-8
  [lu `guarded.ts:49`]) et `prior = max(floor, Σ_at_open)` [lu `client.ts:85-87`]. Test `universe_out_moved_on_resume_keeps_cycle_prior`
  ; mutant « parent auto-créé » ROUGE. Résidu DÉCLARÉ borné : le run-ledger phantom-fresh subsiste pour le COMPTE de run,
  le CYCLE est la garde.

- **D-7 — ETH leg keyless (correction du plan lot 1 §2.0).** `bellEthCall` ne lit AUCUNE clé [lu `ethereum.ts:60-70`] ;
  `liveEthSwaps` utilise `GET_LOGS_PROVIDERS` (keyless : drpc/mevblocker/nodies/pocket/tenderly [lu `ethereum.ts:76`,
  `transport.ts:34-35`]). Le plan lot 1 le classait « Chainstack ETH payant » — **inexact**. Leg ETH = labels keyless, coût 0,
  compté (`--max-calls`). Le défaut « hors budget » (`collect.ts:651` n'injecte pas de call budgété [lu]) est réel ; 1b le
  budgète via `client` sur les labels keyless.

- **D-8 — `--method-caps` non-vacant (contrat C-V-5).** `assertLimits` exige une table non-vide sur un opérateur payant
  [lu `client.ts:75`] ; méthode non listée ⇒ `refused method_cap_unlisted` [lu `client.ts:115`]. 1b LIVRE la table fermée des
  **4 méthodes** Bell (§7-C-3) : `{getSignaturesForAddress, getTransaction, getAccountInfo, getTransactionsForAddress}` —
  chaque méthode utilisée listée avec son cap (gTfA BAS, le vecteur HELIUS-1).

- **D-9 [TRANCHÉ, ruling R-7 = option (a) + C-7 β + C-3] — PORT des sémantiques durcies a1-bis/quorum (sinon régression
  SILENCIEUSE).** Le transport 2b fait `fetch(url,{method:"POST",…,signal})` **SANS `redirect`** (défaut `"follow"`) et **NE
  LIT PAS** `retry-after` [lu `transport.ts:162`]. Les appels live universe posent `redirect:"manual"` + 3xx ⇒
  `RedirectBlockedError` HARD STOP (C-G2-3 [lu `universe-cli.ts:267-283`]), et `withUniverseRetry` honore `Retry-After` et
  transforme un 403 en `Fatal403Error` [lu `universe.ts:122,125`]. `quorum.ts` porte une taxonomie PARALLÈLE
  (`SolRpcError`/`isSolRevert`, `statusOf` regex `/\bHTTP\s+(\d{3})\b/` [lu `quorum.ts:36-56`]). **Migrer le `fetch` dans le
  transport SANS porter ces sémantiques = régression silencieuse** (les tests a1-bis `deps`-injectés restent VERTS pendant que
  le chemin live perd la protection — même piège que L-1). **1b-0 est un préalable BLOQUANT de 1b-i** (ruling R-7).
  *Déliverables* : (1b-0) transport gagne `redirect:"manual"` + erreur 3xx TYPÉE + `retryAfterMs` sur `TransportError`
  (test `transport_error_carries_retry_after_ms`, mutant « en-tête non lu ») ; (1b-i) `withUniverseRetry` s'adapte à
  `TransportError.code`/3xx typé (403 hard-stop conservé) ; (1b-ii) **[C-3]** `statusOf`/`isSolRevert`/`withRetry` réconciliés
  sur `TransportError.code`/`RpcError`, **`SolRpcError` local SUPPRIMÉ** (jamais une 2ᵉ classe, calque 2b-ii D-4). Sinon,
  concrètement : le message payant `rpc-guard: HttpError for operator 'x' (code 403)` n'est pas lu par `statusOf` (regex
  `HTTP`+3 chiffres) ⇒ « transport » ⇒ `withRetry` **réessaie un 403/400** 4 fois ; `isSolRevert` ne reconnaît pas le
  `RpcError` du paquet ⇒ `ConcordantRevertError` ne se forme plus. Tests/mutants §7, via `openGuardedClient` + espion
  `globalThis.fetch`, JAMAIS via `deps`.

---

## 5. Tuyaux déclarés (entrée / sortie / état / test — Bell devient consommateur) [C-8]

| Pièce | Entrée (qui produit) | Sortie (qui consomme) | État (où) | Test d'intégration NON-LLM |
|---|---|---|---|---|
| `runUniverse` gardé (1b-i) | `openGuardedClient(env, limits, dir, cycles, {network:"solana-mainnet"})` — **sous-ensemble d'opérateurs par CLI (C-12)**, `{solana-foundation, chainstack, xstocks-issuer}` ; floor/cycle/method-caps (orchestrateur) | course `universe` Bell GATÉE (exit code) | ledger `<HELIUS_LEDGER_DIR>/<cycle>/{chainstack,solana-foundation,xstocks-issuer}.{jsonl,head,lock}` — **`chainstack.jsonl` UNIQUE, `network` en attribut de ligne (121)** ; helius si `BELL_SOLANA_RPC` posé | **IT-1** `universe_spends_only_through_guard` (espion `globalThis.fetch` : chaque `fetch` payant précédé de sa ligne ledger sur DISQUE, via `runUniverse` réel) + **`universe_budget_refusal_is_not_retried` (C-1)** |
| `runMain` collect gardé (1b-ii) | idem | courses collect/crosscheck/discover Bell GATÉES | idem + `budget.json` de run DÉRIVÉ de `client.spent()` | **IT-2** `collect_spends_only_through_guard` ; **IT-3** `crosscheck_credits_derived_from_ledger` (crédits = `Σ requêtes×tarif`, `callsByMethod` local supprimé) — closes SYNTHÉTIQUES (C-12) |
| leg ETH gardé (1b-iii) | `client` sur labels keyless | course eth Bell GATÉE | ledger keyless (coût 0, compté) | **IT-4** `eth_leg_budgeted_and_keyless` |
| dé-skip CI (1b-iii) | scanner `test/rpc-guard-fetch-only-inside-client.test.ts` | CI (rouge si un `fetch(`/clé hors garde/allowlist) | — | **T4** `fetch_only_inside_client` ACTIF (14→0 hits) |

**Branchement (anti over-claim)** : à la fusion de 1b-i, Bell devient un **consommateur** de `openGuardedClient` avec **test
d'intégration non-LLM** (IT-1) — code branché, tuyau prouvé (argv → ligne ledger sur disque → transport, rejoué offline).
**MAIS le registre reste `upcoming`** jusqu'à la **première course RAPPROCHÉE** [lu `docs/G0-ADDENDUM-lot-garde-helius-2.md:30`]
; Bell = temps 2, aucune course, tout `upcoming` [lu `docs/G7-lot-t1a-iii-a1-bis.md:23`] (ruling R-3). **CA-11 durci** : « 1b-i
branche » n'est vrai que si le stop budgétaire est RECONNU (C-1) et l'hôte servi est l'hôte admis (C-2) — un IT-1 qui passe
avec un refus réessayé 4 fois serait « la composition construite sans être exécutée jusqu'au stop ».

---

## 6. Invariants byte-identiques (fichiers gelés — NE PAS toucher ; sha au G1)

> **Attention (R-21)** : `universe-cli.ts`, `universe.ts`, `rebase-crosscheck.ts`, `collect.ts`, `quorum.ts`, `rpc.ts` sont
> des **CIBLES de migration**, PAS gelés. Les invariants portent sur (a) des fichiers hors migration, (b) des FORMATS que la
> migration reproduit byte-pour-byte.

- **Format du ledger de PAGE du crosscheck** (lot -f, condition (f)) : `chainedLedgerEntry`/`verifyLedgerChain` — core en
  ORDRE d'écriture (10 champs, `prev_entry_sha256`…`list_sha256` PUIS `payload_sha256` 10ᵉ), `entry_sha256 = sha(JSON.stringify(core))`,
  C-F-1 [lu `rebase-crosscheck.ts:126-203`]. La suppression de `callsByMethod` (1b-ii) NE DOIT PAS l'altérer. Verrouillé par
  `ledger_format_locked_to_rebase_crosscheck` (rendu non-vacueux par L-1/C-4) + `bell_crosscheck_resume_refuses_edited_payload`
  [lu `docs/G7-lot-t1a-ii-b3d-f.md:26`].
- **`PINNED_BELL_SHA`** [lu `apps/bell/src/collect.ts:173`] — inchangé (rewiring du budget, pas du calcul).
- **`PINNED_DIGEST 267cd991…`**, **`book_digest 034fbff9…`** [2nd `docs/G2-lot-garde-helius-2b-i.md:111`] — hors périmètre 1b (Ukemi).
- **Pré-enregistrement §2 `7071484f…`** (lot -f) [2nd `docs/G7-lot-t1a-ii-b3d-f.md:8`].
- **Gel U-4b (7 fichiers, ADR-U4b D4)** [2nd `docs/CHECKPOINT2-lot-garde-helius-2b-i.md:33`] : `u4b-scores.mjs 9ad20666`,
  `u4b-reduce.mjs a5e66cd3`, `record-u4b-calib.mjs 5733daeb`, **`apps/sentinel/src/rpc.ts 0e232519`**, `wadray.ts 7bee76fc`,
  `abi.ts 3376eb08`, `l1-split.ts 9206df91` — 1b ne touche NI `apps/sentinel/**` NI `scripts/census/u4b/**` (`apps/bell`
  hors fermeture du gel, confirmé cp-1 R-G).
- **Fixtures** `apps/bell/test/fixtures/series/rebase/**` (séries fondatrices, décision 60) — byte-identiques. **[Sha exacts
  à figer au G1]** (item formé, déclencheur = G1).

---

## 7. Tests imposés (noms exacts) + mutants nommés [C-1..C-5, C-8]

| # | Test (nom exact) | Ce qu'il prouve | Sous-lot |
|---|---|---|---|
| **L-1 [C-4]** | `ledger_format_locked_to_rebase_crosscheck` (NON-VACUEUX) | `RefMod.chainedLedgerEntry` typé **arité 5** ; appel `(genesis,1,[txs],[ev],[ho])` **vecteur SYNTHÉTIQUE non vide** ; (i) liste FERMÉE des 10 clés du core en ordre d'écriture, (ii) `payload_sha256 === sha256Hex(JSON.stringify({page_events:ev,page_handoffs:ho}))` recomputé, (iii) `entry_sha256` recomputé | 1b-0 |
| **C-1** | `universe_budget_refusal_is_not_retried` | un refus `cycle_cap` via `openGuardedClient` réel ⇒ EXACTEMENT 1 ligne `refused`, 0 transport, `runUniverse` sort ≠ 0 sans page suivante (calque 2b-ii `ukemi_record_budget_refusal_is_not_retried`) | 1b-0/1b-i |
| **C-2** | `solana_foundation_label_resolves_to_pli_admitted_host` | le label `solana-foundation` résout **`https://api.mainnet.solana.com`** (hôte PLI, `universe.ts:37-38,57`), PAS `api.mainnet-beta.solana.com` (exclu CONF-SRC-5) | 1b-0 |
| **C-3a** | `quorum_classifies_canonical_transport_errors` | (a) `statusOf(TransportError(op,msg,"HttpError",403))`=`HTTP 403` et `withRetry` NE réessaie PAS ; (b) 429/5xx réessayés ; (c) `isSolRevert(RpcError code déterministe)`=vrai et `quorum2` forme `ConcordantRevertError` ; (d) -32005/-32004/-32603 benchés | 1b-ii |
| **C-3b** | `transport_error_carries_retry_after_ms` | le 429 du transport porte `retryAfterMs` (en-tête lu) | 1b-0 |
| **T4** | `fetch_only_inside_client` (dé-skippé) | 0 `fetch(`/`node:http`/`undici`/`child_process`/`env.<clé>` hors garde (+ allowlist `Map<path,trigger>` déclarée) sur TOUT `apps/bell/src/**` | 1b-iii |
| **T4a..e** | `<file>_clean_of_fetch_and_keys` | par-fichier ACTIF, prouve le progrès pendant que T4 reste SKIP | par sous-lot |
| **IT-1** | `universe_spends_only_through_guard` | `runUniverse` réel + `openGuardedClient` : chaque `fetch` payant précédé de sa ligne ledger sur DISQUE (P6) | 1b-i |
| **IT-2** | `collect_spends_only_through_guard` (closes SYNTHÉTIQUES, C-12) | idem via `runMain` réel | 1b-ii |
| **IT-3** | `crosscheck_credits_derived_from_ledger` | crédits = `Σ requêtes×tarif` du ledger ; `callsByMethod` local supprimé | 1b-ii |
| **C-12** | `universe_operator_subset_comes_from_cli_not_env` | `deps.env.CHAINSTACK_SOLANA_URL` disparaît ; le sous-ensemble d'opérateurs vient du CLI (`--operators`), l'univers ne SONDE pas l'env (calque 2b-ii C-1) | 1b-i |
| **D-2** | `universe_retry_counts_each_attempt` | R retries appelant ⇒ R+1 lignes `attempted` (retry ré-ordonné au-dessus du client) | 1b-i |
| **D-6** | `universe_out_moved_on_resume_keeps_cycle_prior` | `--out` déplacé ⇒ prior de CYCLE inchangé ; course refuse au cap | 1b-i |
| **D-4 [C-5]** | `chainstack_one_account_cap_across_networks` | course ETH puis course Solana sur le même `<cycle>/` ⇒ le 2ᵉ prior figé inclut le 1ᵉʳ (un cap 16 M compte) | 1b-0 |
| **C-5** | `cycle_ledger_mixes_legacy_and_network_lines` | lignes 2b-ii sans `network` + lignes neuves avec `network` ⇒ chaîne vérifiée, prior = somme (compatibilité) | 1b-0 |
| **D-5** | `chainstack_solana_getaccountinfo_is_one_ru` | `getAccountInfo` sur `chainstack`/Solana = 1 RU (FAITS pt 7) ; méthode absente ⇒ `unknown_method` | 1b-0 |
| **C-3c** | `bell_method_caps_table_covers_every_called_method` | la table couvre les **4 méthodes** Bell ; méthode appelée non listée ⇒ throw à la construction | 1b-0 |
| **D-1** | `bell_course_reaches_fetch_only_via_openGuardedClient` | aucun chemin servi n'atteint `fetch` sans passer par `openGuardedClient` (sonde fonctionnelle) | 1b-i |
| **D-9a** | `transport_3xx_is_hard_stop_never_followed` | un 302 ⇒ erreur 3xx typée (hard stop), corps jamais envoyé à l'hôte redirigé (C-G2-3 préservé) | 1b-0 |
| **D-9b** | `transport_403_is_fatal_hard_stop` | un 403 ⇒ hard stop propagé (calque `Fatal403Error`), jamais retryé | 1b-0/i |

**Mutants nommés (chacun DOIT rougir UN test de la liste)** :

| Mutant | Défaut rejoué (`fichier:ligne`) | Test qui rougit |
|---|---|---|
| classe locale `BudgetExceededError` restaurée | `quorum.ts:24` [lu] | **C-1** |
| `solana-foundation` → `mainnet-beta` | `transport.ts:79` [lu] | **C-2** |
| `statusOf` ignore `.code` (403 réessayé) | `quorum.ts:52-56` [lu] | **C-3a** |
| `isSolRevert` garde `SolRpcError` (reverts benchés) | `quorum.ts:45-46` [lu] | **C-3a** |
| retry-after non lu par le transport | `transport.ts:162` [lu] | **C-3b** |
| `RefMod` arité 3 (payload `sha('{}')`) | `ledger-format-lock.test.ts:16-17` [lu] | **L-1 (ii)** |
| payload retiré (entrée 9 champs) | L-1 calque | **L-1 (i)** |
| retry SOUS le tick (non réordonné) | `universe-cli.ts:136` [lu] | **D-2** |
| parent auto-créé (mkdir recursif) | `guarded.ts:49` calque | **D-6** |
| label `chainstack-solana` avec son propre cap | `transport.ts:76` | **D-4** |
| `getAccountInfo` tarifé par défaut (pas fail-closed) | `tariff.ts:75-76` | **D-5** |
| `makeBudgetedCall` local restauré | `collect.ts:297` [lu] | **IT-2** |
| `callsByMethod` local restauré | `rebase-crosscheck.ts:635,717` [lu] | **IT-3** |
| univers SONDE l'env pour l'opérateur | `universe-cli.ts:111` [lu] | **C-12** |
| allowlist élargie sans déclencheur | scanner T4 | **T4** |
| `fetch(` payant sans ligne ledger (append après fetch) | client calque | **IT-1** |
| redirect suivi (transport sans `redirect:"manual"`) | `transport.ts:162` [lu] | **D-9a** |
| 403 non hard-stop après migration | `transport.ts` / `universe.ts:122` | **D-9b** |

---

## 8. Estimation R-25 mesurée + couture de repli

**Mesuré [MESURES.md]** : métrique CI = `ins+del`, pathspec `ci.yml:65`, plafond **1 205** (docs exclus). Grandeurs de churn Bell :
- **Fichiers cibles src** : `collect.ts` 702, `universe-cli.ts` 316, `universe.ts` 494, `rebase-crosscheck.ts` 773,
  `quorum.ts` 136, `rpc.ts` 137, `ethereum.ts` 91, `close.ts` 194 lignes [mesuré `wc -l`].
- **`makeBudgetedCall`** = 20 occ. Bell / 6 fichiers, dont **14 dans 3 fichiers de TEST** [mesuré].
- **`callsByMethod`** = 26 occ. Bell ; **`budgeted.`** 9 ; **`solProviders`** 8 ; **`readPriorCalls/ByMethod`** 11 ;
  **`BudgetExceededError`** dans **8 fichiers src Bell** (ré-export C-1) [mesuré].

**Projection [à mesurer au G1]** : la migration monolithique dépasse **largement 1 150** ⇒ **scission OBLIGATOIRE** (ruling
Q3). Le pli ALOURDIT 1b-0 (C-1 ré-export, C-5 ripple sur les consommateurs 2b-ii/2b-iii déjà fusionnés, C-7 mode GET, D-9)
⇒ 1b-0 re-projeté ≈ 450–750. Le sous-lot le plus lourd reste **1b-ii collect Solana** (≈ 550–900) — **repli si > 1 150
mesuré** : scinder `collect.ts runMain`+`rpc.ts`+`quorum.ts` (1b-ii-a) de `rebase-crosscheck.ts` (`callsByMethod`, 1b-ii-b),
déclencheur nommé « G1 1b-ii > 1 150 ».

**Mitigation churn (ruling Q7)** : `OperatorLabel` = string branchée [lu `client.ts:13`] ⇒ les stubs `(u,m,p)` compilent
inchangés (BORNE le churn des 163 occ. `[Pp]rovider` Bell aux SIGNATURES) — MAIS ne mitige PAS la suppression de
`makeBudgetedCall`/`callsByMethod` (imports cassés), poste dominant de 1b-ii.

---

## 9. Oracle

- **Par sous-lot** : `npm run ci` (gate:vocab + typecheck + `node --test`) exit 0 ; `npm run lint` ; `npm run lint:ratchet` ;
  `npm run lang:gate`. **Codes de retour capturés DIRECTEMENT, jamais après un pipe** (règle a1-bis C-VD-1
  [lu `docs/G7-lot-t1a-iii-a1-bis.md:31`]).
- **Oracle sur l'arbre FUSIONNÉ** (ADR-C01 complément 1 : interactions inter-lots — TS arité — vues à la fusion seulement
  [lu `docs/G7-lot-t1a-iii-a1-bis.md:5`]).
- **Mutants** : chacun ROUGE sur son test nommé, restauration byte-exacte (sha256).
- **`npm ci --offline`** rejoué si `package-lock.json` édité (`bin`).
- **R-25** : `git diff --shortstat <base>..<head> -- <pathspec ci.yml:65>` par sous-lot, ≤ 1 205.
- **Rejeu cp-2 par sous-lot sous `F:\tmp\cp2-garde1b-<sous-lot>\`** (C-12).

---

## 10. Critères d'acceptation

1. **E-1..E-5 traités** : chaque exigence = L-n livré OU item à déclencheur nommé (§2, §11).
2. **T4 ACTIF et VERT** au terme de 1b-iii (14→0 ; allowlist = `transport.ts` + module cash DÉCLARÉ, `Map<path,trigger>`) ;
   mutant « allowlist élargie sans déclencheur » ROUGE.
3. **Bell consommateur (code branché, tuyau prouvé)** : ≥ 1 chemin (`universe`) consomme `openGuardedClient` réel + IT-1 via
   espion `globalThis.fetch` **ET le stop budgétaire reconnu (C-1) ET l'hôte admis (C-2)** ; **registre reste `upcoming`**
   jusqu'à la 1ʳᵉ course rapprochée (R-3).
4. **Invariants byte-identiques tenus** (§6) — format ledger de page, `PINNED_BELL_SHA`, gel U-4b.
5. **L-1 tue ses deux mutants** (arité 3 ⇒ (ii) ; payload retiré ⇒ (i)) — C-4.
6. **Identité de classe** : `BudgetExceededError` canonique dès 1b-0/1b-i (C-1) ; `SolRpcError` supprimé, `statusOf`/`isSolRevert`
   sur `TransportError`/`RpcError` (C-3).
7. **Zéro dette nue** : Databento/Polygon (D-3/R-1), 8 603 RU (E-5), course (temps 2), clause `network` 121 (au G1 2b-ii) =
   items formés à déclencheur.
8. **G7 couvre les 4 sous-lots** ; aucun ne clôt seul ; `error_origin` assigné.
9. **Amendement daté ADR-GARDE-HELIUS « 1b » présent au G1 de 1b-0** (C-9) : mode GET + `xstocks-issuer`, renvoi de la clause
   `network` 121 (écrite au G1 2b-ii), `retryAfterMs`/3xx typé, allowlist cash à déclencheur, tuyaux Bell (table §5),
   résidus déclarés.

---

## 11. HORS lot (déclaré)

- **Course de contre-vérification Bell (~5,4 M cr Helius, plusieurs jours)** [lu `docs/CHANTIERS.md:540,562`] — Bell = temps 2.
- **Question C-F-4** (ancrage externe par page) : ESCALADE-INVESTISSEUR au G0 de la course [lu `docs/G7-lot-t1a-ii-b3d-f.md:19`].
- **Plafond ~5,4 M cr** : question investisseur au G0 de course [lu `docs/CHANTIERS.md:540`] — pas dans 1b (caps 8 M/16 M =
  gardes anti-BUG, 112/115/121).
- **`BELL_SOLANA_RPC` + `HELIUS_API_KEY`** : ABSENTES de l'env (CI sans elles [lu `docs/CHANTIERS.md:344`]) — posées par
  l'investisseur AVANT la course (kit §10.5).
- **`HELIUS_LEDGER_DIR` pré-existant, `HELIUS_CYCLE_ID`, floor lu sur place** : entrées de course, orchestrateur (décision 114).
- **8 603 RU solana-mainnet 20/09** : rattachement au journal Chainstack `network=solana-mainnet` au 1ᵉʳ rapprochement = item
  orchestrateur [lu `docs/CHANTIERS.md:571`].
- **Databento/Polygon (course cash)** : plafond en requêtes posé au **G0 de la course cash Bell** (ruling R-1, décision 115
  déférée, précédent 118 — C-11) ; d'ici là résiduel payant hors garde DÉCLARÉ (allowlist), aucune course cash.
- **Clause `network` « par compte » de l'ADR-GARDE-HELIUS (121)** : écrite au **G1 de 2b-ii** (le sous-lot qui construit le
  ledger Chainstack), 1b-0 la cite (C-5).
- **2b-i (RpcError, `classify.ts`, D6, `isRpcRevert`, `validateRevertData`)** : livré par 2b — 1b NE re-spécifie PAS.
- **Job quotidien sentinel / `apps/sentinel/**`** : hors périmètre (NARABI-OPS-1d, 118).

---

## 12. Risques MAST (checklist de risque résiduel, doc 06) [CA-5 : mode « régression d'identité de classe » nommé]

| Mode MAST | Risque ici | Atténuation (section) |
|---|---|---|
| **Régression d'identité de classe** [C-1/C-3, nommé au cp-1] | `BudgetExceededError` du paquet non reconnu (refus réessayé 4× puis benché) ; `SolRpcError` parallèle à `RpcError` (403 réessayé, reverts benchés) | ré-export canonique dès 1b-0/1b-i (C-1) ; `SolRpcError` supprimé, `statusOf`/`isSolRevert` sur `TransportError`/`RpcError` (C-3) ; tests C-1/C-3a |
| **Budget non attribué (HELIUS-1)** | retry sous le tick (`universe-cli.ts:136`), ledger dans `--out`, leg ETH hors budget | D-2, D-6, D-7 |
| **Fail-open (multi-réseau)** | deux caps 16 M Chainstack ⇒ compte à 32 M | **D-4/121** (un cap par compte, `network` attribut) |
| **Information-withholding** | `getAccountInfo` Chainstack tarifé par défaut | D-5 (fail-closed, FAITS pt 7) |
| **No-attempt-to-verify** | garde « built » sans preuve ; test qui injecte `deps.call` | D-1 (IT via `openGuardedClient` réel + espion fetch) |
| **Incorrect-verification** | lock-test vacueux + tueur L-1 inopérant (« 10ᵉ clé » vraie à 3 args) ; hit `undici` déclaré disparu à tort | L-1/C-4 (deux mutants) ; 14 hits RE-MESURÉS (C-6/C-10) |
| **Régression silencieuse (protocole)** | migration du `fetch` dans le transport POST-only ⇒ perte redirect:manual/3xx, Retry-After, 403, statusOf ; tests `deps` restent verts | **D-9/C-3** (port des sémantiques, tests via `openGuardedClient`+espion fetch) |
| **Spec-gaming / over-claim** | « aucun appel payant hors garde » avec Databento/Polygon non migrés | D-3/R-1 (allowlist DÉCLARÉE à déclencheur) |
| **Task derailment** | migration qui déborde sur `apps/sentinel/**` / gel U-4b | périmètre `apps/bell/src` + `packages/rpc-guard` ; sha U-4b (§6) |

---

## 13. Questions du brouillon — TRANCHÉES (rulings §14 + checkpoint-1) [C-8]

1. **[D-3] Databento/Polygon** → **ruling R-1** : allowlist DÉCLARÉE (`close.ts`/`cash-http.ts`), déclencheur « G0 course cash
   Bell » ; clés déplacées de `collect.ts` (C-6). **TRANCHÉ.**
2. **[D-4] Cap Chainstack multi-réseau** → **décision investisseur 121** : cap 16 M **par COMPTE**, un ledger, `network` en
   attribut. **TRANCHÉ.**
3. **Périmètre servi minimal** → **ruling R-3** : 1b-i (universe) suffit à BRANCHER ; registre `upcoming` jusqu'à 1ʳᵉ course
   rapprochée. **TRANCHÉ.**
4. **Label du 3ᵉ opérateur** → **ruling R-4 / 121** : opérateur `chainstack` UNIQUE, résolution par réseau (`opts.network`),
   PAS de `chainstack-solana`. **TRANCHÉ.**
5. **Emplacement du lock-test** → **ruling R-5** : `packages/rpc-guard/test/ledger-format-lock.test.ts:16-17,32` (le chemin
   `apps/bell/test/…` était une erreur orchestrateur). **TRANCHÉ.**
6. **`bin`** → **ruling R-6** : dans 1b-0 (paquet). **TRANCHÉ.**
7. **[D-9] Chemin GET + sémantiques durcies** → **ruling R-7 + C-7 (β)** : transport gagne un mode GET + opérateur keyless
   `xstocks-issuer` (`method="GET"`, `params=[pathAndQuery]`, `assertHostAllowed` structural) ; **1b-0 préalable BLOQUANT de
   1b-i**. **TRANCHÉ.**

*(Rien d'ouvert ne subsiste : chaque reste est un item formé à déclencheur nommé, §11.)*

---

## 14. RULINGS ORCHESTRATEUR (2026-09-21 ~20:2x UTC, avant checkpoint-1) — conservés
1. **D-3** : option **(b)** — `apps/bell/src/close.ts` en allowlist DÉCLARÉE du scanner, déclencheur « G0 de la course cash Bell ».
2. **D-4** : **décision investisseur 121 (« A »)** — plafond Chainstack 16 M RU **par COMPTE**, un seul ledger de cycle
   Chainstack ; `network` = attribut du journal, jamais un second plafond ; floor = total du compte au dashboard.
3. **Périmètre servi** : **1b-i (universe) suffit à BRANCHER** ; registre `upcoming` jusqu'à la 1ʳᵉ course RAPPROCHÉE.
4. **Label** : opérateur `chainstack` UNIQUE (compte), résolution d'URL par réseau (`CHAINSTACK_ETH_URL`/`CHAINSTACK_SOLANA_URL`)
   = paramètre `network`, pas un opérateur `chainstack-solana`.
5. **Lock-test** : L-1 vise `packages/rpc-guard/test/ledger-format-lock.test.ts:16-17,32` (`error_origin` orchestrateur).
6. **`bin`** : dans **1b-0**.
7. **D-9** : option **(a)** — mode GET + opérateur keyless `xstocks-issuer` (`assertHostAllowed` porté) ; **1b-0 préalable
   BLOQUANT de 1b-i**.
- Ordre : 1b-0 → 1b-i → 1b-ii → 1b-iii ; tout après la fusion de 2b-ii ; R-25 mesuré par sous-lot au G1.

## RULINGS ORCHESTRATEUR sur le checkpoint-1 (2026-09-21 ~21:3x UTC) — conservés
- **C-7** : option **(β)** — `method="GET"`, `params=[pathAndQuery]`, clé de cap `xstocks-issuer|GET` (une seule clé) ;
  `assertHostAllowed` structural dans le transport (`kind:"http-get"`, classe `keyless`, un seul hôte) ; l'allowlist d'hôtes
  de `universe.ts` réduite à un test de label. Motif : (α) ferait dériver `by_op_method` avec la pagination.
- **C-5** : la spéc `network` est écrite UNE fois (clause 121 de l'ADR-GARDE-HELIUS, au G1 2b-ii) : `opts.network` de course,
  champ ledger additionnel, reconcile sur le total du compte, **verrou `chainstack.lock` partagé Bell/Ukemi** ; 1b-0 la cite.
  Ripple 2b-ii/2b-iii ajouté aux exigences du G1 2b-ii.
- **C-1, C-2, C-3, C-4, C-6** : pliés dans le corps (ré-export canonique en 1b-0/1b-i ; `solana-foundation` → hôte admis
  `api.mainnet.solana.com` ; tests+mutants `statusOf`/`isSolRevert`/`withRetry` sur `TransportError`/`RpcError` ; lock-test à
  liste fermée de 10 clés + payload recomputé ; 14 hits, clés `collect.ts:582-583` déplacées dans le module allowlisté).
- **C-8..C-12** : pliés dans le corps ; ligne datée du décalage 115→121 → CHANTIERS décision 121.

---

## 15. Pli du checkpoint-1 (2026-09-21) — table C-n → ce qui change (traçabilité, R-21)

| C-n | Sévérité | Ce que le brouillon disait | Ce que le pli écrit (section) |
|---|---|---|---|
| **C-1** | BLOQUANT | ré-export `BudgetExceededError` en **1b-ii** (§12) | ré-export **1b-0/1b-i AVANT IT-1** ; test `universe_budget_refusal_is_not_retried` + mutant « classe locale restaurée » (§3.1, §7, §12) |
| **C-2** | BLOQUANT | `solana-foundation` (hôte non discuté) (§5) | résout **`api.mainnet.solana.com`** (hôte PLI ; `mainnet-beta` EXCLU CONF-SRC-5) ; test + mutant en 1b-0 ; item `rpc.ts:19 PUBLIC_SOLANA` déclaré en 1b-ii (§4-D-9 voisin, §7-C-2) |
| **C-3** | BLOQUANT | D-9 nommait « statusOf/SolRpcError→RpcError » sans test | test `quorum_classifies_canonical_transport_errors` + `transport_error_carries_retry_after_ms` + mutants ; **`SolRpcError` SUPPRIMÉ** (§4-D-9, §7-C-3a/b) |
| **C-4** | BLOQUANT | L-1 « `payload_sha256` assérté 10ᵉ clé » (ne tue pas le mutant, 10ᵉ clé vraie à 3 args) | L-1 = **liste FERMÉE des 10 clés + `payload_sha256` recomputé sur vecteur SYNTHÉTIQUE non vide** ; 2 mutants (arité 3 ⇒ (ii), payload retiré ⇒ (i)) (§2-E2, §7-L-1) |
| **C-5** | BLOQUANT | ruling 4 « où vit `network` » non falsifiable | spéc = clause 121 de l'ADR au **G1 2b-ii** (`opts.network`, champ ledger, reconcile total compte, `chainstack.lock` partagé) ; **ripple** adaptation des consommateurs 2b-ii/2b-iii en 1b-0 ; test `cycle_ledger_mixes_legacy_and_network_lines` ; D-4 renommé `chainstack_one_account_cap_across_networks` (§4-D-4, §7, §11) |
| **C-6** | BLOQUANT | allowlist `close.ts` (ne couvre pas les clés `collect.ts:582-583`) | l'allowlist = le fichier qui porte `fetch` **ET** clé ⇒ clés **déplacées** de `collect.ts` vers le module allowlisté ; `collect.ts` jamais allowlisté ; `Map<path,trigger>` (§3.0, §3.1-1b-iii, §4-D-3) |
| **C-7** | BLOQUANT | convention GET « deux options ouvertes » | **option (β)** `method="GET"`, `params=[pathAndQuery]`, clé `xstocks-issuer|GET`, `assertHostAllowed` structural (§3.1-1b-0, §14) |
| **C-8** | non bloq. | §14 rulings hors corps | rulings **foldés dans le corps** (§3.1, §4, §5, §7, §13) |
| **C-9** | non bloq. | aucun amendement d'ADR | amendement daté ADR-GARDE-HELIUS « 1b » prévu (mode GET, `xstocks-issuer`, `network` renvoyé au G1 2b-ii, `retryAfterMs`/3xx, allowlist cash, tuyaux Bell) — item G1 |
| **C-10** | éditorial | « 5 méthodes » (§7), « undici disparu » | **4 méthodes** ; « undici **déplacé à `:268`** (commentaire) » ; E-3 « 14 hits re-mesurés, dont 1 commentaire » (§2-E3, §3.0, §4-D5/D8) |
| **C-11** | non bloq. | — | ligne datée : décision 115 (Databento/Polygon requêtes) **déférée** au G0 de la course cash par ruling R-1, précédent 118 (§11) |
| **C-12** | non bloq. | IT-2/IT-3 sans clause de closes ; univers sonde l'env | closes **SYNTHÉTIQUES** (IT-2/IT-3) ; **l'univers ne SONDE plus l'env** (sous-ensemble par CLI, `deps.env.CHAINSTACK_SOLANA_URL` disparaît) ; rejeu cp-2 par sous-lot (§3.1-1b-i, §5, §7-C-12, §9) |

**`error_origin` (proposés au G7)** : C-1 = plan (ordre 1b-ii) + validateur cp-1 1a ; C-2 = plan 1a (`G0-lot-garde-helius.md:187`
« mainnet-beta ») + validateur cp-2 1a ; C-3 = worker (test manquant) ; C-4 = worker (texte L-1) + orchestrateur (ruling 5
n'a pas relu le tueur) ; C-5 = plan (falsifiabilité) ; C-6/C-10 = worker (mesure) ; C-7/C-8/C-9/C-11/C-12 = worker/orchestrateur
(pli). **Zéro dette nue** : chaque reste est un item formé à déclencheur nommé.
