# MONARK — Cartographie du code : « les composants se parlent-ils ? » (plomberie)

> ÉTAT : COMPLET (7/7 sections + synthèse) — 2026-09-18 — worker `claude-opus-4-8[1m]`, effort max — lecture seule, aucun commit (R-20).

**Provenance (G1).** Modèle résolu : `claude-opus-4-8[1m]` (Opus 4.8 1M, épinglé ; Opus 5 banni).
Date : 2026-09-18. Dépôt : `F:\Monark`, branche `lot/np-4-scout-susde`, HEAD `0c47b31`
(« journal: restyle B validated and deployed »). Mission : cartographie lecture seule, aucun
commit (R-20). Méthode (doc 03) : **le code d'abord** ; chaque assertion porte `fichier:ligne`
reproductible (R-21). Les sources secondaires (ADR/RUNBOOK/README) sont citées comme telles.

**Réponse courte à l'investisseur (détail en §3).** Oui, les composants **se parlent — mais par
deux tuyaux seulement, et jamais tous ensemble sur un chemin servi.** (1) La **sentinelle Narabi**
écrit des fichiers publiés que le **site** lit (flux live, 1 fenêtre réelle à ce jour). (2) Le
**harnais** compose en interne les primitives réelles des 4 moteurs et les sert en 4 outils MCP purs,
que l'appelant enchaîne. Le chemin « les trois agents travaillent ensemble » (`crossAgentGate`)
**existe et est testé, mais n'est appelé par personne d'autre que son test** — il n'est pas exposé.
Le **site n'importe aucun moteur** (il lit des fichiers publiés). Le **token** est une adresse
épinglée affichée, câblée à rien.

---

## Légende des états et des liaisons

État d'un composant : **[built]** code + tests qui l'épinglent ; **[built+déployé]** en plus servi
en production (systemd/Caddy) ; **[fixture]** ne tourne que sur des données committées ; **[démo]**
démonstrateur local ; **[test-only]** code réel appelé uniquement par un `.test.ts`.

Nature d'une liaison A→B (§3) : **import** (import statique TS) ; **runtime-prod** (un process écrit,
un autre lit/appelle, en prod) ; **build** (lu à `next build`) ; **test-only** (composition qui
n'existe que dans un test) ; **fixture** (entrée committée/appelant) ; **absent** (aucun lien).

---

## §1 — Inventaire des composants (rôle, E/S typées, état, tests)

### Paquets `packages/*` (les 4 moteurs + la couche d'intégration + l'atelier)

**`@monark/contracts`** — `packages/contracts/` — **[built, GELÉ]**
- **Rôle** : les contrats d'interface **gelés** de la flotte ; source de vérité = `schemas/*.json`
  (neutre en langage), ceci en est la liaison TS (ADR-M001 ; `package.json` description). Racine du
  graphe : **0 dépendance** `@monark/*`.
- **Sorties (barrel `src/index.ts`)** : gardes de fermeture `assertClosed{AttestedPrice,Prediction,
  GateDecision,AttestedFlow}` + `assertNoForbiddenKey` (`closed-check.ts`, `forbidden-keys.ts`) ;
  `calibDigest` (`calib-digest.ts`, digest C5 float64_be) ; sérialiseurs canoniques
  `serialize{Prediction,Verdict,AttestedFlow}` (`serialize.ts`) ; `intentInRegion` (`region.ts`) ;
  types (`types.ts`).
- **État** : GELÉ par `test/contracts-frozen.test.ts` — manifeste `test/contracts-frozen.manifest.json`
  = **14 entrées** sha256 (8 `contracts/src/*.ts` + 6 `schemas/*.json`). Le test le nomme « manifeste
  Phase 0 (357ef25) », mais le jeu a été **re-pinné** depuis : `attested-flow.schema.json` est arrivé
  avec Narabi (M008), postérieur à la Phase 0. Tests :
  `contracts/test/{calib-digest,closed-check,contracts,enums,forbidden-keys,schema}.test.ts`.

**`@monark/hikae`** — `packages/hikae/` — **[built]**
- **Rôle** : moteur conforme HAC-CP (Phase 1, ADR-M002). Chaîne
  prédicteur → Prediction → HIKAE conformalise → CoverageVerdict → GateDecision (`src/index.ts:4`).
- **Dépend de** : `@monark/contracts` (types + `calibDigest`, `serializeVerdict/Prediction`, `intentInRegion`).
- **Sorties** : L1 `splitQuantile/conformalSet/indicatorScore(s)` (`l1-split.ts`) ; L2 `imocpStep/budgetAt`
  + type `Miscover` (`l2-monitor.ts`) ; **L3 `gate` + `GATED_TOOLS`** (`l3-gate.ts`, politique
  COMMIT/DEFER/ABSTAIN fermée, D0 no-trade) ; régions `buildInterval/SetRegion` (`region.ts`) ;
  `buildVerdict/underCalibVerdict` (`verdict.ts`) ; `conformInterval` (`interval-conformer.ts`) ;
  prédicteurs (`predictor.ts`) ; instrument S2 `generateLabeledSeries/S2_DEFAULT/
  HARNESS_VERSION="fixtures-synth"` (`s2/`) ; **tracker ACI M009** `trackerInit/Step/StepSize/Replay/
  Digest/clipScore` (`tracker.ts` ; `index.ts:95` dit « no consumer » — commentaire périmé : la
  sentinelle le consomme, cf. §2).
- **Tests** : 10 fichiers `hikae/test/*` (l1, l2, l3, interval-{conformer,gate,nondegenerate},
  region-predictor, s2, tracker, contracts-integration).

**`@monark/ukemi`** — `packages/ukemi/` — **[built]**
- **Rôle** : brique moteur de cascade (Phase 1, ADR-M002 D9) : clearing Eisenberg-Noe déterministe +
  « montant liquidable sous choc 24 h » émis en `Prediction` numérique. **Pas un produit**
  (`src/index.ts:4`, G7 UKEMI 2026-09-03).
- **Dépend de** : `@monark/contracts` (`Prediction`, `serializePrediction`).
- **Sorties (`index.ts`)** : `clearing/fictitiousDefault/clearingFromBelow/phi/pbarOf/piOf`
  (`clearing.ts`) ; `isLiquidable/liquidableAmount` + types `Position/LiquidableResult`
  (`liquidable.ts`) ; `emitPrediction/UKEMI_PREDICTOR_ID` (`prediction.ts`).
- **Tests** : `ukemi/test/{clearing,clearing-rv,liquidable,prediction}.test.ts` + 7 fixtures JSON.

**`@monark/monark`** — `packages/monark/` — **[built ; chemin composé TEST-ONLY]**
- **Rôle** : couche d'intégration inter-agents (ADR-M003 D4). `crossAgentGate(price, prediction, ctx)`
  (`src/index.ts:69`) = le chemin « les trois agents travaillent ensemble », **pur** : AttestedPrice
  Shōgen + Prediction UKEMI + GateContext seedé → `conformInterval` (HIKAE) → `gate` (L3) →
  `GateDecision` fermé. Contient aussi les **adaptateurs** re-exportés.
- **Dépend de (réel)** : `@monark/contracts` + `@monark/hikae` (`conformInterval`, `gate`).
  `@monark/ukemi` est **déclaré** dans `package.json` mais **consommé uniquement par le test**
  (`test/cross-agent-gate.test.ts:17`, `emitPrediction`), **jamais par `src/`** (cf. §2).
- **Sorties** : `crossAgentGate` (`index.ts:69`) ; adaptateurs `fromShogen/isAdapterError/
  DEMONSTRATIVE_LABEL` (`adapter-shogen.ts`), `fromAttestedFlow/isNarabiError/narabiPredictorId`
  (`adapter-narabi.ts`), CBOR canonique (`cbor-canonique.ts`).
- **Fait clé** : `crossAgentGate` **n'est appelé que par `cross-agent-gate.test.ts:80`** (grep
  exhaustif sur `packages apps scripts test`) — ni harnais, ni sentinelle, ni site. Chemin **[test-only]**.
