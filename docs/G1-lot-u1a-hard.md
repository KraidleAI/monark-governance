# G1 — journal de provenance, lot U-1a-hard (durcissement `record.ts` + tueurs M4/M5/M6 + oracle `defaultCall` + vérification live V-4)

- **Modèle worker** : `claude-opus-4-8[1m]` (Opus 4.8, 1M contexte), effort `max`. Opus 5 banni (roster 2026-08-14).
  Contrôle de résolution (R-1) rendu au premier tour de session : préfixe `claude-opus-4-8` conforme, vérifié.
- **Date** : 2026-09-19. **Worktree** : `F:\Monark-wt-u1ahard`, branche `lot/u-1a-hard` (base `lot/etude-suite` `a3f85f4` ; dépôt principal `F:\Monark`). **Aucun commit** (R-20) ; l'orchestrateur relit (R-21) et committe.
- **Rattachement** : décision investisseur 21 (zéro dette = tout item de code bloquant avant release) ; V-4 du checkpoint-2 bis (`docs/CHECKPOINT2bis-lot-u1a.md` §4) ; O1-O3 de la G2 delta (`docs/G2-delta-lot-u1a.md`, tueurs M4/M5/M6) ; item CHANTIERS §E « durcissement `record.ts` » ; ADR-U1 D1/D3/D4/D9 + amendement 2026-09-19.
- **Périmètre livré (et rien d'autre)** : `apps/sentinel/src/ukemi/{record,book}.ts` (modifiés), `apps/sentinel/test/ukemi.test.ts` (modifié), `apps/sentinel/test/ukemi-record.test.ts` (nouveau) ; `apps/sentinel/src/ukemi/rpc2.ts` **inchangé** (aucun changement de code nécessaire — voir §5). **Non touché** : `rpc2.ts`, `abi.ts`, `clusters.ts`, `wadray.ts`, fixtures, `vocab-banned.json`, tout registre (`fleet.ts`, README, site, skills, deploy, `run.ts`). `git status --short` = `M book.ts`, `M record.ts`, `M ukemi.test.ts`, `?? ukemi-record.test.ts`.
- Discipline disque : `TEMP/TMP/TMPDIR=F:/tmp` (slashes avant, piège O7 évité) ; `npm ci` dans le worktree (282 paquets, 0 vuln), jamais de jonction ; artefacts live D9 hors dépôt sous `F:\tmp\u1a-hard\`.

## 1. Fichiers livrés + sha256 (LF-normalisé, `tr -d '\r' | sha256sum` ; lignes = LF)

| Fichier | État | Lignes | sha256 (LF) |
|---|---|--:|---|
| `apps/sentinel/src/ukemi/record.ts` | **modifié** (durcissement) | 168 | `58151dc1c96621c86a2437d2b1f319483702388f956d4327818d1edc9ad55aac` |
| `apps/sentinel/src/ukemi/book.ts` | **modifié** (`RecordOpts.fromBlock` — plancher d'énumération) | 207 | `a539eabb03be84db580699c56afd8fed9fc3fbb00da70d20e5315fe0c4ef40bc` |
| `apps/sentinel/src/ukemi/rpc2.ts` | **inchangé** (= gel U-1a) | 198 | `019786c8836cb3f382682d9067fea23a390ff7f000cce89cb6e3c2b53e7b74b2` |
| `apps/sentinel/test/ukemi.test.ts` | **modifié** (+M4/M5/M5b/M6 + oracle `defaultCall`) | 351 | `7633355c70ada0b6f25b9b9339c703e5046e387f608a659b1bc0b86dae53ccdd` |
| `apps/sentinel/test/ukemi-record.test.ts` | **nouveau** (oracles du durcissement) | 101 | `6526b85b7eba7570534fd9fdd61f809b3b439c7cfa4120e4c7d4d0015973c965` |

Tous LF sur disque (CR=0 mesuré ; `.gitattributes: * text=auto eol=lf` ⇒ git stocke LF ; `git show :rpc2.ts` = 0 CR).

**`ukemi_sha`** (recette `record.ts` `ukemiSha` : `nom + \0 + octets`, `.ts` de `ukemi/` triés — `abi, book, clusters, record, rpc2, wadray` —, octets bruts = LF, hors digest, D2/C-6) = **`5b666aceb66c149e41bb11c8dca402de63914aaba8a02e9d85d1aeb0160f4448`** (avant durcissement, gel U-1a : `c94bd79b…`). Vérifié deux voies : calcul LF indépendant **=** valeur émise par la CLI live (`ukemi_sha=5b666ace…` dans les deux runs §6).

## 2. Le durcissement (ADR-U1 D3/D4/D9)

**`record.ts`** (le wrapper NON committé de G1 §5b devient le code officiel) :
- **Bug du garde `main()` CORRIGÉ (porteur, mesuré)** : le garde `import.meta.url === "file://" + argv[1].replace(/\\/g,"/")` produisait sous Windows une URL à **deux** slashes (`file://F:/…`) tandis que `import.meta.url` en a **trois** (`file:///F:/…`) ⇒ toujours faux ⇒ la CLI était un **no-op silencieux** (exit 0, aucun fichier écrit — reproduit avant correctif). C'est **pourquoi G1 §5b a eu besoin d'un wrapper hors dépôt**. Corrigé par `pathToFileURL(process.argv[1]).href === import.meta.url` (forme `file:///` canonique, mesurée égale). La CLI tourne désormais comme code officiel (runs §6 le prouvent).
- **`makeDefaultCall(opts)`** : retry **borné** sur HTTP 429/5xx et fautes réseau/timeout — total = `retries + 1` tentatives, backoff `backoffMs·2^attempt`, **jamais infini** ; un `RpcError` typé (erreur JSON-RPC) est la réponse déterministe du nœud et **n'est jamais retenté** ; le **corps** d'une réponse non-2xx est surfacé dans le message d'erreur pour que `getLogsVia` puisse splitter un HTTP 400 « range too large ».
- **Journal structuré par fournisseur** `onRpcError({provider, method, http?, code?, message, data?})` — `provider` = **domaine enregistrable** (`providerOf`), jamais l'URL (sans secret) ; collecté dans l'artefact D9 (`rpc_errors`).
- **`export const defaultCall = makeDefaultCall()`** = instance **brute** (retries=0) : le chemin de **classification** (fetch → `RpcError` | `Error` transport) que les tests pilotent directement ; **le retry vit dans l'instance CLI** via `--retries` (voir §4/§6). (Dit explicitement pour la G2 : le retry n'est pas « absent de `defaultCall` » — il est dans l'instance durcie de `main()`.)
- **CLI** `parseUkemiArgs(argv)` : `--cluster`, `--block`, `--from-block` (plancher d'énumération), `--min-interval-ms`, `--retries`, `--backoff-ms`, `--out` ; entiers non négatifs (fail-closed sinon). `--out` par défaut = `os.tmpdir()` (avec `TMPDIR=F:/tmp` exporté ⇒ hors dépôt ; **jamais la racine du dépôt**, contrairement à l'ancien défaut `join(here,"..",…,"ukemi-book-live.json")` — risque D9 corrigé). **Note disque** : si `TMPDIR`/`TMP` n'est pas exporté, `os.tmpdir()` tombe sur `C:\Users\…\Temp` (contraire à la règle « rien sur C: ») — hors CI et documenté ; les runs §6 passent toujours `--out F:/tmp/u1a-hard/…` explicite.

**`book.ts`** : 5ᵉ paramètre optionnel `opts.fromBlock` ⇒ énumération depuis `max(reserveInitBlock, fromBlock)` (jamais en-dessous) ; `reserve_init_block` reste le **fait épinglé** ; **omis ⇒ historique complet depuis `reserveInitBlock` ⇒ digest PIN `034fbff9…` inchangé** (rejeu fixture, §7).

**`rpc2.ts`** : **aucun changement**. Le split de plage est déjà dans `getLogsVia`/`isResultLimit` (motif exigé) ; il ne manquait que la surface du corps HTTP 400, apportée par `record.ts` `defaultCall`. Le critère `isRpcRevert` est confirmé live (§5) ⇒ pas d'élargissement.

## 3. Oracle d'exécution (mesuré, worktree `F:\Monark-wt-u1ahard`, `npm ci` propre)

| Gate | Sortie MESURÉE | Attendu | ✓ |
|---|---|---|---|
| `npm run ci` (gate:vocab → tsc → test) | gate:vocab **OK 157 fichiers** · tsc **0 erreur** · **tests 336 / pass 336 / fail 0** | ≥ 326 + tests | ✓ |
| `node --test ukemi.test.ts ukemi-record.test.ts` | **26 / 26 / 0** (16 U-1a + 4 nouveaux ukemi + 6 record) | — | ✓ |
| `npm run lint` (`eslint .`) | exit 0, 0 sortie | 0 | ✓ |
| `npm run lint:ratchet` | **69/69** (plafond inchangé) | 69/69 | ✓ |
| `node scripts/lang-gate.mjs --scope root` | **OK, 0 hit français** | 0 | ✓ |
| `npm run export:check` | check OK — 0 forbidden path, 0 non-exempt French (scopes root/…/ukemi/…/skills) | OK | ✓ |
| `npm run gate:vocab` | **OK — 157 fichiers**, 0 claim (scope sentinel vert) | OK | ✓ |

Compteur tests : 326 (base `lot/etude-suite`) + **10** (M4, M5, M6, `ukemi_default_call_classifies_rpc_errors` ; +6 dans `ukemi-record.test.ts`) = **336**.

## 4. Tests ajoutés

| Test | Fichier | Ce qu'il prouve |
|---|---|---|
| `ukemi_revert_does_not_bench_provider` (M4) | ukemi.test | 3 fournisseurs : read1 revert concordant sur 2 ; read2 valeur sur ces 2 **pendant que le 3ᵉ est transport** ⇒ le quorum ne peut venir que des 2 ayant reverté ⇒ read2 = valeur **prouve** qu'ils ne sont pas en cooldown (inférence directe, indépendante de N). |
| `ukemi_revert_key_uses_data` (M5 + **M5b**) | ukemi.test | même `data` + messages ≠ ⇒ `ConcordantRevertError` ; `data` ≠ + même message ⇒ `QuorumDisagreementError` ; **cas 3 (GHO réel, V-4)** : un fournisseur `data:"0x"` + un fournisseur **sans** `data`, même message ⇒ `ConcordantRevertError` (garde le garde `data !== "0x"`). |
| `ukemi_is_rpc_revert_rejects_archive_miss` (M6) | ukemi.test | `isRpcRevert(RpcError("header not found",-32000))=false`, idem « missing trie node », `code 3` sans « revert »=false ; contrôles positifs code 3/-32000 nommant un revert=true. |
| `ukemi_default_call_classifies_rpc_errors` | ukemi.test | **le VRAI `defaultCall`** (fetch stubbé, typé, restauré en `finally`) à travers `makeUkemiPool` → `book.ts`. 7 cas : baseline ⇒ **PIN `034fbff9…`** ; (a) `{code:3}` unanime ⇒ book `["","",""]` ; (a′) `{code:-32000,data:"0x"}` ⇒ book `["","",""]` ; (b) valeur/revert ⇒ `QuorumDisagreementError` ; (c) revert + HTTP 429 ⇒ `NoQuorumError` ; (f) `-32000 header not found` ⇒ `NoQuorumError` (archive miss = transport) ; (i) erreur **sans `code`** ⇒ `code ?? 0` ⇒ transport ⇒ `NoQuorumError`. |
| `ukemi_record_retries_transient_http` | ukemi-record | 429 puis 503 puis 200 ⇒ récupère dans le budget (3 tentatives). |
| `ukemi_record_retry_is_bounded` | ukemi-record | 503 persistant ⇒ throw après **exactement** `retries+1`=3 tentatives (borné, jamais infini). |
| `ukemi_record_does_not_retry_rpc_error` | ukemi-record | `{error:{code:3}}` ⇒ `RpcError` en **1 tentative** (déterministe, jamais retenté), même avec `retries:5`. |
| `ukemi_record_get_logs_splits_on_http400_range` | ukemi-record | fournisseur cappé à 5000 blocs ⇒ HTTP 400 « block range too large » ⇒ corps surfacé ⇒ `getLogsVia` splitte récursivement ⇒ logs servis. |
| `ukemi_record_logs_structured_errors` | ukemi-record | journal = **domaine enregistrable** (`mevblocker.io`, pas l'URL `…?k=secret`) + `code`/`message`. |
| `ukemi_record_parses_cli_args` | ukemi-record | tous les flags + défauts ; flag numérique non-entier/négatif ⇒ fail-closed. |

## 5. Vérification live V-4 du critère `isRpcRevert` (sonde ciblée, hors dépôt)

Bloc finalisé explicite **B = 26 011 741** (quorum 2 fournisseurs sur `finalized`, jamais le tag mutable — D7). `getSourceOfAsset(GHO 0x40D16FC0…)@B` = **`0xd110cac5d8682a3b045d5524a9903e031d70fccd`** (préfixe ADR `0xd110cac5…` **✓**). `description()` sur cette source @B via **chacun des 4 fournisseurs eth_call** :

| Fournisseur | `code` | `message` | `data` | `isRpcRevert` |
|---|---|---|---|---|
| drpc.org | `3` | `execution reverted` | `"0x"` | **true** |
| mevblocker.io | `3` | `execution reverted` | `"0x"` | **true** |
| blastapi.io | `3` | `execution reverted` | *(absent)* | **true** |
| nodies.app | `3` | `execution reverted` | *(absent)* | **true** |

**Résultat** : les 4 fournisseurs renvoient la **même forme** (`code 3`, « execution reverted »). Tous classés `revert` par `isRpcRevert` ⇒ **critère confirmé live, aucune adaptation nécessaire** (ni code, ni test, ni ADR). **Finding porteur, désormais GARDÉ par un test** : le garde `e.data !== "0x"` de `revertKey` est **load-bearing** — drpc/mevblocker renvoient `data:"0x"`, blastapi/nodies **aucune** `data` ; sans le garde `"0x"`, les clés seraient `"0x"` vs `"execution reverted"` ⇒ `QuorumDisagreementError` ⇒ abstention à tort. Avec le garde, `data "0x"` et `data` absente routent **toutes** vers le message normalisé « execution reverted » ⇒ **concordant** ⇒ `ConcordantRevertError` ⇒ toléré `""` pour `description()`. **Gardé par `ukemi_revert_key_uses_data` cas 3** ; le mutant **M5b** (retrait de `&& e.data !== "0x"`) est **prouvé tueur** (§9). C'est le comportement V-1, désormais **prouvé LIVE** (et non plus seulement offline).

## 6. Runs live bornés (artefacts D9, NON committés, hors dépôt `F:\tmp\u1a-hard\`)

CLI durcie : `node apps/sentinel/src/ukemi/record.ts --cluster <c> --block <B> --from-block <B-2000> --min-interval-ms 300 --retries 3 --out F:/tmp/u1a-hard/<c>-live.json`. Fenêtre bornée 2 000 blocs (plancher `--from-block`, motif G1 §5b). `git -C F:\tmp\u1a-hard rev-parse` = `fatal: not a git repository` (hors dépôt).

| Cluster | B | from_block | book_digest | holders | at_risk | eligible | excluded (coll_off/no_debt/zero) | calls | rpc_errors | secondes | sha256 artefact | octets |
|---|---|---|---|--:|--:|--:|---|--:|--:|--:|---|--:|
| weth | 26 011 721 | 26 009 721 | `2c225b523e8ef670053468692e72cc079e62e1bab547215e3356dc1056b70c0e` | 118 | 56 | 0 | 38/24/0 | 847 | 58 | 255.0 | `63f8213436a3229dfa5bc55362d4c15100d90e4f229524910f95c3a03c31a1c7` | 77 448 |
| susde-usde | 26 011 752 | 26 009 752 | `8ea0d5324e514f2cb5bcb5f6ca1cc074050bb3e60e303d32fc0c457ce8aee6b4` | 5 | 4 | 0 | 0/1/0 | 147 | 63 | 29.2 | `7864b6ccc7797d8a9ccfc115f8d0f2e18020ece8e1bba2a11bb2a799fd01993f` | 26 311 |

- **`eligible_static = 0`** dans les deux (aucun HF < 1e18 dans la fenêtre récente bornée — pas de cascade live en cours ; jamais un chiffre inventé). Les deux `book_digest` sont des **sous-ensembles à fenêtre bornée** (plancher `from_block`), reproductibles avec les `params` auto-enregistrés dans l'artefact ; **pas** le book plein deploy→B (item formé §10). `ukemi_sha` des deux artefacts = `5b666ace…` (= §1).
- **`calls` = invocations au niveau du pool** (le wrapper `counting` de `main()` enveloppe l'instance durcie), **pas** le nombre de tentatives `fetch` : un `call` qui retente en interne (429/5xx) compte pour **1** ; l'écart `calls` vs `rpc_errors` s'explique par (i) les reverts/400 comptés dans `rpc_errors` mais pas re-fetchés, (ii) les branches de split `getLogsVia` (voir ci-dessous). Le compteur de tentatives fetch n'est pas exposé (item mineur, non requis).
- **`rpc_errors` — formes réelles par fournisseur (journal structuré du durcissement)** :
  - **drpc.org HTTP 400 `eth_getLogs`** **~56** (weth) / **~63** (susde) — **non déterministe par construction** : `Promise.all` dans `getLogsVia` laisse les branches sœurs du split continuer après le premier rejet, donc le compte dépend de l'ordonnancement (un re-run donne un nombre voisin, pas identique). Corps **surfacé** : `{"error":{"message":"ranges over 10000 blocks are not supported on free plan","code":35}}` — **refus de plan** (dégradé depuis le census, G1 §7-3). `isResultLimit(corps)=true` ⇒ `getLogsVia` **splitte** (borné, `depth<20`, garde `to>from`) ; le split n'aide pas (refus de plan, pas une vraie plage) ⇒ drpc **benché** ⇒ quorum getLogs = **{mevblocker, tenderly}** ⇒ runs réussis (fail-safe D3, jamais un book partiel).
  - **mevblocker.io / blastapi.io `code=3 "execution reverted"`** `eth_call` ×1 chacun (weth) — reverts `description()` de sources GHO-like dans la fenêtre, correctement classés (cohérent §5).
  - **Aucun HTTP 429/5xx** dans ces deux runs (fournisseurs sains) ⇒ le **retry live n'a pas été exercé** ; il est couvert par l'oracle déterministe `ukemi_record_retries_transient_http` (dit tel quel, jamais un chiffre inventé). G1 §5b avait rencontré un 429 mevblocker sous charge — item formé §10.

## 7. Forme canonique + branchement (inchangés)

- **PIN `034fbff9eb2ef08079ed478960fcfa86e0e4db6d1c3946156e9170358976b921` intact** : `sentinel2_book_identical_to_pull` **et** la baseline de `ukemi_default_call_classifies_rpc_errors` reproduisent le PIN (336/336). `book.ts` `opts.fromBlock` omis ⇒ énumération inchangée. **Aucune clé nouvelle**, aucun flottant.
- **Aucun registre touché** : `git status` = les 4 fichiers code/test seuls ; `fleet.ts`/README/site/skills/deploy/`run.ts` intacts. Le recorder reste **`upcoming`** (chemin servi = U-6, ADR-M018/M020 D5). Les runs live n'ont écrit que sous `F:\tmp\u1a-hard\`.

## 8. R-25 (mesuré `git diff --shortstat a3f85f4`, pathspec **exact `ci.yml:52`**)

- Tracked (book.ts, record.ts, ukemi.test.ts) : **3 fichiers, 234 ins, 37 del ⇒ 271** ; numstat : `book 12/4`, `record 126/33`, `ukemi.test 96/0`.
- Nouveau non-tracké `ukemi-record.test.ts` (addition pure) : **+101**.
- **R-25 = 271 + 101 = 372 < 1 205** (marge **833**). `docs/G1-lot-u1a-hard.md` **exclu** par le pathspec `:(exclude)docs/G1-lot-*.md` (rapport de gouvernance, vérifié absent du `git diff --name-only` avec exclude). Aucune fixture touchée.

## 9. Mutants tueurs M4/M5/M5b/M6 — REJOUÉS (copie scratch de l'arbre ÉDITÉ, R-20 : dépôt jamais touché)

Copie `F:\tmp\u1a-hard\mut\apps\sentinel` de l'arbre **édité** (test file sha `7633355c…` = §1) ; mutation de `rpc2.ts` (le code sous test), `node --test`, restauration `cp` + sha vérifié. Pristine `rpc2.ts` avant/après = `019786c8836cb3f382682d9067fea23a390ff7f000cce89cb6e3c2b53e7b74b2` (bit-exact).

| # | Mutation (rpc2.ts) | Tueur nommé | Attendu | MESURÉ | Restauration sha |
|---|---|---|---|---|---|
| **M4** | retrait du bench-skip : `cooldownUntil.set(url, …)` ajouté dans la branche revert (un revert benche) | `ukemi_revert_does_not_bench_provider` | ROUGE | **ROUGE 19/20** (fail 1) | `019786c8…` ✓ |
| **M5** | `revertKey` ignore `data` (branche `data` retirée ⇒ clé = message) | `ukemi_revert_key_uses_data` (cas 1/2) | ROUGE | **ROUGE 19/20** (fail 1) | `019786c8…` ✓ |
| **M5b** | `revertKey` : garde `&& e.data !== "0x"` retiré (clé = `data` brute même `"0x"`) | `ukemi_revert_key_uses_data` (cas 3, GHO mixte réel) | ROUGE | **ROUGE 19/20** (fail 1) | `019786c8…` ✓ |
| **M6** | `isRpcRevert` : clause message `/execution reverted\|revert/i` retirée | `ukemi_is_rpc_revert_rejects_archive_miss` **+** `ukemi_default_call_classifies_rpc_errors` | ROUGE | **ROUGE 18/20** (fail 2) | `019786c8…` ✓ |

Les trois mutants **survivants** de la G2 delta (O1-O3 = M4/M5/M6) sont désormais **tués** par des tests nominatifs ; **M5b** (ajouté après avis adversarial : le finding « garde `data !== "0x"` load-bearing » du §5 n'était gardé par aucun test) est prouvé tueur du même test. M6 est en plus attrapé par l'oracle `defaultCall` (cas (f)).

## 10. Points non résolus = items formés avec déclencheur (zéro dette nue ; propriétaire = orchestrateur sauf mention)

1. **Retry live 429/5xx non exercé cette session** (aucun 429/5xx sur les 2 runs ; fournisseurs sains). Couvert par l'oracle déterministe `ukemi_record_retries_transient_http`. **Déclencheur** : un run sous charge fournisseur plus lourde (G1 §5b avait un 429 mevblocker) ⇒ vérifier la trace `rpc_errors` du retry.
2. **drpc « free plan » 400 sur `eth_getLogs`** : `getLogsVia` splitte (signal de plage) puis benche (fail-safe, quorum {mevblocker, tenderly}). Raffinement débit mineur (non-correction) : reconnaître un 400 « free plan »/auth pour **bencher sans splitter** (économie d'appels). **Déclencheur** : dégradation simultanée de {mevblocker, tenderly}, ou changement de plan drpc.
3. **Book PLEIN deploy→B** (énumération O(tous détenteurs depuis `reserveInitBlock`, ~dizaines de milliers de lectures quorum) = artefact D9 non committé, **non fait cette session** sous contrainte de débit des fournisseurs keyless (les runs sont bornés 2 000 blocs). **Déclencheur** : cadence quotidienne U-6 / run dédié. (Porté depuis G1 U-1a.)
4. **ADR-U1 D3 (critère `isRpcRevert`)** : **confirmé live** (§5, les 4 fournisseurs `code 3` « execution reverted »), aucun élargissement dû. Si un futur fournisseur renvoie une forme nouvelle (ex. autre `code`, `data` custom non-`"0x"`), élargir **code + test + amendement ADR** — **l'ADR est hors périmètre worker** ⇒ item pour l'orchestrateur. **Déclencheur** : une forme inédite dans le journal `rpc_errors` d'un run futur.
5. **Les deux `book_digest` live** (`2c225b52…`, `8ea0d532…`) sont des sous-ensembles à fenêtre bornée (plancher `from_block`), reproductibles avec les `params` de l'artefact ; **non** le book plein (item 3). Dit tel quel.
6. **Propriété de test (pas un défaut de code)** : le stub de `ukemi_default_call_classifies_rpc_errors` (et la sonde) sert `FX.enumeration_logs` pour **chaque** chunk (~700) ; `transferRecipients` + `Set` dédupliquent ⇒ le PIN tient. Un doublon **réel** entre chunks adjacents chevauchés serait masqué (le `Set` protège, mais `holders_digest` serait correct « par accident »). **Déclencheur** : le book plein deploy→B (item 3), où les chunks sont réels et disjoints — y ajouter un oracle de non-chevauchement/dédup inter-chunks.

**Artefacts rejouables (hors dépôt, `F:\tmp\u1a-hard\`, non committés — pour la re-exécution indépendante du validateur, CA-6)** : sondes `gho-probe.mjs` (V-4, §5), `ukemisha.mjs` (§1), `guard2.mjs` (bug du garde `main()`, §2) ; runs `weth-live.json` / `susde-live.json` (§6) ; copie mutants `mut/` (§9, restaurée). La sonde GHO se rejoue telle quelle (`node F:/tmp/u1a-hard/gho-probe.mjs`) contre les 4 fournisseurs keyless.

<!-- Journal de provenance G1 (corpus doc 02). Toute mesure reproductible dans le worktree/sonde citée. Vérif adversariale R-21 chez l'orchestrateur ; aucun commit (R-20). -->
