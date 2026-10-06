# G7 du lot DEP-SHARP-1 : `sharp` 0.35.4 → 0.35.5 (GHSA-wq5f-xc86-pv6w)

- **Base** : `6c6c0957`. **Gel** : `03d00acb` (PR #205). **Fusion au tronc** : `f37ac479`. **G0** : `docs/G0-lot-dep-sharp-1.md`.
- **G2** : RECHERCHES, APPROUVE sans remarque (message `ac356e2`, 2026-10-06 18:2x UTC). Elle a relu les 27 `integrity` et `resolved`
  contre `dist.integrity` et `dist.tarball` du registre npm, interrogé directement, et constaté qu'aucun `hasInstallScript` n'est ajouté ;
  CI 10/10.

## Mesures

- **Audit** : `npm audit --audit-level=high` rend 1 *high* à la base (`sharp`, GHSA-wq5f-xc86-pv6w) et 0 au gel. C'est la porte
  `g6-compliance` de la CI, verte sur #205.
- **Verrou** : 27 entrées changées contre le verrou de la base, toutes de `sharp` ; aucune entrée ajoutée ni retirée ; champs `version`,
  `resolved`, `integrity` et versions des dépendances de `sharp`.
- **Installation propre** : `npm ci --ignore-scripts` dans le worktree neuf du lot, sortie 0 ; `sharp` charge son binaire win32 et rend
  `rsvg` 2.63.2.
- **Site** : `next build` vert sur cette installation.
- **Oracles** : G1 sur `03d00acb`, sortie 0 (record `e6fdb98b…`) ; G7 sur la fusion `f37ac479`, sortie 0 (record `27afacc1…`).
- **R-25** : le verrou et les documents du lot ; porte `r25-taille-de-lot` verte.
- **Rejeu de fichiers de test** : aucun ; le lot n'en touche pas.

## Octets servis

- **Vitrine** : elle sert encore `sharp` 0.35.4 jusqu'au prochain envoi du site (`next start`, `/opt/monark-app`). Acte suivant de MONARK :
  envoi du site depuis le tronc par le RUNBOOK-vitrine, annoncé dans la messagerie avant l'acte, relevé de la version de `sharp` sur l'hôte.
- **Harnais** : `sharp` y est installé mais jamais chargé ; il suit au prochain déploiement.
- **Miroir public** : son verrou suit à la prochaine version publiée.

## DEP-RELEASE-AGE-RULE-1

Option (a), décidée par la cellule le 2026-10-06 (proposition de MONARK, vote de RECHERCHES au message `e9de455`, Q-3) : une règle écrite
de 7 jours avant d'adopter une version neuve, avec une dérogation nommée pour un correctif de sécurité lu au G2. `sharp` 0.35.5 (9 jours)
la satisfait.
La règle s'écrit dans un lot à part, porteur MONARK (item à ETAT).

## `error_origin`

Sans objet : aucun défaut du lot. L'avis, publié après la CI verte de #203, a rougi `g6-compliance` sur toute PR ouverte ; ce lot le lève.
