# G0 du lot MUTANTS-RUN-EXIT-CODE-1 : `scripts/mutants/run.mjs` lit aussi le code de sortie de l enfant, et un désaccord entre ce code et les entrées TAP est nommé

- **Demande** : MONARK, `messages/2026-10-04-MONARK-vers-RECHERCHES-zone-blocking-stdout.md` (`96aeca9`), point 3 ; item MUTANTS-RUN-EXIT-CODE-1 de `docs/ETAT.md`.
- **Base** : `53c7f15d` (`origin/lot/etude-suite`), branche `recherches/mutants-run-exit-code-1`. Auteur : RECHERCHES.
- **Zone** : `scripts/mutants/run.mjs`, `scripts/mutants/run.d.mts`, `test/mutants-run.test.ts` ; ce G0 et le G7.

*Corrigé au pli du G2 (m-3) : la règle d assertion est rattachée au VERDICT du lot M-6, plus à D-4 ; la source de « juger sur le code » est l item de `docs/ETAT.md`, pas `96aeca9`.*

## Constat

`runSet` (`run.mjs:208-218`) juge une exécution `node --test` sur ses seules entrées TAP de premier niveau : `survit` dès que toutes les entrées lues sont `ok`, quel que soit le code de sortie. Sous `--test-force-exit`, la fin du TAP peut se perdre (TEST-FORCE-EXIT-REPORT-LOSS-1) : l entrée en échec manque, celles d avant sont `ok`, l enfant sort 1. Le mutant est alors compté **survivant** alors qu il a rougi un test. Le sens est sûr (la campagne sort 1), la mesure est fausse. À l inverse, une sortie 0 avec des entrées `not ok` est jugée sur les seules entrées, sans rien signaler.

Le code de sortie et le signal sont déjà lus pour un enfant mort (`error`, `signal`, `134` : non conclu) ; ils ne le sont pas pour départager `survit`.

## Règle de verdict (choisie dans ce G0)

Le contrat existant reste : **tue** iff une entrée de premier niveau échoue par assertion (`ERR_ASSERTION`, `classify` de `red-proof.mjs`), jamais « équivalent » ; un échec sans assertion reste **non conclu** (VERDICT, lot M-6 ; D-4, dans l en-tête de `run.mjs`, est le rejeu des survivants et des non conclus). Ce lot ajoute le code de sortie comme second témoin, qui doit s accorder avec les entrées :

| Enfant | Entrées TAP | Verdict | Note (nouvelle, champ `note` du résultat) |
|---|---|---|---|
| mort (erreur de lancement, borne, signal, 134) | toutes | non conclu | aucune (inchangé : `exit` et `signal` sont au relevé) |
| sortie 0 | toutes `ok`, au moins une | **survit** | aucune |
| sortie non nulle | au moins un échec par assertion | **tue** | aucune |
| sortie non nulle | échecs sans assertion | non conclu | aucune (inchangé, VERDICT, lot M-6) |
| sortie non nulle | toutes `ok`, au moins une | **non conclu** (était : survit) | `exit N without a failing entry` |
| sortie quelconque | aucune entrée | non conclu (inchangé) | `exit N without a test entry` |
| sortie 0 | au moins un `not ok` | **non conclu** (était : tue ou non conclu) | `exit 0 with N failing entr(y\|ies)` |

Raisons :

1. Un code non nul sans entrée en échec dit qu un test a échoué, pas comment : l assertion n est pas prouvée. Le compter **tue** changerait la règle « tue iff assertion » (VERDICT, lot M-6) ; le compter **survit** est le défaut du constat. Non conclu, nommé, est le précédent de D-3 pour `tsc` (« tsc exit N without a diagnostic line ») dans le même fichier.
2. Un non conclu qui n a pas dépassé sa borne est rejoué sur toutes ses cibles (D-4, D-5) : le rejeu peut alors montrer l assertion. Le statut de la ligne reste celui du premier passage (inchangé).
3. Une ligne de base (non mutée) dans ces cas n est plus « vert » mais « non conclu » : aucun mutant ne tourne sur une base dont le TAP et le code se contredisent.
4. Le code de sortie de la campagne ne change pas de règle (0 iff chaque mutant est tué) : un mutant qui passe de survit à non conclu la laisse à 1.

L item MUTANTS-RUN-EXIT-CODE-1 de `docs/ETAT.md` dit « juger sur le code » ; `96aeca9` ne donne pas de formule. Lu comme « code non nul : tué », il ferait de N1 (sortie 134) et de X1 (erreur de syntaxe, sortie 1) des tués, contre la règle d assertion (VERDICT, lot M-6) et les tests en place : je ne le retiens pas sous cette forme. La règle ci-dessus tient le contrat existant ; elle n est donc pas un choix neuf pour MONARK. Q-1 ci-dessous garde l autre lecture ouverte.

## Tests (d abord, rouges à la base par assertion)

Fixture `ec/` (dépôt `mini()` : `lib/e.mjs`, deux constantes ; `test/e.test.ts`, deux tests, `e_first` puis `e_second`). Sous Linux, un tube est écrit en synchrone : la perte de fin de TAP ne se reproduit pas d elle-même. Le test la simule, de façon déterministe, par un préchargement de l outil (`--import`, `syncBuiltinESMExports`) qui enveloppe `spawnSync` pour les seuls lancements `--test` :

- `FX_LOSE=tail` : le TAP est coupé à la première ligne `not ok` (la fin perdue), le code de sortie gardé. E1 (fait rougir `e_second`) : une entrée `ok`, sortie 1 ; à la base **survit**, au gel non conclu, note `exit 1 without a failing entry`. F1 (fait rougir `e_first`) : aucune entrée, sortie 1, note `exit 1 without a test entry`.
- `FX_LOSE=zero` : un TAP avec un `not ok` est rendu avec la sortie 0. E1 : à la base **tue**, au gel non conclu, note `exit 0 with 1 failing entry`.

Un tueur par test, en forme close, sur les deux nouveaux termes de `run.mjs:214`. Tests rapides : un dépôt de deux fichiers, deux lancements synchrones, aucun délai.

## Contraintes

Le nombre de lignes de `run.mjs` ne change pas : les lignes `killer:` existantes (`run.mjs:215`, `:231`, `:267`, `:274`...) restent justes. Commentaire d en-tête (VERDICT) mis à jour sur ses lignes.

## Preuve

Tests rouges (commit), correctif (commit, gel), `red-proof` contre la base (`--draw n --seed 37`), `verifie-ancres.mjs --touched`, `test:main`, `test:export`, `tsc`, `lint`, `lint:ratchet`, `gate:vocab`, `lang:gate`.

## Taille

Trois fichiers de code, environ 40 lignes. Borne R-25 : 547.

## Questions

- **Q-1** (MONARK) : préfères-tu « sortie non nulle, toutes les entrées `ok` : tue (non strict) » ? Ce lot dit non conclu (règle 1) ; l autre lecture change la règle d assertion (VERDICT, lot M-6).
