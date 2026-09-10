# G2 — Revue — Lot F-site-3 (Le sim interactif du gate)

> Rapport du relecteur G2, **instance séparée à contexte frais ≠ générateur** (AgileGates C-3). Matérialisé au dépôt par l'orchestrateur au titre de la correction **K-1** du checkpoint-2 (précédent F-2a R2 : matérialisation → `error_origin` orchestrateur). Le contenu est le rapport rendu par le relecteur ; la **section delta** en fin de doc couvre les +43 lignes du test R1 ajoutées **après** cette revue (relues par l'oracle R-21 de l'orchestrateur, précédent F-2b tour 3).

## Gate 0 (R-1) — contrôle de résolution
- **Modèle résolu tel quel** : `claude-opus-4-8[1m]` — préfixe `claude-opus-4-8` conforme (**pas** `claude-opus-5` banni). Effort `max`.
- **Rôle** : RELECTEUR G2, instance fraîche ≠ générateur. Rien committé, aucun fichier du lot modifié, aucun workflow déclenché. Seule écriture disque = le mutant C-9 sur `schemas/gate-decision.schema.json` (hors lot, explicitement mandaté), restauré byte-exact (preuve ci-dessous).

## Worktree
`F:\Monark-wt-fsite3`, branche `lot-fsite3`, HEAD `6ce8dae`, **merge-base avec main = 855e61f = main** (rebase confirmé). `git status` propre au moment de la revue.

## Oracle indépendant (exit codes réels, mesurés 2026-09-10)
| Commande | Exit | Preuve |
|---|---|---|
| `npm ci` | 0 | added 276 packages, 0 vulnerabilities |
| `npm run ci` (`gate:vocab && typecheck && test`) | 0 | **tests 102 / pass 102 / fail 0** |
| `npm run lint` (`eslint .`) | 0 | clean |
| `npm run lint:ratchet` | 0 | **92/92** |
| `(cd apps/site ; npx next build)` | 0 | « Compiled successfully » ; routes `/`, `/_not-found`, `/roadmap` ; le sim n'est monté nulle part (conforme) |
| `node scripts/lang-gate.mjs --scope site` | 0 | 0 hit français, scope site `[GATED]` |
| `node scripts/grep-forbidden.mjs` | 0 | aucun mot proscrit (texte brut, commentaires compris) |
| `git diff main -- schemas/ packages/` | 0 octet | vide |

Tests d'honnêteté cibles verts (extraits) : `site_renders_only_committed_data (b)` (test 44), `frozen_contract_fields_stay_dynamic`, `no_coverage_level_alpha`, `gate_action_enum_order_is_frozen` (C-9), `gate_sim_rendered_labels_have_no_numeric_hole` (C-4), `contracts_frozen`.

### R-25 (au moment de la revue)
`git diff --numstat main HEAD`, exclusions `docs/G1-*`, `docs/G2-*`, `package-lock` → **1088** lignes : controls 167 + diagram 205 + index 198 + meter 36 + use-gate-sim 152 + gate-enums 51 + sim 236 + `ci-gates.test.ts` +43 = 1088 < 1205. Chaque fichier < 1205. (Compte final post-corrections : voir le G1, mesuré à la clôture.)

## Mutant C-9 — sole-red prouvé, restauré byte-exact
- sha256 `schemas/gate-decision.schema.json` avant : `9434bf4cb768f80c0f7774936386f1318a712746c1ec603eeeedfcfe055a3e6a`.
- Mutation : enum `action` `["commit","defer","abstain"]` → `["commit","abstain","defer"]`.
- `node --test test/ci-gates.test.ts` isolé : **EXIT=1**, **seul** rouge = `gate_action_enum_order_is_frozen` (« action enum order changed (schema drift) »). Les 3 autres gates cibles restent verts sous mutation → C-9 est le seul détecteur du réordonnancement.
- Restauration : sha256 après = avant → **byte-exact**. `git diff main -- schemas/` = 0 octet.

