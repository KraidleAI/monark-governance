# FAITS — identité de fichier `(dev, ino)` sous Node sur Windows (lot M-8, tour 3 : C-G2-24) — 2026-09-28

Lecteur : orchestrateur `claude-fable-5-1`. Deux sources : (A) la documentation Node lue par extrait via le connecteur Firecrawl (`firecrawl_search`, 2026-09-28 19:1x UTC, 2 crédits ; extrait de la page primaire, pas la page entière : niveau **[lu-extrait]**) ; (B) une **mesure première main** sur l hôte (`F:/tmp/methode/m8/ino/probe.mjs`, sha `60707fe8d41a2e8b…`, exécutée le 2026-09-28 à 18:02:39Z, Node 24, volume F: NTFS).

## A. Documentation Node (https://nodejs.org/api/fs.html, « File system | Node.js v26.10.0 Documentation », extrait Firecrawl)
- `fs.statSync(path[, options])` accepte `options.bigint` (« Whether the numeric values in the returned fs.Stats object should be bigint. Default: false »).
- La classe `fs.Stats` expose `stats.dev` et `stats.ino`, chacun de type `<number> | <bigint>` ; l exemple `BigIntStats` de la page montre `dev: 2114n, ino: 48064969n`.
- La page n énonce pas, dans l extrait lu, de garantie d unicité de `ino` par volume ni de comportement Windows spécifique : **non lu** dans l extrait, à ne pas affirmer comme [lu].
- Résultat 3 de la recherche : nodejs/node-v0.x-archive issue 2670 « fs.Stats.ino always returns 0 on Windows » — **historique (Node 0.x)**, réfuté sur cet hôte par la mesure B (valeurs non nulles et distinctes). Niveau [2nd] pour l issue elle-même (titre seul lu).

## B. Mesure sur l hôte (première main)
Pour UN répertoire `F:/tmp/methode/m8/ino/fx`, `statSync(p, { bigint: true })` rend la MÊME paire `dev:ino` = `3560016792:10133099178327618` par les cinq orthographes : chemin natif, UNC `//localhost/F$/…`, lecteur `subst Q:`, jonction `mklink /J`, préfixe DOS `\\?\` ; le sous-répertoire `fx/sub` rend une paire DISTINCTE (`3560016792:9007199271484995`) par les trois orthographes essayées (natif, `subst`, jonction). Nom court 8.3 : inexistant sur F: (`for %I … %~sI` rend le nom long), cohérent avec le relevé du relecteur rr3 (`fsutil 8dot3name` état 1).

## C. Ce que ces faits autorisent et n autorisent pas (pour la mission `mission-corr-m8-t3.md`)
- Autorisent : comparer l identité `(dev, ino)` pour « même répertoire » et pour « dans l arbre » (remontée des parents), sur des volumes NTFS locaux, quelle que soit l orthographe du chemin enregistré par git.
- N autorisent pas (hors garantie, item METHODE-M8-ALIAS-VOLUMES-1) : systèmes de fichiers sans inode stable (FAT/exFAT, certains montages réseau), volumes où la génération 8.3 est active (non mesurés), `\\?\GLOBALROOT`. Deux volumes distincts ont des `dev` distincts : deux répertoires homonymes n y sont jamais confondus (attendu, non mesuré sur deux volumes).
