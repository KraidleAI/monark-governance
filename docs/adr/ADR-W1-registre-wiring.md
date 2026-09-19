# ADR-W1 — Champ `wiring` au registre `fleet.ts` + gel étendu (matérialisation d'ADR-M018 D2, items formés ADR-M019)

- **Statut** : **proposé / en revue** (G2 + checkpoint-2 à venir). Aucune revendication publique nouvelle : le lot rend le registre
  et la vitrine **honnêtes sur le branchement déjà mesuré** (ADR-M017/M019), sans changer aucun compte (« 4 built, 7 on the roadmap »).
- **Dates** : décision 2026-09-19 · dernière modification 2026-09-19.
- **Propriétaire de la décision** : orchestrateur MONARK (changement technique + prose vitrine). Le **statut de registre d'Ukemi**
  (`built`) reste celui **tranché par l'investisseur** (ADR-M019 D4) — ce lot ne le rejuge pas, il l'**outille**. ISO/IEC/IEEE 42010 §6.10.
- **Gate concerné** : G0 (ADR de rattachement du lot W-1) ; alimente G2 et le checkpoint-2 (CA-11 branchement).
- **Rattachement** : ADR-M018 D2 (champ `wiring`, extension du gel), D3 (section Tuyaux), D1 (définition « built »=branché+testé) ;
  ADR-M019 items formés (2) `wiring`, (5) prose vitrine, (3) `fleet.ts:70` « verified », et D4 (Ukemi `built`, effet servi = abstention
  constante) ; ADR-M017 (Tuyaux attest→gate) ; ADR-M012 M012-e (Narabi servi) ; CHECKPOINT2-M017-b3 (Sprint Backlog W-1) ;
  règle globale Branchement (investisseur 2026-09-19) et Dettes.
- **Éléments affectés** : `apps/site/lib/fleet.ts` (type `FleetAgent` → union discriminée + `FleetWiring` ; `wiring` sur les 4 built ;
  `fleet.ts:70` « verified »→« attested ») ; `test/ci-gates.test.ts` (`fleet_register_built_set_is_frozen` étendu) ;
  `apps/site/components/ukemi-panel.tsx` (statut lu au registre) ; `apps/site/app/{fleet,page,roadmap}` (prose vitrine).
  **Non modifiés (0 octet)** : `schemas/`, `packages/*`, `apps/harness/src`, `apps/sentinel/src` (vérifié `git diff --name-only`).

## Décision

