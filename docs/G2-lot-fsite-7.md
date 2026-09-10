# G2 — Revue — Lot F-site-7 (Roadmap & Token)

> Rapport du relecteur G2, **instance séparée à contexte frais ≠ générateur** (AgileGates C-3). Matérialisé au dépôt par l'orchestrateur (correction K-1 du checkpoint-2, patron F-site-8). Verdict G2 : **PASS**.

## Gate 0 (R-1) — relecteur
- **Modèle résolu** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` ; pas `claude-opus-5` banni), effort max. **Instance fraîche ≠ générateur.**
- **R-20** : 0 commit, 0 workflow, 0 fichier de lot modifié en net ; unique écriture = mutant test-44 temporaire, restauré byte-exact (sha avant==après `708fb556…`).
- Base de revue : `d8b63c4` (= lot-fsite3) ; oracle **préliminaire**, R-21 orchestrateur re-joué post-rebase sur main 3b1fb05 (gate durci) = 103/103.

## Point 1 — Tokenomics / plancher securities (le point sensible) : **CONFORME** (vérifié ligne à ligne)
Fichier `apps/site/app/token/page.tsx` vs `DESIGN-MODS-MONARK.md` Mod #2 :
- L82 « mechanics under design — details to be announced » = Mod #2.
- L86 « Stakers get discounts on the products they use. »
- L89-91 « Skin in the game to act — … slashed (to the party it harmed, a burn, and the watcher who proved it — never to the company). »
- L94-95 « Watchers earn for catching a faulty commit; fault is proven by recomputing the frozen decision. »
- L100-101 « staker reward mechanism is under design — useful staking, tied to the fleet's work, not a passive payout. »
- « It is not » (L60-63) : `a yield · idle staking · an oracle · a probability of being right` — design L365 avait `a stake` → **« a stake » retiré, « idle staking » ajouté** (réconciliation Mod #2), yield/oracle/probability conservés.
- Supply/distribution/replenishing B_t (L110-113) → **« to be announced »** (seul le staking sort du TBA).
- **Preuve** : grep `%|[0-9]|profit|APY|APR|return|dividend|yield|payout|share` → chaque hit yield/profit/payout est une **dénégation** ou un **commentaire** ; chaque `[0-9]` est un `className` ou une réf de commentaire. **0 chiffre de tokenomics rendu, 0 promesse de rendement/part de bénéfices.** Profit-share non publié (commentaire seulement). → **Aucun défaut securities.**

## Point 2 — R4 (une seule source de vérité) : **CONFORME**
`token/page.tsx` L5 `import { COST, AMBIENT } from "@/lib/sim"` ; L71 `<GateSim mode="token" … cost={COST} …/>`. `index.tsx` rend `Each commit spends {cost.toFixed(2)} of B_t` via la prop `cost` ; `sim.ts` `decide()`/`applyDecision()` dépensent la **même** const `COST`. Premier montage réel du sim : `next build` 0, `/token` static, grep `.next/static` pour `readFileSync|loadGateEnums|node:fs` = 0 (server-only non fui).

## Point 3 — Roadmap sans chiffre : **CONFORME**
`Phase zero/one/two`, `Layer one..four` (mots) ; corps Phase one « closed under independent review and a closing verdict » (aucun `G\d` rendu). `honesty-lint.exempt.json` byte-identique (aucune exemption ajoutée ; garde d'inertie C-6 = owner F-site-4).

## Point 4 — Honnêteté : **CONFORME**
**test 44** vert. **Mutant** (`Phase zero`→`Phase 0`) → EXIT 1, `[{"file":"…/roadmap/page.tsx","line":86,"token":"0"}]` → restauré `708fb556…`. Champs de contrat gelés jamais quotés (`remaining_budget`/`budget_exhausted`/commit/defer/abstain en texte JSX nu) ; `frozen_contract_fields_stay_dynamic` vert. 0 mot proscrit (vocab, commentaires inclus). Anglais (lang site 0). Jamais `live`.

## Point 5 — Fidélité : acceptable (2 résidus pré-attribués)
Design Roadmap L335-353, Token L358-385. Roadmap augmenté (layers + phase-cards + sections built/upcoming conservées sous les layers) ; duplication LAYERS home↔roadmap **champ-par-champ identique** (aucune auto-contradiction). Écart « Dates appear only where a phase has actually closed » coupé (plus honnête, aucune carte ne rend de date).

## Oracle (R-21 orchestrateur, post-rebase main 3b1fb05)
`npm run ci` **103/103** ; `lint` 0 ; `lint:ratchet` 92/92 ; `next build` 0 (`/roadmap`+`/token` static) ; `lang-gate --scope site` 0 ; `grep-forbidden` 0 ; `git diff main -- schemas/ packages/` 0 octet ; **R-25 271** < 1205.

## Verdict
**G2 — PASS.** Tokenomics = Mod #2 verbatim, plancher securities tenu (0 chiffre, 0 rendement). R4 une source. Roadmap digit-free. G7 + error_origin + validateur = orchestrateur.

## Addendum checkpoint-2 (orchestrateur, 2026-09-10)
- **error_origin (G7)** : le blocker D-3 (`G2/G7` → `2/7` rougissaient test 44) attrapé + corrigé dans la passe ; **origine = spec design** (la copie du design portait les littéraux). Aucun défaut résiduel worker.
- **Résiduel D-1 (roadmap↔fleet)** — assigné : F-site-6 (mergé dans la même séance) rend les 8 agents upcoming sur `/fleet` ; les sections built/upcoming de `/roadmap` deviennent redondantes et le « Built » de /roadmap renvoie vers `/#fleet` (home) non `/fleet`. **Owner : micro-lot de nettoyage post-vitrine** (retirer les sections de `/roadmap` ou repointer vers `/fleet`) — tracé, non dette nue.
- Ligne de journal campagne F-site-7 consignée à la PR de gouvernance (rattrapage journal, owner orchestrateur).
