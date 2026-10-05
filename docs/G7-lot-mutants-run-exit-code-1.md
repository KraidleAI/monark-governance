# G7 du lot MUTANTS-RUN-EXIT-CODE-1 : `scripts/mutants/run.mjs` lit aussi le code de sortie de l enfant, et un désaccord entre ce code et les entrées TAP est nommé

- **Plan** : `docs/G0-lot-mutants-run-exit-code-1.md` (commit `d7356b1c`).
- **Base** : `53c7f15d` (`origin/lot/etude-suite`) ; le tronc a avancé pendant le pli (`d305ae15`, PR #142 TEST-FORCE-EXIT-REPORT-LOSS-1), fusionné par `61b1a04b` (commit de fusion, sans conflit). Branche `recherches/mutants-run-exit-code-1` ; tests `bedae625`, correctif `299470dd` (premier gel), G7 `478f5d6b` ; pli du G2 : tests `5412baf4`, correctif `7575bd8d` (**gel** ; `run.mjs` identique après la fusion), fusion du tronc `61b1a04b`, puis cette mise à jour du G7 (section G2 en fin).
- **Demande** : MONARK, `96aeca9` point 3 (zone `scripts/mutants/` ouverte, tests d abord avec un tueur).
- **Hôte** : Linux, Node 24.21.0 (installé hors dépôt), 4 cœurs, partagé avec d autres sessions ; sans proxy pour les tests.

## Règle tenue (celle du G0)

Tue iff une entrée de premier niveau échoue par assertion et l enfant sort non nul ; survit iff toutes les entrées sont `ok` et l enfant sort 0 ; non conclu sinon. Trois cas portent désormais une note dans le champ `note` du résultat (premier passage, rejeu et ligne de base) et sur la ligne de `RESULTS.txt` qui lui répond (la ligne du mutant, son segment `rejeu`, la ligne `BASELINE` : pli du G2, m-2) ; la note finit par `(TAP cut: no closing summary)` quand le TAP n a pas son `# duration_ms` final (pli du G2, m-4) :

- `exit N without a failing entry` : sortie non nulle, toutes les entrées `ok` (était **survit**, le défaut du constat) ;
- `exit N without a test entry` : aucune entrée (déjà non conclu, désormais nommé) ;
- `exit 0 with N failing entr(y|ies)` : sortie 0 avec un `not ok` (était **tue** si l échec était une assertion).

Un enfant mort (erreur, signal, 134) reste non conclu sans note ; un échec sans assertion reste non conclu (VERDICT, lot M-6 ; D-4 est le rejeu : pli du G2, m-3). Une ligne de base en désaccord est non conclue : aucun mutant ne tourne dessus.

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

- **Q-1** (MONARK, reprise du G0) : « sortie non nulle, toutes les entrées `ok` » est non conclu dans ce lot, pas tue. Le compter tue (non strict) changerait la règle d assertion (VERDICT, lot M-6) ; à toi si tu le veux. Avis du G2 et proposition d item : section G2 ci-dessous.

## Sortie

LIVRÉ pour contrôle par MONARK. Premier livrable : rien poussé. Pli du G2 : branche poussée (`git push -u origin recherches/mutants-run-exit-code-1`), aucune PR. `packages/rpc-guard/bin/rpc-guard.mjs` non touché.

## G2

Revue neuve et adverse : `coordination/pieces/2026-10-04-G2-recherches/G2-mutants-run-exit-code-1.md` (dépôt recherches). Verdict : **APPROUVE SOUS RÉSERVE** (réserve m-2), aucun bloquant. Pli : tests `5412baf4` (rouges au G7 `478f5d6b`, sauf le test de m-1, qui serre), correctif `7575bd8d` (gel). `run.mjs` garde **302 lignes** : aucune ligne `killer:` des autres lots ne bouge (`verifie-ancres` : 51 ANCRE).

| Point | Pli |
|---|---|
| m-1 (`run.mjs:217`, la garde `dead ? null :` sans test) | Test `mutants_a_dead_child_carries_no_exit_code_note` : G1, l exécution qui passe sa borne (`ETIMEDOUT`) de la fixture `to/` déjà en place, est non conclu, sans rejeu et **sans note**. Tueur `run.mjs:217 CONST "note: dead ? null :" -> "note: false ? null :"`. Le test est vert au G7 comme à la base (il serre, sans F2P : red-proof le refuse « self-confirming ») ; le tueur est appliqué à la main sur un clone jetable : **tué** par assertion (note `exit 7 without a test entry (TAP cut: no closing summary)` au lieu de `null`), et le test est vert sur ce clone sans le tueur. Le code de sortie de G1 (7 : le lanceur de Node 24 sur `SIGTERM`) n est pas asserté. |
| m-2 (la réserve ; ligne `BASELINE`, `run.mjs:247`, et segment `rejeu` de `lineOf`, l.135) | **Imprimé**, sur la même ligne : la ligne `BASELINE` finit par ` ; <note>` ; le segment `rejeu` porte la note dans ses parenthèses, `(0 rouge(s), 1 vert(s), <note>)`, pour ne pas la confondre avec celle du premier passage. La phrase « Règle tenue » ci-dessus est désormais vraie pour les trois lignes. Tests `mutants_results_txt_carries_the_note_of_the_replay` (tueur `run.mjs:135 CONST "r.replay.note ? " -> "false ? "`) et `mutants_a_baseline_whose_exit_contradicts_its_entries_is_non_conclu_named_and_no_mutant_runs` (tueur `run.mjs:247 CONST "g.note ? " -> "false ? "`). |
| m-3 (G0 et G7 : D-4) | La règle « tue iff assertion » est rattachée au **VERDICT du lot M-6** (`classify` de `red-proof.mjs`) ; D-4, dans l en-tête de `run.mjs` (l.13, rejeu des survivants et des non conclus), n est plus cité que pour le rejeu. La phrase « le cahier disait « code non nul : tué » » est retirée du G0 : `96aeca9` ne porte pas cette formule ; la source de « juger sur le code » est l item MUTANTS-RUN-EXIT-CODE-1 de `docs/ETAT.md`. |
| m-4 (suggestion : TAP coupé ou complet) | **Fait** (peu coûteux) : `cut`, la première condition de `truncation()` de `scripts/red-proof.mjs` (pas de `# duration_ms` final), calculé sur la l.213 ; toute note d un TAP coupé finit par ` (TAP cut: no closing summary)`. Le verdict ne change pas. Test `mutants_the_note_says_whether_the_tap_was_cut` (tueur `run.mjs:217 CONST "cut ? \" (TAP cut" -> "false ? \" (TAP cut"`) : la coupe `tail` est nommée, la sortie 0 sur un TAP complet (`zero`) garde sa note nue. Le test du premier passage (`..._never_survit`) attend désormais les notes suffixées. |
| m-5 (base en contradiction, non testée) | Fixture `ecx/` (les mêmes fichiers, `e_second` rouge à la base), `FX_LOSE=tail` : la base lit une entrée `ok` et sort 1, donc `baseline.status` vaut `non conclu`, avec la note `exit 1 without a failing entry (TAP cut: no closing summary)` sur `RESULTS.json` comme sur la ligne `BASELINE` ; E1 donne `non conclu (base)` et ne tourne pas (`tap_sha256` nul) ; la campagne sort 1. |
| M7 (`odd` restreint) | Sans suite, comme le G2 (sans intérêt de mesure). |

Les campagnes `ec/` sont mises en cache par (mode, lignes, base rouge) : les quatre tests qui lisent la coupe `tail` ou `zero` partagent deux lancements. Les corps des deux tests du premier gel ne changent que par les notes attendues (`..._never_survit`) ou pas du tout (`..._never_killed`).

### Contrôles du pli (Node 24.21.0, sans proxy, `TMPDIR` propre)

- `node --test test/mutants-run.test.ts`, deux fois au gel : **51/51**, 0 échec (27,4 s et 27,3 s) ; deux fois après la fusion du tronc : 51/51 (36,7 s et 33,7 s).
- red-proof du pli, `--base 478f5d6b --gel 7575bd8d --draw 6 --seed 37` : 5 jugés ; **4 F2P** (`..._never_survit`, `..._tap_was_cut`, `..._note_of_the_replay`, `..._baseline_whose_exit_...`), tous rouges au G7 par `ERR_ASSERTION` ; 1 refusé « green at base » (le test de m-1, qui serre ; tueur appliqué à la main, ci-dessus) ; 4 tueurs tirés, **4 tués**. Sortie REFUSED (exit 1) du seul fait de ce test qui serre. `RED-PROOF.json` sha256 `1d4370090d2e53cb…`.
- red-proof du lot entier contre la tête du tronc, `--base d305ae15 --gel 61b1a04b --draw 7 --seed 37` : 6 jugés, 45 inchangés ; **5 F2P** ; 1 refusé « green at base » (le même) ; 5 tueurs tirés (`run.mjs:214` ×2, `:217` cut, `:135`, `:247`), **5 tués**. Exit 1, même cause. `RED-PROOF.json` sha256 `ec22c8c7c524c6c1…`. Avant la fusion, contre `53c7f15d` (`--gel 7575bd8d`) : même résultat, sha256 `11081295f4b899a4…`.
- `verifie-ancres.mjs . --touched d305ae15 HEAD` (et `53c7f15d` avant la fusion) : **51 tueurs, 51 ANCRE, 0 DERIVE, 0 PERDU**.
- `npm run test:main` après la fusion : 2 256 tests, 2 234 verts, 22 sautés, **0 échec** (171 s) ; au gel, avant la fusion : 2 237 / 2 215 / 22, 0 échec (163 s ; lanceur sans le préchargement `-r` du tronc, celui dont TEST-FORCE-EXIT-REPORT-LOSS-1 a mesuré les pertes de lignes).
- `npm run test:export` : 1/1 vert, après la fusion (71 s) comme au gel (62 s).
- Après la fusion : `tsc --noEmit` vert ; `lint` vert ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK.
- R-25 (`r25()` de `scripts/oracle/r25.mjs`) : lot `d305ae15...HEAD` STAT 77 + 15 = **92** (borne du G0 : 547 ; porte CI : 1 205), CONTENT 0, GREEN ; même compte contre `53c7f15d` avant la fusion ; pli seul `478f5d6b...7575bd8d` STAT 48 + 14 = 62. Documents hors du compte.

### Q-1 : avis du G2 et proposition d item

L avis du G2 est retenu : **« sortie non nulle, toutes les entrées `ok` » reste non conclu, nommé**. Sous isolation par processus, tout échec d un fichier donne une entrée `not ok` de fichier. Ce cas veut donc presque toujours dire que le rapport a été coupé, ce que la note dit désormais (`TAP cut`). Le compter tué compterait comme tués les mutants qui ne cassent que l import ou le chargement (X1, N1), contre la règle d assertion (VERDICT, lot M-6).

**Proposition d item MUTANTS-REPLAY-PROMOTE-1** (à MONARK, hors de ce lot) : une ligne non conclue au premier passage avec la note `exit N without a failing entry`, dont le rejeu sur toutes les cibles est `tue` (assertion lue et sortie non nulle), prend le statut du rejeu. La règle d assertion ne change pas. Ce qui change, c est la règle « statut de la ligne = premier passage » (D-4 n en fixe que le déclenchement). Le tué reste prouvé par une assertion lue. Tests d abord : une coupe `tail` limitée au premier passage (par exemple `FX_LOSE=first`, qui ne coupe pas le rejeu). Le fond relève de TEST-FORCE-EXIT-NEED-1 et de TEST-FORCE-EXIT-REPORT-LOSS-1 : sans perte de rapport, le cas disparaît.
