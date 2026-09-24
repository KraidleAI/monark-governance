# G0 (court) — GARDE-HELIUS-2b-ii — PLIÉ (migration du recorder Ukemi sous `@monark/rpc-guard` + grep CI)

> **G0 court PLIÉ** (brouillon worker + rulings orchestrateur R-A..R-G + pli du checkpoint-1 C-1..C-9). **R-20** :
> ne committe pas, ne déclenche aucun workflow. **Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe
> `claude-opus-4-8` conforme, effort max ; Opus 5 banni). 2026-09-21. Base : `lot/etude-suite` HEAD **`4d102ca`**
> (M-14) — **2b-i + son pli sont DANS la base** (`f4ecf14`, `8ba2cbc`, `19eddfc` ancêtres) ⇒ le paquet est acquis.
> Les rulings R-A..R-G et les corrections C-1..C-9 (validateur `claude-fable-5-1`, APPROUVE-AVEC-CORRECTIONS) sont
> PLIÉS dans le corps ci-dessous ; les sections RULINGS et le changelog « Pli du checkpoint-1 » sont en fin. Chiffres :
> chaque nombre renvoie à `MESURES.md` (M-n) ; aucun chiffre de seconde main. Aucun réseau, clés factices, `fetch` bouchonné.

## 0. Plan qui fait foi (déjà approuvé) — statut du pli
Plan amont, non rouvert : `docs/G0-ADDENDUM-lot-garde-helius-2.md` (D4, D5, L-2-3, L-2-4, tuyaux, invariants) + pli
C-1..C-7 ; `docs/G0-COMPLEMENT-lot-garde-helius-2b.md` (D6 + pli C-1..C-7) ; `docs/CHECKPOINT1-DELTA-lot-garde-helius-2b.md`.
Amont livré et **dans la base** (M-14) : `docs/G1-lot-garde-helius-2b-i.md` (§8 = blueprint 2b-ii, « G1 2b-i » ci-dessous) +
`docs/G2-lot-garde-helius-2b-i.md` + `docs/CHECKPOINT2-lot-garde-helius-2b-i.md` + **pli 2b-i `f4ecf14`** (C-G-1/C-G-3/C-R-3
foldées) + **G7 2b-i `19eddfc`**. ADR : `docs/adr/ADR-GARDE-HELIUS-client-budgete-unique.md` (A-3/A-3bis/A-4/A-6),
`docs/adr/ADR-U4b-calibration-episode-frais.md` (D4/D5). Checkpoint-1 de CE G0 : `docs/CHECKPOINT1-lot-garde-helius-2b-ii.md`
(C-1..C-9 ; C-1/C-2/C-9 BLOQUANTS avant tout code, C-3..C-8 non bloquants). **Ce G0 est la version PLIÉE prête à remplacer
`docs/G0-lot-garde-helius-2b-ii.md`.**

## 1. Objectif (une phrase)
Le **recorder Ukemi** (`apps/sentinel/src/ukemi/record.ts`) ne dépense plus AUCUN appel réseau hors de `@monark/rpc-guard`,
**ne lit AUCUNE variable d'environnement** (C-1), reçoit l'ensemble de ses opérateurs par CLI explicite, et `rpc2.ts`
ré-exporte la classe canonique + importe le vocabulaire unique du paquet ; le grep CI garde `apps/sentinel/src/ukemi/**`
∪ `apps/sentinel/src/rpc.ts` (R-B) — de sorte que le paquet devienne **branché** par un chemin servi (le recorder) couvert
par un test d'intégration non-LLM rejouant transport→classify→record. La course U-4b-1b et son contrôle live n'exécutant
AUCUN script hors garde (C-9 : sous-lot 2b-iii, annexe).

