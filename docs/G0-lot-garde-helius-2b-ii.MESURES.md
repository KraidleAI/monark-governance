# MESURES — GARDE-HELIUS-2b-ii (G0 court, DOCS SEULEMENT)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni).
Worker DOCS, 2026-09-21. Lecture seule sur `F:\Monark` et `F:\Monark-wt-garde2b` ; écriture SEULEMENT sous
`F:\tmp\garde2b-ii\`. Aucun réseau, aucun `git` d'écriture, rien sur `C:`. Chaque chiffre du DRAFT renvoie à un
bloc M-n ci-dessous (commande + sortie brute). Les fichiers de code lus sont byte-identiques entre `F:\Monark` et
le worktree pour `record.ts`/`rpc2.ts`/`rpc.ts` (checkpoint-2 2b-i §3 : `record.ts e82f6067…`, `rpc2.ts 3635f9da…`,
`rpc.ts 0e232519…` inchangés) ; les sources du paquet (`transport.ts`/`classify.ts`/`errors.ts`/`index.ts`) lues
dans le worktree `F:\Monark-wt-garde2b` = version 2b-i (`798b4e9`).

---

## M-1 — Transitivité du GEL U-4b : qui importe `rpc2.ts` / `record.ts` ; imports des fichiers gelés

`cd /f/Monark ; grep -rn "rpc2" apps scripts packages --include=*.ts --include=*.mjs | grep import…`
(sortie complète dans le transcript ; extraits load-bearing) :

Importeurs de `rpc2.ts` (`apps/sentinel/src/ukemi/rpc2.ts`) — AUCUN n'est un fichier gelé :
```
apps/bell/src/ethereum.ts:16          import { makeUkemiPool, GET_LOGS_PROVIDERS, RpcError, type LogEntry } from "../../sentinel/src/ukemi/rpc2.ts";
apps/sentinel/src/ukemi/book.ts:11    import { ConcordantRevertError, type UkemiReader } from "./rpc2.ts";
apps/sentinel/src/ukemi/record.ts:17  import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, RpcError, BudgetExceededError, operatorOf, type UkemiReader } from "./rpc2.ts";
apps/sentinel/src/ukemi/resume.ts:21  import type { UkemiReader, LogEntry } from "./rpc2.ts";
scripts/census/u4-oracle-path.mjs:21  import { makeUkemiPool, ETH_CALL_PROVIDERS, GET_LOGS_PROVIDERS, BudgetExceededError } from "../../apps/sentinel/src/ukemi/rpc2.ts";
scripts/census/u4-probe.mjs:29        import { … } from "../../apps/sentinel/src/ukemi/rpc2.ts";
scripts/census/u4-redraw.mjs:23       import { … } from "../../apps/sentinel/src/ukemi/rpc2.ts";
+ tests (pool-rpc-1a.test.ts, ukemi-record.test.ts, ukemi-u4a.test.ts, ukemi.test.ts, pool-rpc-1a-bell.test.ts, adapter-book.test.ts)
```
Importeurs de `record.ts` — AUCUN n'est un fichier gelé :
```
apps/sentinel/test/ukemi-record.test.ts, ukemi-u4-governance.test.ts, ukemi-u4a.test.ts, ukemi.test.ts   (tests)
scripts/census/u4-oracle-path.mjs:20, u4-probe.mjs:28, u4-redraw.mjs:24  (scripts U-4a, NON gelés)
```

Imports directs des 3 fichiers de score GELÉS (ADR-U4b D4) :
```
scripts/census/u4b/u4b-scores.mjs  → abi.ts, wadray.ts, node:{crypto,fs,path,url}
scripts/census/u4b/u4b-reduce.mjs  → abi.ts, ./u4b-scores.mjs, node:{fs,path,url}
scripts/record-u4b-calib.mjs       → @monark/contracts, @monark/hikae, node:{fs,path,url}
```
Imports des transitifs C-V-2 (aussi gelés) :
```
apps/sentinel/src/ukemi/wadray.ts  → (aucun `from` — FEUILLE)
apps/sentinel/src/ukemi/abi.ts     → "../rpc.ts" (seul)
packages/hikae/src/l1-split.ts     → (aucun `from` — FEUILLE)
```
Imports de `rpc.ts` (gelé via C-3) :
```
apps/sentinel/src/rpc.ts           → "node:crypto" (seul — FEUILLE, ne remonte PAS vers rpc2/record)
```
`@monark/hikae` (`packages/hikae/src/index.ts`) : n'exporte `l1-split.ts` (feuille) ; mentionne `apps/sentinel` en
COMMENTAIRE seulement (`index.ts:96`, `tracker.ts:6`) — pas d'import. `@monark/contracts`
(`packages/contracts/src/index.ts`, résolu `F:\Monark\packages\contracts\src\index.ts`) : `grep apps/sentinel|ukemi/rpc2|ukemi/record`
= 0 ⇒ n'importe pas `apps`.

**Conclusion M-1** : la fermeture transitive du gel = {`u4b-scores.mjs`, `u4b-reduce.mjs`, `record-u4b-calib.mjs`,
`abi.ts`→`rpc.ts`(feuille), `wadray.ts`(feuille), `l1-split.ts`(feuille), `@monark/contracts`, `@monark/hikae`}.
**AUCUN de ces fichiers n'importe `record.ts` ni `rpc2.ts`** (qui sont EN AVAL : `rpc2.ts` importe DEPUIS `rpc.ts` ;
`record.ts` importe DEPUIS `rpc2.ts`). Modifier `record.ts`/`rpc2.ts` ne peut donc changer NI le sha d'un fichier gelé,
NI la sortie d'un script gelé. ⇒ **PAS de STOP doctrinal** (concorde avec le G1 2b-i §0 « STOP-check »,
`docs/G1-lot-garde-helius-2b-i.md`).

---

## M-2 — Tailles de fichiers (R-25) et ripple des symboles supprimés

`cd /f/Monark ; wc -l …` :
```
467 apps/sentinel/src/ukemi/record.ts
269 apps/sentinel/src/ukemi/rpc2.ts
327 apps/sentinel/test/ukemi-record.test.ts
230 apps/sentinel/test/ukemi-u4a.test.ts
355 apps/sentinel/test/ukemi.test.ts
 19 apps/sentinel/test/ukemi-u4-governance.test.ts   (importe seulement lfSha256 — non supprimé)
