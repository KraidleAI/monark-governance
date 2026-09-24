# Re-checkpoint-2 (micro-pli 7cc6176) — lot HARNESS-DESC-1 — validateur-humain (claude-fable-5-1), 2026-09-23

Modèle résolu : claude-fable-5-1

Rendu au fil de l'eau persisté : `F:\tmp\cp2-hdesc1\CP2-1b.md` (sha `53491d3ffa13a4d8…d11d06`, 96 lignes ; journal horodaté + avis). Texte intégral de l'avis ci-dessous.

# RE-CHECKPOINT-2 — micro-pli HARNESS-DESC-1b (`lot/harness-desc-1` @ `7cc6176`, parent `906064b`)

## 1. Checkpoint et artefacts lus
Checkpoint LIVRABLE (re-cp-2 après G2 C-G2-1), contexte intact du cp-2 initial. Lus : `F:\Monark\docs\G2-lot-harness-desc-1.md` ; `F:\tmp\hdesc1\RENDU-MICROPLI-1b.md` ; `F:\tmp\hdesc1\ADR-DELTA-1b.md` (sha `48c3b49a…`) ; `F:\tmp\hdesc1\ADR-amendement.md` (sha `8786ad40…`, inchangé) ; `F:\tmp\hdesc1\DELIVERED.sha256` (`679fa156…`) ; `F:\tmp\hdesc1\work1b\{mutants-1b,survivors-1b}.mjs` (`5bdc15f2…`, `da15f25b…`) ; diff `906064b..7cc6176` (1 fichier, `test/verify-harness-liq.test.ts` +100/−2) ; `test/probe-narabi-state.test.ts:97-101`.
Rejeu sous `F:\tmp\cp2-hdesc1\` (AM-2 ter) : `tree` déplacé à `7cc6176` ; `merged` = `lot/etude-suite` @ `b147db0` + `merge --no-commit --no-ff 7cc6176` ; `base1b` = `b147db0` pur. Harnais copiés avec le seul TEMP repointé (diff modulo TEMP = vide). `env -u` des 8 clés, TEMP/TMP/TMPDIR sur F:, aucun réseau. Logs : `F:\tmp\cp2-hdesc1\logs\{mutants-1b-AVANT-906064b,mutants-1b-APRES-7cc6176,survivors-1b-7cc6176}.log`, `logs\tree-1b\`, `logs\merged-1b\`.

## 2. Rejeux (mesures propres)
| Objet | Mesuré | Avis |
|---|---|---|
| Survie pré-pli (run AVANT, `tree` @ `906064b`, 31 mutants) | 25/31 tués ; survivants = **exactement** G2-5a, G2-5b, G2-5c, ca-reason-dropped, ca-said-dropped, ca-has-empty-dropped ; 31/31 restaurés | constat G2 reproduit indépendamment |
| Run APRÈS (`tree` @ `7cc6176`) | **31/31 tués par le test attendu**, 31/31 restaurés ; sha mutés G2-5a `857d90e6…`, G2-5b `3fc0a536…`, G2-5c `22cd0fc1…` = ceux du G2 ; les 6 prédicats tués par `verify_harness_ca_liq_checks_red_on_overclaiming_surfaces` ; les 25 G1 gardent leur tueur | conforme C-G2-1 |
| Survivants déclarés | S1/S2 survivent aux tests CA, restaurés ; S3 (UPPER dans la branche vide) survit à la CA et est **tué en dépôt** par `hdesc_served_…` + `hdesc_describe_gate_two_states` (mesuré) | déclarations exactes |
| Oracle `tree` @ `7cc6176` | 7 scripts à 0 ; **928/927/0/1** (skip nommé `u4b_labels_replay_via_main_real_artifact`) ; test (3) vert 4,5 s ; DELIVERED 9/9 avant et après mutants ; test (3) 0 CR, 0 non-ASCII | conforme |
| Fusion à blanc `b147db0` + `7cc6176` | `merge-tree` propre ; merge propre (9 fichiers +430/−27) ; recorder h5 ⇒ `90a21adf…8252`, 21 943 o (inchangé) ; A-6 9/9 ; oracle : 6 scripts à 0, **test 958/955/1/2** — l'unique rouge est `no_secret_in_repo` (§5-a, hors lot) ; test (3) vert 14,2 s ; `hdesc_*` et `harness_tool_descriptions_pass_vocab` verts (grep-forbidden/vocab-banned modifiés par A-9 : compatibles) | vert côté lot ; cible rouge hors lot |
| Cible actuelle `3fd53e8` | `b147db0..3fd53e8` = docs seulement ⇒ mesures étendues ; `merge-tree 3fd53e8+7cc6176` propre | — |
| R-25 (`153582f...7cc6176`, pathspec `ci.yml:65`) | 423+/25− = **448** ; idem index `merged` vs `b147db0` | déviation déclarée (§4 CA-10) |
| ADR-U4b @ `3fd53e8` | 0 mention HARNESS-DESC-1 | C-V-1 toujours dû |

Non mesuré par moi, [déclaré worker] : le code de sortie exact 3221226505 « pour les quatre vecteurs » ; j'ai mesuré `≠ 0` via le test (3), et 3221226505 seulement sur le script pré-lot (R-HD-2, cp-2 initial).

## 3. Rulings demandés
**CA-11 / D-2 vs D-3 — le mandataire est un vecteur adverse légitime, pas un faux client.** Critère discriminant : (i) le système sous test est `scripts/verify-harness.mjs` exécuté **en processus enfant, tel que déployé** (le client est la vraie CA) ; (ii) en amont, le VRAI harness `startServer(0)` ; (iii) exactement deux points de réécriture, fail-closed 500 si la description servie n'est pas trouvée une fois ; (iv) fidélité prouvée par la liste rouge FERMÉE (10/11 autres contrôles passent à travers le mandataire) ; (v) `detail` asserté = la CA a lu le vecteur voulu ; (vi) compteurs `{rewrites 2, liq 1}` fail-safe. Motif déjà en dépôt (`probe-narabi-state.test.ts` `serve()`). Frontière : le test (3) est un **contrôle négatif** (D-1/D-2), pas une preuve de branchement — le branchement reste porté par le test (2) et `hdesc_served_…` ; la clause « entrée construite à la main » de CA-11 durci vise la preuve de composition, que (3) ne revendique pas.

**CA-7 items** : R-1b-2 (UPPER absent de la CA) formé, propriétaire + déclencheur, acceptable car S3 est tué en dépôt (mesuré) ; extension §4 (c) formée dans ADR-DELTA ; R-1b-1 (S1/S2) formé, déclencheur SDK/`http.ts` ; O-1b-1 (flake D4) rattaché à l'item D4 existant — ma donnée : 0 anomalie de niveau fichier sur `test/verify-harness-liq.test.ts` dans mes runs (2 oracles, 10 + 10 exécutions du fichier dans les mutants AVANT/APRÈS, 3 survivants). Tous conditionnels à l'insertion d'ADR-DELTA-1b (sinon dûs nus).

## 4. Checklist (delta par rapport au cp-2 initial)
| Règle | Avis | Preuve |
|---|---|---|
| CA-1 | conforme | C-G2-1 falsifiable et falsifié (6 mutants, run AVANT/APRÈS) |
| CA-2 | conforme | test-only, aucun octet servi (seule la ligne du test change dans DELIVERED ; h5 inchangé) |
| CA-3 / CA-7 / CA-8 | **correction** | ADR-amendement + ADR-DELTA absents du dépôt (C-V-1) ; ADR-DELTA sans `error_origin` pour C-G2-1 (C-V-3) |
| CA-5 | conforme | MAST « vérification par présence seule » fermé par le contrôle négatif |
| CA-6 | conforme | G2 rendu (PASS-AVEC-CORRECTIONS) + oracle re-exécuté par moi ; concordants |
| CA-9 | conforme | tout rejoué (AVANT, APRÈS, survivants, oracle ×2, recorder, R-25, A-6, `base1b`) |
| CA-10 | conforme, déviation déclarée | R-25 448 > critère cp-1 « < 400 » (mon CA-1 (6)) ; accepté : pli test-only imposé par G2, lot toujours petit ; « < 450 » vient de la consigne du pli, pas d'un checkpoint — pas de re-baseline silencieuse |
| CA-11 | conforme | §3 |
| Anti-close | n-a | lot non Bell ; aucun littéral de prix dans le diff du test |

## 5. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée)
- **C-V-1 (étendue, bloquante G7)** : insérer dans le MÊME commit de fusion `ADR-amendement.md` (`8786ad40…`) et `ADR-DELTA-1b.md` (`48c3b49a…`) dans `docs/adr/ADR-U4b-calibration-episode-frais.md`, avec O-2/O-3/O-4 du G2 (O-4 = contrainte d'ordre : le RUNBOOK étape 6 renvoie à une « section 4 » qui n'existe qu'après insertion) ; consigner le sha du fichier ADR après insertion et l'égalité byte des textes insérés. Absent à `3fd53e8` (mesuré).
- **C-V-3 (éditoriale, à l'insertion)** : `error_origin` de C-G2-1 dans §6-bis = **générateur** (test (2) positif seul) **+ vérification** (mon cp-2 initial a accepté C-5 sur un rejeu rouge manuel hors dépôt sans exiger que la suite impose le négatif ; G2-5a/b/c l'ont prouvé).
- **Conditions G7 (hors lot)** : (a) `lot/etude-suite` HEAD est **rouge indépendamment de ce lot** — `no_secret_in_repo` sur `docs/G2-lot-u4b-1b-4-integral.md:78` (motif `*_API_KEY=` inline ; valeur factice selon le texte ; introduit par `b147db0`, persiste à `3fd53e8`, reproduit sur `base1b` pur) ⇒ purge par le jeton `[masqué]` (jamais par une valeur), `error_origin` = orchestrateur (persistance) ; tant que ce point reste, tout oracle G7 sur l'arbre fusionné est rouge ; (b) O-1 du G2 : persister le rapport G1 complet et le rendu du micro-pli ; (c) réserve G2 maintenue : G7 rejoue oracle / recorder / mutants sur l'arbre réellement fusionné.
- Escalade : aucune (pas de décision de valeur, pas de dérogation).

## 6. Preuve de non-écriture
`F:\Monark` : HEAD `b147db0` → `3fd53e8` par l'orchestrateur ; sha `gate.ts` `17247201…` → `8f7cc2fc…` = blob A-9 fusionné (identique à `b147db0` et `3fd53e8`), ADR-U4b `24bb0a6c…` → `06718234…` = commit `f28a184` (D-BORNE-1) — commits de l'orchestrateur, arbre == blob HEAD à chaque instant ; porcelain final = 0 (les 2 `M` vus en cours de session étaient ceux de l'orchestrateur, `CHANTIERS.md`/`SIDECAR-…`, depuis committés). `F:\Monark-wt-hdesc1` : porcelain 0, arbre == `7cc6176`. Opérations git en scratch seulement : `fetch`, `checkout --detach` ×2, `merge --abort`, `merge --no-commit --no-ff`, `clone` (`base1b`). Nettoyage orchestrateur : `rm-nm.ps1` sur `F:\tmp\cp2-hdesc1\{tree,merged,base1b}` avant suppression.

## 7. AM-1
Attrapé : `error_origin` manquant pour C-G2-1 ; cible de fusion rouge (secret-scan) hors lot ; R-25 448 vs critère cp-1 < 400 ; run AVANT reproduit indépendamment. **Manqué par ma propre lignée** : mon cp-2 initial a accepté C-5 sur un rejeu rouge manuel sans exiger que la suite impose le contrôle négatif de la CA — exactement ce que le G2 a attrapé.

Modèle résolu (R-1) : claude-fable-5-1.