## 2. Découpe (couture pré-déclarée) — 2b-ii, second seam 2b-ii-a/b (C-3), et 2b-iii (C-9)
Le lot 2b complet dépassait R-25 (G1 2b-i §0 : paquet 352 + migration estimée 800–945 > 1150 central ; **la migration
2b-ii est RE-CHIFFRÉE ~1 050-1 400 au checkpoint-1 §3, cf. §10 — c'est cette borne, non 800–945, qui gouverne le seam C-3**).
**2b-i** (paquet) fusionné.
**2b-ii** = CE lot = migration + grep. **Second seam PRÉ-DÉCLARÉ (C-3, activé si R-25 mesuré > 1150)** : **2b-ii-a**
(`rpc2.ts` canonique + signatures + D-4 + identité via transport + R-A `classify.ts`+test — fusionnable SEUL, n'exige pas
la suppression de `makeBudgetedCall`) / **2b-ii-b** (`record.ts` + ses tests + grep + e2e). **2b-iii (C-9, annexe)** =
migration des scripts de course `u4-oracle-path.mjs`/`u4-redraw.mjs` sous le garde, AVANT la course U-4b-1b. Ordre
(orchestrateur, ruling checkpoint-1) : LANG-GATE-CI → worktree 2b-ii (base ≥ `8ba2cbc` + lang-gate) → G1 2b-ii →
**2b-iii** → prereg → course.

## 3. STOP transitif du GEL U-4b — **PAS de STOP** (M-1, confirmé sur DEUX fronts au checkpoint-1)
- **Imports (M-1, R-G accepté)** : fermeture transitive = {`u4b-scores.mjs`, `u4b-reduce.mjs`, `record-u4b-calib.mjs`,
  `abi.ts`→`rpc.ts`(feuille), `wadray.ts`(feuille), `l1-split.ts`(feuille), `@monark/contracts`, `@monark/hikae`}. **Aucun**
  n'importe `record.ts`/`rpc2.ts` (EN AVAL). Trace adversariale du validateur : les 3 « importeurs » absents de M-1
  (`apps/bell/src/quorum.ts`, `scripts/usde-full-pull.mjs`, `packages/rpc-guard/src/transport.ts`) sont des COMMENTAIRES.
- **Données (checkpoint-1 §3, front NON couvert par M-1)** : `u4b-reduce.mjs:48` ne lit que `provenance.book_digest`
  (invariant fort) ; **aucun script gelé ne lit un label/compteur** ⇒ ni la migration ni D-label ne changent une sortie
  gelée.
⇒ **Pas de STOP doctrinal**, pas de consultation advisor-defi/validateur ouverte. **Contrainte d'ORDRE (C-8-a)** : le prereg
U-4b-1b §(5) lit les args du recorder gardé ⇒ il se committe **APRÈS la fusion de 2b-ii** ; sa liste gelée reste les 7 sha
M-10 (sans `record.ts`/`rpc2.ts`).

## 4. Faits nouveaux [lu] (mesure + pli)
1. **Baseline grep (M-4)** : `ukemi/**` = 2 hits (`record.ts:92` fetch, `:328` env), tous deux supprimés par la migration
   ⇒ 0 hit ; `rpc.ts` (54/125) hors `ukemi/**` ; aucun `undici`/`child_process` en commentaire sous `ukemi/**`.
2. **Ripple signature `RpcError` (M-3)** : canonique `errors.ts:48` `(op, message, code, detail, unit, data)` ≠ locale
   `rpc2.ts:41` `(message, code, data)` ⇒ `apps/bell/src/ethereum.ts:67` (1b, R-D) + 17 sites `ukemi.test.ts` (mesuré,
   checkpoint) + 1 `pool-rpc-1a.test.ts:121` cassent au typecheck. `BudgetExceededError` ne ripple pas.
3. **Scripts `u4-*.mjs` (M-6/M-15)** : `u4-oracle-path.mjs`/`u4-probe.mjs`/`u4-redraw.mjs` importent
   `makeDefaultCall`/`makeBudgetedCall` de `record.ts` ET lisent `process.env.CHAINSTACK_ETH_URL` (`:55`/`:67`/`:83`) ⇒
   jambe payante hors garde. **Sur le chemin de la course** (`G0-lot-u4b.md:27` D_e SERVIE via `u4-oracle-path.mjs` ; `:258`
   contrôle live G2-delta via `u4-redraw.mjs`) ⇒ C-9 (2b-iii).
4. **Label chainstack (M-9/M-17)** : jambe relabellée `archive-env` aujourd'hui ; sous labels garde = `chainstack`. Aucun
   consommateur ne casse (réducteur label-agnostique ; META `resume` non vérifié) ⇒ D-label = choix de nommage (à trancher).
5. **`data === "0x"` (M-8)** : `revertKey:60` traite `"0x"` comme absent ⇒ **FAUX DÉSACCORD** actuel chainstack↔keyless
   (checkpoint C-4 : `onQuorum(false)` + `QuorumDisagreementError` pollue `--concordance-out`), pas seulement une « perte de
   concordance » — l'état HEAD est PIRE que dit ; R-A (option 1) le remplace par un banc propre.
6. **Motif KEY contournable (M-16)** : `\benv\.(...)\b` MISS sur `env["KEY"]`, `"KEY" in env`, destructuration ⇒ C-1(c).

## 5. Livrables (périmètre FERMÉ) — L-n
| # | Fichiers | Contenu (rulings pliés) |
|---|---|---|
| **L-1 migration `record.ts`** | `apps/sentinel/src/ukemi/record.ts` | Suppr. `makeDefaultCall`/`makeBudgetedCall`/`defaultCall`/`backoffDelay`/`DefaultCallOpts`. **`record.ts` ne lit AUCUNE variable d'env** (C-1) : `deps.env` passé tel quel à `openGuardedClient(deps.env, limits, ledgerDir, cycles, opts)` ; **ensemble des opérateurs = argument CLI explicite `--operators <label,…>` (ou `--with-chainstack`, choix G1), fail-closed sur label inconnu** ; `cycles = Object.fromEntries(labels.map(l => [l, args.cycle]))` (un seul `--cycle` pour tous les demandés, keyless compris — clôt D-keyless-cycle) ; **N `unlock` = `client.operators()`** (`client.ts:51`). Pool sur **labels** (`ETH_CALL_KEYLESS_LABELS`/`GET_LOGS_KEYLESS_LABELS` + `chainstack` **appended last**). Args **REQUIS SANS CONDITION** (C-1-b) : `--ledger-dir`, `--cycle`, `--floor`, `--max-ru`, `--method-caps`, `--max-calls` (un run keyless-only les passe aussi ; `assertLimits` n'exige un cap que pour un payant demandé, `client.ts:66-78`). `--concordance-out` conservé (optionnel, complément §3) ; `--slow-operator`/`--slow-interval-ms` SURVIVENT (ils nourrissent `makeUkemiPool`, pas le transport) ; `--exclude-operator` REMPLACÉ par `--operators` (ne pas lister `mevblocker` = l'exclure ; prereg §5a l.209 à réécrire). **Retry chez l'appelant SEUL** (`AbortError`/réseau, 429, ≥ 500 ; JAMAIS `RpcError`/`NonJsonBody`/autres 4xx/`BudgetExceededError`). Journal `rpc_errors` construit dans le catch depuis `TransportError`, **par `e.name`** (C-5 : `HttpError`→`http`, `RpcError`→`code`+`data`, autres→message seul ; `e.detail` indice fermé, `e.data` validée, JAMAIS le corps). `onTransportError`→`errByOp` (moniteur 5 %). `finally` relâche N verrous (keyless compris, y compris sur `BudgetExceededError`). **`applyExcludeOperators` SUPPRIMÉ (C-1 : `--exclude-operator`→`--operators`, plus d'appelant, indépendant de D-label)** ; `operatorLabel`/`ARCHIVE_ENV_LABEL` supprimés OU conservés **selon D-label** ; `scrubUrls` **à mesurer au G1** (sous le garde le transport expurge — probablement supprimable si `record.ts` n'a plus de chemin de message à expurger). |
| **L-2 ré-exports `rpc2.ts`** | `apps/sentinel/src/ukemi/rpc2.ts` | Ré-exporte `RpcError`/`BudgetExceededError` du paquet (identité UNIQUE) ; IMPORTE `isResultLimit`/`isPlanLimited`/`isRpcRevert` (0 regex locale, classes locales SUPPRIMÉES) ; conserve `ConcordantRevertError` (`book.ts:11`), `NoQuorumError`, `operatorOf`, `revertKey`, `makeUkemiPool`, `ETH_CALL_PROVIDERS`/`GET_LOGS_PROVIDERS` (ordre verrouillé `multi-operator.test.ts:298-301`, M-10) ; assertion `operatorOf("nodies.app")===operatorOf("pocket.network")==="pocket"` (C-6(iv)). |
| **L-3 grep CI** | `test/rpc-guard-fetch-only-inside-client.test.ts` | Portée = `apps/sentinel/src/ukemi/**` ∪ `apps/sentinel/src/rpc.ts` (**R-B**) ; allowlist `Map<path,trigger>` FERMÉE {`transport.ts`, `apps/sentinel/src/rpc.ts`→`NARABI-OPS-1d`} ; **non-vacuité PAR ENTRÉE** (C-2) ; motif KEY étendu crochets/`in`/destructuration (C-1-c) ; non-vacuité de portée `ukemi/*.ts ≥ 8` (M-13) ; skip résiduel = Bell (1b). Test in-suite (`npm test`, `g3-verification`) ; aucune étape `ci.yml`. |
| **L-4 tests imposés + mutants** | `apps/sentinel/test/**` + `packages/rpc-guard/test/**` | §9 (table des 16 tests + mutants). |
| **L-5 ripple + ADR** | 3 tests legacy, `ethereum.ts:67` (R-D), ADR amendé | Absorber la ripple (M-2/M-3) ; **amendement ADR daté portant R-B et R-D VERBATIM** (C-6) + tuyau 2b-ii + `"0x"` (R-A) + C-GD-2 fermé + runbook N `unlock`. |
| **L-6 sous-lot 2b-iii** | `scripts/census/u4-oracle-path.mjs`, `u4-redraw.mjs` | Annexe (C-9 α) : migration sous le garde, déclencheur AVANT la course. G1 propre. |

## 6. Décisions — RULÉES (R-A..R-G / C-n) ; D-label seule reste à trancher

### D-1 (`record.ts`) — RULÉ par C-1
`record.ts` ne probe PAS l'env ; `--operators` explicite ; un seul `--cycle` (clôt D-keyless-cycle) ; N `unlock` =
`client.operators()` ; 6 args REQUIS sans condition. Détail au L-1. Shim `call: RpcCall` = tally NON-gatant
(calls/byOperator/byMethod pour la provenance ; `spent().byOperator` = dépense en unité, pas un compte d'appels).

### D-2 (`rpc2.ts`) — canonique + vocabulaire unique
Comme L-2. Ripple de signature ⇒ D-ethereum (R-D) + réécriture des 17 `new RpcError` de `ukemi.test.ts` (M-3).

### D-3 (grep CI) — RULÉ par R-B + C-1(c) + C-2
- **Portée = `ukemi/**` ∪ `rpc.ts` (R-B)** : `rpc.ts` scanné ET allowlisté (déclencheur -1d) ⇒ allowlist porteuse ;
  `run.ts`/`timeline.ts` entrent en portée à NARABI-OPS-1d. Réconcilie A-6 (« `apps/sentinel/src/**` ») via l'amendement ADR (C-6).
- **Motif KEY étendu (C-1-c, M-16)** : couvre `env\.(6 clés)\b`, `env\[\s*["'](6 clés)["']\s*\]`, `["'](6 clés)["']\s+in\s+…env`,
  destructuration `\{[^}]*\b(6 clés)\b[^}]*\}\s*=\s*[^;]*env` ; re-baseline `packages/*/src` (0 hit hors `transport.ts`) et la
  liste Bell du header (re-mesurer le compte). Le scanner lit CHAQUE ligne SANS ignorer les commentaires ⇒ le `record.ts`
  migré ne doit commenter ni `fetch(` ni `env.CHAINSTACK_ETH_URL`.
- **Non-vacuité PAR ENTRÉE (C-2)** : `ukemi_src_clean_and_allowlist_load_bearing` asserte, POUR CHAQUE entrée de la `Map`,
  que scanner ce seul fichier allowlist vide rend ≥ 1 hit (`transport.ts` ET `rpc.ts`) — une entrée à 0 hit = déclencheur de
  rétractation atteint, ROUGE ; + non-vacuité de portée `ukemi/*.ts ≥ 8`.
- **Emplacement CI (M-5)** : ride `npm test` (`g3-verification`, `ci.yml:102`), glob `package.json:16`. Aucune étape `ci.yml`,
  aucun pin `ci-gates`. LANG-GATE-CI fusionne néanmoins AVANT (règle de conflit, coût nul).
- **Mutants** : « allowlist élargie sans déclencheur » (Map à trigger vide) ; « `rpc.ts` retiré de la portée » ; « clé lue par
  crochets survit » — tous ROUGES.

### D-4 (conformité des TROIS classifieurs) — RULÉ (via transport, C-5)
Test `ukemi_recorder_classifiers_are_single_source_conformant` : classes/prédicats LOCAUX supprimés de `rpc2.ts`, IMPORTÉS
de `@monark/rpc-guard`. Corps mesurés {POCKET_5000, POCKET_10000, DRPC_FREE (M-7), + HTML NonJsonBody, + « Reverted » sans
« execution »} : `isResultLimit(hint)===isResultLimit(corps)`, idem `isPlanLimited`/`isRevertText` (préséance plan). Mutant
**« classe locale restaurée »** rejoué DEPUIS le transport réel (C-5, fetch bouchonné) ⇒ `instanceof RpcError` cassé à
travers la frontière ⇒ `ConcordantRevertError` ne se forme plus ⇒ un test quorum rougit. (Le vocabulaire côté paquet
— alternatives=jetons, garde de code 3/-32000 — est DÉJÀ couvert 2b-i, pli `f4ecf14`, M-14.)

### D-"0x" — RULÉ : **R-A option 1** (bencher la jambe payante ; conservateur)
`isRpcRevert` (`classify.ts:52`) → `if (e.unit !== "keyless" && (e.data === undefined || e.data === "0x")) return false;`
(conserve « présente mais vide » dans `rpc_errors`). **Effet** : un revert chainstack sans raison est BENCHÉ (abstient la
JAMBE, jamais le livre) ; keyless-vs-keyless INCHANGÉ (`ukemi_revert_key_uses_data`, sous-cas `mixed` GHO V-4, eps keyless →
VERT). **Résidu C-4 (complété)** : à l'état HEAD, un bare-revert chainstack face à un keyless produit un **FAUX DÉSACCORD**
(`onQuorum(false)` + `QuorumDisagreementError`) qui pollue la paire `chainstack|<keyless>` de `--concordance-out` ; l'option 1
le remplace par un banc, qui pose `cooldownUntil` **25 s** sur `chainstack` (`rpc2.ts:192`) par bare-revert — comportement
NEUF, narrow (chainstack dernier), 0 RU. Test neuf `paid_revert_with_empty_0x_data_is_benched` **rejoué DEPUIS le transport
réel** (C-5 : fetch bouchonné rendant `{error:{code:3,message:"execution reverted",data:"0x"}}` pour `chainstack`) ; mutant
« `"0x"` traité présent pour un payant » ROUGE. Option 2 (toucher `revertKey`) REJETÉE : 2b rougit `ukemi_revert_key_uses_data`
(régression mesurée du fait GHO V-4). `classify.ts`+test = travail sur le paquet en 2b-ii (déclaré CA-2 ; en 2b-ii-a si seam C-3).

### D-label — **À TRANCHER par l'orchestrateur** (les deux options, effets MESURÉS ; le worker ne tranche pas)
Fait (M-9) : jambe Chainstack relabellée `archive-env` aujourd'hui (`operatorLabel:39-41`, `tallyConcordance:289-291`,
`endpoints`, `calls_by_operator`, META `--resume` `record.ts:358-360`). Sous labels garde = `chainstack`.
- **Option A — conserver `archive-env`** : garde la compat des docs de provenance U-3/U-4 (fixtures env-indépendantes,
  PROVENANCE-u3:46) ; conserve `operatorLabel`/`ARCHIVE_ENV_LABEL`/`applyExcludeOperators`/`scrubUrls` dans `record.ts`.
- **Option B — adopter `chainstack`** : aligne provenance, ledger `chainstack.jsonl` et `operatorOf` ; le label N'EST PAS
  l'URL (aucun secret) ; supprime `operatorLabel`/`ARCHIVE_ENV_LABEL` (simplifie L-1).
- **Effets mesurés (M-17, checkpoint-1 §3)** : AUCUN consommateur ne casse dans les deux options — `concordance.ts` lit
  `{pair, concordant, discordant}` (label-agnostique) ; `resume.ts:86` `case "meta": break` (providers du META non vérifiés) ;
  `u4b-reduce.mjs:48` (gelé) ne lit que `provenance.book_digest`. Choix de NOMMAGE, pas de valeur ⇒ **l'orchestrateur rule à
  la réception du pli** (le worker ne le tranche pas au G1). Le câblage de L-1 (symboles conservés/supprimés) suit ce ruling.

### D-ethereum — RULÉ par R-D (adaptation MINIMALE cross-lot)
`apps/bell/src/ethereum.ts:67` → `new RpcError(providerOf(url), msg, code, "", "keyless", data)` : `op = providerOf(url)`
(JAMAIS l'URL — hygiène Bell), `unit = "keyless"` (aucun banc payant introduit à Bell), `detail = ""` ; **une ligne**,
`apps/bell` sinon INTACT (`pool-rpc-1a-bell.test.ts` ne construit pas de `RpcError`, 0 site). Comptée R-25. Sans elle le
typecheck fusionné rougit. La migration Bell reste GARDE-HELIUS-1b.

### D-u4scripts — RULÉ par C-9 : sous-lot **2b-iii** (annexe), déclencheur AVANT la course
Voir §15 + ANNEXE. `u4-oracle-path.mjs`/`u4-redraw.mjs` (et tout `u4-*` lisant une clé payante) migrent sous
`openGuardedClient` ; `u4-probe.mjs` (sonde, non requise par la course) = archivage/item formé. Aucun second résiduel payant
hors garde n'est accepté (doctrine 118/HELIUS-1 ; sinon ESCALADE-INVESTISSEUR).

## 7. Tuyaux déclarés (règle Branchement) — registre RULÉ par R-C
| Pièce | Entrée (produit) | Sortie (consomme) | État | Test d'intégration non-LLM |
|---|---|---|---|---|
| recorder gardé (`record.ts`) | argv (`--operators`, `--cycle`, …) + `deps.env` passé tel quel → `openGuardedClient` | `<ledgerDir>/<cycle>/chainstack.jsonl` (+ `.head`/`.lock`) + ledgers keyless (coût 0) + artefacts recorder inchangés | **`branché`** au G7 2b-ii ; **`upcoming`** au registre public jusqu'à la 1ʳᵉ course rapprochée (R-C) | `ukemi_record_spends_only_through_guard` (espion `globalThis.fetch` : tout `fetch` payant précédé de sa ligne ledger) via `runRecorder` réel, **`openGuardedClient` réel, seul `globalThis.fetch` bouchonné** (C-5) |
| vocabulaire/classe (2b-i) | `raise` du transport | `rpc2.ts` (ré-export + imports, `revertKey`, `getLogsVia`) + journal `rpc_errors` | branché à la fusion 2b-ii | conformité inter-paquets (D-4) |
| rapprochement servi | ledger produit par `runRecorder` | `runCli unlock` → `runCli reconcile` (`aggregate-calibration`) verdict + exit | servi | `ukemi_record_then_unlock_then_reconcile_end_to_end` |

**R-C (registre)** : au G7 2b-ii le paquet est **BRANCHÉ** (consommateur servi + e2e non-LLM transport→classify→record) ; il
passe **`built`** à la première course RAPPROCHÉE (U-4b-1b), conformément à l'addendum §5 et au G7 2a. La formulation
« built au G7 » de la mission initiale est RETIRÉE. **C-5 (CA-11 durci)** : l'e2e et `ukemi_record_spends_only_through_guard`
n'utilisent AUCUN faux client/transport — `openGuardedClient` réel, seul `globalThis.fetch` bouchonné (hôtes `.invalid`,
clés factices).

## 8. Invariants byte-identiques (M-10) — oracle COMPLÉTÉ (C-8-c)
```
scripts/census/u4b/u4b-scores.mjs   9ad20666af878c63…      apps/sentinel/src/ukemi/wadray.ts   7bee76fc96a9bc23…
scripts/census/u4b/u4b-reduce.mjs   a5e66cd387279f46…      apps/sentinel/src/ukemi/abi.ts      3376eb084f522cb2…
scripts/record-u4b-calib.mjs        5733daeb7c8ee40a…      packages/hikae/src/l1-split.ts      9206df9189d3eba6…
apps/sentinel/src/rpc.ts            0e232519a18aaa43…  (C-3 gel — NON touché : hors ukemi/**, mais DANS la portée grep R-B, allowlisté)
```
+ `book_digest 034fbff9…` (épinglé `ukemi.test.ts:29` — la réécriture des 17 signatures ne doit PAS toucher le PIN) et
`PINNED_DIGEST 267cd991…` (`ukemi-u4-scores.test.ts:20`) INCHANGÉS ; fixtures `u4/`+`u4b/` byte-identiques.
**Oracle d'invariant (C-8-c, plus large que `-- scripts`)** :
`git diff --quiet <base> -- scripts apps/sentinel/test/fixtures/ukemi/u4 apps/sentinel/test/fixtures/ukemi/u4b apps/sentinel/src/rpc.ts`
exit 0. `record.ts`/`rpc2.ts` **changent** (attendu ; NON gelés). **Dérive ATTENDUE (M-13, non un invariant)** : `ukemiSha`
(`record.ts:395/424`) change ; AUCUN test ne l'épingle (seul `PROVENANCE-weth-book.md:20` l'enregistre).

