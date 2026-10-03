# G0 du lot CM-2a : codes d'erreur stables (S-6), sortie HTTP validée (S-15), `produced_at` (S-10, P5(b)), commentaires périmés

- **ADR** : `docs/adr/ADR-CM-chantier-moteur-audit-P3.md` (ACCEPTÉ 2026-10-03), partie CM-2, découpage de l'amendement daté « (nuit, 2) : plan de CM-2 » : CM-2a = S-6, S-15/B-6, S-10/B-4, STALE-COMMENTS-1. Lignes du §5 : **B-3** (étendu à MCP), **B-4** (précisé), **B-6**. Aucune autre ligne B.
- **Base** : `ff06ead` (branche `recherches/cm-2a`, sur la base du chantier avec CM-1). Auteur : RECHERCHES.
- **Points** : S-6 de l'audit P3 (`http.ts:101-102`, `gate.ts:255-260` à la base : les « 400 nommés » ne sont que du texte libre) ; S-15 (`http.ts:97-98` : le miroir HTTP ne valide pas sa sortie) ; S-10, partie harnais, et P5(b) (`runGate` en appel direct accepte un `produced_at` non RFC 3339 ; 2099 rend `commit`) ; STALE-COMMENTS-1 (§10).

## Règles

### S-6 / B-3 : code d'erreur stable

