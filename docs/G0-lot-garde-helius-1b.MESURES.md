# MESURES — GARDE-HELIUS-1b (G0 brouillon) — commandes + sorties BRUTES

Worker `claude-opus-4-8[1m]`, 2026-09-21. Toutes commandes en LECTURE seule sur `F:\Monark` (+ `F:\Monark-wt-garde2b`),
aucune écriture au dépôt, aucun réseau, rien sur `C:` (Node local, `TEMP/TMP/TMPDIR=F:/tmp` pour le run de test).
Rejouable par l'orchestrateur (R-21). **Base à ré-mesurer au G1 sur l'arbre post-2b-ii.**

## M0 — Têtes git (la base BOUGE en cours de session)

```
F:/Monark          : au démarrage de session (git status snapshot) = 430e99d ; RE-MESURÉ en cours = 4ee3285
                     (branch lot/etude-suite) — un AUTRE process orchestrateur a committé pendant la passe ;
                     les numéros de ligne ci-dessous ont été RE-CONFIRMÉS identiques après le déplacement.
F:/Monark-wt-garde2b : f0a6f1d  (branch lot/garde-helius-2b) — état 2b-i (paquet).
```
> Conséquence : le lot 1b s'ouvre APRÈS 2b-ii ; toute mesure ci-dessous est une PHOTO datée, à rejouer au G1.

## M1 — Les 7 `fetch(` de `apps/bell/src` (lignes RÉ-MESURÉES ; ≠ en-tête du test, périmé sur `514ee1a`)

