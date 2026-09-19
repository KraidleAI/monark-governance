# PLI — lot H-attested (G1) : étape 7 `attested-gate` de la trace h5

**Modèle résolu (R-1)** : `claude-opus-4-8[1m]` (préfixe `claude-opus-4-8` vérifié ; worker Opus 4.8, effort max).
Worktree `F:\Monark-wt-hatt`, branche `lot/h-attested`, base HEAD `c89c1d9`. Date 2026-09-19.
Worker : ne committe pas (R-20), aucun `git` d'écriture ; sortie vérifiée adversarialement (R-21).

## 1. Objectif atteint
Prouver **sur le chemin servi** (JSON-RPC in-process réel) que la prise `attested` du `gate` consomme la
sortie vive de `attest` (étape 6) et file son résidu dans le verdict **sans changer la décision** — preuve
committée, re-pinnée, rejouée par CI. Réalisé par une **étape 7 `attested-gate`** insérée après l'étape 6,
l'ancien miroir renuméroté 8, et un test nommé `h5_carries_attested`.

## 2. Fichiers livrés (6, sha256 LF)
| Fichier | sha256 (LF) | R-25 |
|---|---|---|
| `test/h5-trace-builder.ts` | `369c50a6880c737a643e174e0197b650ea6654c87cfeac1c0221376a7baeb609` | compté |
| `test/h5-e2e-probe.test.ts` | `c99176ff40541adba135016175fb8be3dc62d1994378561765f7aeb75ac25643` | compté |
| `fixtures/h5-e2e-trace.json` | `4ca37d5c731f33edb17b2cbe986a2bd7007df6371d1edf0b9352be70db8075f1` | **exclu** (`fixtures/**/*.json`) |
| `fixtures/PROVENANCE-h5-e2e-trace.md` | `90d29c75045b9d0c9c561f41f409401b15fdac5413f0055b1dd8eb2ed34971e6` | **compté** (`.md` de `fixtures/`) |
| `docs/adr/ADR-EC-lots-E-couteux-release-zero-dette.md` | `a279b3b72b70b8b97a1b6efed0d1fa9351c894ce6933f23ab624d95acb0db74b` | exclu (`docs/**/*.md`) |
| `docs/adr/ADR-M017-attested-price-dans-gate.md` | `c067405786aad8cf5d08fbc21e5cbf905ecf20502f11745abf3c30b0edebdfaf` | exclu (`docs/**/*.md`) |

`git status --porcelain` final = exactement ces 6 fichiers (`M`), aucun autre.

## 3. Trace re-pinnée
- **sha256 (LF)** = `4ca37d5c731f33edb17b2cbe986a2bd7007df6371d1edf0b9352be70db8075f1`, **21859 octets** (ancien 15731).
- Régénérée **par le builder uniquement** (`node scripts/record-h5-e2e-trace.mjs`, jamais à la main). Le
  recorder imprime `bytes: 21859` et `sha256(LF): 4ca37d5c…`, identiques à `wc -c` et au sha du fichier.
- **Pin cohérent aux trois lieux** : `test/h5-e2e-probe.test.ts` (`TRACE_SHA256_PINNED`), `fixtures/PROVENANCE-h5-e2e-trace.md`
  (ligne nom + sha), et le fichier lui-même (sha LF calculé).
- **Preuve ligne 292** : `sed -n 292p fixtures/h5-e2e-trace.json` =
  `            "subject": "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",` (URL Binance préservée).
