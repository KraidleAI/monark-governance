claude-opus-5-5

# G1 — lot RPC-GUARD-FIRST-APPEND-1 : journal de l'implémenteur

Grand livre neuf, corps de réponse borné (sur option), relevés entiers non négatifs. Partie 1 du chantier « page snapshot ».

## 0. Identité, base, horloge

- **Modèle résolu** : `claude-opus-5-5` (R-1) ; implémenteur, instance fraîche, effort max (mission).
- **Mission** : `F:/tmp/dojo/mission-impl-rpcguard.md` (60 l.), sha256 recalculé à 00:07:44Z :
  `6a9c4826eb6328ba5b46aced2529bb7e30d77d590f12c16d9563cc624b1253ae`, égal au champ `sha` du reçu
  `F:/tmp/dojo/mission-impl-rpcguard.recu.json` (sha256 `7e4e4e8c89cc3468…`, verdict vert, `head` = `8263ddb4…`).
- **Base** : worktree `F:/Monark-wt-rpcguard-first`, branche `lot/rpcguard-first`,
  HEAD `8263ddb41b0ea81a5b3e33d365f191b0e1581f51` (plan du lot sur le tronc `8950ab15`), arbre propre à 00:07:44Z.
- **Empreintes de l'en-tête de mission, recalculées (00:07Z)** : plan `e4cef739…`, `lint.mjs` `4d1383c8…`, `launch.mjs` `fb6c277f…`,
  `run.mjs` `f22b9045…`, `r25.mjs` `4d0544df…`, `red-proof.mjs` `6579b550…`, REGLES-MISSION `64700025…` : toutes égales.
- **Horloge** (`date -u`) : 00:07:44Z vérification ; 00:08Z-00:26Z lecture ; 00:26:14Z relevé des sha256 ; écriture de ce
  journal (§0-§2) avant tout code ; les heures suivantes sont portées à leur section.

## 1. Lecture (tâche 1)

Ordre de la mission, chaque entrée en entier sauf mention. sha256 complet pour les entrées primaires, 16 caractères sinon.

**Entrées de la mission**