```
Occurrences des symboles SUPPRIMÉS/CHANGÉS par la migration (`grep -c "\bSYM\b"`) :
```
ukemi-record.test.ts : makeDefaultCall=11  backoffDelay=6
ukemi-u4a.test.ts    : makeDefaultCall=2   makeBudgetedCall=6  operatorLabel=3  scrubUrls=5  ARCHIVE_ENV_LABEL=3  applyExcludeOperators=4  enumerateAndCountAtRisk=2
ukemi.test.ts        : defaultCall=5
```
`enumerateAndCountAtRisk`, `lfSha256`, `parseUkemiArgs`, `isMainModule`, `runRecorder` sont CONSERVÉS (non supprimés) —
seuls `makeDefaultCall`/`makeBudgetedCall`/`defaultCall`/`backoffDelay`/`DefaultCallOpts` (+ `scrubUrls`/`operatorLabel`/
`ARCHIVE_ENV_LABEL`/`applyExcludeOperators` selon le câblage retenu) le sont. (G1 2b-i §0 mesure « record.ts réécrit
≈ 260 net » et migration « ~800 basse / ~945 centrale ».)

Nombre de `test(` actuels dans les 3 fichiers ripple (à réécrire/retirer) :
```
ukemi-record.test.ts : 16 test()   ukemi-u4a.test.ts : 11 test()   ukemi.test.ts : 20 test()
```

---

## M-3 — `new RpcError(` / `new BudgetExceededError(` : ripple de SIGNATURE au typecheck

Signature LOCALE `rpc2.ts:41` : `RpcError(message, code, data?)` (3 args). Signature CANONIQUE `errors.ts:48-52` :
`RpcError(op, message, code, detail?, unit?, data?)` (6 args). Si `rpc2.ts` ré-exporte la classe canonique (C-1(a),
mutant « classe locale restaurée » rouge), tout `new RpcError(msg, code[, data])` **casse au typecheck**.
`cd /f/Monark ; grep -rnE 'new RpcError\(|new BudgetExceededError\(' apps scripts packages` (extraits load-bearing) :
```
apps/bell/src/ethereum.ts:67          new RpcError(json.error.message ?? "rpc error", json.error.code ?? 0, <data>)   ← CROSS-LOT (apps/bell = 1b), importe RpcError de rpc2.ts
apps/sentinel/src/ukemi/record.ts:126 new RpcError(emsg, json.error.code ?? 0, data)                                  ← DISPARAÎT (makeDefaultCall supprimé)
apps/sentinel/test/pool-rpc-1a.test.ts:121   new RpcError("query block range exceeds…", -32602)                       ← test, casse
apps/sentinel/test/ukemi.test.ts:68,83,89,95,101,102,103,104,118,133,135,140,148,149,150,151,152  (~18 sites new RpcError) ← test, cassent
```
`new BudgetExceededError(` : `BudgetExceededError extends Error` inchangé (canonique = idem `errors.ts:8`) ⇒ les
appels `new BudgetExceededError(message)` ne cassent PAS (apps/bell/*, record.ts:147 disparaît, tests OK). **Seul
`RpcError` ripple par signature.** Point saillant : `apps/bell/src/ethereum.ts:67` (lot 1b) casse — cross-lot.

---

## M-4 — GREP CI : baseline AUJOURD'HUI sur `apps/sentinel/src/ukemi/**` + `rpc.ts`

`cd /f/Monark ; grep -rnE '\bfetch\s*\(|node:https?|\bundici\b|\bchild_process\b|\benv\.(CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY)\b' apps/sentinel/src/ukemi apps/sentinel/src/rpc.ts` :
```
apps/sentinel/src/ukemi/record.ts:92   res = await fetch(url, { method: "POST", … signal: ctl.signal });     [net]
apps/sentinel/src/ukemi/record.ts:328  const archiveEnvUrl = deps.env.CHAINSTACK_ETH_URL;                    [key]
apps/sentinel/src/rpc.ts:54            const u = env.CHAINSTACK_ETH_URL?.trim();                             [key]
apps/sentinel/src/rpc.ts:125           const res = await fetch(url, { … signal: ctl.signal });               [net]
```
`grep -rnE 'undici|child_process' apps/sentinel/src/ukemi` = **(aucun)** ⇒ pas de faux positif de commentaire sous
`ukemi/**` (contraste avec le finding 1a `apps/bell/src/universe-cli.ts:208`).

Lecture : sous `ukemi/**` SEUL, les 2 hits (record.ts:92 `fetch`, :328 `env`) sont EXACTEMENT ce que la migration
supprime (le `fetch` et la lecture de clé passent dans `transport.ts` du garde) ⇒ `ukemi/**` devient **0 hit**.
Mais `apps/sentinel/src/rpc.ts` (54/125) est HORS `ukemi/**` : si la portée = `ukemi/**` SEUL (addendum L-2-4,
mission), `rpc.ts` n'est jamais scanné ⇒ son entrée d'allowlist est **VACANTE** et le test de non-vacuité
(G1 2b-i §8 « scan rpc.ts seul, allowlist vide ⇒ ≥ 1 hit ») est **impossible**. L'ADR A-6 dit `apps/sentinel/src/**`.
Divergence de portée à trancher (D-grep).

Motifs du test racine (`test/rpc-guard-fetch-only-inside-client.test.ts:36-38`, worktree/repo identiques) :
```
ALLOWLIST = new Set(["packages/rpc-guard/src/transport.ts"])          (une entrée aujourd'hui)
NET = [/\bfetch\s*\(/, /node:https?/, /\bundici\b/, /\bchild_process\b/]
KEY = /\benv\.(CHAINSTACK_SOLANA_URL|BELL_SOLANA_RPC|CHAINSTACK_ETH_URL|HELIUS_API_KEY|POLYGON_API_KEY|DATABENTO_API_KEY)\b/
scopeFiles("apps") = tsFiles(REPO/"apps/bell/src")   ← PORTÉE ACTUELLE = apps/bell/src (PAS apps/sentinel)
```
Note : `https://` n'est PAS un motif interdit ; les constantes `https://…` de `rpc2.ts:268-269` (hôtes keyless publics)
ne sont pas des hits.

---

## M-5 — Quel JOB de `ci.yml` porte le grep ; pinning d'étape (miroir `ci_runs_export_check`)

`package.json:16` : le script `test` collecte le glob incluant `"test/*.test.ts"` :
```
"test": "node --test --test-timeout=120000 --test-force-exit \"test/*.test.ts\" \"packages/*/test/*.test.ts\" \"apps/harness/test/*.test.ts\" \"apps/sentinel/test/*.test.ts\" \"apps/bell/test/*.test.ts\""
```
`ls test/*.test.ts | wc -l` = **30** fichiers (dont `rpc-guard-fetch-only-inside-client.test.ts`).
`ci.yml` job **g3-verification** (`ci.yml:101-102`) : `run: npm run gate:vocab && npm run typecheck && npm test`.
⇒ le grep RIDE `npm test` dans **g3-verification** ; il n'est PAS une étape `run:` dédiée de `ci.yml`.

Tests qui LISENT `ci.yml` (oracle non-LLM des ÉTAPES) : `test/ci-gates.test.ts` (`:43 readFileSync(.github/workflows/ci.yml)`),
`test/cra-b.test.ts:29`, `test/export-public.test.ts:245,362`, `test/site-build-fleet.test.ts:150`. Ces tests épinglent
des ÉTAPES `run:` (export:check, SBOM `ci_publishes_sbom`, build site). **Le grep n'est PAS une étape `run:`** ⇒ il n'a
PAS besoin d'un pin `ci-gates` type `ci_runs_export_check` ; sa présence est garantie par (a) être un `test/*.test.ts`
(collecté par le glob `package.json:16`) et (b) `npm test` dans g3-verification. (Design à confirmer : ne pas ajouter
d'étape `ci.yml` ni de pin `ci-gates` pour le grep — D-grep.)

---

## M-6 — Régime des scripts `u4-*.mjs` (ripple hors 3 tests + hors CI)

`head` des 3 scripts + grep gel : `u4-oracle-path.mjs`, `u4-probe.mjs`, `u4-redraw.mjs` sont des scripts **U-4a**
(census, ADR-M020 D1(b)), provenance-portants : `u4-oracle-path.mjs` a produit la fixture D_e sha-pinnée
(`ADR-U4:65`) ; `u4-redraw.mjs` est le CONTRÔLE LIVE pré-enregistré (prereg §4) **DÉJÀ EXÉCUTÉ** par la G2-delta
U-4a (`ADR-U4:145` : 13 appels, `all_match`, brut `c01f75ce…`, 2026-09-21). Ils importent
`makeDefaultCall`/`makeBudgetedCall`/`operatorLabel`/`applyExcludeOperators`/`lfSha256` de `record.ts` (M-1).
Ils NE sont **PAS** gelés dans le prereg U-4b (ADR-U4b D4 ne gèle que `u4b-*`/`record-u4b-calib`), NE sont **PAS**
collectés par `npm test` (ils sont `scripts/census/*.mjs`, pas `test/*.test.ts`), et ne sont pas typecheckés par le
`tsc --noEmit` racine. ⇒ la suppression de `makeDefaultCall`/`makeBudgetedCall` de `record.ts` casse leurs imports
**SILENCIEUSEMENT** (aucun rouge d'oracle). Zéro-dette : à traiter par item formé (D-u4scripts).

---

## M-7 — Corps mesurés du recorder (fixtures du test de conformité, C-R-3)

`apps/sentinel/test/pool-rpc-1a.test.ts:101-103` (première main) :
```
POCKET_5000  = "query block range exceeds server limit, narrow your filter: 5000"
POCKET_10000 = "query exceeds max block range 10000"
DRPC_FREE    = "ranges over 10000 blocks are not supported on free plan"
```
`:104-108` : `isResultLimit(POCKET_5000|POCKET_10000|DRPC_FREE)=true` ; `isPlanLimited(DRPC_FREE)=true` (préséance :
bench avant split), `isPlanLimited(POCKET_*)=false`. Un corps « Reverted … » sans « execution » rougit V12
(checkpoint-2 §6 C-R-3).

---

## M-8 — Point de conception `data === "0x"` (C-R-2(c)) — sites exacts

- Garde `transport.ts:124` `validateRevertData` : `if (typeof raw !== "string" || !/^0x[0-9a-fA-F]*$/.test(raw) || raw.length > MAX_REVERT_DATA_HEX) return undefined;` ⇒ `"0x"` (hex VIDE, longueur 2) est **valide et CONSERVÉ** ; `transport.ts:141` `data = name === "RpcError" ? validateRevertData(op, rawData) : undefined` ⇒ `RpcError.data = "0x"`.
- Garde `classify.ts:48-53` `isRpcRevert` : `if (e.unit !== "keyless" && e.data === undefined) return false;` ⇒ pour `data === "0x"` (≠ `undefined`), la garde de banc payant **ne s'applique PAS** ⇒ `isRpcRevert` rend **VRAI** pour un revert chainstack à `data === "0x"`.
- Recorder `rpc2.ts:60` `revertKey` : `return e.data !== undefined && e.data !== "0x" ? e.data.toLowerCase() : e.message.trim().toLowerCase().replace(/\s+/g, " ");` ⇒ `"0x"` **retombe sur le MESSAGE**.
- Sous D6, message payant (chainstack) = préambule à label (`transport.ts:150` `rpc-guard: RpcError for operator 'chainstack' (code 3): execution reverted, revert`) ; message keyless = corps expurgé SANS préambule (`transport.ts:145-146`). ⇒ pour un revert sans raison (`data === "0x"`), `revertKey(chainstack) ≠ revertKey(keyless)` : **perte de concordance chainstack↔keyless** (jamais un FAUX accord — labels différents — mais jamais un accord non plus). La règle C-1(c) « sans `data` ⇒ banc » ne l'attrape pas (`"0x"` est « présent »). À trancher (D-"0x"). Portée : chainstack est ajouté EN DERNIER au pool (`record.ts:329` `[...ETH_CALL_PROVIDERS, archiveEnvUrl]`) ⇒ le cas croisé {keyless, chainstack} n'est atteint que si un keyless de tête est benché ⇒ effet NARROW.
  - **Le guard `!== "0x"` est DÉLIBÉRÉ et load-bearing** : test `ukemi_revert_key_uses_data` (`ukemi.test.ts:131-142`),
    sous-cas `mixed` (`:140-141`) + commentaire `:137-139` verbatim : « The REAL GHO case (measured live, V-4): one
    provider returns data "0x", another returns NO data. The `data !== "0x"` guard routes BOTH to the normalized message
    ⇒ concordant. Without that guard, "0x" vs the message would disagree ⇒ the whole book would abstain a real on-chain
    fact. This sub-case is load-bearing. » Le `mixed` pilote des eps KEYLESS (`https://one.example`/`two.example`) ⇒
    `assert.rejects(..., ConcordantRevertError)`. ⇒ **retirer le guard (Option 2b) ROUGIT ce test** ; l'Option 1
    (banc payant seul) ne le touche PAS (eps keyless). Assertions voisines : `:133-134` même data (`0xdeadbeef`) +
    messages différents ⇒ `ConcordantRevertError` ; `:135-136` data différentes (`0xaaaa`/`0xbbbb`) ⇒ `QuorumDisagreementError`.

---

## M-9 — Label publié de chainstack (provenance / `--concordance-out`)

`record.ts:27` `ARCHIVE_ENV_LABEL = "archive-env"` ; `record.ts:39-41` `operatorLabel(url, archiveEnvUrl)` relabelle la
jambe Chainstack en `archive-env` dans `endpoints`, `calls_by_operator`, et `record.ts:289-291` `tallyConcordance`
(paires `--concordance-out`). Sous les labels du garde, `operatorOf`/le garde nomment `chainstack` ⇒ les paires
`--concordance-out` passent de `archive-env|drpc.org` à `chainstack|drpc.org`. Le réducteur POOL-RPC-1a peut attendre
l'ancien label. Le G1 2b-i §8 ne le dit pas. À trancher (D-label).

---

## M-10 — Invariants byte-identiques (sha à vérifier avant/après ; ADR-U4b D4 + G0-COMPLEMENT §3)

sha256 (préfixe 16) gelés, à re-vérifier AVANT==APRÈS au G1 de 2b-ii :
```
scripts/census/u4b/u4b-scores.mjs   9ad20666af878c63…
scripts/census/u4b/u4b-reduce.mjs   a5e66cd387279f46…
scripts/record-u4b-calib.mjs        5733daeb7c8ee40a…
apps/sentinel/src/rpc.ts            0e232519a18aaa43…   (C-3, gelé)
apps/sentinel/src/ukemi/wadray.ts   7bee76fc96a9bc23…
apps/sentinel/src/ukemi/abi.ts      3376eb084f522cb2…
packages/hikae/src/l1-split.ts      9206df9189d3eba6…
```
Digests : `book_digest 034fbff9…` et `PINNED_DIGEST 267cd991…` inchangés (leurs tests restent verts) ; fixtures
`u4/` et `u4b/` byte-identiques. `record.ts`/`rpc2.ts` NE sont PAS gelés ⇒ leur sha CHANGE (attendu) ; l'invariant
fort est **`book_digest 034fbff9` inchangé** (la migration change la plomberie transport/budget, PAS les octets du
livre — `ukemi.test.ts` l'épingle). `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` restent EXPORTÉS par `rpc2.ts`
(consommés par `apps/bell/src/ethereum.ts:16`, `apps/bell/test/pool-rpc-1a-bell.test.ts:9`, et le verrou d'ordre
`packages/rpc-guard/test/multi-operator.test.ts:298-301`), ordre inchangé.

---

## M-11 — Exigences d'entrée (revues 2b-i) et item CHANTIERS

- G2 2b-i (`G2-lot-garde-helius-2b-i.md:149-192`) : **C-G-1** (source unique non épinglée, drift regex↔`ERROR_HINT_TOKENS`,
  MY1 survit) et **C-G-3** (garde de code `{3,-32000}` de `isRpcRevert` non épinglée, MY3 survit) sont **NON BLOQUANTES
  pour la fusion de 2b-i** mais **BLOQUANTES pour le G1 de 2b-ii** (elles gardent le vocabulaire et `isRpcRevert` que
  2b-ii branche au livre). C-G-2/C-G-4/C-G-5 = déclencheur 2b-ii (non bloquantes).
- Checkpoint-2 2b-i (`CHECKPOINT2-lot-garde-helius-2b-i.md:57` C-R-3) : conformité incomplète — ajouter les 3 corps
  mesurés (M-7) + « Reverted » sans « execution » (V12) + `isRpcRevert(code≠3/-32000, msg revert)===false` (V9=C-G-3) ;
  déclencheur « pli 2b-i OU G1 de 2b-ii au plus tard ».
- G7-2a (`G7-lot-garde-helius-2a.md:15,27`) : **C-GD-2** (formes transformées de la clé dans le corps) = « exigence
  d'entrée du G0 2b » — **FERMÉE structurellement par D6 de 2b-i** (`transport.ts:135` payant ⇒ `closedHint`, aucun
  octet du corps ; mutant M2 ROUGE) ; à écrire « fermé, pas ouvert ».
- `docs/CHANTIERS.md:595` : item **GARDE-HELIUS-2b-ii** formé (propriétaire orchestrateur, déclencheur = fusion 2b-i) ;
  décision investisseur **118** (option B : allowlist à 2 entrées, déclencheur NARABI-OPS-1d) ; décision **119**
  (lot 2b priorité 1). « Question C-4 ouverte » du worker = **CADUQUE** (tranchée par 118).
- Note pli en vol (git log `430e99d`/`5a4c645`) : un worker de pli 2b-i est EN VOL ; C-G-1..5 sont formées comme items
  à déclencheur 2b-ii. **Conditionnel** : si le pli 2b-i FUSIONNE C-G-1/C-G-3 (et C-R-3), elles sont satisfaites à
  l'entrée de 2b-ii ; SINON le G1 de 2b-ii les porte. Le G0 les inscrit conditionnellement (M-11 → DRAFT §11).

---

## M-12 — Environnement / conformité de la passe DOCS

Écriture SEULEMENT sous `F:\tmp\garde2b-ii\` (`mkdir -p /f/tmp/garde2b-ii` OK). Aucune écriture dans `F:\Monark` ni
`F:\Monark-wt-garde2b` (lecture seule ; un worker de pli travaille dans le worktree). Aucun réseau, aucun `git`
d'écriture, aucun commit (R-20), rien sur `C:`. R-1 : `claude-opus-4-8[1m]`. R-21 : rendu écrit pour vérification
adversariale (chaque chiffre porte sa commande). Aucune décision prise par le worker : « proposé » partout.

---

## M-13 — Non-vacuité de portée du grep (8 fichiers `ukemi/*.ts`) et `ukemi_sha` non épinglé

`cd /f/Monark ; ls apps/sentinel/src/ukemi/*.ts | wc -l` = **8** :
```
abi.ts  book.ts  clusters.ts  concordance.ts  record.ts  resume.ts  rpc2.ts  wadray.ts
```
⇒ le test grep ukemi doit porter un garde de non-vacuité de PORTÉE (miroir de `assert.ok(pkgFiles.length > 5)`,
`test/rpc-guard-fetch-only-inside-client.test.ts:70`) : `≥ 8` fichiers scannés, sinon un chemin faux passe vert à vide.

`grep -rn "ukemi_sha\|ukemiSha" apps/sentinel/test packages/*/test test` : **aucun test n'asserte l'ÉGALITÉ** de
`ukemi_sha` ; seul `apps/sentinel/test/fixtures/ukemi/PROVENANCE-weth-book.md:20` l'ENREGISTRE (`ukemi_sha 8aae7bbe…`).
⇒ `ukemiSha(here)` (`record.ts:395/424`, hache `ukemi/**.ts`) **change** avec la migration de `record.ts`/`rpc2.ts`,
sans rougir l'oracle : **dérive ATTENDUE**, pas un invariant (DRAFT §8).

`grep -rln "034fbff9\|267cd991"` : `book_digest 034fbff9…` épinglé par `apps/sentinel/test/ukemi.test.ts:29` (le fichier
ripple qui porte AUSSI les ~18 `new RpcError`, M-3) ; `PINNED_DIGEST 267cd991…` par `apps/sentinel/test/ukemi-u4-scores.test.ts:20`.
⇒ invariant FORT `book_digest 034fbff9` : la migration doit garder les octets du livre identiques (DRAFT §8/§12).

---

# APPEND — Pli du checkpoint-1 (2026-09-21) — mesures neuves M-14..M-16

Base HEAD `4d102ca` (`git rev-parse HEAD`). Lecture seule ; mêmes garde-fous (rien sur `C:`, aucun `git` d'écriture,
écriture SEULEMENT sous `F:\tmp\garde2b-ii\`). Chaque chiffre neuf du G0 plié renvoie à M-14..M-16 ci-dessous.

## M-14 — Ancêtres de base (C-8 / R-F) : 2b-i + pli DANS la base

`cd /f/Monark ; git rev-parse HEAD` = `4d102caf88c0a9d4372dc7474511c9f2e867e166` (= HEAD annoncé par le coordinateur).
`git merge-base --is-ancestor <c> HEAD` (exit 0 = ancêtre) :
```
f4ecf14 : ANCÊTRE de HEAD (oui)   # pli 2b-i (C-G-1/C-G-3/C-R-3 foldées) ⇒ R-F SATISFAIT
8ba2cbc : ANCÊTRE de HEAD (oui)   # fusion 2b-i ⇒ base G1 2b-ii ≥ 8ba2cbc TENUE (C-8-b)
280f9c8 : ANCÊTRE de HEAD (oui)
19eddfc : ANCÊTRE de HEAD (oui)   # G7 2b-i
```
⇒ le paquet 2b-i (classe canonique, vocabulaire unique, `isRpcRevert` gardé, alternatives=jetons) est DANS la base ⇒
les exigences d'entrée C-G-1/C-G-3/C-R-3 sont **satisfaites à l'entrée** (plus « conditionnelles »). Reste dû : LANG-GATE-CI
fusionné avant le worktree 2b-ii (C-8-b, ordre orchestrateur).

## M-15 — C-9 : les scripts `u4-*.mjs` lisent une clé payante ET sont sur le chemin de course U-4b-1b

`cd /f/Monark ; grep -nE "CHAINSTACK_ETH_URL|process\.env" scripts/census/u4-{oracle-path,probe,redraw}.mjs` :
```
scripts/census/u4-oracle-path.mjs:55  const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
scripts/census/u4-probe.mjs:67        const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
scripts/census/u4-redraw.mjs:83       const archiveEnvUrl = process.env.CHAINSTACK_ETH_URL;
```
⇒ les 3 scripts lisent la clé Chainstack DIRECTEMENT (jambe payante HORS garde, hors ledger) — en plus d'importer
`makeDefaultCall`/`makeBudgetedCall` de `record.ts` (supprimés par L-1, M-6).
Sur le CHEMIN de la course U-4b-1b (`grep u4-oracle-path|u4-redraw docs/G0-lot-u4b.md docs/PLAN-u4b-prereg.DRAFT.md`) :
```
docs/G0-lot-u4b.md:27   D_e chemin oracle réalisé (SERVIE) = u4-oracle-path.mjs (getLogs AnswerUpdated) -> u4b-reduce
docs/G0-lot-u4b.md:258  contrôle live G2-delta = rejoue u4-redraw.mjs (re-tirage >= 3 comptes + >= 3 AnswerUpdated)
docs/PLAN-u4b-prereg.DRAFT.md:215  « Après GARDE-HELIUS-2b (post-migration) ... CHAINSTACK_ETH_URL n'est lu que dans transport.ts »
```
⇒ **C-9 fondé** : `u4-oracle-path.mjs` PRODUIT le D_e servi de la course, `u4-redraw.mjs` est le contrôle live de la
G2-delta ; les deux dépensent du Chainstack HORS garde ⇒ la promesse « CHAINSTACK_ETH_URL lu que dans transport.ts »
(prereg §215) est FAUSSE pour le chemin de course tant qu'ils ne migrent pas. La « première réexécution » de R-E EST la
course ⇒ déclencheur corrigé = **AVANT la course** (sous-lot 2b-iii). `u4-probe.mjs` (sonde, non requise par la course) =
archivage/item formé. Second résiduel payant hors garde = classe HELIUS-1 (décision 118) ⇒ jamais accepté sans escalade.

## M-16 — C-1(c) : le motif KEY `\benv\.(...)\b` est contournable (crochets / `in` / destructuration)

`node -e` avec le motif KEY exact du test (`test/rpc-guard-fetch-only-inside-client.test.ts:38`) sur 4 formes :
```
HIT   deps.env.CHAINSTACK_ETH_URL
MISS  deps.env["CHAINSTACK_ETH_URL"]
MISS  "CHAINSTACK_ETH_URL" in deps.env
MISS  const {CHAINSTACK_ETH_URL}=deps.env
```
⇒ le motif ne voit que la forme `env.KEY` (point). Or le `record.ts` migré a trois raisons de tester « chainstack
demandé ? » (pool, args, N `unlock`) ; C-1 les SUPPRIME (record.ts ne probe plus l'env, `--operators` explicite), mais
le grep doit AUSSI couvrir `env[\s*["']KEY["']\s*]`, `["']KEY["']\s+in\s+…env`, destructuration `\{[^}]*\bKEY\b[^}]*\}\s*=\s*[^;]*env`
avec un mutant « clé lue par crochets survit » ROUGE (défense en profondeur : le lot ne doit pas ajouter le contournement).

## M-17 — Consommateurs du label (D-label) et provenance (checkpoint-1 §3, re-noté)

`grep -n "archive-env" apps/sentinel/src/ukemi/*.ts` + lecture `concordance.ts`/`resume.ts` (checkpoint-1 §3, re-vérifié) :
`concordance.ts` lit SEULEMENT `{pair, concordant, discordant}` (label-agnostique) ; `resume.ts:86` `case "meta": break`
(providers du META **non vérifiés**). ⇒ **aucun consommateur ne casse** quel que soit le label (A `archive-env` / B
`chainstack`) ; `u4b-reduce.mjs:48` (gelé) ne lit que `provenance.book_digest`, pas un label ⇒ D-label ne touche aucune
sortie gelée (transitivité par les DONNÉES, checkpoint-1 §3). D-label reste un choix de NOMMAGE (pas de valeur), tranché
par l'orchestrateur à la réception du pli (option A/B ci-dessous dans le G0 §6 D-label).
