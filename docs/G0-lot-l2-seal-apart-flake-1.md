# G0 du lot L2-SEAL-APART-FLAKE-1 : `l2_seal_apart_child_killed` ne dépend plus de l'ordonnanceur

- **Demande** : item `L2-SEAL-APART-FLAKE-1` ; `test/l2-loop.test.ts:633` `l2_seal_apart_child_killed` rouge une fois sur 48 sous charge (tous les fichiers `test/l2-*.test.ts`, `--test-concurrency=16`, 6 lanceurs sur un même `TMPDIR`), assertion de la ligne 638 : attendu `[false,false,undefined,false,false]`, obtenu `[false,false,undefined,true,false]`.
- **Base** : `753a23a9` (`origin/base/chantier-moteur-2026-10-03`), branche `recherches/l2-seal-apart-flake-1`. Auteur : RECHERCHES.
- **Zone** : `test/l2-loop.test.ts` (le seul test `l2_seal_apart_child_killed`) ; ce G0 et le G7. Aucun code de production : `scripts/l2/` est inchangé.

red-proof: test-only

## Constat

Le 4e élément du tuple est `existsSync(<jour de a>/SHA256SUMS)` : le jour de `a`, scellé par l'enfant que `sealApart(specOf(a), { timeoutMs: 1 })` lance. Le test suppose qu'une échéance de 1 ms tue toujours l'enfant avant qu'il scelle. Or l'échéance est un `setTimeout` du parent (`scripts/l2/seal.mjs:72`), une borne basse : si la boucle du parent est en retard (processus non servi par l'ordonnanceur sous charge) plus longtemps que tout le scellement de l'enfant (environ 80 ms à vide sur ce jour de 4 trames), l'enfant écrit `SHA256SUMS` puis sort ; à la reprise, la phase des minuteries passe avant celle des entrées-sorties, `halt("seal_timeout")` tue un enfant déjà fini et rend `sealed: false`. Le code fait ce que son contrat dit (« jamais pendante au-delà de timeoutMs », l'enfant tué à l'échéance) ; c'est l'hypothèse du test qui est fausse. Preuve et mesures : G7.

## Règle

1. Dans `l2_seal_apart_child_killed`, `journal.jsonl` de `a` et de `b` devient une FIFO (`mkfifo`, comme `l2_append_not_a_file`) que personne n'ouvre en écriture : l'enfant s'y bloque dans `journalOf` (`scripts/l2/day.mjs:68`), avant toute écriture du jour. Aucun retard du parent ne le laisse sceller avant d'être tué.
2. Après le temps du scellement (les 3 s du test, inchangées), une ouverture en écriture non bloquante de chaque FIFO doit échouer `ENXIO` (aucun lecteur : l'enfant est mort), et aucun `SHA256SUMS` n'existe. Attendu : `[false, false, undefined, "ENXIO", "ENXIO", false, false]`.
3. Pas de nouvel essai, pas de saut, pas de délai allongé. Le tueur et son test gardent leur nom ; aucune ligne de production ne bouge.

## Tueurs (listés pour `--test-only`)

- `scripts/l2/seal.mjs:60 CONST "child?.kill(\"SIGKILL\")" -> "0"` (inchangé, au-dessus de `l2_seal_apart_child_killed`) : l'enfant vivant tient la FIFO, l'écrivain trouve « a reader ».

## Vérification du lot

- Reproduction forcée à la base (parent tenu après le premier `spawn` jusqu'à la fin de l'enfant) : rouge par assertion, le tuple exact ; au gel, sous le même forçage : vert.
- Charge du rapport avant et après ; `npm run test:main`, `tsc`, `eslint`, `lint:ratchet`, `gate:vocab`, `lang:gate`, ancres, `red-proof --test-only`, R-25.

## Taille

Environ 8 lignes de test changées. Borne R-25 : 547.
