# MONARK — Cartographie réelle des composants à la clôture P1 « branchement » (ADR-M018 D4)

> ÉTAT : COMPLET — 2026-09-19 — worker `claude-opus-4-8[1m]`, effort max — lecture seule, aucun commit (R-20).

**Provenance (G1).** Modèle résolu : `claude-opus-4-8[1m]` (Opus 4.8 1M, épinglé ; `claude-opus-5` banni ; pas de tier nu).
Dépôt `F:\Monark`, branche `lot/etude-suite`, HEAD **`eb0b7e5`** (`git rev-parse --short HEAD` vérifié). Arbre de travail sous
`packages/ apps/ scripts/ test/ schemas/` = **propre** (`git status --porcelain` vide sur ces chemins) ⇒ le code mesuré **est** `eb0b7e5`
(les modifs présentes sont sous `docs/biblio/` et deux ADR non suivis, hors code). Méthode (doc 03) : **le code d'abord** ; chaque
assertion porte `fichier:ligne` ou un script rejouable (R-21). Scripts jetables déterministes (sans horodatage) :
`docs/cartographie-p1/import-graph.mjs` → `import-graph.out.json` (sha256 **imprimé** par le script `c77d55d5…6cadf4` = charge JSON
canonique **sans** LF final ; sha256 du **fichier disque** `fdc69870…` = **avec** LF final — les deux diffèrent par ce seul octet, rejouables) ;
`docs/cartographie-p1/vacuity-replay.mjs` (rejeu ADR-M019 D2, digest décision unique `fd1203e9…`). Sources secondaires (ADR/README/registre) citées comme telles.

**Verdict.** P1 a **branché deux tuyaux nouveaux** et **retiré un mensonge** depuis le 2026-09-18 : (1) `attest → gate` est **servi et
testé de bout en bout** (prise `attested`, `attested.residual → verdict.residual`, à travers le registre) ; (2) `crossAgentGate`
(le triangle test-only) est **supprimé** (grep = 0) ; le registre `fleet.ts` **déclare** désormais son branchement (`wiring`), gelé.
Le registre public est **honnête** sur les 4 built ; les 12 upcoming ne revendiquent **aucun** tuyau (interdit à la compilation).
Écarts résiduels : tous **items formés avec déclencheur** (aucune dette nue).

---

## §1 — Graphe d'imports mesuré (script `import-graph.mjs`, 197 fichiers, 23 arêtes inter-frontières)

Arête `A ⇒ B` = un fichier de A importe B ; `src`/`test` = nombre de sites d'import sous `*/src/` vs `*/test/` (distinction ADR-M018 D1 :
un consommateur **uniquement test** garde la pièce « upcoming »). `@monark/harness|sentinel|site` → nœud `app:` (les autres `pkg:`).

| Arête | total | src | test | note |
|---|---|---|---|---|
| `app:harness ⇒ pkg:contracts` | 17 | 8 | 9 | gate/cascade/attest/calibrate + schema-projection |
| `app:harness ⇒ pkg:hikae` | 6 | 4 | 2 | `gate.ts:34` (L1/L3/conformInterval) |
| `app:harness ⇒ pkg:monark` | 6 | 3 | 3 | `attest.ts:19` fromShogen ; `calibration.ts` narabiPredictorId |
| `app:harness ⇒ pkg:ukemi` | 3 | 2 | 1 | `cascade.ts:36` fictitiousDefault/liquidableAmount/emitPrediction |
| `app:sentinel ⇒ app:harness` | 2 | 1 | 1 | **sous-chemin `/calibration` seul** (constante gelée `USDE_STABLE_RUN_CALIB`), jamais le serveur (K-8 tient) |
| `app:sentinel ⇒ pkg:hikae` | 8 | 6 | 2 | tracker M009 (`timeline.ts`) |
| `app:sentinel ⇒ pkg:monark` | 1 | 1 | 0 | `flow.ts` fromAttestedFlow |
| `pkg:hikae ⇒ pkg:contracts` | 16 | 9 | 7 | — |
| `pkg:monark ⇒ pkg:contracts` | 6 | 4 | 2 | **seule dépendance** de monark après b3 |
| `pkg:ukemi ⇒ pkg:contracts` | 3 | 2 | 1 | — |
| `pkg:atelier ⇒ pkg:contracts` | 4 | 3 | 1 | démo locale |
| `test:root ⇒ app:{harness,sentinel,site}` | 9/1/32 | 0/0/0 | 9/1/32 | probes/oracles (test-only par nature) |