- **Tests** : `monark/test/{adapter-narabi,adapter-shogen,cbor-canonique,cross-agent-gate}.test.ts`.

**`@monark/atelier`** — `packages/atelier/` — **[démo local]**
- **Rôle** : atelier de démonstration **LOCAL** (Phase 1) ; rejoue les 9 états `GateDecision` de
  `fixtures/` ; zéro dépendance runtime, zéro réseau (`package.json` description). Chaîne
  Shōgen→HIKAE→UKEMI rendue à l'écran.
- **Dépend de** : `@monark/contracts` seulement (types + `assertClosedGateDecision`, `state.ts:7`).
- **Sorties** : `buildState/renderState` (`state.ts`, `render.ts`) ; **stubs marché
  `perps_order_preview/execute` qui LÈVENT** (`market-stubs.ts`) — non câblé à un venue ;
  `loadRootFixtures` (`fixtures-loader.ts`). + 4 fichiers rendus à la racine du paquet
  (`index.html/main.js/style.css/serve.js`, whitelistés export).
- **Tests** : `atelier/test/atelier.test.ts`. **Rien n'importe l'atelier** (feuille du graphe).

### Applications `apps/*`

**`@monark/harness`** — `apps/harness/` — **[built+déployé, v0.4.0]**
- **Rôle** : serveur **MCP sans état** + miroir HTTP/JSON, exposant les **primitives réelles** des
  moteurs en **4 outils purs** : `attest`, `gate`, `cascade`, `calibrate` (ADR-M005/M007).
- **Dépend de** : `contracts`, `hikae`, `monark`, `ukemi` + `@modelcontextprotocol/server@2.0.0`.
  **N'importe PAS la sentinelle** (K-8, `package.json` description ; confirmé par grep, §2).
- **E/S** : MCP Streamable-HTTP via `createMcpHandler` (serveur frais par requête = sans état, D6) ;
  bind **`127.0.0.1:3001` seulement** (`server.ts:35`) ; deux surfaces routées par Host (`mcp.`→MCP ;
  `api.`→miroir JSON, `server.ts:60`) ; garde Origin K-9 (`server.ts:79`) ; cap corps **512 KiB**
  interne (`server.ts:44`) derrière Caddy 256 KB. Le miroir JSON dérive du **même registre** que le
  MCP (`http.ts:28`), donc pas de dérive possible.
