# G2-delta — pli C-1..C-9 PR-2 T-1b (`55bcdac`, relecteur Opus 5.5, contexte frais)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2d-t1b-pr2/G2.md` (sha256 7dddcefc…). Verdict : PASS-AVEC-CORRECTIONS C-D-1 (C-9 (a) indépendante du statut, d-08) et C-D-2 (sous-cas C-8 nommés : `--url` pendant, `--broken` en publication, `--generate-key`+`--rotate`, valeur `--x` de `--state` ; d-01/04/05/06) — appliquées par l'orchestrateur (PR-2 quater) ; BELL-CLI-UNKNOWN-FLAG-1 confirmé et élargi (`--keyring=<f>`, positionnel), ruling (a) ensemble fermé d'options par mode → item avec déclencheur « avant la première rotation / premier lot touchant les CLI Bell » (chemin servi = ExecStart à arguments fixes ; commandes RUNBOOK fixes) ; BELL-KEYRING-MARKER-VOCAB-1 (a) schéma fermé `active|retired|lost|revoked` → même déclencheur ; 17/17 G2 + MA/MA2/MB/MC + 10 p-* + 37 G1 rejoués ; oracle 7 × 0 (1 130/1 127/0/3) ; R-25 forme CI 1 120.

---

Modèle résolu : claude-opus-5-5[1m]

# G2-delta — pli C-1..C-9 de la PR-2 T-1b-backend (`lot/t1b-pr2` @ `55bcdac`, base `f40e0e6`) — relecteur en contexte frais

