# G7 du correctif de sécurité du site : `next` et `@next/mdx` de 16.3.8 à 16.4.3

- **Base** : `a8364fea`. **PR** : #341, branche `lot/site-next-16-4-3`, tête `18f4e960` (un commit). **Fusion au tronc** : `f6a3b25a`,
  tronc avant fusion `a8364fea`.
- **Déclencheur** : `npm audit --audit-level=high` du job `g6-compliance`, rouge sur #340 le 2026-10-28 : `next` 16.0.0 à 16.4.0 classé
  critique sous trois avis (GHSA-2464-fhr4-w9xw, GHSA-673q-mjm6-r5xr, GHSA-p3m5-59mp-jv5r) ; le correctif d'`npm audit` installe
  `next@16.4.3`. Les textes des avis ne sont pas lus : ce qui en est dit vient de la sortie d'`npm audit` [2nd].
- **Zone** : déclarée avant le premier commit (zones de RECHERCHES, recherches#719, fusionnée le 2026-10-28, `68ea4bac`).

## Ce que le lot livre

- `apps/site/package.json` : `next` et `@next/mdx` épinglés à 16.4.3. L'audit ne nomme que `next` ; `@next/mdx` le suit, pour garder
  une seule version.
- `package-lock.json` : la famille `next` (`next`, `@next/env`, `@next/mdx`, les huit `@next/swc-*`) à 16.4.3, et `fast-uri` de 3.1.8 à
  3.1.9 dans sa plage (quatre avis modérés). `npm audit` : 0 vulnérabilité à `18f4e960`.
- `test/site-security-floor.test.ts` (neuf) : les deux épingles, et ce que le fichier de verrouillage résout pour elles, à 16.4.3 ou
  au-delà.

## Vérification

- `test:main` vert (3349 tests : 3302 réussis, 0 échec, 47 sautés), enregistrements régénérés (332 fichiers, 3349 tests), contrôle du
  nombre de tests vert contre la base ; red-proof : le test neuf rouge à la base par une assertion, le tueur tiré tué ; mutants : 6 sur
  6 tués ; eslint et tsc propres ; taille du lot 43 lignes (borne 1205).
- **G2** (instance neuve, `claude-opus-5-5`, modèle relevé dans sa transcription) : ACCEPTE-AVEC-CORRECTIONS, aucun point bloquant.
  Pliés : les sorties d'`npm audit`, d'eslint, de tsc et du contrôle du nombre de tests gardées (m-1) ; le rejeu de DJ-L117 inscrit à
  son registre (m-2) ; l'item du redéploiement (m-3) ; le texte de la PR corrigé (nit-1 à nit-3).
- CI de #341 : 14 contrôles sur 14 verts à `18f4e960` ; `g3-site` construit le site avec Next.js 16.4.3 et ses contrôles du HTML
  passent.
- Rejeu Windows à la fusion : `test/site-security-floor.test.ts`, `test/ci-gates.test.ts`, `test/killer-lines.test.ts`, 46 tests verts.
- Oracle G7 sur `f6a3b25a`, base `a8364fea` : vert, 11 gates sur 11 (enregistrement
  `f6a3b25a7739d28cd1cd57997b58090807ce2d2d-G7-20261028T220328Z-22216.json`, sha256 `90c52c36…`). Le premier lancement
  (`…-G7-20261028T214951Z-33260`) était rouge à `test:export` : son `npm ci` hors ligne ne trouvait pas `next` 16.4.3 dans le
  cache npm (`ENOTCACHED`). Les cinq paquets de la montée (`next`, `@next/env`, `@next/mdx` et `@next/swc-win32-x64-msvc` en
  16.4.3, `fast-uri` 3.1.9) ont été ajoutés au cache avec l'accord du fondateur (2026-10-28 22:02 UTC), puis l'oracle relancé.

## Ce qui reste

- **SITE-NEXT-REDEPLOY-1** : clos le 2026-10-28 à 23:31 UTC. La vitrine servie (`next start` sur le serveur) ne change qu'au
  redéploiement, acte de MONARK sous le go du fondateur (`docs/RUNBOOK-vitrine.md` ; « acte du fondateur », écrit ici d'abord, était
  faux) : l'arbre servi depuis le 2026-10-06 renvoyé avec les deux fichiers de ce lot seuls (`d85ef2c6`), `next` 16.4.3 lu sur le
  serveur (`docs/ETAT.md`, l'item ; `docs/JOURNAL-PROVENANCE.md`, l'entrée du 2026-10-28 23:31 UTC).
- **DOJO-NEXT-E0-REPLAY-1** : l'état E0 de `/dojo` (aucun record servi) n'est pas rejoué en 16.4.3 (registre du Dōjō, DJ-L117).
