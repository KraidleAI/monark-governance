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
2. **Rehausse `monark-probe.service TimeoutStartSec` pour SMTP** — propriétaire -a/orchestrateur ; déclencheur : la
   fusion -a (qui fixe `MAX_SMTP_DEADLINE_MS`). -b n'a pas besoin de la rehausse (GET₂ tient sous 90 s).
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

- `npm run test` COMPLET : **509 tests, 509 pass, 0 fail** (base 504 + 5 tests -b), `exit 0`. Re-joué APRÈS
  restauration des mutants : **509/509**.
- `npm run typecheck` (`tsc --noEmit`) : **0 erreur** (avec `exactOptionalPropertyTypes` ; `EvaluateInput.stateCheck?: StateCheck | undefined`).
- `eslint` fichiers touchés (`test/probe-narabi-state.test.ts`, `test/probe-narabi.test.ts`) : **0** (le `.mjs`/`.d.mts` sont ignorés par eslint).
- `lint:ratchet` : **69/69** (plafond inchangé — le test neuf n'ajoute aucune violation de typage différé).
- `gate:vocab` : **OK, 181 fichiers, 0 claim interdit**.
- `export:check` : **OK, 0 chemin interdit, 0 hit français**.
- `lang:gate` : **OK, 0 hit français non exempté**.
- `no-secret-in-repo` : dans la suite (509/509) — aucun secret (loopback/`.invalid`/snapshot public seulement).
- **R-25** : `git diff --shortstat 57e9cbc -- <pathspec ci.yml:65>` (`docs/**/*.md` + fixtures + package-lock
  exclus, fichier neuf via `git add -N`) = **379 insertions + 13 suppressions = 392 ≤ 1205**.
- **Nouveaux tests -b (5)** tous VERTS : `probe_state_digest_cross_check`, `probe_state_unreachable_precedence`,
  `probe_get_retries_exactly_n_plus_one`, `probe_sentinel_timeoutstartsec_inter_unit_coherence`,
  `probe_state_get_rss_and_worstcase_bounds`. Test hérité réconcilié `probe_get_over_loopback_http_executes` : VERT.

Environnement : dépendances installées par `npm ci --prefer-offline` (cache `F:\cache\npm`, 17 s, aucun réseau).

---

## 7. Table sha256 (état final)

| Fichier | sha256 |
|---|---|
| `scripts/probe-narabi.mjs` | `1001c1cd1f5bb8e8cc131986295360a296c895487635e532509ca549d9d8058f` |
| `scripts/probe-narabi.d.mts` | `09d6a641527333cb07ce3586fc5517d472c9e62a8ae86f588f49280e9e83a258` |
| `deploy/monark-sentinel.service` | `d70f88ccb11e276caa64b7715795e26266b4d98453f40f95504128e1a83a5433` |
| `test/probe-narabi.test.ts` | `2d820136996f11406b62afedb449520ee2f1867b025e8beb95c14f927703308f` |
| `test/probe-narabi-state.test.ts` | `4cd3e2387d0405d65bf10946dcad1e06a32936452f3633eef1de48c7c647abd9` |
| `docs/adr/ADR-NARABI-OPS-1.md` | `db21d698d1c565e19830fe9c7746b9716078a164df48949c6492f389e372a2f5` |
| `docs/RUNBOOK-sentinel.md` | `1bd93f8ff476a90fc3a3762d8ef2830bda1b1073c19b48e17184896281ef4d78` |
| `docs/PLI-lot-narabi-ops-1b-ii-b.md` | (ce fichier) |

---

## 8. Bloc CHANTIERS.md (verbatim, à consigner par l'ORCHESTRATEUR au G7 — UN MODÈLE RÉSOLU PAR ÉTAPE)

> **sous-lot NARABI-OPS-1b-ii-b (durcissement DÉTECTION + borne démarrage sentinel)** — worktree
> `F:\Monark-wt-narabi1b2b` (`lot/narabi-ops-1b-ii-b`, base `57e9cbc`), offline, effort max.
> **Modèle résolu PAR ÉTAPE** : G1 (code + tests + docs) = worker **`claude-opus-4-8[1m]`**, 2026-09-21 ; G2
> dédiée (relecteur Opus 4.8 SÉPARÉ, C-NB-6) = À VENIR ; checkpoint-2 = validateur-humain `claude-fable-5-1` = À
> VENIR ; G7 + adjudications R-21 = orchestrateur `claude-fable-5-1` = À VENIR.
> **Livré** : 2ᵉ GET borné `state.json` (dérivation par défaut du basename), `state_mismatch`/`state_unreachable`
> (Q4) + précédence fermée, `state_checked`, tueur du réessai GET (M-ii-10), `monark-sentinel.service
> TimeoutStartSec=300` (D=25,481 s ⇒ `RUN_DURATION_D_SEC=26`, E-5/décision 92), test inter-unités (bornes haute
> ET basse), assertion RSS `13×(MAX_MAX_BYTES+STATE_MAX_BYTES)`. Oracles : suite complète **509/509**, typecheck 0,
> gate:vocab 181, lint:ratchet 69/69, export:check + lang:gate 0 hit, **8 mutants ROUGES byte-exact** (M-ii-9,10,
> 13,14,22 + 3 miens). **R-25 392/1205**. NON déployé ; E-5 (VPS site) accordé décision 92, à exécuter par
> l'orchestrateur après G7 + checkpoint-2.

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
