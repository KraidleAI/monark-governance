# CHECKPOINT-1 DELTA U-4b-2 (validateur-humain, 2026-09-22, persisté verbatim par l'orchestrateur)

Modèle résolu : claude-fable-5-1

# CHECKPOINT-1 DELTA — PLAN — U-4b-2 (reprise sur le G0 PLIÉ, décisions 123 et 126)

Modèle résolu : claude-fable-5-1 (effort high). Validateur-humain, instance neuve, contexte frais, 2026-09-22. Rapport à persister par l'orchestrateur sous `F:\tmp\u4b-2\CHECKPOINT1-DELTA-lot-u4b-2.md` (Write interdit, AM-2).

**Décision : APPROUVE-AVEC-CORRECTIONS** (liste fermée §6 : six bloquantes à plier avant le G1 de -2a, cinq non bloquantes à déclencheur). L'ESCALADE du checkpoint-1 initial est **levée** par la décision 123. Aucune escalade nouvelle ; deux **lectures** signalées (§6 D-1 et §4 Q-NEW-1) qui deviendraient une divergence checklist/ruling — donc une escalade — seulement si l'orchestrateur les conteste.

## 1. Artefacts lus (jamais le fil du planificateur)
- `F:\Monark\docs\CHECKPOINT1-lot-u4b-2.md` (mon avis initial, ESCALADE, C-1..C-12) ; `F:\tmp\u4b-2\G0-lot-u4b-2.PLIE.md` (pli, 239 l.) ; `F:\tmp\u4b-2\MESURES.md` (M-0..M-23).
- `F:\Monark\docs\CHANTIERS.md` : décision 123 (l.622-627), 126 (l.646-652), et **127** (l.653-657, committée `31a9b42` PENDANT ma session — voir §7). `F:\Monark\docs\adr\ADR-U4b-calibration-episode-frais.md` (D1-D5, tuyaux l.22-27, amendement 2026-09-21). `F:\Monark\docs\G0-lot-u5.DRAFT.md` l.44, 238-251, 283 (Q-U5-0, renvoyée à ce checkpoint).
- Code (lecture seule) : `apps/harness/src/tools/gate.ts:446-489,515-533,584-606`, `cascade.ts:40-95,208`, `http.ts:36,101-105`, `packages/hikae/src/region.ts:62-74`, `packages/hikae/src/verdict.ts:40-62`, `packages/hikae/src/l3-gate.ts:131`, `packages/contracts/src/types.ts:202-207`, `schemas/coverage-verdict.schema.json:5,45`, `test/h5-trace-builder.ts:7,63,200`, `test/h5-e2e-probe.test.ts:4,48-100`, `apps/harness/test/cascade.test.ts:53`, `skills/monark/SKILL.md:3,9,58-60,75`, `apps/sentinel/test/fixtures/ukemi/u4b/U4b-scores-e2.jsonl` (meta + première ligne `score_a`, 565 lignes), `git ls-files` des fixtures u4b.

## 2. Intégrité et indépendance (CA-9, AM-2 ter)
Lecture + `Bash` de vérification seuls ; aucune écriture (ni dépôt, ni `F:\tmp`), aucun `git` d'écriture, aucun réseau, aucune variable d'environnement affichée (A-7), aucun rejeu de mutant (checkpoint PLAN). `git status --porcelain` = 0 ligne au début et à la fin. Sha256 AVANT = APRÈS sur 7 fichiers de code : `gate.ts c19a960b…`, `cascade.ts 2c3dd3d4…`, `registry.ts 03dfe77a…`, `calibration.ts 80758c4a…`, `attestation-binding.ts 82c9aebb…`, `fleet.ts 388b64e8…`, `ADR-U4b 74751138…`. `docs/CHANTIERS.md` a changé (`9aa27faf…` → `16cd879b…`) **par l'orchestrateur** : HEAD `3c6afde` → `31a9b42` (commits `f77c55f` G0 U-5 DRAFT + `31a9b42` décision 127 ; 3 fichiers `docs/` seulement, `git diff --stat`).

