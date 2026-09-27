claude-opus-5-5[1m]
# ADR-NARABI-2 — suite PAROXYSME-NARABI-1 : S1 servie, rejeu sans `pow` (S4), taux de référence de rolling90 (S3), X8/X10 tués — projet G0 pour checkpoint-1

- **Statut** : proposé (G0, projet worker). Checkpoint-1 dû ; aucun code avant son acceptation ET l'ordre d'engagement de la décision 259 (10) (corrections PR-4b et deux cp-2 clos).
- **Horloge** (`date -u`) : début 19:30:14Z ; rédaction 19:54Z ; sceau `ADR-NARABI-2.md.sha256`.
- **Base** : `F:\Monark`, `lot/etude-suite`, HEAD `7b83b57`, arbre propre, lu seulement ; aucun réseau, aucun git écrivant, aucun verrou.
- **Rédaction** : worker `claude-opus-5-5[1m]`, effort max ; advisor intégré (canal 1) consulté avant rédaction et avant livraison (avis, jamais verdict).
- **Décisions déclinées, non rediscutées** : 259 — QI-1 (B), QI-2 (A) conditionnel, QI-3 (A), QI-5 (A). Hors lot : C-PX2-c, C-PX1-b.
- **Entrées** : SYNTHESE-NARABI-1 §2 (PX-1, 2, 4, 14), §4-§6 ; avis defi A1-A3, marché B1, advisor C3/C5 ; CHANTIERS:1888 ; code et ADR cités fichier:ligne.

## D1 — Invariants (QI-1 (B))
Aucun PR ne touche la région du gate (q̂ committé), les paramètres officiels (`timeline.ts:20`), `trackerDigest`, `hashedFields`/`line_hash` (`timeline.ts:94-101`), `state.json`. Aucun nouveau segment de digest. `tracker.ts`, `timeline.ts`, `run.ts` : diff = 0.

## D2 — PR-N2-1 = S1 + S4 (C-PX1-a, C-PX10-a)
**S1** remplace la queue de `STABLE_RUN_COMMITTED_CORE` après « redemption flow; » (`gate.ts:117-121`), retouches defi A3 incluses :
> « coverage is stated under Theorem 2 of Barber, Candes, Ramdas and Tibshirani 2023 (split conformal, unit weights): at least 1 − α minus the average, over calibration pairs, of the total-variation distance between the distribution of the residuals and the same residuals with that pair swapped for the test pair; that distance is not estimated here, consecutive pairs share a window and the calibration is measured non-stationary across half-years, so the bound is at least 1 − α only if that distance is zero, which is not assumed here; no coverage is measured »

Invariant testé : S1 garde verbatim les 4 clauses fermées de `scripts/sync-harness-served.mjs:64-68` et les 3 de `apps/site/lib/how-copy.ts:82-86` (sinon `harness-served.test.ts:119`, `narabi-live.test.ts:892` et le `need()` du sync rougissent).

**S4′** (reformulée : la synthèse attribue les opérations binary64 au seul tracker ; or le score passe par deux divisions binary64 et une soustraction, `adapter-narabi.ts:197-198`, `timeline.ts:136`, et `bound_thm1` par `pow`, `timeline.ts:40-44`). Surfaces : README « Replay them yourself » et `/docs/verify` (site, régime T2) :
> « Replaying the scores and the tracker's threshold q needs only exact integer division, IEEE 754 binary64 conversion, subtraction, multiplication and division, which the standard requires to be correctly rounded, and comparisons, once each line's published step eta is taken as input instead of being recomputed: eta and the printed bound come from the engine's power function, an operation the standard only recommends, so engines may round it differently. »