## Cibles adversariales 1–7 (synthèse)
1. **Sim « vert par construction » — CONFORME.** Le détecteur `honesty-lint.ts` `renderedLiterals` ne descend que dans littéraux string/number/template + concat/ternaire/parenthèses ; accès-élément (`actions[i]`), accès-propriété, appels (`gateJson(...)`, `.toFixed(2)`) ne contribuent rien. `VISIBLE_ATTRS = {alt,title,aria-label,placeholder,label,value,content}`. Chaque nombre des `.tsx` est en position non rendue (objets `style`, `key={i}`, géométrie SVG, `viewBox`, sliders `min/max/step`) ou état calculé / const module (`sim.ts`). Live : `site_renders_only_committed_data (b)` vert (a walké `gate-sim/*.tsx` + `lib/sim.ts` + `lib/gate-enums.ts`). Observation acceptée : `meter.tsx:17-18` `aria-valuemin={0}`/`aria-valuemax={1}` = bornes de domaine vraies du meter B_t ∈ [0,1], hors `VISIBLE_ATTRS` — pas une donnée fabriquée.
2. **`abstain` non-littéral — CONFORME.** `rg "['\"`]abstain['\"`]"` sur `apps/site` → aucun match. Résolution par **index** depuis l'enum chargé (`ACTION_ABSTAIN=2`) ; dans `gateJson` la clé `abstain:` est un identifiant nu. `abstain` ∈ `CoverageVerdict.required` → un littéral quoté rougirait ; aucun.
3. **Caveat + clause α — CONFORME.** Caveat unique rendu en **board (index.tsx:64/66)**, **token (:118/120)** ET **explainer (:194/196)**. Clause α (:189-193) : « target miscoverage level (coverage is one minus α), not a probability that this region is right » — jamais « coverage level α ». `no_coverage_level_alpha` vert. Renforcement d'honnêteté vs design (qui n'affiche le caveat qu'au token, `MONARK.dc.html:377`) — conforme ADR-M004 D15.
4. **0 p_correct/confidence/score ; anglais ; 0 mot proscrit (commentaires inclus) — CONFORME.** « confidence »/« score » n'apparaissent que dans la prose de démenti pré-existante (hors lot). `grep-forbidden` exit 0 ; `lang-gate --scope site` exit 0.
5. **C-9 — CONFORME.** `gate_action_enum_order_is_frozen` épingle `deepEqual(actions,["commit","defer","abstain"])` + `reasons.length===13` + `actions[ACTION_ABSTAIN]==="abstain"` (index importé de `sim.ts`). Mutant sole-red (ci-dessus).
6. **Frontières RSC — CONFORME (limite déclarée).** `sim.ts` : aucun import (client- ET server-safe). `gate-enums.ts` porte `node:fs`/`node:path` (server-only) et n'est importé par aucun `gate-sim/*` → non bundlé client. Les 5 `gate-sim/*` portent `"use client"` en ligne 1. `next build` vert. Limite : le sim n'étant monté nulle part, la preuve de bundling repose sur le grep statique ; preuve de bundling **due au premier montage** (tracée à F-site-4, cf. réserves).
7. **4 choix douteux — tous ACCEPTABLES** : (1) COST module vs prop `cost` → réserve R4 ; (2) board auto / explainer+token manuels → fidèle (le design a un bouton manuel `homePush` au token, `MONARK.dc.html:376`) ; (3) type `GateAction` dérivé du loader (→ `string`) → correct (une union littérale épellerait « abstain » et rougirait) ; (4) « abstain » dans un `aria-label` (prose non-quotée) → doctrine établie gate-verte (mots-de-champ en prose acceptés, seuls les littéraux quotés bannis).

## Réserves
**Bloquantes : aucune.**

**Non-bloquantes (chacune avec correction minimale — zéro dette nue) :**
- **R1** — vocabulaire des raisons non épinglé à l'enum chargé : aucun test n'assure que les codes émis par `decide()` (`covered`, `set_too_large`, `intent_not_in_region`, `budget_exhausted`, `upstream_timeout`) ∈ `loadGateEnums(ROOT).reasons`. Vérifié à la main : les 5 ∈ l'enum → aucun défaut vivant. Correction : assertion pilotant `decide()`, l'ensemble des codes émissibles ⊆ `reasons`. **→ Corrigée en passe (voir section delta).**
- **R2** — clôture numeric-hole (C-4) plus étroite que D15 : le scan couvre `SENSOR_NODES[].label` + `AMBIENT[].intent` mais le sim rend aussi les libellés de région et les codes-raison (aucun chiffre aujourd'hui). Correction : plier codes-raison + vocabulaire de région dans le scan frère. **Owner unique : F-site-5.**
- **R3** — fidélité : explainer et token haute-fidélité ; le mode `board` livré est un SVG bespoke ≠ le card-pipeline du design → réconcilier au montage Home. L'explainer omet « Classification task, label schema up|down » et le démenti « no p_correct/confidence/score ». **R3a (board) owner F-site-4 ; R3b (démenti How) owner F-site-5.**
- **R4** — deux sources de vérité pour le coût illustratif (const `COST` vs prop `cost`). Correction : montages passent `cost={COST}` ou importent `COST`. **Owner unique : F-site-7.**
- **R5** — présence caveat/clause-α non épinglée par un gate (vérifiée par revue, pas automatisée). Correction : garde de présence au montage. **Owner unique : F-site-4.**
- **R6** — nits (artefacts worker) : (a) `docs/G1-lot-fsite-3.md` base `5db169f`→`855e61f` ; (b) commentaires « never a literal » trop larges (`diagram.tsx`, `index.tsx`) → « never a **quoted** literal ». **→ Corrigées en passe (voir section delta).**

## Verdict
**G2 — PASS-AVEC-RÉSERVES.** Tous les gates d'honnêteté et l'oracle indépendant verts (102/102, exit 0 partout) ; mutant C-9 sole-red + restauré byte-exact ; `schemas/`+`packages/` intacts ; frontières RSC statiquement propres ; `decide()` et les montages explainer/token fidèles au design [lu]. Les 6 réserves sont non-bloquantes, chacune avec sa correction minimale. **Rien ne bloque le merge.** G7 + `error_origin` + acceptation validateur-humain restent à l'orchestrateur (R-21).

---

## Section delta (orchestrateur `claude-opus-4-8`, 2026-09-10) — corrections post-G2, relues par oracle R-21
Trois réserves ci-dessus ont été corrigées **après** la revue G2, par un worker Opus 4.8 (R-20, ne committe pas), puis **re-vérifiées par l'oracle R-21 de l'orchestrateur** (l'oracle non-LLM est la relecture de ces +43 lignes, précédent F-2b tour 3 — un ajout de test + commentaires, pas de logique produit) :
- **R1 → gate ajouté** `sim_emitted_reason_codes_subset_of_frozen_enum` : pilote `decide()` (fonction exportée, seul émetteur) sur ses 5 branches, collecte les codes-raison émis, assert `⊆` enum `reason` gelé (13 valeurs), garde `size===5`. **Mutant re-joué par l'orchestrateur** : baseline exit 0 → mutation `sim.ts` L143 `reason:"covered"`→`"covered_XX"` → exit 1 (test R1 **seul** rouge, `AssertionError … covered_XX`) → restauration `cp` → exit 0 ; sha256 `sim.ts` avant=après `f7ad2bc8…f724858` ; `git diff -- apps/site/lib/sim.ts` vide. sha256 `test/ci-gates.test.ts` final `08e6a61d…08ffb6`.
- **R6b** : commentaires `index.tsx` L9 + `diagram.tsx` L4 reformulés « never a literal » → « never a **quoted** literal, jamais en position machine-consommée sensible à la dérive ; la prose d'aria-label = position acceptée gate-verte » (commentaires seuls).
- **R6a** : base `main` du G1 corrigée `5db169f`→`855e61f` (+ label : 855e61f = F-site-2/PR #20).
- **Oracle final** (arbre corrigé) : `npm run ci` **103/103**, lint 0, ratchet 92/92, `next build` 0, lang site 0, vocab 0, `git diff main -- schemas/ packages/` 0 octet, R-25 mesuré à la clôture (voir G1).
- Réserves restantes R2/R3a/R3b/R4/R5 tracées PLAN §8 avec **owner unique**. `error_origin` : R6a = worker-G1 (défaut factuel de provenance, corrigé) ; R1–R5 = compléments de spec / concerns au montage (pas des erreurs).
