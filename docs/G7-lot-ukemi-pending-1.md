# G7 du lot UKEMI-PENDING-1 (les corps de la CA suivent la version du harnais)

- **Plan** : `docs/G0-lot-ukemi-pending-1.md` (`c5f8fa1e`, puis section 6 en `c7583c02`). Décisions de MONARK sur Q-UP-1 à Q-UP-4 : `recherches` `e9cd32b` (`coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-UKEMI-PENDING-1-Q.md`).
- **Base** : `7a0b1a49` (`base/chantier-moteur-2026-10-03`, fusion de #132). Le G0, mesuré sur `880654ed`, y est rebasé sans conflit. **Gel** : `706e55fc` (branche `recherches/ukemi-pending-1`, non poussée).
- **Commits** : `c5f8fa1e` (G0) ; `c7583c02` (G0, décisions) ; `080ef02b` (tests rouges) ; `706e55fc` (code, gel) ; ce commit (G7).
- **Statut** : code écrit, oracle vert. Reste la G2.

## Ce que le lot change

Zone écrite : trois des fichiers décidés (Q-UP-1). La synchro d'ukemi, son `.d.mts`, le chargeur et `test/site-ukemi.test.ts` ne sont pas touchés (Q-UP-3 reporte l'instantané en attente).
- `scripts/verify-harness.mjs` :
  - `export const CA_SCHEMA_VERSION = "1.0.0"` (l.41), avec deux lignes de commentaire : égale à `SCHEMA_VERSION` de `apps/harness/src/tools/gate.ts`, parité testée ;
  - les quatre corps littéraux (`GATE_BODY`, `GATE_RETIRED_BODY`, `GATE_BYO_BODY`, `GATE_LIQ_BODY`) la lisent. `GATE_FUTURE_BODY` et `GATE_LIQ_UNCOMMITTED_BODY` en dérivent ;
  - le script reste sans dépendance.
- `scripts/sync-harness-served.mjs`, l.68, la seule ligne : la copie de `GATE_LIQ_BODY` lit `GATE_BODY.prediction.schema_version`. `GATE_BODY` y est déjà importé de la CA (l.47), donc la copie suit `CA_SCHEMA_VERSION` sans autre ligne.
- `test/verify-harness-liq.test.ts` :
  - `verify_harness_ca_schema_version_equals_the_harness_schema_version` : `CA_SCHEMA_VERSION === SCHEMA_VERSION`, et `GATE_BODY`, `GATE_LIQ_BODY` la portent. Le script est importé par une URL calculée, car il n'a pas de `.d.mts` et le créer sortirait de la zone ;
  - `verify_harness_ca_bodies_read_the_ca_schema_version` : chaque corps littéral commence par `schema_version: CA_SCHEMA_VERSION`, la CA n'écrit `schema_version` que dans ces quatre corps, et la copie liq de la synchro du harnais lit `GATE_BODY.prediction.schema_version`, seule occurrence de `schema_version` dans ce fichier ;
  - le tueur existant de `verify_harness_ca_passes_on_the_in_process_harness` suit sa ligne, déplacée de trois lignes (`:271` vers `:274`).

## Oracle (Node 24.21.0, variables de proxy retirées, TMPDIR propre)

- `node scripts/red-proof.mjs --base 7a0b1a49 --gel 706e55fc --repo /home/user/monark-governance-ukp --draw 2 --seed 37` : **OK**, 2 tests jugés, **2 F2P**, 3 inchangés, 2 tueurs tirés, **2 tués**. SHA-256 de `RED-PROOF.json` : `29043a02…27c0f7a3`.
  - À la base, les deux tests rougissent par assertion : la constante n'existe pas (`undefined` contre `"1.0.0"`), et chaque corps porte le littéral `"1.0.0"`.
- Tueurs en forme fermée :
  - tueur 1 (la constante changée seule) : `verify-harness.mjs:41 CONST "1.0.0" -> "1.1.0"`, sur le test de parité ;
  - tueur 2 (la copie remise au littéral) : `sync-harness-served.mjs:68 CONST "GATE_BODY.prediction.schema_version" -> "\"1.0.0\""`, sur le test des corps.
