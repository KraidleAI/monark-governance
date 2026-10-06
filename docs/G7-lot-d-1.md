# G7 du lot D-1 (bloc D, contrat 1.1.0) : B-14, motif kata réservé large et son image réduite exacte

- **Plan** : `docs/G0-bloc-d.md` (commit `77d770ee`), §2.1 (lignes B-14), §4.1 (T-1 à T-6), §5 (R-25 ~140), §6 (aucun ré-épinglage attendu), Q-D7 (défaut : pas de ligne datée, les octets changés sont listés ici). Décision déléguée CM-4b C-2 (conditions 1, 2 et 5) ; Z-1 point 2 et Z-5 de MONARK.
- **Base** : `origin/base/chantier-moteur-2026-10-03` = `bc8deef3`, refetchée avant le code (`+refs/heads/base/chantier-moteur-2026-10-03:refs/remotes/origin/base/chantier-moteur-2026-10-03`) : inchangée, aucune fusion. Base de mesure du lot : `77d770ee` (la base plus le G0 du bloc, documentation seule).
- **Commits** : `77d770ee` (G0 du bloc) ; `3917ab69` (tests rouges) ; `b78ca20f` (code, **gel**) ; ce commit (G7). Branche `recherches/bloc-d`. Aucune PR.
- **Statut** : prêt pour la G2 et le contrôle par diff de MONARK.

## Ce que le lot change

Un seul fichier de code, `apps/harness/src/tools/gate.ts`, à nombre de lignes égal (+9/−9), donc aucune adresse de tueur ne bouge en dessous :

- l.737-738 : `KATA_CLASS_RE` devient `/^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$/` (ligne B-14) et il est exporté (pour le test de propriété) ;
- l.760-765 : l'ensemble fini `KATA_CLASSES_REDUCED` (32 noms réduits) est remplacé par `KATA_CLASS_REDUCED_RE` = `/^(?:m|[a-hj-km-z2-9ol]{2,10})-(dlr|range|mae-down|mae-up)-(l5m|lh|4h|24h)$/` (C-2), exporté, avec son commentaire ;
- l.774 : `byoConfusable` compare la classe réduite à ce motif (`KATA_CLASS_REDUCED_RE.test(cls)`) ;
- l.797 : code inchangé ; le message cite `KATA_CLASS_RE.source`, donc ses octets changent (section suivante).

Tests :
- fichier neuf `apps/harness/test/gate-byo-kata-wide.test.ts` (T-1 à T-4) ;
- `apps/harness/test/gate-byo-confusable.test.ts` : T-5 (assertions inversées de `byo_confusable_kata_names_and_keys_refused` : `so1-dir-1h` sort de la liste des réductions refusées en `byo_lookalike_confusable`, `doge-dir-1h` sort de la liste des noms qui décident, et les deux rendent maintenant `byo_reserved_kata`) et T-6 (épingle neuve `wide_kata_names_keep_their_class_answer`).

**Écart au G0** : T-6 est dans `gate-byo-confusable.test.ts` et non dans le fichier neuf. Raison : dans le fichier neuf, il aurait été rouge à la base par le seul chargement du module, et non par ses assertions ; à sa place, il est vert à la base, comme le G0 le déclare, et son tueur est tiré à la main. Le test T-2 lit les deux motifs par l'espace de noms du module, après une assertion d'export : il est rouge à la base par une assertion (`ERR_ASSERTION`), ce que `red-proof` exige d'un fichier qui importe un module existant.

## Octets servis changés (C-2 condition 5, Q-D7)

1. **Message 400 `byo_reserved_kata`** (HTTP : champ `message` du corps `tool_error` ; MCP : premier contenu de l'erreur d'outil). Seul le motif cité change :
   - avant : `(pattern ^(btc|eth|bnb|sol)-(dir|range|mae-down|mae-up)-(1h|4h)$, key prefix 'kata:')`
   - après : `(pattern ^[a-z0-9]{2,10}-(dir|range|mae-down|mae-up)-(15m|1h|4h|24h)$, key prefix 'kata:')`

   Le reste du message est inchangé, octet pour octet : `task_class '<classe>' / predictor_id '<clé>' takes a name reserved for MONARK kata classes (…): use a caller-owned name for BYO (ADR-CM B-1)`. Le corps exact, pour `my-range-1h` et `caller:model`, est épinglé par T-4.
