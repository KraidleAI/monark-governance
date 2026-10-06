# G0 du lot T0-TOOLING-1 : outiller les actes de T0, sans retouche à la main

- **Source** : relecture des actes de T0 (`recherches`, pièce `2026-10-06-relecture-T0/RELECTURE-ACTES-T0.md`) ; consigne du fondateur « release parfaite, sans dette » ; accord de MONARK (`fdc1032`), ordre de T0 accepté.
- **Base** : `597a986d`. Branche `recherches/t0-tooling-1`, commits locaux seulement (ni push ni PR par ce lot). Cible de la PR : `lot/etude-suite`.
- **Statut** : G0 court, écrit avant le commit des tests rouges et le gel. Auteur : RECHERCHES.
- **Hors périmètre** : `scripts/spec-publish*`, `schemas/` et les tables de politique (lot SPEC-1-1-0-RELEASE) ; M-e, M-f, m-c, m-d, m-f de la relecture (décisions ou items d'autres lots).

## 1. Zones ouvertes

Ouvertures de zone accordées par la consigne « sans dette » du fondateur et par MONARK (`fdc1032`, aucune gardée) :

- `scripts/` : `verify-harness.mjs`, `sync-harness-served.mjs`, `sync-ukemi-served.mjs`, `sync-narabi-served.mjs`, nouveau `repin-served.mjs` (et les `.d.mts` des tests) ;
- `docs/RUNBOOK-harness.md`, `docs/RUNBOOK-vitrine.md` ;
- la porte des textes publics `scripts/public-text-deny.mjs` (zone V-1 de MONARK) : **acte de porte V-2 proposé à MONARK**, une règle `ph`, rien d'autre.

## 2. Items

| # | Écart (relecture) | Construction | Test rouge (fichier) | Tueur |
|---|---|---|---|---|
| 1 | M-a : `--out` écrit en échec | `--out` écrit seulement si tout est vert (TLS compris) ; sinon sortie 1, `--out` intact, l'enregistrement en échec dans `<out>.failed` (ignoré par git, retiré par la passe verte suivante) | `verify_harness_out_is_written_only_when_every_check_passes` (`verify-harness-liq`) | `verify-harness.mjs:390 CONST "args.out && failed.length === 0" -> "args.out"` |
| 1 | m-b : drapeau inconnu ignoré | `parseArgs` exporté, refus nommé (option inconnue, option sans valeur), sortie 2, avant toute requête | `verify_harness_refuses_an_unknown_option` | `verify-harness.mjs:132 CONST "!Object.hasOwn(OPTIONS, flag)" -> "false"` |
| 2 | B-4 : manifeste à la main | `writeServed(root, out, exempt)` : promotion, entrée posée, entrée et fichier en attente retirés ; `writeHarnessPending` : les deux entrées. Écrivain canonique **importé** de `sync-ukemi-served.mjs` (`setManifestEntry`, `removeManifestEntry`), rangement d'une nouvelle clé généralisé à sa famille `<nom>-` | `harness_sync_promotion_rewrites_the_manifest`, `harness_sync_pending_sets_both_manifest_entries` (`harness-served`) ; la garde ukemi (`promotionBlocked`, ses deux écritures du manifeste) accepte le résultat | `sync-harness-served.mjs:198 SDL` (retrait de l'entrée en attente) ; `:298 CONST ", OUT_REL, lfSha(marked))" -> ", OUT_REL, lfSha(text))"` |
| 2 | m-e : `GATE_LIQ_BODY` recopié | importé de `verify-harness.mjs`, avec `CALIBRATE_BODY` et `CASCADE_BODY` (recopiés eux aussi, exportés désormais) | `verify_harness_ca_bodies_read_the_ca_schema_version` (corps modifié) | `sync-harness-served.mjs:50 CONST "GATE_LIQ_BODY, CALIBRATE_BODY, CASCADE_BODY" -> "GATE_LIQ_BODY"` |
| 2 bis | c bis : empreinte Narabi à la main | `writeNarabiServed` pose l'entrée (même écrivain) | `narabi_sync_sets_its_manifest_entry` (`narabi-live`) | `sync-narabi-served.mjs:134 SDL` |
| 3 | M-3 | `COMMENT` : « the scores digest, » ; texte épinglé par empreinte | `srf_ukemi_sync_comment_says_scores_digest` (`surfaces-1-1-0`) | `sync-ukemi-served.mjs:248 CONST "the scores digest," -> "the calibration digest,"` |
| 4 | M-d | règle `ph` : `/\{[A-Z][A-Z0-9_]*\}/`, tous genres | `public_text_gate_refuses_an_unfilled_marker` : `{T0}`, `{OPENAPI_SHA256}` refusés ; `{btc,eth}-{dir,range}-{1h,4h}` et `{dir}` admis | `public-text-deny.mjs:125 CONST` (motif rendu inerte) |
| 5 | B-3, m-g | section « Ordre de T0 » de `RUNBOOK-vitrine.md`, neuf actes, commandes exactes | `srf_runbook_vitrine_t0_order` (les tests de runbook existent dans `surfaces-1-1-0`) | `RUNBOOK-vitrine.md:45 CONST` (synchro Narabi remplacée) |
| 6 | B-2 | voir §3 | voir §3 | voir §3 |
| 7 | m-a | `RUNBOOK-harness.md` §6 nomme les 15 contrôles, dont `gate_retired_call` et `gate_future_call` | `srf_runbook_harness_names_every_check` | `RUNBOOK-harness.md:186 CONST "`origin_403_api`" -> "`origin_api`"` |
| 7 | m-h | empreintes des trois schémas, mesurées en processus comme le G7 de SURFACES-1-1-0 (sha256 de `JSON.stringify` de la constante) | `served_error_and_output_schemas_are_pinned_byte_for_byte` | `schema-projection.ts:186 CONST` (liste `TRANSPORT_500_KEYS`) |
| 7 | M-c | étape 9 du runbook : `docs/public-notes/v0.9.0.md` (genre `notes`) et `v0.9.0.commit.md` (genre `message`), sur le modèle de `v0.8.0` ; `--tag`/`--notes` refusés par construction, tag et Release à l'orchestrateur | `srf_runbook_vitrine_t0_order` (étape 9) | idem |

