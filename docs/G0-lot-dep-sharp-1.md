# G0 du lot DEP-SHARP-1 : `sharp` 0.35.4 → 0.35.5 (GHSA-wq5f-xc86-pv6w)

- **Base** : `lot/etude-suite` = `6c6c0957`. **Branche** : `monark/dep-sharp-1`. Auteur : MONARK. Modèle : DEP-SOURCE-MAP-JS-1
  (`docs/G0-lot-dep-source-map-js-1.md`).
- **Demande** : la porte `g6-compliance` (« Dependency audit (high and above = failure) », `npm audit --audit-level=high`,
  `.github/workflows/ci.yml:242`) est rouge sur #204 (run `37502350104`, 2026-10-06 17:17:28Z) et sur toute PR depuis la publication de
  l'avis.
- **L'avis**, lu sur place le 2026-10-06 vers 17:24 UTC (GitHub Advisory Database, GHSA-wq5f-xc86-pv6w, navigateur interne) : gravité
  *high* (CVSS v4 8,9), faille mémoire de la dépendance librsvg (CWE-416, CWE-1395), exécution de code possible sous Linux glibc dans
  certaines conditions d'exécution ; plage touchée `< 0.35.5`, version corrigée 0.35.5, qui embarque librsvg 2.63.2.

## Périmètre fermé

| Fichier | Ce qui change |
|---|---|
| `package-lock.json` | 27 entrées, toutes de `sharp` : `node_modules/sharp` 0.35.4 → 0.35.5, 16 binaires `@img/sharp-<plateforme>` 0.35.4 → 0.35.5, 10 bibliothèques `@img/sharp-libvips-<plateforme>` 1.3.3 → 1.3.4 ; champs `version`, `resolved`, `integrity` et les versions des dépendances de `sharp`. Par `npm update sharp --package-lock-only --ignore-scripts`, jamais à la main. |

- `package.json` ne bouge pas. Le seul dépendant, `next`, demande `^0.35.4` (dépendance optionnelle), plage qui admet 0.35.5.
- Aucune entrée ajoutée ni retirée, aucun autre paquet ne bouge (mesuré entrée par entrée contre le verrou de la base) ; aucun script
  d'installation n'est lancé.

## Contrôle au registre (R-8), le 2026-10-06

| Champ | 0.35.4 (avant) | 0.35.5 (après) |
|---|---|---|
| Publiée | 2026-08-26 09:42Z | 2026-09-27 13:46Z |
| Éditeur | « GitHub Actions » (publication automatisée du dépôt `lovell/sharp`) | le même |
| Mainteneur | `lovell` | `lovell` |
| Dépendances | `semver ^7.8.5`, `@img/colour ^1.1.0`, `detect-libc ^2.1.2` | les mêmes |
| `engines` | `node >=20.9.0` | `node >=20.9.0` |
| Script d'installation | aucun | aucun |
| Intégrité | `sha512-n++8XWcj…` | `sha512-Ywn4OnzGukp7CDMrp08RQ50YKmuwG47brZgIVPTvBaaAfQlRlygrRqSrxdCiL9M+LlzLBiJ68IR1QqvzHyjC7g==` |

La 0.35.5 porte deux signatures du registre. Âge à la date du lot : 9 jours.

## Preuve

- **Rouge à la base** : `npm audit --audit-level=high` rend 1 vulnérabilité *high* (`sharp`). C'est la porte `g6-compliance` de la CI ;
  aucun test neuf n'est nécessaire, la porte existante est le test.
- **Vert au gel** : `npm audit --audit-level=high` rend 0.
- **Installation propre** : `npm ci --ignore-scripts` dans le worktree neuf du lot, sortie 0 ; `sharp` 0.35.5 et `@img/sharp-win32-x64`
  0.35.5 installés.
- **Chargement** : sous win32, `sharp` crée puis relit une image PNG de 4 × 4 ; `sharp.versions` donne `rsvg` 2.63.2 (la version
  corrigée de l'avis) et `vips` 8.18.7.
- **Site** : `next build` vert sur cette installation (27 s, pages statiques rendues, aucun avertissement). Sous Linux, les jobs de la CI
  qui lancent `npm ci` installent le binaire `linux-x64`.
- **R-25** : le verrou (236 lignes, 118 ajoutées et 118 retirées) et les documents du lot.

## Octets servis

- **Vitrine** : le serveur du site lance `next start` sur `/opt/monark-app` (`docs/RUNBOOK-vitrine.md` l.4) ; l'optimiseur d'images de
  Next charge `sharp`. L'arbre servi garde 0.35.4 jusqu'au prochain envoi du site. Acte après la fusion : envoi du site depuis le tronc
  selon le RUNBOOK-vitrine (installation par le verrou du tronc), relevé de la version de `sharp` sur l'hôte.
- **Harnais** : `npm ci` installe aussi `sharp` sous `/opt/monark-harness`, mais aucun module du harnais ne le charge (aucun import de
  `sharp` dans `apps`, `packages` ni `scripts`) ; il suit au prochain déploiement.
- **Miroir public** : son verrou suit à la prochaine version publiée.

## DEP-RELEASE-AGE-RULE-1

- Son déclencheur est atteint : c'est la première montée de dépendance depuis le G7 de DEP-SOURCE-MAP-JS-1.
- La 0.35.5 a 9 jours : elle passe sous les deux options. Proposition de MONARK à la cellule : option (a), une règle écrite de 7 jours avec
  une dérogation nommée pour un correctif de sécurité lu au G2. La règle sera écrite dans un lot à part, après l'accord de la cellule.

## Questions

- Aucune pour ce lot.
