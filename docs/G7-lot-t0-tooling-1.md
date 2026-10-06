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

## 5. Repli de la G2

G2 neuve (`docs/G2-lot-t0-tooling-1.md`) : non bloquante sur `-a` et `-b`. Tout est replié, consigne « sans dette ». Pile de trois branches, chacune sous 547 lignes R-25 :

| Branche | Tête | R-25 | Contenu du repli |
|---|---|---|---|
| `recherches/t0-tooling-1-a` | `783a3186` | 342 contre `8aea2299` | `verify-harness` : N-1, N-2, N-3, M-1, M-2, M-3, m-f |
| `recherches/t0-tooling-1-b` | `5bb474f1` | 532 contre `-a` | `ph` élargie (M-4), N-5, N-6, M-5, M-6, M-7, M-8, m-d, `CA_REL` exporté, TLS `mcp.` exigé par la synchro |
| `recherches/t0-tooling-1-c` (nouvelle) | `842a15d3` et ce G7 | 156 contre `-b` | N-4 (promotion sûre et reprenable), m-c |

Ordre des PR (M-9) : `-a` vers `lot/etude-suite`, puis `-b` une fois `-a` fusionnée, puis `-c` une fois `-b` fusionnée.

### 5.1 Constats

- **N-1, N-2** : valeur vide ou faite d'espaces, et option répétée, refusées par leur nom, sortie 2 (`verify_harness_refuses_an_unknown_option`, sept vecteurs).
- **N-3, m-f** : `--out` n'est écrit que si les 15 contrôles passent **et** si les deux hôtes contactés, `api.` et `mcp.`, passent une poignée de main TLS authentifiée, chacun sur son port (`tls`, `tls_mcp`). Une passe verte en `http` écrit `<out>.local`, une passe rouge `<out>.failed`. Preuve de bout en bout : des façades TLS locales (certificat auto-signé, construit à la volée par `test/helpers/self-signed.ts`, extrait de `l2-rest-tls`) devant le harnais en processus ; certificat de confiance pour l'enfant seul (`NODE_EXTRA_CA_CERTS`) ; un hôte `mcp.` au certificat étranger rougit sur `tls_mcp` seul. La synchro du harnais exige aussi `tls_mcp.authorized`.
- **M-1** : `--out` passe par `<out>.tmp` puis un renommage, avec une relance bornée sur `EPERM` ou `EBUSY` (win32).
- **M-2** : `.gitignore` ne liste plus `*.failed`, seulement les trois enregistrements annexes de la CA (`.failed`, `.local`, `.tmp`). L'export refuse un `*.json.failed|local|tmp` où qu'il soit (`STRUCTURAL_BLACKLIST`, même ligne, aucun tueur déplacé).
- **M-3** : `--timeout <ms>` (10 000 par défaut) borne chaque `fetch`, chaque requête câblée (minuterie totale) et chaque poignée de main ; un délai dépassé est un contrôle rouge (`verify_harness_bounds_every_request`, hôte muet, 500 ms).
- **N-4** : les trois synchros écrivent chaque fichier par fichier temporaire et renommage, le manifeste en dernier, puis retirent le fichier en attente (`applyWrites`, `IO`, `promotedManifest`, une source dans `sync-ukemi-served.mjs`). Le retrait reste un `unlink`, opération atomique : un renommage avant lui ajouterait un pas et un reste possible.
  - Un échec nomme ce qui est écrit et ce qui ne l'est pas, et « nothing written » n'est plus imprimé à tort.
  - Une promotion coupée après l'écriture du manifeste reprend à la relance, sans geste manuel. Elle reconnaît la coupure ainsi : le fichier en attente n'a plus d'entrée, et le servi ne porte plus `pending_since` et égale son entrée.
  - `harness_sync_promotion_resumes_after_an_injected_failure` injecte un échec à chacun des trois points, vérifie le message, relance et constate la promotion faite, le chargeur d'accord et aucun `.tmp` laissé. Le cas voisin non promu est refusé.
