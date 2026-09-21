# CHECKPOINT-2 DELTA (LIVRABLE) — sous-lot NARABI-OPS-1b-i

Avis du `validateur-humain`, modèle résolu **`claude-fable-5-1`** (R-1), instance séparée à contexte frais ; horloge (`date -u`) : 2026-09-20 20:23 → 20:36 UTC. Persisté par l'orchestrateur `claude-fable-5-1` (vérifications condensées, corrections **intégrales**). État jugé : `379e4e8` (base `298aa5c`). Rejeux sous `F:\tmp\cp2d-narabi-1b-i\` (`git archive`, `npm ci --offline`, parent `TZ=UTC`, harnais propres au validateur) ; dépôt non muté (9 sha identiques, `git status` vide) ; aucune action sortante.

## Décision
**ACCEPTE-AVEC-CORRECTIONS sur `379e4e8`.** Code : C-V-1, C-V-2, C-V-3 fermés, aucune nouvelle correction de code. Docs : C-D-1..C-D-3 bloquantes, C-D-4/C-D-5 non bloquantes. G7 bloqué par la mesure D.

## Re-exécutions de première main (CA-9)
Contrôle no-op VERT 18/18 ; **N4, N1, N2, N5, cap-64 ROUGES** par le test nommé (N5 : première assertion tombée = N1, mais l'assertion N5 discrimine seule — pristine `chain_broken`/`chain_ok:false`, mutant `lag`/`chain_ok:true`) ; cap-9 survit (latitude voulue de `k=13`) ; `attempt <= retries + 1` survit (= C-G2D2-2). Sonde 18/18 ; 4 fichiers 50/50 ; `npm run test` **482/482** ; typecheck 0 ; `gate:vocab` (178), `export:check`, `lang:gate` OK ; ratchet 69/69 ; **R-25 = 1 094** ≤ 1 205 ; `git merge-tree` vs `lot/etude-suite` : 0 conflit ; CA-11 : rien « built », aucun registre public touché.
RSS chemin GET : 8 Mio ⇒ **99,0 MiB** (worker 100, relecteur 97,3) ; 16 Mio ⇒ 114 MiB (119 / 139) ⇒ **déviation 8 Mio ACCEPTÉE**, 16 Mio non adoptable ; `MAX_MAX_BYTES == DEFAULT_MAX_BYTES` sain (env ne peut que baisser). Kill cgroup Linux inféré (item formé).
C-G2D2-2 laissé à -1b-ii : **acceptable** (item formé ; sûreté : pas de backoff, ≤ 6 essais × 10 s + marge = 70 s < `TimeoutStartSec=90`).

## Corrections — liste fermée (docs)
- **C-D-1 (bloquante, CA-8)** — bloc JOURNAL : attribution de modèle FAUSSE (G2 et G2 delta = `claude-opus-4-8[1m]`, pas Fable) ; réécrire étape par étape ; ajouter G2 delta-2 ; `error_origin` manquants (C-G2D2-1..3, C-V-4, C-V-5) ; retirer la phrase périmée sur le relecteur.
- **C-D-2 (bloquante, preuve au G7)** — les deux blocs présents dans `docs/CHANTIERS.md` et `docs/JOURNAL-PROVENANCE.md` ; `grep "deferred to pli NARABI-OPS-1b" docs/RUNBOOK-sentinel.md` = 0 après fusion ; table des tuyaux ADR-NARABI-OPS-1 + §6 amendés par SHA. Sans ces trois preuves, C-V-4/C-V-5 ne sont pas clos.
- **C-D-3 (bloquante, CA-7)** — item « réessai différencié » : nommer le mutant `attempt <= retries + 1` à `probe-narabi.mjs:246` (boucle **GET**, pas SMTP) et son tueur (serveur qui échoue N fois puis sert, `hits === retries + 1`).
- **C-D-4** — item « Déviation `PROBE_RETRIES=0` » sans déclencheur : l'étiqueter CLOS.
- **C-D-5** — trois observations sûres (`--now` sans valeur, BOM, `user:pw@`) à consigner « closes ».
État : C-D-1, C-D-3, C-D-4, C-D-5 appliquées par l'orchestrateur au commit `2c7f3a0` (docs seuls) ; C-D-2 due au G7.

## Reste bloquant avant gel et G7
1. C-D-2 (preuves de port). 2. **Mesure D** (critère (c) inchangé) : run publiant après 00:30 UTC le 2026-09-21, `journalctl -u monark-sentinel -o short-iso-precise` ; 10:30 conservé ssi D ≤ 600 s ; sinon 10:00 + 3×D arrondi au quart d'heure supérieur = delta sur 3 fichiers + relecteur Opus 4.8 séparé + nouveau checkpoint-2 delta ; aucun run publiant ⇒ report, jamais d'estimation. 3. Au G7 : « relecteur du pli G2 delta `81dee56..c749910` = validateur-humain (CA-9), déviation déclarée ».

## AM-1
Attrapé : attribution de modèle fausse cochée « présente » par le G2 delta-2 ; `error_origin` manquants ; item du mutant survivant mal ancré (SMTP au lieu de GET) ; C-V-4/5 fermés en texte, pas en fait ; ordre des assertions sous N5.
