# G2 — lot DEP-SOURCE-MAP-JS-1 (source-map-js 1.2.1 → 1.2.2)

Date : 2026-10-06. Worktree `/home/user/monark-governance-dep`, branche `recherches/dep-source-map-js-1`, base `aebe4df9`. Pendant la revue, le lot a été commité par le coordinateur : `2ded4c8c` sur la branche. La revue porte donc sur `git diff aebe4df9..2ded4c8c`. Elle est restée en lecture seule : aucune écriture dans le worktree, aucun commit et aucun push de ma part. `git status` à la fin : propre.

## Verdict : **NON BLOQUANT**

Le lot peut être fusionné. Les points 6 et 7 sont des observations à consigner, sans correction demandée.

## Constats

1. **Intégrité du tarball : conforme.** `npm pack` (sans scripts) dans `scratchpad/g2dep/`. sha512 base64 calculé localement :
   - 1.2.1 : `sha512-UXWMKhLOwVKb728IUtQPXxfYU+usdybtUrK/8uGE8CQMvrhOpwvzDBwj0QhSL7MQc7vIsISBG8VQ8+IDQxpfQA==`, identique à l'ancienne ligne du lockfile ;
   - 1.2.2 : `sha512-KGj/8Y43x35aZVDtt+J4mK1hoLGHULMYfSkODJNQjNDC3oW1PqPoxMwo0pLUsWM/UEGzON/NxeHywEfNXNP3Vw==`, identique au lockfile et à `npm view source-map-js@1.2.2 dist.integrity`.

   Signatures de registre présentes (keyid `SHA256:DhQ8wR5A…`). Champ `_npmUser` et mainteneur : `7rulnik`, comme pour 1.2.1. `gitHead` `0a1d334f`.
2. **Surface du paquet : inchangée.** Mêmes 18 fichiers, aucun ajout ni retrait. Dans `package.json`, seule `version` change. `main`, `files`, `scripts` sont identiques ; il n'y a ni `exports`, ni `bin`, ni `dependencies`. Aucun script `preinstall`, `install` ou `postinstall`. Aucun blob minifié (aucune ligne de plus de 500 caractères dans `lib/`).
3. **Diff de code : quatre fichiers, tous liés au correctif sauf un (voir 6).**
   - `lib/source-map-consumer.js` : `IndexedSourceMapConsumer` exige des `offset.line` et `offset.column` entiers, non négatifs et sûrs (rejet de NaN, Infinity, chaînes et fractions). Il borne `offset.line` à `1e7`, y compris la somme des offsets des sections imbriquées (`_maxOffsetLine`). Le getter `sources` n'est plus relu à chaque élément, ce qui supprime un coût exponentiel avec la profondeur d'imbrication.
   - `lib/source-map-generator.js` : un saut de lignes est construit par `';'.repeat(delta)` au lieu d'une boucle de concaténation (pression mémoire due aux ropes).
   - `lib/source-node.js` : `fromStringWithSourceMap` arrête d'ajouter des lignes vides quand le code généré est épuisé.

   Ces trois changements correspondent exactement à l'avis : bornes sur les offsets de section des source maps indexées, et amplification CPU et mémoire. Les commentaires du code citent `CVE-2026-93749`.
4. **Vérification dynamique du correctif.** Une sonde locale (`probe.js`, require direct de `lib/`, rien d'installé) construit une map indexée avec `offset.line` égal à 2e7, -1, 1.5 ou `'3'`. En 1.2.1, les quatre valeurs sont acceptées. En 1.2.2, les quatre sont rejetées avec un message explicite.
5. **Avis : confirmé.** Endpoint `registry.npmjs.org/-/npm/v1/security/advisories/bulk` (par le proxy) : GHSA-68fv-2mgg-jv7q, « event-loop denial of service through indexed source-map section offsets », sévérité high, CVSS 7.5 (`AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H`), CWE-1284, `vulnerable_versions >=1.0.0 <1.2.2`. Aucune version n'a été publiée entre 1.2.1 et 1.2.2 : **1.2.2 est la première version corrigée**. L'API GitHub `/advisories` n'est pas joignable depuis cette session (403, session limitée aux dépôts configurés) ; la source est donc la base d'avis npm, celle que `npm audit` consulte.
6. **Changement hors correctif, bénin : `lib/quick-sort.js`.** Ajout de `isEvalAllowed`, une sonde `new Function('return 0')` dans un try/catch. Quand l'évaluation est interdite (CSP sans `unsafe-eval`), le tri prend `SortTemplate(comparator)` au lieu de `cloneSort`. L'usage de `new Function` existait déjà en 1.2.1 (`cloneSort`, ligne 111). La sonde ajoutée n'évalue qu'une constante, sans entrée externe, et la branche par défaut (éval permise, comme sous Node) garde le comportement de 1.2.1. Aucun réseau, aucun `child_process`, aucun `fs` ni `process.env` dans le diff.
7. **Âge de la version : 6 jours** (publiée le 2026-09-30T14:08Z ; nous sommes le 2026-10-06). Une version récente est le scénario classique de compromission de compte, mais ici les indices vont dans l'autre sens : même éditeur, signatures de registre, diff petit et lisible, aucun script d'installation, aucune nouvelle dépendance, et le contenu correspond à l'avis. Ce n'est pas un motif de blocage. **Il n'existe pas de règle de délai minimal** pour les nouvelles versions de dépendances dans ce dépôt : un grep de `docs/` sur cooldown, minimum release age et « âge minimum » ne trouve que des cooldowns RPC et sUSDe, sans rapport. Il n'y a pas de `.npmrc` dans le worktree. Recommandation, hors lot : décider d'une règle de délai, avec une dérogation explicite pour les correctifs de sécurité.
8. **Lockfile : conforme.** `git diff aebe4df9..2ded4c8c -- package-lock.json` : +3/−3, uniquement `version`, `resolved` et `integrity` de `node_modules/source-map-js` (hunk à la ligne 4699). Les trois dépendants déclarent `"source-map-js": "^1.2.1"` aux lignes 1371 (`@tailwindcss/node`), 4235 et 4378. La version 1.2.2 satisfait `^1.2.1` (même majeure, ≥ 1.2.1). `npm audit --audit-level=high` dans le worktree, à `2ded4c8c`, renvoie **found 0 vulnerabilities**, code de sortie 0.
9. **Périmètre du commit : conforme.** `git diff --stat aebe4df9..2ded4c8c` : 2 fichiers. `package-lock.json` (+3/−3, constat 8) et `docs/G0-lot-dep-source-map-js-1.md` (+34, nouveau, documentaire seulement). Aucun autre fichier, aucun `package.json`, aucun fichier de CI. Les faits du G0 recoupent cette revue : avis, plage, intégrité, mainteneur, lignes 1371, 4235 et 4378 en `^1.2.1`, audit à 0. Ce que le G0 affirme sur `npm ci --ignore-scripts`, la construction du site et `test:main` n'a pas été rejoué ici, faute de temps : c'est hors périmètre de cette G2.

## Traces
Fichiers dans `scratchpad/g2dep/` : `source-map-js-1.2.{1,2}.tgz`, `a/` et `b/` (paquets extraits), `advisory.json`, `probe.js`. Aucun processus n'est resté actif.
