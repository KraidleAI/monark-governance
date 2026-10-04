# G7 du lot d'outil RED-PROOF-TEST-ONLY-1 : un mode `--test-only` de `scripts/red-proof.mjs` pour un lot qui n'ajoute que des épingles

- **Plan** : `docs/G0-lot-red-proof-test-only-1.md`. **Base** : `fc510e25` (tête de RED-PROOF-TAP-TRUNCATION-1, empilé sur la PR #113).
  Branche `recherches/red-proof-test-only-1`. Commits : `baff3a3` (G0), `26011bc` (tests rouges et types), `3f6c8d3` (code, **gel**),
  puis ce G7. Hôte de mesure : Linux, Node v22.22.2.

## Ce que fait le mode (gel `3f6c8d3`)

| Point du G0 | Code | Effet |
|---|---|---|
| Drapeau sans valeur, `--draw` refusé | l.215 (`--test-only`), l.220 | `--test-only --draw n` : exit 2, « --test-only fires every killer at gel: --draw does not apply » |
| Frontière de production | l.236 | tout chemin du diff (y compris non suivi, supprimé) hors `*.test.ts`, `test/`, `docs/**/*.md` ; écrit dans `files.production` dans les deux modes |
| Échec fermé | l.249, l.268, l.278 | production non vide en `--test-only` : aucun test lancé, aucune ligne, `ok: false`, exit 1, la preuve écrite et une ligne « --test-only refused: production files changed: … » |
| Vert des deux côtés | l.182 | en `--test-only`, après les refus communs (test 42, mort, sans tueur, tueur invalide, pas vert au gel) : base `pass` → `pinned` provisoire ; sinon refusé « red at base under --test-only » |
| Substitut du F2P | l.261-264 | chaque `pinned` : son tueur déclaré est tiré seul au gel (`fire`, restauration et sha256 comme le tirage, `killer-<n>.tap`) ; `killed` le garde `pinned`, `stillborn`/`invalid` le refusent (« its declared killer is … at gel: the test pins nothing it names »), `inconclusive` le rend `inconclusive` ; le tir est dans `kill` |
| Mode écrit | l.271, l.272 | `mode: "test-only"` ou `"f2p"` ; `kill: null` sur chaque ligne du mode F2P ; types dans `red-proof.d.mts` |

Le mode F2P est inchangé (mêmes lignes, mêmes verdicts ; `mode` et `files.production` ajoutés à la preuve).

## Tests (rouges à la base `fc510e25` par assertion : option inconnue, exit 2 sans preuve), tueurs

| Test | Ce qu'il fixe | Tueur (tiré, tué) |
|---|---|---|
| `red_proof_test_only_admits_a_pin_whose_declared_killer_kills_it_at_gel` | worktree au gel du dépôt fixe, un fichier de test neuf et une note `docs/` ; `--test-only` : exit 0, `ok`, `pin_ok` `pass`/`pass`/`pinned`, tir `killed`, `drawn: 0` ; sans le drapeau : refusé « green at base », `kill: null`, exit 1 | l.182 `t.base === "pass"` → `"skip"` |
| `red_proof_test_only_refuses_a_pin_whose_killer_survives` | une seconde épingle dont le tueur vise `lib/old.ts`, qu'elle n'importe pas : `stillborn`, refusée, exit 1 | l.263 `r.kill.outcome !== "killed"` → `false` |
| `red_proof_test_only_fails_closed_on_a_production_change` | le gel commit du dépôt fixe sous `--test-only` : aucune ligne, `files.production` = `lib/fresh.ts`, `lib/old.ts`, `packages/w/index.js` (la note `docs/` et les tests exclus), exit 1 ; `--test-only --draw` : exit 2 | l.249 `production.length > 0` → `false` |

Adresses des tueurs : le script gagne 9 lignes ; les 13 adresses déplacées sont réécrites par la correspondance base → gel (difflib)
et les 28 lignes `// killer:` revérifiées : **28/28**. Seules des lignes `// killer:` du test existant changent (0 autre ligne retirée) :
25 tests inchangés.

## Oracle

- `node scripts/red-proof.mjs --base fc510e25 --gel 3f6c8d32 --repo /home/user/monark-governance-rt --draw 3 --seed 37` (mode F2P, le lot
  change de la production) : **OK**, exit 0 ; 3 F2P, 25 inchangés, 3 tueurs tirés (la population), 3 tués ; `RED-PROOF.json` sha256
  `1d9279cf…`, digest `551f86a8…`, `files.production` = `scripts/red-proof.d.mts`, `scripts/red-proof.mjs`.
- Même plage avec `--test-only` : REFUSED, exit 1, « production files changed: scripts/red-proof.d.mts, scripts/red-proof.mjs » (échec
  fermé sur un vrai lot).
- `test/red-proof.test.ts` au gel : 27/28 ; l'échec est le rouge préexistant `red_proof_fails_on_a_stillborn_draw_or_an_empty_diff`
  (`vi_hangs` sous Node 22, voir le G7 de RED-PROOF-JUNCTION-1), non touché.
- `npx tsc --noEmit` vert (aussi au commit des tests) ; eslint vert sur le test ; `lint:ratchet` 69/69 ; `gate:vocab` OK ;
  `test/mutants-run.test.ts` 21/21.
- R-25 par `r25()` sur `fc510e25...HEAD` : +68/−27, **95 lignes comptées** (sous 547) ; G0 et G7 hors compte.

## Écarts au plan

- `scripts/red-proof.d.mts` (`mode`, `files.production`, `kill`, verdict `pinned`) est commis avec les tests, pour que `tsc` reste vert à
  ce commit.
- Pas encore de G2 neuve sur ce lot (à faire avant de passer la PR à MONARK).
- Aucun vrai lot de test seul n'a été rejoué (SENTINEL-SIGTERM-LOAD-1 n'est pas écrit ; le pli de BINANCE-PRE35-1 est hors de ce dépôt
  de travail) ; à faire par le premier lot qui s'en sert.

## Questions pour MONARK

- **Q-RTO-1** : la frontière de « production » refuse aussi un lot de test qui touche `package.json`, une config eslint, un `*.d.mts` de
  types ou un fichier fixe hors `test/` : voulu (échec fermé), ou faut-il une liste d'exceptions nommées ?
- **Q-RTO-2** : `--draw` est refusé en `--test-only` (chaque tueur est déjà tiré). Les commandes de mission de la G2 et du cp-2 portent
  `--draw n --seed s` : faut-il plutôt l'accepter et l'ignorer, écrit dans la preuve ?
- **Q-RTO-3** : un test seulement **modifié** (pas neuf) est jugé de même : vert des deux côtés et tué par son tueur. Un tueur déclaré
  peut viser n'importe quelle ligne de production que le test atteint ; le mode ne prouve pas que l'épingle vise **le** comportement
  du lot, seulement qu'elle tient à la ligne nommée. Ce niveau suffit-il, ou faut-il que le G0 du lot liste les tueurs attendus ?
- **Q-RTO-4** : le choix du mode revient à l'auteur. MONARK refuse-t-il un `--test-only` quand le G0 du lot ne se déclare pas « test
  seulement » ?

## Sortie

Prêt pour la G2 neuve puis le contrôle par diff de MONARK, après RED-PROOF-TAP-TRUNCATION-1 (empilé). Item RED-PROOF-TEST-ONLY-1 clos au
gel `3f6c8d3` sous réserve de Q-RTO-1 à Q-RTO-4. Le changement de mode de `packages/rpc-guard/bin/rpc-guard.mjs` laissé par `npm ci`
n'est pas commis ; rien n'est poussé.