## 3. Ce que j'ai re-exécuté (commande → résultat)
| Vérification | Preuve | Résultat |
|---|---|---|
| Région gelée : formes admises | `types.ts:207` `{ kind: "interval"; lo; hi }` ; `coverage-verdict.schema.json:45` `"kind": {"const": "interval"}` ; seuls `set`/`interval` existent | **Aucune forme « upper bound » sur le fil.** La borne haute de 126 s'implémente `buildIntervalRegion(0, ŷ+q̂)` avec `kind:"interval"` inchangé (contrat gelé, §5 du pli). |
| `buildIntervalRegion` | `region.ts:62-74` : non-fini ⇒ `under_calib` ; `lo > hi` ⇒ throw ; `lo === hi` ⇒ abstention NDG-1 | Avec `lo = 0`, la garde NDG-1 ne se déclenche plus qu'à `ŷ + q̂ = 0` ; `q̂ = 0, ŷ > 0` donnerait `[0, ŷ]` `covered` — règle à pré-déclarer (§6 D-2). |
| Texte du résumé servi | `gate.ts:522-533` `gateVerdictSummary` imprime `region=[lo, hi]` (crochets, pas le mot) | Le mot « interval » n'apparaît que dans le texte BYO `gate.ts:130` et les contrats gelés — le mutant « interval » de 126 doit être **scopé** au texte de la classe liq. |
| Garde de largeur sur le chemin servi | `grep interval_too_wide` : seul `l3-gate.ts:131` sous `clockOpen` | Aucune garde de largeur sur le motif `stableRunVerdict` ⇒ la strate 0 (×227) sortira `covered`, pas `too_wide`. Rien à pré-déclarer. |
| Classe inconnue | `gate.ts:603` `throw new HarnessToolError("unknown task_class …")` | **Une classe inconnue ⇒ erreur d'outil (400 miroir), PAS `under_calib`.** Le pli D-2(b) (« classe B ⇒ `under_calib` (classe inconnue) ») est faux sur pièces — §6 D-4. |
| Observable de la strate dérivée en -2a | `verdict.ts:40-62` : `CoverageVerdict` sans `predictor_id` ; `registry.ts:72` `honestyText(task_class, predictor_id CLIENT, byo)` | Sur registre vide, deux ŷ de strates différentes produisent une sortie servie **indiscernable** ⇒ l'assertion 2a-7 « deux ŷ ⇒ deux strates serveur » via `registry.run` n'est pas falsifiable telle quelle — §6 D-3. |
| Re-pin h5 hors réseau | `h5-trace-builder.ts:7,63,200` : serveur in-process `127.0.0.1`, port éphémère ; `h5-e2e-probe.test.ts:48-100` sha LF pinné + `fixtures/PROVENANCE-h5-e2e-trace.md` | Le re-pin -2a est offline (§8 du pli « aucun réseau » tenable). `fixtures/PROVENANCE-h5-e2e-trace.md` n'est PAS exclu R-25 (`.md` hors `docs/`) — compté §5. |
| Étiquette v0 : surfaces qui la capturent | `grep -c` : `fixtures/h5-e2e-trace.json` 28, `h5-e2e-probe.test.ts` 14, `cascade.test.ts` 34 (dont `:53` = aucune `description` sur le fil), `openapi.test.ts` 5 ; `SKILL.md:58-60` ne cite pas la description | Périmètre 2a-5 exact ; le skill ne bouge pas en -2a. |
| Erreurs 400 nommées | `http.ts:36` `TOOL_ERROR_NAMES = {HarnessToolError, CascadeToolError, AttestToolError, CalibrateToolError}` ; `:101-105` sinon 500 | C-7 bien plié (2a-2). |
| Fixture committée (C-3) | `git ls-files` : `PROVENANCE-u4b.md`, `U4b-book-23545087.json`, `U4b-oracle-path-e2.jsonl`, `U4b-scores-e2.jsonl` ; ligne `score_a` = `{address, y, yhat, score, liquidated, strate, m_bps, pstar}` ; meta `cell_a.predictor_id` | 2a-6b/2a-7 ne lisent que `yhat`/`strate`/`meta.cell_a.predictor_id` — champs que U-4b-SCORE-1 **ne change pas** (`CHANTIERS.md:651` : « seuls digests/q̂ de cellule changent »). Robuste par construction, mais non écrit — §6 D-6. |
| ADR-U4b tuyaux | `ADR-U4b:27` « cascade retrait … État -2 … `no_cascade_class_in_harness` » | Périmé sous 123 (retrait = U-5) ; l'amendement 2a-8 doit réécrire cette ligne — §6 D-5. |

## 4. Réponses aux six questions fermées

