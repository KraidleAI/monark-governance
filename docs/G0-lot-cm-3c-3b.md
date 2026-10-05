# G0 du lot CM-3c-3b (contrat 1.1.0, bloc C, second lot de la PR C2) : le harnais

- **G0 du bloc** : `docs/G0-bloc-c-cm-3c-2.md` (section 3.3, lot 3c-3b ; sections 4, 5, 7, 9, 13, 14). **G0 et G7 de 3c-3a** : `docs/G0-lot-cm-3c-3a.md`, `docs/G7-lot-cm-3c-3a.md` (« Notes pour 3c-3b », liste rouge fermée de 59, écarts 1 et 2, tueur de `served-replay-cm3` à tirer à la main). G7 de C1 : `docs/G7-lot-cm-3c-2.md` (coupe nommée : la projection passe en 3c-3b). Ce G0 court reprend le lot 3c-3b seul. Il ne remplace aucune décision du G0 du bloc.
- **Sources lues** (`recherches`, branche de coordination à `b70eaca`) :
  - messages de MONARK : `2026-10-05-MONARK-vers-RECHERCHES-3c-3a.md` (Q-3a-1 à Q-3a-7), `…-3c-3a-gel.md` (Q-3a-8 : candidat (a), mesuré ici ; Q-3a-9, Q-3a-10), `…-D7-duodecies.md` (zone ouverte sur les deux lignes d'export jusqu'à la fusion de C2), `…-synchro-r25.md` (pas de synchro du tronc avant C2) ;
  - message de RECHERCHES `2026-10-05-RECHERCHES-vers-MONARK-3c-3a-gel.md` (C2 réestimée à ~1 265) ;
  - ligne Z-3 de MONARK au journal du tronc (`docs/JOURNAL-PROVENANCE.md`, entrée « 2026-10-05 00:4x UTC », lue sur `origin/lot/etude-suite`) : textes des trois tables = les cinq phrases servies, à l'octet ;
  - décision C-11 condition 2 (`…/2026-10-04-CM-4b-avis/DECISION-CM-4b-C1-C11.md`, l.226).
