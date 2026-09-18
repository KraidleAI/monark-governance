# G1 — Génération tracée, hotfix M012-d (repli quorum RPC de la sentinelle)

- **Rattachement** : ADR-M012 D1 (quorum de 2, `finalized`) ; résiduel **O2** de `docs/G2-lot-m012b.md` (« chemin quorum sans cooldown/retry »)
  devenu **bloquant au jour 0** de go 3.
- **Défaut mesuré (VPS, 2026-09-18, go 3 étape 3, dry-run)** : `sentinel FATAL Error: HTTP 525 https://eth.llamarpc.com` à `finalized()`
  (`rpc.ts:141`). `pickTwo()` prenait `live()[0]`/`live()[1]` (`rr = 0` à chaque processus) **sans repli** ; `eth.llamarpc.com` (index 1 du
  pool) répond 525 en continu (3 sondes ; `publicnode`, `drpc`, `mevblocker`, `1rpc`, `ankr` → 200). Déterministe : chaque run quotidien
  aurait échoué. État VPS laissé sûr : user/dirs créés, **aucun état écrit, unité/timer non installés, Caddy intact**.
- **Générateur** : worker **`claude-opus-4-8[1m]`** (R-1), 2026-09-18 ; aucun commit (R-20).

## Livrable (2 fichiers, +93/−14, R-25 = 107)
- `apps/sentinel/src/rpc.ts` `24274a11…` → **`539f64dd…`** : `pickTwo` remplacé par `quorumTwo<T>(label, fetchOne)` — round-robin depuis
  `rr`, endpoint en échec **benché** dans la map `cooldownUntil` partagée avec `one()` (25 s), collecte des **deux premiers succès** (endpoints
  distincts par construction), `throw \`${label}: quorum needs >= 2 live endpoints (last: …)\`` sinon ; `finalized`/`windowFlow`/`supplyAt`
  l'utilisent ; `QuorumDisagreementError` inchangée ; `one()` intact.
- `apps/sentinel/test/sentinel.test.ts` `c9cce3fb…` → `0fc7a0e6…` → **`46369b7e…`** (checkpoint-2 C-1) : `sentinel_quorum_survives_one_dead_endpoint`,
  `sentinel_quorum_needs_two_live`, `sentinel_quorum_parse_error_benches_not_masks` (A malformé + B ≠ C ⇒ `QuorumDisagreementError`, A benché ;
  `finalized` malformé sur A ⇒ min des deux sains) ; `sentinel_quorum_disagreement_fails_closed` octet-inchangé ⇒ **21/21**.
- **Changements de comportement déclarés** : `windowFlow` séquentiel (repli déterministe ; +1 RTT) ; une réponse malformée **benche** l'endpoint au
  lieu de FATAL ; message d'erreur avec `(last: <hôte>)` pour les journaux VPS.

## Mutant (retour à « deux premiers sans repli », revert prouvé par sha `539f64dd…`)
✖ `sentinel_quorum_survives_one_dead_endpoint` « Error: HTTP 525 e1 » ; ✖ `sentinel_quorum_needs_two_live` (message brut) ; ✔ disagreement (orthogonal).

## Oracle — worker : sentinelle 21/21, `ci` 256/256, `lint` 0, `lint:ratchet` 69/69, `lang:gate` 0, `export:check` 0, `gate:vocab` 129, `diff --check`
propre. **Orchestrateur (G7)** : rejoué identique. **G2 fraîche** (`docs/G2-lot-m012d.md`) : APPROUVÉ.
**Checkpoint-2** validateur : ACCEPTE-AVEC-CORRECTIONS C-1 (test ci-dessus), C-2 (JOURNAL), C-3 (commit nommant le set : 2 src + ADR items (m)(n)(o) — (o) hors
périmètre, inscription seule — + G1/G2/JOURNAL), C-4 (reprise go 3 conditionnée au dry-run VPS vert + état vide) ; mutants propres du validateur « sans bench » et
« même endpoint deux fois » ROUGES. **G7** : rejoué 256/256, lint 0, ratchet 69/69, lang 0, export 0 ⇒ ACCEPTÉ.
