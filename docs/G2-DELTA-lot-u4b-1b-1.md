# G2-DELTA U-4b-1b-1 labeler (reprise) — PASS

Modèle résolu : claude-opus-4-8[1m]

# G2 — lot U-4b-1b-1 « labeler paramétré » (ruling QF-2) — relecteur, contexte frais

Relecteur G2 `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni), 2026-09-22. Instance neuve. **Toutes les vérifications 1-8 REFAITES par moi** (jamais lues dans le rendu G1). Rapport durable : `F:\tmp\g2-u4b1b1\G2-lot-u4b-1b-1.md`.

## Discipline (preuves)
- Clone `git clone --no-hardlinks --branch lot/u4b-1b-1 F:/Monark F:/tmp/g2-u4b1b1/tree`, `HEAD=2cbdea2` (= mission), fourche `a56e739` (`merge-base` confirmé). node_modules par `mk-nm.ps1`. **A-2** : `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-u4b1b1\tree\packages\rpc-guard\src\index.ts` (clone-local).
- **Aucun commit** (reflog clone = `2cbdea2` ; fusion à blanc `--no-commit` puis `--abort`). **Aucune écriture hors `F:\tmp\g2-u4b1b1\`** (`--out` temporaires ; `TEMP/TMP/TMPDIR` forcés sur `ostmp`). **`F:\Monark` non touché** (status propre). **A-7** : aucune variable d'env affichée ; tout sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`. node v24.15.0.

## 1. Diff / gel des 8 / tranche réducteur — **PASS**
- `git diff --name-status a56e739 2cbdea2` = **3 fichiers exactement** (`M u3-realized.d.mts`, `M u3-realized.mjs`, `A test/u3-realized-param.test.ts`) ; `a56e739..HEAD` = **1 commit**. **Aucun `docs/adr/**` touché** (corps ADR intact ; amendement non committé).
- **8 gelés byte-identiques** — tous **OID-IDENTICAL** (`git rev-parse a56e739:<p>` == `HEAD:<p>`) : `u4b-scores 2f9a31f6` · `u4b-reduce a5e66cd3` · `record-u4b-calib 5733daeb` · `wadray 7bee76fc` · `abi 3376eb08` · `l1-split 9206df91` · `rpc.ts 0e232519` · `calib-digest 3603265d`.
- **Labeler** : base `755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4` → HEAD `e8e045350a1c22dc23b0ba223d65323729420c76abe95c249feb1bc7ebd00a87` (= DELIVERED).
- **Tranche réducteur pur** = `1c7574acd325ab75e6760f50d6743e3d9d39cd5565abbf3d497d4884317a6ada` sur `git show a56e739:` **ET** sur le livré ⇒ condition (i-a) satisfaite, **pas de 9ᵉ sha gelé**.

## 2. Égalité e2 (preuve centrale) — **PASS**
`v2-e2-equality.mjs` : import du réducteur LIVRÉ, rejeu de `U3-inputs.jsonl` committé → `--out` temporaire, comparaison au committé. `parseArgs([]).events`/`.rawlogsSha`/`EVENTS`/`RAWLOGS_SHA` == littéral e2 indépendant. **198 lignes ; byte-égal (LF) = true ; LF sha produit = committé = `b4d93590…`** (= pin). **Blob LF-only levé** : `core.autocrlf=true` fausse `git show` ; le blob STOCKÉ (`git cat-file blob`) est **0 octet CR**, sha brut == sha LF (`b4d93590` fixture, `e8e04535` labeler). `main([])` nu ne peut PAS rejouer e2 hors-ligne (`--rawlogs` requis `:475` ; « finalized » non caché `:685-698` ⇒ ≥2 fetch) — le rejeu réducteur EST la forme exécutable.

## 3. Sécurité — **PASS**
- `process.env` = **1 occurrence** (`grep -o|wc -l` = 1 comme le test ; `grep -c` = 1) : ligne 701, injection `deps.env`. **0 sonde de clé** (`env.(CHAINSTACK|HELIUS|POLYGON|DATABENTO|U3_MIN_INTERVAL_MS)` = 0). `ENV_ARCHIVE` et `U3_MIN_INTERVAL_MS` **ABSENTS**.
- `--archive-operator` résolu **uniquement** via `openArchiveLeg → openU4GuardedClient → openGuardedClient(env,…)` ; `u4-guard.mjs` sans aucun `process.env` [lu] ; `CHAINSTACK_LABEL="chainstack"`.
- **Refus payant, 0 fetch** (`v3-paid-refusal.mjs`, env portant clés `.invalid` factices) — **8/8 OK** : `chainstack`/`helius` + variantes de casse `Chainstack/HELIUS/CHAINSTACK/cHaInStAcK` **sans** `--allow-paid` ⇒ `/refused fail-closed without --allow-paid/`, 0 fetch ; `Chainstack` **avec** `--allow-paid` ⇒ `/not a supported guarded paid leg/` (garde case-exact), 0 fetch ; `chainstack` **avec** `--allow-paid` sans budget ⇒ `/--ledger-dir is required/`, 0 fetch. **Double barrière**.
- `--allow-paid` → provenance (`meta.allow_paid`, l.651, conditionnel) : [lu] + négatif exécuté (2b-bis : indéfini en keyless).

