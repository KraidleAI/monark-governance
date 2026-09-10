# G2 — Revue — Lot F-site-4 (Home)

> Rapport du relecteur G2, **instance séparée à contexte frais ≠ générateur** (AgileGates C-3). Matérialisé au dépôt par l'orchestrateur (correction K-1, patron F-site-8). Verdict G2 : **PASS-AVEC-RÉSERVES** (owner unique, non bloquantes).

## Gate 0 (R-1) — relecteur
- **Modèle résolu** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` ; pas `claude-opus-5` banni), effort max. **Instance fraîche ≠ générateur.**
- **R-20** : 0 commit, 0 workflow, 0 fichier du lot modifié durablement (3 mutants temporaires restaurés byte-exact, sha256 avant==après). Base de revue `b9d7f43` ; oracle préliminaire, R-21 orchestrateur re-joué post-rebase sur main ae33043 (107/107).

## Les 7 points adversariaux — tous confirmés
1. **Board = SIM RÉEL** ✓ : `index.tsx` `useGateSim("board", ambient)` → `<EngineBoard>` ; chips = `actions.map((word,i))` par **index** (jamais littéral) ; mètre = `state.budget`. Aucun `bt/12` factice (le 12 = densité de barres). Bundle client unique.
2. **R5 caveat** ✓ : garde `gate_sim_caveat_present_in_all_mounts` ; CAVEAT (« illustrative » + « not market activity ») rendu board + explainer + token. **Mutant** (retrait `{CAVEAT}` du board) → sole-red, restauré `c74d897…`.
3. **K-2** ✓ : (i) inertie C-6 (`honesty_exempt_entries_have_rendered_carrier`) — mutant inert `"99"` → sole-red ; mutant chiffre nu `"5"` → sole-red ; load-bearing sous exempt vide. (ii) bundling : `next build` 0, `/` static, `grep node:fs|readFileSync|loadGateEnums .next/static/chunks` = vide (gate-enums server-only).
4. **Exemptions 01-04** ✓ : fermées, non-figures, porteurs exactement rendus (thesis `01/02/03` + eyebrows board `04/03/02`) ; ordinaux picker via `String(n).padStart` (CallExpression → invisible au détecteur).
5. **Picker E-1** ✓ : 8 profils identiques à DESIGN-MODS E-1 ; engineKeys sourcés (Mod #1 + β) ; 5 doigts → produits réels `fleet.ts PRODUCTS`, 3 visage nommés+liés `/products`. Aucun contenu inventé. `productKey:"verdict"` = id produit (exempté au gate durci, cf. addendum).
6. **Honnêteté** ✓ : test 44 vert ; copie non sourcée du design absente (`need/via/hidden/cheque`, « best venue ») ; `abstain|commit|defer` jamais quotés ; « no confidence field » (exemptPhrase) porté ; anglais 0 ; « live » seulement en commentaires ; teaser token « not idle staking » = Mod #2 ratifié.
7. **Fidélité design** ✓ : `data-screen-label` = Home hero / Engine board / Home thesis / Home token. `#fleet` gardé (pont F-site-6/7), cartes board display-only, plomberie CSS — acceptables.

## Oracle (R-21 orchestrateur, post-rebase main ae33043 = gate durci)
`npm run ci` **107/107** (frozen-fields + caveat-presence + C-6-inertie verts) ; `lint` 0 ; `lint:ratchet` 92/92 ; `next build` 0 (`/` static) ; `lang-gate --scope site` 0 ; `grep-forbidden` 0 ; `git diff main -- schemas/ packages/` 0 octet ; **R-25 846** < 1205 (max fichier `board.tsx` 422).

