# G2-DELTA — Bell -b3d-b1a, pli `f2f8808` (2 lignes de source `rebase-crosscheck.ts:566-567`) — VERDICT : PASS

Relecteur G2 repris (régime B, même instance séparée `claude-opus-4-8`, lecture seule, mutants sur `git archive f2f8808`, restauration byte-exacte). Verbatim récupéré par l'orchestrateur depuis le transcript du sous-agent (`.output` non persisté ; note outillage CHANTIERS). Ce G2-delta satisfait la correction **C-V-2** du checkpoint-2 (relecture séparée des 2 lignes livrées).

---

Delta verified. Both mutants behaved exactly as predicted; the `existsSync`-removed neighbor reds the fresh-strict tests, proving `existsSync` is load-bearing; restore byte-exact.

**Contrôle R-1** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8`).

# G2-DELTA -b3d-b1a (pli `f2f8808`) — VERDICT : PASS

Source modifiée (2 lignes), `apps/bell/src/rebase-crosscheck.ts:566-567`, lecture seule ; mutants sur archive `git archive f2f8808` (head2), restauration byte-exacte OK ; worktree intact.

**(1) Table des 4 cas — forme JUSTE sur les 4.** Garde `requireFullPages && existsSync(budget.json) && prior.requireFullPages !== true` :
- `true` → pas de throw (reprise stricte-sur-stricte OK) ; `false` (+budget.json) → throw (stricte-sur-lâche refusée) ; `undefined` SANS budget.json → `existsSync` faux → pas de throw (run FRAIS — correct) ; `undefined` AVEC budget.json → throw (ITEM-C fermé). L'écart déclaré `=== false → !== true` **nu** serait FAUX (un run stricte frais jetterait) : l'`existsSync` est nécessaire — PROUVÉ par le voisin ci-dessous.
- **`existsSync` non trompable** : budget.json présent mais **vide/corrompu** ⇒ `readPriorBudget` (`:561`, AVANT la garde) et `readPriorCalls` (amont) font `JSON.parse` ⇒ **fail-closed en amont** (jamais un bypass) ; `{}` ⇒ readPriorCalls throw « malformed » ; **`--out` différent** ⇒ run frais légitime (pas de ledger lâche à méfier) ; **casse** ⇒ écrivain et lecteur portent le littéral `budget.json` (Windows insensible) ⇒ non trompable. Résidu (hors périmètre, = classe ITEM-A) : un éditeur MALVEILLANT de `--out` peut forger `require_full_pages:true` sur un ledger lâche ; la garde vise le mismatch ACCIDENTEL.

**(2) Garde AVANT `writeBudget`** (`:571`, définie 5 lignes plus bas) — confirmé ; un throw n'écrit pas `budget.json` (déjà PROBE6).

**(3) Mutants (attendus exacts)** : **M-G2-C** (`!== true`→`=== false`) ⇒ `…require_full_pages_absent_strict_resume_refused` **ROUGE**, `…require_full_pages_mode_guard` **VERT** (pass 1/fail 1). **Voisin `existsSync` retiré** ⇒ **ROUGE** sur `…full_boundary…`, `…short_nonfinal…`, `…transient_token_heals…` (les runs stricts FRAIS jettent ⇒ `existsSync` porteur). Baseline : 5/5 verts (les 4 tests neufs C-G2-1/2/3 + ITEM-C + mode_guard), fichier crosscheck **48/48**.

**Corrections C-G2D : AUCUNE.** Le delta ferme ITEM-C proprement ; l'écart de forme est justifié et testé. `error_origin` du défaut d'origine (garde `=== false` nue, champ absent non capté) : **worker G1** (relevé G2 ITEM-C, corrigé ce pli). R-20 respecté (je ne committe pas).
