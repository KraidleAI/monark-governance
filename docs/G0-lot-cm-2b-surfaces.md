# G0 du lot CM-2b-surfaces : BTC-DIR-RETIRE-SURFACES-1, temps (i)

- **Mandat** : message de MONARK `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-partage-de-charge.md` §1 (zone de MONARK ouverte pour ce seul lot et ces seuls fichiers) ; `…-2026-10-03-MONARK-vers-RECHERCHES-etape-3-deployee.md` §4 (deux temps) ; table BTC-DIR-RETIRE-SURFACES-1 de `docs/G0-lot-cm-2b.md` ; décision du fondateur sur Shōgen (amendement « nuit, 3 » de l'ADR-CM).
- **Base** : `2abe801` (`recherches/cm-2b`, PR #106). Branche `recherches/cm-2b-surfaces`. Auteur : RECHERCHES ; contrôle par diff : MONARK.
- **Règles** : tests d'abord ; R-25 au plus 547 ; aucune revendication publique nouvelle sur Shōgen ; `gate:vocab` et `lint:ratchet` verts ; aucune donnée régénérée à la main (hors ligne, en processus, par les outils du dépôt ; aucun appel au service en ligne).

## Changements

| Fichier | Changement |
|---|---|
| `scripts/verify-harness.mjs` | `GATE_BODY` sur la clé USDe commise (α 0,1, nMin 50, intent = yhat) ; deux contrôles neufs : `gate_retired_call` (btc-dir-15m rend 400 `tool_error`, `code` `task_class_retired`) et `gate_future_call` (`produced_at` en 2099 rend 400 `produced_at_future`, C-8 de MONARK) ; la CA passe de 13 à 15 contrôles. Verts en processus ; contre le service, à relancer au déploiement (temps (ii)). |
| `scripts/sync-harness-served.mjs` | même `GATE_BODY` que la CA (corps identiques, pour que les empreintes concordent) ; la ligne btc-dir et `BTC_SYNTHETIC` retirées de la table fermée des classes (la description servie ne nomme plus btc-dir par « For '…' »). Le fichier qu'il écrit (`harness-served.json`) n'est pas régénéré ici (temps (ii)). |
| `test/h5-trace-builder.ts`, `fixtures/h5-e2e-trace.json`, `fixtures/PROVENANCE-h5-e2e-trace.md` | étape 5 sur la clé USDe (libellé `committed-gate`, `commit`/`covered`, empreinte USDe) ; étape 7 gardée, ré-épinglée sur le refus `task_class_retired` (MCP `isError`, `_meta`), sa note dit la jointure dormante ; bloc d'honnêteté et `observed` suivent. Trace régénérée par `scripts/record-h5-e2e-trace.mjs` seulement : sha256 (LF) `0b32b330…` → `e403cf01…`, 21 951 → 21 753 octets. |
| `apps/site/data/manifest.sha256.json` | l'entrée de `fixtures/h5-e2e-trace.json` suit la régénération (le commentaire du manifeste le demande : « a re-record re-pins here too »), écrite par `setManifestEntry` de `scripts/sync-ukemi-served.mjs`, pas à la main. Hors de la table du G0 de CM-2b : conséquence obligée de la trace ; à confirmer par MONARK. |
| `apps/site/lib/harness-served-load.ts` | lit l'étape `committed-gate` ; les étapes d'erreur ne sont pas des décisions (déjà le cas). Le champ garde son nom `btcDir` pour ne pas toucher les pages hors périmètre (`app/integrators`, `app/docs/*`), qui lisent la classe dans la requête. |
| `apps/site/lib/fleet.ts` | Shōgen garde `built` ; `served_by` : l'outil `attest`, jointure dormante ; `integration_test` : `probe_harness_records_real_decision` (outil `attest` servi sur le vrai fil MCP, étape 6, oracle d'empreinte indépendant ; **choix provisoire**, la G2 de MONARK nomme le test), `gate_attested_is_frozen_attested_price`, `gate_attested_discordant_is_tool_error` ; note : jointure dormante. Hikae : `served_by` et note sans la classe synthétique. |
| `apps/site/components/hikae-panel.tsx` | « Honest limits » garde le fait servi (calibrations commises) et perd la phrase de la classe synthétique. |
| `apps/site/lib/sim.ts` | la simulation illustrative affiche `byo-direction` au lieu de la classe retirée. |
| `skills/monark/SKILL.md` | btc-dir-15m dite retirée (400 `task_class_retired`) ; la clé USDe : α 0,1 et nMin 50 imposés. |
| `skills/monark/DEMO.md` | empreinte tronquée de la trace BYO `79b54471…` → `daf8d3ea…` (calculée : `daf8d3eabacbc601…`, égale à l'épingle de la sonde et au manifeste) ; épinglée par un test (DEMO-HASH-STALE-1). |

Shōgen : aucune revendication nouvelle ; la phrase de portée servie (« What is built and served is the attest tool… ») reste vraie et inchangée.

## Tests (F2P contre `2abe801`, un tueur chacun)

- `test/h5-e2e-probe.test.ts` : `probe_harness_records_real_decision` (étape `committed-gate`, empreinte USDe, sonde de budget sur la clé USDe, nouvelle épingle) ; `h5_carries_attested` (étape 7 : refus `task_class_retired`, sujet commis, note dormante, `attested` porté égal à l'étape 6).
- `test/harness-served.test.ts` : `harness_trace_loaders_are_fail_closed` (mutants sur `committed-gate`) ; `byo_trace_rendered_equals_trace` (décisions enregistrées : `cascade-gate`, `committed-gate`). Constantes de tête : épingle de la trace, entrée `set` retirée de `PROSE_WORDS` (le mot ne vient plus d'une valeur enregistrée).
- `test/verify-harness-liq.test.ts` `verify_harness_ca_passes_on_the_in_process_harness` : 15 contrôles, détails des trois contrôles de gate.
- `test/site-build-fleet.test.ts` : `registry_notes_track_served_descriptions` (la description ne porte plus la clause de fixture) ; `built_panels_keep_served_facts_in_built_blocks` (le bloc Hikae garde le fait servi, sans la clause).
- `test/site-docs.test.ts` `shogen_served_scope_is_said_on_three_surfaces` : `served_by` revisité ; la phrase tient.
- `test/byo-demo-probe.test.ts` `demo_md_cites_the_current_byo_trace_digest` (neuf, DEMO-HASH-STALE-1).

## Rouges qui restent jusqu'au temps (ii) (liste exacte)

Ils lisent `apps/site/data/harness-served.json` ou `docs/deploy-CA-harness.json`, écrits depuis le service en ligne après déploiement :
1. `test/harness-served.test.ts` : `harness_served_data_matches_in_process_harness` ;
2. `test/narabi-live.test.ts` : `narabi_gate_facts_read_from_committed_sources`.

Les huit autres rouges de CM-2b sont verts en processus à ce lot. Échecs d'environnement observés en suite complète, hors de ce lot : `bell-served.test.ts:153` (clone superficiel), le test 42 d'export (charge), `sentinel_run_releases_chainstack_lock_on_sigterm` (instable, déjà vu à la base de CM-2a).

## Taille et sortie

R-25 contre `2abe801` : 379 lignes comptées (18 fichiers, +197/−182 ; borne 547). Oracle : `tsc`, eslint, `gate:vocab`, `lint:ratchet`, tests du harnais, `npm test`, `red-proof --base 2abe801 --gel <sha> --repo /home/user/monark-governance --draw 6 --seed 17`. Fusion par MONARK avec #106.

## Mesures (gel `cd4b534`)

`red-proof --base 2abe801 --gel cd4b534 --repo /home/user/monark-governance --draw 6 --seed 17` : OK, 9 jugés F2P, 6 tueurs tirés, 6 tués. Harnais 126/126. `npm test` : 1 955 tests, 1 930 verts, 22 ignorés, 3 échecs : `bell-served.test.ts:153` (clone superficiel) et les deux rouges du temps (ii) ci-dessus. Une première suite complète avait en plus le test 42 d'export et `sentinel_run_releases_chainstack_lock_on_sigterm` (charge), absents à la seconde.

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

- Constats : trace h5 ré-enregistrée hors ligne octet pour octet ; entrées du manifeste exactes ; seuls les fichiers permis touchés.
- (1) `scripts/verify-harness.mjs` exporte `GATE_BODY` ; `scripts/sync-harness-served.mjs` l'importe au lieu d'une copie (tue M2).
- (2) En-tête de `test/h5-e2e-probe.test.ts` : la clé USDe commise rend commit/covered ; btc-dir retirée (l'étape 7 montre le refus).
- (3) `test/site-docs.test.ts` `shogen_integration_tests_are_the_served_attest_and_the_join_units` : épingle les trois tests de Shōgen (tue M5 ; `probe_harness_records_real_decision` reste provisoire jusqu'au choix de MONARK).
- (4) `test/skills.test.ts` `skill_states_the_retired_class_and_the_usde_policy` : `task_class_retired` et α/nMin de la clé USDe lus dans `class-policy.ts` (tue M4, M6).
- Cause précise de `narabi_gate_facts_read_from_committed_sources` : `docs/deploy-CA-harness.json` porte l'empreinte d'`openapi` `9e3176…` (servi d'avant CM-2b) contre `fc746a6…` en processus ; ce fichier n'est réécrit qu'au déploiement (temps (ii)).
- Après la G2 : `red-proof --base 2abe801 --gel 3fb4413 --repo /home/user/monark-governance --draw 9 --seed 23` OK (11 jugés F2P, 9 tueurs tirés, 9 tués) ; harnais 126/126 ; R-25 : 19 fichiers, +225/−188, soit 413 lignes comptées (borne 547).

## Pli du contrôle par diff de MONARK sur CM-2b (C-1, 2026-10-04)

- **Source** : `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-CM-2b-controle.md` §3 et §4 ; rapport `recherches:coordination/pieces/2026-10-04-cm2b-controle/cm2b-RAPPORT.md` §9. Zone élargie aux fichiers de §3 (a)-(e).
- **Déjà faits par ce lot avant le pli** (la liste de MONARK est mesurée à `2abe801`) : (a) `fleet.ts` `served_by` et note de Shōgen, note de Hikae, épingles `site-docs.test.ts` et `site-build-fleet.test.ts:66-67, 695` ; (e) assertions de `h5-e2e-probe`, compte de contrôles de la CA (15), commentaire de `verify-harness.mjs`, provenance l.54 et l.62-66.
- **(a) Shōgen** : `integration_test` = `http_mirror_matches_mcp_surface` (`apps/harness/test/http.test.ts:45`, `POST /attest` sur le miroir HTTP servi, `AttestedPrice` fermé, contenu égal au texte MCP), `verify_harness_ca_passes_on_the_in_process_harness` (`test/verify-harness-liq.test.ts`, vrai écouteur, contrôle `attest_call` de la CA), `gate_attested_is_frozen_attested_price`, `gate_attested_discordant_is_tool_error`. Le choix provisoire `probe_harness_records_real_decision` sort de la liste de Shōgen (il reste un test de Hikae). **Limite déclarée** : aucun des deux tests servis n'épingle les valeurs du témoin servi (sujet, résidu) ; elle est portée par ATTEST-KATA-SUBJECT-1. Statut inchangé : `built`. La note rendue reste vraie (rejouée sur un vrai écouteur), inchangée.
- **(b) Pages** : `app/integrators/page.tsx` ne dit plus « committed fixture class » (l'appel enregistré est la clé USDe commise depuis ce lot). `app/docs/gate/page.tsx` et `app/docs/integrators/page.tsx` lisent la classe dans la requête enregistrée et disent la classe servie : vrais tels quels. Gardes fail-closed sur `harness-served.json` inchangées (la classe de l'appel enregistré, `stable-run-velocity-24h`, est dans les données servies).
- **(c) Skill** : `SKILL.md` : la clé `attested` dite refusée aujourd'hui (aucune classe servie n'a de sujet commis, `attested_inconsistent`), le résidu n'est plus dit porté ; titre et texte des classes intégrées : `cascade-liquidable-24h` seule fixture, btc-dir retirée, « The other served `task_class` ». `INTEGRATION.md:13-15` et `DEMO.md:96` : la fixture nommée, et B-2 dit aux intégrateurs (α 0,1 et nMin 50 imposés sur la clé USDe commise, sinon 400 nommé).
- **(d) Jointure** : `roadmap/page.tsx:159`, `components/docs/schemas/gate.tsx:284`, `lib/docs-pieces.ts:39, 50` : la jointure dite dormante (aucune classe servie n'a de sujet) ; `gate-sim/controls.tsx:64` : tâche dite illustrative, BYO.
- **(e) Provenance h5** : l.25 et l.99 « the served attest → gate tuyau » → « the attest → gate tuyau, dormant since CM-2b ».
- **Laissé, avec motif** : les noms de variables `btcDir`/`btc` (`harness-served-load.ts`, trois pages ; jamais rendus, épinglés par `harness-served.test.ts:294` et `site-docs.test.ts:257` ; les renommer coûte des lignes sans changer un mot rendu) ; `docs/gate/page.tsx:157-159` rend `honesty.attested` des données servies (temps (ii)) ; `ATTESTED` de `sync-harness-served.mjs` ne prend la phrase de C-2 qu'avec #110 dans la base (sinon le texte de synchronisation citerait une phrase que l'arbre ne sert pas) ; la note de `PROSE_WORDS` (`harness-served.test.ts:388`, interne au test).
- **Hors zone, non touchés** : `docs/deploy-CA-harness.json`, `apps/site/data/harness-served.json`, `apps/site/data/narabi-served.json`, le manifeste du site, `HARNESS_VERSION`.
- **Couplage avec #110 (mesuré par fusion à blanc hors dépôt)** : C-2 est dans #110 ; la trace h5 de ce lot enregistre l'empreinte de `tools/list`, donc `probe_harness_records_real_decision` rougit sur #110 + #111. Une fois #110 dans la base de ce lot : réenregistrer la trace (`scripts/record-h5-e2e-trace.mjs`), suivre ses épingles (sonde, manifeste, provenance) et ajouter la phrase à `ATTESTED`.

### Tests du pli (F2P contre `2abe801`)

- `test/site-docs.test.ts` : `shogen_integration_tests_are_the_served_attest_and_the_join_units` (les quatre tests ; tueur `fleet.ts:142`) ; `no_surface_presents_the_attest_join_as_live` (neuf : chaque surface de (b), (c), (d), (e) perd sa phrase périmée et dit la vraie ; tueur `docs-pieces.ts:50`).
- `test/skills.test.ts` : `skill_carries_the_negative_honesty_lines` (épingle de la fixture ; tueur `SKILL.md:56`) ; `skill_states_the_retired_class_and_the_usde_policy` (B-2 lu dans `class-policy.ts` sur les trois fichiers du skill, `attested` refusé ; tueur ré-ancré `SKILL.md:67`).
