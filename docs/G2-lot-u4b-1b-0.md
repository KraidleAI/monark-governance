Modèle résolu : claude-opus-4-8[1m]

# G2 — Lot U-4b-1b-0 « outillage de course » (relecteur, contexte frais)

> Relecteur `claude-opus-4-8[1m]`, effort max (préfixe `claude-opus-4-8` conforme ; Opus 5 banni ; R-20 : aucun commit ;
> R-21 : sortie vérifiable). Clone à historique complet `git clone --no-hardlinks --branch lot/u4b-1b-0 F:\Monark
> F:\tmp\g2-u4b1b0\tree` (HEAD `57ac8ae`, fourche `3afde03`) ; node_modules par `mk-nm.ps1` (220 entrées, 10 @monark,
> 0 fail). Toute exécution sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u
> CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY`.
> Écriture uniquement sous `F:\tmp\g2-u4b1b0\`. Aucune variable d'environnement affichée. Vérifications 1-8 REFAITES
> (jamais lues dans le rendu G1) ; sondes et mutants à moi.

## VERDICT G2 : PASS-AVEC-CORRECTIONS

Le code (12 fichiers) passe les 8 vérifications imposées : 9 sha gelés byte-identiques ET concordants ADR §3, oracle
789/788/0/1 sur le clone et 818/817/0/1 sur la fusion à blanc (0 fail, skipped==1), 5 sondes vertes, 8 mutants tués +
restaurés byte-exact, R-25=626, A-7 tenu, égalité labeler adéquate, aucun surclaim §DISC. Corrections (toutes
propriété ORCHESTRATEUR — R-20 ; le worker ne committe pas) :
- **C-1 (pli, vérifiée verte par G2)** : le lot NE fusionne PAS proprement dans `lot/etude-suite@37af534` — conflit de
  contenu dans `scripts/export-exclude-tests.json` (les deux branches allongent la liste `tests` + réécrivent `reason`).
  Résolution = UNION disjointe (lot : +u4b-discover/+u4b-liquidation-logs/+ukemi-record-guard-binding ; -2a :
  +ukemi-served-strateof/+gate-liq-artifact). G2 a rejoué l'union en arbre de travail (sans commit) : oracle fusionné
  **818/817/0/1**. À unir au pli par l'orchestrateur.
- **C-2 (commit du prereg)** : `docs/PLAN-u4b-prereg.CANDIDAT-FINAL.md` §5a/§5c/§Y/Q-A/Q-B/Q-C/Q-D décrit le `record.ts`
  d'AVANT décision 128 (« `--prereg-sha` compare à `docs/PLAN-u4-prereg.md` », « il n'y a PAS de flag `--labeler-sha` »).
  Ces lignes sont PÉRIMÉES vs le code livré. À réécrire aux flags réels (lignes G1 §4) au commit du prereg -1b ; ne PAS
  committer le §5 du CANDIDAT tel quel. (Item déjà formé G1 §4/§8bis — confirmé.)
- **C-3 (ADR)** : amender ADR-U4b D4 — la phrase « le script refuse sans `--prereg-sha` == sha de CE fichier » est
  désormais VRAIE par code (garde liée à `--prereg-file` = `docs/PLAN-u4b-prereg.md`). (Item déjà formé G1 §8bis.)
- **O-1 (observation non bloquante)** : le test `u4b_discover_refuses_a_paid_operator_keyless_only` n'épingle la garde
  keyless que contre `chainstack`/`helius` ; un mutant whitelist→blacklist (M8) SURVIT au test livré. Le code est une
  whitelist correcte ; le test gagnerait un cas « label payant INCONNU » (ex. `alchemy`).

---

## 1. Diff `3afde03..57ac8ae` — 12 fichiers, 9 sha gelés, imports, fetch, fail-closed

**12 fichiers** (`git diff --name-status`) : M `record.ts` (61/7) ; A `u4b-discover.test.ts` (89/0), `u4b-liquidation-logs.test.ts`
(69/0) ; M `ukemi-guard-record.test.ts` (37/9) ; A `ukemi-record-guard-binding.test.ts` (58/0) ; M `ukemi-record.test.ts`
(5/3) ; M `u3-realized.d.mts` (4/0) ; A `liquidation-logs.d.mts` (48/0), `liquidation-logs.mjs` (93/0), `u4b-discover.d.mts`
(24/0), `u4b-discover.mjs` (117/0) ; M `export-exclude-tests.json` (1/1). = 606 ins / 20 del.

**`DELIVERED.sha256` (entrée mission) rejoué** : les 12 blobs committés `git show 57ac8ae:<f> | sha256sum` == manifeste
G1 **12/12, 0 mismatch** (sha256 brut, aucun écart CRLF) ⇒ le worktree G1 livré == le commit orchestrateur `57ac8ae`.

**9 sha gelés (ADR §3) — recompute LF à `57ac8ae` (`git show 57ac8ae:<f> | tr -d '\r' | sha256sum`), CONCORDANCE ligne à ligne :**
| Fichier | LF sha256 recomputé | Réf ADR §3 |
|---|---|---|
| u4b-scores.mjs | `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` | amendement 2026-09-22 §3 (RE-GELÉ déc.126 ; PAS `9ad20666…`) ✓ |
| u4b-reduce.mjs | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` | D4 ✓ |
| record-u4b-calib.mjs | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` | D4 ✓ |
| wadray.ts | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` | C-V-2 ✓ |
| abi.ts | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` | C-V-2 ✓ |
| l1-split.ts | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | C-V-2 ✓ |
| rpc.ts | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` | amendement 2026-09-21 §1 ✓ |
| calib-digest.ts | `3603265d0a1f1a4e3e1a1d57b4b568fcadf4f6861351c2ca49b38dc794c42380` | §3 (contracts_frozen) ✓ |
| u3-realized.mjs (labeler) | `755b3a38f0253edb464624f8cdaa52385d4f9e2f1227a7bd303653b618db2de4` | labeler-sha Q11 ✓ |

