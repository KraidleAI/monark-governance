# G0 du lot RH-2 : deux tests qui rougiraient au premier dossier daté (SPEC-TABLES-TEST-PER-DIR-1, T0-ORDER-TEST-RELEASE-NAME-1)

RECHERCHES, 2026-10-07. Base `b9d327a4` (lot/etude-suite). Plan : `docs/G0-lot-retire-latency-rehearsal-1.md` §5 et annexe A (M-1, M-3).

red-proof: test-only

## Constat (mesuré dans des copies jetables, `git archive b9d327a4`)

- **M-1** : une release `contract-1.1.0-tables-<date>` ajoutée en dernier à `scripts/spec-publish-inputs.json` rougit
  `srf_runbook_vitrine_t0_order` (`test/surfaces-1-1-0.test.ts` l.231 lit `.at(-1)`), par `ERR_ASSERTION`.
- **M-3** : un premier dossier daté écrit par `node scripts/spec-policy-tables.mjs --write --date 2026-11-02` (`--check` sort 0) rougit
  `published_tables_are_the_served_tables_byte_for_byte` (`test/spec-1-1-0-release.test.ts` l.123-130), qui ne lit que `contract-1.1.0/`.

## Changement (test seul, aucune ligne ajoutée ni retirée)

1. `published_tables_are_the_served_tables_byte_for_byte` lit `spec/contract-1.1.0/` et chaque `spec/contract-1.1.0-tables-<date>/` :
   chaque table servie est, à l'octet, le fichier du dernier dossier (ordre lexical) qui tient sa classe ; `contract-1.1.0/policy/`
   tient exactement les classes servies ; un dossier daté ne tient que des classes servies. Un dossier daté plus ancien n'est jamais
   comparé à la table servie : il n'est jamais réécrit.
2. `srf_runbook_vitrine_t0_order` lit la release `contract-1.1.0` par son nom.

## Tueurs (inchangés, aux mêmes lignes)

- spec/contract-1.1.0/policy/btc-dir-1h.json:1 CONST "\"rows\":[]" -> "\"rows\":[ ]"
- docs/RUNBOOK-vitrine.md:47 CONST " docs/JOURNAL-PROVENANCE.md apps/site/data/harness-served.json" -> " apps/site/data/harness-served.json"

## Preuves

- Avant et après sur M-1 et M-3 : rouge à la base, vert au gel ; le test corrigé rougit encore sur un fichier daté altéré, un fichier non
  servi ajouté, un fichier daté supprimé.
- `node --test test/spec-1-1-0-release.test.ts test/surfaces-1-1-0.test.ts` : 39 sur 39.
- winlint `--base b9d327a4` : aucun danger. R-25 : 2 fichiers, +6 −6.
