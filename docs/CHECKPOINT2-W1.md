# Checkpoint-2 — livrable W-1 (ADR-M018 D2 + ADR-W1), gel K-C `3e0a150` sur `lot/w-1`

Validateur-humain `claude-fable-5-1`, instance séparée, contexte frais, 2026-09-19 (~07:20 UTC). Lecture par SHA ; oracle rejoué dans le worktree en lecture/exécution seule ; mutants dans une copie scratchpad avec jonctions `@monark/*` vers la copie (0 hors scratchpad).

## Re-exécution
`npm run ci` 289/289 ; lint 0 ; ratchet 69/69 ; lang-gate root OK ; export:check OK ; `next build` 13/13 pages ; hors portée (`schemas packages apps/harness apps/sentinel`) = 0 ; sha G1 8/8. Mutants : baseline vert ; A1 (`status={"built"}`) ROUGE ; A2 (destructuration `wiring`) ROUGE ; m2 (`no_such_test`) ROUGE ; m1 (`wiring` retiré) ROUGE TS2322 ; **m6 propre** (`integration_test: "narabi_live_parses_real_state_shape"`, test existant) **ROUGE à tort** — la garde (3) exige `test("<id>"` guillemet collé et rejette un titre suffixé ` — `.
Grep résiduel : « end to end / cross-agent » 0 sur `apps/site`, README ; `skills/monark/DEMO.md:86` vrai ; « verified » : négations honnêtes (`how/page.tsx:62`, `shogen-panel.tsx:63`), commentaires non rendus, `shogen-panel.tsx:51,57` + `fleet-presentation.ts:33` propriétarisés ; **`README.md:48, :111, :112` surclaims sans item** (G2 O3).

## CA-11 pièce par pièce
Shōgen vrai (`registry.run` → `runGate(…, attested)`, test (3) via `HARNESS_TOOLS`, résidu filé ; h5 sans étape `attested` = item (1)). Hikae vrai (probe MCP réel, live == committé). Ukemi vrai et asserté (probe étape 4 : abstain/under_calib). **Narabi : deux jambes réelles, mais le test nommé (`sentinel_windows_identical_to_pull`) ne rejoue ni la publication ni la consommation ; le test qui rejoue la composition servie est `narabi_live_parses_real_state_shape`, relégué en commentaire ; le docstring du champ est donc faux pour Narabi.**

## Décision : ACCEPTE-AVEC-CORRECTIONS
| # | fichier:ligne | défaut | correction | error_origin |
|---|---|---|---|---|
| K-V1 | `fleet.ts:161` (+ `:155-158`, ADR-W1 D2 l.32) ; `ci-gates.test.ts:646` (+ docstring `fleet.ts:31-33`, `:631`) | pointeur Narabi = fenêtrage, pas composition ; garde (3) rejette les titres suffixés | (a) `integration_test: "narabi_live_parses_real_state_shape"`, fenêtrage en commentaire ; (b) garde (3) accepte `"` ou ` — ` après l'id ; `no_such_test` reste rouge, m6 passe vert | worker + planificateur |
| K-V2 | `ADR-W1:88-94` | `README.md:48,111,112` « verified » sans item (CA-7) | ajouter à l'item « lot Shōgen-honnêteté » | worker (grep scopé site) |
| fold G7 | `ADR-W1:3` | statut « proposé » | « accepté » + G1 re-sha | orchestrateur |
Divergence déclarée avec l'adjudication G2 (point 1) sur K-V1.

**P1 clôturable : OUI** sous K-V1/K-V2 pliées, cartographie M018 D4 (worker contexte frais) et ADR-M020 checkpoint-1 planifié (fait : approuvé-avec-corrections `3a48c88`). Contenu attendu de la cartographie : par paire « câblé / fixture / absent » avec test nommé — `attest → gate` (registre câblé, test (3) ; fil h5 absent, item (1)) ; `cascade → gate` (câblé, classe fixture, abstention constante) ; `run.ts → pub → /narabi` (publié, live + fallback snapshot) ; `fromAttestedFlow → gate` (`runGate` direct, à qualifier) ; `calibrate` (servi, terminal déclaré) ; `MONARK_PHASE` non consommé ; écarts d'outillage : garde (3) titres suffixés, `TEST_ROOTS` sans `packages/*/test/`, hygiène de dépendances (M019 item 4) ; comparaison ligne à ligne avec les 4 `wiring`.

AM-1 — attrapé : pointeur Narabi ; faux-rouge garde (3) (non vu par G2) ; README non propriétarisé.

## G7 (orchestrateur, 2026-09-19)
G7 **CLOS** pour W-1 : oracle, G2 fraîche, checkpoint-2 concordants ; K-V1 (a)(b) et K-V2 pliées (m6 vert, `no_such_test` rouge, A1/A2/m1-m5 rouges, 289/289, build site OK, sha G1 8/8 re-calculés dans le même passage) ; statut ADR-W1 « accepté ». Divergence G2/validateur sur Narabi tranchée au sens du validateur (le test nommé doit rejouer la composition servie). Suite : cartographie M018 D4 de clôture (worker contexte frais) → rapport de passe P1.

