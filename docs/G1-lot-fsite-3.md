# G1 — Journal de provenance — Lot F-site-3 (Le sim interactif du gate)

- **Campagne** : F-site MONARK (port du design `MONARK.dc.html` sur la fondation gouvernée).
- **Worktree** : `F:\Monark-wt-fsite3` — branche `lot-fsite3`, base `main = 855e61f` (F-site-2 marques mergé, PR #20 ; F-site-1 shell = 5db169f/PR #19 en amont).
- **Date** : 2026-09-10.
- **Contrat** : `docs/PLAN-Fsite-lot.md` §7 (checkpoint-1 C-1..C-9) + `docs/adr/ADR-M004-infrastructure-plateforme.md` addendum **D15**. Inventaire d'implémentation `scratchpad/design-impl-inventory.md` §2/§3/§4a/§4d.
- **Rôle** : worker mono-agent. **R-20** : ne committe pas, ne déclenche aucun workflow. Revue G2 (instance séparée, contexte frais) + verdict G7 restent à l'orchestrateur.

## Gate 0 (R-1) — contrôle de résolution du modèle
- **Modèle résolu tel quel** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` attendu — conforme ; **pas** `claude-opus-5` banni).
- **Effort** : `max`.

## Fichiers créés / modifiés (code de ce lot)
| Fichier | Statut | Lignes |
|---|---|---|
| `apps/site/lib/gate-enums.ts` | créé (server, build-time) | 51 |
| `apps/site/lib/sim.ts` | créé (const module .ts, client-safe, non rendu) | 236 |
| `apps/site/components/gate-sim/index.tsx` | créé (`"use client"`) | 198 |
| `apps/site/components/gate-sim/use-gate-sim.ts` | créé (`"use client"`, hook) | 152 |
| `apps/site/components/gate-sim/diagram.tsx` | créé (`"use client"`, SVG animé) | 205 |
| `apps/site/components/gate-sim/controls.tsx` | créé (`"use client"`) | 167 |
| `apps/site/components/gate-sim/meter.tsx` | créé (`"use client"`) | 36 |
| `test/ci-gates.test.ts` | modifié (+43 : imports + C-9 + numeric-hole) | +43 / -0 |

**Non touchés** : `schemas/` et `packages/` (`git diff main` **vide**), `honesty-lint.exempt.json` (aucune exemption ajoutée ce lot — voir C-6), tout `app/**/page.tsx` (le sim n'est monté nulle part ; Home/How/Token = F-site-4/5/7). `globals.css` : keyframes `flow`/`glow`/`lane`/`rise` déjà présentes (F-site-1), aucune retouche.

## Décisions

### D-1 — `gate-enums.ts` : fonction `loadGateEnums(rootDir)`, type dérivé (Q1 advisor, Option B)
Le loader **calque `lib/load-contract.ts`** : il prend `rootDir` (une page server passe `join(process.cwd(), "..", "..")` ; apps/site est le cwd sous `next build`) plutôt que lire au niveau module — `load-contract.ts` L4-7 documente que l'emplacement du module est non fiable une fois bundlé, et `import.meta.url` est justement ce qu'il évite. Le test C-9 racine appelle `loadGateEnums(ROOT)` comme les tests existants appellent `loadCommitted(ROOT)`.
- **Déviation de forme assumée** vs. le libellé mission `(typeof actions)[number]` : le type est `export type GateAction = GateEnums["actions"][number]` (dérivé du **type du tableau chargé**, jamais l'union littérale). C'est le **même mécanisme** (dériver du tableau chargé, ne jamais énumérer) ; la contrainte qui compte — aucune occurrence de la 3ᵉ action word en littéral dans apps/site — tient. `GateAction` résout vers `string`.
- **Précision** (le libellé mission « le type dérivé casse si l'ordre change » est imprécis) : le type EST `string` et ne casse pas sur réordonnancement ; ce qui casse est `actions[ACTION_ABSTAIN]`, et c'est le **test C-9** qui l'attrape (pas le type).

### D-2 — `abstain` par index (§4d, jamais littéral)
`decide()` renvoie l'action par **INDEX** (`ACTION_COMMIT=0`, `ACTION_DEFER=1`, `ACTION_ABSTAIN=2`, index dans l'enum chargé, ordre épinglé par C-9). Le composant rend `{actions[state.actionIndex]}` (accès-élément) ; toute comparaison passe par l'index (`state.actionIndex === ACTION_ABSTAIN`). `gateJson` : clé `abstain:` **non-quotée** + comparaison par index. **Zéro** `'abstain'`/`"abstain"`/`` `abstain` `` dans apps/site (vérifié par grep ET par le gate `frozen_contract_fields_stay_dynamic`, vert). `commit`/`defer`/les 13 raisons ne sont pas des champs → cités en littéraux clairs.
- **Piège attrapé (advisor)** : le field-gate est un `includes` sur le **texte brut, commentaires compris**. Premier run rouge sur `apps/site/lib/gate-enums.ts :: reason` — les backticks markdown `` `reason` `` de mes commentaires JSDoc étaient traités comme quotes. Corrigé (backticks retirés autour de `reason` ; `` `action` `` conservé — `action` n'est pas un champ des 3 contrats gérés). Re-run vert.

### D-3 — prop `reasons` porteuse via `{reasons.length}` (Q2 advisor, inventaire a9)
Le sim (3 modes) n'a pas besoin visuellement des 13 raisons (la grille = F-site-5) ; mais sous eslint apps/** `no-unused-vars` reste actif. `reasons` est rendu **une** fois dans l'explainer : « The reason is one of {reasons.length} in the frozen enum » — `{reasons.length}` est un **accès-propriété** (test 44 vert, rend « 13 » dynamiquement, jamais un littéral). Chemin explicitement béni par l'inventaire a9. Une seule utilisation (pas de garde d'invariant en plus).

### D-4 — props `cost` / `ambient` (contrat de montage) + modes manuel/auto (fix advisor)
- **board** = SEUL montage auto-cyclant (`pushAmbient` sur intervalle) ; **explainer** = manuel (`push`, contrôles) ; **token** = manuel (bouton « Push a reading » → `pushAmbient`). Correctif advisor : le token cyclait automatiquement, ce qui écrasait/rendait redondante son action manuelle ; désormais token est manuel seul. `pushAmbient` **auto-récupère** l'epoch quand le budget est épuisé (jamais de cul-de-sac ; le token n'a pas de bouton reset, fidèle au design L376).
- `ambient` : le hook cycle **cette** séquence (`pushAmbient`) — auto pour board, manuel pour token → porteuse sans divergence. La page passe `AMBIENT` de sim.ts.
- `cost` : rendu **affichage seul** dans le mode token (« Each commit spends {cost.toFixed(2)} of B_t — an illustrative cost »). `{cost.toFixed(2)}` = **appel** (test 44 vert). `decide()`/`applyDecision()` utilisent la const module `COST` (signature `decide(state, input)` respectée). **Contrat** : la page DOIT passer `cost={COST}` pour que l'affichage colle à la logique (divergence théorique documentée ; aucun montage ce lot).

### D-5 — sim illustratif (D15) + honnête par construction
`COST=0.15`, `ALPHA=0.1`, `budget=1`, `AMBIENT`, `decide()` = **paramètres de simulation illustratifs** (ADR-M004 D15 ; le vrai α par classe est ADR-M003 K, pas 0.1). `sim.ts` n'a **ni JSX ni DOM ni import node:** → client-safe ET jamais une surface test-44 (module non rendu). Tous les nombres (COST/ALPHA/seeds `fresh()`/lectures AMBIENT/timers) sont des const module, jamais des littéraux rendus.

## Mutant C-9 — nommé, rouge prouvé, restauré byte-exact
- **Test** : `gate_action_enum_order_is_frozen` (`test/ci-gates.test.ts`) : `loadGateEnums(ROOT)` ; `assert.deepEqual(actions, ["commit","defer","abstain"])` (ordre) ; `reasons.length === 13` ; `actions[ACTION_ABSTAIN] === "abstain"` (lien porteur vers `sim.ts` — ce fichier de test est hors apps/site, la 3ᵉ action word y est licite).
- **sha256 `schemas/gate-decision.schema.json` avant** : `9434bf4cb768f80c0f7774936386f1318a712746c1ec603eeeedfcfe055a3e6a`.
- **Mutation** : enum `action` réordonné `["commit", "abstain", "defer"]`. **Exécution isolée** `node --test test/ci-gates.test.ts` (pour attribuer le rouge à C-9 — `contracts-frozen.test.ts` rougirait aussi, non exécuté ici) : **13 tests, 12 pass, 1 fail** ; SEUL `gate_action_enum_order_is_frozen` rouge, `AssertionError: action enum order changed (schema drift)`. Le numeric-hole et `frozen_contract_fields` restent verts (indépendants de l'ordre gate-decision).
- **Restauration** : copie byte-exact ; **sha256 après** = `9434bf4c…055a3e6a` (**identique**) ; `git diff main -- schemas/` **vide** ; re-run `test/ci-gates.test.ts` **13/13 vert**.

## C-4 — clôture numeric-hole ; sortie JSON déclarée
- Test frère `gate_sim_rendered_labels_have_no_numeric_hole` : scanne, avec le **même détecteur** que test 44 (`scanNumericText`), toutes les chaînes rendues de données de `sim.ts` (`SENSOR_NODES[].label`, `AMBIENT[].intent`). Vert (aucun chiffre). C'est la clôture pour un futur libellé qui porterait un chiffre (rendu via `{property access}`, invisible à test 44).
- **Déclaré, pas un trou** : la sortie numérique de la vue JSON (`SCHEMA_VERSION`, `ALPHA`, `remaining_budget`, `task_class`…) **n'est pas** scannée par le numeric-hole : c'est la sortie **illustrative** du sim rendue via un **appel** `{gateJson(...)}`, honnête par construction (honesty-lint a8 + ADR-M004 D15 + caveat C-5). Les libellés d'output du diagramme viennent de l'enum `action` chargé (prop), couverts par C-9.

## C-5 — caveat aux 3 montages + α illustratif
- Caveat exact « **An illustrative simulation of the gate policy — not market activity** » rendu en **board**, **explainer** ET **token** via le composant `Caveat` (autonome, uniforme aux trois — correctif advisor : le token le noyait dans une phrase, cassant le rendu autonome ; désormais `<Caveat />` puis une note cost séparée).
- Clause α (explainer, près du `<pre>`) : « The α shown is illustrative — it is the target miscoverage level (coverage is one minus α), not a probability that this region is right. » (« miscoverage level » — pas « coverage level α », gate `no_coverage_level_alpha` vert).

## C-6 — pas d'exemption ce lot
Le sim ne rend **aucun** ordinal nu ni `1.0.0` en texte JSX (le `'1.0.0'` vit dans `gateJson`, sortie via appel, non scannée). **Aucune entrée** ajoutée à `honesty-lint.exempt.json` → la garde d'inertie C-6 (entrée sans porteur rendu ⇒ rouge) reste due à **F-site-4/5** avec leur première entrée (`01-04`/`1.0.0`). Consigné, non contourné.

## Frontière client (C-1, réserve advisor)
- **Statique** : `grep "node:"` sur `sim.ts` + `gate-sim/*` = 0 import réel (seul un commentaire mentionne « node: ») ; `"use client"` en **ligne 1** des 5 fichiers `gate-sim/*`. `gate-enums.ts` porte `node:fs` (server-only, jamais importé par un composant client — le client reçoit `actions`/`reasons` en props).
- **Preuve de bundling différée** : `next build` type-checke tout le tsconfig site mais ne **bundle** que ce qu'une route importe ; le sim n'étant monté par aucune route ce lot, une fuite node: dans un fichier client ne surgirait pas au build. Preuve de bundling due au **premier montage** (F-site-4/5/7). `useTheme()` lève hors `ThemeProvider` → les lots de montage placent `<GateSim>` sous le provider du layout (documenté dans l'en-tête de `index.tsx` et `use-gate-sim.ts`).

## Critère de fidélité (C-1)
Sections `data-screen-label` servies par ce lot (montage effectif en F-site-4/5/7) :
- **board** (`mode='board'`) → « Engine board » (design L81-137) : **le board du design est un pipeline de cartes** (capteurs/adaptateur/gate/actes + aside, L83-118) ; le montage livré rend un **SVG bespoke** (capteurs→gate→lanes) + meter B_t + caveat + auto-cycle AMBIENT. (Le SVG animé `xDiagram` du design vit, lui, dans l'**explainer** L185, non le board.) **Réconciliation card-pipeline ↔ SVG tracée à R3a → owner F-site-4** (montage Home).
- **explainer** (`mode='explainer'`) → « Gate explainer » (L168-195) : sliders reading/spread, intent up/down, `simulate sensor timeout`, Push/New epoch, diagramme, meter, panneaux region + decision·reason, vue JSON `GateDecision` (`gateJson`), clause α, caveat.
- **token** (`mode='token'`) → mini-sim B_t (L368-378) : B_t + meter + log (action·reason·budget) + « Push a reading » + caveat + cost illustratif.
Layout responsive par CSS (grid `auto-fit minmax`), pas d'état de largeur JS (inventaire §3). Diagramme mis à l'échelle par `compact` (explainer plus large). Comparaison au design par le relecteur G2 (instance séparée).

## Oracle (exit codes réels, mesurés 2026-09-10)
| Commande | Exit | Note |
|---|---|---|
| `npm ci` | 0 | 276 packages |
| `npm run ci` (`gate:vocab && typecheck && test`) | 0 | test 44 (b) vert avec les .tsx ; C-9 + numeric-hole verts ; 13/13 ci-gates |
| `npm run lint` (`eslint .`) | 0 | — |
| `npm run lint:ratchet` | 0 | **92/92** (apps/** ajoutent 0, plafond inchangé) |
| `node_modules/.bin/tsc --noEmit` (root) | 0 | typecheck `sim.ts` + `gate-enums.ts` (importés par les tests) sous strict/noUncheckedIndexedAccess/nodenext/no-DOM |
| `(cd apps/site ; next build)` | 0 | « Compiled successfully » ; frontières client compilent |
| `tsc --noEmit -p apps/site/tsconfig.json` | 0 | typecheck des 5 `gate-sim/*.tsx` (DOM lib, `@/`) |
| `node scripts/lang-gate.mjs --scope site` | 0 | 0 hit français |
| `node scripts/grep-forbidden.mjs` | 0 | 69 fichiers, aucun mot proscrit (commentaires compris) |
| `git diff main -- schemas/ packages/` | — | **vide** (0 octet) |

## R-25 (chiffre unique final, mesuré sur l'arbre committé — K-3)
**1152 lignes** comptées (added 1151, deleted 1) < **1205** (marge 53), `git diff --numstat main` hors `docs/G1-*`, `docs/G2-*`, `package-lock.json`. Décomposition : les 7 fichiers du sim (1045) + `ci-gates.test.ts` (+49, test R1 inclus) + `docs/PLAN-Fsite-lot.md` (+58, §7 décisions E-1/β/Mod#2 tranchées + §8 réserves/K-2/K-4) − 1. `docs/G1-lot-fsite-3.md` et `docs/G2-lot-fsite-3.md` exclus (pathspec CI). Ce chiffre **supersède** les comptes intermédiaires (1088 à la revue, 1141 après R1/R6) — un seul chiffre pré-commit fait foi.

## Choix douteux (pour la vérification adversariale R-21)
1. **`decide(state, input)` vs. cost prop** : la logique utilise la const module `COST` ; `cost` est affichage-seul. Divergence possible si un montage passe `cost ≠ COST` — atténuée par le contrat D-4 (passer `cost={COST}`). Alternative écartée : `decide(state, input, cost)` (dévie de la signature mission).
2. **Auto vs manuel** (résolu, correctif advisor) : le design `startAmbient` auto-cycle home ET token ; j'ai d'abord auto-cyclé board+token, mais l'auto-cycle token écrasait son bouton manuel. **Décision** : board = auto seul, explainer + token = manuels (le token pilote `pushAmbient` avec auto-récupération d'epoch). Écart assumé vs. l'auto-cycle token du design — le bouton « Push a reading » (design `homePush`) devient le pilote réel. À confirmer G2.
3. **`ACTION_*` indices 0/1/2 en const module** : couplage à l'ordre du schéma, **entièrement** protégé par C-9 (mutant prouvé). Lisibilité préférée à une union littérale interdite.
4. **aria-label du diagramme** contient « abstain » (mot nu, mid-string, non adjacent à une quote) → non capté par le field-gate (`"abstain"` quote-encadré absent). Vérifié par grep + gate vert.

## error_origin
n/a au niveau lot (implémentation conforme au contrat checkpoint-1 ; aucun défaut résiduel). Le premier run field-gate rouge (backticks `` `reason` ``) a été **attrapé et corrigé dans la passe** (origine = worker, corrigé avant clôture — pas une dette). Verdict G7 + `error_origin` définitif à l'orchestrateur.

## Addendum G2/G7 (orchestrateur `claude-opus-4-8`, 2026-09-10) — corrections post-revue + preuve mutant R1
Revue G2 (instance fraîche ≠ générateur) = **PASS-AVEC-RÉSERVES, 0 bloquante**. Oracle R-21 orchestrateur (avant ET après corrections) vert. Trois corrections appliquées par un worker Opus 4.8 (R-20, ne committe pas), consommées après re-vérification orchestrateur :
- **R1 (gate d'honnêteté ajouté)** : test racine `sim_emitted_reason_codes_subset_of_frozen_enum` — pilote `decide()` (fonction exportée de `lib/sim.ts`, seul émetteur) sur ses 5 branches, collecte les codes-raison émis (`upstream_timeout` L130, `set_too_large` L135, `intent_not_in_region` L138, `budget_exhausted` L141, `covered` L143) et assert que chacun ∈ enum `reason` gelé (13 valeurs de `schemas/gate-decision.schema.json`). Garde de complétude `size===5`. **Preuve de mutant re-jouée par l'orchestrateur** : baseline `node --test test/ci-gates.test.ts` exit **0** ; mutation `lib/sim.ts` L143 `reason:"covered"`→`"covered_XX"` → exit **1** (test R1 rouge, `AssertionError … covered_XX`) ; restauration `cp` → exit **0**. `sha256(sim.ts)` avant = après = `f7ad2bc8e13b594e2fd139189cdbc754309e9f420f9fa1a7a5bdb6271f724858` ; `git diff -- apps/site/lib/sim.ts` vide. `sha256(test/ci-gates.test.ts)` final = `08e6a61dd91ace231d773b5ddc5482f48296e090ad06448b86f2790bfe08ffb6`.
- **R6b** : commentaires `gate-sim/index.tsx` L9 + `diagram.tsx` L4 reformulés « never a literal » → « never a **quoted** literal, jamais en position machine-consommée sensible à la dérive ; la prose d'`aria-label` est une position acceptée gate-verte » (commentaires seuls, aucun code exécuté touché).
- **R6a** : base `main` du présent G1 corrigée `5db169f`→`855e61f` + label rectifié (855e61f = F-site-2/PR #20).
- **Oracle final** (orchestrateur, arbre corrigé) : `npm run ci` **103/103** (0 fail) ; lint 0 ; ratchet 92/92 ; `next build` 0 ; lang site 0 ; vocab 0/78 ; `git diff main -- schemas/ packages/` **0 octet** ; **R-25 = 1152** (chiffre unique final, cf. section R-25 ci-dessus).
- **Réserves non-bloquantes tracées** (owner unique, PLAN §7) : R2 (scan numeric-hole vocab région)→F-site-5 ; R3a (board card-pipeline)→F-site-4, R3b (démenti « no p_correct/confidence/score » sur How)→F-site-5 ; R4 (contrat `cost={COST}`)→F-site-7 ; R5 (gate présence caveat+clause α)→F-site-4. Chacune = correction nommée + owner unique, **pas** de dette nue.
- **error_origin** : R6a = défaut factuel de provenance (origine **worker-G1**, corrigé). R1–R5 = compléments de spec / concerns au montage (**pas** des erreurs). Aucun défaut de code produit.
