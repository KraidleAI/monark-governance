Modèle résolu : claude-opus-5-5[1m]

# G1 — LOT UKEMI-REVERT-1 : revert nu d'un opérateur PAYANT sous quorum-2, apparié à un témoin keyless nu (option A')

Worker `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5` conforme, décision 133), effort max. Worktree
`F:\Monark-wt-ukemirevert`, branche `lot/ukemi-revert-1`, base `4a2f69fd88de732fbb9f5f6985f597272b1b71bd`. Aucun commit
(R-20), aucun workflow. Rendu au fil de l'eau (ce fichier).

## Journal (date -u)

- 2026-09-23T10:51:24Z — début ; worktree propre à `4a2f69f` ; entrées lues : `AVIS-advisor-revert-1.md` (A' + ruling 143),
  `docs/CHANTIERS.md:1076-1082` (incident REVERT-PAID-1), diag `F:\course-ukemi\record\U4-book-23414968.raw.json.diag.json`
  (lecture seule), `classify.ts`, `transport.ts`, `errors.ts`, `index.ts`, `rpc2.ts`, `book.ts`, `resume.ts`, `record.ts`,
  `prefetch.ts`, ADR-GARDE-HELIUS (D6, C-1(c), R-A :361-369), ADR-U4b (gel D4, 9 sha), `docs/CONSIGNE-STANDARD-G1.md` A-1..A-13.
- 2026-09-23T10:57:46Z — `npm ci --ignore-scripts --cache F:/tmp/npm-cache` exit 0 (ceinture A-7) ;
  `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-ukemirevert\packages\rpc-guard\src\index.ts` (A-2 : dans le worktree).
- 2026-09-23T11:02:40Z — A-6 AVANT (blobs `HEAD` = `4a2f69f`, `tr -d '\r' | sha256sum`) : 9/9 gelés = valeurs du prereg §2
  (`docs/PLAN-u4b-prereg.md:116-124`) + prereg `1971d9b1…` ; intouchables `book.ts` `cb1ba53c…`, `resume.ts` `8954c497…`,
  `ukemi-guard-record.test.ts` `74522404…` (tableau complet §A-6).
- 11:04Z — advisor intégré (après orientation, avant code) — cf. §0.
- 11:09:28Z → 11:09:30Z — sonde §0 (2 RU) ; 11:12Z → 11:27Z code + tests ; 11:21Z mutants 16/16 ; 11:24Z 1er oracle (3 rouges
  outillage, corrigés) ; 11:28Z → 11:31Z oracle final 7 × 0 ; 11:31Z mutants rejoués 16/16 ; 11:32Z R-25, A-6, DELIVERED ;
  11:33Z → fusion à blanc.
- ~11:40Z — **advisor intégré de clôture** : D-2 CONFIRMÉ (« raffinement de l'avis, pas contradiction » ; M11 prouve que
  l'alternative est observable et rejetée) ; D-3 CONFIRMÉ (la lettre de la mission prime) ; demandé : (i) nommer la lacune du
  dry (`ukemi-guard-record.test.ts` en version etude-suite) + grep de la version GARDE, (ii) citer dans l'ADR le paragraphe
  supersédé `ADR-GARDE-HELIUS:522-529`, (iii) compte G7 = N + nouveaux, (iv) ce journal ; aucun blocage. Optionnel suggéré et
  RETENU : test de caractérisation R-1.
- 11:42:55Z — grep de la version GARDE (`git show 9ea2e8b:apps/sentinel/test/ukemi-guard-record.test.ts`) : **0 assertion sur la
  VALEUR de `rpc_errors[].data`** (seules occurrences : le type local `data?: string` de `rpcErrorsOf` :276-277, et les `params`
  de requête :59-60, :417) ; le seul test ajouté par GARDE (`ukemi_guard_record_skipped_the_platter_flush_nonvacuous`) porte sur
  le support no-fsync. Diff des noms de tests base↔GARDE : GARDE n'a pas les 7 tests etude-suite RETRY-2/3 + HEARTBEAT-1 (le
  conflit connu, à unir au G7 GARDE).
- 11:44Z — ajout du test de caractérisation `ukemi_revert_r1_characterization_rejected_paid_data_pairs_as_bare` (R-1 observable :
  `data` payante rejetée + témoin keyless nu ⇒ `ConcordantRevertError` aujourd'hui ; contraste : `data` payante valide ⇒
  discordance) ; fichier 12/12 vert ; ADR (A) : ligne « SUPERSÈDE :522-529 » + caractérisation R-1 ajoutées.
- 11:47Z → 11:59Z — oracle de l'arbre fusionné (rouge unique de contention test 42, vert rejoué seul) ; oracle définitif du
  worktree 7 × 0, 1 074/1 072/0/2 ; mutants définitifs 16/16 ; R-25 657 ; DELIVERED + `lot.patch` régénérés ; delta sur l'arbre
  fusionné 39/39.
- ~12:03Z — **advisor intégré de clôture, 2ᵉ appel** (après le test R-1 et l'oracle définitif) : aucun blocage ; finitions
  appliquées : (1) A-6 APRÈS rejoué sur l'arbre LIVRÉ à 12:04:28Z, 15/15 SAME ; (2) « 1 091 » qualifié (compte de l'arbre à
  blanc, la cible est N + 16) ; (3) preuve F-1 de l'ADR mesurée dans node (0 occurrence de `F:\tmp`, `F:/tmp`, `course-ukemi`,
  `F:\Monark`, `F:/Monark`, `C:\`, `C:/`) ; (4) ce journal + sha finaux re-calculés au rendu.
- Note ledger (pour le `reconcile`) : la sonde §0 a ajouté au ledger RÉEL du cycle `chainstack-2026-09-19` 2 RU chainstack
  (+1 `attempted` `credits_derived 2`, +1 `unlocked`) et 2 lignes drpc (0 RU) — dépense réelle, attendue des deux côtés d'un
  rapprochement, aucun écart attendu.

## Faits d'orientation (lus, avec ligne)

- F-1 (diag, lu) : l'erreur finale est `NoQuorumError … (last: rpc-guard: RpcError for operator 'chainstack' (code 3): execution
  reverted, revert)` ; `rpc_errors` porte drpc `{"message":"execution reverted","code":3}` et chainstack
  `{"message":"execution reverted, revert","code":3}` — AUCUN champ `data` sur l'une ou l'autre entrée.
- F-2 (code, lu) : `record.ts:371` n'écrit `data` dans `rpc_errors` que si `e.data !== undefined` ; `validateRevertData`
  (`transport.ts:163-170`) rend `"0x"` inchangé pour une donnée `"0x"` (regex `^0x[0-9a-fA-F]*$`, longueur 2, aucune cible
  de >= 3 car. ne peut être incluse). Donc l'absence de `data` au diag implique `e.data === undefined` des deux côtés :
  donnée ABSENTE du fil ou REJETÉE par la validation (non-chaîne, non-hex, > 4096, hex d'une cible secrète). La sonde (§0)
  lève l'ambiguïté au niveau du fil.
- F-3 (code, lu) : sous D6 le `detail` d'un payant est `closedHint(message brut)` ; `closedHint("execution reverted")` =
  `"execution reverted, revert"` (le jeton `revert` est une sous-chaîne de `reverted`) — c'est le texte du diag.
- F-4 (cache de course, lu, lecture seule) : `U4-inputs-23414968.jsonl:67258` — `getSourceOfAsset(GHO 0x40d16fc0…6c2f)` =
  `0xd110cac5d8682a3b045d5524a9903e031d70fccd` ; les 5 autres sources ont leur `description()` en cache (:67201, :67225,
  :67233, :67239, :67264), pas la source GHO (un revert n'est jamais caché, `resume.ts:86-87`).
- F-5 (tests, lu) : deux épingles existantes touchent le comportement R-A : `apps/sentinel/test/ukemi-guard-classify.test.ts:91`
  (`paid_revert_with_empty_0x_data_is_benched` : payant « 0x » + keyless VALEUR ⇒ `NoQuorumError`) et
  `test/guard-scripts-u4.test.ts:307-312` (jambe payante forcée, e-mode 8, stub `rpcErr(3,"execution reverted","0x")` sur
  TOUS les hôtes ⇒ `NoQuorumError`, commentaire « Flip if R-A's issue changes »). `packages/rpc-guard/test/exports.test.ts:53-64`
  ferme l'ensemble des exports de valeur.

## 0. Sonde préalable (inconnue (a) de l'advisor) — MESURÉE

- 11:04Z — consultation advisor intégré (après orientation, avant tout code) : sonde validée avec une retouche (scrub du texte
  keyless), appliquée ; recommandations reprises §1-§2 (et une divergence tranchée, D-2 infra).
- 11:09:21Z — AVANT : `CHAINSTACK_ETH_URL` présente (contrôle par LONGUEUR seulement, A-7) ; 0 `.lock` dans
  `F:/monark-ledger/chainstack-2026-09-19/chainstack-2026-09-19/` ; `chainstack.jsonl` 51 974 lignes, `drpc.org.jsonl` 73 975.
- 11:09:28Z → 11:09:30Z — exécution : `cd F:/Monark-wt-ukemirevert && env -u HELIUS_API_KEY -u CHAINSTACK_SOLANA_URL
  -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY node
  F:/tmp/ukemirevert/probe/probe-desc.mjs` (ENV-7 : seule `CHAINSTACK_ETH_URL` conservée), exit 0. Outil : `openGuardedClient`
  existant (verrou `wx` + ligne write-ahead + compteur ; `maxCalls 4`, run cap chainstack 8 RU, `eth_call` cap 2, floor 12916,
  cycle `chainstack-2026-09-19`) + un observateur `fetch` en processus qui n'extrait que des indicateurs FERMÉS (statut HTTP, code
  JSON-RPC, forme de `error.data`, indice fermé du message, booléen « exactement `execution reverted` », texte normalisé pour le
  seul keyless drpc) ; l'URL n'est ni stockée ni imprimée ; la clé n'est lue que par le transport (env passé tel quel, comme
  `record.ts`). Déverrouillage par le `runCli unlock` SERVI dans le `finally` (calque `record.ts:558-562`).
- En-tête A-12 : arbre `4a2f69fd88de732fbb9f5f6985f597272b1b71bd`, node `v24.15.0`, `win32`, commande ci-dessus ; bloc
  23414968 (`0x16548b8`), `to` = `0xd110cac5d8682a3b045d5524a9903e031d70fccd` (source GHO, F-4), `data` = `0x7284e416`.

| opérateur | HTTP | code | `error.data` sur le fil | message (fil) | indice fermé | `.data` validée | `isRpcRevert` |
|---|---|---|---|---|---|---|---|
| drpc.org (keyless) | 200 | 3 | **absent** (clé `data` absente) | exactement `execution reverted` | `execution reverted, revert` | absent | true |
| chainstack (payant, RU) | 200 | 3 | **absent** (clé `data` absente) | exactement `execution reverted` (booléen seul, D6) | `execution reverted, revert` | absent | **false** (R-A) |

  Aucune clé d'erreur hors {code, message, data} (compte 0, deux opérateurs). Dépense : 2 tentatives, chainstack **2 RU**,
  drpc 0 — un dépassement était impossible par construction (run cap 8 RU, UNE tentative chainstack de 2 RU, `eth_call` cap 2).
- APRÈS (11:10Z) : 0 `.lock` ; `chainstack.jsonl` 51 976 (+1 `attempted` `credits_derived 2`, +1 `unlocked`), `drpc.org.jsonl`
  73 977 (+1 `attempted`, +1 `unlocked`) ; `verifyCycleLedger` rejoué sur les deux fichiers : chaîne OK, `.head` == dernière
  entrée (chainstack 51 967 `attempted`, somme dérivée 103 934 RU sur le cycle ; drpc 73 960 `attempted`).
- sha256 : `probe-result.json` `e1700cf0c1d5f079cc50f1e7f63cfcfcf3dc8d5d1b97aaceab08636648c678ec`, `probe-desc.mjs`
  `efece5d2bdae3191041dfb383edffcde467869e3b1c4dc8a22262fb80e9e6385` (version exécutée = après la retouche scrub),
  `probe.log` `f37e242e0a41816d46cc5b3b7c69079bd1a51d36b9356a701383a6ac4e591353`.

**Conséquence de conception (mesurée, pas devinée)** (suite du §0) : la forme réelle est `{"code":3,"message":"execution reverted"}` SANS
`data`, des deux côtés. La préférence (iii) de l'avis (« côté payant, `data === "0x"` strict ») est donc **inapplicable au cas
réel** : elle laisserait le temps 2 mourir à l'identique. Côté payant, « nu » accepte `data` absente OU `"0x"` ; les deux formes
sont testées (A-8 : la forme du fil mesurée ici est celle des tests de composition). Résidu déclaré §Résidus (R-1).

## 1. Code (périmètre fermé)

- 11:12Z → 11:27Z — écrit par Edit/Write uniquement (A-13).
- `packages/rpc-guard/src/classify.ts` — **ADDITIF** `isBareRevert(e)` (`isRpcRevert` byte-identique, cf. `git diff`) : `RpcError` ∧
  code ∈ {3, −32000} ∧ `.data` validée absente ou `"0x"` ∧ texte normalisé (trim, minuscules, blancs repliés — calque
  `revertKey`) SANS raison : keyless ⇒ `message` === `"execution reverted"` ; payant (unit ≠ keyless) ⇒ `detail` ===
  `closedHint("execution reverted")` = `"execution reverted, revert"`. Aucune regex nouvelle d'alternative (le test structurel
  C-4 `error_vocabulary_regex_alternatives_are_all_hint_tokens` reste inchangé et vert). Raison structurelle de l'asymétrie
  (avis intégré 11:04Z, retenue) : sous D6, `closedHint("execution reverted") === closedHint("execution reverted: <raison>")`
  ⇒ côté PAYANT « nu » n'est décidable que par `data` ; le texte sans raison n'est décidable que côté KEYLESS.
- `packages/rpc-guard/src/index.ts` — `export { isBareRevert } from "./classify.ts";` (+2 lignes de commentaire) ;
  `packages/rpc-guard/test/exports.test.ts` — ensemble fermé étendu de `"isBareRevert"` (sinon `public_export_set_is_closed` rougit ;
  c'est aussi le tueur du mutant M13 « export retiré »).
- `apps/sentinel/src/ukemi/rpc2.ts` `quorum2` — un revert PAYANT nu (`isBareRevert` ∧ unit ≠ keyless ; `isRpcRevert` faux pour
  lui, R-A) n'est **ni benché ni refroidi** : il est TENU (`held`), son opérateur compte comme vu (C-2), `lastErr` = lui (le
  NoQuorum le nomme par son indice fermé). Après la boucle, table fermée de résolution (un seul `got` + un `held`) :

  | seul autre résultat `w` | issue | motif |
  |---|---|---|
  | revert KEYLESS nu (`witnessOf` = bare) | les DEUX re-clés `revert:bare` ⇒ `ConcordantRevertError` (`onQuorum` true) | témoin keyless nu obligatoire (A') ; aucun message comparé entre unités |
  | revert KEYLESS avec `data` non vide (`data`) | payant `revert:bare` vs keyless `revert:<data>` ⇒ `QuorumDisagreementError` (`onQuorum` false) | « payant nu vs keyless avec data = discordance » (mission) |
  | revert KEYLESS sans data mais avec un TEXTE de raison (`reason`) | non admis ⇒ `NoQuorumError` | D-2 (ci-dessous) : l'indice fermé payant ne peut pas montrer une raison ; toute issue serait une comparaison de messages entre unités |
  | une VALEUR (keyless ou payant) | non admis ⇒ `NoQuorumError` (pas de refroidissement) | « admis SEULEMENT avec un témoin keyless nu » ; garde `paid_revert_with_empty_0x_data_is_benched` verte |
  | un revert PAYANT avec data | non admis ⇒ `NoQuorumError` | le témoin doit être KEYLESS |
  | rien / d'autres payants nus seulement | `NoQuorumError` | deux payants nus jamais concordés (D6) |
  | deux résultats déjà formés sans le payant | le payant tenu est ignoré | keyless + keyless = comportement antérieur |

- `apps/sentinel/src/ukemi/record.ts` — `rpc_errors[].data` = **indicateur fermé** `"absent" | "0x" | <longueur hex>` écrit sur
  CHAQUE entrée `RpcError` (`revertDataIndicator`, pur, non exporté) ; remplace l'hex validée d'avant le lot (qui n'était écrite
  que si définie — d'où le diag aveugle F-1/F-2). Type `RpcErrorRecord.data?: "absent" | "0x" | number`. Commentaire `:353-355`
  (base ; `:365-367` après le lot) mis à jour. Aucun consommateur de l'hex dans le dépôt (grep `rpc_errors` : `record.ts`, tests sans assertion sur `.data`,
  `u4-oracle-path.mjs` n'en lit que le compte).
- INTOUCHÉS (vérifiés §A-6) : `book.ts`, `resume.ts`, les 9 gelés, `apps/bell/**`, `apps/sentinel/test/ukemi-guard-record.test.ts`,
  `transport.ts`, `errors.ts`.

### Déviations / clarifications déclarées (F-3)

- **D-1 (lecture du §1, contradiction littérale tranchée)** : « admis dans `got` SEULEMENT si un témoin keyless nu » ET « payant
  nu vs keyless avec data = `QuorumDisagreementError` » sont incompatibles à la lettre (non admis ⇒ NoQuorum). Lecture retenue
  (= celle de l'advisor intégré 11:04Z) : le payant tenu n'est CONFRONTÉ qu'à un revert KEYLESS unique ; nu ⇒ concordance,
  data ⇒ discordance ; toute autre issue ⇒ non admis. Keyless VALEUR + payant nu ⇒ `NoQuorumError` (et non discordance) :
  requis par l'épingle existante `ukemi-guard-classify.test.ts:91-102` (son mutant nommé EST la discordance).
- **D-2 (sous-cas non couvert par la mission, tranché plus strict que l'advisor)** : keyless SANS data mais AVEC un texte de
  raison (`"execution reverted: X"`) vs payant nu ⇒ `NoQuorumError`, pas discordance. Motif : l'indice fermé payant ne peut
  pas montrer la raison (D6) ; déclarer une discordance reviendrait à comparer le message keyless au message payant
  (interdit) et recréerait le FAUX désaccord que R-A a fermé (`ADR-GARDE-HELIUS:365-367`). L'advisor lisait « tout revert
  keyless admis » ; **CONFIRMÉ par l'advisor de clôture** (~11:40Z : « raffinement de l'avis, pas contradiction » ; M11 rend
  l'alternative observable et rejetée).
- **D-3 (`record.ts`, divergence avec l'avis intégré)** : l'advisor recommandait d'AJOUTER un champ indicateur et de garder
  l'hex dans `data`. Retenu : `data` DEVIENT l'indicateur (lettre de la mission « `data: "absent" | "0x" | <longueur>` (jamais
  le corps) » ; ferme en outre, pour la surface journal, le résidu (3) de `ADR-GARDE-HELIUS:302-305` — hex de clé partielle /
  base64 relocalisée dans `.data`). **CONFIRMÉ par l'advisor de clôture** (la lettre de la mission prime ; consommateurs
  grepés : aucun ne lit la valeur de `rpc_errors[].data`, ni sur la base ni dans la version GARDE du fichier exclu).
- **D-4 (bascules de tests existants, diff annoté)** : (i) `test/guard-scripts-u4.test.ts:307-313` — `NoQuorumError` →
  `ConcordantRevertError` (bascule PRÉ-DÉCLARÉE par le commentaire « Flip if R-A's issue changes » ; stub `"0x"` sur tous les
  hôtes, jambe payante forcée ⇒ témoin Pocket keyless nu + chainstack nu) ; `assert.notEqual(… "QuorumDisagreementError")`
  conservée. Ce n'est pas un affaiblissement : l'issue payante égale désormais l'issue keyless nominale (`:245`). (ii)
  `apps/sentinel/test/ukemi-guard-classify.test.ts:6-8, :86-92` — commentaires seuls (« benched » devenu faux ; assertion et
  nom du test inchangés). (iii) `exports.test.ts` : +1 nom dans l'ensemble fermé.

## 2. Preuves

### Tests neufs (fichiers NEUFS ; `ukemi-guard-record.test.ts` non touché)

`apps/sentinel/test/ukemi-revert.test.ts` (12 tests ; composition = `runRecorder` servi, `globalThis.fetch` SEUL bouchonné, vrai
`openGuardedClient`, clé factice, hôte `.invalid`) — formes de fil = celles MESURÉES au §0 (A-8) ; source de fixture USDC
`0x3f73…095b` rendue revertante (le fixture n'a pas GHO) ; livre attendu recomputé par un chemin indépendant (`recordBook` sur
les octets du fixture, description vidée) ET épinglé : `f1ebccda…2b92` (intact `85a0f351…18a0`, holders `529bf2b8…f110`,
`fromBlock` = B − 3000).

| test | mission | preuve |
|---|---|---|
| `ukemi_revert_paid_bare_pairs_with_keyless_bare_witness_through_run_recorder` | (a) | pool {drpc keyless, chainstack payant}, revert nu MESURÉ des deux ⇒ exit 0, `oracle_description ""`, digests = attendus + épingles, `errors_by_operator` = {drpc 1, chainstack 1} (+1/opérateur), `rpc_errors` = liste fermée (indice fermé payant, `data:"absent"`), concordance `chainstack|drpc.org` 0 discordance et concordant = appels chainstack − 1, ligne write-ahead par tentative payante, 0 octet de clé |
| `ukemi_revert_paid_bare_0x_form_pairs_and_journals_0x` | (a) forme `"0x"` | même livre ; journal `data:"0x"` |
| `ukemi_revert_paid_bare_vs_keyless_with_data_disagrees_fail_closed` | (b) | `QuorumDisagreementError`, pas de livre, diag : `data` 10 (longueur) / `"absent"`, jamais les octets ; concordance discordante 1 |
| `ukemi_revert_two_paid_bare_reverts_never_concord` | (c) synthétique déclaré | deux payants nus ⇒ NoQuorum ; + témoin keyless nu ⇒ concordant ; payant avec data + payant nu ⇒ NoQuorum |
| `ukemi_revert_keyless_pair_unchanged_paid_never_drawn` | (d) | {drpc, mevblocker, chainstack} : paire keyless (V-4 absent/`"0x"`) ⇒ même livre, chainstack jamais tiré (0 ligne `attempted`) |
| `ukemi_revert_paid_revert_with_data_keeps_pre_lot_behavior` | (e) | même data des deux ⇒ concordant (clé data) ; payant avec data vs keyless nu ⇒ discordance |
| `ukemi_revert_incident_replay_course_survives` | (f) | composition de `record-t2.sh` (drpc/tenderly/chainstack, `--concurrency 8`, retries 6/1000/30000, heartbeat 500, `--resume`, concordance), 8 × 408 drpc MESURÉS (corps du diag) absorbés par 1 retry chacun, revert nu MESURÉ des deux ⇒ **exit 0** ; 2 lectures du revert par opérateur (prefetch + relecture `recordBook`) ; journal = 8 × 408 + 2 + 2 reverts ; 0 discordance ; le cache ne contient QUE les 2 descriptions réussies (comme le vrai cache, F-4) |
| `ukemi_revert_paid_bare_vs_keyless_value_is_no_quorum` | table ligne 4 | NoQuorum au message exact (indice fermé du payant tenu) puis lecture suivante concordante (pas de refroidissement) |
| `ukemi_revert_paid_bare_vs_keyless_reason_text_is_no_quorum` | D-2 | NoQuorum |
| `ukemi_revert_paid_non_revert_code_is_benched_not_held` | C-4 | code −32602 ⇒ banc + refroidissement (inchangé) |
| `ukemi_revert_paid_bare_is_never_cooled_down` | mutant cooldown | pool à 3 (dessin de l'advisor) |
| `ukemi_revert_r1_characterization_rejected_paid_data_pairs_as_bare` | résidu R-1 (CARACTÉRISATION, déclarative — pas une propriété vérifiée) | `data` payante = hex de la clé factice (rejetée c-bis) + témoin keyless nu ⇒ `ConcordantRevertError` AUJOURD'HUI ; contraste : `data` payante valide ⇒ discordance ; le correctif de REVERT-DATA-REJECTED-1 doit retourner la 1re assertion (bascule pré-déclarée) |

`packages/rpc-guard/test/bare-revert.test.ts` (4 tests, transport réel, fetch bouchonné) : forme mesurée ET `"0x"` nues pour
drpc (keyless), chainstack (`ru`) ET helius (`credits`) — B-1 : test nommé par opérateur payant ; `isRpcRevert` inchangé (vrai
keyless, faux payant nu) ; raison keyless ≠ nu / indice payant aveugle à la raison ; data non vide jamais nue ; code 3/−32000 seul.

Observation contre l'avis (mesurée par les mutants) : l'avis disait qu'un pool à 2 opérateurs ne tue pas « cooldown restauré »
(`live()` rendrait tout si tout est froid) ; mesuré : M3 rougit AUSSI (a) et (f) — drpc n'étant pas froid, `live()` rend `[drpc]`
seul ⇒ NoQuorum. Le test à 3 opérateurs est gardé comme tueur nommé.

### Mutants (D-1, A-11) — harnais `F:\tmp\ukemirevert\mutants\mutants.mjs`

- 11:21Z : **16/16 tués par leur test NOMMÉ** (TAP `not ok N - <nom>`, CRLF normalisé, restauration byte-exacte vérifiée par sha
  après chaque mutant ; ligne de base : chaque test visé VERT sur l'arbre non muté). Rejeu final sur l'arbre livré : ci-dessous.
- 11:31Z — rejeu sur l'arbre d'alors : 16/16 (`run-final.log` `0b2b298f…bd99`).
- **DÉFINITIF — 11:57:36Z, rejeu sur l'arbre LIVRÉ (avec le test R-1) : 16/16** (`mutants-result.json`
  `a7ef10812b30410b0ea21e539fd7b1d8958401dae6fa65abe3dc24c42047b35a`, harnais `mutants.mjs`
  `345fbf9e10b7b094dbedd98bc6fc2c6fdf9ed92208b731995b9d598573452c3e`, journal `run-final2.log`
  `6a14b322b2e3068e7decb7477227c9fd738c0458f0887165b3f4f8bea91b4798` ; ligne de base : `ukemi-revert.test.ts` 12 ok,
  `bare-revert.test.ts` 4 ok, `exports.test.ts` 5 ok ; en-tête : arbre `4a2f69f` + lot non commité, node v24.15.0, win32 ;
  chaque résultat porte find/replace, sha d'origine, sha muté, sha restauré — tous `restauré == origine`, `muté != origine`).
  Le test R-1 est DÉCLARATIF (caractérisation d'un résidu) : aucun mutant ne lui est attribué.

| id | mutant | fichier | tueur NOMMÉ (rouge) |
|---|---|---|---|
| M0 | quorum2 d'avant le lot (l'incident : payant nu benché + refroidi) | rpc2.ts | `ukemi_revert_incident_replay_course_survives` |
| M1 | appariement sans témoin keyless revert (admis contre n'importe quel résultat unique) | rpc2.ts | `ukemi_revert_paid_bare_vs_keyless_value_is_no_quorum` |
| M2 | deux payants concordés (payant nu admis comme un keyless) | rpc2.ts | `ukemi_revert_two_paid_bare_reverts_never_concord` |
| M3 | cooldown restauré sur le payant tenu | rpc2.ts | `ukemi_revert_paid_bare_is_never_cooled_down` |
| M4 | message comparé entre unités (clé par message de l'unité) | rpc2.ts | `ukemi_revert_paid_bare_pairs_with_keyless_bare_witness_through_run_recorder` |
| M5 | indicateur du diag fuyant le corps (hex journalisée) | record.ts | `ukemi_revert_paid_bare_vs_keyless_with_data_disagrees_fail_closed` |
| M6 | raison keyless acceptée comme nue (`startsWith`) | classify.ts | `ukemi_revert_paid_bare_vs_keyless_reason_text_is_no_quorum` |
| M7 | contrôle `data` retiré de `isBareRevert` | classify.ts | `ukemi_revert_paid_bare_vs_keyless_with_data_disagrees_fail_closed` |
| M8 | garde de code 3/−32000 retirée (C-4) | classify.ts | `ukemi_revert_paid_non_revert_code_is_benched_not_held` |
| M9 | payant par LABEL (`op === chainstack`) au lieu de l'unité (B-1) | classify.ts | `bare_revert_measured_wire_form_is_bare_for_keyless_and_both_paid_units` |
| M10 | indicateur `"0x"` replié sur `"absent"` | record.ts | `ukemi_revert_paid_bare_0x_form_pairs_and_journals_0x` |
| M11 | témoin « raison » traité comme « data » (discordance sur un message) | rpc2.ts | `ukemi_revert_paid_bare_vs_keyless_reason_text_is_no_quorum` |
| M12 | R-A retiré de `isRpcRevert` (`isRpcRevert` plus inchangé) | classify.ts | `bare_revert_measured_wire_form_is_bare_for_keyless_and_both_paid_units` |
| M13 | export `isBareRevert` retiré | index.ts | `public_export_set_is_closed` |
| M14 | payant jugé par la règle textuelle keyless (comparaison de messages au classifieur) | classify.ts | `ukemi_revert_paid_bare_pairs_with_keyless_bare_witness_through_run_recorder` |
| M15 | revert payant AVEC data accepté comme témoin | rpc2.ts | `ukemi_revert_two_paid_bare_reverts_never_concord` |

M0 est le contrefactuel : sur le `quorum2` d'avant le lot, (a) et (f) rougissent (la course meurt comme à 10:43:31Z).

### Oracle 7 portes (A-3, codes capturés directement, ceinture A-7)

- **DÉFINITIF — 11:54:40Z → 11:57:17Z**, arbre livré (`4a2f69f` + lot non commité, `DELIVERED.sha256` ci-dessous), node
  v24.15.0 (`F:\tmp\ukemirevert\oracle\final2\`) : `gate:vocab` 0, `typecheck` 0, `test` 0, `lint` 0, `lint:ratchet` 0 (69/69,
  aucune dette de typage ajoutée), `lang:gate` 0, `export:check` 0 — **7 × exit 0** ; tests **1 074 / 1 072 / 0 / 2** = base
  **1 058** + **16** neufs (12 + 4). (Run précédent 11:28:25Z → 11:31:14Z, avant l'ajout du test de caractérisation R-1 :
  7 × 0, 1 073 / 1 071 / 0 / 2 = 1 058 + 15.) **Compte attendu au G7 : N + 16, N = compte de l'arbre principal juste avant la
  fusion** (l'arbre principal a 1 skip là où le worktree en a 2 — artefacts e2 présents, `docs/ETAT-REPRISE.md:154` ; si
  GARDE-FSYNC-1 fusionne avant, N inclut ses tests). Skips du worktree = les 2 connus
  (`sentinel_run_releases_chainstack_lock_on_sigterm` win32 ; `u4b_labels_replay_via_main_real_artifact` artefacts réels absents
  du worktree — l'arbre principal les a : `docs/ETAT-REPRISE.md:154` y mesure 1058/1057/0/1). Base 1 058 mesurée au run de 11:14Z
  (fichiers de test = ceux de la base : les deux fichiers neufs n'existaient pas encore), où le seul rouge était la bascule D-4 (i).
- Correctifs faits en cours d'oracle (11:24Z, 1er passage) : `lint` (assertion de type inutile, `bare-revert.test.ts:24`),
  `lint:ratchet` 72 > 69 (`Array(n).fill` non typé → `Array.from`), `export:check` (chemin Windows absolu dans un commentaire de
  test exporté, D7 septies (iii)) ; + passage des ajouts de `rpc2.ts` en ASCII strict (F-2 : `⇒` → `=>`, la seule ligne non ASCII
  touchée pré-existait et a été laissée intacte).

### R-25 (A-5) — pathspec VERBATIM `ci.yml:65`

`F:\tmp\ukemirevert\r25\r25.mjs` (`fa4d9f01…f160`) extrait le pathspec de `.github/workflows/ci.yml:65` (vérifie que c'est la ligne
`git diff --shortstat "origin/${{ github.base_ref }}...HEAD" -- .`), indexe le lot dans un index TEMPORAIRE (`GIT_INDEX_FILE`
sous `F:\tmp` ; l'index réel n'est pas écrit — `git status` inchangé après), puis `git diff --cached --shortstat 4a2f69f -- <pathspec>`
(= forme trois-points CI, la base étant HEAD) — **DÉFINITIF (11:58Z) : 9 files changed, 638 insertions(+), 19 deletions(-) ⇒
657 ≤ 1 150** (`r25.json` `f4de46155186af87fe912c31cc8ab7d8ef9df2fc79c05843fc6e3f162872625e` ; mesure antérieure au test R-1 :
639). Par fichier : record.ts 17/5, rpc2.ts 31/3, ukemi-guard-classify.test.ts 9/6, ukemi-revert.test.ts 441/0, classify.ts 23/0,
index.ts 3/0, bare-revert.test.ts 103/0, exports.test.ts 3/0, guard-scripts-u4.test.ts 8/5 (code de production : 74+/8−).

### A-6 — invariants APRÈS (DÉFINITIF 12:04:28Z sur l'arbre LIVRÉ — après la dernière édition, test R-1 de 11:44Z : 15/15 SAME ; 1re mesure 11:32:26Z identique ; disque du lot vs blobs `HEAD`, `tr -d '\r' | sha256sum`)

| fichier | sha256 LF | état |
|---|---|---|
| `scripts/census/u4b/u4b-scores.mjs` | `2f9a31f614df05278dbf87353b07d405a016da8c3330968854731519f51445c0` | SAME |
| `scripts/census/u4b/u4b-reduce.mjs` | `a5e66cd387279f4696f09853633a553840dadc53979f78b94aa6f9af57a6fac0` | SAME |
| `scripts/record-u4b-calib.mjs` | `5733daeb7c8ee40ab0a657882bbe1a9bd03a00d4ddab99e01cfa052a1fbc31a3` | SAME |
| `apps/sentinel/src/ukemi/wadray.ts` | `7bee76fc96a9bc23bb5869ba89167ef58c0f1e8481ed0467ed445c0ee4de2322` | SAME |
| `apps/sentinel/src/ukemi/abi.ts` | `3376eb084f522cb25d708369efb9bc9d11f7b4598abdf4f36708bfd2c1ab2d66` | SAME |
| `packages/hikae/src/l1-split.ts` | `9206df9189d3eba6af61ba3f4a0981b08d80b63f99d171ad3e5a01958164ffa3` | SAME |
| `apps/sentinel/src/rpc.ts` | `0e232519a18aaa43cb46bc5244472940cfac0c95f104bf3df70c36ccc1c65ca0` | SAME |
| `packages/contracts/src/calib-digest.ts` | `3603265d0a1f1a4e3e1a1d57b4b568fcadf4f6861351c2ca49b38dc794c42380` | SAME |
| `scripts/census/u3-realized.mjs` | `cb0204250cce05f4846c7cfe821e72eecac22ffd636cfde4acff6a205b41a1af` | SAME |
| `docs/PLAN-u4b-prereg.md` | `1971d9b14ce0adf8c617f23e2ed1e323d80224cf442636aba5f7cf5fc5892f49` | SAME |
| `apps/sentinel/src/ukemi/book.ts` | `cb1ba53cbf15ca239bb25cf16da3023b2b9edbe31cba8b95a2d150c7ddc8ba9f` | SAME |
| `apps/sentinel/src/ukemi/resume.ts` | `8954c497467c35d71776d70d6649856179a464a8eff0672d6cf45e50e1789003` | SAME |
| `apps/sentinel/test/ukemi-guard-record.test.ts` | `7452240481b4d1f7162e20717f9db2ffd7959e726d2af18f9439eab79e7470d9` | SAME |
| `packages/rpc-guard/src/transport.ts` | `f95567f3212d8782062f7b3ad879497d8fea05b19891ca16209e3ef69a1a03a2` | SAME |
| `packages/rpc-guard/src/errors.ts` | `8622947f93d158a1311b43d46651c6b7076a1574ecc5984c6f5169a82380c504` | SAME |

9/9 gelés = valeurs du prereg §2 ; `apps/bell/**` : 0 ligne de diff, 0 fichier non suivi. `isRpcRevert` byte-identique
(`classify.ts` : 23 insertions, 0 suppression).

### DELIVERED.sha256 (A-4) — `F:\tmp\ukemirevert\DELIVERED.sha256` (chemins relatifs au worktree, `sha256sum -c` OK 9/9)

```
611339150a871404620364bbbb232594d3bc40e9ed9651655bd772dc5d415d0b  apps/sentinel/src/ukemi/record.ts
382101298577381ee4a42f4c1641c14245c5be920b10bc2fe0e5b3641346cfe9  apps/sentinel/src/ukemi/rpc2.ts
fd1eec931dd9ff79f223355685a6562075b9736587e47cd419197a00172ec848  apps/sentinel/test/ukemi-guard-classify.test.ts
fc7a60a10d3293282f1effffd5a29d88db008b56b470567e84a31914402fe9ee  apps/sentinel/test/ukemi-revert.test.ts
49a0828563fcd9ace5d049d60f55dcb51cc5d98a479fbd9b2ae0bc1f597dba75  packages/rpc-guard/src/classify.ts
db2908e99f2ea30824cb67d2ed380e50ba51475632a01d1d7ca43e14b7d4c5c8  packages/rpc-guard/src/index.ts
c9df0d06a3f0d58325763d77c003ee5837a4c45ab86421aeccb28a0cf6dd13fe  packages/rpc-guard/test/bare-revert.test.ts
8e69ccd545e9505fe8dc04197bb101e4f50463635b7d02cdfd5bfcb7fd8a37a8  packages/rpc-guard/test/exports.test.ts
6b1a7b950187266420655d761bc4a789f181c81c5de691ca6da97007e7718bb1  test/guard-scripts-u4.test.ts
```

Blobs git (garde de relance) : record.ts `24ad511fd3334dd8ba05712701a3c08cf72118bc`, rpc2.ts
`f5d6298d7428b8655eabf435559f361f40ccb492`, classify.ts `4c2fa9e7867383aef4dbffbb6c3fc9493f7590a7`, index.ts
`6eb18deae206d5959da7636226a34a82d52cea35` (`git hash-object`, disque du lot).

### Fusion à blanc contre `lot/garde-fsync-1` @ `9ea2e8b` (11:33Z →)

- Topologie mesurée : `merge-base(4a2f69f, 9ea2e8b)` = `66f75c2` ; fichiers de GARDE-FSYNC-1 depuis `66f75c2` =
  `packages/rpc-guard/src/{cli,ledger,lock,reconcile,repair}.ts`, `packages/rpc-guard/bin/rpc-guard.mjs`,
  `packages/rpc-guard/test/{durable.test,harness,no-fsync,repair-tail.test}.ts`, `apps/sentinel/test/ukemi-guard-record.test.ts`,
  `docs/**` ⇒ **∩ fichiers du lot = ∅**.
- Méthode sans commit (R-20) : clone jetable `git clone --shared --no-checkout F:/Monark F:/tmp/ukemirevert/dry` ; détaché sur
  `4a2f69f` ; `git merge --no-commit --no-ff 9ea2e8b` (simule le G7 GARDE-FSYNC-1) ⇒ exit 1, **exactement les 2 conflits
  connus, hors lot** : `apps/sentinel/test/ukemi-guard-record.test.ts` (le fichier de test exclu) et `docs/G1-lot-garde-fsync-1.md`
  (add/add) ; résolus À BLANC côté `ours` (etude-suite) pour pouvoir continuer — déclaré : la vraie résolution (union) est celle
  du G7 GARDE ; puis `git apply --3way --index lot.patch` (`lot.patch` `f607e7b9…cdccd`, 9 fichiers, produit par index temporaire)
  ⇒ **exit 0, 0 fichier non fusionné : 0 conflit du lot** ; les 9 fichiers du lot sont byte-identiques (sha) au worktree ; les
  pièces GARDE (`repair.ts`, `durable.test.ts`, `no-fsync.ts`) présentes.
- **Oracle 7 portes sur l'arbre fusionné** (11:34:33Z → 11:47:15Z, `npm ci --ignore-scripts` du clone, `require.resolve` =
  `F:\tmp\ukemirevert\dry\packages\rpc-guard\src\index.ts`, état = `lot.patch` à 15 tests) : `gate:vocab` 0, `typecheck` 0,
  `lint` 0, `lint:ratchet` 0, `lang:gate` 0, `export:check` 0 ; `test` exit 1 : **1 090 / 1 087 / 1 / 2**, l'UNIQUE rouge =
  `export_public_no_governance_no_french` (test 42, `test/export-public.test.ts:115`) : `EPERM` au `rmSync` du `finally`
  (`:332`) après 694 s. Analyse (lue dans le test) : la CI exportée (`npm run ci`, `spawnSync` à `timeout: 600_000`) a dépassé
  600 s sous la charge du run complet — l'arbre à blanc porte la version `ours` de `ukemi-guard-record.test.ts` SANS l'import du
  support no-fsync de GARDE (26 725 fsync réels mesurés par GARDE sur ce fichier) — puis l'`EPERM` du `finally` a masqué
  l'assertion de timeout. **Rejeu SEUL** (11:47:41Z → 11:54:16Z) : **test 42 VERT** (392 s ; `t42-rerun.log`
  `ac75a75a…ecd0d`) ⇒ contention d'environnement + artefact de ma résolution à blanc, pas un défaut du lot (la CI exportée
  contient les tests du lot et passe). Logs : `oracle\dry\codes.txt` `2f29eb2c…0e5609`, `test.log` `5bf0d71e…dcab53`.
- Durées mesurées de mes tests SUR l'arbre fusionné (fsync RÉEL de GARDE) : 2,0-3,1 s par test `runRecorder`, ≈ 16 s pour le
  fichier (contre 52,8 s pour `ukemi_record_then_unlock_then_reconcile_end_to_end` seul) — quelques centaines d'appends,
  pas des milliers : sous le critère de GARDE (I-10 : le support no-fsync est réservé aux fichiers de milliers d'appends),
  le fichier neuf n'a pas à l'importer. Observation à déclencheur (pas un dû) : si la durée du test 42 sur l'arbre principal
  fusionné approche le `timeout` de 600 s, étendre le support no-fsync à `ukemi-revert.test.ts` (ruling GARDE requis).
- **Delta après ajout du test R-1** : patch final `lot.patch` `c0dbd6a931d4af59ddc1962c48915a9e65870282c8d8db1715debc971203ddac`
  (1er : `f607e7b9…cdccd`) rejoué sur un 2e clone frais (`dry2` : `4a2f69f` ⊕ `9ea2e8b` `--no-commit`, mêmes 2 conflits connus
  hors lot, puis `apply --3way`) ⇒ exit 0, 0 non fusionné, 9/9 fichiers = `DELIVERED.sha256` ; sur l'arbre d'oracle `dry` mis
  à jour (9/9 = DELIVERED) : `typecheck` 0, `eslint` du fichier 0, les 5 fichiers de test touchés **39/39** (11:58:45Z →
  11:59:32Z ; `oracle\dry\delta-codes.txt`). « 1 091 » (= 1 090 + 1) est le compte de l'arbre À BLANC (résolution `ours` du
  fichier exclu), PAS la cible : la formule qui gouverne au G7 est **N + 16** ; la résolution union de GARDE ajoute en plus
  `ukemi_guard_record_skipped_the_platter_flush_nonvacuous` (+1, compté dans N si GARDE fusionne avant).

## Ligne de relance proposée (le worker n'écrit rien sous `F:\course-ukemi`, R-20)

`F:\course-ukemi\record-t2.sh` : **seule la garde de blob change** — remplacer la ligne
`test "$(git -C F:/Monark-wt-ukemiexec rev-parse HEAD:apps/sentinel/src/ukemi/record.ts)" = 833db0da… || { …; exit 3; }`
par UNE garde par fichier porteur du correctif (le correctif vit dans quatre fichiers ; ne garder que `record.ts` laisserait
passer un arbre sans `quorum2` corrigé) :

```
for pair in apps/sentinel/src/ukemi/record.ts=24ad511fd3334dd8ba05712701a3c08cf72118bc apps/sentinel/src/ukemi/rpc2.ts=f5d6298d7428b8655eabf435559f361f40ccb492 packages/rpc-guard/src/classify.ts=4c2fa9e7867383aef4dbffbb6c3fc9493f7590a7 packages/rpc-guard/src/index.ts=6eb18deae206d5959da7636226a34a82d52cea35; do f=${pair%%=*}; b=${pair#*=}; test "$(git -C F:/Monark-wt-ukemiexec rev-parse HEAD:$f)" = "$b" || { echo "STOP: $f blob != UKEMI-REVERT-1 G7" >&2; exit 3; }; done
```

Les quatre valeurs sont celles du disque du lot : **à re-mesurer sur le commit de fusion G7** (`git rev-parse <G7>:<f>`) — un
pli qui toucherait l'un de ces fichiers les change. Tout le reste de la ligne (opérateurs, caps par formule, `--resume` sur le
cache du temps 1, `--concordance-out`, `--prereg-sha`/`--labeler-sha`) est inchangé ; précondition (a) du script : re-pin de
`F:\Monark-wt-ukemiexec` sur le commit G7 (sinon la garde STOP exit 3).

## D-n pré-déclarée (Sidecar 3, au lancement du temps 2 corrigé)

« D-n (UKEMI-REVERT-1, essai n+1, temps 2 payant post-lot) : `description()` GHO ⇒ `ConcordantRevertError` drpc(nu) +
chainstack(nu), 0 discordance sur ces lectures, cap RU inchangé ; falsifié si la `data` chainstack ≠ `"0x"`/absente (indicateur
`rpc_errors[].data` de la provenance ou du diag). » Attendu mesurable : 2 lectures de la source GHO par opérateur à
`--concurrency 8` (prefetch + relecture `recordBook`, test (f)), soit 2 × (1 keyless + 2 RU).

## `error_origin` (proposé ; assigné au G7)

**Test manquant** : la composition « jambe payante + lecture à revert toléré » n'avait jamais été rejouée par un test
d'intégration non-LLM (règle Branchement 2026-09-19) — les tests de concordance de revert étaient keyless (F-5). Origine
secondaire : **spec R-A muette** sur sa conséquence pour la seule lecture à revert toléré. Le motif D6 de R-A reste valide ; pas
un défaut du plan 140 (`docs/CHANTIERS.md:1080` proposait « plan » : à trancher au G7).

## Résidus (zéro dette nue) — reportés tels quels dans l'amendement ADR

- **R-1** : `.data` payante REJETÉE par `validateRevertData` ≡ ABSENTE (`RpcError.data === undefined`) ⇒ classée nue. Borné (témoin
  keyless nu obligatoire ; issue = `ConcordantRevertError`, tolérée sur `description()` seul ; visible à l'indicateur
  `"absent"`). **Item formé REVERT-DATA-REJECTED-1** (propriétaire orchestrateur ; déclencheur : prochain lot autorisé à modifier
  `transport.ts`/`errors.ts`, hors du périmètre fermé de ce lot) : marquer la `data` rejetée à la source ; ne jamais tenir un
  revert payant à `data` rejetée. La FORME existe dans la suite : `ukemi_record_failed_paid_rpcerror_leaks_no_key_on_any_surface`
  (`ukemi-guard-record.test.ts:351`) sert sur chainstack une `data` = hex de clé (rejetée c-bis ⇒ `undefined`) et un message
  dont l'indice fermé est celui d'un revert nu ; elle n'y atteint pas `quorum2` (servie au 1er appel chainstack = la lecture
  `finalized()`, qui benche toute erreur, `rpc2.ts` `finalized`) ⇒ ce test reste vert et ne tranche pas R-1.
- **R-2** : une seule lecture sondée (source GHO) ; couvert par la falsification de la D-n.
- **R-3** : témoin keyless « raison sans data » face à un payant nu ⇒ `NoQuorumError` fail-closed ; déclencheur : observation
  en course ⇒ consultation formée.
- **PROV-MODEL-1** (item existant, `ADR-U4b:1857`) : non déclenché (déclencheur = prochain lot recorder APRÈS le temps 2).

## Consigne standard G1 : point par point

| point | état | preuve / motif |
|---|---|---|
| A-1 | fait | 1re ligne du rendu ; préfixe `claude-opus-5-5` |
| A-2 | fait (voie de la mission) | la mission impose `npm ci --ignore-scripts --cache F:/tmp/npm-cache` (pas `mk-nm.ps1`) ; `require.resolve('@monark/rpc-guard')` = `F:\Monark-wt-ukemirevert\packages\rpc-guard\src\index.ts` ; `node_modules` laissé en place (liens npm, pas de jonctions mk-nm) |
| A-3 | fait | `cmd > log 2>&1; echo exit=$?` sans pipe ; 7 portes |
| A-4 | fait | `DELIVERED.sha256` ; rendu sous `F:\tmp\ukemirevert\` ; aucun commit ; rien sur `C:` (TEMP/TMP/TMPDIR, cache npm sous `F:\tmp`) ; tests sans réseau (fetch bouchonné, clé factice, hôte `.invalid`) ; SEULE action réseau = la sonde §0 exigée par la mission (2 RU, journalisée) |
| A-5 | fait | 657 ≤ 1 150 (définitif), pathspec extrait de `ci.yml:65` |
| A-6 | fait | 15 invariants SAME (9 gelés + prereg + 5 intouchables) |
| A-7 | fait | ceinture `env -u` × 8 sur chaque oracle/test/mutant (enfants du harnais : 8 clés supprimées de l'env) ; aucune variable affichée (présence/longueur seulement) |
| A-8 | fait | formes de fil MESURÉES (§0) + corps 408 verbatim du diag dans les tests de composition |
| A-9 | n/a | aucune phrase servie touchée |
| A-10 | fait (sortie du livre) | la sortie `oracle_description`/`book_digest` du chemin servi est assertée ÉGALE au livre recomputé (chemin indépendant) ; l'indicateur `data` asserté égal à la forme de la `data` servie par le stub |
| A-11 | fait | TAP + CRLF + byIntended (16/16) |
| A-12 | fait | en-têtes sonde + harnais (arbre, node, plateforme, commande, sha du harnais ; par mutant diff + 3 sha) |
| A-13 | fait | tous les fichiers par Write/Edit ; un seul heredoc Bash, vers `/dev/null` (n'écrit rien) — déclaré |
| B-1 | fait | aucun texte libre de corps payant (message = indice fermé ; `data` = forme ; sonde = indicateurs + un booléen) ; test nommé par opérateur payant (chainstack ET helius) ; mutant M9 « payant par label » rouge |
| B-2, B-3 | n/a | aucun nouveau chemin d'expurgation/troncature ; l'indicateur ne porte aucun octet (résidu (3) fermé pour le journal) |
| B-4 | fait | le code ne lit aucun env ; opérateurs/cycle restent des arguments CLI |
| B-5, B-6 | n/a | aucun `fetch`/http/`child_process`/lecture de clé ni hôte ajouté au code du dépôt (grep CI vert dans la suite) |
| C-1 | fait | `instanceof RpcError` de la classe canonique (`errors.ts`), aucune classe locale |
| C-2, C-3 | fait (inchangé) | le refus de budget reste le 1er test du `catch` de `quorum2` ; une seule couche de retry (shim inchangé hors indicateur) ; le revert tenu n'est jamais réessayé |
| C-4 | fait | `isBareRevert` dans `classify.ts` ; aucune alternative regex ajoutée (test structurel inchangé, vert) ; garde 3/−32000 épinglée (test + M8) |
| D-1..D-4 | fait | 16 mutants nommés ; vecteurs non vides + listes fermées + valeurs recomputées ; composition `runRecorder` ; diff de tests annoté (D-4 supra) |
| E-1, E-2 | n/a (inchangés) | la sonde a pris et relâché le verrou par le `unlock` servi ; ledger durable hors dossier de travail, chaîne revérifiée |
| E-3 | fait | cooldowns déclarés à l'ADR (payant nu tenu : aucun ; fautes : 25 s inchangé) |
| F-1..F-3 | fait | tuyaux par pièce, aucun renvoi `F:\tmp` dans l'ADR ; ASCII dans les ajouts de sources ; D-1..D-4 déclarées |
| G-1 | n/a (orchestrateur) | note : l'ensemble d'exports de `@monark/rpc-guard` gagne un CLASSIFIEUR (pas un chemin payant, commentaire de `exports.test.ts`) |
