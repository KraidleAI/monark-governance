# G2 DELTA-2 (RELECTEUR SÉPARÉ) — sous-lot NARABI-OPS-1b-i, pli checkpoint-2 `7c4b986..aebbeb3`

**Relecteur G2 DELTA**, instance séparée à contexte frais (je n'ai PAS écrit ce code). Modèle résolu (R-1) : **`claude-opus-4-8[1m]`**, effort max — préfixe `claude-opus-4-8` conforme.
Horloge (`date -u`) : **2026-09-20 19:53 → 20:15 UTC**. Base relue : delta `7c4b986..aebbeb3` (HEAD du worktree = `aebbeb358746c1370b34f3de1cc1599f3dfe4faa`). Worktree `F:\Monark-wt-narabi1b`, branche `lot/narabi-ops-1b-i`.
R-20 (aucun commit, aucun workflow). R-21 (écrit pour re-vérification adversariale). Contraintes tenues : **lecture + exécution seulement** ; AUCUNE édition du worktree ; scratch sous `F:\tmp\narabi1b\g2delta\`. **`TEMP/TMP/TMPDIR` redirigés vers `F:\...\ostmp`** pour la **batterie de mutants (rejeu autoritatif)** et **tous les oracles** ⇒ leurs `mkdtemp("narabi-probe-*")` vont sur F: ; quelques runs d'orientation/baseline ANTÉRIEURS ont utilisé `os.tmpdir()` par défaut (C:) de façon **transitoire**, nettoyés par le hook `after()` — **balayage final : 0 résidu `narabi-probe-*`** dans `%LOCALAPPDATA%\Temp` ni `%USERPROFILE%\AppData\Local\Temp`. Aucune action sortante : loopback `127.0.0.1` + hôtes `.invalid` non-résolvants seulement (`export:check` vérifié **readdir-pur** — 0 `child_process`, 0 `fetch`). Aucun secret.

## Preuve de non-mutation (R-21)
`git -C F:\Monark-wt-narabi1b status --porcelain` **vide AVANT et APRÈS** toute la séquence ; HEAD inchangé `aebbeb3` ; sha256 identiques avant/après :
- `scripts/probe-narabi.mjs` = `47cca16a45885d4baa27ff9cf8efbf67097b9cb2d8fc4904aa94fe4dd8c53b49` (== claim PLI et == contenu committé à `aebbeb3`)
- `test/probe-narabi.test.ts` = `b144280ffce8a77db905c217f136ffd2db83d09c35dcc5654a22417809a9ca68` (== claim PLI et == committé)

Méthode mutants : **copie complète du worktree** (14 Mio hors node_modules, `tar` ; `node_modules` par jonction Windows) sous `F:\tmp\narabi1b\g2delta\repo` ; sha des 2 fichiers de la copie re-vérifiés == committé AVANT de commencer ; remplacement à occurrence UNIQUE **assertée** (`split(find).length===2`) ; SUITE COMPLÈTE `test/probe-narabi.test.ts` sous parent `TZ=UTC` (reporter TAP) ; restauration **byte-exacte** depuis le contenu pristine en mémoire (**jamais `git checkout`**) ; sha re-vérifié APRÈS CHAQUE mutant. Baseline copie : **18/18**. Harnais : `F:\tmp\narabi1b\g2delta\mut.mjs` ; résultats `mut-results.json`.

---

## VERDICT : **PASS-AVEC-CORRECTIONS**

Les 3 corrections de code du checkpoint-2 (**C-V-1**, **C-V-2**, **C-V-3**) sont **réellement fermées** : les 5 mutants imposés sont ROUGES par le test nommé, chacun tueur unique (les tests « masquants » restent VERTS), les tests ne sont pas tautologiques, et la déviation 8 Mio est **first-hand justifiée** (plus fortement que par les propres chiffres du worker). Les blocs docs C-V-4/C-V-5 couvrent **tous** les items du checkpoint. Corrections dues (non bloquantes, à charge de l'orchestrateur qui porte le PLI) : **1 pointeur doc faux** (C-G2D2-1), **1 survivant = item déjà formé** (C-G2D2-2), **1 attribution imprécise** (C-G2D2-3). Aucun défaut de code, aucun problème de sûreté/secret, aucune dette nue.

---

## Étape 1 — Batterie de mutants (rejeu first-hand, `TZ=UTC`, restauration sha-exacte)

### Mutants IMPOSÉS (doivent être ROUGES par le test nommé)
| Mutant | Ligne | Transformation | Résultat | Test tueur (17 pass / 1 fail) | Masquant resté VERT (tueur unique) |
|---|---|---|---|---|---|
| **N4** (C-V-1) | `mjs:246` | `attempt <= retries` → `attempt < retries` | **ROUGE** | `probe_get_over_loopback_http_executes` | `probe_does_not_follow_redirects` (retries=0) VERT ✓ |
| **N1** (C-V-2) | `mjs:159` | suppression du contrôle de lien `prev_line_hash` | **ROUGE** | `probe_evaluate_guards_on_synthetic_lines` | `probe_recomputes_full_chain` VERT ✓ (tamper attrapé par le hash propre l.158) |
| **N2** (C-V-2) | `mjs:296` | `chainstackPresent(last.endpoints)` → `lines.some(...)` | **ROUGE** | `probe_evaluate_guards_on_synthetic_lines` | `probe_chainstack_present_from_real_producer_line` VERT ✓ |
| **N5** (C-V-2) | `mjs:298-303` | lag évalué AVANT `checkChain`, court-circuit ssi `lag_days>0` | **ROUGE** | `probe_evaluate_guards_on_synthetic_lines` | `probe_recomputes_full_chain` VERT ✓ (son `--now` → lag=0, retombe sur la chaîne) |
| **cap-64** (C-V-3) | `mjs:57` | `MAX_MAX_BYTES` 8→64 Mio | **ROUGE** | `probe_timer_multiple_shots` | `probe_env_bounds_fall_back_to_default_not_zero` (clamp l.531) VERT ✓ |

**5 imposés → 5 ROUGES**, chacun **1 seul fail** = le test nommé, chaque masquant confirmé VERT (les revendications « tueur unique » du PLI et la prémisse checkpoint « lag=0 retombe sur la chaîne » sont VÉRIFIÉES first-hand).

### Mutants NOUVEAUX de mon cru (sur les lignes touchées / gardées par le delta)
| # | Ligne | Transformation | Résultat | Tué par |
|---|---|---|---|---|
| NEW-1 | `mjs:57` | cap → **16 Mio** (valeur « déviation ») | **ROUGE** | `probe_timer_multiple_shots` (13×16=208 > 128) |
| NEW-2 | `mjs:57` | cap → **10 Mio** | **ROUGE** | `probe_timer_multiple_shots` (13×10=130 > 128) |
| NEW-3 | `mjs:246` | `attempt <= retries` → `attempt <= retries + 1` | **SURVIVANT** | (aucun — voir C-G2D2-2) |
| NEW-4 | `mjs:304` | `lag_days <= 0` → `lag_days <= 1` | **ROUGE** | `probe_narabi_detects_lag` |
| NEW-5 | `mjs:299` | `if (!chain.ok)` → `if (false)` (garde chaîne coupée) | **ROUGE** | `probe_recomputes_full_chain` + `probe_evaluate_guards_on_synthetic_lines` |

NEW-1/NEW-2 établissent une **cohérence interne forte** : l'assertion MemoryMax du worker (`≥ 13×cap`) interdit **tout cap > 128/13 ≈ 9,85 Mio** — 8 Mio est la seule valeur ronde admissible ; la « déviation » vers 8 Mio est en partie **forcée par l'assertion elle-même**. Le seul survivant (NEW-3) est **exactement l'item CHANTIERS déjà formé** « réessai différencié non prouvé » (déclencheur -1b-ii) → C-G2D2-2, pas une dette nue.

---

## Étape 2 — Non-tautologie du test pur `evaluate()` (`test:201-223`)
Lignes **synthétiques** uniquement (`{day, mints:"0", regime:{}, prev_line_hash, endpoints}` + `line_hash` recalculé par `probeLineHashOf`) : **aucun brut réel, aucun secret, aucun close**. Le mutant **N1 ROUGE est la preuve de non-tautologie** : si les lignes synthétiques survivaient mal au round-trip `JSON.stringify → parseTimeline` (hash propre invalide), `checkChain` casserait dès i=0 sur le hash PROPRE, `n1.reason` resterait `chain_broken` **par artefact de fixture** et N1 SURVIVRAIT. N1 rouge ⇒ les hashes propres sont valides et **seul** le contrôle de lien attrape `[L1,L3]`. De même N2 (assertion `chainstack_present===false` avec L1 à 9 endpoints en tête, L2 dernière à 8) et N5 (assertion `reason===chain_broken` avec `lag_days=5>0`) tuent la garde, pas un artefact. Les assertions portent sur le COMPORTEMENT (lien / dernière ligne / précédence), confirmé mutant par mutant.

---

## Étape 3 — Jugement de la déviation 8 Mio vs 16 Mio (RSS re-mesuré first-hand)
Re-mesure **[lu]** du pic `maxRSS` du process sonde (préchargeur `--import` écrivant `process.resourceUsage().maxRSS` à `exit`), corps servi en **loopback via `spawn` async** (le trap `spawnSync` gèle la boucle parent — documenté `test:63`, reproduit puis corrigé), `TZ=UTC`, Node v24.15.0, cet hôte Windows :

| Corps servi (chemin GET) | maxRSS mesuré (moi) | Claim worker | Marge sous `MemoryMax=128M` |
|---|---|---|---|
| ~0 (baseline) | 60,3 Mio | — | — |
| **8 Mio (cap retenu)** | **97,3–97,5 Mio** | ~100 Mio | **~30 Mio (24 %)** — SÛR |
| **16 Mio (cap-levée)** | **139,0 Mio** | 119 Mio | **DÉPASSE 128 → OOM cgroup** |

- **8 Mio est justifié**, et plus fortement que par les chiffres du worker : mon pic 16 Mio (**139 Mio**) **dépasse** `MemoryMax=128M` ⇒ le job serait tué avant l'écriture de `narabi.json`. Écart 119 vs 139 = **méthode** (mes lignes ~155 o → 37k–75k objets JS vs ~500 o worker) — **même direction, plus conservateur**, aucune contradiction.
- **k=13** cohérent : `13×8=104 Mio` **sur-borne** le pic réel (97 Mio, ~7 Mio de mou) et reste **sous** `MemoryMax=128` (24 Mio de mou). L'assertion `MemoryMax ≥ 13×MAX_MAX_BYTES` est bidirectionnelle (rougit si le cap monte OU si MemoryMax baisse) et **non tautologique** (compare deux constantes indépendantes : 128 du `.service`, cap du code). Observation : `k=13` est **fixe et lié à CETTE mesure** ; la colonne `k` variable du tableau RSS du PLI (11, 10, 8) est le k minimal par-cap, PAS ce qu'assère le test — le commentaire `test:420` dit « re-dériver si le cap bouge », correct.
- **`MAX_MAX_BYTES == DEFAULT_MAX_BYTES` (8 Mio) INTENTIONNEL** et sain : `transportBounds` clampe par `Math.min`, donc `PROBE_MAX_BYTES` ne peut plus qu'ABAISSER. **Clamp vivant vérifié** : sous cap-64, `probe_env_bounds…:531` (`999999999→MAX`) reste VERT ; et à la mesure, un `PROBE_MAX_BYTES=16Mio` a été **ramené à 8 Mio** (corps 16 Mio refusé `too_large`) — le clamp protège bien le RSS.

Verdict Étape 3 : déviation **ACCEPTABLE** (déclarée, mesurée, tranchable). 16 Mio non viable (RSS réel > MemoryMax + assertion rouge).

---

## Étape 4 — Oracles un à un (PAS `npm run ci`) + R-25
Analyseurs (`gate:vocab`, `lang:gate`, `lint:ratchet`, `no-secret-in-repo`, `ci-gates`, `sentinel-retry`, `export:check`) rejoués sur la **copie byte-identique** ou le worktree (`TEMP`→F:), tous **readdir-pur / lecture seule** ; seul **R-25** utilise git (worktree, lecture seule). `export:check` **n'appelle NI git NI réseau** (vérifié — le match `child_process` antérieur était un mot en commentaire).

| Oracle | Résultat |
|---|---|
| `typecheck` (`tsc --noEmit`) | **0** (exit 0) |
| `eslint scripts/probe-narabi.mjs test/probe-narabi.test.ts` | **0 erreur** (`.mjs` ignoré = warning attendu ; test propre) |
| `lint:ratchet` | **69/69**, exit 0 |
| `gate:vocab` | OK, **178** fichiers scannés, exit 0 |
| `lang:gate` | OK, 0 hit non-exempt, exit 0 |
| `export:check` | OK, 0 forbidden path, exit 0 |
| `probe-narabi.test.ts` | **18/18** |
| `probe-narabi` + `sentinel-retry` + `ci-gates` + `no-secret-in-repo` | **50/50 pass, 0 fail** (18 + 32) |

**R-25** (pathspec `STAT=` de `.github/workflows/ci.yml:65`, base `298aa5c`, arbre de travail ≡ `aebbeb3` propre) :
`git diff --shortstat 298aa5c -- . ':(exclude,glob)docs/**/*.md' … (pathspec CI complet)` → **`7 files changed, 1090 insertions(+), 4 deletions(-)` = 1 094**. Two-dot et three-dot (`298aa5c...HEAD`, comme la CI) identiques (historique linéaire). **1 094 ≤ 1 205** (plafond) et **< 1 100** (seuil d'alerte) ✓ — == claim PLI. `docs/**/*.md` (dont le PLI) exclus ⇒ 0 coût R-25 pour les docs.

---

## Étape 5 — Couverture C-V-4 / C-V-5 par les blocs « ▼ BLOC EXACT » du PLI (point par point)

**C-V-4 (checkpoint l.25) — L-5 orphelin.** Bloc CHANTIERS du PLI, item « C-V-4 » : couvre TOUS les sous-points :
- L-5 assigné nommément **-1b-ii** ✓ · échéance **« avant le go de déploiement »** ✓ · flip `RUNBOOK-sentinel.md §Sonde externe (:186-191, encore "deferred")` ✓ (vérifié : l.186 header, l.189 « deferred to pli NARABI-OPS-1b ») · amendement **table des tuyaux ADR** ✓ · amendement **§6 par SHA** ✓ · résiduel **« sonde morte = silence »** (dead-man) ✓. **Aucun manque.**

**C-V-5 (checkpoint l.26) — registre durable, déclencheur + propriétaire.** Mapping complet (9 exigences → blocs CHANTIERS/JOURNAL) :
| Exigence checkpoint C-V-5 | Couverte dans le PLI |
|---|---|
| 1. Preuve Linux fuseau + injection `--import` (premier run CI) | CHANTIERS « Preuve Linux (fuseau CI-UTC + injection --import) » ✓ |
| 2. Atomicité sous crash (structurelle) | CHANTIERS « Atomicité de narabi.json SOUS CRASH » ✓ |
| 3. Déviation `PROBE_RETRIES=0` | CHANTIERS « Déviation PROBE_RETRIES=0 conservé (carve-out) » ✓ |
| 4. Réessai différencié | CHANTIERS « Réessai différencié retries=0 vs retries=2 non prouvé … déclencheur -1b-ii » ✓ (= mon survivant NEW-3) |
| 5. Déclencheur échu `digest == digest_T` → G0 -1b-ii | CHANTIERS « digest == digest_T … RE-DÉCLENCHÉ au G0 -1b-ii » ✓ |
| 6. `TimeoutStartSec` sentinel + test inter-unités | CHANTIERS « TimeoutStartSec du sentinel + test de cohérence INTER-UNITÉS » ✓ |
| 7. C-V-3 s'il est formé | CHANTIERS « C-V-3 — RSS Windows seulement ; confirmer au premier run déployé » ✓ |
| 8. Question G0 -ii : panne E/S locale → mail ? | CHANTIERS « Question de valeur G0 -1b-ii : un probe_error né d'une panne d'E/S LOCALE … » ✓ |
| 9. JOURNAL : modèles résolus, générateur≠relecteur, `error_origin` C-G2-1..8 + C-G2D-1..4, déviation delta sans relecteur | JOURNAL : 4 puces (modèles ; déviation delta ; error_origin C-G2-1..8 ; error_origin C-G2D-1..4) ✓ + bonus error_origin C-V-1..3 |

**Aucun item C-V-5 manquant.** Les items supplémentaires des blocs (health.json, SMTP 587, dead-man T-1b, STUB_SRC, couplage ordre-de-hash, dernier line_hash, durée run publiant) sont des items formés hérités du G2/G2-delta — **surplus légitime, pas des manques**. `error_origin` C-V-1 = orchestrateur+worker, C-V-2/C-V-3 = worker : **cohérent avec le checkpoint**.

**Audit des pointeurs fichier:ligne à `aebbeb3`** : 10/11 exacts (`mjs:37/57/230`, `run.ts:190-191`, `.d.mts:64`, `RUNBOOK:186`, `test:201-223/215-216/218/221-222/323-329/418-423`). **1 FAUX** → C-G2D2-1.

---

## Défauts numérotés

### C-G2D2-1 — pointeur PLI `test:492` FAUX (doc, mineur, `error_origin: worker`)
`docs/PLI-lot-narabi-ops-1b-i.md`, section RSS/déviation : « le clamp reste vivant (`999999999`→8 Mio tue toujours M-G2-7, **`test:492`**) ». À `aebbeb3`, `test/probe-narabi.test.ts:492` est un **commentaire** (`// crypto random. rename is failed by INJECTION…`, bloc C-G2D-2). L'assertion clamp `999999999→MAX` est en **`test:531`**. La revendication (clamp vivant) est VRAIE (vérifiée : sous cap-64 ce test reste VERT), seul le pointeur est faux — mais un relecteur suivant R-21 atterrit sur un commentaire.
**Correction minimale** : dans le PLI, `test:492` → **`test:531`**.

### C-G2D2-2 — mutant survivant `attempt <= retries + 1` (observation, mineur, lié à un item formé)
`scripts/probe-narabi.mjs:246`. NEW-3 survit à la suite complète (18/18) : le chemin de SUCCÈS court-circuite la boucle (1 seul GET, `okHits` inchangé) et aucun test ne pinne le nombre d'essais sur le chemin d'ÉCHEC ; `probe_timer_multiple_shots` dérive la borne des CONSTANTES (`MAX_RETRIES+1`), pas de la boucle. **Ce n'est PAS une dette nue** : c'est EXACTEMENT l'item CHANTIERS déjà formé « Réessai différencié retries=0 vs retries=2 non prouvé — aucun test ne rejoue échoue-puis-réussit exactement N fois » (propriétaire : orchestrateur ; déclencheur : **-1b-ii**, où le réessai SMTP est re-conçu). Sûreté non affectée (retries clampé à `MAX_RETRIES=4` ⇒ pire 6 essais × 10 s < `TimeoutStartSec=90`).
**Correction minimale (optionnelle, différable -1b-ii)** : serveur loopback échouant N fois puis réussissant, avec compteur `assert(hits === retries + 1)`.

### C-G2D2-3 — attribution « 16 Mio suggéré par le checkpoint » non littérale (traçabilité, mineur, `error_origin: worker`)
`docs/PLI-lot-narabi-ops-1b-i.md`, tableau RSS : ligne « 16 Mio (**suggéré par le checkpoint**) ». `grep 16` sur `docs/CHECKPOINT2-lot-narabi-ops-1b-i.md` et `docs/G2-DELTA-lot-narabi-ops-1b-i.md` (persistés) : **aucun « 16 Mio »** — le checkpoint C-V-3 dit « abaisser le plafond OU épingler `MemoryMax ≥ k×MAX_MAX_BYTES` ». Le « 16 Mio » est le **point de comparaison de la mission**, pas un texte du checkpoint. Les chiffres RSS et le choix 8 Mio tiennent ; seule la formule d'attribution est imprécise.
**Correction minimale** : « (suggéré par le checkpoint) » → « (point de comparaison ; le checkpoint dit "abaisser le plafond ou épingler k") ».

---

## Synthèse chiffrée pour l'orchestrateur
- **Modèle résolu** : `claude-opus-4-8[1m]`, effort max (R-1 OK).
- **Verdict** : **PASS-AVEC-CORRECTIONS** (3 corrections mineures, aucune bloquante sur la substance ; C-G2D2-1 à porter avant que l'orchestrateur ne copie le PLI).
- **Mutants** : 5 imposés / 5 ROUGES par test nommé (tueur unique confirmé, masquants VERTS) ; 5 nouveaux : 4 ROUGES + 1 SURVIVANT (= item formé -1b-ii).
- **Oracles** : typecheck 0 · eslint 0 · ratchet 69/69 · gate:vocab 178 OK · lang:gate OK · export:check OK · tests **50/50** (probe 18/18).
- **R-25** : **1 094** (1090+4) ≤ 1 205 ✓.
- **RSS [lu]** : 8 Mio → 97,3 Mio (sûr) ; 16 Mio → 139 Mio (> 128, OOM) ⇒ déviation 8 Mio justifiée.
- **Non-mutation** : worktree propre avant/après, HEAD `aebbeb3`, shas `47cca16a…` / `b144280f…` inchangés, rien sur C:, aucune action sortante.