- **Cœur** : `tools/registry.ts` (allowlist **fermée** `{attest,gate,cascade,calibrate}`,
  `registry.ts:32` ; l'oracle K-8 asserte le **set exact**, `registry.ts:10-13`) ; `tools/gate.ts`
  (dispatch par `task_class`), `tools/cascade.ts` (clearing UKEMI réel → Prediction),
  `tools/attest.ts` (projection du témoin Shōgen committé), `tools/calibrate.ts` (BYO `splitQuantile`) ;
  `calibration.ts` (calib committées), `schema-projection.ts` (la seule lecture `schemas/`),
  `shogen-fixture.ts` (lecture des fixtures `s3-binance.*`), `version.ts` (`HARNESS_VERSION="0.4.0"`).
- **État** : **déployé et servi, vérifié** — `docs/deploy-CA-harness.json` (contrôle live
  2026-09-18T07:26Z contre `api./mcp.monarkgate.tech` : health 200 `operations=gate,cascade,attest,
  calibrate`, `tools/list` = les 4, openapi 200, garde Origin 403). Tag `v0.4.0` == registre
  `tech.monarkgate/monark@0.4.0` (`version.ts:6-7`). Tests :
  `harness/test/{attest,calibrate,cascade,gate,http,openapi,registry,schema,server,
  usde-calibration}.test.ts` + probes racine `h5-e2e-probe`, `byo-demo-probe`.

**`@monark/sentinel`** — `apps/sentinel/` — **[built+déployé, T=0]**
- **Rôle** : job quotidien **hors-outil** (ADR-M012) : lit le flux de rachat USDe attesté à la
  finalité du bloc, alimente le tracker M009, publie une timeline rejouable. Node built-ins seulement ;
  **« the harness never imports this »** (`run.ts:1`).
- **Dépend de** : `contracts`, `hikae`, `monark` (adaptateur narabi), et **`@monark/harness/calibration`**
  — la **seule** touche au harnais, une **constante gelée** `USDE_STABLE_RUN_CALIB` (`timeline.ts:16`),
  pas le serveur.
- **E/S** : `run.ts` (runner idempotent : pool RPC quorum `PUBLIC_ENDPOINTS` → `fetchWindow` →
  `attest` → `step` → écrit `timeline.jsonl` + `state.json` dans le state-dir + copies `public/`
  pour Caddy `/narabi/`, `run.ts:177-184`) ; `flow.ts` (`buildAttestedFlow` + **C1 fail-closed** +
  `fromAttestedFlow` adaptateur réel, `flow.ts:66-73`) ; `timeline.ts` (moteur tracker, chaîne de
  hash par ligne, `committedQ1` recomputé depuis la calib committée) ; `windows.ts`, `rpc.ts` ;
  `instrument.ts` + `edetector.ts` (**diagnostics hors-état**, M014, **preuve jamais déclencheur**,
  `edetector.ts:3`).
- **État** : **déployé** (timer systemd `deploy/monark-sentinel.timer` quotidien 00:30 UTC ; snippet
  Caddy `/narabi/*`). **A produit sa 1re fenêtre** : snapshot committé
  (`apps/site/lib/narabi-snapshot.ts:18-21`) = jour 2026-09-17, `pair_status:"non_evaluable"`, **T=0**
  (première fenêtre publiée, sans prédécesseur), capturé 2026-09-18 depuis `monarkgate.tech/narabi/`.
- **Tests** : `sentinel/test/sentinel.test.ts` + fixture `usde-boundary-blocks.json` +
  `test/narabi-live.test.ts` (racine).

**`@monark/site`** — `apps/site/` — **[built]**
- **Rôle** : vitrine publique (Next.js 16 ; ADR-M004/M013).
- **Dépend de** : `next`/`react` **UNIQUEMENT** — **aucun import `@monark/*`** (grep §2). Le site
  **consomme des fichiers**, il ne se lie à aucun moteur en code.
- **Ce qu'il lit** : (1) fichiers Narabi publiés via `fetch /narabi/{state.json,timeline.jsonl}`
  (`lib/narabi-live.ts:154` `loadNarabi`, repli sur snapshot committé **déclaré**, jamais silencieux) ;
  (2) contrats gelés `schemas/` à `next build` (`lib/load-contract.ts`) ; (3) chiffres sourcés
  committés vérifiés sha256 (`lib/load-committed.ts`, `data/manifest.sha256.json`) ; (4) enums du
  contrat (`lib/gate-enums.ts`).
- **Point clé** : le simulateur `gate-sim` est une **simulation ILLUSTRATIVE** (`lib/sim.ts:1-6`,
  `COST/ALPHA` déclarés « NOT the real engine ») — **PAS** un appel à l'API gate. Le site ne parle
  donc **jamais** au harnais à l'exécution (§3).
- **Roster (`lib/fleet.ts`, SSOT ADR-M004 D14)** : 11 agents (4 built {Shōgen, Hikae, Ukemi, Narabi} ;
  7 upcoming {Mokugeki, Kaihi, Kessai, Kamae, Kyokusen, Koyomi, Genkan}) + **5 produits tous
  upcoming** {Firebreak, Warden, Softlanding, Verdict, Ballast} (`fleet.ts:134-181`). Gelé par
  `fleet_register_built_set_is_frozen`.
- **Token** : **adresse (CA) communautaire épinglée** `FYZcYCHSp8FzNba1UtDZydKKGosmxVNpFBiVuia38AhT`
  (`out/mint.txt`, `test/token-ca-pinned.test.ts:14`), affichée avec un bouton copier
  (`components/token/ca-copy.tsx` ; l'adresse arrive en prop, aucun fetch, aucun état chaîne).
- **Tests** : `test/{site-honesty,sas-*,narabi-live,token-ca-pinned,visage-register}.test.ts` +
  détecteur `apps/site/test/honesty-lint.ts` (« test 44 », trous numériques).

### Autres surfaces

- **`schemas/*.json`** — 6 fichiers, **tous gelés** (manifeste 14 entrées) : les **5 contrats typés**
  `attested-price`, `attested-flow`, `prediction`, `coverage-verdict`, `gate-decision` +
  `forbidden-keys.json` (clés bannies). `prediction.schema.json` **est** bien gelé
  (`contracts-frozen.manifest.json:15`).
- **`skills/monark/`** — `SKILL.md` (annonce 4 outils + boucle BYO + 3 `task_class` + endpoints
  `mcp.monarkgate.tech/mcp` & `api.monarkgate.tech/{tool}`), `DEMO.md`, `INTEGRATION.md`, `LICENSE`.
  **[built]** — ce que le registre MCP `tech.monarkgate/monark@0.4.0` publie.
- **`scripts/*`** — `export-public.mjs` (whitelist → miroir public), `release-public.mjs`,
  `verify-harness.mjs`, `grep-forbidden.mjs` (gate vocab, 102 patterns `vocab-banned.json`),
  `lang-gate.mjs` (gate FR), `lint-ratchet.mjs`, recorders `record-{byo-demo,h5-e2e-trace,
  usde-calib}.mjs`, `usde-full-pull.mjs`, `census/{aave-liquidations,burns-by-burner}.mjs`.
- **`deploy/*`** — `Caddyfile.monark-harness` (cap corps 256 KB, sert mcp.+api.),
  `Caddyfile.monark-narabi.snippet` (`/narabi/*` statique + log d'accès),
  `monark-{harness,sentinel}.service`, `monark-sentinel.timer` (00:30 UTC).
- **`fixtures/*`** — 9 `*.gate-decision.json` + `manifest.json` (rejeu atelier) ; témoin Shōgen
  `s3-binance.{lot.cbor,verdict.txt,constat.json,registre.txt}` (+ PROVENANCE) ; traces
  `h5-e2e-trace.json`, `byo-demo-trace.json` (+ PROVENANCE) ; calib USDe
  `usde-calib-{series,scores}.json` (+ `PROVENANCE-usde.md`) ; `figures-sourced.json`.

---

## §2 — Graphe des dépendances réelles (imports statiques mesurés)

Mesuré par `grep -rn "@monark/"` sur `packages/*/src`, `apps/*/src`, `apps/site/{lib,components,app}`,
`test`, `scripts`. Liste d'adjacence (A → B = A importe B) :

```
contracts   → (rien : racine)
hikae       → contracts
ukemi       → contracts
atelier     → contracts
monark      → contracts, hikae            [ukemi : déclaré en package.json, importé SEULEMENT par le test]
harness     → contracts, hikae, ukemi, monark   (+ @modelcontextprotocol/server)
sentinel    → contracts, hikae, monark, harness/calibration (constante gelée only)
site        → (aucun @monark/* : lit des fichiers publiés/gelés)
```

Détail des arêtes portantes (avec preuve) :
- `harness/src/tools/gate.ts:34` importe hikae (`splitQuantile, conformalSet, conformInterval, gate,
  buildInterval/SetRegion, buildVerdict, underCalibVerdict, BTC_DIR_LABELS`) ; `:38` importe
  `../calibration.ts` (`BTC_DIR_CALIB, lookupCommittedCalibration`).
- `harness/src/tools/cascade.ts:35` importe ukemi (`fictitiousDefault, liquidableAmount,
  emitPrediction, pbarOf, piOf`).
- `harness/src/tools/attest.ts:19` importe monark (`fromShogen, isAdapterError, DEMONSTRATIVE_LABEL`).
- `harness/src/calibration.ts:15-17` importe hikae (S2) + contracts (`calibDigest`) + monark
  (`narabiPredictorId`).
- `sentinel/src/timeline.ts:16` importe `@monark/harness/calibration` (`USDE_STABLE_RUN_CALIB`) —
  **unique** point sentinelle→harnais ; `flow.ts:15` importe monark (`fromAttestedFlow`).
- `monark/src/index.ts:17` importe hikae (`conformInterval, gate`) ; ukemi absent de `src/`
  (grep `ukemi` sur `packages/monark/src` = 0, hors le commentaire `index.ts:5`).

### Frontières K-8 (vérifiées)

- **harnais ↛ sentinelle** : TIENT. Aucun import `@monark/sentinel` ni `apps/sentinel` dans
  `apps/harness/src` (grep = 0). Déclaré `harness/package.json` et `sentinel/src/run.ts:1`.
- **sentinelle ↛ `harness/src/tools`** : TIENT. La sentinelle n'importe que
  `@monark/harness/calibration` (une **constante gelée**), jamais le serveur/les outils
  (`sentinel/src/run.ts:1`, `timeline.ts:16`). Nuance à dire : l'arête sentinelle→harnais **existe**
  (unidirectionnelle, une donnée gelée), elle ne viole pas K-8 (qui interdit l'inverse).
- **Pureté des outils harnais** : `src/tools/**` n'importe ni `node:fs/net/child_process`, ni `fetch`,
  ni `process.env` (`registry.ts:16-17`, `cascade.ts:12`, `gate.ts:6`) ; l'unique lecture disque est
  isolée dans `schema-projection.ts` et `shogen-fixture.ts` (niveau `src/`), scannée par
  `mcp_tools_have_no_side_effects`. Bind loopback seul (`server.ts:35`, K-8/C-10).
- **atelier** : feuille — importé par rien.
- **site** : n'importe aucun paquet `@monark/*` — frontière stricte code↔données.

### Contrats gelés — qui les produit / les consomme

| Contrat gelé | Produit par | Consommé par |
|---|---|---|
| `AttestedPrice` | `adapter-shogen.fromShogen` (`monark`) | outil `attest` ; `crossAgentGate` [test-only] |
| `Prediction` | `ukemi.emitPrediction` / outil `cascade` | outil `gate` ; `crossAgentGate` [test-only] |
| `CoverageVerdict` | `hikae.buildVerdict` | interne au `gate` / `crossAgentGate` |
| `GateDecision` | `hikae.gate` (L3) / `crossAgentGate` | atelier (rejeu) ; site (enums, build) ; traces e2e |
| `AttestedFlow` | `sentinel.buildAttestedFlow` (`flow.ts`) | `adapter-narabi.fromAttestedFlow` (calib USDe + sentinelle) |

---

## §3 — Flux de données à l'exécution + « les composants se parlent-ils ? »

### (a) Live : sentinelle → fichiers publiés → site — **CÂBLÉ (runtime-prod), 1 fenêtre**

`sentinel/run.ts` (timer 00:30 UTC) → pool RPC quorum public (`rpc.ts`, `PUBLIC_ENDPOINTS`) →
`fetchWindow` → `attest` (`flow.ts:66` : C1 fail-closed puis `fromAttestedFlow`, adaptateur **réel**) →
`step` (`timeline.ts` : tracker M009, `E_static`, `B_t`, hash-chain) → **écrit** `timeline.jsonl` +
`state.json`, copiés dans `public/` (`run.ts:183-184`) → **Caddy** `handle_path /narabi/*`
(`deploy/Caddyfile.monark-narabi.snippet`) → **site** `loadNarabi` `fetch` même-origine
(`narabi-live.ts:154-167`) → composant `narabi/narabi-live.tsx`. Repli **déclaré** sur snapshot
committé si le `fetch` échoue (`narabi-live.ts:168-178`, `narabi-snapshot.ts`).
**Réalité mesurée** : produit **mais 1 seule fenêtre** (2026-09-17, `non_evaluable`, `T=0` :
`narabi-snapshot.ts:20-21`). Le tracker n'a pas encore fait de pas (il faut J0+1 + une paire
consécutive évaluable). Câblé et vivant, tout début de série.

### (b) MCP `gate` → calibration committée → verdict — **CÂBLÉ (in-process, fil MCP réel)**

`gate.ts` dispatche sur `task_class` (`gate.ts:10-16, 38`) : `btc-dir-15m` → `BTC_DIR_CALIB`
(**synthétique**, dérivée de l'instrument S2, `calibration.ts:22-46`) → région `set` ;
`stable-run-velocity-24h` → `lookupCommittedCalibration(task_class, predictor_id)` → la clé **USDe**
(`USDE_STABLE_RUN_CALIB`, 613 scores **mesurés**, `calibration.ts:77`) → région `interval` ; toute
autre clé / `cascade-liquidable-24h` → `under_calib` (abstient). **Preuve d'exécution réelle** :
`test/h5-e2e-probe.test.ts:4` monte le serveur **in-process sur `127.0.0.1`** (`startServer`) et
conduit un vrai `tools/call` MCP Streamable-HTTP + le miroir JSON, avec entrées **perturbées**
non-committées re-vérifiées contre un recompute indépendant. La **seule** calibration **mesurée**
committée est USDe ; btc-dir est déclarée synthétique ; cascade n'en a aucune. La surface elle-même
est **live au public** : `docs/deploy-CA-harness.json` (2026-09-18T07:26Z) atteste l'endpoint
joignable, `tools/list` = les 4 outils, openapi + garde Origin 403 — la **fidélité** des décisions,
elle, étant prouvée in-process (probes h5/byo).

### (c) BYO `calibrate` → `gate` — **CÂBLÉ (in-process, fil MCP réel)**

L'appelant apporte ses scores → `calibrate` (`splitQuantile` HIKAE + `calibDigest` contracts) →
`gate` avec la calibration BYO (`gate.ts:137`, branche `ByoCalibration`) → verdict ; l'audit ferme
quand `verdict.calib_digest === calibrate.set_digest` sur les mêmes scores. **Preuve** :
`test/byo-demo-probe.test.ts:6` monte le serveur in-process, conduit `initialize` + deux `tools/call`,
recompute `set_digest` indépendamment (`runCalibrate`) **et** un quantile conforme écrit à la main
(≠ `splitQuantile` de prod). C'est **le chemin réel** que le skill met en avant.

### (d) Shōgen `attest` → `gate` — **attest = FIXTURE TERMINALE ; attest→gate = ABSENT sur la surface servie**

`attest` projette **le seul** témoin Shōgen committé (`shogen-fixture.ts:23-31` lit `s3-binance.*` ;
`attest.ts:62` `fromShogen`) en `AttestedPrice` (enveloppe K-1). **Le vérifieur n'est PAS exécuté à
l'appel** (`attest.ts:6-7`) : rejeu d'un artefact vérifié une fois, à la capture. **Point dur** : le
`gate` servi prend `GateEnvelope = { prediction, params }` (`registry.ts:36-38`) — **aucun slot pour un
`AttestedPrice`**. L'appelant **ne peut donc pas** enchaîner attest→gate : `attest` est **terminal**
(une démonstration en cul-de-sac ; la trace h5 appelle attest et gate avec des entrées **sans lien**).
Le **seul** attest→gate du dépôt est `crossAgentGate` **[test-only]**, qui file
`price.residual → CoverageVerdict.residual` (`index.ts:87`, traçabilité C2) — cette **prise
d'attestation n'existe pas sur le chemin servi**.

### (e) UKEMI `cascade` → `gate` — **CÂBLÉ comme outils ; entrée FIXTURE/appelant ; abstient**

`cascade` exécute les **vraies** primitives UKEMI : `fictitiousDefault` (clearing L*) → positions →
`liquidableAmount` → `emitPrediction` → `Prediction` (`cascade.ts:189-197`). Puis un appel `gate`
**séparé** consomme cette Prediction → **abstient `under_calib`** (aucune calibration cascade
committée, `gate.ts:12-13`, `CASCADE_UNCALIBRATED_SENTENCE`). L'entrée `cascade` est la matrice
`L/e` **portée par l'appelant** (`cascade.ts:90-99`), pas un livre de marché en direct. La trace h5
montre exactement « cascade → gate ABSTAINS » (`h5-e2e-probe.test.ts:9`). Le chemin pré-composé
Shōgen+UKEMI+HIKAE est `crossAgentGate`, **[test-only]**.

### Tableau composant × composant — « qui parle à qui »

Ligne = émetteur/appelant, colonne = destinataire. `cablé` = lien réel à l'exécution en prod ;
`in-proc` = câblé mais exercé in-process/CI (fil MCP réel, pas l'endpoint public) ; `test-only` ;
`build` ; `fixture` ; `absent`.

| de ↓ \ vers → | Shōgen | Hikae (gate) | Ukemi | Narabi/sentinelle | Harnais | Site | Token |
|---|---|---|---|---|---|---|---|
| **Shōgen (attest)** | — | absent (pas de slot `AttestedPrice`) ; test-only via `crossAgentGate` | absent | absent | cablé (import) | absent | absent |
| **Hikae (gate L3)** | absent | — | absent | via calib gelée | cablé (import) | absent | absent |
| **Ukemi (cascade)** | absent | via harnais (in-proc/test) | — | absent | cablé (import) | absent | absent |
| **Narabi/sentinelle** | absent | consomme calib gelée (import) | absent | — | import calib gelée | **cablé (fichiers, runtime-prod)** | absent |
| **Harnais (MCP)** | cablé (import) | cablé (import) | cablé (import) | absent (K-8) | — | absent | absent |
| **Site** | absent | **sim illustratif, PAS l'API** | absent | **cablé (fetch fichiers)** | absent | — | affiche CA (statique) |
| **Token** | absent | absent | absent | absent | absent | prop d'affichage | — |

Lecture : les seuls liens **runtime-prod** sont **sentinelle→site** (fichiers) et
**sentinelle→calib gelée** (import d'une constante). Tout le câblage inter-moteurs passe par des
**imports** internes au **harnais**, exercés **in-process** (probes CI sur le fil MCP réel), pas
prouvés contre l'endpoint public dans le dépôt. **Site↔harnais = absent** (le sim est illustratif).
**Token = absent** partout (adresse affichée). Le triangle Shōgen+Hikae+Ukemi n'existe assemblé que
dans `crossAgentGate`, **test-only**.

---

## §4 — Plomberie manquante (tuyaux supposés par les docs, absents du code)

Modèle de coût en unités **mesurables du dépôt** (axes qui rendent chaque tuyau cher) :
**K8** = un nouvel outil servi casse par construction l'oracle du set exact
`{attest,gate,cascade,calibrate}` (`registry.ts:10-13`) → test à réécrire + ADR ;
**GEL** = un nouveau contrat re-pinne le manifeste 14 entrées (`contracts-frozen.manifest.json`) → ADR ;
**D6** = tout état persistant/on-chain viole le « sans état » (harnais serveur frais par requête,
`server.ts:4-6`) → décision d'architecture, pas un lot ;
**NET** = tout capteur/réseau en direct viole la pureté des outils (`registry.ts:16-17`) → doit vivre
**hors** du harnais (motif sentinelle).

**T0. Token ↔ `B_t` / gate** (le plus structurant). Le dépôt se déclare « tokenisation layer »
(README ; `package.json`), mais le token est **une CA épinglée affichée** (`out/mint.txt`,
`ca-copy.tsx`) et `B_t` est **porté par l'appelant, jamais mesuré/stocké** (skill `SKILL.md:34` ;
`server.ts:5-6`). Aucun registre de budget, aucun état on-chain, aucun lien token→gate.
**Coût** : **D6** (fondamental — le budget devrait persister/être on-chain) + **GEL** (probable
contrat `AuthorizationBudget`) + réseau chaîne. = une **architecture**, pas un lot. Réseau/état : tout.

**T1. Narabi (tracker) → gate servi en direct.** La sentinelle publie une timeline de tracker, mais
la région du gate servi est **statique** et **ne dépend pas** de l'état du tracker jusqu'à ce qu'un
critère de dérive pré-enregistré ouvre un ADR (README « the gate does not yet » ; ADR-M012 D8 ;
`gate.ts:73-90`). Le live Narabi **n'alimente pas** la calibration servie.
**Coût** : **D6** (le gate lirait l'état tracker) + invariant région-statique (ADR-M012 D8) +
**ADR de dérive** (`rolling90_calm_miss ≥ 0.40`, `timeline.ts:25`) ; **GEL** 0 (la calib n'est pas un
contrat) ; fichiers `gate.ts` + une source d'état. Gaté par conception.

**T2. Ukemi ← livre / file de désendettement en direct.** `cascade` prend une matrice `L/e`
**portée par l'appelant** (`cascade.ts:90-99`), pas un carnet de venue live. Les produits Firebreak
et Softlanding (upcoming, `fleet.ts:140,158`) le supposent (« Ukemi reads the deleveraging queue »).
**Coût** : **NET** (un adaptateur capteur réseau) → **hors** harnais (nouvelle app, motif sentinelle) ;
**GEL** possible (contrat `AttestedBook`) ; fichiers : nouvelle app + branchement de l'entrée `cascade`.

**T3. Genkan devant tout (porte de distribution + budget persistant).** Genkan (upcoming,
`fleet.ts:118-123`) = « le point par lequel chaque transfert/swap/signature passe d'abord, renvoyant
commit/defer/abstain + budget restant ». C'est la productisation du gate en **porte obligatoire** avec
un **budget qui persiste** entre appels — l'exact opposé de l'actuel sans-état. Le produit Warden en
dépend (`fleet.ts:145`).
**Coût** : **D6** (budget persistant) + service stateful + couche d'interception = **architecture**.

**T4. Mokugeki → Shōgen `attest` (témoins vivants) + PRISE d'attestation dans `gate`.** Mokugeki
(upcoming, sensor, `fleet.ts:74-78`) « atteste les faits qu'il extrait d'un document ou d'un
événement ». Il alimenterait le chemin attest avec de **vrais** témoins, au-delà de **l'unique** fixture
Binance committée (`attest.ts:62`). **Mais — révélé par (d)** — même un témoin vivant ne sert à rien
tant que le `gate` servi n'accepte pas une attestation : son entrée `GateEnvelope` n'a **pas de slot
`AttestedPrice`** (`registry.ts:36-38`). Il faut donc **deux** chantiers : le capteur, ET une prise
d'attestation dans `gate` (entrée `gate` → `schema-projection.ts` + tests). Le produit Verdict
(« an attested event », `fleet.ts:168`) en dépend.
**Coût** : nouvelle app capteur + pipeline d'ingestion + refonte de l'entrée `gate` ; **NET** (source
document/événement) ; **GEL** 0 (`params` est D8 **non gelé**, mais le changement est **K8-adjacent**).

**T5. Koyomi ← calendrier.** Koyomi (upcoming, act, `fleet.ts:112-116`) « aplatit l'exposition avant
une fermeture récurrente de fenêtre de trading du week-end ». Absent : une source calendrier + un
venue d'action.
**Coût** : **NET** (adaptateur calendrier + venue) ; **GEL** 0 ; fichiers : nouvelle app act. Le
moins cher des cinq, mais un venue d'exécution reste hors périmètre (D0 : MONARK gate, ne trade pas).

---

## §5 — Surface publique (miroir) vs gouvernance ; annoncé vs servi

### Ce qui sort vers le miroir public (`scripts/export-public.mjs`, dépôt `KraidleAI/Monark`)

Le miroir est une **whitelist fermée** (fail-closed) ; tout le reste est privé.
- **Paquets `packages/*`** : `PACKAGE_SUBPATHS = [src, test, package.json, README.md]`
  (`export-public.mjs:32`) — les 5 paquets sortent leur code/tests/manifeste/readme, **mais pas**
  `packages/*/docs/` (blacklisté, `:97`).
- **Apps** : `APP_PACKAGE_DIRS = [apps/harness, apps/sentinel]` (mêmes sous-chemins, `:41`) ;
  `apps/site` sort en **répertoire entier** (`WHITELIST_DIRS`, `:50`).
- **`WHITELIST_DIRS = [schemas, fixtures, enforcement, apps/site, skills]`** (`:50`).
- **`WHITELIST_FILES`** (`:51-79`) : configs racine (`README, LICENSE, CONTRIBUTING,
  .github/workflows/ci.yml, eslint.config.mjs, lint-ratchet.json, vocab-banned.json, package*.json,
  tsconfig.json`), scripts de gate (`grep-forbidden.mjs/.d.mts, lint-ratchet.mjs, export-public.mjs,
  lang-gate.mjs, lang-exempt.json`), scripts de repro USDe (`usde-full-pull.mjs, record-usde-calib.mjs`),
  fichiers atelier racine, et **`out/{mint.txt,logo.png,banner.jpg}`** (CA + logo + bannière communauté).
- **Reste gouvernance (privé)** — `STRUCTURAL_BLACKLIST` (`:90-98`, défense en profondeur derrière la
  whitelist) : `docs/adr/`, `docs/{G1-,G2-,G7-}`, `docs/CHECKPOINT`, `docs/AUDIT-ENTREE.md`,
  `docs/JOURNAL-PROVENANCE.md`, `docs/R-P1-`, `packages/*/docs/`. **Tout `docs/` de gouvernance
  (ADR, gates, provenance) reste privé** — y compris ce présent fichier.
- **Gardes** : `export_public_no_governance_no_french` (test 42, `export-public.test.ts:108`),
  `harness_export_whitelisted`, et `release-public.mjs` (tags **semver `v0.x.y` seulement**,
  anglais seulement, garde de branche `main` propre — `release-public.test.ts:38,54,106`).

### Ce que le skill/registre annoncent vs ce qui est réellement servi

| Annoncé (`skills/monark/SKILL.md`) | Servi (harnais 0.4.0) | Cohérent ? |
|---|---|---|
| 4 outils `{attest,gate,cascade,calibrate}` | `ALLOWED_TOOL_NAMES` = exactement ces 4 (`registry.ts:32`), oracle set-exact (`:10-13`) | **oui** |
| `n ≤ 10000` scores (`SKILL.md:41`) | `CALIBRATE_MAX_N = 10000` (`calibrate.ts:43`) | **oui** |
| corps `≤ 256 KB` (`SKILL.md:41`) | Caddy `max_size 256KB` (`Caddyfile.monark-harness:17`) ; backstop interne 512 KiB (`server.ts:44`) | **oui** (Caddy rejette en premier) |
| endpoints `mcp.` + `api.monarkgate.tech` | routage par Host (`server.ts:60`) | **oui** |
| 3 classes : `btc-dir-15m` (synthétique), `cascade-liquidable-24h` (aucune calib → abstient), `stable-run-velocity-24h` (USDe, calib committée par clé) | dispatch `gate.ts:10-16` identique ; seule USDe a une calib **mesurée** committée | **oui** |
| version `0.4.0` (registre `tech.monarkgate/monark`) | `HARNESS_VERSION="0.4.0"` == tag `v0.4.0` (`version.ts:6-7,22`) | **oui** |

**Verdict §5** : annoncé == servi, sans dérive. Les deux classes « built-in » sont déclarées fixtures
de plomberie (non use-cases) ; la **seule** classe servie avec une calibration **mesurée** est USDe.

---

## §6 — Dettes et invariants

### Invariants de gel (tests bloquants)

- **`contracts_frozen`** (`test/contracts-frozen.test.ts`) : manifeste **14 fichiers** sha256 ==
  Phase 0 (357ef25) — 8 `contracts/src` + 6 `schemas`.
- **`fleet_register_built_set_is_frozen`** (`test/ci-gates.test.ts`) : built == exactement
  {Shōgen, Hikae, Ukemi, Narabi} ; 7 agents + 5 produits restent upcoming.
- **honesty-lint / `site-honesty` (« test 44 »)** (`apps/site/test/honesty-lint.ts` +
  `test/site-honesty.test.ts`) : aucun nombre en littéral rendu (trous numériques).
- **vocab** (`scripts/grep-forbidden.mjs` + `vocab-banned.json`, **102 patterns**) : bans par scope
  (Hermes nu, `peg/score/p_depeg`, surclaim « adaptive », mots marketing) — `ci-gates.test.ts:123-261`.
- **`lang-gate`** (`scripts/lang-gate.mjs`) : un `.md` français dans l'export public échoue.
- **Digests de calibration fail-closed au load** : `CALIB_DIGEST_PINNED` (btc synthétique,
  `calibration.ts:29,35`) et `USDE_STABLE_RUN_CALIB_DIGEST_PINNED` (mesuré, `calibration.ts:158,165`)
  — une dérive jette à l'import, jamais une re-calibration silencieuse.
- **Oracle K-8 set-exact** (`registry.ts:10-13`) : `REGISTERED_TOOL_NAMES === {attest,gate,cascade,calibrate}`.
- **`token_ca_pinned`**, **`no_secret_in_repo`**, **`fixtures_root_valid`** (9 états),
  **`harness_export_whitelisted`**.
- **`lint-ratchet`** (`lint-ratchet.json` plafond **69**, mesuré 2026-09-16 ; `lint-ratchet.mjs`) :
  6 règles `no-unsafe-*`/`no-explicit-any` réactivées **sur les tests seulement**, échoue si le compte
  dépasse le plafond (dette de typage décroissante, cible 0 ; CI job g4).

### Items ADR ouverts (statut sur pièces) — tous **formés** (zéro dette nue)

- **M012 (g)** — ancrage hebdo « option B » : **formé/déféré**, déclencheur = premier mois
  (`ADR-M012:162`, « Restent formés : (g),(h→l),(i) » `:204`).
- **M012 (i)** — redondance de `GATE_TOOL_DESCRIPTION` (« every other population abstains » rendu
  deux fois) : **formé** (`ADR-M012:189,204`).
- **M012 (l)** — publication de `instrument.json` sous `/narabi/` + rejeu `--timeline` : **reste
  formé** ; **précondition = procurement (h)** (Lorden 1971 ; Shin–Ramdas–Rinaldo ; Vovk 2012)
  (`ADR-M012:177,180,212`).
- **M014 (a)** — borne de délai explicite via Alg. 3 (`computeBaseline`, Kmax=1000 ; oracle R des
  auteurs en dev seulement, R-8) : **formé**, déclencheur = demande de délai chiffré (`ADR-M014:94-95`).
- **M014 (c)** — taux de ratés calmes par semestre (non-i.i.d., invalide l'ARL de Lorden) : **formé**
  (`ADR-M014:20,95`).
- **M014 (d)** — union des déclencheurs (chemin 2) : **décision investisseur** (`ADR-M014:97`).
- **M014 (d′)** — doctrine du défaut à la lecture du e-SR dans un ADR de dérive (retirée par C-5) :
  **décision investisseur** (`ADR-M014:58,94`).

### Autres faits de carte à signaler (pas des dettes — des observations)

- `packages/monark/package.json` déclare `@monark/ukemi` mais `src/` ne l'importe pas (seul le test
  `cross-agent-gate.test.ts:17`) — dépendance déclarée, consommée **uniquement par le test**.
- `packages/hikae/src/index.ts:95` commente le tracker « no consumer » — **périmé** : la sentinelle le
  consomme (`sentinel/src/timeline.ts:13`).
- `scripts/export-public.mjs:85-86` dit « LICENSE is absent and the real export deliberately fails » —
  **périmé** : `LICENSE` existe (Apache-2.0, racine). Même famille de commentaire mort que « no consumer ».
- `crossAgentGate` (le chemin tri-agents composé) est **test-only** : le triangle Shōgen+Hikae+Ukemi
  n'est assemblé nulle part sur un chemin servi.
- Narabi « built+déployé » mais **T=0, 1 fenêtre** : servi et vivant, pas encore une série.

---

## §7 — Diagramme du système réel (pas souhaité)

```
                         MONARK — système RÉEL (2026-09-18, HEAD 0c47b31)
                         =================================================

  ┌───────────────────────── packages/ (moteurs, imports statiques) ──────────────────────────┐
  │                                                                                            │
  │   contracts (GELÉ, racine)  ◄── hikae ◄── monark ──► (adaptateurs Shōgen/Narabi)           │
  │        ▲   ▲   ▲                 ▲   ▲        ▲                                             │
  │        │   │   └──── ukemi ──────┘   │        │                                             │
  │        │   └──── atelier [démo, feuille : personne ne l'importe ; stubs marché LÈVENT]     │
  │        │                                                                                   │
  └────────┼───────────────────────────────────────────────────────────────────────────────┬─┘
           │ imports                                                                         │
   ┌───────┴──────────────────── apps/harness [built+déployé v0.4.0] ─────────────────┐      │ import
   │  MCP sans état @ 127.0.0.1:3001  (Caddy → mcp./api.monarkgate.tech)              │      │ (calib
   │  4 outils PURS, allowlist fermée {attest, gate, cascade, calibrate}             │      │  gelée)
   │    attest  = projette LE témoin Shōgen committé (fixture ; vérifieur non exécuté) │      │
   │    cascade = clearing UKEMI réel → Prediction                                     │      │
   │    gate    = dispatch task_class → calib committée (btc synth / USDe mesuré)      │      │
   │    calibrate = BYO splitQuantile                                                  │      │
   │  [flux b/c/d/e prouvés IN-PROCESS sur le fil MCP réel : probes h5 + byo]          │      │
   └──────────────────────────────────────────────────────────────────────────────────┘      │
              ▲  (aucun import inverse : K-8 harnais ↛ sentinelle)                             │
              │                                                                                │
   ┌──────────┴───────────────── apps/sentinel [built+déployé, T=0] ──────────────────────────┴─┐
   │  timer systemd 00:30 UTC → RPC quorum public → attest (C1 + fromAttestedFlow réel)          │
   │    → tracker M009 (step) → ÉCRIT  state.json + timeline.jsonl  → public/                    │
   └───────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                │  runtime-prod (fichiers, 1 fenêtre)
                                    Caddy handle_path /narabi/*  (statique)
                                                │
                                                ▼  fetch même-origine (repli snapshot déclaré)
   ┌──────────────────────── apps/site [built] (Next.js — AUCUN import @monark/*) ───────────────┐
   │  /narabi ← loadNarabi(fichiers publiés)     |  panels ← schemas GELÉS (build)               │
   │  gate-sim = SIMULATION ILLUSTRATIVE (PAS l'API gate)   |  /token = CA épinglée (affichage)  │
   └─────────────────────────────────────────────────────────────────────────────────────────────┘

  TEST-ONLY (non servi) : crossAgentGate = Shōgen(price) + UKEMI(Prediction) + HIKAE → GateDecision
                          (packages/monark/src/index.ts:69, appelé seulement par son test:80)

  ABSENT (upcoming, fleet.ts) : Mokugeki, Kaihi, Kessai, Kamae, Kyokusen, Koyomi, Genkan
                                + 5 produits (Firebreak, Warden, Softlanding, Verdict, Ballast)
  ABSENT : token ↔ B_t/gate  |  Ukemi ← livre live  |  Genkan devant tout  |  Narabi → gate live
           |  attest → gate (pas de slot AttestedPrice sur la surface servie)
```

---

## Synthèse — « les composants se parlent-ils ? »

1. **Deux tuyaux réels seulement.** (a) sentinelle → fichiers publiés → site (**runtime-prod**, mais
   1 fenêtre, T=0) ; (b) le harnais compose en interne les 4 moteurs et sert 4 outils purs, l'appelant
   les enchaîne (**prouvé in-process** sur le vrai fil MCP, pas contre l'endpoint public dans le dépôt).
2. **Le triangle des 3 agents n'existe assemblé que dans un test** (`crossAgentGate`, test-only) —
   il n'est pas exposé ni servi ; pire, la surface servie n'a **pas de prise** pour une attestation
   (le `gate` ne prend qu'une `Prediction`, pas d'`AttestedPrice`), donc `attest` y est **terminal**.
3. **Le site ne parle à aucun moteur** : il lit des fichiers (Narabi publiés, schemas gelés) ; son
   `gate-sim` est une simulation illustrative, pas l'API.
4. **Le token est câblé à rien** (CA épinglée affichée ; `B_t` porté par l'appelant, sans état).
5. **K-8 tient** (harnais ↛ sentinelle ; outils purs sans I/O ; loopback seul) ; la seule arête
   sentinelle→harnais est l'import d'une **constante de calibration gelée**.

*(sha256 du fichier : émis dans le retour worker à l'orchestrateur, calculé post-écriture — un
fichier ne peut contenir son propre digest.)*