`grep -rnE "\bfetch\s*\(" apps/bell/src`
```
apps/bell/src/close.ts:176:      fetch(`${DATABENTO_HIST}${pathAndQuery}`, { headers: { Authorization: `Basic ${auth}` } });   [GET Databento]
apps/bell/src/close.ts:191:      fetch(`https://api.polygon.io${pathAndQuery}`, { headers: { Authorization: `Bearer ${apiKey}` } }); [GET Polygon]
apps/bell/src/collect.ts:284:    fetch(url, { method: "POST", ... jsonrpc ... })   [bellSolanaCall, Helius/Chainstack Solana]
apps/bell/src/ethereum.ts:64:    fetch(url, { method: "POST", ... jsonrpc ... })   [bellEthCall, KEYLESS ETH]
apps/bell/src/rpc.ts:44:          fetch(url, { method: "POST", ... jsonrpc ... })   [fetchCall, Helius/Chainstack Solana]
apps/bell/src/universe-cli.ts:267: fetch(url, { method: "GET", ... })                [liveHttpGet, issuer PUBLIC keyless]
apps/bell/src/universe-cli.ts:281: fetch(url, { method: "POST", ... jsonrpc ... })   [liveRpcCall, Chainstack Solana]
```
> vs en-tête `test/rpc-guard-fetch-only-inside-client.test.ts:19-20` (base `514ee1a`) : `universe-cli.ts:207,221` — **décalés**
> par les lots -f/a1-bis (les 2 `fetch(` universe sont maintenant à `:267,:281`). Le motif `undici` en commentaire
> `universe-cli.ts:208` (item 1a) n'existe plus à `4ee3285` (à re-confirmer au G1).

## M2 — Les 6 lectures `env.<clé payante>` de `apps/bell/src`

`grep -rnE "env\.(CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY)" apps/bell/src`
```
apps/bell/src/collect.ts:582:   deps.env.POLYGON_API_KEY
apps/bell/src/collect.ts:583:   deps.env.DATABENTO_API_KEY
apps/bell/src/rpc.ts:22:        env.BELL_SOLANA_RPC        (solanaEndpoints)
apps/bell/src/universe-cli.ts:111:  deps.env.CHAINSTACK_SOLANA_URL
apps/bell/src/universe-cli.ts:297:  process.env.CHAINSTACK_SOLANA_URL
apps/bell/src/universe-cli.ts:312:  process.env.CHAINSTACK_SOLANA_URL
```

## M3 — `HELIUS_API_KEY` est COMMENTAIRE seul dans `apps/bell/src` (aucun accès `env.`)

`grep -rn "HELIUS_API_KEY" apps/bell/src`
```
apps/bell/src/rpc.ts:7:// ... Once `HELIUS_API_KEY` exists, the founding run is ONE ...
```
> Bell résout Helius via `BELL_SOLANA_RPC` ; le transport 2b appose `?api-key=${HELIUS_API_KEY}` si présent
> (`F:\Monark-wt-garde2b\packages\rpc-guard\src\transport.ts:65-71`).

## M4 — Méthodes RPC appelées par Bell (entrée de la table `--method-caps`, D-8/C-3)

`grep -rhoE '"(getSignaturesForAddress|getTransactionsForAddress|getTransaction|getAccountInfo|getProgramAccounts|getMultipleAccounts|getTokenAccountsByOwner|getSlot|getBlock)"' apps/bell/src | sort | uniq -c`
```
      6 "getAccountInfo"
      1 "getSignaturesForAddress"
      8 "getTransaction"
      7 "getTransactionsForAddress"
```
**Jeu FERMÉ Bell = 4 méthodes ENVOYÉES** (littéraux entre guillemets). `getTokenAccountsByOwner` apparaît UNIQUEMENT en
PROSE de commentaire (`pools.ts:116,121,126,131` : `onchain: "getTokenAccountsByOwner(poolId) returns ..."`) — PAS une
méthode envoyée (grep des `"…"` = 0). À re-vérifier au G1.
Tarif Helius (`tariff.ts` 2b) : gTfA=10 ; getTransaction/getSignaturesForAddress/getAccountInfo=1 — **les 4 couvertes**.
Tarif Chainstack (`chainstackRu` 2b) : getTransaction/getSignaturesForAddress=2 RU (archivable) ; **getAccountInfo = `unknown_method` THROW** (aucun set 1-RU Solana)
⇒ extension D-5 sourcée FAITS pt 7 (« toute autre méthode Solana = 1 RU »). gTfA HELIUS-EXCLUSIF (jamais routé Chainstack).

## M5 — Churn de migration (compteurs `apps/bell`)

```
makeBudgetedCall (apps, tous)        : 29   (dont 9 sentinel = lot 2)
makeBudgetedCall (apps/bell)         : 20
   dont dans apps/bell/test           : 14   (universe.test 3, rebase-crosscheck.test 8, collect.test 3)
callsByMethod (apps/bell)            : 26
budgeted.  (apps/bell/src)           : 9
solProviders (apps/bell/src)         : 8
BudgetExceededError — fichiers SRC   : 8    (collect, discover, quorum, rebase-crosscheck, rebase-produce, rebase-scan, universe-cli, universe)
[Pp]rovider (apps/bell/src)          : 163  (churn borné aux SIGNATURES par OperatorLabel=string branchée, ruling Q7)
```
> La suppression de `makeBudgetedCall` (`collect.ts:297`) casse 14 imports de test ; `callsByMethod` (26) est
> remplacé par la ventilation `(op,method)` du ledger. Postes DOMINANTS de R-25 non mitigés par Q7.

## M6 — `wc -l` des fichiers cibles de migration

```
   702 apps/bell/src/collect.ts
   316 apps/bell/src/universe-cli.ts
   494 apps/bell/src/universe.ts
   773 apps/bell/src/rebase-crosscheck.ts
   136 apps/bell/src/quorum.ts
   137 apps/bell/src/rpc.ts
    91 apps/bell/src/ethereum.ts
   194 apps/bell/src/close.ts
  2843 total  (+ tests universe.test 798, rebase-crosscheck.test 1296, collect.test 798 = 2892)
```
> Projection R-25 : la migration monolithique dépasse largement 1 205 ⇒ scission obligatoire (ruling Q3). Couture 4 sous-lots (G0 §3.1). [à mesurer au G1]

## M7 — `RefMod` arité 3 (test) vs `chainedLedgerEntry` arité 5 (réel) — E-2/L-1

`sed -n '16,17p;32p' packages/rpc-guard/test/ledger-format-lock.test.ts`
```
16  interface RefMod {
17    chainedLedgerEntry: (prev: string, page: number, txs: ReadonlyArray<{ sig: string; slot: number }>) => (...) | null;   [ARITÉ 3]
32    const refEntry = ref.chainedLedgerEntry(ref.LEDGER_GENESIS, 1, [{ sig: "aaa", slot: 5 }, { sig: "bbb", slot: 9 }])!;   [3 args]
```
`sed -n '158,159p' apps/bell/src/rebase-crosscheck.ts`
```
158 export function chainedLedgerEntry(prevSha: string, page: number, txs: readonly {...}[],
159   pageEvents: readonly MultiplierEvent[], pageHandoffs: readonly SetAuthorityHandoff[]): LedgerEntry | null {   [ARITÉ 5]
```
> Le test est VERT car cast runtime (`await import` → `RefMod`) : tsc n'aligne pas l'arité, et `payloadSha(undefined,undefined)`
> = `sha(JSON.stringify({page_events:undefined,page_handoffs:undefined}))` = `sha('{}')` (undefined OMIS) — pas de throw
> (`rebase-crosscheck.ts:151-152`). La partie (2) du test re-hache le core (incluant ce `payload_sha256`) ⇒ égalité par
> construction, quelle que soit l'arité ⇒ **VACUEUX sur le payload arité 5**. L-1 le rend honnête (arité 5 + `[], []` +
> assertion `payload_sha256` = 10ᵉ clé du core).

## M8 — `node --test` du lock-test (offline) : VERT (donc vacueux, pas rouge)

`TEMP=F:/tmp TMP=F:/tmp TMPDIR=F:/tmp node --test packages/rpc-guard/test/ledger-format-lock.test.ts`
```
✔ ledger_format_locked_to_rebase_crosscheck (30.9219ms)
ℹ tests 1  ℹ pass 1  ℹ fail 0  ℹ skipped 0
EXIT=0
```
> Confirme : E-2/L-1 n'est PAS « réparer un test rouge » mais « rendre non-vacueux un test vert » (l'orchestrateur peut
> re-décider l'intention exacte).

## M9 — Test grep CI à dé-skipper (E-3) — état actuel

`test/rpc-guard-fetch-only-inside-client.test.ts` :
- `:79` `test("fetch_only_inside_client", { skip: "until 1b: ..." }, ...)` — SKIP, portée `apps/bell/src` + `packages/*/src`.
- `:36` `ALLOWLIST = new Set(["packages/rpc-guard/src/transport.ts"])` — UNE entrée (D-3 pourrait ajouter `apps/bell/src/close.ts` à déclencheur).
- `:38` `KEY` regex couvre `CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY`.
- `:68` test ACTIF compagnon `rpc_guard_package_src_clean_and_allowlist_load_bearing` (moitié paquet verte + non-vacuité).
- En-tête `:15-24` : « 14 hits mesurés sur base `514ee1a` » — **lignes périmées** ; 1b RE-MESURE (M1+M2 = 13 sites ; le
  `undici`/commentaire du 14ᵉ a disparu).

## M10 — Opérateurs résolus par le transport 2b (gap Bell)

`F:\Monark-wt-garde2b\packages\rpc-guard\src\transport.ts:61-83` (resolveOperators) :
```
helius            <- BELL_SOLANA_RPC (+?api-key=HELIUS_API_KEY)  unit=credits  cycleCap=8_000_000
chainstack        <- CHAINSTACK_ETH_URL (ETH!)                    unit=ru       cycleCap=16_000_000
solana-foundation <- api.mainnet-beta.solana.com                 unit=keyless
drpc.org/mevblocker.io/nodies.app/pocket.network/tenderly.co (keyless ETH)
```
GAP mesuré pour Bell : **`CHAINSTACK_SOLANA_URL` (Chainstack Solana) NON résolu** ; Databento/Polygon NON opérateurs
(« stay FORMED items », `transport.ts:12`) ; le transport ne fait qu'un **POST JSON-RPC** (`transport.ts:162`) — pas de GET.

## M11 — Faits CHANTIERS/FAITS cités (localisés par CONTENU ; n° de ligne du kit périmés)

- `docs/CHANTIERS.md:540` : temps 2 = Bell, course ~5,4 M cr Helius, plusieurs jours.
- `docs/CHANTIERS.md:561-562` : HORS portée = course ~5,4 M cr + question C-F-4 ; caps 8 M/16 M = gardes anti-BUG.
- `docs/CHANTIERS.md:571` : « solana-mainnet 8 603 RU … le 2026-09-20 … déclencheur : GARDE-HELIUS-1b pour Solana » (E-5).
- `docs/CHANTIERS.md:344` : CI tourne « sans HELIUS_API_KEY ni BELL_SOLANA_RPC dans l'environnement ».
- `docs/CHANTIERS.md:478,489` : décisions 112 (Helius 8 M cr, floor 60 938) / 115 (Chainstack 16 M RU).
- `F:\PRODUITS\etude-2026-09-21\garde-helius-2\FAITS-tarification-chainstack-2026-09-21.md:10` (pt 7) : Solana archive =
  {getTransaction,getBlock,getBlockTime,getBlocks,getBlocksWithLimit,getSignaturesForAddress,getFirstAvailableBlock,
  getSignatureStatuses} = 2 RU ; « toute autre méthode Solana = 1 RU » (⇒ getAccountInfo/getTokenAccountsByOwner = 1 RU).
- FAITS pt 9,11 : UN compte, 5 nœuds (solana ET ethereum) ; ethereum-mainnet 4 258 RU / solana-mainnet 8 603 RU le 20/09
  (D-4 : cap 16 M au niveau COMPTE vs par réseau — question).

## M12 — Régression durcie D-9 (transport POST-only vs sémantiques a1-bis/quorum)

`grep -nE "redirect|method:" F:/Monark-wt-garde2b/packages/rpc-guard/src/transport.ts` (le SEUL `fetch`) :
```
162:  fetch(url, { method: "POST", headers: {...}, body: JSON.stringify({jsonrpc...}), signal: ctl.signal });
```
⇒ **PAS de `redirect` (défaut "follow")**, **PAS de lecture `retry-after`**, POST JSON-RPC SEUL.

`apps/bell/src/universe-cli.ts` (chemin live à migrer) :
```
267: fetch(url, { method: "GET", ..., redirect: "manual", signal });   [issuer GET keyless]
271: if (res.status >= 300 && res.status < 400) throw new RedirectBlockedError(... C-G2-3 ...);
281: fetch(url, { method: "POST", ..., redirect: "manual", signal });   [Chainstack Solana]
283: if (res.status >= 300 && res.status < 400) throw new RedirectBlockedError(... body must not reach redirected host ...);
```
`apps/bell/src/universe.ts:122` : `HttpStatusError && status===403 → Fatal403Error` (hard stop) ; `:125` honore `Retry-After`.
`apps/bell/src/quorum.ts` : taxonomie PARALLÈLE `SolRpcError`/`isSolRevert` (`:36-46`) + `statusOf` regex `/\bHTTP\s+(\d{3})\b/` (`:55`).
```
⇒ D-9 : migrer le `fetch` dans le transport SANS porter redirect:"manual"/3xx-typé/Retry-After/403-hard-stop/statusOf
  = régression SILENCIEUSE (tests `deps`-injectés restent verts). Déliverables + mutants en G0 §4-D-9 / §7.
```
