# G2 — Revue — Lot F-site-6 (Products & Fleet + VISAGE + Mod #1 + β Verdict)

> Rapport du relecteur G2, **instance séparée à contexte frais ≠ générateur** (AgileGates C-3). Matérialisé au dépôt par l'orchestrateur (correction K-1 du checkpoint-2, patron F-site-8). Verdict G2 : **PASS**.

## Gate 0 (R-1) — relecteur
- **Modèle résolu** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` ; **pas** `claude-opus-5` banni), effort max. **Instance fraîche ≠ générateur.**
- **R-20** : 0 commit, 0 workflow ; seules écritures = 2 mutants temporaires restaurés byte-exact (sha avant==après) ; `git status --porcelain` identique avant/après.
- Base de revue : worktree `F:\Monark-wt-fsite6` (lot non committé au moment de la revue, base 855e61f) ; oracle **préliminaire**, R-21 orchestrateur re-joué post-rebase (104/104, ci-dessous).

## 1. C-8 (Mod #1) — ancrage 11/11 [chaque ligne ouverte dans l'ADR]
| # | Agent | Point Built | Ancrage ADR [lu] | ✓ |
|---|---|---|---|---|
| 1 | Shōgen | Cryptographic attestation: verified testimony, emitted only after a passing verdict | M001 L68 (`Ok(Verdict)`) + L86 (`attestor{identity,key:hex}`) | ✓ |
| 2 | Shōgen | Recomputable byte hashing | M001 L69/L91 (`octets_recalcules`) + L89 (`hash:hex32`) | ✓ |
| 3 | Shōgen | Named residual hypotheses (transport) | M001 L79-80 + L87 (`residual:string[]`) | ✓ |
| 4 | Hikae | Conformal prediction (split-conformal) | M002 L94/L98/L102-103 (Barber 2020) | ✓ |
| 5 | Hikae | Finite-sample marginal coverage under exchangeability | M002 L107-108 | ✓ |
| 6 | Hikae | Closed gate policy → commit/defer/abstain over region+budget | M001 L131-136 + M002 L136-141 + M003 L77 | ✓ |
| 7 | Hikae | Online monitoring of the remaining risk | M002 L113-114 | ✓ |
| 8 | Ukemi | Network clearing fixed point (Eisenberg–Noe) | M002 L188 + M001 D6 L159-165 | ✓ |
| 9 | Ukemi | Fictitious-default sequence (each node pays what it can, in rounds) | M002 L189 + L289 | ✓ |
| 10 | Ukemi | Recovery rates α, β and contagion amplification | M003 L46/L128 (α,β Rogers-Veraart) + L79 (« déclarée, non fondée ») + M002 L196 | ✓ |
| 11 | Ukemi | Conformal interval for the cascade, conformed by the gate | M003 L77 (D6.1) + M002 L184 | ✓ |

**Clause retirée confirmée** : le draft Mod #1 portait « & signature verification » (Shōgen p.1) ; grep `apps/site` = aucune occurrence rendue ; retrait correct (C-8 « ancrage ou retrait » ; grep M001 : « signature » = bit de signe / commits signés, aucune décision de vérif. de signature). **Aucune revendication de calibration Ukemi** (α,β = technique nommée ; M003 L79 « déclarée, non fondée »). *(Note checkpoint-2 : le point 10 rend le libellé investisseur validé « α, β » — un restatement « external/interbank assets » a été écarté car non ancré à une ligne d'ADR au sens strict de C-8.)*

## 2. VISAGE (C-7)
`test/visage-register.test.ts` épingle 3 VISAGE `upcoming`, compte global 16 (13 fleet-upcoming + 3), `FLEET_AGENTS.length+PRODUCTS.length==16`, numeric-hole sur chaque chaîne rendue, 19 entités.
- **Mutant A** (Attestation `upcoming`→`built`) : `node --test` **EXIT 1**, `AssertionError: visage MONARK Attestation must be upcoming` ; sha256 `visage.ts` avant `169e04e1…` == après restauration. ✓
- `visage_register_is_frozen` + `fleet_register_built_set_is_frozen` verts. Copie VISAGE = restatement fidèle de la décision uid 28b02686 (The File/Seal/Trigger + acheteurs).

## 3. β Verdict
Couche **panneau** (`fleet-presentation.ts`) : Verdict → « Mokugeki attests the event; Kamae quotes from inventory (Avellaneda-Stoikov) » — conforme décision β. Couche **registre** (`fleet.ts`) : Verdict reste **générique** (aucun agent-moteur nommé). Le nommage β vit en présentation seule. ✓

## 4. Honnêteté
- **test 44** vert (0 littéral numérique rendu). **Mutant B** (injection « 72 ») : EXIT 1, `AssertionError: … carries a rendered numeric literal: ["72"]` ; sha `fleet-presentation.ts` avant `f6121e95…` == après. ✓
- `frozen_contract_fields_stay_dynamic` vert ; VISAGE rend « the gate's decision » ; « commit/defer/abstain » en prose seulement, jamais littéral de champ. 0 mot proscrit (vocab, commentaires inclus ; noms de méthodes autorisés). Anglais (lang site 0). Jamais `live` (2 occurrences = commentaires). Comptes en lettres (« three built, eight on the roadmap » ; « 16 » non rendu).

## 5. Fidélité design + Mod #1 [lu, MONARK.dc.html Products L264-297 / Fleet L300-330]
Structure conforme (labels, H1, intros, badges). Aucun retrait non déclaré. Déviations déclarées jugées ACCEPTABLES : (a) 8 agents upcoming → panneaux ouvrables (imposé par Mod #1 L8 « TOUS les produits/agents » ; le design a des `<div>` non ouvrables) ; (b) `UpcomingPanel` partagé → « What it will use » visible aussi sur Home (Mod #1 L30, périmètre « TOUS les produits »). Inversion Softlanding↔Firebreak du design NON portée (`fleet.ts` fait foi). « Core products » repeuplé par les VISAGE (décision uid 28b02686) au lieu des blurbs CORE du design (inversés).

## Oracle (R-21 orchestrateur, post-rebase sur main 3b1fb05 = gate durci)
`npm run ci` **104/104** (visage_register_is_frozen + frozen_contract_fields verts) ; `lint` 0 ; `lint:ratchet` 92/92 ; `next build` 0 (`/products`+`/fleet` static) ; `lang-gate --scope site` 0 ; `grep-forbidden` 0 ; `git diff main -- schemas/ packages/` 0 octet ; `fleet.ts` byte-identique ; **R-25 615** < 1205 (three-dot/merge-base ; max fichier `fleet-presentation.ts` 137).

## Verdict
**G2 — PASS.** C-8 11/11 ancré (point 10 réancré au libellé investisseur « α, β » au checkpoint-2) ; VISAGE test + mutant A ; test 44 + mutant B ; β en couche panneau ; `fleet.ts` intact ; fidélité conforme, déviations imposées par Mod #1. G7 + `error_origin` + acceptation validateur = orchestrateur (R-21).

## Addendum checkpoint-2 (orchestrateur, 2026-09-10)
- **Correction 2 appliquée** : point Ukemi #10 réancré `« Recovery rates for external and interbank assets »` → **`« Recovery rates α, β and contagion amplification »`** (libellé investisseur validé 2026-09-09, ancré M003 L46/L128). ci re-vert.
- **Correction 4 (shogen-panel L57-58 « the attestor signed it »)** : conservé — copie pré-existante F-2b, **ancrée M001 L86** (`attestor{identity, key:hex}` : un attesteur porteur de clé signe le témoignage). Pas une réintroduction de « signature verification » (qui était une DÉCISION de vérification, absente des ADR) ; c'est la description de l'attesteur, sourcée. Cohérence intra-panneau : le bloc « What's inside » ne contredit pas cette phrase (l'attestation EST signée par un attesteur à clé ; ce qui a été retiré = la revendication d'un ÉTAGE de vérification de signature).
- **error_origin (G7)** : n/a niveau lot (implémentation conforme au contrat ; aucun défaut résiduel de code). Ligne de journal campagne F-site-6 consignée à la PR de gouvernance (rattrapage journal, owner orchestrateur).