## 9. Table des tests imposés (C-7) — source → lot → statut ; + mutants
| # | Test / exigence | Source | Lot | Statut |
|---|---|---|---|---|
| 1 | `ukemi_record_spends_only_through_guard` | addendum L-2-3 | 2b-ii(-b) | neuf |
| 2 | `ukemi_record_requires_ledger_dir_cycle_and_method_caps` | addendum | 2b-ii(-b) | neuf |
| 3 | `ukemi_record_budget_refusal_is_not_retried` (refus ledgeré) | addendum | 2b-ii(-b) | neuf |
| 4 | `ukemi_record_resume_hits_cost_zero_ru` | addendum | 2b-ii(-b) | neuf |
| 5 | `ukemi_budget_counts_http_attempts` (R+1 lignes) | addendum | 2b-ii(-b) | neuf (oracle validé : 0 retry interne au garde, `client.ts:134`) |
| 6 | `ukemi_record_then_unlock_then_reconcile_end_to_end` (`aggregate-calibration`) | addendum / C-6(ii) | 2b-ii(-b) | neuf |
| 7 | conformité 3 prédicats hint↔corps | D6 §2, C-1(b), C-2, C-R-3 | **2b-i** (`f4ecf14`) | **couvert** ; reste `rpc2.ts` importe (0 regex) = D-4 (2b-ii-a) |
| 8 | identité `instanceof RpcError` (mutant « classe locale restaurée ») | C-1(a) | 2b-ii(-a) | neuf — via transport réel (C-5) |
| 9 | C-3 journal `rpc_errors` : corps clé-base64 ni disque ni stderr | pli C-3 | 2b-ii(-b) | neuf |
| 10 | C-5 préambule/code sans jeton | pli C-5 | **2b-i** | couvert |
| 11 | C-6(i) grep `ukemi/**`∪`rpc.ts` 0 hit + allowlist 2 entrées + non-vacuité PAR ENTRÉE + skip Bell | pli C-6 / C-2 | 2b-ii(-b) `ukemi_src_clean_and_allowlist_load_bearing` | neuf |
| 12 | C-6(ii) `finally` relâche N verrous (y c. sur `BudgetExceededError`) | pli C-6 | 2b-ii(-b) | neuf (test dédié, pas seulement l'e2e) |
| 13 | C-6(iii) retry chez l'appelant (Abort/réseau/429/≥500 ; jamais RpcError/NonJsonBody/4xx/Budget) | pli C-6 | 2b-ii(-b) | neuf |
| 14 | C-6(iv) `operatorOf("nodies.app")===operatorOf("pocket.network")==="pocket"` | pli C-6 | 2b-ii(-a) | neuf (assertion) |
| 15 | R-A `paid_revert_with_empty_0x_data_is_benched` (via transport) | R-A / C-4 / C-5 | 2b-ii(-a) | neuf (touche `classify.ts`) |
| 16 | C-G-1 (alternatives=jetons) / C-G-3 (garde de code 3/-32000) | G2 2b-i | **2b-i pli `f4ecf14`** | **couvert — R-F SATISFAIT** (`f4ecf14` dans HEAD, M-14 ; G2-delta PASS `19eddfc`) |
**Mutants (ROUGES, restauration byte-exacte)** : `makeBudgetedCall` restauré (prouvé en -b) ; args optionnels ; retry avale
le refus ; retry SOUS le tick ; **classe/regex locale restaurée** (prouvé en -a, via transport) ; corps dans `rpc_errors` ;
`finally` sans keyless ; **allowlist élargie sans déclencheur** ; **`rpc.ts` retiré de la portée** (C-2) ; **clé lue par
crochets survit** (C-1) ; **`"0x"` présent pour un payant** (R-A, via transport).
*Note : la colonne « Lot » `(-a)`/`(-b)` est une répartition INDICATIVE (C-3 fixe -a = « rpc2 canonique, signatures, D-4,
R-A » et -b = « record.ts, grep, e2e », pas ligne par ligne) — à confirmer au G1 SI le seam s'active ; sinon tout est 2b-ii.*

## 10. R-25 (M-2/M-3) + second seam PRÉ-DÉCLARÉ (C-3)
Ancres MESURÉES : `record.ts` 467 (réécrit ≈ 250-350 diff) ; `rpc2.ts` 269 (ré-exports + imports + suppr. classes/regex
locales, 40-60) ; ripple 3 tests : `ukemi-record.test.ts` 327 (16 usages supprimés), `ukemi-u4a.test.ts` 230 (17 usages),
`ukemi.test.ts` 355 (5 `defaultCall` + 17 `new RpcError`) ; signatures `ukemi.test.ts` ≈ 100 ; tests neufs ≈ 300-400 ;
grep ≈ 60 ; Bell (R-D) ≈ 1-6. **Fourchette d'ordre (checkpoint-1 §3) : ~1 050-1 400** ⇒ la centrale 945 du G1 2b-i est
**optimiste** ; la borne basse ~800 n'est plausible que si les tests legacy retry/backoff/journal de `ukemi-record.test.ts`
(7/16) sont RETIRÉS (couverture transport du paquet citée), pas réécrits.
- **Second seam PRÉ-DÉCLARÉ (C-3, activé si R-25 mesuré > 1150 ; `docs/**/*.md` exclus, `ci.yml:65`)** : **2b-ii-a** =
  `rpc2.ts` canonique (ré-export `RpcError`/`BudgetExceededError`, imports `classify`, suppr. classes/regex locales) + ripple
  de signature (`ukemi.test.ts` 17, `pool-rpc-1a.test.ts` 1, `ethereum.ts:67` R-D, `record.ts:126` une ligne) + D-4 + identité
  via transport + R-A (`classify.ts` + `paid_revert_with_empty_0x_data_is_benched`) — **fusionnable SEUL** (n'exige PAS la
  suppression de `makeBudgetedCall`), ≈ 250-350 ; **2b-ii-b** = migration `record.ts` + ses tests + grep + e2e. Le mutant
  « classe locale restaurée » se prouve en -a, « `makeBudgetedCall` restauré » en -b. Substitution de couverture d'abord ;
  escalade orchestrateur seulement si **-b SEUL** > 1150. Le worker G1 MESURE et rend `git diff --shortstat` verbatim.

## 11. Exigences d'ENTRÉE — statut PLIÉ (R-F satisfait ; C-6/C-8)
- **C-G-1 / C-G-3 / C-R-3 : SATISFAITES à l'entrée (R-F)** — pliées dans 2b-i au pli `f4ecf14`, **dans HEAD** (M-14 ;
  `rpc_revert_requires_the_json_rpc_code_3_or_minus_32000`, `error_vocabulary_regex_alternatives_are_all_hint_tokens`,
  conformité). Plus « conditionnelles ». G2-delta 2b-i PASS (`19eddfc`).
