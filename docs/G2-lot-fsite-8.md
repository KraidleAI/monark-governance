# G2 — Revue — Lot F-site-8 (Console, Writing, Integrators)

> Rapport du relecteur G2, **instance séparée à contexte frais ≠ générateur** (AgileGates C-3). Matérialisé au dépôt par l'orchestrateur (correction K-1, même patron que F-site-3 : matérialisation → `error_origin` orchestrateur). La **section delta** en fin couvre le durcissement R1/R2 (fold post-G2) et le carve-out `action` décidé au rebase sur le sim mergé.

## Gate 0 (R-1)
- Modèle résolu : `claude-opus-4-8`, effort `max` — conforme (pas `claude-opus-5`). Réviseur ≠ générateur (instance fraîche). **R-20 respecté** : aucun commit, aucun workflow ; seules écritures = 3 mutations temporaires de `integrators/page.tsx` restaurées byte-exact (sha256 `acc31b58…0afe` avant==après, `diff -q` IDENTICAL).

## Verdict : PASS-AVEC-RÉSERVES
Les **3 fichiers du lot** (`app/{console,writing,integrators}/page.tsx`, server components purs) sont **mergeables en l'état** : rendu fidèle au design, honnête par construction, oracle vert. Les 2 réserves (R1/R2) sont hors du périmètre des 3 pages (elles touchent l'outillage / `test/ci-gates.test.ts`) — suivis non bloquants, chacun avec owner + correction formée.

## Oracle indépendant (exit codes réels, `F:\Monark-wt-fsite8`, base 855e61f)
| Étape | Résultat |
|---|---|
| `npm ci` | exit 0 — 276 paquets, 0 vuln |
| `npm run ci` | exit 0 — **100/100** ; `contracts_frozen` re-vérifie schemas/ + packages/contracts/src/ = manifest Phase 0 |
| `npm run lint` | exit 0 |
| `npm run lint:ratchet` | exit 0 — **92/92** |
| `cd apps/site && npx next build` | exit 0 — `/console`, `/integrators`, `/writing` = ○ Static |
| `node scripts/lang-gate.mjs --scope site` | exit 0 — 0 hit |
| `node scripts/grep-forbidden.mjs` | exit 0 — 0 revendication |
| `git diff main -- schemas/ packages/` | 0 octet |
| R-25 | 243 insertions (console 67 + writing 62 + integrators 114), 0 suppression ; < 1205 |

## Invariants d'honnêteté (vérifiés sur le code des gates, pas sur le G1)
1. **Test 44** — VERT. `renderedLiterals()` renvoie `[]` pour toute `CallExpression` (ne descend jamais dans les args de `JSON.stringify(obj,null,2)`) et ignore les initialiseurs d'objet-littéral. Les chiffres `1.0.0 / 0.1 / one of 13 / btc-dir-15m` vivent dans les `const apiRequest|apiResponse` (non rendus). **Mutant** : `<p>You send 1.07</p>` → test 44(b) ROUGE (`integrators/page.tsx:71 token "1.07"`), restauré byte-exact.
2. **`frozen_contract_fields_stay_dynamic`** — VERT. Clés = identifiants nus ; grep des noms de champs quotés dans le lot = 0. **Mutant** : `alpha:`→`"alpha":` → ROUGE (le gate mord les fichiers du lot).
3. **Vocabulaire** — VERT. `confidence` n'apparaît qu'à `integrators` L101, dans la sous-chaîne exemptée `no confidence field`, sur une seule ligne. `score` non banni. Aucun autre mot banni (vérifié aussi sur le HTML prérendu).
4. **Jamais `live` en statut** — VERT. Statuts = pills texte (`Upcoming` / `First note: Upcoming` / `Specified, not shipped`) ; pas de `"use client"` ; `\blive\b` seulement dans la prose « No live data. » (design L401).
5. **`no_generate_metadata_in_apps_site`** — VERT. `export const metadata` statique.

