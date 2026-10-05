# G0 du lot L2-SEAL-APART-TRUNK-PORT-1 : portage au tronc du correctif de `l2_seal_apart_child_killed`

- **Demande** : item `L2-SEAL-APART-TRUNK-PORT-1` (R-2 du G2 de `L2-SEAL-APART-FLAKE-1`, section « Portage au tronc » de `docs/G7-lot-l2-seal-apart-flake-1.md` sur la base). Le PR #175 a corrigé ce test sur `base/chantier-moteur-2026-10-03` (fusion `babc472b`, tête `f8228e4e`) ; le même test, la même course, existent sur le tronc.
- **Base** : `e4aac057` (`origin/lot/etude-suite`), branche `recherches/l2-seal-apart-trunk-port-1`. Auteur : RECHERCHES.
- **Zone** : `test/l2-loop.test.ts` (le seul test `l2_seal_apart_child_killed`) ; ce G0 et le G7. Aucun code de production : `scripts/l2/` est inchangé. Rien d'autre de la base n'est porté.

red-proof: test-only

## Constat

Au tronc, `test/l2-loop.test.ts:637` porte l'ancien test, mot pour mot : l'enfant de `sealApart(specOf(a), { timeoutMs: 1 })` est censé être tué avant de sceller. L'échéance est un `setTimeout` du parent (`scripts/l2/seal.mjs:72`), une borne basse : un parent non servi plus longtemps que tout le scellement de l'enfant le laisse lier `SHA256SUMS`, puis `halt("seal_timeout")` le tue déjà fini, et la fermeture rend `finish(killed)`, `sealed: false` (n-12). Assertion `:642` rouge, tuple `[false, false, undefined, true, false]`. Reproduit au tronc par le forçage du lot de la base (G7).

Différence du tronc (n-12) : `sealApart` ne résout qu'à la fermeture de l'enfant. Le test de #175, porté tel quel, passe ; mais son tueur (`seal.mjs:60`, `child?.kill("SIGKILL")` -> `0`) y laisse les deux enfants bloqués sur leur FIFO : `await ends` ne revient jamais, le test reste pendant jusqu'à `--test-timeout` (300 s), finit `cancelled`, et `--test-force-exit` laisse deux orphelins.

## Règle

1. Comme #175 : `journal.jsonl` de `a` et de `b` devient une FIFO (`mkfifo`) que personne n'ouvre en écriture ; l'enfant s'y bloque dans `journalOf` (`scripts/l2/day.mjs:68`), avant toute écriture du jour. Saut nommé sous win32 : `APART || (process.platform === "win32" ? "no FIFO on win32" : false)`.
2. Propre au tronc : l'attente des deux appels est bornée (`Promise.race` avec une minuterie de 10 s, effacée ensuite) ; passé la borne, chaque `sealed` vaut `"pending"` et l'assertion est rouge, sans attendre `--test-timeout`.
3. Puis, comme #175, un sommeil de 3 s armé après les deux appels ; chaque FIFO ouverte en écriture non bloquante doit échouer `ENXIO` (aucun lecteur : l'enfant est mort), et aucun `SHA256SUMS`. Attendu : `[false, false, undefined, "ENXIO", "ENXIO", false, false]`.
4. Propre au tronc : dans un `finally`, chaque FIFO est ouverte puis fermée en `O_WRONLY | O_NONBLOCK` : un enfant encore vivant (tueur) lit EOF et sort ; aucun orphelin.
5. Pas de nouvel essai, pas de saut hors win32. Le tueur et le nom du test sont inchangés.

## Tueurs (listés pour `--test-only`)

- `scripts/l2/seal.mjs:60 CONST "child?.kill(\"SIGKILL\")" -> "0"` (inchangé, au-dessus de `l2_seal_apart_child_killed`) : au tronc, il doit rendre le test rouge par assertion (`"pending"`) en un temps borné, sans orphelin.

## Vérification du lot

- Reproduction forcée au tronc et au gel ; charge (`test/l2-*.test.ts`, `--test-concurrency=16`, N lanceurs) avant et après.
- Tueur tiré à la main (sha256 restauré, durée, processus restants) ; `red-proof --test-only` ; ancres ; R-25 ; `npm run test:main`, `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.

## Taille

Environ 15 lignes de test changées. Borne R-25 : 547.