- **C-GD-2 : FERMÉE structurellement par D6 de 2b-i** (payant ⇒ `closedHint`, aucun octet du corps, M2 ROUGE). « Fermé,
  pas ouvert. »
- **Amendement ADR (C-6)** : L-5 porte **R-B et R-D VERBATIM**. A-6 (l.249-251) dit « élargissement à `apps/sentinel/src/**`
  … en 2b » ; l'amendement daté RESTREINT à `ukemi/**` ∪ `rpc.ts` (`run.ts`/`timeline.ts` entrent à NARABI-OPS-1d).
- **Ordre / oracle (C-8)** : (a) prereg U-4b-1b se committe APRÈS la fusion de 2b-ii ; liste gelée = 7 sha M-10 sans
  `record.ts`/`rpc2.ts` ; (b) base G1 : `git merge-base --is-ancestor 8ba2cbc <base>` (TENUE, M-14) ET LANG-GATE-CI fusionné ;
  (c) oracle d'invariant élargi (§8) ; (d) **D-label tranché par l'orchestrateur AU G0** (pas par le worker au G1).

## 12. Oracle (codes capturés DIRECTEMENT, hors pipe)
`npm run ci && npm run lint && npm run lint:ratchet && npm run lang:gate` sur l'arbre fusionné. Spécifiquement : suite verte
(aucun `fail`) ; `book_digest 034fbff9` / `PINNED_DIGEST 267cd991` verts ; **oracle d'invariant élargi** (§8, C-8-c) exit 0 ;
`git diff --shortstat` (pathspec `ci.yml:65` verbatim) pour R-25 ≤ 1150 (ou seam C-3) ; tous les mutants (§9) ROUGES sur leur
test nommé, restauration byte-exacte sha256 ; grep `ukemi/**`∪`rpc.ts` = 0 hit hors allowlist + non-vacuité PAR ENTRÉE + skip
Bell restant. **« ASCII » (C-8, précision)** : `npm run lang:gate` = mots interdits (`scripts/lang-gate.mjs:52`, identifiants) ;
il n'existe PAS d'oracle ASCII de dépôt — la discipline « code et commentaires ASCII » des livrables (respectée par 2b-i) est
une **convention de brief** à écrire dans la mission G1, pas un gate. Le worker rend `sha256sum` worktree vs manifeste (ADR-C01).

