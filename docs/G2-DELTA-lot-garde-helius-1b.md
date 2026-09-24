# G2-DELTA GARDE-HELIUS-1b (relecteur Opus 4.8, reprise) — PASS

Modèle résolu : claude-opus-4-8[1m]

Rendu intégral G2 (rapport durable écrit à `F:\tmp\g2-garde1b\G2-lot-garde-helius-1b-i-ii-iii.md`) :

---

# G2 (relecteur, contexte frais) — GARDE-HELIUS-1b-i / 1b-ii / 1b-iii sur l'ARBRE FUSIONNÉ

**Provenance** : relecteur G2, worker `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non utilisé), 2026-09-22. Réviseur = orchestrateur (R-21). R-20 : aucun commit, aucun workflow. Clone `git clone --no-hardlinks F:\tmp\bell-merge\tree F:\tmp\g2-garde1b\tree` @ **`14784ee588c169aaaf358dccfecc5f3409e8720a`** (= la source annoncée). node_modules par `F:\tmp\g2-garde2bi\mk-nm.ps1` : `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-garde1b\tree\packages\rpc-guard\src\index.ts` (A-2). Toutes les vérifications **REFAITES** sur le clone (jamais lues dans les rendus G1). Tout oracle/test/mutant/reconcile sous `env -u` des 8 clés payantes (A-7) ; aucune variable d'environnement affichée ; écritures uniquement sous `F:\tmp\g2-garde1b\`. Clone `git status --short` VIDE avant, entre chaque harnais, et après (restaurations byte-exactes).

## VERDICT

| Sous-lot | Verdict |
|---|---|
| **1b-i** (universe) | **PASS** |
| **1b-ii** (collect / crosscheck) | **PASS-AVEC-CORRECTIONS** (C-G2-A jambe ETH non branchée ; C-G2-B section ADR 1b-ii absente ; C-G2-D R-25 674≠680) |
| **1b-iii** (close/eth + dé-skip + ripple) | **PASS** |
| **GLOBAL (arbre fusionné)** | **PASS-AVEC-CORRECTIONS** |

Aucune trouvaille bloquante : oracle 830/830/0/0 ; gel U-4b + paquet byte-identiques à `c10c13d` (avant ET après mutants) ; aucun mutant G1 survivant sur l'arbre fusionné avec ancre APPLIQUÉE (les 2 « survies » brutes = ancres devenues stale par les plis m2/m3/m4 ; propriétés confirmées via ancres adaptées). Corrections = deux plis annoncés-mais-non-appliqués + deux notes documentaires. Toutes fail-closed, Bell reste `upcoming`, aucun chemin servi ne casse.

**Checkpoint-2 (CA-1..CA-11)** : hors de mon rôle (G2 relecteur) — non exécuté ; il revient au validateur-humain.

---

## 1. Oracle complet (vérif 1) — env -u, codes capturés DIRECTEMENT (A-3)

| Oracle | Code | Compteurs |
|---|---|---|
| `gate:vocab` | 0 | scanned 209 file(s), no forbidden claim |
| `typecheck` (`tsc --noEmit`) | 0 | propre |
| `test` (`node --test`) | 0 | **tests 830 / pass 830 / fail 0 / skipped 0** |
| `lint` (eslint) | 0 | 0 problème |
| `lint:ratchet` | 0 | **69/69** |
| `lang:gate` | 0 | 0 hit non-exempt (bell GATED 0) |
| `export:check` | 0 | 0 chemin interdit, 0 français non-exempt |

**0 skip** : `fetch_only_inside_client` a TOURNÉ et PASSÉ (test.log l.885 `✔ fetch_only_inside_client`). Conforme à l'attendu mission. Logs : `F:\tmp\g2-garde1b\logs\`.

### Gel U-4b + paquet (vérif 1) — byte-identité à `c10c13d`
`git diff c10c13d 14784ee` restreint aux **9 fichiers gelés** ET à `packages/rpc-guard/src` = **VIDE**. Re-vérifié **après tous les mutants** (M5 de 1b-i mute `client.ts` transitoirement) : diff toujours vide ; `client.ts` worktree sha256 == HEAD (`6553556c…`). sha256 LF des 9 (git show HEAD:, évite CRLF) tous concordants, dont les deux nommés : `apps/sentinel/src/rpc.ts` **`0e232519…`** ✓, `scripts/census/u3-realized.mjs` (le « labeler ») **`755b3a38…`** ✓ ; + `u4b-scores 2f9a31f6`, `u4b-reduce a5e66cd3`, `record-u4b-calib 5733daeb`, `wadray 7bee76fc`, `abi 3376eb08`, `l1-split 9206df91`, `calib-digest 3603265d`.

## 2. Sondes / fetch / clés + record.ts (vérif 2) — grep INDÉPENDANT (mes regex)

- **Aucun `fetch(` nu / `node:http(s)` / `undici` / `child_process`** dans `apps/bell/src/**` hors commentaires.
- **Aucune lecture de clé payante hors `close.ts`** : les seuls hits (residuals.ts:42, universe-cli.ts:176/177/302) sont des commentaires / chaînes descriptives, pas des reads.
- Unique lecture env dans `apps/bell/src` : `collect.ts:758 deps.env.BELL_HALTS_CSV` — chemin **non payant**, injecté, **pré-existant** (présent à `c10c13d`). Bénin.
- `close.ts` (module allowlisté) porte `readCashKeys(env)` — le SEUL lecteur de clé cash (C-6).
- **record.ts byte-identique HORS du `finally`** : `git diff c10c13d 14784ee` = **UN** hunk `@@ -425,10 +425,13 @@`, ENTIÈREMENT dans le `finally` (ripple 1b0-E : `--cycle cycle` → `--cycle cycles[String(op)]!`).
- **A-7 code neuf** : lignes `+` — aucun `process.env.X` affiché ; seul `env: process.env` passé au point d'entrée CLI (couture DI).

## 3. Mutants (vérif 3) — 3 harnais rejoués (11+11+10) + 2 ancres adaptées + 5 cross-lot

Harnais copiés sous `F:\tmp\g2-garde1b\harness\`, `WT` repointé vers le clone (originaux jamais édités ; 0 référence `Monark-wt-` résiduelle). Chaque harnais échoue BRUYAMMENT sur ancre absente (`n!==1`) ; `git status` du clone VIDE entre chaque. Tout sous `env -u`.

| Harnais | Résultat brut | Détail |
|---|---|---|
| **1b-iii** (10) | **10/10 KILLED** | baseline verts, mutants rouges, restauration byte-exacte |
| **1b-ii** (11) | **10 KILLED, 1 SKIP** | M8 ancre `polygonKey = deps.env.POLYGON_API_KEY ?? ""` **stale** (pli m3/m4 : 1b-iii C-6 `readCashKeys`) |
| **1b-i** (11) | **10 KILLED, 1 SURVIVED** | M1 ancre `import { BudgetExceededError } from "@monark/rpc-guard";` **stale** (pli m2 : quorum.ts en-tête 1b-ii = import combiné l.25 + re-export l.35) |

**Les 2 « survies » sont des ancres devenues stale par les PLIS, pas des propriétés cassées.** Adaptées à la forme fusionnée et re-tuées (`h-g2-crosslot.mjs`) :
- **A-M1** (1b-i M1 adapté) : re-export → classe locale ⇒ `universe_budget_refusal_is_not_retried` **RED**. KILLED.
- **A-M8** (1b-ii M8 adapté) : `readCashKeys(deps.env)` + injection `deps.env.POLYGON_API_KEY` ⇒ `bell_1bii_src_files_clean_of_fetch_and_paid_keys` (pli m4 : ZÉRO clé cash) **RED**. KILLED.

⇒ **32/32 mutants effectivement tués sur l'arbre fusionné** (30 tels quels + 2 adaptés).

**Contrôle « rouge sur l'ASSERTION attendue, pas sur une erreur de chargement »** (A-M1/A-M8/CL-1 rejoués à la main, message grepé, restaurés byte-exact) :
- A-M1 → `AssertionError [ERR_ASSERTION]: a cycle_cap refusal STOPs the run` (actual `Error: rpc-guard: cycle_cap`) — classe non canonique casse `instanceof`. OUI.
- A-M8 → `AssertionError: collect.ts reads NO cash key`, actual `['deps.env.POLYGON_API_KEY']` vs `[]`. OUI.
- CL-1 → `AssertionError: both body forms compose to an artifact (wrap=true)`, actual `false` vs `true`. OUI.
Aucun `SyntaxError`/`Cannot find`/`is not defined`/`ERR_MODULE`.

### 5 mutants CROSS-LOT (à moi)
| # | Interaction | Mutation | Cible | Attendu | Résultat |
|---|---|---|---|---|---|
| CL-1 | 1b-i × A-8 | `foldPage(seenIds, (body).result, …)` (désenveloppe json.result, bug fondateur 1b-0 C-1) | `universe_spends_only_through_guard` | KILL | **KILLED** (corps réel `{assets}`/tableau nu ⇒ `.result` undefined ⇒ univers vide fail-open) |
| CL-2 | 1b-ii × 1b-iii | clé `deps.env.HELIUS_API_KEY` relue dans collect.ts | **racine** `fetch_only_inside_client` | KILL | **KILLED** (la liste-de-racines 1b-iii couvre apps/bell/src de 1b-ii) |
| CL-3 | 1b-i × 1b-ii | re-export BudgetExceededError → classe locale | `bell_crosscheck_guarded_resume_without_loss_after_budget_stop` | KILL | **KILLED** (collect.ts:32 ET universe-cli.ts:13 importent la classe du re-export ; instanceof cassé cross-lot) |
| CL-4 | 1b-ii (sonde) | reprise crosscheck : `priorEvents` perdus | `…guarded_resume_without_loss…` + `…resume_after_exhaustion_is_equal` | probe | **RED sur LES DEUX** — trouvaille : le test de reprise gardée ATTRAPE la perte du prior (1b-ii a SOUS-déclaré sa couverture ; « sans perte » est prouvé PAR LA COMPOSITION, pas seulement au paquet) |
| CL-5 | 1b-iii (déclaré) | record.ts cycle SCALAIRE (`cycles[op]` → 1 valeur) | `ukemi_record_finally_unlocks_each_operator_under_its_own_cycle` | SURVIVE | **SURVIVE confirmé** — DÉCLARATIF (déclaré par 1b-iii) ; tueur = M5 `WRONG-CYCLE` (déjà tué). Non-vacuité prouvée. |

## 4. Compositions A-8 (vérif 4) — corps de FORME RÉELLE, rejouées env -u

Stubs `fetch` LUS avant rejeu : issuer = `{assets:[…]}` **ET** tableau nu (`for (wrap of [true,false])`, assert `solanaAssets===7` « read VERBATIM », JAMAIS d'enveloppe JSON-RPC) ; Solana/ETH = `{jsonrpc,id,result}` (forme réelle de ces API). Compositions RÉELLES (vrai `openGuardedClient`, seul `globalThis.fetch` bouchonné).

| Tuyau | Tests | Résultat |
|---|---|---|
| (a) universe (objet + tableau nu → pages → ledger → N-unlock → reconcile GO) | `universe_spends_only_through_guard`, `universe_finally_unlocks_then_reconcile_goes`, `bell_universe_enumerates_from_issuer_list_and_onchain` | 3/3 ✓ |
| (b) collect Solana (network explicite, caps couverts, STOP non retry, reprise) | `collect_spends_only_through_guard`, `solana_course_passes_network_explicit_and_fails_closed_without_solana_url`, `bell_method_caps_missing_a_called_method_fails_closed_at_construction`, `quorum_classifies_canonical_transport_errors` | 4/4 ✓ |
| (c) ethereum keyless budgété (403 fatal, transitoire retry) | `eth_leg_budgeted_and_keyless`, `eth_leg_budget_refusal_is_not_retried`, `eth_leg_retries_transient_but_not_403` | 3/3 ✓ |
| (d) rebase-crosscheck (prior avant require_full_pages, crédits du ledger) | `bell_crosscheck_guarded_resume_without_loss_after_budget_stop`, `bell_density_strict_probe_over_loose_budget_is_fail_closed`, `crosscheck_credits_derived_from_ledger` | 3/3 ✓ |

## 5. Reconcile de course (vérif 5) — runbook exécuté sur l'arbre

Deux ledgers de cycle RÉELS (chaînés via l'API paquet `openOperatorLedger`/`appendChained`, 100 RU chacun) + 4 snapshots `{cycle,total_ru}` sous `F:\tmp\g2-garde1b\reconcile\`, puis `node packages/rpc-guard/bin/rpc-guard.mjs reconcile …` :
- **GO** : delta 100 == ledger 100 ⇒ `GO`, **exit 0**.
- **NO-GO à +1 RU** : delta 101 > ledger 100 ⇒ `NO-GO hard:total`, **exit 1**.
- contrôle négatif : `--mode per-method` sur chainstack (aggregate-only) ⇒ fail-closed, **exit 2**.

Le runbook (deux fichiers snapshot + bin) est exécutable ; son exit code / verdict est la sortie consommée.

## 6. R-25 par sous-lot (vérif 6) — pathspec VERBATIM `ci.yml:65`, base `6114ce9` (trois points)

| Sous-lot | Mesuré | Attendu | Borne |
|---|---|---|---|
| 1b-i (`d9abbe1`) | **1136** (699 ins + 437 del, 6 fichiers) | 1136 | ≤ 1150 ✓ |
| 1b-ii (`3982ca1`) | **680** (536 ins + 144 del, 8 fichiers) | 680 | ≤ 1150 ✓ |
| 1b-iii (`1c8e0ea`) | **465** (349 ins + 116 del, 10 fichiers) | 465 | ≤ 1150 ✓ |

**Total fusionné** : `c10c13d…14784ee` = **2257** (20 fichiers) ; `6114ce9…14784ee` = **2981** (33 fichiers). Contrôle deux-points == trois-points sur 1b-i = 1136. **Écart C-G2-D** : rendu G1 1b-ii §3 annonce 674 (530 ins) ; réel **680** (536 ins) — sous la borne (commit 1b-ii et mission disent 680). Rendu 1b-iii §7 annonce 415 ; réel (et son §3) 465.

## 7. CA-11 registres publics + tuyaux ADR (vérif 7)

`git diff --name-only c10c13d 14784ee` = 22 fichiers, TOUS sous `apps/bell/{src,test}`, `apps/sentinel/{src/ukemi/record.ts,test}`, l'ADR, `package-lock.json`, `test/{rpc-guard-fetch-only-inside-client,guard-scripts-u4}.test.ts`. **Rien** de site/README/skills/export-config/registre. Bell reste `upcoming`. ✓

## 8. A-7 code neuf + ADR union (vérif 8)

- A-7 : vérifié §2 (aucune variable d'env affichée dans le code neuf).
- ADR : **0 marqueur de conflit**. Sections d'amendement présentes : 2b-ii, 2b-ii-c, 2b-iii, 1b-0, **1b-i**, **1b-iii** — chacune une fois. **C-G2-B : la section 1b-ii est ABSENTE** (voir corrections).

---

## CORRECTIONS (PASS-AVEC-CORRECTIONS, non bloquantes)

- **C-G2-A — jambe ETH non branchée dans la course collect (error_origin: fold ; périmètre 1b-ii).** `collect.ts:736` appelle `liveEthSwaps(ethPool, ethFrom, ethTo)` SANS `{ call: makeGuardedEthCall(...) }`. Or 1b-iii a rendu `opts.call` **REQUIS** (`ethereum.ts:92-93 : if (call === undefined) throw`). Sur l'arbre fusionné : toute course `--eth` via collect LÈVE toujours ⇒ capté en `faults[]` (try/catch `collect.ts:735-739`) ⇒ **la jambe ETH ne produit jamais de fill** (fail-CLOSED : jamais un fetch non budgété, jamais de fuite de clé). Le tuyau « jambe ETH gardée » est prouvé EN ISOLATION (IT-4) mais son consommateur déclaré (course collect `--eth`) N'EST PAS câblé — déclencheur tiré non plié (la section ADR 1b-iii le DÉCLARE : « tant que 1b-ii ne branche pas … déclencheur = G1 1b-ii » ; ni 1b-ii ni le pli ne l'ont fait). **Le bloqueur réel n'est PAS l'attribut réseau** : IT-4 construit un client keyless SANS network (`openGuardedClient({}, limits, dir, cycles, {})`, coût 0) ; c'est que le client `c` de runMain n'ouvre QUE les opérateurs de `--operators` (Solana) — les labels `GET_LOGS_KEYLESS_LABELS` (ETH) ne sont pas dans ses `cycles`. **Correction** : câbler `liveEthSwaps(…, { call: makeGuardedEthCall(ethClient) })` où `ethClient` est un SECOND client garde dont les `cycles` couvrent les labels keyless ETH, **tel que l'IT-4 le construit** (question `network` laissée à l'implémenteur, non prescrite) ; + un IT non-LLM de la composition **collect→eth** (aujourd'hui INEXISTANT : `collect.test.ts` ne teste que le `parseArgs` de `--eth`, IT-4 appelle `liveEthSwaps` DIRECTEMENT — d'où le vert malgré le non-câblage). **Corriger AUSSI la table Tuyaux 1b-iii** : la ligne « jambe ETH gardée » déclare sortie = « course eth Bell (fills TSLAon) » / test = IT-4, mais IT-4 ne prouve PAS cette sortie (il prouve `liveEthSwaps` en isolation). **À clore AVANT toute course `--eth` / avant que la course eth de Bell passe `built`** (règle Branchement). Non bloquant maintenant (Bell `upcoming`, fail-closed, aucun chemin servi).

- **C-G2-B — section ADR 1b-ii absente de l'union (error_origin: fold).** L'ADR a les amendements 1b-0/1b-i/1b-iii mais PAS de section datée 1b-ii (Tuyaux collect/crosscheck). Le rendu 1b-ii §7 item 6 l'avait déférée à l'orchestrateur ; le pli ne l'a pas insérée. Mission : « ADR = union (sections 1b-i, 1b-ii, 1b-iii) » ⇒ union incomplète. **Correction** : insérer la section 1b-ii (texte proposé dans le rendu 1b-ii §7 item 6).

- **C-G2-D — chiffre R-25 stale au rendu G1 1b-ii (mineur).** Rendu §3 = 674 ; réel = 680 (+6 ins). Sous la borne. À corriger pour l'exactitude de provenance. (Idem 1b-iii §7 : 415 annoncé vs 465 réel.)

- **C-G2-E — sha stale dans la PROSE de l'ADR-U4b D4 (mineur, hors périmètre 1b).** D4 liste `u4b-scores.mjs = 9ad20666…` alors que le blob réel est `2f9a31f6…` (le rendu G1 était juste). Le fichier gelé lui-même est byte-identique à `c10c13d` ; valeur historique périmée dans la prose, propriétaire = mainteneur de cet ADR. Observation.

## Notes de non-défaut vérifiées
- `makeBudgetedCall` **n'est PAS du code mort** : consommateur vivant sur le chemin offline unité (`collect.ts:626`, dual-path D-1) + ~10 tests ; universe-cli.ts ne l'importe plus (migration 1b-i faite). CR-2 fermé.
- `statusOf`/`isSolRevert`/`isTransient` lisent `.code`/`.name` (quorum.ts:52/62/132), `SolRpcError` supprimé — 429-streak précis (item 1b-i n°3) fermé.
- Pli **m4** confirmé : `guard-collect-1bii.test.ts:187-188` assert `cashKeyReads == []`.
- Ripple 1b0-E : test DÉCLARATIF (déclaré) ; M5 (`WRONG-CYCLE`) prouve la non-vacuité (KILLED).
- Grep : une SEULE racine `fetch_only_inside_client` couvre tout apps/bell/src (pas de duplication du grep racine) ; les tests par-fichier sont des couches étroites complémentaires.

---

Fichiers durables pour l'orchestrateur : rapport `F:\tmp\g2-garde1b\G2-lot-garde-helius-1b-i-ii-iii.md` ; logs oracle `F:\tmp\g2-garde1b\logs\` ; harnais rejoués `F:\tmp\g2-garde1b\harness\{h1i,h1ii,h1iii,h-g2-crosslot}.mjs` + logs `F:\tmp\g2-garde1b\logs\mut-*.log` ; preuve reconcile `F:\tmp\g2-garde1b\reconcile\`. Clone de travail (non committé, R-20) : `F:\tmp\g2-garde1b\tree` @ `14784ee`, `git status` vide.