## 4. Sondes A-8 + footgun `--out` — **PASS** + jugement
- **A-8, valeurs assertées PAR MOI** (`v4b-synthetic-labels.mjs`, vrai `main()`, seul `fetch` bouchonné = D-3, 119 fetch) : hex `eth_call` → `oracle=0x54586be6…`, `base_currency_unit="100000000"` ; objet `eth_getBlockByNumber` → `last_block=1000` ; **tableau nu** `eth_getLogs` → `deficit_native="123456"` ; + `repayment_native="1000000"`, `seized_native="500000000000000000"`, base null, ligne deficit `{amount:"123456", kind:"in_event"}`, **meta = exactement 11 clés**.
- **Footgun `--out` DÉMONTRÉ** (`v4-footgun-out.mjs`) : épisode synthétique SANS `--out` ⇒ écrase les 4 fixtures committées, `U3-realized.jsonl` passe `b4d93590` → `c6e5010e…` (≠ pin) ; **restauré** `git checkout HEAD -- …/ukemi/u3/`, working==HEAD==`b4d93590`, porcelain propre.
- **Jugement** : ruling (1) ferme le footgun **procéduralement** ; recommandation défense-en-profondeur (non bloquante) : `--out` requis, OU refus si `out===null && events!==EVENTS`. Sans effet sur la byte-identité e2.

## 5. Mutants — 6 de G1 + 4 à moi — **PASS**
`v5-mutants.mjs` sur MON clone (jamais le worktree G1) ; sondes GREEN sur fichier propre (non-vacuité). **10/10 RED, tous restaurés byte-exact** :
- G1 (test nommé) : M1 defaults, M2 sha-not-verified, M3 paid-1label, M4 window-shifted, M5 env-probe, M6 reducer-sort.
- **G-A** whitelist casse-exacte au gate → V3 « Chainstack no-allow » RED. **G-B** case-fold au garde → V3 « Chainstack +allow » RED. **G-C** filtre `--operators` neutralisé → `v5-operators` RED. **G-D** sha longueur-seule → `v5-sha` RED (distinct de M2).
- `file_restored_byte_exact=true` (e8e04535) ; `reducer_slice_unchanged=true`.

