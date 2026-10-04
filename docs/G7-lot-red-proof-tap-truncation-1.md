# G7 du lot d'outil RED-PROOF-TAP-TRUNCATION-1 : un TAP tronqué de `scripts/red-proof.mjs` ne se lit jamais comme un verdict

- **Plan** : `docs/G0-lot-red-proof-tap-truncation-1.md`. **Base** : `6dd2ecb7` (tête de la PR #113, gel `4cf8134`, empilement).
  Branche `recherches/red-proof-tap-truncation-1`. Commits : `31a2bc7` (G0), `2c30798` (tests rouges), `de8ab67` (code, premier gel), `fc510e2`
  (G7) ; pli de la G2 : `50104ae` (tests), `73d6ee4` (code, **gel**), puis ce G7 révisé. Hôte de mesure : Linux, 4 cœurs, Node v22.22.2.

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
- G2 neuve faite et pliée (section ci-dessous).

## Questions pour MONARK

- **Q-RPT-1** : sous Windows, Node rend déjà stdout bloquant pour un tuyau (`lib/net.js`) : le saut 1 n'y existe sans doute pas. Le
  constat de la G2 venait-il de Linux ? Sous Windows, le test fixe `sync_out` est vert même sans correctif ; la garde y vaut pareil.
- **Q-RPT-2** : `PRELOAD` passe par `process.stdout._handle.setBlocking`, interne mais stable depuis Node 6 (même usage dans `lib/net.js`).
  Sous Node 24 (hôte), confirmer qu'un passage reste complet (une ligne `# red-proof child exit 0` dans `base.tap`) ; sinon tout passage
  sort `inconclusive_truncated`, jamais un faux verdict.
- **Q-RPT-3** : un passage où seule la ligne de sortie manque (TAP sinon complet) est refusé `inconclusive_truncated`. Ce refus prudent
  vous convient-il, ou faut-il ne nommer que le plan court ?

## Pli de la G2 (instance neuve : APPROUVE-AVEC-CORRECTIONS, rien de bloquant)

Rapport : `scratchpad/G2-red-proof-tools.md` (sondes `scratchpad/g2-rpt/`). La G2 confirme la cause sous Node 24.21.0 : sans
`PRELOAD`, 44 passages courts sur 96 (`detect-ee7-history`, plans 17 à 31, exit 0) ; avec, 96/96 à `1..33`.

| Point | Changement | Test (rouge à la base `6dd2ecb7`) | Tueur |
|---|---|---|---|
| **G10** (à corriger) : sans `inconclusive_truncated` dans la liste de l.207, un tueur tiré sur un TAP tronqué se lit **`killed`** | aucun code (l.207 était juste, sans test) | `red_proof_counts_a_drawn_killer_whose_run_is_truncated_inconclusive_never_killed` : nouveau module `lib/cut.ts`, le tueur `CUT = true` fait geler stdout (`cork`) ; tir `inconclusive_truncated` → `inconclusive`, preuve refusée | l.207 (G10 déclaré) |
| **G9**, **G14** : la base seule tronquée | aucun code | `red_proof_names_a_truncation_at_base_alone_inconclusive` (base tronquée, gel `pass` : `inconclusive`, motif nommé) | l.178 (G9 déclaré) ; G14 tué aussi |
| **G2**, **G3**, **G4** : ancre de `# duration_ms`, plan long, plan absent | aucun code | corps de `red_proof_names_a_tap_without_its_plan_or_summary_truncated` élargi (plan `1..3` pour 2, résumé sans plan, `# duration_ms` coupé dans sa ligne, ligne de sortie sans nonce) | l.99 déclaré ; G2, G3, G4 tués |
| **Q-RPT-3** / **m-2** : la ligne de sortie pouvait être imitée (`console.log`) ou perdue (`process.stdout.write` remplacé) | l.38 : la ligne porte un **nonce par passage** (`RED_PROOF_EXIT`, `randomBytes`, l.164-167), écrite par `writeSync(1, …)` et **seulement si rien n'attend dans la file** de `process.stdout` (sinon : pas de ligne, troncature nommée) ; l.100 l'exige | `red_proof_reads_a_spoofed_exit_line_without_the_run_nonce_as_truncated` | l.100, le nonce retiré de l'expression |
| **m-1** : un petit-enfant lancé avec `process.execArgv` héritait du `PRELOAD` et écrivait la ligne sur son propre stdout (faux `other-fail`) | l.38 : l'enfant **retire le nonce de son env** ; sans nonce, le module n'écrit rien | `red_proof_exit_line_never_reaches_a_grandchild_spawned_with_the_childs_execargv` (exactement une ligne, `grand_json` vert) | l.38, `delete` retiré |

La perte réelle est désormais simulée par `process.stdout.cork()` (les écritures restent en file à la sortie forcée, le mécanisme du
saut 1) au lieu du remplacement de `process.stdout.write`, que `writeSync` contourne exprès.

Mutants de la G2 rejoués à la main sur le gel `73d6ee4` (Node 24.21.0, fichier entier) : G1, G2, G3, G4, G9, G10, G11 (désormais la
condition « file vide »), G12, G13, G14, G15 tués ; survivent G5, G6, G8 (affaiblissements notés par la G2) et G7 (ancre retirée, le
nonce reste exigé). Mutant neuf G16 (nonce constant) tué par 19 tests.

Oracle du gel `73d6ee4` :
- `node scripts/red-proof.mjs --base 6dd2ecb7 --gel 73d6ee48 --repo /home/user/monark-governance-rt --draw 7 --seed 37` : **OK**, exit 0 ;
  7 F2P, 22 inchangés, 7 tueurs tirés (la population), 7 tués ; `RED-PROOF.json` sha256 `ca12d881…`, digest `f4641185…`.
- `test/red-proof.test.ts` : 28/29 sous Node 22 (le rouge préexistant `vi_hangs`), **29/29 sous Node 24.21.0**.
- `tsc` vert (aussi au commit des tests), `lint:ratchet` 69/69, `gate:vocab` OK ; adresses des tueurs 29/29 (contrôleur).
- R-25 par `r25()` sur `6dd2ecb7...HEAD` : +118/−33, **151** (sous 547).
- Fait vu en passant : deux suites lancées en parallèle sous `node --test` sans `PRELOAD` (la commande `npm test` du dépôt), l'une a
  rendu 18 tests au lieu de 29, exit 1 sans rouge de plus. `npm test` lui-même est exposé au saut 1 ; hors zone du lot, item à
  former (NPM-TEST-FORCE-EXIT-TRUNCATION-1, propriétaire MONARK).

Réponses de la G2 consignées : Q-RPT-1 (Linux, oui ; neutre sous Windows), Q-RPT-2 (confirmé sous Node 24.21.0 : ligne de sortie dans
`base.tap` et `gel.tap`), Q-RPT-3 (garder le refus, durci comme ci-dessus).

## Re-revue de la G2 (APPROUVE ; survivants mineurs tués)

Rapport : `scratchpad/G2-red-proof-tools-rr.md`. Commit `4d7cb93` (tests seuls, **gel** `4d7cb93`, aucun code changé) :

| Survivant | Test | Résultat (mutant à la main, Node 24.21.0, lanceur protégé) |
|---|---|---|
| **W2** (l.38, `writeSync(1, ` → `process.stdout.write(`) | `red_proof_keeps_the_exit_line_when_a_test_replaces_stdout_write` (fichier fixe `mock` : `mock_lost` se lit `missing`, refus ; le passage n'est pas tronqué ; une ligne de sortie à nonce) | tué (tueur déclaré) |
| **W4b** (l.100, `${nonce}` → `[0-9a-f]+`) | `red_proof_reads_a_wrong_or_stale_nonce_as_truncated` (unitaire : nonce faux ; passage : base et gel portent des nonces différents) | tué (tueur déclaré) |
| **W5** (l.164, nonce constant) | même test | tué |

**Limite déclarée** : un test délibérément malveillant peut lire le nonce dans `/proc/self/environ` (le bloc initial n'est pas effacé
par `delete process.env`) et imiter la ligne ; l'issue n'est alors qu'un `missing` (refus), jamais un F2P, un `pinned` ni un tueur
`killed`.

Oracle du gel `4d7cb93` : `--base 6dd2ecb7 --gel 4d7cb934 --draw 9 --seed 37` : **OK**, exit 0 ; 9 F2P, 22 inchangés, 9/9 tués ;
`RED-PROOF.json` sha256 `49c3f0d7…`, digest `8d252e20…`. `test/red-proof.test.ts` : 31/31 sous Node 24.21.0, 30/31 sous Node 22
(`vi_hangs`, préexistant). `tsc` vert ; adresses des tueurs 31/31. R-25 sur `6dd2ecb7...HEAD` : **169**.

## Sortie

Prêt pour le contrôle par diff de MONARK. Item RED-PROOF-TAP-TRUNCATION-1 clos au gel `4d7cb93` (pli de la G2 et de sa re-revue) ; Q-RPT-1 à Q-RPT-3 répondues par la G2. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci` n'est pas commis ; rien n'est
poussé.
