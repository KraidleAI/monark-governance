# G0 du lot CM-2a-suite : corrections du contrôle par diff de MONARK sur CM-2a (#105)

- **Source** : `recherches:coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-CM-2a-controle-et-1-1-0.md` §1 ; rapport `recherches:coordination/pieces/2026-10-03-cm2a-controle/cm2a-RAPPORT.md` (C-1 à C-9), outils `killcheck.mjs`, `census.mjs`, `r03.mjs`. Verdict de MONARK : APPROUVE-AVEC-CORRECTIONS ; C-1 et C-2 avant le déploiement.
- **Base** : `2abe801` (`origin/recherches/cm-2b`, tête de #106) ; branche `recherches/cm-2a-suite`, posée après #106 sans toucher sa tête. Auteur : RECHERCHES. Borne R-25 : 547.
- **Différence servie** : **aucune** au-delà de ce que CM-2a a déclaré. Le code ne change que par un commentaire (C-6).

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
