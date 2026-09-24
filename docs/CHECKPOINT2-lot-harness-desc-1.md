# Checkpoint-2 (livrable) — lot HARNESS-DESC-1 — validateur-humain (claude-fable-5-1), 2026-09-22

Modèle résolu : claude-fable-5-1

# CHECKPOINT-2 — lot HARNESS-DESC-1 (`lot/harness-desc-1` @ `906064b`, base `153582f`)

## 1. Checkpoint et artefacts lus

Checkpoint **LIVRABLE** (CA-1..CA-11), contexte frais : aucun fil de travail du worker lu, G2 (en parallèle) non lu. Artefacts :
- `F:\Monark\docs\CHECKPOINT1-lot-harness-desc-1.md` (mon cp-1, C-1..C-9), `F:\Monark\docs\G1-lot-harness-desc-1.md`, `F:\tmp\hdesc1\G1.md` (rapport complet), `F:\tmp\hdesc1\ADR-amendement.md` (sha `8786ad4072cf8149…3511ce83`), `F:\tmp\hdesc1\DELIVERED.sha256`, `mutants.mjs`, `survivors.mjs`, `frozen-before-blob.txt`, `work\oracle.sh`.
- Diff intégral `git diff 153582f 906064b` (9 fichiers, +332/−27) ; `apps/site/lib/ukemi-copy.ts`, `test/site-ukemi.test.ts`, `apps/site/lib/fleet.ts` (Ukemi), `docs/carto/CARTOGRAPHIE-TEMPS-1-2026-09-22.md` §7 (CARTO-T1C-1/2), `docs/RUNBOOK-harness.md` étape 6 (version du lot), `.github/workflows/ci.yml:65` (pathspec R-25), `docs/adr/ADR-U4b-calibration-episode-frais.md` @ `a703e24`.

