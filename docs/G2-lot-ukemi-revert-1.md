# G2 — lot UKEMI-REVERT-1 (relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-ukemirevert/G2.md` (sha256 81fec4e9844056bc95435f2715f5390995ee222ff6982e348b8a5d2c01f0be16). Verdict : PASS-AVEC-CORRECTIONS (C-1 R-1 couvre les deux unités — témoin keyless à `data` rejetée classé nu, indiscernable à l'indicateur ; C-2 supersession étendue à ADR-GARDE-HELIUS :299-301 et :366-368 ; C-3 tuyaux `u4-oracle-path.mjs:189`/`u4-redraw.mjs:92` + consommateurs keyless-seuls inchangés ; C-4 citations `CHANTIERS.md:1081`, D6 qualifié, PROV-MODEL-1 :1857+:2085). Corrections C-1..C-4 appliquées par l'orchestrateur au texte de l'amendement AVANT insertion (ADR-GARDE-HELIUS (A), ADR-U4b (B)) et au rendu G1 (`c8d45e7` sur le lot) ; items G7 : TEST-NAME-HELD-1 (O-9), REVERT-WITNESS-CHAR-1 (test de caractérisation côté témoin, recommandation C-1). Preuves sous `F:/tmp/g2-ukemirevert/` (matrice 220 cas, rejeu recorder servi, mutants 16/16 + 13, oracle 7 × 0 sur lot/fusion/pointe, R-25 657).

---

Modèle résolu : claude-opus-5-5[1m]

# G2 — REVUE du lot UKEMI-REVERT-1 (`lot/ukemi-revert-1` @ `ca9fa55`, base `4a2f69f`) — rendu au fil de l'eau

