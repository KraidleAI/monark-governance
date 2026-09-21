# G2 — RELECTEUR (instance séparée, contexte frais, revue 3 étapes) — Bell **T-1a-iii-a1-bis**

## Modèle résolu (R-1)
`claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 4.8 1M ctx ; Opus 5 banni, non utilisé).
RELECTEUR G2. **R-20 : aucun commit, aucun workflow, aucune écriture dans le dépôt.** Vérification par RE-EXÉCUTION dans un
arbre ISOLÉ. **AUCUN réseau** (lot hors ligne ; Chainstack facture : aucun appel — voir §Méthode pour la seule décision de
périmètre que cela impose). Advisor intégré consulté 1× (avant de figer le plan de vérification) + 1× à la clôture.

## VERDICT : **PASS-AVEC-CORRECTIONS**

Les 4 livrables (D1 ledger chaîné tamper-évident, D2 `sanitizeIdentityText`, D3 shim no-egress, C-11 sonde) sont **sains,
branchés (upcoming) et non vacants** : oracle re-exécuté vert, 7/9 mutants du RENDU rejoués ROUGE de première main (le 8ᵉ ROUGE
hors ligne, le 9ᵉ non exécutable sans egress réel — consigné), et **7 sondes de mon cru sur l'ARGENT/la sûreté** mesurées. Le
**finding D4** (flake libuv `async.c:76`, PAS une fuite de socket) est **CONFIRMÉ de première main** (ma matrice ×30 l'a
reproduit 1/30 sur `server.test.ts` DÉJÀ drainé). Aucune correction n'est un fail-open du cœur tamper-évident : ce sont des
**précisions R-21 + un résidu de sanitizer non déclaré + le pattern phantom-fresh (HELIUS-1) + une sonde C-11 qui STOPPE sur
403/3xx (contredit un ruling bloquant) + l'escalade D4 déjà formée**. **SIX** corrections C-G2b-n formées ci-dessous ; aucune
ESCALADE-INVESTISSEUR (lot hors ligne, tout `upcoming`).

---

## Méthode (reproductible — R-21)
- **Arbre isolé** : `git -C F:\Monark-wt-a1bis archive HEAD | tar -x` sous `F:\tmp\g2-a1bis\tree\` (907 fichiers) ;
  `node_modules` = **jonction** vers `F:\Monark\node_modules` (créée par PowerShell `New-Item -ItemType Junction` ; `tsc`
  résolu). **JAMAIS** `git checkout`/`stash`, **JAMAIS** `npm ci`/`install`. Node **24.15.0**, npm 11.12.1.
- **Byte-exactitude** : sha256 des 11 fichiers touchés enregistré avant tout mutant, **re-vérifié identique après restauration**
  (`ALL 11 FILES BYTE-EXACT RESTORED`, `F:\tmp\g2-a1bis\{baseline,final}-sha.txt`). Les shas de départ **coïncident avec ceux
  du RENDU** (`universe.ts 096f9dc4…`, `universe-cli.ts 8c35634a…`, `universe.test.ts 47a09ca6…`, `no-network.mjs 0d3d0da7…`,
  `server.test.ts 0f460ae4…`, etc.) ⇒ mon arbre est l'état livré, byte pour byte.
- **Décision de périmètre imposée par le mandat (consignée, non contournée)** : `test/export-public.test.ts` (test 42 +
  42(f'), 2 tests) exécute **`npm ci` + un `npm run ci` imbriqué** (`:294 runNpm("npm ci")`) = **install + egress registre**,
  interdits par « AUCUN réseau / jamais npm ci ». Je l'**exclus** de tous mes runs. Conséquence : ma suite compte **576** (=
  578 du RENDU − 2 tests export-public). **Le run unique du worker de test 42 n'est donc PAS re-vérifié par ce G2** (dépendance
  réseau+install) ; item non bloquant (hors périmètre bell/universe).

---

## 1. Oracle re-exécuté (arbre isolé, tous verts)
| Gate | Résultat | Preuve |
|---|---|---|
| `gate:vocab` | **exit 0** — 188 fichiers, « no forbidden claim » | `node scripts/grep-forbidden.mjs` |
| `typecheck` (`tsc --noEmit`) | **exit 0** — aucune sortie | `node_modules/.bin/tsc --noEmit` |
| `test` (verbatim `package.json:16`, **− test 42**) | **576 pass / 0 fail / 0 skip, exit 0** (`ℹ pass 576`) | globs `ci.yml` moins `export-public.test.ts` |
| `lint` (`eslint .`) | **exit 0** | `node_modules/.bin/eslint .` |
| `lint:ratchet` | **exit 0 — 69/69** | `node scripts/lint-ratchet.mjs` |
| `lang:gate` (scope bell) | **0 hit** | `node scripts/lang-gate.mjs` |

**R-25** : base `4f81f67`, pathspec **verbatim** `.github/workflows/ci.yml:65` ⇒ `11 files changed, 448 insertions, 50
deletions` = **CHANGED 498 ≤ 1 205** (identique au RENDU). **Vocabulaire interdit** (`partner|autonomous|guarantee|verified|
score|accuracy|confidence`, frontières de mot) sur les lignes `+` du diff code : **0 hit**. **Branchement** : le diff ne
touche aucun registre (site/README/skills/export/fleet) ; aucun `bell` servi dans `apps/site/src` ⇒ **tout reste `upcoming`**
(cohérent G7 `docs/G7-lot-t1a-iii-a1.md:17`).

**Risque de fusion** : `git merge-tree --write-tree lot/etude-suite 9992e5b` ⇒ **exit 0, 0 conflit** (arbre `01ac2bd…`) malgré
la base ancienne (~40 commits derrière). Les 5 fichiers de test drainés (probe-narabi, http.test, server.test, h5-e2e,
byo-demo) **auto-fusionnent**. Le **verrou de format C-3** survit : `LEDGER_GENESIS`/`chainedLedgerEntry(prevSha,page,txs)`/
`ledgerSha` sont **inchangés** `4f81f67 → lot/etude-suite` (seules des ADDITIONS autour — `verifyLedgerChain`, `GTFA_PAGE_LIMIT`,
`RetryFn` ; test 8d importe des signatures stables). **CONV-2 non contredit** : `packages/rpc-guard/src/ledger.ts` (etude-suite)
utilise la MÊME discipline `entry_sha256 = sha256(JSON.stringify({prev_entry_sha256, ...core}))`, prev en 1ʳᵉ clé ⇒ le format
inline d'universe est cohérent avec l'hôte futur.

---

## 2. Table livrable → code → test non-LLM → mutant (rejoué ROUGE, sortie citée)
| Livrable | Code (fichier:ligne) | Test non-LLM | Mutant → résultat (mesuré) |
|---|---|---|---|
| **D1** ledger chaîné | `universe.ts:193` `verifyChain`, `:221` `readPriorCalls`, `:184` `chainedLedgerEntry`, `:181` `ledgerEntrySha256` ; `universe-cli.ts:135` `persist` (ancre D'ABORD) | `bell_universe_ledger_chain_rederives_and_refuses_downward_edit` ; `…_crash_between_writes_resumes_conservatively` (C-6) ; `…_format_is_byte_identical_to_b3d` (C-3) ; `…_cli_composes_from_file_to_artifact` (C-5) | **M-chain** RED ; **M-regenesis** RED ; **M-down** RED ; **M-absent** RED ; **M-format** RED ; **M-order** RED (tous `exit=1` sous `--test-name-pattern`) |
| **D2** sanitize | `universe.ts:406` `sanitizeIdentityText`, `:424` application `name`/`symbol`, `:414` `countIdentityEmptied` | `bell_universe_identity_text_sanitized_no_false_reject` (16/16 fixture = identité) | **sanitizer no-op** RED (`exit=1`) |
| **D3** no-egress | `no-network.mjs` (`net.Socket.prototype.connect` throw + `fetch` ceinture + marqueur) ; `universe.test.ts:627` test 22 | `bell_universe_cli_no_network_egress_under_shim` (a: http STOP+marqueur ; b: https⇒`SHIM:` stderr) | **D3a `--import` retiré** RED **hors ligne** (`exit=1, 0s`, stderr `request url is not https (refused before send)` — marqueur absent, sous-cas (b) jamais atteint ⇒ **0 egress**) ; **D3b sous-cas (b) disarm** = NON exécuté (réclame un egress réel, interdit — §4) |
| **C-11** sonde | `universe-cli.ts:163` sonde `page+1` (`maxRetries:0`, try/catch, `BudgetExceededError` re-jeté, +1 tick) | couverte par le test de composition (`r.calls` inclut +1) | garde d'observation **budgétée** (mesuré : tick +1, aucun STOP sur page **vide/404**) — **MAIS re-jette 403 & 3xx ⇒ STOP** (voir **C-G2b-6**, §3-G) |
| **D4** drain | `server.test.ts` +4 sites, `http.test.ts`+`probe-narabi`+`h5-e2e`+`byo-demo-builder`+`h5-trace-builder`+`byo-demo-probe` = **10 sites** ; test `harness_server_drain_leaves_no_server_handle` | assertion déterministe `TCPServerWrap` clears | **AUCUN mutant déterministe** (déclaré) — **CONFIRMÉ** : retirer `closeAllConnections()` du test le laisse **VERT** (Node 24 `close()` seul purge le handle) ⇒ l'oracle déterministe **ne prouve pas** le drain. Le flake réel est mesuré §3. |

Baseline pré-mutant et post-restauration : **sha256 identiques** pour `universe.ts`/`universe-cli.ts`/`universe.test.ts`/
`server.test.ts` (jamais `git checkout` — copie pristine hors dépôt).

---

## 3. Mutants de mon cru sur l'ARGENT / la sûreté (7 — mesurés : A–G)

**(A) SOUS-compte — le « write-behind ≤ 2 appels » ne vaut PAS partout (mesuré).** Le `persist()` de PAGINATION est un
**`finally` HORS de la boucle `for`** (`universe-cli.ts` : `for(...){ pagedGet }` puis `} finally { persist(); }`), et
`pagedGet` fait `budget.tick()` AVANT le GET. Run instrumenté (spy `writeFile` sur l'ancre, 5 pages) : **la 1ʳᵉ écriture
d'ancre porte `calls=5`, pas `calls=1`** ⇒ un kill DUR en cours de pagination perd jusqu'à **N_pages** ticks, **≠ ≤ 2**. La borne
« ≤ 2 logical calls » (commentaire bound-model `universe.ts:161`, qui cite le confirm-`finally` `universe-cli.ts:159` —
**citation périmée : il est en réalité à `:196`** dans le fichier livré) **ne tient que pour la phase CONFIRM** (persist par-mint). **Nuance de matérialité décisive** : la pagination frappe `ISSUER_HOST` (xStocks, **NON payant**) ; seuls
les confirmations frappent Chainstack (**payant**, persist par-mint ⇒ **≤ 2 tient sur le chemin ARGENT**). ⇒ **précision R-21**,
non bloquant. **C-G2b-2.** *(Le « ≤ 2 » du chemin payant est **lu dans le code** — le `confirm` a un `finally { persist(); }`
par-mint, `universe-cli.ts:196`, avec paçage séquentiel asserté par test 20 — PAS mesuré par un kill instrumenté ; mon run
instrumenté n'exerçait que la pagination, 0 confirm.)*

**(B) `verifyChain` — `seq` non contrôlé.** `verifyChain([seq5,seq2,seq9])` (calls monotones) ⇒ **`ok=true`** ; `seq=-7` ⇒
**`ok=true`** (`Number.isInteger(e.seq)` **sans `>= 0`**, alors que `calls_cumulative` a bien `< 0 ⇒ false`). La mission
demandait « refuse-t-il un `seq` non monotone » : **NON**. Matérialité : `seq` est haché (falsifier une ligne EXISTANTE casse la
chaîne — `M-chain`/`M-regenesis` ROUGE) ; la reprise utilise `entries.length`, PAS le champ ⇒ `seq` **non porteur** pour le
budget ; atteignable seulement par réécriture coordonnée (hors modèle). **Durcissement**, pas un défaut ARGENT. **C-G2b-4.**

**(C) Chaîne cassée / troncature de queue — corrects.** `verifyChain` refuse un `prev` cassé (`ok=false`, mesuré). Une
**troncature de queue seule** (journal→2 entrées, ancre inchangée=16) ⇒ `readPriorCalls = {calls:16,…}` = **ancre en avance ⇒
sur-compte CONSERVATEUR, aucun throw** (sûr). La **troncature coordonnée** (journal→2 ET ancre abaissée à la tête=10) ⇒
`{calls:10}` = sous-compte **DÉCLARÉ hors modèle** (« ledger propre de l'opérateur » ; exposition ≤ `--max-calls`). Le
`.head` sidecar de `@monark/rpc-guard` DÉTECTE cette troncature ⇒ point de convergence CONV-2, pas un défaut du lot.

**(D) Phantom-fresh — le pattern HELIUS-1 (mesuré).** `readPriorCalls` sur **ancre+journal absents** ⇒ `{calls:0, GENESIS,
0}` (reset silencieux, correct pour un run VRAIMENT neuf). Mais `--ledger` défaut = `join(out,"budget.json")`
(`universe-cli.ts:79`) et **`mkdirp(a.out)` tourne AVANT `readPriorCalls`** (`:115` puis `:124`) ⇒ un **`--out` fauté/déplacé
à la reprise repart silencieusement de 0 et re-dépense**. `@monark/rpc-guard` ferme EXACTEMENT ça (**C-8** `ensureCycleDir` :
« le parent DOIT préexister, sinon throw ») ; universe **ne le fait pas**. Un ledger **corrompu** throw (bien), un **absent**
reset (le trou). Exposition ≤ `--max-calls`/run (modèle déclaré) et le rapprochement inter-run est le **ledger de CYCLE**
(garde-helius, write-ahead, lui-même gate de la course G7:18) ⇒ non bloquant, mais **c'est le pattern racine que la mission
pointe**. **C-G2b-3.**

**(E) Sanitizer — bypass devise collée (mesuré, NON déclaré).** `\b(USD|EUR|GBP|CHF|JPY|CAD|AUD)\b` rate les formes
**collées** : `sanitizeIdentityText` rend **inchangés** `"USD12"`, `"12USD"`, `"AAPL USD150"`, `"EUR3"`, `"JPY100"` (une
**valeur devise+montant survit** dans un texte d'identité) tandis que `"USD 12"`/`"x USD 9"` sont vidés. C'est un résidu
**distinct** du résidu déclaré « entier nu (TSLA 420) » et il **contredit la clause anti-close** « aucune valeur de prix ne
doit survivre ». **Correctif vérifié viable** : lookaround à frontière de LETTRE `(?<![A-Za-z])(USD|EUR|GBP|CHF|JPY|CAD|AUD)
(?![A-Za-z])` ⇒ **0 faux-rejet sur les 16 valeurs de fixture**, attrape TOUTES les formes collées, **préserve** les symboles
`USDx`/`USDCx`/`EURCx` (suivis d'une lettre). **C-G2b-1.**

**(F) D4 — flake libuv CONFIRMÉ de première main.** Ma matrice **×30** (suite − test 42, `--test-force-exit`) : **1/30 crash**
(`run-004`, `exit=1`) portant **`Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), file src\win\async.c, line 76`**,
sur **`apps\harness\test\server.test.ts` — qui PORTE le drain**. ⇒ le drain de sockets **ne ferme PAS** ce crash (c'est un
`uv_async_t`, pas un socket). Taux ~3,3 % (cohérent avec ~4 % worker ; puissance : à 4 %, P(≥1 crash / 30) ≈ 0,71 — j'ai vu 1,
**donc CONFIRMÉ, pas « inconclusive »**). Preuve indépendante croisée : le worker `matrix-clean-82/` porte **4 `.exit`
non-nuls** (= le 4/100 du RENDU, corroboré) dont **2 logs flushent le texte d'assertion** (`run-008.log:222`, `run-057.log` —
un abort C-runtime n'écrit pas toujours le buffer redirigé ⇒ 4 crashes, 2 signatures visibles), relus [lu]. **La CI tourne sur `ubuntu-latest`** ⇒ la variante ASSERTION
(`src\win\async.c`) est **Linux-immune** ; la variante byo-demo (sans marqueur UV) reste **CI-immune INFÉRÉE, non prouvée**
(caveat worker conservé). Les **10 sites de drain** = hygiène socket **correcte et sûre** (Node ≥18.2, en `finally`, idempotent,
symétrique test 18) mais **NON porteuse** du critère D4 « 0 échec ×100 » et **non prouvée** par un oracle déterministe (§2).
**À conserver comme livré** (pas du bruit à reverter) ; le critère ×100 reste **impossible par le code de test** ⇒ **escalade
config-CI** (décision orchestrateur, options (a)/(b)/(c) du RENDU — pas la mienne). **C-G2b-5.**

**(G) C-11 — la sonde STOPPE le run sur 403 & 3xx (mesuré, contredit un ruling BLOQUANT).** `universe-cli.ts:163-178`, le
`catch` fait `if (e instanceof BudgetExceededError) throw e;`. Or **`Fatal403Error` ET `RedirectBlockedError` sous-classent
`BudgetExceededError`** (`universe.ts:88`+ ; c'est voulu pour que `withUniverseRetry`/quorum2 les re-jettent en STOP dur sur le
chemin PRINCIPAL). Dans la SONDE, ils sont donc re-jetés ⇒ **STOP**. Mesuré (sonde `page+1` levant l'erreur) : `403 ⇒ REJET
Fatal403Error "HTTP 403 hard stop"` ; `3xx ⇒ REJET RedirectBlockedError` ; **`404 ⇒ run COMPLÈTE, `past_end_probe=http_404`
avalé** (spec-conforme). Cela **contredit** le pli CP1 **C-11** (bloquant) : « le catch **avale HTTP/transport, y compris un 4xx
passé-fin**, **JAMAIS un STOP** ». Impact ARGENT nul (sonde AVANT tout confirm payant). Mais c'est **exactement** la [lacune]
« que rend `/public/assets` passé-fin ? » : **si l'émetteur 403/redirige les pages hors borne, CHAQUE course meurt à la
sonde** ⇒ **à corriger AVANT la 1ʳᵉ course**. **C-G2b-6.**