## Réserves (owner unique — non bloquantes, résolutions formées)
- **R1** — badge `status="built"` codé en dur sur la carte Adapter (`board.tsx`) : claim VRAI et **sourceable** (`packages/monark/src/adapter-shogen.ts`, `ADR-M003` L56, `packages/contracts/src/types.ts`) mais (a) non sourcé au G1, (b) échappe à `fleet_register_built_set_is_frozen` (ne scanne que [roadmap, upcoming-panel]), (c) fallback `?? "built"` fail-open. **Résolution** : sourcé au G1 (addendum) ; gate d'appartenance des badges board + fail-safe → **micro-lot gate-refinement post-vitrine** (owner nommé PLAN §8).
- **R2** — jointures de registre non gardées (`productKey→PRODUCTS.key`, `engineKeys→presentation.key`, `name→AGENTS_PRESENTATION`) : correct aujourd'hui (5 productName == PRODUCTS.name), aucun test ne verrouille. **Résolution** : ~8 assertions → **micro-lot gate-refinement** (owner PLAN §8).
- **R3** — liens `/products`/`/token` : **résolu** — F-site-6 (/products,/fleet) et F-site-7 (/token) sont désormais mergés sur main ; les routes existent. Plus de lien mort.

## Verdict
**G2 — PASS-AVEC-RÉSERVES.** Board = sim réel, R5/K-2/exemptions/picker/honnêteté/fidélité verts. R1/R2 = robustesse de gouvernance (contenu rendu honnête), tracés au micro-lot ; R3 résolu par les merges 6/7. G7 + error_origin + validateur = orchestrateur.

## Addendum checkpoint-2 (orchestrateur, 2026-09-10) — corrigé
- **profiles.ts::verdict** ajouté à l'exemption fermée non-inerte du gate `frozen_contract_fields_stay_dynamic` (id produit du picker E-1 = même id registre que `fleet.ts`, pas le champ GateDecision). ci 107/107 vert.
- **C1 (BLOQUANT, corrigé)** — le badge `status="built"` de la carte **Adapter** (`board.tsx` L307) était une **FAUSSETÉ RENDUE**, pas de la robustesse tooling : l'adaptateur n'est PAS bâti (`packages/monark/src/index.ts` = stub Phase 0 `MONARK_PHASE="0-skeleton"` ; `adapter-shogen.ts` **n'existe pas** ; ADR-M003 L56 = plan G0, adaptateur en Phase 2). Ma première lecture (et le G2) l'avaient à tort déclaré « sourceable » — **erreur attrapée par le checkpoint-2**. **Corrigé** : `status="upcoming"` (honnête — l'adaptateur est spécifié, non livré). error_origin = **worker** (badge codé en dur faux) + **miss relecteur G2** (source affirmée sans vérifier l'existence du fichier).
- **C2 (BLOQUANT, corrigé)** — attribution VISAGE→moteur neutralisée : `profiles.ts` visage `engineKeys: []` (le design CORE shogen/hikae/hikae a un sens **rejeté par l'investisseur** 2026-09-09 ; F-site-6 rend « no engine named ») ; aside Home sans nom de moteur (`visageEngine` supprimé). Home ne revendique plus de moteur non ratifié pour les 3 visage.
- **ESCALADE-INVESTISSEUR** (non bloquante, posée à l'investisseur) : Home doit-il éclairer un moteur pour les 3 profils VISAGE, et lequel (Attestation→?, Hallmark→?, Threshold→?) ? En l'absence de ratification, engineKeys vides (backbone seul).
- **R1 résiduel (durcissement) + R2 → micro-lot gate-refinement post-vitrine** (PLAN §9) : le badge est corrigé ; ce qui reste = gate d'appartenance des badges board (fail-safe sur L328 `?? "built"`, L390 `status="upcoming"` codé en dur à lire du registre) + assertions de jointures. Ce sont des durcissements, plus aucune fausseté vivante.
- **error_origin (G7)** : C1 = worker + miss G2 (fausseté rendue, corrigée avant merge) ; R2/durcissement R1 = tooling. Ligne journal campagne → PR de gouvernance.
