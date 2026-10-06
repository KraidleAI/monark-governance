# G0 du lot DOJO-E2E-DISK-1 : le test de bout en bout du dojo, indépendant du disque de l'hôte

- **Demande** : G2 delta de T0-FOLLOWUP-1 et d'ANCHORS-DRIFT-1, §3. `dojo_history_collect_to_verify_end_to_end` rougit quand le tmpdir de l'hôte a moins d'environ 1,27 Go libres.
- **Base** : `origin/lot/etude-suite` `82cf6980`, branche `recherches/dojo-e2e-disk-1`, worktree `mg-dojo-disk`. Auteur : RECHERCHES.
- **Zone** : `test/dojo-history-e2e.test.ts` seul. Aucun code de production n'est touché.

red-proof: test-only

## Constat

- Le collecteur lit `statfs(--state)` et refuse `disk_space` sous le plancher D-10 : `2 × ceil(2 × S × BODY_MAX / GZIP)` (`apps/dojo/src/history-collect.ts:184-185`). Pour le monde de ce test (J = 7, S = 45 269), cela fait 1 272 820 682 octets.
- Le collecteur a raison, et son refus est testé seul (`apps/dojo/test/dojo-history-collect.test.ts:344-349`). Le test de bout en bout, lui, n'était pas hermétique : il dépendait de la place libre réelle de l'hôte.

## Construction

- Le test remplace `fs.statfsSync`, sur le modèle de `dojo-history-collect.test.ts:345` (`Object.assign(fs, …)`, `syncBuiltinESMExports()`). Il le rétablit par `t.after`.
- Le plancher est recodé dans le test, d'après D-10.
- D'abord, un octet de moins : `runHistoryCollect` refuse `disk_space` par son nom, et le registre et les preuves restent vides.
- Ensuite, le plancher exact : les trois courses tournent comme avant.
- Le refus du produit n'est pas affaibli. Il est épinglé deux fois : par le test unitaire, inchangé, et par le test de bout en bout.
- Choix écarté : passer `statfs` par `RunDeps`. Cela changerait le code de production pour un besoin de test, alors que le modèle du test unitaire suffit.

## Preuve rouge

- Un préchargement de test ramène la place libre du tmpdir à 946 Mo, celle de l'hôte de la G2 ; rien d'autre ne change.
- À la base, le test est rouge : trois `disk_space` sur stderr, échec par assertion.
- Après le lot, il est vert, avec le même préchargement.

## Tueurs du lot (chacun tiré à la main, fichier restauré, sha256 contrôlé)

- `apps/dojo/src/history-collect.ts:456 CONST "status: \"complete\", stop_reason: null" -> "status: \"partial\", stop_reason: null"` (tueur existant, déclaré au-dessus du test)
- `apps/dojo/src/history-collect.ts:185 ROR "fs.bavail * fs.bsize < 2" -> "fs.bavail * fs.bsize <= 2"` (neuf : au plancher exact, la course doit tourner)