2. **Codes des noms BYO** (avec `calibration`) :
   - `byo_reserved_kata` (B-1) au lieu d'une décision : tout nom du motif large, en toute casse ASCII, par exemple `my-range-1h`, `ab-dir-4h`, `doge-dir-1h`, `btc-range-24h`, `eth-mae-up-15m`, `rn-dir-1h`, `abcdefghij-mae-down-4h` ;
   - `byo_reserved_kata` au lieu de `byo_lookalike_confusable` : `so1-dir-1h` (il est maintenant un nom large) ;
   - `byo_lookalike_confusable` (B-10) au lieu d'une décision : tout nom dont la réduction tombe dans le motif réduit sans être un nom large, par exemple `my_range_1h`, `ab.dir.4h`, `doge_dir_1h`, `xyz-mae-up-l5m` ; faux refus i/l déclaré (BYO-LOOKALIKE-RESIDUAL-1 (a)), étendu à tout `<symbole>-dlr-<h>`, par exemple `abc-dlr-1h`, `usd-dlr-24h`.
   - Inchangés, vérifiés par les tests : `a-dir-1h`, `my-btc-dir-1h-clone`, `btc-dir-1h-v2`, `eth-dir-1d`, `btc-dir-2h`, `sol-dir-1hr`, `abcdefghijk-dir-1h`, `a_dir_1h` décident ; `BTC-DIR-15M` garde `byo_lookalike_committed` ; `eth-dir-1h` garde `byo_reserved_kata` ; les clés `kata:` et leurs imitations gardent leurs codes.
3. **Sans calibration** : rien ne change (T-6) : `btc-dir-15m` rend `task_class_retired` ; `doge-dir-1h`, `my-range-24h`, `eth-mae-up-15m` rendent `task_class_unknown`.