Aucune affirmation sur ECMA-262 (P-PX10-a non lu). Construction : `packages/hikae/src/tracker-replay-eta.ts` (nouveau ; `trackerReplayFromEta(q1, alpha, steps)` = `imocpStep` + comparaison stricte, aucun `**`) ; rejeu de référence Python stdlib `apps/sentinel/test/replay_eta.py` (≈ 60 l.), ajouté à `vocab-banned.json` `scan.sentinel.files` (ligne d'ADR). Test `narabi_replay_eta_bit_exact` : série committée pliée par `initState`/`step` + capture live committée ; Node et Python rejouent depuis η publié ; `q_after` égal au bit (`writeDoubleBE`), digest égal. **En CI, python3 absent = rouge, jamais un saut** (saut déclaré en local seulement : sinon on recrée le motif X8/X10).

## D3 — Couplage servi de S1 (constat mesuré, bloquant au G7)
`buildOpenApi()` embarque la description (`openapi.ts:73`). Trois enregistrements committés épinglent l'octet servi : `docs/deploy-CA-harness.json` (check « openapi ») et `apps/site/data/narabi-served.json` (`narabi-live.test.ts:575-577`), `apps/site/data/harness-served.json` (`harness-served.test.ts:79`). Toute édition de `STABLE_RUN_COMMITTED_CORE` les rougit jusqu'à : redéploiement du harnais (go investisseur) → `verify-harness.mjs --out docs/deploy-CA-harness.json` → `sync-harness-served.mjs` et `sync-narabi-served.mjs` → re-pins `PINNED` (`harness-served.test.ts:48-52`) et `manifest.sha256.json`. Dans la PR, sans réseau : trace h5 ré-enregistrée, `TRACE_SHA256_PINNED` (`h5-e2e-probe.test.ts:80`), `PROVENANCE-h5-e2e-trace.md`, `PINNED[H5]`, manifest. Séquence : gel → go → redéploiement depuis le SHA du gel → CA + syncs (actes réseau de l'orchestrateur) → pli « enregistrements » → cp-2 → G7. `RUNBOOK-harness.md:36-42, 65` expédie `git archive … HEAD` depuis la machine de l'orchestrateur : un arbre au SHA du gel est admissible, aucune règle lue n'exige le tronc (à confirmer). `deploy-CA-harness.json` compte au R-25 (seul `docs/**/*.md` est exclu). Scission : Q-N2-2.

## D4 — PR-N2-3 = PX-14 (QI-5 (A), nouveau lot sur le gel 3 `b45db28`)
- **X8** : `realpathFor(platform)` exporté (`instrument-replay.ts:186`) ; test d'identité `realpathFor("win32") === realpathSync.native`, `realpathFor("linux") === realpathSync` ; `pathKey` reçoit un résolveur injectable (défaut inchangé), test espion.
- **X10** : garde extraite en `linkOrSkip(create, skip)` ; méta-test : erreur non-EPERM ⇒ lève, EPERM ⇒ `skip` appelé.
- Tués sur tout hôte. `sentinel_sha` (`run.ts:156-161`, hors hachage) change au prochain redéploiement : déclaré au JOURNAL-PROVENANCE ; redéploiement = go (hors lot).

## D5 — PR-N2-2 = C-PX4-a (QI-3 (A))
- **Nulle** : iid Bernoulli(p) sur la sous-suite des paires calmes consécutives, E_static contre q₁ (`timeline.ts:142-145`) = `state.calmMiss` après pli de la série committée par `initState`/`step` (même pli qu'`instrument-replay.ts:141-166`) ; `CALM_WINDOW`, `DRIFT_THRESHOLD` importés (36/90 exact en binary64).
- **p, rendus, jamais tapés** : p̂ = ratés / paires calmes (≈ α par construction de q̂, déclaré) ; p_ref = max in-sample du glissant-90 (27/90, ADR-M012 D6).
- **Densité déclarée** : d = 365 × paires calmes / paires de la série committée, rendue par le script (≈ 321 = 365 × 616/700 [calc. worker sur la fixture]) ; le « 336 calmes / 365 j » d'ADR-M014:106 porte sur une fenêtre non précisée et n'est pas repris.
- **Calcul** : loi exacte du scan (Glaz Thm 13.2, Fu 2000) ; contrôles (13.48) avec Q′₂ exact (13.5) et Q′₃ (13.6), (13.79) ; énumération exhaustive sur petits (m, k, N) ; Monte-Carlo à graine (contrôle, jamais publié).
- **Préconditions de la mission** : rendus Glaz p. 223, 224-225, 232, 241 (acte interne, QO-4 (A), désormais dus) ; faisabilité du Thm 13.2 à (90, 36) établie au rendu (E3 D4 « 72 états » = [dériv. non certifiée]) ; Q-N2-1 et Q-N2-3 fermées.
- **Fichiers** : `apps/sentinel/src/scan-rate.ts` (CLI à garde) ; `apps/sentinel/test/sentinel-scan-rate.test.ts` ; README « What Narabi is NOT » (S3 rendue par le test depuis les données).
- **Format de rendu** : p à 3 décimales ; d entier ; ARL à 2 chiffres significatifs, notation scientifique au-delà de 10⁶ (`2.4e13`).

## D6 — S3 (gabarit ; portées narabi_docs, site, sentinel, harness vertes)
> « rolling90 carries no false-alarm bound: under a reference null of independent calm misses, the 36-of-90 threshold is first reached after about {arl_ref} calm pairs on average, counted from the first calm pair, at the in-sample record rate {p_ref}, about {y_ref} years at {d} calm pairs a year, and after about {arl_hat} at the calibration's own calm rate {p_hat} (scan statistics, Glaz, Naus and Wallenstein 2001); calm misses are serially dependent, so these are reference rates, not bounds. »

Remplace « rolling90 carries no false-alarm control » (prévue par ADR-M014:111, servie nulle part aujourd'hui). Indicatif [calc. worker, non certifié, jamais publié] : ARL à p = 0,30 ≈ 830 paires (MC 2·10⁴ tirages, e.s. 5) contre 1/u ≈ 318 entre franchissements montants ; l'écart ×2,6 fonde Q-N2-1.

## D7 — Oracle lexical
Chaque phrase servie passe `gate:vocab` (portée de sa surface ; fichier racine `vocab-banned.json`, la mission cite à tort `apps/harness/`), `lang:gate`, et `site_names_no_kitchen` pour `apps/site`. Un test par PR repasse les chaînes rendues par `compilePatterns`/`scanText` (patron A-9 d'`instrument-replay`). Licites : rate, reference, bound ; jamais « probability of being right », « proven », « guaranteed ». Pré-oracle rejouable (scratchpad `n2/lex.mjs`, oracles du dépôt importés en lecture, pas le gate CI) : S1, variante Q-N2-4, S4′, S3 ×2 = 15 cellules vertes ; 7 mutants = 11/11 rouges.

## D8 — Ordre, dépendances, prix (R-25 : asc. ≤ 547, ×2,1, STOP 1 150)
| PR | Dépend de | asc. | ×2,1 | C (j) | Mutants tués attendus |
|---|---|---|---|---|---|
| N2-1 | 259 (10) ; go redéploiement avant G7 | 210-300 (+ contenu site ≈ 6) | 441-630 | 2,5 | M1 retour « calibration windows and the next one » ; M2 sans « the distribution of » ; M3 « 1 − α is the coverage » ; M4 sans « consecutive pairs share a window » ; M5 clause fermée retirée ; M6 η recalculé par `**` (η publié décalé d'1 ulp) ; M7 `>=` ; M8 signe ; M9 saut python en CI |
| N2-3 | aucune dépendance de code (verrou d'oracle seul) | 60-100 | 126-210 | 1 | X8 ; X10 ; X10b lève sur EPERM ; X8b `pathKey` ignore l'injection |
| N2-2 | rendus Glaz ; Q-N2-1, Q-N2-3 | 200-300 | 420-630 | 2 (+ R 0,1) | K1 seuil 35 ; K2 toutes paires évaluables ; K3 E contre q ; K4 chiffre README édité ; K5 d ignorée ; K6 contrôle (13.48)/(13.79) hors tolérance |

Ordre : N2-1 jusqu'au gel (texte servi le plus faux, doctrine C5 (3)), puis attente du go ; N2-3 pendant l'attente ; N2-2 en dernier. C ≈ 5,5 j.

## D9 — Tuyaux (règle Branchement)
| PR | Entrée | Sortie servie | État | Test non-LLM | `upcoming` jusqu'à |
|---|---|---|---|---|---|
| N2-1 S1 | `STABLE_RUN_COMMITTED_CORE` | `tools/list`, `tools/call`, `/openapi.json` | aucun | `h5-e2e-probe`, `gate_sentence_barber`, `harness_served_data_matches_in_process_harness` | redéploiement harnais (go) + CA + syncs |
| N2-1 S4 | colonnes `s`, `eta`, `q_after` | README, `/docs/verify` ; `trackerReplayFromEta`, `replay_eta.py` | aucun | `narabi_replay_eta_bit_exact` | release et déploiement site (go) |
| N2-3 | chemins `--out`, garde de lien | CLI `instrument-replay` (RUNBOOK §7 (3)) | aucun | `sentinel-instrument-replay.test.ts` | rien de public ; `sentinel_sha` au redéploiement (go) |
| N2-2 | `usde-calib-series.json` (`7c33027a…`) pliée | README S3 | aucun | `sentinel_scan_rate_readme_rendered` | release (go) ; `sentinel_sha` au redéploiement |

## D10 — Lignes datées (QO-6 (A) : orchestrateur ; `error_origin` proposés, assignés au G7)
| # | Cible | Porteur | `error_origin` proposé |
|---|---|---|---|
| 1 | `gate.ts:117-121`, ADR-M012 D7 | commit N2-1 | rédaction M012 D7 (C-10 du cp-1 : forme sous indépendance) |
| 2 | ADR-M014:95-96 (c) | orchestrateur ; construction NARABI-L-2 | rédaction M014-a |
| 3 | ADR-M014:111-112 | commit N2-2 | aucun (source nouvelle) |
| 3b | ADR-M012:95 « ≈ 2,5 % » : queue exacte P(Bin(90 ; 0,30) ≥ 36) ≈ 2,74 % [calc. worker], rendue par le script | commit N2-2 | rédaction M012 D6 (approximation normale non déclarée) |
| 4 | `PLAN-m008-f2b-usde.md:82` | orchestrateur | planification F2-B |
| 5 | `G1-lot-narabi-l.md:591` | commit N2-3 | génération du G1 + lacune CA-9 du cp-2 (259 (6)) |
| 6 | `PAROXYSME-Narabi.md` l. 93, 116, 194, 198 | orchestrateur | l. 93 = n° 1 ; l. 116 réemploi d'ID par E2 ; 194/198 mise à jour |
| 7 | `L-lecture-tibshirani2019-barber2023.md` l. 11, 14, 17 | orchestrateur | rédaction de la fiche |
| 8 | mission G0 : « P-PX4-c/d/i ✔ Crossref » | orchestrateur | rédaction de la mission (seul c résolu : `CROSSREF-PASS` l. 5 ; d, i absents) |

## Items formés (propriétaire : orchestrateur)
| Item | Déclencheur | Action |
|---|---|---|
| C-PX4-b (nulle markovienne) | P-PX4-d, P-PX4-i identifiés (passe Crossref bibliographique ; P-PX4-e incomplet) | demandes mainteneur, G0 propre |
| C-PX4-c (bootstrap) | P-PX4-f + OCR Künsch (R-3) + D1 (E3) certifié | G0 propre |
| C-PX1-b | G7 de C-PX2-c(i) + rendu Barber PDF 19, 26 (P-PX1-c) | G0 propre, dernier rang |
| C-PX2-c | G2 du prover C-PX2-b | G0 propre (S2) |
| S5 ; S7 | NARABI-L-2 ; C-PX16-a (trace en k + simulation) | hors lot |
| Rendus restants (§3 D) | la construction qui les porte | rendu d'une page (doc 03 §6) |
| NARABI-SITE-S3-1 | G7 de N2-2 | S3 sur la carte « Pre-registered drift criterion » (données site épinglées, T2) |
| NARABI-SITE-REPLAY-ETA-1 | G7 de N2-1 | contrôle navigateur par η publié (`narabi-live.ts:445` recalcule par `**`) |
| P-PX10-a (ECMA-262, lecture sur place) | avant toute phrase publique « au bit » | FAITS daté |

## Questions fermées à l'orchestrateur
- **Q-N2-1 — quantité de S3.** (A) premier franchissement depuis la première paire calme (ARL de la loi du scan), en paires calmes, conversion par d — **recommandé** (méthode décidée ; le premier tir ouvre un ADR, ADR-M012 D6) ; (B) franchissements montants par an, forme close E = P(Bin(90, p) ≥ 36) + (N − 90)·p(1 − p)·b(35 ; 89, p) [calc. worker, vérifiée par énumération sur 32 cas, à certifier], qui compte les re-franchissements d'un épisode ; (C) les deux. Si le Thm 13.2 est intraitable à (90, 36) : exact jusqu'à N ≤ quelques m, puis (13.48)/(13.79) dites « approximation ».
- **Q-N2-2 — scission de N2-1.** (A) N2-1a (S1 + enregistrements, attend le go) et N2-1b (S4, sans acte d'hôte) — **recommandé** (D3) ; (B) une PR, S4 attend le go.
- **Q-N2-3 — 259 (6) : D1/D2 (E3), O2/O3 (E2) « avant le G0 de PX-4 ».** La mission prover C-PX2-b (T1-T5) ne les couvre pas. (A) mission prover dédiée (R ≈ 0,5 j) ; cp-1 accepte N2-1 et N2-3, N2-2 sous condition de son G2 — **recommandé** ; (B) ruling : non porteurs pour S3 telle qu'écrite (ni taille ni bootstrap), dus au G0 de C-PX4-b/c, ligne datée.
- **Q-N2-4 — S1.** (A) texte décidé tel quel — **recommandé** ; (B) « … and that of the same residuals … » (d_TV entre deux lois), vert ×2.
- **Q-N2-5 — second langage.** (A) Python stdlib + garde CI — **recommandé** ; (B) rejeu JS à entiers émulant binary64, sans interpréteur.
- **Q-N2-6 — 259 (2) ordonne S1 → S4 → S5 → S3 ; S5 vit dans NARABI-L-2 (déclencheur 2026-10-18).** (A) ordre de priorité : S3 peut précéder S5, ligne datée — **recommandé** (textes indépendants) ; (B) séquence stricte : le G7 de N2-2 attend celui de NARABI-L-2.

## Sources et niveaux
S1 : Barber et al. 2023 Thm 2 [lu E1] via SYNTHESE §2 PX-1 ; S4′ : IEEE 754-2019 §5.4 (« shall »), §9.2 et Table 9.1 p. 58-59 (« should ») [lu E6] ; S3 : Glaz et al. 2001 ch. 13 [lu E3], Thm 13.2 et (13.6) illisibles, rendus dus ; code : [vérif. worker] fichier:ligne ; tout chiffre (2,74 %, 830, 318, 321, 7e-12) : [calc. worker, indicatif, non publié].

## Journal (UTC)
19:30:14 début ; lectures ; contrôles worker (scratchpad `n2/`) : `upx.mjs` (forme close contre énumération, 32 cas, écart relatif max 7e-12 ; MC 2·10⁶ paires à p = 0,30 : 6 332 contre 6 279), `arl.mjs` (ARL ≈ 830, e.s. 5), `lex.mjs` (15 vertes, 11/11 rouges ; rejoué sur les trois phrases de ce fichier : 9/9 vertes) ; CORE reconstruite depuis `gate.ts` : 5/5 clauses fermées, forme sous indépendance absente ; 19:54 rédaction ; 19:57 premier sceau ; second avis (niveaux, densité, règle de déploiement) ; sceau final.
