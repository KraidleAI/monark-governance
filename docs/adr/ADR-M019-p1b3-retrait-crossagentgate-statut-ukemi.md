# ADR-M019 — P1-b3 : retrait de `crossAgentGate` et statut de branchement d'Ukemi

- **Statut** : **proposé / en revue** pour le retrait de `crossAgentGate` (G2 approuvé-avec-corrections 2026-09-19 ; G7 et checkpoint-2 à venir) ; **TRANCHÉ par l'investisseur le 2026-09-19** pour le
  statut de registre public d'Ukemi (§D4, candidate ESCALADE CA-2 au checkpoint-1 de b3) ; amendement d'ADR-M018 D2 **proposé, à
  ratifier** (§D3). Aucune surface publique du registre (`apps/site`) n'est modifiée par ce lot.
- **Dates** : décision 2026-09-19 · approbation _(checkpoint-1 / checkpoint-2 de b3 — à venir)_ · dernière modification 2026-09-19
- **Propriétaire de la décision** : orchestrateur MONARK pour le retrait de `crossAgentGate` (changement technique, sans revendication
  publique nouvelle) ; **investisseur** pour le statut de registre d'Ukemi (`built`/`upcoming`) et la ratification de l'amendement
  ADR-M018 D2 — ISO/IEC/IEEE 42010 §6.10.
- **Gate concerné** : G0 (ADR de rattachement du lot P1-b3) ; alimente la revue G2 et le checkpoint-2 de b3.
- **Éléments affectés** : `packages/monark/src/index.ts` (modifié), `packages/monark/package.json` (modifié),
  `packages/monark/test/cross-agent-gate.test.ts` (**supprimé**), `README.md:102` et `:188` (texte public), `package-lock.json`
  (graphe workspace) ; ADR-M017 (amendé 2026-09-19, prémisse l.135) ; **ADR-M018 D2** (amendement **proposé**, non appliqué) ;
  ADR-M003 D4 (déjà amendé 2026-09-18) ; ADR-M005 D3 (supersession déjà déclarée, l.207-208). **Non modifiés (0 octet)** :
  `apps/site/lib/fleet.ts` (registre — lot W-1), `schemas/`, `packages/contracts`, `packages/hikae`, `packages/ukemi`,
  `apps/sentinel`, `apps/harness/src`.

