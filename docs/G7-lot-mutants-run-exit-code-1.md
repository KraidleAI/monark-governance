# G7 du lot MUTANTS-RUN-EXIT-CODE-1 : `scripts/mutants/run.mjs` lit aussi le code de sortie de l enfant, et un désaccord entre ce code et les entrées TAP est nommé

- **Plan** : `docs/G0-lot-mutants-run-exit-code-1.md` (commit `d7356b1c`).
- **Base** : `53c7f15d` (`origin/lot/etude-suite`). Branche `recherches/mutants-run-exit-code-1` ; tests `bedae625`, correctif `299470dd` (**gel**), puis ce G7.
- **Demande** : MONARK, `96aeca9` point 3 (zone `scripts/mutants/` ouverte, tests d abord avec un tueur).
- **Hôte** : Linux, Node 24.21.0 (installé hors dépôt), 4 cœurs, partagé avec d autres sessions ; sans proxy pour les tests.

## Règle tenue (celle du G0)

Tue iff une entrée de premier niveau échoue par assertion et l enfant sort non nul ; survit iff toutes les entrées sont `ok` et l enfant sort 0 ; non conclu sinon. Trois cas portent désormais une note dans le champ `note` du résultat (premier passage, rejeu et ligne de base) et dans la ligne de `RESULTS.txt` :

- `exit N without a failing entry` : sortie non nulle, toutes les entrées `ok` (était **survit**, le défaut du constat) ;
- `exit N without a test entry` : aucune entrée (déjà non conclu, désormais nommé) ;
- `exit 0 with N failing entr(y|ies)` : sortie 0 avec un `not ok` (était **tue** si l échec était une assertion).

Un enfant mort (erreur, signal, 134) reste non conclu sans note ; un échec sans assertion reste non conclu (D-4). Une ligne de base en désaccord est non conclue : aucun mutant ne tourne dessus.

## Changement

| Fichier | Changement |
|---|---|
| `scripts/mutants/run.mjs` | `runSet` : `lost` (aucune entrée en échec, sortie non nulle) et `odd` (entrée en échec, sortie 0) sur la ligne 214 ; le statut les lit (l. 215) ; `note` ajouté au résultat (l. 217) ; la ligne d un mutant reprend `f.note` (l. 274). En-tête VERDICT réécrit sur ses lignes. **Nombre de lignes inchangé (302)** : les lignes `killer:` existantes restent justes. |
| `scripts/mutants/run.d.mts` | `RunResult.note?: string \| null`. |
| `test/mutants-run.test.ts` | Fixture `ec/` (deux tests, `e_first` lit `F`, `e_second` lit `E`) et `LOSE`, préchargement de l outil (`--import`, `syncBuiltinESMExports`) qui enveloppe `spawnSync` pour les seuls lancements `--test` : `FX_LOSE=tail` coupe le TAP à la première ligne `not ok`, code gardé (la perte sous `--test-force-exit`, non reproductible d elle-même sous Linux où un tube s écrit en synchrone) ; `FX_LOSE=zero` rend 0 à un TAP qui porte un `not ok`. Deux tests. |

## Tests et tueurs

| Test | Base | Gel | Tueur |
|---|---|---|---|
| `mutants_a_non_zero_exit_without_a_failing_entry_is_non_conclu_named_never_survit` | rouge par assertion : E1 **`survit`**, note `null` | vert : E1 non conclu (1 vert, sortie 1, `exit 1 without a failing entry`, rejeu non conclu) ; F1 non conclu (0 entrée, `exit 1 without a test entry`) ; campagne exit 1 | `run.mjs:214 CONST "bad.length === 0 && r.status !== 0" -> "false"` |
| `mutants_exit_zero_with_a_failing_entry_is_non_conclu_named_never_killed` | rouge par assertion : E1 **`tue`**, campagne exit 0 | vert : E1 non conclu, `exit 0 with 1 failing entry`, campagne exit 1 | `run.mjs:214 CONST "bad.length > 0 && r.status === 0" -> "false"` |

Les deux tests prennent ensemble environ 4,9 s à la base (deux lancements synchrones sur un dépôt de deux fichiers, aucun délai).

## Oracle

- `node scripts/red-proof.mjs --base 53c7f15d --gel 299470dd --repo <worktree> --draw 2 --seed 37` : **OK**, exit 0 ; 2 tests jugés, **F2P** tous deux ; 45 inchangés ; 2 tueurs tirés (`run.mjs:214`, les deux) : **tués**. `RED-PROOF.json` sha256 `7b41ecaf37d87c4c…`.
- `verifie-ancres.mjs . --touched 53c7f15d HEAD` : **47 tueurs, 47 ANCRE, 0 DERIVE, 0 PERDU**.
- `node --test test/mutants-run.test.ts` au gel : **47/47**, 33,5 s.
- `npm run test:main` au gel : 2 241 tests, 2 219 verts, 22 sautés, **0 échec** (168 s).
- `npm run test:export` : 1/1 vert (58 s).
- `tsc --noEmit` vert ; `lint` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.

## R-25

`r25()` de `scripts/oracle/r25.mjs` sur `53c7f15d...299470dd` : STAT 38 insertions, 10 suppressions, **48** (borne du G0 : 547 ; porte CI : 1 205) ; CONTENT 0. Documents `docs/**/*.md` hors du compte.

## Écarts au plan

- Aucun sur la règle. La ligne 214 et la ligne 28 de l en-tête sont longues : c est le prix d un nombre de lignes inchangé.
- La perte de TAP est simulée par le préchargement (G0, Tests) : sous Linux elle ne se produit pas naturellement ; la mesure sous Windows reste à MONARK si elle est voulue.

## Questions

- **Q-1** (MONARK, reprise du G0) : « sortie non nulle, toutes les entrées `ok` » est non conclu dans ce lot, pas tue. Le compter tue (non strict) changerait D-4 ; à toi si tu le veux.

## Sortie

LIVRÉ pour contrôle par MONARK. Rien poussé, aucune PR. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.