**Nœuds sans consommateur src** : `pkg:atelier` = **orphelin total** (personne ne l'importe ; démo, stubs marché `market-stubs.ts:10`
LÈVENT « never callable ») ; `app:site` et `scripts` = **consommés uniquement par des tests** (le site n'est importé que par
`test:root`, 32 sites — frontière stricte code↔données : le site n'importe **aucun** `@monark/*`).

**Exports morts / terminaux** (census de symboles, `import-graph.out.json`) :
- `MONARK_PHASE` (`packages/monark/src/index.ts:23`) : **census = 1** (sa seule déclaration) ⇒ **export mort**, jamais consommé.
  Commentaire honnête (`:18-22` « records the package's declared phase ») ⇒ mort **déclaré**, pas une dette nue (ADR-M019 D1).
- `crossAgentGate` : **census = 0** ⇒ **retiré** (P1-b3, `0a21718`). Le triangle Shōgen+Hikae+Ukemi n'existe plus nulle part.
- `calibrate` : **servi** (4e outil pur, `registry.ts:32`) mais **terminal** — sa sortie (le `set_digest` BYO) est **portée par
  l'appelant** vers `gate`, aucun composant du dépôt ne la consomme (ADR-W1 § Tuyaux : « ne consomme pas la sortie du gate »).
- `pkg:ukemi.clearing()` / `clearingFromBelow` : **non consommés par src** — `cascade.ts` appelle `fictitiousDefault` **directement**
  (correctif auto-DoS H7, `cascade.ts:168-170`), jamais `clearing()`. Exports vivants seulement par les tests d'Ukemi.

---

## §2 — Flux à l'exécution : câblé / fixture / absent, par paire (test nommé + ce qu'il rejoue)

| Paire | Statut | Test nommé (fichier:ligne) | Ce qu'il rejoue réellement |
|---|---|---|---|
| **`attest → gate`** | **CÂBLÉ (servi)** | `gate_attested_concordant_files_residual` (`gate.test.ts:702`) | Pilote **à travers `registry.run()`** avec le prix **réel** `runAttest()` (témoin Binance committé) ; asserte `verdict.residual == attested.residual` **et** que la couture « touche UNIQUEMENT `verdict.residual` » (décision sinon identique). Item (1) : **aucune étape h5** ne porte `attested` (fil absent). |
| **`cascade → gate`** | **CÂBLÉ (servi), vacue** | `probe_harness_records_real_decision` (`h5-e2e-probe.test.ts:83`) + `vacuity-replay.mjs` | Le probe monte un serveur in-process `127.0.0.1`, fil MCP réel ; étape 4 `cascade-gate` = `abstain/under_calib`. Rejeu `runGate` sur `yhat ∈ {100, 999999, −5}` ⇒ `GateDecision` **byte-identique** (1 digest `fd1203e9…`), `n_calib=0` : le **contenu** d'Ukemi n'influence pas la décision (ADR-M019 D2). |
| **Narabi `run.ts → publiés → /narabi`** | **PUBLIÉ (snapshot)** | `narabi_live_parses_real_state_shape` (`narabi-live.test.ts:45`, **titre suffixé**) | Parse les octets du **snapshot committé** (`narabi-snapshot.ts`), sha-pinné à ce que l'endpoint servait le **2026-09-18**, byte-exact → parseur du site. Le site lit `/narabi/` live avec **fallback snapshot déclaré** (`narabi_live_snapshot_badge_when_fetch_fails`). **Qualif** : la preuve committée reste **1 fenêtre, T=0** (`2026-09-17`, `non_evaluable`) ; « publié quotidiennement » (README:40) repose sur le timer systemd, **non re-vérifié live** ici (lecture seule). |
| **`fromAttestedFlow → gate`** | **CÂBLÉ via `runGate` direct** | `gate_stable_run_usde_committed_region_A7b` (`gate.test.ts:423`) | `adaptToPrediction` (`:387` `fromAttestedFlow`) → `runGate(pred, …)` **direct** (`:429`), région USDe `covered`. **Pas** `registry.run()` : jambe prouvée au **niveau fonction**, pas sur la surface servie MCP. |
| **Hikae `gate` (BYO)** | **CÂBLÉ (servi, in-proc)** | `probe_byo_demo_loop_closes` (`byo-demo-probe.test.ts:78`) | `calibrate` puis `gate` sur serveur in-process (`startServer`), `gate-byo` = `commit`, `calib_digest === set_digest`. Jambe réelle **non nommée** par le registre. |
| **Hikae `gate` (stable-run, registre)** | **texte seul via registre** | `gate_stable_run_honesty_text_is_keyed_A2_A7f` (`gate.test.ts:469`) | Passe par `registry.run()` mais n'asserte que le **texte d'honnêteté** ; la **région** stable-run est prouvée par `runGate` direct (A7b). Sur le fil MCP endpoint : absent. |
| **`calibrate`** | **SERVI, terminal** | `apps/harness/test/calibrate.test.ts` | 4e primitive pure ; sortie portée par l'appelant, aucun consommateur repo (§1). |
| **Shōgen adaptateur → `AttestedPrice`** | **CÂBLÉ (import)** | `adapter-shogen.test.ts` ; `attest` | `attest.ts:19,51` `fromShogen` → `AttestedPrice` (`:56` closed) ; vérifieur **non exécuté à l'appel** (`:6`). |
| **Ukemi `clearing.ts`** | **CÂBLÉ (import) → cascade** | via `cascade.ts` | consommé par l'outil `cascade` (harness) : `fictitiousDefault → liquidableAmount → emitPrediction` (`cascade.ts:36`). `clearing()`/`clearingFromBelow` non consommés (§1). |
| **`crossAgentGate`** | **ABSENT (retiré b3)** | — | grep = 0 (`packages apps scripts test`). |
| **Token ↔ `B_t`/gate** | **ABSENT** | — | inchangé : CA affichée (`ca-copy.tsx`), `B_t` **porté par l'appelant et échoyé** par le gate, jamais déplété côté serveur (probe (4d)). |

`packages/monark` après retrait de `crossAgentGate` : barrel = **deux adaptateurs** (`fromShogen`, `fromAttestedFlow`) + décodeur CBOR
+ `MONARK_PHASE` (mort) ; dépendance = `@monark/contracts` **seul** (b3 a retiré `@monark/ukemi` **et** `@monark/hikae`, `package.json` mesuré).
`apps/atelier` : orphelin, non listé au registre flotte (démo). `skills/monark/SKILL.md` : annonce `{attest,gate,cascade,calibrate}` =
exactement le set servi (cohérent).

---

## §3 — Comparaison avec le registre public (`apps/site/lib/fleet.ts`) — les 4 `wiring` ligne à ligne

| Built | `served_by` (registre) | chemin servi **vrai** ? | `integration_test` **existe et rejoue** ? |
|---|---|---|---|
| **Shōgen** (`:113`) | `attest → gate` (`attested` ; `attested.residual` filé) | **OUI** — `registry.run(..attested)` (b2) | **OUI** — `gate_attested_concordant_files_residual` rejoue la couture servie |
| **Hikae** (`:125`) | `gate` (btc-dir-15m ; stable-run ; **BYO**) | **OUI** (gate servi) | **PARTIEL** — `probe_harness_records_real_decision` rejoue btc-dir/cascade sur le fil ; **ne rejoue ni BYO ni stable-run** (jambes prouvées par `probe_byo_demo_loop_closes` / `gate_stable_run_*`, **non nommés** au registre). Écart structurel : **un test nommé pour N jambes**. |
| **Ukemi** (`:138`) | `cascade → gate` (« abstains under_calib by construction ») | **OUI** mais **vacue** (§2) | **OUI** — même probe ; le champ **dit** honnêtement l'abstention constante |
| **Narabi** (`:162`) | sentinelle `/narabi/` **+** `fromAttestedFlow → gate` | **OUI** (jambe publiée) ; jambe gate = `runGate` direct | **OUI** — `narabi_live_parses_real_state_shape` rejoue la **composition publiée→parseur** (K-V1 : le fenêtrage `sentinel_windows_identical_to_pull` ne rejoue **pas** la publication) |

**Les 12 upcoming (aucun tuyau revendiqué ?)** — **OUI, garanti à la compilation** : `UpcomingFleetAgent` porte `wiring?: never`
(`fleet.ts:63`) ⇒ tout `wiring` sur un upcoming est une **erreur TS** ; les 7 agents (Mokugeki, Kaihi, Kessai, Kamae, Kyokusen, Koyomi,
Genkan) + 5 produits (Firebreak, Warden, Softlanding, Verdict, Ballast) sont upcoming, **aucun** ne déclare de tuyau. `fleet_register_built_set_is_frozen`
(`ci-gates.test.ts:556`) gèle « 4 built / 12 upcoming » et impose (3) `served_by` non vide + `integration_test` = `test("<id>"` grepé.

**README / site — phrases impliquant un tuyau (vraie/fausse)** :
- `apps/site` : « end to end » / « cross-agent » = **0 occurrence** (W-1 a corrigé les 5 sites : fleet:25/73, page:86, roadmap:170 → « built and served **piece by piece**, composed on the gate path ») ; `roadmap:99` = « the attested-price envelope on the served gate, its residual carried into the verdict, and B_t carried by the caller and echoed by the gate » — **vrai** (correspond à la couture b2 + probe 4d).
- `README:102` « built and served piece by piece … composed on the gate path » — **vrai** ; `:40` « 4 built · Narabi runs · 7 named » — **vrai** (registre) ; `:188` `packages/monark` = adaptateurs + CBOR — **vrai** (b3).
- `README:98` diagramme `sensors (attest) → gate → acts (execute)` : la jambe **« acts (execute) »** n'est **servie par aucun outil** (« gate never executes », SKILL:10 ; D0 no-trade) ⇒ couche **act = upcoming** (dépiction backbone, pas un tuyau servi). `README:119` + `page.tsx:65` « each commit spends it » : décrit le budget **côté appelant** (le serveur échoie, ne déplète pas) — formulation « caller-side » déjà adjudiquée W-1 D4. À **nommer** (item T0 architecture), pas une dette nouvelle.
- `« verified »` (constat, cité) : rendu en **surclaim** sur `shogen-panel.tsx:51,:57` + `fleet-presentation.ts:33` (×3) **et** `README.md:48,:111,:112` (×3) = **×6** ⇒ **lot Shōgen-honnêteté** (item formé). Négations honnêtes `how:62`, `shogen-panel:63` licites (non bannies) ; `integrators:15`, `load-committed:41` = commentaires non rendus.

---

## §4 — Écarts (chacun : dette au sens de la règle, ou item formé avec déclencheur nommé)

| # | Écart mesuré | Classement | Déclencheur / recherche |
|---|---|---|---|
| E1 | **Étape h5 sans `attested`** : la trace n'a aucune étape `gate` portant `attested` ⇒ le fil MCP ne prouve pas la prise (seul `gate_attested_concordant_files_residual`, via registre, le fait). | **Item formé** (ADR-M019 (1)) | Premier appelant réel de la prise, **ou prochain lot touchant `apps/harness`** (T-1 témoin TSV / U-4). |
| E2 | **Registre : 1 `integration_test` pour N jambes** (Hikae : gate/stable-run/BYO ; Narabi : publiée/`fromAttestedFlow`). Les preuves des jambes non nommées (`probe_byo_demo_loop_closes`, `gate_stable_run_*`) ne sont ni au registre ni dans la garde (3). | **Item formé** (nouveau, cette cartographie) | Étendre `FleetWiring.integration_test` en liste, ou nommer la jambe principale + renvoi ADR ; déclencheur : **prochain lot touchant `apps/site/lib/fleet.ts`** (designer (b) ou autre). |
| E3 | **Garde (3) `TEST_ROOTS` = [`test`, `apps/harness/test`, `apps/sentinel/test`]** — **sans `packages/*/test/`** (`ci-gates.test.ts:636`). Conforme à D1 par construction (un test de paquet = unitaire, ne prouve pas un chemin servi) ; l'écart est l'**exclusion non documentée** dans le commentaire de la garde (le CI `npm test` **inclut** pourtant `packages/*/test`). | **Item formé** | Un futur built dont l'`integration_test` vivrait sous `packages/*/test/` rougirait à tort ⇒ documenter l'exclusion, ou l'élargir. Déclencheur : tel agent. |
| E4 | **Garde (3) titres suffixés** (` — `) — **RÉSOLU en W-1** : regex `test\("<id>(?:"\| — )` (`ci-gates.test.ts:648`) ⇒ `narabi_live_parses_real_state_shape` (titre suffixé) résout ; `no_such_test` reste rouge (mutant m6 vert). | **Résolu** | — |
| E5 | **Hygiène de dépendances absente** : ni `import/no-extraneous-dependencies` (eslint), ni test ⇒ le mutant m1 « réimporter `@monark/ukemi` dans `packages/monark` » reste **vert** (hoisting workspace). | **Item formé** (ADR-M019 (4)) — déclencheur = **cette cartographie** ⇒ **recherche jointe** (ci-dessous) | voir Recherche R1. |
| E6 | **Rendu de `wiring.served_by`** : 0 surface `apps/site` ≠ `fleet.ts` ne référence `served_by`/`integration_test` (tripwire garde (4) vert) ; rendre les chaînes (à chiffres) exigerait de **lever le tripwire ET ajouter les chaînes au scan numérique** (prérequis). | **Item formé** (ADR-W1 (b)) | **Lot designer** (note honnête sans chiffre). |
| E7 | **Lot Shōgen-honnêteté** : `« verified »` surclaim rendu ×6 (§3). | **Item formé** (ADR-W1) | **Avant toute nouvelle revendication du panneau Shōgen**. |
| E8 | **`MONARK_PHASE`** : export mort (census 1), consommé nulle part. | **Item formé / mort déclaré** | Conservé délibérément (ADR-M019 D1, commentaire honnête) ; déclencheur : retrait ou premier consommateur. |
| E9 | **Région `{kind:"set", labels:[], label_schema:"up|down"}` sur classe NUMÉRIQUE** `cascade-liquidable-24h` sous `under_calib` (mesuré `vacuity-replay.mjs` + trace h5 servie). Cause : `verdict.ts:77` `buildSetRegion([], labelSchema ?? BTC_DIR_LABEL_SCHEMA)` ; `gate.ts:312` ne passe `labelSchema` que pour `mode:"set"` ⇒ défaut directionnel « up|down » sur une classe numérique. Byte inerte (labels vides) mais **schéma malhonnête** dans un octet servi. | **Item formé** (nouveau, cette cartographie) | Prochain lot touchant `underCalibVerdict`/`cascade` : région numérique-neutre + **re-pin h5**. Déclencheur naturel : **U-4** (calibration cascade ⇒ région `interval`) ou T-1. |
| E10 | **Preuve committée ≠ journal** : le snapshot sha-pinné (`narabi-snapshot.ts`, T=0, 1 fenêtre `2026-09-17`, capture 2026-09-18) — la **seule** preuve committée de la jambe publiée — est **en retard** sur le dépôt : le journal `c4d05af` consigne **T=1 live** au G7 b2. « Publié quotidiennement » (README:40) repose sur le timer systemd, non re-vérifié live (lecture seule). | **Item formé** (nouveau, cette cartographie) | **Re-capture + re-sha** du snapshot au prochain lot `apps/site` ou à la prochaine cartographie (aligne la preuve committée sur la série live). |

**Recherche R1 (E5 — jamais un « dû » nu).** Trois options mesurées, R-8 respecté :
- **(a) test root zéro-dépendance** « deps déclarées ⊇ `@monark/*` importés sous `*/src/` » par package : **aucune dépendance nouvelle**
  (Node built-ins + lecture des `package.json` + logique déjà à 80 % dans `import-graph.mjs`) ; mutant nommé m1 (réimport `@monark/ukemi`)
  ⇒ rouge. **Recommandé** (le moins cher, R-8-libre, unitaire R-25).
- **(b) `eslint-plugin-import` (`no-extraneous-dependencies`)** : **ABSENT de `node_modules`** (vérifié) ⇒ **procurement R-8** (registre npm,
  provenance) **avant** toute installation ; couvre plus que `@monark/*` mais dépendance transverse au monorepo.
- **(c) `knip`** : **ABSENT** aussi (R-8) ; détecte aussi les exports morts (E8) mais large. Recommandation motivée : **(a)** d'abord ;
  (b)/(c) sur décision, non implémentés par ce worker (R-20).

Aucun écart n'est une **dette nue** : chacun porte un déclencheur nommé ou une recherche jointe.

---

## §5 — Diff avec la cartographie du 2026-09-18 (HEAD `0c47b31` → `eb0b7e5`, 64 commits)

| Ce qui était (2026-09-18) | Devenu (2026-09-19) | Commits |
|---|---|---|
| `attest → gate` **ABSENT** sur la surface servie (« le `gate` n'a pas de slot `AttestedPrice` ; `attest` terminal ») | **CÂBLÉ (servi)** : clé d'enveloppe `attested` optionnelle, `attested.residual → verdict.residual`, test (3) via registre | b1 `149b535`, b2 `f25eb6d` (ADR-M017) |
| `crossAgentGate` **[test-only]** (triangle appelé seulement par son test) | **RETIRÉ** (grep 0) ; `packages/monark` = 2 adaptateurs, dep `@monark/contracts` seul (drop `@monark/ukemi` **et** `@monark/hikae`) | b3 `0a21718` (ADR-M019) |
| `packages/monark` déclarait `@monark/ukemi` (consommé **par le test seul**) | dépendance **retirée** ; `pkg:ukemi` consommé désormais par `app:harness` **seul** (cascade) | b3 `0a21718` |
| Registre `fleet.ts` : 4 built **sans** déclaration de branchement | champ **`wiring`** (union discriminée, requis/interdit) sur chaque built ; gel `fleet_register_built_set_is_frozen` **étendu** (existence de test, trou numérique, panneau lit le registre) | W-1 `b1594c4`, `3e0a150` |
| Vitrine : « built **end to end** » (×4) + « the **cross-agent** gate » (×1) — **faux** après b3 | **0** sur `apps/site` : « built and served piece by piece, composed on the gate path » (5 sites) ; ligne Shōgen (ex-`fleet.ts:70`, **`:109` à HEAD**) `« verified »` → `« attested »` ; panneau Ukemi lit le registre | W-1 `b1594c4` |
| Ukemi statut de registre **en question** (« à requalifier au G2 de b3 ») | **`built` tranché par l'investisseur** (ADR-M019 D4) + programme **ADR-M020** (mode L au paroxysme) ; `wiring` dit « abstains under_calib by construction » | b3 `82387fe`, `8de6ef9` |
| Narabi « built+déployé, T=0 » (M012-e) | snapshot committé **inchangé** (T=0, 1 fenêtre `2026-09-17`, capture 2026-09-18) — mais le journal `c4d05af` consigne **T=1 live** au G7 b2 ⇒ snapshot **non re-pinné depuis** (preuve committée en retard ≥1 fenêtre sur le dépôt lui-même, cf. E10) ; `wiring` désormais **déclaré** | W-1 `b1594c4` ; journal `c4d05af` |
| Commentaires **périmés** signalés : `hikae/src/index.ts:95` « no consumer » ; `export-public.mjs:85-86` « LICENSE absente » | **CORRIGÉS** : `hikae/src/index.ts:95` « consumed out-of-tool by the sentinel » ; `export-public.mjs` « LICENSE now exists … REQUIRED entry » | (M012 / lots antérieurs au range) |

**Inchangés** (déjà vrais le 2026-09-18) : le site n'importe aucun `@monark/*` (frontière code↔données) ; `gate-sim` illustratif (pas
l'API) ; token câblé à rien ; K-8 tient (harnais ↛ sentinelle ; outils purs ; loopback) ; `atelier` orphelin ; annoncé == servi (SKILL 4 outils).

*(sha256 de ce fichier : émis dans le retour worker à l'orchestrateur, post-écriture — un fichier ne peut contenir son propre digest.)*