Le shim (D3) est correct : test 22 **VERT** hors ligne (sous-cas (b) : le CLI franchit le préflight, atteint le GET, le shim
**jette `SHIM:` AVANT tout connect** ⇒ 0 socket, 0 DNS — `net.Socket.prototype.connect` remplacé en bloc, `lookupAndConnect`
jamais atteint ; **aucun appel `dns` direct** dans `apps/bell/src` [grep]). La sonde `+1 GET` est **budgétée** (`budget.tick()`
mesuré : `calls` 5→6 après la page vide, sans STOP) ; le swallow d'un **4xx générique (404) est mesuré** (G), mais 403/3xx
STOPpent (C-G2b-6) — le reste du chemin swallow (transport) est **lu dans le code**, non mesuré au-delà du 404.

---

## 4. Le 9ᵉ mutant NON exécuté (consigné, non contourné)
Le mutant D3b (« shim désarmé sur le chemin, sous-cas https ») ne rougit **que** si le shim est retiré ALORS que le CLI atteint
le chemin d'egress ⇒ **tentative de connexion réelle vers `core.chainstack.com`/`api.xstocks.fi`**. Mon mandat interdit tout
appel réseau (Chainstack facture). Je **ne l'exécute pas** et je le consigne (jamais contourné). Non-vacuité **établie
autrement** : (i) test 22 sous-cas (b) VERT **non muté** prouve que le seul producteur de `SHIM:` sur stderr est le throw du
shim au `connect` (0 connexion) ; (ii) inspection : un shim désarmé ne peut rougir (b) **que** par egress réel. Le replay du
worker tient dans son environnement ; il n'est simplement pas **ré-exécutable par ce G2** sans violer « aucun appel ». D3a
(`--import` retiré) EST rejoué ROUGE de première main **hors ligne** (rougit au marqueur, préflight-STOP avant tout envoi).

