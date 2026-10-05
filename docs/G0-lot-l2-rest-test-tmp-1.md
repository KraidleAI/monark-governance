# G0 du lot L2-REST-TEST-TMP-1 : les dossiers temporaires de `test/l2-rest.test.ts` supprimés en fin de fichier

- **Demande** : G2 frais de la partie L2 P1 (`2026-10-04-G2-recherches/G2-L2-P1-partie.md`), bloquant **B-1** et mineur **m-10** ; item `L2-REST-TEST-TMP-1` du tableau des items proposés (« avant le G7 de P1 »).
- **Base** : `c68451fc` (`origin/lot/etude-suite`), branche `recherches/l2-rest-test-tmp-1`. Auteur : RECHERCHES (auteur de b1).
- **Zone** : `test/l2-rest.test.ts` (aide `tmp()` et crochet `after`), `test/l2-book.test.ts` (options de `rmSync` du crochet `after`) ; ce G0 et le G7. Aucun code de production : `scripts/l2/` est inchangé.

red-proof: test-only

## Constat (B-1)

`test/l2-rest.test.ts` crée ses dossiers par `mkdtempSync(join(tmpdir(), "l2-rest-"))` en trois endroits (`:32` dans `rig`, `:136` dans le test des arrêts 451/429, `:240` dans le test des échecs nommés) et ne les supprime jamais : son seul crochet `after` (`:17`) arrête les places, et `rmSync` n est pas importé. Le G2 mesure 17 dossiers `l2-rest-*` par exécution, 8,4 Mo, presque tout le corps de 8 Mio gardé par le cas de borne du corps. Chaque oracle, preuve rouge et campagne de mutants relance ce fichier et accroît la fuite (`/tmp` comme `%TEMP%` de l hôte Windows de MONARK), jusqu à ENOSPC sur un disque borné.

Mesure à la base `c68451fc` (Linux, Node 24.21.0, `TMPDIR` privé et vide, `node --test test/l2-*.test.ts`) : 41 tests verts ; **17 dossiers `l2-rest-*`, 0 `l2-book-*`, 8,4 Mo** laissés.

## Constat (m-10)

`test/l2-book.test.ts:21` supprime ses dossiers par `rmSync(d, { recursive: true, force: true })` sans nouvel essai : un EBUSY ou EPERM passager dans `%TEMP%` (antivirus de Windows) ferait échouer le crochet `after` du fichier.

## Règle

1. `test/l2-rest.test.ts` crée chaque dossier par une aide locale `tmp()` (ligne 16) qui garde son chemin dans `outs` ; les trois appels deviennent `tmp()` sur leur ligne. Le crochet `after` (ligne 17), après l arrêt des places, supprime chaque dossier de `outs` par `rmSync(d, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })` (sûr sous Windows). Le cas disque `join(out, "absent", "\u0000")` ne crée rien : son parent est le `out` du gréement, déjà dans `outs`.
2. `test/l2-book.test.ts:21` prend les mêmes options (`maxRetries: 5, retryDelay: 100`).
3. Aucune ligne n est déplacée : les remplacements restent sur leur ligne, les lignes `// killer:` des deux fichiers gardent leur numéro, et leurs cibles dans `scripts/l2/` ne changent pas.
4. L aide reste locale. Une aide partagée sous `test/helpers/` n apporterait rien ici (deux fichiers, deux préfixes) et toucherait les gardes qui lisent `test/helpers/`. L assertion « aucun dossier `l2-rest-*` restant » n est pas posée dans le fichier : elle ne peut s exécuter qu après le crochet `after` qui supprime, et une lecture de `tmpdir()` en fin de fichier serait fausse pendant les campagnes qui lancent ce fichier en parallèle (même préfixe). `rmSync` avec `force` lève sur tout échec autre que ENOENT : un dossier non supprimé rougit déjà le fichier.

## Tueurs (listés pour `--test-only`)

Aucun tueur nouveau : un nettoyage ne change aucune décision du code de production. Les deux tests dont le corps change (`:136` et `:240`) gardent leurs tueurs existants, inchangés, que le red-proof tire au gel :

- `scripts/l2/rest.mjs:120 CONST "state.stopped = true" -> "state.stopped = false"` (ligne `:117`, test des arrêts 451/429).
- `scripts/l2/rest.mjs:81 CONST "e?.cause?.code ?? " -> "e?.cause?.message ?? "` (ligne `:237`, `l2_rest_failures_named_without_address_and_symbols_closed`).

## Vérification du lot

- **Mesure avant et après** : `node --test test/l2-*.test.ts` sous un `TMPDIR` privé et vide ; base : 17 `l2-rest-*` (8,4 Mo) ; gel : **0 `l2-rest-*`, 0 `l2-book-*`, 0 entrée**, sur trois exécutions. Même exécution sous le `/tmp` de l hôte : écart 0.
- `node scripts/red-proof.mjs --base c68451fc --gel <gel> --repo <worktree> --test-only` : seuls des tests et des docs changent ; les deux tueurs ci-dessus épinglés.
- `verifie-ancres.mjs` sur `test/l2-*.test.ts` : tous les tueurs ANCRE.
- `npm test` complet, `tsc --noEmit`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.

## Hors lot

Les dossiers `l2-rest-*` déjà présents dans le `/tmp` de cet hôte (1 181 selon le G2) n ont pas été créés par ce lot et restent en place : leur suppression revient au propriétaire de l hôte.

## Taille

7 lignes de test changées. Borne R-25 : 547.
