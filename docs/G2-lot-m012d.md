# G2 — Revue du hotfix M012-d (repli quorum RPC)

- **Relecteur** : instance FRAÎCHE **`claude-opus-4-8[1m]`** (R-1), ≠ générateur, 2026-09-18 ; mutant apply-and-revert avec preuve sha
  (`rpc.ts` `539f64dd…` avant = après) ; mesures complémentaires sur copie hors dépôt.

## Verdict : **APPROUVÉ** (aucune correction)

- Diff strictement borné au chemin quorum (`quorumTwo` l.116-141 ; consommateurs l.158-177) ; `one()`, parseurs, `getLogsVia`, pool intacts.
- Déterminisme (round-robin sur `rr`, `Date.now()` seulement pour le cooldown) ; `rr` avance des endpoints consommés ; cooldown partagé (même map,
  25 s) ; deux succès = deux endpoints distincts (indices d'une permutation figée) ; `QuorumDisagreementError` toujours levée (`windowFlow` l.169,
  `supplyAt` l.175).
- **Jugé et mesuré** : une parse-error benchée ne masque jamais un désaccord — `quorumTwo` compare exactement les deux premiers succès ; test hors
  dépôt : A malformé ⇒ benché, B(100) vs C(101) ⇒ `QuorumDisagreementError` ; `finalized` avec bloc malformé sur A ⇒ succès sur les deux sains
  (**était FATAL avant M012-d**).
- Mutant « deux premiers sans repli » : ✖ `survives_one_dead_endpoint` (« HTTP 525 e1 »), ✖ `needs_two_live`, ✔ disagreement ⇒ 18/20 ; fix 20/20.
- Oracle : `ci` **255/255** ; `lint` 0 ; `lint:ratchet` 69/69 ; `gate:vocab` 129 ; `export:check` 0 ; `lang:gate` 0 ; `diff --check` propre. R-25 **84**.

## Résidus (non bloquants, documentés)
- **Latence pire-cas** (repli séquentiel, jusqu'à 6 × 20 s si des endpoints *pendent*) : tolérée — `Type=oneshot` sans `TimeoutStartSec` (systemd.service(5)
  [lu] : délai désactivé par défaut pour oneshot), 525 = échec immédiat puis bench, cadence quotidienne = marge d'heures, `Persistent=true`.
- **Indépendance du quorum de 2** (pré-existant) : deux endpoints d'accord sur une valeur fausse passent ; alias probables d'un même fournisseur
  dans le pool (`ethereum-rpc.publicnode.com` idx 0 / `ethereum.publicnode.com` idx 6) — à traiter comme item séparé (pool par fournisseur).
- **`rr` lu à travers des `await`** : motif déjà présent dans `one()` ; `run.ts` pilote le pool strictement en série ; durcissement optionnel
  (`const start = rr`).