- **N-5** : le test d'ordre fige, acte par acte, la liste exacte des empans de code ; la liste `git add` vient des constantes des scripts ; l'acte 2 passe par `parseArgs`. Les quatre mutants survivants de la G2, rejoués à la main : **tués**, fichier restauré (sha256 identique).
- **N-6** : `docs/JOURNAL-PROVENANCE.md` est dans le `git add` de l'acte 6 ; la répétition (§5.2) montre l'arbre propre et le pré-vol de `release-public` qui l'accepte.
- **M-4** : `ph` nomme chaque marqueur d'une ligne, lit les espaces internes et le trait d'union : `/\{\s*[A-Z][A-Z0-9_-]*\s*\}/g`. **Acte de porte V-2, élargi, proposé à MONARK.** `{btc,eth}` et `{dir}` passent ; 0 refus sur `docs/public-notes/**`.
- **M-5** : le chemin « unchanged » de la synchro Narabi répare une entrée périmée (`repairNarabiEntry`).
- **M-6** : commentaire de `markPendingSince` remis à sa place dans le `.d.mts`.
- **M-7, M-8** : l'acte 2 dit qu'une CA relancée après l'acte 3 oblige à refaire les actes 3 à 6 ; nouvelle section « Contrôle après l envoi de T0 » (relecture §3), renvoyée par l'acte 7.
- **m-d** : ligne datée sous `docs/ETAT.md` (« Reste avant T0 ») : #181 et #180 livrés.
- **m-c** : le pré-vol de `release-public` lit la garde d'envoi avant tout appel `gh` ; `release_public_flow` vérifie que le journal du faux `gh` ne bouge pas lors du refus ; les deux vecteurs de visibilité passent après la promotion.
- **Hors de ce lot, avec la raison** :
  - **M-e** (« posted as a dated block on the integrators page ») est une phrase de la NOTICE, pièce de `recherches` hors de ce dépôt, liée au §5 que B-1 tient déjà. Le correctif sans dette est de retirer la phrase de la NOTICE, ou un lot du site pour le bloc daté. Ni l'un ni l'autre n'est un outil de T0.
  - **M-f** (montée de `HARNESS_VERSION`) est une décision de MONARK. Elle change `info.version`, donc `/openapi.json`, que ce lot doit garder à `61c9df97…`, et elle exige un nouveau `--pending` et une entrée du registre MCP.
  - **B-1** : lot SPEC-1-1-0-RELEASE.

### 5.2 Répétition complète (clone avec `.git`, scratch)

Clone de `842a15d3` sur `main` ; harnais local ; aucun hôte réel ; `fetch` des hôtes `api.`, `mcp.` et du registre redirigé par un préchargement local.

- **Acte 2** : le vrai `verify-harness` devant une façade TLS de confiance. Sortie 0, 15 contrôles verts, `tls` et `tls_mcp` authentifiés, `--out` écrit. Les URL et les hôtes TLS sont ensuite renommés vers les noms publics ; l'empreinte va au journal.
- **Actes 3 à 5** : les vrais `main()` des trois synchros, sortie 0. Promotions faites, manifeste canonique.
- **Acte 6** : `repin-served` (puis `--check`, 0) et le `git add` du runbook, extrait du texte, suivi d'un commit. `git status` est **vide**. Les 9 fichiers de T0 font **128/128 verts**.
- **Acte 7** : `export-public --out` sort en 0, sans fichier en attente.
- **Acte 8** : `spec-publish --release kata-wave1` (la 1.1.0 attend SPEC-1-1-0-RELEASE), sortie 0, manifeste `720e99d4…`, celui documenté.
- **Acte 9** : `v0.9.0.md` et `v0.9.0.commit.md` passent la porte et sont committés. `release-public --message docs/public-notes/v0.9.0.commit.md --dry-run` tourne avec un faux `gh`, un miroir nu local et des portes neutres injectées. **Le pré-vol accepte l'arbre**, l'export et le diff passent, rien n'est poussé.

### 5.3 Vérifications

- **red-proof** (`--seed 37`) :
  - `-a` contre `597a986d` : OK, 7 jugés (7 F2P), 6 tueurs tirés, 6 tués ;
  - `-b` contre `783a3186` : OK, 13 jugés (6 F2P, 7 `new-module`), 10 tueurs tirés, 10 tués ;
  - `-c` contre `5bb474f1` : OK, 3 jugés (3 F2P), 3 tueurs tirés, 3 tués.
- **Tueurs tirés à la main**, chaque fichier restauré à l'octet près (sha256) : **27 sur 27 tués**. Ce sont tous les tueurs que le lot ajoute ou ré-ancre. S'y ajoutent les 4 mutants de N-5, tués eux aussi.
- **Ancres** (`--touched 597a986d`) : 61 sur 61.
- `tsc` 0, `eslint .` 0, `lint:ratchet` 69/69, `gate:vocab`, `lang:gate` et `export:check` OK. `/openapi.json` reste `61c9df97…`.
- `test:main` sur `-c` (`842a15d3`) : 2 709 tests, 2 684 verts, 22 sautés, 3 rouges connus de l'hôte (`sentinel_sigterm_*` ×2, `ukemi_guard_record_skipped_the_platter_flush_nonvacuous`).