Aucun autre octet servi : la description et le schéma ne citent pas le motif (Z-5 ; `grep` du dépôt : le texte « reserved for MONARK kata » n'apparaît que dans `gate.ts`).

## Ré-épinglages : aucun (preuve)

- `GET /openapi.json` en processus au gel : sha256 `ccae5fc0cd142a46963d5d5c8a101ee1e204646e073ec2c3b03fc5f0ac24844f` (27 565 octets), égal à `PENDING_BODIES_SHA256["/openapi.json"]` (`test/harness-served.test.ts:664`) et à l'`openapi_sha256` de `apps/site/data/harness-pending.json`.
- `pending_bodies_are_pinned_byte_for_byte`, `harness_served_data_matches_in_process_harness`, `narabi_gate_facts_read_from_committed_sources`, le rejeu de 111 appels (`served-replay-cm3`) et `contracts_frozen` passent sans aucun changement d'épingle (section « Oracle »).
- Aucun fichier hors de `apps/harness/` n'est touché : aucune ouverture de zone n'est utilisée.

## Oracle (Node 24.21.0, variables de proxy retirées, TMPDIR dans le dossier de travail)

- **red-proof** : `node scripts/red-proof.mjs --base 77d770ee --gel b78ca20f --repo . --draw 5 --seed 37` : 6 jugés, 2 inchangés ; **5 F2P** (T-1 à T-5), **5 tueurs tirés, 5 tués** ; 1 refusé, l'épingle T-6 (« green at base: a self-confirming test »), comme le G0 le déclare. Sortie 1 (REFUSED) pour cette seule raison. `RED-PROOF.json` sha256 `70cb50f585aff088b993902f51b6e7a24caa86a164524f36a3fcc71108c9cc88` (dépend des chemins).
- **Tueurs** (forme fermée, un par test) :

  | Test | Tueur | Résultat |
  |---|---|---|
  | T-1 `byo_wide_kata_names_reserved` | `apps/harness/src/tools/gate.ts:738 CONST "(15m\|1h\|4h\|24h)" -> "(1h\|4h)"` | tué (tiré) |
  | T-2 `byo_reduced_kata_pattern_is_the_exact_image` | `apps/harness/src/tools/gate.ts:762 CONST "(?:m\|" -> "(?:"` | tué (tiré) |
  | T-3 `byo_confusable_wide_kata_names_refused` | `apps/harness/src/tools/gate.ts:774 CONST "KATA_CLASS_REDUCED_RE.test(cls)" -> "false"` | tué (tiré) |
  | T-4 `byo_reserved_kata_body_names_the_wide_pattern` | `apps/harness/src/tools/gate.ts:738 CONST "[a-z0-9]{2,10}" -> "(btc\|eth\|bnb\|sol)"` | tué (tiré) |
  | T-5 `byo_confusable_kata_names_and_keys_refused` | `apps/harness/src/tools/gate.ts:775 CONST ".replace(/4/g, \"a\")" -> ".replace(/4/g, \"4\")"` (existant) | tué (tiré) |
  | T-6 `wide_kata_names_keep_their_class_answer` | `apps/harness/src/tools/gate.ts:927 CONST "\"task_class_retired\"" -> "\"byo_reserved_kata\""` | **tué à la main** (copie du gel, test relancé seul : 1 rouge, `btc-dir-15m keeps task_class_retired` ; fichier restauré) |

- **Ancres** (`verifie-ancres.mjs`) : `. --touched origin/base/chantier-moteur-2026-10-03 HEAD` : 8 tueurs, 8 ancrés, 0 dérivé, 0 perdu. Arbre entier : 1 189, 1 181, 0, 8 ; à la base (arbre détaché de `bc8deef3`, effacé) : 1 184, 1 176, 0, 8, les mêmes 8 perdus (`test/oracle-run.test.ts` et ailleurs), aucun de ce lot.
- `tsc --noEmit` vert ; `eslint .` sortie 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK (346 fichiers) ; `lang:gate` OK ; `export:check` OK.
- **`npm test` complet au gel** : **2 552 tests, 2 530 verts, 22 sautés, 0 rouge**, sortie 0 (350 s). Le lot ajoute 5 tests (T-1 à T-4 et T-6) et en modifie un (T-5). Le compte de l'oracle Windows de MONARK à `bc8deef3` (2 546) n'est pas comparable tel quel à ce compte Linux : la comparaison test par test revient à l'oracle Windows de ce gel.
- **Site** : `npm run build -w @monark/site` sortie 0 ; `node scripts/assert-fleet-html.mjs` sortie 0 (trois lignes OK : `/ukemi`, Bell, `/dojo`).
- **R-25** (`r25()` de `scripts/oracle/r25.mjs` contre `origin/base/chantier-moteur-2026-10-03`, pathspec de `ci.yml`) : STAT **176** (+164/−12) ≤ 547 ; CONTENT_STAT 0. Estimation du G0 : ~140.
- Windows : test de propriété déterministe (générateur à graine 37, environ 4 000 symboles × 16 noms et 20 000 tirages, moins d'une seconde) ; aucune horloge, aucun port, aucun chemin, aucun fichier neuf hors de `apps/harness/test/`, nom de fichier sans nom réservé.
- `packages/rpc-guard/bin/rpc-guard.mjs` n'est pas indexé ; aucun `git add -A`.

## Pour la suite

- NOTICE-1-1-0 (C-2 condition 4) : l'exemple « accepté aujourd'hui, refusé à T0 » peut citer `my-range-1h` (rend une décision au servi `af9b889`, `byo_reserved_kata` à T0).
- D-2 garde `gate.ts:927` comme adresse du cliquet (inchangée par ce lot).
