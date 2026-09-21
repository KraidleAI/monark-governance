# G2 — ÉTAT FUSIONNÉ NARABI-OPS-1b-ii (merge -a × -b), relecteur séparé, contexte frais

**Modèle résolu (R-1) : `claude-opus-4-8[1m]`** — préfixe `claude-opus-4-8` conforme, effort max ; Opus 5 banni, non
utilisé. L'orchestrateur vérifie ce préfixe avant de consommer cette sortie comme preuve (R-21). R-20 : aucun commit,
aucun workflow, aucune écriture dépôt persistante (mutants/injection : sauvegarde + restauration byte-exacte sha256,
JAMAIS `git checkout`/`stash`). Tout sous `env -u SMTP_HOST -u SMTP_PORT -u SMTP_USER -u SMTP_PASS -u ALERT_TO
-u ALERT_FROM -u PROBE_STATE_URL` ; loopback seul ; AUCUN vrai mail. Scratch `F:\tmp\g2-narabi-merge\`.
Cible mandatée : **`e87d7b5`** (merge de -b), parent `1886916` (merge de -a), base `lot/etude-suite`.
Date : 2026-09-21.

## VERDICT : **PASS-AVEC-CORRECTIONS**

La composition à la main (6 blocs de conflit + 2 clés dupliquées retirées) est une **union fidèle et vérifiée**
(dans les DEUX sens : chaque ligne `+` de -a/-b présente, chaque ligne `-` de -a/-b absente — 0 résurrection) :
aucun contenu perdu, aucun marqueur, aucune clé dupliquée, (a)–(g) tous prouvés par ré-exécution, 56 tueurs des
deux lots présents, ≥4 mutants par lot ROUGES sur l'état fusionné, pire cas mesuré 80,2 s < 120 s, suite 611/611,
flakiness sonde 56/56 ×5, R-25 1644 (attendu). Le verdict porte des **corrections formées** (C-G2M-1..3), propriété
orchestrateur — d'où « AVEC-CORRECTIONS » et non PASS nu. Aucune correction n'invalide la fidélité de la
composition ; aucune n'est un défaut du code de sonde.

**PORTÉE (à lire d'abord).** Cette G2 porte sur **`e87d7b5`** (cible mandatée) — la fidélité de la composition. L'état
G7/déployable est désormais **HEAD `57d5d69`** (l'orchestrateur a avancé l'arbre PENDANT ma passe : e87d7b5 → 9e9190a
→ 9644715 → 57d5d69). Le blob **`scripts/probe-narabi.mjs` = `e89b7a57` est IDENTIQUE de e87d7b5 à 57d5d69** ⇒ tous
mes mutants/mesures/replays (sur le `.mjs`) valent pour tout l'intervalle. Delta e87d7b5→57d5d69 = **docs
checkpoint-2 + un commentaire « four-term » du `.service` (`TimeoutStartSec=120` inchangé, vérifié) + le test
d'intégration inter-lots** (C-G2M-3, désormais commité, ci 612/612 selon l'orchestrateur ; vérifié présent+vert).
Mon verdict de composition se transporte donc à 57d5d69 ; ce qui reste dû est C-G2M-1/2 (voir liste).

---

## 1. Union fidèle (RE-EXÉCUTÉ, mécanique — pas à l'œil)

Merge-base(-a,-b) = `331c169`. Pour CHAQUE ligne `+` ajoutée par -a et par -b (vs base), vérification de présence
(trimmée) dans le fichier fusionné `e87d7b5` (`F:\tmp\g2-narabi-merge\union-check.mjs`).

| Côté | lignes `+` (scripts/test/deploy/vocab) | MISSES | Toutes mappées à un bloc composé ? |
|---|---|---|---|
| -a | 984 | 16 | OUI |
| -b | 500 | 11 | OUI |

**Chaque MISS est un bloc composé, aucun contenu perdu :**
- -a `.mjs` (8) : en-tête recomposé (`--file/…/--state-file`, « two GETs », doc schéma 2 union) = (f) + union.
- -a `.d.mts` (2) : JSDoc union + **dédup `state_checked`** (l'ancien « always false in -a » superseded par le
  champ unique commenté `d.mts:61`).
- -a `.test.ts` (6) : import union (`+ STATE_TIMEOUT_MS, STATE_RETRIES`, `test:25`) + commentaire+formule
  worstCappedSec recomposés = (d).
- -b `.mjs` (6) : en-tête union ; commentaire worstcase -b (« 70 s < 90 ») superseded par la formule 4-termes
  (mjs:56-59) = (g)/(d) ; **dédup base-objets** (les défauts `state_checked` de -b superseded par l'objet union
  portant AUSSI les champs alerte de -a — clé unique).
- -b `.d.mts` (4) : JSDoc union + **dédup `state_checked: boolean`** (superseded par le champ unique `d.mts:61`).
- -b `vocab-banned.json` (1) : la ligne `files[]` de -b (SANS le test state) superseded par l'union qui AJOUTE
  `test/probe-narabi-state.test.ts` = (e).

**Marqueurs de conflit** : `git grep '<<<<<<<|=======|>>>>>>>'` sur scripts/test/deploy/vocab = **AUCUN** (le seul
`=======` du dépôt est dans un doc étranger `docs/G2-delta-lot-t1a-ii-a.md`).
**Clés dupliquées** : `state_checked` = 1 par objet-littéral (mjs:331/332/333/334/349/446 = objets distincts) ;
`NarabiState.state_checked` = 1 seul champ (`d.mts:61`) ; les 29 suppressions de `1886916..e87d7b5` sont toutes des
lignes -a superseded par leur version union (corrélées 1:1 aux MISSES -a). **Union fidèle confirmée.**

**Sens inverse — résurrections (`reverse-union-check.mjs`).** Pour chaque ligne `-` (supprimée par -a/-b vs base,
len>12), présence dans le fusionné ? **0 ligne supprimée par les DEUX côtés ne réapparaît** (résurrection = 0) ;
-a-supprimées présentes = 0 partout. Seules **2** lignes -b-supprimées réapparaissent (`mjs:347`, `mjs:444`) — VÉRIFIÉES
BÉNIGNES : ce sont la 1ʳᵉ ligne d'un objet-littéral MULTI-LIGNES (`base` mjs:345-350 ; `state` probe_error mjs:442-447)
dont `state_checked: false` + les champs alerte -a sont sur les lignes ADJACENTES (`:349`/`:446`) — objet union
complet, aucun champ perdu. **Union fidèle dans les deux sens.**

Comparaison fonction-par-fonction : le `.mjs` fusionné porte le bloc SMTP de -a (`sendSmtp`, `composeMail`,
`encodeData`, `sanitizeField`, `isEmailish`, `smtpTransportPlan`, `classifyConnectError`, `smtpConfig`,
`smtpDeadlineMs`, `maybeAlert`, `tlsConnectOptions`, `rfc5322Date`, `isIpLiteral`) ET le bloc STATE de -b
(`stateDigestOf`, `crossCheckVerdict`, `deriveStateUrl`, branche GET₂ dans `probe`, insertions `evaluate`),
`parseArgs`/`main`/constantes = unions.

## 2. Points (a)–(g) — chacun PROUVÉ par ré-exécution

| # | Attendu | Preuve re-exécutée |
|---|---|---|
| (a) | tueur N4 vert | `probe_get_over_loopback_http_executes` **PASS** (okServer sert aussi `/narabi/state.json`, réconciliation -b) |
| (b) | `--state-file` accepté / flag inconnu refusé | REPLAY CLI : `--state-file` → `schema:2`, `state_checked:false`, PAS d'« unknown flag », exit 1 (unhealthy) ; `--state` → « unknown flag: --state », exit 2, **narabi.json NON écrit**. `parseArgs` : `--state-file` seul ajout -b, AVANT `else{throw}` (mjs:764) ; aucun autre flag -b |
| (c) | schema 2, `state_checked` une fois | out.json `schema:2` + un seul `state_checked` ; objets défaut mjs:349/446 = 1 chacun |
| (d) | worstCappedSec 4 termes = 100, 120 > 100 | `test:443` = `ceil((MAX_TIMEOUT_MS·(MAX_RETRIES+1)+STATE_TIMEOUT_MS·(STATE_RETRIES+1)+MAX_SMTP_DEADLINE_MS+START_MARGIN_MS)/1000)` = 100 ; `test:444` assert `120 > 100` ; `probe_timer_multiple_shots` **PASS** |
| (e) | vocab couvre le test state (injection) | `vocab-banned.json:111` liste `test/probe-narabi-state.test.ts` ; INJECTION « would have alerted » ⇒ `gate:vocab` **exit 1** flag `probe-narabi-state.test.ts:421` ⇒ RESTORE byte-exact (sha==800e89bf), gate exit 0, git clean |
| (f) | en-tête mjs:6,10-11 | mjs:6 `--file/…/--state-file` ; mjs:10-11 « two GETs … timeline.jsonl, then the derived state.json » ; mjs:14-20 schéma 2 union |
| (g) | commentaire mjs:57 sur 120 s, 4 termes | mjs:56-59 « GET1 …·5 + GET2 STATE_TIMEOUT_MS·(STATE_RETRIES+1) + SMTP … + margin = 50 + 10 + 30 + 10 = 100 s < TimeoutStartSec 120 s » |

## 3. Tueurs des deux lots + mutants (RE-EXÉCUTÉ)

**56 tueurs à e87d7b5 = 46 (`probe-narabi.test.ts`) + 10 (`probe-narabi-state.test.ts`)**, tous nommés (liste
complète relevée). -a killers (probe_secret_never_printed, probe_smtp_*, probe_alert_*, g2_no_test_can_send_real_mail,
probe_rejects_unknown_flag, …_on_connect_failure) ; -b killers (probe_state_digest_cross_check,
probe_state_unreachable_precedence, probe_get_retries_exactly_n_plus_one,
probe_sentinel_timeoutstartsec_inter_unit_coherence, probe_state_get_rss_and_worstcase_bounds,
probe_state_get2_binds_state_max_bytes [N-G2-3], probe_state_digest_must_be_string [N-G2-1],
probe_state_url_override_honored_and_guarded [N-G2-2], probe_state_get2_binds_state_retries [R],
probe_state_get2_binds_state_timeout [T]).

**11 mutants rejoués sur l'état fusionné** (`F:\tmp\g2-narabi-merge\merge-mutants.mjs` ; find_count==1 sur le `.mjs`
FUSIONNÉ pour CHACUN ; restauration byte-exacte sha==4e4338c0) :

| Lot | Mutant | Tueur | Résultat |
|---|---|---|---|
| -a | C-G2-1a (2ᵉ timer connexion) | probe_smtp_single_wall_clock… | **RED** |
| -a | C-G2D-1 (clearT retiré du catch connexion) | …_on_connect_failure | **RED** |
| -a | no-leak (clearT retiré du finally) | probe_smtp_no_residual_timer_handle | **RED** |
| -a | C-G2-3 (`\s`→espace) | probe_smtp_headers_wellformed | **RED** |
| -a | C-G2-4 (borne octets désactivée) | probe_smtp_byte_bound_stops_flood | **RED** |
| -a | M-ii-19 (implicit TLS→net) | probe_smtp_implicit_tls_never_speaks_plaintext | **RED** |
| -b | N-G2-1 (`d != null`) | probe_state_digest_must_be_string | **RED** |
| -b | N-G2-2 (override ignoré) | probe_state_url_override_honored_and_guarded | **RED** |
| -b | N-G2-3 (sans maxBytes) | probe_state_get2_binds_state_max_bytes | **RED** |
| -b | R (sans retries) | probe_state_get2_binds_state_retries | **RED** |
| -b | T (sans timeoutMs) | probe_state_get2_binds_state_timeout | **RED** |

6 mutants -a + 5 mutants -b = **11/11 ROUGES**, chacun tue SON test nommé, find_count==1 tenu (aucune collision
introduite par la coexistence des deux corps), sha `.mjs` avant==après.

## 4. Composition GET₁+GET₂+SMTP (RE-EXÉCUTÉ)

**Bornes non-relevables (lecture code) :** `transportBounds` clampe `PROBE_TIMEOUT_MS→MAX_TIMEOUT_MS=10 000`,
`PROBE_RETRIES→MAX_RETRIES=4` (GET₁ ≤ 50 s) ; `smtpDeadlineMs` clampe `→MAX_SMTP_DEADLINE_MS=30 000` (SMTP ≤ 30 s) ;
`STATE_TIMEOUT_MS=5 000` / `STATE_RETRIES=1` FIXES non-tunables (GET₂ = 10 s). Pire cas non-relevable = 50+10+30 =
**90 s** ; formule (marge +10) = **100 s < 120**.

**Mesure réelle loopback (serveurs silencieux, `measure-worstcase.mjs`, spawn async)** : chemin GET₁ silencieux ×4
puis sert au 5ᵉ (reachable) → GET₂ silencieux ×2 → unhealthy → SMTP silencieux. GET₁=5 tentatives, GET₂=2,
SMTP→smtp_timeout. **ELAPSED = 80,2 s < 120 s.** (validation additive scalée : 5+10+3 = 17,2 s.)
`deploy/monark-probe.service:31 TimeoutStartSec=120` ✓. `deploy/monark-sentinel.service:36 TimeoutStartSec=300` ✓
(identique au blob source -b — INTACT).

## 5. Suite complète + flakiness (RE-EXÉCUTÉ)

- **`npm run test` = 611 / 611 pass / 0 fail / 0 cancelled** (état e87d7b5, capté AVANT la dérive orchestrateur, cf. §8).
- **`npm run ci` = exit 0** (gate:vocab OK 189 fichiers ; typecheck 0 ; test 611/611).
- **Flakiness ×5 des deux fichiers sonde (e87d7b5 propre)** : `--test-skip-pattern` du test staged sur l'arbre vif
  ⇒ **56 / 56 pass / 0 fail ×5** (46+10, exactement les tueurs d'e87d7b5). (`git archive e87d7b5` en scratch NON
  jouable : `probe-narabi.test.ts` importe `apps/sentinel/src/timeline.ts → @monark/hikae`, paquet workspace absent
  d'une archive sans node_modules ; `npm install` interdit — fallback skip-pattern retenu, node_modules réel.) La
  suite complète 611 d'e87d7b5 a aussi passé ces 56 verts.

## 6. R-25 (RE-EXÉCUTÉ, pathspec exacte `ci.yml:65`)

`git diff --shortstat lot/etude-suite...e87d7b5 -- . <exclusions ci.yml:65>` = **1580 ins + 64 del = 1644**
(= 1094 -a + 548 -b + 2 composition, ATTENDU). merge-base(etude-suite,e87d7b5)=`79374f2`. Par fichier : `.mjs`
421/25, `.d.mts` 88/6, `.test.ts` 628/18, `state.test.ts` 419/0, deploy 23/14, vocab 1/1.
**1644 > VIBEGATES_PR_LIMIT=1205** → **le gate R-25 de la CI ÉCHOUE par construction** sur une PR unique de la
branche fusionnée (`ci.yml:71` `CHANGED > LIMIT ⇒ exit 1`). Conséquence (attendue, mission « dépasse 1205 par
construction ») : l'orchestrateur landera les DEUX lots comme leurs PR déjà relues (-a 1094 ≤ 1205, -b 548 ≤ 1205),
pas une PR combinée. Non-FAIL par mandat.

## 7. Secrets / vocabulaire / sentinel (RE-EXÉCUTÉ)

- `no_secret_in_repo` **PASS** ; `s3cr3t-PONY-cell-42` absent hors test/prose relecteur.
- `gate:vocab` OK, 189 fichiers, aucun mot interdit (e87d7b5).
- `sentinel_never_prints_endpoint_url` **PASS**.

## 8. Intégrité byte-exacte + DÉRIVE DE L'ARBRE (provenance — FINDING)

sha256 (mes mutations/injections restaurées byte-exact, vérifié en cours de passe) : `.mjs` 4e4338c0, `.d.mts`
656cb61d, `state.test.ts` 800e89bf, `monark-probe.timer` 39335a1e, `vocab-banned.json` 549327cd == baseline.
**MAIS l'arbre a DÉRIVÉ pendant ma passe : HEAD a bougé `e87d7b5` → `9e9190a` → `9644715` → `57d5d69` (3 avancées) ;
un instant `M test/probe-narabi.test.ts` staged fut observé, désormais commité.**

Analyse : **l'orchestrateur (Fable 5) a écrit dans CE worktree PENDANT ma G2** :
- `9e9190a`, `9644715` : fold docs checkpoint-2 (RUNBOOK/ADR/PLI-b) + commentaire « four-term statement » du
  `.service` (**`TimeoutStartSec=120` inchangé**, diff = commentaire seul, vérifié).
- `57d5d69` : « C5 fold — real merged pipe test » = **le test d'intégration inter-lots**
  `probe_state_mismatch_drives_smtp_alert_merged` (state_mismatch → mail SMTP, 13 assertions, 2 mutants neufs red) +
  reasons `state_mismatch`/`state_unreachable` au vocab-test ; ci 612/612, R-25 **1690** (annoncé) — **c'est
  exactement ma C-G2M-3, désormais landée** (vérifié : test présent à HEAD, vert isolé).
- **`e87d7b5` reste ANCÊTRE** de HEAD (cible intacte) ; le **blob `.mjs` `e89b7a57` est IDENTIQUE de e87d7b5 à
  57d5d69** ⇒ mes mutants/mesures/CLI valent pour tout l'intervalle.
- e87d7b5:`probe-narabi.test.ts` = **46** ; à HEAD = 47 (le test C5). **e87d7b5 = 56 sonde (46+10), CONFORME au
  mandat.** Ma suite 611 captée à e87d7b5 (pré-C5) ; flakiness propre 56/56 ×5 (§5).
- Arbre courant (57d5d69) = **612 tests** ; une exécution isolée a montré **1 fail transitoire NON-REPRODUCTIBLE**
  (re-run immédiat = 612/612) — hors fichiers sonde (56/56 ×5 stables). À caractériser par l'orchestrateur (C-G2M-3).

**Instantané de clôture** : `HEAD=57d5d6977d3e424f7f28831da55c730033765cd6` ; `git status` **propre** ; e87d7b5
ancêtre de HEAD = OUI.

## Corrections formées (liste fermée — propriété + déclencheur, aucune dette nue)

- **C-G2M-1 [provenance/process, BLOQUANT pour un G7 propre]** — la G2 a été jouée sur un worktree muté
  concurremment par l'orchestrateur : **HEAD a bougé 3 fois** (e87d7b5→9e9190a→9644715→57d5d69) pendant la passe.
  Violation d'isolation de revue (R-21 reproductibilité ; règle « branchement »). Atténué ici car le blob `.mjs`
  est resté identique et le delta est docs+commentaire+test (traçé) ; mais non-discrétionnaire en général.
  *Propriétaire : orchestrateur ; déclencheur : G7 combiné.* Action : **le G7/checkpoint-2 combiné doit statuer sur
  le SHA FINAL FIGÉ `57d5d69`** (pas e87d7b5), sur un worktree gelé, en rejouant la suite complète. Cette G2 couvre
  la composition (blob `.mjs` identique e87d7b5≡57d5d69) ; le G7 confirme le reste sur 57d5d69. `error_origin` =
  **orchestrateur (process)**.
- **C-G2M-2 [provenance]** — le rapport worker de composition mandaté
  `…/tasks/ac366ef9b2525ee33.output` est **VIDE (0 octet)** ; le message de commit e87d7b5 affirme (e)
  « proved » sans artefact survivant. Superseded par ma ré-exécution (qui prouve (e) indépendamment). *Propriétaire :
  orchestrateur/outillage ; déclencheur : G7.* `error_origin` = **outillage**.
- **C-G2M-3 [branchement/couverture — LANDÉE, à confirmer au G7]** — à **e87d7b5** (ma cible) **aucun test
  d'intégration commité** ne rejoue le tuyau inter-lots `state_mismatch (-b) → mail SMTP (-a)` ; le
  `probe_alert_mail_has_no_forbidden_vocab` ne couvrait pas les reasons `state_*` du mail composé. Ma mesure réelle
  exerce empiriquement le chemin verdict-état→SMTP (state_unreachable→tentative SMTP) ⇒ tuyau CÂBLÉ (code) ; la règle
  « branchement » exige néanmoins un test d'intégration non-LLM. **L'orchestrateur l'a commité à `57d5d69`**
  (`probe_state_mismatch_drives_smtp_alert_merged`, 13 assertions, vert isolé, + 2 mutants neufs ; extension vocab).
  *Propriétaire : orchestrateur/worker (périmètre merge) ; déclencheur : G7 combiné.* Action au G7 : re-confirmer
  612 vert **et une passe de flakiness suite complète** (à cause du fail transitoire observé une fois §8). `error_origin`
  = **worker/orchestrateur (couverture de fusion, désormais comblée)**.

## Provenance
Généré par le RELECTEUR G2 **`claude-opus-4-8[1m]`**, effort max, 2026-09-21, worktree `F:\Monark-wt-narabi1b2`
(cible e87d7b5), scratch `F:\tmp\g2-narabi-merge\`. R-20 : aucun commit/workflow/écriture dépôt persistante ;
mutants+injection restaurés byte-exact (sha vérifié), jamais `git checkout`/`stash`. R-21 : chaque affirmation porte
sa preuve re-exécutée (scripts `union-check.mjs`, `merge-mutants.mjs`, `measure-worstcase.mjs`, replays CLI/gate).
Le verdict G7 et l'acceptation du validateur-humain restent chez l'orchestrateur.
