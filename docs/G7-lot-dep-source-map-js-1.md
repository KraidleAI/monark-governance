# G7 du lot DEP-SOURCE-MAP-JS-1 : `source-map-js` 1.2.1 → 1.2.2

- **Base** : `aebe4df9`. **Gel** : `2ded4c8c`. **G0** : `docs/G0-lot-dep-source-map-js-1.md`. **G2** : `docs/G2-lot-dep-source-map-js-1.md`, non bloquante.

## Mesures

- **Audit** : `npm audit --audit-level=high` rend 1 *high* à la base (`source-map-js`, GHSA-68fv-2mgg-jv7q) et 0 au gel. C'est la porte `g6-compliance` de la CI.
- **Verrou** : `git diff aebe4df9..2ded4c8c -- package-lock.json` = 3 lignes, l'entrée `node_modules/source-map-js` seule (`version`, `resolved`, `integrity`).
- **Installation propre** : `npm ci --ignore-scripts` dans une copie neuve du gel, sortie 0 ; `node_modules/source-map-js` en 1.2.2.
- **Site** : `next build` vert sur cette installation, pages statiques rendues.
- **`test:main`** sur cette installation : en cours à l'écriture. La CI de la PR le rejoue (g3-verification) ; le résultat local est donné dans le message à MONARK.
- **R-25** : le verrou et les trois documents.
- **Octets servis** : aucun. `source-map-js` est une dépendance d'outillage, hors du graphe du harnais.

## G2 (chaîne d'approvisionnement), repli

- Intégrité recalculée sur les deux tarballs : égale au verrou et au registre ; tarball signé par le registre ; même éditeur (`7rulnik`).
- Contenu : mêmes 18 fichiers. Dans `package.json`, seule `version` change ; aucun script d'installation, aucun `bin` ou `exports` neuf, aucune dépendance, aucun réseau, aucun `child_process`.
- Correctif conforme à l'avis : seuls des décalages entiers non négatifs sont admis, plafonnés à 1e7 (sections imbriquées comprises). Une sonde locale rejette 2e7, -1, 1.5 et `'3'` en 1.2.2, que 1.2.1 admettait.
- Changement hors correctif, bénin : `quick-sort.js` teste `new Function` (déjà présent en 1.2.1) et trie sans `eval` sous une politique CSP stricte.
- Âge de la version : 6 jours. Ce n'est pas un motif de blocage (même éditeur, diff petit et lu).

## Résidu

- DEP-RELEASE-AGE-RULE-1 : aucune règle de délai minimal avant d'adopter une version neuve n'existe (`docs/`, `.npmrc`). Options :
  - (a) une règle écrite (par exemple 7 jours), avec une dérogation nommée pour un correctif de sécurité lu au G2 (environ 5 lignes de doc) ;
  - (b) statu quo.

  Porteur : la cellule ; déclencheur : la prochaine montée de dépendance ; après T0.
