# G1 — Génération tracée, Lot M012-c (instrument + runbook + clôtures G2/checkpoint-2 de M012-b — ADR-M012 item (j))

- **Rattachement** : ADR-M012 item (j) (scission R-25 formée au G7 de M012-b) + `G2-lot-m012b.md` (C2, C3, RC1, O-a, O-b, O-d).
- **Générateur** : worker **`claude-opus-4-8[1m]`** (R-1), dispatché par l'orchestrateur `claude-fable-5-1`, 2026-09-18. Aucun commit (R-20).

## Livrables (2 nouveaux, 10 modifiés)
- `apps/sentinel/src/instrument.ts` **`ed828df1…`** — section `instrument`, jamais importée par `run.ts`, CLI séparée (`--out`) : fold de la
  fixture committée par les helpers flow/timeline ; **2 rejeux isolés** (`c = q̂` digest `ebf868d8…`, `ε = 0,01` digest `e6c8cd53…`) ≠ digest
  d'état live (`fb6ba08e…`) pour les mêmes scores ; **CUSUM de Page** (p₀ = 0,125, p₁ = 0,25) sur `E_static` des paires calmes + **contrôle par
  permutation** (mulberry32 de `@monark/hikae`, graine 20260917, N = 1000). **Mesuré** : statistique **9.544601** (n = 616, misses = 63 ; ≈ 9,54
  ADR §0 sur 613 — les 3 clôtures 10-13/14/15 ne bougent pas le max), **p = 1/1001**, exceed = 0 ; secondaire déclaré : all-evaluable 25.08
  (n = 694, misses = 116) ; `eps01_projected_bound_leq_target_T = 453` (vs 1789 à ε = 0,1). Aucune revendication ARL, aucune citation (item (h)
  non déclenché).
- `docs/RUNBOOK-sentinel.md` **`e03c6fb9…`** — brouillon M012-b verbatim + **RC1** (J0 = première fenêtre publiée, premier pas J0+1, T = pas live),
  **O-b** (premier run de production = drop-in `MONARK_SENTINEL_J0`, **jamais `--day`**), **O-d** (`public/` 0755 propriétaire `sentinel`, contrôle
  `stat` 0644), + ligne de forme JSON (conséquence O-a, déclarée) ; étape « première édition du bloc vitrine » intacte ; `docs/` non exporté.
- **C3** : `apps/harness/package.json` sous-chemin `"./calibration"` ; `timeline.ts` `ac357e7d…` et le test importent `@monark/harness/calibration`
  (arête sentinelle → harnais, jamais l'inverse ; ne charge que `calibration.ts`) ; `apps/sentinel/package.json` déclare `@monark/harness`
  (workspace, 0 externe) ; `package-lock.json` +1 arête (**même commit** sinon `npm ci` casse). 0 valeur/digest de calibration touché.
- **C2** : scope `sentinel` dans `vocab-banned.json` `8f68d0df…` (GLOBAL + 2 motifs adaptatifs D8 ; walk `apps/sentinel/{src,test}` + liste
  explicite des 5 fichiers `deploy/`) ; `collectTargets` exporté (`grep-forbidden.mjs` `1f30ccd4…`, `.d.mts`) ; **gate:vocab 117 → 129 fichiers**.
  Tests `vocab_sentinel_scope_scans_src_test_deploy` (load-bearing : retirer le scope sort les fichiers du walk) + `vocab_adaptive_coverage_reddens`
  étendu.
- **O-a** : `run.ts` `3282c9e0…` — `j0SourceOf()` exportée, résumé JSON avec `startDay` + `j0Source` ; `resolveStartDay` inchangé.
- Tests `sentinel.test.ts` **`c9cce3fb…`** (post G2 R-1/R-2 ; initial `78a5f28e…`) : `sentinel_instrument_separate_digest` (+ `exceed === 0`, forme
  p ≤ 1/(N+1)) + 3 assertions `j0SourceOf` + `sentinel_imports_bidirectional` durci (seul spécifieur `@monark/harness*` admis =
  `@monark/harness/calibration`, preuve de rougissement sur import nu) ⇒ **18/18**.

## Mutants (worker)
CLI réel : `// mutant: adaptive coverage` dans `instrument.ts:197` ⇒ `gate:vocab FAILED — 1 forbidden claim(s)` (scope sentinel) ; revert `cp`,
sha identique `ed828df1…` ⇒ OK 129.

## Oracle — worker : `ci` **253/253** ; sentinelle 18/18 ; ci-gates 22/22 ; `gate:vocab` 129 ; `lang:gate` 0 ; `lint` 0 ; `lint:ratchet` 69/69 ;
`export:check` 0 ; `diff --check` propre. **Orchestrateur (G7, post R-1/R-2)** : rejoué identique (253/253, 129, 0, 69/69, 0, 0, propre) ; **R-25 = 506** (205 suivis + 301 non suivis, lockfile/G1/G2 exclus).

## Déviations déclarées
Population CUSUM primaire = 616 paires calmes mécaniques (pré-enregistrée D2) ; rejeux (a)/(b) isolés à un paramètre ; scope vocab couvre les
5 fichiers `deploy/` ; ligne de forme JSON du runbook (O-a) ; contrôle `stat` en §4. **Item formé** : rejeu post-J0 des 11 mois sur la
timeline live (`--timeline <jsonl>`, même `buildInstrument`) — déclencheur : J0 passé + go 3.

## Clôture checkpoint-2 (C-1..C-3, 2026-09-18)
`error_origin` (G7) : G2 R-1 (garde d'import trop étroite) et R-2 (assertion trop lâche) = **générateur** ; G1 périmé pendant le checkpoint = **orchestrateur**
(artefact édité sous acceptation — à geler avant soumission la prochaine fois). L'oracle de `G2-lot-m012c.md` est **pré-R-1/R-2** (485, test `78a5f28e…`) ; l'arbre
final (`c9cce3fb…`, 506) a été rejoué par G7 et par le validateur. **C-2** : RUNBOOK §4 `systemctl edit` → drop-in explicite `override.conf` + `daemon-reload` +
`systemctl show -p Environment` avant `enable --now` — **RUNBOOK sha ré-épinglé : voir ligne suivante**. **C-3** : ADR item (l) rattaché à (h) (publication = citation ⇒
procurement précondition ; garde `--out` hors `public/`).
RUNBOOK-sentinel.md post-C-2 : sha256 `cd00e6707ed28c81fbbe9f17de30168150643fabe8aa45e54e70f3c023033dd7`.
