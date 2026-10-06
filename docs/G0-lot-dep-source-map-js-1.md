# G0 du lot DEP-SOURCE-MAP-JS-1 : `source-map-js` 1.2.1 → 1.2.2 (GHSA-68fv-2mgg-jv7q)

- **Base** : `base/chantier-moteur-2026-10-03` = `aebe4df9`. **Branche** : `recherches/dep-source-map-js-1`. Cible : la base, avant la fusion de T0.
- **Demande** : MONARK, message `359e147` (messagerie RECHERCHES). La porte `g6-compliance` (« Dependency audit (high and above = failure) », `npm audit --audit-level=high`, `.github/workflows/ci.yml:241-242`) est rouge sur toute PR depuis la publication de l'avis.
- **L'avis** : GHSA-68fv-2mgg-jv7q, gravité *high*, déni de service par les décalages de sections d'une carte de source indexée. Plage touchée `>=1.0.0 <1.2.2`, première version corrigée 1.2.2 (lu dans `npm audit --json` à la base).

## Périmètre fermé

| Fichier | Ce qui change |
|---|---|
| `package-lock.json` | l'entrée `node_modules/source-map-js` seule : `version` 1.2.1 → 1.2.2, `resolved` et `integrity` du tarball 1.2.2 (3 lignes). Par `npm update source-map-js --package-lock-only --ignore-scripts`, jamais à la main. |

- `package.json` ne bouge pas. Les trois dépendants (lignes 1371, 4235, 4378 du verrou) demandent `^1.2.1`, plage qui admet 1.2.2.
- Aucun autre paquet ne bouge ; aucun script d'installation n'est lancé.
- Aucun octet servi ne bouge : `source-map-js` n'est qu'une dépendance d'outillage (construction du site et de ses cartes de source), hors du graphe du harnais.

## Contrôle au registre (R-8), le 2026-10-06

| Champ | 1.2.1 (avant) | 1.2.2 (après) |
|---|---|---|
| Publiée | 2024-09-08 | 2026-09-30 |
| Mainteneur et éditeur | `7rulnik` | `7rulnik` (le même) |
| Dépendances | aucune | aucune |
| `engines` | `node >=0.10.0` | `node >=0.10.0` |
| Intégrité | `sha512-UXWMKhLO…` | `sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==` |

La G2 courte relit le tarball : intégrité recalculée, contenu comparé fichier à fichier, absence de script d'installation.

## Preuve

- **Rouge à la base** : `npm audit --audit-level=high` rend 1 vulnérabilité *high* (`source-map-js`). C'est la porte `g6-compliance` de la CI ; aucun test neuf n'est nécessaire, la porte existante est le test.
- **Vert au gel** : `npm audit --audit-level=high` rend 0.
- `npm ci --ignore-scripts` propre depuis le verrou du gel, dans une copie neuve, puis la construction du site et `test:main`.
- R-25 de l'ordre de 6 lignes (le verrou).
