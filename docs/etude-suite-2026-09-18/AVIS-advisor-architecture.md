# Avis advisor (architecture, séquencement, dette) — 2026-09-18 — archivage de l'artefact (C-2 du checkpoint-1)

> Instance `advisor` (`claude-fable-5-1`), consultation formée routée par l'orchestrateur ; avis, pas verdict. Archivé verbatim pour les sections
> décisionnelles ; les tailles de lots sont des estimations par analogie déclarée.

## Cinq faits de carte qui gouvernent l'avis
1. Le `gate` servi n'a aucune prise `AttestedPrice` : `GateEnvelope = { prediction, params }` (`registry.ts:36-39`) ; 11 sites `residual: []` dans
   `gate.ts` (+ 1 dans `packages/hikae/src/s2/instrument.ts`, hors P1) ; seul `crossAgentGate` (`packages/monark/src/index.ts:87`) file `price.residual`,
   appelé uniquement par son test.
2. D6 (ADR-M005) répond déjà à Genkan/B_t : « B_t porté par l'appelant, serveur sans état ; déplétion côté serveur = monétisation, hors M005 ».
3. Motif « état hors harnais = second processus systemd, utilisateur dédié, jamais importé par le harnais » validé et déployé (M005 D15, M012 D5).
4. Recorder `q99 = ∞` dès `rank > n` (`record-usde-calib.mjs:71`, `ALERT_P = 0.99`) et alerte masquée par `Number.isFinite` (`:115`) : silencieux pour n < 99.
5. ADR-M009 item (a) : B_t à bFloor = 0 ⇒ P(B_t < 0) 35 % → 47 % **[abs]**, à mesurer sur traces S2 puis amendement M002 D5/D6.

## Séquencement (ordre minimal qui ne casse ni K-8, ni les contrats gelés, ni les tests de gel)
| # | Tuyau | ADR | GEL | État | Lots (analogie) | Risque dominant |
|---|---|---|---|---|---|---|
| P0 | dette d'entrée | amendements M009/M012/M005 D5 | 0 | — | 2 (< 400 l., F1a) | aucun ; prérequis |
| P1 | prise `AttestedPrice` optionnelle dans `GateEnvelope` → `crossAgentGate` servi | amendement M005 D5/D8 + M003 D4 | 0 (`params` non gelé, M005 D8) | pur | 1 code ≈ 500–700 l. (F1b) + 1 ADR | `tool_schema_equals_frozen_schema`, re-pin h5 ; `attest` reste fixture (K-1) |
| P2 | Genkan v1 = wrapper côté appelant (`before_tool` chez l'opérateur, B_t persisté chez l'opérateur) | ADR-M015 Genkan v1 | 0 | chez l'opérateur | 2–3 | item (a) M009 non traité ⇒ abstentions aléatoires ; demande non démontrée |
| P3 | 2ᵉ clé Narabi (F2-C) | amendement M008 | 0 | sentinelle | 2 + census | décision investisseur ; q99 ; nommage |
| P4 | Narabi → gate via BYO (`q_t` en calibration) | ADR requis (frôle D3/D8) | 0 | sentinelle | 1 doc si retenu | phrase D8 contestable ⇒ décision investisseur |
| P5 | budget ledger hors harnais (B_t persistant côté MONARK, lien token) | ADR d'architecture | probable (`AuthorizationBudget`) | `apps/ledger/` motif sentinelle | 4–6 | D6 + GEL + NET = architecture ; après mesure d'usage de P2 |
Hors 12 mois : `AttestedBook` (Ukemi ← livre), Mokugeki `AttestedDoc`, pièces act (Koyomi la moins chère : NET seul).

## Genkan devant tout et B_t persistant
Deux couches : (i) Genkan v1 = client (wrapper `before_tool`, produit-H), D0/D6/K-8 intacts par construction, 0 contrat gelé ; (ii) ledger MONARK =
service séparé (motif sentinelle), jamais importé par le harnais, pas sous `api.` ; architecture à décider après mesure d'usage de (i).
Bloqueur en tête : item (a) M009 mesuré avant tout Genkan qui abstient sur B_t.

## Enrichir vs nouvelle pièce (coût, effet de composition)
Genkan v1 client = le moins cher avec le plus d'effet de composition, à condition d'être précédé de P1 et de l'item (a) M009. 2ᵉ clé = moyen.
Koyomi 3–4 lots (faible composition). Mokugeki ≥ 5 (dépend de P1). Kessai/Kaihi/Kamae/Kyokusen ≥ 4 chacune (faible). Ukemi ← livre rejeté (AUDIT §2).

## Dette et invariants (liste fermée avant tout chantier)
q99 fail-closed (`q99_alert: null` + mutant n = 98) ; `@monark/ukemi` déclaré par `packages/monark/package.json` jamais importé par `packages/monark/src`
(il **est** importé par `apps/harness/src/tools/cascade.ts:41`) ; commentaires périmés (`hikae/src/index.ts:95`, `export-public.mjs:85-86`,
libellé du manifeste Phase 0) ; `crossAgentGate` test-only résolu par P1 ; M012 (i) dans P1 ; M012 (g) décision investisseur ; M012 (l) débloqué à
T ≥ 7 ; M014 (a)(c) formés, (d)/(d′) investisseur ; `lint-ratchet` non croissant ; nommage task_class tranché par ADR avant P3 ; diff contrats 0 octet par CA.

## Forme du plan et exigences (12)
Phases = tuyaux ; ADR de phase puis ADR par tuyau ; par tuyau G0 → checkpoint-1 → lots R-25 → G2 fraîche → oracle → checkpoint-2 → G7.
Exigences : zéro outil ajouté sans ADR K8 ; zéro contrat gelé avant P5 ; état hors harnais ; D8 byte-identique ; item (a) M009 avant Genkan ; q99 avant
tout census < 99 ; nommage avant P3 ; méthode d'estimation par lot ; procurements à l'ADR ; décisions investisseur listées ; re-pin built-set dans le
même commit ; ratchet non croissant. Procurements : hook `before_tool` OpenClaw (R-P4 muet), `produit-ukemi-loop-clearing.md`, PSM/PYUSD/LUSD.

## Recommandation tranchée
T1 : P0 + P1 + ADR de phase + ADR nommage + (l) à T ≥ 7 + procurement OpenClaw. T2 : P2 (après item (a)) ‖ P3 (après décision, q99). T3 : mesure
d'usage P2, décision P5 par ADR, revue (iii). T4 : ledger si P5 accepté, sinon Koyomi. Bascule : item (a) infirmé/confirmé ; acheteur nommé sur une
autre pièce (après P0/P1) ; token ↔ B_t exigé maintenant (ordre P0 → P1 → P5 → P2, décision CA-2).
