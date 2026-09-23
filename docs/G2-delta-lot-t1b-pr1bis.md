# G2-delta — PR-1-bis T-1b (`d4fcb76`, relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2d-t1b-pr1bis/G2.md` (sha256 5b606d19…). Verdict : PASS-AVEC-CORRECTIONS CD-1..CD-5 (4 survivants propres y02/y03/y04/y08 = tests partiels sur C-1/C-2/C-3/C-6 ; CD-5 couplage BELL-REPUBLISH de C-7 non déclaré) ; 14/14 mutants G2 tués, oracle 7 × 0 (1109/1107/0/2, test 42 vert), R-25 1 147. Rulings orchestrateur : CD-1..CD-4 en PR-1-ter (R-25 attendu 1 148) ; forme C-6 livrée conservée (O-7 item) ; CD-5 déclaré au G7 ; C-7 garde les deux ordres.

---

# G2-delta — lot T-1b-backend, PR-1-bis `d4fcb76` (relecteur Opus 5.5, contexte frais)

- **Relecteur** : worker G2-delta, modèle résolu déclaré **`claude-opus-5-5[1m]`** (R-1, préfixe `claude-opus-5-5`), effort max ; instance séparée du rédacteur PR-1-bis (contexte frais, indépendance imposée par le système).
- **Objet** : `lot/t1b-backend` @ `d4fcb76` (worktree `F:\Monark-wt-t1b`), base `64dbbd6` (PR-1) ; liste C-1..C-7 relue dans `F:\Monark\docs\G2-lot-t1b-backend-pr1.md` (sha256 `00e62a62731733eaf1245cb92ca38dc272f826d0096c63c611adfadd746e8b85`, persiste le G2 `50197d57…`) ; rendu `F:\tmp\t1b-a1bis\RENDU-PR1BIS.md` (sha256 `42e028b2…82ee3b8`), `PR1BIS.diff`, `TABLES.md`, `mutants-g2\`, `mutants-x\` (lus, jamais écrits).
- **Écritures** : uniquement `F:\tmp\g2d-t1b-pr1bis\` (clones `lot`, `mut`, `mut2`, TEMP/TMP/TMPDIR) — **sauf l'écart DV-2** (4 objets arbre orphelins dans `F:/Monark/.git/objects`, § 12). Aucun commit du lot, aucun workflow, aucun réseau (npm `--offline`). Ceinture `env -u` × 8 sur chaque commande qui exécute du code.

## Verdict : **PASS-AVEC-CORRECTIONS** (liste fermée CD-1..CD-5, § 9)

- **Critère G2-delta fixé par le G2 de PR-1 : atteint et re-mesuré de première main, SAUF les 41 mutants G1** (hors liste de cette mission ; rapport du rédacteur `mutants-g1/REPORT.jsonl` `10c7a89b…880e` lu, non recompté — [lu], pas une mesure ; la relecture D-4 du diff, § 1, ne montre aucune assertion retirée ni affaiblie). Mesuré ici : diff = 2 fichiers de test `M`, 0 fichier de production, 9/9 gelés U-4b ; **14/14 mutants G2 KILLED byIntended** par le test PR-1 nommé, 14/14 restaurés octet pour octet ; **oracle 7 × exit 0**, TAP **1109 / 1107 pass / 0 fail / 0 cancelled / 2 skipped / 0 todo** (test 42 vert) ; **R-25 = 1 147 ≤ 1 150**.
- **Mais 4 des 7 tests ne prouvent la propriété demandée que partiellement** : 9 mutants propres prédits AVANT rejeu (prédictions figées 20:09:15Z) ; **9/9 prédictions exactes** : 5 tués byIntended, **4 survivants** (y02 → C-1, y03 → C-2, y04 → C-3, y08 → C-6). Chacun est fermé par un correctif de test **mesuré** : sondes 13/13 conformes (vert sur le code doré, rouge sous le survivant ET sous le mutant G2 de la même propriété) ; application COMBINÉE CD-1..CD-4 dans un clone : `typecheck` 0, `lint` 0, `lint:ratchet` 69/69, 3 fichiers 26/26, **R-25 1 148** (§ 9).
- **Une affirmation fausse du rendu** (C-7 « pas de couplage avec BELL-REPUBLISH ») : mesurée fausse ⇒ CD-5 (rectification + couplage déclaré, 0 ligne de test).
- **Point ouvert C-6 / O-7** : **oui**, une forme agnostique tient en **+1 ligne nette** (3 lignes remplaçant `durable.test.ts:256-257`) ; mesurée : tue g11, reste verte sous une variante « O-7 ⇒ refus » alors que la forme livrée y rougit ; avec CD-1..CD-4 : `typecheck` 0 (après correction de MON candidat v1, TS2345), 26/26, **R-25 1 149**. Non appliquée ; choix = ruling orchestrateur (§ 5). Matrice R-25 complète au § 9 : la combinaison « agnostique + CD-3 sur sa propre ligne » atteint **1 150, marge 0**.
- **Écart du relecteur à déclarer en tête (DV-2)** : 4 objets arbre orphelins écrits dans `F:/Monark/.git/objects` par `git merge-tree --write-tree` (aucun ref, index ni arbre de travail touché) — § 12.

## Journal (date -u)

- 19:51:07Z — ouverture ; R-1 déclaré ; worktree `F:/Monark-wt-t1b` HEAD `d4fcb76`, status 0 ligne. Le G2 cité par la mission (`docs/G2-lot-t1b-pr1.md`) n'existe pas ; le G2 de PR-1 est `docs/G2-lot-t1b-backend-pr1.md` (écart de nom DV-1) ; `PLI1BIS.diff` = en réalité `PR1BIS.diff`.
- 19:52Z→19:56Z — lecture : G2 de PR-1 (C-1..C-7, O-1..O-11), diff `64dbbd6..d4fcb76` (= `PR1BIS.diff` octet pour octet, sha `116488b7…d544`), `bell-publish.mjs` et `bell-chain.mjs` en entier, les deux fichiers de test pliés en entier, rendu §0-§11, harnais G2 `F:\tmp\g2-t1b-pr1\g2-mutants.mjs` (sha `8e23cf77…5143` = G2), témoins G2 `g2-witness.test.mts` (sha `eaffc422…2bc9` = G2).
- 19:56:38Z→19:58:42Z — 3 clones `git clone --no-hardlinks F:/Monark` + `checkout --detach d4fcb76` (status 0 ligne) + `npm ci --offline` exit 0 ; A-2 : `@monark/rpc-guard` résolu DANS chaque clone (`setup.log`).
- 19:57:13Z — étape 1 (`step1.txt`) ; ≈19:58Z R-25 (`R25.txt`).
- ≈20:00Z→20:04Z — **advisor intégré appelé après l'orientation : « The advisor timed out »** (consigné ; R-26 canal 1 indisponible pour cet appel ; poursuite sans avis).
- 20:04:54Z→20:09:03Z — oracle 7 portes sur le clone `lot` @ `d4fcb76` (status 0 ligne au départ).
- 20:08:06Z→20:16:19Z — rejeu des 14 mutants G2 sur le clone `mut`.
- **20:09:15Z — prédictions des 9 mutants propres figées** (`PREDICTIONS-y.txt`, sha `7407705d…373c`, contient le sha `d201f103…3e91` du bloc `y-mutants-M.txt`) ; 20:09:22Z→20:15:26Z rejeu sur le clone `mut2`.
- 20:10:34Z — **écart DV-2** : `git -C F:/Monark merge-tree --write-tree d4fcb76 f40e0e6` (contrôle de fusion PR-1-bis ⊕ PR-2) a écrit 4 objets arbre non référencés dans `F:/Monark/.git/objects`.
- 20:11:35Z→20:12:21Z — fusion LOCALE au clone `lot` (`d4fcb76` + `f40e0e6`, commit de clone `b45b24de`, 0 conflit) ; 3 fichiers du lot : 26/26 ; puis `lot` remis à `d4fcb76` (status 0).
- 20:13:10Z→20:13:16Z — sondes de ruling p0..p6 (7/7 conformes) ; 20:16:07Z→20:16:20Z — sondes de correctifs f1..f4 (13/13 conformes).
- 20:17Z→20:29Z — collecte des sha, hygiène des blobs, rédaction ; contrôles de non-écriture : `F:/Monark` status 0 ligne (branche `lot/etude-suite`), `F:/Monark-wt-t1b` status 0 ligne @ `d4fcb76` ; `F:/tmp/t1b-a1bis` et `F:/tmp/g2-t1b-pr1` (profondeur ≤ 2, clones et TEMP élagués) : **0** fichier plus récent que mon premier artefact (19:56Z) ; clones inchangés (`t1b-a1bis/mut` @ `64dbbd6` = les 2 `M` déclarés par le rédacteur ; `g2-t1b-pr1/mut` et `/lot` @ `64dbbd6`, 0 ligne). Un `find` récursif non élagué (TEMP de milliers de répertoires de test) a été abandonné pour lenteur ; la version élaguée (`node_modules`/`.git`) a fini à 20:34:15Z : 0 et 0.
- ≈20:29Z→20:32Z — livrable durable (sha avant consultation `a7da7bbc…a78a`) ; **advisor intégré appelé avant clôture : avis reçu** (conseil, pas un verdict) : verdict jugé défendable ; 3 angles morts : (1) les sondes F1..F4 n'exécutent pas `tsc`/`eslint` ; (2) la limite « 41 G1 non rejoués » doit figurer en tête ; (3) matrice R-25 explicite (cas à marge 0) ; + alignement des durées. Les trois sont traités ci-dessous, le (1) par une MESURE plutôt qu'une réserve.
- 20:33:48Z→20:36:53Z — `combo-check.mjs` v1 : combinaison A (CD-1..CD-4, C-6 livré) verte partout ; combinaison B (candidat agnostique v1) **`typecheck` exit 2** : `durable.test.ts(257,168)` et `(257,172)` TS2345 `string | undefined` — erreur de MON candidat (tableau littéral inféré `string[][]` sous `noUncheckedIndexedAccess`). Correctif : `as const` sur le littéral (effacé à l'exécution ; même forme que `validate.test.ts:111`). Résultats v1 conservés (`probes-v1/`, `combo-v1/`).
- 20:37:25Z→20:37:33Z — sondes de ruling rejouées avec le candidat v2 (sha du fichier édité `88797094…` contre `c447f3a4…` en v1) : 7/7 conformes ; 20:37:33Z→20:40:17Z — `combo-check.mjs` v2 : A et B vertes partout (§ 9).

## 1. Diff `64dbbd6..d4fcb76`, production, gel U-4b (`step1.txt`, sha `7e5e6c93…9464`)

| Contrôle | Mesure |
|---|---|
| Fichiers du diff | `M apps/bell/test/bell-publish-durable.test.ts`, `M apps/bell/test/bell-publish-validate.test.ts` ; 1 commit ; +43/−30 |
| Hors `apps/bell/test/` | 0 (grep exit 1) ; `git diff --quiet 64dbbd6 d4fcb76 -- ':(exclude)apps/bell/test'` exit 0 ; `apps/bell/scripts` + `apps/bell/src` : 0 fichier |
| Production (sha8 blob `d4fcb76` = `64dbbd6`) | `bell-chain.mjs` `42d36b02`, `bell-chain.d.mts` `fedb91d2`, `bell-publish.mjs` `14175454`, `bell-publish.d.mts` `d89b252b` ; `bell-publish-chain.test.ts` `83ba2873` inchangé |
| 9 gelés U-4b (9 premiers chemins du RUNBOOK §0.6, sha256 LF) | **9/9** = attendus (`2f9a31f6 a5e66cd3 5733daeb 7bee76fc 3376eb08 9206df91 0e232519 3603265d cb020425`) à `c0f905c`, `64dbbd6` et `d4fcb76` ; 0 dans `c0f905c..d4fcb76` |
| Blobs commités = livrés | `DELIVERED.sha256` du rédacteur (`6403d708…` validate, `4641f01d…` durable) = blobs `d4fcb76` = fichiers du worktree |
| Hygiène des 2 blobs | 0 TAB, 0 CR, 0 non-ASCII (280 et 258 lignes) |
| Relecture D-4 des lignes « − » | aucune assertion retirée ni affaiblie : la couture ajoute `from` aux seuls renames (les `deepEqual` existants comparent l'entrée `fsyncDir` suivante, sans `from`) ; nombre d'appels inchangé ; base C-3 à 3 lignes mais texte des 3 cas antérieurs identique ; `runMainOut(usdc, week = 0)` donne RUN_A/RUN_B identiques |

## 2. C-1..C-7 : le test prouve-t-il la propriété demandée ? (lecture + mutants rejoués)

| # | Test (arbre `d4fcb76`) | Propriété (G2 PR-1) | Ce que le test prouve (mesuré) | Tués | Résidu | Jugement |
|---|---|---|---|---|---|---|
| C-1 | `validate.test.ts:138` (+ `:49-51`, `:63`, `:72`) | R-T1b-1 : UNE session en avance ⇒ lot ENTIER refusé | à l'horloge où RUN_A seul publie (`:137`), {RUN_A, RUN_LATE} est refusé `session_not_yet_publishable`, détail ancré `^$.runs[1]…`, répertoire d'état octet-identique | g07, y01 | **y02 survit** : garde appliquée au SEUL dernier run ; l'unique cas à deux runs met le run précoce en dernier | **partiel** ⇒ CD-1 |
| C-2 | `durable.test.ts:57-68`, `:111-112` | tmp → fsync → rename (ADR D8) | exactement 7 renames `staging/tmp-*` (2 immuables + trousseau + 4 servis), chacun avec un `fsync` de ce tmp entre son dernier `open:w` et son rename | g08 | **y03 survit** : `fsync` AVANT le `write` (les données ne sont jamais fsyncées) — la fenêtre commence à l'`open`, pas à la dernière écriture | **partiel** ⇒ CD-2 |
| C-3 | `durable.test.ts:164-181` | intégrité au démarrage : CHAQUE maillon | ruptures du dernier maillon et du maillon du MILIEU (re-signées par la vraie clé, ligne suivante re-chaînée), servies à l'identique ⇒ `existing_timeline_corrupt`, rien d'écrit | g03 (+ g04) | **y04 survit** : chaîne non ancrée à GENESIS (le maillon de la ligne 1 n'est jamais rompu dans les cas) | **partiel** ⇒ CD-3 |
| C-4 | `validate.test.ts:111-112` | `close_source`/`adv_source` jamais dans l'état ; clés PROPRES | 4 clés insérées TEXTUELLEMENT en tête de `state.json` ⇒ `unknown_field`, détail EXACT `$.runs[0].state.<clé>` | g05, g06, y05 | — | **prouvé** |
| C-5 | `validate.test.ts:149-153` | C-in-8 : aucune chaîne SERVIE (état, enregistrements) | URL dans une chaîne du digest (`bell_sha` et `provenance.bellSha` re-hachés : seul C-in-8 peut objecter) et dans un enregistrement re-chaîné par `chainTimeline` ⇒ `url_or_key_shaped_string`, chemins EXACTS | g15, y06 | — (y06 aurait survécu avant le pli : les 4 cas de provenance restent refusés sous y06) | **prouvé** |
| C-6 | `durable.test.ts:256-257` | racine du démarrage = trousseau PRIVÉ, jamais la copie servie | `keyring.json` intact, `public/bell/pubkey.json` remplacé par le trousseau d'une autre clé ⇒ publication suivante OK, stderr exactement `rederived_public`, copie servie = `keyring.json` octet pour octet | g11, y07 | **y08 survit** : repli sur la copie servie quand `keyring.json` MANQUE (branche `bell-publish.mjs:182` sans aucun test depuis PR-1) ; couplage O-7 (§ 5) | **partiel** ⇒ CD-4 ; option agnostique § 5 |
| C-7 | `durable.test.ts:32-34`, `:194-196` | C-in-9 : SEUL un bundle IDENTIQUE est « rien à publier » | dans les deux ordres, {a} puis {a, b} ⇒ `published`, seq 2, 2 lignes | g13 (ordre {366}→{366,365} seul), y09 (ordre {365}→{365,366} seul) : **les deux ordres sont nécessaires** (mesuré) | le surensemble REPUBLIE `a` sous le code PR-1 (mesuré, § 6), contrairement au rendu | **prouvé** pour C-in-9 ; CD-5 (rendu + couplage O-1) |

## 3. Rejeu des 14 mutants G2 — **14 KILLED byIntended / 14 ; restaurés 14/14**

Harnais : réplique `g2-mutants-replay.mjs` (sha `98a04c24…5020`) construite par `mk-replay.mjs` depuis `F:\tmp\g2-t1b-pr1\g2-mutants.mjs` (sha `8e23cf77…5143`) ; seuls WT/OUT/TEMP/identification changent (`g2-replay.diff`) ; **bloc `M` octet-identique** (sha `1535cd59…aca7` des deux côtés, 14 entrées) ; témoin désactivé (DV-3). Ligne de base : 26/26. Clone `mut` status 0 ligne après. Les sha « muté » sont ceux de la table du G2 (mêmes mutations).

| # | Mutant | Test visé | Verdict | Rouges (3 fichiers) | TAP sha8 | golden/muté/restauré |
|---|---|---|---|---|---|---|
| 1 | g01-signed-bytes-omit-runs | bell_chain_ed25519_rfc8032_kat | KILLED byIntended | kat | dab89b09 | 42d36b02/629d8d02/42d36b02 |
| 2 | g02-publisher-signs-other-bytes-than-served | bell_publish_refuses_signing_key_not_in_keyring | KILLED byIntended | crash, torn, corrupt, idempotent, keyring | dac129a9 | 14175454/fd498feb/14175454 |
| 3 | g03-startup-chain-checks-last-link-only | bell_publish_refuses_corrupt_existing_timeline | KILLED byIntended | corrupt | 42e8938d | 14175454/48701cc1/14175454 |
| 4 | g04-served-chain-restarts-at-genesis | bell_publish_crash_between_steps_never_serves_unbound_state | KILLED byIntended | crash, corrupt | 1e52dfa2 | 14175454/27eb68d0/14175454 |
| 5 | g05-whitelist-admits-inherited-keys | bell_publish_refuses_unknown_state_field | KILLED byIntended | unknown_field | 973b645a | 14175454/b87f105a/14175454 |
| 6 | g06-not-served-names-admitted-at-every-level | bell_publish_refuses_unknown_state_field | KILLED byIntended | unknown_field | 2bd9a6c0 | 14175454/7adbb445/14175454 |
| 7 | g07-early-runs-dropped-rest-published | bell_publish_refuses_unpublishable_session | KILLED byIntended | unpublishable | 46bb378b | 14175454/b5cb07c6/14175454 |
| 8 | g08-tmp-not-fsynced-before-rename | bell_publish_dir_fsync_after_rename | KILLED byIntended | dir_fsync | 1a206f2b | 14175454/33a9589a/14175454 |
| 9 | g09-commit-append-not-fsynced | bell_publish_dir_fsync_after_rename | KILLED byIntended | dir_fsync | 89e8087e | 14175454/d5447cb5/14175454 |
| 10 | g10-durable-write-in-place-non-atomic | bell_publish_crash_between_steps_never_serves_unbound_state | KILLED byIntended | dir_fsync, crash | 64092c33 | 14175454/96dc5d6a/14175454 |
| 11 | g11-startup-root-is-the-served-pubkey | bell_publish_refuses_signing_key_not_in_keyring | KILLED byIntended | keyring | f76f1728 | 14175454/4789da98/14175454 |
| 12 | g13-idempotence-compares-first-run-only | bell_publish_same_bundle_twice_is_idempotent | KILLED byIntended | idempotent | 97fc7ebf | 14175454/37bc4562/14175454 |
| 13 | g15-url-key-scan-provenance-only | bell_publish_refuses_url_or_key_shaped_string | KILLED byIntended | url_or_key | 6caa3efc | 14175454/89e36dc2/14175454 |
| 14 | k42-kat-secret-key-altered | bell_chain_ed25519_rfc8032_kat | KILLED byIntended | kat | 0ab14028 | 83ba2873/29c669ad/83ba2873 |

Rapport `mutants-g2/REPORT.jsonl` (sha `13614d54…e733`), un TAP par exécution sous `mutants-g2/` (REVIEW-TAP-1). Non rejoués ici (hors liste de la mission) : les 41 mutants G1 et x01..x03 du rédacteur (son rapport G1 `10c7a89b…880e` et X `03de3d30…6e96e` : lus, non recomptés) ; la relecture D-4 (§ 1) ne montre aucune assertion affaiblie.

## 4. Mutants propres y01..y09 — prédits AVANT rejeu (20:09:15Z), **9/9 prédictions exactes**

Harnais `y-mutants.mjs` (sha `ac16ede0…4826`) = mécanique du harnais G2 (pré-contrôle « find » unique, mutation et restauration durables, 3 fichiers en TAP, byIntended), bloc `M` remplacé par `y-mutants-M.txt` (sha `d201f103…3e91`, chaque `why` porte la prédiction) ; clone `mut2` @ `d4fcb76`, ligne de base 26/26, status 0 ligne après ; rapport `mutants-y/REPORT.jsonl` (sha `bb5c4690…5306`).

| # | Mutant (bell-publish.mjs) | Cible | Prédit | Mesuré | Position du rouge (pile TAP) | golden/muté/restauré | TAP sha8 |
|---|---|---|---|---|---|---|---|
| y01 | garde C-in-5 sur le SEUL premier run | C-1 | KILLED `:138` | **KILLED byIntended** | `validate.test.ts:138:16` | 14175454/554bb1fb/14175454 | 8db85e32 |
| y02 | garde C-in-5 sur le SEUL dernier run | C-1 | SURVIVED | **SURVIVED** | — (26/26) | 14175454/8c226e57/14175454 | 83d6e34a |
| y03 | `fsync` du tmp AVANT son `write` | C-2 | SURVIVED | **SURVIVED** | — (26/26) | 14175454/076755f2/14175454 | dfdc2ddc |
| y04 | chaîne du démarrage non ancrée à GENESIS (`prev` = `lines[0].prev_line_hash`) | C-3 | SURVIVED | **SURVIVED** | — (26/26) | 14175454/51b4804f/14175454 | 32d57778 |
| y05 | table `extra` lue par accès simple (clés héritées admises) | C-4 | KILLED `:112` (sous-cas `constructor`) | **KILLED byIntended** | `validate.test.ts:112:170` (sous-cas `constructor` DÉDUIT : premier nom hérité de la boucle) | 14175454/602cb0ce/14175454 | 9ee19469 |
| y06 | balayage C-in-8 ne descend pas dans les objets d'un tableau | C-5 | KILLED `:153` col 21 | **KILLED byIntended** | `validate.test.ts:153:21` (cas `state.json`) | 14175454/6382fad0/14175454 | 99db3d53 |
| y07 | `public/bell/pubkey.json` existant jamais re-dérivé | C-6 | KILLED `:257` | **KILLED byIntended** | `durable.test.ts:257:10` | 14175454/348a80f6/14175454 | fbc27fbc |
| y08 | racine = copie servie quand `keyring.json` manque | C-6 | SURVIVED | **SURVIVED** | — (26/26) | 14175454/605186be/14175454 | 53688093 |
| y09 | C-in-9 compare le SEUL dernier run | C-7 | KILLED `:196` par {365}→{365,366} | **KILLED byIntended** | `durable.test.ts:196:12`, message `{365} then {365, 366}` | 14175454/ccd73b0a/14175454 | bbe3ec76 |

Non-équivalence des 4 survivants : y02 publie une session avant son `earliest_publish_utc` dès que le run précoce n'est pas le dernier (R-T1b-1) ; y03 laisse les données du tmp non durables avant le rename (ADR D8) ; y04 accepte une ligne 1 dont `prev_line_hash` ≠ GENESIS (même classe que g03 : exige une re-signature) ; y08 prend `public/bell/pubkey.json` pour racine si `keyring.json` est perdu. Les 4 sont tués par CD-1..CD-4 (§ 9, mesuré).

## 5. Point ouvert C-6 / O-7 — forme agnostique (point 5 de la mission ; **non appliquée**)

**Réponse : oui, en +1 ligne nette** (3 lignes remplaçant `durable.test.ts:256-257` ⇒ R-25 1 148 seul, 1 149 avec CD-1..CD-4 — mesuré ; +3 si ajoutée à côté, mais alors la forme livrée rougirait encore sous « O-7 ⇒ refus », donc pas agnostique). Texte candidat **v2** (`c6-agnostic-candidate.txt`, sha `1d39be7d…3a0e` ; la v1 `34636cd0…aa72` sans `as const` échouait au `typecheck`, TS2345 ×2, trouvé par ma vérification combinée) :

```ts
  const k2 = generateKeyPairSync("ed25519").privateKey, re = jsonLines(join(s, "timeline.jsonl")).map((l) => { const b = { ...l, key_id: keyIdOf(k2) }; return canonical({ ...b, sig: signLine(b, k2) }) + "\n"; }).join("");
  for (const [f, c] of [["timeline.jsonl", re], ["public/timeline.jsonl", re], ["public/bell/pubkey.json", canonical(keyringOf(k2, 1)) + "\n"]] as const) writeFileSync(join(s, f), c);
  refuses(s, "existing_timeline_corrupt", "lines re-signed by another key and its keyring served: the start-up root is keyring.json, never the served copy", k2);
