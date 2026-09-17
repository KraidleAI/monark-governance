# G2 — Revue du Lot M012-a (gouvernance + textes d'honnêteté, ADR-M012)

- **Relecteur** : instance FRAÎCHE **`claude-opus-4-8[1m]`** (R-1), ≠ générateur, 2026-09-17. Lecture seule ; mutants exercés par
  les fonctions exportées de `scripts/grep-forbidden.mjs` (les motifs sont scopés : la CLI sur un fichier scratch n'applique que
  les motifs globaux — déviation de méthode déclarée, logique identique). Arbre intact.
- **Cible** : `gate.ts` sha `8a1a10e7…` ✓ ; `vocab-banned.json` `d6adaaf6…` ✓ ; `tracker.ts` = HEAD `37db3331…` ✓ ; h5 `94af6409…` ✓.

## Verdict : **APPROUVÉ-AVEC-CORRECTIONS** (F1, F1b bloquantes ; F2, F3 mineures) — **toutes appliquées par l'orchestrateur**

- **F1 (BLOQUANTE, ADR-M008 D7 amendement)** — affirmait « trace h5 non affectée, re-pin = no-op » : **faux** après le ruling n° 1
  (interpolation ⇒ `tools/list` change ⇒ re-pin `09cd5b37…` → `94af6409…`). **Corrigé**.
- **F1b (BLOQUANTE atténuée, ADR-M009 §10)** — « l'en-tête `tracker.ts:4` devient … » au présent alors que le fichier est HEAD
  (ruling n° 3 : reporté à M012-b). **Corrigé** (« deviendra, en M012-b seulement ») ; `PLAN-m012` §5 « D9 en-têtes » sorti du
  bucket M012-a.
- **F2 (mineure, ADR-M012 D8)** — l'absence d'`exemptPhrases` (décision correcte, mesurée) n'était consignée que dans le test et le
  G1. **Corrigé** : clause de déviation dans D8.
- **F3 (mineure, `GATE_TOOL_DESCRIPTION`)** — « toute autre population abstient » rendu deux fois sur le fil (queue de la phrase
  committée + clause `${STABLE_RUN_UNCALIBRATED_SENTENCE}` exigée par `gate.test.ts:468`). Honnête, cohérent, structurellement
  forcé ⇒ lot ultérieur (item).
- **Résiduel nommé** : *écart de propagation de ruling* — chaque ruling de mi-lot a laissé une référence croisée périmée (F1, F1b).

## Oracle rejoué par le relecteur (Node v24.15.0)
`npm run ci` **234/234** (dont `gate_sentence_barber`, `vocab_adaptive_coverage_reddens`) ; `lang:gate` 0 ; `lint:ratchet` 69/69 ;
`lint` propre ; `export:check` 0 ; `gate:vocab` 117 fichiers OK ; `git diff --check` propre. Recorder h5 rejoué : idempotent,
15731 octets, diff = **une seule ligne** (`response_sha256` de l'étape `tools/list`, `204b0250…` → `118b92bd…`).

## Mutants (relecteur)
« adaptive coverage » / « the gate adapts » / « adaptively covers » ⇒ ROUGE dans les 4 scopes ; phrase D8 (655 car. après retrait du marqueur « (C-9) », C-15 ; **octet-identique**
entre ADR-M012 D8, ADR-M009 §10 et le littéral du test) ⇒ VERTE dans les 4 scopes et contre `guarantee`/`confidence`/`predicts`/
`live`. Constante D7 = ADR-M012 D7 (Candès → `Candes`) ; « exchangeability is declared » absent de `gate.ts`. README non-inerte
(les 3 fichiers `narabi_docs` résolvent).

## Gouvernance / checklist
Verbatim investisseur identique caractère pour caractère (ADR-M008:85), `error_origin = n/a` ; ADR-M005 D15 conforme ; AC-4 : 0 octet
sous `schemas/`, `packages/contracts` ; R-8 : 0 dépendance ; R-13 : 0 TODO ; R-25 = **388** (135 suivis + 253 non suivis, G1 exclu).
AgileCoder 3 étapes ✓. MAST : overclaim clos pour cette surface ; fuite de futur / régime / reason / gap ⇒ M012-b.
