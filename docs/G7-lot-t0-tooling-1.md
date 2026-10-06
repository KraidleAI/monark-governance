# G7 du lot T0-TOOLING-1 : les actes de T0 outillés, sans retouche à la main

- **Branches** (commits locaux, ni push ni PR) : `recherches/t0-tooling-1-a` sur `597a986d`, puis `recherches/t0-tooling-1-b` empilée sur `-a` ; chacune reçoit le tronc `lot/etude-suite` (`8aea2299`) par un commit de fusion. La branche `recherches/t0-tooling-1` porte la première forme, d'un seul tenant (`ce27c901`, `dc473c43`) ; elle est remplacée par les deux branches (même arbre que `-b`, au §4 du G0 près).
- **Commits** : `-a` : `e2969d1c` (G0, tests rouges), `04c3a76a` (gel) ; `-b` : `3f210360` (tests rouges), `1981d9a2` (gel), puis ce G7.
- **Zones** : celles du G0 §1, ouvertes par la consigne du fondateur et accordées par MONARK (`fdc1032`). **Acte de porte V-2 proposé à MONARK** : la règle `ph` de `scripts/public-text-deny.mjs`.

## 1. Items

| # | Fait | Comment |
|---|---|---|
| 1 | oui (`-a`) | `--out` écrit seulement si tout est vert, TLS compris ; en échec : sortie 1, `--out` intact, l'enregistrement dans `<out>.failed` (ignoré par git, `*.failed`), retiré par la passe verte suivante. Option inconnue ou sans valeur : refus nommé, sortie 2, avant toute requête. Une passe locale `http` verte écrit toujours `--out` (TLS sauté) : la synchro du harnais la refuse, fermée (`tls.authorized`), comme à la base |
| 2 | oui (`-b`) | `writeServed` et `writeHarnessPending` écrivent le manifeste par l'écrivain canonique de la synchro ukemi, importé (aucune copie) ; rangement d'une clé neuve généralisé à sa famille (inchangé pour ukemi). La garde ukemi accepte le résultat (testé : `promotionBlocked`, puis ses deux écritures). `GATE_LIQ_BODY`, `CALIBRATE_BODY`, `CASCADE_BODY` importés de `verify-harness.mjs` |
| 2 bis | oui (`-b`) | la synchro Narabi pose aussi son entrée (c bis de la relecture) |
| 3 | oui (`-a`) | « the scores digest, » ; `COMMENT` épinglé par empreinte |
| 4 | oui (`-a`) | règle `ph`, `/\{[A-Z][A-Z0-9_]*\}/` ; 0 refus sur `docs/public-notes/**` ; `{btc,eth}` et `{dir}` admis |
| 5 | oui (`-b`) | `RUNBOOK-vitrine.md`, « Ordre de T0 », neuf actes, commandes exactes ; test d'ordre (les tests de runbook existent dans `surfaces-1-1-0`) |
| 6 | oui (`-b`) | dérivé partout, sauf `PINNED`, tapé à dessein ; `scripts/repin-served.mjs` et son test (G0 §3) |
| 7 | oui (`-a`, `-b`) | 15 contrôles nommés dans `RUNBOOK-harness.md` ; trois empreintes de schémas épinglées ; étape 9 : `docs/public-notes/v0.9.0.md` et `v0.9.0.commit.md` |

## 2. Preuve de T0 sur une copie promue

Copie de l'arbre (hors `.git`) ; CA tirée de `verify-harness.mjs` contre le harnais en processus, son bloc TLS rendu authentifié ; puis `writeServed`, `writeNarabiServed`, la queue de la synchro ukemi et `node scripts/repin-served.mjs` (seule ligne changée : `PINNED`, l'entrée en attente partie). Sur cette copie :

- `harness-served`, `site-send-guard`, `release-public-flow`, `narabi-live`, `site-ukemi`, `surfaces-1-1-0`, `export-public` : **verts** ;
- `test:main` : aucun rouge dans ces familles ; 92 rouges, tous des tests qui lisent un dépôt git (mutants, missions, R-25, garde d'octets, Dōjō) absent de la copie, plus les rouges connus de l'hôte.

Deux pièges trouvés ainsi, hors relecture, corrigés dans `-b` : la date `pending_since` d'un test BYO, postérieure à l'instantané dérivé ; la clé 1.1.0 `scores_sha256`, valeur servie après T0 et nommée par `/integrators` (rangée dans les identifiants nus, avec sa raison dans `PROSE_WORDS` ; les valeurs de l'instantané en attente comptent dès maintenant).

## 3. Vérifications

- **red-proof** (`--seed 37`) : `-a` contre `597a986d`, `--draw 4` : **OK**, 5 jugés, 5 F2P, 4 tueurs tirés, 4 tués. `-b` contre `04c3a76a`, `--draw 8` : **OK**, 12 jugés (5 F2P, 7 `new-module` : `harness-served.test.ts` importe `scripts/repin-served.mjs`, ajouté), 8 tueurs tirés, 8 tués.
- **Ancres** (`verifie-ancres.mjs --touched`) : `-a` 25/25, `-b` 46/46 ANCRE. Ré-ancrés : `verify-harness.mjs` (4), `sync-harness-served.mjs` (2), `public-text-deny.mjs` (3), `RUNBOOK-harness.md` (1), `README.md:330` (perdu à la base). Hors lot, à la base comme au gel : 8 tueurs PERDU (`oracle-l1-split`, `oracle-run`), non touchés.
- **R-25** : `-a` 155 lignes (+129 −26) contre `8aea2299` (le tronc égale `597a986d` hors `docs/**/*.md`) ; `-b` 466 (+381 −85) contre `-a`. Le lot entier ferait 621 : d'où les deux branches.
- `tsc` 0 ; `eslint .` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` OK ; `lang:gate` OK ; `export:check` OK (les nouveaux scripts ne sont pas exportés).
- `test:main` sur `-b` : 2 706 tests, 2 681 verts, 22 sautés, 3 rouges connus de l'hôte (`sentinel_sigterm_*` ×2, `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`). Arbre `-a` : tests touchés verts (79).
- **Octets servis** : `/openapi.json` en processus `61c9df97a254a863a68fdc2c493799803397bfa190b85db3ca97673d2a8ccbf0`, inchangé.

## 4. Reste ouvert

- Hors lot : M-e (bloc daté de `/integrators`), M-f (montée de `HARNESS_VERSION`), B-1 (SPEC-1-1-0-RELEASE), m-c, m-d, m-f.
- L'acte de porte V-2 (`ph`) attend la décision de MONARK.
