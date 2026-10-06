# G0 du lot L2-FLAKES-2 : deux tests L2 qui dépendaient de l'hôte (espace libre partagé, délai fixe)

- **Demande** : deux rouges intermittents vus sous charge (tous les fichiers `test/l2-*.test.ts`, `--test-concurrency=16`, 8 lanceurs × 14 exécutions sur un même `TMPDIR`) : `l2_free_bytes_default` (`test/l2-record.test.ts:263`) 11 fois, assertion « bavail x bsize, a few blocks apart » ; `fake_place_mute_answers_nothing_and_a_cut_ends_the_client` (`test/l2-fake-place.test.ts:78`) 2 fois, attendu `[[], [8]]`, obtenu `[[], []]`.
- **Sous-items** : `L2-FREE-BYTES-FLAKE-1` et `L2-FAKE-PLACE-FLAKE-1`, un seul lot (les deux sont petits).
- **Base** : `753a23a9` (`origin/base/chantier-moteur-2026-10-03`), branche `recherches/l2-flakes-2`. Auteur : RECHERCHES.
- **Zone** : `test/l2-record.test.ts` (le seul test `l2_free_bytes_default` et ses imports) ; `test/l2-fake-place.test.ts` (le seul test `fake_place_mute_answers_nothing_and_a_cut_ends_the_client`) ; ce G0 et le G7. Aucun code de production : `scripts/record-binance-l2.mjs` et `test/l2-fake-place.ts` sont inchangés.

red-proof: test-only

## Constat

1. **L2-FREE-BYTES-FLAKE-1.** Le test lit `statfsSync(ROOT)` puis `freeBytes(join(ROOT, "absent", "x"))` et exige que les deux produits `bavail × bsize` diffèrent d'au plus 64 blocs. L'espace libre d'un système de fichiers est un état global : tout autre écrivain sur le même disque (les autres fichiers de test d'une même exécution, les autres lanceurs, l'hôte) le change entre les deux lectures. Un écart de 65 blocs (260 Kio en blocs de 4 Kio) suffit. Le code est juste (il lit l'ancêtre existant le plus proche et rend `bavail × bsize`) ; c'est l'hypothèse du test (« deux lectures réelles sont proches ») qui est fausse.
2. **L2-FAKE-PLACE-FLAKE-1.** Après `ws.close(1000)`, le test attend 200 ms (`await wait(200)`) puis exige que la place ait reçu la trame CLOSE. Un processus non servi par l'ordonnanceur pendant plus de 200 ms entre `close()` et la phase suivante des entrées-sorties voit la minuterie expirer ; à la reprise, libuv passe la phase des minuteries avant celle des entrées-sorties : l'assertion lit `peer.got` avant le gestionnaire `data` de la place. Délai fixe pris pour une synchronisation ; le code de la place est juste.

Ni l'un ni l'autre ne tient au `TMPDIR` partagé : le premier tient au disque partagé (les `TMPDIR` des lanceurs sont sur le même disque, et une exécution `npm run test:main` en CI fait écrire ses fichiers en parallèle sur le disque du runner) ; le second à l'ordonnanceur (boucle locale). Les deux peuvent donc rougir en CI réelle, plus rarement. Preuves et mesures : G7.

## Règle

1. `l2_free_bytes_default` : la lecture réelle ne vérifie plus que le type (`number` : un `--out` absent lit son ancêtre existant). Le chemin lu et le produit sont vérifiés sur un `statfsSync` remplacé (objet CommonJS de `node:fs`, `syncBuiltinESMExports`, motif de `test/l2-loop.test.ts:437`) qui rend des valeurs fixes (`bsize` 512, `bavail` 7, `bfree` 11) : attendu `[3584, [ROOT]]`. Restauré dans `finally`.
2. `fake_place_mute_answers_nothing_and_a_cut_ends_the_client` : `await wait(200)` devient `await until(() => peer.got.length === 1)` (la CLOSE du client est arrivée à la place). La coupure qui suit sépare une place muette (le client voit 1006) d'une place qui aurait répondu (1000), quel que soit l'ordonnanceur.
3. Pas de nouvel essai, pas de saut, pas de délai allongé ; aucune ligne de production ne bouge. Noms des tests et tueurs inchangés.

## Tueurs (listés pour `--test-only`)

- `scripts/record-binance-l2.mjs:161 SDL "while (!existsSync(p) && dirname(p) !== p) p = dirname(p);" -> ""` (au-dessus de `l2_free_bytes_default`, inchangé).
- `test/l2-fake-place.ts:78 CONST "muted = true" -> "muted = false"` (au-dessus de `fake_place_mute_answers_nothing_and_a_cut_ends_the_client`, inchangé).

## Vérification du lot

- Reproductions forcées à la base : préchargement qui fait baisser `bavail` de 65 blocs à chaque lecture (64 : vert, la borne du test) ; préchargement qui tient le processus 300 ms juste après `WebSocket.prototype.close`. Rouges par assertion à la base, avec les messages observés ; verts au gel sous le même forçage.
- Reproduction naturelle du premier : un écrivain concurrent de 4 Mio sur le même disque.
- Charge du rapport avant et après ; `npm run test:main`, `tsc`, `eslint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, ancres, `red-proof --test-only`, R-25.

## Taille

Environ 15 lignes de test changées. Plafond du lot : 547 lignes (notre règle) ; plafond de la PR : 1205 lignes (`VIBEGATES_PR_LIMIT`, porte R-25, `.github/workflows/ci.yml:56`).