---

## 5. Corrections formées (C-G2b-n : fichier:ligne, correctif, test/mutant, error_origin)

- **C-G2b-1 (D2, non bloquant — déclencheur : AVANT la 1ʳᵉ publication).** `universe.ts:404` `IDENTITY_CURRENCY_CODE = /\b(…)\b/i`
  rate les devises **collées** (`AAPL USD150`, `USD12`, `12USD`, `EUR3` survivent — mesuré) ⇒ contredit l'anti-close et n'est PAS
  couvert par le résidu déclaré « entier nu ». **Correctif** : `/(?<![A-Za-z])(USD|EUR|GBP|CHF|JPY|CAD|AUD)(?![A-Za-z])/i`
  (**vérifié** : 0 faux-rejet /16 fixture, attrape les collées, préserve `USDx`/`USDCx`). **Test** : étendre
  `bell_universe_identity_text_sanitized_no_false_reject` avec `["USD12","12USD","AAPL USD150","EUR3"] ⇒ ""` et
  `["USDx","USDCx","EURCx"] ⇒` identité. **Mutant prouvé** : `sanitizeIdentityText("AAPL USD150") === "AAPL USD150"`.
  **error_origin = plan** (le pli C-7 a spécifié `\b`). À défaut du correctif : **DÉCLARER** la devise collée au résidu (comme
  « TSLA 420 »).
