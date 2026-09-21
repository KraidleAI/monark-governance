# PLI — sous-lot NARABI-OPS-1b-ii-b (durcissement de la DÉTECTION + borne de démarrage du sentinel)

**Worker G1 : `claude-opus-4-8[1m]`, effort max, 2026-09-21** (horloge `date -u` de session). **Modèle résolu
(R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme ; l'orchestrateur vérifie ce préfixe avant
de consommer cette sortie comme preuve. R-20 : le worker NE committe PAS, ne déclenche aucun workflow, n'exécute
AUCUNE action sortante (loopback / `.invalid` seulement ; `npm ci` = cache offline `F:\cache\npm`). R-21 : chaque
affirmation porte sa preuve `fichier:ligne` ou sa mesure reproductible.

Worktree EXCLUSIF `F:\Monark-wt-narabi1b2b`, branche `lot/narabi-ops-1b-ii-b`,
base `57e9cbc` (= `lot/etude-suite` avec NARABI-OPS-1b-i **et** CI-site fusionnés). Scratch `F:\tmp\narabi1b2b\`.
Plans qui font foi : `docs/G0-ADDENDUM-lot-narabi-ops-1b-ii.md` (pli), `docs/CHECKPOINT1-DELTA-lot-narabi-ops-1b-ii.md`.

**PARALLÉLISME (déclaré).** Le sous-lot frère **-1b-ii-a** est EN COURS dans un autre worktree et édite AUSSI
`scripts/probe-narabi.mjs`, `scripts/probe-narabi.d.mts`, `test/probe-narabi.test.ts` et l'ADR. Mes changements
sont LOCALISÉS ; toutes les régions et les zones -a probables sont listées en §Régions pour la seconde fusion.

---

## 1. Corrections → `fichier:ligne` → test → mutant

| Item / correction | Où (fichier:ligne final) | Test non-LLM | Mutant ROUGE |
|---|---|---|---|
| **Item 2 / C-B-12** — 2ᵉ GET borné de `state.json` par **dérivation par défaut** du basename ; contrôle `state.digest === last.digest_T` | `probe-narabi.mjs:292` (`deriveStateUrl`), `:301` (`stateDigestOf`), `:401-418` (GET₂ dans `probe()`), `:350-353` (cross-check dans `evaluate`) | `probe_state_digest_cross_check` | **M-ii-9** (comparaison sautée ⇒ trafiqué passe healthy) ; **Mien#1** (`deriveStateUrl` cassé ⇒ GET₂ mauvais chemin ⇒ `state_unreachable`) |
| **Item 2 / Q4** — `state_mismatch` (digest ≠) et `state_unreachable` (GET₂ échoue OU corps sans digest comparable), raison DISTINCTE ; précédence FERMÉE | `probe-narabi.mjs:314` (`crossCheckVerdict`), `:350-353` (`evaluate`) | `probe_state_unreachable_precedence` | **M-ii-22** (précédence : `lag` avant l'état ⇒ état masqué) |
| **Item 4** — tueur du réessai GET : exactement `retries+1` essais sur échec (mutant `attempt <= retries + 1`) | `probe-narabi.mjs:257` (boucle GET de `fetchTimeline`, inchangée — cible du mutant) ; réessai différencié `retries=0`/`=2` + port fermé | `probe_get_retries_exactly_n_plus_one` | **M-ii-10** (`attempt <= retries + 1`) |
| **Item 3 / C-NB-5** — `monark-sentinel.service TimeoutStartSec = max(300,⌈3D/60⌉·60) = 300 s` ; test inter-unités UTC (bornes HAUTE et BASSE) | `deploy/monark-sentinel.service:30-36` ; `RUN_DURATION_D_SEC=26` (test:32) | `probe_sentinel_timeoutstartsec_inter_unit_coherence` | **M-ii-13** (T_s=3600 > borne haute) ; **M-ii-14** (T_s=60 < 3D, borne basse) |
| **C-NB-7** — assertion RSS `MemoryMax ≥ 13 × (MAX_MAX_BYTES + STATE_MAX_BYTES)` (deux corps en vol) + pire cas GET₁+GET₂ < `TimeoutStartSec` du probe | `test/probe-narabi-state.test.ts` (`probe_state_get_rss_and_worstcase_bounds`) ; bornes GET₂ `probe-narabi.mjs:63-71` | `probe_state_get_rss_and_worstcase_bounds` | **Mien#2** (`STATE_MAX_BYTES=8 MiB` ⇒ RSS dépasse `MemoryMax=128M`) |
| **`--state-file`** réservé à l'injection de `state.json` en mode `--file`, borné comme `--file` (`statSync > STATE_MAX_BYTES`) | `probe-narabi.mjs:459` (`parseArgs`), `:406` (lecture bornée) | `probe_state_digest_cross_check` sous-cas (c)/(d)/(e) | **Mien#3** (borne retirée ⇒ fichier surdimensionné lu ⇒ healthy) |
| **CA-11 durci** — vraie sonde en sous-processus depuis la capture RÉELLE (`NARABI_SNAPSHOT`) servie en loopback : cohérent⇒healthy ; autre jour⇒`state_mismatch` ; 404⇒`state_unreachable` ; env EXPLICITE purgé | `test/probe-narabi-state.test.ts` (`purgedEnv`, tests 1 et 2) | `probe_state_digest_cross_check`, `probe_state_unreachable_precedence` | M-ii-9, M-ii-22, Mien#1 |
| **Réconciliation test hérité** (forcée par le GET₂ inconditionnel en mode URL) | `test/probe-narabi.test.ts:310-318` | `probe_get_over_loopback_http_executes` (reste VERT, tueur N4 intact) | (n-a : édition de réconciliation) |
| **L-6b** — ADR : raisons fermées `state_mismatch`/`state_unreachable`, tuyaux `state.json→cross-check` et `monark-sentinel TimeoutStartSec`/E-5 | `docs/adr/ADR-NARABI-OPS-1.md` (2 lignes de tuyau + amendement daté) | n-a (docs) | n-a |
| **E-5 / décision 92** — RUNBOOK §6 étape « VPS site » (redéploiement sentinel, `systemctl show -p TimeoutStartUSec`) + risque « kill au milieu d'un append » borné (mesuré) | `docs/RUNBOOK-sentinel.md` §6 (étape 8 + sous-section « Start backstop ») | n-a (docs) | n-a |

**Précédence FERMÉE implémentée** (`evaluate`, `probe-narabi.mjs`) et vérifiée offline + par test :
`insecure_url`/`unreachable`/`too_large`/`probe_error` (cannot-evaluate) **>** `chain_broken` **>**
`state_unreachable` **>** `state_mismatch` **>** `lag`.

---

## 2. Mutants — chacun ROUGE, restauré BYTE-EXACT (copie, jamais `git checkout`)

sha256 pristines : `scripts/probe-narabi.mjs` = `1001c1cd1f5bb8e8cc131986295360a296c895487635e532509ca549d9d8058f` ;
`deploy/monark-sentinel.service` = `d70f88ccb11e276caa64b7715795e26266b4d98453f40f95504128e1a83a5433`.
Backup dans `F:\tmp\narabi1b2b\bak\` ; après chaque mutant, `cp bak → fichier` puis `sha256sum` re-vérifié == pristine.

| Mutant | Mutation exacte | Fichier | Test qui rougit | Résultat |
|---|---|---|---|---|
| **M-ii-9** | suppression de la branche `if (stateCheck.digest !== expectedDigestT) return state_mismatch` | probe-narabi.mjs | `probe_state_digest_cross_check` | ✖ RED, restauré |
| **M-ii-10** | `attempt <= retries` → `attempt <= retries + 1` (boucle GET de `fetchTimeline`) | probe-narabi.mjs | `probe_get_retries_exactly_n_plus_one` | ✖ RED, restauré |
| **M-ii-13** | `TimeoutStartSec=300` → `3600` (dépasse la borne HAUTE) | monark-sentinel.service | `probe_sentinel_timeoutstartsec_inter_unit_coherence` | ✖ RED, restauré |
| **M-ii-14** | `TimeoutStartSec=300` → `60` (< 3D, borne BASSE) | monark-sentinel.service | `probe_sentinel_timeoutstartsec_inter_unit_coherence` | ✖ RED, restauré |
| **M-ii-22** | `if (sx.reason !== null)` → `if (sx.reason !== null && dayDiff(last.day, expectedLastDay(nowIso)) <= 0)` (lag masque l'état) | probe-narabi.mjs | `probe_state_unreachable_precedence` | ✖ RED, restauré |
| **Mien#1** (C-B-12) | `deriveStateUrl` basename `"state.json"` → `"timeline.jsonl"` (dérivation cassée) | probe-narabi.mjs | `probe_state_digest_cross_check` | ✖ RED, restauré |
| **Mien#2** (C-NB-7) | `STATE_MAX_BYTES = 64 * 1024` → `8 * 1024 * 1024` (RSS dépasse MemoryMax) | probe-narabi.mjs | `probe_state_get_rss_and_worstcase_bounds` | ✖ RED, restauré |
| **Mien#3** (point G) | borne `--state-file` retirée (`statSync > STATE_MAX_BYTES` supprimé, lecture directe) | probe-narabi.mjs | `probe_state_digest_cross_check` sous-cas (e) | ✖ RED, restauré |

Après restauration, `sha256sum` des deux fichiers == pristine (vérifié) ; suite complète re-jouée **509/509**.

---

## 3. Régions touchées (fichier:lignes) — pour la SECONDE FUSION (l'orchestrateur résout)

**`scripts/probe-narabi.mjs`** (édité par -a ET -b) :
- `:16-17` en-tête (note narabi.json : `state_checked` + raisons) — **-b** ; -a édite aussi l'en-tête (mail/schema).
- `:63-71` constantes `STATE_MAX_BYTES`/`STATE_TIMEOUT_MS`/`STATE_RETRIES` — **-b**, bloc contigu neuf.
- `:292-321` `deriveStateUrl` + `stateDigestOf` (`:301`) + `crossCheckVerdict` (`:314`) — **-b**, bloc contigu neuf.
- `:326-360` `evaluate` : signature `+ stateCheck` (`:326`), base `+ state_checked:false` (`:331`), bloc cross-check
  `:350-353`, `state_checked` dans le retour lag — **-b** ; **zone -a probable** : -a élargit aussi `evaluate` (L-1a′).
- `:401-418` `probe()` bloc GET₂/`--state-file` (statSync borné `:406`) ; `:422` appel `evaluate(..., stateCheck)` ;
  `:426` littéral de repli `+ state_checked:false` — **-b** ; **zone -a probable** : -a ajoute la machine à états ici.
- `:459` `parseArgs` : branche `else if (t === "--state-file")` — **-b** ; **zone -a probable** : -a ajoute la
  garde stricte `else { throw }` (M-ii-21) dans la MÊME boucle `for` ⇒ union des branches `else if` avant le `else`.
- **SCHEMA (`:24`) NON TOUCHÉE par -b** (voir §Déviations). -a la passe à 2.

**`scripts/probe-narabi.d.mts`** (édité par -a ET -b) : `:20-25` (constantes state) ; `:27-31` (`ProbeReason` +=
`state_mismatch|state_unreachable`) ; `:41` (`NarabiState` += `state_checked`) ; `:59-60` (`deriveStateUrl`) ;
`:72-75` (`StateCheck` + `EvaluateInput.stateCheck`) ; `:79` (`ProbeOpts.stateFile`). -a ajoute `alerted`/
`alert_error`/`last_alert_day` à `NarabiState`, la surface SMTP, `evaluate` élargie — union des déclarations.

**`deploy/monark-sentinel.service`** : `:30-36` bloc `TimeoutStartSec=300` + commentaire — **-b seul**.

**`test/probe-narabi.test.ts`** : `:310-318` — édition FORCÉE (routage `okServer` pour servir `state.json` au
GET₂). Non adjacente aux zones -a probables : helpers `runProbe`/`runProbeAsync` `:53-72` (C-B-6) et assertions
`alert_error` post-`:321`/`:340` (Q10). Git fusionne des hunks non contigus d'une même fonction.

**`test/probe-narabi-state.test.ts`** : fichier NEUF (254 lignes) — **-b seul**, aucun conflit.

**`docs/adr/ADR-NARABI-OPS-1.md`** : 2 lignes de tuyau ajoutées après la ligne `probe → alerte` (NON touchée,
-a) + amendement daté « 2026-09-21 (-1b-ii-b) ». -a édite la ligne `probe → alerte` (canal mail) + schema 2.

**`docs/RUNBOOK-sentinel.md`** : §6 étape (8) + sous-section « Start backstop » — **-b seul**.

---

## 4. Déviations (déclarées, R-21)

1. **SCHEMA non bumpé en -b.** J'ajoute `state_checked` à `narabi.json` SANS toucher `export const SCHEMA = 1`.
   Motif (advisor consulté) : le bump à 2 (avec `alerted`/`alert_error`/`last_alert_day`) appartient à -1b-ii-a
   (L-1a, G0 §7) ; le garder en UN seul édit évite un conflit sur cette ligne. À la fusion : `SCHEMA=2` (de -a) +
   `state_checked` (de -b) = forme schema 2 cohérente. En ISOLATION -b, `narabi.json` montre `schema:1` avec
   `state_checked` — état transitoire jamais livré ; aucun test n'asserte l'exhaustivité des champs de schema 1
   (mesuré : aucun `deepEqual` sur un `NarabiState` complet dans le dépôt).
2. **`RUN_DURATION_D_SEC` dans le FICHIER DE TEST, pas dans le `.mjs`/sidecar.** Motif (advisor) : §3 du G0 dit
   « constante nommée dans le test inter-unités » ; le probe Bell n'a aucun usage runtime d'une durée de run du
   sentinel — l'exporter polluerait la surface du script. Déviation vs L-1b′ (qui la listait au sidecar) : le
   sidecar n'expose donc PAS `RUN_DURATION_D_SEC` (ce n'est pas un export `.mjs`). Provenance en commentaire du
   test (sha256 de `JOURNAL-PROVENANCE.md:310` = `2d3158b2865e640cebe05ffb8a220cd7194f315809235bcbb9051eca925f9388`,
   commande node de vérification incluse).
3. **`monark-probe.service TimeoutStartSec` NON édité (reste 90).** L-3b (« +GET₂ ») est satisfait par ASSERTION
   (`probe_state_get_rss_and_worstcase_bounds` : pire cas GET₁+GET₂+marge = 70 s < 90 s), pas par édition —
   `STATE_RETRIES=1` fixe garde GET₂ borné indépendamment de l'env. La rehausse SMTP (L-3a) et toute
   réconciliation appartiennent à -a / à l'orchestrateur à la fusion (item formé, §5).
4. **`probe_timer_multiple_shots` non modifié** ; l'assertion RSS « +GET₂ » (C-NB-7) est portée par le test NEUF
   `probe_state_get_rss_and_worstcase_bounds` au lieu d'éditer le test hérité (instruction orchestrateur : fichier
   neuf, fusion simple).
5. **R-25 mesuré 392 > projection 270-308** (large sous le plafond 1205). Motif : tests CA-11 durci exhaustifs
   (sous-processus depuis octets réels, ladder de précédence pure, tueur de réessai à 2 sous-cas + port fermé,
   borne `--state-file` surdimensionné).
6. **Drift d'en-tête `.mjs` NON corrigé (assumé).** L'en-tête `probe-narabi.mjs:6` (« injected I/O
   `--file`/`--now`/`--url`/`--out` ») et `:10-11` (« NO outbound action other than a GET ») sont désormais
   périmés (`--state-file` ajouté, DEUX GET). NON touché volontairement : -a réécrit tout cet en-tête (narratif
   mail + machine à états) ⇒ y ajouter mes tokens élargirait le conflit de fusion. À folder par -a/l'orchestrateur
   à la fusion (le corps du fichier, lui, est exact et testé).

---

## 5. Items formés (déclencheur + propriétaire) — zéro dette

1. **`vocab-banned.json` scope `sentinel` ne couvre pas `test/probe-narabi-state.test.ts`.** Le `files[]`
   (`:111`) liste `test/probe-narabi.test.ts`, pas le fichier neuf ; le G0 interdit à -1b-ii d'éditer
   `vocab-banned.json` (zone de conflit ci-site). **Item formé** : l'orchestrateur ajoute
   `test/probe-narabi-state.test.ts` à `files[]` à la fusion et rejoue `gate:vocab` avec une phrase interdite
   injectée (preuve de couverture) — même mécanique que le sidecar (G0 §0.17) et l'union ci-site↔-1b-i. Propriétaire
   orchestrateur ; déclencheur : la fusion de -b. (MESURÉ, pas inféré : `everlasting` — un pattern GLOBAL,
   `vocab-banned.json:9` — injecté dans le fichier neuf ⇒ `gate:vocab` reste VERT « 181 fichiers, 0 claim » ⇒ le
   fichier n'est scanné par AUCUN scope ; restauré byte-exact. En régime normal, anglais propre, gate vert.)
2. **Assertion pire-cas COMBINÉ à la 2ᵉ fusion (C-G2-3, REFORMULÉ — ce n'est PAS une rehausse).** -a fixe
   `monark-probe.service TimeoutStartSec=120` et `MAX_SMTP_DEADLINE_MS=30_000`. Le vrai pire cas combiné =
   GET₁ (10 s × 5 = 50) + GET₂ (5 s × 2 = 10) + SMTP (30) + marge (10) = **100 s < 120 ⇒ AUCUNE rehausse
   nécessaire** (l'item pré-pli « rehausser T_s » est SANS OBJET pour le budget ; -b tient déjà sous 90/120).
   Le trou est que NI `probe_timer_multiple_shots` (-a : 120 > 90, sans GET₂) NI `probe_state_get_rss_and_worstcase_bounds`
   (-b : 120 > 70, sans SMTP) ne pinne **120 > 100**. **Item de SECONDE FUSION** : étendre UNE des deux assertions
   à `TimeoutStartSec > MAX_TIMEOUT_MS·(MAX_RETRIES+1) + STATE_TIMEOUT_MS·(STATE_RETRIES+1) + MAX_SMTP_DEADLINE_MS
   + START_MARGIN_MS`. Propriétaire orchestrateur ; déclencheur : fusion de -a ET -b (la constante `MAX_SMTP_DEADLINE_MS`
   vit en -a, absente de ce worktree — je ne peux pas écrire l'assertion combinée ici). **NE PAS toucher l'unité de la sonde** (instruction orchestrateur).
3. **Course GET₁/GET₂ (C-NB-4)** — durcissement « relire la timeline une fois avant de conclure `state_mismatch` »
   NON codé en -b (ajouterait un GET₃ dans la dérivation `TimeoutStartSec` + RSS). Résiduel déclaré (flap
   auto-guéri, acceptable). Déclencheur : premier faux `state_mismatch` observé au déploiement ; propriétaire
   orchestrateur.
4. **G2 SMTP dédiée par relecteur Opus 4.8 SÉPARÉ pour -b (C-NB-6)** — propriétaire orchestrateur.
5. **Déploiement E-5 (redéploiement `monark-sentinel.service` sur le VPS SITE)** — décision 92, après G7 +
   checkpoint-2 de -b, RUNBOOK §6 par SHA de fusion, `systemctl show -p TimeoutStartUSec`. Propriétaire
   orchestrateur (le worker n'exécute JAMAIS). État de registre : « code + test ; wired au redéploiement SITE ».

---

## 6. Oracles (chiffres de la suite COMPLÈTE — leçon U-4a)

- `npm run test` COMPLET : **512 tests, 512 pass, 0 fail** (G1 = 509 ; **+3 tests killers G2** N-G2-1/2/3), `exit 0`.
  Re-joué APRÈS restauration des 7 mutants : vert (voir §10.4).
- `npm run typecheck` (`tsc --noEmit`) : **0 erreur** (avec `exactOptionalPropertyTypes` ; `EvaluateInput.stateCheck?: StateCheck | undefined`).
- `eslint` fichiers touchés (`test/probe-narabi-state.test.ts`, `test/probe-narabi.test.ts`) : **0** (le `.mjs`/`.d.mts` sont ignorés par eslint).
- `lint:ratchet` : **69/69** (plafond inchangé — le test neuf n'ajoute aucune violation de typage différé).
- `gate:vocab` : **OK, 181 fichiers, 0 claim interdit**.
- `export:check` : **OK, 0 chemin interdit, 0 hit français**.
- `lang:gate` : **OK, 0 hit français non exempté**.
- `no-secret-in-repo` : dans la suite (509/509) — aucun secret (loopback/`.invalid`/snapshot public seulement).
- **R-25** : `git diff --shortstat 57e9cbc -- <pathspec ci.yml:65>` (`docs/**/*.md` + fixtures + package-lock
  exclus) = **466 insertions + 13 suppressions = 479 ≤ 1205** (G1 = 392 ; les 3 tests killers G2 + la reformulation
  du commentaire C-G2-5 ajoutent +87 au fichier `test/probe-narabi-state.test.ts` ; RUNBOOK et PLI sont `docs/**/*.md`,
  EXCLUS). Chaque fichier revu ≤ 1205 (le plus gros compté = `test/probe-narabi-state.test.ts` à 350).
- **Tests -b VERTS (8 = 5 G1 + 3 G2)** : G1 `probe_state_digest_cross_check`, `probe_state_unreachable_precedence`,
  `probe_get_retries_exactly_n_plus_one`, `probe_sentinel_timeoutstartsec_inter_unit_coherence`,
  `probe_state_get_rss_and_worstcase_bounds` ; **G2** `probe_state_get2_binds_state_max_bytes` (N-G2-3),
  `probe_state_digest_must_be_string` (N-G2-1), `probe_state_url_override_honored_and_guarded` (N-G2-2). Test hérité
  réconcilié `probe_get_over_loopback_http_executes` : VERT.

Environnement : dépendances installées par `npm ci --prefer-offline` (cache `F:\cache\npm`, 17 s, aucun réseau).

---

## 7. Table sha256 (état final)

| Fichier | sha256 |
|---|---|
| `scripts/probe-narabi.mjs` | `1001c1cd1f5bb8e8cc131986295360a296c895487635e532509ca549d9d8058f` |
| `scripts/probe-narabi.d.mts` | `09d6a641527333cb07ce3586fc5517d472c9e62a8ae86f588f49280e9e83a258` |
| `deploy/monark-sentinel.service` | `d70f88ccb11e276caa64b7715795e26266b4d98453f40f95504128e1a83a5433` |
| `test/probe-narabi.test.ts` | `2d820136996f11406b62afedb449520ee2f1867b025e8beb95c14f927703308f` |
| `test/probe-narabi-state.test.ts` | **G2 pli** `55e502220c4d781316c40de556516fc457476b9ea45cb62bdf98d5282a3fdda0` (G1 était `4cd3e238…` ; +3 tests killers + commentaire C-G2-5) |
| `docs/adr/ADR-NARABI-OPS-1.md` | `db21d698d1c565e19830fe9c7746b9716078a164df48949c6492f389e372a2f5` (inchangé au pli) |
| `docs/RUNBOOK-sentinel.md` | **G2 pli** `3a049053f9fc3c8baf07182b13c11461b4f1459d5be7283b6cdb982fb099ff07` (G1 était `1bd93f8f…` ; §6 « Start backstop » réécrit : deux modes de kill + réparations + préconditions) |
| `scripts/probe-narabi.mjs` (re-vérifié post-mutants) | `1001c1cd1f5bb8e8cc131986295360a296c895487635e532509ca549d9d8058f` (== pristine ; 7 mutants restaurés byte-exact) |
| `deploy/monark-sentinel.service` (re-vérifié post-mutant M-ii-14) | `d70f88ccb11e276caa64b7715795e26266b4d98453f40f95504128e1a83a5433` (== pristine) |
| `docs/PLI-lot-narabi-ops-1b-ii-b.md` | (ce fichier ; sha final au gel par l'orchestrateur) |

---

## 8. Bloc CHANTIERS.md (verbatim, à consigner par l'ORCHESTRATEUR au G7 — UN MODÈLE RÉSOLU PAR ÉTAPE)

> **sous-lot NARABI-OPS-1b-ii-b (durcissement DÉTECTION + borne démarrage sentinel)** — worktree
> `F:\Monark-wt-narabi1b2b` (`lot/narabi-ops-1b-ii-b`, base `57e9cbc`), offline, effort max.
> **Modèle résolu PAR ÉTAPE** : G1 (code + tests + docs) = worker **`claude-opus-4-8[1m]`**, 2026-09-21 ; G2
> dédiée (relecteur Opus 4.8 SÉPARÉ, C-NB-6) = **`claude-opus-4-8[1m]` FAITE** (PASS-AVEC-CORRECTIONS, `3fbf2b0`,
> `docs/G2-lot-narabi-ops-1b-ii-b.md`) ; **pli G2 = worker `claude-opus-4-8[1m]`, 2026-09-21** (ce PLI §10) ;
> checkpoint-2 = validateur-humain `claude-fable-5-1` = À VENIR ; G7 + adjudications R-21 = orchestrateur
> `claude-fable-5-1` = À VENIR.
> **Livré (G1)** : 2ᵉ GET borné `state.json` (dérivation par défaut du basename), `state_mismatch`/`state_unreachable`
> (Q4) + précédence fermée, `state_checked`, tueur du réessai GET (M-ii-10), `monark-sentinel.service
> TimeoutStartSec=300` (D=25,481 s ⇒ `RUN_DURATION_D_SEC=26`, E-5/décision 92), test inter-unités (bornes haute
> ET basse), assertion RSS `13×(MAX_MAX_BYTES+STATE_MAX_BYTES)`.
> **Plié (G2)** : RUNBOOK §6 « Start backstop » RÉÉCRIT — DEUX modes de kill (A rattrapage-livelock ≥ ~12 j de
> backlog, B ligne tronquée) avec symptômes journal + réparation exacte (drop-in `catchup.conf` / `--day` ; retrait
> byte-exact de la ligne tronquée, vérif `--dry-run`) et précisions C-G2-2 ; **3 tests killers** N-G2-1/2/3 ;
> provenance D ancrée sur le CONTENU (C-G2-5) ; **(ii) atténuation code `run.ts` NON faite — item formé** (motif :
> invariant L-1 `run.ts:170-175`, hors périmètre G0 -b). Oracles : suite complète **512/512**, typecheck 0,
> gate:vocab 181, lint:ratchet 69/69, export:check + lang:gate 0 hit, **7 mutants ROUGES byte-exact** (M-ii-9,10,14,22
> + N-G2-1/2/3), `probe-narabi.mjs`/`monark-sentinel.service` == pristine. **R-25 479/1205**. NON déployé ; E-5
> (VPS site) accordé décision 92, à exécuter par l'orchestrateur après G7 + checkpoint-2.

## 9. Bloc JOURNAL-PROVENANCE.md (verbatim, à consigner par l'ORCHESTRATEUR au G7)

> **2026-09-21 — G1 sous-lot NARABI-OPS-1b-ii-b** (worker `claude-opus-4-8[1m]`, effort max, contexte frais) ;
> base `57e9cbc`, worktree `F:\Monark-wt-narabi1b2b`. `error_origin` (à assigner au G7) : couverture/implémentation
> = worker. Livrables : `scripts/probe-narabi.mjs` (+90/-13 vs base), `scripts/probe-narabi.d.mts`,
> `deploy/monark-sentinel.service` (`TimeoutStartSec=300`), `test/probe-narabi-state.test.ts` (NEUF, 5 tests),
> `test/probe-narabi.test.ts` (réconciliation `:310`), ADR + RUNBOOK (L-6b). Mesure D = 25,481 s reprise du G7
> -1b-i (`JOURNAL-PROVENANCE.md:310`, fusion `9b178f3`), `RUN_DURATION_D_SEC=26` ⇒ `T_s=300 s` (formule
> pré-enregistrée). Oracles : suite complète 509/509, R-25 392/1205, 8 mutants rouges byte-exact. Advisor intégré
> (Fable 5.1) consulté 3× AVANT écriture (coordination parallélisme, réconciliation test hérité GET₂). Sha256 des
> fichiers en §7 du PLI. Reste dû = items formés (§5 PLI) : ajout du test neuf à `vocab-banned.json` à la fusion,
> rehausse SMTP `monark-probe.service` (-a), G2 dédiée, déploiement E-5.

> **2026-09-21 — G2 + pli G2 sous-lot NARABI-OPS-1b-ii-b** (UN MODÈLE RÉSOLU PAR ÉTAPE, déclaré par chaque agent) :
> — **G2 dédiée** = relecteur SÉPARÉ à contexte frais **`claude-opus-4-8[1m]`** (effort max, n'a PAS écrit le code) :
>   **PASS-AVEC-CORRECTIONS** (`3fbf2b0`, `docs/G2-lot-narabi-ops-1b-ii-b.md`) — code de -b correct et branché à un
>   test d'intégration non-LLM ; 8 mutants worker ROUGES ; 3 mutants adversariaux SURVIVANTS (N-G2-1/2/3) ; défaut
>   BLOQUANT avant E-5 : livelock de rattrapage non documenté (C-G2-1) ; R-25 392 ; 7 sha == PLI §7.
> — **Pli G2** = worker à contexte frais **`claude-opus-4-8[1m]`** (effort max) : (i) RUNBOOK §6 « Start backstop »
>   réécrit — DEUX modes de kill (A rattrapage-livelock, B ligne tronquée) + symptômes + réparations + précisions
>   C-G2-2 ; N-G2-1/2/3 tués par 3 tests neufs ; C-G2-5 ancrage contenu ; C-G2-3/4 = items de fusion consignés.
>   **(ii) atténuation code `run.ts` NON faite — item formé** (déclencheur : avant E-5 ; propriétaire orchestrateur ;
>   motif : invariant L-1 `run.ts:170-175` + hors périmètre G0 de -b). Oracles post-pli : **512/512**, R-25
>   **479/1205**, **7 mutants ROUGES byte-exact** (M-ii-9,10,14,22 + N-G2-1/2/3), `probe-narabi.mjs` +
>   `monark-sentinel.service` re-vérifiés == pristine. Advisor intégré (Fable 5.1) consulté AVANT écriture (décision
>   (ii), forme des 3 killers, spécificités RUNBOOK). `error_origin` proposé au G7 : C-G2-1/2/5 = **docs/couverture =
>   worker** ; C-G2-3 = **couverture = worker + -a** ; C-G2-4 = **contrainte de scope G0** (item de fusion, pas un
>   défaut du code). Sha256 post-pli en §7.
> — **checkpoint-2** = validateur-humain **`claude-fable-5-1`** = À VENIR ; **G7 + adjudications R-21 + assignation
>   `error_origin`** = orchestrateur **`claude-fable-5-1`** = À VENIR.

---

## 10. PLI G2 — pli de la revue G2 (`docs/G2-lot-narabi-ops-1b-ii-b.md`, relecteur séparé `claude-opus-4-8[1m]`, PASS-AVEC-CORRECTIONS)

**Implémenteur du pli : worker `claude-opus-4-8[1m]`, effort max, 2026-09-21**, contexte frais, worktree EXCLUSIF
`F:\Monark-wt-narabi1b2b` (HEAD `3fbf2b0`), scratch `F:\tmp\narabi1b2b\pli\`. **Modèle résolu (R-1) :
`claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme. R-20 : aucun commit / workflow / action sortante
(tout loopback / `.invalid` ; tests sous `env -u SMTP_HOST -u SMTP_PORT -u SMTP_USER -u SMTP_PASS -u SMTP_TLS -u
ALERT_TO -u ALERT_FROM -u PROBE_STATE_URL` ; mutants joués in-place puis restaurés BYTE-EXACT depuis `pli/bak/`,
jamais `git checkout`, sha re-vérifié == pristine). R-21 : chaque fait porte son `fichier:ligne` first-hand ou sa
mesure reproductible. **NON modifiés** : `vocab-banned.json`, `DEADLINE_UTC`, `deploy/monark-probe.{service,timer}`,
et `run.ts` (voir §10.3).

### 10.1 Table C-G2-n / N-G2-n → fichier:ligne → résolution → test → mutant → error_origin

| # | Défaut / mutant | fichier:ligne (first-hand) | Résolution du pli | Test | Mutant | error_origin (proposé G7) |
|---|---|---|---|---|---|---|
| **C-G2-1 (i)** | livelock de rattrapage NON documenté (2ᵉ voie de kill), BLOQUANT avant E-5 | `run.ts:167,168,182-191` (mécanisme) ; `RUNBOOK-sentinel.md` §6 | RUNBOOK §6 « Start backstop » RÉÉCRIT : DEUX modes (A rattrapage, B ligne tronquée), symptômes journal (table de tri), réparation exacte de chacun (A : drop-in `catchup.conf` `TimeoutStartSec=infinity` OU `--day` un jour à la fois ; B : retrait byte-exact + vérif `--dry-run`) | n-a (docs) | n-a | **docs = worker** |
| **C-G2-1 (ii)** | atténuation code (`MAX_CATCHUP_DAYS_PER_RUN`) | `run.ts:170-175` (invariant L-1) | **NON FAITE dans -b** — item formé (§10.7), motivé §10.3 | n-a | n-a | — (item formé) |
| **C-G2-2** | RUNBOOK surdéclare l'auto-guérison / sous-déclare la permanence | `RUNBOOK-sentinel.md` §6 (Mode B) | « self-heals on the next run **THAT WRITES A LINE** » (garde `:182` `report.lines.length>0`) + « **EVERY** subsequent run FATALs in `loadState` (`:111`) **until** the torn line is removed » | n-a (docs) | n-a | **docs = worker** |
| **C-G2-3** | aucun test ne pinne 120 > 100 (pire cas COMBINÉ) | `test/probe-narabi.test.ts` (-a) + `test/probe-narabi-state.test.ts:252` (-b) | **item de SECONDE FUSION reformulé** (§5.2) : étendre UNE assertion à `T_s > GET₁+GET₂+SMTP+marge` (**pas** rehausser T_s : 120 > 100 déjà) ; unité de la sonde **NON touchée** | (fusion) | (fusion) | **couverture = worker + -a** |
| **C-G2-4** | scope `gate:vocab` ne couvre pas le test neuf | `vocab-banned.json:111` ; `scripts/grep-forbidden.mjs` | **item de fusion CONFIRMÉ** (§5.1) : ajouter `test/probe-narabi-state.test.ts` à `sentinel.files[]` + preuve par phrase interdite injectée. **Le G7 du lot COMBINÉ ne clôt PAS sans lui.** | (fusion, preuve) | (fusion) | **contrainte de scope G0** (pas un défaut code) |
| **C-G2-5** | provenance D ancrée par n° de ligne (fragile) | `test/probe-narabi-state.test.ts:30-38` | ancrage sur le **CONTENU** : substring « `mesure D = 25,481 s (run publiant 00:47:55→00:48:20 UTC` » (grep), n° de ligne + sha en SECONDAIRE | (commentaire) | n-a | **docs = worker** |
| **N-G2-3** (le + utile) | GET₂ sans `maxBytes: STATE_MAX_BYTES` (survivant) — risque RSS/OOM | `probe-narabi.mjs:412` | test neuf : `state.json` cohérent de `STATE_MAX_BYTES+overhead` octets ⇒ `too_large` ⇒ **`state_unreachable`** | `probe_state_get2_binds_state_max_bytes` | mutation « retirer `maxBytes` » ⇒ RED (mesuré) | **couverture = worker** |
| **N-G2-2** | override `PROBE_STATE_URL` non testé (survivant) | `probe-narabi.mjs:411` | **TESTÉ, pas retiré** : usage prévu par l'addendum §2 (« env `PROBE_STATE_URL`, défaut = dérivation ») ; override honoré + soumis à la MÊME garde transport que GET₁ (`http://127.1` refusé par `rawUrlHost` ⇒ refus SANS requête, `hits===1`) | `probe_state_url_override_honored_and_guarded` | mutation « override ignoré » ⇒ RED (mesuré) | **couverture = worker** |
| **N-G2-1** | type-guard `digest` non piné (survivant) | `probe-narabi.mjs:304` | test de type : `digest` numérique (`123`) ⇒ `{ok:false}` ⇒ **`state_unreachable`**, `state_checked:false` (nuance MESURÉE : `digest:""` reste `state_mismatch` — chaîne vide) | `probe_state_digest_must_be_string` | mutation « `d != null` » ⇒ RED (mesuré) | **couverture = worker** |

### 10.2 Ma mesure du livelock de rattrapage (C-G2-1, re-mesurée sur le CODE — pas recopiée du relecteur)

**Mécanisme (structural, first-hand `run.ts`).** `runDue` (`:75-92`) accumule les lignes de TOUS les jours dus
(`dueList`) EN MÉMOIRE et ne retourne qu'APRÈS la boucle RPC (`:93`) ; `main` n'écrit qu'APRÈS le retour de
`runDue`, en UN bloc (`:182` `if (report.lines.length > 0)` puis `:188` `appendFileSync`) — **aucun checkpoint
par jour**. Donc un kill `TimeoutStartSec` PENDANT `runDue` (backlog multi-jours) n'écrit RIEN (pas de ligne
tronquée non plus) : `timeline.jsonl` intact ⇒ point de reprise inchangé ⇒ le run suivant recompute la MÊME liste
due (`:167`) ⇒ re-killé au même point ⇒ **aucune publication tant que le rattrapage dépasse `T_s=300 s`** (4
créneaux + `Persistent`, aucun `Restart=`). **Distinct du mode ligne tronquée** (qui exige un kill dans la fenêtre
d'append ~ms `:188-191`) : ce mode ne demande qu'un run > 300 s ⇒ plus probable dès qu'un backlog existe.

**Mesures reproductibles (offline, aucun réseau).**
- **Surcoût fixe = plancher, NÉGLIGEABLE.** `import(run.ts)` (graphe de modules + strip TS) mesuré 3× =
  **119,9 / 111,7 / 109,6 ms** (`node performance.now()` autour d'un `await import`, run-guard non déclenché) ;
  démarrage node nu ~40-50 ms ⇒ **F < 0,2 s**. Le fold de `loadState` (`:104-120`) est en millisecondes (chaque
  ligne : `attest`+`step`, borné). ⇒ **D est dominé par le RPC** de `runDue`, pas par le CPU/démarrage.
- **Ancre D = 25,481 s** (JOURNAL, ligne « `mesure D = 25,481 s (run publiant 00:47:55→00:48:20 UTC` », merge
  `9b178f3`) pour un run traitant **1 jour dû** (T=3, ~4 lignes).
- **Seuil = `N ≥ ⌈300 / 25,481⌉ = 12 jours` de backlog, BORNE INFÉRIEURE.** Modèle linéaire `N·D > T_s`. C'est un
  **minorant** : `run.ts:72` remet la borne basse de recherche de bloc à `DEPLOY_BLOCK` à CHAQUE run et ne la
  resserre qu'AU SEIN d'un run ⇒ D porte déjà la recherche de bloc la PLUS large ; les jours suivants d'un
  rattrapage cherchent une plage plus étroite ⇒ le coût/jour réel BAISSE ⇒ `N·D` surestime le temps ⇒ **seuil réel
  ≥ ~12 jours**. Ni « jamais » ni « toujours » : il faut ~une dizaine de jours d'indisponibilité (VPS ou pool RPC
  à terre) AVEC un backlog en attente. (Même fait pour la réparation A.2 : chaque run `--day` repart de
  `DEPLOY_BLOCK` ⇒ budgéter ~D par run.)
- **Détecté, pas réparé (avant ce pli).** Surface gelée ⇒ la sonde voit `lag` ⇒ mail (avec -a) ; mais aucune
  procédure de reprise au RUNBOOK pour ce mode. Le pli (i) la fournit.

### 10.3 Adjudication (ii) — **NE PAS toucher `run.ts` en -b** ; item formé (recherche de solutions)

**Décision : l'atténuation code n'est PAS faite dans -1b-ii-b.** Raison LOAD-BEARING (prouvée `fichier:ligne`),
avant l'argument de périmètre :

1. **Elle casse l'invariant L-1 (`run.ts:170-175`).** Le contrat de la fin-JSON est
   `lag > 0 ⇔ report.stopped !== null ⇔ exit 1`, et `stopped === null ⇒ exit 0 ⇒ à jour OU en attente de finalité`
   (le correctif de l'incident 2026-09-20 : un `exit 0` ne masque plus un jour bloqué). Borner la liste due par run
   (`MAX_CATCHUP_DAYS_PER_RUN`, le design décrit par la mission = « un run traite moins de jours, écrit les mêmes
   lignes plus tard ») force l'UN de deux bris : soit `lag=0 / exit 0` avec un backlog CACHÉ au-delà de la borne
   (ré-introduit exactement le masquage que L-1 a supprimé), soit un état NEUF `lag>0 && stopped===null && exit 0`
   que ni le contrat fin-JSON, ni l'enregistrement JOURNAL du RUNBOOK (`:203-206`), ni
   `apps/sentinel/test/sentinel-retry.test.ts` [lu, ouvert first-hand `:158-203`] n'ont jamais vu — au contraire :
   (b) `:163-166` pinne `catch-up ⇒ exit 0, stopped:null` (1 jour) ; (d) `:189-192` pinne un stop partiel
   `exit 1, stopped:fetch_error:2026-09-19` (le VRAI lag restant reste visible) ; (e) `:199-203` montre `--dry-run`
   parcourant TOUT le chemin fetch jusqu'au stop. **⇒ changement de la sémantique de RUN-REPORT : la condition
   « aucun changement de sémantique » de la mission échoue en propre.**
2. **Le design alternatif « flush incrémental par lot » (écrire après chaque lot DANS le run) a un effet de bord
   non maîtrisé** : un `state.json` + copies publiques par lot fait **récurrer la fenêtre de course C-NB-4
   `:190→:191` à chaque lot** (plus d'exposition à un `state_mismatch` transitoire pour la sonde) et **multiplie
   la fenêtre de ligne tronquée** que la doc C-G2-2 décrit comme UN seul append ; il restructure le chemin d'E/S
   critique au crash, dépasse vraisemblablement ~30 lignes, et sort du périmètre.
3. **Périmètre G0 (doc 02 / AgileGates).** `run.ts` n'est PAS un livrable de -1b-ii-b (addendum §10.1 : les
   livrables sont `probe-narabi.{mjs,d.mts}`, les tests, `monark-sentinel.service`, `monark-probe.service`, ADR,
   RUNBOOK — jamais `run.ts`). Le relecteur G2 confirme `run.ts` **inchangé et correct** ; `error_origin` de C-G2-1
   = **docs = worker** (omission de doc), pas un défaut de code. Une extension de périmètre passe par G0/ADR, pas
   par un pli d'implémenteur.

**Item formé (recherche de solutions documentée, pas un « dû » nu).** Deux esquisses pour l'orchestrateur à peser
en G0 : **(A)** `MAX_CATCHUP_DAYS_PER_RUN` + un champ `remaining_lag` VRAI + une décision d'exit explicite (préserve
l'observabilité L-1) ; **(B)** flush par lot avec ré-analyse de la fenêtre C-NB-4 et de la borne torn-line. **Les
deux ALTÈRENT le contrat fin-JSON ou le profil de crash ⇒ G0/ADR requis.** Déclencheur : **avant le redéploiement
E-5** ; propriétaire **orchestrateur**. **La doc (i) est due DE TOUTE FAÇON** : une borne par run n'aide PAS un
seul jour dont le RPC dépasse 300 s (endpoints dégradés) — seul le drop-in `catchup.conf` le fait.

### 10.4 Mutants rejoués au pli (7) — chacun ROUGE, restauré BYTE-EXACT (jamais `git checkout`)

Backups `F:\tmp\narabi1b2b\pli\bak\` (pristines : `probe-narabi.mjs 1001c1cd…`, `monark-sentinel.service d70f88cc…`).
Après CHAQUE mutant : `cp bak → fichier`, `sha256sum` re-vérifié == pristine. Worktree final propre
(`git status` de `probe-narabi.mjs`/`monark-sentinel.service` = vide). Portée jouée = `test/probe-narabi-state.test.ts`.

| Mutant | Mutation exacte | Fichier | Test qui rougit | Résultat |
|---|---|---|---|---|
| **M-ii-9** | branche `state_mismatch` neutralisée (`if (false) …`) | probe-narabi.mjs | `probe_state_digest_cross_check` | **RED** ✓ restauré |
| **M-ii-10** | `attempt <= retries` → `<= retries + 1` | probe-narabi.mjs | `probe_get_retries_exactly_n_plus_one` | **RED** ✓ |
| **M-ii-14** | `TimeoutStartSec=300` → `60` (< 3D) | monark-sentinel.service | `probe_sentinel_timeoutstartsec_inter_unit_coherence` | **RED** ✓ |
| **M-ii-22** | `if (sx.reason !== null)` → `… && dayDiff(last.day, expectedLastDay(nowIso)) <= 0` | probe-narabi.mjs | `probe_state_unreachable_precedence` | **RED** ✓ |
| **N-G2-1** | `typeof d === "string"` → `d != null` (`stateDigestOf`) | probe-narabi.mjs | `probe_state_digest_must_be_string` | **RED** ✓ (SURVIVAIT en G2) |
| **N-G2-2** | `process.env.PROBE_STATE_URL ?? deriveStateUrl(url)` → `deriveStateUrl(url)` | probe-narabi.mjs | `probe_state_url_override_honored_and_guarded` | **RED** ✓ (SURVIVAIT en G2) |
| **N-G2-3** | GET₂ SANS `maxBytes: STATE_MAX_BYTES` | probe-narabi.mjs | `probe_state_get2_binds_state_max_bytes` | **RED** ✓ (SURVIVAIT en G2) |

*(M-ii-13 — borne HAUTE `T_s > deadline` — non re-rejoué ici : jumeau de M-ii-14 sur le MÊME test
`probe_sentinel_timeoutstartsec_inter_unit_coherence`, déjà ROUGE en G1/G2. Les 3 killers N-G2-1/2/3 étaient VERTS
sur la suite gelée — le code livré est CORRECT ; ils rougissent DÉSORMAIS un édit régressif futur.)*

*Hypothèse de `probe_state_url_override_honored_and_guarded` (N-G2-2, déclarée pour le checkpoint-2)* : l'assertion
`hits === 1` suppose que GET₁ réussit au 1ᵉʳ essai (`PROBE_RETRIES` défaut 2 ⇒ un reset transitoire ferait `hits`
≥ 2 SANS le mutant). Sur un serveur loopback `node:http` en processus, GET₁ réussit déterministiquement au 1ᵉʳ
contact (aucun reset injecté, contrairement à `probe_get_retries_exactly_n_plus_one`) ⇒ `hits === 1` est stable ;
le mutant (override ignoré ⇒ URL canonique dérivée) ajoute un 2ᵉ hit servi ⇒ `hits === 2`, `healthy`. Discriminant.*

### 10.5 Oracles post-pli (suite COMPLÈTE, sous `env -u SMTP_* ALERT_* PROBE_STATE_URL`)

| Oracle | Commande | Résultat |
|---|---|---|
| `npm run test` COMPLET | script `test` (test/ + packages + harness + sentinel + bell) | **512 / 512 pass, 0 fail** (G1 509 + 3 killers) |
| `typecheck` | `tsc --noEmit` | **0 erreur** (à re-jouer au gel — voir §10.5 note) |
| `eslint` fichiers touchés | `eslint test/probe-narabi-state.test.ts` | **0** |
| `lint:ratchet` | `node scripts/lint-ratchet.mjs` | **69/69** (plafond inchangé) |
| `gate:vocab` | `node scripts/grep-forbidden.mjs` | **OK, 181 fichiers** (le test neuf reste HORS scope — C-G2-4, item de fusion) |
| `export:check` | `node scripts/export-public.mjs --check` | **OK, 0 chemin interdit, 0 hit français** |
| `lang:gate` | `node scripts/lang-gate.mjs` | **OK, 0 hit français non exempté** |
| `no-secret-in-repo` | dans la suite (512/512) | aucun secret (loopback/`.invalid`/snapshot public) |
| **R-25** | `git diff --shortstat 57e9cbc -- <pathspec ci.yml:65>` | **466 ins + 13 del = 479 ≤ 1205** (G1 392 ; RUNBOOK+PLI `docs/**/*.md` EXCLUS ; seuls les 3 killers + le commentaire C-G2-5 comptent, dans `test/probe-narabi-state.test.ts`) |

### 10.6 Carte des conflits avec -1b-ii-a (`lot/narabi-ops-1b-ii-a`, HEAD `9fd3736`) — portée du relecteur au PLI

Raffine §3 « Régions touchées » au niveau des BLOCS de conflit git (essai de fusion en LECTURE du relecteur,
merge-base réelle `331c169`, intersection = 5 fichiers). **Ordre conseillé : -a PUIS -b.**

| Fichier | Conflit git | Résolution attendue (orchestrateur, 2ᵉ fusion) |
|---|---|---|
| `scripts/probe-narabi.mjs` | **OUI (4 blocs)** | (1) **en-tête** : note schema-2 (-a) + mention `state_mismatch`/`state_unreachable` (-b) ; (2) **constantes** : UNION blocs SMTP (-a) ∪ STATE (-b) ; (3) **`evaluate`** : `base` de -a (champs alerte + `state_checked:false`) et **SUPPRIMER le `state_checked:false` en DOUBLE de -b** (dédup), signature = celle de -b (`+ stateCheck`), corps = cross-check de -b + `state_checked: sx.state_checked` dans les retours ; (4) **`parseArgs`** : `else if (t === "--state-file")` **AVANT** le `else { throw }` de -a (sinon `--state-file` lève « unknown flag ») |
| `scripts/probe-narabi.d.mts` | **OUI (2 blocs)** | UNION : `NarabiState += state_checked` (les DEUX l'ajoutent ⇒ **dédup**) + `alerted`/`alert_error`/`last_alert_day` (-a) ; `ProbeReason += state_mismatch`/`state_unreachable` (-b) ; `StateCheck`, `EvaluateInput.stateCheck?`, `ProbeOpts.stateFile`, `deriveStateUrl`, `STATE_*` (-b) ; surface SMTP (-a) |
| `test/probe-narabi.test.ts` | **NON (auto-merge)** | -b n'édite que `:310-318` (routage `okServer`) ; vérifier que le tueur N4 (`okHits-beforeHits===1`) reste VERT après fusion |
| `docs/adr/ADR-NARABI-OPS-1.md` | **NON (auto-merge)** | positions disjointes ; revue sémantique : pas de doublon de ligne de tuyau |
| `docs/RUNBOOK-sentinel.md` | **NON (auto-merge)** | -a étapes déploiement mail ; -b étape (8) + « Start backstop » (élargi au pli) ; **revue sémantique** : pas deux étapes « (8) » ni section dupliquée |
| `vocab-banned.json` (hors 5 fichiers) | — | **C-G2-4** : ajouter `test/probe-narabi-state.test.ts` à `sentinel.files[]` + preuve phrase interdite |

### 10.7 Reste dû (items formés — ZÉRO dette)
1. **C-G2-4 / vocab-banned.json** (§5.1) — orchestrateur, à la fusion de -b ; **le G7 COMBINÉ ne clôt pas sans**.
2. **C-G2-3 / assertion pire-cas combiné 120 > 100** (§5.2 reformulé) — orchestrateur, à la fusion de -a ET -b
   (constante `MAX_SMTP_DEADLINE_MS` en -a).
3. **C-G2-1 (ii) / atténuation `run.ts`** (§10.3) — orchestrateur, **avant E-5**, via G0/ADR (esquisses A/B fournies).
4. **Course GET₁/GET₂ (C-NB-4)** (§5.3) — durcissement non codé ; déclencheur : 1er faux `state_mismatch` observé.
5. **Déploiement E-5** (§5.5, décision 92) — orchestrateur, après G7 + checkpoint-2, RUNBOOK §6 par SHA.
Aucun « dû » nu : chaque point est un item formé (propriétaire + déclencheur) ou une recherche documentée.

## 11. PLI G2-delta — pli des corrections C-G2D-1..3 (`docs/G2-DELTA-lot-narabi-ops-1b-ii-b.md`, relecteur séparé `claude-opus-4-8[1m]`, PASS-AVEC-CORRECTIONS)

Pli des **trois corrections NON bloquantes** de la relecture-delta (worker `claude-opus-4-8[1m]`, effort max, contexte frais,
`2026-09-21`, worktree `F:\Monark-wt-narabi1b2b`, HEAD `b9e9675`). N'écrase RIEN de §1-§10 : seuls `docs/RUNBOOK-sentinel.md`
(C-G2D-1/2) et `test/probe-narabi-state.test.ts` (C-G2D-3) sont touchés ; `scripts/probe-narabi.mjs` **non modifié** (aucun
défaut réel — la ligne 412 passe bien les 3 liaisons ; le trou était de COUVERTURE, pas de code). Tests sous
`env -u SMTP_HOST -u SMTP_USER -u SMTP_PASS -u ALERT_TO -u PROBE_STATE_URL`, `node --test` flags package.json ; loopback seul.

### 11.1 Table correction → `fichier:ligne` (post-pli) → preuve

| Correction | `fichier:ligne` (post-pli) | Preuve (first-hand) | Niveau (R-21) |
|---|---|---|---|
| **C-G2D-1** signal inobservable | `docs/RUNBOOK-sentinel.md:187` | « RECURS every slot with the SAME `processedDays` never shrinking » (proxy jamais émis) REMPLACÉ par deux observables : col. journalctl « **NO new end-JSON** (run tué dans `runDue`, n'atteint jamais l'end-JSON `run.ts:180`, `processedDays` jamais imprimé) » + col. `tail -1` « **`day` never advances slot after slot** ». `run.ts:180` = le `console.log(JSON.stringify({… processedDays …}))` (lu, `apps/sentinel/src/run.ts:180`), APRÈS le retour de `runDue` (`:168`) ⇒ un kill DURANT `runDue` (`:168`, la boucle RPC multi-jours) ne l'atteint jamais. | lecture du code (`run.ts:168,180`) |
| **C-G2D-2** `start` bloquant + `-f` | `docs/RUNBOOK-sentinel.md:220-224` | `systemctl start monark-sentinel.service` + `journalctl -f` séquentiel REMPLACÉ par `systemctl start **--no-block** …` puis `journalctl … -f` (suivi LIVE) + note « **Ctrl-C** après `wrote N line(s)` puis restaurer ». Fondé sur `deploy/monark-sentinel.service:15` (`Type=oneshot`, **sans** `RemainAfterExit` ⇒ un `start` nu BLOQUE jusqu'à la fin du run, un `-f` suivant n'observe qu'un run FINI). Mode B `:292-293` (post-pli ; start bloquant + `-n 20 --no-pager`) laissé INTACT (déjà correct pour un oneshot). **C-G2D-2 insère +3 lignes** (`journalctl -f` : `:221`→`:224`) ⇒ toute citation RUNBOOK `> :224` du G2-DELTA / §10 (pré-pli) se lit **+3** (ex. §6 « 172-297 » → « 172-300 » ; RUNBOOK total 329→**332** lignes). | validé par **lecture** de l'unit ; **non exécuté** (aucun systemd sur cet hôte Windows — jamais le VPS) |
| **C-G2D-3** liaisons runtime non pinées | `test/probe-narabi-state.test.ts:363` (R), `:396` (T) | 2 killers ajoutés qui pinnent `retries: STATE_RETRIES` (R) et `timeoutMs: STATE_TIMEOUT_MS` (T) du GET₂ (`probe-narabi.mjs:412`). Mutants R/T rejoués : **SURVIVAIENT** avant, **ROUGES** après (§11.2). | rejeu du code (oracle non-LLM) |

### 11.2 Mutants voisins R & T (rapport G2-delta §2) — rejoués : AVANT survit / APRÈS rouge, restauré BYTE-EXACT

Protocole (jamais `git checkout`) : `cp bak/pristine → probe-narabi.mjs`, mutation `mutate.mjs` (exact-replace, **assert 1
occurrence**), portée = `test/probe-narabi-state.test.ts`, restauration par copie du backup, `sha256` re-vérifié == pristine
après CHAQUE mutant. Backup pristine `F:\tmp\claude\F--Monark\a7659644-0519-4943-8b82-d50d7405fe34\scratchpad\g2d-fold\bak\probe-narabi.mjs.pristine`, sha256 `1001c1cd…`.

| Mutant | Mutation exacte (`probe-narabi.mjs:412`) | AVANT (suite gelée, 8 tests) | APRÈS (suite +2 killers, 10 tests) | Test qui rougit (SEUL) | `sha256` restauré |
|---|---|---|---|---|---|
| **R** | drop `, retries: STATE_RETRIES` | **SURVIT 8/8** (aucun test ne compte les tentatives du GET₂) | **ROUGE 9/1** — `actual: 'state_unreachable', expected: null` (mutant : `retries ← env PROBE_RETRIES=0` ⇒ 1 tentative ⇒ abandonne sur le reset ; réel : `STATE_RETRIES=1` ⇒ 2 tentatives, sert la 2ᵉ ⇒ healthy) | `probe_state_get2_binds_state_retries` (le T-killer reste VERT) | `1001c1cd…` == pristine ✓ |
| **T** | drop `timeoutMs: STATE_TIMEOUT_MS, ` | **SURVIT 8/8** (aucun test ne mesure la deadline du GET₂) | **ROUGE 9/1** — `actual: 'state_unreachable', expected: null` (mutant : `timeout ← env 1000 ms < 3000 ms de délai serveur` ⇒ abort aux 2 tentatives ; réel : `STATE_TIMEOUT_MS=5000 ms` ⇒ lit le corps différé ⇒ healthy) | `probe_state_get2_binds_state_timeout` (le R-killer reste VERT) | `1001c1cd…` == pristine ✓ |

**Séparation propre** : sous R seul le R-killer rougit, sous T seul le T-killer rougit (l'autre liaison restant intacte) —
chaque mutant tue EXACTEMENT son test nommé (même propriété que N-G2-1/2/3). R est **déterministe** (compteur de hits, sans
timing) ; T est temporel avec **~2000 ms de marge de chaque côté** (env 1000 < délai 3000 < STATE_TIMEOUT_MS 5000) et sert
UNE requête d'état sans abort sur le chemin réel (`res.on("close")` annule tout envoi en attente si le client abandonne —
aucun `write-after-abort`, vérifié : 0 occurrence dans le log du mutant T).

*Marge T MESURÉE (non inférée)* : la durée PROPRE du T-killer est **stable à 3157–3299 ms sur les 10 runs** (y compris le run
#3, 11,7 s GLOBAL — sa charge est sur les AUTRES tests du fichier : le T-killer y fait **3200,8 ms**). ~3200 ms ≈ le délai
serveur 3000 ms + I/O ⇒ le GET₂ réel lit le corps différé ~1800 ms SOUS `STATE_TIMEOUT_MS`=5000, et le GET₁ n'a JAMAIS
dépassé son budget (sinon la durée sauterait de ≥1000 ms par retry). Discriminant démontré, pas supposé.

*Hypothèse latente déclarée (comme le paragraphe `hits===1` de N-G2-2, §10.4)* : `PROBE_TIMEOUT_MS=1000` plafonne AUSSI le
GET₁ du T-killer ; la prémisse est qu'un `timeline.jsonl` de 4,7 Ko se sert en loopback en < 1000 ms (10× la latence typique),
avec les **2 retries par défaut** (`PROBE_RETRIES` non posé) en filet. Un GET₁ dépassant 1 s aux **trois** tentatives ferait
échouer le test en `unreachable` (pas en `state_unreachable`) — un mode d'échec DISTINCT de la régression de liaison timeout
visée, donc jamais un faux vert du mutant T. Mesuré : 0/10 (durée T-killer plate à ~3,2 s).

### 11.3 Oracles post-pli (décomptes exacts, re-exécutés — non recopiés)

| Oracle | Commande | Résultat |
|---|---|---|
| Suite COMPLÈTE | `env -u … npm run test` | **tests 514 / pass 514 / fail 0 / skipped 0 / todo 0 / cancelled 0** (exit 0, 47,6 s) — G2-delta 512 + **2 killers** |
| CI | `env -u … npm run ci` | exit 0 ; `gate:vocab` **OK — 181 fichier(s)** (inchangé : ni RUNBOOK ni le test d'état ne sont dans un scope scanné) ; `typecheck` **0 erreur** ; **514/514** |
| Flakiness | `probe-narabi-state.test.ts` × 10 | **10/10 : 10 pass / 0 fail** chaque run (exit 0), 5,2–11,7 s ; **0 flake** (marge T tenue même sur le run le plus lent) |
| **R-25** | `git diff --shortstat 57e9cbc -- <pathspec `STAT=` de `.github/workflows/ci.yml:65`>` | **535 ins + 13 del = 548 ≤ 1205** (pré-pli `57e9cbc...HEAD` = 466+13 = **479**, == G2-delta ; mes +69 lignes dans `test/probe-narabi-state.test.ts` ; **RUNBOOK+PLI `docs/**/*.md` EXCLUS** — `--stat` ne compte que le fichier de test parmi mes édits) |

### 11.4 sha256 post-pli (état gelé du pli G2-delta) — SUPERSÈDE §7 pour ces DEUX fichiers uniquement

`docs/RUNBOOK-sentinel.md` **`8f3486ed9254a551a61534b516de8fad1c850d6af244a219ed794aa3ac1e5123`** (supersède §7 `3a049053…`) ;
`test/probe-narabi-state.test.ts` **`800e89bf2f1f23f4f7daa4a75c2786a4b7bd1107cc9ddc00c8060b9a416c0ff2`** (supersède §7 `55e50222…`) ;
`scripts/probe-narabi.mjs` **`1001c1cd1f5bb8e8cc131986295360a296c895487635e532509ca549d9d8058f`** (INCHANGÉ, == §7). Les 5 autres
fichiers de §7 sont byte-identiques. `git status` = seuls `docs/RUNBOOK-sentinel.md` et `test/probe-narabi-state.test.ts`
modifiés (R-20 : aucun commit, aucun workflow ; le probe restauré == pristine).

### 11.5 Provenance du pli G2-delta
Worker **`claude-opus-4-8[1m]`**, effort max, contexte frais, `2026-09-21`. R-20 (aucun commit/workflow ; mutants R/T joués
IN-PLACE puis restaurés BYTE-EXACT par copie du backup, `sha256` re-vérifié == pristine ; jamais `git checkout`/`stash`).
R-21 (chaque fait porte son `fichier:ligne` first-hand ou sa mesure rejouée ; suite/CI/flakiness/R-25 re-exécutés). Advisor
intégré (Fable 5.1) consulté AVANT l'écriture des killers (pièges intégrés : R-25 en arbre de travail vs `...HEAD`, réutilisation
keep-alive undici sur le killer R, `write-after-abort` sur le killer T, niveau de vérification R-21 des docs, décalage +3
lignes du RUNBOOK). Logs sous `F:\tmp\claude\F--Monark\a7659644-0519-4943-8b82-d50d7405fe34\scratchpad\g2d-fold\` :
`mutate.mjs`, `bak\probe-narabi.mjs.pristine`, `logs\{after-pristine,after-mutantR,after-mutantT,full-test,ci,flake-1..10}.log`.
