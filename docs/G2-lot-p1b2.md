# Revue G2 — lot P1-b2 (ADR-M017), gel `f25eb6d` sur `lot/p1-b2` (base `44a121c`)

Relecteur : instance séparée, contexte frais, `claude-opus-4-8[1m]` (R-1). Rendu le 2026-09-19 ~01:20 UTC. Mutations sur copie `git archive`
en scratchpad ; dépôt `git status` vide avant/après.

## Mesures
- Oracle : `npm run ci` 292/292 ; lint 0 ; ratchet 69/69 ; lang-gate root 0 ; export:check 0 ; diff zéro-octet hors portée vide.
- Mutants 8/8 rouges, restauration byte-exacte : m_res_drop, m_seam_leak, m_seam_clobber, m_registry_drop → test (3) ; m5_swap_guard_order → F1 ;
  m_k21_bare_probative → K2-1 ; m_dedup_requeue → `gate_stable_run_honesty_text_is_keyed_A2_A7f` ; m_trace_stale → probe h5.
  Divulgation R-21 : un premier run a crashé (encodage cp1252) et laissé `gate.ts` muté ; restauré par `git show`, script durci, seul le run 3 sur
  baseline pristine compte.
- Couture `residual` : appliquée après dispatch, seul `residual` touché ; L3 `decide()` ne lit que region/reason ; aucun autre lecteur de
  `verdict.residual` ne change de comportement ; **rejouée sur le fil `tools/call` réel** (attest → gate avec `attested`) : commit/covered, 3 résidus
  filés, deepEqual hors `residual` avec l'appel sans `attested`.
- M012 (i) : `STABLE_RUN_COMMITTED_SENTENCE` et `honestyText()` USDe byte-identiques b1/b2 ; description 2608 → 2545 octets, clause dupliquée 0×.
- Trace h5 : `9cf2f8b2…` = pin ; diff 1 ligne ; PROVENANCE cohérente.
- K2-1 : regex PROBATIVE identique à `attest.test.ts:109` ; 0 mot probatif nu dans la description publiée (seule négation « not re-verified »).
- ADR-M017 : statut, D4(5) → `a814973` (diff cumulatif 1 ligne vérifié), D6 exact, section « Tuyaux » sans surclaim (la trace h5 ne porte pas
  `attested` — mesuré vrai). Forme du test (5) : D4(5) spécifie un oracle, satisfait par diff de trace + probe + `m_trace_stale`.
- Vocabulaire interdit 0 hit ; R-25 185+/30− hors G1.
- Branchement (M018) : `attest → gate` servi ET couvert par le test (3) non-LLM ; pas encore : étape h5 portant `attested` (item formé),
  `crossAgentGate` test-only (b3), statut Ukemi (b3), champ `wiring` (W-1).

## Verdict : APPROUVÉ-AVEC-CORRECTIONS
| id | fichier:ligne | défaut | correction | error_origin |
|---|---|---|---|---|
| K-b2-1 | `docs/adr/ADR-M017-…md:75` | clause « `gate.test.ts` verte sans modification » fausse | reformuler en « aucune assertion préexistante altérée » — **pliée `0527419`** | planificateur |

Observations hors portée : couture inconditionnelle sur la raison (résidu porté même en abstention — sémantiquement correct) ; K2-2 cohérent.
