# G2-delta — pli bis BELL-HOST-ROOT-1 (`51ed6f5`, relecteur Opus 5.5)

Persisté par l'orchestrateur le 2026-09-23 depuis `F:/tmp/g2-bellroot/bis/G2.md` (sha256 71616c84…). Verdict : **PASS** (C-1..C-3 closes, 27/27 mutants, simulation RUNBOOK rejouée, R-25 142). Items : G8-NON-GET-ROOT-1 (propriétaire orchestrateur ; déclencheur : prochain lot touchant `bell-caddy.ts` ou le Caddyfile ; preuve : cas `POST /` ⇒ 302 dans S-8), CADDY-DUP-MATCHER-SEM-1, RUNBOOK-G7-EMPTY-INDEX-1.

---

# G2-delta — lot BELL-HOST-ROOT-1, pli bis `51ed6f5` (C-1..C-3 du G2 `F:\tmp\g2-bellroot\G2.md`, sha `cbfa9d0e…`)

- Relecteur : même rôle et même discipline que le G2 ; **modèle résolu `claude-opus-5-5[1m]`** (R-1) ; effort max. Horloge `date -u` : de 23:23:24Z
  (2026-09-23 UTC) à 23:28Z pour les exécutions, rédaction ensuite. Budget 15 min.
- Garde-fous tenus : aucun commit (R-20), aucun workflow, aucune écriture sous `F:\Monark*`, aucun réseau hors loopback, aucun accès à l'hôte ;
  ceinture A-7 + `TEMP/TMP/TMPDIR=F:/tmp/g2-bellroot/bis/tmp` sur chaque commande.
- Copie : `F:\tmp\g2-bellroot\bis\repo`, clonée de `F:/Monark` (`--no-hardlinks`), HEAD `51ed6f5ac8493b52801e4fe5372f0981e7b5e373` (= HEAD du worktree) ;
  `npm ci --offline` exit 0 (`bis/npm-ci.log`). Les 7 fichiers du lot dans la copie == blobs `HEAD` du worktree (sha comparés).
- Entrées : `F:\tmp\bellroot-bis\RENDU.md` sha `5b3b5219cf94958a4497e2ecad68956d576989315f2e29037a6b9474a60ed2bc` (= attendu) ;
  `DELIVERED.sha256` **121/121 OK** ; `PLI.diff` `1f7093cf…` = `git diff bdd6c66 51ed6f5 | sha256sum` ; `LOT-PLUS-PLI.diff` `132579cb…` = `git diff d7c60a2 51ed6f5 | sha256sum`.

## Verdict : **PASS**