`git diff --name-only 3afde03 57ac8ae` sur ces 9 = VIDE ⇒ byte-identiques fourche→cible. Le §2 du CANDIDAT porte bien
`2f9a31f6` (re-gel déc.126). AUCUN ÉCART.

**liquidation-logs.mjs n'importe JAMAIS le labeler** : imports = `node:crypto`, `abi.ts`, `windows.ts` seuls ; `u3-realized`
n'apparaît qu'en commentaire ; la clôture directe (u4-guard.mjs, rpc2.ts, windows.ts, abi.ts) n'importe pas non plus
`u3-realized`. Justification confirmée : `u3-realized.mjs:273 const ENV_ARCHIVE = process.env.CHAINSTACK_ETH_URL;` (clé
au scope module ⇒ un import transitif chargerait une clé payante — interdit keyless/A-7).

**u4b-discover.mjs passe par le client GARDÉ, aucun `fetch` nu** : imports `makeUkemiPool/operatorOf/BudgetExceededError`
(rpc2.ts), `ETH_CALL/GET_LOGS_KEYLESS_LABELS` (@monark/rpc-guard), `openU4GuardedClient/makeGuardedPoolCall/unlockAll`
(u4-guard.mjs) ; `fetch` n'apparaît qu'en commentaire ; la ronde getLogs passe par `pool.getLogsRange` (client gardé).
**Refus fail-closed** : `assertKeylessOperators` lève sur tout label absent de `KEYLESS_LABELS` (union des deux pools
keyless du package) ⇒ `chainstack`/`helius` refusés (prouvé sonde+mutant, §3/§4).

## 2. Oracle complet (`env -u`, codes capturés)

