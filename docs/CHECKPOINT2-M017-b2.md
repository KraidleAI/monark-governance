# Checkpoint-2 — livrable P1-b2 (ADR-M017), gel K-C `0527419` sur `lot/p1-b2`

Validateur-humain `claude-fable-5-1`, instance séparée, contexte frais, 2026-09-19 ~01:50 UTC. Lecture par SHA ; re-exécution en scratchpad
(`git archive 0527419`), b1 extrait pour comparaison byte-à-byte.

## Re-exécution
- Oracle 292/292, lint 0, ratchet 69/69, lang-gate 0, export:check 0 ; zéro octet hors portée (incl. README, skills).
- Trace `9cf2f8b2…` = pin = PROVENANCE ; 15731 octets ; diff 1 ligne.
- Byte-identité b1/b2 : `STABLE_RUN_COMMITTED_SENTENCE` ; `honestyText()` 5/5 populations ; description 2608 → 2545, « every other » 1 → 0 ;
  scrub PROBATIVE 0 jeton nu.
- Mutants 7/7 rouges (dont mutant propre `mV_table_empty` : `btc-dir-15m → []` ⇒ test (3) rouge), restauration byte-exacte.
- Rejeu fil MCP réel : attest → gate avec `attested` = commit/covered, 3 résidus filés ; sans = `[]` ; deepEqual hors `residual` ; ETHUSDT ⇒
  `isError` « not consistent » ; BYO + attested ⇒ `isError` « not accepted for BYO classes ».
- Intégrité : HEAD et `git status` vide avant/après, 9 sha identiques.

## Checklist
CA-1..5, CA-7, CA-9, CA-10 conformes. CA-6 correction (rapport G2 non persisté). CA-8 correction (G1 gelé avant le fold). **CA-11 conforme pour la
prise `attested`** : consommée par `registry.run → runGate(…, env.attested)` sur le fil, test d'intégration (3) compose `runAttest().price` réel →
descripteur servi, mutant `m_registry_drop` rouge ; tuyaux déclarés. **Déclencheur b1 levé.** K2-1..K2-4 et K-b2-1 vérifiées pliées.

## Décision : ACCEPTE-AVEC-CORRECTIONS (aucune bloquante pour b3)
| # | Correction | Fichier | error_origin | État |
|---|---|---|---|---|
| K-C2-1 | Persister les rapports G2 (b1 et b2) | `docs/G2-lot-p1b1.md`, `docs/G2-lot-p1b2.md` | orchestrateur | pliée (ce commit) |
| K-C2-2 | G1 : sha ADR périmé (`7277beb…` → `95c1257…`) + incident K-b2-1 et `error_origin` | `docs/G1-lot-p1b2.md:26`, §6 | orchestrateur | pliée (ce commit) |
| K-C2-3 | « Ukemi n'est consommé par aucun chemin servi » (ADR-M017:135, ADR-M018:22) contredit par la trace h5 étape 4 `cascade-gate` (fil réel, probe) : Ukemi **est** consommé par `gate` mais abstient `under_calib` par construction. Reformuler ; requalification built/upcoming = décision de registre public → candidate ESCALADE CA-2 au checkpoint-1 de b3 | ADR de b3 (+ ADR-M017:135) | planificateur | → b3 |

Reportés au checkpoint-2 de b3 : étape h5 portant `attested` ; requalification Ukemi ; `README.md:188` et `:102`. Parqué pour W-1 :
`apps/site/lib/fleet.ts:70` « a verified price testimony » (vocabulaire interdit dans la description du gate).

AM-1 — attrapé : G1 gelé avant fold ; G2 non persisté ; prémisse « Ukemi non consommé » fausse. **Prêt pour P1-b3 : OUI.**

## G7 (orchestrateur, 2026-09-19)
G7 **CLOS** pour b2 : oracle, G2 fraîche, checkpoint-2 concordants ; K-C2-1/K-C2-2 pliées dans ce commit ; K-C2-3 = Sprint Backlog b3 (ADR de b3 :
reformulation + décision de registre Ukemi soumise au checkpoint-1). La règle M018 est satisfaite pour `attest → gate`.