- Relecteur : `claude-opus-5-5[1m]`, effort max (R-1 : préfixe `claude-opus-5-5` conforme). Instance séparée du rédacteur du pli. Aucun commit, aucun workflow, aucun réseau hors loopback, aucune clé réelle (clés jetables en mémoire). Ceinture A-7 (`env -u` × 8) et TEMP/TMP/TMPDIR = `F:/tmp/g2d-t1b-pr2/tmp` sur chaque commande node/npm/git. Écritures : `F:\tmp\g2d-t1b-pr2\` seulement ; aucun contenu écrit sous `F:\Monark*` (lecture seule de `F:\Monark` par `git clone`, de `F:\Monark-wt-t1b-pr2` par `git`/`sed`/`sha256sum`) — réserve déclarée §10.9 : un `git status` initial a pu rafraîchir le cache de stat de l'index git du worktree.
- Arbres (sous `F:\tmp\g2d-t1b-pr2\`) : `clone` = `git clone --no-hardlinks -b lot/t1b-pr2 F:/Monark` (HEAD `55bcdaca9ff54b441d8aa117f25b762a3e403b81`, parent `f40e0e6`, porcelain 0 à chaque mesure) ; `mut` = worktree détaché de MON clone @ `55bcdac` (mutations). `npm ci --ignore-scripts --offline --cache F:/tmp/npm-cache --logs-dir F:/tmp/g2d-t1b-pr2/npm-logs` exit 0 dans les deux ; A-2 : `require.resolve('@monark/rpc-guard')` = `<arbre>\packages\rpc-guard\src\index.ts` dans les deux.
- Entrées lues (sha256 recomputés) : RENDU `F:\tmp\t1b-pr2-pli\RENDU.md` `813b851fc918d0bc3fa902509a7f317c67a7e24a11c9fab558c3e5f57e1b9a96` (= mission) ; `PLI.diff` `0a63d1cb453862a0b7b653685096cfd8f0294d72a2ccdc5ef6267e7a57b819ee` ; `DELIVERED.sha256` `2ca1a746…1a08` ; G2 PR-2 `F:\Monark\docs\G2-lot-t1b-pr2.md` (§4, §5, §8, §9) ; cp-2 `F:\tmp\cp2-t1b-pr2\CP2.md` (MA/MA2/MB/MC) ; harnais G2 `mutants.mjs` `e85aede7…e747a`, cp-2 `mut.mjs` `39ee4ff7…390c`, sonde G2 `probes/probe.mjs` `623a7c65…1465`, tableau `p-*` du rédacteur `pli-mutants-array.txt` `5ea397a2…1066`.

**Verdict : PASS-AVEC-CORRECTIONS** — liste fermée **C-D-1, C-D-2**, deux compléments de TEST seulement (aucun code) : les trois changements de code (C-8 a/b, C-9 a/b) sont fail-closed, sans régression mesurée, et chaque preuve attendue par le G2 est obtenue ; mais deux clauses NOMMÉES du texte fermé (C-9 (a) hors `status:"revoked"`, sous-cas de C-8) passent sans être épinglées (mutants propres prédits survivants, §4). §8.

## 0. Journal (horloge `date -u`)

- 20:31Z orientation (lecture seule : G2, RENDU, PLI.diff, code et tests du pli) ; 20:32:03Z clone + worktree `mut` ; 20:34:16Z `npm ci` × 2 exit 0.
- 20:34:53Z-20:38:36Z oracle 7 portes sur `clone` (seul, aucune charge concurrente) ; 20:34:59Z périmètre ; 20:35:23Z R-25 ; A-6.
- 20:38:28Z **prédictions des 10 mutants propres écrites et hachées AVANT tout run** (`PREDICTIONS.md` sha256 `2265cb77faa60aa474a7e95fe6e06d06af817c5496aed0a79f67a57c1f6dda1f`, mtime 21:38:28 +0100 = 20:38:28Z).
- 20:40:27Z-(voir §3) campagne de mutants sur `mut` (5 bases + 37 G1 + 17 G2 + 10 `p-*` + 10 `d-*`, puis MA/MA2/MB/MC) ; 20:41:28Z sondes P-1..P-6 rejouées ; 20:42:11Z sondes nouvelles P-7..P-9 (sur `clone`, pendant la campagne sur `mut` : déviation §10).
- ~20:47Z advisor intégré avant écriture (avis reçu, conseil pas verdict ; suivis : critère « clause dans le texte fermé ⇒ correction, hors texte ⇒ item » ; d-02/d-09 déclarés équivalents, d-06 examiné et gardé NON équivalent (§4) ; attribution du rouge au message C-n du pli (§3.2) ; A-7 final (§11) ; déviations (§10)).
- 20:47:56Z fin du harnais G2 (exit 0) ; 20:48:26Z fin cp-2 ; 20:53Z-20:56Z recoupements (`compare-reports`, `attrib`), A-7 final ; 20:58Z G2.md complet (sha consigné).
- ~20:59Z **advisor intégré avant clôture** (après écriture durable ; avis reçu, conseil pas verdict) : retouches pliées — (1) coût borné et portée bloquante de C-D-1/C-D-2 (§8) ; (2) `error_origin` des constats hors corrections (§10) ; (3) « budget tenu » (§10.6) ; (4) confrontation avec le RENDU (§7bis) ; volet d-06 durci par une mesure du doré (21:00:05Z, §8), avec un artefact de mesure consigné (§10.8).

## 1. Rejeu (1) — diff, périmètre, gelés, livrables (`SCOPE.txt`, `A6.txt`, `DELIVERED-check.txt`)

- `git diff --name-status f40e0e6..55bcdac` : **7 fichiers M** — `apps/bell/scripts/{bell-chain,bell-publish,bell-verify}.mjs`, `apps/bell/test/{bell-keys,bell-publish-durable,bell-verify}.test.ts`, `test/no-cash-provider-name.test.ts` ; hors de `{apps/bell/scripts, apps/bell/test, test/no-cash-provider-name.test.ts}` : **0** ; invariant de périmètre du backlog (`apps/site README.md skills schemas packages/contracts apps/bell/src apps/sentinel deploy/monark-{harness,sentinel,probe}.*`) : **0 ligne**. Parent de `55bcdac` = `f40e0e6` (un seul commit).
- `PLI.diff` du rédacteur = `git diff f40e0e6..55bcdac` **octet pour octet** (même sha256 `0a63d1cb…19ee`) : le commit est le pli relu par le rédacteur, rien de plus.
- **A-6, 9 gelés du prereg U-4b §2** (`docs/PLAN-u4b-prereg.md:114-124`), sha256 LF des blobs à `f40e0e6` et `55bcdac` : **18/18 = prereg** (`2f9a31f6 a5e66cd3 5733daeb 7bee76fc 3376eb08 9206df91 0e232519 3603265d cb020425`) ; intersection avec le diff = ∅.
- `DELIVERED.sha256` (7 lignes) = sha256 des blobs `55bcdac:<chemin>` : **7/7**.
- Citations fichier:ligne du RENDU §1 : **19/19 exactes** à `55bcdac`.

## 2. Rejeu (2) — chaque correction : le test prouve-t-il la propriété ? Le code est-il fail-closed ?

### 2.1 Tests C-1..C-7 (lecture + mutant propriétaire tué par l'assertion DU PLI)

| # | Assertion du pli (fichier:ligne @ `55bcdac`) | Pourquoi elle prouve la propriété (et pas seulement qu'elle passe) | Mutant(s) | Verdict |
|---|---|---|---|---|
| C-1 | `bell-verify.test.ts:45` : ligne 2 altérée PUIS re-signée par K ⇒ `chain_broken: line 3` | signature de la ligne 2 valide (re-signée) : seul le maillon `prev_line_hash` de la ligne 3 peut objecter ; message exact épinglé | g2-02 | conforme |
| C-1 bis | `bell-publish-durable.test.ts:181-186` : timeline privée 3 lignes, ligne 1 re-signée, ligne 3 fabriquée et correctement chaînée à l2 ⇒ rupture en ligne 2 (PAS la dernière) ⇒ `existing_timeline_corrupt` | 3 signatures valides : seul le chaînage au milieu objecte ; sous g2-02b (chaîne contrôlée sur la dernière ligne seule) le refus disparaît | g2-02b | conforme |
| C-2 | `bell-keys.test.ts:54-55` : `sig_new := sig` ⇒ `signature_invalid: line 2` | cas distinct de la suppression (k01) : copie de la signature de l'ANCIENNE clé | g2-03 | conforme |
| C-3 | `bell-keys.test.ts:74-75` et `bell-verify.test.ts:118-120` : rotation CONTRE-SIGNÉE vers une clé hors trousseau, `pubkey.json` d'avant la rotation servi ET fourni ⇒ `rotation_key_not_in_keyring: line 2` | servir l'ancien trousseau neutralise `served_key_not_in_keyring` : seule la règle C-9 stricte de la marche peut objecter | g2-05, g2-05b, MA, MA2 | conforme |
| C-4 | `bell-verify.test.ts:65` : un octet de `states/<sha l1>.json` (non tête) ⇒ `immutable_mismatch: line 1` | le sha est comparé avant tout `parse` : l'octet altéré ne peut être refusé que par le re-hachage de l'immuable NON tête | g2-12, MB | conforme |
| C-5 | `bell-verify.test.ts:66-68` : `resealHead` (tête re-signée sur la nouvelle enveloppe) avec `published_at` = epoch ⇒ `envelope_mismatch: line 1` | sha et signature cohérents : seule la liaison `published_at` enveloppe/ligne objecte | g2-14, MC | conforme |
| C-6 | `bell-verify.test.ts:90`, `:99-102` : corps répertoire 64 o ⇒ `too_large: timeline.jsonl` ; ligne 64 o (borne passée à `verifyServed`) ⇒ `too_large: timeline line 1` ; `/mute/` muet + `TIMEOUT_MS` 200 en COURSE contre une garde de 5 s (`unref`) ⇒ `unreachable: timeline.jsonl` ; `closeAllConnections()` en `finally` | chaque borne abaissée donne son refus nommé (règle ADR « Constantes ») ; sous g2-10 la garde tranche (« hung ») en ≈ 5 s, jamais le délai de 120 s | g2-09, g2-10, g2-11 | conforme |
| C-7 | `test/no-cash-provider-name.test.ts:77-81` : non-vacuité des DEUX sources de la provenance d'ENTRÉE, puis 0 occurrence (minuscules) des noms `close_source`/`adv_source` et de leurs VALEURS lues dans l'entrée ; le message ne cite jamais une valeur | aucun nouveau littéral (décision 69) ; non-vacuité avant la recherche | g2-13 | conforme |

Attribution du rouge au message du PLI (pas à une assertion préexistante) : §3.2.

### 2.2 Code C-8 / C-9 — fail-closed, régression, chemins de contournement

- **C-8 (a)** `bell-verify.mjs:124-125` : `dangling` = une option à valeur (`--url`, `--dir`, `--keyring`) présente dont la valeur manque ou commence par `--` ⇒ usage, exit 1, AVANT toute lecture ou connexion. Même index (`indexOf`) que `arg()` : cohérent. Mesuré (`probes/probe-cli-extra.log`, 20:56:56Z, code doré) : `--keyring ""` ⇒ exit 1 `bell/verify: fatal: ENOENT` ; `--keyring --keyring <f>` ⇒ usage exit 1 (fail-closed). **Fail-closed : oui.** Régression : aucune (oracle vert ; seul appelant hors tests = `scripts/verify-bell.mjs` de la PR-3, déjà rouge par C-V-6 et hors de cet arbre).
- **C-8 (b)** `bell-publish.mjs:367-369` : option à valeur manquante ou `--x` ; plus d'un drapeau de mode ; `--broken` hors `rotate` ⇒ usage, exit 1, avant `CREDENTIALS_DIRECTORY` et toute écriture. `--from-seq` non numérique ⇒ `Number` NaN ⇒ `revocation_invalid` (préexistant). **Fail-closed : oui.** Régression : chemin servi de la PR-3 (`a31c8f3`, lecture seule) — `ExecStart … bell-publish.mjs --inbox /var/lib/monark-bell/inbox --state /var/lib/monark-bell` et RUNBOOK `--generate-key /etc/monark/bell/signing-key.pem` restent valides sous la nouvelle grammaire.
- **C-9 (a)** `bell-chain.mjs:113` : `revoked_from_seq` présent et non entier ≥ 1 (quel que soit `status`), ou `status:"revoked"` sans `revoked_from_seq` ⇒ `trustOf` nul ⇒ `keyring_invalid`. Régression : le trousseau SERVI est dérivé par `deriveKeyring`, qui n'écrit `revoked_from_seq` qu'entier (`Math.min` de valeurs validées dans [1, seq] par la marche, `bell-chain.mjs:171`) ; contrôle de genèse `bell-publish.mjs:180` idem ; tests de republication après révocation verts. **Fail-closed : oui.**
- **C-9 (b)** `bell-publish.mjs:185` : `trustOf(keyring) ?? corrupt(…)` ; `corrupt` = `refuse("existing_timeline_corrupt", …)` (`:166`) lève toujours. **Fail-closed et nommé : oui** (P-6 §5).
- **Chemins qui contournent** (sondes §5.2, code doré `55bcdac`) :
  1. **BELL-CLI-UNKNOWN-FLAG-1 CONFIRMÉ et élargi** : un argument hors de l'ensemble d'options est ignoré ⇒ la racine est perdue EN SILENCE, exit 0 `self_consistent_only` : `--keyring=<fichier>` (forme GNU usuelle), `--keyrng <fichier>` (faute de frappe), `<fichier>` positionnel (P-7). Côté éditeur, une option que le mode choisi ne consomme pas est ignorée : `--inbox <i> --rotate --state <s>` ⇒ exit 0, ligne `key_rotation` IRRÉVERSIBLE ; `--rotate --from-seq 1 --state <s>` ⇒ rotation (P-9). Hors du texte fermé de C-8 (qui ne vise que `--generate-key`/`--rotate`/`--revoke`, les valeurs `--x` et `--broken`) ⇒ item, pas correction. Ruling proposé §9.
  2. **Marqueur de révocation à vocabulaire ouvert** : `{status:"REVOKED"}`, `{status:"revoked "}` sans seq, `{status:"active", revokedFromSeq:2}` ⇒ ACCEPTÉ `consistent_with_supplied_keyring`, tête de la clé que l'éditeur à la main croyait révoquer (P-8). Hors du texte de C-9 (qui énumère `revoked_from_seq` mal typé et `status:"revoked"` sans seq) ⇒ item séparé §9.
  3. `{status:"active", revoked_from_seq:"2"}` et `revoked_from_seq:null` ⇒ `keyring_invalid` : le code doré tient la clause « quel que soit `status` »… mais **aucun test ne l'épingle** (d-08 SURVIVED, §4) ⇒ **C-D-1**.

## 3. Rejeu (3) — mutants depuis les scripts fournis, sur une copie (`mutants-run.log`, `mutants/REPORT.jsonl`, `mutants-cp2/`)

- Harnais : `mutants-replay.mjs` (`d70892cc0d2bd153e48f14e2bf037ed20fcc30bd094b6a0a9e9d6d59ae8fef41`) construit par `build-replay.mjs` depuis le harnais G2 (`e85aede7…`) : `diff` = la ligne des constantes `WT/OUT/TMPD` + l'extension de `M` par le tableau `p-*` du rédacteur (VERBATIM, `5ea397a2…`) et mon tableau `d-*` (`d-mutants-array.txt` `ba37896a…cb16`, écrit à l'outil Write, A-13). À blanc : **74 mutants, 0 `find` invalide**. A-11 (KILLED seulement si `not ok <n> - <intended>` au premier niveau), A-12 (en-tête par TAP), D-1-bis (tmp + fsync + rename, sha relu), REVIEW-TAP-1 inchangés. cp-2 : `cp2-mut-replay.mjs` = `mut.mjs` (`39ee4ff7…`) avec chemins seuls changés (`diff` consigné) : `T` = `mut`, `G` = mon `clone` propre @ `55bcdac`.
- Chaînes MA/MA2/MB/MC (le cp-2 n'a consigné que le sha16 du fichier muté) : **re-prouvées indépendamment** (`cp2-strings-proof.mjs`, log `mutants-cp2-strings-proof.log`) : appliquées aux blobs `f40e0e6` de MON clone, sha16 muté = sha16 LU dans l'en-tête des TAP du cp-2 : **MA `cf3f15851113e957`, MA2 `cf3f15851113e957`, MB `010fc7ce42f6f988`, MC `3041e937394c2f3f` : 4/4 IDENTIQUES** (golden `d84acaa7…`/`e2441e30…` idem). Sur `55bcdac` : MA/MA2 `9289fbdc995023f3`, MB `aa831d09be2a2a2f`, MC `a89e7b47523789e4` (= valeurs du RENDU).

### 3.1 Résultats

- Bases 5/5 exit 0.
- **17 mutants propres du G2 : 17/17 KILLED byIntended**, dont les **11 survivants du G2 (g2-02, 02b, 03, 05, 05b, 09, 10, 11, 12, 13, 14)** ; g2-13b tué avec l'autre rouge `bell_publish_whitelist_equals_collector_types` (identique au G2).
- **Attentes mises à jour** : le G2 PR-2 §8 attendait g2-02b et g2-05b SURVIVED (contre-épreuves contre un second revendicateur, « sauf si le pli loge aussi le cas dans ces tests ») ; la mission exigeait leur mort ; le pli loge les deux cas (`bell-publish-durable.test.ts:181-186` ; `bell-verify.test.ts:118-120`) ⇒ **attente G2-delta : g2-02b KILLED, g2-05b KILLED — mesuré KILLED byIntended**.
- **cp-2 : MA, MA2, MB, MC : 4/4 KILLED byIntended** (reds = le seul test visé ; golden `521270a3…`/`14a7e07c…`, muté MA/MA2 `9289fbdc995023f3`, MB `aa831d09be2a2a2f`, MC `a89e7b47523789e4`, restauré = golden × 4), 20:47:56Z-20:48:26Z.
- **10 `p-*` du rédacteur : 10/10 KILLED byIntended**.
- **37 G1 : 36 KILLED byIntended + k10 SURVIVED** (0644, POSIX seul, déclaré, CI-POSIX-FSYNCDIR-1) = verdicts du G1 et du G2 ; « autres rouges » identiques (v01, e01, e02, e04) sauf **k05 et k06 qui gagnent `bell_key_rotation_cross_signed_verifies`** (attendu : C-3 épingle la même règle C-9 stricte sur la branche contre-signée ; recoupe le RENDU §4bis).
- Restauration : `restore ok` 74/74 (harnais G2, D-1-bis) + 4/4 (cp-2) ; fin de campagne (harnais 20:40:27Z-20:47:56Z, exit 0) : `git -C mut status --porcelain --untracked-files=all` = **0** ; les 5 fichiers mutables = **blobs `55bcdac`** (`bell-chain` 521270a3, `bell-publish` 13557381, `bell-verify` 14a7e07c, `helpers/bell-served` 3f79789a, `transport.ts` f95567f3).
- Recoupements (`compare-reports.mjs` → `compare-reports.log`) : changements de verdict vs G2 = **exactement les 11** (SURVIVED → KILLED) ; changements d'« autres rouges » vs G2 = **k05, k06 seuls** ; `expectMiss` (attentes G2-delta mises à jour) = ∅ ; `restoreBad` = 0 ; vs REPORT du rédacteur : **64/64 identiques** (verdict ET sha doré/muté : l'arbre du rédacteur = blobs `55bcdac`) ; sha identiques au G2 : 2 (e07, c02 : fichiers non touchés par le pli, attendu).

### 3.2 Attribution du rouge au message du pli (`attrib.mjs` → `attrib.log`)

Bloc `error:` du `not ok <n> - <intended>` de premier niveau, lu dans chaque TAP : chaque ancien survivant rougit sur l'assertion AJOUTÉE par le pli, jamais sur une assertion préexistante.

| Mutant | Message qui rougit |
|---|---|
| g2-02 | `C-1: line 2 altered AND re-signed by the key holder` |
| g2-02b | `Missing expected exception: existing_timeline_corrupt: a middle line re-signed by the key holder` |
| g2-03 | `C-2: sig_new is not the new key's signature` |
| g2-05, MA | `C-3: a counter-signed rotation to a key outside the supplied keyring` |
| g2-05b, MA2 | `C-3: the counter-signature adds no trust` |
| g2-09 / g2-10 / g2-11 | `C-6: line bound lowered` / `C-6: silent server, timeout lowered` / `C-6: directory source, body bound lowered` |
| g2-12, MB | `C-4: one byte of a NON-head immutable` |
| g2-13 | `a cash source field (name or value) on a Bell served file (decision 69)` |
| g2-14, MC | `C-5: the envelope's published_at differs from the line's` |
| p-01, p-03 / p-02 | `C-8 (a): --keyring is a usage error` / `C-8 (a): --keyring --dir is a usage error` |
| p-04 / p-05 / p-06 | cas `--rotate --revoke <id> --from-seq 1` / `--generate-key` / `--revoke <id> --from-seq 1 --broken` de la boucle C-8 (b) |
| p-07, p-08, p-09 | formes `{"revoked_from_seq":"2"}`, `{"revoked_from_seq":0}`, `{}` de la boucle C-9 (a) |
| p-10 | `existing_timeline_corrupt` (C-9 (b) : sous le mutant, `TypeError`, pas `BellPublishError`) |
| (témoins préexistants) g2-04 ; g2-13b | `the revoked key's lines from seq 2 are void` ; `served = the run's provenance minus the two names, nothing computed` (= G2) |

