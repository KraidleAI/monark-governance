# G7 du lot d'outil MUTANTS-TEST-SUPPORT-1 : un module d'appui de test déclaré peut porter des tueurs

- **Plan** : `docs/G0-lot-mutants-test-support-1.md`. **Base** : `5803d966` (`origin/lot/etude-suite`, tronc). Branche
  `recherches/mutants-test-support-1`, worktree `/home/user/monark-governance-mt`. Commits : `dd71e513` (G0 et amendement daté
  d'ADR-METHODE-2 D2), `27546fc7` (tests rouges), `7aa262e0` (code, **gel**), puis ce G7. Hôte : Linux, Node v24.21.0. Rien n'est
  poussé ; le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci` n'est pas commis.

## Ce que fait le lot (gel `7aa262e0`)

| Outil | Code | Effet |
|---|---|---|
| `scripts/red-proof.mjs` | l.20 (en-tête, en place), l.51, l.54, l.240, l.270-275 (`supportOf`, ajoutée en fin) | un tueur sous `test/` est valide si le fichier de test qui le porte importe ce module par un `import` statique relatif (accolades sur plusieurs lignes admises, `import type` exclu) ; un `*.test.ts` est refusé partout, un module sous `test/` non importé aussi ; message de refus inchangé |
| `scripts/mutants/run.mjs` | l.8 (en-tête, en place), l.120, l.123, l.175 | une ligne de tueur ou de table sous `test/` est jouée si un fichier de test des motifs de `package.json` l'importe directement (importeurs directs de `targetsOf`) ; un `*.test.ts` reste `anchor-lost` « is test code » |
| `docs/adr/ADR-METHODE-2.md` | case D2, ligne datée 2026-10-04 | amendement de la convention du tueur |

**Aucune ligne déplacée** dans `red-proof.mjs` avant sa fin ni dans `run.mjs` : les 16 adresses `scripts/red-proof.mjs:<n>` de
`test/red-proof.test.ts` et les 43 adresses `scripts/mutants/run.mjs:<n>` de `test/mutants-run.test.ts` sont justes au gel sans
réécriture (contrôle par `parseKiller` : 63 tueurs d'outil sur 63 trouvent leur `<before>` une fois sur leur ligne).

## Tests (rouges à la base `5803d966` par `ERR_ASSERTION`), tueurs

| Test | Ce qu'il fixe | Tueur (tiré par red-proof, tué) |
|---|---|---|
| `red_proof_admits_a_killer_on_a_support_module_its_test_file_imports` (fichier neuf `test/red-proof-support.test.ts`) | tueur sur `test/place.ts`, importé par son test (import sur plusieurs lignes) : `killerProblem` nul, F2P, tiré `killed` | l.54 `!supportOf(tree, from).includes(k.file)` → `true` |
| `red_proof_still_refuses_a_test_file_or_an_unimported_module_under_test` | `test/shared.test.ts` (importé) et `test/stray.ts` (non importé) refusés « is test code », exit 1 | l.54 clause `*.test.ts` retirée |
| `mutants_a_killer_or_a_row_mutates_a_support_module_a_test_file_imports` (fin de `test/mutants-run.test.ts`) | `--killers` K1 et ligne de table P1 sur `test/place.ts` : base verte, `tue`, cible `test/place.test.ts` | l.123 `targetsOf(...).direct.length === 0` → `true` |
| `mutants_still_refuse_a_test_file_or_an_unimported_module_under_test` | P2 (`test/shared.test.ts`, importé) et P3 (`test/stray.ts`) `anchor-lost` « is test code » | l.123 clause `*.test.ts` retirée |

`test/red-proof.test.ts` n'est pas touché (la pile de #113 le réécrit).

## Preuve red-proof sur le lot lui-même

`node scripts/red-proof.mjs --base 5803d966 --gel 7aa262e0 --repo /home/user/monark-governance-mt --draw 4 --seed 37` :

- essai 1 : REFUSED, les deux lignes de `test/mutants-run.test.ts` « missing » à la base (TAP de la base coupé à 39 entrées sur 45) ;
  sha256 `4b27ba83…` ;
- essai 2 : REFUSED, « not green at gel (other-fail) » : TAP du gel coupé à 29 entrées, entrée de fichier `exitCode: 1` ; sha256
  `19790e22…` ;
- essai 3 : **OK**, exit 0 ; 4 F2P, 43 inchangés, 4 tueurs tirés (la population), 4 tués ; `RED-PROOF.json` sha256 `6744d718…`.

Cause des deux premiers : la troncature de TAP que corrige RED-PROOF-TAP-TRUNCATION-1 (empilé sur #113, pas au tronc), déclenchée
ici par un rouge préexistant sur Linux : `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on` tourne 600 s puis échoue
(`[143, false]`), **aussi à la base** `5803d966` (mesuré seul sur un clone de la base). Lecture : le processus « vivant 6 s » de ce
test est un enfant de `spawn` que personne ne récolte pendant le `spawnSync` de l'outil ; sous Linux il reste zombie, son pid répond à
`kill(pid, 0)`, la file d'attente du verrou l'attend jusqu'à la borne. Non touché ; question Q-MTS-4.

## Rejeu de la campagne de L2-P1-a1 (`origin/lot/l2-p1-a1` `f5596bf3`, base du lot `45e7a112`)

Clone `--no-local` à `f5596bf3`, `node_modules` lié.

| Outil | Commande | Résultat |
|---|---|---|
| `run.mjs` du tronc (avant) | `--repo <clone> --base 45e7a112 --killers` | 0 tué sur 8, K1 à K8 `anchor-lost` ; `RESULTS.json` `7493d58f…` |
| `run.mjs` du gel | même commande | **8 tués sur 8**, base verte (8 verts), aucun survivant, aucun non conclu, restauration OK, exit 0 ; `RESULTS.json` sha256 `ea2f9d0c43723121fa5c0444961f63a1d5b75097433f82e4b68035ffed616890`, `tool_sha256` `c782086e…` |
| `red-proof.mjs` du tronc (avant) | `--base 45e7a112 --gel f5596bf3 --draw 3 --seed 37` | REFUSED, 8 « invalid killer … is test code » (`361fefff…`) |
| `red-proof.mjs` du gel | même commande | REFUSED, 8 « green at base: a self-confirming test » (`dab05c6f…`) : les tueurs sont désormais valides, mais P1-a1 n'ajoute que du code de test, le module d'appui est copié à la base et chaque test y est vert. C'est le cas de `--test-only` (RED-PROOF-TEST-ONLY-1), pas de ce lot |
| pile complète + ce lot (simulation) | fusion à blanc de `e05b93c0` et du gel, `--test-only`, worktree de P1-a1 avec un G0 simulé non commis (« red-proof: test-only » et les 8 tueurs) | **OK** : 8 `pinned`, 8 tueurs tirés au gel, 8 `killed` (`852ff5fd…`). Sans G0 dans le diff : REFUSED, « no G0 of the diff declares "red-proof: test-only" » |

La réserve Q-1 de P1-a1 est levée côté campagne de mutants (8/8 par l'outil). La preuve red-proof de P1-a1 demande en plus la pile
de #113 (mode `--test-only`) et une ligne de G0 de P1-a1 ; question Q-MTS-1.

La table de 13 lignes de LOOPBACK-PORTS-1 (Q-CORR-2) n'est pas dans le dépôt : elle mute `test/helpers/loopback.ts`, que des
fichiers `test/*.test.ts` importent directement, donc l'outil du gel la jouera ; rejeu laissé à MONARK à la fusion.

## Contrôles

- `test/red-proof.test.ts`, `test/mutants-run.test.ts`, `test/red-proof-support.test.ts` au gel : 62/63 ; le seul rouge est
  `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on`, préexistant (rouge à la base, voir plus haut).
- `npx tsc --noEmit` vert ; eslint vert sur les deux fichiers de test ; `lint:ratchet` 69/69 ; `gate:vocab` OK.
- R-25 par `r25()` sur `5803d966...HEAD` : +98/−8, **106 lignes comptées** (borne 547) ; G0, G7 et ADR hors compte.

## Conflits attendus avec #113 et sa pile

Fusions à blanc (`git merge --no-commit --no-ff` sur un clone) du gel dans chaque tête :

| Tête | Conflit textuel | À faire à la fusion |
|---|---|---|
| #113 `recherches/red-proof-junction-1` `6dd2ecb7` | aucun | rien : le contrôle d'adresses reste juste (69/69) |
| `recherches/red-proof-tap-truncation-1` `1994b52f` | aucun | **sémantique** : la pile insère 3 lignes avant l.54 de `red-proof.mjs` ; les 2 tueurs de `test/red-proof-support.test.ts` passent de `scripts/red-proof.mjs:54` à `:57` (72 autres justes) |
| `recherches/red-proof-test-only-1` `e05b93c0` | **un** : `scripts/red-proof.mjs`, la ligne `const row = … killerProblem(t.killer, gelTree)` (l.240 ici, l.270 là), voisine des lignes `verdictOf`/`rows.push` réécrites par le mode `--test-only` | garder les lignes de la pile et y passer `f` : `killerProblem(t.killer, gelTree, f)` ; réécrire les 2 adresses `:54` → `:57` ; vérifié sur le clone : `test/red-proof-support.test.ts` vert sur l'arbre résolu, 85/87 adresses justes avant la réécriture des 2 |

Ordre conseillé : celui qui fusionne en second fait la réécriture. `supportOf`, ajoutée en fin de fichier, ne heurte pas la garde
d'entrée que #113 réécrit (l.266) ; `run.mjs` et `test/mutants-run.test.ts` ne sont pas touchés par la pile. Le mode `--test-only`
classe déjà `test/**` hors production : un lot comme P1-a1 y passe tel quel.

## Questions pour MONARK

- **Q-MTS-1** : la preuve red-proof de P1-a1 reste refusée par l'outil du tronc même avec ce lot (« green at base » : le lot n'ajoute
  que du code de test). Faut-il fusionner P1-a1 sur la campagne de mutants 8/8 (`ea2f9d0c…`) seule, ou attendre `--test-only` de la
  pile de #113 et une ligne « red-proof: test-only » (avec ses 8 tueurs) au G0 de P1-a1 (simulation OK, `852ff5fd…`) ?
- **Q-MTS-2** : la déclaration est implicite (un import suffit) ; aucune ligne neuve n'est demandée aux lots. Faut-il plutôt une
  déclaration explicite (une ligne dans le test ou le module) ? Elle obligerait à amender P1-a1 avant son rejeu.
- **Q-MTS-3** : les deux outils ne lisent pas l'import de la même façon : red-proof lit les `import` statiques relatifs du fichier qui
  porte le tueur ; mutants prend les importeurs directs de son graphe (`targetsOf` : aussi `export … from` et `import("…")` d'un
  littéral) parmi tous les fichiers de test de la suite. Les unifier aurait déplacé des lignes de `red-proof.mjs` (conflits avec la
  pile) : acceptable en l'état, ou item à former après la fusion de la pile ?
- **Q-MTS-4** : `mutants_a_live_waiter_ahead_passes_first_then_the_run_goes_on` est rouge (600 s) sur Linux, à la base comme au gel
  (enfant zombie). Item à former (zone MONARK : le test et `scripts/oracle/lock.mjs`) ?

## Sortie

Prêt pour la G2 neuve puis le contrôle par diff de MONARK. Item MUTANTS-TEST-SUPPORT-1 clos au gel `7aa262e0` sous réserve de Q-MTS-1
à Q-MTS-4. RED-PROOF-JUNCTION-1 reste porté par #113.
