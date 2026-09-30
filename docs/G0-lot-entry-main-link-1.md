# G0 — lot ENTRY-MAIN-LINK-1 : les programmes hôtes du Dōjō démarrent aussi lancés par un lien (plan de l orchestrateur, sans code)

- **Date** : 2026-09-30 (UTC). Auteur : orchestrateur (décisions 275, 291, 298, 299). Régime « petit lot » (décision 116 (5) : moins de 300 lignes, rien de servi, aucun réseau, aucun secret, aucun prix touchés) : G1 puis G2, puis G7 ; pas de checkpoint-1 : le motif corrigé est celui déjà relu et accepté au G2 et au G7 de PR-1b-5b (C-G2-1), recopié à l identique.
- **Item** : ENTRY-MAIN-LINK-1 (CHANTIERS, 2026-09-30 16:15 UTC ; bloquant avant A-3p). Mesure du motif fautif : `import.meta.url === pathToFileURL(process.argv[1]).href` ne voit pas le chemin réel ; lancé par un lien de répertoire, le programme ne fait rien et sort 0 en silence (mesuré au G2 de PR-1b-5b, `F:/tmp/dojo/g2-pr1b5b/sondes/junction-chain.log`).

## Décision

- **Intention unique** : les cinq programmes que l hôte de la page lance exécutent leur `main` quand ils sont lancés par un chemin qui traverse un lien, et jamais quand ils sont importés.
- **Forme** : la garde du cœur du vérificateur, recopiée mot pour mot (`apps/dojo/scripts/dojo-verify.mjs`, fonction `isEntry`) : `const isEntry = () => { try { return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } };` puis `if (isEntry()) …` avec l appel existant inchangé. Imports ajustés (`realpathSync` de `node:fs`, `fileURLToPath` de `node:url`) ; `pathToFileURL` retiré s il n a plus d usage. Aucun autre changement.
- **Périmètre fermé** (table ci-dessous) : `apps/dojo/scripts/dojo-publish.mjs`, `apps/dojo/scripts/dojo-eve.mjs`, `apps/dojo/scripts/dojo-seed.mjs`, `apps/dojo/src/collect.ts`, `apps/dojo/src/history-collect.ts` ; test neuf `test/dojo-entry-link.test.ts`.
- **Hors périmètre** (décision 298 : seule la page) : les autres programmes du dépôt qui portent le même motif ou une variante par `resolve` (Bell, sentinelle, recensement, `scripts/sync-*`, `scripts/verify-*`) : item **ENTRY-MAIN-LINK-2** (propriétaire orchestrateur ; déclencheur : la discussion d après la mise en ligne de la page, décision 298). `scripts/verify-dojo.mjs` (PR-3b-2b, à naître) porte la garde réelle dès sa création : consigne à son G1.

## Tests (neufs, `test/dojo-entry-link.test.ts`, racine de câblage `test/`)

- Pour CHAQUE programme du périmètre, deux tests :
  - **lancé par un lien** : un lien de répertoire créé par le test (`symlinkSync(dir, link, "junction")`, type ignoré hors Windows) vers le dossier du programme, puis `node <lien>/<programme> <arguments d usage refusé>` : sortie NON nulle et message d usage du programme sur stderr (sous le motif fautif : sortie 0, stderr vide) ; les arguments d usage refusé sont mesurés par programme au G1 (jamais `--help`, jamais `help`, rien qui ouvre un navigateur, une fenêtre ou un éditeur ; aucun réseau, aucune clé, rien d écrit hors d une racine temporaire) ;
  - **importé** : `node --input-type=module -e "await import(<url du programme>)"` : sortie 0, stdout et stderr vides, rien d écrit.
- Une ligne `// killer:` au format de `parseKiller` au-dessus de chaque test : la garde remise au motif fautif (test du lien) ; `isEntry` qui rend vrai à l import (test d import).

## R-25 (estimation ascendante de l orchestrateur, jamais une mesure)

| Lot | Fichiers | Asc. | ×2,31 | Borne |
|---|---|---|---|---|
| ENTRY-MAIN-LINK-1 | 5 programmes (≈ 4 lignes chacun) ; `test/dojo-entry-link.test.ts` (≈ 90) | ≈ 110 | ≈ 254 | 547 asc. ; mesure `r25()` jugée à 1 150 |

## Mutants

- **M-EL1 à M-EL5** : pour chaque programme, la garde remise au motif `pathToFileURL(process.argv[1]).href` : tué par son test du lien.
- **M-EL6** : `isEntry` sans `try` (lève à l import sans `argv[1]`) ; **M-EL7** : `isEntry` qui compare `process.argv[1]` sans `realpathSync` : tués par le test du lien ou d import.

## Tuyaux

- Entrée : l unité systemd (ou l opérateur) qui lance le programme par `/opt/monark-dojo…` ; sortie : le `main` du programme, inchangé ; état : aucun ; test : `test/dojo-entry-link.test.ts` (non-LLM, processus réels).

## Menaces

- **TB-EL1** : un programme lancé par l hôte à travers un lien ne fait rien et sort 0 : l unité paraît saine et rien n est collecté ni publié. Parade : ce lot ; statut : fermé à son G7.
- **TB-EL2** : un import déclenche un `main` (effet de bord en test ou dans un autre programme) : parade : test d import de chaque programme.