## 4. Rejeu (4) — 10 mutants propres C-8/C-9, prédits à l'avance (`PREDICTIONS.md` `2265cb77…`)

| id | mutation | test hôte | prédit | mesuré | lecture |
|---|---|---|---|---|---|
| d-01 | liste « dangling » = `["--keyring"]` | `bell_verify_without_keyring_reports_self_consistent_only` | SURVIVED | **SURVIVED** | clause nommée C-8 (a) « (et `--url`/`--dir`) » non épinglée ⇒ C-D-2 |
| d-02 | contrôle « dangling » sur `lastIndexOf` (analyse réordonnée) | idem | SURVIVED | **SURVIVED** | équivalent en effet (raisonnement sur le code, non mesuré sous le mutant) : ne diffère du doré que sur une option RÉPÉTÉE (`--keyring --keyring <f>` : doré ⇒ usage, mesuré ; mutant ⇒ `readFileSync("--keyring")` ⇒ `fatal: ENOENT` exit 1) ; aucune perte de racine |
| d-03 | `misuse` contrôlé APRÈS l'acte (generate/rotate/revoke) | `bell_key_rotation_cross_signed_verifies` | KILLED | **KILLED** | rouge au cas 2 (`--revoke … --broken`) : la rotation K2→K3 du cas 1 a été COMMISE avant l'usage tardif, la clé chargée K2 n'est plus active ⇒ message hors usage. Le test refuse un contrôle « après l'acte » |
| d-04 | `--broken` refusé en mode `revoke` seulement | idem | SURVIVED | **SURVIVED** | clause nommée C-8 (b) « `--broken` hors `--rotate` » épinglée pour `revoke` seulement ⇒ C-D-2 |
| d-05 | exclusivité sans `--generate-key` | idem | SURVIVED | **SURVIVED** | clause nommée C-8 (b) « plus d'un drapeau parmi `--generate-key`/`--rotate`/`--revoke` » épinglée pour `--rotate --revoke` seulement ⇒ C-D-2 |
| d-06 | options à valeur sans `--state` | idem | SURVIVED | **SURVIVED** | clause nommée C-8 (b) « toute valeur de drapeau commençant par `--` » épinglée pour `--generate-key` seulement ; non équivalent en principe (raisonnement sur le code, non mesuré sous le mutant : `--state --x` ⇒ `stateDir = "--x"`, opération dans `./--x` au lieu d'un refus d'usage) ⇒ C-D-2 |
| d-07 | `revoked_from_seq` chaîne numérique acceptée par le contrôle | `bell_revoked_key_lines_after_revocation_rejected` | KILLED | **KILLED** | forme `{"revoked_from_seq":"2"}` rougit |
| d-08 | contrôle C-9 (a) seulement si `status === "revoked"` | idem | SURVIVED | **SURVIVED** | clause « `revoked_from_seq` non entier ≥ 1 » (indépendante du statut) non épinglée ; sous ce mutant `{status:"active", revoked_from_seq:"2"}` ré-accepte la clé révoquée (classe P-4) ⇒ **C-D-1** |
| d-09 | `trustOf(keyring) ?? new Map()` | idem | SURVIVED (équivalent) | **SURVIVED** | équivalent : marche sous confiance vide ⇒ `private line 1: key_not_in_keyring` ⇒ même code nommé `existing_timeline_corrupt` |
| d-10 | `--broken` ⇒ mode `rotate` | `bell_key_rotation_cross_signed_verifies` | KILLED | **KILLED** | cas 2 devient une rotation « broken », exit 0 |