**Clone propre `57ac8ae`** : gate:vocab 0 (209 fichiers) · typecheck 0 · **test 789 / pass 788 / fail 0 / skipped 1 /
todo 0** · lint (eslint .) 0 (0 erreur) · lint:ratchet 69/69 · lang:gate 0 · export:check 0. Skip unique =
`fetch_only_inside_client` (« until 1b », inconditionnel, préexistant, hors périmètre). (vocab scanne 209 fichiers ici
vs 208 au G1 — écart d'1 = portée de scan clone `57ac8ae` vs worktree G1 ; les deux à 0 forbidden claim, IMMATÉRIEL.)

**Fusion à blanc avec `37af534`** : `git merge --no-commit --no-ff 37af534` ⇒ CONFLIT `export-exclude-tests.json` (C-1,
union disjointe). Aucun package.json workspace neuf ; `packages/rpc-guard/package.json` gagne seulement le champ `bin`
(le `bin/rpc-guard.mjs` de 1b-0 ; nom/exports inchangés ⇒ jeu workspace inchangé). node_modules reconstruits (220/10/0).
Après union en arbre de travail (sans commit) : typecheck 0 · **test 818 / pass 817 / fail 0 / skipped 1** (même skip) ·
vocab 0 (212 f.) · ratchet 69/69 · lang 0 · lint 0 · export:check 0. Puis `git merge --abort` (rc 0) : arbre PROPRE,
HEAD restauré `57ac8ae45b51bcc85ce44d02a6575fbbebc021bb`, union révertie. **0 fail, skipped==1 — conforme.** (818 =
810 du tronc `37af534` (oracle merged-tree du message de commit) + 8 tests du lot : 2 discover + 3 liqlogs + 2 binding
+ 1 budget-diag — compte vérifiable, non asserté.)

## 3. Sondes (à moi, VRAI `record.ts`/`u4b-discover.mjs`, fetch bouchonné, `F:\tmp\g2-u4b1b0\g2-probes.mjs`)

- **(a) budget ⇒ diag durable, 0 clé/0 URL** : clé factice `CHAINSTACK_ETH_URL=https://cs-node.example.invalid/FAKEKEY-9z9z9z9z`
  dans `deps.env`, `chainstack` dans `--operators`, `--max-ru 1`. Résultat : code 2, `<out>.diag.json` présent, livre
  `<out>` ABSENT, **10 clés complètes** (`ts, error, calls_total, by_operator_method, rpc_errors, errors_by_operator,
  n_at_risk_seen, prereg_sha, labeler_sha, ukemi_sha`), `error.name == BudgetExceededError`, chainstack RÉELLEMENT tiré
  (`by_operator={mevblocker.io:1,chainstack:1}`), **fuite diag {url:0, key:0, host:0}** ET **fuite ledgers {url:0, key:0,
  host:0}** (compté, jamais imprimé).
- **(b) `--prereg-sha` faux ⇒ refus NOMMÉ AVANT tout appel** : compteur `globalThis.fetch` = **0** ; message
  `--prereg-sha deadbeef != docs/PLAN-u4-prereg.md LF sha …` (mismatch) ET `--prereg-file …-absent.md does not exist`
  (fichier absent) ; 0 clé dans le message.
- **(c) `--labeler-sha` faux ⇒ refus** : compteur fetch = **0** ; `--labeler-sha deadbeef != scripts/census/u3-realized.mjs
  LF sha …`.
- **(d) discover sur fixture DÉSORDONNÉE ⇒ sortie triée + sha** : records triés `[[B,0],[B+10,3],[B+3000,2],[B+5000,1]]`,
  `brut_sha256 = 9d642ee3699e5928a21ccb278255e2dbe3eba73668d07475a92870bd7d06b5ff` (== valeur G1, reproduite
  indépendamment via `event_id=weth-fixture`, B=23600000, [B,B+20000], 4 logs), n_clusters=1. `runDiscover` renvoie le
  même sha qu'il écrit.

ALL_PASS.

## 4. Mutants (à moi, `F:\tmp\g2-u4b1b0\g2-mutants.mjs`, clone G2, restauration byte-exacte)

Les **5 de G1** rejoués + **3 à moi** — 8/8 TUÉS, restauration byte-exacte par sha256 :
| Mutant | Cible | Tué par |
|---|---|---|
| prereg-guard-removed | record.ts | `ukemi_record_prereg_sha_binds_the_course_to_the_prereg_file` |
| labeler-guard-removed | record.ts | `ukemi_record_labeler_sha_binds_the_frozen_labeler` |
| diag-not-written | record.ts | `ukemi_record_budget_stop_writes_durable_diag_journal` |
| paid-operator-accepted | u4b-discover.mjs | `u4b_discover_refuses_a_paid_operator_keyless_only` |
| sort-removed | liquidation-logs.mjs | `u4b_discover_over_a_log_fixture_is_deterministic` |
| **M6 diag-only-on-budget** (diag écrit SEULEMENT sur budget) | record.ts | `ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface` — **prouve que la clôture C-R-b7 couvre le chemin NON-budgétaire** |
| **M7 prereg-file-ignored** (garde recodée en dur sur `PLAN-u4-prereg.md`) | record.ts | `ukemi_record_prereg_sha_binds_the_course_to_the_prereg_file` (assertion « fichier absent ») |
| **M8 whitelist→blacklist** (refuse chainstack/helius seuls) | u4b-discover.mjs | mon prédicat `alchemy` (passe sur l'arbre propre, échoue sur le mutant) ; **le test LIVRÉ ne le tue PAS** (O-1) |

`all_mutants_killed_and_restored: true`. Les mutants tournent sous env sans clés payantes (A-4 sous mutation : garde de
quorum single-operator butée avant le client).

## 5. Égalité liquidation-logs ↔ labeler (`u4b-liquidation-logs.test.ts`) — jugement

**Sur quelle entrée** : fixtures synthétiques EN LIGNE (topic constant ; 1 log décodé ; 5 records de clustering).
- **topic0** : égalité DIRECTE (`import { LIQ_TOPIC as LIQ_LABELER } from u3-realized.mjs` puis `assert.equal`) + valeur
  census-A épinglée. FORT.
- **decode** : le record décodé est passé au `reduceU3` GELÉ RÉEL (import du labeler) ⇒ `repayment_native/seized_native`
  recomputés ; prouve que la FORME décodée == la forme consommée `u3-realized.mjs:505`. FORT — mais **UN seul appel**
  (agrégation multi-appels du même compte NON exercée).
- **clustering** : égalité via le MÊME `firstBlockAtOrAfter` (`b_last == firstBlockAtOrAfter(ts+86400)-1`), PAS via la
  copie de cluster du labeler (`u3-realized.mjs:439-447`, jamais invoquée). Couvre : logs hors fenêtre (B+7300 ouvre un
  2ᵉ cluster, greedy §DISC) ; collatéral non-WETH exclu ; 2 comptes distincts.
- **tx échouée** : NON couvert, mais **N/A par construction** — `eth_getLogs` ne renvoie pas les logs d'une tx revertée,
  et le labeler consomme le MÊME flux getLogs ⇒ parité par construction (raisonnement EVM standard, pas une mesure).

Jugement : couverture ADÉQUATE pour l'objet (topic + shape de décodage prouvés contre le labeler GELÉ ; règle de fenêtre
prouvée contre la fonction partagée). Réserve non bloquante : l'égalité de CLUSTERING est indirecte (fonction partagée,
non la copie du labeler) et l'agrégation multi-appels n'est pas exercée — le G1 le déclare honnêtement (aave-liquidations
cité non importé, scope module lit une fixture).