Mesure préalable de l'item 4, à la base : `docs/public-notes/**` (6 fichiers) : **0 refus** de la règle `ph` ; l'arbre exporté (575 fichiers) porte 240 formes `{MAJ}`, toutes en code (JSX, gabarits), que la porte ne lit jamais ; `SKILL.md` n'a que des listes en minuscules.

## 3. Item 6 : épingles dérivées, sauf une, tapée à dessein

Mesuré sur une copie promue de l'arbre (CA tirée du harnais en processus, les trois écritures des synchros, `repin-served`), puis `test:main` sur cette copie.

- **Dérivées des fichiers engagés, sans garde affaiblie** :
  - `pending_bodies_are_pinned_byte_for_byte` : les empreintes en processus restent tapées (elles ne changent pas à T0) ; le lien à l'état devient `bodiesAgree(root)` : en attente, l'`openapi_sha256` de l'instantané et des corps servis qui changent ; promu, le servi enregistre ces octets mêmes. Les deux états mis en scène, chacun avec un fichier altéré qui rougit ;
  - `site-send-guard` et `release-public-flow` : `ensurePendingSnapshot` écrit l'instantané par les écrivains `--pending` des synchros quand l'arbre n'en porte pas ; la garde est éprouvée des deux côtés de T0 (le site-send-guard réécrit un instantané sur l'arbre promu et constate le refus) ;
  - `narabi-live.test.ts:587` : déjà dérivé (servi = CA) ; vert après l'étape 4 ;
  - deux pièges trouvés par la copie promue, hors relecture : `byo_loop_closes…` (date `pending_since` postérieure à l'instantané dérivé) et `harness_pages_render_served_values_never_typed` (la clé 1.1.0 `scores_sha256`, que `/integrators` nomme, devient une valeur servie) : corrigés, les valeurs de l'instantané en attente comptent dès maintenant.
- **Tapée à dessein** : `PINNED` de `harness-served.test.ts`. Les synchros écrivent désormais le manifeste : sans épingle tapée, une resynchro changerait le fichier servi (ses champs `read_at`, `mcp`, `registry` ne sont liés à rien d'autre) sans aucun diff de test. `scripts/repin-served.mjs` la réécrit depuis les fichiers (la ligne en attente part avec son fichier) ; testé (`repin_served_rewrites_exactly_the_pins`, tueur `repin-served.mjs:28`), et `harness_served_data_is_listed_and_hash_pinned` exige que `PINNED` liste exactement les fichiers présents (tueur `repin-served.mjs:16`).

## 4. Découpage R-25

Mesuré sur le lot entier : 621 lignes (+510 −111) contre 547. Deux branches empilées :

- **`recherches/t0-tooling-1-a`** (sur `597a986d`) : items 1, 3, 4 et 7 m-a (CA et options, `COMMENT`, règle `ph`, les 15 contrôles nommés) ;
- **`recherches/t0-tooling-1-b`** (sur `-a`) : items 2, 2 bis, 5, 6, 7 m-h et 7 M-c (synchros et manifeste, corps importés, ordre de T0, ré-épinglage, empreintes des schémas, notes `v0.9.0`).

Chaque branche a son commit de tests rouges, puis son gel ; la preuve rouge de `-b` se mesure contre la tête de `-a`.

## 5. Méthode

Commit des tests rouges (ce G0, tests, aide de test), puis gel ; `red-proof --base 597a986d --seed 37` ; ancres ; R-25 ; tsc, eslint, `lint:ratchet`, `gate:vocab`, `lang:gate`, `export:check`, tests touchés, `test:main` une fois ; `/openapi.json` reste `61c9df97…`. Ré-ancrages de tueurs existants (lignes déplacées) : `verify-harness.mjs` (4), `sync-harness-served.mjs` (2), `public-text-deny.mjs` (3), `RUNBOOK-harness.md` (1), et `README.md:330` (perdu à la base).
