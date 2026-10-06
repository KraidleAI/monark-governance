# G7 du lot D-2 (bloc D, contrat 1.1.0) : le chemin kata servi (B-9 précisée, B-15), textes de classe et clause kata

- **Plan** :
  - `docs/G0-bloc-d.md` : §2.1, §3, §4.2, §6, Q-D1 à Q-D9 ;
  - G0 court `docs/G0-bloc-d-2-empreintes.md` : les empreintes pour la ligne Z-3.
- **Décisions** :
  - go du fondateur Q-D1 : ligne datée (11) de l'ADR-CM, base `c01b87d7` ;
  - réponses de MONARK à Q-D2 à Q-D9 ;
  - textes approuvés tels quels (`recherches` `d6b26c0`), à deux conditions : (a) les valeurs de la clause sont interpolées ; (b) `honestyText` lit les tables kata ;
  - **ligne Z-3 du bloc D écrite par MONARK** (journal du tronc `ebcbad15`) ;
  - zone ouverte sur `fixtures/h5-e2e-trace.json` et `fixtures/PROVENANCE-h5-e2e-trace.md` jusqu'à la fusion de D-2. Seul le `response_sha256` de `tools/list` bouge, plus ses quatre épingles.
- **Base** : `origin/base/chantier-moteur-2026-10-03` = `a9af2e04` (D-1 entré par #169, #168 TRANSPORT-500-SCHEMA-1 avant lui). Refetchée au pli : inchangée.
- **Commits** sur la branche `recherches/bloc-d` (une PR par lot ; celle-ci porte D-2 seul) :
  - `d811e65c`, `2deaf7e8`, `4c7d6631` : fusions de la base (`c01b87d7`, `a8ae38c0`, `a9af2e04`) ;
  - `0b069d34` : tests rouges, avec les lignes de tueurs ré-ancrées au gel ;
  - `655c7a0c`, `111bad27` : G0 court (empreintes) ;
  - `aa151d56`, `5d0b41d3` : lignes de tueurs seulement ;
  - `44afac30` : **gel** ;
  - `672bdd7c` : trace H5 ré-enregistrée, avec ses épingles ;
  - pli de la G2 : `669e724c` (R-1, test), puis `e902014a` (N-1, N-7) ;
  - ce commit (G7).
- **G2** : `recherches:coordination/pieces/2026-10-04-G2-recherches/G2-bloc-d-lot-d-2.md`. Verdict **APPROUVÉ**, aucun bloquant. R-1 est pliée ; les notes sont traitées au §8.

## 1. Ce que le lot change

**`apps/harness/src/tools/gate.ts`** :
- import de `kataPath`, `kataVerdict` et `servedPolicyTables` (`../kata-path.ts`), et de `kataClassEntries` ;
- `PRODUCED_AT_FUTURE_TOLERANCE_MS` est remonté avant `describeGate`, puisque la clause le lit au chargement ;
- `kataClassText(c)` est le gabarit unique des textes de classe ;
- `kataClause()` rend la clause. Ses valeurs sont interpolées : `alpha` et `nMin` par famille depuis `kataClassEntries` (échec au chargement si une famille n'est pas uniforme), 300 s depuis la constante de B-4. La clause entre dans `describeGate` après la clause liq ;
- `RunGateOptions.policyTables` : couture de test (Q-D5) ;
- aiguillage kata : une classe du registre des classes dont la `cell_key_rule` est `kata-bucket`. Il vient après `btc-dir-15m`, cascade, USDe et liq, et avant `task_class_unknown` ;
- `SERVED_POLICY_TABLES = servedPolicyTables(SERVED_TABLE_TEXTS)` : une seule construction. `SERVED_MARGINAL_TABLES` en est une vue, dans l'ordre de `task_class` ;
- `SERVED_TABLE_TEXTS.classText` rend le gabarit kata pour toute classe hors des trois classes marginales ;
- `honestyText` lit `SERVED_POLICY_TABLES` ;
- commentaire C-3 : les 6 codes kata sont lancés depuis D.

**`apps/harness/src/kata-path.ts`** :
- en-tête mis à jour ;
- `KATA_REASONS`, `KataReason` et `KataRegion` retirés, remplacés par `CoverageReason` et `PredictionRegion` ;
- `kataVerdict` assemble le `CoverageVerdict` depuis les champs de la case (Q-D9 ; `hikae` est inchangé).

**`apps/harness/src/tools/registry.ts:58`** : `ToolRunContext = Pick<RunGateOptions, "nowMs">` (N-1).

**Tests** :
- fichier neuf `apps/harness/test/gate-kata-served.test.ts` : T-8 à T-13 et le test de la couture ;
- `kata-path.test.ts` : `kata_path_is_served`, `PENDING` vide, épingle des tables réelles. `kata_reasons_within_coverage_reasons` est retiré : son objet disparaît, et `tsc` le remplace ;
- `policy-guard.test.ts`, `policy-table-file.test.ts`, `gate-cell.test.ts`, `gate-liq.test.ts` : graphe servi, ordre de la vue marginale, description ;
- 67 lignes de tueurs ré-ancrées dans 18 fichiers (lignes de tueurs seulement).

**Données** :
- `apps/site/data/harness-pending.json` et `apps/site/data/manifest.sha256.json` ;
- `fixtures/h5-e2e-trace.json` et `fixtures/PROVENANCE-h5-e2e-trace.md` (zone ouverte).

## 2. Octets servis neufs (Z-3 du bloc D, ligne de MONARK `ebcbad15`)

Le détail et les commandes de recalcul sont dans `docs/G0-bloc-d-2-empreintes.md`. Tout a été remesuré au gel : aucun écart.

- **Textes de classe et tables kata** : le tableau §2 du G0 court donne les 32 textes de table (`no <classe> calibration is committed for this cell_key; the gate abstains and serves no region`), les 32 phrases servies (le texte suivi de `; B_t is caller-carried.`) et les 32 `policy_table_sha256` des tables kata vides.
- **Digest des 35 paires** `[task_class, policy_table_sha256]` : `8da5dd421260d96e4b3dafa48733185b377df64261480aa92cdbeec9b462d2eb`. Il est épinglé par `kata_served_tables_digests` (publié = servi).
- **Clause** : 723 octets, `022756c39c3f3aa381a39f313ebb92236d237d75e770febe3822de047898e803`.
- **Description de `gate`** : 3 971 octets, `dd7287793b229a3e083286ac1a7333f646d3cc3a323071d129bff702c4551ef3` (base : 3 247 octets, `bfb474f3…`).
- **`/openapi.json` en processus** : `de635be9…` (base `a9af2e04`) devient **`61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0`** (29 643 octets).
- **Les 8 messages de refus kata** : champ `message` du corps HTTP, et contenu MCP identique. T-8 les épingle par le sha256 des 8 lignes `<code> <message>` jointes par LF : `0670875ec020ce2ec17a7848073e0195ad6d1d4b247988a638a685da6af44aea`. Les messages des cas de T-8 :

| Code | Message (cas de T-8) |
|---|---|
| `kata_key_invalid` | `prediction.predictor_id "kata:vote4@venue/ETHUSDT/1h" does not match its class 'btc-dir-1h' (SYMBOL starting with 'BTC', <h> '1h') (contract 1.1.0, spec section 9)` |
| `kata_yhat_domain` | `yhat 1.5 is outside the domain of 'btc-dir-1h' (a lean in [-1, 1]) (contract 1.1.0, spec section 9)` |
| `features_digest_required` | `task_class 'btc-dir-1h' requires prediction.features_digest (contract 1.1.0, spec section 9)` |
| `policy_tau_cap` | `task_class 'btc-dir-1h' requires params.tau <= 1, got 1.5 (contract 1.1.0, spec section 9)` |
| `policy_alpha_mismatch` | `task_class 'btc-range-4h' requires params.alpha = 0.01, got 0.02 (contract 1.1.0, spec section 9)` |
| `policy_nmin_mismatch` | `task_class 'btc-range-4h' requires params.nMin = 299, got 300 (contract 1.1.0, spec section 9)` |
| `produced_at_off_grid` | `prediction.produced_at '2026-10-04T05:00:00Z' is not on the 14400000 ms grid of 'btc-range-4h' (contract 1.1.0, spec section 9)` |
| `produced_at_stale` | `prediction.produced_at '2026-10-04T04:00:00Z' is more than 300 s before the server clock (contract 1.1.0, spec section 9)` |

- **Décisions servies** : tout appel kata bien formé s'abstient sans région, avec `under_calib`, ou `non_evaluable` sur un lean `dir` nul. Les tables sont construites sans ligne.

## 3. Ré-épinglages (contre `a9af2e04`)

- `PENDING_BODIES_SHA256["/openapi.json"]` : `de635be9…` → `61c9df97…`. Les trois autres corps ne bougent pas.
- `node scripts/sync-harness-served.mjs --pending` réécrit `harness-pending.json` : seuls `written_at` et `openapi_sha256` changent ; `harness-served.json` est inchangé (`30afbec2…`). L'entrée du manifeste et `PINNED` passent de `cee3c6a0…` à `57cc4eae9b93fff342d0bcd1be4118443bad78cf1c571fb3969faf4211d67894`.
- `node scripts/sync-ukemi-served.mjs --pending` a été lancé puis annulé, car seul `written_at` bougeait : `ukemi-pending.json` et son entrée restent `220c14c9…`.
- **Trace H5**, non prévue au G0. Le G0 du bloc disait au §6 que les traces ne bougeraient pas : c'était faux.
  - Cause : l'étape `tools/list` enregistre la description, qui gagne la clause kata.
  - Un seul champ bouge : `response_sha256`, `afeea267…` → `b419e473…`. La trace fait 22 272 octets avant et après.
  - Elle est ré-enregistrée par `scripts/record-h5-e2e-trace.mjs`.
  - Ses quatre épingles passent de `6242f7d0…` à `57d38c1907bfea4d7cb746186f9bada86bd210358c0a7902a61392957567fc19` : `test/h5-e2e-probe.test.ts:85`, `test/harness-served.test.ts:53`, `apps/site/data/manifest.sha256.json` et `fixtures/PROVENANCE-h5-e2e-trace.md:80`.
  - MONARK a ouvert la zone pour ce seul champ.
- Description épinglée par `hdesc_*` (`gate-liq.test.ts`) : `bfb474f3…` → `dd728779…`.

## 4. Oracle (Node 24.21.0, variables de proxy retirées pour les tests, TMPDIR dans le dossier de travail)

- **red-proof** : `node scripts/red-proof.mjs --base 9d2c9384 --gel b155fac5 --repo . --draw 12 --seed 37`.
  - La base `9d2c9384` est une fusion locale de D-1 et de `a8ae38c0`, sans les tests de D-2. Le gel `b155fac5` a le même arbre que `672bdd7c`, avant le pli.
  - 14 tests jugés : **12 F2P, 12 tueurs tirés, 12 tués**.
  - 2 tests refusés comme « green at base », déclarés : T-11 (`served_kata_order_against_byo_attested_version`) et `guard_modules_are_not_served`. La sortie vaut 1 pour cette seule raison.
  - `RED-PROOF.json` : sha256 `e342a2ad…`.
- **Tueurs tirés à la main** (tous tuent ; fichier restauré après chaque tir) :
  - T-11 : `gate.ts:935 CONST "if (lookAlike !== undefined) {" -> "if (false) {"` ;
  - `guard_modules_are_not_served` : `server.ts:31 CONST "./http.ts" -> "./policy-guard.ts"` ;
  - couture passée par une entrée : `http.ts:102 CONST "{ nowMs: clock() }" -> "{ nowMs: clock(), policyTables: [] }"` ;
  - texte kata qui retombe sur la phrase cascade (condition (b)) : `gate.ts:1035 CONST "kataClassText(c))" -> "CASCADE_UNCALIBRATED_SENTENCE)"` ;
  - pli de R-1 : `kata-path.ts:46 CONST " ms grid of " -> " ms grill of "` rougit T-8 (1 échec).
- **Note N-4** : le tueur de `kata_path_is_served` est `gate.ts:62 CONST "\"../kata-path.ts\";" -> "\"../kata-path.ts?served\";"`.
  - Il n'est vu que par le parcours statique du graphe : le module reste chargé, en seconde instance, sans aucun effet servi.
  - Ce n'est donc pas une preuve de comportement.
  - Supprimer la ligne d'import aurait fait échouer le chargement (tueur « invalid »).
- **Ancres** : `verifie-ancres.mjs . --touched origin/base/chantier-moteur-2026-10-03 HEAD` donne 131 tueurs, 131 ancrés, 0 dérivé, 0 perdu. Sur l'arbre entier, il reste les 8 perdus de la base.
- **R-25** (`r25()` contre `a9af2e04`) : **541** (+409/−132), sous la borne de 547 ; CONTENT_STAT 0. Avant le pli, 535 : R-1 a ajouté 2 lignes, N-1 et N-7 en ont ajouté 4.
- **Tests** :
  - au pli : les tests touchés et la suite harnais (`apps/harness/test/*.test.ts`, `test/h5-e2e-probe`, `test/harness-served`, `test/site-build-fleet`) donnent 299 réussis, 0 échec ;
  - `npm test` complet au gel `672bdd7c` : 2 562 tests, 2 540 réussis, 22 sautés, 0 échec.
- **Contrôles statiques** (au pli) : `tsc --noEmit` 0 ; `eslint .` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK.
- **Site** (au gel) : build sortie 0, `assert-fleet-html.mjs` sortie 0.
- `packages/rpc-guard/bin/rpc-guard.mjs` n'est jamais indexé ; aucun `git add -A`.

## 5. Écarts au G0

- La trace H5 a été ré-enregistrée (§3), ce que le §6 du G0 du bloc ne prévoyait pas.
- T-16 (C-4 de bout en bout) et le cliquet dynamique restent en D-3, comme prévu. La couture qu'ils utiliseront est posée ici.
- La coupe nommée (la moitié MCP de T-8 vers D-3) n'a pas servi : 541 reste sous 547.

## 6. Item formé

- **KATA-CLAUSE-COMMITTED-STATE-1** (MONARK l'inscrit à l'ETAT).
  - La clause kata décrit l'état « registre kata vide » : « which hold no committed calibration row ».
  - Avant le service de la première ligne kata (vague 1), il faudra une clause d'état engagé. Elle sera choisie par la présence au registre, comme pour liq, et aura sa ligne datée Z-3.
  - N-5 et N-6 de la G2 s'y rattachent (§8).

## 7. Reportés en D-3 (fermetures du dernier lot)

- **N-2 (G2 de D-2)** : sous la couture, `honestyText` lit les tables servies. T-16 ne vérifiera que `structuredContent`, ou le déclarera.
- **N-3 (G2 de D-2)** : import à froid de `kata-path.ts` dans un processus enfant. T-7 ne fait qu'un parcours statique ; la G2 a mesuré que les 24 modules se chargent chacun seul.
- **N-5 (G2 de D-2)** : la clause tape encore « tau at most 1 » et la règle `{btc,eth,bnb,sol}-…`. Remède : une constante `KATA_DIR_TAU_CAP`, et la règle tirée des entrées.
- **N-6 (G2 de D-2)** : poser un fil-piège : `kataClause()` échoue si une table kata servie porte une ligne.
- **N-2 (G2 de D-1)** : épingler `m-dir-1h` (refusé comme imitation) et `a-dir-1h` (décide).
- **N-4 (G2 de D-1)** : mesurer la taille du faux refus i/l au G7.
- Cliquet dynamique (C-3 condition 2) et T-16 (C-4 de bout en bout), déjà prévus.

## 8. Points de la G2 et suite donnée

| # | Point | Suite |
|---|---|---|
| R-1 | les 8 messages de refus kata ne sont épinglés nulle part | **plié** : T-8 épingle les 8 messages (sha256 des lignes `<code> <message>`) et vérifie que le contenu MCP égale le message HTTP ; tueur tiré à la main, tué (§4) ; messages listés au §2 |
| N-1 | couture ouverte au typage par `ToolRunContext` | **plié** : `Pick<RunGateOptions, "nowMs">` ; `tsc` 0 |
| N-2 | la couture et `honestyText` lisent des tables différentes | D-3 (T-16) |
| N-3 | chargement à froid absent de T-7 | D-3 |
| N-4 | tueur `?served` vu seulement statiquement | déclaré (§4) |
| N-5 | `tau` et règle des noms tapés dans la clause | D-3, ou KATA-CLAUSE-COMMITTED-STATE-1 |
| N-6 | pas de fil-piège pour l'état engagé | D-3, ou KATA-CLAUSE-COMMITTED-STATE-1 |
| N-7 | textes périmés (en-tête du G0 court, commentaire H5) | **plié** |
