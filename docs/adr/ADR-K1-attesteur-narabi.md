claude-opus-5-5[1m]
# ADR-K1 : Narabi, attesteur réel (clé Ed25519), fin de `key: "deadbeef"`

- **Statut** : proposé (G0), pour checkpoint-1 ; 2026-09-27 19:4x UTC ; worker effort max, contexte frais ; dépôt en lecture seule (`f436479` puis `7b83b57`, seul `CHANTIERS.md` diffère), aucun réseau.
- **Déclencheur** : décision 259 (9) rang 1 ; PX-Narabi-7 (L14, L15) ; CHANTIERS:84 ; R-T1b-4 ; FAITS-ETHENA-POR-1 (orchestrateur, 19:25-19:29Z).
- **Amende** : ADR-M008 D2 (sens d'`attestor`), ADR-M012 D4/D5 (champs de ligne, unité). **0 octet de contrat gelé.**

## Contexte mesuré
- **M1** `flow.ts:52` sert `{identity:"ethena-por", key:"deadbeef"}` depuis J0 (2026-09-17) ; `transport:"rpc+eth_getLogs"` (`:57`) ; aucun PoR lu (D0 de M008 non tenu) ; Ethena n'atteste pas ce flux (FAITS-ETHENA-POR-1 §4). Même littéral `record-usde-calib.mjs:58` (fixture sans attestor, grep = 0).
- **M2** `attestor.key` ∈ `AttestedFlow` → `attested_flow_sha256` (`flow.ts:70`) → `hashedFields` (`timeline.ts:97`) → `line_hash`. `sentinel_sha` est hors hachage (`timeline.ts:64,111`) ; `digest_T` ne voit que q1, params, scores (`timeline.ts:162`).
- **M3** Chaîne **repliée depuis le code** : `loadState` (`run.ts:163-179`) rejoue `attest`+`step` et porte le hash recalculé sans le comparer au stocké ; `verifyTimeline` (`instrument-replay.ts:91-105`) exige la reproduction ; ancre J0 `09beb656…` (`sentinel.test.ts:729-745`, pré-inscription M014) ; site (`narabi-live.ts:778-800`) et sonde Bell (`probe-narabi.mjs:127-190`) recalculent les 31 champs et alertent. Changer l'attesteur pour tous les jours rebaserait la chaîne publiée au prochain append.
- **M4** `attested-flow.schema.json:25-38` et `closed-check.ts:25` (`attestor: ["identity","key"]`), `additionalProperties:false` partout : ni `attestor[0].sig` ni `signature` sans re-baseline `contracts_frozen` (`test/contracts-frozen.test.ts:61`) ; AttestedBook a reçu `sig?` à sa création (ADR-U1b D2/D8), voie fermée ici. `utterance.hash` = sha256 de `{address,fromBlock,toBlock,topics}` (`flow.ts:41-45`) : la requête, pas les comptes.
- **M5** `runGate(prediction, params, attested?: AttestedPrice)` (`gate.ts:700`) ; Narabi n'y entre qu'en `Prediction` (`features_digest = utterance.hash`, `adapter-narabi.ts:216`) : **`gate` ne lit rien d'`attestor`**. `GATE_NON_REVERIFICATION_SENTENCE` (`gate.ts:178-180`) est servie (h5).
- **M6** Résidus gelés à 7 (`enums.ts:37-45`, schéma `:61-76`) : ni `por_unread` ni `por_page_unhashed` ; l'adaptateur rejette l'inconnu (`adapter-narabi.ts:158-161`).
- **M7** Bell (ADR-T1b D9, décision 148) : clé née sur l'hôte, `LoadCredential`, éditeur `PrivateNetwork=yes`, trousseau committé = racine, clé servie = canal recoupé. La sentinelle est un processus **réseau** (`deploy/monark-sentinel.service`). `31.97.155.188` = Hostinger (`RUNBOOK-harness.md:23`) ; I-G2-2 ne couvre que le VPS Bell.
- **M8** [mesuré, Node v24.15.0 local] Ed25519 `node:crypto` : clé publique 64 hex, signature 128 hex, `verify` vrai ; un nibble altéré, faux ; PEM PKCS#8.

## Décisions
**D1 : l'attesteur est la sentinelle ; `ethena-por` est un abus.** Identité `monark:narabi-sentinel`, stable aux rotations (le `key_id` distingue les clés ; E-M008-4 déjà dépassé sur le fil : `predictor_id = narabi:persistence-v2@…`, `adapter-narabi.ts:41`). Sens (amende M008 D2) : la partie qui a recalculé les comptes sur `[from_block,to_block]` et signe la ligne ; elle atteste l'**origine**, jamais la vérité (seul garant : recompute onchain, M012 D4). Lignes J0..`valid_from_day`-1 : octets conservés, déclarés placeholder, **jamais re-signés**. `error_origin` proposé : copie du recorder F2-B en M012-b, non relevée en G2/cp-2 (assigné au G7). Écartées : garder `ethena-por` (faux) ; `ethena-por` + clé MONARK (prête à Ethena une signature) ; réécrire l'historique (casse chaîne et ancre M014).

**D2 : aucune donnée PoR ni résidu `por_*` en K-1.** Le non-lu est porté par l'identité, `transport` inchangé et le `scope` du trousseau ; `ap_capacity_unknown` reste vrai. Le `por` daté + `por_page_unhashed` dans l'`AttestedFlow` (FAITS-ETHENA-POR-1 §4) **exige un amendement gelé** (M4, M6). Voies PX-7 : (i) flux Chainlink PoR lu onchain au `to_block` par le même quorum, hashable, péremption → `attestor_silent` (enum gelé), donnée en champs de ligne hachés = projection v2 (site, sonde, rejeu) ≈ 300 l. ; (ii) page HTML `no-store` non hashable : conditions d'usage, re-baseline, redéploiement couplé harnais+sentinelle ≈ 80 l. (Q-K1-2).

**D3 : clé Ed25519 née sur l'hôte ; trousseau committé = racine.** K-1b, sous go : `node apps/sentinel/src/run.ts --generate-key /etc/credstore/narabi-ed25519.key`, root, `umask 077`, PKCS#8 0600, refus d'écraser ; sortie = hex public + `key_id` (sha256 des 32 octets, règle `keyIdOf` Bell). Unité : `LoadCredential=narabi-ed25519:/etc/credstore/narabi-ed25519.key` (édition en K-1b, avec la clé) ; lecture **uniquement** `$CREDENTIALS_DIRECTORY/narabi-ed25519` ; jamais dépôt, log ni `public/`. Trousseau `apps/sentinel/keys/narabi-keyring.json` = `{schema:"narabi-keyring-v1", identity, scope, keys:[{key_id, public_key_hex, valid_from_day, status}]}`, livré `keys: []` en K-1a. Copie servie `/narabi/narabi-keyring.json` = canal recoupé ; sans `--keyring`, `self_consistent_only`. Porte **I-K1-BACKUP** : FAITS sauvegardes Hostinger de `31.97.155.188` + décision investisseur (calque 148).

**D4 : la clé entre dans le hachage ; rotation = époque d'attesteur, pas segment.** Réponse à M012 D6 : oui, via `attested_flow_sha256` (M2), contrairement à `sentinel_sha`. `buildAttestedFlow(w, keyring)` choisit l'attesteur **par `day`** (entrée active si `valid_from_day <= day`, sinon l'historique) ; `valid_from_day` strictement après le dernier jour publié. `digest_T` ne voit pas la clé : ni segment, ni bascule Thm 1 → Thm 2 (M012 D6, décision 259 (5) intacts). Écartée : clé hors hachage (champ gelé).

**D5 : signature détachée, dans la ligne, hors contrat.** Signé : ASCII `monark-narabi-line-v1`, un octet LF, puis `line_hash` ; Ed25519 pur (RFC 8032), `sign(null, …)` ; `sig` 128 hex. Champs `key_id`, `sig` après `sentinel_sha`, **hors `hashedFields`** (projection inchangée : site, sonde, ancre intacts). `line_hash` lie faits, `attested_flow_sha256` (attesteur et clé), scores, état, `prev_line_hash` : la première ligne signée scelle, à sa date, la tête de l'historique non signé. **Non couverts (déclaré)** : `endpoints`, `node_version`, `sentinel_sha`, `key_id`. Écartées : `utterance.hash` (requête seule) ; `sig` dans le flux (re-baseline + redéploiement harnais ≈ 120 l.) ; ligne canonique entière façon Bell (second canonicaliseur site et sonde, flottants).

**D6 : vérification fail-closed**, statuts fermés `signed | unsigned_epoch | signature_absent | signature_invalid | key_unknown | chain_broken | self_consistent_only`. « Recorder » = ici l'**écrivain de timeline** (`step` + `run.ts`) ; le recorder de calibration ne consomme aucune signature. (a) Écrivain : signe puis vérifie sous le trousseau avant tout append ; échec ⇒ arrêt `sig_self_check:<day>` ; époque signée sans credential ⇒ `signing_key_absent`, exit 1, rien écrit. (b) `loadState` exige `stored.line_hash === lineHashOf(stored)`, le lien `prev`, la signature en époque signée, et **porte le hash stocké** ; sinon FATAL : **défaut latent corrigé** (M3). (c) Sonde Bell : trousseau committé copié (sha épinglé), raisons `signature_absent|signature_invalid|key_unknown` (unhealthy, alerte). (d) `gate` : **non** (M5), sa phrase reste vraie ; l'y porter = union M017 `attested` (CHANTIERS:83, U-4) + schéma d'entrée + description + re-pin h5 + redéploiement harnais ≈ 350 l. (NARABI-GATE-SIG-1, Q-K1-5).

**D7 : signature dans la sentinelle, écart au précédent Bell déclaré.** Le signataire parle aux RPC publics ; mitigations : credential de l'unité seule, built-ins, 0 dépendance, clé jamais journalisée. Alternative : signataire sans réseau (`PrivateNetwork=yes`), +1 unité, ≈ +150 l. (Q-K1-3).

**D8 : surface publique.** Rien ne change avant la CA de K-1b. Deviennent vraies pour les lignes ≥ `valid_from_day`, mot « attested » gardé et défini (« signed at origin by the sentinel key; counts recomputable onchain; not truth ») : README:124 (D8, inchangée), :185, :243 ; `fleet.ts:208` ; `narabi/page.tsx:18` ; `narabi-live.ts:913,941` ; `apps/sentinel/README.md:3`. Phrase ajoutée sous go : « From <day>, each line is signed with the sentinel's Ed25519 key (key_id <…>, committed keyring). A signature attests origin, not truth; earlier lines are unsigned and their attestor field is a placeholder. » Restent non dits : statut affiché sur `/narabi` (NARABI-SITE-SIG-1), vérification par `gate`. Lexique : étendre la règle `verified` nue de `bell` (`vocab-banned.json:168`), `proven`, `certif` aux scopes `sentinel`/`narabi_docs` rougirait (mesuré : 36 lignes techniques, ex. `flow.ts:9`) ; motifs ciblés seulement, mesurés à 0 : `signature\s+(proves|certifies|verifies)`, `verified\s+(truth|flow|facts?)`, `\btrustless\b`, `signed\s+(and|&)\s+verified`.

**D9 : R-25** (ascendant ; dérive mesurée ×2,0-2,1 ; STOP 1 150).

| K-1a (code + tests) | asc. |
|---|---|
| `attestor.ts` neuf (trousseau, époque, message, sign/verify, keygen) | 100 |
| `flow.ts` (attesteur par jour) · `timeline.ts` (`key_id?`, `sig?`) | 26 |
| `run.ts` (`--keyring`, credential, auto-vérification, `loadState`, `--generate-key`) | 70 |
| `keys/narabi-keyring.json` · `vocab-banned.json` | 5 |
| `apps/sentinel/test/sentinel-k1.test.ts` | 200 |
| `scripts/probe-narabi.mjs` + `test/probe-narabi.test.ts` | 105 |
| **total** | **506** |

Coupe pré-déclarée : > 547 à l'ouverture du G1 ⇒ la sonde (105) et la jambe sonde de T3 passent en **K-1a-bis**. **K-1b** (go) : I-K1-BACKUP → génération → **timer arrêté** → commit de l'entrée (`valid_from_day` = dernier jour publié + 1, lu timer arrêté ; sinon l'ancien code publierait ce jour non signé, puis FATAL) + `LoadCredential` + RUNBOOK-sentinel §K-1 → redéploiement sentinelle (SHA G7) → timer relancé → trousseau servi → sonde Bell redéployée → CA (sonde `--keyring` sur l'URL servie) → textes (go) → JOURNAL-PROVENANCE ; ≈ 20 l. code/unité, ≈ 60 l. RUNBOOK.

Tests non-LLM : **T1** `k1_sign_verify_tamper` (clé de test en mémoire, jamais committée ; nibble de `sig` ⇒ `signature_invalid` ; fait altéré ⇒ `chain_broken` ; `sig` retiré ⇒ `signature_absent`). **T2** `k1_legacy_prefix_byte_identical` (fixture `narabi-timeline-2026-09-19.jsonl`, `valid_from_day` 2026-09-20 : trois `line_hash` identiques, ancre J0 inchangée ; mutant « nouvel attesteur partout » ⇒ rouge). **T3** `k1_resume_extends_published_chain` (composition : sous-processus du vrai `run.ts`, pool stub, `CREDENTIALS_DIRECTORY` temporaire ; la ligne ajoutée chaîne sur le hash stocké et passe `evaluate` de la sonde ; ligne stockée altérée ⇒ FATAL ; mutant « hash recalculé » ⇒ rouge). **T4** `k1_signing_key_absent_fails_closed`. **T5** `k1_generate_key_public_only_no_overwrite`. **T6** `narabi_no_secret_in_repo`. **T7** sonde : `sig` altérée ⇒ `unhealthy`.

## Tuyaux (ADR-M018 D3)
| Tuyau | Entrée | Sortie | État | Test |
|---|---|---|---|---|
| clé → signature | `--generate-key` | `run.ts` via `$CREDENTIALS_DIRECTORY` | `/etc/credstore` 0600 ; trousseau committé | T4-T6 |
| flux → ligne signée | `attest` (par jour) → `step` | `timeline.jsonl`, `state.json` servis | `/var/lib/monark-sentinel` | T1, T2 |
| ligne → reprise | `timeline.jsonl` | `loadState` | idem | T3 |
| servi → sonde | GET `/narabi/timeline.jsonl` | `probe-narabi.mjs` (Bell) | `narabi.json` | T3, T7 |
| servi → site | idem | `/narabi` (ignore `sig`) | aucun | existant |
| → `gate` | aucun | aucun (M5) | aucun | NARABI-GATE-SIG-1 |

« signed » ne s'écrit en public qu'après T3 vert **et** la CA de K-1b.

## Items formés (orchestrateur sauf mention)
- **PX-7** FAITS Chainlink PoR (P-PX7-a) + `maxRedeemPerBlock` (P-PX7-b) : acte orchestrateur ; déclencheur G7 de K-1b ; sortie selon Q-K1-2.
- **NARABI-GATE-SIG-1** : lot U-4. **NARABI-SITE-SIG-1** : lot site après CA K-1b ; dépend de FAITS-WEBCRYPTO-ED25519-1.
- **K-1-ROT** (`sig_prev` sur la ligne de bascule, `revoked_from_day` ⇒ `voided`) : 90 j après `valid_from_day`, incident ou restauration (calque BELL-KEY-ROTATION-CAL-1).
- **K-1-UKEMI** clé du recorder AttestedBook + domaine `sig` (ADR-U1b D8) : avant go U-6.
- **K-1-REC** `record-usde-calib.mjs:58` → identité `unsigned:` : prochain enregistrement de calibration.
- **K-1-TYPES** commentaire `types.ts:92` (zone gelée) : prochain re-baseline `contracts_frozen`.
- Fixtures de test `deadbeef` (`gate.test.ts:432`, `adapter-narabi.test.ts:60`, `contracts/test/fixtures.ts:37`) : non servies, inchangées.

## Questions fermées
- **Q-K1-1** identité `monark:narabi-sentinel` : (A) oui ; (B) autre, nommée.
- **Q-K1-2** PoR : (A) rien en K-1, PX-7 par la voie (i) ; (B) amendement gelé, voie (ii).
- **Q-K1-3** signataire : (A) dans la sentinelle ; (B) unité sans réseau, K-1a-bis.
- **Q-K1-4** avant K-1b : (A) aucun texte ; (B) mention « attestor placeholder » maintenant (go).
- **Q-K1-5** `gate` : (A) au lot U-4 ; (B) dans K-1.
- **Q-K1-6** registre (CHANTIERS:84 contre `fleet.ts:209` `built`, PAROXYSME §5 Q1) : (A) `built` gardé, écart consigné ; (B) `upcoming` jusqu'au G7 de K-1b.
- **Q-K1-7** sonde : (A) dans K-1a ; (B) K-1a-bis d'emblée.

## Prix
K-1a : 506 ascendantes (≈ 1 060 mesurées), ≈ 1 j worker + G2 + cp-2 ; 0 octet gelé, 0 dépendance, 0 RU. K-1b : ≈ 0,5 j orchestrateur, 3 gos (sauvegardes, deux hôtes, textes), 0 € ; arrêt `signing_key_absent` possible (retard vu par la sonde). Écartées : prix en D2, D5-D7.
