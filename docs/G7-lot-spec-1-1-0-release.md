# G7 du lot SPEC-1-1-0-RELEASE : la version `contract-1.1.0` du dépôt de la spécification

**Rien n'est publié ni poussé.**

- **Plan** : `docs/G0-lot-spec-1-1-0-release.md` (`c3e52972`), et son bloc daté §7 (`a33c1495`, réponses de MONARK, avant les tests rouges).
- **Base** : `597a986d`. Tronc fusionné : `lot/etude-suite` `8aea2299` (fusion de T0, #192). Il ne diffère de la base que par quatre documents.
- **Scission R-25** : la mesure entière vaut 568, au-delà de 547. Le lot passe donc en deux branches empilées, comme au §7 du G0.
- **En attente** : l'entrée du texte `CONTRACT-1.1.0.md` (racine `recherches`), dernier pas, quand son chemin et son sha256 sont donnés.

## Commits

| Branche | Commits |
|---|---|
| `recherches/spec-1-1-0-release-a` | G0 `c3e52972`, bloc daté `a33c1495` ; tests rouges `07b232fc` ; gel `c85f352e` (écrivain, surface de types, cinq copies de schémas) ; fusion du tronc `e8fb1a8a` |
| `recherches/spec-1-1-0-release-b` (sur `-a`) | tests rouges `29ae484a` ; gel `d0f686b6` (35 tables, déclaration `contract-1.1.0`) ; fusion du tronc `21f09456` ; fusion de `-a` `4e69d6d8`, qui rend `e8fb1a8a` ancêtre (une seule base de fusion) ; ce G7 |

## Ce que le lot livre

- **`scripts/spec-policy-tables.mjs`** `--write | --check [--root <rép>]` :
  - il lit `SERVED_POLICY_TABLES` de `apps/harness/src/tools/gate.ts`, la valeur servie, et n'en construit pas une seconde ;
  - il écrit `canonicalJson` de chaque table sous `spec/contract-1.1.0/policy/` ;
  - il écrit les copies des schémas par la liste fermée du §3 du G0 ;
  - il ne lit ni horloge ni réseau.
- **`spec/contract-1.1.0/`** : 5 schémas (disposition gelée, lisibles) et 35 tables (une ligne canonique chacune).
- **`scripts/spec-publish-inputs.json`** : la version `contract-1.1.0`, ajoutée après `kata-wave1`, dont les lignes, et donc les tueurs existants, ne bougent pas.
  - `previous_commit` `ddfee9e` ;
  - quatre fichiers reportés de `previous` ;
  - 40 entrées de gouvernance, toutes épinglées.
- **`test/spec-1-1-0-release.test.ts`**, 5 tests :
  - `-a` : copies de schémas = transformation fermée, données inchangées ; `--write` et `--check` sur une copie temporaire (écart, manquant, en trop, sorties 0, 1 et 2) ;
  - `-b` : déclaration épinglée ; table servie = fichier = `policy_table_sha256` = `sha256Canonical` ; `plan` hors ligne sur la seule racine de gouvernance, où seules les racines absentes sont nommées ; porte à 0 problème sur les 40 fichiers.

## Oracle

- **red-proof** `--base 597a986d --seed 37` :
  - `-a`, gel `c85f352e`, `--draw 2` : **OK**. 2 F2P, 2 tueurs tirés, 2 tués. `RED-PROOF.json` sha256 `6834a7285a11c4ca…`.
  - `-b`, gel `d0f686b6`, `--draw 5` : **OK**. 5 F2P, 5 tueurs tirés, 5 tués. `RED-PROOF.json` sha256 `c1df4699ccf2ffc7…`.
- **R-25** :

  | Branche | Contre | Mesure |
  |---|---|---|
  | `-a` | `8aea2299` | **442** (+442/−0), contenu 0 |
  | `-b` | `-a` (`e8fb1a8a`) | **128** (+127/−1) |
  | `-b` | `8aea2299` | 568 |

  Les deux branches restent sous 547 chacune.
- **Ancres** (`verifie-ancres.mjs --touched 597a986d HEAD`) : 5 tueurs, ANCRE 5, DERIVE 0, PERDU 0.
- **Contrôles statiques** : `tsc` vert ; eslint du test vert (les `.mjs` et `.d.mts` sont hors eslint par configuration) ; `lint:ratchet` 69/69 ; `gate:vocab`, `lang:gate` et `export:check` verts.
- **Tests touchés** : `spec-1-1-0-release`, `spec-publish`, `contracts-frozen`, `export-public` hors test 42 et `public-text-deny` : 31/31.
- **Octets servis** :
  - `buildOpenApi()` en processus : sha256 `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0`, inchangé ;
  - aucun fichier sous `apps/`, `packages/` ou `schemas/` n'est touché ;
  - aucun fichier réservé à T0-TOOLING-1 n'est touché.

## Rejeu hors ligne

`--release contract-1.1.0 --date 2026-10-06` produit **46 fichiers** dans le répertoire de travail temporaire, avec `previous` le clone local propre de `ddfee9e` et `recherches` le clone local.
- `MANIFEST.sha256` vaut `e39372ca…1df3` ;
- `sha256sum -c --strict` est vert ;
- aucun `withdrawn`.

Le texte de la spécification n'est pas encore dans la liste : le manifeste changera avec lui.

## Pour MONARK

- **VERIFIERS-LIST-F5A-1** : non touché par cette version (aucune ligne kata, `recompute` nul sur les lignes marginales). Il vaut toutefois pour toute ligne kata avec `recompute`, pas seulement pour la vague 2 (G0 §7).
- **Dernier pas** : une entrée `{"out": "CONTRACT-1.1.0.md", "root": "recherches", "path": "kata/spec/CONTRACT-1.1.0.md", "kind": "text", "sha256": …}`, avec son test (R-1 étendu), puis le rejeu.
