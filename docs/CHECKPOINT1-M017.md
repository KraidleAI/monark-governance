# Checkpoint-1 — ADR-M017 (P1 : prise `AttestedPrice` dans `GateEnvelope`) — avis du validateur-humain, persisté (K-B)

> Instance `validateur-humain` (`claude-fable-5-1`), contexte frais, gel K-C sur `a40c169f41c8971d7f14294776bb5e8080d63f32` (lecture par `git show`,
> aucun commit pendant la fenêtre — tenu). Décision : **ACCEPTE-AVEC-CORRECTIONS C-1..C-11**, aucune décision investisseur nécessaire.

## Ce que la checklist a attrapé
- `binding_broken` est dans l'enum gelé mais la L3 `decide()` (`l3-gate.ts:80-109`) n'a aucune branche pour lui : un verdict construit avec cette
  raison ressortirait `under_calib` ou `intent_not_in_region` — sortie fil non productible. ⇒ C-1 : une voie unique, (a) amender le prédicat fermé L3
  ou (b) erreur d'outil fail-closed 400 (précédent K-4a, garde `gate.ts:526`) ; (c) court-circuit pré-L3 écarté.
- Le `subject` réel est l'URL (`fixtures/h5-e2e-trace.json:292`), pas « BTCUSDT » ; l'horodatage vit dans `observed_at`. ⇒ C-2 : égalité exacte
  sur une liste d'URL par classe, « no temporal binding in P1 », vocabulaire « declared consistency », jamais « verified ».
- Contradictions D1/D2(ii) (clé d'enveloppe vs `params`) et D3/D2(i) (BYO promis vs table par classe) ⇒ C-3, C-4.
- D2(iv) « partager le noyau » : le noyau (`conformInterval` → L3) est déjà partagé ; ce qui diverge est la source de calibration ; `packages/monark`
  ne peut pas importer `apps/harness` ; `crossAgentGate` COMMIT sur `cascade-liquidable-24h` là où le chemin servi abstient ⇒ C-5 : **retrait**,
  amendement M003 D4, test de remplacement, retrait des types et de `@monark/ukemi`.
- D4 : mutant « table vidée » n'est tué que par un test concordant (non nommé) ; mutant « phrase retirée » manquant ; « trace h5 inchangée » faux
  (tools/list change) ⇒ oracle de diff ciblé ; « OpenAPI épinglé » : aucun fichier n'existe ⇒ test 43 étendu. ⇒ C-6, C-7.
- Phrase (iii) « recompute it with `attest` » : `attest` n'a aucun input, ne peut ni recalculer ni vérifier ⇒ C-8.
- Amendements M005 D5/D8 et M003 D4 annoncés dans P1-a mais absents du commit ⇒ C-9. Topologie et MAST absents ⇒ C-10. P1-b3 manquant ⇒ C-11.
- Correctement non touchés : `schemas/`, `packages/contracts/` (0 octet) ; `tool_schema_equals_frozen_schema` ; vocab ; `ci-gates.test.ts:856` ; skill.

## Décisions d'orchestrateur prises au pliage
C-1 → voie (b) (erreur d'outil 400, zéro octet hikae, `binding_broken` déclaré inutilisé sur ce chemin) ; C-3 → P1 = classes committées seules,
BYO + `attested` = item formé, `cascade-liquidable-24h` incohérente par construction ; C-5 → retrait de `crossAgentGate` (P1-b3) ; C-9 → amendements
M005/M003 posés dans le même commit ; C-11 → P1-b1 / b2 / b3 par package.
