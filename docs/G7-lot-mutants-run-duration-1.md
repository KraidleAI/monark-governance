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

## Pli de la G2 (2026-10-04)

Revue : `coordination/pieces/2026-10-04-G2-recherches/G2-mutants-run-duration.md`, verdict APPROUVE-AVEC-CORRECTIONS, aucun bloquant. Pli au commit suivant `3f79a8bc`, `test/mutants-run.test.ts` seul ; aucune ligne ajoutée ni retirée, chaque modification reste sur sa ligne.

### Plié

- **C-1, G27 : `WAIT = 2000`** (`MARGIN = 1500`, `POLL = 100`). La borne haute devient 3 600 ms, sous `2 * WAIT` = 4 000. Le commentaire au-dessus le dit. Mesuré dans une copie jetable (dépôt git initialisé, `run.mjs:231` muté, `waited_ms` journalisé), G27 lancé seul :

  | `run.mjs:231` | `waited_ms` | G27 |
  |---|---|---|
  | `maxMs: o.wait }` (non muté) | 2 015 | vert (2,5 s) |
  | `maxMs: 2 * o.wait }` | 4 030 | **rouge (tué)** |
  | `maxMs: 3 * o.wait }` (tueur déclaré) | 6 037 | **rouge (tué)** |
  | `maxMs: o.wait + 1000 }` | 3 026 | vert (survit) |

  Le mutant `o.wait + 1000` survit : un décalage absolu de 1 s reste sous toute borne qui laisse 1 s de marge à un hôte chargé. Il n est pas le tueur déclaré ; je le note ici.
- **M-1 : `runAsync` passe `timeout: 600_000` à `spawn`**, la même borne que `run()` (`spawnSync`). Un enfant qui attend la mémoire par défaut (5 400 000 ms) est tué à 600 s ; `after()` n attend plus 90 minutes.
- **M-3 : le propriétaire mort est le pid `0x7FFFFFF0`**, qu aucun hôte n alloue, au lieu d un pid libéré. J ai lu `lock.mjs` d abord : `ownerPid` exige un entier > 0 (2 147 483 632 l est), et `alive()` appelle `process.kill(pid, 0)`. Linux : `pid_max` vaut au plus 4 194 304, `kill` rend ESRCH (vérifié ici, Node 24) ; `zombie()` n est pas atteint. Windows : `uv_kill` échoue à `OpenProcess` (ERROR_INVALID_PARAMETER), traduit en ESRCH. L intention reste : un propriétaire marqué `oracle/lock.mjs` dont le pid est mort est repris (exit 0) ; les deux autres lignes à ce pid (`lock: "sh"`, pas de `lock`) ne le sont jamais (exit 4). Le `spawnSync` qui fabriquait le pid libéré disparaît. Point ouvert 4 ci-dessus : levé pour ce test.

### Laissés ouverts

- **M-2** (seuil mémoire de 4 096 Mo avec plus de processus en même temps) : un défaut ne donne qu un rouge (`memoire` au lieu de `verrou`), jamais un vert à tort ; la dépendance existait avant le lot. La lever demanderait de changer le plancher de tests qui ne sont pas jugés ici. À mesurer chez toi sous Windows.
- **M-4** (macOS, attendant non récolté de G28) : macOS n est pas une cible ; l attente de 60 s absorbe le délai. Information seulement.
- **M-5** (« sous 60 s dans la suite » dépend de l hôte) : seule ta CI et ton poste Windows tranchent, comme le dit le point ouvert 1. Ici, après le pli et sur un hôte chargé (moyenne de charge 7 à 21, une autre session tournait), voir les chiffres ci-dessous.
- **M-6** (`--test-skip-pattern` sans motif de nom : les lancements anticipés partent quand même, environ 7 s) : sans effet sur un verdict ; la revue a vérifié qu il ne reste ni racine ni processus.

### Preuve après le pli (Node 24.21.0, sans proxy)

- `tsc --noEmit` : 0. `eslint test/mutants-run.test.ts` : 0.
- `node --test test/mutants-run.test.ts`, deux fois : 45/45 et 45/45, 43,4 s puis 38,7 s réels (hôte chargé ; G27 coûte 1 s de plus qu avant le pli).
- `npm test` complet : exit 0, 2 117 tests, 2 095 verts, **0 échec**, 22 sautés, 515 s de mur sous une charge de 21 ; les 45 tests du fichier font une somme de 95,5 s sous cette charge (à ne pas comparer aux 34,6 s du gel mesurés à vide ; voir M-5).
- Adresses des tueurs : 45/45 vérifiées avec `parseKiller` (texte avant présent exactement une fois sur sa ligne, ligne suivante `test(`).
- `node scripts/red-proof.mjs --base ad2354df --gel <arbre> --repo <arbre> --test-only --out <brouillon>` : **OK**, exit 0. 7 jugés, 38 inchangés, 7/7 **pinned**, 7/7 tueurs **tués**. `RED-PROOF.json` sha256 `84fe4eb73d8ef64c…` (horodaté).
- R-25 : `git diff --numstat ad2354df -- scripts test` : `64 28 test/mutants-run.test.ts`, **92** ≤ 547. Le pli seul : 5 insertions, 5 suppressions.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé.
