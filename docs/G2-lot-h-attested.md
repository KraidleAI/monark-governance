# Revue G2 — lot H-attested (gel `a7d9c6b` sur `lot/h-attested`, base `c89c1d9`)

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié ; relecteur Opus 4.8, instance séparée, contexte frais, effort max).
Relecteur ≠ générateur (P6). Rejeux sur copie `git archive a7d9c6b` → `F:\tmp\g2-hatt\copy` (`npm ci`, `TEMP/TMP/TMPDIR=F:/tmp`, rien sur C:). Date 2026-09-19.

## VERDICT : APPROUVÉ-AVEC-CORRECTIONS (liste fermée, 1 item)

- **COR-1 (doc, `error_origin: worker` G1)** — PLI §10 « Reste » item (2) est un **fantôme** : il affirme que `scripts/record-h5-e2e-trace.mjs` « décrit encore l'étape 7 comme *the HTTP/JSON mirror* ». Mesuré : **aucune** mention « step 7 » dans ce script (grep=0) ; son en-tête l.4 dit génériquement « + the HTTP/JSON mirror », qui reste **exact** (le miroir est l'étape 8, non numérotée dans la prose). Un item à-déclencheur fondé sur un défaut inexistant pollue le registre (R-21). Corriger/retirer la phrase. Aucun octet de code concerné ; le reste du lot est intact. Gravité doc, non bloquant sur la substance.