## 13. Critères d'acceptation
CA-11 (durci) : recorder gardé **branché** à la fusion (e2e `runRecorder → unlock → reconcile` non-LLM, seul `globalThis.fetch`
bouchonné, C-5) ; registre `upcoming` jusqu'à la 1ʳᵉ course rapprochée (R-C). CA-2 : migration + corrections foldées SUR le
paquet = couture pré-déclarée (aucune valeur nouvelle ; D-label est un choix de NOMMAGE tranché par l'orchestrateur, pas par
le worker). CA-7 : résidu R-A déclaré (cooldown 25 s, faux désaccord évité, C-4) ; C-GD-2 fermé ; résidus `.data` (clé
partielle/base64 hex) nommés. CA-3 : amendement ADR daté (R-B/R-D verbatim, `"0x"`, C-GD-2 fermé, runbook N `unlock`). CA-9 :
oracle re-exécuté sur arbre isolé à `node_modules` résolvant `@monark/*` (leçon jonction).

## 14. Items formés (zéro dette nue — propriétaire + déclencheur)
1. **D-label** (SEUL point ouvert) : `archive-env` vs `chainstack` — propriétaire orchestrateur, **tranché à la réception du
   pli** (options + effets mesurés §6 D-label / M-17).
2. **2b-iii** (ex-D-u4scripts, C-9) : migration `u4-oracle-path.mjs`/`u4-redraw.mjs` sous le garde — propriétaire orchestrateur,
   **déclencheur AVANT la course U-4b-1b** ; `u4-probe.mjs` archivé (item formé). Annexe.