## 6. Oracle `env -u` — clone propre ET fusion à blanc — **PASS**
- **Clone propre** : 7/7 gates **exit=0** ; **816 / 815 / 0 / 1** ; skip = `fetch_only_inside_client` (Bell, « # until 1b », **pré-existant**, hors lot).
- **Fusion à blanc** : la mission cite `56df764` ; **`lot/etude-suite` a AVANCÉ depuis le snapshot** (tip courant `40896ea`, `56df764` ancêtre) — fusion faite contre `56df764`. Fusion **PROPRE (aucun conflit)** ; `mk-nm.ps1` rejoué sur l'arbre fusionné. Oracle fusionné : 7/7 **exit=0** ; **816 / 815 / 0 / 1** — **fail==0, skipped==1** (ancre). Fusion annulée ; clone propre ensuite.

## 7. R-25 — **PASS** + jugement couture
- Pathspec **VERBATIM `ci.yml:65`**, `a56e739...HEAD` : `3 files changed, 572 insertions(+), 200 deletions(-)` ⇒ **CHANGED=772** (`.d.mts +50/-0`, `.mjs +297/-200`, test `+225/-0`). Borne CI `VIBEGATES_PR_LIMIT=1205` (`ci.yml:43`), interne 1150. **772 < 1150 < 1205 ⇒ PAS de STOP**.
- **Couture (retirer `try/finally`) : REFUSÉE** (attendu). Le `finally :676-678` déverrouille la jambe payante sur tout chemin de sortie ; le retirer dégrade **E-1** (récupération servie NARABI-OPS-1d). R-25 déjà sous borne ⇒ aucun bénéfice.

## 8. Amendement ADR + prereg §5c/§5d — **corrections formées**
- **Amendement ADR** (`F:\tmp\u4b1b1\ADR-amendement-labeler.md`) : tableau **9 sha** cohérent avec mon V1 (8 gelés idem + labeler `755b3a38`→`e8e04535` **RE-GELÉ (QF-2)**) ; concorde avec ADR-U4b §3 (déc. 126) qui liste le labeler « gel déféré » `755b3a38` (ADR l.207). Libellé **« re-gel QF-2 »** présent ; **A-6 levée** ; **Tuyaux (F-1)** présents ; résidus R-1/R-2 formés.
- **Ligne figée** (amendement §4) alignée sur les flags réels + rulings (1)/(2)/(4). **Ruling (2) prouvé exécuté** (`v8-frozen-operators.mjs`) : `--operators drpc.org,mevblocker.io,pocket.network,publicnode.com,blxrbdn.com` résout **exactement** à ces 5 opérateurs (aucune jambe 0 en silence, **1rpc.io exclu**).
- **Prereg DRAFT STALE** (commit prereg SÉPARÉ, hors périmètre des 3 fichiers) : (a) §5d l.264 décrit encore `ENV_ARCHIVE :273`/`U3_MIN_INTERVAL_MS :282` (ruling 4 non appliqué) ; (b) §5d bloc `:266-273` manque `--events`/`--rawlogs-sha`/`--out`/`--operators` et pointe le prereg U-3 (rulings 1/2/3) ; (c) §2 l.127 épingle le labeler à `755b3a38` avec cadrage **(β)** — or **QF-2 tranche (α)** : §2 doit épingler **`e8e04535`** (sinon la vérif « ÉCART=STOP » du prereg bloque). Le worker a nommé (a)/(b) dans l'amendement §4.

## Jugements demandés
- **Refus code `--out`** : recommandé (défense-en-profondeur) ; couvert procéduralement par ruling (1). Item formé, déclencheur = 1ʳᵉ course figée.
- **Exclusion `1rpc.io` par code** : le défaut (sans `--operators`) **admet 1rpc.io** — prouvé : `operators: publicnode.com, drpc.org, mevblocker.io, 1rpc.io, blxrbdn.com, pocket.network` — ce qui contredit l'invariant que le fichier s'impose (en-tête `:2-4`, L-6) alors que le labeler fait du `getLogs` lourd. Recommandation : denylist par code (constante dans le labeler ; `rpc.ts` gelé, ne pas toucher). Sans effet sur `b4d93590` (les lignes realized ne portent pas `providers`). Item formé. Couvert procéduralement par ruling (2).

## VERDICT G2 : **PASS-AVEC-CORRECTIONS**
Le lot (3 fichiers) est **byte-correct et fusionnable** : diff = 3 fichiers, 8 gelés + tranche réducteur byte-identiques (blobs LF-only vérifiés), égalité e2 `b4d93590` prouvée, sécurité fail-closed (double barrière, 0 fetch, 0 sonde d'env), 10/10 mutants RED, oracle 816/815/0/1 sur clone ET fusion à blanc `56df764` (fail=0, skip=1), R-25=772 sous borne, couture `try/finally` refusée (E-1).

- **UNE correction dans le périmètre des livrables** (artefact du lot) : amendement ADR §4 → figer `--prereg-file docs/PLAN-u4b-prereg.md` (ruling 3, tranché) au lieu de « décision orchestrateur ».
- **HORS périmètre des 3 fichiers** (le prereg se committe séparément, QF-2), **porté en INFORMATION au checkpoint-2** : prereg §2 → `e8e04535` (QF-2 α) ; §5d → retirer prose sondes d'env `:273/:282` (ruling 4) + remplacer le bloc de commande par la ligne figée alignée (rulings 1/2/3). Nommé par le worker (amendement §4) — aucune dette nue.
- **Recommandations défense-en-profondeur** (décision orchestrateur, non bloquantes) : garde code `--out` ; denylist code `1rpc.io`.

La clôture n'est jamais auto-déclarée par un générateur : le siège CA-1..CA-11 (checkpoint-2) est celui du validateur-humain Fable 5.1 (instance séparée), pas le mien (relecteur Opus 4.8). Ce verdict est un intrant reproductible, vérifiable adversarialement (R-21).

Artefacts sous `F:\tmp\g2-u4b1b1\` : `G2-lot-u4b-1b-1.md` (rapport durable), `v2-e2-equality.mjs`, `v3-paid-refusal.mjs`, `v4-footgun-out.mjs`, `v4b-synthetic-labels.mjs`, `v5-operators.mjs`, `v5-sha.mjs`, `v5-mutants.mjs`, `v8-frozen-operators.mjs`, `run-oracle.sh`, `clean/summary.txt`, `merge/summary.txt`.
