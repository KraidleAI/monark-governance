claude-opus-5-5

# G1 — lot Dōjō PR-1b-4 (piste A, vérificateur) : `dojo-verify.mjs --url`, `--day`, contrat de sortie lu par la CA

- **Modèle résolu** : `claude-opus-5-5` (R-1), worker implémenteur G1, effort max (mission), instance fraîche.
- **Mission** : `F:/tmp/dojo/mission-g1-pr1b4.md` (55 l., 14 918 o.), sha256 recalculé AVANT lecture :
  `1f8d585f6dbe1e30293d63cde51a860c1ba47b185b332e2d14541a5071ecf57e`, égal au reçu `F:/tmp/dojo/mission-g1-pr1b4.recu.json`
  (verdict vert, 12 codes à 0, daté 2026-09-29T23:18:10Z, `base` `7d9e413e`, `head` `cf4a4704`) ; règles embarquées lues en entier.
- **Base** : worktree `F:/Monark-wt-dojo-pr1b4`, branche `lot/dojo-pr1b4`, HEAD `cf4a47046087c836c9fad0fa6698c550ea0e2a37`
  (= base `7d9e413e` + G0 `46305650` + ligne datée `ba132aa6` + pli cp-1 `cf4a4704`, docs seuls) ; `git status --porcelain` vide à l'ouverture.
- **Conduite git** : lecture seule dans le worktree ; clones `--no-local` sous `F:/tmp/dojo/pr1b4/` ; **aucun `GIT_DIR`, aucun
  `GIT_WORK_TREE`, aucun `--write-tree`**, aucun commit, aucun réseau réel (boucle locale seule), rien sur C:.

## 0. Horaires (`date -u`)

