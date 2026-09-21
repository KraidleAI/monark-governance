# G2 constat final - lot Bell -b3d-f (pli e453680)

## CONSTAT FINAL — Bell -b3d-f, pli `e453680` — **PASS**

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`.** R-20, aucun réseau. Arbre isolé `git archive e453680`, restauration byte-exacte, `git status` du worktree **propre** à la sortie (HEAD `e453680`). Constat durable : `F:\tmp\b3df-fold2\RENDU.md`.

Le pli (test seul +24, source inchangée) discharge entièrement C-G2-DELTA-1.

1. **Source** : `git show e453680:…rebase-crosscheck.ts | sha256sum` = `2c852f0c…` ; arbre extrait identique. Non touchée. ✓
2. **Les TROIS hex, recalculés en `sha256` BRUT hors helper ET re-vérifiés via le helper — tous MATCH (raw == helper == littéral déposé)** :
   - V1 `payload_sha256` = **`f2243f755fa55d8c564017c55b92debda4a5307cc6e5e6d1b5b5607a581ab1ff`**
   - V1 `entry_sha256` = **`aa0f826b5755754b6b258ecac9b26e8a6ac83632981945a31d55b0981322a0dd`**
   - V2 `payload_sha256` = **`f0a2d8a3d56eaaf6e2a3e55a9fb01c2dbd6c4578bbe6362ab28573b987e875c0`**
   
   Variantes triées (preuve que l'ordre est pinné) : events triés → `194133c8…` (≠ V1) ; handoffs triés → `c3f4b460…` (≠ V2).
3. **Mutants sur la suite pliée (58 tests), restauration `2c852f0c…` OK après chacun** :
   - MINE-1 (cardinalité) → **RED** (2 fail : t31 + t33 sous-cas (d)) ; MINE-2 (permutation clés) → **RED** (t31).
   - **MINE-3 (tri `page_events`) → RED désormais** (t31, via V1) ; **MINE-4 (tri `page_handoffs`) → RED désormais** (t31, via V2). Les deux mutants d'ordre survivants au G2-DELTA sont tués ; aucun « deux côtés » connu ne survit.
4. **Gates** : `npm run ci` exit 0 (699 tests / 698 pass / 0 fail / 1 skip `fetch_only_inside_client` pré-existant) ; `npm run lint` = 0 ; `npm run lint:ratchet` = 69/69.

Les trois hex ci-dessus sont ceux à déposer en littéral dans l'Amendement de format n°2. Piège déclaré (conforme au commentaire du test) : objets bespoke (`multiplierBitsHex:"aa"/"bb"`, `mint:"M"`…, non `ev()`/`hexOf`) — chaque hex n'est valide que pour ces octets/ordre exacts.

Repro (F:, rien sur C:) : `F:\tmp\g2-b3df\recompute2.mjs`, `run-mutants-fold2.sh`, `fmut-MINE-*.log`, `fold2-ci.log`. Arbre isolé laissé propre (src `2c852f0c…`).