**10/10 prédictions confirmées** (3 KILLED, 7 SURVIVED dont 2 équivalents déclarés d'avance). Autres rouges des `d-*` : aucun. Restauration 10/10 à l'octet.

## 5. Rejeu (5) — sondes

### 5.1 P-1, P-2, P-4, P-6 rejouées TELLES QUELLES (`probes/probes-replay.log`)

Script `probes/probe-replay.mjs` (`097f5a1775abaed208f2274b2f1952fca22d0b418163b62cbc40e8a3a0067372`) = sonde G2 `623a7c65…` avec la seule constante d'arbre changée (`diff` : 1 ligne) ; arbre `clone` @ `55bcdac`, 20:41:28Z, exit 0 ; elle rejoue aussi P-3 et P-5 (hors mission, inchangées).

| Sonde | G2 @ `f40e0e6` | pli @ `55bcdac` (mesuré) | Attendu (G2 §8) |
|---|---|---|---|
| P-1 `--keyring` final sans valeur | exit 0, `self_consistent_only` | **exit 1, `bell/verify: usage: …`** ; `--keyring --dir` : usage ; avec valeur : `consistent_with_supplied_keyring` | exit 1 ✔ |
| P-2 `--rotate --revoke K1 --from-seq 1` ; `--generate-key --state` | exit 0, ligne `key_rotation` K3 ; fichier `--state` créé | **exit 1, stdout vide, 3→3 lignes, aucune révocation ni rotation ; `--generate-key --state` exit 1, aucun fichier `--state`** | exit 1, état et cwd intacts ✔ |
| P-4 marqueurs du trousseau fourni | entier ⇒ `head_signed_by_revoked_key: line 2` ; `"2"`, `1.5`, `revoked` sans seq ⇒ ACCEPTÉS | **entier ⇒ `head_signed_by_revoked_key: line 2` (inchangé) ; `"2"`, `1.5`, sans seq ⇒ `keyring_invalid: the supplied keyring`** | ✔ |
| P-6 ligne de rotation privée falsifiée | `TypeError: trust is not iterable` / CLI `fatal: TypeError` | **lib `BellPublishError existing_timeline_corrupt` ; CLI exit 1 `bell/publish: existing_timeline_corrupt: the key lines of the private timeline derive a malformed keyring` ; état intact (empreinte identique)** | ✔ |
| P-3, P-5 (O-1, O-3) | ACCEPTÉ ; `voided` [1,2,3,5,6] | inchangés | items BELL-VERIFY-SCHEDULE-1, BELL-VOID-KEY-LINE-1 (hors pli) |

### 5.2 Sondes nouvelles (`probes/probe-bypass.mjs` `a06ee4ad5f3d862e69dc7931ca32ddc1dd1358437baba2d8e1d1a7f553723f2c` → `probes/probes-bypass.log`, 20:42:11Z, exit 0)

- **P-7** lecteur : témoin `--keyring <f>` ⇒ `consistent_with_supplied_keyring` ; **`--keyring=<f>` ⇒ exit 0 `self_consistent_only`** ; **`--keyrng <f>` ⇒ exit 0 `self_consistent_only`** ; **`<f>` positionnel ⇒ exit 0 `self_consistent_only`** ; `--url <u> --dir` et `--dir <d> --url` (pendants) ⇒ usage exit 1 (C-8 tient).
- **P-8** trousseau fourni (tête = ligne 2 signée K1) : `{status:"active", revoked_from_seq:"2"}` ⇒ `keyring_invalid` ; `revoked_from_seq:null` ⇒ `keyring_invalid` ; `{revoked_from_seq:2}` sans `status` ⇒ `head_signed_by_revoked_key: line 2` ; témoin entier ⇒ idem ; `revoked_from_seq:3` (futur) ⇒ accepté (bien formé, cohérent) ; **`{status:"REVOKED"}`, `{status:"revoked "}` sans seq, `{status:"active", revokedFromSeq:2}` ⇒ ACCEPTÉS**.
- **P-9** éditeur (`CREDENTIALS_DIRECTORY` = clés jetables K1 active, K2 nouvelle ; cwd = ce répertoire) : **`--inbox <i> --rotate --state <s>` ⇒ exit 0 `rotated`, 1→2 lignes, `key_rotation`** ; **`--rotate --from-seq 1 --state <s>` ⇒ exit 0 `rotated`** ; `--inbox <i> --state <s> --broken` ⇒ usage (C-8 tient) ; `--generate-key <f> --rotate --state <s>` ⇒ usage, aucun fichier ; `--generate-key <f> --broken` ⇒ usage, aucun fichier.
- Nettoyage A-7 : `creds_dirs_removed: true` (les deux sondes).

## 6. Rejeu (6) — oracle 7 portes sur `55bcdac` (`oracle/lot/codes.txt`)

Script `oracle/run-oracle.sh` (`fe669604eb09c0cd2e39c92aae92ba2cddc1576bf6c7d33effaf8ea87646bf28`) = celui du G2 (`a97f0e26…`), seuls les chemins TEMP changent (`diff` : 1 ligne + en-tête) ; ceinture sur chaque porte ; codes capturés directement (A-3) ; `test` = commande EXACTE de `package.json:16` + reporters spec/tap.

| Arbre | gate:vocab | typecheck | test | lint | lint:ratchet | lang:gate | export:check | Comptes (TAP) |
|---|---|---|---|---|---|---|---|---|
| `clone` @ `55bcdac`, 20:34:53Z-20:38:36Z, node v24.15.0, seul (aucune charge concurrente) | 0 | 0 | **0** | 0 | 0 (69/69) | 0 | 0 | **1 130 / 1 127 / 0 / 3** ; `not ok` tous niveaux : 0 ; TAP `oracle/lot/test.tap` `8504bbbfe3f6a5b6cb9c335a9766825a97fcd07499339d1531d9cab7ed62425b` |

- = oracle du lot au G2 (1 130 / 1 127 / 0 / 3) et au RENDU : le pli n'ajoute aucun `test()`. Skips (3) préexistants et nommés : `CADDYFILE-ABSENT` (PR-3), Sentinel SIGTERM win32, U-4b artefacts réels absents.
- **Test 42** (`export_public_no_governance_no_french`, `ok 959`) : **vert** ⇒ aucun T42-LOAD-1 à consigner.
- Les 9 tests hôtes du pli : `ok` (lignes TAP 53, 59, 159, 321, 333, 345, 351, 357, 6650).

## 7. Rejeu (7) — R-25 forme CI (`R25.txt`)

`git diff --shortstat 64dbbd6...55bcdac -- <pathspec VERBATIM ci.yml:65>` (merge-base `64dbbd65…`), comptage `awk` de la CI : **12 fichiers, +1 067 / −53 ⇒ 1 120 ≤ 1 150** (marge 30 ; dans la fourchette attendue 1 120-1 128). Contrôles : `64dbbd6...f40e0e6` = 1 076 (= G2) ; `f40e0e6..55bcdac` = 52 (+48/−4). 1 076 + 52 = 1 128 ≠ 1 120 : les 4 lignes supprimées par le pli sont des ajouts de la PR-2, comptés une seule fois dans la forme CI (+1 023 + 48 − 4 = 1 067 ; −53 inchangé). Le message du commit cite « R-25 1128 » (somme majorante) ; la CI mesurera 1 120 (le RENDU §5 donne les deux, exacts) — observation O-D-4.

## 7bis. Confrontation avec le RENDU du rédacteur (`813b851f…`)

Aucune affirmation infirmée : oracle 1 130 / 1 127 / 0 / 3 et test 42 vert (=) ; R-25 1 076 / 52 / 1 120 (=) ; DELIVERED 7/7 (=) ; citations fichier:ligne 19/19 (=) ; REPORT du rédacteur 64/64 identique au mien (verdict ET sha doré/muté) ; chaînes MA/MB/MC : sha16 identiques au cp-2 (=, re-prouvé indépendamment) ; P-1/P-2/P-4/P-6 : comportements identiques ; G1 36 + k10, k05/k06 « autres rouges » (=, §4bis du RENDU) ; BELL-CLI-UNKNOWN-FLAG-1 (`--keyrng`) reproduit. Deux non-dits : O-D-3 (C-8 logé dans des tests existants, écart au « nouveau(x) test(s) nommé(s) » du G2, non déclaré au §6 du RENDU) ; O-D-4 (le message de commit cite 1 128, la forme CI donne 1 120 — le RENDU §5 donne les deux).

## 8. Verdict G2-delta : **PASS-AVEC-CORRECTIONS** — liste fermée C-D-1, C-D-2 (tests seuls)

Acquis : périmètre 7/7 et rien hors périmètre ; A-6 18/18 ; PLI.diff = commit ; DELIVERED 7/7 ; C-1..C-7 prouvés par des assertions dont le message du pli rougit sous le mutant propriétaire ; C-8/C-9 fail-closed, sans régression (oracle 7×0, G1 inchangé, chemin servi PR-3 compatible) ; P-1/P-2/P-4/P-6 conformes ; 17/17 G2 + 10/10 `p-*` tués ; R-25 1 120.

| # | Correction (TEST seulement, aucun code) | Preuve attendue (A-11 : KILLED byIntended sous CE test, message C-D-n) | `error_origin` |
|---|---|---|---|
| **C-D-1** | C-9 (a), clause indépendante du statut : ajouter à la boucle `bell-keys.test.ts:101` une forme SANS `status:"revoked"`, p. ex. `{ status: "active", revoked_from_seq: "2" }` (la retouche à la main qui pose le marqueur mais oublie le statut) ⇒ `keyring_invalid: the supplied keyring` | d-08 KILLED byIntended (`bell_revoked_key_lines_after_revocation_rejected`) ; P-8 `active_string_2` inchangé | worker du pli (formes calquées sur P-4, toutes `status:"revoked"`) ; contributif relecteur G2 (sa sonde P-4 et sa « preuve attendue » n'énuméraient que des formes `status:"revoked"`) |
| **C-D-2** | C-8, sous-cas NOMMÉS non épinglés (un représentant par clause seulement) — une entrée de plus par boucle, rien d'écrit : (a) lecteur `["--url"]` (⇒ `--dir <pub> --url`) ; (b) éditeur `["--inbox", <i>, "--broken"]` (`--broken` hors `--rotate` en mode publication), `["--generate-key", <f>, "--rotate"]` (exclusivité avec `--generate-key`), `["--rotate", "--state"]` (⇒ `--rotate --state --state <s>` : valeur `--x` de `--state`) ⇒ usage, exit 1, stdout vide, 3 lignes / 2 fichiers inchangés | d-01, d-04, d-05, d-06 KILLED byIntended sous leurs hôtes ; p-01..p-06 restent tués | worker du pli (« un test par cas » lu au niveau de la clause, pas du cas) |

- **Coût borné** : UN micro-pli TEST seul (≤ 5 lignes, dans les deux boucles existantes `bell-keys.test.ts:65` et `:101` et la boucle `bell-verify.test.ts:139`), aucun code ⇒ R-25 ≈ 1 124 ≤ 1 150 (marge mesurée 30).
- **Portée bloquante** : **C-D-1 bloque le G7** (sous mutant, fail-open de classe P-4 : un marqueur de révocation posé à la main ré-accepterait la clé révoquée). **C-D-2 bloque aussi, SAUF s'il est absorbé** par BELL-CLI-UNKNOWN-FLAG-1 (a) rulé dans le même pli (le test de grammaire fermée tabulé par CLI couvre alors d-01/d-04/d-05/d-06). C-D-2 repose sur d-01, d-04, d-05 (survivants MESURÉS, cas refusés par le doré : P-7 `dangling_url_after_dir`, P-9 `publish_plus_broken`, `generate_plus_rotate`) ; d-06 en est le volet raisonné (sous le mutant, non mesuré) — le doré refuse la classe visée (valeur `--x` donnée à `--state`), MESURÉ sur une forme de cette classe : `--rotate --state --broken --state <s>` ⇒ exit 1, usage, stdout vide, 2→2 lignes, aucun répertoire `--broken` (`probes/probe-cli-extra.log`, 21:00:05Z).
- **G2-delta suivant, borné** : rejeu de d-01, d-04, d-05, d-06, d-08 ⇒ KILLED byIntended sous leurs hôtes (d-02, d-09 : équivalents, non rejoués) ; oracle 7 portes ; R-25 forme CI.

## 9. Items (aucun « dû » nu)

- **BELL-CLI-UNKNOWN-FLAG-1 — CONFIRMÉ, élargi** (formé par le rédacteur, RENDU §8). Preuves P-7 (`--keyring=<f>`, `--keyrng`, positionnel ⇒ racine perdue en silence, exit 0) et P-9 (`--inbox` ou `--from-seq` ignorés sous `--rotate` ⇒ rotation irréversible). **Ruling proposé : (a)**, étendu : chaque CLI accepte un ensemble FERMÉ d'options PAR MODE (lecteur : `--url|--dir` + `--keyring` ; éditeur : publish = `--inbox --state` ; generate = `--generate-key` ; rotate = `--rotate --state [--broken]` ; revoke = `--revoke --from-seq --state`) ; tout autre argument ⇒ usage, exit 1, avant toute lecture/écriture. Motifs : même classe que P-1 déjà rulée fail-closed (C-8 a) ; `--x=v` est un réflexe d'opérateur ; (b) reporterait la charge sur chaque consommateur alors qu'un opérateur au terminal ne lit que le code de sortie (O-5 du G2). Coût estimé : ≈ 2-4 lignes de code + 1 test tabulé par CLI, marge R-25 30. Preuve attendue si (a) : P-7/P-9 ⇒ usage exit 1, rien d'écrit ; mutant « argument hors ensemble toléré » rouge par CLI ; d-01/d-04/d-05/d-06 rouges. Propriétaire : orchestrateur ; déclencheur : G7 PR-2, au plus tard avant la CA PR-3 contrôle 5 (O-5 / C-V-6). `error_origin` : worker G1 ; contributif rédacteur G0 (S-4/S-6 sans contrat d'erreur CLI).
- **BELL-KEYRING-MARKER-VOCAB-1 — NOUVEAU** (hors texte C-9 ; aucun code dans ce pli). Un marqueur de révocation mal orthographié du trousseau FOURNI (`"REVOKED"`, `"revoked "`, `revokedFromSeq`) est ignoré : la clé que l'opérateur croit révoquer reste de confiance (P-8). `schemas/` ne porte aucun `bell-keyring-v1` : `trustOf` est le seul validateur. Options : (a) `trustOf` valide chaque entrée contre un schéma fermé — membres ⊆ {`key_id`, `jwk`, `status`, `valid_from_seq`, `valid_to_seq`, `revoked_from_seq`, `continuity`}, `status` ∈ {`active`, `retired`, `lost`, `revoked`} (le vocabulaire que `deriveKeyring` écrit, `bell-chain.mjs:162-171`) — sinon `keyring_invalid` ; (b) résiduel écrit à l'ADR §D9 + contrôle de RUNBOOK (après toute édition à la main, `bell-verify --keyring` doit rendre `head_signed_by_revoked_key` ou `voided_lines` attendu). Avis : (a), même fonction déjà rendue stricte par C-9, coût ≈ 2 lignes. Propriétaire : orchestrateur ; déclencheur : avant la première révocation hors bande (première édition à la main du trousseau), à ruler avec BELL-VERIFY-SCHEDULE-1 (O-1 du G2 : même objet, le calendrier du trousseau fourni). `error_origin` : rédacteur G0 (ADR D9 muet sur le schéma du trousseau fourni).
- **O-D-3 — hôte des tests C-8** : le G2 attendait « nouveau(x) test(s) nommé(s) du pli » ; le pli loge C-8 (a) dans `bell_verify_without_keyring_reports_self_consistent_only` (nom adéquat) et C-8 (b) dans `bell_key_rotation_cross_signed_verifies` (nom trompeur pour `--generate-key --state` et `--revoke --broken`) ; écart non déclaré au §6 du RENDU (seul le §4 dit « le pli n'ajoute aucun `test()` »). Non bloquant (A-11 exige un tueur nommé, obtenu) ; au choix de l'orchestrateur : accepter, ou loger la grammaire dans un test nommé si BELL-CLI-UNKNOWN-FLAG-1 (a) est rulé. `error_origin` : worker du pli.
- **O-D-4 — R-25 du message de commit** : « R-25 1128 » (somme (1)+(2)) ; forme CI mesurée 1 120. Le RENDU §5 est exact ; aucune action.
- **O-1, O-2, O-3** du G2 : non traités (hors mission, P-3/P-5 inchangées) ; items BELL-VERIFY-SCHEDULE-1, BELL-REPUBLISH-RESULT-1, BELL-VOID-KEY-LINE-1 à l'orchestrateur (G7). O-4 : plié dans C-9 (b), prouvé (P-6).

## 10. Déviations déclarées

1. **Worktree créé DANS `clone/`** (`git -C clone worktree add … mut` relatif à `clone`) puis déplacé par `git worktree move` vers `F:\tmp\g2d-t1b-pr2\mut` AVANT tout `npm ci`, oracle ou mutant ; `git -C clone status --porcelain` = 0 ensuite. Aucun effet mesurable.
2. **Sondes P-1..P-9 lancées sur `clone` pendant la campagne de mutants sur `mut`** (20:41:28Z-20:42:1xZ vs campagne dès 20:40:27Z) : arbres distincts, charge concurrente seulement ; l'oracle, lui, a tourné SEUL (20:34:53Z-20:38:36Z). g2-10, seul mutant sensible au temps, a tourné après les sondes (9 921 ms : la garde de 5 s tranche).
3. **Fichiers d'entrée écrits à l'outil Write** (A-13 : chaînes à `\\`/`String.raw`) : `oracle/run-oracle.sh`, `d-mutants-array.txt`, `build-replay.mjs`, `cp2-mut-replay.mjs`, `run-mutants.sh`, `cp2-strings-proof.mjs`, `compare-reports.mjs`, `probes/probe-bypass.mjs`, `PREDICTIONS.md`, ce `G2.md`. Copie de la sonde G2 par `sed` (aucun `\` dans la commande ; `diff` = 1 ligne).
4. **Restauration cp-2** : `cp2-mut-replay.mjs` garde la restauration du cp-2 (`copyFileSync` du doré + sha relu), non D-1-bis (pas de fsync) ; compensé par le contrôle final « 5 fichiers mutables = blobs `55bcdac` » et porcelain 0 (§3.1).
5. **`sleep` refusé par l'outil** : attente par notification de tâche de fond.
6. **Budget tenu** : début 20:31Z, livrable complet 20:58Z (27 min ≤ 30) ; retouches de clôture (avis de l'advisor) et remesure d-06 jusqu'à ≈ 21:02Z. Aucun contrôle retranché.
7. **Rejeu au-delà du minimum demandé** (sans coût de délai) : les 37 G1 et les 10 `p-*` du rédacteur ont été rejoués dans la même campagne que les 17 G2 (harnais complet), pour recouper « les 43 autres verdicts inchangés » attendus par le G2 §8.
8. **Artefact de mesure consigné** : la première mesure du doré pour `--rotate --state --broken --state <s>` (20:59:50Z) a affiché `exit=0` parce que `$(date …)` était développé AVANT `$?` dans la même chaîne `echo` (le code affiché est celui de `date`) ; remesurée à 21:00:05Z avec le code capturé immédiatement (`rc=$?`) : **exit 1** ; les deux lignes sont conservées dans `probes/probe-cli-extra.log` (`609fca13…0a05f`) avec la note d'artefact. Les autres mesures de ce log (`--keyring ""`, `--keyring --keyring`) ont `$?` en tête de chaîne : non affectées.

9. **Écriture opportuniste possible sous `F:\Monark\.git`** : ma première commande (orientation, 20:31Z) a lancé `git status --short` dans `F:\Monark-wt-t1b-pr2` SANS `GIT_OPTIONAL_LOCKS=0` ; git peut alors rafraîchir le cache de stat de l'index du worktree (`F:\Monark\.git\worktrees\Monark-wt-t1b-pr2\index`), sans changement de contenu suivi (arbre propre, 0 ligne). Toutes les autres commandes sur `F:\Monark*` étaient des lectures (`git diff <c>..<c>`, `git log`, `git rev-parse`, `git worktree list`, `git clone` depuis `F:/Monark`, `sha256sum`/`cat` des livrables du rédacteur hors dépôt). Non contourné, déclaré.

`error_origin` des constats hors corrections :

| Constat | `error_origin` | Effet |
|---|---|---|
| Déviations 1, 2 (worktree dans `clone/` puis déplacé ; sondes pendant la campagne), 8 (artefact `$?`) et 9 (`git status` sans `GIT_OPTIONAL_LOCKS=0`) | relecteur G2-delta | nul (porcelain 0 ; arbres distincts ; remesure) |
| Déviation 5 (`sleep` refusé) | outillage (harness) | nul |
| O-D-3 (hôte des tests C-8 non déclaré) | worker du pli | nul sur la preuve (A-11 tenu) |
| O-D-4 (« R-25 1128 » dans le message du commit) | orchestrateur (rédaction du message, somme (1)+(2) reprise du RENDU) | nul (RENDU exact ; CI 1 120 ≤ 1 150) |
| BELL-CLI-UNKNOWN-FLAG-1 ; BELL-KEYRING-MARKER-VOCAB-1 | §9 | items formés |

## 11. Provenance

- Généré par `claude-opus-5-5[1m]` (effort max), relecteur G2-delta, 2026-09-23 20:31Z-20:58Z (+ advisor de clôture), sur les arbres listés en tête. Sources : toutes [lu] dans le dépôt (`55bcdac`, `f40e0e6`, `64dbbd6`, `a31c8f3` par `git show`, lecture seule) ou dans `F:\tmp\t1b-pr2-pli\`, `F:\tmp\g2-t1b-pr2\`, `F:\tmp\cp2-t1b-pr2\` (lecture seule). Aucune source externe, aucun chiffre de seconde main ; les verdicts du RENDU et du cp-2 ne sont pas repris comme preuve (tout rejoué, chaînes MA re-prouvées).
- Pièces sous `F:\tmp\g2d-t1b-pr2\` (sha256, 8 premiers…8 derniers hex) : `PREDICTIONS.md` `2265cb77…1f6dda1f` (complet §0) ; `d-mutants-array.txt` `ba37896a…488acb16` ; `build-replay.mjs` `501231ee…585a21bf` → `mutants-replay.mjs` `d70892cc…ae8fef41` ; `cp2-mut-replay.mjs` `8a93eeab…2a5810e4` ; `run-mutants.sh` `f4afe660…77819f60` → `mutants-run.log` `8466dba1…52a9d6a8`, `mutants/REPORT.jsonl` `0c094674…b6c71a46`, `mutants/*.tap` (5 bases + 74), `mutants-cp2/{MA,MA2,MB,MC}.tap` `1a6a6893…40dceae6`, `33022e6e…907e1271`, `c5d9ab3d…5aeed603`, `07dada2b…c7e86215` ; `cp2-strings-proof.mjs` `6b654971…3e921cd6` → `mutants-cp2-strings-proof.log` `8371cab2…6f79ac65` ; `compare-reports.mjs` `6083f922…583c94fc` → `compare-reports.log` `5902634f…30f18f30` ; `attrib.mjs` `329c72e8…89d82f9d` → `attrib.log` `8a39dffc…960ec371` ; `oracle/run-oracle.sh` `fe669604…7646bf28` → `oracle/lot/codes.txt` `04eee604…0c007b40`, `oracle/lot/test.tap` `8504bbbf…ed62425b` (+ 7 journaux de porte) ; `probes/probe-replay.mjs` `097f5a17…a0067372` → `probes/probes-replay.log` `43b1fd36…e5071f3f` ; `probes/probe-bypass.mjs` `a06ee4ad…53723f2c` → `probes/probes-bypass.log` `cc90a2d2…7729e407` ; `SCOPE.txt` `e7794bfb…ac687973` ; `A6.txt` `deff8bf4…e3da380b` ; `R25.txt` `c740aaf3…8bbb3819` ; `DELIVERED-check.txt` `29365d10…6299596e` ; `commit.diff` `0a63d1cb…57b819ee` (= `PLI.diff`). Le sha256 de ce `G2.md` est consigné à côté (`G2.md.sha256`).
- **A-7 final** (comptes seulement, aucun contenu affiché) : 0 bloc `BEGIN … PRIVATE KEY` et 0 membre JWK `"d"` de 43 caractères dans mes TAP/journaux/jsonl ; sous TOUT mon TEMP : 0 bloc PEM privé complet (en-tête + ≥ 40 caractères base64), 0 JWK privée ; 0 répertoire `*creds*`/`*keygen*` restant (les sondes ont effacé les leurs : `creds_dirs_removed: true` × 2) ; 0 fichier `--state` ; restent 6 répertoires d'ÉTAT publics de mes sondes (`g2dp7-*`, `g2dp8-*`, `g2dp9-*` × 4 : trousseaux publics et timelines, aucune clé privée). Aucune variable d'environnement affichée. `git status --porcelain` : `clone` 0, `mut` 0.
- Advisor intégré : avant écriture (avis reçu, §0) ; avant clôture : voir la ligne finale.
- Réviseurs attendus : orchestrateur (R-21, G7). Ce G2-delta est un avis de relecture, pas un verdict G7.