**Rejeu (AM-2 ter)** : chemin `F:\tmp\cp2-hdesc1\` — clone `tree` (= `906064b`) et clone `merged` (= `lot/etude-suite` @ **`a703e24`**, la branche ayant avancé depuis `15fb00a` pendant la session ; `git diff 153582f a703e24 -- apps/harness scripts/verify-harness.mjs fixtures/h5-e2e-trace.json test/h5-e2e-probe.test.ts` = vide ⇒ `merged` tel quel ≡ base pour toute mesure harness). `mk-nm.ps1` : `entries 220 monark 10 fail 0` sur les deux. Tous les rejeux sous `env -u` des 8 clés, `TEMP/TMP/TMPDIR=F:/tmp/cp2-hdesc1/os-tmp`, aucun réseau (in-process ou loopback 127.0.0.1 éphémère). Mes sondes sont les miennes (`probe.mjs`, `ca-cross.mjs`, `ca-fail.mjs`, `liqcall.mjs`, `oracle.sh`) ; `mutants.mjs`/`survivors.mjs` copiés du worker avec le seul `TEMP` repointé (diff modulo TEMP = vide), pour ne rien écrire dans son dossier de preuves. Logs : `F:\tmp\cp2-hdesc1\logs\`.

## 2. Rejeu de mes corrections C-1..C-9 (mesures propres)

| # | Attendu | Mesuré par moi | Avis |
|---|---|---|---|
| **C-1 + ruling** | vide ⇒ EMPTY + REQ + COND, jamais UPPER/H3 | `probe-tree.log` : `GATE_TOOL_DESCRIPTION` EMPTY=true REQ=true COND=true UPPER=false H3=false « calibrated on »=false ; texte committé `906064b:gate.ts:194-197` lu hors fenêtre de mutation | conforme |
| **C-2** | `describeGate` pure ; `describeGate(true)` == ancienne description ; chemin réel | `describeGate(true)` sha `5574450432b7…ed77` len 3193 == `GATE_TOOL_DESCRIPTION` pré-lot (`probe-merged.log`, même sha, même longueur) ; `HARNESS_TOOLS[gate].description === GATE_TOOL_DESCRIPTION === describeGate(registryHasLiq)` ; `tools/list` in-process (`createHarnessHandler`) gate == descripteur ; `/openapi.json` `/gate` == `tools/list` ; feuilles servies portant UPPER/H3/« calibrated on » : **0/765** (pré-lot : 2/765) ; « interval » absent de la tranche liq dans les deux états | conforme |
| **C-3** | ≥ 6 mutants nommés + `:185` re-scopé non affaibli | `mutants-tree.log` : **25/25 killed-by-intended, 25/25 restaurés** (4 mutants vocab : CLI `gate:vocab` exit 1 aussi) ; `rescoped-185-upper-dropped` tué par `u4b_liq_class_text_says_upper_bound_never_interval` ; l'absence servie est assertée par `hdesc_served_…` (mutant `true-hard-coded` rouge). `survivors-tree.log` : `describeGate(false)` codé en dur ⇒ SURVIVES=true RESTORED=true, comme déclaré (R-HD-1). DELIVERED 9/9 re-vérifié après les mutants, porcelain 0 | conforme ; R-HD-1 **acceptable** : c'est la conséquence de mon propre cp-1 C-2 (un état observable par processus), tuable seulement à -2b — **à la condition** que l'item C-4 soit persisté (voir C-V-1) |
| **C-4** | item formé 2b-7 | rédigé dans `ADR-amendement.md` §4 (déclencheur G1 -2b, propriétaire orchestrateur) — **non inséré dans le dépôt** (`git grep HARNESS-DESC-1 a703e24 -- docs/adr/ADR-U4b…` = vide) | **correction C-V-1** |
| **C-5** | CA `gate_liq_call` + `mcp_gate_description_liq`, rouge contre pré-lot, test racine | `ca-lot-vs-lot.log` : 12/12 OK, exit 0, `VERIFY OK` ; `ca-lot-vs-prelot.log` (script du lot contre harness de `merged` ≡ base) : **`mcp_gate_description_liq` FAIL** (`empty_registry_sentence=false h3_sentence=true`), `gate_liq_call` OK (la base contient déjà -2a), exit 3221226505 ; `ca-prelot-vs-prelot.log` : 10/10 (référence). `test/verify-harness-liq.test.ts` : 2/2 verts dans l'oracle. R-HD-2 re-mesuré : le script **PRÉ-LOT** en échec (Host faux) sort aussi 3221226505, 2/2 (`r-hd-2-prelot-script-fail.log`) — pré-existant, fail-closed, RUNBOOK couvre « ANY non-zero exit » | conforme |
| **C-6** | re-pin h5 `90a21adf…` mesuré sur l'arbre fusionné | recorder rejoué : `tree` ⇒ `90a21adf…8252` 21 943 o ; (b) `a703e24`+lot ⇒ **idem** ; (c) `a703e24`+A-9 `649db8b`+lot ⇒ **idem** ; diff de trace base→lot = UN champ (`response_sha256` `b88cd066…`→`6b78a420…`), taille inchangée ; PROVENANCE porte raison + delta | conforme |
| **C-7** | invariance cascade/attest/calibrate | `probe-merged.log` vs `probe-tree.log` : sha des descriptions `cascade` `e542337e…`, `attest` `9c80ae0f…`, `calibrate` `b2d49170…` identiques ; input/outputSchema des 4 outils identiques ; `info.version 0.4.0`, `servers` identiques ; whole-path openapi identiques sauf `/gate` ; MAST (vérification par présence seule ; dérive de périmètre) nommés avec contre-mesures dans l'amendement §6 | conforme |
| **C-8** | amendement ADR-U4b daté, `error_origin` -2a générateur + vérification | rédigé (§5 : générateur = G1 -2a contre G0 2a-3 ; vérification = G2 -2a + cp-2 -2a sur critère de vocabulaire) — **non inséré** | **C-V-1** |
| **C-9** | porteurs mesurés | mon grep lignes non-commentaires `apps/harness/src` : `gate.ts:141` (UPPER) et `:150` (H3) seuls ; `schema-projection.ts` 0 | conforme |

**Oracle (7 scripts, codes directs)** — `tree` : gate:vocab 0, typecheck 0, test 0 (**927/926/0/1**, skip nommé `u4b_labels_replay_via_main_real_artifact`), lint 0, lint:ratchet 0 (69/69), lang:gate 0, export:check 0. (b) `a703e24`+lot : test **939/937/0/2** + gate:vocab 0 (2ᵉ skip = win32 `sentinel_run_releases_chainstack_lock_on_sigterm`, pré-existant). (c) `a703e24`+A-9+lot (ordre A-9 d'abord : `merge --no-commit --no-ff 649db8b` propre, puis `git apply --3way` du diff du lot, 9/9 appliqués ; seuls des commentaires de `gate.ts` diffèrent d'A-9) : 7 scripts à 0, **943/941/0/2**, `harness_tool_descriptions_pass_vocab` et `harness_served_honesty_carriers_pass_vocab` verts sur la nouvelle description, CA 12/12 sur (c). `merge-tree --write-tree` : HEAD+lot et HEAD+A-9 sans conflit. **R-25** = 325+25 = **350** (pathspec verbatim `ci.yml:65`) sur `tree` et sur (b). **A-6** : 9/9 sha gelés OK sur `tree`. Sortie servie de `POST /gate` classe liq sur le lot (`liqcall-tree.log`) : 200, `abstain`/`under_calib`, `n_calib 0`, `content` = phrase registre-vide + `B_t is caller-carried.` + résumé de verdict.

Précision d'honnêteté : un `sed` de lecture de `gate.ts` dans `tree` a été exécuté **pendant** la fenêtre des mutants (il a montré le mutant `vocab-committed-branch`) — non utilisé ; toute citation ci-dessus vient du blob `906064b` ou de lectures hors fenêtre. Le recorder lancé sur `tree` pendant l'oracle a réécrit la fixture à l'identique (sha égal, porcelain 0) : sans effet.

Pré-2a « 400 par construction » (RUNBOOK étape 6, amendement §6) : vérifié à bas coût — `git show 1447c05:apps/harness/src/tools/gate.ts | grep -c liquidation-eligible` = **0** ; le comportement 400 lui-même reste [déclaré G1, cohérent avec la carto], non rejoué.

## 3. Checklist CA-1..CA-11

| Règle | Avis | Preuve |
|---|---|---|
| CA-1 | conforme | chaque C-1..C-9 reformulée et rejouée (§2) ; critères tous falsifiables et falsifiés par mutants |
| CA-2 | conforme | aucune décision de valeur : texte servi = critère cp-1 U-4b-2 C-1 / G0 2a-3 ; ruling COND = libellé (consigné CHANTIERS:866) ; aucun bump, aucun changement du set, aucune publication |
| CA-3 | **correction** | ADR de rattachement = amendement ADR-U4b rédigé, **absent du dépôt** ⇒ C-V-1 ; gates tous en place (cp-1, G1, G2 ‖ cp-2, G7) |
| CA-4 | conforme | mono-agent + G2 séparé + validateur ; aucun fan-out de débit |
| CA-5 | conforme | deux modes MAST mesurés + contre-mesures (amendement §6), preuves rejouées (§2 C-3/C-7) |
| CA-6 | **conditionnel** | trace d'oracle re-exécutée par moi (§2) ; **G2 non rendu à ma connaissance** — acceptation conditionnée à un G2 rendu et concordant ; divergence ⇒ escalade (frontière) |
| CA-7 | **correction** | zéro dû nu **une fois l'amendement inséré** (C-4/2b-7, R-HD-1, ligne G0 -2b « site rougit », ADR-M012 (i) clos) ; aujourd'hui ces items ne vivent que dans `F:\tmp` ⇒ C-V-1 |
| CA-8 | **correction** | G1 `claude-opus-5-5[1m]` préfixe conforme (décision 133) ; générateur ≠ relecteur (G2 instance séparée) ; `error_origin` -2a assigné (générateur + vérification, dont **ma propre lignée cp-2 -2a**) — dans l'amendement à insérer ⇒ C-V-1 |
| CA-9 | conforme | tout re-exécuté par moi dans `F:\tmp\cp2-hdesc1` (clones, `mk-nm`, oracle ×2, mutants, survivant, recorder ×3, CA ×4, sondes) ; aucun chiffre repris du G1 sans rejeu |
| CA-10 | conforme | aucun argument de vitesse ; lot 350 lignes < 400 |
| CA-11 (+ durci) | conforme | tuyau registre → `describeGate` → `HARNESS_TOOLS[gate].description` → `tools/list` réel (SDK in-process) et `/openapi.json` réel → CA : `hdesc_served_gate_description_is_the_empty_registry_clause` et `verify_harness_ca_passes_on_the_in_process_harness` **exécutent la composition depuis l'artefact réel** (`COMMITTED_CALIBRATIONS` committé → handler réel), littéraux de la CA liés A-10 ; rien n'est déclaré `built` par ce lot |
| Anti-close | n-a | lot non Bell ; littéraux du diff = paramètres/codes (0.01, 100, 5000, 200, 400, 21943), aucun prix |

## 4. Ruling demandé : `/ukemi` en ligne devient-elle VRAIE après redéploiement ?

**Oui, pour les deux affirmations portantes, de façon conditionnelle et datée.** En dépôt, la classe est branchée au sens CA-11 durci (ci-dessus). En ligne, après redéploiement à un SHA contenant `906064b`, `SERVED_STATE_LEAD` (« served through the gate » ; « the honest output is a named state » + phrase registre-vide, `ukemi-copy.ts:101-103`) devient VRAIE **si et seulement si** la CA est verte : `verify-harness.mjs` exit 0 + `VERIFY OK` + `tls.authorized === true` + **12/12** dont `gate_liq_call` (200, `under_calib`, phrase dans `content`) et `mcp_gate_description_liq` (EMPTY présent, H3 absent), `--out docs/deploy-CA-harness.json` régénéré et committé, entrée JOURNAL nommant le SHA (CARTO-T1C-1). La vérité est datée au `checked_at` de la CA : elle est procédurale (RUNBOOK étape 6), rien ne la rejoue après ; elle tient jusqu'au prochain redéploiement ou à -2b (où les deux contrôles basculent, amendement §4). Le redéploiement ne change **aucun** statut de registre : Ukemi `built` repose sur la jambe cascade → gate (`fleet.ts:157-165`), non touchée. Observation non bloquante, à rattacher à CARTO-T1C-1 : deux énoncés de la page restent prouvés en dépôt seulement — `CONDITIONAL_LEAD` + COND (la CA n'asserte pas COND dans la description) et `COVERAGE_NOTE` « with the count » (`n_calib=0` est dans `content`, non asserté) ; une extension d'une ligne de la CA au choix de l'orchestrateur.

## 5. Décision : **ACCEPTE-AVEC-CORRECTIONS** (liste fermée)

- **C-V-1 (bloquante pour G7/fusion)** — insérer `F:\tmp\hdesc1\ADR-amendement.md` (octets sha `8786ad4072cf8149a075f2b70319576308b42f4e3591d2fee8bc643ed3511f83`) dans `docs/adr/ADR-U4b-calibration-episode-frais.md` (après l'amendement NARABI-OPS-1d, R-20 orchestrateur), consigner le sha du fichier ADR après insertion (avant : `24bb0a6cb8185cb5…`) et contrôler que le texte inséré = celui relu. Sans cela : R-HD-1 et C-4 sont des dûs nus, CA-3/CA-7/CA-8 non conformes.
- **Condition de clôture** — G2 rendu et concordant (CA-6) ; en cas de divergence G2/G7 avec cet avis : ESCALADE-INVESTISSEUR.
- **Observation (non bloquante)** — CA de CARTO-T1C-1 : asserter COND et `n_calib` (§4) ; ordre de production inchangé (HARNESS-DESC-1 fusionné après A-9, puis redéploiement + CA + JOURNAL).

Escalade : aucune (pas de décision de valeur, pas de dérogation ; redéploiement couvert par 130/137).

## 6. Preuve de non-écriture (AM-2 bis/ter)

Dépôt `F:\Monark` : sha AVANT == APRÈS pour `gate.ts` `17247201…`, `gate-liq.test.ts` `27f12cac…`, `verify-harness.mjs` `4746f0dc…`, `h5-e2e-trace.json` `4ad9b340…`, ADR-U4b `24bb0a6c…` ; porcelain 0 → 3 **non suivis** (`docs/CHECKPOINT2-lot-bell-shortpage-1.md`, `docs/CHECKPOINT2-lot-u4b-1b-3-re2.md`, `docs/course-bell/RUNBOOK-supervision-tirage.md`, mtimes 22:53–22:59 locale, autres agents, hors périmètre — aucun créé par moi) ; HEAD avancé par l'orchestrateur `15fb00a` → `a703e24`. `F:\Monark-wt-hdesc1` : porcelain 0, arbre ≡ `906064b`. Opérations git exécutées **uniquement** dans `F:\tmp\cp2-hdesc1\` sur instruction « fusion à blanc » : 2 clones, `merge --no-commit --no-ff` ×2, `merge --abort`, `apply --3way` ; le recorder a réécrit la fixture des clones (octets identiques). Les `node_modules` des clones sont des jonctions vers `F:\Monark\node_modules` (`mk-nm.ps1`, gitignoré) — lecture seule. Nettoyage à faire par l'orchestrateur : `rm-nm.ps1` sur `F:\tmp\cp2-hdesc1\tree` et `…\merged` avant toute suppression, jamais `Remove-Item -Recurse`.

## 7. AM-1

Attrapé : amendement ADR non persisté (rendu bloquant pour G7) ; tous les chiffres du G1 re-mesurés indépendamment sur une branche ayant bougé deux fois depuis ses mesures (`071b3ee`/`1744b6f` → `a703e24`), concordants ; R-HD-2 confirmé pré-existant sur le script pré-lot. Manqué : rien de révélé par le rejeu ; la ligne « 400 par construction » pré-2a reste déclarée, non rejouée.

Modèle résolu (R-1) : claude-fable-5-1.
