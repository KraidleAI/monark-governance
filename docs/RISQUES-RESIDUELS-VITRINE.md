# Risques résiduels de la vitrine MONARK

Registre des risques que **les portes machine ne captent pas** (vocab, honesty-lint test 44, lang-gate, `tsc`, `next build`) et qui reposent sur la **revue humaine / G2**. Une entrée par risque nommé. Ouvert au checkpoint 2 du Lot F-2b (validateur `claude-fable-5-1`, 2026-09-09, correction C-3).

## RR-1 — Inversion sémantique d'une limite honnête (C8)
**Constat (F-2b, checkpoint-2 C-1)** : une phrase grammaticalement correcte, **sans mot proscrit ni chiffre**, peut inverser le SENS d'une garantie. Cas : `apps/site/components/hikae-panel.tsx` rendait α comme « **coverage** level » alors que α est le niveau de **MIS-couverture** (couverture = **1 − α** ; « coverage level α = 0.10 » se lit « 10 % de couverture » au lieu de 90 %). Sources committées : `packages/hikae/README.md` `q̂ = ceil((n+1)(1−α))` + S2 `α=0.10` ; `packages/ukemi/README.md` « alpha = 0.01 (aiming for 99 %) ».
- **Passé sous 2 tours G2 « mot-pour-mot » + l'oracle complet** ; attrapé seulement au checkpoint 2 par le validateur. **Aucune porte machine ne garde le sens** — seule la revue G2 le fait.
- **Corrigé** : « target coverage of one minus α » / « α is that miscoverage level (coverage is one minus α) ».
- **Garde étroite ajoutée** : test `no_coverage_level_alpha` (`test/ci-gates.test.ts`) rougit « coverage level α » **rendu** dans `apps/site` (ancrage `\bcoverage` → « miscoverage level α », qui est CORRECT, n'est pas un faux positif). C'est un **pin de cette phrase**, PAS une garde générale contre l'inversion sémantique.

### Item de checklist G2 vitrine (obligatoire — tout lot touchant une limite C8 ou un symbole de niveau)
1. **α = mis-couverture, couverture = 1 − α** ; jamais « coverage level α ».
2. Tout symbole de niveau rendu (α couverture, β/α recouvrement Ukemi, budget `B_t`, …) est confronté à la **FORMULE committée** (`q̂ = ceil((n+1)(1−α))`, README ukemi α/β), **pas seulement au mot**.
3. Une négation d'honnêteté (« not a probability that a region is right », « never a yield ») ne doit pas, par sa reformulation, réintroduire l'affirmation qu'elle nie.
4. Étendre la liste des symboles vérifiés à mesure que de nouveaux niveaux sont rendus (panneaux des 8 agents roadmap, F-2c+).