- **Diff chirurgical** (`diff <(git show HEAD:fixtures/h5-e2e-trace.json) fixtures/h5-e2e-trace.json`) : la
  première divergence est **après la ligne 327** (rien au-dessus de l'étape 6 `attest` ne change, donc la l.292
  reste l'URL Binance) ; contenu ajouté = le bloc étape 7 `attested-gate` + le miroir renuméroté `"n": 8` + les
  deux clés `observed` `attested_gate_action`/`attested_gate_residual`. Aucune clé ajoutée avant `steps`
  (`generated_by`/`transport`/`honesty`/`closes` inchangés). `apps/harness/src/attestation-binding.ts` blob-identique
  (zone gelée), donc ses trois citations `:292` restent valides.

## 4. Contenu des livrables
- **L-1 builder** : étape 7 `attested-gate` (`gate` avec `BTC_DIR_PREDICTION`, `params` = **le même objet** que
  l'étape 5 par référence `gateBtcArgs.params`, et `attested = structuredOf(attest).price` = réponse **vive** de
  l'étape 6). `note` = `GATE_NON_REVERIFICATION_SENTENCE` **importée** de `apps/harness/src/tools/gate.ts` + `; only
  \`attested.residual\` is filed into \`verdict.residual\`; the decision is otherwise unchanged`. Miroir → `n:8`.
  `observed` gagne `attested_gate_action` (= `"commit"`) et `attested_gate_residual` (= les 3 résidus).
- **L-2 re-pin** : trace régénérée ; pin + commentaire + octets dans `probe.test.ts` (l.49-60) ; PROVENANCE :
  l.33 « four » → « five `tools/call` » ; chaîne l.40-43 `attest` → `AttestedPrice` → `gate(attested)` ; paragraphe
  daté « regenerated 2026-09-19 for ADR-EC H-attested (step 7 attested-gate added, mirror renumbered 8) » ; pin
  sha + 21859 octets **nom + sha sur la même ligne** (garde `series_pinned_are_declared_and_hashed`).
- **L-3 test `h5_carries_attested`** : asserte sur la trace **vive** ET la trace **committée** (fonction `check`
  appliquée à `[live, committed]`, sur avis de l'advisor pour capturer M5 côté committé) : (a) `verdict.residual`
  étape 7 deep-equal `attested.residual` étape 6 ; (a') `attested.residual.length ≥ 1` (via cast `as unknown[]`,
  sans re-déclaration) ; (b) réponse **entière** de l'étape 7 (content + structuredContent) **moins**
  `verdict.residual` = celle de l'étape 5, par `deepEqual` **et** `JSON.stringify` byte-identique ; (c)
  `attested.subject` ∈ `ATTESTATION_BINDING.get("btc-dir-15m")` (table **importée**) ; (d) `note` ⊇
  `GATE_NON_REVERIFICATION_SENTENCE` **et** cette constante ⊇ « not re-verified at call time » ; (e)
  `request.params.arguments.attested` étape 7 deep-equal `response.structuredContent.price` étape 6 ;
  `assertClosedGateDecision` sur l'étape 7.
- **L-4 docs** : ADR-EC l.44 → « **livré** : … chemin servi JSON-RPC in-process » (test déjà nommé col. 4) ;
  ADR-M017 : note datée sous l'item Tuyaux l.133-134 (« clos par H-attested, étape 7 ; test (3)
  `gate_attested_concordant_files_residual` préexistant, inchangé »).

## 5. Forme d'erreur MCP mesurée (M3) — consignée
Sujet hors table à l'étape 7 (`…?symbol=ETHUSDT` sur la classe `btc-dir-15m`), mesuré via client scratch
(`F:\tmp\h-attested\m3-probe.mjs`, importe `startServer`, rejoue `postOverWire`) :
- **HTTP 200**, `content-type: text/event-stream` ;
- enveloppe JSON-RPC = `{"result":{"content":[{"type":"text","text":"attested.subject is not consistent with
  task_class: subject '…ETHUSDT' is not a committed attestation subject for task_class 'btc-dir-15m'"}],"isError":true},"jsonrpc":"2.0","id":2}` ;
- **pas de membre `error`, pas de `structuredContent`** — la forme est `isError:true`, **non** une erreur JSON-RPC
  (le « 400 » de la spec/ADR est le miroir HTTP, pas la forme MCP).
- Conséquence sur le fil : `mcpSend` ne lève pas (status 200, `error` absent) et retourne `result` ; puis
  `structuredOf()` → `undefined` ; `field(undefined, "verdict")` → **TypeError** dans `buildTrace()` ⇒ (1)
  faithfulness et `h5_carries_attested` rougissent.

## 6. Mutants (copie `git archive HEAD` sous `F:\tmp\h-attested\copy`, node_modules jonctionné, jamais dans le worktree)
Contrôle non-muté d'abord **VERT** (2 tests). Chaque mutant : appliqué → rouge observé → restauré. Rapport de
**l'assertion réellement rougie** (preuve, pas raccourci) :

| Mutant | Où | Assertion rougie (mesurée) |
|---|---|---|
| **M1** couture retirée (`gate.ts:613` neutralisée) | copie | `h5_carries_attested` **(a)** « live: step 7 verdict.residual == step 6 attested.residual » + (1) faithfulness |
| **M2** décision altérée si `attested` (verdict.reason forcé `under_calib`) | copie | `h5_carries_attested` **(b)** « live: step 7 == step 5 minus verdict.residual (deep-equal) » + (1) ; (a) reste verte (résidu bien filé) |
| **M3** subject hors table à l'étape 7 (builder) | copie | `TypeError … reading 'verdict'` dans `buildTrace()` ⇒ (1) faithfulness + `h5_carries_attested` (forme MCP §5) |
| **M4a** octet trace committée modifié | copie | (1) faithfulness **d'abord** (probe:89) — la trace ne peut être modifiée en silence |
| **M4b** pin périmé, trace correcte (« re-pin oublié ») | copie | **(2) tamper** « committed trace sha256(LF) must match the pin » **seule** ; (1) et `h5_carries_attested` verts |
| **M5** étape 7 retirée de la trace committée | copie | (1) faithfulness + `h5_carries_attested` « no call step labelled attested-gate » (côté **committé**) |
| **M6'** `attested` = littéral avec **un résidu de plus** | copie | `h5_carries_attested` **(a)** d'abord (résidu 4 ≠ 3) + (1) — le littéral est capturé |
| **M6'-iso** littéral **résidu-préservant** (`sens_emis_digest` altéré) | copie | `h5_carries_attested` **(e)** **seule** « request.params.arguments.attested == step 6 …price » ; (a)(b)(c)(d) vertes — **preuve de non-vacuité de (e)** |
| **M7** `GATE_NON_REVERIFICATION_SENTENCE` blanchie | copie | `h5_carries_attested` **(d)** « the sentence states it is not re-verified at call time » + (1) (la constante blanchie coule dans la note vive et le sha `tools/list`) |

Note : la forme M6' du cahier (résidu de plus) rougit **(a)** avant (e) ; **(e)** est prouvée non-vacue par
**M6'-iso**. La forme M4 du cahier (trace modifiée) rougit **(1)** avant (2) ; **(2)** est isolée par **M4b**
(scénario « re-pin oublié » littéral).

**Restauration sha-exacte prouvée** (copie, après tous les mutants, = baselines enregistrées) :
- `apps/harness/src/tools/gate.ts` = `c19a960b726b7c194b17a32c4b337317a2810e320e28c21151aa6ef6e8e713eb`
- `test/h5-trace-builder.ts` = `369c50a6880c737a643e174e0197b650ea6654c87cfeac1c0221376a7baeb609`
- `test/h5-e2e-probe.test.ts` = `c99176ff40541adba135016175fb8be3dc62d1994378561765f7aeb75ac25643`
- `fixtures/h5-e2e-trace.json` = `4ca37d5c731f33edb17b2cbe986a2bd7007df6371d1edf0b9352be70db8075f1`

Contrôle re-rejoué après restauration : **VERT** (2 tests). Jonction `node_modules` retirée par `rmdir`
(jamais `rm -rf` sur la jonction — le worktree `node_modules` est intact, vérifié).

## 7. Oracle final (séquentiel, worktree)
- `npm run ci` (= `gate:vocab && typecheck && test`) : **377 tests, 377 pass, 0 fail** = base 376 **+ 1**
  (`h5_carries_attested` ; seul `test()` ajouté). Lancé **une seule fois** à la fin (avertissement port
  `apps/harness/test/server.test.ts`) ; **aucune** collision de port observée.
- `npm run lint` : 0 erreur.
- `npm run lint:ratchet` : **69/69** (aucune violation de typage-différé ajoutée ; sûreté du nouveau test par
  `unknown` + casts concrets `as`, `structuredClone`, `as unknown[]` pour `.length` — jamais `any`, jamais
  `Array.isArray` narrow vers `any[]`).
- `npm run lang:gate` : OK, 0 hit (le commentaire « global is RED by design » de `lang-gate.mjs` est **périmé** —
  mesuré 0 hit partout ; voir Reste).
- `npm run export:check` : OK, 0 chemin interdit, 0 hit français.
- `probe_harness_records_real_decision` : vert avec la trace re-pinnée.

## 8. R-25
`git diff --shortstat lot/etude-suite -- <pathspec exacte ligne \`STAT=\` de ci.yml>` (working tree inclus ;
`lot/etude-suite` == HEAD == `c89c1d9` dans ce worktree, donc le diff = mes changements working-tree) :
`3 files changed, 108 insertions(+), 28 deletions(-)` ⇒ **CHANGED = ins+del = 136** (budget 400), calculé par
l'awk de ci.yml. Répartition : `test/h5-e2e-probe.test.ts` (88), `fixtures/PROVENANCE-h5-e2e-trace.md` (28),
`test/h5-trace-builder.ts` (20). `fixtures/h5-e2e-trace.json` **exclu** (`:(exclude,glob)fixtures/**/*.json`) ;
`docs/adr/*.md` **exclus** (`:(exclude,glob)docs/**/*.md`).

## 9. Zone gelée / interdits
`git status --porcelain -- packages/hikae packages/contracts schemas apps/harness/src` = **vide** ;
`git diff --stat HEAD` sur ces chemins = vide. **Zéro octet** dans `packages/hikae`, `packages/contracts`,
`schemas/`, `apps/harness/src` (dont `attestation-binding.ts` et `gate.ts`, blob-identiques). Aucune édition
manuelle de la trace (régénérée par le builder). Aucun mot probatoire ajouté (probe test 7 vert : GLOBAL +
harness ne bannissent pas « re-verified »/« verify »/« verifier » ; `gate:vocab` vert). Aucun défaut réel de la
couture découvert ⇒ aucun item formé côté couture.

## 10. Reste (honnête — aucune dette nue)
- **Sûreté ratchet par cast, non par validation** : `h5_carries_attested` accède aux données JSON par `unknown` +
  casts concrets (`as unknown[]`, `as Record<string, unknown>`, `as { params: { arguments: { attested: unknown } } }`),
  pas par `assertClosed*` typant. 69/69 tenu ⇒ **aucune dette** ; signalé pour que G2 ne le redécouvre pas.
- **Hors lot (observations, non des patchs)** : (1) `scripts/lang-gate.mjs` porte encore l'en-tête « global is RED
  by design » alors que le bare `npm run lang:gate` mesure **0 hit** dans tous les scopes — commentaire périmé,
  hors périmètre H-attested (zone `scripts/`, non touchée) ; (2) **RETIRÉ (G2 COR-1, `error_origin` worker)** : l'en-tête de `scripts/record-h5-e2e-trace.mjs` ne numérote pas le miroir (« + the HTTP/JSON mirror », mesuré : aucune mention « step 7 ») — il reste exact ; item fantôme supprimé. Le point (1) reste un **item formé à déclencheur** (prochaine
  passe touchant `scripts/`), pas des « dûs » nus : aucun octet à modifier dans H-attested (interdits + R-25).
- **Union `AttestedPrice | AttestedBook` sur la prise (U-4)**, clés (K-1), BYO + `attested`, liaison temporelle :
  hors périmètre, déjà formés ailleurs (ADR-EC / ADR-M017).

## 11. Provenance
Généré par worker `claude-opus-4-8[1m]`, effort max, 2026-09-19, worktree `F:\Monark-wt-hatt`. Advisor consulté
(Fable 5.1) avant implémentation et à la clôture ; conseils intégrés (double assertion live+committed pour M5 ;
retrait du canonicaliseur trieur de clés au profit de `structuredClone`+`deepEqual`+`JSON.stringify` ; M4b/M6'-iso
d'isolation ; écriture de ce PLI comme entrée du pipeline de gates). Revue G2 (Opus 4.8 contexte frais),
checkpoint-2 validateur, G7 orchestrateur : à venir. Worker ne committe pas (R-20).