## Checklist (9 points de mission + template G2)
1. **Diff `c89c1d9..a7d9c6b`** — exactement 7 fichiers : `docs/PLI-lot-h-attested.md`, `docs/adr/ADR-EC-…`, `docs/adr/ADR-M017-…`, `fixtures/PROVENANCE-h5-e2e-trace.md`, `fixtures/h5-e2e-trace.json`, `test/h5-e2e-probe.test.ts`, `test/h5-trace-builder.ts` — rien d'autre. `git diff --quiet c89c1d9 a7d9c6b -- packages/hikae packages/contracts schemas apps/harness/src` = **vide** (exit 0). OK
2. **Trace** — regénérée par le builder sur la copie (`node scripts/record-h5-e2e-trace.mjs`) → **byte-à-byte identique** à la committée : `cmp` silencieux, sha(LF)=`4ca37d5c…8075f1`, **21859 o**. Pin cohérent aux 3 lieux : test l.62 `TRACE_SHA256_PINNED`, PROVENANCE l.65 (**nom + sha même ligne**, garde `series_pinned_are_declared_and_hashed`), fichier. `sed -n 292p` = URL Binance. Diff vs `c89c1d9` = `327a328,431` (ajout **après** l'étape 6) puis `380a484` (`observed`) ; aucune clé avant `steps` modifiée. OK
3. **Étape 7** — `attested = structuredOf(attest).price` **vif** de l'étape 6 (builder l.234) ; `note` ⊇ `GATE_NON_REVERIFICATION_SENTENCE` **importée** de `gate.ts:117` (octets identiques à la description) ; `observed.attested_gate_residual`/`attested_gate_action` présents ; miroir renuméroté `n:8` ; consommateurs positionnels de `steps` (grep `steps\[[0-9]`) = **0** (accès par `.find(label)`). OK
4. **`h5_carries_attested`** — (a)(a')(b)(c)(d)(e) + `assertClosedGateDecision`, appliqué à `[live, committed]`. Mesuré sur la trace : s5 `verdict.residual=[]` vs s7 `=[3 atomes]` filés de l'étape 6 ; `content` s5≡s7 (le résidu n'est **jamais** dans `content` → (b) « réponse entière moins `verdict.residual` » correctement porteur) ; ids 5≠7 (request exclu) ; (c) lit `ATTESTATION_BINDING.get("btc-dir-15m")=[Binance URL]` **importée**. Sûreté de type par casts `unknown` concrets (pas d'`any`) : ratchet **69/69** tenu ⇒ **acceptable**, pas de correction.
5. **Mutants** — 9 PLI + 2 de mon cru, **tous tués, 0 survivant**, restauration sha-exacte prouvée (tableau ci-dessous). Forme d'erreur MCP mesurée **indépendamment** (mini-probe `startServer`+wire, subject ETHUSDT, AttestedPrice complet) : **HTTP 200**, `content-type: text/event-stream`, **pas de membre `error`**, `result.isError:true`, **pas de `structuredContent`**, texte « attested.subject is not consistent with task_class … 'btc-dir-15m' » — confirme le PLI §5 (le « 400 » n'est que le miroir HTTP).
6. **Oracle (copie)** — `npm run ci` = **377 tests / 377 pass / 0 fail** (0 EADDRINUSE, aucune collision de port avec la G2 parallèle) ; `lint` 0 ; `lint:ratchet` **69/69** ; `lang:gate` (bare = global) **exit 0, 0 hit** partout ; `export:check` 0. Grep probatoire `verified|proven|certified|confidence` sur `test/`+`fixtures/` ajoutés = uniquement « re-verified » (négation-licite) et « PROVEN » (dans « PROVENANCE ») — 0 mot probatoire nu. OK
7. **R-25** — pathspec **exacte** de la ligne `STAT=` de `ci.yml`, `lot/etude-suite...a7d9c6b` : `3 files changed, 108 ins, 28 del` ⇒ **CHANGED=136 ≤ 400** (test 88, PROVENANCE 28, builder 20 ; `.json` fixtures et `docs/**/*.md` exclus). **merge-tree** (clone) : (h-attested, `lot/etude-suite` HEAD `2e07fa6a`) exit 0 / 0 conflit ; (h-attested, u-1b-b `04d45d4`) exit 0 / 0 conflit ; ordre inverse = **même tree oid** (`4e0c6cb2…`). Intersection des fichiers des deux lots = **∅**. OK
8. **CA-11** — ADR-EC l.44 « **livré** … chemin servi JSON-RPC in-process » **honnête** (test `h5_carries_attested` existe et prouve la couture servie) ; ADR-M017 note datée (clôt l'item Tuyaux l.133-134 ; test (3) `gate_attested_concordant_files_residual` préexistant **inchangé**) ; `fleet.ts` **blob-identique** (quiet) ; aucune surface publique modifiée. OK
9. **« Reste »** — (1) en-tête « global is RED by design » de `lang-gate.mjs` : **confirmé périmé** (global mesuré 0 hit, exit 0), honnête, hors périmètre (`scripts/` gelé), item à-déclencheur → **acceptable**. (2) → **COR-1** (fantôme). Casts → acceptables (69/69).
   *Template G2* : compréhension P3 OK ; validation d'entrée conservée (guard subject↔classe + schéma de sortie, tous deux mesurés) ; pas de dép. nouvelle ; pas de duplication ; TODO/FIXME nu 0 ; revue 3-étapes AgileCoder faite.

## Tableau des mutants (assertion réellement rougie, mesurée)
| Mutant | Cible | Assertion rouge mesurée | Restauré |
|---|---|---|---|
| **M1** couture retirée | `gate.ts:613` | h5 **(a)** « live: step 7 verdict.residual == step 6 attested.residual » + probe (1) | sha OK |
| **M2** décision altérée (`verdict.reason`) | `gate.ts:613` | h5 **(b)** « live: step 7 == step 5 minus verdict.residual (deep-equal) » + (1) | sha OK |
| **M3** subject hors-table | `builder:234` | `TypeError … 'verdict'` dans `buildTrace()` ⇒ (1)+h5 ; **forme MCP** mesurée (200/event-stream/`isError:true`/pas d'`error`/pas de `structuredContent`) | sha OK |
| **M4a** octet trace committée | trace | probe **(1)** « committed trace must equal the freshly-driven live trace » | sha OK |
| **M4b** pin périmé, trace correcte | `test:62` | probe **(2)** « committed trace sha256(LF) must match the pin » **seule** | sha OK |
| **M5** étape 7 retirée (committé) | trace | h5 **committé** « Error: no call step labelled attested-gate » | sha OK |
| **M6'** résidu de plus (4 uniques) | `builder:234` | h5 **(a)** (résidu 4≠3) + (1) | sha OK |
| **M6'-iso** digest altéré, résidu-préservant | `builder:234` | h5 **(e) SEULE** « live: step 7 request…attested == step 6 …price » — (a)(b)(c)(d) vertes | sha OK |
| **M7** constante blanchie | `gate.ts:118` | h5 **(d)** « live: the sentence states it is not re-verified at call time » | sha OK |
| **Own-1** `verdict.calib_digest` (hex valide) altéré si attested | `gate.ts:613` | h5 **(b)** — prouve que (b) attrape un champ verdict **hors `reason`** | sha OK |
| **Own-2** subject committé hors-table (étape 6 + carried) | trace | h5 **(c) SEULE** « committed: attested.subject is a committed btc-dir-15m subject » — isole une assertion qu'aucun mutant PLI ne tue | sha OK |

Note : Own-1 avec un `calib_digest` de **format invalide** est intercepté par la **validation de schéma de sortie** (isError→TypeError) **avant** (b) — 2ᵉ ligne de défense observée ; d'où la variante hex-valide ci-dessus pour isoler (b).

## Chiffres mesurés (par le relecteur)
- `npm run ci` : 377/377/0 (durée ~32 s). `lint` 0. `lint:ratchet` 69/69. `lang:gate` exit 0. `export:check` 0. `gate:vocab` 163 fichiers, 0.
- sha(LF) trace regénérée == committée = `4ca37d5c731f33edb17b2cbe986a2bd7007df6371d1edf0b9352be70db8075f1`, 21859 o.
- 4 baselines (recomputées, pré/post mutants) : gate.ts `c19a960b…`, builder `369c50a6…`, test `c99176ff…`, trace `4ca37d5c…` — identiques après restauration ; contrôle final vert (2/2).
- R-25 : `3 files changed, 108 insertions(+), 28 deletions(-)` → 136. merge-tree oids : etude-suite `64bc6a0d`, u-1b-b `4e0c6cb2` (ordre-indépendant).

## Provenance
Revue G2 par `claude-opus-4-8[1m]`, effort max, contexte frais, 2026-09-19. Rejeux hors dépôt (`F:\tmp\g2-hatt\`), aucune écriture dans le worktree ni le dépôt (R-20), copie via `git archive` + mutate/restore sha-vérifiés. Advisor consulté (Fable 5.1) avant la campagne de mutants et à la clôture. Verdict adversarial ; G7 + checkpoint-2 restent chez l'orchestrateur/validateur. Observations non bloquantes : (a) C-1 (G0) cite `gate.ts:120`, réel `:117` (texte validateur, pas worker) — note, pas correction de ce lot ; (b) le commentaire test l.210 dit « attested.subject **of step 7** » alors que (c) lit le sujet de l'**étape 6** (`attestStep.response…price`) — non-défaut : couverture de l'étape 7 assurée par (c)+(e) conjointes (Own-2 a dû muter les **deux** sujets pour isoler (c)) ; commentaire à préciser, cosmétique.
