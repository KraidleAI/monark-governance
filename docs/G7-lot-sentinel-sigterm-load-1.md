# G7 du lot SENTINEL-SIGTERM-LOAD-1 : le test SIGTERM de la sentinelle synchronisé sur des événements

- **Plan** : `docs/G0-lot-sentinel-sigterm-load-1.md` (commit `190edd08`).
- **Base** : `90b294bd` (`origin/lot/etude-suite`). **Gel** : `9d6181e0` (branche `recherches/sentinel-sigterm-load-1`), un seul fichier de code changé : `apps/sentinel/test/sentinel-chainstack-guard.test.ts`. `run.ts` inchangé.
- **Node** : 24.21.0 (version de la CI), installé hors dépôt ; l hôte n a que Node 22.

## Cause racine (mesurée)

Le test envoyait SIGTERM dès que `chainstack.lock` existait (sondage de 100 ms, borne de 20 s). `run.ts` crée le verrou dans `openGuardedClient` (`run.ts:295`), ouvre le journal sous le verrou, et ne pose son gestionnaire qu ensuite (`run.ts:342`). Un SIGTERM tombé entre les deux prend l action par défaut : l enfant meurt par signal, `code === null`. Tous les échecs mesurés avant le correctif portent cette seule assertion : « the child exited after SIGTERM (the handler ran then process.exit) ».

## Attentes à durée fixe remplacées

1. Sondage `existsSync(lockPath)` toutes les 100 ms (l.332 de la base) : remplacé par la ligne `SENTINEL_TEST_FETCH_BLOCKED` que le bouchon écrit à son premier `fetch`, émis par `run.ts` seulement après la pose du gestionnaire. Le premier de cette ligne ou de l événement `exit` de l enfant (échec de démarrage, nommé avec stdout et stderr).
2. Borne de 20 s de ce sondage, qui décidait du verdict : supprimée. Seule reste `untilEvent` (50 s par attente, deux attentes, sous `--test-timeout=120000`), qui transforme un blocage en échec nommé `hang: ...`.
3. Attente de la sortie : déjà un événement (`exit`) ; elle passe sous la même borne de sécurité et rapporte le signal et stderr.
4. Hors périmètre, déclaré : `timeout: 60_000` de `spawnSync` dans `runGuardedSync` (borne de sécurité d un appel synchrone, pas un point de synchronisation ; aucun échec mesuré).

## Oracle : taux d échec sous charge, avant et après

Montage (`load.sh`, hors dépôt) : le seul test (`--test-name-pattern`), exécuté N fois par lots de P processus `node --test` concurrents, pendant que K boucles `node -e 'for(;;){}'` saturent les 4 cœurs ; « fsync » ajoute deux boucles d écriture de 1 Mo suivie de `fsync`.

| Montage | Base `90b294bd` | Gel `9d6181e0` |
|---|---|---|
| sans charge, N=50, P=1 | 1/50 | 0/50 |
| K=8, P=4, N=100 (base) / N=200 (gel) | 8/100 | 0/200 |
| K=16, P=8, fsync, N=100 | 46/100 | 0/100 |
| CI exportée, K=16, P=8, fsync, N=100 | non mesuré | 0/100 |

Tueur posé au-dessus du test : `// killer: apps/sentinel/src/run.ts:342 SDL "process.on(" -> ""`. Appliqué à la main (sha256 de `run.ts` `a02a9542…` avant et après restauration), le test rougit de façon déterministe : `code === null`, `signal=SIGTERM`.

## Red-proof

`node scripts/red-proof.mjs --base 90b294bd --gel 9d6181e0 --draw 1 --seed 7` : **REFUSED** (exit 1), 1 test jugé, 11 inchangés, « green at base: a self-confirming test » ; `RED-PROOF.json` sha256 `c6163fe7…446909c`. Attendu : changement de robustesse d un test vert à la base hors charge. L outil refuse avant tout tirage, le tueur n a donc pas été tiré par l outil. L oracle de ce lot est le tableau ci-dessus, avec le tueur appliqué à la main.

## Suite complète et CI exportée

- `npm test` (Node 24, sans charge) : 2 063 tests, 2 040 verts, 22 sautés, 1 échec, toléré : `test/bell-served.test.ts:153` (objet `3bda2cad` absent du clone, `git cat-file`). Le test du lot est vert ; le test 42 est vert (CI exportée comprise, 152 s).
- Chemin de la CI exportée, reproduit comme l assertion (e) du test 42 : copie de l arbre sans `node_modules`, `.git`, `dist`, `LICENSE` factice, `node scripts/export-public.mjs --out`, `npm ci`, `npm run ci`. Le fichier de test exporté est identique octet pour octet. Sans charge : exit 0, 584 tests, 0 échec. Sous K=16 : deux passes complètes à exit 0 (586 et 583 tests, 0 échec ; le compte varie d une passe à l autre, hors de ce lot). Une troisième passe a été interrompue par la limite de temps de la tâche de fond (plus de 30 min sous charge) ; le test du lot y était déjà vert.
- `tsc --noEmit`, eslint sur le fichier, `gate:vocab`, `lint:ratchet` 69/69 : verts.

## R-25

`r25()` (`scripts/oracle/r25.mjs`) sur `90b294bd...HEAD` : STAT 30 insertions, 7 suppressions, **37** (borne du G0 : 547 ; porte CI : 1 205) ; CONTENT 0. Les deux documents `docs/**/*.md` sont hors du compte.

## Écarts

- Node 24 installé hors dépôt (paquet npm `node@24`) : l hôte n a que Node 22.
- Red-proof refusé (test vert à la base) : l oracle est la mesure de charge, avant et après.
- Ligne `killer:` ajoutée (aucune n existait) ; elle ne change pas le corps du test.
- La troisième passe de la CI exportée sous charge a été interrompue par la limite de la tâche de fond (deux passes complètes vertes).

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé.
