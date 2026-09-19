claude-opus-4-8[1m]

# G1 — Journal de provenance, Lot R-25-séries (ADR-M003 D9 sexies)

- **GATE-0 / R-1** : modèle worker résolu = `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` conforme au roster ADR-M003 D10 / CLAUDE.md 2026-08-14 ; `claude-opus-5` banni, non utilisé). Ligne 1 de ce fichier = cette résolution.
- **Provenance** : worktree `F:\Monark-wt-r25`, branche `lot/r25-series`, base HEAD `58fe309`. Généré le **2026-09-19** (effort max). Worker ne committe pas et ne fait aucun `git` en écriture (R-20) ; ne pousse rien, ne saisit aucun secret. Réviseur G2 = instance séparée `claude-opus-4-8` (à venir) ; G7 + acceptation = orchestrateur `claude-fable-5-1` + validateur.
- **Décision de rattachement** : investisseur 17 du 2026-09-19 (« exception accordée et j'accorde aussi la règle générale »), clôt l'item ADR-M003 D9 quinquies / ADR-U1 D9 Q3 / CHANTIERS §E.
- **Environnement mesuré** : node v24.15.0 ; typescript 6.0.3 (pinné, D9 addendum) ; eslint 10.10.0 + typescript-eslint 8.69.0.

## 0. Livrables

| Livrable | État | Preuve |
|---|---|---|
| 1. Amendement daté ADR-M003 **D9 sexies** (règle générale + conditions a/b/c + `error_origin`) | **FAIT** | §2 |
| 2. `ci.yml` — pathspecs d'exclusion `:(glob)` dans le job `r25` + commentaire | **FAIT** | §3 ; test 38 vert |
| 3. Test root `series_pinned_are_declared_and_hashed` (+ assertion pathspecs câblés) | **FAIT** | §5 ; 3 mutants rouges |
| 4. `PROVENANCE-*.md` manquants pour séries existantes (4 fichiers déclarés) | **FAIT** | §4 |
| Oracle `npm run ci` / lint / ratchet / lang-gate / export:check / typecheck | **FAIT (vert)** | §6 |

## 1. Sources consultées (fichier, niveau)

- **ADR-M003** `docs/adr/ADR-M003-phase2-integration.md` [lu] — D9 (`VIBEGATES_PR_LIMIT=1205`, pathspec S2), D9 quater (G1/G2), **D9 quinquies** (exception PR #56, item général ouvert), D11 (test 38). Garde `pull_request.number == 56` **déjà retirée** du workflow (vérifié : `grep` = 0 occurrence).
- **ADR-U1** `docs/adr/ADR-U1-recorder-book-liquidation.md` [lu] — D9 (fixture réduite `apps/sentinel/test/fixtures/ukemi/` ~150 lignes, « book plein non committé ») ; Q3 (item général, prérequis du G7 U-1a).
- **ADR-B0** `docs/adr/ADR-B0-programme-bell.md` [lu] — D5/D7 (fixtures Bell CSV/fills ; `docs/PROVENANCE-bell.md` prévu HORS dossier fixtures → réserve same-dir, §7).
- **CHANTIERS §E** [lu] — item « Lot R-25 séries (décision 17) », formé 2026-09-17.
- **`ci.yml`, `test/ci-gates.test.ts` (test 38), `test/fixtures-root.test.ts`, `fixtures/PROVENANCE-*.md`, `apps/sentinel/test/sentinel.test.ts`** [lu].

## 2. ADR-M003 D9 sexies (règle générale)

Séries sha-pinnées (déf. stricte : pathspec fermé ; extension `.json/.jsonl/.csv` seulement ; déclarées+hachées same-dir dans un `PROVENANCE-*.md` **ou** `manifest.json`) **exclues du décompte R-25**, sous conditions **(a)** test root de déclaration/hachage (orphelin/sha faux ⇒ rouge), **(b)** code/tests/docs restent comptés (dont `packages/ukemi/test/fixtures/*.json`, entrées de graphe manuelles), **(c)** jamais de code déguisé (`.ts/.mjs/.js` sous racine exclue ⇒ rouge). `manifest.json` accepté comme déclaration ⇒ **aucune duplication** des 9 sha des états `*.gate-decision.json` (source de vérité = manifest, `fixtures_root_valid`). **`error_origin` = planificateur** (item formé le 2026-09-17, ouvert 2 jours).

## 3. Piège git mesuré (le plus haut risque du lot)

Le littéral de la mission `:(exclude)fixtures/**/*.json` est un **no-op silencieux** en mode pathspec par défaut de git (`**` sans sens spécial, `*` traverse `/`) — la série ne chuterait PAS. Mesure rejouable :

```
git ls-files -- 'fixtures/**/*.json'          => 0 fichier   (défaut : ne matche RIEN)
git ls-files -- ':(glob)fixtures/**/*.json'   => 16 fichiers (glob : sommet + nested)
```

Correctif : magie **`:(exclude,glob)`** obligatoire. Vérifié sur bac à sable : `:(glob)fixtures/**/*.json` matche `fixtures/top.json` **et** `fixtures/ukemi/nested.json` (le nested de U-1a) ; l'exclusion garde `fixtures/evil.ts` **compté** (condition c au niveau pathspec). Le job `r25` porte désormais 6 pathspecs (`fixtures/**` + `apps/sentinel/test/fixtures/**`, × {json,jsonl,csv}) ; le test asserte ces 6 chaînes dans `ci.yml`.

## 4. Fichiers exclus — sha256 (LF-normalisé) et déclaration

Racines exclues aujourd'hui : `fixtures/` (16 json) + `apps/sentinel/test/fixtures/` (1 json) = **17 fichiers**, tous déclarés+hachés same-dir. `.jsonl/.csv` : 0 aujourd'hui (le test ne rougit pas à vide).

| fichier | sha256 (LF) | déclaration | statut |
|---|---|---|---|
| `fixtures/01..09-*.gate-decision.json` (9) | = valeurs `manifest.json` | `fixtures/manifest.json` | existant ✓ |
| `fixtures/manifest.json` | `08b2c3edb97a8420956eabe0211fcde04ef0460718784b2fde1c0be6b9269af4` | `PROVENANCE-fixtures-root.md` | **AJOUTÉ** |
| `fixtures/figures-sourced.json` | `15aad757d9f182ef203dd213bc20eaa8d18d03e9f602b61ef2359f162acb693e` | `PROVENANCE-fixtures-root.md` | **AJOUTÉ** |
| `fixtures/usde-calib-series.json` | `7c33027a0e4c6a72e6b390dd95aa2396f1f8c6cdcfee22f8abe729ba8dfc9ef1` | `PROVENANCE-usde.md` | existant ✓ |
| `fixtures/usde-calib-scores.json` | `e44a68b6b697a32f3f198770e740ab206393dc3425e8cc59e4b0e1e4e65cfd28` | `PROVENANCE-usde.md` §5 | **AJOUTÉ** (calibDigest ≠ sha fichier) |
| `fixtures/h5-e2e-trace.json` | `9cf2f8b23b2c17a7358ca3be27b08fd54378978ec74ae1fd1147573f9179e5dd` | `PROVENANCE-h5-e2e-trace.md` | existant ✓ |
| `fixtures/byo-demo-trace.json` | `daf8d3eabacbc601e608d01936d02c0f7ba78dfb5a0d6f5741ecea5fb4eef6d2` | `PROVENANCE-byo-demo.md` | existant ✓ |
| `fixtures/s3-binance.constat.json` | `7aba07cd8eb23ced38fee05195dfa57a9c30b981dae2faa293e977d076a05a25` | `PROVENANCE-s3-binance.md` | existant ✓ |
| `apps/sentinel/test/fixtures/usde-boundary-blocks.json` | `f4e509482fc4d6eee799a89822ad586d8010ff0e3d1a5add1e7033f962cce492` | `apps/sentinel/test/fixtures/PROVENANCE-boundary-blocks.md` | **AJOUTÉ (nouveau fichier)** |

Cross-check (2 voies) : **(i)** les 4 pins existants + les 9 valeurs `manifest.json`, LF-normalisés comme `fixtures_root_valid`, recomputés par le test root `series_pinned_are_declared_and_hashed` (`npm test`) = identiques ; **(ii)** blob **committé @58fe309** (`git show 58fe309:<path> | sha256sum` = octets hachés par la CI Linux) des 4 pins **AJOUTÉS** = identiques (`08b2c3ed…` manifest, `15aad757…` figures, `e44a68b6…` scores, `f4e50948…` boundary-blocks). `packages/ukemi/test/fixtures/*.json` (6 graphes) **hors périmètre** (non exclus, comptés en tests, condition b).

## 5. Mutants (condition a + c) — tous rouges, verts après revert

| # | Mutant | Résultat | Message |
|---|---|---|---|
| 1 | `fixtures/zz-orphan-mutant.json` (sans déclaration) | **ROUGE** (exit 1) | `series file not declared+hashed same-dir: fixtures/zz-orphan-mutant.json …` |
| 2 | 1 hex retourné dans le sha déclaré (`…cce492`→`…cce493`) | **ROUGE** (exit 1) | `series file not declared+hashed same-dir: …/usde-boundary-blocks.json (sha256 LF …cce492)` |
| 3 | `fixtures/zz-mutant-code.ts` (code sous racine exclue) | **ROUGE** (exit 1) | `code file under an R-25-excluded root: fixtures/zz-mutant-code.ts …(D9 sexies c)` |

Mutant 2 = altération côté **déclaration** ; l'altération d'un octet du **fichier** est **équivalente par construction** (même chemin `includes(sha)` : le sha recomputé du fichier n'apparaît alors dans aucune déclaration ⇒ rouge). Après revert : test **vert** (exit 0). `git status` post-mutants = seulement les changements voulus, aucun résidu.

## 6. Oracle (mesuré)

- `npm run typecheck` (tsc --noEmit) : **vert**.
- `npm run lint` (eslint recommended-type-checked) : **vert**.
- `npm run lint:ratchet` : **69/69** (plafond inchangé — le test n'ajoute aucun `any`/unsafe).
- `npm test` : **290/290 pass, 0 fail** (le nouveau test root inclus ; test 38 toujours vert).
- `npm run gate:vocab` : OK (142 fichiers). `npm run export:check` : OK. `npm run lang:gate` : OK (0 hit FR non exempté).

## 7. Compteur R-25 — avant/après

- **Preuve de la règle** (oracle rejouable `git show --shortstat --format= 1f4dbaf`, ins+del SOUS la gate) : F2-B sous l'**ancienne** gate (S2+G1/G2+lockfile) = 19 582+92 = **19 674** ; sous la **nouvelle** gate (+séries) = 1 377+91 = **1 468**. Les deux **reproduisent** D9 quinquies (19 674 ; « hors série » 1 471 ; écart de 3 = la règle générale exclut TOUTES les séries `fixtures/*.json`, pas seulement `usde-calib-series.json` = 18 202 lignes).
- **Le lot lui-même** (base `58fe309`) : tracked **115 insertions + 4 deletions** ; **AVANT == APRÈS** (les nouveaux pathspecs n'excluent rien de ce lot — code/test/docs honnêtement comptés) ; + 2 `PROVENANCE-*.md` non-suivis (36 + 17 lignes) ⇒ total lot ≈ **172 lignes < 300** (et < 1 205). Livrable `docs/G1-lot-r25-series.md` exclu (`docs/G1-lot-*.md`).

## 8. Dettes — zéro dû nu ; items formés avec déclencheur

- **`apps/bell` (ADR-B0)** — n'existe pas encore ⇒ pathspec non ajouté (mission « si existant »). **Item formé** : à l'atterrissage de Bell, ajouter `':(exclude,glob)apps/bell/**/fixtures/**/*.{json,jsonl,csv}'` au job `r25` + un `PROVENANCE-*.md` par dossier de fixtures. **Réserve à trancher par l'ADR de Bell** : ADR-B0 D7 prévoit `docs/PROVENANCE-bell.md` **hors** du dossier des fixtures → non conforme à la règle same-dir ; réconcilier (déclaration dans le dossier, ou étendre la règle à un PROVENANCE d'ancêtre) **avant** le premier lot Bell portant une série.
- **Corrections de registre (à porter par l'ORCHESTRATEUR, R-20 — non éditées ici)** : (i) ADR-U1 D9 §Q3 et CHANTIERS §E citent « D9 quinquies » pour cette règle générale ; la référence exacte est **D9 sexies** (quinquies = l'exception PR #56) — cross-référence imprimée dans D9 sexies. (ii) Miroir `F:\Clawpumptech\ADR-M003-phase2-integration.md` (md5 `12d8e26f` au dernier journal) : l'ADR a changé → re-sync du miroir à faire par l'orchestrateur.
- **U-1a** : la fixture book réduite `apps/sentinel/test/fixtures/ukemi/` (ADR-U1 D9) est couverte par le pathspec sentinel `:(glob)` ; elle devra porter son propre `PROVENANCE-*.md` same-dir (documenté D9 sexies). Prérequis G7 U-1a désormais satisfait côté règle.
- **`error_origin`** de l'item resté ouvert 2 jours = **planificateur** (formé le 2026-09-17, clos le 2026-09-19).
