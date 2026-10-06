claude-opus-5-5

# G1 — journal du lot Dōjō PR-1b-5a (piste A, vérificateur : règle des versions de prix N1-N3, épingles de la CLI V-2 et V-3)

- **Modèle résolu (R-1)** : `claude-opus-5-5` (palier de la mission), effort max, instance fraîche, contexte frais.
- **Mission** : `F:/tmp/dojo/mission-g1-pr1b5a.md` (54 l., 15 487 o.), sha256 `0596139226c66c6fc0030e3263153fa12da56e78f88bfe8f2c19791e91872e65`, recalculé AVANT lecture à `date -u` 06:16:21Z = `sha` du reçu `F:/tmp/dojo/mission-g1-pr1b5a.recu.json` (verdict vert, 12 codes à 0, base = head = `47e58ee7`). Règles `docs/methode/REGLES-MISSION.md` (18 l.), sha256 `12d5f2df4b5dd9b3cb633727f9e5af8d960fdfdfe22f66e4023b8e88bba40335` = celui de la mission, lues en entier (insérées dans la mission).
- **Base** : worktree `F:/Monark-wt-dojo-pr1b5`, branche `lot/dojo-pr1b5`, HEAD `47e58ee700535e06ccc00ccb09ad7430147bcde5`, `git status --porcelain` à l'ouverture : 0 ligne. Tronc `F:/Monark` à `4f4415bd` à 06:24Z (lecture seule). Outils du tronc aux sha256 de la mission : `scripts/red-proof.mjs` `6579b550…ab36`, `scripts/oracle/run.mjs` `8ab26615…5a90`, `scripts/oracle/r25.mjs` `4d0544df…f0`, `scripts/mission/lint.mjs` `4d1383c8…808`, `scripts/mission/launch.mjs` `fb6c277f…ae3d` ; hors mission : `scripts/mutants/run.mjs` `2606e7dae37f4d13764f3a7c5eca3a947885c871d9dc680632a912ad7e083b19`, `scripts/oracle/lock.mjs` `501a76b58e15f45ae8317b1d8a8385f13ff2a9b4740a3fa03f224472822e33bb`.
- **Verrou d'hôte à l'ouverture** : `F:/tmp/oracle-lock/owner.txt` = rôle G1, pid 98736 (node, vivant, `Get-Process`), depuis 06:11:12Z : aucun test ni harnais lancé tant qu'il est tenu.
- **Lot parallèle 5b** : worktree `F:/Monark-wt-dojo-pr1b5b` (HEAD `47e58ee7`) ; `diff` (hors git) des quatre fichiers partagés à 06:26:40Z : 0 différence (5b n'avait rien écrit).

## Lu (entrées de la mission dans son ordre ; sha256 recalculés)

| Entrée | Lignes | sha256 | Lecture |
|---|---|---|---|
| `docs/adr/ADR-DOJO-PR-1B-5.md` | 243 | `620517fd26755b7cd5d19273855438eb3586ba3c7330d272f6d1fae0b46fd65d` | en entier (pli l.221-239, table l.229-232, lignes datées l.241, l.243) |
| `docs/G0-lot-dojo-pr1b5.md` | 72 | `ecfa0d3b7c6407fe866aafaaf2216de94b326132a387d2758e97e6b3872ecce4` | en entier |
| `F:/tmp/dojo/cp1-pr1b5/CP1-report.md` | 88 | `cf49836a9b4047ecde807923d324d9f9b9ce81901c70b607d23c91ac4d6a731e` | en entier |
| `apps/dojo/scripts/dojo-verify.mjs` | 422 | `596a349dbf64afcf3c408ceaee27c40c4287b56d01f09b4c92542e45e48aef59` | en entier |
| `apps/dojo/scripts/dojo-verify.d.mts` | 41 | `7a5e4c212ff310196dd95d9a5595461a9d4fc6ebefb0be0bf1fdfae7f28a594d` | en entier |
| `apps/dojo/scripts/dojo-chain.mjs` | 168 | `04411fa71b2cfd365ef7023161d82e0fa65f9f4904b27964caf78b4b39ca7123` | en entier |
| `apps/dojo/test/dojo-verify.test.ts` | 598 | `10cfacb7e14ec26a5c63623225692e3c55d00ca2d14a113fcb372e4443ccf28c` | en entier |
| `test/dojo-verify-url.test.ts` | 89 | `689176d248ba5be20850e0774173ec8d853c7351f46473a783972ebb78461704` | en entier |
| `apps/dojo/test/dojo-publish.test.ts` | 486 | `a5d1fa1f7f122094477475f2080cebec0589f14e26b2c0a590c881ed5e36260f` | l.185-210 ; puis l.366-392 (hors liste) |
| `docs/adr/ADR-DOJO-PR-1B-4.md` | 247 | `ffc7e139be26997b2c6dfc925f2ccc65b6d1e39f26772c88ac20bdc0eb2853da` | §4 l.137-150, plis l.225-247 |
| `docs/adr/ADR-DOJO-SNAPSHOT-1.md` | 1 365 | `b67d99b676cc846611616340cd5db298b0d6ddc5a44ae621594582e14a978fa1` | l.17, l.260, D-17 l.296-310 |

- **Hors liste, lus pour écrire les tests et conduire les preuves** : `apps/dojo/test/helpers/dojo-fixture.ts` (324 l., `aa4151bcf4fd967b19c15b52d2e981d2992daf5e40eb0c4af1b540dbec1d7d51`, en entier) ; `apps/dojo/scripts/dojo-core.mjs` (492 l., `34075c6f…32f5`, l.478-492, `dayMinimum`) ; `test/dojo-served.test.ts` (`8d6e3ace24e9a9ee62c5e1eead208a01289e0dd4031410169555bf75444d07ae`, l.84-95, l.186-220) ; `test/dojo-page.test.ts` (`7e0c6126…0569`, l.28-48) ; `test/dojo-publish-e2e.test.ts` (`afef7b9d6fe95344087e8e9921c8bacc875ab1694ba1657cb20d5073cdb46544`, l.95-120) ; `apps/dojo/test/dojo-collect.test.ts` (`ad9e8556…c602`, l.468-500) ; `.github/workflows/ci.yml` (`0f401ae2…949a`, l.44-100) ; `package.json` (`d7a429e1…9700`) ; `F:/tmp/dojo/drand-1a/mk-nm.ps1` (`d70d8aea…fbe4`) et `rm-nm.ps1` (`b51b5d22…8749`) ; `F:/tmp/dojo/cp2-pr1b4/CHECKPOINT2-lot-pr1b4.md` (`d60b143b…8c45`, §7 l.80-90) ; tables de mutants de la lignée PR-1b-4 : `F:/tmp/dojo/cp2-pr1b4/mutants-table-cp2.mjs` (`95cef31c1d8278617c646a2f429fcbbfd052b4f492d6b44670a4a330816f6161`), `F:/tmp/dojo/pr1b4-corr/mutants-table-corr.mjs` (`a2b60e3e…bd3f`), `F:/tmp/dojo/pr1b4/mutants-table.mjs` (`13dec40b…cd5b`), `F:/tmp/dojo/g2-pr1b4/mutants-table-g2.mjs` (`f6a4435c…7acc`) ; outils du tronc ci-dessus, en entier.
- **Autres consommateurs du vérificateur, relus sous la règle N** (au-delà du cp-1 §2.2) : `git grep` des `versionBody(`, `versionOf(`, `verifyDojoServed`, coupes de la fixture : `dojo-chain.test.ts:200, 236` (marcheur seul) ; `dojo-collect.test.ts:491` (deux `snapshot`, rien de dû) ; `dojo-publish.test.ts:372-382` (fenêtre A+5, effet A+12 : conforme) et les autres appels l.92-409 (moins de sept jours valides) ; `test/dojo-publish-e2e.test.ts:100-118` (fenêtre des jours 1 à 7, effet 8 : conforme) ; `test/dojo-served.test.ts:92` et `test/dojo-page.test.ts:33-35` (E1 : sept jours sans version, exception de tête ; EA/EAV : tête abstenue, rien de dû) ; `test/dojo-verify-url.test.ts` (fixture entière et `slice(0, 2)`). Aucun troisième test à amender (même conclusion que le cp-1 §2.2, mesurée ici).

## Compte ascendant AVANT tout code (tâche 1, indicatif ; `date -u` 06:33:34Z)

| Fichier | Composants | Insertions | Suppressions |
|---|---|---|---|
| `apps/dojo/scripts/dojo-verify.mjs` | passe calendrier après l.271 (4 l. de commentaire, ≈ 17 l. de code, la ligne du commentaire Q-V-2 comprise) | ≈ 21 | 0 |
| `apps/dojo/test/dojo-verify.test.ts` | aides et tests 1 à 5 avec leurs tueurs (≈ 50) ; D-3 (a) après l.100 (≈ 3) ; deux tests amendés (≈ 6 et 2 tueurs) ; tueurs réancrés l.551, 566, 588 (3) | ≈ 64 | ≈ 9 |
| `test/dojo-verify-url.test.ts` | D-3 (b) après l.87 (≈ 3) ; tueur réancré l.47 (1) | ≈ 4 | 1 |
| `apps/dojo/scripts/dojo-verify.d.mts` | aucune surface de type neuve (passe interne) : inchangé | 0 | 0 |
| **Total** | | ≈ 89 | ≈ 10 |

- Prévu ≈ 99 lignes mesurées (insertions + suppressions) contre ≈ 245 au plan (§5, × 2,31) ; solde prévu ≈ 448 à 547. Repli (C-V-4) seulement sur `r25()` MESURÉ > 547 ou solde < 10 : mesure au premier état complet du code.

## Code (tâche 2 ; `date -u` 06:34Z à 06:39Z)

- **`apps/dojo/scripts/dojo-verify.mjs`** (422 → 445 l., sha256 au gel `e875beda6c48ddb4f58985018f299618b6d9e324d0d49ef1ad483be58ec4c2ca`) : 23 lignes insérées (l.272-294), 0 supprimée. Passe « calendrier » de D-2, placée après le contrôle des valeurs journalières (l.261-271, intact) et avant F-1 (ancienne l.272, désormais l.295) ; `versionCheck` de `dojo-chain.mjs` inchangé (`04411fa7…7123`, fichier non touché).
- **Règle codée** (D-2 à la lettre ; mère l.303-305, l.17) : W = `price_window_days` de l'ancre en vigueur (`cal`) ; jour **valide** = `snapshot` `counted` dont `dayMinimum` des lectures `pool_price` et des lectures `usd_per_sol` sont non nuls (l.286, sens de l.267) ; jour d **dû** si d−W+1..d sont valides et, après une version, d−W+1 ≥ son `window_first_day` + W (N2, l.287). Parcours dans l'ordre des seq : ancre avec `due` non nul ⇒ `version_not_in_force` au seq de l'ancre (fail-closed, l.281) ; `snapshot` avec `due` non nul ⇒ `version_not_in_force` à ce seq (N3, l.284) ; `price_version` : N1 (l.290) puis N3 (l.291), puis `due` nul et fenêtre retenue (l.292) ; fin : exception de tête (aucun refus), dite par le commentaire l.294.
- **`detail` fixés** (ADR §9.3 ; anglais ; aucune valeur, convention l.19) : N1 `effective_day (N1: the day after the window)` ; N3 à la version `window_first_day (N3: the window due)` ; N3 au `snapshot` `a price_version due is missing (N3)` ; ancre `a segment closed with a price_version due (N3, fail-closed)`.
- **Codes** : `price_version_mismatch` et `version_not_in_force` seuls (D-10 l.260) ; `DOJO_VERIFY_REFUSALS` inchangé (45) ; aucun export neuf. **`apps/dojo/scripts/dojo-verify.d.mts` inchangé** (aucune surface de type neuve ; fichier aussi touché par 5b) : Q-G1-7.
- **Redondance déclarée** : N1 étant vérifié avant, `versionCheck` (`dojo-chain.mjs:79-80` : effet après le dernier `snapshot`, dernier `snapshot` au moins f + W − 1) impose que le dernier `snapshot` avant une version soit le jour f + W − 1 ; `due`, s'il n'est pas nul, vaut ce jour : la seconde branche de N3 (`f !== due - W + 1`) est impliquée. Gardée à la lettre de D-2 (règle autoportante : le marcheur, partagé, accepte un sur-ensemble) ; aucun mutant sur elle seule (il serait équivalent) : Q-G1-4.
- **Commentaire Q-V-2** (une version due peut rester après un `ok` à la tête ; DOJO-VERIFY-PV-PENDING-REPORT-1) : l.294, sur l'accolade fermante de la passe, là où l'exception s'applique ; pas dans l'en-tête l.1-9 : toute ligne insérée avant l.56 décale l'ancre des huit tueurs des deux fichiers de tests, dont trois (base l.472, 514, 528) que 5b réécrit vers `dojo-verify-cli.mjs` : trois conflits de plus sur les mêmes lignes, contraires à C-V-3 (Q-G1-1).

## Tests (tâche 2) : tâche → fichier → test → tueur → catégorie

| # | Test (déclaration au gel) | Tueur `// killer:` (sur `apps/dojo/scripts/dojo-verify.mjs`) | Catégorie (`red-proof.mjs`) |
|---|---|---|---|
| 1 | `dojo_verify_price_version_takes_effect_the_day_after_its_window` (`apps/dojo/test/dojo-verify.test.ts:386`) | `:290` SDL, N1 retiré (M-N1) | F2P |
| 2 | `dojo_verify_price_versions_follow_the_first_eligible_window` (`:395`) | `:291` SDL, N3 retiré (M-N3) | F2P |
| 3 | `dojo_verify_refuses_a_snapshot_after_a_missing_version` (`:407`) | `:284` SDL, contrôle au `snapshot` retiré (M-N4) | F2P |
| 4 | `dojo_verify_accepts_a_price_version_pending_at_the_head` (`:419`) | `:294` CONST, refus ajouté en fin de passe (M-N6) | épingle de frontière (Q-V-1) |
| 5 | `dojo_verify_refuses_a_segment_closed_with_a_price_version_due` (`:427`) | `:281` SDL, contrôle à l'ancre retiré (M-N5) | F2P |
| 6a | `dojo_verify_refuses_a_snapshot_derived_from_voided_lines` (`:231`, amendé) | `:297` CONST `head.seq` → `lines.length` (F-1) | épingle (C-V-2) |
| 6b | `dojo_verify_refuses_each_named_mutant` (`:439`, amendé) | `:358` CONST `[null, ...versions.values()]` → `[null]` (M-4) | épingle (C-V-2) |
| 7 | `dojo_verify_cli_is_fail_closed` (`:69`, D-3 (a) l.101-103) | inchangé (`:56`) | épingle (V-3) |
| 8 | `dojo_verify_url_cli_is_the_ca_contract` (`test/dojo-verify-url.test.ts:48`, D-3 (b) l.88-90) | réancré `:393` (C-V-1) | épingle (V-2) |

- **Attentes écrites à la main** depuis la mère (jamais par `versionAfter` ni par le vérificateur ; FM-3.3) : fixture de référence de 12 lignes (ancre 1, historique 2, jours lus 1 à 7 = seq 3 à 9, version 1 = seq 10, jours lus 8 et 9 = seq 11 et 12) ; test 1 @10 (effet au jour lu 9, le `snapshot` du jour 8 nommant `null`) ; test 2 : version 2 sur les jours lus 8 à 14 ⇒ `ok`, sur les jours 6 à 12 (effet 13) ⇒ @16 ; test 3 @10, et trois témoins `ok` (jour lu 4 abstenu, ou compté à lectures SOL toutes nulles, ou à lectures du pool toutes nulles) ; test 4 : coupe après le jour lu 7 ⇒ `ok`, puis une rotation de clé ⇒ `ok` ; test 5 : ancre neuve datée du jour lu 8 après le jour 7 ⇒ @10 (seq de l'ancre), après le jour 6 ⇒ `ok`. Concordent avec le cp-1 §2.2.
- **Amendés (D-2)** : 6a, la ligne annulée après la tête (version 2 chevauchante, refusée par N) devient une ancre datée du jour lu 10, signée par la clé révoquée à son seq 13 : même propriété (F-1), `voided_lines` [13]. 6b, M-4 réécrit avec une version 2 conforme (fenêtre des jours lus 8 à 14, effet au jour 15) en tête de la chronologie `fourteen` (seq 18) : témoin `ok` ; seuils de la version 2 appliqués au jour lu 14 (seq 17) ⇒ `threshold_mismatch @17` (mesuré vert : au moins une ligne diffère entre les seuils des versions 1 et 2) ; le cas « version 1 appliquée avant son effet » (`threshold_mismatch @9`) inchangé.
- **Places des hunks** (C-V-3) : D-3 (a) après la l.100 de la base ; D-3 (b) après la l.87 ; tests neufs après `dojo_verify_daily_values_follow_the_snapshot_reads` (fin l.370) et avant le bloc des mutants nommés. **Tueurs réancrés par contenu** (C-V-1) : `dojo-verify.test.ts` base l.551 (`:356` → `:379`), l.566 (`:352` → `:375`), l.588 (`:367` → `:390`) ; `test/dojo-verify-url.test.ts:47` (`:370` → `:393`). Contrôle statique (awk, 06:38Z) : les 15 lignes `// killer:` des deux fichiers ont leur `<before>` exactement une fois sur la ligne visée.

## Courses ciblées et portes statiques (avant l'oracle ; verrou d'hôte absent à chaque lancement, relu juste avant)

- **Clone du gel** : `F:/tmp/dojo/pr1b5a/gel`, `git clone --no-local --no-checkout` du worktree, `checkout --detach 47e58ee7`, puis copie des quatre fichiers du lot (sha256 égaux au worktree, 06:41Z) ; `node_modules` par `F:/tmp/dojo/drand-1a/mk-nm.ps1` : 220 entrées, 10 `@monark`, 0 échec, `@monark/rpc-guard` résolu dans le clone.
- **Fichiers du lot** (06:43:40Z-06:43:58Z, TEMP `F:/tmp/dojo/pr1b5a/tmp`) : `apps/dojo/test/dojo-verify.test.ts` + `test/dojo-verify-url.test.ts` : **31 / 31 verts** (26 existants, 5 neufs) ; journal `F:/tmp/dojo/pr1b5a/run-lot-1.log` sha256 `7dab2e77a6ccad7d0d7c30145e6810b8054ed293c5565f3985b156e70edc4488`.
- **Consommateurs du vérificateur** (06:44:11Z-06:44:25Z) : `dojo-publish`, `dojo-publish-e2e`, `dojo-served`, `dojo-page`, `dojo-collect`, `dojo-chain`, `dojo-collect-pure`, `dojo-history-build`, `dojo-history-read` : **84 / 84 verts** ; `F:/tmp/dojo/pr1b5a/run-consumers-1.log` sha256 `d30fa87d344266070d4f5f81ad7279ae6a35a64fd7abbfaad6e42fe2d30ec0d2`.
- **Portes statiques** (06:44:39Z-06:45:46Z, dans le clone) : `eslint` des trois fichiers 0 erreur (le `.mjs` est hors de la configuration ; `eslint-1.log`) ; `tsc --noEmit` sortie 0 ; `lang-gate` OK ; `gate:vocab` OK (326 fichiers) ; `lint-model-pinning.sh` OK ; `lint-ratchet` 69/69 (inchangé) ; `export-public --check` OK (journaux `F:/tmp/dojo/pr1b5a/static-*.log`).

## R-25 (tâches 1 et 5)

- **Mesure précoce** (`date -u` 06:41:57Z ; lecture seule dans le worktree, pathspecs exacts de `ci.yml:82`) : `git diff --shortstat 47e58ee7 -- …` = 3 fichiers, **100 insertions, 9 suppressions : 109** ; borne de lot 547 ⇒ **solde 438** ; aucune coupe (C-V-4 : ni > 547 ni solde < 10). Écart au plan : 109 mesurées contre ≈ 245 prévues (§5, estimation × 2,31) ; au compte ascendant de la tâche 1 : 109 contre ≈ 99.
- Calcul exporté de `F:/Monark/scripts/oracle/r25.mjs` : par l'enregistrement de l'oracle (§ Oracle).

## F2P (tâche 3)

- Commande (06:46:03Z-06:47:04Z, TEMP `F:/tmp/dojo/pr1b5a/tmp`) : `node F:/Monark/scripts/red-proof.mjs --base 47e58ee7 --gel F:/Monark-wt-dojo-pr1b5 --repo F:/tmp/dojo/pr1b5a/f2p-repo --out F:/tmp/dojo/pr1b5a/f2p --draw 3 --seed 2026` ; `f2p-repo` = clone `--no-local` à `47e58ee7`, `node_modules` = une jonction vers `F:/Monark/node_modules`.
- **`F:/tmp/dojo/pr1b5a/f2p/RED-PROOF.json` sha256 `480393e0c7e6b235b6889acf67871a8bbefc32b30850d53e053c04dbc005c445`** (`base.tap` `56a470f1…6c84`, `gel.tap` `327ad800…84ef`, `killer-1..3.tap`) ; Node v24.15.0 ; digest des changements `0aa2f77b11a71f827ee2134b358e1ba6c081c35d5c51858e6fb470e7ec0d623d` ; 9 tests jugés, 22 inchangés.
- **F2P (4)** : tests 1, 2, 3, 5 : rouges à la base par `ERR_ASSERTION` (`assert-fail`), verts au gel. **Épingles (5)**, « green at base: a self-confirming test », comme l'ADR les déclare : test 4 (frontière, Q-V-1), 6a et 6b (amendés, C-V-2), 7 (D-3 (a)), 8 (D-3 (b)). Tous les tueurs sont valides (`killerProblem` nul partout).
- **Tirage** (graine 2026, population 4, 3 tirés) : `:291` SDL (test 2), `:290` SDL (test 1), `:281` SDL (test 5) : **3 / 3 tués** par assertion, fichier restauré (sha256 avant = après).
- Sortie de l'outil : 1 (`ok: false`) **par construction** : les cinq épingles sont jugées (lignes changées dans leur corps) et vertes à la base ; c'est la déclaration d'épingle, non un défaut (Q-G1-6).

## Mutants (tâche 4)

- **Table** `F:/tmp/dojo/pr1b5a/mutants-table-pr1b5a.mjs` (sha256 `e9f9574c0569b18f5ad5347d7e42cd1ae70a87e4c36ba03bcfb41420823ec67e`, prédictions écrites AVANT la course) : **M-N1 à M-N8** (§4 de l'ADR, 5a) ; **six rangs neufs du G1, M-N9 à M-N14** (validité sans la série du pool ; six jours valides suffisant ; `due` gardé après sa version ; N2 sans la fenêtre précédente ; N1 décalé d'un jour ; validité inscrite au lendemain) ; **lignée PR-1b-4** : la table du cp-2 importée entière (`F:/tmp/dojo/cp2-pr1b4/mutants-table-cp2.mjs`, `95cef31c…6161` : 42 rangs du correcteur et V-1 à V-4, 46), **partitionnée par ligne** : les 17 rangs d'ancre ≥ l.272 (M-D1 à M-D4, M-D6, M-B1, M-C1, M-C2, N6, N7, N8, N11, G2-4 à G2-6, V-2, V-3) réancrés à ligne + 23, même `before` et `after` ; les 29 rangs d'ancre < l.272 (transport, bornes, M-D5) gardent code et ligne : non rejoués. V-2 et V-3 prédits « tue » (épingles D-3). Contrôle statique de la table avant la course (`check-table.mjs`) : 31 rangs, chacun ancré exactement une fois, identifiants uniques.
- **Garde externe** (REGLES, MUTANTS-LOCK-MIDRUN-1) : `held(F:/tmp)` de `F:/Monark/scripts/oracle/lock.mjs` = `null` à 06:47:38Z (`held-probe.mjs`) ; 12 `node.exe`, 15 877 Mo physiques et 34 597 Mo virtuels libres ; aucun oracle ni aucune course de ma part pendant la campagne.
- **Commande** (06:47:45Z) : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/pr1b5a/gel --base 47e58ee7 --out F:/tmp/dojo/pr1b5a/mutants --table F:/tmp/dojo/pr1b5a/mutants-table-pr1b5a.mjs --killers --file apps/dojo/scripts/dojo-verify.mjs --targets apps/dojo/test/dojo-verify.test.ts,test/dojo-verify-url.test.ts --lock-root F:/tmp --min-free-mb 4096` ; `node_modules` du dossier de sortie = une jonction vers `F:/tmp/dojo/pr1b5a/gel/node_modules` (précédent du cp-2 de PR-1b-4) ; un seul lancement.
- **`F:/tmp/dojo/pr1b5a/mutants/RESULTS.json` sha256 `ee4c63249e47219de7c02e4eb1ff6edae49e255d324988536dae4ab9b989082c`** (`RESULTS.txt` `bfa06efa519134332a035f8893a650d483a21238b59baae275ca3717d9b3483c`) : outil `2606e7da…3b19`, arbre de l'outil `2ba5df8e`, propre ; gel `47e58ee7` + dirty `a41ba458…93bd6` ; `sha0` du module `e875beda…c2ca` ; 06:48:16Z-06:49:26Z. Référence initiale verte : 10 fichiers cibles, 100 verts, 0 rouge.
- **Résultat : 46 / 46 tués, sortie 0** : 31 rangs de table (M-N1 à M-N14, 17 de la lignée) et 15 tueurs (K1 à K15 : les 15 lignes `// killer:` des deux fichiers de tests changés) ; 0 survivant, 0 non conclu, 0 ancre perdue ; **chaque « tué » l'est par `ERR_ASSERTION` seul** (`strict` vrai sur les 46) ; fichier restauré à chaque rang (sha256 avant = après). Chaque rang tombe sur le test prédit (V-2 par le test 8, V-3 par le test 7 : les deux survivants du cp-2 de PR-1b-4 sont tués, DOJO-VERIFY-CLI-PINS-1).

## MAST (risque résiduel)

- **FM-3.3 (vérification incorrecte)** : la règle N est une seconde mise en œuvre de la suite gloutonne de `versionAfter` (TY-1) ; les attentes des tests sont écrites à la main depuis la mère (seqs, jours, fenêtres), jamais calculées ; la seconde mise en œuvre indépendante reste l'item DOJO-VERIFY-INDEPENDENT-1 (inchangé).
- **FM-1.1 (spécification non suivie)** : D-2 codée à la lettre, y compris la branche impliquée de N3 (Q-G1-4) ; les écarts au texte des corrections du cp-1 sont déclarés (Q-G1-1 à Q-G1-3).
- **FM-3.2 (vérification absente après fusion)** : consommateurs rejoués (84 / 84) ; la suite entière par l'oracle ; C-V-1 (5a fusionne en premier ; 5b rebase et réancre ses tueurs).
- **FM-2.2 (clarification non demandée)** : chaque choix hors lettre est une Q-G1 fermée, recommandation jointe.

## Questions Q-G1-n (à l'orchestrateur ; fermées, recommandation jointe ; aucune ne bloque la livraison)

- **Q-G1-1 (place du commentaire Q-V-2)** : ligne l.294 (fin de la passe, là où l'exception s'applique), non dans l'en-tête l.1-9. Mesure : une ligne insérée avant l.56 décale les huit tueurs visant le module (base `dojo-verify.test.ts:68, 472, 514, 528, 551, 566, 588`, `dojo-verify-url.test.ts:47`), dont trois que 5b réécrit vers `dojo-verify-cli.mjs` (l.472, 514, 528) : trois conflits sur les mêmes lignes, contraires à C-V-3 ; la prémisse « coût nul » de Q-V-2 ne tient pas pour 5a. Recommandation : garder l.294, et que 5b ajoute la ligne d'en-tête pendant son rebase (il réécrit déjà l.8-9 : coût nul là).
- **Q-G1-2 (D-3 (a) « après la l.100 »)** : placé à la lettre ; entre ce hunk et celui que 5b ouvre à la l.102 (cp-1 §2.4), une seule ligne inchangée (l.101), sous la règle générale des trois lignes de C-V-3, qui fixe pourtant les deux places. La fusion à trois voies de git admet deux hunks séparés par une ligne inchangée ; 5b rebase de toute façon (C-V-1). Recommandation : laisser, et le dire à 5b.
- **Q-G1-3 (tueurs des deux tests amendés, C-V-2)** : l'exemple du cp-1 (« M-N5 pour le premier via son ancre licite et M-N3 pour le second ») ne les tue pas : retirer un contrôle ne rend jamais rouge une ancre licite ni une version conforme. Retenus : F-1 pour 6a (`:297` CONST `head.seq` → `lines.length`, la propriété du test) et M-4 pour 6b (`:358` CONST `[null, ...versions.values()]` → `[null]`), tués par assertion (K2, K8). Recommandation : admettre ; l'exemple était illustratif.
- **Q-G1-4 (branche impliquée de N3)** : `f !== due - W + 1` gardée à la lettre de D-2 bien qu'impliquée par N1 et `versionCheck` ; aucun mutant sur elle seule. Recommandation : garder (règle autoportante si le marcheur change).
- **Q-G1-5 (composition des mutants)** : « au moins quatre neufs » lu au-delà de M-N1 à M-N8 (six rangs du G1, M-N9 à M-N14) ; « partition des rangs de PR-1b-4 » lue sur la table du cp-2 entière : 17 rangs d'ancre ≥ l.272 réancrés (+23) et rejoués, 29 non rejoués (code et ligne inchangés). Recommandation : admettre ; le G2 peut rejouer les 29 à l'identique s'il le juge utile.
- **Q-G1-6 (sortie 1 de `red-proof.mjs`)** : par construction (cinq épingles jugées, vertes à la base) ; quatre F2P, trois tueurs tirés tués. Recommandation : lire `tests[].verdict` et `draw`, jamais le seul code de sortie.
- **Q-G1-7 (`dojo-verify.d.mts` inchangé)** : aucune surface de type neuve ; fichier aussi de 5b. Recommandation : admettre (la mission le déclarait comme sortie possible, non comme obligation).
- **Q-G1-8 (tueur du test 4)** : l'exception de tête est une absence de contrôle ; M-N6 est un CONST qui ajoute le refus en fin de passe (`<after>` en guillemets simples, sans barre inverse ; précédents `dojo-verify.test.ts:68` et `dojo-publish.test.ts:188`, qui ajoutent du code) ; tué (M-N6, K6). Recommandation : l'admettre comme tueur unique de l'épingle de frontière (Q-V-1).

## `error_origin` proposés (assignés au G7) et items

- É-G1-1 : exemple de tueurs de C-V-2 inopérant (Q-G1-3) : validateur du cp-1 (exemple illustratif ; la ligne datée de l'orchestrateur n'imposait que la présence d'un tueur).
- É-G1-2 : « en tête du cœur, coût nul » (Q-V-2) en conflit avec C-V-3 (Q-G1-1) : validateur du cp-1 (prémisse du coût), orchestrateur (ligne datée).
- É-G1-3 : place de D-3 (a) sous la règle des trois lignes (Q-G1-2) : orchestrateur (ligne datée C-V-3).
- É-G1-4 : trois lignes créées de plus de 160 caractères au premier jet, et un faux compte de CR par `grep` sous Git Bash (0 octet `0x0D` par `tr`, base et gel) : G1, attrapés par mes propres contrôles avant toute course, corrigés ; sans effet sur les livrables.
- É-G1-5 : 109 lignes mesurées contre ≈ 245 prévues (§5) : aucune erreur (facteur × 2,31 volontairement pessimiste).
- **Items** : aucun item neuf. La seule limite de ce lot (une version due à la tête n'est pas dite par le rapport `ok`) est portée par DOJO-VERIFY-PV-PENDING-REPORT-1 (PAROXYSME, existant, commentaire l.294). DOJO-VERIFY-PV-SCHEDULE-1 et DOJO-VERIFY-CLI-PINS-1 : livrés par ce lot, à résoudre au G7 de 5a ; PLI-MERE-PR1B5-1 (D-17 et table des emplois des codes) : au G7 de 5a, orchestrateur.

## Fin : tâche → fichier → test → mutant

| Tâche (ADR, mission) | Fichier (lignes au gel) | Test | Mutants tués |
|---|---|---|---|
| N1 : effet le lendemain de la fenêtre (D-2) | `apps/dojo/scripts/dojo-verify.mjs:290` | 1 | M-N1, M-N13, K3 |
| N2 : première fenêtre éligible après la précédente | `:287` | 2 (témoin `ok`), 6b (témoin M-4) | M-N2, M-N10, M-N12 |
| N3 à la version : la fenêtre due (chevauchement refusé) | `:291`, `:292` | 2 | M-N3, M-N11, K4 |
| N3 au `snapshot` : version due absente | `:284` | 3 | M-N4, K5 |
| Validité d'un jour (`counted`, deux minima non nuls) | `:286` | 3 (trois témoins) ; 1 | M-N7, M-N8, M-N9, M-N14 |
| Fail-closed à l'ancre qui clôt un segment | `:281` | 5 | M-N5, K7 |
| Exception de tête ; commentaire Q-V-2 | `:294` | 4 (épingle de frontière) | M-N6, K6 |
| Amendement F-1 (ligne annulée licite sous N) | `apps/dojo/test/dojo-verify.test.ts:230` (tueur), `:235-238`, `:241` | 6a (épingle) | K2 (F-1, `:297`) |
| Amendement M-4 (version 2 conforme) | `apps/dojo/test/dojo-verify.test.ts:438` (tueur), `:444-445`, `:453` | 6b (épingle) | K8 (`:358`) |
| D-3 (a), V-3 : `--day` par la CLI sur un arbre | `apps/dojo/test/dojo-verify.test.ts:101-103` | 7 (épingle) | V-3 (`:436`) |
| D-3 (b), V-2 : refus sous variables TLS | `test/dojo-verify-url.test.ts:88-90` | 8 (épingle) | V-2 (`:437`) |
| Tueurs réancrés (C-V-1) | `dojo-verify.test.ts` `// killer:` → `:379`, `:375`, `:390` ; `dojo-verify-url.test.ts:47` → `:393` | 4 du PR-1b-4 et 8 | K12, K13, K14, K15 ; lignée M-D1 à M-D6, M-B1, M-C1, M-C2, N6 à N8, N11, G2-4 à G2-6 |

## Oracle (tâche 5)

- Commande (lancée à 06:50:26Z, en arrière-plan, jamais interrompue) : `node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr1b5 --base 47e58ee7 --key PR-1b-5a` ; portes statiques hors verrou ; verrou d'hôte obtenu à 06:58:08Z après 363 s d'attente (un G7 tiers, pid 31916) ; fin 07:05:37Z. Aucune course ni harnais de ma part pendant sa suite.
- **Enregistrement `F:/tmp/oracle-results/47e58ee700535e06ccc00ccb09ad7430147bcde5-71019e2ee8eb1530-G1-20260930T065026Z-132908.json`, sha256 `225419503e338ade5d8a4b8e73c3415933307e4a85e702ae28e5d9c9c09427b2`** : `exit` 0 ; `served_from` nul (arbre sale : rejoué entier, jamais servi) ; étiquette `PR-1b-5a` ; clé `e21262c5…821f` ; arbre `47e58ee7` + dirty `71019e2ee8eb153040a7da64beb71253dfe9403c7f8d8c4bc2dac0a67e6c0670`, objet d'arbre gelé `d7b8825cdccb04f2a3dd784372d4dec04c672e32`.
- **Portes** : `lint-model-pinning` 0, `r25` 0, `lang:gate` 0, `export:check` 0, `gate:vocab` 0, `typecheck` 0, `lint` 0, `lint:ratchet` 0 (statiques) ; `test` 0 (sous verrou, 441 s). **Tests : 1 741, dont 1 738 verts, 0 rouge, 3 ignorés.** C-V-4 : 15 296 Mo libres, 12 `node.exe`. Résidus : 383 entrées temporaires (même compte sur les enregistrements récents d'autres lots, 06:1x-06:5xZ : propre à la suite, non à ce lot).
- **R-25 par le calcul exporté de `r25.mjs`** (champ `r25` de l'enregistrement) : `STAT` **100 insertions, 9 suppressions, 109** (porte CI `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0. Borne de lot 547 : **solde 438** ; égal à la mesure précoce.
- **Écart d'arbre déclaré** : depuis cet enregistrement, seul le journal `docs/G1-lot-dojo-pr1b5a.md` a changé (sections ajoutées après 06:51Z : hors R-25, `docs/**/*.md` exclu ; hors `lang:gate`, `docs` dans `SKIP_DIRS`, `scripts/lang-gate.mjs:113` ; hors `gate:vocab`, qui ne lit pas `docs/`) ; les trois fichiers de code et de tests sont ceux de l'enregistrement (sha256 ci-dessous).

## Remise (`date -u` 07:07Z)

- **Fichiers livrés dans le worktree** (non committés ; R-20) : `apps/dojo/scripts/dojo-verify.mjs` sha256 `e875beda6c48ddb4f58985018f299618b6d9e324d0d49ef1ad483be58ec4c2ca` (dernière écriture 06:35:20Z) ; `apps/dojo/test/dojo-verify.test.ts` `3ff7cb8754b82fbf8885fd13e8a10a2f7fb921bbee495ec432db3e93d1df79d2` (06:39:12Z) ; `test/dojo-verify-url.test.ts` `fcc64f463df20266eef2d66f700ab69e5c2b9e8dcb958276570d93f9d74b28e8` (06:38:29Z) ; ce journal (sha256 final hors du fichier : `F:/tmp/dojo/pr1b5a-deliver/DELIVERED.sha256`). `apps/dojo/scripts/dojo-verify.d.mts` inchangé (`7a5e4c21…a594d`, base). Les trois fichiers de code et de tests sont antérieurs à toutes les courses (clone du gel 06:41Z, F2P 06:46Z, mutants 06:47Z, oracle 06:50:26Z) et égaux à leur copie du gel.
- **Garde d'octets** (07:07Z) sur les quatre fichiers : 0 tabulation, 0 CR, 0 octet de contrôle (0x00-0x08, 0x0B-0x1F, 0x7F), 0 point de code C1, UTF-8 valide, LF final. Barres inverses : module 30 et tests principaux 31, égaux à la base ; `test/dojo-verify-url.test.ts` 4 → 5 (la séquence d'échappement du saut de ligne dans le littéral de D-3 (b), forme de ses l.72-73 et l.83-84) ; ce journal 0.
- **Jonctions** : `gel/node_modules` (`mk-nm.ps1`), `f2p-repo/node_modules` et `mutants/node_modules` (une jonction chacun) retirées à 07:06:55Z par `F:/tmp/dojo/drand-1a/rm-nm.ps1`, absence vérifiée ; `F:/Monark/node_modules` intact (218 entrées visibles). Aucun dossier de travail de `red-proof` ni d'arbre de fixture ne reste sous `F:/tmp/dojo/pr1b5a/tmp`.
- **Conduite** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `git merge-tree --write-tree` ; aucun git écrivant dans le worktree ni dans `F:/Monark` (lecture seule : `rev-parse`, `status`, `diff`, `log`, `show`, `grep`, `worktree list`, avec `GIT_OPTIONAL_LOCKS=0` pour `status` et `diff`) ; git écrivant seulement dans mes clones `--no-local` sous `F:/tmp/dojo/pr1b5a/` (`gel`, `f2p-repo` : `clone` et `checkout`), aucun commit ; les outils du tronc ont fait leurs propres clones et gels dans leurs dossiers. Aucun réseau réel (boucle locale des tests), aucune clé réelle, rien sur C: (TEMP `F:/tmp/dojo/pr1b5a/tmp`). Commandes Bash de moins de 6 Ko. Aucun test ni harnais lancé verrou tenu par un autre (relu avant chaque lancement) ; aucune course pendant ma campagne ni pendant la suite de mon oracle ; l'oracle n'a jamais été interrompu.
- **Outils d'écriture** : outil d'édition (remplacement exact, échec bruyant si l'ancre ne correspond pas) pour le code et les tests, dont une ligne porte une barre inverse (échappement du saut de ligne) que les REGLES interdisent en heredoc ; heredocs sans barre inverse pour ce journal, la table de mutants et les deux scripts de contrôle ; un `sed -i` sans barre inverse sur la table (identifiants de la lignée gardés) et sur un brouillon de ce journal.
- **Advisor intégré** : consulté après l'orientation et avant toute écriture (place du commentaire Q-V-2, place de D-3 (a), tueur de l'exception de tête, branche impliquée de N3, tueurs des tests amendés, composition des mutants, pièges : `render` superficiel, jonctions, barres inverses, mesure du cas M-4) ; chaque point vérifié sur pièce ; seconde consultation avant la remise (réponse finale). Conseil, jamais verdict.
- **État du worktree à la remise** : HEAD `47e58ee700535e06ccc00ccb09ad7430147bcde5` ; `git status --porcelain` : ` M apps/dojo/scripts/dojo-verify.mjs`, ` M apps/dojo/test/dojo-verify.test.ts`, ` M test/dojo-verify-url.test.ts`, `?? docs/G1-lot-dojo-pr1b5a.md`.
- **Ligne datée (G1, `date -u` 07:08Z) — écart aux REGLES consigné** : la première écriture de cette section « Remise » (heredoc, 07:07Z) citait deux fois la séquence d'échappement du saut de ligne, soit deux barres inverses dans un heredoc, contraire à la règle de transport des REGLES ; octets vérifiés intacts (`od -c` : barre inverse puis `n`, aucun octet de contrôle), puis les deux citations remplacées par une périphrase au moyen de `sed -i` dont le motif désigne le caractère par `.`, sans écrire de barre inverse ; garde d'octets refaite : 0 barre inverse, 0 tabulation, 0 octet de contrôle, 0 C1, UTF-8 valide. `error_origin` : G1 (É-G1-4).

## Corrections post-G2 (correcteur `claude-opus-5-5`, effort max, contexte frais ; ouverture `date -u` 08:00:23Z)

- **Mission** : `F:/tmp/dojo/mission-corr-pr1b5a.md` (15 503 o.), sha256 `00458a00210c484f62eb5f413f148db0835c4ab6131497c2be1cf21deb909302`, recalculé AVANT
  lecture (08:00:23Z) = celui de l'orchestrateur. Reçu : ni `F:/tmp/dojo/mission-corr-pr1b5a.md.recu.json` (chemin cité) ni `mission-corr-pr1b5a.recu.json`
  (forme de `launch.mjs:24`) n'existent à 08:0xZ ; linter du tronc rejoué en lecture seule (`lint.mjs --json`, 08:07:03Z) : `vert`, 12 codes à 0
  (`F:/tmp/dojo/pr1b5a-corr/lint-mission.json` sha256 `05622e3c47a9ac8917c2628971a6e8e85a868c85dff77a1cc09e560e558c32af`) ; `launch.mjs` non lancé (il écrit le
  reçu : acte de porte) ; Q-C-1. Règles insérées : sha256 `12d5f2df…0335`, lues.
- **Entrées lues en entier, dans l'ordre** : G2 `F:/tmp/dojo/g2-pr1b5a/G2-report.md` (122 l.,
  `0568bf436063cf49a1f2c2627d3d88767520384c32bdaa9c7c22112af8e3bb90`) ; table `mutants-table-g2.mjs`
  (`f672c1597b961495cb11c21181345dfc9a220ecfa8165dca372e13eb3b3b6a99`) ; mission G1 (`05961392…2e65`) ; ce journal (158 l., `8cf59463…a60f`) ; ADR (243 l.,
  `620517fd…d65d`) ; `dojo-verify.mjs` (445 l., `e875beda…c2ca`, passe l.272-294) ; `dojo-verify.test.ts` (663 l., `3ff7cb87…79d2`). Hors liste :
  `apps/dojo/test/helpers/dojo-fixture.ts` (`aa4151bc…7d51`, l.84-156) ; sonde du G2
  `F:/tmp/dojo/g2-pr1b5a/sondes-repo/apps/dojo/test/g2-probe-calendar.test.ts` (`8a2e8c7b…ebf9`) ; en-têtes de `scripts/mutants/run.mjs`,
  `scripts/red-proof.mjs`, `scripts/oracle/run.mjs`, `scripts/oracle/lock.mjs` du tronc (sha256 de la mission ; outil de mutants `2606e7da…3b19`).
- **Compte ascendant prévu** (`date -u` 08:10:19Z, AVANT toute écriture de test ; fichier unique `apps/dojo/test/dojo-verify.test.ts`) : test 3 : la première
  assertion (1 l.) remplacée par une aide locale `miss` (2 l.) et l'assertion du refus entier (1 l.), puis C-G2-1 (commentaire et assertion, 2 l.) : +5, −1 ;
  test 5 : C-G2-2 (commentaire, ancre du jour lu 15, assertion sur deux lignes) : +4. Total ≈ +9 −1 = 10 ; R-25 prévu ≈ 109 + 10 = 119 (borne de la mission 1
  150 ; borne du lot 547). Aucune ligne de `dojo-verify.mjs`, aucun import neuf, aucune aide au niveau du module (la ligne au-dessus de chaque `test(` reste son
  `// killer:`) ; les tueurs des tests 3 et 5 inchangés.
- **Attendus écrits à la main** (jamais calculés par le vérificateur ni par l'éditeur, FM-3.3) sur la fixture `dojoFixture`
  (`apps/dojo/test/helpers/dojo-fixture.ts:146-154`) : ancre seq 1, historique seq 2, jours lus 1 à 7 = seq 3 à 9, version 1 = seq 10 (fenêtre des jours lus 1 à
  7, effet au jour lu 8), jours lus 8 et 9 = seq 11 et 12 ; `fourteen` ajoute les jours lus 10 à 14 = seq 13 à 17 sous la version 1 ; W = 7 (`anchorBody`, l.89)
  ; chaque jour lu est valide (lectures 1 et 2 à π et σ non nuls, `readsOf` l.135).
  - **C-G2-3** : `none` (sans version 1) : jours lus 1 à 7 valides, dû au jour lu 7 (seq 9 ; première version, N2 sans objet) ; le `snapshot` suivant, jour lu 8
    = seq 10, refuse (D-2 (1)) et porte son propre jour (`dayOf`, `dojo-verify.mjs:152`) : refus entier `{ ok: false, reason: "version_not_in_force", seq: 10,
    day: dateOf(ANCHOR_DAY + 8), detail: "a price_version due is missing (N3)" }` (les cinq clés d'un refus, `dojo-verify.d.mts:38`).
  - **C-G2-1** : après la version 1 (fenêtre au jour lu 1), N2 exige d − 6 ≥ jour lu 1 + 7 = jour lu 8, donc d ≥ jour lu 14 ; jours lus 8 à 14 valides (seq 11 à
    17) : dû au jour lu 14 (seq 17) ; sans version 2, le `snapshot` du jour lu 15 (seq 18, nommant la version 1, seule en vigueur : `snapshotCheck`,
    `dojo-chain.mjs:97-98`) refuse : même refus, seq 18, `day` = jour lu 15.
  - **C-G2-2** : même dû (jour lu 14, seq 17) ; une ancre datée du jour lu 15 (`published_at` au jour 15 à 12 h, après le dernier jour publié 14 : admise par
    `dojo-verify.mjs:238`) à seq 18 : `version_not_in_force @18 a segment closed with a price_version due (N3, fail-closed)` (D-2 (3)). Le `day` d'une ancre est
    nul (`dayOf` : une ancre n'a pas de champ `day`) : non asserté ; la forme `told` du test 5 est gardée.
  - Recoupement indépendant : ces trois attendus égalent ceux que le G2 a écrits de son côté pour ses sondes (i-a) et (iii) (`g2-probe-calendar.test.ts`,
    `8a2e8c7b…ebf9` ; `sonde-calendar-2.log`, vert au gel).
- **Tests écrits** (08:11:32Z ; `F:/tmp/dojo/pr1b5a-corr/edit-tests.mjs`, remplacements exacts, chaque ancre trouvée une seule fois) : test 3, l.410-414 (aide
  locale `miss` l.410-411, refus entier l.412, C-G2-1 l.413-414) ; test 5, l.438-441 (C-G2-2). Diff contre le gel 1 : deux hunks (`@@ -410 +410,5 @@`, `@@
  -433,0 +438,4 @@`), 9 insertions, 1 suppression ; contre la base, ils restent dans le bloc inséré par 5a (`@@ -371,0 +378,66 @@`) : aucune place de hunk de
  C-V-3 touchée. `apps/dojo/test/dojo-verify.test.ts` 663 → 671 l., sha256 `70c78e6a2521689c1c9cf80afab608f3bb839a4c0f4ddb2ff16e276046eba93c` ; ligne créée la
  plus longue : 156 caractères ; 0 TAB, 0 CR, barres inverses 31 (inchangé) ; aucun import neuf, aucune aide au niveau du module ; `// killer:` des tests 3 et 5
  inchangés (`:284`, `:281`) ; `dojo-verify.mjs` inchangé (`e875beda…c2ca`).
- **Courses** (clone `F:/tmp/dojo/pr1b5a-corr/gel` : `git clone --no-local --no-checkout` du worktree, `checkout --detach 6e061dcc`, arbre `df276f28…6308`, les
  deux fichiers modifiés copiés, sha256 égaux ; `node_modules` par `mk-nm.ps1` : 220 entrées, 10 `@monark`, 0 échec ; verrou relu libre avant chaque lancement ;
  TEMP `F:/tmp/dojo/pr1b5a-corr/tmp`) : fichiers du lot **31 / 31 verts** (08:12:32Z-08:12:56Z ; `run-lot.log`
  `8494942b1088d06035478207faa2c06c05e5418c2227b5115232fec6b97b5cfb`) ; les neuf consommateurs du G2 §3 **84 / 84 verts** (08:13:05Z-08:13:17Z ;
  `run-consumers.log` `a0afc2e56c48c6f328b2ae345e6c11997510c58bfa1449ef6eb6f1783c79be18`) ; rejeux par nom verts : les cinq de D-5, les 14 `dojo_publish_*`, le
  test 8 ; portes statiques (08:13:38Z-08:14:34Z, `static-*.log`) : `eslint` des deux fichiers du lot 0, `lang:gate` OK, `gate:vocab` OK (326 fichiers),
  `lint-model-pinning` OK, `export:check` OK, `tsc --noEmit` 0, `lint:ratchet` 69/69 (inchangé).
- **R-25, mesure précoce** (08:18:55Z, lecture seule) : pathspecs extraits de `ci.yml` par `R25_DIFF_RE` de `F:/Monark/scripts/oracle/r25.mjs`, base contre
  arbre de travail (`r25-early.mjs` `d86f784b…7839`, `r25-early.log` `e308dae3…312c`) : `STAT` **108 insertions, 9 suppressions : 117** ; `CONTENT_STAT` 0 ;
  borne de la mission 1 150 ; borne du lot 547 : solde 430. Écart au prévu (119) : la ligne remplacée du test 3 était une insertion du lot (absente de la base)
  : la retirer ôte une insertion au lieu d'ajouter une suppression (109 + 9 − 1 = 117). `r25()` lui-même lit `base...HEAD` d'un commit : lu dans
  l'enregistrement de l'oracle (voir « Oracle ») ; aucun commit de ma part, dans aucun clone.
- **F2P** (08:15:08Z-08:16:07Z ; `F:/tmp/dojo/pr1b5a-corr/f2p-repo` = clone `--no-local` à `47e58ee7`, `node_modules` = une jonction vers
  `F:/Monark/node_modules`) : `node F:/Monark/scripts/red-proof.mjs --base 47e58ee7 --gel F:/Monark-wt-dojo-pr1b5 --repo F:/tmp/dojo/pr1b5a-corr/f2p-repo --out
  F:/tmp/dojo/pr1b5a-corr/f2p --draw 3 --seed 2026`. **`F:/tmp/dojo/pr1b5a-corr/f2p/RED-PROOF.json` sha256
  `6c4eb033d702d174d2f68f8631e20fe636ca94955e8f767626693e318b8537e7`** (`f2p.log` `12049e7e…e572`) ; digest des changements
  `7f546da3b7b8f3308b356bf6cb42cac3109350085f040bfd1c3ef106f23ad9e2` (G1 et G2 : `0aa2f77b…623d` ; change par le fichier de tests seul) ; 9 jugés, 22 inchangés.
  **F2P** : tests 1, 2, 3 (l.407), 5 (l.431) : `base` `assert-fail`, `gel` `pass`, tueurs valides (`killerProblem` nul). Épingles « green at base » : tests 4,
  6a, 6b, 7, 8 (les cinq déclarées). Tirage (graine 2026, population 4, 3 tirés) : `:291`, `:290`, `:281` : 3 / 3 tués par assertion, `sha256_before` =
  `sha256_after` = `e875beda…c2ca`. Sortie 1 par construction (Q-G1-6). Le tueur du test 3 (`:284`), non tiré, est rejoué par la campagne de mutants
  (`--killers`).
- **Mutants** (garde : `held(F:/tmp)` nul à 08:18:13Z et relu dans la commande de lancement ; 16 364 Mo physiques, 35 186 Mo virtuels, 8 `node.exe`) : un seul
  lancement, 08:18:21Z : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/pr1b5a-corr/gel --base 47e58ee7 --out F:/tmp/dojo/pr1b5a-corr/mutants
  --table F:/tmp/dojo/pr1b5a-corr/mutants-table-corr.mjs --killers --file apps/dojo/scripts/dojo-verify.mjs --targets
  apps/dojo/test/dojo-verify.test.ts,test/dojo-verify-url.test.ts --lock-root F:/tmp --min-free-mb 4096` ; `<out>/node_modules` = une jonction vers
  `gel/node_modules`.
  - Table `F:/tmp/dojo/pr1b5a-corr/mutants-table-corr.mjs` (sha256 `caa60339a8bdab015c7542866937bb176952d1fb497ba63ce2cc1ae8dd37ce10`) : la table du G2 ENTIÈRE
    (69 rangs ; ses octets contrôlés à l'import, `f672c159…6a99`), mêmes id, ligne, op, avant, après et test ; seul `why` reçoit la prédiction du correcteur,
    écrite AVANT la course : M-G2-2 à M-G2-4 « expect tue » par C-G2-1 à C-G2-3 ; M-G2-5 et M-G2-7 « EQUIVALENT, declared » (Q-G2-2) ; V-4 « survivor inherited
    » ; les 63 autres « expect tue, as at the G2 campaign ». Contrôle statique avant la course (`check-table.mjs` `4c2cbc09…96c8`, `check-table.log`
    `88ffe879…7a2a`) : 69 rangs, identifiants uniques, chacun ancré exactement une fois sur le module du clone (445 l.), 69 tests nommés déclarés.
  - **`F:/tmp/dojo/pr1b5a-corr/mutants/RESULTS.json` sha256 `e714e1be13afcb846ded2a33e2215c9e488f0ba28e98aa84c4df79f6bac77508`** (`RESULTS.txt` `7e254ddf…6fa7`,
    `mutants.log` `07b05dea…c4c2` ; 08:19:02Z-08:23:52Z ; outil `2606e7da…3b19`, arbre de l'outil `257d9b05`, propre ; gel `6e061dcc` et dirty `77969f4a…` ;
    `sha0` du module `e875beda…c2ca`) : référence 10 fichiers, 100 verts ; **84 mutants, 81 tués, tous `strict` (`ERR_ASSERTION` seul), 3 survivants, tous
    prédits : V-4, M-G2-5, M-G2-7** ; 0 non conclu, 0 ancre perdue ; fichier restauré 84 / 84 ; sortie 1 par construction.
  - **M-G2-2** (l.284) tué par le test 3, assertion « M-G2-2: a version skipped in the weekly regime » (C-G2-1 ; `tap/M-G2-2.tap` `0ab54209…`). **M-G2-3**
    (l.281) tué par le test 5, assertion C-G2-2 (réel `ok`, attendu le refus à seq 18 ; `tap/M-G2-3.tap` `224eebfa…`). **M-G2-4** (l.279) tué par le test 3,
    refus entier de C-G2-3 : réel `day: null`, attendu `day: '2026-10-09'` (jour lu 8 ; ANCHOR_DAY = 2026-10-01 ; `tap/M-G2-4.tap` `3c74ea25…`).
  - **M-G2-5 et M-G2-7 survivent, déclarés équivalents** (Q-G2-2) : rejeu sur les 10 fichiers cibles, 100 / 100 verts chacun. **V-4 survit**, hérité (déclaré au
    G7 de PR-1b-4 ; Q-G2-5, hors de ce lot) : rejeu 100 / 100. Tués au total : 66 rangs de table (31 du G1, 28 de la lignée, M-G2-1 à M-G2-4, M-G2-6, M-G2-8,
    M-G2-9) et les 15 tueurs K1 à K15, dont K5 (`:284`, test 3) et K7 (`:281`, test 5), inchangés.
  - **Chevauchement du verrou d'hôte** (MUTANTS-LOCK-MIDRUN-1, ouvert) : libre au lancement ; pris à 08:20:03Z par l'oracle `corr` de PR-4c-1a (pid 89616,
    `--tree F:/Monark-wt-dojo-pr4c1`, lancé 08:18:35Z ; sa suite `npm test` dès 08:20:04Z), pendant ma campagne (fin 08:23:52Z) ; l'outil de mutants ne prend
    pas le verrou ; aucun lancement de ma part pendant la tenue, rien interrompu ; preuve `F:/tmp/dojo/pr1b5a-corr/lock-overlap.txt` sha256
    `ec0f26257460248ade5de7f695acd8dfa9716fc63b86acdd9baa3519a5a9c37b` (relu à 08:22:52Z). Sur ma campagne : aucun non conclu, rangs de 0,4 à 6,1 s ; Q-C-4.

| Correction | Test (lignes du fichier corrigé) | Mutant tué (`RESULTS.json`) | Ligne du module |
|---|---|---|---|
| C-G2-1 | test 3, l.413-414 | M-G2-2 ; K5 inchangé | `dojo-verify.mjs:284` |
| C-G2-2 | test 5, l.438-441 | M-G2-3 ; K7 inchangé | `dojo-verify.mjs:281` |
| C-G2-3 | test 3, l.410-412 | M-G2-4 | `dojo-verify.mjs:279` |
| Q-G2-2 | table de rejeu | M-G2-5, M-G2-7 : équivalents déclarés, survivants | `:291`, `:282` |
- **Q-G2-2, phrases du G2 recopiées** (rapport G2 §8, l.69 et l.70, sha256 `0568bf43…bb90`) : ci-dessous en citation, coupées à 160 caractères aux espaces ;
  rejointes (préfixe `> ` retiré, un espace à chaque saut), elles égalent à l'octet les deux lignes du rapport. Vérifiées sur pièce par le correcteur :
  `dojo-chain.mjs:79-80` et `:94` (`04411fa7…7123`), `dojo-verify.mjs:238`, et N1 (l.290) lu avant N3 (l.291).
> - **Équivalence de M-G2-5 (Q-G1-4)** : N1 est lu d'abord ; `versionCheck` (`dojo-chain.mjs:79-80`) exige le dernier `snapshot` au moins à f + W − 1 et l'effet
> après lui ; sous N1 (effet f + W), le dernier `snapshot` avant la version est donc le jour f + W − 1. Tout `snapshot` (l.284) ou ancre (l.281) postérieur à la
> mise en place de `due` est refusé : `due`, s'il n'est pas nul à la version, vaut ce jour, et f = `due` − W + 1. La seconde branche de N3 ne décide jamais.
> - **Équivalence de M-G2-7 (PC-4, « une ancre neuve recommence le compte »)** : le jour d'un `snapshot` dépasse le jour de l'ancre en vigueur (`snapshotCheck`,
> `dojo-chain.mjs:94`) et une ancre neuve dépasse le dernier jour publié (`dojo-verify.mjs:238`) : le jour d'une ancre ne porte jamais de `snapshot`, n'est
> jamais valide, et aucune fenêtre de W jours valides ne le contient ; N2 est alors satisfaite d'office après une ancre. Vider `valid` à l'ancre ne change rien.
- **Oracle** : lancé APRÈS la clôture de ce journal, pour que l'objet d'arbre de l'enregistrement soit celui de l'arbre livré (leçon de Q-G2-4) : `node
  F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-dojo-pr1b5 --base 47e58ee7 --key PR-1b-5a`. L'enregistrement (chemin, sha256, portes, tests,
  R-25 par `r25()`) est cité dans `F:/tmp/dojo/pr1b5a-corr-deliver/REPONSE.md`, hors de l'arbre ; ce journal n'est plus modifié après le lancement de l'oracle.
- **MAST** : FM-3.3 (vérification incorrecte) : attendus écrits à la main depuis la fixture et D-2, recoupés par les sondes indépendantes du G2 ; la mise en
  œuvre indépendante reste DOJO-VERIFY-INDEPENDENT-1. FM-1.1 (spécification non suivie) : C-G2-1 à C-G2-3 appliqués à la lettre, tests seuls, aucune ligne du
  module. FM-3.2 (vérification absente) : lot 31, consommateurs 84, rejeux par nom, suite entière par l'oracle.
- **`error_origin` proposés (assignés au G7)** :
  - É-C-1 : cas de croisière absents des tests 3 et 5 (première version seulement) : repris du G2 : planificateur du G0 (§4 items 3 et 5) et G1.
  - É-C-2 : reçu de mission absent (Q-C-1) : orchestrateur.
  - É-C-3 : première écriture de cette section (08:10Z) par un heredoc non cité dont les backticks étaient échappés par une barre inverse, contraire à la règle
    de transport des REGLES ; octets vérifiés (0 barre inverse, 0 octet de contrôle, 0 C1, UTF-8 valide) ; ensuite heredocs cités seulement : correcteur.
  - É-C-4 : empreinte abrégée fausse de la sonde du G2 (`…dbf9` pour `…ebf9`) à cette première écriture, corrigée par `sed` à 08:10Z, avant toute consommation :
    correcteur.
  - É-C-5 : R-25 prévu 119 contre 117 mesurées (compte ascendant fait contre le gel 1, non contre la base) : correcteur.
  - É-C-6 : fichier de travail `edit-tests.mjs` (hors dépôt) : sa l.14 fait 166 caractères (la ligne de test de 156 caractères préfixée par la concaténation
    JS), exécuté tel quel et gardé ; une commande Bash d'environ 6,05 Ko (brouillon de ce journal), au-dessus de 6 000 octets et sous le seuil de lexage mesuré
    (7,6 Ko), exécutée sans défaut : correcteur.
- **Questions Q-C-n** (à l'orchestrateur ; fermées, recommandation jointe ; aucune ne bloque la livraison) :
  - **Q-C-1 (reçu absent)** : aucun reçu pour cette mission (ni le chemin cité `.md.recu.json`, ni la forme `.recu.json` de `launch.mjs:24`) ; le linter rejoué
    en lecture seule est vert (12 codes à 0). Recommandation : passer la mission par `launch.mjs` (porte) et citer le chemin qu'il écrit.
  - **Q-C-2 (en-tête de la mission)** : « Borne R-25 : 1150 » alors que la borne de coupe du lot est 547 (C-V-4), et « Base tronc `6e061dcc` » alors que la base
    des commandes est `47e58ee7` (`6e061dcc` est le gel 1) ; mesure 117 sous les deux bornes. Recommandation : que le générateur lise la borne du lot dans l'ADR
    et nomme `6e061dcc` « HEAD du lot (gel 1) ».
  - **Q-C-3 (rejeu du delta, décision 295)** : ce tour ne touche que des tests (aucune ligne exécutable du module) et ce journal ; le lot n'a pas de
    checkpoint-2. Recommandation (reprise du G2) : le G7 rejoue le delta gel 1 → gel 2 à la lettre (deux hunks du fichier de tests, `red-proof.mjs` sur l'arbre
    corrigé, M-G2-2 à M-G2-4 tués, M-G2-5 et M-G2-7 déclarés équivalents, R-25 remesuré), sinon une re-revue G2 ciblée est due.
  - **Q-C-4 (verrou pris pendant ma campagne)** : voir « Chevauchement du verrou d'hôte ». Recommandation : que le correcteur de PR-4c-1a lise sa suite (dès
    08:20:04Z) avec ce chevauchement (08:20:03Z-08:23:52Z) ; la parade outillée reste MUTANTS-LOCK-MIDRUN-1.
- **Conduite** : aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `git merge-tree --write-tree` ; aucun git écrivant dans le worktree ni dans `F:/Monark` (lecture
  seule : `rev-parse`, `status`, `diff`, `log`, `worktree list`, avec `--no-optional-locks`) ; git écrivant seulement dans mes clones sous
  `F:/tmp/dojo/pr1b5a-corr/` (`clone`, `checkout`), aucun commit ; les outils du tronc font leurs propres clones. Aucun réseau réel ; rien sur C: (TEMP
  `F:/tmp/dojo/pr1b5a-corr/tmp`) ; aucun test ni harnais lancé verrou tenu par un autre (relu avant chaque lancement) ; un seul lancement de l'outil de mutants
  ; aucun oracle interrompu ; `F:/Monark-wt-dojo-pr4c1` et `F:/Monark-wt-dojo-pr3b2` jamais touchés. Écritures dans le worktree : le fichier de tests
  (`edit-tests.mjs`) et ce journal (heredocs, `sed`, puis `wrap-journal.mjs`, qui coupe cette section à 160 caractères et vérifie que les 158 lignes du G1
  restent identiques à l'octet, `8cf59463…a60f`).
- **Advisor intégré** : consulté après l'orientation et avant toute écriture (ordre journal, tests, clone, F2P, mutants, oracle ; forme des trois cas ; R-25 ;
  clôture du journal avant l'oracle) ; conseil, jamais verdict ; chaque point vérifié sur pièce. Seconde consultation avant la réponse finale. Retrait des
  jonctions, état final du worktree et oracle : `REPONSE.md`.
- **Ligne datée (correcteur, `date -u` 08:45:44Z) — É-C-7, erratum** : les numéros de ligne du test 3 étaient décalés d'une ligne (les cinq lignes neuves sont
  aux l.410-414 : `miss` l.410-411, refus entier l.412, C-G2-1 l.413-414 ; hunk `@@ -410 +410,5 @@`) et la fixture occupe l.146-154 (non 155) ; corrigés en
  place, à longueur égale (`F:/tmp/dojo/pr1b5a-corr/fix-lines.mjs`), attrapés à la seconde consultation de l'advisor, vérifiés par `awk` sur le fichier. Le
  journal ayant changé après le premier oracle (`ec572918…df3b`, arbre `ed0e934d…fce6`), cet enregistrement est remplacé : l'oracle est rejoué sur l'arbre
  corrigé, ce journal étant de nouveau clos avant lui ; le nouvel enregistrement est cité dans `REPONSE.md`. `error_origin` : correcteur.
