# G0 du lot CM-2a-suite : corrections du contrôle par diff de MONARK sur CM-2a (#105)

- **Source** : `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-CM-2a-controle-et-1-1-0.md` §1 ; rapport `recherches:coordination/pieces/2026-10-03-cm2a-controle/cm2a-RAPPORT.md` (C-1 à C-9), outils `killcheck.mjs`, `census.mjs`, `r03.mjs`. Verdict de MONARK : APPROUVE-AVEC-CORRECTIONS ; C-1 et C-2 avant le déploiement.
- **Base** : `2abe801` (`origin/recherches/cm-2b`, tête de #106) ; branche `recherches/cm-2a-suite`, posée après #106 sans toucher sa tête. Auteur : RECHERCHES. Borne R-25 : 547.
- **Différence servie** : **aucune** au-delà de ce que CM-2a a déclaré. Le code ne change que par un commentaire (C-6). Le pli du 2026-10-04 (C-2 de CM-2b, section en fin de document) ajoute une phrase à la description servie du gate.

## Points

- **C-1** (avant déploiement) : les 14 sites de refus de `gate.ts` qu'aucun test n'épinglait (lignes de MONARK à `f3b330cf` → `2abe801` : 294 → 303 `requireFinite`, 309 → 318 `alpha`, 312 → 321 `tauInterval`, 313 → 322 `bFloor`, 315 → 324 `tool`, 318 → 327 `clockOpen`, 351 → 357 `calibration.mode`, 359 → 363 plafond des scores, 365 → 371 score non fini, 383 → 389 plafond des candidats, 389 → 395 étiquette imprimable, 392 → 398 étiquette avec `|`, 395 → 401 étiquette en double, 906 → 886 classe cascade avec `yhat` texte) et le code par défaut d'`UkemiPredictToolError` (`ukemi-predict.ts:71`, par `runUkemiPredict(null)`) : un appel par site, code et début du message épinglés. La phrase d'E-3 du G0 de CM-2a est corrigée (« 20 chemins », pas « par chemin de refus »).
- **C-2** (avant déploiement, texte) : la liste des formes de `produced_at` qui deviennent 400 est complétée au G0 et au G7 de CM-2a : tout séparateur autre que `T`/`t` (tout blanc `\s` de JavaScript : TAB, LF, CR, VT, U+00A0, U+2028, U+3000, U+FEFF, U+200A), tout décalage sans deux-points ou sans minutes (`±hhmm` dont `-0000`, `±hh`), les heures ou minutes hors bornes de la branche intercalaire d'ajv (`T24:59:00+01:00`, `T23:99:60+00:40`…) ; mesure de MONARK : 6 585 sur 60 000.
- **C-3** : fraction `.5` = 500 ms (horloge `12:00:00.400Z` : `12:05:00.5Z` rend `produced_at_future`, `12:05:00.3Z` décide) ; minutes du décalage (`17:34:59+05:30` décide, `06:35:01-05:30` refusé, `2026-09-05T05:29:60+05:30` décide) ; erreur non-outil côté MCP : `isError`, le texte, **pas** de `_meta`.
- **C-5** : OPENAPI-ERROR-CODE-1 au §10 de l'ADR-CM par un amendement daté du 2026-10-04 : environ 60 lignes, déclencheur « avec CM-3c et CM-4 ».
- **C-6** : commentaire périmé de `gate.ts:704` (« In U-4b-2a the registry is empty ») réécrit (s0 commise).
- **C-7** : motif K-8 de `registry.test.ts` : `\bDate\.now\b` et `\bperformance\.now\b` (une référence comme un appel). Constante hors du corps du test (non jugée), le test reste vert.
- **C-9** : base du G7 de CM-2a : `c596afd3..f3b330cf`.
- C-4 et C-8 sont à MONARK.

## Tests

Un test neuf, `apps/harness/test/error-code-sites.test.ts` : `every_refusal_site_pins_its_code_and_the_stale_registry_comment_is_gone`. Le lot ne change aucun comportement : sa seule assertion rouge à la base est celle de C-6 (le commentaire périmé). Les épingles de C-1 et C-3 y sont pliées, et non ajoutées aux corps d'E-3, P-1, P-2 et E-5 comme le proposait MONARK : un corps de test modifié et vert à la base serait refusé par `red-proof` (« self-confirming »). Un tueur (`gate.ts:321`, code permuté) ; chaque site, L13, L20 et R03 vérifiés tués à la main.

## Oracle

`tsc`, eslint (fichiers changés), `gate:vocab`, `lint:ratchet`, tests du harnais, `node scripts/red-proof.mjs --base 2abe801 --gel <sha du code> --repo /home/user/monark-governance-cm3 --draw 6 --seed 19`.

## Note de fusion

L'amendement daté de ce lot et celui de CM-3b (« nuit, 4 ») s'ajoutent tous deux en fin de l'ADR-CM : la PR fusionnée en second se rebase (ordre chronologique : « nuit, 4 » du 2026-10-03, puis celui du 2026-10-04).

## Pli du contrôle par diff de MONARK sur CM-2b (2026-10-04)

- **Source** : `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-CM-2b-controle.md` §2 et §6 ; rapport `recherches:coordination/pieces/2026-10-04-cm2b-controle/cm2b-RAPPORT.md` (C-2, C-3, C-4).
- **Pourquoi dans #110** : la branche est posée sur `2abe801` (tête de #106), elle porte donc l'état de CM-2b ; C-2 est du texte servi du harnais (zone RECHERCHES), alors que #111 déclare ne changer aucun comportement servi du harnais.
- **C-2** (décision du fondateur, « Dire la vérité dans la description ») : une phrase de plus dans la description servie du gate, après « no temporal binding in P1. » : « No served class has a committed attestation subject (the retired 'btc-dir-15m' held the only one), so any `attested` is refused. » Constante `NO_SERVED_ATTESTATION_SUBJECT_SENTENCE`, en fin d'`attestation-binding.ts`, à côté de la table qu'elle résume (aucune ligne de `gate.ts` ne se décale : les ancres des tueurs tiennent). README du harnais l.20-23 : même phrase, codes `attested_inconsistent` et `task_class_retired`, résidu dit dormant.
- **Empreintes** : sha256 de `GATE_TOOL_DESCRIPTION` `cb4029d2…` → `4279a54dd880f7f789d452770ff908a0340c479bb94dbd1152296a6023553f38` ; `JSON.stringify(buildOpenApi())` `fc746a60…` → `d605b912916cc679d4347299bf7d22bb77bf8e1af4c502dd18e2213e6d2a38d7`. Méthode recalculée d'abord sur `8e0998c` (rend `cb4029d2…` et `fc746a60…`). Épingle : `hdesc_served_gate_description_is_the_committed_clause` (`apps/harness/test/gate-liq.test.ts`).
- **Différence servie** : la seule feuille `description` du gate (`tools/list`, `/openapi.json`) ; aucune décision, aucun corps de `gate`, `attest`, `cascade` ou `calibrate` ne change.
- **C-4** : commentaires réécrits : `calibration.ts:11-12`, `attestation-binding.ts:7-8` et `:27`, `schema-projection.ts:111-112` ; `gate.ts:704` l'était déjà (C-6 ci-dessus). Règle 1 de B-2 au G0 de CM-2b : `policyFor` dit retiré par la G2 jusqu'à CM-4.
- **C-3** : une phrase au G7 de CM-2b (autres réponses de btc-dir à la base : `abstain`/`under_calib`, `abstain`/`non_evaluable`, 400 `yhat_type_mismatch`).
- **C-8 non fait** : la clause de B-7 vit dans `STABLE_RUN_COMMITTED_CORE`, que portent aussi les corps servis du gate (texte d'honnêteté) : l'ajout déplacerait les corps de la CA et la trace h5 de #111. Reporté au prochain lot qui touche ces corps.
- **Couplage avec #111 (mesuré)** : la trace `fixtures/h5-e2e-trace.json` de #111 enregistre l'empreinte de la réponse `tools/list`. Sur l'arbre fusionné #110 + #111 (fusion à blanc, hors dépôt), `probe_harness_records_real_decision` rougit sur cette seule empreinte. Quand #110 est dans la base de #111, la trace se réenregistre par `scripts/record-h5-e2e-trace.mjs` et ses épingles suivent (sonde, entrée du manifeste, provenance) ; la phrase entre aussi dans `ATTESTED` de `scripts/sync-harness-served.mjs` (lu par `honesty.attested`, temps (ii)).

### Tests de ce pli (F2P contre `2abe801`)

- `served_description_says_no_served_class_takes_attested` (neuf, `apps/harness/test/gate-cm2b.test.ts`) : la phrase est servie une fois (`tools/list`, `/openapi.json`) ; la table ne donne de sujet qu'à btc-dir ; le témoin commis est refusé sur chaque classe (btc-dir `task_class_retired`, les trois classes servies et une classe BYO `attested_inconsistent`) ; le README le dit. Tueur : `attestation-binding.ts:65` CONST.
- `hdesc_served_gate_description_is_the_committed_clause` : épingle `4279a54d…`.
- `every_refusal_site_pins_its_code_and_the_stale_registry_comment_is_gone` : les commentaires de C-4 y sont pliés.
