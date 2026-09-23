# Checkpoint-2 — lot UKEMI-REVERT-1 (validateur-humain, Fable 5.1)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/cp2-ukemirevert/CP2.md` (sha256 876b76caf45a1a08f52e5e745800a94cf346e5f2f0f3e54768f3c09bf6928138). Décision : ACCEPTE-AVEC-CORRECTIONS (C-1 consommateur Bell nommé, C-2 insertions (A)/(B) au commit de fusion, C-3 R-3 → item REVERT-REASON-WITNESS-1, C-4 error_origin unique « test manquant »), sous réserve du G2.

---

Modèle résolu : claude-fable-5-1

# Checkpoint-2 (acceptation) — lot UKEMI-REVERT-1, `lot/ukemi-revert-1` @ `ca9fa55` (base `4a2f69f`)

Validateur-humain (Fable 5.1, `claude-fable-5-1`, contexte frais, G2 non lu). Rendu au fil de l'eau ; chemin de rejeu
(AM-2 ter) : `F:\tmp\cp2-ukemirevert\` (clone isolé `clone\` @ `ca9fa55`, `npm ci --ignore-scripts --cache F:/tmp/npm-cache`
exit 0, TEMP/TMP/TMPDIR = `F:\tmp\cp2-ukemirevert\tmp`, ceinture A-7 `env -u` × 8 sur chaque exécution, 0 appel réseau,
aucune variable d'environnement affichée). Dépôt `F:\Monark` : `git status` propre au début (0 ligne), aucune écriture.

## 0. Artefacts lus (chemins)
- `F:\tmp\cp2-ukemirevert\clone\docs\G1-lot-ukemi-revert-1.md` (= blob `ca9fa55`, 409 lignes)
- `F:\tmp\ukemirevert\ADR-amendement.md` (textes (A)/(B) à insérer au G7), `DELIVERED.sha256`, `probe\probe-result.json`, `probe\probe-desc.mjs`, `dry-*.log`
- `F:\Monark\docs\course-ukemi\AVIS-advisor-revert-paid-1-2026-09-23.md` (+ ruling 143) — substitut de plan
- `F:\Monark\docs\CHANTIERS.md:1076-1082` (INCIDENT REVERT-PAID-1) ; `docs\ETAT-REPRISE.md:150` (décision 143)
- `F:\course-ukemi\record\U4-book-23414968.raw.json.diag.json` (lecture seule) ; `F:\course-ukemi\record-t2.sh` (lecture seule)
- `docs\adr\ADR-GARDE-HELIUS-client-budgete-unique.md:522-529` ; `docs\adr\ADR-U4b-calibration-episode-frais.md:1335`
- diff `4a2f69f..ca9fa55` (10 fichiers, 1047+/19−) ; sources `classify.ts`, `transport.ts:160-193`, `errors.ts`, `rpc2.ts`, `record.ts`

**Déviation datée consignée** : PAS de checkpoint-1 sur ce lot (chemin critique, course arrêtée fail-closed 10:43:31Z) ; le plan
= avis advisor canal 2 (Fable 5.1) + ruling orchestrateur (décision 143 « choix = advisor + lecture sur place + décision autonome
journalisée », `ETAT-REPRISE.md:150`). CA-1..CA-5 sont donc parcourus ICI, rétroactivement, sur l'avis + le G1.

## 1. Journal (UTC)
- 2026-09-23T12:14:41Z — début ; orientation faite ; oracle 7 portes lancé 12:09:20Z sur le clone
- 12:12:08Z — **oracle 7 portes (clone @ `ca9fa55`, node v24.15.0)** : `gate:vocab` 0, `typecheck` 0, `test` 0, `lint` 0,
  `lint:ratchet` 0 (69/69), `lang:gate` 0, `export:check` 0 — **7 × 0 ; tests 1 074 / 1 072 / 0 / 2** (skips : `sentinel_run_releases_chainstack_lock_on_sigterm` win32 + l'artefact e2 absent du clone) = attendu. Logs `oracle\*.log`, `oracle\codes.txt`.
- **DELIVERED 9/9** : sha256 des blobs `ca9fa55:<f>` (bruts) == `DELIVERED.sha256`, 9/9 OK.
- **A-6 15/15** : `git rev-parse 4a2f69f:<f>` == `ca9fa55:<f>` pour les 9 gelés + prereg + `book.ts`, `resume.ts`, `ukemi-guard-record.test.ts`, `transport.ts`, `errors.ts` (SAME) ; sha256 LF de chacun == tableau G1 §A-6 (15/15) ; prereg LF `1971d9b1…` == `prereg_sha` du diag réel ; `apps/bell` 0 ligne de diff.
- **`isRpcRevert` byte-identique** : sha256 de la fonction extraite (`sed '/^export function isRpcRevert/,/^}/p'`) identique sur `4a2f69f` et `ca9fa55` (`90589063…7045`) ; `classify.ts` 0 ligne supprimée.
- **R-25** : `git diff --numstat 4a2f69f ca9fa55` hors `docs/` = 638+ / 19− = **657** (≤ 1 150) ; avec `docs/G1-…` : 1 047+/19−.
- **Topologie** : `8ed6226` (G7 PRE5) est ancêtre de `4a2f69f` ; `4a2f69f` est ancêtre de `a0f47fe` ; `git diff 4a2f69f a0f47fe -- . ':!docs'` = **vide** (la pointe n'ajoute que des docs) ⇒ N à la pointe = N du clone ; la fusion à blanc dans la pointe ne peut rencontrer aucun conflit de code.
- 12:15:31Z → 12:15:41Z — **MON rejeu, chemin SERVI, sur `ca9fa55`** (`replay\run.sh lot-ca9fa55`, `replay\preload.mjs`) :
  `node --import <preload> apps/sentinel/src/ukemi/record.ts …` = record.ts EN ENTRÉE DE PROCESSUS (`isMainModule → main → runRecorder`),
  seul `globalThis.fetch` remplacé par MON stub (fixture `weth-book.fixture.json` @23545087, `--from-block` B−3000 ; corps MESURÉS :
  `description()` de la source USDC ⇒ HTTP 200 `{"code":3,"message":"execution reverted"}` SANS clé `data` sur drpc ET chainstack ;
  8 × 408 drpc corps verbatim du diag), flags = ceux de `record-t2.sh` (opérateurs `drpc.org,tenderly.co,chainstack`, `--concurrency 8`,
  `--retries 6 --backoff-ms 1000 --backoff-cap-ms 30000`, `--heartbeat-every 500`, `--min-interval-ms 100`, caps 166882/166882/`eth_call=83441…`,
  **liaison prereg RÉELLE** `--prereg-sha 1971d9b1…` + `--labeler-sha cb020425…` vérifiées contre le clone, `--resume`, `--concordance-out`) ;
  clé factice sur hôte `.invalid`, ceinture A-7. **Résultat : exit 0** ; `oracle_description` de la source revertante = `""`, les 2 autres
  intactes ; `book_digest` `f1ebccda…2b92` (= l'épingle indépendante du G1, même fixture) ; `errors_by_operator` {drpc 10, chainstack 2} ;
  `rpc_errors` = 8 × 408 + 2 × drpc `{code 3, "execution reverted", data:"absent"}` + 2 × chainstack `{code 3, "execution reverted, revert",
  data:"absent"}` (indicateur `data` présent sur CHAQUE entrée RpcError) ; concordance `chainstack|drpc.org` 28/0, `drpc.org|tenderly.co` 1/0 ;
  ledger chainstack `attempted` 29 == `calls_by_operator.chainstack` 29 ; 0 `.lock` ; cache `--resume` = les 2 descriptions réussies seulement ;
  0 octet de clé/hôte dans livre + concordance + cache + log. Sortie `replay\lot-ca9fa55\`.
- 12:16:51Z → 12:17:00Z — **MON rejeu identique sur la base `4a2f69f`** (`git checkout 4a2f69f` dans le clone) : **exit 1**, `FATAL eth_call:
  quorum needs 2 providers (last: rpc-guard: RpcError for operator 'chainstack' (code 3): execution reverted, revert)` = **chaîne EXACTE du diag
  réel** ; diag : 8 × 408 + 1 × drpc `{code 3}` + 1 × chainstack `{code 3}` **SANS clé `data`** (forme aveugle du diag réel, identique), `errors_by_operator`
  {drpc 9, chainstack 1} = diag réel ; aucun livre écrit. ⇒ mort à l'identique reproduite ; le lot est le discriminant.
- 12:16Z — **MES mutants** (`mutants\run-mutant.mjs`, sur `rpc2.ts` du clone, restauration `git checkout --` + sha == DELIVERED vérifié) :
  - **M-V1 « témoin keyless non exigé »** (admission du payant tenu contre N'IMPORTE QUEL résultat unique) ⇒ rouges NOMMÉS :
    `ukemi_revert_paid_bare_vs_keyless_value_is_no_quorum`, `ukemi_revert_two_paid_bare_reverts_never_concord`,
    `ukemi_revert_paid_bare_vs_keyless_reason_text_is_no_quorum` (9 verts) ; restauré `382101…6cfe9` = DELIVERED.
  - **M-V2 « deux payants nus concordés »** (deux `held` forment une paire `revert:bare` à eux seuls) ⇒ rouge NOMMÉ :
    `ukemi_revert_two_paid_bare_reverts_never_concord` (11 verts) ; restauré = DELIVERED.
  Sorties `mutants\V1.json`, `V2.json`, `*.tap`.
- Vérifs lecture seule : `book.ts:82-93` tolère SEUL `ConcordantRevertError` (inchangé, gelé) ; `prefetch.ts:46` idem ; `record.ts:567-575`
  `main` = shim mince `runRecorder(process.argv.slice(2), realDeps)` sous `isMainModule` ⇒ la composition testée par le lot (`runRecorder`)
  ET mon rejeu (entrée de processus) sont le MÊME chemin servi. Consommateurs de `rpc_errors[].data` hors tests : aucun (`record.ts` seul l'écrit ;
  `u4-oracle-path.mjs:294` ne lit qu'un compte). Consommateurs de `makeUkemiPool` (donc de `quorum2`) : `record.ts`, `scripts/census/u4-*.mjs`,
  ET `apps/bell/src/ethereum.ts:97` — jambe ETH de Bell **keyless seule** (`ethereum.ts:62-64`, `collect.ts:655-660` interdit les labels keyless
  ETH dans `--operators`, chainstack Bell = Solana hors `makeUkemiPool`) ⇒ la branche `held` (`isBareRevert ∧ unit ≠ keyless`) est inatteignable
  depuis Bell ; comportement des paires keyless inchangé (test (d)). L'ADR (A) ne nomme pas Bell parmi les consommateurs : correction de forme (C-1).

## 2. Checklist (règle par règle)

| règle | état | preuve |
|---|---|---|
| CA-1 (critères falsifiables) | conforme (rétroactif, sans cp-1) | Plan = avis A' + ruling 143 ; une phrase par tâche : (1) classifieur additif `isBareRevert` (2) `quorum2` tient le payant nu et ne l'admet que contre un témoin keyless nu (3) `rpc_errors[].data` = indicateur fermé. Chaque tâche a un test nommé + mutant ; critère de la course : « `description()` GHO ⇒ `""`, exit 0 » — rejoué par moi sur base (mort identique) et lot (exit 0). |
| CA-2 (décision de valeur) | conforme | A' ne réouvre PAS D6 : deux payants nus jamais concordés (test (c) + MON mutant M-V2 rouge nommé) ; messages jamais comparés entre unités (M4 du worker) ; `isRpcRevert` byte-identique ⇒ tout autre consommateur inchangé. Choix A'/B/C/D = décision technique sous le mandat 143 (« décision autonome journalisée », `ETAT-REPRISE.md:150`) ; pas de dépense nouvelle (sonde 2 RU journalisée), pas de dépendance, pas de changement de roster. Pas d'escalade. |
| CA-3 (ADR de rattachement, gates) | **conditionnel** | Amendement (A) ADR-GARDE R-A-bis + note (B) ADR-U4b existent SEULEMENT sous `F:\tmp\ukemirevert\ADR-amendement.md` ; insertion due au G7 (C-2, vérifiable par grep « R-A-bis » dans les deux ADR sur le commit de fusion). Aucun gate suspendu malgré le chemin critique (G1 → G2 ‖ cp-2 → G7). |
| CA-4 (fan-out) | conforme | Mono-worker G1 + relecteur G2 (instance séparée) + validateur (contexte frais) : fan-out justifié par l'indépendance de vérification seule. |
| CA-5 (MAST) | **non évalué** (pas de plan formel — déviation cp-1 consignée) | Ni l'avis advisor ni le G1 ne nomment de mode MAST ; je ne reconstruis pas la conformité à leur place. Remarque à porter au G7 (non bloquant : les contre-mesures existent de fait — D-1..D-4 déclarées, advisor consulté ×3, 16 + 2 mutants nommés — mais ne sont pas étiquetées MAST). |
| CA-6 (oracle ET revue) | conforme (ma part) | Oracle rejoué par moi : 7 × 0, 1 074/1 072/0/2 ; rejeu servi base/lot ; G2 en cours ailleurs (non lu, par construction) — l'acceptation finale exige les deux au G7. |
| CA-7 (zéro dette) | accepte-avec-correction | R-1 ⇒ item formé **REVERT-DATA-REJECTED-1** (propriétaire, déclencheur, caractérisation épinglée : conforme) ; R-2 ⇒ couvert par la D-n falsifiable (conforme) ; **R-3** : déclencheur (« observation en course ⇒ consultation formée ») mais **ni nom d'item ni propriétaire** ⇒ C-3. PROV-MODEL-1 non déclenché (motivé). Sonde G1 : 2 RU + 4 lignes ledger réel consignées au journal G1 (:44-46) pour le `reconcile` — conforme. D-n de relance écrite (G1 §D-n + ADR (B)) — conforme. |
| CA-8 (provenance) | accepte-avec-correction | Modèle résolu `claude-opus-5-5[1m]` (préfixe conforme décision 133) ; générateur ≠ relecteur (G2 séparé) ; `error_origin` proposé « test manquant » (worker + advisor) vs « plan » (`CHANTIERS.md` entrée 10:55, Cause) — **divergence à trancher au G7**, un seul assigné (C-4). Journal G1 structuré (horodaté, sha). |
| CA-9 (vérification imposée par le système) | conforme | Clone isolé, contexte frais, G2 non lu ; je n'ai pas lu `mutants.mjs` du worker pour concevoir M-V1/M-V2 ; mon stub `fetch` est le mien (`replay\preload.mjs`), pas le helper du test. |
| CA-10 (anti-métrique) | conforme | Aucun argument de vitesse dans le G1/ADR (les durées sont des mesures de contention, pas des motifs d'acceptation) ; lot 657 lignes de code (R-25 ≤ 1 150) ; 9 fichiers, périmètre fermé. |
| CA-11 (branchement, composition exécutée) | conforme | Tuyaux déclarés (tableau ADR (A) : `isBareRevert` → `quorum2` → `book.ts:88-93`/`prefetch.ts:46`/`onQuorum` → `--concordance-out` ; indicateur → livre + diag). Composition EXÉCUTÉE depuis l'artefact d'entrée réel (corps de fil mesurés par la sonde, 408 verbatim du diag) jusqu'aux sorties (livre, diag, concordance, ledger, cache) : test (f) du lot ET mon rejeu par l'entrée de processus. Registre : « branché », « built » à la première course rapprochée (relance temps 2) — formulation exacte. |
| Anti-close (lots Bell) | n-a | Lot Ukemi, pas Bell ; `apps/bell` 0 diff ; seules valeurs : adresse de source d'oracle (état on-chain public) et digests de fixture. |

## 3. Fusions à blanc (clone, `oracle\merges.sh`, `oracle\merges.txt`, 12:17:35Z → 12:20:54Z)
- **Pointe `lot/etude-suite` @ `a0f47fe`** : porte `test` AVANT = **1 058 / 1 056 / 0 / 2** (N du clone ; l'arbre principal a 1 skip de moins
  ⇒ 1 058/1 057/0/1, `ETAT-REPRISE.md:154`) ; `git merge --no-commit --no-ff ca9fa55` ⇒ **exit 0, 0 fichier non fusionné**, 10 fichiers
  1 047+/19− ; porte `test` APRÈS = **1 074 / 1 072 / 0 / 2 = N + 16** ✔ (règle ADR-U4b:1335). `merge --abort`, retour `ca9fa55`, status 0.
  La pointe a AVANCÉ pendant mon rejeu (`c6a4722`, 3 commits docs seulement : `git diff a0f47fe c6a4722 -- . ':!docs'` vide) ⇒ conclusion
  inchangée ; **N est à re-mesurer au G7** : si BELL-ADV-1 (+9 selon son cp-2) ou GARDE-FSYNC-1 fusionne avant, N change, la cible reste N + 16.
- **`lot/garde-fsync-1` @ `9ea2e8b` sur `ca9fa55`** : `git merge --no-commit --no-ff 9ea2e8b` ⇒ exit 1 avec EXACTEMENT les 2 conflits
  connus hors lot (`apps/sentinel/test/ukemi-guard-record.test.ts`, `docs/G1-lot-garde-fsync-1.md` add/add) ; **0 des 9 fichiers DELIVERED
  en conflit** ✔. `merge --abort`, HEAD `ca9fa55`, status 0.
- **Oracle de l'arbre fusionné `a0f47fe ⊕ ca9fa55`** (12:22Z, `oracle\merged-docgates.txt`) : porte `test` = 1 074/1 072/0/2 (ci-dessus) ; `typecheck`/`lint`/`lint:ratchet` : arbre de CODE byte-identique à `ca9fa55` (diff pointe/base hors docs vide) ⇒ couverts par le 7 × 0 du §1 ; les 3 portes qui balaient les DOCS (union des docs de la pointe + G1 du lot) rejouées sur l'arbre fusionné : **`gate:vocab` 0, `lang:gate` 0, `export:check` 0**. `merge --abort`, HEAD `ca9fa55`, status 0.

## 4. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée, vérifiable au G7)
- **C-1 (ADR (A), Conséquences)** : nommer `apps/bell/src/ethereum.ts:97` parmi les consommateurs de `makeUkemiPool`/`quorum2`, avec la preuve
  qu'il est NON affecté par construction (jambe ETH keyless seule : `ethereum.ts:62-64`, `collect.ts:655-660` ; la branche `held` exige
  `unit ≠ keyless`). Une phrase ; vérifiable par grep « ethereum.ts » dans l'amendement inséré.
- **C-2 (CA-3)** : insérer (A) dans `ADR-GARDE-HELIUS-client-budgete-unique.md` et (B) dans `ADR-U4b-calibration-episode-frais.md` au commit de
  fusion (grep « R-A-bis » / « UKEMI-REVERT-1 » sur les deux fichiers du commit G7) ; le renvoi « SUPERSÈDE supra :522-529 » doit pointer les
  lignes réelles au moment de l'insertion.
- **C-3 (CA-7, R-3)** : former le résidu R-3 en item nommé avec propriétaire (proposition : `REVERT-REASON-WITNESS-1`, orchestrateur ; déclencheur
  inchangé « observation en course d'un `NoQuorumError` nommant un revert payant nu face à un témoin keyless à raison ⇒ consultation formée ») dans
  l'amendement (A) — un « déclencheur » sans item ni propriétaire est un dû nu.
- **C-4 (CA-8, `error_origin`)** : le G7 assigne UNE valeur au journal de provenance — « test manquant » (origine secondaire : spec R-A muette),
  telle que déjà arbitrée à l'entrée CHANTIERS 12:07 — et supersède EXPLICITEMENT la proposition « plan » de l'entrée 10:55 (Cause), pour qu'une
  seule valeur vive.
- Vérifications G7 (pas des corrections) : (i) compte = N + 16 avec N re-mesuré juste avant la fusion ; (ii) les 4 blobs de la garde de relance
  (`record.ts 24ad511f…`, `rpc2.ts f5d6298d…`, `classify.ts 4c2fa9e7…`, `index.ts 6eb18dea…`) re-mesurés `git rev-parse <G7>:<f>` avant
  le re-pin de `F:\Monark-wt-ukemiexec` ; (iii) le `reconcile` du cycle `chainstack-2026-09-19` inclut les 2 RU / 4 lignes de la sonde G1.
- Pas d'ESCALADE : aucune décision de valeur nouvelle (D6 tenu, `isRpcRevert` intact), aucun coût investisseur nouveau, verdict G7 non encore
  rendu (pas de divergence à constater), refus non contesté.

## 5. AM-1 (apprentissage)
- Attrapé : (a) consommateur Bell de `quorum2` absent de l'ADR (non affecté par construction, mais tuyau non déclaré) ; (b) R-3 sans item/propriétaire ;
  (c) preuve d'indépendance : mort à l'identique du diag reproduite par MON rejeu par l'entrée de processus sur la base, survie sur le lot, mes 2 mutants
  tués par des tests nommés (M-V1 : 3 tests ; M-V2 : 1 test). Manqué : à signaler par l'orchestrateur a posteriori.

## 6. AM-2 ter (preuve de non-écriture dans le dépôt)
- `F:\Monark` : `git status --short` = 0 ligne au début ET à la fin ; `lot/ukemi-revert-1` = `ca9fa55` inchangé ; `lot/garde-fsync-1` = `9ea2e8b`
  inchangé ; `lot/etude-suite` `a0f47fe` → `c6a4722` (3 commits docs de l'ORCHESTRATEUR, pas de moi) ; blobs `lot/ukemi-revert-1:<f>` == DELIVERED 9/9.
- Tout rejeu sous `F:\tmp\cp2-ukemirevert\` (clone, `npm-ci.log`, `oracle\`, `replay\`, `mutants\`, `tmp\`) ; aucun `git` d'écriture hors du clone ;
  aucune installation globale ; 0 appel réseau (fetch remplacé en processus ; hôte `.invalid` + clé factice) ; aucune variable d'environnement affichée ;
  aucun processus de course touché.

Modèle résolu : claude-fable-5-1 (effort high).