| Entrée | sha256 | Lu |
|---|---|---|
| `docs/ETAT.md` (59 l.) | `8fc81155d30f93b7dca04ac5c63b454c45d307a9593e18703e4a6e76f02fab62` | en entier |
| `docs/G0-lot-rpcguard-first.md` (302 l.) | `e4cef7397ae66b8f81d6584156c5fc03deb749090e8b3f45105fcf4a81344ba7` | en entier |
| `packages/rpc-guard/src/` (14 fichiers, 1 404 l.) | voir ci-dessous | en entier |
| `packages/rpc-guard/bin/rpc-guard.mjs` (36 l.), `package.json` | `44842f8457a9dfdd`, `723059739f0b797f` | en entier |
| `packages/rpc-guard/test/` (21 fichiers, 2 967 l.) | égaux au §1 du plan, recalculés à 00:08:14Z | en entier |
| `apps/dojo/src/collect.ts` (274 l.) | `d257c08c259e16417852fb8d7eb782dcf7c210338dc622dd7f8f656933897352` | l.1-40, l.100-210 |
| `F:/Monark/scripts/red-proof.mjs` (268 l.) | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` | l.1-70 (`parseKiller`) |

Sources du paquet (sha256 de la base, 16 caractères) : `ledger.ts` `0a9699bc3bdf9abd` (221 l.), `transport.ts`
`4ad8e9d9c450fff1` (301 l.), `client.ts` `ef99818b3c996cea` (173 l.), `reconcile.ts` `d4b86972df03a857` (162 l.),
`repair.ts` `e997c6fdd4802a61` (75 l.), `cli.ts` `28cb5fb38290b13c` (58 l.), `guarded.ts` `e506d825fd1767ed` (63 l.),
`errors.ts` `8622947f93d158a1` (62 l.), `index.ts` `3e1ae1248c6085fc` (31 l.), `lock.ts` `6655a9c82a40106f` (44 l.),
`classify.ts` `49a0828563fcd9ac` (81 l.), `tariff.ts` `06d2b664b64a6877` (133 l.), `bell-methods.ts` `60a0b2f256bc3e70` (19 l.).

**Lectures d'appui** (pour les portes, les tests touchés et les sondes)

| Entrée | sha256 (16) | Lu |
|---|---|---|
| `docs/RUNBOOK-rpc-guard.md` (219 l.) | `fa78eb7562bb11f3` | en entier |
| `apps/dojo/test/dojo-history-collect.test.ts` | `af68a5b601ff631c` | l.1-30, l.270-330 (panne armée sur `<op>.head`) |
| `apps/dojo/test/helpers/collect-chain.ts` | `89318fec03ceeda6` | l.36-80 (réponses `Response` réelles) |
| `apps/dojo/test/dojo-collect.test.ts` | `ad9e85561a259d54` | l.355-375 et par recherche |
| `test/dojo-collect-deploy.test.ts` | `04f966e2845eb1db` | par recherche (aucun test n'épingle l'appel du garde) |
| `test/rpc-guard-fetch-only-inside-client.test.ts` | `7ca957022994d710` | par recherche (motifs réseau hors `transport.ts`) |
| `apps/sentinel/src/keyless-transport.ts` | `be2266c5a3c5b113` | l.10-35 (minuteur effacé après le corps) |
| `scripts/lang-gate.mjs`, `scripts/grep-forbidden.mjs` | `45e4420f5a2db472`, `fe0566b8835e6bb1` | l.1-200 ; l.1-60 et `vocab-banned.json` |
| `eslint.config.mjs`, `tsconfig.json`, `lint-ratchet.json` | `c1c9ac9d39e17877`, `e9f78b864977f387`, `c2d5cab0bddb9e64` | en entier |
| `scripts/lint-ratchet.mjs`, `scripts/export-public.mjs` | `e8c495b8b7e04169`, `a79ad0915ec2fbe5` | l.1-30 ; l.1-25 |
| `.github/workflows/ci.yml`, `scripts/oracle/r25.mjs` | `0f401ae2da253b76`, `4d0544dfe6c3cb31` | l.44-100 ; en entier |
| `F:/tmp/dojo/cp2-rg1a/evidence/nonneg-trial.diff` | `564df2cf87fde3b9` | en entier |
| `F:/tmp/dojo/cp2-rg1a/probes/cp2-rg1a-probes.nonneg-copy.ts` | `9212ba735baceefa` | l.25-60 (cas A3 : avant −10, après −5) |
| `F:/tmp/dojo/cp2-rg1a/CHECKPOINT2-lot-rg1a.md` | `eebc89aff3dce644` | par recherche (§4, C-V-5) |
| `F:/tmp/dojo/drand-1a/mk-nm.ps1`, `rm-nm.ps1` | `d70d8aeadc8bc1d3`, `b51b5d22fa89e322` | en entier |

**Faits lus qui contraignent l'écriture**

- `red-proof.mjs` : un test jugé doit rougir à la base par un échec d'assertion (`ERR_ASSERTION`) ; vert à la base,
  rouge d'import sur un fichier existant, ou test expiré : refusé ou non conclu (l.9-12). Tueur : la ligne juste
  au-dessus de `test(`, fichier de production, `<before>` présent une fois sur la ligne, opérateurs COR, ROR, SDL, CONST.
- `durable.test.ts` l.264-299 : aucun `process.env`, aucune affectation `DURABLE_FS.<x> =` dans `src/`, aucune mention
  du support de test sans fsync ; le scan des sites réseau interdit `fetch(` et `undici` hors de `transport.ts`.
- `export-public.mjs` : garde des chemins de lecteur Windows sur les fichiers exportés ; `lang-gate.mjs` ignore `docs/`.
- `docs/RUNBOOK-rpc-guard.md` §3 étape 6 cite `reconcile.ts:114` et `:115` : ces deux lignes ne bougent pas.
- Transport Bash : un `grep` avec une séquence à barre inverse a rendu un compte faux (00:20Z) ; les octets ont été
  recomptés par un script sans barre inverse (aucun CR, aucune tabulation) ; les fichiers sont écrits par l'outil
  d'écriture, jamais par un heredoc.
- Mesure de base : `npm run lint:ratchet` sur le clone `F:/tmp/dojo/rpcguard/base` (HEAD `8263ddb4`) à 00:24:13Z :
  `69/69`, exit 0. Le lot doit ajouter +0.

## 2. Compte ascendant par fichier (avant tout code)

Insertions plus suppressions, pathspec de `ci.yml` l.82 (`docs/**/*.md` exclu). Estimation, jamais une mesure.
Écart avec le §2.10 du plan (246) : Q-1 (opt-in) ajoute la ligne du collecteur et les deux voies des tests ;
la preuve F2P de l'inspection impose des témoins à la base (§8).

| Fichier | Postes | Asc. |
|---|---|---|
| `packages/rpc-guard/src/ledger.ts` | en-tête 6 ; drapeau 1 ; genèse au premier ajout 2 ; ouverture 4 | 13 |
| `packages/rpc-guard/src/repair.ts` | commentaire l.34 | 2 |
| `packages/rpc-guard/src/reconcile.ts` | deux sites 4 ; doc l.101-102 4 ; prédicat en fin de fichier 3 | 11 |
| `packages/rpc-guard/src/transport.ts` | doc 2 ; constante 3 ; option 8 ; validation 3 ; échéance 2 ; lecteur 26 ; deux corps 6 | 50 |
| `apps/dojo/src/collect.ts` | l.127, l'option du collecteur | 2 |
| `packages/rpc-guard/test/first-append.test.ts` (neuf) | en-tête 12 ; T-1 18 ; T-2 24 ; T-3 30 ; T-4 20 | 104 |
| `packages/rpc-guard/test/body-bound.test.ts` (neuf) | en-tête et pilotes 22 ; T-5 30 ; T-6 34 ; T-7 18 | 104 |
| `packages/rpc-guard/test/durable.test.ts` | l.33 3 ; (1) et (4) 8 ; l.205 2 ; tueurs 3 | 16 |
| `packages/rpc-guard/test/course-window.test.ts` | l.85-89 6 ; l.214 3 ; cas mesuré 2 ; C-PR 3 ; tueurs 2 | 16 |
| `packages/rpc-guard/test/error-hint.test.ts` | l.154-165 : le nom ajouté et un vrai `BodyTooLarge` 8 ; tueur 1 | 9 |
| **Total** | | **327** |

×2,1 = 687 ; les deux sous 1 150. Hors R-25 : `docs/RUNBOOK-rpc-guard.md` et ce journal.

## 3. Décision → fichier → test (numéros de ligne de l'arbre final)

| Décision | Fichier | Tests |
|---|---|---|
| D-2 (a) : genèse durable AVANT la première ligne | `ledger.ts` l.201 (drapeau), l.211 (genèse) | T-1, T-2, T-3 ; durable l.33, (1), (4), 6 fsync |
| D-2 (b) : tête de genèse seule = grand livre neuf | `ledger.ts` l.194-195 | T-1 (2), T-2 (2), témoin de T-4 |
| D-2 (c), (d) : refus inchangés ; ouvrir n'écrit rien | `ledger.ts` en-tête l.15-18 ; `repair.ts` l.34 | T-1 (1), T-4 |
| D-3 (a) : une échéance par tentative | `transport.ts` l.300 (`due`), l.130 (minuteur du corps) | T-5 ; sonde S-1 |
| D-3 (b) : lecture bornée, course, décodage | `transport.ts` l.117-145 (`readBoundedBody`) | T-5, T-6, T-7 ; sonde S-2 |
| D-3 (c) : noms ; réservation gardée | `transport.ts` l.322-328 ; `client.ts` inchangé | T-5 (1), (2) ; T-6 (2), (3) ; `error_preamble…` |
| D-3 (d) : option, 8 MiB, refus avant verrou | `transport.ts` l.44, l.78-90, l.206-209 | T-6 (1), (4), (6) |
| Q-1 (opt-in) : le collecteur demande la borne | `apps/dojo/src/collect.ts` l.127 | voie sans option : T-5 (3), T-6 (5) |
| D-3 (e) : porte STOP du pic RSS | sonde S-3 (§8) | 121,2 MiB ≤ 256 MiB |
| D-4, Q-3 : entier sûr ≥ 0, `snapshot_invalid` | `reconcile.ts` l.101-102, l.124, l.146, l.164-166 | `reconcile_course_window…`, `cli_unlock…` |
| RG-PRECEDENCE-TEST-1 (C-PR) | test seul | assertion C-PR (§4) |
| C-RB | `docs/RUNBOOK-rpc-guard.md` §1, §3, §6 (étapes 2, 4, 5) | documentation |
| D-8 (STOP) | aucun fichier neuf sous `src/` ; `index.ts`, `package.json` intacts | `public_export_set_is_closed`, `dojo_collect_tree_…` |

Règle de l'option (doc de `TransportOpts`) : le corps est borné si et seulement si `boundBody === true` ou `maxBodyBytes` est
posé ; plafond = `maxBodyBytes`, sinon `DEFAULT_MAX_BODY_BYTES` (8 MiB) ; `maxBodyBytes` posé est validé (entier sûr ≥ 1)
dans `resolveOperators`, donc avant tout verrou. Sans option, la lecture héritée est intacte (minuteur effacé aux en-têtes).

## 4. Tests (tâche 3) et tueurs

Chaque test neuf ou amendé porte, sur la ligne juste au-dessus de `test(`, un tueur au format de `parseKiller` ; les treize
lignes ont été rejouées contre l'arbre final par `F:/tmp/dojo/rpcguard/tools/killers.mjs` (import de `parseKiller`, contrôles
de `killerProblem` l.51-59) : 13 valides, aucun test inchangé n'en porte. Aucun F2P, aucun mutant lancé (inspection finale).

| Test | Fichier | Tueur |
|---|---|---|
| T-1 `rpc_guard_new_ledger_head_precedes_its_first_line` | `first-append.test.ts` | `ledger.ts:211` SDL de la genèse |
| T-2 `rpc_guard_first_append_crash_is_healed_never_refused` | `first-append.test.ts` | `ledger.ts:194` ROR `!==` en `===` |
| T-3 `rpc_guard_first_append_kill_is_unlocked_by_the_served_bin` | `first-append.test.ts` | `ledger.ts:188` CONST `>= 1` en `>= 2` |
| T-4 `rpc_guard_head_tamper_stays_refused_after_the_genesis_head` | `first-append.test.ts` | `ledger.ts:194` CONST `hasHead` en `false` |
| T-5 `rpc_guard_attempt_deadline_bounds_a_body_that_never_ends` | `body-bound.test.ts` | `transport.ts:130` SDL du minuteur |
| T-6 `rpc_guard_body_cap_refuses_a_giant_body_by_name` | `body-bound.test.ts` | `transport.ts:141` ROR `>` en `>=` |
| T-7 `rpc_guard_bounded_read_decodes_like_response_text` | `body-bound.test.ts` | `transport.ts:142` CONST sans `stream` |
| `durable_append_writes_the_line_then_the_head_in_order` | `durable.test.ts` | `ledger.ts:211` COR `!headOnDisk` |
| `durable_head_rename_retries_a_sharing_violation_with_a_bounded_backoff` | `durable.test.ts` | `ledger.ts:211` CONST écriture en place |
| `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` | `durable.test.ts` | `ledger.ts:201` CONST `= true` |
| `reconcile_course_window_isolates_one_course` | `course-window.test.ts` | `reconcile.ts:166` CONST `isFinite` |
| `cli_unlock_returns_the_unlocked_sha` | `course-window.test.ts` | `reconcile.ts:146` CONST ancien motif |
| `error_preamble_carries_no_vocabulary_token` | `error-hint.test.ts` | `transport.ts:141` CONST nom avec blancs |

Conception pour la preuve F2P de l'inspection (`red-proof.mjs` l.9-12, lu) : chaque test jugé rougit à la base par une
assertion. Les fichiers absents se lisent `null`, les ouvertures refusées sont rendues et non levées (`tryOpen`), les exports
neufs de `transport.ts` se lisent par l'espace de noms du module, un appel bloqué se lit par une course (`within`).

## 5. Passages (clone `F:/tmp/dojo/rpcguard/gel`, TEMP `F:/tmp/dojo/rpcguard/tmp`, verrou d'hôte libre avant chacun)

| Passage | Heure (fin) | Résultat | Sortie (sha256, 16) |
|---|---|---|---|
| `packages/rpc-guard/test/*.test.ts`, premier | 00:41:54Z | 119/119 | `f2b9290249136f50` |
| idem, état final | 00:55:22Z | 119/119 | `9408e9f6e0607f70` |
| Dōjō et racine (6 fichiers), premier | 00:43:59Z | 67/67 | `b29b4e45b6de94cb` |
| sentinelle (8 fichiers), premier | 00:49:05Z | 93 verts, 1 saut win32 déclaré | `180dbdafa4a90104` |
| Bell (17 fichiers), premier | 00:49:41Z | 235/235 | `4738892d18fb2a40` |
| Dōjō, racine et Bell (23 fichiers), état final | 00:56:46Z | 301/302 : le rouge est §10, item 1 | `ca07a339e3bd3075` |
| sentinelle, état final | 01:04:06Z | 93 verts, 1 saut win32 déclaré | `4cf8818f993a50c4` |
| `test/dojo-collect-deploy.test.ts` seul, état final | 01:04:14Z | 8/8 | `51d9a9e63e76e60d` |

Le saut est `sentinel_run_releases_chainstack_lock_on_sigterm` (saut win32 déclaré dans le test, préexistant). Entre le
premier passage et l'état final, les sources n'ont changé que par une assertion de type (`transport.ts` l.126, effacée à
l'exécution) et des messages de test ; tout a été rejoué sur l'état final.

## 6. Portes statiques (clone `gel`, état final synchronisé à 00:51Z)

`typecheck` exit 0 ; `lint` exit 0 (premier passage : 6 erreurs, corrigées : valeurs `any` du corps de `Response`, typé
`ReadableStream<Uint8Array>` ; `String()` d'un `CycleLedger`) ; `lint:ratchet` `69/69` exit 0 (base `69/69`, 00:24:13Z : +0) ;
`lang:gate` exit 0 ; `export:check` exit 0 ; `gate:vocab` exit 0 (328 fichiers). Sorties : `F:/tmp/dojo/rpcguard/tmp/*-2.txt`.

## 7. R-25 (tâche 4)

`r25()` de `F:/Monark/scripts/oracle/r25.mjs` (sha256 `4d0544df…`), `ci.yml` du clone (`0f401ae2…`), clone de mesure
`F:/tmp/dojo/rpcguard/r25` (état du worktree commis dans le CLONE seulement, `6864ea7a`, 01:04:37Z), script `tools/r25-run.mjs`,
sortie `r25.out` (`a3a08276…`) : **449** (419 insertions, 30 suppressions), exit 0, borne CI 1 205, STOP de la mission 1 150 ;
même compte depuis `8950ab15` et depuis `8263ddb4`. Par fichier : `transport.ts` 61, `ledger.ts` 12, `reconcile.ts` 12,
`repair.ts` 2, `collect.ts` 2, `first-append.test.ts` 149, `body-bound.test.ts` 152, `durable.test.ts` 24,
`course-window.test.ts` 22, `error-hint.test.ts` 13. Ratio mesure sur estimation : 449 / 327 = 1,37.

## 8. Sondes hors suite (boucle locale 127.0.0.1, `F:/tmp/dojo/rpcguard/probes/`, clefs retirées par `env -u`)

- **S-1** (`s1s2.mjs` `d5ff3cc7…`, sortie `s1s2.out` `d8a88b3d…`, 00:53:37Z) : chainstack, `timeoutMs` 500, `boundBody`, en-têtes
  200 puis silence : `AbortError`, code 200, message sans URL ; côté serveur, 493 ms de la requête à la fermeture de la socket.
  Un premier passage (00:52:59Z, non instrumenté côté serveur, sortie écrasée) donnait 2 289 ms, attente de 300 ms et
  écriture anticipée Windows comprises : c'est l'instrumentation du second qui fait foi.
- **S-1b** : la plateforme seule (Node 24.15, undici) : un signal interrompu après les en-têtes rejette `res.text()` par
  `AbortError` en 305 ms. La course propre du lecteur reste nécessaire pour un flux qui ignore le signal (T-5).
- **S-2** : `content-encoding: gzip`, 2 068 octets transmis, 2 MiB décodés, plafond 1 MiB : `BodyTooLarge` code 200 (le
  plafond compte les octets décodés que livre `fetch`).
- **S-3** (`s3.mjs` `d5cc2652…`, `s3-child.mjs` `fb755369…`, sortie `s3.out` `31e6fbe0…`, 00:54:25Z) : corps à la forme gPA
  `jsonParsed` avec `context`, 8 387 403 octets, 14 390 comptes (582,86 octets par compte), lu par l'enfant via le vrai
  `openGuardedClient` (`boundBody`, plafond 8 MiB) jusqu'au `JSON.parse` : pic `maxRSS` 121,2 MiB (témoin à un compte :
  71 MiB). **Porte STOP : PASS** (≤ 256 MiB). Mesure win32, pas le cgroup Linux de l'hôte (déclaré par le plan).

## 9. Écarts déclarés

- **É-1 (Q-1)** : l'option est `boundBody?: true` plus `maxBodyBytes?: number` ; la règle « borné ssi l'un des deux » est
  écrite dans la doc de `TransportOpts`. Le collecteur passe `{ boundBody: true }` : le 8 MiB reste en un seul lieu.
- **É-2** : l'échéance unique est un instant absolu `due` tenu par deux minuteurs (celui des en-têtes, inchangé et effacé
  aux en-têtes ; celui du corps, armé par le lecteur pour le temps restant), pas un `finally` qui envelopperait `fetch` et le
  corps (plan C-BT (a)). Motif : la voie sans option reste identique à l'octet (Q-1). M-BT1 devient « minuteur du corps non
  armé », tueur de T-5.
- **É-3** : T-5 lit un blocage par une course contre un délai, pas par l'option `timeout` de `node:test` : `red-proof.mjs`
  (l.11-12) tient un test expiré pour non conclu, jamais pour rouge.
- **É-4** : T-4 porte un témoin positif (tête de genèse seule acceptée) : sans lui, T-4 est vert à la base (refusé l.10).
- **É-5** : durable (1) et (4) : la genèse consomme les échecs injectés (F2P), au lieu d'une ligne écrite avant le journal
  (plan, vert à la base). Conséquence : la reprise EPERM, EACCES, EBUSY y est prouvée sur le renommage de la genèse ; celle
  du renommage de la tête d'une ligne reste prouvée par (2) (EPERM persistant, 35 essais). Même fonction `replaceDurable`.
- **É-6** : `error_preamble_carries_no_vocabulary_token` lève un vrai `BodyTooLarge` : sans lui, le nom ajouté à la liste
  serait vert à la base et aucun tueur de production ne le ferait rougir.
- **É-7** : `body-bound.test.ts` lit les exports neufs par `import * as transport` (un export manquant à la base est un rouge
  d'import, refusé par `red-proof.mjs`).
- **É-8** : le prédicat des relevés est une fonction hissée en fin de `reconcile.ts` : les lignes 114 et 115, citées par le
  RUNBOOK §3 étape 6, ne bougent pas.
- **É-9** : RUNBOOK §1 et §3 : un paragraphe sous chaque table plutôt qu'une cellule réécrite (lignes créées ≤ 160) ; la
  ligne `head_absent` de la table est réécrite en 157 caractères.
- **É-10** : le collecteur d'historique (`history-collect.ts` l.408-409) garde la lecture héritée : Q-4.

## 10. Items formés (zéro dette)

1. **DOJO-COLLECT-UNIT-TICK-MIDNIGHT-1 (neuf)** : `dojo_collect_unit_runs_the_real_tick` (`test/dojo-collect-deploy.test.ts`
   l.260-316) rougit quand un instant tiré tombe dans les 300 dernières secondes du jour : son pas tombe à minuit, planifie
   J+1 et rappelle les deux relais (4 GET, l.312 attend 2). La graine vient de `randomBytes` (`dojo-seed.mjs` l.27).
   Preuves : fréquence par le vrai `readInstants`, 298 sur 20 000 (1,49 % ; 1,40 % attendu) (`midnight.mjs` `7dad788e…`,
   `midnight.out` `5a127ce2…`) ; reproduction déterministe sur copie jetable, graine n = 10 : rouge `[4, 17, 17]` À LA BASE
   `8263ddb4` comme à l'état livré (`repro-midnight.out` `e46926a9…`) ; témoin n = 0 : vert aux deux
   (`repro-midnight-control.out` `2cd45888…`). Préexistant, étranger au lot (les relais ne passent pas par le garde).
   Pistes : tirer la graine jusqu'à ce que le dernier pas reste dans le jour ; compter les seuls GET du plan de J ; une graine
   fixe. Propriétaire : orchestrateur. Déclencheur : le prochain lot qui touche ce fichier, au plus tard l'inspection de la
   partie 1 (son oracle complet peut le rencontrer).
2. **RPC-GUARD-BODY-BOUNDS-ALL-1** (mission, Q-1) : Bell et la sentinelle Narabi gardent la lecture héritée ; déclencheur :
   leur prochain lot. Les items R-6 (Narabi) et R-7 (gTFA de Bell) du plan en sont les mesures préalables.
3. Items R-1 à R-10 du plan : inchangés, à l'orchestrateur, à leurs déclencheurs.

## 11. Q-n

- **Q-1** (opt-in), **Q-2** (I-1 non replié), **Q-3** (`Number.isSafeInteger(v) && v >= 0`) : appliquées (§3).
- **Q-4 (neuf, orchestrateur)** : le collecteur d'historique du Dōjō (`history-collect.ts` l.408-409, pages gTFA jusqu'à
  `limit` 1000) n'est pas nommé par Q-1 et garde la lecture héritée. Le ranger sous RPC-GUARD-BODY-BOUNDS-ALL-1 avec le
  déclencheur « avant l'acte 1 d'historique », après la mesure R-7 (une page gTFA pleine peut dépasser 8 MiB) : oui
  (recommandé) / non (le brancher dans ce lot, ce qui touche une ligne de `history-collect.ts`, hors de la permission).
- **Q-5 (neuf, orchestrateur)** : porteur de DOJO-COLLECT-UNIT-TICK-MIDNIGHT-1 (le lot du fichier, ou un pli de l'inspection).

## 12. Conduite et provenance

`git` en lecture seule dans le worktree (`rev-parse`, `branch --show-current`, `status`, `diff`, `ls-files`,
`--no-optional-locks`) ; clones `--no-local` sous `F:/tmp/dojo/rpcguard/` (`base`, `gel`, `r25`) ; un seul commit, de mesure,
dans le clone `r25` ; copies jetables du test de déploiement créées puis retirées dans `base` et `gel`. **Aucun `GIT_DIR`,
aucun `GIT_WORK_TREE`, aucun `--write-tree`.** Aucun réseau hors boucle locale ; aucune clé réelle ; rien sur C:
(`os.tmpdir()` vérifié sous TEMP). Jonctions `node_modules` par `mk-nm.ps1`, retirées à la fin (§13). Advisor intégré
consulté avant l'écriture (points suivis : forme des fichiers créés, TEMP, ordre du lecteur borné, tueurs, R-25 de base),
puis avant la remise. Aucun F2P, aucun mutant, aucun oracle (mission).

| Date | Objet | Modèle | Effort | Contexte | Générateur | Réviseur | Verdict |
|---|---|---|---|---|---|---|---|
| 2026-10-01 | G1 RPC-GUARD-FIRST-APPEND-1 | `claude-opus-5-5` | max | mission `6a9c4826…` et §1 | implémenteur | inspection de la partie 1 | sans objet |

## 13. Remise (tâche 5)

- Jonctions retirées à 01:07:33Z (`rm-nm.ps1`, clones `base` et `gel`) ; `F:/Monark/node_modules` : 220 entrées dont 11 sous
  `@monark`, avant comme après ; aucun `node_modules` dans le worktree ni dans les clones.
- Fichiers du lot dans le worktree (sha256 à 01:05:12Z ; le code n'a plus changé ensuite) :

| Fichier | Lignes | sha256 |
|---|---|---|
| `packages/rpc-guard/src/ledger.ts` | 225 | `df76d5d1dcf8eefb82ceb7380fd1e4abd28b803574bdc01a771fa95f79f25a2d` |
| `packages/rpc-guard/src/repair.ts` | 75 | `7fba1a4d10ea5de653d8443972df7090cd82fa5e8480fdda13eaa7358d7d3409` |
| `packages/rpc-guard/src/reconcile.ts` | 166 | `8f2713095ad1d2e9c76a28a5f9c4fa7c015157864b83a29823640ace2a8b84d8` |
| `packages/rpc-guard/src/transport.ts` | 352 | `f6a59ea2fab1fa626b6820392c4df98b03bca5f89e3f474bf3b9eee60b4c5689` |
| `apps/dojo/src/collect.ts` | 274 | `62fedc224016803d06c4e7e87df705d48434ddbdc00fbe0df0725dc30c78e54b` |
| `packages/rpc-guard/test/first-append.test.ts` (neuf) | 149 | `ae5d18528116ff2271e8c22f1d959f36c8baae1885822a4f37ef9cdb0d76dbf5` |
| `packages/rpc-guard/test/body-bound.test.ts` (neuf) | 152 | `fb029388685a1ca142b6d3ed8a3c97f5c791f513b60c8c316f755b87b7d4f43d` |
| `packages/rpc-guard/test/durable.test.ts` | 308 | `501854e8537e66dd8f49ca2a369834da42322a22161ba0aa2c42b113f45c3bb3` |
| `packages/rpc-guard/test/course-window.test.ts` | 228 | `799e1dc4a59f74926e5388ac36c65e4e832d332d5e3e80449e0919fa0e8b3c82` |
| `packages/rpc-guard/test/error-hint.test.ts` | 253 | `f2536b778918aff9c6eac885d2494ded12a0e58dc7fb2d7e74a283d0e4040f69` |
| `docs/RUNBOOK-rpc-guard.md` | 229 | `76f3c921a639952fdd6cbb41be9640a69b96db7303540a8ec36ab882ad62fd4a` |

- Ce journal : son sha256 est rendu hors de lui, dans `F:/tmp/dojo/rpcguard-deliver/DELIVERED.sha256` et la réponse finale.
- Réponse : `F:/tmp/dojo/rpcguard-deliver/REPONSE.md`.
