Modèle résolu : claude-opus-5-5[1m]

# CARTOGRAPHIE DE CLÔTURE — MONARK temps 1 (Narabi + Ukemi ; Bell en temps 2) — HEAD `7b99737` — 2026-09-22

> Worker à contexte frais, LECTURE SEULE du dépôt. Sortie = donnée brute pour l'orchestrateur (R-21 : vérifiée
> adversarialement avant consommation). Aucune écriture dans `F:\Monark` ni `F:\Monark-wt-*` ; aucun appel réseau ; aucun
> commit (R-20). Toute écriture sous `F:\tmp\carto\`. Chaque chiffre ci-dessous est mesuré dans cette session (commande au §8)
> ou cité d'un document du dépôt avec `fichier:ligne` (fait de journal, jamais un chiffre de seconde main).
> Règle appliquée (CLAUDE.md global 2026-09-19 ; ADR-M018 D1-D5) : « une pièce n'est built que si elle est BRANCHÉE ».

## 0. Provenance, portée, méthode

| Élément | Valeur (mesurée) |
|---|---|
| Modèle (R-1) | `claude-opus-5-5[1m]` (préfixe `claude-opus-5-5`, conforme à l'amendement 2026-09-22 du roster ; le gabarit système de ce worker mentionne encore `claude-opus-4-8` — signalé, non interprété) |
| Horloge | `date -u` = `2026-09-22T19:27:35Z` au démarrage ; Node `v24.15.0` ; TypeScript `6.0.3` (devDependency du dépôt, pour l'AST) |
| Arbre mesuré | clone `git clone --no-hardlinks --branch lot/etude-suite F:\Monark F:\tmp\carto\tree` ; HEAD **`7b997370293ee529e192545f62bf21f655eee1bb`** ; `git status --porcelain` = 0 ligne ; `node_modules` par `F:\tmp\g2-garde2bi\mk-nm.ps1` (sortie : `entries: 220 monark: 10 fail: 0`, `@monark/rpc-guard` résolu dans l'arbre cloné) |
| Base de comparaison | baseline `4d2efad` (`docs/CARTOGRAPHIE-TEMPS-1-BASELINE.md`) ; artefacts baseline `F:\tmp\carto-t1\*` : sha256 `carto.mjs 8bc5fd4f…`, `edges.tsv 93997e09…`, `nodes.tsv d84b3c41…` = valeurs M-2 de la baseline ; ré-exécution de `carto.mjs` sur `git archive 4d2efad` ⇒ **mêmes 3 sha, octet pour octet** (baseline reproductible) |
| Outils (tous sous `F:\tmp\carto\`) | `carto.mjs` (outil baseline, copié, sha `8bc5fd4f…` inchangé) ; **`graph.mjs`** (nouveau, AST TypeScript, `fichier:ligne` par site d'import, vérification de chaque citation) ; `replay-narabi.mjs`, `schedule-replay.mjs`, `coverage.mjs`, `attribute.mjs`, `inflight.mjs`, `deploy-lag.mjs`, `oracle-summary.mjs`, `verify-md.mjs` |
| Livrables | `F:\tmp\carto\CARTOGRAPHIE-2026-09-22.md` (ce fichier ; ses 271 références `fichier:ligne` vérifiées par `verify-md.mjs` (plage de lignes + titres de test), 0 échec) ; **`F:\tmp\carto\graph.json`** (sha256 `95c114597b90ddc51412a59a16ab8a7fb71a98a1b55d9fff061d284dc5f0514f`, 428 526 octets ; 353 nœuds, 982 arêtes avec lignes, 26 paires, 15 lignes de registre, 8 mesures embarquées avec leur sha256 ; régénération **déterministe** vérifiée sur l'artefact final : 2 exécutions ⇒ octets identiques) ; `flows.json` (sha256 `df0d608a9aa74d64b10fb0aa45ea8d2c06d1cfd5b0db99f6efa5f317e8c47ef5`, donnée curée, **chaque citation vérifiée** par `graph.mjs` : `curated_citations_failed = 0`) ; `graph.mjs` sha256 `3d73ec9936d13e24de8ce849edfa513369dea4038c60bedda34b293d83001ded` |
| A-7 | chaque script/test sous `env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY` ; aucune valeur d'environnement affichée |
| Dépôt réel pendant la mission | `F:\Monark` a avancé à **`de30eab`** (10 commits) ; `git diff --stat 7b99737 de30eab -- apps packages scripts test deploy schemas fixtures .github` = **vide** (docs/ancres/traces seulement) ⇒ le graphe mesuré vaut aussi pour `de30eab`. En fin de mission (`date -u` `2026-09-22T20:05:08Z`) : `git -C F:/Monark --no-optional-locks status --porcelain` = **0 ligne** (commande sans écriture d'index) ; clone `F:\tmp\carto\tree` : 0 ligne (seul `!! node_modules/` ignoré) — les 921 tests et les 6 gates n'ont rien écrit dans l'arbre suivi. |
| Sécurité de nettoyage | `F:\tmp\carto\tree\node_modules` est une forêt de **jonctions** vers `F:\Monark\node_modules` (mk-nm.ps1) : suppression **uniquement** par `powershell -NoProfile -File F:\tmp\g2-garde2bi\rm-nm.ps1 -Tree F:\tmp\carto\tree`, jamais `Remove-Item -Recurse` / `rm -rf` (règle `TABLEAU-DE-BORD.md:83`) — un nettoyage naïf de ce dossier endommagerait le dépôt réel. |
| Portée temporelle | le plan temps 1 n'est **pas** terminé à HEAD : `docs/TABLEAU-DE-BORD.md:84` liste encore « course U-4b-1b → U-4b-2 → U-5 → U-6 → U-7 → clôture (carto diff, K-1, g3-site, Linux) ». Cette carte est donc l'état HEAD au format de clôture et l'ancre du diff final ; les pièces annoncées par des lots futurs sont marquées `absent (annoncé)` avec leur déclencheur. |

**Barème (repris de la baseline §0, ADR-M018 D1 ; aucune redéfinition).**
- **câblé** = le consommateur est sur un chemin **servi** (outil MCP/HTTP exposé par `apps/harness/src/server.ts`, fichier publié lu par une surface, pièce aval servie réelle) **et** un test d'intégration non-LLM **nommé** rejoue la composition.
- **fixture** = aucun chemin servi. Deux sous-types déclarés : `fixture:test` (seul consommateur = test/fixture/démo) et `fixture:course` (consommateur = script de course/CLI/hors-ligne — barème baseline `CARTOGRAPHIE-TEMPS-1-BASELINE.md:24`). Les deux valent `upcoming` pour tout registre.
- **absent** = tuyau annoncé sans code à HEAD.
- Colonne séparée **déployé** : le processus servi exécute-t-il le code HEAD de la paire ? Mesuré sur objets git + journal du dépôt seulement (pas de réseau) — c'est la dimension qu'un `edges.tsv` ne voit pas.

**Verdict d'ensemble (données, pas verdict G7).**
1. **Dans le code HEAD**, le registre public est concordant : les 4 `built` de `apps/site/lib/fleet.ts` (Shōgen, Hikae, Ukemi, Narabi) ont chacun ≥ 1 chemin servi et ≥ 1 test d'intégration non-LLM nommé qui existe et passe (oracle complet mesuré : **921 tests, 920 pass, 0 fail, 1 skip**, exit 0 ; `gate:vocab`, `lang:gate`, `export:check`, `typecheck`, `lint` exit 0, `lint:ratchet` 69/69). Les pièces Ukemi hors `cascade` (recorder, labeler, prober, discover/select, réducteur/score gelé, `fromRealizedBook`/`ukemi-predict`, AttestedBook) et `@monark/rpc-guard` n'ont **aucun** chemin servi (recorder, labeler, prober, discover/select, réducteur, `rpc-guard` : 0 fichier dans une fermeture servie ; `ukemi-predict.ts`/`adapter-book.ts` sont **chargés** par le processus harness mais jamais invoqués hors tests, §2.3) et **aucune** surface publique ne les dit `built` ⇒ concordant.
2. **Bell** : 0 mention sur toute surface publique, 0 fichier exporté, 0 arête entrante depuis hors Bell, 0 fichier dans une fermeture servie, aucune unité de déploiement ⇒ décision 117 tenue.
3. **Écart majeur, hors du graphe d'imports** : d'après le journal du dépôt, le **processus harness servi** ne porte pas le code HEAD (dernier redémarrage journalisé `1447c05`, 2026-09-18 ; E-5 « `monark-harness` NON redémarré »), alors que des surfaces publiques déployées (page `/ukemi` en ligne depuis `db14e8a`, `wiring` Shōgen rendu sur `/fleet`, skill) décrivent des chemins servis ajoutés après (classe `liquidation-eligible-coverage`, clé `attested`). Non vérifiable sans réseau ⇒ **item formé CARTO-T1C-1** avec la vérification exacte à faire sur place (§7).
4. Second écart hors graphe d'imports : la page `/narabi` lit `deploy/monark-sentinel.timer` **au build** ; `deploy/` n'est pas exporté et la vitrine est construite depuis l'export ⇒ en production la ligne d'horaire tombe sur son repli (mesuré par rejeu, CARTO-T1C-10).
5. Onze items neufs (CARTO-T1C-1..11, §7) ; aucun « dû » nu ; quatre items existants ont atteint leur déclencheur « clôture temps 1 » (K-1, `g3-site` requis, premier run Linux/CI bloquée, dépôt public temporaire).

---

## 1. Inventaire des pièces du temps 1 (+ Bell, + transverses)

État mesuré à HEAD. « Fermeture servie » = modules chargés (imports d'exécution, `import type` exclus) depuis un point d'entrée servi : harness 46 fichiers, sentinelle 32, sonde 1, site 62 (`graph.json → reachability`).

### 1.1 Narabi
| Pièce | Code / entrée | Consommateur mesuré | État | Déployé (preuve) |
|---|---|---|---|---|
| Sentinelle quotidienne | `apps/sentinel/src/run.ts` ← `deploy/monark-sentinel.service:29` (ExecStart) ; écrit `run.ts:241` (append `timeline.jsonl`), `:242` (`state.json`), copie `public/` `:243-244` | Caddy `deploy/Caddyfile.monark-narabi.snippet:11-12` → site `/narabi` + sonde | **câblé** (P-N1) | E-5 `c4981d0` (`docs/JOURNAL-PROVENANCE.md:355`) ; `git diff c4981d0..HEAD` sur run/rpc/timeline/flow/windows + unités = **vide** ; sha `run.ts` HEAD `54619a40…` = sha de production E-5 |
| Timeline publiée | `timeline.jsonl` + `state.json` sous `/var/lib/monark-sentinel/public` | `apps/site/lib/narabi-live.ts:26-27,154` ; `components/narabi/narabi-live.tsx:52,83` (fetch navigateur, instantané committé = repli déclaré) | **câblé** — test `narabi_live_parses_real_state_shape` (`test/narabi-live.test.ts:50`) + rejeu mesuré §2.4 | site `db14e8a` (`docs/CHANTIERS.md:733`) ; `git diff db14e8a..HEAD -- apps/site` = **vide** |
| Horaire de publication affiché | `apps/site/app/narabi/page.tsx:25` lit `deploy/monark-sentinel.timer` **au build** (repli `:32`) | ligne « lag » de `/narabi` (`narabi-live.tsx:105`) | arbre dépôt : câblé ; **build déployé : repli** (P-N6, CARTO-T1C-10) | `deploy/` absent de l'export (`scripts/export-public.mjs:54`), vitrine construite depuis l'export (`docs/RUNBOOK-vitrine.md:9`) |
| Sonde VPS (hôte Bell) | `scripts/probe-narabi.mjs` ← `deploy/monark-probe.service:24` (hôte : `:2` « SECOND VPS (Bell) ») ; lit `DEFAULT_URL` `:31` + `state.json` dérivé `:308` ; écrit `narabi.json` `:465` | alerte SMTP | **câblé** (P-N2) | `c0027cb` (`JOURNAL-PROVENANCE.md:351`) ; `git diff c0027cb..HEAD` (sonde + unités) = **vide** |
| Mail | `sendSmtp` `probe-narabi.mjs:617`, `maybeAlert` `:723` ; secret hors dépôt `deploy/monark-probe.service:23` | boîte de l'investisseur | **câblé** — `probe_state_mismatch_drives_smtp_alert_merged` (`test/probe-narabi.test.ts:710`), `probe_alert_composition_from_fixture` (`:672`) | « premier mail réel délivré » (`JOURNAL-PROVENANCE.md:351`) |
| Pool RPC | `apps/sentinel/src/rpc.ts:19` `PUBLIC_ENDPOINTS` + `:54` `CHAINSTACK_ETH_URL` optionnel, fetch `:125` | `run.ts` (producteur servi) | **câblé** (P-N3) ; jambe payante **hors garde, acceptée** (décision 118, `CHANTIERS.md:550`) | 1er run réel E-5 : 8 endpoints dont pocket, `chainstack true` (`JOURNAL-PROVENANCE.md:357`) |
| Jambe Chainstack gardée (-1d) | `lot/narabi-ops-1d` @ `7daf8e5` : `run.ts:16` → `@monark/rpc-guard`, `keyless-transport.ts` | — | **absent (en vol)** — non fusionné (`CHANTIERS.md:803`) ; 2ᵉ redéploiement seulement après le pli post-course (`CHANTIERS.md:783`) | non (production = `rpc.ts:54`) |
| `fromAttestedFlow` → gate `stable-run-velocity-24h` | `apps/sentinel/src/flow.ts:15` ; calibration USDe consommée par `timeline.ts:16` et le gate | outil MCP `gate` | **câblé** (P-N4) — `gate_stable_run_usde_committed_region_A7b` (`apps/harness/test/gate.test.ts:482`) | classe servie depuis le redéploiement du 2026-09-18 (`JOURNAL-PROVENANCE.md:238`) |

### 1.2 Ukemi
| Pièce | Code / entrée | Consommateur mesuré | État | Remarque |
|---|---|---|---|---|
| Recorder gardé | `apps/sentinel/src/ukemi/record.ts` (CLI) : `:24` importe `openGuardedClient` ; écrit livre `:449`, diag `:480` | `u4b-reduce.mjs --book-raw` (`:31`) | **fixture:course** (P-U6) ; `in_from_src` = **0** (baseline : 3) | tests `ukemi_record_then_unlock_then_reconcile_end_to_end`, `ukemi_record_budget_stop_writes_durable_diag_journal` |
| Labeler `u3-realized.mjs` | keyless (`:310`) ; jambe payante uniquement via `u4-guard.mjs` (import dynamique `:449`), refusée sans `--allow-paid` (`isPaidOperator` `:280`) ; écrit `U3-realized.jsonl` `:680` | `u4b-reduce.mjs --labels` | **fixture:course** (P-U5) | test `u4b_labels_replay_via_main_real_artifact` **SKIP** dans un clone propre (mesuré) |
| Prober `u4-oracle-path.mjs` | `--episode-file` `:90`, lecture + vérif `selection_sha256` `:54` ; via `u4-guard.mjs` `:29` ; écrit brut `:208` | `u4b-reduce.mjs --oracle-raw` | **fixture:course** (P-U7) | la composition sélecteur → prober n'est rejouée par aucun test (CARTO-T1C-5) |
| Discover / select `u4b-*` | `u4b-discover.mjs:128` → brut ; `u4b-select-episode.mjs:190` (lit), `:219/:224` `episode-selection.json`, `:223` events, `:361` `block-ts-extra.json`, `:202` `--block-ts-extra` | select, prober, labeler | **fixture:course** (P-U1..P-U4) | tests `u4b_chain_discover_to_select_far_from_e2` (`apps/sentinel/test/u4b-chain.test.ts:54`), `u4b_chain_e2_adjacent_missing_ts_resolved_by_fill_ts` (`:80`) |
| Réducteur + score gelé + générateur | `u4b-reduce.mjs:85` → `U4b-scores-<tag>.jsonl` ; `scripts/record-u4b-calib.mjs:27` `buildRegistryEntries` | `apps/harness/src/calibration.ts` | **absent (annoncé -2b)** (P-U8) : `hasCommittedCalibrationForClass('liquidation-eligible-coverage') = false` (mesuré à l'exécution) | tuyau déclaré « -1a upcoming, consommé par un test seul » (`docs/adr/ADR-U4b-calibration-episode-frais.md:24`) |
| Classe servie `liquidation-eligible-coverage` (-2a) | `apps/harness/src/tools/gate.ts:77`, lookup `:586` | MCP `gate` + miroir `POST /gate` | **câblé dans le code** (P-U9), effet servi = abstention constante `under_calib` (registre vide) — `u4b_gate_serves_region_from_real_artifact` (`apps/harness/test/gate-liq-artifact.test.ts:44`) | **non déployé** d'après le journal ⇒ CARTO-T1C-1 ; description servie ⇒ CARTO-T1C-2 |
| `fromRealizedBook` / `ukemi-predict` | `packages/monark/src/adapter-book.ts` (export `packages/monark/src/index.ts:43`) ; `apps/harness/src/tools/ukemi-predict.ts:12` « NOT REGISTERED in U-5a », `:22` | tests seulement | **fixture:test** (P-U10) — **NON enregistré** (mesuré) ; module **chargé** par le processus servi via `schema-projection.ts:42` (constantes), jamais invoqué hors tests | option (B), 4 outils (`CHANTIERS.md:760`) ; enregistrement = U-5b |
| Outils MCP du harness | `ALLOWED_TOOL_NAMES` `apps/harness/src/tools/registry.ts:32` ; `HARNESS_TOOLS` `:58` ; `REGISTERED_TOOL_NAMES` `:125` ; enregistrement `server.ts:93` ; routes miroir `http.ts:29` | clients MCP/HTTP | **4 attendus, 4 mesurés** : `REGISTERED_TOOL_NAMES = ["gate","cascade","attest","calibrate"]`, chemins openapi `/gate /cascade /attest /calibrate`, `HARNESS_VERSION 0.4.0` (import à l'exécution) ; ensemble exact épinglé par `mcp_tools_have_no_side_effects` (`apps/harness/test/registry.test.ts:43`, assertion `:57`) | aucune `instructions` MCP : `new McpServer({ name, version })` (`server.ts:92`) — les « instructions » servies = descriptions d'outils (`tools/list`) |
| `cascade` → gate (câblage Ukemi du registre) | `registry.ts:85` `runCascade` → `packages/ukemi` | MCP `gate` (abstient par construction) | **câblé, vacue** (P-U11) — `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:96`) | libellé servi « v0, replaced at U-5 » (`cascade.ts:92`) absent du processus servi (CARTO-T1C-1) |
| AttestedBook (6ᵉ contrat) | `toAttestedBook` `packages/monark/src/adapter-book.ts:232` | **0** consommateur `src` | **fixture:test** (P-U12) — « upcoming until served » (`README.md:117`) **concordant** | libellé « keyless RPC quorum » à réconcilier avant U-6 (CARTO-T1C-4) |

### 1.3 Bell (temps 2 — doit rester `upcoming`)
| Pièce | Code | Consommateur | État |
|---|---|---|---|
| collect / quorum / ledger | `apps/bell/src/collect.ts:807-808` (sorties), `rebase-crosscheck.ts:681` (ledger par mint), `@monark/rpc-guard` (`collect.ts:34`, `quorum.ts:25,35`, `ethereum.ts:21`, `universe.ts:29`, `universe-cli.ts:24`) | `apps/bell/scripts/bell-report.mjs:120` (rapport docs) ; aucun chemin servi | **fixture:course** (P-B1) — tests `bell_course_reaches_fetch_only_via_openGuardedClient` (`apps/bell/test/guard-pli-1b.test.ts:71`), `bell_collect_eth_leg_served_fills_state_through_guard` (`apps/bell/test/guard-pli-1b.test.ts:129`) |
| Ancrage OTS | `F:\course-bell\go1\anchor.sh` **hors dépôt** → `docs/course-bell/*-manifest.txt` + `.ots` + ligne `ANCHORS.md` (ex. `:37` probe_end, `:38` mint_start) | aucun code (procédural, décision 124 option B) ; vérification = item formé « B-code » (`CHANTIERS.md:634`) ; `ots upgrade` = item (`CHANTIERS.md:742`) | **fixture:course / procédural** (P-B2) |
| Sonde VPS | l'hôte Bell ne porte que la sonde **Narabi** (`deploy/monark-probe.service:2`) | — | **absent** côté Bell (P-B3) : aucune unité/timer/Caddyfile Bell dans `deploy/` (7 fichiers, 0 Bell) |

### 1.4 Transverses
| Pièce | Mesure | État |
|---|---|---|
| `@monark/rpc-guard` | `in_from_src` **9** fichiers (baseline 0) : `record.ts:24`, `rpc2.ts:20`, `u4-guard.mjs:26`, `u4b-discover.mjs:28`, Bell ×5 ; **0 fichier du paquet dans une fermeture servie** | **fixture:course** (P-U13/P-U14) ; `bin/rpc-guard.mjs:6` se déclare lui-même « UPCOMING until a served course consumes this exit code » ; `built` interne conditionné par la gate reconcile séparée (décision 129, `CHANTIERS.md:703`) ; 1er consommateur servi = `run.ts` via -1d (§6) |
| `packages/contracts` | 8 src ; dans les fermetures harness et sentinelle | **câblé** via P-N4, P-T1, P-T2, P-U9, P-U11 |
| `packages/hikae` | 14 src ; gate/calibrate (harness) + tracker (`timeline.ts:13,15`) | **câblé** (P-T2) |
| `packages/monark` | `fromShogen` (attest servi), `fromAttestedFlow` (sentinelle servie, `flow.ts:15`), `canonicalStringify` (recorder), `toAttestedBook` (0 src), `fromRealizedBook` (outil non enregistré) | mixte : câblé (Shōgen, Narabi) / fixture (AttestedBook, producteur ŷ) |
| Export public | `collectFiles` : **327** fichiers gardés, 0 violation ; `apps/bell` **0**, `docs` 0, `scripts/census` 0, `deploy` 0 ; `packages/rpc-guard` 26 ; `apps/sentinel/src` 15 ; `ukemi-predict.ts` 1 ; 13 tests exclus dont `gate-liq-artifact.test.ts` et les tests de chaîne u4b ; `export:check` exit 0 | **fixture:course** (P-T3 ; publication = acte orchestrateur) |
| Gates CI | `.github/workflows/ci.yml` : 6 jobs (`:22,34,99,113,126,152`) ; workflow public dérivé : 5 jobs (r25 retiré) ; `g3-site` « Blocking CONDITIONAL » (`:158`) ; rejeu local à HEAD : tous exit 0 | GitHub Actions bloqué (« recent account payments have failed », `CHANTIERS.md:784`) ⇒ les tests d'intégration ne sont **pas** rejoués par la CI en ce moment |

---

## 2. Graphe mesuré

### 2.1 Imports (AST) et comparaison à la baseline
| Mesure | Baseline `4d2efad` | HEAD `7b99737` |
|---|---|---|
| Fichiers de code scannés (règles `carto.mjs`) | 319 | **353** (= `git ls-files` filtré, identité vérifiée par `diff`) |
| Arêtes internes distinctes, `carto.mjs` (regex) | 846 | **969** |
| Arêtes internes distinctes, `graph.mjs` (AST) | 859 | **982** — genres : import 767, import-type 144, export-from 40, export-type 27, dynamic-import 4 |
| Diff d'arêtes (même outil aux deux bouts) | — | **+141 / −18** (carto) = **+141 / −18** (AST) ; nœuds **+35 / −1** (`scripts/census/u4-probe.mjs` supprimé) |
| Imports non littéraux (runtime seulement) | — | 9 (liste dans `graph.json → nonliteral_imports`, ex. `scripts/assert-fleet-html.mjs:243,260` charge `fleet.ts`/`ukemi-copy.ts` au build) |
| Non résolus | 2 (`./globals.css`, `./lint-ratchet.json`) | 2, identiques (sha `unresolved.tsv` égal) |

**Défaut d'outil mesuré (CARTO-T1C-6).** `carto.mjs` retire les commentaires bloc AVANT les commentaires ligne : un `/*` à l'intérieur d'un `//` (ex. `// of scripts-mesure/*.mjs)` à `apps/sentinel/src/ukemi/abi.ts:5`) ouvre un faux bloc qui avale le code jusqu'au prochain `*/`. **13 arêtes manquées, les mêmes à la baseline et à HEAD** — dont `apps/sentinel/src/ukemi/abi.ts:7 → apps/sentinel/src/rpc.ts` (transitif du code gelé U-4b) et `test/probe-narabi.test.ts:19 → scripts/probe-narabi.mjs` (le test d'intégration de la sonde). Le diff de clôture reste valide (angle mort identique aux deux bouts), mais les degrés de la baseline sont sous-comptés.

**Attribution des 159 changements d'arête aux lots fusionnés** (`attribute.mjs` : pickaxe `-S<spécificateur>` sur le fichier source, first-parent `4d2efad..HEAD` ; 0 non attribuée) :

| Lot (commit de fusion) | + | − |
|---|---|---|
| `a380867` GARDE-HELIUS-1b | 21 | 2 |
| `cabe67f` U-4b-1b-2 | 21 | 0 |
| `a050f75` U-5a | 20 | 0 |
| `88b20d2` U-4b-2a | 17 | 0 |
| `5d58a8a` U-4b-1b-0 | 14 | 0 |
| `6a639e8` GARDE-HELIUS-1b-0 | 10 | 0 |
| `985fed9` GARDE-HELIUS-2b-iii | 8 | 8 |
| `5394dfe` GARDE-HELIUS-2b-ii-b+c | 8 | 6 |
| `db14e8a` SITE-RELEASE-1-B | 8 | 0 |
| `ce41619` GARDE-HELIUS-2b-ii-a | 6 | 2 |
| `506db2d` U-4b-1b-1 | 3 | 0 |
| `eb2e716` SITE-RELEASE-1-A | 3 | 0 |
| `4db059e` BELL-RETRY-1 | 2 | 0 |
| total | **141** | **18** |
(`6652ed0` U-4b-SCORE-1, `f6442fe` UKEMI-RETRY-1 et le commit test-seul `fc8514b` ne changent aucune arête.)

### 2.2 Sous-graphes `src → src` (chaque arête avec `fichier:ligne` ; liste complète : `graph.json → import_edges[].lines`)

**Narabi (sentinelle servie)** — `run.ts:13 → rpc.ts`, `run.ts:15 → windows.ts`, `run.ts:16 → flow.ts`, `run.ts:18 → timeline.ts` ; `flow.ts:13 → @monark/contracts`, `flow.ts:15 → @monark/monark`, `flow.ts:16 → rpc.ts`, `flow.ts:17 → windows.ts` ; `timeline.ts:13,15 → @monark/hikae`, `timeline.ts:16 → apps/harness/src/calibration.ts` ; `instrument.ts:14/16/18/20` (CLI séparée, hors fermeture servie). `run.ts` : `in_from_src = 0`, point d'entrée d'exécution (`deploy/monark-sentinel.service:29`).

**Ukemi — recorder et chaîne de course** — `record.ts:20 → ukemi/rpc2.ts`, `record.ts:24 → @monark/rpc-guard`, `record.ts:25 → book.ts`, `record.ts:19 → rpc.ts` (type) ; `rpc2.ts:13 → rpc.ts`, `rpc2.ts:20 → @monark/rpc-guard` ; `abi.ts:7 → rpc.ts` ; `book.ts:12 → @monark/monark` ; `u4-guard.mjs:26 → @monark/rpc-guard` ; `u4-oracle-path.mjs:29 → u4-guard.mjs`, `:26 → rpc2.ts` ; `u4-redraw.mjs:27 → u4-guard.mjs` ; `u4b-discover.mjs:28 → @monark/rpc-guard`, `:29 → u4-guard.mjs`, `:30 → u4b/liquidation-logs.mjs` ; `u4b-select-episode.mjs:28 → u4-guard.mjs`, `:30 → u4b-discover.mjs` ; `u3-realized.mjs:36 → rpc.ts` (`PUBLIC_ENDPOINTS`), `:449 → u4-guard.mjs` (dynamique) ; `u4b-reduce.mjs:20 → u4b-scores.mjs` ; `record-u4b-calib.mjs:13 → @monark/contracts`, `:14 → @monark/hikae`.

**Harness (fermeture servie, 46 fichiers)** — `server.ts:30 → tools/registry.ts`, `:31 → http.ts` ; `registry.ts:26-29 → gate/cascade/attest/calibrate`, `:21-25 → schema-projection.ts` ; `schema-projection.ts:42 → tools/ukemi-predict.ts` (constantes seulement) ; `gate.ts:49 → ukemi-strata.ts`, `:57 → attestation-binding.ts`, `:39 → calibration.ts` ; `cascade.ts:35 → @monark/ukemi` ; `attest.ts:19 → @monark/monark` ; `ukemi-predict.ts:22 → @monark/monark` (`fromRealizedBook`).

**Couplage Bell → sentinelle (Bell consomme, jamais l'inverse)** — `collect.ts:35`, `operators.ts:11`, `quorum.ts:15`, `rebase-crosscheck.ts:30`, `rebase-scan.ts:18` → `rpc.ts` (`providerOf` seul) ; `ethereum.ts:19 → ukemi/rpc2.ts` (`makeUkemiPool`), `ethereum.ts:20 → rpc.ts` (`type RpcCall`). Aucun de ces symboles n'est parmi ceux que -1d supprimera de `rpc.ts` (`chainstackUrl/defaultCall/poolEndpoints/publishedEndpoints/hasChainstack`, `grep` sur `apps/bell/src` = 0) ⇒ pas de ricochet Bell mesuré. Arêtes entrant dans `apps/bell` depuis l'extérieur : **0**.

### 2.3 Accessibilité depuis les points d'exécution (fait mesuré, pas une inférence)
| Point d'entrée | Fichiers chargés | `@monark/rpc-guard` | `apps/bell` | `ukemi-predict.ts` / `adapter-book.ts` |
|---|---|---|---|---|
| SERVI harness (`server.ts`) | 46 | 0 | 0 | chargés (constantes / barrel), non invoqués |
| SERVI sentinelle (`run.ts`) | 32 | 0 | 0 | `adapter-book.ts` chargé via le barrel `@monark/monark` |
| SERVI sonde (`probe-narabi.mjs`) | 1 (built-ins seulement) | 0 | 0 | — |
| SERVI site (`apps/site/app/**`) | 62 | 0 | 0 | — |
| CLI recorder / labeler / prober / discover / select | 33 / 17 / 18 / 19 / 21 | oui | 0 | — |
| CLI Bell (collect, crosscheck, universe…) | 36 | oui | — | — |

### 2.4 Flux à l'exécution — chaque paire producteur → consommateur
(Toutes les citations sont vérifiées mécaniquement par `graph.mjs` ; les tests nommés existent et passent dans l'oracle complet mesuré, sauf `u4b_labels_replay_via_main_real_artifact`, SKIP déclaré en clone propre ; `sentinel-chainstack-guard.test.ts` n'existe que sur la branche -1d.)

| # | Producteur → artefact → consommateur | État | Test d'intégration non-LLM | Déployé |
|---|---|---|---|---|
| P-N1 | `run.ts:241-244` → `public/{timeline.jsonl,state.json}` → Caddy `:11-12` → `/narabi` (`narabi-live.ts:154`, `narabi-live.tsx:52,83`) | **câblé** | `narabi_live_parses_real_state_shape` (`test/narabi-live.test.ts:50`) + **rejeu mesuré** `replay-narabi.mjs` : producteur HEAD (RPC stubé, 0 réseau) → fichiers publiés → parseur du site : pilule « built · step 2 of 7 before first reading » ; clés de ligne et d'état **identiques** à l'instantané committé (34 = 34) | oui (`c4981d0`, `db14e8a`, diffs vides) |
| P-N2 | `/narabi/timeline.jsonl` + `state.json` → `probe-narabi.mjs` → `narabi.json` → SMTP | **câblé** | `probe_state_mismatch_drives_smtp_alert_merged` (`:710`), `probe_alert_composition_from_fixture` (`:672`), `probe_chainstack_present_from_real_producer_line` (`:304`, vrai `run.ts` → sonde) ; rejeu mesuré : sonde sur la sortie du producteur HEAD ⇒ `healthy`, `chain_ok true` | oui (`c0027cb`, diff vide) |
| P-N3 | pool `rpc.ts:19,54,125` → `run.ts` | **câblé** | `pool_rpc_1a_l1_pocket_through_unchanged_anchor`, `sentinel_chainstack_run_publishes_redacted_and_flags` | oui (JOURNAL:357) |
| P-N4 | `flow.ts:15` `fromAttestedFlow` + calibration USDe → `gate` (`registry.ts:68`) | **câblé** | `gate_stable_run_usde_committed_region_A7b` (`gate.test.ts:482`) | oui (JOURNAL:238) |
| P-N5 | `run.ts` → `@monark/rpc-guard` (jambe Chainstack gardée) | **absent (en vol -1d)** | `sentinel-chainstack-guard.test.ts` (sur la branche) | non |
| P-N6 | `deploy/monark-sentinel.timer` → `page.tsx:25` (au build) → ligne d'horaire de `/narabi` | câblé dans l'arbre dépôt ; **repli** dans l'arbre exporté | aucun test n'asserte la ligne rendue ; **rejeu mesuré** `schedule-replay.mjs` (logique `page.tsx:22-34` copiée) : arbre dépôt ⇒ « 00:30 UTC, plus up to a 30-minute randomized delay (monark-sentinel.timer) » ; export (`node scripts/export-public.mjs --out`, 328 fichiers, `deploy/` absent) ⇒ « the daily schedule declared in monark-sentinel.timer » | build de la vitrine = export (`RUNBOOK-vitrine.md:9`) ⇒ **repli en production** (non vu en ligne) |
| P-U1 | `u4b-discover.mjs:128` → brut → select `:190` | fixture:course | `u4b_chain_discover_to_select_far_from_e2` | — |
| P-U2 | select `--fill-ts` → `block-ts-extra.json` (`:361`) → select `--block-ts-extra` (`:202`) | fixture:course | `u4b_chain_e2_adjacent_missing_ts_resolved_by_fill_ts` | — |
| P-U3 | select → `episode-selection.json` (`:219,:224`) → prober `--episode-file` (`u4-oracle-path.mjs:90,54`) | fixture:course | côté prober seulement, fichier **synthétique** (`u4b_oracle_path_composes_real_form_bodies_and_reads_episode_bornes`) ; **aucune composition réelle** ⇒ CARTO-T1C-5 | — |
| P-U4 | select → `events-<id>.json` (`:223`) → labeler `--events` (`u3-realized.mjs:424`) | fixture:course | `u4b_chain_discover_to_select_far_from_e2` (parseArgs réel), `u4b_select_events_compose_with_the_labeler_parseArgs_and_predicate` | — |
| P-U5 | labeler → `U3-realized.jsonl` (`:680`) → `u4b-reduce --labels` | fixture:course | `u4b_labels_replay` ; `u4b_labels_replay_via_main_real_artifact` **SKIP** en clone propre | — |
| P-U6 | recorder `record.ts:449,480` → livre + diag → `u4b-reduce --book-raw` | fixture:course | `ukemi_record_then_unlock_then_reconcile_end_to_end`, `ukemi_record_budget_stop_writes_durable_diag_journal` | — |
| P-U7 | prober `:208` → brut D_e → `u4b-reduce --oracle-raw` | fixture:course | `u4_oracle_path_spends_only_through_guard`, `u4_oracle_path_e2_via_flags_is_deterministic_and_reproduces_the_De_data` | — |
| P-U8 | `u4b-reduce:85` → scores → `record-u4b-calib:27` → `calibration.ts` (entrées liq) | **absent (annoncé -2b)** | générateur : `u4b_registry_recomputes_from_scores_jsonl` | — |
| P-U9 | lignes de score e2 (ŷ règle gelée) → `gate` classe liq (`gate.ts:77,586`) | **câblé (code)**, effet = abstention constante | `u4b_gate_serves_region_from_real_artifact` (`gate-liq-artifact.test.ts:44`, registry.run + miroir HTTP) | **non** (CARTO-T1C-1) |
| P-U10 | `fromRealizedBook` → `ukemi-predict.ts` → gate | fixture:test | `u5_producer_predicts_then_gate_abstains_under_calib` (appel direct, outil non enregistré) | — |
| P-U11 | `packages/ukemi` → `cascade.ts` → gate | **câblé (vacue)** | `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts:96`) | oui (outil servi depuis 2026-09-11 ; libellé v0 non servi) |
| P-U12 | `toAttestedBook` → ∅ | fixture:test | `attested_book_composition` | — |
| P-U13 | ledger `rpc-guard/ledger.ts:136,138` → `reconcile`/`unlock` (`bin/rpc-guard.mjs` → `cli.ts:17`) | fixture:course | `ukemi_record_e2e_paid_ledger_is_reconciled_go_and_hard_no_go`, `u4_oracle_path_ledger_reconciles_through_served_runcli` | — |
| P-U14 | client budgété (`transport.ts:96,106` seul lecteur de clé) → recorder/prober/discover/select/labeler/Bell | fixture:course | `ukemi_record_spends_only_through_guard`, `u3_paid_archive_operator_wired_with_allow_paid` | — |
| P-B1 | Bell collect/crosscheck → sorties/ledgers → `bell-report.mjs` | fixture:course | `bell_course_reaches_fetch_only_via_openGuardedClient`, `bell_collect_eth_leg_served_fills_state_through_guard` | non (aucune unité) |
| P-B2 | têtes de ledger → `anchor.sh` (hors dépôt) → manifestes + `.ots` | fixture:course (procédural) | aucun (décision 124 : option B sans code ; « B-code » formé) | — |
| P-T1 | `attest` → gate via clé `attested` (`registry.ts:68`) | **câblé (code)** | `gate_attested_concordant_files_residual` (`gate.test.ts:761`) | **incertain** : `attestation-binding.ts` ABSENT à `1447c05` (CARTO-T1C-1) |
| P-T2 | hikae → gate/calibrate | **câblé** | `probe_harness_records_real_decision`, `probe_byo_demo_loop_closes`, `gate_stable_run_honesty_text_is_keyed_A2_A7f` | oui |
| P-T3 | `export-public.mjs` → miroir | fixture:course | `export_public_no_governance_no_french` | publication = acte orchestrateur |

---

## 3. Registre public × état mesuré

| # | Surface : revendication | Mesure | Verdict |
|---|---|---|---|
| R-1 | `fleet.ts:123` Shōgen `built`, servi par « MCP attest → gate (the attested envelope key…) » ; note rendue `:127` | câblé dans le code (P-T1) ; déploiement de la couture non prouvé | concordant code / **écart déploiement → CARTO-T1C-1** |
| R-2 | `fleet.ts:138` Hikae `built` (3 jambes) | câblé (P-T2) | concordant |
| R-3 | `fleet.ts:161` Ukemi `built` : « MCP cascade → gate … abstains under_calib by construction » | câblé, vacue (P-U11) | concordant ; la page `/ukemi` décrit l'**autre** jambe (R-9) — deux descriptions publiques d'une même pièce, réconciliation prévue au 2b-5 (`docs/G0-lot-u4b-2.md:71`) |
| R-4 | `fleet.ts:189` Narabi `built` : timeline publiée + `fromAttestedFlow → gate` ; tests `:195-196` | câblé (P-N1, P-N4) ; la jambe sonde/mail (P-N2) est câblée sans être listée | concordant |
| R-5 | `README.md:42` et `:145` : endpoint public 4 outils `attest · gate · cascade · calibrate` | 4 enregistrés, 4 routes (mesuré à l'exécution) | concordant |
| R-6 | `README.md:17,40,117` : AttestedBook « upcoming until served » ; « under a keyless RPC quorum » | 0 consommateur src (P-U12) ⇒ upcoming concordant ; le recorder admet un membre payant gardé `chainstack` (`record.ts:285,291-294`) | concordant / **écart latent → CARTO-T1C-4** |
| R-7 | `skills/monark/SKILL.md:3,9` « Four tools » ; `:58` « The two built-in task_class values » + `:64` une troisième (stable-run) | 4 outils concordant ; la 4ᵉ classe servie (`liquidation-eligible-coverage`) non nommée | retard déclaré (2b-7, `docs/G0-lot-u4b-2.md:73`) — rattaché à CARTO-T1C-3 |
| R-8 | `apps/harness/README.md:14` entrée `{ prediction, params }` ; table `:24-28` : `btc-dir-15m`, `cascade-liquidable-24h`, BYO | entrée mesurée `["prediction","params","attested"]` ; 4 classes + BYO (`gate.ts:756`) | **écart → CARTO-T1C-3** |
| R-9 | `/ukemi` (déployé `db14e8a`) : `apps/site/lib/ukemi-copy.ts:102` « The liquidation-eligible-coverage class is served through the gate. » | vrai dans le code HEAD ; processus harness antérieur à la classe d'après le journal | **écart → CARTO-T1C-1** |
| R-10 | `tools/list` + openapi : `gate.ts:191` interpole `LIQ_UPPER_BOUND_SENTENCE` + `LIQ_H3_SENTENCE` (« calibrated on one recorded episode », `gate.ts:150`) | registre vide (`hasCommittedCalibrationForClass = false`) ; la description ne contient **pas** `LIQ_EMPTY_REGISTRY_SENTENCE` (mesuré à l'exécution) | **écart → CARTO-T1C-2** |
| R-11 | `/narabi` pilule `narabi-live.ts:304` | N lu du `state.json` en ligne (repli instantané déclaré) ; rejeu producteur HEAD → parseur OK | concordant |
| R-12 | Bell dans tout registre public (décision 117, `CHANTIERS.md:541`) | 0 mention (site, README, skill, READMEs), 0 export, 0 fermeture servie, 0 unité | concordant |
| R-13 | `apps/site/app/roadmap/page.tsx:40` « the sixth, AttestedBook, upcoming until served » | P-U12 | concordant |
| R-14 | commentaires de `fleet.ts:140,163` (« h5-e2e-probe.test.ts:83 ») et `:191` (« narabi-live.test.ts:45 ») | lignes réelles `:96` et `:50` (le gel du registre apparie par NOM, vert) | coquille non rendue → CARTO-T1C-8 |
| R-15 | page `/` (`apps/site/app/page.tsx:95-98`) : panneaux Shōgen/Hikae/Narabi `status="built"` **littéral** (`shogen-panel.tsx:33`, `hikae-panel.tsx:33`, `narabi-panel.tsx:35`) ; Ukemi lit le registre (`ukemi-panel.tsx:43`) | les 3 littéraux égalent le registre aujourd'hui ; **aucun test** ne les lie à `FLEET_AGENTS` (0 référence aux 3 fichiers dans `test/` et `apps/site/test/`) ; `fleet.ts:111` dit Narabi « not a bespoke panel » alors que `page.tsx:98` rend `NarabiPanel` | concordant aujourd'hui / dérive latente → CARTO-T1C-11 |

---

## 4. Chemins payants et carte de couverture de la garde CI (CARTO-T1-2 publiée)

Racines de `test/rpc-guard-fetch-only-inside-client.test.ts` à HEAD : `packages/*/src` (allowlist `transport.ts`) ; `apps/bell/src` (allowlist `close.ts`) ; `apps/sentinel/src/ukemi/**` + `rpc.ts` (allowlist `rpc.ts`, déclencheur -1d) ; `scripts/census/u4-*.mjs` (**non récursif**, allowlist vide). Mesure `coverage.mjs` (13 fichiers portent un site réseau ou une lecture de clé) :

| Fichier : lignes | Nature | Racine CI |
|---|---|---|
| `packages/rpc-guard/src/transport.ts:93,96,106` (clés), `:220-221` (fetch) | garde | `packages/*/src` [allowlisté] |
| `apps/bell/src/close.ts:43` (clés Polygon/Databento), `:186,201` (fetch) | Bell cash (temps 2) | `apps/bell/src` [allowlisté] |
| `apps/sentinel/src/rpc.ts:54` (clé Chainstack), `:125` (fetch) | Narabi, **accepté 118** | racine ukemi(+rpc.ts) [allowlisté, déclencheur -1d] |
| `scripts/census/u3-realized.mjs:310` | labeler keyless | **aucune** |
| `scripts/census/aave-liquidations.mjs:122`, `burns-by-burner.mjs:106`, `scripts/usde-full-pull.mjs:63` | census keyless | **aucune** |
| `scripts/probe-narabi.mjs:277,648-649` | GET site public + SMTP | **aucune** |
| `scripts/verify-harness.mjs:22-23,82`, `release-public.mjs:26`, `sbom.mjs:13` | vérif CA / git / npm | **aucune** |
| `apps/harness/src/server.ts:24,164`, `apps/site/components/narabi/narabi-live.tsx:52` | serveur / fetch navigateur même origine | **aucune** |

**Résultat** : toutes les lectures de clé payante du code sont dans une racine et allowlistées (3 fichiers) ; les 10 fichiers hors racine ne lisent **aucune** clé (mesuré : `uncovered_with_key_read = []`). `scripts/census/u4b/*.mjs` n'ont aucun `fetch`/clé direct (ils passent par `u4-guard.mjs`) mais ne sont couverts par aucune racine (la racine u4 n'est pas récursive), pas plus que `u3-realized.mjs` ⇒ **CARTO-T1C-7**.

---

## 5. Oracle de clôture de la baseline (§5) — rejoué
| # | Attendu (baseline) | Mesuré à HEAD | Verdict |
|---|---|---|---|
| S5-a | 2b-ii ajoute `record.ts → rpc-guard` et retire `record.ts:328 env.CHAINSTACK` | arête présente (`record.ts:24`) ; 0 lecture de clé dans `record.ts` | PASS |
| S5-b | 2b-iii ajoute `u4-oracle-path|redraw.mjs → @monark/rpc-guard` et retire `:55/:83` | pas d'arête **directe** : `u4-oracle-path.mjs:29` et `u4-redraw.mjs:27` → `u4-guard.mjs` → `@monark/rpc-guard` (`u4-guard.mjs:26-30`) ; lectures de clé disparues | PASS sur l'intention (transitif) ; libellé littéral de l'oracle non satisfait — à lire comme « via `u4-guard.mjs` » |
| S5-c | `rpc.ts:54 env.CHAINSTACK` reste (118) jusqu'à -1d | présent | PASS |
| S5-d | CARTO-T1-1 résolu | labeler sans lecture de clé ; jambe payante seulement via `u4-guard` (`:449`), refusée sans `--allow-paid` (test `u3_paid_archive_operator_refused_without_allow_paid`) | PASS |
| (T1-3) | ricochet `ethereum.ts → rpc2.ts` : Bell intact | `typecheck` exit 0 à HEAD ; tests Bell dans l'oracle vert ; `ethereum.ts:19` importe `makeUkemiPool` | PASS (item clos par mesure) |

---

## 6. Lots en vol (hors chiffres HEAD) — ce qu'ils changeront au graphe
Condition mesurée : aucun fichier de code modifié sur `lot/etude-suite` depuis leurs bases (`git diff --stat <merge-base> HEAD -- apps packages scripts test deploy schemas fixtures .github` = vide) ⇒ pointe de branche vs HEAD = delta propre du lot.

| Lot | Pointe / base | Delta de graphe (AST) | Effet de branchement |
|---|---|---|---|
| `lot/narabi-ops-1d` | `7daf8e5` / `f6442fe` ; 8 fichiers, +641/−93 | **+11 arêtes, +2 nœuds** : `run.ts:16 → @monark/rpc-guard` (+ type `:17`), `run.ts:15 → keyless-transport.ts`, `keyless-transport.ts:11 → rpc.ts` ; nouveau `apps/sentinel/test/sentinel-chainstack-guard.test.ts` ; `deploy/monark-sentinel.service` +10 lignes (clés `CHAINSTACK_CYCLE_ID`, `CHAINSTACK_ETH_ORIGIN`, ledger sous `/var/lib/monark-sentinel/ledger`) ; racine CI élargie à `apps/sentinel/src/**` (allowlist `rpc.ts` + `keyless-transport.ts`) | **premier consommateur SERVI de `@monark/rpc-guard`** : l'index du paquet entre dans la fermeture servie de la sentinelle (mesuré sur la pointe). Effectif en production seulement au 2ᵉ redéploiement, après le pli post-course §11-1 (`CHANTIERS.md:783`). État à HEAD : pli fait, G2-delta + re-cp-2 reportés après restart (`CHANTIERS.md:803`) — voir l'avancement ci-dessous. |
| `lot/u4b-1b-3` | `801859f` / `b900b4b` ; 3 fichiers, +204/−17 | **0 arête, 0 nœud** | change le flux `--fill-ts` (borné à `to_block`, sidecar reprenable) de P-U2, pas le graphe ; à HEAD, attend le pli C-V-1/C-V-2 (`CHANTIERS.md:798`) — voir l'avancement ci-dessous. |

**Avancement pendant la mission (mesuré sur `F:\Monark` en lecture, fin de mission).** `lot/u4b-1b-3` est passé à **`d2e36ac`** (pli cp-2 C-V-1..C-V-6 + G2 C-G2-1..C-G2-3) : `graph.mjs` sur `git archive d2e36ac` ⇒ **0 arête, 0 nœud** de delta ; le pli ne touche que `u4b-select-episode.{mjs,d.mts}` et son test, et n'ajoute **pas** de test sélecteur → prober (CARTO-T1C-5 reste ouvert). `lot/narabi-ops-1d` reste à `7daf8e5`, non fusionné dans `de30eab` ; ses re-checkpoint-2 (`1be4a34`) et G2-delta (`60b54c0`) sont committés (docs) sur `lot/etude-suite` après le clone.

---

## 7. Écarts → items formés (aucun « dû » nu)

### 7.1 Items NEUFS (préfixe CARTO-T1C ; propriétaire : orchestrateur sauf mention)
| Id | Écart mesuré (preuve) | Forme | Déclencheur |
|---|---|---|---|
| **CARTO-T1C-1** (majeur) | **Processus servi ≠ HEAD.** Surfaces publiques décrivant des chemins servis ajoutés après le dernier redémarrage journalisé du harness : `/ukemi` en ligne (`ukemi-copy.ts:102`), note Shōgen de `/fleet` (`fleet.ts:127`), intake `attested` de la skill (`SKILL.md:41`). Preuves : dernier redémarrage harness `1447c05` (`JOURNAL-PROVENANCE.md:245`) ; E-5 « `monark-harness` NON redémarré » (`:355`) ; release par le script **vitrine** (`CHANTIERS.md:733` : `/opt/monark-redeploy.sh` ; ce script = systemd `monark`, la vitrine, `JOURNAL-PROVENANCE.md:197` ; unité vitrine `RUNBOOK-vitrine.md:3`) ; `gate.ts` : 0 mention de la classe à `1447c05` et à `c4981d0` (arbre disque), 5 à `88b20d2`/HEAD ; `attestation-binding.ts` ABSENT à `1447c05` ; fermeture harness `1447c05..HEAD` : 22 fichiers +1695/−164, `c4981d0..HEAD` : 10 fichiers +887/−10. **Non vérifié en ligne** (mission sans réseau). | item formé (mesure sur place puis redéploiement) | **avant de prononcer la clôture du temps 1 et avant toute nouvelle phrase publique sur la classe** : (1) lecture sur place `GET https://api.monarkgate.tech/openapi.json` (la description de `gate` contient-elle `liquidation-eligible-coverage` ? le schéma d'entrée a-t-il `attested` ?) ; (2) SSH lecture seule `systemctl show monark-harness -p ExecMainStartTimestamp` et `sha256sum /opt/monark-harness/apps/harness/src/tools/gate.ts` à comparer à `1447c05 8a1a10e7…`, `c4981d0 c19a960b…`, HEAD `17247201…` ; (3) si retard confirmé : redéploiement harness à un SHA **nommé** ≥ `88b20d2` via `/opt/monark-harness-redeploy.sh` (`RUNBOOK-harness.md:217`) + CA (`scripts/verify-harness.mjs`) + entrée JOURNAL — **ordonné après CARTO-T1C-2** (sinon le redéploiement publie la description de R-10) ; le go (décision 130 vs portée 119) est à trancher par l'orchestrateur. |
| **CARTO-T1C-2** | **Description servie de `gate` (tools/list, openapi) : sur-revendication de la classe liq sur registre vide.** `gate.ts:191` interpole `LIQ_UPPER_BOUND_SENTENCE` et `LIQ_H3_SENTENCE` (« calibrated on one recorded episode », `:150`) ; `hasCommittedCalibrationForClass(...) = false` ; `LIQ_EMPTY_REGISTRY_SENTENCE` absente de la description (mesures à l'exécution). Le checkpoint-1 U-4b-2 exigeait : « la description ne contient aucune phrase de couverture » (`docs/CHECKPOINT1-lot-u4b-2.md:98`) ; le plan 2a-3 réservait la phrase « upper bound » au registre non vide -2b (`docs/G0-lot-u4b-2.md:55`). Le texte **a été relu** : le checkpoint-2 -2a a grep-contrôlé la tranche de description (648 caractères : 0 « interval », 0 jeton de probabilité, `docs/CHECKPOINT2-lot-u4b-2a.md:27`) et l'a acceptée — critère **différent** de celui du cp-1 C-1 (temps du verbe / état du registre) ; le test `gate-liq.test.ts:185` épingle d'ailleurs la présence de la phrase dans la description. | correction de registre (texte servi : description = phrase registre-vide jusqu'à -2b), **ou** ruling orchestrateur documenté si la lecture conditionnelle « for the calibrated class » est jugée suffisante | au plus tard avec le redéploiement de CARTO-T1C-1, sinon U-4b-2b |
| **CARTO-T1C-3** | `apps/harness/README.md` (surface exportée) en retard : entrée `{ prediction, params }` (`:14`), table `:24-28` sans `stable-run-velocity-24h` (servie depuis 2026-09-18), sans `liquidation-eligible-coverage`, sans clé `attested` (mesuré : `["prediction","params","attested"]`). 2b-7 (`G0-lot-u4b-2.md:73`) ne couvre que la classe liq. | correction de registre (élargir 2b-7 à stable-run + `attested`) | U-4b-2b (même fusion que 2b-7, décision 127) |
| **CARTO-T1C-4** (latent) | AttestedBook dit « keyless RPC quorum » (`schemas/attested-book.schema.json:5`, `README.md:117`, `adapter-book.ts:30`) alors que le recorder HEAD admet un membre payant gardé `chainstack` dans son quorum (`record.ts:285,291-294`). Non servi aujourd'hui (0 consommateur de `toAttestedBook`). | item formé (choix au G0 U-6 : course du livre servi sans `chainstack`, ou résidu/libellé amendé — schéma gelé et signé ⇒ signature investisseur) | G0 de U-6 (service d'AttestedBook) |
| **CARTO-T1C-5** | Composition **sélecteur → `episode-selection.json` → prober** non rejouée : le test du prober écrit un fichier synthétique (`writeEpisode`), aucun test n'importe à la fois `u4b-select-episode.mjs` et `u4-oracle-path.mjs` (grep = 0). Paire de course, non servie. | item formé : test `u4b_chain_select_to_oracle_path` (`runSelect` → `run()` du prober, fetch stubé) | G7 de U-4b-1b-3 (lot qui touche le sélecteur) ou avant l'étape prober de la course, au premier des deux |
| **CARTO-T1C-6** | Outil baseline `carto.mjs` : 13 arêtes manquées (commentaire `/*` dans un `//`), dont `abi.ts:7 → rpc.ts` et `test/probe-narabi.test.ts:19 → probe-narabi.mjs` ; diff de clôture non affecté (angle mort identique). | item formé (outillage) : `graph.mjs` (AST, `fichier:ligne`) comme outil de cartographie, ou correction de `carto.mjs` | prochaine cartographie (diff final de clôture) |
| **CARTO-T1C-7** | Couverture grep CI : `scripts/census/u4b/*.mjs` et `scripts/census/u3-realized.mjs` (chemin de course, jambe payante via garde) hors de toute racine (racine u4 non récursive) ; aujourd'hui 0 lecture de clé hors racine. | item formé : étendre la racine u4 à `scripts/census/**/*.mjs` (+ entrée d'allowlist keyless nommée pour `u3-realized.mjs:310`), ou non-extension motivée par écrit | prochain lot touchant `test/rpc-guard-fetch-only-inside-client.test.ts` après NARABI-OPS-1d (ou son pli, si l'orchestrateur le décide) |
| **CARTO-T1C-8** | Commentaires non rendus périmés de `fleet.ts` : références de ligne `:140,163,191` (tests réels à `h5-e2e-probe.test.ts:96`, `narabi-live.test.ts:50`) ; `:111` « Narabi … not a bespoke panel » alors que `NarabiPanel` est rendu (`apps/site/app/page.tsx:98`). | correction de registre (commentaires) | 2b-5 (réécriture du `wiring` Ukemi de `fleet.ts`) |
| **CARTO-T1C-9** (hors graphe) | Horodatages du registre en avance sur les commits : `CHANTIERS.md:805` « (19:1x UTC) » pour `a41331b` commité `18:58:50Z` ; `:811` « Post-restart (19:5x UTC) » pour `a872716` commité `19:02:53Z` (et `date -u` = `19:27:35Z` au démarrage de ce worker). Récidive de la classe consignée `CHANTIERS.md:616` ; cause plausible : heure locale (+01:00, portée par les commits) étiquetée UTC ; les SHA font foi. | correction de registre (heures) | prochaine édition de `CHANTIERS.md` |
| **CARTO-T1C-10** | **Fichier lu par une surface, absent du build déployé.** `/narabi` lit `deploy/monark-sentinel.timer` au build (`apps/site/app/narabi/page.tsx:25`, repli `:32`) ; `deploy/` n'est ni dans `WHITELIST_DIRS` (`scripts/export-public.mjs:54`) ni dans les 327 fichiers gardés ; la vitrine est construite depuis l'export (`docs/RUNBOOK-vitrine.md:9`). Rejeu mesuré : arbre dépôt ⇒ « 00:30 UTC, plus up to a 30-minute randomized delay (monark-sentinel.timer) », export ⇒ « the daily schedule declared in monark-sentinel.timer ». Aucun test n'asserte la ligne rendue. Non vu en ligne. | correction (au choix de l'orchestrateur) : entrée d'export pour `deploy/monark-sentinel.timer`, ou constante committée dans `apps/site/lib` liée au timer par un test ; + assertion de la ligne rendue dans `assert-fleet-html.mjs` | prochain lot `apps/site` (relecture conjointe du site temps 1) ; lecture sur place de `/narabi` pour confirmer le repli |
| **CARTO-T1C-11** | Page `/` : trois panneaux (Shōgen, Hikae, Narabi) portent `status="built"` en **littéral** (`shogen-panel.tsx:33`, `hikae-panel.tsx:33`, `narabi-panel.tsx:35`), non liés au registre, sans test de liaison ; seul `ukemi-panel.tsx:43` lit `FLEET_AGENTS`. Concordant aujourd'hui ; une bascule du registre ne se propagerait pas à 3 panneaux sur 4. | item formé : lier les 3 panneaux au registre (motif `ukemi-panel.tsx:25`) ou garde-test « littéral == registre » | prochain lot `apps/site` |

### 7.2 Items EXISTANTS dont le déclencheur est « clôture temps 1 » (rappel, non re-formés)
- **K-1** (`CHANTIERS.md:84`, `TABLEAU-DE-BORD.md:61`) : toujours ouvert — `apps/sentinel/src/flow.ts:52` porte `key: "deadbeef"` dans l'attestor servi par Narabi.
- **`g3-site` en required check** (`TABLEAU-DE-BORD.md:55`) et **premier run Linux + required check** (`:60`) : non mesurables aujourd'hui, GitHub Actions bloqué par la facturation (`CHANTIERS.md:784`, non contourné).
- **Dépôt rendu public temporairement** (`CHANTIERS.md:784,808`, CI relancée sur la PR brouillon #88) : non mesuré ici (pas de réseau) ; si c'est le dépôt de travail, `apps/bell/**` et `docs/**` (hors export) y sont lisibles pendant la fenêtre — aucun registre ne dit Bell `built`, décision 117 non contredite ; item « repasser privé » déjà formé.

### 7.3 Items EXISTANTS rappelés (état mesuré à HEAD)
- NARABI-OPS-1d (§6) ; U-4b-1b-3 (§6) ; U-4b-2b (P-U8, 2b-5, 2b-7) ; U-5b (enregistrement `ukemi-predict`, retrait `cascade`, **A-9-OUTILLE** `CHANTIERS.md:766`, relevé des appels `cascade` `CHANTIERS.md:627` (iii)) ; U-6 (AttestedBook servi) ; décision 129 (reconcile, `built` interne du paquet) ; Bell B-code et `ots upgrade` (`CHANTIERS.md:634,742`) ; P1 E10 (instantané Narabi) : **forme** toujours actuelle (rejeu §2.4), seules les valeurs vieillissent.
- CARTO-T1-1 et CARTO-T1-3 : **clos par mesure** (§5) ; CARTO-T1-2 : **publié** (§4) et prolongé en CARTO-T1C-7.

---

## 8. Commandes rejouables (toutes sous `F:\tmp\carto\`, env A-7)
```
E="env -u HELIUS_API_KEY -u CHAINSTACK_ETH_URL -u CHAINSTACK_SOLANA_URL -u CHAINSTACK_BASE_URL -u CHAINSTACK_BSC_URL -u CHAINSTACK_ROBINHOOD_URL -u POLYGON_API_KEY -u DATABENTO_API_KEY"
git clone --no-hardlinks --branch lot/etude-suite F:\Monark F:\tmp\carto\tree          # HEAD 7b997370293ee529e192545f62bf21f655eee1bb
powershell -NoProfile -File F:\tmp\g2-garde2bi\mk-nm.ps1 -Tree F:\tmp\carto\tree
node carto.mjs F:/tmp/carto/tree F:/tmp/carto/carto-out                                # 353 files, 969 edges (outil baseline)
git -C tree archive 4d2efad | tar -x -C base-tree && node carto.mjs F:/tmp/carto/base-tree carto-base-rerun   # sha == baseline M-2
$E node graph.mjs F:/tmp/carto/tree F:/tmp/carto/_run2 --head 7b997370293ee529e192545f62bf21f655eee1bb --carto carto-out/edges.tsv \
   --baseline F:/tmp/carto-t1/edges.tsv --baseline-nodes F:/tmp/carto-t1/nodes.tsv   # passe 1 (sans --flows/--embed) : entrée de attribute/inflight/deploy-lag
git -C tree archive origin/lot/narabi-ops-1d | tar -x -C inflight/narabi-ops-1d        # idem u4b-1b-3 ; puis, par lot :
node graph.mjs F:/tmp/carto/inflight/<lot> F:/tmp/carto/_inflight-<lot> --head <tip> --ts-from F:/tmp/carto/tree
node attribute.mjs F:/tmp/carto/tree _run2/graph.json > attribution.json               # 141/18 attribués, 0 non attribué
node coverage.mjs F:/tmp/carto/tree > coverage.out.json                                 # carte §4
$E node replay-narabi.mjs F:/tmp/carto/tree F:/tmp/carto/os-tmp/replay-narabi > replay-narabi.out.json   # producteur -> site + sonde
node inflight.mjs                                                                       # §6 (lit _run2 + _inflight-*)
node deploy-lag.mjs                                                                     # §1, CARTO-T1C-1 (objets git seulement)
cd tree && $E node scripts/export-public.mjs --out F:/tmp/carto/export-out && cd ..      # 328 fichiers, deploy/ absent
node schedule-replay.mjs F:/tmp/carto/tree F:/tmp/carto/export-out                       # CARTO-T1C-10
node oracle-summary.mjs                                                                 # après le run de tests ci-dessous (lit test-full.tap)
$E node graph.mjs F:/tmp/carto/tree F:/tmp/carto --head 7b997370293ee529e192545f62bf21f655eee1bb \
   --carto carto-out/edges.tsv --baseline F:/tmp/carto-t1/edges.tsv --baseline-nodes F:/tmp/carto-t1/nodes.tsv \
   --flows flows.json --embed attribution=attribution.json --embed coverage=coverage.out.json \
   --embed replay_narabi=replay-narabi.out.json --embed oracle=oracle-summary.json --embed inflight=inflight.json \
   --embed inflight_advanced=inflight-advanced.json --embed deploy_lag=deploy-lag.json \
   --embed schedule_replay=schedule-replay.out.json                                    # passe 2, après les mesures embarquées -> graph.json (exit 1 si une citation échoue)
node verify-md.mjs F:/tmp/carto/tree CARTOGRAPHIE-2026-09-22.md                          # toutes les refs fichier:ligne du rapport (plage + titres de test)
git -C F:/Monark --no-optional-locks status --porcelain | wc -l                          # 0 (aucune écriture dans le dépôt réel)
git -C F:/Monark archive d2e36ac | tar -x -C inflight/u4b-1b-3-d2e36ac && node graph.mjs F:/tmp/carto/inflight/u4b-1b-3-d2e36ac F:/tmp/carto/_inflight-u4b-1b-3-d2e36ac --head d2e36ac --ts-from F:/tmp/carto/tree   # branche avancée : 0 arête de delta
cd tree && $E TEMP=F:\tmp\carto\os-tmp node --test --test-timeout=120000 --test-force-exit --test-reporter=tap \
   "test/*.test.ts" "packages/*/test/*.test.ts" "apps/harness/test/*.test.ts" "apps/sentinel/test/*.test.ts" "apps/bell/test/*.test.ts"
   # 921 / 920 pass / 0 fail / 1 skip, exit 0 (tap sha 59bcdabb…)
cd tree && for s in gate:vocab lang:gate export:check typecheck lint lint:ratchet; do $E npm run --silent $s; done   # tous exit 0
```
Mesures d'exécution ponctuelles (outils MCP, description `gate`, registre liq) : `node --input-type=module -e` sur `apps/harness/src/tools/registry.ts`, `openapi.ts`, `calibration.ts` (sortie citée §1.2 et R-10).

## 9. Limites déclarées
- **Aucune mesure en ligne** (mission sans réseau) : l'état réel des processus servis (harness, sentinelle, sonde, site) n'est établi que par le journal du dépôt et les objets git ; CARTO-T1C-1 porte la vérification sur place.
- La fermeture servie est **statique** (imports d'exécution) : un chargement dynamique par chemin calculé (9 cas listés) n'y est pas suivi ; aucun ne relie un module Ukemi/Bell à un point d'entrée servi (inspection des 9 cas : tests, `s2-report.mjs`, `assert-fleet-html.mjs`).
- Les tests nommés sont vérifiés par **existence** (titre dans le fichier) et par l'**oracle complet vert** ; leur pouvoir de détection (mutants) n'est pas ré-établi ici (il l'a été aux G2/checkpoints des lots cités).
- Le « skip » `u4b_labels_replay_via_main_real_artifact` est structurel dans un clone propre (artefacts e2 hors dépôt) : la preuve « labeler main sur artefact réel » n'existe que sur la machine de l'orchestrateur.

**R-1** `claude-opus-5-5[1m]` · **R-20** aucun commit, aucun workflow · **R-21** tout chiffre ci-dessus est rejouable par les commandes du §8 ; la donnée structurée complète (982 arêtes avec lignes, fermetures, paires, registre, écarts, mesures embarquées avec leur sha256) est dans `F:\tmp\carto\graph.json`.