3. **DEV-2 / D-keyless-cycle : CLOS** par C-1 (6 args requis sans condition ; un seul `--cycle`).
4. **Prereg U-4b-1b** : committé APRÈS 2b-ii (C-8-a), liste gelée = 7 sha M-10.
5. **NARABI-OPS-1d** : `run.ts`/`timeline.ts` entrent en portée grep + migration `rpc.ts` — déclencheur clôture temps 1.

## 15. Hors périmètre (déclaré)
Job quotidien Narabi (`run.ts`/`rpc.ts`, **NARABI-OPS-1d** ; résiduel Chainstack payant hors garde ACCEPTÉ temps 1,
décision 118) ; Bell (1b) sauf la ripple minimale `ethereum.ts:67` (R-D) ; **prereg et course U-4b-1b** (APRÈS 2b-ii + 2b-iii) ;
quota/overage Chainstack (NON LU, A-5). **Second résiduel payant hors garde** (u4-* non migrés) = classe HELIUS-1 ⇒ jamais
accepté sans **ESCALADE-INVESTISSEUR** (C-9).

## 16. Risques (MAST) — résiduel
Casse silencieuse hors CI + dépense payante hors ledger (`u4-*.mjs`, M-15) — **contrée par 2b-iii AVANT la course** (C-9) ;
évasion du motif KEY (crochets/`in`, M-16) — contrée par C-1(c) + mutant ; non-vacuité agrégée à 2 entrées — contrée par C-2 ;
ripple cross-lot (`ethereum.ts`) — R-D au périmètre ; sous-estimation R-25 — mesure G1 + seam C-3 ; faux désaccord de revert
(`"0x"`, M-8) — R-A (banc) + C-4 ; branchement non exécuté — e2e réel, seul `fetch` bouchonné (C-5) ; casse du gel U-4b —
§3 (pas de STOP, deux fronts) + oracle §8.

