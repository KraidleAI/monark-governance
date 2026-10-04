# G7 du lot d'outil RED-PROOF-TAP-TRUNCATION-1 : un TAP tronqué de `scripts/red-proof.mjs` ne se lit jamais comme un verdict

- **Plan** : `docs/G0-lot-red-proof-tap-truncation-1.md`. **Base** : `6dd2ecb7` (tête de la PR #113, gel `4cf8134`, empilement).
  Branche `recherches/red-proof-tap-truncation-1`. Commits : `31a2bc7` (G0), `2c30798` (tests rouges), `de8ab67` (code, **gel**), puis ce
  G7. Hôte de mesure : Linux, 4 cœurs, Node v22.22.2.

## Cause et correctif

| Saut | Mécanisme (mesuré) | Correctif | Garde |
|---|---|---|---|
| 1. Enfant → lanceur (le constat de la G2) | le lanceur passe `--test-force-exit` à l'enfant ; l'enfant fait `process.exit()` dès que son rapporteur se détache de stdout ; sous POSIX ce tuyau est non bloquant, ce qu'il n'a pas pris est perdu. Le lanceur imprime un plan **cohérent** avec ce qu'il a reçu (`1..28` pour 33), exit 0 | `runFile` charge `PRELOAD` (`--import=data:…`, l.36-38), hérité par l'enfant : `process.stdout._handle.setBlocking(true)` (Node le fait déjà sous Windows, `lib/net.js`) | l'enfant écrit en dernier `red-proof child exit <code>` ; `truncation` (l.95-102) l'exige |
| 2. Lanceur → `spawnSync` | queue du TAP perdue (ni `1..N` ni résumé), sous charge : 3 fois sur ≈ 520 passages ; mécanisme exact non établi | le même `PRELOAD` rend aussi bloquant le stdout du lanceur (0 sur 320 en regard, non significatif) | `truncation` exige `# duration_ms` en dernière ligne et un plan égal au nombre d'entrées de premier niveau |

Un passage dont `truncation` rend un motif a le statut **`inconclusive_truncated`** (sauf s'il est déjà `inconclusive`, l.173) ; la ligne
a le verdict `inconclusive`, motif « a run's TAP is truncated (inconclusive_truncated) » (l.178) ; un tueur tiré sur un TAP tronqué est
`inconclusive` (l.207), jamais tué. Si le module n'était pas chargé, chaque passage serait `inconclusive_truncated` : échec fermé.

## Reproductions

- Saut 1, fort taux (`--import` d'un module qui bloque la boucle du **lanceur seul** par tranches de 400 ms pendant 3 s ; 33 tests dont
  11 rouges à 5 Ko de diagnostic) : sans correctif, **5 sur 6 tronqués** (`1..28`, `1..30`), exit 1 dû aux rouges ; sans
  `--test-force-exit`, 33 ; avec le `setBlocking` seul, 6/6 à 33.
- Garde sur ces mêmes passages réels : sans `setBlocking`, 7 sur 8 rendent « no child exit line » (dont un à `1..33` où seule la ligne de
  sortie manquait : refus prudent), 1 complet ; avec le `PRELOAD` du gel, 8/8 complets.
- Déterministe, dans le test fixe : une écriture d'1 Mio sur stdout laisse `writableLength > 0` sans correctif (rouge à la base) ; 0 avec.
- Le rapporteur `spec` passe par le même saut 1 : sa non-troncature dans le constat est un échantillon.

## Tests (rouges à la base `6dd2ecb7` par assertion), tueurs

| Test | Rouge à la base | Tueur (tiré, tué) |
|---|---|---|
| `red_proof_child_stdout_writes_are_synchronous_so_a_forced_exit_drops_nothing` | `sync_out` lu `assert-fail` des deux côtés | l.38 `setBlocking?.(true)` → `(false)` |
| `red_proof_names_a_cut_child_stream_inconclusive_truncated_never_a_misread` | `cut_first` lu `pass`, `cut_lost` lu **`missing`** (le faux refus du constat), plan du lanceur `1..1` cohérent | l.100 SDL du contrôle de la ligne de sortie |
| `red_proof_names_a_tap_without_its_plan_or_summary_truncated` | `truncation` absent (import dynamique : le fichier se charge à la base) | l.99 `Number(plan[1]) !== n` → `false` |

Adresses des tueurs : le script gagne 12 lignes (l.36-38 et l.95-103) ; les 22 adresses existantes sont réécrites par une
correspondance de lignes base → gel (difflib, blocs égaux), puis toutes revérifiées (forme fermée, `<before>` exactement une fois sur la
ligne citée, déclaration juste dessous) : **25/25**. Aucun corps de test existant n'est touché (une ligne `// killer:` changée ne juge
jamais un test) : 22 inchangés.

## Oracle

- `node scripts/red-proof.mjs --base 6dd2ecb7 --gel de8ab67b --repo /home/user/monark-governance-rt --draw 3 --seed 37` : **OK**, exit 0 ;
  3 jugés F2P, 22 inchangés, 3 tueurs tirés (la population), 3 tués ; `RED-PROOF.json` sha256 `bbb04477…`, digest `d40f5185…`.
- `test/red-proof.test.ts` au gel : 24/25. L'échec, `red_proof_fails_on_a_stillborn_draw_or_an_empty_diff` (`vi_hangs` lu `killed`
  sous Node 22), est **déjà rouge à la base** (G7 de RED-PROOF-JUNCTION-1) ; non touché.
- `npx tsc --noEmit` vert (aussi au commit des tests) ; eslint vert sur le test ; `lint:ratchet` 69/69 ; `gate:vocab` OK ;
  `test/mutants-run.test.ts` 21/21.
- R-25 par `r25()` sur `6dd2ecb7...HEAD` : +75/−29, **104 lignes comptées** (sous 547) ; G0 et G7 hors compte.

## Écarts au plan

- G0, « tests ≈ 30 » : +55 lignes de test et 22 adresses réécrites.
- Pas de destination fichier pour le TAP (`--test-reporter-destination`) : elle ne touche pas le saut 1 (l'enfant parle au lanceur par
  un tuyau que l'outil ne choisit pas), et son effet sur le saut 2 n'est pas mesurable à ces taux ; la garde couvre le saut 2.
- Pas encore de G2 neuve sur ce lot (à faire avant de passer la PR à MONARK, règle 4 amendée).

## Questions pour MONARK

- **Q-RPT-1** : sous Windows, Node rend déjà stdout bloquant pour un tuyau (`lib/net.js`) : le saut 1 n'y existe sans doute pas. Le
  constat de la G2 venait-il de Linux ? Sous Windows, le test fixe `sync_out` est vert même sans correctif ; la garde y vaut pareil.
- **Q-RPT-2** : `PRELOAD` passe par `process.stdout._handle.setBlocking`, interne mais stable depuis Node 6 (même usage dans `lib/net.js`).
  Sous Node 24 (hôte), confirmer qu'un passage reste complet (une ligne `# red-proof child exit 0` dans `base.tap`) ; sinon tout passage
  sort `inconclusive_truncated`, jamais un faux verdict.
- **Q-RPT-3** : un passage où seule la ligne de sortie manque (TAP sinon complet) est refusé `inconclusive_truncated`. Ce refus prudent
  vous convient-il, ou faut-il ne nommer que le plan court ?

## Sortie

Prêt pour la G2 neuve puis le contrôle par diff de MONARK. Item RED-PROOF-TAP-TRUNCATION-1 clos au gel `de8ab67` sous réserve de
Q-RPT-1 à Q-RPT-3. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci` n'est pas commis ; rien n'est
poussé.
