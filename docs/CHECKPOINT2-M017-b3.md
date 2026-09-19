# Checkpoint-2 — livrable P1-b3 (ADR-M017 D2(v)/D5 + ADR-M019), gel K-C `8de6ef9` sur `lot/p1-b3`

Validateur-humain `claude-fable-5-1`, instance séparée, contexte frais, 2026-09-19. Lecture par SHA ; rejeu en scratchpad (`git archive 8de6ef9`,
`node_modules` reconstruit par copie + jonctions locales — O1 de G2 traité : un mutant de `packages/monark/src` est visible depuis `apps/harness`).

## Re-exécution
Oracle 289/289, lint 0, ratchet 69/69, export:check OK, lang-gate 0, gate:vocab 0 claim ; grep symboles retirés hors docs = 0 ; `npm ls -w packages/monark`
vide (discriminant `@monark/contracts`) ; m2 rouge (TS2305 ×2), m3 rouge (`attest.ts:19`), m1 vert (hoist, item formé), m4 propre (stub
`crossAgentGate` réintroduit : vert — retrait gardé par grep + cartographie M018 D4, observation) ; vacuité `runGate` : sha décision `64619eb9…` ×3 =
trace ; README :102/:188 vrais mot à mot ; vocabulaire interdit 0 ; citations C1 exactes. Non-écriture prouvée (status vide, 8 sha identiques).

## Checklist
CA-1..3, 6, 9, 10 conformes ; CA-4/5 n-a ; CA-7 correction (deux dus nus) ; CA-8 correction (G1 sha périmé, récidive) ; **CA-11 conforme sur la
lettre, traité honnêtement** : chemin servi (`cascade` MCP → `gate`) + probe non-LLM ; effet servi = abstention constante, écrit ; registre
intouché ; `wiring` W-1 « abstains under_calib by construction » ; l'esprit (influence réelle) renvoyé à ADR-M020 par décision investisseur close.

## Décision : ACCEPTE-AVEC-CORRECTIONS (liste fermée, pliées au G7)
| # | Correction | error_origin | État |
|---|---|---|---|
| K-C2-b3-1 | « built end to end » encore ×5 sur la vitrine (`fleet/page.tsx:25,:73`, `page.tsx:86-87`, `roadmap/page.tsx:170,:99` « cross-agent gate ») ; G1 §3 claim de complétude faux → item formé (5), W-1 ; G1:90 rectifié | générateur + planificateur | pliée |
| K-C2-b3-2 | Item (1) déclencheur « G2 de b3 » tiré non traité → re-formé : prochain lot touchant `apps/harness` | planificateur | pliée |
| K-C2-b3-3 | D4 cite un fondement (`docs/biblio/ukemi-modeL/`, avis) inexistant au gel → « à constituer » | orchestrateur | pliée |
| K-C2-b3-4 | G1 sha ADR périmés après fold (récidive K-C2-2) → re-sha ; règle : tout fold post-gel re-sha le G1 dans le même commit | orchestrateur | pliée |
| K-C2-b3-5 | Mentions antérieures à D4 (ADR-M019:111,186 ; ADR-M017 (c)) → marquées | orchestrateur | pliée |

Observations : m4 ; région vide `label_schema:"up|down"` sur classe numérique (littéral L1, matière ADR-M020) ; journal attendu au G7.
Décisions de portée (retrait `@monark/hikae`, `description`, `MONARK_PHASE`) acceptées. **Prêt pour W-1 : OUI. P1 clôturable après W-1 : OUI**
(W-1 livré + cartographie M018 D4 + ADR-M020 checkpoint-1 planifié).

## G7 (orchestrateur, 2026-09-19)
G7 **CLOS** pour b3 : oracle, G2 fraîche, checkpoint-2 concordants ; K-1..K-5 pliées dans ce commit. Sprint Backlog **W-1** = champ `wiring`
(+ test de gel étendu), prose vitrine ×5, `fleet.ts:70` « verified », panneau Ukemi (`ukemi-panel.tsx:33`) lisant le registre, étape h5 `attested`
si `apps/harness` touché. Ensuite : cartographie M018 D4 de clôture de phase P1, ADR-M020 (Ukemi) checkpoint-1.
