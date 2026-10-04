# G7 du lot SPEC-PUBLISH-PIPELINE-1 : producteur du contenu de `KraidleAI/monark-kata-spec`

- **Plan** : `docs/G0-lot-spec-publish-pipeline-1.md` (`d927b7f7`, bloc daté §7 pour les plis de la G2 et la scission). Demande : MONARK, message du 2026-10-04 « trois tâches » §1.2.
- **Base** : `3e2cb345` (`origin/lot/etude-suite`), branche `recherches/spec-publish-pipeline-1`. Auteur : RECHERCHES.
- **Commits** : G0 `d927b7f7` ; tests `ab1097d8` ; code `abc2e51f` ; correction `70796175` (premier gel) ; premier G7 `3918acf1` ; plis de la G2 : tests `0823c5de` (rouges au gel `70796175`), code `e89c004c`, tueur `521bca9a` = **gel**.
- **Rien n'est publié ni poussé.** Publier reste l'acte de MONARK sous les deux go datés du fondateur (F-5a, F-5b).

## G2 (instance neuve) : APPROUVE-AVEC-CORRECTIONS, pliée

Rapport : `G2-spec-publish.md` (sondes `g2-sp/`). Plis :
- **B1** arbre partiel : sorties qui se recouvrent refusées à la lecture de la liste ; écriture dans un répertoire temporaire renommé en place ; un échec (collision non lue, `ENAMETOOLONG` en cours d'écriture) laisse `--out` absent et aucun temporaire.
- **B2** contournement de « jamais retiré » : `previous` doit être le sommet de son arbre git (`rev-parse --show-toplevel`) ; test avec une racine sous-répertoire.
- **B3** porte : `checkPublicText` sur NFKC avec exceptions fermées (`G0`..`G7`, `monark-governance`, URL du méta-schéma, lieux dans une clé seulement) ; `recherches` à toute casse ; chemins personnels ; JSON décodé ; mots retenus par empreinte. Un test par trou listé (opérateurs RPC, `Aave` en prose, `Kraidle`, `Hyperliquid`, pleine chasse, `\u`, identifiants d'items, `R-25`, IPv4, URL, `public sync`).
- **Mineurs pliés** : liens hors racine (`input_escapes`), répertoire en entrée (`input_not_file`), `--out` dans un arbre git, modes 0644 (test sous umask 077), toute entrée épinglée (au lieu d'un contrôle de propreté de la gouvernance), survivants M29/M30 (vérification par présence seule, manquant puis en plus), M04 (doublon à la casse près), M35 (mauvaise étiquette de format). Non plié : m4 (`--verify` rouge tant que le dépôt public n'a ni `VERSION` ni manifeste : c'est exact ; `--verify` sur `--out` lui-même reste égal par construction) ; m7 (faux positif du scan de `durable.test.ts`, propriétaire rpc-guard : item proposé ci-dessous).
- **Une consigne suivie autrement** : le mot retenu demandé pour la porte n'est écrit dans aucun fichier (consigne de ne le nommer nulle part) ; il est bloqué par son empreinte (`WITHHELD`), et le mécanisme est testé sur un mot de synthèse.

## Scission (datée 2026-10-04, R-25)

La déclaration `contract-1.1.0` (51 lignes) et le test I-2 passent à **SPEC-1-1-0-RELEASE**. La sorte `policy-table` et l'écriture canonique restent ici. Rien d'autre n'est déplacé.

## Oracle

- `node scripts/red-proof.mjs --base 3e2cb345 --gel 521bca9a --repo <worktree> --draw 14 --seed 37` : **OK**, 14 F2P, 14 tueurs tirés, 14 tués ; `RED-PROOF.json` sha256 `af5153a4…0e59`, digest du gel `fbf4ce18…129d`. Essais : (1) gel `e89c004c` : REFUSÉ, un tueur mort-né (`[0-7]` → `[0-6]` : la porte ne rapporte que la première forme `G` d'une ligne, `G0`, encore exceptée) ; tueur corrigé en `[1-7]` (`521bca9a`) ; (2) OK. Aucune troncature TAP.
- Au gel `70796175`, les tests pliés rougissent par assertion (parse, écriture ratée, entrées, `previous`, porte, commandes git, modes sous umask 077).
- R-25 par `r25()` : **526** lignes (+526/−0), sous 547 ; contenu 0.
- `tsc`, eslint du test, `gate:vocab`, `lang:gate`, `export:check`, `lint:ratchet` 69/69 : verts ; test du lot 14/14 ; `durable.test.ts`, `public-text-deny.test.ts`, `export-public.test.ts` hors test 42 : verts. Test 42 : rouge, sur les mêmes échecs ukemi de la CI exportée qu'à la base (environnement ; Node v22.22.2 ici).

## Rejeu sur le dépôt public

`--release kata-wave1 --date 2026-10-02`, `--verify` sur le clone de `ddfee9e` : 4 fichiers égaux octet pour octet, 0 différent, 0 manquant, 2 en plus (`VERSION`, `MANIFEST.sha256`) ; manifeste `720e99d4…1b30`, inchangé depuis le premier gel ; `sha256sum -c --strict` vert ; les quatre fichiers passent la nouvelle porte, décodage JSON compris.

## Propositions de RECHERCHES à MONARK (réponses recommandées par la G2)

- Q-SP-1 : ne pas poser les sources de la vague 1 dans la gouvernance (R-25 l'interdit à lui seul). Pour un fichier déjà publié, faire de `previous` (épinglé) la source de référence ; garder `recherches` pour un contenu neuf pas encore public. Les sources 1.1.0 neuves sous `spec/` de la gouvernance, à peser contre F-5a puisque ce dépôt est public.
- Q-SP-2 : non ; reporter `reports/README.md` depuis l'arbre publié épinglé suffit. Une source de gouvernance seulement le jour où son texte change.
- Q-SP-3 (M-7) : ne pas permettre les lieux en prose ; seulement en jeton de clé dans sa grammaire (fait au §7 du G0) ; opérateurs, `Kraidle` et lieux en prose restent interdits.
- Q-SP-4 : réécrire les `description` des schémas en CM-3c (texte servi : les renvois de gouvernance y fuient aussi) ; ne pas élargir la porte.
- Q-SP-5 : confirmer les chemins aux G0 de CM-3c-1 et CM-4 ; la déclaration a quitté ce lot (scission).
- Q-SP-6 : produire le workflow de CI depuis une source de gouvernance épinglée, pour que l'arbre public reste reproductible par `--verify` ; sinon `--verify` doit ignorer `.github/`. Le test de composition « table servie = table publiée » reste un item MONARK distinct (plan §9.2, acte 3).

## Items

- SPEC-1-1-0-RELEASE (MONARK) : reprend `contract-1.1.0` et I-2, sources épinglées.
- CANON-SINGLE-SOURCE-1 (RECHERCHES, déclencheur : fusion de CM-3c-1) : l'écriture canonique de l'outil remplacée par la fonction unique de `packages/contracts`.
- DURABLE-SCAN-TEMPLATE-1 (propriétaire rpc-guard) : le scan de `durable.test.ts` lit un gabarit après `from(` comme un spécifiant.

## Sortie

Prêt pour le contrôle de MONARK.