- **Base et branche** :
  - `origin/base/chantier-moteur-2026-10-03` = **`0542cfca`** (refetchée ; elle porte D7 duodecies d'ADR-M004) ;
  - branche `recherches/cm-3c-3b`, partie de `origin/recherches/cm-3c-3a` = `cbf2ca26`, arbre `/home/user/monark-governance-c2b` ;
  - **base fusionnée par le commit `8dba1a74`** (fusion sans conflit ; seul `docs/adr/ADR-M004-infrastructure-plateforme.md` change, hors R-25) ;
  - contrôle : `r25()` de la branche contre `5a491fa6` et contre `0542cfca` = 510 (le lot 3c-3a seul), contre `8dba1a74` = 0.
- **Statut** : G0 écrit **avant tout test et tout code** de la branche. Auteur : RECHERCHES.

## 1. Décisions de cellule appliquées à ce lot

- **Q-3a-8 : troisième coupe = candidat (a).** Le test de composition préfixe + suffixe de Z-3 (Q-C3 condition 5) et la liste fermée de l'écart liq vont en C', avec S-8. Aucun changement servi ne se déplace. **Ce G0 mesure si C2 tient alors sous 1 205** (section 4) ; si (a) ne suffit pas, le lot s'arrête après ce G0 (la coupe (b) est à MONARK).
- **Zone ouverte jusqu'à la fusion de C2** (D7 duodecies) : une ligne de `WHITELIST_FILES` dans `scripts/export-public.mjs` (`"scripts/lib/calib-digest-provenance.mjs"`) et sa ligne dans `docs/PRODUCT-BOUNDARY.md`, sur le modèle de celle de `record-usde-calib.mjs`. Le `.d.mts` reste non exporté, sauf si la mesure montre qu'un TypeScript exporté importe l'outil (section 3, point 5). Preuve : test 42 et `export:check`.
- **Q-3a-2** : parité `KATA_REASONS` ⊆ `COVERAGE_REASONS` dans `apps/harness/test/kata-path.test.ts`.
- **Pas de synchro du tronc avant C2** ; #142 n'est pas sur la base : le G7 relève le compte exact de chaque passage complet, sans chasser une baisse de compte à 0 échec.
- **Coupes déjà prises** (Q-3a-5) : corps 400 avec `code` (et la sortie de `input_invalid` et `json_invalid` de `PENDING`, même commit, C-3 condition 3) en C' ; `apps/harness/README.md` et `fixtures/PROVENANCE-*.md` à T0.

## 2. Périmètre de 3c-3b après les coupes

Repris du G0 du bloc (section 3.3) et des « Notes pour 3c-3b » du G7 de 3c-3a :

1. **Le harnais se recharge et se type** : `calibration.ts:16` et `tools/calibrate.ts:27` quittent `calibDigest` ; `cell` sur chaque `buildVerdict`, `underCalibVerdict` et `conformInterval` ; `labelSchema` retiré (écart 2 de 3c-3a) ; `requestSha256` sur chaque `GateInput`, calculé sur l'enveloppe reçue (écart 1), avec un test rouge qui attrape son oubli ; `gate.ts:62` lit `SCHEMA_VERSION` de `@monark/contracts` ; `tools/ukemi-predict.ts:33` aussi.
2. **Verdicts 1.1.0 sur les quatre chemins** : BYO (`qhat_unit` du mode, Q-C1 ; `scale`, `cell_key`, `policy_row_sha256`, `policy_table_sha256` nuls) ; USDe, liq, cascade (clé recherchée, ligne courante si elle existe, empreinte de la table de la classe).
3. **Les trois tables servies** (Q-C3) : module neuf `apps/harness/src/policy-served.ts` (`servedMarginalTables`), importé par `gate.ts`, appelé par `servedPolicyTables` ; textes de la ligne Z-3 en un seul paramètre.
4. **B-17** : `calibrate` rend `scores_sha256` à la place de `set_digest` ; jeton `scores_sha256=` des deux lignes de résumé ; `schema-projection.ts`, `tools/registry.ts`.
5. **Q-C2** : refus I-JSON nommé (400 `param_invalid`) au calcul de `request_sha256`, après tous les contrôles existants. Message du refus 1.0.0 (Q-F2).
6. **Tests** : renommages de champs ; `numeric_under_calib_region_is_not_directional` inversé et commentaire de `packages/hikae/src/region.ts:27-34` ; boucle d'audit à trois égalités ; permutation de `calibrate.test.ts:110` inversée ; tests de format servi (section 5 du G0 du bloc, hors ligne du `code` coupée) ; `served-replay-cm3` remplacé par la projection ; parité kata ; `lint:ratchet` revient à 69.
7. **Liste rouge fermée** réduite à ce que 3c-3c possède (lecteurs du format du site, épingles et instantanés, `atelier`, tests racine), écrite au G7.
8. **Export** : les deux lignes de la zone D7 duodecies.

## 3. Mesure au code (prototype hors commit)

Pour ne pas s'en tenir à un recensement, le code de `apps/harness/src/` du point 1 au point 4 a été écrit dans l'arbre, mesuré, puis retiré (`git checkout`) ; **rien n'est commité**. Le correctif est gardé hors du dépôt, dans le scratchpad de la session (`cm-3c-3b-src-prototype.patch`).

1. **R-25 mesuré des sources, sans les tests** : **225** (+130 / −95), sur huit fichiers : `tools/gate.ts` 86, `calibration.ts` 45, `policy-served.ts` (neuf) 30, `tools/calibrate.ts` 26, `kata-path.ts` 24, `schema-projection.ts` 8, `tools/ukemi-predict.ts` 4, `tools/registry.ts` 2. Il manque encore : le message Q-F2, l'en-tête et le commentaire C-3 de `gate.ts`, le commentaire de `region.ts`, la ligne d'export (~17). **Sources ≈ 242.**
2. **Le harnais se charge et `tsc` passe sur `apps/harness/src/`** avec ce prototype. Les tests du harnais lancés seuls : 158 tests, **140 verts, 18 rouges** (six fichiers ne se chargent pas, `calibDigest` importé du paquet par les tests ; le reste : renommages, `region` nulle, liste des modules servis, forme de `servedPolicyTables`, empreinte de `served-replay-cm3`).
3. **Tests existants à toucher, recensés à ce prototype** : 53 lignes portent une erreur `tsc` dans `apps/harness/test/` ; 64 lignes nomment `calib_digest`, `set_digest` ou `calibDigest` ; avec les échecs à l'exécution, environ 85 à 95 lignes distinctes. **Environ 175** lignes R-25 (une ligne changée compte deux fois).
4. **Tests neufs** (recensement) : `request_sha256` en HTTP et MCP, avec et sans `attested`, égal à `canonicalJson(JSON.parse(corps))`, et le test rouge de l'oubli (~15) ; `scores_sha256` USDe dans l'ordre `time` (~5) ; champs de case des quatre chemins et tueur de la clé liq (~15) ; Q-C1, quatre verdicts BYO (~10) ; Q-C2, cinq vecteurs en HTTP et en MCP, refus existants gardés, trois paires de même empreinte (~30) ; LIQ-BAND-EXACT-GUARD-1 au chargement servi (~8) ; boucle d'audit, permutation, inversion de `numeric_under_calib…` (~14) ; parité kata (~4) ; projection (~20) ; Q-C3, modules servis et parité (~8). **Environ 130.**
5. **Export du `.d.mts`** : `apps/harness/test/` est exporté et typé par la CI du miroir. `usde-calibration.test.ts` (exporté) garde l'oracle C5 de l'épingle USDe (« la valeur épinglée est `calibDigest(scores)` ») ; sans `calibDigest` dans le paquet, il doit importer l'outil, donc **`scripts/lib/calib-digest-provenance.d.mts` devrait entrer dans `WHITELIST_FILES`**. `calibration-liq.test.ts` et `gate-liq-artifact.test.ts` sont exclus de l'export. À confirmer au code du lot, et à dire au G7.
6. **Note du G7 de 3c-3a, mesurée** (verdict servi à raison sans région qui porterait une région) : projection indépendante de la version (`action`, `reason`, région « aucune » ou bornes, `qhat`, `n_calib`, `alpha`) des 111 appels de `served-replay-cm3`, lancée sur la base `5a491fa6` (copie par `git archive`) et sur le prototype : **même empreinte, `09c32399…f4dc`, des deux côtés**. Répartition des verdicts : 100 `covered` avec région, 3 `set_too_large` avec région, 4 `under_calib` sans région. Au code, le harnais n'écrit jamais `non_evaluable` ni `upstream_timeout` comme raison de **verdict** : `non_evaluable` naît de `evaluable = false`, garde de décision placée avant l'étape 4, et `timedOut` vaut toujours `false`. **Aucune décision servie ne change** par l'étape 4.

## 4. R-25 : C2 tient-elle sous 1 205 avec la coupe (a) ?

| Poste | Lignes |
|---|---|
| 3c-3a (mesuré, `r25()` contre `5a491fa6`) | 510 |
| 3c-3b : sources (mesuré 225, plus ~17) | ~242 |
| 3c-3b : tests existants (recensés au prototype) | ~175 |
| 3c-3b : tests neufs | ~130 |
| **3c-3b** | **~545** |
| 3c-3c (estimation du G7 de 3c-3a, moins la coupe T0 de ~15) | ~285 |
| coupe (a) : test de composition Z-3 et liste de l'écart liq, vers C' | −~20 (non compté ci-dessus) |
| **C2** | **~1 340** |

- **La coupe (a) ne suffit pas.** C2 se projette à environ **1 340**, environ **135** au-dessus de 1 205. Le candidat (b) (conversion I-JSON et ses vecteurs vers C', ~35) laisserait encore environ 1 305.
- **3c-3b seul (~545) touche la borne de lot (547).** Si C2 garde ce contenu, 3c-3b se coupe en deux lots (sources et tests existants, puis tests neufs), sous une même PR.
- Écart au G7 de 3c-3a (~515 pour 3c-3b) : les sources mesurent ~242 au lieu de ~170 (`calibration.ts` 45 au lieu de ~20, `policy-served.ts` et son appel dans `kata-path.ts` 54, à coût non constant parce que la forme du paramètre change), et les tests existants ~175.
- Incertitude : ±10 % sur 3c-3b (sources mesurées, tests recensés au prototype) ; 3c-3c n'est pas remesurée ici (3c-3a a mesuré +19 % sur son G0).

**Conséquence, selon la consigne de la cellule : le lot s'arrête après ce G0.** Aucun test rouge, aucun code, aucune ligne d'export n'est commité. La suite attend la réponse de MONARK (Q-3b-1).

## 5. Écarts au G0 du bloc relevés par le prototype (pour la reprise)

1. **Épingles de `calibration.ts`** : le bloc des strates liq est **généré** par `scripts/emit-u4b-calibration.mjs` (épingle C5 `e7e67366…`, vérifiée octet pour octet par `u4b_committed_registry_equals_generator_output`), et l'émetteur est hors zone depuis la fusion de C1. Le serveur ne peut pas importer l'outil de provenance : l'arbre déployé ne contient que `apps`, `packages`, `schemas`, `fixtures` et `scripts/verify-harness.mjs` (`docs/RUNBOOK-harness.md`, étape 1). **Défaut proposé** : les épingles C5 restent des épingles de provenance (`digestPinned`, `USDE_STABLE_RUN_CALIB_DIGEST_PINNED`), vérifiées par les tests au moyen de l'outil ; la garde de chargement passe sur `scoresSha256` dans l'ordre stocké, avec des épingles neuves hors du bloc généré : USDe `e44a68b6…cfd28` (égale au sha256 de `fixtures/usde-calib-scores.json`), liq s0 `a9277222…6ee3c8` ; btc-dir (retiré) `bb438031…73afd6`. Le test de dérive par strate (`u4b_calib_registry_digest_guard_per_stratum`, mode `digest`) vise alors l'épingle neuve.
2. **Forme du paramètre des tables** : `ServedTableTexts.marginal` devient une fonction de la classe, parce que USDe et liq n'ont ni la même source ni le même texte de ligne. Les tests de `kata-path` passent une fonction constante ; l'empreinte synthétique `d32cf528…` ne change pas (preuve du déplacement, Q-C3).
3. **Valeurs de `source`** (Z-3 : « provenance déjà publique ») : USDe `fixtures/usde-calib-scores.json` (`e44a68b6…`, déjà versée dans `PROVENANCE-usde.md`), générateur `scripts/record-usde-calib.mjs` ; liq `apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-weth-2025-09-22.jsonl` (`fd6fab7e…`, déjà dans le texte de provenance servi), générateur `scripts/record-u4b-calib.mjs`. Textes de classe : USDe, liq et cascade, les phrases « sans calibration » ; textes de ligne : les phrases engagées.
4. **Ligne de résumé de `gate`** : une région nulle s'écrit `region=null` (comme `qhat=null`), à la place de `region={}` (ensemble vide). C'est la suite de la ligne 1 de la section 4 du bloc (région nulle à la place de l'ensemble vide), dans le texte `content`.
5. **Test de l'empreinte de 63 caractères (C-11 condition 2)** : il exige `code: "input_invalid"` dans le corps HTTP, que la coupe déjà prise envoie en C'. Défaut : il suit la coupe en C'.
6. **Valeurs numériques servies** (`qhat`, `n_calib`, `alpha`) : calculées, comme aujourd'hui, depuis les scores de `calibration.ts`, d'où la ligne de table est construite et gardée au chargement ; la ligne fournit les champs de case. La projection (section 3, point 6) montre que les décisions servies ne bougent pas.

## 6. Questions pour MONARK

- **Q-3b-1 (R-25 de C2, bloquante).** Avec les coupes déjà prises et la coupe (a), C2 se projette à ~1 340 (3c-3b mesuré au prototype, section 4). (a) et (b) ensemble laissent ~1 305. Choix :
  1. une exception R-25 bornée pour la PR C2 (par exemple 1 400), au motif de la bascule atomique (Q-M2 : 3c-3a et 3c-3b ne peuvent pas être verts seuls) ; **avis de RECHERCHES** ;
  2. ou d'autres coupes vers C' que tu nommes, sans octet servi : (b), puis LIQ-BAND-EXACT-GUARD-1 au chargement servi (~8), les quatre verdicts BYO de Q-C1 (~10). Leur somme reste sous ~60, ce qui ne suffit pas ;
  3. ou une PR C2 en deux, refusée par Q-3a-5 et non recommandée : la première laisserait la base rouge.
  Dans les cas 1 et 2, 3c-3b se coupe en deux lots sous la borne de 547.
- **Q-3b-2 (épingles de `calibration.ts`, section 5 point 1).** C5 gardé en provenance, garde de chargement par `scoresSha256`, épingles neuves hors du bloc généré. Défaut : oui.
- **Q-3b-3 (`.d.mts`, section 3 point 5).** `scripts/lib/calib-digest-provenance.d.mts` dans `WHITELIST_FILES` si un test exporté du harnais importe l'outil. Ton message le permet si la mesure le montre ; la mesure le montre pour `usde-calibration.test.ts`. Défaut : l'ajouter dans la même zone, et le dire au G7.
- **Q-3b-4 (`source` des trois tables, section 5 point 3).** Défaut : les valeurs ci-dessus.
- **Q-3b-5 (test de 63 caractères, section 5 point 5).** Défaut : en C', avec le `code` des corps 400.
