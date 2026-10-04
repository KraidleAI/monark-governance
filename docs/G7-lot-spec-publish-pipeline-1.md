# G7 du lot SPEC-PUBLISH-PIPELINE-1 : producteur du contenu de `KraidleAI/monark-kata-spec`

- **Plan** : `docs/G0-lot-spec-publish-pipeline-1.md` (`d927b7f7`). Demande : MONARK, message du 2026-10-04 « trois tâches » §1.2.
- **Base** : `3e2cb345` (`origin/lot/etude-suite`), branche `recherches/spec-publish-pipeline-1`. Auteur : RECHERCHES.
- **Commits** : G0 `d927b7f7` ; tests `ab1097d8` (rouges à la base) ; code `abc2e51f` ; correction `70796175` = **gel**.
- **Rien n'est publié ni poussé.** Publier reste l'acte de MONARK sous les deux go datés du fondateur (F-5a, F-5b).

## Oracle

- `node scripts/red-proof.mjs --base 3e2cb345 --gel 70796175 --repo <worktree> --draw 14 --seed 37` : **OK** au premier essai, 14 tests jugés F2P (rouges à la base par `ERR_ASSERTION`, verts au gel), 14 tueurs tirés, 14 tués ; `RED-PROOF.json` sha256 `10d971af…7a50`, digest du gel `dd41b4be…473a`. Aucune troncature TAP (RED-PROOF-TAP-TRUNCATION-1) : aucune reprise. Premier passage, sur l'ancien gel `abc2e51f` : OK aussi (`4719871b…4778`).
- R-25 par `r25()` (`scripts/oracle/r25.mjs`), base `3e2cb345` : **546** lignes (+546/−0), sous la borne ascendante de 547 (porte CI 1 205) ; contenu 0.
- `npx tsc --noEmit`, eslint du test, `gate:vocab`, `lang:gate`, `export:check`, `lint:ratchet` 69/69 : verts. Test du lot : 14/14.
- `npm test` (Node v22.22.2 sur cet hôte, `engines` demande ≥ 24) : 2 012 tests, 38 échecs, 8 annulés. **Un seul était dû au lot** : `durable_production_path_calls_the_real_node_fsync_and_has_no_off_switch` (`packages/rpc-guard/test/durable.test.ts:195`) lit `Buffer.from(\`${date}\n\`)` comme un spécifiant d'import ; corrigé par `70796175`, test vert seul. Les autres échouent identiquement sur un clone de la base `3e2cb345` (mêmes fichiers rejoués : bell, dojo-collect, sentinel ukemi et u4b, rpc-guard bare-revert et error-hint, coinbase, binance, bell-served, red-proof) : environnement, hors lot.
- Test 42, une fois (6 min 30) : rouge, sur les mêmes échecs ukemi de la CI exportée ; l'outil n'est pas dans la liste blanche de l'export, il n'y entre pas.

## Rejeu sur le dépôt public

`--release kata-wave1 --date 2026-10-02`, racines `recherches` (tête `00d53bc`) et `previous` (clone de `ddfee9e`), `--verify` sur ce clone : **4 fichiers égaux octet pour octet** (`KATA-SPEC.md` `b32a4062…`, `vectors.json` `06ecf069…`, `reports/wave1-report.md` `e91edb41…`, `reports/README.md` `32f26de6…`), 0 différent, 0 manquant, 2 en plus (`VERSION`, `MANIFEST.sha256`, absents du dépôt public aujourd'hui) ; `sha256sum -c --strict MANIFEST.sha256` vert ; `MANIFEST.sha256` = `720e99d4…1b30`, identique sur les deux gels. `--release contract-1.1.0` : refus fermé, 40 `input_missing` (sources 1.1.0 pas encore posées) et 6 `vocabulary` (Q-SP-4).

## Écarts

- Les sources de la version actuelle ne sont pas dans le dépôt de gouvernance mais dans `recherches` (Q-SP-1) ; `reports/README.md` n'a aucune source et vient de l'arbre publié (Q-SP-2).
- Les schémas servis rougissent la porte `kitchen` (renvois « ADR-M001 Decision 6 » et voisins dans `description`) : finding, Q-SP-4.
- Aucune ligne de CI : le test tourne dans `npm test`.
- Les chemins de sources 1.1.0 sont proposés (Q-SP-5) ; l'écriture canonique est une copie locale du brouillon §2, à remplacer par la fonction unique de `packages/contracts` quand CM-3c-1 la pose (item CANON-SINGLE-SOURCE-1, RECHERCHES, déclencheur : fusion de CM-3c-1).

## Branchement

Consommateur : MONARK, à SPEC-1-1-0-RELEASE (et dès maintenant pour une version `kata-wave1` avec manifeste, s'il le veut). Test d'intégration non-LLM : `composition_replay_gives_the_same_bytes_and_only_the_date_moves_them` et `cli_verify_compares_a_published_tree_path_by_path`. La CI du dépôt public reste à faire (Q-SP-6).

## Sortie

Prêt pour le contrôle de MONARK ; questions Q-SP-1 à Q-SP-6 du G0 ouvertes.
