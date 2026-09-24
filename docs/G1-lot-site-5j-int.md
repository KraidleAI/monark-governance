# G1 : génération tracée, lot SITE-5J-INT (intégration de la vitrine MONARK, apps/site)

- **Générateur** : worker `claude-opus-5-5[1m]`, effort max (contrôle R-1 : préfixe `claude-opus-5-5` déclaré en
  première prise de parole). Rôle : implémenteur d'intégration. Aucun commit, aucun push, aucun workflow (R-20).
- **Worktree livré** : `F:\Monark-wt-s5-int`, branche `lot/site-5j-int`, HEAD = tête de `lot/etude-suite` au moment de
  la livraison (voir « Base »), modifications non commitées (index = HEAD).
- **Spécification** : mission SITE-5J-INT de l'orchestrateur (étapes 1 à 7), critique de complétude
  `F:\tmp\site5j\critic.md` (lue en entier), messages du coordinateur : base `048e4f6` (paragraphe court de l'accueil),
  puis décisions investisseur 172 à 182 (consignées dans CHANTIERS, 2026-09-24 05:35 UTC).
- **Réviseur attendu** : orchestrateur (vérification adversariale R-21), puis G2 séparée.

| Date | PR/commit | Modèle | Effort | Contexte fourni | Générateur | Réviseur | Verdict G2 |
|---|---|---|---|---|---|---|---|
| 2026-09-24 | non commité (worktree `lot/site-5j-int`) | claude-opus-5-5[1m] | max | mission SITE-5J-INT, critic.md, 5 patches de surface, décisions 172-182 | worker d'intégration | orchestrateur | à rendre |

## 1. Base (INT-REBASE-1)

| Heure (UTC) | Opération | Cible | Contrôle |
|---|---|---|---|
| 05:22:50 | `git reset --hard` (branche vide, autorisé) | `4ee966a` (contient `048e4f6`, `fb5b9e1`, `3835269`, `4ee9052`, `1129471`) | arbre propre avant et après |
| 05:52:16 | `git reset --keep` | `421ede3` | l'amont ne touche que `README.md` et `docs/` |
| 06:34:48 | `git reset --keep` | `a8d230b` | l'amont (fusion BELL-CASH-LEG-1, `apps/bell/**`, `test/bell-caddy.ts`, docs) ne recoupe aucun fichier du lot (`comm -12` vide) ; le RUNBOOK-bell garde la phrase qui fonde la décision 181 ; le test `collector_revision` ne dépend pas du dernier commit |
| 06:43:01 | `git reset --keep` | `6ce34d5` | l'amont ne touche que `docs/CHANTIERS.md` (1 ligne) |
| 07:01 | `git reset --keep` | `51dfe55` | l'amont ne touche que `docs/CHANTIERS.md` (1 ligne) ; arbre de code identique à celui de la batterie finale (§7) |

`reset --keep` refuse de lui-même tout fichier modifié localement que l'amont modifierait aussi ; il n'a rien refusé.

## 2. Application des patches et résolution des conflits

Patches (sha256 égaux à ceux du critique) : bell `1ceb1786…c826`, narabi `93ab22bb…b58e`, ukemi `c020522c…ad3c`,
harness `6b51a6f9…a867`, registry `1232e15d…2d82`. Appliqués en 2-way sans toucher l'index, en excluant le manifeste
(composé à la main) et `apps/site/app/bell/page.tsx` (fusion 3-way). Chaque fichier appliqué a été comparé octet pour
octet à son homologue du worktree de surface : seuls diffèrent `bell/page.tsx` (fusion), `app/page.tsx` et
`roadmap/page.tsx` (dérive de HEAD), comme attendu.

| Conflit | Résolution |
|---|---|
| `apps/site/data/manifest.sha256.json` (4 patches) | MANIFEST-UNION-1 : 10 entrées recalculées sur les fichiers finaux (CRLF vers LF, UTF-8), un seul `$comment` sans nom de lot, sans numéro de décision, sans ADR, sans nom de script non exporté (« the source repository's sync tools »). Script rejouable, idempotent. |
| `apps/site/app/bell/page.tsx` (patch bell contre `fb5b9e1`) | `git merge-file` base `f745748`, ours HEAD, theirs = f745748 + hunk bell : 0 conflit, sha `2806befe…` = fusion du critique ; `BellRequestSection` gardé (`:7`, `:753`) et la section `#request-a-symbol`. |
| `apps/site/app/page.tsx` (registry contre `4ee9052`/`048e4f6`) | héros de `048e4f6` gardé tel quel (étiquette « two sides, one engine », h1 « One engine. AI side, DeFi side. », paragraphe terminé sur « The DeFi side is the on-chain applications it powers. ») ; le reste du registry gardé puis réécrit par les points ci-dessous. |
| `apps/site/app/layout.tsx` | aucun patch ne le touche ; meta description de HEAD gardée à l'identique (vérifié) ; seuls 4 commentaires purgés (KITCHEN-PUBLIC-1 b). |
| `apps/site/app/roadmap/page.tsx` (registry contre `3835269`) | phase un « Hikae and Ukemi engines complete; interface frozen. » gardée. |
| `test/site-build-fleet.test.ts` | hunk registry gardé en fin de fichier ; les gardes de ce lot sont ajoutées après lui. À la fusion CodeQL (qui ajoute aussi en fin de fichier) : garder les deux. |
| `scripts/assert-fleet-html.mjs`, `test/ci-gates.test.ts` | non touchés (réécrits par le lot CodeQL) ; les demandes des surfaces deviennent ASSERT-FLEET-SITE5J-1. |

## 3. Points d'écran réalisés

| Item | Réalisation | Preuve (test) |
|---|---|---|
| FLEET-ANCHORED-DIGEST-1 | `fleet.ts` Bell `fn` se termine sur « a signed, hash-chained record » ; `served_by` liste les fichiers servis (dont provenance et copies immuables) | `register_bell_fn_and_narabi_note_say_what_is_served` |
| NARABI-NOTE-BYTE-EXACT-1 | note Narabi : « parsed by the site from the published files (its committed capture keeps each line's endpoint count only) » ; commentaire sans numéro de ligne périmé | idem |
| Accueil `:129`, `:151-152`, `:207` | étiquettes des contrats = titres des schémas gelés ; carte « acts » : premier act construit lu au registre, abstention conditionnée sur l'état servi ; « ships and runs daily » retiré | `home_cards_read_the_register_and_the_served_text` |
| STALE-SNAPSHOT-REFS-1 | `vocab-banned.json` `$comment_providers` réécrit ; `PROVENANCE-narabi-timeline-2026-09-19.md` pointe vers `narabi-capture.json`, sans nom de lot ni ADR (le sha du fixture, lu par le test, est intact) | `narabi_capture_reprojects_committed_sentinel_fixture` vert |
| UKEMI-PANEL-LIVING-PROOF-1 | règle H8 : Ukemi « Living proof » upcoming sans fait servi, la course publiée passe dans « How it is built » (bloc built) ; Narabi « Living proof » built (la timeline est servie), « live » remplacé par « published » | `built_narabi_and_ukemi_panels_follow_h8_and_take_status_from_the_register` |
| `narabi-panel.tsx:35` (R37) | prop `status` passée par /fleet depuis le registre | idem |
| `board.tsx` | « eleven agents » dérivé (`countWord(NODES.length)`) ; statuts adaptateur et BYO = statut du gate ; aparté = statut de l'application ou de l'artefact VISAGE ; phrase finale = `productStatusSentence()` ; teaser Genkan = ligne du registre | `board_statuses_and_counts_read_the_register` |
| BELL-SERVED-HEAD-1 | / et /products lisent `head` (dernière publication), plus `first_record` | `register_pages_read_served_bell_facts_never_typed` |
| BELL-NOCLOSE-CLAUSE-1 | clause « whose gap needs a closing price that its latest publication does not carry » conditionnée sur `head.runs[].sessions[].gT === null` | idem |
| HARNESS-SERVED-SYNC-1 | /roadmap : nombre et noms des outils lus dans `harness-served.json` ; maturité des couches un et trois = statut registre de Hikae ; entrée MCP Registry dite si servie active ; version non affichée (décision 163) | `roadmap_harness_layer_reads_the_served_tools` |
| NARABI-LAG-REGISTRY-1 | l'îlot juge le retard avec `lagView`/`liveWord` contre l'horaire et l'échéance servis (`narabi-served.json`, lus côté serveur) ; mutant « 02:00 » rouge | `narabi_freshness_island_judges_lateness_against_the_served_schedule_and_declares_the_capture` |
| NARABI-ISLAND-CAPTURE-1 | repli déclaré sur la capture (`loadNarabiCapture`, côté serveur : date, dernière fenêtre, pas du tracker) ; retard « unknown » sur une capture | idem |
| SHARED-UKEMI-COPY-1 | `<WhatInside block={insideFor("ukemi")} />` remis ; firebreak et softlanding sans « conformed by the gate » ; commentaire du panneau Ukemi réécrit | `ukemi_inside_points_never_say_interval`, garde du test ukemi (P4) |
| MANIFEST-UNION-1 | voir §2 | `site_renders_only_committed_data (a)` et chargeurs |
| NARABI-CAPTURE-CHECK-1 | voir §6 | journal horodaté |

## 4. Décisions investisseur 172 à 182

| Décision | Réalisation | Garde (rouge si l'ancienne formule revient) |
|---|---|---|
| 172 B_t | `BT_SERVED_RULE` (lib/sim.ts) : « B_t is caller-carried: the caller keeps B_t and sends it with each call, and the gate returns it unchanged » sur /, /token, /how et le plateau ; « MONARK carries B_t… each commit spends it », « spent only by/on commit », « Commit spends it », « B_t is spent », « counter of commits » retirés ; gloses /how alignées sur `l3-gate.ts` (abstention `budget_exhausted` quand le B_t envoyé est sous le plancher de l'appelant) | `owner_decisions_of_2026_09_24_retired_wording_stays_out` (motifs + positif de contrôle) ; mutant M-BT-TOKEN |
| 173 | /how « What the gate commits to » ; règle `guarante` (portée site, sans exemption) ; Hikae panel et commentaires reformulés | `gate:vocab` ; mutant M-GUARANTEE-HOW ; `bell_legal_data_gate_tokens_are_closed` (le tableau des Terms nomme « guarantee » comme mot refusé : c'est sa fonction) |
| 174 | /integrators « The engine, reachable by your agent. » ; /roadmap « The same engine made reachable… » | test 172-182 |
| 175 | carte et phrase ClawHub retirées de /integrators, « skill on ClawHub » de /roadmap ; le MCP Registry reste | test 172-182 ; `harness_pages_render_served_values_never_typed` |
| 176 | Bell `segment` = « tokenized equities, off-hours » ; `connects` = `registerNames(["Hikae", "Shōgen"])` (échoue au build si un agent est renommé) | test 172-182 (mutant en mémoire « Shogun » lève) |
| 177 | /ukemi/course : colonne « bound margin (qhat) » en clair, verdict et points de calibration en clair ; p-values dans un `<details>` « verification » replié, chaque valeur avec la glose exacte « conformal p-value, not a probability of being right » ; le chargeur lie chaque `dec12` à son ratio exact | `site_ukemi_course_view_golden`, `site_ukemi_course_view_words_bound_to_files` (10) |
| 178 | adresse EOA de la règle du zéro (`body.q0_rule_failures.without_crossing[].address`) rendue avec lien `https://etherscan.io/address/<addr>` (chaîne eip155:1 lue dans `apps/sentinel/src/ukemi/clusters.ts:10` ; explorateur choisi sur précédent des docs du dépôt) | test ukemi (9) : seules ces adresses, chacune avec son lien |
| 179 | /fleet « Hikae and Ukemi engines complete; interface frozen. » | `fleet_page_reads_products_and_served_state` |
| 180 | « non-LLM » retiré des quatre notes d'agents ; une occurrence au plus par page | `registry_notes_say_non_llm_once_per_page` ; rendu : /, /products, /fleet, /bell = 1, /roadmap = 0 |
| 181 | /bell/method : « a backup of the private key exists offline; restoring it is an exposure event… » ; rotation « to be published » ; plus d'hébergeur, de fréquence ni de snapshot | `bell_method_states_the_key_backup_principle_only` (fondé sur la phrase du RUNBOOK) |
| 182 | registre Ukemi `line` = « Liquidation coverage, gated. » ; carte accueil : accroche du registre puis « served class · liquidation-eligible-coverage » lu dans `ukemi-served.json` | `home_cards_read_the_register_and_the_served_text` |

Décision 171 (applications) : texte visible du site sans « product » (navigation « Applications », page /products
titrée « Applications », phrase de statut, panneaux) ; la route garde son chemin `/products` (item APPS-ROUTE-1). Garde :
littéraux rendus des pages et composants (contenu des dialogues compris) ; mutant M-PRODUCT-ROADMAP.

## 5. KITCHEN-PUBLIC-1

- **(a) texte rendu** : /roadmap « three sub-agents » remplacé ; Terms rangée dix « (decision 69, internal) » retiré
  (écart 7 de la page, même classe que l'écart 1) ; `$comment` de `bell-legal.json`, du manifeste et des deux JSON
  Narabi (gabarits `COMMENT` des scripts de synchro modifiés à l'identique, vérifié égal) sans lot, décision, ADR ni
  script non exporté.
- **(b) commentaires** : 113 remplacements scriptés exacts dans 45 fichiers d'`apps/site` (dont
  `COMPONENTS-PROVENANCE.md`, `globals.css`, `next.config.mjs`, `package.json`, `public/scene/blocks-hero.html`), chaque
  ancienne chaîne vérifiée unique avant écriture, plus les en-têtes des fichiers réécrits à la main (`lib/fleet.ts`,
  `app/page.tsx`, `app/fleet/page.tsx`, `app/products/page.tsx`, `app/roadmap/page.tsx`, `app/token/page.tsx`,
  `app/integrators/page.tsx`, `app/bell/terms/page.tsx`, `lib/sim.ts`, `lib/fleet-presentation.ts`, panneaux, plateau,
  `noyau-engine.ts`). L'estimation « ~20 » du critique comptait moins de motifs : mesure de départ 191 lignes (liste de
  la mission plus « ruling » et « investor »), 0 à la fin hors exemptions et « ADR » nu.
- **(c) garde** : test `site_names_no_kitchen` (fichier racine non exporté ; lister ces mots dans le `vocab-banned.json`
  exporté les publierait, même raison que C-9). Liste fermée : sub-agent, orchestrator, worker, checkpoint, G0..G7,
  lot <NOM>, decision <n>, identifiant ADR-X, vibecod*, G2 review. Balayage de tout fichier texte exporté d'`apps/site`,
  brut et échappements neutralisés. Pas de motif `validat` (le texte servi « does not validate… » reste vert, contrôle
  négatif). Exemptions fermées, exactes, chacune liée à un item ; exemption devenue inutile = rouge.
- **Mutants réels** (restauration prouvée par sha256) : M-KITCHEN-ROADMAP (« sub-agents » sur /roadmap) rouge ;
  M-SUBAGENT-COMMENT (commentaire de `fleet.ts`) rouge.
- **Limite déclarée** : le mot nu « ADR » dans les phrases de méthode Narabi n'est pas un motif de la garde : 7
  occurrences dans 3 fichiers, 5 dans des phrases rendues (dont `D8_SENTENCE`, épinglé octet pour octet par
  `test/ci-gates.test.ts:377` et par le README ; 4 visibles aujourd'hui sur /narabi) et 2 en commentaire. Il est tenu à
  un compte fermé par fichier (une occurrence nouvelle rougit) en attendant l'arbitrage KITCHEN-ADR-WORD-1.
- **Hors liste fermée, restant** : 34 lignes de commentaires d'`apps/site` portent encore des identifiants internes de
  revue (R<n>, C-<n>, CA-<n>) ; « ruling » et « investor » : 0. Item KITCHEN-LIST-EXTEND-1.
- **Hors périmètre, mesuré** : 1073 lignes à motif cuisine dans 188 fichiers exportés hors `apps/site` (sentinel 246,
  harness 221, scripts 104, packages, `vocab-banned.json` 64 ; README 0). Item KITCHEN-PUBLIC-REPO-1.

## 6. NARABI-CAPTURE-CHECK-1

2026-09-24 06:21:18 UTC, lectures GET seules (aucun POST), sous l'enveloppe A-7 :
- `sync-narabi-capture.mjs --check` : exit 0, « the capture of 2026-09-24 (T=6) is a faithful prefix of what is served
  now (T=6, 7 lines; served timeline sha256 373210f2…) » ;
- `sync-narabi-served.mjs --check` : exit 0, « equals the sources (served openapi sha256 ad437121…) ».
Fichiers inchangés (sha avant et après égaux). Aucune resynchronisation. La capture deviendra périmée vers T=7
(2026-09-25, créneau de 00:30 UTC plus délai aléatoire) : relancer ces deux contrôles avant tout upload postérieur.

## 7. Contrôles sur l'arbre final

Batterie finale, arbre livré (HEAD `6ce34d5`, 107 entrées de `git status`), 2026-09-24 06:44:06 à 06:51:16 UTC, chaque
commande sous l'enveloppe A-7 (8 variables retirées, `TEMP`/`TMP`/`TMPDIR=F:/tmp`, `NEXT_TELEMETRY_DISABLED=1`), codes de
retour capturés (`ctl4/exits.txt` du scratchpad) :

| Contrôle | Code | Résultat |
|---|---|---|
| `npm run typecheck` | 0 | |
| `tsc --noEmit -p apps/site` | 0 | |
| `npm run gate:vocab` | 0 | 267 fichiers, aucune formule interdite |
| `npm run lang:gate` | 0 | 0 occurrence française non exemptée |
| `npm run export:check` | 0 | 0 chemin interdit |
| `npm run lint` | 0 | |
| `npm run lint:ratchet` | 0 | 69/69 (plafond 69) |
| `npm test` (complet) | 0 | 1262 tests, 1260 verts, 0 échec, 2 ignorés par l'environnement (SIGTERM sous Windows ; artefacts bruts absents du dépôt) ; test 42 `export_public_no_governance_no_french` vert (360 s) ; 06:44:48 à 06:50:58 |
| `npm run build -w @monark/site` (Next.js 16.3.4, Turbopack) | 0 | 20 éléments statiques (19 routes et `/icon.svg`) |
| `node scripts/assert-fleet-html.mjs` (version HEAD) | 0 | en-tête et 4 notes servies sur /fleet ; /ukemi sans chiffre, état servi et clause conditionnelle présents |
| `node scripts/export-public.mjs --out F:/tmp/site5j/int-export` | 0 | pas de `.next`, pas de `docs/`, pas de `scripts/sync-*` |

Passages complets précédents, tous verts : base `421ede3` (1253 tests, 1251 verts, 0 échec), base `a8d230b` (1262, 1260
verts, 0 échec ; la fusion BELL-CASH-LEG-1 apporte les 9 tests de plus). La seule différence de code entre ce dernier
passage et l'arbre livré est une ligne de commentaire de `noyau-engine.ts` ; l'amont `a8d230b` vers `6ce34d5` ne
touche que `docs/CHANTIERS.md`. Les fichiers visés par les mutants ont, dans l'arbre livré, les sha256 que le rapport
de mutants enregistre.

**Texte visible** (`render-check.mjs` du scratchpad : corps sans script, noscript, template, style ni commentaire ;
balises remplacées par des espaces, puis entités décodées). Production lue en GET seul à 06:51:14 UTC (hôte
`monarkgate.tech`, 18 routes publiques, 200 sauf la page 404). Diff de phrases production vers union, et balayages de
l'union :

| Page | Ajoutées | Retirées | Cuisine | Fournisseurs | « product » | « non-LLM » |
|---|---|---|---|---|---|---|
| / | 26 | 25 | 0 | 0 | 0 | 1 |
| /bell | 65 | 38 | 0 | 0 | 0 | 1 |
| /bell/method | 35 | 30 | 0 | 0 | 0 | 0 |
| /bell/anchors | 6 | 5 | 0 | 0 | 0 | 0 |
| /bell/terms | 4 | 5 | 0 | 0 | 0 | 0 |
| /bell/privacy | 2 | 3 | 0 | 0 | 0 | 0 |
| /console | 9 | 4 | 1 (faux positif) | 0 | 0 | 0 |
| /fleet | 9 | 7 | 0 | 0 | 0 | 1 |
| /how | 16 | 14 | 0 | 0 | 0 | 0 |
| /integrators | 68 | 22 | 0 | 0 | 0 | 0 |
| /narabi | 88 | 2 | 4 (« ADR » nu, KITCHEN-ADR-WORD-1) | 0 | 0 | 0 |
| /products | 12 | 7 | 0 | 0 | 0 | 1 |
| /roadmap | 12 | 18 | 0 | 0 | 0 | 0 |
| /token | 8 | 10 | 0 | 0 | 0 | 0 |
| /ukemi | 17 | 18 | 0 | 0 | 0 | 0 |
| /ukemi/course | 37 | 10 | 0 | 0 | 0 | 0 |
| /writing | 2 | 3 | 0 | 0 | 0 | 0 |
| 404 | 1 | 2 | 0 | 0 | 0 | 0 |
| erreur globale | non lue (pas de route publique) | | 0 | 0 | 0 | 0 |

- Faux positif /console : « decisions » est un libellé suivi d'une valeur lue (« decisions 4 recorded… ») ; la source ne
  contient aucun « decision <n> ».
- « guarantee » : 1 occurrence visible, sur /bell/terms, dans le tableau « Words we do not use » (le mot refusé
  lui-même). ClawHub : 0 sur toutes les pages.
- Fournisseurs (databento, massive, polygon, helius, chainstack, tenderly, drpc, chainlink, hostinger, pocket, binance,
  cloudfront) : 0 dans le texte visible des 19 pages. Balayage brut du HTML et des 19 chunks statiques référencés : une
  occurrence de `polygon`, qui est le `polygon(…)` CSS (clip-path) de Base UI, déjà déclaré comme faux positif par
  `site-build-fleet.test.ts`.
- Diffs par page : `F:\tmp\site5j\int-text\diff-<page>.txt` ; textes : `union/` et `prod/` ; résumé :
  `summary.json`.

**Mutants réels** (`F:\tmp\site5j\int-mutants.json`, restauration prouvée par sha256 avant et après, empreinte de
`git status` inchangée) : M-KITCHEN-ROADMAP, M-SUBAGENT-COMMENT (`site_names_no_kitchen` rouge), M-PRODUCT-ROADMAP et
M-BT-TOKEN (`owner_decisions_of_2026_09_24_retired_wording_stays_out` rouge), M-GUARANTEE-HOW (`gate:vocab` rouge, exit 1).

## 8. R-25

Mesure avec la pathspec exacte de `.github/workflows/ci.yml:65`, contre la base de fusion avec `lot/etude-suite`
(`6ce34d5` = HEAD), sur un index temporaire (`GIT_INDEX_FILE`) qui contient l'arbre de travail complet, nouveaux fichiers
compris ; l'index réel est resté égal à HEAD.

- Sous la pathspec : 106 fichiers, 10 543 insertions, 1 775 suppressions, soit **12 318 lignes** pour une borne de
  1205 (`VIBEGATES_PR_LIMIT`). Dépassement attendu : R25-SITE5J-1 bloque la PR vers `main`, pas l'upload.
- Tous chemins : 107 fichiers (le présent G1 est exclu par `docs/G1-lot-*.md`).
- Répartition : `apps/site/app` 2521, `apps/site/components` 673, `apps/site/lib` 3289, `apps/site/data` 772, `test`
  4094, `scripts` 901 (mesure sur la base `a8d230b`, avant la ligne de `noyau-engine.ts`).

## 9. Items

Réalisés dans ce lot : INT-REBASE-1, MANIFEST-UNION-1 (absorbe MANIFEST-UKEMI-COMMENT-1 et MANIFEST-BELL-DEADREF),
FLEET-ANCHORED-DIGEST-1, NARABI-NOTE-BYTE-EXACT-1, STALE-SNAPSHOT-REFS-1, UKEMI-PANEL-LIVING-PROOF-1, R37 Narabi,
statuts et comptes du plateau, BELL-SERVED-HEAD-1, BELL-NOCLOSE-CLAUSE-1, HARNESS-SERVED-SYNC-1 (outils et maturité ;
version non affichée), NARABI-LAG-REGISTRY-1, NARABI-ISLAND-CAPTURE-1, SHARED-UKEMI-COPY-1, KITCHEN-PUBLIC-1 (a, b, c),
NARABI-CAPTURE-CHECK-1 (pour cette livraison), décisions 172 à 182, décision 171 sur le texte visible du site. Soldés par
les décisions : HOME-BT-1, TOKEN-BT-1, HOW-BT-1 (172), HOW-GUARANTEE-1 (173), INTEGRATORS-H1-1 (174), CLAWHUB-CMD-1
côté site (175 ; README à la charge de l'orchestrateur), RULING-BELL-SEGMENT-1 (176), VIT-UKEMI-PVAL-1 (177),
VIT-UKEMI-EOA-1 pour l'affichage (178).

Formés ou mis à jour (aucun « dû » nu) :

| Item | Objet | Propriétaire | Déclencheur |
|---|---|---|---|
| ASSERT-FLEET-SITE5J-1 (nouveau) | demandes des surfaces sur `scripts/assert-fleet-html.mjs` : registry (a) /roadmap, (b) /products, (c) accueil, (d) octets bruts des chunks (R04) ; `assertUkemiCourseBody` ; NARABI-PAGE-VERIFY-1 ; plus un balayage du HTML construit pour les motifs cuisine et les noms de fournisseurs (procédé `render-check.mjs` de ce lot) | orchestrateur | après la fusion de CODEQL-ALERTS-1, avant l'upload suivant |
| KITCHEN-ADR-WORD-1 (nouveau) | « ADR » nu dans les phrases de méthode Narabi : méthode ou cuisine ? Si cuisine : réécrire les 5 phrases, l'épingle `D8_SENTENCE` de `ci-gates.test.ts`, le bloc du README et la reconstruction de `narabi-live.test.ts` | orchestrateur (arbitrage) | G7 de site-5j-int ; exécution après la fusion CodeQL |
| KITCHEN-UKEMI-COURSE-1 (nouveau, avec VIT-UKEMI-EOA-1) | `ukemi-course.json` `body.summary[22]` (« applied by the orchestrator, decision 137 ») et `body.h6.sample_note` (« ADR-U4:106-107 ») liés à `body_digest`, non rendus, exemptés exactement dans la garde | lot Ukemi (backend) | prochaine copie du rapport de course (resynchro U-4b-2a) |
| JURISTE-UKEMI-EOA-1 (nouveau) | la Privacy Notice servie ne couvre que le contact mail et les journaux d'accès ; publication de l'adresse on-chain d'un tiers liée à une liquidation (décision 178) : avis juridique, signalé par la revue ukemi | investisseur (juriste) | avant l'upload qui publie l'adresse, ou ruling contraire de l'investisseur |
| HARNESS-DESC-KITCHEN-1 (existant, étendu) | la regex de retrait des jetons de référence internes (`harness-served-load.ts`) existe parce que le texte harness servi en porte ; exemptée exactement dans la garde | lot MCP (décision 163) | resynchro harness du lot MCP |
| TERMS-REDATE-1 (nouveau) | écart 7 des Terms : changement matériel ou non ? S'il l'est : `terms_last_updated_utc` = instant de bascule de l'upload qui le sert d'abord, épingle du test mise à jour | orchestrateur | l'upload qui livre ce lot |
| JURISTE-TERMS-PROVIDER-ROW-1 (existant, étendu) | l'écart 7 touche la même rangée dix ; à valider par le juriste avec elle | investisseur (juriste) | prochaine revue du juriste |
| RUNBOOK-BELL-KEY-181-1 (nouveau) | `docs/RUNBOOK-bell.md` ESC-2 (2) cite encore l'ancienne phrase de /bell/method ; la remplacer par le principe de la décision 181 (le test fonde le principe sur la phrase « WILL be contained » du RUNBOOK) | orchestrateur | prochaine édition du RUNBOOK-bell, au plus tard BELL-SITE-SEQ2-1 |
| PKG-DESCRIPTION-171-1 (nouveau) | description du `package.json` racine (exporté) : « agent-products… 4 agents built, 7 on the roadmap », épinglée par la garde (0) de `ci-gates.test.ts` | orchestrateur | après la fusion CodeQL |
| KITCHEN-PUBLIC-REPO-1 (nouveau) | 1073 lignes à motif cuisine dans 188 fichiers exportés hors `apps/site` (mesure de ce lot) | orchestrateur | avant la prochaine publication du miroir |
| KITCHEN-LIST-EXTEND-1 (nouveau) | étendre ou non la liste fermée (« ruling <id> », identifiants de revue R<n>, C-<n>, CA-<n>, D<n>) ; 34 lignes de commentaires d'`apps/site` concernées | orchestrateur (arbitrage) | G7 de site-5j-int |
| VOCAB-OPERATORS-NARABI-1 (nouveau) | proposition narabi de bannir les hôtes d'opérateurs sur la portée site : non ajoutée (le motif proposé mêle des noms de sources de données, C-9) | orchestrateur | RULING-VOCAB-DATA-SOURCES-1 |
| APPS-ROUTE-1 (nouveau) | la route garde le chemin `/products` sous le libellé « Applications » ; la renommer exige une redirection sur l'hôte servi | orchestrateur | prochaine modification de la configuration Caddy du site |
| DATA-COMMENT-SCRIPT-NAMES-1 (nouveau) | `$comment` de `bell-served.json` (et son gabarit `bell-served-load.ts`) nomme `scripts/sync-bell-served.mjs`, non exporté | lot bell | prochaine synchro bell (BELL-SITE-SEQ2-1) |
| LANDING-ORDER-1 (existant, mis à jour) | BELL-CASH-LEG-1 a atterri avant ce lot (`77153d5`) ; reste CodeQL puis ce lot ; conflit d'ajout en fin de `test/site-build-fleet.test.ts` à résoudre en gardant les deux | orchestrateur | fusion CodeQL |
| R25-SITE5J-1 (existant) | 12 318 lignes (§8) | orchestrateur | PR vers `main` |
| NARABI-CAPTURE-CHECK-1 (récurrent) | relancer les deux `--check` avant tout upload postérieur à T=7 (2026-09-25, créneau de 00:30 UTC) | orchestrateur | chaque upload |
| FIGURES-ORPHAN-1, R04-CLIENT-CHUNK-1, SYNC-CHECK-MODE-1 (existants) | inchangés : manifeste à 10 entrées comme demandé ; le plateau importe toujours le registre côté client (non aggravé : mêmes modules, plus `lib/visage.ts`, données publiques) ; synchros sans `--check` | orchestrateur | inchangés |
| HOW-UKEMI-INTERVAL-1, HOW-GLOSSES-1 (reste : clock_expired, « timed out »), HOW-STATUS-1 (existants) | hors mission ; seules les gloses budget de /how ont bougé (172) | investisseur | inchangés |

## 10. Arbitrages investisseur du critique (§5), repris tels quels

Le critique les listait « à trancher » ; le coordinateur a transmis les décisions 172 à 182 qui les tranchent. Ce
worker ne tranche rien : il les a réalisés tels que transmis (§4).

1. **B_t — c'est la contradiction la plus visible du site.** Sur /, /token et /how, les phrases « MONARK carries B_t… each commit spends it » et « spent only on commit » apparaissent à côté de la nouvelle phrase « B_t is caller-carried… the gate returns it unchanged ». C'est son texte (décision 101 contre 137). (décision 172)
2. Le titre « What is guaranteed » sur /how. (décision 173)
3. « The fleet, reachable by your agent. » et « The same fleet made reachable… » alors que 7 des 11 agents sont « upcoming ». (décision 174)
4. La commande et le handle ClawHub. (décision 175)
5. Les valeurs de segment et de connexion de Bell. (décision 176)
6. Afficher ou non les p-values Ukemi. (décision 177)
7. L'adresse EOA (avec avis juridique). (décision 178)
8. « closed under independent review » sur /fleet contre « complete; interface frozen » sur /roadmap. (décision 179)
9. « non-LLM » passe de 6 à 12 occurrences visibles (/, /products, /roadmap) : simple question, ce n'est pas une infraction. (décision 180)
10. La déclaration sur les sauvegardes de la clé, désormais publique sur /bell/method (ESC-2). (décision 181)
11. « Liquidation-cascade survival » à côté de la classe `liquidation-eligible-coverage` sur /. (décision 182)

## 11. Écarts et limites

- **A-7** : deux appels `node` sont partis sans `env -u` complet, entre 05:23 et 05:29 UTC (avant la création de l'enveloppe, 05:29:07). Le premier affichait les trois `$comment` de manifeste du critique, le second tentait d'analyser `wf-summary.txt`. Aucun ne lisait ni n'affichait une variable d'environnement. Tous les appels suivants passent par une enveloppe vérifiée (présence seule des 8 variables, jamais leur valeur ; `TEMP`/`TMP`/`TMPDIR` sur F:, télémétrie Next coupée). `npm ci` et `npm config get cache` étaient déjà sous `env -u` ; le cache npm est `F:\cache\npm`, rien n'a été écrit sur C:.
- **Exécution interrompue volontairement** : un `npm test` lancé sur la base `421ede3` a été arrêté (arbre de processus de ce worktree seulement) pour rebaser sur `a8d230b`. Ce n'est pas un résultat ; la suite complète a été rejouée sur la base finale (§7).
- **Outillage** : l'outil Bash réduit `\\` à `\` dans les heredocs (mesuré avec `od -c`) ; les scripts contenant des antislashs ont été écrits par l'outil d'écriture de fichier, avec un essai à blanc avant chaque écriture.
- **`node_modules`** : vrai `npm ci --ignore-scripts` (283 paquets, liens workspace vers ce worktree), pas de jonction, puisque Turbopack refuse un lien sortant de la racine (journal de la surface narabi). Il reste en place, ignoré par git, comme dans les worktrees de surface.
- **Choix documentés** : explorateur `etherscan.io` (précédent : liens d'adresse dans les docs du dépôt) ; `registerNames` ajouté au registre pour dériver `connects` ; glose p-value mise en ligne à côté de chaque valeur.
- **Observation** : la glose imposée dit « conformal p-value ». Les valeurs rendues sont les p-values du test exact
  beta-binomial d'échangeabilité (H-3) sur les comptes de couverture conforme. Le terme est celui de la décision 177 ;
  ce worker le signale et ne le modifie pas.
