# G7 du lot L2-REST-TEST-TMP-1 : `test/l2-rest.test.ts` supprime ses dossiers temporaires

- **Plan** : `docs/G0-lot-l2-rest-test-tmp-1.md`. **Base** : `c68451fc` (`origin/lot/etude-suite`). Branche `recherches/l2-rest-test-tmp-1`.
- **Commits** : `c73845f9` (G0), `7b004899` (tests ; **gel**), puis ce G7. Hôte de mesure : Linux, Node 24.21.0, 4 cœurs, sous la charge d autres sessions (charge moyenne 9 à 18).
- **Demande** : B-1 et m-10 du G2 frais de la partie L2 P1.

## Changement (tests seuls, aucune ligne déplacée)

| Fichier | Ligne | Changement |
|---|---|---|
| `test/l2-rest.test.ts` | 9 | `rmSync` importé |
| `test/l2-rest.test.ts` | 16 | `outs` et l aide locale `tmp()` : `mkdtempSync(join(tmpdir(), "l2-rest-"))`, chemin gardé dans `outs` |
| `test/l2-rest.test.ts` | 17 | `after` : après l arrêt des places, `rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })` pour chaque `d` de `outs` |
| `test/l2-rest.test.ts` | 32, 136, 240 | `mkdtempSync(join(tmpdir(), "l2-rest-"))` remplacé par `tmp()` sur sa ligne |
| `test/l2-book.test.ts` | 21 | `rmSync` du `after` : `maxRetries: 5, retryDelay: 100` ajoutés (m-10) |

## Mesure avant et après (B-1)

`node --test test/l2-*.test.ts`, `TMPDIR` privé et vide par exécution :

| Arbre | Tests | `l2-rest-*` laissés | `l2-book-*` laissés | Entrées laissées |
|---|---|---|---|---|
| base `c68451fc` | 41/41 | **17** (8,4 Mo) | 0 | 17 |
| gel `7b004899`, 3 exécutions | 41/41 chaque fois | **0** | 0 | 0 |

`npm test` complet au gel sous un `TMPDIR` privé : 0 `l2-rest-*`, 0 `l2-book-*` laissés. Le `/tmp` partagé de l hôte n est pas une mesure fiable ici : d autres sessions y relancent ce fichier pendant la mesure (le compte y a monté pendant une exécution de ce lot sous `TMPDIR` privé). Les dossiers déjà présents n ont pas été touchés (hors lot, G0).

## Oracle

- `node scripts/red-proof.mjs --base c68451fc --gel /home/user/monark-governance-rtmp --repo /home/user/monark-governance-rtmp --test-only` : **OK**, exit 0 ; 2 tests jugés, 13 inchangés, `files.production` vide, 0 tueur tiré au hasard ; `RED-PROOF.json` sha256 `59cb3706e0be…`, digest du gel `3ffb456de0c4…`.
  - `pinned` `l2_rest_451_stops_all` ; tueur `scripts/l2/rest.mjs:120 CONST` tiré au gel : **tué**.
  - `pinned` `l2_rest_failures_named_without_address_and_symbols_closed` ; tueur `scripts/l2/rest.mjs:81 CONST` tiré au gel : **tué**.
- `verifie-ancres.mjs . --files <les 5 test/l2-*.test.ts> --ref c68451fc` : **41 tueurs, 41 ANCRE, 0 DERIVE, 0 PERDU** (exit 0).
- `npm test` complet au gel : **2161 tests, 2139 verts, 0 échec, 22 sautés** (exit 0). Une exécution précédente sous forte charge avait rougi le seul test 42 (« exported CI ran an implausibly small suite ») ; relancé seul, il est vert (4/4) ; l exécution complète suivante est verte. Aucun lien avec ce lot (aucun fichier exporté touché).
- `tsc --noEmit` vert ; `lint` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.
- R-25 sur `c68451fc...7b004899` hors `docs/**/*.md` : +7/−7, **14 lignes** (sous 547).

## Écarts au plan

Aucun. L assertion « aucun dossier restant » n est pas dans le fichier, pour la raison du G0 (règle 4) ; le lot est vérifié par la mesure ci-dessus.