## 6. Items formés + alignement prereg §5 + surclaim §DISC

- **G1 §4a (recorder)** concorde flag-par-flag avec `parseUkemiArgs`/`runRecorder` : `--prereg-file` (défaut
  `docs/PLAN-u4b-prereg.md`), `--prereg-sha` (vérifié vs `--prereg-file`, refus nommé si absent), `--labeler-sha`
  (vérifié vs `u3-realized.mjs`), provenance porte `prereg_file`/`labeler_sha` (filter-only ET book).
- **G1 §4b (discover)** concorde : requis `--from-block/--to-block/--event-id/--out/--operators/--ledger-dir/--cycle/
  --max-calls` ; optionnels `--method-caps` (objet JSON) / `--min-interval-ms` (défaut 50).
- **`--labeler-sha` ≠ `755b3a38…` figé** : correct — le labeler est PARAMÉTRÉ en -1b (section live), son sha LF change
  AVANT la course ; le flag prend la valeur recomputée au commit du prereg (la garde vérifie le `u3-realized.mjs` présent
  au run). Note G1 §4a fidèle.
- **Aucun surclaim « §DISC exécuté »** : G1 §4b déclare explicitement que discover N'IMPLÉMENTE PAS §DISC:31 (exclusion
  e2), :42-46 (éligibilité N_min/version_ok), :49 (argmin) ; `clusters` = TÉMOIN CONSULTATIF ; le réducteur de sélection
  d'épisode (`u4b_episode_selection_is_deterministic`) est un item formé, déclencheur prereg -1b. Conforme.