## Contexte
Rattachement : ADR-M017 D2(v)/D5 (retrait de `crossAgentGate` **ordonné en b3**), ADR-M018 D1/D2/D3 (règle de branchement ; la
requalification d'Ukemi est renvoyée au G2 de b3), checkpoint-2 b2 **K-C2-3** (`docs/CHECKPOINT2-M017-b2.md:26`), règle globale
Dettes et Branchement (CLAUDE.md, décision investisseur 2026-09-19).

Fait de carte (`docs/etude-suite-2026-09-18/CARTOGRAPHIE-code.md` ; ADR-M018 Contexte) : `crossAgentGate`
(`packages/monark/src/index.ts:69-114` avant b3) était l'unique « tuyau » composant Shōgen + Hikae + Ukemi **en un seul appel**,
**appelé uniquement par son test** (test 30, `cross-agent-gate.test.ts`). ADR-M017 D2(v) le retire : il COMMIT sur
`cascade-liquidable-24h` avec des paires seedées là où le chemin servi abstient `under_calib`, et la garde A6 (`gate.ts`) interdit
une calibration apportée sur une classe committée — **deux vérités pour une même classe**, contraire à M002 D3 et M008 D7/A6.

## Décision

**D1 — Retrait de `crossAgentGate` (mesuré, P1-b3).**
Suppression pure, sans remplacement dans `packages/monark` (le « remplacement du test 30 » est le test (3)
`gate_attested_concordant_files_residual` déjà livré en b2, `apps/harness`, ADR-M017 D2(v)/D4(3)) :
- `packages/monark/src/index.ts` : retrait de la fonction `crossAgentGate` et des quatre interfaces de contexte
  (`GateContext`, `CalibrationState`, `BudgetState`, `GateRequest`) et de tous leurs imports (`conformInterval`/`gate` de
  `@monark/hikae` ; `assertClosed*`/types de `@monark/contracts` propres à la fonction ; `SCHEMA_VERSION`). Le barrel n'expose
  plus que les **deux adaptateurs** (`fromShogen` & co. ; `fromAttestedFlow`/`narabiPredictorId` & co.) et le marqueur
  `MONARK_PHASE` (conservé, non consommé ailleurs, commentaire rendu honnête). En-tête réécrit.
- `packages/monark/test/cross-agent-gate.test.ts` : **supprimé** (test 30 = 3 blocs `test()` — chemin commit, axe intent,
  non-fini). L'adaptateur (test 29, `adapter-shogen.test.ts`) est conservé.
- `packages/monark/package.json` : retrait de la dépendance `@monark/ukemi` **et** de son commentaire `"//"` de justification
  (ADR-M015 D1(b) retire-or-justify — plus aucun test ne l'utilise) ; **et** de `@monark/hikae` (D5 ci-dessous) ; `description`
  rendue honnête (l'ancienne revendiquait « freezes the cross-agent gate signature only », faux après le retrait).
- `package-lock.json` : bloc `packages/monark` (dépendances = `@monark/contracts` seul) ; diff mesuré 1/3 lignes, confiné à ce bloc.
- Texte public : `README.md:188` (décrivait `packages/monark` comme « cross-agent gate — freezes the wiring signature; token
  budget B_t » — **faux** : mesuré, aucun `B_t` ni gate dans le paquet après retrait) reformulé en la liste réelle (adaptateurs +
  CBOR canonique) ; `README.md:102` (« built end to end: Shōgen → Hikae → Ukemi », portée par le test 30) reformulé « built and
  served piece by piece and composed on the gate path » (ADR-M017 Conséquences C'-7 / l.115), sans nommer le tuyau `cascade → gate`
  (objet de la question ouverte D4, non préemptée).

Preuves : oracle `npm run ci` 292 → **289** (−3 = les 3 blocs `test()` du test 30) ; `grep` résiduel des symboles retirés hors
`docs/` = **0** ; `grep @monark/ukemi|@monark/hikae packages/monark/` = **0** ; `npm ls @monark/ukemi @monark/hikae -w
packages/monark` = `(empty)`. Détail et mutants : `docs/G1-lot-p1b3.md`.

**D2 — Le tuyau réel Ukemi → `gate`, mesuré (K-C2-3, tâche a).**
La prédiction cascade d'Ukemi **est consommée** par le `gate` servi sur le fil MCP réel — la trace e2e committée le prouve, non
`crossAgentGate` (retiré). Mesure [lu] (`fixtures/h5-e2e-trace.json`, étape 4 `cascade-gate`, construite par
`test/h5-trace-builder.ts:218` (construction des arguments portant la prédiction cascade), `:219` (appel `gate` servi) et `:242` (step enregistré) ; probe `probe_harness_records_real_decision`, non-LLM) :
- entrée : `cascade` (Ukemi) → `Prediction` `{ task_class: "cascade-liquidable-24h", yhat: 100, predictor_id:
  "internal:ukemi-cascade-v0", produced_at: "2026-09-04T00:00:00Z" }` ;
- consommation : cette `Prediction` est passée comme **`prediction` porté par l'appelant** à l'outil `gate` (`registry.run →
  runGate`), pas via une calibration apportée ;
- sortie enregistrée : `action=abstain reason=under_calib` (aucune calibration cascade committée ⇒ **classe fixture**, table
  `apps/harness/src/attestation-binding.ts:33` : `cascade-liquidable-24h → []`).

**Vacuité mesurée [lu]** (rejeu `runGate` sur la `Prediction` de l'étape 4, mêmes `params`, `yhat` ∈ {100, 999999, −5}) : la
`GateDecision` produite est **byte-identique** dans les trois cas (`action=abstain`, `reason=under_calib`, `region` = ensemble vide
`{kind:"set",labels:[]}`, `qhat=null`, `n_calib=0`). Le gate bascule en `under_calib` **avant** de lire `yhat` : le **contenu** de
la sortie d'Ukemi **n'influence pas** le résultat servi. Le tuyau est réel, mais son effet servi est une abstention constante.
**Amendement D2 — 2026-09-19 (lot E-bon-marché, ADR-M018 D4 E9)** : la région servie des classes numériques porte désormais `label_schema:"numeric"` (constante `NUMERIC_LABEL_SCHEMA`, `packages/hikae/src/region.ts`) au lieu du défaut directionnel `up|down` : `{kind:"set",labels:[],label_schema:"numeric"}`. La propriété de vacuité est inchangée (byte-identique sur `yhat` ∈ {100, 999999, −5}) ; le digest de la décision change **par construction** : `fd1203e9175204cc…` (sources `16ec12a`, pré-E9) → `147737730b6e2109…` (sources `bb8f049`), reproductibles par `docs/cartographie-p1/vacuity-replay.mjs`. Le digest `64619eb9…` cité au G2/checkpoint-2 de b3 provient d'un sérialiseur de l'arbre b3 et n'est pas reproductible par le script committé ; il est remplacé ici par la valeur reproductible.

**D3 — Correction de la prémisse « Ukemi non consommé » (tâche b).**
La prémisse « Ukemi n'est consommé par aucun chemin servi » (ADR-M017:135 avant amendement ; ADR-M018:22) est **fausse** (D2).
- **ADR-M017** est **amendé dans ce lot** (amendement daté 2026-09-19, en fin de fichier) : la prémisse l.135 est corrigée, texte
  exact, mesure à l'appui ; la phrase « `crossAgentGate` … retiré en b3 » (l.137) reste exacte.
- **ADR-M018 D2 (l.22)** porte la même prémisse fausse. **ADR-M018 est un ADR investisseur ; il n'est PAS modifié par ce lot.**
  Amendement **proposé, à ratifier par l'investisseur** — texte exact proposé :
  > _« Ukemi (`cascade` servi sur graphe fixture) : sa prédiction **est** consommée par le `gate` servi sur le fil réel (trace h5
  > étape 4 `cascade-gate`, probe) mais le gate **abstient `under_calib` par construction** (aucune calibration cascade committée) et
  > le **contenu** de la prédiction n'influence pas la décision (vacuité mesurée) ⇒ statut `built`/`upcoming` tranché par
  > l'investisseur en P1-b3 (ADR-M019 D4), jamais implicite. »_

**D4 — Statut de registre public d'Ukemi : TRANCHÉ par l'investisseur (2026-09-19).**
Décision investisseur, verbatim : « on le build, on ne revient pas en arrière. on cherche une façon de le mettre à son paroxysme ;
littérature et rigueur académique. on doit le faire. » ⇒ **Ukemi reste `built` au registre** (option B ci-dessous, sans amendement
(b′) de ADR-M018 pour l'instant) **ET** l'écart mesuré en D2 (consommation réelle, effet servi = abstention constante) devient un
**programme obligatoire** : « Ukemi mode L au paroxysme » — classe servie calibrée dont la sortie **influence** la décision, fondée sur
la littérature (Eisenberg–Noe, Rogers–Veraart, Amini–Filipović–Minca, Cifuentes, Lehar–Parlour, Gatto 2026, Garcia Seuma 2026 ;
campagne bibliographique `docs/biblio/ukemi-modeL/` et avis advisor-DeFi **à constituer sur `lot/etude-suite`, hors de ce gel** — fondement non encore versé à ce commit, K-C2-b3-3 ; verbatim investisseur normalisé en orthographe, sens inchangé) ; ADR de programme dédié (ADR-M020) avec checkpoint-1
validateur avant tout code, passe suivant P1/W-1. Le champ `wiring` posé en W-1 dira honnêtement « abstains under_calib by
construction » jusqu'à ce lot. Avis G2 b3 (option A + (b′)) consigné comme avis, non retenu par l'investisseur. Les deux options
restent écrites ci-dessous pour la traçabilité.
Décision de **registre public** (`apps/site/lib/fleet.ts:72`, aujourd'hui `Ukemi … status: "built"`), donc réservée à
l'investisseur (escalade CA-2). **Ce lot ne change pas le registre** (W-1 le fera, ADR-M018 Conséquences). Deux options écrites :

- **Option A — « upcoming »** _(recommandée, sous condition)_. Requiert de **ratifier une clause (b′)** amendant ADR-M018 D1 :
  « (b′) la sortie consommée doit **influencer** le résultat servi ». Justification mesurée : sous `under_calib`, le contenu de la
  prédiction cascade n'influence pas la décision (vacuité, D2) — c'est exactement ce qui sépare ce cas de `attest → gate` (où
  `attested.residual` **file** dans `verdict.residual` et modifie la sortie servie, test (3) b2). Conséquences (lot **W-1**,
  `apps/site/lib/fleet.ts` + test) : `fleet.ts:72` `built` → `upcoming` ⇒ le set gelé `{Shōgen,Hikae,Ukemi,Narabi}` change ⇒
  `fleet_register_built_set_is_frozen` (`test/ci-gates.test.ts:556`) rougit ⇒ **re-baseline en W-1** ; « 4 built, 7 on the roadmap »
  (root `package.json:5`, `README.md:40`, `fleet.ts:6,132`) devient « 3 built, 8 named » ; le panneau Home **bespoke** d'Ukemi
  (`apps/site/components/ukemi-panel.tsx:33`, `status="built"` **codé en dur** — il **ne lit pas** le registre, source de vérité
  propre par `fleet.ts:63`) doit être révisé **manuellement** en W-1, sinon panneau ≠ registre.
- **Option B — « built (abstains) »**. ADR-M018 D1 **tel qu'écrit aujourd'hui** est satisfait : (a) le code passe l'oracle ;
  (b) la sortie cascade **est** consommée par le `gate` servi (D2) ; (c) le probe `probe_harness_records_real_decision` rejoue la
  composition sur le fil MCP réel ; (d) cet ADR déclare les tuyaux (§ Tuyaux). Conséquences (W-1) : ajout du champ
  `wiring: { served_by: "gate / cascade-liquidable-24h (abstains under_calib by construction)", integration_test:
  "probe_harness_records_real_decision" }` sur la ligne Ukemi ; **aucun** changement de compte. **Risque** : un lecteur de
  `/roadmap` peut inférer que l'acte « fonctionne » alors que le seul effet servi est une abstention constante.

**Recommandation (motivée — jamais une décision de worker ; antérieure à D4, non retenue, tranchée par l'investisseur le 2026-09-19)** : **Option A (upcoming) + ratifier la clause (b′)**. Motif : ADR-M018 D1
vise « la sortie est **consommée** par un chemin servi » ; l'**esprit** (règle de branchement investisseur 2026-09-19 : « plus de
pièces sans les brancher ») est un **effet réel**, pas une consommation vacue. Un registre `built` dont le seul effet servi est une
abstention constante induit en erreur sur ce que « built » signifie. **Mais** ADR-M018 **tel qu'écrit** classe Ukemi `built`
(Option B satisfait a–d) — d'où la clause (b′) à ratifier. Trancher revient à l'investisseur.

**D5 — Dépendances de `packages/monark` après b3 : `@monark/contracts` seul.**
`crossAgentGate` était l'**unique** consommateur src de `@monark/hikae` dans `packages/monark` (mesuré : `grep @monark/hikae
packages/monark/` avant b3 = `index.ts:17-18` + le test supprimé, **0** ailleurs). La mission ne nommait que `@monark/ukemi` (qui
portait seul le drapeau `"//"` retire-or-justify) ; personne n'avait tracé que `crossAgentGate` était aussi le seul consommateur
de `@monark/hikae`. Par la **même** règle (ADR-M015 D1(b) retire-or-justify ; ADR-M018 « déclaré ⇔ réel ») et pour ne pas laisser
une dépendance déclarée que rien n'importe (exactement la dérive que M018 supprime), `@monark/hikae` est **retiré aussi**. Extension
de portée mesurée, `error_origin` : **planificateur** (ADR-M017 D2(v)/D5 ne traçait que la dépendance drapeautée) ; réversible
(une ligne). Les adaptateurs conservent `@monark/contracts` (utilisé par `adapter-shogen.ts` et `adapter-narabi.ts`).

## Tuyaux (ADR-M018 D3) — lot P1-b3
Ce lot **retire** un tuyau (jamais servi) et **documente** un tuyau existant ; il n'en **ajoute** aucun de servi.
- **Tuyau retiré** : `crossAgentGate` (Shōgen + Hikae + Ukemi en un appel). **Entrée** : aucun appelant réel (seul son test).
  **Sortie** : aucune (terminal). **État** : aucun. **Test** : `cross-agent-gate.test.ts` (unitaire — **jamais** un chemin servi) ⇒
  pièce non branchée ⇒ retrait (ADR-M018 D1 : un composant dont le seul consommateur est un test unitaire est `upcoming`/à retirer).
- **Tuyau documenté (existant, servi)** : Ukemi `cascade` → `gate`.
  - **Entrée (qui produit)** : l'outil `cascade` (`apps/harness/src/tools/cascade.ts`, composition pure des primitives réelles
    d'Ukemi `@monark/ukemi`) → une `Prediction` (`task_class: cascade-liquidable-24h`).
  - **Sortie (qui consomme)** : l'outil `gate` servi (`registry.run → runGate(prediction, params)`). Classe fixture sans
    calibration committée ⇒ `abstain / under_calib` (`attestation-binding.ts:33`) ; le **contenu** de la prédiction n'influence pas
    la décision (vacuité mesurée, D2).
  - **État** : aucun état persistant (le harnais est pur, K-8 ; la classe fixture est une donnée committée).
  - **Test qui prouve la composition** : `probe_harness_records_real_decision` (`test/h5-e2e-probe.test.ts`) rejoue la trace e2e
    (`fixtures/h5-e2e-trace.json`, étape 4 `cascade-gate`) sur un fil MCP réel — non-LLM. La couture est réelle ; son effet servi
    est une abstention constante (d'où D4).

## Items formés (ADR-M018 D3 — déclencheur, jamais un « dû » nu)
1. **Étape h5 portant `attested`** : la trace e2e n'a **aucune** étape où le `gate` porte la clé `attested` (l'étape 6 `attest` et
   l'étape 5 `btc-dir-gate` sont disjointes). **Déclencheur** (re-formé au checkpoint-2 b3, K-C2-b3-2 : le déclencheur « G2 de b3 »
   a été tiré sans traitement) : premier appelant réel de la prise `attested`, ou **prochain lot touchant `apps/harness`** (lot T-1 du
   témoin TSV ou U-4 Ukemi, le premier venu) — la trace h5 y gagne une étape `gate` avec `attested`.
5. **Prose « built end to end » sur la vitrine** (K-C2-b3-1) : la phrase corrigée à `README:102` vit encore dans `apps/site/app/fleet/page.tsx:25`
   (metadata « three agents built end to end ») et `:73`, `apps/site/app/page.tsx:86-87`, `apps/site/app/roadmap/page.tsx:170` ; `roadmap/page.tsx:99`
   nomme « the cross-agent gate » (artefact retiré). Hors portée octet de b3 (`apps/site` intouché par décision). **Déclencheur** : lot **W-1**
   (même lot que `wiring`, `fleet.ts:70` « verified », test de gel) — reformulation « built and served piece by piece; composed on the gate path ».
2. **Champ `wiring`** (`apps/site/lib/fleet.ts` + extension de `fleet_register_built_set_is_frozen`) : lot **W-1** (ADR-M018
   Conséquences). Porte la matérialisation de D4 (le statut d'Ukemi tranché + `wiring` déclaré) ; R-25 < 400. **Déclencheur** :
   décision investisseur sur D4.
3. **`apps/site/lib/fleet.ts:70`** — « Attested perception — a verified price testimony. » : « verified » nu en texte public
   (vocabulaire interdit dans la description du `gate`, parqué au checkpoint-2 b2). **Parqué pour W-1** (surface `apps/site`
   intouchée par b3). **Déclencheur** : lot W-1.
4. **Test d'hygiène de dépendances** (déclaré ⊇ importé, par package) : mesuré absent (ni eslint `import/no-extraneous-dependencies`,
   ni test) ⇒ le mutant « réintroduire un import de `@monark/ukemi` » reste **vert** (hoist workspace, cf. Sources). Non ajouté par ce
   lot (unitarité / R-25 : lot de suppression pure ; le garde eslint `import/no-extraneous-dependencies` est transverse au monorepo). **Déclencheur** : prochaine cartographie (ADR-M018 D4) — G2 b3 C2.

## Sources
- Mesures primaires [lu] (reproductibles, `docs/G1-lot-p1b3.md`) : oracle `npm run ci` = 289 ; `grep` résiduels ; mutants m1
  (`@monark/ukemi` réimporté ⇒ **vert**, hoist), m2 (test restauré ⇒ **rouge** TS2305), m3 (`fromShogen` retiré ⇒ **rouge**) ;
  tuyau Ukemi → `gate` : `fixtures/h5-e2e-trace.json` étape 4, `test/h5-trace-builder.ts:218,242`,
  `apps/harness/src/attestation-binding.ts:33` ; vacuité : rejeu `runGate` (`apps/harness/src/tools/gate.ts:533`), `yhat` ∈
  {100, 999999, −5} ⇒ `GateDecision` byte-identique.
- Rattachements [lu] : ADR-M017 D2(v)/D5 + Tuyaux l.119-137 + amendement 2026-09-19 ; ADR-M018 D1/D2/D3 ;
  `docs/CHECKPOINT2-M017-b2.md:26` (K-C2-3) ; ADR-M003 D4 (amendement 2026-09-18) ; ADR-M005 D3 (supersession l.207-208) ;
  ADR-M015 D1(b) ; ADR-M002 D3, ADR-M008 D7/A6.
- Comptes publics affectés par D4 [lu] : `apps/site/lib/fleet.ts:6,72,132` ; root `package.json:5` ; `README.md:40` ;
  `test/ci-gates.test.ts:556`.
- Aucun chiffre de seconde main ; aucun `[2nd]`. Aucune procurement (tout est interne, mesuré dans le dépôt).

## Alternatives rejetées
- **Conserver `crossAgentGate` (test-only) ou le refactorer pour « partager le noyau »** : le noyau (`conformInterval` → L3) est déjà
  partagé ; ce qui diverge est la source de calibration (paires seedées vs scores committés), et `packages/monark` ne peut pas
  importer `apps/harness` (ADR-M017 Alternatives). Refusé ⇒ retrait.
- **Garder `@monark/hikae` déclaré** (respect littéral de la mission « seul `@monark/ukemi` ») : laisserait une dépendance que rien
  n'importe — la dérive « déclaré ≠ réel » que ADR-M018 supprime. Refusé (D5), avec déclaration `error_origin` et réversibilité.
- **Trancher le statut d'Ukemi dans ce lot** : décision de registre **public** = investisseur (CA-2) ; un générateur ne
  l'auto-déclare pas (AgileGates). Refusé ⇒ question ouverte (D4).
- **Amender ADR-M018 dans ce lot** : ADR investisseur. Refusé ⇒ amendement **proposé** (D3), à ratifier.
- **Rendre le mutant `@monark/ukemi` rouge en ajoutant un test d'hygiène** : un lot de suppression pure ne fait pas croître un oracle transverse (unitarité / R-25) ; ⇒ item formé (4), déclencheur cartographie ADR-M018 D4.

## Conséquences
- Le seul « tuyau » Shōgen + Hikae + Ukemi en un appel (jamais servi) est retiré ; le dépôt ne prétend plus le contraire (README,
  package.json, en-tête du barrel corrigés). `packages/monark` = strictement les deux adaptateurs + le décodeur CBOR canonique.
- La prémisse fausse « Ukemi non consommé » est corrigée (ADR-M017 amendé) ; sa conséquence (statut de registre) est posée à
  l'investisseur avec deux options mesurées et une recommandation motivée — **zéro dette nue** : chaque point ouvert porte un
  déclencheur (items formés) ou une question formée (D4).
- Négatif assumé (rédigé avant D4 ; D4 tranché le 2026-09-19 : `built` maintenu) : jusqu'à W-1, `fleet.ts:72` affiche `Ukemi … "built"` sans champ `wiring` — état transitoire
  **déclaré** (W-1), non un oubli ; aucun G7 ne clôt b3 sans que D4 soit tranché et W-1 planifié (ADR-M018 D3).
- Procurement : aucun. Dette délibérée-prudente : aucune (les quatre items formés portent chacun leur déclencheur).

<!-- Format : Nygard 2011 [lu], étendu ISO/IEC/IEEE 42010:2022 §6.10 [lu] (propriétaire, horodatages, alternatives rejetées, liens). -->