```

Sondes (`ruling-probes.mjs` sha `b058c789…8771`, clone `lot` @ `d4fcb76`, un test nommé par exécution, TAP sous `probes/` (v2) et `probes-v1/` (v1), rapport `probes/REPORT.jsonl` sha `b98b0136…3bb2`, identique en v1 et v2 car les issues sont identiques — `as const` est effacé à l'exécution) — **7/7 conformes** :

| Sonde | Arbre | Attendu | Mesuré | Motif du rouge |
|---|---|---|---|---|
| p0 | pli tel quel, code doré | ok | ok | — |
| p1 | candidat, code doré | ok | ok | — |
| p2 | candidat + g11 | not ok | **not ok** | `Missing expected exception: existing_timeline_corrupt: lines re-signed…` (tue g11) |
| p3 | candidat + variante « O-7 ⇒ refus » (un `pubkey.json` servi différent refusé `existing_timeline_corrupt`) | ok | **ok** (résiste au refus) | — |
| p4 | pli tel quel + même variante | not ok | **not ok** | `existing_timeline_corrupt: public/bell/pubkey.json differs from keyring.json` (couplage O-7, déclaré par le rédacteur §10) |
| p5 | candidat + y07 | ok | ok | — : la forme agnostique n'épingle PLUS la re-dérivation d'une copie servie altérée (prix de l'agnosticisme) |

Lecture : la forme livrée épingle le comportement actuel d'O-7 (re-dérivation) ET la racine ; la forme agnostique épingle la racine seule et survit aux deux issues d'O-7. **Ruling demandé à l'orchestrateur au G7 PR-1** (item ADR-T1b O-6/O-7 déjà formé) : garder la forme livrée (et la réécrire si O-7 ⇒ refus) ou prendre la forme agnostique (+1 ligne) en ajoutant, si O-7 ⇒ re-dérivation, un test qui l'épingle. CD-4 reste valable avec l'une ou l'autre forme (mesuré : combinaison B, y08 rouge sur la ligne de CD-4, § 9).

## 6. C-7 / O-1 — couplage réel (constat CD-5)

Le rendu (§2, ligne C-7) affirme : « jamais de republication d'un `bell_sha` déjà publié : pas de couplage avec BELL-REPUBLISH-RULING-1 ». **Mesuré faux** :
- **p6** (`ruling-probes.mjs`) : C-7 sous une variante « O-1 ⇒ refus » (tout `bell_sha` déjà cité par une ligne commitée refusé, après C-in-9) ⇒ **not ok**, `bell/publish: duplicate_run: $.runs[1].state.bell_sha` : le bundle {a, b} contient `a` déjà publié ; sous le code PR-1, la ligne 2 le REPUBLIE.
- **Arbre fusionné PR-1-bis ⊕ PR-2** (`d4fcb76` + `f40e0e6`, fusion locale au clone `lot`, arbre `a77679ac`, 0 conflit) : 3 fichiers du lot **26/26** (`merged-3files.tap`, sha `62bebbff…35af`), avec 2 lignes `bell/publish: skipped_already_published 1` : le FILTRE BELL-REPUBLISH-1 de PR-2 (`f40e0e6:apps/bell/scripts/bell-publish.mjs:296-302`) écarte `a` dans les deux surensembles de C-7, qui restent verts.
- Conséquence : C-7 est **compatible avec le filtre actuel de PR-2** mais **rougira si le G7 PR-2 tranche « refus »** (question « filtre vs refus » ouverte au G2 PR-2, `docs/CHANTIERS.md:1297`). Le couplage doit être déclaré, pas nié (CD-5).

## 7. Oracle 7 portes (`run-oracle.sh` sha `0c57872e…5141` = forme du G2 de PR-1, seuls TEMP et `status_lines` changent ; commande `test` = script npm `package.json:16` + 2 reporters)

`oracle/codes.txt` (sha `c762e0cd…75b2`) : départ 20:04:54Z, HEAD `d4fcb76`, **status_lines=0**, node v24.15.0 ; `gate:vocab` 0 ; `typecheck` 0 ; `test` 0 (20:05:04Z → 20:08:08Z) ; `lint` 0 ; `lint:ratchet` 0 (**69/69**) ; `lang:gate` 0 ; `export:check` 0. TAP `oracle/test.tap` (sha `a493cdc8…982d`) : **# tests 1109, # pass 1107, # fail 0, # cancelled 0, # skipped 2, # todo 0** (= PR-1 : le pli n'ajoute aucun `test()`) ; 24/24 entrées du lot `ok` ; skips = `sentinel_run_releases_chainstack_lock_on_sigterm` (win32) et `u4b_labels_replay_via_main_real_artifact` (artefacts absents) ; **test 42 `export_public_no_governance_no_french` : ok** (rien à consigner sous T42-LOAD-1). A-7 après oracle et harnais : 0 `t1b-creds-*`, 0 `bell-signing-key` sous mon TEMP.

## 8. R-25 (`r25.mjs` sha `eab7f077…4618`, `R25.txt` sha `99891899…c72b`)

Pathspec extrait par programme de `ci.yml:65` à `d4fcb76` (15 arguments ; sha ligne+LF `20f7aab9…24b5` = G2 de PR-1). `git diff --shortstat c0f905c...d4fcb76 -- <P>` = **« 7 files changed, 1147 insertions(+) »** ⇒ **1 147 ≤ 1 150** (marge 3) ; contrôles : `c0f905c...64dbbd6` = 1 134 ; `64dbbd6...d4fcb76` = +43/−30 ; sans pathspec = 1 147 ; merge-base = `c0f905c`.

## 9. Corrections — liste fermée CD-1..CD-5 (toutes mesurées ; aucune ligne de production)

Sondes `fix-probes.mjs` (sha `861eea57…d317`), clone `lot` @ `d4fcb76`, un test nommé par exécution, TAP sous `fixprobes/`, rapport `fixprobes/REPORT.jsonl` (sha `ed47f4d1…2402`) : **13/13 conformes**, chaque rouge à la ligne visée.

| # | Où | Correction (texte exact) | Lignes R-25 | Preuve (vert doré ; rouge sous…) | `error_origin` proposé |
|---|---|---|---|---|---|
| **CD-1** (C-1) | `validate.test.ts:138` | `stage([RUN_A, RUN_LATE])` → `stage([RUN_A, RUN_LATE, RUN_B])` (run précoce au MILIEU ; regex `runs\[1\]` inchangée) | 0 | f1-golden ok ; f1-y01, f1-y02, f1-g07 not ok à `:138:16` | relecteur G2 PR-1 (spec C-1 et témoin mettaient le run précoce en dernier) |
| **CD-2** (C-2) | `durable.test.ts:111` | dans `findLastIndex`, `x.op === "open:w"` → `x.op === "write"` (le `fsync` doit suivre la DERNIÈRE écriture du tmp) | 0 | f2-golden ok ; f2-y03, f2-g08 not ok à `:112:10` | relecteur G2 PR-1 (spec « depuis son open » et témoin) |
| **CD-3** (C-3) | `durable.test.ts:171` (liste `cases`) | ajouter `["broken GENESIS link (line 1 re-signed)", [resign({ ...l1, prev_line_hash: "f".repeat(64) })]]` | 0 (même ligne) ou +1 | f3-golden ok ; f3-y04 not ok à `:179:5` (cas GENESIS) ; f3-g03 toujours not ok (cas MILIEU) | relecteur G2 PR-1 (C-3 ne nommait que le maillon du milieu) |
| **CD-4** (C-6) | `durable.test.ts`, après `:257` | `rmSync(join(s, "keyring.json")); refuses(s, "existing_timeline_corrupt", "keyring.json missing: the served copy is never the start-up root");` | +1 | f4-golden ok ; f4-y08 not ok à `:258:36` ; f4-g11 toujours not ok (`:257`) | worker G1 PR-1 (branche `bell-publish.mjs:182` sans test) + relecteur G2 PR-1 (non détecté) |
| **CD-5** (C-7) | rendu `RENDU-PR1BIS.md` §2 (ligne C-7) et registre G7 | retirer « jamais de republication… pas de couplage avec BELL-REPUBLISH-RULING-1 » ; déclarer : le surensemble republie `a` sous PR-1, reste vert sous le FILTRE de PR-2, rougit sous un REFUS ; si le G7 PR-2 tranche « refus », la même pli PR-2 réécrit l'assertion (attendu `duplicate_run`, g13 et y09 toujours tués dans les deux ordres) | 0 | p6 not ok (`duplicate_run: $.runs[1]`) ; fusion PR-2 26/26 avec `skipped_already_published 1` × 2 | worker PR-1-bis (affirmation non vérifiée) + relecteur G2 PR-1 (spec C-7 écrite à côté de l'avis O-1 (b) sans signaler le couplage) |

Les sondes f1..f4 n'exécutent que `node --test` (types effacés, pas de lint). **Vérification combinée** (`combo-check.mjs` sha `1e76177a…5ceb`, clone `lot`, application de TOUS les correctifs ensemble, restauration octet, status 0 ligne après ; rapport `combo/REPORT.jsonl` sha `fbbfaf7b…4505`) :

| Combinaison | `typecheck` | `lint` | `lint:ratchet` | 3 fichiers du lot | R-25 (arbre de travail, pathspec `ci.yml:65`) | Sous y08 / g11 (test C-6) |
|---|---|---|---|---|---|---|
| A = CD-1 + CD-2 + CD-3 (même ligne) + CD-4, C-6 livré | 0 | 0 | 0 (69/69) | 26/26 (TAP `246c7587…0d17`) | **1 148** | (f4 : y08 et g11 rouges) |
| B = idem, C-6 agnostique v2 + CD-4 après lui | 0 | 0 | 0 (69/69) | 26/26 (TAP `61afff5a…576f`) | **1 149** | y08 **not ok** (`keyring.json missing…`), g11 **not ok** (`Missing expected exception…`) |
| B avec candidat v1 (conservé, `combo-v1/`) | **2** (TS2345 `durable.test.ts:257:168`, `:257:172`) | 0 | 0 | 26/26 | 1 149 | — |

**Matrice R-25** (mesuré ; « dérivé » = +1 ligne pour CD-3 sur sa propre ligne) :

| Forme C-6 | CD-3 sur la même ligne | CD-3 sur sa propre ligne |
|---|---|---|
| livrée | **1 148** (mesuré), marge 2 | 1 149 (dérivé), marge 1 |
| agnostique (v2) | **1 149** (mesuré), marge 1 | **1 150** (dérivé), **marge 0** : toute ligne de plus au pli correctif impose le ruling « commit séparé » |

**Critère d'acceptation du pli correctif** : `fix-probes.mjs` 13/13 conformes ET `y-mutants.mjs` rejoué sur l'arbre plié = 9/9 KILLED byIntended ET `g2-mutants-replay.mjs` 14/14 ET oracle 7 portes ET R-25 ≤ 1 150. Voie alternative (ruling orchestrateur) : CD-1..CD-4 en items formés avec déclencheur (au plus tard G7 PR-1), CD-5 obligatoire dans tous les cas (le registre ne peut pas porter l'affirmation fausse).

## 10. Observations (non bloquantes ; items formés, aucun « dû » nu)

- **O-a — C-7, les deux ordres sont nécessaires** (mesuré) : g13 n'est tué que par {366}→{366,365}, y09 que par {365}→{365,366}. Toute réécriture de C-7 (CD-5) doit garder les deux ordres.
- **O-b — coordination PR-1-bis ⊕ PR-2** : 0 fichier commun, 0 conflit (`merge-tree` et fusion locale), 3 fichiers du lot 26/26 sur l'arbre fusionné ; l'oracle complet de l'arbre fusionné reste au G7 (chaîne standard). Propriétaire : orchestrateur ; déclencheur : G7 PR-1 puis G7 PR-2.
- **O-c — y05** : sous-cas `constructor` DÉDUIT (premier nom hérité de la boucle `close_source, adv_source, constructor, __proto__` ; les deux premiers ne sont pas des clés héritées de `{}`) ; `__proto__` est isolé par x02 du rédacteur (non rejoué ici).
- **O-d — C-5** : seule la forme `://` est utilisée sur l'état et les enregistrements ; les autres formes de `KEY_SHAPES` sont épinglées par les cas de provenance et la copie verbatim (`:154-156`). Aucun mutant mesuré n'en tire parti ; non retenu comme correction.
- **O-e — budget** : ≈ 52 min au lieu de 30 (DV-4).

