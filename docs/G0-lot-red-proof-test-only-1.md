# G0 du lot d'outil RED-PROOF-TEST-ONLY-1 : un mode `--test-only` de `scripts/red-proof.mjs` pour un lot qui n'ajoute que des épingles

- **Rattachement** : item RED-PROOF-TEST-ONLY-1 (colonne RECHERCHES, `coordination/messages/2026-10-04-MONARK-vers-RECHERCHES-bascule-de-charge.md`
  §3, point 3 ; zone MONARK ouverte : `scripts/red-proof.mjs`, `scripts/red-proof.d.mts`, `test/red-proof.test.ts`). Aucune entrée de
  `docs/ETAT.md` ne le décrit : il est défini ici par ce qui a été rencontré.
- **Base** : `fc510e25` (tête du lot RED-PROOF-TAP-TRUNCATION-1, lui-même empilé sur la PR #113). Branche
  `recherches/red-proof-test-only-1`. Auteur : RECHERCHES. Hôte : Linux, Node v22.22.2. Aucun réseau.

## Le besoin

Un lot de robustesse **qui ne change que des tests** (SENTINEL-SIGTERM-LOAD-1 ; le pli de G2 de BINANCE-PRE35-1, qui épinglait un
comportement déjà vrai au gel précédent) est refusé par red-proof : chaque test est vert à la base, « self-confirming ». C'est juste en
mode F2P (un test vert à la base ne prouve pas qu'il rougirait sur le défaut), mais un tel lot n'a pas de défaut à corriger : ce qu'il
doit prouver, c'est que chaque épingle **tient** à quelque chose. Pour BINANCE-PRE35-1, le rouge a dû être montré par des mutants à la
main, hors outil.

## Conception

`--test-only` (drapeau sans valeur) :

1. **Fermé sur la production** : tout chemin du diff base..gel (ajout, modification, suppression, non suivi d'un worktree) qui n'est
   ni un `*.test.ts`, ni sous un répertoire `test/`, ni un `docs/**/*.md` est un fichier de production ; la liste est écrite dans
   `files.production` (dans les deux modes). En mode `--test-only`, une liste non vide **refuse** : aucun test n'est lancé, aucune
   ligne, `ok: false`, exit 1, la preuve écrite (jamais un exit 0 muet).
2. **Base = même code de production** : la base et le gel sont lancés comme avant (le clone de la base reçoit les tests du gel). Un
   test jugé doit être **vert des deux côtés** ; rouge à la base (le code étant le même) = refusé, le test n'est pas déterministe.
3. **Substitut du F2P = le tueur déclaré tué au gel** : pour **chaque** test jugé vert des deux côtés et au tueur valide, le tueur est
   appliqué seul au clone du gel et le test relancé (même `fire` que le tirage, fichier restauré, sha256 vérifié, `killer-<n>.tap`).
   Tué = verdict **`pinned`** ; survivant (`stillborn`) ou chargement cassé (`invalid`) = refusé ; mort ou TAP tronqué = `inconclusive`.
   L'enregistrement du tir est porté par la ligne (`kill`).
4. **Le mode est écrit** : `mode: "test-only"` (sinon `"f2p"`) au sommet de `RED-PROOF.json`. `ok` = au moins une ligne, toutes
   `pinned` (ou F2P/new-module), aucune production.
5. **`--draw` refusé avec `--test-only`** (exit 2, usage) : chaque tueur est déjà tiré ; un tirage serait un doublon.

Le mode F2P est inchangé.

## Tests (rouges à la base par assertion : l'option est inconnue à la base, exit 2 sans preuve), tueurs

- `red_proof_test_only_admits_a_pin_whose_declared_killer_kills_it_at_gel` : worktree au gel du dépôt fixe, un fichier de test neuf
  qui épingle `double` ; `--test-only` : exit 0, `ok`, `mode: "test-only"`, ligne `pass`/`pass`/`pinned`, tir `killed` ; sans le
  drapeau, le même gel est refusé « green at base ». Tueur : la condition « vert à la base » du verdict `pinned` faussée.
- `red_proof_test_only_refuses_a_pin_whose_killer_survives` : une seconde épingle dont le tueur ne la touche pas ; `stillborn`,
  refusée, exit 1. Tueur : le contrôle du tir retiré.
- `red_proof_test_only_fails_closed_on_a_production_change` : le gel commit du dépôt fixe (qui change du code) sous `--test-only` :
  aucune ligne, `files.production` nommé, exit 1 ; `--test-only --draw` : exit 2. Tueur : le contrôle de production neutralisé.

## Taille

Attendu : script ≈ 15 lignes, types 3, tests ≈ 35 ; docs hors compte. Bien sous 547.

## Questions pour MONARK (aussi au G7)

- **Q-RTO-1** : la frontière de « production » (tout sauf `*.test.ts`, `test/**`, `docs/**/*.md`) refuse aussi un lot de test qui
  touche `package.json`, une config eslint ou un `*.d.mts` de types : voulu (échec fermé) ?
- **Q-RTO-2** : `--draw` refusé en `--test-only` : les commandes de mission de la G2 et du cp-2 portent `--draw n --seed s` ; faut-il
  plutôt l'accepter et l'ignorer (écrit dans la preuve) ?
- **Q-RTO-3** : le mode est choisi par l'auteur. Faut-il que MONARK le refuse quand le G0 du lot ne dit pas « test seulement » ?
