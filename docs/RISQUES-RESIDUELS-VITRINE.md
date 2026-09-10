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

## RR-2 — « Gelé ≠ honnête » : la non-dérive d'un contrat ne garantit pas l'honnêteté de son texte (H1, checkpoint-2)
**Constat (Lot H1, checkpoint-2)** : l'invariant `contracts_frozen` (0 octet de dérive vs manifest Phase-0) garantit l'**immutabilité** des schémas gelés, **pas l'honnêteté de leur prose**. Quand un schéma gelé est **projeté sur une surface externe** (wire MCP du harnais, export public open-source), il **hérite de RR-1** et de la revue *English-only* de ses annotations. Instance : `schemas/coverage-verdict.schema.json` `description` = « alpha = couverture VISEE » (FR **+ inversion RR-1**), déjà **publique** (liste blanche d'export) et poussée sur le wire par la projection D8. La G2 H1 avait vérifié « wire == octets gelés » — **pas le SENS** de ces octets ; attrapé au checkpoint-2.
- **Mitigé côté harnais** : `stripMeta` (C-1) retire `description`/`title` des sous-arbres gelés avant le wire (position-aware ; test dans `tool_schema_equals_frozen_schema`).
- **Source corrigée** : erratum d'annotation SEULE par **addendum daté ADR-M001** (Option A, confirmée investisseur 2026-09-10 après consultation advisor) — les 5 descriptions réécrites en anglais + correctes (α = mis-couverture) + relues au filtre de nommage R-P1 ; `schema_version` inchangé (`1.0.0`), aucun digest touché ; **re-baseline du manifest dans le même commit** (PAS une dérogation de porte) ; PR de gouvernance séparée, séquencée **avant H4** ; re-export du miroir public ensuite.
- **Trou de porte à fermer (même lot)** : `classifyScope` (`scripts/lang-gate.mjs`) route `schemas/*.json` en scope `root`, non gaté par défaut dans l'export/ci → la prose FR d'un schéma passe. Fermeture avec mutant (injecter du FR dans une `description` de schéma ⇒ la porte close rougit).

### Item de checklist (tout lot projetant/exportant un contrat gelé sur une surface externe)
1. La non-dérive gelée n'est PAS une revue de contenu : relire les **annotations** (`description`/`title`) du schéma comme du texte destiné à un lecteur externe (RR-1 + English-only).
2. Toute projection d'un schéma gelé sur un wire/export soit **strippe les annotations**, soit les fait passer par la revue d'honnêteté et de langue.
