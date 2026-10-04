# G7 du lot MUTANTS-RUN-TEST-DURATION-1 (avec MUTANTS-LOCK-WAIT-BOUND-LOAD-1) : `test/mutants-run.test.ts` à 35 s dans la suite, borne de G27 nommée

- **Plan** : `docs/G0-lot-mutants-run-duration-1.md` (commit `a251ece4`).
- **Base** : `ad2354df` (`origin/lot/etude-suite`). **Gel** : branche `recherches/mutants-run-duration-1`, commit de tests `df70517a`. Lot de tests seuls : `scripts/mutants/run.mjs` n est pas touché.
- **Node** : 24.21.0, installé hors dépôt ; Linux, 4 coeurs ; suites lancées sans proxy, avec les drapeaux de `npm test`.

## Durée de `test/mutants-run.test.ts`

| | Base `ad2354df` | Gel |
|---|---|---|
| fichier seul (`node --test`, réel) | 57,2 s | **28,2 s** |
| dans `npm test` complet, somme des 45 tests, passage 1 | 61,0 s | **34,6 s** |
| dans `npm test` complet, somme des 45 tests, passage 2 | 60,4 s | **34,9 s** |
| trois copies du fichier lancées en même temps (charge) | non mesuré | 39,5 / 40,0 / 40,0 s, 45/45 chacune |
| suite complète, mur | 241 s, puis 206 s | 195 s, puis 197 s |

Dans la suite, la somme des durées des tests du fichier est sa durée, chargement exclu : les tests d un fichier s exécutent l un après l autre. Au gel, les lancements anticipés se terminent avant leurs tests, et `after` n attend plus rien.

## Ce qui a changé (rappel du G0)

1. `ahead(start)` lance l outil d un test (`runAsync`) dans une microtâche après le chargement, et le test attend la promesse en place. Six tests l utilisent : les six propriétaires du verrou côte à côte, la file du verrou hôte, l arrêt entre deux mutants, G28, le `tsc` mort, et le dépassement de temps. Assertions et lignes `killer:` inchangées.
2. Racine de verrou propre (`ownLock()`) pour deux lancements anticipés qui prenaient `no-lock`. Table `held.json` (mêmes lignes que `one.json`) pour le premier test.
3. Sous `--test-name-pattern`, rien ne part d avance. Mesuré : G27 seul en 1,5 s, le test des propriétaires seul en 1,6 s (6,7 s à la base), le dépassement seul en 6,7 s.
4. `after` attend toutes les promesses avant de supprimer la racine de la fixture.
5. G27 : borne haute `WAIT + POLL + MARGIN` (1 000 + 100 + 1 500 = 2 600 ms) au lieu de 2 000 ; borne basse `>= WAIT` inchangée. `stop.waited_ms` part déjà de l entrée dans `gate()` (`run.mjs:228`), donc le lancement n y est pas. Le mutant `maxMs: 3 * o.wait` enregistre toujours au moins 3 000 ms : il reste tué, quelle que soit la charge.

## Écart à la demande : pas de clone partagé

La demande disait « un clone partagé par fichier ». La mesure du G0 l écarte :

- un clone de l outil coûte environ 32 ms, soit environ 1,3 s sur 57 s ;
- les fixtures sont déjà partagées par fichier ;
- l outil refuse un second lancement sur un même clone (`run.mjs:143`).

Le gain vient de l attente mise en parallèle, environ 27 s en série à la base.

## Red-proof

`node scripts/red-proof.mjs --base ad2354df --gel /home/user/monark-governance-rd --repo /home/user/monark-governance-rd --test-only` : **OK** (exit 0). 7 tests jugés, 38 inchangés. Les 7 sont **pinned**, et leurs 7 tueurs, tirés au gel, sont **tués** :

- `run.mjs:232` (verrou contre mémoire) ;
- `run.mjs:231` (`mutant: id`) ;
- `run.mjs:270` ;
- `run.mjs:232` (`lock_wait_ms`) ;
- `run.mjs:231` (`maxMs: 3 * o.wait`) ;
- `run.mjs:224` ;
- `run.mjs:267`.

`RED-PROOF.json` sha256 `cb8eca35e078367e…`. Pas de `--draw` : le mode `--test-only` tire chaque tueur des tests jugés. La ligne `red-proof: test-only` est au G0.

## Adresses des tueurs

Aucune ligne de `run.mjs` ne change. J ai vérifié les 45 lignes `killer:` du fichier avec `parseKiller` de `red-proof.mjs` : le texte avant est présent exactement une fois sur la ligne visée, et la ligne suivante déclare un test. 45/45.

## Portes

- `tsc --noEmit` 0 ; `npm run lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` 0.
- `npm test` complet au gel, deux passages : **0 échec** (2 149 et 2 146 verts, 22 et 20 sautés).
- À la base, le premier passage a eu un rouge, `bell_served_collector_revision_is_a_collector_commit` : l objet `3bda2cad` manquait au dépôt local. Je l ai récupéré (`git fetch origin 3bda2cad…`), puis la base est passée à 0 échec.

## R-25

`git diff --numstat ad2354df HEAD -- scripts test` : 63 insertions, 27 suppressions, **90** (borne du G0 : 547). Les documents `docs/**/*.md` sont hors du compte.

## Questions ouvertes

1. **Mesure sur ta CI Linux et chez toi (Windows).** Ici, le fichier passe de 61 à 35 s dans la suite. Ta mesure de 72 s seul devrait tomber vers 35 à 40 s. Le gain dépend des attentes, pas du nombre de coeurs.
2. **Borne de G27.** Avec `MARGIN = 1500`, un mutant `2 * o.wait` n est plus tué par la borne haute. Le tueur déclaré, `3 * o.wait`, l est toujours. Si tu veux aussi `2 * o.wait`, il faut passer `WAIT` à 2 000 : le test prend 1 s de plus.
3. **Totaux de la suite variables.** Le `# tests` du TAP vaut 2 139 et 2 140 à la base, puis 2 171 et 2 166 au gel. Le fichier `detect-ee7-history` rapporte 22 tests sur 35 au passage 2 de la base, et 35 sur 35 seul. Ces totaux viennent d autres fichiers que celui-ci, et le compte des échecs est à 0 partout. C est à regarder à part.
4. **pid recyclé.** Le cas `mark(dead)` du test des propriétaires dépend d un pid mort qui n est pas encore réutilisé. Ce risque existait avant ce lot. Sous Windows, où les pid sont recyclés vite, les lancements côte à côte l augmentent un peu.

## Écarts

- Node 24 installé hors dépôt.
- `node_modules` copié d un autre arbre de travail au même `package-lock.json`.
- Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` n est pas apparu dans cet arbre ; rien de ce côté n est commité.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé.