| Heure | Acte |
|---|---|
| avant 23:21:49Z | sha256 de la mission recalculé (première commande), égal au reçu ; mission lue en entier |
| 23:21:49Z | verrou d'hôte absent (`F:/tmp/oracle-lock`) ; entrées lues dans l'ordre de la mission |
| 23:32:04Z | C-V-4 : 29 `node.exe`, 17 309 Mo physiques et 35 497 Mo virtuels libres (`Get-CimInstance Win32_OperatingSystem`) |
| 23:33Z | advisor intégré consulté (après l'orientation, avant toute écriture) |
| 23:34:51Z | sonde de conception (section 3) ; écart : verrou tenu depuis 23:30:45Z par un G7 (pid 148284 vivant), lu APRÈS coup |
| 23:36:23Z | ouverture de ce journal : compte ascendant (section 2), AVANT toute ligne de code |
| 23:37Z-23:51Z | code, surface de types, tests (verrou tenu par un G7 d'un autre lot : aucune exécution) |
| 23:52:19Z | verrou libre : course ciblée n° 1 dans le worktree, 26 / 26 (section 9) |
| 23:54:05Z | contrôle des 38 ancres (killers et table) ; verrou repris par un cp-2 (pid 130316) : attente |
| 00:01:07Z-00:02:11Z | verrou libre : `tsc`, ESLint, cliquet au clone gel ; 00:02:4xZ sonde de types sous verrou (écart, section 6) |
| 00:09:19Z | verrou libre : cliquet, ESLint, course n° 2 au gel (26 / 26) ; F2P 00:10:06Z-00:10:50Z (section 10) |
| 00:11:05Z | sonde 2 (`redirect: "manual"`) ; campagne de mutants 00:11:27Z-00:12:47Z, 38 / 38 (section 11) |
| 00:13:14Z-00:21:05Z | oracle G1 : exit 0, 1 718 tests, 0 rouge, R-25 388 (section 12) |
| 00:22:22Z | jonctions `node_modules` retirées ; première remise durable (00:25:02Z) |
| 00:25Z | advisor (2) ; ajout au test 8 (arbre sans `snapshot`), puis verrou tenu par un G7 du tronc (pid 128516) : attente |
| 00:30:05Z-00:33:08Z | verrou libre : contrôles et course n° 3 au gel, F2P `f2p2`, campagne `mutants2` (sections 9 à 11) |
| 00:33:18Z-00:42:11Z | oracle G1 rejoué : exit 0, 1 718 tests, 0 rouge, R-25 391 (section 12) |
| 00:42:57Z | jonctions `node_modules` retirées de nouveau ; remise finale (section 18) |

## 1. Entrées lues (sha256 recalculés à 23:35Z ; worktree au `cf4a4704` sauf mention)

| Entrée | l. | sha256 |
|---|---|---|
| `docs/adr/ADR-DOJO-PR-1B-4.md` (en entier, pli cp-1 compris) | 236 | `cee9c3132f3a9265ef60a5eeea75e876b1db6b8f31b55cfd10c0bee3bc84fe12` |
| `docs/G0-lot-dojo-pr1b4.md` (en entier) | 62 | `c8145acf586fce363bea4a47b1bbb0dcbbc95bd086d0893a2e9f7635e9a19e85` |
| `F:/tmp/dojo/cp1-pr1b4/CP1-report.md` (en entier) | 78 | `93bc024df32ce9de55ccda07cbb1c4ff2619f11036d88810c45ceec9a5e363aa` |
| `F:/Monark/docs/dojo/FAITS-node-fetch-tls-2026-09-30.md` (en entier) | 23 | `7de80c82b8c5c30a2b1bfb5461a8c784607a80ca786aa543603ed7533c9ab83e` |
| `apps/dojo/scripts/dojo-verify.mjs` (en entier) | 355 | `d768df168b1784bc53e76989c0a767bfb7e737f7fd7c6075565bb7fc98b349cb` |
| `apps/dojo/scripts/dojo-verify.d.mts` (en entier) | 30 | `98d9f1bc70bda5af477510a18e74a090eff45bdc9bafe3e6bf6f022836f153f6` |
| `apps/dojo/test/dojo-verify.test.ts` (en entier, 19 tests) | 430 | `e20b814f29a4cb8b34ea462bfdd1a12d64d7fa58f85241083bd00711225c9364` |
| `F:/Monark/apps/bell/scripts/bell-verify.mjs` (en entier ; l.30-68 de près) | 137 | `14a7e07c116ef3be70a8168f6113f46a214e04ccaa40bcba85b179f755324e8b` |
| `F:/Monark/scripts/verify-bell.mjs` (en entier) | 244 | `ab0a386e52fe3f88a4d5524ddb264efca89aff8901b9e92add87e85aec42c70f` |
| `F:/Monark/scripts/red-proof.mjs` (en entier ; l.100-102, l.167, l.172-174) | 268 | `6579b55080ac00817d763a0c820d24a460949b696d100ffd2e3bb43505aeab36` |
| `F:/Monark/docs/adr/ADR-DOJO-PR-3.md` (D-2 l.77-86, DOJO-CA-FORMAT-1 l.84) | 286 | `2f6fb97a87cdca1d13f4b99f2aaa04ddadb345b8da5ebfef0d1b6558e7bef30d` |
| `F:/Monark/scripts/oracle/run.mjs`, `r25.mjs`, `lock.mjs` (en entier) | 173, 28, 47 | `8ab26615…5a90`, `4d0544df…cf0`, `501a76b5…3bb` |
| `F:/Monark/scripts/mutants/run.mjs` (en entier) | 238 | `2606e7dae37f4d13764f3a7c5eca3a947885c871d9dc680632a912ad7e083b19` |
| lectures ciblées (liste ci-dessous) | — | — |

- Lectures ciblées : `apps/dojo/scripts/dojo-chain.mjs` `04411fa7…a7123` (l.120-168) ; `apps/dojo/test/helpers/dojo-fixture.ts`
  `aa4151bc…d7d51` (exports, l.56-100, l.145-165, l.266-324) ; `F:/Monark/apps/bell/test/bell-verify.test.ts` `48bd7bf2…72ff`
  (l.1-30, l.60-112) ; `apps/site/lib/dojo-served-load.ts` `a83faaed…5a88` (l.225-240) ;
  `F:/Monark-wt-dojo-pr4a2/scripts/sync-dojo-served.mjs` `8409dbe1…0271` (imports, l.150-165) ; `.github/workflows/ci.yml`
  `0f401ae2…c949a` ; `eslint.config.mjs` `c1c9ac9d…a74b` ; `lint-ratchet.json` `c2d5cab0…9769` (plafond 69) ;
  `tsconfig.json` `e9f78b86…f72f` ; `test/ci-gates.test.ts` (l.925-960, l.1040-1075).

- **Tronc en mouvement pendant la session** : `F:/Monark` est passé à `1e99f27b` (fusion de PR-4a-2 `52e07d56`, pli G7 `d24f925e`,
  erratum de date `39104572`) ; l'ADR PR-3 lu à 23:1xZ (`d07108e5…`, D-2 et DOJO-CA-FORMAT-1) est à `2f6fb97a…` à 23:35Z, la ligne
  l.84 (DOJO-CA-FORMAT-1) inchangée ; `docs/methode/REGLES-MISSION.md` du tronc gagne une ligne datée 23:3x réservée aux missions de
  corrections (rejeu de `red-proof.mjs`) : sans effet sur ce G1, dont les règles sont celles embarquées par la mission (`e5443e55…`).
- **PR-4a-2 fusionnée** : `scripts/sync-dojo-served.mjs` et `test/dojo-served.test.ts` (tronc) importent `VERIFY_BOUNDS` et
  `verifyDojoServed` ; `test/dojo-served.test.ts:212` type `Parameters<typeof verifyDojoServed>[0]` ; le site passe une source `{get}` seule
  (`dojo-served-load.ts:232-233`) : ce G1 n'ajoute aucun membre requis à `Source` et garde la signature additive (section 4).

## 2. Compte ascendant prévu, par fichier (23:36Z, AVANT toute ligne de code ; métrique R-25 : insertions + suppressions)

| Fichier | Contenu prévu | Ajoutées | Modifiées (× 2) | Prévu |
|---|---|---|---|---|
| `apps/dojo/scripts/dojo-verify.mjs` | en-tête 2, bornes 5, clés 4, `urlSource` 28, `verify()` 20, bibliothèque 3, CLI 10 | 50 | 22 | 94 |
| `apps/dojo/scripts/dojo-verify.d.mts` | bornes, `urlAllowed`, `urlSource`, clés, `Target`, rapport, option `day` | 9 | 5 | 19 |
| `apps/dojo/test/dojo-verify.test.ts` | imports 3, serveur 9, tests 1 à 6 94, test 7 amendé 11, `// killer:` et titres 12 | 120 | 8 | 136 |
| `test/dojo-verify-url.test.ts` (neuf) | en-tête 4 ; imports 8 ; serveur et CLI asynchrone 14 ; test 8 41 | 67 | 0 | 67 |
| **Total** | | **246** | **35** | **≈ 316** |

- Prévu ≈ 316 ≤ 547 : **aucune coupe** ; le G1 continue sur le lot entier (coupe de repli 4a/4b de l'ADR §5 non prise).
- Écart à l'ADR (236) : +80, dû au pli cp-1 : forme C-V-1 (contrôles d'existence, huit lignes `// killer:`), T-9 amendé (refus et
  déclaration d'environnement), annulation du corps et son test (F-6), bornes figées par test (Q-2), garde T-10 sur `process.env`,
  `urlAllowed` exporté (section 4), serveur de boucle locale recopié dans le fichier neuf (aucun fichier d'aide hors mission).
- Lecture de la borne : 547 borne le compte ascendant et décide la coupe (jamais une mesure, ADR §5) ; la mesure de l'oracle est
  rapportée contre le STOP 1 150 et la borne CI 1 205 (`VIBEGATES_PR_LIMIT`), et contre 547 comme solde (C-V-6).

## 3. Sondes de conception (23:34:51Z ; `F:/tmp/dojo/pr1b4/probe/probe1.mjs`, sortie `probe1.out` ; aucune écriture dans le worktree)

- Une ligne de chronologie re-sérialisée hors forme canonique (espace après sa première accolade) est ACCEPTÉE à la base
  (`reformatted_ok: true`, 12 lignes) : `lineHash` et `verifyLine` passent par `canonical` (`bell-chain.mjs:51`, l.76). M-C2
  (`timeline_sha256` sur des octets re-sérialisés) est donc tuable par un corps servi non canonique.
- `dayOk` (`dojo-verify.mjs:95-96`) : `2026-02-30` a une époque finie sur ce V8 et est refusé par la clause d'aller-retour ;
  `2026-9-1` et `2026-10-02T00:00Z` sont refusés par la forme ; `2026-10-02` est admis.
- **Écart** : la sonde a tourné pendant un verrou d'hôte tenu (G7 d'un autre lot, pid 148284, pris à 23:30:45Z), relevé dans la
  même commande et lu après coup ; sonde d'environ une seconde, ni test, ni harnais, ni contrôle statique ; aucune autre exécution
  avant la libération du verrou (relu avant chaque lancement).
- **Fait d'environnement mesuré** : `NODE_USE_SYSTEM_CA=1` est posé dans l'environnement de ce processus (ni au niveau Utilisateur
  ni Machine : hérité du harnais), donc hérité par l'oracle ; tout test comparant un rapport `--url` à un rapport d'arbre local
  doit être indépendant de l'environnement (décision en section 4).

## 4. Décisions du G1 (dans l'ADR et le pli cp-1, qui font foi ; chaque écart nommé)

- **D-1, transport** : `urlAllowed` recopie le motif de `bell-verify.mjs:32` mot pour mot, plus T-2 (aucun `?` ni `#` dans toute la
  base) ; il est EXPORTÉ (ajout, comme Bell) pour éprouver les listes de Bell en prédicat pur, sans aucune socket : un mutant de la
  politique meurt avant toute requête, et aucun test ne vise un hôte hors boucle locale (Q-G1-2). `urlSource(base, bounds)` refuse
  à chaque `get`, AVANT sa requête, et non à la construction comme Bell (`bell-verify.mjs:49`) : ainsi `verifyDojoServed` rend le
  refus et la CLI écrit sa ligne (D-3) ; divergence déclarée (Q-G1-3). T-3 à T-8, T-10 : `dojo-verify.mjs:67-103`. Le seul
  `fetch(` du module est l.85 ; T-10 garde aussi `process.env` (une seule lecture, l.73, dans `urlSource`).
- **Bornes (Q-2, Q-V-1)** : `TIMEOUT_MS` 30 000, `MAX_FILES` 1 024, `MAX_TOTAL_BYTES` 2 Gio, motifs en commentaire (l.40-45) ; les
  totaux sont comptés dans `urlSource` seule (l.81, l.92). Q-V-1 remplace la seconde clause de T-11 et le « par les deux sources »
  du test 3 : le test 3 fige qu'une source d'arbre local sous `MAX_FILES` 1 reste acceptée.
- **T-9 amendé (FAITS F-1 à F-6)** : refus `insecure_url`, `detail` `NODE_TLS_REJECT_UNAUTHORIZED`, quand cette variable vaut
  exactement `0` (la valeur que F-1 nomme), à chaque `get` (l.78) ; déclaration de `NODE_EXTRA_CA_CERTS`, `NODE_USE_SYSTEM_CA`,
  `NODE_USE_ENV_PROXY` par leurs NOMS : `urlSource(...).note`, que la CLI seule recopie dans le `detail` d'un succès (l.414), sans
  clé nouvelle (pli : « sans clé nouvelle si le detail suffit ») ; le rapport de la bibliothèque garde `detail: null`, donc tout
  test en processus reste indépendant de l'environnement de l'hôte (section 3). Corps annulé sur tout refus (F-6, l.97 ; la sortie
  de la boucle de lecture l'annule aussi) ; F-7 (`Content-Encoding`) reste non établi : T-6 compte les octets rendus par le flux.
- **D-2** : la cible est capturée dans la boucle des lignes (l.345) ; les refus viennent après la vérification entière (l.350-354),
  au `seq` et au `day` de la tête ; `--address` sous `--day` prouve dans le fichier de D contre la racine de D (l.357-364) ; son
  refus y porte le `detail` neuf `--address: no line in the --day snapshot`, au `seq` et au `day` de D (sans `--day` : inchangé).
- **D-3** : 18 clés (`DOJO_VERIFY_REPORT_KEYS`, l.36-38) ; `breaks` (l.367) ; `target`, `timeline_sha256` sur les octets vérifiés
  (l.370). `.d.mts` additif : `Source` sans membre requis neuf (le site et `test/dojo-served.test.ts:212` du tronc restent
  assignables), `urlSource` rend `Source & { note }`, le `detail` d'un succès devient `string | null` (documenté) ; aucun
  consommateur du tronc ne discrimine un succès sur `detail` nul (`git grep` de `detail === null`, `!== null`, `== null`, `!= null`
  sur `apps`, `test`, `scripts`, `packages` au tronc `5845ba77`, 00:25Z : 0 occurrence).
- **Tests** : forme C-V-1 (import d'espace de noms `dv`, première assertion d'existence, ligne `// killer:` au-dessus de chacun des
  huit) ; aucun corps de test existant touché hors du test 7 ; serveurs de boucle locale recopiés dans les deux fichiers (le fixture
  n'est pas une sortie de cette mission) ; délais abaissés sur les corps jamais terminés (2 s), garde de course de 5 s.

## 5. Emplois des codes de D-10 par ce lot (pour PLI-MERE-PR1B4-1, pli cp-1 C-V-4 ; aucun code nouveau)

| Code | Emploi | `detail` | `dojo-verify.mjs` |
|---|---|---|---|
| `insecure_url` | base hors T-1 (https sans identifiants ; http sur `127.0.0.1` ou `[::1]` seuls) ou portant `?`, `#` (T-2) | `--url` | l.79 |
| `insecure_url` | chemin hors de la liste fermée (T-8) | le chemin | l.80 |
| `insecure_url` | `NODE_TLS_REJECT_UNAUTHORIZED` à `0` sous `--url` (T-9 amendé, FAITS F-1) | `NODE_TLS_REJECT_UNAUTHORIZED` | l.78 |
| `redirect_refused` | statut 3xx ou réponse `opaqueredirect` (T-4) ; la cible n'est jamais demandée | le chemin | l.86 |
| `http_status` | statut autre que 200, ou corps nul (T-5) | le chemin, jamais le statut (É-4) | l.87 |
| `too_large` | corps au-delà de `MAX_BODY_BYTES`, compté en flux (T-6) | le chemin | l.91 |
| `too_large` | GET au-delà de `MAX_FILES`, refusé avant son émission (bornes totales) | `total files` | l.81 |
| `too_large` | octets cumulés au-delà de `MAX_TOTAL_BYTES` (bornes totales) | `total bytes` | l.92 |
| `unreachable` | délai échu, faute réseau, DNS ou TLS (T-7) | le chemin | l.99 |
| `line_missing` | `--day` : avant le jour de l'ancre, après le jour de la tête servie, jour sans `snapshot` | `--day: …` (trois formes) | l.352-353 |
| `line_missing` | `--address` sous `--day` : aucune ligne dans le fichier de D | `--address: no line in the --day snapshot` | l.360 |

## 6. Écarts d'exécution (aucun contournement)

- **Sondes pendant un verrou tenu** (deux fois) : 23:34:51Z (sonde de conception, section 3 ; G7, pid 148284) ; 00:02:4xZ, sonde
  de types par l'API du compilateur (`F:/tmp/dojo/pr1b4/probe/types.mjs`, environ 5 s ; cp-2, pid 112396, pris à 00:02:39Z), dont
  la commande affichait le verrou en tête sans s'interrompre. Remède : garde `F:/tmp/dojo/pr1b4/guard.sh` (sortie 99 tant que le
  dossier de verrou existe) en tête de chaque lancement suivant.
- **Garde d'octets** : `grep -c` d'un motif `$'\r'` rendait une ligne sur une ligne (motif vidé par le transport Bash, artefact
  mesuré) ; la mesure d'autorité est un balayage des points de code par `node` (section 9).
- **Cliquet** : le formateur `unix` n'est plus dans ESLint 10 (sortie 2, aucune mesure) ; mesure refaite au format `json`.
- **`node_modules` de la campagne** : `mk-nm.ps1 -Tree <out>` laisse `@monark` vide (« NO WORKSPACE », PR-4a-2 section 8) ; or
  `apps/dojo/test/dojo-collect.test.ts`, importeur direct de `dojo-verify.mjs` donc ligne de base, importe `@monark/rpc-guard` :
  la ligne de base aurait rougi. Remède : `mk-nm.ps1 -Tree F:/tmp/dojo/pr1b4/gel` (220 entrées, 10 liens `@monark` vers les paquets
  du clone gel, 0 échec), puis `F:/tmp/dojo/pr1b4/mutants/node_modules` = une jonction vers ce `node_modules` ; `packages/`,
  `apps/dojo/src` et `apps/bell` sont identiques à la base et au tronc (`git diff --stat 7d9e413e 1e99f27b` vide). Item formé :
  MUTANTS-NM-WORKSPACES-1 (section 15).

## 7. Tâche → fichier → test → mutant (lignes de `apps/dojo/scripts/dojo-verify.mjs` au gel, sha256 `f3292bdb…8298`)

| Tâche | Lignes | Tests | Mutants (table) ; killers `K` |
|---|---|---|---|
| T-1, T-2 : politique sur la chaîne brute, `?` et `#` | l.61-64, l.79 | 1 | M-U1, M-U7, N9, N10 |
| T-3 à T-7 : `<base>/<rel>`, redirection, statut, flux, minuteur | l.73, l.82-100 | 1, 2 | M-U2 à M-U5, N2 ; K l.85 (test 2) |
| T-8 : liste fermée des chemins | l.65, l.80 | 1 | M-U6 ; K l.80 (test 1) |
| T-10 : un seul `fetch(` et une seule lecture d'environnement | l.73, l.85 | 7 | M-U8 ; K l.56 (test 7) |
| Bornes et totaux (Q-2, Q-V-1) | l.40-45, l.81, l.92 | 3 | M-U9, M-U10, N3, N4 ; K l.81 (test 3) |
| T-9 amendé (FAITS F-1 à F-5) | l.66, l.73-78, l.414 | 8 | N1, N5, N8 |
| D-2 : `--day`, cible, refus, `--address` sous `--day` | l.345, l.350-364 | 4, 5 | M-D1 à M-D6, N11 ; K l.356 (test 4), K l.352 (test 5) |
| D-3 : 18 clés, `breaks`, `target`, `timeline_sha256` | l.36-38, l.367, l.370 | 6, 7, 8 | M-B1, M-C1, M-C2 ; K l.367 (test 6), K l.370 (test 8) |
| CLI : grammaire à deux sources, `--day` en forme, déclaration TLS | l.386-416 | 7, 8 | N6, N7, N8 |

- Tests (ADR §4) : 1 `dojo_verify_url_transport_is_the_bell_policy`, 2 `dojo_verify_url_equals_dir_on_the_same_tree`, 3
  `dojo_verify_totals_are_bounded`, 4 `dojo_verify_day_proves_a_past_day`, 5 `dojo_verify_day_refusals_are_named`, 6
  `dojo_verify_reports_broken_rotations`, 7 `dojo_verify_cli_is_fail_closed` (amendé), tous dans `apps/dojo/test/dojo-verify.test.ts` ;
  8 `dojo_verify_url_cli_is_the_ca_contract` dans `test/dojo-verify-url.test.ts` (racine de câblage `test/`).
- Review Focus, classe par classe (tâche 3) : URL hors boucle locale, redirection, `?` et `#`, chemin hors liste : test 1 ; corps
  sans `content-length` au-delà de la borne et corps annulé : test 1 ; cumul au-delà des bornes totales : test 3 ;
  `NODE_TLS_REJECT_UNAUTHORIZED=0` refusé avant tout GET : test 8 ; `--day` avant l'ancre, après la tête, sans `snapshot` : test 5 ;
  arbre sans `snapshot` (`head`, `target` et `day` nuls, 0 `snapshot`, les 18 clés), par la CLI : test 8 (ajouté après la seconde
  consultation de l'advisor, section 18).

## 8. Livrables (worktree `F:/Monark-wt-dojo-pr1b4`, non committés : le gel est un acte de l'orchestrateur)

| Fichier | État | l. | sha256 | insertions, suppressions (contre `7d9e413e`) |
|---|---|---|---|---|
| `apps/dojo/scripts/dojo-verify.mjs` | modifié | 422 | `f3292bdba25c1434528809ad12ef928f230b7e54dbf88ccf9c9217ea06118298` | 92, 25 |
| `apps/dojo/scripts/dojo-verify.d.mts` | modifié | 41 | `7a5e4c212ff310196dd95d9a5595461a9d4fc6ebefb0be0bf1fdfae7f28a594d` | 17, 6 |
| `apps/dojo/test/dojo-verify.test.ts` | modifié | 588 | `d5b781f9a446160b2c065c2ec8b36e8b96c7769cbfdb07c6154940eac9730fea` | 160, 2 |
| `test/dojo-verify-url.test.ts` | neuf | 89 | `540643f3037ffcc66ffbea0fb8b9eaad014a1d5d659aed8d3251bfe016acd963` | 89, 0 |
| `docs/G1-lot-dojo-pr1b4.md` | neuf (ce journal, hors R-25) | — | rendu hors du fichier | — |

## 9. Tests et contrôles (TEMP `F:/tmp/dojo/pr1b4/tmp` ; chaque lancement sous verrou libre, sauf les écarts de la section 6)

- Course ciblée n° 1, worktree (23:52:19Z → 23:52:31Z, `F:/tmp/dojo/pr1b4/run-1.log`, sha256 `64358535…53c7`) : 26 / 26 verts
  (les 19 tests existants de `dojo-verify.test.ts`, dont le test 7 amendé, les six neufs, et le test 8).
- Clone gel `F:/tmp/dojo/pr1b4/gel` (`--no-local`, HEAD `cf4a4704`, cinq fichiers du lot recopiés, `cmp` égal) : `tsc --noEmit`
  exit 0 (00:01:07Z → 00:01:14Z ; les trois fichiers TypeScript du lot dans le programme, `--listFiles`) ; ESLint des deux fichiers
  de test exit 0 (00:09:29Z) ; cliquet des six règles réactivées (format `json`) : `dojo-verify.test.ts` 0 à la base et 0 au gel,
  `test/dojo-verify-url.test.ts` 2 au premier jet (deux étalements `[...dv.DOJO_VERIFY_REPORT_KEYS]` ; l'API du compilateur type le
  membre `readonly string[]`, `probe/types.mjs`) puis 0 après retrait des étalements (`ratchet-gel2.json`, sha256 `4e199436…448f`) ;
  course ciblée n° 2 au gel (00:09:38Z → 00:09:51Z, `run-2.log`, sha256 `f6fb678b…5a7b`) : 26 / 26.
- Portée du `lang:gate` par ses fonctions exportées (`loadExempt`, `scanFile`) sur les quatre fichiers : 0 occurrence.
- Garde d'octets (balayage des points de code par `node`) : 0 TAB, 0 CR, 0 point de code C0 hors LF, 0 C1 (0x7F-0x9F), LF final,
  dans les cinq fichiers ; code et tests en ASCII pur ; barres obliques inverses : sources de motifs et `\n` de gabarits seulement,
  écrites par les outils d'édition, jamais par heredoc.
- Sondes : `probe1` (section 3) ; `probe2` (00:11:05Z, sortie `probe2.out`, sha256 `a2b79829…b3bb1`) tranche l'ADR §9 n° 2 par la
  mesure : sous `redirect: "manual"`, Node 24.15.0 et undici 7.24.4 rendent `type` `basic`, statut 302, `Location` lisible, corps non
  nul, cible jamais demandée ; la clause « statut 3xx » de T-4 est donc celle qui refuse ici, `opaqueredirect` reste la défense
  d'un runtime conforme à la spécification Fetch.
- Après l'ajout au test 8 (section 18), clone gel resynchronisé (`cmp` égal) : `tsc --noEmit` 0, ESLint 0, cliquet 0 et 0
  (`ratchet-gel3.json`), course ciblée n° 3 (00:30:20Z → 00:30:33Z, `run-3.log`, sha256 `453afb01…9306`) : 26 / 26.
- Suite complète : oracle (section 12).

## 10. F2P (outil du tronc `F:/Monark/scripts/red-proof.mjs`, sha256 `6579b550…ab36`)

- Commande (celle de la mission) : `node F:/Monark/scripts/red-proof.mjs --base 7d9e413e --gel F:/Monark-wt-dojo-pr1b4 --repo
  F:/tmp/dojo/pr1b4/base --out F:/tmp/dojo/pr1b4/f2p --draw 3 --seed 2026`, TEMP sur F: ; `F:/tmp/dojo/pr1b4/base` = clone
  `--no-local` à `7d9e413e`, son `node_modules` = une seule jonction vers `F:/Monark/node_modules` ; 00:10:06Z → 00:10:50Z.
- **Preuve retenue : `F:/tmp/dojo/pr1b4/f2p2/RED-PROOF.json`, sha256 `c0bf4efa5d6ad16c1ac41ac2dfcf0a6ae7a958d8eb93752a6fe73b18fd1bb981`**,
  `ok: true`, 00:30:44Z → 00:31:27Z (même commande, `--out` neuf `f2p2` après l'ajout au test 8) ; `gel.digest`
  `94d16803f3c75238118da52eae0614d89ea1c7f42cd0769c727fa0efbef33b58` (hors `docs/**/*.md`) ; 8 jugés, 18 inchangés.
- Les huit tests : **F2P** (base `assert-fail`, gel `pass`) ; aucun `new-module`, aucun refus.
- Tirage 3 sur 8, graine 2026 : K `dojo-verify.mjs:81` ROR (test 3), K `:56` CONST (test 7), K `:352` ROR (test 5) : **tués**
  (rouges par assertion, modules chargés), sha256 avant = après ; `killer-1.tap` à `killer-3.tap` dans le même dossier.
- Première preuve, gardée, sur l'arbre d'avant l'ajout : `F:/tmp/dojo/pr1b4/f2p/RED-PROOF.json`, sha256
  `3a4c341aba2ba88f8211b3070c09804bcfac81e447ae6d3071505900707f761b`, `ok: true`, digest `7e85f771…36ea` (00:10:06Z → 00:10:50Z).

## 11. Mutants (outil du tronc `F:/Monark/scripts/mutants/run.mjs`, sha256 `2606e7da…3b19`, arbre de l'outil `dc4ac879`)

- Commande : `--repo F:/tmp/dojo/pr1b4/gel --base 7d9e413e --out F:/tmp/dojo/pr1b4/mutants --table F:/tmp/dojo/pr1b4/mutants-table.mjs
  --killers --file apps/dojo/scripts/dojo-verify.mjs --targets apps/dojo/test/dojo-verify.test.ts,test/dojo-verify-url.test.ts
  --lock-root F:/tmp --min-free-mb 4096` ; avant : garde libre, `held(F:/tmp)` nul, 13 `node.exe`, 19 890 Mo physiques et 36 934 Mo
  virtuels libres ; aucun oracle ni course pendant la campagne (00:11:27Z → 00:12:47Z).
- **Enregistrement retenu : `F:/tmp/dojo/pr1b4/mutants2/RESULTS.json`, sha256
  `0485468f557b864148b6ac93046a33a4fd23a4d638053637f6dd2bd1bc8bcebe`** (00:32:04Z → 00:33:08Z ; même commande, `--out` neuf
  `mutants2` après l'ajout au test 8 ; `RESULTS.txt` sha256 `7e839897…7475` ; `dirty` du clone gel `1433ee79…3115` ; arbre de
  l'outil `88d7acd8`) ; avant : garde libre, `held(F:/tmp)` nul, 12 `node.exe`, 19 883 Mo physiques et 36 969 Mo virtuels libres ;
  table sha256 `13dec40b2edaf455a9c819291672f618938f57aa89b654596fc1c47e8ee3cd5b` (30 lignes, inchangée : le module n'a pas bougé) ;
  contrôle préalable des ancres (`anchors.mjs`, sortie `anchors.out` sha256 `f21f0f10…dc4f`) : 38 sur 38 valides.
- Première campagne, gardée, sur l'arbre d'avant l'ajout : `F:/tmp/dojo/pr1b4/mutants/RESULTS.json`, sha256
  `28cbefee4b709cbba8e16f496f7fc30ff42375eb8d08c9ebf862bf3213d546b3` (00:11:27Z → 00:12:47Z), même bilan (38 / 38).
- Ligne de base verte : les huit importeurs directs de `dojo-verify.mjs` (`dojo-collect-pure`, `dojo-collect`, `dojo-history-build`,
  `dojo-history-read`, `dojo-verify` sous `apps/dojo/test/`, `dojo-page`, `dojo-served`, `dojo-verify-url` sous `test/`), 77 tests.
- **38 / 38 tués**, tous stricts (un seul code d'échec, `ERR_ASSERTION`), fichier restauré au sha256 à chaque mutant, aucun rejeu :
  les dix-neuf nommés (M-U1 à M-U10, M-D1 à M-D6, M-B1, M-C1, M-C2), onze neufs (N1 à N11 : refus TLS retiré, annulation du corps
  retirée, deux bornes à égalité, valeur de Q-2 déplacée, déclaration TLS nulle, `--url` hors des sources, `--day` hors forme admis
  par la CLI, déclaration abandonnée par la CLI, politique non appliquée au `get`, casse de `https`, `seq` du refus de `--day`) et
  les huit killers K1 à K8. Chaque mutant est tué par le test que la table de l'ADR attend (colonne `test` de la table ; relu dans
  `RESULTS.json` des deux campagnes : `status` `tue`, `strict` vrai, test attendu parmi les rouges, fichier restauré, 38 sur 38 ;
  ligne de base verte, 77 tests, dans les deux). Tueurs de l'ADR « M-D3 à M-D6 par
  5 et 7 », « M-C1, M-C2 par 7 et 8 » : ici M-D3 à M-D6 par 5 (le 7 tue le pendant CLI, N7), M-C1 par 7, M-C2 par 8 (le test 7 sert
  une chronologie canonique, dont la re-sérialisation est identique : seul le corps non canonique du test 8 départage).

## 12. Oracle et R-25 (`node F:/Monark/scripts/oracle/run.mjs --role G1 --tree F:/Monark-wt-dojo-pr1b4 --base 7d9e413e --key PR-1b-4`)

- **Enregistrement retenu** (arbre final, après l'ajout au test 8) : lancé sous garde (verrou libre à 00:33:18Z), outil du tronc
  sha256 `8ab26615…5a90`, 00:33:19Z → 00:42:11Z, verrou pris sans attente ; aucune autre exécution de ma part pendant son verrou.
  **`F:/tmp/oracle-results/cf4a47046087c836c9fad0fa6698c550ea0e2a37-098bfe939bd5f194-G1-20260930T003319Z-80912.json`, sha256
  `7e86b9f403bee4e81ecace0fe49e5c1a6ad1c778b08efc8cfb89f5aec1e165ba`** ; `exit` 0, `static_only` faux, `served_from` nul (rejoué :
  arbre non propre, jamais servi) ; `tree.dirty` `098bfe93…7dab`, `tree.object` `3c513af387221ce1a4478f5db38628b11515ecc4`.
- Portes : épinglage des modèles, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`, `lint:ratchet`, `test` :
  toutes à 0. Suite (`09-test.log`, sha256 `5eacf4e1…2ca9`) : **1 718 tests, 1 715 verts, 0 rouge, 3 sautés** (sentinelle SIGTERM,
  nom court 8.3, artefacts u4b : étrangers au lot, les mêmes qu'au G1 de PR-4a-2) ; test 42 vert (447,9 s), une seule fois ; les huit
  tests du lot verts dans la suite ; `dojo_collect_to_verify_end_to_end` vert (6,6 s) sur la base du lot (le rejeu sur l'arbre
  fusionné reste l'acte du G7, C-V-4 (b)). C-V-4 relevé par l'oracle : 16 `node.exe`, 19 142 Mo libres.
- **R-25**, calcul exporté `r25()` de `scripts/oracle/r25.mjs` (porte `r25`, sur le commit de gel de l'oracle) : `STAT` 358
  insertions, 33 suppressions, **391** changées (borne `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0 (borne 8 000). Contre 547 :
  solde 156, C-V-6 ne joue pas ; sous le STOP 1 150. Dérive : × 1,24 du prévu de ce G1 (≈ 316, section 2), × 1,66 de l'ADR (236),
  sous le × 2,1 de la règle (donnée pour R25-FACTOR-DRIFT-1).
- Premier enregistrement, gardé, sur l'arbre d'avant l'ajout : `…-49d1b652c8b2b6fb-G1-20260930T001314Z-118964.json`, sha256
  `ee4865ddba0def67ac5442ddd92dd7e584ced9545f20b3313ac74cba45cfd25c` (00:13:14Z → 00:21:05Z), même bilan (1 718, 0 rouge), R-25 388.
- Depuis la capture de l'oracle retenu, seul ce journal (`docs/**/*.md`, hors R-25 et hors code) a changé : les quatre fichiers de
  code et de test ont les sha256 de la section 8.

## 13. MAST (modes de l'ADR §6 et de ce G1)

- **FM-3.2 vérification absente** : composition avec PR-2-2 et PR-4a-2 (fusionnée au tronc pendant ce G1, `52e07d56`) non rejouée ;
  parade : au G7, rejeu par nom de `dojo_collect_to_verify_end_to_end`, `dojo_served_data_matches_deploy_ca` et
  `dojo_sync_get_holds_its_contract` sur l'arbre fusionné (C-V-4 (b), C-V-6) ; ce G1 n'a que la base.
- **FM-1.1 spécification non suivie** : calque de Bell aux divergences muettes ; parade : É-3, É-4, refus au `get`, `urlAllowed`
  exporté, T-11 remplacé par Q-V-1, tous déclarés (section 4) ; les huit tests nommés de l'ADR.
- **FM-3.3 vérification incorrecte** : tests qui relisent le vérificateur, ou verts sur un hôte et rouges sur un autre ; parade :
  valeurs recodées depuis les octets servis, chemins comptés côté serveur, clés figées en toutes lettres (test 8) ; déclaration
  TLS hors de la bibliothèque, environnement de l'enfant fixé par le test 8 (`NODE_USE_SYSTEM_CA=1` mesuré sur l'hôte).
- **FM-2.2 clarification non demandée** : choix du G1 hors du texte de l'ADR ; parade : Q-G1-1 à Q-G1-8 (section 15).
- **FM-2.4 information retenue** : écarts d'exécution ; parade : section 6 (deux sondes sous verrou, artefact de mesure,
  formateur absent, `node_modules` de campagne).

## 14. `error_origin` proposés (assignés au G7 par l'orchestrateur)

- Sondes lancées pendant un verrou tenu (section 6) : ce G1 (worker) ; remède appliqué (garde en tête de commande).
- Deux violations du cliquet au premier jet du test 8 : ce G1 ; corrigées avant la preuve F2P (section 9).
- `mk-nm.ps1 -Tree <out>` sans espaces de travail pour une campagne dont une cible importe `@monark/*` : méthode (outillage de
  campagne) ; item MUTANTS-NM-WORKSPACES-1.
- En-tête du pli cp-1 de l'ADR daté « 2026-09-30 23:3x UTC », postérieur à l'heure de ce G1 : orchestrateur ; déjà consigné par
  l'erratum du tronc `39104572` (« ADR PR-1B-4 et nom des FAITS consignés pour le gel »).
- Compte ascendant 236 (ADR) contre ≈ 316 prévu ici et 391 mesuré (section 12) : planificateur du G0, antérieur au pli cp-1 qui
  ajoute la forme C-V-1, T-9 amendé et F-6 (section 2) ; aucune erreur du pli.
- T-11 (seconde clause) et « par les deux sources » du test 3 : aucune erreur (Q-V-1 du pli, postérieur, fait foi).

## 15. Items (aucun « dû » nu) et questions à l'orchestrateur

- **DOJO-VERIFY-URL-1** (mère, code) : porté par ce lot (D-1, D-2, D-3) ; résolu au G7 de PR-1b-4 ; orchestrateur.
- **DOJO-VERIFY-BREAKS-1** (code) : inclus (`breaks`, test 6, M-B1) ; résolu au G7 de PR-1b-4 ; orchestrateur.
- **FAITS-NODE-FETCH-TLS-1** (lecture) : résolu pour ce lot (pli Q-V-4) ; F-7 (`Content-Encoding`) : mesuré par le G2 (rapport §5 :
  Node 24.15.0, undici 7.24.4, corps `gzip` rendu décodé, bombe refusée : T-6 compte les octets décodés), déclaré au commentaire
  d'`urlSource` (C-G2-6 ; ligne corrigée post-G2, texte du gel 1 cité au §19.7) ; clos pour ce runtime par la ligne datée 01:4x UTC
  de l'orchestrateur aux FAITS (Q-G2-2), à remesurer à tout changement de version de Node ou d'undici ; orchestrateur.
- **DOJO-VERIFY-TLS-FLAGS-1** (neuf, PAROXYSME, conception) : les drapeaux `--use-openssl-ca`, `--use-system-ca`, `--use-bundled-ca`,
  `--use-env-proxy` passés par `NODE_OPTIONS` ou la ligne de commande, et `SSL_CERT_FILE`, `SSL_CERT_DIR` sous `--use-openssl-ca`
  (FAITS F-3 à F-5), ne sont ni refusés ni déclarés ; objet : les déclarer ou les refuser d'après `process.execArgv` et
  `NODE_OPTIONS` (Q-G1-1) ; déclencheur : G1 de PR-3b-2 (conception de c07 et du lancement du vérificateur) ; orchestrateur.
- **MUTANTS-NM-WORKSPACES-1** (neuf, méthode, outillage) : `scripts/mutants/run.mjs` construit lui-même le `node_modules` de son
  clone (entrées reliées, espaces de travail re-pointés vers le clone, comme `oracle/run.mjs`) au lieu d'un `node_modules` posé à
  la main dans `--out` ; déclencheur : avant la prochaine campagne dont une cible importe `@monark/*` ; orchestrateur.
- **DOJO-CA-TIMELINE-SHA-1** (pli C-V-3, code de PR-3b-2) : `c11` exige `timeline_sha256` = `bodies_sha256` de `/timeline.jsonl` ;
  le vérificateur le rend sur les octets vérifiés (test 8, M-C2) ; déclencheur : G1 de PR-3b-2 ; orchestrateur.
- **DOJO-SYNC-FETCH-CONVERGE-1** (pli Q-V-2, code) : `scripts/sync-dojo-served.mjs` (tronc) converge sur `urlSource` (refus TLS,
  annulation du corps, `content-length` jamais lu) ; déclencheur : avant l'acte TU-7 ; orchestrateur.
- **DOJO-VERIFY-SCALE-1, DOJO-VERIFY-HISTORY-DAY-1, DOJO-LIVE-BOUNDS-KEYS-1, R25-FACTOR-DRIFT-1, PLI-MERE-PR1B4-1** (ADR §7) :
  inchangés ; PLI-MERE-PR1B4-1 reçoit la table de la section 5 ; déclencheurs de l'ADR §7 et du pli cp-1 ; orchestrateur.

- **Q-G1-1** : DOJO-VERIFY-TLS-FLAGS-1 en item (le pli nomme trois variables) plutôt qu'élargi dans ce lot ? Recommandation : item.
- **Q-G1-2** : `urlAllowed` exporté (ajout, comme Bell ; seul moyen d'éprouver les listes de Bell sans socket) : admis ?
  Recommandation : admis.
- **Q-G1-3** : refus de `urlSource` à chaque `get` (avant sa requête) et non à la construction comme Bell : admis ? Recommandation :
  admis (D-3 exige la ligne de refus sur stdout ; une faute à la construction sortirait en `fatal`).
- **Q-G1-4** : `--address` sous `--day` sans ligne dans le fichier de D : `detail` neuf `--address: no line in the --day snapshot`,
  au `seq` et au `day` de D (les refus de `--day` eux-mêmes restent à la tête, D-2) : admis ? Recommandation : admis.
- **Q-G1-5** : sous `--url`, le `detail` d'un succès porte la déclaration TLS ; `c03` lit `ok`, `status`, `trust_root` : `c07` doit-il
  la recopier ? Recommandation : oui, décidé au G1 de PR-3b-2 avec DOJO-CA-TIMELINE-SHA-1.
- **Q-G1-6** : MUTANTS-NM-WORKSPACES-1 en item de méthode ? Recommandation : oui.
- **Q-G1-7** : `HTTP://127.0.0.1` (schéma http en capitales) refusé, comme le motif de Bell (http sensible à la casse, https non) :
  parité gardée ? Recommandation : gardée (règle sur la chaîne brute, sûre par défaut).
- **Q-G1-8** : la base du lot (`7d9e413e`) ne porte pas PR-4a-2 (fusionnée pendant ce G1) ; les contrats qu'elle lit
  (`VERIFY_BOUNDS.MAX_BODY_BYTES`, `verifyDojoServed({source, keyring})`, `Parameters<typeof verifyDojoServed>[0]`) restent
  additifs : le rejeu par nom au G7 (C-V-6) tranche. Recommandation : G7 sur l'arbre fusionné, comme prévu.

## 16. Advisor

- **Advisor intégré (1)**, 23:33Z, après l'orientation et avant toute écriture : lecture de la borne 547 (compte ascendant ;
  mesure contre 1 150 et 1 205, solde contre 547) ; contradictions entre l'ADR et le pli à déclarer (garde T-10 sur `process.env`,
  T-11 remplacé par Q-V-1, date du pli) ; indépendance de l'environnement (déclaration TLS hors de la bibliothèque, par la CLI) ;
  mécanique de `red-proof.mjs` (corps jugés, fermeture en colonne 0, existence d'abord, TEMP sur F:, une seule jonction) ; lignes de
  killers et de table figées après le module et vérifiées ; deux sondes avant d'arrêter les tests ; prédicat pur contre le réseau
  sous mutation (`urlAllowed` exporté) ; test de l'annulation du corps ; outil de mutants (clone, sortie, `held`, ligne de base des
  importeurs directs) ; garde avant l'oracle, cliquet à 69 ; drapeaux TLS en item. Retenus, chacun vérifié sur pièce. Conseil,
  jamais verdict.
- **Advisor intégré (2)**, 00:25Z, sur la remise rendue durable (journal `2193c541…b0d3`, `REPONSE.md` `68228db0…5903`) : cinq
  points, tous appliqués et vérifiés sur pièce (section 18). Conseil, jamais verdict.

## 17. Provenance et état final

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-29/30 | G1 de PR-1b-4 | `claude-opus-5-5` | max | mission, règles, section 1 | worker | orchestrateur (R-21), G2 frais | à venir |

- **Conduite git** : lecture seule dans le worktree et au tronc (`status`, `diff`, `rev-parse`, `show`, `log`, `ls-files`,
  `worktree list`) ; clones `--no-local` sous `F:/tmp/dojo/pr1b4/` (`gel`, `base`) ; les outils ont leurs propres clones
  (`red-proof.mjs` et l'oracle suppriment les leurs ; `F:/tmp/dojo/pr1b4/mutants/clone` gardé) ; le commit de gel de l'oracle vit
  dans le clone de l'oracle, acte de l'outil. **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`**, aucun commit de ma
  main, aucun workflow (R-20).
- **Réseau** : boucle locale seule (`127.0.0.1`, port 0) ; aucun hôte hors boucle locale n'est contacté, ni par les tests (T-1
  éprouvée en prédicat pur) ni par les mutants (loopback ou refus avant toute requête).
- **C:** : rien écrit (TEMP `F:/tmp/dojo/pr1b4/tmp` à chaque lancement).
- **Jonctions** : retirées par `rm-nm.ps1` à 00:22Z (`mutants`, `base`, `gel`), recréées pour les reprises (00:28Z) puis retirées de
  nouveau à 00:42:57Z (`mutants2`, `base`, `gel`) ; aucun des quatre dossiers ne garde de `node_modules` ; `F:/Monark/node_modules`
  intact (220 entrées avant et après, 10 liens `@monark`, `typescript` présent).
- **État du worktree à la remise** : HEAD `cf4a4704` inchangé ; `git status --porcelain` = ` M` pour `dojo-verify.d.mts`,
  `dojo-verify.mjs`, `dojo-verify.test.ts`, `??` pour `docs/G1-lot-dojo-pr1b4.md` et `test/dojo-verify-url.test.ts` ; tronc
  `F:/Monark` propre (aucune écriture de ma main).
- **Sorties hors dépôt** : `F:/tmp/dojo/pr1b4/` (`probe/`, `tmp/`, `gel/`, `base/`, `f2p/`, `f2p2/`, `mutants/`, `mutants2/`,
  `mutants-table.mjs`, `anchors.mjs`, `anchors.out`, `guard.sh`, journaux `run-1.log` à `run-3.log`, `tsc-gel*.log`, `eslint-gel*.log`,
  `ratchet-*.json`, `f2p.log`, `f2p2.log`, `mutants.log`, `mutants2.log`, `oracle.log`, `oracle2.log`) et `F:/tmp/dojo/pr1b4-deliver/`
  (`REPONSE.md`, `DELIVERED.sha256`) ; les deux enregistrements d'oracle sous `F:/tmp/oracle-results/`. Le sha256 de ce journal est
  rendu hors du fichier (`DELIVERED.sha256`).

## 18. Remise

- Verdict proposé : **LIVRE-AVEC-RESERVES** (réserves : ratifications Q-G1-2 à Q-G1-5 et Q-G1-7 ; items DOJO-VERIFY-TLS-FLAGS-1 et
  MUTANTS-NM-WORKSPACES-1 ; écarts d'exécution de la section 6 ; seul ce journal a changé après la capture de l'oracle).
- Seconde consultation de l'advisor (00:25Z), cinq points : (1) une classe du Review Focus, « arbre sans `snapshot` : `head` nul,
  rapport aux 18 clés », n'avait pas d'assertion de SUCCÈS sur la voie CLI (l'existant n'assertait que `head` nul en bibliothèque) :
  trois lignes ajoutées au test 8 (`head`, `target`, `day` nuls, 0 `snapshot`, les 18 clés), puis F2P, campagne et oracle refaits
  dans des dossiers neufs (`f2p2`, `mutants2`, nouvel enregistrement), les premières preuves gardées ; (2) la présente section
  remplit le renvoi de la section 16 ; (3) forme de `DELIVERED.sha256` déclarée dans `REPONSE.md` ; (4) élargissement de
  `detail` vérifié sans consommateur touché (section 4) ; (5) réponse finale calquée sur `REPONSE.md`.
- `DELIVERED.sha256` suit le précédent de PR-4a-2 : format `sha256sum` pur (sans ligne de modèle, pour que `sha256sum -c` passe) ;
  sa ligne sur l'enregistrement de l'oracle dépasse 160 caractères, le chemin absolu étant incompressible.

## 19. Corrections post-G2 (correcteur `claude-opus-5-5`, effort max, contexte frais ; correcteur ≠ relecteur ≠ générateur)

- **Correcteur** : `claude-opus-5-5` (R-1), instance distincte du G1 et du relecteur G2. Mission `F:/tmp/dojo/mission-corr-pr1b4.md`
  (67 l., 15 181 o.), sha256 recalculé AVANT lecture (première commande ; `date -u` suivant : 01:33:28Z) =
  `edcfdf0ff6aeafdd73c935a410df8d294dca30f048898a368ca33adbe2047720` = `sha` du reçu `F:/tmp/dojo/mission-corr-pr1b4.recu.json`
  (verdict `vert`, 12 codes du linter à 0, 2026-09-30T01:33:03Z, `base` `7d9e413e`, `head` `381de4fd`) ; règles embarquées
  (`e5443e55…4059`) lues en entier ; la ligne datée 23:3x du tronc (rejeu de `red-proof.mjs` par une mission de corrections),
  à laquelle renvoie la tâche 3, lue dans `F:/Monark/docs/methode/REGLES-MISSION.md` (`c5a3c674…1f5b`).
- **Ouverture** (01:33:28Z) : worktree HEAD `381de4fd`, `status --porcelain` vide (lu avec `--no-optional-locks`), les sept
  fichiers aux sha256 de la mission ; tronc `F:/Monark` à `0d9913e4` (le G2 l'avait lu à `6951d972`) ; outils du tronc aux
  sha256 de la mission (`red-proof.mjs` `6579b550…ab36`, `oracle/run.mjs` `8ab26615…5a90`, `r25.mjs` `4d0544df…cf0`),
  `mutants/run.mjs` `2606e7da…3b19` (celui du G1 et du G2).
- **Entrées lues en entier, dans l'ordre** (01:33Z-01:45Z) : rapport G2 `F:/tmp/dojo/g2-pr1b4/G2-report.md` (304 l.,
  `53b57d34…10d8`), son §14 et `probes/` (`lib.mjs`, `p1` à `p9` et leurs sorties) ; mission G1 (`1f8d585f…7e`) ; ce journal
  (392 l., `c21026c5…da1`) ; ADR (236 l., `888d5a5b…8bca5` : §4, pli cp-1) ; `dojo-verify.mjs` (422 l., `f3292bdb…8298`),
  `dojo-verify.test.ts` (588 l., `d5b781f9…fea`), `test/dojo-verify-url.test.ts` (89 l., `540643f3…acd963`). Outils et
  précédents : `red-proof.mjs` et `mutants/run.mjs` (en entier) ; tables du G1 (`13dec40b…cd5b`) et du G2 (`f6a4435c…7acc`) ;
  `mk-nm.ps1` (`d70d8aea…fbe4`), `rm-nm.ps1` (`b51b5d22…8749`) ; journaux de PR-4a-2 (§18) et de PR-3a-1 (§10) au tronc.
- **Décisions de l'orchestrateur portées par la mission (décisions 275 et 291)** : C-G2-1 (bloquante), C-G2-2 à C-G2-6 et Q-G2-3
  dans ce tour ; C-G2-7, Q-G2-1, Q-G2-2 et Q-G2-4 hors de ma charge (actes du G7).
- **Verrou d'hôte** : tenu par l'oracle G2 d'un autre lot de 01:36:28Z (pid 75104) puis de 01:45:01Z (pid 83656, même arbre
  `b0e595a5`) : ce compte et les éditions sont écrits pendant ce verrou, sans test, harnais ni contrôle statique (écart E-C-1 :
  §19.10).

### 19.1 Compte ascendant prévu (écrit de 01:49:18Z à 01:49:27Z, AVANT tout code ; R-25 du gel 1 : 391, borne 547)

| Correction | Fichier | Tour (ins. + suppr.) | R-25 |
|---|---|---|---|
| C-G2-1, C-G2-4 : arbre nommé, route `/r/<statut>/`, boucle 301 à 308 et 206 | `apps/dojo/test/dojo-verify.test.ts` | 4 + 4, puis 4 + 1 | +3 |
| C-G2-5 : plus gros corps à la borne par corps, sous le total | idem | 2 + 0 | +2 |
| C-G2-2 : Q-G1-4 au test 4 | idem | 3 + 0 | +3 |
| C-G2-3 : `2026-09` et `2027` ajoutés, `2026-10` gardé | idem | 2 + 0 | +2 |
| Q-G2-3 : `http_proxy`, `https_proxy`, `no_proxy` retirés | `test/dojo-verify-url.test.ts` | 1 + 1 | 0 |
| C-G2-6 : phrase F-7 au commentaire d'`urlSource`, l.67-71 réécrites | `apps/dojo/scripts/dojo-verify.mjs` | 5 + 5 | 0 |
| **Total** | | **≈ 32** | **≈ +10 : ≈ 401** |

- ≈ 401 ≤ 547, solde ≈ 146 : aucune scission (C-V-6 ne joue pas). Les lignes réécrites (test l.481-484 et l.501, test 8 l.57,
  module l.67-71) ont été ajoutées par le G1 : contre la base, leur réécriture est neutre, seules les insertions nettes comptent.
  Pré-mesure en lecture et mesure d'autorité (`r25()` de l'oracle) : §19.6.
- **Nombre de lignes du module constant (422)** : les huit killers (`dojo-verify.mjs:56`, `:80`, `:81`, `:85`, `:352`, `:356`, `:367`,
  `:370`) et les rangs de table du G1 et du G2 portent `fichier:ligne` ; `killerProblem` de `red-proof.mjs` et `lostOf` de
  `mutants/run.mjs` refusent au premier décalage. La phrase de C-G2-6 prend donc place dans les cinq lignes du commentaire,
  réécrites en place, et n'y écrit ni appel de `fetch`, ni `process.env`, ni import (motifs que le test 7 compte dans le texte du
  module). Aucune ligne exécutable neuve : le code est juste (104 / 104 contrôles de sonde du G2).
- **C-G2-3, écart à la lettre de la décision, déclaré (Q-C-1)** : la décision dit « `2026-10` remplacé par `2026-09` et `2027` ».
  Or le cas `2026-10` est le SEUL tueur de M-D3 (préfixe de jour admis, `L.day.startsWith(day)`, l.345) : sous M-D3, le test 5
  rougit à ce cas (`F:/tmp/dojo/pr1b4/mutants2/tap/M-D3.tap` l.38, « a prefix given to the library (out of form) ») et les cinq
  cas qui le précèdent passent ; `2026-09` et `2027` ne préfixent aucun jour servi (2026-10-02 à 2026-10-10). La version
  littérale ferait survivre un mutant du G1 que la tâche 4 impose de rejouer : je GARDE `2026-10` et AJOUTE les deux cas (G2-4
  tué, M-D3 gardé). Témoin mesuré de la version littérale : §19.5.
- Advisor intégré consulté après l'orientation, avant cette écriture (§19.10).

### 19.2 Tâche → ligne → test → mutant (fichiers finaux : module `596a349d…ef59`, 422 l. ; test `10cfacb7…f28c`, 598 l. ; test 8 `689176d2…1704`)

| Correction | Lignes finales | Test | Mutants (tous tués, §19.5) |
|---|---|---|---|
| C-G2-1 (bloquante) | test l.481-484 (route), l.501-504 (boucle) | 1 | G2-1 ; CORR-R301, CORR-R302, CORR-R303, CORR-R307, CORR-R308 |
| C-G2-4 | test l.501-504 (206, fichier entier) | 1 | G2-2 |
| C-G2-5 | test l.544-545 | 3 | G2-3 ; CORR-BODY-EQ |
| C-G2-2 | test l.561-563 | 4 | G2-5, G2-6 |
| C-G2-3 | test l.580-581 (l.579, `2026-10`, gardée) | 5 | G2-4 ; M-D3 (l.579) |
| C-G2-6 | module l.67-71 ; ce journal, §15 | — | sans objet (commentaire) |
| Q-G2-3 | test 8 l.57 | 8 | sans objet (environnement de l'enfant) |

- Tests : 1 `dojo_verify_url_transport_is_the_bell_policy`, 3 `dojo_verify_totals_are_bounded`, 4 `dojo_verify_day_proves_a_past_day`,
  5 `dojo_verify_day_refusals_are_named` (`apps/dojo/test/dojo-verify.test.ts`) ; 8 `dojo_verify_url_cli_is_the_ca_contract`
  (`test/dojo-verify-url.test.ts`). Aucun test neuf, aucune ligne `// killer:` touchée : les huit killers du G1 restent ceux du lot.
- **C-G2-1** : la route `r` lit son statut dans le chemin (`/r/<statut>/<fichier>`, trois chiffres) ; sa cible (`Location`) et son
  corps sont le fichier lui-même, servi à la racine du même serveur. La boucle demande 301, 302, 303, 307 et 308 : `redirect_refused`
  `timeline.jsonl` pour chacun, et `srv.seen` vaut EXACTEMENT les chemins `/r/<statut>/timeline.jsonl` : aucune cible demandée.
- **C-G2-4** : dans la même boucle, un 206 portant le fichier ENTIER : `http_status` `timeline.jsonl`. Sous G2-2 (`!res.ok`), l'arbre
  servi en 206 passe entier (`mutants/tap/G2-2.tap` : un rapport `ok` à la place du refus) : seule la règle « 200 seul » le refuse.
- **C-G2-5** : `big`, le plus gros des douze corps ; `run({ MAX_BODY_BYTES: big })` égal à `["ok", 12]`, et `big < all`, précondition
  de la discrimination, écrite dans l'assertion ; un cumul (G2-3) ou l'égalité refusée (CORR-BODY-EQ) rougit.
- **C-G2-2** : `--address` `ADDR.D` sous `--day` 2026-10-04 (jour de lecture 3, seq 5) : `{ ok: false, reason: "line_missing", seq: 5,
  day, detail: "--address: no line in the --day snapshot" }`, valeur mesurée par le G2 (`probes/p6-address-day.out`) ; l'absence de
  ligne de D dans `raw` est assertée avec (hypothèse du fixture rendue visible).
- **C-G2-3** : `2026-09` et `2027` passés à la bibliothèque : « no snapshot of that day » au seq 12 ; sous G2-4, `2026-09` rend
  « before the anchor's day » (`mutants/tap/G2-4.tap`) ; `2026-10` gardé (§19.1, témoin au §19.5).
- **C-G2-6** : l.71, « FAITS F-7, measured on Node 24.15.0 (G2 of PR-1b-4): fetch yields the body DECODED, so T-6 bounds the decoded
  bytes (gzip bombs too). » ; les cinq lignes l.67-71 refluées en place, texte d'origine inchangé mot pour mot ; le test 7 compte
  toujours un seul appel `fetch` et une seule lecture `process.env` dans le module (vert). Ligne du journal : §19.7.
- **Q-G2-3** : `http_proxy`, `https_proxy` et `no_proxy` retirés de l'environnement de l'enfant, en plus de `HTTP_PROXY` et
  `HTTPS_PROXY`. `NO_PROXY` (majuscules) reste hors de la décision : FAITS F-5 (Node lit `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`) ;
  sans variable de mandataire dans l'enfant, cette liste d'exclusion n'a rien à exclure (inférence, non mesurée) : Q-C-3.

### 19.3 Contrôles et course ciblée (clone `F:/tmp/dojo/pr1b4-corr/gel` ; preuves sous `F:/tmp/dojo/pr1b4-corr/`)

- `gel` : clone `--no-local` du worktree (HEAD `381de4fd`, 01:53:48Z), les quatre fichiers du tour copiés (`cmp` égal) ;
  `node_modules` par `mk-nm.ps1 -Tree` : 220 entrées, 10 `@monark` vers le clone, 0 échec (`mk-nm-gel.out` `e4712ef3…538f`).
- Porte `scratch/gate.sh` (`0d02a633…36db`) en tête de chaque lancement, par `&&` : verrou d'hôte absent, puis C-V-4 (≤ 40 `node.exe`,
  ≥ 4 096 Mo physiques, ≥ 8 192 Mo virtuels : METHODE-VMEM-PRECHECK-1) ; relevés de 01:53:29Z à 02:01:54Z : 12 à 15 `node.exe`,
  18 781 à 19 602 Mo physiques et 35 691 à 37 177 Mo virtuels libres.
- Ancres (01:54:47Z ; `scratch/anchors-corr.mjs` `84173b08…b462`, sortie `anchors-corr.out` `2c8fe27b…673d`) : les 8 killers valides
  (`parseKiller` du tronc, puis `<before>` une seule fois sur `fichier:ligne`, comme `killerProblem`), les 42 rangs de table valides,
  0 perdu ; module à 422 lignes.
- Portes statiques (01:55:12Z-01:55:45Z, journaux sous `static/`) : `tsc --noEmit` 0, journal vide (les trois fichiers TypeScript du
  lot dans le programme, `--listFiles`) ; ESLint des deux fichiers de test 0, journal vide ; cliquet des six règles de
  `lint-ratchet.json` réactivées sur ces deux fichiers (`scratch/ratchet-two.mjs` `b4b2d378…ebb8`, modèle `scripts/lint-ratchet.mjs`) :
  0 message suivi, 0 fatal (`ratchet.log` `d370007c…5517`) ; `lang-gate` OK (`lang.log` `b7247d5b…270f`).
- Course ciblée n° 1 (01:56:02Z → 01:56:16Z ; `scratch/run-tests.mjs` `2543210b…7198`, environnement filtré par `DENY` de
  `red-proof.mjs`, TEMP sur F:) : **26 / 26 verts** (`run-1.log` `c11925b1…c30f`).
- Garde d'octets (`scratch/byteguard.mjs` `aeb3b215…de63`, 02:01:31Z) : UTF-8 strict, 0 point de contrôle (TAB, CR, C0 hors LF, C1),
  LF final, code et tests en ASCII ; lignes créées par ce tour ≤ 160 (module 158, test 152, test 8 151 ; journal : 154 au plus) ;
  les lignes de plus de 160 caractères préexistantes (11 au module, 47 au test) sont identiques au gel 1 (même empreinte).

### 19.4 F2P (tâche 3 ; outil du tronc `F:/Monark/scripts/red-proof.mjs` `6579b550…ab36`)

- Commande de la mission : `node F:/Monark/scripts/red-proof.mjs --base 7d9e413e --gel F:/Monark-wt-dojo-pr1b4 --repo
  F:/tmp/dojo/pr1b4-corr/base --out F:/tmp/dojo/pr1b4-corr/f2p --draw 3 --seed 2026` ; `base` = clone `--no-local` au `7d9e413e`,
  son `node_modules` = UNE jonction vers `F:/Monark/node_modules` (220 entrées) ; TEMP, TMP, TMPDIR sur F: ; 01:56:39Z → 01:57:24Z,
  sortie 0 (`f2p.log` `4bee9971…3b23`).
- **`F:/tmp/dojo/pr1b4-corr/f2p/RED-PROOF.json`, sha256 `3aa13b1b1f8ede671a8e6f0eb9a936459277a9f44c175d53ccce03003ff14422`** :
  `ok: true`, mode `worktree`, head `381de4fd`, `digest` `032e79575c9f3659cfd1c130fb2a9c7173cd4a782fa9d2861c5254942d3bd8e8` (G1 :
  `94d16803…3b58` ; la différence est ce tour) ; 8 jugés, **8 F2P** (base `assert-fail`, gel `pass`), 18 inchangés.
- Tirage 3 sur 8, graine 2026 : `dojo-verify.mjs:81` ROR (test 3), `:56` CONST (test 7), `:352` ROR (test 5), le tirage du G1 (même
  population) ; **trois tués**, sha256 du module avant = après (`596a349d…ef59`) ; `killer-1.tap` à `killer-3.tap` (`670eafa9…`,
  `7a7616f0…`, `e0475ab4…`), `base.tap` `b766d901…e597`, `gel.tap` `48e54067…6a`.

### 19.5 Mutants (tâche 4 ; outil du tronc `F:/Monark/scripts/mutants/run.mjs` `2606e7da…3b19`, un lancement par clone)

- Commande (porte à 01:57:48Z : verrou absent, `held(F:/tmp)` nul relu par `lock.mjs` ; 12 `node.exe`, 19 602 Mo physiques, 36 813 Mo
  virtuels libres ; rien d'autre lancé pendant) : `node F:/Monark/scripts/mutants/run.mjs --repo F:/tmp/dojo/pr1b4-corr/gel --base
  7d9e413e --out F:/tmp/dojo/pr1b4-corr/mutants --table F:/tmp/dojo/pr1b4-corr/mutants-table-corr.mjs --killers --file
  apps/dojo/scripts/dojo-verify.mjs --targets apps/dojo/test/dojo-verify.test.ts,test/dojo-verify-url.test.ts --lock-root F:/tmp
  --min-free-mb 4096` ; `<out>/node_modules` = une jonction vers `gel/node_modules` (MUTANTS-NM-WORKSPACES-1, même montage qu'au
  G1 et au G2).
- Table `mutants-table-corr.mjs` (`a2b60e3e…bd3f`, 42 rangs) : la table du G1 importée ENTIÈRE (30 rangs, `13dec40b…cd5b`) ; G2-1 à
  G2-6 filtrés par identifiant dans la table du G2 (`f6a4435c…7acc`), prédiction réécrite « expect tue » AVANT le lancement ; mes six
  rangs : CORR-R301, CORR-R302, CORR-R303, CORR-R307, CORR-R308 (un statut de redirection exclu à la fois, l.86 : chaque statut du
  Review Focus épinglé un à un, ce que G2-1 seul ne prouve pas) et CORR-BODY-EQ (l.91, `>` en `>=` : la borne par corps à l'égalité).
- **`F:/tmp/dojo/pr1b4-corr/mutants/RESULTS.json`, sha256 `5cbf064d6ecb49b2ecd907a783be6bc0bb21389de2f265c0db1f90b16c1fd5dc`**
  (`RESULTS.txt` `95e11fb3…796d`, lu en entier) : 01:58:10Z → 01:59:25Z, gel `381de4fd`, `dirty` `2d2e59af…cfc6`, `tool_tree`
  `0d9913e4`, `tool_dirty` nul ; ligne de base verte (77 tests, les huit importeurs directs) ; **50 / 50 tués, tous stricts
  (`ERR_ASSERTION` seul), tous restaurés** (sha256 `596a349d…ef59` avant et après), 0 non conclu, 0 ancre perdue ; sortie 0.
- Rejeu du G1 : 38 / 38 tués (M-U1 à M-U10, M-D1 à M-D6, M-B1, M-C1, M-C2, N1 à N11, K1 à K8), chacun par le test de la table du G1.
- **Les six survivants du G2 tués**, par les assertions neuves (message de l'assertion rouge lu dans chaque TAP) : G2-1 et G2-2 par
  « T-4: any 3xx refused … T-5: 200 only » (test 1 ; G2-1 : 301, 303, 307, 308 en `http_status` ; G2-2 : le 206 rendu `ok`) ; G2-3 par
  « T-6 counts each body, never the running total » (test 3) ; G2-4 par « 2026-09 to the library … » (test 5 : « before the anchor's
  day ») ; G2-5 et G2-6 par « Q-G1-4: refused at the seq and day of D … » (test 4). Mes six rangs, tués de même (test 1, test 3).
- M-D3 reste tué par le cas `2026-10` (« a prefix given to the library (out of form) », `mutants/tap/M-D3.tap`).
- **Témoin de Q-C-1 (version LITTÉRALE de C-G2-3)** : clone `F:/tmp/dojo/pr1b4-corr/lit` (`--no-local` du worktree, fichiers du
  tour copiés), dont le test 5 perd la seule ligne `2026-10` (`0380037c…b9`, 597 l. ; `diff` : une ligne) ; même outil, même table,
  `--only M-D3,G2-4`, sortie `F:/tmp/dojo/pr1b4-corr/mutants-lit` (porte à 02:00:12Z) :
  **`mutants-lit/RESULTS.json` `a6310376eb2d890d73642674c01e5d6710b6b3b7c314189a1a885cca273e9d0c`** (`RESULTS.txt` `4bfc6039…d3bc`) :
  ligne de base verte (77) ; **M-D3 SURVIT** (premier passage : 8 verts ; rejeu sur les huit fichiers cibles : 77 verts, 0 rouge) ;
  G2-4 tué ; sortie 1 (le survivant). La version littérale aurait donc rendu un survivant parmi les mutants du G1 : l'écart du §19.1
  est nécessaire.

### 19.6 Oracle et R-25 (tâche 5 ; outil du tronc `F:/Monark/scripts/oracle/run.mjs` `8ab26615…5a90`)

- Commande : `node F:/Monark/scripts/oracle/run.mjs --role corr --tree F:/Monark-wt-dojo-pr1b4 --base 7d9e413e --key PR-1b-4`, lancée
  à 02:01:54Z derrière la porte (verrou absent ; 15 `node.exe`, 19 385 Mo physiques, 35 855 Mo virtuels libres), en arrière-plan,
  plafond `timeout 7200` ≥ `ORACLE_LOCK_MAX_MS` (5 400 s) + suite ; jamais interrompue ; rien écrit dans le worktree pendant sa course.
- **Enregistrement : `F:/tmp/oracle-results/381de4fd57ca222b830b359f0d2474030abc18dd-2d2e59af5941ba3f-corr-20260930T020155Z-112232.json`,
  sha256 `8af5f4e0b4fb15599cae3e5b2b780e6f62c9e5a812cc131ad2a67d426eaa1938`** (recalculé = annoncé par la ligne `oracle-result`) ;
  `exit` 0, rôle `corr`, `served_from` nul (arbre modifié : rejoué, ligne datée 21:2x des REGLES), `static_only` faux, `label`
  `PR-1b-4` ; `tree.head` `381de4fd`, `tree.dirty` `2d2e59af…cfc6` (celui de la campagne de mutants), `tree.object`
  `869b9f3be17d62635aef782c79fe2cee81b2f3bf` ; 02:01:55Z → 02:10:32Z ; verrou pris à 02:02:56Z, attente 0 s ; C-V-4 de l'oracle :
  19 515 Mo libres, 13 `node.exe`.
- Portes, neuf, toutes à 0 : `lint-model-pinning`, `r25`, `lang:gate`, `export:check`, `gate:vocab`, `typecheck`, `lint`,
  `lint:ratchet` (hors verrou), `test` (sous verrou, 455 s). Suite (`09-test.log` `206cad0f…73d1`) : **1 718 tests, 1 715 verts,
  0 rouge, 3 sautés** (sentinelle SIGTERM, nom court 8.3, artefacts u4b : étrangers au lot, les mêmes qu'au G1 et au G2) ; test 42
  vert une seule fois (432 s) ; les huit tests du lot verts, une fois chacun ; `dojo_collect_to_verify_end_to_end` vert (son rejeu
  sur l'arbre fusionné reste l'acte du G7, C-V-4 (b), avec les importeurs du tronc : Q-G2-4).
- **R-25**, calcul exporté `r25()` de `scripts/oracle/r25.mjs` (porte `r25` de l'oracle, sur son commit de gel ; `02-r25.log`
  `8914b967…9e20`) : `STAT` **368 insertions, 33 suppressions, 401** (borne `VIBEGATES_PR_LIMIT` 1 205) ; `CONTENT_STAT` 0 (borne
  8 000) ; GREEN. **401 ≤ 547, solde 146** : C-V-6 ne joue pas. Prévu ≈ 401 (§19.1) ; pré-mesure en lecture (02:07:55Z,
  `git diff --shortstat 7d9e413e` sur l'arbre de travail, pathspec de `ci.yml:82` recopié) : 368 + 33 = 401, égale.
- Depuis le lancement de l'oracle, seul ce journal a changé (`docs/**/*.md`, hors R-25 et hors code) : les trois fichiers de code et
  de test du tour ont les sha256 du §19.2, ceux de l'arbre éprouvé par l'oracle.

### 19.7 C-G2-6 : la ligne du §15 corrigée en place (exception motivée au style « rien n'est effacé »)

- Texte du gel 1, cité mot pour mot (commit `381de4fd`, `docs/G1-lot-dojo-pr1b4.md` l.310-311) : « F-7 (`Content-Encoding`) reste
  non établi, déclaré en commentaire de T-6 ; déclencheur : lecture de la spécification Fetch si T-6 en dépend, au G1 de PR-3b-2 ;
  orchestrateur. » Il était inexact : au gel 1, le module ne mentionnait ni F-7 ni l'encodage (G2 §10, C-G2-6).
- Texte corrigé (l.310-313) : F-7 mesuré par le G2, déclaré au commentaire d'`urlSource` (l.71 du module), clos pour ce runtime par la
  ligne datée 01:4x UTC de l'orchestrateur aux FAITS (`F:/Monark/docs/dojo/FAITS-node-fetch-tls-2026-09-30.md`, `dc31cbee…6f2`,
  26 l., lu à 02:03Z ; le G1 l'avait lu à 23 l., `7de80c82…`), avec son déclencheur de re-mesure (tout changement de version).
- Forme : ligne corrigée en place, le texte d'origine vivant dans son commit et cité ici (modèle : ligne datée 17:1x des REGLES) ;
  le §4 (l.119-120) énonce F-7 « non établi » comme décision du G1 à son heure : laissé tel quel, ce paragraphe le met à jour.

### 19.8 MAST et `error_origin`

- **FM-1.1** (spécification non suivie) : T-4 et T-5 épinglés au-delà de 302 et 404 (C-G2-1, C-G2-4) ; CORR-R301 à CORR-R308 prouvent
  chaque statut de redirection un à un.
- **FM-3.3** (vérification incorrecte) : le test 5 discrimine la règle D-2 hors forme (C-G2-3) ; les deux compteurs sont distingués
  (C-G2-5) ; l'environnement de l'enfant du test 8 ne dépend plus de la casse de l'hôte pour les trois variables décidées (Q-G2-3).
- **FM-3.2** (vérification absente) : Q-G1-4 épinglé (C-G2-2). **FM-2.4** (information retenue) : F-7 a sa pièce (C-G2-6).
- `error_origin` proposés (assignés au G7) : C-G2-1 et C-G2-4 : planificateur du G0 (§4, test 1 plus étroit que T-4 et T-5 ;
  proposition du G2) ; C-G2-2, C-G2-3, C-G2-5, C-G2-6 : worker G1 (proposition du G2) ; écart à la lettre de C-G2-3 (Q-C-1) :
  rédaction de la décision, sans l'information que `2026-10` est le seul tueur de M-D3 (orchestrateur) ; E-C-1 : correcteur.

### 19.9 Questions à l'orchestrateur (Q-C-n)

- **Q-C-1 (C-G2-3)** : ratifier `2026-10` gardé, `2026-09` et `2027` ajoutés, contre la lettre « remplacé » ? Mesuré : la version
  littérale laisse survivre M-D3 (§19.5, `mutants-lit/RESULTS.json` `a6310376…9d0c`). Recommandation : ratifier.
- **Q-C-2 (ADR §4)** : le test 1 de l'ADR §4 nomme « 302 ⇒ `redirect_refused` ; 404 ⇒ `http_status` » ; il épingle désormais 301, 302,
  303, 307, 308 et 206 ; CORR-R301 à CORR-R308 et CORR-BODY-EQ ne sont pas nommés au §4. Ligne de pli datée au G7 (précédent : Q-C-1
  des corrections de PR-4a-2) ? Recommandation : oui.
- **Q-C-3 (Q-G2-3)** : `NO_PROXY` en majuscules reste dans l'environnement de l'enfant (hors décision ; sans effet par inférence, §19.2).
  Refermer cet environnement par une liste insensible à la casse (motif `DROP` de `probes/lib.mjs` du G2) ? Recommandation : à porter
  par DOJO-VERIFY-TLS-FLAGS-1 (déclencheur G1 de PR-3b-2), qui refond l'environnement lu par le vérificateur ; rien dans ce lot.
- **Q-C-4** : `DELIVERED.sha256` au format `sha256sum` pur (précédent : Q-C-3 des corrections de PR-4a-2) ; le modèle résolu est la
  première ligne de `REPONSE.md`, que le sceau couvre. À ratifier.

### 19.10 Conduite, écarts, advisor, provenance

- **Git** : lecture seule dans le worktree et au tronc (`rev-parse`, `status`, `diff`, `show`, `log`, avec `--no-optional-locks` ou
  `GIT_OPTIONAL_LOCKS=0`) ; clones `--no-local` sous `F:/tmp/dojo/pr1b4-corr/` (`gel`, `base`, `lit` ; `checkout --detach 7d9e413e`
  dans `base`) ; les clones de `red-proof.mjs`, de l'outil de mutants et de l'oracle sont leurs actes (le commit de gel de l'oracle vit
  dans son dossier de course). **Aucun `GIT_DIR`, aucun `GIT_WORK_TREE`, aucun `--write-tree`** ; aucun commit, `add`, `stash` ni
  workflow (R-20).
- **Écritures du worktree** : les trois fichiers du lot et ce journal, par l'outil d'édition (remplacement exact et unique) et par
  ajout en heredoc cité, sans barre inverse ; aucun autre fichier (état final : §19.11).
- **E-C-1** (`error_origin` = correcteur) : un `node -e` de lecture JSON (`F:/tmp/dojo/pr1b4/mutants2/RESULTS.json` du G1 : lignes
  M-D3, M-D4, M-D6, N11) vers 01:40Z, pendant le verrou tenu depuis 01:36:28Z (oracle G2 d'un autre lot, pid 75104), relevé après coup
  à 01:40:55Z ; environ une seconde ; ni test, ni harnais, ni contrôle statique. Remède : tout lancement suivant derrière la porte.
- **E-C-2** (correcteur) : cinq lectures JSON courtes par `node -e` hors porte : `held(F:/tmp)` vers 01:57:4xZ, les deux
  `RESULTS.json` vers 01:59:4xZ et 02:01:0xZ (chacune encadrée par des relevés libres de la porte : 01:57:48Z, 02:00:12Z, 02:01:31Z),
  puis l'enregistrement de mon oracle, deux fois, vers 02:10:4xZ et 02:10:5xZ, après la fin de sa course (verrou relevé absent juste
  avant la première ; porte libre ensuite à 02:12:29Z). Lectures seules, sans test, harnais ni contrôle statique ; rien à réexécuter.
- **E-C-3** (correcteur) : huit `node -e` de comptage de longueurs de lignes sur mes brouillons (02:08:5xZ), pendant la suite de MON
  oracle sous son verrou ; ni test, ni harnais, ni contrôle statique ; la suite de l'oracle, lue dans son enregistrement : §19.6.
  Ensuite, plus aucun lancement `node` jusqu'à la fin de l'oracle (comptages par `awk`).
- **Réseau** : boucle locale `127.0.0.1` seule (serveurs des tests) ; aucune URL hors boucle locale n'a atteint `fetch`.
- **C:** : rien écrit ; TEMP, TMP et TMPDIR sous `F:/tmp/dojo/pr1b4-corr/tmp` à chaque lancement.
- **Advisor intégré** : consulté après l'orientation, avant toute écriture (écart C-G2-3 déclaré avec témoin mesuré ; nombre de lignes
  du module constant et contrôle d'ancres ; correction en place du §15 avec citation du gel 1 ; séquence sous verrou et porte ;
  mémoire virtuelle ; rangs CORR ; tirage du F2P ; pré-mesure R-25 ; transport) : tous retenus, chacun vérifié sur pièce ; conseil,
  jamais verdict. Seconde consultation avant la remise : §19.11.

| Date | Objet | Modèle (identifiant résolu) | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-30 | corrections post-G2 | `claude-opus-5-5` | max | mission, règles, §19 | correcteur | orchestrateur, cp-2 | gel 1 : PRÊT POUR CORRECTIONS |

### 19.11 Remise

- **Jonctions** : `gel/node_modules` (`mk-nm.ps1`), `base/node_modules`, `mutants/node_modules` et `mutants-lit/node_modules` (une
  jonction chacune) retirées par `rm-nm.ps1` de 02:11:09Z à 02:11:15Z (`rm-nm.out` `a335f980…f410`), absence vérifiée ;
  `F:/Monark/node_modules` intact (220 entrées, 10 `@monark`, `typescript` présent) ; aucun dossier de course de mon oracle ne reste.
- **État du worktree** : HEAD `381de4fd` inchangé ; `status --porcelain` = ` M` pour `apps/dojo/scripts/dojo-verify.mjs`,
  `apps/dojo/test/dojo-verify.test.ts`, `test/dojo-verify-url.test.ts` et ce journal ; tronc `F:/Monark` à `70239e3a` à 02:17:22Z
  (trois commits de documents depuis l'ouverture : registres, un FAITS Caddy ; outils aux mêmes sha256), rien écrit de ma main.
- **Livrables** : `F:/tmp/dojo/pr1b4-corr-deliver/REPONSE.md` et `DELIVERED.sha256` (format `sha256sum` pur, Q-C-4) ; le sha256 de ce
  journal est rendu hors du fichier. Trois lignes du sceau dépassent 160 caractères (l'enregistrement de l'oracle, son `09-test.log`,
  son `02-r25.log` : chemin absolu de plus de 110 caractères plus le sha256), déclarées et gardées telles quelles, comme au G1 (§18).
- **Garde d'octets de `REPONSE.md`** (`scratch/byteguard.mjs`, derrière la porte, sortie `byteguard-deliver.out`) : UTF-8 strict,
  0 point de contrôle, LF final, aucune ligne de plus de 160 caractères.
- **Seconde consultation de l'advisor intégré** (02:13Z-02:16Z), sur la remise rendue durable (`REPONSE.md` `82efbb16…8a28`, sceau
  `d50aa39d…ea8e`, 39 OK) : quatre points, tous appliqués avant le rescellement : (1) cette ligne et l'heure du compte au titre du
  §19.1 ; (2) les trois lignes longues du sceau déclarées ; (3) garde d'octets de `REPONSE.md` ; (4) E-C-2 recompté à cinq lectures
  JSON (deux après la fin de mon oracle). Conseil, jamais verdict ; chaque point vérifié sur pièce.
- **Verdict proposé : LIVRE-AVEC-RESERVES** : Q-C-1 à ratifier (écart à la lettre de C-G2-3, mesuré nécessaire) ; Q-C-2 (pli de l'ADR
  §4 au G7) ; écarts E-C-1 à E-C-3 (§19.10) ; ce journal changé après le lancement de l'oracle (documents seuls).
