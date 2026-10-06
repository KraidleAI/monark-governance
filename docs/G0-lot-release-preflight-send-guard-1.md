# G0 du lot RELEASE-PREFLIGHT-SEND-GUARD-1 : `release-public` refuse dès son pré-vol tant qu'un instantané en attente existe

- **Item (ETAT)** : « `release-public` refuse dès son pré-vol, avant les portes locales, tant qu'un instantané en attente existe (la garde de l'export reste l'autorité). »
- **Origine** : Q-CPA-1 du lot C' 3c-4a (`docs/G7-lot-c-prime-a.md`, écart 4 et section « Questions ») ; réponse de la cellule : non pour 3c-4a, suite formée sous ce nom (appel de `pendingSendBlockers` sur l'ensemble gardé, même message, la garde de l'export restant l'autorité). Voir aussi R-2 du même G7 (« Dry-run de la release »).
- **Base** : `7ad0f580` (`origin/base/chantier-moteur-2026-10-03`, contrat 1.1.0). Branche `recherches/release-preflight-send-guard-1`. Auteur : RECHERCHES.
- **Zone** : `scripts/release-public.mjs` et `scripts/release-public.d.mts` (outil interne, hors de la liste blanche de l'export) ; `test/release-public.test.ts` et `test/release-public-flow.test.ts` ; ce G0 et le G7. `scripts/export-public.mjs` (la garde SITE-SEND-GUARD-MECH-1) est **inchangé**.

## 1. Constat mesuré à la base

L'arbre de la base porte l'instantané en attente (de C2 à T0) : `pendingSendBlockers(collectFiles(".").kept, readTextOrNull)` rend, en 14 à 29 ms, les quatre bloquants `apps/site/data/harness-pending.json`, `apps/site/data/harness-served.json (pending_since)`, `apps/site/data/ukemi-pending.json`, `apps/site/data/ukemi-served.json (pending_since)`.

`release-public.mjs` lancé sur cet arbre (mesuré par la forme rouge de `release_public_flow` à la base, portes substituées qui journalisent leur passage, faux `gh`, dépôt nu jetable) :

1. le pré-vol passe : message, `MONARK_PUBLIC_MIRROR`, garde de branche, identité noreply, `gh`, visibilité ;
2. le contrôle du dépôt distant du clone passe ;
3. **les cinq portes locales tournent toutes** (`npm run ci`, `lang:gate`, `lint-ratchet`, `eslint`, `export:check`) ;
4. l'étape d'export refuse : « export FAILED — a pending snapshot is in the exported tree (SITE-SEND-GUARD-MECH-1) », puis « RELEASE ABORTED: export failed » ; le clone du miroir est intact, rien n'est mis en scène.

Le refus est donc juste et fermé, mais tardif. Durée réelle des cinq portes sur cet hôte, mesurée à la base (Linux, Node 24.21.0, sous la charge d'autres sessions) : voir le tableau ci-dessous. Le `--dry-run` suit le même chemin (R-2 du G7 de 3c-4a) : il ne refuse qu'après les portes complètes.

| Porte | Durée |
|---|---|
| `npm run ci` | 372 s (2573 tests ; mesurée avec les deux tests rouges de ce G0, seuls échecs) |
| `npm run lang:gate` | 2 s |
| `node scripts/lint-ratchet.mjs` | 99 s |
| `npx eslint .` | 83 s |
| `npm run export:check` | 1 s |
| **Total avant le refus** | **557 s, environ 9 min 17 s** |

## 2. Conception

1. **Garde pure** `sendGuard(blockers) -> {ok, reason}` exportée par `release-public.mjs` (déclarée dans le `.d.mts`) : `ok` ssi la liste est vide ; la raison nomme chaque bloquant. Même forme que `branchGuard`.
2. **Appel en dernier dans `preflight`**, après la lecture de la visibilité : `sendGuard(pendingSendBlockers(collectFiles(SRC).kept, readTextOrNull))`, les trois noms importés de `export-public.mjs` (source unique : l'ensemble gardé est lu comme l'export le lit, `SRC` étant l'arbre de l'outil). Refus par `abort` : « RELEASE ABORTED: RELEASE-PREFLIGHT-SEND-GUARD-1 (SITE-SEND-GUARD-MECH-1): a pending snapshot is in the exported tree: <bloquants>; no mirror release before T0. … » avec les deux commandes de la promotion de T0. Le refus vaut pour la release et pour le `--dry-run`, avant toute porte et avant tout contact avec le clone du miroir.
3. **La garde de l'export reste l'autorité** : `export-public.mjs` n'est pas touché ; sa garde refuse toujours `--out` (et donc l'étape d'export de la release) si le pré-vol était un jour contourné ou muté. Pas de drapeau de contournement (Q-CP-4).
4. Pourquoi en dernier : l'ordre des refus existants (message, miroir, branche, identité, `gh`, visibilité) ne bouge pas, et leurs tests non plus ; seul le contrôle du dépôt distant du clone (`main()`, après le pré-vol) passe après la garde. Variante : Q-RPG-1.
5. Pas de message partagé avec l'export : le texte du refus est écrit dans `release-public.mjs` (il nomme les deux items et les mêmes commandes), pour ne pas toucher `export-public.mjs`, fichier exporté (Q-RPG-3).

## 3. Tests rouges (commit du G0)

| Test (fichier) | À la base | Tueur (adresse au gel) |
|---|---|---|
| `rpg_send_guard_refuses_each_pending_blocker_and_names_it` (`test/release-public.test.ts`, neuf) : lu par un import d'espace de noms (la base charge le fichier) ; `sendGuard([])` laisse passer ; chacun des quatre bloquants seul refuse et est nommé ; les quatre ensemble aussi | **rouge par assertion** : « release-public.mjs exports sendGuard » | `scripts/release-public.mjs:52 ROR "blockers.length > 0" -> "blockers.length > 1"` |
| `release_public_flow` (`test/release-public-flow.test.ts`, modifié) : sur l'arbre avec l'instantané, la release **et** son `--dry-run` refusent avec « RELEASE ABORTED: RELEASE-PREFLIGHT-SEND-GUARD-1 (SITE-SEND-GUARD-MECH-1) », nomment les quatre bloquants, sans « export failed », **aucune porte n'a tourné** (journal vide), clone du miroir intact, rien mis en scène ; puis promotion (`dropPendingSnapshot`), et le refus « unexpected remote » (déplacé après la promotion, puisqu'il suit le pré-vol), la porte rouge et les passages acceptés comme avant | **rouge par assertion** : « a pending snapshot stops the release in its preflight », la sortie montre les cinq portes passées puis « RELEASE ABORTED: export failed » | `scripts/release-public.mjs:157 CONST "if (!sg.ok)" -> "if (false)"` (remplace le tueur `export-public.mjs:521 SDL`, que ce test n'atteint plus) |

Le nom `release_public_flow` est gardé (test existant modifié, ses autres affirmations ne bougent pas) ; le test neuf porte le préfixe `rpg_`.

## 4. Tueurs (plan)

- Les deux tueurs ci-dessus, déclarés au-dessus de `test(`, tirés à la main au gel (modification, le test seul rouge, restauration, sha256 identique), puis tirés par `red-proof --draw 2 --seed 37`.
- **Autorité de l'export** : le tueur `export-public.mjs:521 SDL "    process.exit(1);" -> ""` quitte `release_public_flow` (le pré-vol refuse avant l'export). Il est tiré à la main contre `site_send_refused_while_a_pending_snapshot_exists` (`test/site-send-guard.test.ts`, qui exerce `export-public.mjs --out` directement) : attendu rouge (le `--out` écrit et sort à 0). Le tueur déclaré de ce test (`:517 CONST`) est inchangé.
- Tueurs secondaires tirés à la main, sans déclaration : appel retiré (`:156`, `sendGuard([])` au lieu de la lecture), `.kept` remplacé par une liste vide, garde déplacée après les portes (sous forme de test : le journal n'est plus vide).

## 5. R-25 (estimation contre `7ad0f580`, plafond du lot 547)

| Poste | Lignes |
|---|---|
| `release-public.mjs` : import, `sendGuard`, appel, commentaires | ~20 |
| `release-public.d.mts` | ~4 |
| `rpg_send_guard_…` | ~20 |
| `release_public_flow` (boucle des refus en fonction, deux passages en attente, déplacements) | ~35 |
| **Total** | **~80** |

Plafond de la PR : 1205 lignes (`VIBEGATES_PR_LIMIT`, affiché par l'oracle).

## 6. Windows

- Aucun chemin neuf : `collectFiles` construit des chemins relatifs à barres obliques (les bloquants s'écrivent `apps/site/data/…` sur win32 comme sur Linux, ce que `site-send-guard.test.ts` affirme déjà) ; `SRC` vient de `fileURLToPath` + `dirname`.
- `release_public_flow` garde son faux `gh.cmd` (P-8) et son `Path` ; aucun saut ajouté, aucun nom réservé.
- Coût du pré-vol : une marche de l'ensemble gardé (575 fichiers, 14 à 29 ms ici ; plus lent sous Windows, de l'ordre de la seconde au pire), contre les portes complètes évitées.

## 7. Vérification du lot

`red-proof --draw 2 --seed 37` (2 F2P attendus) ; ancres (0 DERIVE, 0 PERDU) ; R-25 ; `npm run test:main` 0 échec ; `tsc`, `eslint`, `lint:ratchet`, `gate:vocab`, `lang:gate` ; export public entier identique à celui de la base sur un arbre promu (aucun fichier du lot n'est dans la liste blanche : `release-public.mjs` et son `.d.mts` sont hors liste, `test/` à la racine n'est pas exporté).

## 8. Questions (défaut entre parenthèses)

- **Q-RPG-1. Place de la garde dans le pré-vol.** (En dernier, après la visibilité : l'ordre et les tests des refus existants ne bougent pas ; la lecture de `gh` est courte. Variante : juste après la garde de branche, avant `gh` ; les refus d'identité et de visibilité du test de flux passeraient alors après la promotion.)
- **Q-RPG-2. `release_public_flow` n'atteint plus la garde de l'export.** (Accepté : le pré-vol refuse d'abord, et aucune couture ne doit permettre de le contourner. L'autorité de l'export reste prouvée par `site-send-guard.test.ts`, `:517` déclaré et `:521` tiré à la main.)
- **Q-RPG-3. Message.** (Écrit dans `release-public.mjs`, il nomme les deux items et les mêmes commandes ; `export-public.mjs` n'est pas touché. Variante : une fonction de message partagée exportée par `export-public.mjs`, au prix d'un changement du fichier exporté.)
- **Q-RPG-4. RUNBOOK-vitrine (Q-CPA-2, à MONARK).** (La ligne peut dire que, de C2 à T0, `release-public` et son `--dry-run` refusent en quelques secondes au pré-vol, et non plus après les portes complètes.)