## Fidélité (C-1) vs `MONARK.dc.html` [lu]
- **/console** (L390-404) et **/writing** (L407-421) : verbatim (y compris `—` et « No live data. » qui sont dans le design — l'honnêteté est native, pas inventée).
- **/integrators** (L425-438) : verbatim SAUF la carte Refusals.
- **Delta Refusals — ACCEPTÉ (pas une réserve).** Design « a forbidden key — a confidence, a score — throws… » → rendu « …throws — there is no confidence field, and no score, to send. » Forcé par le vocab-gate (`\bconfidence\b` bannit la formule même du design) ; sens préservé ; aligné sur l'invariant du design (« No confidence field, anywhere. »). **`error_origin` = source design** (la copy du design violerait le gate site), corrigé au portage — pas une faute worker.
- **Formes `<pre>` vs schémas gelés** : `apiRequest` = `Prediction.required` exactement (5, même ordre) ; `apiResponse` niveau haut = `GateDecision.required` (8, même ordre) ; `action` = miroir de l'enum réel ; `reason:'one of 13'` exact (enum reason = 13) ; `verdict` = sous-ensemble abrégé de CoverageVerdict ; `region:{kind,labels,label_schema}` = `region.oneOf[0]`. Byte-identique au design L731-733.

## Réserves (non bloquantes — owner + correction ; ne conditionnent pas le merge des 3 pages)
- **R1 — trou de couverture du gate `frozen_contract_fields_stay_dynamic`.** Le gate chargeait 3 contrats (AttestedPrice 9 + CoverageVerdict 12 + Prediction 5 = 21 noms) et **excluait les 6 champs propres de GateDecision** (`action/allow/tool/intent/verdict/remaining_budget`). `/integrators` est la **1ʳᵉ surface** à rendre la forme GateDecision → un futur nom de champ GateDecision codé en dur quoté passerait en silence. **Prouvé** (mutant B1 `"action"` VERT avant fold ; B2 `"alpha"` ROUGE). **Owner : F-site-8 lui-même (fold en passe — voir section delta).** `error_origin` = conception/outillage du gate (limitation pré-existante, non-worker).
- **R2 — comptage `grep-forbidden` dépendant de l'état de build.** La marche site scanne le `next-env.d.ts` généré/gitignoré (manque le skip `.d.ts` de ses jumeaux `honesty-lint.ts` et `siteSurfaces()`). 73 pré-build / 74 post-build, **résultat du gate inchangé (0)**. Explique l'écart de compte du G1 (pas une erreur de transcription). **Owner : F-site-8 (fold).** `error_origin` = outillage.

## Observations (résolues — info pour G7)
- **O1** : l'exemption `no confidence field` étant masquée par ligne, la phrase doit rester contiguë ; vérifié non-à-risque (aucun prettier/format dans le dépôt ; `lint` = `eslint .` sans `--fix`).
- **O2** : `alpha:0.1` = valeur d'exemple de forme (non rendue) ; accepté.

## Clôture (relecteur)
Aucune auto-déclaration. **G7 + `error_origin` + acceptation validateur-humain restent à l'orchestrateur** (R-21 / AgileGates). Assignations `error_origin` suggérées : R1 = conception/outillage ; R2 = outillage ; delta Refusals = source design.

---

## Section delta (siège orchestrateur/committeur sous **exception Opus-seat** = `claude-opus-4-8` ; le rôle orchestrateur au roster est Fable 5.1 — cette session commit sous exception datée 2026-09-07, précédent PR #1 — 2026-09-10) — fold R1/R2, relu par oracle R-21 + relecture fraîche du delta (checkpoint-2 K-4iii)
R1 et R2 corrigées **après** la revue G2 par un worker Opus 4.8 (R-20), puis **re-vérifiées par l'oracle R-21 de l'orchestrateur** (delta test + script uniquement, pas de code produit ; les 3 pages du lot ne sont pas modifiées) :
- **R1 — gate étendu** : `frozen_contract_fields_stay_dynamic` charge désormais `gate-decision.schema.json` (assertion de forme `count:8` conservée, par contrat, avant l'union). Sur les 6 champs net-new : **5 gatés** (`allow/tool/intent/verdict/remaining_budget`) + **`action` carve-out sur l'union finale** (`fields.delete("action")`). **Raison du carve-out** (décidée au **rebase sur le sim mergé**, sous consultation advisor) : `action` est le **nom propre de l'enum** de GateDecision ET un **mot commun**, présent en prose JSDoc `` `action` `` dans 4 fichiers du sim (`lib/gate-enums`, `lib/sim`, `gate-sim/diagram`, `gate-sim/index`) — de la documentation nommant l'enum gelé, **jamais** une liste de champs codée en dur ; un `"action"` isolé n'est pas de la list-drift (même esprit que `region`/`reason`, non quotés en prose donc jamais captés). Gater `action` ne produisait que des faux positifs (et F-site-4/5/7, qui montent le sim, en réintroduiraient à chaque rebase). Les 5 champs rares restants attrapent bien une liste hard-codée.
- **Exemption** : **1 seule** survit — `apps/site/lib/fleet.ts :: verdict` (clé produit MONARK Verdict = id de registre, PAS le champ GateDecision ; documenté dans le doc-comment `key` de `fleet.ts`). Garde **non-inerte** : une exemption dont l'occurrence disparaît rougit. L'exemption `agent-card.tsx :: action` du fold initial a été **supprimée** (rendue caduque par le carve-out `action`). Justification rectifiée (checkpoint-2 K-2) : un affinage **contexte-de-liste** défait le mutant (rejeté) ; mais un **scan AST des littéraux** string/template (l'outillage `ts.createSourceFile` est déjà utilisé par le gate `generateMetadata` dans le même fichier) NE le défait PAS — un `"remaining_budget"` injecté dans le CODE reste un `StringLiteral` → rouge, tandis que `` `action` `` en commentaire n'est pas un littéral → les occurrences JSDoc du sim tombent, restaurant `action` au gated set à zéro faux positif. Cet affinage AST est l'état final propre ; **différé** ici pour périmètre (**K-5, owner F-site-5**), non revendiqué impossible.
- **R2** : `scripts/grep-forbidden.mjs` saute les `*.d.ts` générés (aligné sur `honesty-lint.ts` et `siteSurfaces()`), compte stable **73** dans les deux états de build.
- **fleet.ts:43** : le doc-comment `key` (« never a frozen-contract field name »), rendu faux pour `verdict` par le chargement de GateDecision, a été corrigé (exception `verdict` documentée). C'est la seule auto-contradiction introduite par le fold.
- **Preuve mutant re-jouée par l'orchestrateur** (arbre rebasé sur main = 1eaf8a1) : arbre propre `npm run ci` **103/103** (frozen-fields VERT, les 4 hits `action` disparus) ; mutation lone `"remaining_budget"` injectée dans `apps/site/lib/sim.ts` → `frozen_contract_fields_stay_dynamic` **seul rouge** (`sim.ts :: remaining_budget`) → restauration byte-exact (`git diff` vide). Exemption list = 1 (`fleet.ts :: verdict`).
- **Oracle final** (rebasé sur main 1eaf8a1) : `npm run ci` 103/103, lint 0, ratchet 92/92, `next build` 0, lang site 0, vocab 0/73, `git diff main -- schemas/ packages/` 0 octet, **R-25 = 307** (base 1eaf8a1, pathspec CI ; le 243 du §R-25 du G1 est le compte pré-fold des 3 pages seules — voir l'addendum fold du G1).
- **K-3 (checkpoint-2)** : `alpha: 0.1` de l'exemple `apiResponse` de `/integrators` → `alpha: "the miscoverage level"` (descripteur, comme toutes les autres valeurs de la forme) : plus aucun chiffre de flotte rendu sur la page, cohérent avec le refus D1 des figures non sourcées.
- **K-6 (checkpoint-2, tracé PLAN §8)** : le gate K-4(b) de F-site-5 (`gate_sim_json_keys_subset_of_frozen_contracts`) est étendu aux formes `apiRequest`/`apiResponse` de `/integrators` (clés top-level = `required` dans l'ordre ; `verdict` ⊆ `CoverageVerdict.properties` ; mutant clé étrangère ⇒ rouge) — couvre l'observation « clés nues » → **owner F-site-5**.
- **error_origin** : R1/R2 = tooling (trou de gate pré-existant, non-worker) ; carve-out `action` = ajustement au rebase (pas une erreur) ; delta Refusals = source design ; fleet.ts:43 = mise en cohérence du fold.
- **Observation ouverte** : `/integrators` rend la forme GateDecision via **clés d'objet nues** (`JSON.stringify`), que le gate quoted-literal ne cible pas **par conception déclarée** — une dérive en clés nues sur cette surface resterait non captée (hors périmètre du gate ; noté).