**D1 — Type `FleetAgent` = union discriminée (invariant encodé, pas seulement testé).**
`FleetWiring = { served_by: string; integration_test: string }`. `BuiltFleetAgent` porte `wiring` **obligatoire** ; `UpcomingFleetAgent`
porte `wiring?: never` (**interdit**). Un `built` sans `wiring`, ou un `upcoming` avec `wiring`, est une **erreur de compilation**
(`npm run typecheck`, via l'import de `fleet.ts` par le programme de test root) — invariant plus fort qu'un test runtime (mutants m1/m4, §G1).

**D2 — `wiring` mesuré sur chaque built** (valeurs lues dans le code, `integration_test` = un test **qui existe**) :

| Agent | `served_by` (chemin servi) | `integration_test` (rejoue la composition) |
|---|---|---|
| Shōgen | `attest` → `gate` (clé d'enveloppe `attested` ; `attested.residual` filé dans `verdict.residual`) | `gate_attested_concordant_files_residual` |
| Hikae | `gate` servi (btc-dir-15m committé ; stable-run-velocity-24h ; BYO) | `probe_harness_records_real_decision` |
| Ukemi | `cascade` → `gate` (cascade-liquidable-24h ; **abstains under_calib by construction**, ADR-M019 D2/D4) | `probe_harness_records_real_decision` |
| Narabi | sentinelle quotidienne publiée `/narabi/` + `fromAttestedFlow` → `gate` (stable-run-velocity-24h) | `sentinel_windows_identical_to_pull` |

**D3 — Gel étendu** (`fleet_register_built_set_is_frozen`, `test/ci-gates.test.ts`). Pour chaque `built` : (3) `served_by` non vide ;
`integration_test` est un identifiant nu qui apparaît comme `test("…")` **grepé** dans `test/`, `apps/harness/test/`, `apps/sentinel/test/`
(assertion fichier-existe/nom-trouvé, non-LLM ; anti-faux-vert `testCorpus.length > 0`). (4) **Tripwire de trou numérique (limite déclarée)** : `served_by`
porte des ids avec chiffres (`…-24h`, `btc-dir-15m`) ; une valeur de `wiring` échappe au lint d'honnêteté (accès **ou destructuration**)
**et** au scan numérique du registre (name/line seuls) ⇒ **aucune surface `apps/site` ≠ `lib/fleet.ts` ne référence les identifiants nus
`served_by`/`integration_test`** (grep `siteSurfaces` sur l'identifiant : attrape accès `{a.wiring.served_by}` **et** destructuration
`const {served_by}=a.wiring`, que l'ancien regex `wiring\.served_by` manquait). **Limite déclarée** : un regex de texte **ne ferme pas** les
fuites réflexives (`Object.values(a.wiring)`/`JSON.stringify(a.wiring)`) ; le fix garde (4) — **(i)** lever le tripwire **et (ii)** ajouter les
chaînes au scan numérique — est le **prérequis** de l'item (b). (5) Le panneau Ukemi lit son statut d'`AgentCard` au registre (`status={…}`, import `@/lib/fleet`), pas un `status="built"` nu.

**D4 — Prose vitrine (item formé 5) & `fleet.ts:70` (item 3).** « built end to end » (×4) et « the cross-agent gate » (×1) sont
**faux** après le retrait de `crossAgentGate` (ADR-M019 D1) : ils sont remplacés par le libellé **déjà accepté au checkpoint-2 b3 mot à
mot** (`README.md:102`) — « built and served piece by piece … composed on the gate path » — **sans** la chaîne fléchée « Shōgen → Hikae
→ Ukemi » (elle revendiquait par ponctuation un chemin servi `gate → Ukemi` **inexistant** : le tuyau mesuré est `cascade → gate`, Ukemi en
**amont**, cf. ADR-M019 D2). `roadmap/page.tsx:99` (carte « Phase two · in progress ») : « the cross-agent gate and B_t wired through the
fleet » ⇒ « the attested-price envelope on the served gate, its residual carried into the verdict, and B_t carried by the caller and
echoed by the gate ». Vrai des deux moitiés, **sans les deux surclaims mesurés** : (a) **seul `attested.residual`** est filé (M017 D2(iii),
test (3)(c) « the seam touches ONLY verdict.residual — the decision is otherwise identical », M-2) — donc « residual carried », pas « price
filed » ; (b) **pas** « never depleted » (contredirait `page.tsx:65` public « a depletable authorization budget. Each commit spends it ») —
le **serveur** ne déplète pas, l'appelant porte (ADR-M005 D6 + probe h5 (4d) « caller-carried & echoed, never depleted »).
`fleet.ts:70` : la ligne rendue de Shōgen (teaser `/roadmap`) « a **verified** price testimony » (« verified » nu, item 3) ⇒ « an
**attested** price testimony ».

## Tuyaux (ADR-M018 D3) — lot W-1
Ce lot **n'ajoute aucun tuyau servi** : il **déclare** au registre ceux déjà mesurés (ADR-M017/M019/M012) et **gèle** leur déclaration.
- **Entrée (qui produit)** : ce lot est **consommé** par les surfaces `apps/site` (registre = source de vérité unique, ADR-M004 D14) et
  par le programme de test root (import de `fleet.ts`).
- **Sortie (qui consomme)** : `/roadmap`, `/fleet`, la home (`page.tsx`), le panneau Ukemi, la carte SAS (`sas-model.ts`), la board
  (`gate-sim/board.tsx`) — tous lisent `FLEET_AGENTS`. `wiring` est **métadonnée** consommée par le **test de gel** (D3), non rendue.
- **État** : donnée statique committée ; aucun état persistant.
- **Test qui prouve la composition** (du lot) : `fleet_register_built_set_is_frozen` étendu — non-LLM, rejoue la cohérence
  registre↔tests d'intégration et registre↔panneau (mutants nommés m1..m4, §G1). Les tuyaux **des agents** sont prouvés par leurs
  tests d'intégration respectifs (D2), dont, par jambe :
  - Shōgen : couture `attested.residual → verdict.residual` par `gate_attested_concordant_files_residual` (à travers `registry.run`,
    prix réel `runAttest()`). La probe h5 prouve qu'`attest` **et** `gate` sont servis sur le fil, mais son étape `gate` ne porte **pas**
    `attested` (item formé (1) reporté, ci-dessous).
  - Hikae : `probe_harness_records_real_decision` pilote le `gate` servi sur le fil MCP réel (btc-dir-15m → commit/covered ; cascade →
    abstain). Jambe **BYO** : `probe_byo_demo_loop_closes` ; jambe **stable-run** : suite `gate_stable_run_*` (`apps/harness/test/gate.test.ts:361+`).
    Note sur ADR-M018 D2 « Hikae (`gate`, `calibrate` servis) » : `calibrate` (4ᵉ primitive pure, ADR-M007 ; `ALLOWED_TOOL_NAMES`) est servi
    **à côté**, mais **ne consomme pas** la sortie du gate — le `served_by` du registre nomme donc le `gate` (la sortie de Hikae), pas
    l'outil sœur `calibrate` (couvert par `apps/harness/test/calibrate.test.ts`). Le registre reste sémantiquement « qui consomme la sortie ».
  - Ukemi : `probe_harness_records_real_decision` (étape 4 `cascade-gate`). **Effet servi = abstention constante** (vacuité mesurée,
    ADR-M019 D2) — le champ le dit honnêtement (« abstains under_calib by construction »).
  - Narabi : `sentinel_windows_identical_to_pull` **recompute** le fenêtrage contre la **série committée sha-pinnée via RPC stubbé** (le pull
    enregistré, **offline** — pas un pull on-chain frais) et prouve fenêtrage ≡ pull committé (jambe sentinelle publiée `/narabi/` ;
    consommation de la surface `/narabi` : `narabi_live_parses_real_state_shape`, `test/narabi-live.test.ts`) ; jambe
    `fromAttestedFlow → gate stable-run-velocity-24h` couverte par la suite `gate_stable_run_*` (`gate.test.ts:361+`).

## Items formés (déclencheur, jamais un « dû » nu)
- **(b) Rendu de `wiring.served_by` sur les panneaux des built** — **non fait, délibéré**. Rendre le `served_by` verbatim mettrait un
  **chiffre** public (`cascade-liquidable-24h`, `btc-dir-15m`) qui, en accès-propriété, **échapperait** aux deux scans (trou numérique) ou,
  ajouté au scan, le **rougirait** ; et la présentation honnête et sans-casse sur **tous** les panneaux built (Shōgen/Hikae/Ukemi/Narabi)
  est un travail de mise en page. **Déclencheur** : **lot designer** (note honnête sans chiffre) — qui **lève le garde (4)** et **ajoute les
  chaînes `wiring` au scan numérique** dans le même lot. Le garde (4) rend cet item **vérifiable** (0 rendu aujourd'hui), pas déclaratif.
- **Résidu « verified » (surclaim) — item formé, un SEUL lot propriétaire nommé.** W-1 aligne **maintenant** les **jumeaux exacts** de
  `fleet.ts:70` : `shogen-panel.tsx:36,:42` (« a verified price testimony » → « an attested price testimony » ; aucun test ne pinne la phrase,
  vérifié). **Restent** `shogen-panel.tsx:51` (« A Rust verifier emits a verified testimony »), `:57` (« A verified testimony proves… ») et
  `fleet-presentation.ts:33` (« a verified testimony ») — **phrases différentes** (le récit de vérification du panneau Shōgen), non de simples
  substitutions du jumeau. **Motif du report (cadre b3, pas « schéma non lu »)** : le checkpoint-2 b3 a cadré W-1 sur `fleet.ts:70` **et ses
  jumeaux rendus** ; réécrire le récit du panneau Shōgen est une **passe d'honnêteté dédiée**. **Déclencheur unique** : **lot Shōgen-honnêteté**
  (propriétaire : `shogen-panel.tsx:51,:57` + `fleet-presentation.ts:33`), **avant toute nouvelle revendication du panneau Shōgen**.
  **Décision mesurée : NE PAS bannir `\bverified\b` en scope `site`** — rougirait les **négations honnêtes** « what is not verified »
  (`how/page.tsx:62`, `shogen-panel.tsx:63`).
- **(1) Étape h5 portant `attested`** (ADR-M017/M019 item (1)) : **inchangé par ce lot** (W-1 ne touche pas `apps/harness`). Reste :
  premier appelant réel de la prise `attested`, ou **prochain lot touchant `apps/harness`** (T-1/U-4).

## Alternatives rejetées
- **`wiring` optionnel sur une interface unique + invariant testé seulement** : refusé — l'union discriminée encode l'invariant à la
  compilation (ADR-M018 « si possible »), plus fort ; le runtime ne garde alors que le non-vide et l'existence-de-test (non redondants).
- **Rendre `wiring.served_by` sur le panneau Ukemi maintenant** : refusé — trou numérique / réintroduction d'un chiffre public non gardé
  (voir item (b)).
- **Bannir `\bverified\b` en scope site pour fermer `fleet.ts:70` durablement** : refusé — faux-rouges mesurés : 2 **négations honnêtes**
  rendues (« what is not verified », `how/page.tsx:62`, `shogen-panel.tsx:63`) + les 3 surclaims restants hors lot (`shogen-panel.tsx:51,:57`,
  `fleet-presentation.ts:33`) + 2 commentaires non rendus (`integrators/page.tsx:15`, `load-committed.ts:41`) ; item formé (lot Shōgen-honnêteté) à la place.
- **Trancher/rejuger le statut d'Ukemi** : hors du worker (registre public = investisseur, ADR-M019 D4 déjà tranché « built »).

## Conséquences
- Le registre `apps/site/lib/fleet.ts` est la source de vérité **branchée** : chaque `built` déclare son chemin servi + son test
  d'intégration, gelés ; le panneau Ukemi le lit. La vitrine ne prétend plus « end to end » ni « cross-agent gate ».
- **Zéro dette nue** : l'item (b), le résidu « verified » et l'item (1) portent chacun un déclencheur ; aucun compte public ne change ;
  aucune procurement (tout est interne, mesuré).
- Négatif assumé : l'effet servi d'Ukemi reste une **abstention constante** — le champ le dit ; le paroxysme est ADR-M020 (hors W-1).

<!-- Format : Nygard 2011 [lu], étendu ISO/IEC/IEEE 42010:2022 §6.10 [lu] (propriétaire, horodatages, alternatives rejetées, liens). -->
