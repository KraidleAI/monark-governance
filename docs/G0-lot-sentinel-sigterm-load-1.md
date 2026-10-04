# G0 du lot SENTINEL-SIGTERM-LOAD-1 : la borne de temps du test SIGTERM de la sentinelle tenue par un événement

- **Demande** : MONARK, `2026-10-04-MONARK-vers-RECHERCHES-trois-taches.md` §0 et §1.3. Item d ETAT `332bfd93`.
- **Base** : `90b294bd` (`origin/lot/etude-suite`), branche `recherches/sentinel-sigterm-load-1`. Auteur : RECHERCHES.
- **Zone** : `apps/sentinel/test/sentinel-chainstack-guard.test.ts` ; le code de la sentinelle seulement si un point d accroche de test est strictement nécessaire (il ne l est pas, voir plus bas) ; ce G0 et le G7.

## Constat

Dans la CI de #110, le test 42 (`export_public_no_governance_no_french`, assertion (e) : `npm ci && npm run ci` dans l export) rougit sur un seul test, sous charge : `sentinel_run_releases_chainstack_lock_on_sigterm` (`sentinel-chainstack-guard.test.ts:321` à la base).

## Attentes à durée fixe dans le test (base `90b294bd`)

1. **l.332** : boucle de sondage `while (!existsSync(lockPath) && Date.now() - t0 < 20_000 && child.exitCode === null) await setTimeout(100)`. C est le point de synchronisation : le test envoie SIGTERM dès que le fichier `chainstack.lock` existe. La borne de 20 s décide aussi du verdict (passé ce délai, l assertion l.333 rougit).
2. **l.332** : le pas de 100 ms de ce même sondage.
3. Hors du test visé, `runGuardedSync` (l.215) passe `timeout: 60_000` à `spawnSync`. C est une borne de sécurité d un appel synchrone, pas un point de synchronisation ; hors périmètre de ce lot, déclaré.

## Cause racine

Le fichier de verrou n est pas l événement attendu. `run.ts` acquiert le verrou dans `openGuardedClient` (`run.ts:295`, `guarded.ts:44-46`), puis ouvre le journal du cycle sous le verrou (lectures et écritures `fsync`), puis seulement enregistre le gestionnaire (`run.ts:340-342`, `process.on("SIGTERM", onSigterm)`). Entre les deux, aucun gestionnaire n est posé : un SIGTERM reçu dans cette fenêtre prend l action par défaut du noyau, le processus meurt par signal (`code === null`), le verrou reste. Le sondage voit le verrou au plus tôt 0 à 100 ms après sa création ; sous charge, l enfant est préempté dans la fenêtre et le SIGTERM y tombe. Le défaut du test est qu il signale trop tôt. La même fenêtre existe en service (`systemctl stop`, arrêt ou redémarrage de l hôte envoient SIGTERM et peuvent y tomber) : c est un item de production distinct, SENTINEL-SIGTERM-STARTUP-WINDOW-1 (G7), hors de ce lot de test.

## Règle

1. Le test ne signale qu après un **événement** qui garantit que le gestionnaire est posé : la première entrée de `run.ts` dans `fetch`. `run.ts` n émet aucun `fetch` avant `run.ts:342` (`openGuardedClient` n en émet aucun à l ouverture ; le premier est `rpc.finalized()`, `run.ts:357`). Le bouchon `HANG_SRC` écrit une fois la ligne `SENTINEL_TEST_FETCH_BLOCKED` sur stdout à son premier appel, puis bloque comme avant.
2. Le test attend le premier de deux événements : cette ligne, ou l événement `exit` de l enfant (un échec de démarrage, nommé avec stdout et stderr). Puis il vérifie que le verrou existe, envoie SIGTERM et attend l événement `exit`.
3. Une seule borne de durée subsiste, de sécurité : `untilEvent` (50 s par attente, deux attentes, sous le `--test-timeout=120000` de la suite). Elle ne fait que transformer un blocage en échec nommé (`hang: ...`) ; elle ne décide jamais du verdict d une exécution saine.
4. Assertions inchangées : verrou présent avant le signal, sortie par `process.exit` (`code !== null`), plus de `.lock`, une ligne `unlocked` chaînée. Les messages gagnent le signal et stderr de l enfant.
5. Aucun changement de `run.ts` : l événement existe déjà (le `fetch` bouché) ; aucun point d accroche n est nécessaire.

## Preuve (oracle de charge)

- **Red-proof** : le test est vert à la base hors charge ; `scripts/red-proof.mjs` le refusera (« green at base, self-confirming »). L oracle est la mesure sous charge, avant et après, sur le même montage : N exécutions isolées du test (`--test-name-pattern`), K boucles CPU `node -e 'for(;;){}'`, P exécutions concurrentes, avec ou sans deux boucles d écriture `fsync` de 1 Mo.
- **Tueur** : une ligne `// killer: apps/sentinel/src/run.ts:342 SDL "process.on(" -> ""` est posée au-dessus du test (aucune n existait). Sans gestionnaire, le test doit rougir à chaque exécution, et non plus au hasard.
- Puis la suite complète, puis le chemin de la CI exportée (export par `scripts/export-public.mjs` d une copie de l arbre, `npm ci`, `npm run ci`, comme l assertion (e) du test 42), hors charge et sous charge.
- Node 24 (version de la CI), installé localement : l hôte n a que Node 22.

## Taille

Un fichier de test, environ 40 lignes changées. Borne R-25 : 547.