1. `HarnessToolError(message, code)` : `code` est obligatoire et tiré d'une liste fermée `HARNESS_ERROR_CODES` (type `HarnessErrorCode`, en snake_case), dans `gate.ts`, hors contrat gelé (ni `schemas/**`, ni `packages/contracts/**`).
2. Codes des chemins existants : `param_invalid`, `schema_version_unsupported`, `byo_calibration_invalid`, `byo_yhat_type`, `byo_set_tau_cap`, `yhat_type_mismatch`, `liq_yhat_domain`, `attested_inconsistent`, `task_class_unknown`, `byo_overrides_committed` ; de CM-1 : `byo_edge_blank`, `byo_lookalike_committed`, `byo_reserved_kata` ; de CM-2a : `produced_at_invalid`, `produced_at_future`, `output_invalid`.
3. Les quatre autres classes d'erreur du harnais portent un code par défaut, par classe : `attest_refused` (`AttestToolError`), `calibrate_input_invalid` (`CalibrateToolError`), `cascade_input_invalid` (`CascadeToolError`), `ukemi_predict_input_invalid` (`UkemiPredictToolError`, outil non enregistré).
4. Réservés pour CM-2b, dans la liste mais jamais levés en CM-2a : `task_class_retired`. **Écart** (voir plus bas) : `policy_alpha_mismatch` et `policy_nmin_mismatch` sont déjà levés par les deux 400 liq existants (α et nMin imposés).
5. HTTP : le corps d'un refus devient `{error:"tool_error", operation, message, code}` (mêmes clés, même ordre, `code` ajouté en dernier) ; statut 400 inchangé ; `message` inchangé octet pour octet (les messages liq compris).
6. MCP : un refus reste un résultat `isError: true` dont le premier contenu est **identique octet pour octet** au texte d'aujourd'hui (le message de l'erreur, tel que le SDK le rend), plus `_meta: {"monarkgate.tech/error_code": code}`. Toute autre exception suit le chemin du SDK, inchangé.

### S-15 / B-6 : sortie HTTP validée

Le miroir HTTP valide `structuredContent` contre `outputStandardSchema` de l'outil (le même que la frontière MCP) avant de répondre. Une sortie invalide rend `500` `{error:"internal_error", operation, code:"output_invalid"}`, sans détail de validation. `openapi.json` n'est pas modifié (le 500 n'y est pas décrit ; empreintes inchangées).

### S-10 / B-4 : `produced_at`

1. `runGate` refuse en 400 `produced_at_invalid` tout `produced_at` qui n'est pas une date-heure RFC 3339 stricte (§5.6) : `AAAA-MM-JJ`, séparateur `T` ou `t`, `hh:mm:ss`, fraction facultative, décalage `Z`, `z` ou `±hh:mm` ; date calendaire réelle (années bissextiles comprises : 2024-02-29 et 2000-02-29 valides, 2026-02-29 et 1900-02-29 refusés), heure 00 à 23, minute 00 à 59, seconde 00 à 59, ou 60 seulement quand l'heure UTC (décalage appliqué) est 23:59 (seconde intercalaire, comme le format `date-time` d'ajv au servi), décalage au plus 23:59 ; contrôle par aller-retour dans une date UTC. Ferme P5(b) sur appel direct.
2. « Pas dans le futur » aux seuls points d'entrée HTTP et MCP : un instant postérieur à l'horloge du serveur de plus de `PRODUCED_AT_FUTURE_TOLERANCE_MS` = 300 000 ms (300 s) rend 400 `produced_at_future` ; à 300 s pile, accepté. La fraction compte en millisecondes (ses trois premiers chiffres, tronqués) : +300,000 s est accepté, +300,001 s refusé. L'instant courant est lu dans `src/` (`http.ts`, `server.ts`), jamais sous `src/tools/` (K-8), et injecté : `tool.run(args, { nowMs })` puis `runGate(prediction, params, attested, { nowMs })`. **Un appel direct de `runGate` sans `nowMs` ne fait que le contrôle RFC 3339** (déclaré ; épinglé par un test).
3. Ordre : après `validateHarnessParams` et le contrôle de `schema_version`, avant les gardes BYO, `attested` et la répartition. Une requête invalide sur deux points peut changer de message ; 400 reste 400 (amendement « nuit, 2 »).
4. Aucune grille de barres pour USDe, liq, cascade et le BYO (B-4 précisé).
5. **Périmètre** : le seul outil `gate`. L'outil `cascade` (`producedAt`, motif `cascade.ts:119`, contrôle de forme seulement) et `ukemi-predict` (non enregistré) restent hors périmètre : ni contrôle calendaire ni « pas dans le futur » (déclaré ; leur sortie n'est pas une décision).

### STALE-COMMENTS-1

Les commentaires « empty -2a registry » de `gate.ts` (lignes 75, 600, 629, 741, 792 de la base `404480e8` ; 75-77, 600-602, 630-631, 772-774, 830 à `ff06ead`) sont réécrits pour dire l'état commis : le registre liq porte la strate s0 (n = 170) ; s1 à s3 restent `under_calib`. Commentaires seulement.

## Différences servies (liste fermée de CM-2a)

- **B-3** : le corps d'erreur HTTP gagne `code` ; le résultat d'erreur MCP gagne `_meta` (texte inchangé).
- **B-4** : un `produced_at` non RFC 3339 strict rend 400 `produced_at_invalid`. Au servi, la frontière (ajv, `format: date-time`) refusait déjà « yesterday » et 2026-02-29, mais acceptait l'espace comme séparateur, le décalage sans deux-points (`+0100`) ou sans minutes (`+01`) : ces formes rendent désormais 400 (mesuré à la base). Un `produced_at` à plus de 300 s dans le futur rend 400 `produced_at_future` (2099 rendait `commit`).
- **B-6** : une sortie HTTP invalide rend 500 `output_invalid` (aucune sortie servie aujourd'hui n'est invalide : la frontière MCP la validait déjà).
- Partout ailleurs, verdicts et corps identiques octet pour octet ; la description du service et `openapi.json` ne changent pas.

## Tests (rouges à la base par échec d'assertion)

Deux fichiers neufs, `apps/harness/test/error-code.test.ts` et `apps/harness/test/gate-produced-at.test.ts`. Chaque test de premier niveau a un seul tueur en forme fermée `// killer: <fichier>:<ligne> <OP> "<avant>" -> "<après>"` (`scripts/red-proof.mjs`). Les épingles (ce qui ne change pas) vivent dans les tests F2P, puisque l'outil refuse un test vert à la base. Les noms neufs du code sont lus par un import d'espace de noms ou des conversions de type, pour que la base charge les fichiers et rougisse par assertion (jamais par import).

- E-1 `harness_error_codes_are_a_closed_pinned_list` : la liste exacte des codes, dans l'ordre ;
- E-2 `every_harness_tool_error_names_a_code` : lecture des sources de `apps/harness/src` : chaque `new HarnessToolError(` porte un second argument, et tout littéral est un code de la liste (tueur : CONST qui retire le code de l'appel de nMin ; la forme SDL d'abord écrite était mort-née, elle effaçait la ligne entière et le scan voyait un site de moins) ;
- E-3 `gate_refusals_carry_their_code` : un appel direct de `runGate` par chemin de refus, code attendu ; les quatre messages liq épinglés octet pour octet ; plus `byo_yhat_type` (set, yhat nombre), `byo_calibration_invalid` (set sans candidats), `yhat_type_mismatch` (USDe, yhat texte) et `attest_refused` (verdict Shōgen nié) ;
- E-4 `http_tool_error_body_carries_the_code` : corps exact (texte JSON) des refus HTTP, `gate` (dont USDe et deux cas BYO set), `calibrate` et `cascade` ;
- E-5 `mcp_tool_error_keeps_its_text_and_adds_the_code` : le texte d'aujourd'hui épinglé (premier contenu égal au message), `isError`, `_meta` ;
- E-6 `http_mirror_validates_its_output` : une sortie corrompue (descripteur remplacé le temps du test, restauré) rend 500 `output_invalid` ; la sortie normale reste 200 ;
- P-1 `run_gate_refuses_a_non_rfc3339_produced_at` : formes refusées et acceptées (bissextiles, seconde 60 à 23:59 UTC seulement, décalage 23:59, `t`/`z`, fraction, `-00:00`) en appel direct, sur btc-dir et sur les chemins BYO interval, USDe et liq (btc-dir est retirée en CM-2b) ;
- P-2 `produced_at_in_the_future_is_refused_at_http_and_mcp` : horloge injectée, +300 s accepté, +301 s et +300,001 s refusés (HTTP), 2099 refusé (HTTP et MCP, et en HTTP sur les chemins BYO, USDe et liq), et 2099 décidé en appel direct sans `nowMs` (épingle déclarée).

Tests existants : aucun n'attend un corps d'erreur complet ; aucun n'est modifié dans son corps. `registry.test.ts` : la liste `FORBIDDEN` du scan K-8 de `src/tools/` gagne la lecture d'horloge (`Date.now(`, `new Date()`, `performance.now(`) ; le test reste vert (G2, correction 5). Les tueurs des tests hérités qui visent `gate.ts` (`gate-byo-lookalike`, `gate-byo-tau-cap`, `gate-empty-set`, `oracle-fixtures`) sont ré-ancrés sur les lignes décalées (ligne tueuse seulement). Le tueur de `oracle-fixtures.test.ts` (`gate.ts:488`) était déjà périmé à la base (la ligne 488 de `ff06ead` ne porte pas `labels.length > params.tau`) : il est ré-ancré sur la ligne de `btcDirVerdict` qu'il visait.

## Écarts au dessin de l'advisor

- `policy_alpha_mismatch` et `policy_nmin_mismatch` sont levés dès CM-2a par les 400 liq d'α et de nMin imposés (messages inchangés), au lieu de `param_invalid` : la ligne F-7 de liq (« imposé (déjà) ») est déjà une politique ; donner `param_invalid` puis changer de code en CM-2b romprait la stabilité promise par B-3. Seul `task_class_retired` reste réservé.
- Les codes par défaut des quatre autres classes sont dans la même liste fermée (une seule énumération épinglée).
- La seconde 60 n'est acceptée qu'à 23:59 UTC (consigne « 00-60 s » resserrée par la G2, correction 6), alignée sur la frontière ajv servie.

## Taille et sortie

Code : `gate.ts`, `http.ts`, `server.ts`, `tools/registry.ts`, et une ligne de code par classe dans `attest.ts`, `calibrate.ts`, `cascade.ts`, `ukemi-predict.ts` ; tests : deux fichiers neufs, et une ligne de `registry.test.ts`. Une PR, R-25 sous 1 150. Oracle : `npx tsc --noEmit`, eslint sur les fichiers changés, `npm run gate:vocab`, `npm run lint:ratchet`, `npm test` (seul échec toléré : `bell-served.test.ts:153` dans un clone superficiel), `scripts/red-proof.mjs --base ff06ead --gel <sha> --draw 8 --seed 7`. Revue G2 par une instance neuve, puis G7 ; déploiement par MONARK sur le sha donné, après le go de l'investisseur.

## Item ouvert

**OPENAPI-ERROR-CODE-1** : `openapi.json` ne décrit ni le champ `code` du corps d'erreur 400, ni le 500 `output_invalid`. Laissé à un lot ultérieur (il déplacerait l'empreinte d'`openapi.json`) ; aucun changement servi ici. Propriétaire : RECHERCHES ; déclencheur : un lot qui touche `openapi.ts`.

## Mesures (gel `c7c9c4e`, après la G2)

R-25 : 15 fichiers, +627/−73, soit 700 lignes (docs exclus). Tests : harnais 115 → 123 ; `npm test` 1 940 à la base (1 916 verts, 22 ignorés, 2 échecs : `bell-served.test.ts:153` et le test 42 d'export, dont la CI exportée a rougi sur `sentinel_run_releases_chainstack_lock_on_sigterm`, instable) → 1 951 (1 928 verts, 22 ignorés, 1 échec : `bell-served.test.ts:153`). `red-proof --base ff06ead --gel c7c9c4e --draw 8 --seed 7` : OK, 8 jugés F2P, 8 tueurs tirés, 8 tués. Correction de la G2 : le premier rapport disait les trois tueurs non tirés « vérifiés à la main, tués » ; c'était faux pour E-2, car la vérification à la main retirait la sous-chaîne au lieu d'effacer la ligne comme le fait SDL ; ce tueur était mort-né et il est remplacé.
