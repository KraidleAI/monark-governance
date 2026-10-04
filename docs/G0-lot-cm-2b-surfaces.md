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