- **CANDIDAT §5 périmé** ⇒ C-2 (voir verdict).

## 7. R-25 (pathspec VERBATIM `ci.yml:65`, three-dot ⇒ merge-base `3afde03`)

`git diff --shortstat "origin/lot/etude-suite...HEAD" -- . ':(exclude,glob)docs/**/*.md' ':(exclude)package-lock.json'
':(exclude,glob)…fixtures…'` = `12 files changed, 606 insertions(+), 20 deletions(-)` ⇒ **CHANGED = 626**. Aucun des 12
fichiers n'est exclu (ni docs/*.md, ni fixture, ni lockfile). 626 > 300 ⇒ **checkpoint-2** (décision 128) ; < 1150 (borne
interne) et < 1205 (`VIBEGATES_PR_LIMIT` CI) ⇒ **pas de STOP**. **CA-11** : ces outils sont consommés par la course -1b
(chemin servi = la course elle-même : journal + provenance) ; aucun registre public/README/skill/site n'est touché
(outillage de course, non servi) — aucun statut public ne change.

## 8. A-7 code neuf + `.d.mts` labeler

- **A-7** : aucune variable d'environnement affichée par le code neuf. `process.env` n'apparaît que pour l'INJECTER en
  `deps.env` (`record.ts:201 realDeps`, `u4b-discover.mjs:116` main-guard) — jamais imprimé ; aucun `stderr/stdout/console`
  n'écrit une valeur d'env/clé/URL dans record.ts ; le diag applique le scrub transport + `stripUrls` (ceinture-bretelles).
  Vérifié empiriquement : sonde (a) 0 fuite avec clé factice + chainstack tiré.
- **`.d.mts`** : diff touche `u3-realized.d.mts` (labeler, +`LIQ_TOPIC`), `liquidation-logs.d.mts` (neuf), `u4b-discover.d.mts`
  (neuf). **Côté labeler, seul `u3-realized.d.mts` touché** ; le `.mjs` gelé `u3-realized.mjs` HORS diff (byte-identique).

## 9. Provenance

Relecteur `claude-opus-4-8[1m]` effort max, 2026-09-22 ; clone `F:\tmp\g2-u4b1b0\tree` @ `57ac8ae` (fourche `3afde03`) ;
réviseur en amont = orchestrateur (R-21). Reproductible : `F:\tmp\g2-u4b1b0\{g2-probes.mjs, g2-mutants.mjs, m8-check.mjs,
c-*.log (clone), m-*.log (fusion), G2-lot-u4b-1b-0.md}`. node v24.15.0, git 2.55.0. Aucun commit. Aucune écriture DE G2
hors `F:\tmp\g2-u4b1b0\` (mes sondes écrivent sous `probe-work`) ; les tests LIVRÉS utilisent os-tmpdir transitoirement
(`mkdtempSync(tmpdir())`, nettoyé en `finally` — comportement de l'oracle, pas une écriture de G2). Aucune variable
d'environnement affichée.
