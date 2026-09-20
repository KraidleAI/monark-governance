# CHECKPOINT-2 — lot T-1a-ii-b1 (Bell, jambe Solana) — acceptation du LIVRABLE

Validateur-humain `claude-fable-5-1` (R-1 ; effort high), 2026-09-20. Contexte frais : artefacts seuls, jamais le fil du worker.
Worktree `F:\Monark-wt-bellb1`, branche `lot/t-1a-ii-b1`, HEAD `9c77f0f` (gel `2ac2e25` -> G2 `c5d15a4` -> pli 2 `3b0a92a` -> delta `9c77f0f`), base `96ca634` ; `lot/etude-suite` HEAD `13b8391`.
Chemin de rejeu (AM-2 ter) : `F:/tmp/cp2-bellb1/src` (= `git archive 9c77f0f`), `npm ci --cache F:/tmp/npm-cache` (282 paquets, rc 0), `TMP/TEMP/TMPDIR=F:/tmp`. Aucun RPC live, aucune variable d’environnement imprimée, aucun octet écrit dans un dépôt, aucun `git` d’écriture.

## DÉCISION : ACCEPTE-AVEC-CORRECTIONS (C-V-1..C-V-5, liste fermée)

## 1. Artefacts lus
`docs/G0-lot-t1a-ii-b.md` (+ amendement checkpoint-1 C-1..C-15), `docs/PLI-lot-t1a-ii-b1.md` (+ annexe pli 2, § CONSULTATION FORMÉE), `docs/G2-lot-t1a-ii-b1.md`, `docs/G2-delta-lot-t1a-ii-b1-2.md`, `docs/adr/ADR-T1aii-bell-collecteur-course-fondatrice.md` (D1-bis, D1-ter, Tuyaux -b1 / -b1-bis, PR-B-SPL-TOKEN2022), `docs/adr/ADR-B0-programme-bell.md`, `apps/bell/src/supply.ts`, `apps/bell/src/coverage.ts`, `apps/bell/src/collect.ts`, `apps/bell/scripts/bell-report.mjs`, `apps/bell/test/collect.test.ts` (C-G2-1/3/5), `apps/bell/test/report.test.ts`, `apps/bell/test/fixtures/series/spike/` (PROVENANCE-spike.md, spike-poc-discovery.json, spike-measures.json, spike-findings.json), `test/no-secret-in-repo.test.ts`, `.github/workflows/ci.yml` (l.42, l.64), `F:\Monark\docs\CHANTIERS.md` (décisions 40/44/45/46/47), `F:\Monark\docs\JOURNAL-PROVENANCE.md` (convention), archive hors dépôt `F:\PRODUITS\etude-2026-09-19\bell-b1-spike\` (scripts, raws).

## 2. Preuve d’intégrité du dépôt (AM-2 bis/ter)
`git status --porcelain` vide AVANT et APRÈS ; HEAD `9c77f0f` inchangé ; `git hash-object` identiques avant/après : supply.ts `2e3f40c6`, collect.ts `dd8c8992`, coverage.ts `a35ca727`, bell-report.mjs `c1416b97`, collect.test.ts `0c13b41c`, operators.ts `0d2838aa`. Mutants joués UNIQUEMENT dans `F:/tmp/cp2-bellb1/src`, restaurés par copie depuis `F:/tmp/cp2-bellb1/pristine` (sha256 identiques : supply `e8d2ceb5…`, coverage `c8c1764d…`, collect `032d5c06…`), fichier planté supprimé, suite 49/49 après.

## 3. Chiffres re-mesurés (copie froide, first-hand)
| Oracle | Attendu | Mesuré |
|---|---|---|
| `npx tsx --test apps/bell/test/*.test.ts test/no-secret-in-repo.test.ts` | 49/49 | **49 pass / 0 fail** (19 bell.test + 26 collect.test + 3 report.test + 1 racine) |
| `npm run typecheck` | OK | rc 0 |
| `npm run lint` | rc 0 | rc 0 |
| `npm run lint:ratchet` | 69/69 | **69/69** |
| `npm run lang:gate` | 0 hit bell | bell 0 hit, OK |
| `npm run export:check` | OK | 0 chemin interdit, 0 FR |
| `series_pinned_are_declared_and_hashed` | vert | **1/1 vert** |
| R-25 pathspec `STAT=` ci.yml l.64, `96ca634..9c77f0f` | 983 <= 1 205 | **927 ins + 56 del = 983** ; `13b8391...9c77f0f` (3-points, comme la CI) = **983** identique |
| LF-sha spike (méthode du test) | = pins PROVENANCE | measures `1e733a69…` = pin ; findings `c0164187…` = pin ; poc-discovery `4dc927bb…` = pin |
| sha256 bruts + scripts hors dépôt | = PROVENANCE l.29-33, l.51-52 | 5 scripts + 2 raws **tous identiques** (spike.mjs `0f546c3f…`, probe4.mjs `efe38ecf…`, depth-probe `fdd89433…`, gtfa-sample `80167868…`) |
| effTs (C-G2-2) | échus | 1781755200 = 2026-06-18T04:00Z ; 1786149000 = 2026-08-08T00:30Z ; 1789000200 = 2026-09-10T00:30Z ; tous antérieurs à `generated_at` 2026-09-19T23:53:40Z => **échus** |
| Budget spike | ~90 Helius | measures 38 + findings 52 = **90** |
| Fusion | sans conflit | `git merge-tree --write-tree 13b8391 9c77f0f` = arbre `f4cec2bd…`, aucun conflit ; intersection des fichiers touchés (`96ca634..13b8391` vs `96ca634..9c77f0f`) = **vide** |
| Périmètre | bell + docs + no-secret | `git diff --name-only 96ca634..9c77f0f` hors `apps/bell/`, `docs/`, `test/no-secret-in-repo.test.ts` = **0 fichier** |
| `npm run ci` complet | NON lancé (consigne) | non lancé |

## 4. Mutants (5, copie froide, rouges par construction, restauration sha-identique)
| # | Cible | Mutation | Test unique | Résultat |
|---|---|---|---|---|
| A | C-G2-1 comportemental | `rebaseForMint` mint absent -> `rebaseGate("1","1")` (constant) | `bell_mint_read_failure_abstains_fail_closed` | **ROUGE** (fail 1) |
| B | C-6 gate pur | `rebaseGate` : test `begin !== end` retiré (changement de multiplicateur -> constant) | `bell_rebase_gate_constant_or_abstains` | **ROUGE** (fail 1) |
| C | C-10 | fichier planté `apps/bell/test/fixtures/_cp2probe_c10.txt` (URL core.chainstack.com + 32 hex) | `no_secret_in_repo` | **ROUGE** (fail 1) |
| D | C-G2-5 | `coverageDecision(null)` -> `full-population` (abstention supprimée) | `bell_c5_coverage_projection_over_threshold_top20` | **ROUGE** (fail 1) |
| E | 1b tripwire | `main()` ramené au fail-open (`mint ? rebaseGateFromMint(mint) : undefined`, push conditionnel) | `bell_mint_read_failure_abstains_fail_closed` | **ROUGE** (fail 1) — par la regex SRC seule ; `tsc` rougit aussi mais parce que l’import `rebaseGateFromMint` n’existe plus dans collect.ts (TS2552), pas par comportement |

## 5. Checklist CA (règle par règle)
- **CA-1** conforme : chaque livrable est falsifiable et localisé (tests nommés, mutants, pins sha) ; le lot se reformule en une phrase : « corrections C-6/7/9/10/11/13/15 + spike mesuré + PoC de découverte + abstention `rebase_unverified`, AUCUNE g_t ».
- **CA-2** conforme : la décision de valeur (pools fondateurs découverts, g_t déplacée après -b3 en -b1-bis) est prise par l’investisseur (décision 47, option (a) variante SPLIT, `CHANTIERS.md`) — la consultation formée est **close** ; le lot ne tranche rien de nouveau. Pas d’escalade.
- **CA-3** conforme : ADR-T1aii D1-bis + D1-ter (datés, SPLIT retenu, FUSION écartée par C-2), ADR-B0 amendé ; aucun gate suspendu (`npm run ci` réservé au G7, non contourné).
- **CA-4** conforme : séquence stricte un worker/un worktree (C-2) ; parallélisme borné par fournisseur **non implémenté**, explicitement qualifié « optimisation de DÉBIT » et différé — jamais un fan-out par performance.
- **CA-5** conforme : MAST couverts (fuite de clé : C-10 + scan ; lecture Helius seule : quorum par opérateur C-9 ; close republié : garde digest + garde rapport C-G2-4 + `close_source` ; surclaim : constat sans vert/rouge, `foundingPool:false` mesuré ; terminaison prématurée : Bell absent des registres).
- **CA-6** conforme : oracle d’exécution (49/49 + series_pinned + 5 mutants) ET revue G2 (fraîche, APPROUVÉ-AVEC-CORRECTIONS) ET G2 delta (CONFORME) — les deux présents ; la G2 a attrapé ce que le worker a manqué (C-G2-1 fail-open live prouvé par repro), preuve d’indépendance effective.
- **CA-7** accepté-avec-corrections : zéro dette nue dans le lot (PR-B-SPL-TOKEN2022 formé complet ; C-G2-6 `raw_sha256: null` + item ; C-G2-7 -> -b2b ; -b1-bis avec tuyaux). **Écarts** : les items « Reste » du PLI (`signaturesUntil` amorce `before`, parallélisme borné, crédit/appel `getTransactionsForAddress`) ne sont PAS repris dans D1-ter/Tuyaux -b1-bis (grep ADR = 0 hit) alors que D1-ter supersède le PLI -> C-V-2 ; le test comportemental de `main()` (1b) n’est annoncé nulle part comme item -> C-V-3.
- **CA-8** accepté-avec-corrections : modèles résolus déclarés (worker `claude-opus-4-8[1m]`, G2 et G2 delta `claude-opus-4-8[1m]` instances distinctes, orchestrateur `claude-fable-5-1`) ; `error_origin` renseigné (planificateur : hypothèse D1 « pools existaient 2025 » falsifiée ; rédacteur -b1 : C-G2-1/2/5) ; bruts hors dépôt sha-pinnés et re-vérifiés ; ToS collé. **Nits** : la PROVENANCE ne nomme pas QUI a lu les CGU (G0 C-4 : lecteur Sonnet ; PLI : « transmise ») -> C-V-5 ; l’entrée `JOURNAL-PROVENANCE.md` du lot est due à la fusion (convention orchestrateur) -> C-V-1.
- **CA-9** conforme : tout ré-exécuté par moi à froid (archive + `npm ci`), 5 mutants rejoués moi-même, sha recomputés ; les chiffres de G2 ne sont pas repris, ils sont retrouvés.
- **CA-10** conforme : aucun argument de vitesse ; R-25 983 > cible 700 mais <= plafond, surcoût déclaré (coverage.ts C-5 + tests + garde rapport) ; le seul item « débit » est différé, pas vendu.
- **CA-11** conforme (plus fort qu’upcoming) : `apps/site/lib/fleet.ts` 0 occurrence « bell » ; `README.md` 0 (l.33 = « labelled by what is built », générique) ; `apps/site` 2 hits inspectés = substrings « labelled »/« embellished » ; `skills/` 0 hit ; aucun fichier hors `apps/bell/`, `docs/`, `test/no-secret-in-repo.test.ts` touché ; `docs/MESURE-FONDATRICE-bell-2026-09.md` absent ; aucun `state.json`/`timeline.jsonl`/`provenance.json` Bell dans `git ls-files` ; `coverage.ts` consommé par tests seuls et **déclaré** `upcoming` avec consommateur servi nommé (-b1-bis) dans Tuyaux -b1-bis ; `operators.ts` importé par `collect.ts` et `quorum.ts` (branché dans le collecteur). Tuyaux -b1 et -b1-bis déclarés (entrée/sortie/état/test). Aucune pièce déclarée built.

## 6. Secrets / CGU / décision 47
- Secrets : grep UUID / `chainstack.com/<hex>` / `p2pify.com/` / `api-key=` sur apps/bell + docs du lot = 0 hit hors la fausse clé de test `deadbeef-…` (collect.test.ts:284, testée comme mutant) et la prose d’hygiène ; `no_secret_in_repo` vert + mutant C rouge.
- CGU : bruts hors dépôt (`F:\PRODUITS\…\raws`, 2 fichiers, sha = pins), ToS Helius 2026-04-24 / Chainstack juin 2026 collé en PROVENANCE §ToS ; seules mesures dérivées committées.
- Décision 47 : livre exactement le périmètre SPLIT — aucune g_t fabriquée (0 `gT` fondateur committé ; `foundingPool:false`), abstention nommée `rebase_unverified` câblée fail-closed dans `main()` (`const rebase: RebaseGate = rebaseForMint(mint)`, push inconditionnel), PoC découverte pinnée honnêtement (`raw_sha256: null`, `measure_backed: false`, `founding_vault_full: null`, item C-G2-6 avec déclencheur -b1-bis). Items formés avec déclencheurs : PR-B-SPL-TOKEN2022 (-b3), -b1-bis (après -b3, tuyaux déclarés), -b2b (C-G2-7 budget ETH/Massive), -b3 (trajectoire SetMultiplier, C-G2-8).

## 7. Jugement demandé — mutant 1b (test comportemental de `main()`)
Mesuré : la seule détection d’un retour au fail-open est la regex SRC (+ un TS2552 d’import, incident). Faits qui tranchent : (a) le chemin « lecture mint échouée » est, par le constat G2, le SEUL chemin live capable d’émettre une g_t, et il n’a jamais été exécuté bout en bout sur le code corrigé (smoke live = avant pli 2 ; pli 2 = hors ligne) ; (b) décision 47 place toute course après -b3 en -b1-bis => fenêtre d’exposition nulle d’ici là. **Ruling : item formé, non bloquant maintenant**, mais il doit être FORMÉ (C-V-3), pas un « à faire ». Le typage `rebase: RebaseGate` non optionnel + push inconditionnel est une garde de compilation réelle tant que l’import reste ; elle ne remplace pas un test d’intégration.

## 8. Corrections C-V (liste fermée)
- **C-V-1 (G7, orchestrateur, à la fusion)** : entrée `docs/JOURNAL-PROVENANCE.md` du lot -b1 (gel/G2/delta/checkpoint-2, oracle sur arbre fusionné, R-25 983, `error_origin` par incident : planificateur pour l’hypothèse D1 ; rédacteur -b1 pour C-G2-1/2/5 ; items formés).
- **C-V-2 (G0 -b1-bis, orchestrateur)** : reporter dans ADR-T1aii D1-ter / Tuyaux -b1-bis (ou dans le G0 -b1-bis) les items « Reste » du PLI que D1-ter supersède sans les nommer : amorce `before` de `signaturesUntil` par la signature in-window la plus récente (gTfA), parallélisme borné par fournisseur (conception notée), coût crédit/appel exact de `getTransactionsForAddress` (procurement dashboard Usage) ; chacun avec déclencheur = G0 -b1-bis.
- **C-V-3 (G0 -b1-bis, orchestrateur -> worker)** : item formé — extraire de `main()` le constructeur de `SymbolInput` Solana en fonction injectable (call/providers/pool/mint) et ajouter un test d’intégration hors ligne du chemin « quorum mint échoué => `rebase_unverified`, aucun `gT` » ; + smoke `main()` rejoué sur le code corrigé (mint forcé en échec) AVANT tout lancement de course. Déclencheur : G0 -b1-bis ; propriétaire : orchestrateur.
- **C-V-4 (orchestrateur, prochain toucher de `docs/CHANTIERS.md`)** : aligner la ligne d’ordre de la décision 47 (« -b1 (fusion) -> -b3 -> … ») sur la variante SPLIT retenue par l’ADR (observation G2 delta confirmée, fichier hors périmètre des 12).
- **C-V-5 (doc, pliable au G7 ou à -b1-bis)** : nommer dans `PROVENANCE-spike.md` §ToS l’auteur de la lecture des CGU (lecteur Sonnet épinglé, date) conformément à G0 C-4 ; corriger « 49 tests bell » en « 48 tests bell + 1 racine = 49 » dans Tuyaux -b1 (ADR-T1aii) — chiffre mesuré `grep -c "^test("` 19+26+3.

## 9. AM-1 — ce que la checklist a attrapé
PLI-« Reste » non reporté dans l’ADR qui le supersède (CA-7) ; item 1b non formé (CA-7) ; deux hits `apps/site` à inspecter avant d’écrire « absent du site » (CA-11, inspectés : incidents) ; lecteur des CGU non nommé (CA-8) ; « 49 tests bell » vs 48+1 (CA-8). Manqués à signaler a posteriori par l’orchestrateur, le cas échéant.

## 10. Modèle résolu (R-1)
`claude-fable-5-1` (Fable 5.1, effort high). Biais d’affinité Fable/Fable déclaré, mitigé par contexte frais + checklist fermée + ré-exécution indépendante.