**(1) C-1..C-12 : chacune est pliée ou formée avec déclencheur.**
| C | État sur pièces |
|---|---|
| C-1 | Plié (§1, D-10, §9(2), 2a-3 « no calibration committed yet »), simplifié par 123 — conforme. |
| C-2 | Plié : une seule définition de -2a/-2b (§1, §2, D-10, §7 cohérents). |
| C-3 | Plié **adapté** à 123 : source = `U4b-scores-e2.jsonl` (ŷ committé) au lieu de book + oracle-path ; `run` du descripteur `gate` + `handleJsonMirror` ; item 4 (book frais in-repo) formé. Recevable sous 123, avec la précision D-3/D-8. |
| C-4 | Plié (2b-3, mutant f). |
| C-5 | Plié (2a-1, 2a-6a, 2a-6b, D-4, `export-exclude-tests.json` dans le même sous-lot). |
| C-6 | Plié (2a-8, amendement daté ADR-U4b) — à compléter (D-5). |
| C-7 | Plié (2a-2, 2a-3, D-6, D-7) — la borne basse `max(0, ŷ−q̂)` est **supersédée par 126** (D-1). |
| C-8 | Plié (libellé H-3, mutant h « no other event ») — à mettre à jour avec les clauses 126 (1)/(2) (D-9). |
| C-9 | Formé avec déclencheur : périmètre conservé, déplacé à U-5/-5b (§10 dernier item ; le G0 U-5 DRAFT `f77c55f` §4 le porte en 4→4). |
| C-10 | Plié (§5 aucun bump ; §10 publication externe ⇒ go) — à relire sous 127 pour -2b (D-7). |
| C-11 | Plié (§12 MAST) — une ligne à ajouter (D-11). |
| C-12 | Plié (§7 R-25, chemin `fixtures/ukemi/u4b/`, provenance sans `anchor_price`/`pstar`/`m_bps`, A-7 item 6). |

**(2) L'ESCALADE est levée par 123.** Ma question fermée offrait A/B/C ; l'investisseur a rendu « D » (option architecte) : 51 maintenue à la lettre, remplaçant réel = producteur de ŷ (U-5), `cascade` non retiré par U-4b-2, -2a registre vide, -2b registre frais + `fleet.ts`. Les trois points de la collision CA-2/CA-3 (fenêtre `upcoming`, 4→3, D14) disparaissent du plan ; le RETRAIT DE RULING est consigné (§14, `error_origin` orchestrateur). CA-2 : **conforme**.

**(3) Q-NEW-1 — ACCEPTE** (lecture signalée). 123 l.624 place le producteur `fromRealizedBook` à U-5 ; le mot « inchangé » de l.625 renvoie au -2a re-périmétré de mon checkpoint (qui incluait l'adaptateur A-6 en 2a-5 du DRAFT) — ambiguïté relevée par Q-U5-0. Je tranche pour le pli (A-6 **hors** -2, home `packages/monark` construit en -5a) sur le motif CA-11, pas sur le calendrier : un `fromRealizedBook` livré en -2a n'aurait **aucun consommateur servi avant U-5** — exactement la pièce « construite sans être branchée » que la règle Branchement interdit, et son oracle d'égalité 565/565 est le test du tuyau producteur (U-5, §4 l.95 ; déjà mesuré par l'orchestrateur, `f77c55f`). Ce n'est pas une décision de valeur (123 a déjà placé le producteur) mais un ordre d'ingénierie. Conséquences exigées (D-8) : Q-U5-0 = « A-6 NON livré par -2a » figé dans l'état d'entrée de U-5 ; le `built` de -2b porte explicitement sur la **moitié consommatrice** (texte `served_by`/`note` de `fleet.ts` sans producteur servi sous-entendu). Si l'orchestrateur lit « inchangé » dans l'autre sens, c'est une divergence ⇒ ESCALADE ; sinon clos.

