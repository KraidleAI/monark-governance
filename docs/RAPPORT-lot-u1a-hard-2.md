# RAPPORT — lot U-1a-hard-2 (worker Opus 4.8)

**Modèle résolu tel quel (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` — effort max). Worker du lot
U-1a-hard-2, worktree `F:\Monark-wt-u1ahard2`, branche `lot/u-1a-hard-2`, base `e8bcfe4` (gel U-1a-hard).
Aucun commit, aucun `git` d'écriture, aucun workflow (R-20). Scratch sous `F:\tmp\u1a-hard-2\` uniquement.

Corrige la **liste fermée V-1 (a)-(f)** du checkpoint-2 (`docs/CHECKPOINT2-lot-u1a-hard.md`, ACCEPTE-AVEC-CORRECTIONS,
validateur `claude-fable-5-1`, 2026-09-19). Tout code/commentaires/tests en anglais (`apps/sentinel` est exporté).
V-5 (provenance) rejouée. Les deux items formés ont été **TRANCHÉS par l'orchestrateur (2026-09-19)** et appliqués
(§Tranchés) : `{ timeout: 10_000 }` par-test (AUTORISÉ) + `--test-force-exit` (ACCEPTÉ) ⇒ suite ukemi rouge en 10,3 s sous R2.

---

## Résultat global (sorties reproductibles)

| Gate | Commande | Résultat |
|---|---|---|
| ci | `npm run ci` | exit 0 — gate:vocab **157**, tsc **0**, tests **341/341** |
| lint | `npm run lint` | exit 0, propre |
| ratchet | `npm run lint:ratchet` | exit 0, **69/69** (plafond inchangé, 0 nouvelle violation) |
| export:check | `npm run export:check` | exit 0 — 0 chemin interdit, **0 hit français** scope {root,contracts,schemas,hikae,ukemi,atelier,monark,site,harness,skills} |
| lang-gate | `node scripts/lang-gate.mjs --scope root,contracts` | exit 0 — 0 hit français (apps/sentinel = scope **root** via classifyScope) |
| no_secret | tests `no_secret_in_repo` + `bell_no_secret_in_repo` | ✔ / ✔ (dans les 341) |
| suite finale | `npm test` | exit 0, **341/341**, wall 38,0 s, duration_ms **35 861** (base : 336/336) |
| PIN | `sentinel2_book_identical_to_pull` | ✔ `book_digest` = `034fbff9…` intact ; aucune clé de book nouvelle ; recorder reste `upcoming` |
| mutants | driver `F:\tmp\u1a-hard-2\mut\mutant-driver.mjs` | **11/11** : baseline vert, mutant rouge, aucun hang, restauration == PIN |

`gate:vocab` inchangé (157) : le scanner de vocabulaire couvre packages/* + apps/site, **pas** apps/sentinel —
portée mesurée, pas une dette ; l'anglais de sentinel est garanti par lang-gate (scope root = exit 0) + export:check.

PIN post-changement des sources (restaurées intactes par le driver) :
- `rpc2.ts` sha256 `720d399eccb2d9843646c591287a4ee647cefac84f83871b1e6fb9857637c570`
- `record.ts` sha256 `71c542e7abbb2f2a8cc977b1534a0479ec89cb9cdc08673ffe3cc43771b53db9`
- **ukemi_sha** (témoin de build sur `ukemi/*.ts`) : CHANGERA au prochain run live (record.ts + rpc2.ts modifiés) —
  attendu et correct (c'est un témoin de build hors digest) ; les artefacts D9 weth/susde gardent `5b666ace…` comme
  leur PROPRE provenance ; **aucun re-record requis** (le book_digest 034fbff9 est inchangé, prouvé par le PIN).

---

## Par item (fichiers/lignes · test · mutant · mesure)

### (a) `isMainModule` extrait + garde cross-plateforme
- **Code** : `record.ts:153` `export function isMainModule(argv1: string | undefined, metaUrl: string): boolean`
  = `argv1 !== undefined && pathToFileURL(argv1).href === metaUrl` (false si argv1 undefined). Run-guard
  `record.ts:195` `if (isMainModule(process.argv[1], import.meta.url))`.
- **Test** : `ukemi-record.test.ts:122` `ukemi_record_is_main_module_cross_platform` — chemin frère avec espace
  (`./a b/record.ts`), URL canonique percent-encodée (`%20`) ; nouveau garde `true`, ancienne forme
  (`"file://" + argv1.replace(/\\/g,"/")`) `≠` href ; `isMainModule(undefined,…) === false`.
- **Mutant (a)** : `pathToFileURL(argv1).href === metaUrl` → ancienne forme string ⇒ **rouge** (fail 1, 228 ms).
- **Preuve end-to-end (règle §F)** : `node apps/sentinel/src/ukemi/record.ts --cluster bogus` ⇒ `FATAL … unknown
  cluster 'bogus'`, **exit 1** (l'ancien garde était un no-op silencieux exit 0 sous Windows). `--retries -1` ⇒
  exit 1 (fail-closed).
- *Portée de la preuve « rougit sous CI Linux »* : exécutée sous Windows dans cette session (nouveau garde true,
  ancienne forme ≠ href) ; l'invariance Linux est **inférée** de la sémantique de percent-encoding (POSIX :
  `fileURLToPath` rend un espace littéral, `"file://"+p` sans `%20` ⇒ ≠ href ; cf. `probes/o1-crossplatform.mjs`
  du validateur qui le confirme sur Linux). Confirmation Linux au premier run CI g3.

### (b) refonte du stub `ukemi_record_retry_is_bounded` + `--test-timeout` + `timeout-minutes`
- **Test refondu** : `ukemi-record.test.ts:49` — le stub sert 503 aux tentatives 0..retries (0,1,2, les seules
  qu'une boucle bornée atteint) et un **200 valide à la 4ᵉ** (attempt 3). Boucle bornée ⇒ rejette au 3ᵉ 503,
  `count===3`. Boucle non bornée ⇒ atteint la 4ᵉ, **RÉSOUT** `0x2a`, `assert.rejects` échoue et `count===4` ⇒ les
  deux assertions échouent vite ET le loop est RÉSOLU (le processus sort), au lieu du stub précédent (503 sans fin)
  qui pendait l'event-loop.
- **`--test-timeout=120000` + `--test-force-exit`** (`package.json` script `test`). Sizing : durée réelle de la
  suite **~35 s** (test le plus lent `export_public_no_governance_no_french` = ~29,5 s, rejoue la suite en enfant) ;
  120 000 ms ≈ **3,4×** la suite (≥ 3× marge), et ≥ 40 s exigés par le test d'export. **`--test-force-exit` est
  MESURÉ nécessaire** (voir analyse R2 ci-dessous) : `--test-timeout` seul marque un test rouge mais NE termine PAS
  un hang à base de `setTimeout` (l'event-loop reste vivant) — c'est exactement le constat du validateur (« ✖ à 5 s
  MAIS processus jamais terminé »). `--test-force-exit` rend `--test-timeout` porteur — **ACCEPTÉ par l'orchestrateur
  (2026-09-19, « mesuré : requis »)**.
- **`{ timeout: 10_000 }` par-test sur `ukemi_default_call_classifies_rpc_errors`** (`ukemi.test.ts:158`, AUTORISÉ
  par l'orchestrateur) : le seul test-boucle de la paire sous R2 (cas (c), 429 persistant) est ainsi borné à 10 s
  par-test tout en gardant le `--test-timeout` GLOBAL à 120 000 pour le test d'export (29,5 s). Sous R2, la paire
  ukemi COMPLÈTE rougit et sort en **10,3 s** (mesuré, ci-dessous).
- **`timeout-minutes` sur chaque job** (`ci.yml`) : g3 (test-porteur) **10**, g1/r25/g4/g6 **5**. Mesures locales
  (npm ci **16,2 s** inclus) : g3 wall ~62 s, g4 ~29 s, g6 ~18 s, g1/r25 ~1 s ; bornes ≥ 3× mesure + overhead CI,
  **≤ 20** ; commentaire d'audit sur g1.

**Analyse R2 (mesurée — le point délicat, tout est reproductible via `F:\tmp\u1a-hard-2\mut\`)**
R2 = mutation SOURCE (`retirer && attempt < maxRetries` du branchement 429/5xx). Elle touche TOUT test qui pousse
`makeDefaultCall` sur un 429/5xx **persistant**, pas seulement le tueur désigné.
- **Tueur désigné** (`ukemi_record_retry_is_bounded`, méthodologie du driver `--test-name-pattern`, comme le driver
  e8bcfe4 du validateur) : R2 ⇒ **rouge en 271 ms, exit 1, `signal:null`** (le processus SORT seul, driver SANS
  `--test-timeout`, garde spawnSync 45 s jamais atteinte). C'est la preuve « rougit en < 10 s au lieu de pendre » :
  271 ms ≪ 10 s, terminaison propre (l'ancien stub tenait 345 s, tué).
- **Suite COMPLÈTE sous R2** (mesuré, `r2-suite-measure.mjs` / `r2-cancelled-capture.mjs`) : R2 étant une mutation
  SOURCE, la paire ukemi ne pend QUE sur `ukemi_default_call_classifies_rpc_errors` **cas (c)** (`ukemi.test.ts:195`,
  429 « rate limited » persistant) — mesuré : c'est le SEUL test-boucle de la paire (sous R2 : pass 29, fail 1 =
  tueur, cancelled 1 = cas (c)). **Orchestrateur TRANCHÉ (2026-09-19)** : `{ timeout: 10_000 }` par-test sur ce test
  (`ukemi.test.ts:158`). Mesures :
  - **R2 + flags production (`--test-timeout=120000 --test-force-exit`) : exit 1, `signal:null`, 10 285 ms**, 31
    tests (pass 29, fail 1 = tueur, cancelled 1 = cas (c) annulé à son cap 10 s) ⇒ la PAIRE COMPLÈTE rougit et SORT
    en **10,3 s < 15 s** sous R2. **Exigence orchestrateur satisfaite.**
  - Justification des deux mécanismes (provenance) : R2 SANS `--test-force-exit` ⇒ hang, SIGTERM à **25 012 ms**
    (l'event-loop reste vivant ; `--test-timeout`/`{timeout}` seul ne le termine pas) ; suite VERTE
    `--test-timeout=120000 --test-force-exit` ⇒ **341/341 exit 0** (aucune régression du force-exit).
  - Tueur désigné isolé (méthodologie driver `--test-name-pattern`, comme le driver e8bcfe4 du validateur) :
    **271 ms, exit 1, `signal:null`** (« rougit en < 10 s au lieu de pendre » ; l'ancien stub tenait 345 s, tué).

### (c) plafond de backoff
- **Code** : `record.ts:39` `export function backoffDelay(attempt, backoffMs, capMs) = Math.min(backoffMs * 2 **
  attempt, capMs)` (pure, exportée) ; `DefaultCallOpts.backoffCapMs` (`record.ts:30`, défaut **8000**,
  `record.ts:52`) ; utilisée aux deux sleeps (`record.ts:67` réseau/timeout, `record.ts:74` 429/5xx) ; CLI
  `--backoff-cap-ms` fail-closed (`record.ts:143`, `UkemiArgs.backoffCapMs` `record.ts:123`) ; câblée dans `main()`
  (`record.ts:163`) et **journalisée en provenance `params.backoff_cap_ms` (`record.ts:179`) — HORS digest**, donc
  aucune clé de book ajoutée (census de clés visiblement intact ; PIN 034fbff9 rejoué OK).
- **Test** : `ukemi-record.test.ts:133` `ukemi_record_backoff_delay_is_capped` — 0⇒500, 3⇒4000, 4⇒8000, 20⇒8000,
  `∀ a∈[0,30] backoffDelay(a) ≤ 8000` ; parse CLI étendu + `--backoff-cap-ms -5` ⇒ fail-closed.
- **Mutant (c)** : retirer `Math.min(…)` ⇒ **rouge** (fail 1, 252 ms).

### (d) garde `res.json()` — 200 non-JSON
- **Code** : `record.ts` — `res.text()` puis `JSON.parse` sous try/catch ; à l'échec, journal `{provider, method,
  http:200, message:"non-JSON body: <≤160 chars>"}` (`record.ts:85`) puis `throw new Error("HTTP 200 non-JSON
  <prov>")` (`record.ts:89`).
- **Classification : NON-retryable** (retenu). Justification (commentaire une ligne, `record.ts:86`) : un corps
  non-JSON d'un endpoint JSON-RPC est un **mauvais routage** (mauvais hôte / page HTML), pas un transitoire ;
  rejouer la même URL renvoie le même corps ⇒ on benche (throw), le quorum bascule. Le snippet reste **dans le
  journal seulement**, hors du message jeté, pour ne pas déclencher `isResultLimit` en aval.
  *Contre-argument exposé* : une 200 non-JSON pourrait être un hoquet CDN transitoire ⇒ retryable-borné défendable ;
  **rejeté** car le quorum-2 fournit déjà la résilience par benching et un retry sur endpoint mal routé = tempête.
- **Test** : `ukemi-record.test.ts:144` `ukemi_record_guards_non_json_200` — fetch stubbé 200 `text/html` ; rejette
  `/HTTP 200 non-JSON drpc\.org/`, **count===1** (jamais retryé malgré retries=3), 1 entrée de journal,
  `provider==="drpc.org"` (domaine, jamais l'URL à clé), `http===200`, message `/^non-JSON body: /`.
- **Mutant bonus (d)** : retirer l'entrée de journal ⇒ **rouge** (fail 1, 240 ms).

### (e) drpc 400 « free plan » — bencher sans splitter
- **Formes exactes** (journal D9, `F:\tmp\u1a-hard\{weth,susde}-live.json`) : drpc HTTP **400**, corps
  `{"error":{"message":"ranges over 10000 blocks are not supported on free plan","code":35}}`. Occurrences :
  weth **31** (sur **56** 400 drpc : 31 free-plan + 25 « Can't route your request… », code 12) ; susde **31**
  (sur **63** 400 drpc : 31 + 32 « Can't route »). (weth a aussi 2 reverts eth_call code 3 ⇒ rpc_error_count 58 ;
  susde 63.)
- **Fait mesuré clé** : `isResultLimit("…ranges over 10000…free plan")` = **true** (via `10000` et `ranges? over`)
  ⇒ aujourd'hui ce 400 EST splitté jusqu'au plancher, alors que le chunk fait déjà 9990 blocs (< 10000) : le
  blocage est le **PLAN**, pas la plage (drpc l'a renvoyé 31 fois sur un chunk de 9990) ⇒ splitter est futile.
- **Code** : `rpc2.ts:53` `const isPlanLimited = (m) => /free plan/i.test(m)` ; `getLogsVia` (`rpc2.ts:174`)
  `if (isPlanLimited(msg)) throw e;` AVANT la clause `isResultLimit` ⇒ le quorum benche une fois.
- **Test** : `ukemi-record.test.ts:163` `ukemi_record_free_plan_benches_without_split` — 3 fournisseurs, drpc sert
  la 400 « free plan », les 2 autres des logs ; **drpcCalls===1**, la plage réussit via les 2 sains.
- **Mutant (e)** : retirer la clause ⇒ drpc splitté en cascade (>> 1 appel) ⇒ **rouge** (fail 1, 297 ms).
- **PIN safe** : le digest est fonction des LOGS, pas du choix de fournisseurs ; drpc était benché de toute façon
  sur le run live ; mevblocker+tenderly concordent ⇒ book_digest inchangé.

### (f) non-chevauchement/dédup inter-chunks
- **Constat** : le code ne dédoublonnait PAS ; chunks et splits sont demi-ouverts disjoints par construction (aucun
  doublon avec fournisseurs honnêtes) — mais un fournisseur au `toBlock` **inclusif off-by-one** (`[from, to+1]`)
  sert le log de coupe des deux côtés. Correction minimale.
- **Code** : `rpc2.ts:88` `export function dedupLogs(logs)` — dédoublonne sur `(blockNumber, logIndex,
  transactionHash)` **normalisés comme logsKey** (`parseInt(…,16)` + hash minusculé, contre la dérive de format
  hex entre fournisseurs ; 1ʳᵉ occurrence gardée) ; appliquée `rpc2.ts:195` `return dedupLogs(out)`.
- **Test** : `ukemi-record.test.ts:185` `ukemi_record_getlogsrange_dedups_chunk_boundary` — chunk=10 sur [0,19],
  fournisseurs off-by-one concordants (drift partagé ⇒ quorum concorde ; drift unilatéral ⇒ QuorumDisagreementError
  attrapé plus tôt) ; bloc 10 (chunk2.from = chunk1.to+1) servi des deux côtés. Assert : **aucun doublon** et
  **couverture [0,19] sans trou**.
- **Mutant (f)** : `return dedupLogs(out)` → `return out` ⇒ bloc 10 en double ⇒ **rouge** (fail 1, 262 ms).
- **PIN safe** : l'énumération des porteurs (`book.ts:117`) passe par un `Set` ⇒ dédup = no-op sur données
  correctes, aucun digest épinglé déplacé (034fbff9 rejoué OK).

---

## Mutants rejoués — `F:\tmp\u1a-hard-2\mut\mutant-driver.mjs` (11/11)

PINs + copies pristines POST-changement (les PINs e8bcfe4 du validateur sont périmés après ce lot). Les **6 anchors
préexistants (M4/M5/M5b/M6/R1/R2) vérifiés présents post-changement** (la branche `ANCHOR NOT FOUND` du driver
n'a jamais tiré) ; l'anchor R2 est la CONDITION `if ((…) && attempt < maxRetries)`, intacte (je n'ai changé que le
`sleep(...)` interne). Le `to` injecté de R1 est mis à jour en `sleep(backoffDelay(attempt, backoffMs,
backoffCapMs))` pour compiler contre la nouvelle signature. node lancé SANS `--test-timeout` (le wall-time EST la
preuve de sortie) ; garde spawnSync 45 s. Par mutant : baseline pristine vert → mutation mono-chaîne → rouge →
restauration → sha256 == PIN.

| Mutant | fichier | baseline | mutant | restauré==PIN |
|---|---|---|---|---|
| M4 revert benche | rpc2 | pass 2 fail 0 exit 0 | fail 1 exit 1 (236 ms) | oui |
| M5 revertKey ignore data | rpc2 | pass 2 fail 0 | fail 1 exit 1 (3591 ms*) | oui |
| M5b garde 0x retirée | rpc2 | pass 2 fail 0 | fail 1 exit 1 (642 ms) | oui |
| M6 clause message retirée | rpc2 | pass 3 fail 0 | fail 2 exit 1 (852 ms) | oui |
| R1 retry sur RpcError | record | pass 2 fail 0 | fail 1 exit 1 (292 ms) | oui |
| **R2 retry infini** | record | pass 2 fail 0 | **fail 1 exit 1 (271 ms, signal:null)** | oui |
| (a) garde forme string | record | pass 2 fail 0 | fail 1 exit 1 (228 ms) | oui |
| (c) plafond backoff retiré | record | pass 2 fail 0 | fail 1 exit 1 (252 ms) | oui |
| (d) journal non-JSON retiré | record | pass 2 fail 0 | fail 1 exit 1 (240 ms) | oui |
| (e) clause plan-limit retirée | rpc2 | pass 2 fail 0 | fail 1 exit 1 (297 ms) | oui |
| (f) dédup retirée | rpc2 | pass 2 fail 0 | fail 1 exit 1 (262 ms) | oui |

`final rpc2 sha … ==PIN`, `final record sha … ==PIN`, **ALL MUTANTS OK**. Aucun mutant en `--test-name-pattern` ne
pend (tous `signal:null`). (*M5 3591 ms = bruit machine ponctuel ; toujours rouge, exit 1, signal null.)

---

## V-5 (provenance) — gho-probe rejoué

Rejoué `F:\tmp\u1a-hard\gho-probe.mjs` (réseau public keyless), sortie brute persistée HORS dépôt dans
`F:\tmp\u1a-hard-2\gho-probe-raw.json` (NON committé).
- **sha256** : `38b9a609d1429e1ea4d10d630ce131bfa3b96990e37222027a2b5ebbb1c44431`
- Résultat : finalized quorum [26012250, 26012250] ⇒ B=26012250 ; `getSourceOfAsset(GHO)@B` = `0xd110cac5…`
  (préfixe ADR match true) ; `description()@B` sur les 4 fournisseurs = **JSON-RPC error code=3 « execution
  reverted »**, `isRpcRevert=true` pour les 4 (drpc/mevblocker `data="0x"`, blastapi/nodies `data=undefined`).
  Confirme le critère `isRpcRevert` live (la table §5 redevient re-vérifiable).
- **Appels réels : 7** (2 finalized + 1 source + 4 description), pas ≤ 6 : la sonde interroge les 4 fournisseurs
  pour `description()`. Sonde du validateur inchangée ; mesure exacte donnée par transparence (l'« ≤ 6 » du brief
  comptait implicitement 3 des 4 appels description).

---

## Taille de lot (R-25) et provenance

- **Diff code+config** `git diff --shortstat e8bcfe4 -- <exclusions ci.yml>` : **6 fichiers, 198 insertions + 29
  suppressions = 227 lignes** — sous l'objectif < 400 et le plafond 1 205. Détail :
  `record.ts` 51 · `rpc2.ts` 30 · `ukemi-record.test.ts` 130 · `ukemi.test.ts` 5 (le `{timeout}` tranché) ·
  `ci.yml` 9 · `package.json` 2.
- **Ce rapport** `docs/RAPPORT-lot-u1a-hard-2.md` (~240 lignes) n'est PAS exclu par le pathspec R-25 de `ci.yml`
  (seuls `docs/G1-lot-*.md` / `docs/G2-lot-*.md` le sont) ⇒ au commit, R-25 total ≈ 227 + ~240 ≈ **~467**, toujours
  **≪ 1 205** ; l'objectif « code < 400 » est tenu (227). **Fait signalé à l'orchestrateur** (pas une dette) :
  committer le rapport hors compte R-25 (comme G1/G2) ou l'accepter dans le total.
- Provenance : modèle `claude-opus-4-8[1m]`, 2026-09-19, worktree `F:\Monark-wt-u1ahard2`, base `e8bcfe4`. Aucune
  URL/clé écrite (journal = `providerOf(url)` = domaine ; `no_secret_in_repo` vert ; tests (d)/(structured errors)
  vérifient domaine, jamais l'URL à clé).

---

## Tranchés par l'orchestrateur (2026-09-19) — appliqués + re-mesurés

La liste fermée V-1 (a)-(f) est traitée, testée (11 tests ukemi-record : 5 neufs + refonte (b) + parse étendu),
couverte par 11 mutants (baseline vert / mutant rouge / aucun hang / restauration PIN), tous gates verts, PIN
034fbff9 intact, recorder `upcoming` (aucun registre, aucune clé de book nouvelle), V-5 persistée avec sha.

Les deux items formés du premier rendu ont été **TRANCHÉS par l'orchestrateur** et appliqués :

1. **AUTORISÉ — `{ timeout: 10_000 }` par-test sur les tests boucle-fetch.** Mesuré (`r2-cancelled-capture.mjs`) :
   sous R2 la paire ukemi ne pend QUE sur `ukemi_default_call_classifies_rpc_errors` cas (c) (`ukemi.test.ts:195`,
   429 persistant) — 1 seul `cancelled`, aucun autre test-boucle. `{ timeout: 10_000 }` ajouté sur ce test
   (`ukemi.test.ts:158`). **Re-mesure `r2-suite-measure.mjs` (flags production `--test-timeout=120000
   --test-force-exit`) : la paire COMPLÈTE rougit et SORT en 10 285 ms = 10,3 s < 15 s** (exit 1, `signal:null`,
   pass 29 / fail 1 tueur / cancelled 1 cas (c)). Exigence orchestrateur satisfaite.
2. **ACCEPTÉ — `--test-force-exit`** (orchestrateur : « mesuré : requis »). Sans lui, `--test-timeout`/`{timeout}`
   marquent le rouge mais NE terminent PAS l'event-loop (mesuré SIGTERM à 25 s) ⇒ rouvrirait l'AM-1 du validateur ;
   avec lui, le processus sort. Green suite `--test-timeout=120000 --test-force-exit` = **341/341 exit 0** (aucune
   régression, mesuré).

**Reste : vide.** Aucune dette, aucun point ouvert. `npm run ci` 341/341, lint 0, ratchet 69/69, export:check 0,
lang-gate 0, no_secret ✔, mutants 11/11, PIN 034fbff9 intact, R-25 code 227 (< 400).