---

## Pli du checkpoint-1 (2026-09-21) — C-n → ce qui change
Avis `docs/CHECKPOINT1-lot-garde-helius-2b-ii.md` (validateur `claude-fable-5-1`, APPROUVE-AVEC-CORRECTIONS ; C-1/C-2/C-9
BLOQUANTS, C-3..C-8 non bloquants). Rulings orchestrateur appliqués. Chiffres neufs : M-14..M-17.
- **C-1 (bloquant) → §5 L-1, §6 D-1, §6 D-keyless-cycle** : `record.ts` ne probe PLUS l'env ; `--operators` explicite
  (remplace `--exclude-operator`) ; un seul `--cycle` pour tous les demandés (clôt D-keyless-cycle) ; N `unlock` =
  `client.operators()` ; **6 args REQUIS sans condition** (annule le « conditionnel » de mon brouillon D-1) ; motif KEY grep
  étendu crochets/`in`/destructuration + mutant « clé lue par crochets survit » (M-16). `--slow-operator`/`--slow-interval-ms`
  survivent.
- **C-2 (bloquant) → §5 L-3, §6 D-3, §9** : non-vacuité **PAR ENTRÉE** d'allowlist (pas agrégée) + mutant « `rpc.ts` retiré de
  la portée ».
- **C-3 → §2, §10** : second seam PRÉ-DÉCLARÉ **2b-ii-a** (rpc2 canonique + signatures + D-4 + R-A) / **2b-ii-b** (record.ts +
  grep + e2e) ; remplace « > 1150 ⇒ escalade » nu ; escalade seulement si **2b-ii-b SEUL** > 1150.
- **C-4 → §4.5, §6 D-"0x"** : le résidu R-A est complété — l'état HEAD est un **FAUX DÉSACCORD** (pas seulement « perte de
  concordance ») ; l'option 1 le remplace par un banc + `cooldownUntil` 25 s (`rpc2.ts:192`), narrow, 0 RU.
- **C-5 → §7, §9, §6 D-4/D-"0x"** : composition e2e n'utilise AUCUN faux client/transport (seul `globalThis.fetch` bouchonné) ;
  mutants identité et `"0x"` rejoués DEPUIS le transport ; journal `rpc_errors` par `e.name` (`HttpError`→`http`,
  `RpcError`→`code`) — un HTTP 400 payant journalise `http:400`, jamais `code:400`.
- **C-6 → §5 L-5, §11, §6 D-ethereum** : amendement ADR porte **R-B et R-D VERBATIM** ; A-6 (`apps/sentinel/src/**`) restreint
  à `ukemi/**` ∪ `rpc.ts` ; `ethereum.ts:67` → `new RpcError(providerOf(url), msg, code, "", "keyless", data)` (une ligne).
- **C-7 → §9** : table des 16 tests (source → lot → statut) intégrée au G0.
- **C-8 → §3, §8, §11, §12** : prereg committé APRÈS 2b-ii (liste gelée 7 sha) ; base G1 ≥ `8ba2cbc` + LANG-GATE-CI (M-14) ;
  oracle d'invariant élargi (`scripts` + `fixtures/ukemi/u4` + `u4b` + `rpc.ts`) ; « ASCII » = convention de brief, pas un gate.
- **C-9 (bloquant) → §2, §5 L-6, §6 D-u4scripts, §15, ANNEXE** : R-E avait un mauvais déclencheur — `u4-oracle-path.mjs`
  (produit le D_e servi) et `u4-redraw.mjs` (contrôle live G2-delta) sont sur le chemin de la course ET lisent
  `CHAINSTACK_ETH_URL` (M-15) ⇒ jambe payante hors garde. Ruling **(α)** : sous-lot **2b-iii** — les migrer sous
  `openGuardedClient` **AVANT la course** ; `u4-probe.mjs` archivé ; aucun second résiduel payant hors garde (sinon escalade).
- **D-label → §6 D-label, §14 item 1** : NON tranché par le worker ; les deux options + effets mesurés (M-17) présentés ;
  l'orchestrateur rule à la réception.

## ANNEXE — G0 court de 2b-iii (migration des scripts de course U-4b sous le garde) — RULING C-9 (α)
> Sous-lot séparé, propriétaire orchestrateur, **déclencheur : AVANT la course U-4b-1b** ; G1 propre (worker Opus 4.8).
- **Objectif** : `scripts/census/u4-oracle-path.mjs` et `scripts/census/u4-redraw.mjs` (et tout `u4-*` lisant une clé payante)
  ne dépensent plus AUCUN Chainstack hors `@monark/rpc-guard` ; ils ne lisent plus `process.env.CHAINSTACK_ETH_URL`
  (`:55`/`:83`, M-15). `u4-probe.mjs` (sonde, non requise par la course) = archivage + item formé.