- `scripts/mutants/run.mjs --killers` (base `7a0b1a49`) : les trois tueurs du fichier changé, **3/3 tués** (les deux neufs et `:274`).
- `verifie-ancres.mjs --ref 7a0b1a49` : 851 tueurs, 841 ANCRE, DERIVE 0, PERDU 10 ; à la base, 849, 839, 0, 10 (les mêmes 10 PERDU).
- `tsc --noEmit`, `npm run lint`, `lint:ratchet` 69/69, `gate:vocab` (340 fichiers), `lang:gate` : verts.
- `npm test` complet : 2 194 tests, 2 172 verts, 21 sautés, 1 rouge : le test 42 (`export_public_no_governance_no_french`, aléa connu), vert relancé seul. **0 rouge** hors cet aléa.
- **R-25** (pathspec de `ci.yml`, contre `7a0b1a49`) : **43 lignes** (+36/−7, 3 fichiers ; borne 547, ~60 estimé).

## Bloc C simulé (mesure sur un clone du gel, essai annulé)

`SCHEMA_VERSION = "1.1.0"` dans `apps/harness/src/tools/gate.ts`, sur `site-ukemi`, `verify-harness-liq`, `harness-served` et `narabi-live` (77 tests) :
- **refus seul, `CA_SCHEMA_VERSION` laissé à `"1.0.0"`** (ce que le tueur 1 attrape) : **9 rouges**.
  - Le test de parité.
  - Les quatre rouges « corps de la CA » du G0 §2 (lignes au gel) :
    - `site_ukemi_course_served_stratum_status_bound_to_served_verdict` (l.1175 de `site-ukemi`) ;
    - `verify_harness_ca_passes_on_the_in_process_harness` (`:117`) et `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` (`:244`) ;
    - `harness_served_sync_liq_row_follows_the_served_state` (`harness-served:632`, `:438` au G0).
  - `harness_pending_sync_writes_in_process_shapes` (`harness-served:462`), entré avec #132, qui poste `GATE_BODY`.
  - Les trois littéraux des tests.
- **refus et `CA_SCHEMA_VERSION = "1.1.0"`** (la ligne que le bloc C change avec `gate.ts`) : **3 rouges sur 77**, les seuls littéraux des tests de `site-ukemi` que le bloc C régénère :
  - `site_ukemi_prose_claims_conditional` (l.1137) ;
  - `site_ukemi_count_wording_says_what_the_wire_serves` (l.1457) ;
  - `site_ukemi_digest_note_says_what_the_gate_returns` (l.1638).

  Les six autres reverdissent. Le corps liq copié suit sans qu'on le touche.
- **La partie de l.1175 qui dépend de B-17** ne rougit pas dans cette simulation, et c'est attendu : le harnais du clone sert encore `calib_digest`. Elle rougira quand le bloc C renommera ce champ en `scores_sha256`, tant que ses lecteurs ne suivent pas :
  - `servedVerdictFacts` (`sync-ukemi-served.mjs:122`, `:131`) et la ligne versée `calibration_digest` (`:149`) ;
  - la CA (`verify-harness.mjs:291`, `:362`, et le détail `:366`).

  Le G0 (§6 point 4) cite `verify-harness.mjs:270`, numéroté sur `880654ed` ; au gel, deux lignes lisent le champ (`:291`, `:362`), plus le détail `:366` (m-4 de la G2).

  Ces renommages restent au bloc C (Q-UP-4).
- Clone retiré ; l'arbre du lot n'a pas bougé (`git status` propre).

## Items

- **UKEMI-PENDING-SNAPSHOT-1** (formé au G0, §6 point 3) : ouvert. Déclencheur : le G0 du bloc C. Critère : le bloc C change l'empreinte C5 ou la clause liq. Prix noté : R-25 d'environ 405.
- Pour la liste du G0 du bloc C :
  - les trois littéraux ci-dessus ;
  - les renommages B-17 (Q-UP-4) ;
  - la ligne `CA_SCHEMA_VERSION` (l.41), à changer avec `gate.ts:62`.

## Différences servies

Aucune. Les corps de la CA gardent les mêmes octets (`"1.0.0"`). La CA versée, `ukemi-served.json`, `harness-served.json`, le manifeste et les pages ne bougent pas.

## G2

G2 fraîche : APPROUVE, aucun bloquant (`recherches:coordination/pieces/2026-10-04-G2-recherches/G2-ukemi-pending-1.md`).
- m-2 plié : le commentaire de `verify-harness.mjs:73` ne dit plus que `GATE_LIQ_BODY` est le seul export (même nombre de lignes, aucun tueur déplacé).
- m-4 plié : liste B-17 ci-dessus complétée.
- m-1 laissé : le test des corps lit le texte source exprès (il prouve qu'aucun littéral ne reste) ; le bloc C le relira.
- m-3 laissé : importer le corps liq dans `sync-harness-served.mjs` sort de la ligne décidée ; noté pour le G0 du bloc C.
