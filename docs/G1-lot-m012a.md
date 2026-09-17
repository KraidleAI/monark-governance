# G1 — Génération tracée, Lot M012-a (gouvernance + textes d'honnêteté ; sans code sentinelle — ADR-M012)

- **Rattachement** : `docs/adr/ADR-M012-narabi-live-sentinel.md` (D7, D8, D9) + `docs/PLAN-m012-narabi-live.md` (§5 découpage a/b).
- **Générateur** : worker **`claude-opus-4-8[1m]`** (R-1 vérifié), dispatché par l'orchestrateur `claude-fable-5-1`, 2026-09-17,
  deux passes (rapport initial + 3 consultations formées tranchées par l'orchestrateur). Aucun commit (R-20).
- **Checkpoint-1** : validateur ACCEPTE-AVEC-CORRECTIONS C-1..C-14 foldées ; escalade tranchée par l'investisseur : ε = 0,1,
  option B « plus tard », AM-2 bis entériné (`validateur-humain.md` amendé).
- **Rulings orchestrateur** : (1) `GATE_TOOL_DESCRIPTION` interpole `${STABLE_RUN_COMMITTED_SENTENCE}` (B-2) ⇒ `tools/list`
  dérive réellement, h5 re-pinné ; (2) motifs « adaptive » aussi dans `narabi_docs` (AC-5 sur README) ; (3) en-tête
  `tracker.ts` **reverté** (sha `37db3331…` = HEAD), reporté à M012-b (ADR D9 amendé).

## Livrables (10 fichiers suivis, +109/−26 ; 2 non suivis)
- `apps/harness/src/tools/gate.ts` — sha **`8a1a10e7935884f3134f168c377b7ca7fcd857f4326d096a2c171d8eac185196`** : phrase D7
  (Barber Thm 2, « not estimated here … not assumed here; no coverage is measured »), JSDoc, interpolation dans la
  description. `Candes` ASCII (lang:gate/export:check ; précédent `l1-split.ts:6`).
- `vocab-banned.json` — sha **`d6adaaf69077fceb9a0f26b3808eea4862f6151714fd9d166083e14e955fb69b`** : `adaptive(ly)?\s+(cover|
  guarantee|region|gate)` et `(coverage|region|gate)\s+adapt` sur site/harness/skills/narabi_docs ; `README.md` → `narabi_docs`.
  Pas d'`exemptPhrases` (la phrase D8 ne matche aucun motif ; une entrée inerte ferait rougir `vocab_site_confidence_exemption`).
- `test/ci-gates.test.ts` — `vocab_adaptive_coverage_reddens` (4 scopes) ; `apps/harness/test/gate.test.ts` — `gate_sentence_barber`.
- **h5 re-pin** : `tools/list` `response_sha256` **`09cd5b37…3bf3` → `94af6409267cb98bc9ff26da5e3a9a7e18653f9787ee8d7f3402ebc7b98acdee`**
  (`test/h5-e2e-probe.test.ts:56`, `fixtures/PROVENANCE-h5-e2e-trace.md:54`, `fixtures/h5-e2e-trace.json` régénéré, 15731 octets).
- Amendements datés : ADR-M008 D7 + D8 (décision investisseur verbatim, `error_origin = n/a`) ; ADR-M009 §10 (copie unique de la
  phrase D8) ; ADR-M005 addendum D15 (seconde unité, utilisateur `sentinel`, `handle_path /narabi/*` dans le bloc vitrine).
- Non suivis : `ADR-M012`, `PLAN-m012`.

## Mutants / tests (rapport worker ; à rejouer G2, checkpoint-2, G7)
« adaptive coverage » / « the gate adapts » / « adaptively covers » ⇒ ROUGE ×4 scopes ; phrase D8 exacte ⇒ VERT sans exemption ;
retirer les deux motifs ⇒ les 3 mutants passent (load-bearing). `harness_tool_descriptions_pass_vocab` VERT sur la description
composée. `probe_harness_records_real_decision` VERT (trace live = committée, sha = pin).

## Oracle (worker) — `npm run ci` **234/234** ; `gate:vocab` OK 117 fichiers ; `lang:gate` 0 ; `lint:ratchet` 69/69 ; `lint` 0 ;
`export:check` 0. **R-25 = 388 / 1205** (135 suivis + 253 non suivis).

## Findings résiduels
- Redondance mineure : la description porte à la fois la queue « every other … abstains (under_calib) » de la phrase committée et
  `${STABLE_RUN_UNCALIBRATED_SENTENCE}` (exigé par `gate.test.ts:468`) — cohérent, non bloquant ; à raccourcir dans un lot ultérieur.
- Prochaine étape : G2 fraîche → checkpoint-2 → G7 → commit M012-a ; puis M012-b (sentinelle, en-tête `tracker.ts`).