## 11. `error_origin` (proposés ; assignés au G7)

| Point | Origine | Motif |
|---|---|---|
| CD-1, CD-2, CD-3 | relecteur G2 PR-1 | les specs C-1/C-2/C-3 (et les témoins G2) portaient la même faiblesse ; le rédacteur les a réalisées à la lettre |
| CD-4 | worker G1 PR-1 + relecteur G2 PR-1 | branche `keyring.json missing` (`bell-publish.mjs:182`) jamais testée, non détectée au G2 |
| CD-5 | worker PR-1-bis + relecteur G2 PR-1 | affirmation non vérifiée dans le rendu ; spec C-7 et avis O-1 (b) non réconciliés dans le même G2 |
| DV-2 | relecteur G2-delta | commande supposée sans écriture |
| DV-8 | relecteur G2-delta | candidat C-6 v1 non typé (TS2345), attrapé par la vérification combinée avant livraison, corrigé en v2 |
| O-e | environnement + relecteur | charge concurrente (42 processus `node`), sondes supplémentaires |

## 12. Déviations du relecteur (déclarées)

- **DV-1** — chemins de la mission : `docs/G2-lot-t1b-pr1.md` absent ⇒ lu `docs/G2-lot-t1b-backend-pr1.md` ; `PLI1BIS.diff` ⇒ `PR1BIS.diff`.
- **DV-2 — écriture sous `F:\Monark*`** : `git merge-tree --write-tree d4fcb76 f40e0e6` (20:10:34Z) a créé 4 objets arbre **non référencés** dans `F:/Monark/.git/objects` : `a77679acded62cb6097e29bca088d49471e17a35` (racine), `f3e5138c8794de5795d0da73d360243989c5b9f0` (`apps`), `6595fa6ba11ea05cf152197a5c175a5762959e0c` (`apps/bell`), `62c5d0e720f70004f42df05b378571acea256eba` (`apps/bell/test`). Aucun ref, index ni arbre de travail touché (`F:/Monark` status 0 ligne, `F:/Monark-wt-t1b` status 0 ligne à la clôture). Non supprimés (ce serait une seconde écriture) ; objets inaccessibles, élagués par `git gc` après le délai de grâce. Contraire à la consigne ; `error_origin` relecteur.
- **DV-3** — témoin G2 non rejoué : il importe `../mut/…` = le clone G2 @ `64dbbd6`, pas l'arbre testé ; le rouge byIntended d'un test PR-1 prouve à lui seul que la mutation est vivante.
- **DV-4** — boîte de temps 30 min dépassée (19:51Z → 20:43Z, ≈ 52 min) : sondes de ruling, de fusion, de correctifs et vérification combinée ajoutées pour que chaque correction proposée soit mesurée, pas affirmée.
- **DV-5** — advisor intégré : appel d'orientation (≈20:00-20:04Z) « timed out » ; appel de clôture (≈20:29-20:32Z) : avis reçu, 3 points traités (journal).
- **DV-6** — incident A-13 reproduit : dans un `node -e` passé par l'outil Bash, un compte de `\n` littéraux a été mutilé (il a compté les sauts de ligne) ⇒ rejeté ; les comptes TAB/CR/non-ASCII (0) sont robustes à la mutilation (une mutilation aurait donné des comptes ≫ 0). Une première commande d'hygiène a échoué sur une erreur de guillemets (sans effet).
- **DV-7** — le clone `lot` a servi à l'oracle (terminé 20:09:03Z, status 0) PUIS à une fusion locale `b45b24de`, aux sondes et à la vérification combinée ; remis à `d4fcb76`, status 0 ligne. Rien de cela n'a touché `F:/Monark` hors DV-2.
- **DV-8** — mon candidat agnostique C-6 v1 portait une erreur de type (TS2345 ×2, `durable.test.ts:257`) que les sondes `node --test` ne voyaient pas ; trouvée par `combo-check.mjs`, corrigée (`as const`, v2), sondes et combinaisons rejouées. Seule la v2 est proposée.