Mes trois corrections sont closes. Chaque critère de mort du §7 du G2 est atteint, et je l'ai mesuré moi-même sur ma copie. Aucune régression :
les 14 mutants du rédacteur et mes 11 donnent les mêmes ensembles rouges attendus. Tests ciblés, 6 portes, R-25 et gel U-4b sont verts.
Deux survivants, tous deux déclarés : G3 (équivalent, résultat correct) et G8 (item **G8-NON-GET-ROOT-1**, ruling de l'orchestrateur, non bloquant).

**error_origin** : aucun nouveau défaut. Ceux de C-1..C-3 restent ceux du G2 (implementation / implementation / plan).

## (1) Diff `bdd6c66..51ed6f5` = 4 fichiers — CONFORME
`M docs/RUNBOOK-bell.md` (21), `M test/bell-caddy.ts` (6), `M test/bell-deploy-config.test.ts` (7), `M test/verify-bell.test.ts` (27) :
52+/9−. `deploy/Caddyfile.monark-bell`, `scripts/verify-bell.mjs` et `scripts/verify-bell.d.mts` sont inchangés (sha identiques à `bdd6c66`).
Gel U-4b : **SAME ×9** entre `d7c60a2` et `51ed6f5` (LF, `git show | tr -d '\r' | sha256sum`). `git merge-tree --write-tree origin/lot/etude-suite 51ed6f5` :
exit 0 (tree `261a5d5d…`), aucun conflit.

## (2) Critères du §7

### C-1 — c07 et le statut 302 : CLOS
Le code ajouté est `servedRoot301` (`test/verify-bell.test.ts`). C'est un serveur loopback dédié : il répond sur `/` un 301 avec la Location
EXACTE et les en-têtes du site, et délègue tout autre chemin au gestionnaire du modèle par `inner.emit("request")`. Le modèle et son type
`Redirect.code: 302` ne sont pas touchés. Le cas ajouté attend exactement `["c07_no_directory_listing"]`.

Résultats mesurés :
- **G4 rouge sur [C]**, **G7 rouge sur [C]** ;
- **G10 rouge sur [C]** : le cas 301 tue aussi M12 ;
- **B2** (le serveur dédié répond 302 au lieu de 301) rouge sur [C] : le rouge du cas vient du seul statut.

### C-2 — doublon de matcher nommé : CLOS
Le code ajouté est le refus `if (cur.matchers.has(head)) throw …` (`test/bell-caddy.ts`). S-8 teste les deux ordres.

Résultats mesurés :
- **G6 rouge sur [A,B,C,D,E]**, F vert : l'e2e a son propre lecteur ;
- sondes `P-forms-bis.out` : **P13 et P14 REFUSED** avec le message « named matcher @home defined twice », dans les deux ordres ;
- P1–P10 et P15 restent REFUSED ; P11 et P12 (formes équivalentes chez Caddy) restent ACCEPTED ;
- **B1** (refus retiré) rouge sur [B].

Le commentaire du modèle cite « a unique name » en `matchers.md` l.129. Je l'ai relu [lu] dans la copie `F:\tmp\bellroot\src\matchers.md` : c'est exact.
La sémantique de Caddy pour un doublon est déclarée non établie, sans supposition, ce qui est conforme.

### C-3 — RUNBOOK étape 7 : CLOS
Simulation indépendante : `bis/sim/sim.sh` (sha `57fcec00…`), sortie `bis/sim/SIM.out` (sha `57a60212…`). Les deux commandes sont extraites
VERBATIM du RUNBOOK committé : cmd1 `ecb1193d…`, cmd2 `6dc88d0a…`, égales aux copies du rédacteur. Seules les substitutions de chemins et
`ssh … '<cmd>'` → `sh -c '<cmd>'` ont été faites. Le merge simulé et le commit S4 sont des objets de ma copie seulement, jamais référencés.

| cas | ce qui est simulé | résultat |
|---|---|---|
| S1 | exécution normale | `same_tree_and_unit=0`, `G7-1.txt` = 496a5a8 |
| S3 | même commande rejouée | 0, **`G7-1.txt` conservé = 496a5a8** |
| S2 | placeholder laissé tel quel | 128, `G7.txt` vide, `G7-1.txt` = 496a5a8 |
| S2 puis re-jeu | re-jeu avec le bon SHA | 0, `G7-1.txt` = 496a5a8 |
| S4 | l'unité diffère au nouveau G7 | **1** (STOP) |
| A1 | hôte = blob précédent | `caddy_in_place=G7-1` |
| A2 | hôte = nouveau blob | `G7` |
| A3 | hôte = blob précédent + un autre site | `unexpected` |
| A4 | fichier absent sur l'hôte | `unexpected` |
| A5 | `G7-1.txt` absent | `unexpected` |
| A6 | `G7.txt` vide | `unexpected` |
| A7 (le mien) | hôte en CRLF | `unexpected` |
| A8 (le mien) | `G7-1.txt` pointe un tree au lieu d'un commit | `unexpected` |
| A9 (le mien) | même commit dans les deux pointeurs | `G7-1` |

A9 déclenche un REPLACE, mais il est sans effet puisque les octets sont identiques (O-B2).
Le rédacteur a aussi montré, dans son `SIM-run1.out`, que la version précédente du garde passait A6 à tort ; la version committée le ferme.

## (3) Mutants : 14 + 11 + B1/B2
- Runner `bis/mutants/run-g2bis.mjs` (sha `3f03e168…`). C'est mon runner du G2, avec sortie redirigée vers `bis/`, auquel j'ai ajouté B1 et B2
  VERBATIM depuis `F:\tmp\bellroot-bis\mutants\run-bis.mjs`. Les 3 fichiers de test tournent pour chaque mutant. Après chaque mutant, la
  restauration est vérifiée par sha256 ; `git status` est propre à la fin.
- Mes prédictions (`bis/mutants/PREDICTIONS-G2BIS.md`, sha `49f32365…`) ont été écrites AVANT toute exécution : **27/27 conformes**
  (26 mutants de tests + G11).
- **M1–M14** : ensembles rouges identiques au G2.
- Mes 11 mutants :
  - **G1, G2, G9** : [A,B,C,D,E] ;
  - **G3** : survit — mutant équivalent, c'est le résultat correct ;
  - **G4** : [C] ;
  - **G5** : [B,C] ;
  - **G6** : [A,B,C,D,E] ;
  - **G7** : [C] ;
  - **G8** : survit — item G8-NON-GET-ROOT-1 ;
  - **G10** : [C] ;
  - **G11** : `tsc` exit 2, avec TS2305 dans `bell-deploy-config.test.ts` l.17 ET `verify-bell.test.ts` l.23 (`bis/mutants/G11-typecheck.log`).
- **B1** : [B] ; **B2** : [C].
- Mes 26 ensembles rouges sont **identiques à 26/26** à `REPORT-BIS.jsonl` du rédacteur : 24 tués, survivants G3 et G8.
  Journaux : `bis/mutants/run.log` (`90d3a9de…`), `bis/mutants/REPORT-G2BIS.jsonl` (`2c5e853f…`), un TAP par mutant.

## (4) Tests ciblés et portes
- Tests ciblés : **13/13 pass**, 0 fail, 0 skip (`bis/targeted.tap`, sha `a7d83822…`).
- Portes : `vocab=0` (251 fichiers), `lang=0`, `typecheck=0`, `lint=0`, `ratchet=0` (69/69), `export=0` (`bis/gates/EXITS.txt`).
- Je n'ai pas relancé la suite complète : ce G2-delta ne la demande pas. Le rédacteur déclare 1171/1169/0/2.

## (5) R-25, forme CI
J'ai repris à l'identique le pathspec de `.github/workflows/ci.yml` l.65, puis lancé `git diff --shortstat d7c60a2...51ed6f5`.
Résultat : `6 files changed, 123 insertions(+), 19 deletions(-)` ⇒ **142** = attendu. C'est ≤ 1 150, et ≤ 1 205 (borne de `ci.yml`).
Fichier : `bis/R25-and-freeze.txt`.

## Où vont les inconnues déclarées au G2 (lien vers les items formés, pour le G7)

| constat du G2 | où il est traité | ce que j'ai vérifié |
|---|---|---|
| §2.1 : comportement de Caddy face à un matcher nommé défini deux fois, non établi | **CADDY-DUP-MATCHER-SEM-1** (RENDU bis l.154-157 : lecture [lu] de `caddyconfig/httpcaddyfile` v2.11.4, ou `docker pull caddy:2.11.4` + `caddy adapt` sur P13 ; déclencheur : avant le G7 du lot) | C-2 est juste quel que soit ce comportement (le modèle refuse dans tous les cas) : l'item documente, il ne conditionne pas C-2 |
| O-2 : `G7.txt` tronqué quand `rev-parse` échoue | prose de l'étape 7 (« rerun this command with the right SHA, `G7-1.txt` is kept ») + **RUNBOOK-G7-EMPTY-INDEX-1** pour le même motif aux autres étapes (RENDU bis l.160-163 : `"$G7:<p>"` avec un `G7.txt` vide lit le blob de l'**index**, pas une erreur ; déclencheur : prochain lot qui touche le RUNBOOK) | sur le chemin de rejeu de CE lot, S2 puis re-jeu garde `G7-1.txt`, et le garde cmd2 s'arrête sur un `G7.txt` vide (A6 → `unexpected`) AVANT tout REPLACE |
| O-1 : G8 (méthode autre que GET sur `/`) | **G8-NON-GET-ROOT-1** (ruling de l'orchestrateur, non bloquant) | déclencheur et propriétaire dus au G7 (O-B1) |

**Rejeu par un lot suivant — raisonné, NON simulé.** La nouvelle phrase de clôture de l'étape 7 (« A later replay first removes `G7-1.txt` ») n'est
couverte par aucun de mes cas S1–S4 ni A1–A9.
- Si `G7-1.txt` n'est PAS retiré : cmd1 garde `G7-1` = le G7 le plus ancien, alors que l'hôte porte le blob intermédiaire. cmd2 répond donc
  `unexpected`, et c'est STOP (fail-closed). Exception : si le Caddyfile est identique entre ces deux G7, cmd2 répond `G7-1` et le REPLACE est juste.
- S'il est retiré : `G7-1` = le G7 intermédiaire, cmd2 répond `G7-1`, puis REPLACE.

## Observations (non bloquantes, sans dette nouvelle)
- **O-B1** : G8 est un item nommé (`F:\Monark\docs\CHANTIERS.md` l.1361 : « G8-NON-GET-ROOT-1, non bloquant »). La ligne ne montre ni déclencheur
  ni propriétaire. La règle Dettes les exige au plus tard au G7 ; le RENDU bis (l.169-172) décrit les deux options.
- **O-B2** (A9) : quand les deux pointeurs désignent le même commit, le garde répond `G7-1`, ce qui déclenche un REPLACE sans effet (octets identiques).
- **O-B3** : les journaux de portes du rédacteur ont d'autres sha que les miens : typecheck et lint vides chez lui, en-têtes `npm run` chez moi.
  Les codes de sortie concordent ; mes journaux bis sont identiques octet pour octet à ceux de mon G2.

## Déviations
- Aucune écriture hors `F:\tmp\g2-bellroot\bis\`, hormis la lecture de `F:\tmp\bellroot-bis\`.
- Les objets git non référencés (merge simulé `f5ba18ff…`, blob et commit S4 `e432e742…`) n'existent que dans `bis\repo\.git`, jamais poussés.
- `F:\Monark` et `F:\Monark-wt-bellroot` sont propres (`git status --short` vide, 23:27:56Z).