Relecteur `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, décision 133), effort max, instance séparée à contexte
frais. Aucun commit, aucun workflow (R-20) ; aucune écriture sous `F:\Monark*` ni `F:\course-ukemi` ; 0 appel réseau (0 RU).
Clone isolé `F:\tmp\g2-ukemirevert\clone` (`git clone --no-hardlinks -b lot/ukemi-revert-1 F:/Monark`), TEMP/TMP/TMPDIR sous
`F:\tmp\g2-ukemirevert\tmp`, ceinture A-7 `env -u` × 8 sur tout test/oracle/mutant/rejeu ; aucune variable affichée.

## Journal (date -u)

- 2026-09-23T12:06:52Z — début ; clone isolé `ca9fa55` (propre) ; `npm ci --ignore-scripts --cache F:/tmp/npm-cache` exit 0 ;
  `require.resolve('@monark/rpc-guard')` = `F:\tmp\g2-ukemirevert\clone\packages\rpc-guard\src\index.ts`.
- Orientation (lecture seule) : rendu G1 (clone `docs/G1-lot-ukemi-revert-1.md`), `F:\tmp\ukemirevert\{ADR-amendement.md,
  DELIVERED.sha256, lot.patch, probe\probe-result.json, mutants\mutants.mjs, mutants\mutants-result.json, oracle\final2\codes.txt,
  r25\r25.json}`, avis advisor (`F:\Monark` @ `b07878f`, lecture seule), `docs/CHANTIERS.md:1076-1082`, diag réel
  `F:\course-ukemi\record\U4-book-23414968.raw.json.diag.json`, `F:\course-ukemi\record-t2.sh` (lecture seule, aucune valeur
  d'env), code : `classify.ts`, `errors.ts`, `transport.ts:90-248`, `rpc2.ts` (entier), `record.ts:280-440`, `book.ts:60-110`,
  `prefetch.ts:30-70`, tests neufs et diffs de tests ; consigne `docs/CONSIGNE-STANDARD-G1.md` de la pointe etude-suite
  (D-1-bis, REVIEW-TAP-1, A-13 lus).

- ~12:10Z — advisor intégré (après orientation, avant tout travail substantiel) : **« The advisor timed out »** — indisponibilité
  consignée, non contournée ; rappel prévu avant clôture.
- 12:12Z — point 1 (diff, A-6, DELIVERED) ; 12:15Z → 12:20Z — point 2 (matrice `quorum2`, 220 cas × 2 arbres) ; base `4a2f69f`
  en worktree détaché de MON clone (`F:\tmp\g2-ukemirevert\base`, `npm ci` exit 0, `require.resolve` dans `base`) ;
  12:22Z → 12:28Z — point 3 (rejeu, 12 exécutions) ; 12:31Z — oracle 7 portes lancé ; 12:31Z — R-25.
- 12:34:36Z — oracle du lot 7 × 0 ; 12:35:55Z → 12:36:10Z — harnais G1 rejoué (16/16) ; 12:37:41Z → 12:37:51Z — mutants propres
  (8/8 familles, 12/13) ; ~12:39Z — constat C-1 (matrice) ⇒ rejeu étendu (RKL/RKV) et **rejoué en entier** 12:41Z → 12:44Z (20
  exécutions, harnais final) ; 12:45Z — fusions à blanc (`merge-tree`) ; 12:46:49Z → 12:49:58Z — oracle `a0f47fe` ⊕ lot ;
  12:50:23Z → 12:52:03Z — N(pointe) ; 12:53Z — la pointe a avancé à `83b8904` (6 fichiers `docs/**` seulement) ⇒ fusion à blanc
  refaite + oracle `83b8904` ⊕ lot lancé ; 12:58:12Z — 7 × 0, N + 16 ; rendu rendu DURABLE (ce fichier) AVANT l'appel advisor
  de clôture.
- ~13:00Z — **advisor intégré de clôture** (canal intégré, réponse REÇUE) : verdict et classement de C-1 (documentaire, borné) non
  contestés ; demandes appliquées : (1) R-2 et R-3 nommés au §7 ; (2) intégrité des entrées du G1 consignée au §1 (5/5 sha +
  `lot.patch` rejoué en index temporaire = blobs de `ca9fa55`) ; (3) clôture ci-dessous, sha256 du rendu porté dans la réponse
  finale (il ne peut pas vivre dans le fichier) ; optionnel retenu : O-9 (item TEST-NAME-HELD-1).

## 1. Périmètre du diff, invariants A-6, DELIVERED (rejoué)

- `git diff --name-status 4a2f69f..ca9fa55` = **10 fichiers** = les 9 de `DELIVERED.sha256` + `docs/G1-lot-ukemi-revert-1.md`
  (A). Le doc G1 commité est **byte-identique** à `F:\tmp\ukemirevert\G1.md` (sha256 `85ac779d…b446f` des deux côtés).
- **DELIVERED 9/9** : sha256 du blob `ca9fa55:<f>` ET du fichier sur disque du clone = valeur de `DELIVERED.sha256`, 9/9 (attribut
  `eol=lf` : `git ls-files --eol` = `i/lf w/lf`).
- **A-6 15/15** (blobs `4a2f69f` et `ca9fa55`, `tr -d '\r' | sha256sum`) : les 9 gelés = valeurs du prereg §2
  (`docs/PLAN-u4b-prereg.md:116-124`) aux DEUX commits ; prereg `1971d9b1…2f49` ; `book.ts` `cb1ba53c…`, `resume.ts` `8954c497…`,
  `ukemi-guard-record.test.ts` `74522404…`, `transport.ts` `f95567f3…`, `errors.ts` `8622947f…` : SAME (et `prefetch.ts`
  `47bf52ce…` SAME, en sus). `apps/bell/**` : 0 ligne de diff.
- **Intégrité des ENTRÉES du G1** (`F:\tmp\ukemirevert\*`, sha256 = valeurs déclarées au rendu G1) : `lot.patch` `c0dbd6a9…ddac`,
  `mutants\mutants-result.json` `a7ef1081…b35a`, `mutants\mutants.mjs` `345fbf9e…2c3e`, `r25\r25.json` `f4de4615…625e`,
  `probe\probe-result.json` `e1700cf0…78ec` : **5/5 égaux**. `lot.patch` appliqué sur `4a2f69f` dans un INDEX TEMPORAIRE (`git
  read-tree` + `git apply --cached`, aucun worktree touché) ⇒ arbre `0ae362b9…` dont les 9 blobs = ceux de `ca9fa55` (seule
  différence : le doc G1, hors patch) ⇒ le G2 revoit les octets que le G1 a livrés ; blobs de la garde de relance (`record.ts`
  `24ad511f…`, `rpc2.ts` `f5d6298d…`, `classify.ts` `4c2fa9e7…`, `index.ts` `6eb18dea…`) = valeurs du rendu G1.
- **`isRpcRevert` byte-identique** : sha256 du texte de la fonction (de `export function isRpcRevert` au `}` fermant) =
  `90589063…2f045` base ET lot ; `classify.ts` du lot **commence par** le `classify.ts` de la base (ajout pur en queue, 23/0).

## 2. Sémantique de `quorum2` — lue, puis rejouée (matrice indépendante des tests du G1)

Lecture (`rpc2.ts:192-235` du lot) : boucle SÉQUENTIELLE inchangée (`for … got.length < 2`, liste = `live(providers)`, distinctness
par `operatorOf`) ; branche ajoutée `:215` : `isBareRevert(e) && e.unit !== "keyless"` ⇒ `held.push` + `seen.add` + `lastErr = e`,
**sans** `cooldownUntil.set` (le banc + refroidissement 25 s reste `:216`, = `:196` de la base, lignes vérifiées) ; appariement après la boucle
`:222-226` (un seul `got` + un `held` + `w.kind === "revert"` + `w.witness ∈ {bare, data}`) ; `w.witness` n'est posé que pour
`e.unit === "keyless"` (`:214`) ; `revertKey` (`:43-45`) inchangé ; aucun message comparé entre unités (clé de classe `revert:bare`).

Harnais `F:\tmp\g2-ukemirevert\matrix\matrix.mjs` (sha256 `d86be09e…84c9`) : `makeUkemiPool` de l'arbre donné, `call` = le VRAI
transport de l'arbre (`resolveOperators(env).transport` : `RpcError` construit comme en course — unité, indice fermé, `data`
validée), SEUL `globalThis.fetch` bouchonné, env = objet factice littéral (hôtes `.invalid`), ceinture A-7. Chaque cas : lecture 1,
puis lecture 2 « tout le monde répond une valeur » (révèle un refroidissement), compte du hook d'erreurs du transport, tirages
par hôte. **220 cas × {lot `ca9fa55`, base `4a2f69f`}** (`matrix-lot.json` `672c4488…ba4e`, `matrix-base.json` `7444c0ea…6a48`).
Formes : `nu` = forme MESURÉE `{code 3, "execution reverted"}` sans `data` ; `nu0x` ; `nu32000` ; `data` (`0xcafebabe`) ; `reason`
(`"execution reverted: Ownable: …"`, sans data) ; `val` ; `fault` (HTTP 503) ; `keyhex` (data = hex de la clé factice, rejetée c-bis) ;
`long` (data 4 100 car. > 4 096, rejetée sur TOUTE unité) ; `code32602`.

Pool de l'incident `[drpc.org, chainstack]` (payant apposé en dernier, `record.ts:329`) — issue lot / base, puis lecture 2 :

| keyless \ payant | nu, nu0x, nu32000 | data | val | fault | reason (payant) | keyhex / long (payant) | code −32602 |
|---|---|---|---|---|---|---|---|
| nu / nu0x / nu32000 | **Concordant** (base NoQuorum) ; L2 valeur (pas de refroidissement ; base : NoQuorum) | Disagreement (=) | Disagreement (=) | NoQuorum (=) | **Concordant** (D6) | **Concordant** (R-1) | NoQuorum, refroidi (=) |
| data | **Disagreement** (base NoQuorum) | Concordant (=) | Disagreement (=) | NoQuorum (=) | Disagreement | Disagreement | NoQuorum (=) |
| reason | **NoQuorum** (D-2) ; L2 valeur | Disagreement (=) | Disagreement (=) | NoQuorum (=) | NoQuorum | NoQuorum | NoQuorum (=) |
| val | **NoQuorum** (D-1) ; L2 valeur (base : NoQuorum) | Disagreement (=) | valeur (=) | NoQuorum (=) | NoQuorum | NoQuorum | NoQuorum (=) |
| fault | NoQuorum ; **L2 NoQuorum** (base : L2 valeur) — cf. O-2 | NoQuorum (=) | NoQuorum (=) | NoQuorum (=) | idem nu | idem nu | NoQuorum (=) |
| **long (keyless, data rejetée)** | **Concordant** — cf. C-1 | Disagreement (=) | Disagreement (=) | NoQuorum (=) | Concordant | Concordant | NoQuorum (=) |

(= : identique à la base.) Autres groupes (même harnais) :
- **B** `[chainstack, drpc.org]` (payant tiré EN PREMIER) : **0 cas sur 80** ne diffère du groupe A ⇒ issue indépendante de l'ordre.
- **C** deux PAYANTS réels (`helius` unité `credits` + `chainstack` unité `ru`, erreurs construites par le vrai transport — plus fort
  que le synthétique du G1) : nu × nu, nu × nu0x, data × nu, val × nu ⇒ **NoQuorum** (D6 : jamais deux payants nus concordés) ;
  data × data ⇒ Concordant (inchangé).
- **D** `[drpc, mevblocker, chainstack]` : si les deux keyless forment deux issues (nu/val/data), **chainstack n'est PAS tiré**
  (0 fetch) — le payant n'« attend » rien, il n'est pas atteint ; s'il est atteint (un keyless en faute), il est tenu puis apparié
  au keyless restant (nu ⇒ Concordant, data ⇒ Disagreement, val ⇒ NoQuorum).
- **E** `[chainstack, drpc, mevblocker]` (payant tenu AVANT tout keyless) : mêmes issues que D ; quand les deux keyless répondent, la
  paire keyless décide et le payant tenu est ignoré (la boucle continue après un `held`, qui ne compte pas dans `got`).
- **F** deux payants nus + un keyless : nu ⇒ Concordant (UN payant apparié), data ⇒ Disagreement, val ⇒ NoQuorum.
- **Invariants mesurés** : compte du hook d'erreurs du transport (= `errors_by_operator` du recorder, `record.ts:354`) identique
  lot/base **220/220** ; tirages de la lecture 1 (fetch par hôte) identiques **220/220** (ordre de tirage inchangé) ; message du
  `NoQuorumError` non admis identique à la base et nommant le payant tenu par son indice fermé ; `rpc_errors` : une entrée par
  tentative, inchangé en compte (point 3).

Conformité à la doctrine : ADR-U1 D3 V-1 « un revert ne bench pas » — le revert payant nu n'est plus benché ni refroidi (L2 valeur
dans tous les cas `nu`) ; D6 « jamais deux payants nus concordés » — groupe C ; R-A — `isRpcRevert` inchangé ; D-1 (valeur ⇒
NoQuorum) et D-2 (raison sans data ⇒ NoQuorum) — conformes aux rulings ; aucun message comparé entre unités — clé de classe.

## 3. Rejeu du cas réel par le recorder SERVI (indépendant du test (f) du G1)

Harnais `F:\tmp\g2-ukemirevert\replay\replay.mjs` (sha256 FINAL `747cf8c1b33a79c1f85d66cdc9395be40f443839b70d9ae61ee7c4b0aa037c59` ;
une 1re version `27803a3c…469b` a donné les mêmes issues et digests, puis a été étendue des variantes RKL/RKV du constat C-1 — les
20 exécutions ci-dessous sont TOUTES rejouées avec la version finale, 12:41Z → 12:44Z) : `runRecorder` de l'arbre donné ; corps
RECONSTITUÉS des mesures, jamais retapés : le revert nu depuis `probe-result.json` (champs assertés : HTTP 200, code 3, message
exactement `execution reverted`, `data` absent, 0 clé en sus, les 2 opérateurs), le corps 408 = `message` des 8 entrées 408 du diag
RÉEL (assertées identiques). Drapeaux = `F:\course-ukemi\record-t2.sh` **verbatim** (`--operators drpc.org,tenderly.co,chainstack
--min-interval-ms 100 --retries 6 --backoff-ms 1000 --backoff-cap-ms 30000 --heartbeat-every 500 --concurrency 8 --floor 12916
--max-ru 166882 --max-calls 166882 --method-caps eth_call=83441,eth_getLogs=6000,eth_getBlockByNumber=4000 --prereg-file
docs/PLAN-u4b-prereg.md --prereg-sha 1971d9b1… --labeler-sha cb020425… --concordance-out --resume --out`) SAUF (déclaré) :
bloc/fenêtre du fixture (`weth-book.fixture.json` @23545087, FROM = B − 3000), fichiers sous `F:\tmp`, clé factice `.invalid`,
**vrai `sleep` par défaut** (aucun sommeil injecté ; le G1 injectait). Variantes : **R1a** = 8 × 408 sur la 1re tentative des 8
premières clés `eth_call` drpc (répartition du G1 (f)) ; **R1b** = 7 × 408 + 1 × 408 sur la 1re tentative drpc de la lecture
`description()` revertante elle-même (revert servi au retry) ; **R0** = même composition, `description()` servie comme VALEUR
(ABI `""` canonique : offset 0x20, longueur 0) des deux côtés, aucun revert = **livre attendu par un chemin indépendant**. Deux modes
de source : `usdc` (source du fixture, suppléante du G1) et **`gho`** (`getSourceOfAsset(USDC)` re-pointé sur la VRAIE source GHO
`0xd110cac5d8682a3b045d5524a9903e031d70fccd`, lecture `description()` = `0x7284e416` : `to`/`data` de l'incident verbatim).

| arbre | variante | issue | `book_digest` | `oracle_description` de la source |
|---|---|---|---|---|
| lot `ca9fa55` | R1a / R1b, usdc | **exit 0** | `f1ebccda…2b92` (= R0 usdc = épingle G1) | `""` |
| lot `ca9fa55` | R1a / R1b, **gho** | **exit 0** | `fb7d12a4c195927fa7d2fc2865984a8d1e4a0d0912681f4114c20aeb32183856` (= R0 gho) | `0xd110…fccd` → `""` |
| lot / base | R0 usdc / gho | exit 0 | `f1ebccda…` / `fb7d12a4…` (identiques lot et base : attendu indépendant de l'arbre) | `""` (valeur) |
| **base `4a2f69f`** | R1a / R1b, usdc / gho | **`NoQuorumError`** (4/4) | — (pas de livre) | — |

- Lot (R1a gho) : `errors_by_operator` {drpc 10, chainstack 2} ; `rpc_errors` = 8 × 408 + 2 × drpc `{"message":"execution
  reverted","code":3,"data":"absent"}` + 2 × chainstack `{"message":"execution reverted, revert","code":3,"data":"absent"}` ;
  `description()` lue 2 × par opérateur (prefetch + relecture `recordBook`) ; concordance `chainstack|drpc.org` 28/0 (R0 : 27/0) ;
  cache : les 2 descriptions réussies, aucune ligne pour la source revertante ; RU chainstack 58 (R0 : 56 ⇒ la relecture du revert
  coûte +2 RU, conforme à l'ADR) ; 0 `.lock` ; 0 octet de clé/hôte dans livre, concordance, cache, diag.
- **Base — mort reproduite À L'OCTET** (R1a/R1b × usdc/gho, 4/4) contre le diag réel `U4-book-23414968.raw.json.diag.json` :
  `error` (`{"name":"NoQuorumError","message":"eth_call: quorum needs 2 providers (last: rpc-guard: RpcError for operator
  'chainstack' (code 3): execution reverted, revert)"}`) **octets égaux** ; `rpc_errors` **égaux dans l'ordre** (les 10 entrées :
  8 × 408, puis drpc revert, puis chainstack revert, sans champ `data` sur la base) ; `errors_by_operator` {drpc 9, chainstack 1}
  **égal**. Champs non comparables par construction (fixture ≠ course) : `ts`, `calls_total`, `by_operator_method`, `n_at_risk_seen`,
  `ukemi_sha`.
- Variantes du constat C-1 (sans 408) : **RKL** = le revert KEYLESS porte une `data` REJETÉE par `validateRevertData` (hex de 4 100
  car. > 4 096), chainstack répond la forme nue mesurée ⇒ lot : **exit 0**, livre `""`, concordance 28/0, journal drpc `data:"absent"` ;
  **RKV** = même chose avec une `data` keyless VALIDE (`0xcafebabe`) ⇒ lot : **`QuorumDisagreementError`**, journal `data:10`. Base :
  NoQuorum dans les deux. Le diag BASE de RKV contient les octets `cafebabe` (journal d'avant le lot), celui du LOT non (effet D-3
  mesuré).
- Résumés : `out-<arbre>-<variante>-<mode>\summary.json` (20) ; sha256 : lot R1a gho `8d45ab5b…17a9fa2`, lot R1a usdc `f7e59ca5…35c91`,
  lot R1b gho `6b96385e…1f9e`, lot R0 gho `6100a1ab…aee5b`, lot RKL gho `f9880186…211d468`, lot RKV gho `f30f0c61…96eff`, base R1a gho
  `9e440061…5b78b65e`, base R1a usdc `fd43154b…5160f`, base R1b gho `a3ef768d…c248`.

## 4. Mutants

### 4a. Harnais du G1 rejoué, CHEMINS SEULS

Copie de `F:\tmp\ukemirevert\mutants\mutants.mjs` (sha256 `345fbf9e…2c3e` = valeur du rendu G1) où SEULES les 3 constantes de
chemin changent (`diff` = lignes 15-17 : `TREE` → `F:/tmp/g2-ukemirevert/mut`, `OUT_DIR`, `TMPD`) ; copie `a739f8a7…4bd3`.
Arbre de mutation DÉDIÉ `F:\tmp\g2-ukemirevert\mut` (clone `ca9fa55`, `npm ci` exit 0, `require.resolve` dans `mut`), ceinture A-7.
12:35:55Z → 12:36:10Z : ligne de base verte (`ukemi-revert.test.ts` 12 ok, `bare-revert.test.ts` 4 ok, `exports.test.ts` 5 ok) ;
**16/16 tués par leur test NOMMÉ** ; 16/16 `muté ≠ origine` et `restauré == origine` ; arbre = `DELIVERED` 9/9 après
(`mutants-result.json` `718bba65…d169`, `run.log` `7ec9d21a…3f43`). Déclaré : ce harnais (écrit ~11:21Z) restaure par
`writeFileSync` sans `fsync` — il est antérieur à D-1-bis (`b48311d`, 11:15:47Z, sur etude-suite, hors de la base du lot) ;
rejoué tel quel (mission « chemins seuls »), risque borné par l'arbre dédié + contrôle `DELIVERED` après (cf. O-6).

### 4b. Mutants PROPRES du relecteur (13, dont les 8 familles exigées)

Harnais `F:\tmp\g2-ukemirevert\mutants\own\mutants-g2.mjs` (sha256 `bca353d1…bcb7`) : hunk exact compté == 1 dans node (A-13),
TAP + CRLF normalisé + byIntended ; **D-1-bis** (golden réécrit par descripteur + `fsyncSync` + fermeture, puis RE-LU et sha comparé,
abandon sinon) ; **REVIEW-TAP-1** (le TAP de CHAQUE exécution, ligne de base comprise, conservé : `own\tap\01..15-*.tap`, 15
fichiers) ; ceinture A-7 sur les enfants ; en-tête A-12. Ligne de base verte (12 ok / 4 ok). 12:37:41Z → 12:37:51Z.
Résultat `mutants-g2-result.json` `fd907ffe…30e9`, `run.log` `e2ee2fda…5f76` ; arbre propre avant ET après
(`git status --porcelain` vide), = `DELIVERED` 9/9.

| id | famille (mission) | mutation (fichier) | tueur NOMMÉ | issue |
|---|---|---|---|---|
| G1 | témoin keyless non exigé | condition d'appariement réduite à `w.kind === "revert"` (rpc2.ts) | `ukemi_revert_two_paid_bare_reverts_never_concord` | TUÉ |
| G2 | deux payants concordés | deux `held` appariés entre eux quand `got` est vide (rpc2.ts) | `ukemi_revert_two_paid_bare_reverts_never_concord` | TUÉ |
| G3 | bench/cooldown restauré | `cooldownUntil.set(p, …)` au SEUL appariement réussi (rpc2.ts) | `ukemi_revert_paid_bare_is_never_cooled_down` | TUÉ |
| G4 | message comparé | témoin « nu » si le message keyless CONTIENT `execution reverted` (rpc2.ts `witnessOf`) | `ukemi_revert_paid_bare_vs_keyless_reason_text_is_no_quorum` | TUÉ |
| G5 | `isRpcRevert` altéré | R-A ne benche plus `"0x"` (seulement `undefined`) (classify.ts) | `bare_revert_measured_wire_form_is_bare_for_keyless_and_both_paid_units` | TUÉ |
| G6 | indicateur fuyant une longueur > 0 pour un corps absent | `revertDataIndicator(e.data ?? e.detail)` (record.ts) | `ukemi_revert_paid_bare_pairs_with_keyless_bare_witness_through_run_recorder` | TUÉ |
| G7 | `revert:bare` concordé avec un gratuit AVEC data | re-clé inconditionnelle du témoin (rpc2.ts) | `ukemi_revert_paid_bare_vs_keyless_with_data_disagrees_fail_closed` | TUÉ |
| G8 | garde `unit !== "keyless"` inversée | `:215` `e.unit === "keyless"` (rpc2.ts) | `ukemi_revert_incident_replay_course_survives` | TUÉ |
| G9 | (sus) garde du rôle de témoin inversée | `:214` `e.unit !== "keyless" ? {witness}` (rpc2.ts) | `…pairs_with_keyless_bare_witness_through_run_recorder` | TUÉ |
| G10 | (sus) code −32000 retiré de `isBareRevert` | classify.ts | `bare_revert_requires_code_3_or_minus_32000` | TUÉ |
| G11 | (sus, EXPLORATOIRE) normalisation du texte keyless retirée | `e.message === BARE_REVERT_TEXT` (classify.ts) | — | **SURVIT** (sens fail-closed ; O-4) |
| G12 | (sus) `"0x"` exclu du nu (préférence (iii) de l'avis) | classify.ts | `ukemi_revert_paid_bare_0x_form_pairs_and_journals_0x` | TUÉ |
| G13 | (sus) le NoQuorum ne nomme plus le payant tenu | `lastErr = e` retiré de la branche tenue (rpc2.ts) | `ukemi_revert_paid_bare_vs_keyless_value_is_no_quorum` | TUÉ |

**Les 8 familles exigées : 8/8 tuées par leur test nommé** ; sus : 4/5 (G11 survivant, exploratoire, déclaré).

## 5. Oracle 7 portes, R-25, fusions à blanc

### 5a. Oracle du lot (clone `ca9fa55`)

`F:\tmp\g2-ukemirevert\oracle\run-oracle.sh` (A-3 : codes capturés directement, sans pipe ; ceinture A-7 sur chaque porte ; la
porte `test` exécute la commande EXACTE du script npm — mêmes drapeaux, mêmes globs — avec deux reporters placés AVANT les globs :
spec → `test.log`, **TAP → `test.tap` conservé** (REVIEW-TAP-1)). 12:31:46Z → 12:34:36Z, node v24.15.0 : `gate:vocab` 0,
`typecheck` 0, `test` 0, `lint` 0, `lint:ratchet` 0 (69/69), `lang:gate` 0, `export:check` 0 — **7 × exit 0** ; tests
**1 074 / 1 072 / 0 / 2** (skips = les 2 structurels : `sentinel_run_releases_chainstack_lock_on_sigterm` win32,
`u4b_labels_replay_via_main_real_artifact` artefacts réels absents) ; 0 `not ok` au TAP. `codes.txt` `24e5c7ee…04fa`, `test.tap`
`2e86cdb5…94bf`. = G1.

### 5b. Fusion à blanc dans la pointe `lot/etude-suite` @ `a0f47fe` (≥ `a0f47fe` : c'est la pointe au clonage)

- `git merge-tree --write-tree --name-only a0f47fe ca9fa55` (git 2.55, aucun index/worktree touché, aucun commit) : arbre
  `2a89cc9253382f4df8bdcdb63ab431c3f0f01b18`, **0 conflit**. Rejoué dans un worktree détaché de mon clone à `a0f47fe` +
  `git merge --no-commit --no-ff ca9fa55` ⇒ « Automatic merge went well » ; `git write-tree` de l'index = `2a89cc92…` (identique) ;
  10 fichiers fusionnés = les 10 du lot. La pointe ne diffère de la base `4a2f69f` que par 13 fichiers sous `docs/**`.
- Oracle de l'arbre fusionné (`npm ci` exit 0, `require.resolve` dans `merged`), 12:46:49Z → 12:49:58Z : **7 × exit 0** ; tests
  **1 074 / 1 072 / 0 / 2**, 0 `not ok` ; les **16 tests neufs présents et `ok` (16/16)** au TAP (`codes.txt` `dd002ae7…b6979`,
  `test.tap` `33fc9e8a…001e`). N(pointe) mesuré sur la pointe PURE : voir 5c.

### 5c. N(pointe) (porte `test` seule, worktree détaché `a0f47fe`, même commande)

12:50:23Z → 12:52:03Z : `test` exit 0, **N(pointe) = 1 058 / 1 056 / 0 / 2** (0 `not ok` ; `codes.txt` `27d8d698…9e7c`, `test.tap`
`818aaf62…97d1`). Arbre fusionné 1 074 = **N(pointe) + 16** ; différence des NOMS de tests au TAP (pointe → fusionné) : **+16, −0**,
exactement les 12 tests de `ukemi-revert.test.ts` et les 4 de `bare-revert.test.ts`. (L'arbre principal a 1 skip au lieu de 2 —
artefacts e2 présents, `docs/ETAT-REPRISE.md:154` — la cible du G7 reste N + 16.)

### 5c-bis. Pointe AVANCÉE pendant la revue : `lot/etude-suite` @ `83b8904` (relevé 12:53Z)

`a0f47fe..83b8904` = 6 fichiers, TOUS sous `docs/**` (0 fichier hors `docs/`). `merge-tree 83b8904 ca9fa55` ⇒ arbre
`97ef1e8f963f953bbbb003693ce08e9be672203a`, **0 conflit** ; worktree détaché `83b8904` + `git merge --no-commit --no-ff ca9fa55`
(index = `97ef1e8f…`), `npm ci` exit 0 ; oracle 12:54:42Z → 12:58:12Z : **7 × exit 0**, **1 074 / 1 072 / 0 / 2**, 0 `not ok`
(`codes.txt` `490affb1…b9b`, `test.tap` `5c7e9822…08b9`) ; noms de tests vs la pointe pure `a0f47fe` (mêmes fichiers de test) :
**+16, −0** ⇒ **N + 16** tenu sur la pointe courante. (Je n'ai PAS lu les documents ajoutés par ces commits — dont un cp-2 de ce
lot — pour garder l'indépendance de la revue.)

### 5d. Fusion à blanc contre `lot/garde-fsync-1` @ `9ea2e8b`

- `merge-base(ca9fa55, 9ea2e8b)` = `66f75c2` ; fichiers de GARDE depuis `66f75c2` (hors `docs/`) = `ukemi-guard-record.test.ts`,
  `packages/rpc-guard/{bin/rpc-guard.mjs, src/{cli,ledger,lock,reconcile,repair}.ts, test/{durable.test,harness,no-fsync,
  repair-tail.test}.ts}` ; **∩ fichiers du lot = ∅** (`comm -12`).
- `git merge-tree --write-tree --name-only 9ea2e8b ca9fa55` ⇒ 2 conflits : `apps/sentinel/test/ukemi-guard-record.test.ts` (contenu)
  et `docs/G1-lot-garde-fsync-1.md` (add/add) ; **référence sans le lot** `merge-tree 9ea2e8b 4a2f69f` ⇒ les MÊMES 2 conflits ;
  `merge-tree 9ea2e8b a0f47fe` ⇒ les mêmes 2 ⇒ **0 conflit venant du lot** (les 2 sont le conflit connu etude-suite × GARDE).
- La version GARDE de `ukemi-guard-record.test.ts` n'asserte AUCUNE valeur de `rpc_errors[].data` (type local `data?: string`
  `:276-277` ; assertions par champ `http`/`code` `:310-345`) ⇒ l'indicateur D-3 ne rougit pas la résolution union à venir (constat
  du G1 confirmé par lecture).

### 5e. R-25 — pathspec VERBATIM `ci.yml:65`

`F:\tmp\g2-ukemirevert\r25\make-r25.mjs` écrit un script bash qui exécute la ligne 65 de `ci.yml` **telle quelle** (seule
l'expression `"origin/${{ github.base_ref }}...HEAD"` remplacée par `"4a2f69f...ca9fa55"`, occurrence unique assertée), puis la
ligne `CHANGED=$(printf …| awk …)` de `ci.yml` verbatim ; c'est bash qui découpe le pathspec, comme le runner CI. Résultat :
`9 files changed, 638 insertions(+), 19 deletions(-)` ⇒ **CHANGED=657 ≤ 1 150** (pas de STOP) ; le 10e fichier (doc G1) est exclu
par `:(exclude)docs/G1-lot-*.md`. = G1.

## 6. A-7 — secrets, corps, URL, env

- Tests du lot (`ukemi-revert.test.ts`, `bare-revert.test.ts`) : seules URL = hôtes `.invalid` factices (`cs-node.example.invalid`,
  `sol.example.invalid`, `paid-a/b.invalid`, `keyless-c.invalid`) ; clés = littéraux `FAKEKEY-…` ; env = OBJETS littéraux passés au
  transport/recorder, **0 lecture de `process.env`** (grep sur le diff : les seules lignes ajoutées portant `https://` sont ces
  littéraux factices). Aucun corps de réponse réel dans les tests : les formes de fil sont des littéraux conformes à la mesure (la
  forme nue) et le corps 408 du diag (corps d'erreur public keyless, déjà présent dans les tests de la base).
- Journal/diag : l'indicateur ne porte jamais d'octet (test (b) du G1 + mon rejeu RKV : 0 occurrence de `cafebabe` dans le diag du
  LOT, présente dans celui de la BASE) ; mes 20 rejeux : 0 octet `FAKEKEY` / hôte `.invalid` dans livre, concordance, cache, diag
  (`no_key_or_host_in_outputs` = true) ; RKL : 0 occurrence de la `data` rejetée dans livre et cache.
- `probe-result.json` (lu champ par champ ; sha256 `e1700cf0…78ec` = valeur du G1) : en-tête = chemins locaux, sha d'arbre, bloc,
  `to`/`data` de la REQUÊTE (sélecteur public), limites, labels d'opérateur, **un booléen de présence** d'env
  (`env_chainstack_eth_url_present`) ; `wire[]` = statut HTTP, booléens, code, forme de `data` (`"absent"`), booléen « exactement
  `execution reverted` », indice FERMÉ, compte de clés en sus ; l'hôte payant n'est nommé que `paid-or-other` ; `results[]` = nom
  d'erreur, code, unité, forme de `data`, `detail` (indice fermé pour le payant). **Seul texte ouvert** : `message_normalized_keyless`
  et `detail` du keyless drpc (`"execution reverted"`) — corps KEYLESS normalisé et « scrubbé » (URL) par la sonde, conforme à la
  politique du transport (le corps keyless est repris par `raise`, D6 ne vise que le payant) ; aucun texte ouvert côté payant.
  Aucune URL, aucune clé, aucune valeur d'env. **Conforme** (précision : « que des indicateurs fermés » est vrai côté payant ; côté
  keyless, un texte normalisé licite).
- Ledger réel (lecture seule, champs choisis, aucune valeur secrète affichée) : `chainstack.jsonl` 51 976 lignes, les 2 dernières =
  `attempted` `credits_derived 2` + `unlocked` (raison « ukemi-revert-1 G1 step-0 probe ») ; `drpc.org.jsonl` 73 977, `attempted` 0 +
  `unlocked` ; mtime des deux = 11:09Z, rien après ⇒ **4 lignes, 2 RU** (note de rapprochement du G1 confirmée).
- Mes propres exécutions : 0 appel réseau (fetch bouchonné partout ; le rejeu lève sur tout hôte inattendu), 0 RU, aucun verrou ni
  ledger réel touché (ledgers sous `F:\tmp`), aucune variable affichée, processus de course non touchés.

## 7. Amendement ADR (`F:\tmp\ukemirevert\ADR-amendement.md`, sha256 `02156c08…d9c6`) — exactitude contre le code

Vérifié EXACT : citations `classify.ts:56`, `rpc2.ts:43-45`, `book.ts:82-93`, `record.ts:329`, `resume.ts:86-87` et `:92`,
`prefetch.ts:46`, supra `:302-305`, `:361-369`, `:365-367`, `:522-529` (lignes lues au commit) ; annotations de ligne (B) : `record.ts`
+11 (44-353) / +12 (≥ 356) — `:318→:329`, `:400-416→:412-428`, `:456-483→:468-495`, `:558-562→:570-574` ; `rpc2.ts` `:181→:192`, banc
`:196→:216` (texte des lignes comparé base/lot) ; `ukemi_sha` = provenance seule (aucun consommateur ne le lie, grep) ; ADR-U4b
`:133-135`, `:1839` (hors gel) ; Décision (1)-(3) = code ; tuyaux des 3 pièces = code ; coûts (2 × (1 keyless + 2 RU)) = mesurés au
rejeu ; E-3 = matrice ; **« SUPERSÈDE :522-529 » cohérent avec D-4** (assertion rebasculée `ConcordantRevertError`, `notEqual
QuorumDisagreementError` gardée, oracle vert) ; D-n et relance cohérentes (la garde 4 blobs couvre les 4 fichiers de production du
correctif ; valeurs à re-mesurer au G7). Résidus : **R-1** — exact côté payant (matrice `nu`×`keyhex`/`long` ⇒ Concordant ;
test de caractérisation du G1 vert), mais incomplet côté témoin et « visible » inexact ⇒ **C-1** ; **R-2** — conforme : une seule
lecture sondée (source GHO), déclarée ; la falsification de la D-n la couvre (sous la réserve C-1 (v)) ; un revert payant AVEC `data`
validée retombe bien sur le chemin `isRpcRevert` antérieur (matrice `nu`×`data` ⇒ Disagreement, `data`×`data` ⇒ Concordant, = base) ;
**R-3** — conforme : témoin keyless « raison sans data » × payant nu ⇒ `NoQuorumError` fail-closed, payant non refroidi (matrice
`reason`×`nu` : L1 NoQuorum, L2 valeur ; message du NoQuorum = indice fermé du payant tenu), déclencheur « observation en course ⇒
consultation formée » présent. Écarts : C-1 à C-4 ci-dessous. `error_origin` : O-1.

## VERDICT : **PASS-AVEC-CORRECTIONS**

Le code de production est correct et conforme à la doctrine telle que tranchée (A', D-1..D-4) : prouvé par la matrice 220 × 2, le
rejeu servi (mort reproduite à l'octet sur la base, levée sur le lot, livre = attendu indépendant, y compris sur la VRAIE source
GHO), 16/16 + 8/8 mutants, oracle 7 × 0 sur le lot ET sur les arbres fusionnés dans la pointe (`a0f47fe` puis `83b8904`, N + 16),
R-25 657, A-6 15/15, 0 conflit du lot (pointe et GARDE-FSYNC-1).
Les corrections sont documentaires (ADR/rendu) plus une extension de portée d'item ; aucune ne touche le code de production ni ne
bloque la relance du temps 2 (la forme réelle mesurée est nu/nu, hors du résidu C-1).

## Liste fermée des corrections

- **C-1 (résidu R-1 inexact et incomplet — côté TÉMOIN keyless).** `isBareRevert` ne voit que `e.data === undefined`
  (`classify.ts:79`) ; `validateRevertData` rend `undefined` pour une `data` REJETÉE sur TOUTE unité (`transport.ts:163-170`, `:181` :
  non-chaîne, non-hex, > 4 096 car., hex d'une cible). Donc un témoin KEYLESS dont la `data` est rejetée est classé NU et apparie le
  payant tenu. Mesuré : matrice `long` (keyless) × `nu`/`nu0x`/`nu32000`/`reason`/`keyhex`/`long` (payant) ⇒ `ConcordantRevertError` ;
  chemin SERVI : RKL ⇒ exit 0 et livre `""`, alors que RKV (même `data` mais valide) ⇒ `QuorumDisagreementError` ; journal
  `data:"absent"` dans RKL. Effet borné (issue = `ConcordantRevertError`, tolérée sur `description()` seul, les deux nœuds ont bien
  reverté ⇒ la valeur `""` du livre reste juste ; ce qui est perdu = le signal de discordance sur la `data`). À corriger dans
  l'amendement (A) et le rendu G1 : (i) R-1 couvre les DEUX unités ; « Borné : le témoin doit être nu LUI-MÊME (message exact, sans
  data) » → « … sans data VALIDÉE (une data rejetée est indiscernable d'une data absente, des deux côtés) » ; (ii) « visible à
  l'indicateur `"absent"` » → « indiscernable à l'indicateur (`"absent"` couvre absent ET rejeté, comme le dit le code lui-même, `record.ts:48-51`) » ;
  (iii) Décision (2) « keyless portant une `.data` non vide » → « une `.data` VALIDÉE non vide » ; (iv) item REVERT-DATA-REJECTED-1
  étendu : « … et ne jamais accepter comme témoin nu un revert keyless dont la `data` a été rejetée » (même déclencheur, même
  propriétaire) ; (v) clause de falsification de la D-n : « l'indicateur `"absent"` couvre aussi une `data` rejetée (R-1) : la D-n ne
  falsifie que sur une `data` validée ». Recommandé (test seul, bascule pré-déclarée, calque du test R-1) : caractériser le côté
  témoin (keyless `data` > 4 096 + payant nu ⇒ `ConcordantRevertError` aujourd'hui ; contraste `data` valide ⇒ discordance).
- **C-2 (liste de supersession incomplète).** L'amendement ne déclare que « SUPERSÈDE :522-529 ». Deviennent aussi faux POUR
  `quorum2` : `ADR-GARDE-HELIUS:299-301` (résidu (1) « un revert d'opérateur PAYANT SANS `.data` va au banc … jamais un faux accord »)
  et `:366-368` (« l'option 1 le remplace par un banc, qui pose `cooldownUntil` 25 s sur `chainstack` (`rpc2.ts` quorum2) »). Ajouter
  « AMENDE supra :299-301 et :366-368 : `isRpcRevert` inchangé (faux pour un payant nu), mais `quorum2` TIENT ce revert (ni banc ni
  refroidissement) et ne le concorde qu'au témoin keyless nu ; « jamais un faux accord » borné par R-1 (C-1) ».
- **C-3 (tuyaux incomplets, règle Branchement).** La table des tuyaux de l'appariement tenu ne liste en sortie que `book.ts`,
  `prefetch.ts` et `--concordance-out` ; les consommateurs `makeUkemiPool` à jambe payante `scripts/census/u4-oracle-path.mjs:189` et
  `u4-redraw.mjs:92` (`--with-chainstack`) changent d'issue (e-mode 8 : `NoQuorumError` → `ConcordantRevertError`) — ils ne sont cités
  qu'en « Conséquences ». Ajouter une ligne de tuyau (sortie `emode_raw` / rapport re-draw ; test de composition
  `u4_oracle_path_paid_leg_is_metered_in_its_own_ledger`) et déclarer INCHANGÉS par construction les consommateurs keyless-seuls
  (`apps/bell/src/ethereum.ts:97` — course Bell en cours —, `scripts/census/u4b/u4b-discover.mjs:106`, `u4b-probe-cutoff.mjs:38` :
  `held` exige une unité ≠ keyless, `rpc2.ts:215`).
- **C-4 (citations/précisions).** (a) « `docs/CHANTIERS.md:1080` proposait « plan » » (ADR (A) `error_origin` ET rendu G1 §error_origin) :
  la proposition « plan » est à **`:1081`** (`:1080` = la ligne STOP), mesuré à `4a2f69f`, `ca9fa55` et `a0f47fe` ; (b) « Fait
  structurel (D6) : `closedHint("execution reverted") === closedHint("execution reverted: <raison>")` » : vrai pour une raison SANS
  jeton du vocabulaire fermé (le test du lot le montre : `execution reverted: result too large` ⇒ autre indice) — qualifier ;
  (c) PROV-MODEL-1 : le déclencheur « prochain lot recorder APRÈS le temps 2 » est à `ADR-U4b:2085` (report), `:1857` porte l'item
  d'origine — citer les deux.

## Observations (non bloquantes)

- **O-1 (`error_origin`, à trancher au G7).** « spec R-A muette » est partiellement inexact : la conséquence d'un revert payant nu
  sur une jambe payante (`NoQuorumError`) était CONNUE et épinglée à R-A pour l'e-mode 8 (`ADR-GARDE-HELIUS:522-529`, assertion
  « à rebasculer si l'issue R-A change »), et R-A se déclarait « narrow (chainstack ajouté en dernier) » (`:367-368`). La décision 140
  (pool `eth_call` {drpc, chainstack} : chainstack tiré à CHAQUE lecture) a invalidé cette prémisse sans réévaluer la seule lecture à
  revert toléré (`description()`). Cela soutient « plan » (140 × prémisse R-A) au moins à égalité avec « test manquant » (aucune
  composition {keyless, payant} + revert toléré) ; la rédaction « spec R-A muette » gagnerait à devenir « prémisse narrow de R-A
  (`:367-368`) invalidée par 140, conséquence connue pour l'e-mode 8 non reportée au recorder ».
- **O-2 (refroidissement asymétrique).** Payant nu tenu (non refroidi) + keyless en FAUTE (refroidi 25 s) dans un pool à 2 ⇒ les
  lectures suivantes (≤ 25 s) ne voient que le payant ⇒ `NoQuorumError` (matrice : `fault`×`nu` L2 NoQuorum ; base : L2 valeur, les
  deux étant refroidis, `live()` retombait sur la liste entière). Identique au comportement d'avant le lot pour un payant qui répond une
  VALEUR (`fault`×`val` : L2 NoQuorum aux deux commits). Sans effet sur le recorder (le 1er NoQuorum est fatal) ; pertinent seulement
  pour un consommateur qui continue après un NoQuorum.
- **O-3 (D6, déjà déclaré en « fait structurel »).** Un payant qui donne une RAISON sans `data` est classé nu et concorde avec un
  témoin keyless nu (matrice `nu`×`reason` ⇒ Concordant). Valeur du livre juste (les deux ont reverté) ; pourrait figurer nommément
  dans les résidus.
- **O-4 (mutant G11 survivant).** La normalisation (casse) du texte keyless de `isBareRevert` n'est épinglée par aucun test ; le
  survivant est dans le sens fail-closed (moins d'admissions). Test optionnel (message keyless `Execution Reverted`).
- **O-5 (test (f) du G1).** Ses « différences déclarées » omettent `--min-interval-ms 0` (course : 100), `--no-prereg-binding` (course :
  `--prereg-file/--prereg-sha/--labeler-sha`), les caps, le `sleep` injecté ; mon rejeu aux drapeaux VERBATIM de `record-t2.sh` (vrai
  sleep) donne la même issue ⇒ écart sans effet ; commentaire à compléter à l'occasion.
- **O-6 (harnais G1 vs D-1-bis).** `mutants.mjs` du G1 restaure sans `fsync` (antérieur à D-1-bis, `b48311d` 11:15:47Z, absent de sa
  base) ; sans conséquence ici (arbre commité = DELIVERED 9/9) ; à ne pas réutiliser tel quel.
- **O-7 (provenance).** `ukemi_sha` (`record.ts:120-125`) hache `apps/sentinel/src/ukemi/*.ts` seulement : la version de
  `@monark/rpc-guard` (`classify.ts`/`index.ts` du correctif) n'est pas dans la provenance du livre (limite antérieure au lot) ; la
  garde 4 blobs de la relance la couvre au lancement ; consigner le commit G7 dans la D-n du Sidecar 3.
- **O-8 (D-1 face à ADR-U1 D3 amendé).** `ADR-U1-recorder-book-liquidation.md:118-121` pose « discordant (valeur/revert …) ⇒
  `QuorumDisagreementError` » ; D-1 (payant nu × valeur keyless ⇒ `NoQuorumError`) en est une exception — préexistante (R-A
  benchait déjà ce payant, `ADR-GARDE-HELIUS:366-367`) et conservée ; abstention dans les deux cas, mais ce désaccord n'entre pas
  au `--concordance-out` (aucun `onQuorum`, comme à la base). Citer ADR-U1 D3 dans l'amendement lèverait l'ambiguïté.
- **O-9 (item proposé, règle Dettes).** Le test `paid_revert_with_empty_0x_data_is_benched`
  (`apps/sentinel/test/ukemi-guard-classify.test.ts:94`) garde un NOM devenu faux (le payant `"0x"` est désormais TENU, non benché) ;
  D-4 (ii) l'a assumé (« commentaires seuls ; nom inchangé »). Item proposé **TEST-NAME-HELD-1** : renommer (p. ex.
  `paid_revert_with_empty_0x_data_is_never_concorded_against_a_value`) ; propriétaire : orchestrateur ; déclencheur : prochain lot
  autorisé à toucher ce fichier (hors fenêtre de la course), mutants nommés à re-pointer dans le même lot.

## Provenance

- Relecteur : `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, décision 133), effort max, instance séparée à contexte frais (aucune
  lecture du cp-2 du lot ni d'un autre G2 de ce lot — indépendance). Date : 2026-09-23, 12:06:52Z → clôture (horodatage final
  ci-dessous). Contexte : mission orchestrateur (Fable 5.1) « REVUE G2 UKEMI-REVERT-1 » ; réviseur de cette sortie : orchestrateur
  (R-21). Aucun commit, aucun workflow (R-20) ; seuls fichiers écrits : sous `F:\tmp\g2-ukemirevert\` (Write/Edit pour les fichiers
  portant du texte ; A-13).
- Advisor intégré : appel « après orientation » à ~12:10Z → **« The advisor timed out »** (indisponibilité consignée, non
  contournée) ; appel « avant clôture » : voir journal.
- Environnement : node v24.15.0, win32, git 2.55.0.windows.5 ; arbres : `clone` (`ca9fa55`), `base` (`4a2f69f`), `mut` (`ca9fa55`,
  mutation), `merged` (`a0f47fe` ⊕ lot, sans commit), `tip` (`a0f47fe`), `merged2` (`83b8904` ⊕ lot, sans commit).
- Harnais et résultats (sha256) : `matrix\matrix.mjs` `d86be09e…84c9`, `matrix-lot.json` `672c4488…ba4e`, `matrix-base.json`
  `7444c0ea…6a48` ; `replay\replay.mjs` `747cf8c1…7c59` ; `r25\make-r25.mjs` `d908814d…0a13`, `r25.sh` `7428204a…ad0e`, `r25.out`
  `fc1903dc…ef0b` ; `oracle\run-oracle.sh` `2f49adcd…9054` ; `mutants\g1replay\mutants.mjs` `a739f8a7…4bd3` (= G1 `345fbf9e…` à 3
  chemins près), `mutants-result.json` `718bba65…d169` ; `mutants\own\mutants-g2.mjs` `bca353d1…bcb7`, `mutants-g2-result.json`
  `fd907ffe…30e9` ; oracles `lot\codes.txt` `24e5c7ee…04fa`, `merged\codes.txt` `dd002ae7…6979`, `tip\codes.txt` `27d8d698…9e7c`,
  `merged2\codes.txt` `490affb1…b9b`.

## Clôture

- `date -u` de clôture : **2026-09-23T13:02:59Z** (dernière mesure ; rendu figé à la dernière édition qui suit immédiatement).
- Advisor : après orientation ~12:10Z → délai dépassé (consigné, non contourné) ; avant clôture ~13:00Z → réponse reçue, appliquée
  (journal).
- sha256 de ce rendu : calculé après la dernière édition, porté dans la réponse finale à l'orchestrateur.
- Rien de commité, aucun workflow ; arbres de travail laissés sous `F:\tmp\g2-ukemirevert\` (clone, base, mut, merged, tip,
  merged2 — worktrees détachés de MON clone, merges `--no-commit` jamais conclus) ; aucun fichier sous `F:\Monark*` ni
  `F:\course-ukemi` écrit.