**(3) Q-NEW-2 — ACCEPTE.** `tools/list` n'est pas une « publication externe » au sens de 123 : 123 lui-même ordonne l'étiquette « v0, replaced at U-5 » dans le **texte SERVI**, « à fermer dans -2a », ET dit « aucune publication externe à ce stade » — les deux sont donc compatibles par construction. Dans le corpus, publication externe = MCP Registry / skill ClawHub / README / site (mon C-10 ; ruling NON vitrine de l'orchestrateur cohérent) ; la décision 127 le confirme : l'acte à go = « push ClawHub, soumission MCP Registry ». C'est un changement de contenu du 4ᵉ outil (51 Q2). Lecture signalée : 51 Q2 « version bumpée » vise un changement de comportement, pas d'étiquette (octets `Prediction` inchangés) ; 123 prévaut (« aucun bump »). Preuves : re-pin h5 hors réseau, skill non touché (§3).

**(4) Compatibilité avec 126 — NON compatible en l'état ; lignes du pli à changer** (numéros de `G0-lot-u4b-2.PLIE.md`) :
- l.18 : « un ruling sur le score est en instruction AVANT le prereg » → rendu (126, unilatéral `max(Y−ŷ, 0)`) ; -2a reste score-agnostique en libellé mais la FORME est tranchée.
- l.20 : chaîne `… → buildIntervalRegion → buildVerdict` → préciser `buildIntervalRegion(0, ŷ+q̂)`.
- l.47 (2a-2) : « borne basse de région = `max(0, ŷ−q̂)` écrite » → « région = `(0, ŷ+q̂_k)`, borne haute ; borne basse 0 par construction ».
- l.48 (2a-3) : « a conformal region for the calibrated class » → « a conformal **upper bound** on the liquidable amount for the calibrated class; the lower edge is 0 by construction, not a calibrated bound; abstains `under_calib` outside it » — jamais « interval » dans le texte de la classe.
- l.63 (2b-4) : « asserte la région (covered, borne/digest) » → asserte `lo === 0` et `hi === ŷ + q̂_k`.
- l.67 (note H-3) : « test exact bêta-binomial 5 % » → clause 126 (1) « conservateur sous ex æquo (atomes en 0 comptés couverts) » ; ajouter clause (2) : strate 100 ≤ n < 199 ⇒ q̂ = max rapporté tel quel dans le texte par strate.
- l.73 (D-1) : « que le score soit `|Y−ŷ|` ou une forme révisée » → score = `max(Y−ŷ, 0)` (126) ; sha D4 de `u4b-scores.mjs` = valeur post-SCORE-1 (D-6).
- l.106 (§5) : « scores `|Y−ŷ|` » → `max(Y−ŷ, 0)`.
- l.113 (§6 test 1) et l.153/155 (§9 (2)/(4)) : « région » → « borne haute », texte servi « upper bound ».
- l.125 (mutants) : ajouter (n) région symétrique `ŷ±q̂` servie ⇒ ROUGE ; (o) « interval » dans le texte de la classe ⇒ ROUGE (scopé) ; (p) règle q̂ = 0 (D-2).
- §12 : ligne MAST « dérive de forme » (D-11).
- Contrainte à écrire noir sur blanc : le champ `region.kind` du fil **reste `"interval"`** (contrat gelé, §5 « 5 contrats gelés intacts ») — « jamais interval » porte sur le texte servi. Sans cette phrase, un worker pourrait tenter un nouveau `kind` (rupture de contrat gelé) ou un G2 pourrait tenir `kind:"interval"` pour une violation de 126.

**(5) CA-11 — chemin servi et test nommés : oui.** Chemin : MCP `gate` + `POST /gate` via le même `HARNESS_TOOLS` (`registry.ts:58-122`, mesuré M-1). Test : `u4b_gate_serves_region_from_real_artifact` dans `apps/harness/test/`, via `run` du descripteur `gate` + un cas `handleJsonMirror`, source = fixture committée (2a-7, §4 l.91). **Mais** une de ses assertions de phase -2a n'est pas observable (§3, D-3) : à corriger avant G1, sinon CA-1 (critère non falsifiable).

**(6) R-25 par sous-lot — plausible, recompté sur les pièces** (pathspec M-18 ; `fixtures/PROVENANCE-h5-e2e-trace.md` compte, la trace `.json` non) :
- **-2a** : `ukemi-strata.ts` ~25 ; `gate.ts` branche (~50) + 400 nommés (~15) + textes (~20) + helper borne haute (~10) + message `known:` (1) ≈ 95 ; `attestation-binding.ts` ~4 ; `cascade.ts` étiquette ~6 ; re-pins `h5-e2e-probe.test.ts` (~2) + `PROVENANCE-h5` (~3) + `openapi.test.ts`/`cascade.test.ts` (~10) ≈ 15-30 ; tests : 2a-6a ~40, 2a-7 ~90, dispatch/400/class-lock/attested/no-prob/texte vide/v0 ~120, 2a-6b ~50, helper région ~25, D-2(b) ~10, export-exclude ~2 ≈ 340. **Total ≈ 480-500** (pli : 430 ; l'écart = 126 + D-2(b)). ≪ 1205.
- **-2b** : `calibration.ts` (sur e2 : 2 strates committables, 363 + 148 scores ≈ 64 lignes de données + gardes ~40 ≈ 110 ; frais inconnu) + émetteur ~60 + tests ~80 + `fleet.ts` ~15 + export ~5 + sous 127 (D-7) `SKILL.md:58-60`/README/openapi/h5 ≈ 20-30. **Total ≈ 300-400**, conditionnel au n/strate frais ; la re-scission « registre » / « fleet + test » est pré-déclarée (§7, Q-10). Conforme.

## 5. Checklist CA-1..CA-11
| Règle | Avis | Preuve |
|---|---|---|
| CA-1 | correction bloquante | Reformulation possible pour chaque tâche (§2 du pli) ; deux critères non falsifiables : strate∼ŷ via `registry.run` sur registre vide (D-3) ; D-2(b) « classe B ⇒ `under_calib` » contredit `gate.ts:603` ET D-2(a) grep = 0 (D-4). |
| CA-2 | conforme | 123 tranche la valeur ; 126 tranche le score (délégation « audite … et tranche ») ; le pli ne tranche rien de nouveau ; Q-NEW-1/2 rulées ici sans décision de valeur. |
| CA-3 | correction bloquante | Amendement ADR-U4b 2a-8 prévu (C-6) ; il doit aussi réécrire le tuyau `ADR-U4b:27` et rattacher 123/126 (D-5). Aucun gate suspendu. |
| CA-4 | conforme | Aucun fan-out ; chevauchement -2a / course Bell justifié par des fichiers disjoints (122). |
| CA-5 | conforme, ajout mineur | §12 présent (7 modes) ; ajouter la dérive de forme (D-11). |
| CA-6..8, CA-10 | n-a au PLAN | §8/§9 prévoient oracle + G2-delta contexte frais + `error_origin` ; aucun argument de vitesse. |
| CA-9 | conforme | Le présent avis a rejoué lui-même le §3 ; G2-delta en contexte frais prévu. |
| CA-11 / durci | correction bloquante | Tuyaux déclarés (§4) ; chemin servi et test nommés ; assertion inobservable (D-3) ; robustesse à SCORE-1 non écrite (D-6) ; -2b sous 127 (D-7). |
| Anti-close | n-a | Lot non-Bell ; C-12 tient (`pstar`/`m_bps`/`anchor_price` hors provenance `calibration.ts`). |

## 6. Corrections (liste fermée)
**BLOQUANTES (à plier dans le G0 avant le G1 de -2a)**
- **D-1 (126, forme).** Appliquer les changements de lignes du §4(4) ; écrire : « `region.kind` reste `"interval"` sur le fil (contrat gelé) ; le texte servi de la classe dit « upper bound », borne basse 0 par construction, jamais « interval » ; mutant scopé au texte de la classe (ni `vocab-banned.json`, ni texte BYO `gate.ts:130`) ». Extraire un helper pur `liqUpperBoundRegion(yhat, qhat) → buildIntervalRegion(0, yhat+qhat)` testable en -2a par littéraux (mutant symétrique ⇒ ROUGE) ; la composition sur artefact réel reste 2b-4.
- **D-2 (NDG-1 sous borne haute).** Pré-déclarer la règle pour `q̂ = 0` (servir `[0, ŷ]` ou `under_calib`) avec test + mutant ; la garde `lo === hi` de `region.ts:71` ne couvre plus ce cas (elle ne joue qu'à `ŷ + q̂ = 0`). Le pli décide, pas le G1.
- **D-3 (CA-1/CA-11, observable).** Soit le texte d'honnêteté servi de la classe porte la clé dérivée `…/s<k>` (« stratum k=<k> derived server-side from yhat » — sans revendication de couverture), et 2a-7 l'asserte ; soit 2a-7 phase -2a n'asserte que `under_calib` + les 400, et « strate∼ŷ » est prouvé par 2a-6a/2a-6b seuls (corriger §4 l.91).
- **D-4 (D-2(b)).** Remplacer « `task_class` B ⇒ `under_calib` (classe inconnue) » par « ⇒ `HarnessToolError` « unknown task_class » via `registry.run`, 400 via `handleJsonMirror` ; le nom de la classe B n'apparaît pas dans la liste `known:` du message » — cohérent avec D-2(a) grep = 0 (le libellé actuel exigerait le nom de B dans `gate.ts`).
- **D-5 (CA-3, ADR-U4b).** L'amendement daté 2a-8 réécrit aussi le tuyau `ADR-U4b:27` (« cascade retrait » → U-5/-5b, test `no_cascade_class_in_harness` à U-5), cite 123 (producteur = U-5) et 126 (score unilatéral, borne haute) ; SCORE-1 porte l'amendement D3/D4 (sha), 2a-8 y renvoie sans le dupliquer.
- **D-6 (ordre avec U-4b-SCORE-1).** Écrire : « -2a ne lit du JSONL que `yhat`, `strate`, `meta.cell_a.predictor_id` (invariants sous SCORE-1) ; sha D4 cité = valeur courante post-SCORE-1 au moment du G1 ; si le JSONL change entre G1 et fusion, re-pin déclaré au pli G2 ». Sinon les l.73/101 (`9ad20666…`) seront fausses à la fusion.

**NON BLOQUANTES (déclencheur indiqué)**
- **D-7 (127, G0 -2b).** -2b sert une nouvelle classe calibrée = « mise à jour majeure » au sens de 127 ⇒ `SKILL.md:58-60` (« two built-in task_class values »), README, openapi/h5 re-pin entrent dans le périmètre et le R-25 de -2b ; corriger §8 « `SKILL.md` non modifié » pour -2b seulement ; l'acte de push (ClawHub/Registry) reste un go par release. -2a inchangé (aucune surface publique).
- **D-8 (Q-NEW-1, précision CA-11 durci).** 2a-7/2b-4 : enveloppe `Prediction` = mapping unique et déterministe sur **toutes** les lignes `score_a` (ou règle de sélection pré-déclarée), `predictor_id` depuis `meta.cell_a.predictor_id` committé — jamais deux valeurs choisies à la main ; `fleet.ts` `served_by`/`note` : moitié consommatrice, producteur = U-5 ; état d'entrée du G0 U-5 : Q-U5-0 = « A-6 non livré par -2a » (déclencheur : pli du G0 U-5).
- **D-9 (126 clauses 1-2, texte par strate, -2b).** Note H-3 et texte servi par strate : conservateur sous ex æquo ; `q̂ = max` rapporté tel quel si 100 ≤ n < 199. Déclencheur : G1 -2b.
- **D-10 (R-25).** Reporter le recompte §4(6) dans §7 (-2a ≈ 480-500).
- **D-11 (MAST).** Ligne « dérive de forme : région symétrique réintroduite par copie du motif `stableRunVerdict` » → mutant (n).

## 7. Faits survenus pendant la session (pour l'orchestrateur)
HEAD a avancé `3c6afde` → `31a9b42` (décision 127 ; G0 U-5 DRAFT). 127 ne touche pas -2a ; il touche -2b (D-7) et confirme la lecture Q-NEW-2. Q-U5-0 du G0 U-5 (renvoyée « au checkpoint-1 delta de U-4b-2 ») est tranchée ici (§4 (3), D-8).

## 8. AM-1 — ce que la checklist a attrapé
Enum gelé `set|interval` vs « jamais interval » de 126 (forme du fil à écrire) ; NDG-1 désarmée par `lo = 0` (règle q̂ = 0 à pré-déclarer) ; assertion 2a-7 inobservable sur registre vide (`CoverageVerdict` sans `predictor_id`, `honestyText` avec le `predictor_id` client) ; D-2(b) contraire à `gate.ts:603` et à D-2(a) ; tuyau `ADR-U4b:27` périmé sous 123 ; robustesse à SCORE-1 non écrite ; -2b sous 127 ; `PROVENANCE-h5-e2e-trace.md` compté R-25. Manqué : à signaler a posteriori par l'orchestrateur.

## 9. Preuve de non-écriture
`git status --porcelain` = 0 ligne (début, fin) ; 7 sha de code AVANT == APRÈS (§2) ; `CHANTIERS.md` modifié par les seuls commits orchestrateur `f77c55f`/`31a9b42` ; aucun fichier créé sous `F:\tmp` ni ailleurs ; aucun `git` d'écriture.

Modèle résolu (R-1) : claude-fable-5-1.
