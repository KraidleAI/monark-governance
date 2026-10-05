# G7 du lot RELEASE-PREFLIGHT-SEND-GUARD-1 : `release-public` refuse dès son pré-vol tant qu'un instantané en attente existe

- **Plan** : `docs/G0-lot-release-preflight-send-guard-1.md`. **Base** : `7ad0f580` (`origin/base/chantier-moteur-2026-10-03`). Branche `recherches/release-preflight-send-guard-1`, aucune PR.
- **Commits** : `8ea013e6` (G0 et tests rouges), **`b0dfd609` gel** (le pré-vol), puis ce G7. Hôte : Linux, Node 24.21.0, sous la charge d'autres sessions (charge moyenne ~60 pendant les vérifications).
- Aucun `git add -A` ; `packages/rpc-guard/bin/rpc-guard.mjs` jamais indexé. `scripts/export-public.mjs` inchangé.

## Ce qui a été fait

| Fichier | Changement |
|---|---|
| `scripts/release-public.mjs` | import de `collectFiles`, `pendingSendBlockers`, `readTextOrNull` depuis `export-public.mjs` ; garde pure exportée `sendGuard(blockers)` (`:51-54`) ; dans `preflight`, en dernier, après la visibilité (`:154-157`) : `sendGuard(pendingSendBlockers(collectFiles(SRC).kept, readTextOrNull))`, refus par `abort` ; commentaires d'en-tête et de `preflight` |
| `scripts/release-public.d.mts` | déclaration de `sendGuard` |
| `test/release-public.test.ts` | `rpg_send_guard_refuses_each_pending_blocker_and_names_it` (neuf, import d'espace de noms) |
| `test/release-public-flow.test.ts` | la boucle des refus devient `refuse(list)` ; la release **et** son `--dry-run` refusent au pré-vol sur l'arbre en attente (journal vide, quatre bloquants nommés, pas de « export failed », miroir intact, rien en scène) ; puis promotion ; « unexpected remote » déplacé après la promotion (il suit le pré-vol) ; tueur déclaré remplacé |

Refus observé au gel (test de flux) :

```
RELEASE ABORTED: RELEASE-PREFLIGHT-SEND-GUARD-1 (SITE-SEND-GUARD-MECH-1): a pending snapshot is in the exported tree: apps/site/data/harness-pending.json, apps/site/data/harness-served.json (pending_since), apps/site/data/ukemi-pending.json, apps/site/data/ukemi-served.json (pending_since); no mirror release before T0. Release from the trunk once promoted at T0 (node scripts/sync-harness-served.mjs, then node scripts/sync-ukemi-served.mjs).
```

## Mesures

- **Avant (base)** : la release et son `--dry-run` passent le pré-vol, tournent les cinq portes locales, puis l'export refuse (« RELEASE ABORTED: export failed »). Portes mesurées sur cet hôte : `npm run ci` 372 s, `lang:gate` 2 s, `lint-ratchet` 99 s, `eslint` 83 s, `export:check` 1 s : **557 s (~9 min 17 s) perdues avant le refus**.
- **Après (gel)** : refus au pré-vol, **aucune porte** (journal vide dans `release_public_flow`), le clone du miroir n'est pas lu. Coût propre de la garde : une marche de l'ensemble gardé, 575 fichiers, **14 à 29 ms**.
- **L'export reste l'autorité, mesuré** : sous le tueur `:157` (garde du pré-vol désactivée), la release passe les cinq portes puis s'arrête toujours à l'export, « RELEASE ABORTED: export failed », le miroir intact (sortie du tir à la main). Les deux gardes sont en série ; aucune couture ne contourne la première.

## Tueurs

| Tueur | Test | Résultat | sha256 avant / après |
|---|---|---|---|
| `scripts/release-public.mjs:52 ROR "blockers.length > 0" -> "blockers.length > 1"` (déclaré) | `rpg_send_guard_…` | **tué** : « refused on apps/site/data/harness-pending.json » | `58aa2a90cafb29c0` / identique |
| `scripts/release-public.mjs:157 CONST "if (!sg.ok)" -> "if (false)"` (déclaré) | `release_public_flow` | **tué** : « a pending snapshot stops the release in its preflight » (les cinq portes passent, puis l'export refuse) | `58aa2a90cafb29c0` / identique |
| `scripts/export-public.mjs:521 SDL "    process.exit(1);" -> ""` (ancien tueur du test de flux, tiré à la main) | `site_send_refused_while_a_pending_snapshot_exists` | **tué** : « --out refuses while the snapshot exists » | `e552c775d9dc4543` / identique |
| `scripts/release-public.mjs:156 CONST "collectFiles(SRC).kept" -> "[]"` (secondaire, à la main) | `release_public_flow` | **tué** : même message | `58aa2a90cafb29c0` / identique |

Chaque tir : modification, le test seul (`--test-name-pattern`), rouge par assertion, restauration, sha256 égal à l'original.

## Oracle et vérifications

| Vérification | Résultat |
|---|---|
| `red-proof --base 7ad0f580 --gel b0dfd609 --repo . --draw 2 --seed 37` | **OK** : 2 jugés, F2P les deux, 7 inchangés ; 2 tueurs tirés, **2 tués** ; `RED-PROOF.json` sha256 `fe5e5546aac901da…` |
| Ancres `verifie-ancres.mjs . --touched 7ad0f580 HEAD` | 2 tueurs, **2 ANCRE, 0 DERIVE, 0 PERDU** |
| R-25 contre `7ad0f580` (au gel) | +66 / −21, **87 lignes**, GREEN (plafond du lot 547 ; de la PR 1205). Estimation du G0 : ~80 |
| `npm run test:main` | second passage : **2572 tests, 2550 verts, 0 échec, 22 sautés** (exit 0). Premier passage : 2 rouges de charge hors du lot (voir « Résidus ») |
| `tsc --noEmit` | vert |
| `eslint .` | vert |
| `lint:ratchet` | 69/69 |
| `gate:vocab` | OK (346 fichiers) |
| `lang:gate` | OK |
| Les deux fichiers de test touchés et leur voisin (`release-public`, `release-public-flow`, `site-send-guard`) | 11/11 verts |
| Export public entier | base et gel, chacun extrait par `git archive`, promu par `dropPendingSnapshot`, `--out` : **identiques** (`diff -r`, 574 fichiers). `release-public.mjs` et son `.d.mts` ne sont **pas** dans la liste blanche ; `test/` à la racine n'est pas exporté |

## Réponses appliquées aux questions du G0 (défauts)

- **Q-RPG-1** : garde en dernier dans le pré-vol, après la visibilité.
- **Q-RPG-2** : `release_public_flow` n'atteint plus la garde de l'export ; l'autorité de l'export reste prouvée par `site-send-guard.test.ts` (`:517` déclaré, `:521` tiré à la main ci-dessus) et par le tir de `:157`.
- **Q-RPG-3** : message écrit dans `release-public.mjs`, `export-public.mjs` intouché.
- **Q-RPG-4** : à MONARK (RUNBOOK-vitrine, Q-CPA-2).

## Résidus (items, options, prix exact)

- **RPG-RUNBOOK-1** (à MONARK, Q-CPA-2 et R-2 du G7 de 3c-4a) : la ligne du RUNBOOK-vitrine qui dit que `release-public --dry-run` est bloqué « après les portes complètes (~15 min) » devient fausse : il refuse désormais au pré-vol, en quelques secondes. Options : (a) MONARK corrige la ligne (une ligne, hors de ce dépôt) ; (b) rien, la ligne pèche seulement par excès de prudence. Défaut : (a). Prix : 1 ligne de RUNBOOK, 0 ligne ici.
- **RPG-SHARED-MESSAGE-1** (optionnel) : un seul texte de refus pour l'export et la release. Options : (a) fonction `pendingSendMessage(blockers)` exportée par `export-public.mjs` et déclarée, lue par les deux ; prix ~12 lignes de code, ~6 de test, et `export-public.mjs` change dans l'export public (le seul fichier exporté touché) ; (b) garder deux textes, chacun épinglé par son test. Défaut : (b), prix 0.
- **RPG-FLOW-PROMOTED-PATH-1** (optionnel) : le test de flux ne prouve plus, par la release elle-même, que l'export refuse un instantané si le pré-vol était contourné. Options : (a) une couture `inject.skipPreflightSendGuard` ; refusée, elle ouvrirait un contournement (Q-CP-4) ; (b) se contenter de `site-send-guard.test.ts` et du tir de `:157` écrit ici. Défaut : (b), prix 0.
- **Rouges de charge hors du lot** : au premier `npm run test:main` du gel, `red_proof_child_stdout_writes_are_synchronous_so_a_forced_exit_drops_nothing` et `red_proof_reads_a_wrong_or_stale_nonce_as_truncated` (`test/red-proof.test.ts`) ont rougi (`inconclusive_truncated`) sous une charge moyenne de ~60 ; seuls, 2 fois sur 2 verts ; aucun lien avec ce lot (ni `red-proof.mjs` ni son test ne bougent). À signaler à l'item de troncature TAP s'il se répète. Prix ici : 0.