- **Livrables** : (i) `u4-oracle-path.mjs`/`u4-redraw.mjs` construisent `openGuardedClient(env, limits, ledgerDir, cycles,
  opts)` (labels, `--ledger-dir`/`--cycle`/`--floor`/`--max-ru`/`--method-caps`, aucune lecture d'env directe ; `--max-calls`
  fail-closed conservé) ; (ii) sink `onTransportError` par opérateur (motif `errByOp`, comble aussi U-4b-0 item 0-3
  `u4-redraw.mjs:88`) ; (iii) `meta.model` argument/env fail-closed si co-traité (U-4b-0 item 0-2, `u4-redraw.mjs:111`) ;
  (iv) **grep CI étendu à `scripts/census/u4-*.mjs`** (0 hit hors allowlist), portée déclarée au G1 de 2b-iii.
- **Variante (β) — offerte au checkpoint-1, NON RETENUE (ruling α), tracée** : porter la course D_e (`aggregator()`, getLogs
  `AnswerUpdated`, `getAssetPrice`, `getEModeCategoryData`) DANS le recorder gardé (mode `--oracle-path`) et retirer
  `u4-oracle-path.mjs`. Non retenue par le ruling C-9 (α = migrer les scripts) ; réévaluable seulement au G0 propre de 2b-iii.
- **Tests (fetch bouchonné, ledger sur disque)** : `u4_oracle_path_spends_only_through_guard`,
  `u4_redraw_spends_only_through_guard`, `u4_redraw_error_sink_records_operator_fault` ; mutant « lecture d'env restaurée »
  ROUGE ; grep `scripts/census/u4-*.mjs` 0 hit.
- **Prereg §(5)** déclare : « la course et son contrôle live n'exécutent AUCUN script hors garde » — condition de commit du prereg.
- **Invariants** : `book_digest`/D_e byte-identiques (la migration change la plomberie, pas les octets du D_e produit) ;
  ordre des fournisseurs `rpc2.ts:268-269` inchangé ; R-25 mesuré au G1 de 2b-iii.
- **Escalade** : accepter un second résiduel payant hors garde pour la course = **ESCALADE-INVESTISSEUR** (même nature que 118).

## RULINGS ORCHESTRATEUR (2026-09-21, avant checkpoint-1 ; supersèdent les « proposé » du brouillon)
- **R-A `data === "0x"`** : **Option 1** — la jambe payante est BENCHÉE quand `data` est `"0x"` ou absente (prolonge D6 / C-1(c)) ; le guard `revertKey:60` et le test `ukemi_revert_key_uses_data` (sous-cas `mixed`, GHO V-4) CONSERVÉS. Option 2b rejetée : régression mesurée.
- **R-B portée du grep CI** : `apps/sentinel/src/ukemi/**` ∪ `apps/sentinel/src/rpc.ts` (alignée sur ADR A-6 ; entrée d'allowlist `rpc.ts` à déclencheur -1d non vacante). Test in-suite (`g3-verification`), aucune étape `ci.yml` ; LANG-GATE-CI fusionne néanmoins AVANT.
- **R-C registre** : au G7 2b-ii le paquet est **BRANCHÉ** (consommateur servi + e2e non-LLM) ; **`built`** à la première course RAPPROCHÉE (U-4b-1b). « built au G7 » retiré.
- **R-D ripple `apps/bell/src/ethereum.ts:67`** : adaptation MINIMALE du site d'appel (signature seule, aucune migration Bell, comptée R-25) ; la migration Bell reste GARDE-HELIUS-1b.
- **R-E scripts `u4-*.mjs`** : *(SUPERSÉDÉ par C-9)* item formé — **le déclencheur « U-7 / première réexécution » est CORRIGÉ en « AVANT la course U-4b-1b » (sous-lot 2b-iii)**, cf. rulings checkpoint-1 C-9.
- **R-F exigences d'entrée C-G-1 / C-G-3 / C-R-3** : pliées dans 2b-i (`f4ecf14`) ⇒ **SATISFAITES** (dans HEAD, M-14 ; G2-delta PASS) ; C-GD-2 « fermé structurellement par D6 ».
- **R-G transitivité** : mesure M-1 acceptée (aucun STOP) — re-vérifiée par le validateur au checkpoint-1 sur DEUX fronts (imports + données, §3).

## RULINGS ORCHESTRATEUR sur le checkpoint-1 (2026-09-21 ~20:5x UTC ; avis `docs/CHECKPOINT1-lot-garde-helius-2b-ii.md`)
- **C-9** : option **(α)** — sous-lot **2b-iii** : `scripts/u4-oracle-path.mjs` et `scripts/u4-redraw.mjs` (et tout `u4-*` lisant une clé payante) migrent sous `openGuardedClient` ; déclencheur **AVANT la course U-4b-1b** ; aucun second résiduel payant hors garde accepté (doctrine 119/HELIUS-1). Grep CI (R-B) étendu à `scripts/u4-*.mjs` au G1 de 2b-iii.
- **C-3** : second seam PRÉ-DÉCLARÉ **2b-ii-a** (rpc2 canonique, signatures, D-4, R-A) / **2b-ii-b** (`record.ts`, grep, e2e) ; activé si R-25 mesuré > 1150 ; docs exclus.
- **C-1, C-2, C-4..C-8** : pliés tels quels par le worker de pli (ce document). **D-label** : les deux options présentées, ruling orchestrateur à la réception.
- **Ordre** : LANG-GATE-CI fusionné → worktree 2b-ii (base ≥ `8ba2cbc` + lang-gate) → G1 2b-ii → 2b-iii → prereg → course.

---
**R-1** : `claude-opus-4-8[1m]`. **R-20** : aucun commit, aucun workflow. **R-21** : écrit pour vérification adversariale
(chaque chiffre → `MESURES.md`). Pli du checkpoint-1 : C-1/C-2/C-9 (bloquants) et C-3..C-8 (non bloquants) intégrés au corps ;
D-label seul reste ouvert (tranché par l'orchestrateur à la réception).

## RULING ORCHESTRATEUR D-label (2026-09-21 ~21:2x UTC)
Le label de la jambe payante dans le journal/ledger est **`chainstack`** (label d'OPÉRATEUR, unique par compte — décision 121 ; le réseau est l'attribut `network`). `archive-env` / `ARCHIVE_ENV_LABEL` / `operatorLabel` sont SUPPRIMÉS (aucun consommateur cassé : M-17). Le G0 est APPROUVÉ pour le G1 ; base du worktree = `lot/etude-suite` après la fusion de LANG-GATE-CI.