- **C-G2b-2 (D1, non bloquant — doc/ADR).** La borne R-21 « write-behind ≤ 2 appels » (commentaire `universe.ts:161` ;
  confirm-`finally` réel `universe-cli.ts:196` — le commentaire le cite `:159`, **périmé**) est **trop étroite** : elle vaut
  pour CONFIRM (payant, persist par-mint), PAS pour la PAGINATION
  (persist unique post-boucle ⇒ fenêtre de kill-dur ≤ `maxPages`, **mesuré `calls=5` à la 1ʳᵉ écriture**). **Correctif** :
  amender le commentaire + ADR (D-a) : « fenêtre kill-dur = ≤ `maxPages` sur le chemin ISSUER **non payant** ; ≤ 2 sur le chemin
  Chainstack **payant** ». **error_origin = plan** (C-1 cadré sur `:159` seul).
- **C-G2b-3 (D1, non bloquant → CONV-2).** Phantom-fresh : `readPriorCalls` absent+absent ⇒ 0, et `mkdirp(a.out)`
  (`universe-cli.ts:115`) précède `readPriorCalls` (`:124`) ⇒ un `--out` fauté à la reprise repart de 0 (pattern HELIUS-1).
  **Correctif** : adopter le garde **C-8** de `@monark/rpc-guard` (`ensureCycleDir` : parent du `--ledger` DOIT préexister à la
  reprise, sinon throw), ou un `--resume` explicite. **error_origin = plan** (réutilisation de la sémantique absent→0 sans le
  garde pré-existence de l'hôte CONV-2). Exposition ≤ `--max-calls`/run + backstop ledger de CYCLE (garde-helius).
- **C-G2b-4 (D1, non bloquant — durcissement).** `verifyChain` (`universe.ts:193`) n'exige ni `seq` monotone ni `seq ≥ 0`
  (mesuré `ok=true` sur `[5,2,9]` et `seq=-7`). **Correctif** : ajouter `e.seq >= 0` (parité avec `calls_cumulative`) et, si
  voulu, `seq == position`. Non porteur pour le budget (reprise via `entries.length`). **error_origin = plan.**
- **C-G2b-6 (C-11, non bloquant lot — déclencheur : AVANT la 1ʳᵉ course).** La sonde d'observation `universe-cli.ts:163-178`
  re-jette `Fatal403Error`/`RedirectBlockedError` (sous-classes de `BudgetExceededError`) ⇒ **un 403 ou un 3xx passé-fin STOPPE
  le run** (mesuré : `403⇒Fatal403Error`, `3xx⇒RedirectBlockedError`, `404⇒avalé`). **Contredit le pli CP1 C-11** (bloquant :
  « avale un 4xx passé-fin, JAMAIS un STOP »). **Correctif** : attraper explicitement `Fatal403Error`/`RedirectBlockedError`
  AVANT le re-jet ⇒ `past_end_probe=http_403`/`redirect_blocked` ; ne re-jeter QUE le cap budget pur (`e.constructor ===
  BudgetExceededError`). **Test/mutant** : sonde `page+1` levant `HttpStatusError(403)` ⇒ run rejette (ROUGE sous le code
  actuel) ; doit compléter avec `past_end_probe=http_403`. **error_origin = worker** (le pli C-1..C-13 a spécifié « avale un
  4xx » ; la hiérarchie de sous-classes a été manquée à l'implémentation). Impact ARGENT nul, mais lie la [lacune] passé-fin
  (5a) : si l'émetteur 403/redirige hors borne, la course ne peut jamais aboutir.
- **C-G2b-5 (D4, non bloquant lot — ESCALADE config-CI déjà formée par le worker).** Critère « 0 échec ×100 »
  **inatteignable par le code** : le flake est `src\win\async.c:76` (`uv_async_t` au `process.exit()` de `--test-force-exit`
  sous concurrence), **CONFIRMÉ 1/30 sur `server.test.ts` drainé**. **Cible d'amendement** : `docs/G2-DELTA-lot-t1a-iii-a1.md:71-82`
  (diagnostic « handles » erroné) + G0 D4. **error_origin = plan** (mauvais diagnostic G2-delta ; cause infra PRÉ-EXISTANTE,
  `bfcc7cd`, non introduite par le lot). Décision (a)/(b)/(c) = **orchestrateur**, pas le relecteur. Le drain reste livré
  (hygiène correcte, à ne PAS reverter).

**Corrections de citation déjà portées au RENDU (validées [lu])** : `ci-gates.test.ts:1269 ⇒ :1329` (verrou réel
`--test-force-exit`, **inchangé**, non touché) ; `rebase-crosscheck.ts:441-452 ⇒ :385-395` ; **recensement drain = 10 sites**
(pas 5). Résidus FORMÉS (5a sonde assertante [lacune passé-fin], 5b `digest.ts localeCompare`, 6 reprise mi-course, C-12
concurrence, CONV-1/2) : chacun a déclencheur + propriétaire ⇒ **zéro dette nue**.

---

## 6. error_origin (proposé au G7)
- C-G2b-1 / C-G2b-2 / C-G2b-3 / C-G2b-4 = **plan** (le pli checkpoint-1 a fixé la forme `\b`, cadré la borne ≤2 sur le seul
  `:159`, réutilisé absent→0 sans le garde pré-existence, spécifié `verifyChain` sans `seq`).
- **C-G2b-6 (sonde C-11 STOP sur 403/3xx) = worker** (le pli C-1..C-13 exigeait « avaler un 4xx passé-fin » ; la hiérarchie
  `Fatal403Error`/`RedirectBlockedError extends BudgetExceededError` a été manquée à l'implémentation).
- C-G2b-5 (D4) = **plan** (mauvais diagnostic G2-delta + critère dérivé impossible) ; cause infra **pré-existante**.
- Cœur du code livré (D1/D2/D3) = **worker fidèle au plan (imparfait)** ; aucun fail-open ARGENT introduit ; le seul écart
  d'implémentation au plan est C-G2b-6 (C-11).

## 7. Ce qui est PROUVÉ vert (résumé adversarial)
Tamper-évidence D1 non vacante (7 mutants ROUGE), refus baisse/chaîne-cassée/torn-line, conservativité au crash (C-6),
verrou de format C-3 byte-identique et **stable à la fusion**, no-egress D3 prouvé **sans réseau réel**, sanitizer non vacant,
sonde C-11 budgétée (avale un 404 ; **STOP sur 403/3xx = C-G2b-6**), oracle 576/0, R-25 498, 0 vocab interdit, 0 conflit de
fusion, tout `upcoming`. Les **six** corrections sont **des précisions/durcissements + un slip d'implémentation C-11 (impact
ARGENT nul) + une escalade déjà formée**, aucune n'ouvre le cœur ARGENT/sûreté ⇒ **PASS-AVEC-CORRECTIONS**.

**R-20 : je ne committe pas, je ne déclenche aucun workflow. Sortie = donnée brute pour l'orchestrateur (R-21).**