## 13. Provenance

- **Relecteur** : `claude-opus-5-5[1m]` (R-1), effort max, 2026-09-23 19:51Z → 20:43Z ; instance séparée du rédacteur PR-1-bis ; aucun commit du lot, aucun workflow, aucune CI (R-20). Réviseurs attendus : orchestrateur (R-21, G7 PR-1) ‖ checkpoint-2 du validateur-humain. Ce G2-delta est un avis de relecture, pas un verdict G7.
- **Environnement** : Node v24.15.0, Git Bash (MINGW64), win32 10.0.19045, 24 cœurs, 42 processus `node` concurrents à 19:56Z ; TEMP/TMP/TMPDIR `F:/tmp/g2d-t1b-pr1bis/tmp` ; cache npm `F:\cache\npm` (`--offline`).
- **Entrées (sha256 recomputés)** : G2 PR-1 `00e62a62…8b85` ; harnais G2 `8e23cf7750de0508a09ca8aecf7ed43f8c06abb92bbb8e418305afacf7165143` ; témoin G2 `eaffc422…2bc9` ; rendu `42e028b224bb928ab46329a6ff4bd2db38d4bfe3369d85dc73570bb6082ee3b8` ; `TABLES.md` `6f5974a6…95a5` ; `DELIVERED.sha256` `0e3ca143…ad51` ; `PR1BIS.diff` `116488b7…d544` (= mon `step1-diff-pli.diff`).
- **Scripts (sha256)** : `setup-clones.sh` `196dd044…acfc7` ; `step1.sh` `949c762b…d7` ; `r25.mjs` `eab7f077…4618` ; `run-oracle.sh` `0c57872e…5141` ; `mk-replay.mjs` `a6d75bef…c59e` ; `g2-mutants-replay.mjs` `98a04c24…5020` ; `y-mutants-M.txt` `d201f103…3e91` ; `mk-y-harness.mjs` `a6373cd9…4c59` ; `y-mutants.mjs` `ac16ede0…4826` ; `c6-agnostic-candidate.txt` v2 `1d39be7d…3a0e` (v1 conservée `c6-agnostic-candidate-v1.txt` `34636cd0…aa72`) ; `ruling-probes.mjs` `b058c789…8771` ; `fix-probes.mjs` `861eea57…d317` ; `combo-check.mjs` `1e76177a…5ceb`.
- **Preuves (sha256)** : `step1.txt` `7e5e6c93…9464` ; `R25.txt` `99891899…c72b` ; `oracle/codes.txt` `c762e0cd…75b2` ; `oracle/test.tap` `a493cdc8…982d` ; `mk-replay.log` `56a4884c…3f42` ; `g2-replay.diff` `b62d82bb…60c1` ; `g2-mut.log` `3a18fa22…ee32` ; `mutants-g2/REPORT.jsonl` `13614d54…e733` ; `PREDICTIONS-y.txt` `7407705d…373c` ; `y-mut.log` `2a959029…5a77` ; `mutants-y/REPORT.jsonl` `bb5c4690…5306` ; `probes.log` `367055e9…a339` ; `probes/REPORT.jsonl` `b98b0136…3bb2` ; `fixprobes.log` `b63a9997…213c` ; `fixprobes/REPORT.jsonl` `ed47f4d1…2402` ; `merged-3files.tap` `62bebbff…35af` ; `merge-lot.log` `bebcc9bf…132380` ; `setup.log` `5a430115…4a68` ; `combo.log` (v2) `fba3e569…d84b` ; `combo/REPORT.jsonl` (v2) `fbbfaf7b…4505` ; `combo-v1.log` `a4ab7578…37cd1` ; `combo-v1/REPORT.jsonl` `9b430a8e…dd26` ; `combo-v1/B-agnostic-c6-typecheck.log` `3c5eb261…a3d` ; TAP combinaisons v2 : A `246c7587…0d17`, B `61afff5a…576f`. Un TAP par exécution sous `mutants-g2/`, `mutants-y/`, `probes/`, `fixprobes/`, `oracle/`.
